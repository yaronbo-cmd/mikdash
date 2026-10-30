// ── build 54 ── Phase A, round 2 — stages 03–07 (docs/specs/bikoret-mefakeach-27-10-he.md §2 (03, 04, 05, 07) and §4; the coordinator's build-54
// brief): the rock's macro out of his way (01, item 1), the object rule on 03–07's failing parts (rule53 — obj51 + fig53 — on their views), the
// lattice's board a 40 % window and the real lattice filling the frame, live; the warning stones at 3 amot/s with a gauge from the last stone;
// the lintel without drift at level 1, its arrow by the side, big and blinking, him in the left third; the leaf's pin in a macro, its stop seen,
// a door; the seven gates from above — the court paved, the gatehouses with their shadows, the names beside them; the wood's name only after
// the decision, its defects drawn, "קלפו"; the beams on the ground, no "פינה"; the peg's joint in the world; the compass's room and its peg;
// the spokes' pile; the spilt water. GAME_BUILD 54. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LINTEL54, WARN54, LAT54, OBJ54, OBJ53 } from '../src/game/har42.js';
import * as F from '../src/game/fam42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const fnOf = (name, next) => H.slice(H.indexOf(`  function ${name}(`), next ? H.indexOf(`  function ${next}(`, H.indexOf(`  function ${name}(`)) : undefined);

test('build 54: GAME_BUILD 54', () => {
  assert.equal(GAME_BUILD, 60);
});

