// build 85: stage 03 after the owner's playtest of 84 (3.11): the lattice slab swings free (two directions) and twists on its swivel, it has
// a dressed face and a plain back (it must go in face out), set down too hard it breaks; the rope is a brake lever. The warning stones by
// eye: the master's measure and his gap side by side, the measuring cord shows the difference; the heavy stone glides. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeded = (seed) => { let a = seed; return () => ((a = (a * 16807) % 2147483647) / 2147483647); };
const C = F84.SOREG84;

test('build 85: GAME_BUILD 85', () => { assert.equal(GAME_BUILD, 100); });

test('build 85: the slab swings in both directions and keeps swinging (it takes a while to settle)', () => {
  const spec = F84.slab84(0, 1, 1, seeded(5));
  assert.ok(spec.swayZ0 !== 0 && Number.isFinite(spec.tolZ) && Number.isFinite(spec.tolR) && spec.vBreak > spec.vChip);
  const H = F84.createHoist84({ ...spec, r0: 0, twist0: 0 }); let maxZ = 0, alignedAt = -1;
  for (let n = 0; n < 60 * 6; n++) { const s = H.step(1 / 60, 0, 0, false); maxZ = Math.max(maxZ, Math.abs(s.z)); if (alignedAt < 0 && H.aligned()) alignedAt = n; }
  assert.ok(maxZ > 0.1, `it swings toward and away (${maxZ})`);
  assert.ok(alignedAt > 60, `not straight at once (${alignedAt})`);
  // his hand pulls it both ways
  const P = F84.createHoist84({ ...spec, sway0: 0, swayZ0: 0, twist0: 0, wind: 0 }); for (let n = 0; n < 20; n++) P.step(1 / 60, 0, { x: 0, z: 1 }, true);
  assert.ok(P.state().z > 0.02, 'pulled away');
});

test('build 85: twisted it knocks; held, the line squares it to the nearer face; the half-turn spin carries it round', () => {
  const spec = { tol: 0.1, tolZ: 0.1, tolR: 0.1, damp: 3, sway0: 0, swayZ0: 0, twist0: 0.5, r0: 0, vChip: 1, vBreak: 1.8, wind: 0 };
  const J = F84.createHoist84(spec); J.state().yb = C.postH + 0.01; const s1 = J.step(1 / 60, 0.05, 0, false);
  assert.deepEqual(s1.ev, ['jam'], 'twisted off square: a knock');
  const Q = F84.createHoist84(spec); for (let n = 0; n < 60 * 4; n++) Q.step(1 / 60, 0, 0, true);
  assert.ok(Q.sq().off < 0.05 && !Q.sq().back, 'held: squared, face out');
  const T = F84.createHoist84({ ...spec, twist0: 0 }); assert.ok(T.turn()); let maxR = 0; for (let n = 0; n < 60 * 3; n++) { T.step(1 / 60, 0, 0, false); maxR = Math.max(maxR, T.state().r); }
  for (let n = 0; n < 60 * 4; n++) T.step(1 / 60, 0, 0, true);
  assert.ok(maxR > Math.PI / 2, `the spin passes a quarter turn (${maxR})`); assert.equal(T.sq().back, true, 'caught past the half: the back is out now');
});

test('build 85: on the sill — clean, chipped or broken; the back out is a failed act; a break caps the next at כשר', () => {
  const base = { tol: 0.1, tolZ: 0.1, tolR: 0.2, damp: 3, sway0: 0, swayZ0: 0, twist0: 0, vChip: 1.0, vBreak: 1.8, wind: 0 };
  const land = (pay, r0 = 0) => { const H = F84.createHoist84({ ...base, r0 }); H.state().ph = 'groove'; H.state().yb = 0.4; let s = null; for (let n = 0; n < 400 && H.state().ph === 'groove'; n++) s = H.step(1 / 60, pay, 0, false); return s; };
  const a = land(0.01); assert.equal(a.ph, 'seated'); assert.equal(a.chip, false); assert.equal(a.back, false);
  const b = land(0.025); assert.equal(b.ph, 'seated'); assert.equal(b.chip, true);
  const c = land(0.05); assert.equal(c.ph, 'broken'); assert.ok(c.ev.includes('break'));
  const d = land(0.01, Math.PI); assert.equal(d.back, true);
  assert.equal(F84.slabQ84({ right: true, back: true, jams: 0, chip: false }).v, 0);
  assert.equal(F84.slabQ84({ right: true, jams: 0, chip: false, breaks: 1 }).rating, 'kasher');
  assert.equal(F84.slabQ84({ right: true, jams: 0, chip: false, breaks: 2 }).v, 0);
  // the right slab may come back out first, in every kind
  let flips = 0; for (let seed = 1; seed <= 30; seed++) for (let k = 0; k < 3; k++) { const s = F84.slab84(k, 1, 1, seeded(seed * 104729 + 7)); if (s.cands.find((q) => q.right).flip) flips++; }
  assert.ok(flips > 20 && flips < 75, `flips ${flips}`);
});

test('build 85: the warning stones by eye — stop at the measure; near is כשר; far, the crew moves it; the heavy one glides', () => {
  const spec = F84.warn85(1, seeded(3)); assert.ok(spec.G >= 7.5 && spec.G <= 10.5); assert.equal(spec.stones.length, 3); assert.ok(spec.stones[2].heavy);
  for (let i = 1; i < 3; i++) assert.ok(spec.stones[i].tolM < spec.stones[i - 1].tolM && spec.stones[i].yaw > spec.stones[i - 1].yaw, 'each a harder look');
  const W = F84.createWalk85(spec);
  const walkTo = (x) => { for (let n = 0; n < 6000 && W.state().x < x; n++) W.step(1 / 60, true, false); for (let n = 0; n < 600 && !W.stopped(); n++) W.step(1 / 60, false, false); };
  assert.equal(W.set(), null, 'nothing walked: nothing set');
  walkTo(spec.G - 0.12); const r0 = W.set(); assert.equal(r0.rating, 'mehudar');
  walkTo(spec.G + spec.stones[1].tolM * 1.6); const r1 = W.set(); assert.equal(r1.rating, 'kasher'); assert.ok(r1.err > 0);
  // the heavy stone: let go, it goes on
  for (let n = 0; n < 120; n++) W.step(1 / 60, true, false); const x0 = W.state().x; W.step(1 / 60, false, false); assert.equal(W.set(), null, 'still moving: not yet');
  for (let n = 0; n < 600 && !W.stopped(); n++) W.step(1 / 60, false, false); assert.ok(W.state().x - x0 > 0.4, 'it glides on');
  W.state().x = spec.G * 1.5; const r2 = W.set(); assert.equal(r2.rating, 'tikkun'); assert.equal(r2.moved, true); assert.equal(W.state().done, true);
});

test('build 85: wiring — the lever, the tag line both ways, the break, the back, the eye walk; lines sourced', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /st84\.grab/); assert.match(h, /ev === 'break'/); assert.match(h, /LINE42\.lat85back/);
  assert.match(h, /F84\.createWalk85\(spec\)/); assert.match(h, /F84\.warn85\(L, rnd\)/);
  for (const k of ['lat84', 'lat85break', 'lat85back', 'warn84demo', 'warn84', 'warn84heavy']) { const t = LINE42[k]; assert.ok(t && /המחשה|טיוטה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head`); }
});
