// SLICE27: the six works' verbs and levels, the level counter, the events table — node, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bind27, record27, level27, s27Opts, EVENTS27, STAMP27, GOLD_RUNS, beat27, beatGrade27 } from '../src/avodah/works/slice27.js';
import { mokedModel, MOKED27 } from '../src/avodah/works/night.js';
import { deshenModel, maarachaModel, MAAR27_WRONG } from '../src/avodah/works/dawn.js';
import { evarimModel, EV27_SHUF } from '../src/avodah/works/dawn2.js';
import { lotModel, lotPlan, FINGER27, HERO_SEAT } from '../src/avodah/works/payis.js';

const run = (M, s, dt = 0.05) => { for (let t = 0; t < s; t += dt) M.step(dt); };

test('the level counter: three gold runs open level 2, practice runs count, a good run does not', () => {
  const box = {}; let saved = 0; bind27(box, () => saved++);
  assert.equal(level27('fire'), 1);
  assert.equal(record27('fire', { quality: 0.8 }).gold, 0);
  record27('fire', { quality: 1 }); record27('fire', { quality: 0.95, practice: true });
  const r = record27('fire', { quality: 1 });
  assert.equal(r.up, true); assert.equal(r.lv, 2); assert.equal(level27('fire'), 2); assert.deepEqual(box.lv27.fire, { gold: GOLD_RUNS, lv: 2 });
  assert.ok(saved >= 4);
  assert.equal(s27Opts({ task: { work: 'fire' } }).l2, true); assert.equal(s27Opts({ task: { work: 'deshen' } }).l2, false);
  assert.equal(record27('wood', { quality: 1 }), null);   // (not a slice work)
  assert.equal(record27('payis2', { quality: 0.7, guessed: true }).key, 'payis');   // (the lots share one counter; a right guess is a gold run)
});
test('the stamps have names; the events table holds the coal (a second event is a data entry)', () => {
  for (const w of ['fire', 'deshen', 'maaracha', 'kiddush', 'evarim', 'payis']) assert.ok(STAMP27[w]);
  const E = EVENTS27.find((e) => e.id === 'coal'); assert.equal(E.work, 'deshen'); assert.ok(/המחשה/.test(E.src)); assert.ok(E.pts > 0);
});
test('the fire: a tap on the beat is gold and the flame leaps; off the beat it still counts (ok/good), L2 quickens', () => {
  assert.equal(beatGrade27(beat27(0.82 * 3 + 0.02, 0.82), 0.13), 2);
  assert.equal(beatGrade27(beat27(0.82 * 3 + 0.41, 0.82), 0.13), 0);
  const M = mokedModel({});
  run(M, 0.82 * 2 - 0.02, 0.01); M.twinTap(); run(M, 0.6); assert.equal(M.laid, 1); assert.equal(M.acts[0].q, 2);
  const t1 = M.target; run(M, 0.65, 0.01); M.twinTap(); run(M, 0.6); assert.equal(M.laid, 2); assert.ok(M.acts[1].q < 2); assert.ok(M.target - t1 < MOKED27.grow[2]);
  for (let i = 0; i < 10 && M.phase === 'work'; i++) { M.twinTap(); run(M, 0.6); } assert.ok(M.phase !== 'work');   // (taps alone finish)
  const L = mokedModel({ l2: true, level: 1 }); assert.equal(L.n, MOKED27.n2); assert.ok(L.period < MOKED27.p1);
});
test('the deshen: still hands = gold carry; the hold at the top scoops (gold at the mark); the coal fires and one tap puts it out', () => {
  globalThis.__S27_EV = 1;
  const M = deshenModel({});
  M.twinTap(); run(M, 1.5); assert.equal(M.i, 1); assert.equal(M.acts[0].q, 2);
  M.touch(true); run(M, 1.1, 0.01); M.touch(false); M.twinTap(); run(M, 0.7);
  assert.equal(M.i, 2); assert.equal(M.acts[1].q, 2); assert.ok(M.full);
  M.twinTap(); let fired = false; for (let t = 0; t < 2; t += 0.05) { M.step(0.05); if (M.ev27) { fired = true; break; } }
  assert.ok(fired, 'the coal'); const i0 = M.i; run(M, 2); assert.equal(M.i, i0, 'the walk waits');
  M.twinTap(); assert.equal(M.ev27, null); assert.ok(M.bonuses.some((b) => /כיביתם/.test(b.say)));
  for (let i = 0; i < 12 && M.phase === 'work'; i++) { M.twinTap(); run(M, 1.6); } assert.ok(M.phase !== 'work');
  globalThis.__S27_EV = undefined;
});
test('the maaracha: a drag at the wrong spot is a word, no log moves; the right one is gold; a tap goes right (good)', () => {
  const M = maarachaModel({});
  M.scr27 = { o: { x: 400, y: 300 }, spots: [{ x: 600, y: 200 }, { x: 200, y: 200 }, { x: 400, y: 100 }] };
  M.drag(0.5, 0.5, 'down'); M.drag(0.0, 0.0, 'move'); M.drag(0.0, 0.0, 'up');   // (up-left: the ketoret's)
  assert.equal(M.laid, 0); assert.equal(M.warn, MAAR27_WRONG[1]); assert.ok(!M.fly);
  M.drag(0.5, 0.5, 'down'); M.drag(1.2, 0.0, 'move'); M.drag(1.2, 0.0, 'up'); run(M, 0.7);
  assert.equal(M.laid, 1); assert.equal(M.acts[0].q, 2);
  M.twinTap(); run(M, 0.7); assert.equal(M.laid, 2); assert.ok(M.acts[1].q <= 1);
  for (let i = 0; i < 12 && M.phase === 'work'; i++) { M.twinTap(); run(M, 0.8); } assert.ok(M.phase !== 'work');
});
test('the evarim: the right kohen = gold; another one → "לא — הראש קודם"; L2 shuffles the row', () => {
  const M = evarimModel({});
  assert.ok(M.pickJ(3)); assert.equal(M.warn, 'לא — הראש קודם'); assert.equal(M.i, 0);
  assert.ok(M.pickJ(0)); run(M, 1); assert.equal(M.i, 1); assert.equal(M.acts.slice(-1)[0].q, 1);   // (the try after a slip: at most good — acts.js's rule, no points taken)
  assert.ok(M.pickJ(1)); run(M, 1); assert.equal(M.i, 2); assert.equal(M.acts.slice(-1)[0].q, 2);
  for (let i = 0; i < 12 && M.phase === 'work'; i++) { M.twinTap(); run(M, 1); } assert.ok(M.phase !== 'work');
  const L = evarimModel({ l2: true }); assert.deepEqual(L.perm, EV27_SHUF); assert.equal(new Set(EV27_SHUF).size, 9);
});
test('the lots: his finger first — a short hold one, a long hold two, a tap one; the count takes his fingers; L2 4 s', () => {
  const M = lotModel({ finger: true }, 'payis'); assert.equal(M.sub, 'finger');
  M.touch(true); run(M, FINGER27.two + 0.1); M.touch(false); M.twinTap();
  assert.equal(M.sub, 'run'); assert.equal(M.fingers[HERO_SEAT], 2);
  assert.deepEqual(M.plan, lotPlan(M.N, 0, M.fingers));
  const T = lotModel({ finger: true }, 'payis'); T.twinTap(); assert.equal(T.fingers[HERO_SEAT], 1); assert.equal(T.sub, 'run');
  const A = lotModel({ finger: true }, 'payis'); run(A, FINGER27.auto + 0.2); assert.equal(A.sub, 'run');   // (never idle)
  const B = lotModel({}, 'payis'); assert.equal(B.sub, 'run');   // (a bare model: as before)
});
test('no Divine Name and no red in the slice\'s files', () => {
  const N = [String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4), String.fromCharCode(0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5dd), String.fromCharCode(0x5d4, 0x5f3)];
  for (const f of ['src/avodah/works/slice27.js', 'test/slice27-touch.cjs']) { const s = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'); for (const n of N) assert.ok(!s.includes(n), f); assert.ok(!/#(FF0000|E0|D0|C0)[0-3][0-9A-F]{3}\b/i.test(s), f); }
});
