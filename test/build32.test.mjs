// ── fable32 (build 32) ── "יומן הכהן": one journal (rohvi-he.md §11; future-unlocks-he.md "מה לוקחים" — a new page with the Mishnah at
// the unlock moment; hachraot-he.md "פתיחת תוכן", the first key — the lot). Node, on the day engine (test/rig33.mjs) and the journal's
// pure parts (journal32.js) and markup (book32.js) with a tiny document: the four tabs (and the hooks' places, hidden); a source enters
// the משניות only after its act ends; "חדש" until a page is opened; "N מתוך M"; one log entry a morning with the real date and the
// Hebrew one; the unlock card only the first time the lot gives a role (never on a repeat, never in practice) and "היומן שלך נפתח" on
// the first page ever; the summary's "📜 המקורות של היום" opens today's; an older save's journal made from what it had (no made-up
// mornings); the lobby's one door and the build's number from one constant; a Divine-Name scan of the changed files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { P27, PRAC31, BADGES33 } from '../src/avodah/shift/day33.js';
import { RATE30, SRC30 } from '../src/avodah/shift/rate30.js';
import { J32, TABS32, tabsOn32, jr32, meet32, log32, served32, seen32, groups32, count32, allPages32, pages32, parse32, today32, mainPage32, hebDate32, realDate32 } from '../src/avodah/shift/journal32.js';
import { journalHTML32, unlockHTML32, openJournal32, createUnlock32 } from '../src/avodah/shift/book32.js';
import { practiceSave31, merge31 } from '../src/avodah/shift/practice31.js';
import { createLobby, GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { hebrewDateAt } from '../src/calendar.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';   // (it imports every act's module: their sources register)
import { rig, FLAGS } from './rig33.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
void createFocus17;
const T0 = Date.parse('2026-10-22T09:00:00+03:00'), JLM = { lat: 31.7781, lon: 35.2354, tz: 'Asia/Jerusalem' };
// ── a tiny document (no browser): elements that keep their markup and their listeners ──
function mkDoc() {
  const mk = (tag) => {
    const L = {}, cls = new Set();
    return { tagName: tag, children: [], dataset: {}, attrs: {}, style: {}, id: '', className: '', innerHTML: '', textContent: '', parent: null,
      classList: { add: (...c) => c.forEach((x) => cls.add(x)), remove: (...c) => c.forEach((x) => cls.delete(x)), contains: (c) => cls.has(c), toggle: (c) => cls.has(c) ? (cls.delete(c), false) : (cls.add(c), true) },
      setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] ?? null; },
      appendChild(c) { c.parent = this; this.children.push(c); return c; }, remove() { if (this.parent) { const a = this.parent.children; a.splice(a.indexOf(this), 1); this.parent = null; } },
      addEventListener(t, f) { (L[t] ||= []).push(f); }, fire(t, ev) { (L[t] || []).forEach((f) => f(ev)); }, querySelectorAll: () => [], querySelector: () => null };
  };
  const doc = { body: mk('body'), head: mk('head'), createElement: mk };
  doc.getElementById = (id) => [...doc.head.children, ...doc.body.children].find((x) => x.id === id) || null;
  doc.querySelectorAll = (sel) => (sel === '.j32' ? doc.body.children.filter((c) => c.className === 'j32') : []);
  return doc;
}
const tap = (el, dataset) => el.fire('click', { target: { dataset, disabled: false, closest() { return this; } }, stopPropagation() {} });
// a build-31 save: six mornings, every built role had (the laver every morning), no journal yet
const OLD = () => ({
  served30: 5, perutot: 40, badges33: { log1: 1, day3: 1 },
  roles23: {
    m: 6, h: [[1, 'deshen', 'deshen'], [2, 'm22', 'm22'], [3, 'lamb', 'lamb'], [4, 'deshen', 'deshen'], [5, 'm22', 'm22'], [6, 'lamb', 'lamb']],
    kiyor: { n: 6, best: 100, last: 75 }, deshen: { n: 2, best: 100, last: 100 }, m22: { n: 2, best: 80, last: 80 }, lamb: { n: 2, best: 100, last: 45 },
    menorah: { n: 2, best: 90, last: 90 }, inner: { n: 1, best: 95, last: 95 }, shochet: { n: 1, best: 100, last: 100 }, zorek: { n: 3, pr: 3, best: 88, last: 88 },
  },
  roles26: { m: 6, h: [[1, 'menorah'], [2, 'inner'], [3, 'menorah'], [4, 'shochet'], [5, 'menorah'], [6, 'menorah']] },
});
/** the shochet's morning through the engine (build 30's way): the laver, the lots and the pre-dawn task skipped; the binding and the cut */
async function shochet(R) {
  R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('shochet'); await R.step(0.1);
  R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.6);
  R.E.r27bind(true); await R.step(P27.bound + 0.1); for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
  for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await R.step(0.01, 0.01); }
  R.E.r27tap(); await R.step(P27.cutd + 0.2);
}
const ids = (s) => groups32(s).map((g) => g.id);

