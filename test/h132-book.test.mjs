// build 132 — stage 09's rows in the one address book (rule 65: BOOK.s09 in src/game/world/grid.js, before the code that reads them):
// every row of the spec's address table (docs/specs/shlav-09-he.md, "טבלת הכתובות") is there, in the spec's own cell, derived from
// BOOK.s08 (the block is stage 08's poured body raised five amot), and checked against the built world (temple.js's sovev and its red
// line, the Ulam's lowest tread).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BOOK, cellOf, nameOf } from '../src/game/world/grid.js';

const S = BOOK.s09, S8 = BOOK.s08, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
const cellAt = (x, z) => { const { k, r } = cellOf(x, z); return nameOf(k, r); };

// the spec's table: key → its cell (a range "A עד B" → both ends' cells)
const CELLS = {
  'yesod:spur:E': 'יב־7', 'yesod:spur:S': 'יד־8', block: 'יג־8',
  'block:NE': 'יג־7', 'block:SE': 'יג־8', 'block:SW': 'יד־8', 'block:NW': 'יד־7',
  'form:wall:E': 'יב־8', 'form:wall:W': 'יד־8', 'form:wall:N': 'יג־7', 'form:wall:S': 'יג־8',
  'form:lie:N': 'יג־7', 'form:lie:S': 'יג־8', 'form:lie:E': 'יב־8', 'form:lie:W': 'יד־8',
  'form:rod:NW': 'יד־7', 'form:rod:NE': 'יג־7', 'form:rod:SW': 'יד־8',
  'form:stake:NE': 'יג־7', 'form:stake:SE': 'יג־8', 'form:stake:SW': 'יד־8', 'form:stake:NW': 'יד־7',
  'form:flag': 'יב־7',
  'fill:zone:NE': 'יג־7', 'fill:zone:NW': 'יג־7', 'fill:zone:SE': 'יג־8', 'fill:zone:SW': 'יג־8', 'fill:zone:C': 'יג־8',
  'fill:gauge:N': 'יג־7', 'fill:gauge:S': 'יג־8', 'fill:gauge:E': 'יב־8', 'fill:gauge:W': 'יד־8',
  ramp: 'יג־6', 'ramp:sled1': 'יג־7', 'ramp:sled2': 'יג־7', 'ramp:sled3': 'יג־6', oxen: 'יב־6',
  'strip:brace:N': 'יג־7', 'strip:brace:S': 'יג־8', 'strip:brace:E': 'יב־8', 'strip:brace:W': 'יד־8',
  'strip:belt:N': 'יג־7', 'strip:belt:S': 'יג־8', 'strip:belt:E': 'יב־8', 'strip:belt:W': 'יד־8',
  'strip:wedge': 'יג־8', 'strip:pile': 'יב־7', 'strip:wallW': 'יג־7', 'form:sill:E': 'יב־8', 'form:sill:S': 'יג־8',
  'sikra:rod': 'יב־8', 'sikra:stake:NE': 'יג־7', 'sikra:stake:SE': 'יג־8', 'sikra:stake:SW': 'יד־8', 'sikra:stake:NW': 'יד־7',
  'sikra:start': 'יג־8', 'sikra:bowl': 'יב־8', 'sikra:path:W': 'יד־8', 'sikra:rough': 'יד־8',
  'stand:w1': 'יב־7', 'stand:w2': 'יג־6', 'stand:w3': 'יב־9', 'stand:w4': 'יב־8',
  'keep:form': 'יב־7', 'keep:fill': 'יג־6', 'keep:strip': 'יב־9', 'keep:sikra': 'יב־8', 'stand:start': 'יב־8',
};

