/* ── shift29 ── draw.js — ONE frame of the shift's world props (WAVE29 SHIFT29B): the pilgrims, the stations' rings and the acts' props
 * are drawn into the works kit (works/kit.js) in a single begin → draw → end per animation frame, on the kit's WORLD frame (a = x / K,
 * s = z / K, y / K: kit.F set to the origin, facing +x — so figures.js man/lamb take world amot ÷ K). Its own rAF loop runs while any
 * drawer is registered (the engine never has to drive the drawing; tick(dt) of each module is logic only). No allocation per frame.
 * Never a Divine Name; no red but the BLOOD palette (blood.js) at its places. ── /shift29 ── */
import { KA } from '../works/anchors.js';
import { getKit } from '../works/craft.js';
import { PROF } from '../../prof30.js';   // ── shift30 ── ── /shift30 ──

const D = { kit: null, own: null, list: [], t: 0, n: 0, err: null };
export const K29 = KA;
/** the kit to draw in: an instance (has begin), or the kit MODULE / nothing → the day's shared kit (craft.js getKit) */
export function kitOf(k) { if (k && typeof k.begin === 'function') return k; try { return getKit(); } catch (e) { return null; } }
/** the kit's frame on the world: a = x / K, s = z / K, y = y / K */
export function worldFrame(k) {
  const F = k.F; F.on = true; F.anchor = null; F.A = null; F.view = null; F.x = 0; F.y = 0; F.z = 0; F.fx = 1; F.fz = 0; F.yaw = Math.atan2(1, 0); F.K = KA; F.Ca = 1; F.a0 = 0;
}
/** world amot → the kit's local (for man / lamb / k.b …) */
export const L = (x) => x / KA;
/* ── the tick: every game frame. The host calls globalThis.__S29TICK(ms) from twin.js's update (the day's frame — in a test's simulated
 * loop too, where requestAnimationFrame starves); requestAnimationFrame is the fallback when the host has not ticked for 120 ms. ── */
const TK = { list: [], hostAt: -1e9, raf: 0, last: 0, n: 0, host: 0 };
function run(ms) {
  const dt = TK.last ? Math.min(0.1, Math.max(0, (ms - TK.last) / 1000)) : 0; TK.last = ms; TK.n++;
  if (!PROF.on) { for (const f of TK.list.slice()) { try { f(ms, dt); } catch (e) { D.err = e && e.message; } } return; }
  // ── shift30 ── (the frame-time log: the camera's own share, the chips' (draw.js chipsMs), the rest is the shift's tick) ── /shift30 ──
  for (const f of TK.list.slice()) { const t0 = PROF.t(); D.chipsMs = 0; try { f(ms, dt); } catch (e) { D.err = e && e.message; } const t = PROF.t() - t0; if (f.__prof === 'cam') PROF.add('cam', t); else { PROF.add('chips', D.chipsMs); PROF.add('shift', t - D.chipsMs); } }
}
/** ── shift30 ── the chips' share of a drawer's time (stations/pilgrims chips()) ── /shift30 ── */
export function chipsTime(ms) { D.chipsMs = (D.chipsMs || 0) + ms; }
function rafLoop(ms) { TK.raf = 0; if (!TK.list.length) return; if (performance.now() - TK.hostAt > 120) run(performance.now()); TK.raf = requestAnimationFrame(rafLoop); }
/** f(ms, dt) every game frame → off() */
export function onTick(f) {
  TK.list.push(f);
  if (!TK.raf && typeof requestAnimationFrame === 'function') TK.raf = requestAnimationFrame(rafLoop);
  return () => { const i = TK.list.indexOf(f); if (i >= 0) TK.list.splice(i, 1); if (!TK.list.length && TK.raf) { try { cancelAnimationFrame(TK.raf); } catch (e) { /* */ } TK.raf = 0; TK.last = 0; } };
}
try { globalThis.__S29ERR = () => D.err; } catch (e) { /* node */ }   // ── fable32 (build 12) ── (tests: the last drawer error) ── /fable32 ──
try { globalThis.__S29TICK = (ms) => { if (!TK.list.length) return; TK.hostAt = performance.now(); TK.host++; run(performance.now()); }; } catch (e) { /* node */ }
function frame(ms, dt) {
  if (!D.list.length) return;
  D.t += dt; D.n++;
  // (the day's kit is remade when the world's scene is (works/register.js bind): the current one each frame, unless an instance was handed in)
  const k = D.own || kitOf(null); D.kit = k;
  if (k) {
    SHARED.rects.length = 0;
    try { worldFrame(k); k.begin(); for (const f of D.list) { try { f(k, D.t, dt); } catch (e) { D.err = e && e.message; } } k.end(); } catch (e) { D.err = e && e.message; }
  }
}
let offFrame = null;
/** add a drawer f(kit, t, dt) → off() */
export function addDrawer(kit, f, prio = 0) {
  if (kit && typeof kit.begin === 'function') D.own = kit;
  f.__prio = prio; D.list.push(f); D.list.sort((a, b) => (a.__prio || 0) - (b.__prio || 0));   // (the stations' chips placed before the pilgrims': the court's places stay put)
  if (!offFrame) offFrame = onTick(frame);
  return () => {
    const i = D.list.indexOf(f); if (i >= 0) D.list.splice(i, 1);
    if (!D.list.length) { if (offFrame) { offFrame(); offFrame = null; } try { if (D.kit) D.kit.clear(); } catch (e) { /* */ } D.own = null; }
  };
}
/** the DOM layer of the shift's chips: fixed over the whole screen, z 22 — over the game root's thumbs (.gm is z 20, its stick zone
 *  inside it) and under the shift's HUD and end card (z 30); pointer-events only on the chips themselves */
