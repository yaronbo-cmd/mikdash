/* ── places24 ── places24.js — the Tamid's works ON THEIR REAL PLACES (WAVE24 PLACES24; the owner: "רוצים להראות בדיוק רב ככל הניתן את
 * העבודות"). Each work keeps its model (the acts, the taps, the points — dawn.js / dawn2.js / tamid.js / song.js / night.js, untouched)
 * and gets an anchored draw: the kit's frame is set on the real place (anchors.js; kit.place({ anchor })), and the draw puts the kohanim,
 * the vessels and what the act moves at the place's real points — the altar, the ramp, the menorah, the golden altar, the laver, the
 * דוכן, the Ulam's steps and Nikanor's gate are the world's own geometry and are not drawn again. The camera: each frame the draw asks
 * for a view of the act (k.view(p, t) → the day's camWork → twin.js) — inside the Heichal's door for the menorah and the golden altar;
 * the אמרכל himself never passes the door. Nothing red, no blood, no Divine Name. ── /places24 ── */
import { man, flame, lamb, ROBE, SKIN } from './figures.js';
import { clamp, ease, getCtx } from './craft.js';
import { ANCHORS, NIGHT_POSTS, rampY } from './anchors.js';
import { TAMID_RING } from '../../places.js';   // ── blooda25 ──
const TAMID_AFTERNOON = TAMID_RING.afternoon;
import { BLOOD, liquid, tagBlood, graveOn, worldMark, worldShirayim, worldChannel, TEACH } from './blood.js';   // ── blooda25 ──
import { evName, evFrame } from './fix26.js';   // ── fix26 ── (the evarim's names) ── /fix26 ──
import { teachTap } from './bloodteach.js';   // ── blooda25 ── (the red line and the amah as teaching objects)
import { pick27, evResolve } from './slice27.js';   // ── slice27 ── ── /slice27 ──
import { MAAR27_WRONG } from './dawn.js';   // ── slice27 ── ── /slice27 ──
import { caBonus } from './craft.js';   // ── slice27 ── ── /slice27 ──

export const SILVER = '#C9CED6', GOLD = '#E2B84A', ASH = '#8E8A82', LINEN = '#EFE9DA';
const WOODS = ['#7A5535', '#6E4A2A', '#85603C'];
const lerp = (a, b, u) => a + (b - a) * u;
/** a world direction (dx, dz) → the yaw a figure takes in the kit's local frame */
export const dirL = (k, dx, dz) => Math.atan2(-k.F.fz * dx + k.F.fx * dz, k.F.fx * dx + k.F.fz * dz);
/** a figure at a world point (x, z), on the floor there (or at o.y, world), facing a world point o.face = [x, z] or a direction o.dir */
export function figW(k, x, z, o = {}) {
  const p = k.loc(x, 0, z), y = o.y != null ? (o.y - k.F.y) / k.F.K : k.gy(p[0], p[1]);
  const yaw = o.face ? dirL(k, o.face[0] - x, o.face[1] - z) : o.dir ? dirL(k, o.dir[0], o.dir[1]) : (o.yaw || 0);
  const r = man(k, p[0], p[1], y, Object.assign({}, o, { yaw }));
  return { a: p[0], s: p[1], y, yaw, r };
}
/** a point along a polyline of [x, z] at u (0…1, by length) → { x, z, dx, dz } */
export function along(pts, u) {
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let d = clamp(u) * L;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const v = seg[i] ? clamp(d / seg[i]) : 1, a = pts[i], b = pts[i + 1]; return { x: lerp(a[0], b[0], v), z: lerp(a[1], b[1], v), dx: b[0] - a[0], dz: b[1] - a[1] }; } d -= seg[i]; }
  const e = pts[pts.length - 1]; return { x: e[0], z: e[1], dx: 0, dz: -1 };
}
export const plen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
/** the camera for an act at world (x, y, z): from the place's side (off = [dx, dy, dz] amot), the act in the frame's middle */
export function follow(k, x, y, z, off) { k.view([x + off[0], y + off[1], z + off[2]], [x, y + 1.4, z]); }
/** FIGURES24's precision camera (closeup.js, on its own branch: reached through its global so this file builds either way) — the close-up at
 *  the key act, laid over the place's view */
export function close24(x, y, z, o) { try { const F = globalThis.__F24; if (F && typeof F.closeup === 'function') F.closeup({ x, y, z }, o); } catch (e) { /* */ } }
/** a breathing ring (the next thing to touch) at a world point */
export function cueW(k, M, x, y, z, r = 1.4, T = 0) { if (M.phase !== 'work') return; const p = k.loc(x, y, z); k.ring(p[0], p[1], p[2] + 0.02, (r / k.F.K) * (1 + 0.08 * Math.sin(T * 5)) * (M.pressed ? 1.22 : 1)); }
/** the same, for a work outside makeWork (kiyor.js: the model is a tapModel) */
export function cueW24(k, M, x, y, z, r, T) { const p = k.loc(x, y, z); if (M.phase !== 'work') return; k.ring(p[0], p[1], p[2] + 0.02, (r / k.F.K) * (1 + 0.08 * Math.sin(T * 5))); }
/** a word over a world point */
export function labelW(k, text, x, y, z, size = 0.3, o) { const p = k.loc(x, y, z); k.label(text, p[0], p[1], p[2], size * (k.F.A && k.F.A.inside ? 0.6 : 1.5), o); }   // (×1.5: the real place is seen from farther than the model stage)
/** a model's say / warn lines over the act (world) */
export function saysW(k, M, x, y, z) { if (M.say) labelW(k, M.say, x, y + 5.4, z, 0.34); if (M.warn) labelW(k, M.warn, x, y + 4.4, z, 0.28, { bg: 'rgba(240,244,255,.94)' }); }
/** a model's act that lasts d seconds made to last D (the real place is bigger than the model stage): slows o.t (which the model advances by dt / d) */
export function slow(o, key, d, D, dt) { if (!o || !(D > d) || !(dt > 0)) return; o[key] = Math.max(0, o[key] - (dt / d) * (1 - d / D)); }
const W2L = (k, x, y, z) => k.loc(x, y, z);

/* ───────────────────────────── תרומת הדשן on the real ramp and the real altar (תמיד א, ד; ב, א–ב) ───────────────────────────── */
const R = ANCHORS.ramp.pts, AL = ANCHORS.altar.pts;
const D_FOOT = [-33.6, 44.2], D_HEAD = [-33.6, 9.6], D_STAND = [-33.5, -2.6],   // (the stand: west of the great pyre, between it and the תפוח — 'מן הפנימיות')
      D_TURN = [-28.6, 44.0], D_LAY = [-28.4, 34.4];
