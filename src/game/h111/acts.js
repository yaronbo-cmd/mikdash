/* ── build 111 ── h111/acts.js — the acts of stage 02 "חומת העזרה", each played on the courts' wall in the old world (spec §"המשחקונים עד
 * רמת המגע"). The same registry as stage 01's (h109/acts.js):
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face, mx?, mz? }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), close? } — it calls X.end({ stars, q, at }) once.
 * This file: 1 the line and the stakes, 2 the course in bond (the station that repeats), 3 the plumb line. acts2.js: 4 the great stone
 * on the crowbar, 5 the gates' frames, 6 the closing stone.
 */
import { H111, STRETCH, puzzleOf, checkCourse, starsOf } from './model.js';
import { SH2, frameOf, rowOff, stoneMesh, placeStone, laidFill, label, initWorld, frameWorld, holesOn, ensureLaid } from './world.js';
import { onPlane, clamp, lerp, ease } from '../h109/kit.js';
import { LEVER, GATES, CLOSING } from './acts2.js';

const H = H111.H;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** the ramp's place for a station: on the wall's inner face, `along` amot from cell 0 (the kohen's side) */
export function rampFor(F, along = -5.5) { const p = F.at(along, -3); return { x: p.x, z: p.z, nx: F.nx, nz: F.nz }; }
/** where he stands on the wall's top for stretch work: left of the gap (from the court), on the inner half */
export function standTop(F, along = -1.7, across = -1.2) { const p = F.at(along, across); const c = F.at(F.G / 2, 0); return { x: p.x, z: p.z, face: [c.x, c.z] }; }
/** the crew of a station on the wall's top: two masons at work beyond the crane, one on the crane's rope; a carrier on the ramp */
function stationCrew(X, F, o = {}) {
  const C = SH2.crew, out = [];
  const m1 = F.at(F.G + (o.far || 13.5), -1.2), m2 = F.at(F.G + (o.far || 13.5) + 2.4, 1.0), t = F.at(F.G + (o.far || 13.5) + 1.2, 0);
  out.push(C.add(m1.x, m1.z, { role: 'hammer', item: 'mallet', fx: t.x, fz: t.z, crew: 3 }));
  out.push(C.add(m2.x, m2.z, { role: 'hammer', item: 'mallet', fx: t.x, fz: t.z, crew: 3, off: 0.45 }));
  // the earth for the ramp: a carrier up and down it with his basket (the crews pour the slope, spec "משאירים")
  const R = rampFor(F), foot = { x: R.x - R.nx * 9, z: R.z - R.nz * 9 }, top = { x: R.x - R.nx * 1.5 - F.ux * 1.6, z: R.z - R.nz * 1.5 - F.uz * 1.6 };
  out.push(C.add(foot.x, foot.z, { role: 'carry', item: 'basket', from: [foot.x, foot.z], to: [top.x, top.z], crew: 1 }));
  return out;
}
/** the crane stands on the wall's top past the stock, its jib over the work */
function craneAt(X, F, along) { const p = F.at(along, 0.2); SH2.crane.place(p.x, p.z, F.yaw + Math.PI / 2 * 0 + Math.atan2(-F.ux, -F.uz) - Math.atan2(F.ux, F.uz) * 0); SH2.crane.g.visible = true; SH2.craneAt = { s: F.s, along }; const c = F.at(F.G / 2, 0); SH2.crane.aim(c.x, c.z, 1); }

/* ───────── 1. the line and the stakes (once, the opening) ───────── */
// the azara 187 × 135 (Middot 5:1): its inner corners; the crews' stakes at three, the kohen's at the north-east
const AZ = { A: [-187, -67.5], B: [-187, 67.5], C: [0, 67.5], D: [0, -67.5], N: 187, E: 135 };
export const STAKES = {
  icon: '📏', title: 'הקו והיתדות',
  walkLine: () => 'פינת העזרה הצפונית-מזרחית: מותחים את הקו',
  stand() { return { x: 3.5, z: -58.5, face: [-4.6, -64.1] }; },
  prepare(m, X) { try { X.stages.s20Pin(null); } catch (e) { /* */ } },
  make(m, X) {
    const lv = X.level(), P = X.props, T = X.THREE;
    const g = (x, z) => X.ground(x, z);
    const st = [P.stake(AZ.A[0], AZ.A[1], 1.6, true), P.stake(AZ.B[0], AZ.B[1], 1.6, true), P.stake(AZ.C[0], AZ.C[1], 1.6, true)];
    const D0 = { x: AZ.D[0] - 4.6, z: AZ.D[1] + 3.4 };
    const A = { d: { ...D0 }, drag: false, done: false, t: 0, moved: false, tries: 0 };
    const stake = P.stake(A.d.x, A.d.z, 3.2, true);
    const rN = P.rope(28, 0.22), rE = P.rope(28, 0.22), rD = P.rope(36, 0.12);
    const whiteM = new T.MeshBasicMaterial({ color: 0xFFF3D6 }); rD.mesh.material = whiteM;
    // the sides the crews have staked already (west, south): chalk on the ground, so the court's shape is read from the first second
    const chalk = [];
    for (const [a, b] of [[AZ.A, AZ.B], [AZ.B, AZ.C]]) { const m0 = new T.Mesh(P.geo.box, P.M.chalk || P.M.ring); const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]); m0.scale.set(L, 0.05, 0.5); m0.position.set(mx, g(mx, mz) + 0.08, mz); m0.rotation.y = Math.atan2(-(b[1] - a[1]), b[0] - a[0]); P.root.add(m0); chalk.push(m0); }
    const labN = label(X), labE = label(X), labD = label(X);
    const goldM = new T.MeshBasicMaterial({ color: 0xFFD66E });
    const crew = [SH2.crew.add(AZ.C[0] - 6, AZ.C[1] - 4, { role: 'hold', item: 'rope', fx: AZ.C[0], fz: AZ.C[1], crew: 2 }), SH2.crew.add(-12, -61, { role: 'point', fx: AZ.D[0], fz: AZ.D[1], crew: 0 })];
    const len = () => ({ n: Math.hypot(A.d.x - AZ.A[0], A.d.z - AZ.A[1]), e: Math.hypot(A.d.x - AZ.C[0], A.d.z - AZ.C[1]), dg: Math.hypot(A.d.x - AZ.B[0], A.d.z - AZ.B[1]) });
    const DG = Math.hypot(AZ.N, AZ.E);
    function draw() {
      const y = g(A.d.x, A.d.z) + 1.3, L = len(), ok = Math.abs(L.n - AZ.N) <= 0.25 && Math.abs(L.e - AZ.E) <= 0.25;
      stake.position.set(A.d.x, g(A.d.x, A.d.z), A.d.z);
      rN.set({ x: A.d.x, y, z: A.d.z }, { x: AZ.A[0], y: g(AZ.A[0], AZ.A[1]) + 1.3, z: AZ.A[1] }, 0);
      rE.set({ x: A.d.x, y, z: A.d.z }, { x: AZ.C[0], y: g(AZ.C[0], AZ.C[1]) + 1.3, z: AZ.C[1] }, 0);
      rD.set({ x: A.d.x, y: y - 0.3, z: A.d.z }, { x: AZ.B[0], y: g(AZ.B[0], AZ.B[1]) + 1.0, z: AZ.B[1] }, 0);
      for (const r of [rN, rE]) r.mesh.material = ok ? goldM : whiteM;
      // the numbers near his stake, along each rope (their far ends are off the frame)
      const along = (bx, bz, d) => { const dx = bx - A.d.x, dz = bz - A.d.z, l = Math.hypot(dx, dz); return { x: A.d.x + (dx / l) * d, y: y + 0.6, z: A.d.z + (dz / l) * d }; };
      labN.set(`צפון ${L.n.toFixed(1)} / 187`, along(AZ.A[0], AZ.A[1], 9)); labE.set(`מזרח ${L.e.toFixed(1)} / 135`, along(AZ.C[0], AZ.C[1], 7));
      labD.set(Math.abs(L.dg - DG) <= 0.35 ? 'האלכסונים שווים ✓' : `אלכסון ${L.dg.toFixed(1)}`, along(AZ.B[0], AZ.B[1], 11));
      labN.el.classList.toggle('hot', Math.abs(L.n - AZ.N) <= 0.25); labE.el.classList.toggle('hot', Math.abs(L.e - AZ.E) <= 0.25); labD.el.classList.toggle('hot', ok);
      return ok;
    }
    function shot() { X.shot([-40, g(-30, -30) + 42, -22], [-14, g(-8, -60) + 0.5, -58], 1.0); }
    async function drive() {
      A.done = true; X.hand(null);
      const L = len(), err = Math.max(Math.abs(L.n - AZ.N), Math.abs(L.e - AZ.E));
      const grade = err <= 0.25 ? 'gold' : err <= 0.7 ? 'good' : 'ok';
      try { X.hero.act('tamp', { x: A.d.x, y: g(A.d.x, A.d.z) + 1.5, z: A.d.z }, { snap: true }); } catch (e) { /* */ }
      X.play('stamp'); X.dust(A.d.x, g(A.d.x, A.d.z) + 0.2, A.d.z, 8, 1.4);
      const at = { x: A.d.x, y: g(A.d.x, A.d.z) + 2.5, z: A.d.z };
      if (grade === 'ok') {
        // a release with the sides unequal: the master moves the stake (no damage: fewer points)
        X.word(at, 'האלכסונים לא שווים · רב האומנים מזיז את היתד');
        const from = { ...A.d }; for (let k = 1; k <= 20; k++) { await sleep(40); const u = ease(k / 20); A.d.x = lerp(from.x, AZ.D[0], u); A.d.z = lerp(from.z, AZ.D[1], u); draw(); }
      } else X.hit(at, grade, { text: grade === 'gold' ? 'פינה ישרה' : '', craft: 'מודדים' });
      await sleep(700);
      // the crews dig the trenches along the lines (the wall's plan on the ground), and the openings of the gates are kept
      X.line('הצוותים חופרים יסודות לאורך הקווים');
      await sleep(1600);
      X.end({ q: grade === 'gold' ? 1 : grade === 'good' ? 0.8 : 0.5, at });
    }
    return {
      begin() { shot(); draw(); X.line('גררו את היתד עד ששני הצדדים במידתם'); X.hand({ x: A.d.x, y: g(A.d.x, A.d.z) + 1.4, z: A.d.z }, 40, -20); try { X.hero.setPos(3.5, -58.5, Math.atan2(-8.1, -5.6)); } catch (e) { /* */ } },
      update(dt) { A.t += dt; for (const L of [labN, labE, labD]) L.frame(); },
      down(p) { if (A.done) return; const q = onPlane(X, p.x, p.y, g(A.d.x, A.d.z) + 0.8); if (q && Math.hypot(q.x - A.d.x, q.z - A.d.z) < 6) A.drag = true; },
      move(p) {
        if (!A.drag || A.done) return; const q = onPlane(X, p.x, p.y, g(A.d.x, A.d.z) + 0.8); if (!q) return;
        A.d.x = clamp(q.x, AZ.D[0] - 9, AZ.D[0] + 3); A.d.z = clamp(q.z, AZ.D[1] - 3, AZ.D[1] + 9); A.moved = true; draw();
      },
      up() { if (A.drag && A.moved && !A.done) { A.drag = false; drive(); } A.drag = false; },
      end() {
        for (const o of [stake, ...st, ...chalk]) P.remove(o); for (const r of [rN, rE, rD]) r.dispose(); for (const L of [labN, labE, labD]) L.remove(); for (const w of crew) SH2.crew.remove(w);
        holesOn(X, true);
      },
      at() { return { x: A.d.x, y: g(A.d.x, A.d.z) + 2, z: A.d.z }; },
      dbg() { const L = len(), q = X.scr(A.d.x, g(A.d.x, A.d.z) + 0.8, A.d.z), t = X.scr(AZ.D[0], g(AZ.D[0], AZ.D[1]) + 0.8, AZ.D[1]); return { done: A.done, n: +L.n.toFixed(2), e: +L.e.toFixed(2), stake: [Math.round(q.x), Math.round(q.y)], target: [Math.round(t.x), Math.round(t.y)] }; },
    };
  },
};

