/* ── build 109 ── h109/acts3.js — four acts of stage 01 in the world: 3.5 the corner stone (a real treadwheel crane: swipes walk the
 * wheel, a hold lowers, the stone sways, a hard touch chips it), 3.6 the course of the east retaining wall (choose a length, drag,
 * release with the sway: no joint over a joint), 3.7 the great stone down the slope (build 116: held from behind by two rope crews,
 * he pulls it down off the rock to the west wall), 3.8 "לבית התקיעה" (the two words carved letter by letter).
 */
import { onPlane, clamp, lerp, ease } from './kit.js';
import { bigR, nearPts, nearObjs } from './grips.js';   // (build 125)
import { wasteAdd } from './acts2.js';
import { BOOK, cellOf } from '../world/grid.js';
import { makeTrack, stepStone, limitAt, restAt, SL } from './slope.js';

let SH = null;
const TAU = Math.PI * 2;

/* ───────── the treadwheel crane (one, it moves between the corner and the courses) ───────── */
function makeCrane(X) {
  const T = X.THREE, P = X.props, g = new T.Group(); g.name = 'h109-crane';
  const beam = (a, b, r = 0.16, mat = P.M.wood) => { const v = new T.Vector3().subVectors(b, a), L = v.length(); const m = new T.Mesh(new T.CylinderGeometry(r, r * 1.1, L, 6), mat); m.position.copy(a).addScaledVector(v, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; return m; };
  // the wheel: two rims and the treads between them, on its axle (local x axis), at the base
  const wheel = new T.Group(); const R = 3.0, Wd = 1.7;
  for (const s of [-1, 1]) { const rim = new T.Mesh(new T.TorusGeometry(R, 0.11, 6, 36), P.M.wood); rim.rotation.y = Math.PI / 2; rim.position.x = (s * Wd) / 2; wheel.add(rim); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; wheel.add(beam(new T.Vector3((s * Wd) / 2, 0, 0), new T.Vector3((s * Wd) / 2, Math.sin(a) * R, Math.cos(a) * R), 0.07, P.M.woodD)); } }
  for (let k = 0; k < 20; k++) { const a = (k / 20) * TAU; const t = new T.Mesh(new T.BoxGeometry(Wd, 0.1, 0.32), P.M.woodD); t.position.set(0, Math.sin(a) * R, Math.cos(a) * R); t.rotation.x = -a; wheel.add(t); }
  wheel.add(beam(new T.Vector3(-Wd / 2 - 0.5, 0, 0), new T.Vector3(Wd / 2 + 0.5, 0, 0), 0.14, P.M.woodD));
  wheel.position.set(0, R + 0.2, 0); g.add(wheel);
  for (const s of [-1, 1]) { g.add(beam(new T.Vector3(s * 1.4, 0, -1.6), new T.Vector3(s * 1.15, R + 0.2, 0))); g.add(beam(new T.Vector3(s * 1.4, 0, 1.6), new T.Vector3(s * 1.15, R + 0.2, 0))); }
  // the mast and the jib that slews (its own group, turned about the vertical at the mast)
  const slew = new T.Group(); slew.position.set(0, 0, 0); g.add(slew);
  const mastH = 9.5, jibL = 8.5;
  slew.add(beam(new T.Vector3(-0.5, 0, 2.2), new T.Vector3(0, mastH, 2.2), 0.2)); slew.add(beam(new T.Vector3(0.5, 0, 2.2), new T.Vector3(0, mastH, 2.2), 0.2));
  const tipL = new T.Vector3(0, mastH + 3.2, 2.2 + jibL); slew.add(beam(new T.Vector3(0, mastH - 1.2, 2.2), tipL, 0.17));
  slew.add(beam(new T.Vector3(0, 0.4, 0.6), new T.Vector3(0, mastH - 0.5, 2.2), 0.05, P.M.rope));
  X.props.root.add(g);
  const C = { g, wheel, slew, tipL, R, mastH, jibL, ang: 0, yaw: 0, rope: P.rope(10, 0.085), tip: new T.Vector3(), base: { x: 0, z: 0 } };
  C.place = (x, z, yaw) => { g.position.set(x, X.ground(x, z), z); g.rotation.y = yaw; C.base.x = x; C.base.z = z; C.yaw = yaw; };
  /** the jib pointed at (x, z): the slew angle about the mast */
  // ── h114 ── (aimed from the base, the slew's own pivot: from the mast it missed the corner by two amot) ── /h114 ──
  C.aim = (x, z, k = 1) => { const mx = C.base.x, mz = C.base.z; const want = Math.atan2(x - mx, z - mz) - C.yaw; let d = Math.atan2(Math.sin(want - C.slew.rotation.y), Math.cos(want - C.slew.rotation.y)); C.slew.rotation.y += d * k; };
  C.tipWorld = (out) => { C.g.updateMatrixWorld(true); out.copy(C.tipL); C.slew.localToWorld(out); return out; };
  C.reach = () => C.jibL + 0.0;
  return C;
}
function stoneMesh(X, L, h, d) {
  const T = X.THREE, geo = (X.stages.ashlar && X.stages.ashlar.geometry) || new T.BoxGeometry(1, 1, 1);
  const m = new T.Mesh(geo, X.props.M.stone); m.scale.set(L, h, d); m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); return m;
}
/** ── h115 ── the corner stone's gold mark: a gold square on its top at the corner's own edge (seen at the wall's foot later on) */
function goldMark(X, x, y, z) {
  if (SH.goldM) X.props.remove(SH.goldM);
  const T = X.THREE, m = new T.Mesh(new T.BoxGeometry(0.7, 0.04, 0.7), new T.MeshStandardMaterial({ color: '#E8B84A', metalness: 0.8, roughness: 0.3, emissive: '#8A6214', emissiveIntensity: 0.5 }));
  m.position.set(x + CW / 2 - 0.45, y + 0.02, z + CDp / 2 - 0.45); X.props.root.add(m); SH.goldM = m; return m;
}
function shadowDisk(X) { const T = X.THREE; const m = new T.Mesh(new T.CircleGeometry(1, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 996; X.props.root.add(m); return m; }

/* ───────── 3.5 the corner stone ───────── */
// ── h115 ── (build115-brief §6) the REAL south-east corner of the Mount's retaining wall (mount.js PLAT.X1 = 277, PLAT.Z1 = 400): the
// lowest ground of the Mount, where its two walls meet; until 114 the stone stood at the measured square's corner, where no wall corner
// exists. The stone sits square in the corner, a hand inside both faces; the crane and the stock west of it along the south wall's
// trench (the city wall's tower stands just outside the corner, so every camera looks at it from the north, the Mount's side).
const CORNER_AT = { x: 275.5, z: 398.7 }, CRANE_AT = { x: 264, z: 392.6 }, STOCK = { x: 253.5, z: 392 };
const WALL_E = 277, WALL_S = 400;   // (the two faces) ── /h115 ──
const KOH_AT = { x: 268.6, z: 389.2 };   // ── h116 ── the kohen on the guide rope ── /h116 ──
// ── h114 ── (ירון 9.11: "כל אבן יורדת למקום אמיתי בעולם האמיתי"; "העיגול הצהוב לא ברור") the corner's foundation trench, dug at the
// real corner of the Mount's wall, its earth heaped beside it, and the stone's own outline chalked on its floor; the stone sits a
// little sunk in it for good (PIT) and the courses go on from it ── /h114 ──
const CW = 2.4, CDp = 2.0, PIT = 1.2;
/** ── h115 ── a green arrow on the ground from where a stone came down to where it should (rule: the placement target always shown; a
 *  miss shows the way): it fades after 3.2 s ── /h115 ── */
function greenArrow(X, P, Q, y) {
  const T = X.THREE, dx = Q.x - P.x, dz = Q.z - P.z, L = Math.hypot(dx, dz); if (L < 0.05) return null;
  const g = new T.Group(), gm = new T.MeshBasicMaterial({ color: '#4CE07A', transparent: true, opacity: 0.95, depthWrite: false, depthTest: false });
  const len = Math.max(0.8, L - 0.6), shaft = new T.Mesh(new T.PlaneGeometry(0.22, len), gm); shaft.rotation.x = -Math.PI / 2; shaft.position.z = -len / 2; g.add(shaft);
  const hd = new T.Shape(); hd.moveTo(0, -0.7); hd.lineTo(0.45, 0); hd.lineTo(-0.45, 0); hd.closePath(); const head = new T.Mesh(new T.ShapeGeometry(hd), gm); head.rotation.x = -Math.PI / 2; head.position.z = -len; g.add(head);
  g.position.set(P.x, y, P.z); g.rotation.y = Math.atan2(-dx, -dz); g.renderOrder = 997; X.props.root.add(g);
  setTimeout(() => { try { X.props.remove(g); } catch (e) { /* */ } }, 3200);
  return g;
}
function cornerPit(X, chalk) {
  // ── h115 ── the foundation trench of BOTH walls, L-shaped at the corner (a corner is seen as a corner: ירון 10.11 "שיבינו שהיא האבן
  // הנמוכה ביותר בפינה הזו"), its dug earth heaped on the platform's side; a green rectangle on its floor where the stone must sit,
  // filling green while the stone hangs over it; a gold line rising from the corner to the platform's level (where the corner will
  // stand). ── /h115 ──
  const T = X.THREE, g = new T.Group(); g.name = 'h114-corner-pit'; const gy = X.ground(CORNER_AT.x, CORNER_AT.z);
  const earth = new T.MeshStandardMaterial({ color: '#6B5236', roughness: 1 }), heap = new T.MeshStandardMaterial({ color: '#8A6E4B', roughness: 1, flatShading: true });
  const ox = CORNER_AT.x, oz = CORNER_AT.z, TW = 4.2, LE = 16, LS = 18;   // (trench width; the east arm's and the south arm's lengths)
  const arm = (x0, x1, z0, z1) => {
    const f = new T.Mesh(new T.BoxGeometry(x1 - x0, 0.1, z1 - z0), earth); f.position.set((x0 + x1) / 2 - ox, -PIT, (z0 + z1) / 2 - oz); f.receiveShadow = true; g.add(f);
    for (const [w, d, x, z] of [[x1 - x0, 0.14, (x0 + x1) / 2, z0], [x1 - x0, 0.14, (x0 + x1) / 2, z1], [0.14, z1 - z0, x0, (z0 + z1) / 2], [0.14, z1 - z0, x1, (z0 + z1) / 2]]) { const m = new T.Mesh(new T.BoxGeometry(w, PIT + 0.12, d), earth); m.position.set(x - ox, -PIT / 2 + 0.02, z - oz); m.receiveShadow = true; g.add(m); }
  };
  arm(WALL_E - TW, WALL_E + 0.6, WALL_S - LE, WALL_S + 0.6);    // the east wall's trench, north from the corner
  arm(WALL_E - LS, WALL_E - TW, WALL_S - TW, WALL_S + 0.6);     // the south wall's trench, west from the corner
  for (const [x, z, r] of [[WALL_E - TW - 2.2, WALL_S - 12, 1.1], [WALL_E - TW - 2.0, WALL_S - 7, 0.9], [WALL_E - 12, WALL_S - TW - 2.0, 1.0], [WALL_E - 16, WALL_S - TW - 2.2, 0.8]]) { const m = new T.Mesh(new T.SphereGeometry(r, 9, 5, 0, TAU, 0, Math.PI / 2), heap); m.scale.y = 0.55; m.position.set(x - ox, 0, z - oz); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  if (chalk) {
    const gm = new T.MeshBasicMaterial({ color: '#4CE07A' }); g.userData.chalk = [];
    // (thick enough to read from the crane's distance, in the city tower's shadow too: an unlit green)
    for (const [w, d, x, z] of [[CW + 0.25, 0.25, 0, CDp / 2], [CW + 0.25, 0.25, 0, -CDp / 2], [0.25, CDp + 0.25, CW / 2, 0], [0.25, CDp + 0.25, -CW / 2, 0]]) { const m = new T.Mesh(new T.BoxGeometry(w, 0.04, d), gm); m.position.set(x, -PIT + 0.08, z); g.add(m); g.userData.chalk.push(m); }
    const fill = new T.Mesh(new T.PlaneGeometry(CW, CDp), new T.MeshBasicMaterial({ color: '#4CE07A', transparent: true, opacity: 0.22, depthWrite: false })); fill.rotation.x = -Math.PI / 2; fill.position.y = -PIT + 0.09; fill.renderOrder = 996; g.add(fill); g.userData.fill = fill; g.userData.chalk.push(fill);
  }
  // the gold line of the corner to come: from the trench's floor up to the platform's level (0), and a stub of each wall's line there
  { const gold = new T.MeshBasicMaterial({ color: '#FFD66E', transparent: true, opacity: 0.75, depthWrite: false }), H = -(gy - PIT);
    const v = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, H, 6), gold); v.position.set(WALL_E - ox, -PIT + H / 2, WALL_S - oz); g.add(v);
    const e = new T.Mesh(new T.BoxGeometry(0.12, 0.12, 14), gold); e.position.set(WALL_E - ox, -gy, WALL_S - 7 - oz); g.add(e);
    const w = new T.Mesh(new T.BoxGeometry(14, 0.12, 0.12), gold); w.position.set(WALL_E - 7 - ox, -gy, WALL_S - oz); g.add(w);
    g.userData.gold = [v, e, w]; }
  g.position.set(CORNER_AT.x, gy, CORNER_AT.z); X.props.root.add(g); return g;
}
export const CORNER = {
  icon: '🏗', title: 'אבן הפינה',
  walkLine: () => 'הפינה הדרומית־מזרחית של ההר: מורידים את אבן הפינה',
  // ── h115 ── (the full replay: he stood inside the crane's treadwheel) his stand beside the crane on the Mount's side, facing the corner ── /h115 ──
  // ── h116 ── (build116-brief §B) he holds the guide rope, so he stands nearer, clear of the crane and the trenches, seen whole ── /h116 ──
  stand(m, X) { return { x: KOH_AT.x, z: KOH_AT.z, face: [CORNER_AT.x, CORNER_AT.z], mx: CRANE_AT.x - 1.5, mz: CRANE_AT.z - 3.5 }; },
  prepare(m, X) { SH.crane.place(CRANE_AT.x, CRANE_AT.z, Math.atan2(CORNER_AT.x - CRANE_AT.x, CORNER_AT.z - CRANE_AT.z) - 0.9); },
  make(m, X) {
    const lv = X.level(), T = X.THREE, C = SH.crane, gP = X.ground(CORNER_AT.x, CORNER_AT.z), sw = 2.4;
    const A = { aimP: null, barmen: [], settle: null, phase: 'intro', h: 0, hMax: 5, w: 0, taps: [], grades: [], v: 0, hold: false, ax: 0, sway: { x: 0, z: 0, vx: 0, vz: 0 }, chips: 0, rejects: 0, t: 0, lastSw: 0, p0: null, slewT: 0,
      // ── h116 ── (build116-brief §B: "the stone really turns on its rope") it hangs askew; the guide rope turns it (rotT, late: rotV);
      // the three grips: the jib's head, the guide rope, the stone itself ── /h116 ──
      skew: 0, rotT: null, rotV: 0, grip: null, holdT: 0, said: {}, cracks: 0, lineK: '' };
    const TOL = [6, 4, 2.5][lv - 1] * Math.PI / 180;
    const newSkew = () => { const d = Math.PI / 180, r = Math.random(), sg = Math.random() < 0.5 ? -1 : 1; return lv === 1 ? sg * (20 + 15 * r) * d : lv === 2 ? sg * (40 + 40 * r) * d : sg * (15 + 165 * r) * d; };
    A.skew = newSkew();
    // the rotation error to the corner's square (a 2:1 stone is square either way round: mod π)
    const rotErr = (r) => { let e = ((r % Math.PI) + Math.PI) % Math.PI; if (e > Math.PI / 2) e -= Math.PI; return e; };
    const stone = stoneMesh(X, sw, 1.6, 2.0); const sh = shadowDisk(X);
    const floorY = gP - PIT;
    const pit = SH.cornerPit || (SH.cornerPit = cornerPit(X, true));
    // (the one-minigame page plays it again: the stone of the last round goes, the chalk comes back)
    if (SH.cornerStone) { X.props.remove(SH.cornerStone); SH.cornerStone = null; } for (const m of (pit.userData.chalk || [])) m.visible = true;
    // ── h114 ── the stone in its slings: two bands round it and two legs up to the hook, the crane's rope from the hook to the jib's tip,
    // always (ירון 9.11: "האבן יורדת בלי חבל") ── /h114 ──
    const slings = new T.Group(); slings.name = 'h114-slings';
    // (each band wraps the stone across its width, a hand from each end: thin along the stone, a hair bigger than it the other ways)
    for (const k of [-0.62, 0.62]) { const b = new T.Mesh(new T.BoxGeometry(0.16, 1.68, 2.08), X.props.M.rope); b.position.set(k * sw * 0.5, 0, 0); slings.add(b); }
    X.props.root.add(slings);
    const legs = [X.props.rope(6, 0.045), X.props.rope(6, 0.045)];
    let rot = null;
    const tip = new T.Vector3(), pos = new T.Vector3(STOCK.x, X.ground(STOCK.x, STOCK.z) + 0.8, STOCK.z);
    // (the crew stand on the platform's side of the trenches, never in them)
    const crew = [SH.crew.add(CRANE_AT.x - 2.2, CRANE_AT.z - 1.2, { role: 'push', fx: CRANE_AT.x, fz: CRANE_AT.z, crew: 1 }), SH.crew.add(WALL_E - 6.5, WALL_S - 9.5, { role: 'hold', item: 'mallet', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 2 })];
    // (the tagline: from the stone to the crewman beside the trench, who turns it square — ירון 9.11: no figure "with a lantern")
    const tag = X.props.rope(10, 0.035);
    // ── h115 ── (the city wall's tower stands just outside the corner and its wall runs west along the south side: every camera is on
    // the Mount's side or over the open ground north-east of the corner, never behind the city wall) ── /h115 ──
    function shotSide() { const mx = (STOCK.x + CORNER_AT.x) / 2, mz = (STOCK.z + CORNER_AT.z) / 2, g = X.ground(mx, mz); X.shot([mx + 2, g + 17, mz - 29], [mx + 1, g + 2.5, mz + 1], 1.0); }
    function stonePos(dt) {
      C.tipWorld(tip);
      // the pendulum (L2+): the stone swings under the tip; the wind at L3
      const S = A.sway, Lr = Math.max(1.5, tip.y - pos.y), w2 = 9.8 / Lr;
      const wind = lv >= 3 ? Math.sin(A.t * 0.7) * 0.6 : 0;
      S.vx += (-w2 * S.x + wind) * dt; S.vz += -w2 * S.z * dt; S.vx *= Math.exp(-dt * (lv >= 2 ? 0.05 : 2.5)); S.vz *= Math.exp(-dt * (lv >= 2 ? 0.05 : 2.5));
      S.x += S.vx * dt; S.z += S.vz * dt;
      // (A.ax: the hook run in or out along the jib — the trolley of the steering, below)
      const rl = Math.hypot(tip.x - C.base.x, tip.z - C.base.z) || 1, along = { x: (tip.x - C.base.x) / rl, z: (tip.z - C.base.z) / rl };
      pos.x = tip.x + S.x + along.x * A.ax; pos.z = tip.z + S.z + along.z * A.ax;
      const top = tip.y - 1.2; pos.y = A.phase === 'lift' || A.phase === 'intro' ? X.ground(STOCK.x, STOCK.z) + 0.8 + A.h : top - A.drop;
      // (it hangs square to the jib; over the corner the crewman on the tagline turns it to the chalk's square, slowly)
      // ── h116 ── it hangs askew from the stock on; over the corner it turns only by the guide rope, late, swinging past a little ── /h116 ──
      const jibRot = C.yaw + C.slew.rotation.y; if (rot === null) rot = jibRot + A.skew;
      if (A.phase === 'lift' || A.phase === 'intro' || A.phase === 'reject') { rot = jibRot + A.skew; A.rotT = rot; A.rotV = 0; }
      else {
        if (lv >= 3) A.rotT += S.vx * 0.05 * dt;   // (a hard swing twists it a little)
        A.rotV += ((A.rotT - rot) * 2.6 - A.rotV * 2.0) * dt; rot += A.rotV * dt;
      }
      stone.position.copy(pos); stone.rotation.y = rot;
      slingsAt();
      const gy = X.ground(pos.x, pos.z), hh = pos.y - 0.8 - gy; sh.position.set(pos.x, gy + 0.06, pos.z); const k = 1 + hh * 0.18; sh.scale.set(1.5 * k, 1.2 * k, 1); sh.material.opacity = clamp(0.5 - hh * 0.04, 0.08, 0.5);
    }
    const hook = new T.Vector3(), ax = new T.Vector3();
    function slingsAt(free) {
      slings.position.copy(stone.position); slings.rotation.y = stone.rotation.y;
      ax.set(Math.cos(stone.rotation.y), 0, -Math.sin(stone.rotation.y));
      hook.set(stone.position.x, stone.position.y + 0.8 + 1.1, stone.position.z);
      if (free) { for (const l of legs) l.show(false); return; }
      C.tipWorld(tip);
      C.rope.show(true); C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: hook.x, y: hook.y, z: hook.z }, 0);
      for (let k = 0; k < 2; k++) { const s2 = k ? 1 : -1; legs[k].show(true); legs[k].set({ x: hook.x, y: hook.y, z: hook.z }, { x: stone.position.x + ax.x * s2 * sw * 0.31, y: stone.position.y + 0.84, z: stone.position.z + ax.z * s2 * sw * 0.31 }, 0); }
    }
    // (how far out along the jib the hook must run for the stone to hang over (x, z))
    function axFor(P) { const R = Math.hypot(C.tipL.z, C.tipL.x) || 10; return clamp(Math.hypot(P.x - C.base.x, P.z - C.base.z) - R, -3.6, 3.6); }   // ── h116 ── (2.6 left the corner half an amah out of reach) ── /h116 ──
    function swipe(dt) {
      const now = performance.now() / 1000, iv = now - A.lastSw; A.lastSw = now;   // (the steps by the finger's clock)
      const rate = iv > 0 ? 1 / iv : 0;
      const grade = rate >= 2.0 && rate <= 2.6 ? 'gold' : rate >= 1.6 && rate <= 3.2 ? 'good' : 'ok';
      A.w += 1; X.play('wheel'); X.haptic && X.haptic(8);
      if (A.taps.length) { A.grades.push(grade); if (grade !== 'ok') X.hit({ x: pos.x, y: pos.y + 1.5, z: pos.z }, grade, { text: '', craft: 'מנופאים' }); else X.word({ x: pos.x, y: pos.y + 1.5, z: pos.z }, rate < 1.6 ? 'לאט מדי' : 'מהר מדי'); }
      A.taps.push(now); void dt;
    }
    function settle(vT) {
      const gy = gP, d = Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw, at = { x: CORNER_AT.x, y: gy + 2.2, z: CORNER_AT.z };
      const swing = Math.hypot(A.sway.vx, A.sway.vz);
      if (swing > 1.2 && lv >= 2) { A.drop -= 1.2; X.word(at, 'נקישה — מרימים ומורידים שוב'); X.play('thud'); X.shake(0.1, 0.2); return false; }
      // ── h116 ── (build116-brief §B) down faster than 1.2 amot a second: it cracks (−20, a new stone, the first shot again) ── /h116 ──
      if (vT > 1.2) {
        A.rejects++; A.cracks++; X.word(at, 'ירדה מהר מדי: האבן נסדקה'); X.sparks(pos.x, gy + 0.2, pos.z, 16); X.shake(0.25, 0.45);
        X.loss(20, at, 'אבן הפינה נסדקה', 1); wasteAdd(X, 1, at); restart();
        return false;
      }
      // ── h116 ── crooked (its edges not parallel to the corner's lines): the crane lifts it again, nothing lost; a green turning
      // arrow round it shows which way the rope must turn it ── /h116 ──
      const e = rotErr(rot);
      if (Math.abs(e) > TOL) { A.misses = (A.misses | 0) + 1; A.drop -= 1.4; A.v = 0; X.word(at, 'עקומה · סובבו בחבל ומורידים שוב'); X.play('thud'); X.dust(pos.x, floorY + 0.2, pos.z, 6, 2); turnArrow(e); if (d > 0.1) arrowTo(pos); return false; }
      // ── h114 ── off the chalk by more than a tenth: the crew can't bar it over — up again and down again (no damage, no points off;
      // the spec's table "יותר מ־10%") ── /h114 ──
      if (d > 0.1) { A.misses = (A.misses | 0) + 1; A.drop -= 1.4; X.word(at, 'רחוק מהמלבן הירוק · מרימים ומורידים שוב'); X.play('thud'); X.dust(pos.x, floorY + 0.2, pos.z, 6, 2); arrowTo(pos); return false; }
      const grade = d <= 0.05 && Math.abs(e) <= TOL / 2 ? (A.misses ? 'good' : 'gold') : 'good';
      A.grades.push(A.chips ? (grade === 'gold' ? 'good' : grade) : grade);
      // ── h114 ── it sits in the trench, square on its chalk; off the chalk the crewmen bar it over (seen: the push, below), and it
      // stays there for good (SH.cornerSet → initWorld3 puts it back after a reload) ── /h114 ──
      A.settle = { from: { x: pos.x, z: pos.z, r: stone.rotation.y }, to: Math.round(stone.rotation.y / Math.PI) * Math.PI, t: 0, dur: d <= 0.05 ? 0.25 : 1.4 };
      pos.y = floorY + 0.8; stone.position.y = pos.y;
      X.play('settle'); X.dust(pos.x, floorY + 0.2, pos.z, 16, 3); X.shake(0.2, 0.35);
      X.hit(at, A.grades[A.grades.length - 1], { text: grade === 'gold' ? 'מהודר' : grade === 'good' ? 'הצוות מיישר במוטות' : 'הצוות דוחף אותה למקום', craft: 'בנאים' });
      if (grade === 'gold' && !A.chips && !A.rejects) { X.perfect('בול! אבן הפינה במקומה', { x: CORNER_AT.x, y: gP + 1, z: CORNER_AT.z }); X.bonus(40, 'bul', 'בול על המלבן'); }
      if (vT < 0.8) X.bonus(20, 'soft', 'נגיעה רכה');
      // (the crewmen bar it over when it landed off; then — always — they try to shift it with their bars, and it does not move: the
      // corner stone is the lowest stone of the corner and the whole corner stands on it)
      for (const [x, z] of [[CORNER_AT.x - 3.0, CORNER_AT.z - 0.4], [CORNER_AT.x - 0.4, CORNER_AT.z - 3.0]]) A.barmen.push(SH.crew.add(x, z, { role: 'lever', item: 'staff', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 2 }));
      setTimeout(() => { if (A.phase !== 'done') return; X.word({ x: CORNER_AT.x, y: gP + 2.6, z: CORNER_AT.z }, 'דוחפים במוטות... לא זזה!'); X.play('thud'); X.shake(0.08, 0.15); }, 2600);
      setTimeout(() => { if (A.phase !== 'done') return; X.line('אבן הפינה לא זזה: כל הפינה תעמוד עליה'); goldMark(X, CORNER_AT.x, floorY + 1.6, CORNER_AT.z); }, 3800);
      A.phase = 'done'; SH.cornerSet = true;
      // the slings come off, the rope goes up; the verse stays long enough to read; the camera rises over the corner
      setTimeout(() => { slingsAt(true); C.rope.show(false); X.props.remove(slings); }, 1300);
      setTimeout(() => { X.line('"אבן מאסו הבונים היתה לראש פינה" (תהלים קיח, כב)'); for (const m of (pit.userData.chalk || [])) m.visible = false; }, 700);
      // (the camera low beside the corner: the stone, the bars, both trenches)
      setTimeout(() => X.shot([CORNER_AT.x - 3, gP + 9, CORNER_AT.z - 12], [CORNER_AT.x - 0.5, floorY + 0.8, CORNER_AT.z], 1.4), 1400);
      const q = A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length;
      const perfect = !A.rejects && !A.chips && !A.misses && A.grades.every((g) => g === 'gold') && Math.abs(e) <= TOL / 2;
      setTimeout(() => X.end({ q: A.rejects ? Math.min(q, 0.6) : q, stars: A.rejects ? 1 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, perfect, at }), 6600);
      return true;
    }
    function steer(p) { const g = onPlane(X, p.x, p.y, gP); if (g && Math.hypot(g.x - CORNER_AT.x, g.z - CORNER_AT.z) < 9) A.aimP = { x: g.x, z: g.z }; }
    function restart() {
      A.phase = 'reject'; X.line('הצוות מוריד את האבן לפסולת ומביא אחרת');
      // (back to the first shot, a new stone on the rope at the stock)
      A.grip = null; A.v = 0; A.skew = newSkew(); rot = null;
      setTimeout(() => { A.phase = 'lift'; A.h = 0; A.drop = 0; A.ax = 0; A.sway.x = A.sway.z = A.sway.vx = A.sway.vz = 0; shotSide(); X.line('שוב: החליקו למטה בקצב'); }, 3500);
    }
    // after a miss: a green arrow on the trench's floor from where it came down toward the rectangle
    let arrow = null;
    function arrowTo(P) { if (arrow) X.props.remove(arrow); arrow = greenArrow(X, P, CORNER_AT, floorY + 0.12); }
    // ── h116 ── a green curved arrow round the stone's place: the way the rope must turn it (e > 0: back the other way) ── /h116 ──
    let turnA = null;
    function turnArrow(e) {
      if (turnA) X.props.remove(turnA);
      const g = new T.Group(), gm = new T.MeshBasicMaterial({ color: '#4CE07A', transparent: true, opacity: 0.95, depthWrite: false, depthTest: false, side: T.DoubleSide });
      const R = 2.3, th = 1.5, arc = new T.Mesh(new T.RingGeometry(R - 0.13, R + 0.13, 32, 1, 0, th), gm); arc.rotation.x = -Math.PI / 2; g.add(arc);
      const hd = new T.Shape(); hd.moveTo(R - 0.45, 0); hd.lineTo(R + 0.45, 0); hd.lineTo(R, -0.75); hd.closePath();
      const head = new T.Mesh(new T.ShapeGeometry(hd), gm); head.rotation.x = -Math.PI / 2; g.add(head);
      const dir = e > 0 ? -1 : 1; g.scale.x = dir; g.position.set(CORNER_AT.x, floorY + 0.14, CORNER_AT.z); g.renderOrder = 997; X.props.root.add(g); turnA = g;
      setTimeout(() => { if (turnA === g) { X.props.remove(g); turnA = null; } }, 3200);
    }
    // ── h116 ── the two lines of the corner on the trench's floor (the stone's east and south edges): pale, bright green when its
    // edges are parallel to them ── /h116 ──
    const lineM = new T.MeshBasicMaterial({ color: '#CFE8D4', transparent: true, opacity: 0.55, depthWrite: false });
    const Lw = [new T.Mesh(new T.BoxGeometry(0.12, 0.05, 6), lineM), new T.Mesh(new T.BoxGeometry(6, 0.05, 0.12), lineM)];
    Lw[0].position.set(CORNER_AT.x + CW / 2 + 0.08, floorY + 0.11, CORNER_AT.z + CDp / 2 - 3); Lw[1].position.set(CORNER_AT.x + CW / 2 - 3, floorY + 0.11, CORNER_AT.z + CDp / 2 + 0.08);
    for (const m2 of Lw) { m2.renderOrder = 996; X.props.root.add(m2); }
    // the three grips: a soft ring of light on each while it is free (not a button: no text on it)
    const ringM = new T.MeshBasicMaterial({ color: '#FFF1C2', transparent: true, opacity: 0.6, depthWrite: false, depthTest: false });
    const rings = [0, 1, 2].map(() => { const m2 = new T.Mesh(new T.RingGeometry(0.85, 1, 40), ringM.clone()); m2.renderOrder = 998; m2.visible = false; X.props.root.add(m2); return m2; });
    // the soft light over the corner (the city's tower shades the trench in the afternoon)
    const fill = new T.PointLight('#FFF0D8', 1.2, 26, 1.2); fill.position.set(CORNER_AT.x - 3, gP + 5, CORNER_AT.z - 5); X.props.root.add(fill);
    const kohHands = () => { const h = X.heroAt ? X.heroAt() : null; const x = h && Number.isFinite(h.x) ? h.x : KOH_AT.x, z = h && Number.isFinite(h.z) ? h.z : KOH_AT.z; return { x, y: X.ground(x, z) + 1.35, z }; };
    const ropeEnd = () => { const c = Math.cos(stone.rotation.y), sn = Math.sin(stone.rotation.y); return { x: stone.position.x - c * sw * 0.5 + sn * 0.0, y: stone.position.y - 0.5, z: stone.position.z + sn * sw * 0.5 }; };
    function gripOf(p) {
      if (A.phase !== 'lower') return null;
      C.tipWorld(tip); const q = X.scr(tip.x, tip.y, tip.z);
      { const s0 = X.scr(stone.position.x, stone.position.y, stone.position.z), ds = Math.hypot(s0.x - p.x, s0.y - p.y); if (ds < 55 && ds < Math.hypot(q.x - p.x, q.y - p.y)) return 'hold'; }   // (build 125: the nearer of the two — in the wider lens of the play zone the stone hangs close under the jib's head)
      if (q.on !== false && Math.hypot(q.x - p.x, q.y - p.y) < 70) return 'jib';
      const h = kohHands(), e2 = ropeEnd(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z);
      const st = X.scr(stone.position.x, stone.position.y, stone.position.z); if (Math.hypot(st.x - p.x, st.y - p.y) < 55) return 'hold';   // ── h116 ── (the stone itself first: the rope's end lies on it) ── /h116 ──
      { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 0.8), d = Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y); if (d < 34 || Math.hypot(a.x - p.x, a.y - p.y) < 60) return 'rope'; }
      if (Math.hypot(st.x - p.x, st.y - p.y) < 90) return 'hold';
      const g = onPlane(X, p.x, p.y, floorY); if (g && Math.hypot(g.x - CORNER_AT.x, g.z - CORNER_AT.z) < 3.2) return 'hold';
      return null;
    }
    // the next thing to do, said once each (then only the standing line)
    function nextLine() {
      if (A.grip) return; const d = Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw, e = rotErr(rot);
      const k = d > 0.1 ? 'jib' : Math.abs(e) > TOL ? 'rope' : 'hold';
      const T2 = { jib: 'גררו את ראש העגורן', rope: 'גררו את החבל: האבן מסתובבת', hold: 'החזיקו על האבן: היא יורדת' };
      const want = A.said[k] ? 'מעל המלבן, ישרה, ולאט' : T2[k];   // (A.said[k]: that grip was used once)
      if (want !== A.lineK) { A.lineK = want; X.line(want); }
    }
    // ── h115 ── the opening: where the corner will stand (the gold line from the platform's level down to the trench), then down to the
    // trench's floor, then the crane (ירון 10.11: "עד שקראתי עכשיו את הטבלה אישית לא הבנתי מהמשחקון את המשמעות שלה בכלל") ── /h115 ──
    function intro() {
      X.shot([WALL_E - 26, 6, WALL_S - 34], [WALL_E, 0, WALL_S], 0.01);
      X.line('כאן תעמוד פינת ההר: 49 אמה מעל הקרקע');
      setTimeout(() => { if (A.phase !== 'intro') return; X.shot([WALL_E - 8, gP + 7, WALL_S - 14], [CORNER_AT.x, floorY + 0.4, CORNER_AT.z], 2.6); X.line('אבן הפינה: האבן הנמוכה ביותר בפינה · כל הפינה תעמוד עליה'); }, 2000);
      setTimeout(() => { if (A.phase !== 'intro') return; A.phase = 'lift'; shotSide(); X.line('החליקו למטה בקצב · גלגל הדריכה מרים את האבן'); X.hand({ x: CRANE_AT.x, y: X.ground(CRANE_AT.x, CRANE_AT.z) + 3, z: CRANE_AT.z }, 0, 40); }, 5600);
    }
    return {
      begin() {
        { const dx = CORNER_AT.x - CRANE_AT.x, dz = CORNER_AT.z - CRANE_AT.z, L = Math.hypot(dx, dz); A.aimP = { x: CORNER_AT.x + (dx / L) * 1.8 + (-dz / L) * 0.9 * (lv >= 2 ? 1 : 0.5), z: CORNER_AT.z + (dz / L) * 1.8 + (dx / L) * 0.9 * (lv >= 2 ? 1 : 0.5) }; }
        A.drop = 0; try { X.hero.setPos(CRANE_AT.x - 4.2, CRANE_AT.z - 4.8, Math.atan2(CORNER_AT.x - CRANE_AT.x + 4.2, CORNER_AT.z - CRANE_AT.z + 4.8)); } catch (e) { /* */ }
        // (a replay of the one-minigame page skips the opening after the first time)
        if (SH.cornerIntro) { A.phase = 'lift'; shotSide(); X.line('החליקו למטה בקצב'); X.hand({ x: CRANE_AT.x, y: X.ground(CRANE_AT.x, CRANE_AT.z) + 3, z: CRANE_AT.z }, 0, 40); } else { SH.cornerIntro = true; intro(); }
      },
      update(dt) {
        A.t += dt;
        if (A.phase === 'intro') C.aim(STOCK.x, STOCK.z, 1);
        if (A.phase === 'lift') {
          // the wheel turns while the steps come; it stops on the ratchet when they stop (the stone never falls)
          const rn = performance.now() / 1000, rate = A.taps.filter((t) => rn - t < 1.2).length / 1.2;
          const heavy = lv >= 2 && rate < 2;
          const target = heavy ? 0 : rate * 0.55;
          A.v = lerp(A.v, target, 1 - Math.exp(-dt * 4));
          A.h = Math.min(A.hMax, A.h + A.v * dt);
          C.wheel.rotation.x -= A.v * dt / C.R * 3.2;
          C.aim(STOCK.x, STOCK.z, 1 - Math.exp(-dt * 6));
          if (A.h >= A.hMax) { A.phase = 'slew'; A.slewT = 0; X.bonus(80, 'lift', 'עלייה'); X.play('rise'); X.line('הזרוע מסתובבת אל הפינה'); X.hand(null); }
        } else if (A.phase === 'slew') {
          A.slewT += dt; C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 2.2)); C.tipWorld(tip); { const d0 = Math.max(0, tip.y - 1.2 - 0.8 - floorY - 4.5); A.drop = Math.min(d0, A.slewT / 1.8 * d0); } A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 2));   // ── h116 ── (the crane pays out the rope while it turns: the stone comes to hang 4½ amot over the corner, in the frame) ── /h116 ──
          if (lv >= 2 && A.slewT < 0.1) A.sway.vx = 1.4;
          if (A.slewT > 1.8) { A.phase = 'lower'; A.lineK = ''; nextLine(); }
        } else if (A.phase === 'lower') {
          // ── h114 ── the finger steers: the jib slews heavily toward the point under it and the hook runs in or out along the jib;
          // the stone follows on its rope, late and swinging (ירון 9.11: "כל אבן יורדת למקום אמיתי") ── /h114 ──
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 1.1)); A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 1.3));
          C.tipWorld(tip);
          // ── h116 ── a hold on the stone lowers it: slow at first, faster the longer (0.5 → 3 amot a second in 1.5 s); let go, it stops ── /h116 ──
          if (A.grip === 'hold') { A.holdT += dt; A.v = 0.5 + 2.5 * Math.min(1, A.holdT / 1.5); } else { A.holdT = 0; A.v = Math.max(0, A.v - dt * 12); }
          nextLine();
          { const ok = Math.abs(rotErr(rot)) <= TOL; lineM.color.set(ok ? '#4CE07A' : '#CFE8D4'); lineM.opacity = ok ? 1 : 0.55; }
          A.drop += A.v * dt;
          C.wheel.rotation.x += A.v * dt / C.R * 3.2;
          const bottom = tip.y - 1.2 - A.drop - 0.8;
          if (bottom <= floorY + 0.02) { A.drop = tip.y - 1.2 - 0.8 - floorY; if (!settle(A.v)) { A.v = 0; } }
        }
        if (A.phase !== 'done') stonePos(dt);
        {
          const on = A.phase === 'lower', P3 = [], cam = X.camera; C.tipWorld(tip);
          if (on) { const h = kohHands(); P3.push([tip.x, tip.y, tip.z, 1.1, 'jib'], [h.x, h.y, h.z, 0.8, 'rope'], [stone.position.x, stone.position.y + 1.2, stone.position.z, 1.4, 'hold']); }
          rings.forEach((m2, i) => { const q = P3[i]; m2.visible = !!q && A.grip !== (q && q[4]); if (!m2.visible) return; m2.position.set(q[0], q[1], q[2]); m2.quaternion.copy(cam.quaternion); m2.scale.setScalar(q[3] * (1 + 0.08 * Math.sin(A.t * 4 + i))); m2.material.opacity = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(A.t * 4 + i)); });
        }
        if (A.phase === 'slew' || A.phase === 'lower') {
          // ── h114 ── over the corner: the stone and its trench in one frame, the camera low enough that the stone stands against the
          // hill, not lost in the city behind (ירון 9.11) ── /h114 ──
          const ty = (pos.y + floorY) / 2;
          X.track([CORNER_AT.x - 19, floorY + 40, CORNER_AT.z - 2], [CORNER_AT.x - 3, floorY + 4, CORNER_AT.z - 3.5], 2.2);   // ── h116 ── (high from inside the Mount, west: the city's wall that meets the corner stands outside it at the right; the kohen on his rope, the jib's head over the stone; the stone's turn read from above against the corner's lines) ── /h116 ──   // (from the north, the Mount's side: the crane at the right, the trench of both walls in front, the city's tower behind the corner)
          // the green rectangle fills while the stone hangs over it
          if (pit.userData.fill) pit.userData.fill.material.opacity = Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw <= 0.1 ? 0.7 : 0.18 + 0.1 * Math.sin(A.t * 5);
        }
        if (A.phase !== 'done') { const h = kohHands(), e2 = ropeEnd(); tag.show(true); tag.set(e2, h, A.grip === 'rope' ? 0.15 : 0.6); }
        else tag.show(false);
        if (A.phase === 'done' && A.settle) {
          // (on to the chalk: at once when it landed right; the crewmen's bars push it over the rest)
          const S2 = A.settle; S2.t += dt; const k = ease(Math.min(1, S2.t / S2.dur));
          stone.position.set(lerp(S2.from.x, CORNER_AT.x, k), floorY + 0.8, lerp(S2.from.z, CORNER_AT.z, k));
          stone.rotation.y = lerp(S2.from.r, S2.to, k);
          if (stone.parent && slings.parent) slingsAt(true);
          if (S2.t > S2.dur) A.settle = null;
        }
      },
      wants(p) { if (A.phase === 'lift') return !p || nearObjs(X, p, [C.wheel, stone], bigR()); return !!gripOf(p); },   // ── h116 ── (the three grips; elsewhere the right thumb looks) ── /h116 ── (build 125: the lift's steps are the wheel's and the stone's on the right half; the slew is the crane's own — the look's)
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: performance.now() / 1000, ax: A.ax };
        if (A.phase === 'lower') { A.grip = gripOf(p); A.rx = p.x; X.hand(null); if (A.grip) { X.play('rope'); A.said[A.grip] = true; } if (A.grip === 'jib') { C.tipWorld(tip); A.jg = { y: tip.y, g0: onPlane(X, p.x, p.y, tip.y), a0: { ...(A.aimP || pos) } }; } }
      },
      move(p) {
        if (A.phase !== 'lower' || !A.p0) return;
        if (A.grip === 'jib' && A.jg && A.jg.g0) { const g = onPlane(X, p.x, p.y, A.jg.y); if (g) { let x = A.jg.a0.x + (g.x - A.jg.g0.x), z = A.jg.a0.z + (g.z - A.jg.g0.z); const d = Math.hypot(x - CORNER_AT.x, z - CORNER_AT.z); if (d > 9) { x = CORNER_AT.x + (x - CORNER_AT.x) * 9 / d; z = CORNER_AT.z + (z - CORNER_AT.z) * 9 / d; } A.aimP = { x, z }; } }
        else if (A.grip === 'rope') { A.rotT += (p.x - A.rx) * 0.011; A.rx = p.x; }
      },
      up(p) {
        const P0 = A.p0; A.p0 = null; A.hold = false; A.grip = null;
        if (A.phase === 'lift' && P0 && p.y - P0.y >= 40 && performance.now() / 1000 - P0.t <= 0.45) { swipe(); X.hand(null); }
      },
      end() { if (arrow) X.props.remove(arrow); if (turnA) X.props.remove(turnA); for (const m2 of Lw.concat(rings)) X.props.remove(m2); X.props.root.remove(fill); tag.dispose(); X.props.remove(sh); X.props.remove(slings); for (const l of legs) l.dispose(); C.rope.show(false); for (const w of crew.concat(A.barmen)) SH.crew.remove(w); if (!SH.cornerSet) X.props.remove(stone); else { SH.cornerStone = stone; stone.position.set(CORNER_AT.x, floorY + 0.8, CORNER_AT.z); stone.rotation.y = 0; } },
      at() { return { x: CORNER_AT.x, y: gP + 2, z: CORNER_AT.z }; },
      dbg() { C.tipWorld(tip); return { phase: A.phase, h: +A.h.toFixed(2), v: +A.v.toFixed(2), drop: +(A.drop || 0).toFixed(2), gap: +(tip.y - 1.2 - (A.drop || 0) - 0.8 - floorY).toFixed(2), swing: +Math.hypot(A.sway.vx, A.sway.vz).toFixed(2), dx: +(Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw).toFixed(3), chips: A.chips, rejects: A.rejects, grades: A.grades.slice(-6), ax: +A.ax.toFixed(2), sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2), chalk: (() => { const q = X.scr(CORNER_AT.x, gP, CORNER_AT.z); return [Math.round(q.x), Math.round(q.y)]; })(),
        // ── h116 ── the grips on the screen, the turn's error and its tolerance ── /h116 ──
        ...(() => { const r2 = (q) => [Math.round(q.x), Math.round(q.y)], h = kohHands(), e2 = ropeEnd(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z); return { tipScr: r2(X.scr(tip.x, tip.y, tip.z)), jibTo: r2(X.scr(tip.x + CORNER_AT.x - pos.x, tip.y, tip.z + CORNER_AT.z - pos.z)), ropeScr: r2({ x: (a.x * 2 + b.x) / 3, y: (a.y * 2 + b.y) / 3 }), handsScr: r2(a), stoneScr: r2(X.scr(stone.position.x, stone.position.y, stone.position.z)), floorScr: r2(X.scr(CORNER_AT.x, floorY, CORNER_AT.z)), rotE: rot == null ? 0 : +(rotErr(rot) * 180 / Math.PI).toFixed(2), tol: +(TOL * 180 / Math.PI).toFixed(2), grip: A.grip, misses: A.misses | 0, cracks: A.cracks, offX: +(pos.x - CORNER_AT.x).toFixed(2), offZ: +(pos.z - CORNER_AT.z).toFixed(2) }; })() }; },
    };
  },
};

