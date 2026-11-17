// Acceptance tests for the pour simulation (node samples/yetzika/test-sim.mjs).
// Every sensible plan must win; plans that ignore the cooling must lose.
// Optional: YZ_T='{"KFLOW":3}' overrides tuning numbers, YZ_ONLY=a,b selects groups, YZ_V=1 prints every run.
import { createSim, T, NX, NZ, cellX, cellZ } from './sim.js';
import { pathToFileURL } from 'node:url';

const BASE = { ...T };
let OVR = process.env.YZ_T ? JSON.parse(process.env.YZ_T) : {};
const ONLY = process.env.YZ_ONLY ? process.env.YZ_ONLY.split(',') : null;
const VERBOSE = !!process.env.YZ_V;

const XL = -3.65, XR = 3.85, XC = 0;               // left passage, right passage, centre (amot)
const tOf = x => (x + 6 - 0.4) / 11.2;             // spout parameter for a world x

// the same end rule as the game (main.js): knock when nothing moves and the segment is done
export function run(policy, maxT = 240) {
  Object.assign(T, BASE, OVR);
  const sim = createSim();
  const dt = 1 / 60;
  let t = 0, end = null, setting = false;
  const seals = [];
  for (let s = 0; s < 60 * maxT; s++) {
    const p = policy(t, sim);
    sim.step(dt, p.t, p.tilt); t += dt;
    for (const e of sim.sealEvents.splice(0)) seals.push({ t: +t.toFixed(1), x: +e.x.toFixed(2), z: +e.z.toFixed(2), cells: e.cells });
    const settled = sim.stillTime > 1.0;
    const done = (sim.isFull() && sim.noPourTime > 1.5) || settled && (sim.noPourTime > 4 && sim.hollowCells > 0 || sim.exhausted)
      || (sim.exhausted && sim.noPourTime > 6);   // the last cauldron is done: never wait forever
    setting = done || (setting && sim.spout.q <= 0);
    sim.setting = setting;
    if (setting && s % 6 === 0 && sim.hotLiquid() === 0) { end = 'knock'; break; }
  }
  sim.freezeAll();
  const regions = sim.markPlugsForHollows();
  const result = end ? (sim.isFull() ? 'FULL' : 'HOLLOW') : 'TIMEOUT';
  return {
    result, t: +t.toFixed(1), fill: +sim.filledFraction.toFixed(4), missing: sim.missingCells, hollow: sim.hollowCells,
    used: sim.cauldron.used, seals,
    regions: regions.map(r => ({ cells: r.cells, x: +r.x.toFixed(2), z: +r.z.toFixed(2), plug: r.plug ? [+r.plug.x.toFixed(2), +r.plug.z.toFixed(2)] : null })),
    sim,
  };
}

// share of a back pocket's floor that is full
function pocketFill(sim, side) {
  let n = 0, f = 0;
  for (let k = 0; k < 11; k++) for (let i = 0; i < NX; i++) {
    const c = k * NX + i, x = cellX(i);
    if (!sim.floor[c]) continue;
    if (side < 0 ? x > -1.5 : x < 1.5) continue;
    if (cellZ(k) > -1.9) continue;
    n++;
    if (sim.ground[c] + sim.solid[c] + sim.vol[c] >= T.FULL_LEVEL) f++;
  }
  return f / n;
}

