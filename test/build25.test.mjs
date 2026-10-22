// ── recovered (R9) ── build 25 (node): the lamb pen (pen25) — BLEM25 (6 kinds × 8 places = 48 blemishes; the dirt), hash25's seed (the
// morning's lamb by the day: day 3's first lamb an obvious wound on the back), his first lamb easier to read, the scan by torchlight
// (focus, the zoom on a spot), the dirt wiped by a swipe, the stamps תמים / פסול (at most two rejections; a false approval: a new lamb
// after 3.2 s on the dawn clock), the record and the coins; at25 (a place on the lamb in the world).
import test from 'node:test';
import assert from 'node:assert/strict';
import { P25, BLEM25, at25 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

const lambMorning = { roles23: { m: 2, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22']] } };
async function pen(save = lambMorning, day = 3) {
  const R = rig(upTo('p25'), { save: JSON.parse(JSON.stringify(save)) }); R.E.start(); await R.step(0.2); R.E.debug.day(day); R.E.debug.wash20(); await R.step(0.3);
  for (let i = 0; i < 80 && R.E.p23(); i++) { const K = R.E.p23(); if (K.ph === 'in' || K.ph === 'raise') R.E.p23raise(); if (K.ph === 'choose') R.E.p23pick(0); await R.step(0.2); }
  R.at(P25.stand.x, P25.stand.z); await R.step(0.8); return R;
}
const ph = (R) => R.E.p25() && R.E.p25().ph;

test('build 25: BLEM25 — six kinds × eight places = 48 blemishes (המחשה), and two kinds of dirt', () => {
  assert.equal(BLEM25.cats.length, 6); assert.equal(BLEM25.regs.length, 8); assert.equal(BLEM25.cats.length * BLEM25.regs.length, 48);
  assert.deepEqual(BLEM25.cats.map((c) => c.id), ['wart', 'crack', 'cloud', 'wound', 'tear', 'swell']); assert.deepEqual([...BLEM25.dirt], ['straw', 'mud']);
  assert.ok(BLEM25.cats.every((c) => c.he) && BLEM25.regs.every((r) => r.he)); assert.equal(BLEM25.regs[6].id, 'back');
});
test('build 25: P25 — at most two rejections, a false approval costs 3.2 s, the dawn in 26 s, the times 8–24 s, 120 points', () => {
  assert.equal(P25.rej, 2); assert.equal(P25.fals, 3.2); assert.equal(P25.dawn, 26); assert.deepEqual([...P25.tT], [8, 24]); assert.equal(P25.score, 120);
});
test('build 25: the third morning\'s lot is the lamb; at the pen\'s stand the inspection begins (gate25, the scan)', async () => {
  const R = await pen(); assert.equal(R.E.lot23(), 'lamb'); assert.ok(R.E.p25on); assert.equal(ph(R), 'scan'); assert.equal(R.E.p25().k, 0);
});
test('build 25: hash25\'s seed — day 3\'s first lamb is an obvious wound on the back (big, one spot)', async () => {
  const R = await pen(); const L = R.E.p25().L;
  assert.deepEqual(L.blem, { c: 3, r: 6 }); assert.equal(BLEM25.cats[L.blem.c].id, 'wound'); assert.equal(BLEM25.regs[L.blem.r].id, 'back');
  assert.equal(L.big, true); assert.equal(L.spots.length, 1); assert.equal(R.E.p25().first, true);
});
test('build 25: the same day, the same lamb (seeded by the day); another day, another lamb', async () => {
  const a = (await pen(lambMorning, 4)).E.p25().L, b = (await pen(lambMorning, 4)).E.p25().L, c = (await pen(lambMorning, 6)).E.p25().L;
  assert.deepEqual(a, b); assert.notDeepEqual(a.blem, c.blem);
});
test('build 25: after his first lamb the lambs are no longer big (the first easier to read)', async () => {
  const R = await pen({ ...lambMorning, roles23: { ...lambMorning.roles23, lamb: { n: 1, best: 50, last: 50 } } }, 5);
  assert.equal(R.E.p25().first, false); assert.equal(R.E.p25().L.big, false);
});
test('build 25: the scan — focus a spot, tap: the zoom, then its kind (a blemish shown 1.6 s, back to the scan)', async () => {
  const R = await pen(); assert.equal(R.E.p25focus(5), false, 'no such spot'); assert.equal(R.E.p25focus(0), true);
  assert.equal(R.E.p25tap(), true); assert.equal(ph(R), 'zoom'); assert.equal(R.E.p25().insp, 1);
  await R.step(P25.zoom + 0.1); assert.equal(ph(R), 'blem'); await R.step(P25.blem + 0.1); assert.equal(ph(R), 'scan');
});
test('build 25: פסול on the blemished lamb — right (no mistake), the lamb aside, the next brought', async () => {
  const R = await pen(); assert.equal(R.E.p25stamp('pasul'), true); assert.equal(ph(R), 'aside');
  const e = R.ev('p25stamp').at(-1); assert.equal(e.ok, true); assert.equal(R.E.p25().rej, 1); assert.equal(R.E.p25().wr, 0);
  await R.step(P25.aside + 0.1); assert.equal(ph(R), 'wait'); assert.equal(R.E.p25tap(), true); assert.equal(ph(R), 'bring'); assert.equal(R.E.p25().k, 1);
});
test('build 25: תמים on a blemished lamb is a false approval — 3.2 s lost (the "false" phase), then a new lamb', async () => {
  const R = await pen(); assert.equal(R.E.p25stamp('tamim'), true); assert.equal(ph(R), 'false'); assert.equal(R.E.p25().fa, 1);
  const e = R.ev('p25stamp').at(-1); assert.equal(e.ok, false); assert.equal(e.why, 'blem');
  await R.step(P25.fals - 0.3); assert.equal(ph(R), 'false'); await R.step(0.5); assert.equal(ph(R), 'wait');
});
test('build 25: at most two rejections a morning — the third פסול is refused ("p25no", max)', async () => {
  const R = await pen(); const next = async () => { await R.step(P25.aside + 0.1); R.E.p25tap(); await R.step(P25.bring + 0.1); };
  assert.equal(R.E.p25stamp('pasul'), true); await next(); assert.equal(R.E.p25stamp('pasul'), true); await next();
  assert.equal(R.E.p25stamp('pasul'), false); assert.ok(R.ev('p25no').some((e) => e.why === 'max'));
});
test('build 25: a whole lamb approved — the record (the own time, the mistakes, the lambs), the coins, the pyre lit', async () => {
  const R = await pen(); R.E.p25stamp('pasul'); await R.step(P25.aside + 0.1); R.E.p25tap(); await R.step(P25.bring + 0.1);
  for (let k = 0; k < 4 && R.E.p25().L.blem; k++) { R.E.p25stamp('pasul'); await R.step(P25.aside + 0.1); R.E.p25tap(); await R.step(P25.bring + 0.1); }
  if (R.E.p25().L.blem) return;   // (two rejections spent on blemished lambs: the case above covers them)
  for (const s of R.E.p25().L.spots) if (s.kind === 'dirt') { R.E.p25focus(s.i); R.E.p25tap(); await R.step(P25.zoom + 0.1); R.E.p25swipe(0.5, 0, 100); await R.step(P25.clean + 0.1); }
  assert.equal(R.E.p25stamp('tamim'), true); assert.equal(ph(R), 'ok'); await R.step(P25.ok + 0.1);
  const r = R.E.p25r(); assert.ok(r); assert.equal(r.falseApprovals, 0); assert.equal(r.lambs, 2); assert.ok(r.coins >= 2); assert.equal(R.ev('p25done').length, 1);
  assert.ok(R.E.state().fuel >= 86 - 0.5, 'the lamb done, the pyre lit (P23.fire)'); assert.ok(R.ev('p23lit').length >= 1);
});
test('build 25: at25 — a place on the lamb in the world (the lamb\'s position, yaw and scale; the head\'s places turn with its yaw)', () => {
  const L = { x: 10, y: 16, z: -5, yaw: 0, s: 1 };
  const back = at25(6, L); assert.ok(Math.abs(back.x - 10.14) < 1e-9 && Math.abs(back.y - 17.8) < 1e-9 && Math.abs(back.z - -5.2) < 1e-9); assert.ok(back.ny > 0.9);
  const eye = at25(2, L), eyeT = at25(2, L, 0.5); assert.notDeepEqual([eye.x, eye.z], [eyeT.x, eyeT.z]);
  const turned = at25(6, { ...L, yaw: Math.PI / 2 }); assert.ok(Math.abs(turned.x - (10 - 0.2)) < 1e-9 && Math.abs(turned.z - (-5 - 0.14)) < 1e-9);
  assert.deepEqual(at25(99, L), at25(6, L), 'an unknown place is the back');
});
test('build 25: the pen\'s view — the scan\'s camera (camWork25) while the inspection runs', async () => {
  const R = await pen(); const c = R.E.camWork25(); assert.ok(c && c.view && c.view.t.length === 3 && c.view.p.length === 3);
});
