// MIDDOT10 (wave 10): the Middot book's quizzes and its place links, without a browser. Run: node --test test/middot-quiz.test.mjs
// 1. The questions (content/middot-quiz.json): each has an id, a mishna that exists, its exact source (משנה מדות x, y), exactly one
//    right answer, distinct answers, an explanation that quotes that mishna word for word, status draft, and no Divine Name letters
//    (the patterns are built from \u escapes, like test/qa-content-scan.cjs: this file must not contain a Name either).
// 2. The rules (src/game/middot-quiz.js): studied = every unlocked mishna of the chapter read; questions only from what was read;
//    the best attempt counts, nothing is lost, retakes are free; the final opens after the 5 chapter quizzes; silver once.
// 3. Old saves: a book of {un, read} (before wave 10) works; a damaged one is repaired.
// 4. The place links (src/game/middot.js placeSpans): the names are found in the vocalized text, the text is untouched, every
//    place has a pose and a stage, its card exists in src/info.js; the brief's examples are links.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { MIDDOT, MIDX, PLACE, NAMES, placeSpans, plainOf } from '../src/game/middot.js';
import * as Q from '../src/game/middot-quiz.js';
import { INFO } from '../src/info.js';
import * as S from '../src/game/state.js';
import { STAGES } from '../src/game/content.js';

const RAW = JSON.parse(fs.readFileSync(new URL('../content/middot-quiz.json', import.meta.url), 'utf8'));
const HEB = 'אבגדהוזחט';
const strip = (s) => s.replace(/[֑-ׇֽֿׁׂׅׄ]/g, '');
const norm = (s) => strip(s).replace(/[,.:;?!״׳"]/g, ' ').replace(/\s+/g, ' ').trim();

// the Divine Names, from escapes (the same families as test/qa-content-scan.cjs)
const M = '[\\u0591-\\u05C7]*', L = '\\u05D0-\\u05EA\\u0591-\\u05C7';
const ch = (...c) => c.map((x) => String.fromCharCode(x)).join(M);
const NAMES_RE = [
  new RegExp(ch(0x05D9, 0x05D4, 0x05D5, 0x05D4)),
  new RegExp(`(?<![${L}])[\\u05D5\\u05D4\\u05DC\\u05D1\\u05DB\\u05DE\\u05E9]?${M}` + ch(0x05D0, 0x05DC) + `${M}\\u05D5?${M}` + ch(0x05D4, 0x05D9)),
  new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05DC, 0x05D5, 0x05D4) + `(?![${L}])`),
  new RegExp(`(?<![${L}])` + ch(0x05D0, 0x05D3) + `${M}\\u05D5?${M}\\u05E0\\u05B8?\\u05D9(?![${L}])`),
  new RegExp(`(?<![${L}])` + ch(0x05E9, 0x05D3, 0x05D9) + `(?![${L}])`),
  new RegExp(ch(0x05E6, 0x05D1, 0x05D0, 0x05D5, 0x05EA)),
  new RegExp(`(?<![${L}])` + ch(0x05D9, 0x05D4) + `${M}(?![${L}])`),
];
const hasName = (s) => NAMES_RE.some((re) => re.test(s));

