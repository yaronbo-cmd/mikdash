// build 124 B — the one address book (rule 65): BOOK.s02 … BOOK.s05 in src/game/world/grid.js. Every entry is finite, named by its
// own cell, inside its stage's bounds, and alone on its spot for its kind; stage 05 reads its places from the book (the same numbers
// in h120/layout.js, routes.js and model.js), and every act's stand there is the book's. Build 126: stages 02 … 04 read their places
// from the book too — their tables are the book's own objects (the same reference), and their stands come out where the book says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, cellOf, nameOf } from '../src/game/world/grid.js';

const SEC = ['s02', 's03', 's04', 's05', 's06'];   // ── h128 ── (+ s06) ── /h128 ──
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;

test('book: every entry finite, its cell its own, inside its stage, frozen', () => {
  for (const k of SEC) {
    const S = BOOK[k], B = S.bounds;
    assert.ok(Object.isFrozen(S) && Object.isFrozen(S.entries), k);
    assert.ok(S.entries.length > 0, k);
    const ids = new Set();
    for (const e of S.entries) {
      assert.ok(Number.isFinite(e.x) && Number.isFinite(e.z) && (e.y == null || Number.isFinite(e.y)), `${k} ${e.id}`);
      const { k: ck, r } = cellOf(e.x, e.z);
      assert.equal(e.cell, nameOf(ck, r), `${k} ${e.id}`);
      assert.ok(e.x >= B.x0 && e.x <= B.x1 && e.z >= B.z0 && e.z <= B.z1, `${k} ${e.id} out of bounds`);
      assert.ok(typeof e.label === 'string' && /[֐-׿]/.test(e.label), `${k} ${e.id} label`);
      assert.ok(typeof e.src === 'string' && e.src.length > 0, `${k} ${e.id} src`);
      assert.ok(typeof e.kind === 'string' && e.kind, `${k} ${e.id} kind`);
      assert.ok(!ids.has(e.id), `${k} duplicate id ${e.id}`); ids.add(e.id);
      assert.ok(Object.isFrozen(e), `${k} ${e.id} frozen`);
    }
  }
});

test('book: no two entries of one kind on the same spot', () => {
  for (const k of SEC) {
    const seen = new Map();
    for (const e of BOOK[k].entries) {
      const key = `${e.kind}|${e.x.toFixed(3)}|${e.z.toFixed(3)}`;
      assert.ok(!seen.has(key), `${k}: ${e.id} on ${seen.get(key)}'s spot`); seen.set(key, e.id);
    }
  }
});

test('book: the same on every load (pure)', async () => {
  const again = await import('../src/game/world/grid.js?again');
  assert.deepEqual(JSON.parse(JSON.stringify(again.BOOK.s05)), JSON.parse(JSON.stringify(BOOK.s05)));
});

test('book s05: stage 05 reads its places from the book', async () => {
  const L = await import('../src/game/h120/layout.js');
  const R = await import('../src/game/h120/routes.js');
  const M = await import('../src/game/h120/model.js');
  const S = BOOK.s05;
  for (const [id, [x, z, side, axis]] of Object.entries(S.cols)) assert.deepEqual({ ...L.COLS[id] }, { id, x, z, side, axis });
  assert.deepEqual(L.COL_IDS, Object.keys(S.cols));
  assert.equal(L.BEAMS.length, S.beams.length);
  S.beams.forEach(([id, a, b, pa, pb], i) => { const B = L.BEAMS[i]; assert.deepEqual([B.id, B.a, B.b, [...B.pa], [...B.pb]], [id, a, b, [...pa], [...pb]]); });
  assert.deepEqual(L.RUNS.map((r) => ({ ...r })), S.runs.map((r) => ({ ...r })));
  assert.deepEqual(L.LADDERS, S.ladders.map((l) => [...l]));
  const lep = S.chambers.find((c) => c.id === 'lepers');
  for (const k of ['x0', 'x1', 'z0', 'z1', 'doorZ']) assert.equal(L.CHAMBER[k], lep[k]);
  assert.deepEqual([...L.CHAMBER.door], [...lep.door]);
  for (const k of ['x0', 'x1', 'z0', 'z1', 'stair']) assert.equal(L.MIK[k], S.mik[k]);
  assert.equal(L.MIK.rod, S.mik.rod); assert.equal(L.MIK.inlet, S.mik.inlet); assert.equal(L.MIK.outlet, S.mik.outlet);
  assert.equal(L.MIK.pit, S.mik.pit); assert.equal(L.MIK.hollows, S.mik.hollows);
  assert.equal(R.YARD, S.yard); assert.equal(R.LIME, S.lime); assert.equal(M.VESSELS, S.vessels);
  // (the court and its chambers: Middot 2:5 — 135 × 135, a chamber of 40 in each corner)
  assert.equal(S.court.x1 - S.court.x0, 135); assert.equal(S.court.z1 - S.court.z0, 135);
  // the book's entries name the tables' own numbers
  const by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  for (const [id, [x, z]] of Object.entries(S.cols)) assert.deepEqual([by['col:' + id].x, by['col:' + id].z], [x, z]);
  for (const [lv, [x, z]] of Object.entries(S.mik.hollows)) assert.deepEqual([by['mik:hollow' + lv].x, by['mik:hollow' + lv].z], [x, z]);
});