/* ───────── 3.6 the course of the east retaining wall ───────── */
// ── h114 ── rebuilt (ירון 9.11: "לא מבין מה עושים"; "אבן קופצת למקום"; "הצוות מסדר לא יותר מ5-10% מהמיקום אחרת אין משחק"; "אבני
// המלאי בתוך המנוף"; "צריך לפחות 5 גדלי אבנים"). A real gap in the crews' wall; five stones of five lengths in a row on the ground,
// each with its length in chalk; a tap — the crew ties THAT stone and the crane lifts it; the finger steers the crane (it follows
// heavily, the stone swings on its rope) and a hold lowers it; where it lands is where it is: within a twentieth of its length the
// crew needs nothing, within a tenth they bar it over (seen), farther and it has to come up again; a fast landing on a neighbour
// chips its corner (−20). The gap closes only in the one order whose joints all fall clear of the joints below (a solver checked
// each puzzle: only one way works) — a wrong stone is lifted out again. ── /h114 ──
const WALL_X = 276.1;   // ── h114 ── on the world's own east wall: the courses are its top courses, flush with its face (x 277) ── /h114 ──
const LENS = [2, 2.5, 3, 3.5, 4];
// each course: the gap in the kohen's stretch and the joints of the course under it — one order only of the five lengths fills the
// gap with no joint over a joint (checked by a search over every subset and order, tools: see the build notes)
const COURSES = [
  // ── h115 ── (build115-brief §7) two stretches of the east wall north of the corner stone (they leave the corner's trench open, so the
  // corner stone is seen from the Mount's side) ── /h115 ──
  { z0: 352, P: [{ gap: [3.5, 10.5], below: [6.5], sol: [4, 3] }, { gap: [3.5, 11.5], below: [5.25, 9.25], sol: [2.5, 2, 3.5] }] },
  { z0: 316, P: [{ gap: [3.5, 13.5], below: [7.25, 10], sol: [2.5, 3.5, 4] }, { gap: [3.5, 14.5], below: [5.75, 8.75, 12.25], sol: [3.5, 2.5, 2, 3] }] },
];
// ── h116 ── (world flow, brief §D) the free courses 2..7: the same wall's next stretches north, every 36 amot, its two puzzles in turn
// (they are the wall's own courses: the crews lay the rest of each stretch; his gap is the work) ── /h116 ──
for (let c = 2; c < 8; c++) COURSES.push({ z0: 316 - 36 * (c - 1), P: COURSES[c % 2].P, free: true });
const CH = 1.6, CD = 1.8;
const puzzleOf = (c, lv) => { const K = COURSES[c], P = K.P[lv >= 3 ? 1 : 0]; return { z0: K.z0, gap: P.gap, sol: P.sol, below: [-8, -3, 1.5, ...P.below, P.gap[1] + 3, P.gap[1] + 8] }; };
function courseWorld(X, c, lv, laid) {
  // the crews' courses: the foundation (sunk) and the course under his; the crews' stones of his own course on both sides of the gap
  const K = puzzleOf(c, lv), g = X.ground(WALL_X, K.z0 + 7), out = [];
  const lay = (a, b, y) => { const m = stoneMesh(X, b - a - 0.06, CH - 0.04, CD); m.rotation.y = Math.PI / 2; m.position.set(WALL_X, y + CH / 2, K.z0 + (a + b) / 2); out.push(m); return m; };
  const y0 = g - CH * 0.6, B = K.below;
  for (let i = 0; i < B.length - 1; i++) lay(B[i] + (i % 2 ? 1.1 : -0.4), B[i + 1] + (i % 2 ? 1.1 : -0.4), y0);
  for (let i = 0; i < B.length - 1; i++) lay(B[i], B[i + 1], y0 + CH);
  const yB = y0 + CH * 2;
  lay(-8, -4.5, yB); lay(-4.5, K.gap[0], yB); lay(K.gap[1], K.gap[1] + 4, yB); lay(K.gap[1] + 4, K.gap[1] + 8, yB);
  if (laid) for (const [a, b] of laid) lay(a, b, yB);
  return { out, base: yB, K };
}
function chalkTag(X, text, w = 1.3, ink = 'rgba(250,247,238,.95)') {
  const T = X.THREE, cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d');
  let fs = 96; g.font = `900 ${fs}px Heebo, system-ui, sans-serif`; while (fs > 30 && g.measureText(text).width > 244) { fs -= 6; g.font = `900 ${fs}px Heebo, system-ui, sans-serif`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = ink; g.fillText(text, 128, 70);
  const tex = new T.CanvasTexture(cv); const m = new T.Mesh(new T.PlaneGeometry(w, w / 2), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 3;
  const g2 = new T.Group(); g2.add(m); g2.rotation.y = -Math.PI / 2;   // (its top toward the wall: upright for a camera on the Mount's side)
  return g2;
}
export const COURSE = {
  icon: '🧱', title: 'הנדבך',
  walkLine: (m) => `חומת התמך המזרחית: סוגרים רווח בנדבך ${m.c + 2}`,
  stand(m, X) { const K = COURSES[m.c]; return { x: WALL_X - 15, z: K.z0 - 3, face: [WALL_X, K.z0 + 7] }; },
  prepare(m, X) { const K = puzzleOf(m.c, X.level()), zc = K.z0 + (K.gap[0] + K.gap[1]) / 2; SH.crane.place(WALL_X - 8.5, zc + 6.5, Math.PI); SH.crane.rope.show(false); },
  make(m, X) {
    const lv = X.level(), T = X.THREE, C = SH.crane;
    SH.courseW = SH.courseW || {}; if (SH.courseW[m.c]) { for (const o of SH.courseW[m.c]) X.props.remove(o); }
    const W0 = courseWorld(X, m.c, lv, null), K = W0.K, yB = W0.base, zc = K.z0 + (K.gap[0] + K.gap[1]) / 2; SH.courseW[m.c] = W0.out;
    const gx = WALL_X - 17, gS = X.ground(gx, zc); void gS;
    const A = { phase: 'open', t: 0, cur: null, set: [], stock: [], grades: [], lifts: 0, joj: 0, hold: false, v: 0, drop: 0, ax: 0, aimP: { x: gx, z: zc }, sway: { x: 0, z: 0, vx: 0, vz: 0 }, tipP: null, rise: 0, settle: null, crew: [], marks: [], chips: 0, said: {}, rotT: 0, rv: 0, grip: null };
    const tip = new T.Vector3(), hangB = yB + CH + 1.1;   // (the bottom of a hanging stone: clear of the course's top)
    // the stock: one stone of each length, in a row on the ground on the Mount's side, apart from the crane and the crews; chalked
    LENS.forEach((L, i) => {
      const s = stoneMesh(X, L - 0.06, CH - 0.04, CD); const z = zc - 2.5 + i * 2.6, x = gx; s.position.set(x, X.ground(x, z) + CH / 2, z); s.rotation.y = 0;
      // (its length in chalk on its top, read from the Mount's side: the chalk follows the stone while it is not laid)
      const tg = chalkTag(X, String(L).replace('.5', '½'), 1.5); X.props.root.add(tg);
      A.stock.push({ m: s, L, home: { x, z }, laid: null, tg });
    });
    // the joints below: chalk ticks on the course under the gap (level 1–2; at 3 the joints are read from the seams alone)
    if (lv < 3) for (const b of K.below) if (b > K.gap[0] && b < K.gap[1]) { const tk = new T.Mesh(new T.BoxGeometry(CD + 0.1, 0.03, 0.12), new T.MeshBasicMaterial({ color: '#F4F0E6' })); tk.position.set(WALL_X, yB + 0.02, K.z0 + b); X.props.root.add(tk); A.marks.push(tk); }
    // the crews: a crewman with his bar at each side of the gap (they bar a stone over), one at the stock who ties the slings
    const crewA = [SH.crew.add(WALL_X - 1.8, K.z0 + K.gap[0] - 2.2, { role: 'hold', item: 'staff', fx: WALL_X, fz: K.z0 + K.gap[0], crew: 3 }), SH.crew.add(WALL_X - 1.8, K.z0 + K.gap[1] + 2.2, { role: 'hold', item: 'staff', fx: WALL_X, fz: K.z0 + K.gap[1], crew: 3 }), SH.crew.add(gx + 3.2, zc - 7.5, { role: 'kneel', item: 'rope', fx: gx, fz: zc - 5, crew: 1 })];
    const legs = [X.props.rope(6, 0.045), X.props.rope(6, 0.045)], tag = X.props.rope(10, 0.035);
    const mark = new T.Mesh(new T.BoxGeometry(CD + 0.12, 0.05, 1), new T.MeshBasicMaterial({ color: '#3BD16F', transparent: true, opacity: 0.4, depthWrite: false })); mark.renderOrder = 996; mark.visible = false; X.props.root.add(mark);   // ── h115 ── ── /h115 ──
    // ── h117 ── (ירון 10.11: "האבן מסתובבת אוטומטית, ציפיתי שאוכל להזיז אותה ימינה ושמאלה בנגיעה בחבל"; "לא מבין איפה האבן ביחס לחומה")
    // he turns the stone: the guide rope from its Mount-side end to a stake on the Mount's side of the wall; three grips as at the corner
    // stone (the jib's head moves it, the rope turns it, a hold on the stone lowers it); under it its own dark shadow and a plumb line;
    // rings of light on the grips until each is used ── /h117 ──
    const STK = { x: WALL_X - 7.5, z: zc - 6.5 }, stk = X.props.stake(STK.x, STK.z, 1.3, false), guide = X.props.rope(12, 0.075);
    const ringM = new T.MeshBasicMaterial({ color: '#FFF1C2', transparent: true, opacity: 0.6, depthWrite: false, depthTest: false });
    const rings = [0, 1, 2].map(() => { const m2 = new T.Mesh(new T.RingGeometry(0.85, 1, 40), ringM.clone()); m2.renderOrder = 998; m2.visible = false; X.props.root.add(m2); return m2; });
    const shG = new T.Group(), shM = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0x1A120A, transparent: true, opacity: 0.42, depthWrite: false })); shM.rotation.x = -Math.PI / 2; shM.renderOrder = 995; shG.add(shM); shG.visible = false; X.props.root.add(shG);
    const plG = new T.BufferGeometry(); plG.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));
    const plumb = new T.Line(plG, new T.LineBasicMaterial({ color: 0x2A1C0E })); plumb.visible = false; plumb.frustumCulled = false; X.props.root.add(plumb);
    const TOLR = 0.12, ALONG = Math.PI / 2, jibMid = new T.Vector3();
    /** how far the stone lies from the wall's line (a stone is the same end for end): rad, signed */
    const rotErr = (r) => Math.atan2(Math.sin(2 * (r - ALONG)), Math.cos(2 * (r - ALONG))) / 2;
    const ropeEnd = () => { const q = A.cur; if (!q) return null; const s = q.m, r = s.rotation.y; return { x: s.position.x - Math.cos(r) * q.L * 0.5, y: s.position.y - CH * 0.2, z: s.position.z + Math.sin(r) * q.L * 0.5 }; };
    const stkTop = () => ({ x: STK.x, y: X.ground(STK.x, STK.z) + 1.2, z: STK.z });
    function gripOf(p) {
      if (A.phase !== 'carry' || !A.cur) return null;
      C.tipWorld(tip); const tq = X.scr(tip.x, tip.y, tip.z);
      { const s0 = A.cur.m.position, q0 = X.scr(s0.x, s0.y, s0.z), ds = Math.hypot(q0.x - p.x, q0.y - p.y); if (ds < 50 && ds < Math.hypot(tq.x - p.x, tq.y - p.y)) return 'hold'; }   // (build 125: the nearer of the two — in the wider lens of the play zone the stone hangs close under the jib's head)
      if (tq.on !== false && Math.hypot(tq.x - p.x, tq.y - p.y) < 70) return 'jib';
      // (anywhere on the jib's beam, its outer two thirds: the head may stand near the frame's edge in the high view)
      { const m0 = jibMid.set(0, C.mastH + 0.9, 2.2 + C.jibL * 0.35); C.slew.localToWorld(m0); const a = X.scr(m0.x, m0.y, m0.z), vx = tq.x - a.x, vy = tq.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 1); if (Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y) < 36) return 'jib'; }
      const s = A.cur.m, st = X.scr(s.position.x, s.position.y, s.position.z); if (Math.hypot(st.x - p.x, st.y - p.y) < 50) return 'hold';
      const e2 = ropeEnd(), h = stkTop(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z);
      { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 0.85), d = Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y); if (d < 36) return 'rope'; }
      if (Math.hypot(st.x - p.x, st.y - p.y) < 85) return 'hold';
      return null;
    }
    const occ = () => { const o = [[-1e3, K.gap[0]], [K.gap[1], 1e3]]; for (const q of A.set) o.push([q.a, q.b]); return o; };
    const relZ = (z) => z - K.z0;
    // ── the camera: the gap from above first (where am I), then down in front of the work: stock, crane and gap in one frame ──
    // ── h117 ── high over the Mount's side, almost straight down (≈70°): the wall runs left to right across the screen, the stock at
    // the bottom; right and left are along the wall, up and down toward and away from it ── /h117 ──
    const yM = yB - 2, CAMW = { p: [WALL_X - 7.5 - 18, yM + 50, zc + 2], t: [WALL_X - 7.5, yM, zc + 2] };   // (the course is far above the stock's ground: the frame's middle a little below the course)
    function camWork() { X.shot(CAMW.p, CAMW.t, 1.2); }
    function hookTo(q) {
      A.cur = q; A.phase = 'hook'; A.t0 = A.t; A.rise = 0; A.ax = 0; A.drop = 0; A.v = 0;
      A.aimP = { x: q.m.position.x, z: q.m.position.z }; A.from = { y: q.m.position.y, r: q.m.rotation.y };
      A.rotT = q.m.rotation.y; A.rv = 0; A.grip = null; A.hold = false;   // ── h117 ── (it comes up as it lay: across the wall) ── /h117 ──
      if (q.laid) { const i = A.set.indexOf(q.laid); if (i >= 0) A.set.splice(i, 1); q.laid = null; A.lifts++; X.word({ x: WALL_X, y: yB + CH + 1.5, z: q.m.position.z }, 'מרימים אותה חזרה'); clearMarksOf(q); }
      X.line('הצוות קושר את האבן · המנוף מרים'); X.play('rope'); X.hand(null);
    }
    function clearMarksOf(q) { if (q.crack) { X.props.remove(q.crack); q.crack = null; A.joj = Math.max(0, A.joj - 1); } }
    function axFor(P) { const R = Math.hypot(C.tipL.z, C.tipL.x) || 10; return clamp(Math.hypot(P.x - C.base.x, P.z - C.base.z) - R, -3.2, 3.2); }
    function slings(on) {
      const q = A.cur; if (!q || !on) { for (const l of legs) l.show(false); return; }
      const s = q.m, ax = { x: Math.cos(s.rotation.y), z: -Math.sin(s.rotation.y) }, hk = { x: s.position.x, y: s.position.y + CH / 2 + 1.0, z: s.position.z };
      C.tipWorld(tip); C.rope.show(true); C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, hk, 0);
      for (let k = 0; k < 2; k++) { const sg = k ? 1 : -1; legs[k].show(true); legs[k].set(hk, { x: s.position.x + ax.x * sg * q.L * 0.32, y: s.position.y + CH / 2, z: s.position.z + ax.z * sg * q.L * 0.32 }, 0); }
      // the kohen's tagline: from his hand to the stone's end
      // ── h115 ── no kohen at the course (the brief's figure rule): the crew's tagline is the stock man's, not drawn ── /h115 ──
      const hp = null;
      if (hp) { tag.show(true); tag.set({ x: s.position.x - ax.x * q.L * 0.5, y: s.position.y - CH * 0.3, z: s.position.z - ax.z * q.L * 0.5 }, hp, 0.5); } else tag.show(false);
    }
    // ── the landing: judged where it really is ──
    function land(vT) {
      const q = A.cur, s = q.m, L = q.L, at = { x: WALL_X, y: yB + CH + 1, z: s.position.z };
      const a = relZ(s.position.z) - L / 2, b = a + L, dx = Math.abs(s.position.x - WALL_X);
      // over the bed at all? (off the wall's line: on the face of the course below — up again)
      if (dx > 0.6) return bounce(at, 'לא על קו החומה · מרימים שוב');
      const O = occ();
      // where would it butt: the nearest free edge on either side
      let left = -1e3, right = 1e3; for (const [o0, o1] of O) { if (o1 <= a + L / 2) left = Math.max(left, o1); if (o0 >= a + L / 2) right = Math.min(right, o0); }
      const room = right - left;
      if (L > room + 0.02) { if (vT > 1.3) return chip(at, q); return bounce(at, 'ארוכה מדי לרווח הזה · מרימים'); }
      // the edges it lies against: on the left (its usual) or the right when that is nearer
      const dL = a - left, dR = right - b, overlapL = dL < -0.02, overlapR = dR < -0.02;
      if ((overlapL || overlapR) && vT > 1.3) return chip(at, q);
      const want = Math.abs(dL) <= Math.abs(dR) ? left : right - L;   // (its butting place)
      const dev = Math.abs(a - want) / L, devX = dx / CD, rE = Math.abs(rotErr(s.rotation.y));
      if (rE > TOLR) { A.said.rope = false; return bounce(at, 'עקומה: סובבו בחבל'); }   // ── h117 ── (askew: up again, no penalty; the rope's ring pulses again) ── /h117 ──
      const e = Math.max(dev, devX * 0.5, rE / 0.24);
      if (e > 0.1) return bounce(at, e === dev ? 'רחוק מהשכנה · הצוות לא יגיע · מרימים' : 'בולטת מהקו · מרימים');
      const grade = e <= 0.05 ? 'gold' : 'good';
      A.grades.push(grade);
      const qq = { q, a: want, b: want + L }; A.set.push(qq); q.laid = qq;
      A.settle = { q, from: { x: s.position.x, z: s.position.z, r: s.rotation.y }, to: { x: WALL_X, z: K.z0 + want + L / 2 }, t: 0, dur: grade === 'gold' ? 0.2 : 1.3 };
      s.position.y = yB + CH / 2;
      X.play('settle'); X.dust(s.position.x, yB + 0.2, s.position.z, 10, 2.4); X.shake(0.15, 0.25);
      X.hit(at, grade, { text: grade === 'gold' ? 'מהודר' : 'הצוות מיישר במוטות', craft: 'בנאים' });
      if (grade === 'good') { const w = SH.crew.add(WALL_X - 2.4, s.position.z + (want + L / 2 + K.z0 > s.position.z ? -L / 2 - 0.9 : L / 2 + 0.9), { role: 'lever', item: 'staff', fx: WALL_X, fz: s.position.z, crew: 2 }); A.crew.push(w); setTimeout(() => { SH.crew.remove(w); const i = A.crew.indexOf(w); if (i >= 0) A.crew.splice(i, 1); }, 2200); }
      // a joint over a joint below: it sits, but the seam runs on down — the mason marks it in chalk (it may be lifted out again)
      const jo = [qq.a, qq.b].filter((j) => j > K.gap[0] + 0.01 && j < K.gap[1] - 0.01 && K.below.some((bb) => Math.abs(bb - j) < 0.3));
      if (jo.length) { A.joj++; const cr = new T.Mesh(new T.PlaneGeometry(0.09, CH * 2), new T.MeshBasicMaterial({ color: '#C0392B' })); cr.position.set(WALL_X - CD / 2 - 0.03, yB, K.z0 + jo[0]); cr.rotation.y = -Math.PI / 2; X.props.root.add(cr); q.crack = cr; X.word({ x: WALL_X, y: yB + CH + 0.6, z: K.z0 + jo[0] }, 'חיבור מעל חיבור · הרימו אותה חזרה'); }
      A.cur = null; A.phase = 'settle'; slings(false); C.rope.show(false); tag.show(false);
      return true;
    }
    function bounce(at, why) {
      A.drop = Math.max(0, A.drop - 1.6); A.v = 0; X.word(at, why); X.play('thud'); A.misses = (A.misses | 0) + 1;
      // ── h115 ── the way to the green place: an arrow on the course from where it came down ── /h115 ──
      const q = A.cur, w = q && wantOf(q, q.m.position.z);
      if (w != null) { if (A.arrow) X.props.remove(A.arrow); A.arrow = greenArrow(X, { x: q.m.position.x, z: q.m.position.z }, { x: WALL_X, z: K.z0 + w + q.L / 2 }, yB + 0.08); }
      return false;
    }
    /** ── h115 ── where the stone L would butt if it came down with its middle at z: the nearer free edge of the stretch it is over
     *  (as land() judges it); null when it does not fit the stretch ── /h115 ── */
    function wantOf(q, z) {
      const L = q.L, c = clamp(relZ(z), K.gap[0] + 0.01, K.gap[1] - 0.01), a = c - L / 2, O = occ();
      let left = -1e3, right = 1e3; for (const [o0, o1] of O) { if (o1 <= c) left = Math.max(left, o1); if (o0 >= c) right = Math.min(right, o0); }
      if (L > right - left + 0.02) return null;
      return Math.abs(a - left) <= Math.abs(right - (a + L)) ? left : right - L;
    }
    function chip(at, q) {
      A.chips++; A.v = 0; A.drop = Math.max(0, A.drop - 1.4); X.sparks(q.m.position.x, yB + 0.3, q.m.position.z, 12); X.play('crack'); X.shake(0.18, 0.35);
      if (q.chipped) {
        // the second time: the stone is spoilt — off to the waste, a new one of the same length is cut for him
        X.loss(20, at, 'האבן נסדקה', 1); wasteAdd(X, 1, at);
        q.m.position.set(q.home.x, X.ground(q.home.x, q.home.z) + CH / 2, q.home.z); q.m.rotation.y = 0; q.chipped = false; A.cur = null; A.phase = 'choose'; slings(false); C.rope.show(false); tag.show(false); camWork();
        X.line('האבן לפסולת · הצוות הביא אחרת באותו אורך');
      } else { q.chipped = true; X.loss(20, at, 'שבב בפינה'); X.word(at, 'שבב! ירדה מהר על השכנה'); }
      return false;
    }
    function checkStuck() {
      // the free stretch left and what is left in the stock: can it still close? (a sum of the lengths that fits it)
      let free = 0; const O = occ().sort((p, q) => p[0] - q[0]); for (let i = 0; i < O.length - 1; i++) free += Math.max(0, O[i + 1][0] - O[i][1]);
      if (free < 0.05) return 'full';
      const left = A.stock.filter((q) => !q.laid).map((q) => q.L); let ok = false;
      const go = (i, sum) => { if (ok) return; if (Math.abs(sum - free) < 0.02) { ok = true; return; } if (i >= left.length || sum > free) return; go(i + 1, sum + left[i]); go(i + 1, sum); };
      go(0, 0); return ok ? 'open' : 'stuck';
    }
    function afterSet() {
      const st = checkStuck();
      if (st === 'full') return close();
      A.phase = 'choose';
      X.line(st === 'stuck' ? 'שום אבן שנשארה לא תסגור את הרווח · געו באבן שהנחתם כדי להרים אותה' : A.joj ? 'חיבור מעל חיבור: געו באבן המסומנת כדי להרים אותה' : 'עוד אבן · בלי חיבור מעל חיבור');
    }
    function close() {
      if (A.joj) { A.phase = 'choose'; X.line('הרווח מלא, אבל יש חיבור מעל חיבור · הרימו אותה והחליפו'); return; }
      A.phase = 'done';
      const at = { x: WALL_X, y: yB + CH + 1.5, z: zc };
      const allGold = A.grades.every((g) => g === 'gold');
      X.bonus(100 * (lv >= 3 ? 2 : 1), 'course', 'נדבך בלי חיבור על חיבור');
      if (!A.lifts && !A.chips) X.bonus(100, 'clean', 'נסגר בלי להרים אף אבן');
      if (allGold && !A.lifts && !A.chips) X.perfect('בול! הנדבך נסגר', at);
      SH.courseSet = SH.courseSet || {}; SH.courseSet[m.c] = A.set.map((q) => q.q.m);
      try { const st = X.M.st; st.courseLay = st.courseLay || {}; st.courseLay[m.c] = { lv, laid: A.set.map((q) => [q.a, q.b]) }; X.save(); } catch (e) { /* */ }
      X.line('הנדבך נסגר · ' + K.sol.join(' + ') + ' = ' + (K.gap[1] - K.gap[0]) + ' אמות');
      setTimeout(() => X.shot([WALL_X - 26, yB + 30, zc - 18], [WALL_X, yB, zc], 1.6), 1200);
      const q = A.grades.reduce((a2, g) => a2 + (g === 'gold' ? 1 : 0.8), 0) / Math.max(1, A.grades.length) * (A.lifts ? 0.85 : 1) * (A.chips ? 0.8 : 1);
      const perfect = allGold && !A.lifts && !A.chips && !A.misses;
      setTimeout(() => X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, perfect, at }), 5200);
    }
    function pick(p) {
      const ms = A.stock.map((q) => q.m); const hits = X.rayAt(p.x, p.y).intersectObjects(ms, true);
      if (!hits.length) return null; let o = hits[0].object; while (o && !ms.includes(o)) o = o.parent; return A.stock.find((q) => q.m === o) || null;
    }
    function steer(p) { const g = onPlane(X, p.x, p.y, yB + CH / 2); if (g && Math.hypot(g.x - C.base.x, g.z - C.base.z) < 15) A.aimP = { x: g.x, z: g.z }; }
    return {
      begin() {
        X.shot([WALL_X - 26, yM + 58, zc + 2], [WALL_X - 6, yM, zc + 2], 1.0);   // ── h117 ── (the same high view as the work's, higher) ── /h117 ──
        X.line(`רווח של ${K.gap[1] - K.gap[0]} אמות בחומה · ${K.sol.length > 2 ? 'כמה' : 'שתי'} אבנים יסגרו אותו`);
        try { X.hero.setPos(WALL_X - 7, zc - 8.5, Math.PI / 2); } catch (e) { /* */ }
        X.kohen(false);   // ── h115 ── ── /h115 ──
        setTimeout(() => { if (A.phase === 'open') { A.phase = 'choose'; camWork(); X.line('געו באבן מהשורה: הצוות קושר אותה למנוף'); const q = A.stock[2]; X.hand({ x: q.m.position.x, y: q.m.position.y + 1, z: q.m.position.z }, 0, 10); } }, 2600);
      },
      update(dt) {
        A.t += dt; C.tipWorld(tip);
        const q = A.cur;
        if (A.phase !== 'carry' || !q) { mark.visible = false; shG.visible = false; plumb.visible = false; }   // ── h115 ── ── /h115 ──
        // ── h117 ── the guide rope (stone's end → stake) and the rings on the three grips while each is still unused ── /h117 ──
        { const e2 = (A.phase === 'carry' || A.phase === 'hook') && q ? ropeEnd() : null; if (e2) { guide.show(true); guide.set(e2, stkTop(), A.grip === 'rope' ? 0.1 : 0.45); } else guide.show(false);
          const P3 = []; if (A.phase === 'carry' && q) { C.tipWorld(tip); const h = stkTop(); P3.push([tip.x, tip.y, tip.z, 1.1, 'jib'], [(h.x + e2.x) / 2, (h.y + e2.y) / 2, (h.z + e2.z) / 2, 0.9, 'rope'], [q.m.position.x, q.m.position.y + CH, q.m.position.z, 1.3, 'hold']); }
          rings.forEach((m2, i) => { const r = P3[i]; m2.visible = !!r && !A.said[r[4]] && A.grip !== r[4]; if (!m2.visible) return; m2.position.set(r[0], r[1], r[2]); m2.quaternion.copy(X.camera.quaternion); m2.scale.setScalar(r[3] * (1 + 0.08 * Math.sin(A.t * 4 + i))); m2.material.opacity = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(A.t * 4 + i)); }); }
        for (const s2 of A.stock) { s2.tg.visible = !s2.laid; if (!s2.laid) { s2.tg.position.set(s2.m.position.x, s2.m.position.y + CH / 2 + 0.03, s2.m.position.z); s2.tg.rotation.y = s2.m.rotation.y - Math.PI / 2; } }
        if (A.phase === 'hook' && q) {
          // the jib swings over the stone, the hook comes down, the crew ties it, it rises
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 2.4)); A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 2.4));
          const rl = Math.hypot(tip.x - C.base.x, tip.z - C.base.z) || 1, hx = tip.x + ((tip.x - C.base.x) / rl) * A.ax, hz = tip.z + ((tip.z - C.base.z) / rl) * A.ax;
          const over = Math.hypot(hx - q.m.position.x, hz - q.m.position.z) < 0.35 || A.t - A.t0 > 2.4;
          C.rope.show(true); C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: hx, y: Math.max(q.m.position.y + CH / 2 + 1.0, tip.y - 3 - A.rise * 6), z: hz }, 0);
          if (over) { A.rise += dt * 0.9; if (A.rise >= 1) { A.phase = 'carry'; A.sway.x = A.sway.z = A.sway.vx = A.sway.vz = 0; A.tipP = { x: tip.x, z: tip.z }; X.line(q.L + ' אמות · גררו את ראש העגורן אל הרווח · סובבו בחבל לאורך החומה · החזיקו על האבן: יורדת'); X.play('rise'); } }
          if (over && A.rise > 0.4) { const k = clamp((A.rise - 0.4) / 0.6, 0, 1); q.m.position.y = lerp(A.from.y, hangB + CH / 2, ease(k)); slings(true); }
        } else if (A.phase === 'carry' && q) {
          // the crane after the finger, heavily; the stone on its rope, late and swinging; a hold over the wall lowers it
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 1.0)); A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 1.2));
          C.tipWorld(tip);
          const ta = { x: (tip.x - A.tipP.x) / Math.max(dt, 1e-3), z: (tip.z - A.tipP.z) / Math.max(dt, 1e-3) }; A.tipP = { x: tip.x, z: tip.z };
          const S = A.sway, w2 = 9.8 / 6, damp = [2.2, 0.35, 0.12][lv - 1], wind = lv >= 3 ? Math.sin(A.t * 0.6) * 0.35 : 0;
          S.vx += (-w2 * S.x - (ta.x - (S.lx || 0)) * 0.9 + wind) * dt; S.vz += (-w2 * S.z - (ta.z - (S.lz || 0)) * 0.9) * dt; S.lx = ta.x; S.lz = ta.z;
          S.vx *= Math.exp(-dt * damp); S.vz *= Math.exp(-dt * damp); S.x = clamp(S.x + S.vx * dt, -1.6, 1.6); S.z = clamp(S.z + S.vz * dt, -1.6, 1.6);
          const rl = Math.hypot(tip.x - C.base.x, tip.z - C.base.z) || 1, hx = tip.x + ((tip.x - C.base.x) / rl) * A.ax + S.x, hz = tip.z + ((tip.z - C.base.z) / rl) * A.ax + S.z;
          const overWall = Math.abs(hx - WALL_X) < 1.4 && relZ(hz) > K.gap[0] - 6 && relZ(hz) < K.gap[1] + 6;
          // (it comes down only once the crane is there: a hold on the gap first brings it, then lowers it)
          const hx0 = hx - S.x, hz0 = hz - S.z, there = Math.hypot(hx0 - A.aimP.x, hz0 - A.aimP.z) < 0.8;
          A.v = A.grip === 'hold' && there ? Math.min(2.4, A.v + dt * 2.6) : Math.max(0, A.v - dt * 10);
          A.drop += A.v * dt;
          const floor = overWall ? yB : X.ground(hx, hz);
          let bottom = hangB - A.drop;
          // (the tagline: he turns it along the wall over the wall, across it over the stock)
          // ── h117 ── no turn by itself: it follows the rope, late, with a little overshoot; at level 3 the wind turns it a little ── /h117 ──
          if (lv >= 3) A.rotT += Math.sin(A.t * 0.47 + 1.3) * 0.05 * dt;
          A.rv += ((A.rotT - q.m.rotation.y) * 7 - A.rv * 3.2) * dt; q.m.rotation.y += A.rv * dt;
          q.m.position.set(hx, bottom + CH / 2, hz);
          if (bottom <= floor + 0.01) {
            q.m.position.y = floor + CH / 2;
            if (overWall) { const vT = A.v; land(vT); if (A.cur) { A.v = 0; } else mark.visible = false; }
            else { // put down on the ground: back in the stock where it is
              A.drop = hangB - floor; q.m.rotation.y = 0; q.home = { x: hx, z: hz }; A.cur = null; A.phase = 'choose'; slings(false); C.rope.show(false); tag.show(false); X.line('הונחה על הקרקע · געו באבן'); X.play('thud'); camWork();
            }
          }
          if (A.cur) slings(true);
          // the kohen walks with it on the tagline, beside the wall, out of the camera's way
          // ── h115 ── the green place: where it will butt, the length of the hooked stone; bright when the stone is over it ── /h115 ──
          if (A.cur) { const w = wantOf(q, hz); if (w == null) mark.visible = false; else { mark.visible = true; mark.scale.z = q.L; mark.position.set(WALL_X, yB + 0.04, K.z0 + w + q.L / 2); const over = Math.abs(relZ(hz) - q.L / 2 - w) / q.L < 0.1 && Math.abs(hx - WALL_X) < 0.6 && Math.abs(rotErr(q.m.rotation.y)) <= TOLR; mark.material.opacity = over ? 0.85 : 0.38 + 0.12 * Math.sin(A.t * 5); mark.material.color.set(over ? '#7CFF9E' : '#3BD16F'); } }
          // ── h117 ── its own shadow under it (turned as it is) on whatever is below, and the plumb line from its middle down to it ── /h117 ──
          if (A.cur) {
            const fy = Math.abs(hx - WALL_X) < CD / 2 + 0.3 && relZ(hz) > -1 ? yB : X.ground(hx, hz);
            shG.visible = true; shG.position.set(hx, fy + 0.05, hz); shG.rotation.y = q.m.rotation.y; shM.scale.set(q.L, CD, 1);
            const Pp = plG.attributes.position; Pp.setXYZ(0, hx, q.m.position.y - CH / 2, hz); Pp.setXYZ(1, hx, fy + 0.06, hz); Pp.needsUpdate = true; plumb.visible = true;
          }
          // (high and wide while it crosses; nearer the gap from the same high side as it comes over the wall)
          const kc = ease(clamp((hx - (WALL_X - 9)) / 8, 0, 1)), cz = lerp(zc, hz, 0.6 * kc);
          X.track([lerp(CAMW.p[0], WALL_X - 9, kc), lerp(CAMW.p[1], yB + 26, kc), lerp(CAMW.p[2], cz + 1.5, kc)], [lerp(CAMW.t[0], WALL_X - 1.2, kc), lerp(CAMW.t[1], yB + 1, kc), lerp(CAMW.t[2], cz + 1.5, kc)], 1.4);   // (high enough that the jib's head stays in the frame)
        } else if (A.phase === 'settle' && A.settle) {
          const S2 = A.settle; S2.t += dt; const k = ease(Math.min(1, S2.t / S2.dur)), s = S2.q.m;
          s.position.set(lerp(S2.from.x, S2.to.x, k), yB + CH / 2, lerp(S2.from.z, S2.to.z, k)); s.rotation.y = lerp(S2.from.r, Math.PI / 2, k);
          if (S2.t > S2.dur + 0.3) { A.settle = null; afterSet(); if (A.phase === 'choose') camWork(); }
          try { X.hero.drive(0, 0); } catch (e) { /* */ }
        }
      },
      wants(p) { return (A.phase === 'carry' && !!gripOf(p)) || (A.phase === 'choose' && !!pick(p)); },   // ── h117 ── (the three grips; elsewhere the right thumb looks) ── /h117 ──
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: A.t };
        if (A.phase === 'carry') {
          A.grip = gripOf(p); A.rx = p.x; X.hand(null);
          if (A.grip) { X.play('rope'); A.said[A.grip] = true; }
          if (A.grip === 'jib') { C.tipWorld(tip); A.jg = { y: tip.y, g0: onPlane(X, p.x, p.y, tip.y), a0: { ...A.aimP } }; }
          if (A.grip === 'hold') A.hold = true;
        }
      },
      move(p) {
        if (A.phase !== 'carry' || !A.p0) return;
        if (A.grip === 'jib' && A.jg && A.jg.g0) { const g = onPlane(X, p.x, p.y, A.jg.y); if (g) { const x = A.jg.a0.x + (g.x - A.jg.g0.x), z = A.jg.a0.z + (g.z - A.jg.g0.z); if (Math.hypot(x - C.base.x, z - C.base.z) < 15) A.aimP = { x, z }; } }
        else if (A.grip === 'rope') { A.rotT += (p.x - A.rx) * 0.011; A.rx = p.x; }
      },
      up(p) {
        const P0 = A.p0; A.p0 = null; A.hold = false; A.grip = null; A.jg = null;
        if (A.phase === 'choose' && P0 && Math.hypot(p.x - P0.x, p.y - P0.y) < 14) { const q = pick(p); if (q) hookTo(q); }
      },
      cancel() { A.hold = false; A.p0 = null; A.grip = null; A.jg = null; },
      end() {
        for (const l of legs) l.dispose(); tag.dispose(); C.rope.show(false); for (const w of crewA.concat(A.crew)) SH.crew.remove(w); for (const t of A.marks) X.props.remove(t);
        X.props.remove(mark); if (A.arrow) X.props.remove(A.arrow);
        guide.dispose(); X.props.remove(stk); for (const m2 of rings) X.props.remove(m2); X.props.remove(shG); X.props.remove(plumb);   // ── h117 ── ── /h117 ──
        try { X.hero.drive(0, 0); } catch (e) { /* */ }
        for (const q of A.stock) { X.props.remove(q.tg); if (q.laid) { W0.out.push(q.m); if (q.crack) X.props.remove(q.crack); } else X.props.remove(q.m); }
      },
      at() { return { x: WALL_X, y: yB + 2, z: zc }; },
      dbg() {
        const sc = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const q = A.cur; let tgt = null;
        if (q) { // the bot's aim: where the solution puts this stone
          let z = K.gap[0]; for (const L of K.sol) { if (L === q.L) { tgt = sc(WALL_X, yB + CH / 2, K.z0 + z + L / 2); A.ta = z; break; } z += L; } }
        return { phase: A.phase, lv, sol: K.sol, gap: K.gap, below: K.below, set: A.set.map((s2) => [s2.a, s2.b, s2.q.L]), stock: A.stock.filter((s2) => !s2.laid).map((s2) => ({ L: s2.L, scr: sc(s2.m.position.x, s2.m.position.y + CH / 2, s2.m.position.z) })), cur: q ? q.L : 0, tgt, ta: q ? A.ta : null, gapB: q ? +(q.m.position.y - CH / 2 - yB).toFixed(2) : null, dz: q ? +(relZ(q.m.position.z) - q.L / 2).toFixed(2) : null, sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2), v: +A.v.toFixed(2), joj: A.joj, lifts: A.lifts, chips: A.chips, misses: A.misses | 0, mark: mark.visible, grades: A.grades.slice(), yB: +yB.toFixed(2), gS: +X.ground(gx, zc).toFixed(2),
          // ── h117 ── the grips on the screen, the turn's error (deg) and its tolerance, where the stone's middle is ── /h117 ──
          ...(() => { if (!q || A.phase !== 'carry') return {}; C.tipWorld(tip); const r2 = (o) => [Math.round(o.x), Math.round(o.y)], e2 = ropeEnd(), h = stkTop(), a = X.scr(h.x, h.y, h.z), b = X.scr(e2.x, e2.y, e2.z); const s = q.m.position;
            const m0 = jibMid.set(0, C.mastH + 0.9, 2.2 + C.jibL * 0.35); C.slew.localToWorld(m0); const ms = X.scr(m0.x, m0.y, m0.z), ts = X.scr(tip.x, tip.y, tip.z), inF = (q) => q.x > 20 && q.x < innerWidth - 20 && q.y > 110 && q.y < innerHeight - 70;
            return { jibScr: inF(ts) ? r2(ts) : r2({ x: ms.x + (ts.x - ms.x) * 0.45, y: ms.y + (ts.y - ms.y) * 0.45 }), tipScr: r2(ts), ropeScr: [Math.round(a.x * 0.65 + b.x * 0.35), Math.round(a.y * 0.65 + b.y * 0.35)], rotTE: +(rotErr(A.rotT) * 180 / Math.PI).toFixed(1), stoneScr: r2(X.scr(s.x, s.y, s.z)), rotE: +(rotErr(q.m.rotation.y) * 180 / Math.PI).toFixed(1), tol: +(TOLR * 180 / Math.PI).toFixed(1), sx: +s.x.toFixed(2), sz: +s.z.toFixed(2), wallX: WALL_X, aim: [+A.aimP.x.toFixed(2), +A.aimP.z.toFixed(2)], grip: A.grip }; })() };
      },
    };
  },
};

