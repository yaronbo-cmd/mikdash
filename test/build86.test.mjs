// build 86: stage 03 controls in the world (the owner, 3.11: "כדי לסובב אמרנו שלוחצים על העולם עצמו, לא על כפתורים בצד"; the slab spun
// one way only; the rope lever did not move under his mouse). He takes the slab itself (down lowers, up raises, across moves); a swipe in
// the world spins it either way; a tap on the cart sends it back; the warning stones: drag along the line to walk, tap him to set. Never a
// Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 86: GAME_BUILD 86', () => { assert.equal(GAME_BUILD, 95); });

test('build 86: the slab spins either way, as hard as the swipe', () => {
  const spec = { tol: 0.1, tolZ: 0.1, tolR: 0.1, damp: 3, sway0: 0, swayZ0: 0, twist0: 0, r0: 0, vChip: 1, vBreak: 1.8, wind: 0 };
  const R = F84.createHoist84(spec); assert.ok(R.turn(1, 1)); const L = F84.createHoist84(spec); assert.ok(L.turn(-1, 1));
  assert.ok(R.state().vr > 0 && L.state().vr < 0, 'both ways');
  const W = F84.createHoist84(spec); W.turn(1, 0.5); assert.ok(W.state().vr < R.state().vr, 'a softer swipe, a slower spin');
  // held, the swing toward / away dies sooner
  const a = F84.createHoist84({ ...spec, damp: 0.2, swayZ0: 0.4 }), b = F84.createHoist84({ ...spec, damp: 0.2, swayZ0: 0.4 });
  for (let n = 0; n < 120; n++) { a.step(1 / 60, 0, 0, true); b.step(1 / 60, 0, 0, false); }
  assert.ok(Math.abs(a.state().vz) + Math.abs(a.state().z) < Math.abs(b.state().vz) + Math.abs(b.state().z));
});

test('build 86: no side controls in stage 03; the world is the control', () => {
  const h = read('src/game/har42.js');
  assert.doesNotMatch(h, /h85-lever'\)/); assert.doesNotMatch(h, /'⟲ סובבו'/);
  assert.match(h, /st84\.grab = \{ x0: a\.x, y0: a\.y \}/); assert.match(h, /this\.back\(\); return;/); assert.match(h, /w8\.drag = \{ x0: a\.x \}/); assert.match(h, /doSet\(\); return;/);
  for (const k of ['lat84', 'warn84', 'warn84heavy']) { const t = LINE42[k]; assert.ok(/המחשה|טיוטה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head`); }
});
