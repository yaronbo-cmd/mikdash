// deep132 (build 132): the presentation links #hatzaga (the Phase B preview) and #siyur (the tour) — src/deeplink.js, and that
// they never meet the works' links (h109/director.js workFlag). Run: node --test test/deep132.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deepLinkOf, DEEP_LINKS } from '../src/deeplink.js';
import { workFlag } from '../src/game/h109/director.js';

test('deepLinkOf: the two names, exactly', () => {
  assert.equal(deepLinkOf('#hatzaga'), 'preview');
  assert.equal(deepLinkOf('#siyur'), 'tour');
  assert.equal(deepLinkOf('hatzaga'), 'preview');
  for (const h of ['', '#', '#pit1', '#form2', '#work=pit1', '#avodah', '#shift', '#demo', '#stage=8', '#hatzaga2', '#siyur=1', '#Hatzaga', '#toString', '#constructor', null, undefined])
    assert.equal(deepLinkOf(h), null, String(h));
});

test('the works\' links and the presentation links do not meet', () => {
  const ids = ['pit1', 'form2', 'pour1'];
  for (const h of Object.keys(DEEP_LINKS)) {
    assert.ok(!ids.includes(h));
    assert.deepEqual(workFlag(ids, { hash: '#' + h, search: '' }), { id: null, asked: null }, h + ': no work page, no warning');
  }
  assert.deepEqual(workFlag(ids, { hash: '#pit1', search: '' }), { id: 'pit1', asked: null });
  assert.equal(deepLinkOf('#pit1'), null);
});

test('main.js: startGame takes the link first, uses it once, through the menu\'s own calls', () => {
  const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const at = src.indexOf('function startGame() {'), blk = src.slice(at, src.indexOf('// ── /deep132 ──', at));
  assert.ok(blk.includes('deepLinkOf(location.hash)'));
  assert.ok(blk.indexOf('history.replaceState') < blk.indexOf("startAvodah('')"), 'the hash cleared before Phase B opens');
  assert.ok(blk.includes("window.__openScenes('tour')"), 'the tour as the menu opens it');
  assert.ok(blk.includes("startAvodah('')"), 'the preview as the menu opens it (hooks.enterAvodah)');
});