/* ───────── 2. the course in bond (the station that repeats, nine times) ───────── */
export const BOND = {
  icon: '🧱', title: 'הנדבך בקשר',
  walkLine: (m) => `קטע ${m.s} של החומה: עולים בשיפוע לראש החומה`,
  stand(m) { return standTop(frameOf(m.s)); },
  prepare(m, X) { const F = frameOf(m.s); try { X.stages.s20Pin(rampFor(F)); } catch (e) { /* */ } craneAt(X, F, F.G + 10.5); },
  make(m, X) {
    const F = frameOf(m.s), P = puzzleOf(m.s), lv = X.level(), T3 = X.THREE, PR = X.props;
    const A = { stones: [], ids: 0, drops: 0, clean: 0, cracks: 0, held: null, done: false, piles: [], t: 0, rot: {}, tapT: 0, tap0: null, closing: false };
    const occ = [Array(P.G).fill(null), Array(P.G).fill(null)];
    const meshes = [], marks = [], seams = [];
    // the joints of the course below: dark seams across each face row; chalked (white) where the level shows them (not at stretch 9)
    for (let r = 0; r < 2; r++) for (const x of P.below[r]) {
      const across = r === 0 ? 2 : -2, p = F.at(x, across, 0.03);
      const sm = new T3.Mesh(PR.geo.box, PR.M.seam); sm.scale.set(0.07, 0.02, 1.9); sm.position.set(p.x, p.y, p.z); sm.rotation.y = F.yaw; PR.root.add(sm); seams.push(sm);
      if (P.marks) { const ck = new T3.Mesh(PR.geo.box, PR.M.chalk); ck.scale.set(0.16, 0.025, 0.5); const q = F.at(x, across + (r === 0 ? 1.25 : -1.25), 0.04); ck.position.set(q.x, q.y, q.z); ck.rotation.y = F.yaw; PR.root.add(ck); marks.push(ck); }
    }
    // the bed of the stretch (the empty place in the course): the two face rows lit, an amah tick on their edges, the core between them
    // the crews' (spec "המגע": the child sees where the course goes and counts the amot)
    const bed = [], bedM = new T3.MeshBasicMaterial({ color: 0xF6F0DE, transparent: true, opacity: 0.3, depthWrite: false })   /* (lime on the bed, rule 9: a real site's marks, never yellow) */, tickM = new T3.MeshBasicMaterial({ color: 0x6A4A1E, transparent: true, opacity: 0.7, depthWrite: false });
    const spans = P.open ? [[0, P.open[0]], [P.open[1], P.G]] : [[0, P.G]];
    for (const [a0, b0] of spans) for (const r of [0, 2]) {
      const pl = new T3.Mesh(PR.geo.box, bedM); const c = F.at((a0 + b0) / 2, rowOff(r), 0.03); pl.scale.set(b0 - a0 - 0.08, 0.02, H111.ROW - 0.12); pl.position.set(c.x, c.y, c.z); pl.rotation.y = F.yaw; pl.renderOrder = 990; PR.root.add(pl); bed.push(pl);
      for (let x = a0; x <= b0; x++) { const tk = new T3.Mesh(PR.geo.box, tickM); const q = F.at(x, rowOff(r) + (r === 0 ? 0.85 : -0.85), 0.04); tk.scale.set(0.06, 0.02, 0.3); tk.position.set(q.x, q.y, q.z); tk.rotation.y = F.yaw; PR.root.add(tk); bed.push(tk); }
    }
    // the gate's opening (level 3): its timber frame stands in it, nothing is laid there
    const openM = [];
    if (P.open) { for (const x of P.open) { const p = F.at(x, 0, H / 2); const b = new T3.Mesh(PR.geo.box, PR.M.wood); b.scale.set(0.4, H * 1.6, H111.T + 0.3); b.position.set(p.x, p.y + 0.6, p.z); b.rotation.y = F.yaw; b.castShadow = true; PR.root.add(b); openM.push(b); } }
    // the stock: one pile per length beyond the gap (the crane brings them up), its count on a chip
    const PILE_AT = { 6: [F.G + 1.0, 2], 4: [F.G + 1.0, -2], 3: [F.G + 5.6, -2], 2: [F.G + 7.6, 2] };
    for (const s of P.stock) {
      const [al, ac] = PILE_AT[s.L]; const mm = stoneMesh(X, 1, 1, 1);
      const pile = { L: s.L, n: s.n, rot: 0, m: mm, al, ac, lab: label(X) };
      A.piles.push(pile); pileDraw(pile);
    }
    function pileDraw(p) {
      const hdr = p.rot && p.L === 6, w = hdr ? 2 : p.L, al = p.al + w / 2 + (hdr ? 0.6 : 0), ac = hdr ? 0 : p.ac;
      const q = F.at(al, ac, H / 2); p.m.position.set(q.x, q.y, q.z); p.m.rotation.set(0, F.yaw, 0); p.m.scale.set(w - 0.05, H - 0.02, hdr ? H111.T - 0.4 : H111.ROW - 0.06);
      p.m.visible = p.n > 0;
      p.lab.set(p.n > 0 ? `${p.L} אמות ×${p.n}` : '', F.at(al, ac, H + 1.0));
      p.at = F.at(al, ac, H);
    }
    // the hovering stone and its footprint
    const ghost = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.5, depthWrite: false, side: T3.DoubleSide }));
    ghost.rotation.x = -Math.PI / 2; ghost.visible = false; ghost.renderOrder = 998; PR.root.add(ghost);
    const crew = stationCrew(X, F);
    function shot() {
      // from outside, high: the wall's face rising, the whole stretch, the stock and the crane; he at the left third (spec "מבט מבחוץ ומלמעלה, בזווית")
      const mid = (-3 + F.G + 9) / 2, span = F.G + 13, d = 13 + span * 1.05;
      const t = F.at(mid, 0.3, 0.6), p = F.at(mid - span * 0.05, d * 0.5, d * 0.86);
      X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0);
    }
    /** the stone at a finger: the pile or the laid stone under it */
    function pick(p) {
      const objs = [...A.piles.filter((q) => q.n > 0).map((q) => q.m), ...A.stones.map((q) => q.m)];
      const hits = X.rayAt(p.x, p.y).intersectObjects(objs, false); if (!hits.length) return null;
      const o = hits[0].object; const pile = A.piles.find((q) => q.m === o); if (pile) return { pile };
      const st = A.stones.find((q) => q.m === o); return st ? { st } : null;
    }
    function fits(L, rot, row, a) {
      const hdr = rot && L === 6, w = hdr ? 2 : L;
      if (rot && L !== 6) return 'אבן ראש צריכה 6 אמות: לרוחב כל החומה';
      if (a < 0 || a + w > P.G) return 'מחוץ לקטע';
      for (let x = a; x < a + w; x++) {
        if (P.open && x >= P.open[0] && x < P.open[1]) return 'כאן פתח השער: משאירים אותו ריק';
        for (const r of hdr ? [0, 1] : [row === 0 ? 0 : 1]) if (occ[r][x] != null) return 'המקום תפוס';
      }
      return '';
    }
    /** the finger over the bed → a snapped place { a, row } for a stone of length L (rot: across) */
    function snap(px, py, L, rot) {
      const q = onPlane(X, px, py, F.y + H); if (!q) return null;
      const lo = F.local(q.x, q.z), hdr = rot && L === 6, w = hdr ? 2 : L;
      const a = Math.round(lo.along - w / 2), row = hdr ? 'h' : lo.across >= 0 ? 0 : 2;
      return { a, row, along: lo.along, across: lo.across, inBed: lo.along > -2 && lo.along < P.G + 1 && Math.abs(lo.across) < 4.5 };
    }
    function lay(L, rot, at) {
      const hdr = rot && L === 6, w = hdr ? 2 : L, row = hdr ? 'h' : at.row;
      const q = { id: ++A.ids, L, a: at.a, row, rot: hdr ? 1 : 0, m: null };
      q.m = stoneMesh(X, 1, 1, 1); placeStone(X, F, q.m, q); meshes.push(q.m); A.stones.push(q);
      for (let x = q.a; x < q.a + w; x++) for (const r of hdr ? [0, 1] : [row === 0 ? 0 : 1]) occ[r][x] = q.id;
      return q;
    }
    function unlay(q) {
      for (const r of [0, 1]) for (let x = 0; x < P.G; x++) if (occ[r][x] === q.id) occ[r][x] = null;
      const i = A.stones.indexOf(q); if (i >= 0) A.stones.splice(i, 1);
      if (q.mark) { PR.remove(q.mark); q.mark = null; }
    }
    function jointsOf(q) {
      const w = q.row === 'h' ? 2 : q.L, out = [];
      for (const r of q.row === 'h' ? [0, 1] : [q.row === 0 ? 0 : 1]) for (const x of [q.a, q.a + w]) { if (x <= 0 || x >= P.G || (P.open && (x === P.open[0] || x === P.open[1]))) continue; if (P.below[r].has(x)) out.push({ r, x }); }
      return out;
    }
    function settle(q) {
      A.drops++;
      const c = q.m.position; X.play('settle'); X.dust(c.x, F.y + 0.2, c.z, 8, 1.6); X.shake(0.1, 0.18);
      try { X.hero.act('tamp', { x: c.x, y: F.y + H, z: c.z }, { snap: true }); } catch (e) { /* */ }
      const J = jointsOf(q), at = { x: c.x, y: F.y + H + 1.2, z: c.z };
      if (J.length) {
        // a joint over a joint: chalked red at once (he may lift the stone again: rule 24); left so, it cracks when the next course lands
        const j = J[0], p = F.at(j.x, j.r === 0 ? 2 : -2, H + 0.04); const mk = new T3.Mesh(PR.geo.box, PR.M.redc); mk.scale.set(0.2, 0.03, 1.8); mk.position.set(p.x, p.y, p.z); mk.rotation.y = F.yaw; PR.root.add(mk); q.mark = mk;
        X.word(at, 'חיבור מעל חיבור!');
      } else { A.clean++; X.hit(at, 'gold', { text: '', craft: 'בנאים' }); }
      if (checkCourse(P, A.stones).full) close();
      else X.line(lv >= 2 && !A.stones.some((s) => s.row === 'h') && P.stock.some((s) => s.L === 6) ? 'צריך גם אבן ראש: הקישו על אבן 6 כדי לסובב אותה לרוחב' : 'עוד אבן · בלי חיבור מעל חיבור');
    }
    async function close() {
      if (A.closing || A.done) return; A.closing = true; X.hand(null);
      const C = checkCourse(P, A.stones);
      X.line('');
      if (C.joj.length) {
        // the next course is lowered onto it: every stone over a joint cracks — the master takes it out, a new one comes up from the stock
        await sleep(500); X.play('rope'); await sleep(500);
        const bad = [...new Set(C.joj.map((j) => j.id))].map((id) => A.stones.find((s) => s.id === id)).filter(Boolean);
        for (const q of bad) {
          const c = q.m.position, at = { x: c.x, y: F.y + H + 1.4, z: c.z };
          const cr = new T3.Mesh(PR.geo.box, PR.M.seam); cr.scale.set(0.06, H * 0.9, (q.row === 'h' ? H111.T : H111.ROW) + 0.08); cr.position.copy(c); cr.rotation.set(0, F.yaw, 0.35); PR.root.add(cr);
          X.shake(0.25, 0.4); X.dust(c.x, c.y, c.z, 14, 1.8);
          X.loss(20, at, 'חיבור מעל חיבור: האבן נסדקה', 1); A.cracks++;
          await sleep(900);
          PR.remove(cr); unlay(q); PR.remove(q.m);
          const pile = A.piles.find((p) => p.L === q.L); if (pile) { pile.n++; pileDraw(pile); }
        }
        X.line('רב האומנים הוציא את הסדוקה · הניחו שוב, בלי חיבור מעל חיבור');
        A.closing = false; return;
      }
      A.done = true;
      const noHead = lv >= 2 && !C.head;
      const at = F.at(P.G / 2, 0, H + 1.6);
      if (noHead) {
        X.word(at, 'בלי אבן ראש: הפנים נפתחות מעט · כשר');
        for (const q of A.stones) if (q.row === 0) { q.off = 0.08; placeStone(X, F, q.m, q); }
        X.shake(0.12, 0.2);
      } else if (!A.cracks) X.bonus(100, 'course', lv >= 2 ? 'נדבך קשור, בלי חיבור על חיבור' : 'נדבך בלי חיבור על חיבור');
      // the crews pour the core between the faces
      await sleep(500);
      const fills = laidFill(X, F, P, A.stones); X.play('tier'); X.dust(at.x, F.y + H, at.z, 16, P.G * 0.3);
      // kept in the wall: the plumb line comes next on these stones
      const st = X.M.st; st.lay[m.s] = { stones: A.stones.map((q) => ({ a: q.a, L: q.L, row: q.row, off: q.off || 0 })) };
      SH2.laid[m.s] = { stones: st.lay[m.s].stones.map((q) => ({ ...q })), meshes: A.stones.map((q) => q.m) };
      SH2.fill[m.s] = fills; meshes.length = 0;
      X.save();
      const q = (A.clean / Math.max(1, A.drops)) * (noHead ? 0.75 : 1) * (A.cracks ? 0.85 : 1);
      await sleep(900);
      X.end({ q, stars: starsOf(q), at });
    }
    return {
      begin() {
        shot();
        const st = standTop(F); try { X.hero.setPos(st.x, st.z, Math.atan2(st.face[0] - st.x, st.face[1] - st.z)); } catch (e) { /* */ }
        const p0 = A.piles.find((p) => p.L !== 6) || A.piles[0];
        X.line(P.marks ? 'גררו אבן מהערימה אל הקטע · הקווים הלבנים: חיבורים שמתחת' : 'קטע 9: בלי סימונים · מצאו את החיבורים שמתחת');
        if (p0) { const s0 = X.scr(p0.at.x, p0.at.y, p0.at.z), s1 = X.scr(F.at(1, 2, H).x, F.at(1, 2, H).y, F.at(1, 2, H).z); X.hand(p0.at, Math.round(s1.x - s0.x) * 0.5, Math.round(s1.y - s0.y) * 0.5); }
      },
      update(dt) {
        A.t += dt; for (const p of A.piles) p.lab.frame();
        if (A.held) {
          const h = A.held, sn = h.snap, hdr = h.rot && h.L === 6, w = hdr ? 2 : h.L;
          if (sn) {
            const ok = sn.inBed && !fits(h.L, h.rot, sn.row, sn.a);
            const tmp = { a: sn.a, L: h.L, row: hdr ? 'h' : sn.row };
            placeStone(X, F, h.m, tmp, 1.1);
            if (sn.inBed) { const c = F.at(sn.a + w / 2, hdr ? 0 : rowOff(sn.row), 0.06); ghost.position.set(c.x, c.y, c.z); ghost.rotation.set(-Math.PI / 2, 0, F.yaw); ghost.scale.set(w, hdr ? H111.T : H111.ROW, 1); ghost.material.color.setHex(ok ? 0xFFD66E : 0xE0563E); ghost.visible = true; } else ghost.visible = false;
          }
        } else ghost.visible = false;
      },
      down(p) {
        if (A.done || A.closing) return;
        const k = pick(p); A.tap0 = { x: p.x, y: p.y, t: A.t, k };
      },
      move(p) {
        if (A.done || A.closing || !A.tap0) return;
        if (!A.held && Math.hypot(p.x - A.tap0.x, p.y - A.tap0.y) > 10 && A.tap0.k) {
          const k = A.tap0.k;
          if (k.pile && k.pile.n > 0) { k.pile.n--; pileDraw(k.pile); A.held = { L: k.pile.L, rot: k.pile.rot, m: stoneMesh(X, 1, 1, 1), from: k.pile, snap: null }; }
          else if (k.st) { const q = k.st; unlay(q); A.held = { L: q.L, rot: q.row === 'h' ? 1 : 0, m: q.m, from: A.piles.find((pp) => pp.L === q.L), snap: null, again: true }; }
          X.play('rope'); X.hand(null);
        }
        if (A.held) A.held.snap = snap(p.x, p.y, A.held.L, A.held.rot);
      },
      up(p) {
        if (A.done || A.closing) { A.tap0 = null; return; }
        const t0 = A.tap0; A.tap0 = null;
        if (!A.held) {
          // a tap: the stone turns (along the wall ↔ across it as a header: the 6 only)
          if (t0 && t0.k && Math.hypot(p.x - t0.x, p.y - t0.y) < 12) {
            const k = t0.k;
            if (k.pile) { if (k.pile.L === 6) { k.pile.rot = 1 - k.pile.rot; pileDraw(k.pile); X.play('stamp'); X.line(k.pile.rot ? 'אבן ראש: לרוחב החומה, קושרת את שתי הפנים' : 'לאורך החומה'); } else X.word(k.pile.at, 'רק אבן של 6 אמות נכנסת לרוחב החומה'); }
            else if (k.st) {
              const q = k.st; if (q.L !== 6) { X.word({ x: q.m.position.x, y: F.y + H + 1, z: q.m.position.z }, 'רק אבן של 6 אמות נכנסת לרוחב'); return; }
              const rot = q.row === 'h' ? 0 : 1; unlay(q);
              const at = rot ? { a: clamp(q.a + (q.row === 'h' ? 0 : 2), 0, P.G - 2), row: 'h' } : { a: clamp(q.a, 0, P.G - 6), row: 0 };
              const why = fits(6, rot, at.row, at.a);
              if (why) { const back = lay(6, q.row === 'h' ? 1 : 0, { a: q.a, row: q.row === 'h' ? 0 : q.row }); PR.remove(back.m); back.m = q.m; placeStone(X, F, q.m, back); X.word({ x: q.m.position.x, y: F.y + H + 1, z: q.m.position.z }, 'אין מקום לסובב כאן'); return; }
              PR.remove(q.m); const nq = lay(6, rot, at); A.drops--; settle(nq);
            }
          }
          return;
        }
        const h = A.held; A.held = null; ghost.visible = false;
        const sn = h.snap, why = sn && sn.inBed ? fits(h.L, h.rot, sn.row, sn.a) : 'out';
        if (!sn || why) {
          // back to its pile (outside the bed, or it does not fit there)
          if (why && why !== 'out' && sn) X.word(F.at(sn.a + h.L / 2, 0, H + 1.4), why);
          PR.remove(h.m); const pile = h.from || A.piles.find((pp) => pp.L === h.L); if (pile) { pile.n++; pileDraw(pile); }
          return;
        }
        PR.remove(h.m);
        const q = lay(h.L, h.rot, sn); settle(q);
      },
      end() {
        for (const o of [...seams, ...marks, ...openM, ...bed, ghost]) PR.remove(o);
        for (const p of A.piles) { PR.remove(p.m); p.lab.remove(); }
        for (const q of A.stones) if (q.mark) PR.remove(q.mark);
        for (const mm of meshes) PR.remove(mm);
        if (A.held) PR.remove(A.held.m);
        for (const w of crew) SH2.crew.remove(w);
      },
      at() { return F.at(P.G / 2, 0, H + 1); },
      dbg() {
        const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; };
        return {
          s: m.s, G: P.G, lv, done: A.done, closing: A.closing, held: !!A.held, cracks: A.cracks, drops: A.drops, clean: A.clean,
          piles: A.piles.map((p) => ({ L: p.L, n: p.n, rot: p.rot, scr: sc(p.at) })),
          laid: A.stones.map((q) => [q.a, q.L, q.row]), sol: P.sol, head: P.head, open: P.open,
          below: [[...P.below[0]], [...P.below[1]]],
          cell: (a, w, row) => sc(F.at(a + w / 2, row === 'h' ? 0 : rowOff(row), H)),
          cells: [0, 2, 'h'].map((row) => Array.from({ length: P.G + 1 }, (_, x) => sc(F.at(x, row === 'h' ? 0 : rowOff(row), H)))),
        };
      },
    };
  },
};

