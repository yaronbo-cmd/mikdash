/* ── build 109 ── h109/acts.js — the acts of stage 01, each played IN the world (spec §3). The registry the director reads:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face, mx?, mz? }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg() } — it calls X.end({ stars, q, lost?, waste?, at }) once.
 *   ACTS.__init(X): the world of the stage as the save has it (the sectors' rocks, the stakes, the paved sectors, the waste pile);
 *   ACTS.__frame(dt, X): every frame (the beat, the crews, the great stone's journey, the crews' own rocks).
 * This file: the shared state, the rope (3.1) and the strike on the beat (3.2). The others: acts2.js (3.3 read, 3.4 pave, 3.9 waste),
 * acts3.js (3.5 corner, 3.6 course, 3.7 great stone, 3.8 the inscription).
 */
import { H109 } from './model.js';
import { BOOK, ROCK_CELLS, rectOf } from '../world/grid.js';
import { createBeat, createGang, onPlane, clamp, lerp, ease, clearView, rayBlocked } from './kit.js';
import { READ, PAVE, WASTE, initWorld2, frame2 } from './acts2.js';
import { CORNER, COURSE, GREAT, LETTERS, initWorld3, frame3 } from './acts3.js';

const TAU = Math.PI * 2;
/** the shared state of the stage's world (one per director) */
export const SH = { X: null, B: null, crew: null, bould: [], rocks: [], stakes: [], plan: null, sq: null };

/* ───────── the world as the save has it ───────── */
// the 500-amah square (mount.js SQUARE), inset 6 amot: the surveyors' line
const SQ = { x0: -223 + 6, x1: 277 - 6, z0: -183.5 + 6, z1: 316.5 - 6 };
// the two sides the kohen stretches (the last rope-length of each, to the north-east corner): from the crew's 450 stake to 500
const ROPE = [
  { a: [SQ.x1 - 50, SQ.z0], b: [SQ.x1, SQ.z0] },   // the north side, westward from the crew's stake → the corner
  { a: [SQ.x1, SQ.z0 + 50], b: [SQ.x1, SQ.z0] },   // the east side, from the south → the corner
];
function hash(a, b) { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); }

function rockTarget(R, X) { const g = X.ground(R.x, R.z); return { x: R.x + R.ux * R.r * 0.72, y: g + R.r * 0.45, z: R.z + R.uz * R.r * 0.72 }; }

/* ── h115 ── the Mount by its addresses (docs/specs/build115-brief.md): the kohen's nine cells (BOOK.kohen) with their big rock and
 * five small rocks each, the crews' cells (every other rock cell of the square) cut from the east inward as the work goes on, the cut
 * cells paved behind them. The grid itself is never drawn (ירון 10.11: "בתוך המשחקים אני בתוך העולם שלי. אין רשתות"). ── /h115 ── */
const KC = BOOK.kohen, SECT = BOOK.sectors;
/** the crews' cells in their order: the east columns first, each column from the north; a cell in the kohen's rows (6..8) west of
 *  his cells waits until his cell of that row is read */
// ── h116 ── (build116-brief §A) the rock under the great stone's way (BOOK.great.keep) stands until the stone is down ── /h116 ──
const GREAT_KEEP = new Set(BOOK.great.keep.map(([k, r]) => k + ',' + r));
const CREW_CELLS = ROCK_CELLS.filter(([k, r]) => !KC.some((c) => c.k === k && c.r === r)).map(([k, r, h]) => ({ k, r, h, need: GREAT_KEEP.has(k + ',' + r) ? 'great' : k > 13 && r >= 5 && r <= 7 ? 'read' + (6 + r - 5) : null })).sort((a, b) => a.k - b.k || a.r - b.r);
/** how many crew cells stand cut for a save: a start (the lowest east cells), then with every work he finishes; the stage's end: all */
function crewTarget(st, PLAN_N) {
  const n = st.done.length, f = Math.min(1, n / Math.max(1, PLAN_N));
  return Math.min(CREW_CELLS.length, 6 + Math.floor((CREW_CELLS.length - 6) * f) + (st.crewX | 0));
}
function crewCells(X, instant) {
  const st = X.M.st, cells = X.stages.cells;
  // ── h116 ── the crews' cells are the model's (M.crewCut: his free cells and the one he walks to left out); the view cuts them ── /h116 ──
  let next = null;
  for (const s of (X.M.crewCut ? X.M.crewCut() : [])) {
    const c = SECT[s]; if (cells.state(c.k, c.r) !== 'rock') continue;
    if (instant) { cells.set(c.k, c.r, 'paved', { instant: true }); sectorGone(X, s); } else if (!next) next = { k: c.k, r: c.r, s };
  }
  // ── h115 ── (the end film: the low rock of the hill's fringe, under 3 amot and so in no rock cell, stood through the platform's
  // paving in brown patches) the stage done: every cell whose rock is over the floor is cut and paved, the Mount one level ── /h115 ──
  if (!next && st.done.length >= ((X.M.plan || []).length || 1e9)) {
    for (let k = -6; k <= 26; k++) for (let r = -6; r <= 26; r++) { let tp = -1e9; try { tp = cells.top(k, r); } catch (e) { tp = -1e9; } if (tp > 0.05 && cells.state(k, r) === 'rock') cells.set(k, r, 'paved', { instant: true }); }
  }
  return next;
}
/** ── h116 ── a free rock cell's world, made when its work first opens: its small rocks (struck or not, as the save has them) and its
 *  big rock; st.rocks[s] for it ── /h116 ── */
