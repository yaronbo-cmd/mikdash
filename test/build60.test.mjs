// ── build 60 ── the craftsman's test before chapter ד׳ and stage 13, האולם (docs/specs/shlav-alef-08-16-he.md §1, §2, "מבחן האומן לפני פרק
// ד׳", §3 "13"): the test — one job of each family at level 2 (the pulley, a course, the stone with a crack, a beam into its socket), pass
// at כשר, מהודר in all four a gold seal, free tries, after five the master shows it; Josephus on Herod and the priests as a paraphrase only.
// Stage 13: "גלי הים" — a course out, a course in, in two shades ("אַפֵּיק שָׂפָה וְעַיֵּיל שָׂפָה", בבא בתרא ד ע"א), the longer courses and the
// corner; the five oak lintels — held, they swing, drags against the swing calm them, let go when still, centred ("הַתַּחְתּוֹנָה עוֹדֶפֶת עַל
// הַפֶּתַח אַמָּה מִזֶּה וְאַמָּה מִזֶּה", מדות ג, ז); the fifth alone, no shadow; the first leaf on the golden vine (מדות ג, ח — no quote).
// GAME_BUILD 60. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS60, SRC60, SRC59, LINE42, ULAM60, TEST60, TEST44, TEST50, testEnd44, testTry44 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⤴⟳⟲⬍⬆⬇∙·!—,:✋]/g, ' ').split(/\s+/).filter((w) => w && w !== '👆').length;
const Q1 = 'אַפֵּיק שָׂפָה וְעַיֵּיל שָׂפָה', Q2 = 'הַתַּחְתּוֹנָה עוֹדֶפֶת עַל הַפֶּתַח אַמָּה מִזֶּה וְאַמָּה מִזֶּה';

test('build 60: GAME_BUILD 60; stage 13\'s parts in the spec\'s order; the two quotes exactly as verified (בבא בתרא ד ע"א; מדות ג, ז — מִזֶּה); no other quote', () => {
  assert.equal(GAME_BUILD, 61);
  assert.deepEqual([...PARTS60], ['open', 'waves', 'courses', 'lintels', 'fifth', 'vine', 'reveal']);
  assert.ok(SRC60.includes(`"${Q1}" — בבא בתרא ד ע"א · טיוטה`)); assert.ok(SRC60.includes(`"${Q2}" — מדות ג, ז · טיוטה`));
  assert.ok(!SRC60.join('').includes('מִכָּאן'), 'מִזֶּה, not מִכָּאן');
  assert.ok(SRC60.some((s) => /מדות ג, ח · טיוטה$/.test(s) && !s.includes('"')), 'the vine: a paraphrase with its reference, no quotation marks');
  assert.ok(SRC60.some((s) => /המחשה$/.test(s)));
  for (const s of [...SRC60, TEST60.src, ...Object.entries(LINE42).filter(([k]) => /60$/.test(k)).map(([, v]) => v)]) for (const m of s.matchAll(/"([^"]+)"/g)) assert.ok([Q1, Q2].includes(m[1]), `an unverified quote: ${m[1]}`);
  assert.match(H, /o\.stage === 'kiyor' \? 'kiyor' : o\.stage === 'ulam' \? 'ulam' : 'har';/);
  assert.match(H, /STG === 'kiyor' \? PARTS59 : STG === 'ulam' \? PARTS60 : PARTS42;/);
  assert.match(H, /waves: 'place', courses: 'place', lintels: 'lift', fifth: 'lift',/);
  assert.ok(SRC59.includes('זמנו של בן קטין אינו ידוע בוודאות · הערה'), 'every in-game text with its mark');
});

