// build 128: the whole-stage page's fresh game must not be paid the builders' account on its next load (510 → 3,010 after a reload)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageBuilt, PACKED, frontier, frontLine } from '../src/game/h128/page.js';
import { stageById } from '../src/game/content.js';

const IDS = ['har', 'wall', 'sorag', 'gates', 'nashim'];
// the builders' account's own rule (src/game/index.js scoreLegacy): a done stage without its 'stage:' or 'legacy:' flag pays 500
const legacy = (G) => Object.keys(G.st).filter((id) => G.st[id].done && !G.scf['stage:' + id] && !G.scf['legacy:' + id]).length * 500;

test('the stage-06 page flags its five done stages: the builders account pays nothing after a reload', () => {
  const G = { st: Object.fromEntries(IDS.map((id) => [id, { done: true }])), scf: {} };
  assert.equal(legacy(G), 2500);                      // (the bug: what a reload paid)
  assert.deepEqual(pageBuilt(G, IDS), IDS);
  assert.equal(legacy(G), 0);
  assert.deepEqual(pageBuilt(G, IDS), []);            // (once)
  assert.deepEqual(pageBuilt({ st: {} }, ['har']), ['har']);   // (an old save without scf)
});

test('index.js: h28Only calls pageBuilt, and scoreLegacy still reads the same flags', () => {
  const src = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  const h28 = src.slice(src.indexOf('function h28Only()'), src.indexOf('function h28Only()') + 900);
  assert.match(h28, /pageBuilt\(G, \['har', 'wall', 'sorag', 'gates', 'nashim'\]\)/);
  assert.match(src, /G\.scf\['stage:' \+ id\]\) && !\(G\.scf && G\.scf\['legacy:' \+ id\]\)/);
});

// the owner 15.11: after the last stage a pack owns, the old game does not take the next stage over; one card names the next stage
test('the frontier: only when every packed stage is done; the card names the next stage from the stage table', () => {
  const done = new Set(PACKED.slice(0, -1));
  const S = { isDone: (G, id) => done.has(id), recommend: () => ({ id: 'lishka' }) };
  assert.equal(frontier({}, S), false);
  done.add(PACKED[PACKED.length - 1]);
  assert.equal(frontier({}, S), true);
  assert.equal(frontLine({}, S, stageById), `עד כאן בנוי המשחק · השלב הבא: ${stageById('lishka').n} (בבנייה)`);
  assert.equal(frontLine({}, { ...S, recommend: () => ({}) }, stageById), 'עד כאן בנוי המשחק');
});

test('index.js: the old game entries stop at the frontier, and the old right pad is hidden in the director game', () => {
  const src = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  for (const f of ['function onSiteTap', 'function startBuild', 'async function playLevel', 'async function runMoment', 'function nextLabel', 'act.jobPill = ']) {
    const i = src.indexOf(f); assert.ok(i > 0, f);
    assert.match(src.slice(i, i + 400), /frontier\(G, S\)/, f);
  }
  assert.match(src, /if \(H109_ON\) noPad\(\);/);
});
