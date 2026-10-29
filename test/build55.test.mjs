// ── build 55 ── stage 08, היסוד, and the craftsman's test before chapter ג׳ (docs/specs/shlav-alef-08-16-he.md §1, §2, §3 "08", §5 — the
// owner's approval 29.10 12:18): the stone on the bench (turned ↔, wiped, felt along its edge, seen against the light — kasher ➡ "למזבח",
// pasul ⬅ "לא למזבח"), the field stones (no snapping; fill stones from a heap in the world), the last row only where there is a yesod
// (מדות ג, א); stage 05's wood piles turned to kasher ➡ / pasul ⬅ (rule 13); the lines a verb and an arrow; GAME_BUILD 55. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS55, ALT55, VIEW55, SRC55, LINE42, TEST50 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⟳⟲∙!—]/g, ' ').split(/\s+/).filter((w) => w && !/^[←-⇿⬀-⯿]$/.test(w)).length;

test('build 55: GAME_BUILD 55; stage 08\'s parts in the spec\'s order; the altar 32 × 32 where the world has it', () => {
  assert.equal(GAME_BUILD, 55);
  assert.deepEqual([...PARTS55], ['open', 'inspect', 'field', 'nail', 'iron', 'last', 'reveal']);
  assert.deepEqual({ ...ALT55 }, { x0: -54, z0: -19.5, side: 32 });
  assert.match(read('src/stages.js'), /yesod: \{\n\s+foot: \[\[-54, -19\.5, -22, 12\.5\]\]/, 'the world\'s yesod footprint');
  assert.ok(SRC55.some((s) => /בית כרם/.test(s)) && SRC55.some((s) => /אוכל בדרום אמה אחת/.test(s)));
});

test('build 55: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); kasher ➡ pasul ⬅ (rule 13)', () => {
  for (const k of ['stone55', 'mud55', 'nail55', 'slow55', 'caught55', 'smooth55', 'iron55', 'field55', 'fieldTurn55', 'fieldOther55', 'fieldGap55', 'last55', 'noYesod55']) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⟳⟲]/.test(head(LINE42[k])) || /כאן אין/.test(head(LINE42[k])), `${k}: an arrow`);
  }
  assert.equal(head(LINE42.stone55), 'סובבו ↔ ∙ כשר ➡ פסול ⬅');
  assert.equal(head(LINE42.nail55), 'העבירו אצבע לאט ↔');
  assert.equal(head(LINE42.slow55), 'לאט — כדי להרגיש ↔');
  assert.equal(head(LINE42.noYesod55), 'כאן אין יסוד');
  assert.match(LINE42.ironWhy55, /^האבן שלמה\. אבל ברזל נגע בה\./);
  assert.ok(!/ · /.test(head(LINE42.wood)) && /כשר ➡ פסול ⬅/.test(head(LINE42.wood)), 'stage 05\'s wood line: kasher ➡ pasul ⬅ in its head');
});

