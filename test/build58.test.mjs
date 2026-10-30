// ── build 58 ── stage 11, הקרנות (docs/specs/shlav-alef-08-16-he.md §1, §3 "11"): the four horns set square in the altar's corners — a drag,
// two fingers (or the ring) to turn, both faces green, never snapped, the tolerance smaller horn by horn and the fourth with no shadow
// ("מְקוֹם הַקְּרָנוֹת אַמָּה מִזֶּה וְאַמָּה מִזֶּה", מדות ג, א); the two holes on the yesod by the south-west horn found open by a jug's water that
// must not run over (the stream goes on a little after the jug is straightened — מדות ג, ב); the first pyre sorted ➡/⬅ and stacked with air
// between, the fire and its column of smoke rising straight (אבות ה, ה — המחשה); GAME_BUILD 58. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS58, SRC58, LINE42, CORNERS58, HOLES58, TOP58 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⟳⟲⬍⬆⬇∙!—,:]/g, ' ').split(/\s+/).filter((w) => w && !/^[←-⇿⬀-⯿]$/.test(w) && w !== '👆').length;

test('build 58: GAME_BUILD 58; stage 11\'s parts; the quotes exactly as the spec verified them (מדות ג, א; ג, ב; אבות ה, ה)', () => {
  assert.equal(GAME_BUILD, 60);
  assert.deepEqual([...PARTS58], ['open', 'horns', 'holes', 'fire', 'reveal']);
  for (const q of ['מְקוֹם הַקְּרָנוֹת אַמָּה מִזֶּה וְאַמָּה מִזֶּה', 'וּבְקֶרֶן מַעֲרָבִית דְּרוֹמִית הָיוּ שְׁנֵי נְקָבִים, כְּמִין שְׁנֵי חֳטָמִין דַּקִּין', 'וְיוֹצְאִין לְנַחַל קִדְרוֹן', 'וְלֹא נָצְחָה הָרוּחַ אֶת עַמּוּד הֶעָשָׁן']) assert.ok(SRC58.some((s) => s.includes(`"${q}"`)), q);
  assert.ok(SRC58.some((s) => /"מְקוֹם הַקְּרָנוֹת אַמָּה מִזֶּה וְאַמָּה מִזֶּה" — מדות ג, א/.test(s)));
  assert.ok(SRC58.some((s) => /"וְלֹא נָצְחָה הָרוּחַ אֶת עַמּוּד הֶעָשָׁן" — אבות ה, ה · המחשה/.test(s)), 'the smoke — marked המחשה for this moment');
  assert.ok(SRC58.every((s) => /טיוטה|המחשה/.test(s)));
  assert.ok(!/מִכָּאן/.test(H.slice(H.indexOf('export const PARTS58'), H.indexOf('export const PARTS58') + 4000)), 'not "מכאן"');
  assert.match(H, /o\.stage === 'guf' \? 'guf' : o\.stage === 'karnot' \? 'karnot' : (?:o\.stage === 'kiyor' \? 'kiyor' : )?(?:o\.stage === 'ulam' \? 'ulam' : )?'har';/);
  assert.match(H, /STG === 'guf' \? PARTS57 : STG === 'karnot' \? PARTS58 : (?:STG === 'kiyor' \? PARTS59 : )?(?:STG === 'ulam' \? PARTS60 : )?PARTS42;/);
  assert.match(H, /horns: 'fit', holes: 'lift', fire: 'place',/);
});

test('build 58: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); kasher ➡ pasul ⬅ (rule 13); each with its chip', () => {
  for (const k of ['horns58', 'hornTurn58', 'hornMove58', 'hornSet58', 'hornLast58', 'holes58', 'holesSpill58', 'holesGood58', 'holesRefill58', 'pyre58', 'pyreThick58', 'pyreMid58', 'pyreThin58', 'pyreAir58', 'pyreUnfit58', 'pyreWaste58', 'pyreLight58']) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⟳⟲⬍⬆⬇👆]/u.test(head(LINE42[k])), `${k}: an arrow`);
    assert.match(LINE42[k], /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.equal(head(LINE42.horns58), 'גררו לפינה ⤵ ∙ סובבו ⟳');
  assert.equal(head(LINE42.holes58), 'הטו את הכד ⤵ ∙ עצרו בזמן');
  assert.match(head(LINE42.pyre58), /כשר ➡ פסול ⬅/);
  assert.match(LINE42.holesDone58, /"וְיוֹצְאִין לְנַחַל קִדְרוֹן" — מדות ג, ב/); assert.match(LINE42.fire58, /אבות ה, ה · המחשה/);
});

