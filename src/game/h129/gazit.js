/* ── build 129 ── h129/gazit.js — station 1, "לשכת הגזית" (brief §4): the Sanhedrin's chamber, seen from high over its north wall (the
 * roof not on yet). Three works:
 *   gazit1  the bench: seven stones in a straight row; the crew moves a stone with bars (the middle of a stone drags it, an end turns it
 *           round its other end; it follows late, and struck hard on a wall or another stone a corner cracks: gazit.crack). The court
 *           sits on it at the opening and the ends do not see each other; a tap on the head of the court (the middle judge, waiting in
 *           the holy half) sits them again: three raise a hand in turn and each judge turns his head at once or leans and searches.
 *           "רואה!" when a stone's judge first sees all the others, "כולם רואים!" when the test passes (sanh3 after).
 *   gazit2  the rows and the scribes: three mats (12, 10, 8) and two writing stands by the north door; drag them (a mat's end turns it)
 *           inside the arc, on nothing, a stand west and one east of the middle stone that sees all seven. "יש מקום!" when all fit;
 *           the students come in (every second seat) and each scribe writes ("כותב!").
 *   gazit3  the semicha (Sanhedrin 4:4): a judge leaves; the head of row 1 to his seat, the head of row 2 to the end of row 1, the head
 *           of row 3 to the end of row 2, one of the crowd to the end of row 3, each by a path the player draws on the floor from the
 *           man to his place; he stops at the edge of a mat people sit on (stays standing), a path near a stand spills the ink
 *           (gazit.ink); "במקומו!" (sanh4 after).
 * The model: model.js (stoneStep, benchState, testPlan, roomFor, walkCheck, semichaPlan/Fresh/Send, gazitPts). Every place: BOOK.s07.
 */
