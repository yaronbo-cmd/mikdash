// build 126 (rule 65, ירון 13.11: "הכול יושב על העולם. לא ההפך בשום מקרה"): no stage file of h109, h111, h112, h113, h120 may type a
// world place of its own — the book (world/grid.js BOOK) holds them. tools/nobook126.mjs finds two or three numeric literals in a row
// with one 30 or more from the origin, or an x/z key with such a literal. Its honest exceptions are listed here per file with their
// exact count, so a new place typed anywhere fails this test (and a moved one must lower the count). Every line is reported.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanDirs, scanSource } from '../tools/nobook126.mjs';

const ROOT = new URL('../src/game/', import.meta.url);
// [file, count, why]
const ALLOW = [
  // stages 02–04: nothing left that is a place — screen offsets and sizes the scan cannot tell from one
  ['h111/acts2.js', 4, 'the hand\'s screen offset (0, −46 px), dust (count, spread) twice, a camera offset along the stretch\'s own frame (F.at)'],
  ['h111/bond.js', 3, 'the crane wheel\'s torus segments (0.12, 6, 36), the grip ring\'s geometry (0.85, 1, 40), the hand\'s screen offset (50, 0)'],
  ['h111/stakes.js', 2, 'the rope\'s length and thickness (36, 0.16), the hand\'s screen offset (40, −24)'],
  ['h112/acts.js', 4, 'the hand\'s screen offsets (46|50|60 px, 0)'],
  ['h112/acts2.js', 4, 'the hand\'s screen offsets (−52|50|60 px, 0), dust (count, spread)'],
  ['h112/world.js', 1, 'the warning slab\'s canvas text sizes (96, 70, 64 px)'],
  ['h113/acts.js', 2, 'the hand\'s screen offsets (40|70 px, 0)'],
  ['h113/acts2.js', 3, 'dust (count, spread), the hand\'s screen offsets (0, −40), (0, 30)'],
  ['h113/acts3.js', 13, 'the hand\'s screen offsets (±40..70 px), dust, the key\'s canvas (0.4, 420), a ring geometry (70, 0, 1)'],
  ['h113/pack.js', 4, 'the lintel\'s growth scale (0.01, 40); gateShot\'s seconds, height and distance from the gate (2.4, 40, 22) ×3'],
  ['h113/world.js', 1, 'the derrick wheel\'s torus segments (0.12, 6, 36)'],
  // stage 01: audited in build 126, not moved (its whole-stage replay does not fit before the stop); the list is in the hand-back
  ['h109/acts.js', 5, 'stage 01 audit: the rope\'s line, a rock shot, hand offsets — not moved in build 126'],
  ['h109/acts2.js', 7, 'stage 01 audit: the read/pave/waste shots and stands — not moved in build 126'],
  ['h109/acts3.js', 95, 'stage 01 audit: the corner, the courses, the great stone and the letters — places and shots; not moved in build 126'],
  ['h109/director.js', 28, 'stage 01 audit: its pack (the film, the night, the opening) lives in the director — not moved in build 126'],
  ['h109/grips.js', 1, 'the grip radius\'s floor and share of the screen (44 px, 0.15) — no place'],
  ['h109/model.js', 3, 'stage 01 audit: PLACES.letters (x −281, z 383, face −300, 400) beside the book\'s letters — not moved in build 126'],
  ['h109/props.js', 1, 'a ring geometry\'s segments (2, 48) — no place'],
  // stage 05: must not change in build 126 (its own brief); its film, routes and sounds keep their coordinates
  ['h120/acts.js', 11, 'stage 05 unchanged'], ['h120/acts2.js', 5, 'stage 05 unchanged'], ['h120/acts3.js', 3, 'stage 05 unchanged'],
  ['h120/acts4.js', 3, 'stage 05 unchanged'], ['h120/acts5.js', 4, 'stage 05 unchanged'], ['h120/film.js', 53, 'stage 05 unchanged'],
  ['h120/filmsound.js', 15, 'stage 05 unchanged'], ['h120/load.js', 1, 'stage 05 unchanged'], ['h120/look120.js', 2, 'stage 05 unchanged'],
  ['h120/model.js', 23, 'stage 05 unchanged'], ['h120/pack.js', 18, 'stage 05 unchanged'], ['h120/routes.js', 67, 'stage 05 unchanged'],
  ['h120/sound120.js', 11, 'stage 05 unchanged'], ['h120/water120.js', 1, 'stage 05 unchanged'], ['h120/world.js', 3, 'stage 05 unchanged'],
];

test('the scan finds a typed place and leaves sizes alone', () => {
  assert.equal(scanSource('X.shot([-95, 330, 72], [-95, 0, -14]);').length, 2);
  assert.equal(scanSource('const p = { x: -126, z: 4 };').length, 1);
  assert.equal(scanSource('box(0.7, 20, D, 4.65, 10, 0); // [-95, 0]').length, 0);
  assert.equal(scanSource("X.line('at -95, 0 there');").length, 0);
});

test('stages 01–05: no world place typed outside the book but the listed exceptions', () => {
  const hits = scanDirs(ROOT, ['h109', 'h111', 'h112', 'h113', 'h120']), by = new Map();
  for (const h of hits) by.set(h.file, [...(by.get(h.file) || []), h]);
  const allow = new Map(ALLOW.map(([f, n]) => [f, n]));
  for (const [f, L] of by) assert.equal(L.length, allow.get(f) ?? 0, `${f}: ${L.map((h) => h.line + ' ' + h.text).join(' | ')}`);
  for (const [f, n] of allow) assert.equal((by.get(f) || []).length, n, `${f}: the allow list counts ${n}`);
});
