/* ── build 109 ── h109/acts3.js — four acts of stage 01 in the world: 3.5 the corner stone (a real treadwheel crane: swipes walk the
 * wheel, a hold lowers, the stone sways, a hard touch chips it), 3.6 the course of the east retaining wall (choose a length, drag,
 * release with the sway: no joint over a joint), 3.7 the great stone on rollers (it comes from the quarry along a road the crews pull
 * it on; the kohen moves the rollers for the last stretch), 3.8 "לבית התקיעה" (the two words carved letter by letter).
 */
import { onPlane, clamp, lerp, ease } from './kit.js';
import { wasteAdd } from './acts2.js';

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
function shadowDisk(X) { const T = X.THREE; const m = new T.Mesh(new T.CircleGeometry(1, 24), new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 996; X.props.root.add(m); return m; }

/* ───────── 3.5 the corner stone ───────── */
// ── h114 ── at the very corner he measured with the rope (the 500 × 500's north-east corner, where the two sides met at the stake) ── /h114 ──
const CORNER_AT = { x: 270.6, z: -176.6 }, CRANE_AT = { x: 263.1, z: -169.6 }, STOCK = { x: 252.6, z: -166.1 };
// ── h114 ── (ירון 9.11: "כל אבן יורדת למקום אמיתי בעולם האמיתי"; "העיגול הצהוב לא ברור") the corner's foundation trench, dug at the
// real corner of the Mount's wall, its earth heaped beside it, and the stone's own outline chalked on its floor; the stone sits a
// little sunk in it for good (PIT) and the courses go on from it ── /h114 ──
const CW = 2.4, CDp = 2.0, PIT = 0.4;
function cornerPit(X, chalk) {
  const T = X.THREE, g = new T.Group(); g.name = 'h114-corner-pit'; const gy = X.ground(CORNER_AT.x, CORNER_AT.z);
  const earth = new T.MeshStandardMaterial({ color: '#6B5236', roughness: 1 }), heap = new T.MeshStandardMaterial({ color: '#8A6E4B', roughness: 1, flatShading: true });
  const floor = new T.Mesh(new T.BoxGeometry(CW + 1.0, 0.1, CDp + 1.0), earth); floor.position.set(0, -PIT, 0); floor.receiveShadow = true; g.add(floor);
  // its four sides, cut straight down
  for (const [w, d, x, z] of [[CW + 1.2, 0.12, 0, (CDp + 1.0) / 2], [CW + 1.2, 0.12, 0, -(CDp + 1.0) / 2], [0.12, CDp + 1.0, (CW + 1.0) / 2, 0], [0.12, CDp + 1.0, -(CW + 1.0) / 2, 0]]) { const m = new T.Mesh(new T.BoxGeometry(w, PIT + 0.12, d), earth); m.position.set(x, -PIT / 2 + 0.02, z); m.receiveShadow = true; g.add(m); }
  // the dug earth, heaped on the side away from the wall
  for (const [x, z, r] of [[-2.6, 0.6, 0.9], [-2.4, -1.0, 0.7], [-1.0, 2.2, 0.6]]) { const m = new T.Mesh(new T.SphereGeometry(r, 9, 5, 0, TAU, 0, Math.PI / 2), heap); m.scale.y = 0.55; m.position.set(x, 0, z); m.castShadow = true; m.receiveShadow = true; g.add(m); }
  if (chalk) {
    const cm = new T.MeshBasicMaterial({ color: '#F4F0E6' }); g.userData.chalk = [];
    for (const [w, d, x, z] of [[CW, 0.07, 0, CDp / 2], [CW, 0.07, 0, -CDp / 2], [0.07, CDp, CW / 2, 0], [0.07, CDp, -CW / 2, 0]]) { const m = new T.Mesh(new T.BoxGeometry(w, 0.02, d), cm); m.position.set(x, -PIT + 0.07, z); g.add(m); g.userData.chalk.push(m); }
  }
  g.position.set(CORNER_AT.x, gy, CORNER_AT.z); X.props.root.add(g); return g;
}
export const CORNER = {
  icon: '🏗', title: 'אבן הפינה',
  walkLine: () => 'גלגל הדריכה ליד הפינה: מרימים את אבן הפינה',
  stand(m, X) { return { x: CRANE_AT.x, z: CRANE_AT.z, face: [CRANE_AT.x + 1, CRANE_AT.z], mx: CRANE_AT.x - 1.5, mz: CRANE_AT.z + 3.5 }; },
  prepare(m, X) { SH.crane.place(CRANE_AT.x, CRANE_AT.z, Math.atan2(CORNER_AT.x - CRANE_AT.x, CORNER_AT.z - CRANE_AT.z) - 0.9); },
  make(m, X) {
    const lv = X.level(), T = X.THREE, C = SH.crane, gP = X.ground(CORNER_AT.x, CORNER_AT.z), sw = 2.4;
    const A = { aimP: null, barmen: [], settle: null, phase: 'lift', h: 0, hMax: 5, w: 0, taps: [], grades: [], v: 0, hold: false, ax: 0, sway: { x: 0, z: 0, vx: 0, vz: 0 }, chips: 0, rejects: 0, t: 0, lastSw: 0, p0: null, slewT: 0 };
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
    const crew = [SH.crew.add(CRANE_AT.x - 2.2, CRANE_AT.z + 1.2, { role: 'push', fx: CRANE_AT.x, fz: CRANE_AT.z, crew: 1 }), SH.crew.add(CORNER_AT.x + 1.2, CORNER_AT.z + 4.6, { role: 'hold', item: 'mallet', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 2 }), SH.crew.add(CORNER_AT.x - 4.6, CORNER_AT.z - 3.4, { role: 'pull', item: 'rope', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 0 })];
    // (the tagline: from the stone to the crewman beside the trench, who turns it square — ירון 9.11: no figure "with a lantern")
    const tag = X.props.rope(10, 0.035);
    function shotSide() { const mx = (CRANE_AT.x + CORNER_AT.x) / 2, mz = (CRANE_AT.z + CORNER_AT.z) / 2, dx = CORNER_AT.x - CRANE_AT.x, dz = CORNER_AT.z - CRANE_AT.z, L = Math.hypot(dx, dz), px = -dz / L, pz = dx / L, g = X.ground(mx, mz); X.shot([mx + px * 30 - dx * 0.3, g + 10, mz + pz * 30 - dz * 0.3], [mx + dx * 0.15, g + 6.5, mz + dz * 0.15], 1.0); }
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
      const top = tip.y - 1.2; pos.y = A.phase === 'lift' ? X.ground(STOCK.x, STOCK.z) + 0.8 + A.h : top - A.drop;
      // (it hangs square to the jib; over the corner the crewman on the tagline turns it to the chalk's square, slowly)
      const jibRot = C.yaw + C.slew.rotation.y; if (rot === null) rot = jibRot;
      if (A.phase === 'lower') rot += Math.atan2(Math.sin(0 - rot), Math.cos(0 - rot)) * (1 - Math.exp(-dt * 1.6)); else rot = jibRot;
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
    function axFor(P) { const R = Math.hypot(C.tipL.z, C.tipL.x) || 10; return clamp(Math.hypot(P.x - C.base.x, P.z - C.base.z) - R, -2.6, 2.6); }
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
      if (vT > 1.7) {
        A.chips++; A.drop -= 0.5; X.word(at, A.chips >= 2 ? 'פעמיים שבב: האבן נפסלת' : 'שבב! נגעו מהר מדי'); X.sparks(pos.x, gy + 0.2, pos.z, 12); X.play('crack'); X.shake(0.15, 0.3);
        if (A.chips >= 2) { A.rejects++; A.chips = 0; X.loss(20, at, 'אבן הפינה נפסלה', 1); wasteAdd(X, 1, at); restart(); }
        return false;
      }
      // ── h114 ── off the chalk by more than a tenth: the crew can't bar it over — up again and down again (no damage, no points off;
      // the spec's table "יותר מ־10%") ── /h114 ──
      if (d > 0.1) { A.misses = (A.misses | 0) + 1; A.drop -= 1.4; X.word(at, 'רחוק מהגיר · מרימים ומורידים שוב'); X.play('thud'); X.dust(pos.x, floorY + 0.2, pos.z, 6, 2); return false; }
      const grade = d <= 0.05 ? (A.misses ? 'good' : 'gold') : 'good';
      A.grades.push(A.chips ? (grade === 'gold' ? 'good' : grade) : grade);
      // ── h114 ── it sits in the trench, square on its chalk; off the chalk the crewmen bar it over (seen: the push, below), and it
      // stays there for good (SH.cornerSet → initWorld3 puts it back after a reload) ── /h114 ──
      A.settle = { from: { x: pos.x, z: pos.z, r: stone.rotation.y }, t: 0, dur: d <= 0.05 ? 0.25 : 1.4 };
      pos.y = floorY + 0.8; stone.position.y = pos.y;
      X.play('settle'); X.dust(pos.x, floorY + 0.2, pos.z, 16, 3); X.shake(0.2, 0.35);
      X.hit(at, A.grades[A.grades.length - 1], { text: grade === 'gold' ? 'מהודר' : grade === 'good' ? 'הצוות מיישר במוטות' : 'הצוות דוחף אותה למקום', craft: 'בנאים' });
      if (grade === 'gold' && !A.chips && !A.rejects) { X.perfect('בול! אבן הפינה במקומה', { x: CORNER_AT.x, y: gP + 1, z: CORNER_AT.z }); X.bonus(40, 'bul', 'בול על הגיר'); }
      if (vT < 0.8) X.bonus(20, 'soft', 'נגיעה רכה');
      if (d > 0.05) { for (const k of [-1, 1]) A.barmen.push(SH.crew.add(pos.x - k * 2.6, pos.z + 0.4 * k, { role: 'lever', item: 'staff', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 2 })); }
      A.phase = 'done'; SH.cornerSet = true;
      // the slings come off, the rope goes up; the verse stays long enough to read; the camera rises over the corner
      setTimeout(() => { slingsAt(true); C.rope.show(false); X.props.remove(slings); }, 1300);
      setTimeout(() => { X.line('"אבן מאסו הבונים היתה לראש פינה" (תהלים קיח, כב)'); for (const m of (pit.userData.chalk || [])) m.visible = false; }, 700);
      setTimeout(() => X.shot([CORNER_AT.x - 16, gP + 30, CORNER_AT.z - 26], [CORNER_AT.x - 1, gP, CORNER_AT.z + 1], 1.8), 1600);
      const q = A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length;
      setTimeout(() => X.end({ q: A.rejects ? Math.min(q, 0.6) : q, stars: A.rejects ? 1 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 6200);
      return true;
    }
    function steer(p) { const g = onPlane(X, p.x, p.y, gP); if (g && Math.hypot(g.x - CORNER_AT.x, g.z - CORNER_AT.z) < 9) A.aimP = { x: g.x, z: g.z }; }
    function restart() {
      A.phase = 'reject'; X.line('הצוות מוריד את האבן לפסולת ומביא אחרת');
      setTimeout(() => { A.phase = 'lift'; A.h = 0; A.drop = 0; A.ax = 0; A.sway.x = A.sway.z = A.sway.vx = A.sway.vz = 0; X.line('שוב: החליקו למטה בקצב'); }, 3500);
    }
    return {
      begin() {
        { const dx = CORNER_AT.x - CRANE_AT.x, dz = CORNER_AT.z - CRANE_AT.z, L = Math.hypot(dx, dz); A.aimP = { x: CORNER_AT.x + (dx / L) * 1.8 + (-dz / L) * 0.9 * (lv >= 2 ? 1 : 0.5), z: CORNER_AT.z + (dz / L) * 1.8 + (dx / L) * 0.9 * (lv >= 2 ? 1 : 0.5) }; }
        A.drop = 0; try { X.hero.setPos(CRANE_AT.x, CRANE_AT.z, C.yaw + Math.PI / 2); } catch (e) { /* */ }
        shotSide(); X.line('החליקו למטה בקצב');
        X.hand({ x: CRANE_AT.x, y: X.ground(CRANE_AT.x, CRANE_AT.z) + 3, z: CRANE_AT.z }, 0, 40);
      },
      update(dt) {
        A.t += dt;
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
          A.slewT += dt; C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 2.2)); A.drop = 0; A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 2));
          if (lv >= 2 && A.slewT < 0.1) A.sway.vx = 1.4;
          if (A.slewT > 1.8) { A.phase = 'lower'; X.line('החזיקו על מלבן הגיר — האבן יורדת אליו · שחררו — עוצרת'); X.hand({ x: CORNER_AT.x, y: floorY + 0.2, z: CORNER_AT.z }, 0, 0); }
        } else if (A.phase === 'lower') {
          // ── h114 ── the finger steers: the jib slews heavily toward the point under it and the hook runs in or out along the jib;
          // the stone follows on its rope, late and swinging (ירון 9.11: "כל אבן יורדת למקום אמיתי") ── /h114 ──
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 1.1)); A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 1.3));
          C.tipWorld(tip);
          A.v = A.hold ? Math.min(2.6, A.v + dt * 3) : Math.max(0, A.v - dt * 12);
          A.drop += A.v * dt;
          C.wheel.rotation.x += A.v * dt / C.R * 3.2;
          const bottom = tip.y - 1.2 - A.drop - 0.8;
          if (bottom <= floorY + 0.02) { A.drop = tip.y - 1.2 - 0.8 - floorY; if (!settle(A.v)) { A.v = 0; } }
        }
        if (A.phase !== 'done') stonePos(dt);
        if (A.phase === 'slew' || A.phase === 'lower') {
          // ── h114 ── over the corner: the stone and its trench in one frame, the camera low enough that the stone stands against the
          // hill, not lost in the city behind (ירון 9.11) ── /h114 ──
          const ty = (pos.y + floorY) / 2;
          X.track([CORNER_AT.x - 11, gP + 7.5, CORNER_AT.z - 13], [CORNER_AT.x, ty, CORNER_AT.z], 2.2);   // (from the south-west: the crane and its wheel behind, never in front)
        }
        if (A.phase !== 'done' || A.settle) { const w = crew[2] && crew[2].a; if (w) { tag.show(true); tag.set({ x: stone.position.x - 0.9, y: stone.position.y - 0.5, z: stone.position.z - 0.7 }, { x: w.x, y: X.ground(w.x, w.z) + 1.5, z: w.z }, 0.6); } }
        else tag.show(false);
        if (A.phase === 'done' && A.settle) {
          // (on to the chalk: at once when it landed right; the crewmen's bars push it over the rest)
          const S2 = A.settle; S2.t += dt; const k = ease(Math.min(1, S2.t / S2.dur));
          stone.position.set(lerp(S2.from.x, CORNER_AT.x, k), floorY + 0.8, lerp(S2.from.z, CORNER_AT.z, k));
          stone.rotation.y = S2.from.r * (1 - k);
          if (stone.parent && slings.parent) slingsAt(true);
          if (S2.t > S2.dur) A.settle = null;
        }
      },
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: performance.now() / 1000, ax: A.ax };
        if (A.phase === 'lower') { A.hold = true; X.hand(null); X.play('rope'); steer(p); }
      },
      move(p) { if (A.phase === 'lower' && A.p0) steer(p); },
      up(p) {
        const P0 = A.p0; A.p0 = null; A.hold = false;
        if (A.phase === 'lift' && P0 && p.y - P0.y >= 40 && performance.now() / 1000 - P0.t <= 0.45) { swipe(); X.hand(null); }
      },
      end() { tag.dispose(); X.props.remove(sh); X.props.remove(slings); for (const l of legs) l.dispose(); C.rope.show(false); for (const w of crew.concat(A.barmen)) SH.crew.remove(w); if (!SH.cornerSet) X.props.remove(stone); else { SH.cornerStone = stone; stone.position.set(CORNER_AT.x, floorY + 0.8, CORNER_AT.z); stone.rotation.y = 0; } },
      at() { return { x: CORNER_AT.x, y: gP + 2, z: CORNER_AT.z }; },
      dbg() { C.tipWorld(tip); return { phase: A.phase, h: +A.h.toFixed(2), v: +A.v.toFixed(2), drop: +(A.drop || 0).toFixed(2), gap: +(tip.y - 1.2 - (A.drop || 0) - 0.8 - floorY).toFixed(2), swing: +Math.hypot(A.sway.vx, A.sway.vz).toFixed(2), dx: +(Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw).toFixed(3), chips: A.chips, rejects: A.rejects, grades: A.grades.slice(-6), ax: +A.ax.toFixed(2), sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2), chalk: (() => { const q = X.scr(CORNER_AT.x, gP, CORNER_AT.z); return [Math.round(q.x), Math.round(q.y)]; })() }; },
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
  { z0: 54, P: [{ gap: [3.5, 10.5], below: [6.5], sol: [4, 3] }, { gap: [3.5, 11.5], below: [5.25, 9.25], sol: [2.5, 2, 3.5] }] },
  { z0: 116, P: [{ gap: [3.5, 13.5], below: [7.25, 10], sol: [2.5, 3.5, 4] }, { gap: [3.5, 14.5], below: [5.75, 8.75, 12.25], sol: [3.5, 2.5, 2, 3] }] },
];
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
function chalkTag(X, text, w = 1.3) {
  const T = X.THREE, cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const g = cv.getContext('2d');
  g.font = '900 96px Heebo, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(250,247,238,.95)'; g.fillText(text, 128, 70);
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
    const A = { phase: 'open', t: 0, cur: null, set: [], stock: [], grades: [], lifts: 0, joj: 0, hold: false, v: 0, drop: 0, ax: 0, aimP: { x: gx, z: zc }, sway: { x: 0, z: 0, vx: 0, vz: 0 }, tipP: null, rise: 0, settle: null, crew: [], marks: [], chips: 0 };
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
    const occ = () => { const o = [[-1e3, K.gap[0]], [K.gap[1], 1e3]]; for (const q of A.set) o.push([q.a, q.b]); return o; };
    const relZ = (z) => z - K.z0;
    // ── the camera: the gap from above first (where am I), then down in front of the work: stock, crane and gap in one frame ──
    const CAMW = { p: [WALL_X - 31, yB + 13, zc - 1], t: [WALL_X - 7, yB - 1.5, zc + 0.5] };
    function camWork() { X.shot(CAMW.p, CAMW.t, 1.2); }
    function hookTo(q) {
      A.cur = q; A.phase = 'hook'; A.t0 = A.t; A.rise = 0; A.ax = 0; A.drop = 0; A.v = 0;
      A.aimP = { x: q.m.position.x, z: q.m.position.z }; A.from = { y: q.m.position.y, r: q.m.rotation.y };
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
      let hp = null; try { const b = X.hero.mesh && X.hero.mesh.getObjectByName('hero-handR'); if (b) { hp = b.getWorldPosition(new T.Vector3()); } } catch (e) { /* */ }
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
      const dev = Math.abs(a - want) / L, devX = dx / CD;
      const e = Math.max(dev, devX * 0.5);
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
    function bounce(at, why) { A.drop = Math.max(0, A.drop - 1.6); A.v = 0; X.word(at, why); X.play('thud'); return false; }
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
      setTimeout(() => X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 5200);
    }
    function pick(p) {
      const ms = A.stock.map((q) => q.m); const hits = X.rayAt(p.x, p.y).intersectObjects(ms, true);
      if (!hits.length) return null; let o = hits[0].object; while (o && !ms.includes(o)) o = o.parent; return A.stock.find((q) => q.m === o) || null;
    }
    function steer(p) { const g = onPlane(X, p.x, p.y, yB + CH / 2); if (g && Math.hypot(g.x - C.base.x, g.z - C.base.z) < 15) A.aimP = { x: g.x, z: g.z }; }
    return {
      begin() {
        X.shot([WALL_X - 28, yB + 34, zc - 2], [WALL_X - 4, yB, zc], 1.0);
        X.line(`רווח של ${K.gap[1] - K.gap[0]} אמות בחומה · ${K.sol.length > 2 ? 'כמה' : 'שתי'} אבנים יסגרו אותו`);
        try { X.hero.setPos(WALL_X - 7, zc - 8.5, Math.PI / 2); } catch (e) { /* */ }
        setTimeout(() => { if (A.phase === 'open') { A.phase = 'choose'; camWork(); X.line('געו באבן מהשורה: הצוות קושר אותה למנוף'); const q = A.stock[2]; X.hand({ x: q.m.position.x, y: q.m.position.y + 1, z: q.m.position.z }, 0, 10); } }, 2600);
      },
      update(dt) {
        A.t += dt; C.tipWorld(tip);
        const q = A.cur;
        for (const s2 of A.stock) { s2.tg.visible = !s2.laid; if (!s2.laid) { s2.tg.position.set(s2.m.position.x, s2.m.position.y + CH / 2 + 0.03, s2.m.position.z); s2.tg.rotation.y = s2.m.rotation.y - Math.PI / 2; } }
        if (A.phase === 'hook' && q) {
          // the jib swings over the stone, the hook comes down, the crew ties it, it rises
          C.aim(A.aimP.x, A.aimP.z, 1 - Math.exp(-dt * 2.4)); A.ax = lerp(A.ax, axFor(A.aimP), 1 - Math.exp(-dt * 2.4));
          const rl = Math.hypot(tip.x - C.base.x, tip.z - C.base.z) || 1, hx = tip.x + ((tip.x - C.base.x) / rl) * A.ax, hz = tip.z + ((tip.z - C.base.z) / rl) * A.ax;
          const over = Math.hypot(hx - q.m.position.x, hz - q.m.position.z) < 0.35 || A.t - A.t0 > 2.4;
          C.rope.show(true); C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: hx, y: Math.max(q.m.position.y + CH / 2 + 1.0, tip.y - 3 - A.rise * 6), z: hz }, 0);
          if (over) { A.rise += dt * 0.9; if (A.rise >= 1) { A.phase = 'carry'; A.sway.x = A.sway.z = A.sway.vx = A.sway.vz = 0; A.tipP = { x: tip.x, z: tip.z }; X.line(q.L + ' אמות · החזיקו מעל הרווח: המנוף מביא אותה ומוריד · שחררו: עוצרת'); X.play('rise'); } }
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
          A.v = A.hold && there ? Math.min(2.4, A.v + dt * 2.6) : Math.max(0, A.v - dt * 10);
          A.drop += A.v * dt;
          const floor = overWall ? yB : X.ground(hx, hz);
          let bottom = hangB - A.drop;
          // (the tagline: he turns it along the wall over the wall, across it over the stock)
          const wantR = overWall || Math.abs(hx - WALL_X) < 4 ? Math.PI / 2 : 0; q.m.rotation.y += Math.atan2(Math.sin(wantR - q.m.rotation.y), Math.cos(wantR - q.m.rotation.y)) * (1 - Math.exp(-dt * 2));
          q.m.position.set(hx, bottom + CH / 2, hz);
          if (bottom <= floor + 0.01) {
            q.m.position.y = floor + CH / 2;
            if (overWall) { const vT = A.v; land(vT); if (A.cur) { A.v = 0; } }
            else { // put down on the ground: back in the stock where it is
              A.drop = hangB - floor; q.m.rotation.y = 0; q.home = { x: hx, z: hz }; A.cur = null; A.phase = 'choose'; slings(false); C.rope.show(false); tag.show(false); X.line('הונחה על הקרקע · געו באבן'); X.play('thud'); camWork();
            }
          }
          if (A.cur) slings(true);
          // the kohen walks with it on the tagline, beside the wall, out of the camera's way
          try { const h = X.stages.heroXYZ({}); if (h) { const tx = Math.min(WALL_X - 2.6, hx - 1.5), tz = hz - q.L / 2 - 3.2, d = Math.hypot(tx - h.x, tz - h.z); if (d > 1.0) X.hero.drive(((tx - h.x) / d) * Math.min(5, d * 1.5), ((tz - h.z) / d) * Math.min(5, d * 1.5)); else X.hero.drive(0, 0); } } catch (e) { /* */ }
          // (wide while it crosses; nearer as it comes over the wall: the gap and the stone fill the frame)
          const kc = ease(clamp((hx - (WALL_X - 9)) / 8, 0, 1)), cz = lerp(zc, hz, 0.6 * kc);
          X.track([lerp(CAMW.p[0], WALL_X - 17, kc), lerp(CAMW.p[1], yB + 8, kc), lerp(CAMW.p[2], cz - 2, kc)], [lerp(CAMW.t[0], WALL_X - 0.5, kc), lerp(CAMW.t[1], yB + 0.4, kc), lerp(CAMW.t[2], cz, kc)], 1.4);
        } else if (A.phase === 'settle' && A.settle) {
          const S2 = A.settle; S2.t += dt; const k = ease(Math.min(1, S2.t / S2.dur)), s = S2.q.m;
          s.position.set(lerp(S2.from.x, S2.to.x, k), yB + CH / 2, lerp(S2.from.z, S2.to.z, k)); s.rotation.y = lerp(S2.from.r, Math.PI / 2, k);
          if (S2.t > S2.dur + 0.3) { A.settle = null; afterSet(); if (A.phase === 'choose') camWork(); }
          try { X.hero.drive(0, 0); } catch (e) { /* */ }
        }
      },
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: A.t };
        if (A.phase === 'carry') { A.hold = true; steer(p); X.hand(null); }
      },
      move(p) { if (A.phase === 'carry' && A.p0) steer(p); },
      up(p) {
        const P0 = A.p0; A.p0 = null; A.hold = false;
        if (A.phase === 'choose' && P0 && Math.hypot(p.x - P0.x, p.y - P0.y) < 14) { const q = pick(p); if (q) hookTo(q); }
      },
      cancel() { A.hold = false; A.p0 = null; },
      end() {
        for (const l of legs) l.dispose(); tag.dispose(); C.rope.show(false); for (const w of crewA.concat(A.crew)) SH.crew.remove(w); for (const t of A.marks) X.props.remove(t);
        try { X.hero.drive(0, 0); } catch (e) { /* */ }
        for (const q of A.stock) { X.props.remove(q.tg); if (q.laid) { W0.out.push(q.m); if (q.crack) X.props.remove(q.crack); } else X.props.remove(q.m); }
      },
      at() { return { x: WALL_X, y: yB + 2, z: zc }; },
      dbg() {
        const sc = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const q = A.cur; let tgt = null;
        if (q) { // the bot's aim: where the solution puts this stone
          let z = K.gap[0]; for (const L of K.sol) { if (L === q.L) { tgt = sc(WALL_X, yB + CH / 2, K.z0 + z + L / 2); A.ta = z; break; } z += L; } }
        return { phase: A.phase, lv, sol: K.sol, gap: K.gap, below: K.below, set: A.set.map((s2) => [s2.a, s2.b, s2.q.L]), stock: A.stock.filter((s2) => !s2.laid).map((s2) => ({ L: s2.L, scr: sc(s2.m.position.x, s2.m.position.y + CH / 2, s2.m.position.z) })), cur: q ? q.L : 0, tgt, ta: q ? A.ta : null, gapB: q ? +(q.m.position.y - CH / 2 - yB).toFixed(2) : null, dz: q ? +(relZ(q.m.position.z) - q.L / 2).toFixed(2) : null, sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2), v: +A.v.toFixed(2), joj: A.joj, lifts: A.lifts, chips: A.chips, grades: A.grades.slice() };
      },
    };
  },
};

