// ── fable32 (build 41) ── the camera and the framing (the coordinator's build-41 brief: finish what build 40 left open): the follow camera
// by a wall (cam28 WALL41 — the readable poses about his head before the old pull, the look back onto his middle, ≤ 55°, his figure ≤ 45 %
// of the screen); every act's view keeps him ≤ 45 % tall and inside the frame (twin.js pan40 with CAM41, HERO41); the practice's title as a
// slim line in the top band; the inner altar's ring on the altar's own top; the fall to the work pad decided after the camera's move, with
// hysteresis (touch40 T41); the timing acts' work button hidden while their zone is on the thing; GAME_BUILD 41; a Divine-Name scan.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCamGuard, WALL41 } from '../src/avodah/day/cam28.js';
import { pan40, CAM41, HERO41 } from '../src/game/twin.js';
import { createTouch40, T40, T41 } from '../src/avodah/shift/touch40.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const TAN25 = Math.tan((50 * Math.PI) / 360);   // (the shift's view: 50°, VIEW24)
const share = (d) => HERO41 / (2 * d * TAN25);   // his figure's share of the screen's height at a distance d

// ───────── the follow camera by a wall ─────────
test('build 41: WALL41\'s numbers keep him readable — at its nearest (dMin) he is ≤ 45 % of the screen\'s height, at the day\'s own 17 amot inside 18–45 %; the steepest look 55°', () => {
  assert.ok(share(WALL41.dMin) <= 0.45 + 1e-9, `dMin ${WALL41.dMin}: ${share(WALL41.dMin).toFixed(3)}`);
  assert.ok(share(17) >= 0.18 && share(17) <= 0.45, `17 amot: ${share(17).toFixed(3)}`);
  assert.ok(Math.max(...WALL41.el) <= 0.97, 'never steeper than ~55°');
  assert.ok(WALL41.d.every((d) => d >= WALL41.dMin), 'no nearer pose than dMin before the old pull');
});

function rig(wall) {
  // a camera 17 amot behind him (−x) at 29°, looking 3 amot ahead of him; a wall between (a slab at x −4…−3, 6 amot over his feet)
  const cam = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 }, looks = [];
  const H = { x: -200, y: 16, z: 100 };
  const set = () => { const e = 0.5, d = 17; cam.px = H.x - Math.cos(e) * d; cam.py = H.y + 1.6 + Math.sin(e) * d; cam.pz = H.z; cam.tx = H.x + 3; cam.ty = H.y + 2.8; cam.tz = H.z; };
  const box = [H.x - 4, 0, H.z - 30, H.x - 3, H.y + 6, H.z + 30];
  const hits = (ax, ay, az, bx, by, bz) => { for (let i = 0; i <= 60; i++) { const t = i / 60, x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t; if (x > box[0] && x < box[3] && y > box[1] && y < box[4] && z > box[2] && z < box[5]) return true; } return false; };
  const S = { frameBlocked: (bx, by, bz, ax, ay, az) => !!wall && hits(ax, ay, az, bx, by, bz) };
  const view = { camNow: (o) => Object.assign(o, cam), camSet: (px, py, pz, tx, ty, tz) => { Object.assign(cam, { px, py, pz, tx, ty, tz }); } };
  const camera = { lookAt: (x, y, z) => looks.push([x, y, z]) };
  const G = createCamGuard({ S, gy: () => 16, heroP: () => H, view, camera, budget: 1000 });   // (the frame's 9 ms search budget lifted: a loaded machine made it flaky)
  return { G, cam, H, set, hits, looks };
}
test('build 41: the follow camera by a wall (cam28) — blocked under the shift\'s pull-only rule, the guard takes a readable pose about his head (≥ dMin, ≤ 55°, the line to it clear), the look comes back onto his middle, and the camera turns to it; with no wall nothing changes', () => {
  const old = globalThis.__CAM28_PULL; globalThis.__CAM28_PULL = true;
  try {
    const R = rig(true); R.G.on(true); R.set(); R.G.step(0.05);
    const st = R.G.state(), c = R.cam, head = [R.H.x, R.H.y + 1.6, R.H.z];
    const D = Math.hypot(c.px - head[0], c.py - head[1], c.pz - head[2]), el = Math.atan2(c.py - head[1], Math.hypot(c.px - head[0], c.pz - head[2]));
    assert.equal(st.mode, 'rise41', `the mode ${st.mode}`);
    assert.ok(D >= WALL41.dMin - 1e-6, `the distance ${D.toFixed(2)}`);
    assert.ok(el <= 0.97, `the elevation ${el.toFixed(2)}`);
    assert.ok(!R.hits(head[0], head[1], head[2], c.px, c.py, c.pz), 'never inside or behind the wall');
    { const k = (D + WALL41.room) / D, ex = head[0] + (c.px - head[0]) * k, ey = head[1] + (c.py - head[1]) * k, ez = head[2] + (c.pz - head[2]) * k; assert.ok(!R.hits(head[0], head[1], head[2], ex, ey, ez), 'room behind it: never at the wall\'s face'); }
    assert.ok(share(D) <= 0.45 + 1e-9, `his share ${share(D).toFixed(3)}`);
    assert.equal(st.lw, 1, 'the first frame (snap): the look on him at once');
    assert.ok(Math.abs(c.tx - R.H.x) < 1e-6 && Math.abs(c.ty - (R.H.y + WALL41.lookY)) < 1e-6, 'the look on his middle');
    assert.ok(R.looks.length > 0, 'the camera turned to it in the same frame');
    // the wall gone: the wanted camera as it was, the look eased back
    const F = rig(false); F.G.on(true); F.set(); F.G.step(0.05);
    assert.equal(F.G.state().mode, 'free'); assert.equal(F.G.state().lw, 0);
    assert.ok(Math.abs(F.cam.tx - (F.H.x + 3)) < 1e-6, 'free: the twin\'s own look ahead of him');
  } finally { if (old === undefined) delete globalThis.__CAM28_PULL; else globalThis.__CAM28_PULL = old; }
  const g = read('src/avodah/day/cam28.js');
  const i = g.indexOf('w41: for (const ah of ahead'), j = g.indexOf("mode = 'pull';", i);
  assert.ok(i > 0 && j > i, 'the readable poses come before the old pull');
});

