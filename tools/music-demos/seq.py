"""seq.py — sequencing helpers shared by the three tracks."""
from synth import *


class Song:
    def __init__(self, bpm, bars, beats_per_bar=4, tonic=293.66, tail=4.0):
        self.bpm = bpm; self.beat = 60.0 / bpm; self.bpb = beats_per_bar
        self.bars = bars; self.tonic = tonic
        self.mix = Mix(bars * beats_per_bar * self.beat, tail)

    def t(self, bar, beat=0.0):
        """bar is 1-based; beat 0-based within the bar."""
        return ((bar - 1) * self.bpb + beat) * self.beat

    def f(self, cents, octave=0):
        return hz(self.tonic, cents + 1200 * octave)

    def melody_pluck(self, bar, notes, octave=1, vel=1.0, pan=0.0, gain=1.0, send=0.25, dbl=0.35, ring=1.1, **kw):
        b = 0.0
        for c, d in notes:
            if c is not None:
                dur = min(d * self.beat + ring * 0.6, ring + d * self.beat)
                v = vel * rng.uniform(0.9, 1.05)
                s = pluck(self.f(c, octave), dur=dur, vel=v, **kw)
                self.mix.add(human(self.t(bar, b)), s, pan=pan, gain=gain, send=send)
                if dbl:
                    s2 = pluck(self.f(c, octave - 1), dur=dur, vel=v * dbl, **kw)
                    self.mix.add(human(self.t(bar, b)), s2, pan=-pan * 0.5, gain=gain, send=send)
            b += d
        return b

    def melody_ney(self, bar, notes, octave=1, vel=1.0, pan=0.0, gain=1.0, send=0.35, vib=14.0):
        t0, s = ney(self.tonic, notes, self.t(bar), self.bpm, vel=vel, octave=octave, vib=vib)
        self.mix.add(t0, s, pan=pan, gain=gain, send=send)

    def arp(self, bar, chord, pattern, octave=0, vel=0.6, pan=-0.25, gain=1.0, send=0.25, step=0.5, accents=(0,), ring=0.9, **kw):
        """pattern: indices into chord (+12 = octave up) or None; one per step."""
        for i, p in enumerate(pattern):
            if p is None:
                continue
            idx, up = p % 10, p // 10
            c = chord[idx % len(chord)] + 1200 * up
            v = vel * (1.15 if i in accents else 1.0) * rng.uniform(0.88, 1.05)
            s = pluck(self.f(c, octave), dur=ring, vel=v, **kw)
            self.mix.add(human(self.t(bar, i * step)), s, pan=pan, gain=gain, send=send)

    def bassline(self, bar, hits, octave=-2, vel=1.0, gain=1.0, pan=0.0):
        """hits: list of (beat, cents, beats_len)."""
        for b, c, d in hits:
            s = bass(self.f(c, octave), dur=d * self.beat, vel=vel * rng.uniform(0.92, 1.05))
            self.mix.add(human(self.t(bar, b), 3), s, pan=pan, gain=gain, send=0.05)

    def drums(self, bar, pattern, step=0.5, gain=1.0, send=0.12, pan=0.1):
        """pattern string, one char per step: D dum, T tek, k ka (soft dark tek), d soft dum, . rest,
        C clap, R riq, B boom, F frame-drum dum (low, tof)."""
        for i, ch in enumerate(pattern):
            if ch == '.':
                continue
            tt = human(self.t(bar, i * step), 4)
            if ch == 'D':
                self.mix.add(tt, dum(1.0), pan=pan, gain=gain, send=send)
            elif ch == 'd':
                self.mix.add(tt, dum(0.55), pan=pan, gain=gain, send=send)
            elif ch == 'F':
                self.mix.add(tt, dum(0.9, f0=72, tau=0.3), pan=-pan, gain=gain, send=send)
            elif ch == 'T':
                self.mix.add(tt, tek(1.0), pan=pan + 0.15, gain=gain, send=send)
            elif ch == 't':
                self.mix.add(tt, tek(0.6), pan=pan + 0.15, gain=gain, send=send)
            elif ch == 'k':
                self.mix.add(tt, tek(0.45, dark=1.0), pan=pan + 0.1, gain=gain, send=send)
            elif ch == 'C':
                self.mix.add(tt, clap(1.0), pan=-0.1, gain=gain, send=send * 2)
            elif ch == 'R':
                self.mix.add(tt, riq(1.0), pan=0.45, gain=gain, send=send)
            elif ch == 'r':
                self.mix.add(tt, riq(0.55), pan=0.45, gain=gain, send=send)
            elif ch == 'B':
                self.mix.add(tt, boom(1.0), pan=0.0, gain=gain, send=send * 2)

    def pad(self, bar, chord, bars=1, octave=0, vel=1.0, gain=1.0, pan=0.0, **kw):
        s = pad([self.f(c, octave) for c in chord], bars * self.bpb * self.beat, vel=vel, **kw)
        self.mix.add(self.t(bar), s, pan=pan, gain=gain, send=0.4)

    def riser(self, bar, bars=2, vel=1.0, gain=1.0):
        s = riser(bars * self.bpb * self.beat, vel=vel)
        self.mix.add(self.t(bar), s, pan=0.0, gain=gain, send=0.3)
