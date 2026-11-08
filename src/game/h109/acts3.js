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
  const C = { g, wheel, slew, tipL, R, mastH, jibL, ang: 0, yaw: 0, rope: P.rope(10, 0.05), tip: new T.Vector3(), base: { x: 0, z: 0 } };
  C.place = (x, z, yaw) => { g.position.set(x, X.ground(x, z), z); g.rotation.y = yaw; C.base.x = x; C.base.z = z; C.yaw = yaw; };
  /** the jib pointed at (x, z): the slew angle about the mast */
  C.aim = (x, z, k = 1) => { const mx = C.base.x + Math.sin(C.yaw) * 2.2, mz = C.base.z + Math.cos(C.yaw) * 2.2; const want = Math.atan2(x - mx, z - mz) - C.yaw; let d = Math.atan2(Math.sin(want - C.slew.rotation.y), Math.cos(want - C.slew.rotation.y)); C.slew.rotation.y += d * k; };
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
const CORNER_AT = { x: 270.5, z: 92 }, CRANE_AT = { x: 263, z: 99 }, STOCK = { x: 259.5, z: 88.5 };
export const CORNER = {
  icon: '🏗', title: 'אבן הפינה',
  walkLine: () => 'גלגל הדריכה ליד הפינה: מרימים את אבן הפינה',
  stand(m, X) { return { x: CRANE_AT.x, z: CRANE_AT.z, face: [CRANE_AT.x + 1, CRANE_AT.z], mx: CRANE_AT.x - 1.5, mz: CRANE_AT.z + 3.5 }; },
  prepare(m, X) { SH.crane.place(CRANE_AT.x, CRANE_AT.z, Math.atan2(CORNER_AT.x - CRANE_AT.x, CORNER_AT.z - CRANE_AT.z) - 0.9); },
  make(m, X) {
    const lv = X.level(), T = X.THREE, C = SH.crane, gP = X.ground(CORNER_AT.x, CORNER_AT.z), sw = 2.4;
    const A = { phase: 'lift', h: 0, hMax: 5, w: 0, taps: [], grades: [], v: 0, hold: false, ax: 0, sway: { x: 0, z: 0, vx: 0, vz: 0 }, chips: 0, rejects: 0, t: 0, lastSw: 0, p0: null, slewT: 0 };
    const stone = stoneMesh(X, sw, 1.6, 2.0); const sh = shadowDisk(X);
    const mark = X.props.ringAt(CORNER_AT.x, CORNER_AT.z, 1.5, 0.12, X.props.M.gold);
    const tip = new T.Vector3(), pos = new T.Vector3(STOCK.x, X.ground(STOCK.x, STOCK.z) + 0.8, STOCK.z);
    const crew = [SH.crew.add(CRANE_AT.x - 2.2, CRANE_AT.z + 1.2, { role: 'push', fx: CRANE_AT.x, fz: CRANE_AT.z, crew: 1 }), SH.crew.add(CORNER_AT.x + 1.5, CORNER_AT.z + 3.2, { role: 'hold', item: 'mallet', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 2 }), SH.crew.add(CORNER_AT.x - 2.5, CORNER_AT.z - 3, { role: 'point', fx: CORNER_AT.x, fz: CORNER_AT.z, crew: 0 })];
    function shotSide() { const mx = (CRANE_AT.x + CORNER_AT.x) / 2, mz = (CRANE_AT.z + CORNER_AT.z) / 2, dx = CORNER_AT.x - CRANE_AT.x, dz = CORNER_AT.z - CRANE_AT.z, L = Math.hypot(dx, dz), px = -dz / L, pz = dx / L, g = X.ground(mx, mz); X.shot([mx + px * 30 - dx * 0.3, g + 10, mz + pz * 30 - dz * 0.3], [mx + dx * 0.15, g + 6.5, mz + dz * 0.15], 1.0); }
    function stonePos(dt) {
      C.tipWorld(tip);
      // the pendulum (L2+): the stone swings under the tip; the wind at L3
      const S = A.sway, Lr = Math.max(1.5, tip.y - pos.y), w2 = 9.8 / Lr;
      const wind = lv >= 3 ? Math.sin(A.t * 0.7) * 0.6 : 0;
      S.vx += (-w2 * S.x + wind) * dt; S.vz += -w2 * S.z * dt; S.vx *= Math.exp(-dt * (lv >= 2 ? 0.05 : 2.5)); S.vz *= Math.exp(-dt * (lv >= 2 ? 0.05 : 2.5));
      S.x += S.vx * dt; S.z += S.vz * dt;
      const along = { x: Math.cos(C.yaw), z: -Math.sin(C.yaw) };
      pos.x = tip.x + S.x + along.x * A.ax; pos.z = tip.z + S.z + along.z * A.ax;
      const top = tip.y - 1.2; pos.y = A.phase === 'lift' ? X.ground(STOCK.x, STOCK.z) + 0.8 + A.h : top - A.drop;
      stone.position.copy(pos); stone.rotation.y = C.yaw + C.slew.rotation.y;
      C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: pos.x, y: pos.y + 0.8, z: pos.z }, 0);
      const gy = X.ground(pos.x, pos.z), hh = pos.y - 0.8 - gy; sh.position.set(pos.x, gy + 0.06, pos.z); const k = 1 + hh * 0.18; sh.scale.set(1.5 * k, 1.2 * k, 1); sh.material.opacity = clamp(0.5 - hh * 0.04, 0.08, 0.5);
    }
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
        if (A.chips >= 2) { A.rejects++; A.chips = 0; wasteAdd(X, 1, at); restart(); }
        return false;
      }
      const grade = d <= 0.05 ? 'gold' : d <= 0.12 ? 'good' : 'ok';
      A.grades.push(A.chips ? (grade === 'gold' ? 'good' : grade) : grade);
      pos.set(CORNER_AT.x + (pos.x - CORNER_AT.x) * (grade === 'ok' ? 1 : 0.4), gy + 0.8, CORNER_AT.z + (pos.z - CORNER_AT.z) * (grade === 'ok' ? 1 : 0.4)); stone.position.copy(pos);
      X.play('settle'); X.dust(pos.x, gy + 0.2, pos.z, 16, 3); X.shake(0.2, 0.35);
      X.hit(at, A.grades[A.grades.length - 1], { text: grade === 'gold' ? 'מהודר' : '', craft: 'בנאים' });
      if (vT < 0.8) X.bonus(20, 'soft', 'נגיעה רכה');
      A.phase = 'done'; SH.cornerSet = true;
      setTimeout(() => X.word({ x: CORNER_AT.x, y: gy + 4, z: CORNER_AT.z }, 'אבן מאסו הבונים היתה לראש פינה (תהלים קיח, כב)'), 600);
      const q = A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length;
      setTimeout(() => X.end({ q: A.rejects ? Math.min(q, 0.6) : q, stars: A.rejects ? 1 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 2200);
      return true;
    }
    function restart() {
      A.phase = 'reject'; X.line('הצוות מוריד את האבן לפסולת ומביא אחרת');
      setTimeout(() => { A.phase = 'lift'; A.h = 0; A.drop = 0; A.ax = 0; A.sway.x = A.sway.z = A.sway.vx = A.sway.vz = 0; X.line('שוב: החלקות למטה בקצב — הגלגל מרים'); }, 3500);
    }
    return {
      begin() {
        A.drop = 0; try { X.hero.setPos(CRANE_AT.x, CRANE_AT.z, C.yaw + Math.PI / 2); } catch (e) { /* */ }
        shotSide(); X.line('החליקו למטה בקצב (2 בשנייה): כל החלקה — צעד בגלגל, והאבן עולה');
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
          A.slewT += dt; C.aim(CORNER_AT.x, CORNER_AT.z, 1 - Math.exp(-dt * 2.2)); A.drop = 0;
          if (lv >= 2 && A.slewT < 0.1) A.sway.vx = 1.4;
          if (A.slewT > 1.8) { A.phase = 'lower'; X.line('החזיקו — מורידים · שחררו — עוצרים · גררו קצת הצידה ליישור'); X.hand({ x: CORNER_AT.x, y: gP + 1, z: CORNER_AT.z }, 0, 0); }
        } else if (A.phase === 'lower') {
          C.tipWorld(tip);
          A.v = A.hold ? Math.min(2.6, A.v + dt * 3) : Math.max(0, A.v - dt * 12);
          A.drop += A.v * dt;
          C.wheel.rotation.x += A.v * dt / C.R * 3.2;
          const bottom = tip.y - 1.2 - A.drop - 0.8;
          if (bottom <= gP + 0.02) { A.drop = tip.y - 1.2 - 0.8 - gP; if (!settle(A.v)) { A.v = 0; } }
        }
        if (A.phase !== 'done') stonePos(dt);
      },
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: performance.now() / 1000, ax: A.ax };
        if (A.phase === 'lower') { A.hold = true; X.hand(null); X.play('rope'); }
      },
      move(p) { if (A.phase === 'lower' && A.p0) A.ax = clamp(A.p0.ax + (p.x - A.p0.x) * 0.012, -1.6, 1.6); },
      up(p) {
        const P0 = A.p0; A.p0 = null; A.hold = false;
        if (A.phase === 'lift' && P0 && p.y - P0.y >= 40 && performance.now() / 1000 - P0.t <= 0.45) { swipe(); X.hand(null); }
      },
      end() { X.props.remove(mark); X.props.remove(sh); C.rope.show(false); for (const w of crew) SH.crew.remove(w); if (!SH.cornerSet) X.props.remove(stone); else SH.cornerStone = stone; },
      at() { return { x: CORNER_AT.x, y: gP + 2, z: CORNER_AT.z }; },
      dbg() { C.tipWorld(tip); return { phase: A.phase, h: +A.h.toFixed(2), v: +A.v.toFixed(2), drop: +(A.drop || 0).toFixed(2), gap: +(tip.y - 1.2 - (A.drop || 0) - 0.8 - gP).toFixed(2), swing: +Math.hypot(A.sway.vx, A.sway.vz).toFixed(2), dx: +(Math.hypot(pos.x - CORNER_AT.x, pos.z - CORNER_AT.z) / sw).toFixed(3), chips: A.chips, rejects: A.rejects, grades: A.grades.slice(-6), ax: +A.ax.toFixed(2), sway: +Math.hypot(A.sway.x, A.sway.z).toFixed(2) }; },
    };
  },
};

