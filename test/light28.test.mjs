// LIGHT28 (WAVE28): nearDim, the label zone's claim (clamp + stack), the blessing's three verses (never a Name; the patterns from \u escapes).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { nearDim, NEAR, claim, zone } from '../src/light28.js';
import { BIRKAT_VERSES, BIRKAT_SRC } from '../src/avodah/works/birkat28.js';

const NAME = new RegExp([0x05D9, 0x05D4, 0x05D5, 0x05D4].map((c) => String.fromCharCode(c)).join('[\\u0591-\\u05C7]*'));
const HASHEM = String.fromCharCode(0x05D4, 0x05F3);

test('nearDim: full at 40 amot, 0.12 at 6 and nearer, linear between', () => {
  const cam = { position: { x: 0, y: 0, z: 0 } };
  assert.equal(nearDim({ x: 0, y: 0, z: 40 }, cam), 1);
  assert.equal(nearDim({ x: 0, y: 0, z: 400 }, cam), 1);
  assert.equal(nearDim([0, 6, 0], cam), NEAR.min);
  assert.equal(nearDim([0, 1, 0], cam), NEAR.min);
  const mid = nearDim([0, 0, 23], cam); assert.ok(Math.abs(mid - (0.12 + 0.88 * 0.5)) < 1e-9, String(mid));
  assert.equal(nearDim([0, 0, 1]), 1, 'no camera registered: no dim');
});

test('claim: clamped into the zone, later labels shift down off the earlier ones (no DOM: the whole screen less 8 px)', () => {
  const z = zone(); assert.ok(z.top >= 8 && z.bottom <= z.H - 8);
  const a = claim(400, -50, 100, 30, 'a'); assert.ok(a.y - 15 >= z.top, 'clamped under the top');
  const b = claim(410, a.y, 100, 30, 'b'); assert.ok(b.y - 15 >= a.y + 15, 'stacked under the first');
  const c = claim(900, 2000, 100, 30, 'c'); assert.ok(c.y + 15 <= z.bottom && c.x + 50 <= z.W, 'clamped over the foot and into the width');
});

test('ברכת כהנים: the three verses in full, each with the abbreviation and never the Name; the source', () => {
  assert.equal(BIRKAT_VERSES.length, 3);
  assert.equal(new Set(BIRKAT_VERSES).size, 3);
  for (const v of BIRKAT_VERSES) { assert.ok(v.includes(HASHEM), v); assert.ok(!NAME.test(v)); assert.ok(v.split(' ').length >= 3); }
  assert.ok(BIRKAT_VERSES[2].split(' ').length >= 7, 'the third verse whole');
  assert.match(BIRKAT_SRC, /במדבר ו/);
  for (const f of ['src/avodah/works/birkat28.js', 'src/avodah/works/tamid.js', 'src/avodah/day/index.js', 'src/light28.js']) assert.ok(!NAME.test(fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8')), f);
  // (the abbreviation is written in one file only: the verses' own)
  for (const f of ['src/avodah/works/tamid.js', 'src/avodah/works/places24.js', 'src/avodah/day/index.js']) assert.ok(!fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8').includes(HASHEM), f);
});

test('the kiyor: no 3D "n/12 דדים" over the rim (the HUD chip has the count)', () => {
  const src = fs.readFileSync(new URL('../src/avodah/works/kiyor.js', import.meta.url), 'utf8');
  assert.ok(!/labelW\(k, `\$\{S\.spouts\}\/\$\{SPOUTS\} דדים`/.test(src));
  assert.ok(/B\.ui\.count\(`\$\{S\.spouts\}\/\$\{SPOUTS\}`, 'דדים'\)/.test(src), 'the chip stays');
});
