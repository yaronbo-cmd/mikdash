// ── build 53 ── Phase A, round 1 (docs/specs/bikoret-mefakeach-27-10-he.md §2 and §4; the coordinator's build-53 brief): the object rule in
// stages 01–02 (Phase B's obj51 on Phase A's act view; the cam41 measure per Phase A part), the treadwheel lowered by a drag down or left with
// an arrow on its meter, the freed roller a thing in the world (no ⟳ button) and the crews on the great stone's ropes, the opening's 1 s from
// black after the first viewing (and in a fixture), the gold line and the pins' beams ¼ wide and half seen, the guided walk ≤ 5 amot/s within
// 6 of the place, the inscription's macro, the course from the side on the crews' course, the corner's ghost on the ground and "עוד X", the
// Mount alive (crews, carts, heaps), the rock's beam of light and macro, the rope graded by its straightness, stage 02's thread (the ring on
// the near peg, the far one lit) and the pulley's three signs. GAME_BUILD 53. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LINE42, FADE53, WALK53, OBJ53, VIEW53, ROPE53, slow53, fig53, PARTS42, PARTS45 } from '../src/game/har42.js';
import { walk39, WALK39, OBJ51 } from '../src/game/twin.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 53: GAME_BUILD 53', () => {
  assert.equal(GAME_BUILD, 56);
});

