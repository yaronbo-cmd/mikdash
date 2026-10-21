// ── shift29 ── SHIFT29A: the shift engine (levels, rival, score, combo, stars, the opening, the coal) — node, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createShift, servePoints, comboOf, starsOf, OPENING } from '../src/avodah/shift/engine.js';
import { LEVELS, levelOf, ROUND_S } from '../src/avodah/shift/levels.js';
import { createRival, rivalName } from '../src/avodah/shift/rival.js';
import { MISHMAROT } from '../src/calendar.js';
globalThis.__SH_WALKACT = true;   // ── fable32 (build 4) ── (wave 29's contract: tapStation walks AND acts; in play since build 4 the walk stops at the place and the button acts) ── /fable32 ──

// a seeded rng
const seeded = (s = 7) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
// a world stub: the hero walks at the driven velocity; stations act after a delay; pilgrims stand where spawned
function rig(level, o = {}) {
  const H = { x: -9, y: 16, z: 0, vx: 0, vz: 0 };
  const STATIONS = { kiyor: { at: [-57, 16, 14] }, rings: { at: [-56, 16, -36] }, altar: { at: [-17, 16, 3] }, duchan: { at: [-13, 16, -6] }, seals: { at: [-20, 16, -20] },
    // ── route31 ── ── /route31 ──
    samicha: { at: [-17, 16, -6] }, shechita: { at: [-17, 16, -11] }, zerika: { at: [-23, 16, -18] }, nituach: { at: [-13, 16, -16] }, kevesh: { at: [-34, 16, 42] }, hagasha: { at: [-23, 16, 12] }, kemitza: { at: [-19, 16, 30] }, haktara: { at: [-34, 16, 42] }, melika: { at: [-23, 16, 10] }, mitzui: { at: [-23, 16, 12] } };
  let id = 0; const P = [];
  const pilgrims = {
    spawn(type) { const p = { id: ++id, type, icon: '🐑', patience: 1, state: 'wait', route: null, step: 0, pos: { x: -4, y: 16, z: 2 * P.length } }; P.push(p); return p; },
    tick() { for (const p of P) if (p.state === 'taken') { p.pos.x = H.x + 1; p.pos.z = H.z; } },
    list: () => P.filter((p) => p.state !== 'gone'), take() {}, release() {}, remove(p) { p.removed = true; const i = P.indexOf(p); if (i >= 0) P.splice(i, 1); },
  };
  const acts = [];
  const stations = { STATIONS, act: (sid, p) => new Promise((res) => { acts.push(sid); pending.push(() => res({ quality: 1, gold: o.gold !== false })); }), cue() {}, place() {}, clear() {} };
  const pending = [];
  const hud = { states: [], stamps: [], set(s) { this.last = s; }, stamp(t) { this.stamps.push(t); }, opening(steps, h) { this.op = { steps, h, marks: [] }; const op = this.op; return { mark(i, k) { op.marks.push([i, k]); }, close() { op.closed = true; }, place() {} }; }, ring(id, h) { this.coal = h; return { close() {}, at() {} }; } };
  const save = {};
  const E = createShift({ level, world: { hero: { drive(vx, vz) { H.vx = vx; H.vz = vz; }, setPos(x, z) { H.x = x; H.z = z; } } }, heroPos: () => H, hud, stations, pilgrims, save, rng: seeded(3), speed: 20 });
  const step = async (s, dt = 0.1) => { for (let t = 0; t < s - 1e-9; t += dt) { H.x += H.vx * dt; H.z += H.vz * dt; E.tick(dt); while (pending.length) { pending.shift()(); await null; await null; } } };
  return { E, H, P, hud, save, acts, step, pilgrims };
}
async function serveOne(R) {
  const p = R.P.find((q) => q.state === 'wait'); assert.ok(p, 'a waiting pilgrim');
  assert.ok(R.E.tapPilgrim(p)); await R.step(1.2);
  assert.equal(R.E.state().carried, p.id);
  // ── route31 ── (the laver once per round; each station: walk until its act runs — the true route has five) ── /route31 ──
  const go = async (s) => { const n = R.acts.length; R.E.tapStation(s); for (let k = 0; k < 70 && R.acts.length === n; k++) await R.step(0.1); await R.step(0.2); };
  if (!R.E.state().washed) await go('kiyor');
  for (const s of p.route.slice()) await go(s);
  return p;
}