// ───────── (1) the tabs ─────────
test('build 32 (1): the journal\'s four tabs — תפקידים · משניות · הבקרים שלי · אותות (≥ 44 px, ✕ 44 px); the hooks\' and the incense\'s places are there, off — nothing of them shown', () => {
  // ── fable32 (build 33) ── (the first hook's tab is on: "הטלאים שבדקתי" — build 33's own test holds its page; the other three hooks and the
  // incense stay places, off) ── /fable32 ──
  assert.deepEqual(tabsOn32().map((t) => t.id), ['roles', 'mishna', 'mornings', 'badges', 'taleh']);
  assert.deepEqual(tabsOn32().map((t) => t.he), ['תפקידים', 'משניות', 'הבקרים שלי', 'אותות', 'הטלאים שבדקתי']);
  const off = TABS32.filter((t) => !t.on); assert.deepEqual(off.map((t) => t.id), ['etzim', 'orot', 'tapuach', 'ketoret']); assert.equal(off[0].he, 'העצים שהבאת');
  const save = OLD();
  for (const tab of ['roles', 'mishna', 'mornings', 'badges']) {
    const h = journalHTML32(save, { tab });
    assert.deepEqual([...h.matchAll(/data-j32t="(\w+)"/g)].map((m) => m[1]), ['roles', 'mishna', 'mornings', 'badges', 'taleh'], tab);   // ── fable32 (build 33) ── (+ taleh) ── /fable32 ──
    assert.match(h, new RegExp(`data-j32t="${tab}" aria-selected="true" class="on"`)); assert.match(h, new RegExp(`data-tab="${tab}"`)); assert.match(h, /data-j32="close"/);
    for (const t of off) { assert.ok(!h.includes(`data-j32t="${t.id}"`), t.id); assert.ok(!h.includes(t.he) || t.id === 'ketoret', t.he); }
  }
  const b = read('src/avodah/shift/book32.js');
  assert.match(b, /\.j32 \.tb button\{[^}]*min-height:44px/); assert.match(b, /\.j32 \.hd \.j32x\{[^}]*width:44px;height:44px/); assert.match(b, /\.j32 \.t\{[^}]*min-height:56px/);
  // (build 34: the page nav is .pn32 — pen/ui.js's global .pn, left in the page after a game, made .pn a full-screen layer)
  assert.match(b, /\.j32 \.nv button,\.j32 \.pn32 button,\.j32 \.td button\{[^}]*min-height:44px/); assert.match(b, /\.j32-u \.bt button\{[^}]*min-height:52px/); assert.match(b, /\.j32 \.b\{[^}]*min-height:44px/);
  // over everything of the day and the lobby: the summary (40), the practice's end card (61), end30's card (62)
  const z = (re, f = b) => +f.match(re)[0].match(/z-index:(\d+)/)[1];
  const zj = z(/\.j32\{[^}]*\}/); assert.ok(zj > z(/\.r30-c\{[^}]*\}/, read('src/avodah/shift/end30.js')) && zj > z(/\.p31-end\{[^}]*\}/, read('src/avodah/shift/practice31.js')) && zj > z(/\.f17-sum\{[^}]*\}/, read('src/avodah/shift/focus17.js')));
  assert.ok(z(/\.j32-u\{[^}]*\}/) > z(/\.sh-root\.sh-up\{[^}]*\}/, read('src/avodah/shift/hud.js')), 'the card over the pause card\'s layer');
  // תפקידים: the roles book as it was — its rows, its doors from the lobby (o.practice), read-only mid-day; אותות: the badges
  const r = journalHTML32(save, { tab: 'roles', practice: () => {} }), ro = journalHTML32(save, { tab: 'roles', note31: true });
  assert.match(r, /class="p23-bk"[^]*💧 קידוש ידיים ורגליים — כל בוקר[^]*data-p31="kiyor"/); assert.match(r, /data-p31="deshen"/); assert.ok(!r.includes('data-p31="zorek"'), 'practice only: not had');
  assert.ok(!/data-p31=/.test(ro)); assert.match(ro, /לתרגל תפקיד — מספר התפקידים שבמסך הבית/); assert.ok(!/data-p23="close"/.test(r), 'the book\'s own סגור: the journal\'s ✕ instead');
  const bg = journalHTML32(save, { tab: 'badges' }); assert.match(bg, /🏅 2\/15 אותות/); for (const x of BADGES33) assert.ok(bg.includes(x.text), x.id); assert.equal((bg.match(/class="b on"/g) || []).length, 2);
});