test('build 53: the object rule in stages 01–02 — Phase B\'s obj51 on the act view (03–07 untouched: build 54); the measure per Phase A part', () => {
  assert.deepEqual([...OBJ53.stg], ['har', 'wall']);
  // (build 54: the rule became a function, rule53, on stages 01–02's act views and on 03–07's failing parts)
  assert.match(H, /if \(OBJ53\.stg\.includes\(STG\) \|\| OBJ54\.parts\.includes\(st\.part\)\) v = rule53\(v, h, HH, tanH, tanV\);/); assert.match(H, /const q = obj51\(v\.p, v\.t, st\.objBB, \{ x: h\.x, y: h\.y, z: h\.z, h: HH \}, tanH, tanV, \{ \.\.\.OBJ51,/);
  assert.equal(OBJ51.w, 0.3); assert.equal(OBJ51.h, 0.2);
  // (the thing for the camera may be the whole of what the touch is a part of — the roller's stone)
  assert.match(H, /function objPlace\(on, pts, id, bbPts\)/);
  assert.match(H, /objBox: \(\) => \(st\.objBB \? \{ bb: st\.objBB \} : null\)/);
  const cam = read('tools/cam41.js'); assert.match(cam, /if \(k === 'act' && h4\.objBox\)/);
  // (the turn chosen last frame is preferred; each part starts afresh)
  assert.match(H, /st\.camLock = null; st\.a53 = null; st\.o53 = null;/);
});

test('build 53: the treadwheel — a drag down or left lowers it at any time; past the window an arrow ⬇ by the meter; the line says which way', () => {
  assert.match(H, /if \(dy > 20 \|\| dx < -20 \|\| \(over && Math\.hypot\(dx, dy\) > 20\)\) \{ inp\.hold = false; inp\.back = true; \}/);
  assert.match(H, /const dn = el\('h42-dn', '⬇'\)/);
  assert.match(H, /const past = s\.y > J\.P\.win\[1\] \+ 0\.02 && !s\.done; dn\.hidden = !past;/);
  assert.ok(LINE42.lift2.startsWith('גררו ⬇'));
});

test('build 53: the great stone — the freed roller is a thing in the world, touched where it lies (touch40\'s object), no ⟳ button; the crews on its ropes', () => {
  const roll = H.slice(H.indexOf('  function mkRoll() {'), H.indexOf('  /* PLACE (end): the last paving slabs'));
  assert.doesNotMatch(roll, /'⟳'/, 'no ⟳ button');
  assert.doesNotMatch(roll, /dragOnly: true/, 'the act\'s surface takes a finger');
  assert.match(roll, /objPlace\(true, \[\{ x: f\.x, y: f\.y \+ 0\.3, z: f\.z, r: 1\.7 \}\], 'h42roll', stoneBack\(x\)\)/);
  assert.match(roll, /const r = J\.moveRoller\(\{ dragPx: Math\.hypot\(a\.x - a\.x0, a\.y - a\.y0\) \}\);/);
  assert.match(roll, /if \(team\) team\.pull\(x, dt, s\.waiting\);/);
  assert.match(H, /L\.team = \{ g: tg, pullers, pull\(x, dt, idle\)/);
  const auto = read('tools/auto42.js'); assert.doesNotMatch(auto.slice(auto.indexOf('async function roll()'), auto.indexOf('async function pave()')), /includes\('⟳'\)/);
  const kid = read('tools/kid34/kidmodes.cjs'); assert.match(kid, /async function roll53k\(K\)/);
});

test('build 53: the opening — after the first viewing (and in a fixture) no flight: ~1 s from black to the world', () => {
  assert.ok(FADE53.T >= 0.8 && FADE53.T <= 1.2, `${FADE53.T}`);
  assert.match(H, /const fix = !!qs\('h42at'\) && qs\('h42at'\) !== 'open', first = !R\.open && !fix;/);
  assert.match(H, /if \(!first\) \{ st\.fly = \{ t: 0, T: FADE53\.T, fade: true, snap: false \}; line\(''\); black53\(1\); return; \}/);
  assert.match(H, /end\(\) \{ R\.open = \(R\.open \| 0\) \+ 1; black53\(0\);/);
});

test('build 53: the gold line and the pins\' beams in Phase A — ¼ of their width, half seen; back to whole when it ends', () => {
  const S = read('src/stages.js');
  assert.match(S, /float w = clamp\(d \* 0\.0045, 0\.7, 8\.0\) \* on \* uThin\.x/);
  assert.match(S, /\* uThin\.y\);/);
  assert.match(S, /outlineThin: \(w = 1, a = 1\) =>/);
  assert.match(H, /stages\.outlineThin\(0\.25, 0\.5\)/); assert.match(H, /stages\.outlineThin\(1, 1\)/);
});

test('build 53: the guided walk in Phase A — at most 5 amot/s within 6 amot of the place (walk39 eased, simulated)', () => {
  assert.equal(WALK53.near, 6); assert.equal(WALK53.v, 5);
  for (const start of [12, 20, 40]) {
    const v = { vx: 0, vz: 0 }; let x = start, worst = 0;
    for (let i = 0; i < 4000 && x > 0.35; i++) {
      const g = slow53({ x: 1, z: 0, k: Math.max(0.25, Math.min(1, x / 2.2)), left: x }, 14);
      walk39(v, g, 14, 1 / 60); x -= v.vx / 60;
      if (x < WALK53.near) worst = Math.max(worst, Math.hypot(v.vx, v.vz));
    }
    assert.ok(worst <= WALK53.v, `from ${start}: ${worst.toFixed(2)} amot/s within 6`);
  }
  assert.ok(14 * WALK39.speed > 8, 'his pace far from the place unchanged');
  assert.match(H, /g = slow53\(g, 14\);/);
});

test('build 53: the inscription\'s macro — the stone 70 % of the width, the dots\' line ≥ 120 px at 640', () => {
  assert.equal(VIEW53.trace, 0.7);
  // the view's distance gives the 3.4-amah stone VIEW53.trace of the width; the dots span 2.8 amot of it
  const span = (2.8 * VIEW53.trace / 3.4) * 640; assert.ok(span >= 120, `${span}`);
  assert.match(H, /view\(\) \{ const c = camera\(\), tanV = [^;]+, tanH = tanV \* \(W\(\) \/ H\(\)\), D = 3\.4 \/ \(2 \* VIEW53\.trace \* tanH\)/);
});

test('build 53: the course — stage 01 starts at the second course, on the crews\' course (seen whole); from the side, his stretch half the width', () => {
  assert.match(H, /const n53 = STG === 'har' \? 1 : 0, nn = n \+ n53/);
  assert.match(H, /if \(n53 && n === 0 && !g\.userData\.base53\)/);
  assert.match(H, /`נדבך \$\{nn \+ 1\} · רמה \$\{L\}`/);
  assert.ok(VIEW53.course >= 0.4);
  assert.match(H, /view: n53 \? \(\) => \{/);
});

test('build 53: the corner (01, 02) — the place\'s dashed outline on the ground at every level and "עוד X" by the bar', () => {
  assert.match(H, /stroke-dasharray="9 6"/);
  // (build 54: the arrow toward the place by its side on the screen, "לצד השני" after a push away, one tefach in words)
  assert.match(H, /more\.textContent = away54 > 0 \? `לצד השני \$\{arr\}` : s\.x > 0 \? `\$\{tf\} חזרה \$\{arr\}` : `עוד \$\{tf\} \$\{arr\}`;/);
});

test('build 53: the Mount alive — crews, carts and heaps round the work and one behind each act\'s thing; shapes only (no assets)', () => {
  for (const f of ['function worker53', 'function cart53', 'function heap53', 'function crew53', 'function life53', 'function lifeFrame53']) assert.ok(H.includes(f), f);
  assert.match(H, /life53\(g, add\);/);
  assert.match(H, /lifeFrame53\(dt, v\);/);
  assert.doesNotMatch(H.slice(H.indexOf('const P53 = '), H.indexOf('  /** a rock: an icosphere')), /\.(png|jpg|glb|gltf|webp)/);
  try { const sz = fs.statSync(new URL('dist/temple3d.html', ROOT)).size; assert.ok(sz <= 6 * 1024 * 1024, `${sz}`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
});

test('build 53: the rock — a lamp and its beam of light raking the face; a macro on the rock', () => {
  assert.match(H, /new THREE\.ConeGeometry\(1\.0, 1, 24, 1, true\)/);
  assert.match(H, /if \(s\.light >= 0 && !s\.done\) beamAt\(s\.light\);/);
  assert.ok(VIEW53.rock >= 0.5);
});

test('build 53: the rope — the sway off the line, the steer, the grade by the widest step off it (its own family)', () => {
  assert.equal(ROPE53.drift.length, 5); assert.ok(ROPE53.ok < ROPE53.kasher);
  assert.match(H, /const q = R5\.max <= ROPE53\.ok \? 1 : R5\.max <= ROPE53\.kasher \? 0\.65 : 0\.3; grade\('rope', q, b\);/);
  assert.match(H, /const FAMOF = \{ rope: 'rope',/);
  assert.equal(PARTS42[1], 'rope');
});

test('build 53: stage 02 — the thread\'s ring on the near peg only, the far one lit; the pulley in three signs', () => {
  assert.match(H, /acting: true, J, kind: 'line', ends, fullPad: true,/);
  const head = LINE42.pulley.split(' · ')[0].replace(/ /g, ' ');
  assert.equal(head, 'משכו ⬇ · החזיקו · משכו ⬇');
  assert.ok(PARTS45.includes('pulley'));
});

test('build 53: him kept ≤ 45 % of the height after obj51 (fig53, pure); the act\'s crew beyond the thing as the camera sees it; the great stone\'s side view', () => {
  assert.equal(OBJ53.big, 0.45);
  // a 6.4-amah figure 10 amot before a level camera (the page's 50° field): about 0.69 of the height — over; at 16 amot ≤ 0.45
  const tv = Math.tan((50 * Math.PI) / 360), th = tv * (844 / 390), H = { x: 0, y: 0, z: 0, h: 6.4 };
  const near = fig53([0, 3.2, 10], [0, 3.2, 0], H, th, tv), far = fig53([0, 3.2, 16], [0, 3.2, 0], H, th, tv);
  assert.ok(near.s > 0.45 && far.s <= 0.45, `${near.s} ${far.s}`);
  assert.match(H0(), /if \(F0 && F0\.s > OBJ53\.big && Math\.abs\(F0\.x\) < 1\.1\)/);
  assert.match(H0(), /const cp = st\.job\.view && v \? \{ x: v\.p\[0\], z: v\.p\[2\] \} : cq\.p, fx0 = ox - cp\.x, fz0 = oz - cp\.z/);
  assert.match(H0(), /view\(\) \{ const y = PL\.roll0\.y; return \{ p: \[xNow \+ 0\.5, y \+ 5\.5, PL\.roll0\.z \+ VIEW53\.roll\]/);
});
function H0() { return H; }
