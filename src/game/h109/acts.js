/* ── build 109 ── h109/acts.js — the acts of stage 01, each played IN the world (spec §3). The registry the director reads:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face, mx?, mz? }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg() } — it calls X.end({ stars, q, lost?, waste?, at }) once.
 *   ACTS.__init(X): the world of the stage as the save has it (the sectors' rocks, the stakes, the paved sectors, the waste pile);
 *   ACTS.__frame(dt, X): every frame (the beat, the crews, the great stone's journey, the crews' own rocks).
 * This file: the shared state, the rope (3.1) and the strike on the beat (3.2). The others: acts2.js (3.3 read, 3.4 pave, 3.9 waste),
 * acts3.js (3.5 corner, 3.6 course, 3.7 great stone, 3.8 the inscription).
 */
import { H109 } from './model.js';
import { createBeat, createGang, onPlane, clamp, lerp, ease } from './kit.js';
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

/** the five small rocks round sector s's big rock (deterministic): the places with most room round it, each with a stand that is
 *  clear (the kohen at the pick's reach on the side with room), five amot apart at least */
function sectorRocks(s) {
  const B = SH.bould, b = B[s]; if (!b) return [];
  const room = (x, z, skip) => { let d = 60; for (let j = 0; j < B.length; j++) { if (j === skip) continue; const o = B[j]; d = Math.min(d, Math.hypot(x - o[0], z - o[1]) - o[2]); } return d; };
  const C = [];
  for (let k = 0; k < 28; k++) for (let ri = 0; ri < 7; ri++) {
    const a = (k / 28) * TAU + s * 0.37, d = b[2] + 3.6 + ri * 1.6, x = b[0] + Math.cos(a) * d, z = b[1] + Math.sin(a) * d, r = 1.7 + hash(s * 3 + k, ri) * 0.45;
    // (inside the platform, clear of its edge trench: by the edge the hill's slope stands over the ground he walks on)
    const edge = Math.min(x - SQ.x0, SQ.x1 - x, z - SQ.z0, SQ.z1 - z); if (edge < r + 9) continue;
    const clr = Math.min(room(x, z, -1), d - b[2]); if (clr < r + 1.2) continue;
    // the stand: of 8 sides, the one with most room
    let best = null, bc = -1; for (let q = 0; q < 8; q++) { const qa = (q / 8) * TAU, sx = x + Math.cos(qa) * (r * 0.75 + 3.4), sz = z + Math.sin(qa) * (r * 0.75 + 3.4), c = room(sx, sz, -1); if (c > bc) { bc = c; best = { qa, sx, sz }; } }
    if (bc < 1.6 || Math.min(best.sx - SQ.x0, SQ.x1 - best.sx, best.sz - SQ.z0, SQ.z1 - best.sz) < 6) continue;
    C.push({ x, z, r, ux: Math.cos(best.qa), uz: Math.sin(best.qa), sx: best.sx, sz: best.sz, score: clr + bc * 0.5 - ri * 0.35 });
  }
  C.sort((p, q) => q.score - p.score);
  const out = [];
  for (const c of C) {
    if (out.length >= H109.ROCKS) break;
    if (out.some((o) => Math.hypot(o.x - c.x, o.z - c.z) < 5 || Math.hypot(o.sx - c.x, o.sz - c.z) < c.r + 2 || Math.hypot(c.sx - o.x, c.sz - o.z) < o.r + 2)) continue;
    out.push({ ...c, i: out.length, s, q: null });
  }
  // walk order: round the big rock
  out.sort((p, q) => Math.atan2(p.z - b[1], p.x - b[0]) - Math.atan2(q.z - b[1], q.x - b[0])); out.forEach((o, i) => { o.i = i; });
  return out;
}
function rockTarget(R, X) { const g = X.ground(R.x, R.z); return { x: R.x + R.ux * R.r * 0.72, y: g + R.r * 0.62, z: R.z + R.uz * R.r * 0.72 }; }