test('book s09: every key of the spec\'s table is there, frozen, in the spec\'s own cell', () => {
  assert.equal(S.stage, 9); assert.equal(S.name, 'הסובב וחוט הסיקרא');
  assert.ok(Object.isFrozen(S) && Object.isFrozen(S.entries) && Object.isFrozen(S.sikra) && Object.isFrozen(S.cam));
  for (const [id, cell] of Object.entries(CELLS)) { assert.ok(by[id], id); assert.equal(by[id].cell, cell, id); assert.equal(by[id].cell, cellAt(by[id].x, by[id].z), id); }
  assert.equal(by.sikra.y, 21);
  // the ranges: the ramp from יג־6 (its foot) to יג־7 (its head); the oxen's road from יב־6 to יג־6; the west walk and the west slots
  // in יד־7 … יד־8
  assert.equal(cellAt(...S.ramp.head), 'יג־7'); assert.equal(cellAt(...S.oxen.to), 'יג־6');
  assert.equal(cellAt(S.sikra.pathW.x, S.sikra.pathW.z0), 'יד־7'); assert.equal(cellAt(S.sikra.pathW.x, S.sikra.pathW.z1), 'יד־8');
  for (const e of S.entries.filter((x) => x.kind === 'flawslot')) assert.ok(['יד־7', 'יד־8'].includes(e.cell), e.id);
  // the stage's bounds (spec: x −62 … −4, z −50 … 22)
  assert.deepEqual({ ...S.bounds }, { x0: -62, x1: -4, z0: -50, z1: 22 });
});

test('book s09: the block is x −53..−23, z −18.5..11.5, y 17..22 — stage 08\'s poured body raised five amot; the line at 21, perimeter 120', () => {
  assert.deepEqual([...S.block], [-53, -18.5, -23, 11.5]);
  assert.deepEqual([...S.block], [...S8.yesod.body]);   // (derived: the pour's edge south and east, the yesod's inner edge north and west)
  assert.equal(S.base, 17); assert.equal(S.base, S8.top); assert.equal(S.top, 22); assert.equal(S.lineY, 21);
  assert.equal(S.side, 30); assert.equal(S.perimeter, 120);
  assert.deepEqual([...S.mid], [...S8.mid]);
  assert.ok(near(S.T, 1 / 3)); assert.ok(near(S.top - S.lineY, 6 * S.tef));
  // the spurs and the rods read from stage 08's book
  assert.deepEqual([...S.spur.E], [...S8.yesod.E1]); assert.deepEqual([...S.spur.S], [...S8.yesod.S1]);
  const A = S8.altar;
  assert.deepEqual([...S.rod.NW.from], [A[0], A[1]]); assert.deepEqual([...S.rod.NE.from], [A[2], A[1]]); assert.deepEqual([...S.rod.SW.from], [A[0], A[3]]);
  for (const k of ['NW', 'NE', 'SW']) { assert.deepEqual([...S.rod[k].to], [...S.corner[k]]); assert.ok(near(Math.abs(S.rod[k].to[0] - S.rod[k].from[0]), 1) && near(Math.abs(S.rod[k].to[1] - S.rod[k].from[1]), 1), k); }
  assert.equal(S.rod.SE, undefined);   // (no shoulder in the south-east)
  // the walls' foot T out of the block's faces; the gauges and belts in the middle of each; the lying walls 2.5 from the foot
  assert.ok(near(S.wall.E.x, -22.667) && near(S.wall.W.x, -53.333) && near(S.wall.N.z, -18.833) && near(S.wall.S.z, 11.833));
  assert.ok(S.wall.E.socket && S.wall.W.socket && S.wall.N.tongue && S.wall.S.tongue);
  assert.ok(near(S.lie.N[1], -21.333) && near(S.lie.S[1], 14.333) && near(S.lie.E[0], -20.167)); assert.deepEqual([...S.lie.W], [-50.5, -3.5]);
  assert.deepEqual([...S.zone.NE], [-30.5, -11]); assert.deepEqual([...S.zone.NW], [-45.5, -11]); assert.deepEqual([...S.zone.SE], [-30.5, 4]); assert.deepEqual([...S.zone.SW], [-45.5, 4]); assert.deepEqual([...S.zone.C], [-38, -3.5]);
  assert.equal(S.gaugeY, 22); assert.equal(S.beltY, 19.5); assert.equal(S.wedgeY, 19.5); assert.deepEqual([...S.wedge], [-23, 11.5]);
  assert.deepEqual([...S.ramp.foot], [-38, -43]); assert.ok(near(S.ramp.head[1], -18.833)); assert.equal(S.ramp.headY, 22); assert.equal(S.ramp.footY, 16); assert.equal(S.ramp.w, 6);
});