/* ───────── 3.7 the great stone: from the quarry, along the road, onto the west wall's great course ───────── */
// ── h114 ── (ירון 9.11: "האבן חייבת להיכנס לקיר ולהישאר") its course is the world's own west wall: its face flush with the wall's (x −300),
// the crews' great stones already lying on beyond it; it slides off the rollers into the gap against them and stays ── /h114 ──
const GR = { x: -298.1, zEnd: -150, len: 27, h: 3.4, d: 3.6, sp: 3.5 };
const ROAD = [[200, -196], [150, -230], [40, -240], [-80, -230], [-200, -205], [-298.1, -205]];
const GR_NEXT = [12, 10];   // the crews' stones beyond it, in the same course
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
function greatMesh(X, L) { const T = X.THREE; const m = new T.Mesh(new T.BoxGeometry(GR.d, GR.h, L), greatStoneMat(X)); m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); return m; }
function roadAt(u) {
  // u 0..1 along ROAD then the last stretch north→south along x = −262 to the end
  const pts = ROAD.concat([[GR.x, GR.zEnd]]); let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let d = clamp(u, 0, 1) * L; for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return { x: lerp(pts[i][0], pts[i + 1][0], k), z: lerp(pts[i][1], pts[i + 1][1], k), yaw: Math.atan2(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) }; } d -= seg[i]; }
  return { x: GR.x, z: GR.zEnd, yaw: 0 };
}
function roadLen() { const pts = ROAD.concat([[GR.x, GR.zEnd]]); let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function roadMesh(X) {
  const T = X.THREE, pts = ROAD.concat([[GR.x, GR.zEnd]]), pos = [], idx = []; let n = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], L = Math.hypot(x1 - x0, z1 - z0), ux = (x1 - x0) / L, uz = (z1 - z0) / L, px = -uz * 3.2, pz = ux * 3.2, k = Math.ceil(L / 4);
    for (let j = 0; j <= k; j++) { const x = lerp(x0, x1, j / k), z = lerp(z0, z1, j / k); pos.push(x + px, X.ground(x + px, z + pz) + 0.08, z + pz, x - px, X.ground(x - px, z - pz) + 0.08, z - pz); if (j) idx.push(n - 2, n - 1, n, n - 1, n + 1, n); n += 2; }
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, new T.MeshStandardMaterial({ color: '#D8C79E', roughness: 1, transparent: true, opacity: 0.8, depthWrite: false })); m.renderOrder = 1; m.receiveShadow = true; X.props.root.add(m); return m;
}
export const GREAT = {
  icon: '🪵', title: 'האבן הגדולה',
  walkLine: () => 'האבן הגדולה הגיעה מהמחצבה: עזרו לגלגל אותה אל הנדבך הגדול',
  stand(m, X) { const z0 = GR.zEnd - GREAT.travel(X) - GR.len / 2; return { x: GR.x + 4.5, z: z0 - 3, face: [GR.x, z0 + 3] }; },
  travel(X) { return GR.sp * [6, 9, 12][X.level() - 1]; },
  prepare(m, X) { SH.greatU = 1 - (GREAT.travel(X)) / roadLen(); },
  make(m, X) {
    const lv = X.level(), T = X.THREE, N = [6, 9, 12][lv - 1], travel = GR.sp * N;
    const A = { zs: GR.zEnd - travel, v: 0, rollers: [], moved: 0, gaps: 0, grades: [], drag: null, halt: 0, t: 0, phase: 'roll', crewTake: 0 };
    const S = SH.great; S.position.set(GR.x, 0, A.zs); S.rotation.y = 0;
    const g0 = (z) => X.ground(GR.x, z);
    // the rollers under it (7 across its length) — they roll at half its speed; one comes out behind every few seconds
    const logG = new T.CylinderGeometry(0.55, 0.55, GR.d + 1.8, 10); logG.rotateZ(Math.PI / 2);
    for (let i = 0; i < 8; i++) { const m2 = new T.Mesh(logG, X.props.M.wood); m2.castShadow = true; X.props.root.add(m2); A.rollers.push({ m: m2, z: A.zs - GR.len / 2 + 1 + i * GR.sp, st: 'under', vz: 0 }); }
    // the crew: 8 pullers on two ropes in front, the drummer on the beat, porters with spare rollers
    const pullers = []; for (let i = 0; i < 8; i++) pullers.push(SH.crew.add(GR.x + (i % 2 ? 2.2 : -2.2), A.zs + GR.len / 2 + 4 + Math.floor(i / 2) * 2.4, { role: 'pull', item: 'rope', fx: GR.x, fz: A.zs, off: (i % 4) * 0.03, crew: i % 4 }));
    const drummer = SH.crew.add(GR.x + 6, A.zs + GR.len / 2 + 2, { role: 'hammer', item: 'mallet', k: 1, fx: GR.x + 6, fz: A.zs + 30, crew: 2 });
    const ropes = [X.props.rope(16, 0.07), X.props.rope(16, 0.07)];
    // ── h114 ── (ירון 9.11: "המסך קופץ"; "רואים רק את העיר") placed once, then followed smoothly: from the Mount's side, high,
    // looking down and along — the stone, its rollers and the road ahead fill the frame, the wall's edge beside ── /h114 ──
    function shot(first) { const zc = A.zs, p = [GR.x + 30, g0(zc) + 33, zc + 1], t = [GR.x - 3, g0(zc) - 1, zc + 2];   /* (its whole length: the free rollers come out behind, go in before) */ if (first) X.shot(p, t, 1.0); else X.track(p, t, 1.4); }
    function front() { let f = -1e9; for (const r of A.rollers) if (r.st === 'under') f = Math.max(f, r.z); return f; }
    function pickRoller(p) {
      let best = null, bd = 80; for (const r of A.rollers) { if (r.st !== 'out') continue; const q = X.scr(GR.x, r.m.position.y, r.z); if (!q.on) continue; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = r; } }
      return best;
    }
    function gap() {
      // the stone ran off its front roller: it tips and slides back a roller's length, the song stops, the crew rests
      A.gaps++; A.halt = 2; A.zs -= GR.sp * 0.8; X.play('grind'); X.shake(0.3, 0.5); X.dust(GR.x, g0(A.zs) + 0.5, A.zs + GR.len / 2, 16, 4);
      for (const r of A.rollers) if (r.st === 'under') r.z -= GR.sp * 0.4;
      X.word({ x: GR.x, y: g0(A.zs) + GR.h + 2, z: A.zs + GR.len / 2 }, A.gaps >= 3 ? 'שלושה רווחים: הצוות משתלט' : 'רווח! האבן החליקה אחורה');
      if (A.gaps >= 3) { A.phase = 'crew'; X.line('הצוות משלים את הדרך במוטות'); }
    }
    function arrive(lost) {
      // ── h114 ── (ירון 9.11: "'בתוך הבית' נגמר מיד") it comes off the rollers and slides down into its bed against the crews' stone,
      // the dust of it; the camera stays on it five seconds, then it stays there for good ── /h114 ──
      A.phase = 'seat'; A.seatT = 0;
      const at = { x: GR.x, y: g0(GR.zEnd) + GR.h + 2, z: GR.zEnd };
      X.play('grind'); X.line('הצוות שומט את הגלילים · האבן יורדת למקומה');
      SH.greatDone = true;
      const q = lost ? 0 : A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / Math.max(1, A.grades.length) * (A.gaps ? 0.85 : 1);
      X.shot([GR.x + 20, g0(GR.zEnd) + 11, GR.zEnd - 30], [GR.x, g0(GR.zEnd) + 1.5, GR.zEnd + 4], 1.6);
      A.arrive = () => {
        X.play('settle'); X.shake(0.45, 0.8); X.dust(GR.x, g0(GR.zEnd) + 0.5, GR.zEnd, 30, 8); X.dust(GR.x, g0(GR.zEnd) + 0.5, GR.zEnd + GR.len / 2, 20, 5);
        if (!lost) { X.bonus(300, 'great', 'האבן הגדולה במקומה'); if (!A.gaps && A.grades.every((g) => g === 'gold')) X.perfect('בול! האבן הגדולה בחומה', at); }
        else X.word(at, 'הצוות הניח · האבן עומדת בנדבך');
        X.line('האבן הגדולה בכותל המערבי: כ־13.6 מטר (מנהרות הכותל)');
      };
      setTimeout(() => X.end({ q, lost, stars: lost ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 7600);
    }
    return {
      begin() { shot(true); X.line('גררו גליל אל לפני האבן'); try { X.hero.setPos(GR.x + 4.5, A.zs - GR.len / 2 - 2.5, 0); } catch (e) { /* */ } },
      update(dt) {
        A.t += dt;
        if (A.phase === 'roll' || A.phase === 'crew') {
          const speed = A.phase === 'crew' ? 2.4 : (1.3 + A.moved * 0.05) * (A.halt > 0 ? 0 : 1);
          A.halt = Math.max(0, A.halt - dt);
          A.v = lerp(A.v, speed, 1 - Math.exp(-dt * 2));
          A.zs += A.v * dt;
          for (const r of A.rollers) {
            if (r.st === 'under') { r.z += A.v * 0.5 * dt; if (r.z < A.zs - GR.len / 2 - 0.2) { r.st = 'out'; r.vz = -A.v * 0.6; X.play('wood'); if (A.moved === 0) X.hand({ x: GR.x, y: g0(r.z) + 1, z: r.z }, 0, -50); } }
            else if (r.st === 'out') { r.z += r.vz * dt; r.vz *= Math.exp(-dt * 1.5); if (A.phase === 'crew') { r.st = 'under'; r.z = front() + GR.sp; } }
          }
          // the front: no roller under the last stretch → a gap
          const f = front(); if (A.phase === 'roll' && A.zs + GR.len / 2 - f > GR.sp * 1.6) gap();
          if (A.zs >= GR.zEnd) { A.zs = GR.zEnd; arrive(A.phase === 'crew'); }
          // the crew walks with the stone
          pullers.forEach((w, i) => { const z = A.zs + GR.len / 2 + 4 + Math.floor(i / 2) * 2.4; w.a.path = [[GR.x + (i % 2 ? 2.2 : -2.2), z + 0.3]]; w.a.pi = 0; w.a.speed = Math.max(0.3, A.v); w.fz = A.zs; });
          drummer.a.path = [[GR.x + 6, A.zs + GR.len / 2 + 2]]; drummer.a.pi = 0; drummer.a.speed = Math.max(0.3, A.v);
          if (A.phase === 'roll' || A.phase === 'crew') shot();
        }
        const gy = g0(A.zs);
        if (A.phase === 'seat') {
          // (rollers out from under it, one by one; it settles down onto the bed)
          A.seatT += dt; const k = ease(clamp((A.seatT - 0.6) / 1.4, 0, 1));
          S.position.set(GR.x, gy + GR.h / 2 + 1.1 * (1 - k), A.zs);
          for (const [i, r] of A.rollers.entries()) if (r.st === 'under' && A.seatT > 0.2 + i * 0.12) { r.st = 'gone'; r.vz = 0; }
          for (const r of A.rollers) if (r.st === 'gone') { r.m.position.x += dt * 9; r.m.rotation.x += dt * 4; }
          if (k >= 1 && !A.seated) { A.seated = true; A.arrive(); }
          return;
        }
        S.position.set(GR.x, gy + 1.1 + GR.h / 2, A.zs);
        for (const r of A.rollers) {
          if (A.drag && A.drag.r === r) continue; r.m.position.set(GR.x, X.ground(GR.x, r.z) + 0.55, r.z); r.m.rotation.x = r.z * 1.6;
          // ── h114 ── (ירון 9.11: "לא ברור מה עושים") the free roller behind glows: that is the one to take ── /h114 ──
          if (r.st === 'out') { if (!r.glow) { r.glow = r.m.material = X.props.M.wood.clone(); r.glow.emissive = new T.Color('#FFB830'); } r.glow.emissiveIntensity = 0.35 + 0.35 * Math.sin(A.t * 6); }
          else if (r.glow) { r.m.material = X.props.M.wood; r.glow.dispose(); r.glow = null; }
        }
        if (A.drag) {
          // the kohen carries it in his arms along the stone and lays it down before it
          const r = A.drag.r; r.z += (A.drag.tz - r.z) * (1 - Math.exp(-dt * 3.5));
          let hz = r.z; try { const h = X.stages.heroXYZ({}); if (h) { const dz = r.z - h.z, dx = GR.x + GR.d / 2 + 1.6 - h.x; const d = Math.hypot(dx, dz); if (d > 0.4) X.hero.drive((dx / d) * Math.min(7, d * 3), (dz / d) * Math.min(7, d * 3)); else X.hero.drive(0, 0); hz = h.z; } } catch (e) { /* */ }
          r.m.position.set(GR.x + GR.d / 2 + 0.7, X.ground(GR.x, r.z) + 2.4, lerp(r.z, hz, 0.5)); r.m.rotation.x = 0;
        } else if (A.phase === 'roll') { try { X.hero.drive(0, 0); } catch (e) { /* */ } }
        for (let k = 0; k < 2; k++) { const s = k ? 1 : -1, a = { x: GR.x + s * 1.2, y: gy + 2.2, z: A.zs + GR.len / 2 }, w = pullers[6 + k] ? pullers[6 + k].a : null; if (w) ropes[k].set(a, { x: w.x, y: X.ground(w.x, w.z) + 1.6, z: w.z }, 0.2); }
      },
      down(p) { if (A.phase !== 'roll') return; const r = pickRoller(p); if (!r) return; A.drag = { r, tz: r.z, t0: A.t }; X.hand(null); X.play('wood'); X.line('הכהן נושא את הגליל · הניחו אותו לפני האבן'); },
      move(p) { const D = A.drag; if (!D) return; const g = onPlane(X, p.x, p.y, g0(A.zs) + 1.2); if (g) D.tz = g.z; },
      up() {
        const D = A.drag; if (!D) return; A.drag = null; const r = D.r; r.z = D.tz;   /* (laid where the finger let go: he has carried it there) */
        const fr = A.zs + GR.len / 2, f = front(), ideal = Math.max(f + GR.sp, fr - 0.5);
        X.line('גררו את הגליל הזוהר אל לפני האבן');
        if (r.z > fr - GR.sp * 1.2 && r.z < fr + 6) {
          const err = Math.abs(r.z - ideal), grade = err <= 1 ? 'gold' : err <= 2.2 ? 'good' : 'ok';
          r.z = Math.min(r.z, fr + 1); r.st = 'under'; A.moved++; A.grades.push(grade);
          X.hit({ x: GR.x, y: g0(r.z) + 2, z: r.z }, grade, { text: '', craft: 'מושכים' }); X.play('wood');
          X.count({ x: GR.x, y: g0(A.zs) + GR.h + 3.5, z: A.zs }, `${A.moved}/${N}`);
        } else { r.st = 'out'; X.word({ x: GR.x, y: g0(r.z) + 1.5, z: r.z }, 'לפני האבן!'); }
      },
      end() { S.position.set(GR.x, g0(GR.zEnd) + GR.h / 2, GR.zEnd); for (const r of A.rollers) X.props.remove(r.m); for (const w of pullers) SH.crew.remove(w); SH.crew.remove(drummer); for (const r of ropes) r.dispose(); X.count(null); },
      at() { return { x: GR.x, y: g0(A.zs) + GR.h + 1, z: A.zs }; },
      dbg() { const sc = (z) => { const q = X.scr(GR.x, g0(z) + 0.6, z); return [Math.round(q.x), Math.round(q.y)]; }; return { phase: A.phase, zs: +A.zs.toFixed(1), moved: A.moved, N, gaps: A.gaps, out: A.rollers.filter((r) => r.st === 'out').map((r) => sc(r.z)), frontScr: sc(A.zs + GR.len / 2 + 1.5), front: +front().toFixed(1) }; },
    };
  },
};

/* ───────── 3.8 "לבית התקיעה": the two words carved, letter by letter ───────── */
const LET = { x: -276, z: 372 };
// the strokes of each letter in a 100 × 140 box (y down; the lamed rises above, the qof goes below): a square script, illustration
const GLYPH = {
  'ל': [[[22, -12], [22, 44], [80, 44], [82, 92], [48, 136]]],
  'ב': [[[10, 30], [80, 30], [88, 42], [88, 126], [6, 126]]],
  'י': [[[38, 30], [64, 30], [64, 72]]],
  'ת': [[[8, 30], [84, 30], [90, 42], [90, 132]], [[26, 30], [26, 132], [12, 134]]],
  'ה': [[[8, 30], [88, 30], [90, 132]], [[22, 70], [22, 132]]],
  'ק': [[[8, 30], [88, 30], [90, 100]], [[20, 70], [20, 170]]],
  'ע': [[[14, 30], [62, 106]], [[86, 30], [82, 96], [52, 126], [6, 130]]],
};
const WORDS = ['לבית', 'התקיעה'];
// the face looks north-east; the kohen stands at its right end (where the first letter is), a step in front — never between the camera and the words
const LET_FA = Math.atan2(4.2, -3.2);
function letStand() { const nx = Math.sin(LET_FA), nz = Math.cos(LET_FA), sx = Math.cos(LET_FA), sz = -Math.sin(LET_FA); return { x: LET.x + nx * 1.3 + sx * 4.7, z: LET.z + nz * 1.3 + sz * 4.7, tx: LET.x + nx * 0.9 + sx * 3.3, tz: LET.z + nz * 0.9 + sz * 3.3 }; }
export const LETTERS = {
  icon: '✍', title: 'לבית התקיעה',
  walkLine: () => 'הפינה הדרומית-מערבית: חורטים "לבית התקיעה"',
  stand(m, X) { const p = letStand(); return { x: p.x, z: p.z, face: [LET.x, LET.z] }; },
  prepare() {},
  make(m, X) {
    const lv = X.level(), T = X.THREE, gy = X.ground(LET.x, LET.z);
    const cw = 2048, ch = 640, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const cx = cv.getContext('2d');
    const base = document.createElement('canvas'); base.width = cw; base.height = ch; const bx = base.getContext('2d');
    // the stone's face: dressed limestone with its drafted margin
    bx.fillStyle = '#CDBF9E'; bx.fillRect(0, 0, cw, ch); for (let i = 0; i < 2600; i++) { bx.fillStyle = `rgba(${90 + Math.random() * 60},${80 + Math.random() * 50},${60 + Math.random() * 40},${Math.random() * 0.08})`; bx.fillRect(Math.random() * cw, Math.random() * ch, 2 + Math.random() * 6, 2 + Math.random() * 6); }
    bx.strokeStyle = 'rgba(80,64,40,.35)'; bx.lineWidth = 10; bx.strokeRect(36, 36, cw - 72, ch - 72);
    const carved = document.createElement('canvas'); carved.width = cw; carved.height = ch; const kx = carved.getContext('2d');
    const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace || tex.colorSpace; tex.anisotropy = 4;
    const FW = 7.2, FH = FW * ch / cw;
    const blk = stoneMesh(X, FW + 0.4, FH + 0.5, 1.6); blk.position.set(LET.x, gy + (FH + 0.5) / 2, LET.z);
    const face = new T.Mesh(new T.PlaneGeometry(FW, FH), new T.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.9 }));
    // the face looks at the kohen's side (north-east)
    const fa = LET_FA; blk.rotation.y = fa; face.rotation.y = fa; face.position.set(LET.x + Math.sin(fa) * 0.84, gy + (FH + 0.5) / 2, LET.z + Math.cos(fa) * 0.84); X.props.root.add(face);
    // the layout: right to left, letter boxes of 100 + 22, the words apart
    const S = 1.4, top = 205; const L = []; let x = cw - 132;
    WORDS.forEach((w, wi) => { for (const ch2 of w) { L.push({ ch: ch2, w: wi, x0: x - 100 * S, done: false, grade: null, cov: null, path: [] }); x -= 122 * S; } x -= 80 * S; });
    const toC = (p, Lt) => [Lt.x0 + p[0] * S, top + p[1] * S];
    // every letter's guide: points along its strokes every 6 units
    for (const Lt of L) { Lt.pts = []; for (const st of GLYPH[Lt.ch]) for (let i = 0; i < st.length - 1; i++) { const a = st[i], b = st[i + 1], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6); for (let k = 0; k <= n; k++) Lt.pts.push(toC([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)], Lt)); } Lt.cov = new Uint8Array(Lt.pts.length); }
    const A = { i: 0, drag: false, last: null, tick: 0, flash: 0, word: 0, t: 0, dev: [], fixes: [0, 0], strokeAcc: 0 };
    function draw() {
      cx.drawImage(base, 0, 0);
      // the dotted guide: the word being carved (L3: the second word has none)
      for (const Lt of L) {
        if (Lt.done || (lv >= 3 && Lt.w === 1) || Lt.w !== A.word) continue;
        cx.save(); cx.setLineDash([3, 14]); cx.lineCap = 'round'; cx.lineWidth = L.indexOf(Lt) === A.i ? 9 : 6; cx.strokeStyle = L.indexOf(Lt) === A.i ? 'rgba(120,70,10,.9)' : 'rgba(90,60,30,.45)';
        for (const st of GLYPH[Lt.ch]) { cx.beginPath(); st.forEach((p, k) => { const c = toC(p, Lt); k ? cx.lineTo(c[0], c[1]) : cx.moveTo(c[0], c[1]); }); cx.stroke(); } cx.restore();
      }
      cx.drawImage(carved, 0, 0);
      if (A.flash > 0) { const Lt = L[A.flashI]; cx.save(); cx.globalAlpha = Math.min(1, A.flash); cx.lineWidth = 22; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#FFD66E'; cx.shadowColor = '#FFB020'; cx.shadowBlur = 30; for (const st of GLYPH[Lt.ch]) { cx.beginPath(); st.forEach((p, k) => { const c = toC(p, Lt); k ? cx.lineTo(c[0], c[1]) : cx.moveTo(c[0], c[1]); }); cx.stroke(); } cx.restore(); }
      tex.needsUpdate = true;
    }
    function groove(a, b, w = 18) { kx.save(); kx.lineCap = 'round'; kx.lineJoin = 'round'; kx.strokeStyle = 'rgba(58,40,22,.92)'; kx.lineWidth = w; kx.beginPath(); kx.moveTo(a[0], a[1]); kx.lineTo(b[0], b[1]); kx.stroke(); kx.strokeStyle = 'rgba(255,240,210,.35)'; kx.lineWidth = 4; kx.beginPath(); kx.moveTo(a[0] + 5, a[1] + 6); kx.lineTo(b[0] + 5, b[1] + 6); kx.stroke(); kx.restore(); }
    const ray = new T.Raycaster();
    function canvasAt(p) { const hits = X.rayAt(p.x, p.y).intersectObject(face, false); if (!hits.length || !hits[0].uv) return null; const u = hits[0].uv; return [u.x * cw, (1 - u.y) * ch]; }
    // canvas px → screen px (for the deviation in screen pixels, as the spec counts it)
    function pxScale() { const a = face.localToWorld(new T.Vector3(-FW / 2, 0, 0)), b = face.localToWorld(new T.Vector3(FW / 2, 0, 0)); const qa = X.scr(a.x, a.y, a.z), qb = X.scr(b.x, b.y, b.z); return Math.hypot(qb.x - qa.x, qb.y - qa.y) / cw; }
    function shot() {
      // the word in the frame: the macro shot (ש4), the letters ≥ 120 px
      const ws = L.filter((Lt) => Lt.w === A.word), xa = ws[0].x0 + 100 * S, xb = ws[ws.length - 1].x0; const uc = ((xa + xb) / 2) / cw - 0.5, vc = 0.5 - (top + 70 * S) / ch;
      const c = face.localToWorld(new T.Vector3(uc * FW, vc * FH, 0)); const n = new T.Vector3(Math.sin(fa), 0, Math.cos(fa));
      const wid = (xa - xb) / cw * FW; const hf = 2 * Math.atan(Math.tan((X.camera.fov * Math.PI / 180) / 2) * X.camera.aspect); const d = (wid / 0.82) / (2 * Math.tan(hf / 2));
      X.shot([c.x + n.x * d - Math.cos(fa) * 0.0, c.y + d * 0.18, c.z + n.z * d], [c.x, c.y, c.z], 1.0);
    }
    function letterDone(Lt) {
      const sc = pxScale(), devPx = (Lt.devSum / Math.max(1, Lt.devN)) * sc;
      let grade = devPx <= 8 ? 'gold' : devPx <= 16 ? 'good' : devPx <= 24 ? 'ok' : 'fix';
      Lt.done = true; const c = toC([50, 70], Lt); const w = face.localToWorld(new T.Vector3((c[0] / cw - 0.5) * FW, (0.5 - c[1] / ch) * FH, 0.1));
      if (grade === 'fix') {
        // the master corrects it (seen: the clean groove over the crooked one) — the letter counts 0
        A.fixes[Lt.w]++; X.word(w, 'רב האומנים מתקן'); grade = 'ok'; Lt.grade = 'fix';
        for (const st of GLYPH[Lt.ch]) for (let i = 0; i < st.length - 1; i++) groove(toC(st[i], Lt), toC(st[i + 1], Lt), 16);
      } else { Lt.grade = grade; X.hit(w, grade, { text: '', craft: 'חורטים' }); for (const st of GLYPH[Lt.ch]) for (let i = 0; i < st.length - 1; i++) groove(toC(st[i], Lt), toC(st[i + 1], Lt), 12); }
      A.dev.push(devPx); A.flash = 1.2; A.flashI = L.indexOf(Lt);
      A.i++;
      const nx = L[A.i];
      if (!nx || nx.w !== Lt.w) {
        // the word is done
        const ok = A.fixes[Lt.w] < 2; if (ok) X.bonus(150, 'word', `"${WORDS[Lt.w]}"`); else X.word(w, 'פעמיים תיקון: המילה כשר');
        if (nx) { A.word = nx.w; setTimeout(shot, 700); X.line(lv >= 3 ? 'המילה השנייה — בלי קו מנוקד' : 'המילה השנייה: "התקיעה"'); }
        else finish();
      }
      draw();
    }
    function finish() {
      A.phase = 'done';
      const N = L.length, q = L.reduce((a, Lt) => a + (Lt.grade === 'gold' ? 1 : Lt.grade === 'good' ? 0.8 : Lt.grade === 'fix' ? 0 : 0.5), 0) / N;
      setTimeout(() => X.word({ x: LET.x, y: gy + 4, z: LET.z }, 'לבית התקיעה · חפירות ב. מזר, 1968'), 500);
      SH.lettersDone = true;
      const g = X.ground(LET.x, LET.z); X.shot([LET.x + 24, g + 14, LET.z - 22], [LET.x, g + 1.5, LET.z], 1.6);
      setTimeout(() => X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at: { x: LET.x, y: g + 3, z: LET.z } }), 2400);
    }
    function cover(Lt, c) { let hit = false; for (let k = 0; k < Lt.pts.length; k++) { const p = Lt.pts[k]; if (Math.hypot(p[0] - c[0], p[1] - c[1]) < 26) { Lt.cov[k] = 1; hit = true; } } return hit; }
    function devOf(Lt, c) { let d = 1e9; for (const p of Lt.pts) d = Math.min(d, Math.hypot(p[0] - c[0], p[1] - c[1])); return d; }
    draw();
    return {
      close: true,
      begin() { shot(); X.line('גררו על האות המנוקדת'); try { const sp = letStand(); X.hero.setPos(sp.x, sp.z, Math.atan2(LET.x - sp.x, LET.z - sp.z)); X.hero.arm('chisel', { x: sp.tx, y: gy + 1.2, z: sp.tz }); } catch (e) { /* */ } const Lt = L[0], c = toC(GLYPH[Lt.ch][0][0], Lt); const w = face.localToWorld(new T.Vector3((c[0] / cw - 0.5) * FW, (0.5 - c[1] / ch) * FH, 0.1)); X.hand(w, -30, 30); },
      update(dt) { A.t += dt; if (A.flash > 0) { A.flash = Math.max(0, A.flash - dt * 1.6); draw(); } },
      down(p) { if (A.phase === 'done') return; const c = canvasAt(p); if (!c) return; A.drag = true; A.last = c; A.acc = 0; X.hand(null); },
      move(p) {
        if (!A.drag) return; const Lt = L[A.i]; if (!Lt) return; const c = canvasAt(p); if (!c) return;
        const d = devOf(Lt, c); Lt.devSum = (Lt.devSum || 0) + Math.min(d, 80); Lt.devN = (Lt.devN || 0) + 1; cover(Lt, c);
        groove(A.last, c, 14); A.acc += Math.hypot(c[0] - A.last[0], c[1] - A.last[1]); A.last = c;
        if (A.acc > 12 / Math.max(0.05, pxScale())) { A.acc = 0; X.play('chisel'); const w = face.localToWorld(new T.Vector3((c[0] / cw - 0.5) * FW, (0.5 - c[1] / ch) * FH, 0.12)); X.dust(w.x, w.y, w.z, 1, 0.3); }
        draw();
      },
      up() {
        if (!A.drag) return; A.drag = false; const Lt = L[A.i]; if (!Lt) return;
        const cv2 = Lt.cov.reduce((a, b) => a + b, 0) / Lt.cov.length;
        if (cv2 >= 0.8) letterDone(Lt); else if (cv2 > 0) X.line(`עוד: האות ${Lt.ch} — ${Math.round(cv2 * 100)}% חרוט`);
      },
      end() { X.hero.arm && X.hero.arm(null); SH.letFace = face; SH.letBlk = blk; },
      at() { return { x: LET.x, y: gy + 2, z: LET.z }; },
      dbg() { const Lt = L[A.i]; const scr = (Lt2) => Lt2 ? GLYPH[Lt2.ch].map((st) => st.map((p) => { const c = toC(p, Lt2); const w = face.localToWorld(new T.Vector3((c[0] / cw - 0.5) * FW, (0.5 - c[1] / ch) * FH, 0.1)); const q = X.scr(w.x, w.y, w.z); return [Math.round(q.x), Math.round(q.y)]; })) : null; return { i: A.i, n: L.length, ch: Lt ? Lt.ch : null, strokes: scr(Lt), cov: Lt ? +(Lt.cov.reduce((a, b) => a + b, 0) / Lt.cov.length).toFixed(2) : null, grades: L.map((x) => x.grade), dev: A.dev.map((d) => +d.toFixed(1)), px: +pxScale().toFixed(3) }; },
    };
  },
};