test('build 60: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); the spec\'s two lines; each with its chip', () => {
  const ks = Object.keys(LINE42).filter((k) => /60$/.test(k)); assert.ok(ks.length >= 17);
  for (const k of ks) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⤴⟳⟲⬍⬆⬇👆✋]/u.test(head(LINE42[k])), `${k}: an arrow`);
    assert.match(LINE42[k], /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.equal(head(LINE42.waves60), 'גררו ⤵ · פנימה ⬅ החוצה ➡', '"גררו ⤵ · פנימה ⬅ החוצה ➡" — its inner dot joined by no-break spaces');
  assert.equal(head(LINE42.lintel60), 'החזיקו ✋ · רסנו ↔', '"החזיקו ✋ · רסנו ↔"');
  assert.match(LINE42.lintel60, new RegExp(`"${Q2}" — מדות ג, ז · טיוטה`)); assert.match(LINE42.waves60, new RegExp(`"${Q1}"`));
  assert.match(head(LINE42.wavesShade60), /הקישו פעמיים/); assert.match(head(LINE42.fifth60), /בלי צל/);
});

test('build 60: "גלי הים" — a course one way, the opposite of the course under it; its shades alternate; a stone laid wrong is a correction, set right by a drag or a double tap; level 1 forgives the level face', () => {
  const W = F.createWaves60(5, 2, { out: true, shade0: 1 });
  for (let i = 0; i < 5; i++) assert.deepEqual(W.want(i), { io: 1, sh: (1 + i) % 2 });
  assert.equal(W.lay(1, 1).ok, true); assert.equal(W.lay(-1, 0).okIo, false, 'in, in a course that goes out'); assert.equal(W.state().errs, 1);
  assert.equal(W.nudge(1, 1), true, 'pushed out — right'); assert.equal(W.lay(1, 0).okSh, false, 'the shade not alternated'); assert.equal(W.flip(2), true);
  assert.equal(W.lay(0, 0).okIo, false, 'level 2: a stone level with the face is neither out nor in');
  W.nudge(3, 1); W.lay(1, 1); assert.ok(W.state().done); assert.equal(W.result().rating, 'kasher', 'three corrections');
  const L1 = F.createWaves60(3, 1, { out: false, shade0: 0 }); const r = L1.lay(0, 0); assert.equal(r.io, -1); assert.ok(r.ok, 'level 1: let go level with the face, it goes the shadow\'s way');
  L1.lay(0, 1); L1.lay(-1, 0); assert.equal(L1.result().rating, 'mehudar');
  const n = F.WAVES60.n; assert.ok(n[1] >= 5 && n[4] > n[1]); assert.equal(F.WAVES60.more, 2, 'פ׳: longer courses');
  assert.match(H, /const out60 = \(k\) => k % 2 === 0, sh060 = \(k\) => k % 2;/, 'out, in, out — course by course; each first stone the other shade');
  assert.match(H, /many && j\(\) === 0/, 'the courses: the corner stone first'); assert.match(H, /data-flip60/); assert.match(H, /data-bad60/); assert.match(H, /data-io60/);
});

