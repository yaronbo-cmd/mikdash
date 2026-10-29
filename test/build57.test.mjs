// ── build 57 ── stage 10, גוף המזבח והכבש (docs/specs/shlav-alef-08-16-he.md §1, §3 "10"): what is pasul and what only looks pasul (the
// bench's stone with every tool at hand — mud and moss wipe away, a shell fossil stays and the finger runs over it smooth, natural pits do not
// catch it; level 4 two marks on one stone; each decoy its page in ספר הפגימות), the kevesh rising from the south ("שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב
// שֵׁשׁ עֶשְׂרֵה", מדות ג, ג) laid row by row to an even slope by a straightedge with a bubble (an error carried up), the whitewash with a cloth —
// never iron (מדות ג, ד); every Phase A end card on the right two-thirds, him on the left (§1 rule 12); the tester's menu; GAME_BUILD 57.
// Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS57, SRC57, LINE42, KEV57, SID57V, CARD57 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⟳⟲⬍⬆⬇∙!—,]/g, ' ').split(/\s+/).filter((w) => w && !/^[←-⇿⬀-⯿]$/.test(w) && w !== '👆').length;

test('build 57: GAME_BUILD 57; stage 10\'s parts in the spec\'s order; the Mishnah as the spec has it (מדות ג, ג; ג, ד)', () => {
  assert.equal(GAME_BUILD, 59);
  assert.deepEqual([...PARTS57], ['open', 'decoy', 'kevesh', 'sid', 'reveal']);
  for (const q of ['שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה', 'וּמְלַבְּנִים אוֹתָן פַּעֲמַיִם בַּשָּׁנָה, אַחַת בַּפֶּסַח וְאַחַת בֶּחָג', 'לֹא הָיוּ סָדִין אוֹתָן בְּכָפִיס שֶׁל בַּרְזֶל', 'מְלַבְּנִים אוֹתוֹ בְמַפָּה']) assert.ok(SRC57.some((s) => s.includes(`"${q}"`)), q);
  assert.ok(SRC57.some((s) => /"שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה" — מדות ג, ג/.test(s)));
  assert.ok(SRC57.some((s) => /^רבי: "מְלַבְּנִים אוֹתוֹ בְמַפָּה" — מדות ג, ד/.test(s)));
  assert.ok(SRC57.every((s) => /טיוטה|המחשה/.test(s)));
  assert.match(H, /o\.stage === 'sovev' \? 'sovev' : o\.stage === 'guf' \? 'guf' : (?:o\.stage === 'karnot' \? 'karnot' : )?(?:o\.stage === 'kiyor' \? 'kiyor' : )?'har';/);
  assert.match(H, /STG === 'lishka' \? PARTS50 : STG === 'guf' \? PARTS57 : (?:STG === 'karnot' \? PARTS58 : )?(?:STG === 'kiyor' \? PARTS59 : )?PARTS42;/);
  assert.match(H, /decoy: 'inspect', kevesh: 'place', sid: 'place',/);
});

test('build 57: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); kasher ➡ pasul ⬅ (rule 13); each with its chip', () => {
  for (const k of ['check57', 'wiped57', 'fossil57', 'pits57', 'more57', 'catch57', 'plain57', 'edge57', 'edgeOk57', 'witness57', 'ring57', 'dull57', 'kevesh57', 'keveshUp57', 'keveshDown57', 'keveshEven57', 'keveshOff57', 'keveshCrooked57', 'keveshDrop57', 'sid57', 'sidSlow57', 'sidFast57', 'sidCloth57']) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⟳⟲⬍⬆⬇👆]/u.test(head(LINE42[k])), `${k}: an arrow`);
    assert.match(LINE42[k], /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.equal(head(LINE42.check57), 'בדקו ∙ כשר ➡ פסול ⬅');
  assert.equal(head(LINE42.kevesh57), 'גררו ⤵ ∙ כוונו גובה ⬍');
  assert.equal(head(LINE42.sid57), 'מרחו ↔ — לא לאט מדי');
  for (const k of ['catch57', 'edge57', 'dull57']) assert.match(head(LINE42[k]), /פסול ⬅$/, k);
  for (const k of ['wiped57', 'fossil57', 'pits57']) assert.match(head(LINE42[k]), /כשר ➡$/, k);
  assert.ok(!/כשר|פסול/.test(head(LINE42.more57)) && !/כשר|פסול/.test(head(LINE42.ring57)) && !/כשר|פסול/.test(head(LINE42.edgeOk57)), 'a check that finds nothing gives no verdict (a stone may hide another mark)');
  assert.match(LINE42.sidCloth57, /"לֹא הָיוּ סָדִין אוֹתָן בְּכָפִיס שֶׁל בַּרְזֶל" — מדות ג, ד/);
  assert.match(LINE42.sidDone57, /רבי: "מְלַבְּנִים אוֹתוֹ בְמַפָּה"/);
});

