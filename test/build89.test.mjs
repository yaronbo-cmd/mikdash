// build 89: stage 03 — a new skill in each lattice section (the owner's choice, 3.11 17:07: "מיומנות חדשה בכל קטע"): section 2's slab may
// come up upside down and is turned right way up with two fingers (a mouse's wheel); section 3 has gusts that come and go, and its last
// slab closes between two (bays 1, 3, then 2; a tighter window). The crane's windlass is a treadwheel a man walks in (the owner on v29:
// "תנועת האייטמים כמו גלגל המנוף"). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seeded = (seed) => { let a = seed; return () => ((a = (a * 16807) % 2147483647) / 2147483647); };
const C = F84.SOREG84, C9 = F84.SOREG89;

test('build 89: GAME_BUILD 89', () => { assert.equal(GAME_BUILD, 90); });

test('build 89: each section its own skill — never upside down in the first, often in the second; gusts and a closing slab in the third', () => {
  let up = [0, 0, 0], gusts = [0, 0, 0], closing = [0, 0, 0];
  for (let seed = 1; seed <= 40; seed++) for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++) {
    const s = F84.slab84(k, i, 2, seeded(seed * 7919 + k * 31 + i));
    if (s.upside) { up[k]++; assert.ok(Math.abs(F84.wrapPi(s.u0)) > 2.5, 'upside down is about a half turn'); }
    if (s.gusts.length) gusts[k]++;
    if (s.closing) closing[k]++;
    assert.equal(s.bay, F84.bay89(k, i)); assert.equal(s.X0, F84.bayX84(s.bay));
  }
  assert.equal(up[0], 0); assert.ok(up[1] > 60 && up[1] < 110, `section 2 ${up[1]}/120`); assert.ok(up[2] > 20 && up[2] < 75, `section 3 ${up[2]}/120`);
  assert.deepEqual(gusts.map((n) => n > 0), [false, false, true]); assert.equal(gusts[2], 120);
  assert.deepEqual(closing, [0, 0, 40], 'only section 3\'s last slab');
  assert.deepEqual([0, 1, 2].map((i) => F84.bay89(2, i)), [1, 3, 2]); assert.deepEqual([0, 1, 2].map((i) => F84.bay89(1, i)), [1, 2, 3]);
  // the closing slab's window is narrower than the slab before it
  const a = F84.slab84(2, 1, 2, seeded(5)), b = F84.slab84(2, 2, 2, seeded(5));
  assert.ok(b.tol < a.tol * 0.8 && b.tolZ < a.tolZ * 0.8 && b.tolR < a.tolR, 'tight');
});

test('build 89: upside down it knocks on the posts; turned right way up by the fingers it goes in', () => {
  const spec = { tol: 0.2, tolZ: 0.2, tolR: 0.3, tolU: 0.15, damp: 3, sway0: 0, swayZ0: 0, twist0: 0, r0: 0, vChip: 1, vBreak: 1.8, wind: 0, u0: Math.PI };
  const H = F84.createHoist84(spec); for (let n = 0; n < 120; n++) H.step(1 / 60, 0, 0, true);
  assert.equal(H.upright(), false); assert.equal(H.aligned(), false, 'square and still, but upside down');
  H.state().yb = C.postH + 0.01; const s1 = H.step(1 / 60, 0.05, 0, true); assert.deepEqual(s1.ev, ['jam'], 'it knocks');
  // two fingers: a half turn, slowly, then still
  const G = F84.createHoist84(spec); for (let n = 0; n < 90; n++) { G.rollBy(-Math.PI / 90, 1 / 60); G.step(1 / 60, 0, 0, true); }
  assert.ok(Math.abs(F84.wrapPi(G.state().u)) < 0.02, `followed the fingers (${G.state().u})`);
  for (let n = 0; n < 240; n++) G.step(1 / 60, 0, 0, true);
  assert.equal(G.upright(), true); assert.equal(G.aligned(), true);
  G.state().yb = C.postH + 0.01; const s2 = G.step(1 / 60, 0.05, 0, true); assert.deepEqual(s2.ev, ['enter']);
  // in the grooves it is held square and upright
  for (let n = 0; n < 30; n++) G.step(1 / 60, 0.005, 0, false); assert.ok(Math.abs(G.state().u) < 0.01);
});

test('build 89: the gusts come and go — a warning first, a push across while it blows, calm between', () => {
  const spec = F84.slab84(2, 0, 2, seeded(11)), g0 = spec.gusts[0];
  assert.ok(g0.t0 >= C9.gustFirst && spec.gusts[1].t0 - g0.t0 >= C9.gustLen + C9.gustEvery[0] - 1e-6);
  assert.equal(F84.gust89(spec.gusts, g0.t0 - 0.5).warn, true); assert.equal(F84.gust89(spec.gusts, g0.t0 - 0.5).e, 0);
  assert.ok(F84.gust89(spec.gusts, g0.t0 + C9.gustLen / 2).e > 0.95); assert.equal(F84.gust89(spec.gusts, g0.t0 + C9.gustLen + 1).e, 0);
  const H = F84.createHoist84({ ...spec, sway0: 0, swayZ0: 0, twist0: 0, u0: 0 }); let calm = 0, blow = 0;
  for (let n = 0; n < 60 * (g0.t0 + C9.gustLen); n++) { const s = H.step(1 / 60, 0, 0, true); const x = Math.abs(s.x); if (s.t < g0.t0 - C9.gustWarn) calm = Math.max(calm, x); else if (s.gust.e > 0.5) blow = Math.max(blow, x); }
  assert.ok(blow > calm * 1.5 && blow > 0.15, `the gust pushes it (${calm.toFixed(3)} → ${blow.toFixed(3)})`);
});

test('build 89: wiring — the coping and the turning body, the bay order, two fingers and the wheel, the treadwheel, the pennant; lines sourced', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /const ON89 = qs\('h89'\) !== '0'/);
  assert.match(h, /g\.userData\.body = body/); assert.match(h, /m\.userData\.body\.rotation\.z = s\.u/);
  assert.match(h, /bayN = \(\) => F84\.bay89\(k, st84\.i\)/); assert.match(h, /P\.slabs84\[k\]\[bayN\(\)\]/);
  assert.match(h, /raw\(type, id, x, y\)/); assert.match(h, /st84\.J\.rollBy\(sg \* d/); assert.match(h, /pad\.addEventListener\('wheel'/);
  assert.match(h, /rotG\.name = 'tread'/); assert.match(h, /getObjectByName\('tread'\)/); assert.match(h, /'Walking_A'/); assert.match(h, /pn\.name = 'pennant'/);
  assert.doesNotMatch(h, /P\.slabs84\[k\]\[st84\.i \+ 1\]/);
  for (const k of ['lat89up', 'lat89gust', 'lat89close']) { const t = LINE42[k]; assert.ok(t && /המחשה|טיוטה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head`); }
});
