// ── build 71 ── the crews as real people (the owner, 2.11: "נשארנו עם הדמויות האלה או שזה ישתנה בגרסאות הבאות?"): crew71.js draws the crews
// near the camera with the kohen's rigged body (crews.js's people and stages.js's site workers alike), each in his tunic with his head cloth,
// belt and tool; the far ones stay instanced. The pure rules: which men get a real figure, which clip, the blow on the stroke, the tunic, the
// size. The wiring: actors.js and stages.js do not draw a man whose real figure stands for him. GAME_BUILD 71. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const C71 = read('src/crew71.js');
// (crew71.js imports three and the .glb: its pure part is read out of the file and run here)
const pure = C71.slice(C71.indexOf('export const CREW71'), C71.indexOf('export function createCrew71')).replace(/export /g, '');
const M = new Function(`${pure}; return { CREW71, pick71, clip71, strikeT71, tunic71, scale71 };`)();
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 71: GAME_BUILD 71; the pick — the nearest within reach, ahead of the camera, at most n; those standing kept a little farther (no flicker at the edge)', () => {
  assert.equal(GAME_BUILD, 94);
  const { pick71, CREW71: C } = M, cam = { x: 0, y: 0, z: 0, fx: 0, fz: 1 };
  const c = Array.from({ length: 14 }, (_, i) => ({ id: i, x: 0, y: 0, z: 5 + i * 6 }));
  const s = pick71(c, cam, new Set()); assert.equal(s.size, Math.min(C.n, c.filter((p) => p.z <= C.near).length)); assert.ok(s.has(0) && s.has(1));
  assert.equal(pick71([{ id: 'b', x: 0, y: 0, z: -20 }], cam, new Set()).size, 0, 'not behind the camera');
  const edge = { id: 'e', x: 0, y: 0, z: (C.near + C.keep) / 2 }; assert.equal(pick71([edge], cam, new Set()).size, 0); assert.equal(pick71([edge], cam, new Set(['e'])).size, 1, 'kept while within keep');
  assert.ok(C.keep > C.near && C.n >= 6 && C.n <= 12, 'a few real figures, not a hundred');
});

test('build 71: the clip — walking at his pace, the stroke on the blow, sitting, the cheer, else idle; the blow of the clip on crews.js\'s blow; the tunic; the size', () => {
  const { clip71, strikeT71, tunic71, scale71, CREW71: C } = M;
  assert.equal(clip71({ cheer: 1 }, { wk: 0 }).name, 'Cheer'); assert.equal(clip71({}, { kn: 1 }).name, 'Sit_Floor_Idle');
  const wk = clip71({ role: 'carrier' }, { wk: 0.8, path: [[0, 0]], speed: 2.6 }); assert.equal(wk.name, 'Walking_A'); assert.ok(wk.rate >= 0.6 && wk.rate <= 1.6);
  const ch = clip71({ role: 'mason', u71: 0.3 }, { wk: 0 }); assert.equal(ch.name, '2H_Melee_Attack_Chop'); assert.equal(ch.sync, 0.3);
  assert.equal(clip71({ role: 'boss' }, { wk: 0 }).name, 'Idle'); assert.equal(clip71({ role: 'mason' }, { wk: 0 }).name, 'Idle', 'no stroke phase: idle');
  assert.ok(near(strikeT71(C.strikeHit, 0.857, 1.633), 0.857), 'crews.js\'s blow on the clip\'s'); assert.ok(near(strikeT71(C.strikeHit + 0.5, 0.857, 1.633), (0.857 + 0.8165) % 1.633));
  for (const u of [0, 0.2, 0.99]) { const t = strikeT71(u, 0.857, 1.633); assert.ok(t >= 0 && t < 1.633); }
  assert.equal(tunic71(C.tunics[2]), 2); assert.equal(tunic71('#DACCB0'), 0); assert.equal(tunic71('#A58E70'), 2);
  assert.ok(near(scale71(1) * C.modelH / C.model, C.actorH), 'his height the instanced figure\'s');
});

test('build 71: wired — main.js makes it (?h71=0 off); actors.js and stages.js hand the man over (his blob / the stone he carries stay); crews.js gives his stroke\'s phase; the bone\'s name without the dot', () => {
  const MAIN = read('src/main.js'), A = read('src/actors.js'), S = read('src/stages.js'), CR = read('src/crews.js');
  assert.match(MAIN, /import \{ createCrew71 \} from '\.\/crew71\.js';/); assert.match(MAIN, /get\('h71'\) !== '0'\) \{ const c71 = createCrew71\(\{ scene, camera, crews, stages \}\); life\.addUpdater\(c71\.update\);/);
  assert.match(A, /if \(a\.lod71\) \{ if \(blobs\) blobs\.push\([^)]*\); continue; \}/);
  assert.match(S, /if \(w\.lod71\) \{\n        if \(stone\) \{/); assert.match(S, /workers71: \(\) => \(\{ W, n: nWork, on: /);
  assert.match(CR, /w\.u71 = u;/);
  assert.match(C71, /n\.name === 'handslotr' \|\| n\.name === 'handslot\.r'/); assert.match(C71, /const hb = f\.B\.handslotr \|\| f\.B\['handslot\.r'\];/);
  assert.match(C71, /c\.userData\.prop71 = 1; B\.head\.add\(c\);/, 'the head cloth keeps its own colour');
});

test('build 71: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/crew71.js', 'test/build71.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
