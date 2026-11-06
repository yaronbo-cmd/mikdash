// ── build 106 ── stage 07's vault rebuilt (lish106.js): the widths' sum (each side closed exactly) and the stone hanging from the crane, turned, let down, lifted again; the keystone dressed to the gap; the wedges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/lish106.js';

const seeded = (s = 1) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

/** a hand on one ring: careful (the hint) or rushing (any stone, holds to the touch, strikes one side) */
function playRing(i, hand = 'ok', seed = 5) {
  const J = F.createVault106(i, seeded(seed)), dt = 1 / 30, R = seeded(seed + 99); let t = 0;
  while (!J.state().done && t < 900) {
    t += dt; const h = J.hint(), k = J.state();
    if (hand === 'rush') {
      if (k.ph === 'set' && !k.hang) { const fits = k.row.filter((x) => !x.used && ['L', 'R'].some((s) => !J.full(s) && x.w <= k.U - J.sum(s))); if (fits.length) J.pick(fits[Math.floor(R() * fits.length)].id); else { J.lift(J.full('L') ? 'R' : 'L'); J.back(); } }
      else if (k.hang && !k.hang.side && !k.hang.key) { const s = J.sum('L') <= J.sum('R') ? ['L', 'R'] : ['R', 'L']; if (J.aim(s[0]) !== 'aim' && J.aim(s[1]) !== 'aim') J.back(); }
      else if (h && h.kind === 'pull') J.pull(h.d); else if (k.hang) { J.pull(0); J.hold(true); }
      else if (h && h.kind === 'strike') J.strike(h.q < 2 ? (k.taps[0] < 2 ? 0 : 1) : h.q);
      else if (h && h.kind === 'keyUp') { const K = k.keyFalls === 0 ? k.keys.find((x) => x.over < 0 && !x.gone) : k.keys.find((x) => !x.gone && !x.tried); J.keyUp((K || k.keys.find((x) => !x.gone)).i); }
    } else if (h) {
      if (h.kind === 'pick') J.pick(h.id); else if (h.kind === 'aim') J.aim(h.side); else if (h.kind === 'lift') J.lift(h.side);
      else if (h.kind === 'pull') { J.hold(false); J.pull(h.d); } else if (h.kind === 'wait') { J.pull(0); J.hold(false); }
      else if (h.kind === 'hold') { J.pull(0); J.hold(h.on); } else if (h.kind === 'keyUp') J.keyUp(h.i); else if (h.kind === 'strike') J.strike(h.q);
    }
    J.step(dt);
  }
  return J.state();
}

test('the vault: a careful hand closes every ring true — מהודר', () => {
  for (let s = 1; s <= 4; s++) { const qs = [0, 1, 2].map((i) => { const k = playRing(i, 'ok', s * 11 + i); assert.equal(k.done, true, `ring ${i} seed ${s}`); assert.equal(k.faults, 0, `ring ${i} seed ${s}: ${k.ev.join(',')}`); assert.equal(J_sum(k, 'L'), k.U); assert.equal(J_sum(k, 'R'), k.U); return k.q; }); assert.deepEqual(qs, [1, 1, 1]); assert.equal(F.vaultQ106(qs), 1); }
});
const J_sum = (k, s) => k[s].reduce((a, b) => a + b.w, 0);

test('the vault: a rushing hand chips, misjudges widths, takes a narrow keystone — the grade is lost, the ring still stands', () => {
  const ks = [0, 1, 2].map((i) => playRing(i, 'rush', 3 + i));
  assert.ok(ks.every((k) => k.done), ks.map((k) => k.ph).join()); assert.ok(ks.some((k) => k.chips > 0)); assert.ok(ks.some((k) => k.keyFalls > 0)); assert.ok(F.vaultQ106(ks.map((k) => k.q)) < 1);
});

