/* ── light28 ── light28.js — light that does not blind, text that never hides (WAVE28 LIGHT28; docs/WAVE28-BRIEF.md).
 * (1) nearDim(pos[, cam]) → k ∈ [0.12, 1]: how much of an additive glow / a PointLight survives a camera this near to it — full at 40 amot,
 *     0.12 at 6 and nearer (life.js fable27's pyre rule, made one helper). A glow's alpha / colour × k; a PointLight's intensity × k².
 *     setCam(camera) once (main.js / the day); NEAR holds the numbers.
 * (2) the label zone: zone() → { top, bottom, W, H, obs } — the band between the HUD's bottom edge + 8 px and the top of the buttons' row − 8 px;
 *     zoneAt(x0, x1) → { top, bottom } for a rect's own columns (the buttons stand at the right: a label at the left may sit lower).
 *     claim({ x, y, w, h }) → the same rect clamped into the zone and shifted down off every label claimed before it this frame (a simple stack;
 *     upward when the foot is reached) — the 3D labels (kit sprites), the work chips, the says lines, the counts, the ממונה's bubble.
 *     pinTop(el, order) puts a DOM line (the bubble, the work's say) at the zone's top, one under the other.
 * Tests: globalThis.__L28 = { nearDim, zone, zoneAt, claims(), lights() }. No image files; nothing is allocated per frame but the claims list.
 * ── /light28 ── */
export const NEAR = { full: 40, near: 6, min: 0.12 };
const CAM = { c: null };
export function setCam(c) { if (c && c.position) CAM.c = c; }
/** k ∈ [NEAR.min, 1] from the camera's distance to pos ({x,y,z} or [x,y,z]) */
export function nearDim(pos, cam) {
  const c = cam || CAM.c; if (!c || !c.position || !pos) return 1;
  const x = pos.x != null ? pos.x : pos[0], y = pos.y != null ? pos.y : pos[1], z = pos.z != null ? pos.z : pos[2];
  if (!Number.isFinite(x + y + z)) return 1;
  const d = Math.hypot(c.position.x - x, c.position.y - y, c.position.z - z);
  return NEAR.min + (1 - NEAR.min) * Math.max(0, Math.min(1, (d - NEAR.near) / (NEAR.full - NEAR.near)));
}
/** a PointLight seen near: intensity base × k² (k by the camera's distance to the light) — and its reach capped, so a torch never whites a wall
 *  at 2 amot: distance = cap amot (0 = unlimited is never left on a torch). Returns k. */
export function dimLight(L, base, cap) {
  if (!L) return 1;
  const k = nearDim(L.position);
  L.intensity = base * k * k;
  if (cap && L.distance !== cap) L.distance = cap;
  return k;
}

/* ───────── the label zone ───────── */
const TOP_SEL = ['.dy-gm .dy-hud', '.dy-gm .dy-coin'];
const BOT_SEL = ['.gm.tw-on .tw-btn', '.gm.tw-on .tw-hand', '.gm.tw-on .tw-ov', '.gm.tw-on .tw-pips', '.gm.tw-on .tw-base', '.gm.tw-on .tw-tip', '.wb-bar button', '.dy-line.on'];   // (+ the stick's ring and the two hints over the thumbs)
const Z = { at: -1, top: 64, bottom: 300, W: 844, H: 390, obs: [], tops: [], list: [], fixed: [] };
const vis = (e) => { if (!e || !e.getBoundingClientRect) return null; const r = e.getBoundingClientRect(); if (!(r.width > 2 && r.height > 2)) return null; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return null; return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }; };
let frameN = 0, ticking = false;
function tick() { frameN++; if (Z.list.length) Z.last = Z.list.slice();   // (tests: the last frame that drew labels — a held frame draws none)
   Z.list.length = 0; Z.at = -1; if (typeof requestAnimationFrame === 'function') requestAnimationFrame(tick); }
