/* ─────────────────────────────────────────────────────────────────────────────
 * sound.js: a small procedural WebAudio kit for the service (no audio files; modeled on src/game/audio.js).
 *   const sfx = createSound({ storage });   sfx.play('trumpet', { long: true })
 * Sounds: ui · ok · miss · chime · coin · fanfare · solemn · tekiah · teruah · cymbal · lyre · creak · thud ·
 *         water · fire · pour · step · crowd.  Nothing plays before the first user gesture.
 * The trumpets are silver trumpets (חצוצרות), not a shofar; the music is not liturgical.
 * ──────────────────────────────────────────────────────────────────────────── */
const MUTE_KEY = 'bh_avodah_mute';
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const semis = (f, n) => f * Math.pow(2, n / 12);

export function createSound({ storage } = {}) {
  let ctx = null, master = null, noise = null, muted = false;
  try { const v = storage && (storage.get(MUTE_KEY) ?? storage.get('bh_mute')); muted = v === '1'; } catch (e) { muted = false; }
  function ensure() {
    if (ctx) return ctx;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.7;
    master.connect(comp); comp.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const unlock = () => { const c = ensure(); if (c && c.state === 'suspended') c.resume().catch(() => {}); };
  if (typeof addEventListener === 'function') { addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true); }
  const ready = () => !!ctx && ctx.state === 'running' && !muted;

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(t, { type = 'sine', f = 440, f2 = null, peak = 0.2, a = 0.005, dec = 0.3, lp = null, vib = 0, hold = 0 }) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + dec + hold);
    let node = o;
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.2; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + a + hold + dec + 0.1); }
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; node.connect(fl); node = fl; }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
    if (hold) g.gain.setValueAtTime(peak, t + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + dec);
    node.connect(g); g.connect(master);
    o.start(t); o.stop(t + a + hold + dec + 0.1);
  }
  function hiss(t, { type = 'bandpass', f = 1500, q = 1, peak = 0.3, a = 0.004, dec = 0.1, f2 = null }) {
    const s = ctx.createBufferSource(); s.buffer = noise;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + dec);
    const g = ctx.createGain(); env(g, t, a, peak, dec);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5, a + dec + 0.05);
  }
  // a silver trumpet: a bright sawtooth pair with a slow attack
  const horn = (t, f, hold) => { tone(t, { type: 'sawtooth', f, peak: 0.09, a: 0.06, hold, dec: 0.25, lp: 2200, vib: 2.5 }); tone(t, { type: 'square', f: f * 2, peak: 0.025, a: 0.06, hold, dec: 0.2, lp: 1800 }); };
  const KIT = {
    ui(t) { tone(t, { f: 740, peak: 0.05, dec: 0.05 }); },
    tick(t, o) { tone(t, { f: 520 + (o.n || 0) * 60, peak: 0.07, dec: 0.04, type: 'triangle' }); },   // ── payis24 ── (the lots' ring: a tick for each kohen, rising as it speeds)
    ok(t) { tone(t, { f: 660, peak: 0.09, dec: 0.12 }); tone(t + 0.08, { f: 990, peak: 0.09, dec: 0.3 }); },
    miss(t) { tone(t, { f: 300, f2: 220, peak: 0.07, dec: 0.25, type: 'triangle' }); },
    chime(t, o) { const f = semis(880, PENTA[Math.min(PENTA.length - 1, Math.max(0, (o.n || 1) - 1))]); tone(t, { f, peak: 0.13, dec: 0.9 }); tone(t, { f: f * 2.76, peak: 0.04, dec: 0.5 }); },
    coin(t) { tone(t, { f: 1250, peak: 0.1, dec: 0.08 }); tone(t + 0.07, { f: 1870, peak: 0.1, dec: 0.25 }); },
    fanfare(t) { for (const [f, dt, h] of [[293.66, 0, 0.1], [440, 0.2, 0.1], [587.33, 0.4, 0.5]]) horn(t + dt, f, h); },
    grave(t) { tone(t, { f: 98, peak: 0.1, a: 0.18, hold: 0.5, dec: 1.6, lp: 600 }); },   // ── blooda25 ── (DAM25 §2.4: one soft deep tone)
    solemn(t) { for (const [f, p] of [[146.83, 0.06], [220, 0.045], [293.66, 0.03]]) tone(t, { f, peak: p, a: 1.2, hold: 1.5, dec: 2.5 }); },
    tekiah(t) { horn(t, 440, 0.9); },
    teruah(t) { for (let k = 0; k < 3; k++) horn(t + k * 0.22, 440, 0.06); },
    cymbal(t) { hiss(t, { type: 'highpass', f: 5200, peak: 0.25, dec: 0.9 }); tone(t, { f: 3200, peak: 0.03, dec: 0.6, type: 'triangle' }); },
    lyre(t, o) { const f = semis(293.66, o.n || 0); tone(t, { type: 'triangle', f, peak: 0.12, dec: 1.2 }); tone(t, { f: f * 2, peak: 0.03, dec: 0.6 }); },
    creak(t) { tone(t, { type: 'sawtooth', f: 90, f2: 140, peak: 0.07, a: 0.2, hold: 0.8, dec: 0.6, lp: 700, vib: 12 }); hiss(t, { f: 400, q: 4, peak: 0.05, a: 0.3, dec: 1.2 }); },
    thud(t) { tone(t, { f: 70, f2: 38, peak: 0.6, dec: 0.5 }); hiss(t, { type: 'lowpass', f: 600, peak: 0.4, dec: 0.4 }); for (const k of [0.05, 0.12, 0.2]) hiss(t + k, { type: 'bandpass', f: 1800, q: 2, peak: 0.12, dec: 0.08 }); },
    water(t) { for (let k = 0; k < 5; k++) hiss(t + k * 0.07, { f: 900 + Math.random() * 1400, q: 6, peak: 0.08, dec: 0.12 }); },
    pour(t) { hiss(t, { f: 1200, q: 2, peak: 0.08, a: 0.1, dec: 0.8, f2: 700 }); },
    fire(t) { hiss(t, { type: 'lowpass', f: 900, peak: 0.25, a: 0.05, dec: 1.2, f2: 300 }); for (let k = 0; k < 6; k++) hiss(t + Math.random() * 0.8, { type: 'highpass', f: 2500, peak: 0.06, dec: 0.03 }); },
    step(t) { hiss(t, { type: 'lowpass', f: 380, peak: 0.12, dec: 0.08 }); },
    crowd(t) { hiss(t, { f: 650, q: 0.8, peak: 0.06, a: 0.6, dec: 2.2 }); },
  };
  return {
    play(name, o = {}) { if (name === 'grave') { try { const B = globalThis.__BLOOD25 || (globalThis.__BLOOD25 = {}); B.tones = (B.tones | 0) + 1; } catch (e) { /* tests */ } } if (!ready()) return;   // ── blooda25 ── (tests)
      const f = KIT[name]; if (!f) return; try { f(ctx.currentTime + 0.005, o); } catch (e) { /* best-effort */ } },
    unlock,
    get muted() { return muted; },
    set muted(v) { muted = !!v; try { if (storage) storage.set(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* not kept */ } if (master) master.gain.setTargetAtTime(muted ? 0 : 0.7, ctx.currentTime, 0.05); },
    get running() { return !!ctx && ctx.state === 'running'; },
  };
}