test('the widths: his arc a side is his×2 units; every row holds an answer with sound stones and more besides', () => {
  assert.equal(F.VAULT106.n, 17); assert.ok(Math.abs(F.UNIT106 * 2 - F.DA106) < 1e-12);
  assert.deepEqual(F.VAULT106.rings.map((r) => r.his), [2, 3, 4]);
  for (let i = 0; i < 3; i++) for (let s = 1; s <= 60; s++) { const J = F.createVault106(i, seeded(s)), k = J.state(), sound = k.row.filter((r) => !r.cracked).map((r) => r.w);
    assert.equal(k.U, F.VAULT106.rings[i].his * 2); assert.ok(F.fills106(sound, k.U, k.U), `ring ${i} seed ${s}`); assert.ok(k.row.every((r) => r.w >= 1 && r.w <= 3));
    assert.ok(sound.reduce((a, b) => a + b, 0) > 2 * k.U, 'stones to spare'); assert.equal(k.row.filter((r) => r.cracked).length, F.VAULT106.rings[i].cracked); }
  assert.ok(Math.abs(F.seatA106('L', 6, 4, 0) - 8 * F.DA106) < 1e-12, 'a full side ends at the keystone\'s joint'); assert.ok(Math.abs(F.seatA106('L', 6, 0, 2) + F.seatA106('R', 6, 0, 2) - Math.PI) < 1e-12);
  assert.ok(Math.abs(F.slotA106('K', 0) - Math.PI / 2) < 1e-9);
});

const fitting = (J, side) => J.state().row.find((x) => !x.used && !x.cracked && x.w <= J.U - J.sum(side));
test('a stone hangs until he seats it; touching too fast chips it; tilted it stands askew and goes up a little', () => {
  const J = F.createVault106(0, seeded(4)); J.pick(fitting(J, 'L').id); assert.equal(J.hold(true), undefined); assert.ok(J.state().hang.h > 2, 'not lowered before it is over a place');
  assert.equal(J.aim('L'), 'aim'); J.hold(true); let r = null; for (let n = 0; n < 300 && !r; n++) r = J.step(1 / 30); assert.equal(r, 'askew'); assert.ok(J.state().hang.h > 0);
  const h = J.state().hang; h.tilt = h.tT = J.need(); J.hold(true); r = null; for (let n = 0; n < 300 && !r; n++) r = J.step(1 / 30); assert.equal(r, 'seat', 'from 0.3 amah: slow enough');
  J.pick(fitting(J, 'R').id); J.aim('R'); const h2 = J.state().hang; h2.tilt = h2.tT = J.need(); J.hold(true); r = null; for (let n = 0; n < 300 && !r; n++) r = J.step(1 / 30); assert.equal(r, 'chip');
});

test('wider than the place left: it will not go (a fault), it stays on the crane; a side well ahead waits', () => {
  const J = F.createVault106(0, seeded(2)), k = J.state(); k.L.push({ w: 3, id: 'x' }); const wide = k.row.find((x) => x.w >= 2) || (k.row[0].w = 2, k.row[0]);
  J.pick(wide.id); assert.equal(J.aim('L'), 'over'); assert.equal(k.faults, 1); assert.equal(k.hang.side, null);
  const J2 = F.createVault106(2, seeded(3)), k2 = J2.state(); k2.L.push({ w: 3, id: 'y' }); J2.pick(fitting(J2, 'L').id); assert.equal(J2.aim('L'), 'lead'); assert.equal(J2.aim('R'), 'aim');
});

