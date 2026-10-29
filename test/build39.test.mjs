// ── fable32 (build 39) ── the guided walk (the owner, 26.10 00:07–00:16: "לחצת - זזת לכיוון הנקודה. לא לחצת נשארת לעמוד. בלי שרואים
// בכלל גויסטיק."; the path through openings, never through a wall nor stuck at one; several open places — the drag chooses): the guide's
// way (shift/guide39.js) over the floors he walks (flow31's), the target's choice with hysteresis, arrival, no target → no motion; the
// twin's guided step (twin.js walk39) — hold → toward the way, release/none → rest; no stick drawn, the developer's stick behind ?stick=1;
// the door help only with it; the engine's open alternatives (E.alt39) and the House's exit place; a morning walked by the guide alone
// reaches each act; GAME_BUILD 39; a Divine-Name scan of the changed files by code points.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createGuide39, way39, G39 } from '../src/avodah/shift/guide39.js';
import { freeFor31 } from '../src/avodah/shift/flow31.js';
import { HOUSE22, blocked, free, houseFloor, onHigh } from '../src/avodah/day/world22.js';
import { walk39, WALK39 } from '../src/game/twin.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { P26 } from '../src/avodah/shift/day33.js';
import '../src/avodah/shift/focus17.js';
import { rig, FLAGS, seeded } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const fakeE = (T, o = {}) => ({ state: () => ({ phase: 'run', acting: o.acting ? 'x' : null }), flowNext: () => T[0] || null, alt39: () => T.slice(1) });
let clockT = 0;
const clock = () => clockT;

// ───────── the way ─────────
test('build 39: the way never goes through a wall — each step of it free on the floors and never refused by the feet\'s rule (world22 blocked); through the Ulam\'s door and the Heichal\'s gate when the House is open', () => {
  const on = HOUSE22.on, g = HOUSE22.gate;
  const walkable = (x0, z0, pts, p) => {
    const ok = freeFor31(p);
    let px = x0, pz = z0;
    for (const q of pts) {
      const L = Math.hypot(q.x - px, q.z - pz), n = Math.max(1, Math.ceil(L / 0.2));
      for (let i = 1; i <= n; i++) {
        const x = px + ((q.x - px) * i) / n, z = pz + ((q.z - pz) * i) / n, x1 = px + ((q.x - px) * (i - 1)) / n, z1 = pz + ((q.z - pz) * (i - 1)) / n;
        if (!onHigh(x, z) && blocked(x, z, x1, z1)) return `refused at ${x.toFixed(2)},${z.toFixed(2)}`;
      }
      if (!onHigh(q.x, q.z) && !ok(q.x, q.z) && !(q === pts[pts.length - 1])) return `a way point off the floors at ${q.x.toFixed(2)},${q.z.toFixed(2)}`;
      px = q.x; pz = q.z;
    }
    return '';
  };
  try {
    HOUSE22.on = false; HOUSE22.gate = false;
    for (const [a, b] of [[[-34, 50], [-30.7, 5.5]], [[-12, -10], [-12, 40]], [[-40, -10], [-28, 34.7]], [[-28, 34.7], [-12, 0]]]) {   // (to the altar's top, across the court, down from the altar's top, round to the east)
      const p = { x: b[0], z: b[1] }, pts = way39(a[0], a[1], p, freeFor31(p));
      assert.equal(walkable(a[0], a[1], pts, p), '', `${a} → ${b}`); assert.ok(Math.hypot(pts.at(-1).x - p.x, pts.at(-1).z - p.z) < 0.01, 'ends at the place');
    }
    HOUSE22.on = true; HOUSE22.gate = false;
    { const p = { x: P26.gate.x, z: P26.gate.z }, pts = way39(-40, 5, p, freeFor31(p)); assert.equal(walkable(-40, 5, pts, p), ''); assert.ok(pts.some((q) => q.x < -76.6) || pts.at(-1).x < -76.6, 'through the Ulam\'s door'); }
    HOUSE22.gate = true;
    { const p = { x: P26.walkM.x, z: P26.walkM.z }, pts = way39(P26.gate.x + 1.5, P26.gate.z, p, freeFor31(p)); assert.equal(walkable(P26.gate.x + 1.5, P26.gate.z, pts, p), ''); assert.ok(pts.every((q) => q.x > -91.6 || q.x < -98.4 || Math.abs(q.z) < 4.4), 'the Heichal\'s gate: its span'); }
    { const p = { x: -52, z: 0 }, pts = way39(P26.walkM.x, P26.walkM.z, p, freeFor31(p)); assert.equal(walkable(P26.walkM.x, P26.walkM.z, pts, p), '', 'out of the House'); }
  } finally { HOUSE22.on = on; HOUSE22.gate = g; }
});