test('build 57: the decoys — mud and moss wipe away; a fossil stays and the finger runs smooth; pits do not catch; a crack catches; the nick on the edge, the deep crack by the mallet', () => {
  const r = () => 0.4;
  const fo = F.createStone57('fossil', r); assert.equal(fo.shows(), 'fossil'); assert.equal(fo.wipe(1), 'clean', 'a fossil does not wipe away'); assert.equal(fo.shows(), 'fossil'); assert.equal(fo.feel(), 'fossil'); assert.equal(fo.state().bad, false); assert.equal(fo.decide(true, 200), 'ok');
  const pi = F.createStone57('pits', r); assert.equal(pi.feel(), 'pits'); assert.equal(pi.state().bad, false); assert.equal(F.createStone57('pits', r).decide(false, 200), 'waste', 'pits thrown out: a good stone lost');
  const mo = F.createStone57('moss', r); assert.equal(mo.shows(), 'moss'); assert.equal(mo.feel(), 'covered'); assert.equal(mo.wipe(1), 'wiped'); assert.equal(mo.shows(), null); assert.equal(mo.feel(), 'plain'); assert.equal(mo.state().bad, false);
  const mu = F.createStone57('mud', r); mu.turn(1); assert.equal(mu.shows(), 'mud'); assert.equal(mu.wipe(1), 'wiped');
  const cr = F.createStone57('crack', r); while (cr.shows() !== 'crack') cr.turn(1); assert.equal(cr.feel(), 'catch'); assert.equal(cr.state().bad, true); assert.equal(cr.decide(false, 200), 'ok');
  const dp = F.createStone57('deep', r); assert.equal(dp.shows(), null, 'a deep crack looks whole'); assert.equal(dp.tap(), 'dull'); assert.equal(F.createStone57('fossil', r).tap(), 'ring');
  const nk = F.createStone57('nick', r), u = nk.state().nick.u; assert.equal(nk.edgeSlide(0, 0.3, 0.1), 'fast', 'too fast — "לאט"'); assert.equal(nk.edgeSlide(Math.max(0, u - 0.2), Math.min(1, u + 0.2), 1.5), 'caught');
  const ok = F.createStone57('fossil', r); assert.equal(ok.edgeSlide(0, 0.5, 1.2), 'ok'); assert.equal(ok.edgeSlide(0.5, 1, 1.2), 'ok'); assert.ok(ok.edgeFelt() >= 0.9, 'the whole edge felt, no catch');
  for (const t of ['fossil', 'pits', 'moss', 'mud']) assert.equal(F.STONE57[t].bad, false, `${t}: a decoy`);
  for (const t of ['crack', 'deep', 'nick']) assert.equal(F.STONE57[t].bad, true, `${t}: a flaw`);
});