function ensureSector(X, s) {
  if (s < KC.length || !SECT[s]) return; const st = X.M.st, done = (id) => st.done.includes(id);
  if (!st.rocks[s]) st.rocks[s] = Array(SECT[s].small.length).fill(-1);
  if (!SH.rocks[s]) {
    const L = SECT[s].small.map((o) => ({ x: o.x, z: o.z, r: o.r, ux: o.ux, uz: o.uz, sx: o.sx, sz: o.sz, i: o.i, s, q: null })); SH.rocks[s] = L;
    if (!done('rocks' + s)) for (const R of L) { if ((st.rocks[s][R.i] | 0) >= 0) continue; R.q = X.props.rockAdd(R.x, R.z, R.r, { hp: 2, sector: s, sy: 0.8 + hash(R.x, R.z) * 0.15 }); }
    try { X.stages.cells.clearScrub(SECT[s].k, SECT[s].r); } catch (e) { /* */ }
  }
  if (!done('read' + s) && SH.bigRock) SH.bigRock(X, s);
}
/** the crews took a cell: its free rocks (if they were made) go with it */
function sectorGone(X, s) {
  const L = SH.rocks && SH.rocks[s]; if (L) for (const R of L) if (R.q) { try { X.props.rockSet && (R.q.vis = false, X.props.rockSet(R.q)); } catch (e) { /* */ } }
  if (SH.bigGone) try { SH.bigGone(X, s); } catch (e) { /* */ }
}
function initWorld(X) {
  SH.X = X; SH.B = createBeat(X); SH.crew = createGang(X); SH.sectorGone = sectorGone;   // ── h116 ── ── /h116 ──
  const st = X.M.st, done = (id) => st.done.includes(id);
  const cells = X.stages.cells; SH.cells = cells;
  try { cells.enable(true); } catch (e) { /* */ }
  SH.bould = SECT.map((C) => [C.big.x, C.big.z, C.big.r]);   // ── h116 ── (every rock cell's: the free ones too) ── /h116 ──
  SH.cellC = SECT.map((C) => [C.rect.cx, C.rect.cz]);
  // the kohen's cells as the save has them: read → cut level, paved → paved
  // ── h116 ── (his cells are paved quarter by quarter, by him and by the crews: their floor stays cut under the slabs; a 115 save's
  // paved sector keeps the old paving) ── /h116 ──
  SECT.forEach((C, s) => { const q = Object.keys(st.lay || {}).some((k2) => k2.startsWith(`q${s}_`)); if (s < KC.length && done('pave' + s) && !q) cells.set(C.k, C.r, 'paved', { instant: true }); else if (done('read' + s)) cells.set(C.k, C.r, 'cut', { instant: true }); });
  crewCells(X, true);
  // ── h115 ── the kohen's cells and the ring of cells round them cleared of their scrub (the crews' work ground) ── /h115 ──
  try { for (const C of KC) for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) cells.clearScrub(C.k + a, C.r + b); } catch (e) { /* */ }
  // the small rocks of every cell not yet struck (their places are the book's)
  SH.rocks = [];
  for (let s = 0; s < KC.length; s++) {
    const L = KC[s].small.map((o) => ({ x: o.x, z: o.z, r: o.r, ux: o.ux, uz: o.uz, sx: o.sx, sz: o.sz, i: o.i, s, q: null })); SH.rocks[s] = L;
    if (done('rocks' + s)) continue;
    for (const R of L) { if ((st.rocks[s][R.i] | 0) >= 0) continue; R.q = X.props.rockAdd(R.x, R.z, R.r, { hp: 2, sector: s, sy: 0.8 + hash(R.x, R.z) * 0.15 }); }
  }
  // ── h116 ── the free cells he took (struck or read) as the save has them ── /h116 ──
  for (let s = KC.length; s < SECT.length; s++) if (done('rocks' + s) || (st.rocks[s] && st.rocks[s].some((v) => v >= 0))) ensureSector(X, s);
  // the surveyors' stakes every 50 amot round the square (the crews measured it; the kohen stretches the last of two sides)
  SH.stakes = [];
  const ropeDone = done('rope');
  const edge = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 50); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), z = lerp(z0, z1, i / n); if (!ropeDone && Math.hypot(x - SQ.x1, z - SQ.z0) < 1) continue; SH.stakes.push(X.props.stake(x, z, 1.6, i % 2 === 0)); } };
  edge(SQ.x0, SQ.z0, SQ.x1, SQ.z0); edge(SQ.x1, SQ.z1, SQ.x1, SQ.z0 + 50); edge(SQ.x0, SQ.z1, SQ.x1, SQ.z1); edge(SQ.x0, SQ.z0, SQ.x0, SQ.z1);
  // the gold plan of the square on the hill (spec 3.1: "תוכנית הזהב פרושה על הגבעה"): faint, bright when the rope closes
  SH.sq = planLine(X); SH.sq.material.opacity = ropeDone ? 0.32 : 0.55;
  // the world's crews at work from the first second: the surveyors on the far side; the cutters at their next cell (ACTS.__frame)
  const C = SH.crew;
  if (!ropeDone) { C.add(SQ.x0 + 4, SQ.z1 - 120, { role: 'pull', fx: SQ.x0 + 4, fz: SQ.z1 - 170, item: 'rope' }); C.add(SQ.x0 + 4, SQ.z1 - 172, { role: 'kneel', fx: SQ.x0 + 4, fz: SQ.z1 - 120 }); }
  SH.cutGang = []; SH.cutAt = null; SH.cutT = 0;
  initWorld2(X, SH); initWorld3(X, SH);
  // ── h114 ── (ירון 9.11: "הדמות רצה לתוך סלע") the small rocks and a split rock's halves are solid to his walk: a step into one
  // (nearer its middle than the step before) is refused, a step out always allowed ── /h114 ──
  try {
    X.stages.hero.twinExtra && X.stages.hero.twinExtra((x, z, x0, z0) => {
      const inn = (cx, cz, rad) => { const d1 = Math.hypot(x - cx, z - cz); return d1 < rad && d1 < Math.hypot(x0 - cx, z0 - cz); };
      for (const L of SH.rocks || []) for (const R of L || []) if (R.q && R.q.vis && inn(R.x, R.z, R.r * 0.85 + 0.5)) return true;
      for (const k in SH.big || {}) { const B = SH.big[k]; if (B && inn(B.C.x, B.C.z, B.r * 1.0 + 0.4)) return true; }
      return false;
    });
  } catch (e) { /* */ }
}
function planLine(X) {
  const T = X.THREE, pts = [];
  const add = (x, z) => pts.push(new T.Vector3(x, X.ground(x, z) + 0.35, z));
  const side = (x0, z0, x1, z1) => { const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 6); for (let i = 0; i < n; i++) add(lerp(x0, x1, i / n), lerp(z0, z1, i / n)); };
  side(SQ.x0, SQ.z0, SQ.x1, SQ.z0); side(SQ.x1, SQ.z0, SQ.x1, SQ.z1); side(SQ.x1, SQ.z1, SQ.x0, SQ.z1); side(SQ.x0, SQ.z1, SQ.x0, SQ.z0);
  const g = new T.BufferGeometry().setFromPoints(pts);
  const m = new T.LineLoop(g, new T.LineBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.5, depthWrite: false }));
  m.name = 'h109-plan'; m.frustumCulled = false; m.renderOrder = 996; X.props.root.add(m); return m;
}

