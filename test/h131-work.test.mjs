// b131: a link for every work — the flag resolves, the works before it are done, what it needs is there, an unknown id falls back
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workFlag } from '../src/game/h109/director.js';
import { PLAN, NEEDS, createH131 } from '../src/game/h131/model.js';
import { makePack08 } from '../src/game/h131/pack.js';

const IDS = PLAN.map((m) => m.id);

test('work page: every one of the ten ids resolves from the flag, ?work=, #work= and a plain #id', () => {
  assert.equal(IDS.length, 10);
  for (const id of IDS) {
    assert.deepEqual(workFlag(IDS, { flag: id }), { id, asked: id });
    assert.equal(workFlag(IDS, { search: '?work=' + id }).id, id);
    assert.equal(workFlag(IDS, { hash: '#work=' + id }).id, id);
    assert.deepEqual(workFlag(IDS, { hash: '#' + id }), { id, asked: null });
  }
});

test('work page: an unknown id is asked but not found (the stage page); a plain hash that is no work is not a work page', () => {
  assert.deepEqual(workFlag(IDS, { flag: 'pour9' }), { id: null, asked: 'pour9' });
  assert.deepEqual(workFlag(IDS, { search: '?work=nope' }), { id: null, asked: 'nope' });
  assert.deepEqual(workFlag(IDS, { hash: '#stage=8' }), { id: null, asked: null });
  assert.deepEqual(workFlag(IDS, { hash: '#hello' }), { id: null, asked: null });
  assert.deepEqual(workFlag(IDS, {}), { id: null, asked: null });
});

test('work page: the works before it done (as the ONLY page does), the work itself open, the pour clean for the finale', () => {
  const P = makePack08({});
  assert.equal(P.workLinks, true);
  for (const id of IDS) {
    const M = createH131(null);
    M.autoTo((m) => m.id === id); P.workSeed(M, id);
    assert.equal(M.mission() && M.mission().id, id, id);
    const need = new Set(); const add = (k) => { for (const n of NEEDS[k] || []) { need.add(n); add(n); } }; add(id);
    for (const n of need) assert.ok(M.isDone(n), id + ' needs ' + n);
    assert.ok(!M.isDone(id));
    if (id === 'finale') for (const lv of [1, 2, 3]) { assert.equal(M.st.pour.sections[lv].clean, 1); assert.equal(M.st.res['pour' + lv].pts, 40); }
    if (/^pour/.test(id)) assert.ok(M.isDone('pit3') && M.isDone('frame3'));
  }
});

test('work page: wired in the director and on the stage-08 page; ONLY and FULL pages untouched', () => {
  const dir = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  const idx = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(dir, /PK\.workLinks/); assert.match(dir, /PK\.workSeed\(M, WORK\)/);
  assert.match(idx, /H9_WORK\.id \? PLAN08\.find/); assert.match(idx, /H131_FULL = H9_WORK_BAD \|\|/);
});
