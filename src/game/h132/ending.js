/* ── build 132 ── h132/ending.js — the stage's ending (spec docs/specs/shlav-09-he.md, "סיום השלב"), the lead's:
 *   "חצי שנייה שקט. הקו נדלק, רץ סביב ופועם. המצלמה עולה ומקיפה. גל אור בהיר מעל הקו וגל כהה מתחתיו נעצרים משני צדדיו. זיקוקים
 *    אדומים וזהובים על כל המסך. העולם חוזר לעבוד. הקו נשאר לתמיד, עם הפגמים. אין דם בסיום."
 * The timeline (seconds from its start, once the camera stands at the book's peak shot BOOK.s09.cam.peak — low at the south-east,
 * the east and south faces filling the frame with the court's air above them; the camera rises into the round after it, pack.js):
 *   0 … 0.5   quiet;
 *   0.5 … 1.1 the line lights: a red band and its halo along the four faces at the line's height (the line itself stays as he drew it);
 *   1.1 … 3.5 a bright head with its trail runs round the 120 amot once (from the south-east corner, the walk's way), then the line pulses;
 *   2.9 … 4.4 the waves: a gold light rises from the line over the top edge into the air, a dark shade goes down from it to the yesod —
 *             each stops at its edge, on its own side of the line, and holds (light and shade only: no blood);
 *   4.4 … 7.6 red and gold fireworks over the whole screen: rockets, large bursts, the sky dimmed behind them, a flash, the screen's
 *             shake and the vibration at the first burst and at the closing triple (a canvas over the page);
 *   7.6 … 9.6 all of it fades; the world goes back to work. Nothing is left but the line as it was.
 * Pure timing in ENDING (tests read it); endingFx(X) draws it (three.js + one canvas), stop() takes everything away at once.
 */
import { BOOK } from '../world/grid.js';

const S9 = BOOK.s09;
export const ENDING = Object.freeze({
  QUIET: 0.5, LIGHT: [0.5, 1.1], RUN: [1.1, 3.5], WAVES: [2.9, 4.4], FIRE: [4.4, 7.6], FADE: [7.6, 9.6],
  // the bursts (seconds into FIRE; the last three together: the closing triple) and how far the light rises over the top (amot)
  BURSTS: Object.freeze([0, 0.16, 0.34, 0.5, 0.68, 0.84, 1.0, 1.18, 1.34, 1.5, 1.68, 1.86, 2.04, 2.22, 2.5, 2.54, 2.58]), RISE: 5,
  COLORS: Object.freeze({ line: 0xff2a1c, head: 0xfff1c8, light: 0xffd98a, dark: 0x141a24, fire: Object.freeze(['#ff3b2e', '#e0201a', '#ffd166', '#f4b400', '#fff1c8']) }),
});
/** the vibration's patterns (ms on, off, on), as words: the first burst and the closing triple */
const BUZZ = { small: '40 30 60', big: '60 40 90' }; for (const k of Object.keys(BUZZ)) BUZZ[k] = BUZZ[k].split(' ').map(Number);
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

/** the bursts in the fireworks' own time (s from FIRE's start): [{ at, x, y, r, n, col, col2, big }] in screen shares (x, y 0…1, r of
 *  the screen's short side) — fixed, no chance; the closing triple bigger. Pure. */
export function burstsPlan() {
  const B = ENDING.BURSTS, C = ENDING.COLORS.fire, L = B.length;
  return B.map((at, i) => {
    const big = i >= L - 3;
    const x = big ? [0.25, 0.5, 0.75][i - (L - 3)] : 0.1 + ((i * 0.618 + 0.13) % 1) * 0.8;
    const y = big ? [0.3, 0.2, 0.3][i - (L - 3)] : 0.14 + ((i * 0.381 + 0.21) % 1) * 0.36;
    return { at, x, y, r: big ? 0.46 : 0.26 + ((i * 0.27) % 1) * 0.14, n: big ? 150 : 96, col: C[(i * 2) % C.length], col2: C[(i * 2 + 3) % C.length], big };
  });
}

