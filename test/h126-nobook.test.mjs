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
  // stage 01 (build 127: every place read from the book): what the scan still finds is no place
  ['h109/acts.js', 1, 'the rope act\'s closing shot: offsets from the book\'s square (+120 east, height 360; +260 south of it)'],
  ['h109/acts2.js', 7, 'a crack\'s point count (46), the tally\'s canvas (34 px apart, 10..54 px), the hand\'s screen offsets (0, −70 | −40 | −60; 40, −10)'],
  ['h109/acts3.js', 62, 'the inscription\'s letter strokes in the canvas\'s own units (GLYPH, 40); geometry segments (torus 0.11, 6, 36; rings 32 | 40); canvas sizes and boxes (512 × 256, 22, 468, 10, 492, the chalk tag 128, 70, the face\'s margin 36); dust (count, spread) ×2; the hand\'s screen offsets (0, 40 ×2 | 0, −70); the carving\'s tolerance px (30, 24, 18) and canvas points (50, 70; the half width cw / 2, 120); the aim\'s drag gain and limit (0.0032, −125°)'],
  ['h109/director.js', 13, 'the overview\'s lift (520 back, 360 high, from the work: offsets); haptic patterns (ms) ×4; the lift\'s height clamp (60..180); the glow\'s canvas (32, 32, 64 px); spark counts; the loss cap (0..80 points); the stars\' bonus points (0, 50, 100, 200); the frame step clamp (s)'],
  ['h109/grips.js', 1, 'the grip radius\'s floor and share of the screen (44 px, 0.15) — no place'],
  ['h109/props.js', 1, 'a ring geometry\'s segments (2, 48) — no place'],
  // stage 05 (build 127: every place read from the book): what the scan still finds is no place
  ['h120/acts.js', 3, 'the column act\'s wide shot and its view cone, offsets in the column\'s own frame (along 1.8, across 55, height 13) ×2; dust (count, spread)'],
  ['h120/acts2.js', 5, 'the measuring cord\'s and the chalk line\'s rope (segments, thickness) ×2; the reach and stroke in screen px (clamp 130..260, 110..220, 120..260)'],
  ['h120/acts3.js', 3, 'the way\'s framing size (36 × 22 amot, a size); the grip and stroke in screen px (44..70, 120..260)'],
  ['h120/acts4.js', 3, 'the gold glow\'s canvas gradient (32, 32, 0 / 32, 32, 32) and its 64 px square'],
  ['h120/acts5.js', 2, 'the hand\'s screen offset (0, −40 px); the drag\'s reach in px (90, 0.2 of the screen)'],
  ['h120/film.js', 53, 'the night film: not touched in build 127 — it is being replaced by a video made in another thread'],
  ['h120/filmsound.js', 15, 'the night film\'s sound: not touched in build 127 — it is being replaced by a video made in another thread'],
  ['h120/look120.js', 2, 'the tops (heights, y) of the court\'s walls as the world builds them: no x or z'],
  ['h120/routes.js', 2, 'LANE_Z and LANE_X: stretches along the lane in amot from its outer end (distances along a book place, not world x/z)'],
  ['h120/sound120.js', 11, 'the water\'s sound: filter frequencies, Q values, the drops\' times and pitches (Hz)'],
  ['h120/water120.js', 1, 'a ripple ring\'s geometry (radius 1.0, 40 segments)'],
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

// ── h128 ── (build 128) stage 06: its files read every place from the book (BOOK.s06); what the scan finds is no place
const ALLOW128 = [
  ['h128/model.js', 3, 'angles in degrees: the bolts\' turns (720, 1080), the leaves\' open angle (90, 90) and its clamp (0, 90)'],
  ['h128/look.js', 2, 'the look sample\'s timeline in seconds (the storm eases 28..31, the break opens 28..32)'],
  ['h128/sea3d.js', 17, 'sizes, not places: the camera\'s field of view (50) and the sample point count; fog distances (120..1500, 160/60, 1600/520); geometry segments (sky 32 × 16, tubes 30/32/40 × 4..7, the env sphere 100 × 24 × 12 and its near/far 0.5/400); canvas sizes in px (256, 512, 128, the sail\'s 16 px seams); the hammered map\'s size and seed (128, 7); the crew\'s swell reach (30 amot, squared)'],
];
test('stage 06: no world place typed outside the book but the listed exceptions', () => {
  const hits = scanDirs(ROOT, ['h128']), by = new Map();
  for (const h of hits) by.set(h.file, [...(by.get(h.file) || []), h]);
  const allow = new Map(ALLOW128.map(([f, n]) => [f, n]));
  for (const [f, L] of by) assert.equal(L.length, allow.get(f) ?? 0, `${f}: ${L.map((h) => h.line + ' ' + h.text).join(' | ')}`);
  for (const [f, n] of allow) assert.equal((by.get(f) || []).length, n, `${f}: the allow list counts ${n}`);
});
// ── /h128 ──
