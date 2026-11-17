// build 124 B — the one address book (rule 65): BOOK.s02 … BOOK.s05 in src/game/world/grid.js. Every entry is finite, named by its
// own cell, inside its stage's bounds, and alone on its spot for its kind; stage 05's House model reads its places from the book (the
// same numbers in world/layout05.js; build 130's new stage below). Build 126: stages 02 … 04 read their places
// from the book too — their tables are the book's own objects (the same reference), and their stands come out where the book says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, cellOf, nameOf } from '../src/game/world/grid.js';

const SEC = ['s02', 's03', 's04', 's05', 's06', 's07'];   // ── h128 ── (+ s06) ── /h128 ──   // ── h129 ── (+ s07) ── /h129 ──
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

test('book s05: the House\'s model reads the gallery and the basin from the book (world/layout05.js); the raising keeps its stand and rig', async () => {
  const L = await import('../src/game/world/layout05.js');
  const S = BOOK.s05;
  for (const [id, [x, z, side, axis]] of Object.entries(S.cols)) assert.deepEqual({ ...L.COLS[id] }, { id, x, z, side, axis });
  assert.deepEqual(L.COL_IDS, Object.keys(S.cols));
  assert.equal(L.BEAMS.length, S.beams.length);
  S.beams.forEach(([id, a, b, pa, pb], i) => { const B = L.BEAMS[i]; assert.deepEqual([B.id, B.a, B.b, [...B.pa], [...B.pb]], [id, a, b, [...pa], [...pb]]); });
  assert.deepEqual(L.RUNS.map((r) => ({ ...r })), S.runs.map((r) => ({ ...r })));
  assert.deepEqual(L.LADDERS, S.ladders.map((l) => [...l]));
  const lep = S.chambers.find((c) => c.id === 'lepers');
  for (const k of ['x0', 'x1', 'z0', 'z1', 'doorZ']) assert.equal(L.CHAMBER[k], lep[k]);
  for (const k of ['x0', 'x1', 'z0', 'z1', 'stair']) assert.equal(L.MIK[k], S.mik[k]);
  assert.equal(L.MIK.rod, S.mik.rod); assert.equal(L.MIK.inlet, S.mik.inlet); assert.equal(L.MIK.outlet, S.mik.outlet);
  // (the court and its chambers: Middot 2:5 — 135 × 135, a chamber of 40 in each corner)
  assert.equal(S.court.x1 - S.court.x0, 135); assert.equal(S.court.z1 - S.court.z0, 135);
  const by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
  for (const [id, [x, z]] of Object.entries(S.cols)) assert.deepEqual([by['col:' + id].x, by['col:' + id].z], [x, z]);
  // the raising (build 120's level 3, h130/raise.js): its stand and rig, and their entries
  assert.deepEqual(Object.keys(S.stands), ['col3']); assert.deepEqual(Object.keys(S.rig), ['3']);
  assert.ok(by['stand:col3'] && by['rig:post3'] && by['rig:block3'] && by.broke);
});

