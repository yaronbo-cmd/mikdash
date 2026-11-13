/* ── build 118 ── h111/stakes.js — stage 02's first work rebuilt: the line and the stakes (brief docs/specs/build118-brief.md §S; the
 * owner 9.11 on build 111: "גרוע", the kohen did not move, the lines changed nothing he could see, he did not know where he was, the
 * screen jumped into a room, a crewman held "a lantern", and the label "האלכסונים שווים" was false).
 *
 * The kohen carries the fourth stake. A drag on the ground walks him; the two ropes (north 187, east 135: Middot 5:1) run through a ring on
 * the stake's head, and a red ribbon tied on each at its measure shows the error beside his hand at real size. Three taps drive the
 * stake; then the crews test the corner for real with ONE rope on both diagonals, and the difference is shown and written as measured.
 * Ribbons on the rope and the diagonal test are המחשה after the builders' craft, not a Talmudic source.
 */
import { H111 } from './model.js';
import { BOOK } from '../world/grid.js';   // (build 126: the stakes and the cameras are the book's)
const CAM2 = BOOK.s02.cam;
import { SH2, label, holesOn } from './world.js';
import { onPlane, clamp, lerp, ease } from '../h109/kit.js';

// the azara 187 × 135 (Middot 5:1): its inner corners; the crews' stakes at three, the kohen's at the north-east
export const AZ = { ...BOOK.s02.stakes, N: 187, E: 135 };   // (build 126: the corners are the book's; N, E the court's size)
const AC = Math.hypot(AZ.N, AZ.E);   // the first diagonal, between two of the crews' stakes
const HOLD = 0.7;                    // the stake in his hands, this far in front of him
const TAIL = 4;                      // the rope past the ring, to the coil