/* ───────── 3.1 the rope (מדות ב, א: "הר הבית היה חמש מאות אמה על חמש מאות אמה"; the 50-amah rope: עירובין ה, ד) ───────── */
// ── h114 ── (ירון 9.11: "דמות עומדת והכהן שלנו צועד") the roles turned round: a crewman stands at the 450 stake holding the rope's end and
// the kohen walks it out with the measuring rod in his hand (the rod the crewman carried in 110: "הכלי הזה טוב. תשאיר אותו"; יחזקאל מ, ג:
// "ופתיל פשתים בידו וקנה המדה"), the camera following behind him so the rod is always seen; a stop right on 500 is "בול!" — the
// level-up's own fanfare and stamp ── /h114 ──
function rodProp(X) {
  const T = X.THREE, g = new T.Group(); g.name = 'h114-rod';
  const wood = new T.MeshStandardMaterial({ color: '#8C6A43', roughness: 0.85 }), cord = new T.MeshStandardMaterial({ color: '#D9C9A0', roughness: 1 });
  // the rod held in his fist (the group's origin), its top leaning forward; a linen cord's coil on his wrist
  // (a staff taller than he is, so it shows over his shoulder from behind; its amot marked in linen bands)
  const rod = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 3.6, 7), wood); rod.rotation.x = 0.12; rod.position.set(0, 0.35, 0.02); g.add(rod);
  for (const k of [-1.2, -0.4, 0.4, 1.2]) { const m = new T.Mesh(new T.CylinderGeometry(0.085, 0.085, 0.07, 7), cord); m.rotation.x = 0.12; m.position.set(0, 0.35 + Math.cos(0.12) * k, 0.02 + Math.sin(0.12) * k); g.add(m); }
  const coil = new T.Mesh(new T.TorusGeometry(0.24, 0.065, 6, 14), cord); coil.position.set(0, -0.12, -0.02); coil.rotation.y = Math.PI / 2; g.add(coil);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(1.55);   // (to his size: the hero is ~5 tall, so the staff stands a head over him)
  X.props.root.add(g); return g;
}
const ROPE_ACT = {
  icon: '📏', title: 'מדידה בחבל',
  walkLine: () => 'לכו אל היתד האדומה: מותחים את החבל',
  stand(m, X) { const R = ROPE[SH.ropeI | 0] || ROPE[0]; const dx = R.b[0] - R.a[0], dz = R.b[1] - R.a[1], L = Math.hypot(dx, dz); return { x: R.a[0] + (dx / L) * 1.2, z: R.a[1] + (dz / L) * 1.2, face: R.b, mx: R.a[0], mz: R.a[1] }; },
  prepare() { SH.ropeI = 0; },
  make(m, X) {
    const lv = X.level(), vmax = [6, 7, 8][lv - 1], C = SH.crew, T = X.THREE;
    const A = { side: -1, d: 0, v: 0, hold: false, phase: 'idle', res: [], holder: null, rope: null, ring: null, tStop: 0, t: 0, stuck: 0, rod: null, bob: 0 };
    const hp = { x: 0, y: 0, z: 0 }, hand = new T.Vector3();
    const drive = (vx, vz) => { try { X.hero.drive(vx, vz); } catch (e) { /* */ } };
    function heroP() { const h = X.stages.heroXYZ(hp); return h && Number.isFinite(h.x) ? h : null; }
    function side(i) {
      A.side = i; SH.ropeI = i; const R = ROPE[i];
      A.ax = R.a[0]; A.az = R.a[1]; A.bx = R.b[0]; A.bz = R.b[1]; const L = Math.hypot(A.bx - A.ax, A.bz - A.az); A.ux = (A.bx - A.ax) / L; A.uz = (A.bz - A.az) / L;
      A.px = -A.uz; A.pz = A.ux;
      A.d = 1.2; A.v = 0; A.hold = false; A.phase = 'ready'; A.stuck = 0;
      // the crewman at the 450 stake, the rope's end in his hands, leaning back on it
      if (A.holder) C.remove(A.holder);
      A.holder = C.add(A.ax - A.ux * 1.4 - A.px * 1.3, A.az - A.uz * 1.4 - A.pz * 1.3, { role: 'pull', item: 'rope', fx: A.bx, fz: A.bz, crew: 1 });
      if (!A.rope) A.rope = X.props.rope(28, 0.06);
      // the far stake to land on: its ghost and a gold ring round it (he sees it coming)
      if (A.ring) X.props.remove(A.ring); A.ring = X.props.ringAt(A.bx, A.bz, 1.6, 0.18, X.props.M.gold);
      if (A.ghost) X.props.remove(A.ghost); A.ghost = X.props.stake(A.bx, A.bz, 1.6, true); A.ghost.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; } });
      const sp = { x: A.ax + A.ux * 1.2, z: A.az + A.uz * 1.2 };
      if (i > 0) { try { X.hero.dash({ x: sp.x, z: sp.z, face: [A.bx, A.bz] }); } catch (e) { /* */ } A.phase = 'go'; A.tStop = 0; }
      X.line('החזיקו: הכהן צועד עם החבל · שחררו על היתד');
      const g = X.ground(A.ax, A.az);
      X.hand({ x: A.ax + A.ux * 8, y: g + 3, z: A.az + A.uz * 8 }, 0, 0);
    }
    // the camera: behind him and a little to the side, the far stake ahead in the frame, following his walk smoothly
    function cam(h, rate) {
      const g = X.ground(h.x, h.z);
      // (the stake driven: from his side, the new stake and him in one frame)
      if (A.phase === 'driven') { X.track([h.x + A.px * 11 - A.ux * 2, g + 6, h.z + A.pz * 11 - A.uz * 2], [h.x + A.ux * 0.5, g + 1.4, h.z + A.uz * 0.5], 2.2); return; }
      X.track([h.x - A.ux * 16 + A.px * 7, g + 9, h.z - A.uz * 16 + A.pz * 7], [h.x + A.ux * 13, g + 1.6, h.z + A.uz * 13], rate || 3);
    }
    function rodDraw(h, dt) {
      if (!A.rod) A.rod = rodProp(X);
      let yaw = 0; try { yaw = X.hero.yaw; } catch (e) { /* */ }
      if (!Number.isFinite(yaw)) yaw = Math.atan2(A.ux, A.uz);
      const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -fz, rz = fx;   // (his right: −x of his facing in the world's turn)
      A.bob += dt * (A.v > 0.3 ? 9 : 2);
      const b = A.v > 0.3 ? Math.sin(A.bob) * 0.06 : 0;
      // (in his very fist: the right hand's bone in the world; the figure is ~5 tall, so a bare offset from his feet sat at his knee)
      if (A.handB === undefined) { let m = null; try { m = X.hero.mesh; } catch (e) { /* */ } A.handB = (m && m.getObjectByName && m.getObjectByName('hero-handR')) || null; }
      if (A.handB) { A.handB.updateWorldMatrix(true, false); A.handB.getWorldPosition(hand); }
      else hand.set(h.x + fx * 0.3 - rx * 0.75, h.y + 2.67 + b, h.z + fz * 0.3 - rz * 0.75);
      A.rod.position.copy(hand); A.rod.rotation.set(0, yaw, 0);
    }
    function ropeDraw() {
      if (!A.holder || !A.rope) return;
      const w = A.holder.a, gy = X.ground(w.x, w.z);
      const sag = A.hold || A.phase === 'slide' ? 0.12 : clamp(0.9 - A.v * 0.1, 0.15, 0.9);
      A.rope.set({ x: w.x + A.ux * 0.6, y: gy + 1.7, z: w.z + A.uz * 0.6 }, { x: hand.x, y: hand.y - 0.2, z: hand.z }, sag);
    }
    function settle() {
      // the release: he slides on a step (the rope is heavy) and stops; the stake is driven where he stands
      drive(0, 0);
      const L = 50, err = Math.abs(A.d - L) / L, lvW = [0.03, 0.025, 0.02][lv - 1];
      const grade = err <= lvW ? 'gold' : err <= 0.08 ? 'good' : 'ok';
      const h = heroP() || { x: A.ax + A.ux * A.d, z: A.az + A.uz * A.d }, at = { x: h.x, y: X.ground(h.x, h.z) + 1.5, z: h.z };
      const amot = Math.round(450 + A.d);
      A.res.push(grade);
      if (grade === 'ok') {
        // too far off: he walks to the true place and drives it there — counted half (spec: לא נכשל במדידה)
        X.word(at, A.d > L ? 'עבר את היתד · חוזרים' : 'קצר מדי · ממשיכים');
        A.phase = 'fix';
        Promise.resolve(X.hero.walkTo({ x: A.bx - A.ux * 0.7, z: A.bz - A.uz * 0.7, face: [A.bx + A.ux, A.bz + A.uz] })).catch(() => {}).then(() => drive2('ok', amot));
      } else drive2(grade, amot);
    }
    function drive2(grade, amot) {
      const h = heroP() || { x: A.bx, z: A.bz };
      const x = grade !== 'ok' ? h.x + A.ux * 0.7 : A.bx, z = grade !== 'ok' ? h.z + A.uz * 0.7 : A.bz, g = X.ground(x, z);
      const s = X.props.stake(x, z, 1.6, true); SH.stakes.push(s); s.scale.y = 0.05;
      A.drive = { s, t: 0 };
      X.dust(x, g + 0.3, z, 8, 2.5); X.play('wedge'); X.shake(0.1, 0.18);
      const bul = grade === 'gold' && amot === 500;
      X.hit({ x, y: g + 2, z }, grade, { text: grade === 'ok' ? `${amot} → 500` : `${amot} אמה`, craft: 'מודדים', kind: 'craft' });
      if (bul) { X.perfect('בול! 500 אמה', { x, y: g + 1.5, z }); X.bonus(40, 'bul', 'בול על היתד'); }
      if (A.ring) { X.props.remove(A.ring); A.ring = null; } if (A.ghost) { X.props.remove(A.ghost); A.ghost = null; }
      A.phase = 'driven'; A.tStop = 0;
      X.hand(null); X.count(null);
    }
    function finish() {
      A.phase = 'done';
      const q = A.res.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.res.length;
      // the corner closes: 500 by 500 — the plan flashes round the whole Mount, the crews' stakes stand
      SH.sq.material.opacity = 1; A.flash = 0;
      X.bonus(100, 'rope', 'כל הצלעות · 500 על 500');
      X.word({ x: SQ.x1, y: X.ground(SQ.x1, SQ.z0) + 4, z: SQ.z0 }, 'מדות ב, א: חמש מאות על חמש מאות');
      const g = X.ground(SQ.x1, SQ.z0);
      X.line(''); X.hand(null);
      X.shot([(SQ.x0 + SQ.x1) / 2 + 120, 360, SQ.z1 + 260], [(SQ.x0 + SQ.x1) / 2 + 10, 0, (SQ.z0 + SQ.z1) / 2 - 20], 1.6);
      setTimeout(() => X.end({ q, stars: q >= 0.95 ? 3 : q >= 0.75 ? 2 : 1, at: { x: SQ.x1, y: g + 2, z: SQ.z0 } }), 3200);
    }
    return {
      begin() { side(0); const h = heroP(); if (h) cam(h, 3); },
      update(dt) {
        A.t += dt;
        const h = heroP(); if (!h) return;
        if (A.phase === 'go') { A.tStop += dt; if ((!X.hero.walking && A.tStop > 0.3) || A.tStop > 3) { A.phase = 'ready'; } }
        if (A.phase === 'ready' || A.phase === 'pull' || A.phase === 'slide') {
          if (A.hold) A.v = lerp(A.v, vmax, 1 - Math.exp(-dt / 0.45));
          else A.v *= Math.exp(-dt / 0.24);
          // where he is along the side (his own feet), and back onto the line if a step took him aside
          const d0 = A.d;
          A.d = (h.x - A.ax) * A.ux + (h.z - A.az) * A.uz;
          const e = (h.x - A.ax) * A.px + (h.z - A.az) * A.pz;
          if (A.v > 0.15) drive(A.ux * A.v - A.px * e * 2, A.uz * A.v - A.pz * e * 2); else drive(0, 0);
          // (a step refused by something underfoot: he is set on along the line, never stuck)
          if (A.v > 1.5 && A.d - d0 < A.v * dt * 0.2) { A.stuck += dt; if (A.stuck > 0.35) { try { X.hero.setPos(h.x + A.ux * A.v * dt * 3, h.z + A.uz * A.v * dt * 3, Math.atan2(A.ux, A.uz)); } catch (er) { /* */ } } } else A.stuck = 0;
          X.count({ x: h.x, y: X.ground(h.x, h.z) + 4.6, z: h.z }, `${Math.round(450 + A.d)} אמה`);
          // released and stopped: a short pull (under 30 amot) is a test — hold again; a real one settles
          if (A.phase === 'slide' && A.v < 0.2) { drive(0, 0); if (A.d < 30) { A.phase = 'ready'; X.line('עוד: החזיקו עד היתד'); } else settle(); }
          // too far: the crewman at the stake calls him back (spec: מאוחר — הפועל נעצר ומסמן "חזרה")
          if (A.d > 50 * 1.12 && A.phase === 'pull') { A.hold = false; A.phase = 'slide'; A.v = Math.min(A.v, 1); X.word({ x: h.x, y: X.ground(h.x, h.z) + 3, z: h.z }, 'עצור!'); }
        }
        if (A.drive) { A.drive.t += dt; A.drive.s.scale.y = Math.min(1, 0.05 + A.drive.t * 6); if (A.drive.t > 0.3) A.drive = null; }
        if (A.phase === 'driven') { A.tStop += dt; if (A.tStop > 1.6) { if (A.side + 1 < H109.ROPE_SIDES) side(A.side + 1); else finish(); } }
        if (A.phase === 'done' && SH.sq) { A.flash += dt; SH.sq.material.opacity = 0.32 + 0.68 * Math.max(0, Math.cos(A.flash * 7)) * Math.max(0, 1 - A.flash / 2.4); }
        if (A.phase !== 'done') cam(h, A.phase === 'go' ? 2 : 3.2);
        rodDraw(h, dt); ropeDraw();
      },
      wants() { return true; },   // ── h115 ── (the rope is held anywhere) ── /h115 ──
      down() { if (A.phase === 'ready' || A.phase === 'slide') { A.hold = true; A.phase = 'pull'; X.play('rope'); X.hand(null); } },
      move() {},
      up() { if (A.phase === 'pull') { A.hold = false; A.phase = 'slide'; } },
      cancel() { if (A.phase === 'pull') { A.hold = false; A.phase = 'slide'; } },
      end() { drive(0, 0); if (A.holder) { C.remove(A.holder); A.holder = null; } if (A.rope) { A.rope.dispose(); A.rope = null; } if (A.rod) { X.props.remove(A.rod); A.rod = null; } if (A.ring) X.props.remove(A.ring); if (A.ghost) X.props.remove(A.ghost); if (SH.sq) SH.sq.material.opacity = 0.32; X.count(null); },
      at() { return { x: SQ.x1, y: X.ground(SQ.x1, SQ.z0) + 2, z: SQ.z0 }; },
      dbg() { return { side: A.side, d: +A.d.toFixed(2), v: +A.v.toFixed(2), phase: A.phase, res: A.res.slice() }; },
    };
  },
};