test('the questions: a source, one right answer, a quoted explanation, a draft, no Name', () => {
  assert.ok(RAW.questions.length >= 25, 'a question bank');
  assert.equal(Q.QUESTIONS.length, RAW.questions.length, 'every question is well formed (the module keeps them all)');
  const ids = new Set();
  for (const q of RAW.questions) {
    assert.ok(q.id && !ids.has(q.id), `a unique id: ${q.id}`); ids.add(q.id);
    const m = MIDDOT[MIDX[q.m]];
    assert.ok(m, `${q.id}: its mishna ${q.m} exists`);
    const [c, n] = q.m.split('.').map(Number);
    assert.equal(q.ref, `משנה מדות ${HEB[c - 1]}, ${HEB[n - 1]}`, `${q.id}: the exact source`);
    assert.equal(q.ref, m.ref, `${q.id}: the book's own reference`);
    assert.ok(Array.isArray(q.a) && q.a.length >= 3, `${q.id}: three answers or more`);
    assert.equal(new Set(q.a).size, q.a.length, `${q.id}: distinct answers`);
    assert.ok(Number.isInteger(q.ok) && q.ok >= 0 && q.ok < q.a.length, `${q.id}: exactly one right answer (an index)`);
    assert.equal(q.status, 'draft', `${q.id}: a draft (טיוטה)`);
    assert.ok(typeof q.ex === 'string' && q.ex.length > 10, `${q.id}: an explanation`);
    const quotes = q.ex.match(/״[^״]+״/g) || [];
    assert.ok(quotes.length > 0, `${q.id}: the explanation quotes the mishna`);
    const t = norm(m.he);
    for (const quote of quotes) for (const part of quote.slice(1, -1).split('...')) if (norm(part)) assert.ok(t.includes(norm(part)), `${q.id}: "${part}" is in ${q.ref}`);
    for (const s of [q.q, q.ex, ...q.a]) assert.ok(!hasName(s), `${q.id}: no Name letters in "${s}"`);
  }
  assert.ok(!hasName(fs.readFileSync(new URL('../content/middot-quiz.json', import.meta.url), 'utf8')), 'the whole file');
  for (const c of Q.CHAPTERS) {
    const n = RAW.questions.filter((q) => +q.m.split('.')[0] === c).length;
    assert.ok(n >= 5, `chapter ${c}: at least 5 questions (a full quiz), has ${n}`);
  }
  // the order of the right answer is not always the first (and the game shuffles it anyway)
  assert.ok(new Set(RAW.questions.map((q) => q.ok)).size >= 3);
});

// FUN11 (wave 11, PRODUCER10 top-10 #10): a test-wise child must not win by the answers' LENGTH. On v20 "pick the longest" won
// 51% (chance 33%): in 22 of 68 the right answer was clearly the longest. Every length strategy stays within chance + 5 points,
// and the right answer is never clearly the longest (≥ 30% or 8+ letters over the next) more often than a wrong one is.
test('the answers\' length gives no hint: no length strategy beats chance', () => {
  const len = (s) => [...strip(s)].length, idx = (L) => L.map((_, i) => i);
  const win = (pick) => RAW.questions.reduce((s, q) => { const set = pick(q.a.map(len)); return s + (set.includes(q.ok) ? 1 / set.length : 0); }, 0) / RAW.questions.length;
  const ext = (f) => (L) => { const m = f(...L); return idx(L).filter((i) => L[i] === m); };
  const strategies = {
    longest: ext(Math.max), shortest: ext(Math.min),
    'not the longest': (L) => { const m = Math.max(...L), r = idx(L).filter((i) => L[i] !== m); return r.length ? r : idx(L); },
    middle: (L) => [idx(L).sort((a, b) => L[a] - L[b])[1]],
  };
  const chance = RAW.questions.reduce((s, q) => s + 1 / q.a.length, 0) / RAW.questions.length;
  for (const [k, f] of Object.entries(strategies)) {
    const w = win(f);
    assert.ok(w <= chance + 0.05, `"${k}" wins ${(w * 100).toFixed(1)}% (chance ${(chance * 100).toFixed(1)}%)`);
  }
  const clear = (a, b) => a > b && (a >= b * 1.3 || a - b >= 8);
  let right = 0, wrong = 0;
  for (const q of RAW.questions) {
    const L = q.a.map(len), r = L[q.ok], o = L.filter((_, i) => i !== q.ok).sort((a, b) => b - a);
    if (clear(r, o[0])) right++;
    if (clear(o[0], Math.max(r, o[1] || 0))) wrong++;
  }
  assert.ok(right <= wrong, `the right answer is clearly the longest in ${right}, a wrong one in ${wrong}`);
});

const T0 = Date.UTC(2026, 8, 28, 18, 0, 0);
const fresh = () => S.fresh(T0);
const readAll = (G, ids) => { for (const id of ids) { G.book.un[id] = 1; S.readMishnah(G, id); } };

