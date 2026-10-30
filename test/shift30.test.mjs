// ── shift30 ── WAVE30 SHIFT30 (node): the compact ring (short trips), the tap-walk's pace, the follow camera's frame (him in the
// lower-middle third at rest and under the act's push-in), the edge chip's side for an anchor off the screen, the profile's report, the fences.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STATIONS, BASIN30 } from '../src/avodah/shift/stations.js';
import { GATE_SPOT, ROUTES, SIDE30 } from '../src/avodah/shift/pilgrims.js';
import { CAM30, TURN30 } from '../src/avodah/shift/camera.js';
import { RUN29 } from '../src/avodah/shift/walk.js';
import { proj, edgeChip, SHARED } from '../src/avodah/shift/draw.js';
import { PROF } from '../src/prof30.js';
import { ALTAR_CORNERS, ALTAR } from '../src/places.js';

const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
test('the compact ring: the seals and the דוכן 8–10 amot from the line; the basin ~10 amot south-east of the altar; the rings and the corner real', () => {
  assert.ok(d2(STATIONS.seals.stand, GATE_SPOT) >= 7.5 && d2(STATIONS.seals.stand, GATE_SPOT) <= 10.5, 'seals');
  assert.ok(d2(STATIONS.duchan.stand, GATE_SPOT) >= 7.5 && d2(STATIONS.duchan.stand, GATE_SPOT) <= 10.5, 'duchan');
  const se = { x: ALTAR_CORNERS.SE[0], z: ALTAR_CORNERS.SE[1] };
  assert.ok(d2(BASIN30, se) >= 8 && d2(BASIN30, se) <= 12 && BASIN30.x > se.x && BASIN30.z > se.z, 'basin SE of the altar');
  // ── fable32 (build 3) ── the basin is off: the laver's act is at the real laver (−63.5, 20), the kohen at the steps' foot ── /fable32 ──
  assert.ok(BASIN30.off); assert.equal(STATIONS.kiyor.at.x, -63.5); assert.equal(STATIONS.kiyor.at.z, 20); assert.ok(STATIONS.kiyor.stand.x >= -54.95 && STATIONS.kiyor.stand.x < -50);
  // ── recovered (R9) ── every stand off the altar but the pyre's: the pyre station of builds 16–26c (stations.js — the logs laid on the fire, one a tap)
  // stands on the altar's top, as in 26c ({ x: −34, z: 5 })
  for (const id in STATIONS) { const s = STATIONS[id].stand; const on = s.x > ALTAR.x0 && s.x < ALTAR.x1 && s.z > ALTAR.z0 && s.z < ALTAR.z1; assert.ok(id === 'pyre' ? on : !on, `${id} stand ${id === 'pyre' ? 'on the altar\'s top' : 'off the altar'}`); }
});
test('a pilgrim\'s walk (his three stations from the line, straight) ≤ 8 s at the tap-walk\'s pace, which is ≤ 20 amot/s', () => {
  const sp = RUN29.base * RUN29.mul; assert.ok(sp <= 20, `pace ${sp}`);
  // ── fable32 (build 3) ── the real places: a pilgrim's walk is the court's — each straight leg ≤ 6 s at 20 amot/s (the owner's 3–6 s per leg)
  for (const t in ROUTES) { let p = GATE_SPOT; for (const id of ROUTES[t]) { const d = d2(p, STATIONS[id].stand); assert.ok(d / sp <= 6, `${t}→${id}: ${d.toFixed(1)} amot = ${(d / sp).toFixed(2)} s`); p = STATIONS[id].stand; } }
});
test('the follow camera: him in the lower-middle third at rest and under the 15 % push-in; 20 amot ahead still on the screen', () => {
  const W = 844, H = 390, fov = 32;
  for (const push of [0, 1]) {
    const d = CAM30.d * (1 - CAM30.push * push), tgt = [CAM30.ahead, 1.6 + CAM30.oy, 0], ce = Math.cos(CAM30.el), cam = [tgt[0] - ce * d, tgt[1] + Math.sin(CAM30.el) * d, 0];
    const mid = proj(cam, tgt, [0, 3.2, 0], W, H, fov), feet = proj(cam, tgt, [0, 0, 0], W, H, fov), far = proj(cam, tgt, [20, 0, 0], W, H, fov), side = proj(cam, tgt, [-SIDE30.back, 0, SIDE30.side], W, H, fov);
    assert.ok(mid[1] > H * 0.5 && mid[1] < H * 0.7 && Math.abs(mid[0] - W / 2) < 1, `mid ${mid[1].toFixed(0)}`);
    assert.ok(feet[1] < H - 8, `feet ${feet[1].toFixed(0)}`);
    assert.ok(far[1] > 64 && far[1] < H / 2, `20 ahead ${far[1].toFixed(0)}`);
    assert.ok(side[0] > W / 2 && side[0] < W * 0.75 && side[1] < H, 'the pilgrim at his side is in the frame');
  }
  assert.ok(CAM30.el >= 0.49 && CAM30.el <= 0.56, '28–32° down');
  assert.ok(TURN30.every((a) => Math.abs(a) <= Math.PI));
});
test('an edge chip: an anchor off the screen\'s right → the chip at the right edge with an arrow and the amot; behind → at the foot', () => {
  globalThis.innerWidth = 844; globalThis.innerHeight = 390;
  const mkEl = () => { const kids = []; const el = { style: {}, classList: { s: new Set(), toggle(c, on) { if (on) this.s.add(c); else this.s.delete(c); }, contains(c) { return this.s.has(c); } }, appendChild: (k) => kids.push(k), offsetWidth: 110, ownerDocument: { createElement: () => ({ style: {}, setAttribute() {}, className: '', textContent: '' }) } }; return el; };
  const view = (px, py, depthSign) => ({ project: () => ({ x: px, y: py, on: depthSign > 0 && px > 0 && px < 844 }), camNow: (o) => { o.px = 0; o.py = 0; o.pz = 0; o.tx = 1; o.ty = 0; o.tz = 0; return o; } });
  SHARED.rects.length = 0;
  let e = mkEl(); let r = edgeChip(e, 10, 0, 0, { w: 90, h: 48, view: view(1400, 200, 1), from: { x: 0, z: 0 } });
  assert.ok(r.edge && r.x > 844 - 90 && r.x < 844 && e.classList.contains('s30-edge') && e.__dd.textContent === '10', JSON.stringify(r));
  SHARED.rects.length = 0;
  e = mkEl(); r = edgeChip(e, -10, 0, 0, { w: 90, h: 48, view: view(300, 200, -1), from: { x: 0, z: 0 } });
  assert.ok(r.edge && r.y > 390 / 2, 'behind → toward the foot ' + JSON.stringify(r));
  // never in the work button's corner
  SHARED.rects.length = 0;
  e = mkEl(); r = edgeChip(e, 10, 0, 0, { w: 90, h: 48, view: view(1400, 380, 1), from: { x: 0, z: 0 } });
  assert.ok(!(r.x + 57 > 844 - 150 && r.y + 24 > 390 - 140), 'off the button\'s corner ' + JSON.stringify(r));
  SHARED.rects.length = 0;
});
test('the profile: frames, parts, the CPU and the camera\'s step', () => {
  PROF.start(); let t = 1;
  for (let i = 0; i < 50; i++) { PROF.frame(t); PROF.add('guard', 0.5); PROF.add('render', i === 10 ? 60 : 5); PROF.camAt(i * 0.1, 0, 0); t += i === 10 ? 70 : 16; }
  PROF.stop(); const r = PROF.report();
  assert.ok(r.n >= 45, String(r.n)); assert.equal(r.over40, 1); assert.equal(r.top[0][0], 'render'); assert.ok(r.stepMax < 0.11 + 1e-9 && r.cpu.p50 === 0.5);
});
test('the shift30 files: fences, no Divine Name', () => {
  const NAME = String.fromCharCode(0x05D9, 0x05D4, 0x05D5, 0x05D4);
  for (const f of ['src/avodah/shift/camera.js', 'src/avodah/shift/draw.js', 'src/avodah/shift/stations.js', 'src/avodah/shift/pilgrims.js', 'src/prof30.js', 'test/shift30-touch.cjs']) {
    const s = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(s.includes('── shift30 ──'), f); assert.ok(!s.includes(NAME), f);
    assert.ok(!new RegExp(String.fromCharCode(0x05D0, 0x05DC, 0x05D5, 0x05D4, 0x05D9, 0x05DD)).test(s), f);
  }
});
// ── /shift30 ──
