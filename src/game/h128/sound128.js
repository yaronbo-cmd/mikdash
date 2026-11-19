/* ── build 128 ── h128/sound128.js — stage 06's own voices beside the game's kit (src/game/audio.js: its AudioContext through
 * sfx.context, its last stage ctx.__bhOut when it is there), all synthesized as h120/sound120.js; nothing plays while the kit is muted.
 *   hum(k, t)      the rope's hum: louder and higher with the tension t (0…1.2), k its loudness (0 silent)
 *   pawl()         the capstan's pawl clicking over a tooth · knock(deep) a wedge or a bolt dropping home · clack() a dull bounce
 *   creak()        timber under load · mallet(dull) a mason's blow (clear or dull) · slide(k) a stone sliding on rollers (0…1)
 *   grind(k)       a jammed corner grinding (0…1) · tick() a tooth's tick · squeal(k) a tooth forced (0…1, continuous)
 *   gong(f, dull)  a bronze or stone note at f Hz · step(i, dull) the i-th ring's note (1…15: the pentatonic run over three octaves)
 *   breath()       the crew breathing out under the load
 *   (part 3, the sea) string(k) the ropes ringing like a string after a clean swell · sea(k, wind) the sea and the wind, continuous
 *   (k 0 calm … 1 storm) · splash(k) a great splash · bell(f) wet bronze ringing like a bell
 *   frame() follows the mute · stop() the continuous voices off
 *   (build 128 tuning, "ease the understanding of the state": every state of the stage has a heard sign as well as a seen one)
 *   runner(n)      the sledge's runner ticking over the ramp's timbers as its tail nears a notch (n 0 … 1: the tick higher)
 *   slap()         a slack rope slapping the bronze · crackle() a worn rope's fibres popping under load · scrape(h) a hand sliding on
 *                  wet bronze (h 'L' | 'R': its side) · rattle(pan) teeth that do not mesh, a short rattle · groan(pan) a dry bolt,
 *                  long and low · tickAt(f, pan) a gear tooth's tick at its own pitch and side · thud() the template dropping home,
 *                  wood on stone · hollow() a template rocking on a stone that is not its own · swing(up, k) the derrick's block
 *                  creaking, its pitch rising while the door swings toward the quay (up) and falling while it swings back ·
 *                  hinge(k, i, v) a leaf's hinge, continuous (i 0 the free south hinge: a faint hush; 1 the stiff north: a low groan;
 *                  v its speed, deg/s) · strain(k, pan) the closing stone dragging askew on its rollers (k 0 … 1)
 *   pan: −1 the left of the screen … 1 the right (where the browser has a stereo panner; without one the voice is centred)
 *   Every voice logs its call (globalThis.__H128_SND: { t, v, …its pitch, rate or side }) so a probe that cannot hear can read it.
 */
import { PENTA } from '../audio.js';

export const STEP_BASE = 196;   // (the lowest ring's note, Hz: G3)
/** the i-th ring's note: the kit's pentatonic steps over three octaves (1 the lowest ring) */
export function stepHz(i) { const k = Math.max(0, Math.min(14, (i | 0) - 1)); return STEP_BASE * Math.pow(2, (PENTA[k % 5] + 12 * Math.floor(k / 5)) / 12); }

const SND = (() => { try { return (globalThis.__H128_SND = globalThis.__H128_SND || []); } catch (e) { return []; } })();
const lastLog = {};
/** a voice's call in the log (a continuous voice: when it changes or once in 0.4 s) */
function lg(v, o = {}, every = 0) {
  try {
    const t = performance.now() / 1000;
    if (every) { const id = v + (o.leaf || ''), L = lastLog[id], key = (o.k != null ? o.k : o.on) > 0.02 ? 1 : 0; if (L && t - L.t < every && L.k === key) return; lastLog[id] = { t, k: key }; }
    SND.push({ t: +t.toFixed(2), v, ...o }); if (SND.length > 4000) SND.splice(0, SND.length - 4000);
  } catch (e) { /* */ }
}
const r2 = (x) => Math.round(x * 100) / 100;

