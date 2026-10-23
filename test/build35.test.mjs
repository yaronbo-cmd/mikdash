// ── fable32 (build 35) ── E1 of the work environment (docs/specs/svivat-avoda-he.md §3, §9 item 1; the owner, 22.10 22:02: "האש לא במרכז.
// כל העבודה חשובה."): the fire goes to the background and the morning is measured by the work, not by a clock — on the engine (test/rig33.mjs,
// FLAGS: e35 on, as shift/index.js passes it) and on the shipped sources: no fuel, drain, alarm, day clock, tamid countdown or lateness
// reachable; the fire always burns and its look follows the morning's maaracha (מהודר high, כשר normal — the court's is כשר); the ramp run
// inside the maaracha role only; the morning ends on its work (the close, then the summary); the summary's rows; the ממונה's tasks of the
// work; the wood loop's pads hidden; an older save's day goes on cleanly; practice and the lamb chamber unaffected; the Name never.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { E35, TASKS35, tasks35ForDay, tasksNow33, D21, M22, P23, P25, P26, P27, R19, C18, DAY33, PRAC31, rampY19 } from '../src/avodah/shift/day33.js';
import { LINE30, RATE30, words30 } from '../src/avodah/shift/rate30.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import { createLobby } from '../src/avodah/shift/lobby35.js';
import { rig, FLAGS, FLAGS34, seeded } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = 3600e3;
const code = (s) => s.replace(/\/\*[^]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');   // (a file's code without its comments)

