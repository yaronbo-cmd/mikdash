// build 132, ירון's rule: return visits IN THE WORLD — after round 1 and its end card the four stations of stage 09 stay open, each at its
// own next level; a visit plays from its work's pre-state; after it the world is the built one again, the best play of the work kept
// (its stars, its flaws, and for the line the red line itself). Only a pack that says visits (stage 09); the older stages unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createH132, STAGE_FLOW, blockBefore } from '../src/game/h132/model.js';

const round1 = (M) => { for (const id of STAGE_FLOW) { M.pick(id); M.done({ stars: 3, pts: 100 }); } };

test('after round 1 every station offers its own next level; each visit raises it, up to 3', () => {
  const M = createH132(); round1(M);
  assert.equal(M.finished(), true); assert.deepEqual(M.open().map((m) => m.id), ['form2', 'fill2', 'strip2', 'sikra2']);
  M.pick('fill2'); assert.equal(M.block(), blockBefore('fill'), 'the visit plays from the fill\'s own pre-state'); M.done({ stars: 3, pts: 980 });
  assert.equal(M.block(), 'filled', 'h132: its after-film shows the filled frame'); M.filmOver();
  assert.equal(M.block(), 'lined', 'after it: the built world');
  assert.deepEqual(M.open().map((m) => m.id), ['form2', 'fill3', 'strip2', 'sikra2']);
  M.pick('fill3'); M.done({ stars: 2, pts: 800 }); assert.equal(M.visitOf('fill').id, 'fill3', 'after the last level it stays there');
  assert.deepEqual([...M.st.done].sort(), ['fill1', 'fill2', 'fill3', 'form1', 'sikra1', 'strip1']);
});
test('a worse visit leaves the world as it was: the kind\'s flaws and the red line of its best play come back', () => {
  const M = createH132(); round1(M);
  M.st.sikra.line = { tag: 'best' }; M.st.flaws.push({ f: 'sikra.drip', work: 'sikra1' });
  M.pick('sikra2'); assert.equal(M.st.flaws.some((x) => x.f === 'sikra.drip'), false, 'set aside while it plays');
  M.st.sikra.line = { tag: 'worse' }; M.flaw('sikra.gap'); M.flaw('sikra.blot');
  M.done({ stars: 1, pts: 10 });
  assert.deepEqual(M.st.sikra.line, { tag: 'best' }); assert.deepEqual(M.flaws().map((x) => x.f), ['sikra.drip']);
  assert.equal(M.st.res.sikra2.stars, 1, 'the level is played (its own result kept)');
  // a better one keeps its own line and flaws
  M.pick('sikra3'); M.st.sikra.line = { tag: 'new' }; M.done({ stars: 3, pts: 1100 });
  assert.deepEqual(M.st.sikra.line, { tag: 'new' }); assert.deepEqual(M.flaws().filter((x) => x.f.startsWith('sikra')), []);
});
test('a visit given back (he walked away) puts back what it set aside', () => {
  const M = createH132(); round1(M); M.st.sikra.line = { tag: 'best' }; M.st.flaws.push({ f: 'fill.bulge', work: 'fill1', wall: 'E' });
  M.pick('fill2'); assert.equal(M.flaws().length, 0); M.pick(null);
  assert.deepEqual(M.flaws().map((x) => x.f), ['fill.bulge']); assert.equal(M.st.stash, null); assert.equal(M.mission(), null);
});
test('the director: visits only for a pack that says so; the stage\'s close never runs again; the stations named with their level', () => {
  const D = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(D, /if \(M\.finished\(\) && !VIS\.on\) \{ mission = null; finishStage\(\); return; \}/);
  assert.match(D, /visits: \(\) => \{\n\s+if \(!PK\.visits\) return false;/);
  assert.match(D, /VIS\.on = true; closing = true;/);
  assert.match(D, /if \(VIS\.on && VIS\.from\) \{/, 'no work starts under his feet');
  assert.match(D, /const lvTag = \(m\) => \(VIS\.on && PK\.visits && m && m\.lv \? ` · רמה \$\{m\.lv\}` : ''\);/);
  const P9 = readFileSync(new URL('../src/game/h132/pack.js', import.meta.url), 'utf8'); assert.match(P9, /\n\s+visits: true,/);
  for (const f of ['../src/game/h131/pack.js']) assert.doesNotMatch(readFileSync(new URL(f, import.meta.url), 'utf8'), /visits:/, f + ': unchanged');
  const I = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(I, /function h32Visits\(\)/); assert.match(I, /h32Visits\(\); \}\);/);
  assert.match(P9, /if \(M\.finished\(\) && !M\.mission\(\)\) finalWorld\(X\);/);
});
test('no in-between game\'s card after stage 09: it came up over a visit\'s work', () => {
  const I = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(I, /else if \(c\.id === 'sovev'\) \{ \/\* ── h132 ── \(stage 09: no in-between game's card/);
});
test('the in-between games\' card and chip keep away while stage 09\'s visits are open', () => {
  const S = readFileSync(new URL('../src/games/index.js', import.meta.url), 'utf8');
  assert.match(S, /typeof D\.visiting === 'function' && D\.visiting\(\) && D\.owns && D\.owns\(\)/);
});
