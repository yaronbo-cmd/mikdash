/* ─────────────────────────────────────────────────────────────────────────────
 * state.js: the Phase B rules: pure functions over a plain save object A. No DOM, no world, no clock:
 * every time-dependent function takes `now` (ms) or a day key, so the rules are testable. Storage is injected.
 *
 * Save v1 (key 'bh_avodah'):
 *   { v:1, pid, created, lastSeen, name, mishmar, fromA,
 *     book:{[stepId]:{t,n,live}}          ספר העבודה: the 40 steps of the day (tamid.json ids)
 *     games:{[gameId]:{n,t,live,best}}    mini-games played
 *     roles:{[roleId]:n}                  the 13 roles of the second lottery, done "for real"
 *     lots:{day,deshen,role,ketoret,evarim}  today's lotteries (Jerusalem day), drawn once per day
 *     ketoret:{done,day,tries,lastTry}    "חדשים לקטורת": offered once in a lifetime (Yoma 26a)
 *     streak:{day,n,best}                 Shabbat and Yom Tov never break it
 *     points, live:{[day]:[segId]}, collect:{[id]:t}, stats:{services,pilgrims,correct,wrong} }
 * The Phase A save ('bh_beta2') is only READ (name, mishmar, trained priests).
 * ──────────────────────────────────────────────────────────────────────────── */
export const SAVE_KEY = 'bh_avodah';
export const PHASE_A_KEY = 'bh_beta2';
export const VERSION = 1;
export const ROLE_IDS = ['shochet', 'zorek', 'dishun-mizbeach', 'dishun-menorah', 'rosh-regel', 'yadayim', 'oketz-regel', 'chaze-gera', 'dofanot', 'kerayim', 'solet', 'chavitin', 'yayin'];
/** Points needed to "meet" each of the 15 ממונים (Shekalim 5:1), the rank ladder.
 *  ── hooks ── tuned by the playtest bots (docs/PLAYTEST.md, Phase B): the first morning (~370) meets two, a daily
 *  regular (tail + ritual, ~125 a day) four in the first week and the fifteenth after ~2 months (a player at every dawn
 *  service, ~270 a day: ~4 weeks; the 3-minute ritual alone, ~65 a day: ~4 months); the old
 *  ladder (…, 2100, 2400) gave five in the first session and all fifteen in about eight days of full mornings. */
export const RANKS = [20, 110, 450, 800, 1150, 1550, 2000, 2500, 3050, 3650, 4300, 5000, 5750, 6550, 7400];
/** again: a game played again on the same Jerusalem day (── hooks ──: the first play of the day counts in full) */
export const POINTS = { game: 10, newStep: 5, live: 5, forReal: 10, pilgrim: 4, perfect: 3, again: 3 };