// ───────── the morning, played through the engine's own surface ─────────
const twin = () => { const T = { held: false, held19: () => T.held, stick: () => ({ on: false }), pace: { k: 0 } }; return T; };
/** a save after N−1 mornings (as tools/autoplay35-run.cjs --day N): the lots' history (P23.open, P26.open), each role once */
function after(n) {
  const T23 = ['deshen', 'm22', 'lamb', 'deshen', 'm22', 'lamb'], R26 = ['menorah', 'inner', 'menorah', 'shochet', 'zorek', 'menorah'], past = Math.max(0, Math.min(5, n - 1));
  const roles23 = { m: past, h: T23.slice(0, past).map((id, i) => [i + 1, id, id]) }, roles26 = { m: past, h: R26.slice(0, past).map((id, i) => [i + 1, id]) };
  for (const id of [...T23.slice(0, past), ...R26.slice(0, past)]) roles23[id] = { n: ((roles23[id] && roles23[id].n) | 0) + 1, best: 100, last: 100 };
  if (past) roles23.kiyor = { n: past, best: 100, last: 100 };
  return past ? { day33state: { day: n - 1, night: true, at: Date.now() }, roles23, roles26, served30: past } : {};
}
async function settle(R) { await R.step(0.5); }
const ACT = {
  async kiyor(R, poor) {
    for (let i = 0; i < 60 && !R.E.k20(); i++) await R.step(0.1);
    for (let i = 0; i < 40 && R.E.k20() && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', true); R.E.k20in('R', true);
    if (poor) for (let i = 0; i < 3; i++) { await R.step(0.4); R.E.k20in('R', false); await R.step(0.1); R.E.k20in('R', true); }
    for (let i = 0; i < 80 && R.E.k20() && R.E.k20().ph === 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', false); R.E.k20in('R', false);
  },
  async lot(R) { for (let i = 0; i < 160 && (R.E.p23() || R.E.gate23() || R.E.gate26L()); i++) { const K = R.E.p23(); if (K && (K.ph === 'in' || K.ph === 'raise')) R.E.p23raise(); if (K && K.ph === 'choose') R.E.p23pick(0); await R.step(0.2); } },
  async deshen(R) {
    R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.4); await settle(R);
    for (let i = 0; i < D21.layers; i++) { R.E.d21swipe(0.6, 0.05, 100); await R.step(0.3); }
    await R.step(1); R.E.d21stick(1);
    for (let i = 0; i < 900 && R.E.d21() && R.E.d21().ph !== 'foot'; i++) { R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); }
    const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6);
  },
  /** the maaracha: the sort, the carry up the ramp (run: walked down the ramp's length by z, held or not), the stack, the lighting */
  async m22(R, o = {}) {
    const w = R.STATIONS.wood.stand; R.at(w.x, w.z); await R.step(0.3); await settle(R);
    let bad = o.bad | 0;   // (unfit logs taken: the first morning's first one only warned — a poorer pyre, still kasher-or-better)
    for (let i = 0; i < 300 && R.E.m22() && ['in', 'sort', 'sorted'].includes(R.E.m22().ph); i++) { const K = R.E.m22(); if (K.ph === 'sort' && K.ls === 'on') { const take = K.cur.ok || bad-- > 0; R.E.m22swipe(take ? 0.5 : -0.5, 0, 100); } await R.step(0.1); }
    assert.equal(R.E.m22().ph, 'carry');
    if (o.run) await o.run(R); else { R.at(-38, 46); await R.step(0.2); for (let z = 44; z >= 11; z -= 0.45) { R.at(-34, z, rampY19(z)); await R.step(0.05); } }
    R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0);
    const K = R.E.m22(), dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);
    for (const size of 'LMS') {
      if (!K.got.some((g) => g.size === size && !g.at)) continue;
      const r = M22.r[size], i1 = K.got.findIndex((g) => g.size === size && !g.at); R.E.m22place(i1, -0.6);
      const i2 = K.got.findIndex((g) => g.size === size && !g.at); if (i2 >= 0) R.E.m22place(i2, size === 'S' ? 0 : -0.6 + dFor(o.air != null ? o.air : 0.35, r));
    }
    for (let i = 0; i < 30 && R.E.m22().ph !== 'ready'; i++) await R.step(0.1);
    R.E.m22tap(); await R.step(M22.ign + 0.3);
  },
  async lamb(R) {
    R.at(P25.stand.x, P25.stand.z); await R.step(0.4); await settle(R);
    for (let i = 0; i < 40 && R.E.p25() && R.E.p25().ph !== 'scan'; i++) await R.step(0.1);
    for (let n = 0; n < 8 && R.E.p25() && !/^(ok|lead|end)$/.test(R.E.p25().ph); n++) {
      const K = R.E.p25();
      if (K.L.blem) { R.E.p25stamp('pasul'); await R.step(P25.aside + 0.1); R.E.p25tap(); await R.step(P25.bring + 0.1); }
      else { for (const s of K.L.spots.filter((x) => x.kind === 'dirt')) { R.E.p25focus(s.i); R.E.p25tap(); await R.step(P25.zoom + 0.1); R.E.p25swipe(0.5, 0.02, 100); await R.step(P25.clean + 0.1); } R.E.p25stamp('tamim'); await R.step(P25.ok + 0.2); }
    }
  },
  async gate(R) { R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(P26.key + 0.2); R.E.r26hold(false); await R.step(P26.opn + 0.2); },
  async inner(R) { await ACT.gate(R); const a = P26.alt; R.at(a.x + 1, a.z); await R.step(1.2); for (let i = 0; i < P26.pulls && R.E.r26() && R.E.r26().ph === 'pull'; i++) { R.E.r26pull(1.5); await R.step(0.2); } await R.step(P26.leave + 0.2); },
  async menorah(R) {
    await ACT.gate(R); const a = P26.walkM; R.at(a.x + 1, a.z); await R.step(1.2);
    for (let i = 0; i < 600 && R.E.r26() && !['out'].includes(R.E.r26().ph); i++) {
      const K = R.E.r26();
      if (K.ph === 'wick') R.E.r26swipe(0, -0.5, 100); else if (K.ph === 'wipe') R.E.r26swipe(0.5, 0, 100);
      else if (K.ph === 'pour' && !K.held) R.E.r26hold(true); else if (K.ph === 'pour' && K.held && K.fill >= 0.95) R.E.r26hold(false);
      else if (K.ph === 'new' || K.ph === 'kuz') R.E.r26tap(); else if (K.ph === 'drag') R.E.r26light();
      await R.step(0.05);
    }
  },
  async shochet(R) {
    R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.4); await settle(R);
    R.E.r27bind(true); await R.step(P27.bound + 0.1);
    for (let i = 0; i < 300 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
    for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await R.step(0.01, 0.01); }
    R.E.r27tap(); await R.step(P27.cutd + 0.2);
  },
};
/** a whole morning: the laver, the first lot and his role, the second lot (where he stands) and his role → the engine's rig */
async function morning(day, o = {}) {
  const save = o.save || after(day), R = rig(o.flags || FLAGS, { save, twin: o.twin || twin(), rng: seeded(o.seed || 5) });
  R.E.start(); await R.step(0.3);
  await ACT.kiyor(R, o.poorKiyor); await ACT.lot(R);
  const lot = R.E.lot23(); await ACT[lot](R, o.m22 || {});
  for (let i = 0; i < 40 && (R.E.word30() || R.E.j32card()); i++) await R.step(0.1);
  R.at(-24, 32, 16); await R.step(0.4); await ACT.lot(R);   // (east of the ramp, on the court's floor: the second lot where he stands)
  const role = R.E.role26(); await ACT[role](R);
  return { R, save, lot, role };
}
const allEv = (R) => R.events.map((e) => e.type);