function initWorld(X) {
  SH.X = X; SH.B = createBeat(X); SH.crew = createGang(X);
  try { SH.bould = X.stages.boulderSpots(); } catch (e) { SH.bould = []; }
  const st = X.M.st, done = (id) => st.done.includes(id);
  // the big rocks: the sector's own until it is read; the crews' (9..11) go as the sectors before them are paved
  const bs = []; for (let i = 0; i < 12; i++) bs.push(i < 9 ? (done('read' + i) ? 0 : 3) : (done('pave' + [2, 5, 8][i - 9]) ? 0 : 3));
  try { X.stages.setBoulders(bs); } catch (e) { /* */ }
  // the small rocks of every sector not yet struck
  SH.rocks = [];
  for (let s = 0; s < 9; s++) {
    const L = sectorRocks(s); SH.rocks[s] = L;
    if (done('rocks' + s)) continue;
    for (const R of L) { if ((st.rocks[s][R.i] | 0) >= 0) continue; R.q = X.props.rockAdd(R.x, R.z, R.r, { hp: 2, sector: s, sy: 0.8 + hash(R.x, R.z) * 0.15 }); }
  }
  // the surveyors' stakes every 50 amot round the square (the crews measured it; the kohen stretches the last of two sides)
  SH.stakes = [];
  const ropeDone = done('rope');
  const edge = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 50); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), z = lerp(z0, z1, i / n); if (!ropeDone && Math.hypot(x - SQ.x1, z - SQ.z0) < 1) continue; SH.stakes.push(X.props.stake(x, z, 1.6, i % 2 === 0)); } };
  edge(SQ.x0, SQ.z0, SQ.x1, SQ.z0); edge(SQ.x1, SQ.z1, SQ.x1, SQ.z0 + 50); edge(SQ.x0, SQ.z1, SQ.x1, SQ.z1); edge(SQ.x0, SQ.z0, SQ.x0, SQ.z1);
  // the gold plan of the square on the hill (spec 3.1: "תוכנית הזהב פרושה על הגבעה"): faint, bright when the rope closes
  SH.sq = planLine(X); SH.sq.material.opacity = ropeDone ? 0.32 : 0.55;
  // the world's crews at work from the first second: the surveyors on the far side, the crews breaking their own big rocks
  const C = SH.crew;
  if (!ropeDone) { C.add(SQ.x0 + 4, SQ.z1 - 120, { role: 'pull', fx: SQ.x0 + 4, fz: SQ.z1 - 170, item: 'rope' }); C.add(SQ.x0 + 4, SQ.z1 - 172, { role: 'kneel', fx: SQ.x0 + 4, fz: SQ.z1 - 120 }); }
  for (let i = 9; i < 12; i++) { const b = SH.bould[i]; if (!b || bs[i] <= 0) continue; for (let k = 0; k < 2; k++) { const a = k * 2.4 + i, x = b[0] + Math.cos(a) * (b[2] + 2.2), z = b[1] + Math.sin(a) * (b[2] + 2.2); C.add(x, z, { role: 'pick', item: 'pick', fx: b[0], fz: b[1], off: k * 0.5, crew: i }); } }
  initWorld2(X, SH); initWorld3(X, SH);
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
const ROPE_ACT = {
  icon: '📏', title: 'מדידה בחבל',
  walkLine: () => 'לכו אל היתד האדומה: מותחים את החבל',
  stand(m, X) { const R = ROPE[SH.ropeI | 0] || ROPE[0]; const dx = R.b[0] - R.a[0], dz = R.b[1] - R.a[1], L = Math.hypot(dx, dz); return { x: R.a[0] - (dx / L) * 1.6, z: R.a[1] - (dz / L) * 1.6, face: R.b, mx: R.a[0], mz: R.a[1] }; },
  prepare() { SH.ropeI = 0; },
  make(m, X) {
    const lv = X.level(), vmax = [7, 8.5, 10][lv - 1], C = SH.crew;
    const A = { side: -1, d: 0, v: 0, hold: false, phase: 'idle', res: [], walker: null, rope: null, far: null, ring: null, tStop: 0, t: 0, tries: 0 };
    const hp = { x: 0, y: 0, z: 0 };
    function side(i) {
      A.side = i; SH.ropeI = i; const R = ROPE[i];
      A.ax = R.a[0]; A.az = R.a[1]; A.bx = R.b[0]; A.bz = R.b[1]; const L = Math.hypot(A.bx - A.ax, A.bz - A.az); A.ux = (A.bx - A.ax) / L; A.uz = (A.bz - A.az) / L;
      A.d = 0; A.v = 0; A.hold = false; A.phase = 'ready'; A.tries = 0;
      if (A.walker) C.remove(A.walker);
      A.walker = C.add(A.ax + A.ux * 1.2, A.az + A.uz * 1.2, { role: 'walk', item: 'rope', fx: A.bx, fz: A.bz, crew: 1 });
      if (!A.rope) A.rope = X.props.rope(28, 0.06);
      // the far stake to land on: a gold ring round it (the anticipation: he sees it coming)
      if (A.far) X.props.remove(A.far); A.far = null;
      if (A.ring) X.props.remove(A.ring); A.ring = X.props.ringAt(A.bx, A.bz, 1.6, 0.18, X.props.M.gold);
      if (A.ghost) X.props.remove(A.ghost); A.ghost = X.props.stake(A.bx, A.bz, 1.6, true); A.ghost.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; } });
      const sp = { x: A.ax - A.ux * 1.6, z: A.az - A.uz * 1.6 };
      if (i > 0) { try { X.hero.dash({ x: sp.x, z: sp.z, face: [A.bx, A.bz] }); } catch (e) { /* */ } }
      // the shot (ש3 along the line): behind and to the side of him, the far stake in the frame
      const px = -A.uz, pz = A.ux, g = X.ground(A.ax, A.az);
      X.shot([A.ax - A.ux * 17 + px * 6.5, g + 9, A.az - A.uz * 17 + pz * 6.5], [A.ax + A.ux * 21 - px * 1.5, g + 1.5, A.az + A.uz * 21 - pz * 1.5], i > 0 ? 1.2 : 0.9);
      X.line('החזיקו את האצבע: הפועל הולך עם החבל. שחררו על היתד הזהובה');
      X.hand({ x: A.ax + A.ux * 25, y: g + 3, z: A.az + A.uz * 25 }, 0, 0);
    }
    function ropeDraw() {
      if (!A.walker || !A.rope) return;
      X.heroAt(); const h = X.stages.heroXYZ(hp);
      const w = A.walker.a, gy = X.ground(w.x, w.z);
      const sag = A.hold || A.phase === 'slide' ? 0.15 : clamp(0.9 - A.v * 0.1, 0.15, 0.9);
      A.rope.set({ x: h.x + A.ux * 0.8, y: h.y + 1.6, z: h.z + A.uz * 0.8 }, { x: w.x - A.ux * 0.3, y: gy + 1.7, z: w.z - A.uz * 0.3 }, sag);
    }
    function settle() {
      // the release: he slides on (the rope is heavy) and stops; the stake is driven where he stands
      const L = 50, err = Math.abs(A.d - L) / L, lvW = [0.03, 0.025, 0.02][lv - 1];
      const grade = err <= lvW ? 'gold' : err <= 0.08 ? 'good' : 'ok';
      const w = A.walker.a, at = { x: w.x, y: X.ground(w.x, w.z) + 1.5, z: w.z };
      const amot = Math.round(450 + A.d);
      A.res.push(grade);
      if (grade === 'ok') {
        // too far off: the crew sets the stake right (he walks to the true place and drives it) — counted half (spec: לא נכשל במדידה)
        X.word(at, A.d > L ? 'עבר את היתד — מתקנים' : 'קצר מדי — מתקנים');
        A.phase = 'fix';
        C.walkTo(A.walker, A.bx - A.ux * 0.6, A.bz - A.uz * 0.6, 3).then(() => drive('ok', amot));
      } else drive(grade, amot);
    }
    function drive(grade, amot) {
      const x = A.side >= 0 && grade !== 'ok' ? A.walker.a.x : A.bx, z = grade !== 'ok' ? A.walker.a.z : A.bz, g = X.ground(x, z);
      const s = X.props.stake(x, z, 1.6, true); SH.stakes.push(s); s.scale.y = 0.05;
      A.drive = { s, t: 0 };
      X.dust(x, g + 0.3, z, 8, 2.5); X.play('wedge'); X.shake(0.1, 0.18);
      X.hit({ x, y: g + 2, z }, grade, { text: grade === 'ok' ? `${amot} → 500` : `${amot} אמה`, craft: 'מודדים', kind: 'craft' });
      if (A.ring) { X.props.remove(A.ring); A.ring = null; } if (A.ghost) { X.props.remove(A.ghost); A.ghost = null; }
      A.phase = 'driven'; A.tStop = 0;
      X.hand(null);
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
      setTimeout(() => X.end({ q, stars: q >= 0.95 ? 3 : q >= 0.75 ? 2 : 1, at: { x: SQ.x1, y: g + 2, z: SQ.z0 } }), 2600);
    }
    return {
      begin() { side(0); },
      update(dt) {
        A.t += dt;
        const w = A.walker && A.walker.a;
        if (w && (A.phase === 'ready' || A.phase === 'pull' || A.phase === 'slide')) {
          if (A.hold) A.v = lerp(A.v, vmax, 1 - Math.exp(-dt / 0.45));
          else A.v *= Math.exp(-dt / 0.24);
          A.d += A.v * dt;
          const tx = A.ax + A.ux * (1.2 + A.d), tz = A.az + A.uz * (1.2 + A.d);
          if (A.v > 0.15) { w.path = [[tx + A.ux * 0.6, tz + A.uz * 0.6]]; w.pi = 0; w.speed = Math.max(0.6, A.v); }
          else { w.path = null; }
          w.x = tx; w.z = tz; w.yaw = Math.atan2(A.ux, A.uz);
          X.count({ x: tx, y: X.ground(tx, tz) + 4.2, z: tz }, `${Math.round(450 + A.d)} אמה`);
          // released and stopped: a short pull (under 30 amot) is a test — hold again; a real one settles
          if (A.phase === 'slide' && A.v < 0.2) { w.path = null; if (A.d < 30) { A.phase = 'ready'; X.line('עוד — החזיקו שוב והמשיכו עד היתד'); } else { X.count(null); settle(); } }
          // too far: the far worker stops and signals back (spec: מאוחר — הפועל נעצר ומסמן "חזרה")
          if (A.d > 50 * 1.12 && A.phase === 'pull') { A.hold = false; A.phase = 'slide'; A.v = Math.min(A.v, 1); X.word({ x: tx, y: X.ground(tx, tz) + 3, z: tz }, 'עצור!'); }
        }
        if (A.drive) { A.drive.t += dt; A.drive.s.scale.y = Math.min(1, 0.05 + A.drive.t * 6); if (A.drive.t > 0.3) A.drive = null; }
        if (A.phase === 'driven') { A.tStop += dt; if (A.tStop > 1.3) { if (A.side + 1 < H109.ROPE_SIDES) side(A.side + 1); else finish(); } }
        if (A.phase === 'done' && SH.sq) { A.flash += dt; SH.sq.material.opacity = 0.32 + 0.68 * Math.max(0, Math.cos(A.flash * 7)) * Math.max(0, 1 - A.flash / 2.4); }
        ropeDraw();
      },
      down() { if (A.phase === 'ready' || A.phase === 'slide') { A.hold = true; A.phase = 'pull'; X.play('rope'); } },
      move() {},
      up() { if (A.phase === 'pull') { A.hold = false; A.phase = 'slide'; } },
      end() { if (A.walker) { C.remove(A.walker); A.walker = null; } if (A.rope) { A.rope.dispose(); A.rope = null; } if (A.ring) X.props.remove(A.ring); if (A.ghost) X.props.remove(A.ghost); if (SH.sq) SH.sq.material.opacity = 0.32; X.count(null); },
      at() { return { x: SQ.x1, y: X.ground(SQ.x1, SQ.z0) + 2, z: SQ.z0 }; },
      dbg() { return { side: A.side, d: +A.d.toFixed(2), v: +A.v.toFixed(2), phase: A.phase, res: A.res.slice() }; },
    };
  },
};