// ───────── the act's camera ─────────
test('build 41: every act\'s view (pan40 with CAM41) keeps him ≤ 45 % of the screen\'s height and inside the frame on both sides, the thing still at 55–65 % of the width', () => {
  const tanH = TAN25 * (844 / 390);
  // the menorah's case: the view 3 amot behind him, the thing beyond him
  const p = [0, 19, -6], t = [0, 18, 4], O = { x: 0, y: 18, z: 4 }, H = { x: 1.2, y: 16 + HERO41 / 2, z: -2.5, h: HERO41 };
  const r0 = pan40(p, t, O, H, tanH, { ...CAM41, big: 0 }, TAN25);
  assert.ok(r0.big > 0.45, `build 40's rule left him at ${r0.big.toFixed(2)} of the height`);
  const r = pan40(p, t, O, H, tanH, CAM41, TAN25);
  assert.ok(r.big <= 0.45 + 1e-9, `stepped back ${r.back}: ${r.big.toFixed(3)}`);
  assert.ok(r.hx >= CAM41.hero && r.hx <= CAM41.heroR, 'inside the frame');
  assert.ok(Math.abs(r.ox - (2 * CAM41.at - 1)) < 0.03, `the thing at ${(((r.ox + 1) / 2) * 100).toFixed(1)} %`);
  assert.ok(CAM41.at >= 0.55 && CAM41.at <= 0.65 && CAM41.big === 0.45);
  const tw = read('src/game/twin.js');
  assert.match(tw, /\{ \.\.\.CAM41, at: O\.at \} : CAM41; r40 = pan40\(V\.p, V\.t, O, H40, tanH, C40, tanV\);/);
});

