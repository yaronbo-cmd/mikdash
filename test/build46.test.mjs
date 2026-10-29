// ── fable32 (build 46) ── (A) his stones ARE the court wall: the stretch kept and standing for good, the model's skin and the scaffold not drawn
// there; (B) stage 03, הסורג והחיל (docs/specs/shlav-alef-v2-he.md §10 "03", §3 the lattice): taps alone never finish a lattice or the spacing;
// the pattern rule (it runs on across the panels; the right shape the right way, else a mistake, never corrected); the spacing's grade; the
// prostrations — no grade, no haptics; the wiring; the yard's new variants; GAME_BUILD 46. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import * as F from '../src/game/fam42.js';
import { PARTS46, LINE42, SRC46, FIND46, YARD44, wallStones45, hole45, hole46 } from '../src/game/har42.js';
import { XRAY } from '../src/batch.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const seeded = (s) => { let a = s * 9301 + 49297; return () => ((a = (a * 9301 + 49297) % 233280) / 233280); };

test('build 46: TAPS ALONE NEVER FINISH a lattice or the spacing — a hundred taps and double taps, and "set" without walking', () => {
  for (const kind of ['diamonds', 'interlaced', 'twotone']) {
    const J = F.createLattice46(kind, 1, { rnd: seeded(3) });
    for (let k = 0; k < 100; k++) { const i = k % 3; J.tap(i); if (k % 4 === 0) J.flip(i); assert.equal(J.drop(i, { dragPx: k % 23, onSlot: true }), 'tap'); }
    assert.equal(J.state().done, false, kind); assert.equal(J.state().mistakes, 0, 'a tap is never a try');
    assert.equal(J.drop(0, { dragPx: 60, onSlot: false }), 'off', 'a drag that misses the gap sets nothing');
  }
  const S = F.createSpacing46(1); for (let k = 0; k < 100; k++) assert.equal(S.set(), 'near'); assert.equal(S.state().done, false); assert.equal(S.state().stones.length, 0);
});

test('build 46: the pattern rule — the gap wants the tile the way the pattern runs, across the panels; the right shape the wrong way is a mistake (no auto-correct); the levels', () => {
  // the diamonds: "/" and "\" alternate like a chessboard; the column counts from the stretch's start (panel 1's column 0 is the 8th)
  assert.ok(F.same46(F.tile46('diag', 0, 0), F.tile46('diag', 2, 0)), '"/" turned twice is "/"');
  assert.ok(F.same46(F.tile46('diag', 1, 0), F.tile46('diag', 0, 1)), 'a quarter turn of "/" is its mirror: "\\"');
  assert.notDeepEqual(F.want46('diamonds', 8, 0), F.want46('diamonds', 7, 0), 'the next panel runs on from the one before');
  const J = F.createLattice46('twotone', 2, { rnd: seeded(11), col0: 8, slot: { c: 0, r: 1 } }), s = J.state(), i = s.tray.findIndex((p) => p.type === 'flag');
  assert.deepEqual(s.need, F.tile46('flag', 8 & 3, 1), 'two tones: a quarter turn a column, a flip a row');
  const odd = s.tray.findIndex((p) => p.type !== 'flag'); assert.equal(J.drop(odd, { dragPx: 60, onSlot: true }), 'wrong'); assert.equal(s.mistakes, 1, 'another shape: a mistake');
  let guard = 0; while (F.same46(F.tile46('flag', s.tray[i].r, s.tray[i].f), s.need) && guard++ < 3) J.tap(i);
  assert.equal(J.drop(i, { dragPx: 60, onSlot: true }), 'wrong', 'the right shape the wrong way: a mistake, and it stays as it was');
  for (let f = 0; f < 2 && !s.done; f++) { for (let r = 0; r < 4 && !s.done; r++) { if (F.same46(F.tile46('flag', s.tray[i].r, s.tray[i].f), s.need)) J.drop(i, { dragPx: 60, onSlot: true }); else J.tap(i); } if (!s.done) J.flip(i); }
  assert.equal(s.done, true); assert.notEqual(J.result().rating, 'mehudar', 'two mistakes');
  const C = F.createLattice46('diamonds', 1, { rnd: seeded(5) }), c = C.state(), ci = c.tray.findIndex((p) => p.type === 'diag');
  if (!F.same46(F.tile46('diag', c.tray[ci].r, c.tray[ci].f), c.need)) C.tap(ci); assert.equal(C.drop(ci, { dragPx: 60, onSlot: true }), 'ok'); assert.equal(C.result().rating, 'mehudar', 'the fewest turns, no mistake');
  assert.ok(F.LAT46.extra[4] < F.LAT46.extra[1], 'the levels: fewer spare turns');
  assert.deepEqual(Object.keys(F.LAT46.kinds), ['diamonds', 'interlaced', 'twotone'], 'harder panel by panel');
});

