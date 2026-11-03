// ── build 66 ── Phase B's kohen for Phase A (the owner, 1.11: "גם הדמויות נראות פחח", "התנועה של הדמות מלאכותית"; path A's third step).
// hero35.js (the rigged glTF: Idle, Walking_A, Running_A by his pace) stands in for the stage's built figure in stage mode, following
// stages.js's hero as in Phase B; his height is the model's; the hammer's tap plays the two-handed chop fitted to the beat, a sledge on
// the hand slot. hero35: height(), clipLen(). GAME_BUILD 66. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { GAIT35, gaitFor } from '../src/avodah/shift/gait35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js'), K = read('src/avodah/shift/hero35.js');

test('build 66: GAME_BUILD 66; hero35 measures his height as loaded and tells a clip\'s length', () => {
  assert.equal(GAME_BUILD, 89);
  assert.match(K, /const bb = new THREE\.Box3\(\)\.setFromObject\(model\); st\.h = bb\.max\.y - bb\.min\.y;/);
  assert.match(K, /height: \(\) => st\.h \|\| 0, clipLen: \(n\) => \(st\.clips\[n\] \? st\.clips\[n\]\.duration : 0\),/);
});

test('build 66 har42: the kohen in stage mode — made at the start (one per page), updated every frame before the cards\' return, his height the frame\'s, ?h66=0 the built figure', () => {
  assert.doesNotMatch(H, /^import .*hero35\.js/m, 'hero35 (and its .glb) never a static import: node runs this file');
  assert.match(H, /const ON66 = MODE === 'stage' && qs\('h66'\) !== '0' && !globalThis\.__SH_NOHERO35;/);
  assert.match(H, /function hero66\(\) \{\n    if \(!ON66 \|\| st\.h35 \|\| st\.h35p\) return st\.h35 \|\| null;/);
  assert.match(H, /const K = globalThis\.__HERO35; if \(K && K\.update && K\.root && K\.root\.parent && !K\.err\) \{ st\.h35 = K; return K; \}/);
  assert.match(H, /st\.h35p = import\('\.\.\/avodah\/shift\/hero35\.js'\)\.then\(\(m\) => \{ if \(!st\.h35\) st\.h35 = m\.createHero35\(\{ scene: sc, S: stages \}\); return st\.h35; \}\)/);
  assert.match(H, /mig63\(\); ui\(\); props\(\);\n    hero66\(\);/);
  assert.match(H, /st\.last = t;\n    if \(st\.h35\) \{ try \{ st\.h35\.update\(dt\); \} catch \(e\) \{ \/\* \*\/ \} \}/);
  assert.match(H, /function heroHeight\(\) \{\n    if \(ON66\) \{ const K = h66\(\), v = K && K\.height \? K\.height\(\) : 0; return v > 2 && v < 12 \? v : 3\.96; \}/);
  assert.match(H, /hero66: \(\) => \(st\.h35 \? \{ \.\.\.st\.h35\.state\(\), h: st\.h35\.height \? \+st\.h35\.height\(\)\.toFixed\(2\) : 0, sledge: !!st\.sledge66 \} : null\), on66: ON66,/);
});

test('build 66 har42: the hammer — his stroke is the kit\'s two-handed chop fitted to the beat, the sledge on the hand slot, gone at the act\'s end', () => {
  assert.match(H, /function chop66\(beat\) \{ const K = h66\(\); if \(!K\) return false; sledge66\(true\); const L2 = K\.clipLen\('2H_Melee_Attack_Chop'\); return K\.play\('2H_Melee_Attack_Chop', \{ once: true, restart: true, speed: L2 > 0 \? Math\.max\(1, L2 \/ Math\.max\(0\.4, \(beat \|\| 0\.95\) \* 0\.9\)\) : 1\.4 \}\); \}/);
  assert.match(H, /if \(h66\(\)\) \{ try \{ const h0 = hero\(\); stages\.hero\.setPos\(h0\.x, h0\.z, Math\.atan2\(c\.x - h0\.x, c\.z - h0\.z\)\); chop66\(J\.state\(\)\.beat\); const m = stages\.hero\.mesh; if \(m\) m\.visible = false; \} catch \(e\) \{ \/\* \*\/ \} \}\n        else \{ try \{ if \(stages\.hero\.act\) stages\.hero\.act\('split', \{ x: c\.x, y: c\.y, z: c\.z \}\); \} catch \(e\) \{ \/\* \*\/ \} \}/, 'with the kohen: turned to the rock, the chop, the built mesh off; without him: the built figure\'s stroke');
  assert.match(H, /const b = K\.bone\('handslotr'\) \|\| K\.bone\('handslot\.r'\) \|\| K\.bone\('handr'\) \|\| K\.bone\('hand\.r'\); if \(!b\) return;/, 'the sanitized name first: GLTFLoader drops the dot');
  assert.match(K, /handR: \(\) => worldOf\(st\.bones\.handslotr \|\| st\.bones\['handslot\.r'\] \|\| st\.bones\.handr \|\| st\.bones\['hand\.r'\]\)/);
  assert.match(H, /st\.hk62 = null; sledge66\(false\); if \(ON65\)/);
  assert.match(H, /view\(\) \{ const c = strikeAt\(\), h = hero\(\), k = ON66 \? 0\.3 : 0; return \{ p: \[c\.x \+ 20, c\.y \+ 15, c\.z \+ 27\], t: \[c\.x - 1 \+ \(h\.x - c\.x\) \* k, c\.y \+ 1, c\.z - 2 \+ \(h\.z - c\.z\) \* k\] \}; \}/);
  // the beat 0.95 → the chop no slower than the clip, no faster than the beat's 0.9 share
  for (const [L2, beat] of [[1.2, 0.95], [0.6, 0.95], [1.2, 0.68]]) { const sp = Math.max(1, L2 / Math.max(0.4, beat * 0.9)); assert.ok(sp >= 1 && L2 / sp <= beat * 0.9 + 1e-9, `${L2}/${beat}`); }
});

test('build 66: his gait at Phase A\'s paces — standing Idle, the walk near a place (≤ 5 amot/s) Running_A, the free walk (14) the run at its top rate', () => {
  assert.equal(gaitFor(0).clip, GAIT35.idleClip);
  assert.equal(gaitFor(1.0).clip, GAIT35.walkClip);
  assert.equal(gaitFor(5).clip, GAIT35.runClip);
  const r = gaitFor(14); assert.equal(r.clip, GAIT35.runClip); assert.equal(r.rate, GAIT35.runRates[1]);
});

test('build 66: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/har42.js', 'src/avodah/shift/hero35.js', 'test/build66.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
