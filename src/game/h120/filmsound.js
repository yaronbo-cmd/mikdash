/* ── build 120 ── h120/filmsound.js — the film's own track, through the game's AudioContext (sfx.context, into ctx.__bhOut when it is
 * there), one gain that follows sfx.muted every frame: planks knocking; fire; a low slow frame drum; a long reed-flute line
 * (illustration); a crowd's murmur that swells in shots 4–6. No fanfare. Nothing random at play time (a fixed noise, fixed patterns).
 */
export function createFilmSound(sfx) {
  let ctx = null, out = null, noise = null, fire = null, mur = null, t0 = 0, nextDrum = 0, nextNote = 0, k = 0, on = false, di = 0, ni = 0;
  const muted = () => { try { return !!(sfx && sfx.muted); } catch (e) { return true; } };
  try { ctx = sfx && sfx.context; } catch (e) { ctx = null; }
  if (ctx) {
    out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.__bhOut || ctx.destination);
    const n = ctx.sampleRate * 2; noise = ctx.createBuffer(1, n, ctx.sampleRate); const d = noise.getChannelData(0);
    let s = 4242; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
  }
  const loop = (f, q, type, g0) => { const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = g0; src.connect(fl); fl.connect(g); g.connect(out); src.start(); return { src, fl, g }; };
  // the flute's line: a slow phrase in a mode with a raised third (illustration), long notes with a breathy onset and vibrato
  const LINE = [[293.7, 2.6], [311.1, 1.4], [370.0, 2.2], [392.0, 3.0], [370.0, 1.2], [311.1, 1.6], [293.7, 3.4], [0, 1.2], [392.0, 1.8], [440.0, 2.6], [392.0, 1.4], [370.0, 2.0], [311.1, 1.6], [293.7, 4.0], [0, 1.6]];
  function note(t, f, d) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain();
    o.type = 'triangle'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f * 1.002; lp.type = 'lowpass'; lp.frequency.value = f * 3.2; lp.Q.value = 0.7;
    vib.frequency.value = 4.6; vg.gain.value = f * 0.006; vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const g2 = ctx.createGain(); g2.gain.value = 0.25; o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(out);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.35); g.gain.setValueAtTime(0.05, t + d - 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    // the breath at the onset
    const b = ctx.createBufferSource(); b.buffer = noise; const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = f * 2; bf.Q.value = 2; const bg = ctx.createGain(); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.02, t + 0.08); bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); b.connect(bf); bf.connect(bg); bg.connect(out);
    for (const x of [o, o2, vib]) { x.start(t); x.stop(t + d + 0.05); } b.start(t, (f % 1.7)); b.stop(t + 0.6);
  }
  function drum(t, accent) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(accent ? 92 : 78, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(accent ? 0.32 : 0.2, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.75);
    const b = ctx.createBufferSource(); b.buffer = noise; const bf = ctx.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.value = 900; const bg = ctx.createGain(); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.08, t + 0.005); bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); b.connect(bf); bf.connect(bg); bg.connect(out); b.start(t, (t * 0.37) % 1.5); b.stop(t + 0.15);
  }
  return {
    start() { if (!ctx) return; on = true; t0 = ctx.currentTime; nextDrum = t0 + 3.6; nextNote = t0 + 5.0; fire = loop(700, 0.6, 'bandpass', 0.0001); mur = loop(380, 0.8, 'lowpass', 0.0001); },
    /** a plank laid: a dry wooden knock */
    knock() { if (!ctx || muted()) return; const t = ctx.currentTime + 0.01, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2); const b = ctx.createBufferSource(); b.buffer = noise; const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 1800; bf.Q.value = 1.2; const bg = ctx.createGain(); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.18, t + 0.003); bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); b.connect(bf); bf.connect(bg); bg.connect(out); b.start(t, 0.3); b.stop(t + 0.08); },
    murmur(v) { k = v; },
    frame() {
      if (!ctx || !on) return; const now = ctx.currentTime;
      try { out.gain.setTargetAtTime(muted() ? 0 : 0.9, now, 0.05); } catch (e) { /* */ }
      try { fire.g.gain.setTargetAtTime(0.012 + 0.01 * Math.abs(Math.sin(now * 7.3) * Math.sin(now * 2.1)), now, 0.08); mur.g.gain.setTargetAtTime(0.0001 + 0.05 * k, now, 1.2); } catch (e) { /* */ }
      // the drum: slow, a little uneven (a hand, not a machine): long-short-short
      while (nextDrum < now + 0.3) { drum(nextDrum, di % 3 === 0); nextDrum += [1.15, 0.55, 0.62][di % 3] + 0.03 * Math.sin(di * 1.7); di++; }
      while (nextNote < now + 0.3) { const [f, d] = LINE[ni % LINE.length]; ni++; if (f) note(nextNote, f, d); nextNote += d + 0.15; }
    },
    stop() { if (!ctx) return; on = false; try { out.gain.setTargetAtTime(0, ctx.currentTime, 0.4); const o = out; setTimeout(() => { try { fire.src.stop(); mur.src.stop(); o.disconnect(); } catch (e) { /* */ } }, 1800); } catch (e) { /* */ } },
  };
}
