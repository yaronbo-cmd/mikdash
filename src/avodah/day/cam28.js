/* cam28.js — ── cam28 ── the camera is never inside a solid (WAVE28 CAM28 item 1; the owner's shots 1 and 5 of 12.10):
 * every rendered frame of Phase B (main.js view.guard, called after OrbitControls and before the render) the line from the hero's
 * head (or, under a work's close-up, from the look point) to the camera is tested against the Temple's solids — the stages' built
 * masses (stages.frameBlocked: the courts' walls, the chambers, Beit HaMoked and the pen, the altar and its ramp, the House), the
 * altar's column of smoke (a cone over the pyre), the laver and the slaughter place's tables and pillars. Blocked: the camera rises
 * (the elevation, about the head, up to 80°) until he is seen; when no rise clears it, it comes in to the first hit − 0.8 amah.
 * Never a cut: the guard's own change (a turn, a rise, a pull — on the sphere round him, never through him) moves at most 2.5 amot
 * per 50 ms (a teleport or a new day snap); the wanted camera's own moves pass as they are.
 *   const G = createCamGuard({ S, gy, heroP, view, camera, controls }) · G.step(dt) · G.seg(ax, ay, az, bx, by, bz) → blocked?
 *   G.snap() · G.state() · G.occluded(x, y, z) (a marker chip's anchor seen from the camera)
 * No allocation per frame: numbers and one scratch object. */
import { PROF } from '../../prof30.js';   // ── shift30 ── ── /shift30 ──
const SMK = { x: -29.5, y: 26.6, z: -3.5, r0: 2.6, k: 0.075, top: 230 };   // (life.js FIRE + 1.2: the puffs rise from it and swell)
// the small solids stages.frameBlocked does not hold ([x0, y0, z0, x1, y1, z1], amot): the laver (its stage is skipped there) and
// the slaughter place's marble tables and dwarf pillars north of the altar (Middot 3:5; avodah3d FLOOR_OBS)
const EXTRA = [[-66.1, 15.5, 17.4, -60.9, 31.5, 22.6], [-53.6, 15.5, -61.5, -22.4, 19.0, -54.6],   // (the tables' and the hooks' height: 3 amot over the floor)
  [-177, 15.5, -50.5, -76.7, 116, 50.5]];   // (the Ulam and the House as one block from the line he may not pass — the Heichal's door: a camera never in the porch)
const R = 0.45;   // (the sphere's radius: the boxes grow by it)
const VMAX = 50;   // amot a second (2.5 per 50 ms)
const RISE = [0.09, 0.18, 0.27, 0.36, 0.5, 0.65, 0.8, 0.95, 1.1];
const TURN = [0.6, -0.6, 1.2, -1.2, 1.9, -1.9];
// ── recovered (16–26c) ── the pull-only lift over his shoulder: at most PULL_LIFT, and the camera's elevation at most PULL_EL (the names are the recovery's)
const PULL_LIFT = 0.35, PULL_EL = 0.7;
// ── fable32 (build 40) ── the shift's follow camera never hugs his back by a wall (the coordinator's build-40 brief: build 39's probe at
// 844×390 and the pyre at 640×296 — the hat filling the frame): before the pull, the least rise at his bearing (to `rise`), then a small
// swing round him (`turn`, rad) a little risen — never above `elMax` (the owner's 57° cap, build 5.1); a pull that must come nearer than
// 9 amot rises over his shoulder up to `lift` (to `el`) instead of PULL_LIFT / PULL_EL ── /fable32 ──
export const WALL40 = Object.freeze({ rise: 0.5, turn: Object.freeze([0.35, -0.35, 0.7, -0.7]), elMax: 1.0, lift: 0.6, el: 0.95 });

function segBox(px, py, pz, qx, qy, qz, B) {
  let t0 = 0, t1 = 1;
  const a = [B[0] - R, B[1] - R, B[2] - R], b = [B[3] + R, B[4] + R, B[5] + R], p = [px, py, pz], d = [qx - px, qy - py, qz - pz];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (p[i] < a[i] || p[i] > b[i]) return false; continue; }
    let ta = (a[i] - p[i]) / d[i], tb = (b[i] - p[i]) / d[i]; if (ta > tb) { const t = ta; ta = tb; tb = t; }
    if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 > t1) return false;
  }
  return t1 > 0.03;
}
const inBox = (x, y, z, B) => x > B[0] && x < B[3] && y > B[1] && y < B[4] && z > B[2] && z < B[5];
function segSmoke(ax, ay, az, bx, by, bz) {
  const r0 = (y) => SMK.r0 + SMK.k * Math.max(0, y - SMK.y);
  { const h = ay - SMK.y, r = r0(ay) + 1.5; if (h > -12 && (ax - SMK.x) ** 2 + (az - SMK.z) ** 2 < r * r) return false; }   // (he stands at the pyre: the smoke is his work's, not a wall)
  for (let i = 1; i <= 28; i++) {
    const t = i / 28, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
    if (y < SMK.y || y > SMK.top) continue;
    const r = r0(y); if ((x - SMK.x) ** 2 + (z - SMK.z) ** 2 < r * r) return true;
  }
  return false;
}

