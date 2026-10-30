"""synth.py — a small offline synthesizer for the game's music demos (original, procedural; no samples, no services).
Instruments: pluck (kanun/lyre/oud by modal synthesis), bass, ney (breathy flute, legato phrases), darbuka/tof/riq/clap,
pad, riser; a generated stereo reverb; mastering to a LUFS target with a soft limiter. Pitches are in cents from a tonic,
so maqam quarter tones are exact."""
import numpy as np
from scipy import signal
import pyloudnorm as pyln

SR = 44100
rng = np.random.default_rng(7)


def hz(tonic_hz, cents):
    return tonic_hz * 2 ** (cents / 1200.0)


class Mix:
    def __init__(self, seconds, tail=4.0):
        self.n = int(seconds * SR)
        self.tail = int(tail * SR)
        tot = self.n + self.tail
        self.dry = np.zeros((2, tot))
        self.wet = np.zeros((2, tot))

    def add(self, t, sig, pan=0.0, gain=1.0, send=0.2):
        i = int(round(t * SR))
        if i < 0:
            sig = sig[-i:]; i = 0
        j = min(i + len(sig), self.dry.shape[1])
        s = sig[: j - i] * gain
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:j] += s * l; self.dry[1, i:j] += s * r
        if send:
            self.wet[0, i:j] += s * l * send; self.wet[1, i:j] += s * r * send

    def render(self, rt60=1.4, wet_gain=1.0, lufs=-18.0, hp=45.0, presence=2.0):
        ir = reverb_ir(rt60)
        wet = np.stack([signal.fftconvolve(self.wet[c], ir[c])[: self.wet.shape[1]] for c in (0, 1)])
        out = self.dry + wet * wet_gain
        # loop: fold the tail onto the start
        out[:, : self.tail] += out[:, self.n: self.n + self.tail]
        out = out[:, : self.n]
        sos = signal.butter(2, hp, 'highpass', fs=SR, output='sos')
        out = signal.sosfiltfilt(sos, out, axis=1)
        sos = signal.butter(2, 11000, 'lowpass', fs=SR, output='sos')
        out = signal.sosfiltfilt(sos, out, axis=1)
        out = biquad(out, 'lowshelf', 140, -3.0)
        out = biquad(out, 'peak', 2600, presence, q=0.8)
        out = glue(out)
        meter = pyln.Meter(SR)
        loud = meter.integrated_loudness(out.T)
        out = out * 10 ** ((lufs - loud) / 20)
        out = soft_limit(out, ceil=0.89)
        return out


def biquad(x, kind, f0, gain_db, q=0.707):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; cw = np.cos(w); sw = np.sin(w)
    if kind == 'peak':
        al = sw / (2 * q)
        b = [1 + al * A, -2 * cw, 1 - al * A]; a = [1 + al / A, -2 * cw, 1 - al / A]
    else:  # lowshelf
        al = sw / 2 * np.sqrt(2)
        sA = np.sqrt(A)
        b = [A * ((A + 1) - (A - 1) * cw + 2 * sA * al), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - 2 * sA * al)]
        a = [(A + 1) + (A - 1) * cw + 2 * sA * al, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - 2 * sA * al]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=1)


def reverb_ir(rt60, seconds=None):
    seconds = seconds or min(3.5, rt60 * 1.2)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-6.91 * t / rt60)
    ir = np.zeros((2, n))
    for c in (0, 1):
        noise = rng.standard_normal(n)
        # darker as it decays: blend a lowpassed copy in over time
        lp = signal.sosfilt(signal.butter(2, 3500, 'lowpass', fs=SR, output='sos'), noise)
        mixk = np.clip(t / (rt60 * 0.5), 0, 1)
        ir[c] = (noise * (1 - mixk) * 0.5 + lp * mixk) * env
        # early reflections
        for d, a in ((0.011, 0.5), (0.019, 0.35), (0.027, 0.3), (0.041, 0.22), (0.053, 0.16)):
            k = int((d + 0.002 * c) * SR)
            ir[c, k] += a
        ir[c, : int(0.008 * SR)] *= np.linspace(0, 1, int(0.008 * SR))
        ir[c] /= np.sqrt(np.sum(ir[c] ** 2))
    return ir * 0.5


def glue(x, thr_db=-14.0, ratio=2.0, att=0.01, rel=0.15):
    mono = np.sqrt(np.mean(x ** 2, axis=0) + 1e-12)
    # envelope follower (block-wise for speed)
    blk = 256
    nb = len(mono) // blk + 1
    pad = np.pad(mono, (0, nb * blk - len(mono)))
    rms = np.sqrt(np.mean(pad.reshape(nb, blk) ** 2, axis=1) + 1e-12)
    env = np.zeros(nb); e = 0
    a_att = np.exp(-blk / (att * SR)); a_rel = np.exp(-blk / (rel * SR))
    for i, v in enumerate(rms):
        e = a_att * e + (1 - a_att) * v if v > e else a_rel * e + (1 - a_rel) * v
        env[i] = e
    db = 20 * np.log10(env + 1e-9)
    peak = np.max(db)
    thr = peak + thr_db
    gr = np.where(db > thr, (thr - db) * (1 - 1 / ratio), 0)
    g = 10 ** (gr / 20)
    g = np.repeat(g, blk)[: x.shape[1]]
    return x * g