const D_UP = [D_FOOT, [-33.6, 42.5], D_HEAD, D_STAND], D_DOWN = [D_STAND, D_HEAD, [-33.6, 42.5], D_FOOT], D_LAYP = [D_FOOT, D_TURN, D_LAY];
const D_DUR = { up: 3.0, down: 2.8, lay: 1.8 };
const D_BROS = [[-34.2, 1.4], [-41.6, 1.6]];
function deshenPos(M) {
  const mv = M.mv, u = mv ? ease(clamp(mv.t)) : 0;
  if (mv && mv.act === 'up') return along(D_UP, u);
  if (mv && mv.act === 'down') return along(D_DOWN, u);
  if (mv && mv.act === 'lay') return along(D_LAYP, u);
  if (M.i === 0) return { x: D_FOOT[0], z: D_FOOT[1], dx: 0, dz: -1 };
  if (M.i <= 2) return { x: D_STAND[0], z: D_STAND[1], dx: 1, dz: -0.3 };
  if (M.i === 3) return { x: D_FOOT[0], z: D_FOOT[1], dx: 1, dz: 0 };
  return { x: D_LAY[0], z: D_LAY[1], dx: -1, dz: -1.6 };
}
function deshenDrawA(k, M, T, dt) {
  if (!M) return;
  const mv = M.mv; if (mv && D_DUR[mv.act] && !M.ev27 /* ── slice27 ── (the walk waits for the coal) ── /slice27 ── */) slow(mv, 't', mv.d, D_DUR[mv.act], dt);
  const p = deshenPos(M), gy = (x, z) => (x >= -46 && x <= -30 && z > 10.5 && z <= 42.5 ? rampY(z) : z <= 10.5 && x > -52 && x < -24 ? 25 : 16);
  const y = gy(p.x, p.z), scoop = mv && mv.act === 'scoop' ? Math.sin(clamp(mv.t) * Math.PI) : 0, walking = mv && mv.from;
  const f = figW(k, p.x, p.z, { y, dir: [p.dx, p.dz], robe: ROBE.kohen, arms: 0.45 + scoop * 0.5, pose: walking ? 'walk' : scoop ? 'scoop' : 'carry', u: scoop || 1, t: T });
  // the silver מחתה in his hands (its handle along his line), full of glowing coals after the scoop
  const ca = Math.cos(f.yaw), sa = Math.sin(f.yaw), reach = 0.55 + scoop * 0.3, ha = f.a + ca * reach, hs = f.s + sa * reach, hy = f.y + 0.95 - scoop * 0.35;
  k.c(ha, hs, hy, 0.2, 0.08, SILVER); k.c(ha - ca * 0.32, hs - sa * 0.32, hy, 0.03, 0.5, SILVER, { yaw: -f.yaw, pitch: Math.PI / 2 });
  if (M.full) k.s(ha, hs, hy + 0.06, 0.16, 0.06, 0.16, '!#FFB347');
  // ── slice27 ── the steady-hands meter on the מחתה while he carries it; the ash spilt when the hands shook; the hold's fill at the top;
  // the torch in the dark (L2); the coal on the ramp (the event) — its ring, put out by one tap; the close-ups of the key moments
  const carrying = mv && (mv.act === 'up' || mv.act === 'down');
  if (carrying || M.i === 1 || M.i === 2) { const st = M.i === 1 && !mv ? clamp(M.fill || 0, 0, 1.45) / 1.45 : clamp(M.steady == null ? 1 : M.steady), w = 0.9, by = hy + 0.75, ok = M.i === 1 && !mv ? Math.abs((M.fill || 0) - 1) <= (M.l2 ? 0.08 : 0.15) : st >= (M.l2 ? 0.88 : 0.8);
    k.b(ha, hs, by, 0.06, w + 0.08, 0.14, '#3A3026', { yaw: -f.yaw });
    k.b(ha - ca * (w * (1 - st) / 2), hs - sa * (w * (1 - st) / 2), by + 0.01, 0.07, w * st + 0.001, 0.1, ok ? '!#FFD24A' : '!#9FD3F2', { yaw: -f.yaw });
    if (M.i === 1 && !mv) { const gx = (1 / 1.45) - 0.5; k.b(ha + ca * w * gx, hs + sa * w * gx, by + 0.02, 0.08, 0.05, 0.2, '!#FFFFFF', { yaw: -f.yaw }); } }
  if (M.spillT > 0) for (let z = 0; z < 4; z++) { const u = 1 - M.spillT / 0.8; k.s(ha + Math.sin(z * 2.1) * 0.2, hs + Math.cos(z * 1.7) * 0.2, hy - u * 0.9, 0.08 + u * 0.06, 0.06, 0.08 + u * 0.06, '#9C968C'); }
  if (M.l2) { k.torch(f.a, f.s, f.y + 2.0, 0.55); k.c(f.a - Math.sin(f.yaw) * 0.35, f.s + Math.cos(f.yaw) * 0.35, f.y + 1.5, 0.04, 0.6, '#6E4A2A'); flame(k, f.a - Math.sin(f.yaw) * 0.35, f.s + Math.cos(f.yaw) * 0.35, f.y + 1.85, 0.3, T); }
  if (M.ev27 && M.ev27.id === 'coal') {
    if (!M.coal) M.coal = { x: p.x - 1.6, z: p.z + 1.4, y };   // (beside him on the camera's side — the follow camera looks from the ramp's west — on the floor he walks)
    const cq = W2L(k, M.coal.x, M.coal.y + 0.12, M.coal.z), gl = 0.75 + 0.25 * Math.sin(T * 9), r0 = 0.32 / k.F.K;
    k.s(cq[0], cq[1], cq[2], r0, r0 * 0.6, r0, '!#FFA040'); k.s(cq[0], cq[1], cq[2] + r0 * 0.4, r0 * 0.55 * gl, r0 * 0.45, r0 * 0.55 * gl, '!#FFE08A'); k.torch(cq[0], cq[1], cq[2] + 0.6, 0.5 * gl);
    cueW(k, { phase: 'work', pressed: M.pressed }, M.coal.x, M.coal.y, M.coal.z, 1.2, T); labelW(k, 'הקישו — כבו את הגחלת', M.coal.x, M.coal.y + 1.7, M.coal.z, 0.17, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' });
    close24(M.coal.x, M.coal.y + 0.4, M.coal.z, { dist: 11, el: 0.6, hold: 0.6, key: 'deshen-coal' } /* (world amot: the figures stand at K 2.3 — the kit's 5–7 ×1.5) */);
    try { const sc = k.screen(cq[0], cq[1], cq[2]); globalThis.__S27COAL = { x: Math.round(sc.x), y: Math.round(sc.y) }; pick27([{ id: 'coal', x: sc.x, y: sc.y }], () => { if (!M.ev27) return false; evResolve(M, (pts, say) => caBonus(M, pts, say)); return true; }, 110); } catch (e) { /* */ }
  } else { if (M.coal && M.evPut > 0) { const cq = W2L(k, M.coal.x, M.coal.y + 0.1, M.coal.z), u = M.evPut / 0.8; k.s(cq[0], cq[1], cq[2] + (1 - u) * 1.2 / k.F.K, 0.3 * (1.6 - u) / k.F.K, 0.25 / k.F.K, 0.3 * (1.6 - u) / k.F.K, '#C8C3BA'); } if (globalThis.__S27COAL) { globalThis.__S27COAL = null; pick27([], null); } }
  if (M.i === 1 && (M.hold27 || (mv && mv.act === 'scoop'))) close24(AL.great[0] - 1.5, 25.6, AL.great[2], { dist: 10, el: 0.55, hold: 0.6, key: 'deshen-scoop' });
  else if (mv && mv.act === 'lay' && mv.t > 0.6) close24(R.deshen[0], 16.4, R.deshen[2], { dist: 10, el: 0.55, hold: 0.8, key: 'deshen-lay' });
  // ── /slice27 ──
  // the coals heaped on the floor east of the ramp ("רחוק מן הכבש שלשה טפחים")
  if (M.pile || (mv && mv.act === 'lay' && mv.t > 0.85)) { const u = M.pile ? 1 : clamp((mv.t - 0.85) / 0.15); k.ws(R.deshen[0], 16.12, R.deshen[2], 0.75 * u, 0.3 * u, 0.75 * u, '#6F655A'); k.ws(R.deshen[0], 16.22, R.deshen[2], 0.42 * u, 0.14 * u, 0.42 * u, '!#E8A050'); }
  // his brothers raise the ashes on the תפוח (the world's heap in the middle of the top) — two with shovels; the heap grows a little
  const ashU = M.ash + (mv && mv.act === 'ash' ? clamp(mv.t) : 0);
  if (M.i >= 3 || ashU > 0) for (let j = 0; j < 2; j++) {
    const b = D_BROS[j], sw = mv && mv.act === 'ash' && (M.ash % 2) === j ? Math.sin(clamp(mv.t) * Math.PI) : 0;
    const g = figW(k, b[0], b[1], { y: 25, face: [AL.tapuach[0], AL.tapuach[2]], robe: ROBE.kohen, arms: 0.3 + sw * 0.6, skin: SKIN[j + 1], pose: 'scoop', u: sw, t: T });
    const c2 = Math.cos(g.yaw), s2 = Math.sin(g.yaw); k.c(g.a + c2 * 0.7, g.s + s2 * 0.7, g.y + 0.6 + sw * 0.5, 0.17, 0.05, SILVER);
  }
  if (ashU > 0) k.ws(AL.tapuach[0] + 0.6, 26.4, AL.tapuach[2] + 1.6, 0.7 + ashU * 0.3, 0.35 + ashU * 0.16, 0.7 + ashU * 0.3, ASH);
  // the fire he takes from (the world's great pyre): his light on the coals while he scoops
  if (M.i <= 2) { const q = W2L(k, AL.great[0] - 2.5, 29.5, AL.great[2]); k.torch(q[0], q[1], q[2], 0.06); }   // ── slice27 ── (all but off: at 26.2 the kit's light blew the pyre out to a white blot over him — the pyre has its own glow) ── /slice27 ──
  // the next place to touch
  if (!mv && M.phase === 'work') {
    const t = M.i === 0 ? [D_FOOT[0], 16, D_FOOT[1]] : M.i === 1 ? [D_STAND[0] + 1.4, 25, D_STAND[1] - 0.4] : M.i === 2 ? [D_HEAD[0], 25, D_HEAD[1]] : M.i === 3 ? [R.deshen[0], 16, R.deshen[2]] : [AL.tapuach[0] + 1.8, 25, AL.tapuach[2] + 3.2];
    cueW(k, M, t[0], t[1], t[2], 1.5, T);
  }
  saysW(k, M, p.x, y, p.z);
  // the camera: beside the act, from the south-east (the ramp and the top both in sight)
  const ax = M.i >= 4 && !mv ? AL.tapuach[0] + 2 : p.x, az = M.i >= 4 && !mv ? AL.tapuach[2] + 2 : p.z, ay = M.i >= 4 && !mv ? 25 : y;
  follow(k, ax, ay, az, ay > 24 ? [1.5, 9.5, 14] : [-11, 10, 16]);   // (on the ramp: from its west side — the אמרכל, east of it, is never between; on the top: from the south, the pyre and the תפוח either side of him)
}
const deshenTargetA = (M, k) => { const p = deshenPos(M), y = p.z <= 10.5 && p.x > -52 ? 25 : p.z < 42.5 && p.x < -30 ? rampY(p.z) : 16; return k.loc(p.x, y + 2.8, p.z); };

/* ───────────────────────────── המערכה on the real altar's top (תמיד ב, ג–ה) ───────────────────────────── */
// the wood, brought up the ramp: a pile at the ramp's head; the great pyre (the world's, at the east) gets six new logs on top, the second
// (the ketoret's, by the south-west horn) two, the third (קיום האש, R. Yosi) one — north of the great one (⚑ illustration)
const M_PILE = [-35.2, 7.4];
const M_ARR = [{ x: AL.great[0], z: AL.great[2], y: 27.4, n: 6 }, { x: AL.ketoret[0], z: AL.ketoret[2], y: 26.4, n: 2 }, { x: -30.5, z: -11.5, y: 25.2, n: 1 }];
const mSlot = (j) => { let x = j; for (let r = 0; r < 3; r++) { if (x < M_ARR[r].n) return { r, x }; x -= M_ARR[r].n; } return { r: 2, x: 0 }; };
function mLog(r, x) { const A = M_ARR[r]; if (r === 0) { const lay = x / 3 | 0, c = x % 3; return lay % 2 ? { x: A.x + (c - 1) * 1.1, z: A.z, y: A.y + 0.3 + lay * 0.42, yaw: Math.PI / 2 } : { x: A.x, z: A.z + (c - 1) * 1.1, y: A.y + lay * 0.42, yaw: 0 }; } return { x: A.x, z: A.z + (x - 0.5) * 0.7, y: A.y + x * 0.3, yaw: x ? Math.PI / 2 : 0 }; }
const mStand = (t) => { const dx = M_PILE[0] - t.x, dz = M_PILE[1] - t.z, l = Math.hypot(dx, dz) || 1; return [t.x + dx / l * 2.6, t.z + dz / l * 2.6]; };
function maarachaDrawA(k, M, T, dt) {
  if (!M) return;
  const f = M.fly;
  // (the real top is bigger than the model's: the carry lasts by its length — ~2 s)
  const tgtOf = (fl) => (fl.light ? { x: M_ARR[0].x + 2.4, z: M_ARR[0].z + 2.2, y: 25 } : (() => { const { r, x } = mSlot(fl.j); return mLog(r, x); })());
  if (f) { const t = tgtOf(f), D = 0.55 + Math.hypot(t.x - M_PILE[0], t.z - M_PILE[1]) / 13; slow(f, 't', f.light ? 0.7 : 0.55, D, dt); }
  // the logs laid on the pyres
  for (let j = 0; j < M.laid; j++) { const { r, x } = mSlot(j), p = mLog(r, x); k.wc(p.x, p.y, p.z, r === 0 ? 0.24 : 0.17, r === 0 ? 3.0 : 2.0, WOODS[M.kinds[j] | 0], { yaw: p.yaw - k.F.yaw, pitch: Math.PI / 2 }); }
  // the pile from the wood chamber (fig, walnut, pine — never olive or vine)
  const left = Math.max(0, 9 - M.laid - (f && !f.light ? 1 : 0));
  for (let j = 0; j < left; j++) k.wc(M_PILE[0] + (j % 3 - 1) * 0.62, 25.25 + (j / 3 | 0) * 0.5, M_PILE[1], 0.24, 2.6, WOODS[j % 3], { yaw: Math.PI / 2 - k.F.yaw, pitch: Math.PI / 2 });
  if (left) labelW(k, 'תאנה · אגוז · עץ שמן', M_PILE[0], 27.6, M_PILE[1], 0.24);
  // the kohen carrying the log from the pile to its place (or the torch to the great pyre)
  let px = M_PILE[0] + 1.2, pz = M_PILE[1] - 1.6, dir = [1, -1];
  if (f) { const t = tgtOf(f), st = f.light ? [t.x, t.z] : mStand(t), u = ease(clamp(f.t)); px = lerp(M_PILE[0] + 1.0, st[0], u); pz = lerp(M_PILE[1] - 1.4, st[1], u); dir = [st[0] - (M_PILE[0] + 1.0), st[1] - (M_PILE[1] - 1.4)]; if (u >= 0.98) dir = [t.x - st[0], t.z - st[1]]; }
  const g = figW(k, px, pz, { y: 25, dir, robe: ROBE.kohen, arms: (f && !f.light) || (!f && M.laid < 9 && M.phase === 'work') /* ── slice27 ── ── /slice27 ── */ ? 0.55 : 0.15, torch: f && f.light ? 1 : 0, t: T, pose: f && !f.light ? 'carry' : f ? 'torch' : M.laid < 9 && M.phase === 'work' ? 'carry' /* ── slice27 ── ── /slice27 ── */ : 'stand', u: 1 });
  if (f && !f.light) { const c = Math.cos(g.yaw), s = Math.sin(g.yaw); k.c(g.a + c * 0.45, g.s + s * 0.45, g.y + 0.9, f.big ? 0.13 : 0.1, f.big ? 1.3 : 1.05, WOODS[f.j % 3], { yaw: -g.yaw + Math.PI / 2, pitch: Math.PI / 2 }); }
  else if (!f && M.phase === 'work' && M.laid < 9) { const c = Math.cos(g.yaw), s = Math.sin(g.yaw); k.c(g.a + c * 0.45, g.s + s * 0.45, g.y + 0.9, 0.11, 1.05, WOODS[M.laid % 3], { yaw: -g.yaw + Math.PI / 2, pitch: Math.PI / 2 }); }   // ── slice27 ── (the next log already in his arms: the tool in his hand) ── /slice27 ──
  // the fire catching on both pyres (orange and gold — never red)
  const h = M.heat;
  if (h > 0.02) {
    for (let j = 0; j < 5; j++) { const q = W2L(k, M_ARR[0].x + Math.cos(j * 1.3) * 1.4, M_ARR[0].y + 1.0, M_ARR[0].z + Math.sin(j * 1.3) * 1.4); flame(k, q[0], q[1], q[2], (0.5 + 0.6 * h) * (1 + 0.1 * Math.sin(T * 5 + j)), T + j); }
    const q2 = W2L(k, M_ARR[1].x, M_ARR[1].y + 0.5, M_ARR[1].z); flame(k, q2[0], q2[1], q2[2], 0.5 * h, T + 7);
    const qt = W2L(k, M_ARR[0].x - 2, 31, M_ARR[0].z); k.torch(qt[0], qt[1], qt[2], 0.05 + 0.15 * h);   /* ── slice27 ── (softer, higher: no white blot) ── /slice27 ── */
  }
  // the names of the three, and the next place to touch
  const NAMES = ['המערכה הגדולה', 'מערכה שנייה — לקטורת', 'שלישית — קיום האש'];   // ── slice27 ── (the second and third say what they are for) ── /slice27 ──
  // ── slice27 ── the three spots marked on the top (a disc each; L2: unnamed after the first log), the screen places for the aimed drag,
  // a wrong spot flashes its own name; the close-up as the log lands
  const hideN = M.l2 && M.laid >= 1 && M.phase === 'work';
  for (let r = 0; r < 3; r++) if (!(M.phase !== 'work' && r) && !hideN) labelW(k, NAMES[r], M_ARR[r].x, M_ARR[r].y + 3.6, M_ARR[r].z, 0.24);
  if (M.phase === 'work') for (let r = 0; r < 3; r++) { const q = W2L(k, M_ARR[r].x, 25.08, M_ARR[r].z), wr = M.wrong27 && M.wrong27.r === r; k.ring(q[0], q[1], q[2], (r ? 1.1 : 1.6) / k.F.K, wr ? '!#BFE0FF' : '!#E2B84A', 16); if (wr) labelW(k, MAAR27_WRONG[r], M_ARR[r].x, M_ARR[r].y + 2.4, M_ARR[r].z, 0.26, { bg: 'rgba(225,238,255,.96)' }); }
  M.w27 = { o: [px, pz], spots: M_ARR.map((A) => [A.x, A.z]) };
  if (M.land27) { const A = M_ARR[M.land27.r], q = W2L(k, A.x, A.y + 0.4, A.z), u = 1 - M.land27.t / 0.9; for (let j = 0; j < 3; j++) k.ring(q[0], q[1], q[2] + j * 0.3 / k.F.K, (1.2 + u * 3.2 - j * 0.5) / k.F.K, j ? '!#FFE9A6' : '!#FFD24A', 22); for (let j = 0; j < 8; j++) { const t = j / 8 * Math.PI * 2, rr = (0.8 + u * 2.6) / k.F.K; k.s(q[0] + Math.cos(t) * rr, q[1] + Math.sin(t) * rr, q[2] + (0.5 + u * 1.6) / k.F.K, 0.18 / k.F.K, 0.18 / k.F.K, 0.18 / k.F.K, '!#FFE08A'); } }   // (the right spot answers: gold rings and sparks)
  try { const o = k.screen(g.a, g.s, g.y + 1.0), sp = M_ARR.map((A) => { const q = W2L(k, A.x, A.y, A.z); const p = k.screen(q[0], q[1], q[2]); return { x: Math.round(p.x), y: Math.round(p.y) }; }); M.scr27 = { o: { x: Math.round(o.x), y: Math.round(o.y) }, spots: sp }; globalThis.__S27M = M.scr27; } catch (e) { /* */ }
  if (f && !f.light) { const t = tgtOf(f), u = clamp(f.t); close24(lerp(px, t.x, 0.5), 25.6, lerp(pz, t.z, 0.5), { dist: 11, el: 0.65, hold: 0.7, key: 'maaracha' });
    for (let z = 0; z < 10; z++) { const v = z / 9; if (v < u - 0.05) continue; const q = W2L(k, lerp(px, t.x, v), 25.3 + Math.sin(v * Math.PI) * 2.4, lerp(pz, t.z, v)); k.s(q[0], q[1], q[2], 0.9 / k.F.K, 0.9 / k.F.K, 0.9 / k.F.K, '!#FFD24A'); }   // (the aimed way: gold beads from him to the spot — big enough to read from the wide frame)
    const tq = W2L(k, t.x, 25.08, t.z); k.ring(tq[0], tq[1], tq[2], (1.4 + 0.5 * Math.sin(u * Math.PI)) / k.F.K, '!#FFE9A6', 18); }
  // ── /slice27 ──
  let tgt = null;
  if (!f && M.phase === 'work') { tgt = M.laid >= 9 ? { x: M_ARR[0].x, z: M_ARR[0].z, y: 27 } : (() => { const { r, x } = mSlot(M.laid); return mLog(r, x); })(); if (!hideN) cueW(k, M, tgt.x, 25, tgt.z, 1.6, T); }   // ── slice27 ── (L2: no ring on the right one) ── /slice27 ──
  // the ממונה at the east edge, pointing at the great pyre
  figW(k, -26.2, -9.0, { y: 25, face: [M_ARR[0].x, M_ARR[0].z], robe: ROBE.kohen, cap: '#B59B62', arms: 0.35, skin: SKIN[2], pose: 'point', u: 1, t: T });
  saysW(k, M, px, 25, pz);
  // the camera: over the east edge, the kohen and where his log goes both in the frame
  const fx = f ? lerp(px, tgtOf(f).x, 0.5) : tgt ? lerp(px, tgt.x, 0.5) : px, fz = f ? lerp(pz, tgtOf(f).z, 0.5) : tgt ? lerp(pz, tgt.z, 0.5) : pz;
  if (!f && M.phase === 'work') { const cx = (M_ARR[0].x + M_ARR[1].x + M_ARR[2].x + M_PILE[0]) / 4, cz = (M_ARR[0].z + M_ARR[1].z + M_ARR[2].z + M_PILE[1]) / 4; follow(k, cx - 3, 25, cz - 1, [2, 34, 30]); }   // ── slice27 ── (between the logs: the pile and all three spots in the frame, from higher — the aim's targets) ── /slice27 ──
  else follow(k, fx, 25, fz, [10.5, 9.5, 11.5]);
}
const maarachaTargetA = (M, k) => { if (M.laid >= 9) return k.loc(M_ARR[0].x, 28.5, M_ARR[0].z); const { r, x } = mSlot(M.laid), p = mLog(r, x); return k.loc(p.x, p.y + 1.2, p.z); };

/* ───────────────────────────── the Heichal: the camera inside the door, the real menorah and golden altar ───────────────────────────── */
/** the world's sanctuary (sanctuary.js API: setLamps, setGoldAltar, setDoors, lampPosition) — through the works' ctx, else the test global */
export function sanct() { try { const c = getCtx(), w = c && c.world; if (w && w.sanctuary) return w.sanctuary; } catch (e) { /* */ } try { return (globalThis.__T && globalThis.__T.sanctuary) || null; } catch (e) { return null; } }
const SAFE = (f) => { try { return f(); } catch (e) { return null; } };
/** the seven lamps by place, west → east: [{ i (the sanctuary's index), x, y, z }] */
export function lampsWE() {
  const S = sanct(); const out = [];
  for (let i = 0; i < 7; i++) { const p = S && S.lampPosition ? SAFE(() => S.lampPosition(i)) : null; out.push(p ? { i, x: p.x, y: p.y, z: p.z } : { i, x: -125 - 1.3 + i * 0.43, y: 25.0, z: 7.5 }); }
  return out.sort((a, b) => a.x - b.x);
}
const levels = (byWE) => { const L = new Array(7).fill(0), W = lampsWE(); for (let j = 0; j < 7; j++) L[W[j].i] = byWE[j] || 0; return L; };
const MA = ANCHORS.menorah.pts, GA = ANCHORS.golden.pts;
const GA_STAND = [GA.top[0] + 1.5, GA.top[2] + 0.5], MEN_STAND = [MA.stone[0] - 0.3, MA.stone[2] + 0.1], MEN_STONE_Y = 22.9;
/** the heichal work (dawn2.js heichal): the dishun of the golden altar (2 acts), then five lamps tended (TEND, west → east); the two eastern left alight */
const H_TEND = [0, 1, 2, 3, 4], H_BURN = [5, 6];
function heichalDrawA(k, M, T) {
  if (!M) return;
  const S = sanct();
  if (!M.__p24) { M.__p24 = 1; SAFE(() => { S.setDoors(1); S.setLamps(levels([0, 0, 0, 0, 0, 1, 1])); S.setGoldAltar({ coals: 0.5, smoke: 0 }); }); }
  const lamps = lampsWE(), atAltar = M.i < 2 || (M.i === 2 && M.anim > 0.4);
  if (atAltar) k.anchor('golden'); else k.anchor('menorah');
  // the lamps tended: a fresh wick and oil, a small steady light (the sanctuary's own flames)
  const want = [0, 0, 0, 0, 0, 1, 1]; for (let j = 0; j < 5; j++) if (M.tended[H_TEND[j]]) want[j] = 0.55;
  if (M.__w !== want.join()) { M.__w = want.join(); SAFE(() => S.setLamps(levels(want))); }
  const reach = M.anim > 0 ? Math.sin(clamp(1 - M.anim / 0.42) * Math.PI) : 0;
  if (atAltar) {
    // the dishun: he scoops the ash of the golden altar into the טני (gold), then sweeps the rest
    const f = figW(k, GA_STAND[0], GA_STAND[1], { y: 22, face: [GA.top[0], GA.top[2]], robe: ROBE.kohen, arms: 0.35 + reach * 0.5, skin: SKIN[1], pose: 'scoop', u: reach, t: T });
    k.wc(GA.top[0] + 1.1, 22.25, GA.top[2] - 1.0, 0.32, 0.5, GOLD); if (M.tani) k.ws(GA.top[0] + 1.1, 22.52, GA.top[2] - 1.0, 0.28, 0.08 * M.tani, 0.28, ASH);
    if (reach > 0.1) k.ws(GA.top[0] + 0.5, GA.top[1] + 0.1, GA.top[2] + 0.1, 0.12, 0.08, 0.12, ASH);
    if (M.anim <= 0 && M.phase === 'work') cueW(k, M, GA.top[0], GA.top[1], GA.top[2], 0.8, T);
    void f; follow24(k, 'golden');
  } else {
    // on the stone of three steps before the menorah, turning to each lamp in turn
    const j = H_TEND[Math.min(H_TEND.length - 1, M.i - 2)], L = lamps[j];
    figW(k, MEN_STAND[0], MEN_STAND[1], { y: MEN_STONE_Y, face: [L.x, L.z], robe: ROBE.kohen, arms: 0.5 + reach * 0.5, skin: SKIN[1], pose: 'reach', u: 0.6 + reach * 0.4, t: T });
    if (M.anim <= 0 && M.phase === 'work') { const q = k.loc(L.x, L.y + 0.25, L.z); k.s(q[0], q[1], q[2], 0.07 + 0.015 * Math.sin(T * 6), 0.07, 0.07, '!#FFF3C4'); k.ring(q[0], q[1], q[2] - 0.12, 0.16 * (M.pressed ? 1.3 : 1), '!#FFD24A', 12); }
    labelW(k, 'שני הנרות המזרחיים — דולקים', lamps[6].x + 0.4, lamps[6].y + 1.6, lamps[6].z, 0.2);
    follow24(k, 'menorah'); close24(L.x, L.y - 0.5, L.z, { dist: 5, el: 0.36, hold: 0.6, key: 'heichal', inside: true });
  }
  labelW(k, 'האמרכל בפתח — הכהן לבדו בפנים', -101, 27.5, 0, 0.22);
  if (M.say) labelW(k, M.say, -122.5, 26.4, 3.6, 0.28);
}
const heichalTargetA = (M, k) => { if (M.i < 2) return k.loc(GA.top[0], GA.top[1] + 0.8, GA.top[2]); const L = lampsWE()[H_TEND[Math.min(H_TEND.length - 1, M.i - 2)]]; return k.loc(L.x, L.y + 0.6, L.z); };
/** the place's own view (its anchor's), held */
export function follow24(k, id) { const A = ANCHORS[id]; if (A && A.view) k.view(A.view.p, A.view.t); }
const heichalEndA = () => { const S = sanct(); setTimeout(() => SAFE(() => { S.setLamps(1); S.setGoldAltar({ coals: 1, smoke: 0 }); }), 3500); };

/** the evening (tamid.js neirot): the coals heaped on the golden altar, "הקטר!", the bow; then the lamps lit one from another from the
 *  western one (LIGHT_ORDER of the model: by the row's place — the western lamp drawn as the middle one, ⚑ מחלוקת as TAMIDB23 had it) */
const N_ORDER = [2, 4, 1, 5, 0, 6], N_WEST = 3;
function neirotDrawA(k, M, T) {
  if (!M) return;
  const S = sanct();
  if (!M.__p24) { M.__p24 = 1; SAFE(() => { S.setDoors(1); S.setLamps(levels([0, 0, 0, 1, 0, 0, 0])); S.setGoldAltar({ coals: 0, smoke: 0 }); }); }
  const lamps = lampsWE(), lit = [0, 0, 0, 1, 0, 0, 0];
  for (let j = 0; j < 7; j++) if (j !== N_WEST && M.lightT[j] >= 0) lit[j] = clamp((M.t - M.lightT[j]) / 0.35);
  const key = lit.map((v) => (v > 0.5 ? 1 : 0)).join() + '|' + (M.coals ? 1 : 0) + (M.smoke > 0 ? 1 : 0);
  if (M.__w !== key) { M.__w = key; SAFE(() => { S.setLamps(levels(lit.map((v) => (v > 0.5 ? 1 : 0)))); S.setGoldAltar({ coals: M.coals ? 1 : 0, smoke: M.smoke > 0 ? 1 : 0 }); }); }
  const bow = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (1 - clamp((M.t - M.bowT - 0.9) * 2)) : 0;
  if (M.i < 3) {
    k.anchor('golden');
    figW(k, GA_STAND[0], GA_STAND[1], { y: 22, face: [GA.top[0], GA.top[2]], robe: ROBE.kohen, arms: M.i < 1 ? 0.55 : 0.4, lean: bow * 0.9, pose: bow > 0.05 ? 'bow' : 'pour', u: bow > 0.05 ? bow : 0.5, t: T });
    if (!M.coals) k.wc(GA_STAND[0] - 0.6, 24.0, GA_STAND[1] - 0.1, 0.32, 0.08, SILVER);
    if (M.phase === 'work') cueW(k, M, GA.top[0], GA.top[1], GA.top[2], 0.8, T);
    if (M.i === 1) labelW(k, 'הקטר!', GA.top[0] + 2.4, 26.6, -1.2, 0.3);
    follow24(k, 'golden'); if (M.smoke > 0) close24(GA.top[0], GA.top[1] + 0.8, GA.top[2], { dist: 6, el: 0.42, hold: 0.5, key: 'neirot-cloud', inside: true });
  } else {
    k.anchor('menorah');
    const nx = N_ORDER[Math.min(N_ORDER.length - 1, M.i - 3)], L = lamps[nx];
    figW(k, MEN_STAND[0], MEN_STAND[1], { y: MEN_STONE_Y, face: [L.x, L.z], robe: ROBE.kohen, arms: 0.75, pose: 'reach', u: 0.9, t: T });
    // the light carried from lamp to lamp (a small gold spark)
    for (let j = 0; j < 7; j++) if (j !== N_WEST && M.lightT[j] >= 0 && M.t - M.lightT[j] < 0.35) { const u = (M.t - M.lightT[j]) / 0.35, fr = lamps[j < N_WEST ? j + 1 : j - 1], to = lamps[j]; const q = k.loc(lerp(fr.x, to.x, u), lerp(fr.y, to.y, u) + Math.sin(u * Math.PI) * 0.2, to.z); k.s(q[0], q[1], q[2], 0.03, 0.05, 0.03, '!#FFD76A'); }
    if (M.phase === 'work') { const q = k.loc(L.x, L.y + 0.25, L.z); k.s(q[0], q[1], q[2], 0.07 + 0.015 * Math.sin(T * 6), 0.07, 0.07, '!#FFF3C4'); }
    labelW(k, 'הנר המערבי', lamps[N_WEST].x, lamps[N_WEST].y + 1.5, lamps[N_WEST].z, 0.2);
    follow24(k, 'menorah'); close24(L.x, L.y - 0.5, L.z, { dist: 5, el: 0.38, hold: 0.5, key: 'neirot', inside: true });
  }
  if (M.say) labelW(k, M.say, -121.5, 27.2, 3.6, 0.28);
}
const neirotTargetA = (M, k) => { if (M.i < 3) return k.loc(GA.top[0], GA.top[1] + 0.8, GA.top[2]); const L = lampsWE()[N_ORDER[Math.min(N_ORDER.length - 1, M.i - 3)]]; return k.loc(L.x, L.y + 0.6, L.z); };
const neirotEndA = () => { const S = sanct(); setTimeout(() => SAFE(() => { S.setLamps(1); S.setGoldAltar({ coals: 1, smoke: 0 }); }), 4000); };

/** the morning ketoret (tamid.js ketoret, 9 acts) across its real places: the פרס brought from בית אבטינס (the grinding: המחשה, at the
 *  steps' foot), the בזך filled; the מחתה of coals from the second pyre on the altar's top (by the south-west horn); the מגרפה thrown
 *  between the Ulam and the altar (the Levites run); then inside — the coals heaped on the golden altar, "הקטר!", the cloud, the bow */
const K_MORTAR = [-56.4, 9.6], K_K1 = [-57.8, 7.6], K_K2 = [-47.6, 8.4], K_MAG = [-58.5, -1.5];
const stepsY = (x, z) => ANCHORS.steps && (x > -76.2 && x < -54.5 ? 16 + 0.5 * [-55, -56, -57, -60, -61, -62, -65, -66, -67, -70, -71, -72].filter((xr) => x <= xr).length : 16) + 0 * z;
function ketoretDrawA(k, M, T) {
  if (!M) return;
  const S = sanct();
  if (!M.__p24) { M.__p24 = 1; SAFE(() => { S.setDoors(1); S.setGoldAltar({ coals: 0, smoke: 0 }); }); }
  const key = (M.coals ? 1 : 0) + '' + (M.smoke > 0 ? 1 : 0); if (M.__w !== key) { M.__w = key; SAFE(() => S.setGoldAltar({ coals: M.coals ? 1 : 0, smoke: M.smoke > 0 ? 1 : 0 })); }
  const i = M.i, g = Math.min(3, i);
  if (i <= 3 || i === 5) {
    k.anchor('steps');
    // בית אבטינס's פרס at the steps' foot (the grinding: המחשה) — the mortar, the pestle, the powder; the כף and the בזך
    const my = stepsY(K_MORTAR[0], K_MORTAR[1]);
    k.wc(K_MORTAR[0], my + 0.8, K_MORTAR[1], 0.75, 1.6, '#B9AC8E'); k.wc(K_MORTAR[0], my + 1.62, K_MORTAR[1], 0.6, 0.06, '#3E372E');
    if (g > 0) k.ws(K_MORTAR[0], my + 1.6, K_MORTAR[1], 0.5, 0.1 + 0.07 * g, 0.5, '#C9A97A');
    const last = M.since(Math.max(0, Math.min(2, i - 1))), fall = i <= 3 && last >= 0 && last < 0.18;
    k.wc(K_MORTAR[0] + 0.1, my + (i < 3 ? (fall ? 2.2 : 3.2) : 2.6), K_MORTAR[1], 0.12, 2.0, '#7A5535');
    figW(k, K_MORTAR[0] + 1.6, K_MORTAR[1] + 0.4, { face: K_MORTAR, robe: ROBE.worker, cap: '#5C5242', skin: SKIN[2], arms: i < 3 ? (fall ? 0.45 : 0.85) : 0.2, pose: 'hold', u: 1, t: T });
    labelW(k, 'הפרס מבית אבטינס (המחשה)', K_MORTAR[0], my + 5.6, K_MORTAR[1], 0.24);
    const f1 = figW(k, K_K1[0], K_K1[1], { face: K_MORTAR, robe: ROBE.kohen, arms: i >= 3 ? 0.55 : 0.15, pose: i >= 3 ? 'carry' : 'stand', u: 1, t: T });
    const ca = Math.cos(f1.yaw), sa = Math.sin(f1.yaw); k.c(f1.a + ca * 0.4, f1.s + sa * 0.4, f1.y + 0.95, 0.24, 0.12, GOLD); if (i > 3) k.s(f1.a + ca * 0.4, f1.s + sa * 0.4, f1.y + 1.04, 0.2, 0.09, 0.2, '#C9A97A');
    if (i === 5 || i > 5) {
      // the מגרפה flies and lands between the Ulam and the altar; a shock ring; the Levites run to the דוכן
      const tm = M.since(5), u = clamp(tm / 0.5), mx = lerp(K_MAG[0] + 3, K_MAG[0], u), mz = lerp(K_MAG[1] + 2, K_MAG[1], u), myy = stepsY(mx, mz) + 0.2 + Math.sin(u * Math.PI) * 3.5;
      if (tm >= 0) { k.wc(mx, myy, mz, 0.08, 2.6, '#A7834F', { pitch: Math.PI / 2, yaw: 0.6 + u * 4 }); if (tm > 0.5 && tm < 1.4) { const v = (tm - 0.5) / 0.9, q = k.loc(K_MAG[0], stepsY(K_MAG[0], K_MAG[1]) + 0.1, K_MAG[1]); k.ring(q[0], q[1], q[2], (0.6 + v * 3.6), '!#FFE9B0', 22); } }
      for (let j = 0; j < 3; j++) { const v = clamp((tm - 0.4) / 1.6), x = lerp(-62 - j * 1.6, -56.6, v), z = lerp(-6 - j * 1.6, -9 - j * 1.4, v); figW(k, x, z, { dir: [1, -0.4], robe: ROBE.levi, skin: SKIN[j % 3], pose: v > 0 && v < 1 ? 'walk' : 'stand', t: T * 1.4 }); }
    } else if (i === 4 || i < 5) { k.wc(K_MAG[0] + 3, stepsY(K_MAG[0] + 3, K_MAG[1] + 2) + 0.1, K_MAG[1] + 2, 0.08, 2.6, '#A7834F', { pitch: Math.PI / 2, yaw: 0.6 }); }
    if (M.phase === 'work') { if (i < 3) cueW(k, M, K_MORTAR[0], my, K_MORTAR[1], 1.4, T); else if (i === 3) cueW(k, M, K_K1[0], stepsY(K_K1[0], K_K1[1]), K_K1[1], 1.1, T); else cueW(k, M, K_MAG[0] + 3, stepsY(K_MAG[0] + 3, 0.5), K_MAG[1] + 2, 1.4, T); }
    const cx = i === 5 ? K_MAG[0] + 1 : K_MORTAR[0] - 0.8, cz = i === 5 ? K_MAG[1] + 1 : K_MORTAR[1] - 1.2;
    follow(k, cx, stepsY(cx, cz), cz, [13, 8.5, 13]);
  } else if (i === 4) {
    k.anchor('altar');
    // the מחתה of silver: coals from the second pyre (the world's, by the south-west horn)
    const f2 = figW(k, K_K2[0], K_K2[1], { y: 25, face: [AL.ketoret[0], AL.ketoret[2]], robe: ROBE.kohen, skin: SKIN[1], arms: 0.5, pose: 'scoop', u: M.busy > 0 ? 1 : 0.4, t: T });
    const ca = Math.cos(f2.yaw), sa = Math.sin(f2.yaw); k.c(f2.a + ca * 0.5, f2.s + sa * 0.5, f2.y + 0.9, 0.2, 0.05, SILVER);
    if (M.pan) for (let j = 0; j < 4; j++) k.s(f2.a + ca * 0.5 + Math.cos(j * 1.6) * 0.08, f2.s + sa * 0.5 + Math.sin(j * 1.6) * 0.08, f2.y + 0.95, 0.07, 0.05, 0.07, '!#FFB347');
    cueW(k, M, AL.ketoret[0], 25, AL.ketoret[2], 1.4, T);
    follow(k, AL.ketoret[0] + 1, 25, AL.ketoret[2] + 1, [12, 9, 13]);
  } else {
    k.anchor('golden');
    // inside: the coals heaped on the golden altar (the sanctuary's own coals), "הקטר!" — the ketoret on the coals, the cloud; the bow
    const bow = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (M.t - M.bowT < 1.2 ? 1 : 0) : 0;
    figW(k, GA_STAND[0], GA_STAND[1], { y: 22, face: [GA.top[0], GA.top[2]], robe: ROBE.kohen, arms: 0.5, lean: bow * 0.9, pose: bow > 0.05 ? 'bow' : 'pour', u: bow > 0.05 ? bow : 0.6, t: T });
    if (i === 6) { figW(k, GA_STAND[0] + 0.4, GA_STAND[1] - 2.2, { y: 22, face: [GA.top[0], GA.top[2]], robe: ROBE.kohen, skin: SKIN[1], arms: 0.5, pose: 'carry', u: 1, t: T }); }
    if (i === 7) labelW(k, 'הקטר!', GA.top[0] + 2.4, 26.6, -1.2, 0.3);
    if (M.phase === 'work') cueW(k, M, GA.top[0], GA.top[1], GA.top[2], 0.8, T);
    follow24(k, 'golden'); if (M.smoke > 0 && (M.bowT < 0 || M.t - M.bowT < 1.8)) close24(GA.top[0], GA.top[1] + 1.0, GA.top[2], { dist: 6, el: 0.42, hold: 0.5, key: 'ketoret', inside: true });
  }
  if (M.say) { const t = ketoretTargetA(M, k); k.label(M.say, t[0], t[1], t[2] + 1.6 / k.F.K * 2, 0.3); }
}
function ketoretTargetA(M, k) {
  const i = M.i;
  if (i < 3) return k.loc(K_MORTAR[0], stepsY(K_MORTAR[0], K_MORTAR[1]) + 2.2, K_MORTAR[1]);
  if (i === 3) return k.loc(K_K1[0], stepsY(K_K1[0], K_K1[1]) + 3, K_K1[1]);
  if (i === 4) return k.loc(AL.ketoret[0], 27.5, AL.ketoret[2]);
  if (i === 5) return k.loc(K_MAG[0], stepsY(K_MAG[0], K_MAG[1]) + 1.5, K_MAG[1]);
  return k.loc(GA.top[0], GA.top[1] + 0.8, GA.top[2]);
}
const ketoretEndA = () => { const S = sanct(); setTimeout(() => SAFE(() => S.setGoldAltar({ coals: 1, smoke: 0 })), 4000); };

/* ───────────────────────────── פתיחת השערים at Nikanor's real opening (סוכה ה, ה; תמיד ג, ז) ───────────────────────────── */
// The gate (temple.js) is an opening 10 wide and 20 high in the gatehouse, with no leaves: the work hangs the two leaves (bronze) on the
// opening's inner face and the wicket beside it — the props the place lacks; they swing east, into the gatehouse, away from him.
const NK = ANCHORS.nikanor.pts, NK_X = 10.55, NK_Y = 13.5, LEAF_W = 5, LEAF_H = 19.8;
const NK_TRUMP = [[14.6, -3.8], [14.6, 3.8]], NK_LEV = [[11.9, -2.6], [11.9, 2.6]], NK_MEM = [16.4, 6.8];
/** the two leaves on Nikanor's real doorway (angles in rad: 0 shut … 1.35 open, swung out east over the steps), bronze with gold bands;
 *  behind an opening leaf the doorway shows dark (the world's own shut leaves stand there, merged: they are covered) */
export function nikanorLeaves(k, angN, angS) {
  for (let j = 0; j < 2; j++) {
    const sg = j ? 1 : -1, hz = sg * 5, ang = j ? angS : angN, cx = NK_X + Math.sin(ang) * LEAF_W / 2, cz = hz - sg * Math.cos(ang) * LEAF_W / 2;
    const yaw = -sg * ang - k.F.yaw;   // (the box's own z along the leaf: θ = −sg·ang in the world)
    if (ang > 0.02) k.wb(10.42, NK_Y + LEAF_H / 2, sg * 2.5, 0.08, 5.0, LEAF_H, '#2A241C', { yaw: -k.F.yaw });
    k.wb(cx, NK_Y + LEAF_H / 2, cz, 0.3, LEAF_W - 0.1, LEAF_H, '#9C7A45', { yaw });
    for (const hy of [3.5, 10, 16.5]) k.wb(cx + 0.02, NK_Y + hy, cz, 0.36, LEAF_W * 0.92, 0.3, '#C8A35A', { yaw });
  }
}
export const NK_PTS = { x: NK_X, y: NK_Y };
function shaarimDrawA(k, M, T) {
  if (!M) return;
  nikanorLeaves(k, (M.open[0] || 0) * 1.35, (M.open[1] || 0) * 1.35);
  // the wicket beside the gate (a small door in the gatehouse's east face) and its key, gold when turned
  k.wb(10.42, NK_Y + 2.6, -7.4, 0.2, 2.2, 5.2, M.key ? '#5A4A36' : '#8F7A55', { yaw: -k.F.yaw }); { const q = k.loc(10.7, NK_Y + 2.7, -6.7); k.s(q[0], q[1], q[2], 0.06, 0.06, 0.06, M.key || M.act === 'key' ? '!#FFD24A' : GOLD); }
  // the kohanim with the silver trumpets (on the steps' top, facing the gate); the one sounding raises his trumpet
  for (let j = 0; j < 2; j++) {
    const P = NK_TRUMP[j], up = M.act === 'blast' && M.blast % 2 === j ? Math.sin(clamp(1 - M.anim / 0.45) * Math.PI) : 0;
    const f = figW(k, P[0], P[1], { face: [NK_X, P[1] * 0.8], robe: ROBE.kohen, arms: 0.55 + up * 0.35, skin: SKIN[j], pose: 'hold', u: 0.6 + up * 0.4, t: T });
    const ca = Math.cos(f.yaw), sa = Math.sin(f.yaw); k.c(f.a + ca * 0.55, f.s + sa * 0.55, f.y + 1.45 + up * 0.25, 0.04, 0.8, SILVER, { yaw: -f.yaw, pitch: Math.PI / 2 - 0.3 - up * 0.3 });
    if (up > 0.3) for (let z = 0; z < 3; z++) k.ring(f.a + ca * (1.0 + z * 0.4), f.s + sa * (1.0 + z * 0.4), f.y + 1.6 + up * 0.2, 0.12 + z * 0.12, '!#FFF3C4', 8);
  }
  // בן גבר's men at the leaves (a Levite each, drawing them out), and the ממונה
  for (let j = 0; j < 2; j++) { const P = NK_LEV[j], pulling = M.act === 'door' && M.leaf === j; figW(k, P[0] + (pulling ? 0.6 : 0), P[1], { dir: [-1, 0], robe: ROBE.levi, arms: pulling ? 0.8 : 0.2, lean: pulling ? -0.3 : 0, skin: SKIN[j + 1], pose: pulling ? 'reach' : 'stand', u: 1, t: T }); }
  figW(k, NK_MEM[0], NK_MEM[1], { face: [NK_X, 0], robe: ROBE.kohen, cap: '#B59B62', skin: SKIN[2], arms: 0.3, pose: 'point', u: 1, t: T });
  for (let j = 0; j < 3; j++) if (M.i > j + 1 || (M.i === j + 1 && M.blast >= j)) { const q = k.loc(15.2, 20.4, -1.0 + j * 1.0); k.s(q[0], q[1], q[2], 0.09, 0.09, 0.09, '!#FFD24A'); }
  if (M.anim <= 0 && M.phase === 'work') { const t = M.i === 0 ? [NK_X + 0.8, -6.8] : M.i <= 3 ? NK_TRUMP[(M.i - 1) % 2] : [NK_X + 1.2, M.i === 4 ? -2.5 : 2.5]; cueW(k, M, t[0], NK_Y, t[1], 1.2, T); }
  if (M.phase !== 'work' || M.i >= 6) labelW(k, 'נשמע עד יריחו', NK_X + 2, NK_Y + 9, 0, 0.44, { bg: 'rgba(255,236,170,.95)' }); else saysW(k, M, 15, NK_Y, 0);
  follow24(k, 'nikanor');
  if (M.act === 'door' && M.anim > 0) close24(NK_X + 1, NK_Y + 6, M.leaf ? 2.5 : -2.5, { dist: 12, el: 0.3, hold: 0.8, key: 'shaarim' });
}
const shaarimTargetA = (M, k) => { const t = M.i === 0 ? [NK_X + 0.6, NK_Y + 2.5, -6.8] : M.i <= 3 ? [NK_TRUMP[(M.i - 1) % 2][0], NK_Y + 3.4, NK_TRUMP[(M.i - 1) % 2][1]] : [NK_X + 0.6, NK_Y + 6, M.i === 4 ? -2.5 : 2.5]; return k.loc(t[0], t[1], t[2]); };
void NK;

/* ───────────────────────────── ברכת כהנים on the real steps of the Ulam, facing the court (תמיד ז, ב) ───────────────────────────── */
// seven kohanim climb from the steps' foot to the eleventh step and turn to the court; the first five hold the five vessels; at each verse
// the hands rise over the head (FIGURES24's 'bless' pose; ── light28 ── the three verses in full: birkat28.js, day/index.js l28Frame ── /light28 ──)
const B_ROW = (i) => [-71.4, -6 + i * 2], B_FOOT = (i) => [-56.2, -5.4 + i * 1.8];
const B_VD = [
  (k, x, y, z) => k.wc(x, y, z, 0.38, 0.45, GOLD), (k, x, y, z) => k.wc(x, y, z, 0.22, 0.7, GOLD),
  (k, x, y, z) => { k.wc(x, y, z, 0.45, 0.1, GOLD); }, (k, x, y, z) => k.wc(x, y, z, 0.3, 0.18, '#F0D27A'), (k, x, y, z) => { k.wc(x, y, z, 0.4, 0.22, GOLD); k.ws(x, y + 0.15, z, 0.38, 0.1, 0.38, '#F0D27A'); },
];
function birkatDrawA(k, M, T, dt) {
  if (!M) return;
  const lift = M.verse ? clamp(M.since(5 + M.verse) / 0.35) : 0;
  for (let i = 0; i < 7; i++) if (M.f['k' + i].t < 1) slow(M.f['k' + i], 't', M.f['k' + i].dur, 1.7, dt);   // (up the real steps: ~1.7 s)
  for (let i = 0; i < 7; i++) {
    const f = M.f['k' + i], u = M.i === 0 ? 0 : ease(clamp(f.t)), a = B_FOOT(i), b = B_ROW(i), x = lerp(a[0], b[0], u), z = lerp(a[1], b[1], u);
    const there = M.i > 0 && f.t >= 1, bless = M.verse ? (M.verse === 1 && lift < 1 ? lift : 1) : 0;
    const arms = M.verse ? 0.35 + 1.95 * bless : i < 5 && M.held[i] ? 0.55 : 0.1;
    const g = figW(k, x, z, { dir: there ? [1, 0] : [b[0] - a[0], b[1] - a[1]], robe: ROBE.kohen, arms, skin: SKIN[i % 3], pose: M.verse ? 'bless' : there ? (i < 5 && M.held[i] ? 'hold' : 'stand') : 'walk', u: M.verse ? bless : 1, t: T });
    if (i < 5 && M.held[i]) { const yy = k.F.y + g.y * k.F.K; if (!M.verse) B_VD[i](k, x + 0.9, yy + 2.2, z); else B_VD[i](k, x - 0.2, yy + 0.25, z + 0.8); }
  }
  // the people in the court (at the steps' foot, south of the altar's line), bowing at each verse
  const bw = M.verse ? clamp(M.since(5 + M.verse) / 0.5) * (1 - clamp((M.since(5 + M.verse) - 1.2) / 0.8)) : 0;
  for (let j = 0; j < 6; j++) figW(k, -54.2 + (j % 2) * 1.4, 14.4 + (j >> 1) * 1.3, { dir: [-1, -0.5], robe: ['#A8957A', '#8F8670', '#9AA0A8', '#B4A27C', '#857A68', '#A39C8C'][j], cap: '#5C5242', lean: bw * 0.8, skin: SKIN[j % 3], scale: 0.92, pose: bw > 0.05 ? 'bow' : 'stand', u: bw, t: T });
  for (let j = 0; j < M.verse; j++) { const q = k.loc(-71.4, 27.8, -2 + j * 2); k.s(q[0], q[1], q[2], 0.07, 0.07, 0.07, '!#FFD24A'); }
  if (M.phase === 'work') { if (M.i === 0) cueW(k, M, -56.2, 16.5, 0, 2.2, T); else if (M.i <= 5) { const b = B_ROW(M.i - 1); cueW(k, M, b[0] + 1.2, 21.5, b[1], 0.9, T); } else cueW(k, M, -69.8, 21, 0, 2.2, T); }
  saysW(k, M, -71.4, 21.5, 0);
  if (M.i === 0) follow(k, -64, 19, 0, [10, 7, 12]); else follow24(k, 'steps');
  if (M.verse) { const b = B_ROW(3); close24(b[0], 21.5 + 3.4, b[1], { dist: 5.5, el: 0.36, az: 0, hold: 0.5, key: 'birkat' }); }   // (the middle kohen's hands, from the people's side)
  { const b = B_ROW(3); M.l28at = [b[0], 21.5 + 4.6, b[1]]; }   // ── light28 ── (the raised hands: the verse over them) ── /light28 ──
}
const birkatTargetA = (M, k) => { if (M.i === 0) return k.loc(-56.2, 19, 0); if (M.i <= 5) { const b = B_ROW(M.i - 1); return k.loc(b[0], 25, b[1]); } return k.loc(-71.4, 26, 0); };

/* ───────────────────────────── the song: the parts on the fire, the trumpets on the table of fats, the wine at the SW horn, the Levites on the real דוכן (תמיד ז, ג–ד) ───────────────────────────── */
const S_TABLE = [-49.5, 28.8], S_TR = [[-49.5, 27.3], [-49.5, 30.3]], S_CARRY = [[-42.6, 33.4], [-37.6, 30.0], [-36.2, 9.8], [-35.0, 2.4]];   // (from the parts on the ramp's lower west half up to the great pyre)
const S_POUR = [-48.3, 10.0], S_SEGAN = [-51.4, 8.4], S_LEV = (j) => [-8.5, -15 + j * 1.25], S_BEN = [-10.6, -8.4];
function songDrawA(k, M, T, dt) {
  if (!M) return;
  const i = M.i;
  if (i < 5) {
    k.anchor('ramp');   // (the ramp, its head on the top, and the table of fats west of it)
    // 1–3: the carrier climbs the ramp with a part (pale, abstract) and casts it on the great pyre; the flames flare
    if (i < 3) {
      if (M.f.c.t < 1 && M.carry >= 0) slow(M.f.c, 't', M.f.c.dur, 1.6, dt);   // (up the real ramp: ~1.6 s with the part; back down at the model's pace)
      const c = M.f.c, up = M.carry >= 0, u = up ? ease(clamp(c.t)) : 1 - ease(clamp(c.t));
      const p = along(S_CARRY, up ? u : 1 - u), y = p.z <= 10.5 ? 25 : p.z < 42.5 ? rampY(p.z) : 16;
      const g = figW(k, p.x, p.z, { y, dir: up ? [p.dx, p.dz] : [-p.dx, -p.dz], robe: ROBE.kohen, arms: up ? 0.55 : 0.15, pose: up ? 'carry' : 'walk', u: 1, t: T });
      if (up) { const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw); k.s(g.a + ca * 0.4, g.s + sa * 0.4, g.y + 1.0, 0.26, 0.14, 0.2, '#E9DFCB'); }
      cueW(k, M, AL.great[0] - 2.6, 25, AL.great[2] + 3, 1.4, T);
      follow(k, p.x, y, p.z, [14, 10, 16]);
    } else {
      // 4: the two trumpets (on the table of fats, west of the ramp) · 5: the wine, poured at the SW horn into the silver bowl (hold)
      k.wb(S_TABLE[0], 16.5, S_TABLE[1], 2.2, 4.4, 1.0, '#E4DCC8');
      for (let j = 0; j < 2; j++) {
        const P = S_TR[j], blow = M.blast >= 0 && M.t - M.blast < 1.6 ? 1 : 0;
        const f = figW(k, P[0], P[1], { y: 17, dir: [1, -0.2], robe: ROBE.kohen, arms: 0.55 + blow * 0.3, skin: SKIN[j], pose: 'hold', u: 1, t: T });
        const ca = Math.cos(f.yaw), sa = Math.sin(f.yaw); k.c(f.a + ca * 0.55, f.s + sa * 0.55, f.y + 1.45 + blow * 0.2, 0.04, 0.8, SILVER, { yaw: -f.yaw, pitch: Math.PI / 2 - 0.3 - blow * 0.3 });
      }
      const wine = M.wine || 0, pouring = i === 4 && M.pressed;
      const f = figW(k, S_POUR[0], S_POUR[1], { y: 25, face: [AL.bowls[0], AL.bowls[2]], robe: ROBE.kohen, arms: 0.55, pose: 'pour', u: pouring ? 1 : 0.3, t: T });
      const ca = Math.cos(f.yaw), sa = Math.sin(f.yaw); k.c(f.a + ca * 0.5, f.s + sa * 0.5, f.y + 1.0, 0.12, 0.3, GOLD, { pitch: pouring ? 0.9 : 0.2 });
      if (wine > 0) { const q = k.loc(AL.bowls[0], AL.bowls[1] + 0.32, AL.bowls[2]); k.s(q[0], q[1], q[2], 0.12 * wine, 0.02, 0.12 * wine, '#9A6A3A'); }
      figW(k, S_SEGAN[0], S_SEGAN[1], { y: 25, face: [S_POUR[0], S_POUR[1]], robe: ROBE.kohen, cap: '#B59B62', arms: M.wave >= 0 ? 0.8 + 0.2 * Math.sin(T * 9) : 0.3, pose: M.wave >= 0 ? 'reach' : 'stand', u: 1, t: T });
      if (M.wave >= 0) { const q = k.loc(S_SEGAN[0] - 0.4, 28.6 + 0.2 * Math.sin(T * 9), S_SEGAN[1]); k.b(q[0], q[1], q[2], 0.5, 0.05, 0.35, LINEN); }
      if (i === 3) { cueW(k, M, S_TABLE[0] + 1.6, 16, S_TABLE[1], 1.6, T); follow(k, -46, 17, 22, [12, 9, 15]); }
      else { if (M.phase === 'work') labelW(k, 'החזיקו — לנסך', AL.bowls[0], 28.8, AL.bowls[2], 0.26); cueW(k, M, AL.bowls[0], 25, AL.bowls[2], 1.1, T); follow(k, -48.6, 25, 9.6, [7, 14, 12]); }
    }
  } else {
    k.anchor('duchan');
    // the Levites on the דוכן (one amah over the court of Israel), facing the altar; בן ארזא with the cymbal; the people bow at each פרק
    const bw = M.bowT >= 0 ? clamp((M.t - M.bowT) * 2) * (1 - clamp((M.t - M.bowT - 1.0) * 1.5)) : 0, beat = Math.sin(T * 7);
    for (let j = 0; j < 10; j++) { const L = S_LEV(j); figW(k, L[0], L[1], { y: 14.5, dir: [-1, 0], robe: ROBE.levi, skin: SKIN[j % 3], arms: 0.4 + 0.12 * beat * ((j & 1) ? 1 : -1), pose: 'stand', t: T + j }); }
    figW(k, S_BEN[0], S_BEN[1], { dir: [-1, 0.3], robe: ROBE.levi, cap: '#5C5242', arms: 0.7, pose: 'hold', u: 1, t: T });
    for (let j = 0; j < 6; j++) figW(k, -4.5 + (j % 2) * 1.4, -12 + (j >> 1) * 3, { y: 13.5, dir: [-1, 0], robe: ['#A8957A', '#8F8670', '#9AA0A8', '#B4A27C', '#857A68', '#A39C8C'][j], cap: '#5C5242', lean: bw * 1.0, skin: SKIN[j % 3], scale: 0.92, pose: bw > 0.05 ? 'bow' : 'stand', u: bw, t: T });
    // the beat ring before the דוכן: it closes on the gold band at the beat
    if (M.phase === 'work') { const u = beatU24(), q = k.loc(-11.2, 15.6, -8); const K = k.F.K; k.ring(q[0], q[1], q[2], 1.3 / K, '!#FFD24A', 18); k.ring(q[0], q[1], q[2] + 0.01, (1.3 + u * 1.5) / K, '!#FFF3C4', 20); }   // (amot: the gold band 1.3, the closing ring from 2.8)
    for (let j = 0; j < 9; j++) { const on = j < M.sung, q = k.loc(-8.5, 20.6, -13 + j * 1.1 + (j / 3 | 0) * 0.5), r = on ? 0.1 : 0.06; k.s(q[0], q[1], q[2], r, r, r, on ? '!#FFD24A' : '#A89A7C'); }
    if (M.ps) labelW(k, `${M.ps.day}: ${M.ps.words ? M.ps.words + ' — ' : ''}${M.ps.ref}`, -8.5, 22.4, -8, 0.26);
    saysW(k, M, -8.5, 14.5, -4);
    follow24(k, 'duchan'); if (bw > 0 || (M.bowT >= 0 && M.t - M.bowT < 0.3)) close24(-4, 15.2, -9, { dist: 6, el: 0.34, hold: 0.6, key: 'song-bow' });
  }
}
function beatU24() {
  try { const B = globalThis.__CRAFT_BEAT ? globalThis.__CRAFT_BEAT() : (globalThis.__BH_MUSIC && globalThis.__BH_MUSIC.beat && globalThis.__BH_MUSIC.beat()); if (B && B.period > 0) { const to = (((+B.toNext - 0.09) % B.period) + B.period) % B.period; return to / B.period; } } catch (e) { /* */ }
  return ((performance.now() / 1000) % 0.9) / 0.9;
}
const songTargetA = (M, k) => { const i = M.i; if (i < 3) return k.loc(AL.great[0] - 1, 27.5, AL.great[2] + 2); if (i === 3) return k.loc(S_TABLE[0], 21, S_TABLE[1]); if (i === 4) return k.loc(AL.bowls[0], 27.5, AL.bowls[2]); return k.loc(-9.5, 19.5, -8); };