export function createCamGuard(o = {}) {
  const S = o.S, gy = o.gy || (() => 16);
  const g = { on: false, ox: 0, oy: 0, oz: 0, cx: 0, cy: 0, cz: 0, cA: 0, cE: 0, cK: 1, tA: 0, tE: 0, tK: 1, have: false, snap: true, mode: 'free', rise: 0, pull: 1, t: 0, n: 0, blk: 0, fix: 0, ms: 0, last: null, hx: 0, hy: 0, hz: 0, src: 'hero', why: '' };
  const hp = { x: 0, y: 0, z: 0 }, cq = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 };
  /** does a solid stand on the segment from the look point a to the camera b (or hold b)? */
  function seg(ax, ay, az, bx, by, bz) {
    if (!(Number.isFinite(ax) && Number.isFinite(bx) && Number.isFinite(by))) return false;
    const gb = gy(bx, bz); if (by < gb + 1.0) return true;
    { const L = Math.hypot(bx - ax, by - ay, bz - az), k = L > 1.6 ? 0.8 / L : 0, sx = ax + (bx - ax) * k, sy = ay + (by - ay) * k, sz = az + (bz - az) * k;   // (from 0.8 amah out of his head: a table he stands at is not a wall to him)
      for (let i = 0; i < EXTRA.length; i++) { const B = EXTRA[i]; if (inBox(ax, ay, az, B)) continue; if (segBox(sx, sy, sz, bx, by, bz, B)) return true; } }
    if (segSmoke(ax, ay, az, bx, by, bz)) return true;
    try { if (S && typeof S.frameBlocked === 'function' && S.frameBlocked(bx, Math.max(by, gb + 3.05), bz, ax, ay, az, 'x')) return true; } catch (e) { /* the world's */ }
    return false;
  }
  /** the first blocked share of the segment (bisection, 7 steps) — 1 when clear */
  function firstHit(ax, ay, az, bx, by, bz) {
    if (!seg(ax, ay, az, bx, by, bz)) return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 7; i++) { const m = (lo + hi) / 2; if (seg(ax, ay, az, ax + (bx - ax) * m, ay + (by - ay) * m, az + (bz - az) * m)) hi = m; else lo = m; }
    return lo;
  }
  const P = { x: 0, y: 0, z: 0 };
  /** the pose about the look point a: the wanted vector (vx, vy, vz) raised by `rise` (radians, capped at 80°) and pulled to `pull` of its length */
  function pose(ax, ay, az, vx, vy, vz, rise, pull) {
    const hl = Math.hypot(vx, vz), D = Math.hypot(hl, vy) * pull; let el = Math.atan2(vy, hl) + rise; if (el > 1.4) el = 1.4;
    const ux = hl > 1e-6 ? vx / hl : 1, uz = hl > 1e-6 ? vz / hl : 0;
    P.x = ax + ux * Math.cos(el) * D; P.y = ay + Math.sin(el) * D; P.z = az + uz * Math.cos(el) * D; return P;
  }
  /** one rendered frame: the camera as OrbitControls left it → the guarded one (view.camSet keeps the target) */
  function step(dt) {
    if (!g.on || !o.view) return;
    const t0 = performance.now();
    o.view.camNow(cq);
    const h = o.heroP ? o.heroP() : null; if (!h || !Number.isFinite(h.x)) return;
    // the look point: his head; under a work's own camera (a close-up or the place's view: o.look() says so) the camera's own target
    const lk = o.look ? o.look() : null;
    let ax = h.x, ay = h.y + 1.6, az = h.z; g.src = 'hero';
    if (lk === 'target') { ax = cq.tx; ay = cq.ty; az = cq.tz; g.src = 'target'; }
    else if (lk === 'off') { g.have = false; g.mode = 'off'; return; }
    g.hx = ax; g.hy = ay; g.hz = az;
    const wx = cq.px, wy = cq.py, wz = cq.pz, vx = wx - ax, vy = wy - ay, vz = wz - az;
    // (ahead of time: where the wanted camera and his head will be in 0.35 s and 0.8 s at their pace now — a wall coming is risen over before it is reached,
    //  so the 50-amot-a-second correction is rarely late)
    // (the pace is smoothed over ~0.2 s: one frame's jitter is not a direction; two looks ahead, 0.35 s and 0.8 s)
    const pv = g.pv || (g.pv = { x: wx, y: wy, z: wz, ax, ay, az, vx: 0, vy: 0, vz: 0, hx: 0, hy: 0, hz: 0 }), idt = dt > 1e-4 ? 1 / dt : 0, sm = Math.min(1, dt * 5);
    pv.vx += ((wx - pv.x) * idt - pv.vx) * sm; pv.vy += ((wy - pv.y) * idt - pv.vy) * sm; pv.vz += ((wz - pv.z) * idt - pv.vz) * sm;
    pv.hx += ((ax - pv.ax) * idt - pv.hx) * sm; pv.hy += ((ay - pv.ay) * idt - pv.hy) * sm; pv.hz += ((az - pv.az) * idt - pv.hz) * sm;
    if (Math.hypot(pv.vx, pv.vy, pv.vz) > 40 || Math.hypot(pv.hx, pv.hz) > 40) { pv.vx = pv.vy = pv.vz = pv.hx = pv.hy = pv.hz = 0; }   // (a teleport is not a pace)
    pv.x = wx; pv.y = wy; pv.z = wz; pv.ax = ax; pv.ay = ay; pv.az = az;
    const ahead = Math.hypot(pv.vx, pv.vy, pv.vz) > 0.3 || Math.hypot(pv.hx, pv.hz) > 0.3;
    const segAt = (qx, qy, qz, k) => seg(ax + pv.hx * k, ay + pv.hy * k, az + pv.hz * k, qx + pv.vx * k, qy + pv.vy * k, qz + pv.vz * k);
    let useAhead = true;
    const segBoth = (qx, qy, qz) => seg(ax, ay, az, qx, qy, qz) || (ahead && useAhead && (segAt(qx, qy, qz, 0.35) || segAt(qx, qy, qz, 0.8)));
    // the clear pose, as a change of the wanted one about the look point — (turn of the bearing, rise of the elevation, share of the
    // distance): none · the least rise that sees him · a turn, a little risen · the pull to the first hit − 0.8 amah
    g.n++;
    let tA = 0, tE = 0, tK = 1, mode = 'free';
    // ── shift30 ── (the budget, during the shift: while the line has been clear and nothing of the guard's own is applied, the cast runs every 2nd frame —
    // its look ahead (0.35 s, 0.8 s) already sees a wall coming; a teleport or a new day (snap) casts at once) ── /shift30 ──
    const skip = g.have && !g.snap && g.mode === 'free' && g.cA === 0 && g.cE === 0 && g.cK === 1 && (g.n & 1) === 1 && !!globalThis.__CAM28_HALF;   // (the shift's camera asks it (camera.js on): the day keeps its every-frame cast — its walks' own test counts single frames)
    if (skip) g.skips = (g.skips | 0) + 1;
    if (!skip && segBoth(wx, wy, wz)) {
      g.blk++;
      const hl0 = Math.hypot(vx, vz) || 1, a0 = Math.atan2(vz, vx), e0 = Math.atan2(vy, hl0);
      const tryP = (A, E, K, md) => { if (performance.now() - t0 > 9) return false;   // (a frame's budget: past 9 ms the search stops — the pull, or the last answer)
        const a = a0 + A, q = pose(ax, ay, az, Math.cos(a) * hl0, vy, Math.sin(a) * hl0, E, K); if (segBoth(q.x, q.y, q.z)) return false; tA = A; tE = E; tK = K; mode = md; return true; };
      // (the last answer first, while it still sees him: a steady camera, no hunting)
      let got = (g.tE > 0 || g.tA || g.tK < 1) && tryP(g.tA, g.tE, g.tK, g.mode === 'free' ? 'rise' : g.mode);
      const now = performance.now();
      if (!got && now - (g.sT || 0) < 100 && g.sAns && g.sAns[3] !== 'pull') got = tryP(g.sAns[0], g.sAns[1], g.sAns[2], g.sAns[3]);   // (the last search's answer, while it still sees him)
      if (!got) {
        g.sT = now;
        // ── fable32 (build 12) ── the shift's orbit camera (globalThis.__CAM28_PULL): the bearing and the lift are the thumb's — never turned or risen by the guard
        // (the owner: 'הפוכה… קופצנית… נעלם'); blocked, it only comes in to the first hit, as Roblox's does ── /fable32 ──
        const pullOnly = !!globalThis.__CAM28_PULL;
        // the least rise at his bearing · a turn, risen · then all round him, higher and nearer · the pull to the first hit
        // (twice: with the look ahead, then — his next steps lead into a wall he cannot pass — without it)
        if (!pullOnly) for (const ah of ahead ? [true, false] : [false]) {
          useAhead = ah; if (got) break;
          for (let i = 0; !got && i < RISE.length; i++) got = tryP(0, RISE[i], 1, 'rise');
          for (let i = 0; !got && i < TURN.length; i++) for (const r of [0.18, 0.5, 0.9]) if ((got = tryP(TURN[i], r, 1, 'turn'))) break;
          if (!got) search: for (const K of [0.75, 0.5]) for (const E of [0.75, 1.05, 1.35]) for (let j = 0; j < 12; j++) { const A = (j % 2 ? -1 : 1) * Math.ceil(j / 2) * (Math.PI / 6); if (tryP(A, Math.max(0, E - e0), K, 'round')) { got = true; break search; } }
          // (under a roof — Nikanor's gateway, a chamber's door — nothing above sees him: low and near, along the way he stands in)
          if (!got) low: for (const K of [0.4, 0.25]) for (const E of [0.3, 0.12]) for (let j = 0; j < 12; j++) { const A = (j % 2 ? -1 : 1) * Math.ceil(j / 2) * (Math.PI / 6); if (tryP(A, E - e0, K, 'low')) { got = true; break low; } }
        }
        if (pullOnly) for (const ah of ahead ? [true, false] : [false]) {   // ── fable32 (build 40) ── WALL40 ── /fable32 ──
          useAhead = ah; if (got) break;
          const cap = Math.max(0, WALL40.elMax - e0);
          for (let i = 0; !got && i < RISE.length && RISE[i] <= Math.min(WALL40.rise, cap); i++) got = tryP(0, RISE[i], 1, 'rise');
          for (let i = 0; !got && i < WALL40.turn.length; i++) for (const r of [0.09, 0.27, 0.45]) if (r <= cap && (got = tryP(WALL40.turn[i], r, 1, 'turn'))) break;
        }
        useAhead = true;
        if (!got) {
          mode = 'pull';
          let r = pullOnly ? 0 : 0.36, q = pose(ax, ay, az, vx, vy, vz, r, 1), qx = q.x, qy = q.y, qz = q.z, L = Math.hypot(qx - ax, qy - ay, qz - az) || 1;
          let t = firstHit(ax, ay, az, qx, qy, qz);
          let kMax = 1;
          if (pullOnly && t * L < 9) {   // (pulled nearer than 9 amot — his back would fill the frame: the camera also rises a little, to look over his shoulder — and stays near, at most 3 amot farther than the pull)
            const d0 = t * L; r = Math.min(WALL40.lift, (9 - d0) / 9 * 1.1); if (e0 + r > WALL40.el) r = Math.max(0, WALL40.el - e0);   /* ── fable32 (build 40) ── (was PULL_LIFT / PULL_EL) ── /fable32 ── */ q = pose(ax, ay, az, vx, vy, vz, r, 1); qx = q.x; qy = q.y; qz = q.z; L = Math.hypot(qx - ax, qy - ay, qz - az) || 1; t = firstHit(ax, ay, az, qx, qy, qz); kMax = (d0 + 4) / L;   // ── recovered (16–26c) ── (capped)
          }
          tA = 0; tE = r; tK = Math.min(kMax, Math.max(Math.min(1, (pullOnly ? 5 : 6) / L), t - 0.8 / L));   // (pull-only: as near as 5 amot)
        }
        g.sAns = [tA, tE, tK, mode];
      }
    }
    g.mode = mode; g.tA = tA; g.tE = tE; g.tK = tK; g.rise = tE; g.pull = tK; g.turn = tA;
    // never a cut: the guard's own change moves round him (on the sphere about the look point, not through it) at ≤ 50 amot a second —
    // 2.5 per 50 ms (a snap: at once); the wanted camera's own moves (the follow, the lift, the overview) pass untouched
    const D = Math.hypot(vx, vy, vz) || 1;
    if (g.snap || !g.have) { g.cA = tA; g.cE = tE; g.cK = tK; g.have = true; g.snap = false; }
    else {
      // (the camera already behind a wall — his line cut NOW — moves three times as fast, still a glide: ⚑ 7.5 amot per 50 ms)
      let fast = 1;
      if (Math.abs(g.cA - tA) + Math.abs(g.cE - tE) + Math.abs(g.cK - tK) > 1e-4) { const hl = Math.hypot(vx, vz) || 1, a = Math.atan2(vz, vx) + g.cA, q = pose(ax, ay, az, Math.cos(a) * hl, vy, Math.sin(a) * hl, g.cE, g.cK); if (seg(ax, ay, az, q.x, q.y, q.z)) fast = 3; }
      g.fast = fast;
      const arc = VMAX * fast * Math.max(dt, 1 / 120), el = Math.atan2(vy, Math.hypot(vx, vz)) + g.cE;
      const lim = (cur, want, m) => (Math.abs(want - cur) <= m ? want : cur + Math.sign(want - cur) * m);
      g.cA = lim(g.cA, tA, arc / (D * Math.max(0.25, Math.cos(Math.min(1.4, el))))); g.cE = lim(g.cE, tE, arc / D); g.cK = lim(g.cK, tK, arc / D);
    }
    { const hl = Math.hypot(vx, vz) || 1, a = Math.atan2(vz, vx) + g.cA; const q = pose(ax, ay, az, Math.cos(a) * hl, vy, Math.sin(a) * hl, g.cE, g.cK); g.ox = q.x; g.oy = q.y; g.oz = q.z; }
    g.w = [wx, wy, wz]; g.a = [ax, ay, az];
    g.cx = g.ox - wx; g.cy = g.oy - wy; g.cz = g.oz - wz;
    const moved = Math.hypot(g.cx, g.cy, g.cz) > 0.02;
    if (moved) { g.fix++; o.view.camSet(g.ox, g.oy, g.oz, cq.tx, cq.ty, cq.tz); }
    // (a camera nearer than OrbitControls' 35 amot, or a near plane at 4 that cuts a wall 3 amot away: the near limits are held, keyed)
    const near = moved && Math.hypot(g.ox - cq.tx, g.oy - cq.ty, g.oz - cq.tz) < 36;
    if (near !== !!g.held && o.view.closeCam) { o.view.closeCam(near, 'cam28'); g.held = near; }
    g.ms = performance.now() - t0;
    if (PROF.on) PROF.tag(`g:${g.mode}${g.fast > 1 ? '!' : ''}${moved ? '+' : ''}`);   // ── shift30 ── (the frame-time log: what the guard did) ── /shift30 ──
  }
  // (a marker chip's anchor behind a wall from the camera: cached per anchor, 4 a second)
  const OC = new Map();
  function occluded(x, y, z, key) {
    const now = performance.now(), c = OC.get(key);
    if (c && now - c.t < 250) return c.v;
    o.view.camNow(cq);
    let v = false;
    for (let i = 0; i < EXTRA.length && !v; i++) if (segBox(x, y, z, cq.px, cq.py, cq.pz, EXTRA[i]) && !inBox(x, y, z, EXTRA[i])) v = true;
    try { if (!v && S && typeof S.frameBlocked === 'function') v = !!S.frameBlocked(cq.px, Math.max(cq.py, gy(cq.px, cq.pz) + 3.05), cq.pz, x, y, z, 'x'); } catch (e) { v = false; }
    if (OC.size > 40) OC.clear();
    OC.set(key, { t: now, v }); return v;
  }
  return {
    step, seg, firstHit, occluded,
    on(v) { v = !!v; if (v === g.on) return; g.on = v; g.snap = true; g.have = false; if (!v && g.held && o.view && o.view.closeCam) { o.view.closeCam(false, 'cam28'); g.held = false; } },
    snap() { g.snap = true; },
    state: () => ({ on: g.on, mode: g.mode, turn: g.turn || 0, w: (g.w || []).map((v) => +v.toFixed(1)), cur: [+g.cA.toFixed(2), +g.cE.toFixed(2), +g.cK.toFixed(2)], a: (g.a || []).map((v) => +v.toFixed(1)), rise: +g.rise.toFixed(2), pull: +g.pull.toFixed(2), n: g.n, blk: g.blk, skips: g.skips | 0, fix: g.fix, ms: +g.ms.toFixed(2), src: g.src, held: !!g.held, cam: [g.ox, g.oy, g.oz].map((v) => +v.toFixed(1)) }),
    smoke: SMK, extra: EXTRA,
  };
}
// ── /cam28 ──