test('a chapter is studied when its unlocked mishnayot were read; the quiz asks only what was read', () => {
  const G = fresh();
  let c2 = Q.chapter(G, 2);
  assert.equal(c2.open, 1, 'the start unlocks 2.1');
  assert.equal(c2.studied, false, 'not read yet');
  assert.deepEqual(Q.build(G, 2), [], 'no quiz before it is studied');
  S.readMishnah(G, '2.1');
  c2 = Q.chapter(G, 2);
  assert.ok(c2.studied && c2.ready, 'studied: its one unlocked mishna was read');
  const quiz = Q.build(G, 2, Q.rng(7));
  assert.ok(quiz.length >= 3 && quiz.length <= Q.RULES.size, `a short quiz (3-5): ${quiz.length}`);
  assert.ok(quiz.every((q) => q.m === '2.1'), 'only from the mishna read');
  for (const q of quiz) {
    const src = Q.QUESTIONS.find((x) => x.id === q.id);
    assert.equal(q.a[q.ok], src.a[src.ok], 'the shuffle keeps the right answer');
    assert.equal(new Set(q.a).size, src.a.length);
  }
  // a new mishna unlocks: the chapter waits for it to be read
  G.book.un['2.2'] = 1;
  c2 = Q.chapter(G, 2);
  assert.equal(c2.studied, false); assert.equal(c2.missing, 1);
  S.readMishnah(G, '2.2');
  assert.ok(Q.chapter(G, 2).ready);
  assert.equal(Q.chapter(G, 4).open, 0, 'chapter 4 unlocks with the Heichal');
  assert.deepEqual(Q.build(G, 4), []);
});

