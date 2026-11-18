// present132 (build 132; the owner, 18.11): on the lighter page (LINE=new) the menu keeps "הצצה: העבודה בבית" and "סיור בבית
// המקדש" as links to the presentation version (src/game/present.js), and the avodah modules stay out of the bundle.
// Run: node --test test/present132.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PRESENT_URL, PRESENT_HINT, presentHref } from '../src/game/present.js';
import { deepLinkOf } from '../src/deeplink.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('presentHref: the presentation version and the right hash, which that page opens', () => {
  assert.equal(PRESENT_URL, 'https://yaronbo-cmd.github.io/mikdash/v/131/');
  assert.equal(presentHref('preview'), PRESENT_URL + '#hatzaga');
  assert.equal(presentHref('tour'), PRESENT_URL + '#siyur');
  assert.equal(deepLinkOf(new URL(presentHref('preview')).hash), 'preview');
  assert.equal(deepLinkOf(new URL(presentHref('tour')).hash), 'tour');
});

test('the address is written in one place only (src/game/present.js)', () => {
  const hits = [];
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = d + '/' + f.name; if (f.isDirectory()) walk(p); else if (/\.js$/.test(f.name) && fs.readFileSync(p, 'utf8').includes('yaronbo-cmd.github.io')) hits.push(p.slice(ROOT.length)); } };
  walk(ROOT + 'src');
  assert.deepEqual(hits, ['src/game/present.js']);
});

test('the menu (ui.js): on LINE=new both entries are <a target=_blank rel=noopener> links, in the same places and classes', () => {
  const ui = fs.readFileSync(ROOT + 'src/game/ui.js', 'utf8');
  const ent = ui.slice(ui.indexOf('const ent = '), ui.indexOf('const hint = '));
  assert.ok(/<a class="\$\{cls\}" href="\$\{esc\(presentHref\(kind, PU\)\)\}" target="_blank" rel="noopener"/.test(ent));
  assert.ok(!/window\.open/.test(ent), 'a real link, not window.open (artifact pages block it)');
  assert.ok(ui.includes("ent('gm-btn gm-btn-gold gm-btn-block', 'data-a=\"avodah\"', 'preview'"));
  assert.ok(ui.includes("ent('gm-btn gm-btn-block', 'data-a=\"scenes\" data-k=\"tour\"', 'tour'"));
  assert.ok(ui.indexOf("'preview', `${ICON.star}") < ui.indexOf("'tour', `${ICON.star}"), 'the preview first, the tour under it');
});
// (the bundle's check — LINE=new's links in, Phase B out — is in test/build132.test.mjs: one file builds, so runs never race on dist/)
