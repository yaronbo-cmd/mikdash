// manifest132 (build 132): the inline web app manifest (src/manifest.js) and its icons (assets/icon). Run: node --test test/manifest132.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { manifestFor, folderOf, wantsManifest, addManifest, NAME } from '../src/manifest.js';

const ORIGIN = 'https://yaronbo-cmd.github.io';
const ICONS = { i192: 'data:image/png;base64,AAA', i512: 'data:image/png;base64,BBB', i512m: 'data:image/png;base64,CCC' };

test('manifestFor: the absolute folder of the page is id, start_url and scope (query and hash dropped)', () => {
  for (const [path, dir] of [['/mikdash/', '/mikdash/'], ['/mikdash/v/131/', '/mikdash/v/131/'], ['/mikdash/v/131/index.html?stage=8#pit1', '/mikdash/v/131/']]) {
    const m = manifestFor(ORIGIN + path, ICONS);
    assert.equal(m.id, ORIGIN + dir, path);
    assert.equal(m.start_url, ORIGIN + dir, path);
    assert.equal(m.scope, ORIGIN + dir, path);
    assert.ok(!/[?#]/.test(m.id + m.start_url + m.scope), path);
  }
  assert.equal(folderOf('http://localhost:8137/mikdash/v/131/index.html?x=1#y'), 'http://localhost:8137/mikdash/v/131/');
});

test('manifestFor: the fields', () => {
  const m = manifestFor(ORIGIN + '/mikdash/v/131/', ICONS);
  assert.equal(NAME, 'בית המקדש');
  assert.equal(m.name, 'בית המקדש'); assert.equal(m.short_name, 'בית המקדש');
  assert.equal(m.lang, 'he'); assert.equal(m.dir, 'rtl');
  assert.equal(m.display, 'fullscreen'); assert.equal(m.orientation, 'landscape');
  assert.equal(m.theme_color, '#2A2016'); assert.equal(m.background_color, '#2A2016');
  assert.deepEqual(m.icons.map((i) => [i.sizes, i.purpose, i.type]), [['192x192', 'any', 'image/png'], ['512x512', 'any', 'image/png'], ['512x512', 'maskable', 'image/png']]);
  assert.deepEqual(m.icons.map((i) => i.src), [ICONS.i192, ICONS.i512, ICONS.i512m]);
});

function fakeWin(href, { framed = false } = {}) {
  const head = { kids: [], appendChild(n) { this.kids.push(n); } };
  const w = {
    location: new URL(href),
    document: { head, querySelector: (s) => (s === 'link[rel="manifest"]' ? head.kids.find((k) => k.rel === 'manifest') || null : null), createElement: () => ({}) },
  };
  w.top = framed ? {} : w;
  return w;
}

test('addManifest: only the page\'s own window, only over http(s), once', () => {
  assert.equal(wantsManifest(fakeWin('file:///home/x/dist/play.html')), false);
  assert.equal(wantsManifest(fakeWin('https://claude.ai/artifact/x', { framed: true })), false);
  assert.equal(wantsManifest(fakeWin('http://localhost:8137/mikdash/v/131/')), true);
  assert.equal(addManifest(fakeWin('file:///home/x/dist/play.html'), ICONS), null);
  assert.equal(addManifest(fakeWin(ORIGIN + '/mikdash/v/131/', { framed: true }), ICONS), null);
  const w = fakeWin(ORIGIN + '/mikdash/v/131/index.html?stage=8#pit1');
  const l = addManifest(w, ICONS);
  assert.equal(l.rel, 'manifest');
  assert.ok(l.href.startsWith('data:application/manifest+json,'));
  const m = JSON.parse(decodeURIComponent(l.href.slice('data:application/manifest+json,'.length)));
  assert.equal(m.start_url, ORIGIN + '/mikdash/v/131/');
  assert.equal(addManifest(w, ICONS), null, 'a second call adds nothing');
  assert.equal(w.document.head.kids.length, 1);
});

test('the icons: PNGs of 192, 512 and 512 (maskable), each under 20 KB, and the SVG they are drawn from', () => {
  for (const [f, n] of [['mikdash-192.png', 192], ['mikdash-512.png', 512], ['mikdash-512-maskable.png', 512]]) {
    const b = fs.readFileSync(new URL('../assets/icon/' + f, import.meta.url));
    assert.equal(b.toString('latin1', 1, 4), 'PNG', f);
    assert.equal(b.readUInt32BE(16), n, f + ' width'); assert.equal(b.readUInt32BE(20), n, f + ' height');
    assert.ok(b.length < 20 * 1024, `${f}: ${b.length} B`);
  }
  const svg = fs.readFileSync(new URL('../assets/icon/mikdash.svg', import.meta.url), 'utf8');
  assert.ok(!/<text\b/.test(svg), 'no text in the icon');
  assert.ok(svg.includes('#2A2016'));
});