def soft_limit(x, ceil=0.89):
    k = ceil
    return np.where(np.abs(x) < 0.6 * k, x, np.sign(x) * (0.6 * k + 0.4 * k * np.tanh((np.abs(x) - 0.6 * k) / (0.4 * k))))


def env_ad(n, att, dec_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-4), 0, 1)
    return a * np.exp(-t / dec_tau)


# ───────────────────────── instruments ─────────────────────────

def pluck(f, dur=1.6, vel=1.0, pos=0.16, decay=1.2, bright=1.0, inh=1.5e-4, maxf=8000, body=True):
    n = int((dur + 0.05) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    k = 1
    while k * f < maxf and k <= 24:
        fk = k * f * np.sqrt(1 + inh * k * k)
        amp = abs(np.sin(np.pi * k * pos)) / (k ** (1.25 - 0.2 * (bright - 1)))
        tau = decay / (1 + 0.55 * (k - 1) / bright)
        out += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 0.3)) * np.exp(-t / tau)
        k += 1
    att = int(0.002 * SR)
    out[:att] *= np.linspace(0, 1, att)
    # pick noise
    nn = int(0.012 * SR)
    pn = signal.sosfilt(signal.butter(2, [1500, 6000], 'bandpass', fs=SR, output='sos'), rng.standard_normal(nn))
    out[:nn] += pn * np.exp(-np.arange(nn) / (0.003 * SR)) * 0.25
    if body:
        out = signal.sosfilt(signal.butter(1, 260, 'highpass', fs=SR, output='sos'), out) * 0.6 + out * 0.4
    rel = int(0.04 * SR)
    out[-rel:] *= np.linspace(1, 0, rel)
    return out / 2.2 * vel


def bass(f, dur=0.5, vel=1.0):
    n = int((dur + 0.08) * SR)
    t = np.arange(n) / SR
    amps = [0.55, 1.0, 0.75, 0.45, 0.3, 0.18, 0.1]
    out = np.zeros(n)
    for k, a in enumerate(amps, 1):
        tau = 0.9 / (1 + 0.6 * (k - 1))
        out += a * np.sin(2 * np.pi * k * f * t) * np.exp(-t / tau)
    att = int(0.004 * SR)
    out[:att] *= np.linspace(0, 1, att)
    gate = np.ones(n); r = int(0.06 * SR); end = int(dur * SR)
    gate[end:] = 0; gate[max(0, end - r):end] = np.linspace(1, 0, min(r, end))
    return out * gate / 3.2 * vel


