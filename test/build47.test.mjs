// ── fable32 (build 47) ── stage 04, שערי העזרה, the new way (docs/specs/shlav-alef-v2-he.md §10 "04", §2 the two-crane lintel, §5 the door
// leaf on its pivot — the FIT family opens): taps alone never finish the lintel or the leaf; the balance rule (the slide against the crews'
// drift keeps the bubble in; out of the tube the crews stop); both ends on the posts; the swing test (free and soft מהודר; bound — the wedge;
// a slam a correction; never a break); the names (a mistake on another gate; no mistake מהודר); the wiring; the yard and the נגר; the stage-02
// stretch moved out of שער הקרבן; GAME_BUILD 47. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS47, LINE42, SRC47, YARD44, TITLE44, migrate45 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const ctl = (J, dt = 0.05, T = 60) => { J.hold(true); let t = 0; while (J.state().phase === 'lift' && t < T) { const s = J.state(), bias = s.drift + s.sway * Math.sin(s.swayW * s.t + s.ph); J.slide(Math.max(-1, Math.min(1, -s.tilt * 2.2 - bias))); J.step(dt); t += dt; } return t; };

test('build 47: TAPS ALONE NEVER FINISH the lintel or the leaf — taps under the take-up lift nothing; taps never set, seat or swing', () => {
  const J = F.createLintel47(1, { rnd: () => 0.2 });
  for (let k = 0; k < 400; k++) { J.hold(true); J.step(0.1); J.step(0.1); J.hold(false); J.set(k % 20); }
  assert.equal(J.state().y, 0); assert.equal(J.state().done, false);
  const Lf = F.createLeaf47(1);
  for (let k = 0; k < 100; k++) { assert.equal(Lf.pin(k % 7, k % 23), 'tap'); assert.equal(Lf.flick(k % 23, 0.1), 'wait'); Lf.wedge(); }
  assert.equal(Lf.state().done, false); assert.equal(Lf.state().phase, 'pin');
  Lf.pin(0, 80); for (let k = 0; k < 100; k++) assert.equal(Lf.flick(k % 23, 0.1), 'tap'); assert.equal(Lf.state().done, false);
});

test('build 47: the balance rule — held still the crews drift the bubble out and stop; sliding against the drift it rises to the top; at level 3 it sways; then both ends on the posts', () => {
  const N = F.createLintel47(1, { rnd: () => 0.2 }); N.hold(true); for (let i = 0; i < 1200; i++) N.step(0.05);
  assert.equal(N.state().phase, 'lift', 'held without the slide: never to the top'); assert.ok(N.state().out); assert.ok(N.state().faults >= 1, 'out of the tube: a fault');
  for (const L of [1, 2, 3, 4]) { const J = F.createLintel47(L, { rnd: () => 0.3 }); ctl(J); assert.equal(J.state().phase, 'set', `level ${L}: to the top, the bubble centred`); assert.equal(J.state().faults, 0); }
  assert.equal(F.LINTEL47.L[1].sway, 0); assert.ok(F.LINTEL47.L[3].sway > 0, 'level 3: it sways');
  const J = F.createLintel47(1, { rnd: () => 0.3 }); ctl(J); const dx = J.state().dx;
  assert.equal(J.set(10, 20), 'tap'); assert.equal(J.set(dx > 0 ? 60 : -60, 20), 'miss', 'away from the posts: one end off'); assert.equal(J.state().fix, 1);
  const r = J.set((-J.state().dx * 20) / F.LINTEL47.fine, 20); assert.equal(r, 'ok'); assert.equal(J.result().rating, 'kasher', 'one correction');
  const K = F.createLintel47(2, { rnd: () => 0.3 }); ctl(K); assert.equal(K.set((-K.state().dx * 25) / F.LINTEL47.fine, 25), 'ok'); assert.equal(K.set(24, 25), 'done');
  { const M = F.createLintel47(1, { rnd: () => 0.3 }); ctl(M); const before = M.state().dx; M.set(Math.sign(-before) * 24, 10); assert.ok(Math.abs(M.state().dx - before) < 0.75, 'the least drag moves it less than the window: the lintel 0.3 of the finger (K47-P)'); } assert.equal(K.result().rating, 'mehudar');
  const Hv = F.createLintel47(3, { heavy: true, rnd: () => 0.3 }); assert.ok(Math.abs(Hv.state().drift) > F.LINTEL47.L[3].drift, 'the heavy leaf: the crews drift more');
});