import { H129, LINES, QUICK, LOSS, row0, benchState, testPlan, stoneStep, roomFor, matOf, standOf, matSeats, normalOf, endOf, corners, legalStone, walkCheck, semichaPlan, semichaFresh, semichaSend, gazitPts, qOf, starsOf } from './model.js';
import { SH7, mats7, benchStone, matMesh, standMesh, inkStain, own, setBusy } from './world.js';
import { createVoices } from './sound129.js';
import { card, cite, holdLens } from './ui7.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, GZ = S7.gazit, CAM = S7.cam, F16 = GZ.floor, SH = GZ.row0.H;
const ORD = ['הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי', 'השישי', 'השביעי'];
const JUDGE = ['#3F4F6E', '#4E3F5E', '#3E5A4E', '#6E3F2E', '#3E5A4E', '#4E3F5E', '#3F4F6E'];
const STUD = ['#8C6E4A', '#6E7A5A', '#8A7A62', '#7A5E4E', '#5E6E7A'];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** the arc the court sits in (a solution: the bot's, and the bench of a page where gazit1 was given to the crews): seven stones along a
 *  half ellipse round a point an amah inside the holy line under the middle of the room, an even way apart along it, each turned
 *  toward the inside (a half circle of seven stones does not fit the chol half's depth with room between them) */
export function solvedArc() {
  const cx = GZ.wait[0], cz = GZ.holy + 1, A = 15, Bz = 8, sp = 0.2, N = 400, P = [];
  for (let k = 0, L = 0; k <= N; k++) { const t = Math.PI - sp - ((Math.PI - 2 * sp) * k) / N, p = [cx + A * Math.cos(t), cz + Bz * Math.sin(t)]; if (k) L += Math.hypot(p[0] - P[k - 1].p[0], p[1] - P[k - 1].p[1]); P.push({ t, p, L }); }
  const len = P[N].L;
  return GZ.row0.xs.map((_, i) => { const q = P.find((o) => o.L >= (len * i) / 6 - 1e-9) || P[N]; return { i, x: q.p[0], z: q.p[1], a: Math.atan2(-Bz * Math.cos(q.t), A * Math.sin(q.t)), L: GZ.row0.L, D: GZ.row0.D, crack: 0 }; });
}
/** the rows and stands for that arc (rows 2.4 apart: aisles between them) */
export function solvedRows() {
  const x = GZ.wait[0], z0 = GZ.holy + 2, g = 2.4;
  return { mats: [matOf(0, x, z0 + 2 * g, 0), matOf(1, x, z0 + g, 0), matOf(2, x, z0, 0)], stands: [standOf('W', x - 7, GZ.holy + 0.7), standOf('E', x + 7, GZ.holy + 0.7)] };
}
const cp = (s) => ({ i: s.i, x: s.x, z: s.z, a: s.a, L: s.L, D: s.D, crack: s.crack | 0, s: 0 });

export const GAZIT = {
  icon: '⚖', title: 'לשכת הגזית',
  walkLine: (m) => (m && m.id === 'gazit3' ? 'לשכת הגזית: הסמיכה' : m && m.id === 'gazit2' ? 'לשכת הגזית: התלמידים והסופרים' : 'לשכת הגזית: הספסל'),
  stand() { const s = GZ.stand; return { x: s[0], z: s[1], face: [s[0], s[1] + 4] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X), AC = X.actors ? X.actors() : null;
    const A = { phase: 'intro', t: 0, ev: [], fails: 0, dmg: 0, standing: 0, seen: new Set(), drag: new Map(), busy: 0, viewT: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const root = new T.Group(); root.name = 'h129-gazit-act'; X.props.root.add(root);
    own('bench', 1); if (m.id !== 'gazit1') own('mats', 1);
    setBusy(X, 1); X.kohen(false);   // (his stand is inside the arc, under the camera's look)
    const cam0 = X.camera, fov0 = cam0.fov;
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    // ── the bench: the save's (gazit1 opens on the straight row); a stone's grips: the middle disc and the two end bars, gold
    let stones = m.id === 'gazit1' ? row0().map(cp) : (st.gazit && st.gazit.stones ? st.gazit.stones.map(cp) : solvedArc());
    for (const q of Mo.marksOf('gazit.crack')) if (stones[q.n]) stones[q.n].crack = 1;
    const SM = stones.map((s) => benchStone(X, s, { parent: root }));
    const gold = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.92, depthWrite: false });
    const goldHot = new T.MeshBasicMaterial({ color: 0xFFF2C0, depthWrite: false });
    if (m.id === 'gazit1') SM.forEach((g, i) => {
      const s = stones[i], disc = new T.Mesh(new T.CircleGeometry(0.34, 16), gold); disc.rotation.x = -Math.PI / 2; disc.position.set(0, SH + 0.03, 0.12); g.add(disc);
      for (const e of [-1, 1]) { const b = new T.Mesh(X.props.geo.box, gold); b.scale.set(0.22, 0.04, s.D * 0.7); b.position.set(e * (s.L / 2 - 0.2), SH + 0.03, 0); g.add(b); }
      g.userData.grips = g.children.slice(-3);
    });
    const hot = (i, on) => { const g = SM[i]; if (g && g.userData.grips) for (const c of g.userData.grips) c.material = on ? goldHot : gold; };
    // ── the court: seven judges (the middle one the head of the court, a staff in his hand), waiting in the holy half
    const J = [], add = (x, z, o = {}) => { if (!AC) return null; const a = AC.add(o.variant || 'pilgrim', x, z, { yaw: o.yaw || 0, col: o.col, col2: o.col2 || '#E8E0CC', fadeIn: false }); a.vis = a.visT = 1; a.gang = 1; if (o.item) AC.setItem(a, o.item); return a; };
    const waitAt = (i) => [GZ.wait[0] + (i - 3) * 2.3, GZ.wait[1] + (i === 3 ? 0.8 : 0)];
    const seatAt = (i) => [stones[i].x, stones[i].z];
    const besideAt = (i) => { const n = normalOf(stones[i]); return [stones[i].x + n[0] * 1.6, stones[i].z + n[1] * 1.6]; };
    const facing = (a, x, z) => { if (a) a.yaw = Math.atan2(x - a.x, z - a.z); };
    const sitOn = (a, i) => { if (!a) return; const s = stones[i], n = normalOf(s); if (legalStone(s)) { a.x = s.x; a.z = s.z; a.fixedY = F16 + SH; a.yaw = Math.atan2(n[0], n[1]); AC.pose(a, 'sit'); } else { const b = besideAt(i); a.x = b[0]; a.z = b[1]; a.fixedY = undefined; facing(a, s.x, s.z); AC.pose(a, 'stand'); } a.look = null; };
    const standUp = (a) => { if (!a) return; a.fixedY = undefined; a.look = null; AC.pose(a, 'stand'); };
    const seatedStart = m.id !== 'gazit1';
    for (let i = 0; i < 7; i++) { const w = waitAt(i), a = add(w[0], w[1], { col: JUDGE[i], item: i === 3 ? 'staff' : 'scroll' }); J.push(a); if (a) { if (seatedStart) sitOn(a, i); else { facing(a, w[0], w[1] + 4); AC.pose(a, i === 3 ? 'stand' : 'talk'); } } }
    const head = () => J[3];
    // ── the crew's two men with bars, there only while a stone moves (beside it on its outer side)
    const crew = [];
    function crewFor(i) {
      if (!SH7.crew) return;
      while (crew.length < 2) { const w = SH7.crew.add(stones[i].x, stones[i].z, { role: 'push', item: 'staff', crew: 1 }); if (!w) break; crew.push(w); }
      crewAt(i);
    }
    function crewAt(i) {
      const s = stones[i], n = normalOf(s), ux = Math.cos(s.a), uz = Math.sin(s.a), I = GZ.in;
      crew.forEach((w, k) => { const o = (k ? 1 : -1) * s.L * 0.3, x = clamp(s.x + ux * o - n[0] * (s.D / 2 + 0.8), I[0] + 0.5, I[2] - 0.5), z = clamp(s.z + uz * o - n[1] * (s.D / 2 + 0.8), I[1] + 0.5, I[3] - 0.5); w.a.x = x; w.a.z = z; w.fx = s.x; w.fz = s.z; });
    }
    const crewOff = () => { for (const w of crew.splice(0)) SH7.crew.remove(w); };
    // ── gazit2/3: the mats and the stands
    const SR = solvedRows();
    let mats = st.gazit && st.gazit.mats ? st.gazit.mats.map((q) => ({ ...q })) : null, stands = st.gazit && st.gazit.stands ? st.gazit.stands.map((q) => ({ ...q })) : null;
    if (m.id === 'gazit3' && (!mats || !stands)) { mats = SR.mats.map((q) => ({ ...q })); stands = SR.stands.map((q) => ({ ...q })); }
    if (m.id === 'gazit2') {
      // (by the north door, rolled out in the holy half along its line: the player carries them into the arc)
      const x = GZ.doorN[0], z = GZ.holy - 0.9;
      mats = [matOf(0, x, z, 0), matOf(1, x, z - 1.4, 0), matOf(2, x, z - 2.8, 0)]; stands = [standOf('W', x - 12, z - 1.4), standOf('E', x + 12, z - 1.4)];
    }
    const MM = (mats || []).map((q) => matMesh(X, q, { parent: root })), TM = (stands || []).map((q) => standMesh(X, q, { parent: root }));
    // (a mat's grips: its middle third and its two ends, gold strips on its edge; a ring round each stand)
    const okMat = new T.MeshBasicMaterial({ color: 0x8FE07A, transparent: true, opacity: 0.85, depthWrite: false }), badMat = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.85, depthWrite: false });
    const marks = [];
    if (m.id === 'gazit2') {
      MM.forEach((g, k) => { const q = mats[k], f = new T.Mesh(X.props.geo.box, badMat); f.scale.set(q.L + 0.2, 0.03, 0.16); f.position.set(0, 0.07, q.D / 2 + 0.08); g.add(f); const b = f.clone(); b.position.z = -q.D / 2 - 0.08; g.add(b); for (const e of [-1, 1]) { const c = new T.Mesh(X.props.geo.box, badMat); c.scale.set(0.16, 0.03, q.D + 0.3); c.position.set(e * (q.L / 2 + 0.08), 0.07, 0); g.add(c); g.userData['e' + e] = c; } marks.push([f, b, g.userData.e1, g.userData['e-1']]); });
      TM.forEach((g) => { const r = new T.Mesh(new T.RingGeometry(0.75, 0.95, 20), badMat); r.rotation.x = -Math.PI / 2; r.position.y = 0.06; g.add(r); marks.push([r]); });
    }
    let room = null;
    const roomNow = () => (room = roomFor(stones, mats || [], stands || []));
    const paint = () => { if (m.id !== 'gazit2' || !room) return; room.mats.forEach((r, k) => { for (const f of marks[k]) f.material = r.inside && r.free ? okMat : badMat; }); room.stands.forEach((r, k) => { for (const f of marks[mats.length + k]) f.material = r.ok ? okMat : badMat; }); };
    // ── the students and the scribes (gazit2 after "יש מקום!", gazit3 from the start): every second seat of each mat
    const rows = [[], [], []], scribes = [];
    const slotsOf = (k) => matSeats(mats[k]).filter((_, q) => q % 2 === 0);
    function seatStudents() {
      for (let k = 0; k < 3; k++) slotsOf(k).forEach((p, q) => { const a = add(p[0], p[1], { col: STUD[(k * 3 + q) % STUD.length] }); if (a) { a.yaw = Math.PI; AC.pose(a, 'sit'); } rows[k].push(a); });
      (stands || []).forEach((s, q) => { const a = add(s.x + (s.side === 'W' ? -0.9 : 0.9), s.z, { variant: 'levite', item: 'scroll' }); if (a) { facing(a, s.x, s.z); AC.pose(a, 'lean'); } scribes.push(a); });
    }
    // ── the camera: high over the north wall, a wider lens (the room is 36 amot wide)
    const camK = m.id === 'gazit1' ? CAM.gazit : CAM.gazitRows, camHome = (d = 1.2) => X.shot(camK[0], camK[1], d);
    const focus = () => { const x = stones.reduce((a, s) => a + s.x, 0) / stones.length, z = stones.reduce((a, s) => a + s.z, 0) / stones.length; return { x, y: F16 + SH, z }; };
    const stoneAt = (i) => ({ x: stones[i].x, y: F16 + SH + 0.2, z: stones[i].z });
    const sync = () => { SM.forEach((g, i) => g.userData.set(stones[i])); MM.forEach((g, k) => g.userData.set(mats[k])); TM.forEach((g, k) => g.userData.set(stands[k])); };
    // ── the grips under a finger: a stone (gazit1) or a mat or a stand (gazit2), its part (the middle or an end), the offset
    const ppa = (x, z) => { const a = X.scr(x, F16, z), b = X.scr(x + 1, F16, z); return Math.max(4, Math.hypot(a.x - b.x, a.y - b.y)); };
    function pick(p, list, h, mid = 0.2) {
      const q = onY(X, p, h); if (!q) return null;
      let best = null;
      list.forEach((s, i) => {
        const ux = Math.cos(s.a), uz = Math.sin(s.a), n = [Math.sin(s.a), -Math.cos(s.a)], dx = q.x - s.x, dz = q.z - s.z, o = dx * ux + dz * uz, w = dx * n[0] + dz * n[1];
        const tol = Math.max(0.5, (0.5 * gripR()) / ppa(s.x, s.z)), ox = Math.max(0, Math.abs(o) - s.L / 2 - 0.8), wx = Math.max(0, Math.abs(w) - s.D / 2 - tol * 0.6);
        const d = Math.hypot(ox, wx); if (d > tol * 0.4 && (ox > 0 || wx > 0)) return;
        if (!best || d < best.d || (d === best.d && Math.abs(w) < best.w)) best = { i, d, w: Math.abs(w), grip: s.L <= 1.01 || Math.abs(o) < mid * s.L ? 'mid' : o > 0 ? 1 : -1, q };
      });
      if (!best) return null;
      const s = list[best.i], P = best.grip === 'mid' ? [s.x, s.z] : endOf(s, best.grip);
      best.off = [best.q.x - P[0], best.q.z - P[1]]; return best;
    }
    const targetsOf = () => (m.id === 'gazit1' ? stones : [...(mats || []), ...(stands || [])]);
    const near = (p, at, k = 1) => { const s = X.scr(at[0], at[1], at[2]); return s.on !== false && Math.hypot(p.x - s.x, p.y - s.y) < gripR() * k; };
    const onHead = (p) => { const a = head(); return !!a && near(p, [a.x, F16 + 2, a.z]); };
    // ── gazit3: the semicha
    let SC = null, path = null;
    const dots = new T.Group(); root.add(dots);
    const dotGeo = new T.CircleGeometry(0.2, 10);
    const placeOf = (id) => {
      if (id.startsWith('bench:')) { const s = stones[+id.slice(6)]; return [s.x, s.z]; }
      const k = +id[3], sl = slotsOf(k); return sl[sl.length - 1];
    };
    const walkers = {};   // move k → the man
    function walkerOf(k) {
      if (walkers[k]) return walkers[k];
      const who = SC.plan.moves[k].who;
      if (who === 'crowd') { const c = GZ.crowd, a = add(c[0], c[1], { col: '#7A6A4E' }); facing(a, c[0] - 4, c[1]); walkers[k] = a; return a; }
      return rows[+who[3]][0];
    }
    const layoutFor = (k) => {
      const who = SC.plan.moves[k].who, mine = who.startsWith('row') ? +who[3] : -1;
      return { stones, mats: mats.filter((_, q) => q !== mine), stands, free: SC.plan.moves.map((mv) => { const p = placeOf(mv.to); return { id: mv.to, x: p[0], z: p[1] }; }) };
    };
    /** a way on the floor from a man to his place round the mats, stones and stands (the bot's, and a hint after two misses) */
    function wayFor(k, opt = {}) {   // (opt.to / opt.from: another end, [x, z] — the probe's ink detour)
      const w0 = walkerOf(k); if (!w0) return null; const a = opt.from ? { x: opt.from[0], z: opt.from[1] } : w0;
      const L = layoutFor(k), g = 0.25, I = GZ.in, x0 = I[0] + 0.4, z0 = I[1] + 0.4, nx = Math.ceil((I[2] - 0.4 - x0) / g), nz = Math.ceil((I[3] - 0.4 - z0) / g);
      const to = opt.to || placeOf(SC.plan.moves[k].to), raw = [...L.mats, ...L.stones].map(corners), rects = [...L.mats, ...L.stones].map((q) => corners({ ...q, L: q.L + 0.6, D: q.D + 0.6 }));   // (a margin: the way keeps off their edges, but by its end)
      const inR = (p, c) => { let s0 = 0; for (let i = 0; i < 4; i++) { const u = c[i], v = c[(i + 1) % 4], w = (v[0] - u[0]) * (p[1] - u[1]) - (v[1] - u[1]) * (p[0] - u[0]); if (i === 0) s0 = Math.sign(w); else if (Math.sign(w) !== s0 && w !== 0) return false; } return true; };
      const P = (i, j) => [x0 + (i + 0.5) * g, z0 + (j + 0.5) * g];
      const free = (i, j) => { const p = P(i, j), dt = Math.hypot(p[0] - to[0], p[1] - to[1]); if (dt < 0.8 || Math.hypot(p[0] - a.x, p[1] - a.z) < (opt.from ? 0.8 : 0.5)) return true; if (dt < 1.4 && !raw.some((c) => inR(p, c))) return true; if (L.stands.some((s) => Math.hypot(p[0] - s.x, p[1] - s.z) < H129.WALK.INK + H129.STAND / 2 + 0.3)) return false; return !rects.some((c) => inR(p, c)); };
      const cell = (x, z) => [clamp(Math.floor((x - x0) / g), 0, nx - 1), clamp(Math.floor((z - z0) / g), 0, nz - 1)];
      const [si, sj] = cell(a.x, a.z), [ti, tj] = cell(to[0], to[1]), prev = new Int32Array(nx * nz).fill(-2), q = [sj * nx + si]; prev[q[0]] = -1;
      let hit = -1;
      while (q.length) { const c = q.shift(), i = c % nx, j = (c / nx) | 0; if (i === ti && j === tj) { hit = c; break; } for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const u = i + di, v = j + dj; if (u < 0 || v < 0 || u >= nx || v >= nz) continue; const kk = v * nx + u; if (prev[kk] !== -2 || !free(u, v)) continue; prev[kk] = c; q.push(kk); } }
      if (hit < 0) return null;
      const out = []; for (let c = hit; c >= 0; c = prev[c]) out.push(P(c % nx, (c / nx) | 0)); out.reverse(); out.push(to);
      // (its corners only: the way stays on the free cells)
      const thin = [out[0]]; for (let i = 1; i < out.length - 1; i++) { const p = out[i - 1], q = out[i + 1]; if (Math.abs((out[i][0] - p[0]) * (q[1] - out[i][1]) - (out[i][1] - p[1]) * (q[0] - out[i][0])) > 1e-6) thin.push(out[i]); } thin.push(out[out.length - 1]);
      return thin;
    }
    function drawPath() {
      for (const c of dots.children.slice()) dots.remove(c);
      if (!path) return;
      let last = null;
      for (const p of path) { if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.4) continue; const d = new T.Mesh(dotGeo, goldHot); d.rotation.x = -Math.PI / 2; d.position.set(p[0], F16 + 0.09, p[1]); dots.add(d); last = p; }
    }
    // ── the fingers
    const FG = fingers(X, {
      down(f) {
        if (A.busy || A.viewT > 0) return;
        if (A.phase === 'arrange') {
          if (m.id === 'gazit1' && onHead(f) && !A.drag.size) { f.head = 1; return; }
          const list = targetsOf(), b = pick(f, list, m.id === 'gazit1' ? F16 + SH : F16 + 0.1, m.id === 'gazit1' ? 0.2 : 0.3);
          if (!b || [...A.drag.values()].some((d) => d.i === b.i)) return;
          A.drag.set(f.id, { i: b.i, grip: b.grip, off: b.off, x: b.q.x, z: b.q.z, t0: A.t }); f.on = 1; X.hand(null);
          if (m.id === 'gazit1') { hot(b.i, true); crewFor(b.i); V.knock(1.3); } else V.cloak();
          return;
        }
        if (A.phase === 'walk' && !path) {
          for (let k = 0; k < 4; k++) { if (SC.moved.includes(k)) continue; const a = walkerOf(k); if (a && near(f, [a.x, F16 + 1.4, a.z], 0.8)) { f.walk = k; path = [[a.x, a.z]]; drawPath(); X.hand(null); return; } }
        }
      },
      move(f) {
        if (f.on) { const d = A.drag.get(f.id), q = onY(X, f, m.id === 'gazit1' ? F16 + SH : F16 + 0.1); if (d && q) { d.x = q.x; d.z = q.z; } return; }
        if (f.walk != null && path) { const q = onY(X, f, F16); if (!q) return; const l = path[path.length - 1]; if (Math.hypot(q.x - l[0], q.z - l[1]) >= 0.3) { path.push([q.x, q.z]); drawPath(); } }
      },
      up(f) {
        if (f.head) { if (f.moved < 20 && onHead(f)) runTest(false); return; }
        if (f.on) {
          const d = A.drag.get(f.id); A.drag.delete(f.id); if (!d) return;
          if (m.id === 'gazit1') { hot(d.i, false); if (!A.drag.size) crewOff(); V.scrape(0); if (f.moved < 10 && A.t - d.t0 < 0.4) seatView(d.i); else seenCheck(); }
          else { V.knock(1.6); roomNow(); paint(); roomWords(); if (room.ok) roomDone(); }
          return;
        }
        if (f.walk != null && path) { const k = f.walk; f.walk = null; if (path.length < 3) { path = null; drawPath(); return; } send(k, path.slice()); }
      },
    });
    // ── gazit1: a stone's judge sees all (rule 64: within the frame of its move's end)
    function seenCheck() {
      const B = benchState(stones);
      for (let i = 0; i < 7; i++) { const all = B.legal[i] && B.sees[i].every(Boolean) && B.sees.every((r) => r[i]); if (all && !A.seen.has(i)) { A.seen.add(i); if (A.moved && A.moved.has(i)) { X.quick(stoneAt(i), QUICK.sees, SM[i]); ev('sees:' + i); } } else if (!all) A.seen.delete(i); }
      if (!A.handHead && A.moved && A.moved.size >= 2) { A.handHead = 1; const a = head(); if (a) X.hand({ x: a.x, y: F16 + 2.4, z: a.z }, 0, 14); X.line('כשהספסל מוכן: הקישו על ראש הסנהדרין (במרכז, עם המטה), והדיינים ישבו לבדוק', 4200); }
    }
    // ── gazit1: tap a stone: its seat's view for two seconds
    function seatView(i) {
      const s = stones[i], n = normalOf(s), f = focus();
      A.viewT = 2.2; X.shot([s.x - n[0] * 0.6, F16 + SH + 2.6, s.z - n[1] * 0.6], [s.x + n[0] * 6, F16 + SH + 1, s.z + n[1] * 6], 0.6); void f;
      X.line('המבט מן המושב הזה', 1800);
    }
    // ── gazit1: the test (auto: the opening on the straight row)
    const walkTo = (a, p, sp = 6) => (a ? Promise.race([AC.walk(a, [[p[0], p[1]]], sp), new Promise((r) => setTimeout(r, 2600))]) : Promise.resolve());
    async function runTest(auto) {
      if (A.phase !== 'arrange' && !auto) return;
      A.phase = 'test'; A.busy = 1; X.hand(null); X.line(auto ? 'הסנהדרין יושבת על השורה הישרה' : 'הדיינים יושבים · שלושה מרימים יד, וכל אחד מחפש אותם', 3000);
      const P = testPlan(stones), B = benchState(stones);
      await Promise.all(J.map((a, i) => walkTo(a, legalStone(stones[i]) ? seatAt(i) : besideAt(i))));
      J.forEach((a, i) => sitOn(a, i)); V.cloak();
      await X.wait(0.6);
      for (const R of P.rounds) {
        const r = J[R.r]; if (r) AC.pose(r, 'raise');
        for (const j of R.turns) if (J[j]) J[j].look = [stones[R.r].x, stones[R.r].z];
        for (const j of R.leans) if (J[j]) { AC.pose(J[j], 'lean'); J[j].look = [stones[R.r].x + 3, stones[R.r].z]; }
        await X.wait(1.3);
        if (r) AC.pose(r, legalStone(stones[R.r]) ? 'sit' : 'stand');
        for (const j of R.leans) if (J[j]) AC.pose(J[j], 'sit');
        for (const j of R.turns) if (J[j]) J[j].look = null;
      }
      if (P.pass) { const mid = stones.slice().sort((a, b) => a.x - b.x)[3]; X.quick(stoneAt(mid.i), QUICK.allSee, null); ev('pass'); V.knock(2); return finish(); }
      if (!auto) A.fails++;
      ev('fail');
      // (the words: the first stone over the holy line, else the first pair that does not see)
      const wx = stones.map((s, i) => i).sort((a, b) => stones[a].x - stones[b].x), nm = (i) => ORD[wx.indexOf(i)];
      let why = '';
      const bad = B.legal.findIndex((l) => !l);
      if (bad >= 0) why = `האבן של הדיין ${nm(bad)} (ממערב) עוברת את קו הקודש: הוא עומד לידה`;
      else { outer: for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if (!B.sees[i][j]) { why = `הדיין ${nm(i)} (ממערב) אינו רואה את הדיין ${nm(j)}`; break outer; } }
      X.line(why + (auto ? ' · סדרו את האבנים בקשת, "כחצי גורן עגולה"' : ' · נסו שוב'), 5200);
      await X.wait(2.4);
      J.forEach((a) => standUp(a));
      await Promise.all(J.map((a, i) => walkTo(a, waitAt(i), 7)));
      J.forEach((a, i) => { if (a) { const w = waitAt(i); facing(a, w[0], w[1] + 4); AC.pose(a, i === 3 ? 'stand' : 'talk'); } });
      A.phase = 'arrange'; A.busy = 0; A.seen.clear(); seenCheck();
      if (auto) X.line(MOUSE ? 'גררו אבן באמצעה כדי להזיז אותה, ובקצה כדי לסובב אותה סביב קצהה השני · הקשה על אבן: המבט ממנה' : 'גררו אבן באמצעה כדי להזיז, ובקצה כדי לסובב · הקשה על אבן: המבט ממנה', 6000);
    }
    // ── gazit2
    function roomWords() {
      if (!room || room.ok) return;
      const r = room.stands.find((s) => !s.ok && s.sees && !s.sees.every(Boolean) && stands.length);
      const mIn = room.mats.filter((q) => q.inside && q.free).length;
      if (r && mIn === 3) X.line('סופר צריך לראות את כל שבעת הדיינים: הזיזו את הדוכן שלו', 2600);
    }
    async function roomDone() {
      if (A.phase !== 'arrange') return; A.phase = 'seat'; A.busy = 1;
      X.quick({ x: mats[1].x, y: F16 + 0.5, z: mats[1].z }, QUICK.room, MM[1]); ev('room');
      seatStudents();
      for (const a of rows.flat()) if (a) { a.vis = 0; a.visT = 1; }
      await X.wait(1.2);
      for (let q = 0; q < scribes.length; q++) { const a = scribes[q], s = stands[q]; if (a) { AC.pose(a, 'lean'); V.quill(); X.quick({ x: s.x, y: F16 + 1.4, z: s.z }, QUICK.writes, TM[q]); ev('writes:' + q); } await X.wait(0.9); }
      finish();
    }
    // ── gazit3
    async function send(k, pts) {
      A.busy = 1; const a = walkerOf(k), r = walkCheck(pts, layoutFor(k), SC.plan.moves[k].who);
      // (his walk: along the drawn path to where he stops)
      const walk = []; for (const p of pts) { walk.push(p); if (Math.hypot(p[0] - r.end[0], p[1] - r.end[1]) < 0.05) break; } if (!walk.length || walk[walk.length - 1] !== r.end) walk.push(r.end);
      if (a) { standUp(a); try { await Promise.race([AC.walk(a, walk, 3.4), new Promise((res) => setTimeout(res, 9000))]); } catch (e) { /* */ } }
      if (r.ink) {
        const p = Mo.mark('gazit.ink', m.id, [+r.ink[0].toFixed(2), +r.ink[1].toFixed(2)]); A.dmg += p; inkStain(X, r.ink[0], r.ink[1], root); V.crack();
        X.loss(p, { x: r.ink[0], y: F16 + 1, z: r.ink[1] }, LOSS['gazit.ink'][0]); ev('ink'); X.save();
      }
      const res = semichaSend(SC, k, r); path = null; drawPath();
      if (res.ok) {
        const to = SC.plan.moves[k].to, p = placeOf(to);
        if (a) { a.x = p[0]; a.z = p[1]; if (to.startsWith('bench:')) { a.fixedY = F16 + SH; const n = normalOf(stones[+to.slice(6)]); a.yaw = Math.atan2(n[0], n[1]); } else a.yaw = Math.PI; AC.pose(a, 'sit'); }
        X.quick({ x: p[0], y: F16 + 1.6, z: p[1] }, QUICK.seated, null); V.cloak(); ev('seated:' + k);
        // (his row moves up: each man one place toward its head, the end free)
        const who = SC.plan.moves[k].who;
        if (who.startsWith('row')) { const R = rows[+who[3]]; R.shift(); const sl = slotsOf(+who[3]); R.forEach((b, q) => { if (b) AC.walk(b, [[sl[q][0], sl[q][1]]], 2).then(() => { b.yaw = Math.PI; AC.pose(b, 'sit'); }); }); R.push(null); }
        const toRow = to.startsWith('row') ? +to[3] : -1; if (toRow >= 0) rows[toRow][rows[toRow].length - 1] = a;
        if (SC.seated.length >= 4) { A.busy = 0; return finish(); }
        A.misses = 0; await X.wait(0.6); nextWalker();
      } else {
        A.standing++; A.misses = (A.misses | 0) + 1; ev('stand:' + res.why);
        X.line(res.why === 'mat' ? 'הוא נעצר: אין דורכים על מחצלת שיושבים עליה, ולא על הספסל · ציירו לו דרך במעבר' : res.why === 'notFree' ? 'המקום הזה עוד לא פנוי · כל שורה עולה בתורה' : 'הדרך לא הגיעה עד המקום הפנוי · ציירו ממנו עד המקום', 4200);
        if (A.misses >= 2) { const w = wayFor(k); if (w) { path = w; drawPath(); setTimeout(() => { if (!A.drag.size && path === w) { path = null; drawPath(); } }, 2600); } }
        A.busy = 0;
      }
      A.busy = 0;
    }
    function nextWalker() {
      const k = SC.moved.length ? Math.min(...[0, 1, 2, 3].filter((q) => !SC.moved.includes(q))) : 0, a = walkerOf(k); if (!a) return;
      const to = placeOf(SC.plan.moves[k].to);
      X.hand({ x: a.x, y: F16 + 1.4, z: a.z }, 0, 12);
      X.line(['ראש השורה הראשונה עולה לספסל, למקום הדיין שיצא', 'ראש השורה השנייה בא לו לסוף הראשונה', 'ראש השורה השלישית בא לו לסוף השנייה', 'אחד מן הקהל יושב בסוף השלישית, במקום הראוי לו'][k] + ' · ציירו את דרכו באצבע', 5200);
      A.goal = to;
    }
    // ── the end
    let gone = false;
    function teardown() {
      if (gone) return; gone = true; lens(fov0);
      for (const a of [...J, ...rows.flat(), ...scribes, ...Object.values(walkers)]) if (a) { try { AC.remove(a); } catch (e) { /* */ } }
      X.props.remove(root); own('bench', 0); own('mats', 0); setBusy(X, 0);
    }
    async function finish() {
      if (A.phase === 'done') return; A.phase = 'done'; A.busy = 1; X.hand(null);
      st.gazit = st.gazit || {};
      if (m.id === 'gazit1') st.gazit.stones = stones.map(cp);
      else if (!st.gazit.stones) st.gazit.stones = stones.map(cp);
      if (m.id === 'gazit2') { st.gazit.mats = mats.map((q) => ({ ...q })); st.gazit.stands = stands.map((q) => ({ ...q })); }
      else if (m.id === 'gazit3' && !st.gazit.mats) { st.gazit.mats = mats.map((q) => ({ ...q })); st.gazit.stands = stands.map((q) => ({ ...q })); }
      X.save();
      const pts = gazitPts({ dmg: A.dmg, fails: A.fails, standing: A.standing }), q = qOf(pts);
      await X.wait(0.9);
      if (m.id === 'gazit1' || m.id === 'gazit3') { const L = m.id === 'gazit1' ? LINES.sanh3 : LINES.sanh4; await card(X, `<b style="font:900 20px Heebo,system-ui">${m.id === 'gazit1' ? 'כחצי גורן עגולה' : 'כל אחד מכיר את מקומו'}</b>${cite(L)}`, 9000); }
      // (closing round, F4–F5: the film after the work opens on its composed picture — BOOK.s07.cam.stands.gazit, a cut — the court at
      //  work in it: the judges on the bench, from the rows' work the students and the two scribes, all seated through the film and gone
      //  when it ends (res.film.after); the kohen in the holy half, in the picture's left third)
      const SV = CAM.stands && CAM.stands.gazit;
      if (SV && GZ.filmKohen) { try { X.hero.setPos(GZ.filmKohen[0], GZ.filmKohen[1], Math.atan2(GZ.wait[0] - GZ.filmKohen[0], GZ.holy + 4 - GZ.filmKohen[1])); } catch (e) { /* */ } }
      A.film = !!SV; if (SV) { crewOff(); A.lensF = SV[2]; lens(SV[2]); }
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { fails: A.fails, standing: A.standing, 'gazit.crack': (A.cracks || []).length, 'gazit.ink': A.dmg && m.id === 'gazit3' ? 1 : 0 }, at: focus(),
        film: SV ? { shots: [[SV[0], SV[1], 3.4]], after: teardown } : null });
    }
    // ── the frame
    const stepDrag = (dt) => {
      let moving = 0;
      for (const d of A.drag.values()) {
        const list = targetsOf(), s = list[d.i]; if (!s) continue; if (!(s.s >= 0)) s.s = 0;
        const fx = d.x - d.off[0], fz = d.z - d.off[1], before = s.x + s.z + s.a;
        if (m.id === 'gazit1') {
          const evs = stoneStep(s, { grip: d.grip, x: fx, z: fz }, dt, stones);
          for (const e of evs) {
            if (e === 'bump') { if (A.t - (A.bumpT || 0) > 0.4) { A.bumpT = A.t; V.bump(); } }
            if (e === 'crack') {
              const p = Mo.mark('gazit.crack', m.id, [+s.x.toFixed(2), +s.z.toFixed(2)], d.i); A.dmg += p; (A.cracks = A.cracks || []).push(d.i); s.crack = 1;
              SM[d.i].removeFromParent(); const g = benchStone(X, s, { parent: root }); g.userData.grips = SM[d.i].userData.grips; for (const c of g.userData.grips || []) g.add(c); SM[d.i] = g;
              V.crack(); X.shake(0.15, 0.25); X.loss(p, stoneAt(d.i), LOSS['gazit.crack'][0]); ev('crack:' + d.i); X.save();
            }
          }
          if (Math.abs(s.x + s.z + s.a - before) > 1e-4) { moving = Math.max(moving, s.s / H129.STONE.VMAX); (A.moved = A.moved || new Set()).add(d.i); crewAt(d.i); }
        } else stoneStep(s, { grip: d.grip, x: fx, z: fz }, dt, []);
      }
      if (m.id === 'gazit1') V.scrape(moving);
      // (the pushers lean into the bars while it moves)
      for (const w of crew) if (w.a) { w.a.bowT = 0.3 + 0.35 * moving; }
    };
    return {
      close: true,
      begin() {
        FG.attach(); lens(CAM.gazitFov); camHome(1.3);
        if (m.id === 'gazit1') { A.phase = 'intro'; setTimeout(() => runTest(true), 1500); }
        else if (m.id === 'gazit2') { A.phase = 'arrange'; roomNow(); paint(); X.line('הביאו את שלוש המחצלות אל תוך הקשת, ואת שני דוכני הסופרים: אחד ממערב ואחד ממזרח לאמצע הספסל · כל סופר רואה את כל הדיינים', 6500); X.hand({ x: mats[2].x, y: F16 + 0.3, z: mats[2].z }, 0, -gripR() / 2); }
        else {
          seatStudents();
          SC = semichaFresh(semichaPlan(st)); const lv = J[SC.plan.leave];
          A.phase = 'leave'; A.busy = 1;
          X.line('היו צריכין לסמוך: דיין אחד יצא מן הספסל', 3000);
          (async () => {
            if (lv) { standUp(lv); await walkTo(lv, [GZ.doorN[0], GZ.in[1] + 0.6], 4); try { AC.remove(lv); } catch (e) { /* */ } J[SC.plan.leave] = null; }
            A.phase = 'walk'; A.busy = 0; nextWalker();
          })();
        }
      },
      update(dt) {
        A.t += dt; holdLens(X, A.lensF || CAM.gazitFov);
        try {
          V.frame();
          if (A.viewT > 0) { A.viewT -= dt; if (A.viewT <= 0) camHome(0.6); }
          if (A.drag.size) { stepDrag(dt); sync(); }
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] gazit', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.drag.clear(); crewOff(); path = null; drawPath(); },
      // (rule 66: on the right a touch is the act's only on a stone, a mat, a stand, the head of the court or a walker)
      wants(p) {
        if (!p) return true;
        if (A.busy || A.viewT > 0) return false;
        if (A.phase === 'arrange') return (m.id === 'gazit1' && onHead(p)) || !!pick(p, targetsOf(), m.id === 'gazit1' ? F16 + SH : F16 + 0.1);
        if (A.phase === 'walk' && SC) for (let k = 0; k < 4; k++) { if (SC.moved.includes(k)) continue; const a = walkerOf(k); if (a && near(p, [a.x, F16 + 1.4, a.z], 0.8)) return true; }
        return false;
      },
      holds() { return A.drag.size > 0 || !!path; },
      end() {
        FG.detach(); V.stop(); X.hand(null); crewOff();
        if (!A.film) teardown();   // (closing round: with a film, the court stays seated in its picture until the film ends — res.film.after)
      },
      // (the work's focus: the bench)
      // (in the rows' works the students sit between the camera and the bench's middle: the focus is the bench's far side at the judges'
      //  heads, so the figure gate keeps the front row drawn)
      at() { const f = focus(); if (m.id === 'gazit1') return new T.Vector3(f.x, f.y, f.z); const far = stones.reduce((b, s) => (Math.abs(s.z - camK[0][2]) > Math.abs(b.z - camK[0][2]) ? s : b), stones[0]); return new T.Vector3(f.x, F16 + SH + 1.6, far.z); },
      dbg() {
        const sp = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const o = { id: m.id, phase: A.phase, busy: A.busy, mouse: MOUSE, ev: A.ev.slice(-10), fails: A.fails, dmg: A.dmg, standing: A.standing, nf: FG.n, drag: A.drag.size };
        if (m.id === 'gazit1') {
          const B = benchState(stones), goal = solvedArc();
          o.allSee = B.allSee; o.legal = B.legal.map(Number);
          // (per stone: its grips on the screen; the goal's ends; for a pivot on either end, where the middle must go first so that end lands
          //  on the goal's, and how far each end is from the goal's — the bot moves, then turns the other end round it)
          o.stones = stones.map((s, i) => {
            const g = goal[i], ux = Math.cos(s.a), uz = Math.sin(s.a), h = s.L / 2, E = [endOf(s, -1), endOf(s, 1)], GE = [endOf(g, -1), endOf(g, 1)];
            return { i, x: +s.x.toFixed(2), z: +s.z.toFixed(2), a: +s.a.toFixed(3), err: +Math.hypot(s.x - g.x, s.z - g.z).toFixed(3), ae: +Math.abs(s.a - g.a).toFixed(3),
              mid: sp(s.x, F16 + SH, s.z), e: E.map((p) => sp(...xyz(p))), ge: GE.map((p) => sp(...xyz(p))), pe: E.map((p, k) => +Math.hypot(p[0] - GE[k][0], p[1] - GE[k][1]).toFixed(3)),
              to: [sp(...xyz([GE[0][0] + ux * h, GE[0][1] + uz * h])), sp(...xyz([GE[1][0] - ux * h, GE[1][1] - uz * h]))] };
          });
          const h = head(); o.head = h ? sp(h.x, F16 + 2, h.z) : null;
          o.ppa = +ppa(GZ.wait[0], GZ.row0.z).toFixed(1);
        } else if (m.id === 'gazit2') {
          const goal = solvedRows(), all = [...(mats || []), ...(stands || [])], gl = [...goal.mats, ...goal.stands];
          o.room = room ? { ok: room.ok, mats: room.mats.map((r) => +(r.inside && r.free)), stands: room.stands.map((r) => +r.ok) } : null;
          o.items = all.map((s, i) => ({ i, x: +s.x.toFixed(2), z: +s.z.toFixed(2), a: +s.a.toFixed(3), err: +Math.hypot(s.x - gl[i].x, s.z - gl[i].z).toFixed(3), mid: sp(s.x, F16 + 0.1, s.z), gs: sp(gl[i].x, F16 + 0.1, gl[i].z) }));
        } else if (SC) {
          o.leave = SC.plan.leave; o.k = SC.k; o.moved = SC.moved.slice(); o.free = [...SC.free];
          o.walkers = [0, 1, 2, 3].map((k) => { const a = SC.moved.includes(k) ? null : walkerOf(k); return a ? sp(a.x, F16 + 1.4, a.z) : null; });
          const nx = [0, 1, 2, 3].find((k) => !SC.moved.includes(k)); if (nx != null) { const w = wayFor(nx); o.next = nx; o.way = w ? w.map((p) => sp(p[0], F16, p[1])) : null;
            if (stands && stands.length) { const S = stands[0], sx = S.x < GZ.wait[0] ? 1 : -1, q = [S.x + sx * 0.66, S.z + 0.6], w1 = wayFor(nx, { to: q }), w2 = wayFor(nx, { from: q }); o.inkWay = w1 && w2 ? [...w1, ...w2.slice(1)].map((p) => sp(p[0], F16, p[1])) : null; }
            o.wayW = w ? w.map((p) => [+p[0].toFixed(2), +p[1].toFixed(2)]) : null; }   // (inkWay: by the first scribe's stand, then on to his place — the probe's ink)
          o.stands = (stands || []).map((s) => sp(s.x + (s.x < GZ.wait[0] ? 1 : -1) * 0.66, F16, s.z + 0.6));   // (a point just by each stand, inside the ink's reach: 0.9 of its middle)
        }
        return o;
      },
    };
    function xyz(p) { return [p[0], F16 + SH, p[1]]; }
  },
};
