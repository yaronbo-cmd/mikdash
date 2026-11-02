// ── build 65 ── the real crews back on the Mount (the owner, 1.11: "הדמויות ברקע… פחח", "אפשר למלא את העולם בעוד צוותים אמיתיים, שייראה יותר
// פעיל"; and real players later: every figure an actor driven by state). crew65.js: the front for crews.js from the sectors at work; the
// crews' stroke phase on the act's beat. crews.js: setFront (where, how many — a floor), beat (the diggers in step). har42.js: no stage-made
// figures at the sectors, behind the thing or at the hammer under ON65; four crews on the Mount, three at the wall. GAME_BUILD 65. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CREW65, active65, front65, beatU65 } from '../src/game/crew65.js';
import { SECT62, crewSec62, MOUNT62 } from '../src/game/har62.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js'), C = read('src/crews.js');
const ROCKS = [{ x: -42, z: -26 }, { x: -42, z: -66 }, { x: -42, z: 14 }];
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 65: GAME_BUILD 65; the sectors at work — his rocks while they stand, the crews\' sectors between their start and their end, never more than four; none left: the first rock\'s, waiting', () => {
  assert.equal(GAME_BUILD, 73);
  const none = () => false;
  const a0 = active65(SECT62, MOUNT62.open, none, crewSec62);
  assert.deepEqual(a0.map((a) => a.rock), [0, 1, 2], 'at the opening: his three rocks, no crew sector yet');
  const a1 = active65(SECT62, 0.33, none, crewSec62);
  assert.ok(a1.length === 4 && a1[3].rock === -1 && a1[3].i === 3, `at 0.33 the crews bring down sector 3 too: ${JSON.stringify(a1)}`);
  const a2 = active65(SECT62, 0.33, (w) => w === 'hammer0', crewSec62);
  assert.deepEqual(a2.map((a) => a.rock), [1, 2, -1], 'rock 0 hammered: gone from the front');
  const a3 = active65(SECT62, 0.8, () => true, crewSec62);
  assert.equal(a3.length, 1); assert.ok(a3[0].idle && SECT62[a3[0].i].his === 0, 'all done: the crews wait by his first rock');
  for (const p of [0.15, 0.3, 0.42, 0.5, 0.6, 0.75]) assert.ok(active65(SECT62, p, none, crewSec62).length <= CREW65.maxSec);
});

test('build 65: the front — two stands at each place facing it (a rock at its flanks, a sector on its south), the rubble east to the pile, the foreman and the way in from the first place; a key that names the places', () => {
  const F = front65(SECT62, ROCKS, MOUNT62.open, () => false, crewSec62);
  assert.equal(F.stand.length, 6);
  for (let k = 0; k < 6; k++) { const S = F.stand[k], r = ROCKS[k >> 1]; assert.ok(near(Math.hypot(S[0] - r.x, S[1] - r.z), CREW65.rockR, 0.11), `stand ${k} at the rock's flank`); assert.deepEqual([S[2], S[3]], [r.x, r.z]); }
  assert.deepEqual(F.drop, [ROCKS[0].x + 5, ROCKS[0].z - 4]); assert.deepEqual(F.boss, [ROCKS[0].x + 12, ROCKS[0].z - 2]); assert.ok(F.pile[0] > F.drop[0] + 20, 'the pile east, downhill'); assert.equal(F.key, '0,1,2');
  const G = front65(SECT62, ROCKS, 0.33, (w) => w === 'hammer0' || w === 'hammer1', crewSec62);
  assert.equal(G.key, '2,3'); const s3 = SECT62[3]; assert.ok(G.stand.slice(2).every((S) => S[3] === s3.z && Math.abs(S[2] - s3.x) < 1e-9 && S[1] > s3.z), 'the sector\'s stands south of it, facing it');
  const W = front65(SECT62, ROCKS, 0.9, () => true, crewSec62); assert.equal(W.key, '0w'); assert.equal(W.stand.length, 2);
});