/* ───────────────────────────── הטלה at the real lambs' chamber (תמיד ג, ג–ד) ───────────────────────────── */
// the lamb steps out of the chamber's door (Beit HaMoked's hall: its dome is lifted for a near camera — temple.js) onto a mat; the gold
// cup; the check by torch; the vessels carried out and set on a table in the hall (the vessels' chamber: its place — המחשה)
const PN = ANCHORS.pen.pts, P_DOOR = [PN.door[0] - 0.6, PN.door[2]], P_MAT = [-163.6, -62.2], P_CUP = [-162.4, -63.9], P_TORCH = [-165.4, -60.4], P_TABLE = [-160.6, -65.6], P_KELIM = [-157.4, -66.4];
const P_PART = [[0.44, 0.17, 0.78], [0.62, 0.07, 0.68], [0.3, 0.15, 0.14]];
function talehDrawA(k, M, T) {
  if (!M) return;
  const u = ease(M.come), lx = lerp(P_DOOR[0], P_MAT[0], u), lz = lerp(P_DOOR[1], P_MAT[1], u);
  k.wb(P_MAT[0], 16.03, P_MAT[1], 2.8, 3.4, 0.06, '#D8C79A');
  const lp = k.loc(lx, 16, lz), ly = M.come < 1 ? dirL(k, P_MAT[0] - P_DOOR[0], P_MAT[1] - P_DOOR[1]) : dirL(k, 0, -1), sc = 1.0;
  lamb(k, lp[0], lp[1], k.gy(lp[0], lp[1]), { yaw: ly, scale: sc, step: M.come < 1 && M.come > 0 ? T * 8 : 0, t: T, head: M.sub === 'drink' ? 0.1 : 0.6 });
  const partAt = (j) => { const d = P_PART[j], ya = ly; return [lp[0] + (d[0] * Math.cos(ya) - d[1] * Math.sin(ya)) * sc, lp[1] + (d[0] * Math.sin(ya) + d[1] * Math.cos(ya)) * sc, d[2] * sc]; };
  // the kohen with the gold cup at the lamb's mouth
  const mouth = partAt(1), drinking = M.sub === 'drink' && (M.anim > 0 || M.pressed);
  const g = figW(k, P_CUP[0], P_CUP[1], { dir: [-0.6, 1], robe: ROBE.kohen, arms: M.sub === 'drink' ? 0.55 : 0.1, skin: SKIN[1], pose: M.sub === 'drink' ? 'pour' : 'stand', u: drinking ? 0.8 : 0.3, t: T });
  if (M.sub === 'drink' || M.sips) { const ca = M.sub === 'drink' ? lerp(g.a, mouth[0], 0.7) : g.a + 0.3, cs = M.sub === 'drink' ? lerp(g.s, mouth[1], 0.7) : g.s + 0.3, cy = M.sub === 'drink' ? 0.55 - (drinking ? 0.06 : 0) : 0.9; k.c(ca, cs, cy, 0.1, 0.16, GOLD); k.c(ca, cs, cy - 0.12, 0.04, 0.1, GOLD); k.c(ca, cs, cy + 0.06, 0.085, 0.02, '!#CFE3EE'); }
  // the torch-bearer: the check, part by part
  if (M.sub === 'check' || M.part) {
    const tp = partAt(Math.min(2, M.part)), tq = k.loc(P_TORCH[0], 16, P_TORCH[1]);
    man(k, tq[0], tq[1], 0, { robe: ROBE.kohen, yaw: Math.atan2(tp[1] - tq[1], tp[0] - tq[0]), torch: 1, t: T, skin: SKIN[2], pose: 'torch', u: 1 });
    k.torch(lerp(tq[0], tp[0], 0.3), lerp(tq[1], tp[1], 0.3), 1.9, 1);
    for (let j = 0; j < 3; j++) { const p = partAt(j); if (M.okP[j]) k.s(p[0], p[1], p[2], 0.06, 0.06, 0.06, '!#FFD24A'); else if (j === M.part && M.phase === 'work') { const r = 0.09 + 0.02 * Math.sin(T * 6); k.s(p[0], p[1], p[2], r, r, r, '!#FFF3C4'); } }
  }
  // the vessels: a table in the hall, twelve trays carried out from the vessels' place (93)
  k.wb(P_TABLE[0], 16.9, P_TABLE[1], 3.2, 1.6, 0.14, '#E4DCC8'); for (const [dx, dz] of [[-1.4, -0.6], [-1.4, 0.6], [1.4, -0.6], [1.4, 0.6]]) k.wb(P_TABLE[0] + dx, 16.42, P_TABLE[1] + dz, 0.16, 0.16, 0.84, '#B9AC8E');
  for (let j = 0; j < M.trays; j++) { const x = P_TABLE[0] - 1.2 + (j % 4) * 0.8, z = P_TABLE[1] - 0.45 + (j / 4 | 0) * 0.45; k.wb(x, 17.0, z, 0.66, 0.34, 0.04, SILVER); for (let v = 0; v < 3; v++) k.wc(x - 0.2 + v * 0.2, 17.12, z, 0.06, 0.2, v === 1 ? GOLD : SILVER); }
  if (M.sub === 'kelim' || M.trays) { const v = M.sub === 'kelim' && M.anim > 0 ? 1 - M.anim / 0.32 : 0, x = lerp(P_KELIM[0], P_TABLE[0] + 1.6, v), z = lerp(P_KELIM[1], P_TABLE[1] + 0.9, v); figW(k, x, z, { dir: [-1, 0.3], robe: ROBE.kohen, arms: v > 0 ? 0.5 : 0.2, pose: v > 0 ? 'carry' : 'stand', u: 1, t: T }); }
  labelW(k, 'לשכת הטלאים', PN.door[0] - 0.6, 21.2, PN.door[2], 0.26);
  if (M.phase === 'work' && M.anim <= 0) { const t = M.sub === 'out' ? [P_DOOR[0] + 0.8, P_DOOR[1]] : M.sub === 'drink' ? [P_MAT[0], P_MAT[1] - 1.2] : M.sub === 'check' ? P_MAT : [P_KELIM[0] - 1, P_KELIM[1]]; cueW(k, M, t[0], 16, t[1], 1.1, T); }
  if (M.sub === 'drink' && M.phase === 'work') labelW(k, 'החזיקו — הטלה שותה', P_MAT[0], 19.6, P_MAT[1] - 1, 0.26);
  if (M.say) labelW(k, M.say, P_MAT[0] + 1, 21.6, P_MAT[1], 0.32);
  const fx = M.sub === 'kelim' ? lerp(P_MAT[0], P_TABLE[0], 0.6) : lx, fz = M.sub === 'kelim' ? lerp(P_MAT[1], P_TABLE[1], 0.6) : lz;
  follow(k, fx, 16, fz, [10, 8.5, 7]);   // (from the hall's east: the אמרכל, south of the wall, out of the line)
}
const talehTargetA = (M, k) => (M.sub === 'kelim' ? k.loc(P_TABLE[0], 19, P_TABLE[1]) : k.loc(P_MAT[0], 18.5, P_MAT[1]));

