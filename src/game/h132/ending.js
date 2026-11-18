/* ── build 132 ── h132/ending.js — the stage's ending (spec docs/specs/shlav-09-he.md, "סיום השלב"), the lead's:
 *   "חצי שנייה שקט. הקו נדלק, רץ סביב ופועם. המצלמה עולה ומקיפה. גל אור בהיר מעל הקו וגל כהה מתחתיו נעצרים משני צדדיו. זיקוקים
 *    אדומים וזהובים על כל המסך. העולם חוזר לעבוד. הקו נשאר לתמיד, עם הפגמים. אין דם בסיום."
 * The timeline (seconds from its start; the director's film — the camera's round, pack.js endRound — runs over it):
 *   0 … 0.5   quiet;
 *   0.5 … 1.2 the line lights: a red glow along the four faces at the line's height (the line itself stays as he drew it, flaws and all);
 *   1.2 … 4.2 a bright head runs round the 120 amot once, then the glow pulses;
 *   3.0 … 5.0 the waves: a bright light rises from the line to the top, a dark one goes down from it to the yesod — each stops at its
 *             edge, on its own side of the line, and holds (light and shade only: no blood);
 *   5.0 … 9.0 red and gold fireworks over the whole screen (a canvas over the page);
 *   9.0 …11.0 all of it fades; the world goes back to work. Nothing is left but the line as it was.
 * Pure timing in ENDING (tests read it); endingFx(X) draws it (three.js + one canvas), stop() takes everything away at once.
 */
import { BOOK } from '../world/grid.js';

const S9 = BOOK.s09;
export const ENDING = Object.freeze({
  QUIET: 0.5, LIGHT: [0.5, 1.2], RUN: [1.2, 4.2], WAVES: [3.0, 5.0], FIRE: [5.0, 9.0], FADE: [9.0, 11.0],
  COLORS: Object.freeze({ line: 0xff3b2e, head: 0xfff1c8, light: 0xfff4d8, dark: 0x101820, fire: Object.freeze(['#ff3b2e', '#e0201a', '#ffd166', '#f4b400', '#fff1c8']) }),
});
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ramp = (t, [a, b]) => clamp01((t - a) / (b - a));
/** the ending's levels at time t (seconds): glow 0…1, the running head's place round the block (0…1 of the perimeter, or null), the
 *  light wave's and the dark wave's reach (0…1 of the way to their edge), the fireworks on, the fade (1 = gone). Pure. */
export function endingAt(t) {
  const fade = ramp(t, ENDING.FADE);
  const lit = ramp(t, ENDING.LIGHT);
  const run = t >= ENDING.RUN[0] && t < ENDING.RUN[1] ? (t - ENDING.RUN[0]) / (ENDING.RUN[1] - ENDING.RUN[0]) : null;
  const pulse = t >= ENDING.RUN[1] ? 0.7 + 0.3 * Math.cos((t - ENDING.RUN[1]) * Math.PI * 2 * 1.2) : 1;
  const w = ramp(t, ENDING.WAVES), ease = w * w * (3 - 2 * w);
  return { glow: lit * pulse * (1 - fade), head: run, light: ease, dark: ease, waveAlpha: (t >= ENDING.WAVES[0] ? 1 : 0) * (1 - fade), fire: t >= ENDING.FIRE[0] && t < ENDING.FIRE[1], fade, done: t >= ENDING.FADE[1] };
}
/** the four faces of the block in the walk's order round it (from the south-east corner: east, north, west, south), as
 *  { a: [x, z], b: [x, z], n: [nx, nz] } — the perimeter's 120 amot */
export function faces() {
  const [x0, z0, x1, z1] = S9.block;
  return [
    { k: 'E', a: [x1, z1], b: [x1, z0], n: [1, 0] },
    { k: 'N', a: [x1, z0], b: [x0, z0], n: [0, -1] },
    { k: 'W', a: [x0, z0], b: [x0, z1], n: [-1, 0] },
    { k: 'S', a: [x0, z1], b: [x1, z1], n: [0, 1] },
  ];
}
/** a point round the perimeter (u 0…1 from the south-east corner, the walk's way) a little out from its face */
export function roundAt(u, off = 0.12) {
  const F = faces(), L = F.map((f) => Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1])), P = L.reduce((a, b) => a + b, 0);
  let d = (((u % 1) + 1) % 1) * P;
  for (let i = 0; i < 4; i++) { if (d <= L[i] || i === 3) { const f = F[i], k = Math.min(1, d / L[i]); return { x: f.a[0] + (f.b[0] - f.a[0]) * k + f.n[0] * off, z: f.a[1] + (f.b[1] - f.a[1]) * k + f.n[1] * off, k: f.k }; } d -= L[i]; }
  return null;
}

