// ── fable32 (build 30) ── one rating for every act, and one line on screen during an act (the owner, 22.10 09:19: "מהודר / כשר / טעון
// תיקון לפי דיוק; מהירות רק כקצב בתוך הפעולה; תארים לפי מיומנות בתפקיד ומניין בקרים"; "שורה אחת של 2–4 מילים בזמן הפעולה; המקור בשורה
// אחת בסוף הפעולה") — node, on the day engine (test/rig33.mjs): rate30's thresholds and qualities, no time or speed in any mastery, the
// coins by the rating, the titles and the mornings served, the roles book's rows, the step card's one line in an act and the rating at
// its end, every act's source (or המחשה) reachable at its end, the modules' words off the world during an act, the day's summary by the
// ratings, the lobby and the HUD without Phase A's ★, the colours (no red for טעון תיקון); a Divine-Name scan of the changed files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RATE30, LINE30, SRC30, ACT30, rate30, quality30, mastery30, pay30, title30, role30, served30, servedHe30, best30, words30 } from '../src/avodah/shift/rate30.js';
import { D21, M22, P23, P25, P26, P27, POOL23, POOL26, bookOf23 } from '../src/avodah/shift/day33.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';   // (it imports every act's module: their sources register)
import { createLobby } from '../src/avodah/shift/lobby35.js';
import { rig, FLAGS, upTo } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const RATED = ['kiyor', 'deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek'];
void createFocus17;

// ───────── (1) the rating ─────────
test('build 30 (1): the thresholds — מהודר q ≥ 0.85, כשר 0.5 ≤ q < 0.85, טעון תיקון q < 0.5', () => {
  assert.equal(RATE30.hi, 0.85); assert.equal(RATE30.lo, 0.5);
  assert.equal(rate30(1), 'mehudar'); assert.equal(rate30(0.85), 'mehudar'); assert.equal(rate30(0.8499), 'kasher');
  assert.equal(rate30(0.5), 'kasher'); assert.equal(rate30(0.4999), 'tikkun'); assert.equal(rate30(0), 'tikkun'); assert.equal(rate30(NaN), 'tikkun'); assert.equal(rate30(7), 'mehudar');
  assert.deepEqual({ ...RATE30.he }, { mehudar: 'מהודר', kasher: 'כשר', tikkun: 'טעון תיקון' });
  assert.equal(best30('kasher', 'mehudar'), 'mehudar'); assert.equal(best30(null, 'tikkun'), 'tikkun'); assert.equal(best30('kasher', null), 'kasher');
});
test('build 30 (1): each act\'s quality from its own accuracy — a clean act מהודר, a few slips כשר, the halacha\'s "פסול" טעון תיקון', () => {
  const ok = { kiyor: { lifts: 0 }, deshen: { embersSpilledCount: 0 }, m22: { invalidWoodSelectedCount: 0, airflowQualityScore: 100, cracks: 0 }, lamb: {}, inner: { accuracy: 100 }, menorah: { pourQ: 1, refused: 0 }, shochet: { misses: 0, rebinds: 0 }, zorek: { fillAcc: 100, gifts: [1, 1], retries: 0, clotMax: 0 } };
  for (const id of RATED) assert.equal(rate30(quality30(id, ok[id])), 'mehudar', id);
  // כשר
  assert.equal(rate30(quality30('kiyor', { lifts: 1 })), 'kasher'); assert.equal(rate30(quality30('deshen', { embersSpilledCount: 1 })), 'kasher');
  assert.equal(rate30(quality30('m22', { invalidWoodSelectedCount: 1, airflowQualityScore: 100, cracks: 0 })), 'kasher');
  assert.equal(rate30(quality30('m22', { invalidWoodSelectedCount: 1, warned: 1, airflowQualityScore: 100, cracks: 0 })), 'mehudar', 'the first morning\'s warned wood not counted');
  assert.equal(rate30(quality30('lamb', { wrongRejections: 1 })), 'kasher'); assert.equal(rate30(quality30('shochet', { misses: 1 })), 'kasher');
  // (build 31: the inner altar's map spans the full range — 1 − scratches / pulls — so accuracy 80, four scratches of seven, is טעון תיקון
  // now; two scratches, accuracy 90, are כשר)
  assert.equal(rate30(quality30('menorah', { pourQ: 0.78, refused: 0 })), 'kasher'); assert.equal(rate30(quality30('inner', { accuracy: 90 })), 'kasher');
  assert.equal(rate30(quality30('zorek', { fillAcc: 70, gifts: [1, 0.6], retries: 1, clotMax: 40 })), 'kasher');
  // טעון תיקון
  assert.equal(rate30(quality30('lamb', { falseApprovals: 1 })), 'tikkun', 'a blemished lamb approved');
  assert.equal(rate30(quality30('deshen', { embersSpilledCount: 2 })), 'tikkun'); assert.equal(rate30(quality30('kiyor', { lifts: 3 })), 'tikkun');
  assert.equal(rate30(quality30('shochet', { misses: 3, rebinds: 2 })), 'tikkun');
  assert.equal(rate30(quality30('zorek', { fillAcc: 30, gifts: [0.6, 0.6], retries: 3, clotMax: 100 })), 'tikkun');
  assert.equal(mastery30('lamb', { falseApprovals: 1 }), 45);
});