/* ───────────────────────────── the night watch at the real posts of the azara's north side (מדות א, א–ב) ───────────────────────────── */
// three posts: בית הניצוץ (the kohanim's, over the gate), לשכת הקרבן's gate, בית המוקד's door; the guard stands by the gate's post;
// איש הר הבית walks with his torch round the north side (the north chambers and the marble tables are walked round)
const NP = NIGHT_POSTS, N_STAND = [[-38, -63.0], [-95, -63.0], [-157.2, -54.6]];
const N_WALK = [
  [[-33, -54.5], [-36.5, -59.2], N_STAND[0]],
  [N_STAND[0], [-55.2, -63.2], [-55.2, -55.6], [-86.2, -55.6], [-92.6, -60.8], N_STAND[1]],
  [N_STAND[1], [-99.5, -55.4], [-150, -53.4], N_STAND[2]],
];
function nightDrawA(k, M, T, dt) {
  if (!M) return;
  if (M.mode === 'walk' && dt > 0) { const D = 1.6 + plen(N_WALK[Math.min(2, M.p)]) / 13; M.mt = Math.max(0, M.mt - dt * (1 - 2.1 / D)); }   // (the real round is long: ~3–6 s a leg)
  for (let i = 0; i < 3; i++) {
    const P = NP[i], ans = M.ans[i], asleep = i === M.sleeper && !(ans && M.wake >= 0.55), gx = P.x + (i === 2 ? 0 : 2.6), gz = P.z;
    // a lamp on a pole by the post (the place has the gate, not the lamp)
    k.wc(gx + 1.2, 17.6, gz + 0.6, 0.06, 3.2, '#6B4A2B'); { const q = k.loc(gx + 1.2, 19.3, gz + 0.6); k.s(q[0], q[1], q[2], 0.12, 0.15, 0.12, '!#FFD27A'); }
    if (asleep) {
      const q = k.loc(gx, 16, gz); man(k, q[0], q[1], 0, { robe: ROBE.levi, lying: true, yaw: dirL(k, 1, 0.3) });
      for (let z = 0; z < 3; z++) { const u = ((T * 0.45 + z / 3) % 1), r = 0.07 + 0.05 * u, q2 = k.loc(gx + 0.8 + u * 0.5, 17.6 + u * 2.2, gz + 0.4); k.s(q2[0], q2[1], q2[2], r, r, r, '!#C9D7EA'); }
    } else {
      const wk = i === M.sleeper ? 1 - Math.abs(M.wake - 1) : 0;
      figW(k, gx, gz, { dir: [0, 1], robe: i === 0 ? ROBE.kohen : ROBE.levi, arms: ans ? 0.5 + 0.2 * Math.sin(T * 6) : 0, lean: wk * 0.5, skin: SKIN[(i + 1) % 3], pose: ans ? 'reach' : 'stand', u: 0.6, t: T });
    }
    if (ans && M.said === i && M.mode === 'answer' && (i !== M.sleeper || M.wake > 0.55)) labelW(k, 'שלום עליך איש הר הבית', gx, 22.4, gz, 0.34);
    else if (ans) { const q = k.loc(gx, 21.4, gz); k.s(q[0], q[1], q[2], 0.14, 0.14, 0.14, '!#FFD24A'); }
    labelW(k, P.he, P.x, 23.6, P.z - 1.2, 0.22);
  }
  // איש הר הבית with his torch, along the walk
  const p = Math.min(2, M.p), path = N_WALK[p];
  const u = M.mode === 'walk' ? ease(clamp(M.walk)) : 1, at = along(path, u), dir = M.mode === 'walk' ? [at.dx, at.dz] : [NP[p].x + (p === 2 ? 0 : 2.6) - at.x, NP[p].z - at.z];
  const I = figW(k, at.x, at.z, { dir, robe: '#B7A57F', cap: '#6B5E48', torch: 1, t: T, pose: M.mode === 'walk' ? 'walk' : 'torch', u: 1 });
  k.torch(I.a + 0.45 * Math.cos(I.yaw), I.s + 0.45 * Math.sin(I.yaw), 1.9, 1);
  if (M.mode === 'wait' && M.phase === 'work') cueW(k, M, NP[p].x + (p === 2 ? 0 : 2.6), 16, NP[p].z, 1.5, T);
  if (M.warn) labelW(k, M.warn, at.x, 22, at.z, 0.3);
  follow(k, at.x, 16, at.z, [3, 17, 9]);   // (steep: over the hook pillars' beams and the marble tables of the north side)
}
const nightTargetA = (M, k) => { const p = Math.min(2, M.p); return k.loc(NP[p].x + (p === 2 ? 0 : 2.6), 19.5, NP[p].z); };

