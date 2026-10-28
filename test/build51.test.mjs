// ── build 51 ── Phase B fixed by the inspector's review (docs/specs/bikoret-mefakeach-27-10-he.md §1, §4 items 1–4, 7, 13, 15–17, 20,
// 22; the coordinator's build-51 brief): the object rule (twin.js obj51 — the thing ≥ 30 % of the width and 20 % of the height, never behind
// him), the swipe's gate relative to the thing (swipe51, SWIPE51: min(0.12·W, 0.4·the thing's width) within 500 ms), the laver's mark (K20M:
// release at the line — מהודר; held to the brim — כשר; a release past half — a free retry), the act's one line always a verb and its
// gesture's arrow, the guided walk ≤ 5 amot/s within 6 amot of its place, the lamb's and the shochet's views, the end card's side.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { D21, SWIPE51, swipe51, K20M, P51, SH51 } from '../src/avodah/shift/day33.js';
import { LINE30, words30, quality30, rate30 } from '../src/avodah/shift/rate30.js';
import { obj51, occl51, share51, OBJ51, walk39, WALK51 } from '../src/game/twin.js';
import { bb51 } from '../src/avodah/shift/touch40.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import '../src/avodah/shift/focus17.js';
import { rig, FLAGS, seeded } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const tanV = Math.tan((25 * Math.PI) / 180), tanH = tanV * (844 / 390);
const SAVE = () => ({ served30: 5, roles23: { m: 6, h: [], kiyor: { n: 6, best: 100, last: 75 }, deshen: { n: 2, best: 100, last: 100 } }, roles26: { m: 5, h: [] } });
const practise = (role, seed = 11) => { const R = rig(FLAGS, { save: practiceSave31(SAVE()), practice: { role, day: 7, fed: 44, seed: 4242 + seed }, rng: seeded(seed) }); R.E.start(); if (role === 'deshen') R.H.y = 25; return R; };

