// build 132, review P5: each stage 09 work feeds its own craft (the form and the strip the carpenters, the fill its fillers, the line
// the measurers — not the quarrymen, the director's default), and its level-up is one line in the top strip, not the stamp over the view
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CRAFTS } from '../src/game/craftxp.js';

const src = (f) => readFileSync(new URL('../src/game/' + f, import.meta.url), 'utf8');
test('crafts: every hit of a stage 09 work names its craft', () => {
  for (const [f, c] of [['h132/form.js', 'נגרים'], ['h132/strip.js', 'נגרים'], ['h132/sikra.js', 'מודדים'], ['h132/fill.js', 'ממלאים']]) {
    const hits = src(f).match(/X\.hit\([^;]*?\)/g) || [];
    assert.ok(hits.length > 0, f);
    for (const h of hits) assert.ok(h.includes(`craft: '${c}'`), f + ': ' + h);
  }
  assert.ok(CRAFTS['נגרים'] && CRAFTS['מודדים']);
});
test('crafts: the stage asks for the strip, the director passes it, the juice says it in the banner alone', () => {
  assert.match(src('h132/pack.js'), /upStrip: true/);
  assert.match(src('h109/director.js'), /flushUps\([^)]*PK\.upStrip \? \{ strip: true \}/);
  const j = src('juice.js'), i = j.indexOf('flushUps(why, o2)'), body = j.slice(i, i + 900);
  assert.ok(i > 0); assert.match(body, /if \(o2 && o2\.strip\) call\(ui\.banner/);
});
test('end: stage 09 says one gold title — the game\'s stage-done celebration is not shown over the director\'s own', () => {
  const s = src('index.js'), i = s.indexOf("type === 'stageDone' && d && !d.skipped && !stageById");
  assert.ok(i > 0); assert.match(s.slice(i, i + 300), /d\.id !== 'sovev'/);
});