/* ───────────────────────────── השחיטה והזריקה at the real ring and the altar's real corners (תמיד ד, א; זבחים ה, ד) ───────────────────────────── */
// ── blooda25 ── (DAM25) the lamb led to the second ring; bound; the linen screen and behind it the slaughter — the moment of gravity (blood.js:
// the two kohanim bow, the camera stands, no cue, no "+N"); the receiver comes from behind the screen with the dark liquid in the gold vessel;
// he walks to the north-east corner — the Γ blooms on the REAL altar below the red line (avodah3d mark) — and round the north and the west
// to the south-west (the four faces glow: "שתיים שהן ארבע"); then the rest on the southern yesod — the thread into the two holes (water.js),
// and the amah runs. No arc in the air, nothing red on a kohen, the lamb never drawn after the screen.
const RG = ANCHORS.rings.pts, Z_FROM = [-56.5, -41], Z_RECV = [RG.ring[0] + 1.6, RG.ring[2] + 1.8];
const Z_NE = [RG.ne[0] + 2.2, RG.ne[2] - 2.4], Z_SW = [RG.sw[0] - 2.6, RG.sw[2] + 2.4], Z_YES = [-52.2, 13.6];
const Z_P1 = [Z_RECV, [-31.5, -24.6], Z_NE], Z_P2 = [Z_NE, [-56.8, -23.2], Z_SW], Z_P3 = [Z_SW, [-54.4, 14.4], Z_YES];
/** the Γ's two faces at a corner of the real altar, below the line (avodah3d cornerMarks 'lower': y 19.4, 1.2 × 1.9) — for the glow of "שתיים שהן ארבע" */
const gammaFaces = (C) => { const sx = C[0] > -38 ? 1 : -1, sz = C[2] > -4 ? 1 : -1; return [[C[0] + 0.05 * sx, C[2] - sz * 0.75, 0], [C[0] - sx * 0.75, C[2] + 0.05 * sz, 1]]; };
function bloodGlow(k, M, T) {
  if (!(M.glowT > 0)) return; const a = Math.min(1, M.glowT / 0.4);
  for (const C of [RG.ne, RG.sw]) for (const [x, z, f] of gammaFaces(C)) for (let j = -2; j <= 2; j++) { const q = k.loc(x + (f ? j * 0.25 : 0), 20.45, z + (f ? 0 : j * 0.25)); k.s(q[0], q[1], q[2], 0.06 * a, 0.06 * a, 0.06 * a, '!#FFE6A0'); }
  void T;
}
/** the world's marks, once per gift (and the kit's own Γ when the world has none: the harness) */
function bloodMarks(k, M, idx) {
  for (const [j, corner, C] of [[0, 'NE', RG.ne], [1, 'SW', RG.sw]]) {
    if (!M.given[j]) continue;
    if (!M.mk) M.mk = [0, 0];
    if (!M.mk[j]) M.mk[j] = worldMark(corner, 'lower') ? 1 : 2;
    if (M.mk[j] === 2) for (const [x, z] of gammaFaces(C)) { const q = k.loc(x, 19.4, z); k.s(q[0], q[1], q[2], 0.5 / k.F.K, 0.9 / k.F.K, 0.5 / k.F.K, BLOOD.mark); tagBlood(k, 'horn'); }
  }
  void idx;
}
/** the camera for the blood's acts: from the side of the corner being given (NE: the north-east; SW: the south-west; the yesod: the south) */
// (fixed views from outside the altar: the corner's two faces and the kohen arriving at it; the southern yesod and its two holes)
const BLOOD_VIEW = { ne: { p: [-10.5, 26.5, -31.5], t: [-23.5, 18.6, -18.6] }, sw: { p: [-71, 27, 3.5], t: [-53.5, 18.6, 11.8] }, yesod: { p: [-44.5, 23.5, 27.5], t: [-52.6, 17.2, 12.6] } };
function bloodCam(k, st, x, z) { const V = BLOOD_VIEW[st]; if (V) k.view(V.p, V.t); else follow(k, x, 16, z, [9, 12, 12]); }
function zerikaDrawA(k, M, T, dt) {
  if (!M) return;
  try { const B = globalThis.__BLOOD25; if (B) B.cur = { id: M.kind, M }; } catch (e) { /* tests */ }   // ── blooda25 ── (tests read the model)
  if (!M.chan) M.chan = worldChannel(true) ? 1 : 2;   // (the amah runs through the day: DAM25 §2.2)
  const i = M.i; if (M.anim > 0 && (i === 4 || i === 5 || i === 6) && dt > 0) { const D = 1.2 + plen(i === 4 ? Z_P1 : i === 5 ? Z_P2 : Z_P3) / 11; M.anim += dt * (1 - 1.0 / D); }   // (the real way to each corner: ~3–7 s)
  const grave = graveOn(M);
  // the ring (the world's), the lamb led to it, bound — then the screen held up; behind it the lamb is not drawn again
  if (M.screen < 0.98) {
    const u = ease(M.lambAt), x = lerp(Z_FROM[0], RG.ring[0], u), z = lerp(Z_FROM[1], RG.ring[2] - 0.6, u), q = k.loc(x, 16, z);
    lamb(k, q[0], q[1], k.gy(q[0], q[1]), { yaw: M.bound ? dirL(k, -1, 0) : dirL(k, RG.ring[0] - Z_FROM[0], RG.ring[2] - Z_FROM[1]), scale: 1, step: i === 0 && M.anim > 0 ? T * 8 : 0, t: T, head: 0.3 });
  }
  if (M.bound || i >= 1) for (let j = 0; j < 2; j++) figW(k, RG.ring[0] + (j ? 1.8 : -1.8), RG.ring[2] - 1.6, { face: [RG.ring[0], RG.ring[2] - 0.6], robe: ROBE.kohen, arms: 0.5, skin: SKIN[j], pose: grave ? 'bow' : 'reach', u: grave ? 0.7 : 0.6, t: T });
  if (M.screen > 0) {
    const sw = 6 * M.screen, cz = RG.ring[2] + 1.4, cx = RG.ring[0] - 3 + sw / 2;
    k.wb(cx, 18.6, cz, 0.12, sw, 4.2, LINEN, { yaw: Math.PI / 2 - k.F.yaw }); k.wb(cx, 20.8, cz, 0.2, sw + 0.2, 0.18, '#C9B58A', { yaw: Math.PI / 2 - k.F.yaw });
    for (const sg of [-1, 1]) figW(k, cx + sg * sw / 2, cz + 0.9, { dir: [0, -1], robe: ROBE.kohen, arms: 0.95, skin: SKIN[2], pose: grave ? 'bow' : 'raise', u: grave ? 0.7 : 1, t: T });
  }
  // the receiver with the gold vessel and the dark liquid in it; to the corners; to the yesod
  if (!grave && (M.vessel || i === 3)) {
    let x = Z_RECV[0], z = Z_RECV[1], dir = [1, 1];
    if (i === 3 && M.anim > 0) { x = lerp(RG.ring[0] + 0.6, Z_RECV[0], ease(M.u)); z = lerp(RG.ring[2] + 1, Z_RECV[1], ease(M.u)); }
    if ((i >= 4 && i <= 6) && M.anim > 0) { const w = ease(clamp(M.u / 0.65)), p = along(i === 4 ? Z_P1 : i === 5 ? Z_P2 : Z_P3, w); x = p.x; z = p.z; dir = w < 1 ? [p.dx, p.dz] : (i === 4 ? [RG.ne[0] - x, RG.ne[2] - z] : i === 5 ? [RG.sw[0] - x, RG.sw[2] - z] : [0, -1]); }
    else if (i >= 5 && i <= 7) { const at = M.poured ? Z_YES : M.given[1] ? Z_SW : Z_NE; x = at[0]; z = at[1]; dir = M.poured ? [0, -1] : M.given[1] ? [RG.sw[0] - x, RG.sw[2] - z] : [RG.ne[0] - x, RG.ne[2] - z]; }
    else if (i === 4) { dir = [RG.ne[0] - x, RG.ne[2] - z]; }
    const g = figW(k, x, z, { dir, robe: ROBE.kohen, arms: 0.7, skin: SKIN[1], pose: M.tilt > 0 ? 'pour' : 'carry', u: M.tilt > 0 ? M.tilt : 1, t: T });
    const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw), va = g.a + ca * 0.5, vs = g.s + sa * 0.5, tl = M.tilt * 0.9;
    k.c(va, vs, g.y + 1.0, 0.13, 0.28, GOLD, { yaw: -g.yaw, pitch: -tl }); k.c(va, vs, g.y + 0.84, 0.05, 0.12, GOLD);
    const f = i === 3 ? 0.7 * ease(M.u) : M.fill; if (f > 0.02 && !M.poured) liquid(k, va, vs, g.y + 0.95 + 0.16 * Math.min(1, f / 0.7), 0.13, tl);   // (0.7 full: just under the rim, seen from the camera's height)
    if (((i === 6 && M.pour > 0) || M.poured) && !M.shir) { const h = k.world(va, vs, g.y + 1.0, {}); M.shir = worldShirayim({ ms: 1500, from: h }) ? 1 : 2; }
    bloodCam(k, i === 4 ? 'ne' : i === 5 ? 'sw' : i >= 6 ? 'yesod' : '', x, z);
  } else follow(k, RG.ring[0], 16, RG.ring[2], [10, 13, 13]);   // (the moment of gravity: the camera stands)
  bloodMarks(k, M); bloodGlow(k, M, T);
  if (M.shir === 2 && M.pour > 0 && M.pour < 1) { const L = 1.0 * M.pour, q = k.loc(-52.2 + 0.05, 17.03, 12.3 - L / 2); k.b(q[0], q[1], q[2], 0.05 / k.F.K, L / k.F.K, 0.01, BLOOD.wet, { yaw: dirL(k, 0, 1) }); tagBlood(k, 'yesod'); }   // (the harness: no water layer)
  for (const [C, he] of [[RG.ne, 'קרן מזרחית צפונית'], [RG.sw, 'קרן מערבית דרומית']]) labelW(k, he, C[0], 22.2, C[2], 0.22);
  if (M.anim <= 0 && M.phase === 'work' && !grave) { const t = i <= 2 ? [RG.ring[0], RG.ring[2]] : i === 3 ? Z_RECV : i === 4 ? Z_NE : i === 5 ? Z_SW : Z_YES; cueW(k, M, t[0], 16, t[1], 1.3, T); }
  if (M.say) labelW(k, M.say, i >= 4 ? -38 : RG.ring[0], 22.5, i >= 4 ? -4 : RG.ring[2], M.grave > 0 || M.say.length > 30 ? 0.22 : 0.3);
  if (i >= 4 || M.phase !== 'work') teachTap(k, M);
}
const zerikaTargetA = (M, k) => { const i = M.i, t = i <= 2 ? [RG.ring[0], RG.ring[2]] : i === 3 ? Z_RECV : i === 4 ? Z_NE : i === 5 ? Z_SW : Z_YES; return k.loc(t[0], 19, t[1]); };