// ───────── (1) no fuel, drain, alarm, day clock, tamid countdown or lateness in the shipped morning ─────────
test('build 35 (1): the shipped flags carry e35; the engine\'s morning has no drain, no clock, no tamid, no "late" — through a whole morning and 5 idle minutes after its start', async () => {
  assert.match(read('src/avodah/shift/index.js'), /e35: !g\.__SH35_OFF/);
  assert.equal(FLAGS.e35, true);
  const { R } = await morning(2);
  const types = allEv(R);
  for (const k of ['late', 'tamid', 'level']) assert.ok(!types.includes(k), `no "${k}" event`);
  assert.ok(!R.E.debug.log().some((x) => /^(embers|tamid|tamid-late|night|open|merchant|lost|feed)$/.test(x[1])), 'no embers, tamid, night, "נפתח", merchant, lost lamb or feeding');
  assert.equal(R.E.focus17().tamid, null); assert.equal(R.E.focus17().drain, 0); assert.equal(R.E.state().left, DAY33.dayS, 'the day clock never runs');
  // idle on the laver's morning for 5 minutes: the fire's look stays, nothing counts down, nothing turns "late"
  const I = rig(FLAGS, { save: after(3), twin: twin() }); I.E.start(); await I.step(0.3);
  const f0 = I.E.state().fuel; await I.step(300, 0.25);
  assert.equal(I.E.state().fuel, f0); assert.equal(I.E.state().left, DAY33.dayS); assert.equal(I.E.state().summary, false); assert.ok(!allEv(I).some((k) => /late|tamid|summary/.test(k)));
  for (const x of I.hud.st || []) assert.ok(!/איחר|באיחור|דועכת|נפתח:|המערכה ברמה/.test(x), x);
  // the old loop's badges ("🔥 המערכה ברמה 2", the logs …) are not earned in the morning of the work (an older save at level 3: none; the days' are)
  const B = rig(FLAGS, { save: { day33state: { day: 3, at: Date.now(), fed: 25, washed: false } }, twin: twin() }); B.E.start(); await B.step(1);
  assert.deepEqual(B.E.state().badges, ['day3']); assert.ok(!B.events.some((e) => e.type === 'pop' && /המערכה ברמה/.test(e.text)));
});
test('build 35 (1): the HUD — no fire ring (.f17-top.f35 hides it), no tamid line, no alarm (the fire\'s class is none in the morning of the work), no "האש דועכת" banner; the intro and the lobby speak of the work', () => {
  const f = read('src/avodah/shift/focus17.js');
  assert.match(f, /\.f17-top\.f35 \.f17-fire\{display:none\}/);
  assert.match(f, /const cls = F\.gate \|\| F\.e35 \? '' : fuelClass\(fuel\);/, 'no warn/crit — so no alarm, no banner');
  assert.match(f, /top\.classList\.toggle\('f35', !!F\.e35\)/);
  const ix = read('src/avodah/shift/index.js');
  assert.ok(!/hud\.intro\('יום במקדש', '[^']*(בקעו|שהאש|גחלת)/.test(ix), 'the day-loop intro is gone'); assert.match(ix, /hud\.intro\('יום במקדש', 'הכיור, הפיס — וכל העבודה חשובה'/);
  const L = [createLobby({ save: after(3), start: true }).html(), createLobby({ save: after(3), start: false }).html()].join('\n');
  assert.ok(!/האש, העצים|המערכה מחכה|בקעו|העלו \d+ גזרים/.test(L), 'the lobby: no fire loop'); assert.match(L, /הכיור, הפיס ועבודת הבוקר/);
});
test('build 35 (1): the old loop\'s stations have no door — runAt / tapStation of the wood, the ramp\'s trips, the stores, the old pen, the song: false; no station chip (the salt chamber\'s door stays, its bag); the bar\'s dead slots hidden (the laver alone)', async () => {
  const R = rig(FLAGS, { save: after(3), twin: twin() }); R.E.start(); await R.step(0.3); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.done26(); await R.step(0.2);
  for (const id of ['wood', 'kevesh', 'oil', 'bake', 'pen', 'song', 'pyre']) { const s = R.STATIONS[id].stand; R.at(s.x, s.z); assert.equal(await R.E.runAt(id), false, id); assert.equal(R.E.tapStation(id), false, id); }
  assert.deepEqual(R.E.shown33(), [], 'no station chip'); const sa = R.STATIONS.salt.stand; R.at(sa.x, sa.z); R.E.st33.r19.bag = 0; assert.equal(await R.E.runAt('salt'), true, 'the salt chamber\'s door'); assert.ok(R.E.st33.r19.bag > 0, 'the salt chamber\'s bag at its door');
  const B = rig(FLAGS, { save: after(3), twin: twin() }); B.E.start(); await B.step(0.3);
  assert.deepEqual(B.E.bar17().map((x) => x.id), ['kiyor']);
  const O = rig(FLAGS34, { save: after(3), twin: twin() }); O.E.start(); await O.step(0.3); O.E.debug.fed(200); await O.step(0.2);
  assert.ok(O.E.bar17().length > 1 && O.E.shown33().includes('wood'), 'the old loop behind the flag');
});

// ───────── (2) the fire always present; (3) its look by the morning's maaracha ─────────
test('build 35 (2): the fire always burns — the night\'s fire before the lot, the coals from the lot to the pyre\'s lighting, then the pyre\'s look; __FIRE33 always set (≥ the embers\' 0.25), __FIRELOW33 0', async () => {
  const R = rig(FLAGS, { save: after(2), twin: twin(), seed: 5 }); R.E.start(); await R.step(0.3);
  assert.equal(R.E.look35(), 'night'); assert.equal(globalThis.__FIRE33, E35.look.night); assert.equal(globalThis.__FIRELOW33, 0);
  await ACT.kiyor(R); await ACT.lot(R); assert.equal(R.E.lot23(), 'm22'); assert.equal(R.E.look35(), 'ember'); assert.equal(globalThis.__FIRE33, E35.look.ember);
  for (const v of Object.values(E35.look)) assert.ok(v >= 0.25 && v <= 1.6, 'within life.js\'s range');
  assert.ok(E35.look.mehudar > E35.look.kasher && E35.look.kasher > E35.look.night && E35.look.night > E35.look.ember);
  const lf = read('src/life.js'); assert.match(lf, /globalThis\.__FIRE35/); assert.match(lf, /sparks35/); assert.match(lf, /smokeClean/);
});
test('build 35 (3): a מהודר pyre — the fire high and clean for the rest of the morning (sparks, white smoke); a כשר one — normal; the court\'s pyre (an ashes or a lamb morning) — כשר', async () => {
  const A = await morning(2);   // (his pyre, a good air gap: מהודר)
  const m = A.R.ev('rate30').find((e) => e.id === 'm22'); assert.equal(m.rating, 'mehudar');
  assert.equal(A.R.E.look35(), 'mehudar'); assert.equal(A.R.E.m22r().look, 'mehudar');
  for (let i = 0; i < 20; i++) await A.R.step(0.2);
  assert.equal(globalThis.__FIRE33, E35.look.mehudar); assert.deepEqual({ ...globalThis.__FIRE35 }, { k: 'mehudar', sp: 1, clean: 1 });
  assert.ok(A.R.ev('fire35').some((e) => e.look === 'mehudar'));
  const B = await morning(2, { m22: { bad: 3 } });   // (unfit woods taken: a כשר pyre — never a penalty)
  const r = B.R.ev('rate30').find((e) => e.id === 'm22'); assert.notEqual(r.rating, 'mehudar');
  assert.equal(B.R.E.look35(), 'kasher'); assert.equal(globalThis.__FIRE33, E35.look.kasher); assert.equal(globalThis.__FIRE35.sp, 0);
  const C = await morning(1); assert.equal(C.lot, 'deshen'); assert.equal(C.R.E.look35(), 'kasher', 'the court\'s pyre');
  const D = await morning(3); assert.equal(D.lot, 'lamb'); assert.equal(D.R.E.look35(), 'kasher', 'the court\'s pyre');
  // the next morning starts again with the night's fire
  for (let i = 0; i < 80 && !D.R.E.state().summary; i++) await D.R.step(0.2);
  D.R.E.nextDay(); await D.R.step(0.3); assert.equal(D.R.E.look35(), 'night');
});

// ───────── (4) the ramp run inside the maaracha role ─────────
test('build 35 (4): the ramp run lives in the maaracha role — his logs up the ramp once: the R19 run (its ghost, its time), the stick\'s pace on the ramp (not the morning\'s quick one), the right thumb\'s hold steadying the basket; its coins are the act\'s', async () => {
  let sway = { held: 0, free: 0 }, paces = [];
  const T = twin();
  const run = (held) => async (R) => {
    T.held = held; R.at(-38, 46); await R.step(0.2);
    for (let z = 44; z >= 11; z -= 0.45) { R.at(-34, z, rampY19(z)); await R.step(0.05); if (z < 38 && z > 14) { sway[held ? 'held' : 'free'] = Math.max(sway[held ? 'held' : 'free'], Math.abs(R.E.st33.r19.A)); if (T.pace.k) paces.push(T.pace.k); } }
    T.held = false;
  };
  const A = await morning(2, { twin: T, m22: { run: run(true) } });
  const top = A.R.ev('top'); assert.equal(top.length, 1, 'once'); assert.equal(top[0].m22, true);
  assert.ok(A.R.E.m22r().run && A.R.E.m22r().run.t > 0, 'the run kept with the act\'s record');
  assert.ok(paces.length && paces.every((k) => Math.abs(k - R19.v1 / 7) < 1e-9 || Math.abs(k - 1 / 7) < 1e-9), `the R19 pace on the ramp (${[...new Set(paces)].join(',')})`);
  assert.ok(!A.R.ev('coins').some((c) => c.why === 'act:kevesh'), 'no coins for the run itself');
  assert.ok(A.R.ev('sway').length >= 1, 'his first maaracha: "החזיקו — הסל מתייצב"');
  const B = await morning(2, { twin: T, m22: { run: run(false) } });
  assert.ok(sway.held > 0 && sway.free > sway.held * 2, `the hold steadies (${sway.held.toFixed(3)} held, ${sway.free.toFixed(3)} free)`);
  void B;
  // outside the maaracha role: no run (the ashes' morning — his pan down the ramp is the ashes' own walk, R19 never starts)
  const C = await morning(1); assert.equal(C.R.ev('top').length, 0); assert.equal(C.R.ev('act').filter((e) => e.id === 'kevesh').length, 0);
});
test('build 35 (4): a log dropped on the run — a gold ring on the ramp, the way and the line to it ("הרימו את הגזר"), the stacking waits until it is picked up; never on his first maaracha', async () => {
  assert.ok(LINE30.m22.log && words30(LINE30.m22.log) >= 2 && words30(LINE30.m22.log) <= 4);
  const T = twin(), save = after(5); save.roles23.m22 = { n: 1, best: 90, last: 90 };   // (a maaracha he has had: the run may drop a log)
  const R = rig(FLAGS, { save, twin: T, rng: () => 0 }); R.E.start(); await R.step(0.3);
  R.E.debug.wash20(); R.E.debug.skip23('m22'); await R.step(0.2);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); await R.step(0.3); await R.step(0.5);
  for (let i = 0; i < 300 && R.E.m22() && ['in', 'sort', 'sorted'].includes(R.E.m22().ph); i++) { const K = R.E.m22(); if (K.ph === 'sort' && K.ls === 'on') R.E.m22swipe(K.cur.ok ? 0.5 : -0.5, 0, 100); await R.step(0.1); }
  assert.equal(R.E.m22().ph, 'carry'); const n0 = R.E.st33.logs;
  R.at(-38, 46); await R.step(0.2);
  for (let z = 44; z >= 20 && !R.E.st33.r19.fl.length; z -= 0.9) { R.at(-37, z, rampY19(z)); await R.step(0.1); }   // (fast, not held, on bare stone)
  assert.equal(R.E.st33.r19.fl.length, 1, 'a log dropped'); assert.equal(R.E.st33.logs, n0 - 1);
  assert.equal(R.E.flowNext().id, 'log19'); assert.equal(R.E.step17().text, LINE30.m22.log);
  R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0); assert.equal(R.E.m22().ph, 'carry', 'the stacking waits for it');
  const L = R.E.st33.r19.fl[0]; for (let i = 0; i < 20 && R.E.st33.r19.fl.length; i++) { R.at(L.x, L.z, rampY19(L.z)); await R.step(0.2); }
  assert.equal(R.E.st33.r19.fl.length, 0); assert.equal(R.E.st33.logs, n0, 'picked up');
  R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0); assert.equal(R.E.m22().ph, 'stack');
  // his first maaracha: no drop
  const F = rig(FLAGS, { save: after(2), twin: twin(), rng: () => 0 }); F.E.start(); await F.step(0.3); F.E.debug.wash20(); F.E.debug.skip23('m22'); await F.step(0.2);
  F.at(w.x, w.z); await F.step(0.8);
  for (let i = 0; i < 300 && F.E.m22() && ['in', 'sort', 'sorted'].includes(F.E.m22().ph); i++) { const K = F.E.m22(); if (K.ph === 'sort' && K.ls === 'on') F.E.m22swipe(K.cur.ok ? 0.5 : -0.5, 0, 100); await F.step(0.1); }
  F.at(-38, 46); await F.step(0.2); for (let z = 44; z >= 12; z -= 0.9) { F.at(-37, z, rampY19(z)); await F.step(0.1); }
  assert.equal(F.E.st33.r19.fl.length, 0);
});