test('book s05: every act\'s stand is the book\'s (the acts\' own stand())', async () => {
  const { ACTS } = await import('../src/game/h120/acts.js');
  const { PLAN } = await import('../src/game/h120/model.js');
  const S = BOOK.s05, stands = S.entries.filter((e) => e.kind === 'stand');
  for (const m of PLAN) {
    const a = ACTS[m.k]; assert.ok(a && a.stand, m.id);
    const s = a.stand(m), b = S.stands[m.id];
    assert.ok(b, `book has ${m.id}`);
    assert.ok(near(s.x, b[0]) && near(s.z, b[1]) && near(s.face[0], b[2]) && near(s.face[1], b[3]), `${m.id}: ${JSON.stringify(s)} vs ${b}`);
    assert.ok(stands.some((e) => e.acts.includes(m.id) && e.x === b[0] && e.z === b[1]), `${m.id} entry`);
  }
});

test('book s05 (build 127): the routes, the rig, the floor, the ways, the cameras are the book\'s own tables', async () => {
  const R = await import('../src/game/h120/routes.js');
  const M = await import('../src/game/h120/model.js');
  const { makePack05 } = await import('../src/game/h120/pack.js');
  const S = BOOK.s05, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  assert.equal(R.SCAFF, S.scaff); assert.equal(R.PILES, S.piles); assert.equal(R.LANE, S.lane); assert.equal(R.WALLS, S.walls);
  assert.equal(R.LANE_CROSS.at, S.laneCross);
  for (const lv of [1, 2, 3]) {
    const P = R.CARRY_PLACES[lv], B = S.carry[lv];
    assert.equal(P.mark.c, B.mark); assert.equal(P.jars, B.jars); assert.equal(P.worker, B.worker);
    for (const c of P.checks) assert.equal(c.rect, B.checks[c.id], `lv ${lv} check ${c.id}`);
    if (P.movers) assert.equal(P.movers, B.movers);
    for (const L of [10, 11.5]) {
      const W = R.carryWay(lv, L);
      assert.equal(W.length, S.way[lv].length);
      S.way[lv].forEach(([e, x, z, kx = 0, kz = 0], i) => assert.deepEqual(W[i], [e, x + kx * L, z + kz * L], `way ${lv}.${i}`));
    }
    assert.equal(R.carryStart(lv, 11).f[1], S.startZ);
    assert.ok(by['carry:mark' + lv] && by['carry:worker' + lv], 'carry entries ' + lv);
  }
  assert.equal(makePack05().film, S.cam.film);
  // the floor's rises are the book's (a rise's crest is where floorH has its own bump)
  assert.ok(S.floor.rises.length === 9 && S.floor.rises.every((r) => r.length === 4));
  assert.ok(Math.abs(M.floorH(13, -47.4) - M.floorH(13, -48.6)) > 0, 'floor');
  for (const k of ['in1', 'in2', 'in3']) { const ch = M.refChannel(+k.slice(2), 'in'); assert.ok(ch && ch.pts.length > 1, k); }
  for (const k of ['rig', 'floor', 'mikWays', 'scaff', 'piles', 'lane', 'walls', 'carry', 'way', 'cam', 'laneCrew']) assert.ok(Object.isFrozen(S[k]), k);
  for (const lv of [1, 2, 3]) assert.ok(by['rig:post' + lv], 'rig entry ' + lv);
});

