// build 133: a link for every work AND level of stage 10 (#nail1 … #nima3) — the flag resolves next to stages 08 and 09 with no clash,
// the flow before it stands, the work opens on its own world; the pack, its acts and stands in the book; index.js wires the stage-10
// page and leads stage 09's end into it; the frontier names the next stage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workFlag } from '../src/game/h109/director.js';
import { PLAN, createH133, NEXT_STAGE } from '../src/game/h133/model.js';
import { PLAN as PLAN08 } from '../src/game/h131/model.js';
import { PLAN as PLAN09 } from '../src/game/h132/model.js';
import { makePack10 } from '../src/game/h133/pack.js';
import { ACTS } from '../src/game/h133/acts.js';
import { PACKED, NEXT_NAMED } from '../src/game/h128/page.js';
import { BOOK } from '../src/game/world/grid.js';

const IDS = PLAN.map((m) => m.id), ALL = [...PLAN08, ...PLAN09, ...PLAN].map((m) => m.id);

test('the twelve ids of stage 10 resolve (flag, ?work=, #work=, #id) next to stages 08 and 09, and open their own work', () => {
  assert.equal(IDS.length, 12); assert.equal(new Set(ALL).size, ALL.length);
  for (const id of IDS) {
    assert.deepEqual(workFlag(ALL, { flag: id }), { id, asked: id });
    assert.equal(workFlag(ALL, { search: '?work=' + id }).id, id);
    assert.deepEqual(workFlag(ALL, { hash: '#' + id }), { id, asked: null });
    const M = createH133(null); const got = M.autoTo((m) => m.id === id);
    assert.equal(got && got.id, id); assert.equal(M.stageOf().lv, M.mission().lv);
  }
});
test('the pack: id guf, key h133, the four acts with stands from the book', () => {
  const P = makePack10({});
  assert.equal(P.id, 'guf'); assert.equal(P.key, 'h133'); assert.equal(P.workLinks, true); assert.equal(P.visits, true);
  for (const k of ['nail', 'malben', 'kevesh', 'nima']) { assert.ok(ACTS[k] && typeof ACTS[k].make === 'function', k); assert.ok(ACTS[k].title); }
  for (const [k, w] of [['malben', 'w2'], ['kevesh', 'w3'], ['nima', 'w4']]) for (const lv of [1, 2, 3]) { const s = ACTS[k].stand({ k, lv }, {}); assert.deepEqual([s.x, s.z], [...BOOK.s10[w][['a', 'b', 'c'][lv - 1]]], k + lv); }
  const s1 = ACTS.nail.stand({ k: 'nail', lv: 1 }, {}); assert.deepEqual([s1.x, s1.z], BOOK.s08.stand.pit.slice(0, 2));
});
test('index.js: the stage-10 page and links; stage 09\'s end leads into stage 10; the frontier is after it', () => {
  const idx = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(idx, /const H9_WORK = workFlag\(\[\.\.\.PLAN08, \.\.\.PLAN09, \.\.\.PLAN10[,\]]/);   // (build 134: stage 11's ids after them)
  assert.match(idx, /const H133_ONLY = \['nail', 'malben', 'kevesh', 'nima'\]\.includes\(H9_ONLY\)/);
  assert.match(idx, /stage=10/); assert.match(idx, /if \(H109_ON && H133_ON\) \{ h33Only\(\); return; \}/);
  assert.match(idx, /S\.beginDirected\(G, 'guf'\)/); assert.match(idx, /h33Begin\(\), 600/);
  assert.ok(PACKED.includes('guf'));   /* (build 134: stage 11 after it) */ assert.equal(NEXT_NAMED.guf, NEXT_STAGE); assert.equal(NEXT_STAGE, 'הקרנות');
});
