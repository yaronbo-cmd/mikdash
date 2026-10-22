// ── recovered (R9) ── build 23 (node): the lot (pis23) — POOL23 (six roles, three built), the morning's lot after the laver (gate23: the
// circle, the raised finger, the ממונה's count, the card), draw23's schedule by the lot's own morning count (P23.open: the ashes, the pyre,
// the lamb), from the fourth morning two cards and never yesterday's role, the other kohanim at the role he did not draw (npc23), the
// record (save.roles23: rec23, mastery23 0…100, the best), the roles' book's rows (bookOf23).
// ── fable32 (build 28) ── from the fourth morning ONE card, drawn, never yesterday's (P23.two → P23.draw; the owner, 22.10 09:19: "פיס נקי,
// קלף אחד"): the two tests of the two-card lot now hold the one card ── /fable32 ──
import test from 'node:test';
import assert from 'node:assert/strict';
import { POOL23, P23, D21, bookOf23 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

async function lot(save = {}, flags = upTo('p25'), pick = 0) {
  const R = rig(flags, { save }); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.3);
  const ph = []; for (let i = 0; i < 80 && R.E.p23(); i++) { const K = R.E.p23(); if (ph.at(-1) !== K.ph) ph.push(K.ph); if (K.ph === 'in' || K.ph === 'raise') R.E.p23raise(); if (K.ph === 'choose') R.E.p23pick(pick); await R.step(0.2); }
  return { R, ph };
}
const mornings = (h) => ({ roles23: { m: h.length, h: h.map((id, i) => [i + 1, id, id]) } });

test('build 23: POOL23 — six roles of the morning, three built (the ashes, the pyre, the lamb)', () => {
  assert.equal(POOL23.length, 6); assert.deepEqual(POOL23.filter((r) => r.built).map((r) => r.id), ['deshen', 'm22', 'lamb']);
  assert.ok(POOL23.every((r) => r.he && r.icon)); assert.ok(Object.isFrozen(POOL23) && Object.isFrozen(POOL23[0]));
});
test('build 23: P23 — the schedule (ashes, pyre, lamb), the draw from the fourth morning (build 28: one card; was two), the circle of 8 at r 3.2 by the laver', () => {
  assert.deepEqual([...P23.open], ['deshen', 'm22', 'lamb']); assert.equal(P23.draw, 4); assert.equal(P23.two, undefined); assert.equal(P23.seats, 8); assert.equal(P23.r, 3.2);
  assert.deepEqual({ x: P23.c.x, z: P23.c.z }, { x: -51, z: 23.4 });
});
test('build 23: after the laver the lot begins by itself — in, the raised finger, the ממונה\'s count, the card shown', async () => {
  const { R, ph } = await lot(); assert.deepEqual(ph, ['in', 'raise', 'call', 'count', 'show']);
  assert.ok(R.ev('p23raise').length === 1 && R.ev('p23done').length === 1);
});
test('build 23: the first morning\'s lot is the ashes (תרומת הדשן); the other kohanim do the pyre (npc23)', async () => {
  const { R } = await lot(); assert.equal(R.E.lot23(), 'deshen'); assert.equal(R.E.npc23(), 'm22'); assert.equal(R.E.gate21(), true);
});
test('build 23: the second morning draws the pyre — the ashes are the others\' (done for him)', async () => {
  const { R } = await lot(mornings(['deshen'])); assert.equal(R.E.lot23(), 'm22'); assert.equal(R.E.gate21(), false);
});
test('build 23: the third morning draws the lamb (with the lamb\'s pen built, build 25)', async () => {
  const { R } = await lot(mornings(['deshen', 'm22'])); assert.equal(R.E.lot23(), 'lamb');
});
test('build 23 (build 28): from the fourth morning — one card, never yesterday\'s role; no choice', async () => {
  const { R, ph } = await lot(mornings(['deshen', 'm22', 'lamb'])); assert.ok(!ph.includes('choose'), ph.join());   // (was: two cards and a pick)
  const cards = R.ev('p23').find((e) => e.cards).cards; assert.equal(cards.length, 1); assert.ok(!cards.includes('lamb'), String(cards));
  assert.equal(R.E.lot23(), cards[0]);
});
test('build 23: the lot is recorded — save.roles23: the morning count and its history', async () => {
  const { R } = await lot(); assert.deepEqual(R.save.roles23, { m: 1, h: [[1, 'deshen', 'deshen']] }); assert.equal(R.E.roles23(), R.save.roles23);
});
test('build 23: while the lot runs (gate23) the stations wait ("gate", p23)', async () => {
  const R = rig(upTo('p23')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.1);
  assert.equal(R.E.gate23(), true); const w = R.STATIONS.wood.stand; R.at(w.x, w.z); assert.equal(await R.E.runAt('wood'), false);
  assert.ok(R.ev('gate').some((e) => e.id === 'wood' && e.p23));
});
test('build 23: E.p23raise — his own raised finger (the engine\'s "auto" is not his to send), once, its seconds kept (rS); p23pick only in the choice', async () => {
  const R = rig(upTo('p23')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.3);
  assert.equal(R.E.p23raise('auto'), true); assert.equal(R.E.p23raise(), false); assert.equal(R.E.p23().raised, true); assert.ok(Number.isFinite(R.E.p23().rS));
  assert.equal(R.E.p23pick(0), false, 'not in the choice');
});
test('build 23: the ashes done in his lot — mastery23 0…100 into the record (n, best, last), "p23rec"; a better one is a record', async () => {
  const { R } = await lot();
  R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8); for (let i = 0; i < 4; i++) R.E.d21swipe(0.6, 0.05, 100); await R.step(1);
  R.E.d21stick(1); for (let i = 0; i < 300 && R.E.d21().ph !== 'foot'; i++) { R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); }
  const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6 + D21.end);
  const rec = R.save.roles23.deshen; assert.ok(rec); assert.equal(rec.n, 1); assert.ok(rec.last >= 0 && rec.last <= 100); assert.equal(rec.best, rec.last);
  assert.equal(R.E.d21r().mastery, rec.last); assert.equal(R.ev('p23rec').length, 1);
});
test('build 23: bookOf23 — the roles\' book rows: open once played, how often, the best and the last', () => {
  const rows = bookOf23({ roles23: { deshen: { n: 2, best: 80, last: 70 } } });
  assert.equal(rows.length, POOL23.length); const d = rows.find((r) => r.id === 'deshen');
  assert.deepEqual({ open: d.open, n: d.n, best: d.best, last: d.last, built: d.built }, { open: true, n: 2, best: 80, last: 70, built: true });
  assert.equal(rows.find((r) => r.id === 'm22').open, false); assert.deepEqual(bookOf23(null).map((r) => r.n), POOL23.map(() => 0));
});
test('build 23: the lot\'s camera — the circle seen from above (camWork23) while it runs', async () => {
  const R = rig(upTo('p23')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.3);
  const c = R.E.camWork23(); assert.ok(c && c.view && c.view.p.length === 3); assert.deepEqual([c.x, c.z], [P23.c.x, P23.c.z]);
  assert.deepEqual([R.E.circ23().x, R.E.circ23().z], [P23.c.x, P23.c.z]); const s = R.E.seat23(0); assert.ok(Math.abs(Math.hypot(s.x - P23.c.x, s.z - P23.c.z) - P23.r) < 1e-9);
});