test('book s01 (build 127): stage 01 reads its places from the book — the square, the corner stone, the courses, the trumpeting corner, the cameras', async () => {
  const A1 = await import('../src/game/h109/acts.js');
  const A3 = await import('../src/game/h109/acts3.js');
  const { PLACES } = await import('../src/game/h109/model.js');
  const S = BOOK.s01, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  assert.equal(S.stage, 1); assert.ok(Object.isFrozen(S) && Object.isFrozen(S.entries));
  // the square is mount.js SQUARE, made from the grid (500 × 500 from the east wall and the north edge); the rope act's line is it, 6 in
  assert.deepEqual({ ...S.square }, { x0: -223, x1: 277, z0: -183.5, z1: 316.5 });
  assert.deepEqual({ ...A1.SQ }, { x0: S.square.x0 + 6, x1: S.square.x1 - 6, z0: S.square.z0 + 6, z1: S.square.z1 - 6 });
  // the acts' own objects are the book's
  assert.equal(A3.CORNER_AT, S.corner.stone); assert.equal(A3.CRANE_AT, S.corner.crane); assert.equal(A3.LET, S.letters.face);
  const cs = A3.CORNER.stand({ k: 'corner' }, null); assert.deepEqual([cs.x, cs.z], [S.corner.kohen.x, S.corner.kohen.z]);
  for (let c = 0; c < S.courses.n; c++) { const s = A3.COURSE.stand({ k: 'course', c }, null); assert.equal(s.face[0], S.courses.wallX); assert.equal(s.face[1], by['course' + c].z, 'course ' + c); }
  const ls = A3.LETTERS.stand({ k: 'letters' }, null); assert.deepEqual([ls.x, ls.z, ...ls.face], [BOOK.letters.x, BOOK.letters.z, S.letters.face.x, S.letters.face.z]);
  assert.deepEqual(PLACES.letters.face, [S.letters.face.x, S.letters.face.z]);
  // stage 01's old keys stay as they were (other code reads them)
  for (const k of ['sectors', 'kohen', 'pile', 'pits', 'yard', 'corner', 'courses', 'letters', 'great']) assert.ok(BOOK[k], k);
  for (const k of ['corner', 'courses', 'letters', 'cam', 'platform']) assert.ok(Object.isFrozen(S[k]), k);
  // every entry inside the Mount's platform, named by its own cell, one per spot and kind
  const seen = new Set();
  for (const e of S.entries) {
    const B = S.bounds, { k, r } = cellOf(e.x, e.z);
    assert.ok(e.x >= B.x0 && e.x <= B.x1 && e.z >= B.z0 && e.z <= B.z1, e.id); assert.equal(e.cell, nameOf(k, r), e.id);
    assert.ok(/[֐-׿]/.test(e.label) && e.src, e.id);
    const key = `${e.kind}|${e.x}|${e.z}`; assert.ok(!seen.has(key), e.id); seen.add(key);
  }
});

test('book s02: the wall stage — sides, stretches and their stands, stakes, gates', async () => {
  await import('../src/game/h111/acts.js');
  const { SIDE, STRETCH, sidePoint, H111 } = await import('../src/game/h111/model.js');
  const { AZ, STAKES } = await import('../src/game/h111/stakes.js');
  const { BOND } = await import('../src/game/h111/bond.js');
  const S = BOOK.s02, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  assert.deepEqual(JSON.parse(JSON.stringify(S.side)), JSON.parse(JSON.stringify(SIDE)));
  assert.equal(STRETCH.length, S.stretch.length);
  S.stretch.forEach(([n, k, at, G], i) => {
    const T = STRETCH[i]; assert.deepEqual([T.s, T.k, T.at, T.G], [n, k, at, G]);
    const e = by['stretch' + n];
    if (typeof sidePoint === 'function') { const P = sidePoint(k, at); const px = P.x ?? P[0], pz = P.z ?? P[1]; assert.ok(near(e.x, px) && near(e.z, pz), `stretch${n}`); }
    const s = BOND.stand({ s: n, ...T }), b = by['stand:stretch' + n];
    assert.ok(near(s.x, b.x, 1e-4) && near(s.z, b.z, 1e-4), `stand stretch${n}: ${s.x},${s.z} vs ${b.x},${b.z}`);
  });
  for (const k of ['A', 'B', 'C', 'D']) { assert.deepEqual([...S.stakes[k]], [...AZ[k]]); assert.deepEqual([by['stake' + k].x, by['stake' + k].z], [...AZ[k]]); }
  const st = STAKES.stand({}); assert.deepEqual([by['stand:stakes'].x, by['stand:stakes'].z], [st.x, st.z]);
  const G = (H111 && H111.GATES) || [];
  assert.equal(G.length, S.gates.length);
  S.gates.forEach(([k, x, n], i) => { assert.deepEqual([G[i].k, G[i].x, G[i].n], [k, x, n]); assert.equal(by['gate' + i].x, x); });
  // (build 126) read from the book, not equal to it: the same objects
  const { GIANT } = await import('../src/game/h111/model.js');
  assert.equal(SIDE, S.side, 'SIDE is the book\'s');
  for (const k of ['A', 'B', 'C', 'D']) assert.equal(AZ[k], S.stakes[k], 'stake ' + k + ' is the book\'s');
  for (const [s, [k, at]] of Object.entries(S.giant)) { assert.equal(GIANT[s].k, k); assert.equal(GIANT[s].at, at); assert.ok(by['giant' + s], 'giant entry ' + s); }
  for (const k of ['gatesAct', 'band', 'closing', 'cam']) assert.ok(Object.isFrozen(S[k]), k);
});

