// ── fable32 (build 34) ── the naive kid's bug sweep: the dumb bugs a real child hits (the owner, 22.10 22:11: "תריץ שחקן אנושי שיעבור על
// (קודם כל) באגים דביליים"). Each fix the browser runs found (scratchpad b34/kid.cjs — a child who does not know the answers, real touch,
// four phone sizes) and a test for it: the interludes' global sheets never style the journal or the roles book (after "זיכרון המקדש" the
// journal was a blank full-screen layer, its ✕ under it); the journal's compact header on every phone (the long tab names were cut at
// 740–932 px); the laver's row of the roles book a block of its own; the day's pause card has a way back to the opening screen;
// "העתק לוג" 44 px high; the "turn the phone" card without the old mode's name; the footer's build; a Divine-Name scan of the changed files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { journalHTML32 } from '../src/avodah/shift/book32.js';
import { jr32, allPages32 } from '../src/avodah/shift/journal32.js';
import { bookHTML23 } from '../src/avodah/shift/pis23.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { turnCard } from '../src/avodah/shift/prefs28.js';
import { LOCK29_CSS, locButton29 } from '../src/avodah/shift/lock29.js';
import { install } from './avodah-dom-shim.mjs';
import { CH33, day33n, stock33, canInspect33, inspect33, weekdayHe33, hisDayHe33, whenHe33 } from '../src/avodah/shift/lamb33.js';
import { stockHTML33, lambsTab33 } from '../src/avodah/shift/chamber33.js';
import { status29 } from '../src/avodah/shift/time29.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import { rig, FLAGS } from './rig33.mjs';
import { P27 } from '../src/avodah/shift/day33.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';   // (every act's module: their sources register — the journal's pages)

void createFocus17;
const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const OLD = () => ({
  served30: 5, perutot: 40, badges33: { log1: 1 },
  roles23: { m: 5, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22'], [3, 'lamb', 'lamb'], [4, 'deshen', 'deshen'], [5, 'm22', 'm22']], kiyor: { n: 5, best: 100, last: 100 }, deshen: { n: 2, best: 90, last: 90 }, m22: { n: 2, best: 85, last: 85 }, lamb: { n: 1, best: 80, last: 80 }, menorah: { n: 2, best: 80, last: 80 }, inner: { n: 2, best: 85, last: 85 }, shochet: { n: 1, best: 90, last: 90 } },
  roles26: { m: 5, h: [[1, 'menorah'], [2, 'inner'], [3, 'menorah'], [4, 'shochet'], [5, 'inner']] },
});
/** the class names an interlude's sheet styles at its root (the first class of every selector: .tl, .tl-wrap, .pn …) */
function sheetRoots(file) {
  const s = read(file), m = s.match(/const CSS = `([\s\S]*?)`;/); assert.ok(m, file);
  const css = m[1].replace(/\$\{[^}]*\}/g, '0').replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, ''), out = new Set();
  css.replace(/([^{}]+)\{/g, (a, sel) => { for (const x of sel.split(',')) { const k = x.trim().match(/^\.([A-Za-z0-9_-]+)/); if (k) out.add(k[1]); } return a; });
  return out;
}
const classesIn = (html) => { const out = new Set(); html.replace(/class="([^"]*)"/g, (a, c) => { for (const t of c.split(/\s+/)) if (t && !t.includes('$')) out.add(t); return a; }); return out; };

