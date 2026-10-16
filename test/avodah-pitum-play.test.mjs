// ── service13 ── (wave 13) פיטום הקטורת and the pens played through by their own solvers over a tiny DOM shim (no browser, no
// queue): every phase reached, the result the controller reads, the gentle mistakes quote their sources. Run:
//   node --test test/avodah-pitum-play.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { install, makeApi } from './avodah-dom-shim.mjs';

install();
const { pitum } = await import('../src/avodah/minigames/pitum.js');
const { dir } = await import('../src/avodah/minigames/dir.js');
const { needOf, hasDivineName } = await import('../src/avodah/data.js');
const { dayInfo } = await import('../src/calendar.js');
const need = (key, rest = false) => ({ tomorrow: needOf(dayInfo(new Date(Date.parse(key + 'T12:00:00+03:00') + 864e5))), restToday: rest, restHe: 'שבת' });
const play = async (game, ctx) => {
  const G = makeApi(ctx);
  game.play(G.api);
  const svg = G.play.children[0];
  const tg = (label) => svg.all().find((n) => n.getAttribute && n.getAttribute('aria-label') === label);
  const tap = (label) => tg(label).querySelector('.av-hit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  return { ...G, svg, tg, tap };
};
const solve = async (G) => { const p = G.S.solver(); for (let i = 0; i < 20000 && !G.S.done; i++) { await new Promise((r) => setImmediate(r)); G.advance(20); } await p; return G.S.done; };
const texts = (G) => [...G.S.hints, ...G.S.cites, ...G.svg.all().filter((n) => n.tagName === 'text').map((n) => n.textContent)].join(' ');

test('pitum: a wrong stone and the honey quote the baraita; the solver weighs the eleven, grinds, pinches, stores 368', async () => {
  const G = await play(pitum, { day: '2026-09-30' });
  assert.equal(G.svg.getAttribute('viewBox'), '0 0 360 230');
  G.tap('אבן משקל 16 מנה');
  assert.match(G.S.hint, /הצרי והציפורן והחלבנה והלבונה משקל שבעים של שבעים מנה/); assert.match(G.S.hint, /כריתות ו ע״א/);
  G.tap('צנצנת דבש');
  assert.match(G.S.hint, /ואם נתן בה דבש פסלה/);
  const done = await solve(G);
  assert.equal(done.pitum, true); assert.equal(done.hits, 16); assert.ok(done.fine >= 0.99);
  assert.equal(G.S.mistakes, 2);
  const all = texts(G);
  for (const re of [/וכשהוא שוחק אומר הדק היטב היטב הדק/, /כשם שהדיבור רע ליין כן הדיבור יפה לבשמים/, /מעלה עשן כל שהוא/, /מתמר ועולה כמקל/, /שס״ח מנה/, /חלבנה ריחה רע/, /368 מנה/]) assert.match(all, re);
  assert.ok(!hasDivineName(all));
  // every target in the picture is r ≥ 23 (≥ 44.7 px at a phone's 0.97)
  for (const c of G.svg.all().filter((n) => (n.getAttribute('class') || '').includes('av-hit'))) assert.ok(+c.getAttribute('r') >= 23);
});

test('pitum on a repeat: half the chant (8 words)', async () => {
  const G = await play(pitum, { day: '2026-09-30', repeat: true });
  const done = await solve(G);
  assert.equal(done.pitum, true); assert.equal(done.hits, 8);
});

test('dir: water, hay, tomorrow\'s need (20 Tishrei: 8 bulls), three new lambs judged by the Mishnah — six in the chamber', async () => {
  const G = await play(dir, { day: '2026-09-30', need: need('2026-09-30') });
  assert.match(texts(G), /מחר צריך:/); assert.match(texts(G), /2 כבשי תמיד · מוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר/);
  const done = await solve(G);
  assert.deepEqual(done.dir, { w: 1, f: 1, n: 2 });
  assert.match(done.text, /^6 טלאים בדוקים בלשכה/);
  assert.equal(G.S.mistakes, 0);
  for (const c of G.svg.all().filter((n) => (n.getAttribute('class') || '').includes('av-hit'))) assert.ok(+c.getAttribute('r') >= 23);
});

test('dir: a wrong judgement quotes the Mishnah (Bekhorot 6); the lamb still goes where the Mishnah says', async () => {
  const G = await play(dir, { day: '2026-09-30', need: need('2026-09-30') });
  const water = G.api.controls.children[0];
  water.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); G.advance(1600); water.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  for (let i = 1; i <= 3; i++) G.tap(`אלומת מספוא ${i}`);
  G.advance(1200);
  // tomorrow's musaf (20 Tishrei): 8 bulls, 2 rams and a goat led out, one tap each
  const led = G.svg.all().filter((n) => /^(פר|איל|שעיר) \d+$/.test((n.getAttribute && n.getAttribute('aria-label')) || ''));
  assert.equal(led.length, 11);
  assert.match(G.S.hint, /מחר במוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר/);
  for (const t of led) t.querySelector('.av-hit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  assert.match(G.S.hint, /מוכנים למחר — ואת 14 הכבשים של המוסף מביאים הכהנים האחרים/);
  G.advance(1500);
  let wrong = 0;
  for (let n = 1; n <= 3; n++) {
    G.tap(`טלה ${n}`);
    for (const p of ['האוזן', 'העין', 'החוטם', 'השפה']) G.tap(p);
    const blem = G.svg.all().some((x) => (x.getAttribute && x.getAttribute('class')) === 'av-r-mark');
    const [yes, no] = G.api.controls.children.filter((b) => b.dataset.k === 'tamim' || b.dataset.k === 'mum').sort((a) => (a.dataset.k === 'tamim' ? -1 : 1));
    (blem ? yes : no).dispatchEvent(new PointerEvent('click', { bubbles: true }));   // always the wrong one
    wrong++;
    G.advance(300);
  }
  assert.equal(G.S.mistakes, 3);
  assert.ok(G.S.misses.every((m) => /בכורות ו|אין בו שום סימן/.test(m)), G.S.misses.join(' | '));
  G.advance(3000);
  assert.deepEqual(G.S.done.dir.n, 2);   // the two unblemished went in all the same
});

test('dir: no musaf tomorrow (a plain weekday) — straight to the lambs; Rosh Chodesh tomorrow — 2 bulls, a ram, a goat', async () => {
  const W = await play(dir, { day: '2026-10-05', need: need('2026-10-05') });   // tomorrow 25 Tishrei, a Tuesday
  const d1 = await solve(W);
  assert.deepEqual(d1.dir, { w: 1, f: 1, n: 2 });
  assert.ok(!W.S.hints.some((h) => /מחר במוסף/.test(h)));
  const R = await play(dir, { day: '2026-10-10', need: need('2026-10-10') });   // Shabbat 29 Tishrei; tomorrow Rosh Chodesh Cheshvan
  R.api.ctx.need.restToday = false;
  const d2 = await solve(R);
  assert.ok(R.S.hints.some((h) => /מחר במוסף: 2 פרים, איל, 7 כבשים, שעיר/.test(h)), R.S.hints.join(' | '));
  assert.equal(d2.dir.n, 2);
});

test('dir on Shabbat / Yom Tov: no new lambs — water, hay, count the six (Arachin 2:5)', async () => {
  const G = await play(dir, { day: '2026-10-03', need: need('2026-10-03', true) });
  const done = await solve(G);
  assert.deepEqual(done.dir, { w: 1, f: 1, n: 0 });
  assert.match(done.text, /כְּדַי לַשַּׁבָּת וְלִשְׁנֵי יָמִים טוֹבִים שֶׁל רֹאשׁ הַשָּׁנָה/);
  assert.match(G.S.hints.join(' '), /שבת — אין טלאים חדשים/);
});