// ───────── (5) the morning ends on its work ─────────
test('build 35 (5): the morning ends when its work is done — after his last act\'s word the close (the fade with "הבוקר הושלם", then the altar\'s view and its source line), then the summary; never by a clock', async () => {
  const { R, role } = await morning(2); assert.equal(role, 'inner');
  assert.equal(R.E.state().summary, false); assert.equal(R.E.workDone35(), true);
  for (let i = 0; i < 60 && !R.E.close35(); i++) await R.step(0.1);
  const c0 = R.ev('close35'); assert.equal(c0[0].ph, 'fade'); assert.equal(R.E.camWork35(), null, 'under the dark: no view yet');
  const r = R.ev('rate30').at(-1); assert.ok(c0[0].t - r.t >= RATE30.wordS - 0.11, 'after the rating\'s word');
  assert.equal(R.E.work(R.H), null, 'no button in the close'); assert.equal(R.E.step17().text, 'הבוקר הושלם'); assert.equal(R.E.flowNext(), null);
  await R.step(E35.fade + 0.1); const v = R.ev('close35').find((e) => e.ph === 'view'); assert.ok(v && v.src === E35.src); assert.match(E35.src, /ויקרא ו, ו · טיוטה/);
  const cam = R.E.camWork35(); assert.deepEqual(cam.view.p, [...E35.cam.p]); assert.deepEqual(cam.view.t, [...E35.cam.t]);
  assert.match(read('src/avodah/shift/index.js'), /camWork: \(\) => \(E && E\.camWork20 \? \(E\.camWork35 && E\.camWork35\(\)\)/, 'the close\'s view first in the chain');
  await R.step(E35.close - E35.fade - 0.2); assert.equal(R.E.state().summary, false);
  await R.step(0.4); assert.equal(R.E.state().summary, true); assert.equal(R.ev('summary').length, 1); assert.equal(R.save.day33state.night, true, 'saved: the next morning');
  assert.equal(R.ev('summary')[0].t - c0[0].t <= E35.close + 0.2, true);
  // the next morning: the laver again
  R.E.nextDay(); await R.step(0.3); assert.equal(R.E.state().day, 3); assert.equal(R.E.gate20(), true); assert.equal(R.E.close35(), null);
});
test('build 35 (5): a shochet morning ends after his cut\'s word (the court\'s zorek goes on in the close\'s view); the close waits for a journal card', async () => {
  const S = await morning(4); assert.equal(S.role, 'shochet');
  for (let i = 0; i < 100 && !S.R.E.state().summary; i++) await S.R.step(0.1);
  assert.equal(S.R.E.state().summary, true);
  const sum = S.R.ev('summary')[0], want = ['deshen', 'm22', 'lamb'].filter((x) => x !== S.lot).concat(['zorek', 'inner', 'menorah']);
  assert.deepEqual(sum.court.map((x) => x.id).sort(), want.sort(), 'the court: the first lot\'s other two, the second lot\'s other three');
  // a card up (the morning's lamb card — the day waits under it, as under the journal's): the close waits for it
  const { R } = await morning(2); R.E.st33.tl33card = { i: 1, c: 0, d: 0, role: 'inner' };
  await R.step(RATE30.wordS + 1); assert.equal(R.E.close35(), null, 'under the card: no close');
  R.E.tl33done(); await R.step(0.3); assert.equal(R.E.close35().ph, 'fade');
  assert.match(read('src/avodah/shift/day33.js'), /if \(!workDone35\(\) \|\| \(st\.end30 && st\.t < st\.end30\.until\) \|\| st\.j32q \|\| st\.j32card \|\| st\.tl33card\) return;/, 'the journal\'s card too');
});

// ───────── (6) the summary's rows ─────────
test('build 35 (6): the summary — his acts with ratings, the court\'s acts named plainly, the ממונה\'s three by name, the coins; no tamid row, no "afternoon tamid", no logs, no ramp time', async () => {
  const { R, lot, role } = await morning(2);
  for (let i = 0; i < 100 && !R.E.state().summary; i++) await R.step(0.1);
  const s = R.E.focus17().summary;
  assert.equal(s.e35, true); assert.deepEqual(s.tamids, []);
  assert.deepEqual(s.ratings.map((x) => x.id), ['kiyor', lot, role]); assert.ok(s.ratings.every((x) => RATE30.ids.includes(x.rating)));
  assert.deepEqual(s.court.map((x) => x.id).sort(), ['deshen', 'lamb', 'm22', 'inner', 'menorah', 'shochet', 'zorek'].filter((x) => x !== lot && x !== role).sort());
  assert.equal(s.taskList.length, 3); assert.ok(s.taskList.every((q) => TASKS35.some((t) => t.id === q.id)));
  assert.ok(s.c18 && s.c18.earn > 0); assert.equal(s.fire, 'mehudar');
  const f = read('src/avodah/shift/focus17.js'), sum = f.slice(f.indexOf('function showSummary'), f.indexOf('function close35'));
  assert.match(sum, /rows = e35 \? `\$\{acts\}\$\{court\}\$\{tk\}`/, 'the work\'s rows'); assert.match(sum, /<h2>🌅 הבוקר הושלם<\/h2>/);
  assert.match(sum, /כהני העזרה:/); assert.match(sum, /משימות הממונה:/);
  assert.ok(!/בין הערביים|באיחור|איחר/.test(sum), 'no evening tamid, no lateness');
});

// ───────── (7) the ממונה's tasks about the work ─────────
test('build 35 (7): TASKS35 — three a day, about the work (never a count of logs or salt), each paying DAY33.taskReward; the day\'s three by the day; what cannot be offered gives its place', () => {
  assert.deepEqual(TASKS35.map((q) => q.id), ['kiyorH', 'prac', 'roleH', 'ch33', 'twoH', 'fresh']);
  for (let d = 1; d <= 12; d++) { const t = tasks35ForDay(d, after(6)).map((q) => q.id); assert.ok(!(t.includes('prac') && t.includes('ch33')), `day ${d}: at most one of the opening screen's two`); }
  assert.ok(TASKS35.every((q) => !/גזר|עצים|מלח|בקעו|העלו/.test(q.text)), 'no wood, no salt');
  assert.ok(TASKS35.some((q) => q.text === '💧 מהודר בכיור') && TASKS35.some((q) => q.text === '🆕 תפקיד שלא היה לך עד היום') && TASKS35.some((q) => q.text === '🎭 תרגלת תפקיד בספר') && TASKS35.some((q) => q.text === '🐑 בדקת טלה בלשכה') && TASKS35.some((q) => q.text === '⭐ מהודר בתפקיד שלך'));
  for (let d = 1; d <= 12; d++) { const t = tasks35ForDay(d, after(Math.min(d, 6))); assert.equal(t.length, 3, `day ${d}`); assert.equal(new Set(t).size, 3); }
  assert.ok(!tasks35ForDay(1, {}).some((q) => q.id === 'prac'), 'day 1: no role to practise yet');
  const all = { roles23: Object.fromEntries(['kiyor', 'deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek'].map((id) => [id, { n: 2 }])) };
  for (let d = 1; d <= 6; d++) assert.ok(!tasks35ForDay(d, all).some((q) => q.id === 'fresh'), 'every role had: no "first role" task');
  assert.equal(DAY33.taskReward, 5);
});
test('build 35 (7): the tasks done in the morning — "מהודר בכיור", "מהודר בתפקיד שלך", "שתי עבודות מהודרות", "תפקיד שלא היה לך" — each paid once, "משימה ✓"; "תרגלת תפקיד בספר" and "בדקת טלה בלשכה" from the opening screen\'s marks', async () => {
  const { R, save } = await morning(2);
  for (let i = 0; i < 10; i++) await R.step(0.2);
  const ids = R.E.tasks35().map((q) => q.id), done = R.E.tasks35().filter((q) => q.done).map((q) => q.id);
  assert.deepEqual(ids, tasks35ForDay(2, after(2)).map((q) => q.id));
  for (const id of ids) if (['kiyorH', 'roleH', 'twoH', 'fresh'].includes(id)) assert.ok(done.includes(id), `${id} done (a quick, exact morning)`);
  const paid = R.ev('task'); assert.equal(paid.length, done.length); assert.ok(paid.every((e) => e.pay === DAY33.taskReward));
  assert.equal(R.ev('coins').filter((c) => TASKS35.some((q) => q.id === c.why)).reduce((a, c) => a + c.n, 0), DAY33.taskReward * done.length);
  void save;
  // the marks from the opening screen (shift/index.js: the practice's record merged → save.prac35; the chamber's inspection → save.ch35)
  const ix = read('src/avodah/shift/index.js'); assert.match(ix, /save\.prac35 = resumeDay33\(save\) \|\| 1/); assert.match(ix, /save\.ch35 = resumeDay33\(save\) \|\| 1/);
  const sv = after(4), day = 4; let d = 0; for (let k = 0; k < 6 && !tasks35ForDay(day + d, sv).some((q) => q.id === 'prac'); k++) d++;
  sv.day33state.day = day + d - 1; sv.prac35 = day + d;
  const P = rig(FLAGS, { save: sv, twin: twin() }); P.E.start(); await P.step(0.8);
  assert.ok(P.E.tasks35().find((q) => q.id === 'prac').done, 'practised before the morning: done at its start'); assert.ok(P.ev('task').some((e) => e.id === 'prac'));
  const n = tasksNow33(sv); assert.ok(n.tasks.find((q) => q.id === 'prac').done, 'the lobby\'s card marks it too');
});

// ───────── (8) the pads ─────────
test('build 35 (8): the pads — "גרזן טוב" and "טנא גדול" (the wood loop\'s) hidden; the laver\'s second spigot as it is', async () => {
  const R = rig(FLAGS, { save: { ...after(3), perutot: 500 }, twin: twin() }); R.E.start(); await R.step(0.3);
  assert.deepEqual(R.E.pads18().map((x) => x.id), ['kiyor2']); assert.deepEqual(R.E.focus17().c18.pads.map((x) => x.id), ['kiyor2']);
  for (const id of ['axe', 'basket10']) { const p = C18.pads.find((x) => x.id === id); R.at(p.x, p.z); await R.step(C18.padS + 0.5); assert.ok(!(R.save.day33 && R.save.day33[id]), `${id}: not bought`); }
  const k = C18.pads.find((x) => x.id === 'kiyor2'); assert.equal(k.price, 40); assert.equal(C18.kiyorK, 0.6);
  assert.match(read('src/avodah/shift/fx18.js'), /\(c\.pads \|\| C18\.pads\)\.forEach/);
});

// ───────── (9) an older save goes on cleanly ─────────
test('build 35 (9): older saves — mid-day with fuel, the day clock and its tamids: the morning of the work, no "late", nothing carried; its morning already done: the close and the summary; saved at night: the next morning; "המשך יום N"', async () => {
  // the naive kid's own older save (tools/kid34: d3) — mid-day, fuel 64, the clock at 180, the tamids waiting, the laver not yet
  const kid = { day33state: { day: 3, night: false, at: Date.now() - 3 * H, fuel: 64, fed: 25, logs: 0, left: 180, perutot: 12, washed: false, tamD: 'wait', tamE: 'late', lateDay: 1, lambs: [true, true, false, false, false, false], tasks: [['chop6', true], ['carry10', false], ['chop12', false]] } };
  assert.match(createLobby({ save: kid, start: true }).html(), /המשך יום 3/);
  const A = rig(FLAGS, { save: kid, twin: twin() }); A.E.start(); await A.step(0.5);
  assert.equal(A.E.state().day, 3); assert.equal(A.E.gate20(), true, 'the laver first'); assert.equal(A.E.st33.lateDay, 0); assert.equal(A.E.look35(), 'night');
  assert.deepEqual(A.E.tasks35().map((q) => q.id), tasks35ForDay(3, kid).map((q) => q.id));
  await A.step(60); assert.ok(!A.events.some((e) => /late|tamid|summary/.test(e.type)));
  // carrying the old basket, mid-day after the morning's acts: logs let go, the close, the summary, the next day
  const old = { day33state: { day: 4, at: Date.now() - 2 * H, washed: true, fuel: 30, fed: 40, logs: 3, basketQ: ['gold', 'good', 'ok'], left: 64, tamD: 'ok', tamE: 'wait', p23day: 4, lot: 'deshen', d21day: 4, m22day: 4, p26day: 4, role26: 'shochet', g26day: 4, r26day: 4, r19: { g: [], gd: 4, n: 0, cov: 0, fl: [{ x: -36, z: 30, v: 0, g: 'good' }], bag: 0, slips: 1 }, tasks: [] } };
  const B = rig(FLAGS, { save: old, twin: twin() }); B.E.start(); await B.step(0.3);
  assert.equal(B.E.st33.logs, 0); assert.equal(B.E.st33.r19.fl.length, 0); assert.equal(B.E.look35(), 'kasher');
  for (let i = 0; i < 80 && !B.E.state().summary; i++) await B.step(0.1);
  assert.equal(B.E.state().summary, true); assert.equal(B.ev('close35').length >= 1, true);
  B.E.nextDay(); await B.step(0.3); assert.equal(B.E.state().day, 5); assert.equal(B.E.gate20(), true);
  // saved at the old night: the next morning
  const night = { day33state: { day: 2, night: true, at: Date.now(), fuel: 12, left: 0, tamE: 'late' } };
  assert.match(createLobby({ save: night, start: true }).html(), /המשך יום 3/);
  const C = rig(FLAGS, { save: night, twin: twin() }); C.E.start(); await C.step(0.3); assert.equal(C.E.state().day, 3); assert.equal(C.E.gate20(), true);
});

// ───────── (10) practice and the lamb chamber ─────────
test('build 35 (10): practice and the lamb chamber are unaffected — the act at once, its end card; no close, no summary, no tasks; the saved day untouched', async () => {
  const save = after(6); save.day33state = { day: 6, at: Date.now(), washed: true, p23day: 6, lot: 'm22', tasks: [] };
  const day0 = JSON.stringify(save.day33state);
  for (const role of ['m22', 'deshen', 'menorah']) {
    const R = rig(FLAGS, { save: practiceSave31(save), twin: twin(), practice: { role, day: 6, fed: 0, seed: 77 } }); R.E.start(); if (role === 'deshen') R.H.y = 25; await R.step(0.4);
    assert.equal(R.E.prac31, role); assert.equal(R.E.look35(), role === 'menorah' ? 'kasher' : 'ember');
    await R.step(10); assert.equal(R.E.close35(), null); assert.equal(R.E.state().summary, false); assert.deepEqual(R.E.tasks35(), []);
  }
  const ch = rig(FLAGS, { save: practiceSave31(save), twin: twin(), practice: { role: 'lamb', day: 6, fed: 0, seed: 20300, ch33: { dn: 20300, done: true, sky: 'noon', lit: 'day', mine: 0, court: 0, tags: [], next: 0 } } });
  ch.E.start(); await ch.step(1); assert.equal(ch.E.close35(), null); assert.equal(ch.E.state().summary, false); assert.equal(ch.E.look35(), 'kasher');
  assert.equal(JSON.stringify(save.day33state), day0);
  assert.equal(PRAC31.roles.length, 8);
});

// ───────── the Divine Name ─────────
test('build 35: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/day33.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/fx18.js', 'src/avodah/shift/index.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/rate30.js', 'src/life.js',
    'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build35.test.mjs', 'test/rig33.mjs', 'test/build26.test.mjs', 'test/build28.test.mjs', 'test/build29.test.mjs', 'test/build31.test.mjs', 'test/build32.test.mjs', 'test/build33.test.mjs', 'test/build34.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  void code;
});