test('build 34 (1): the interludes\' global sheets (tiles .tl, pen .pn, match3 .m3 …) style nothing of the journal or the roles book — after a game the journal was a blank full-screen layer with its ✕ under it', () => {
  const roots = new Set([...sheetRoots('src/tiles/ui.js'), ...sheetRoots('src/pen/ui.js'), ...sheetRoots('src/match3/ui.js')]);
  for (const k of ['tl', 'pn', 'm3']) assert.ok(roots.has(k), `the interludes' root .${k} (a fixed full-screen layer at z 200)`);
  // every tab of the journal, a page with its nav, the roles book (bare and its own sheet)
  const save = OLD(); jr32(save);
  const page = [...allPages32().keys()][0]; assert.ok(page, 'a page');
  const htmls = [...['roles', 'mishna', 'mornings', 'badges', 'taleh'].map((tab) => journalHTML32(save, { tab, practice: () => {} })), journalHTML32(save, { tab: 'mishna', page }), bookHTML23(save, { bare: true, practice: () => {} }), bookHTML23(save, {})];
  assert.match(htmls[5], /class="pn32"/, 'the page nav'); assert.match(htmls[0], /class="tl23"/, 'the titles\' legend'); assert.match(htmls[0], /class="tl32"/, 'the lambs tab\'s long word');
  for (const h of htmls) for (const c of classesIn(h)) assert.ok(!roots.has(c), `class "${c}" is an interlude's global class`);
  // and no class literal in the shift's modules is one of the interludes' roots (the next sheet that reuses a short name)
  const dir = new URL('src/avodah/shift/', ROOT), hits = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) for (const c of classesIn(fs.readFileSync(new URL(f, dir), 'utf8'))) if (['tl', 'pn', 'm3'].includes(c)) hits.push(`${f}: ${c}`);
  assert.deepEqual(hits, []);
});