test('book s09: the walk E, N, W, S from the south-east corner; six segments of 5 a wall, the dots on their bounds; the west slots per the spec', () => {
  assert.deepEqual([...S.order], ['E', 'N', 'W', 'S']);
  assert.deepEqual([...S.sikra.start], [-23, 11.5]);
  assert.equal(S.seg.n, 6); assert.equal(S.seg.L, 5); assert.equal(S.seg.corner, 1);
  for (const k of S.order) {
    const R = S.run[k], d = S.sikra.dots[k];
    assert.equal(d.length, 5, k);
    d.forEach((p, i) => assert.ok(near(Math.hypot(p[0] - R.from[0], p[1] - R.from[1]), 5 * (i + 1)), k + i));
  }
  // each wall ends where the next begins, the last at the start
  for (let i = 0; i < 4; i++) assert.deepEqual([...S.run[S.order[i]].to], [...S.run[S.order[(i + 1) % 4]].from]);
  assert.deepEqual([...S.run.S.to], [...S.sikra.start]);
  assert.deepEqual([...S.sikra.sparse.N], [2, 4]);
  // the west wall: from the NW corner (−53, −18.5) southward; the slots at the spec's distances, at the line's height, outside the corner zones
  const D = S.sikra.slotD;
  assert.equal(D.tornA, 2.5); assert.deepEqual([...D.bulge], [5, 7, 9, 11]); assert.deepEqual([...D.nest], [14, 16, 18, 20]); assert.equal(D.patch, 24); assert.equal(D.tornB, 27.8); assert.equal(D.rough, 15);
  const at = (d) => [-53, +(-18.5 + d).toFixed(3)];
  assert.deepEqual([...S.sikra.slots.tornA], at(2.5)); assert.deepEqual([...S.sikra.slots.tornB], at(27.8)); assert.deepEqual([...S.sikra.slots.patch], at(24));
  S.sikra.slots.bulge.forEach((p, i) => assert.deepEqual([...p], at(D.bulge[i]))); S.sikra.slots.nest.forEach((p, i) => assert.deepEqual([...p], at(D.nest[i])));
  assert.deepEqual([...S.sikra.rough], [-53, -3.5]);
  for (const d of [D.tornA, ...D.bulge, ...D.nest, D.patch, D.tornB, D.rough]) assert.ok(d - 0.5 >= S.seg.corner && d + 0.5 <= S.side - S.seg.corner, `slot ${d} in a corner zone`);
  for (const e of S.entries.filter((x) => x.kind === 'flawslot' || x.kind === 'roughpatch' || x.kind === 'dot' || x.kind === 'linestake' || x.kind === 'start')) assert.equal(e.y, 21, e.id);
});

