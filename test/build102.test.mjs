// build 102 — stage 07 rebuilt on build 101's world (the design doc "שלבים 07–10: החלטות לפני בנייה", 4.11; the owner 5.11 07:41: "אל תחכה.
// תתקדם"): the rope compass in לשכת הגזית, the wheel and the bucket in לשכת הגולה, the vault ring by ring in בית המוקד — each played by a hand.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as L from '../src/game/lish102.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** a hand round the peg: its pull (a share of the window) and a slow drift in and out (a share of R) */
function rope(i, pull, drift, T = 7) {
  const J = L.createRope102(i, { Rpx: 160 }), k = J.state(); let t = 0;
  const a0 = k.m - Math.PI / 2 - 0.05, a1 = k.m + Math.PI / 2 + 0.05;
  while (!k.done && t < 30) { if (k.yanked) J.replant(); const u = Math.min(1, t / T); J.feed(a0 + (a1 - a0) * u, k.R * (1 + pull * k.win + drift * Math.sin(t * 1.7)), 1 / 60); t += 1 / 60; }
  return k;
}
test('build 102: the rope compass — taut is round; too near the line runs in; too far the peg is torn out; four arcs, the rows wider and the pull narrower', () => {
  assert.equal(L.ROPE102.arcs.length, 4); assert.equal(L.ROPE102.arcs[0].guide, true); assert.ok(L.ROPE102.arcs.slice(1).every((a) => !a.guide && a.m === 0));
  for (let i = 1; i < 4; i++) { assert.ok(L.ROPE102.arcs[i].R >= L.ROPE102.arcs[i - 1].R); assert.ok(L.ROPE102.arcs[i].win < L.ROPE102.arcs[i - 1].win); }
  for (let i = 0; i < 4; i++) {
    const ok = rope(i, 0.4, 0.03); assert.ok(ok.done && ok.q === 1 && ok.yanks === 0 && ok.rnd >= 95, `careful ${i}: ${ok.rnd}`);
    const near = rope(i, -0.6, 0.01); assert.ok(near.done && near.q === 0 && near.rnd < 70, `near ${i}: ${near.rnd}`);
    const hard = rope(i, 1.7, 0.01); assert.ok(hard.yanks >= 1 && hard.q === 0, `hard ${i}`);
  }
  assert.ok(rope(0, 0.3, 0.1).q === 0.5, 'a wandering hand: כשר');
  { const J = L.createRope102(1, { Rpx: 160 }), k = J.state(); for (let a = k.m - Math.PI / 2 + 0.09; !k.done && a < k.m + Math.PI / 2 + 0.3; a += 0.11) J.feed(a, k.R * (1 + 0.4 * k.win), 0.1); for (let q = 0; q < 5 && !k.done; q++) J.feed(k.m + Math.PI / 2 + 0.05, k.R * (1 + 0.4 * k.win), 0.1); assert.ok(k.done, 'a coarse hand (a slow phone) that runs off the end in one step (set down a hair inside the stake) still closes the arc'); }
  const J = L.createRope102(0, { Rpx: 60 }); assert.ok(J.state().win >= 13 / 60, 'on a small screen the window is never under 13 px');
  assert.equal(L.ropeQ102([1, 1, 1, 1]), 1); assert.equal(L.ropeQ102([0, 1, 1, 1]), 0.5); assert.equal(L.ropeQ102([1, 0.5, 0.5, 0.5]), 0.5); assert.equal(L.ropeQ102([0, 0, 0, 0.5]), 0);
});

/** a hand on the hub: steady w (rad/s) after a ramp; slow near the top; jerk: stop and go */
function wheel(i, w, ramp, jerk = 0) {
  const J = L.createWheel102(i, rnd), k = J.state(); let t = 0, phi = 0; J.grab(0);
  while (k.ph === 'up' && t < 60) { const near = k.h > -0.9; const ws = near ? 0.4 : Math.min(w, (w * t) / ramp) * (jerk ? (Math.floor(t / 0.4) % 2 ? 1 + jerk : 1 - jerk) : 1); if (k.h < L.WHEEL102.top.lo + 0.15 || !near) phi += ws / 60; J.drag(phi); J.step(1 / 60); t += 1 / 60; }
  return k;
}
test('build 102: the wheel and the bucket — a smooth hand brings it full; a jerky or a fast one spills; each bucket deeper and touchier; stopped at the lip, poured', () => {
  for (let i = 0; i < 4; i++) { const k = wheel(i, 2.4, 1.5); assert.equal(k.ph, 'caught'); assert.ok(k.W >= 0.9 && !k.knocks, `smooth ${i}: ${k.W}`); }
  for (let i = 1; i < 4; i++) { const k = wheel(i, 3, 0.2, 0.8); assert.ok(k.W < 0.9 && k.spills >= 1, `jerky ${i}: ${k.W}`); }
  for (let i = 0; i < 4; i++) { const k = wheel(i, 7, 0.5); assert.ok(k.knocks >= 1 && k.W < 0.9, `fast ${i}`); }
  for (let i = 1; i < 4; i++) { const a = L.WHEEL102.buckets[i], b = L.WHEEL102.buckets[i - 1]; assert.ok(a.depth > b.depth && a.rim < b.rim && a.vmax < b.vmax); }
  // let go: the wheel runs back, slowly
  const J = L.createWheel102(0, rnd), k = J.state(); J.grab(0); for (let t = 0, phi = 0; t < 2; t += 1 / 60) { phi += 2 / 60; J.drag(phi); J.step(1 / 60); } const h0 = k.h; J.let(); for (let t = 0; t < 2.5; t += 1 / 60) J.step(1 / 60); assert.ok(k.h < h0 && h0 - k.h < 0.8, 'it sinks back slowly when let go');
  // wound past the lip: it hits the wheel and tips
  const J2 = L.createWheel102(0, rnd), k2 = J2.state(); J2.grab(0); for (let t = 0, phi = 0; t < 20 && !k2.hits; t += 1 / 60) { phi += 2 / 60; J2.drag(phi); J2.step(1 / 60); } assert.ok(k2.hits >= 1 && k2.W < 0.5);
  assert.equal(J.pour(), false, 'not poured before it is caught');
  const k3 = wheel(0, 2.4, 1.5); assert.equal(k3.ph, 'caught');
});

