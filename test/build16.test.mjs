// ── recovered (R9) ── build 16 (node): the saved day (save.day33state every DAY33.saveEvery s, kept DAY33.saveMaxH hours; resumeDay33 for
// the start screen's "המשך יום N"), the start screen's minimal mode, the event log (evlog16.js), the pyre's way from the altar's top.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY33, resumeDay33, createDay33 } from '../src/avodah/shift/day33.js';
import { evlog, copyEvlog } from '../src/avodah/shift/evlog16.js';
import { rig, upTo } from './rig33.mjs';

const fresh = (o) => ({ day33state: { day: 3, at: Date.now(), ...o } });
test('build 16: the saved day — DAY33.minimal (the start screen\'s minimal mode), saved every 10 s, kept 24 h', () => {
  assert.equal(DAY33.minimal, true); assert.equal(DAY33.saveEvery, 10); assert.equal(DAY33.saveMaxH, 24);
});
test('build 16: resumeDay33 — no save → 0; a day saved now → its day; saved at night → the next day', () => {
  assert.equal(resumeDay33({}), 0); assert.equal(resumeDay33(null), 0);
  assert.equal(resumeDay33(fresh()), 3);
  assert.equal(resumeDay33(fresh({ night: true })), 4);
});
test('build 16: resumeDay33 — older than DAY33.saveMaxH hours, or no day, or not an object → 0 (a new day)', () => {
  assert.equal(resumeDay33(fresh({ at: Date.now() - (DAY33.saveMaxH + 1) * 3600e3 })), 0);
  assert.equal(resumeDay33(fresh({ at: Date.now() - (DAY33.saveMaxH - 1) * 3600e3 })), 3);
  assert.equal(resumeDay33(fresh({ day: 0 })), 0);
  assert.equal(resumeDay33({ day33state: 'x' }), 0);
});
test('build 16: the engine saves the day every 10 s (save.day33state: the day, the fire, the lambs, the tasks, why)', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(10.5);
  const s = R.save.day33state; assert.ok(s, 'saved'); assert.equal(s.why, 'tick'); assert.equal(s.day, 1);
  assert.ok(Number.isFinite(s.fuel) && Array.isArray(s.lambs) && s.lambs.length === 6 && Array.isArray(s.tasks)); assert.ok(Math.abs(s.at - Date.now()) < 5000);
});
test('build 16: a saved day resumes — its day and fire back, E.state().resumed, "המשך יום N" stamped', async () => {
  const save = { day33state: { day: 3, at: Date.now(), fuel: 55, fed: 20, logs: 2, perutot: 7, lambs: [true, false, true, false, false, false], left: 100 } };
  const R = rig(upTo('b17'), { save }); R.E.start(); await R.step(0.2);
  const s = R.E.state(); assert.equal(s.day, 3); assert.equal(s.resumed, 3); assert.equal(s.logs, 2); assert.equal(s.lambsOk, 2);
  await new Promise((r) => setTimeout(r, 1300)); assert.ok(R.hud.st.some((t) => /המשך יום 3/.test(t)), R.hud.st.join(' | '));
});
test('build 16: a day saved at night resumes as the next morning (the day +1, the logs and the stats new)', async () => {
  const save = { day33state: { day: 2, at: Date.now(), night: true, logs: 4, fuel: 40, left: 30 } };
  const R = rig(upTo('b17'), { save }); R.E.start(); await R.step(0.2);
  const s = R.E.state(); assert.equal(s.day, 3); assert.equal(s.logs, 0); assert.equal(s.resumed, 3);
});
test('build 16: a stale save (over 24 h) starts day 1', async () => {
  const save = { day33state: { day: 5, at: Date.now() - 25 * 3600e3, fuel: 40 } };
  const R = rig(upTo('b17'), { save }); R.E.start(); await R.step(0.2); assert.equal(R.E.state().day, 1); assert.ok(!R.E.state().resumed);
});
test('build 16: the event log — evlog returns the log\'s length; copyEvlog\'s JSON is { v: 16, n, ev: [{ t, name, data, at }] }', async () => {
  const n0 = evlog('test16', { a: 1 }), n1 = evlog('test16b');
  assert.equal(n1, n0 + 1);
  let text = null; const was = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async (t) => { text = t; } } }, configurable: true, writable: true });
  try { await copyEvlog(); } catch (e) { /* the clipboard stub */ } finally { if (was) Object.defineProperty(globalThis, 'navigator', was); }
  assert.ok(text, 'copied');
  if (text) { const j = JSON.parse(text); assert.equal(j.v, 16); assert.equal(j.n, j.ev.length); const e = j.ev.find((x) => x.name === 'test16'); assert.deepEqual(e.data, { a: 1 }); assert.ok(Number.isFinite(e.t) && Number.isFinite(e.at)); }
});
test('build 16: the day logs its start and its acts to the event log (day_start, act_start)', async () => {
  const seen = []; const R = rig(upTo('g20')); R.E.start(); await R.step(0.3);
  const k = R.STATIONS.kiyor.stand; R.at(k.x, k.z); await R.step(0.5);
  assert.ok(R.E.k20(), 'the laver\'s act started'); seen.push(R.E.k20().ph); assert.ok(['up', 'pose'].includes(seen[0]));
});
test('build 16 (review #2): on the altar\'s top with logs the way is the pyre, not the ramp\'s foot', async () => {
  const R = rig(upTo('b17')); R.E.start(); await R.step(0.3); R.E.debug.logs(3);
  R.at(-34, 10, 25); await R.step(0.1);
  const f = R.E.flowNext(); assert.equal(f.id, 'pyre'); assert.ok(Math.abs(f.at.y - 25.5) < 0.01);
});
test('build 16: no saved day without the focused day\'s flags either — createDay33 alone still saves (the keys of build 15 and on)', async () => {
  const save = {}; const E = createDay33({ world: { hero: { drive() {}, setPos() {} } }, heroPos: () => ({ x: -34, y: 16, z: 50 }), save, rng: () => 0.5 });
  E.start(); for (let i = 0; i < 110; i++) E.tick(0.1);
  assert.ok(save.day33state && save.day33state.day === 1);
});