/* ───────── 3.7 the great stone "down the slope" (build 116; docs/specs/build116-brief.md §A) ─────────
 * ── h116 ── (ירון 10.11: "האבן הגדולה נראה לי החדש ולא שניהם מה שנראה לך הכי הארד פאן - בצע") the roller game is gone. The stone
 * lies on its rollers on the rock (BOOK.great: יט־6) and is let down west off the rock, then turned north along the west wall's top
 * into its course. Two rope crews hold it from behind: he holds the stone and pulls forward, they pay out rope (the further the pull,
 * the faster); a sideways pull and the lever men turn its nose; let go and they brake, and it stops slowly (weight). The fun is the
 * weight: it answers late, it gathers speed on the steep, and the bend must be slowed for BEFORE it. Over the safe speed the ropes
 * redden; held over it a rope snaps and it tips (−40); off the marked track a roller breaks (−20); into the wall too fast it is
 * chipped (−20). Untouched it stands still. The physics: h109/slope.js. (Illustration of the craft, not a source claim.) ── /h116 ── */
const GR = { x: BOOK.great.endX, zEnd: BOOK.great.endZ, len: 27, h: 3.4, d: 3.6 };
const GR_NEXT = [12, 10];   // the crews' stones beyond it in the same course (north of it)
const TRK = makeTrack(BOOK.great.track);
const ST_F = [0.43, 0.67, 0.89];   // (after the first bend, before the second, on the last straight)   // the three stations (rests) along the way
const ROLL_N = 5, ROLL_SP = GR.len / ROLL_N;
let greatMat = null;
function greatStoneMat(X) {
  // dressed limestone with the Herodian drafted margin: a pale band round each face and a slightly rougher, darker boss
  if (greatMat) return greatMat;
  const T = X.THREE, cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d');
  g.fillStyle = '#D9CBA8'; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 3800; i++) { const v = 150 + Math.random() * 70 | 0; g.fillStyle = `rgba(${v},${v - 12},${v - 34},${0.05 + Math.random() * 0.1})`; g.fillRect(Math.random() * 512, Math.random() * 256, 1 + Math.random() * 4, 1 + Math.random() * 4); }
  g.fillStyle = 'rgba(120,100,70,.18)'; g.fillRect(22, 22, 468, 212);   // (the boss)
  g.strokeStyle = 'rgba(90,72,48,.55)'; g.lineWidth = 3; g.strokeRect(22, 22, 468, 212);
  g.strokeStyle = 'rgba(250,240,220,.6)'; g.lineWidth = 2; g.strokeRect(10, 10, 492, 236);
  const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace || tex.colorSpace; tex.anisotropy = 4;
  greatMat = new T.MeshStandardMaterial({ map: tex, roughness: 0.92 }); return greatMat;
}
function greatMesh(X, L) { const T = X.THREE; const m = new T.Mesh(new T.BoxGeometry(GR.d, GR.h, L), greatStoneMat(X)); m.castShadow = true; m.receiveShadow = true; m.rotation.order = 'YXZ'; X.props.root.add(m); return m; }
/** the slope downhill along the track at s (+: down), from the ground 9 amot behind and before */
function slopeAt(X, s) { const a = TRK.at(s - 9), b = TRK.at(s + 9); return clamp((X.ground(a.x, a.z) - X.ground(b.x, b.z)) / 18, -0.8, 0.8); }
/** where the stone stands for a state: its middle, heading, height and pitch */
function poseOf(X, S, out = {}) {
  const p = TRK.at(S.s), x = p.x + p.nx * S.o, z = p.z + p.nz * S.o, yaw = p.yaw - S.a, fx = Math.sin(yaw), fz = Math.cos(yaw);
  const gF = X.ground(x + fx * 9, z + fz * 9), gB = X.ground(x - fx * 9, z - fz * 9), g0 = X.ground(x, z);
  out.x = x; out.z = z; out.yaw = yaw; out.fx = fx; out.fz = fz; out.nx = -fz; out.nz = fx; out.g = Math.max(g0, (gF + gB) / 2); out.pitch = Math.atan2(gB - gF, 18);
  out.y = out.g + 1.1 + GR.h / 2; return out;
}
function setStone(m, P, roll = 0, drop = 0) { m.position.set(P.x, P.y - drop, P.z); m.rotation.set(P.pitch, P.yaw, roll, 'YXZ'); }
/** the stone in its course at the end (on the wall's top, off its rollers) */
function seatPose(X) { const P = poseOf(X, restAt(TRK.L)); P.y = X.ground(GR.x, GR.zEnd) + GR.h / 2; P.pitch = 0; P.x = GR.x; P.z = GR.zEnd; return P; }
/** the marked way (for the act's level): two rows of white stones at its edges, a faint green line down its middle, the three
 *  stations as beams across, and the green stopping place before the wall */