test('build 46: the warning stones — the real gaps against the even ones; within 8 % מהודר, 18 % כשר, more טעון תיקון; a stone near a post or another is refused', () => {
  const run = (xs, L = 1) => { const S = F.createSpacing46(L); for (const x of xs) { S.walk(x - S.state().x); S.set(); } return S; };
  assert.equal(run([9, 18, 27]).result().rating, 'mehudar');
  assert.equal(run([9, 19.4, 27]).result().rating, 'kasher');
  assert.equal(run([6, 18, 30]).result().rating, 'tikkun');
  const S = F.createSpacing46(1); S.walk(9); S.set(); S.walk(0.6); assert.equal(S.set(), 'near'); assert.equal(S.state().refused, 1);
  assert.deepEqual(F.createSpacing46(3).ideal(), [7.2, 14.4, 21.6, 28.8], 'level 3: four stones');
});

test('build 46: (A) his stones stand in the wall for good — rebuilt from the save, the model\'s skin and the scaffold not drawn there; the stage keeps them as laid', () => {
  const sc = new THREE.Scene(), list = [[3.5, 0.96, 1.2, -100, 7.5, -72.94, 1], [2.3, 0.96, 1.2, -96, 7.5, -72.94, 0], [6, 1.8, 2, -108, 6.9, -72.54, 1]];
  const hole = [-111.05, -86.95, -73.62, -71.4, -80, 11, -104.95, 7.86, 5.98];
  const g = wallStones45({ scene: sc, list, hole }); assert.ok(g && g.parent === sc); assert.equal(g.children.length, 3);
  assert.deepEqual(g.children.map((c) => c.userData.his), [1, 0, 1]); assert.deepEqual(g.children[0].position.toArray(), [-100, 7.5, -72.94]);
  assert.equal(XRAY.uHole.value.x, -111.05); assert.equal(XRAY.uHole2.value.y, 11); assert.equal(XRAY.uHole3.value.x, 5.98);
  wallStones45({ scene: sc, list }); assert.equal(sc.children.filter((c) => c.name === 'wall45').length, 1, 'one stretch, never two');
  hole45(false); assert.equal(XRAY.uHole.value.y, 0); hole46(true, [-104, -94, -92.4, -90.6]); assert.equal(XRAY.uHoleB.value.x, -104); hole46(false); assert.equal(XRAY.uHoleB.value.y, 0);
  const b = read('src/batch.js'); assert.match(b, /if \(uHole\.y > uHole\.x && vXrW\.x > uHole\.x && vXrW\.x < uHole\.y/); assert.match(read('src/stages.js'), /woodMat\.onBeforeCompile = \(sh\) => \{ const x = xrayCode\(/, 'the scaffold patched too');
  const h = read('src/game/har42.js');
  assert.match(h, /course: \{ x: base\.x \+ 2, y: 6, z: -72\.94 \}/, 'the stretch in the north face, over the Chel\'s terrace (y 6)');
  assert.match(h, /R\.stones = stones45\(\); R\.hole = H45\(\); save42\(S\); wallStones45\(/, 'kept at the reveal and standing');
  assert.match(h, /m\.userData\.his = 1; laid\.push\(m\)/); assert.match(h, /const cm = cornerM\(dir, 1\.5 \+ nn \* 1\.0\); cm\.userData\.his = 1;/);   // (build 53: nn — the course's height; stage 02's as it was)
  assert.match(h, /LINE42\.mine\.split/); assert.match(LINE42.mine, /האבנים שלך · טיוטה/);
  assert.match(read('src/game/index.js'), /ensureWall45\(\);/);
});

test('build 46: the stage — its parts, lines and sources, the find on the card, no grade and no haptics in the prostrations, the wiring; the yard; GAME_BUILD 46', () => {
  assert.deepEqual([...PARTS46], ['open', 'lattice0', 'lattice1', 'lattice2', 'warn', 'bows', 'reveal']);
  assert.equal(LINE42.bows.split(' · ')[0], 'משתחווים מול המקדש — הודיה על הניצחון על היוונים'); assert.match(LINE42.bows, /מדות ב, ג · ברטנורא שם · טיוטה/);
  assert.match(LINE42.warn, /יוספוס, מלחמות ה 193–194 · המחשה/); assert.match(LINE42.lattice, /מדות ב, ג · טיוטה/);
  assert.ok(SRC46.some((x) => /שלש עשרה השתחויות/.test(x))); assert.match(FIND46, /1871/);
  const h = read('src/game/har42.js'), bows = h.slice(h.indexOf('function mkBows()'), h.indexOf('/* ── build 45 ── the LINE'));
  assert.ok(bows.length > 500); assert.ok(!/buzz42\(/.test(bows), 'no haptics during the bows'); assert.ok(!/grade\(/.test(bows), 'not a skill: no grade');
  assert.match(h, /objPlace\(!s\.done, \[\{ x: h\.x, y: h\.y \+ 1\.2, z: h\.z, r: 1\.6 \}\], 'h46warn'(, \[|\);)/,   /* (build 54: + the stretch as the camera's thing) */ 'the walk\'s surface on for a finger (K46-P: only the bot\'s events reached it)'); assert.match(bows, /objPlace\(M\.phase !== 'end'/); assert.match(h, /if \(st\.job && st\.job\.fullPad\) \{ if \(st\.t40\) st\.t40\.place\(false\);/, 'the walk and the bows on the whole screen (K46-dbg: touch40 had boxed the pad round the thing)'); assert.match(bows, /acting: true, fullPad: true, kind: 'bows'/); assert.match(h, /const stop = \(walkDir < 0 && h\.x <= A\.x \+ 0\.05\) \|\| \(walkDir > 0 && h\.x >= A\.x \+ len - 0\.05\);/, 'the stretch\'s ends stop him (K46-S)');
  assert.match(h, /const STG = o\.stage === 'wall' \? 'wall' : o\.stage === 'soreg' \? 'soreg' : o\.stage === 'gates' \? 'gates' : o\.stage === 'nashim' \? 'nashim' : o\.stage === 'nikanor' \? 'nikanor' : o\.stage === 'lishka' \? 'lishka' : (?:o\.stage === 'yesod' \? 'yesod' : )?'har';/);   // (build 49: and stage 06's; build 50: 07's)
  for (const k of ['lattice0', 'lattice1', 'lattice2', 'warn', 'bows']) assert.match(h, new RegExp(`(\\n    |\\} \\}, )${k}: \\{ begin\\(\\) \\{ st\\.job = mk`), k);
  assert.match(h, /SG46 = \{ x: -23, z: 0, x0: -211, x1: 165, z0: -91\.5, z1: 91\.5 \}/, 'the soreg\'s line (temple.js)');
  const cost = F.MAT42.cost; assert.ok(cost.lattice * 3 + cost.warnst > F.MAT42.daily, 'beyond a morning: "מחר" in normal play');
  const g = read('src/game/index.js'); assert.match(g, /else if \(wanted46\(\)\) startHar46\(\);/); assert.match(g, /\(soreg46=0\|stick=1\|har42=0\)/); assert.match(g, /complete: \(\) => \{ const out = S\.completeStage\(G, 'sorag'\);/); assert.match(g, /h46go=1/);
  assert.deepEqual(YARD44.slice(9, 11).map((v) => v.part), ['lattice', 'warn']);   // (build 47: then stage 04's)
  assert.equal(GAME_BUILD, 55);   // (build 47: the constant moved on) (build 48: again) (build 49: again) (build 50: again) (build 51: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/batch.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
