// ── fable32 (build 44) ── what sits between stage 01 and stage 02 (docs/specs/shlav-alef-v2-he.md §8, §12; shlav-alef-hard-fun-he.md §5):
// the one-time vision (Phase B's finished House, one act — the laver), the gold button gone for players (a hidden test switch), חצר
// האומנים (every variant met, any level opened, points and titles), the craftsman's test before chapter ב׳ (three jobs at level 2: pass at
// כשר, מהודר in all three — the gold seal, free tries, the fifth failure — רב האומנים shows it), the reveal without the next target;
// GAME_BUILD 44. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { YARD44, TITLE44, PTS44, TEST44, testTry44, testEnd44, title44 } from '../src/game/har42.js';
import { menuLabel, tester44, TESTER_KEY } from '../src/game/hooks/avodah.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

test('build 44: the test\'s retry rule — a try at כשר or better passes; tries are free; the fifth failure brings רב האומנים\'s demonstration', () => {
  let r = null, o;
  for (let k = 1; k <= 4; k++) { o = testTry44(r, 'tikkun'); r = o.rec; assert.equal(o.next, 'again', `try ${k}: again, free`); }
  o = testTry44(r, 'tikkun'); assert.equal(o.next, 'demo', 'the fifth failure: the demonstration'); assert.equal(o.rec.fails, 5);
  const p = testTry44(null, 'kasher'); assert.equal(p.next, 'pass'); assert.equal(p.rec.best, 'kasher');
  const m = testTry44(testTry44(null, 'tikkun').rec, 'mehudar'); assert.equal(m.next, 'pass'); assert.equal(m.rec.best, 'mehudar'); assert.equal(m.rec.tries, 2);
  assert.deepEqual([...TEST44.jobs], ['lift', 'course0', 'corner']); assert.equal(TEST44.L, 2); assert.equal(TEST44.demoAfter, 5);
  assert.match(TEST44.src, /קדמוניות טו 390 · טיוטה/);
});