function trackMarks(X, half, stations) {
  const T = X.THREE, out = [], g = (x, z) => X.ground(x, z);
  const edge = GR.d / 2 + half;
  { const n = Math.floor(TRK.L / 2.6), geo = new T.IcosahedronGeometry(0.32, 0), mat = new T.MeshStandardMaterial({ color: '#F2EEE2', roughness: 0.8 });
    const im = new T.InstancedMesh(geo, mat, n * 2), M4 = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(1, 0.7, 1), v = new T.Vector3(); let k = 0;
    for (let i = 0; i < n; i++) { const p = TRK.at(i * 2.6 + 1); for (const sd of [-1, 1]) { const x = p.x + p.nx * edge * sd, z = p.z + p.nz * edge * sd; v.set(x, g(x, z) + 0.12, z); M4.compose(v, q, sc); im.setMatrixAt(k++, M4); } }
    im.count = k; im.instanceMatrix.needsUpdate = true; im.receiveShadow = true; X.props.root.add(im); out.push(im); }
  const ribbon = (s0, s1, w, color, op, dy = 0.07) => {
    const pos = [], idx = []; let n = 0; const k = Math.max(2, Math.ceil((s1 - s0) / 1.5));
    for (let j = 0; j <= k; j++) { const p = TRK.at(s0 + (s1 - s0) * (j / k)); for (const sd of [-1, 1]) { const x = p.x + p.nx * w * sd, z = p.z + p.nz * w * sd; pos.push(x, g(x, z) + dy, z); } if (j) idx.push(n - 2, n - 1, n, n - 1, n + 1, n); n += 2; }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide })); m.renderOrder = 2; X.props.root.add(m); out.push(m); return m;
  };
  ribbon(0, TRK.L - 3, 0.22, '#59E07A', 0.45);
  const end = ribbon(TRK.L - 3 - GR.len / 2, TRK.L + GR.len / 2, GR.d / 2 + 0.9, '#3BD467', 0.32, 0.09);
  for (const s of stations) { const p = TRK.at(s), w = edge + 0.6, m = new T.Mesh(new T.BoxGeometry(w * 2, 0.35, 0.45), X.props.M.wood); m.position.set(p.x, g(p.x, p.z) + 0.18, p.z); m.rotation.y = p.yaw; m.receiveShadow = true; X.props.root.add(m); out.push(m); }
  return { out, end };
}
export const GREAT = {
  icon: '🪨', title: 'האבן הגדולה',
  walkLine: () => 'האבן הגדולה על הסלע: הורידו אותה אל החומה',
  stand(m, X) { const P = poseOf(X, restAt(0)); const x = P.x - P.fx * (GR.len / 2 + 5) + P.nx * 5, z = P.z - P.fz * (GR.len / 2 + 5) + P.nz * 5; return { x, z, face: [P.x, P.z] }; },
  prepare() {},
  make(m, X) {
    const lv = X.level(), li = lv - 1, T = X.THREE, S = SH.great, half = SL.half[li];
    const stations = ST_F.map((f) => f * TRK.L);
    const A = { S: restAt(0), phase: 'intro', t: 0, introT: 0, grab: null, pull: 0, side: 0, leg: { red: false, brush: false, loss: false }, grades: [], st: 0, losses: 0, strikes: 0, strain: 0, P: {}, roll: 0, said: {}, still: 0, scene: null, endT: 0, creak: 0 };
    const MK = trackMarks(X, half, stations);
    // the rollers under it (they move back under it at half its speed; the one freed behind is carried round to the front)
    const logG = new T.CylinderGeometry(0.55, 0.55, GR.d + 1.6, 10); logG.rotateZ(Math.PI / 2);
    const rollers = []; for (let i = 0; i < ROLL_N; i++) { const gp = new T.Group(), mm = new T.Mesh(logG, X.props.M.wood); mm.castShadow = true; gp.add(mm); X.props.root.add(gp); rollers.push({ g: gp, m: mm }); }
    // the two rope crews behind it, four on each rope; two lever men at its right side; two carriers with the next roller at its left
    const C = SH.crew, P0 = poseOf(X, A.S, A.P);
    const crews = []; for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) crews.push({ w: C.add(P0.x - P0.fx * (GR.len / 2 + 3 + i * 2.2), P0.z - P0.fz * (GR.len / 2 + 3 + i * 2.2), { role: 'pull', item: 'rope', fx: P0.x, fz: P0.z, crew: j, off: i * 0.07 }), j, i });
    const levers = [0, 1].map((i) => C.add(P0.x + P0.nx * 3.6, P0.z + P0.nz * 3.6, { role: 'lever', item: 'staff', fx: P0.x, fz: P0.z, crew: 2, off: i * 0.5 }));
    const carriers = [0, 1].map(() => C.add(P0.x - P0.nx * 4, P0.z - P0.nz * 4, { role: 'hold', item: 'log', crew: 3 }));
    const ropes = [0, 1].map(() => { const r = X.props.rope(16, 0.09); r.mesh.material = r.mesh.material.clone(); return r; });
    const ROPE_C = new T.Color('#C9A46A'), RED = new T.Color('#D2321E');
    const at = () => ({ x: A.P.x, y: A.P.y + GR.h, z: A.P.z });
    // the shots: behind and above it on the uphill side, down the way; the opening from the wall's slot up the way to it
    const behind = () => { const P = A.P, b = 36, u = 30, sd = -9; return { p: [P.x - P.fx * b + P.nx * sd, P.g + u + Math.max(0, P.pitch) * 14, P.z - P.fz * b + P.nz * sd], t: [P.x + P.fx * 12, P.g, P.z + P.fz * 12] }; };
    function crewFrame(dt) {
      const P = A.P, sp = Math.max(0.6, Math.abs(A.S.v) + 1.2);
      for (const c of crews) {
        if (!c.w) continue; const sd = c.j ? 1 : -1, back = GR.len / 2 + 3 + c.i * 2.2 - (A.rope === c.j ? -6 : 0);
        const x = P.x - P.fx * back + P.nx * sd * 1.4, z = P.z - P.fz * back + P.nz * sd * 1.4;
        c.w.a.path = [[x, z]]; c.w.a.pi = 0; c.w.a.speed = sp; c.w.fx = P.x; c.w.fz = P.z; c.w.lean = A.rope === c.j ? 0.5 : -0.3 * clamp(A.strain, 0, 1.2);
      }
      levers.forEach((w, i) => { if (!w) return; const x = P.x + P.nx * (GR.d / 2 + 1.7) + P.fx * (i ? 6 : -6), z = P.z + P.nz * (GR.d / 2 + 1.7) + P.fz * (i ? 6 : -6); w.a.path = [[x, z]]; w.a.pi = 0; w.a.speed = sp; w.fx = P.x + P.fx * (i ? 6 : -6); w.fz = P.z + P.fz * (i ? 6 : -6); });
      carriers.forEach((w, i) => { if (!w) return; const x = P.x - P.nx * (GR.d / 2 + 2.4) + P.fx * (i ? 1.2 : -1.2), z = P.z - P.nz * (GR.d / 2 + 2.4) + P.fz * (i ? 1.2 : -1.2); w.a.path = [[x, z]]; w.a.pi = 0; w.a.speed = sp; });
      // the ropes from its back corners to the last man of each crew; they redden with the strain
      const k = clamp((A.strain - SL.red) / (1 - SL.red), 0, 1);
      ropes.forEach((r, j) => {
        if (A.rope === j) { r.mesh.visible = false; return; } r.mesh.visible = true;
        const sd = j ? 1 : -1, ax = P.x - P.fx * (GR.len / 2) + P.nx * sd * 1.2, az = P.z - P.fz * (GR.len / 2) + P.nz * sd * 1.2;
        const w = crews[j * 4 + 3].w.a; r.set({ x: ax, y: P.y + 0.6, z: az }, { x: w.x, y: X.ground(w.x, w.z) + 1.5, z: w.z }, 0.25 * (1 - clamp(A.strain, 0, 1)));
        r.mesh.material.color.copy(ROPE_C).lerp(RED, k);
      });
      if (k > 0.6) { A.dustT = (A.dustT || 0) - dt; if (A.dustT <= 0) { A.dustT = 0.35; const w = crews[(Math.random() * 8) | 0].w.a; X.dust(w.x, X.ground(w.x, w.z) + 0.2, w.z, 3, 1.4); } }
      A.creak -= dt; if (k > 0.3 && A.creak <= 0) { A.creak = 0.9 - 0.5 * k; X.play('wood'); }
    }
    function rollerFrame(dt) {
      const P = A.P; A.roll += A.S.v * 0.5 * dt;
      rollers.forEach((r, i) => {
        let u = ((i * ROLL_SP - A.roll) % GR.len + GR.len) % GR.len - GR.len / 2;   // (along the stone, from its back −len/2 to its front)
        const x = P.x + P.fx * u, z = P.z + P.fz * u; r.g.position.set(x, X.ground(x, z) + 0.55, z); r.g.rotation.y = P.yaw; r.m.rotation.x = A.roll * 1.8;
        r.g.visible = A.phase !== 'seat' || A.endT < 0.3 + i * 0.15;
      });
    }
    function draw() { poseOf(X, A.S, A.P); setStone(S, A.P); }
    function grade(kind) { const g = A.leg.loss ? 'ok' : A.leg.red || A.leg.brush ? 'good' : 'gold'; A.grades.push(g); A.leg = { red: false, brush: false, loss: false }; return g; }
    function scene(kind, dur, o2 = {}) { A.phase = 'scene'; A.scene = { kind, t: 0, dur, ...o2 }; A.grab = null; A.pull = 0; A.side = 0; }
    function lossAt(n, label, word) { A.losses++; A.leg.loss = true; X.loss(n, at(), label); X.word(at(), word); }
    function seat() {
      A.phase = 'seat'; A.endT = 0; A.grab = null; A.from = { ...A.P }; A.to = seatPose(X);
      X.play('grind'); X.line('הצוות שומט את הגלילים · האבן יורדת למקומה');
    }
    function arrive() {
      const P = A.to, top = { x: P.x, y: P.y + GR.h / 2 + 1.5, z: P.z };
      X.play('settle'); X.shake(0.45, 0.8); X.dust(P.x, P.y - GR.h / 2 + 0.3, P.z, 30, 8); X.dust(P.x, P.y - GR.h / 2 + 0.3, P.z - GR.len / 2, 20, 5);
      SH.greatDone = true;
      const endG = A.strikes ? 'ok' : (Math.abs(A.S.a) < 0.035 && Math.abs(A.S.o) < 0.5 ? 'gold' : 'good'); A.grades.push(endG);
      const q = (A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length) * Math.pow(0.85, A.losses);
      A.res = { q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, perfect: A.grades.every((g) => g === 'gold') && !A.losses && !A.strikes, at: top };
      X.hit(top, endG, { text: '', craft: 'בונים' });
      X.bonus(300, 'great', 'האבן הגדולה במקומה');
      if (A.res.perfect) X.perfect('בול! האבן הגדולה בחומה', top);
      X.line('האבן הגדולה בכותל המערבי: כ־13.6 מטר (מנהרות הכותל)');
    }
    function grabAt(p) { const P = A.P, g = onPlane(X, p.x, p.y, P.g + 1.5); if (!g) return null; const dx = g.x - P.x, dz = g.z - P.z, f = dx * P.fx + dz * P.fz, n = dx * P.nx + dz * P.nz; return Math.abs(f) < GR.len / 2 + 4 && Math.abs(n) < GR.d / 2 + 4 ? { f, n } : null; }
    return {
      begin() {
        X.kohen(false);
        draw(); rollerFrame(0);
        const E = seatPose(X), Q = TRK.at(TRK.L - 30);
        X.shot([Q.x + 26, E.y + 22, Q.z + 30], [E.x, E.y, E.z - 4], 0.6);
        X.line('האבן יורדת מהסלע אל החומה');
      },
      update(dt) {
        A.t += dt; const S0 = A.S;
        if (A.phase === 'intro') {
          A.introT += dt;
          if (A.introT > 1.3 && !A.introGo) { A.introGo = true; const b = behind(); X.shot(b.p, b.t, 2.6); }
          if (A.introT > 4.1) { A.phase = 'move'; X.line('משכו את האבן במורד · שחררו לבלום'); X.hand({ x: A.P.x + A.P.fx * 4, y: A.P.y + GR.h / 2, z: A.P.z + A.P.fz * 4 }, 0, -70); }
          crewFrame(dt); rollerFrame(0); return;
        }
        if (A.phase === 'scene') {
          const Sc = A.scene; Sc.t += dt; const k = clamp(Sc.t / Sc.dur, 0, 1);
          if (Sc.kind === 'run') {
            // the rope gone: it runs on by itself, faster, and tips at the end of it
            S0.v += (1.8 + Math.max(0, SL.g * slopeAt(X, S0.s))) * dt; S0.s += S0.v * dt; S0.o += S0.v * Math.sin(S0.a) * dt; draw(); rollerFrame(dt);
            if (Sc.t >= Sc.dur) {
              const P = A.P; X.play('settle'); X.play('crack'); X.shake(0.6, 1.0); X.dust(P.x, P.g + 0.4, P.z, 34, 8); X.dust(P.x + P.nx * 3, P.g + 0.4, P.z + P.nz * 3, 20, 6);
              lossAt(40, 'האבן התהפכה', 'התהפכה: האטו לפני הפיתול'); S0.v = 0;
              scene('tip', 1.0, { from: { ...A.P } });
            }
          } else if (Sc.kind === 'tip') {
            setStone(S, Sc.from, ease(k) * (Math.PI / 2) * (S0.o >= 0 ? -1 : 1), ease(k) * (1.1 + (GR.h - GR.d) / 2));
            if (Sc.t >= Sc.dur + 1.4) { X.line('הצוות מעמיד את האבן בתחנה האחרונה'); const back = A.st ? stations[A.st - 1] : 0; scene('right', 2.4, { from: { ...Sc.from }, to: poseOf(X, restAt(back)), back }); }
          } else if (Sc.kind === 'right') {
            const a = Sc.from, b = Sc.to, e = ease(k), P = { x: lerp(a.x, b.x, e), y: lerp(a.y - 1.1, b.y, e), z: lerp(a.z, b.z, e), yaw: lerp(a.yaw, b.yaw, e), pitch: lerp(a.pitch, b.pitch, e) };
            setStone(S, P, (1 - e) * (Math.PI / 2) * (S0.o >= 0 ? -1 : 1)); A.P.x = P.x; A.P.z = P.z;
            if (k >= 1) { A.S = restAt(Sc.back); A.rope = null; draw(); A.phase = 'move'; X.line('משכו את האבן במורד · שחררו לבלום'); }
          } else if (Sc.kind === 'lever') {
            // off the track: the lever men bring it back to the way's middle where it left
            S0.o = lerp(Sc.o0, 0, ease(k)); S0.a = lerp(Sc.a0, 0, ease(k)); draw();
            if (k >= 1) { A.phase = 'move'; X.line('משכו את האבן במורד · שחררו לבלום'); }
          } else if (Sc.kind === 'pullback') {
            S0.s = lerp(Sc.s0, Sc.s1, ease(k)); draw(); A.roll -= dt * 1.2; rollerFrame(0);
            if (k >= 1) { A.phase = 'move'; X.line('לאט אל המלבן הירוק'); }
          }
          crewFrame(dt);
          if (A.phase === 'move') { const b = behind(); X.track(b.p, b.t, 1.0); }
          return;
        }
        if (A.phase === 'seat') {
          A.endT += dt; const k = ease(clamp((A.endT - 0.4) / 1.6, 0, 1)), a = A.from, b = A.to;
          setStone(S, { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), z: lerp(a.z, b.z, k), yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, 0, k) });
          rollerFrame(0); crewFrame(dt);
          if (k >= 1 && !A.arrived) { A.arrived = true; arrive(); X.shot([b.x + 34, b.y + 20, b.z + 8], [b.x - 2, b.y, b.z - 4], 1.6); }
          if (A.arrived) { A.doneT = (A.doneT || 0) + dt; if (A.doneT > 3.2 && !A.ended) { A.ended = true; X.end(A.res); } }
          return;
        }
        // ── move ──
        const sin = slopeAt(X, S0.s), p = TRK.at(S0.s), lim = limitAt(TRK, S0.s, lv);
        const ev = stepStone(S0, { pull: A.grab ? A.pull : 0, side: A.grab ? A.side : 0 }, { sin, k: p.k, lim, lv }, dt);
        A.strain = ev.strain;
        if (ev.strain > 0.92) A.leg.red = true;
        if (Math.abs(S0.o) > half * SL.edge) { if (!A.leg.brush) { X.play('grind'); X.dust(A.P.x, A.P.g + 0.3, A.P.z, 6, 2.5); } A.leg.brush = true; }
        draw(); rollerFrame(dt); crewFrame(dt);
        if (ev.snap) {
          X.play('crack'); A.rope = Math.random() < 0.5 ? 0 : 1; X.word(at(), 'החבל נקרע!');
          scene('run', 1.3); return;
        }
        if (Math.abs(S0.o) > half) {
          X.play('crack'); X.sparks(A.P.x, A.P.g + 0.6, A.P.z, 14); X.dust(A.P.x, A.P.g + 0.4, A.P.z, 18, 4);
          lossAt(20, 'גליל נשבר', 'יצאה מהמסילה'); S0.v = 0;
          X.line('אנשי המנופים מחזירים אותה למסילה');
          scene('lever', 2.2, { o0: S0.o, a0: S0.a }); return;
        }
        // the stations
        while (A.st < stations.length && S0.s >= stations[A.st]) {
          const g = grade(); const q = TRK.at(stations[A.st]); X.hit({ x: q.x, y: X.ground(q.x, q.z) + GR.h + 2, z: q.z }, g, { text: '', craft: 'מורידים' });
          A.st++; X.count({ x: A.P.x, y: A.P.y + GR.h + 2, z: A.P.z }, `${A.st}/${stations.length}`);
        }
        // the lines: the bend ahead (once), the end
        if (!A.said.bend && TRK.bend(S0.s + 14) && !TRK.bend(S0.s)) { A.said.bend = true; X.line('פיתול: האטו לפני'); }
        if (!A.said.end && S0.s > TRK.L - 24) { A.said.end = true; X.line('לאט אל המלבן הירוק'); }
        // the wall: its crews' stone stands at the end of the way
        if (S0.s >= TRK.L) {
          if (S0.v > SL.strike) {
            X.play('crack'); X.shake(0.4, 0.6); X.sparks(A.P.x + A.P.fx * GR.len / 2, A.P.y, A.P.z + A.P.fz * GR.len / 2, 20);
            A.strikes++; lossAt(20, 'פינה נשברה', 'מהר מדי אל הקיר'); S0.v = 0;
            X.line('הצוות מושך אותה אחורה'); scene('pullback', 1.8, { s0: TRK.L, s1: TRK.L - 6 }); return;
          }
          S0.s = TRK.L; S0.v = Math.min(0, S0.v);
        }
        // standing still in the green place: straight and in the middle, it goes in; crooked, he is told
        if (!A.grab && Math.abs(S0.v) < 0.04 && S0.s >= TRK.L - 3) {
          A.still += dt;
          if (A.still > 0.5) {
            const tolO = [1.2, 1.0, 0.8][li];
            if (Math.abs(S0.a) < 0.07 && Math.abs(S0.o) < tolO) { seat(); return; }
            if (!A.said.crook) { A.said.crook = true; X.line(Math.abs(S0.a) >= 0.07 ? 'ישרו את האבן: משכו הצידה' : 'לא באמצע: משכו אחורה מעט ושוב'); }
          }
        } else A.still = 0;
        const b = behind(); X.track(b.p, b.t, 1.0);
      },
      // (build 125: the opening's tap and the move's grab are the stone's and its ropes' on the right half — the rest is the look)
      wants(p) { if (A.phase !== 'intro' && A.phase !== 'move') return false; if (!p) return true; const P = A.P; const on = nearPts(X, p, [{ x: P.x, y: P.y + GR.h / 2, z: P.z }], bigR()); return A.phase === 'intro' ? on : on && !!grabAt(p); },
      down(p) {
        if (A.phase === 'intro') { A.introT = Math.max(A.introT, 3.6); if (!A.introGo) { A.introGo = true; const b = behind(); X.shot(b.p, b.t, 0.5); } return; }
        if (A.phase !== 'move') return; const g = grabAt(p); if (!g) return;
        A.grab = g; A.pull = 0; A.side = 0; A.said.crook = false; X.hand(null);
      },
      move(p) {
        if (!A.grab) return; const P = A.P, g = onPlane(X, p.x, p.y, P.g + 1.5); if (!g) return;
        const gx = P.x + P.fx * A.grab.f + P.nx * A.grab.n, gz = P.z + P.fz * A.grab.f + P.nz * A.grab.n, dx = g.x - gx, dz = g.z - gz;
        A.pull = clamp((dx * P.fx + dz * P.fz) / 14, -1, 1); A.side = clamp((dx * P.nx + dz * P.nz) / 6, -1, 1);
      },
      up() { A.grab = null; A.pull = 0; A.side = 0; },
      cancel() { A.grab = null; A.pull = 0; A.side = 0; },
      end() {
        const E = seatPose(X); setStone(S, E);
        for (const r of rollers) X.props.remove(r.g); for (const c of crews) C.remove(c.w); for (const w of levers) C.remove(w); for (const w of carriers) C.remove(w);
        for (const r of ropes) r.dispose(); for (const o of MK.out) X.props.remove(o); X.count(null);
      },
      at() { return at(); },
      dbg() {
        const P = A.P, sc = (x, y, z) => { const q = X.scr(x, y, z); return [Math.round(q.x), Math.round(q.y)]; };
        const ahead = (d) => { const q = TRK.at(A.S.s + d); return [q.x - P.x, q.z - P.z]; };
        return { phase: A.phase, s: +A.S.s.toFixed(2), L: +TRK.L.toFixed(1), o: +A.S.o.toFixed(2), a: +A.S.a.toFixed(3), v: +A.S.v.toFixed(2), lim: limitAt(TRK, A.S.s, lv), bendAhead: [8, 14, 20].map((d) => TRK.bend(A.S.s + d)), strain: +A.strain.toFixed(2), st: A.st, stations: stations.map((s) => +s.toFixed(1)), grades: A.grades.slice(), losses: A.losses, strikes: A.strikes, half, lv, grab: !!A.grab, pull: +A.pull.toFixed(2), side: +A.side.toFixed(2),
          stone: sc(P.x, P.y + GR.h / 2, P.z), fwd: sc(P.x + P.fx * 10, P.y + GR.h / 2, P.z + P.fz * 10), right: sc(P.x + P.nx * 5, P.y + GR.h / 2, P.z + P.nz * 5), k: +TRK.at(A.S.s).k.toFixed(4), ahead: ahead(10) };
      },
    };
  },
};