test('build 60: the lintels — each two amot longer and swinging more; held it rises and swings; drags against the swing calm it; let go swinging — a knock; still — down, then centred', () => {
  for (let i = 0; i < 5; i++) assert.equal(F.lintelLen60(i), 22 + 2 * i);
  const C = F.LINTEL60; for (let i = 1; i < 5; i++) { assert.ok(C.amp[i] > C.amp[i - 1]); assert.ok(C.per[i] > C.per[i - 1]); }
  assert.ok(C.still[1] > C.still[4] && C.damp[1] > C.damp[4]); assert.ok(C.lvAmp[1] < C.lvAmp[2] && C.lvAmp[2] <= C.lvAmp[4], 'level 1: a gentler swing (rule 7)');
  const T = read('src/temple.js'); assert.match(T, /for \(let i = 0; i < 5; i\+\+\) \{ const hw = 11 \+ i, y0 = 62\.3 \+ 2 \* i; box\('oak', -76, y0, -hw, -75\.3, y0 \+ 1\.1, hw, -999\); \}/);
  assert.equal(ULAM60.ly, 62.3); assert.equal(ULAM60.ldy, 2); assert.equal(ULAM60.open, 10); assert.equal(F.lintelLen60(0) / 2 - ULAM60.open, 1, 'the bottom one: an amah this side and an amah that side');
  const rise = (J) => { J.hold(); let t = 0; while (J.state().phase === 'lift' && t < 5) { J.step(0.02); t += 0.02; } return t; };
  { const E = F.createLintel60(0, 1, () => 0.3); rise(E); let t1 = 0; while (E.amp() > E.still && t1 < 10) { E.step(0.02); t1 += 0.02; } assert.ok(t1 < 1.5, `level 1, the first beam: still within moments of the top (${t1})`); }
  const A = F.createLintel60(2, 2, () => 0.3); assert.ok(rise(A) < 2); assert.equal(A.state().phase, 'hang'); assert.equal(A.release(1), 'knock', 'still swinging'); assert.equal(A.state().knocks, 1);
  // calm: the finger against the swing — faster than left alone
  const calm = (drag) => { const J = F.createLintel60(3, 2, () => 0.7); rise(J); J.hold(); let t = 0; while (J.amp() > J.still && t < 30) { const v = J.state().v; J.step(0.02, drag ? -Math.sign(v) * 6 : 0); t += 0.02; } return t; };
  assert.ok(calm(true) < calm(false) / 2, 'drags against the swing calm it');
  const P = F.createLintel60(1, 2, () => 0.7); rise(P); P.hold(); const a0 = P.amp(); for (let i = 0; i < 40; i++) { const v = P.state().v; P.step(0.02, Math.sign(v) * 6); } assert.ok(P.amp() > a0 * 0.95, 'with the swing, a little more');
  const B = F.createLintel60(0, 1, () => 0.2); rise(B); let t = 0; while (B.amp() > B.still && t < 20) { B.step(0.02); t += 0.02; } B.hold(); assert.equal(B.release(1), 'lower'); for (let i = 0; i < 50; i++) B.step(0.02);
  assert.equal(B.state().phase, 'center'); B.hold(); B.slide(2.5); assert.equal(B.release(1), 'miss'); B.hold(); B.slide(-B.state().off + 0.1); assert.equal(B.release(1), 'set'); assert.equal(B.result().rating, 'mehudar', 'a knock-free beam, one miss: still מהודר (two lets-go off the middle count one)');
  const K2 = F.createLintel60(0, 2, () => 0.2); rise(K2); K2.release(1); K2.hold(); assert.equal(K2.state().knocks, 1); let t2 = 0; while (K2.amp() > K2.still && t2 < 30) { K2.step(0.02); t2 += 0.02; } assert.equal(K2.release(0.05), 'lower', 'still: a tap lowers it'); for (let i = 0; i < 50; i++) K2.step(0.02); K2.hold(); K2.slide(-K2.state().off); assert.equal(K2.release(1), 'set'); assert.equal(K2.result().rating, 'kasher', 'a knock: כשר');
  assert.match(H, /if \(L <= 1 && !last\) \{ ghost = /, 'level 1: the shadow — not on the fifth'); assert.match(H, /fifth: \{ begin\(\) \{ world60\('fifth'\); st\.job = mkLintel60\(Lover \|\| famL\('lift'\), 4, 4, 'fifth'\); \} \},/);
  assert.match(H, /view\(\) \{ const y = seat60\(b\); return \{ p: \[-55\.5, y - 38, 3\], t: \[U60\.lx, y \+ 0\.9, 0\] \}; \}/, 'from the court, low, looking up at the opening');
  assert.match(H, /data-calm60/); assert.match(H, /data-over60/); assert.match(H, /data-amp60/);
});

test('build 60: the world — the Ulam not drawn under his courses, its stone whole but for the oak lintels while he sets them (its scaffold not drawn before the opening), done from the vine on; the vine\'s next leaf from the world; the reveal at dawn', () => {
  assert.match(H, /if \(stages\.setWork\) stages\.setWork\('ulam', \{ phase: 'finish', finish: 0 \}\); hole46\(true, \[-75\.98, -56, -16\.5, 16\.5\], 130, 22\.3\);/);
  assert.match(H, /if \(i >= iV\) \{ if \(stages\.setStage\) stages\.setStage\('ulam', 'done', 1, \{ instant: true \}\); hole46\(false\); \}/);
  const St = read('src/stages.js'); assert.match(St, /function vineNext\(\)/); assert.match(St, /setVine, vineNext, rain: setRain/);
  assert.match(St, /ulam: \{ oak: \[\[0, 61\.8, 72\.6, 1\]\]/, 'the finish\'s first step: the oak lintels');
  assert.match(H, /STG === 'kiyor' \|\| STG === 'ulam' \? 'dawn' :/); assert.match(H, /tg\.textContent = STG === 'kiyor' \? '[^']*' : STG === 'ulam' \? 'האולם — הפתח, חמש קורות האלון, וגפן הזהב'/);
  assert.match(H, /STG === 'ulam' \? 'האולם — נבנה, ועלה ראשון בגפן'/); assert.match(H, /\.\.\.\(STG === 'ulam' \? SRC60 : STG === 'kiyor' \? SRC59/);
  assert.match(H, /try \{ if \(o\.leaf\) o\.leaf\(\); \} catch \(e\) \{ \/\* \*\/ \}/, 'the leaf hangs in the game\'s vine');
  const G = read('src/game/index.js'); assert.match(G, /leaf: \(\) => \{ try \{ if \(G\.vine && typeof G\.vine === 'object'\) G\.vine\.leaves = \(G\.vine\.leaves \| 0\) \+ 1; persist\(\); W\.setVine\(S\.vineSize\(G\)\);/);
});

test('build 60: the craftsman\'s test before chapter ד׳ — one job of each family at level 2; pass at כשר, all four מהודר a gold seal; the master after five; Josephus a paraphrase', () => {
  assert.deepEqual([...TEST60.jobs], ['pulley', 'course0', 'stone', 'beam']); assert.equal(TEST60.L, 2); assert.equal(TEST60.demoAfter, 5);
  assert.match(TEST60.src, /^את ההיכל בנו הכהנים; הורדוס לא נכנס אליו, כי לא היה כהן — קדמוניות טו 420-421 · טיוטה$/); assert.ok(!TEST60.src.includes('"'), 'not a quote');
  const fam = { pulley: 'lift', course0: 'place', stone: 'inspect', beam: 'fit' }; assert.deepEqual(new Set(Object.values(fam)).size, 4);
  for (const [j, f] of Object.entries(fam)) assert.match(H, new RegExp(`[ ,{]${j}: '${f}'`), `${j}: ${f}`);
  const jobs = {}; for (const j of TEST60.jobs) jobs[j] = testTry44(null, 'mehudar').rec; assert.deepEqual(testEnd44(jobs, TEST60.jobs), { passed: true, seal: true, shown: false });
  jobs.beam = testTry44(null, 'kasher').rec; assert.equal(testEnd44(jobs, TEST60.jobs).seal, false);
  let r = null; for (let k = 0; k < 5; k++) r = testTry44(r && r.rec, 'tikkun'); assert.equal(r.next, 'demo');
  assert.deepEqual([...TEST44.jobs], ['lift', 'course0', 'corner']); assert.deepEqual([...TEST50.jobs], ['stone', 'mud', 'nail'], 'the earlier tests unchanged');
  assert.match(H, /const t60 = o\.test === 60, T6 = t60 \? TEST60 : TT, K6 = t60 \? 'test60' : key;/); assert.match(H, /'מבחן אומן — לפני פרק ד׳'/); assert.match(H, /'נפתח: פרק ד׳ — הבית'/);
  assert.match(H, /beam: \{ begin\(\) \{ st\.job = mkBeams\('N', null, MODE === 'test' && o\.test === 60\); \} \},/, '"קורה לשקע" — one beam: the crews have set the other four');
  assert.match(H, /const pre = one \? \[0, 4, 1, 3\] : \[\];/); assert.match(H, /if \(MODE === 'test' && o\.test === 60 && \(part === 'pulley' \|\| part === 'course0'\)\) back60t\(\);/, 'he steps behind the camera at the pulley and the course');
  assert.match(H, /\} else if \(j\.kind === 'pulley'\) \{/, 'the master\'s hand knows the pulley'); assert.match(H, /\} else if \(j\.kind === 'beams'\) \{/, 'and the beams');
  assert.match(H, /if \(STG === 'wall' \|\| MODE === 'yard' \|\| \(MODE === 'test' && o\.test === 60\)\) props45\(add\);/, 'the test has its pulley');
  assert.match(H, /if \(MODE === 'yard' \|\| \(MODE === 'test' && o\.test === 60\)\) \{ const W2 = PL\.wallY;/, 'and its wall for the beam');
  assert.match(H, /test: \(o\.test === 60 \? S\.test60 : o\.test === 50 \? S\.test50 : S\.test44\) \|\| null, test50: o\.test === 50, test60: o\.test === 60,/);
});

test('build 60: the wiring — stage 12 → the test → stage 13; on resume; the fixtures ?h60test=1 and ?h60go=1; the old flow behind ?ulam60=0; the tester\'s menu; the tools', () => {
  const G = read('src/game/index.js');
  assert.match(G, /function wantedTest60\(\)/); assert.match(G, /function wanted60\(\)/); assert.match(G, /function startHar60\(\)/); assert.match(G, /stage: 'ulam'/); assert.match(G, /STAGES\.find\(\(x\) => x\.id === 'heichal'\)/);
  assert.match(G, /if \(done && wantedTest60\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startH44\('test', '', 60\); \}, 400\);/, 'the test after stage 12');
  assert.match(G, /if \(mode === 'test' && test === 60 && done\) \{ try \{ ui\.toast && ui\.toast\('פרק ד׳ נפתח — הבית'\); \} catch \(e\) \{ \/\* \*\/ \} if \(wanted60\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar60\(\); \}, 400\); return; \}/, 'stage 13 after the test');
  assert.match(G, /else if \(wantedTest60\(\)\) startH44\('test', '', 60\);/); assert.match(G, /else if \(wanted60\(\)\) startHar60\(\);/);
  assert.match(G, /\[\?&\]h60\(test\|go\)=1/); assert.match(G, /ulam60=0\|stick=1\|har42=0/); assert.match(G, /test60=0\|stick=1\|har42=0/);
  assert.match(G, /const S4 = load42\(\); if \(!\(S4\.kiyor && S4\.kiyor\.done\)\) return false; const t = S4\.test60; return !\(t && t\.passed\);/, 'the test only after stage 12 done the new way');
  const T = read('src/tester56.js'), ids = [...T.matchAll(/\{ id: '([^']+)', he: '([^']+)', q: '([^']+)'/g)].map((m) => [m[1], m[2], m[3]]);
  assert.deepEqual(ids.map((x) => x[0]), ['01', '02', '03', '04', '05', '06', '06v', '07', 't3', '08', '09', '10', '11', '12', 't4', '13', 'B']);
  assert.deepEqual(ids.find((x) => x[0] === '13'), ['13', '13 · האולם', 'h60go=1&h42stock=99']); assert.deepEqual(ids.find((x) => x[0] === 't4'), ['t4', 'מבחן אומן — לפני פרק הבית', 'h60test=1&h42stock=99']);
  const A = read('tools/auto42.js'), K = read('tools/kid34/kidmodes.cjs');
  assert.match(A, /else if \(j\.kind === 'waves60'\) await waves60\(\); else if \(j\.kind === 'lintel60'\) await lintel60\(\); else if \(j\.kind === 'vine60'\) await vine60\(\);/);
  for (const f of ['waves60k', 'lintel60k', 'vine60k']) assert.match(K, new RegExp(`async function ${f}\\(K`));
  assert.match(K, /h\.stg === 'ulam' && h\.part === 'done'/); assert.match(K, /h\.test60 && h\.test && h\.test\.passed/);
});

test('build 60: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/stages.js', 'src/tester56.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'test/build60.test.mjs', 'PROJECT.md']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