export const STAKES = {
  icon: '📏', title: 'הקו והיתדות',
  walkLine: () => 'פינת העזרה הצפונית-מזרחית: מותחים את הקו',
  stand() { return { x: AZ.D[0] - 5.1, z: AZ.D[1] + 3.9, face: [AZ.D[0], AZ.D[1]] }; },
  prepare(m, X) { try { X.stages.s20Pin(null); } catch (e) { /* */ } },
  make(m, X) {
    const lv = X.level(), P = X.props, T = X.THREE, g = (x, z) => X.ground(x, z);
    // (build 126) a shot from the book: [eye, target] with their heights over the ground sampled at [a] and [b]
    const camAt = ([E0, T0, a, b], sec) => X.shot([E0[0], g(a[0], a[1]) + E0[1], E0[2]], [T0[0], g(b[0], b[1]) + T0[1], T0[2]], sec);
    const tol = lv >= 3 ? 0.1 : 0.25;
    const A = { phase: 'open', drag: false, tap0: null, taps: 0, drives: 0, pulls: 0, diff: null, q: 1, grade: null, walkT: 0, want: null, sway: 0, gust: 0, gustT: 3, t: 0, S: { x: 0, z: 0 }, fixed: null, sink: 0, held: true };
    const objs = [], ropes = [], labs = [];
    const add = (o) => { objs.push(o); return o; };
    const box = (mat, sx, sy, sz) => { const b = new T.Mesh(P.geo.box, mat); b.scale.set(sx, sy, sz); P.root.add(b); return add(b); };
    const lime = P.M.chalk || new T.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: 0.95, depthWrite: false });
    const red = new T.MeshStandardMaterial({ color: '#C8321F', roughness: 0.8, side: T.DoubleSide });
    // ── the crews' three stakes, each with its flag and a crewman holding the rope's end at it ──
    const st3 = [P.stake(AZ.A[0], AZ.A[1], 1.6, true), P.stake(AZ.B[0], AZ.B[1], 1.6, true), P.stake(AZ.C[0], AZ.C[1], 1.6, true)]; st3.forEach(add);
    // a tall flag beside each of the three (seen from above in the opening)
    for (const c of [AZ.A, AZ.B, AZ.C]) { const f = P.stake(c[0] + 0.8, c[1] + 0.8, 5, true); f.children[1] && f.children[1].scale.set(3, 3, 1); add(f); }
    // the two sides the crews have staked already (west, south): lime on the ground, so the court's shape is read from the first second
    for (const [a, b] of [[AZ.A, AZ.B], [AZ.B, AZ.C]]) {
      const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const l = box(lime, L, 0.05, 2.2); l.position.set(mx, g(mx, mz) + 0.07, mz); l.rotation.y = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
    }
    const crew = [];
    const holdAt = (c, toward) => { const dx = toward[0] - c[0], dz = toward[1] - c[1], L = Math.hypot(dx, dz); return [c[0] + (dx / L) * 1.3 - (dz / L) * 0.9, c[1] + (dz / L) * 1.3 + (dx / L) * 0.9]; };
    for (const [c, to] of [[AZ.A, AZ.D], [AZ.C, AZ.D], [AZ.B, AZ.A]]) { const h = holdAt(c, to); crew.push(SH2.crew.add(h[0], h[1], { role: 'pull', fx: to[0], fz: to[1], crew: 2 })); }
    // the coil man walks beside the kohen and pays out the rope (no idle figure, nothing in a hand that is not this work's tool)
    const coil = SH2.crew.add(AZ.D[0] - 7.5, AZ.D[1] + 6, { role: 'pull', fx: AZ.D[0], fz: AZ.D[1], crew: 1 });
    crew.push(coil);
    // ── the kohen's stake: a pole with an iron ring on its head; in his hands until driven ──
    const stk = add(new T.Group()); P.root.add(stk);
    { const pole = new T.Mesh(P.geo.stake, P.M.wood); pole.scale.set(1.9, 1.7, 1.9); stk.add(pole);
      const ring = new T.Mesh(new T.TorusGeometry(0.16, 0.035, 6, 14), P.M.woodD || P.M.wood); ring.position.y = 1.62; ring.rotation.x = Math.PI / 2; stk.add(ring); }
    // ── the two ropes, their tails to the coil, the ribbons ──
    const rN = P.rope(28, 0.09), rE = P.rope(28, 0.09), tN = P.rope(6, 0.09), tE = P.rope(6, 0.09); ropes.push(rN, rE, tN, tE);
    const coils = [0, 1].map(() => { const c = new T.Mesh(new T.TorusGeometry(0.32, 0.1, 6, 12), P.M.rope); c.rotation.x = Math.PI / 2; P.root.add(c); return add(c); });
    const rib = [0, 1].map(() => { const r0 = new T.Group(); const k = new T.Mesh(P.geo.box, red); k.scale.set(0.24, 0.24, 0.24); r0.add(k); for (const s of [-1, 1]) { const f = new T.Mesh(new T.PlaneGeometry(0.7, 0.28), red); f.position.set(0.2 * s, -0.24, 0); f.rotation.z = 0.5 * s; r0.add(f); } P.root.add(r0); return add(r0); });
    const labN = label(X), labE = label(X), labD = label(X); labs.push(labN, labE, labD);
    // ── the diagonal (the test): one rope, a knot ──
    const rD = P.rope(36, 0.16); ropes.push(rD); rD.show(false);
    const knot = box(red, 0.3, 0.3, 0.3); knot.visible = false;
    const limeRing = P.ringAt(AZ.D[0], AZ.D[1], 0.9, 0.25, lime); add(limeRing); limeRing.visible = false;
    const trenches = [];

    function heroXZ() { const h = X.heroAt(); return { x: h.x, z: h.z, yaw: X.hero.yaw }; }
    /** the stake's point on the ground: in his hands (in front of him), or where it was driven */
    function stakeP() {
      if (A.fixed) return A.fixed;
      const h = heroXZ(); return { x: h.x + Math.sin(h.yaw) * HOLD, z: h.z + Math.cos(h.yaw) * HOLD };
    }
    const lens = (S) => ({ n: Math.hypot(S.x - AZ.A[0], S.z - AZ.A[1]), e: Math.hypot(S.x - AZ.C[0], S.z - AZ.C[1]) });
    /** a rope from the far stake through the ring and on to its coil; its ribbon at exactly `need` amot from the far stake */
    function ropeDraw(R, tail, cl, rb, lab, far, need, word, sway, ly) {
      const S = stakeP(), ringY = g(S.x, S.z) + (A.fixed ? 1.62 - A.sink : 1.55), fy = g(far[0], far[1]) + 1.25;
      const dx = S.x - far[0], dz = S.z - far[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
      const sw = sway * Math.sin(A.t * 5.2 + need), side = { x: -uz * sw, z: ux * sw };
      R.set({ x: far[0], y: fy, z: far[1] }, { x: S.x, y: ringY, z: S.z }, 0.35 + Math.abs(sw) * 0.4);
      const cx = S.x + ux * TAIL + side.x, cz = S.z + uz * TAIL + side.z;
      tail.set({ x: S.x, y: ringY, z: S.z }, { x: cx, y: g(cx, cz) + 0.12, z: cz }, 0.1);
      cl.position.set(cx, g(cx, cz) + 0.12, cz);
      const err = need - L;   // > 0: too near (the ribbon is past the ring, on the tail); < 0: too far (out on the stretched rope)
      let px, pz, py;
      if (err >= 0) { const d = Math.min(TAIL, err), u = d / TAIL; px = S.x + ux * d + side.x * u; pz = S.z + uz * d + side.z * u; py = lerp(ringY, g(cx, cz) + 0.12, u) + 0.12; }
      else { const d = Math.min(L, -err); px = S.x - ux * d + side.x * Math.min(1, d / 6); pz = S.z - uz * d + side.z * Math.min(1, d / 6); py = lerp(ringY, fy, d / L) - 0.35 * 4 * (d / L) * (1 - d / L) + 0.12; }
      rb.position.set(px, py, pz); rb.rotation.y = Math.atan2(ux, uz);
      if (lv <= 1 && (A.phase === 'walk' || A.phase === 'pull')) lab.set(`${word} ${Math.abs(err) < 0.05 ? 'בדיוק' : (err > 0 ? 'חסר ' : 'עודף ') + Math.abs(err).toFixed(1)}`, (err >= 0 ? { x: px + ux * 1.6, y: py + ly, z: pz + uz * 1.6 } : { x: px - ux * 1.6, y: py + ly, z: pz - uz * 1.6 }));
      else lab.set('', null);
      return err;
    }
    function draw() {
      const S = stakeP();
      stk.position.set(S.x, g(S.x, S.z) + (A.fixed ? -A.sink : 0.25), S.z);
      const sway = lv >= 2 ? A.sway * 0.6 + A.gust * 0.5 : 0;
      ropeDraw(rN, tN, coils[0], rib[0], labN, AZ.A, AZ.N, 'צפון', sway, 0.5);
      ropeDraw(rE, tE, coils[1], rib[1], labE, AZ.C, AZ.E, 'מזרח', sway, 1.5);
    }
    function follow() {
      const S = stakeP();
      X.track([S.x + 6.5, g(S.x, S.z) + 10.5, S.z + 9.5], [S.x - 1.4, g(S.x, S.z) + 0.6, S.z + 1.4], 2.2);
    }
    /** the kohen walks (his own legs: the left thumb's drive) so the stake in his hands comes to q; slower in the last amah */
    function walkFor(q) { A.goal = q ? { x: q.x, z: q.z } : null; }
    function walkStep() {
      const q = A.goal; if (!q) { if (A.driving) { try { X.hero.drive(0, 0); } catch (e) { /* */ } A.driving = false; } return; }
      const h = heroXZ(), S = stakeP(), ex = q.x - S.x, ez = q.z - S.z, d = Math.hypot(ex, ez);
      if (d < 0.02) { A.goal = null; try { X.hero.drive(0, 0); } catch (e) { /* */ } A.driving = false; return; }
      // aim his body at the point HOLD short of q, along the line from him to q (so he faces it as he arrives)
      const dx = q.x - h.x, dz = q.z - h.z, L = Math.hypot(dx, dz) || 1, tx = q.x - (dx / L) * HOLD, tz = q.z - (dz / L) * HOLD;
      const mx = tx - h.x, mz = tz - h.z, m = Math.hypot(mx, mz);
      if (m < 0.3) {
        // the last step: he stands where the stake meets the finger's point exactly, facing it (a third of an amah: not seen as a jump)
        try { X.hero.drive(0, 0); X.hero.setPos(tx, tz, Math.atan2(dx / L, dz / L)); } catch (e) { /* */ }
        A.goal = null; A.driving = false; return;
      }
      const v = clamp(m / 1.2, 0.1, 0.55);
      try { X.hero.drive((mx / m) * v, (mz / m) * v); A.driving = true; } catch (e) { /* */ }
    }
    const coilFollow = () => { const S = stakeP(); const cx = S.x - 3.2, cz = S.z + 2.6; if (Math.hypot(coil.a.x - cx, coil.a.z - cz) > 2.2 && !coil.a.path) SH2.crew.walkTo(coil, cx, cz, 2.8).then(() => SH2.crew.face(coil, S.x, S.z)); };

    async function opening() {
      const first = !(X.M.st.plays && X.M.st.plays.stakes);
      const S = stakeP();
      if (first) {
        // from above the court: the rectangle in lime, three stakes with their flags and crews, the fourth corner empty; then down along
        // the north rope to the kohen
        camAt(CAM2.stakesTop, 0.01);
        X.line('העזרה: 187 על 135 אמה · שלוש פינות כבר מסומנות');
        await X.wait(2.2);
        camAt(CAM2.stakesNorth, 2.0);
        await X.wait(2.0);
      }
      X.shot([S.x + 6.5, g(S.x, S.z) + 10.5, S.z + 9.5], [S.x - 1.4, g(S.x, S.z) + 0.6, S.z + 1.4], first ? 1.6 : 1.2);
      await X.wait(first ? 1.6 : 1.2);
      A.phase = 'walk';
      X.line(lv <= 1 ? 'גררו על הקרקע: הכהן הולך עם היתד · שני הסרטים האדומים על הטבעת' : 'גררו: הכהן הולך · כל סרט אדום צריך לשבת על הטבעת');
      const s = X.scr(S.x, g(S.x, S.z) + 1, S.z); X.hand({ x: S.x, y: g(S.x, S.z) + 1, z: S.z }, 40, -24); void s;
    }
    async function drive() {
      // three blows of the wooden mallet: the stake sinks a third at each
      A.taps++; X.hand(null);
      if (A.taps === 1) { A.fixed = stakeP(); A.sink = 0; }
      try { X.hero.act('tamp', { x: A.fixed.x, y: g(A.fixed.x, A.fixed.z) + 1.4, z: A.fixed.z }, { snap: true }); } catch (e) { /* */ }
      X.play('stamp'); X.dust(A.fixed.x, g(A.fixed.x, A.fixed.z) + 0.2, A.fixed.z, 6, 1.2);
      A.sink = A.taps * 0.35;
      if (A.taps < 3) { X.line(`עוד ${3 - A.taps} ${3 - A.taps === 1 ? 'מכה' : 'מכות'} על היתד`); return; }
      A.drives++; test();
    }
    async function test() {
      A.phase = 'test'; X.hand(null); X.line('הצוות בודק את הפינה: אותו חבל על שני האלכסונים');
      const S = A.fixed, BD = Math.hypot(S.x - AZ.B[0], S.z - AZ.B[1]);
      A.diff = BD - AC;
      // the camera rises; the rope from A to C, its knot at C
      camAt(CAM2.stakesTop, 2.2);
      await X.wait(2.0);
      rD.show(true);
      for (let k = 1; k <= 24; k++) { const u = k / 24; rD.set({ x: AZ.A[0], y: g(AZ.A[0], AZ.A[1]) + 1.2, z: AZ.A[1] }, { x: lerp(AZ.A[0], AZ.C[0], u), y: g(AZ.C[0], AZ.C[1]) + 1.2, z: lerp(AZ.A[1], AZ.C[1], u) }, 0); await X.wait(0.04); }
      knot.visible = true; knot.position.set(AZ.C[0], g(AZ.C[0], AZ.C[1]) + 1.3, AZ.C[1]);
      X.shot([AZ.C[0] + 8, g(AZ.C[0], AZ.C[1]) + 13, AZ.C[1] + 14], [AZ.C[0] - 3, g(AZ.C[0], AZ.C[1]) + 0.8, AZ.C[1] - 2], 1.6);
      await X.wait(1.4);
      labD.set(`אלכסון ראשון ${AC.toFixed(1)} · קושרים קשר`, { x: AZ.C[0], y: g(AZ.C[0], AZ.C[1]) + 3, z: AZ.C[1] });
      X.play('rope'); await X.wait(1.6);
      // the same rope from B toward his stake: the knot falls short of it or past it
      const dx = S.x - AZ.B[0], dz = S.z - AZ.B[1], ux = dx / BD, uz = dz / BD;
      const kx = AZ.B[0] + ux * AC, kz = AZ.B[1] + uz * AC;
      labD.set('', null);
      X.shot([S.x + 7, g(S.x, S.z) + 9, S.z + 8.5], [S.x - 1.5, g(S.x, S.z) + 0.8, S.z + 1.5], 1.6);
      await X.wait(1.2);
      for (let k = 1; k <= 24; k++) { const u = k / 24, L = Math.max(BD, AC) * u; rD.set({ x: AZ.B[0], y: g(AZ.B[0], AZ.B[1]) + 1.2, z: AZ.B[1] }, { x: AZ.B[0] + ux * L, y: g(S.x, S.z) + 1.2, z: AZ.B[1] + uz * L }, 0); knot.position.set(AZ.B[0] + ux * Math.min(L, AC), g(kx, kz) + 1.3, AZ.B[1] + uz * Math.min(L, AC)); await X.wait(0.04); }
      await X.wait(0.6);
      const d = Math.abs(A.diff);
      labD.set(`הפרש ${d.toFixed(1)} אמה`, { x: (S.x + kx) / 2, y: g(S.x, S.z) + 2.6, z: (S.z + kz) / 2 });
      await X.wait(1.2);
      const L0 = lens(S), sides = Math.max(Math.abs(L0.n - AZ.N), Math.abs(L0.e - AZ.E));
      if (d <= tol) {
        A.grade = sides <= tol ? 'gold' : 'good';
        A.q = [1, 0.8, 0.6][Math.min(2, A.drives - 1)] * (A.grade === 'gold' ? 1 : 0.85);
        const at = { x: S.x, y: g(S.x, S.z) + 2.6, z: S.z };
        X.hit(at, A.grade === 'gold' ? 'gold' : 'good', { text: 'פינה ישרה', craft: 'מודדים' });
        if (A.grade === 'gold' && A.drives === 1) { A.perfect = true; X.perfect('בול! פינה ישרה', at); }
        else X.word(at, 'האלכסונים שווים · פינה ישרה');
        await X.wait(1.4); dig();
        return;
      }
      // not equal: the true difference, pull the stake and try again; after the third the master marks the place in lime
      if (A.drives >= 3) {
        X.line('רב האומנים מסמן בסיד את המקום'); limeRing.visible = true;
        await X.wait(1.4);
        rD.show(false); knot.visible = false; labD.set('', null);
        A.fixed = null; A.taps = 0; A.sink = 0;
        const q = { x: AZ.D[0], z: AZ.D[1] }; walkFor(q);
        await X.wait(2.2);
        A.fixed = { ...q };
        for (let k = 0; k < 3; k++) { try { X.hero.act('tamp', { x: q.x, y: g(q.x, q.z) + 1.4, z: q.z }, { snap: true }); } catch (e) { /* */ } X.play('stamp'); A.sink = (k + 1) * 0.35; await X.wait(0.6); }
        A.q = 0.4; A.grade = 'ok'; dig();
        return;
      }
      X.line('לא שווים · הקישו על היתד כדי לשלוף אותה ונסו שוב');
      A.phase = 'pull';
    }
    async function pull() {
      A.pulls++; A.phase = 'walk'; A.taps = 0; A.sink = 0;
      try { X.hero.act('pull', { x: A.fixed.x, y: g(A.fixed.x, A.fixed.z) + 1, z: A.fixed.z }, { snap: true }); } catch (e) { /* */ }
      A.fixed = null; rD.show(false); knot.visible = false; labD.set('', null);
      X.line('גררו שוב · שני הסרטים על הטבעת');
    }
    async function dig() {
      A.phase = 'dig'; X.line('הצוותים חופרים יסודות לאורך הקווים'); X.hand(null);
      rD.show(false); knot.visible = false; labD.set('', null); labN.set('', null); labE.set('', null);
      X.shot([A.fixed.x + 6, g(A.fixed.x, A.fixed.z) + 17, A.fixed.z + 22], [A.fixed.x - 7, g(A.fixed.x, A.fixed.z), A.fixed.z + 6], 2.0);
      const S = A.fixed, D4 = [S.x, S.z], SEG = [[AZ.A, AZ.B], [AZ.B, AZ.C], [D4, AZ.C], [D4, AZ.A]];
      const dark = new T.MeshStandardMaterial({ color: '#3E3022', roughness: 1 });
      const digs = [];
      for (let i = 0; i < 4; i++) {
        const [a, b] = SEG[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const tr = box(dark, 1, 0.06, 2.2), md = box(P.M.fill || dark, 1, 0.45, 0.9);
        trenches.push({ tr, md, a, b, L });
        const w = SH2.crew.add(a[0], a[1], { role: 'pick', item: 'pick', fx: b[0], fz: b[1], crew: i % 3 }); digs.push(w); crew.push(w);
      }
      for (let k = 1; k <= 40; k++) {
        const u = ease(k / 40);
        for (const t of trenches) {
          const L = t.L * u, mx = t.a[0] + (t.b[0] - t.a[0]) * u / 2, mz = t.a[1] + (t.b[1] - t.a[1]) * u / 2, yaw = Math.atan2(-(t.b[1] - t.a[1]), t.b[0] - t.a[0]);
          t.tr.scale.x = Math.max(0.01, L); t.tr.position.set(mx, g(mx, mz) + 0.04, mz); t.tr.rotation.y = yaw;
          const nx = -(t.b[1] - t.a[1]) / t.L, nz = (t.b[0] - t.a[0]) / t.L;
          t.md.scale.x = Math.max(0.01, L); t.md.position.set(mx + nx * 1.3, g(mx, mz) + 0.12, mz + nz * 1.3); t.md.rotation.y = yaw;
        }
        digs.forEach((w, i) => { const t = trenches[i], d = Math.min(t.L * u, 9 + i), px = t.a[0] + (t.b[0] - t.a[0]) * d / t.L, pz = t.a[1] + (t.b[1] - t.a[1]) * d / t.L; if (w && w.a) { w.a.x = px - (t.b[1] - t.a[1]) / t.L * 1.6; w.a.z = pz + (t.b[0] - t.a[0]) / t.L * 1.6; } });
        await X.wait(0.11);
      }
      await X.wait(0.8);
      A.phase = 'done';
      X.M.st.staked = { x: +S.x.toFixed(2), z: +S.z.toFixed(2) };
      const at = { x: S.x, y: g(S.x, S.z) + 2.5, z: S.z };
      X.end({ q: A.q, at, perfect: !!A.perfect });
    }

    return {
      begin() {
        try { X.hero.setPos(AZ.D[0] - 5.1, AZ.D[1] + 3.9, Math.atan2(5.1, -3.9)); } catch (e) { /* */ }
        draw(); opening();
      },
      update(dt) {
        A.t += dt;
        const walking = !!A.goal || !!(X.hero && X.hero.walking);
        A.sway = walking ? Math.min(1, A.sway + dt * 3) : Math.max(0, A.sway - dt / 0.8);
        if (lv >= 3) { A.gustT -= dt; if (A.gustT <= 0) { A.gust = 1; A.gustT = 3 + Math.random() * 3; } A.gust = Math.max(0, A.gust - dt * 0.7); }
        if (A.phase === 'walk' || A.phase === 'pull') {
          if (A.drag && A.want && A.t - A.walkT > 0.18) { A.walkT = A.t; walkFor(A.want); }
          walkStep(); follow(); coilFollow();
        }
        if (A.phase === 'test' && A.goal) walkStep();
        if (A.phase !== 'done') draw();
        for (const L of labs) L.frame();
      },
      wants(p) {
        if (A.phase !== 'walk' && A.phase !== 'pull') return false;
        const q = onPlane(X, p.x, p.y, g(stakeP().x, stakeP().z)); const h = heroXZ();
        return !!q && Math.hypot(q.x - h.x, q.z - h.z) < 14;
      },
      down(p) {
        if (A.phase !== 'walk' && A.phase !== 'pull') return;
        A.tap0 = { x: p.x, y: p.y, t: A.t };
      },
      move(p) {
        if (!A.tap0 || A.phase !== 'walk') return;
        if (!A.drag && Math.hypot(p.x - A.tap0.x, p.y - A.tap0.y) > 5) {
          A.drag = true; X.hand(null);
          if (A.taps > 0 && A.taps < 3) { A.fixed = null; A.taps = 0; A.sink = 0; }   // he takes the half-driven stake up again
        }
        if (!A.drag) return;
        const S = stakeP(), q = onPlane(X, p.x, p.y, g(S.x, S.z)); if (!q) return;
        A.want = { x: clamp(q.x, AZ.D[0] - 14, AZ.D[0] + 6), z: clamp(q.z, AZ.D[1] - 6, AZ.D[1] + 14) };
      },
      up(p) {
        const t0 = A.tap0; A.tap0 = null;
        if (A.drag) { A.drag = false; if (A.want) walkFor(A.want); return; }
        if (!t0 || Math.hypot(p.x - t0.x, p.y - t0.y) > 5) return;
        // a tap on (or near) the stake
        const S = stakeP(), s = X.scr(S.x, g(S.x, S.z) + 0.9, S.z);
        if (Math.hypot(p.x - s.x, p.y - s.y) > 90) return;
        if (A.phase === 'pull') { pull(); return; }
        if (A.phase === 'walk' && !A.goal) drive();
      },
      end() {
        try { X.hero.drive(0, 0); } catch (e) { /* */ }
        try { X.hero.speedMul = 1; } catch (e) { /* */ }
        for (const o of objs) P.remove(o); for (const r of ropes) r.dispose(); for (const L of labs) L.remove(); for (const w of crew) SH2.crew.remove(w);
        holesOn(X, true);
      },
      at() { const S = stakeP(); return { x: S.x, y: g(S.x, S.z) + 2, z: S.z }; },
      dbg() {
        const S = stakeP(), L = lens(S), h = heroXZ(), r2 = (q) => [Math.round(q.x), Math.round(q.y)];
        return { phase: A.phase, lv, n: +L.n.toFixed(2), e: +L.e.toFixed(2), needN: AZ.N, needE: AZ.E, tol, taps: A.taps, drives: A.drives, pulls: A.pulls, diff: A.diff == null ? null : +A.diff.toFixed(2),
          walking: !!A.goal, heroScr: r2(X.scr(h.x, g(h.x, h.z) + 1, h.z)), stakeScr: r2(X.scr(S.x, g(S.x, S.z) + 0.9, S.z)), targetScr: r2(X.scr(AZ.D[0], g(AZ.D[0], AZ.D[1]), AZ.D[1])),
          stake: [+S.x.toFixed(2), +S.z.toFixed(2)] };
      },
    };
  },
};
void H111;