test('any stone of his is lifted again (the top one first); a hanging stone goes back to the row', () => {
  const J = F.createVault106(1, seeded(8)), seatOne = (side) => { J.pick(fitting(J, side).id); J.aim(side); const h = J.state().hang; h.tilt = h.tT = J.need(); h.h = 0.2; h.s = h.sv = 0; J.hold(true); let r = null; for (let n = 0; n < 100 && !r; n++) r = J.step(1 / 30); return r; };
  assert.equal(seatOne('L'), 'seat'); assert.equal(seatOne('R'), 'seat'); assert.equal(J.state().L.length, 1);
  const w = J.state().L[0].w; assert.equal(J.lift('L'), 'lift'); assert.equal(J.state().L.length, 0); assert.ok(J.state().hang && J.state().hang.side === 'L' && J.state().hang.stone.w === w); assert.equal(J.state().faults, 0, 'no fault for lifting');
  assert.ok(Math.abs(J.state().hang.tilt - J.need()) < 1e-9, 'lifted, it hangs true over its own place');
  const J2 = F.createVault106(0, seeded(4)); J2.pick(0); assert.equal(J2.back(), 'back'); assert.equal(J2.state().row[0].used, false); assert.equal(J2.lift('L'), 'below');
});

test('the keystone: chosen off the bench to the gap — too wide sticks above (no fault, back to the bench), too narrow falls (a fault, it is gone), the true one seats', () => {
  const J2 = F.createVault106(0, seeded(7)), k2 = J2.state();
  J2.pick(k2.row.find((x) => !x.cracked && x.w <= 4).id); const w = k2.hang.stone.w; k2.L.push({ w: 4 - w }); k2.R.push({ w: 4 }); assert.equal(J2.aim('L'), 'aim');
  const h = k2.hang; h.tilt = h.tT = J2.need(); h.h = 0.1; h.s = h.sv = 0; J2.hold(true); let r = null; for (let n = 0; n < 60 && !r; n++) r = J2.step(1 / 60);
  assert.equal(r, 'seat'); assert.equal(k2.ph, 'key', 'both sides full: the keystones'); assert.ok(k2.gap >= 9 && k2.gap <= 12); assert.deepEqual(k2.keys.map((x) => x.over).sort(), [-1, 0, 1]); assert.ok(k2.keys.every((x) => x.w === k2.gap + x.over));
  const lower = (K) => { J2.keyUp(K.i); k2.hang.h = 0.1; k2.hang.s = k2.hang.sv = 0; J2.hold(true); let r2 = null; for (let n = 0; n < 60 && !r2; n++) r2 = J2.step(1 / 60); return r2; };
  const wide = k2.keys.find((x) => x.over > 0), narrow = k2.keys.find((x) => x.over < 0), even = k2.keys.find((x) => x.over === 0);
  assert.equal(lower(wide), 'tight'); assert.equal(k2.faults, 0); assert.equal(wide.gone, false);
  assert.equal(lower(narrow), 'falls'); assert.equal(k2.faults, 1); assert.equal(narrow.gone, true); assert.equal(J2.keyUp(narrow.i), 'none', 'a broken keystone is not lifted');
  assert.equal(lower(even), 'seat'); assert.equal(k2.ph, 'strike');
});

test('the wedges: two taps each, side by side; three on one side → uneven', () => {
  const J = F.createVault106(0), k = J.state(); k.ph = 'strike';
  for (const q of [0, 0, 2, 2, 1, 1, 3, 3]) J.strike(q); assert.equal(k.done, true); assert.equal(k.uneven, 0); assert.equal(k.q, 1);
  const J2 = F.createVault106(0), k2 = J2.state(); k2.ph = 'strike'; J2.strike(0); J2.strike(0); assert.equal(J2.strike(1), 'uneven'); assert.equal(k2.faults, 1);
});

test('lines and sources: every line sourced or marked, no Divine Name', () => {
  for (const [key, l] of Object.entries(F.L106)) assert.ok(/ · (טיוטה|המחשה)$/.test(l), key);
  for (const l of F.SRC106) assert.ok(/(טיוטה|המחשה של בניית קשתות בתקופה)$/.test(l), l);
  assert.ok(!/סתת/.test(Object.values(F.L106).join(' ')), 'no dressing in the courts (1 Kings 6:7)');
  assert.ok(!/יהוה|אלהים|ה׳/.test(Object.values(F.L106).concat(F.SRC106).join(' ')));
});
