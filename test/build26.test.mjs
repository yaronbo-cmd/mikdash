// ── recovered (R9) ── build 26 (node): the Heichal in the morning — the second lot after the pre-dawn task (gate26L; POOL26's thirteen roles of
// יומא ב, ג, two built; draw26 by P26.open: menorah, the inner altar, menorah, then never yesterday's), his inner role (gate26: the great
// gate within P26.reach 3.2 — the bolt by a swipe, the key by a hold; the House open), the menorah (the wick, the wipe, the pour into the
// band 90–100 % — fill26 —, the new wick lit; ev26 a rare lamp gone out, never the first time), the inner altar (seven pulls), the record.
import test from 'node:test';
import assert from 'node:assert/strict';
import { P26, POOL26 } from '../src/avodah/shift/day33.js';
import { HOUSE22 } from '../src/avodah/day/world22.js';
import { rig, FLAGS, FLAGS34 } from './rig33.mjs';

async function morning(save = {}, day = 1, flags = FLAGS) { const R = rig(flags, { save }); R.E.start(); await R.step(0.2); if (day > 1) R.E.debug.day(day); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); await R.step(0.2); return R; }
async function secondLot(R) { R.at(-40, 30); await R.step(0.3); for (let i = 0; i < 80 && R.E.p23(); i++) { const K = R.E.p23(); if (K.ph === 'in' || K.ph === 'raise') R.E.p23raise(); if (K.ph === 'choose') R.E.p23pick(0); await R.step(0.2); } }
async function throughGate(R) { R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(1.0); R.E.r26hold(false); await R.step(1.2); }
async function toRole(role, save = {}, day = 1) {
  const R = await morning(save, day); R.E.debug.skip26(role); await R.step(0.1); await throughGate(R);
  const a = role === 'inner' ? P26.alt : P26.walkM; R.at(a.x + 1, a.z); await R.step(1.0); return R;
}
async function lamps(R, fillTo = 0.95) {
  const g = []; for (let i = 0; i < 400 && R.E.r26() && !['leave', 'kuz', 'kuzd', 'out'].includes(R.E.r26().ph); i++) {
    const K = R.E.r26();
    if (K.ph === 'wick') { g.push('w'); R.E.r26swipe(0, -0.5, 100); } else if (K.ph === 'wipe') { g.push('p'); R.E.r26swipe(0.5, 0, 100); }
    else if (K.ph === 'pour' && !K.held) { g.push('h'); R.E.r26hold(true); } else if (K.ph === 'pour' && K.held && K.fill >= fillTo) R.E.r26hold(false);
    else if (K.ph === 'new') { g.push('t'); R.E.r26tap(); } else if (K.ph === 'drag') { g.push('d'); R.E.r26light(); }
    await R.step(0.05);
  }
  return g;
}

