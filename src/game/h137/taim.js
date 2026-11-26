/* ── build 137 ── h137/taim.js — work 1 "מבוך התאים והמסיבה" (spec docs/specs/shlav-14-he.md v3, עבודה 1; the model: taim-model.js).
 * The cells' wing in SECTION: isometric from the north-east, 30° over; the walls on the camera's side (north, east) at 25%; the floors
 * above his storey lifted away. One camera point for each cell (a fixed view: it moves only after both fingers have left); in the
 * long places (the passage, the Heichal, the mesibah, the roofs) the view re-centres on him on a lift, and while a finger holds him he
 * stops at the view's edge instead of walking out of it.
 *   · the work hand: a drag that starts on his pelvis (56 × 56 dp) — along the way he faces: forward (40–56 dp = full), back;
 *     level 1: the drag's own direction turns him too (one hand is enough), and he turns by himself toward the opening ahead (≤ 30°);
 *   · the helper hand: the ring round his feet (on the floor, sky blue): a finger circling it turns him (from level 2 the only way);
 *     between the ring's touch zone and the pelvis's: ≥ 20 dp (edge to edge);
 *   · the next opening glows on the floor; the openings passed keep a thin strip of light; at the junction (levels 1–2) five little
 *     wooden signs, a symbol each: cell, the cell above, the mesibah, the pishpash, the Heichal;
 *   · a cell he leaves "settles": its ceiling's beams come down on the ledge with a dull thud and dust (automatic: the reward);
 *   · the end: at the upper door (level 3) or the last step, a ray through every opening he passed: the whole maze lit in section.
 * Mouse: the left button = the work hand (on the pelvis); the right button pressed on the ring = the helper hand.
 *   TAIM_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act } */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as K from './taim-model.js';
import { mats14, box, kohenWalker, signTex } from './look.js';
import { award, extra, hurt, finish, V3, lens, voices14, ring, HANDS, dp, fingers } from './kit14.js';

const S14 = BOOK.s14, TA = S14.taim, CAM = TA.cam;
export const TT = Object.freeze({ PELVIS: 28, RING_IN: 46, RING_OUT: 104, GAP: 20, FULL: 48, DEAD: 6, EDGE: 0.1, WALL_H: 4.6, DOOR_H: 3.6 });
const RAD = Math.PI / 180;
const lvOf = (y) => Math.round((y - TA.floors[0]) / 5);
/** the camera for a room: the fixed view of a cell (its centre), or of a point (the long places: where he stands) */
export function camFor(x, y, z) {
  const el = CAM.el * RAD, d = CAM.dist, ax = x, ay = y + CAM.lift, az = z;
  return [[ax + CAM.dir[0] * d * Math.cos(el), ay + d * Math.sin(el), az + CAM.dir[1] * d * Math.cos(el)], [ax, ay, az]];
}
const fixedRoom = (R) => R && R.kind !== 'hall';
/* ───────── the maze drawn in section: the stone between the rooms (rasterised and merged into blocks, cut at CUT over each storey's
   floor), the camera's side (the cells' outer wall and the mesibah's, the east wall) at 25% to the storey's full height; the floors;
   the ceilings with their hatches; the light strips; the signs ───────── */
