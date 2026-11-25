// build 134 — stage 11 "הקרנות": the book's rows (rule 65), a link for every station and level (#orezSE1 … #fixSW3, #chotem2), the
// pack and its acts with stands from the book; index.js wires the stage-11 page and leads stage 10's end into it; the frontier after it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workFlag } from '../src/game/h109/director.js';
import { PLAN, createH134, NEXT_STAGE, KINDS } from '../src/game/h134/model.js';
import { PLAN as PLAN08 } from '../src/game/h131/model.js';
import { PLAN as PLAN09 } from '../src/game/h132/model.js';
import { PLAN as PLAN10 } from '../src/game/h133/model.js';
import { PACKED, NEXT_NAMED } from '../src/game/h128/page.js';
import { BOOK, cellOf, nameOf } from '../src/game/world/grid.js';

const S = BOOK.s11, S10 = BOOK.s10, by = Object.fromEntries(S.entries.map((e) => [e.id, e]));
const cellAt = (x, z) => { const { k, r } = cellOf(x, z); return nameOf(k, r); };
const inB = (b, x, z) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];

test('book s11: frozen, every row in its own cell; the horns in the upper block\'s corners, an amah square; the stands inside the top', () => {
  assert.equal(S.stage, 11); assert.ok(Object.isFrozen(S) && Object.isFrozen(S.entries));
  for (const id of ['horn:SE', 'horn:NE', 'horn:NW', 'horn:SW', 'horn:SE:core', 'horn:SE:stand', 'horn:SE:basket', 'cups:water', 'cups:wine', 'tzoref', 'tzoref:stand', 'tzoref:kohen', 'salt', 'finale:start', 'champion']) assert.ok(by[id], id);
  for (const e of S.entries) assert.equal(e.cell, cellAt(e.x, e.z), e.id);
  const U = S10.upper;
  for (const c of S.corners) {
    const h = S.horns[c]; assert.equal(h.box[2] - h.box[0], 1); assert.equal(h.box[3] - h.box[1], 1); assert.ok(inB(U, h.box[0], h.box[1]) && inB(U, h.box[2], h.box[3]), c);
    assert.ok(inB(U, ...h.stand) && inB(U, ...h.basket), c); assert.ok(!inB(h.box, ...h.stand), c);
    assert.equal(h.y0, 25); assert.ok(Math.abs(h.y1 - h.y0 - 5 / 6) < 1e-3);
  }
  assert.deepEqual(S.corners, ['SE', 'NE', 'NW', 'SW']);   // (Zevachim 5:3)
  assert.ok(S.cups.water[0] < S.cups.wine[0], 'the water west, the wine east (Sukkah 4:9)');
});
test('book s11: nothing overlaps — the stands and baskets clear of every horn, the bench clear of the stand and the shelves', () => {
  const hs = S.corners.map((c) => S.horns[c]);
  for (const a of hs) for (const b of hs) { if (a === b) continue; assert.ok(!inB(b.box, ...a.stand) && !inB(b.box, ...a.basket)); }
  const T = S.tz; assert.ok(!inB(T.benchBox, ...T.stand)); assert.ok(!inB(T.benchBox, ...T.shelf) && !inB(T.benchBox, ...T.spare)); assert.ok(!inB(T.benchBox, ...T.kohen));
});

const IDS = PLAN.map((m) => m.id), ALL = [...PLAN08, ...PLAN09, ...PLAN10, ...PLAN].map((m) => m.id);
test('links: the 39 ids of stage 11 resolve next to stages 08–10 with no clash, and open their own station', () => {
  assert.equal(IDS.length, 39); assert.equal(new Set(ALL).size, ALL.length);
  for (const id of IDS) {
    assert.deepEqual(workFlag(ALL, { hash: '#' + id }), { id, asked: null });
    const M = createH134(null); const got = M.autoTo((m) => m.id === id);
    if (id.startsWith('fix')) { assert.equal(got && got.id, id); assert.equal(M.st.stash.flaws[0].lv, got.lv); continue; }   // (a repair's link: the crews' horn with a crack at that level)
    assert.equal(got && got.id, id);
  }
});
test('index.js: the stage-11 page and links; stage 10\'s end leads into stage 11; the frontier after it', () => {
  const idx = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(idx, /workFlag\(\[\.\.\.PLAN08, \.\.\.PLAN09, \.\.\.PLAN10, \.\.\.PLAN11\]/);
  assert.match(idx, /const H134_ONLY = KINDS11\.includes\(H9_ONLY\)/); assert.match(idx, /stage=11/);
  assert.match(idx, /if \(H109_ON && H134_ON\) \{ h34Only\(\); return; \}/);
  assert.match(idx, /S\.beginDirected\(G, 'karnot'\)/); assert.match(idx, /h34Begin\(\), 600/);
  assert.equal(PACKED[PACKED.length - 1], 'karnot'); assert.equal(NEXT_NAMED.karnot, NEXT_STAGE); assert.equal(NEXT_STAGE, 'הכיור');
  assert.equal(KINDS.length, 13);
});