// where a child pours "the rest": the column with the most open, not yet full floor it can still reach
function restColumn(sim) {
  let best = -1, bx = 0;
  for (let i = 2; i < NX - 2; i++) {
    let n = 0;
    for (let k = 0; k < NZ; k++) { const c = k * NX + i; if (sim.floor[c] && sim.reach[c] && sim.ground[c] + sim.solid[c] + sim.vol[c] < T.FULL_LEVEL) n++; }
    if (n > best) { best = n; bx = cellX(i); }
  }
  return bx;
}
// A plan the way a child plays it: hold the spout at the first passage until that pocket looks full
// (or nothing more goes in), then the second passage, then the centre; when the stream stops there,
// after about ten seconds there (or when the stream stops) move to whatever still looks low (re-aim every few seconds).
// opts.times = [t1, t2] makes the first two moves at fixed times instead (for the sloppy-timing runs).
export function planPolicy(order, tilt, opts = {}) {
  const dts = opts.dt || [0, 0, 0];
  let phase = 0, since = 0, still = 0, rest = null, restUntil = 0, centreT = -1;
  const switches = [];
  const pol = (t, sim) => {
    still = sim.spout.q > 0 || sim.cauldron.swapping ? 0 : still + 1 / 60;
    if (opts.times) {
      const ph = t < opts.times[0] ? 0 : t < opts.times[1] ? 1 : 2;
      if (ph !== phase) { phase = ph; still = 0; }
    } else if (phase < 2) {
      const side = order[phase] < 0 ? -1 : 1;
      const lookFull = pocketFill(sim, side) > (opts.look || 0.93);
      if (lookFull || still > 2 || t - since > 45) { phase++; since = t; still = 0; switches.push(+t.toFixed(2)); }
    }
    let x = order[Math.min(phase, 2)];
    if (phase === 2 && !opts.noRest) {
      if (centreT < 0) centreT = t;
      if (rest === null && (still > 2 || t - centreT > 10)) { rest = restColumn(sim); restUntil = t + 4; still = 0; }
      else if (rest !== null && (t > restUntil || still > 2)) { rest = restColumn(sim); restUntil = t + 4; still = 0; }
      if (rest !== null) x = rest;
    }
    return { t: tOf(x) + dts[Math.min(phase, 2)], tilt: opts.tilts ? opts.tilts[Math.min(phase, 2)] : tilt };
  };
  pol.switches = switches;
  return pol;
}
export const constPolicy = (x, tilt) => () => ({ t: tOf(x), tilt });
// pour at the centre until the near area is mostly full, only then the passages
export function centreFirstPolicy(tilt) {
  let phase = 0, since = 0, still = 0, rest = null, restUntil = 0;
  return (t, sim) => {
    still = sim.spout.q > 0 || sim.cauldron.swapping ? 0 : still + 1 / 60;
    if (phase === 0) {
      let n = 0, f = 0;
      for (let k = 14; k < NZ; k++) for (let i = 0; i < NX; i++) { const c = k * NX + i; if (!sim.floor[c]) continue; n++; if (sim.ground[c] + sim.solid[c] + sim.vol[c] >= T.FULL_LEVEL) f++; }
      if (f / n > 0.8 || still > 2) { phase = 1; since = t; still = 0; }
    } else if (phase === 1 && (t - since > 20 || still > 2)) { phase = 2; since = t; still = 0; }
    else if (phase === 2 && (t - since > 20 || still > 2)) { phase = 3; since = t; still = 0; }
    let x = phase === 0 ? XC : phase === 1 ? XL : XR;
    if (phase === 3) {
      if (rest === null || t > restUntil || still > 2) { rest = restColumn(sim); restUntil = t + 4; still = 0; }
      x = rest;
    }
    return { t: tOf(x), tilt };
  };
}

// ---- the tests ---------------------------------------------------------------------------
const tests = [];
const NAME = process.env.YZ_NAME ? new RegExp(process.env.YZ_NAME) : null;
const add = (group, name, fn) => { if ((!ONLY || ONLY.includes(group)) && (!NAME || NAME.test(group + ' ' + name))) tests.push({ group, name, fn }); };
const full3 = r => r.result === 'FULL' && r.used <= 3;

