/* ── shift29 ── camera.js — the shift's camera (WAVE29 SHIFT29B): a high, wide follow in which the gate's line and every station stay
 * in the frame at 844×390, the hero toward the middle. It does not own the camera: it sets twin.js's `T.camOver = { el, d, az, ox, oz }`
 * (a fenced hook) — the follow camera's own easing, the lift ("גררו למעלה") and CAM28's guard all stay as they are.
 *   createShiftCam(view, twin, o?) → { on(), off(), focus(pos), state() }
 * The fit, measured (⚑): at 32° (the brief's) the line to him from beyond the court's east wall is blocked and CAM28's guard lifts it anyway — so 54°; the gate (x −2.5) and the laver (x −63.5) are 61 amot apart — no frame of 26–30 amot holds both;
 * the distance is the least that holds them all (30 px margin, 72 under the HUD, the button's corner kept clear), on the court's middle:
 * a still board (w 1 ⚑ — the chips never drift under a finger while he runs); an act glides in to 30 amot and back, fast both ways. Never a Divine Name. ── /shift29 ── */
import { STATIONS } from './stations.js';
import { GATE_SPOT, QUEUE } from './pilgrims.js';
import { SHARED, onTick, proj } from './draw.js';
import { PROF } from '../../prof30.js';
export { proj };

export const CAM29 = { el: 0.95, az: 0.85, w: 1.0, dMin: 30, dMax: 140, margin: 30, top: 72, foot: [150, 150], fov: 32, ease: 1.6, dAct: 30, easeAct: 4.5 };
/** the points that must stay in the frame (world amot) */
export function framePoints(gate = GATE_SPOT) {
  const dx = gate.x - GATE_SPOT.x, dz = gate.z - GATE_SPOT.z, pts = [];
  for (const q of [QUEUE[0], QUEUE[QUEUE.length - 1]]) pts.push([q[0] + dx, gate.y, q[1] + dz]);
  for (const id in STATIONS) { const s = STATIONS[id].at; pts.push([s.x, s.y + 1, s.z]); }
  return pts;
}
/** the frame's middle (the stations and the gate) */
export function frameMid(pts) { let x = 0, z = 0; for (const p of pts) { x += p[0]; z += p[2]; } return { x: x / pts.length, z: z / pts.length }; }
/** the least distance that holds every point (or dMax) for a target and a pose */
export function fitD(tgt, pts, el, az, W, H, c = CAM29) {
  const ce = Math.cos(el), se = Math.sin(el), m = c.margin;
  const ok = (d) => { const cam = [tgt[0] + ce * Math.cos(az) * d, tgt[1] + se * d, tgt[2] + ce * Math.sin(az) * d]; for (const p of pts) { const q = proj(cam, tgt, p, W, H, c.fov); if (!(q[2] > 0 && q[0] >= m && q[0] <= W - m && q[1] >= c.top && q[1] <= H - m) || (c.foot && q[0] > W - c.foot[0] && q[1] > H - c.foot[1])) return false; } return true; };   // (c.foot: the work button's corner, kept clear)
  if (ok(c.dMin)) return c.dMin;
  let lo = c.dMin, hi = c.dMax; if (!ok(hi)) return hi;
  for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
  return hi;
}

// ── shift30 ── the camera INSIDE the world (WAVE30 SHIFT30 (1); the owner 12.10: "נראה מלמעלה מדי … אני בתוך העולם מלווה את הולך
// הרגל"): a follow camera behind the kohen — 30° down, ~20 amot to the look point (⚑ the brief's 13–15: the kohen is 6.5 amot tall, at
// 14 he fills 80 % of a 390-px frame and the pilgrim at his side is cut), the look point 2.5 amot ahead of him and 1.4 up so he stands in
// the lower-middle third; its bearing eases (≤ 1.6 rad/s) to behind the way he goes — the tap-walk's goal, else his pace, else (still, a
// pilgrim with him) toward the next station, so it is seen ahead. An act is played in the same camera: a 15 % push-in over 0.4 s and
// back — never a cut, an orbit or a glide across the court. It sets twin.js's T.camOver as before (+ oy, the look point's lift):
// the twin's own easing, the lift and CAM28's guard all stay. The overview board of shift29 is gone (its fit, framePoints/fitD, stays for the tests' look at the whole court).
export const CAM30 = { el: 0.52, d: 20, ahead: 2.5, oy: 1.4, push: 0.24, pushS: 0.5, turn: 1.1, turnBig: 1.6, steady: true /* ── fable32 ── (no turn while the stick is held, never a turn when he stands: a camera-relative stick needs a camera that does not move under the thumb) ── /fable32 ── */, kWalk: 3.2, kStick: 1.4, kIdle: 1.0, kAct: 2.0, near: 40, lead: 1 / 9, searchS: 0.2, nextAfter: 1.4, orbit: false };
/** the bearings tried round the wanted one when its line to him is cut (the court's east wall is 11 amot from the altar's face: a camera
 *  behind him facing east or west stands in the wall or over the altar's smoke — CAM28 would lift it to a steep look down; a turn along
 *  the court keeps the look from behind him, low) */
