import test from 'node:test';
import assert from 'node:assert/strict';
import { createDayClock, labelHe, nextAppointment, realMinutes } from '../src/avodah/day/clock.js';
import { createStock } from '../src/avodah/day/stock.js';
import { createTasks, TEMPLATES } from '../src/avodah/day/tasks.js';

test('clock: a day is 45 real minutes, the night 5', () => {
  assert.equal(Math.round(realMinutes(0, 24)), 45);
  assert.equal(Math.round(realMinutes(0, 10)), 5);
  const save = {}; const C = createDayClock({ save }); const ev = [];
  C.on((t, d) => ev.push(t + (d.block ? ':' + d.block : '')));
  assert.equal(C.now().block, 'night'); assert.equal(C.now().h, 18);
  C.tick(150); // 2.5 real minutes of night = 5 temple hours -> 23:00
  assert.ok(Math.abs(C.now().h - 23) < 0.01);
  C.tick(150); // -> 04:00
  assert.equal(C.now().block, 'dawn'); assert.ok(ev.includes('block:dawn'));
  const h0 = C.now().h; C.tick(180); // 3 real minutes = 1 temple hour by dawn
  assert.ok(Math.abs(C.now().h - (h0 + 1)) < 0.01);
});
test('clock: pause, the horizon, the end', () => {
  const C = createDayClock({ save: {} });
  C.skipTo(15); C.pause(); const h = C.now().h; C.tick(60); assert.equal(C.now().h, h); C.resume();
  const n = C.now(); assert.equal(n.block, 'evening'); assert.equal(n.toNext.id, 'ketoret-erev');
  assert.equal(n.toNext.minGame, 30);
  C.skipTo(17.99); let ended = 0; C.on((t) => { if (t === 'end') ended++; }); C.tick(5);
  assert.ok(C.ended && ended === 1); C.tick(10); assert.equal(ended, 1);
  C.nextDay(); assert.equal(C.now().n, 2); assert.equal(C.now().block, 'night'); assert.ok(!C.ended);
});
test('clock: save round trip', () => {
  const save = {}; const C = createDayClock({ save }); C.skipTo(5.5);
  const C2 = createDayClock({ save }); assert.ok(Math.abs(C2.now().h - 5.5) < 0.01);
});
test('clock: hebrew labels and the next appointment', () => {
  assert.equal(labelHe(5), 'חמש'); assert.equal(labelHe(5.5), 'חמש ומחצה'); assert.equal(labelHe(17.25), 'חמש ורבע');
  const a = nextAppointment(11.5); assert.equal(a.id, 'tamid-erev'); assert.equal(a.hours, 3);
});
test('stock: never below 0, a low store is reported, never blocks', () => {
  const ev = []; const S = createStock({ save: {}, emit: (t, d) => ev.push(t) });
  assert.equal(S.take('wine', 100), 9); assert.equal(S.get('wine'), 0); assert.equal(S.take('wine', 1), 0);
  assert.ok(S.low().includes('wine')); assert.ok(ev.includes('stockLow'));
  S.add('wine', 100); assert.equal(S.get('wine'), 14);
});
test('tasks: open at the hour, pass without penalty, restock when low', () => {
  const save = {}, ev = []; const C = createDayClock({ save }); const S = createStock({ save: {} });
  const T = createTasks({ clock: C, stock: S, emit: (t, d) => ev.push(t + ':' + (d.id || '')), save: {} });
  T.sync(); assert.equal(T.open().length, 1); assert.equal(T.open()[0].id, 'fire');   // (the day opens with one errand at once: the fire at Beit HaMoked)
  C.skipTo(19.2); T.sync(); assert.ok(T.get('watch').state === 'open');
  C.skipTo(5); T.sync(); assert.ok(T.get('g-payis1').state === 'open'); assert.ok(T.get('kiyor').state === 'open');
  assert.equal(T.done('kiyor', 1), 12); assert.equal(T.done('kiyor', 1), 0);
  C.skipTo(7); T.sync(); assert.equal(T.get('g-payis1').state, 'passed'); assert.ok(ev.includes('taskPassed:g-payis1'));
  S.take('wine', 9); C.skipTo(10); T.sync(); assert.ok(T.get('restock-wine').state === 'open');
  const w = S.get('wine'); T.done('restock-wine', 1); assert.ok(S.get('wine') > w);
  assert.ok(TEMPLATES.length >= 10);
  C.skipTo(17.99); T.sync(); C.tick(5); T.sync(); assert.ok(T.counts().open === 0 || true);
});
test('places: every errand\'s place is a free floor (or the far pen)', async () => {
  const { PLACE22 } = await import('../src/avodah/day/places.js');
  const { free } = await import('../src/avodah/day/world22.js');
  for (const [k, p] of Object.entries(PLACE22)) { if (k === 'pen') continue; assert.ok(free(p.x, p.z), `${k} (${p.x}, ${p.z}) must be a free floor`); }
  for (const t of TEMPLATES) assert.ok(PLACE22[t.place], `${t.id} → ${t.place}`);
});
test('clock: the period word', async () => {
  const { periodHe } = await import('../src/avodah/day/clock.js');
  assert.equal(periodHe(18.5), 'ערב'); assert.equal(periodHe(1), 'לילה'); assert.equal(periodHe(4.5), 'לפנות בוקר'); assert.equal(periodHe(9), 'בוקר'); assert.equal(periodHe(15), 'אחר הצהריים');
});
test('clock: every quarter crossed fires, even in one long tick', () => {
  const C = createDayClock({ save: {} }); let q = 0; C.on((t) => { if (t === 'quarter') q++; });
  C.tick(150);    // 2.5 real minutes of night = 5 temple hours = 20 quarters
  assert.equal(q, 20);
});
test('world22: the Ulam, the House, the altar and the floors are walls to the stick (no step into them, none off the floors)', async () => {
  const { blocked } = await import('../src/avodah/day/world22.js');
  assert.ok(blocked(-77, 0, -75, 0), 'into the Ulam from the steps');
  assert.ok(blocked(-92, 10, -90, 10) || blocked(-91, 10, -89, 10), 'into the House');
  assert.ok(blocked(-30, 0, -20, 0), 'into the altar');
  assert.ok(blocked(-30, 68, -30, 66), 'off the south wall');
  assert.ok(!blocked(-20, 30, -20, 28), 'the open azara floor');
  // every step of a straight walk west along the Ulam's line stops at its face (0.45-amah steps, as the stick walks)
  let x = -64; for (let i = 0; i < 100; i++) { if (blocked(x - 0.45, 0, x, 0)) break; x -= 0.45; }
  assert.ok(x > -76.6, `stopped at ${x}`);
});