/* ───────────────────────────── האברים to the real ramp's lower west half (תמיד ד, ב–ג) ───────────────────────────── */
// nine kohanim in a row on the floor west of the ramp, each with his portion (pale, abstract — המחשה); each walks up from the ramp's foot
// and sets it down "מחצי הכבש ולמטה במערבו" (the real LIMBS_PLACE), then the salt
const E_ROW = (j) => [-50.6, 31.0 + j * 1.5], E_SPOT = (j) => [-44.4, 41.4 - j * 1.6], E_FOOT = [-43.2, 43.8];
function evarimDrawA(k, M, T, dt) {
  if (!M) return;
  if (M.anim > 0 && M.i < 9 && dt > 0) { const D = 2.4; M.anim += dt * (1 - 0.85 / D); }   // (round the ramp's foot and up: ~2.4 s)
  evFrame(M); const labK = (t, a, s, y, sz, o) => k.label(t, a, s, y, sz, o), labW = (t, x, y, z, sz, o) => labelW(k, t, x, y, z, sz, o);   // ── fix26 ── ── /fix26 ──
  const picks27 = [], perm = M.perm || [0, 1, 2, 3, 4, 5, 6, 7, 8];   // ── slice27 ── (the figures a tap can pick; L2: the shuffled row) ── /slice27 ──
  for (let j = 0; j < 9; j++) {
    const R = E_ROW(perm[j]), S = E_SPOT(j), walking = j === M.i && M.anim > 0 && M.i < 9;   // ── slice27 ── (perm) ── /slice27 ──
    let x = R[0], z = R[1], dir = [1, 0];
    if (M.set[j]) { x = S[0] + 1.6; z = S[1]; dir = [-1, 0]; }
    else if (walking) { const p = along([R, [R[0], 44.6], E_FOOT, [S[0] + 1.6, S[1]]], ease(clamp(1 - M.anim / 0.85))); x = p.x; z = p.z; dir = [p.dx, p.dz]; }
    const g = figW(k, x, z, { dir, robe: ROBE.kohen, arms: M.set[j] ? 0.1 : 0.55, skin: SKIN[j % 3], pose: walking ? 'walk' : M.set[j] ? 'stand' : 'carry', u: 1, t: T + j });
    const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw);
    if (M.set[j]) { const q = k.loc(S[0], rampY(S[1]) + 0.25, S[1]); partA(k, j, q[0], q[1], q[2]); } else partA(k, j, g.a + ca * 0.42, g.s + sa * 0.42, g.y + 0.95);
    // ── fix26 ── its name on it, from the start: over the portion in his hands, then on the ramp where it lies (gold for the meal offering and the wine)
    if (M.set[j]) evName(labW, j, S[0] + 0.2, rampY(S[1]) + 1.0, S[1], 0.14, 'ramp'); else evName(labK, j, g.a + ca * 0.42, g.s + sa * 0.42, g.y + 1.55, 0.2, 'row');
    // ── /fix26 ──
    // ── slice27 ── the row's figures are targets: their screen places; the wrong one picked shows a pale ring
    if (!M.set[j] && !walking && M.phase === 'work' && M.anim <= 0) { try { const q = k.screen(g.a, g.s, g.y + 1.0); picks27.push({ id: j, x: q.x, y: q.y }); } catch (e) { /* */ } }
    if (M.wrongT > 0 && M.wrongJ === j) k.ring(g.a, g.s, g.y + 0.04, 0.9 / k.F.K * 1.5, '!#BFE0FF', 16);
    // ── /slice27 ──
  }
  if (M.salt || (M.i === 9 && M.anim > 0)) for (let z = 0; z < 14; z++) { const S = E_SPOT(z % 9), q = k.loc(S[0] + Math.sin(z * 3.1) * 0.3, rampY(S[1]) + 0.5, S[1] + Math.cos(z * 2.3) * 0.3); k.s(q[0], q[1], q[2], 0.03, 0.03, 0.03, '!#FFFFFF'); }
  labelW(k, 'מחצי הכבש ולמטה, במערבו', -44.4, 24.5, 34, 0.24);
  if (M.anim <= 0 && M.phase === 'work') { if (M.i < 9) { const R = E_ROW(perm[M.i]); cueW(k, M, R[0], 16, R[1], 1.0, T); } else cueW(k, M, -44.4, rampY(37), 37, 1.8, T); }   // ── slice27 ── (perm) ── /slice27 ──
  // ── slice27 ── a tap on a kohen's figure: the right one goes (gold); the close-up as a portion is laid on the ramp; the wrong pick's word
  pick27(M.phase === 'work' && M.pickJ ? picks27 : [], (j) => M.pickJ(j), 70); globalThis.__S27EV = picks27.map((p) => ({ id: p.id, x: Math.round(p.x), y: Math.round(p.y) }));
  if (M.anim > 0 && M.i < 9) { const S = E_SPOT(M.i); close24(S[0] - 1.5, rampY(S[1]) + 0.4, S[1] - 1, { dist: 11, el: 0.55, hold: 0.7, key: 'evarim' }); }
  if (M.warn) labelW(k, M.warn, -50.6, 22.5, 37, 0.3, { bg: 'rgba(225,238,255,.96)' });
  // ── /slice27 ──
  if (M.say) labelW(k, M.say, -46, 26, 36, 0.3);
  const fz = M.i < 9 ? lerp(E_ROW(M.i)[1], E_SPOT(M.i)[1], 0.5) : 35;
  if (M.anim <= 0 && M.i < 9 && M.phase === 'work') follow(k, -50.6, 17.5, 37, [-24, 12, 3]);   // ── slice27 ── (the row broadside: every kohen a target of his own on the screen) ── /slice27 ──
  else follow(k, -45.5, 17.5, fz, [-10, 17, 20]);
}
function partA(k, j, a, s, y) {   // (dawn2.js's portions: pale abstract shapes; the flour a bowl, the cakes, the wine a jug)
  if (j <= 5) { k.s(a, s, y, 0.2, 0.13, 0.15, j % 2 ? '#E9DFCB' : '#DCCDB2'); if (j % 3 === 0) k.s(a + 0.12, s + 0.1, y + 0.02, 0.1, 0.08, 0.1, '#E2D5BC'); }
  else if (j === 6) { k.c(a, s, y, 0.18, 0.1, SILVER); k.c(a, s, y + 0.05, 0.15, 0.02, '#F6F2E6'); }
  else if (j === 7) { for (let x = 0; x < 3; x++) k.c(a, s, y - 0.02 + x * 0.04, 0.14, 0.03, '#D9B77A'); }
  else { k.c(a, s, y, 0.09, 0.26, '#A89A7E'); k.c(a, s, y + 0.16, 0.05, 0.08, '#A89A7E'); }
}
const evarimTargetA = (M, k) => { if (M.i >= 9) return k.loc(-44.4, rampY(37) + 2.5, 37); const S = E_SPOT(M.i); return k.loc(S[0], rampY(S[1]) + 2.5, S[1]); };

