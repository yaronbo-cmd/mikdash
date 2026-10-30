// ── build 52 ── Phase B fixes, round 2 (the coordinator's build-52 play-test of build 51, every act by real touch at 844 and most at 640):
// the shochet's binding seen whole (SH52: the lamb on its side across the frame, its legs, the arrow on them, him ≤ 35 % of the width and
// behind it, the zorek out of the frame; a drag within ±35° of the arrow and the gate's length; the cut back at build 27's medium shot,
// its needle waiting for the view), the laver from its side and lit (KV52, LIGHT52), the ashes' walk saying its gesture ("ימין: גררו נגד
// הנטייה ↔") with one hand on the right half at the first walk and level 1 softened for a child a reaction behind (tools/bal52.mjs), the
// menorah's and the inner altar's rule at 28 % (OBJ52); GAME_BUILD 52. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SH52, KV52, P27, SWIPE51, swipe51 } from '../src/avodah/shift/day33.js';
import { BIND52, bindNeed52, bindOk52 } from '../src/avodah/shift/dam27.js';
import { LIGHT52 } from '../src/avodah/shift/kiyor20.js';
import { WALK52 } from '../src/avodah/shift/deshen21.js';
import { LINE30, words30 } from '../src/avodah/shift/rate30.js';
import { par36 } from '../src/avodah/shift/lvl36.js';
import * as TW from '../src/game/twin.js';
const { share51, LIFT51 } = TW;
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { rig, FLAGS } from './rig33.mjs';
import { walk52 } from '../tools/bal52.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const ASP = 844 / 390;
const tans = (fov) => { const v = Math.tan((fov * Math.PI) / 360); return [v * ASP, v]; };
const LS = 1.35, LY = 16.18, L = P27.lamb;
const LAMB_BB = [L.x - 0.35 * LS, LY - 0.05, L.z - 0.5 * LS, L.x + 0.85 * LS, LY + 0.55 * LS, L.z + 1.0 * LS];   // (dam27's thing while binding)
const fig = (x, z, y = 16) => [x - 0.6, y, z - 0.6, x + 0.6, y + 3.96, z + 0.6];
/** a point on the screen (NDC) from P looking at T (pure, as share51 projects) */
function ndc(P, T, q, tanH, tanV) {
  let fx = T[0] - P[0], fy = T[1] - P[1], fz = T[2] - P[2]; const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
  const rl = Math.hypot(fx, fz), rx = -fz / rl, rz = fx / rl, ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy, v = [q[0] - P[0], q[1] - P[1], q[2] - P[2]], d = v[0] * fx + v[1] * fy + v[2] * fz;
  return { x: (v[0] * rx + v[2] * rz) / (d * tanH), y: (v[0] * ux + v[1] * uy + v[2] * uz) / (d * tanV) };
}