const LAYERS = new Map();
export function layerOf(root) {
  const doc = typeof document !== 'undefined' ? document : null; if (!doc) return null;
  const r = root || doc.body; let L0 = LAYERS.get(r);
  if (L0 && L0.isConnected) return L0;
  L0 = doc.createElement('div'); L0.className = 's29-layer'; L0.style.cssText = 'position:fixed;inset:0;z-index:22;pointer-events:none;overflow:hidden';
  r.appendChild(L0); LAYERS.set(r, L0); return L0;
}
/** what the modules tell each other without wiring: the act running ({ x, y, z } of the kohen) — the camera comes close to it */
export const SHARED = { act: null, rects: [], board: null };
/** a look-at projection without three (the camera at cam looking at tgt, vertical fov, W × H) → [x, y, depth] */
export function proj(cam, tgt, p, W, H, fov) {
  const th = Math.tan(fov * Math.PI / 360), asp = W / H;
  let fx = tgt[0] - cam[0], fy = tgt[1] - cam[1], fz = tgt[2] - cam[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
  const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  const dx = p[0] - cam[0], dy = p[1] - cam[1], dz = p[2] - cam[2];
  const z = dx * fx + dy * fy + dz * fz, x = dx * rx + dz * rz, y = dx * ux + dy * uy + dz * uz;
  return [(x / (z * th * asp) * 0.5 + 0.5) * W, (-y / (z * th) * 0.5 + 0.5) * H, z];
}
/** while the camera glides back to the board after an act (camera.js sets SHARED.board.on), the court's chips stand where the board
 *  will put them — still under the finger from the first frame — instead of sliding with the glide → { x, y, on } | null */
export function boardAt(x, y, z) {
  const B = SHARED.board; if (!B || !B.on || !(performance.now() < B.until)) return null;
  const q = proj(B.cam, B.tgt, [x, y, z], globalThis.innerWidth || 844, globalThis.innerHeight || 390, B.fov);
  return { x: q[0], y: q[1], on: q[2] > 0 };
}
/** the chips' places this frame, all of the shift's own chips in one pass (pilgrims first, then the stations): the first free spot at the
 *  wanted point, else stepped up and down by a chip's height; kept inside the screen under the top bar (64 px) and over the bottom 8 px.
 *  Deterministic — LIGHT28's claim() keeps the labels of a frame, and its frame is the rAF's, which a slow host's tick may not match ⚑ */
export function placeChip(x, y, w, h, top = 64) {
  const W = globalThis.innerWidth || 844, H = globalThis.innerHeight || 390, R = SHARED.rects;
  // (a thing off the screen has no chip — never one squeezed onto the edge, over the thumbs' buttons)
  if (!(x > -w / 2 && x < W + w / 2 && y > -h && y < H + h)) return null;
  x = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
  const clampY = (v) => Math.max(top + h / 2, Math.min(H - 8 - h / 2, v));
  const hit = (cx, cy) => { for (const r of R) if (Math.abs(r[0] - cx) < (r[2] + w) / 2 + 3 && Math.abs(r[1] - cy) < (r[3] + h) / 2 + 3) return true; return false; };
  let cy = clampY(y);
  if (hit(x, cy)) { for (let g = 1; g <= 8; g++) { const up = clampY(y - g * (h + 4)), dn = clampY(y + g * (h + 4)); if (!hit(x, up)) { cy = up; break; } if (!hit(x, dn)) { cy = dn; break; } } }
  // (the work button's corner and the stick's ring stay the thumbs': a chip there is not drawn)
  if ((x + w / 2 > W - 150 && cy + h / 2 > H - 140) || (x - w / 2 < 130 && cy + h / 2 > H - 110)) return null;
  R.push([x, cy, w, h]); return { x, y: cy };
}
export const drawState = () => ({ n: D.n, drawers: D.list.length, err: D.err, kit: !!D.kit, ticks: TK.n, host: TK.host, raf: !!TK.raf });
try { globalThis.__S29D = drawState; } catch (e) { /* tests */ }
/* ── shift30 ── the edge chips (WAVE30 SHIFT30 (2): "the player's eyes"): a chip whose anchor is on the screen stands over it (placeChip, as
 * before); one whose anchor is off the screen — aside, above, or behind the camera — stands at the screen's edge in its direction, with an
 * arrow toward it and the distance in amot from the kohen ("12"); never in the thumbs' corners (the stick's 130×110 lower left, the work
 * button's 150×140 lower right — such a chip slides up the edge), never on another chip (stepped along the edge). A chip is moved only when
 * its place changed by more than 2 px (no re-layout for nothing).
 *   edgeChip(e, x, y, z, { w, h, view, from: {x, z}, top }) → { x, y, edge: bool, ang } | null    (e: the chip; its <b class=s30-ar>,
 *   <em class=s30-d> children are made here once) ── /shift30 ── */
const CQ30 = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0, n: -1, v: null };
export const EDGE30 = { m: 8, top: 64, foot: 54, stick: [130, 110], btn: [150, 140], move: 2 };   // (foot 54: over the first round's hint line at the foot)
export const EDGE30_CSS = `.s30-ar{display:none;position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}
.s30-ar::before{content:"";position:absolute;left:0;top:-8px;border-left:13px solid #FFD66E;border-top:8px solid transparent;border-bottom:8px solid transparent;filter:drop-shadow(0 0 2px rgba(40,28,12,.9))}
.s30-d{display:none;font:800 13px/1 "Heebo",system-ui,sans-serif;font-style:normal;font-variant-numeric:tabular-nums;color:#FFE9A6;margin-inline-start:2px}
.s30-edge .s30-ar,.s30-edge .s30-d{display:block}
.s30-edge{opacity:.94}`;
export function edgeChip(e, x, y, z, o = {}) {
  const view = o.view, W = globalThis.innerWidth || 844, H = globalThis.innerHeight || 390, h = o.h || 48, E = EDGE30, top = o.top || E.top;
  let w = o.w || 90;
  if (!e || !view) return null;
  if (!e.__ar) { const doc = e.ownerDocument; e.__ar = doc.createElement('b'); e.__ar.className = 's30-ar'; e.__ar.setAttribute('aria-hidden', 'true'); e.appendChild(e.__ar); e.__dd = doc.createElement('em'); e.__dd.className = 's30-d'; e.appendChild(e.__dd); }
  const p = view.project(x, y, z), px = p.x, py = p.y, on = p.on;
  // (behind the camera? a look-at projection's depth says so; three's x, y are mirrored there)
  let depth = 1; try { if (view.camNow) { if (CQ30.n !== D.n || CQ30.v !== view) { view.camNow(CQ30); CQ30.n = D.n; CQ30.v = view; }   /* (once a frame) */ depth = (x - CQ30.px) * (CQ30.tx - CQ30.px) + (y - CQ30.py) * (CQ30.ty - CQ30.py) + (z - CQ30.pz) * (CQ30.tz - CQ30.pz); } } catch (err) { /* */ }
  let inside = depth > 0 && px >= w / 2 + E.m && px <= W - w / 2 - E.m && py >= top + h / 2 - 20 && py <= H - 8 - h / 2 + 10;
  // (the chip's point is over the top, but the thing itself is in the frame — ahead of him, far: the chip stands at the top over it, no arrow)
  if (!inside && depth > 0 && Number.isFinite(o.ground) && py < top + h / 2) { const g = view.project(x, o.ground, z); if (g.on && g.x >= w / 2 + E.m && g.x <= W - w / 2 - E.m && g.y > top && g.y < H - 8) inside = true; }
  const corner = (cx, cy) => (cx - w / 2 < E.stick[0] && cy + h / 2 > H - E.stick[1]) || (cx + w / 2 > W - E.btn[0] && cy + h / 2 > H - E.btn[1]);
  let c = null, edge = false, ang = 0;
  if (inside && !corner(px, py)) { c = placeChip(px, py, w, h, top); }
  if (!c) {
    edge = true; w = e.__we || w + 24;   // (the distance's digits widen it: measured once in this state)
    const cx = W / 2, cy = H * 0.55; let vx = px - cx, vy = py - cy;
    if (depth <= 0) { vx = -vx; vy = -vy; if (vy < Math.abs(vx) * 0.2) vy = Math.abs(vx) * 0.2 + 1; }   // (behind him and the camera: toward the foot)
    if (Math.hypot(vx, vy) < 1) { vx = 0; vy = 1; }
    ang = Math.atan2(vy, vx);
    const x0 = w / 2 + E.m, x1 = W - w / 2 - E.m, y0 = top + h / 2, y1 = H - E.foot - h / 2;
    let t = Infinity; if (vx > 0) t = Math.min(t, (x1 - cx) / vx); if (vx < 0) t = Math.min(t, (x0 - cx) / vx); if (vy > 0) t = Math.min(t, (y1 - cy) / vy); if (vy < 0) t = Math.min(t, (y0 - cy) / vy);
    let ex = cx + vx * t, ey = cy + vy * t;
    // (the thumbs' corners: up the side edge, over them)
    if (ex - w / 2 < E.stick[0] && ey + h / 2 > H - E.stick[1]) { if (ex - w / 2 <= x0 - w / 2 + 2) ey = H - E.stick[1] - h / 2 - 4; else { ex = Math.max(ex, E.stick[0] + w / 2 + 4); } }
    if (ex + w / 2 > W - E.btn[0] && ey + h / 2 > H - E.btn[1]) { if (ex + w / 2 >= x1 + w / 2 - 2) ey = H - E.btn[1] - h / 2 - 4; else { ex = Math.min(ex, W - E.btn[0] - w / 2 - 4); } }
    // (never on another chip: stepped along its edge)
    const R = SHARED.rects, A0 = o.avoid, hit = (qx, qy) => { for (const r of R) if (Math.abs(r[0] - qx) < (r[2] + w) / 2 + 3 && Math.abs(r[1] - qy) < (r[3] + h) / 2 + 3) return true; return !!(A0 && Math.abs(A0[0] - qx) < (A0[2] + w) / 2 + 3 && Math.abs(A0[1] - qy) < (A0[3] + h) / 2 + 3); };   // (o.avoid: the kohen himself — an edge chip never on him)
    const side = ex <= x0 + 1 || ex >= x1 - 1;
    let free0 = !hit(ex, ey);
    if (!free0) for (let g = 1; g <= 10; g++) { const s = (g % 2 ? 1 : -1) * Math.ceil(g / 2); const qx = side ? ex : Math.max(x0, Math.min(x1, ex + s * (w + 6))), qy = side ? Math.max(y0, Math.min(y1, ey + s * (h + 6))) : ey; if (!hit(qx, qy) && !corner(qx, qy)) { ex = qx; ey = qy; free0 = true; break; } }
    // (its edge full — the foot holds the kohen and the thumbs' corners: up the side edge nearer to it, then the other, over the corners)
    if (!free0) search: for (const sx of vx < 0 ? [x0, x1] : [x1, x0]) for (let qy = (sx === x0 ? H - E.stick[1] : H - E.btn[1]) - h / 2 - 4; qy >= y0; qy -= h + 6) if (!hit(sx, qy)) { ex = sx; ey = qy; ang = Math.atan2(vy, vx); break search; }
    R.push([ex, ey, w, h]); c = { x: ex, y: ey };
  }
  // the arrow and the distance (from the kohen)
  if (edge) {
    const a = `rotate(${(ang * 180 / Math.PI).toFixed(0)}deg) translate(${Math.round(Math.max(w, h) / 2 - 2)}px,0)`; if (e.__ar.style.transform !== a) e.__ar.style.transform = a;
    const f = o.from, dd = f ? String(Math.max(1, Math.round(Math.hypot(x - f.x, z - f.z)))) : ''; if (e.__dd.textContent !== dd) { if (e.__dd.textContent.length !== dd.length) e.__we = 0; e.__dd.textContent = dd; }   // (a digit more or less: measured again)
  }
  if (!!e.__edge !== edge) { e.__edge = edge; e.classList.toggle('s30-edge', edge); }
  if (edge && !e.__we) e.__we = e.offsetWidth || 0;   // (one layout read, the first frame at the edge)
  if (!(Math.abs((e.__cx || -1e4) - c.x) <= E.move && Math.abs((e.__cy || -1e4) - c.y) <= E.move)) { e.__cx = c.x; e.__cy = c.y; e.style.transform = `translate(${Math.round(c.x - w / 2)}px,${Math.round(c.y - h / 2)}px)`; }
  e.__on = true;
  return { x: e.__cx, y: e.__cy, edge, ang };
}
// ── /shift30 ──