test('build 57: level 4 — two marks on one stone; the act: four stones at level 3 then two at level 4; the decoys\' pages in ספר הפגימות', () => {
  for (const t of ['fossilcrack', 'pitsmoss', 'mossdeep', 'fossilnick']) { const T = F.STONE57[t], n = T.marks.length + (T.coat ? 1 : 0) + (T.deep ? 1 : 0) + (T.nick ? 1 : 0); assert.equal(T.L, 4); assert.equal(n, 2, `${t}: two marks`); }
  const fc = F.createStone57('fossilcrack', () => 0.4); assert.equal(fc.feel(), 'fossil'); fc.turn(1); fc.turn(1); assert.equal(fc.feel(), 'catch', 'the second mark, two faces round: a crack'); assert.deepEqual(fc.pages().sort(), ['crack', 'fossil']);
  const pm = F.createStone57('pitsmoss', () => 0.4); assert.equal(pm.state().bad, false, 'two decoys — kasher'); assert.deepEqual(pm.pages().sort(), ['moss', 'pits']);
  for (let s = 0; s < 20; s++) { let a = s + 1; const rnd = () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; const L = F.list57(rnd, 3); assert.equal(L.length, 6); assert.ok(L.slice(0, 4).every((t) => F.STONE57[t].L === 3) && L.slice(4).every((t) => F.STONE57[t].L === 4)); assert.ok(L.includes('fossil') && L.includes('crack') && L.includes('pitsmoss')); assert.ok(L.some((t) => F.STONE57[t].bad) && L.some((t) => !F.STONE57[t].bad)); }
  assert.deepEqual({ ...F.PAGE57 }, { mud: 'בוץ — לא פגימה', moss: 'טחב — לא פגימה', fossil: 'מאובן — לא פגימה', pits: 'גומות — לא פגימה' });
  for (const t of ['moss', 'fossil', 'pits']) assert.equal(F.STONE55[t].page, F.PAGE57[t], `${t}: its own page`);
  assert.match(H, /const fresh = J\.pages\(\)\.filter\(\(p2\) => !book\[p2\]\); for \(const p2 of fresh\) book\[p2\] = \{ t: Date\.now\(\) \};/, 'every decoy its own page');
  assert.match(H, /`📖 \$\{fresh\.map\(\(p2\) => F\.PAGE57\[p2\]/);
  assert.match(H, /decoy: \{ begin\(\) \{ st\.job = mkStone55\('all', F\.list57\(Math\.random, Lover \|\| 3\), Lover \|\| 3, 'decoy'\); \} \},/);
  // the gestures already learned, all at hand: wipe, turn, the finger along the edge, the mallet with the witness — no new one
  assert.match(H, /if \(kind === 'tap' \|\| kind === 'all'\) \{ if \(wit\) wit\.visible = true;/);
  assert.match(H, /if \(kind === 'all' && edge57\) \{/); assert.match(H, /const cr = J\.tap\(\) === 'dull', R2 = F\.ring56\(cr, 3\);/); assert.match(H, /else if \(kind === 'all' && r === 'clean' && rub > Bx\.w \* 0\.45/);
  assert.match(H, /data-edge="1"/);
});

test('build 57: the kevesh — 32 amot by 16 from the south (מדות ג, ג); his six rows meet the altar\'s top; an error carried up; level 1 forgives a little', () => {
  const K = F.KEVESH57; assert.equal(K.S, 9 / 32); assert.equal(K.rows * K.row, 32);
  assert.equal(KEV57.zFoot - KEV57.zTop, 32); assert.equal(KEV57.x1 - KEV57.x0, 16); assert.ok(KEV57.zFoot > KEV57.zTop, 'it rises from the south (+z) to the altar');
  assert.match(read('src/temple.js'), /B\.hexa\('plaster', \[\[-46, 16, 10\.5\], \[-46, 16, 42\.5\], \[-30, 16, 42\.5\], \[-30, 16, 10\.5\],/, 'the world\'s kevesh where the stage has it');
  const J = F.createKevesh57(2); assert.ok(Math.abs(J.ideal(K.rows - 1) + K.S - KEV57.y1) < 1e-9, 'the last row\'s north edge at the altar\'s top (25)');
  for (let i = 0; i < K.his; i++) assert.equal(J.lay(J.target()), 'even'); assert.equal(J.result().rating, 'mehudar'); assert.equal(J.drift(), 0);
  const C = F.createKevesh57(2); assert.equal(C.lay(C.target() + 0.08), 'off'); for (let i = 1; i < K.his; i++) assert.equal(C.lay(C.target()), 'even', 'the next rows go on from the one below — even to the gauge');
  assert.ok(Math.abs(C.drift() - 0.08) < 1e-9, 'the error carried to the top'); assert.equal(C.result().rating, 'kasher');
  const X = F.createKevesh57(2); assert.equal(X.lay(X.target() - 0.5), 'crooked'); assert.equal(X.state().rows.length, 0, 'lifted again — free');
  const L1 = F.createKevesh57(1); assert.equal(L1.lay(L1.target() + 0.12), 'even', 'level 1 settles it true within ⅐ amah'); const L2 = F.createKevesh57(2); assert.equal(L2.lay(L2.target() + 0.12), 'off');
  const B = F.createKevesh57(2); assert.ok(B.bubble(B.target()) === 0 && B.bubble(B.target() + 0.1) > 0 && B.bubble(B.target() - 0.1) < 0, 'the bubble centred when the slope goes on even');
  const kv = H.slice(H.indexOf('function mkKevesh57('), H.indexOf('function mkSid57('));
  assert.match(kv, /drag\.h = J\.target\(\) \+ \(sp\.y - a\.y\) \/ GEAR\(\);/, 'before the release a small drag ⬍ sets its height');
  assert.match(kv, /if \(L <= 1\) \{   \/\/ \(level 1 — §1 rule 7: the slope's shadow/); assert.match(kv, /data-bubble=/); assert.match(kv, /data-gauge="1"/);
  assert.match(kv, /zc = 27, D = 8 \+ \(zc - KEV57\.zTop\) \/ \(0\.84 \* t2\); return \{ p: \[XM57 \+ D, 23, zc\], t: \[XM57, 20\.8, zc\] \}; \}/, 'the side view from the east');
  assert.match(H, /kevesh: A\(-41, 48\)/, 'he at its foot — low on the left');
  // the side view's share of the width (pure, tanH 0.87–1.0): the kevesh's 32 amot over the view's width at its middle plane — ≥ 50 %
  for (const t2 of [0.87, 1.0]) { const D = 8 + 16.5 / (0.84 * t2); assert.ok(32 / (2 * D * t2) >= 0.5, `${t2}: ${(32 / (2 * D * t2)).toFixed(2)}`); }
});

test('build 57: the whitewash — with a cloth, never iron; too slow drips, too fast streaks; a coverage meter; the morning light', () => {
  const S = F.createSid57(1); let t = 0;
  assert.equal(S.wipe(0.5, 0.5, 0.05, (t += 0.5)), 'drip', 'too slow — a drop runs'); assert.equal(S.state().drips, 1);
  assert.equal(S.wipe(0.2, 0.2, 9, (t += 0.5)), 'streak', 'too fast — streaks'); assert.ok(S.cell(4, 2) <= 0.5, 'a streak is half covered');
  assert.equal(S.wipe(0.2, 0.2, 1, (t += 0.5)), 'ok'); assert.equal(S.cell(4, 2), 1, 'a second pass at a good pace covers it');
  const G = F.createSid57(1); for (let r = 0; r < 10; r += 1) for (let c = 0; c < 20; c += 1) G.wipe((c + 0.5) / 20, (r + 0.5) / 10, 1, (t += 0.1)); assert.ok(G.cover() >= 0.8); assert.equal(G.result().rating, 'mehudar');
  assert.ok(F.SID57.vmin[1] < F.SID57.vmin[4] && F.SID57.vmax[1] > F.SID57.vmax[4], 'the pace window narrows by level');
  const Q = F.createSid57(1); for (let c = 0; c < 20; c++) Q.wipe((c + 0.5) / 20, 0.05, 1, (t += 0.1)); assert.ok(Q.gapRow() > 0.2, `the hint goes where it is still grey (${Q.gapRow()}) — it stayed on the top row: the autoplayer never covered (c57C-SP)`);
  const sd = H.slice(H.indexOf('function mkSid57('), H.indexOf('const mix55 = '));
  assert.match(sd, /if \(o\.timeOfDay\) o\.timeOfDay\('dawn'\);/, 'the morning light'); assert.match(sd, /data-cloth="1"/); assert.match(sd, /data-cover=/); assert.ok(!/ברזל|כפיס/.test(sd.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')), 'no iron tool in the act');
  assert.match(sd, /drips\.push\(\{ u, v, len: 0, t: 0 \}\)/, 'the drops seen running');
  assert.ok(SID57V.y1 < 20.85, 'the patch under the red line'); assert.equal(SID57V.share, 0.7);
});

test('build 57: §1 rule 12 — every Phase A end card on the right two-thirds, him seen in the left third', () => {
  assert.match(H, /@media \(orientation:landscape\)\{\.h42-card\.h57-end\{direction:ltr;justify-content:flex-end;/);
  assert.match(H, /\.h42-card\.h57-end>div\{direction:rtl;max-width:min\(420px,calc\(66\.6vw - 22px\)\)\}/);
  assert.match(H, /cardView57\(\); if \(st\.ui\.btag\) st\.ui\.btag\.hidden = true;   \/\/ ── build 57 ── \(§1 rule 12/); assert.match(H, /if \(fc\) fc\.classList\.add\('h57-end'\);/);
  assert.match(H, /const t = \[fv\.p\[0\] \+ dx \* ca - dz \* sa, fv\.t\[1\], fv\.p\[2\] \+ dz \* ca \+ dx \* sa\];/);
  // the turn (pure): a forward along −x; turned toward the screen's right (f × up = −z) — the point he stands on lands left of the middle
  const fwd = [-1, 0], a = Math.atan(CARD57.at * 1), f2 = [fwd[0] * Math.cos(a) - fwd[1] * Math.sin(a), fwd[1] * Math.cos(a) + fwd[0] * Math.sin(a)], right2 = [-f2[1], f2[0]];
  const toHim = [-1, 0], x = (toHim[0] * right2[0] + toHim[1] * right2[1]) / (toHim[0] * f2[0] + toHim[1] * f2[1]);
  assert.ok(x < -0.5 && x > -0.75, `he at ${x.toFixed(2)} of the half-width — the left third`);
  assert.match(H, /const fc = card\((?:STG === 'kiyor' \? '[^']*' : )?(?:STG === 'karnot' \? '[^']*' : )?STG === 'guf' \? 'גוף המזבח והכבש — נבנו' :/);
  assert.match(H, /\.\.\.\((?:STG === 'kiyor' \? SRC59 : )?(?:STG === 'karnot' \? SRC58 : )?STG === 'guf' \? SRC57 : STG === 'sovev' \? SRC56 :/);
});

test('build 57: the wiring — after stage 09, on resume, the fixture ?h57go=1; the old flow behind ?guf57=0; the tester\'s menu keeps every stage', () => {
  const G = read('src/game/index.js');
  assert.match(G, /function wanted57\(\)/); assert.match(G, /function startHar57\(\)/); assert.match(G, /stage: 'guf'/); assert.match(G, /complete: \(\) => \{ const out = S\.completeStage\(G, 'guf'\);/);
  assert.match(G, /else if \(wanted57\(\)\) startHar57\(\);/); assert.match(G, /\[\?&\]h57go=1/); assert.match(G, /guf57=0\|stick=1\|har42=0/);
  assert.match(G, /if \(done && wanted57\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar57\(\); \}, 400\);/, 'stage 10 after stage 09');
  const T = read('src/tester56.js'), ids = [...T.matchAll(/\{ id: '([^']+)', he: '([^']+)', q: '([^']+)'/g)].map((m) => [m[1], m[3]]);
  assert.deepEqual(ids.map((x) => x[0]).filter((x) => !['11', '12'].includes(x)), ['01', '02', '03', '04', '05', '06', '06v', '07', 't3', '08', '09', '10', 'B']);   // (build 58: and stage 11's) (build 59: and 12's)
  assert.deepEqual(ids.find((x) => x[0] === '10'), ['10', 'h57go=1&h42stock=99']); assert.deepEqual(ids.find((x) => x[0] === '09'), ['09', 'h56go=1&h42stock=99']);
  const A = read('tools/auto42.js'), K = read('tools/kid34/kidmodes.cjs');
  assert.match(A, /else if \(j\.kind === 'kevesh57'\) await kevesh57\(\); else if \(j\.kind === 'sid57'\) await sid57\(\);/); assert.match(A, /if \(R\.mode === 'all'\) \{/);
  for (const f of ['decoy57k', 'kevesh57k', 'sid57k']) assert.match(K, new RegExp(`async function ${f}\\(K\\)`));
  assert.match(K, /h\.stg === 'guf' && h\.part === 'done'/);
  for (const line of [H, read('src/game/fam42.js')].join('\n').split('\n')) { const c = line.indexOf('//'); if (c < 0 || /https?:|'[^']*\/\/|`[^`]*\/\//.test(line)) continue; assert.ok(!/\b(target|frame|view|begin|end|down|up|move): \(/.test(line.slice(c)), `code after a comment: ${line.slice(c, c + 120)}`); }
});

test('build 57: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/tester56.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'test/build57.test.mjs', 'PROJECT.md']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