for (const tilt of [0.6, 0.75, 1.0]) add('a', `L>R>C tilt ${tilt}`, () => {
  const p = planPolicy([XL, XR, XC], tilt); const r = run(p); return [r, full3(r), `moves ${p.switches.join(',')}`];
});
for (const tilt of [0.6, 0.9]) add('b', `R>L>C tilt ${tilt}`, () => {
  const p = planPolicy([XR, XL, XC], tilt); const r = run(p); return [r, full3(r), `moves ${p.switches.join(',')}`];
});
let ref = null;
export function setOverrides(o) { OVR = o || {}; ref = null; }
const reference = () => { if (!ref) { const p = planPolicy([XL, XR, XC], 0.7); ref = { r: run(p), sw: p.switches }; } return ref; };
add('c', 'reference L>R>C tilt 0.7', () => { const { r, sw } = reference(); return [r, full3(r), `moves ${sw.join(',')}`]; });
for (const [d1, d2] of [[4, 4], [-4, -4], [4, -4], [-4, 4]]) for (const off of [0, -0.08, 0.08])
  add('c', `moves ${d1 > 0 ? '+' : ''}${d1}s/${d2 > 0 ? '+' : ''}${d2}s spout ${off >= 0 ? '+' : ''}${off}`, () => {
    const [s1, s2] = reference().sw;
    const r = run(planPolicy([XL, XR, XC], 0.7, { times: [s1 + d1, s2 + d2], dt: [off, off, off] }));
    return [r, full3(r), `moves at ${(s1 + d1).toFixed(1)},${(s2 + d2).toFixed(1)}`];
  });
add('d', 'good player L>R (1.0) > C (0.8)', () => {
  const p = planPolicy([XL, XR, XC], 0, { tilts: [1.0, 1.0, 0.8] }); const r = run(p);
  return [r, r.result === 'FULL' && r.used <= 2, `moves ${p.switches.join(',')}`];
});
add('d', 'good player R>L (0.9) > C (0.8)', () => {
  const p = planPolicy([XR, XL, XC], 0, { tilts: [0.9, 0.9, 0.8] }); const r = run(p);
  return [r, r.result === 'FULL' && r.used <= 2, `moves ${p.switches.join(',')}`];
});
// a losing run must be clearly hollow, not a speck: at least CLEAR cells (1.6 square amot) left without mix
const CLEAR = 40;
const clearlyHollow = r => r.result === 'HOLLOW' && r.missing >= CLEAR;
// the thumb comes down a moment later and the tilt ramps up like a real drag (the outcome must not hang on it)
const late = (pol, d) => (t, sim) => { const p = pol(t, sim); return t < d ? { t: p.t, tilt: 0 } : { t: p.t, tilt: Math.min(p.tilt, (t - d) * 3) }; };
for (const x of [-5, XL, -2, XC, 2, XR, 5]) for (const tilt of [0.7, 1.0])
  add('e', `single spot x=${x} tilt ${tilt}`, () => { const r = run(constPolicy(x, tilt)); return [r, clearlyHollow(r)]; });
for (const d of [0.4, 0.9, 1.4, 1.9])
  add('e', `single spot x=0 tilt 1, thumb down at ${d}s`, () => { const r = run(late(constPolicy(XC, 1), d)); return [r, clearlyHollow(r)]; });
for (const tilt of [0.7, 1.0])
  add('f', `centre first, then passages, tilt ${tilt}`, () => { const r = run(centreFirstPolicy(tilt)); return [r, clearlyHollow(r)]; });
for (const d of [0.6, 1.6])
  add('f', `centre first, then passages, tilt 1, thumb down at ${d}s`, () => { const r = run(late(centreFirstPolicy(1), d)); return [r, clearlyHollow(r)]; });