test('the best attempt counts, nothing is lost, retakes bring the least asked, silver is paid once', () => {
  const G = fresh();
  readAll(G, ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9']);
  assert.ok(Q.chapter(G, 1).ready);
  const silver0 = G.res.silver;
  const q1 = Q.build(G, 1, Q.rng(1));
  assert.equal(q1.length, 5);
  let r = Q.record(G, 1, 3, 5, q1.map((q) => q.id));
  assert.equal(r.best, 3); assert.equal(r.gained, 30); assert.equal(r.pts, 30); assert.equal(r.silver, 6);
  assert.equal(G.book.pts, 30);
  G.res.silver += r.silver;   // (the UI pays it through state.js gain)
  const q2 = Q.build(G, 1, Q.rng(2));
  assert.equal(q2.filter((q) => q1.some((x) => x.id === q.id)).length, 0, 'a retake asks questions not asked yet');
  r = Q.record(G, 1, 1, 5, q2.map((q) => q.id));
  assert.equal(r.best, 3, 'a weaker retake keeps the best'); assert.equal(r.gained, 0); assert.equal(r.silver, 0); assert.equal(r.improved, false);
  r = Q.record(G, 1, 5, 5, []);
  assert.equal(r.best, 5); assert.equal(r.gained, 20); assert.equal(r.pts, 50); assert.equal(r.silver, 4, 'only the new points pay');
  assert.equal(G.book.paid, 10);
  assert.ok(G.res.silver >= silver0);
});

test('the final test opens after the five chapter quizzes; it pays many points and a title', () => {
  const G = fresh();
  readAll(G, MIDDOT.map((m) => m.id));
  for (const c of [1, 2, 3, 4]) { const qs = Q.build(G, c, Q.rng(c)); Q.record(G, c, qs.length, qs.length, qs.map((q) => q.id)); }
  assert.equal(Q.final(G).open, false, 'four quizzes: not yet');
  assert.deepEqual(Q.build(G, 'fin'), []);
  const q5 = Q.build(G, 5, Q.rng(5)); Q.record(G, 5, 2, q5.length, q5.map((q) => q.id));
  const f = Q.final(G);
  assert.ok(f.open, 'open after all five'); assert.equal(f.size, 10);
  const fin = Q.build(G, 'fin', Q.rng(9));
  assert.equal(fin.length, 10);
  for (const c of Q.CHAPTERS) assert.equal(fin.filter((q) => +q.m.split('.')[0] === c).length, 2, `two from chapter ${c}`);
  const before = G.book.pts;
  let r = Q.record(G, 'fin', 7, 10, fin.map((q) => q.id));
  assert.ok(r.siyum); assert.equal(r.gained, 7 * Q.RULES.finPer + Q.RULES.siyum, 'many points: 20 each and 100 for the siyum');
  assert.equal(r.title, Q.TITLES.done); assert.equal(G.book.title, Q.TITLES.done);
  assert.ok(G.book.pts > before + 200);
  r = Q.record(G, 'fin', 10, 10, []);
  assert.equal(r.title, Q.TITLES.perfect); assert.equal(r.siyum, false); assert.equal(r.gained, 60);
  r = Q.record(G, 'fin', 4, 10, []);
  assert.equal(G.book.title, Q.TITLES.perfect, 'a title is never taken back'); assert.equal(r.gained, 0);
  assert.equal(G.book.pts, Q.MAX_POINTS - 30, 'chapter 5 still has 30 points to win');
});

test('old saves: a book from before wave 10 loads and plays; a damaged one is repaired', () => {
  const mem = { m: {}, get(k) { return this.m[k] ?? null; }, set(k, v) { this.m[k] = String(v); return true; }, remove(k) { delete this.m[k]; } };
  const G0 = fresh(); S.readMishnah(G0, '2.1');
  const old = JSON.parse(JSON.stringify(G0)); delete old.book.quiz; delete old.book.pts;
  mem.set(S.SAVE_KEY, JSON.stringify(old));
  const { G } = S.load(mem, S.SAVE_KEY, T0 + 1000);
  assert.deepEqual(Object.keys(G.book).sort(), ['read', 'un']);
  assert.ok(Q.chapter(G, 2).ready, 'the old reads count');
  assert.equal(Q.summary(G).pts, 0);
  const qs = Q.build(G, 2, Q.rng(3));
  const r = Q.record(G, 2, 2, qs.length, qs.map((q) => q.id));
  assert.equal(r.pts, 20);
  S.save(G, mem, S.SAVE_KEY, T0 + 2000);
  const back = S.load(mem, S.SAVE_KEY, T0 + 3000).G;
  assert.equal(back.book.quiz['2'], 2, 'the best is saved'); assert.equal(back.book.pts, 20);
  const bad = fresh(); bad.book.quiz = [3]; bad.book.asked = 'x'; bad.book.paid = -4;
  Q.ensure(bad);
  assert.deepEqual(bad.book.quiz, {}); assert.deepEqual(bad.book.asked, {}); assert.equal(bad.book.paid, 0); assert.equal(bad.book.pts, 0);
  const worse = { book: null }; Q.ensure(worse); assert.ok(worse.book.un && worse.book.read);
});

test('place links: found in the vocalized text, the text untouched, every place in the world', () => {
  const stages = new Set(STAGES.map((s) => s.id));
  for (const [k, P] of Object.entries(PLACE)) {
    assert.ok(P.he && P.he.length > 1, `${k}: a name`);
    assert.ok(P.info === null || INFO[P.info], `${k}: its card ${P.info} exists in info.js`);
    assert.ok(P.stage === null || stages.has(P.stage), `${k}: its stage ${P.stage}`);
    assert.ok(Array.isArray(P.pt) && P.pt.length === 2 && P.pt.every((v) => v.length === 3 && v.every(Number.isFinite)), `${k}: a camera pose`);
    const [p, t] = P.pt; assert.ok(Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]) > 15, `${k}: the camera stands back`);
    assert.ok(p[1] > t[1] - 8, `${k}: the camera is not under it`);
    assert.ok(P.info || P.hint, `${k}: a card or a line of its own`);
    // on a phone (portrait) view.lookAt stands 1.35× farther back: a camera on a place inside the court stays inside its walls
    // (x < -3, |z| < 64) or above them (y > 46), never inside the east wall or behind it in Ezrat Nashim
    const q = [0, 1, 2].map((i) => t[i] + (p[i] - t[i]) * 1.35), inAz = (x, z) => x > -187 && x < 0 && Math.abs(z) < 67.5;
    if (inAz(t[0], t[2])) assert.ok((q[0] < -3 && q[0] > -184 && Math.abs(q[2]) < 64) || q[1] > 46, `${k}: the phone's camera ${q.map(Math.round)} stays in the court`);
    if (P.hint) assert.ok(!hasName(P.hint));
  }
  for (const [n, key] of NAMES) assert.ok(PLACE[key], `the name ${n} → ${key}`);
  const used = new Set(), linksOf = (id) => { const m = MIDDOT[MIDX[id]]; return placeSpans(m.he, id).map((s) => ({ key: s.key, txt: strip(m.he.slice(s.s, s.e)) })); };
  for (const m of MIDDOT) {
    const sp = placeSpans(m.he, m.id);
    let last = -1;
    for (const s of sp) {
      assert.ok(s.s > last && s.e > s.s && s.e <= m.he.length, `${m.id}: spans in order, inside the text`);
      assert.ok(/[א-ת]/.test(m.he[s.s]), `${m.id}: a span starts on a letter`);
      assert.ok(!/[֑-ׇ]/.test(m.he[s.e] || ' '), `${m.id}: a span keeps its last letter's marks`);
      last = s.e - 1; used.add(s.key);
    }
    assert.equal(new Set(sp.map((s) => s.key)).size, sp.length, `${m.id}: each place once`);
  }
  assert.deepEqual(Object.keys(PLACE).filter((k) => !used.has(k)), [], 'every place is named somewhere');
  const has = (id, key, word) => assert.ok(linksOf(id).some((l) => l.key === key && (!word || l.txt.includes(word))), `${id}: ${word || key} is a link`);
  // the brief's examples: בית המוקד, שער ניקנור, לשכת הגזית, הדוכן, הכיור, המזבח, עזרת הנשים, ההיכל
  has('1.1', 'beit-hamoked', 'בית המוקד'); has('1.1', 'avtinas'); has('1.1', 'nitzotz');
  has('1.4', 'nikanor', 'שער נקנור'); has('5.4', 'gazit', 'לשכת הגזית'); has('2.6', 'duchan', 'הדוכן');
  has('3.6', 'kiyor', 'הכיור'); has('3.1', 'altar', 'המזבח'); has('2.5', 'ezrat-nashim', 'עזרת הנשים'); has('4.6', 'heichal', 'ההיכל');
  has('1.1', 'azara-gates', 'שערי העזרה');   // the longest name wins over העזרה
  assert.ok(!linksOf('1.2').some((l) => l.key === 'har'), 'איש הר הבית is a man, not the place');
  assert.ok(!linksOf('4.6').some((l) => l.key === 'kiyor'), '4:6 "אמה כיור" is a moulding, not the kiyor');
  assert.ok(!linksOf('3.2').some((l) => l.key === 'azara'), 'the amah (the channel) is not linked');
  // the text is untouched: the spans cut the original string, and the plain map points back into it
  const m = MIDDOT[MIDX['1.1']], { p, map } = plainOf(m.he);
  assert.equal(p, strip(m.he)); assert.equal(map.length, p.length);
});

