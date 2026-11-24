// build 133 — stage 10's rows in the one address book (rule 65: BOOK.s10 in src/game/world/grid.js, before the code that reads them):
// every place DERIVED from BOOK.s09's block; the kevesh's one slope (9 over 32); the three gaps over zero and under a tenth of a tefach.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK, cellOf, nameOf, pitCell } from '../src/game/world/grid.js';

const S = BOOK.s10, S9 = BOOK.s09, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
const cellAt = (x, z) => { const { k, r } = cellOf(x, z); return nameOf(k, r); };

test('book s10: frozen, the spec\'s keys, each in the cell its own numbers give', () => {
  assert.equal(S.stage, 10); assert.equal(S.name, 'גוף המזבח והכבש');
  assert.ok(Object.isFrozen(S) && Object.isFrozen(S.entries) && Object.isFrozen(S.ramp));
  for (const id of ['upper', 'upper:top', 'sovev:ledge', 'frame', 'frame:crew:N', 'frame:crew:S', 'frame:crew:E', 'frame:crew:W', 'ramp', 'ramp:head', 'gap', 'rabuva',
    'kevesh:sovev', 'kevesh:yesod', 'stock', 'roll', 'finale:salt', 'champion', 'start', 'w2:a', 'w2:b', 'w2:c', 'w3:a', 'w3:b', 'w3:c', 'w4:a', 'w4:b', 'w4:c'])
    assert.ok(by[id], id);
  for (const e of S.entries) assert.equal(e.cell, cellAt(e.x, e.z), e.id);
  assert.equal(by.upper.cell, 'יג־8'); assert.equal(by.stock.cell, 'יב־10'); assert.equal(by['w3:c'].cell, 'יד־9'); assert.equal(by.start.cell, 'יב־9');
  assert.deepEqual(['a', 'b', 'c'].map((k) => pitCell(...S.w1[k]).name), ['כרם־ג־3', 'כרם־ב־3', 'כרם־א־3']);
});

test('book s10: the upper block one amah in from stage 09\'s block, 3 high; the fire place 24 × 24', () => {
  const B = S9.block;
  assert.deepEqual([...S.upper], [B[0] + 1, B[1] + 1, B[2] - 1, B[3] - 1]);
  assert.deepEqual([...S.upper], [-52, -17.5, -24, 10.5]);
  assert.equal(S.base, S9.top); assert.equal(S.top, 25); assert.equal(S.upper[2] - S.upper[0], 28);
  assert.equal(S.fire[2] - S.fire[0], 24); assert.equal(S.fire[3] - S.fire[1], 24);
});

test('book s10: the kevesh — 16 wide in the middle of the south side, 32 from above, 30 on the ground, one slope 9 on 32', () => {
  const R = S.ramp;
  assert.equal(R.x1 - R.x0, 16); assert.equal((R.x0 + R.x1) / 2, S.mid[0]);
  assert.equal(R.foot - R.head, 32); assert.equal(R.foot - R.ground, 30);
  assert.equal(S.rampY(R.foot), 16); assert.equal(S.rampY(R.head), 25);
  for (let z = R.head; z <= R.foot; z += 0.5) assert.ok(near(S.rampY(z), 16 + (9 / 32) * (42.5 - z)), String(z));
  // the six slabs end to end, each 5, from the foot to the ground's line (12.5): the sixth's upper edge 24.44
  assert.equal(S.slabs.length, 6); assert.equal(S.slabs[0].z1, 42.5); assert.equal(S.slabs[5].z0, 12.5);
  for (let i = 1; i < 6; i++) { assert.equal(S.slabs[i].z1, S.slabs[i - 1].z0); assert.equal(S.slabs[i].y0, S.slabs[i - 1].y1); }
  assert.ok(near(S.slabs[5].y1, 24.4375));
  // the head stone, "פורח", over the sovev's step and the strip with no yesod: no step to the top (under the joint's 0.02)
  assert.equal(S.head.z1, 12.5); assert.ok(near(S.head.z0, R.head + S.gap, 1e-9));
  assert.ok(25 - S.rampY(S.head.z0) < 0.02);
  // the rabuva on the west side, one amah by one
  assert.equal(S.rabuva.x, R.x0); assert.equal(S.rabuva.z1 - S.rabuva.z0, 1); assert.equal(S.rabuva.y1 - S.rabuva.y0, 1);
  assert.ok(S.rabuva.y1 < S.rampY((S.rabuva.z0 + S.rabuva.z1) / 2));
});

test('book s10: the three gaps — over zero, at most a tenth of a tefach; the small kevashim end with no step and no overlap', () => {
  assert.ok(S.gap > 0 && S.gap <= 1 / 60);
  // to the sovev: from the floor at the foot to the sovev's step (22) at the block's south face plus the gap
  assert.equal(S.ks.x0, S.ramp.x1); assert.ok(near(S.ks.z0, S9.block[3] + S.gap, 1e-9));
  assert.equal(S.ksY(S.ks.z1), 16); assert.ok(22 - S.ksY(S.ks.z0) < 0.02 && 22 - S.ksY(S.ks.z0) >= 0);
  // to the yesod: its tip on the SW spur's south face (the built world's, BOOK.s08 S1), at the spur's top (17)
  const S1 = S9.spur.S, lanes = S.ky.lanes, tip = lanes[2];
  assert.equal(tip.x0, S1[0]); assert.equal(tip.x1, S1[2]); assert.ok(near(tip.z0, S1[3] + S.gap, 1e-9));
  assert.ok(17 - S.kyY(S.ky.L) < 0.001);
  // nothing of it inside the altar's body (z ≤ 12.5 within x −54 … −22) but the gap's far side
  for (const L of lanes) assert.ok(L.z0 > 12.5 || L.x1 <= -52 || L.x0 >= -22);
  assert.ok(lanes[1].x0 >= -55, 'one amah clear of the Ulam\'s lowest tread');
});