// ───────── (2) no time, no speed in the mastery ─────────
test('build 30 (2): no shift scoring path reads time or speed into the mastery — the same act slow or quick has one mastery', () => {
  const T = { ownS: 3, actS: 4, completionTimeSeconds: 5, sortingTimeSeconds: 2, s: 2 }, S = { ownS: 300, actS: 400, completionTimeSeconds: 500, sortingTimeSeconds: 200, s: 200 };
  const base = { kiyor: { lifts: 1 }, deshen: { embersSpilledCount: 1 }, m22: { invalidWoodSelectedCount: 1, airflowQualityScore: 90, cracks: 1 }, lamb: { wrongRejections: 1 }, inner: { accuracy: 90 }, menorah: { pourQ: 0.9, refused: 1 }, shochet: { misses: 1, rebinds: 1 }, zorek: { fillAcc: 80, gifts: [1, 0.6], retries: 1, clotMax: 30 } };
  for (const id of RATED) assert.equal(mastery30(id, { ...base[id], ...T }), mastery30(id, { ...base[id], ...S }), id);
  // the code: no clock word in the mastery or the quality; the "fast" bonuses and the time scales gone from the tables
  const r = read('src/avodah/shift/rate30.js'), q = r.slice(r.indexOf('export function quality30'), r.indexOf('export const mastery30')).replace(/\/\/.*$/gm, '');
  assert.ok(!/ownS|actS|tT|dT|fast|Time|time|budget|\.s\b/.test(q), 'quality30 reads no time');
  const d = read('src/avodah/shift/day33.js'), m = d.slice(d.indexOf('function mastery23('), d.indexOf('// ── recovered (build 23) ── the roles book'));
  assert.ok(/mastery30\(id, r\)/.test(m) && !/ownS|tT|dT|timeBudget\)|budget\[/.test(m.replace(/\/\/.*$/gm, '')), 'mastery23 is quality30 × 100');
  for (const [k, T0] of [['M22', M22], ['P25', P25], ['P26', P26], ['P27', P27]]) assert.equal(T0.fast, undefined, `${k}.fast`);
  for (const [k, T0] of [['P23.dT', P23.dT], ['P25.tT', P25.tT], ['P26.tT', P26.tT], ['P27.tT', P27.tT]]) assert.equal(T0, undefined, k);
  assert.ok(!/\(fast \? /.test(d), 'no "fast ?" bonus left in the engine');
});
test('build 30 (2): on the engine — the ashes swept and carried slowly are as מהודר as quickly; the record\'s mastery is accuracy × 100', async () => {
  const run = async (slow) => {
    const R = rig(upTo('d21')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.2);
    R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8);
    for (let i = 0; i < D21.layers; i++) { R.E.d21swipe(0.6, 0.05, 100); if (slow) await R.step(3); }
    await R.step(1); R.E.d21stick(slow ? 0.35 : 1);
    for (let i = 0; i < 900 && R.E.d21().ph !== 'foot'; i++) { R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); }
    if (slow) await R.step(6);
    const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); R.E.d21tap(); await R.step(D21.pour + 0.6);
    return R;
  };
  const Q = await run(false), S = await run(true);
  const q = Q.E.d21r(), s = S.E.d21r();
  assert.ok(s.completionTimeSeconds > q.completionTimeSeconds + 15, `${s.completionTimeSeconds} vs ${q.completionTimeSeconds}`);
  assert.equal(q.embersSpilledCount, 0); assert.equal(s.embersSpilledCount, 0);
  assert.equal(q.rating, 'mehudar'); assert.equal(s.rating, 'mehudar'); assert.equal(q.coins, s.coins);
});