/* ───────── 3.2 the strike on the beat: the small rocks of the sector, the old game's ring, the compass to the next ───────── */
const ROCKS_ACT = {
  icon: '⛏', title: 'פיצוץ ההר',
  walkLine: (m) => `גזרה ${m.s + 1} מתוך 9: לכו אל הסלעים`,
  stand(m, X) { const L = SH.rocks[m.s] || [], st = X.M.st; const R = L.find((r) => (st.rocks[m.s][r.i] | 0) < 0 && r.q && r.q.vis) || L[0]; return R ? { x: R.sx, z: R.sz, face: [R.x, R.z] } : null; },
  prepare(m, X) {
    // the sector's crews: two at its big rock with picks ON the beat (they teach the beat), two carriers to the cart
    const b = SH.bould[m.s]; if (!b) return; const C = SH.crew;
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
    for (let k = 0; k < 2; k++) { const a = Math.PI + k * 0.9 + m.s, x = b[0] + Math.cos(a) * (b[2] + 2.1), z = b[1] + Math.sin(a) * (b[2] + 2.1); SH.secCrew.push(C.add(x, z, { role: 'pick', item: 'pick', fx: b[0], fz: b[1], off: 0, crew: 0 })); }
    const cx = b[0] + 16, cz = b[1] + 4;
    for (let k = 0; k < 2; k++) SH.secCrew.push(C.add(b[0] + 9, b[1] + k * 3, { role: 'carry', from: [b[0] + 8, b[1] + k * 3], to: [cx, cz + k * 2], item: 'stone', crew: 2 }));
  },
  make(m, X) {
    const lv = X.level(), k = lv >= 3 ? 1 : 2, win = H109.GOLD[lv - 1], replay = (X.M.st.plays[m.id] | 0) > 0;
    const hp0 = H109.HP[lv - 1] + (replay ? 1 : 0);
    const st = X.M.st, L = (SH.rocks[m.s] || []).filter((R) => (st.rocks[m.s][R.i] | 0) < 0);
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
      const ws = X.workShot({ x: R.x, z: R.z }, { x: R.sx, z: R.sz }, { dist: 23, el: 32, side: -1.15, lift: 1.0 });
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
      m2.position.set(x, g + R.r * 0.5, z); m2.lookAt(x + Math.cos(a), g + R.r * 0.5, z + Math.sin(a)); m2.rotateZ(0.25 - j * 0.5);
      m2.renderOrder = 997; X.props.root.add(m2); m2.userData.p = { x, y: g + R.r * 0.5, z }; return m2;
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
      if (ugly) X.word(at, 'נבקע מכוער · כשר');
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
      begin() { rock(0); X.line('הקישו על הסלע בקצב: כשהטבעת נסגרת על הזהב'); },
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
      down(p) { strike(p); },
      move() {}, up() {},
      end() { if (A.ring) X.props.remove(A.ring); if (A.band) X.props.remove(A.band); for (const s of A.seam || []) X.props.remove(s); try { X.hero.arm(null); } catch (e) { /* */ } for (const o of off) o(); },
      at() { const R = A.R || L[L.length - 1]; return R ? { x: R.x, y: X.ground(R.x, R.z) + 2, z: R.z } : null; },
      dbg() { return { i: A.i, n: L.length, phase: A.phase, hp: A.R && A.R.q ? A.R.q.hp : null, hits: A.all.slice(-6), ph: +SH.B.phase(k).toFixed(2) }; },
    };
  },
};

export const ACTS = {
  rope: ROPE_ACT, rocks: ROCKS_ACT, read: READ, pave: PAVE, waste: WASTE, corner: CORNER, course: COURSE, great: GREAT, letters: LETTERS,
  __init: initWorld,
  __sh: () => SH,   // (tests: the world the acts share)
  __frame(dt, X) {
    if (!SH.B) return;
    // the ground moves under the small rocks as the Mount comes down and the fill rises: they sit on it as it is now
    SH.regT = (SH.regT || 0) + dt;
    if (SH.regT > 1.2 && SH.rocks) { SH.regT = 0; for (const L of SH.rocks) for (const R of L || []) if (R.q) { const g = X.ground(R.x, R.z); if (Math.abs(g - R.q.y) > 0.05) { R.q.y = g; X.props.rockSet(R.q); } } }
    SH.B.step(dt); if (SH.crew) SH.crew.update(dt, SH.B); frame2(dt, X, SH); frame3(dt, X, SH); },
};
export { SQ, ROPE, sectorRocks, rockTarget };
void onPlane; void ease;