test('levels: the contract numbers', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => LEVELS[n].concurrent), [1, 2, 2, 3, 3]);
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => LEVELS[n].count), [4, 8, 10, 12, 14]);   // ── flow31 ── (level 1: four, one at a time) ── /flow31 ──   // (shift30: back to the brief's, the compact ring's short trips)
  assert.deepEqual([1, 2, 3, 4, 5].map((n) => LEVELS[n].rival.perS), [0.6, 1.9, 2.4, 3.0, 3.4]);   // ── flow31 ── (level 1 cannot be lost: 0.6/s) ── /flow31 ──   // (shift30: back to the brief's)
  assert.equal(LEVELS[1].opening, false); assert.equal(LEVELS[2].opening, true); assert.equal(LEVELS[5].event, 'coal');
  assert.deepEqual(LEVELS[1].types, ['olah']); assert.deepEqual(LEVELS[2].types, ['olah', 'ken']);
  assert.equal(levelOf(9).n, 5); assert.equal(levelOf(0).n, 1); assert.equal(ROUND_S, 90);
});
test('rival: steady, never backwards, ≈ perS × 90, a משמר name, never the player own', () => {
  const R = createRival({ perS: 1.4, noise: 0.25, rng: seeded(1) }); let prev = 0;
  for (let i = 0; i < 900; i++) { const s = R.tick(0.1); assert.ok(s >= prev); prev = s; }
  assert.ok(R.score > 1.4 * 90 * 0.8 && R.score < 1.4 * 90 * 1.2, String(R.score));
  assert.equal(rivalName(1, 0), 'ידעיה'); assert.notEqual(rivalName(1, 2), 'ידעיה');
  for (let own = 1; own <= 24; own++) for (let lv = 1; lv <= 5; lv++) { const n = rivalName(lv, own); assert.ok(MISHMAROT.includes(n)); assert.notEqual(n, MISHMAROT[own - 1]); }
});
test('score: integers; patience bonus, gold ×1.5, combo ×1.2/×1.5/×2 at 2/4/6', () => {
  assert.equal(servePoints(1, 0, 1), 20); assert.equal(servePoints(0, 0, 1), 10); assert.equal(servePoints(0.55, 1, 1), 24);
  assert.equal(servePoints(1, 1, 2), 60);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 9].map(comboOf), [1, 1.2, 1.2, 1.5, 1.5, 2, 2]);
  for (let i = 0; i < 50; i++) assert.ok(Number.isInteger(servePoints(Math.random(), Math.random(), comboOf(i % 8))));
  const L = LEVELS[1];
  // ── flow31 ── level 1 (4 pilgrims): ★ for 2 served, ★★ for 3, ★★★ for all 4 and the rival beaten ── /flow31 ──
  assert.equal(starsOf(L, 1, 4, 100, 50), 0); assert.equal(starsOf(L, 2, 4, 100, 150), 1); assert.equal(starsOf(L, 3, 4, 100, 150), 2); assert.equal(starsOf(L, 3, 4, 160, 50), 2); assert.equal(starsOf(L, 4, 4, 160, 50), 3); assert.equal(starsOf(L, 4, 4, 40, 50), 2);
  const L2 = LEVELS[2]; assert.equal(starsOf(L2, 4, 8, 100, 150), 0); assert.equal(starsOf(L2, 5, 8, 100, 150), 1); assert.equal(starsOf(L2, 7, 8, 160, 150), 3);
});
test('a level-1 round: spawn ≤ 12 s, take, three stations in order serve him (+N), wrong order says so, no penalty', async () => {
  const R = rig(1); R.E.start(); assert.equal(R.E.state().phase, 'run');
  await R.step(3); assert.equal(R.P.length, 1); assert.equal(R.P[0].state, 'wait');
  const p = R.P[0]; assert.deepEqual(p.route, ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh']);   // ── route31 ── the true route ── /route31 ──
  assert.equal(R.E.next31().id, 'kiyor', 'the round opens at the laver');
  R.E.tapPilgrim(p); await R.step(1.2); assert.equal(R.E.state().carried, p.id);
  R.E.tapStation('shechita'); await R.step(4);
  assert.ok(R.hud.stamps.some((s) => s === 'לא — הכיור קודם'), R.hud.stamps.join('|'));
  assert.equal(R.E.state().score, 0);
  await R.step(1);
  for (const s of ['kiyor', 'samicha', 'nituach', 'shechita', 'zerika', 'nituach', 'kevesh']) { R.E.tapStation(s); await R.step(6); }
  assert.deepEqual(R.acts, ['kiyor', 'samicha', 'shechita', 'zerika', 'nituach', 'kevesh'], 'the wrong one (nituach before the slaughter) says so and acts nothing');
  assert.ok(R.hud.stamps.some((s) => s === 'לא — השחיטה קודם'), R.hud.stamps.join('|'));
  R.E.tapStation('kiyor'); await R.step(6); assert.ok(R.hud.stamps.some((s) => /פעם אחת/.test(s)), 'the laver once per round');
  const s = R.E.state(); assert.equal(s.served, 1); assert.ok(s.score >= 15, String(s.score)); assert.ok(Number.isInteger(s.score));
});
test('a pilgrim left alone leaves at patience 0: lost +1, the combo resets, the round goes on', async () => {
  const R = rig(1); R.E.start(); await R.step(3);
  await serveOne(R); await serveOne(R);
  assert.equal(R.E.state().combo, 1.2);
  await R.step(LEVELS[1].patienceS + 1);
  const s = R.E.state(); assert.equal(s.lost, 1); assert.equal(s.combo, 1); assert.equal(s.streak, 0); assert.equal(s.phase, 'run');
  assert.ok(R.hud.stamps.includes('הלך'));
});
test('the round ends at 90 s with the result; best saved; 2 stars open the next level', async () => {
  const R = rig(1); let res = null; R.E.onEnd((r) => { res = r; }); R.E.start(); await R.step(3);
  for (let i = 0; i < 6 && R.E.state().phase === 'run'; i++) { await R.step(0.2); if (!R.P.find((q) => q.state === 'wait')) await R.step(LEVELS[1].spawnEveryS); if (R.E.state().phase !== 'run') break; await serveOne(R); }
  await R.step(ROUND_S);
  assert.ok(res); assert.equal(R.E.state().phase, 'end');
  assert.ok(res.served >= 3, JSON.stringify(res)); assert.ok(res.stars >= 1);
  assert.equal(R.save.best[1], res.score); assert.equal(res.best, res.score);
  if (res.stars >= 2) assert.equal(R.save.lvl, 2);
  assert.ok(Number.isInteger(res.rival) && res.rival > 0);
});
test('the opening (level 2): four rings in order, a wrong tap says which comes first, clean = +20, ≤ 10 s', async () => {
  const R = rig(2); R.E.start(); assert.equal(R.E.state().phase, 'opening');
  assert.deepEqual(R.hud.op.steps.map((s) => s.label), ['הפיס', 'הכיור', 'תרומת הדשן', 'המערכה']);
  R.hud.op.h.tap(2); assert.ok(R.hud.stamps.includes('לא — הפיס קודם'));
  for (let i = 0; i < 4; i++) R.hud.op.h.tap(i);
  assert.equal(R.E.state().phase, 'run'); assert.equal(R.E.state().score, 0);   // (one mistake: no bonus)
  const R2 = rig(2); R2.E.start(); for (let i = 0; i < 4; i++) R2.hud.op.h.tap(i);
  assert.equal(R2.E.state().score, 20); assert.equal(R2.E.state().opening.clean, true);
  const R3 = rig(2); R3.E.start(); await R3.step(10.2); assert.equal(R3.E.state().phase, 'run');
  assert.equal(OPENING.length, 4);
});
test('level 2 brings two at a time and ken pilgrims; level 5 has the coal (+15 on a tap)', async () => {
  const R = rig(2); R.E.start(); for (let i = 0; i < 4; i++) R.hud.op.h.tap(i);
  await R.step(12); assert.equal(R.P.length, 2);
  const R5 = rig(5); R5.E.start(); for (let i = 0; i < 4; i++) R5.hud.op.h.tap(i);
  await R5.step(49); assert.ok(R5.hud.coal); const s0 = R5.E.state().score; R5.hud.coal.tap(); assert.equal(R5.E.state().score, s0 + 15);
});
test('the shift files: fences, no Divine Name', () => {
  const N = [String.fromCharCode(0x5d4, 0x5f3), String.fromCharCode(0x5d0, 0x5dc, 0x5e7, 0x5d9, 0x5dd), String.fromCharCode(0x5d0, 0x2d, 0x5dc), String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4)];
  for (const f of fs.readdirSync(new URL('../src/avodah/shift/', import.meta.url))) {
    const s = fs.readFileSync(new URL('../src/avodah/shift/' + f, import.meta.url), 'utf8');
    assert.ok(/── (shift29|flow31|route31|fable32[^─]*) ──/.test(s), f);   // ── fable32 ── (+ the basics' files) ── /fable32 ──   // ── flow31 ── (wave 31's own files carry their own fence) ── /flow31 ──
    for (const n of N) assert.ok(!s.includes(n), f + ' has a forbidden name');
  }
});
// ── /shift29 ──