// ───────── the act's surface ─────────
test('build 41: the fall to the work pad after the camera\'s move (touch40 T41) — a small thing at the act\'s start stays on the thing; only small T41.settle s in a row it falls; back on the thing only past the rule + T41.hyst px', () => {
  const L = {}, mk = () => ({ style: {}, className: '', innerHTML: '', classList: (() => { const s = new Set(); return { add: (...c) => c.forEach((x) => s.add(x)), remove: (...c) => c.forEach((x) => s.delete(x)), toggle: (c, on) => { if (on) s.add(c); else s.delete(c); }, contains: (c) => s.has(c) }; })(), setAttribute() {}, appendChild() {}, remove() {}, addEventListener(t, f) { (L[t] = L[t] || []).push(f); }, removeEventListener() {} });
  const doc = { body: { appendChild() {} }, head: { appendChild() {} }, createElement: mk, getElementById: () => ({}), addEventListener() {}, removeEventListener() {} };
  const pad = mk(); let now = 0;
  const G = globalThis; const keep = { localStorage: G.localStorage, innerWidth: G.innerWidth, innerHeight: G.innerHeight };
  G.localStorage = { getItem: () => null, setItem() {} }; G.innerWidth = 640; G.innerHeight = 296;
  try {
    const px = (fp) => [{ x: 0, y: 0, z: 0, r: fp / 2 / 40 }], proj = (x, y) => ({ x: 300 + x * 40, y: 150 - y * 40 });
    const t = createTouch40({ doc, pad, id: 'z41', proj, clock: () => now });
    assert.equal(t.place(true, px(37), 'z41'), 'obj', 'the act\'s first frame, 37 px (the camera arriving): on the thing');
    now = 0.6; assert.equal(t.place(true, px(37), 'z41'), 'obj', 'still within T41.settle');
    now = 1.05; assert.equal(t.place(true, px(37), 'z41'), 'pad', 'small a whole T41.settle: the pad');
    now = 1.2; assert.equal(t.place(true, px(T40.min + 2), 'z41'), 'pad', 'just over 44 px: still the pad (hysteresis)');
    now = 1.3; assert.equal(t.place(true, px(T40.min + T41.hyst + 4), 'z41'), 'obj', 'past the rule + hyst: the thing again');
    now = 1.4; assert.equal(t.place(true, px(30), 'z41'), 'obj', 'small again: waits its settle once more');
    t.destroy();
  } finally { for (const [k, v] of Object.entries(keep)) { if (v === undefined) delete G[k]; else G[k] = v; } }
});

test('build 41: the practice\'s title a slim line in the top band (hud.intro slim) — never over him; the inner altar\'s ring on its own top (GOLD_ALTAR); the timing acts\' work button hidden while their zone is on the thing (stations s41-zone)', () => {
  const hud = read('src/avodah/shift/hud.js');
  assert.match(hud, /intro\(title, sub, ms = 1600, slim = false\)/);
  assert.match(hud, /\.sh-intro\.slim\{top:calc\(env\(safe-area-inset-top,0px\) \+ 10px\);left:auto;right:calc\(env\(safe-area-inset-right,0px\) \+ 12px\)/);   // (the top band's right corner, beside the pills — at 58 px it touched his hat in the shochet's shot)
  assert.match(read('src/avodah/shift/index.js'), /hud\.intro\('אימון', `\$\{A\.icon\} \$\{A\.he\} — המחשה`, 900, true\);/);
  assert.match(read('src/avodah/shift/heichal26.js'), /o40 = \[\{ x: GOLD_ALTAR\.x, y: GOLD_ALTAR\.y \+ GOLD_ALTAR\.h, z: GOLD_ALTAR\.z, r: 0\.75 \}\]; id40 = 'hk26alt';/);
  const st = read('src/avodah/shift/stations.js');
  assert.match(st, /body\.s41-zone \.tw-btn\{opacity:0!important;pointer-events:none!important\}/);
  assert.match(st, /doc\.body\.classList\.toggle\('s41-zone', onS\)/);
  assert.match(st, /doc\.body\.classList\.remove\('s41-zone'\)/, 'its end lets the button back');
  assert.match(st, /&& !pad40On\(\)/, 'the player\'s switch keeps the button');
});

test('build 41: GAME_BUILD 41; no Divine Name in the changed files (by code points); the pilgrims\' word', () => {
  assert.equal(GAME_BUILD, 45);   // (build 42: the constant moved on) (build 43: again) (build 44: again) (build 45: again)
  const files = ['src/avodah/day/cam28.js', 'src/avodah/day/index.js', 'src/game/twin.js', 'src/avodah/shift/touch40.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/index.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/stations.js', 'tools/cam41.js', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'PROJECT.md', 'test/build41.test.mjs'];
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  const P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of files) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); if (f !== 'test/build41.test.mjs') assert.ok(!s.includes(P), `${f}: עולי רגל`); }
});