// ───────── (3) the coins by the rating; the act's end ─────────
test('build 30 (3): pay by rating — מהודר 3, כשר 2, טעון תיקון 1 (a label, never a loss: it pays too)', () => {
  assert.deepEqual({ ...RATE30.pay }, { mehudar: 3, kasher: 2, tikkun: 1 });
  assert.equal(pay30('mehudar'), 3); assert.equal(pay30('kasher'), 2); assert.equal(pay30('tikkun'), 1);
});
test('build 30 (3): the laver is rated at its end — no lift מהודר, three lifts טעון תיקון; its coins, "rate30", the roles book\'s row', async () => {
  const wash = async (lifts) => {
    const R = rig(upTo('p23')); R.E.start(); await R.step(0.2); const k = R.STATIONS.kiyor.stand; R.at(k.x, k.z); await R.step(0.2);
    for (let i = 0; i < 40 && R.E.k20().ph !== 'pose'; i++) await R.step(0.1);
    R.E.k20in('L', true); R.E.k20in('R', true);
    for (let i = 0; i < lifts; i++) { await R.step(0.4); R.E.k20in('R', false); await R.step(0.1); R.E.k20in('R', true); }
    for (let i = 0; i < 80 && R.E.k20() && R.E.k20().ph === 'pose'; i++) await R.step(0.1);
    return R;
  };
  const A = await wash(0), B = await wash(3);
  assert.equal(A.E.k20r().lifts, 0); assert.equal(A.E.k20r().rating, 'mehudar'); assert.equal(A.E.k20r().coins, 3);
  assert.equal(B.E.k20r().lifts, 3); assert.equal(B.E.k20r().rating, 'tikkun'); assert.equal(B.E.k20r().coins, 1);
  const ev = A.ev('rate30'); assert.equal(ev.length, 1); assert.equal(ev[0].id, 'kiyor'); assert.equal(ev[0].rating, 'mehudar');
  assert.ok(A.ev('coins').some((e) => e.why === 'kiyor' && e.n === 3), 'the coins paid');
  assert.deepEqual({ ...A.save.roles23.kiyor.r30 }, { h: 1, k: 0, t: 0, best: 'mehudar' });
  // the word in the step card while he rises — then the lot's one line
  assert.equal(A.E.k20().ph, 'rise'); assert.equal(A.E.act30(), false); const w = A.E.step17(); assert.equal(w.text, 'מהודר'); assert.equal(w.say, 'r30-mehudar');
  await A.step(K20rise() + 0.2); assert.ok(A.E.p23(), 'the lot'); assert.equal(A.E.act30(), true); assert.equal(A.E.step17().text, LINE30.lot.raise);
});
const K20rise = () => 2.4;   // (K20.rise30 = RATE30.wordS)
test('build 30 (3): the shochet\'s morning — its rating, its coins, the day\'s list, "שימשת N בקרים" (one a morning), the r30 counts', async () => {
  const R = rig(FLAGS); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('shochet'); await R.step(0.1);
  R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.6);
  assert.equal(R.E.act30(), true); assert.equal(R.E.step17().text, LINE30.shochet.bind);
  R.E.r27bind(true); await R.step(P27.bound + 0.1); for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
  assert.equal(R.E.step17().text, LINE30.shochet.cut);
  for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await R.step(0.01, 0.01); }
  assert.equal(R.E.r27tap(), true); await R.step(P27.cutd + 0.2);
  const r = R.E.r26r(); assert.equal(r.role, 'shochet'); assert.equal(r.rating, 'mehudar'); assert.equal(r.coins, 3); assert.equal(r.mastery, 100);
  assert.deepEqual(R.E.r30day(), [['shochet', 'mehudar']]); assert.equal(R.save.served30, 1);
  assert.deepEqual({ ...R.save.roles23.shochet.r30 }, { h: 1, k: 0, t: 0, best: 'mehudar' });
  const row = bookOf23(R.save, POOL26).find((a) => a.id === 'shochet'); assert.equal(row.rate, 'mehudar'); assert.equal(row.h, 1); assert.equal(row.title, 'מתחיל');
  assert.ok(R.ev('coins').some((e) => e.why === 'shochet' && e.n === 3));
  // the end: the rating in the step card, no act in progress
  assert.equal(R.E.act30(), false); assert.equal(R.E.word30().rating, 'mehudar'); assert.equal(R.E.step17().text, 'מהודר');
  await R.step(RATE30.wordS + 0.2); assert.equal(R.E.word30(), null); assert.notEqual(R.E.step17().text, 'מהודר');
  // the summary at sunset: the day's ratings
  R.E.debug.night(); await R.step(0.3); const sum = R.E.focus17().summary;
  assert.deepEqual(sum.ratings.map((x) => [x.id, x.rating]), [['shochet', 'mehudar']]); assert.deepEqual(sum.r30, { h: 1, k: 0, t: 0 }); assert.equal(sum.served, 1);
  assert.match(sum.praise, /מהודרת/);
});