test('book s03: the soreg stage — posts, sightings, the posts act\'s stands, the steps', async () => {
  await import('../src/game/h112/acts.js');
  const { RUNS, STEPS } = await import('../src/game/h112/model.js');
  const { POSTS } = await import('../src/game/h112/acts.js');
  const S = BOOK.s03, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  for (const [lv, R] of Object.entries(S.runs)) {
    const M = RUNS[lv]; assert.equal(M.posts.length, R.posts.length, 'run ' + lv);
    R.posts.forEach(([x, z, line, k], i) => { const P = M.posts[i]; assert.deepEqual([P.x, P.z, P.line, !!P.k], [x, z, line, !!k], `post ${lv}.${i}`); });
    const sg = M.sight[0]; assert.deepEqual([...sg.eye], [...R.eye]); assert.deepEqual([...sg.dir], [...R.dir]); assert.equal(sg.near, R.near);
    const s = POSTS.stand({ lv: +lv }), b = by['stand:posts' + lv];
    assert.ok(near(s.x, b.x) && near(s.z, b.z), `posts stand ${lv}`);
  }
  for (const k of ['x0', 'z0', 'z1']) assert.equal(S.steps[k], STEPS[k]);
  // (build 126) read from the book: the same objects
  for (const lv of Object.keys(S.runs)) { assert.equal(RUNS[lv].sight[0].eye, S.runs[lv].eye, 'eye ' + lv); assert.equal(RUNS[lv].hole, S.holes[lv], 'holes ' + lv); }
  assert.equal(RUNS[3].sight[1].eye, S.eye2[3]); assert.equal(STEPS.hole, S.stepsHole);
});

test('book s04: the gates stage — the six gates, Nikanor, the carpenters\' yard', async () => {
  const { GATES, SOUTH, YARD } = await import('../src/game/h113/model.js');
  await import('../src/game/h111/acts.js');
  const { H111 } = await import('../src/game/h111/model.js');
  const S = BOOK.s04, all = [...Object.values(GATES), ...SOUTH];
  assert.equal(all.length, S.gates.length);
  S.gates.forEach(([key, name, c, zf], i) => { const g = all[i]; assert.deepEqual([g.key, g.name, g.c, g.zf], [key, name, c, zf]); });
  const nik = H111.GATES.find((g) => g.k === 'E'); assert.equal(S.nikanor[0], nik.x); assert.equal(S.nikanor[1], 0);
  for (const k of ['x0', 'x1', 'z']) assert.equal(S.yard[k], YARD[k]);
  // (build 126) read from the book: the same objects and numbers
  assert.equal(YARD.rack, S.yardMore.rack); assert.equal(YARD.post, S.yardMore.post); assert.equal(YARD.wall, S.yardMore.wall);
  for (const k of ['houses', 'cam', 'yardMore']) assert.ok(Object.isFrozen(S[k]), k);
});

