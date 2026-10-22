// ── recovered (R9) ── build 17 (node): the focused day — B17's fire (70 at the start, the drain by the fuel), the two tamids (dawn 45 s, dusk
// 170 s, the fire at 60; the first two minutes' grace), the card and the bar (step17, bar17), the timing act's options and grades
// (SWING17, twin's gradeOf), the streak, the day's summary and the next day, the events (E.on17).
import test from 'node:test';
import assert from 'node:assert/strict';
import { B17, DAY33 } from '../src/avodah/shift/day33.js';
import { SWING17 } from '../src/avodah/shift/stations.js';
import { GRADE, gradeOf } from '../src/game/twin.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';
import { rig, upTo } from './rig33.mjs';

test('build 17: B17 — the fire starts at 70, the tamids at 45 s and 170 s with the fire at 60, two minutes\' grace ×1.5, warn 40, crit 25', () => {
  assert.equal(B17.fuel0, 70); assert.deepEqual({ ...B17.tamid }, { dawn: 45, dusk: 170, fire: 60 });
  assert.equal(B17.grace, 120); assert.equal(B17.graceK, 1.5); assert.equal(B17.warn, 40); assert.equal(B17.crit, 25);
  assert.deepEqual([...B17.slots], ['kiyor', 'wood', 'kevesh', 'song', 'pen', 'bake']); assert.equal(B17.maxSlots, 5);
});
test('build 17: the focused day starts with the fire at 70 (build 15\'s day at 22)', async () => {
  const A = rig(upTo('b17')); A.E.start(); await A.step(0.1); assert.ok(A.E.state().fuel > 69.5);
  const B = rig({ b17: false }); B.E.start(); await B.step(0.1); assert.ok(Math.abs(B.E.state().fuel - DAY33.fuel0) < 0.5);
  assert.equal(A.E.b17, true); assert.equal(B.E.b17, false);
});
test('build 17: the drain follows the fire — B17.drain[day 1] × (drainK[0] + drainK[1] × fuel/100) a second', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2);
  const f = R.E.state().fuel, want = B17.drain[0] * (B17.drainK[0] + (B17.drainK[1] * f) / 100);
  assert.ok(Math.abs(R.E.focus17().drain - want) < 1e-3, `${R.E.focus17().drain} vs ${want}`);
  R.E.debug.setFuel(20); assert.ok(R.E.focus17().drain < want, 'a low fire drains slower');
});
test('build 17: the first step is the wood ("בקעו 5 גזרים") and the bar holds the open slots (the wood needed, the ramp)', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2);
  const s = R.E.step17(); assert.equal(s.id, 'wood'); assert.match(s.text, /^בקעו \d+ גזרים$/);
  const bar = R.E.bar17(); assert.deepEqual(bar.map((b) => b.id), ['wood', 'kevesh']); assert.ok(bar[0].need); assert.equal(bar[0].badge, `0/${B17.goals.wood}`);
  assert.equal(R.E.flowNext().id, 'wood');
});
test('build 17: the dawn tamid — 45 s in, with the fire ≥ 60 and a lamb inspected: on time ★ (E.on17 "tamid", onTime)', async () => {
  const R = rig(upTo('b17')); R.E.start(); R.E.debug.lambOk(2); await R.step(45.5);
  assert.equal(R.E.state().tamD, 'ok'); const e = R.ev('tamid'); assert.equal(e.length, 1); assert.equal(e[0].onTime, true); assert.equal(e[0].when, 'שחר');
  const tm = R.E.tamid17(); assert.equal(tm.k, 'tamE'); assert.ok(Math.abs(tm.inS - (B17.tamid.dusk - 45.5)) < 0.6);
});
test('build 17: the first two minutes are grace — a low fire at dawn still makes the tamid on time', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2); R.E.debug.setFuel(30); R.E.debug.lambOk(1);
  assert.equal(R.E.grace17(), true); await R.step(46); assert.equal(R.E.state().tamD, 'ok');
});
test('build 17: after the grace a fire under 60 makes the tamid late ("התמיד איחר"), offered late when the fire is back', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2); R.E.debug.lambOk(2);
  R.E.st33.dayT = 0; R.E.st33.t = B17.grace + 1; assert.equal(R.E.grace17(), false);
  R.E.st33.tamD = 'ok'; R.E.debug.setFuel(30); R.E.st33.left = DAY33.dayS - B17.tamid.dusk + 0.5; await R.step(1);
  assert.equal(R.E.state().tamE, 'late'); assert.equal(R.ev('late').length, 1); assert.ok(R.hud.st.some((t) => /התמיד איחר/.test(t)));
  R.E.debug.setFuel(80); await R.step(0.3); assert.equal(R.E.state().tamE, 'lateDone'); assert.equal(R.ev('tamid').at(-1).onTime, false);
});
test('build 17: the timing act — SWING17\'s window C 0.8, twin\'s grades: perfect ≤ 0.085, good ≤ 0.2, else soft; ×k widens them', () => {
  assert.equal(SWING17.C, 0.8); assert.equal(GRADE.PERF, 0.085); assert.equal(GRADE.GOOD, 0.2);
  assert.equal(gradeOf(0.05), 'perfect'); assert.equal(gradeOf(-0.15), 'good'); assert.equal(gradeOf(0.3), 'soft');
  assert.equal(gradeOf(0.12, 1.5), 'perfect'); assert.equal(gradeOf(0.29, 1.5), 'good');
});
test('build 17: the wood\'s act gets the day\'s options — the grace (k ×1.5 in the first two minutes), onHit/onMiss, fb18', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); R.E.runAt('wood'); await R.step(0.1);
  const a = R.acts.at(-1); assert.equal(a.id, 'wood');
  assert.equal(a.opts.grace, true); assert.equal(a.opts.k, B17.graceK); assert.equal(typeof a.opts.onHit, 'function'); assert.equal(typeof a.opts.onMiss, 'function');
});
test('build 17: each hit is a log in the basket (E.on17 "hit" with its slot), golds make a streak, a miss breaks it', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); R.E.runAt('wood');
  const o = R.acts.at(-1).opts, s0 = R.E.focus17().streak, l0 = R.E.state().logs;
  o.onHit('gold'); o.onHit('gold'); o.onHit('good');
  assert.equal(R.E.state().logs, l0 + 3); assert.equal(R.E.focus17().streak, 0, 'a good breaks the golds'); o.onHit('gold'); o.onHit('gold');
  assert.equal(R.E.focus17().streak, 2); assert.ok(R.ev('hit').length >= 5 && R.ev('hit').every((e) => e.id === 'wood')); void s0;
  o.onMiss(1); assert.equal(R.E.focus17().streak, 0); assert.equal(R.ev('miss').length, 1);
});
// ── fable32 (build 30) ── the summary's stars (1 + each tamid on time) are gone: the day's ratings (sum.ratings, sum.r30) in their place ── /fable32 ──
test('build 17: sunset is the day\'s summary (the day\'s ratings — build 30, were stars 1–3 —, the tamids, the logs) and E.nextDay() is the next morning', async () => {
  const R = rig(upTo('b17')); R.E.start(); R.E.debug.lambOk(2); await R.step(46);
  assert.equal(R.E.nextDay(), false, 'no summary yet');
  R.E.debug.night(); await R.step(0.3);
  const sum = R.E.focus17().summary; assert.ok(sum && sum.day === 1); assert.equal(sum.stars, undefined); assert.ok(Array.isArray(sum.ratings) && sum.r30 && 'h' in sum.r30); assert.equal(sum.tamids.length, 2);
  assert.ok(R.ev('summary').length === 1); assert.equal(R.E.state().paused, true);
  assert.equal(R.E.nextDay(), true); assert.equal(R.E.state().day, 2); assert.equal(R.E.focus17().summary, null); assert.equal(R.E.state().tamD, 'wait');
});
test('build 17: E.on17 — events carry their type and the engine\'s time; the returned function unsubscribes', async () => {
  const R = rig(upTo('b17')); const got = []; const off = R.E.on17((e) => got.push(e)); R.E.start(); R.E.debug.lambOk(1); await R.step(45.5);
  assert.ok(got.length > 0 && got.every((e) => typeof e.type === 'string' && Number.isFinite(e.t)));
  const n = got.length; off(); R.E.debug.night(); await R.step(0.3); assert.equal(got.length, n);
});
test('build 17: the fire\'s warning — under B17.warn the next is the wood even before the ramp (the fire first)', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2); R.E.debug.setFuel(35);
  assert.equal(R.E.flowNext().id, 'wood'); assert.ok(R.E.focus17().fuel < B17.warn);
});
test('build 17: focus17 without a document is a quiet stub (destroy, state)', () => {
  const f = createFocus17({ E: { on17() {} }, doc: null });
  assert.equal(typeof f.destroy, 'function'); assert.equal(typeof f.state, 'function'); f.destroy();
});
test('build 17: no night in the focused day (B17.night false) — sunset ends the day at the summary', async () => {
  assert.equal(B17.night, false);
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.2); R.E.debug.night(); await R.step(0.3);
  assert.equal(R.E.state().night, false); assert.ok(R.E.focus17().summary);
});