/* ───────── 3.6 the course of the east retaining wall ───────── */
const WALL_X = 272;
// each course mission: the gap in the kohen's course and the joints of the course under it (only one order of two lengths keeps clear)
const COURSES = [{ z0: 54, gap: [3.5, 10.5], below: [-2, 1.5, 6.5, 12, 16], crew2: [[-2, 3.5], [10.5, 16]] }, { z0: 116, gap: [3.5, 10.5], below: [-2, 1.5, 7.5, 12, 16], crew2: [[-2, 3.5], [10.5, 16]] }];
const CH = 1.6, CD = 1.8;
function courseWorld(X, c, upTo) {
  // the crews' courses: the foundation (sunk) and the course under the kohen's; the crews' stones of his own course beside the gap
  const K = COURSES[c], g = X.ground(WALL_X, K.z0 + 7), out = [];
  const lay = (a, b, y) => { const m = stoneMesh(X, b - a - 0.06, CH - 0.04, CD); m.rotation.y = Math.PI / 2; m.position.set(WALL_X, y + CH / 2, K.z0 + (a + b) / 2); out.push(m); };
  for (let i = 0; i < K.below.length - 1; i++) lay(K.below[i] + (i % 2 ? 0.8 : 0), K.below[i + 1] + (i % 2 ? 0.8 : 0), g - CH * 0.6);
  for (let i = 0; i < K.below.length - 1; i++) lay(K.below[i], K.below[i + 1], g - CH * 0.6 + CH);
  if (upTo >= 1) for (const [a, b] of K.crew2) lay(a, b, g - CH * 0.6 + CH * 2);
  return { out, base: g - CH * 0.6 + CH * 2 };
}
export const COURSE = {
  icon: '🧱', title: 'הנדבך',
  walkLine: (m) => `חומת התמך המזרחית: נדבך ${m.c + 2}`,
  stand(m, X) { const K = COURSES[m.c]; return { x: WALL_X - 9, z: K.z0 - 1.5, face: [WALL_X, K.z0 + 7] }; },
  prepare(m, X) { const K = COURSES[m.c]; SH.crane.place(WALL_X - 6.5, K.z0 + 2, Math.PI / 2 - 0.3); },
  make(m, X) {
    const lv = X.level(), K = COURSES[m.c], T = X.THREE, C = SH.crane;
    const W0 = courseWorld(X, m.c, 1), yB = W0.base;
    const A = { phase: 'choose', hz: K.z0 + 7, tz: K.z0 + 7, set: [], cur: null, grades: [], sway: { x: 0, v: 0 }, t: 0, drop: 0, p0: null, stock: [] };
    const tip = new T.Vector3();
    // the stock: three lengths on the ground beside the crane (tap one)
    [2, 3, 4].forEach((L, i) => { const s = stoneMesh(X, L - 0.06, CH - 0.04, CD); s.rotation.y = Math.PI / 2; const x = WALL_X - 4.5 - i * 2.4, z = K.z0 + 16.5; s.position.set(x, X.ground(x, z) + CH / 2, z); s.userData.L = L; A.stock.push(s); });
    const slot = X.props.ringAt(WALL_X, K.z0 + (K.gap[0] + K.gap[1]) / 2, 1.0, 0.08, X.props.M.gold); slot.position.y = yB + 0.05; slot.scale.set(3.5, 3.5, 3.5);
    const crew = [SH.crew.add(WALL_X - 2, K.z0 - 1, { role: 'hammer', item: 'mallet', fx: WALL_X, fz: K.z0 + 1, crew: 3 }), SH.crew.add(WALL_X - 2, K.z0 + 20, { role: 'hammer', item: 'mallet', fx: WALL_X, fz: K.z0 + 18, off: 0.4, crew: 3 }), SH.crew.add(WALL_X - 9, K.z0 + 11, { role: 'pull', item: 'rope', fx: WALL_X - 6.5, fz: K.z0 + 2, crew: 1 })];
    const gapLeft = () => { let z = K.gap[0]; for (const s of A.set) z = Math.max(z, s.b); return z; };
    function shot() { const zc = K.z0 + 10; X.shot([WALL_X - 27, yB + 12, zc + 1], [WALL_X - 3, yB + 0.5, zc], 0.9); }
    function hook(L) {
      const s = stoneMesh(X, L - 0.06, CH - 0.04, CD); s.rotation.y = Math.PI / 2; s.userData.L = L;
      A.cur = { m: s, L }; A.phase = 'aim'; A.drop = 0; A.sway.x = lv >= 2 ? 0.9 : 0; A.sway.v = 0;
      X.line('גררו ימינה ושמאלה מעל המקום · שחררו — האבן יורדת'); X.play('rope');
    }
    function land() {
      const L = A.cur.L, z0 = A.cur.m.position.z - K.z0 - L / 2, want = gapLeft(), left = K.gap[1] - want;
      const at = { x: WALL_X, y: yB + CH + 1, z: A.cur.m.position.z };
      if (L > left + 0.01) { X.word(at, 'ארוכה מדי לרווח — בחרו אחרת'); X.props.remove(A.cur.m); A.cur = null; A.phase = 'choose'; X.line('בחרו אורך מהערימה'); return; }
      const dev = Math.abs(z0 - want) / L, grade = dev <= 0.05 ? 'gold' : dev <= 0.12 ? 'good' : 'ok';
      const s = A.cur.m; s.position.set(WALL_X, yB + CH / 2, K.z0 + want + L / 2);
      A.set.push({ a: want, b: want + L, m: s }); A.cur = null;
      X.play('settle'); X.dust(WALL_X, yB + 0.2, K.z0 + want + L / 2, 10, 2.4); X.shake(0.15, 0.25);
      if (grade === 'ok') X.word(at, 'הצוות דוחף אותה למקום'); X.hit(at, grade, { text: '', craft: 'בנאים' }); A.grades.push(grade);
      // a joint over a joint below: it sits, but a crack line shows and the mason marks it in chalk
      const j = want + L; const joj = j < K.gap[1] - 0.01 && K.below.some((b) => Math.abs(b - j) < 0.3);
      if (joj) { A.joj = true; X.word({ x: WALL_X, y: yB + CH + 0.5, z: K.z0 + j }, 'חיבור מעל חיבור · כשר'); const cr = new T.Mesh(new T.PlaneGeometry(0.06, CH * 2), X.props.M.seam); cr.position.set(WALL_X - CD / 2 - 0.02, yB, K.z0 + j); cr.rotation.y = -Math.PI / 2; X.props.root.add(cr); A.crack = cr; }
      if (gapLeft() >= K.gap[1] - 0.01) close(); else { A.phase = 'choose'; X.line('עוד אבן: בחרו אורך — ובלי חיבור מעל חיבור'); }
    }
    function close() {
      A.phase = 'done';
      const at = { x: WALL_X, y: yB + CH + 1.5, z: K.z0 + 7 };
      if (!A.joj) X.bonus(100, 'course', 'נדבך בלי חיבור על חיבור');
      SH.courseSet = SH.courseSet || {}; SH.courseSet[m.c] = A.set.map((s) => s.m);
      const q = A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length * (A.joj ? 0.7 : 1);
      setTimeout(() => X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 1200);
    }
    return {
      begin() { shot(); X.line('בחרו אורך מהערימה (הקשה): הרווח 7 אמות, ובלי חיבור מעל חיבור'); const s = A.stock[1]; X.hand({ x: s.position.x, y: s.position.y + 1, z: s.position.z }, 0, 12); try { X.hero.setPos(WALL_X - 9, K.z0 - 1.5, Math.PI / 2); } catch (e) { /* */ } },
      update(dt) {
        A.t += dt; C.tipWorld(tip);
        if (A.cur) {
          A.hz += (A.tz - A.hz) * (1 - Math.exp(-dt * 3.2));
          const S = A.sway; S.v += -4 * S.x * dt; S.v *= Math.exp(-dt * (lv >= 2 ? 0.08 : 3)); S.x += S.v * dt;
          if (A.phase === 'drop') A.drop = Math.min(1, A.drop + dt * 2.2);
          const hy = yB + CH * 2.4, y = lerp(hy, yB + CH / 2, ease(A.drop));
          A.cur.m.position.set(WALL_X, y, A.hz + S.x * (1 - A.drop * 0.6));
          C.aim(WALL_X, A.hz, 1 - Math.exp(-dt * 5));
          C.rope.show(true); C.rope.set({ x: tip.x, y: tip.y, z: tip.z }, { x: WALL_X, y: y + CH / 2, z: A.cur.m.position.z }, 0);
          if (A.phase === 'drop' && A.drop >= 1) land();
        } else C.rope.show(false);
      },
      down(p) {
        A.p0 = { x: p.x, y: p.y, t: A.t };
        if (A.phase === 'aim') { const g = onPlane(X, p.x, p.y, yB + CH); if (g) A.tz = g.z; }
      },
      move(p) { if (A.phase === 'aim') { const g = onPlane(X, p.x, p.y, yB + CH); if (g) A.tz = clamp(g.z, K.z0 - 2, K.z0 + 16); } },
      up(p) {
        if (A.phase === 'choose') {
          const hits = X.rayAt(p.x, p.y).intersectObjects(A.stock, false);
          if (hits.length) { hook(hits[0].object.userData.L); X.hand(null); }
          return;
        }
        if (A.phase === 'aim') { A.phase = 'drop'; X.play('rope'); }
      },
      end() { for (const s of A.stock) X.props.remove(s); X.props.remove(slot); C.rope.show(false); if (A.cur) X.props.remove(A.cur.m); for (const w of crew) SH.crew.remove(w); },
      at() { return { x: WALL_X, y: yB + 2, z: K.z0 + 7 }; },
      dbg() { const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; }; return { phase: A.phase, set: A.set.map((s) => [s.a, s.b]), joj: !!A.joj, stock: A.stock.map((s) => sc(s.position)), gapScr: [sc({ x: WALL_X, y: yB + CH, z: K.z0 + K.gap[0] }), sc({ x: WALL_X, y: yB + CH, z: K.z0 + K.gap[1] })], hz: +A.hz.toFixed(2), tz: +A.tz.toFixed(2), sx: +A.sway.x.toFixed(2), sv: +A.sway.v.toFixed(2), cur: A.cur ? A.cur.L : 0, want: gapLeft(), z0: K.z0, below: K.below, gap: K.gap }; },
    };
  },
};