// ── h128 ── (build 128) stage 06's section: the rows of the brief's §1 as the world draws them, the rings, the sea sheet
test('book s06: the gate, the ramp, the steps, the wickets as the world draws them; the sea sheet', async () => {
  const { ringOf, seaName, parse } = await import('../src/game/world/grid.js');
  const S = BOOK.s06, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  assert.equal(S.stage, 6); assert.ok(Object.isFrozen(S.sea) && Object.isFrozen(S.sea.deck) && Object.isFrozen(S.ramp));
  // the leaves hang on the gate house's east face (temple.js: gate('E', -4, -14, 10, 14, …): the door at x1 = 10); the stage 04 gate
  assert.equal(S.ramp.sill[0], 10); assert.equal(S.ramp.sill[2], 13.5); assert.equal(BOOK.s04.nikanor[0], 3);
  // the ramp: 43 along, 7.5 up (the spec), notches 7 apart, every notch and rough timber between its two ends
  assert.equal(S.ramp.low[0] - S.ramp.sill[0], 43); assert.equal(S.ramp.sill[2] - S.ramp.low[2], 7.5);
  S.ramp.notch.forEach((x, i) => { assert.ok(x < S.ramp.low[0] && x > S.ramp.sill[0], 'notch ' + i); if (i) assert.equal(S.ramp.notch[i - 1] - x, 7); });
  for (const [a, b] of S.ramp.rough) assert.ok(a >= S.ramp.sill[0] && b <= S.ramp.low[0]);
  assert.equal(S.ramp.foot[0] - S.ramp.low[0], 2); assert.equal(S.ramp.sledge.tail - S.ramp.sledge.head, S.ramp.sledge.L);
  // (the climb ends with the tail at the last notch: the head then on the Azarah's flat floor, −8 < x < 0)
  const head = S.ramp.notch[5] - S.ramp.sledge.L; assert.ok(head > -8 && head < 0 && head > S.capstan[0] + 2);
  // the rings: ring i's outer radius, top and base (temple.js: the j-th half cylinder radius 6.5 + 0.5 j, top 13.5 − 0.5 j: ring 15 − j)
  for (let i = 1; i <= 15; i++) { const r = ringOf(i), j = 15 - i; assert.equal(r.R, 6.5 + 0.5 * j); assert.equal(r.top, 13.5 - 0.5 * j); assert.equal(r.base, r.top - 0.5); }
  for (const i of [1, 8, 15]) { const r = ringOf(i), g = S.steps.gap[i]; assert.deepEqual([...g], [S.steps.c[0] + r.mid, 0, r.base], 'gap ' + i); assert.ok(by['steps:gap' + i] && by['stand:ring' + i]); }
  // stands on the floor the world walks (stages.js groundAt: the rings; the Azarah flat at 13.5 for −8 < x < 0; x ≤ −11 at 16)
  const ringY = (x, z) => { const r = Math.hypot(x - 10, z); return r > 13.5 ? 6 : 13.5 - 0.5 * (r <= 6.5 ? 0 : Math.ceil((r - 6.5) / 0.5 - 1e-9)); };
  for (const i of [1, 8, 15]) { const [x, z, y] = S.steps.stand[i]; assert.equal(ringY(x, z), y, 'stand ' + i); }
  for (const p of [S.wicket.standN, S.wicket.standS, S.wicket.standBoth, S.close.stand]) assert.ok(p[0] > -8 && p[0] < 0 && p[2] === 13.5);
  assert.ok(S.capstan[0] <= -11 && S.capstan[2] === 16);
  // the wickets in the gate house's west face (x −4), inside its solid sides (z 5 … 14), one each side of the 10-wide opening
  for (const p of [S.wicket.N, S.wicket.S]) { assert.equal(p[0], -4); assert.ok(Math.abs(p[2] - 13.5) < 1e-9 && Math.abs(p[1]) - S.wicket.w / 2 >= 5 && Math.abs(p[1]) + S.wicket.w / 2 <= 14); }
  // the east gate's waiting place on the court's floor, west of the east gate house (x 138 … 150), between the gallery's east runs
  assert.ok(S.eastGate[0] < 138 && S.eastGate[0] > BOOK.s05.court.x0 && Math.abs(S.eastGate[1]) < 13);
  // the sea sheet: three places, named ים־<column>־<row>, Akko east and north of Alexandria
  assert.deepEqual(S.sea.entries.map((e) => e.id), ['alexandria', 'storm', 'akko']);
  assert.deepEqual(S.sea.entries.map((e) => e.cell), ['ים־יט־13', 'ים־ד־10', 'ים־ג־6']);
  for (const e of S.sea.entries) { assert.equal(e.cell, seaName(e.k, e.r)); assert.ok(e.k >= 0 && e.k < 20 && e.r >= 0 && e.r < 20); assert.ok(/[֐-׿]/.test(e.label) && e.src); }
  void parse;
  // the deck: two doors 5 × 20 side by side about the mast line, every ring, cleat and tail inside the hull's beam
  const D = S.sea.deck, H = S.sea.hull;
  assert.equal(D.doors.L, 20); assert.equal(D.doors.W, 5); assert.equal(D.doors.T, 0.35);
  assert.ok(D.doors.port[1] + D.doors.W / 2 < 0 && D.doors.stbd[1] - D.doors.W / 2 > 0);
  assert.equal(H.stem - H.stern, 60); assert.equal(H.beam, 16);
  for (const k of ['portFore', 'portAft', 'stbdFore', 'stbdAft']) for (const T of [D.rings, D.cleats, D.tails]) assert.ok(Math.abs(T[k][1]) < H.beam / 2 && T[k][0] > H.stern && T[k][0] < H.stem, k);
  assert.equal(D.sailors.length, 6);
});
// ── /h128 ──
