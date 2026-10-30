// ── build 59 ── stage 12, הכיור (docs/specs/shlav-alef-08-16-he.md §1, §3 "12"): the laver cast in bronze in a dark foundry — the furnace
// along its arc, the bronze thick (straightened, it still runs a little), to the line without running over (level 1 a wide window and the
// line's shadow, level 4 a very short one); the twelve spigots' moulds, each a different size; three spigots screwed into the laver's wall
// (⟳, the resistance rising, a click; too hard — "קצת חזרה", no damage); the mukhni at night — slow ⬆ drags pay out the rope against a
// counterweight, the laver sits softly in the water ("בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר… וְאַף הוּא עָשָׂה מוּכְנִי לַכִּיּוֹר", יומא ג, י);
// GAME_BUILD 59. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS59, SRC59, LINE42, KIYOR59, FOUND59, SOCKETS59 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { KIYOR } from '../src/places.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⟳⟲⬍⬆⬇∙!—,:]/g, ' ').split(/\s+/).filter((w) => w && !/^[←-⇿⬀-⯿]$/.test(w) && w !== '👆').length;

test('build 59: GAME_BUILD 59; stage 12\'s parts in the spec\'s order; the quotes exactly as verified (מדות ג, ו; יומא ג, י)', () => {
  assert.equal(GAME_BUILD, 60);
  assert.deepEqual([...PARTS59], ['open', 'cast', 'spigots', 'screw', 'mukhni', 'reveal']);
  for (const q of ['הַכִּיּוֹר הָיָה בֵּין הָאוּלָם וְלַמִּזְבֵּחַ, וּמָשׁוּךְ כְּלַפֵּי הַדָּרוֹם', 'בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר', 'וְאַף הוּא עָשָׂה מוּכְנִי לַכִּיּוֹר']) assert.ok(SRC59.some((s) => s.includes(`"${q}"`)), q);
  assert.ok(SRC59.some((s) => /"הַכִּיּוֹר הָיָה בֵּין הָאוּלָם וְלַמִּזְבֵּחַ, וּמָשׁוּךְ כְּלַפֵּי הַדָּרוֹם" — מדות ג, ו · טיוטה/.test(s)));
  assert.equal(SRC59.filter((s) => /— יומא ג, י · טיוטה/.test(s)).length, 2);
  assert.ok(SRC59.some((s) => /זמנו של בן קטין אינו ידוע בוודאות/.test(s)), '§5: Ben Katin\'s time not known for certain');
  assert.ok(SRC59.some((s) => /המחשה/.test(s)), 'the foundry, the moulds, the thread, the rope and the counterweight — המחשה');
  // every quoted Hebrew text in stage 12's lines and sources is one of the three
  const ok = ['הַכִּיּוֹר הָיָה בֵּין הָאוּלָם וְלַמִּזְבֵּחַ, וּמָשׁוּךְ כְּלַפֵּי הַדָּרוֹם', 'בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר', 'וְאַף הוּא עָשָׂה מוּכְנִי לַכִּיּוֹר'];
  for (const s of [...SRC59, ...Object.entries(LINE42).filter(([k]) => /59$/.test(k)).map(([, v]) => v)]) for (const m of s.matchAll(/"([^"]+)"/g)) assert.ok(ok.includes(m[1]), `an unverified quote: ${m[1]}`);
  assert.match(H, /o\.stage === 'karnot' \? 'karnot' : o\.stage === 'kiyor' \? 'kiyor' : (?:o\.stage === 'ulam' \? 'ulam' : )?'har';/);
  assert.match(H, /STG === 'karnot' \? PARTS58 : STG === 'kiyor' \? PARTS59 : (?:STG === 'ulam' \? PARTS60 : )?PARTS42;/);
  assert.match(H, /cast: 'lift', spigots: 'lift', screw: 'fit', mukhni: 'lift',/);
});

test('build 59: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); each with its chip', () => {
  for (const k of Object.keys(LINE42).filter((k) => /59$/.test(k))) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⟳⟲⬍⬆⬇👆]/u.test(head(LINE42[k])), `${k}: an arrow`);
    assert.match(LINE42[k], /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.equal(head(LINE42.cast59), 'הטו ⤵ ∙ יישרו לפני הקו');
  assert.equal(head(LINE42.screw59), 'סובבו ⟳ ∙ עצרו בנקישה');
  assert.match(head(LINE42.screwTight59), /קצת חזרה ⟲/);
  assert.match(head(LINE42.mukhni59), /^גררו לאט ⬆/);
  assert.ok(Object.keys(LINE42).filter((k) => /59$/.test(k)).length >= 14);
});

