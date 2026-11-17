// build 131 — stage 08's rows in the one address book (rule 65: BOOK.s08 in src/game/world/grid.js, before the code that reads them):
// every row of the spec's address table, checked against the built world (temple.js's altar and yesod, stages.js groundAt's yesod,
// places.js's holes, the slaughter place's rings, the Ulam's steps), and the pit's sheet at Beit Kerem on the one world grid.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOOK, cellOf, nameOf, pitWorld, pitCell } from '../src/game/world/grid.js';
import { LIBATION_BOWLS, RINGS } from '../src/places.js';

const S = BOOK.s08, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
const area = (b) => (b[2] - b[0]) * (b[3] - b[1]);
const inside = (p, b, e = 1e-9) => p[0] >= b[0] - e && p[0] <= b[2] + e && p[1] >= b[1] - e && p[1] <= b[3] + e;
const overlap = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

test('book s08: every row of the spec\'s table is there, frozen, named by its own cell', () => {
  assert.equal(S.stage, 8); assert.equal(S.name, 'יסוד המזבח');
  assert.ok(Object.isFrozen(S) && Object.isFrozen(S.pit) && Object.isFrozen(S.entries) && Object.isFrozen(S.pit.entries));
  for (const id of ['altar', 'stake:NW', 'stake:NE', 'stake:SE', 'stake:SW', 'frame:N', 'frame:S', 'frame:W', 'frame:E', 'yesod:N', 'yesod:W', 'yesod:S1', 'yesod:E1', 'yesod:body',
    'wood:E', 'wood:S', 'wood:joint', 'reed1', 'reed2', 'section1', 'section2', 'section3', 'fire', 'pile', 'stand:frame', 'stand:witness', 'stand:pour', 'stand:south', 'stand:pit']) assert.ok(by[id], id);
  for (const e of S.entries) { const { k, r } = cellOf(e.x, e.z); assert.equal(e.cell, nameOf(k, r), e.id); assert.equal(e.y, 16, e.id); }
  // the spec's cells where its numbers stand as the world has them
  assert.equal(by.altar.cell, 'יג־8'); assert.equal(by['stake:NW'].cell, 'יד־7'); assert.equal(by['stake:NE'].cell, 'יב־7'); assert.equal(by['stake:SE'].cell, 'יב־8'); assert.equal(by['stake:SW'].cell, 'יד־8');
  assert.equal(by['stand:south'].cell, 'יד־9'); assert.equal(by['wood:joint'].cell, 'יב־8');
});

test('book s08: the altar and the yesod as the world builds them (temple.js, stages.js groundAt)', () => {
  assert.deepEqual([...S.altar], [-54, -19.5, -22, 12.5]); assert.deepEqual([...S.mid], [-38, -3.5]);
  assert.equal(S.floor, 16); assert.equal(S.top, 17);
  const T = readFileSync(new URL('../src/temple.js', import.meta.url), 'utf8');
  const Y = S.yesod, A = (b) => `A(${b[0]}, 16, ${b[1]}, ${b[2]}, 17, ${b[3]})`;
  for (const k of ['N', 'W', 'S1', 'E1', 'body']) assert.ok(T.includes(A(Y[k])), `temple.js builds the yesod's ${k} at ${Y[k]}`);
  assert.ok(T.includes("P('altar', -54, 16, -19.5, -22, 27, 12.5)"));
  // the whole north, the whole west, one amah more into the south and the east; together the altar's square less the two timbers' strip
  assert.equal(Y.N[0], S.altar[0]); assert.equal(Y.N[2], S.altar[2]); assert.equal(Y.W[3], S.altar[3]);
  const yes = Object.values(Y).reduce((a, b) => a + area(b), 0), wood = area(S.wood.E) + area(S.wood.S);
  assert.equal(yes + wood, area(S.altar));
  for (const a of Object.values(Y)) for (const w of [S.wood.E, S.wood.S]) assert.equal(overlap(a, w), 0);
  assert.equal(overlap(S.wood.E, S.wood.S), 0);
  // stages.js groundAt's own yesod predicate agrees cell by cell
  const G = readFileSync(new URL('../src/stages.js', import.meta.url), 'utf8');
  assert.ok(G.includes('const yes = (z <= -18.5) || (x <= -53) || (x <= -23 && z <= 11.5) || (x >= -23 && z <= -17.5) || (x <= -52 && z >= 11.5);'));
  const yesAt = (x, z) => (z <= -18.5) || (x <= -53) || (x <= -23 && z <= 11.5) || (x >= -23 && z <= -17.5) || (x <= -52 && z >= 11.5);
  for (let x = -53.75; x < -22; x += 0.5) for (let z = -19.25; z < 12.5; z += 0.5) {
    const inY = Object.values(Y).some((b) => inside([x, z], b)), inW = [S.wood.E, S.wood.S].some((b) => inside([x, z], b));
    assert.equal(yesAt(x, z), inY, `${x}, ${z}`); assert.equal(inW, !inY, `${x}, ${z}`);
  }
});

test('book s08: the timbers meet in the south-east corner; the reeds stand on the world\'s holes, on the yesod', () => {
  assert.ok(inside(S.wood.joint, S.wood.S) && Math.abs(S.wood.joint[0] - S.wood.E[0]) <= 1 && Math.abs(S.wood.joint[1] - S.wood.E[3]) <= 1);
  assert.deepEqual([...S.wood.joint], [-22.5, 12]);
  assert.deepEqual(S.reeds.map((r) => [...r]), LIBATION_BOWLS.holes.map(([x, , z]) => [x, z]));
  for (const r of S.reeds) { assert.ok(inside(r, S.yesod.W) || inside(r, S.yesod.S1)); assert.ok(!inside(r, S.wood.S)); assert.ok(inside(r, S.sections[3])); }
});