/* ───────── 3.7 the great stone: from the quarry, along the road, onto the west wall's great course ───────── */
const GR = { x: -262, zEnd: -150, len: 27, h: 3.4, d: 3.6, sp: 3.5 };
const ROAD = [[200, -196], [150, -230], [40, -240], [-80, -230], [-200, -205], [-262, -205]];
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
    function shot() { const zc = A.zs; X.shot([GR.x + 50, g0(zc) + 12, zc], [GR.x, g0(zc) + 1.5, zc + 0.5], 0.25); }
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
      A.phase = 'done';
      const at = { x: GR.x, y: g0(GR.zEnd) + GR.h + 2, z: GR.zEnd };
      X.play('settle'); X.shake(0.45, 0.8); X.dust(GR.x, g0(GR.zEnd) + 0.5, GR.zEnd, 30, 8);
      SH.greatDone = true;
      if (!lost) X.bonus(300, 'great', 'האבן הגדולה במקומה'); else X.word(at, 'הצוות הניח · האבן עומדת בנדבך');
      setTimeout(() => X.word(at, 'האבן הגדולה: 13.6 מטר (מנהרות הכותל)'), 900);
      X.shot([GR.x + 30, g0(GR.zEnd) + 16, GR.zEnd - 26], [GR.x, g0(GR.zEnd) + 2, GR.zEnd], 1.6);
      const q = lost ? 0 : A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / Math.max(1, A.grades.length) * (A.gaps ? 0.85 : 1);
      setTimeout(() => X.end({ q, lost, stars: lost ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at }), 2600);
    }
    return {
      begin() { shot(); X.line('גליל יצא מאחור: גררו אותו אל לפני האבן, לפני שנוצר רווח'); try { X.hero.setPos(GR.x + 4.5, A.zs - GR.len / 2 - 2.5, 0); } catch (e) { /* */ } },
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
          if (A.phase === 'roll') shot();
        }
        const gy = g0(A.zs);
        S.position.set(GR.x, gy + 1.1 + GR.h / 2, A.zs);
        for (const r of A.rollers) { if (A.drag && A.drag.r === r) continue; r.m.position.set(GR.x, X.ground(GR.x, r.z) + 0.55, r.z); r.m.rotation.x = r.z * 1.6; }
        if (A.drag) { const r = A.drag.r; r.z += (A.drag.tz - r.z) * (1 - Math.exp(-dt * 6)); r.m.position.set(GR.x + 0.5, gy + 1.6, r.z); }
        for (let k = 0; k < 2; k++) { const s = k ? 1 : -1, a = { x: GR.x + s * 1.2, y: gy + 2.2, z: A.zs + GR.len / 2 }, w = pullers[6 + k] ? pullers[6 + k].a : null; if (w) ropes[k].set(a, { x: w.x, y: X.ground(w.x, w.z) + 1.6, z: w.z }, 0.2); }
      },
      down(p) { if (A.phase !== 'roll') return; const r = pickRoller(p); if (!r) return; A.drag = { r, tz: r.z, t0: A.t }; X.hand(null); X.play('wood'); },
      move(p) { const D = A.drag; if (!D) return; const g = onPlane(X, p.x, p.y, g0(A.zs) + 1.2); if (g) D.tz = g.z; },
      up() {
        const D = A.drag; if (!D) return; A.drag = null; const r = D.r;
        const fr = A.zs + GR.len / 2, f = front(), ideal = Math.max(f + GR.sp, fr - 0.5);
        if (r.z > fr - GR.sp * 1.2 && r.z < fr + 6) {
          const err = Math.abs(r.z - ideal), grade = err <= 1 ? 'gold' : err <= 2.2 ? 'good' : 'ok';
          r.z = Math.min(r.z, fr + 1); r.st = 'under'; A.moved++; A.grades.push(grade);
          X.hit({ x: GR.x, y: g0(r.z) + 2, z: r.z }, grade, { text: '', craft: 'מושכים' }); X.play('wood');
          X.count({ x: GR.x, y: g0(A.zs) + GR.h + 3.5, z: A.zs }, `${A.moved}/${N}`);
        } else { r.st = 'out'; X.word({ x: GR.x, y: g0(r.z) + 1.5, z: r.z }, 'לפני האבן!'); }
      },
      end() { for (const r of A.rollers) X.props.remove(r.m); for (const w of pullers) SH.crew.remove(w); SH.crew.remove(drummer); for (const r of ropes) r.dispose(); X.count(null); },
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
      begin() { shot(); X.line('גררו לאורך האות המנוקדת: האיזמל חורט איפה שהאצבע עוברת'); try { const sp = letStand(); X.hero.setPos(sp.x, sp.z, Math.atan2(LET.x - sp.x, LET.z - sp.z)); X.hero.arm('chisel', { x: sp.tx, y: gy + 1.2, z: sp.tz }); } catch (e) { /* */ } const Lt = L[0], c = toC(GLYPH[Lt.ch][0][0], Lt); const w = face.localToWorld(new T.Vector3((c[0] / cw - 0.5) * FW, (0.5 - c[1] / ch) * FH, 0.1)); X.hand(w, -30, 30); },
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
  if (done('corner')) { const s = stoneMesh(X, 2.4, 1.6, 2.0); s.position.set(CORNER_AT.x, X.ground(CORNER_AT.x, CORNER_AT.z) + 0.8, CORNER_AT.z); }
  // the east wall's courses as far as the crews and the kohen have laid them
  for (let c = 0; c < 2; c++) { const w = courseWorld(X, c, done('course' + c) ? 1 : 0); if (done('course' + c)) { const K = COURSES[c]; const b = w.base; const lay = (a, z1) => { const m = stoneMesh(X, z1 - a - 0.06, CH - 0.04, CD); m.rotation.y = Math.PI / 2; m.position.set(WALL_X, b + CH / 2, K.z0 + (a + z1) / 2); }; lay(K.gap[0], K.gap[0] + (c ? 3 : 4)); lay(K.gap[0] + (c ? 3 : 4), K.gap[1]); } }
  // the great stone: cut at the quarry, on its road, or in its course
  SH.road = roadMesh(X);
  SH.great = stoneMesh(X, GR.d, GR.h, GR.len); SH.great.rotation.y = 0;
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