// ───────── (2) a source enters משניות only after its act ends ─────────
test('build 32 (2): an act\'s pages enter the journal only when it ends (its rating) — none while it is in progress; the lot\'s at its end; never from a practice run', async () => {
  const R = rig(FLAGS, { now: () => T0, where: () => JLM }); R.E.start(); await R.step(0.1);
  assert.deepEqual(ids(R.save), [], 'a fresh save: an empty journal'); assert.equal(R.save.journal32.hello, false);
  R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); R.E.debug.skip26('shochet'); R.at(P27.stand.x + 1, P27.stand.z); await R.step(0.6);
  R.E.r27bind(true); await R.step(P27.bound + 0.1);
  assert.equal(R.E.act30(), true); assert.ok(!ids(R.save).includes('shochet'), 'in the act: not yet'); assert.equal(count32(R.save).n, 0);
  for (let i = 0; i < 200 && R.E.r27().ph !== 'cut'; i++) await R.step(0.1);
  for (let i = 0; i < 400; i++) { const u = R.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await R.step(0.01, 0.01); }
  R.E.r27tap(); await R.step(P27.cutd + 0.2);
  assert.ok(R.ev('rate30').some((e) => e.id === 'shochet'), 'rated');
  assert.deepEqual(ids(R.save), ['shochet']); const g = groups32(R.save)[0];
  assert.equal(g.pages.length, pages32('shochet').length); assert.ok(g.pages.every((p) => p.isNew), 'every page "חדש"'); assert.equal(g.d, 1);
  assert.ok(R.ev('j32page').some((e) => e.id === 'shochet'));
  // the first lot: its page at the lot's end (p23done)
  const L = rig(FLAGS); L.E.start(); await L.step(0.2); L.E.debug.wash20(); L.at(-60, 30); await L.step(0.4);
  for (let i = 0; i < 80 && !L.ev('p23done').length; i++) { if (L.E.p23() && L.E.p23().ph === 'raise') L.E.p23raise(); await L.step(0.2); }
  assert.ok(L.ev('p23done').length); assert.deepEqual(ids(L.save), ['lot']); assert.equal(groups32(L.save)[0].pages[0].ref, 'יומא ב, ב');
  // a practice run (a copy of his save) writes no page and no morning; merge31 brings back the role's record only
  const save = OLD(); jr32(save); delete save.journal32.acts.zorek; const was = JSON.stringify(save.journal32);
  const P = rig(FLAGS, { save: practiceSave31(save), practice: { role: 'shochet', day: 7, fed: 44, seed: 9 }, j32hold: true }); P.E.on17((ev) => { if (ev.type === 'p31rec') merge31(save, ev.id, ev.rec); });
  P.E.start(); await P.step(0.6); P.E.r27bind(true); await P.step(P27.bound + 0.1); for (let i = 0; i < 200 && P.E.r27().ph !== 'cut'; i++) await P.step(0.1);
  for (let i = 0; i < 400; i++) { const u = P.E.r27().u; if (u >= 0.46 && u <= 0.54) break; await P.step(0.01, 0.01); }
  P.E.r27tap(); await P.step(P27.cutd + 3);
  assert.ok(P.ev('rate30').length); assert.equal(P.ev('j32new').length, 0); assert.equal(P.ev('j32page').length, 0); assert.equal(JSON.stringify(save.journal32), was, 'his journal as it was');
  assert.equal(P.save.journal32.log.length, 0, 'not even in the copy');
});

// ───────── (3) "חדש" until opened ─────────
test('build 32 (3): a page is "חדש" until opened — the tile\'s mark, the tab\'s count, the lobby\'s door; opening it (a tile, or "הבא") clears it and saves', async () => {
  const R = rig(FLAGS, { now: () => T0, where: () => JLM }); await shochet(R);
  const save = R.save, c0 = count32(save), first = groups32(save)[0].pages[0], second = groups32(save)[0].pages[1];
  assert.ok(c0.fresh >= 9 && c0.fresh === c0.n, JSON.stringify(c0));
  const list = journalHTML32(save, { tab: 'mishna' });
  assert.match(list, new RegExp(`data-j32p="${first.key}"[^>]*>[^]*?<em>חדש</em>`)); assert.match(list, new RegExp(`data-j32t="mishna"[^>]*>📜 משניות<em aria-label="חדשות">${c0.fresh}</em>`));
  assert.match(createLobby({ save, start: true }).html(), new RegExp(`data-lb="journal"[^]*חדש ${c0.fresh}`), 'the start screen\'s door');
  let saved = 0; const doc = mkDoc();
  const J = openJournal32({ doc, save, tab: 'mishna', persist: () => saved++ });
  assert.equal(doc.body.children.filter((c) => c.className === 'j32').length, 1);
  tap(J.el, { j32p: first.key, j32a: 'shochet' });
  assert.equal(J.state().page, first.key); assert.match(J.el.innerHTML, /class="pg"/); assert.match(J.el.innerHTML, new RegExp(`״${first.quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}״`));
  assert.match(J.el.innerHTML, /<span class="tt">טיוטה<\/span>/); assert.equal(saved, 1, 'saved as it opened');
  assert.match(J.el.innerHTML, new RegExp(`<span class="ix">1/${pages32('shochet').length}</span>`), 'its place in its act');
  assert.equal(save.journal32.seen[first.key], 1); assert.equal(count32(save).fresh, c0.fresh - 1);
  tap(J.el, { j32: 'next' }); assert.equal(J.state().page, second.key); assert.equal(count32(save).fresh, c0.fresh - 2); assert.equal(saved, 2);
  tap(J.el, { j32: 'list' }); assert.equal(J.state().page, null);
  const l2 = journalHTML32(save, { tab: 'mishna' }); assert.ok(!new RegExp(`data-j32p="${first.key}"[^>]*>[^<]*<b>[^<]*</b><span>[^<]*</span><em>`).test(l2), 'the opened tile: no "חדש"');
  // a page read twice is saved once; ✕ closes the sheet
  tap(J.el, { j32p: first.key, j32a: 'shochet' }); assert.equal(saved, 2);
  let closed = 0; const J2 = openJournal32({ doc, save, tab: 'roles', onClose: () => closed++ }); assert.equal(J.state().open, false, 'one sheet at a time');
  tap(J2.el, { j32: 'close' }); assert.equal(closed, 1); assert.equal(doc.body.children.filter((c) => c.className === 'j32').length, 0);
});

