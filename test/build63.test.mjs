// ── build 63 ── the building loop of stages 01 and 02 (docs/specs/shlav-alef-olam-he.md §4; the owner, 30.10: "בחירה בין מס' עבודות
// במקביל — בהחלט כן"). site63.js: each stage's works in the structure's own order, the works open now (2–5), the share by how many are
// done, the result shot. har42.js: after each work the shot, then the site (gold beacons, the names to tap); stage 02 begun where stage 01
// left him, the glide to the wall. GAME_BUILD 63. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, SITE63, open63, migrate63, shareAt63, shotView63, LINE63 } from '../src/game/site63.js';
import { PARTS62, MOUNT62, mount62 } from '../src/game/har62.js';
import { PARTS45 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js'), A = read('tools/auto42.js');
const WORKS = (parts) => parts.filter((p) => p !== 'open' && p !== 'reveal');

test('build 63: GAME_BUILD 63; every work of stages 01 and 02 has its place in the order, and the old order is one way through it', () => {
  assert.equal(GAME_BUILD, 69);
  for (const [stg, parts] of [['har', PARTS62], ['wall', PARTS45]]) {
    assert.deepEqual(Object.keys(DEP63[stg]).sort(), WORKS(parts).sort(), stg);
    for (const [w, need] of Object.entries(DEP63[stg])) for (const q of need) assert.ok(parts.indexOf(q) < parts.indexOf(w), `${stg}: ${w} needs ${q}, which comes before it`);
  }
});

test('build 63: what is open — the first work alone; then side by side (stage 01: four after the rope); never more than five; the reveal last', () => {
  assert.deepEqual(open63('har', PARTS62, []), ['rope']); assert.deepEqual(open63('wall', PARTS45, []), ['line']);
  assert.deepEqual(open63('har', PARTS62, ['rope']), ['lift', 'rock0', 'rock1', 'rock2']);
  assert.deepEqual(open63('wall', PARTS45, ['line']), ['pulley', 'wcourse0']);
  assert.deepEqual(open63('har', PARTS62, WORKS(PARTS62)), ['reveal']);
  assert.deepEqual(open63('har', PARTS62, WORKS(PARTS62).slice(0, -1)), ['trace']);
  assert.deepEqual(open63('x', PARTS62, []), []);
});

test('build 63: any way he chooses ends at the reveal — the course over the one under it, the paving on a crest brought down, the Mount never back', () => {
  let seed = 63; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (const [stg, parts] of [['har', PARTS62], ['wall', PARTS45]]) {
    let most = 0;
    for (let run = 0; run < 200; run++) {
      const done = []; let last = -1, guard = 0;
      for (;;) {
        const o = open63(stg, parts, done); assert.ok(o.length >= 1 && o.length <= SITE63.max); most = Math.max(most, o.length);
        if (o[0] === 'reveal') break;
        const w = o[Math.floor(rnd() * o.length)];
        for (const q of DEP63[stg][w]) assert.ok(done.includes(q), `${w} before ${q}`);
        if (stg === 'har') { const s = shareAt63(PARTS62, MOUNT62, done.length); assert.ok(s >= last); last = s; if (w === 'roll' || w === 'trace') assert.ok(s >= 0.7, 'on the level fill'); }
        done.push(w); assert.ok(++guard < 40);
      }
      assert.equal(done.length, WORKS(parts).length);
    }
    assert.ok(most >= (stg === 'har' ? 4 : 2), `${stg}: side by side (${most})`);
  }
});

test('build 63: the share by how many works are done — the old order\'s own shares; an old save\'s done works', () => {
  for (let i = 0; i < PARTS62.length; i++) assert.equal(shareAt63(PARTS62, MOUNT62, i), mount62(PARTS62[i]));
  assert.equal(shareAt63(PARTS62, MOUNT62, 99), 1); assert.equal(shareAt63(PARTS62, MOUNT62, -3), MOUNT62.open);
  assert.deepEqual(migrate63(PARTS62, PARTS62.indexOf('rock0')), ['rope', 'lift', 'corner', 'course0', 'course1']);
  assert.deepEqual(migrate63(PARTS45, 0), []); assert.deepEqual(migrate63(PARTS45, 1), []);
});

test('build 63: the result shot — from the act\'s view back and up to what he made, the structure round it in the frame, within 3 s (rule 14)', () => {
  const v0 = { p: [10, 8, 10], t: [0, 1, 0] }, at = { x: 0, y: 1, z: 0 };
  assert.deepEqual(shotView63(v0, at, 0).p.map((v) => Math.round(v * 1e6) / 1e6), v0.p);
  const e = shotView63(v0, at, 1), d0 = Math.hypot(10, 7, 10), d1 = Math.hypot(e.p[0], e.p[1] - 1, e.p[2]);
  assert.ok(d1 >= Math.max(SITE63.minD, d0 * 2) - 1e-6, 'far back'); assert.ok(Math.atan2(e.p[1] - 1, Math.hypot(e.p[0], e.p[2])) >= SITE63.up - 1e-6, 'and up');
  assert.deepEqual(e.t, [0, 1, 0]); assert.ok(e.p[0] > 0 && e.p[2] > 0, 'the same side');
  assert.ok(SITE63.shotT + SITE63.hold <= 3.2);
});

test('build 63: har42 wired — after each work the shot, then the site; the site after the opening; the names to tap; stage 02 begun where 01 ended', () => {
  assert.match(H, /const ON63 = MODE === 'stage' && \(ON62 \|\| STG === 'wall'\) && qs\('h63'\) !== '0'/);
  assert.match(H, /if \(ON63\) \{ shot63\(at63\); return; \} startPart\(R\.part \+ 1\); \}/);
  assert.match(H, /if \(ON63 && \(r === 'site' \|\| r == null\)\) site63\(\); else startPart/);
  assert.match(H, /if \(part === 'shot' \|\| part === 'site'\) \{ frame63\(dt\); return; \}/);
  assert.match(H, /mig63\(\); ui\(\); props\(\);/);
  assert.match(H, /if \(ON63 && R\.site63 && R\.part > 0\) \{ st\.resumeAt = 'site';/);
  assert.match(H, /ON63 && STG === 'wall' && R\.part <= 1 && !R\.open && !qs\('h42at'\) \? on63\(at61\(W61, 'har'\)\)/);
  assert.match(H, /\.h63-chip\{pointer-events:auto;min-height:44px/);
  assert.match(H, /if \(open\.length === 1\) \{ R\.site63 = 0; save42\(S\); startPart\(PARTS\.indexOf\(open\[0\]\)\); return; \}/);
  assert.match(H, /if \(past63\('giant'\)\) st\.props\.stone0\.visible = false;/);
  assert.match(A, /if \(s\.part === 'site'\) \{/);
  assert.match(LINE63.site, /^עבודות פתוחות/);
});

test('build 63: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build63.test.mjs', 'tools/auto42.js']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
