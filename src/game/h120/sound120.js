/* ── build 120 ── h120/sound120.js — the mikveh's water voices, beside the game's own synthesized kit (src/game/audio.js: one
 * AudioContext, read through sfx.context; the kit's last stage ctx.__bhOut when it is there). Nothing here plays while the kit is muted:
 * every voice runs through one gain that follows sfx.muted each frame.
 *   trickle(k)  — running water in the channel, its loudness and brightness following how much runs (0…1)
 *   pour(k, fill) — the fall into the basin: a hollow pouring note that drops in pitch as the basin fills (fill 0…1)
 *   drops()     — a few drops when the water stops; ting(n) — a stretch passed (higher each time); hiss() — the lime spoiled
 *   rain(k)     — the short shower; frame(dt) — follows the mute; stop()
 */
export function createWaterVoices(sfx) {
  let ctx = null, out = null, noise = null, tr = null, po = null, rn = null, want = { tr: 0, po: 0, fill: 0, rn: 0 };
  const muted = () => { try { return !!(sfx && sfx.muted); } catch (e) { return true; } };
  function init() {
    if (ctx) return ctx.state === 'running';
    try { ctx = sfx && sfx.context; } catch (e) { ctx = null; }
    if (!ctx) return false;
    out = ctx.createGain(); out.gain.value = muted() ? 0 : 0.9; out.connect(ctx.__bhOut || ctx.destination);
    const n = ctx.sampleRate * 2; noise = ctx.createBuffer(1, n, ctx.sampleRate); const d = noise.getChannelData(0);
    let s = 22222; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }   // (a fixed noise: no randomness at play time)
    return ctx.state === 'running';
  }
  const loop = (f, q, type = 'bandpass') => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0.0001; src.connect(fl); fl.connect(g); g.connect(out); src.start(); return { src, fl, g }; };
  function ensure() {
    if (!init() || !out) return false;
    if (!tr) {
      // the trickle: two bands of noise, a slow wobble on the upper one (the babble)
      tr = loop(1100, 0.9); tr.b = loop(2600, 1.4);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 3.1; lg.gain.value = 380; lfo.connect(lg); lg.connect(tr.b.fl.frequency); lfo.start(); tr.lfo = lfo;
      const lfo2 = ctx.createOscillator(), lg2 = ctx.createGain(); lfo2.frequency.value = 0.9; lg2.gain.value = 160; lfo2.connect(lg2); lg2.connect(tr.fl.frequency); lfo2.start(); tr.lfo2 = lfo2;
    }
    if (!po) {
      // the pour: noise through a resonant band (the hollow of the basin) plus a soft low hum at the same pitch
      po = loop(420, 7); const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 210; const og = ctx.createGain(); og.gain.value = 0.0001; o.connect(og); og.connect(out); o.start(); po.o = o; po.og = og;
      const sp = loop(3200, 0.7, 'highpass'); po.sp = sp;   // (the splash's hiss on top)
    }
    if (!rn) rn = loop(5200, 0.5, 'highpass');
    return true;
  }
  const set = (p, v, tc = 0.25) => { try { p.setTargetAtTime(v, ctx.currentTime, tc); } catch (e) { /* */ } };
  function apply() {
    if (!ctx || !tr) return;
    const k = want.tr, f = want.fill;
    set(tr.g.gain, 0.0001 + 0.05 * Math.sqrt(k)); set(tr.b.g.gain, 0.0001 + 0.022 * k); set(tr.fl.frequency, 800 + 600 * k, 0.4);
    // the note (brief §7): about 520 Hz into the empty cut, dropping to about 190 as it fills
    const pf = 520 - 330 * Math.min(1, Math.max(0, f));
    set(po.fl.frequency, pf, 0.6); set(po.o.frequency, pf / 2, 0.6);
    set(po.g.gain, 0.0001 + 0.07 * want.po); set(po.og.gain, 0.0001 + 0.012 * want.po); set(po.sp.g.gain, 0.0001 + 0.018 * want.po);
    set(rn.g.gain, 0.0001 + 0.05 * want.rn, 0.5);
  }
  function blip(t, f0, f1, dur, peak) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  return {
    trickle(k) { want.tr = Math.max(0, Math.min(1, k)); if (ensure()) apply(); },
    pour(k, fill) { want.po = Math.max(0, Math.min(1, k)); want.fill = fill; if (ensure()) apply(); },
    rain(k) { want.rn = Math.max(0, Math.min(1, k)); if (ensure()) apply(); },
    /** a few drops as the water stops: falling blips at fixed offsets */
    drops() {
      if (!ensure() || muted()) return; const t = ctx.currentTime + 0.02;
      [[0, 1400, 600], [0.23, 1150, 520], [0.61, 1650, 700], [1.12, 1250, 560], [1.8, 1500, 640]].forEach(([d, a, b]) => blip(t + d, a, b, 0.09, 0.07));
    },
    /** a stretch passed without a stop: a ting a semitone higher each time */
    ting(n) { if (!ensure() || muted()) return; const t = ctx.currentTime + 0.01, f = 1318.5 * Math.pow(2, Math.min(14, n) / 12); blip(t, f, f * 0.995, 0.35, 0.05); blip(t, f * 2.01, f * 2, 0.18, 0.015); },
    /** the lime spoiled: a hiss that dies away */
    hiss() {
      if (!ensure() || muted()) return; const t = ctx.currentTime;
      const s = loop(4200, 0.8, 'highpass'); s.g.gain.setValueAtTime(0.0001, t); s.g.gain.exponentialRampToValueAtTime(0.09, t + 0.05); s.g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); s.src.stop(t + 2.8);
    },
    frame() { if (!ctx || !out) return; set(out.gain, muted() ? 0 : 0.9, 0.05); },
    stop() { want = { tr: 0, po: 0, fill: want.fill, rn: 0 }; if (ctx && tr) apply(); },
    get state() { return { ctx: !!ctx, run: !!ctx && ctx.state === 'running', muted: muted(), ...want }; },
  };
}
