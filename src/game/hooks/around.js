/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/around.js — HOOK20 (wave 20, "המסביב"): the rules of what the kid does when he is not working. Pure: the save in, numbers and
 * lines out (the DOM is hooks/around-ui.js). Nothing random, nothing lost, nothing pressing; a broken streak is "יום 1 מחדש".
 *   ensure(G)                  G.seen (the tabs' seen marks) and G.around (days, today's work, best grades, kin rows) — made when missing
 *   counts(G, kings)           the five dock badges [crews, kings, book, daily, store] — a number only when something NEW waits behind it
 *   opened(G, tab)             the tab was opened: its badge goes (the marks are in the save, never in localStorage alone)
 *   event(G, type, d, o)       the game's events → the daily counter, today's work, best grades
 *   streak(G, day) · today(G, day) · tomorrow(G, day)   the live board's numbers
 *   slots (below)              several kohanim on one phone: the keys, the rows, the ranking; the 6-char family code (numbers only)
 * Texts are drafts (טיוטה): the UI's words.
 * ──────────────────────────────────────────────────────────────────────────── */
import { STAGES } from '../content.js';
import * as S from '../state.js';
import { chapter, CHAPTERS } from '../middot-quiz.js';
import { titleOf } from '../score.js';
import { isRead } from '../learn.js';

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const nz = (v) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
export const MAXDAYS = 400;

/** every key that is "new" right now, per tab (a fresh snapshot marks them all seen: an old save never flashes) */
function present(G) {
  const book = {};
  for (const k of Object.keys((G.book && G.book.un) || {})) book['f:' + k] = 1;
  try { for (const c of CHAPTERS) if (chapter(G, c).ready) book['q:' + c] = 1; } catch (e) { /* the quiz's */ }
  const store = {};
  for (const s of STAGES) { const st = S.statusOf(G, s.id); if (st === 'avail' || st === 'done') store['s:' + s.id + ':' + st] = 1; }
  const coins = Array.isArray(G.dinars) ? G.dinars.length : 0, t = titleOf(coins);
  if (t) store['t:' + t] = 1;
  return { book, store };
}
const idleCrews = (G) => (Array.isArray(G.crews) ? G.crews.filter((c) => !c.at).length : 0);

export function ensure(G) {
  if (!G) return null;
  if (!isObj(G.seen)) {
    const p = present(G);
    G.seen = { daily: 0, crews: idleCrews(G), book: p.book, store: p.store, riddle: '' };
  }
  const Z = G.seen;
  Z.daily = nz(Z.daily); Z.crews = nz(Z.crews);
  if (!isObj(Z.book)) Z.book = {}; if (!isObj(Z.store)) Z.store = {}; if (typeof Z.riddle !== 'string') Z.riddle = '';
  if (!isObj(G.around)) G.around = {};
  const A = G.around;
  if (!Array.isArray(A.days)) A.days = [];
  if (!isObj(A.best)) A.best = {};
  if (!Array.isArray(A.kin)) A.kin = [];
  return Z;
}

/** the five badges. quiet(first minutes): the caller zeroes them. riddleNew: today's riddle exists and is unsolved and unseen */
export function counts(G, kings = 0, o = {}) {
  const Z = ensure(G); if (!Z) return [0, 0, 0, 0, 0];
  const p = present(G), idle = idleCrews(G);
  if (idle < Z.crews) Z.crews = idle;   // (a crew sent to work: the next idle one is new again)
  const crews = Math.max(0, idle - Z.crews);
  let book = 0; for (const k of Object.keys(p.book)) if (!Z.book[k]) book++;
  if (o.riddleDay && Z.riddle !== o.riddleDay && !o.riddleSolved) book++;
  let store = 0; for (const k of Object.keys(p.store)) if (!Z.store[k]) store++;
  return [crews, nz(kings), book, Math.min(99, Z.daily), store];
}
/** the tab opened: everything on it is seen. tab: 'crews' | 'kings' | 'book' | 'daily' | 'store' */
export function opened(G, tab, o = {}) {
  const Z = ensure(G); if (!Z) return;
  if (tab === 'daily') Z.daily = 0;
  else if (tab === 'crews') Z.crews = idleCrews(G);
  else if (tab === 'book') { Object.assign(Z.book, present(G).book); if (o.riddleDay) Z.riddle = o.riddleDay; }
  else if (tab === 'store') Object.assign(Z.store, present(G).store);
}