/** the ending drawn: → { run(): Promise (resolves at its end), stop() } */
export function endingFx(X) {
  const T = X.THREE, root = new T.Group(); root.name = 'h132-ending';
  const parent = X.scene || (X.props && X.props.root); if (parent) parent.add(root);
  const C = ENDING.COLORS, Y = S9.lineY, top = S9.top, base = S9.base, mats = [], geos = [];
  const mat = (o) => { const m = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, ...o }); mats.push(m); return m; };
  const glowM = mat({ color: C.line, opacity: 0, blending: T.AdditiveBlending }), lightM = mat({ color: C.light, opacity: 0, blending: T.AdditiveBlending }), darkM = mat({ color: C.dark, opacity: 0 });
  const bands = { glow: [], light: [], dark: [] };
  for (const f of faces()) {
    const len = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), mx = (f.a[0] + f.b[0]) / 2, mz = (f.a[1] + f.b[1]) / 2, rotY = Math.atan2(f.n[0], f.n[1]);
    const plane = (m, off, h) => { const g = new T.PlaneGeometry(len + 0.3, 1); geos.push(g); const p = new T.Mesh(g, m); p.position.set(mx + f.n[0] * off, Y, mz + f.n[1] * off); p.rotation.y = rotY; p.scale.y = h; p.renderOrder = 998; root.add(p); return p; };
    bands.glow.push(plane(glowM, 0.1, 0.45));
    bands.light.push(plane(lightM, 0.06, 0.001));
    bands.dark.push(plane(darkM, 0.05, 0.001));
  }
  const hg = new T.SphereGeometry(0.55, 12, 8); geos.push(hg);
  const head = new T.Mesh(hg, mat({ color: C.head, opacity: 0, blending: T.AdditiveBlending })); head.renderOrder = 999; root.add(head);
  // the fireworks: one canvas over the whole page
  let cv = null, cx = null; const sparks = []; let nextBurst = 0, bursts = 0;
  function fireOn() {
    if (cv || typeof document === 'undefined') return;
    cv = document.createElement('canvas'); cv.className = 'h132-fire';
    Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 57 });
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv); cx = cv.getContext('2d');
  }
  function burst(i) {
    const W = cv.width, H = cv.height, x = W * (0.12 + ((i * 0.618) % 1) * 0.76), y = H * (0.14 + ((i * 0.381) % 1) * 0.5), n = 46, col = C.fire[i % C.fire.length], col2 = C.fire[(i + 2) % C.fire.length];
    for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2, v = (0.55 + ((j * 7) % 5) / 9) * Math.min(W, H) * 0.42; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 1.5 + (j % 3) * 0.2, col: j % 2 ? col : col2 }); }
  }
  function fireStep(dt, on) {
    if (!cv) return;
    if (on) { nextBurst -= dt; while (nextBurst <= 0) { burst(bursts++); nextBurst += 0.28; } }
    cx.clearRect(0, 0, cv.width, cv.height); cx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; if (s.t > s.life) { sparks.splice(i, 1); continue; }
      s.vx *= 1 - dt * 1.6; s.vy = s.vy * (1 - dt * 1.6) + 160 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      const a = 1 - s.t / s.life; cx.globalAlpha = a; cx.fillStyle = s.col; cx.beginPath(); cx.arc(s.x, s.y, 2.6 + 2 * a, 0, Math.PI * 2); cx.fill();
    }
    cx.globalAlpha = 1;
  }
  let stopped = false, raf = 0, t = 0, last = 0, resolve = null;
  const half = (top - Y), down = (Y - base);
  function step(now) {
    if (stopped) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now; t += dt;
    const E = endingAt(t);
    glowM.opacity = 0.85 * E.glow;
    if (E.head != null) { const p = roundAt(E.head, 0.15); head.position.set(p.x, Y, p.z); head.material.opacity = 1; } else head.material.opacity = 0;
    // (the light wave: from the line up to the top; the dark: from the line down to the yesod — each a band whose far edge travels)
    lightM.opacity = 0.42 * E.waveAlpha; darkM.opacity = 0.38 * E.waveAlpha;
    for (const p of bands.light) { const h = Math.max(0.001, half * E.light); p.scale.y = h; p.position.y = Y + h / 2; }
    for (const p of bands.dark) { const h = Math.max(0.001, down * E.dark); p.scale.y = h; p.position.y = Y - h / 2; }
    if (E.fire) fireOn();
    fireStep(dt, E.fire);
    if (E.done && !sparks.length) { stop(); return; }
    raf = requestAnimationFrame(step);
  }
  function stop() {
    if (stopped) return; stopped = true; try { cancelAnimationFrame(raf); } catch (e) { /* */ }
    try { if (root.parent) root.parent.remove(root); } catch (e) { /* */ }
    for (const m of mats) m.dispose(); for (const g of geos) g.dispose();
    try { if (cv) cv.remove(); } catch (e) { /* */ } cv = null;
    if (resolve) { const r = resolve; resolve = null; r(); }
  }
  return {
    run() { return new Promise((r) => { resolve = r; raf = requestAnimationFrame(step); }); },
    stop,
    get t() { return t; },
  };
}