test('book s05 (build 130 part 3): the old stage\'s rows are out of the book, with their entries', () => {
  const S = BOOK.s05;
  for (const k of ['yard', 'carry', 'way', 'startZ', 'lime', 'vessels', 'mikWays', 'floor', 'scaff', 'piles', 'lane', 'laneCross', 'laneCrew']) assert.equal(S[k], undefined, k);
  for (const k of ['pit', 'hollows']) assert.equal(S.mik[k], undefined, 'mik.' + k);
  for (const k of ['film', 'again', 'intro']) assert.equal(S.cam[k], undefined, 'cam.' + k);
  for (const e of S.entries) assert.ok(!/^(yard:|carry:|lime$|vessel:|mik:(pit|hollow)|lane:|scaff\d|pile\d|stand:(col[12]|saw|carry|mikveh|planks)|rig:(post|block)[12]$)/.test(e.id), e.id);
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
  // the rudder (build 128 sea look 2): two posts on the quarters, one each side, aft of the doors; the cross tiller between them,
  // inside the beam; the helmsman aft of it, inside the hull, to starboard of the middle line (Nicanor stays in sight)
  assert.equal(D.steer.length, 2); assert.ok(D.steer[0][1] < 0 && D.steer[1][1] > 0 && D.steer[0][0] === D.steer[1][0]);
  assert.ok(D.steer[0][0] > H.stern && D.steer[0][0] < D.doors.port[0] - D.doors.L / 2 && Math.abs(D.steer[0][1]) < H.beam / 2);
  assert.ok(D.tiller[0] > D.steer[0][0] && D.tiller[1] < 0 && D.tiller[2] > 0 && D.tiller[2] < Math.abs(D.steer[1][1]));
  assert.ok(D.helm[0] < D.tiller[0] && D.helm[0] > D.steer[0][0] && D.helm[1] > 0.5 && D.helm[1] < D.tiller[2]);
  assert.ok(D.helm[0] < D.nicanor[0]);
  const LT = S.sea.light; assert.ok(LT.r > 0 && LT.hole > 0 && LT.hole < 0.5 && Math.hypot(...LT.from) > 100);
});
// ── /h128 ──

