/* ── shift30 ── prof30.js — the frame-time log (WAVE30 SHIFT30 (4): "measure, then fix"). Off by default; globalThis.__S30PROF.start()
 * records every rendered frame of main.js's loop: the frame's own interval (rAF to rAF) and its parts — render · guard (CAM28) ·
 * light (life.update: the glows' particles; their nearDim runs in the shader) · world (stages/sky/sanct) · game (game.frame: twin +
 * the shift's tick) · cam (the shift's camera) · chips (the shift's chips and labels) · shift (the rest of the shift's tick) — and the
 * camera's position step per frame (amot). report() → { n, over40, over40pct, p50, p95, max, top: [[part, mean ms], …], stepMax, steps15 }.
 * Nothing is allocated per frame but one small record while it runs. ── /shift30 ── */
const P = { on: false, cur: null, list: [], t0: 0, last: 0, cam: null, max: 4000 };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export const PROF = {
  get on() { return P.on; },
  start(max = 4000) { P.on = true; P.list = []; P.cur = null; P.last = 0; P.cam = null; P.max = max; P.rend = []; P.comp = 0; return true; },
  stop() { P.on = false; return P.list.length; },
  /** the loop's frame begins (now = rAF's time) */
  frame(t) { if (!P.on) return; if (P.cur && P.list.length < P.max) P.list.push(P.cur); P.cur = { dt: P.last ? t - P.last : 0, render: 0, guard: 0, light: 0, world: 0, game: 0, cam: 0, chips: 0, shift: 0, step: 0 }; P.last = t; },
  add(k, ms) { if (P.on && P.cur) P.cur[k] = (P.cur[k] || 0) + ms; },
  /** what moved the camera this frame (the guard's mode, the shift camera's mode): for the big steps' account */
  tag(t) { if (P.on && P.cur) P.cur.tag = P.cur.tag ? P.cur.tag + ' ' + t : t; },
  t: now,
  /** the camera's position this frame (after the guard): its step from the last one */
  camAt(x, y, z) { if (!P.on || !P.cur) return; if (P.cam) P.cur.step = Math.hypot(x - P.cam[0], y - P.cam[1], z - P.cam[2]); else P.cam = [0, 0, 0]; P.cam[0] = x; P.cam[1] = y; P.cam[2] = z; },
  frames: () => P.list.slice(),
  /** a test's own render (__T.render), timed apart: the software renderer's frames are not the loop's */
  rendered(ms, compiles = 0) { if (P.on) { (P.rend || (P.rend = [])).push(ms); P.comp = (P.comp || 0) + Math.max(0, compiles); if (P.cur) P.cur.compiles = (P.cur.compiles || 0) + Math.max(0, compiles); } },
  programs: () => { try { const r = globalThis.__T && globalThis.__T.renderer; return r && r.info.programs ? r.info.programs.length : -1; } catch (e) { return -1; } },
  report() {
    const L = P.list.filter((f) => f.dt > 0).map((f) => ({ ...f, game: Math.max(0, f.game - f.cam - f.chips - f.shift) })), n = L.length; if (!n) return { n: 0 };   // (game: twin.js's own share — the shift's parts apart)
    const dts = L.map((f) => f.dt).sort((a, b) => a - b), q = (u) => +dts[Math.min(n - 1, Math.floor(u * n))].toFixed(1);
    const keys = ['render', 'guard', 'light', 'world', 'game', 'cam', 'chips', 'shift'], mean = {};
    for (const k of keys) mean[k] = +(L.reduce((s, f) => s + (f[k] || 0), 0) / n).toFixed(2);
    const over = L.filter((f) => f.dt > 40).length, steps = L.map((f) => f.step || 0);
    // (the CPU of a frame: every part but the render — in the tests' simulated loop the only measure the software renderer leaves honest)
    const cpu = L.map((f) => f.guard + f.light + f.world + f.game + f.cam + f.chips + f.shift).sort((a, b) => a - b), cq = (u) => +cpu[Math.min(n - 1, Math.floor(u * n))].toFixed(2);
    const R = (P.rend || []).slice().sort((a, b) => a - b);
    return { n, over40: over, over40pct: +(over / n * 100).toFixed(1), p50: q(0.5), p95: q(0.95), max: q(1), mean,
      top: keys.map((k) => [k, mean[k]]).sort((a, b) => b[1] - a[1]).slice(0, 3), stepMax: +Math.max(...steps).toFixed(2), steps15: steps.filter((s) => s > 1.5).length,
      cpu: { p50: cq(0.5), p95: cq(0.95), p99: cq(0.99), max: cq(1), over16: cpu.filter((v) => v > 16.7).length, over40: cpu.filter((v) => v > 40).length },
      bigSteps: (() => { const m = {}; for (const f of L) if ((f.step || 0) / Math.max(1, Math.min(f.dt, 50) / 16.7) > 1.5) { const k = f.tag || '-'; m[k] = (m[k] || 0) + 1; } return m; })(),
      compiles: L.reduce((s, f) => s + (f.compiles || 0), 0) + (P.comp || 0),
      renders: R.length ? { n: R.length, p50: +R[Math.floor(R.length / 2)].toFixed(0), max: +R[R.length - 1].toFixed(0) } : null,
      spikes: (() => { const O = L.filter((f) => f.dt > 40), m = {}; if (!O.length) return null; for (const k of keys) m[k] = +(O.reduce((s, f) => s + (f[k] || 0), 0) / O.length).toFixed(1); return m; })() };
  },
};
try { globalThis.__S30PROF = PROF; } catch (e) { /* node */ }
// (on a real machine: ?prof30=1 in the address starts the log at load and prints its report to the console every 60 s)
try { if (typeof location !== 'undefined' && /[?&#]prof30=1\b/.test((location.search || '') + (location.hash || ''))) { PROF.start(4000); setInterval(() => { try { console.log('[prof30]', JSON.stringify(PROF.report())); PROF.start(4000); } catch (e) { /* */ } }, 60000); } } catch (e) { /* */ }
// ── /shift30 ──