test('build 58: the horns — set where they lie when both faces are flush and square (no snapping); the tolerance shrinks horn by horn; the fourth has no shadow', () => {
  const T = F.HORN58; for (let i = 1; i < 4; i++) { assert.ok(T.tolA[i + 1] < T.tolA[i] && T.tolP[i + 1] < T.tolP[i], `horn ${i + 1} tighter`); }
  assert.deepEqual([...T.shadow].slice(1), [true, true, true, false]);
  const h = F.createHorn58(1, () => 0.3); assert.ok(h.state().u > 1 && Math.abs(h.state().rot) > 10, 'it starts away and turned');
  assert.equal(h.release(), 'turn', 'turned — not set'); h.turn(-h.state().rot + 5); assert.equal(h.release(), 'move', 'square but away — not set');
  h.place(0.6, 0.42); const e = h.edges(); assert.ok(e.a && e.b, 'both faces green'); assert.equal(h.release(), 'set'); assert.equal(h.state().u, 0.6, 'no snapping: it stays as it lies'); assert.equal(h.state().rot, 5);
  assert.equal(h.state().q, 0.65, 'within the tolerance, not within half of it — כשר');
  const g = F.createHorn58(1, () => 0.3); g.turn(-g.state().rot + 90); g.place(0.5, 0.5); assert.equal(g.release(), 'set', 'a quarter turn is square too'); assert.equal(g.state().q, 1);
  const f4 = F.createHorn58(4, () => 0.3); f4.turn(-f4.state().rot + 3.5); f4.place(0.5, 0.5); assert.equal(f4.release(), 'turn', 'the fourth: 3.5° is not square');
  const a = F.createHorn58(2, () => 0.3); a.turn(-a.state().rot); a.place(0.5, 0.9); const ea = a.edges(); assert.ok(!ea.a && ea.b, 'each face on its own: one green, one not');
  assert.equal(F.hornsGrade58([1, 1, 1, 1]), 1); assert.equal(F.hornsGrade58([1, 0.65, 0.65, 0.65]), 0.65);
  assert.equal(CORNERS58.length, 4); assert.deepEqual(CORNERS58.map((c) => c.id), ['se', 'ne', 'nw', 'sw'], 'the south-west last — its holes next'); assert.equal(TOP58, 25);
  assert.match(read('src/temple.js'), /for \(const xa of \[-52, -25\]\) for \(const za of \[-17\.5, 9\.5\]\) A\(xa, 25, za, xa \+ 1, 26, za \+ 1\);/, 'the world\'s horns in the same corners');
  const hj = H.slice(H.indexOf('function mkHorns58('), H.indexOf('function mkHoles58('));
  assert.match(hj, /if \(pts\.size === 2\) \{ mode = 'twist';/, 'two fingers twist it'); assert.match(hj, /mode = d < Math\.max\(36, hornPx\(\) \* 0\.6\) \? 'drag' : d < ringR\(\) \+ 30 \? 'ring' : 'none';/, 'or one finger: the horn to drag, the ring to turn');
  assert.match(hj, /data-edge58=/); assert.match(hj, /if \(J\.shadow && st\.props\.root\)/, 'the shadow only where the level has one');
  assert.match(H, /if \(st\.job && st\.job\.raw\) st\.job\.raw\('down', e\.pointerId, e\.clientX, e\.clientY\);/, 'every finger reaches the job');
});

test('build 58: the two holes — the stream goes on after the jug is straightened; over the rim it runs off; the jug emptied with no spill is מהודר', () => {
  const P = F.createPour58(1), k = P.state(); for (let i = 0; i < 20; i++) P.step(1, 0.05); const s1 = k.s, p1 = k.pool; P.step(0, 0.05); assert.ok(k.s > 0 && k.s < s1, 'straightened — the stream still runs a little'); assert.ok(k.pool >= p1 - 0.02);
  const Q = F.createPour58(2); let sp = 0; for (let i = 0; i < 40; i++) if (Q.step(1, 0.05) === 'spill') sp++; assert.ok(sp >= 1 && Q.state().spills >= 1, 'full tilt — it runs over');
  const G = F.createPour58(1); for (let t = 0; t < 30 && !G.state().done; t += 0.05) G.step(G.safe() - 0.02, 0.05); for (let t = 0; t < 5 && !G.state().done; t += 0.05) G.step(0, 0.05); assert.ok(G.state().done); assert.equal(G.result().rating, 'mehudar', 'at the even stream: no spill');
  assert.ok(Math.abs(G.flowOf(G.safe()) - F.POUR58.drain) < 1e-9, 'level 1\'s mark: the stream the holes take');
  { const Rf = F.createPour58(1); let rf = 0, n = 0; for (let t = 0; t < 40 && !Rf.state().done; t += 0.05) { const r = Rf.step(t % 8 < 4 ? 1 : 0, 0.05); if (r === 'refill') rf++; n++; } assert.ok(rf >= 1 && Rf.state().jug >= 2, 'a jugful that ran over: a fresh jug'); assert.ok(Rf.state().jug <= F.POUR58.jugs); }
  { const Ok = F.createPour58(1); for (let t = 0; t < 30 && !Ok.state().done; t += 0.05) Ok.step(Ok.safe() - 0.02, 0.05); for (let t = 0; t < 5 && !Ok.state().done; t += 0.05) Ok.step(0, 0.05); assert.equal(Ok.state().jug, 1, 'a clean jugful: no second'); }
  assert.ok(F.POUR58.rim[4] < F.POUR58.rim[1] && F.POUR58.tau[4] > F.POUR58.tau[1], 'higher levels: a lower rim, a later stream');
  assert.deepEqual([...HOLES58.a], [-53.55, 17, 12]); assert.deepEqual([...HOLES58.b], [-52.5, 17, 12]);
  assert.match(read('src/places.js'), /holes: \[\[-53\.55, 17, 12\], \[-52\.5, 17, 12\]\]/, 'the world\'s two holes');
  const hj = H.slice(H.indexOf('function mkHoles58('), H.indexOf('const BARK58'));
  assert.match(hj, /up\(\) \{ if \(!drag\) return; drag = false; want = 0;/, 'let go — the jug is straightened'); assert.match(hj, /data-safe58="1"/); assert.match(hj, /data-pool=/);
  assert.match(hj, /return \{ p: \[P\.pool\[0\] \+ 0\.2, 18\.1, P\.pool\[2\] \+ D\], t: \[P\.pool\[0\] \+ 0\.2, 17\.35, P\.pool\[2\]\] \};/, 'low, the jug and the holes in one frame');
});

test('build 58: the first pyre — unfit wood comes back from the pyre, fit wood from the out-pile; three layers in order; the air between each pair; then the fire', () => {
  const Y = F.createPyre58(1, () => 0.5), k = Y.state(); assert.equal(k.logs.length, 8); assert.equal(k.logs.filter((g) => !g.fit).length, 2);
  const ol = k.logs.find((g) => g.kind === 'olive'); assert.equal(Y.toPyre(ol.i, 0, 0), 'unfit'); assert.equal(ol.at, 'pile', 'it comes back');
  const fit = k.logs.find((g) => g.fit); assert.equal(Y.toOut(fit.i), 'waste'); assert.equal(fit.at, 'pile');
  const thin = k.logs.find((g) => g.fit && g.cls === 'thin'); assert.equal(Y.toPyre(thin.i, 0, 0), 'size', 'the thick first');
  assert.equal(Y.light(), 'no', 'not before it is built');
  for (const g of k.logs.filter((x) => !x.fit)) assert.equal(Y.toOut(g.i), 'out');
  const order = F.PYRE58.order; const es = [0.5, 0.5, 0, 0, -0.4, -0.4]; order.forEach((c, n) => { const g = k.logs.find((x) => x.fit && x.at === 'pile' && x.cls === c); assert.equal(Y.toPyre(g.i, es[n], 0), 'laid'); });
  const gp = Y.gaps(); assert.ok(gp[0].wide && gp[1].ok && gp[2].tight, 'too wide, right, too tight');
  assert.equal(Y.light(), 'lit'); assert.ok(Y.result().q < 1);
  const Z = F.createPyre58(1, () => 0.5); assert.equal(Z.state().logs.find((g) => g.fit && g.cls === 'thick') && Z.toPyre(Z.state().logs.find((g) => g.fit && g.cls === 'thick').i, 0.3, 0), 'laid'); assert.equal(Z.state().laid[0].e, 0, 'level 1 forgives a little');
  for (const w of ['olive', 'vine']) assert.equal(F.WOOD58[w].fit, false); for (const w of ['fig', 'walnut', 'pine']) assert.equal(F.WOOD58[w].fit, true);
  assert.match(H, /if \(st\.fire58\) fireFrame58\(dt\);/, 'the fire burns on through the reveal'); assert.match(H, /if \(st\.fire58\) \{ try \{ if \(st\.fire58\.parent\) st\.fire58\.parent\.remove\(st\.fire58\);/, 'and is taken away at the stage\'s end');
  assert.match(H, /p\.position\.set\(Math\.sin\(u \* 7 \+ t \* 0\.3\) \* 0\.15, h, Math\.cos\(u \* 5\) \* 0\.15\);/, 'the smoke rises straight up');
});

test('build 58: the wiring — after stage 10, on resume, the fixture ?h58go=1; the old flow behind ?karnot58=0; the tester\'s menu; the tools', () => {
  const G = read('src/game/index.js');
  assert.match(G, /function wanted58\(\)/); assert.match(G, /function startHar58\(\)/); assert.match(G, /stage: 'karnot'/); assert.match(G, /complete: \(\) => \{ const out = S\.completeStage\(G, 'karnot'\);/);
  assert.match(G, /else if \(wanted58\(\)\) startHar58\(\);/); assert.match(G, /\[\?&\]h58go=1/); assert.match(G, /karnot58=0\|stick=1\|har42=0/);
  assert.match(G, /if \(done && wanted58\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar58\(\); \}, 400\);/, 'stage 11 after stage 10');
  const T = read('src/tester56.js'), ids = [...T.matchAll(/\{ id: '([^']+)', he: '([^']+)', q: '([^']+)'/g)].map((m) => [m[1], m[2], m[3]]);
  assert.deepEqual(ids.map((x) => x[0]).filter((x) => !['12', 't4', '13'].includes(x)), ['01', '02', '03', '04', '05', '06', '06v', '07', 't3', '08', '09', '10', '11', 'B']);   // (build 59: and stage 12's)
  assert.deepEqual(ids.find((x) => x[0] === '11'), ['11', '11 · הקרנות', 'h58go=1&h42stock=99']);
  const A = read('tools/auto42.js'), K = read('tools/kid34/kidmodes.cjs');
  assert.match(A, /else if \(j\.kind === 'horns58'\) await horns58\(\); else if \(j\.kind === 'holes58'\) await holes58\(\); else if \(j\.kind === 'pyre58'\) await pyre58\(\);/);
  for (const f of ['horns58k', 'holes58k', 'pyre58k']) assert.match(K, new RegExp(`async function ${f}\\(K\\)`));
  assert.match(K, /h\.stg === 'karnot' && h\.part === 'done'/); assert.match(K, /await K\.down\(7, [^;]+\); await K\.down\(8,/, 'the kid twists with two fingers too');
  for (const line of [H, read('src/game/fam42.js')].join('\n').split('\n')) { const c = line.indexOf('//'); if (c < 0 || /https?:|'[^']*\/\/|`[^`]*\/\//.test(line)) continue; assert.ok(!/\b(target|frame|view|begin|end|down|up|move|raw): \(/.test(line.slice(c)), `code after a comment: ${line.slice(c, c + 120)}`); }
});

test('build 58: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/tester56.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'test/build58.test.mjs', 'PROJECT.md']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