test('build 65: the crews\' stroke phase on the act\'s beat — the blow (0.66) at the act\'s phase 0; always 0…1', () => {
  assert.ok(near(beatU65(0), 0.66)); assert.ok(near(beatU65(0.34), 0)); assert.ok(near(beatU65(0.5), 0.16)); assert.ok(near(beatU65(0.9), 0.56));
  for (let i = 0; i <= 20; i++) { const u = beatU65(i / 20); assert.ok(u >= 0 && u < 1); }
});

test('build 65 crews.js: setFront (the stands, the rubble\'s way, the foreman, the way in; a floor under setCrews), beat (one period for the site\'s diggers), the api', () => {
  assert.match(C, /function setFront\(id, L, n\)/); assert.match(C, /s\.front65 = L && Array\.isArray\(L\.stand\) && L\.stand\.length \? L : null;/);
  assert.match(C, /const want = clamp\(Math\.max\(Math\.floor\(\+n \|\| 0\), s\.pin65 \| 0\), 0, 4\)/);
  assert.match(C, /if \(s\.front65\) \{\n      const F = s\.front65, n = F\.stand\.length;/); assert.match(C, /harL\.bay = false; s\.bould = F\.key \|\| 'front';/);
  assert.match(C, /function beat\(id, per, u0\)/); assert.match(C, /s\.tempo\.per = per; s\.tempo\.t0 = T - \(u0 \|\| 0\) \* per;/);
  assert.match(C, /const per = tp && tp\.per > 0 && role === 'digger' \? tp\.per : fine/); assert.match(C, /\(\(\(T - tp\.t0\) \/ per\) % 1 \+ 1\) % 1/);
  assert.match(C, /setCrews, setQuarry, caravan, trainees, cheer, update, reset, setFront, beat,/);
});

test('build 65 har42: wired — ON65; the front from the sectors every 0.6 s and at the start; four crews on the Mount, three at the wall; no stage-made crews at the sectors, behind the thing, or at the hammer; the hammer\'s beat to the crews', () => {
  assert.match(H, /const ON65 = MODE === 'stage' && \(ON62 \|\| STG === 'wall'( \|\| ON73)?\) && qs\('h65'\) !== '0';/);
  assert.match(H, /import \{ CREW65, front65, beatU65 \} from '\.\/crew65\.js';/);
  assert.match(H, /function front65Sync\(\) \{/); assert.match(H, /F = front65\(SECT62, PL\.rock, p, past63, crewSec62\);/); assert.match(H, /st\.front65 = F; C\.setFront\('har', F, CREW65\.crews\);/);
  assert.match(H, /sectDrape62\(\); front65Sync\(\); \}/);
  assert.match(H, /if \(ON65\) \{ st\.front65 = null; front65Sync\(\); if \(STG === 'wall'\) \{ const C = crews65\(\); if \(C && C\.setFront\) C\.setFront\('wall', null, CREW65\.wall\); \} \}/);
  assert.match(H, /\(ON65 \? \[\] : ON62 \? SECT62\.filter/); assert.match(H, /if \(ON65\) L\.noAct = true; else \{ L\.act = crew53\(9\);/);
  assert.match(H, /if \(st\.props\.root && !ON65\) for \(let w = 0; w < 3; w\+\+\) \{ const m = worker53\(30 \+ w\)/);
  assert.match(H, /if \(ON65\) \{ const C = crews65\(\); if \(C && C\.beat\) C\.beat\('har', s\.beat, beatU65\(ph\)\); \}/);
  assert.match(H, /if \(ON65\) \{ const C = crews65\(\); if \(C && C\.beat\) C\.beat\('har', 0\); \}/);
  assert.equal(CREW65.crews, 4); assert.equal(CREW65.wall, 3);
});

test('build 65: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/crew65.js', 'src/crews.js', 'src/game/har42.js', 'test/build65.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