/* ───────── 3.2 the strike on the beat: the small rocks of the sector, the old game's ring, the compass to the next ───────── */
const ROCKS_ACT = {
  icon: '⛏', title: 'פיצוץ ההר',
  walkLine: (m) => (m.free ? 'סלעים בהר · עבודת רשות' : `גזרה ${m.s + 1} מתוך 9: לכו אל הסלעים`),
  stand(m, X) { const L = SH.rocks[m.s] || [], st = X.M.st, a = st.rocks[m.s] || []; const R = L.find((r) => (a[r.i] | 0) < 0 && r.q && r.q.vis) || L[0]; return R ? { x: R.sx, z: R.sz, face: [R.x, R.z] } : null; },
  prepare(m, X) {
    // the sector's crews: two at its big rock with picks ON the beat (they teach the beat), two carriers to the cart
    const b = SH.bould[m.s]; if (!b) return; const C = SH.crew;
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
    for (let k = 0; k < 2; k++) { const a = Math.PI + k * 0.9 + m.s, x = b[0] + Math.cos(a) * (b[2] + 2.1), z = b[1] + Math.sin(a) * (b[2] + 2.1); SH.secCrew.push(C.add(x, z, { role: 'pick', item: 'pick', fx: b[0], fz: b[1], off: 0, crew: 0 })); }
    // (the carriers take the chips to the waste pile on the slope east of the cells: BOOK.pile)
    for (let k = 0; k < 2; k++) SH.secCrew.push(C.add(b[0] + 8, b[1] + k * 3, { role: 'carry', from: [b[0] + 8, b[1] + k * 3], to: [BOOK.pile.x - 3, BOOK.pile.z + k * 2], item: 'stone', crew: 2 }));
  },
  make(m, X) {
    const lv = X.level(), k = lv >= 3 ? 1 : 2, win = H109.GOLD[lv - 1], replay = (X.M.st.plays[m.id] | 0) > 0;
    const hp0 = H109.HP[lv - 1] + (replay ? 1 : 0);
    const st = X.M.st; if (!st.rocks[m.s]) st.rocks[m.s] = Array((SH.rocks[m.s] || []).length || 3).fill(-1); const L = (SH.rocks[m.s] || []).filter((R) => (st.rocks[m.s][R.i] | 0) < 0);
    const A = { i: -1, R: null, phase: 'walk', hits: [], all: [], pend: null, ring: null, band: null, seam: null, t: 0, armed: false, walkT: 0, fails: 0 };
    const off = [];
    function rock(i) {
      A.i = i; A.R = L[i]; A.hits = [];
      if (!A.R) { finish(); return; }
      const R = A.R;
      if (!R.q) R.q = X.props.rockAdd(R.x, R.z, R.r, { hp: hp0, sector: m.s });
      R.q.hp = R.q.hp0 = hp0; R.q.crack = 0;
      A.phase = 'walk'; A.walkT = 0; A.armed = false;
      try { X.hero.walkTo({ x: R.sx, z: R.sz, face: [R.x, R.z] }); } catch (e) { /* */ }
      if (R.q) { R.q.y = X.ground(R.x, R.z); X.props.rockSet(R.q); }
      // ── h115 ── (the full replay: the shot looked through the cell's big rock and the hill) the first side whose view is clear ── /h115 ──
      const O = (SH.bould || []).filter(Boolean).map((q) => ({ x: q[0], y: X.ground(q[0], q[1]) + q[2] * 0.45, z: q[1], r: q[2] * 0.95 }));
      let ws = null; for (const side of [-1.15, 1.15, -0.5, 0.5, -1.7, 1.7, 0]) { const w = X.workShot({ x: R.x, z: R.z }, { x: R.sx, z: R.sz }, { dist: 23, el: 32, side, lift: 1.0 }); if (!ws) ws = w; if (clearView(X, w.p, w.t, O) && !rayBlocked(X, w.p, w.t)) { ws = w; break; } }
      X.shot(ws.p, ws.t, i === 0 ? 0.9 : 0.6);
      // the ring that closes to the gold band on the beat (≥ 110 px: it is on the ground round the rock, r × 2.6 → r)
      if (A.ring) X.props.remove(A.ring); if (A.band) X.props.remove(A.band);
      A.band = X.props.ringAt(R.x, R.z, R.r * 1.35, 0.16, X.props.M.gold);
      A.ring = X.props.ringAt(R.x, R.z, R.r * 3, 0.07, X.props.M.ring);
      // L2+: a seam marked on the rock (a strike aimed at it counts twice); L3: two
      if (A.seam) { for (const s of A.seam) X.props.remove(s); } A.seam = [];
      if (lv >= 2) for (let j = 0; j < (lv >= 3 ? 2 : 1); j++) A.seam.push(seamMesh(R, j));
    }
    function seamMesh(R, j) {
      const T = X.THREE, g = X.ground(R.x, R.z), a = Math.atan2(R.uz, R.ux) + (j ? -0.45 : 0.35);
      const m2 = new T.Mesh(new T.PlaneGeometry(0.16, R.r * 0.9), X.props.M.seam.clone());
      const x = R.x + Math.cos(a) * R.r * 0.93, z = R.z + Math.sin(a) * R.r * 0.93;
      m2.position.set(x, g + R.r * 0.38, z); m2.lookAt(x + Math.cos(a), g + R.r * 0.38, z + Math.sin(a)); m2.rotateZ(0.25 - j * 0.5);
      m2.renderOrder = 997; X.props.root.add(m2); m2.userData.p = { x, y: g + R.r * 0.38, z }; return m2;
    }
    function strike(p) {
      if (A.phase !== 'work' || A.pend) return;
      const R = A.R, tgt = rockTarget(R, X);
      // aimed at a seam? (a tap within 46 px of one: the strike goes there and counts twice)
      let aim = null; for (const s of A.seam || []) { const q = X.scr(s.userData.p.x, s.userData.p.y, s.userData.p.z); if (q.on && Math.hypot(q.x - p.x, q.y - p.y) < 46) aim = s; }
      const err = SH.B.err(0.09, k);
      A.pend = { err, aim, t: 0 };
      let ok = null; try { ok = X.hero.act('pick', aim ? { x: aim.userData.p.x, y: aim.userData.p.y - 0.3, z: aim.userData.p.z } : tgt, { snap: true }); } catch (e) { ok = null; }
      if (ok && ok.then) ok.then(() => land()); else setTimeout(land, 90);
      setTimeout(() => { if (A.pend) land(); }, 400);
    }
    function land() {
      const P = A.pend; if (!P) return; A.pend = null;
      const R = A.R; if (!R || !R.q) return;
      const grade = X.M.grade(P.err, lv) === 'gold' && Math.abs(P.err) > win ? 'good' : X.M.grade(P.err, lv);
      A.hits.push(grade); A.all.push(grade);
      const g = X.ground(R.x, R.z), at = { x: R.x, y: g + R.r * 1.2, z: R.z };
      X.props.rockHit(R.q, P.aim ? 2 : 1);
      if (grade === 'ok') { X.word(at, 'מחוץ לקצב'); X.play('thud'); X.dust(R.x, g + R.r * 0.5, R.z, 3, 1.5); }
      else { X.hit(at, grade, { text: P.aim ? 'בנקב! ×2' : '', craft: 'חוצבים', kind: 'craft' }); X.sparks(R.x + R.ux * R.r * 0.7, g + R.r * 0.6, R.z + R.uz * R.r * 0.7, grade === 'gold' ? 14 : 7); X.dust(R.x, g + R.r * 0.6, R.z, 5, 2); }
      if (R.q.hp <= 0) split();
    }
    function split() {
      const R = A.R, g = X.ground(R.x, R.z), at = { x: R.x, y: g + R.r + 1, z: R.z };
      const n = A.hits.length, oks = A.hits.filter((h) => h === 'ok').length, ugly = oks * 2 > n;
      const best = A.hits.includes('gold') ? (ugly ? 'good' : 'gold') : A.hits.includes('good') ? 'good' : 'ok';
      X.M.rockHit(m.s, R.i, ugly ? 'ok' : best);
      X.play('split'); X.shake(0.18, 0.4); X.dust(R.x, g + 0.6, R.z, 14, 3.5);
      if (ugly) X.word(at, 'נבקע עקום · כשר');
      else X.bonus(60, 'split', 'הסלע נבקע!');
      A.phase = 'split'; A.walkT = 0;
      if (A.ring) { X.props.remove(A.ring); A.ring = null; } if (A.band) { X.props.remove(A.band); A.band = null; }
      for (const s of A.seam || []) X.props.remove(s); A.seam = [];
      try { X.hero.arm(null); } catch (e) { /* */ }
      // the carriers take the chunks in a while
      setTimeout(() => { try { X.props.clearRubble(R.x, R.z, R.r + 3); } catch (e) { /* */ } }, 6000);
    }
    function finish() {
      if (A.phase === 'done') return; A.phase = 'done';
      const N = A.all.length || 1, q = A.all.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.45), 0) / N;
      X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1 });
    }
    return {
      close: true,
      begin() { rock(0); X.line('הקישו כשהטבעת על הזהב'); },
      update(dt) {
        A.t += dt; const R = A.R;
        if (A.phase === 'walk') {
          A.walkT += dt;
          if (!X.hero.walking || A.walkT > 2.5) { A.phase = 'work'; A.armed = false; try { X.hero.arm('pick', rockTarget(R, X)); A.armed = true; } catch (e) { /* */ } if (A.i === 0) X.hand({ x: R.x, y: X.ground(R.x, R.z) + R.r, z: R.z }, 0, 14); }
        }
        if (A.phase === 'split') { A.walkT += dt; if (A.walkT > 0.9) rock(A.i + 1); }
        // the ring: it closes from far to the gold band at every gold moment
        if (A.ring && R) { const ph = SH.B.phase(k), s = R.r * (1.35 + 2.0 * (1 - ph)); A.ring.scale.setScalar(s); A.ring.material.opacity = 0.35 + 0.6 * ph; A.band.material.opacity = ph > 0.86 || ph < 0.06 ? 1 : 0.55; }
        if (A.phase === 'work' && !A.pend && !X.hero.busy && !X.hero.armed && !X.hero.walking) { try { X.hero.arm('pick', rockTarget(R, X)); } catch (e) { /* */ } }
      },
      wants() { return A.phase === 'work'; },   // ── h115 ── (a strike is a tap anywhere, on the beat) ── /h115 ──
      down(p) { strike(p); },
      move() {}, up() {},
      end() { if (A.ring) X.props.remove(A.ring); if (A.band) X.props.remove(A.band); for (const s of A.seam || []) X.props.remove(s); try { X.hero.arm(null); } catch (e) { /* */ } for (const o of off) o(); },
      at() { const R = A.R || L[L.length - 1]; return R ? { x: R.x, y: X.ground(R.x, R.z) + 2, z: R.z } : null; },
      dbg() { return { i: A.i, n: L.length, phase: A.phase, hp: A.R && A.R.q ? A.R.q.hp : null, hits: A.all.slice(-6), ph: +SH.B.phase(k).toFixed(2) }; },
    };
  },
};