test('build 51 (1): the object rule is a pure function — a far thing is brought to ≥ 30 % of the width and ≥ 20 % of the height, on the screen where it was', () => {
  assert.deepEqual({ w: OBJ51.w, h: OBJ51.h }, { w: 0.3, h: 0.2 }); assert.ok(Object.isFrozen(OBJ51));
  const bb = [-0.8, 16, -0.6, 0.8, 17.2, 0.6], p = [0, 21, 12], t = [0, 16.6, 0];
  const s0 = share51(p, t, bb, tanH, tanV); assert.ok(s0.w < 0.15, `before: ${s0.w}`);
  const r = obj51(p, t, bb, { x: -2.4, y: 16, z: -1.2, h: 3.96 }, tanH, tanV);
  assert.ok(r && r.ok, JSON.stringify(r && { w: r.w, h: r.h })); assert.ok(r.w >= 0.3 && r.h >= 0.2);
  const s1 = share51(r.p, r.t, bb, tanH, tanV); assert.ok(Math.abs(s1.w - r.w) < 1e-9, 'the shares are the view\'s own');
  assert.equal(r.occ, false); assert.equal(obj51(p, t, null, null, tanH, tanV), null, 'no box — no rule');
});
test('build 51 (1): the line to the thing never through him — a view behind his back is swung round the thing (±30°, ±50°)', () => {
  const bb = [-0.6, 16, -0.6, 0.6, 17.4, 0.6], H = { x: 0, y: 16, z: 3, h: 3.96 }, p = [0, 19, 10], t = [0, 16.7, 0];
  assert.equal(occl51({ x: p[0], y: p[1], z: p[2] }, { x: 0, y: 16.7, z: 0 }, H, 3.96), true, 'straight through him');
  assert.equal(occl51({ x: 6, y: 19, z: 8 }, { x: 0, y: 16.7, z: 0 }, H, 3.96), false, 'from the side');
  const r = obj51(p, t, bb, H, tanH, tanV); assert.ok(r); assert.equal(r.occ, false); assert.notEqual(r.a, 0, 'turned');
  assert.equal(occl51({ x: r.p[0], y: r.p[1], z: r.p[2] }, { x: 0, y: 16.7, z: 0 }, H, 3.96), false);
  // (a wall in the way of the first choice: the next one; all four cut — none, the caller keeps its view)
  const r2 = obj51(p, t, bb, H, tanH, tanV, OBJ51, (P) => Math.abs(P[0] - r.p[0]) < 1e-6 && Math.abs(P[2] - r.p[2]) < 1e-6); assert.ok(r2 && (r2.p[0] !== r.p[0] || r2.p[2] !== r.p[2]));
  assert.equal(obj51(p, t, bb, H, tanH, tanV, OBJ51, () => true), null);
  const r4 = obj51(p, t, bb, H, tanH, tanV, OBJ51, (P) => P[1] < r.p[1] + 1); assert.ok(r4 && r4.up >= 1.5, 'a low wall: the same view raised over it');
  // (the thing in his own hands — the pan, the vessel carried: 'self', the view kept)
  const r3 = obj51(p, t, [-0.5, 17, 2.5, 0.5, 18, 3.5], H, tanH, tanV); assert.equal(r3.self, true);
});
test('build 51 (1): the thing\'s box — its parts\' spheres or the act\'s own thing; wired into the act camera (twin.js) and the tools (cam41)', () => {
  assert.deepEqual(bb51([{ x: 0, y: 16, z: 0, r: 0.5 }, { x: 2, y: 17, z: 1, r: 0.25 }]), [-0.5, 15.5, -0.5, 2.25, 17.25, 1.25]);
  assert.deepEqual(bb51([{ x: 0, y: 16, z: 0, r: 0.5 }], () => [1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5, 6]);
  assert.equal(bb51([]), null);
  const tw = read('src/game/twin.js'); assert.match(tw, /q51 = obj51\(b0\.p, b0\.t, bb51, h \? \{ x: h\.x, y: h\.y \|\| 16, z: h\.z, h: HERO41 \} : null, tanH, tanV,/); assert.match(tw, /cut51 = \(P\) => !cutA && segO\(P\)/, 'the line of sight to the thing');
  assert.match(read('tools/cam41.js'), /function objM\(B, O, cam, p, top\)/);
  assert.match(read('src/avodah/shift/dam27.js'), /thing: \(\) => \{ const K = E\.r27\(\); return K && \/\^\(bind\|cut\)\$\/\.test\(K\.ph\)/, 'the shochet\'s thing: the whole lamb');
});
test('build 51 (2, 3): the lamb seen from its far side, knee-high; the lantern ×2; the shochet\'s macro at FOV 35', () => {
  assert.deepEqual({ ...P51.lamb }, { d: 3.4, y: 2.4, ty: 0.6, zd: 2.2, aim: 0.42, zAim: 0.62 }); assert.equal(SH51.fov, 35); assert.equal(SH51.aim, 0.4);
  assert.match(read('src/game/twin.js'), /C40 = M51 \? \{ \.\.\.C40a, big: 9, heroR: 9, hero: -9, back: 0 \} : C40a/, 'a macro view: the thing first, him not stepped back for');
  const pen = read('src/avodah/shift/pen25.js'); assert.match(pen, /export const LIT51 = Object\.freeze\(\{ k: 2,/); assert.match(pen, /\* LIT51\.k \*/);
  assert.match(LINE30.lamb.scan, /^כוונו את האור/, 'the aim\'s line at once — the scan\'s own line');
  assert.match(read('src/avodah/shift/day33.js'), /\.\.\.\(\/\^\(bind\|bound\|cut\)\$\/\.test\(ph\) \? \{ fov: SH51\.fov, macro: true, aimW: SH51\.aim, e: 5 \} : \{\}\)/);
});
test('build 51 (4): the swipe\'s gate relative to the thing — min(0.12·W, 0.4·its width), never under 0.035·W, within 500 ms', () => {
  assert.deepEqual({ ...SWIPE51 }, { k: 0.4, max: 0.12, min: 0.035, ms: 500 }); assert.ok(Object.isFrozen(SWIPE51));
  assert.equal(swipe51(640, 190), 76, 'the pan of 190 px: 76 px (was 96 — 15 % of the screen)');
  assert.ok(Math.abs(swipe51(844, 30) - 0.035 * 844) < 1e-9, 'the lamp of 30 px: the floor, not 12 px');
  assert.ok(Math.abs(swipe51(844, 0) - 0.12 * 844) < 1e-9, 'no thing: 12 % of the width');
  assert.ok(Math.abs(swipe51(640, 600) - 0.12 * 640) < 1e-9, 'a wide thing: at most 12 %');
  for (const f of ['deshen21', 'maaracha22', 'pen25', 'heichal26', 'dam27']) { const m = read(`src/avodah/shift/${f}.js`); assert.match(m, /const thr = swipe51\(/, f); assert.match(m, /E\.sw51\(thr \//, f); assert.match(m, /hint51\(thr51/, f); }
});
test('build 51 (4): the engine reads the act\'s gate — a sweep shorter than it refused "short", one past it counted; 450 ms counts, 600 ms is slow', async () => {
  const R = practise('deshen'); await R.step(0.3); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.4); await R.step(0.5);
  for (let i = 0; i < 40 && !(R.E.d21() && R.E.d21().ph === 'sweep'); i++) await R.step(0.1);
  assert.equal(R.E.d21().ph, 'sweep');
  assert.deepEqual(R.E.sw51(0.08, 0.2), { x: 0.08, y: 0.2 });
  const side = () => { const K = R.E.d21(); return K.side ? K.side[Math.min(K.n, K.side.length - 1)] : 1; };
  const n0 = R.E.d21().n | 0; R.E.d21swipe(0.07 * side(), 0.01, 200); await R.step(0.2);
  assert.equal(R.E.d21().n | 0, n0, 'short'); assert.equal(R.ev('d21swipe').pop().why, 'short');
  R.E.d21swipe(0.09 * side(), 0.01, 600); await R.step(0.2); assert.equal(R.ev('d21swipe').pop().why, 'slow');
  R.E.d21swipe(0.09 * side(), 0.01, 450); await R.step(0.3); assert.equal(R.E.d21().n | 0, n0 + 1, 'past the gate within 500 ms');
});
test('build 51 (6): the laver\'s mark — let go at the line: מהודר; held to the brim: כשר; a release past half on the way up: a free retry', async () => {
  assert.deepEqual({ ...K20M }, { at: 0.8, win: 0.08, free: 0.5 });
  const wash = async (how) => {
    const R = practise('kiyor', 3); await R.step(0.6);
    for (let i = 0; i < 80 && !(R.E.k20() && R.E.k20().ph === 'pose'); i++) await R.step(0.1);
    assert.equal(R.E.k20().ph, 'pose');
    R.E.k20in('L', true); R.E.k20in('R', true);
    if (how === 'early') { for (let i = 0; i < 200 && R.E.k20().p < 0.62; i++) await R.step(0.05); R.E.k20in('L', false); R.E.k20in('R', false); await R.step(0.1); assert.equal(R.E.k20().ph, 'pose', 'still washing'); assert.equal(R.E.k20().early51, 1); assert.equal(R.E.k20().lifts, 0, 'no lift'); R.E.k20in('L', true); R.E.k20in('R', true); }
    if (how !== 'brim') { for (let i = 0; i < 300 && R.E.k20() && R.E.k20().ph === 'pose' && R.E.k20().p < K20M.at; i++) await R.step(0.05); R.E.k20in('L', false); R.E.k20in('R', false); }
    for (let i = 0; i < 200 && R.E.k20() && R.E.k20().ph === 'pose'; i++) await R.step(0.05);
    return R.E.k20r();
  };
  const a = await wash('mark'), b = await wash('brim'), c = await wash('early');
  assert.equal(a.mark51, 'in'); assert.equal(a.rating, 'mehudar');
  assert.equal(b.mark51, 'late'); assert.equal(b.rating, 'kasher');
  assert.equal(c.mark51, 'in'); assert.equal(c.rating, 'mehudar', 'the retry was free'); assert.equal(c.early51, 1);
  assert.equal(rate30(quality30('kiyor', { lifts: 0, mark51: 'late' })), 'kasher'); assert.equal(rate30(quality30('kiyor', { lifts: 3, mark51: 'late' })), 'tikkun');
  assert.equal(rate30(quality30('kiyor', { lifts: 0 })), 'mehudar', 'an older record without the mark: as it was');
});
test('build 51 (5): every act\'s line while a gesture is asked carries the verb and the gesture\'s arrow (≤ 4 words) — never the noun alone', () => {
  const ARROW = /[↔⬆⬇⬅➡⤵⤳⟳✥⚖👆✋]/u, VERB = /^(פסלו|קבלו|עקבו|החליקו|חתו|העבירו|סובבו|חפנו|הוציאו|קנחו|החזיקו|הקישו|גררו|מיינו|כוונו|הבריש|הביאו|הציתו|שחטו|מרסו|זרקו|שפכו|צברו|פתילה|הכוז|לכו)/;
  const GESTURE = { kiyor: ['pose'], deshen: ['in', 'sweep', 'walk', 'desc', 'near'], m22: ['in', 'sort', 'first', 'stackIn', 'l1', 'l2', 'l3', 'L1', 'L2', 'L3', 'ready'], lamb: ['scan', 'dirt', 'wait'], inner: ['in', 'bolt', 'key', 'pull'], menorah: ['in', 'bolt', 'key', 'wick', 'wick2', 'wipe', 'pour', 'new', 'drag', 'kuz'], shochet: ['bind', 'cut'], zorek: ['recv', 'carry', 'hold', 'aim', 'carry2', 'aim2', 'base'] };
  for (const [act, phs] of Object.entries(GESTURE)) for (const ph of phs) { const s = LINE30[act][ph]; assert.ok(s, `${act}.${ph}`); assert.match(s, ARROW, `${act}.${ph}: "${s}" an arrow`); assert.ok(s.split(/[\s—·:]+/).some((w) => VERB.test(w)), `${act}.${ph}: "${s}" a verb`); assert.ok(words30(s) <= 4, `${act}.${ph}: "${s}"`); }
  assert.equal(LINE30.zorek.recv, 'קבלו — עקבו אחרי הזרם ↔'); assert.equal(LINE30.inner.bolt, 'העבירו את הנגר — החליקו ↔'); assert.equal(LINE30.menorah.bolt, 'העבירו את הנגר — החליקו ↔');
  assert.match(read('src/avodah/shift/focus17.js'), /@media \(orientation:landscape\) and \(max-width:700px\)\{\.f17-card\{max-width:min\(60vw,420px\)/, 'the pill fits at 640');
});
test('build 51 (13): the guided walk at most 5 amot/s within 6 amot of its place; faster farther; Phase A\'s guide (no "left") as it was', () => {
  assert.deepEqual({ ...WALK51 }, { near: 6, v: 5 });
  const run = (g) => { const v = { vx: 0, vz: 0 }; for (let i = 0; i < 60; i++) walk39(v, g, 11, 0.05); return Math.hypot(v.vx, v.vz); };
  assert.ok(Math.abs(run({ x: 1, z: 0, k: 1, left: 4 }) - 5) < 0.05, 'near: 5');
  assert.ok(run({ x: 1, z: 0, k: 1, left: 9 }) > 8.5, 'far: the pace');
  assert.ok(run({ x: 1, z: 0, k: 1 }) > 8.5, 'no left — as before');
  assert.match(read('src/avodah/shift/guide39.js'), /id: tg\.id, left \};/);
});
test('build 51 (11, 12, 7, 8, 9): the end card on the right two-thirds; one hand at a time; the worm on the log from build 48\'s bag; the pan\'s meter by the pan; the blood\'s stream drawn', () => {
  assert.match(read('src/avodah/shift/practice31.js'), /@media \(orientation:landscape\)\{\.p31-end\{justify-content:flex-start;padding-inline-start:8px;/);
  const hk = read('src/avodah/shift/heichal26.js'); assert.match(hk, /const h37 = !!\(live && K && ph === 'wick' && !onObj51 &&/);
  const m22 = read('src/avodah/shift/maaracha22.js'); assert.match(m22, /bag51 = createBag48\(null, Math\.random, \['holes', 'gallery'\]\)/); assert.match(m22, /if \(L\.worm && !L\.__v51\) L\.__v51 = bag51\.draw\(\);/);
  assert.match(read('src/avodah/shift/deshen21.js'), /const balance = ph === 'walk' \|\| ph === 'desc' \|\| ph === 'full';/);
  const dm = read('src/avodah/shift/dam27.js'); assert.match(dm, /<path class="st51"\/>/); assert.match(dm, /marker-end="url\(#dm27ah\)"/);
});
test('build 51: no Divine Name in the changed files (by code points)', () => {
  const N = String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4);
  for (const f of ['src/game/twin.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/rate30.js', 'src/avodah/shift/kiyor20.js', 'src/avodah/shift/touch40.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/maaracha22.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/practice31.js', 'tools/cam41.js', 'test/build51.test.mjs']) assert.ok(!read(f).includes(N), f);
});