/* ───────── 3.8 "לבית התקיעה": the trumpeting place on the south-west corner ─────────
 * ── h114 ── rebuilt (ירון 9.11: "אין פה משחק"; his article and two pictures). The place as in his picture: on the top of the
 * Mount's south-west corner a parapet with its sloped coping, a niche at the very corner where the trumpeter stands (blue turban,
 * light-blue robe, a long straight golden trumpet — illustration after the picture), the inscription on the parapet's inner face
 * beside him. Three parts: (1) the inscription stone comes up to its place; (2) "לבית התקיעה להכ" carved stroke by stroke with
 * the chisel, in the letters of the stone that was found (B. Mazar's excavation, 1968; the last word is broken: להכריז / להבדיל);
 * (3) the six blasts of the Sabbath eve (שבת לה ע"ב; תוספתא סוכה ד; יוסף בן מתתיהו, מלחמות ד, ט, יב): aim the trumpet with a
 * drag, hold to blow and let go in the band; the sound goes out over the land and changes it — the field hands lay down their
 * tools, the shops close, the lamps are lit in the windows; a pause "כדי צליית דג קטן"; then תקיעה, תרועה, תקיעה. A weak or
 * misaimed blast does not reach everyone: who did not hear stays as he was, and one blows again (no damage, no points off). ── /h114 ── */