export const CUT = 2.0, RES = 0.25;
function massBlocks(region, freeAt) {
  const [X0, Z0, X1, Z1] = region, nx = Math.round((X1 - X0) / RES), nz = Math.round((Z1 - Z0) / RES), solid = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) solid[j * nx + i] = freeAt(X0 + (i + 0.5) * RES, Z0 + (j + 0.5) * RES) ? 0 : 1;
  const out = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    if (!solid[j * nx + i]) continue;
    let w = 1; while (i + w < nx && solid[j * nx + i + w]) w++;
    let h = 1; grow: while (j + h < nz) { for (let k = 0; k < w; k++) if (!solid[(j + h) * nx + i + k]) break grow; h++; }
    for (let jj = 0; jj < h; jj++) for (let k = 0; k < w; k++) solid[(j + jj) * nx + i + k] = 0;
    out.push([X0 + i * RES, Z0 + j * RES, X0 + (i + w) * RES, Z0 + (j + h) * RES]);
  }
  return out;
}
function buildMaze(X, root, lv) {
  const T = X.THREE, Mt = mats14(X), G = { levels: new Map(), strips: new Map(), signs: [] };
  const grp = (k) => { if (!G.levels.has(k)) { const g = new T.Group(); g.name = 'h137-maze-' + k; root.add(g); G.levels.set(k, g); } return G.levels.get(k); };
  const roofish = (R) => R.id.startsWith('m') || R.id.startsWith('r') || R.id === 'upDoor';
  // the stone of each storey: rasterised round the rooms on that floor (the mesibah's lane is open on every storey: the ramp passes)
  for (let f = 0; f < 3; f++) {
    const y = TA.floors[f], on = K.ROOMS.filter((R) => typeof R.y === 'number' && Math.abs(R.y - y) < 0.6 && !roofish(R) && R.id !== 'ulam');
    const free = (x, z) => (z > TA.mesibah.z0 && z < TA.mesibah.z1) || on.some((R) => x > R.r[0] && x < R.r[2] && z > R.r[1] && z < R.r[3]) || (f > 0 && z > -10);
    const region = f === 0 ? [-176, -35, -92, -4] : [-176, -35, -98, -10];
    for (const b of massBlocks(region, free)) {
      const glass = b[3] <= TA.outer + 1e-6 || b[0] >= -98 - 1e-6;
      const m = box(X, glass ? Mt.y14glass : Mt.y14stone, b[0], y - 0.3, b[1], b[2], y + (glass ? 5 : CUT), b[3], grp(f));
      if (glass) { m.castShadow = false; m.renderOrder = 2; m.name = 'h137-glass'; } else m.name = 'h137-mass';
    }
  }
  for (const R of K.ROOMS) {
    const [x0, z0, x1, z1] = R.r, ramp = typeof R.y !== 'number', yA = ramp ? R.y.x0 : R.y, yB = ramp ? R.y.x1 : R.y;
    const key = roofish(R) ? 'roof' : lvOf(yA), g = grp(key);
    if (R.id === 'ulam') { box(X, Mt.y14stoneB, x0, yA - 0.3, z0, x1, yA, z1, g); continue; }
    // the floor (a ramp: tilted)
    if (ramp) { const L = Math.hypot(x1 - x0, yB - yA), m = new T.Mesh(X.props.geo.box, Mt.y14floor); m.scale.set(L, 0.3, z1 - z0); m.position.set((x0 + x1) / 2, (yA + yB) / 2 - 0.15, (z0 + z1) / 2); m.rotation.z = Math.atan2(yB - yA, x1 - x0); m.receiveShadow = true; g.add(m); }
    else if (!(R.kind === 'cell' && R.f > 0)) box(X, R.id === 'heichal' ? Mt.y14stoneB : Mt.y14floor, x0, yA - 0.3, z0, x1, yA, z1, g).name = 'h137-floor';
    // the mesibah's and the roofs' low parapets (the camera's side at 25%)
    if (roofish(R)) for (const W of K.wallsOfRoom(R.id)) {
      const n = W.n, glass = n[0] > 0 || n[1] < 0, xa = Math.min(W.a[0], W.b[0]), xb = Math.max(W.a[0], W.b[0]), za = Math.min(W.a[1], W.b[1]), zb = Math.max(W.a[1], W.b[1]);
      const ya = Math.min(K.floorY(R, xa), K.floorY(R, xb)), yb = Math.max(K.floorY(R, xa), K.floorY(R, xb));
      const m = box(X, glass ? Mt.y14glass : Mt.y14stone, xa + (n[0] < 0 ? -0.5 : 0), ya - 0.3, za + (n[1] < 0 ? -0.5 : 0), xb + (n[0] > 0 ? 0.5 : 0), yb + (R.kind === 'end' ? 3.6 : 1.2), zb + (n[1] > 0 ? 0.5 : 0), g);
      if (glass) { m.castShadow = false; m.renderOrder = 2; }
    }
    // a cell's ceiling = the floor of the one above it (with its hatch's hole), drawn in that storey's group (lifted away below it)
    if (R.kind === 'cell' && R.f < 2) {
      const up = K.roomOf(`n${R.f + 1}c${R.i}`), [ux0, uz0, ux1, uz1] = up.r, y = up.y, hx = R.hatch.x, hz = R.hatch.z, hh = 0.75, gu = grp(lvOf(y));
      box(X, Mt.y14floor, ux0, y - 0.3, uz0, hx - hh, y, uz1, gu); box(X, Mt.y14floor, hx + hh, y - 0.3, uz0, ux1, y, uz1, gu);
      box(X, Mt.y14floor, hx - hh, y - 0.3, uz0, hx + hh, y, hz - hh, gu); box(X, Mt.y14floor, hx - hh, y - 0.3, hz + hh, hx + hh, y, uz1, gu);
      const rim = new T.Mesh(new T.RingGeometry(hh * 0.98, hh * 1.25, 4, 1), Mt.y14woodD); rim.rotation.x = -Math.PI / 2; rim.rotation.z = Math.PI / 4; rim.position.set(hx, y + 0.02, hz); gu.add(rim);
      const mark = new T.Mesh(new T.RingGeometry(0.3, 0.38, 20), Mt.y14strip); mark.rotation.x = -Math.PI / 2; mark.position.set(hx, R.y + 0.03, hz); mark.visible = false; grp(R.f).add(mark); G.strips.set('hatch:' + R.id, mark);
      // (the hatch seen from below: a square of light in the ceiling)
      const sky = new T.Mesh(new T.PlaneGeometry(hh * 1.9, hh * 1.9), Mt.y14strip); sky.rotation.x = Math.PI / 2; sky.position.set(hx, y - 0.32, hz); sky.material = Mt.y14next; grp(R.f).add(sky);
    }
  }
  // the light strip at each opening (on its floor, across it): off, next (pulsing), passed (thin, steady)
  for (const J of K.JOINS) {
    const A = K.roomOf(J.a), B = K.roomOf(J.b); if (!(A.kind === 'door' || B.kind === 'door' || A.kind === 'end' || B.kind === 'end' || A.kind === 'corner' || B.kind === 'corner' || (roofish(A) && roofish(B)))) continue;
    const m = new T.Mesh(new T.PlaneGeometry(1, 1), Mt.y14next.clone()); m.rotation.x = -Math.PI / 2;
    const mid = (J.lo + J.hi) / 2, len = J.hi - J.lo, y = K.floorY(A, J.axis === 'x' ? J.at : mid) + 0.04;
    if (J.axis === 'x') { m.scale.set(0.45, len, 1); m.position.set(J.at, y, mid); } else { m.scale.set(len, 0.45, 1); m.position.set(mid, y, J.at); }
    m.visible = false; m.userData.J = J; grp(roofish(A) ? 'roof' : lvOf(K.floorY(A, mid))).add(m);
    G.strips.set(J.a + '|' + J.b, m);
  }
  // the junction's five signs (levels 1–2): over each opening, facing into the junction (the cut keeps them in view: low, on posts)
  if (lv < 3) {
    const y = TA.floors[0] + 2.6;
    const put = (key, x, z, ry) => { const m = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), signTex(X, key)); m.position.set(x, y, z); m.rotation.y = ry; grp(0).add(m); G.signs.push(m); return m; };
    put('cell', TA.junction.x0 + 0.35, -18.2, Math.PI / 2);
    put('mesibah', -101.2, TA.outer + 0.35, 0);
    put('heichal', -104.8, TA.inner[0] - 0.35, Math.PI);
    put('pishpash', TA.junction.x1 - 0.35, -21.2, -Math.PI / 2);
    const up = put('up', -100.5, TA.floors[0] + 0.05, -18.4); up.rotation.set(-Math.PI / 2, 0, 0); up.position.set(-102.3, TA.floors[0] + 0.05, -20.4);
  }
  return G;
}
function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices14(X), Mt = mats14(X);
  const root = new T.Group(); root.name = 'h137-taim-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, work: null, helper: null, mouseR: null, camKey: '', walkPh: 0, settle: [], passed: new Set() };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 30) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  const G = buildMaze(X, root, lv);
  const chipAt = (x, y, z) => { const c = box(X, Mt.y14break, x - 0.15, y + 0.6, z - 0.15, x + 0.15, y + 1.0, z + 0.15, root); c.rotation.y = 0.6; return c; };
  for (const c of Mo.st.corners || []) if (c && c.x != null) chipAt(c.x, c.y, c.z);   // (the corners broken on earlier visits stay)
  const kohen = kohenWalker(X); root.add(kohen);
  const ringM = new T.Mesh(new T.TorusGeometry(0.95, 0.07, 6, 40), Mt.y14ringL); ringM.rotation.x = -Math.PI / 2; ringM.renderOrder = 5; root.add(ringM);
  const tick = new T.Mesh(new T.ConeGeometry(0.16, 0.36, 6), Mt.y14ringL); tick.rotation.z = -Math.PI / 2; tick.renderOrder = 5; root.add(tick);   // (the ring's mark: the way he faces)
  const rings = { work: ring(HANDS.R), helper: ring(HANDS.L) };
  try { X.kohen(false); } catch (e) { /* (only the walker: the hero hidden for the act) */ }
  const cam0 = X.camera, fov0 = cam0.fov;
  // ── the view: the room's fixed point, or where he stands (the long places); only with no finger down
  function camTo(d = 0.6) {
    const R = K.roomOf(S.room);
    if (R && R.kind === 'door') return;
    const key = fixedRoom(R) ? 'room:' + R.id : 'at:' + S.x.toFixed(1) + ',' + S.z.toFixed(1) + ',' + S.y.toFixed(1);
    if (key === A.camKey) return; A.camKey = key;
    const [x, z] = fixedRoom(R) ? [(R.r[0] + R.r[2]) / 2, (R.r[1] + R.r[3]) / 2] : [S.x, S.z];
    const [eye, aim] = camFor(x, fixedRoom(R) ? K.floorY(R, x) : S.y, z);
    lens(X, CAM.fov); X.shot(eye, aim, d);
  }
  // ── the section: the storeys above his lifted away (and the roof's things only when he is up there)
  function section() {
    const k = S.room.startsWith('m') || S.room.startsWith('r') || S.room === 'upDoor' ? 'roof' : lvOf(S.y + 0.01);
    for (const [key, g] of G.levels) {
      if (key === 'roof') g.visible = true;
      else g.visible = k === 'roof' ? true : key <= k;
    }
  }
  // ── screen helpers
  const scr = (x, y, z) => { try { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; } catch (e) { return { x: innerWidth / 2, y: innerHeight / 2 }; } };
  const feet = () => scr(S.x, S.y + 0.05, S.z), pelvis = () => scr(S.x, S.y + 1.15, S.z);
  /** the screen's turn sign: +1 when south shows clockwise from east (Δyaw = Δ screen angle), else −1 */
  function turnSign() { const o = scr(S.x, S.y, S.z), e = scr(S.x + 1, S.y, S.z), s = scr(S.x, S.y, S.z + 1); const cr = (e.x - o.x) * (s.y - o.y) - (e.y - o.y) * (s.x - o.x); return cr >= 0 ? 1 : -1; }
  function onPelvis(f) { const p = pelvis(); return Math.abs(f.x - p.x) <= dp(TT.PELVIS) + dp(6) && Math.abs(f.y - p.y) <= dp(TT.PELVIS) + dp(10); }
  function onRing(f) {
    const c = feet(), r = Math.hypot(f.x - c.x, (f.y - c.y) * 1.6);
    if (r < dp(TT.RING_IN) || r > dp(TT.RING_OUT)) return false;
    const p = pelvis(), gx = Math.max(0, Math.abs(f.x - p.x) - dp(TT.PELVIS)), gy = Math.max(0, Math.abs(f.y - p.y) - dp(TT.PELVIS));
    return Math.hypot(gx, gy) >= dp(TT.GAP) * 0.5;
  }
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      if (f.button === 2) { if (!A.helper) { A.helper = { id: f.id, a: Math.atan2(f.y - feet().y, f.x - feet().x) }; ev('ring:mouse'); } return; }
      if (!A.work && onPelvis(f)) { A.work = { id: f.id, x0: f.x, y0: f.y, x: f.x, y: f.y }; X.hand(null); ev('work'); return; }
      if (!A.helper && onRing(f)) { const c = feet(); A.helper = { id: f.id, a: Math.atan2(f.y - c.y, f.x - c.x) }; ev('ring'); return; }
    },
    move(f) { if (A.work && f.id === A.work.id) { A.work.x = f.x; A.work.y = f.y; } if (A.helper && f.id === A.helper.id) { A.helper.x = f.x; A.helper.y = f.y; } },
    up(f) { if (A.work && f.id === A.work.id) A.work = null; if (A.helper && f.id === A.helper.id) A.helper = null; },
  });
  function input() {
    const out = { free: !A.work && !A.helper && FG.n === 0 };
    if (A.feed) return A.feed(S, out);   // (the probes' bot)
    if (A.helper && A.helper.x != null) {
      const c = feet(), a = Math.atan2(A.helper.y - c.y, A.helper.x - c.x), d = Math.atan2(Math.sin(a - A.helper.a), Math.cos(a - A.helper.a));
      A.helper.a = a; out.turn = d * turnSign();
    }
    if (A.work) {
      const dx = A.work.x - A.work.x0, dy = A.work.y - A.work.y0, L = Math.hypot(dx, dy);
      if (L > dp(TT.DEAD)) {
        const o = scr(S.x, S.y, S.z), f = scr(S.x + Math.cos(S.yaw), S.y, S.z + Math.sin(S.yaw)), ux = f.x - o.x, uy = f.y - o.y, uL = Math.hypot(ux, uy) || 1;
        const along = (dx * ux + dy * uy) / uL;
        out.fwd = Math.max(-1, Math.min(1, along / dp(TT.FULL)));
        if (lv === 1) {
          // the drag's own way on the ground: solve the screen drag in the screen's east and south
          const e = scr(S.x + 1, S.y, S.z), s = scr(S.x, S.y, S.z + 1), ex = e.x - o.x, ey = e.y - o.y, sx = s.x - o.x, sy = s.y - o.y, det = ex * sy - ey * sx;
          if (Math.abs(det) > 1e-6) { const a = (dx * sy - dy * sx) / det, b = (ex * dy - ey * dx) / det; out.steer = Math.atan2(b, a); out.fwd = Math.min(1, L / dp(TT.FULL)); }
        }
        // at the view's edge, walking out of it: he stops there (the view moves on a lift)
        const p = scr(S.x + Math.cos(S.yaw) * 0.6 * Math.sign(out.fwd), S.y + 1, S.z + Math.sin(S.yaw) * 0.6 * Math.sign(out.fwd)), W = innerWidth, H = innerHeight;
        if ((p.x < W * TT.EDGE || p.x > W * (1 - TT.EDGE) || p.y < H * TT.EDGE || p.y > H * (1 - TT.EDGE * 0.6)) && !fixedRoom(K.roomOf(S.room))) { out.fwd = 0; A.edge = true; } else A.edge = false;
      }
    }
    return out;
  }
  const at = () => V3(X, S.x, S.y + 1.2, S.z);
  function settle(roomId) {
    const R = K.roomOf(roomId); if (!R || R.kind !== 'cell') return;
    const cx = (R.r[0] + R.r[2]) / 2, cz = (R.r[1] + R.r[3]) / 2;
    const beam = box(X, Mt.y14cedar, R.r[0] + 0.4, R.y + 4.4, cz - 0.2, R.r[2] - 0.4, R.y + 4.75, cz + 0.2, root); beam.position.y += 1.2;
    A.settle.push({ m: beam, t: 0, y1: beam.position.y - 1.2, x: cx, z: cz, y: R.y });
  }
  function light(J, kind) { const m = G.strips.get(J.a + '|' + J.b) || G.strips.get(J.b + '|' + J.a); if (!m) return; m.visible = !!kind; if (kind === 'passed') m.scale[J.axis === 'x' ? 'x' : 'y'] = 0.18; }
  function lights() {
    for (const [k, m] of G.strips) if (!k.startsWith('hatch:')) { if (!A.passed.has(k)) m.visible = false; else { m.visible = true; m.material.opacity = 0.7; } }
    for (const [k, m] of G.strips) if (k.startsWith('hatch:')) m.visible = false;
    const gl = K.goal(S);
    if (gl && !S.halt && S.phase === 'walk') {
      if (gl.hatch) { const mk = G.strips.get('hatch:' + S.room); if (mk) { mk.visible = true; mk.scale.setScalar(1 + 0.15 * Math.sin(A.t * 5)); } }
      else { const J = K.JOINS.find((j) => (j.a === S.room && j.b === gl.via) || (j.b === S.room && j.a === gl.via)); if (J) { light(J, 'next'); const mm = G.strips.get(J.a + '|' + J.b); if (mm) mm.material.opacity = 0.45 + 0.3 * Math.sin(A.t * 5); } }
    }
  }
  function handle(e) {
    if (e.k === 'step') {
      ev('step:' + e.room + ':' + e.grade);
      award(X, at(), e.grade, lv, 'אבן');
      if (lv === 1 && e.two) extra(X, 10, lv, 'two', 'שתי ידיים');
      V.right(); try { X.sparks(S.x, S.y + 1.5, S.z, 10); } catch (er) { /* */ }
      try { X.haptic && X.haptic(15); } catch (er) { /* */ }
      if (S.last) settle(S.last);
      keep();
    } else if (e.k === 'room') {
      // an opening passed: its strip stays lit (thin)
      const J = K.JOINS.find((j) => (j.a === e.from && j.b === e.room) || (j.b === e.from && j.a === e.room));
      if (J) { const k = J.a + '|' + J.b; A.passed.add(k); light(J, 'passed'); }
      const R = K.roomOf(e.room); V.step(R && R.kind === 'cell' ? 1.6 : R && R.kind === 'hall' ? 0.8 : 1.2);
    } else if (e.k === 'touch') { V.knock(); try { X.shake(0.05, 0.1); } catch (er) { /* */ } ev('touch'); }
    else if (e.k === 'break') {
      V.crack(); ev('break:' + e.door);
      hurt(X, Mo, 'taim.corner', at(), { lv, at: e.door });
      try { X.dust(e.x, S.y + 1, e.z, 8, 2); } catch (er) { /* */ }
      const C = (Mo.st.corners = Mo.st.corners || []); if (!C.some((c) => c && c.d === e.door)) C.push({ d: e.door, x: +(+e.x).toFixed(2), y: S.y, z: +(+e.z).toFixed(2) });   // (kept: "שברים בפינות האבן נשארים")
      chipAt(e.x, S.y, e.z);
    } else if (e.k === 'free') { V.knock(); ev('free'); try { X.line('ניסוי חינם: פגיעה חזקה בפינה שוברת אותה. היכנסו ישר לפתח', 2600); } catch (er) { /* */ } }
    else if (e.k === 'detour') { V.hollow(1.4); ev('detour'); }
    else if (e.k === 'rise') { V.rise(); ev('rise' + (e.rim ? ':rim' : '')); }
    else if (e.k === 'cut') { ev('cut'); try { X.line('הכהן חוזר אל הצומת, אל פתח המסיבה', 1800); } catch (er) { /* */ } }
    else if (e.k === 'go') { A.camKey = ''; }
    else if (e.k === 'done') { ev('done'); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    const res = K.result(S);
    if (res.bonus) extra(X, 40, lv, 'work', 'כל הפתחים נקיים');
    Mo.keep(m.k, null); X.save();
    // the great moment: a ray through every opening passed, the whole maze lit in section
    for (const [, g] of G.levels) g.visible = true;
    for (const [k, mm] of G.strips) if (A.passed.has(k)) { mm.visible = true; mm.material.opacity = 1; mm.scale.multiplyScalar(1.6); }
    V.ray();
    const cx = -125, cz = -22, [eye, aim] = [[cx + 34, 64, cz - 34], [cx, 26, cz + 4]];
    lens(X, 46); X.shot(eye, aim, 1.6);
    await X.wait(1.8);
    await finish(X, A, res, WORDS.taim, V3(X, cx, 30, cz), { eye, aim, secs: 1.4, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn || lv > 1) return; A.hintOn = 1; try { X.hand({ x: S.x, y: S.y + 1.15, z: S.z }, 0, 40); } catch (e) { /* */ } }
  function draw(dt) {
    section();
    kohen.position.set(S.x, S.y, S.z); kohen.rotation.y = -S.yaw;
    const sp = Math.abs(S.v) / K.TM.VMAX; A.walkPh += dt * (2 + 7 * sp); kohen.userData.walk(A.walkPh, sp);
    if (sp > 0.1 && Math.floor(A.walkPh / Math.PI) !== A.lastStep) { A.lastStep = Math.floor(A.walkPh / Math.PI); const R = K.roomOf(S.room); V.step(R && R.kind === 'cell' ? 1.4 : 1); }
    ringM.position.set(S.x, S.y + 0.06, S.z); ringM.visible = S.phase === 'walk';
    tick.position.set(S.x + Math.cos(S.yaw) * 1.05, S.y + 0.08, S.z + Math.sin(S.yaw) * 1.05); tick.rotation.set(0, -S.yaw, -Math.PI / 2); tick.visible = ringM.visible;
    ringM.material = A.helper ? Mt.y14ringL : Mt.y14ringL; ringM.scale.setScalar(A.helper ? 1.08 : 1);
    // the thumbs' rings
    if (A.work) { const p = pelvis(); rings.work.show(p.x, p.y, Math.min(1, Math.abs(S.v) / K.TM.VMAX), false); } else rings.work.hide();
    if (A.helper && A.helper.x != null) rings.helper.show(A.helper.x, A.helper.y, 0.4, false); else rings.helper.hide();
    lights();
    // the settling beams
    for (let i = A.settle.length - 1; i >= 0; i--) { const s = A.settle[i]; s.t += dt; const k = Math.min(1, s.t / 0.35); s.m.position.y = s.y1 + 1.2 * (1 - k * k); if (k >= 1 && !s.hit) { s.hit = 1; V.thud(); try { X.dust(s.x, s.y + 4.4, s.z, 4, 1.5); } catch (e) { /* */ } } if (s.t > 0.6) A.settle.splice(i, 1); }
    if (S.phase === 'rise' && S.rise) { /* (he goes up through the hatch: the camera follows when he is through) */ }
  }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); A.camKey = ''; camTo(0.01);
      X.line(resumed ? '' : lv === 1 ? 'גררו מהאגן של הכהן אל הפתח המואר. הכהן הולך לאן שגוררים' : lv === 2 ? 'אגודל אחד גורר קדימה, השני מסובב את הטבעת שלרגליו' : 'בלי שלטים: קראו את המבנה. למעלה בקומות, ואז המסיבה וגגות התאים', resumed ? 0 : 5200);
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        if (!A.busy && !A.finished) {
          const inp = input();
          const was = S.room, wasPhase = S.phase;
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
          if (inp.free && !A.busy && S.phase === 'walk') camTo(S.room !== was ? 0.7 : 0.5);
          if (wasPhase === 'rise' && S.phase !== 'rise' && inp.free) camTo(0.7);
          if (S.phase === 'cut' && !A.cutShot) { A.cutShot = 1; }
          if (S.phase === 'walk') A.cutShot = 0;
        }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h137] taim', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.work = null; A.helper = null; keep(); },
    wants(p) { if (!p) return true; if (A.work || A.helper) return true; return onPelvis(p) || onRing(p); },
    holds() { return !!(A.work || A.helper); },
    lensFov: CAM.fov,
    end() {
      A.ended = true; FG.detach(); V.hush(); V.stop(); X.hand(null); lens(X, fov0);
      for (const r of Object.values(rings)) r.remove();
      try { X.kohen(true); } catch (e) { /* */ }
      X.props.remove(root);
    },
    at,
    dbg() {
      const r3 = (v) => +(+v).toFixed(3);
      return { id: m.id, lv, finished: A.finished, busy: A.busy, room: S.room, x: r3(S.x), z: r3(S.z), y: r3(S.y), yaw: r3(S.yaw / RAD), phase: S.phase, halt: S.halt, k: S.k, steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.map((x) => x.at), done: S.done,
        pelvis: (() => { const p = pelvis(); return [Math.round(p.x), Math.round(p.y)]; })(), feet: (() => { const p = feet(); return [Math.round(p.x), Math.round(p.y)]; })(), work: !!A.work, helper: !!A.helper, edge: !!A.edge, ev: A.ev.slice(-12), cam: A.camKey };
    },
    probe() { return { S, K, A }; },
  };
}
export const TAIM_ACT = { icon: '🚪', title: 'מבוך התאים והמסיבה', walkLine: () => 'מבוך התאים: אל הפשפש הצפוני שבכותל ההיכל', stand() { return { x: S14.stands.taim[0], z: S14.stands.taim[1], face: [-92, -8.6] }; }, prepare() {}, make };