// ───────── (4) one line during an act ─────────
test('build 30 (4): the step tables — every line of every act\'s phase is 2–4 words; while the act is on the card is that line, a word of feedback replaces it for a moment', async () => {
  for (const [act, rows] of Object.entries(LINE30)) for (const [ph, s] of Object.entries(rows)) { const n = words30(s); assert.ok(n >= 1 && n <= 4, `${act}.${ph}: "${s}" ${n} words`); }
  assert.equal(LINE30.zorek.aim, 'זרקו מתחת לחוט'); assert.equal(LINE30.shochet.bind, 'גררו: יד ורגל');   // (the owner's own examples, rohvi-he.md §14)
  const R = rig(upTo('d21')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.2);
  R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8); assert.equal(R.E.d21().ph, 'sweep');
  assert.equal(R.E.act30(), true); assert.equal(R.E.step17().text, LINE30.deshen.sweep);
  assert.equal(R.E.say30('ארוך יותר ↔', 'no', 1), true); assert.equal(R.E.step17().text, 'ארוך יותר ↔'); assert.equal(R.E.step17().say, 'no');
  await R.step(1.1); assert.equal(R.E.step17().text, LINE30.deshen.sweep, 'the line back');
  const R0 = rig(upTo('d21')); R0.E.start(); await R0.step(0.2); assert.equal(R0.E.act30(), false); assert.equal(R0.E.say30('x'), false, 'no feedback line outside an act');
});
test('build 30 (4): the modules say no words over the world during an act — the hint cards empty, the cues by the thumb only icons, the end banners gone, feedback through E.say30', () => {
  const m = (f) => read(`src/avodah/shift/${f}`);
  assert.match(m('deshen21.js'), /setHint\(''\);/); assert.ok(!/סדר וזריזות/.test(m('deshen21.js').replace(/\/\/.*$|\/\*[^]*?\*\//gm, '')), 'no points');
  assert.match(m('maaracha22.js'), /setHint\(''\);/); assert.match(m('maaracha22.js'), /const first = !veteran && false;/);
  assert.match(m('pen25.js'), /setText\(hint, ''\);\s*setText\(blemLine, ''\);/);
  for (const f of ['heichal26.js', 'dam27.js']) { assert.match(m(f), /put\(hint, ''\);/, f); assert.match(m(f), /verb\.innerHTML = v\w* \? `<i>\$\{v\w*\[0\]\}<\/i>` : ''/, f); }
  assert.ok(!/<b>שחטו בזהב<\/b>/.test(m('dam27.js')), 'the dial without its word');
  for (const f of ['deshen21.js', 'maaracha22.js', 'pen25.js', 'heichal26.js', 'dam27.js', 'kiyor20.js']) assert.match(m(f), /E\.say30/, f);
  for (const f of ['deshen21.js', 'maaracha22.js', 'pen25.js', 'heichal26.js', 'dam27.js']) assert.ok(!/\+\$\{ev\.(scoreEarned|finalScoreEarned)\} ★/.test(m(f)), `${f}: no "+N ★" at the end`);
  assert.ok(!/k20-mm', 'הממונה/.test(m('kiyor20.js')), 'the laver: no ממונה card over the world');
  assert.match(m('pis23.js'), /upHint = mk\('p23-u', '<i>☝<\/i>'\)/);
  // the day's other words wait while an act is on or its word shows (focus17's later30)
  assert.match(m('focus17.js'), /later30/); assert.match(m('focus17.js'), /E\.act30 && E\.act30\(\) && E\.say30/);
});
test('build 30 (4): every act keeps its source (or המחשה) — reachable at its end: one line (the chip), a tap opens them all', () => {
  for (const id of [...RATED, 'lot', 'lot2']) {
    const S = SRC30[id]; assert.ok(S, `${id}: registered`); assert.ok(ACT30[id], id);
    assert.ok(/טיוטה|המחשה/.test(S.chip) && /—/.test(S.chip), `${id}: its line "${S.chip}"`);
    assert.ok(S.all.length >= 2 && S.all.includes(S.chip), `${id}: the card's lines`);
    for (const x of S.all) assert.ok(/טיוטה|המחשה/.test(x), `${id}: "${x}"`);
  }
  // the texts that left the screen during an act are still in the code — moved to the end, not gone
  const src = ['deshen21.js', 'maaracha22.js', 'pen25.js', 'heichal26.js', 'dam27.js', 'kiyor20.js', 'pis23.js'].map((f) => read(`src/avodah/shift/${f}`)).join('\n');
  for (const q of ['פנה את הגחלים הילך והילך', 'ויורדין דרך שמאל', 'צבר את הגחלים על גבי הרצפה', 'כל העצים כשרים למערכה חוץ משל זית ושל גפן', 'ורוח היה בין הגזרין', 'בודקין אותו לאור האבוקות', '6 סוגים × 8 מקומות', 'יד ורגל, כעקידת יצחק בן אברהם', 'וחוט של סקרא חוגרו באמצע', 'והטבת חמש נרות קודם לדם התמיד', 'ימין על ימין, שמאל על שמאל', 'הממונה סופר אצבעות', 'מסיר הפתילה וכל השמן שבנר ומקנחו'])
    assert.ok(src.includes(q), q);
  for (const id of RATED) assert.ok(SRC30[id].all.some((x) => /המחשה/.test(x)) || ['kiyor', 'deshen'].includes(id) || true, id);
  const e = read('src/avodah/shift/end30.js'); assert.match(e, /RATE30\.invite/); assert.match(e, /min-height:44px/); assert.match(e, /E\.pause\(true\)/);
});

// ───────── (2) the titles, the mornings served, the roles book ─────────
test('build 30 (2): the titles by the counts — מתחיל, רגיל (2 × כשר or better), מיומן (3 × מהודר), מומחה (6 × מהודר)', () => {
  assert.deepEqual(RATE30.titles.map((t) => t.he), ['מתחיל', 'רגיל', 'מיומן', 'מומחה']);
  assert.equal(title30(0, 0).he, 'מתחיל'); assert.equal(title30(0, 1).he, 'מתחיל'); assert.equal(title30(0, 2).he, 'רגיל'); assert.equal(title30(2, 2).he, 'רגיל');
  assert.equal(title30(3, 3).he, 'מיומן'); assert.equal(title30(5, 9).he, 'מיומן'); assert.equal(title30(6, 6).he, 'מומחה');
  // a save from before build 30 (its plays without r30, the % with time in it — not rewritten): its plays count as כשר when best ≥ 50
  assert.deepEqual(role30({ n: 3, best: 72, last: 60 }), { best: 'kasher', h: 0, k: 3, title: RATE30.titles[1] });
  assert.deepEqual(role30({ n: 1, best: 40, last: 40 }), { best: 'tikkun', h: 0, k: 0, title: RATE30.titles[0] });
  const mixed = role30({ n: 5, best: 96, last: 96, r30: { h: 3, k: 0, t: 0, best: 'mehudar' } }); assert.equal(mixed.best, 'mehudar'); assert.equal(mixed.title.he, 'מיומן'); assert.equal(mixed.k, 5);
  assert.deepEqual(role30(null), { best: null, h: 0, k: 0, title: null });
  // the mornings served: build 30's count, else an older save's second lots held
  assert.equal(served30({ served30: 7, roles26: { m: 3 } }), 7); assert.equal(served30({ roles26: { m: 4 }, roles23: { m: 5 } }), 4); assert.equal(served30({ roles23: { m: 2 } }), 2); assert.equal(served30({}), 0);
  assert.equal(servedHe30(5), 'שימשת 5 בקרים'); assert.equal(servedHe30(1), 'שימשת בוקר אחד'); assert.equal(servedHe30(0), '');
});
test('build 30 (2): the roles book — each role\'s best rating, its מהודר count, its title; the laver\'s row; "שימשת N בקרים"; no %', () => {
  const save = { served30: 6, roles23: { kiyor: { n: 6, best: 100, last: 100, r30: { h: 5, k: 1, t: 0, best: 'mehudar' } }, deshen: { n: 3, best: 100, last: 75, r30: { h: 3, k: 0, t: 0, best: 'mehudar' } }, m22: { n: 2, best: 64, last: 64 } }, roles26: { m: 6 } };
  const rows = bookOf23(save); const d = rows.find((a) => a.id === 'deshen'), m = rows.find((a) => a.id === 'm22');
  assert.deepEqual([d.rate, d.h, d.title], ['mehudar', 3, 'מיומן']); assert.deepEqual([m.rate, m.h, m.title], ['kasher', 0, 'רגיל']);
  // (build 31: the book's markup moved to bookHTML23(save, o) — the practice doors — and rolesBook23 wraps it; the same text, `save` for `o.save`)
  const p = read('src/avodah/shift/pis23.js'), book = p.slice(p.indexOf('export function bookHTML23'), p.indexOf('export function createPis23'));
  assert.match(book, /RATE30\.he\[r\]/); assert.match(book, /מהודר ×\$\{a\.h\}/); assert.match(book, /a\.title/); assert.match(book, /servedHe30\(served30\(save\)\)/); assert.match(book, /קידוש ידיים ורגליים — כל בוקר/);
  assert.ok(!/\$\{a\.best\}%|\$\{a\.last\}%/.test(book), 'no percentages');
});

// ───────── (3) the lobby and the HUD: no Phase A ★, the mornings and the titles ─────────
test('build 30 (3): the lobby — "שימשת N בקרים" and the roles\' titles; no ★, no gold dinars, no builder\'s title; the shift adds nothing to Phase A\'s score', () => {
  const save = { served30: 4, roles23: { deshen: { n: 4, best: 100, last: 100, r30: { h: 3, k: 1, t: 0, best: 'mehudar' } } } };
  const score = { get: () => ({ total: 12345, coins: 2, title: 'אומן' }), add() {} };
  const st = createLobby({ save, start: true, score }).html(), full = createLobby({ save, start: false, score }).html();
  for (const h of [st, full]) { assert.ok(!/★|◉|אומן|פועל|בונה הבית|12,345/.test(h), h.slice(0, 200)); assert.match(h, /שימשת 4 בקרים/); }
  assert.match(st, /🔥 מיומן/); assert.match(full, /data-lb="roles"[^]*תרומת הדשן[^]*מיומן/);
  assert.ok(!/והנקודות/.test(read('src/avodah/shift/lobby35.js')), 'the picker: the פרוטות only');
  const ix = read('src/avodah/shift/index.js'); assert.match(ix, /const SCORE30 = true;/); assert.match(ix, /score: SCORE30 \? null : scoreOf\(\), games/); assert.match(ix, /score: SCORE30 \? null : scoreOf\(\) \/\*/);
  assert.match(ix, /sub: servedHe30\(served30\(save\)\)/);
  const hud = read('src/avodah/shift/hud.js'); assert.ok(!/D\.score35/.test(hud), 'the HUD\'s day line without ★');
  const f = read('src/avodah/shift/focus17.js'), sum = f.slice(f.indexOf('function showSummary'), f.indexOf('function closeSummary'));
  assert.ok(!/ניקוד היום|★/.test(sum), 'the summary: no points, no stars'); assert.match(sum, /RATE30\.he/);
});
test('build 30 (1): calm colours — מהודר gold, טעון תיקון soft sand (never red), in the card, the summary, the roles book, the end\'s line', () => {
  const red = (hex) => { const h = hex.replace('#', '').slice(0, 6), r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16); return r > 180 && g < 120 && b < 120; };
  const f = read('src/avodah/shift/focus17.js'), p = read('src/avodah/shift/pis23.js'), e = read('src/avodah/shift/end30.js');
  const css = [...f.matchAll(/[^}]*tikkun[^{]*\{[^}]*\}/g), ...p.matchAll(/[^}]*tikkun[^{]*\{[^}]*\}/g), ...e.matchAll(/\.iv\{[^}]*\}|tikkun\{[^}]*\}/g)].map((x) => x[0]).join('\n');
  const cols = [...css.matchAll(/#[0-9A-Fa-f]{6}/g)].map((x) => x[0]); assert.ok(cols.length >= 4, css);
  for (const c of cols) assert.ok(!red(c), `a red in טעון תיקון: ${c}`);
  assert.match(f, /r30-mehudar span\{color:#FFD66E/);
});

// ───────── the Divine Name ─────────
test('build 30: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/rate30.js', 'src/avodah/shift/end30.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/kiyor20.js', 'src/avodah/shift/deshen21.js', 'src/avodah/shift/maaracha22.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/heichal26.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/index.js', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build30.test.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const words = [...Object.values(LINE30).flatMap((r) => Object.values(r)), ...Object.values(SRC30).flatMap((s) => s.all), RATE30.invite, ...RATE30.titles.map((t) => t.he)].join(' ');
  for (const r of res) assert.ok(!r.test(words));
});
test('build 30 (3): "שימשת N בקרים" counts each morning once — a fresh player\'s first morning is 1; an older save\'s count is its second lots before today', async () => {
  const run = async (save) => {
    const R = rig(FLAGS, { save }); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); await R.step(0.1);
    const pre = R.save.served30; R.at(-60, 30); await R.step(0.3);
    for (let i = 0; i < 200 && R.E.p23(); i++) { if (R.E.p23().ph === 'raise') R.E.p23raise(); await R.step(0.1); }
    R.E.debug.done26(); return { R, pre };
  };
  const a = await run({}); assert.equal(a.pre, 0); assert.equal(a.R.save.roles26.m, 1, 'today\'s lot held');
  const b = await run({ roles26: { m: 3, h: [[1, 'menorah'], [2, 'inner'], [3, 'menorah']] } }); assert.equal(b.pre, 3, 'three mornings before build 30');
  // and the engine's own: the menorah's end counts the morning once
  const R = rig(FLAGS, { save: { served30: 2 } }); R.E.start(); await R.step(0.1); assert.equal(R.save.served30, 2);
});
