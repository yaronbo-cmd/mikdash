// build 124 B — the one address book (rule 65): BOOK.s02 … BOOK.s05 in src/game/world/grid.js. Every entry is finite, named by its
// own cell, inside its stage's bounds, and alone on its spot for its kind; stage 05 reads its places from the book (the same numbers
// in h120/layout.js, routes.js and model.js), and every act's stand there is the book's. Build 126: stages 02 … 04 read their places
// from the book too — their tables are the book's own objects (the same reference), and their stands come out where the book says.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, cellOf, nameOf } from '../src/game/world/grid.js';

const SEC = ['s02', 's03', 's04', 's05'];
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