/** ── h115 ── the crews' cutting: one cell at a time, the gang at it with picks, its benches coming down (stages.cells), paved some
 *  seconds after it is level; a little more of the Mount every two and a half minutes as well (st.crewX, up to 8 past the works) */
function crewFrame(dt, X) {
  const cells = SH.cells; if (!cells || !cells.on) return;
  const st = X.M.st;
  SH.crewClock = (SH.crewClock || 0) + dt;
  if (SH.crewClock > 150 && (st.crewX | 0) < 8) { SH.crewClock = 0; st.crewX = (st.crewX | 0) + 1; }
  SH.cutT -= dt;
  const A = SH.cutAt;
  if (A) {
    if (!cells.cutting(A.k, A.r)) { A.wait = (A.wait || 0) + dt; if (A.wait > 8) { cells.set(A.k, A.r, 'paved'); SH.cutAt = null; SH.cutT = 3; } }
    return;
  }
  if (SH.cutT > 0) return;
  const c = crewCells(X, false);
  for (const w of SH.cutGang) SH.crew.remove(w); SH.cutGang = [];
  if (!c) { SH.cutT = 5; return; }
  // the gang on the cell's low edge (east), facing into it
  const R = rectOf(c.k, c.r);
  for (let j = 0; j < 3; j++) { const x = R.x1 - 2.5, z = R.z0 + 6 + j * 6.5; SH.cutGang.push(SH.crew.add(x, z, { role: 'pick', item: 'pick', fx: R.cx, fz: z, off: j * 0.33, crew: 0 })); }
  cells.set(c.k, c.r, 'cut', { dur: 16 }); sectorGone(X, c.s);
  SH.cutAt = { k: c.k, r: c.r, wait: 0 };
}