export function createVoices(sfx) {
  let ctx = null, out = null, noise = null, hm = null, sl = null, gr = null, sq = null, sw = null, wd = null, hg = [null, null], st = null;
  const pans = new Map();
  /** the out through a stereo panner at p (−1 left … 1 right), cached per side */
  const to = (p) => { if (!p || !ctx || !ctx.createStereoPanner) return out; const k = Math.round(p * 10) / 10; if (!pans.has(k)) { const n = ctx.createStereoPanner(); n.pan.value = k; n.connect(out); pans.set(k, n); } return pans.get(k); };
  const muted = () => { try { return !!(sfx && sfx.muted); } catch (e) { return true; } };
  function init() {
    if (ctx) return ctx.state === 'running';
    try { ctx = sfx && sfx.context; } catch (e) { ctx = null; }
    if (!ctx) return false;
    out = ctx.createGain(); out.gain.value = muted() ? 0 : 0.9; out.connect(ctx.__bhOut || ctx.destination);
    const n = ctx.sampleRate * 2; noise = ctx.createBuffer(1, n, ctx.sampleRate); const d = noise.getChannelData(0);
    let s = 31337; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }   // (a fixed noise)
    return ctx.state === 'running';
  }
  const loop = (f, q, type = 'bandpass', dst = null) => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0.0001; src.connect(fl); fl.connect(g); g.connect(dst || out); src.start(); return { src, fl, g }; };
  const set = (p, v, tc = 0.12) => { try { p.setTargetAtTime(v, ctx.currentTime, tc); } catch (e) { /* */ } };
  const ok = () => init() && out && !muted();
  function tone(t, f0, f1, dur, peak, type = 'sine', dst = null, att = 0.008) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dst || out); o.start(t); o.stop(t + dur + 0.05); return o;
  }
  function burst(t, f, q, dur, peak, type = 'bandpass', dst = null) {
    const s = ctx.createBufferSource(); s.buffer = noise; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dst || out); s.start(t, (f * 7) % 1.5); s.stop(t + dur + 0.05);
  }
  /** a low groan: a sawtooth through a low pass, its pitch wavering (a dry bolt, a stiff hinge) */
  function groanAt(t, f, dur, peak, dst) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.86, t + dur);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 7; const lg2 = ctx.createGain(); lg2.gain.value = f * 0.05; lfo.connect(lg2); lg2.connect(o.frequency);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f * 5; lp.Q.value = 4;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.15); g.gain.setValueAtTime(peak, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(dst || out); o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  }
  return {
    hum(k, t = 0.5) {
      lg('hum', { k: r2(k), f: Math.round(55 + 110 * t), band: Math.round(120 + 380 * t) }, 0.4);
      if (!init() || !out) return;
      if (!hm) { hm = loop(180, 6); const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 70; const og = ctx.createGain(); og.gain.value = 0.0001; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; o.connect(lp); lp.connect(og); og.connect(out); o.start(); hm.o = o; hm.og = og; }
      const v = Math.max(0, Math.min(1, k)) * Math.min(1, 0.25 + t);
      set(hm.g.gain, 0.0001 + 0.03 * v); set(hm.og.gain, 0.0001 + 0.02 * v); set(hm.fl.frequency, 120 + 380 * t, 0.2); set(hm.o.frequency, 55 + 110 * t, 0.2);
    },
    pawl() { lg('pawl'); if (!ok()) return; const t = ctx.currentTime; burst(t, 3400, 4, 0.04, 0.05); tone(t, 900, 500, 0.05, 0.02, 'square'); },
    knock(deep = 1) { lg('knock', { f: Math.round(160 / deep) }); if (!ok()) return; const t = ctx.currentTime; tone(t, 160 / deep, 70 / deep, 0.32, 0.14); burst(t, 900, 1.5, 0.08, 0.06); },
    clack() { lg('clack'); if (!ok()) return; const t = ctx.currentTime; burst(t, 1500, 2, 0.05, 0.05); },
    creak() { lg('creak'); if (!ok()) return; const t = ctx.currentTime; tone(t, 210, 160, 0.5, 0.03, 'sawtooth'); burst(t, 600, 8, 0.45, 0.02); },
    mallet(dull) { lg('mallet', { dull: dull ? 1 : 0 }); if (!ok()) return; const t = ctx.currentTime; if (dull) { tone(t, 240, 180, 0.12, 0.08); burst(t, 500, 1.2, 0.07, 0.06); } else { tone(t, 1180, 1160, 0.5, 0.06); tone(t, 2950, 2900, 0.25, 0.02); burst(t, 2400, 3, 0.03, 0.05); } },
    slide(k) { if (!init() || !out) return; if (!sl) sl = loop(700, 1.2); set(sl.g.gain, 0.0001 + 0.04 * Math.max(0, Math.min(1, k))); },
    grind(k) { lg('grind', { k: r2(k) }, 0.4); if (!init() || !out) return; if (!gr) gr = loop(260, 3); set(gr.g.gain, 0.0001 + 0.08 * Math.max(0, Math.min(1, k)), 0.05); },
    breath() { lg('breath'); if (!ok()) return; const t = ctx.currentTime; burst(t, 520, 0.8, 0.7, 0.035, 'lowpass'); },
    tick() { lg('tick', { f: 4200 }); if (!ok()) return; burst(ctx.currentTime, 4200, 6, 0.025, 0.03); },
    squeal(k) { lg('squeal', { k: r2(k) }, 0.4); if (!init() || !out) return; if (!sq) { sq = loop(2300, 18); } set(sq.g.gain, 0.0001 + 0.06 * Math.max(0, Math.min(1, k)), 0.04); },
    gong(f, dull) { if (!ok()) return; const t = ctx.currentTime, d = dull ? 0.35 : 2.6; tone(t, f, f * 0.998, d, dull ? 0.06 : 0.09); tone(t, f * 2.76, f * 2.75, d * 0.5, dull ? 0.01 : 0.03); if (dull) burst(t, f * 2, 1.4, 0.12, 0.05); },
    step(i, dull) { this.gong(stepHz(i), dull); },
    string(k = 1) { lg('string', { k: r2(k) }); if (!ok()) return; const t = ctx.currentTime, f = STEP_BASE * (1 + 0.5 * Math.min(1, k)); for (const [m, a] of [[1, 0.05], [2, 0.025], [3, 0.012]]) tone(t, f * m, f * m * 0.997, 1.4, a, 'triangle'); },
    sea(k, w = k) { if (!init() || !out) return; if (!sw) { sw = loop(320, 0.6, 'lowpass'); wd = loop(900, 2.5); } set(sw.g.gain, 0.0001 + 0.05 * (0.25 + Math.max(0, Math.min(1, k))), 0.4); set(wd.g.gain, 0.0001 + 0.03 * Math.max(0, Math.min(1, w)), 0.4); set(wd.fl.frequency, 600 + 900 * Math.max(0, Math.min(1, w)), 0.6); },
    splash(k = 1) { if (!ok()) return; const t = ctx.currentTime; burst(t, 700, 0.7, 1.1 * k + 0.3, 0.12 * k, 'lowpass'); burst(t + 0.05, 2600, 1.2, 0.5, 0.05 * k); },
    bell(f = 330) { lg('bell', { f }); if (!ok()) return; const t = ctx.currentTime; tone(t, f, f * 0.999, 3.2, 0.09); tone(t, f * 2.4, f * 2.39, 1.6, 0.035); tone(t, f * 3.9, f * 3.88, 0.9, 0.02); },
    // ── (build 128 tuning: the heard signs) ──
    runner(n = 0) { const f = 420 + 1180 * Math.max(0, Math.min(1, n)); lg('runner', { n: r2(n), f: Math.round(f) }); if (!ok()) return; const t = ctx.currentTime; tone(t, f, f * 0.92, 0.06, 0.035 + 0.03 * n, 'triangle'); burst(t, f * 2.2, 5, 0.03, 0.025); },
    slap() { lg('slap'); if (!ok()) return; const t = ctx.currentTime; burst(t, 260, 0.9, 0.16, 0.07, 'lowpass'); tone(t, 120, 70, 0.12, 0.03); },
    crackle() { lg('crackle'); if (!ok()) return; const t = ctx.currentTime; for (const [dt, f] of [[0, 3600], [0.05, 2900], [0.11, 4200], [0.16, 3300]]) burst(t + dt, f, 7, 0.018, 0.04); },
    scrape(h = 'L') { const p = h === 'L' ? -0.5 : 0.5; lg('scrape', { hand: h, pan: p }); if (!ok()) return; const t = ctx.currentTime, d = to(p); const s = ctx.createBufferSource(); s.buffer = noise; const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(900, t); fl.frequency.exponentialRampToValueAtTime(2600, t + 1.1); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.1); g.gain.setValueAtTime(0.06, t + 0.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); s.connect(fl); fl.connect(g); g.connect(d); s.start(t); s.stop(t + 1.25); },
    rattle(p = 0) { lg('rattle', { pan: p, clicks: 7, s: 0.24 }); if (!ok()) return; const t = ctx.currentTime, d = to(p); for (let i = 0; i < 7; i++) { burst(t + i * 0.034, 2600 + (i % 3) * 500, 3, 0.02, 0.06, 'bandpass', d); tone(t + i * 0.034, 760, 700, 0.02, 0.015, 'square', d); } },
    groan(p = 0) { lg('groan', { pan: p, f: 62, s: 1.2 }); if (!ok()) return; groanAt(ctx.currentTime, 62, 1.2, 0.09, to(p)); },
    tickAt(f = 2000, p = 0) { lg('tick', { f: Math.round(f), pan: p }); if (!ok()) return; const t = ctx.currentTime, d = to(p); burst(t, f, 6, 0.03, 0.05, 'bandpass', d); tone(t, f / 2, f / 2.1, 0.05, 0.03, 'triangle', d); },
    thud() { lg('thud', { f: 150 }); if (!ok()) return; const t = ctx.currentTime; tone(t, 150, 70, 0.28, 0.16); burst(t, 380, 1.2, 0.09, 0.09, 'lowpass'); burst(t + 0.005, 1700, 2, 0.03, 0.04); },
    hollow() { lg('hollow', { f: 430 }); if (!ok()) return; const t = ctx.currentTime; for (const [dt, a] of [[0, 0.07], [0.16, 0.05], [0.29, 0.035]]) { burst(t + dt, 430, 14, 0.12, a); tone(t + dt, 430, 410, 0.1, a * 0.4, 'triangle'); } },
    swing(up, k = 1) { const f0 = up ? 190 : 260, f1 = up ? 190 + 220 * k : 150; lg('swing', { dir: up ? 'quay' : 'back', f0: Math.round(f0), f1: Math.round(f1) }); if (!ok()) return; const t = ctx.currentTime; tone(t, f0, f1, 0.22, 0.03 + 0.02 * k, 'sawtooth'); burst(t, (f0 + f1) * 1.5, 9, 0.2, 0.015); },
    hinge(k, i, v = 0) {
      const a = Math.max(0, Math.min(1, k)), p = i ? -0.6 : 0.6;
      lg('hinge', { leaf: i ? 'N' : 'S', on: a > 0.02 ? 1 : 0, f: i ? Math.round(52 + 3 * Math.min(8, v)) : Math.round(1400 + 120 * Math.min(8, v)), pan: p }, 0.4);
      if (!init() || !out) return;
      if (!hg[i]) {
        const d = to(p);
        if (i) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55; const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5; const lg2 = ctx.createGain(); lg2.gain.value = 4; lfo.connect(lg2); lg2.connect(o.frequency); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 5; const g = ctx.createGain(); g.gain.value = 0.0001; o.connect(lp); lp.connect(g); g.connect(d); o.start(); lfo.start(); hg[i] = { o, g, n: loop(180, 3, 'bandpass', d) }; }
        else hg[i] = { g: null, n: loop(1400, 2, 'bandpass', d) };
      }
      const H = hg[i];
      if (i) { set(H.g.gain, 0.0001 + 0.1 * a, 0.08); set(H.o.frequency, 52 + 3 * Math.min(8, v), 0.2); set(H.n.g.gain, 0.0001 + 0.03 * a, 0.08); }
      else { set(H.n.g.gain, 0.0001 + 0.008 * a, 0.1); set(H.n.fl.frequency, 1400 + 120 * Math.min(8, v), 0.2); }
    },
    strain(k, p = 0) { const a = Math.max(0, Math.min(1, k)); lg('strain', { k: r2(a), f: Math.round(300 + 700 * a), pan: Math.round(p * 10) / 10 }, 0.4); if (!init() || !out) return; if (!st || st.p !== Math.round(p * 10) / 10) { if (st) set(st.g.gain, 0.0001, 0.03); st = loop(300, 4, 'bandpass', to(p)); st.p = Math.round(p * 10) / 10; } set(st.g.gain, 0.0001 + 0.05 * a, 0.06); set(st.fl.frequency, 300 + 700 * a, 0.1); },
    frame() { if (!ctx || !out) return; set(out.gain, muted() ? 0 : 0.9, 0.05); },
    stop() { if (!ctx) return; if (hm) { set(hm.g.gain, 0.0001); set(hm.og.gain, 0.0001); } for (const v of [sl, gr, sq, sw, wd, st]) if (v) set(v.g.gain, 0.0001); for (const H of hg) if (H) { if (H.g) set(H.g.gain, 0.0001); set(H.n.g.gain, 0.0001); } },
  };
}