test('build 59: the casting — the stream follows the furnace late (straightened, it still runs); to the line, not over it; the window narrows to level 4; level 1\'s even tilt', () => {
  const C = F.createCast59(1, 1), k = C.state(); for (let i = 0; i < 20; i++) C.step(1, 0.05); const s1 = k.s, f1 = k.f; C.step(0, 0.05);
  assert.ok(k.s > 0 && k.s < s1 && k.f > f1, 'straightened — the bronze still runs a little');
  assert.ok(F.CAST59.win[1] > F.CAST59.win[2] && F.CAST59.win[2] > F.CAST59.win[3] && F.CAST59.win[3] > F.CAST59.win[4], 'a wide window at level 1, a very short one at 4');
  assert.ok(F.CAST59.win[4] <= 0.03 && F.CAST59.tau[4] > F.CAST59.tau[1], 'level 4: the bronze slower to stop');
  // at the even tilt, let go when the fill and the stream still to come reach the line: within the window, the first time
  for (const L of [1, 2, 3, 4]) for (const cap of [1, ...F.SPIGOTS59.caps]) {
    const P = F.createCast59(L, cap, cap < 1 ? F.spigotQ59(cap) : undefined), q = P.state(); let r = 'pour', t = 0;
    const quick = F.CAST59.from + ((1 - F.CAST59.from) * Math.min(P.qm, (0.4 * cap) / P.tau)) / P.qm;   // (above level 1: quicker to half — as far as what is still coming stays under half — then slow to the line)
    while (q.f + (q.s * P.tau) / q.cap < 1 && t < 60) { P.step(L > 1 && q.f + (q.s * P.tau) / q.cap < 0.55 ? quick : P.safe(), 0.02); t += 0.02; }
    for (let u = 0; u < 10 && r !== 'done' && r !== 'over' && r !== 'spill' && r !== 'more'; u += 0.02) r = P.step(0, 0.02);
    assert.equal(r, 'done', `level ${L}, cap ${cap}: ${q.f}`); assert.equal(q.fails, 0); if (L === 1) assert.equal(P.result().rating, 'mehudar');
  }
  // full tilt to the line and only then straightened: the after-flow carries it over — the mould is emptied, poured again (no loss)
  const O = F.createCast59(2, 0.2), o = O.state(); let r = 'pour'; while (o.f < 1 && r === 'pour') r = O.step(1, 0.02); for (let u = 0; u < 10 && (r === 'pour' || r === 'still' || r === 'spilling'); u += 0.02) r = O.step(0, 0.02);
  assert.ok(r === 'over' || r === 'spill', r); assert.equal(o.f, 0, 'emptied'); assert.equal(o.fails, 1); assert.ok(!o.done);
  // a short pour under the window: more (no try)
  const M2 = F.createCast59(1, 1); let r2 = 'pour'; for (let i = 0; i < 25; i++) r2 = M2.step(0.6, 0.02); for (let u = 0; u < 10 && (r2 === 'pour' || r2 === 'still'); u += 0.02) r2 = M2.step(0, 0.02); assert.equal(r2, 'more'); assert.equal(M2.state().fails, 0);
  const caps = F.SPIGOTS59.caps; assert.equal(caps.length, 12); assert.equal(new Set(caps).size, 12, 'each mould a different size');
  assert.equal(F.SPIGOTS59.his, 4, 'his four, his fellows the other eight'); assert.equal(new Set(caps.slice(0, 4)).size, 4);
  assert.ok(F.spigotQ59(0.13) < F.spigotQ59(0.38) && F.spigotQ59(0.13) / F.spigotQ59(0.38) > 0.13 / 0.38, 'a smaller stream for a smaller mould — not in proportion: each pour a different amount');
  assert.match(H, /tilt \+= \(want - tilt\) \* Math\.min\(1, dt \* 14\); fur\.rotation\.z = -tilt \* 1\.35;/, 'the furnace straightened at once — the bronze\'s after-flow is the act');
  assert.match(H, /J\.state\(\)\.done \|\| J\.state\(\)\.pouring \|\| turnT > 0/, 'a press while the last pour still settles waits');
  assert.equal(F.spigotsGrade59(Array(12).fill(0)), 1); assert.equal(F.spigotsGrade59([1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]), 0.65); assert.equal(F.spigotsGrade59([1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0]), 0.3);
  assert.match(H, /if \(L <= 1\) \{ const h0 = hOf\(1 - win\), h1 = hOf\(1 \+ win\);/, 'level 1: the line\'s shadow — the window in the mould');
  assert.match(H, /data-safe59/); assert.match(H, /data-fill59/); assert.match(H, /data-line59/);
  assert.match(H, /o\.timeOfDay\('dusk'\)/, 'the foundry: in the evening, its walls and roof casting the sun\'s shadow');
  assert.match(H, /m\.castShadow = true; m\.receiveShadow = true;/); assert.match(H, /rr\.shadowMap\.needsUpdate = true/);
});

test('build 59: the spigot screwed in — the resistance rises, a click at the lock, too hard → a turn back eases it (no damage); a let-go before the click is no try', () => {
  const S = F.createScrew59(1), k = S.state(), C = F.SCREW59; let deg = 0, prev = 0; const per = [];
  while (!k.clicked && deg < 5000) { const was = k.th; S.turn(10); deg += 10; per.push(k.th - was); prev = k.th; }
  assert.ok(k.clicked && k.th >= C.lock); assert.ok(per[per.length - 1] < per[0] * 0.6, 'each degree of the finger turns it less as it goes in');
  assert.equal(S.release(), 'set'); assert.equal(S.result().rating, 'mehudar');
  const T = F.createScrew59(4), t = T.state(); assert.equal(T.release(), 'more', 'before the click: no try'); assert.equal(t.fails, 0);
  let r = ''; for (let i = 0; i < 400 && r !== 'tight'; i++) r = T.turn(15); assert.equal(r, 'tight'); assert.equal(T.turn(30), 'stuck', 'too hard: it turns no further');
  assert.equal(T.release(), 'tight'); assert.equal(t.fails, 1); assert.ok(!t.set);
  let e = ''; for (let i = 0; i < 50 && e !== 'eased'; i++) e = T.turn(-3); assert.equal(e, 'eased', 'a turn back ⟲ eases it'); assert.ok(t.th >= C.lock, 'still locked — no damage');
  assert.equal(T.release(), 'set'); assert.equal(T.result().rating, 'kasher');
  { const U = F.createScrew59(1), u = U.state(); let r2 = ''; for (let i = 0; i < 400 && r2 !== 'tight'; i++) r2 = U.turn(20); for (let i = 0; i < 40; i++) U.turn(-25); assert.ok(u.th >= F.SCREW59.lock && !u.tight, 'eased, the click holds it — a little back, not out'); assert.equal(U.release(), 'set'); }
  { const V = F.createScrew59(1), v = V.state(); for (let i = 0; i < 60; i++) V.turn(10); V.turn(-200); assert.ok(v.th < 600 - 200 + 1 && !v.tight, 'before any too-hard, a turn back unscrews'); }
  assert.ok(C.slack[1] > C.slack[4]); assert.equal(F.screwGrade59([1, 1, 0.65]), 0.65); assert.equal(F.screwGrade59([1, 1, 1]), 1);
  assert.deepEqual([...SOCKETS59], [11, 0, 1], 'the east face\'s three');
  assert.match(H, /data-dial59="\$\{st0\}"/); assert.match(H, /data-turn59="\$\{k\.tight \? 'ccw' : 'cw'\}">\$\{k\.tight \? '⟲' : '⟳'\}/);
});

test('build 59: the mukhni — slow ⬆ pays out; too fast, the rope slips (a lurch); it sits softly when the last of it was slow; the counterweight rises as it goes down', () => {
  const M = F.MUKHNI59, A = F.createMukhni59(1), a = A.state(); let r = '';
  while (!a.done) r = A.pay(0.1, 0.5); assert.equal(r, 'soft'); assert.equal(a.slips, 0); assert.equal(A.result().rating, 'mehudar'); assert.equal(a.d, M.drop);
  const B = F.createMukhni59(1), b = B.state(); assert.equal(B.pay(0.1, 3), 'slip'); assert.ok(b.d > 0.1 + 0.1, 'the lurch'); assert.equal(b.slips, 1);
  const C = F.createMukhni59(4), c = C.state(); let rc = ''; while (!c.done) rc = C.pay(0.1, 0.5); assert.equal(rc, 'splash', 'level 4: 0.5 a second is too quick to sit softly'); assert.ok(C.result().q < 1);
  assert.ok(M.vmax[1] > M.vmax[4] && M.soft[1] > M.soft[4]);
  const D = F.createMukhni59(2); for (let i = 0; i < 16; i++) D.pay(0.1, 0.4); assert.equal(D.pay(0.05, 0.4), 'near');
  assert.match(H, /const cw = st\.props\.cw59, cy = 19 \+ 1\.0 \+ d \* 0\.95;/, 'the counterweight up as the laver goes down');
  assert.match(H, /o\.timeOfDay\('night'\)/); assert.match(H, /st\.props\.torch59 = \[/, 'torches at night');
  assert.match(H, /view\(\) \{ const K = KIYOR59; return \{ p: \[-51, 19\.7, 22\], t: \[K\.x, 21\.2, K\.z\] \}; \}/, 'ש5: low by the pit, a little up at the laver');
});

test('build 59: the places — the laver where the world has it (places.js KIYOR); the foundry on the Mount\'s open south; the reveal at dawn, the world\'s own laver and its twelve spigots running', () => {
  assert.equal(KIYOR59.x, KIYOR.x); assert.equal(KIYOR59.z, KIYOR.z); assert.equal(KIYOR59.rim, KIYOR.rim);
  assert.ok(FOUND59.z > 100, 'outside the courts, on the Mount\'s south');
  assert.match(H, /STG === 'kiyor'(?: \|\| STG === 'ulam')? \? 'dawn' : /); assert.match(H, /V = STG === 'kiyor' \? \{ p: \[-36, 40, 44\], t: \[-63\.5, 21, 20\] \}/);
  assert.match(H, /tg\.textContent = STG === 'kiyor' \? 'הכיור — בין האולם ולמזבח, ושנים עשר דדים'/);
  assert.match(H, /const fc = card\(STG === 'kiyor' \? 'הכיור — נוצק, ובלילה ירד למים'/);
  assert.match(H, /\.\.\.\((?:STG === 'ulam' \? SRC60 : )?STG === 'kiyor' \? SRC59 : STG === 'karnot' \? SRC58/);
  const G = read('src/game/index.js'); assert.match(G, /S\.completeStage\(G, 'kiyor'\); persist\(\); syncWorld\(null\); hideNext44\(\); setTimeout\(\(\) => \{ try \{ kiyorFlow\(\); \} catch \(e\) \{ \/\* \*\/ \} \}, 4200\);/, 'the twelve spigots run at the reveal');
});

test('build 59: the wiring — after stage 11, on resume, the fixture ?h59go=1; the old flow behind ?kiyor59=0; the tester\'s menu; the tools', () => {
  const G = read('src/game/index.js');
  assert.match(G, /function wanted59\(\)/); assert.match(G, /function startHar59\(\)/); assert.match(G, /stage: 'kiyor'/); assert.match(G, /STAGES\.find\(\(x\) => x\.id === 'ulam'\)/);
  assert.match(G, /else if \(wanted59\(\)\) startHar59\(\);/); assert.match(G, /\[\?&\]h59go=1/); assert.match(G, /kiyor59=0\|stick=1\|har42=0/);
  assert.match(G, /if \(done && wanted59\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar59\(\); \}, 400\);/, 'stage 12 after stage 11');
  const T = read('src/tester56.js'), ids = [...T.matchAll(/\{ id: '([^']+)', he: '([^']+)', q: '([^']+)'/g)].map((m) => [m[1], m[2], m[3]]);
  assert.deepEqual(ids.map((x) => x[0]).filter((x) => !['t4', '13'].includes(x)), ['01', '02', '03', '04', '05', '06', '06v', '07', 't3', '08', '09', '10', '11', '12', 'B']);   // (build 60: and the test before chapter ד׳, stage 13)
  assert.deepEqual(ids.find((x) => x[0] === '12'), ['12', '12 · הכיור', 'h59go=1&h42stock=99']);
  const A = read('tools/auto42.js'), K = read('tools/kid34/kidmodes.cjs');
  assert.match(A, /else if \(j\.kind === 'cast59'\) await pour59\('cast59'\); else if \(j\.kind === 'spigots59'\) await pour59\('spigots59'\); else if \(j\.kind === 'screw59'\) await screw59\(\); else if \(j\.kind === 'mukhni59'\) await mukhni59\(\);/);
  for (const f of ['pour59k', 'screw59k', 'mukhni59k']) assert.match(K, new RegExp(`async function ${f}\\(K`));
  assert.match(K, /h\.stg === 'kiyor' && h\.part === 'done'/);
});

test('build 59: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/tester56.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'test/build59.test.mjs', 'PROJECT.md']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
