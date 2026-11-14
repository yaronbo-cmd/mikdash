// build 127 (rule 65): every world-place hit that stages 01 and 05 typed outside the book at fb94fd8 (test/h127-before.json, from
// tools/moved127.mjs) is accounted for: still in its own file (and counted on test/h126-nobook.test.mjs's allow list), or the very same
// literals inside an `── h127 ──` block of world/grid.js, or a place the book already held (moved127.mjs REUSE: the book's key for each
// number, and the same number there). A tuple that vanished or changed a digit fails.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkMoved, litsOf, REUSE } from '../tools/moved127.mjs';
import { BOOK } from '../src/game/world/grid.js';

const before = JSON.parse(readFileSync(new URL('./h127-before.json', import.meta.url), 'utf8'));

test('the before-list is the scan of h109 and h120 at fb94fd8 (360 hits)', () => {
  assert.equal(before.length, 360);
  assert.ok(before.every((h) => /^h(109|120)\//.test(h.file) && litsOf(h.text).length >= 1));
});

test('every tuple of the before-list stays, is in an h127 block of the book with the same literals, or is a place the book held', () => {
  const r = checkMoved(before, BOOK), lost = r.filter((h) => h.how === 'LOST');
  assert.deepEqual(lost.map((h) => `${h.file}:${h.line} ${h.text}`), []);
  // the film and its sound are not touched at all
  for (const h of r) if (/h120\/film(sound)?\.js$/.test(h.file)) assert.equal(h.how, 'stays', `${h.file}:${h.line}`);
});

test('every REUSE line names a hit of the before-list', () => {
  for (const [f, t] of REUSE) assert.ok(before.some((h) => h.file === f && h.text === t), `${f} ${t}`);
});