function measure() {
  if (Z.at === frameN) return Z;
  if (!ticking && typeof requestAnimationFrame === 'function') { ticking = true; requestAnimationFrame(tick); }
  Z.at = frameN; const doc = typeof document !== 'undefined' ? document : null;
  Z.W = (globalThis.innerWidth || 844); Z.H = (globalThis.innerHeight || 390);
  Z.tops.length = 0; Z.obs.length = 0;
  if (doc) {
    for (const s of TOP_SEL) for (const e of doc.querySelectorAll(s)) { const r = vis(e); if (r && r.y1 < Z.H * 0.45) Z.tops.push(r); }
    for (const s of BOT_SEL) for (const e of doc.querySelectorAll(s)) { const r = vis(e); if (r && r.y0 > Z.H * 0.35) Z.obs.push(r); }
  }
  // (the place markers' chips — twin.js's, moved by CAM28 — are obstacles: a label keeps off them)
  Z.mk = [];
  if (doc) for (const e of doc.querySelectorAll('.gm.tw-on .tw-mk')) { if (/-999/.test(e.style.transform || '-999')) continue; const r = vis(e); if (r && r.x1 > 0 && r.x0 < Z.W && r.y1 > 0 && r.y0 < Z.H) Z.mk.push({ ...r, tag: 'marker' }); }
  Z.top = Z.tops.length ? Math.max(...Z.tops.map((r) => r.y1)) + 8 : 8;
  Z.bottom = Z.obs.length ? Math.min(...Z.obs.map((r) => r.y0)) - 8 : Z.H - 8;
  return Z;
}
export function zone() { const z = measure(); return { top: Math.round(z.top), bottom: Math.round(z.bottom), W: z.W, H: z.H }; }
/** the band for the columns x0…x1: below every top piece over them, above every button under them */
export function zoneAt(x0, x1) {
  const z = measure(); let top = 8, bottom = z.H - 8;
  for (const r of z.tops) if (r.x1 > x0 && r.x0 < x1) top = Math.max(top, r.y1 + 8);
  for (const r of z.obs) if (r.x1 > x0 && r.x0 < x1) bottom = Math.min(bottom, r.y0 - 8);
  return { top, bottom };
}
const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
/** a fixed rect this frame (a DOM line in its place): later claims keep off it */
export function hold(r, tag) { measure(); if (r) Z.fixed.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, tag: tag || 'fixed' }); }
/** a label's rect (centre x, y; size w, h in CSS px) → its place in the zone, off every label before it this frame: { x, y, moved } */
export function claim(x, y, w, h, tag) {
  const z = measure();
  w = Math.max(1, w); h = Math.max(1, h);
  // (a rect wider than the screen keeps its centre; one off the screen's sides is drawn back in)
  x = Math.max(w / 2 + 4, Math.min(z.W - w / 2 - 4, x));
  const b = zoneAt(x - w / 2, x + w / 2), lo = b.top + h / 2, hi = Math.max(lo, b.bottom - h / 2);
  let cy = Math.max(lo, Math.min(hi, y));
  const others = Z.fixed.concat(Z.mk || [], Z.list);
  const at = (yy) => ({ x0: x - w / 2, x1: x + w / 2, y0: yy - h / 2, y1: yy + h / 2 });
  for (let it = 0; it < 12; it++) {
    const r = at(cy); const o = others.find((q) => hit(r, q)); if (!o) break;
    const down = o.y1 + 4 + h / 2;
    if (down <= hi) { cy = down; continue; }
    const up = o.y0 - 4 - h / 2;   // (the foot reached: above it instead)
    if (up >= lo) { cy = up; continue; }
    break;
  }
  const r = at(cy); r.tag = tag || ''; Z.list.push(r);
  return { x, y: cy, moved: Math.abs(cy - y) > 0.5 };
}
/** the labels' owner is gone (the kit cleared at a work's end): no claims left over for the tests */
export function forget() { Z.last = []; Z.list.length = 0; }
/** this frame's claimed rects (tests) */
export function claims() { measure(); return (Z.list.length ? Z.list : (Z.last || [])).concat(Z.fixed).map((r) => ({ x0: Math.round(r.x0), y0: Math.round(r.y0), x1: Math.round(r.x1), y1: Math.round(r.y1), tag: r.tag })); }
/** DOM lines at the zone's top, in order (the work's say, the ממונה's bubble, the verse): each under the one before it; the top in px is set
 *  only when it changes (no layout per frame for nothing) */
export function pinTops(els) {
  const z = measure(); let y = z.top; Z.fixed.length = 0;   // (the lines stay held until the next pin: labels keep off them whatever the order of the frame)
  for (const e of els) {
    if (!e) continue;
    const want = Math.round(y) + 'px'; if (e.style.top !== want) e.style.top = want;
    const r = vis(e); if (!r) continue;
    hold({ x0: r.x0, y0: y, x1: r.x1, y1: y + (r.y1 - r.y0) }, e.className.split(' ')[0]);
    y += (r.y1 - r.y0) + 6;
  }
  return y;
}
/** tests: the PointLights LIGHT28 dims, by name → { i: intensity, d: distance, k: nearDim } */
const LIGHTS = new Map();
export function reg(name, L) { if (L) LIGHTS.set(name, L); }
export function lights() { const o = {}; for (const [n, L] of LIGHTS) o[n] = { i: +L.intensity.toFixed(2), d: +L.distance.toFixed(1), k: +nearDim(L.position).toFixed(2) }; return o; }
// tests
if (typeof globalThis !== 'undefined') globalThis.__L28 = Object.assign(globalThis.__L28 || {}, { nearDim, zone, zoneAt, claims, lights, NEAR, cam: () => CAM.c });
