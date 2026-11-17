/* ── build 129 ── h129/sound129.js — stage 07's own voices beside the game's kit (src/game/audio.js: its AudioContext through
 * sfx.context, its last stage ctx.__bhOut when it is there), synthesized as h128/sound128.js; nothing plays while the kit is muted.
 *   scrape(k)      a bench stone dragged on the floor by the crew's bars (0…1, continuous)
 *   knock(deep)    a stone set down, a wedge driven · thud() a heavy stone settling into place (the arch, the slab) · bump() a dull knock
 *   creak(k)       timber under load: the arch's legs, a loaded wedge (0…1 its pitch, continuous) · groan() a loaded wedge's single creak
 *   dust()         grit running from a joint · crack() stone cracking
 *   quill()        a reed pen scratching (the scribes) · cloak() cloth set down
 *   harp()         one note of the nevel that rings under the arch (המחשה)
 *   fire(k)        the fire crackling (0…1, continuous) · lock(i) a gate's bolt shot home (i: its order, a falling step)
 *   rope(inBeat)   the Golah's rope at a pull: round in the beat, rough against it
 *   frame() follows the mute · stop() the continuous voices off
 */
export function createVoices(sfx) {
  let ctx = null, out = null, noise = null, sc = null, cr = null, fr = null;
  const muted = () => { try { return !!(sfx && sfx.muted); } catch (e) { return true; } };
  function init() {
    if (ctx) return ctx.state === 'running';
    try { ctx = sfx && sfx.context; } catch (e) { ctx = null; }
    if (!ctx) return false;
    out = ctx.createGain(); out.gain.value = muted() ? 0 : 0.9; out.connect(ctx.__bhOut || ctx.destination);
    const n = ctx.sampleRate * 2; noise = ctx.createBuffer(1, n, ctx.sampleRate); const d = noise.getChannelData(0);
    let s = 7919; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }   // (a fixed noise)
    return ctx.state === 'running';
  }
  const loop = (f, q, type = 'bandpass') => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0.0001; src.connect(fl); fl.connect(g); g.connect(out); src.start(); return { src, fl, g }; };
  const set = (p, v, tc = 0.12) => { try { p.setTargetAtTime(v, ctx.currentTime, tc); } catch (e) { /* */ } };
  const ok = () => init() && out && !muted();
  const k01 = (k) => Math.max(0, Math.min(1, +k || 0));
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
    scrape(k) { if (!init() || !out) return; if (!sc) sc = loop(420, 1.4); set(sc.g.gain, 0.0001 + 0.06 * k01(k)); set(sc.fl.frequency, 300 + 400 * k01(k), 0.2); },
    knock(deep = 1) { if (!ok()) return; const t = ctx.currentTime; tone(t, 170 / deep, 70 / deep, 0.3, 0.13); burst(t, 900, 1.5, 0.08, 0.05); },
    thud() { if (!ok()) return; const t = ctx.currentTime; tone(t, 92, 46, 0.7, 0.18); burst(t, 260, 0.9, 0.4, 0.06, 'lowpass'); },
    // ── build 129 R3b ── (the Golah's rope, one per pull: in the beat — a pull at the swing's middle — a round, warm tone; against it
    //  a rough, scratchy rasp of fibre on the wheel)
    rope(inBeat) { if (!ok()) return; const t = ctx.currentTime; if (inBeat) { tone(t, 196, 174, 0.32, 0.07); tone(t, 392, 349, 0.22, 0.025); burst(t, 380, 2.5, 0.12, 0.02); } else { tone(t, 120, 96, 0.22, 0.05, 'sawtooth'); burst(t, 1700, 0.8, 0.18, 0.07); burst(t + 0.05, 2600, 1.1, 0.1, 0.05); } },
    bump() { if (!ok()) return; const t = ctx.currentTime; tone(t, 210, 150, 0.14, 0.08); burst(t, 600, 1.2, 0.06, 0.05); },
    creak(k) { if (!init() || !out) return; if (!cr) { cr = loop(240, 9); const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 90; const og = ctx.createGain(); og.gain.value = 0.0001; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(og); og.connect(out); o.start(); cr.o = o; cr.og = og; } const v = k01(Math.abs(k)); set(cr.g.gain, 0.0001 + 0.04 * v, 0.06); set(cr.og.gain, 0.0001 + 0.018 * v, 0.06); set(cr.fl.frequency, 160 + 520 * v, 0.1); set(cr.o.frequency, 60 + 120 * v, 0.1); },
    groan() { if (!ok()) return; const t = ctx.currentTime; tone(t, 190, 130, 0.6, 0.05, 'sawtooth'); burst(t, 520, 7, 0.5, 0.03); },
    dust() { if (!ok()) return; const t = ctx.currentTime; burst(t, 3200, 1.1, 0.35, 0.025, 'highpass'); },
    crack() { if (!ok()) return; const t = ctx.currentTime; burst(t, 2800, 2, 0.09, 0.12); burst(t + 0.05, 900, 1.5, 0.2, 0.06); tone(t, 320, 120, 0.2, 0.05); },
    quill() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 3; i++) burst(t + i * 0.09, 5200, 4, 0.05, 0.015); },
    cloak() { if (!ok()) return; burst(ctx.currentTime, 700, 0.7, 0.4, 0.03, 'lowpass'); },
    harp(f = 294) { if (!ok()) return; const t = ctx.currentTime; for (const [m, a, d] of [[1, 0.07, 3.6], [2, 0.03, 2.4], [3, 0.014, 1.6], [4.02, 0.006, 1]]) tone(t, f * m, f * m * 0.998, d, a, 'triangle'); },
    fire(k) { if (!init() || !out) return; if (!fr) fr = loop(900, 0.5, 'lowpass'); set(fr.g.gain, 0.0001 + 0.05 * k01(k), 0.3); if (ok() && k > 0.05 && (ctx.currentTime * 7) % 1 < 0.12) burst(ctx.currentTime, 2400, 3, 0.03, 0.02 * k01(k)); },
    lock(i = 0) { if (!ok()) return; const t = ctx.currentTime, f = 220 * Math.pow(2, -(i % 7) / 12); tone(t, f, f * 0.7, 0.35, 0.12); burst(t, 1800, 3, 0.06, 0.07); tone(t + 0.12, f * 1.5, f * 1.4, 0.25, 0.05); },
    frame() { if (!ctx || !out) return; set(out.gain, muted() ? 0 : 0.9, 0.05); },
    stop() { if (!ctx) return; for (const v of [sc, fr]) if (v) set(v.g.gain, 0.0001); if (cr) { set(cr.g.gain, 0.0001); set(cr.og.gain, 0.0001); } },
  };
}