test('build 26: POOL26 — thirteen roles of the second lot (יומא ב, ג), two built (the inner altar, the menorah), each of the lot 2', () => {
  // (build 27 built the shochet and the zorek: four of the thirteen)
  assert.equal(POOL26.length, 13); assert.deepEqual(POOL26.filter((r) => r.built).map((r) => r.id), ['shochet', 'zorek', 'inner', 'menorah']); assert.ok(POOL26.every((r) => r.lot === 2 && r.he));
});
test('build 26: P26 — the schedule (menorah, inner, menorah), the gate at x −89.3 and its reach 3.2, the pour\'s band 0.9–1.0, seven pulls', () => {
  assert.deepEqual([...P26.open].slice(0, 3), ['menorah', 'inner', 'menorah']); assert.equal(P26.reach, 3.2);   // (build 27: + morning 4 the shochet, 5 the zorek) assert.deepEqual({ ...P26.gate }, { x: -89.3, z: 0 });
  assert.equal(P26.pour.lo, 0.9); assert.equal(P26.pour.hi, 1); assert.equal(P26.pulls, 7); assert.equal(P26.ev, 0.2); assert.equal(P26.tT, undefined);   // ── fable32 (build 30) ── (the mastery's time scale is gone) ── /fable32 ──
});
test('build 26: after the pre-dawn task the morning holds — the second lot (gate26L), the clock and the stations wait', async () => {
  // (build 35: the old loop's wood station and day clock are FLAGS34's — in the morning of the work the wood has no door at all)
  const R = await morning({}, 1, FLAGS34); assert.equal(R.E.gate26L(), true); assert.equal(R.E.gate26(), false); assert.equal(R.E.p26on, true);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); assert.equal(await R.E.runAt('wood'), false); assert.ok(R.ev('gate').some((e) => e.id === 'wood' && (e.p26 || e.p23)), 'held by the second lot');
  const left = R.E.state().left; await R.step(2); assert.equal(R.E.state().left, left, 'the clock waits');
  const N = await morning(); assert.equal(N.E.gate26L(), true); N.at(w.x, w.z); assert.equal(await N.E.runAt('wood'), false); assert.ok(!N.ev('gate').some((e) => e.id === 'wood'), 'build 35: no door to the wood');
});
test('build 26: the second lot — the first morning\'s role is the menorah (P26.open), recorded in save.roles26', async () => {
  const R = await morning(); await secondLot(R); assert.equal(R.E.role26(), 'menorah'); assert.deepEqual(R.save.roles26, { m: 1, h: [[1, 'menorah']] });
  assert.equal(R.E.gate26L(), false); assert.equal(R.E.gate26(), true); assert.equal(R.E.flowNext().id, 'r26');
});
test('build 26: draw26 — the second morning the inner altar, the third the menorah, the fourth never yesterday\'s', async () => {
  const roles = (h) => ({ roles26: { m: h.length, h: h.map((r, i) => [i + 1, r]) } });
  const a = await morning(roles(['menorah'])); await secondLot(a); assert.equal(a.E.role26(), 'inner');
  const b = await morning(roles(['menorah', 'inner'])); await secondLot(b); assert.equal(b.E.role26(), 'menorah');
  const c = await morning(roles(['menorah', 'inner', 'menorah'])); await secondLot(c); assert.equal(c.E.role26(), 'shochet', 'build 27: the fourth morning is the shochet\'s');
});
test('build 26: the great gate — within 3.2 amot it begins; the bolt by a swipe, the key by a hold (0.8 s): the House open (HOUSE22.gate)', async () => {
  const R = await morning(); R.E.debug.skip26('menorah'); await R.step(0.1);
  R.at(P26.gate.x + P26.reach + 1, P26.gate.z); await R.step(0.3); assert.ok(!R.E.r26(), 'out of reach');
  R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8); assert.equal(R.E.r26().ph, 'bolt');
  assert.equal(R.E.r26swipe(0.5, 0, 100), true); assert.equal(R.E.r26().ph, 'key'); R.E.r26hold(true); await R.step(P26.key - 0.2); assert.equal(R.E.r26().ph, 'key');
  await R.step(0.4); assert.equal(R.E.r26().ph, 'open'); assert.equal(R.E.open26(), true); assert.ok(Number.isFinite(R.E.g26t())); assert.equal(HOUSE22.gate, true); assert.equal(R.ev('r26gate').length, 1);
});
test('build 26: the key lifted turns back (P26.back a second)', async () => {
  const R = await morning(); R.E.debug.skip26('menorah'); await R.step(0.1); R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8);
  R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(0.4); const kp = R.E.r26().kp; R.E.r26hold(false); await R.step(0.2);
  assert.ok(Math.abs(R.E.r26().kp - (kp - 0.2 * P26.back)) < 0.03);
});
test('build 26: fill26 — the pour rises fast to the knee (1.5 a second to 0.7), then slowly (0.34), at most 1.16', () => {
  // (the curve, through the engine: a held pour from 0)
  const P = P26.pour; let f = 0; const step = (dt) => { let t = dt; if (f < P.knee) { const k = Math.min(t, (P.knee - f) / P.r0); f += k * P.r0; t -= k; } f = Math.min(P.max, f + t * P.r1); };
  step(0.4); assert.ok(Math.abs(f - 0.6) < 1e-9); step(0.2); assert.ok(Math.abs(f - (P.knee + (0.2 - (P.knee - 0.6) / P.r0) * P.r1)) < 1e-9); for (let i = 0; i < 100; i++) step(0.1); assert.equal(f, P.max);
  assert.ok((P.lo - P.knee) / P.r1 + P.knee / P.r0 > 1 && (P.hi - P.knee) / P.r1 + P.knee / P.r0 < 1.5, 'the band reached in about 1.06–1.35 s');
});
test('build 26: the pour — released in the band (90–100 %): good, the new wick next; over 100 %: spilled; under 90 %: not yet', async () => {
  const R = await toRole('menorah'); R.E.r26swipe(0, -0.5, 100); R.E.r26swipe(0.5, 0, 100); assert.equal(R.E.r26().ph, 'pour');
  R.E.r26hold(true); for (let i = 0; i < 40 && R.E.r26().fill < 0.5; i++) await R.step(0.05); R.E.r26hold(false); await R.step(0.05);
  assert.equal(R.ev('r26pour').at(-1).why, 'under'); assert.equal(R.E.r26().ph, 'pour');
  R.E.r26hold(true); for (let i = 0; i < 60 && R.E.r26().fill < 1.05; i++) await R.step(0.05); R.E.r26hold(false); await R.step(0.05);
  assert.equal(R.ev('r26pour').at(-1).why, 'over'); assert.equal(R.E.r26().ph, 'spill');
  await R.step(P26.spill + 0.1); R.E.r26hold(true); for (let i = 0; i < 40 && R.E.r26().fill < 0.95; i++) await R.step(0.05); R.E.r26hold(false); await R.step(0.05);
  assert.equal(R.ev('r26pour').at(-1).ok, true); assert.equal(R.E.r26().ph, 'new');
});
test('build 26: the menorah — five lamps cleaned, filled and lit (the first in four gestures, then three), "men5t", the record', async () => {
  const R = await toRole('menorah'); const g = await lamps(R);
  assert.equal(g.join(''), 'wpht' + 'wht'.repeat(4)); assert.ok(Number.isFinite(R.E.men5t()));
  for (let i = 0; i < 100 && R.E.r26() && R.E.r26().ph !== 'out'; i++) { if (R.E.r26().ph === 'kuz') R.E.r26tap(); await R.step(0.1); }
  const r = R.E.r26r(); assert.equal(r.role, 'menorah'); assert.equal(r.lamps, 5); assert.equal(r.over, 0); assert.equal(r.coins, 3); assert.ok(r.mastery >= 90);
});
test('build 26: the inner altar — set before it, seven pulls of the ash into the teni (15 % each, the seventh the sweep), the record', async () => {
  const R = await toRole('inner'); await R.step(0.6); assert.equal(R.E.r26().ph, 'pull');
  const ash = []; for (let i = 0; i < P26.pulls; i++) { assert.equal(R.E.r26pull(1.5), true); ash.push(Math.round(R.E.r26().ash * 100)); await R.step(0.2); }
  assert.deepEqual(ash, [85, 70, 55, 40, 25, 10, 0]); await R.step(1.2);
  const r = R.E.r26r(); assert.equal(r.role, 'inner'); assert.equal(r.pulls, 7); assert.equal(r.scratches, 0); assert.equal(r.accuracy, 100);
});
test('build 26: a pull too fast scratches the gold (−5 % on the accuracy)', async () => {
  const R = await toRole('inner'); await R.step(0.6); R.E.r26pull(P26.vmax + 1); assert.equal(R.E.r26().scr, 1); assert.equal(R.E.r26().acc, 100 - P26.scr);
});
test('build 26: ev26 — a lamp gone out (the drag from the next) on a few mornings only, never the first time', async () => {
  const days = []; for (let d = 1; d <= 30; d++) { const R = await toRole('menorah', { roles23: { menorah: { n: 1, best: 80, last: 80 } } }, d); if (R.E.r26().ev) days.push(d); }
  assert.ok(days.length >= 1 && days.length <= 12, String(days));
  for (const d of days.slice(0, 3)) { const R = await toRole('menorah', {}, d); assert.equal(R.E.r26().ev, false, 'the first time: no event (day ' + d + ')'); }
});
test('build 26: the authored view at the lamp (camWork26) — about 3–4 amot from it, above it', async () => {
  const R = await toRole('menorah'); R.E.r26swipe(0, -0.5, 100); const c = R.E.camWork26(); assert.ok(c && c.view);
  const [px, py, pz] = c.view.p, [tx, ty, tz] = c.view.t, d = Math.hypot(px - tx, pz - tz); assert.ok(d >= 2.8 && d <= 4.5, String(d)); assert.ok(py > ty);
});