// FUN11 (wave 11): the daily Middot question inside the learning points (one system; wave 10's ⚑ default)
test('שאלת היום: from the book\'s questions (read → open → any), the same all day, three a day, points like a chapter question', () => {
  const G = fresh(), day = S.dayKey(T0), per = 3;
  assert.equal(Q.dailyLeft(G, day, per), 3);
  // a new player: 2.1 is open but not read → a question on an open mishna (tier 1), the same one on every call until answered
  const q1 = Q.dailyPick(G, day, per);
  assert.ok(q1 && q1.m === '2.1' && q1.tier === 1, `open, not read: ${q1 && q1.m} tier ${q1 && q1.tier}`);
  assert.deepEqual(Q.dailyPick(G, day, per), q1, 'the same question and order all day (a reload shows it again)');
  const src = Q.QUESTIONS.find((x) => x.id === q1.id);
  assert.equal(q1.a[q1.ok], src.a[src.ok], 'the shuffle keeps the right answer');
  // read 2.1 → the read ones come first
  S.readMishnah(G, '2.1');
  const q2 = Q.dailyPick(G, day, per);
  assert.equal(q2.tier, 0, 'a mishna he read comes first');
  const pts0 = Q.summary(G).pts, silver0 = G.book.paid;
  const r = Q.dailyAnswer(G, q2, q2.ok, day, per);
  assert.ok(r.ok && r.correct, 'a right answer');
  assert.equal(r.gained, Q.DAILY.pts, 'a right answer = the learning points of a chapter question');
  assert.equal(Q.summary(G).pts, pts0 + Q.DAILY.pts);
  assert.equal(r.silver, Math.floor(r.pts / Q.RULES.silverPer) - silver0, 'silver through the book\'s own rule (1 per 5 points)');
  assert.deepEqual(Q.dailyAnswer(G, q2, q2.ok, day, per), { ok: false }, 'one answer a question');
  assert.equal(G.quiz.n, 1, 'the day\'s count stays in G.quiz (the daily tasks read it)');
  // a wrong answer: nothing gained, nothing lost
  const q3 = Q.dailyPick(G, day, per);
  assert.notEqual(q3.id, q2.id, 'a new question after an answer');
  const w = Q.dailyAnswer(G, q3, (q3.ok + 1) % q3.a.length, day, per);
  assert.ok(w.ok && !w.correct); assert.equal(w.gained, 0); assert.equal(Q.summary(G).pts, pts0 + Q.DAILY.pts, 'nothing lost');
  const q4 = Q.dailyPick(G, day, per);
  assert.ok(q4 && Q.dailyAnswer(G, q4, q4.ok, day, per).left === 0, 'the third of the day');
  assert.equal(Q.dailyPick(G, day, per), null, 'three a day');
  assert.equal(Q.dailyLeft(G, day, per), 0);
  // the next day: three new ones; the old day's marks are dropped from the save
  const day2 = S.dayKey(T0 + 86400000);
  assert.equal(Q.dailyLeft(G, day2, per), 3);
  assert.ok(Q.dailyPick(G, day2, per));
  assert.ok(Object.keys(G.quiz.done).every((k) => k.endsWith(day2)), 'yesterday\'s marks are gone');
  // the points are the book's: a chapter quiz's best adds to them; nothing goes down
  const before = Q.summary(G).pts;
  const rc = Q.record(G, 2, 2, 3, []);
  assert.equal(rc.pts, before + 2 * Q.RULES.per, 'the chapter quiz adds on top of the daily points');
  // a damaged save: dpts repaired
  G.book.dpts = 'x'; Q.ensure(G); assert.equal(G.book.dpts, 0);
  const H = fresh(); H.quiz = null;
  assert.ok(Q.dailyPick(H, day, per), 'a save without G.quiz still gets its question');
});