// ── h129 ── (build 129) stage 07's section: the rows of the brief's §1 as the world draws them
test('book s07: the Gazit, the Golah, the arches, Beit HaMoked as the world draws them; the gates read from s04', async () => {
  const PL = await import('../src/places.js');
  const S = BOOK.s07, by = Object.fromEntries(S.entries.map((e) => [e.id, e])), G = S.gazit, W = S.golah, V = S.vault, N = S.night;
  assert.equal(S.stage, 7); assert.ok(Object.isFrozen(S.golah) && Object.isFrozen(S.cam) && Object.isFrozen(S.night.ledges));
  // the Gazit: places.js GAZIT (= temple.js's box), its room inside 1-amah walls, the holy line on the south wall's mid-line
  assert.deepEqual([...G.block], [PL.GAZIT.x0, PL.GAZIT.z0, PL.GAZIT.x1, PL.GAZIT.z1]);
  assert.deepEqual([...G.in], [G.block[0] + 1, G.block[1] + 1, G.block[2] - 1, G.block[3] - 1]);
  assert.equal(G.holy, (67.5 + 73.5) / 2); assert.equal(G.chol[0], G.holy); assert.equal(G.chol[1], G.in[3]); assert.equal(G.chol[1] - G.chol[0], 10.5);
  // the opening row: seven stones 4 long edge to edge, inside the room, wholly in the chol half
  assert.equal(G.row0.xs.length, 7); G.row0.xs.forEach((x, i) => { if (i) assert.equal(x - G.row0.xs[i - 1], G.row0.L); });
  assert.equal(G.row0.xs[0] - G.row0.L / 2, -94.5); assert.equal(G.row0.xs[6] + G.row0.L / 2, -66.5);
  assert.ok(G.row0.z - G.row0.D / 2 > G.holy && G.row0.z + G.row0.D / 2 < G.in[3]);
  assert.ok(G.wait[1] < G.holy && G.wait[1] > G.in[1]); assert.ok(G.door[0] === G.in[2] && G.door[1] > G.holy && G.door[1] < G.in[3]);
  // the Golah: between the Delek and Bechorot gate houses (temple.js gate('S', −169 … −151) and (−127 … −109)), across the south wall
  assert.ok(W.room[0] > -151 && W.room[2] < -127); assert.ok(W.room[1] < 67.5 && W.room[3] > 73.5);
  assert.ok(W.room[0] - -151 >= 3 && -127 - W.room[2] >= 3, 'clear of both gate houses');
  // the well inside the room, its shaft clear of the room's walls; the head trough between the well's rim and the north wall
  assert.ok(W.well[0] - W.shaftR - W.rimT > W.room[0] + W.wallT && W.well[0] + W.shaftR + W.rimT < W.room[2] - W.wallT);
  assert.ok(W.well[1] - W.shaftR - W.rimT > W.head[1] + W.headSize[1] / 2 && W.head[1] - W.headSize[1] / 2 > W.room[1] + W.wallT);
  // the wheel's two rope lines over the shaft; the posts outside the rim
  assert.ok(W.wheel.R + 0.5 < W.shaftR && W.wheel.post > W.shaftR + W.rimT);
  // the channel: from the head out through the door to z 52, then east; a spur and a sluice at each trough's x; the troughs on the
  // Azarah's floor, clear of the House (south wall z 35.9) and of the court's south wall (67.5)
  assert.deepEqual([...W.channel.main[0]], [...W.head]); assert.equal(W.channel.main[0][0], W.door[0]);
  for (const k of ['A', 'B', 'C']) {
    const t = W.troughs[k], s = W.sluice[k]; assert.equal(t[0], s[0]); assert.equal(s[1], W.channel.main[1][1]);
    assert.ok(W.channel.spurs.some(([x, a, b]) => x === t[0] && a === s[1] && b === t[1]), k);
    assert.ok(t[1] - W.troughSize[1] / 2 > 35.9 + 10 && t[1] + W.troughSize[1] / 2 < 67.5 && t[0] < -91.2 && t[0] > -176.9, k);
    assert.ok(by['golah:trough' + k] && by['golah:sluice' + k]);
  }
  assert.ok(W.door[0] - W.doorW / 2 > W.room[0] + W.wallT && W.door[0] + W.doorW / 2 < W.room[2] - W.wallT && W.door[1] === W.room[1] + W.wallT / 2);
  assert.ok(W.stand[1] > W.well[1] + W.shaftR + W.rimT && W.stand[1] < W.room[3] - W.wallT && W.stand[2] === S.floors.azara);
  assert.deepEqual([...W.depth], [10, 20, 30]);
  // the instruments chambers: temple.js wall(0, −26, 8, −14 …) and wall(0, 14, 8, 26 …); the arch in the east face (x 8), clear of the
  // fifteen steps (|z| ≤ 13.5); a half circle from the springing to the crown's underside; stands inside on the women's court's floor
  for (const k of ['N', 'S']) {
    const A = V[k], w = A.z[1] - A.z[0];
    assert.equal(A.at[0], A.block[2]); assert.equal(A.at[1], (A.z[0] + A.z[1]) / 2); assert.ok(A.z[0] > A.block[1] && A.z[1] < A.block[3]);
    assert.ok(Math.min(Math.abs(A.z[0]), Math.abs(A.z[1])) > 13.5); assert.equal(A.crown - A.spring, w / 2); assert.equal(w, 6);
    assert.ok(A.crown < A.top && A.top === S.floors.israel && A.floor === S.floors.nashim);
    const st = V['stand' + k]; assert.ok(st[0] > A.block[0] && st[0] < A.block[2] && st[1] === A.at[1] && st[2] === A.floor);
  }
  assert.deepEqual([...V.N.block], [0, -26, 8, -14]); assert.deepEqual([...V.S.block], [0, 14, 8, 26]);
  assert.equal(V.N.stones, 7); assert.equal(V.S.stones, 9); assert.equal(V.S.rock, V.S.z[1]);
  // Beit HaMoked: places.js BEIT_HAMOKED; the hall inside 1-amah walls; the half cylinder (temple.js: radius 12.5, centre y 30.2, z −70.5,
  // 36 long over x −178 … −142); twelve rings 3 deep fill it from the east end; ring 1 is x −145 … −142, inside the hall's span
  const BM = PL.BEIT_HAMOKED;
  assert.deepEqual([...V.M.hall], [BM.x0 + 1, BM.z0 + 1, BM.x1 - 1, BM.z1 - 1]);
  assert.equal(V.M.axisZ, (BM.z0 + BM.z1) / 2); assert.equal(V.M.R * 2, BM.z1 - BM.z0); assert.equal(V.M.spring, 30.2);
  assert.equal(V.M.east, BM.x1); assert.equal(V.M.rings * V.M.ringD, BM.x1 - BM.x0); assert.equal(by['vault:ring1'].x, V.M.east - V.M.ringD / 2);
  assert.ok(V.deck.stand[0] < V.M.east - V.M.ringD && V.deck.stand[0] > V.M.hall[0] && V.deck.stand[1] === V.M.axisZ && V.deck.y < V.M.spring);
  // the night: the hearth, the slab and its ring (temple.js), the two doors (GATES.moked; the north door at z −83), the six ledges
  assert.deepEqual([N.hearth[0], N.hearth[1]], [-160, -70.5]); assert.deepEqual([N.slab[0], N.slab[1]], [-160, -76]); assert.equal(N.slabSize, 1);
  assert.deepEqual([...N.door.azara], [PL.GATES.moked.x, PL.GATES.moked.z]); assert.equal(N.door.chel[1], BM.z0);
  assert.ok(N.slab[1] < N.hearth[1] && N.slab[1] > N.door.chel[1], 'the slab toward the Chel door');
  assert.equal(N.ledges.length, 6);
  for (const [a, b, c, d] of N.ledges) assert.ok(a >= V.M.hall[0] && c <= V.M.hall[2] && b >= V.M.hall[1] && d <= V.M.hall[3]);
  // the Levite outside: on the Chel's terrace (its flat top ends at z −83.5), north of the hall's north wall (z −83)
  assert.ok(N.levi[1] < BM.z0 && N.levi[1] >= -83.5 && N.levi[2] === 6 && N.levi[0] === N.door.chel[0]);
  // the gates that lock: stage 04's own entries of kind gate (six gates and Nicanor), by id
  assert.deepEqual([...N.gates], BOOK.s04.entries.filter((e) => e.kind === 'gate').map((e) => e.id)); assert.equal(N.gates.length, 7);
  // the cameras: the look sample's keyframes in time order, inside the stage's bounds
  let t0 = -1; for (const [e, a, t] of S.cam.look) { assert.ok(t > t0); t0 = t; for (const p of [e, a]) assert.ok(p[0] >= S.bounds.x0 && p[0] <= S.bounds.x1 && p[2] >= S.bounds.z0 && p[2] <= S.bounds.z1); }
});
// ── /h129 ──