test('build 47: the swing test — straight in, free and soft מהודר; on the rim a correction; seated off by more than half the tolerance it binds — the wedge, then the swing; a slam a correction; never a break', () => {
  const A = F.createLeaf47(1); assert.equal(A.pin(5, 100), 'seated'); assert.equal(A.flick(150, 0.2), 'ok'); assert.equal(A.result().rating, 'mehudar');
  const B = F.createLeaf47(1); assert.equal(B.pin(60, 80), 'rim'); assert.equal(B.state().phase, 'pin', 'lifted back: try again, free'); assert.equal(B.pin(0, 90), 'seated'); B.flick(150, 0.2); assert.equal(B.result().rating, 'kasher');
  const C = F.createLeaf47(1); const t = F.LEAF47.tol[1], a = (t * 0.75 * Math.PI) / 180; assert.equal(C.pin(Math.sin(a) * 100, Math.cos(a) * 100), 'seated'); assert.equal(C.state().binds, true);
  assert.equal(C.flick(150, 0.2), 'binds'); assert.equal(C.flick(150, 0.2), 'wedge', 'bound: flicking again does nothing — the wedge'); assert.equal(C.wedge(), 'ok'); assert.equal(C.flick(150, 0.2), 'ok'); assert.equal(C.state().wedges, 1); assert.equal(C.result().rating, 'kasher');
  const D = F.createLeaf47(1); D.pin(0, 90); assert.equal(D.flick(300, 0.05), 'slam'); assert.equal(D.state().slams, 1); assert.notEqual(D.result().rating, 'mehudar');
  const E = F.createLeaf47(1); E.pin(0, 90); assert.equal(E.flick(40, 1.5), 'weak', 'too slow: it moves and comes back, no fault'); assert.equal(E.flick(150, 0.2), 'ok'); assert.equal(E.result().rating, 'mehudar');
  assert.ok(F.LEAF47.tol[4] < F.LEAF47.tol[1], 'the levels: a finer pin');
});

test('build 47: the names — each to its gate (מדות א, ד–ה: three north, three south, one east); another gate a mistake; a tap never places; no mistake מהודר', () => {
  assert.deepEqual(F.GATES47.map((g) => g.side).sort().join(''), 'ENNNSSS');
  const N = F.createNames47(); for (let k = 0; k < 50; k++) assert.equal(N.drop({ dragPx: k % 23, on: 'delek' }), 'tap');
  assert.equal(N.drop({ dragPx: 60, on: null }), 'off'); assert.equal(N.state().mistakes, 0);
  const first = N.current(); assert.equal(N.drop({ dragPx: 60, on: 'nikanor' === first.id ? 'delek' : 'nikanor' }), 'wrong'); assert.equal(N.state().mistakes, 1);
  for (const id of N.state().order) assert.equal(N.drop({ dragPx: 60, on: id }), 'ok'); assert.equal(N.state().done, true); assert.equal(N.result().rating, 'kasher');
  const M = F.createNames47(); for (const id of M.state().order) M.drop({ dragPx: 60, on: id }); assert.equal(M.result().rating, 'mehudar');
});

test('build 47: the stage — its parts, lines and sources (the Mishnah\'s own word: שקופות), the wiring, the old HUD never for stage 04; the FIT family and נגר; the yard; the stretch moved; GAME_BUILD 47', () => {
  assert.deepEqual([...PARTS47], ['open', 'lintel', 'leaf', 'leaf7', 'names', 'reveal']);
  assert.match(LINE42.lintel, /היו להן שקופות, חוץ משער טדי" — מדות ב, ג · טיוטה/); assert.match(read('src/game/middot.js'), /הָיוּ לָהֶן שְׁקוֹפוֹת, חוּץ מִשַּׁעַר טָדִי/, 'the wording as the game\'s own Mishnah has it');
  assert.ok(SRC47.some((x) => /מדות א, ד/.test(x)) && SRC47.some((x) => /נשתנו להיות של זהב/.test(x)));
  assert.deepEqual(F.FAM42, ['lift', 'place', 'inspect', 'fit']); assert.equal(TITLE44.fit, 'נגר');
  const h = read('src/game/har42.js'); assert.ok(!/f === 'fit' \? ' · בקרוב'/.test(h), 'נגר is real: no "בקרוב"');
  assert.deepEqual(YARD44.slice(11, 13).map((v) => v.part), ['lintel', 'leaf']);   // (build 48: then stage 05's)
  for (const k of ['lintel', 'leaf', 'leaf7', 'names']) assert.match(h, new RegExp(`\\n    ${k}: \\{ begin\\(\\) \\{ st\\.job = mk`), k);
  assert.match(h, /if \(st\.job && st\.job\.fullPad\)/); assert.match(h, /acting: true, fullPad: true, J, kind: 'lintel'/);
  const cost = F.MAT42.cost; assert.ok(cost.lintel + cost.leaf + cost.leaf7 > F.MAT42.daily, 'beyond a morning: "מחר" in normal play');
  const g = read('src/game/index.js'); assert.match(g, /else if \(wanted47\(\)\) startHar47\(\);/); assert.match(g, /\(gates47=0\|stick=1\|har42=0\)/); assert.match(g, /h47go=1/);
  assert.match(g, /if \(done && wanted47\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar47\(\); \}, 400\);/, 'after stage 03\'s card: stage 04 — never the old HUD');
  assert.match(g, /complete: \(\) => \{ const out = S\.completeStage\(G, 'gates'\);/);
  const w = { stones: [[2, 1, 1, -100, 7, -72.9, 1]], hole: [-111.05, -86.95, -73.62, -71.4, -80, 11, -104.95, 7.86, 5.98] };
  assert.equal(migrate45(w), true); assert.equal(w.stones[0][3], -67.5); assert.equal(w.hole[0], -78.55); assert.equal(w.hole[6], -72.45); assert.equal(migrate45(w), false, 'once');
  assert.match(h, /const w = STG === 'wall' \? \{ x: -67\.5, z: -100 \}/, 'his stretch between שער הקרבן and שער הניצוץ');
  assert.equal(GAME_BUILD, 48);   // (build 48: the constant moved on)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