/* ───────── 3. the plumb line (after every course, nine times) ───────── */
const SB = 2 / 24;   // the setback: about two fingers (an amah of 24 fingers; Herodian courses 3–5 cm in, archaeology of the Western Wall)
export const PLUMB = {
  icon: '📐', title: 'היישור באנך',
  walkLine: (m) => `קטע ${m.s}: יישור באנך`,
  stand(m) { const F = frameOf(m.s); return standTop(F, -1.4, 0.4); },
  prepare(m, X) { const F = frameOf(m.s); try { X.stages.s20Pin(rampFor(F)); } catch (e) { /* */ } craneAt(X, F, F.G + 10.5); },
  make(m, X) {
    const F = frameOf(m.s), lv = X.level(), T3 = X.THREE, PR = X.props, Pz = puzzleOf(m.s);
    const wet = lv >= 3, target = lv >= 2 ? -SB : 0, TOL = { gold: 0.04, good: 0.1 };
    const L = ensureLaid(X, m.s);
    const st = X.M.st;
    // the outer face's stones, two or three of them out of line (the crews set them roughly; he trues them)
    let face = L ? L.stones.map((q, i) => ({ q, m: L.meshes[i] })).filter((o) => o.q.row === 0) : [];
    if (!face.length && L) face = L.stones.map((q, i) => ({ q, m: L.meshes[i] })).filter((o) => o.q.row === 'h');
    const r = (k) => { const v = Math.sin((m.s * 31 + k * 17) * 12.9898) * 43758.5453; return v - Math.floor(v); };
    const nOff = Math.min(face.length, lv >= 2 ? 3 : 2);
    const pickI = face.map((_, i) => i).sort((a, b) => r(a) - r(b)).slice(0, nOff).sort((a, b) => face[a].q.a - face[b].q.a);
    const S = pickI.map((i, k) => ({ o: face[i], off: (r(k + 5) > 0.5 ? 1 : -1) * (0.3 + 0.35 * r(k + 9)), taps: 0, hard: 0, cracked: false, okd: false, q: 1, par: 0, crack: null, ind: null, rod: null, str: null, bob: null }));
    for (const s of S) { s.par = 1 + Math.ceil(Math.abs(s.off - target) / 0.32); s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); }
    const A = { press: null, done: false, t: 0, breaks: 0, busy: false };
    // the plumb rods: a rod out over the face from the top, the line and its bob down to the course below (its face is the plumb)
    const rodM = PR.M.wood, strM = new T3.MeshBasicMaterial({ color: 0x2A1E12 }), arrowM = new T3.MeshBasicMaterial({ color: 0xE0563E, transparent: true, opacity: 0.95, depthWrite: false }), goldLine = new T3.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.9, depthWrite: false });
    for (const s of S) {
      const w = s.o.q.L, al = s.o.q.a + w / 2;
      const rod = new T3.Mesh(PR.geo.box, rodM); const r0 = F.at(al, 3.1 - 1.2, H + 0.35 + 0.12); rod.scale.set(0.16, 0.16, 2.8); rod.position.set(r0.x, r0.y, r0.z); rod.rotation.y = F.yaw; PR.root.add(rod); s.rod = rod;
      const top = F.at(al, 3.02, H + 0.35), bot = F.at(al, 3.02, -H * 0.55);
      const str = new T3.Mesh(PR.geo.box, strM); str.scale.set(0.03, top.y - bot.y, 0.03); str.position.set(top.x, (top.y + bot.y) / 2, top.z); PR.root.add(str); s.str = str;
      const bob = new T3.Mesh(new T3.ConeGeometry(0.18, 0.4, 8), PR.M.woodD); bob.rotation.x = Math.PI; bob.position.set(bot.x, bot.y - 0.2, bot.z); PR.root.add(bob); s.bob = bob;
      // the mark to reach (from level 2: two fingers in from the line) as a gold tick on the stone's top, and the arrow of the error
      const ind = new T3.Mesh(new T3.ConeGeometry(0.28, 0.7, 3), arrowM.clone()); PR.root.add(ind); s.ind = ind;
      const tk = new T3.Mesh(PR.geo.box, goldLine); const tp = F.at(al, 3 + target, H + 0.03); tk.scale.set(w * 0.9, 0.03, 0.07); tk.position.set(tp.x, tp.y, tp.z); tk.rotation.y = F.yaw; PR.root.add(tk); s.tick = tk;
    }
    const err = (s) => s.off - target;
    function indSync(s) {
      const w = s.o.q.L, al = s.o.q.a + w / 2, e = err(s), ok = Math.abs(e) <= TOL.good;
      const p = F.at(al, 3 + s.off + (e > 0 ? 0.6 : 1.4), H + 0.9); s.ind.position.set(p.x, p.y, p.z);
      // the arrow points the way the stone must go: inward (−n) when it stands proud, outward when it is sunk
      const dir = e > 0 ? -1 : 1, yaw = Math.atan2(F.nx * dir, F.nz * dir); s.ind.rotation.set(Math.PI / 2, 0, 0); s.ind.rotation.y = 0; s.ind.quaternion.setFromEuler(new T3.Euler(Math.PI / 2, yaw, 0, 'YXZ'));
      const k = clamp(Math.abs(e) / 0.5, 0.35, 1.2); s.ind.scale.set(k, k, k); s.ind.visible = !s.okd;
      s.ind.material.color.setHex(ok ? 0xFFD66E : 0xE0563E); s.tick.material = s.okd ? goldLine : goldLine;
    }
    S.forEach(indSync);
    const crew = stationCrew(X, F);
    function shot() {
      // close, from outside and a little along the face: the stones' faces against the lines (rule 16: ≤ 10 s of close work each)
      const a0 = S.length ? S[0].o.q.a : 0, a1 = S.length ? S[S.length - 1].o.q.a + S[S.length - 1].o.q.L : F.G, mid = (a0 + a1) / 2, span = Math.max(7, a1 - a0 + 4);
      const t = F.at(mid, 2.6, H * 0.55), p = F.at(mid - span * 0.75, 3 + span * 0.62, H + span * 0.32);
      X.shot([p.x, p.y, p.z], [t.x, t.y, t.z], 1.0);
    }
    function stoneAt(p) {
      const hits = X.rayAt(p.x, p.y).intersectObjects(S.filter((s) => !s.okd).map((s) => s.o.m), false);
      return hits.length ? S.find((s) => s.o.m === hits[0].object) : null;
    }
    async function breakStone(s) {
      // the third hard blow: the corner breaks off, the stone is rejected; the crews' wheel lifts it out and lowers a new one
      A.busy = true; A.breaks++;
      const c = s.o.m.position, at = { x: c.x, y: c.y + H, z: c.z };
      try { PR.chunksAt({ x: c.x + F.nx * 1, y: c.y - H / 2, z: c.z + F.nz * 1, r: 0.8 }, 5); } catch (e) { /* */ }
      X.dust(c.x, c.y, c.z, 18, 1.6); X.shake(0.3, 0.5);
      X.loss(20, at, 'הפינה נשברה · האבן נפסלה', 1);
      if (s.crack) { PR.remove(s.crack); s.crack = null; }
      X.line('גלגל הדריכה מרים אותה החוצה ומוריד אבן חדשה');
      const y0 = s.o.m.position.y;
      for (let k = 1; k <= 18; k++) { await sleep(45); s.o.m.position.y = y0 + ease(k / 18) * 6; }
      s.off = (Math.random() > 0.5 ? 1 : -1) * (0.3 + 0.25 * Math.random()); s.hard = 0; s.taps = 0; s.par = 1 + Math.ceil(Math.abs(err(s)) / 0.32); s.q = 0.6;
      s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); const y1 = s.o.m.position.y;
      for (let k = 1; k <= 18; k++) { await sleep(45); s.o.m.position.y = y1 + (1 - ease(k / 18)) * 6; }
      X.play('settle'); X.dust(c.x, y1 - H / 2, c.z, 8, 1.4); indSync(s);
      X.line('מיישרים את החדשה מההתחלה'); A.busy = false;
    }
    function strike(s, hold) {
      // the mallet's force is the blow's length (press): short moves a little, long moves more; L3: the bed wet, more for every blow
      const push = (0.03 + clamp(hold, 0, 0.9) * 0.8) * (wet ? 1.35 : 1), hard = hold >= 0.42;
      const e0 = err(s), dir = e0 > 0 ? -1 : 1;
      s.taps++;
      const was = s.off; s.off += dir * push;
      try { X.hero.act('tamp', { x: s.o.m.position.x, y: s.o.m.position.y + H / 2, z: s.o.m.position.z }, { snap: true }); } catch (e) { /* */ }
      X.play(hard ? 'strike' : 'chip'); X.dust(s.o.m.position.x + F.nx * 0.8, s.o.m.position.y, s.o.m.position.z + F.nz * 0.8, hard ? 7 : 3, 0.8);
      s.o.q.off = s.off; placeStone(X, F, s.o.m, s.o.q); indSync(s);
      const at = { x: s.o.m.position.x, y: s.o.m.position.y + H, z: s.o.m.position.z };
      if (hard) {
        s.hard++;
        if (s.hard === 2) { X.play('crack'); X.word(at, 'סדק דק! עוד מכה חזקה והפינה תישבר'); const cr = new T3.Mesh(PR.geo.box, PR.M.seam); const p = F.at(s.o.q.a + s.o.q.L * 0.3, 3.02 + s.off, H * 0.5); cr.scale.set(0.05, H * 0.75, 0.05); cr.position.set(p.x, p.y, p.z); cr.rotation.set(0, F.yaw, 0.4); PR.root.add(cr); s.crack = cr; s.cracked = true; }
        if (s.hard >= 3) { breakStone(s); return; }
      }
      const e = err(s);
      if (Math.sign(e) !== Math.sign(e0) && Math.abs(e) > TOL.good) X.word(at, 'עבר את הקו · מחזירים מהצד השני');
      if (Math.abs(e) <= TOL.good) {
        s.okd = true; s.ind.visible = false;
        const g = Math.abs(e) <= TOL.gold && s.taps <= s.par ? 'gold' : Math.abs(e) <= TOL.gold || s.taps <= s.par + 1 ? 'good' : 'ok';
        s.q *= g === 'gold' ? 1 : g === 'good' ? 0.82 : 0.6; if (s.cracked) s.q *= 0.85;
        X.hit(at, g, { text: '', craft: 'בנאים' }); X.play('tier');
        if (S.every((q) => q.okd)) finish();
        else X.line('האבן הבאה');
      }
      void was;
    }
    async function finish() {
      A.done = true; X.hand(null); X.line('');
      // the line of light along the face: every stone true
      const a0 = 0, a1 = F.G, bar = new T3.Mesh(PR.geo.box, goldLine); bar.scale.set(0.25, H * 1.05, 0.25); PR.root.add(bar);
      for (let k = 0; k <= 24; k++) { const p = F.at(lerp(a0, a1, k / 24), 3.15 + target, H / 2); bar.position.set(p.x, p.y, p.z); await sleep(35); }
      PR.remove(bar);
      if (A.breaks === 0 && S.every((s) => !s.cracked)) X.bonus(100, 'plumb', lv >= 2 ? 'בנסיגה של שתי אצבעות' : 'באנך');
      // what stays in the wall: the stones as he left them
      const lay = st.lay[m.s]; if (lay) { lay.stones.forEach((q, i) => { q.off = L.stones[i] ? (L.stones[i].off || 0) : 0; }); for (const s of S) { const i = L.meshes.indexOf(s.o.m); if (i >= 0) lay.stones[i].off = s.off; } }
      X.save();
      const q = S.length ? S.reduce((a, s) => a + s.q, 0) / S.length : 1;
      await sleep(600);
      X.end({ q, stars: starsOf(q), at: F.at(F.G / 2, 3, H + 1) });
    }
    return {
      close: true,
      begin() {
        shot(); const sp = standTop(F, -1.4, 0.4); try { X.hero.setPos(sp.x, sp.z, Math.atan2(sp.face[0] - sp.x, sp.face[1] - sp.z)); } catch (e) { /* */ }
        if (!S.length) { setTimeout(() => X.end({ q: 1, stars: 3 }), 300); return; }
        X.line(lv >= 2 ? 'לחצו על אבן: לחיצה קצרה מזיזה מעט · היעד: שתי אצבעות פנימה מהקו' : 'לחצו על אבן בולטת או שקועה: לחיצה קצרה מזיזה מעט, ארוכה יותר');
        const s = S[0]; X.hand({ x: s.o.m.position.x, y: s.o.m.position.y + H * 0.2, z: s.o.m.position.z }, 0, 10);
      },
      update(dt) {
        A.t += dt;
        if (A.press) { const k = clamp((A.t - A.press.t) / 0.9, 0, 1); const s = A.press.s; X.meter({ x: s.o.m.position.x, y: s.o.m.position.y + H * 1.2, z: s.o.m.position.z }, k); }
        // the bobs sway a little (the wind on the wall)
        for (const s of S) if (s.bob) s.bob.position.x += Math.sin(A.t * 2.1 + s.o.q.a) * 0.0006;
      },
      down(p) { if (A.done || A.busy) return; const s = stoneAt(p); if (s) A.press = { s, t: A.t }; },
      move() {},
      up() { const pr = A.press; A.press = null; X.meter(null); if (!pr || A.done || A.busy) return; strike(pr.s, A.t - pr.t); },
      end() {
        for (const s of S) { for (const o of [s.rod, s.str, s.bob, s.ind, s.tick, s.crack]) if (o) PR.remove(o); }
        for (const w of crew) SH2.crew.remove(w);
      },
      at() { return F.at(F.G / 2, 3, H + 1); },
      dbg() {
        const sc = (o) => { const r2 = X.scr(o.x, o.y, o.z); return [Math.round(r2.x), Math.round(r2.y)]; };
        return { s: m.s, lv, done: A.done, busy: A.busy, wet, breaks: A.breaks, stones: S.map((s) => ({ err: +err(s).toFixed(3), okd: s.okd, hard: s.hard, taps: s.taps, scr: sc({ x: s.o.m.position.x, y: s.o.m.position.y, z: s.o.m.position.z }) })) };
      },
    };
  },
};

export const ACTS = {
  stakes: STAKES, bond: BOND, plumb: PLUMB, lever: LEVER, gates: GATES, closing: CLOSING,
  __init: initWorld,
  __sh: () => SH2,
  __frame(dt, X) { frameWorld(dt, X); },
};
void H;