test('book s09: against the built world — temple.js builds the sovev and its red line where the book has them; the Ulam\'s lowest tread', () => {
  const T = readFileSync(new URL('../src/temple.js', import.meta.url), 'utf8');
  const B = S.block;
  assert.ok(T.includes(`A(${B[0]}, ${S.base}, ${B[1]}, ${B[2]}, ${S.top}, ${B[3]});    // up to the sovev`));
  const m = T.match(/box\('red', ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), -999\);\s+\/\/ חוט הסיקרא/);
  assert.ok(m, 'temple.js red line');
  assert.ok(near((+m[2] + +m[5]) / 2, S.lineY));
  assert.match(T, /const xr = \[-55, -56,/);
  assert.equal(S.step1.x1, -55); assert.equal(S.step1.y, 16.5);
  // the west brace's foot on that tread's line; the west walk in the one amah of floor between the yesod's edge (−54) and the tread
  assert.ok(S.brace.W[0] <= S.step1.x1 && S.brace.W[0] >= S.step1.x0); assert.equal(S.brace.wY, S.step1.y);
  assert.equal(S.brace.W[0], (S.step1.x0 + S.step1.x1) / 2);   // (phase 1 decision 3: the step's middle)
  assert.deepEqual([...S.oxen.from], [-13, -46]);              // (decision 4: west of the Duchan's steps, x −12 … −8)
  // (decision 3) the west wall after work 3 beside the pile, clear of the steps, the west gap and the block
  const wr = S.wallRest.W, hl = (S.side + 2 * S.T) / 2;
  assert.ok(wr[0] + hl < S.pile[0] && wr[0] - hl > S.step1.x1 && wr[1] + 2.5 < S.block[1] - 5);
  assert.ok(S.sikra.pathW.x > S.step1.x1 && S.sikra.pathW.x < S8.altar[0]);
  // the sills proposed under the south and east walls are stage 08's timbers, exactly the strip with no yesod
  assert.deepEqual([...S.sill.E], [...S8.wood.E]); assert.deepEqual([...S.sill.S], [...S8.wood.S]);
  // the cameras as the spec types them
  assert.deepEqual(S.cam.w1.map((p) => [...p]), [[-8, 34, -36], [-38, 18, -3.5]]);
  assert.deepEqual(S.cam.w2.map((p) => [...p]), [[-37, 47, 35], [-37, 17, -17]]);   // (round 5: from the south, the ramp and the oxen in it)
  assert.deepEqual(S.cam.w3.map((p) => [...p]), [[-10, 30, 26], [-38, 19.5, -3.5]]);
  assert.deepEqual(S.cam.w4measure.map((p) => [...p]), [[-6, 32, 28], [-38, 21, -3.5]]);
  assert.deepEqual(S.cam.w4.map((p) => [...p]), [[-12, 22.5, 17], [-23, 21, 9]]);
  assert.deepEqual({ c: [...S.cam.end.c], R: S.cam.end.R, y: S.cam.end.y }, { c: [-38, -3.5], R: 40, y: 50 });
  assert.deepEqual(S.cam.peak.map((p) => [...p]), [[-11, 20, 23.5], [-21.5, 22.5, 13]]); assert.equal(S.cam.peakFov, 45);   // (the ending's peak: low at the south-east)
  // (lane B's measuring shots, one a corner, and the helper's ladders: the act reads them from the book)
  assert.deepEqual(Object.fromEntries(Object.entries(S.cam.w4corner).map(([k, v]) => [k, v.map((p) => [...p])])), { SE: [[-6, 32, 28], [-25, 19.5, 9.5]], NE: [[-14, 27.5, -31.5], [-22.5, 19.4, -18.5]], NW: [[-60, 28, -30], [-51.5, 19.4, -19.5]], SW: [[-60, 28, 23], [-51.5, 19.4, 12.5]] });
  assert.deepEqual(S.cam.w4corner.SE[0], S.cam.w4measure[0]);
  for (const k of ['NE', 'SE', 'SW', 'NW']) {
    const L = S.sikra.ladder[k], c = S.corner[k], c0 = S.cam.w4corner[k][1];
    assert.ok(Math.hypot(L.foot[0] - c[0], L.foot[1] - c[1]) < 4.5, k + ' ladder near its corner');
    assert.ok(L.head[1] > S.lineY && L.head[1] <= S.top, k + ' ladder head between the line and the top');
    assert.ok(Math.abs(c0[1] - (S.lineY - 1.5)) < 0.15, k + ' aim 1.5 under the line');
    // (on a face, not on the diagonal: the head on the block's face line beside the corner)
    assert.ok(Math.abs(L.head[0] - c[0]) < 0.15 || Math.abs(L.head[2] - c[1]) < 0.15, k + ' ladder head on a face');
  }
});