test('build 44: the gate and the seal — passed when every job passed or was shown; the gold seal only for מהודר in all three; a shown job: no seal', () => {
  const ok = (best) => ({ tries: 1, fails: 0, best, passed: true, demo: false });
  assert.equal(testEnd44({}), null, 'nothing done: the gate stays');
  assert.equal(testEnd44({ lift: ok('kasher'), course0: ok('kasher') }), null, 'two of three: the gate stays');
  assert.deepEqual(testEnd44({ lift: ok('mehudar'), course0: ok('mehudar'), corner: ok('mehudar') }), { passed: true, seal: true, shown: false });
  assert.deepEqual(testEnd44({ lift: ok('mehudar'), course0: ok('kasher'), corner: ok('mehudar') }), { passed: true, seal: false, shown: false });
  const shown = { tries: 5, fails: 5, best: null, passed: false, demo: true };
  assert.deepEqual(testEnd44({ lift: ok('mehudar'), course0: shown, corner: ok('mehudar') }), { passed: true, seal: false, shown: true }, 'no kid is stuck — and no seal');
  const g = read('src/game/index.js');
  assert.match(g, /function wantedTest44\(\) \{\n    if \(!G \|\| G\.demo \|\| !S\.isDone\(G, 'har'\) \|\| \(G\.st && G\.st\.wall\) \|\| globalThis\.__H44_OFF\) return false;/, 'before chapter ב׳ only: the Mount done, the wall not begun');
  assert.match(g, /else if \(wantedTest44\(\)\) startH44\('test'\);/);
  const h = read('src/game/har42.js'); assert.match(h, /T\.seal = !!\(e && e\.seal\)/); assert.match(h, /const seal = S\.test44 && S\.test44\.seal \?/, 'the seal shown in the yard');
});

test('build 44: the vision once — after stage 01\'s card, a saved flag (the game\'s save and this browser), never again; Phase B\'s one act (the laver) and back; skip after 5 s', () => {
  const g = read('src/game/index.js');
  assert.match(g, /if \(!visionSeen\(\) && !G\.demo && hooks\.enterVision\) \{\n      G\.vision44 = 1; try \{ localStorage\.setItem\(VISION_KEY, '1'\); \}/);
  assert.match(g, /onExit: \(done\) => \{ H42 = null;[^\n]*if \(done\) after01\(\); \}/);
  const m = read('src/main.js'); assert.match(m, /enterVision\(\) \{ startAvodah\('shift:vision'\); \}/);
  const a = read('src/avodah/index.js'); assert.match(a, /if \(SH && o\.shift === 'vision'\) \{/);
  const sh = read('src/avodah/shift/index.js');
  assert.match(sh, /function runVision\(v = \{\}\) \{/); assert.match(sh, /const role = 'kiyor', pv = practiceSave31\(save\);/);
  assert.match(sh, /setTimeout\(\(\) => \{ if \(!ended\) sk\.hidden = false; \}, 5000\);/, 'skippable after 5 s'); assert.match(sh, /tmax = setTimeout\(\(\) => finish\('time'\), 70000\);/);
  assert.match(sh, /כך זה ייראה כשתסיים לבנות/);
});

test('build 44: the gold button — gone for players before Chanukat HaBayit, kept behind the hidden test switch (?tester=1, the head flag, #avodah, the demo); the altar\'s invitation for testers only', () => {
  const G = { st: {} };
  assert.equal(menuLabel(G), null, 'a player, building: no gold button');
  assert.equal(menuLabel({ st: { karnot: { done: true } } }), null, 'a player, the altar done: no invitation button either');
  assert.ok(menuLabel({ st: {}, celeb: 1 }), 'after Chanukat HaBayit: Phase B opens for all');
  assert.ok(menuLabel({ st: {}, demo: true }), 'the investors\' demo keeps it');
  const mem = {}; globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
  try { assert.equal(tester44(), false); mem[TESTER_KEY] = '1'; assert.equal(tester44(), true); assert.ok(menuLabel(G), 'a tester: the button back'); globalThis.__FORCE_SHIFT = 'card'; delete mem[TESTER_KEY]; assert.equal(tester44(), true, 'the shipped page\'s head flag'); }
  finally { delete globalThis.localStorage; delete globalThis.__FORCE_SHIFT; }
  assert.match(read('src/game/hooks/index.js'), /if \(kind === 'altar' && !AV\.tester44\(\)\) return false;/);
});

test('build 44: חצר האומנים — every variant of stage 01, any level opened, no building; points and a title per family (טיוטה); from the menu and the test\'s card', () => {
  assert.deepEqual(YARD44.map((v) => v.part), ['lift', 'corner', 'course0', 'rock', 'roll', 'pave', 'pulley', 'line', 'wcorner', 'lattice', 'warn', 'lintel', 'leaf', 'log', 'beam', 'peg', 'lever', 'step', 'compass', 'wheel', 'arch']);   // (build 49: stage 06's; build 50: 07's)   // (build 45: the wall's variants; build 46: the soreg's; build 47: the gates'; build 48: the women's court's)
  assert.deepEqual({ ...TITLE44 }, { lift: 'מנופאי', place: 'בנאי', inspect: 'בודק', fit: 'נגר' });
  assert.equal(title44('lift', PTS44.title - 1), ''); assert.equal(title44('lift', PTS44.title), 'מנופאי');
  const h = read('src/game/har42.js');
  assert.match(h, /const r = MODE === 'yard' \? F\.famRate\(S, fam, L, q\) : \{ rating: rate30\(q\), opened: 0 \}/, 'the yard opens levels; the test only rates');
  assert.match(h, /if \(MODE !== 'stage'\) \{   \/\/ ── build 44 ── the yard and the test/); assert.match(h, /התארים: טיוטה/);
  assert.match(read('src/game/ui.js'), /case 'yard44': closeSheet\(\); if \(act\.openYard\) act\.openYard\(\); break;/);
  assert.match(h, /'לחצר האומנים קודם', \(\) => stop\(false, 'yard'\)/);
  assert.match(h, /if \(fromTest && visit >= 2\) card\(head, \[\.\.\.ln, '~רב האומנים: מוכנים למבחן\? · המחשה'\], 'למבחן', \(\) => stop\(false\), 'עוד פעם', again\);/, 'from the test, after two runs: back to the test');
  assert.match(read('src/game/index.js'), /mode, from: back, test, stages:/);   // (build 50: and which test — chapter ג׳'s too)
});

test('build 44: the reveal shows no next target; GAME_BUILD 44; no Divine Name; עולי רגל', () => {
  assert.match(read('src/game/index.js'), /syncWorld\(null\); hideNext44\(\); return out; \}/);
  assert.equal(GAME_BUILD, 53);   // (build 45: the constant moved on) (build 46: again) (build 47: again) (build 48: again) (build 49: again) (build 50: again) (build 51: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/har42.js', 'src/game/index.js', 'src/game/hooks/avodah.js', 'src/avodah/shift/index.js', 'src/avodah/index.js', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`); }
});