const LET = { x: -300, z: 400 };   // the corner's outer point: the west wall x −300, the south wall z +400
const TOP = { y0: 31.6, y: 38.2 };  // the world's wall top there ≈ 32–38 (its merlons): the corner block stands to 38.2
const GLYPH = {
  'ל': [[[22, -12], [22, 44], [80, 44], [82, 92], [48, 136]]],
  'ב': [[[10, 30], [80, 30], [88, 42], [88, 126], [6, 126]]],
  'י': [[[38, 30], [64, 30], [64, 72]]],
  'ת': [[[8, 30], [84, 30], [90, 42], [90, 132]], [[26, 30], [26, 132], [12, 134]]],
  'ה': [[[8, 30], [88, 30], [90, 132]], [[22, 70], [22, 132]]],
  'ק': [[[8, 30], [88, 30], [90, 100]], [[20, 70], [20, 170]]],
  'ע': [[[14, 30], [62, 106]], [[86, 30], [82, 96], [52, 126], [6, 130]]],
  'כ': [[[10, 30], [72, 30], [88, 48], [88, 110], [72, 126], [10, 126]]],
};
const WORDS = ['לבית', 'התקיעה', 'להכ'];
const TRUMP = { x: -298.4, z: 398.4 };
function letStand() { return { x: -281, z: 383 }; }
let cornerT = null;
/** the corner block, its parapet and niche (once, in the world for good) → { face, stone, blocks } */
function trumpetCorner(X) {
  if (cornerT) return cornerT;
  const T = X.THREE, g = new T.Group(); g.name = 'h114-trumpet-corner'; X.props.root.add(g);
  const mat = new T.MeshStandardMaterial({ color: '#E2D2AC', roughness: 0.93 }), dark = new T.MeshStandardMaterial({ color: '#CDBC95', roughness: 0.95 });
  const box = (x0, x1, y0, y1, z0, z1, m = mat) => { const b = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); b.castShadow = true; b.receiveShadow = true; g.add(b); return b; };
  // the corner block, flush with both faces of the world's walls
  box(-300.05, -289, TOP.y0, TOP.y, 389, 400.05);
  // the parapet: ashlar blocks along the west edge, the inscription stone and a filler along the south edge; the niche at the corner
  for (let z = 389; z < 396.9; z += 2.65) { const b = stoneMesh(X, 1.2, 2.4, 2.6); b.position.set(-299.45, TOP.y + 1.2, z + 1.3); g.attach(b); }
  const stone = stoneMesh(X, 7.2, 2.4, 1.2); stone.position.set(-293.2, TOP.y + 1.2, 399.45); g.attach(stone);
  const fill = stoneMesh(X, 0.75, 2.4, 1.2); fill.position.set(-289.4, TOP.y + 1.2, 399.45); g.attach(fill);
  // the niche: the parapet cut down to a low lip at the very corner
  box(-300.05, -296.9, TOP.y, TOP.y + 0.9, 399.6, 400.05, dark); box(-300.05, -299.6, TOP.y, TOP.y + 0.9, 396.9, 400.05, dark);
  // the sloped coping on the outer faces, under the parapet's top (as in the picture)
  for (const [x, z, L, ry] of [[-294.6, 400.15, 11.4, 0], [-300.15, 394.6, 11.4, Math.PI / 2]]) { const c = new T.Mesh(new T.BoxGeometry(L, 0.75, 0.75), dark); c.position.set(x, TOP.y - 0.15, z); c.rotation.set(Math.PI / 4, ry, 0, 'YXZ'); c.castShadow = true; g.add(c); }
  // the inscription's face: on the parapet's inner face (toward the Mount), beside the niche
  const cw = 2048, ch = 640, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
  const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace || tex.colorSpace; tex.anisotropy = 4;
  const FW = 7.0, FH = FW * ch / cw;
  const face = new T.Mesh(new T.PlaneGeometry(FW, FH), new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.9 }));
  face.rotation.y = Math.PI; face.position.set(-293.2, TOP.y + 1.25, 398.83); g.add(face);
  cornerT = { g, face, stone, cv, tex, cw, ch, FW, FH, carved: null };
  return cornerT;
}
export const LETTERS = {
  icon: '📯', title: 'לבית התקיעה',
  walkLine: () => 'הפינה הדרומית-מערבית: בית התקיעה',
  stand(m, X) { const p = letStand(); return { x: p.x, z: p.z, face: [LET.x, LET.z] }; },
  prepare() {},
  make(m, X) {
    const lv = X.level(), T = X.THREE, K = trumpetCorner(X);
    const { cv, tex, cw, ch, FW, FH, face } = K, cx = cv.getContext('2d');
    // the stone's face: dressed limestone, a drafted margin; what is carved is kept in its own canvas
    const base = document.createElement('canvas'); base.width = cw; base.height = ch; const bx = base.getContext('2d');
    bx.fillStyle = '#D6C6A2'; bx.fillRect(0, 0, cw, ch); for (let i = 0; i < 2600; i++) { bx.fillStyle = `rgba(${90 + Math.random() * 60},${80 + Math.random() * 50},${60 + Math.random() * 40},${Math.random() * 0.08})`; bx.fillRect(Math.random() * cw, Math.random() * ch, 2 + Math.random() * 6, 2 + Math.random() * 6); }
    bx.strokeStyle = 'rgba(80,64,40,.35)'; bx.lineWidth = 10; bx.strokeRect(36, 36, cw - 72, ch - 72);
    const carved = document.createElement('canvas'); carved.width = cw; carved.height = ch; const kx = carved.getContext('2d'); K.carved = carved;
    // the layout: right to left, the words apart; each letter's strike points along its strokes (a chisel blow every ~34 units)
    const S = 1.15, top = 230; const L = []; let x = cw - 120;
    WORDS.forEach((w, wi) => { for (const c of w) { L.push({ ch: c, w: wi, x0: x - 100 * S, done: false, grade: null, pts: [], k: 0, dev: [] }); x -= 116 * S; } x -= 70 * S; });
    const toC = (p, Lt) => [Lt.x0 + p[0] * S, top + p[1] * S];
    for (const Lt of L) for (const st of GLYPH[Lt.ch]) { let first = true; for (let i = 0; i < st.length - 1; i++) { const a = st[i], b = st[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 34)); for (let k = first ? 0 : 1; k <= n; k++) Lt.pts.push({ c: toC([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)], Lt), start: first && k === 0 }); first = false; } }
    const A = { part: 1, t: 0, i: 0, flash: 0, flashI: -1, slips: 0, blast: 0, aim: -0.6, hold: false, breath: 0, p0: null, waves: [], heard: [], grades: [], tries: 0, terua: null, done: false, fish: 0 };
    const tUp = (p) => face.localToWorld(new T.Vector3((p[0] / cw - 0.5) * FW, (0.5 - p[1] / ch) * FH, 0.08));
    function draw() {
      cx.drawImage(base, 0, 0);
      // the letter being carved: its strokes dotted faintly, the next blow's place glowing
      const Lt = L[A.i];
      if (A.part === 2 && Lt) {
        cx.save(); cx.setLineDash([3, 16]); cx.lineCap = 'round'; cx.lineWidth = 6; cx.strokeStyle = lv >= 3 ? 'rgba(90,60,30,.18)' : 'rgba(90,60,30,.45)';
        for (const st of GLYPH[Lt.ch]) { cx.beginPath(); st.forEach((p, k) => { const c = toC(p, Lt); k ? cx.lineTo(c[0], c[1]) : cx.moveTo(c[0], c[1]); }); cx.stroke(); } cx.restore();
        const q = Lt.pts[Lt.k]; if (q) { const r = 22 + 6 * Math.sin(A.t * 8); cx.save(); cx.strokeStyle = 'rgba(255,190,40,.95)'; cx.lineWidth = 7; cx.beginPath(); cx.arc(q.c[0], q.c[1], r, 0, TAU); cx.stroke(); cx.restore(); }
      }
      cx.drawImage(carved, 0, 0);
      if (A.flash > 0 && L[A.flashI]) { const F = L[A.flashI]; cx.save(); cx.globalAlpha = Math.min(1, A.flash); cx.lineWidth = 24; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#FFD66E'; cx.shadowColor = '#FFB020'; cx.shadowBlur = 30; for (const st of GLYPH[F.ch]) { cx.beginPath(); st.forEach((p, k) => { const c = toC(p, F); k ? cx.lineTo(c[0], c[1]) : cx.moveTo(c[0], c[1]); }); cx.stroke(); } cx.restore(); }
      tex.needsUpdate = true;
    }
    function groove(a, b, w = 16) { kx.save(); kx.lineCap = 'round'; kx.lineJoin = 'round'; kx.strokeStyle = 'rgba(58,40,22,.92)'; kx.lineWidth = w; kx.beginPath(); kx.moveTo(a[0], a[1]); kx.lineTo(b[0], b[1]); kx.stroke(); kx.strokeStyle = 'rgba(255,240,210,.35)'; kx.lineWidth = 4; kx.beginPath(); kx.moveTo(a[0] + 5, a[1] + 6); kx.lineTo(b[0] + 5, b[1] + 6); kx.stroke(); kx.restore(); }
    function canvasAt(p) { const hits = X.rayAt(p.x, p.y).intersectObject(face, false); if (!hits.length || !hits[0].uv) return null; const u = hits[0].uv; return [u.x * cw, (1 - u.y) * ch]; }
    function pxScale() { const a = face.localToWorld(new T.Vector3(-FW / 2, 0, 0)), b = face.localToWorld(new T.Vector3(FW / 2, 0, 0)); const qa = X.scr(a.x, a.y, a.z), qb = X.scr(b.x, b.y, b.z); return Math.hypot(qb.x - qa.x, qb.y - qa.y) / cw; }
    function shotFace() {
      // the word being carved fills the frame (the camera inside the Mount, before the parapet's inner face)
      const Lt = L[A.i] || L[L.length - 1], ws = L.filter((q) => q.w === Lt.w), xa = ws[0].x0 + 100 * S, xb = ws[ws.length - 1].x0;
      const c = tUp([(xa + xb) / 2, top + 70 * S]), n = new T.Vector3(0, 0, -1);
      const wid = Math.max(2.4, (xa - xb) / cw * FW), hf = 2 * Math.atan(Math.tan((X.camera.fov * Math.PI / 180) / 2) * X.camera.aspect), d = (wid / 0.7) / (2 * Math.tan(hf / 2));
      X.shot([c.x + n.x * d, c.y + d * 0.22, c.z + n.z * d], [c.x, c.y, c.z], 1.0);
    }
    // ── the trumpeter (illustration after ירון's picture): blue turban, light-blue robe, the long golden trumpet ──
    const tr = SH.crew.add(TRUMP.x, TRUMP.z, { role: 'hold', item: 'trumpet', tunic: '#9CCBEA', col2: '#2C5AA6', fx: TRUMP.x - 10, fz: TRUMP.z + 10, crew: 0 });
    if (tr && tr.a) { tr.a.fixedY = TOP.y; tr.a.y = TOP.y; }
    const TP = { x: TRUMP.x, y: TOP.y, z: TRUMP.z };
    // ── part 3's world: the field hands, the market's stalls, the houses' windows, out over the city below ──
    const az0 = (a) => ({ x: TP.x + Math.sin(a) * 1, z: TP.z + Math.cos(a) * 1 });
    const deg = Math.PI / 180;
    const TGT = [
      { name: 'השדות', line: 'תקיעה ראשונה: לעובדים בשדות', az: -18 * deg, d: 95, items: [] },
      { name: 'החנויות', line: 'תקיעה שנייה: לחנויות בעיר', az: -46 * deg, d: 68, items: [] },
      { name: 'הבתים', line: 'תקיעה שלישית: להדליק את הנרות', az: -74 * deg, d: 86, items: [] },
    ];
    const wood = X.props.M.wood, cloths = ['#B5482F', '#2F6E9B', '#C9962B'];
    function at(a, d) { const x = TP.x + Math.sin(a) * d, z = TP.z + Math.cos(a) * d; return { x, z, y: X.ground(x, z) }; }
    const world = new T.Group(); world.name = 'h114-shabbat-eve'; X.props.root.add(world);
    TGT.forEach((G, gi) => {
      for (let k = -1; k <= 1; k++) {
        const a = G.az + k * 6.5 * deg, d = G.d + (k === 0 ? 0 : 6) * (gi === 1 ? -1 : 1), P = at(a, d), it = { a, d, P, heard: false, t: 0 };
        if (gi === 0) {
          // a strip of ploughed field and a hand at work in it with his hoe
          const f = new T.Mesh(new T.PlaneGeometry(9, 6), new T.MeshStandardMaterial({ color: '#7C6A3E', roughness: 1 })); f.rotation.x = -Math.PI / 2; f.position.set(P.x, P.y + 0.12, P.z); world.add(f);
          it.w = SH.crew.add(P.x, P.z, { role: 'pick', item: 'pick', fx: P.x + 2, fz: P.z + 1, crew: k + 1, dust: false });
        } else if (gi === 1) {
          // a stall: its counter, two posts and a cloth awning (it folds down when he has heard)
          const st = new T.Group(); st.position.set(P.x, P.y, P.z); st.rotation.y = a + Math.PI; world.add(st);
          const cnt = new T.Mesh(new T.BoxGeometry(4.4, 1.6, 1.6), wood); cnt.position.set(0, 0.8, 0); st.add(cnt);
          for (const sx of [-2, 2]) { const po = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 3.6, 5), wood); po.position.set(sx, 1.8, 0.7); st.add(po); }
          const aw = new T.Mesh(new T.BoxGeometry(4.8, 0.08, 2.4), new T.MeshStandardMaterial({ color: cloths[k + 1], roughness: 0.9 })); aw.geometry.translate(0, 0, -1.2); aw.position.set(0, 3.5, 0.8); aw.rotation.x = -0.35; st.add(aw);
          const sh = new T.Mesh(new T.BoxGeometry(4.4, 1.7, 0.12), new T.MeshStandardMaterial({ color: '#6B4A2A', roughness: 1 })); sh.position.set(0, 0.85, -0.86); sh.scale.y = 0.01; st.add(sh);
          for (let j = 0; j < 4; j++) { const gd = new T.Mesh(new T.SphereGeometry(0.26, 6, 4), new T.MeshStandardMaterial({ color: ['#C8432B', '#E3B23C', '#6C8E3A', '#8B4A8B'][j], roughness: 0.8 })); gd.position.set(-1.5 + j, 1.8, 0); st.add(gd); }
          it.aw = aw; it.sh = sh; it.w = SH.crew.add(P.x + Math.sin(a + Math.PI) * 1.6, P.z + Math.cos(a + Math.PI) * 1.6, { role: 'hold', fx: P.x, fz: P.z, crew: 2 });
        } else {
          // a house with two windows: dark until the lamp is lit
          const h = new T.Group(); h.position.set(P.x, P.y, P.z); h.rotation.y = a + Math.PI; world.add(h);
          const bd = new T.Mesh(new T.BoxGeometry(5.5, 4.6, 5), new T.MeshStandardMaterial({ color: '#D9C7A0', roughness: 1 })); bd.position.y = 2.3; h.add(bd);
          it.win = []; for (const wx of [-1.4, 1.4]) { const wm = new T.Mesh(new T.PlaneGeometry(0.9, 1.1), new T.MeshStandardMaterial({ color: '#2B2116', emissive: '#FFB347', emissiveIntensity: 0 })); wm.position.set(wx, 2.8, -2.52); wm.rotation.y = Math.PI; h.add(wm); it.win.push(wm); }
        }
        G.items.push(it);
      }
    });
    // the aim: a faint golden fan from the corner out over the land (how far and how wide the blast will go)
    const hw = [16, 12, 9][lv - 1] * deg, wind = lv >= 3 ? 7 * deg : 0;
    const fan = new T.Mesh(new T.CircleGeometry(1, 24, -hw, hw * 2), new T.MeshBasicMaterial({ color: '#FFD36A', transparent: true, opacity: 0.2, depthWrite: false, depthTest: false, side: T.DoubleSide }));
    fan.rotation.x = -Math.PI / 2; fan.renderOrder = 4; fan.visible = false; world.add(fan);
    const flag = new T.Mesh(new T.PlaneGeometry(0.9, 0.45), new T.MeshStandardMaterial({ color: '#D9483B', side: T.DoubleSide })); flag.visible = wind > 0; world.add(flag);
    const pole = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 3, 5), wood); pole.position.set(-299.75, TOP.y + 1.5, 396.3); pole.visible = wind > 0; world.add(pole);
    // the breath: a bar with its band (let go inside it), on the screen under the trumpeter
    const ui = document.createElement('div'); ui.className = 'h109-ui h114-breath';
    ui.innerHTML = '<i class="b"></i><i class="f"></i><span></span>'; document.body.appendChild(ui);
    const css = document.createElement('style'); css.textContent = '.h114-breath{position:fixed;left:50%;bottom:92px;transform:translateX(-50%);width:min(64vw,420px);height:22px;border-radius:12px;background:rgba(40,28,12,.55);border:2px solid #E9C76A;overflow:hidden;display:none;z-index:40}.h114-breath .b{position:absolute;top:0;bottom:0;background:rgba(120,210,110,.55)}.h114-breath .f{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#F7E3A0,#FFC24A)}.h114-breath span{position:absolute;inset:0;font:800 13px/22px Heebo,system-ui;color:#fff;text-align:center;direction:rtl;text-shadow:0 1px 2px #000}.h114-terua{position:fixed;left:50%;bottom:122px;transform:translateX(-50%);display:none;gap:8px;z-index:40}.h114-terua i{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid #E9C76A;display:inline-block;margin:0 3px}.h114-terua i.on{background:#FFC24A}';
    document.head.appendChild(css);
    const band = [[0.68, 0.94], [0.72, 0.92], [0.76, 0.9]][lv - 1];
    const tdots = document.createElement('div'); tdots.className = 'h109-ui h114-terua'; tdots.innerHTML = '<i></i>'.repeat(9); document.body.appendChild(tdots);
    function breathUI(on, label) { ui.style.display = on ? 'block' : 'none'; if (!on) return; ui.querySelector('.b').style.left = band[0] * 100 + '%'; ui.querySelector('.b').style.width = (band[1] - band[0]) * 100 + '%'; ui.querySelector('.f').style.width = Math.min(100, A.breath * 100) + '%'; if (label != null) ui.querySelector('span').textContent = label; }
    // (behind him and above: he stands in the lower middle of the frame, the land he blows over spread before him)
    function shotOut() { const o = { x: -0.707, z: 0.707 }; X.shot([TP.x - o.x * 13 + 2.5, TP.y + 15, TP.z - o.z * 13 + 2.5], [TP.x + o.x * 44, TP.y - 44, TP.z + o.z * 44], 1.3); }
    // the silver trumpet's own call (the music's 'blast' cue: Numbers 10:2), the kit's horn when the music is off
    function horn() { let ok = false; try { const Mu = globalThis.__BH_MUSIC; if (Mu && typeof Mu.cue === 'function') { Mu.cue('blast', 1); ok = true; } } catch (e) { ok = false; } if (!ok) X.play('fanfare'); }
    // ── part 1: the inscription stone comes up to its place ──
    const st0 = K.stone.position.y, upRope = X.props.rope(8, 0.06);
    function part1() {
      X.shot([-352, 58, 456], [-296, TOP.y, 396], 1.0);
      X.line('בראש הפינה הדרומית-מערבית של ההר · אבן הכתובת עולה למקומה');
      K.stone.position.y = st0 + 14; face.visible = false; A.p1 = 0;
    }
    function part2() {
      A.part = 2; face.visible = true; upRope.show(false); K.stone.position.y = st0;
      kx.clearRect(0, 0, cw, ch); draw(); shotFace();
      X.line('חורטים "לבית התקיעה" · געו בעיגול: מכת אזמל');
    }
    function strike(c) {
      const Lt = L[A.i]; if (!Lt) return; const q = Lt.pts[Lt.k]; if (!q) return;
      const sc = pxScale(), dpx = Math.hypot(c[0] - q.c[0], c[1] - q.c[1]) * sc, tol = [30, 24, 18][lv - 1];
      const w = tUp(q.c);
      if (dpx > tol * 1.8) { A.slips++; X.word(w, 'האזמל החליק'); X.play('thud'); kx.save(); kx.strokeStyle = 'rgba(70,50,30,.35)'; kx.lineWidth = 3; kx.beginPath(); kx.moveTo(c[0] - 8, c[1] - 4); kx.lineTo(c[0] + 8, c[1] + 4); kx.stroke(); kx.restore(); draw(); return; }
      Lt.dev.push(dpx / tol);
      if (!q.start && Lt.k > 0) groove(Lt.pts[Lt.k - 1].c, q.c, 16); else groove(q.c, [q.c[0] + 1, q.c[1] + 1], 18);
      X.play('chisel'); X.dust(w.x, w.y, w.z, 2, 0.4); X.haptic && X.haptic(6);
      Lt.k++;
      if (Lt.k >= Lt.pts.length) {
        const m = Lt.dev.reduce((a, b) => a + b, 0) / Lt.dev.length; Lt.grade = m <= 0.35 ? 'gold' : m <= 0.7 ? 'good' : 'ok'; Lt.done = true;
        X.hit(tUp(toC([50, 70], Lt)), Lt.grade, { text: '', craft: 'חורטים' }); A.flash = 1.1; A.flashI = A.i; X.play('rise');
        A.i++;
        const nx = L[A.i];
        if (!nx || nx.w !== Lt.w) { X.bonus(60, 'word', `"${WORDS[Lt.w]}"`); if (nx) setTimeout(shotFace, 600); }
        if (!nx) setTimeout(() => { X.line('"לבית התקיעה להכ…" · האבן שבורה: הוצע "להכריז" או "להבדיל" · חפירות ב. מזר, 1968'); X.word(tUp([cw / 2, 120]), 'האבן שבורה כאן'); }, 700), setTimeout(part3, 5200);
      }
      draw();
    }
    // ── part 3: the six blasts ──
    function part3() {
      A.part = 3; A.blast = 0; draw(); shotOut(); fan.visible = true;
      try { if (X.hero.mesh) X.hero.mesh.visible = false; } catch (e) { /* */ }
      nextBlast();
    }
    function nextBlast() {
      const G = TGT[A.blast];
      if (G) { X.line(G.line + ' · גררו לכוון · החזיקו על התוקע ושחררו בפס הירוק'); A.tries = 0; breathUI(true, G.name); if (A.blast === 0) { const q = X.scr(TP.x, TP.y + 2.2, TP.z); void q; X.hand({ x: TP.x, y: TP.y + 2.4, z: TP.z }, 0, 0); } }
      else if (A.blast === 3) { // the pause, the little fish
        breathUI(false); A.fish = 3.2; X.line('הפסקה קצרה: "כדי צליית דג קטן"'); fan.visible = false;
      }
    }
    function blowEnd() {
      const b = A.breath; A.breath = 0; A.hold = false;
      if (A.blast >= 4) return terua(b);
      const G = TGT[A.blast]; if (!G) return;
      const inBand = b >= band[0] && b <= band[1], s = inBand ? 1 : b > band[1] ? 0.45 : clamp(b / band[0], 0, 1) * 0.6;
      const aimW = A.aim + wind, reach = 40 + 80 * s;
      horn(); A.tries++;
      const ring = new T.Mesh(new T.RingGeometry(0.92, 1, 40, 1, -hw, hw * 2), new T.MeshBasicMaterial({ color: '#FFE7A0', transparent: true, opacity: 0.85, depthWrite: false, side: T.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.rotation.z = 0; const gy = X.ground(TP.x - 30, TP.z + 30); ring.position.set(TP.x, gy + 1.5, TP.z); ring.renderOrder = 5; world.add(ring);
      // (the ring's own frame: x along the aim's right, its centre line along the aim)
      ring.rotation.set(-Math.PI / 2, 0, aimW - Math.PI / 2 + Math.PI, 'XYZ');
      A.waves.push({ m: ring, r: 1, reach, t: 0 });
      let reached = 0, miss = 0;
      for (const it of G.items) { if (it.heard) continue; const da = Math.abs(Math.atan2(Math.sin(it.a - aimW), Math.cos(it.a - aimW))); if (da <= hw && it.d <= reach) { it.heard = true; it.t = -it.d / 70; reached++; } else miss++; }
      const left = G.items.filter((q) => !q.heard).length;
      const errA = Math.abs(Math.atan2(Math.sin(G.az - aimW), Math.cos(G.az - aimW)));
      const at3 = { x: TP.x, y: TP.y + 3, z: TP.z };
      if (!inBand) X.word(at3, b > band[1] ? 'הקול נשבר' : 'תקיעה חלשה');
      if (left === 0) {
        const grade = A.tries === 1 && inBand && errA <= hw * 0.35 ? 'gold' : A.tries === 1 ? 'good' : 'ok';
        A.grades.push(grade); X.hit(at3, grade, { text: grade === 'gold' ? 'כולם שמעו' : '', craft: 'תוקעים' });
        if (grade === 'gold') X.bonus(40, 'bul', 'כולם שמעו בתקיעה אחת');
        A.blast++; setTimeout(nextBlast, 2600);
      } else {
        setTimeout(() => X.line(`${left === 3 ? 'אף אחד לא שמע' : left === 1 ? 'אחד לא שמע' : 'שניים לא שמעו'} · ${G.name}: תקעו שוב אליהם`), 1500);
      }
      breathUI(true, G.name);
    }
    // the last: תקיעה (hold), תרועה (nine quick even blows), תקיעה (hold)
    function terua(b) {
      const T3 = A.terua || (A.terua = { step: 0, taps: [], g: [] });
      if (T3.step === 0 || T3.step === 2) {
        const inBand = b >= band[0] && b <= band[1]; T3.g.push(inBand ? 1 : 0.5); horn();
        if (!inBand) { X.word({ x: TP.x, y: TP.y + 3, z: TP.z }, b > band[1] ? 'הקול נשבר · שוב' : 'חלשה · שוב'); return; }
        T3.step++;
        if (T3.step === 1) { X.line('תרועה: תשע נקישות מהירות ושוות'); breathUI(false); tdots.style.display = 'flex'; for (const d of tdots.children) d.classList.remove('on'); }
        else finale();
      }
    }
    function teruaTap() {
      const T3 = A.terua; if (!T3 || T3.step !== 1) return;
      T3.taps.push(A.t); X.play('pop'); tdots.children[T3.taps.length - 1] && tdots.children[T3.taps.length - 1].classList.add('on');
      if (T3.taps.length >= 9) {
        const iv = []; for (let i = 1; i < T3.taps.length; i++) iv.push(T3.taps[i] - T3.taps[i - 1]); const mean = iv.reduce((a, b2) => a + b2, 0) / iv.length, sd = Math.sqrt(iv.reduce((a, b2) => a + (b2 - mean) ** 2, 0) / iv.length) / Math.max(0.05, mean);
        const ok = mean <= 0.45 && sd <= [0.35, 0.28, 0.22][lv - 1];
        if (!ok) { X.word({ x: TP.x, y: TP.y + 3, z: TP.z }, mean > 0.45 ? 'לאט מדי · שוב' : 'לא שוות · שוב'); T3.taps = []; for (const d of tdots.children) d.classList.remove('on'); return; }
        T3.g.push(sd <= 0.15 ? 1 : 0.8); T3.step = 2; tdots.style.display = 'none'; breathUI(true, 'תקיעה'); X.line('ועוד תקיעה: החזיקו ושחררו בפס');
      }
    }
    function finale() {
      A.done = true; breathUI(false); fan.visible = false;
      const tq = A.terua.g.reduce((a, b2) => a + b2, 0) / A.terua.g.length;
      A.grades.push(tq >= 0.95 ? 'gold' : tq >= 0.75 ? 'good' : 'ok');
      const q = A.grades.reduce((a, g2) => a + (g2 === 'gold' ? 1 : g2 === 'good' ? 0.8 : 0.5), 0) / A.grades.length;
      if (A.grades.every((g2) => g2 === 'gold')) X.perfect('בול! שבת', { x: TP.x, y: TP.y + 2, z: TP.z });
      X.bonus(150, 'shabbat', 'שש התקיעות');
      // dusk: a warm veil over the world; the crews on the Mount lay down their tools — "ושובת"
      const veil = document.createElement('div'); veil.className = 'h109-ui'; veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,150,60,.25),rgba(60,30,80,.35));opacity:0;transition:opacity 2.5s;z-index:5'; document.body.appendChild(veil); requestAnimationFrame(() => { veil.style.opacity = '1'; }); A.veil = veil;
      X.line('בין הערביים · "ושובת" (שבת לה ע"ב)');
      SH.lettersDone = true;
      setTimeout(() => X.shot([-372, 120, 470], [-150, 0, 250], 2.2), 1600);
      setTimeout(() => X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at: { x: TP.x, y: TP.y + 2, z: TP.z } }), 7200);
    }
    return {
      close: true,
      begin() { try { X.hero.setPos(letStand().x, letStand().z, -2.4); } catch (e) { /* */ } part1(); },
      update(dt) {
        A.t += dt;
        // (part 3: a hold on the trumpeter himself starts the blow; a drag anywhere else turns him)
        if (A.part === 3 && A.p0 && A.p0.blow && !A.hold && !A.done && A.t - A.p0.t > 0.12 && A.blast !== 3 && !(A.terua && A.terua.step === 1)) { A.hold = true; A.breath = 0; }
        if (A.part === 1) {
          A.p1 += dt; const k = ease(clamp((A.p1 - 0.8) / 3.2, 0, 1)); K.stone.position.y = st0 + 14 * (1 - k);
          upRope.show(k < 1); upRope.set({ x: K.stone.position.x, y: K.stone.position.y + 20, z: K.stone.position.z }, { x: K.stone.position.x, y: K.stone.position.y + 1.2, z: K.stone.position.z }, 0);
          if (A.p1 > 4.4 && !A.p1d) { A.p1d = true; X.play('settle'); X.dust(K.stone.position.x, TOP.y + 0.3, K.stone.position.z, 12, 3); }
          if (A.p1 > 5.6) part2();
        }
        if (A.part === 2 && A.flash > 0) { A.flash = Math.max(0, A.flash - dt * 1.6); }
        if (A.part === 2) draw();
        if (A.part === 3) {
          // the trumpeter turns with the aim; the fan shows where the sound will go (the wind bends it at level 3)
          if (tr) { tr.fx = TP.x + Math.sin(A.aim) * 10; tr.fz = TP.z + Math.cos(A.aim) * 10; if (tr.a) { tr.a.tiltT = A.hold ? 0.3 : 0.5; tr.a.playing = !!A.hold; } }   /* (the trumpet level, out over the land; a little up while he blows) */
          const gy = X.ground(TP.x - 30, TP.z + 30); const aimW = A.aim + wind;
          fan.position.set(TP.x, Math.max(gy + 1.2, TOP.y - 1.5), TP.z); fan.scale.setScalar(40 + 80 * (A.hold ? Math.min(1, A.breath / band[0]) : 1)); fan.rotation.set(-Math.PI / 2, 0, aimW - Math.PI / 2, 'XYZ');
          if (wind) { flag.position.set(-299.75 - 0.45, TOP.y + 2.75, 396.3); flag.rotation.y = Math.PI / 2 + Math.sin(A.t * 5) * 0.2; }
          if (A.hold && A.blast !== 3 && !(A.terua && A.terua.step === 1)) { A.breath += dt / 2.1; breathUI(true); if (A.breath >= 1.15) blowEnd(); }
          if (A.fish > 0) { A.fish -= dt; if (A.fish <= 0) { A.blast = 4; A.terua = { step: 0, taps: [], g: [] }; fan.visible = false; breathUI(true, 'תקיעה'); X.line('תקיעה, תרועה, תקיעה · החזיקו לתקיעה ושחררו בפס'); } }
        }
        // the waves go out; the ones who heard do as the Sabbath asks
        for (let i = A.waves.length - 1; i >= 0; i--) { const W = A.waves[i]; W.t += dt; W.r = Math.min(W.reach, W.t * 70); W.m.scale.setScalar(Math.max(1, W.r)); W.m.material.opacity = 0.85 * (1 - W.r / W.reach * 0.8); if (W.t > W.reach / 70 + 0.4) { world.remove(W.m); W.m.geometry.dispose(); W.m.material.dispose(); A.waves.splice(i, 1); } }
        TGT.forEach((G, gi) => { for (const it of G.items) { if (!it.heard) continue; it.t += dt; if (it.t < 0) continue;
          if (gi === 0 && it.w && !it.gone) { it.gone = true; SH.crew.setRole && SH.crew.setRole(it.w, 'walk', { item: null }); SH.crew.walkTo && SH.crew.walkTo(it.w, it.P.x + Math.sin(G.az) * 22, it.P.z + Math.cos(G.az) * 22, 2.2); }
          if (gi === 1) { const k = clamp(it.t / 0.9, 0, 1); it.aw.rotation.x = lerp(-0.35, -1.45, k); it.sh.scale.y = Math.max(0.01, k); }
          if (gi === 2) { const k = clamp(it.t / 1.2, 0, 1); for (const wm of it.win) { wm.material.emissiveIntensity = 1.8 * k * (0.9 + 0.1 * Math.sin(A.t * 9 + it.a * 40)); wm.material.color.set(k > 0.1 ? '#4A3416' : '#2B2116'); } }
        } });
      },
      wants(p) { return A.part === 2 ? !!canvasAt(p) : A.part === 3 && !A.done && (!p || nearPts(X, p, [{ x: TP.x, y: TP.y + 2.2, z: TP.z }], bigR())); },   // ── h115 ── ── /h115 ── (build 125: the trumpet's blow and aim start at the trumpeter on the right half; the rest is the look)
      down(p) {
        const tq = X.scr(TP.x, TP.y + 2.2, TP.z);
        A.p0 = { x: p.x, y: p.y, t: A.t, aim: A.aim, moved: false, blow: Math.hypot(p.x - tq.x, p.y - tq.y) < Math.max(70, innerHeight * 0.13) };
        if (A.part === 2) { const c = canvasAt(p); if (c) { strike(c); X.hand(null); } return; }
        if (A.part === 3 && !A.done) { if (A.terua && A.terua.step === 1) { teruaTap(); return; } }
      },
      move(p) {
        if (A.part !== 3 || !A.p0 || A.p0.blow || A.hold || A.done) return;
        if (Math.abs(p.x - A.p0.x) > 10) A.p0.moved = true;
        if (A.p0.moved) A.aim = clamp(A.p0.aim - (p.x - A.p0.x) * 0.0032, -125 * deg, 35 * deg);
      },
      up() { const P0 = A.p0; A.p0 = null; if (A.part === 3 && A.hold) blowEnd(); void P0; },
      cancel() { A.p0 = null; if (A.hold) blowEnd(); },
      end() {
        breathUI(false); ui.remove(); tdots.remove(); css.remove(); if (A.veil) { const v = A.veil; v.style.opacity = '0'; setTimeout(() => v.remove(), 2600); }
        upRope.dispose(); X.props.remove(world);
        for (const G of TGT) for (const it of G.items) if (it.w) SH.crew.remove(it.w);
        if (tr && !SH.lettersDone) SH.crew.remove(tr); else SH.trumpeter = tr;
        try { if (X.hero.mesh) X.hero.mesh.visible = true; } catch (e) { /* */ }
        face.visible = true; draw();
      },
      at() { return { x: TP.x, y: TP.y + 2, z: TP.z }; },
      dbg() {
        const Lt = L[A.i], scr = (c) => { const w = tUp(c); const q = X.scr(w.x, w.y, w.z); return [Math.round(q.x), Math.round(q.y)]; };
        const G = TGT[A.blast];
        return { part: A.part, i: A.i, n: L.length, ch: Lt ? Lt.ch : null, next: Lt && Lt.pts[Lt.k] ? scr(Lt.pts[Lt.k].c) : null, slips: A.slips, grades: L.map((x2) => x2.grade), blast: A.blast, aim: +(A.aim / deg).toFixed(1), want: G ? +((G.az - wind) / deg).toFixed(1) : null, left: G ? G.items.filter((q) => !q.heard).length : null, hold: A.hold, breath: +A.breath.toFixed(2), band, fish: +A.fish.toFixed(2), terua: A.terua ? { step: A.terua.step, taps: A.terua.taps.length } : null, done: A.done, bg: A.grades.slice(), tp: (() => { const q = X.scr(TP.x, TP.y + 2.2, TP.z); return [Math.round(q.x), Math.round(q.y)]; })() };
      },
    };
  },
};

