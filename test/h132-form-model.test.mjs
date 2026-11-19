// build 132, lane A: work 1 "הקמת התבנית" — the pure rules (src/game/h132/form-model.js) against the spec (docs/specs/shlav-09-he.md,
// עבודה 1): every row of its score table, the loss row, the boundaries named (88, 89.5, 90.5, 92 exactly, 97), the 0.6 s lag, the
// order rule, the free first lift, the four stakes, the three levels and the wind of level 3.
import test from 'node:test';
import assert from 'node:assert/strict';
import { FK, WALLS, STAKES, RODS, fresh, load, save, rodTo, stakeTap, stakesIn, canGrab, grab, push, release, step, shown, judge, result, maxPts, windOn, signOf, done } from '../src/game/h132/form-model.js';
import { stage } from '../src/game/h132/model.js';
import { BOOK } from '../src/game/world/grid.js';

const DT = 1 / 60;
const run = (S, secs, ev = []) => { for (let t = 0; t < secs - 1e-9; t += DT) ev.push(...step(S, DT)); return ev; };
/** the thumb lifts wall k by `deg` over `secs` (evenly), lets go, and the world runs until it rests (or `after` s) */
function lift(S, k, deg, secs = 0.6, after = 8) {
  assert.ok(grab(S, k), 'grab ' + k);
  const n = Math.max(1, Math.round(secs / DT)), ev = [];
  for (let i = 0; i < n; i++) { push(S, deg / n); ev.push(...step(S, DT)); }
  release(S);
  return run(S, after, ev);
}
const stakes = (S) => { for (const k of RODS) rodTo(S, k, 1); for (const k of STAKES) stakeTap(S, k); };
const evk = (ev, k) => ev.filter((e) => e.k === k);

test('the windows: 89.5 … 90.5 is 40, 88 … 92 is 20 (92 exactly is 20), over 92 up to 97 pulled back, over 97 falls', () => {
  assert.equal(judge(90), 'perf'); assert.equal(judge(89.5), 'perf'); assert.equal(judge(90.5), 'perf');
  assert.equal(judge(89.49), 'good'); assert.equal(judge(90.51), 'good');
  assert.equal(judge(88), 'good'); assert.equal(judge(92), 'good');
  assert.equal(judge(87.99), 'low'); assert.equal(judge(92.01), 'back'); assert.equal(judge(97), 'back'); assert.equal(judge(97.01), 'fall');
  assert.deepEqual(FK.PTS, { stake: 10, perf: 40, good: 20, back: 10, steady: 20, crack: -20 });
  assert.equal(FK.LAG, 0.6);
});

test('the lag: the wall goes on moving after the thumb stops, and ends where the thumb\'s travel says', () => {
  const S = fresh(2); stakes(S); grab(S, 'E');
  for (let i = 0; i < 18; i++) { push(S, 60 / 18); step(S, DT); }   // (60° of thumb in 0.3 s)
  const a0 = S.W.E.a; assert.ok(a0 < 30, 'behind the thumb: ' + a0);
  release(S); step(S, DT); const v1 = S.W.E.v; assert.ok(v1 > 50, 'still moving fast: ' + v1);
  run(S, 0.6); assert.ok(S.W.E.v > v1 * 0.3 && S.W.E.v < v1 * 0.45, 'after 0.6 s about e⁻¹ of its speed: ' + S.W.E.v);   // (first-order: e^-1 = 0.37)
  run(S, 6); assert.ok(Math.abs(S.W.E.a - 60) < 0.2, 'ends at the thumb\'s travel: ' + S.W.E.a); assert.equal(S.W.E.st, 'up');
});