// ───────── the guide ─────────
test('build 39: the guide — one place: its way\'s next point (the drag does not matter), slower over the last amot, null on arrival; no place or an act → null (no motion)', () => {
  const p = { id: 'kiyor', at: { x: -12, z: 0 } };
  const G = createGuide39({ E: fakeE([p]), freeFor: freeFor31, clock });
  const h = { x: -12, z: 30 };
  const d1 = G.dir(h, null), d2 = G.dir(h, { x: 1, z: 0 });
  assert.ok(d1 && Math.abs(Math.hypot(d1.x, d1.z) - 1) < 1e-9 && d1.id === 'kiyor'); assert.ok(Math.abs(d1.x - d2.x) < 1e-9 && Math.abs(d1.z - d2.z) < 1e-9, 'one place: the drag does not choose');
  const near = G.dir({ x: p.at.x + 1, z: p.at.z }, null); assert.ok(near.k < 1 && near.k >= G39.minK, 'slower near the place');
  assert.equal(G.dir({ x: p.at.x + 0.2, z: p.at.z }, null), null, 'arrived: stand'); assert.equal(G.state().arrived, 'kiyor');
  assert.equal(createGuide39({ E: fakeE([]), freeFor: freeFor31, clock }).dir(h, null), null, 'no place: no motion');
  assert.equal(createGuide39({ E: fakeE([p], { acting: true }), freeFor: freeFor31, clock }).dir(h, null), null, 'in an act: no motion');
});
test('build 39: several open places — the drag\'s direction chooses, with hysteresis (a slight turn of the thumb never flips it)', () => {
  const A = { id: 'a', at: { x: -12, z: 40 } }, B = { id: 'b', at: { x: -12, z: 0 } };
  const G = createGuide39({ E: fakeE([A, B]), freeFor: freeFor31, clock });
  const h = { x: -12, z: 20 };
  assert.equal(G.dir(h, null).id, 'a', 'no drag: the morning\'s next');
  assert.equal(G.dir(h, { x: 0, z: -1 }).id, 'b', 'a drag toward the second');
  assert.equal(G.dir(h, { x: 0.995, z: 0.0995 }).id, 'b', 'across, a hair toward the first: kept (hysteresis)');
  assert.equal(G.dir(h, { x: 0, z: 1 }).id, 'a', 'clearly toward the first: back');
  assert.ok(G.state().picks >= 2);
});
test('build 39: blocked (no headway) — a new way from where he stands; the twin\'s guided step: toward the way at WALK39.speed, eased in; no direction → to rest', () => {
  const p = { id: 'x', at: { x: -12, z: 40 } };
  clockT = 0; const G = createGuide39({ E: fakeE([p]), freeFor: freeFor31, clock });
  const h = { x: -30, z: 30 }; G.dir(h, null); const r0 = G.state().replans;
  clockT = G39.stuckS + 0.1; G.dir(h, null); assert.equal(G.state().replans, r0 + 1, 'replanned when he made no headway');
  { clockT = 0; const N = createGuide39({ E: fakeE([p]), freeFor: freeFor31, clock }), hn = { x: p.at.x - 1.8, z: p.at.z }; assert.ok(N.dir(hn, null)); clockT = G39.stuckS + 0.1; assert.equal(N.dir(hn, null), null, 'no headway within G39.near: he is there (a fence, the place in a solid) — stand, never push at it'); assert.equal(N.state().arrived, 'x'); }
  const v = { vx: 0, vz: 0 }, top = 11;
  for (let i = 0; i < 4; i++) walk39(v, { x: 1, z: 0, k: 1 }, top, 0.05);
  assert.ok(v.vx > 0 && v.vx < top * WALK39.speed, 'eased in'); for (let i = 0; i < 60; i++) walk39(v, { x: 1, z: 0, k: 1 }, top, 0.05);
  assert.ok(Math.abs(v.vx - top * WALK39.speed) < 0.05 && Math.abs(v.vz) < 1e-9, 'the pace');
  for (let i = 0; i < 40; i++) walk39(v, null, top, 0.05); assert.deepEqual([v.vx, v.vz], [0, 0], 'no direction: rest');
});

