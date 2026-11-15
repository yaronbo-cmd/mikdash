// build 128: the whole-stage page's fresh game must not be paid the builders' account on its next load (510 → 3,010 after a reload)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pageBuilt } from '../src/game/h128/page.js';

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