test('the stakes: a rod slides only inward and stops; its tap drives the stake (10); SE a tap on the pour\'s line; four in every case', () => {
  const S = fresh(2);
  assert.deepEqual([...RODS], ['NW', 'NE', 'SW']); assert.deepEqual([...STAKES].sort(), ['NE', 'NW', 'SE', 'SW']);
  assert.equal(stakeTap(S, 'NW').ok, false, 'no stake before the rod has stopped');
  rodTo(S, 'NW', 0.6); rodTo(S, 'NW', 0.3); assert.equal(S.rods.NW, 0.6, 'never back outward');
  rodTo(S, 'NW', 1.4); assert.equal(S.rods.NW, 1, 'stops at the corner');
  assert.deepEqual(stakeTap(S, 'NW'), { ok: true, pts: 10 });
  assert.equal(stakeTap(S, 'NW').ok, false, 'once');
  assert.deepEqual(stakeTap(S, 'SE'), { ok: true, pts: 10 }, 'SE: no rod, the line of the pour');
  assert.equal(canGrab(S, 'E'), false, 'the walls wait for the four stakes');
  rodTo(S, 'NE', 1); rodTo(S, 'SW', 1); stakeTap(S, 'NE'); stakeTap(S, 'SW');
  assert.ok(stakesIn(S)); assert.equal(S.pts, 40); assert.ok(canGrab(S, 'E'));
  // (the book: three rods from the yesod's outer corner to the block's corner; SE has none)
  for (const k of RODS) assert.deepEqual(BOOK.s09.rod[k].to, BOOK.s09.corner[k]);
  assert.equal(BOOK.s09.rod.SE, undefined);
});

test('a wall that rests in 89.5 … 90.5 locks with 40; in 88 … 92 with 20; 92 exactly is 20', () => {
  for (const [deg, pts, how] of [[90, 40, 'perf'], [89.6, 40, 'perf'], [90.4, 40, 'perf'], [88.3, 20, 'good'], [91.7, 20, 'good']]) {
    const S = fresh(2); stakes(S); S.free = 0;
    const ev = lift(S, 'E', deg, 0.8);
    const L = evk(ev, 'lock'); assert.equal(L.length, 1, String(deg)); assert.equal(L[0].pts, pts, String(deg)); assert.equal(L[0].how, how);
    assert.equal(S.W.E.st, 'lock');
  }
  // 92 exactly: set at rest there
  const S = fresh(2); stakes(S); S.free = 0; grab(S, 'E'); S.W.E.a = 92; S.W.E.v = 0; release(S); const ev = run(S, 0.1);
  assert.equal(evk(ev, 'lock')[0].pts, 20); assert.equal(evk(ev, 'lock')[0].how, 'good');
});

test('over 92 up to 97 at rest: the crew pulls it back, 10, its final score; 97 itself is still pulled back', () => {
  for (const a of [92.01, 95, 97]) {
    const S = fresh(2); stakes(S); S.free = 0; grab(S, 'W'); S.W.W.a = a; S.W.W.v = 0; release(S); const ev = run(S, 0.1);
    const L = evk(ev, 'lock'); assert.equal(L.length, 1, String(a)); assert.equal(L[0].pts, 10); assert.equal(L[0].how, 'back'); assert.equal(S.W.W.a, 90, 'pulled back upright');
    assert.equal(S.dmg, 0);
  }
});

test('over 97: the wall falls outward, a board cracks (−20), the patch stays (the flaw), the wall lies again; the streak breaks', () => {
  const S = fresh(2); stakes(S); S.free = 0; S.streak = 3;
  const ev = lift(S, 'E', 110, 0.5);
  const c = evk(ev, 'crack'); assert.equal(c.length, 1); assert.equal(c[0].pts, -20); assert.equal(c[0].wall, 'E');
  assert.equal(S.W.E.st, 'lie'); assert.equal(S.W.E.a, 0); assert.equal(S.dmg, 1); assert.equal(S.W.E.cracks, 1); assert.equal(S.streak, 0);
  // raised again, it locks; the work's points: 40 + 40 − 20
  lift(S, 'E', 90, 0.8); assert.equal(S.W.E.st, 'lock');
  assert.equal(result(S).pts, 40 + 40 - 20);
  // (the save keeps the crack)
  assert.equal(load(save(S, 'form2')).dmg, 1);
});

test('the free first lift: past 97 (or past 92) the crew catches it — no damage, no penalty, the streak whole; then it is spent', () => {
  const S = fresh(2); stakes(S); S.streak = 4;
  let ev = lift(S, 'E', 120, 0.4);
  assert.equal(evk(ev, 'caught').length, 1); assert.equal(evk(ev, 'crack').length, 0); assert.equal(S.dmg, 0); assert.equal(S.streak, 4); assert.equal(S.free, 0);
  assert.equal(S.W.E.st, 'lie');
  ev = lift(S, 'E', 120, 0.4); assert.equal(evk(ev, 'crack').length, 1, 'the second lift is not free'); assert.equal(S.dmg, 1);
  // past 92 on the free lift: caught too, no 10
  const S2 = fresh(2); stakes(S2); grab(S2, 'W'); S2.W.W.a = 95; S2.W.W.v = 0; release(S2); ev = run(S2, 0.1);
  assert.equal(evk(ev, 'caught').length, 1); assert.equal(S2.W.W.st, 'lie'); assert.equal(S2.pts, 40);
  // a good first lift scores as any
  const S3 = fresh(2); stakes(S3); ev = lift(S3, 'E', 90, 0.8); assert.equal(evk(ev, 'lock')[0].pts, 40); assert.equal(S3.free, 0);
  // a small first lift that rests low spends it
  const S4 = fresh(2); stakes(S4); lift(S4, 'E', 20, 0.3); assert.equal(S4.free, 0); assert.equal(S4.W.E.st, 'up');
});