/** the calendar day's key (state.js dayKey) · Saturday (JS 6) keeps a streak alive: Shabbat costs nothing */
export const dayOf = (t) => S.dayKey(t);
const dayNum = (k) => { const [y, m, d] = String(k).split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
const isSat = (k) => new Date(dayNum(k) * 86400000).getUTCDay() === 6;
/** a play day, once; today's work resets with the day */
export function rollDay(G, day) {
  const Z = ensure(G); if (!Z || !day) return null;
  const A = G.around;
  if (!A.days.includes(day)) { A.days.push(day); if (A.days.length > MAXDAYS) A.days.splice(0, A.days.length - MAXDAYS); }
  if (A.day !== day) { A.day = day; A.s0 = nz(G.score); A.st0 = nz(G.stats && G.stats.stones); A.dn0 = Array.isArray(G.dinars) ? G.dinars.length : 0; A.courses = 0; A.jobs = 0; }   // (dn0: board21, the demos' pace)
  return A;
}
/** the run of play days ending today (or yesterday: today is still ahead). 0 when it was broken: the board says "יום 1 מחדש" */
const keyN = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
export function streak(G, day) {
  const Z = ensure(G); if (!Z) return { n: 0, fresh: true, days: 0 };
  const set = new Set(G.around.days), t = dayNum(day);
  if (!set.has(day) && !set.has(keyN(t - 1))) return { n: 0, fresh: true, days: set.size };
  let n = 0, d = set.has(day) ? t : t - 1;
  for (;;) {
    const k = keyN(d);
    if (set.has(k)) { n++; d--; } else if (isSat(k) && set.has(keyN(d - 1))) { d--; } else break;   // (a Saturday between two play days does not break it)
  }
  return { n, fresh: n <= 1, days: set.size };
}
export function today(G, day) {
  rollDay(G, day);
  const A = G.around;
  return { courses: nz(A.courses), jobs: nz(A.jobs), stones: Math.max(0, nz(G.stats && G.stats.stones) - nz(A.st0)), pts: Math.max(0, nz(G.score) - nz(A.s0)) };
}
/** the game's events → the counters. o.craft: the craft played (for the best grade) */
export function event(G, type, d = {}, o = {}) {
  const Z = ensure(G); if (!Z) return;
  const day = o.day || dayOf(o.now || Date.now()); rollDay(G, day);
  const A = G.around;
  if (type === 'jobDone') {
    A.jobs = nz(A.jobs) + 1; Z.daily++;
    const c = o.craft || 'סתתים', s = nz(d.stars);
    if (s > nz(A.best[c])) A.best[c] = s;
  } else if (type === 'course') { if (d && !d.away) { A.courses = nz(A.courses) + 1; Z.daily++; } }
  else if (type === 'dinar' || type === 'riddleSolved') Z.daily++;
}

/** what opens tomorrow — a known tease, never a prize: the stage that opens next, else tomorrow's riddle's title */
export function tomorrowLine(G, riddleTitle) {
  const next = STAGES.find((x) => S.statusOf(G, x.id) === 'avail');
  const bits = [];
  if (riddleTitle) bits.push(`חידה חדשה: ${riddleTitle}`);
  if (next) bits.push(`ממשיכים ב${next.n}`);
  return bits.length ? bits.join(' · ') : 'יום חדש במקדש';
}

/* ───────── the near circle: several kohanim on one phone (a family) + a 6-character code that carries numbers only ───────── */
export const SLOT_INDEX = 'bh_slots', SLOT_PTR = 'bh_slot';
/** the save key of a slot: the first kohen keeps today's key (no one's save moves) */
export const slotKey = (id) => (!id || id === 'main' ? S.SAVE_KEY : 'bh_save_' + String(id).replace(/[^a-z0-9_]/gi, '').slice(0, 12));
export function slotsList(store = S.storage) {
  let a = []; try { a = JSON.parse(store.get(SLOT_INDEX) || '[]'); } catch (e) { a = []; }
  a = Array.isArray(a) ? a.filter((x) => typeof x === 'string' && x) : [];
  if (!a.includes('main')) a.unshift('main');
  return a;
}
export const slotCur = (store = S.storage) => { const c = store.get(SLOT_PTR) || 'main'; return slotsList(store).includes(c) ? c : 'main'; };
export function slotAdd(store = S.storage) {
  const a = slotsList(store); let i = a.length + 1, id; do { id = 'k' + i++; } while (a.includes(id));
  a.push(id); store.set(SLOT_INDEX, JSON.stringify(a)); return id;
}
export const slotSwitch = (id, store = S.storage) => { if (!slotsList(store).includes(id)) return false; store.set(SLOT_PTR, id); return true; };
/** the numbers of one save: name, dinars, stones, streak (the profile line) */
export function lineOf(G, day) {
  if (!G) return null;
  const dn = Array.isArray(G.dinars) ? G.dinars.length : 0, st = nz(G.stats && G.stats.stones);
  const ds = G.around && Array.isArray(G.around.days) ? G.around.days : [];
  const sk = streak({ around: { days: ds }, seen: {} , score: 0, stats: {} }, day).n;
  return { name: String(G.name || '').trim(), d: dn, s: st, t: sk, score: nz(G.score) };
}
export function slotRows(store = S.storage, day, live = null) {
  const cur = slotCur(store);
  return slotsList(store).map((id) => {
    let G = null;
    if (id === cur && live) G = live; else { try { G = JSON.parse(store.get(slotKey(id)) || 'null'); } catch (e) { G = null; } }
    const L = G ? lineOf(G, day) : null;
    return { id, cur: id === cur, name: (L && L.name) || 'כהן חדש', d: L ? L.d : 0, s: L ? L.s : 0, t: L ? L.t : 0, score: L ? L.score : 0, kin: false };
  });
}
/** the ranking: dinars, then stones, then the streak (ties keep the order of the phone) */
export const rank = (rows) => rows.map((r, i) => ({ ...r, _i: i })).sort((a, b) => b.d - a.d || b.s - a.s || b.t - a.t || a._i - b._i).map(({ _i, ...r }) => r);

const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // 32 symbols, no 0/O/1/I
const chk = (d, s, t) => (d * 7 + s * 3 + t * 5 + 1) & 7;
/** the family code: dinars (7 bits) · stones (13) · streak (7) · check (3) = 30 bits = 6 symbols. Numbers only — no name travels */
export function codeOf(L) {
  const d = Math.min(127, nz(L.d)), s = Math.min(8191, nz(L.s)), t = Math.min(127, nz(L.t));
  let v = (((d * 8192 + s) * 128 + t) * 8 + chk(d, s, t));
  let out = ''; for (let i = 0; i < 6; i++) { out = AL[v % 32] + out; v = Math.floor(v / 32); }
  return out;
}
export function parseCode(str) {
  const c = String(str || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').slice(0, 6);
  if (c.length !== 6) return null;
  let v = 0; for (const ch of c) { const i = AL.indexOf(ch); if (i < 0) return null; v = v * 32 + i; }
  const k = v % 8; v = Math.floor(v / 8);
  const t = v % 128; v = Math.floor(v / 128);
  const s = v % 8192, d = Math.floor(v / 8192);
  if (d > 127 || k !== chk(d, s, t)) return null;
  return { d, s, t };
}
/** a typed code adds (or replaces, by label) a row of "אחי / בן דוד" in the save */
export function addKin(G, label, code, now = Date.now()) {
  const Z = ensure(G), p = parseCode(code), name = String(label || '').trim().slice(0, 14);
  if (!Z || !p || !name) return false;
  const K = G.around.kin, i = K.findIndex((x) => x.name === name);
  const row = { name, d: p.d, s: p.s, t: p.t, at: now };
  if (i >= 0) K[i] = row; else if (K.length < 12) K.push(row); else return false;
  return true;
}
export const kinRows = (G) => ((G && G.around && Array.isArray(G.around.kin)) ? G.around.kin.map((k) => ({ id: 'kin:' + k.name, cur: false, name: k.name, d: nz(k.d), s: nz(k.s), t: nz(k.t), score: 0, kin: true })) : []);

/** a tab that calls (nudge.js): what it calls for is new again — the entries still unread, the idle crew — so its badge shows until the tab is opened */
export function recall(G, tab) {
  const Z = ensure(G); if (!Z) return;
  if (tab === 'book') { for (const k of Object.keys((G.book && G.book.un) || {})) if (!isRead(G, k)) delete Z.book['f:' + k]; }
  else if (tab === 'crews') Z.crews = 0;
}

// ── board21 ── the demo kohanim: a player with no family sees three computer kohanim to compare himself with ("דמות לדוגמה", never a child).
// Pure and deterministic: the numbers come from the player's own START-OF-DAY snapshot (so he can pass them by playing today) and a wobble
// of the date's text; nothing random. One slightly ahead (x1.2 dinars/stones, +1 day), one level, one behind (x0.8, -1 day).
export const DEMO_NAMES = Object.freeze(['יהויריב', 'ידעיה', 'חרים']);   // the first three משמרות (דברי הימים א׳ כ״ד)
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); };
export function demoRows(G, day) {
  const Z = ensure(G); if (!Z) return [];
  rollDay(G, day);
  const A = G.around, d0 = A.dn0 == null ? (Array.isArray(G.dinars) ? G.dinars.length : 0) : nz(A.dn0), s0 = nz(A.st0), t0 = streak(G, day).n;
  const w = (i) => hash(day + '|' + DEMO_NAMES[i]) % 3;                   // 0..2 stones of the day's wobble
  const mk = (i, d, s, t) => ({ id: 'demo:' + i, cur: false, name: DEMO_NAMES[i], d, s, t, score: 0, kin: false, demo: true });
  return [
    mk(0, Math.ceil(d0 * 1.2), Math.ceil(s0 * 1.2) + 3 + w(0), t0 + 1),
    mk(1, d0, s0 + 1 + (w(1) > 1 ? 1 : 0), t0),
    mk(2, Math.floor(d0 * 0.8), Math.floor(s0 * 0.8), Math.max(0, t0 - 1)),
  ];
}
/** real family rows = the other kohanim of the phone + the typed kin (the player's own row is not family) */
export const realFamily = (rows) => rows.filter((r) => !r.cur && !r.demo).length;
/** are the demos shown? ⚑ default: shown until 2 real family rows; the player's toggle (G.around.demo = 'show'|'hide') wins */
export function demosShown(G, rows) {
  const Z = ensure(G); if (!Z) return false;
  if (G.around.demo === 'show') return true; if (G.around.demo === 'hide') return false;
  return realFamily(rows) < 2;
}
/** the board: real rows ranked; with no family the demos stand in the ranking; with family they drop to the bottom (ranked among themselves) */
export function boardRows(G, day, store, live = G) {
  rollDay(G, day);
  const real = rank([...slotRows(store, day, live), ...kinRows(G)]);
  const demos = demoRows(G, day);
  const fam = realFamily(real), shown = demosShown(G, real);
  let rows;
  if (fam === 0) rows = shown ? rank([...real, ...demos]) : real;
  else rows = shown ? [...real, ...rank(demos)] : real;
  // ties: the player before a demo (rank() keeps input order: real rows come first)
  return { rows, fam, shown, demos: shown };
}
/** the player's place among the rows ranked together (1-based), 0 if none */
export const placeOf = (rows) => { const i = rows.findIndex((r) => r.cur); return i < 0 ? 0 : i + 1; };
/** the rank-up: compares the place with the one seen at the last open (same set of rows only: key); stores the new place — the stamp shows once */
export function rankSeen(G, place, key = '') {
  const Z = ensure(G); if (!Z || !place) return { up: false, place };
  const last = nz(G.around.rank), same = String(G.around.rankKey || '') === String(key);
  G.around.rank = place; G.around.rankKey = String(key);
  return { up: same && last > 0 && place < last, place, last };
}
// ── /board21 ──
