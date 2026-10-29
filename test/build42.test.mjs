// ── fable32 (build 42) ── the new Phase A, stage 01 "שיטוח ההר" (docs/specs/shlav-alef-v2-he.md §10-01, §9; shlav-alef-hard-fun-he.md §1,
// §5): the families engine (src/game/fam42.js — LIFT the treadwheel, PLACE the course / the rollers / the paving, INSPECT reading the rock)
// — TAPS ALONE NEVER FINISH A JOB; the grades by rate30 and the levels by lvl36's rule; the day's materials (a caravan each morning, up to
// 3 days kept, never out mid-act); the haptic library next to prefs28's switch; the stage's director wired into Phase A (src/game/har42.js:
// the Mount not done → the new stage; its end completes the Mount); mkout --no-shift; every line with its source or המחשה; GAME_BUILD 42.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { HAPTIC42, buzz42 } from '../src/avodah/shift/prefs28.js';
import { LINE42, PARTS42, wanted42 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const run = (J, sec, inp, dt = 0.05) => { for (let t = 0; t < sec; t += dt) J.step(dt, typeof inp === 'function' ? inp(t) : inp); return J.state(); };

// ───────── taps alone never finish a job ─────────
test('build 42: TAPS ALONE NEVER FINISH A JOB — the wheel, the rock, the course, the rollers, the paving: a hundred taps of every kind and nothing is done', () => {
  // the wheel: taps (holds of 0.1 s, every 0.4 s) for a minute
  const L = F.createLift(1); run(L, 60, (t) => ({ hold: t % 0.4 < 0.1 }));
  assert.equal(L.state().done, false); assert.ok(L.state().y < 0.01, `the stone rose ${L.state().y}`);
  // the rock: the line seen by a sweep, wedges tapped, the water tapped
  const R = F.createRock(0, 1); R.sweep(0.3); for (let i = 1; i <= 4; i++) R.wedge('a', i / 5);
  for (let k = 0; k < 200; k++) { R.pour(0.1, true); R.pour(0.1, false); }
  assert.equal(R.state().done, false); assert.equal(R.state().crack, 0, 'tapped water runs no crack');
  // the course, the rollers, the paving: a tap is not a drag
  const C = F.createCourse(F.courseSpec(0, 1)); for (let k = 0; k < 100; k++) assert.equal(C.place(2, { dragPx: 3, settleS: 0.05 }), 'tap');
  assert.equal(C.state().done, false);
  const P = F.createPave(); for (let k = 0; k < 100; k++) assert.equal(P.lay(1, { dragPx: 2 }), 'tap');
  assert.equal(P.state().done, false);
  const O = F.createRoll(1); for (let k = 0; k < 400; k++) { O.step(0.05); O.moveRoller({ dragPx: 5 }); }
  assert.equal(O.state().done, false);
  // and a drag with no settle does not set a stone
  assert.equal(F.createCourse(F.courseSpec(0, 1)).place(3, { dragPx: 80, settleS: 0.1 }), 'ok');   // (build 45: no hold to settle — a released stone settles by itself; a tap still places nothing)
});

// ───────── the families' grades ─────────
test('build 42: LIFT — held, the wheel lifts; released early, momentum carries it; a stop in the window with no correction is מהודר; past it, a drag back lowers and the grade is כשר; level 1 shows where it stops', () => {
  const J = F.createLift(1), P = J.P, aim = (P.win[0] + P.win[1]) / 2;
  let let_go = false; run(J, 8, () => { if (!let_go && J.stopAt() >= aim) let_go = true; return { hold: !let_go }; });
  assert.equal(J.state().done, true); assert.equal(J.result().rating, 'mehudar');
  assert.ok(P.shadow && !F.LIFT42.L[2].shadow, 'the shadow at level 1 only');
  const K = F.createLift(1); run(K, 5, { hold: true }); assert.ok(K.state().y > P.win[1], 'held too long: over');
  let s = run(K, 1, { back: true }); for (let i = 0; i < 80 && !K.state().done; i++) s = run(K, 0.05, K.state().y > aim ? { back: true } : {});
  run(K, 4, {}); assert.equal(K.state().done, true); assert.equal(K.result().rating, 'kasher');
  // (the naive kid's K42-P-new4: over the window, he never dragged down — let alone, the brake lets the stone sink back into the window: כשר, never stuck)
  const Z = F.createLift(1); run(Z, 5, { hold: true }); assert.ok(Z.state().y > P.win[1]); run(Z, 12, {}); assert.equal(Z.state().done, true); assert.ok(Z.state().y >= P.win[0] && Z.state().y <= P.win[1]); assert.equal(Z.result().rating, 'kasher');
  // (a child lifts in pushes: stopped short is no fault — the naive kid's runs; over is counted once)
  const Q = F.createLift(1); for (let k = 0; k < 2; k++) { run(Q, 0.9, { hold: true }); run(Q, 3, {}); assert.equal(Q.state().done, false); }
  let lg = false; run(Q, 8, () => { if (!lg && Q.stopAt() >= aim) lg = true; return { hold: !lg }; }); assert.equal(Q.state().done, true); assert.equal(Q.result().rating, 'mehudar', 'three pushes, no overshoot');
  void s;
});
test('build 42: INSPECT — the line shows only at its grazing light; even wedges and a release as the crack reaches the end are מהודר; rock 3\'s other line (not with the layers) is טעון תיקון; let go early: pour again, no fault', () => {
  const R = F.createRock(0, 1); assert.deepEqual(R.sweep(0.9), []); assert.deepEqual(R.sweep(0.3), ['a']);
  for (let i = 1; i <= 4; i++) assert.equal(R.wedge('a', i / 5), 'ok');
  while (R.state().crack < 0.95) R.pour(0.05, true); R.pour(0.05, false);
  assert.equal(R.state().done, true); assert.equal(R.result().rating, 'mehudar');
  const T = F.createRock(2, 1); T.sweep(0.25); T.sweep(0.72); assert.equal(Object.keys(T.state().seen).length, 2, 'two lines');
  for (let i = 1; i <= 4; i++) T.wedge('a', i / 5); while (T.state().crack < 0.95) T.pour(0.05, true); T.pour(0.05, false);
  assert.equal(T.result().rating, 'tikkun', 'the line against the layers');
  const E = F.createRock(1, 1); E.sweep(0.7); for (let i = 1; i <= 4; i++) E.wedge('a', i / 5);
  for (let k = 0; k < 20; k++) E.pour(0.05, true); E.pour(0.05, false); assert.equal(E.state().done, false); assert.equal(E.state().fix, 0, 'let go early: pour again — no fault');
  while (E.state().crack < 0.95) E.pour(0.05, true); E.pour(0.05, false); assert.equal(E.result().rating, 'mehudar', 'poured in two pushes, stopped at the end');
  assert.ok(F.ROCKS42[1].lines[0].band < F.ROCKS42[0].lines[0].band, 'rock 2 faint (a narrower light)');
});
test('build 42: PLACE — no joint over a joint is מהודר; a joint over one is a fault; a stone too long does not fit; the course ends exactly; the rollers in time are מהודר, a gap is a correction; the paving fills exactly', () => {
  const sp = F.courseSpec(0, 1), C = F.createCourse(sp);   // (a 1…7, the joints below at 3 and 6)
  assert.ok(C.overAt(2), 'ending at 3: over a joint');
  assert.equal(C.place(4, { dragPx: 60, settleS: 0.6 }), 'ok'); assert.equal(C.place(4, { dragPx: 60, settleS: 0.6 }), 'long');
  assert.equal(C.place(2, { dragPx: 60, settleS: 0.6 }), 'ok'); assert.equal(C.state().done, true); assert.equal(C.result().rating, 'mehudar');
  const D = F.createCourse(sp); D.place(2, { dragPx: 60, settleS: 0.6 }); D.place(2, { dragPx: 60, settleS: 0.6 }); D.place(2, { dragPx: 60, settleS: 0.6 });
  assert.equal(D.state().faults, 1); assert.equal(D.result().rating, 'kasher');
  // (the naive kid's dead end, K42-P-new: a stone that leaves a gap no stone fills is refused — every course can always end)
  const E = F.createCourse(sp); E.place(3, { dragPx: 60, settleS: 0.6 }); assert.equal(E.place(2, { dragPx: 60, settleS: 0.6 }), 'gap'); assert.equal(E.fits(2), false); assert.equal(E.fits(3), true);
  assert.equal(E.state().at, 4); assert.equal(E.place(3, { dragPx: 60, settleS: 0.6 }), 'ok'); assert.equal(E.state().done, true);
  for (let seed = 1; seed <= 300; seed++) { let a = seed; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647); for (const n of [0, 1]) for (const L of [1, 3]) { const K = F.createCourse(F.courseSpec(n, L)); for (let k = 0; k < 60 && !K.state().done; k++) K.place([2, 3, 4][Math.floor(rnd() * 3)], { dragPx: 60, settleS: 0.6 }); assert.ok(K.state().done, `seed ${seed}: the course ends`); } }
  const O = F.createRoll(1); for (let k = 0; k < 4000 && !O.state().done; k++) { O.step(0.05); if (O.state().free && O.state().t - O.state().freeAt > 0.3) O.moveRoller({ dragPx: 120 }); }
  assert.equal(O.result().rating, 'mehudar');
  const G = F.createRoll(1); for (let k = 0; k < 4000 && !G.state().done; k++) { G.step(0.05); if (G.state().waiting || (G.state().free && k % 300 === 0)) G.moveRoller({ dragPx: 120 }); }
  assert.ok(G.state().done && G.state().gaps > 0, 'late: gaps (the stone waits; never lost)');
  const P = F.createPave([5, 4]); assert.equal(P.lay(3, { dragPx: 40 }), 'ok'); assert.equal(P.lay(3, { dragPx: 40 }), 'long'); P.lay(2, { dragPx: 40 }); P.lay(2, { dragPx: 40 }); P.lay(2, { dragPx: 40 });
  assert.equal(P.state().done, true); assert.equal(P.result().rating, 'kasher', 'one too long: כשר');
});
test('build 42: the levels per family — lvl36\'s rule: two מהודר at a level open the next (up to 4); a retry is free; the grade is rate30\'s', () => {
  const save = {};
  assert.equal(F.famLevel(save, 'lift'), 1);
  assert.equal(F.famRate(save, 'lift', 1, 1).opened, 0);
  assert.equal(F.famRate(save, 'lift', 1, 0.6).rating, 'kasher');
  const r = F.famRate(save, 'lift', 1, 1); assert.equal(r.opened, 2); assert.equal(F.famLevel(save, 'lift'), 2);
  assert.equal(F.famLevel(save, 'inspect'), 1, 'each family its own');
  assert.deepEqual(F.FAM42, ['lift', 'place', 'inspect', 'fit']);   // (build 47: the FIT family opens)
});

