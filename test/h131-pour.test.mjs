// build 131 — stage 08's pour (src/game/h131/sim.js, pourlv.js): the approved sample's simulation kept as it is, the three levels really
// different (each wins with a sensible plan, loses poured at one spot), level 3's timber and reeds, and a pour kept in the save.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S0 from '../samples/yetzika/sim.js';
import * as S1 from '../src/game/h131/sim.js';
import { LEVELS, newSim, cellsOf, landing, toWorld, toLocal, packWork, unpackWork, SIM_T as T, NX, NZ, cellX } from '../src/game/h131/pourlv.js';
import { BOOK } from '../src/game/world/grid.js';

const tOf = (x) => (x + 6 - 0.4) / 11.2;
function run(lv, policy, maxT = 240) {
  const sim = newSim(lv), C = cellsOf(lv), dt = 1 / 60; let t = 0, end = null, setting = false, spilled = 0, reed = 0;
  for (let s = 0; s < 60 * maxT; s++) {
    const p = policy(t, sim); sim.step(dt, p.t, p.tilt); t += dt;
    const sp = sim.spout, w = sp.tilt >= 0.04 && !sim.cauldron.swapping ? landing({ spout: { ...sp, q: 1 } }, lv, C) : null;
    if (w === 'timber') { const q = Math.min(sim.cauldron.amount, T.QMAX * Math.pow(sp.tilt, T.TILT_POW) * dt); sim.cauldron.amount -= q; spilled += q; }
    if (w && w.startsWith('reed')) reed++;
    const done = (sim.isFull() && sim.noPourTime > 1.5) || sim.stillTime > 1 && (sim.noPourTime > 4 && sim.hollowCells > 0 || sim.exhausted) || (sim.exhausted && sim.noPourTime > 6);
    setting = done || (setting && sim.spout.q <= 0); sim.setting = setting;
    if (setting && s % 6 === 0 && sim.hotLiquid() === 0) { end = 1; break; }
  }
  sim.freezeAll(); sim.markPlugsForHollows();
  return { result: end ? (sim.isFull() ? 'FULL' : 'HOLLOW') : 'TIMEOUT', used: sim.cauldron.used, missing: sim.missingCells, spilled, reed, sim };
}
function restColumn(sim, avoid) { let best = -1, bx = 0; for (let i = 2; i < NX - 2; i++) { const x = cellX(i); if (avoid && avoid(x)) continue; let n = 0; for (let k = 0; k < NZ; k++) { const c = k * NX + i; if (sim.floor[c] && sim.reach[c] && sim.ground[c] + sim.solid[c] + sim.vol[c] < T.FULL_LEVEL) n++; } if (n > best) { best = n; bx = x; } } return bx; }
function plan(order, tilt, hold = 16, avoid = null) {
  let ph = 0, since = 0, still = 0, rest = null, until = 0;
  return (t, sim) => { still = sim.spout.q > 0 || sim.cauldron.swapping ? 0 : still + 1 / 60; if (ph < order.length && (still > 2 || t - since > hold)) { ph++; since = t; still = 0; } let x = order[ph]; if (ph >= order.length) { if (rest === null || t > until || still > 2) { rest = restColumn(sim, avoid); until = t + 4; still = 0; } x = rest; } return { t: tOf(x), tilt }; };
}
const at = (x, tilt) => () => ({ t: tOf(x), tilt });

test('pour: the sample\'s simulation as it is — the same tuning, and without a level the same segment cell for cell', () => {
  assert.deepEqual({ ...S1.T }, { ...S0.T });
  for (const k of ['NX', 'NZ', 'DX', 'W', 'D', 'H']) assert.equal(S1[k], S0[k], k);
  const a = S0.createSim(), b = S1.createSim();
  assert.deepEqual(Array.from(b.ground), Array.from(a.ground)); assert.deepEqual(Array.from(b.floor), Array.from(a.floor));
  for (let i = 0; i < 600; i++) { a.step(1 / 60, 0.3, 0.8); b.step(1 / 60, 0.3, 0.8); }
  assert.deepEqual(Array.from(b.vol), Array.from(a.vol));
  assert.equal(LEVELS[2].stones, S1.STONES);   // (level 2 is the approved sample's own segment)
});