test('book s08: the sections are the pour sample\'s segment (12 × 8) in the poured area, apart; level 3 holds the reeds and the south timber', async () => {
  const { W, D } = await import('../src/game/h131/sim.js');
  const Y = Object.values(S.yesod), wood = [S.wood.E, S.wood.S];
  const cells = (b, f) => { for (let x = b[0] + 0.25; x < b[2]; x += 0.5) for (let z = b[1] + 0.25; z < b[3]; z += 0.5) if (!f([x, z])) return false; return true; };
  for (const k of ['1', '2', '3']) {
    const b = S.sections[k]; assert.equal(b[2] - b[0], W, k); assert.equal(b[3] - b[1], D, k);
    assert.ok(cells(b, (p) => Y.some((a) => inside(p, a)) || (k === '3' && inside(p, S.wood.S))), k);   // (yesod; in 3 also the timber)
    assert.ok(cells(b, (p) => !inside(p, S.wood.E)), k);
  }
  assert.equal(overlap(S.sections[1], S.sections[2]), 0); assert.equal(overlap(S.sections[2], S.sections[3]), 0); assert.equal(overlap(S.sections[1], S.sections[3]), 0);
  assert.equal(S.sections[1][1], S.altar[1]); assert.equal(S.near[1], 'N');    // (level 1 in the north: its near board the frame's north timber)
  assert.equal(S.sections[2][1], S.sections[1][3]); assert.equal(S.near[2], 'N');   // (level 2 behind it, in the middle)
  assert.equal(S.sections[3][3], S.altar[3]); assert.equal(S.sections[3][0], S.altar[0]); assert.equal(S.near[3], 'S');   // (the south-west corner)
  assert.ok(overlap(S.sections[3], S.wood.S) > 0);
  void wood;
});

test('book s08: the fire, the pile and the stands are on the free floor — off the altar, off the slaughter place\'s rings, off the Ulam\'s steps', () => {
  const rings = RINGS.xs.flatMap((x) => RINGS.zs.map((z) => [x, z]));
  for (const p of [S.fire, S.pile, ...Object.values(S.stand).map((s) => [s[0], s[1]])]) {
    assert.ok(!inside(p, S.altar), String(p));
    assert.ok(rings.every(([x, z]) => Math.hypot(p[0] - x, p[1] - z) >= 1.5), `${p} by a ring`);
    assert.ok(p[0] > -55, `${p} on the Ulam's steps`);
  }
  assert.ok(S.stand.witness[1] > S.stand.frame[1] && S.stand.witness[1] < S.altar[1]);   // (between the player and the altar, facing him)
  assert.ok(S.stand.south[1] > S.altar[3] && S.stand.south[0] < -46);   // (south of the frame, west of the kevesh)
  for (const k of ['frame', 'pour']) assert.equal(S.stand[k][2], 'S'); assert.equal(S.stand.south[2], 'N');
  for (const [k, c] of Object.entries(S.cam)) for (const q of (k === 'open' ? c : [c])) assert.ok(q.flat().every(Number.isFinite), k);
});

test('book s08: the pit\'s sheet sits on the one world grid at Ein Kerem, written once; its places local to it', () => {
  const P = S.pit, O = P.origin;
  assert.equal(O.place, 'עין כרם'); assert.equal(O.status, 'זיהוי מוצע, לא ודאי');
  assert.deepEqual([O.x, O.z], [-13900, 2200], 'exactly the spec\'s centre of the pit (shlav-08-he.md)');
  const ids = P.entries.map((e) => e.id);
  for (const id of ['pit', 'stone1', 'stone2', 'stone3.1', 'stone3.2', 'stone3.3', 'cradle', 'rejects', 'stand']) assert.ok(ids.includes(id), id);
  for (const e of P.entries) {
    const w = pitWorld(e.lx, e.lz); assert.equal(e.x, w.x); assert.equal(e.z, w.z); assert.equal(e.x - e.lx, O.x); assert.equal(e.z - e.lz, O.z);
    assert.equal(e.cell, pitCell(e.lx, e.lz).name); assert.ok(/^כרם־/.test(e.cell));
    const h = (P.sheet.n * P.sheet.cell) / 2; assert.ok(Math.abs(e.lx) <= h && Math.abs(e.lz) <= h, e.id + ' on the sheet');
    assert.ok(/[֐-׿]/.test(e.label) && e.src, e.id);
  }
  // the pit: 16 across, 4 deep, the dark layer to 2; the cradle and the rejects outside it, the stand on its rim's south
  assert.deepEqual([P.hole.d, P.hole.depth, P.hole.dark], [16, 4, 2]);
  for (const p of [P.cradle, P.rejects]) assert.ok(Math.hypot(...p) > P.hole.d / 2);
  for (const L of Object.values(P.stones)) for (const p of L) assert.ok(Math.hypot(...p) < P.hole.d / 2 - 1);
  assert.equal(P.stand[2], 'N'); assert.ok(P.stand[1] > P.hole.d / 2 && P.stand[0] === 0);
  // written once: no other file of the game types the pit's world address
  const files = ['src/game/h131/world.js', 'src/game/h131/pit.js', 'src/game/h131/pack.js', 'src/game/h131/model.js'];
  for (const f of files) assert.ok(!readFileSync(new URL('../' + f, import.meta.url), 'utf8').includes(String(O.x)), f);
});

test('book s08: the same on every load (pure)', async () => {
  const again = await import('../src/game/world/grid.js?s08again');
  assert.deepEqual(JSON.parse(JSON.stringify(again.BOOK.s08)), JSON.parse(JSON.stringify(S)));
});