// ───────── the day's materials ─────────
test('build 42: the materials by day (v2 §9) — a caravan the first morning, one more each new day, at most 3 days kept; checked only at a part\'s start (never mid-act); a whole stage 01 fits one day', () => {
  const m = {}, t = Date.UTC(2026, 9, 27, 8);
  assert.equal(F.caravan42(m, t), 1); assert.equal(m.stock, F.MAT42.daily);
  assert.equal(F.caravan42(m, t + 3600e3), 0, 'the same day: nothing');
  F.spend42(m, 'roll'); assert.equal(m.stock, F.MAT42.daily - F.MAT42.cost.roll);
  assert.equal(F.caravan42(m, t + 9 * 86400e3), 3, 'nine days away: three days kept');
  assert.equal(m.stock, F.MAT42.daily * F.MAT42.keep);
  const need = ['lift', 'rock', 'rock', 'rock', 'stone', 'stone', 'roll', 'pave'].reduce((a, k) => a + F.MAT42.cost[k], 0);
  assert.ok(need <= F.MAT42.daily, `stage 01 needs ${need} of the day's ${F.MAT42.daily}`);
  assert.equal(F.enough42({ stock: 1 }, 'roll'), false);
  const h = read('src/game/har42.js');
  assert.match(h, /if \(m && !F\.enough42\(S\.mat, m\)\) \{ st\.part = 'out';/, 'checked at the part\'s start');
  assert.ok(!/150 דק/.test(h), 'no time gate');
});

// ───────── the haptics ─────────
test('build 42: the haptic library (hishaarut-ve-retet-he.md §1.2) next to prefs28\'s switch — the patterns, the switch respected, at most 2 s a minute', () => {
  assert.equal(HAPTIC42.tick, 8); assert.equal(HAPTIC42.ok, 15); assert.equal(HAPTIC42.settle, 25); assert.deepEqual(HAPTIC42.heavy, [30, 40, 30]); assert.deepEqual(HAPTIC42.peak, [20, 60, 20, 60, 50]);
  const calls = []; const nav = { vibrate: (p) => { calls.push(p); return true; } };
  const keep = globalThis.localStorage; globalThis.localStorage = { getItem: (k) => (k === 'bh_haptics' ? '1' : null), setItem() {} };
  try {
    assert.equal(buzz42('ok', nav), true); assert.equal(buzz42('nope', nav), false);
    let n = 0; while (buzz42('gate', nav) && n < 100) n++; assert.ok(n <= 34, `the budget: ${n} gates in a minute`);
    globalThis.localStorage = { getItem: (k) => (k === 'bh_haptics' ? '0' : null), setItem() {} };
    assert.equal(buzz42('tick', nav), false, 'the switch off');
  } finally { if (keep === undefined) delete globalThis.localStorage; else globalThis.localStorage = keep; }
});

// ───────── the stage, wired ─────────
test('build 42: the new stage 01 takes the Mount over while it is not done (wanted42), and its end completes the Mount; the old Mount\'s flow, its opening and the twin step aside; the parts in order; mkout --no-shift', () => {
  const isDone = (G, id) => !!(G.st[id] && G.st[id].done);
  assert.equal(wanted42({ st: {} }, isDone), true); assert.equal(wanted42({ st: { har: { done: true } } }, isDone), false); assert.equal(wanted42({ st: {}, demo: true }, isDone), false);
  assert.deepEqual(PARTS42, ['open', 'rope', 'lift', 'corner', 'rock0', 'rock1', 'rock2', 'course0', 'course1', 'roll', 'pave', 'trace', 'reveal']);   // (build 43: the corner stone set home with the crowbar, after the wheel)
  const g = read('src/game/index.js');
  assert.match(g, /if \(wanted42\(G, S\.isDone\)\) startHar42\(\);/);
  assert.match(g, /opening = openingDue\(\) && !wanted42\(G, S\.isDone\);/);
  assert.match(g, /if \(H42 && H42\.on\) \{ H42\.frame\(ms\); return; \}/);
  assert.match(g, /live: \(\) => started && !whole && !opening && !reelOn\(\) && !\(H42 && H42\.on\)/);
  assert.match(g, /complete: \(\) => \{ const out = S\.completeStage\(G, 'har'\);/);
  const h = read('src/game/har42.js');
  assert.match(h, /createGuide39\(\{ E: E39, freeFor: \(\) => \(\) => true \}\)/, 'the guided walk (build 39)');
  assert.match(h, /createTouch40\(\{ doc, pad: st\.ui\.pad, id: 'h42', proj \}\)/, 'the touch on the thing (build 40)');
  assert.match(h, /pan40\(p, t, O, \{ x: h\.x, y: h\.y \+ HH \/ 2, z: h\.z, h: HH \}, tanH, CAM41, tanV\)/, 'the act\'s frame (build 41; build 43: his own height)');
  assert.match(h, /if \(st\.finger > 0 && st\.camLock\) return st\.camLock;/, 'frozen under the finger');
  assert.ok(!/לשלם/.test(h.replace(/\/\*[\s\S]*?\*\//g, '')), 'no paid finishing (the header only names what is gone)');
  const mk = read('tools/mkout.cjs'); assert.match(mk, /const HEAD = args\.includes\('--no-shift'\) \? '' : HEAD0;/);
  // (the runs' fixes: the paving's drop box from the points in front of the camera's near plane, kept on the screen — a corner behind it had
  // made the box null and the paving undroppable; the stage's reveal and card stay in its dusk light, the real night after it)
  // (build 53 — the inspector's review §4 must 6: the freed roller is a thing in the world, touched where it lies; the ⟳ button is gone)
  assert.match(h, /const fr = new THREE\.Mesh\(new THREE\.CylinderGeometry\(0\.45, 0\.45, 4\.4, 12\)/, 'the freed roller is a thing in the world'); assert.doesNotMatch(h, /el\('h42-it', '⟳'/, 'no ⟳ button');
  assert.match(h, /if \(c\) \{ c\.lookAt\(cq\.t\); c\.updateMatrixWorld\(\); \}/, 'the marks projected with this frame\'s camera');
  assert.match(h, /if \(view\.closeCam\) view\.closeCam\(true\);/); assert.match(h, /if \(view\.closeCam\) view\.closeCam\(false\);/);   // (the stage's views at their own distance: OrbitControls' 35-amot floor gives way while it is on)
  // (build 53 — §4 must 5: down and left lower at any time; over the window, any way)
  assert.match(h, /const over = J\.state\(\)\.y > J\.P\.win\[1\], dx = a\.x - a\.x0, dy = a\.y - a\.y0; if \(dy > 20 \|\| dx < -20 \|\| \(over && Math\.hypot\(dx, dy\) > 20\)\)/, 'over the window a drag any way lowers');
  assert.match(h, /\.h42-svg\{position:fixed;left:0;top:0;width:100vw;height:100vh;/, 'the marks\' layer covers the screen (an svg with inset 0 alone is 300 × 150 at its corner — the probe: every mark was off by 340 px at 640 × 296)');
  assert.match(h, /level 1: a tap lands on the nearest free marked place/); assert.match(h, /bd = J\.state\(\)\.L <= 1 \? Math\.max\(B\.w, B\.h\) : 26;/); assert.match(h, /\(level 1: the even places marked\)/);
  assert.match(h, /const paveBox = \(\) => boxOf\(/); assert.match(h, /const q = pts\.map\(\(p\) => proj\(p\[0\], p\[1\], p\[2\]\)\)\.filter\(Boolean\); if \(q\.length < 2\) return null;/);
  assert.match(g, /if \(k === 'night' && \(G\.ftue < 99 \|\| \(H42 && H42\.on\) \|\|/); assert.match(g, /onExit: \(done\) => \{ H42 = null; tod = null; try \{ syncTime\(\); \}/);   // (build 44: done → the vision, the test)
});
test('build 42: every line of the stage with its source or המחשה; touch targets ≥ 44 px; GAME_BUILD 42; no Divine Name (by code points); עולי רגל', () => {
  for (const [k, v] of Object.entries(LINE42)) if (!['walk', 'courseEnd', 'lift2'].includes(k)) assert.match(v, /טיוטה|המחשה/, `${k}: ${v}`);
  const h = read('src/game/har42.js');
  assert.match(h, /\.h42-it\{min-width:52px;min-height:48px/); assert.match(h, /\.h42-card button\{margin-top:10px;min-height:48px/); assert.match(h, /\.h42-skip\{[^}]*min-height:44px/);
  assert.equal(GAME_BUILD, 55);   // (build 43: the constant moved on) (build 44: again) (build 45: again) (build 46: again) (build 47: again) (build 48: again) (build 49: again) (build 50: again) (build 51: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/avodah/shift/prefs28.js', 'tools/auto42.js', 'tools/auto42-run.cjs', 'tools/mkout.cjs', 'PROJECT.md', 'test/build42.test.mjs']) {
    const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); if (f !== 'test/build42.test.mjs') assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