/* ───────────────────────────── the evening Tamid (tamid.js erev) at the real north-east ring, the corners, the ramp, the pyre ───────────────────────────── */
// "של בין הערביים נשחט על קרן מזרחית צפונית, על טבעת שניה" — the ring of the afternoon; the screen; the vessel to NE and (round the north
// and the west) SW; three parts to the ramp's lower west half; the two logs carried up to the great pyre
const EV_RING = TAMID_AFTERNOON, EV_FROM = [-38.5, -45], EV_RECV = [-27.2, -31.0];   // ── blooda25 ── (the ring of the afternoon: places.js TAMID_RING.afternoon)
// ── blooda25 ── the erev's ten acts (tamid.js EV_I): 0 the lamb · 1 the slaughter (gravity) · 2 the receiving · 3 NE · 4 SW · 5 the rest on the
// yesod · 6–8 the parts · 9 the logs
function erevDrawA(k, M, T, dt) {
  if (!M) return;
  try { const B = globalThis.__BLOOD25; if (B) B.cur = { id: M.kind, M }; } catch (e) { /* tests */ }   // ── blooda25 ── (tests read the model)
  if (!M.chan) M.chan = worldChannel(true) ? 1 : 2;
  if (M.pourT > 0 && !M.shir && M.i > 5) M.shir = worldShirayim({ ms: 1500, from: { x: Z_YES[0], y: 17.6, z: Z_YES[1] - 0.4 } }) ? 1 : 2;   // (the act landed between two frames)
  const i = M.i, Z = M.f.z; if (Z.t < 1 && (i === 2 || i === 3 || i === 4 || i === 5)) slow(Z, 't', Z.dur, i === 2 ? 1.6 : i === 3 ? 2.4 : i === 4 ? 5.2 : 1.8, dt);
  for (let j = 0; j < 3; j++) { const c = M.f['c' + j]; if (c.t < 1) slow(c, 't', c.dur, 2.4, dt); }
  if (i >= 6 && i <= 8) k.anchor('ramp'); else if (i === 9 || (i > 9 && M.logs)) k.anchor('altar'); else k.anchor('rings');
  const grave = graveOn(M);
  if (i <= 5) {
    const shown = M.screenT < 0 || M.t - M.screenT < 0.3, L = M.f.lamb, u = ease(clamp(L.t));
    if (shown) { const x = lerp(EV_FROM[0], EV_RING[0], i === 0 && L.t < 1 ? u : 1), z = lerp(EV_FROM[1], EV_RING[1] - 0.6, i === 0 && L.t < 1 ? u : 1), q = k.loc(x, 16, z); lamb(k, q[0], q[1], k.gy(q[0], q[1]), { yaw: dirL(k, -1, 0), step: L.t < 1 ? T * 8 : 0, head: 0.5 }); }
    const sh = M.since(1);
    if (sh >= 0) { k.wb(EV_RING[0], 18.6, EV_RING[1] + 1.4, 0.12, 6, 4.2, LINEN, { yaw: Math.PI / 2 - k.F.yaw }); for (const sg of [-1, 1]) figW(k, EV_RING[0] + sg * 3, EV_RING[1] + 2.3, { dir: [0, -1], robe: ROBE.kohen, arms: 0.95, pose: grave ? 'bow' : 'raise', u: grave ? 0.7 : 1, t: T }); }
    // the receiver: from behind the screen with the vessel, then to NE, round to SW, then to the southern yesod
    let x = EV_RECV[0], z = EV_RECV[1], dir = [1, 1];
    if (i >= 2) {
      const path = i === 2 ? [[EV_RING[0] + 0.6, EV_RING[1] + 1.0], EV_RECV] : i === 3 ? [EV_RECV, Z_NE] : i === 4 ? Z_P2 : Z_P3, w = ease(clamp(Z.t)), p = along(path, w); x = p.x; z = p.z;
      dir = w < 1 ? [p.dx, p.dz] : (i === 3 ? [RG.ne[0] - x, RG.ne[2] - z] : i === 4 ? [RG.sw[0] - x, RG.sw[2] - z] : i === 5 ? [0, -1] : [1, 1]);
    }
    if (i >= 2 && !grave) {
      const pour = M.tilt && M.busy > 0, g = figW(k, x, z, { dir, robe: ROBE.kohen, arms: 0.6, pose: pour ? 'pour' : 'carry', u: 1, t: T }); const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw), va = g.a + ca * 0.5, vs = g.s + sa * 0.5;
      k.c(va, vs, g.y + 1.0, 0.11, 0.3, SILVER, { pitch: pour ? 0.8 : 0 }); if (M.fill > 0.02) liquid(k, va, vs, g.y + 0.97 + 0.15 * Math.min(1, M.fill / 0.7), 0.11, pour ? 0.8 : 0);
      if (M.pourT > 0 && !M.shir) { const h = k.world(va, vs, g.y + 1.0, {}); M.shir = worldShirayim({ ms: 1500, from: h }) ? 1 : 2; }
    }
    M.glowT = M.given[1] ? Math.max(0, 1.6 - (M.t - M.glowAt)) : 0;   // (the four faces glow 1.6 s after the second gift)
    bloodMarks(k, M); bloodGlow(k, M, T);
    if (M.phase === 'work' && !M.walking && M.busy <= 0 && !grave) { const t = i <= 1 ? EV_RING : i === 2 ? EV_RECV : i === 3 ? Z_NE : i === 4 ? Z_SW : Z_YES; cueW(k, M, t[0], 16, t[1], 1.3, T); }
    if (grave) follow(k, EV_RING[0], 16, EV_RING[1], [9, 12, 12]); else bloodCam(k, i === 3 ? 'ne' : i === 4 ? 'sw' : i === 5 ? 'yesod' : '', x, z);
    if (i >= 3) teachTap(k, M);
  } else if (i <= 8) {
    for (let j = 0; j < 3; j++) {
      const c = M.f['c' + j], S = E_SPOT(j * 3), R = E_ROW(j * 3), carrying = i === 6 + j && !M.laid[j], back = M.laid[j];
      const w = ease(clamp(c.t)), path = [R, [R[0], 44.6], E_FOOT, [S[0] + 1.6, S[1]]], p = along(path, carrying ? w : back ? 1 - w : 0);
      const g = figW(k, p.x, p.z, { dir: carrying ? [p.dx, p.dz] : [1, 0], robe: ROBE.kohen, arms: carrying ? 0.55 : 0.1, pose: c.t < 1 ? 'walk' : carrying ? 'carry' : 'stand', u: 1, t: T + j });
      if (carrying) { const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw); partA(k, j, g.a + ca * 0.42, g.s + sa * 0.42, g.y + 0.95); }
      if (M.laid[j]) { const q = k.loc(S[0], rampY(S[1]) + 0.25, S[1]); partA(k, j, q[0], q[1], q[2]); }
    }
    if (M.phase === 'work') { const S = E_SPOT((i - 6) * 3); cueW(k, M, S[0], rampY(S[1]), S[1], 1.2, T); }
    follow(k, -45.5, 17.5, 37, [-10, 17, 20]);
  } else {
    for (const [j, st] of [[0, [-31.8, 3.2]], [1, [-29.6, 3.6]]]) { const f = M.f['w' + j], w = ease(clamp(f.t)), x = lerp(-36.2, st[0], w), z = lerp(8.6, st[1], w); const g = figW(k, x, z, { y: 25, face: [AL.great[0], AL.great[2]], robe: ROBE.kohen, arms: M.logs ? 0.2 : 0.5, pose: M.logs ? 'stand' : 'carry', u: 1, t: T }); if (!M.logs) { const ca = Math.cos(g.yaw), sa = Math.sin(g.yaw); k.c(g.a + ca * 0.35, g.s + sa * 0.35, g.y + 1.05, 0.09, 0.9, '#7A5535', { yaw: -g.yaw + Math.PI / 2, pitch: Math.PI / 2 }); } }
    if (M.logs) for (const d of [-0.6, 0.6]) k.wc(AL.great[0], 28.3, AL.great[2] + d, 0.2, 2.4, '#7A5535', { pitch: Math.PI / 2 });
    if (M.phase === 'work') cueW(k, M, AL.great[0] - 1.5, 25, AL.great[2] + 2.5, 1.4, T);
    follow(k, -31, 25, 2, [10.5, 9.5, 11.5]);
  }
  if (M.say) { const t = erevTargetA(M, k); k.label(M.say, t[0], t[1], t[2] + 1.2, M.say.length > 30 ? 0.22 : 0.3); }
}
function erevTargetA(M, k) { const i = M.i; if (i <= 1) return k.loc(EV_RING[0], 19, EV_RING[1]); if (i === 2) return k.loc(EV_RECV[0], 19, EV_RECV[1]); if (i === 3) return k.loc(Z_NE[0], 19, Z_NE[1]); if (i === 4) return k.loc(Z_SW[0], 19, Z_SW[1]); if (i === 5) return k.loc(Z_YES[0], 19, Z_YES[1]); if (i <= 8) { const S = E_SPOT((i - 6) * 3); return k.loc(S[0], rampY(S[1]) + 2.5, S[1]); } return k.loc(AL.great[0], 28, AL.great[2]); }