// trickle: the pocket behind the passage stays empty and its plug sits inside or at the mouth of that passage
const plugAtPassage = (r, x) => {
  const side = Math.sign(x);
  const pocket = r.regions.find(g => Math.sign(g.x) === side && g.z < -1.5 && g.cells > 60);
  if (pocket && pocket.plug && Math.abs(pocket.plug[0] - x) < 1.3 && pocket.plug[1] > -2.6 && pocket.plug[1] < 0.4) return true;
  // or, when the trickle stopped so early that the whole segment is one hollow: the pocket behind that passage
  // is (almost) empty and hardened mix sits in the passage or at its mouth
  const s = r.sim; let n = 0, empty = 0, plugCells = 0;
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    const c = k * NX + i, cx = cellX(i), cz = cellZ(k);
    if (!s.floor[c]) continue;
    if (k < 9 && Math.sign(cx) === side && Math.abs(cx) > 1.5) { n++; if (s.hollow[c]) empty++; }
    if (Math.abs(cx - x) < 1.3 && cz > -2.6 && cz < 0.4 && s.solid[c] > 0.1) plugCells++;
  }
  return n > 0 && empty / n > 0.8 && plugCells >= 4;
};
// a trickle into a passage: pour normally until the mix reaches the mouth of the passage, then only a trickle
export function tricklePolicy(x, tilt) {
  let phase = 0;
  return (t, sim) => {
    if (phase === 0) {
      for (let k = 0; k < NZ && !phase; k++) {
        const z = cellZ(k); if (z > -0.3 || z < -1.0) continue;
        for (let i = 0; i < NX; i++) { const c = k * NX + i; if (Math.abs(cellX(i) - x) < 0.9 && sim.floor[c] && sim.vol[c] + sim.solid[c] > 0.05) { phase = 1; break; } }
      }
    }
    return { t: tOf(x), tilt: phase ? tilt : 0.7 };
  };
}
for (const [x, tilt] of [[XL, 0.25], [XR, 0.25], [XL, 0.2], [XR, 0.2]])
  add('g', `trickle into passage x=${x} tilt ${tilt}`, () => { const r = run(tricklePolicy(x, tilt)); return [r, r.result === 'HOLLOW' && plugAtPassage(r, x)]; });
for (const [x, tilt] of [[XL, 0.25], [XR, 0.25]])
  add('g', `trickle from the start x=${x} tilt ${tilt}`, () => { const r = run(constPolicy(x, tilt)); return [r, r.result === 'HOLLOW' && plugAtPassage(r, x)]; });

export { XL, XR, XC, tOf, tests };
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const SH = process.env.YZ_SHARD ? process.env.YZ_SHARD.split('/').map(Number) : [0, 1];
let fails = 0, count = 0;
tests.forEach((tc, idx) => {
  if (idx % SH[1] !== SH[0]) return;
  const [r, ok, extra] = tc.fn();
  count++; if (!ok) fails++;
  const sl = r.seals.map(s => `${s.t}s@(${s.x},${s.z})`).join(' ');
  const rg = r.regions.map(g => `${g.cells}c@(${g.x},${g.z})${g.plug ? ' plug(' + g.plug.join(',') + ')' : ''}`).join(' ');
  console.log(`${ok ? 'PASS' : 'FAIL'} ${tc.group} ${tc.name.padEnd(34)} ${r.result.padEnd(7)} t=${r.t} fill=${r.fill} missing=${r.missing} cauldrons=${r.used}` +
    (extra ? ' ' + extra : '') + (VERBOSE || !ok || r.result === 'HOLLOW' ? `\n      seals[${sl}] regions[${rg}]` : ''));
});
console.log(`\n${count - fails}/${count} passed`);
// cost of one simulation frame (one 1/60 s step, including the hollow check every 6th step) during a busy pour
if (SH[0] === 0 && (!ONLY || ONLY.includes('bench'))) {
  Object.assign(T, BASE, OVR);
  const sim = createSim(), pol = planPolicy([XL, XR, XC], 0.7), times = [];
  let t = 0;
  for (let s = 0; s < 60 * 70; s++) {
    const p = pol(t, sim);
    const a = process.hrtime.bigint(); sim.step(1 / 60, p.t, p.tilt); const b = process.hrtime.bigint();
    if (s > 120) times.push(Number(b - a) / 1e6);
    t += 1 / 60;
  }
  times.sort((x, y) => x - y);
  const mean = times.reduce((x, y) => x + y, 0) / times.length;
  console.log(`sim cost per frame: mean ${mean.toFixed(3)} ms, p95 ${times[Math.floor(times.length * 0.95)].toFixed(3)} ms, max ${times[times.length - 1].toFixed(3)} ms (${times.length} frames)`);
}
process.exit(fails ? 1 : 0);
}