// ───────── (4) N מתוך M ─────────
test('build 32 (4): "N מתוך M" — M every page there is (one per quote and reference, the same line in two acts one page), N his; the pages not met are not listed (no spoilers)', async () => {
  const all = allPages32(), quoted = new Set();
  for (const id of J32.order) for (const x of SRC30[id].all) { const p = parse32(x); if (p) quoted.add(p.key); }
  assert.equal(all.size, quoted.size); assert.ok(all.size >= 40, `M = ${all.size}`);
  assert.deepEqual(all.get(parse32(SRC30.shochet.all[7]).key).acts, ['inner', 'menorah', 'shochet', 'zorek'], 'the great gate\'s line (with or without its comma): one page');
  // the המחשה notes are no pages (they stay in the act's end card)
  for (const x of [...SRC30.m22.all, ...SRC30.lamb.all, ...SRC30.zorek.all]) if (!/["״]/.test(x.replace(/[א-ת]״[א-ת]/g, ''))) assert.equal(parse32(x), null, x);
  assert.deepEqual(count32({}), { n: 0, m: all.size, fresh: 0 });
  const R = rig(FLAGS, { now: () => T0, where: () => JLM }); await shochet(R);
  const n = pages32('shochet').length, h = journalHTML32(R.save, { tab: 'mishna' });
  assert.equal(count32(R.save).n, n); assert.match(h, new RegExp(`📜 ${n} מתוך ${all.size} משניות`)); assert.match(h, /עוד משניות מחכות בבקרים הבאים/);
  for (const id of ['deshen', 'zorek', 'menorah']) for (const p of pages32(id)) if (!all.get(p.key).acts.includes('shochet')) assert.ok(!h.includes(p.quote), `${id}: "${p.quote}" not listed`);
  assert.ok(!/תרומת הדשן|זריקת הדם/.test(h), 'no group of an act not met');
  // a page: the quote, its reference, טיוטה; a lead and a note where the line has them
  const mm = parse32(SRC30.kiyor.all[1]); assert.deepEqual([mm.lead, mm.quote, mm.ref], ['הממונה', 'ימין על ימין, שמאל על שמאל', 'זבחים יט ע״ב']);
  const pen = parse32(SRC30.lamb.all[1]); assert.equal(pen.ref, 'מדות א, ו'); assert.match(pen.note, /^המחשה/);
  const wood = parse32(SRC30.m22.all[2]); assert.deepEqual([wood.lead, wood.quote, wood.gloss, wood.ref], ['עץ זית — פסול למערכה', 'משום דקטרי', 'קשרים, עשן כבד', 'תמיד כט ע״ב']);
});

// ───────── (5) הבקרים שלי ─────────
test('build 32 (5): one log entry a morning — the real date and the Hebrew one (calendar.js, by the sunset where the phone is), the morning\'s acts and ratings; newest first, 100 kept', async () => {
  const R = rig(FLAGS, { now: () => T0, where: () => JLM }); await shochet(R);
  const L = R.save.journal32.log; assert.equal(L.length, 1);
  assert.equal(L[0].d, 1); assert.equal(L[0].t, T0); assert.deepEqual(L[0].r, [['shochet', 'mehudar']]);
  const hd = hebrewDateAt(new Date(T0), JLM); assert.equal(L[0].h, `${hd.dayHe} ב${hd.monthHe} ${hd.yearHe.replace(/^[א-ת]׳/, '')}`); assert.equal(L[0].h, 'י״א בחשוון תשפ״ז');
  assert.equal(L[0].s, 1, 'the second lot\'s role ended the morning: served whole'); assert.equal(R.save.served30, 1);
  assert.equal(hebDate32(Date.parse('2026-10-22T19:30:00+03:00'), JLM), 'י״ב בחשוון תשפ״ז', 'after sunset: the next Hebrew day'); assert.match(realDate32(T0, 'Asia/Jerusalem'), /22\.10\.2026/);
  const m = journalHTML32(R.save, { tab: 'mornings' });
  assert.match(m, /🌅 שימשת בוקר אחד/); assert.match(m, /<b>יום 1<\/b><span>[^<]*22\.10\.2026<\/span><span class="hb">י״א בחשוון תשפ״ז<\/span>/); assert.match(m, /🔪 השחיטה<b class="mehudar">✦ מהודר<\/b>/);
  // the same day adds to its entry; a new day — a new entry, first; 100 kept
  const s = {}; jr32(s);
  log32(s, { d: 1, t: 1, h: 'a' }, 'kiyor', 'kasher'); log32(s, { d: 1, t: 2, h: 'b' }, 'deshen', 'mehudar'); log32(s, { d: 2, t: 3, h: 'c' }, 'kiyor', 'tikkun');
  assert.deepEqual(s.journal32.log.map((e) => [e.d, e.t, e.h, e.r]), [[2, 3, 'c', [['kiyor', 'tikkun']]], [1, 1, 'a', [['kiyor', 'kasher'], ['deshen', 'mehudar']]]]);
  for (let d = 3; d <= 140; d++) log32(s, { d, t: d }, 'kiyor', 'kasher');
  assert.equal(s.journal32.log.length, J32.logMax); assert.equal(s.journal32.log[0].d, 140); assert.equal(s.journal32.log[J32.logMax - 1].d, 41);
  assert.equal(served32(s, 140), true); assert.equal(served32(s, 140), false);
});

// ───────── (6) the unlock moment ─────────
test('build 32 (6): the unlock card — the first time the lot gives a role: as its rating word ends the day waits under "עמוד חדש ביומן" (the first page ever: "היומן שלך נפתח"); "המשך" lets it go on; never on a repeat', async () => {
  const R = rig(FLAGS, { now: () => T0, where: () => JLM, j32hold: true }); await shochet(R);
  const r = R.ev('rate30').find((e) => e.id === 'shochet'); assert.ok(r); assert.ok(R.E.j32q() || R.E.j32card());
  for (let i = 0; i < 40 && !R.ev('j32new').length; i++) await R.step(0.1);
  const c = R.ev('j32new')[0]; assert.ok(c, 'the card'); assert.deepEqual([c.id, c.hello], ['shochet', true], 'a fresh save: its first page — the journal opens');
  assert.ok(c.t - r.t >= RATE30.wordS - 0.11 && c.t - r.t <= RATE30.wordS + 0.21, `as the word ends (${(c.t - r.t).toFixed(2)} s)`);
  assert.equal(R.E.state().paused, true); assert.deepEqual(R.E.j32card(), { id: 'shochet', hello: true }); assert.equal(R.save.journal32.hello, true);
  const t0 = R.E.st33.t; await R.step(5); assert.equal(R.E.st33.t, t0, 'the day waits — no countdown, nothing moves'); assert.equal(R.ev('j32new').length, 1);
  assert.equal(R.E.j32done(), true); assert.equal(R.E.state().paused, false); assert.equal(R.E.j32done(), false); await R.step(0.5); assert.ok(R.E.st33.t > t0);
  // the next morning the shochet again (a repeat): no card; another new role: its card, no "היומן שלך נפתח"
  const save = R.save; save.day33state = { ...save.day33state, night: true };
  const S = rig(FLAGS, { save, now: () => T0 + 86400e3, where: () => JLM, j32hold: true }); await shochet(S); await S.step(3);
  assert.equal(S.E.st33.day, 2); assert.ok(S.ev('rate30').some((e) => e.id === 'shochet')); assert.equal(S.ev('j32new').length, 0, 'a repeat: no card'); assert.equal(S.E.state().paused, false);
  assert.equal(save.journal32.log.length, 2); assert.equal(save.journal32.log[0].d, 2);
  // an older save (build 31) whose roles were had: no card on their repeats; a role it never had — its card, without the journal's opening
  const old = OLD(); delete old.roles23.shochet;
  const O = rig(FLAGS, { save: old, now: () => T0, where: () => JLM, j32hold: true }); await shochet(O); for (let i = 0; i < 40 && !O.ev('j32new').length; i++) await O.step(0.1);
  assert.deepEqual(O.ev('j32new').map((e) => [e.id, e.hello]), [['shochet', false]]);
  const O2 = OLD(); const Q = rig(FLAGS, { save: O2, now: () => T0, where: () => JLM, j32hold: true }); await shochet(Q); await Q.step(3); assert.equal(Q.ev('j32new').length, 0, 'had in build 31: no card');
  // the laver is no lot role: a page, but no card (unless it is the journal's first page ever)
  const k = {}; jr32(k); k.journal32.hello = true; assert.deepEqual(meet32(k, 'kiyor', { d: 1 }), { id: 'kiyor', fresh: true, hello: false, card: false });
  const f = {}; jr32(f); assert.equal(meet32(f, 'kiyor', { d: 1 }).hello, true);
  // the engine's code: only outside practice, only with the focused day's events, the day paused under it, the second lot waits
  const d = read('src/avodah/shift/day33.js');
  assert.match(d, /if \(!prac\) j32end\(id, rating\);/); assert.match(d, /if \(m && b17 && \(m\.card \|\| m\.hello\) && !st\.j32q && !st\.j32card\)/); assert.match(d, /if \(j32Step\(\)\) return st;/);
  assert.match(d, /st\.j32card = \{ id: Q\.id, hello: Q\.hello \};\n\s*st\.paused = true;/); assert.match(d, /function j32lot\(k26\) \{\n\s*if \(prac\) return;/);
});
test('build 32 (6): the card — "עמוד חדש ביומן: ‹התפקיד›", its main source line with its reference and טיוטה, the count, "לפתוח ביומן" (that page, the day waiting) and "המשך"', async () => {
  for (const id of J32.roles) {
    const h = unlockHTML32({ id, save: {} }), p = mainPage32(id);
    assert.match(h, new RegExp(`עמוד חדש ביומן: [^<]*${({ deshen: 'תרומת הדשן', m22: 'סידור המערכה', lamb: 'בדיקת הטלה', inner: 'דישון מזבח הפנימי', menorah: 'דישון המנורה', shochet: 'השחיטה', zorek: 'זריקת הדם' })[id]}`), id);
    assert.ok(h.includes(`״${p.quote}״`) && h.includes(`${p.ref} · טיוטה`), id); assert.match(h, /data-j32u="open">📖 לפתוח ביומן/); assert.match(h, /data-j32u="go">המשך/); assert.ok(!/היומן שלך נפתח/.test(h));
    assert.equal(p.key, parse32(SRC30[id].chip).key, `${id}: the end line's page`);
  }
  const hello = unlockHTML32({ id: 'kiyor', hello: true, save: {} }); assert.match(hello, /📖 היומן שלך נפתח/); assert.match(hello, /עמוד ראשון: 💧 קידוש ידיים ורגליים/);
  assert.ok(!/\d+:\d\d|(^|[^מ])שניות|מהר|לפני ש/.test(unlockHTML32({ id: 'zorek', save: {} })), 'no clock, no hurry');   // (משניות is no "seconds")
  // the module: the card on "j32new"; "המשך" → the day goes on; "לפתוח ביומן" → the journal on that page (read-only), the day waits till it closes
  const R = rig(FLAGS, { now: () => T0, where: () => JLM, j32hold: true }), doc = mkDoc(), U = createUnlock32({ E: R.E, doc });
  await shochet(R); for (let i = 0; i < 40 && !U.state().card; i++) await R.step(0.1);
  assert.equal(U.state().card, true); const card = doc.body.children.find((x) => x.className === 'j32-u'); assert.match(card.innerHTML, /עמוד חדש ביומן: 🔪 השחיטה|היומן שלך נפתח/);
  tap(card, { j32u: 'open' }); assert.equal(U.state().card, false); assert.equal(U.state().journal, true); assert.equal(R.E.state().paused, true, 'the day still waits');
  const J = doc.body.children.find((x) => x.className === 'j32'); assert.match(J.innerHTML, new RegExp(`data-key="${mainPage32('shochet').key}"`)); assert.ok(!/data-p31=/.test(journalHTML32(R.save, { tab: 'roles', note31: true })));
  assert.equal(R.save.journal32.seen[mainPage32('shochet').key], 1);
  tap(J, { j32: 'close' }); assert.equal(U.state().journal, false); assert.equal(R.E.state().paused, false, 'the journal closed: the day goes on');
  U.destroy();
  const R2 = rig(FLAGS, { now: () => T0, where: () => JLM, j32hold: true }), d2 = mkDoc(), U2 = createUnlock32({ E: R2.E, doc: d2 });
  await shochet(R2); for (let i = 0; i < 40 && !U2.state().card; i++) await R2.step(0.1);
  tap(d2.body.children.find((x) => x.className === 'j32-u'), { j32u: 'go' }); assert.equal(U2.state().card, false); assert.equal(R2.E.state().paused, false); assert.equal(U2.state().conts, 1);
  const b = read('src/avodah/shift/book32.js'), red = (hex) => { const v = hex.replace('#', '').slice(0, 6), r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), bl = parseInt(v.slice(4, 6), 16); return r > 180 && g < 120 && bl < 120; };
  for (const c of b.match(/#[0-9A-Fa-f]{6}/g)) assert.ok(!red(c), c);
  assert.match(read('src/avodah/shift/focus17.js'), /u32 = createUnlock32\(\{ E, sfx: o\.sfx, doc \}\);/);
});

// ───────── (7) the summary opens today's sources ─────────
test('build 32 (7): the day\'s summary — "📜 המקורות של היום" opens the journal\'s משניות, today\'s only (the day\'s acts and the lot that gave them); "כל המשניות" shows the rest', async () => {
  const f = read('src/avodah/shift/focus17.js'), sum = f.slice(f.indexOf('function showSummary'), f.indexOf('function closeSummary'));
  assert.match(sum, /openJournal32\(\{ doc, save: E\.book31\(\), tab: 'mishna', today: \(sum\.ratings \|\| \[\]\)\.map\(\(x\) => x\.id\), dayN: sum\.day \| 0, note31: true,/);
  assert.match(sum, /data-f17="src">📜 המקורות של היום/); assert.match(sum, /openJournal32\(\{ doc, save: E\.book31\(\), tab: 'roles', note31: true,/);
  assert.deepEqual(today32(['shochet']), ['lot2', 'shochet']); assert.deepEqual(today32(['kiyor', 'lamb', 'menorah']), ['kiyor', 'lot', 'lamb', 'lot2', 'menorah']);
  const save = OLD(); jr32(save);
  const h = journalHTML32(save, { tab: 'mishna', today: ['shochet'], dayN: 7 });
  assert.match(h, /📜 המקורות של היום — יום 7/); assert.match(h, /data-j32="all">כל המשניות/);
  assert.deepEqual([...h.matchAll(/<h3>[^<]*<\/h3>/g)].map((m) => m[0]), ['<h3>☝ הפיס השני</h3>', '<h3>🔪 השחיטה</h3>']);
  const all = journalHTML32(save, { tab: 'mishna' }); assert.ok([...all.matchAll(/<h3>/g)].length >= 9);
  // on the engine: the summary's acts are the day's
  const R = rig(FLAGS, { now: () => T0, where: () => JLM }); await shochet(R); await R.step(3); R.E.debug.night(); await R.step(0.3);
  const s = R.E.focus17().summary; assert.deepEqual(s.ratings.map((x) => x.id), ['shochet']); assert.deepEqual(groups32(R.save, s.ratings.map((x) => x.id)).map((g) => g.id), ['shochet']);
  // the source card at an act's end no longer says the journal is "בקרוב"
  assert.ok(!/ביומן הכהן \(בקרוב\)/.test(read('src/avodah/shift/end30.js')));
});

// ───────── (8) an older save ─────────
test('build 32 (8): an older save — its journal made once from what it had: the roles had (a practice-only one not), the laver, the two lots → their pages; no log entry made up; "היומן שלך נפתח" not shown', () => {
  const save = OLD(), j = jr32(save);
  assert.deepEqual(Object.keys(j.acts), ['kiyor', 'lot', 'deshen', 'm22', 'lamb', 'lot2', 'inner', 'menorah', 'shochet'], 'zorek: practice runs only — not had');
  assert.ok(Object.values(j.acts).every((a) => a.old === 1 && a.t === 0)); assert.deepEqual(j.log, []); assert.equal(j.hello, true); assert.deepEqual(j.seen, {});
  assert.equal(jr32(save), j, 'made once'); save.roles23.zorek.n = 9; assert.ok(!jr32(save).acts.zorek, 'not re-made from the records later (a role\'s first end makes its page — and its card)');
  const c = count32(save); assert.ok(c.n > 30 && c.fresh === c.n, JSON.stringify(c));
  const m = journalHTML32(save, { tab: 'mornings' }); assert.match(m, /שימשת 5 בקרים/); assert.match(m, /ועוד 5 בקרים מלפני היומן/); assert.ok(!/class="mo"/.test(m), 'no entry made up');
  const pg = journalHTML32(save, { tab: 'mishna', page: groups32(save)[0].pages[0].key }); assert.match(pg, /נכנס ליומן מהבקרים שלפני היומן/);
  // the shift's mount makes it at once (the lobby's door counts it); the day's start too, before any act adds to a record
  assert.match(read('src/avodah/shift/index.js'), /try \{ jr32\(save\); \} catch/); assert.match(read('src/avodah/shift/day33.js'), /if \(!prac\) jr32\(save\);/);
  const fresh = {}; assert.equal(jr32(fresh).hello, false); assert.deepEqual(fresh.journal32.acts, {});
  for (const bad of [null, 'x', [1]]) assert.equal(jr32(bad), null);
  const odd = { journal32: { acts: [], seen: 3, log: {} } }; const jo = jr32(odd); assert.deepEqual([jo.acts, jo.seen, jo.log], [{}, {}, []]);
});

// ───────── (9) the lobby: one door, and the build's number ─────────
test('build 32 (9): the lobby — one door "יומן הכהן" on the full screen (in place of the titles\' card and ספר הזכרונות), a small one beside "משחק קצר"; the footers from one constant', () => {
  const save = OLD(); jr32(save);
  const full = createLobby({ save, start: false }).html(), start = createLobby({ save, start: true }).html(), lock = createLobby({ save, lock: { locked: true, kind: 'shabbat', opensAt: Date.now() + 3600e3 } }).html();
  assert.equal((full.match(/data-lb="journal"/g) || []).length, 1); assert.ok(!/data-lb="(book|roles)"/.test(full), 'no separate ספר הזכרונות / titles door');
  assert.match(full, /data-lb="journal"><b>📖 יומן הכהן<\/b>[^]*שימשת[^]*📜 משניות<\/span><span>\d+\/\d+[^]*🏅 אותות<\/span><span>2\/15/);
  assert.match(start, /<div class="lb-sr"><button class="lb-door" type="button" data-lb="games">[^]*משחק קצר[^]*<\/button><button class="lb-door lb-jd" type="button" data-lb="journal"/);
  assert.equal(GAME_BUILD, 47);   // ── fable32 (build 33) ── (the one constant moved on) ── /fable32 ── (build 34: 34) (build 35: 35) (build 36: 36) (build 37: 37) (build 38: 38) (build 39: 39) (build 40: again) (build 41: again) (build 42: again) (build 43: again) (build 44: again) (build 45: again) (build 46: again) (build 47: again)
  for (const h of [full, start, lock]) assert.match(h, new RegExp(`class="lb-draft">[^<]*בנייה ${GAME_BUILD}<`));
  const lb = read('src/avodah/shift/lobby35.js'); assert.ok(!/בנייה 13|בנייה 29/.test(lb.replace(/\/\/[^\n]*|\/\*[^]*?\*\//g, '')), 'no build number written by hand'); assert.equal((lb.match(/בנייה \$\{GAME_BUILD\}/g) || []).length, 3);
  assert.match(lb, /\.lb \.lb-side \.lb-jd\{min-width:60px;flex-direction:column/); assert.match(lb, /\.lb \.lb-new\{[^}]*background:#FFD66E/);
  const calls = []; const Lb = createLobby({ save, on: { journal: (f) => calls.push(f), book: () => calls.push('book') } });
  assert.equal(Lb.pick('journal'), true); assert.equal(Lb.pick('book'), true); assert.deepEqual(calls, ['full', 'book']);
  const Ls = createLobby({ save, start: true, on: { journal: (f) => calls.push(f) } }); Ls.pick('journal'); assert.equal(calls[2], 'start');
  // shift/index.js: the door, ספר הזכרונות (the journal's אותות) and the practice doors' book are the journal; "חזרה" from practice reopens it
  const ix = read('src/avodah/shift/index.js');
  assert.match(ix, /journal: \(from\) => openJournal\('roles', from === 'start' \? 'start' : 'full'\)/); assert.match(ix, /if \(!globalThis\.__SH_OLDBOOK\) \{ openJournal\('badges', 'full'\); return; \}/);
  assert.match(ix, /function openRoles31\(from = 'full'\) \{\n\s*return openJournal\('roles', from\);/); assert.match(ix, /practice: \(id\) => runPractice\(id, from\), can: \(id\) => canPractice31\(save, id, on31\(\)\)/);
  assert.match(ix, /querySelectorAll\('\.p23-bk, \.j32'\)/);
  assert.match(ix, /function teardown\(\) \{\n\s*try \{ if \(doc\) doc\.querySelectorAll\('\.j32'\)\.forEach/, 'a journal left open goes with the day (and at the lock)');
});

// ───────── the Divine Name ─────────
test('build 32: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too) nor in any word the journal can show', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/journal32.js', 'src/avodah/shift/book32.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/end30.js', 'src/avodah/shift/pis23.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/index.js',
    'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'test/build32.test.mjs', 'test/build30.test.mjs', 'test/build31.test.mjs', 'test/rig33.mjs', 'PROJECT.md'];
  const hits = []; for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const save = OLD(); jr32(save); log32(save, { d: 7, t: T0, h: hebDate32(T0, JLM) }, 'shochet', 'mehudar');
  const words = [...['roles', 'mishna', 'mornings', 'badges'].map((tab) => journalHTML32(save, { tab, practice: () => {} })), ...[...allPages32().keys()].map((page) => journalHTML32({ ...save, journal32: { ...save.journal32, acts: Object.fromEntries(J32.order.map((x) => [x, { d: 1 }])) } }, { page })), ...J32.order.map((id) => unlockHTML32({ id, hello: true, save }))].join(' ');
  for (const r of res) assert.ok(!r.test(words));
  void PRAC31;
});