test('pour: the section\'s frame on the court — level 1 and 2 face north, level 3 south; level 3\'s reeds and timber from the book', () => {
  for (const lv of [1, 2, 3]) { const b = BOOK.s08.sections[lv]; const [x0, , z0] = toWorld(lv, -6, 0, -4), [x1, , z1] = toWorld(lv, 6, 0, 4); assert.deepEqual([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], [...b]); }
  assert.equal(toWorld(1, 0, 0, 4)[2], BOOK.s08.altar[1]); assert.equal(toWorld(3, 0, 0, 4)[2], BOOK.s08.altar[3]);
  const L = LEVELS[3]; assert.deepEqual(L.reeds, BOOK.s08.reeds.map(([x, z]) => toLocal(3, x, z)));
  assert.ok(L.timber[1] >= 3 && L.timber[3] <= 4 && L.timber[0] > L.reeds[1][0]);
  const s = newSim(3), c = cellsOf(3); let tc = 0, rc = 0; for (let i = 0; i < c.timber.length; i++) { if (c.timber[i]) { tc++; assert.equal(s.floor[i], 0); } if (c.reed[i] >= 0) rc++; }
  assert.ok(tc > 200 && rc >= 2);
});

test('pour: each level is won by a sensible plan, in two cauldrons, and lost poured at one spot', () => {
  const L1 = run(1, plan([], 0.8)); assert.equal(L1.result, 'FULL'); assert.ok(L1.used <= 2);
  const L1x = run(1, at(-4, 0.7)); assert.equal(L1x.result, 'HOLLOW'); assert.ok(L1x.missing >= 40);
  const L2 = run(2, plan([-3.65, 3.85, 0], 0.9, 18)); assert.equal(L2.result, 'FULL'); assert.ok(L2.used <= 2);
  const L3 = run(3, plan([-4.8, -0.95, 2.9], 0.8, 14, (x) => x < LEVELS[3].reeds[1][0] + 0.9)); assert.equal(L3.result, 'FULL'); assert.ok(L3.used <= 2); assert.ok(L3.spilled < 0.35, 'a stain: ' + L3.spilled); assert.equal(L3.reed, 0);   // (the tilt's first instant crosses the timber's line: under the stain's mark)
  const L3x = run(3, at(0, 1.0)); assert.equal(L3x.result, 'HOLLOW');
});

test('pour: level 3 — a low stream lands on the timber (a spill), a stream at the corner on a reed (a clog)', () => {
  const sp = run(3, at(1, 0.3), 30); assert.ok(sp.spilled > 0.35, 'spilled ' + sp.spilled);
  const rd = run(3, at(-5.0, 0.15), 10); assert.ok(rd.reed > 0);
  const ok = run(3, at(1, 0.8), 10); assert.ok(ok.spilled < 0.35); assert.equal(ok.reed, 0);
});

test('pour: a pour kept in the save comes back as it stood (set where it lay), with its patch and cauldrons', () => {
  const a = newSim(2); for (let i = 0; i < 900; i++) a.step(1 / 60, 0.3, 0.9);
  a.patch[100] = 1; a.cauldron.used = 2;
  const blob = JSON.parse(JSON.stringify(packWork(a, { lv: 2, stonesIn: 16 })));
  const b = newSim(2); assert.ok(unpackWork(b, blob));
  for (let c = 0; c < a.vol.length; c++) assert.ok(Math.abs(b.solid[c] - Math.min(2.55, a.solid[c] + a.vol[c])) <= 0.006, String(c));
  assert.equal(b.patch[100], 1); assert.equal(b.cauldron.used, 2); assert.equal(blob.stonesIn, 16); assert.ok(JSON.stringify(blob).length < 12000);
});
