// build 132: a link for every work AND level of stage 09 — the flag resolves, the flow before it stands, the work opens on its own world;
// the stage-09 page and the kind pages wired in index.js; stage 08's end names stage 09 and leads into it; the frontier names stage 10.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workFlag } from '../src/game/h109/director.js';
import { PLAN, STAGE_FLOW, createH132 } from '../src/game/h132/model.js';
import { PLAN as PLAN08, NEXT_STAGE as NEXT08 } from '../src/game/h131/model.js';
import { makePack09, endRound } from '../src/game/h132/pack.js';
import { ACTS } from '../src/game/h132/acts.js';
import { BOOK } from '../src/game/world/grid.js';

const IDS = PLAN.map((m) => m.id), ALL = [...PLAN08, ...PLAN].map((m) => m.id);

test('work page: every one of the twelve ids resolves (flag, ?work=, #work=, plain #id), next to stage 08\'s ten with no clash', () => {
  assert.equal(IDS.length, 12); assert.equal(new Set(ALL).size, ALL.length);
  for (const id of IDS) {
    assert.deepEqual(workFlag(ALL, { flag: id }), { id, asked: id });
    assert.equal(workFlag(ALL, { search: '?work=' + id }).id, id);
    assert.equal(workFlag(ALL, { hash: '#work=' + id }).id, id);
    assert.deepEqual(workFlag(ALL, { hash: '#' + id }), { id, asked: null });
  }
  assert.deepEqual(workFlag(ALL, { hash: '#stage=9' }), { id: null, asked: null });
});

test('the pack: id, key, links, the acts of the four kinds, a stand for each in the book, the end round on the book\'s circle', () => {
  const P = makePack09({});
  assert.equal(P.id, 'sovev'); assert.equal(P.key, 'h132'); assert.equal(P.workLinks, true); assert.equal(P.quiet, true);
  for (const k of ['form', 'fill', 'strip', 'sikra']) { assert.ok(ACTS[k] && typeof ACTS[k].make === 'function', k); assert.ok(ACTS[k].title, k); }
  const st = (k, w) => { const s = ACTS[k].stand({ k, lv: 2 }, {}); assert.deepEqual([s.x, s.z], [...BOOK.s09.stand[w]], k); };
  st('form', 'w1'); st('fill', 'w2'); st('strip', 'w3'); st('sikra', 'w4');
  for (const [eye, aim] of endRound()) { assert.ok(Math.abs(Math.hypot(eye[0] - BOOK.s09.cam.end.c[0], eye[2] - BOOK.s09.cam.end.c[1]) - 40) < 1e-9); assert.equal(eye[1], 50); assert.equal(aim[1], 21); }
  for (const id of IDS) {
    const M = createH132(null); M.autoTo((m) => m.id === id); P.workSeed(M, id);
    assert.equal(M.mission() && M.mission().id, id, id);
    assert.equal(M.stageOf().lv, M.mission().lv);
  }
});

test('index.js: the stage-09 page, kind pages and links; stage 08\'s end card names stage 09 and leads into it', () => {
  const idx = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(idx, /const H9_WORK = workFlag\(\[\.\.\.PLAN08, \.\.\.PLAN09\]/);
  assert.match(idx, /const H132_ONLY = \['form', 'fill', 'strip', 'sikra'\]\.includes\(H9_ONLY\)/);
  assert.match(idx, /__H132_FULL/); assert.match(idx, /stage=9/);
  assert.match(idx, /if \(H109_ON && H132_ON\) \{ h32Only\(\); return; \}/);
  assert.match(idx, /function h32Begin\(\)/); assert.match(idx, /S\.beginDirected\(G, 'sovev'\)/);
  assert.match(idx, /השלב הבא: \$\{esc\(NEXT08\)\}/); assert.match(idx, /h32Begin\(\), 600/);
  assert.equal(NEXT08, 'הסובב וחוט הסיקרא');
  assert.deepEqual([...STAGE_FLOW], ['form2', 'fill2', 'strip2', 'sikra2']);
});
