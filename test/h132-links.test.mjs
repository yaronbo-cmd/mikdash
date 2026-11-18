// build 132 — a link per work and level (#form1 … #sikra3, ?work=, __H109_WORK): every one of stage 09's twelve ids resolves to its
// work page — the flag read, its kind's page on, the model opened at that very work from a fresh save; and a work of another stage's
// pack does not make this pack warn (the director made for stage 08's rest saw 'fill2' as its own unknown work: the old warning).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workFlag } from '../src/game/h109/director.js';
import { PLAN as PLAN08 } from '../src/game/h131/model.js';
import { PLAN, createH132 } from '../src/game/h132/model.js';

const ALL = [...PLAN08, ...PLAN].map((m) => m.id);

test('the twelve ids of stage 09, each by the flag, ?work=, #work= and #id, open their own work from a fresh save', () => {
  assert.equal(PLAN.length, 12);
  const idx = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  for (const m of PLAN) {
    assert.deepEqual(workFlag(ALL, { flag: m.id }), { id: m.id, asked: m.id });
    assert.equal(workFlag(ALL, { search: '?work=' + m.id }).id, m.id);
    assert.equal(workFlag(ALL, { hash: '#work=' + m.id }).id, m.id);
    assert.equal(workFlag(ALL, { hash: '#' + m.id }).id, m.id);
    assert.ok(new RegExp(`H132_ONLY = \\[[^\\]]*'${m.k}'`).test(idx), m.k + ' is a stage-09 kind page');
    const M = createH132(null), got = M.autoTo((x) => x.id === m.id);
    assert.equal(got && got.id, m.id, m.id + ' opens'); assert.equal(M.mission().id, m.id);
  }
});

test('the director warns about an unknown work only when the id is of its own pack\'s kinds', () => {
  const D = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(D, /if \(w\.asked && !w\.id && PLAN\.some\(\(m\) => m\.k === String\(w\.asked\)\.replace\(\/\\d\+\$\/, ''\)\)\) console\.warn\('\[h109\] work page: no work'/);
  // stage 08's own pack, asked for fill2: not its kind (no warning); asked for pit9: its kind, no such level (the warning stays)
  const own = (ids, q) => PLAN08.some((m) => m.k === String(q).replace(/\d+$/, '')) && !ids.includes(q);
  assert.equal(own(PLAN08.map((m) => m.id), 'fill2'), false); assert.equal(own(PLAN08.map((m) => m.id), 'pit9'), true);
});