export function initWorld3(X, sh) {
  SH = sh; const st = X.M.st, done = (id) => st.done.includes(id);
  SH.crane = makeCrane(X); SH.crane.place(CRANE_AT.x, CRANE_AT.z, Math.atan2(CORNER_AT.x - CRANE_AT.x, CORNER_AT.z - CRANE_AT.z) - 0.9); SH.crane.rope.show(false);
  // ── h114 ── the corner's trench is dug from the start (the crews dig it while he measures); the stone in it once it was laid ── /h114 ──
  SH.cornerPit = cornerPit(X, !done('corner'));
  if (done('corner')) { const s = stoneMesh(X, CW, 1.6, CDp); s.position.set(CORNER_AT.x, X.ground(CORNER_AT.x, CORNER_AT.z) - PIT + 0.8, CORNER_AT.z); SH.cornerStone = s; }
  // the east wall's courses as far as the crews and the kohen have laid them
  // ── h114 ── as he laid them (st.courseLay), the solution's order for an older save ── /h114 ──
  SH.courseW = {};
  for (let c = 0; c < 2; c++) {
    const CL = st.courseLay && st.courseLay[c], lv = CL ? CL.lv : 1, K = puzzleOf(c, lv);
    let laid = null; if (done('course' + c)) { if (CL && CL.laid) laid = CL.laid; else { laid = []; let z = K.gap[0]; for (const L of K.sol) { laid.push([z, z + L]); z += L; } } }
    SH.courseW[c] = courseWorld(X, c, lv, laid).out;
  }
  // the great stone: cut at the quarry, on its road, or in its course
  SH.road = roadMesh(X);
  SH.great = greatMesh(X, GR.len); SH.great.rotation.y = 0;
  // ── h114 ── the crews' great stones beyond its place, in the same course on the west wall's edge ── /h114 ──
  { let z = GR.zEnd + GR.len / 2 + 0.08; for (const L of GR_NEXT) { const m = greatMesh(X, L - 0.08); m.position.set(GR.x, X.ground(GR.x, z + L / 2) + GR.h / 2, z + L / 2); z += L; } }
  const iGreat = st.done.length;
  SH.greatPull = []; void iGreat;
  if (done('great')) { SH.great.position.set(GR.x, X.ground(GR.x, GR.zEnd) + GR.h / 2, GR.zEnd); SH.greatU = 1; }
  else SH.greatU = SH.greatU || 0;
}
/** the great stone's journey while the kohen works elsewhere: at the quarry until sector 7, then the crews pull it along the road */
export function frame3(dt, X, sh) {
  if (!SH || !SH.great || SH.greatDone) return;
  const st = X.M.st, m = X.M.mission(); if (!m) return;
  if (m.k === 'great' && X.mission && X.mission.k === 'great' && SH.greatU >= 0.99) return;
  const started = st.done.includes('pave5') || st.done.includes('rocks6');
  const want = !started ? 0 : m.k === 'great' ? 1 - (GR.sp * [6, 9, 12][X.level() - 1]) / roadLen() : Math.min(0.9, (st.done.includes('pave6') ? 0.55 : 0.2) + (st.done.includes('pave7') ? 0.3 : 0));
  SH.greatU += clamp(want - SH.greatU, -dt * 0.02, dt * 0.006);
  const p = roadAt(SH.greatU), q = roadAt(Math.min(1, SH.greatU + 0.002));
  SH.great.position.set(p.x, X.ground(p.x, p.z) + 1.1 + GR.h / 2, p.z); SH.great.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) || p.yaw;
  // its pullers walk with it while it moves
  const moving = Math.abs(want - SH.greatU) > 0.002;
  if (moving && SH.greatPull.length === 0) for (let i = 0; i < 6; i++) SH.greatPull.push(SH.crew.add(p.x, p.z, { role: 'pull', item: 'rope', crew: i % 4 }));
  if (!moving && SH.greatPull.length) { for (const w of SH.greatPull) SH.crew.remove(w); SH.greatPull = []; }
  SH.greatPull.forEach((w, i) => { const f = roadAt(Math.min(1, SH.greatU + (GR.len / 2 + 4 + Math.floor(i / 2) * 2.4) / roadLen())); const s = i % 2 ? 2 : -2, yaw = f.yaw; w.a.path = [[f.x + Math.cos(yaw) * s, f.z - Math.sin(yaw) * s]]; w.a.pi = 0; w.a.speed = 2; w.fx = p.x; w.fz = p.z; });
  void sh; void ease;
}
export { makeCrane, CORNER_AT, CRANE_AT, GR, LET };