/* ───────── storage (localStorage throws in sandboxed iframes / private mode) ───────── */
export const storage = {
  get(k) { try { return globalThis.localStorage ? globalThis.localStorage.getItem(k) : null; } catch (e) { return null; } },
  set(k, v) { try { globalThis.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  remove(k) { try { globalThis.localStorage.removeItem(k); } catch (e) { /* unavailable */ } },
};

/* ───────── seeded randomness (fair lotteries) ───────── */
/** FNV-1a 32-bit hash of a string. */
export function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** mulberry32 PRNG from a seed → () => [0, 1). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const dayNum = (day) => Math.round(Date.parse(day + 'T12:00:00Z') / 864e5);
/** 'YYYY-MM-DD' of the local calendar day of t. */
export function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function addDays(key, n) { const d = new Date(Date.parse(key + 'T12:00:00Z') + n * 864e5); return d.toISOString().slice(0, 10); }

/* ───────── create / load / save ───────── */
export function fresh(now = Date.now(), pid = null) {
  return {
    v: VERSION, pid: pid || ('p' + (hash(String(now) + ':' + Math.random()) >>> 0).toString(36)), created: now, lastSeen: now,
    name: '', mishmar: 0, fromA: false,
    book: {}, games: {}, roles: {}, lots: null,
    ketoret: { done: false, day: '', tries: 0, lastTry: '' },
    streak: { day: '', n: 0, best: 0 },
    points: 0, live: {}, collect: {}, stats: { services: 0, pilgrims: 0, correct: 0, wrong: 0 },
  };
}
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** v0 (no version) / v1 → v1. Later versions add steps here. */
export function migrate(p, now = Date.now()) {
  const base = fresh(now, typeof p.pid === 'string' && p.pid ? p.pid : null);
  const A = { ...base, ...p };
  for (const k of ['book', 'games', 'roles', 'live', 'collect']) if (!isObj(A[k])) A[k] = {};
  A.ketoret = { ...base.ketoret, ...(isObj(p.ketoret) ? p.ketoret : {}) };
  A.streak = { ...base.streak, ...(isObj(p.streak) ? p.streak : {}) };
  A.stats = { ...base.stats, ...(isObj(p.stats) ? p.stats : {}) };
  A.points = Math.max(0, num(A.points, 0));
  A.mishmar = Math.min(24, Math.max(0, Math.round(num(A.mishmar, 0))));
  A.name = typeof A.name === 'string' ? A.name.slice(0, 24) : '';
  if (A.lots && !isObj(A.lots)) A.lots = null;
  if (!isObj(A.day)) A.day = { n: 1, h: 18, stock: {}, tasks: {}, pts: 0, total: 0 };   // ── engine22 ── "יום במקדש" (src/avodah/day): the day number, the hour, the stores, the errands, the points
  pitumNorm(A); dirNorm(A);   // ── service13 ── the ketoret he compounded, the pens and the lambs' chamber he tended
  A.v = VERSION;
  return A;
}

/** Load the save (or start fresh). @returns {{A, isNew}} */
export function load(store = storage, now = Date.now(), key = SAVE_KEY) {
  let p = null;
  try { const raw = store.get(key); if (raw) { p = JSON.parse(raw); if (!isObj(p)) p = null; } } catch (e) { p = null; }
  if (!p) return { A: fresh(now), isNew: true };
  return { A: migrate(p, now), isNew: false };
}
export function save(A, store = storage, now = Date.now(), key = SAVE_KEY) {
  A.lastSeen = now;
  // keep the live marks of the last 40 days only
  const days = Object.keys(A.live).sort();
  while (days.length > 40) delete A.live[days.shift()];
  return store.set(key, JSON.stringify(A));
}

/** The Phase A player (read-only): { name, mishmar, priests } or null. */
export function readPhaseA(store = storage) {
  try {
    const raw = store.get(PHASE_A_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!isObj(p)) return null;
    const name = typeof p.name === 'string' ? p.name.slice(0, 24) : '';
    const mishmar = Math.round(num(p.mishmar, 0));
    if (!name && !(mishmar >= 1 && mishmar <= 24)) return null;
    return { name, mishmar: mishmar >= 1 && mishmar <= 24 ? mishmar : 0, priests: Math.max(0, Math.round(num(p.priests, 0))) };
  } catch (e) { return null; }
}
/** Take name and mishmar from Phase A. → true when something was adopted.
 *  ── avoda12 ── (N69) the name he chose in Phase A is his name here too: it wins over an older Phase B pick (a player who
 *  peeked into Phase B before he named his kohen); the mishmar is taken only when Phase B has none. */
export function adoptPhaseA(A, a) {
  if (!a) return false;
  let changed = false;
  if (a.name && A.name !== a.name) { A.name = a.name; changed = true; }
  if (!A.mishmar && a.mishmar) { A.mishmar = a.mishmar; changed = true; }
  if (changed) A.fromA = true;
  return changed;
}
export const hasPlayer = (A) => A.mishmar >= 1 && A.mishmar <= 24;

/* ───────── the lotteries (payis) ───────── */
/** The 13 roles in this player's own order: day after day he gets every one of them (13 days, no repeats). */
export function rolePerm(pid) {
  const r = rng(hash(pid + ':roles')), a = ROLE_IDS.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/**
 * The day's lots, seeded by player and Jerusalem day (pure; deterministic):
 *   deshen  the first lottery (terumat hadeshen): about one day in four
 *   role    the second lottery: one of the 13 roles; 13 consecutive days give all 13
 *   ketoret the third, "חדשים לקטורת" (Tamid 5:2): null when he is no longer new (he offered it: Yoma 26a
 *           "מעולם לא שנה אדם בה"); a new one wins one day in three, and surely on his third try
 *   evarim  the fourth (limbs to the altar), new and old together: one day in two
 */
export function lotsFor(A, day) {
  const d = dayNum(day), perm = rolePerm(A.pid), h = (k) => hash(`${A.pid}|${day}|${k}`);
  let ketoret = null;
  if (!A.ketoret.done) {
    const tries = A.ketoret.lastTry === day ? Math.max(0, A.ketoret.tries - 1) : A.ketoret.tries;
    ketoret = tries >= 2 || h('ketoret') % 3 === 0;
  }
  return { day, deshen: h('deshen') % 4 === 0, role: perm[((d % 13) + 13) % 13], ketoret, evarim: h('evarim') % 2 === 0 };
}
/** Draw (once per day) and remember today's lots. */
export function drawLots(A, day) {
  if (!A.lots || A.lots.day !== day) A.lots = lotsFor(A, day);
  return A.lots;
}
/** He took part in "חדשים לקטורת" today and did not win: the next draws come closer (at most once a day). */
export function ketoretTry(A, day) {
  if (A.ketoret.done || A.ketoret.lastTry === day) return;
  A.ketoret.tries += 1; A.ketoret.lastTry = day;
}
/** He offered the ketoret (live): once in a lifetime. */
export function ketoretDone(A, day, now) {
  if (A.ketoret.done) return false;
  A.ketoret.done = true; A.ketoret.day = day;
  A.collect['ketoret'] = now;
  return true;
}

/* ───────── learning, roles, points, ranks ───────── */
/**
 * A mini-game finished. steps: the tamid.json ids it teaches. o: {live, forReal, role, perfect, now}.
 * @returns {{points, newSteps: string[]}}
 */
export function learn(A, gameId, steps, o = {}) {
  const now = num(o.now, Date.now());
  const newSteps = [];
  for (const id of steps || []) {
    const b = A.book[id];
    if (!b) { A.book[id] = { t: now, n: 1, live: !!o.live }; newSteps.push(id); }
    else { b.n += 1; if (o.live) b.live = true; }
  }
  const g = A.games[gameId] || (A.games[gameId] = { n: 0, t: now, live: false, best: 0 });
  g.n += 1; g.t = now; if (o.live) g.live = true;
  if (typeof o.score === 'number') g.best = Math.max(g.best, o.score);
  let points = POINTS.game + newSteps.length * POINTS.newStep + (o.live ? POINTS.live : 0) + (o.forReal ? POINTS.forReal : 0) + (o.perfect ? POINTS.perfect : 0);
  if (o.again) points = POINTS.again + newSteps.length * POINTS.newStep;   // ── hooks ── a same-day repeat: practice, a little
  if (o.forReal && o.role) A.roles[o.role] = (A.roles[o.role] || 0) + 1;
  A.points += points;
  return { points, newSteps };
}
export const bookCount = (A) => Object.keys(A.book).length;
export const rolesCount = (A) => Object.keys(A.roles).filter((k) => A.roles[k] > 0).length;
/** Rank = how many of the 15 ממונים he has met (0..15), and the points to the next one. */
export function rankOf(points) {
  let r = 0;
  while (r < RANKS.length && points >= RANKS[r]) r++;
  return { rank: r, next: r < RANKS.length ? RANKS[r] : null, prev: r > 0 ? RANKS[r - 1] : 0 };
}
export function addPoints(A, n) { A.points = Math.max(0, A.points + n); return A.points; }

/** A live segment attended on a Jerusalem day. → true the first time. */
export function markLive(A, day, segId) {
  const l = A.live[day] || (A.live[day] = []);
  if (l.includes(segId)) return false;
  l.push(segId);
  return true;
}
export function collect(A, id, now) { if (A.collect[id]) return false; A.collect[id] = now; return true; }

/* ───────── the streak: one service a day; Shabbat and Yom Tov never break it ───────── */
/**
 * @param day local day key of the play
 * @param isRest (dayKey) → true for Shabbat / Yom Tov
 * @returns {{n, grew: boolean, reset: boolean}}
 */
export function touchStreak(A, day, isRest = () => false, grace = null) {
  const s = A.streak;
  if (s.day === day) return { n: s.n, grew: false, reset: false };
  let reset = false;
  if (!s.day) s.n = 1;
  else if (day < s.day) return { n: s.n, grew: false, reset: false };     // the clock went back: ignore
  else {
    // every day strictly between the last day and today must be a rest day
    let k = addDays(s.day, 1), ok = true, guard = 0;
    while (k < day && guard++ < 400) { if (!isRest(k)) { ok = false; break; } k = addDays(k, 1); }
    // ── hooks ── grace(last, day) → true covers one missed weekday a week by itself (hooks/index.js graceCovers)
    if (!ok && typeof grace === 'function') { try { ok = !!grace(s.day, day); } catch (e) { ok = false; } }
    if (ok) s.n += 1; else { s.n = 1; reset = true; }
  }
  s.day = day;
  s.best = Math.max(s.best, s.n);
  return { n: s.n, grew: !reset, reset };
}

/* ───────── ── service13 ── the ketoret he compounded, and the pens he tended (wave 13) ─────────
 * A.pitum = { half, made, batches, used:{[day]:'a'|'p'|'ap'}, last }   the store at Beit Avtinas, in HALF manim (integers):
 *   a batch adds the year's 368 (כריתות ו ע״א); the morning ketoret takes ½ and the evening's ½, once a day each ("פרס בשחרית
 *   ופרס בין הערבים", כריתות ו ע״ב). The store never goes below 0 and an empty store never stops a service: the Temple burns
 *   its own; the home only invites him to Beit Avtinas. It holds one year (368) at most: more is practice.
 * A.dir = { checked, days:{[day]:{w,f,n}} }   the lambs he checked, and the days he watered (w), gave hay (f), checked n lambs.
 *   Nothing is lost on a day he did not come: other kohanim tend, the lambs' chamber never holds fewer than six (ערכין ב, ה). */
export const PITUM_MAX_HALF = 736;
export const PITUM_LOW = 30;   // manim: below a month's ketoret the home invites him (never a warning)
const keepDays = (o, n = 14) => { const ks = Object.keys(o).sort(); for (const k of ks.slice(0, Math.max(0, ks.length - n))) delete o[k]; };
export function pitumNorm(A) {
  const p = isObj(A.pitum) ? A.pitum : (A.pitum = {});
  p.half = Math.min(PITUM_MAX_HALF, Math.max(0, Math.round(num(p.half, 0))));
  p.made = Math.max(0, Math.round(num(p.made, 0)));
  p.batches = Math.max(0, Math.round(num(p.batches, 0)));
  if (!isObj(p.used)) p.used = {};
  if (typeof p.last !== 'string') p.last = '';
  keepDays(p.used);
  return p;
}
/** the manim in the store (0 … 368, in halves) */
export const pitumManim = (A) => pitumNorm(A).half / 2;
/** a batch at Beit Avtinas: + `manim` (default the year's 368), up to one year's store → { added, manim, full } */
export function pitumAdd(A, day, manim = 368) {
  const p = pitumNorm(A), before = p.half;
  p.half = Math.min(PITUM_MAX_HALF, p.half + Math.round(manim * 2));
  p.made += Math.round(manim); p.batches++; p.last = String(day || '');
  return { added: (p.half - before) / 2, manim: p.half / 2, full: p.half >= PITUM_MAX_HALF };
}
/** the day's ketoret burnt: when 'am' (the morning, the ketoret game) or 'pm' (the evening, the neirot game) — once a day each.
 *  → { used, fromStore, manim }: used = this half was taken now; fromStore = it came from HIS store (else the Temple's own) */
export function pitumUse(A, day, when) {
  const p = pitumNorm(A), k = when === 'pm' ? 'p' : 'a', u = p.used[day] || '';
  if (u.includes(k)) return { used: false, fromStore: false, manim: p.half / 2 };
  p.used[day] = u + k;
  const fromStore = p.half > 0;
  if (fromStore) p.half--;
  return { used: true, fromStore, manim: p.half / 2 };
}
export function dirNorm(A) {
  const d = isObj(A.dir) ? A.dir : (A.dir = {});
  d.checked = Math.max(0, Math.round(num(d.checked, 0)));
  if (!isObj(d.days)) d.days = {};
  keepDays(d.days);
  return d;
}
/** the pens tended today: { w: watered, f: hay, n: lambs checked into the chamber } (adds; never takes away) */
export function dirTend(A, day, o = {}) {
  const d = dirNorm(A), t = d.days[day] || (d.days[day] = { w: 0, f: 0, n: 0 });
  if (o.w) t.w = 1; if (o.f) t.f = 1;
  if (o.n > 0) { t.n += Math.round(o.n); d.checked += Math.round(o.n); }
  return t;
}
export const dirToday = (A, day) => dirNorm(A).days[day] || null;
// ── /service13 ──