/* ───────────────────────────── the registry: work id → its anchored draw ───────────────────────────── */
export const ANCHORED = {
  deshen: { anchor: 'ramp', draw: deshenDrawA, target: deshenTargetA, mid: [0, 0, 1], bounds: [-8, 8, -5, 5, 4] },
  maaracha: { anchor: 'altar', draw: maarachaDrawA, target: maarachaTargetA, mid: [0, 0, 1], bounds: [-6, 6, -6, 6, 3] },
  heichal: { anchor: 'golden', draw: heichalDrawA, target: heichalTargetA, end: heichalEndA, mid: [0, 0, 0.6], bounds: [-2, 2, -2, 2, 2] },
  neirot: { anchor: 'golden', draw: neirotDrawA, target: neirotTargetA, end: neirotEndA, mid: [0, 0, 0.6], bounds: [-2, 2, -2, 2, 2] },
  shaarim: { anchor: 'nikanor', draw: shaarimDrawA, target: shaarimTargetA, mid: [0, 0, 1], bounds: [-2, 2, -3, 3, 4] },
  birkat: { anchor: 'steps', draw: birkatDrawA, target: birkatTargetA, mid: [0, 0, 1], bounds: [-2, 2, -4, 4, 3] },
  shir: { anchor: 'ramp', draw: songDrawA, target: songTargetA, mid: [0, 0, 1], bounds: [-4, 4, -4, 4, 3] },
  shir2: { anchor: 'ramp', draw: songDrawA, target: songTargetA, mid: [0, 0, 1], bounds: [-4, 4, -4, 4, 3] },
  taleh: { anchor: 'pen', draw: talehDrawA, target: talehTargetA, mid: [0, 0, 1], bounds: [-2, 2, -2, 2, 2] },
  night: { anchor: 'moked', draw: nightDrawA, target: nightTargetA, mid: [0, 0, 1], bounds: [-3, 3, -3, 3, 3] },
  zerika: { anchor: 'rings', draw: zerikaDrawA, target: zerikaTargetA, mid: [0, 0, 1], bounds: [-3, 3, -3, 3, 3] },
  evarim: { anchor: 'ramp', draw: evarimDrawA, target: evarimTargetA, mid: [0, 0, 1], bounds: [-3, 3, -3, 3, 3] },
  erev: { anchor: 'rings', draw: erevDrawA, target: erevTargetA, mid: [0, 0, 1], bounds: [-3, 3, -3, 3, 3] },
  ketoret: { anchor: 'steps', draw: ketoretDrawA, target: ketoretTargetA, end: ketoretEndA, mid: [0, 0, 1], bounds: [-4, 4, -4, 4, 3] },
};
/** set W.anchored on each of the given works (by id) */
export function anchorWorks(works) {
  for (const id in ANCHORED) { const W = works[id]; if (W && typeof W === 'object') W.anchored = ANCHORED[id]; }
  try { globalThis.__P24 = { ANCHORED, works }; } catch (e) { /* tests */ }
}
/** the markers (PLACE22) on the real spots: a new place per anchor (p24<anchor>: the floor spot of ANCHORS[a].hero, the place's name),
 *  and the anchored errands re-pointed to it by id (tasks.js TEMPLATES) */
export const TASK_ANCHOR = { 'g-deshen': 'ramp', 'g-maaracha': 'altar', 'g-heichal': 'menorah', 'g-ketoret': 'golden', 'g-neirot': 'golden', 'g-kiddush': 'laver', kiyor: 'laver', kiyor2: 'laver',
  'g-shir': 'duchan', 'g-shir2': 'duchan', 'g-birkat': 'steps', 'g-shaarim': 'nikanor', 'g-taleh': 'pen', watch: 'moked', 'g-zerika': 'rings', 'g-evarim': 'ramp', 'g-erev': 'rings', gates: 'nikanor' };
export function moveMarkers(PLACE, TEMPLATES) {
  for (const id in ANCHORS) { const A = ANCHORS[id]; PLACE['p24' + id] = { x: A.hero[0], z: A.hero[1], he: A.he }; }
  for (const t of TEMPLATES || []) { const a = TASK_ANCHOR[t.id]; if (a) t.place = 'p24' + a; }
}
void LINEN;