export const TURN30 = [0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4];
export const SEARCH30 = [[0, 0.75], [0.35, 1], [-0.35, 1], [0.35, 0.75], [-0.35, 0.75], [0.7, 1], [-0.7, 1], [0.7, 0.75], [-0.7, 0.75], [1.05, 1], [-1.05, 1], [1.4, 1], [-1.4, 1], [1.05, 0.75], [-1.05, 0.75], [1.4, 0.75], [-1.4, 0.75]];   // (0.75: 15 amot — nearer, the 6.5-amah kohen is cut at the frame's foot)
/** the look point for a distance share k: nearer, it comes back over him and up, so he stays whole in the frame */
export const look30 = (c, k) => [c.ahead * Math.max(0, 1 - (1 - k) * 2.4), c.oy + (1 - k) * 3.2];   // (≤ 80°: past that the camera would look at his face, and what is ahead of him falls behind it — CAM28's rise takes over)
// ── fable32 (build 4) ── the genre's camera (the owner 13.10: "בוא נעתיק לא נמציא" — Diner Dash, Cooking Dash, My Café: the camera NEVER
// turns): one fixed bearing from the south-south-east (az 1.05 — the altar's smoke column stands between it and none of the real stations,
// measured), 49° down, dragged after the kohen and pulled back by itself so that he AND his next place are both in the frame (fitD with
// the frame's margins, 24…110 amot); the look point slides up to 14 amot toward the place. An act: 22 amot, the act's own push-in. No
// search, no turn, no guard side-step (CAM28's guard stays on as the last word — it rarely has one at this height). ── /fable32 ──
export const CAM32 = { fixed: true, az: 1.05, el: 0.85, dMin: 24, dMax: 110, oy: 1.2, toward: 0.4, towardMax: 14, margin: 48, top: 84, foot: [190, 175], fov: 32, kIn: 4, kOut: 2.2, kLook: 3,
  // ── fable32 (build 5) ── Roblox's camera (the owner 13.10, Dror's video): the player's right thumb orbits it (a drag on the empty world, right of the stick's zone) and lifts it; a pinch zooms (twin.js zoom.k); it NEVER turns by itself. No fit: a plain distance, the look point a little toward the next place.
  orbit: true, d: 24, elMin: 0.2, elMax: 1.0, dragAz: 0.0065, dragEl: 0.0028, towardO: 0.2, towardMaxO: 5,
  // ── build 12 ── the owner (14.10 22:38): "הפוכה… לא עוקבת אחרי השחקן… קופצנית": the drag's sign flipped (a swipe right looks right); the drag is eased (12/s) instead of
  // instant; a FOLLOW like Roblox's "Follow" camera — while he walks and no thumb is on the camera, the bearing eases round behind his way (0.9 rad/s, after 0.4 s);
  // the stick's bearing is frozen at touch-down (twin.js), so the follow never turns the thumb's "up" under the thumb; the act's camera nearer and lower (he fills the frame)
  follow: true, followK: 0.9, followAfter: 0.4, dragEase: 12, dAct: 15, elAct: 0.6 };
