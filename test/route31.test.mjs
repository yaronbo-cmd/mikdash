// ── route31 ── ROUTE31: the true routes' data — the order, the sources, the parts never red or anatomical, no Divine Name — node.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ROUTES31, STATIONS31, LAVER31, SRC31, mentorLines, PARTS31, PART_KINDS, SLICE31, KEN_MARK31, OLAH_MARK31, actPts31 } from '../src/avodah/shift/route31.js';
import { STATIONS, ACT, LIVE31 } from '../src/avodah/shift/stations.js';
import { ROUTES } from '../src/avodah/shift/pilgrims.js';
import { isRed, isRedHue } from '../src/avodah/works/blood.js';
import { HEICHAL_DOOR, ULAM } from '../src/places.js';

test('the routes: עולה five acts, מנחה three, קן two; the laver is not in them (the kohen\'s own, once)', () => {
  assert.deepEqual([...ROUTES31.olah], ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh']);
  assert.deepEqual([...ROUTES31.mincha], ['hagasha', 'kemitza', 'haktara']);
  assert.deepEqual([...ROUTES31.ken], ['melika', 'mitzui']);
  assert.equal(ROUTES, ROUTES31);
  for (const t in ROUTES31) assert.ok(!ROUTES31[t].includes('kiyor'), t);
  assert.equal(LAVER31.once, true); assert.ok(/פעם אחת/.test(LAVER31.label));
});
test('every station: a verb the act knows, a source, a place in the court east of the Ulam, a chip', () => {
  const VERBS = ['tapOn', 'slice', 'drag', 'tap3', 'holdWalk', 'hold', 'tapBeat', 'dragDown'];
  for (const id in STATIONS31) {
    const s = STATIONS31[id];
    assert.ok(VERBS.includes(s.verb), id); assert.ok(s.src && s.src.length > 6, id); assert.ok(s.label && s.verb31 === s.label, id);
    assert.ok(Number.isFinite(s.at.x) && Number.isFinite(s.stand.z), id);
    assert.ok(s.stand.x > ULAM.x1 && s.at.x > HEICHAL_DOOR.x1, `${id}: never past the Heichal's door`);
    assert.equal(STATIONS[id], s); assert.ok(LIVE31.includes(id));
  }
  assert.equal(STATIONS31.shechita.verb, 'slice'); assert.equal(STATIONS31.kevesh.verb, 'holdWalk'); assert.equal(STATIONS31.mitzui.verb, 'dragDown');
  assert.ok(/זבחים ה, ד/.test(SRC31.samicha) && /תמיד ד/.test(SRC31.nituach) && /מנחות ה, ה/.test(SRC31.hagasha) && /מנחות א, ב/.test(SRC31.kemitza) && /זבחים ו/.test(SRC31.mitzui));
  assert.ok(/המחשה/.test(SRC31.samicha) && /המחשה/.test(SRC31.kemitza), 'the pose and the hand: המחשה');
});
test('the acts\' measures: the slice ≥ 60 px within 300 ms; every act ≤ 4 s', () => {
  assert.equal(SLICE31.px, 60); assert.equal(SLICE31.ms, 300); assert.ok(ACT.max <= 4);
});
test('the marks per DAM25: the olah below the line (NE); the bird\'s olah above it (SE)', () => {
  assert.deepEqual({ ...OLAH_MARK31 }, { corner: 'NE', level: 'lower' }); assert.deepEqual({ ...KEN_MARK31 }, { corner: 'SE', level: 'upper' });
});
test('the parts: pale abstract shapes (slab · round · long), never red, never a named organ', () => {
  assert.ok(PARTS31.length >= 4);
  for (const p of PARTS31) {
    assert.ok(PART_KINDS.includes(p.kind), p.kind); assert.equal(isRedHue(p.hex), false, p.hex);
    const n = parseInt(p.hex.slice(1), 16), l = ((n >> 16) + ((n >> 8) & 255) + (n & 255)) / 3; assert.ok(l > 200, `${p.hex} pale`);
  }
  const src = fs.readFileSync(new URL('../src/avodah/shift/route31.js', import.meta.url), 'utf8');
  for (const w of ['heart', 'liver', 'leg', 'head', 'כבד', 'לב ', 'ראש הטלה']) assert.ok(!new RegExp(`PARTS31[^;]*${w}`).test(src), w);
});
test('no red outside BLOOD in the route\'s code (route31.js and the stations\' route31 fences)', () => {
  for (const f of ['route31', 'stations']) {
    const s = fs.readFileSync(new URL(`../src/avodah/shift/${f}.js`, import.meta.url), 'utf8');
    for (const m of s.matchAll(/#[0-9A-Fa-f]{6}\b/g)) assert.equal(isRed(m[0]), false, `${f}: ${m[0]}`);
  }
});
test('the act points: none at the slaughter (DAM25 §2.4); gold 3, good 2', () => {
  assert.equal(actPts31('shechita', 1, true), 0); assert.equal(actPts31('zerika', 1, true), 3); assert.equal(actPts31('nituach', 0.8, false), 2); assert.equal(actPts31('kevesh', 0.4, false), 1);
});
test('the mentor\'s fold: the laver first, one line per station of the routes played', () => {
  const m = mentorLines(['olah', 'ken', 'mincha']);
  assert.equal(m.length, 1 + 5 + 2 + 3); assert.ok(/^הכיור/.test(m[0]));
  assert.equal(mentorLines(['olah']).length, 6);
});
test('no Divine Name in route31.js', () => {
  const N = [String.fromCharCode(0x5d4, 0x5f3), String.fromCharCode(0x5d0, 0x5dc, 0x5e7, 0x5d9, 0x5dd), String.fromCharCode(0x5d0, 0x2d, 0x5dc), String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4), String.fromCharCode(0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5dd)];
  const s = fs.readFileSync(new URL('../src/avodah/shift/route31.js', import.meta.url), 'utf8');
  for (const n of N) assert.ok(!s.includes(n));
});
// ── /route31 ──