test('the order: a tongue wall (N, S) before both socket walls (E, W) are locked does not sit — lowered again, streak broken, no damage', () => {
  const S = fresh(2); stakes(S); S.free = 0; S.streak = 2;
  let ev = lift(S, 'N', 90, 0.8);
  assert.equal(evk(ev, 'order').length, 1); assert.equal(S.W.N.st, 'lie'); assert.equal(S.streak, 0); assert.equal(S.dmg, 0); assert.equal(S.pts, 40);
  lift(S, 'E', 90, 0.8); ev = lift(S, 'S', 90, 0.8); assert.equal(evk(ev, 'order').length, 1, 'one socket wall is not enough');
  lift(S, 'W', 90, 0.8); ev = lift(S, 'S', 90, 0.8); assert.equal(evk(ev, 'lock').length, 1);
  ev = lift(S, 'N', 90, 0.8); assert.equal(evk(ev, 'lock')[0].last, 1, 'the fourth closes');
  assert.ok(done(S)); const r = result(S); assert.equal(r.flags.order, 2); assert.equal(r.perfect, false, 'a broken streak is not perfect');
  // a tongue wall resting low is not judged by the order
  const S2 = fresh(2); stakes(S2); S2.free = 0; ev = lift(S2, 'N', 50, 0.5); assert.equal(evk(ev, 'order').length, 0); assert.equal(S2.W.N.st, 'up');
});

test('a perfect level 2: four stakes and four walls at 40 → 200 points, 3 stars, perfect', () => {
  const S = fresh(2); stakes(S);
  for (const k of ['E', 'W', 'N', 'S']) lift(S, k, 90, 0.8);
  const r = result(S); assert.equal(r.pts, 200); assert.equal(r.max, 200); assert.equal(r.stars, 3); assert.equal(r.perfect, true);
  assert.equal(maxPts(2), 200);
});

test('the three levels: 1 — east and west stand, no stake in, two walls to raise; 2 — four lying; 3 — four lying and the wind', () => {
  const S1 = fresh(1); assert.equal(S1.W.E.st, 'lock'); assert.equal(S1.W.W.st, 'lock'); assert.equal(S1.W.N.st, 'lie'); assert.equal(S1.W.S.st, 'lie');
  assert.ok(STAKES.every((k) => !S1.stakes[k])); assert.equal(maxPts(1), 120);
  stakes(S1); lift(S1, 'N', 90, 0.8); lift(S1, 'S', 90, 0.8); assert.ok(done(S1)); assert.equal(result(S1).pts, 120); assert.equal(result(S1).perfect, true);
  for (const lv of [2, 3]) { const S = fresh(lv); assert.ok(WALLS.every((k) => S.W[k].st === 'lie')); }
  // (the core's stage() agrees)
  assert.deepEqual(stage('form', 1, null).walls, { E: 'up', W: 'up', N: 'lie', S: 'lie' });
  assert.equal(stage('form', 3, null).wind, true); assert.equal(stage('form', 2, null).wind, false);
  // no wind at levels 1 and 2
  for (const lv of [1, 2]) { const S = fresh(lv); stakes(S); run(S, FK.WIND.GUST + 2); assert.equal(windOn(S), false); assert.equal(signOf(S), 0); }
});