// FUN11 (wave 11): "איפה זה?" — the places quiz in the world
test('איפה זה?: five places he built (else the whole Temple), three names each, the Mishnah\'s words for each, the best counts', async () => {
  const UI = await import('../src/game/middot-ui.js');
  const G = fresh();
  // a new player (nothing built but the start): the rounds are seen in the whole-Temple view
  const p0 = UI.placeRounds(G, S, Q.rng(3));
  assert.equal(p0.whole, true); assert.equal(p0.rounds.length, Q.PLACES_Q.size);
  for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka']) S.completeStage(G, id);
  const p1 = UI.placeRounds(G, S, Q.rng(5));
  assert.equal(p1.whole, false, 'enough built: his own world');
  const keys = new Set();
  for (const r of p1.rounds) {
    assert.ok(S.isDone(G, PLACE[r.key].stage), `${r.key} is built`);
    assert.equal(r.names.length, 3); assert.equal(r.names[r.ok], r.key); assert.equal(new Set(r.names.map((k) => PLACE[k].he)).size, 3, 'three different names');
    keys.add(r.key);
  }
  assert.equal(keys.size, Q.PLACES_Q.size, 'five different places');
  for (const k of UI.PQ_KEYS) {
    assert.ok(PLACE[k] && PLACE[k].pt && UI.poseOf(k), `${k}: a place with a camera pose`);
    const q = UI.placeQuote(k);
    assert.ok(q && q.text.length > 8 && q.text.length < 280 && /^משנה מדות/.test(q.ref), `${k}: the words of its mishna (${q && q.text.length})`);
    assert.ok(strip(MIDDOT[MIDX[q.id]].he).includes(strip(q.text).replace(/^…/, '').replace(/…$/, '')), `${k}: the quote is the mishna's own words`);
    assert.ok(!hasName(q.text), `${k}: no Name`);
  }
  // the points: 5 a right name, the best attempt counts, nothing lost
  const b0 = Q.summary(G).pts;
  const r1 = Q.record(G, 'pl', 3, 5, []);
  assert.equal(r1.gained, 15); assert.equal(Q.summary(G).pts, b0 + 15);
  const r2 = Q.record(G, 'pl', 2, 5, []);
  assert.equal(r2.gained, 0, 'a weaker round takes nothing'); assert.equal(r2.best, 3);
  const r3 = Q.record(G, 'pl', 5, 5, []);
  assert.equal(r3.gained, 10); assert.equal(Q.final(G).taken, 0, 'the places quiz is not a chapter');
});
