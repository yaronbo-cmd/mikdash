// SHIFT29B: the shift's world modules in node — the routes and icons, the bar's colours (never red), the stations' table, the act's
// limits, the camera's fit (every frame point inside the frame at 844×390), the pilgrims' life cycle on a fake world (no DOM, no kit draw)
import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, ICONS, barColor, BAR, GATE_SPOT, QUEUE, createPilgrims } from '../src/avodah/shift/pilgrims.js';
import { STATIONS, SEAL_OF, SEALS3, ACT } from '../src/avodah/shift/stations.js';
import { CAM29, framePoints, fitD, proj, frameMid } from '../src/avodah/shift/camera.js';
import { RUN29 } from '../src/avodah/shift/walk.js';
import { isRedHue } from '../src/avodah/works/blood.js';

const NAME = [0x5d4, 0x5d4].map((c) => String.fromCharCode(c)).join('');   // (a pattern, built from escapes)

test('routes and icons as the contract says', () => {
  assert.deepEqual(ROUTES.olah, ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh']);   // ── route31 ── ── /route31 ──
  assert.deepEqual(ROUTES.ken, ['melika', 'mitzui']);
  assert.deepEqual(ROUTES.mincha, ['hagasha', 'kemitza', 'haktara']);
  assert.equal(ICONS.olah, '🐑'); assert.equal(ICONS.ken, '🕊'); assert.equal(ICONS.mincha, '🌾');
  for (const t in ROUTES) for (const s of ROUTES[t]) assert.ok(STATIONS[s], s);
});
test('the patience bar: green → amber → deep orange, never a red hue', () => {
  assert.equal(barColor(0.7), BAR.ok); assert.equal(barColor(0.4), BAR.mid); assert.equal(barColor(0.1), BAR.low);
  for (const c of Object.values(BAR)) assert.equal(isRedHue(c), false, c);
});
test('the stations: verbs and labels of the contract, each on a point of the court', () => {
  const want = { kiyor: ['hold', 'קידוש ידיים'], seals: ['tapRight', 'החותם הנכון'], rings: ['tapBeat', 'השחיטה'], altar: ['drag', 'הזריקה לפינה'], duchan: ['tapBeat', 'הקן'] };
  for (const id in want) { assert.equal(STATIONS[id].verb, want[id][0]); assert.equal(STATIONS[id].label, want[id][1]); assert.ok(Number.isFinite(STATIONS[id].at.x) && Number.isFinite(STATIONS[id].stand.z)); }
  assert.equal(SEAL_OF.mincha, 'זכר'); assert.ok(SEALS3.includes('זכר'));
  assert.ok(ACT.max <= 4); assert.ok(ACT.holdMark < ACT.max && ACT.beatLead + ACT.beat < ACT.max);
  // (the player never passes the Heichal's door: no station or stand west of the Ulam's steps' foot)
  for (const id in STATIONS) assert.ok(STATIONS[id].stand.x > -76 && STATIONS[id].at.x > -76, id);
});
test('no Divine Name in the shift world modules', async () => {
  const fs = await import('node:fs');
  for (const f of ['pilgrims', 'stations', 'camera', 'walk', 'draw', 'lab']) { const s = fs.readFileSync(new URL(`../src/avodah/shift/${f}.js`, import.meta.url), 'utf8'); assert.ok(!s.includes(NAME), f); assert.ok(!new RegExp(String.fromCharCode(0x05D0,0x05DC,0x05D5,0x05D4,0x05D9,0x05DD)).test(s), f); } /* (the pattern from escapes: the scan reads this file too) */
});
test('the camera fits the gate line and every station at 844×390 with a 24-px margin, for him anywhere on the route', { skip: 'fable32 (build 3): the stations are at their real places across the whole court (187 amot) — the wave-29 overview that framed them all is gone since shift30 (the follow camera)' }, () => {
  const pts = framePoints(), mid = frameMid(pts), W = 844, H = 390;
  for (const h of [[GATE_SPOT.x - 3, 16, GATE_SPOT.z], /* ── fable32 (build 3) ── (the laver's stand is at the real laver, out of the wave-29 overview — the shift's camera is the follow camera since shift30) ── /fable32 ── */ [STATIONS.rings.stand.x, 16, STATIONS.rings.stand.z], [STATIONS.altar.stand.x, 16, STATIONS.altar.stand.z], [STATIONS.seals.stand.x, 16, STATIONS.seals.stand.z]]) {
    const tgt = [h[0] + (mid.x - h[0]) * CAM29.w, h[1] + 1.6, h[2] + (mid.z - h[2]) * CAM29.w];
    const d = fitD(tgt, pts, CAM29.el, CAM29.az, W, H);
    assert.ok(d <= CAM29.dMax, `d ${d}`);   // ── fable32 (build 3) ── (the real places span the whole court: the fit sits at dMax; the overview itself is gone since shift30) ── /fable32 ──
    const ce = Math.cos(CAM29.el), cam = [tgt[0] + ce * Math.cos(CAM29.az) * d, tgt[1] + Math.sin(CAM29.el) * d, tgt[2] + ce * Math.sin(CAM29.az) * d];
    for (const p of pts) { const q = proj(cam, tgt, p, W, H, CAM29.fov); assert.ok(q[0] >= 23.9 && q[0] <= W - 23.9 && q[1] >= 63.9 && q[1] <= H - 23.9 && !(q[0] > W - 150 && q[1] > H - 150), JSON.stringify([p, q])); }
    const hq = proj(cam, tgt, [h[0], h[1] + 1.6, h[2]], W, H, CAM29.fov);
    assert.ok(hq[0] > 0 && hq[0] < W && hq[1] > 0 && hq[1] < H, 'him in the frame');
  }
  assert.equal(QUEUE.length, 3);
});
test('the run is ×1.8', () => { assert.equal(RUN29.mul, 1.8); });
test('pilgrims on a fake world: the line of three, take/release, patience only while waiting or standing un-acted, leaving at 0', () => {
  let hx = -10, hz = 4;
  const world = { groundAt: () => 16, heroXYZ: (o) => { o.x = hx; o.y = 16; o.z = hz; return o; } };
  const left = [];
  const Pm = createPilgrims({ world, kit: { begin() {}, end() {}, F: {} }, root: null, view: null, patienceS: 10, onLeave: (P) => left.push(P.id) });
  const a = Pm.spawn('olah'), b = Pm.spawn('ken'), c = Pm.spawn('mincha');
  assert.ok(a && b && c); assert.equal(Pm.spawn('olah'), null);
  assert.equal(Pm.next(), a);
  Pm.tick(0.25); assert.ok(a.patience < 1 && a.patience > 0.97);
  Pm.take(a); const p0 = a.patience; for (let i = 0; i < 20; i++) Pm.tick(0.1); assert.equal(a.patience, p0, 'no patience lost while taken');
  hx = -20; for (let i = 0; i < 60; i++) Pm.tick(0.05);
  const d = Math.hypot(a._x - hx, a._z - hz); assert.ok(d > 0.8 && d < 1.8, `follow ${d}`);
  Pm.release(a); assert.equal(a.state, 'atStation');
  a.acting = true; const p1 = a.patience; Pm.tick(0.2); assert.equal(a.patience, p1, 'no patience lost under an act');
  a.acting = false; Pm.tick(0.2); assert.ok(a.patience < p1);
  b.patience = 0.01; Pm.tick(0.25); assert.equal(b.state, 'left'); assert.deepEqual(left, [b.id]);
  for (let i = 0; i < 10; i++) Pm.tick(0.1); assert.ok(!Pm.all().includes(b), 'faded and gone');
  Pm.done(a); assert.equal(a.state, 'done'); for (let i = 0; i < 20; i++) Pm.tick(0.1); assert.ok(!Pm.all().includes(a));
  Pm.destroy();
});