test('build 54: the rock\'s macro (01) — his stands 9 amot east of each rock and 3 south, the camera 4.5 aside away from him: out of its frame', () => {
  assert.match(H, /rock0: P\(-3, -11\), rock1: P\(-15, -3\), rock2: P\(-21, 11\),/);
  assert.match(H, /return \{ p: \[C\.x \+ sx \* 4\.5, C\.y \+ 0\.6 \+ D \* 0\.3, C\.z \+ D\]/);
  // (pure: from the macro's camera his figure is out of the frame — lateral over the half-width at his depth)
  const tv = Math.tan((32 * Math.PI) / 360), th = tv * (640 / 296), D = 5.6 / (2 * 0.62 * th), cam = { x: -4.5, z: D }, him = { x: 9, z: 3 };
  const fwd = { x: -0.6 - cam.x, z: 0 - cam.z }, fl = Math.hypot(fwd.x, fwd.z), f = { x: fwd.x / fl, z: fwd.z / fl }, v = { x: him.x - cam.x, z: him.z - cam.z };
  const depth = v.x * f.x + v.z * f.z, lat = Math.abs(v.x * -f.z + v.z * f.x);
  assert.ok(lat - 0.8 - 2.6 > depth * th, `lateral ${lat.toFixed(2)} over the half-width ${(depth * th).toFixed(2)}`);
});

test('build 54: the object rule on 03–07\'s failing parts — rule53 (obj51, then him stepped back) on their own views; the lintel\'s lift nearer', () => {
  for (const p of ['warn', 'leaf', 'wood', 'hub', 'wheel']) assert.ok(OBJ54.parts.includes(p), p);
  assert.match(H, /'h46bows', \[\{ x: priests\[0\]\.g\.position\.x/, 'the bows: the procession is the thing');
  assert.ok(OBJ54.gate < 1 && OBJ54.gate > 0.7);
  assert.ok(OBJ54.leaf7 < OBJ54.gate && OBJ54.leaf7 > 0.7, 'the heavy leaf\'s lift nearer still'); assert.match(H, /if \(phase === 'lift'\) return gateView\(12, 0, OBJ54\.leaf7\);/);
  assert.match(H, /function rule53\(v, h, HH, tanH, tanV\)/);
  assert.match(H, /if \(J\.view && OBJ54\.parts\.includes\(st\.part\) && !\(J\.ownView && J\.ownView\(\)\)\)/);
  assert.match(H, /if \(OBJ53\.stg\.includes\(STG\) \|\| OBJ54\.parts\.includes\(st\.part\)\) v = rule53\(v, h, HH, tanH, tanV\);/);
  assert.deepEqual([...OBJ53.stg], ['har', 'wall']);
});

test('build 54: the lattice (03) — the board a window of 40 % of the width in the top-left corner; the real lattice fills the frame, its gap outlined and the piece in hand shown in it', () => {
  assert.equal(LAT54.win, 0.4); assert.ok(LAT54.fill >= 0.6);
  const lat = fnOf('mkLattice', 'mkWood');
  assert.match(lat, /const geo = \(\) => \{ const bw = W\(\) \* LAT54\.win, sz = bw \/ 10; return \{ x: 10,/);
  assert.match(lat, /D = PAN46\.w \/ \(2 \* LAT54\.fill \* th\)/);
  assert.match(lat, /cx = gx \+ LAT54\.gx \* D \* th, cy = gyy \+ LAT54\.gy \* D \* tv;/, 'the view on the gap itself');
  // (pure: the gap at gx, gy of the half-frame right of and below the middle — clear of the window, 40 % wide over the top-left)
  assert.ok(0.5 + LAT54.gx / 2 > LAT54.win + 0.05 && 0.5 + LAT54.gy / 2 < 0.8);
  assert.match(lat, /pan\.draw\(slot, pc \? F\.tile46\(pc\.type, pc\.r, pc\.f\) : null\)/);
  assert.match(lat, /function gapAt\(\)/);
  assert.match(H, /const draw = \(gap, ghost\) =>/);
});

test('build 54: the warning stones (03) — 3 amot/s, the gauge from the last stone (a tick each amah, the count in amot)', () => {
  assert.equal(WARN54.v, 3);
  const w = fnOf('mkWarn', 'mkBows');
  assert.match(w, /stages\.hero\.drive\(stop \? 0 : walkDir \* WARN54\.v,/);
  assert.match(w, /אמות<\/text>/);
});

test('build 54: the lintel (04) — level 1 without drift; "הבועה ברחה — הזיזו ⬅/➡" by its side; the arrow big and blinking; him in the left third at ~27 % of the height', () => {
  assert.equal(F.LINTEL47.L[1].drift, 0); assert.ok(F.LINTEL47.L[2].drift > 0);
  const N = F.createLintel47(1, { rnd: () => 0.2 }); N.hold(true); for (let i = 0; i < 400; i++) N.step(0.05);
  assert.equal(N.state().out, false, 'level 1 held still: never out'); assert.equal(N.state().phase, 'set');
  assert.match(H, /line\(`הבועה ברחה — הזיזו \$\{s\.tilt > 0 \? '➡' : '⬅'\} · המחשה`/);
  assert.match(H, /<animate attributeName="opacity" values="1;\.2;1" dur="0\.7s" repeatCount="indefinite"\/>/);
  assert.ok(LINTEL54.h >= 0.25 && LINTEL54.h <= 0.3); assert.ok(LINTEL54.x > 0.33 && LINTEL54.x < 1, 'the left third');
  assert.match(H, /lintel: \{ get x\(\) \{ return lintelStand54\(\)\.x; \}/);
});

test('build 54: the leaf (04) — the pin\'s macro while it goes down; the stop seen (a jolt, "נתקעה"); a door', () => {
  const lf = fnOf('mkLeaf', 'mkNames');
  assert.match(lf, /ownView: \(\) => phase === 'pin',/);
  assert.match(lf, /if \(phase === 'pin'\) \{ const tx = pivX - sx \* 0\.3; return \{ p: \[pivX - sx \* 4, g0 \+ 1\.7, G\.z \+ 5\.7\], t: \[tx, g0 \+ 1\.5, G\.z\] \}; \}/);
  // (pure: level from 6.8 amot — the socket (0.1) and the leaf's foot (2.9) inside the frame's height)
  { const tv = Math.tan((32 * Math.PI) / 360), d = Math.hypot(3.7, 5.7), lo = 1.5 - d * tv, hi = 1.5 + d * tv; assert.ok(lo < 0 && hi > 3.1, `${lo.toFixed(2)}..${hi.toFixed(2)}`); }
  assert.match(lf, /נתקעה/);
  assert.match(H, /const DOOR54 = \{/); assert.match(H, /DOOR54\[k\]\.emissive = new THREE\.Color\(e\)/, 'the door read in the shade'); assert.match(H, /new THREE\.CylinderGeometry\(0\.2, 0\.2, 0\.6, 10\), DOOR54\.bronze\); pin\.position/, 'the pin in bronze'); assert.match(H, /new THREE\.TorusGeometry\(0\.32, 0\.06, 6, 14\), DOOR54\.bronze/);
});

test('build 54: the seven gates (04) — the court paved and the gatehouses (26 amot, their shadows) from above; the name beside its gate once set', () => {
  assert.match(H, /function court54\(on\)/); assert.match(H, /court54\(true\);/); assert.match(H, /court54\(false\);/);
  assert.match(H, /new THREE\.BoxGeometry\(ax \? 9 : 6, 26, ax \? 6 : 9\)/);
  assert.match(H, /font-size="\$\{W\(\) < 700 \? 13 : 15\}" font-weight="900" text-anchor="middle" fill="#FFF4DC" stroke="#2A1804" stroke-width="4" paint-order="stroke">\$\{esc\(q\.n\)\}/);
  // (the names of neighbouring gates on one wall a row apart — "שער הדלק" over "שער הבכורות" at 640: K54-P-04)
  assert.match(H, /\(q\.z > 0 \? 1 : -1\) \* \(F\.GATES47\.filter\(\(g\) => g\.side === q\.side\)\.indexOf\(q\) % 2 \? 0 : 18\)/);
  assert.match(H, /const c = \{ x: -93, z: 6 \}, Hh = Math\.max\(230, 110 \/ tanV\(\)\);/);
});

test('build 54: the wood (05) — the species\' name only after the decision (or at level 1 after 10 s); the defects drawn larger, the worm\'s exit holes on the bark; "קלפו"', () => {
  const wd = fnOf('mkWood', 'mkBeams');
  assert.match(wd, /if \(s2\.decided != null \|\| \(L <= 1 && logT > 10\)\)/);
  assert.doesNotMatch(wd, /if \(L <= 1\) h \+= `<text/);
  assert.match(wd, /sz = A\.size \* G\.h \* 0\.3/);
  assert.match(wd, /קלפו ⟷/);
});

test('build 54: the beams (05) — on the ground by the wall, taken where they lie; no "פינה" on the sockets; a nearer view', () => {
  const bm = fnOf('mkBeams', 'mkPegs');
  assert.doesNotMatch(bm, />פינה</);
  assert.doesNotMatch(bm, /קורת פינה' : '━ קורה'\} ×/);
  assert.match(bm, /const gb = \[\];/); assert.match(bm, /const nextOf = \(kd\) =>/);
  assert.match(bm, /const D = Math\.max\(needD\(\) \+ 7\.5, 30\)/);
  assert.match(bm, /W2\.y \+ 6\.2, W2\.z \+ sz \* D\], t: \[cx, W2\.y \+ 6\.2, W2\.z\]/, 'level, at the middle of the sockets\' height');
  assert.match(bm, /b\.style\.top = `\$\{Math\.round\(Math\.max\(56, Math\.min\(H\(\) - 50, q\.y - 23\)\)\)\}px`/, 'the handle kept on the screen');
  // (pure: from 34 amot (his 6.4-amah figure: needD + 7.5), level at 6.2 — the sockets (11.5) under the line's box and the beams on the ground (3.2 from the wall) over the frame's foot)
  const tv = Math.tan((32 * Math.PI) / 360), sock = 0.5 - (11.5 - 6.2) / (34 * tv) / 2, beam = 0.5 + (6.2 - 0.55) / ((34 - 3.2) * tv) / 2;
  assert.ok(sock > 0.17 && beam < 0.9, `sockets at ${(sock * 100).toFixed(0)} %, beams at ${(beam * 100).toFixed(0)} % of the height`);
});

test('build 54: the peg (05) — the joint in the world (the plank\'s tenon, the beam\'s mortise, the peg, the mallet), a macro; no 2D diagram', () => {
  const pg = fnOf('mkPegs', 'mkCorner48');
  assert.match(pg, /const D54 = \(\(\) => \{/); assert.match(pg, /ownView: \(\) => true,/);
  assert.doesNotMatch(pg, /rx="12" fill="rgba\(40,28,14,\.78\)"/, 'the board over the scene is gone');
  assert.doesNotMatch(pg, /🔨/);
});

test('build 54: the compass (07) — the chamber\'s paved floor and its walls from above; him by the peg; the peg ≥ 44 px', () => {
  assert.match(H, /function room54\(on\)/); assert.match(H, /hole50\('gazit'\); room54\(true\);/);
  assert.match(H, /compass: F16\(-79\.5, 62\.5\)/);
  assert.match(H, /r="22" fill="rgba\(255,214,110,\.18\)" stroke="#FFD66E" stroke-width="3"\/><circle cx="\$\{c\.x\}" cy="\$\{c\.y\}" r="6"/);
});

test('build 54: the wheel over the pit (07) — the spokes a pile in the world, not "חישור ×8"; the spill — the bucket tips, the water on the floor', () => {
  const hb = fnOf('mkHub50', 'mkWheel50');
  assert.doesNotMatch(hb, /`╱ חישור ×\$\{/); assert.match(hb, /const heap = \[\];/);
  assert.match(hb, /chip\.style\.top = `\$\{Math\.round\(Math\.max\(56, Math\.min\(H\(\) - 56, q\.y - 26\)\)\)\}px`/, 'the pile\'s handle kept on the screen');
  const wh = fnOf('mkWheel50');
  assert.match(wh, /bk\.rotation\.z \+= \(\(s\.spilling \? 0\.55 : 0\) - bk\.rotation\.z\)/);
  assert.match(wh, /st\.props\.puddle54 = pm;/);
});

test('build 54 (the coordinator\'s touch play of 53): the bar\'s label says the way — an arrow toward the place by its side on the screen; "לצד השני" after a push away; one tefach in words', () => {
  const c = fnOf('mkCorner', 'mkLattice');
  assert.match(c, /arr = \(ps && ph \? ph\.x < ps\.x : s\.x > 0\) \? '⬅' : '➡'/);
  assert.match(c, /tf = n === 1 \? 'טפח אחד' : `\$\{n\} טפחים`/);
  assert.match(c, /away54 = r === 'ok' && Math\.abs\(J\.state\(\)\.x\) > abs0 \+ 1e-6 \? 2\.4 : 0;/);
  assert.doesNotMatch(c, /`\$\{n\} טפחים חזרה`|`עוד \$\{n\} טפחים`/, 'never "עוד 1 טפחים"');
  // (pure: a push away from the place grows |x| and is 'ok' — the label's "לצד השני")
  const J = F.createFlick(1); const a0 = Math.abs(J.state().x); assert.equal(J.flick({ dragPx: 60, dir: -1 }), 'ok'); assert.ok(Math.abs(J.state().x) > a0);
  const J2 = F.createFlick(1); const b0 = Math.abs(J2.state().x); J2.flick({ dragPx: 60, dir: 1 }); assert.ok(Math.abs(J2.state().x) < b0, 'a push toward it shrinks the way');
});

test('build 54 (the coordinator\'s touch play of 53): stage 02\'s gold plan — a thin line (¾ amah; was 3), half seen', () => {
  assert.match(H, /const gm = new THREE\.MeshBasicMaterial\(\{ color: '#FFD66E', transparent: true, opacity: 0\.4, depthWrite: false \}\)/);
  assert.match(H, /Hh = 0\.35; const m = new THREE\.Mesh\(new THREE\.BoxGeometry\(w, Hh, d\), gm\);[^\n]*return add\(m, CW45\.x \+ dx, Math\.max\(y0, yP\) \+ 0\.3, CW45\.z \+ dz\)/, 'a line, not a wall of gold');
  assert.match(H, /st\.props\.plan = \[\[0, -hd, 2 \* hw \+ 0\.75, 0\.75\], \[0, hd, 2 \* hw \+ 0\.75, 0\.75\], \[-hw, 0, 0\.75, 2 \* hd\], \[hw, 0, 0\.75, 2 \* hd\]\]/);
});
