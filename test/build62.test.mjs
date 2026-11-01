// ── build 62 ── stage 01 again, "הפטיש בהר" (docs/specs/shlav-alef-olam-he.md §3, §5; the owner, 30.10: "שלב ראשון פטיש בהר… זה הג'וס").
// har62.js: the parts in their new order on the real Mount, the Mount's share as each is done (the crews build between), the eight sectors
// of the crest (rock → split → down → paved), the glide to a far place, and the hammer (the crew's beat). stages.js cuts the sectors and
// paves them (uSec, its CPU mirror), the working bay off. har42.js wired; index.js leaves the Mount to stage 01 while it builds it.
// GAME_BUILD 62. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PARTS62, MOUNT62, mount62, mountBefore62, ZONE62, SECT62, CREW62, sectorOf62, crewSec62, secLevel62, GLIDE62, glide62, glideView62, HAMMER62, createHammer62, LINE62 } from '../src/game/har62.js';
import { PARTS42 } from '../src/game/har42.js';
import { PLAT } from '../src/mount.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js'), SJ = read('src/stages.js'), IX = read('src/game/index.js');

test('build 62: GAME_BUILD 62; the parts — the old ones all kept, two hammers after their rocks, the reveal last', () => {
  assert.equal(GAME_BUILD, 62);
  assert.deepEqual(PARTS62, ['open', 'rope', 'lift', 'corner', 'course0', 'course1', 'rock0', 'hammer0', 'rock1', 'hammer1', 'rock2', 'pave', 'roll', 'trace', 'reveal']);
  for (const p of PARTS42) assert.ok(PARTS62.includes(p), p);
  assert.equal(PARTS62.indexOf('hammer0'), PARTS62.indexOf('rock0') + 1); assert.equal(PARTS62.indexOf('hammer1'), PARTS62.indexOf('rock1') + 1);
});

test('build 62: the Mount rises with the parts — never down, whole at the reveal, the fill level before the parts played on it', () => {
  let last = 0; for (const p of PARTS62) { assert.ok(mount62(p) >= last, p); last = mount62(p); }
  assert.equal(mount62('reveal'), 1); assert.equal(mountBefore62('open'), MOUNT62.open); assert.equal(mountBefore62('hammer0'), MOUNT62.rock0);
  assert.ok(MOUNT62.open >= 0.15, 'past the old dig (FOUND): the hill as it is, the walls to come');
  assert.ok(mountBefore62('roll') >= 0.7 && mountBefore62('trace') >= 0.7, 'the great stone and the inscription on a level fill');
});

test('build 62: the places — the corner works inside the south-east corner, the inscription at the south-west, the sectors on the crest inside the Mount', () => {
  assert.ok(ZONE62.se.x + 16 < PLAT.X1 - 4 && ZONE62.se.z + 16 < PLAT.Z1 - 4, 'the rope, the wheel, the course inside the corner, clear of the walls\' trench');
  assert.ok(ZONE62.se.z > 300 && ZONE62.sw.x < -300 && ZONE62.sw.z > 360);
  assert.equal(SECT62.length, 8);
  const his = SECT62.map((s) => s.his).filter((v) => Number.isFinite(v)).sort(); assert.deepEqual(his, [0, 1, 2]);
  for (const s of SECT62) assert.ok(s.x - s.half > PLAT.X0 && s.x + s.half < PLAT.X1 && s.z - s.half > PLAT.Z0 && s.z + s.half < PLAT.Z1);
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) { const a = SECT62[i], b = SECT62[j]; assert.ok(Math.abs(a.x - b.x) >= a.half + b.half || Math.abs(a.z - b.z) >= a.half + b.half, `${i} ${j} overlap`); }
  assert.equal(SECT62[sectorOf62('rock0')].his, 0); assert.equal(sectorOf62('hammer1'), sectorOf62('rock1')); assert.equal(sectorOf62('pave'), -1);
});

test('build 62: the crews — never his hammer\'s sectors; theirs all down before the paving begins; all paved by the reveal', () => {
  for (const p of [0.2, 0.5, 0.9, 1]) { assert.equal(crewSec62(sectorOf62('hammer0'), p).lv, 0); assert.equal(crewSec62(sectorOf62('hammer1'), p).lv, 0); }
  const lastDown = Math.max(...SECT62.filter((s) => Number.isFinite(s.crew)).map((s) => s.crew + CREW62.span));
  assert.ok(lastDown <= CREW62.pave0, 'down before paved');
  for (let i = 0; i < 8; i++) { if (Number.isFinite(SECT62[i].crew)) assert.equal(crewSec62(i, lastDown).lv, 1); if (i) assert.equal(crewSec62(i, mount62('trace')).pv, 1, `${i} paved by the inscription`); }
  assert.equal(crewSec62(0, 1).pv, 0, 'the first is his to pave');
  assert.equal(secLevel62(20, 0), 20); assert.equal(secLevel62(20, 1), 0); assert.ok(secLevel62(20, 0.5) < 10, 'eased: fast at first');
});