test('build 34 (2): the journal\'s compact header on every phone — the 📖 alone, the tabs\' short words at 12 px (the long names were cut at 740–932 px: the sheet is never wider than 660)', () => {
  const b = read('src/avodah/shift/book32.js'), css = b.slice(b.indexOf('const CSS = `'), b.indexOf('`', b.indexOf('const CSS = `') + 14));
  assert.match(css, /\.j32>\.c\{width:min\(660px,/, 'the sheet: 660 px at most');
  for (const r of [/\.j32 \.hd h2 span\{display:none\}/, /\.j32 \.tb button\{font-size:12px;padding:0 4px\}/, /\.j32 \.tb \.tl32\{display:none\}/, /\.j32 \.tb \.ts\{display:inline\}/]) {
    const m = css.match(r); assert.ok(m, String(r));
    const before = css.slice(0, m.index), open = (before.match(/@media[^{]*\{/g) || []).length;
    assert.equal(open, 0, `${r} is not inside a media query`);
  }
  const save = OLD(); jr32(save);
  assert.match(journalHTML32(save, { tab: 'roles' }), /data-j32t="taleh"[^>]*>🐑 <span class="tl32">הטלאים שבדקתי<\/span><span class="ts">הטלאים<\/span>/);
});

test('build 34 (3): the roles book\'s laver row is a centred block of its own (inline-block, it shared the head line and broke "יומא ב, א–ד · טיוטה" in two)', () => {
  const p = read('src/avodah/shift/pis23.js'), m = p.match(/\.p23-bk \.kr\{[^}]*\}/);
  assert.ok(m); assert.match(m[0], /display:block/); assert.match(m[0], /width:fit-content/); assert.match(m[0], /margin:6px auto 0/); assert.ok(!/inline-block/.test(m[0]));
});

test('build 34 (4): the day\'s pause card has "חזרה למסך הפתיחה" (the day had no way back but a reload); it stops the day (E.stop saves it) and opens the lobby', () => {
  const ix = read('src/avodah/shift/index.js'), day = ix.slice(ix.indexOf('function runDay()'), ix.indexOf('function tour()'));
  const m = day.match(/hud\.pauseCard\(\{[^\n]*\}\); \}\); \} catch/); assert.ok(m, 'the day\'s pause card');
  assert.match(m[0], /back: \{ label: 'חזרה למסך הפתיחה', fn: \(\) => \{ teardown\(\); card\(\); \} \}/);
  assert.match(ix.slice(ix.indexOf('function teardown()'), ix.indexOf('function teardown()') + 600), /E\.stop\(\)/, 'teardown stops the day');
  const d = read('src/avodah/shift/day33.js'), stop = d.slice(d.indexOf('    stop() {'), d.indexOf('    stop() {') + 400);
  assert.match(stop, /saveState\('stop'\)/, 'the day saved as it stops');
  // the practice run's and the chamber's cards had theirs already
  assert.match(ix, /back: \{ label: 'חזרה לספר התפקידים'/); assert.match(ix, /back: \{ label: 'חזרה למסך הפתיחה', fn: \(\) => backFrom33\(\) \}/);
  // the card's button: hud.js's backP (≥ 44 px: .sh-tour)
  const h = read('src/avodah/shift/hud.js');
  assert.match(h, /h\.back \? `<button class="sh-tour" type="button" data-sh="backP">/); assert.match(h, /\.sh-tour\{min-height:44px/);
});

test('build 34 (5): "העתק לוג" on the pause card is 44 px high (it was 32: every target ≥ 44)', () => {
  const h = read('src/avodah/shift/hud.js'), m = h.match(/<button class="sh-tour sm sh-evlog"[^>]*>/);
  assert.ok(m); assert.match(m[0], /min-height:44px/); assert.ok(!/min-height:3\dpx/.test(m[0]));
});

test('build 34 (6): the "turn the phone" card says "משחקים לרוחב" — not the old 90-s mode\'s name ("המשמרת")', () => {
  const doc = install();
  const el = turnCard(doc, 'sh-turn28', 'המשחק מחכה — השעון עצר');
  assert.match(el.innerHTML, /משחקים לרוחב/); assert.ok(!/המשמרת/.test(el.innerHTML)); assert.match(el.innerHTML, /סובבו את הטלפון/);
});

test('build 34 (7): the footer says build 34', () => {
  assert.equal(GAME_BUILD, 45);   // (build 35: the constant moved on) (build 36: again) (build 37: again) (build 38: again) (build 39: 39) (build 40: again) (build 41: again) (build 42: again) (build 43: again) (build 44: again) (build 45: again)
});

test('build 34 (8): the pyre\'s sort says why a swipe did not count — "ארוך יותר ↔" / "מהר יותר ↔" / "לרוחב ↔", as the ashes\', the lamb\'s and the Heichal\'s do (it said "החליקו ימינה או שמאלה ↔" always: a child who swiped too short sorted nothing for minutes)', () => {
  const m = read('src/avodah/shift/maaracha22.js'), i = m.indexOf("if (type === 'm22sw') {"), br = m.slice(i, m.indexOf('return;', i) + 7);
  assert.match(br, /if \(!ev\.ok\)/); assert.match(br, /ev\.why === 'short' \? 'ארוך יותר ↔' : ev\.why === 'slow' \? 'מהר יותר ↔' : 'לרוחב ↔'/);
  assert.ok(!/החליקו ימינה או שמאלה/.test(m.replace(/\/\/[^\n]*/g, '')), 'the old line is gone');
  // the engine gives the reason: a short, a slow and a crooked swipe at the sort
  const d = read('src/avodah/shift/day33.js');
  // (build 36: the owner's relaxed gate, SWIPE36 — 0.15 of the screen within 350 ms — in the same function; its why kept)
  assert.match(d, /swipeWhy = \(dx, dy, ms, min\) => \(void min, Math\.abs\(dx\) >= SWIPE36\.dist \? \(Math\.abs\(dy\) > 0\.5 \* Math\.abs\(dx\) \? 'crooked' : ms > SWIPE36\.ms \? 'slow' : ''\) : 'short'\)/);
  assert.match(d, /const a = swipeWhy\(dx, dy, ms, M22\.sw\);\s*if \(a\) \{\s*emit17\('m22sw', \{ ok: false, why: a \}\);/);
});

test('build 34 (9): the first-run card (name and mishmar) fits a 296-px phone and its go button sticks to the card\'s bottom — "יאללה לעבודה" lay below the screen and a thumb on the card scrolled the mishmar list: a first-time child could not start', () => {
  const c = read('src/avodah/ui.css.js'), card = c.match(/\.av-card\{[^}]*\}/)[0];
  assert.match(card, /max-height:calc\(100vh - 60px\);max-height:calc\(100dvh - 60px\)/, 'the card with its 34 px of padding and border inside the screen');
  assert.match(card, /padding:16px 16px 14px/); assert.match(card, /overflow-y:auto/);
  assert.match(c, /\.av-card>\.av-gorow,\.av-card>\.av-go\{position:sticky;bottom:0;z-index:2\}/);
  const u = read('src/avodah/ui.js'); assert.match(u, /<div class="av-gorow" style="display:flex;gap:8px;margin-top:12px"><button type="button" class="av-btn gold av-go"[^>]*data-v="ok">יאללה לעבודה/);
  assert.match(u, /<button type="button" class="av-btn gold av-go" data-v="go">לעבודה<\/button>`;/, 'the intro\'s button: a direct child of the card');
  // (296 − 2·14 of the modal's padding = 268 ≥ 100vh − 60 + 30 + 2 = 268 on a 296-px screen)
  assert.ok(296 - 60 + 16 + 14 + 2 <= 296 - 28);
});

test('build 34 (10): the day\'s summary keeps "המשך ליום הבא" on the screen (sticky at the card\'s bottom — on 296–390-px phones the rows pushed it off)', () => {
  const f = read('src/avodah/shift/focus17.js');
  assert.match(f, /\.f17-sum \.c\{[^}]*max-height:calc\(100vh - 16px\);overflow:auto/, 'the card scrolls');
  assert.match(f, /\.f17-sum \.c>\[data-f17=next\]\{position:sticky;bottom:0;z-index:1\}/);
  assert.match(f, /<\/div><button type="button" data-f17="next">המשך ליום הבא<\/button>/, 'the button a child of the card');
});

test('build 34 (11): the far stations\' 34-px chips take a tap over 46 px (an ::after hit area; their look unchanged)', () => {
  const f = read('src/avodah/shift/focus17.js');
  assert.match(f, /\.s29-st\.s17-mini\{min-width:0;width:34px;height:34px;/);
  assert.match(f, /\.s29-st\.s17-mini::after\{content:"";position:absolute;inset:-6px;border-radius:50%\}/);
  assert.match(read('src/avodah/shift/stations.js'), /\.s29-st\{position:absolute;/, 'the chip is positioned: its ::after sits on it');
  assert.ok(34 + 2 * 6 >= 44);
});

test('build 34 (12): the chamber\'s walk in has its own view (CH33.walk, from the azara\'s south: him, the hall\'s door, the stalls) — the follow camera stood 4 m behind him in the strip before the hall, his head over the whole screen; at the door the pen\'s views as before', async () => {
  assert.deepEqual(CH33.walk.p, [-160, 26, -38]); assert.deepEqual(CH33.walk.t, [-161, 16.5, -57]);
  // the view stands south of the start, the start and the stand in front of it (he walks away from it, into the frame)
  assert.ok(CH33.walk.p[2] > CH33.start.z + 10 && CH33.walk.t[2] < CH33.start.z && Math.abs(CH33.walk.p[0] - CH33.start.x) < 3);
  const W = { lat: 31.7781, lon: 35.2354, tz: 'Asia/Jerusalem' }, MON = Date.parse('2026-10-26T12:00:00+02:00'), dn = day33n(MON, W), save = {}, S0 = stock33(save, dn);
  const R = rig(undefined, { save: practiceSave31(save), now: () => MON, where: () => W, practice: { role: 'lamb', day: 3, seed: dn, ch33: { dn, done: !canInspect33(save, dn), sky: 'noon', lit: 'day', mine: S0.mine.length, court: S0.court, tags: [], next: 0 } } });
  R.E.start(); await R.step(0.3);
  const w = R.E.camWork25(); assert.ok(w && w.view, 'a view while he walks in'); assert.deepEqual(w.view.p, CH33.walk.p); assert.deepEqual(w.view.t, CH33.walk.t);
  R.at(CH33.stand.x + 0.6, CH33.stand.z); await R.step(0.9);
  assert.ok(R.E.p25(), 'the inspection began at the chamber\'s door');
  const w2 = R.E.camWork25(); assert.ok(w2 && w2.view); assert.notDeepEqual(w2.view.p, CH33.walk.p, 'the pen\'s own view at the door');
  // a real morning\'s pen (no chamber) has no walk-in view: none before its act, as ever
  const R2 = rig(); R2.E.start(); await R2.step(0.3); assert.equal(R2.E.camWork25(), null);
});

test('build 34 (13): on a phone ≤ 700 px wide the opening screen\'s "מיקום מדויק" is its 📍 alone (its words reached the kohen\'s feet and ring at 640×296); a message while it asks still shows', () => {
  assert.match(LOCK29_CSS, /@media \(max-width:700px\)\{\.lb \.p28\.lb-loc:not\(\.msg\) span\{display:none\}\}/);
  const off = locButton29(false, ''), on = locButton29(true, ''), asking = locButton29(false, 'מאתר…');
  assert.match(off, /class="p28 lb-loc off"/); assert.match(on, /class="p28 lb-loc"/); assert.match(asking, /class="p28 lb-loc off msg"/);
  for (const h of [off, on, asking]) { assert.match(h, /aria-label="מיקום מדויק"/); assert.match(h, /<i>📍<\/i>/); }
  assert.match(asking, /<span>מאתר…<\/span>/);
  assert.match(read('src/avodah/shift/prefs28.js'), /\.p28\{min-height:44px;min-width:44px;/, 'the icon alone is still 44 × 44');
});

test('build 34 (14): what HE did on a Saturday is "מוצאי שבת" — the screen is locked until Shabbat goes out (the morning\'s card said "הטלה שבדקת בשבת"); the court\'s offering on Shabbat stays "שבת"', () => {
  const W = { lat: 31.7781, lon: 35.2354, tz: 'Asia/Jerusalem' }, SAT = Date.parse('2026-10-31T19:30:00+02:00'), dS = day33n(SAT, W);   // (Saturday 31.10, after Shabbat went out at 17:2x)
  assert.equal(status29(SAT, W).locked, false, 'Saturday evening: open');
  assert.equal(status29(Date.parse('2026-10-31T12:00:00+02:00'), W).locked, true, 'Saturday noon: locked');
  assert.equal(weekdayHe33(dS), 'שבת'); assert.equal(hisDayHe33(dS), 'מוצאי שבת'); assert.equal(hisDayHe33(dS - 5), 'יום שני');
  assert.equal(whenHe33(dS, dS + 4), 'במוצאי שבת'); assert.equal(whenHe33(dS, dS + 8), 'במוצאי שבת, 31.10'); assert.equal(whenHe33(dS - 5, dS - 1), 'ביום שני');
  // inspected on Saturday evening: the stock's chip, the journal's "נבדק", the morning's card
  const save = {}; assert.ok(inspect33(save, { dn: dS, t: SAT, h: 'x', out: 'tamim', r: 'mehudar', q: 1 }));
  assert.match(stockHTML33(save, dS + 1), /מוצאי שבת<b>/); assert.ok(!/>שבת<b>/.test(stockHTML33(save, dS + 1)));
  const tab = lambsTab33(save, dS + 1); assert.match(tab, /נבדק: מוצאי שבת, 31\.10\.2026/);
  // the court's kohanim offer it on d + 7 — a Saturday: "שבת" (the Tamid is offered on Shabbat)
  const s2 = {}; assert.ok(inspect33(s2, { dn: dS - 7, t: SAT - 7 * 864e5, h: 'x', out: 'tamim', r: 'mehudar', q: 1 }));
  assert.match(lambsTab33(s2, dS + 2), /עלה לתמיד: שבת, 31\.10\.2026[^<]*— בידי כהני הלשכה/);
});

test('build 34 (15): the pen\'s start card fits a 296-px-high phone (it ran 20 px over and cut its title): the small lamb picture goes there and the card scrolls if it must', () => {
  const p = read('src/pen/ui.js');
  assert.match(p, /export const LAND = '\(orientation:landscape\) and \(max-height:560px\) and \(min-width:560px\)';/);
  assert.match(p, /@media \$\{LAND\} and \(max-height:330px\)\{\.pn-card \.pn-lambpic\{display:none\}\.pn-card\{max-height:100%;overflow-y:auto\}\}/);
  assert.match(p, /\.pn-wrap\{position:absolute;inset:0;[^}]*padding:14px;box-sizing:border-box/, 'the card inside its padded wrap');
});

test('build 34 (16): a day resumed after the gate opened (a reload, "מהתחלה", the next visit) does not hold the zorek at "מרסו — חמש נרות קודם" for minutes — the saved gate and five-lamps times were the old clock\'s, and the new one starts at 0', async () => {
  const R = rig(FLAGS, {});
  R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('zorek'); await R.step(0.1);
  R.at(P27.recv.x + 1, P27.recv.z); await R.step(0.6);
  for (let i = 0; i < 300 && R.E.r27().ph !== 'recv'; i++) await R.step(0.1);
  assert.ok(Number.isFinite(R.E.men5t()) && Number.isFinite(R.E.g26t()), 'the court\'s gate opened: the five lamps\' time set');
  R.E.stop();
  const d = R.save.day33state; assert.ok(d && Number.isFinite(d.men5t) && d.g26day === d.day, 'saved with the gate open');
  d.men5t = 418; d.g26t = 410;   // (a gate opened late in a long session — the naive kid's run: 418 s on the old clock)
  const R2 = rig(FLAGS, { save: R.save });
  assert.ok(R2.E.st33.men5t <= 0, 'the five lamps: past'); assert.ok(R2.E.st33.g26t <= -60, 'the gate\'s time: past');
  R2.E.start(); await R2.step(0.3);
  R2.at(P27.recv.x + 1, P27.recv.z); await R2.step(0.6);
  for (let i = 0; i < 300 && R2.E.r27() && R2.E.r27().ph !== 'recv'; i++) await R2.step(0.1);
  const K = R2.E.r27(); assert.equal(K.ph, 'recv');
  for (let i = 0; i < 300 && K.ph === 'recv'; i++) { R2.E.r27move(K.sp - K.pos); await R2.step(0.05, 0.05); }
  await R2.step(P27.full + 0.1);
  assert.ok(R2.E.st33.t < 30, 'the new clock is young');
  R2.at(P27.at.NE.x, P27.at.NE.z); await R2.step(1.5);
  assert.equal(R2.E.r27().ph, 'aim', 'at the north-east corner: the gift at once (it held until the new clock reached 418)');
  // a day never saved: untouched
  const R3 = rig(FLAGS, {}); assert.equal(R3.E.st33.men5t == null || R3.E.st33.men5t === undefined, true);
});

test('build 34 (17): up to 800 px wide the step card\'s words take two lines (at 740×360 "בדיקת הטלה — לכו לדיר הטלאים" beside the tamid timer was cut to "…לכו לדי…"); in an act still one line', () => {
  const p = read('src/avodah/shift/prefs28.js');
  assert.match(p, /@media \(max-width:800px\)\{body\.sh28 \.f17-top\{gap:5px\}[^\n]*body\.sh28 \.f17-card\{[^}]*white-space:normal\}body\.sh28 \.f17-card span\{[^}]*-webkit-line-clamp:2/);
  assert.ok(!/max-width:700px\)\{body\.sh28/.test(p));
  assert.match(read('src/avodah/shift/focus17.js'), /\.f17-top\.f17-a30 \.f17-card span\{-webkit-line-clamp:1!important;white-space:nowrap\}/, 'an act\'s one line');
});

// ───────── the Divine Name ─────────
test('build 34: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too)', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/book32.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/index.js', 'src/avodah/shift/hud.js', 'src/avodah/shift/prefs28.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/maaracha22.js', 'src/avodah/shift/focus17.js', 'src/avodah/ui.js', 'src/avodah/ui.css.js', 'src/avodah/shift/lamb33.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/lock29.js', 'src/avodah/shift/chamber33.js', 'src/pen/ui.js', 'tools/kid34/kid.cjs', 'tools/kid34/kidmodes.cjs', 'tools/kid34/kidpage.js', 'test/build34.test.mjs', 'test/build32.test.mjs', 'test/build33.test.mjs', 'test/build28.test.mjs'];
  const hits = [];
  for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
});