test('build 102: the vault ring — the sides must end on the keystone\'s edges; a side ahead tilts; a gap too wide drops the keystone, too narrow it does not go in; the wedges, then it stands', () => {
  const R = L.createRing102(0); assert.equal(R.S, 11);
  assert.equal(R.place('L', 4), 'ok'); assert.equal(R.place('L', 4), 'tilt', 'a side two stones ahead'); assert.equal(R.place('R', 4), 'ok');
  assert.equal(R.place('L', 4), 'ok'); assert.equal(R.place('R', 4), 'ok'); assert.equal(R.place('L', 4), 'none', 'the 4s are used up');
  assert.equal(R.key(), 'falls', 'a gap of six units: the keystone falls through'); assert.equal(R.place('L', 3), 'ok'); assert.equal(R.place('R', 3), 'ok');
  assert.equal(R.key(), 'seat'); for (let q = 0; q < 3; q++) assert.equal(R.strike(), 'out'); assert.equal(R.strike(), 'eased'); assert.equal(R.settle(), 0.5, 'two corrections: כשר');
  const R2 = L.createRing102(1); for (const [s, w] of [['L', 4], ['R', 4], ['L', 4], ['R', 3], ['L', 2], ['R', 3]]) assert.equal(R2.place(s, w), 'ok'); assert.equal(R2.key(), 'seat');
  const R3 = L.createRing102(2); R3.place('L', 5); R3.place('R', 5); R3.place('L', 4); R3.place('R', 4); assert.equal(R3.place('L', 4), 'over', 'past the crown'); assert.equal(R3.place('L', 2), 'ok'); assert.equal(R3.back('L'), 2); assert.equal(R3.state().backs, 1);
  const R4 = L.createRing102(2); R4.place('L', 5); R4.place('R', 5); R4.place('L', 4); R4.place('R', 4); R4.place('L', 3); R4.place('R', 3); assert.equal(R4.key(), 'tight');
  assert.deepEqual([...L.PARTS102], ['open', 'compass', 'wheel', 'dome', 'reveal']);
});

test('build 102: wired — stage 07\'s parts are the three acts; build 50\'s acts out; the yard no longer offers them; light B by default; sourced lines', () => {
  const H = read('src/game/har42.js');
  assert.match(H, /import \* as F102 from '\.\/lish102\.js';/); assert.match(H, /STG === 'lishka' \? F102\.PARTS102 :/);
  for (const [p, f] of [['compass', 'mkRope102'], ['wheel', 'mkWheel102'], ['dome', 'ON106 \\? mkVault106\\(\\) : mkVault102']]) assert.match(H, new RegExp(`\\n    ${p}: \\{ begin\\(\\) \\{ st\\.job = ${f}\\(\\); \\} \\},`));   // (build 106: the vault rebuilt behind ON106)
  for (const f of ['mkCompass50', 'mkBenches50', 'mkHub50', 'mkWheel50', 'mkDome50']) assert.ok(!H.includes(`function ${f}(`), `${f} out`);
  assert.match(H, /export const OUT99 = Object\.freeze\(\['lintel', 'leaf', 'lever', 'compass', 'wheel', 'arch'\]\);/);
  assert.match(H, /globalThis\.__LIGHT101 \|\| 'b'\) === 'b' \? 'work2' : 'work'/);
  { const acts = H.slice(H.indexOf('function mkRope102('), H.indexOf('function mkVault102(') + 20000); assert.ok(!/[^.\w]qs\(/.test(acts), 'the acts keep their grades in a local qs: no qs() call there (build 102: ?h102b broke the wheel)'); }
  assert.match(read('src/game/site63.js'), /lishka: Object\.freeze\(\{ compass: \[\], wheel: \[\], dome: \[\] \}\)/);
  for (const [k, v] of Object.entries(L.L102)) { const head = v.split(' · ')[0]; assert.ok(head.length <= 80, `${k}: ${head.length}`); assert.match(v, /טיוטה|המחשה/, k); }
  assert.ok(L.SRC102.some((x) => /סנהדרין ד, ד/.test(x)) && L.SRC102.some((x) => /מדות ה, ד/.test(x)) && L.SRC102.some((x) => /מדות א, ח/.test(x)));
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4)]; for (const s of [read('src/game/lish102.js')]) for (const n of N) assert.ok(!s.includes(n));
});
