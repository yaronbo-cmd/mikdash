// ── build 61 ── the world layer, the free walk and the lifted look (docs/specs/shlav-alef-olam-he.md §3, §8 "61", §9; the owner, 30.10:
// "שיהיה הרגשה של קצת חופשיות… שלא יתברבר עם הסטיק… לא סתם לחיצה על המסך"; "אם השחקן מושך יד ימין על המסך לכיוון מעלה, המצלמה תעלה קצת
// ותראה את האופק"). walk61.js: the left half's stick no one sees, the magnet, the tap, the right half's lift; world61.js: one record of what
// stands, never down, the crews' creep short of his next course; har42.js wired to both, stage 02's wall from it. GAME_BUILD 61. Never a
// Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { WALK61, side61, stick61, toWorld61, magnet61, kind61, lift61, liftView61 } from '../src/game/walk61.js';
import { W61KEY, WORLD61, empty61, load61, save61, built61, grow61, creep61, at61, stand61 } from '../src/game/world61.js';
import { LINE42 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 61: GAME_BUILD 61; the spec in the repo; the walk line says how', () => {
  assert.equal(GAME_BUILD, 62);
  assert.ok(read('docs/specs/shlav-alef-olam-he.md').includes('## 9. התנועה והמצלמה'));
  assert.equal(LINE42.walk.split(' · ')[0], 'גררו כדי ללכת');
});

test('build 61 walk61: the halves; the stick — nothing inside the dead zone, its strength to 1 at R, screen up = +sy', () => {
  assert.equal(side61(100, 640), 'L'); assert.equal(side61(400, 640), 'R');
  assert.equal(stick61(5, 5), null);
  const s = stick61(0, -WALK61.R); assert.ok(near(s.sy, 1) && near(s.sx, 0) && near(s.k, 1));
  assert.ok(stick61(30, 0).k > 0 && stick61(30, 0).k < 1);
  assert.equal(stick61(500, 0).k, 1);
});

test('build 61 walk61: up the screen walks along the look on the ground, right walks to its right', () => {
  const p = [0, 10, 0], t = [0, 0, -10];   // looking north (−z) and down
  const up = toWorld61({ sx: 0, sy: 1 }, p, t); assert.ok(near(up.x, 0) && near(up.z, -1));
  const rt = toWorld61({ sx: 1, sy: 0 }, p, t); assert.ok(near(rt.x, 1) && near(rt.z, 0), 'north-facing: screen right is east (+x)');
  assert.equal(toWorld61({ sx: 0, sy: 1 }, [0, 10, 0], [0, 0, 0]), null, 'straight down: no way on the ground');
});

test('build 61 walk61: the magnet bends a way toward a near work, leaves a far one and one turned away', () => {
  const h = { x: 0, z: 0 }, w = { x: 3, z: 0 }, d = { x: Math.cos(0.6), z: Math.sin(0.6) };
  const m = magnet61(d, h, w); assert.ok(m.z < d.z && m.x > d.x, 'bent toward the work'); assert.ok(near(Math.hypot(m.x, m.z), 1));
  assert.deepEqual(magnet61(d, h, { x: 30, z: 0 }), d, 'out of reach');
  assert.deepEqual(magnet61({ x: -1, z: 0 }, h, w), { x: -1, z: 0 }, 'walking away');
});

test('build 61 walk61: tap, hold, drag; the lift — up raises, down lowers, clamped; a lifted view is higher and nearer level', () => {
  assert.equal(kind61(120, 3), 'tap'); assert.equal(kind61(600, 3), 'hold'); assert.equal(kind61(200, 40), 'drag');
  assert.ok(near(lift61(0, -WALK61.liftPx / 2), 0.5)); assert.equal(lift61(0.5, 1000), 0); assert.equal(lift61(0.5, -1000), 1);
  const v = { p: [0, 20, 10], t: [0, 2, 0] }; assert.equal(liftView61(v, 0), v);
  const L = liftView61(v, 1); assert.ok(near(L.p[1], 20 + WALK61.rise));
  const slope = (q) => (q.p[1] - q.t[1]) / Math.hypot(q.p[0] - q.t[0], q.p[2] - q.t[2]); assert.ok(slope(L) < slope(v) * 0.5, 'the look nearer level: the horizon in the frame');
});

test('build 61 world61: one record — what is built never goes down; the crews creep short of his next course; where he stood', () => {
  const mem = new Map(), ls = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const W = load61(ls); assert.deepEqual(W, empty61());
  assert.equal(grow61(W, 'wall', 0.3), 0.3); assert.equal(grow61(W, 'wall', 0.1), 0.3, 'never down');
  let p = 0; for (let i = 0; i < 1000; i++) p = creep61(W, 'wall', 0.3, 0.5, 1); assert.ok(near(p, 0.3 + 0.2 * WORLD61.cap, 1e-3), 'stops at cap of the step');
  stand61(W, 'wall', 12.345, -7.5); save61(W, ls);
  const W2 = load61(ls); assert.ok(near(built61(W2, 'wall'), p, 1e-3)); assert.deepEqual(at61(W2, 'wall'), { x: 12.35, z: -7.5 }); assert.equal(at61(W2, 'har'), null);
  mem.set(W61KEY, '{oops'); assert.deepEqual(load61(ls), empty61());
});

test('build 61 har42: wired — the halves, the tap, the hold kept for the guided walk; the lift in the follow view, down once a work begins; the wall from world61', () => {
  assert.match(H, /const sd = side61\(e\.clientX, W\(\)\)/);
  assert.match(H, /kind61\(now61\(\) - f\.t0, f\.px\) === 'tap' && !st\.job && st\.target\) st\.auto61 = true/);
  assert.match(H, /still\(f\) \|\| still\(st\.look61\) \|\| st\.auto61/);
  assert.match(H, /return liftView61\(\{ p: \[/);
  assert.match(H, /if \(st\.job\) st\.lift61 = 0;/);
  assert.match(H, /creep61\(W61, 'wall', from, to, dt\)/);
  assert.match(H, /grow61\(W61, 'wall', PARTS\.indexOf\(part\)/);
  assert.match(H, /built61\(W61, 'wall'\)/);
});

test('build 61: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/walk61.js', 'src/game/world61.js', 'src/game/har42.js', 'test/build61.test.mjs', 'docs/specs/shlav-alef-olam-he.md']) {
    const s = read(f).normalize('NFC').replace(/[\u0591-\u05C7]/g, (c) => (c === '\u05BC' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