/** one of the east wall's two courses as the save has it, on the wall's top as it stands now */
function buildCourse(X, c) {
  const st = X.M.st, CL = st.courseLay && st.courseLay[c], lv = CL ? CL.lv : 1, K = puzzleOf(c, lv);
  let laid = null; if (st.done.includes('course' + c)) { if (CL && CL.laid) laid = CL.laid; else { laid = []; let z = K.gap[0]; for (const L of K.sol) { laid.push([z, z + L]); z += L; } } }
  for (const o of (SH.courseW[c] || [])) X.props.remove(o);
  if (SH.courseSet && SH.courseSet[c]) { for (const o of SH.courseSet[c]) X.props.remove(o); SH.courseSet[c] = null; }
  SH.courseW[c] = courseWorld(X, c, lv, laid).out; SH.courseG[c] = X.ground(WALL_X, K.z0 + 7);
}
/* ── h114 ── (the full replay, 9.11: the trench, the crane and the courses stood where the ground was when the page opened) the
 * Mount's walls and its fill rise while he works elsewhere: what stands at the walls' working edge stands on it as it is now.
 * Checked about once a second, never during an act (an act holds its own ground). ── /h114 ── */
function reground3(X) {
  const st = X.M.st, near = (a, b) => Math.abs(a - b) <= 0.05;
  const gC = X.ground(CORNER_AT.x, CORNER_AT.z);
  if (SH.cornerPit && !near(SH.cornerPit.position.y, gC)) { SH.cornerPit.position.y = gC; if (SH.cornerStone) SH.cornerStone.position.y = gC - PIT + 0.8; }
  const C = SH.crane; if (C) { const gy = X.ground(C.base.x, C.base.z); if (!near(C.g.position.y, gy)) C.g.position.y = gy; }
  for (const c of Object.keys(SH.courseG).map(Number)) if (!near(SH.courseG[c], X.ground(WALL_X, COURSES[c].z0 + 7))) buildCourse(X, c);
  for (const q of (SH.greatNext || [])) { const y = X.ground(GR.x, q.z) + GR.h / 2; if (!near(q.m.position.y, y)) q.m.position.y = y; }
  if (SH.great) { const y = SH.greatDone ? X.ground(GR.x, GR.zEnd) + GR.h / 2 : poseOf(X, restAt(0)).y; if (!near(SH.great.position.y, y)) greatRest(X); }
}
export function initWorld3(X, sh) {
  SH = sh; const st = X.M.st, done = (id) => st.done.includes(id);
  SH.crane = makeCrane(X); SH.crane.place(CRANE_AT.x, CRANE_AT.z, Math.atan2(CORNER_AT.x - CRANE_AT.x, CORNER_AT.z - CRANE_AT.z) - 0.9); SH.crane.rope.show(false);
  // ── h114 ── the corner's trench is dug from the start (the crews dig it while he measures); the stone in it once it was laid ── /h114 ──
  SH.cornerPit = cornerPit(X, !done('corner'));
  if (done('corner')) { const s = stoneMesh(X, CW, 1.6, CDp), y = X.ground(CORNER_AT.x, CORNER_AT.z) - PIT; s.position.set(CORNER_AT.x, y + 0.8, CORNER_AT.z); SH.cornerStone = s; goldMark(X, CORNER_AT.x, y + 1.6, CORNER_AT.z); }
  // the east wall's courses as far as the crews and the kohen have laid them
  // ── h114 ── as he laid them (st.courseLay), the solution's order for an older save ── /h114 ──
  SH.courseW = {}; SH.courseG = {}; SH.courseSet = {};
  for (let c = 0; c < 2; c++) buildCourse(X, c);
  for (let c = 2; c < COURSES.length; c++) if (done('course' + c)) buildCourse(X, c);   // ── h116 ── (the free courses he laid) ── /h116 ──
  // ── h116 ── the great stone: on its rollers on the rock (BOOK.great) until he lets it down, then in its course for good; the crews'
  // great stones beyond it, north of it in the same course on the west wall's top ── /h116 ──
  SH.great = greatMesh(X, GR.len);
  SH.greatNext = []; { let z = GR.zEnd - GR.len / 2 - 0.08; for (const L of GR_NEXT) { const m = greatMesh(X, L - 0.08); m.position.set(GR.x, X.ground(GR.x, z - L / 2) + GR.h / 2, z - L / 2); SH.greatNext.push({ m, z: z - L / 2 }); z -= L; } }
  SH.greatDone = done('great');
  greatRest(X);
  // its way kept clear of the scrub (the rock it starts on and every cell the way crosses)
  try { const seen = new Set(); for (const [k, r] of BOOK.great.keep) seen.add(k + ',' + r); for (let s = 0; s <= TRK.L; s += 4) { const p = TRK.at(s); for (const d of [-6, 0, 6]) { const c = cellOf(p.x + p.nx * d, p.z + p.nz * d); seen.add(c.k + ',' + c.r); } } for (const id of seen) { const [k, r] = id.split(',').map(Number); X.stages.cells.clearScrub(k, r); } } catch (e) { /* */ }
}
/** the great stone where the save has it: in its course, or at the head of its way on the rock */
function greatRest(X) {
  if (!SH.great) return;
  if (SH.greatDone) setStone(SH.great, seatPose(X)); else setStone(SH.great, poseOf(X, restAt(0)));
}
/** every frame: the walls' working edge kept on the ground as it is now (never during an act) */
export function frame3(dt, X, sh) {
  if (SH && SH.crane && !X.acting) { SH.reg3T = (SH.reg3T || 0) + dt; if (SH.reg3T > 1.0) { SH.reg3T = 0; try { reground3(X); } catch (e) { /* the world's */ } } }
  void sh;
}
export { makeCrane, chalkTag, CORNER_AT, CRANE_AT, GR, LET, TRK as GREAT_TRACK };

/** ── h115 ── (brief: "a short victory trumpet blast is added at the end of the stage") the stage's last beat before its film: the
 *  trumpeter on the south-west corner's top blows a tekiah twice over the levelled Mount (the music's 'blast' cue, Numbers 10:2;
 *  the kit's fanfare when the music is off) ── /h115 ── */
export async function finale01(X) {
  const TP = { x: TRUMP.x, y: TOP.y, z: TRUMP.z }, o = { x: -0.707, z: 0.707 };
  const blast = () => { let ok = false; try { const Mu = globalThis.__BH_MUSIC; if (Mu && typeof Mu.cue === 'function') { Mu.cue('blast', 1); ok = true; } } catch (e) { ok = false; } if (!ok) X.play('fanfare'); X.sparks(TP.x, TP.y + 3, TP.z, 26); };
  X.shot([TP.x - o.x * 12 + 3, TP.y + 7, TP.z - o.z * 12 + 3], [TP.x + o.x * 20, TP.y - 6, TP.z + o.z * 20], 1.4);
  X.line('תקיעת ניצחון · ההר שוטח');
  await X.wait(1.5); blast();
  await X.wait(1.7); blast();
  await X.wait(2.0); X.line('');
}