// ───────── the input ─────────
test('build 39: the twin — the guided walk only with a thumb held (the stick\'s branch), no stick drawn, the developer\'s stick behind ?stick=1 with the door help; acts keep their touches (the ashes\' descent pushed steadily, the pyre\'s row by the drag)', () => {
  const t = read('src/game/twin.js');
  assert.match(t, /body \.gm\.tw-on\.tw-g39 \.tw-zone\{left:0;top:0;width:100%;bottom:0;z-index:3\}/); assert.match(read('src/avodah/shift/flow31.js'), /body\.sh-on \.gm\.tw-on:not\(\.tw-g39\) \.tw-zone\{width:50vw;top:0\}/, 'the old half-screen stick only with the developer\'s stick');
  assert.match(t, /\.gm\.tw-on\.tw-g39 \.tw-base,\.gm\.tw-on\.tw-g39 \.tw-ghost,\.gm\.tw-on\.tw-g39 \.tw-zone \.tw-tip\{display:none!important\}/);
  assert.match(t, /export const STICK39 = \(\(\) => \{ try \{ return typeof location !== 'undefined' && \/\[\?&\]stick=1\(&\|\$\)\/\.test/);
  assert.match(t, /const g39 = \(\) => !STICK39 && !globalThis\.__STICK39 && typeof T\.guide39 === 'function';/);
  const i = t.indexOf('if (soft && stick.on && h && !moment && T.pace.p24) {'), j = t.indexOf('} else if (G) {', i);
  assert.ok(i > 0 && j > i && j - i < 2200, 'the guided step inside the held stick\'s branch (no touch, no motion)');
  assert.match(t, /if \(G && T\.stickUse\.d21\) T\.stickUse\(0, WALK39\.push, WALK39\.push\); else T\.stickUse\(ux \* M, uy \* M, M\);/);
  assert.match(t, /if \(typeof T\.assist38 === 'function' && !g39\(\)\) \{/, 'the door help with the developer\'s stick only');
  const f = read('src/avodah/shift/flow31.js'); assert.match(f, /if \(o\.twin\) o\.twin\.guide39 = \(h, drag\) => G39\.dir\(h, drag\);/);
  const d = read('src/avodah/shift/dam27.js'); assert.match(d, /export const STIR39 = Object\.freeze\(\{ px: 18, rad: 0\.8 \}\);/); assert.match(d, /if \(p\.sx != null && dx \* p\.sx \+ dy \* p\.sy < 0 && \(p\.trav \|\| 0\) >= STIR39\.px\) \{ E\.r27swirl\(STIR39\.rad\); p\.trav = 0; \}/, 'the zorek\'s stir back and forth counts');
});
test('build 39: the engine — the House\'s exit is a place (out26), the salt chamber an open alternative while the ramp wants salt, none in practice', async () => {
  const R = rig(FLAGS, { save: {} }); R.E.start(); await R.step(0.3);
  assert.deepEqual(R.E.alt39(), [], 'no alternative at the laver');
  const d = read('src/avodah/shift/day33.js'); assert.match(d, /if \(st\.r26 && st\.r26\.ph === 'out' && !st\.close35 && !prac\) return \{ id: 'out26'/);
  assert.match(d, /if \(acting \|\| st\.phase !== 'run' \|\| st\.night \|\| prac \|\| !saltDue\(\) \|\| !\(st\.m22 && carry22\(\)\)\) return \[\];/);
});
test('build 39: a morning walked by the guide alone — from the start to the laver, his act starts there (the hero moved only along the guide\'s way)', async () => {
  const R = rig(FLAGS, { save: {} }); R.E.start(); await R.step(0.3);
  clockT = 0; const G = createGuide39({ E: R.E, freeFor: freeFor31, clock });
  let n = 0, still = 0;
  for (; n < 2000 && !R.E.k20(); n++) {
    const g = G.dir(R.H, null);
    if (g) { const k = 7 * (g.k || 1) * 0.05; R.at(R.H.x + g.x * k, R.H.z + g.z * k); } else still++;
    clockT += 0.05; await R.step(0.05, 0.05);
  }
  assert.ok(R.E.k20(), `the laver's act after ${n} steps`);
  assert.equal(GAME_BUILD, 59);   // (build 40: the constant moved on) (build 41: again) (build 42: again) (build 43: again) (build 44: again) (build 45: again) (build 46: again) (build 47: again) (build 48: again) (build 49: again) (build 50: again) (build 51: again)
});

// ───────── the Divine Name ─────────
test('build 39: no Divine Name in the changed files (by code points); the pilgrims\' word', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/guide39.js', 'src/avodah/shift/flow31.js', 'src/avodah/shift/day33.js', 'src/game/twin.js', 'src/avodah/shift/lobby35.js', 'tools/autoplay35.js', 'tools/kid34/kid.cjs', 'tools/kid34/kidmodes.cjs', 'test/build39.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const bad = String.fromCharCode(0x5e6, 0x5dc, 0x5d9, 0x5d9, 0x5e0);
  for (const f of files.filter((f) => f.startsWith('src/'))) assert.ok(!read(f).includes(bad), f);
});