// ── h130 ── (build 130) the new stage 05's rows (build130-brief §1) as the built world has them
test('book s05 (build 130): the new stage\'s rows — the runs, the passage, the stands, the torch, the sleds, the seats, wood, light, the site off the wood chamber', () => {
  const S = BOOK.s05, G = S.gal, by = Object.fromEntries(S.entries.map((e) => [e.id, e])), C = S.court;
  // the runs are the built ones (the old runs' lines and ends), the passage is the gate house's cut
  for (const side of ['N', 'S']) { const R = G.runs[side], O = S.runs.find((r) => r.side === side); assert.equal(R.line, O.line); assert.equal(R.a0, O.a0); assert.equal(R.a1, O.a1); assert.equal(R.wall, O.wall); }
  assert.deepEqual([G.runs.E.line, G.runs.E.a0, G.runs.E.a1], [136, -27.5, 27.5]); assert.deepEqual([...G.runs.E.cut], [G.passage.z0, G.passage.z1]);
  assert.ok(S.walls.some((w) => w[0] === G.passage.x0 && w[1] === G.passage.z0 && w[3] === G.passage.z1), 'the passage is the east gate house\'s');
  // the spec's new places, exactly
  assert.deepEqual(G.stand, { N: [73.5, -52], S: [73.5, 52], E: [126, 0] });
  assert.deepEqual(G.torch, [[73.5, 0], [40, 0], [107, 0]]);
  assert.deepEqual(S.wood, { trestles: [121, -46], stand: [118, -43], second: [124, -50], clean: [128, -44], out: [112, -58] });
  assert.deepEqual(S.light.menorah, [73.5, 24]); assert.equal(S.light.h, 50);
  assert.deepEqual(S.light.measures, [26, 31.5]); assert.deepEqual(S.light.wicks, [30, 24]); assert.deepEqual(S.light.practice.ladder, [99.6, 60.2]);
  // the menorah's ladders 6 amot off to the four corners; the menorah off the court's axis (stage 06's sledge lane)
  for (const [x, z] of S.light.ladders) { assert.ok(near(Math.hypot(x - 73.5, z - 24), 6, 1e-3)); assert.ok(Math.abs(x - 73.5) > 4 && Math.abs(z - 24) > 4); }
  assert.ok(Math.abs(S.light.menorah[1]) > 20);
  // everything on the court's floor, off the walls; the sleds four amot toward the court from their stand
  const inWall = (x, z) => S.walls.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1);
  for (const e of S.entries.filter((q) => /^n:(stand|bearer|torch|sled|watch|ring|wood|menorah|mladder|measures|wicks)/.test(q.id))) {
    assert.ok(e.x > C.x0 && e.x < C.x1 && e.z > C.z0 && e.z < C.z1, e.id + ' in the court'); assert.ok(!inWall(e.x, e.z), e.id + ' in a wall');
  }
  for (const s of ['N', 'S', 'E']) { const st = G.stand[s]; for (const [x, z] of G.sleds[s]) { const d = s === 'E' ? st[0] - x : Math.abs(z) < Math.abs(st[1]) ? Math.abs(st[1]) - Math.abs(z) : -1; assert.ok(near(d, 4), s + ' sled ' + [x, z]); } }
  // the seats on the gallery's floor between the line and the wall
  for (const s of ['N', 'S']) assert.ok(Math.abs(G.seat[s][1]) > Math.abs(G.runs[s].line) && Math.abs(G.seat[s][1]) < Math.abs(G.runs[s].wall));
  assert.ok(G.seat.E[0] > G.runs.E.line && G.seat.E[0] < G.runs.E.wall);
  // the wood chamber's places inside it; the site's crews off it and its door
  const W = S.chambers.find((c) => c.id === 'wood'), inW = ([x, z], m = 0) => x > W.x0 - m && x < W.x1 + m && z > W.z0 - m && z < W.z1 + m;
  for (const p of Object.values(S.wood)) assert.ok(inW(p));
  const door = [(W.door[0] + W.door[1]) / 2, W.doorZ];
  for (const [x0, z0, x1, z1] of S.crewSite.scaff) assert.ok(!inW([(x0 + x1) / 2, (z0 + z1) / 2], 3) && Math.hypot((x0 + x1) / 2 - door[0], (z0 + z1) / 2 - door[1]) > 12);
  for (const [x, z] of S.crewSite.piles) assert.ok(!inW([x, z], 3) && Math.hypot(x - door[0], z - door[1]) > 12);
  const end = S.crewSite.lane[S.crewSite.lane.length - 1]; assert.ok(Math.hypot(end[0] - door[0], end[1] - door[1]) > 20);
  // the entries carry the new rows
  for (const id of ['n:stand:galN', 'n:torch1', 'n:sled:E4', 'n:watch2.2', 'n:seat:E', 'n:wood:clean', 'n:menorah', 'n:mladder3', 'n:measures', 'n:wicks', 'n:passage']) assert.ok(by[id], id);
  assert.ok(Object.isFrozen(G.lv) && Object.isFrozen(S.cam.gal) && Object.isFrozen(S.crewSite));
  // (part 3) the world's court crews stand at least 12 amot from the menorah and from each of its ladders' feet, never inside a chamber
  for (const [x, z] of S.crewSite.stand) {
    assert.ok(Math.hypot(x - S.light.menorah[0], z - S.light.menorah[1]) >= 12, `crew ${x},${z} by the menorah`);
    for (const [lx, lz] of S.light.ladders) assert.ok(Math.hypot(x - lx, z - lz) >= 12);
    assert.ok(!S.chambers.some((c) => x > c.x0 && x < c.x1 && z > c.z0 && z < c.z1) && !inWall(x, z), `crew ${x},${z}`);
  }
});
// ── /h130 ──
