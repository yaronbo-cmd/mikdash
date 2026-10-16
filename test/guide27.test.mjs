// ── guide27 ── the guide's pure parts: the floor's A*, "לך ל…", primary/meanwhile, practice, never empty (WAVE27 GUIDE27)
import test from 'node:test';
import assert from 'node:assert/strict';
import { planPath, toPlace, createGuide, isMeanwhile } from '../src/avodah/day/guide27.js';
import { free } from '../src/avodah/day/world22.js';
import { createDayClock } from '../src/avodah/day/clock.js';
import { createStock } from '../src/avodah/day/stock.js';
import { createTasks } from '../src/avodah/day/tasks.js';
import { PLACE22, placeAt } from '../src/avodah/day/places.js';

test('the article folds into ל: לך למזבח, לכיור, לדיר, ללשכת הגזית', () => {
  assert.equal(toPlace('המזבח'), 'למזבח'); assert.equal(toPlace('הכיור'), 'לכיור'); assert.equal(toPlace('הדיר'), 'לדיר');
  assert.equal(toPlace('לשכת הגזית'), 'ללשכת הגזית'); assert.equal(toPlace('שער ניקנור'), 'לשער ניקנור');
});

test('A*: from the court to every errand place, on free floor, every leg in sight', () => {
  const from = { x: -15, z: 0 };
  for (const id of Object.keys(PLACE22)) {
    const q = PLACE22[id], pts = planPath(from.x, from.z, q.x, q.z);
    if (!free(q.x, q.z) && !free(q.x + 2, q.z) && !free(q.x - 2, q.z)) { assert.equal(pts, null, id + ' lies off the floors (the pens): no way, the walk fades there'); continue; }
    assert.ok(pts && pts.length, 'a way to ' + id);
    const last = pts[pts.length - 1];
    assert.ok(Math.hypot(last.x - q.x, last.z - q.z) <= 10, `${id}: ends near its marker (${last.x},${last.z})`);
    let px = from.x, pz = from.z;
    for (const p of pts) { assert.ok(free(p.x, p.z), `${id}: ${p.x},${p.z} free`); px = p.x; pz = p.z; }
    void px; void pz;
  }
});

function mkDay(h) {
  const save = { n: 1, h: 18 }, clock = createDayClock({ save }), stock = createStock({ save: {} }), tasks = createTasks({ clock, stock, save: {} });
  const hero = { x: -15, y: 16, z: 0, yaw: 0 };
  const WORKS = {}; for (const k of tasks.list()) if (k.work) WORKS[k.work] = { id: k.work, he: 'עבודה ' + k.work };
  const G = createGuide({ S: { hero: { drive() {}, setPos() {} } }, tasks, clock, placeAt, heroP: () => hero, WORKS, GAMES: {}, emit: () => {} });
  if (h != null) { clock.skipTo(h); tasks.sync(); }
  return { clock, tasks, G, hero };
}

test('primary: the next step by the clock; the queue / restocks / practice are meanwhile', () => {
  const { G, tasks } = mkDay(4.7);
  const p = G.primary(); assert.ok(p && !isMeanwhile(p));
  for (const k of tasks.open()) if (!isMeanwhile(k)) assert.ok(((k.openH - 18 + 24) % 24) >= ((p.openH - 18 + 24) % 24) - 1e-9);
  const hud = G.hud(); assert.match(hud.h2, /^עכשיו: (לך ל.+ — .+|.+ — כאן)$/); assert.match(hud.h3, /^בינתיים: /);
  assert.ok(isMeanwhile({ id: 'queue' }) && isMeanwhile({ restock: 'wine' }) && isMeanwhile({ practice: true }) && !isMeanwhile({ id: 'fire' }));
});

test('practice: a done work re-opens as practice with half points; sync never passes it', () => {
  const { G, tasks, clock } = mkDay(4.3);
  const k = tasks.get('kiyor'); assert.equal(k.state, 'open'); const pts0 = k.pts;
  tasks.done('kiyor', 1); assert.equal(k.state, 'done');
  const p = G.practice('kiyor'); assert.ok(p && p.practice && p.state === 'open' && p.pts === Math.round(pts0 / 2));
  clock.skipTo(9); tasks.sync(); assert.equal(tasks.get('kiyor').state, 'open', 'past its hour, the practice stays open');
});

test('never empty: ≥ 2 open at every hour 4…17 even when he did everything (practice fills)', () => {
  const { G, tasks, clock } = mkDay(null);
  // G.enter needs no DOM: on → ensure works; pretend he entered
  G.enter();
  for (let h = 4; h <= 17; h += 0.5) {
    clock.skipTo(h); tasks.sync();
    for (const k of tasks.open()) tasks.done(k.id, 1);   // he did every open one at once
    G.ensure();
    const n = tasks.open().length;
    assert.ok(n >= 2, `hour ${h}: ${n} open (${tasks.open().map((k) => k.id)})`);
  }
});

test('the next primary: a waiting step later today', () => {
  const { G } = mkDay(4.05);
  const nx = G.nextPrimary(); assert.ok(nx && nx.k.state === 'wait' && !isMeanwhile(nx.k));
});