test('build 55: stage 05\'s wood — the "למערכה" pile on the right, "לא למזבח" on the left (rule 13; it stood on the left)', () => {
  assert.match(H, /return \{ altar: \{ x: W\(\) - zw - 12, y, w: zw, h: zh \}, out: \{ x: 12, y, w: zw, h: zh \} \};/);
  assert.match(H, /\['altar', Z\.altar, 'למערכה ➡', 'rgba\(90,150,70,\.78\)'\], \['out', Z\.out, '⬅ לא למזבח'/);
});

test('build 55: the stone — four faces, the defect on one; level 1 a crack in view or one turn away and a decoy mud; the wipe; the verdicts', () => {
  const s = F.createStone55('crack', seq(0.3, 0.5, 0.5, 0.5, 0.5), 1), k = s.state();
  assert.ok(k.at.face === 0 || k.at.face === 1, 'level 1: in view or one turn away'); assert.equal(k.mud, (k.at.face + 2) % 4, 'the decoy opposite');
  while (k.face !== k.at.face) s.turn(1); assert.equal(s.shows(), 'crack');
  assert.equal(s.decide(true, 5), 'tap', 'a tap never decides'); assert.equal(s.decide(false, 60), 'ok'); assert.equal(s.decide(true, 60), 'done');
  const m = F.createStone55('mud', seq(0.6), 2), km = m.state(); while (km.face !== km.mud) m.turn(-1);
  assert.equal(m.shows(), 'mud'); assert.equal(m.wipe(0.5), 'wiping'); assert.equal(m.wipe(0.6), 'wiped'); assert.equal(m.shows(), null, 'the mud gone: a whole face');
  assert.equal(m.decide(false, 60), 'waste', 'a good stone rejected: כשר');
  const mc = F.createStone55('mudcrack', seq(0.6), 2), kc = mc.state(); while (kc.face !== kc.at.face) mc.turn(1);
  assert.equal(mc.shows(), 'mud'); mc.wipe(1); assert.equal(mc.shows(), 'crack', 'under the mud — a crack'); assert.equal(mc.decide(true, 60), 'bad');
  const ir = F.createStone55('iron', seq(0.6), 2); assert.equal(ir.state().mud, -1, 'the iron stone: perfect, no mud'); assert.equal(ir.state().bad, true);
  assert.equal(F.stoneGrade55(['ok', 'ok']), 1); assert.equal(F.stoneGrade55(['ok', 'waste']), 0.65); assert.equal(F.stoneGrade55(['bad', 'ok']), 0.3);
  assert.deepEqual([...F.BAG55[1]], ['crack', 'mud', 'whole'], 'level 1: a crack, a mud stain, a whole stone');
  assert.ok(F.BAG55.iron.includes('iron') && !F.BAG55[2].includes('iron'), 'iron in the pool only after the twist');
});

test('build 55: the fingernail — slow along the edge it catches at the nick; too fast: "לאט"; a clean edge felt whole', () => {
  const n = F.createNail55(true, seq(0.5), 2), k = n.state(), v = F.NAIL55.vmax[2];
  assert.equal(n.slide(0, 0.4, 0.4 / (v * 2)), 'fast', 'too fast: nothing felt'); assert.equal(k.caught, false);
  let r = 'ok', u = 0; while (r === 'ok' && u < 1) { r = n.slide(u, u + 0.05, 0.05 / (v * 0.6)); u += 0.05; }
  assert.equal(r, 'caught'); assert.ok(Math.abs(u - k.nick) < 0.12, 'caught at the nick');
  assert.equal(n.decide(false, 60), 'ok', 'a nick: pasul ⬅');
  const c = F.createNail55(false, seq(0.5), 2); for (let x = 0; x < 1; x += 0.05) assert.equal(c.slide(x, x + 0.05, 0.1), 'ok');
  assert.ok(c.felt() >= 0.95); assert.equal(c.decide(true, 60), 'ok', 'a clean edge: kasher ➡');
});

test('build 55: the field stones — no snapping: tight, a sliver (a fill stone closes it), or not in; the grade by the fills', () => {
  const f = F.createField55(3, seq(0.1, 0.7, 0.3, 0.5, 0.9, 0.2), 1), k = f.state();
  assert.equal(k.gaps.length, 3); assert.ok(k.gaps.every((G) => G.rot >= 1 && G.rot <= 3), 'every gap wants a turn'); assert.deepEqual(k.stones.map((s) => s.shape).sort(), k.gaps.map((G) => G.shape).sort());
  const g0 = k.gaps[0], i0 = k.stones.findIndex((s) => s.shape === g0.shape);
  assert.equal(f.drop(i0, 0, 0.1), 'nofit', 'unturned: not in'); while (k.stones[i0].rot !== g0.rot) f.rotate(i0);
  assert.equal(f.drop(i0, 0, F.FIELD55.tight[1] + 0.1), 'gap', 'a little off: a sliver open'); assert.equal(f.fill(0), 'filled'); assert.equal(f.fill(0), 'extra', 'no sliver there');
  for (const g of [1, 2]) { const G = k.gaps[g], i = k.stones.findIndex((s) => s.shape === G.shape); while (k.stones[i].rot !== G.rot) f.rotate(i); assert.equal(f.drop(i, g, 0.05), 'tight'); }
  assert.equal(k.done, true); assert.equal(k.q, 0.65, 'two fills: כשר');
  assert.equal(F.SHAPES55.length, 4);
});

test('build 55: the last row — only along the north and the west, and one amah into the south and the east (מדות ג, א); "כאן אין יסוד", no penalty', () => {
  const l = F.createLast55(2), k = l.state();
  assert.deepEqual(l.open().map((s) => s.id), ['n3', 'n4', 'w3', 'w4', 's1', 'e1']);
  assert.equal(l.drop(16, 31.6).r, 'noyesod', 'the south\'s middle: no yesod'); assert.equal(l.drop(31.6, 20).r, 'noyesod', 'the east\'s middle');
  assert.equal(l.drop(31.6, 5).r, 'noyesod', 'the east, three amot down: none'); assert.equal(k.strays, 3);
  for (const [x, z] of [[20, 0.4], [28, 0.6], [0.5, 21], [0.4, 29], [1.6, 31.4], [31.4, 1.6]]) assert.equal(l.drop(x, z).r, 'set');
  assert.equal(k.done, true); assert.equal(k.q, 0.65, 'strays cost no more than כשר');
  const s1 = F.LAST55.slots.find((s) => s.id === 's1'), e1 = F.LAST55.slots.find((s) => s.id === 'e1'); assert.ok(s1.w === 1 && s1.d === 1 && e1.w === 1 && e1.d === 1, 'one amah each');
});

test('build 55: the craftsman\'s test before chapter ג׳ — the stone with a crack, mud or crack, the fingernail at level 2; pass at כשר; the master after 5', () => {
  assert.deepEqual([...TEST50.jobs], ['stone', 'mud', 'nail']); assert.equal(TEST50.L, 2); assert.equal(TEST50.demoAfter, 5);
  assert.match(H, /const label = t50 \? \{ stone: 'אבן עם סדק', mud: 'בוץ או סדק\?', nail: 'מבחן הציפורן' \}/);
  assert.match(H, /\} else if \(j\.kind === 'stone55'\) \{/, 'the master\'s hand knows the stone');
  assert.match(H, /if \(STG === 'yesod' \|\| MODE === 'test'\) props55\(add\);/, 'the test has its bench');
  assert.match(H, /stone: \{ begin\(\) \{ st\.job = mkStone55\('look', mix55\(\['crack', 'whole'\]\), Lover \|\| 2, 'stone'\); \} \},/);
  assert.match(H, /mud: \{ begin\(\) \{ st\.job = mkStone55\('look', mix55\(\['mud', 'mudcrack'\]\), Lover \|\| 2, 'mud'\); \} \},/);
});

test('build 55: the views — the stone 45 % of the width from the south (him behind the camera), the edge 66 %, the course half; the touch in the world', () => {
  assert.equal(VIEW55.stone, 0.45); assert.ok(VIEW55.edge >= 0.6); assert.ok(VIEW55.course >= 0.4);
  assert.match(H, /const D = 1\.8 \/ \(2 \* VIEW55\.stone \* t2\); return \{ p: \[B\.x, y0 \+ 1\.6 \+ D \* 0\.32, B\.z \+ D\]/);
  assert.match(H, /inspect: A\(-11\.5, -18\), nail: A\(-11\.5, -18\), iron: A\(-11\.5, -18\)/, 'his stand south of the bench — behind the macro\'s camera');
  assert.doesNotMatch(H.slice(H.indexOf('function mkField55('), H.indexOf('function mkLast55(')), /×\d|⟳ ×/, 'no "×3" buttons — the stones and the fill heap in the world');
  assert.match(H, /\['altar', 1\.75\], \['out', -1\.75\]\]\) \{ const g2 = new THREE\.Group\(\);/, 'the two heaps by the stone: למזבח right, לא למזבח left');
});

test('build 55: the wiring — stage 08 after chapter ג׳\'s test; the fixture ?h55go=1; the old yesod flow behind ?yesod55=0', () => {
  const g = read('src/game/index.js');
  assert.match(g, /function wanted55\(\)/); assert.match(g, /function startHar55\(\)/); assert.match(g, /stage: 'yesod', stages:/);
  assert.match(g, /if \(mode === 'test' && test === 50 && done\) \{[^\n]*if \(wanted55\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar55\(\); \}, 400\);/);
  assert.match(g, /else if \(wanted55\(\)\) startHar55\(\);/); assert.match(g, /\[\?&\]h55go=1/); assert.match(g, /yesod55=0\|stick=1\|har42=0/);
  assert.match(g, /complete: \(\) => \{ const out = S\.completeStage\(G, 'yesod'\);/);
});

test('build 55: the tools — the autoplayer and the naive kid know the stone, the field and the last row', () => {
  const a = read('tools/auto42.js'), k = read('tools/kid34/kidmodes.cjs');
  for (const f of ['stone55', 'field55', 'last55']) { assert.match(a, new RegExp(`async function ${f}\\(\\)`)); assert.match(k, new RegExp(`async function ${f}k\\(K\\)`)); }
  assert.match(k, /סובבו ↔ ∙ כשר\|נגבו את הבוץ/); assert.match(k, /רק על היסוד\|כאן אין יסוד/);
});
