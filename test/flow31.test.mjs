// ── flow31 ── FLOW31 (WAVE31): the field's layout, the one-verb button (engine work), level 1 one at a time — node, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PLACE31, ROUTES31, GATE31, legs31, verb31, goLabel31 } from '../src/avodah/shift/layout31.js';
import { createShift, starsOf } from '../src/avodah/shift/engine.js';
import { LEVELS } from '../src/avodah/shift/levels.js';
import { free } from '../src/avodah/day/world22.js';
import { ALTAR } from '../src/places.js';

test('layout31 (build 3): every id of the brief has a place; the stands on the free floor; the places are the REAL anchors', () => {
  for (const id of ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh', 'kemitza', 'haktara', 'melika', 'mitzui', 'kiyor', 'hagasha']) {
    const p = PLACE31[id]; assert.ok(p && p.at && p.stand, id);
    assert.ok(free(p.stand.x, p.stand.z), `${id} stand free`);
    assert.ok(Math.hypot(p.stand.x - p.at.x, p.stand.z - p.at.z) <= 10, `${id}: the stand by the thing`);
  }
  // ── fable32 (build 3) ── the owner (13.10): "הפעולות לא מבוצעות במקומן" — the laver, the morning ring, a marble table, the SW corner, the ramp's foot
  assert.deepEqual([PLACE31.kiyor.at.x, PLACE31.kiyor.at.z], [-63.5, 20]); assert.ok(PLACE31.kiyor.stand.x >= -54.95, 'the kohen at the steps\' foot');
  assert.deepEqual([PLACE31.shechita.at.x, PLACE31.shechita.at.z], [-47, -33.5]); assert.deepEqual(PLACE31.samicha.stand, PLACE31.shechita.stand);
  assert.equal(PLACE31.nituach.at.z, -56); assert.deepEqual([PLACE31.hagasha.at.x], [-53]); assert.equal(PLACE31.kevesh.at.z, 42.5); assert.equal(PLACE31.melika.at.x, -23);
  const L = legs31(ROUTES31.olah); assert.equal(L.length, 5);
  for (const [a, b, d] of L) assert.ok(d <= 100, `${a}→${b} ${d}`);   // (straight legs ≤ 100 amot: the tables to the ramp's foot is the court's longest — ~5 s at 20 amot/s)
  assert.ok(GATE31.x > ALTAR.x1);
});
test('the button\'s words: "לך ל<place>" with the article folded; the verb kept on its line', () => {
  assert.equal(goLabel31('הכבש'), 'לך לכבש'); assert.equal(goLabel31('השער'), 'לך לשער'); assert.equal(goLabel31('מזבח'), 'לך למזבח');
  assert.match(verb31('shechita', {}), /^שחטו — /); assert.equal(verb31('x', { verb31: 'סמכו — הקישו' }), 'סמכו — הקישו');
});