// (build 5.1, the owner 23:45: "המצלמה עלתה לי הרבה פעמים גבוה כך שראיתי רק את ראש הכהן" — Dror's thumb (the video's touch dots, docs/owner-1013/rh_400.jpg) strokes mostly
//  SIDEWAYS in short drags; so: the turn quicker (0.009 rad/px: a half-screen drag ≈ a full turn), the lift slower (0.0028) and only when the stroke is mostly
//  vertical, the top capped at 57° (never the head alone), the start at 45°)
export function createShiftCam(view, twin, o = {}) {
  const c = { ...CAM30, ...(globalThis.__SH_FIXEDCAM === false ? {} : CAM32), ...(o.cam || {}) };
  const S = o.world || (globalThis.__T && globalThis.__T.stages) || null;
  const st = { on: false, az: 0, push: 0, n: 0, mode: '', vx: 0, vz: 0, px: NaN, pz: NaN, want: 0, boff: 0, bk: 1, k: 1, sw: 0, sT: 0, tries: 0, idle: 0 };
  const hp = { x: 0, y: 0, z: 0, yaw: 0 }, cq = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 };
  const hero = () => { try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const walk = () => o.walk || globalThis.__S29W || null;
  const STN = o.stations || STATIONS;
  const back = (dx, dz) => Math.atan2(-dz, -dx);   // (the camera's bearing — from the look point toward the camera — behind a way (dx, dz))
  const seg = () => { const g = globalThis.__DAY && globalThis.__DAY.cam28; return g && typeof g.seg === 'function' ? g : null; };
  function clearAt(h, a, k = 1) {
    const g = seg(); if (!g) return true;
    const [ah, oy] = look30(c, k), ce = Math.cos(c.el), lx = h.x - Math.cos(a) * ah, lz = h.z - Math.sin(a) * ah, ly = (h.y || 16) + 1.6 + oy, d = c.d * k;
    return !g.seg(h.x, (h.y || 16) + 1.6, h.z, lx + ce * Math.cos(a) * d, ly + Math.sin(c.el) * d, lz + ce * Math.sin(a) * d);
  }
  /** → [bearing offset, distance share]: the wanted bearing; nearer on it (a wall close behind him: still from behind, closer); a small
   *  turn, near or not; a bigger turn; the bigger turn nearer — the least change that sees him */
  // (clear now and where his pace takes him in 0.35 s — CAM28's own look ahead: a pose the guard would have to fix fast is never chosen)
  const hq = { x: 0, y: 0, z: 0 };
  const clear2 = (h, a, k = 1) => { if (!clearAt(h, a, k)) return false; const s2 = Math.hypot(st.vx, st.vz); if (!(s2 > 1 && s2 < 40)) return true; hq.x = h.x + st.vx * 0.35; hq.y = h.y; hq.z = h.z + st.vz * 0.35; return clearAt(hq, a, k); };
  function search(h, want, cur, curK) {
    st.tries = 0;
    if (clear2(h, want)) return [0, 1];
    if ((cur || curK < 1) && clear2(h, want + cur, curK)) return [cur, curK];
    for (const [o, k] of SEARCH30) { st.tries++; if (clear2(h, want + o, k)) return [o, k]; }
    return [0, 1];
  }
  /** ── flow31 ── the point `ahead` amot along the gold path (flow31.js: SHARED.path31, from his feet to the next place) ── /flow31 ── */
  function ahead31(h, ahead) {
    const P = SHARED.path31; if (!P || P.length < 2) return null;
    let left = ahead, px = h.x, pz = h.z;
    for (let i = 1; i < P.length; i++) { const dx = P[i].x - px, dz = P[i].z - pz, d = Math.hypot(dx, dz); if (d >= left) return { x: px + dx / d * left, z: pz + dz / d * left }; left -= d; px = P[i].x; pz = P[i].z; }
    return Math.hypot(px - h.x, pz - h.z) > 3 ? { x: px, z: pz } : null;
  }
  // ── fable32 (build 4) ── the fixed camera's frame
  function fixedFrame(dt, h) {
    const W = typeof innerWidth === 'number' ? innerWidth : 844, H = typeof innerHeight === 'number' ? innerHeight : 390;
    const act = SHARED.act, hy = Number.isFinite(h.y) ? h.y : 16;
    let tgt = null;
    if (act) tgt = act;
    else { const P = SHARED.path31; if (P && P.length > 1) tgt = P[P.length - 1]; else if (SHARED.cue && STN[SHARED.cue]) { const q = STN[SHARED.cue].stand; tgt = { x: q.x, z: q.z }; } else if (SHARED.wait > 0 && SHARED.gateAt) tgt = SHARED.gateAt; }
    let ox = 0, oz = 0;
    if (tgt) { const dx = tgt.x - h.x, dz = tgt.z - h.z, dd = Math.hypot(dx, dz); if (dd > 0.1) { const m = Math.min(dd * c.toward, c.towardMax); ox = dx / dd * m; oz = dz / dd * m; } }
    const look = [h.x + ox, hy + 1.6 + c.oy, h.z + oz];
    const pts = [[h.x, hy, h.z], [h.x, hy + 6.6, h.z]]; if (tgt) { const ty = Number.isFinite(tgt.y) ? tgt.y : hy; pts.push([tgt.x, ty, tgt.z], [tgt.x, ty + 4, tgt.z]); }
    const e = (k) => (dt > 0 ? 1 - Math.exp(-dt * k) : 1);
    if (c.orbit) {   // ── fable32 (build 5) ── the orbit camera: the bearing and the lift are the thumb's (st.oaz / st.oel), the distance plain
      if (tgt) { const dx = tgt.x - h.x, dz = tgt.z - h.z, dd = Math.hypot(dx, dz); const m = dd > 0.1 ? Math.min(dd * c.towardO, c.towardMaxO) : 0; ox = dd > 0.1 ? dx / dd * m : 0; oz = dd > 0.1 ? dz / dd * m : 0; }
      if (!Number.isFinite(st.oaz)) { st.oaz = c.az; st.oel = 0.78; st.taz = c.az; st.tel = 0.78; }
      // (the thumb's target bearing/lift eased; the follow: behind his way while he walks and the thumb is off the world)
      if (dt > 0 && Number.isFinite(st.px)) { const kk = Math.min(1, dt * 7), jump = Math.hypot(h.x - st.px, h.z - st.pz) > 6; if (jump) { st.vx = st.vz = 0; } else { st.vx += ((h.x - st.px) / dt - st.vx) * kk; st.vz += ((h.z - st.pz) / dt - st.vz) * kk; } } st.px = h.x; st.pz = h.z;   // (his pace, smoothed ~0.15 s; a teleport is not a pace)
      { const dragging = st.dragOn; const sp = Math.hypot(st.vx, st.vz);
        if (c.follow && !dragging && !act && sp > 3 && sp < 40) { st.walkT = (st.walkT || 0) + (dt || 0); if (st.walkT > c.followAfter) { const want = Math.atan2(-st.vz, -st.vx); let da = want - st.taz; da = Math.atan2(Math.sin(da), Math.cos(da)); const stp = Math.sign(da) * Math.min(Math.abs(da), c.followK * (dt || 0)); st.taz = Math.atan2(Math.sin(st.taz + stp), Math.cos(st.taz + stp)); } } else st.walkT = 0;
        let da2 = st.taz - st.oaz; da2 = Math.atan2(Math.sin(da2), Math.cos(da2)); st.oaz = Math.atan2(Math.sin(st.oaz + da2 * e(c.dragEase)), Math.cos(st.oaz + da2 * e(c.dragEase)));
        const elT = act ? Math.min(st.tel, c.elAct) : st.tel; st.oel += (elT - st.oel) * e(c.dragEase); }
      const dw = Number.isFinite(st.dOver) ? st.dOver : act ? c.dAct : c.d;   // ── fable32 (build 13) ── (st.dOver: the lobby's) ── /fable32 ──
      if (!Number.isFinite(st.fd)) { st.fd = dw; st.fox = ox; st.foz = oz; }
      st.fox += (ox - st.fox) * e(c.kLook); st.foz += (oz - st.foz) * e(c.kLook);
      st.fd += (dw - st.fd) * e(dw < st.fd ? c.kIn : c.kOut);
      st.az = st.want = st.oaz; st.mode = act ? 'act' : 'orbit'; st.d = st.fd; st.k = 1; st.boff = 0; SHARED.swing = false;
      try { globalThis.__SH_STICK_AZ = st.oaz; } catch (err) { /* */ }
      if (twin) twin.camOver = { el: st.oel, d: st.fd, az: st.oaz, ox: st.fox, oz: st.foz, oy: c.oy, shift29: true, shift30: true, fixed32: true, orbit32: true };
      if (PROF.on) PROF.tag(`c:${st.mode}`);
      return;
    }
    const dw = act ? c.dAct : fitD(look, pts, c.el, c.az, W, H, c);
    if (!Number.isFinite(st.fd)) { st.fd = dw; st.fox = ox; st.foz = oz; }
    st.fox += (ox - st.fox) * e(c.kLook); st.foz += (oz - st.foz) * e(c.kLook);
    st.fd += (dw - st.fd) * e(dw < st.fd ? c.kIn : c.kOut);
    st.az = st.want = c.az; st.mode = act ? 'act' : tgt ? 'fit' : 'hold'; st.d = st.fd; st.k = 1; st.boff = 0; SHARED.swing = false;
    try { globalThis.__SH_STICK_AZ = c.az; } catch (err) { /* */ }
    if (twin) twin.camOver = { el: c.el, d: st.fd, az: c.az, ox: st.fox, oz: st.foz, oy: c.oy, shift29: true, shift30: true, fixed32: true };
    if (PROF.on) PROF.tag(`c:${st.mode}`);
  }
  // ── /fable32 ──
  function frame(ms, dt) {
    if (!st.on) return; st.n++;
    const h = hero();
    if (c.fixed) { fixedFrame(dt, h); return; }   // ── fable32 (build 4) ── ── /fable32 ──
    // his pace (smoothed ~0.15 s): a stick's walk has no goal
    // (a teleport — a new round, a test's setPos: behind him as he faces, at once; the twin's own start frame glides to it)
    if (Number.isFinite(st.px) && Math.hypot(h.x - st.px, h.z - st.pz) > 6 && Number.isFinite(h.yaw)) { st.az = st.want = Math.atan2(-Math.cos(h.yaw), -Math.sin(h.yaw)); st.boff = 0; st.bk = st.k = 1; st.arc = 0; st.vx = st.vz = 0; st.px = NaN; st.jumps = (st.jumps | 0) + 1; }
    if (dt > 0 && Number.isFinite(st.px)) { const k = Math.min(1, dt * 7); st.vx += ((h.x - st.px) / dt - st.vx) * k; st.vz += ((h.z - st.pz) / dt - st.vz) * k; }
    st.px = h.x; st.pz = h.z;
    const sp = Math.hypot(st.vx, st.vz);
    if (sp > 40) { st.vx = st.vz = 0; }   // (a teleport is not a pace)
    // the way to look along
    let dir = null, k = c.kIdle, mode = 'hold';
    if (SHARED.cue !== st.cueWas || (SHARED.wait | 0) !== st.waitWas) { st.cueWas = SHARED.cue; st.waitWas = SHARED.wait | 0; st.idle = 0; }   // (a new thing to tap: still again for a moment)
    const act = SHARED.act, W = walk(), wt = W && W.on && W.target ? W.target() : null;
    const stickOn = !!(twin && twin.stick && twin.stick().on);   // ── fable32 ──
    if (act) { mode = 'act'; }
    else if (c.steady && stickOn) { mode = 'stick'; st.stickDir = sp > 2.5 ? [st.vx, st.vz] : st.stickDir; st.stickMoved = (st.stickMoved || 0) + sp * (dt || 0); }   // (the thumb steers: the camera holds its bearing)
    else if (c.steady && !stickOn && st.stickDir && (st.stickMoved || 0) > 4) { dir = st.stickDir; k = c.kStick; mode = 'pace'; if (sp < 2.5) { st.stickDir = null; st.stickMoved = 0; } }   // (released after a walk of ≥ 4 amot: ease behind the way he went)
    else if (c.steady && !stickOn && sp < 2.5) { mode = 'hold'; st.stickMoved = 0; }   // (he stands: nothing turns)   // (an act plays in the same camera: no turn, no orbit — only the push-in below; the brief's rule)
    else if (wt && Math.hypot(wt.x - h.x, wt.z - h.z) > 2.5) { const q = ahead31(h, 9); dir = q ? [q.x - h.x, q.z - h.z] : [wt.x - h.x, wt.z - h.z]; k = c.kWalk; mode = 'walk'; }   // ── flow31 ── (along the gold path, not through the altar to the goal) ── /flow31 ──
    else if (sp > 2.5) { dir = [st.vx, st.vz]; k = c.kStick; mode = 'pace'; }
    else if (!c.steady && SHARED.path31 && (st.idle += dt || 0) > 0.5) { const q = ahead31(h, 9); if (q) { dir = [q.x - h.x, q.z - h.z]; mode = 'next'; } }   // ── flow31 ── (still: toward the next place along its path, however far) ── /flow31 ──
    else if (!c.steady && SHARED.cue && STN[SHARED.cue] && (st.idle += dt || 0) > c.nextAfter) { const s = STN[SHARED.cue].stand, d = Math.hypot(s.x - h.x, s.z - h.z); if (d > 3 && d < c.near) { dir = [s.x - h.x, s.z - h.z]; mode = 'next'; } }   // (still for a moment first: the chips hold still under the finger that is already on its way to the next one)
    else if (!SHARED.f31 /* ── flow31 ── (a tap calls him: no turn toward the line) ── /flow31 ── */ && !SHARED.cue && SHARED.wait > 0 && SHARED.gateAt && (st.idle += dt || 0) > c.nextAfter) { const g = SHARED.gateAt, d = Math.hypot(g.x - h.x, g.z - h.z); if (d > 3 && d < c.near) { dir = [g.x - h.x, g.z - h.z]; mode = 'line'; } }   // (no one with him and someone waiting: toward the line)
    if (mode !== 'hold' && mode !== 'next' && mode !== 'line') st.idle = 0;
    if (dir && Math.hypot(dir[0], dir[1]) > 0.2) st.want = back(dir[0], dir[1]);
    st.mode = mode;
    // (a clear line to him: the wanted bearing, else the nearest turn of it that is clear — 5 times a second; CAM28's guard stays the last word)
    if ((st.sT -= dt || 0) <= 0) { st.sT = c.searchS; const r = search(h, st.want, st.boff || 0, st.bk || 1); st.boff = r[0]; st.bk = r[1]; }
    st.k += ((st.bk || 1) - st.k) * (dt > 0 ? 1 - Math.exp(-dt * 2.5) : 1);
    let da = st.want + (st.boff || 0) - st.az; da = Math.atan2(Math.sin(da), Math.cos(da));
    // (a big turn — he walks back the way he came: round the side whose arc is clear (the court's east wall is one side, the altar's
    //  smoke the other), chosen once and kept until it is done; quicker than a small one, so the frame is never long in the turn)
    if (Math.abs(da) > 1.2) {
      if (!st.arc) { const n = (sg) => { const len = sg === Math.sign(da) ? Math.abs(da) : 2 * Math.PI - Math.abs(da); let k2 = 0; for (const u of [0.25, 0.5, 0.75]) if (!clearAt(h, st.az + sg * len * u)) k2++; return k2; };
        const a = n(Math.sign(da)), b2 = n(-Math.sign(da)); st.arc = b2 < a ? -Math.sign(da) : Math.sign(da); st.arcN = [a, b2]; }
      if (st.arc !== Math.sign(da)) da = da - Math.sign(da) * 2 * Math.PI;   // (the long way round, the clear one)
    } else if (Math.abs(da) < 0.3) st.arc = 0;
    SHARED.swing = Math.abs(da) > 1.0;   // (a big turn under way: the tap-walk goes slowly till the camera is behind him again — walk.js)
    const big = Math.abs(da) > 1.5, step = mode === 'stick' && c.steady ? 0 : dt > 0 ? Math.sign(da) * Math.min(Math.abs(da) * (1 - Math.exp(-dt * k)), (big ? c.turnBig : c.turn) * dt) : 0;   // ── fable32 ── (no step under the thumb) ── /fable32 ──
    st.az = Math.atan2(Math.sin(st.az + step), Math.cos(st.az + step));
    // the act's push-in: 15 % nearer over 0.4 s, and back as fast
    const pw = act ? 1 : 0; st.push += Math.sign(pw - st.push) * Math.min(Math.abs(pw - st.push), dt > 0 ? dt / c.pushS : 1);
    const zl = SHARED.zoomLvl || { d: 1, el: 0 };   // ── fable32 ── (the − / + buttons: flow31.js) ── /fable32 ──
    const ease = st.push * st.push * (3 - 2 * st.push), d = c.d * zl.d * st.k * (1 - c.push * ease);
    const fx = -Math.cos(st.az), fz = -Math.sin(st.az);   // (forward: from the camera toward him, on the ground)
    // (+ his pace × the twin's lag: its target eases at 9/s for this camera — without the lead a run of 20 amot/s leaves him 2.2 amot ahead of the look)
    const lx = sp < 40 ? st.vx * c.lead : 0, lz = sp < 40 ? st.vz * c.lead : 0;
    // (in a big turn the camera orbits HIM: the look point comes back onto him, so he stays in the middle while the court turns round him)
    st.sw += ((c.orbit && Math.abs(da) > 0.8 ? 1 : 0) - st.sw) * (dt > 0 ? 1 - Math.exp(-dt * 6) : 1);   // (c.orbit off: measured — him framed 91 % without, 80–87 % with)
    const lk = look30(c, st.k), ah = lk[0] * (1 - st.sw), oy = lk[1];
    try { globalThis.__SH_STICK_AZ = st.az; } catch (e) { /* */ }   // ── fable32 ── (twin.js: the stick's bearing) ── /fable32 ──
    if (twin) twin.camOver = { el: c.el + zl.el, d, az: st.az, ox: fx * ah + lx, oz: fz * ah + lz, oy, shift29: true, shift30: true };   // ── fable32 ── (+ the zoom level's lift) ── /fable32 ──
    // ── flow31 ── the zoom-out button (flow31.js: SHARED.zoom31 while held): high over the field, the look point between him and the next place ── /flow31 ──
    { const Z = SHARED.zoom31; if (Z && twin && twin.camOver) { const co = twin.camOver, z = Z.k; co.el = c.el + (Z.el - c.el) * z; co.d = d + (Z.d - d) * z; if (Z.mid) { co.ox += (Z.mid.x - h.x - co.ox) * z; co.oz += (Z.mid.z - h.z - co.oz) * z; } co.oy = oy * (1 - z); co.zoom31 = z; st.zoom31 = z; } else st.zoom31 = 0; }
    st.d = d;
    if (PROF.on) PROF.tag(`c:${mode}${Math.abs(da) > 1.2 ? '!' : ''}`);   // (the frame-time log: what this camera did)
  }
  const api = {
    on() {
      if (st.on) return true; st.on = true;
      st.side = globalThis.__CAM28_SIDE; globalThis.__CAM28_SIDE = 0;   // (the day's wall-bearing search off: the bearing is this camera's; CAM28's guard stays on)
      globalThis.__CAM28_HALF = true;   // (the guard's cast every 2nd frame while the line stays clear: the frame budget)
      if (c.orbit) globalThis.__CAM28_PULL = true;   // ── fable32 (build 12) ── (the guard never turns or lifts the thumb's camera: blocked, it comes in to the wall) ── /fable32 ──
      const h = hero();
      // (the first bearing: behind him as he faces — the twin's start frame (T.intro) shows his back the same way)
      st.az = c.fixed ? c.az : Number.isFinite(h.yaw) ? Math.atan2(-Math.cos(h.yaw), -Math.sin(h.yaw)) : 0; st.want = st.az; st.fd = NaN;   // ── fable32 (build 4) ── (the fixed bearing from the first frame) ── /fable32 ── st.push = 0; st.px = NaN; st.vx = st.vz = 0; st.k = st.bk = 1; st.boff = 0;
      try { if (view && view.closeCam) view.closeCam(true, 'shift30'); } catch (e) { /* */ }   // (OrbitControls' 35-amot floor off while the shift's camera is near)
      if (twin) twin.camOver = c.fixed ? { el: c.el, d: c.dMin, az: c.az, ox: 0, oz: 0, oy: c.oy, shift29: true, shift30: true, fixed32: true } : { el: c.el, d: c.d, az: st.az, ox: -Math.cos(st.az) * c.ahead, oz: -Math.sin(st.az) * c.ahead, oy: c.oy, shift29: true, shift30: true };   // ── fable32 (build 4) ── ── /fable32 ──
      frame.__prof = 'cam'; st.off = onTick(frame);   // (the frame-time log's camera share)
      // ── fable32 (build 5) ── the right thumb's drag on the empty world turns and lifts the camera (one finger; a second finger = the twin's pinch, the drag lets go)
      if (c.orbit && typeof document !== 'undefined') {
        const doc = document, D = { id: null, x: 0, y: 0, moved: 0 };
        const onCanvas = (t) => !!(t && (t.tagName === 'CANVAS' || (t.id === 'c') || (t.classList && t.classList.contains('tw-ghost'))));
        const down = (ev) => { if (!st.on || D.id != null || ev.pointerType === 'mouse' && ev.button !== 0) return; if (!onCanvas(ev.target)) return; const W = innerWidth || 844; if (ev.clientX < W * 0.45 && ev.clientY > (innerHeight || 390) * 0.35) return; /* (the stick's zone) */ D.id = ev.pointerId; D.x = ev.clientX; D.y = ev.clientY; D.moved = 0; st.dragOn = true; };
        const move = (ev) => { if (ev.pointerId !== D.id) return; const tw = twin && twin.pinch ? twin.pinch() : null; if (tw) { D.id = null; return; } const dx = ev.clientX - D.x, dy = ev.clientY - D.y; D.x = ev.clientX; D.y = ev.clientY; D.moved += Math.abs(dx) + Math.abs(dy); if (!Number.isFinite(st.oaz)) { st.oaz = c.az; st.oel = 0.78; st.taz = c.az; st.tel = 0.78; } st.taz = Math.atan2(Math.sin(st.taz + dx * c.dragAz), Math.cos(st.taz + dx * c.dragAz)); /* (+: a swipe right looks right — the owner: 'הפוכה') */ const vy = Math.abs(dy) > Math.abs(dx) * 1.2 ? dy : dy * 0.35; st.tel = Math.max(c.elMin, Math.min(c.elMax, (Number.isFinite(st.tel) ? st.tel : st.oel) + vy * c.dragEl)); st.drags = (st.drags | 0) + 1; };
        const up = (ev) => { if (ev.pointerId === D.id) { D.id = null; st.dragOn = false; } };
        doc.addEventListener('pointerdown', down, true); doc.addEventListener('pointermove', move, true); doc.addEventListener('pointerup', up, true); doc.addEventListener('pointercancel', up, true);
        st.offDrag = () => { doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('pointermove', move, true); doc.removeEventListener('pointerup', up, true); doc.removeEventListener('pointercancel', up, true); };
      }
      // ── /fable32 ──
      return true;
    },
    off() {
      if (!st.on) return false; st.on = false; try { delete globalThis.__SH_STICK_AZ; } catch (e) { /* */ }   // ── fable32 ── ── /fable32 ──
      if (st.off) { st.off(); st.off = null; }
      if (st.offDrag) { st.offDrag(); st.offDrag = null; }   // ── fable32 (build 5) ── ── /fable32 ──
      SHARED.board = null;
      if (twin && twin.camOver && twin.camOver.shift29) twin.camOver = null; SHARED.swing = false;
      try { if (view && view.closeCam) view.closeCam(false, 'shift30'); } catch (e) { /* */ }
      if (st.side === undefined) delete globalThis.__CAM28_SIDE; else globalThis.__CAM28_SIDE = st.side; delete globalThis.__CAM28_HALF; delete globalThis.__CAM28_PULL;
      return true;
    },
    focus() { /* (the overview's: none in the follow camera) */ },
    orbit(az, el, d) { if (Number.isFinite(az)) st.oaz = st.taz = az; if (Number.isFinite(el)) st.oel = st.tel = Math.max(c.elMin, Math.min(c.elMax, el)); if (d !== undefined) st.dOver = Number.isFinite(d) && d > 0 ? d : NaN; return [st.oaz, st.oel]; },   // ── fable32 (build 13) ── (+ d: the lobby's own distance) ── /fable32 ──   // ── fable32 (build 5) ── (tests) ── /fable32 ──
    state: () => { let el = c.el; try { if (view && view.camNow) { view.camNow(cq); el = Math.atan2(cq.py - cq.ty, Math.hypot(cq.px - cq.tx, cq.pz - cq.tz)); } } catch (e) { /* */ } return { on: st.on, act: !!SHARED.act, mode: st.mode, fixed: !!c.fixed, orbit: !!c.orbit, oaz: Number.isFinite(st.oaz) ? +st.oaz.toFixed(2) : null, oel: Number.isFinite(st.oel) ? +st.oel.toFixed(2) : null, drags: st.drags | 0, off: +(st.boff || 0).toFixed(2), k: +(st.k || 1).toFixed(2), arc: st.arc || 0, arcN: st.arcN || null, el: c.el, elNow: +el.toFixed(2), az: +st.az.toFixed(2), want: +st.want.toFixed(2), d: +(st.d || c.d).toFixed(1), push: +st.push.toFixed(2), n: st.n }; },
    points: () => framePoints(),
  };
  try { globalThis.__S29C = api; } catch (e) { /* tests */ }
  return api;
}
// ── /shift30 ──