/** the ending drawn: → { run(): Promise (resolves at its end), stop() } */
export function endingFx(X) {
  const T = X.THREE, root = new T.Group(); root.name = 'h132-ending';
  const parent = X.scene || (X.props && X.props.root); if (parent) parent.add(root);
  const C = ENDING.COLORS, Y = S9.lineY, top = S9.top, base = S9.base, mats = [], geos = [], texs = [];
  const hasDoc = typeof document !== 'undefined';
  // (a vertical gradient as a texture: alpha a0 at the plane's foot to a1 at its head; the glow's halo peaks in the middle)
  const grad = (stops) => {
    if (!hasDoc) return null;
    const GW = 4, GH = 128, c = document.createElement('canvas'); c.width = GW; c.height = GH; const g = c.getContext('2d'), G = g.createLinearGradient(0, GH, 0, 0);
    for (const [at, a] of stops) G.addColorStop(at, `rgba(255,255,255,${a})`);
    g.fillStyle = G; g.fillRect(0, 0, GW, GH); const t = new T.CanvasTexture(c); texs.push(t); return t;
  };
  const mat = (o) => { const m = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, ...o }); mats.push(m); return m; };
  // (normal blending: on the white plaster an additive light is lost — the glow is a red band with its halo, the light gold, the shade dark)
  const glowM = mat({ color: C.line, opacity: 0 }), haloM = mat({ color: 0xff5a2a, opacity: 0, map: grad([[0, 0], [0.5, 1], [1, 0]]) });
  const faceLightM = mat({ color: C.light, opacity: 0 }), riseM = mat({ color: C.light, opacity: 0, map: grad([[0, 1], [0.35, 0.55], [1, 0]]) });
  const darkM = mat({ color: C.dark, opacity: 0, map: grad([[0, 0.45], [1, 1]]) });
  const bands = { glow: [], halo: [], face: [], rise: [], dark: [] };
  for (const f of faces()) {
    const len = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), mx = (f.a[0] + f.b[0]) / 2, mz = (f.a[1] + f.b[1]) / 2, rotY = Math.atan2(f.n[0], f.n[1]);
    const plane = (m, { off, h, ro }) => { const g = new T.PlaneGeometry(len + 0.3, 1); geos.push(g); const p = new T.Mesh(g, m); p.position.set(mx + f.n[0] * off, Y, mz + f.n[1] * off); p.rotation.y = rotY; p.scale.y = h; p.renderOrder = ro; root.add(p); return p; };
    bands.dark.push(plane(darkM, { off: 0.05, h: 0.001, ro: 996 }));
    bands.face.push(plane(faceLightM, { off: 0.06, h: 0.001, ro: 996 }));
    bands.rise.push(plane(riseM, { off: 0.07, h: 0.001, ro: 996 }));
    bands.halo.push(plane(haloM, { off: 0.09, h: 2.2, ro: 997 }));
    bands.glow.push(plane(glowM, { off: 0.1, h: 0.6, ro: 998 }));
  }
  // the running head and its trail
  const hg = new T.SphereGeometry(0.85, 14, 10); geos.push(hg);
  const trail = []; for (let i = 0; i < 9; i++) { const m = new T.Mesh(hg, mat({ color: i ? C.light : C.head, opacity: 0 })); m.renderOrder = 999; m.scale.setScalar(1 - i * 0.08); root.add(m); trail.push(m); }
  // the fireworks: one canvas over the whole page
  let cv = null, cx = null, flash = 0; const sparks = [], rockets = [], plan = burstsPlan(); let next = 0, seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function fireOn() {
    if (cv || !hasDoc) return;
    cv = document.createElement('canvas'); cv.className = 'h132-fire';
    Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 57 });
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv); cx = cv.getContext('2d');
  }
  const kick = (big) => { try { if (X.shake) X.shake(big ? 0.45 : 0.3, big ? 0.7 : 0.5); } catch (e) { /* */ } try { if (X.haptic) X.haptic(BUZZ[big ? 'big' : 'small']); } catch (e) { /* */ } };
  function launch(b, i) {
    const W = cv.width, H = cv.height;
    rockets.push({ b, x: b.x * W + (rnd() - 0.5) * 40, y: H * 0.78, tx: b.x * W, ty: b.y * H, t: 0, dur: 0.3 });
    if (i === 0) kick(false); else if (b.big && i === plan.length - 3) kick(true);
  }
  function burst(b) {
    const W = cv.width, H = cv.height, S = Math.min(W, H), x = b.x * W, y = b.y * H;
    for (let j = 0; j < b.n; j++) {
      const a = (j / b.n) * Math.PI * 2 + rnd() * 0.05, ring = j % 3 === 0 ? 0.62 : 1, v = (0.85 + rnd() * 0.3) * ring * b.r * S * 1.9;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 1.3 + rnd() * 0.5, col: ring < 1 ? b.col2 : b.col, tw: rnd() < 0.3 });
    }
    flash = Math.max(flash, b.big ? 0.16 : 0.08);
  }
  function fireStep(dt, ft, on) {
    if (!cv) return;
    const W = cv.width, H = cv.height, S = Math.min(W, H) / 600;
    if (on) while (next < plan.length && ft >= plan[next].at) { launch(plan[next], next); next++; }
    // (trails: the last frame fades rather than clears)
    cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = `rgba(0,0,0,${Math.min(1, 0.18 + dt * 6)})`; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = 'source-over';
    // (the sky dimmed behind them while they burst: a night's blue from the top, gone below the middle)
    const dim = on || sparks.length ? Math.min(1, ft / 0.3) * (on ? 1 : Math.max(0, 1 - (ft - (ENDING.FIRE[1] - ENDING.FIRE[0])) / 0.8)) : 0;
    if (dim > 0) { const G = cx.createLinearGradient(0, 0, 0, H * 0.7); G.addColorStop(0, `rgba(10,14,40,${0.3 * dim})`); G.addColorStop(1, 'rgba(10,14,40,0)'); cx.fillStyle = G; cx.fillRect(0, 0, W, H * 0.7); }
    cx.globalCompositeOperation = 'lighter';
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]; r.t += dt; const u = Math.min(1, r.t / r.dur), px = r.x + (r.tx - r.x) * u, py = r.y + (r.ty - r.y) * (1 - (1 - u) * (1 - u));
      cx.globalAlpha = 0.9; cx.fillStyle = C.fire[2]; cx.beginPath(); cx.arc(px, py, 2 * S, 0, Math.PI * 2); cx.fill();
      if (u >= 1) { rockets.splice(i, 1); burst(r.b); }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; if (s.t > s.life) { sparks.splice(i, 1); continue; }
      s.vx *= Math.max(0, 1 - dt * 2.2); s.vy = s.vy * Math.max(0, 1 - dt * 2.2) + 120 * S * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      const a = 1 - s.t / s.life, tw = s.tw ? 0.5 + 0.5 * Math.sin(s.t * 40) : 1;
      cx.globalAlpha = 0.14 * a * tw; cx.fillStyle = s.col; cx.beginPath(); cx.arc(s.x, s.y, (7 + 6 * a) * S, 0, Math.PI * 2); cx.fill();
      cx.globalAlpha = a * tw; cx.beginPath(); cx.arc(s.x, s.y, (2.4 + 2.2 * a) * S, 0, Math.PI * 2); cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
    if (flash > 0.01) { cx.globalAlpha = flash; cx.fillStyle = '#fff1c8'; cx.fillRect(0, 0, W, H); flash *= Math.max(0, 1 - dt * 7); }
    cx.globalAlpha = 1;
  }
  let stopped = false, raf = 0, t = 0, last = 0, t0 = 0, resolve = null; const waits = [];
  const up = top - Y, down = Y - base;
  function step(now) {
    if (stopped) return;
    // (the wall's clock, as the director's film keeps it: a slow page skips frames but the ending keeps its place)
    // (the probes' stills: globalThis.__H132_END_PAUSE stops the ending's clock — and its sparks — while a still is taken; play never sets it)
    if (!t0) t0 = now; let dt = last ? Math.min(0.25, (now - last) / 1000) : 0; if (globalThis.__H132_END_PAUSE && last) { t0 += now - last; dt = 0; } last = now; t = (now - t0) / 1000;
    const E = endingAt(t);
    glowM.opacity = 0.95 * E.glow; haloM.opacity = 0.7 * E.glow;
    for (let i = 0; i < trail.length; i++) {
      const m = trail[i];
      if (E.head != null && E.head - i * 0.006 >= 0) { const p = roundAt(E.head - i * 0.006, 0.18); m.position.set(p.x, Y, p.z); m.material.opacity = 1 - i / trail.length; }
      else m.material.opacity = 0;
    }
    // (the light: over the face from the line to the top edge, then on into the air above it RISE amot; the dark: the line to the yesod)
    faceLightM.opacity = 0.75 * E.waveAlpha; riseM.opacity = 0.6 * E.waveAlpha; darkM.opacity = 0.62 * E.waveAlpha;
    const hl = Math.min(1, E.light * 2.2), hr = Math.max(0, E.light * 2.2 - 1.2) / 1;
    for (const p of bands.face) { const h = Math.max(0.001, up * hl); p.scale.y = h; p.position.y = Y + h / 2; }
    for (const p of bands.rise) { const h = Math.max(0.001, ENDING.RISE * Math.min(1, hr)); p.scale.y = h; p.position.y = top + h / 2; }
    for (const p of bands.dark) { const h = Math.max(0.001, down * E.dark); p.scale.y = h; p.position.y = Y - h / 2; }
    if (E.fire) fireOn();
    fireStep(dt, t - ENDING.FIRE[0], E.fire);
    for (let i = waits.length - 1; i >= 0; i--) if (t >= waits[i].at) { const w = waits.splice(i, 1)[0]; w.r(); }
    if (E.done && !sparks.length && !rockets.length) { stop(); return; }
    raf = requestAnimationFrame(step);
  }
  function stop() {
    if (stopped) return; stopped = true; try { cancelAnimationFrame(raf); } catch (e) { /* */ }
    try { if (root.parent) root.parent.remove(root); } catch (e) { /* */ }
    for (const m of mats) m.dispose(); for (const g of geos) g.dispose(); for (const x of texs) x.dispose();
    try { if (cv) cv.remove(); } catch (e) { /* */ } cv = null;
    if (resolve) { const r = resolve; resolve = null; r(); }
    for (const w of waits.splice(0)) w.r();
  }
  return {
    run() { return new Promise((r) => { resolve = r; raf = requestAnimationFrame(step); }); },
    stop,
    /** → Promise, resolved when the ending's clock reaches sec (or it is stopped) */
    until(sec) { return stopped ? Promise.resolve() : new Promise((r) => waits.push({ at: sec, r })); },
    get t() { return t; },
  };
}