def ney(tonic, notes, t0, bpm, vel=1.0, octave=0, vib=14.0):
    """notes: list of (cents|None, beats). Legato phrase; None = rest. Returns (start_time, signal)."""
    beat = 60.0 / bpm
    total = sum(b for _, b in notes) * beat + 0.4
    n = int(total * SR)
    f = np.zeros(n); amp = np.zeros(n)
    t = 0.0; prev = None
    glide = int(0.045 * SR)
    for c, b in notes:
        i = int(t * SR); j = int((t + b * beat) * SR)
        if c is None:
            prev = None; t += b * beat; continue
        fr = hz(tonic, c + 1200 * octave)
        seg = np.full(j - i, fr)
        if prev is not None and glide < len(seg):
            seg[:glide] = np.geomspace(prev, fr, glide)
        tt = np.arange(j - i) / SR
        vdepth = np.clip((tt - 0.22) / 0.3, 0, 1) * vib
        seg = seg * 2 ** (vdepth * np.sin(2 * np.pi * 5.3 * tt + rng.uniform(0, 6)) / 1200)
        f[i:j] = seg
        a = np.ones(j - i)
        at = int(0.06 * SR) if prev is None else int(0.02 * SR)
        a[:at] = np.linspace(0.15 if prev is not None else 0, 1, at)
        rl = min(int(0.08 * SR), len(a) // 3)
        nxt_rest = True
        a[-rl:] *= np.linspace(1, 0.55, rl)
        # small swell on long notes
        if b * beat > 0.6:
            a *= 1 + 0.12 * np.clip(tt / (b * beat), 0, 1)
        amp[i:j] = a
        prev = fr; t += b * beat
    # release tail
    last = np.nonzero(amp)[0]
    if len(last):
        k = last[-1]
        r = min(int(0.25 * SR), n - k - 1)
        amp[k:k + r] = np.linspace(amp[k], 0, r)
        f[k:k + r] = f[k]
    amp = signal.sosfiltfilt(signal.butter(1, 30, 'lowpass', fs=SR, output='sos'), amp)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.16 * np.sin(2 * ph) + 0.10 * np.sin(3 * ph) + 0.035 * np.sin(4 * ph)
    breath = signal.sosfilt(signal.butter(2, [900, 4500], 'bandpass', fs=SR, output='sos'), rng.standard_normal(n))
    on = np.diff(np.concatenate([[0], (amp > 0.05).astype(float)])) > 0
    chiff = np.zeros(n)
    for i in np.nonzero(on)[0]:
        m = min(int(0.05 * SR), n - i)
        chiff[i:i + m] += np.exp(-np.arange(m) / (0.012 * SR))
    out = (tone * 0.85 + breath * 0.09) * amp + breath * chiff * 0.12
    return t0, out * 0.32 * vel


def dum(vel=1.0, f0=96.0, tau=0.2):
    n = int(0.6 * SR); t = np.arange(n) / SR
    fs = f0 * (1 + 0.45 * np.exp(-t / 0.025))
    ph = 2 * np.pi * np.cumsum(fs) / SR
    out = np.sin(ph) * np.exp(-t / tau) + 0.55 * np.sin(2.3 * ph) * np.exp(-t / (tau * 0.4)) + 0.35 * np.sin(3.4 * ph) * np.exp(-t / (tau * 0.25))
    cl = signal.sosfilt(signal.butter(2, 1800, 'lowpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.004) * 0.6
    return (out + cl) * 0.5 * vel


def tek(vel=1.0, dark=0.0):
    n = int(0.15 * SR); t = np.arange(n) / SR
    lo, hi = (1800, 5500) if dark < 0.5 else (1000, 3200)
    nz = signal.sosfilt(signal.butter(2, [lo, hi], 'bandpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.018)
    ping = (np.sin(2 * np.pi * 870 * t) * 0.5 + np.sin(2 * np.pi * 1560 * t) * 0.3) * np.exp(-t / 0.02)
    return (nz * 0.8 + ping * (0.5 - 0.3 * dark)) * 0.32 * vel


def clap(vel=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    nz = signal.sosfilt(signal.butter(2, [900, 2800], 'bandpass', fs=SR, output='sos'), rng.standard_normal(n))
    e = np.zeros(n)
    for d in (0.0, 0.009, 0.019):
        i = int(d * SR); e[i:] += np.exp(-(t[i:] - d) / 0.006)
    e += np.exp(-t / 0.07) * 0.5 * (t > 0.02)
    return nz * e * 0.22 * vel


def riq(vel=1.0):
    n = int(0.2 * SR); t = np.arange(n) / SR
    nz = signal.sosfilt(signal.butter(2, [4500, 9500], 'bandpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.05)
    met = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * a for f, a in ((4120, .3), (5310, .25), (6730, .2), (7940, .15))) * np.exp(-t / 0.07)
    return (nz * 0.6 + met * 0.4) * 0.12 * vel


def pad(freqs, dur, vel=1.0, att=0.9, rel=1.2, cutoff=1800):
    n = int((dur + rel) * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for det in (-6, 0, 6):
            fd = f * 2 ** (det / 1200)
            k = 1
            while k * fd < 5000 and k < 24:
                a = (1 / k) / (1 + (k * fd / cutoff) ** 2)
                out += a * np.sin(2 * np.pi * k * fd * t + rng.uniform(0, 6))
                k += 1
    e = np.clip(t / att, 0, 1)
    end = int(dur * SR)
    e[end:] *= np.exp(-(t[end:] - dur) / (rel / 4))
    return out * e / (len(freqs) * 9) * vel


def riser(dur, vel=1.0):
    n = int(dur * SR)
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 2048
    for s in range(0, n, blk // 2):
        frac = s / n
        fc = 400 * (12 ** frac)
        sos = signal.butter(2, [fc * 0.7, min(fc * 1.4, 16000)], 'bandpass', fs=SR, output='sos')
        seg = signal.sosfilt(sos, nz[s:s + blk])
        w = np.hanning(len(seg))
        out[s:s + len(seg)] += seg * w
    return out * np.linspace(0, 1, n) ** 2 * 0.12 * vel


def boom(vel=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR
    fs = 70 * (1 + 0.8 * np.exp(-t / 0.05))
    ph = 2 * np.pi * np.cumsum(fs) / SR
    out = np.sin(ph) * np.exp(-t / 0.45) + 0.5 * np.sin(2 * ph) * np.exp(-t / 0.25) + 0.3 * np.sin(3 * ph) * np.exp(-t / 0.15)
    nz = signal.sosfilt(signal.butter(2, 900, 'lowpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-t / 0.08) * 0.4
    return (out + nz) * 0.6 * vel


def human(t, ms=6):
    return t + rng.uniform(-ms, ms) / 1000.0