/** his figure's screen box as cam41 measures it — a 0.6-amah cylinder, feet to top, 16 points — its width share and whether in the frame */
function figW(P, T, tanH, tanV, x, z, y = 16) {
  let a0 = 9, a1 = -9, b0 = 9, b1 = -9;
  for (let q = 0; q < 8; q++) for (const yy of [0, 3.96]) { const p = ndc(P, T, [x + Math.cos((q * Math.PI) / 4) * 0.6, y + yy, z + Math.sin((q * Math.PI) / 4) * 0.6], tanH, tanV); a0 = Math.min(a0, p.x); a1 = Math.max(a1, p.x); b0 = Math.min(b0, p.y); b1 = Math.max(b1, p.y); }
  return { w: Math.max(0, Math.min(1, a1) - Math.max(-1, a0)) / 2, h: Math.max(0, Math.min(1, b1) - Math.max(-1, b0)) / 2 };
}
test('build 52 (1): the shochet\'s binding view — the lamb whole and ≥ 35 % of the width, the legs ≥ 60 px apart along the frame, him ≤ 35 % of the width and beyond it, the zorek out of the frame', () => {
  const [tH, tV] = tans(SH52.fov), P = [...SH52.p], T = [...SH52.t];
  const s = share51(P, T, LAMB_BB, tH, tV); assert.ok(s.w >= 0.35 && s.x0 > -1 && s.x1 < 1 && s.y0 > -1 && s.y1 < 1, `the lamb whole, ${s.w}`);
  const him = figW(P, T, tH, tV, P27.stand.x, P27.stand.z); assert.ok(him.w <= 0.35, `him ${him.w}`);
  assert.ok(Math.hypot(P27.stand.x - P[0], P27.stand.z - P[2]) > Math.hypot(L.x - P[0], L.z - P[2]), 'he stands beyond the lamb — never over it');
  const z = figW(P, T, tH, tV, P27.recv.x, P27.recv.z); assert.ok(z.w * z.h === 0, 'the zorek out of the frame');
  const f = ndc(P, T, [L.x + 0.42 * LS, LY + 0.1 * LS, L.z + 0.3 * LS], tH, tV), h = ndc(P, T, [L.x + 0.42 * LS, LY + 0.07 * LS, L.z - 0.21 * LS], tH, tV);
  const px = Math.hypot(((h.x - f.x) * 844) / 2, ((h.y - f.y) * 390) / 2); assert.ok(px >= 60, `the legs ${px} px apart`);
  assert.ok(Math.abs(h.x - f.x) * 844 > Math.abs(h.y - f.y) * 390, 'the arrow along the frame, foreleg → hind leg (not down to the floor)');
  // (the cut in the same view: the neck ≥ 5 amot off — no close-up)
  const neck = Math.hypot(P[0] - (L.x + 0.12 * LS), P[1] - (LY + 0.3), P[2] - (L.z + 0.72 * LS)); assert.ok(neck >= 5, `the view ${neck} from the neck`);
  const dm = read('src/avodah/shift/dam27.js'); assert.match(dm, /FORE = \{ x: LAMB\.x \+ 0\.42 \* LS,/); assert.match(dm, /\{ roll: Math\.PI \/ 2, yaw: -Math\.PI \/ 2 - 0\.3 \* bp \}/, 'the legs out from the belly toward him'); assert.match(dm, /\{ roll: Math\.PI \/ 2, yaw: -Math\.PI \/ 2 \+ 0\.25 \* bp \}/); assert.match(dm, /const L = Math\.max\(BIND52\.min, vl\);/);
  assert.match(read('src/game/twin.js'), /if \(V && !globalThis\.__CAM40_OFF && !V\.own\) \{/, 'a view of its own: no pan40, no obj51');
});
test('build 52 (1): the binding\'s drag — within ±35° of the arrow and as long as the gate (at most 0.8 of the arrow, at least 0.035 of the width)', () => {
  const W = 844, gate = swipe51(W, 300); assert.equal(gate, Math.round(SWIPE51.max * W * 1000) / 1000 === gate ? gate : gate);
  assert.equal(bindNeed52(74, gate, W), 0.8 * 74, 'the arrow shorter than the gate: 0.8 of it');
  assert.equal(bindNeed52(200, 101, W), 101, 'the gate');
  assert.equal(bindNeed52(10, 101, W), 0.035 * W, 'never under the floor');
  const ux = -1, uy = 0, need = 60, at = (deg, len) => { const a = (deg * Math.PI) / 180; return bindOk52(len * Math.cos(a) * ux - len * Math.sin(a) * uy, len * Math.cos(a) * uy + len * Math.sin(a) * ux, ux, uy, need); };
  assert.equal(at(0, 70), true); assert.equal(at(30, 80), true); assert.equal(at(-30, 80), true);
  assert.equal(at(40, 90), false, '40° off: no'); assert.equal(at(0, 50), false, 'short'); assert.equal(at(180, 90), false, 'the other way');
  assert.equal(Math.round((BIND52.ang * 180) / Math.PI), 35);
});
test('build 52 (1): the cut\'s needle waits for the view (SH52.settle): a tap before it is no cut and no miss', async () => {
  const R = rig(FLAGS, {}); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('shochet'); await R.step(0.1);
  R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.6);
  for (let i = 0; i < 60 && (!R.E.r27() || R.E.r27().ph !== 'bind'); i++) await R.step(0.1);
  assert.equal(R.E.r27().ph, 'bind'); assert.deepEqual(R.E.camWork27().view.p, [...SH52.p]); assert.equal(R.E.camWork27().view.own, true);
  R.E.r27bind(true); await R.step(P27.bound + 0.1);
  for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
  const K = R.E.r27(); assert.equal(K.ph, 'cut'); assert.deepEqual(R.E.camWork27().view.p, [...SH52.p], 'the cut in the binding\'s view');
  if (K.t < SH52.settle - 0.2) { assert.equal(R.E.r27tap(), false); assert.equal(R.E.r27().miss | 0, 0, 'no miss while the view settles'); assert.equal(R.E.r27().tc || 0, 0, 'the needle still'); }
  await R.step(SH52.settle + 0.3); assert.ok(R.E.r27().tc > 0, 'then the needle moves');
});
test('build 52 (2): the laver from its side, lit — a view of its own, the bowl right of him; a warm light while he washes; no lift', () => {
  const [tH, tV] = tans(KV52.fov), s = share51([...KV52.p], [...KV52.t], [-65.9, 19, 17.6, -61.1, 22.95, 22.4], tH, tV), him = share51([...KV52.p], [...KV52.t], fig(-60.2, 20), tH, tV);
  assert.ok(s.w >= 0.28 && s.y1 <= 1 && s.y0 >= -1, `the bowl and its stand whole, ${s.w}`); assert.ok((him.x0 + him.x1) / 2 < (s.x0 + s.x1) / 2, 'he left of the laver');
  assert.ok(KV52.p[2] < KV52.t[2] - 6, 'from the north side');
  assert.match(read('src/avodah/shift/day33.js'), /view: KV52 \? \{ p: \[\.\.\.KV52\.p\], t: \[\.\.\.KV52\.t\], fov: KV52\.fov, own: true \}/);
  const k = read('src/avodah/shift/kiyor20.js'); assert.match(k, /new THREE\.PointLight\(LIGHT52\.color, LIGHT52\.k, LIGHT52\.d, LIGHT52\.decay\)/); assert.match(k, /light52\(vis\);/); assert.match(k, /lights52\[0\]\.intensity = on \? LIGHT52\.k : 0/);
  assert.ok(LIGHT52.k > 0 && LIGHT52.at[2] < 20, 'on the view\'s side'); assert.deepEqual([...LIFT51], ['d21']);
});
test('build 52 (3): the ashes\' walk — its line the gesture (≤ 5 words, a verb and the arrow); one hand on the right half at the first walk; level 1 softened', async () => {
  for (const ph of ['walk', 'desc']) { const s = LINE30.deshen[ph]; assert.equal(s, 'ימין: גררו נגד הנטייה ↔'); assert.ok(words30(s) <= 5); }
  const d = read('src/avodah/shift/deshen21.js'); assert.match(d, /hand52 = mk\('d21-h52', '<i>👆<\/i>'\)/); assert.match(d, /const on52 = wk && !walk52\.done && walk52\.t0 != null && tt \/ 1000 - walk52\.t0 < WALK52\.hint;/, 'seconds — the tick gives ms');
  assert.match(d, /\.d21-h52\{position:fixed;left:74%;/, 'on the right half'); assert.match(d, /body\.d21-h52on \.t40-hand\{opacity:0!important\}/, 'one hand at a time'); assert.equal(WALK52.hint, 30);
  assert.deepEqual({ ...par36('deshen', 1).heavy }, { wind: 0.6, shake: 0.45, spill: 0.9 }); assert.deepEqual({ ...par36('deshen', 2).heavy }, { wind: 1.2, shake: 1.2, spill: 0.68 }, 'level 2 as it was');
  // (a child's two thumbs, the right a reaction (0.25 s) behind the meter: ≤ 1 spill a walk on the whole)
  let n = 0, sum = 0; for (let s = 0; s < 8; s++) { const r = await walk52(s, { level: 1, lat: 0.25, gain: 2.5 }); if (r.walked) { n++; sum += r.spills; } }
  assert.ok(n >= 6 && sum / n <= 1, `spills ${sum}/${n}`);
});
test('build 52 (4): the menorah\'s and the inner altar\'s rule at 28 % tried and left (him over 45 % 72 → 71 %, 34 → 31 % of the frames, the thing 33 → 29 %, 39 → 29 %); the tools measure his width and his cover', () => {
  assert.equal(TW.OBJ52, undefined); assert.doesNotMatch(read('src/game/twin.js'), /OBJ52\[id51\]/);
  const c = read('tools/cam41.js'); assert.match(c, /hw: pc\(I\.hw \|\| 0, I\.hwN \|\| 0\)/); assert.match(c, /cov: pc\(I\.cov \|\| 0,/);
  assert.equal(GAME_BUILD, 60);
});
test('build 52: no Divine Name in the changed files (by code points)', () => {
  const N = String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4);
  for (const f of ['src/avodah/shift/day33.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/kiyor20.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/rate30.js', 'src/avodah/shift/lvl36.js', 'src/game/twin.js', 'tools/cam41.js', 'tools/bal52.mjs', 'test/build52.test.mjs']) assert.ok(!read(f).includes(N), f);
});