test('level 3: the signs come first, then the gust; a raised wall not locked sways; dragging against it steadies it → 20 in 88 … 92', () => {
  const S = fresh(3); stakes(S); S.free = 0;
  run(S, FK.WIND.SIGN - 0.5); assert.equal(signOf(S), 0);
  run(S, 1); assert.ok(signOf(S) > 0 && !windOn(S), 'the signs before the gust');
  // a wall raised to 60 before the gust
  lift(S, 'E', 60, 0.5, 1.5);
  run(S, FK.WIND.GUST - S.tw + 0.1); assert.ok(windOn(S));
  assert.ok(S.W.E.swayA > 0 && S.W.E.swayed, 'it sways');
  assert.equal(S.W.W.swayA, 0, 'a lying wall does not');
  // raised to 90 while swaying, and steadied: the drag against the sway, frame by frame
  grab(S, 'E'); for (let i = 0; i < 30; i++) { push(S, 1); step(S, DT); }
  const om = (2 * Math.PI) / FK.WIND.PER; let n = 0;
  while (S.W.E.swayA > FK.WIND.STILL + 1e-9 && n++ < 600) { const sv = Math.cos(S.W.E.swayP); push(S, sv > 0 ? -0.5 : 0.5); step(S, DT); }
  assert.ok(n < 600, 'steadied by the drag against it');
  void om;
  // the gust passes; it rests in the window: the steadying's 20
  release(S);
  const ev = run(S, FK.WIND.GUST + FK.WIND.DUR - S.tw + 4);
  const L = evk(ev, 'lock'); assert.equal(L.length, 1, JSON.stringify(S.W.E)); assert.equal(L[0].how, 'steady'); assert.equal(L[0].pts, 20);
});

test('level 3: a sway that carries a wall past 97 cracks a board', () => {
  const S = fresh(3); stakes(S); S.free = 0;
  run(S, FK.WIND.GUST - 2); grab(S, 'E'); S.W.E.a = 94; S.W.E.v = 0;   // (held near the top as the gust comes)
  const ev = run(S, 3); assert.equal(evk(ev, 'crack').length, 1); assert.equal(S.W.E.st, 'lie');
});

test('a locked wall cannot be taken; one thumb at a time; shown() is the wall\'s angle with its sway', () => {
  const S = fresh(1); stakes(S); assert.equal(canGrab(S, 'E'), false);
  assert.ok(grab(S, 'N')); assert.equal(canGrab(S, 'S'), false); release(S); assert.ok(canGrab(S, 'S'));
  S.W.N.a = 40; S.W.N.swayA = 2; S.W.N.swayP = Math.PI / 2; assert.equal(shown(S, 'N'), 42);
});

test('review R6: over the last 15° the wall slows like a weight — its lag grows — and still rests where the thumb\'s travel says', () => {
  const S = fresh(2); stakes(S); S.free = 0;
  assert.ok(grab(S, 'E')); const n = Math.round(0.3 / DT); for (let i = 0; i < n; i++) { push(S, 90 / n); step(S, DT); } release(S);
  let maxLag = 0, t = 0; const at = []; while (S.W.E.st === 'up' && t < 8) { step(S, DT); t += DT; maxLag = Math.max(maxLag, S.W.E.lag || 0); at.push(S.W.E.a); }
  assert.ok(maxLag > FK.LAG * 1.5, 'the lag grows near upright: ' + maxLag);
  assert.equal(S.W.E.st, 'lock'); assert.ok(Math.abs(S.W.E.a - 90) < 0.5, String(S.W.E.a));
  // (it slows as it nears upright: each tenth of a second covers less than the one before, once past 75°)
  const k = at.findIndex((a) => a > 75), d = (i) => at[i + 6] - at[i]; if (k >= 0 && k + 18 < at.length) assert.ok(d(k + 6) < d(k), 'slowing');
});

test('form R6 brake (round 8): the wall rests at the thumb\'s travel whatever the step — a slow page\'s long steps no longer carry it past', () => {
  for (const [frames, fdt, sdt] of [[18, 0.05, 0.05], [18, 0.3, 0.1], [18, 0.6, 0.2], [6, 0.5, 0.25], [40, 0.05, 0.016]]) {
    const S = fresh(2); for (const k of STAKES) { if (S.rods[k] != null) S.rods[k] = 1; stakeTap(S, k); }
    grab(S, 'E');
    for (let i = 0; i < frames; i++) { push(S, 90 / frames); for (let t = 0; t < fdt - 1e-9; t += sdt) step(S, sdt); }
    release(S); for (let i = 0; i < 600 && S.W.E.st === 'up'; i++) step(S, sdt);
    assert.equal(S.W.E.how, 'perf', `${frames}×${fdt}/${sdt}`); assert.ok(Math.abs(S.W.E.a - 90) < 1e-6, `${frames}×${fdt}/${sdt}: ${S.W.E.a}`);
  }
});