function rig(level) {
  const H = { x: -19, y: 16, z: 6, vx: 0, vz: 0 };
  const STATIONS = {}; for (const id in PLACE31) STATIONS[id] = { id, he: PLACE31[id].he, icon: PLACE31[id].icon, at: PLACE31[id].at, stand: PLACE31[id].stand };
  STATIONS.rings = { id: 'rings', he: 'הטבעות', at: { x: -17, y: 16, z: -11 }, stand: { x: -15, z: -11 } }; STATIONS.altar = { id: 'altar', he: 'המזבח', at: { x: -23, y: 16, z: -18 }, stand: { x: -20.4, z: -16.3 } };
  let id = 0; const P = [];
  const pilgrims = { spawn(type) { const p = { id: ++id, type, icon: '🐑', patience: 1, state: 'wait', route: ROUTES31[type] ? ROUTES31[type].slice() : null, step: 0, pos: { x: -15, y: 16, z: 3 } }; P.push(p); return p; },
    tick() { for (const p of P) if (p.state === 'taken') { p.pos.x = H.x + 1; p.pos.z = H.z; } }, list: () => P.filter((p) => !p.removed && p.state !== 'done' && p.state !== 'left'), take() {}, release() {}, remove(p) { p.removed = true; }, done(p) { p.removed = true; } };
  const pending = [];
  const stations = { STATIONS, act: () => new Promise((res) => { pending.push(() => res({ quality: 1, gold: true })); }), cue() {}, place() {}, clear() {} };
  const hud = { set() {}, stamp() {}, hint(t) { this.h = t; } };
  const E = createShift({ level, world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, pilgrims, save: {}, rng: () => 0.3, speed: 20, gateSpot: GATE31 });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  return { E, H, P, hud, step };
}
test('one verb: far from the next place "לך ל…" (a tap walks him), within 3 amot its verb (a tap acts); a waiting pilgrim: "קחו את עולה הרגל"', async () => {
  globalThis.__SH_AUTOWALK = true; globalThis.__SH_WALKACT = true;   // ── fable32 ── (wave 31's walk-then-act, kept as a test of the route; build 4 stops at the place — the next test) ── /fable32 ──
  const R = rig(1); R.E.start(); await R.step(2.5);
  const w0 = R.E.work(R.H); assert.ok(w0, 'a word at once');
  if (R.E.state().lav31 === false) { assert.equal(w0.label, 'לך לכיור'); w0.go(); await R.step(5); await R.step(1); }   // ── fable32 (build 3) ── (the real laver: 43 amot from the gate) ── /fable32 ──
  const wt = R.E.work(R.H); assert.equal(wt.label, 'קחו את עולה הרגל'); wt.go(); await R.step(0.3);
  assert.ok(R.E.state().carried != null);
  const n = R.E.flowNext(); assert.equal(n.kind, 'station');
  const far = R.E.work(R.H); assert.match(far.label, /^לך ל/); assert.ok(far.go31);
  far.go(); far.go();   // (a second tap on the way: the walk goes on)
  await R.step(4);
  assert.ok(R.E.debug.log().some((e) => e[1] === 'act' && e[2] === n.id), 'the walk ended in the act: ' + JSON.stringify(R.E.debug.log().slice(-4)));
  const n2 = R.E.flowNext(); R.H.x = n2.at.x + 1; R.H.z = n2.at.z;   // (within reach of the next one)
  const near = R.E.work(R.H); assert.ok(near.near31, JSON.stringify(near)); assert.match(near.label, /\s—\s/);
  assert.match(R.hud.h || '', /הכפתור/);
  delete globalThis.__SH_AUTOWALK; delete globalThis.__SH_WALKACT;
});
test('build 4: the walk ends AT the place and stops ("הגעת" logged, no act by itself); the button then says the verb and a tap acts', async () => {
  globalThis.__SH_AUTOWALK = true;
  const R = rig(1); R.E.start(); await R.step(2.5);
  const w0 = R.E.work(R.H); assert.equal(w0.label, 'לך לכיור'); w0.go(); await R.step(6);
  const log = R.E.debug.log();
  assert.ok(log.some((e) => e[1] === 'arrive' && e[2] === 'kiyor'), 'arrived: ' + JSON.stringify(log.slice(-4)));
  assert.ok(!log.some((e) => e[1] === 'act'), 'no act by itself');
  assert.ok(Math.hypot(R.H.x - (-54.3), R.H.z - 20) <= 3.2, `at the laver's stand: ${R.H.x.toFixed(1)}, ${R.H.z.toFixed(1)}`);
  const w1 = R.E.work(R.H); assert.ok(w1.near31, JSON.stringify(w1)); assert.match(w1.label, /^קדשו/);
  w1.go(); await R.step(0.5);
  assert.ok(R.E.debug.log().some((e) => e[1] === 'act' && e[2] === 'kiyor'), 'the tap acts');
  delete globalThis.__SH_AUTOWALK;
});
test('level 1: four, one at a time; ★ 2 · ★★ 3 · ★★★ 4 and the rival beaten', async () => {
  const L = LEVELS[1]; assert.equal(L.count, 4); assert.ok(L.one31); assert.equal(L.patienceS, 45); assert.equal(L.rival.perS, 0.6);
  const R = rig(1); R.E.start(); await R.step(8);
  assert.equal(R.P.length, 1, 'the second only after the first is served or gone');
  assert.equal(starsOf(L, 2, 4, 50, 54), 1); assert.equal(starsOf(L, 3, 4, 50, 54), 2); assert.equal(starsOf(L, 4, 4, 120, 54), 3);
});
test('the flow files: the fence, no Divine Name', () => {
  const N = [String.fromCharCode(0x5d4, 0x5f3), String.fromCharCode(0x5d0, 0x5dc, 0x5e7, 0x5d9, 0x5dd), String.fromCharCode(0x5d0, 0x2d, 0x5dc), String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4)];
  for (const f of ['src/avodah/shift/flow31.js', 'src/avodah/shift/layout31.js', 'test/kid31.cjs', 'test/flow31-touch.cjs']) {
    const s = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8'); assert.ok(s.includes('── flow31 ──'), f);
    for (const n of N) assert.ok(!s.includes(n), f + ' has a forbidden name');
  }
});
// ── /flow31 ──
