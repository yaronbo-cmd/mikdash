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
 */
import { PENTA } from '../audio.js';

export const STEP_BASE = 196;   // (the lowest ring's note, Hz: G3)
/** the i-th ring's note: the kit's pentatonic steps over three octaves (1 the lowest ring) */
export function stepHz(i) { const k = Math.max(0, Math.min(14, (i | 0) - 1)); return STEP_BASE * Math.pow(2, (PENTA[k % 5] + 12 * Math.floor(k / 5)) / 12); }

export function createVoices(sfx) {
  let ctx = null, out = null, noise = null, hm = null, sl = null, gr = null, sq = null, sw = null, wd = null;
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
  const loop = (f, q, type = 'bandpass') => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0.0001; src.connect(fl); fl.connect(g); g.connect(out); src.start(); return { src, fl, g }; };
  const set = (p, v, tc = 0.12) => { try { p.setTargetAtTime(v, ctx.currentTime, tc); } catch (e) { /* */ } };
  const ok = () => init() && out && !muted();
  function tone(t, f0, f1, dur, peak, type = 'sine') {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(t, f, q, dur, peak, type = 'bandpass') {
    const s = ctx.createBufferSource(); s.buffer = noise; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(out); s.start(t, (f * 7) % 1.5); s.stop(t + dur + 0.05);
  }
  return {
    hum(k, t = 0.5) {
      if (!init() || !out) return;
      if (!hm) { hm = loop(180, 6); const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 70; const og = ctx.createGain(); og.gain.value = 0.0001; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; o.connect(lp); lp.connect(og); og.connect(out); o.start(); hm.o = o; hm.og = og; }
      const v = Math.max(0, Math.min(1, k)) * Math.min(1, 0.25 + t);
      set(hm.g.gain, 0.0001 + 0.03 * v); set(hm.og.gain, 0.0001 + 0.02 * v); set(hm.fl.frequency, 120 + 380 * t, 0.2); set(hm.o.frequency, 55 + 110 * t, 0.2);
    },
    pawl() { if (!ok()) return; const t = ctx.currentTime; burst(t, 3400, 4, 0.04, 0.05); tone(t, 900, 500, 0.05, 0.02, 'square'); },
    knock(deep = 1) { if (!ok()) return; const t = ctx.currentTime; tone(t, 160 / deep, 70 / deep, 0.32, 0.14); burst(t, 900, 1.5, 0.08, 0.06); },
    clack() { if (!ok()) return; const t = ctx.currentTime; burst(t, 1500, 2, 0.05, 0.05); },
    creak() { if (!ok()) return; const t = ctx.currentTime; tone(t, 210, 160, 0.5, 0.03, 'sawtooth'); burst(t, 600, 8, 0.45, 0.02); },
    mallet(dull) { if (!ok()) return; const t = ctx.currentTime; if (dull) { tone(t, 240, 180, 0.12, 0.08); burst(t, 500, 1.2, 0.07, 0.06); } else { tone(t, 1180, 1160, 0.5, 0.06); tone(t, 2950, 2900, 0.25, 0.02); burst(t, 2400, 3, 0.03, 0.05); } },
    slide(k) { if (!init() || !out) return; if (!sl) sl = loop(700, 1.2); set(sl.g.gain, 0.0001 + 0.04 * Math.max(0, Math.min(1, k))); },
    grind(k) { if (!init() || !out) return; if (!gr) gr = loop(260, 3); set(gr.g.gain, 0.0001 + 0.08 * Math.max(0, Math.min(1, k)), 0.05); },
    breath() { if (!ok()) return; const t = ctx.currentTime; burst(t, 520, 0.8, 0.7, 0.035, 'lowpass'); },
    tick() { if (!ok()) return; burst(ctx.currentTime, 4200, 6, 0.025, 0.03); },
    squeal(k) { if (!init() || !out) return; if (!sq) { sq = loop(2300, 18); } set(sq.g.gain, 0.0001 + 0.06 * Math.max(0, Math.min(1, k)), 0.04); },
    gong(f, dull) { if (!ok()) return; const t = ctx.currentTime, d = dull ? 0.35 : 2.6; tone(t, f, f * 0.998, d, dull ? 0.06 : 0.09); tone(t, f * 2.76, f * 2.75, d * 0.5, dull ? 0.01 : 0.03); if (dull) burst(t, f * 2, 1.4, 0.12, 0.05); },
    step(i, dull) { this.gong(stepHz(i), dull); },
    string(k = 1) { if (!ok()) return; const t = ctx.currentTime, f = STEP_BASE * (1 + 0.5 * Math.min(1, k)); for (const [m, a] of [[1, 0.05], [2, 0.025], [3, 0.012]]) tone(t, f * m, f * m * 0.997, 1.4, a, 'triangle'); },
    sea(k, w = k) { if (!init() || !out) return; if (!sw) { sw = loop(320, 0.6, 'lowpass'); wd = loop(900, 2.5); } set(sw.g.gain, 0.0001 + 0.05 * (0.25 + Math.max(0, Math.min(1, k))), 0.4); set(wd.g.gain, 0.0001 + 0.03 * Math.max(0, Math.min(1, w)), 0.4); set(wd.fl.frequency, 600 + 900 * Math.max(0, Math.min(1, w)), 0.6); },
    splash(k = 1) { if (!ok()) return; const t = ctx.currentTime; burst(t, 700, 0.7, 1.1 * k + 0.3, 0.12 * k, 'lowpass'); burst(t + 0.05, 2600, 1.2, 0.5, 0.05 * k); },
    bell(f = 330) { if (!ok()) return; const t = ctx.currentTime; tone(t, f, f * 0.999, 3.2, 0.09); tone(t, f * 2.4, f * 2.39, 1.6, 0.035); tone(t, f * 3.9, f * 3.88, 0.9, 0.02); },
    frame() { if (!ctx || !out) return; set(out.gain, muted() ? 0 : 0.9, 0.05); },
    stop() { if (!ctx) return; if (hm) { set(hm.g.gain, 0.0001); set(hm.og.gain, 0.0001); } for (const v of [sl, gr, sq, sw, wd]) if (v) set(v.g.gain, 0.0001); },
  };
}