test('build 62: the glide — only far, from the view it left to the one it reaches, up over the Mount between', () => {
  assert.equal(glide62({ x: 0, z: 0 }, { x: 30, z: 30 }), false); assert.equal(glide62({ x: 300, z: 350 }, { x: -60, z: -30 }), true);
  const a = { p: [0, 10, 0], t: [0, 0, -10] }, b = { p: [100, 20, 0], t: [100, 0, -10] };
  assert.deepEqual(glideView62(a, b, 0), a); const e = glideView62(a, b, 1); assert.ok(Math.abs(e.p[0] - 100) < 1e-9 && Math.abs(e.p[1] - 20) < 1e-9);
  assert.ok(glideView62(a, b, 0.5).p[1] > 15 + GLIDE62.up * 0.9); assert.ok(GLIDE62.T <= 3, 'rule 14: a camera move of up to 3 s');
});

test('build 62: the hammer — waits for the crew; on the beat big, off it dull; done on the beat in `need`, and never stuck off it; the levels stricter', () => {
  const J = createHammer62(1), c = HAMMER62;
  assert.equal(J.tap(), 'wait');
  J.step(c.lead + 0.01); assert.equal(J.tap(), 'big');
  J.step(J.beat * 0.5 - 0.01); assert.equal(J.tap(), 'dull');
  const K = createHammer62(1); K.step(c.lead); let n = 0; while (!K.state().done && n < 100) { K.step(K.beat); K.tap(); n++; }
  assert.equal(n, c.need[0]); assert.equal(K.state().q, 1);
  const D = createHammer62(1); D.step(c.lead + D.beat * 0.5); let m = 0; while (!D.state().done && m < 200) { D.tap(); m++; }
  assert.ok(D.state().done && m > c.need[0], 'off the beat: more strokes, still done'); assert.equal(D.state().q, 0);
  assert.ok(c.beat[2] < c.beat[0] && c.win[2] < c.win[0] && c.need[2] > c.need[0]);
  let fell = 0; const F = createHammer62(2); for (let k = 0; k < 200; k++) if (F.step(0.05)) fell++; assert.ok(Math.abs(fell - ((200 * 0.05 - c.lead) / F.beat + 1)) <= 1, 'the crew strikes once a beat');
});

test('build 62: stages.js — the sectors cut down in the shader and its CPU mirror, paved, the bushes cleared there; the bay switch', () => {
  assert.match(SJ, /uSec: \{ value: Array\.from\(\{ length: 8 \}/);
  assert.match(SJ, /float y1 = min\(hY, S\.w\);/);
  assert.match(SJ, /if \(kk2 > 0\) y = lerp\(y, Math\.min\(y, S\.w\), kk2\);/);
  assert.match(SJ, /if \(vPv > 0\.5\)/);
  assert.match(SJ, /const on = !bayOff62 && hs\.status/);
  assert.match(SJ, /setSectors62, sectors62: secInfo62, noBay62:/);
});

test('build 62: har42 and index.js wired — the parts, the places, the Mount from world61, the glide, the hammer; the Mount left to stage 01', () => {
  assert.match(H, /const PARTS = ON62 \? PARTS62 : parts0\(\);/);
  assert.match(H, /STG === 'kiyor' \? PARTS59 : STG === 'ulam' \? PARTS60 : PARTS42;/, 'the old order kept behind ?h62=0');
  assert.match(H, /const from = mountBefore62\(part\), to = mount62\(part\), p = creep61\(W61, 'har', from, to, dt\);/);
  assert.match(H, /world62\(grow61\(W61, 'har', mount62\(part\)\), false\)/);
  assert.match(H, /if \(ON62 && st\.target && glide62\(hero\(\), st\.target\)\) glideTo62\(st\.target\);/);
  assert.match(H, /hammer0: \{ begin\(\) \{ st\.job = mkHammer\(0\); \} \}/);
  assert.match(H, /if \(stages\.noBay62\) stages\.noBay62\(true\);/);
  assert.match(IX, /if \(s\.id === 'har' && H42 && H42\.on && H42\.world62 && H42\.world62\(\)\) continue;/);
  assert.ok(LINE62.hammer.endsWith('· המחשה'));
});

test('build 62: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/har62.js', 'src/game/har42.js', 'src/stages.js', 'test/build62.test.mjs', 'tools/auto42.js']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