export const ACTS = {
  rope: ROPE_ACT, rocks: ROCKS_ACT, read: READ, pave: PAVE, waste: WASTE, corner: CORNER, course: COURSE, great: GREAT, letters: LETTERS,
  __init: initWorld,
  __ensure(m, X) { if (m && (m.k === 'rocks' || m.k === 'read') && m.free) ensureSector(X, m.s); },   // ── h116 ── ── /h116 ──
  __sh: () => SH,   // (tests: the world the acts share)
  __frame(dt, X) {
    if (!SH.B) return;
    // the ground moves under the small rocks as the Mount comes down and the fill rises: they sit on it as it is now
    SH.regT = (SH.regT || 0) + dt;
    if (SH.regT > 1.2 && SH.rocks) { SH.regT = 0; for (const L of SH.rocks) for (const R of L || []) if (R.q) { const g = X.ground(R.x, R.z); if (Math.abs(g - R.q.y) > 0.05) { R.q.y = g; X.props.rockSet(R.q); } } }
    SH.B.step(dt); if (SH.crew) SH.crew.update(dt, SH.B); frame2(dt, X, SH); frame3(dt, X, SH);
    crewFrame(dt, X);
  },
};
export { SQ, ROPE, rockTarget, CREW_CELLS, crewTarget };
void onPlane; void ease;
