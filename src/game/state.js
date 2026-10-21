/* ─────────────────────────────────────────────────────────────────────────────
 * state.js: the Phase A rules v6 (docs/BUILD.md): pure functions over a plain save object G.
 *
 * No DOM and no world. Every time-dependent function takes `now` (ms), so the rules are testable, and
 * storage is injectable. Game time runs at speedOf(G) × real time (demo mode ×60). Crew and quarry work is
 * simulated in ≤ 1 game-minute steps (settle).
 *
 * v6: the daughter's economy (wave 6). The meter (G.res) is the budget; every stage is a real project
 *   survey → dig → courses (stone by stone, course by course) → finish → inspect → its key moment,
 * and every material step (a segment of SEG stones, a finish step) is paid from the meter: by the pre-step
 * match-3 level (MATCH3), the crews' quarry, the kings' deals (KINGS), the daily wage and FUN's orders.
 * Paid stones wait in the site's stock and are set one by one by the hero's strokes and the crews; key stones
 * wait for FUN's precision games; the inspection finds a badly set key stone, and its reset costs time only.
 *
 * Save v6 (key 'bh_beta2'; the demo uses 'bh_demo' and never touches it):
 *   { v:6, demo, created, clock, lastSeen, res:{stone,cedar,bronze,gold,silver,wstone}, focus,
 *     st:{[id]: {p, n, dp, paid, set, k, fp, fd, keys:{i:q}, ev:{i:1}, bad:[i], insp, ready?, m?, w, ph} | {done:true}},
 *     bh:[12], harAcc, crews:[{at}], up:{tools,crane,carts}, priests, train:[{t0,t1}], trainOn, trainSlots,
 *     book, quiz, daily, vol, vine, finds, story, ftue, name, mishmar, chDone, stats, celeb,
 *     fun:{} (FUN), m3:{} (MATCH3), kings:{} (KINGS) — the three slots are kept and never read here,
 *     car:[] routes:[] carSlots carCount (v5 caravans: kept empty for old readers; KINGS owns the sea routes) }
 *   (w, ph on a site are the v5 view — work units and phase 1–3 — kept current for the old hooks.)
 * v5 migrates to v6 (migrateV5: each site's progress becomes stones set; caravans in flight are credited);
 * v ≤ 4 (the 2D beta and the port) migrate through v5 (migrateV4).
 * ──────────────────────────────────────────────────────────────────────────── */
import {
  STAGES, stageById, RES_KEYS, START_RES, DEMO_RES, DEMO_SPEED, RATE, PHASE_AT, BOULDERS, BOULDER_HP,
  REWARD, CHAPTERS, CHAPTER_BONUS, ROUTES, RIDX, CAR_SLOTS, TRAIN, DAILY, TASKS, VINE, QUIZ,
  PROJ, SEG, STOCK_MAX, WORK, CREW_RATE, EVENT_CREW, QUALITY_BAD, keyOf, eventAt, EVENTS, FIELD_OF, SOURCES, UPGRADES, PH, CHECK_EVERY,
} from './content.js';
import * as TL from './tools.js';   // ── tools21 ──
import { PAY } from './content.js';   // ── econ14 ── the coins ── /econ14 ──
import { UNLOCKS } from './middot.js';
import { V4_WORK, V4_RES, V4_TO_SILVER } from './legacy.js';
import { checkEvery } from './content.js';   // ── games13 ── the course check per stage (the Mount: every course) ── /games13 ──

export const SAVE_KEY = 'bh_beta2';
export const DEMO_KEY = 'bh_demo';
export const SAVE_VERSION = 6;
export const WELCOME_MIN_S = 90;        // shorter absences produce no "welcome back" report
const EPS = 1e-6;

/* ───────── storage (localStorage throws in sandboxed iframes / private mode) ───────── */
export const storage = {
  get(k) { try { return globalThis.localStorage ? globalThis.localStorage.getItem(k) : null; } catch (e) { return null; } },
  set(k, v) { try { globalThis.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
  remove(k) { try { globalThis.localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
};

/* ───────── time ───────── */
export const speedOf = (G) => (G.demo ? DEMO_SPEED : 1);
/** game minutes → real milliseconds for this save */
export const gmMs = (G, min) => (min * 60000) / speedOf(G);
/** local calendar day 'YYYY-MM-DD' */
export function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function addDays(key, n) { const [y, m, d] = key.split('-').map(Number); const x = new Date(y, m - 1, d + n, 12); return dayKey(x.getTime()); }

/* ───────── create / load / save ───────── */
export function fresh(now = Date.now(), { demo = false } = {}) {
  return {
    v: SAVE_VERSION, demo: !!demo, created: now, clock: now, lastSeen: now,
    res: { ...(demo ? DEMO_RES : START_RES) }, focus: null,
    st: {}, bh: new Array(BOULDERS).fill(BOULDER_HP), harAcc: 0,
    crews: [], up: { tools: 0, crane: 0, carts: 0 },
    car: [], routes: [], carSlots: CAR_SLOTS, carCount: {},
    priests: 0, train: [], trainOn: false, trainSlots: TRAIN.slots,
    book: { un: Object.fromEntries(UNLOCKS.start.map((r) => [r, 1])), read: {} },
    quiz: { day: '', n: 0, done: {} },
    daily: { day: '', streak: 0, wageDay: '', tasks: [], vol: '' }, vol: null,
    vine: { leaves: 0, grapes: 0, clusters: 0, grapeDays: 0 },
    finds: {}, story: {}, ftue: 0, op: 0, name: '', mishmar: 0, chDone: {},   // (op: build7, the opening vision was played)
    stats: { strikes: 0, perfect: 0, best: 0, caravans: 0, combo: 0, stones: 0, keys: 0, perfectKeys: 0, levels: 0, steps: 0 },
    celeb: false,
    fun: {}, m3: {}, kings: {},
    tools: { tier: {}, earned: {} },   // ── tools21 ── (each tool's tier 1–3, the stages that upgraded them free)
    econ: {}, shop: {},   // ── econ14 ── the coins' counts and the teach (econ), what אוצר המלאכה sold (shop) ── /econ14 ──
  };
}

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/**
 * Load a save (or start fresh). v5 saves migrate to v6; v ≤ 4 saves (2D beta, port) through v5.
 * @returns {{G:object, isNew:boolean, fromVersion:number|null}}
 */
export function load(store = storage, key = SAVE_KEY, now = Date.now()) {
  const demo = key === DEMO_KEY;
  const raw = store.get(key);
  let p = null;
  if (raw) { try { p = JSON.parse(raw); if (!isObj(p)) p = null; } catch (e) { p = null; } }
  if (!p) return { G: fresh(now, { demo }), isNew: true, fromVersion: null };
  const pv = num(p.v, 0);
  const G = pv >= 6 ? { ...fresh(now, { demo }), ...p } : pv === 5 ? migrateV5(p, now) : migrateV5(migrateV4(p, now), now);
  G.demo = demo;
  sanitize(G, now);
  if (pv < 6) autoAssign(G);
  G.v = SAVE_VERSION;
  return { G, isNew: false, fromVersion: pv };
}

/** Persist. Returns false when storage is unavailable (the game keeps running in memory). */
export function save(G, store = storage, key = SAVE_KEY, now = Date.now()) {
  G.lastSeen = now;
  return store.set(key, JSON.stringify(G));
}

/* The v4 → v5 migration (GDD §12 a.2): keeps every finished stage, turns 2D work counters into v5 progress
 * (phases already paid), maps resources, grants the crews / routes / priests a v5 player would have by then,
 * and skips the tutorial. (Its result goes on through migrateV5.) */
export function migrateV4(p, now) {
  const G = { ...fresh(now), v: 5 };
  const r = isObj(p.res) ? p.res : {};
  for (const [k, v] of Object.entries(V4_RES)) G.res[v] = Math.max(0, Math.floor(num(r[k], 0)));
  for (const [k, m] of Object.entries(V4_TO_SILVER)) G.res.silver += Math.max(0, Math.floor(num(r[k], 0))) * m;
  const b = isObj(p.b) ? p.b : {};
  for (const s of STAGES) {
    const o = b[s.id];
    if (!isObj(o)) continue;
    if (o.done || (o.endsAt !== undefined && o.endsAt <= now)) { G.st[s.id] = { done: true }; continue; }
    let frac = 0;
    if (o.w !== undefined) frac = Math.min(0.99, Math.max(0, num(o.w, 0) / V4_WORK[s.id]));
    else if (o.endsAt !== undefined) frac = Math.min(0.99, Math.max(0, (now - num(o.startedAt, now)) / (num(o.total, 30) * 1000)));
    const w = Math.floor(frac * s.W);
    G.st[s.id] = { w, ph: w >= s.W * PHASE_AT[2] ? 3 : w >= s.W * PHASE_AT[1] ? 2 : 1 };
  }
  // saves made before 'har' existed: har counts as done (the 2D rule)
  if (!G.st.har && STAGES.some((s) => s.id !== 'har' && G.st[s.id])) G.st.har = { done: true };
  if (G.st.har && !G.st.har.done) {
    const hits = G.st.har.w;
    const obh = isObj(b.har) ? b.har.bh : null;
    G.bh = Array.isArray(obh) && obh.length === BOULDERS ? obh.map((v) => Math.max(0, Math.min(BOULDER_HP, v | 0))) : boulderStatesFromHits(hits);
    G.st.har.w = G.bh.reduce((a, v) => a + (BOULDER_HP - v), 0);
  }
  // what a v5 player would have by now
  const done = (id) => G.st[id] && G.st[id].done;
  let crews = 1;
  for (const s of STAGES.filter((x) => done(x.id))) {
    const R = REWARD[s.id] || {};
    if (R.crews) crews = Math.max(crews, R.crews);
    if (R.training) G.trainOn = true;
    if (R.find) G.finds[R.find] = 1;
    for (const m of UNLOCKS[s.id] || []) G.book.un[m] = 1;
  }
  G.crews = Array.from({ length: crews }, () => ({ at: null }));
  if (done('karnot') || done('kiyor') || STAGES.some((s) => s.ch === 4 && G.st[s.id])) G.priests = 10;
  for (const c of CHAPTERS) if (c.stages.every(done)) G.chDone[c.id] = true;
  const d = isObj(p.daily) ? p.daily : {};
  G.daily.day = typeof d.last === 'string' ? d.last : '';
  G.daily.wageDay = G.daily.day;
  G.daily.streak = Math.max(0, Math.floor(num(d.streak, 0)));
  G.celeb = !!p.celeb;
  G.ftue = 99;                           // returning 2D players skip the tutorial
  G.story.priests = G.story.ch2 = 1;
  return G;
}

function boulderStatesFromHits(hits) {
  const bh = new Array(BOULDERS).fill(BOULDER_HP);
  let h = Math.max(0, Math.min(BOULDERS * BOULDER_HP, Math.floor(hits)));
  for (let i = 0; i < BOULDERS && h > 0; i++) { const d = Math.min(BOULDER_HP, h); bh[i] -= d; h -= d; }
  return bh;
}

/* The v5 → v6 migration: every finished stage stays finished; a site in progress keeps its progress as stones set
 * (its key stones below that count as set well, its survey and dig as done); caravans in flight are credited now
 * (KINGS owns the sea routes); resources, crews, priests, the book, the vine and the streak are kept. */
export function migrateV5(p, now) {
  const G = { ...fresh(now), ...p };
  const res = isObj(p.res) ? { ...p.res } : {};
  for (const c of Array.isArray(p.car) ? p.car : []) {
    const R = isObj(c) && ROUTES[RIDX[c.r]];
    if (R && Number.isFinite(c.y)) res[R.res] = num(res[R.res], 0) + c.y;
  }
  G.res = res;
  G.car = []; G.routes = [];
  G.st = {};
  const st = isObj(p.st) ? p.st : {};
  for (const s of STAGES) {
    const o = st[s.id];
    if (!isObj(o)) continue;
    if (o.done) { G.st[s.id] = { done: true }; continue; }
    G.st[s.id] = fromFraction(G, s.id, num(o.w, 0) / s.W, o);
  }
  if (!isObj(G.up)) G.up = { tools: 0, crane: 0, carts: 0 };
  for (const k of ['fun', 'm3', 'kings']) if (!isObj(G[k])) G[k] = {};
  return G;
}

/* A v5-shaped site ({w, ph, ready?, m?}: an old save, or an old reader that wrote one) as a v6 site at the same progress. */
function fromFraction(G, id, frac, o = {}) {
  const P = PROJ[id], x = newSite(id), n = x.n, F = P.fin.length;
  frac = Math.max(0, Math.min(1, num(frac, 0)));
  if (o.ready || o.m || frac >= 1 - EPS) {
    Object.assign(x, { p: 'moment', dp: 1, paid: n, set: n, fp: F, fd: F, insp: 1 });
    if (o.m) x.m = true; else if (stageById(id).moment) x.ready = true;
    fillKeys(id, x);
    legacyView(x, id);
    return x;
  }
  if (id === 'har' && G && Array.isArray(G.bh) && G.bh.some((v) => v > 0)) { x.p = 'dig'; x.dp = 1; legacyView(x, id); return x; }
  if (frac > 0) {
    x.p = 'courses'; x.dp = 1;
    x.set = Math.min(n, Math.floor(n * Math.min(1, frac / 0.8)));
    x.paid = x.set;
    if (frac > 0.8 && F) { x.p = 'finish'; x.set = x.paid = n; x.fd = x.fp = Math.min(F - 1, Math.floor(F * (frac - 0.8) / 0.12)); }
    else if (x.set >= n) x.p = F ? 'finish' : 'inspect';
    fillKeys(id, x);
    x.chk = x.set;   // the work migrated from v5 counts as checked (no course check of old work on the return)
    if (id === 'har' && G) G.bh = G.bh.map(() => 0);
  }
  legacyView(x, id);
  return x;
}
/* key stones and events below the stones set count as done (a migrated or skipped site) */
function fillKeys(id, x) {
  for (let i = 0; i < x.set; i++) { if (keyOf(id, i) && x.keys[i] == null) x.keys[i] = 0.8; if (eventAt(id, i)) x.ev[i] = 1; }
}

/* Defensive shape repair for v6 saves. */
function sanitize(G, now) {
  const F = fresh(now, { demo: G.demo });
  for (const k of Object.keys(F)) if (G[k] === undefined || (G[k] === null && F[k] !== null)) G[k] = F[k];
  if (!isObj(G.res)) G.res = { ...F.res };
  for (const k of RES_KEYS) G.res[k] = Math.max(0, num(G.res[k], 0));
  if (!Array.isArray(G.bh) || G.bh.length !== BOULDERS) G.bh = F.bh;
  G.bh = G.bh.map((v) => Math.max(0, Math.min(BOULDER_HP, Math.floor(num(v, BOULDER_HP)))));
  if (!isObj(G.st)) G.st = {};
  for (const id of Object.keys(G.st)) {
    const s = G.st[id];
    if (!stageById(id) || !isObj(s)) { delete G.st[id]; continue; }
    if (s.done) { G.st[id] = { done: true }; continue; }
    if (!PH.includes(s.p)) { G.st[id] = fromFraction(G, id, num(s.w, 0) / stageById(id).W, s); continue; }
    repairSite(id, s);
  }
  G.harAcc = Math.max(0, Math.min(1, num(G.harAcc, 0)));
  if (!Array.isArray(G.crews)) G.crews = [];
  G.crews = G.crews.filter(isObj).map((c) => ({ at: typeof c.at === 'string' ? c.at : null }));
  if (!isObj(G.up)) G.up = { ...F.up };
  for (const k of Object.keys(UPGRADES)) G.up[k] = Math.max(0, Math.min(3, Math.floor(num(G.up[k], 0))));
  G.car = []; if (!Array.isArray(G.routes)) G.routes = [];
  if (!Array.isArray(G.train)) G.train = [];
  G.train = G.train.filter((t) => isObj(t) && Number.isFinite(t.t1));
  for (const k of ['book', 'quiz', 'daily', 'vine', 'finds', 'story', 'chDone', 'stats', 'carCount', 'fun', 'm3', 'kings']) if (!isObj(G[k])) G[k] = F[k];
  for (const k of ['econ', 'shop']) if (!isObj(G[k])) G[k] = {};   // ── econ14 ── ── /econ14 ──
  TL.ensure(G);   // ── tools21 ──
  for (const k of Object.keys(F.stats)) G.stats[k] = num(G.stats[k], 0);
  if (!isObj(G.book.un)) G.book.un = F.book.un;
  if (!isObj(G.book.read)) G.book.read = {};
  if (!Array.isArray(G.daily.tasks)) G.daily.tasks = [];
  G.clock = Math.min(num(G.clock, now), now);
  G.lastSeen = num(G.lastSeen, now);
  if (G.focus && !(G.st[G.focus] && !G.st[G.focus].done)) G.focus = null;
  for (const c of G.crews) if (c.at && c.at !== 'quarry' && !isWorkable(G, c.at)) c.at = null;
}
function repairSite(id, s) {
  const n = siteStones(id), F = PROJ[id].fin.length;
  s.n = n;
  s.set = Math.max(0, Math.min(n, Math.floor(num(s.set, 0))));
  s.paid = Math.max(s.set, Math.min(n, Math.floor(num(s.paid, s.set))));
  s.k = Math.max(0, num(s.k, 0));
  s.dp = s.dp ? 1 : 0; s.insp = s.insp ? 1 : 0;
  s.fd = Math.max(0, Math.min(F, Math.floor(num(s.fd, 0))));
  s.fp = Math.max(s.fd, Math.min(F, Math.floor(num(s.fp, s.fd))));
  if (!isObj(s.keys)) s.keys = {};
  if (!isObj(s.ev)) s.ev = {};
  if (!Array.isArray(s.bad)) s.bad = [];
  s.bad = s.bad.filter((i) => Number.isInteger(i) && i >= 0 && i < n);
  s.chk = Math.max(0, Math.min(s.set, Math.floor(num(s.chk, 0))));
  legacyView(s, id);
}

/* ───────── the project of a stage ───────── */
/** logical stones of a stage (SITE maps them onto its real counts) */
export const siteStones = (id) => { const P = PROJ[id]; return P ? P.C * P.P : 0; };
const segSize = (id) => (PROJ[id] && PROJ[id].S) || SEG;
export const segCost = (id) => ({ ...PROJ[id].seg });
function newSite(id) {
  return { p: 'survey', n: siteStones(id), dp: 0, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
}
/** the v6 site of a stage in progress (a v5-shaped entry written by an old reader is converted in place), or null */
function site(G, id) {
  const s = G.st[id];
  if (!isObj(s) || s.done) return null;
  if (!PH.includes(s.p)) { G.st[id] = fromFraction(G, id, num(s.w, 0) / stageById(id).W, s); return G.st[id]; }
  return s;
}
/* the v5 view of a site (w work units of W, phase 1–3) for the old readers (hooks/next.js) */
function legacyView(s, id) {
  const W = stageById(id).W, f = siteFraction(s, id);
  s.w = Math.round(f * W * 100) / 100;
  s.ph = s.p === 'survey' || s.p === 'dig' ? 1 : s.p === 'courses' ? 2 : 3;
}
/** the stage's overall fraction: survey 3 % · dig 5 % · courses 72 % (by stones) · finish 12 % · inspection 8 % */
function siteFraction(s, id) {
  if (s.ready || s.m || s.p === 'moment') return 1;
  const P = PROJ[id], F = P.fin.length, i = PH.indexOf(s.p);
  let f = 0;
  if (i > 0) f += 0.03;
  if (i > 1) f += 0.05;
  f += 0.72 * (s.n ? s.set / s.n : 0);
  f += 0.12 * (i > 3 ? 1 : F ? s.fd / F : 0);
  if (i === 4 && s.insp && !s.bad.length) f += 0.08;
  return Math.min(1, f);
}

/* ───────── stages ───────── */
/** 'locked' | 'avail' | 'building' | 'done' (the stage graph: avail when every dependency is done) */
export function statusOf(G, id) {
  const s = G.st[id];
  if (s && s.done) return 'done';
  if (s) return 'building';
  const def = stageById(id);
  return def && def.deps.every((d) => G.st[d] && G.st[d].done) ? 'avail' : 'locked';
}
export const isDone = (G, id) => !!(G.st[id] && G.st[id].done);
export function progressOf(G, id) {
  const s = G.st[id]; if (!s) return 0; if (s.done) return 1;
  const x = site(G, id);
  return x ? siteFraction(x, id) : 0;
}
/** 0 יסודות (survey, dig) · 1 מבנה (courses) · 2 גימור (finish, inspection) — the v5 view */
export function phaseOf(G, id) { const s = site(G, id); if (!s) return isDone(G, id) ? 2 : 0; const i = PH.indexOf(s.p); return i < 2 ? 0 : i === 2 ? 1 : 2; }
/** a building site whose work can continue (not waiting for its key moment) */
export const isWorkable = (G, id) => { const s = G.st[id]; return !!s && !s.done && !s.ready; };
export const allDone = (G) => STAGES.every((s) => isDone(G, s.id));
export const doneCount = (G) => STAGES.filter((s) => isDone(G, s.id)).length;
export function chapterOf(G) {
  for (const c of CHAPTERS) if (!c.stages.every((id) => isDone(G, id))) return c.id;
  return 5;
}

/* ───────── resources ───────── */
export const canAfford = (res, cost) => Object.entries(cost || {}).every(([k, v]) => (res[k] || 0) + EPS >= v);
export function lacking(res, cost) {
  const out = {};
  for (const [k, v] of Object.entries(cost || {})) { const m = Math.ceil(v - (res[k] || 0) - EPS); if (m > 0) out[k] = m; }
  return out;
}
function pay(res, cost) { for (const [k, v] of Object.entries(cost || {})) res[k] = Math.max(0, (res[k] || 0) - v); }
export function gain(G, add) { for (const [k, v] of Object.entries(add || {})) if (RES_KEYS.includes(k) && v > 0) G.res[k] = (G.res[k] || 0) + v; }
/** the match-3 field that earns a shortfall: its biggest material first (whole stones and stone → the quarry) */
export function fieldFor(lack) {
  for (const k of ['wstone', 'stone', 'cedar', 'gold', 'bronze', 'silver']) if (lack && lack[k] > 0) return FIELD_OF[k];
  return 'quarry';
}
/** the part of a shortfall one field's level earns (MATCH3's `need`) */
export function needFor(lack, field) {
  const out = {};
  for (const [k, v] of Object.entries(lack || {})) if (FIELD_OF[k] === field && k !== 'silver') out[k] = v;
  if (!Object.keys(out).length && lack && lack.silver) out.silver = lack.silver;
  return out;
}
/**
 * A match-3 level's result reaches the meter. Everything collected is kept (a loss or an exit too — "ממש את האבנים").
 * When the step needed whole stones and the level brought none, its stones are the Beit Kerem valley's whole field
 * stones (the level was played there; ⚑ owner). → the delta added {res: n}
 */
export function grantLevel(G, r, need = {}, id = null, o = {}) {
  const c = r && isObj(r.collected) ? r.collected : {};
  const add = {};
  for (const k of RES_KEYS) { const v = Math.max(0, Math.floor(num(c[k], 0))); if (v) add[k] = v; }
  if (need.wstone && !add.wstone && add.stone) { add.wstone = add.stone; delete add.stone; }
  const bonus = o.bonus === false ? null : starBonus(G, r, id, add);   // ── build7 ── (the host may apply it itself: o.bonus false)
  gain(G, add);
  if (bonus) { gain(G, bonus); for (const [k, v] of Object.entries(bonus)) add[k] = (add[k] || 0) + v; }
  if (r && r.won) G.stats.levels++;
  return add;
}
/**
 * ── build7 ── a 3★ board pays a third segment (PLAYTEST-S6 #4, the owner's default ⚑1): one more segment's material for the site
 * it was played for (else the site in focus), when that site lays its courses, has segments left to buy, and the board brought
 * that material (a 3★ forest board never pays stone). Pure: → {res: n} | null. `got`: what the board brought (default r.collected).
 */
export function starBonus(G, r, id = null, got = null) {
  if (!r || !r.won || (r.stars | 0) < 3) return null;
  const sid = id || focusOf(G), s = sid && G.st[sid];
  if (!s || s.done || s.p !== 'courses' || !(s.paid < s.n)) return null;
  const c = got || (isObj(r.collected) ? r.collected : {}), out = {};
  for (const [k, v] of Object.entries(segCost(sid))) if (v > 0 && (num(c[k], 0) > 0 || (k === 'wstone' && num(c.stone, 0) > 0))) out[k] = v;
  return Object.keys(out).length ? out : null;
}
/** where to get a material: [[kind, title, line]] (the meter's chip) */
export const sourcesOf = (res) => SOURCES[res] || [];

/* ───────── the jobs of a site ───────── */
/**
 * What a site needs next: {kind, …}
 *   'survey' | 'dig' | 'stone' | 'finish' | 'reset' | 'event' — strokes (need, act = PEOPLE's act kind; crew: crews help)
 *   'boulders' — har's dig: the rough hill's boulders (hitBoulder)
 *   'key' — a key stone waits for the player's hands (FUN's game: game, what, i)
 *   'inspect' — the inspection (FUN's plumb) · 'pay' — a step to pay (step, cost) · 'moment' — the key moment
 */
export function jobOf(G, id) {
  const s = site(G, id); if (!s) return null;
  const P = PROJ[id];
  if (s.ready) return { kind: 'moment' };
  switch (s.p) {
    case 'survey': return { kind: 'survey', need: WORK.survey, act: 'measure', crew: true };
    case 'dig':
      if (!s.dp) return { kind: 'pay', step: 'dig', cost: P.dg ? { silver: P.dg } : {} };
      if (id === 'har') return { kind: 'boulders', crew: true };
      return { kind: 'dig', need: WORK.dig, act: 'pick', crew: true };
    case 'courses': {
      const i = s.set;
      if (s.bad.length) return { kind: 'reset', i: s.bad[0], need: WORK.reset, act: 'split', crew: true };
      if (checkDue(G, id)) return { kind: 'check' };   // the engineer's course check (the player's; the crews wait for it)
      if (s.paid <= i) return { kind: 'pay', step: 'seg', cost: segCost(id), stones: Math.min(segSize(id), s.n - s.paid) };
      const key = keyOf(id, i);
      if (key && s.keys[i] == null) return { kind: 'key', i, game: key.game, what: key.what };
      const ev = eventAt(id, i);
      if (ev && !s.ev[i]) return { kind: 'event', i, ev, need: WORK.event, act: EVENTS[ev].act, crew: true, slow: true };
      return { kind: 'stone', i, need: WORK.stone, act: s.k < WORK.stone - 1 - EPS ? 'dress' : 'tamp', crew: true };
    }
    case 'finish': {
      const f = P.fin[s.fd];
      if (!f) return { kind: 'inspect' };
      if (s.fp <= s.fd) return { kind: 'pay', step: 'finish', cost: { ...f.cost }, f: s.fd, n: f.n };
      return { kind: 'finish', f: s.fd, n: f.n, need: WORK.finish, act: 'tamp', crew: true };
    }
    case 'inspect':
      if (!s.insp) return { kind: 'inspect' };
      if (s.bad.length) return { kind: 'reset', i: s.bad[0], need: WORK.reset, act: 'split', crew: true };
      return { kind: 'moment' };
    default: return { kind: 'moment' };
  }
}
/** the next step to pay at a site (the current one, or the next segment bought ahead): {step, cost, stones?, ahead?} | null */
export function stepOf(G, id) {
  const s = site(G, id); if (!s) return null;
  const j = jobOf(G, id);
  if (j && j.kind === 'pay') return { step: j.step, cost: j.cost, stones: j.stones || 0, n: j.n };
  if (s.p === 'courses' && s.paid < s.n && s.paid - s.set < STOCK_MAX * segSize(id)) return { step: 'seg', cost: segCost(id), stones: Math.min(segSize(id), s.n - s.paid), ahead: true };
  return null;
}
const newOut = (id, j) => ({ ok: false, id, job: j ? j.kind : null, act: j ? j.act || null : null, i: j && j.i != null ? j.i : -1, strokes: 0, stones: [], course: 0, phase: null, event: null, reached: null, done: false });

/* A job is complete: the site moves on. */
function finishJob(G, id, j, out) {
  const s = G.st[id], P = PROJ[id];
  s.k = 0; out.done = true;
  switch (j.kind) {
    case 'survey': s.p = 'dig'; s.dp = P.dg ? 0 : 1; out.phase = 'dig'; break;
    case 'dig': s.p = 'courses'; out.phase = 'courses'; break;
    case 'event': s.ev[j.i] = 1; out.event = j.ev; break;
    case 'key': case 'stone':
      s.set++; out.stones.push(j.i); G.stats.stones++;
      if (s.set % P.P === 0) out.course = s.set / P.P;
      if (s.set >= s.n) { s.p = P.fin.length ? 'finish' : 'inspect'; out.phase = s.p; }
      break;
    case 'finish': s.fd++; if (s.fd >= P.fin.length) { s.p = 'inspect'; out.phase = 'inspect'; } break;
    case 'reset': s.keys[j.i] = 0.8; s.bad.shift(); out.reset = j.i; if (!s.bad.length && s.p === 'inspect') toMoment(G, id, out); break;
    default: break;
  }
}
function toMoment(G, id, out) {
  const s = G.st[id];
  s.p = 'moment'; out.phase = 'moment';
  if (stageById(id).moment && !s.m) { s.ready = true; out.reached = 'ready'; } else out.reached = 'done';
}
/* strokes on a site's current job: the hero's (one job at most) or the crews' (the work carries over) */
function work(G, id, amt, by, out) {
  const s = G.st[id];
  for (let g = 0; g < 64 && amt > EPS; g++) {
    const j = jobOf(G, id);
    if (!j || !j.need || (by === 'crew' && !j.crew)) break;
    const rate = by === 'crew' && j.slow ? EVENT_CREW : 1;
    const take = Math.min(amt * rate, j.need - s.k);
    s.k += take; amt -= take / rate; out.strokes += take;
    if (s.k < j.need - EPS) break;
    finishJob(G, id, j, out);
    if (by === 'hero' || out.reached) break;
  }
}
/**
 * The hero's stroke at a site (one tap; a perfect stroke counts 2, the tools upgrade adds). → out:
 * {ok, id, job, act, i, strokes, stones:[i], course (a course completed: its number), phase (a new phase), event,
 *  reached: 'ready'|'done'|null, done (the job completed)}
 */
export function stroke(G, id, perfect = false) {
  const j = jobOf(G, id), out = newOut(id, j);
  if (j && j.kind === 'check') { const c = courseCheck(G, id); out.ok = !!(c && c.ok); out.check = c; return out; }   // (bots: a stroke = the check)
  if (!j || !j.need) return out;
  out.ok = true;
  work(G, id, (perfect ? 2 : 1) * (1 + UPGRADES.tools.by * (G.up.tools || 0)), 'hero', out);
  legacyView(G.st[id], id);
  return out;
}
/** A key stone set by the player's hands (FUN's game result {quality, perfect}; a missing game: 0.8). → out (as stroke) */
export function setKey(G, id, r) {
  const j = jobOf(G, id), out = newOut(id, j);
  if (!j || j.kind !== 'key') return out;
  const q = Math.max(0, Math.min(1, r && typeof r.quality === 'number' && Number.isFinite(r.quality) ? r.quality : 0.8));
  G.st[id].keys[j.i] = Math.round(q * 100) / 100;
  G.stats.keys++; if (r && r.perfect) G.stats.perfectKeys++;
  out.ok = true; out.q = q; out.game = j.game; out.what = j.what;
  finishJob(G, id, j, out);
  legacyView(G.st[id], id);
  return out;
}
/** The stage's inspection (FUN's plumb): the key stones set below QUALITY_BAD are found and wait for a reset. → {ok, bad, reached} */
export function inspect(G, id) {
  const j = jobOf(G, id), s = G.st[id];
  if (!j || j.kind !== 'inspect') return { ok: false, bad: [] };
  s.insp = 1;
  s.bad = Object.entries(s.keys).filter(([i, q]) => q < QUALITY_BAD && +i >= (s.chk || 0)).map(([i]) => +i).sort((a, b) => a - b);
  s.chk = s.set;
  const out = newOut(id, j);
  if (!s.bad.length) toMoment(G, id, out);
  legacyView(s, id);
  return { ok: true, bad: s.bad.slice(), reached: out.reached };
}
/** Is a course check due (after every CHECK_EVERY courses, while the courses rise)? */
export function checkDue(G, id) {
  const s = site(G, id); if (!s || s.p !== 'courses') return false;
  const P = PROJ[id], done = Math.floor(s.set / P.P), from = Math.floor((s.chk || 0) / P.P);
  return done - from >= checkEvery(id);   // ── games13 ── (the Mount: every course; content.js CHECK_AT) ── /games13 ──
}
/** The course check (FUN's plumb, every CHECK_EVERY courses): key stones set badly since the last check wait for a reset
 *  before the next stone (time only). → {ok, bad} */
export function courseCheck(G, id) {
  const s = site(G, id); if (!s || s.p !== 'courses') return { ok: false, bad: [] };
  const from = s.chk || 0;
  const bad = Object.entries(s.keys).filter(([i, q]) => q < QUALITY_BAD && +i >= from && +i < s.set).map(([i]) => +i).sort((a, b) => a - b);
  for (const i of bad) if (!s.bad.includes(i)) s.bad.push(i);
  s.chk = s.set;
  legacyView(s, id);
  return { ok: true, bad };
}
/** A stone set by the player's quick crane lift (FUN's crane, quick): the current stone at once. → out (as stroke) */
export function quickSet(G, id) {
  const j = jobOf(G, id), out = newOut(id, j);
  if (!j || j.kind !== 'stone') return out;
  out.ok = true; out.lift = true;
  finishJob(G, id, j, out);
  legacyView(G.st[id], id);
  return out;
}
/** Pay the site's next step from the meter. → {ok, step, lack?} */
export function payStep(G, id) {
  const s = site(G, id); if (!s) return { ok: false };
  const st = stepOf(G, id); if (!st) return { ok: false };
  const tre = st.step === 'dig' ? treasurer(G, st.cost, id) : 0;   // ── econ14 ── (D2) the dig's shortfall in coins ── /econ14 ──
  if (!canAfford(G.res, st.cost)) return { ok: false, step: st, lack: lacking(G.res, st.cost) };
  pay(G.res, st.cost);
  if (tre) s.tre = (s.tre || 0) + tre;   // ── econ14 ── ── /econ14 ──
  if (st.step === 'dig') s.dp = 1;
  else if (st.step === 'seg') s.paid = Math.min(s.n, s.paid + st.stones);
  else if (st.step === 'finish') s.fp = s.fd + 1;
  G.stats.steps++;
  // ── director13 ── (PRODUCER-S13a #11, the owner's "חסר אבנים": at ×60 the crews emptied an 8-stone stock in ~20 s and the site
  // stopped) in the demo one payment buys every segment the stock may hold (STOCK_MAX), as far as the materials go; the step
  // reported is their sum (stones and cost), segs = how many
  if (G.demo && G.ftue >= 99 && st.step === 'seg') {   // (not in the tutorial: its board comes when the mentor's segment is spent)
    const sum = { ...st, cost: { ...st.cost }, segs: 1 };
    for (let k = 1; k < STOCK_MAX; k++) {
      const nx = stepOf(G, id);
      if (!nx || nx.step !== 'seg' || !canAfford(G.res, nx.cost)) break;
      pay(G.res, nx.cost); s.paid = Math.min(s.n, s.paid + nx.stones); G.stats.steps++;
      sum.stones += nx.stones; sum.segs++;
      for (const [r, v] of Object.entries(nx.cost)) sum.cost[r] = (sum.cost[r] || 0) + v;
    }
    legacyView(s, id);
    return { ok: true, step: sum };
  }
  // ── /director13 ──
  legacyView(s, id);
  return { ok: true, step: st };
}
/** ── director13 ── what one payment of step `st` (stepOf) buys at site `id`: in the demo a segment's step is every segment the
 *  stock may still hold and the materials pay for (payStep's sum: stones, cost, segs); else `st` itself */
export function buyOf(G, id, st) {
  const s = site(G, id);
  if (!st || !s || !G.demo || !(G.ftue >= 99) || st.step !== 'seg' || !canAfford(G.res, st.cost)) return st;
  const res = { ...G.res }, sum = { ...st, cost: { ...st.cost }, segs: 1 };
  pay(res, st.cost);
  let paid = Math.min(s.n, s.paid + st.stones);
  for (let k = 1; k < STOCK_MAX; k++) {
    if (!(paid < s.n && paid - s.set < STOCK_MAX * segSize(id))) break;
    const c = segCost(id); if (!canAfford(res, c)) break;
    pay(res, c); const n = Math.min(segSize(id), s.n - paid); paid += n;
    sum.stones += n; sum.segs++;
    for (const [r, v] of Object.entries(c)) sum.cost[r] = (sum.cost[r] || 0) + v;
  }
  return sum;
}
/** Start a stage: pays its survey (silver). → {ok, lack?, priests?, crew} */
export function startBuild(G, id) {
  if (statusOf(G, id) !== 'avail') return { ok: false };
  const def = stageById(id), cost = PROJ[id].sv ? { silver: PROJ[id].sv } : {};
  if (def.priests > G.priests) return { ok: false, priests: def.priests };
  const tre = treasurer(G, cost, id);   // ── econ14 ── (D2) a survey short only of coins: the treasurer pays the rest ── /econ14 ──
  if (!canAfford(G.res, cost)) return { ok: false, lack: lacking(G.res, cost) };
  pay(G.res, cost);
  G.st[id] = newSite(id);
  if (tre) G.st[id].tre = tre;   // ── econ14 ── ── /econ14 ──
  G.focus = id;
  if (id === 'har') { G.bh = new Array(BOULDERS).fill(BOULDER_HP); G.harAcc = 0; }
  // a new site gets a crew: an idle one, else one from the quarry (the player can move it back)
  const c = G.crews.find((x) => !x.at) || G.crews.find((x) => x.at === 'quarry');
  if (c) c.at = id;
  autoAssign(G);
  return { ok: true, crew: !!c };
}

/**
 * A stage is finished: rewards, unlocks, crews reassigned. The caller shows it.
 * → {id, rewards, crewsNow, find, mishnayot:[], chapter: n|null, all: bool}
 */
export function completeStage(G, id) {
  if (isDone(G, id)) return null;
  G.st[id] = { done: true };
  if (G.focus === id) G.focus = null;
  const R = REWARD[id] || {}, out = { id, rewards: {}, routes: [], find: null, mishnayot: [], chapter: null, all: false };
  if (R.silver) { G.res.silver += R.silver; out.rewards.silver = R.silver; }
  if (R.gold) { G.res.gold += R.gold; out.rewards.gold = R.gold; }
  if (R.crews && G.crews.length < R.crews) { while (G.crews.length < R.crews) G.crews.push({ at: null }); out.crewsNow = G.crews.length; }
  if (R.training && !G.trainOn) { G.trainOn = true; out.training = true; }
  if (R.find && !G.finds[R.find]) { G.finds[R.find] = 1; out.find = R.find; }
  if (R.donor) out.donor = R.donor;
  for (const m of UNLOCKS[id] || []) if (!G.book.un[m]) { G.book.un[m] = 1; out.mishnayot.push(m); }
  const ch = CHAPTERS.find((c) => c.stages.includes(id));
  if (ch && !G.chDone[ch.id] && ch.stages.every((s) => isDone(G, s))) {
    G.chDone[ch.id] = true; out.chapter = ch.id;
    const B = CHAPTER_BONUS[ch.id] || {};
    gain(G, B); for (const [k, v] of Object.entries(B)) out.rewards[k] = (out.rewards[k] || 0) + v;
  }
  for (const c of G.crews) if (c.at === id) c.at = null;
  autoAssign(G);
  out.all = allDone(G);
  return out;
}
/** The key moment was played (or skipped): the stage completes. */
export function momentDone(G, id) {
  const s = G.st[id]; if (!s || s.done) return null;
  s.m = true; s.ready = false;
  return completeStage(G, id);
}

/* ───────── the rough hill (har's dig) ───────── */
/** boulder to hit next: a cracked one first, then the lowest index still standing, excluding `skip`. ── flow9 ── order: the
    boulder field's strike path (an array of indices, game/index.js readBoulderSpots) walked instead of the index order */
export function pickBoulder(bh, skip = {}, order = null) {
  let best = -1;
  const idx = Array.isArray(order) && order.length === bh.length ? order : null;
  for (let k = 0; k < bh.length; k++) {
    const i = idx ? idx[k] : k;
    const hp = bh[i] - (skip[i] || 0);
    if (hp <= 0) continue;
    if (best < 0 || hp < bh[best] - (skip[best] || 0)) best = i;
  }
  return best;
}
/** d hits on boulder i (a perfect strike deals 2). The last boulder ends the dig. → {ok, hp, shattered, stone, phase} */
export function hitBoulder(G, i, d = 1) {
  const j = jobOf(G, 'har');
  if (!j || j.kind !== 'boulders') return { ok: false };
  const hp = G.bh[i];
  if (!(hp > 0)) return { ok: false };
  const dmg = Math.min(hp, Math.max(1, d | 0));
  G.bh[i] = hp - dmg;
  const shattered = G.bh[i] === 0;
  const stone = shattered ? RATE.boulderStone : 0;
  if (stone) G.res.stone += stone;
  let phase = null;
  if (bouldersLeft(G) === 0) { G.st.har.p = 'courses'; phase = 'courses'; }
  legacyView(G.st.har, 'har');
  return { ok: true, hp: G.bh[i], shattered, stone, phase, reached: null };
}
export const bouldersLeft = (G) => G.bh.filter((v) => v > 0).length;

/* ───────── crews ───────── */
export const crewsAt = (G, at) => G.crews.filter((c) => c.at === at).length;
export function buildingSites(G) { return STAGES.filter((s) => isWorkable(G, s.id)).map((s) => s.id); }
/** Put crew i on a site ('quarry', a building site id, or null). */
export function assignCrew(G, i, at) {
  const c = G.crews[i]; if (!c) return false;
  if (at && at !== 'quarry' && !isWorkable(G, at)) return false;
  c.at = at || null;
  return true;
}
/** Idle crews go to the building site with the fewest crews, or to the quarry once the hill is done. */
export function autoAssign(G) {
  const sites = buildingSites(G);
  for (const c of G.crews) {
    if (c.at) continue;
    if (sites.length) { sites.sort((a, b) => crewsAt(G, a) - crewsAt(G, b)); c.at = sites[0]; }
    else if (isDone(G, 'har')) c.at = 'quarry';
  }
}
/** "עזרת העם": once a day, +100% crew work on one site for 15 game-minutes. */
export function callVolunteers(G, id, now) {
  const today = dayKey(now);
  if (G.daily.vol === today || !isWorkable(G, id)) return false;
  G.daily.vol = today;
  G.vol = { id, until: now + gmMs(G, DAILY.volunteersMin) };
  return true;
}
/** Upgrades (silver): tools · crane · carts, levels 1–3. → {ok, lvl, lack?} */
export function upgrade(G, k) {
  const U = UPGRADES[k]; if (!U) return { ok: false };
  const lvl = G.up[k] || 0; if (lvl >= U.cost.length) return { ok: false, max: true };
  const cost = { silver: U.cost[lvl] };
  if (!canAfford(G.res, cost)) return { ok: false, lack: lacking(G.res, cost) };
  pay(G.res, cost); G.up[k] = lvl + 1;
  return { ok: true, lvl: lvl + 1 };
}

/* ───────── simulation: crews, the quarry, timers ───────── */
/**
 * Advance the world from G.clock to now. Crews and the quarry stop after 12 game-hours of absence (then they wait;
 * nothing is lost). opts.rest(t) → true on Shabbat and Yom Tov: the site rests (Yevamot 6a ⚑) and nothing is lost.
 * → report {ms, stone, work:{id: strokes}, stones:{id: n}, hits, phases:[{id,p}], ready, done, priests, capped, waiting:{id: kind}, rest}
 */
export function settle(G, now, opts = {}) {
  const rep = { ms: Math.max(0, now - G.clock), stone: 0, work: {}, stones: {}, courses: {}, hits: [], phases: [], ready: [], done: [], priests: 0, capped: false, waiting: {}, blocked: {}, rest: false };
  if (rep.ms <= 0) { G.clock = Math.max(G.clock, now); return rep; }
  for (let k = G.train.length - 1; k >= 0; k--) if (G.train[k].t1 <= now) { G.train.splice(k, 1); G.priests++; rep.priests++; }
  const capMs = gmMs(G, RATE.offlineCapMin);
  let sim = Math.min(rep.ms, capMs), t = G.clock;
  rep.capped = rep.ms > capMs;
  const stepMs = gmMs(G, 1);
  const rest = typeof opts.rest === 'function' ? opts.rest : null;
  while (sim > EPS) {
    const d = Math.min(stepMs, sim);
    t += d; sim -= d;
    if (rest && rest(t)) { rep.rest = true; continue; }
    step(G, (d / 60000) * speedOf(G), t, rep);
  }
  G.clock = now;
  if (G.vol && G.vol.until <= now) G.vol = null;
  return rep;
}
function step(G, dtMin, t, rep) {
  const nq = Math.min(RATE.quarryMax || 2, crewsAt(G, 'quarry'));
  if (nq) { const s = RATE.quarry * (1 + UPGRADES.carts.by * (G.up.carts || 0)) * nq * dtMin; G.res.stone += s; rep.stone += s; }
  for (const id of buildingSites(G)) {
    const n = crewsAt(G, id); if (!n) continue;
    const j = jobOf(G, id); if (!j) continue;
    const boost = G.vol && G.vol.id === id && t <= G.vol.until ? 2 : 1;
    if (j.kind === 'boulders') {
      G.harAcc += stageById('har').crew * n * boost * dtMin;
      while (G.harAcc >= 1) {
        const i = pickBoulder(G.bh); if (i < 0) { G.harAcc = 0; break; }
        const r = hitBoulder(G, i, 1); G.harAcc -= 1;
        if (!r.ok) break;
        rep.hits.push(i); rep.stone += r.stone;
        rep.work.har = (rep.work.har || 0) + 1;
        if (r.phase) { G.harAcc = 0; rep.phases.push({ id, p: r.phase }); break; }
      }
      continue;
    }
    if (!j.crew) { rep.waiting[id] = j.kind; if (j.kind === 'pay') rep.blocked[id] = lacking(G.res, j.cost); continue; }
    const out = newOut(id, j);
    work(G, id, CREW_RATE * (1 + UPGRADES.crane.by * (G.up.crane || 0)) * n * boost * dtMin, 'crew', out);
    if (out.strokes) rep.work[id] = (rep.work[id] || 0) + out.strokes;
    if (out.stones.length) rep.stones[id] = (rep.stones[id] || 0) + out.stones.length;
    if (out.course) courseRep(rep, id, out.course);   // ── director13 ── (N79) a course the crews closed is reported
    if (out.phase) rep.phases.push({ id, p: out.phase });
    if (out.reached) finishReached(G, id, out.reached, rep);
    if (G.st[id] && !G.st[id].done) legacyView(G.st[id], id);
  }
}
// ── director13 ── (N79, PRODUCER-S13a #3: "a course the crews complete gets its beat") the crews' report carries the courses they
// closed: rep.courses[id] = the last course closed at that site in this settle (its number, 1-based); rep.courseN[id] = how many
// (a long absence may close several: the game shows the last one)
function courseRep(rep, id, c) {
  if (!rep.courses) rep.courses = {};
  if (!rep.courseN) rep.courseN = {};
  rep.courses[id] = Math.max(rep.courses[id] || 0, c);
  rep.courseN[id] = (rep.courseN[id] || 0) + 1;
}
// ── /director13 ──
/** ── flow10 ── (NET10's "כהנים יחד": the partner's stone on the other device) one stone of crew-like work at site `id`, when the
 *  job there is a stone the crews may set (never a key stone, the course check or an unpaid segment) → a settle-like report
 *  (for the game's applyReport) | null */
export function coStone(G, id) {
  const s = site(G, id), j = jobOf(G, id);
  if (!s || !j || j.kind !== 'stone' || !j.crew) return null;
  const rep = { ms: 0, stone: 0, work: {}, stones: {}, courses: {}, hits: [], phases: [], ready: [], done: [], priests: 0, capped: false, waiting: {}, blocked: {}, rest: false };
  const out = newOut(id, j);
  work(G, id, Math.max(EPS, j.need - (s.k || 0)) + EPS / 2, 'crew', out);
  if (out.strokes) rep.work[id] = out.strokes;
  if (out.stones.length) rep.stones[id] = out.stones.length;
  if (out.course) courseRep(rep, id, out.course);   // ── director13 ── (N79: the partner's course end too)
  if (out.phase) rep.phases.push({ id, p: out.phase });
  if (out.reached) finishReached(G, id, out.reached, rep);
  if (G.st[id] && !G.st[id].done) legacyView(G.st[id], id);
  return rep;
}
/**
 * ── build7 ── ms until the crews at site `id` set their next stone (FUN's crew chip: "הצוות מניח אבן בעוד 3:03"), or null when
 * no crew sets a stone there now (no crew; a key stone, the course check, an unpaid segment, the survey… or the day of rest).
 */
export function crewEta(G, id, now = G.clock) {
  const n = crewsAt(G, id); if (!n) return null;
  const s = G.st[id], j = jobOf(G, id);
  if (!s || s.done || !j || j.kind !== 'stone' || !j.crew) return null;
  const boost = G.vol && G.vol.id === id && now <= G.vol.until ? 2 : 1;
  const perMin = CREW_RATE * (1 + UPGRADES.crane.by * (G.up.crane || 0)) * n * boost;
  if (!(perMin > 0)) return null;
  return Math.max(0, gmMs(G, Math.max(0, j.need - s.k) / perMin));
}
/** ── build7 ── the Mount's cheap segments pile stone far above its need (PLAYTEST-S6 #9): while the Mount is built and the wall
    not yet started, and the tutorial over, stone held beyond four of the Mount's segments reads as a plan — "מלאי לחומה". → {n, next: wall's segment} | null */
export function stockPlan(G) {
  if (G.ftue < 99 || isDone(G, 'har') || statusOf(G, 'har') !== 'building' || statusOf(G, 'wall') === 'building' || isDone(G, 'wall')) return null;
  const per = (PROJ.har.seg && PROJ.har.seg.stone) || 12, have = G.res.stone || 0;
  return have >= per * 4 ? { n: Math.floor(have), per, next: (PROJ.wall.seg && PROJ.wall.seg.stone) || 0 } : null;
}
function finishReached(G, id, reached, rep) {
  if (reached === 'ready') {
    rep.ready.push(id);
    for (const c of G.crews) if (c.at === id) c.at = null;
    autoAssign(G);
  } else {
    const c = completeStage(G, id);
    if (c) rep.done.push(c);
  }
}

/* ───────── the one next action, the site panel, the board ───────── */
/** the site the player works on: his choice, else the site with the most to do now */
export function focusOf(G) {
  if (G.focus && isWorkable(G, G.focus)) return G.focus;
  const b = buildingSites(G);
  if (!b.length) return null;
  const rank = (id) => { const j = jobOf(G, id); return !j ? 9 : { key: 0, event: 1, inspect: 2, reset: 3, stone: 4, survey: 4, dig: 4, boulders: 4, finish: 4 }[j.kind] ?? (canAfford(G.res, j.cost) ? 5 : 6); };
  return b.slice().sort((a, c) => rank(a) - rank(c) || progressOf(G, c) - progressOf(G, a))[0];
}
/**
 * The ONE prominent action → {kind, id?, …}
 *   'moment' · 'key' {game, what, i} · 'event' {ev} · 'inspect' · 'work' {job} (tap the site: a stroke) ·
 *   'build' {step, cost} (you hold it: pay) · 'play' {step, cost, lack, field, need} (the match-3 that earns the shortfall) ·
 *   'start' {cost} (the next stage) · 'priests' {need} · 'done' · 'none' ·
 *   (build7, with o.deal) 'deal' {res, need, partner, offer, who, n, cost, play} — a king brings the bronze the step lacks
 */
export function nextAction(G, o = null) {
  const a = nextAction0(G);
  // ── build7 ── (FUN7 P0) a bronze need leads with the king who brings it (Nikanor's doors, Cyprus' copper): the gold field has
  // little ore, so its boards were a gold farm. o.deal(res, need, a) → {partner, offer, who, n, cost} | null (KINGS' bestFor,
  // guarded by the host); without it, or without an offer, the board as before. → {kind:'deal', id, res, need, …offer, play: a}
  if (o && typeof o.deal === 'function' && a.kind === 'play' && a.lack && a.lack.bronze > 0) {
    let d = null; try { d = o.deal('bronze', a.lack.bronze, a); } catch (e) { d = null; }
    if (d && d.offer) return { ...d, kind: 'deal', id: a.id, res: 'bronze', need: a.lack.bronze, play: a };
  }
  return a;
}
function nextAction0(G) {
  const ready = STAGES.find((s) => G.st[s.id] && !G.st[s.id].done && G.st[s.id].ready);
  if (ready) return { kind: 'moment', id: ready.id };
  const f = focusOf(G);
  if (f) {
    const j = jobOf(G, f);
    if (j) switch (j.kind) {
      case 'key': return { kind: 'key', id: f, game: j.game, what: j.what, i: j.i };
      case 'event': return { kind: 'event', id: f, ev: j.ev, i: j.i };
      case 'inspect': return { kind: 'inspect', id: f };
      case 'check': return { kind: 'check', id: f };
      case 'pay': {
        if (canAfford(G.res, j.cost)) { const b = buyOf(G, f, { step: j.step, cost: j.cost, stones: j.stones || 0 }); return { kind: 'build', id: f, step: j.step, cost: b.cost, stones: b.stones || 0 }; }   // ── director13 ── (the demo: the stones one payment brings)
        if (j.step === 'dig' && treasurerCovers(G, j.cost)) return { kind: 'build', id: f, step: j.step, cost: j.cost, stones: 0, tre: true };   // ── econ14 ── ── /econ14 ──
        const lack = lacking(G.res, j.cost), field = fieldFor(lack);
        return { kind: 'play', id: f, step: j.step, cost: j.cost, lack, field, need: needFor(lack, field) };
      }
      case 'moment': return { kind: 'moment', id: f };
      default: return { kind: 'work', id: f, job: j.kind };
    }
  }
  const av = STAGES.filter((s) => statusOf(G, s.id) === 'avail');
  const ok = av.find((s) => s.priests <= G.priests);
  if (ok) {
    const cost = PROJ[ok.id].sv ? { silver: PROJ[ok.id].sv } : {};
    if (canAfford(G.res, cost) || treasurerCovers(G, cost)) return { kind: 'start', id: ok.id, cost };   // ── econ14 ── (the treasurer) ── /econ14 ──
    const lack = lacking(G.res, cost);
    return { kind: 'play', id: ok.id, step: 'survey', cost, lack, field: 'quarry', need: needFor(lack, 'quarry') };
  }
  if (av.length) return { kind: 'priests', id: av[0].id, need: av[0].priests };
  return allDone(G) ? { kind: 'done' } : { kind: 'none' };
}
/** everything the site panel shows */
export function siteView(G, id) {
  const d = stageById(id), P = PROJ[id]; if (!d || !P) return null;
  const st = statusOf(G, id), n = siteStones(id);
  const v = { id, name: d.n, st, C: P.C, per: P.P, n, p: progressOf(G, id), ph: st === 'done' ? 'done' : 'survey', set: st === 'done' ? n : 0, paid: 0, stock: 0, course: 0, inCourse: 0, fin: P.fin.length, fd: 0, crews: crewsAt(G, id), job: null, step: null, lack: null, keysLeft: 0, bad: 0, next: null };
  if (st === 'avail') { v.step = { step: 'survey', cost: P.sv ? { silver: P.sv } : {} }; v.lack = lacking(G.res, v.step.cost); }
  const s = site(G, id);
  if (s) {
    Object.assign(v, { ph: s.ready ? 'moment' : s.p, set: s.set, paid: s.paid, stock: s.paid - s.set, fd: s.fd, bad: s.bad.length, k: s.k });
    v.course = Math.min(P.C, Math.floor(s.set / P.P) + 1); v.inCourse = s.set % P.P;
    if (s.set >= n) { v.course = P.C; v.inCourse = P.P; }
    v.job = jobOf(G, id); v.step = buyOf(G, id, stepOf(G, id));   // ── director13 ── (the demo: a payment buys the stock's segments)
    v.lack = v.step ? lacking(G.res, v.step.cost) : null;
    for (let i = s.set; i < n; i++) if (keyOf(id, i)) v.keysLeft++;
    for (let i = s.set; i < n; i++) { const k = keyOf(id, i); if (k) { v.next = { i, ...k }; break; } }
  }
  return v;
}
/** the project board: every stage, its state and what it waits for */
export function boardView(G) {
  return STAGES.map((d) => {
    const st = statusOf(G, d.id), j = st === 'building' ? jobOf(G, d.id) : null;
    return { id: d.id, name: d.n, ch: d.ch, st, p: progressOf(G, d.id), ph: st === 'done' ? 'done' : st === 'building' ? (G.st[d.id].ready ? 'moment' : site(G, d.id).p) : null, job: j ? j.kind : null, deps: d.deps.filter((x) => !isDone(G, x)), crews: crewsAt(G, d.id) };
  });
}

/* ───────── v5 caravans: gone (KINGS owns the sea routes); kept as no-ops for old readers ───────── */
export const routeOpen = () => false;
export const carFree = () => 0;
export function carState(c, now) { return now >= c.t1 ? 'back' : 'away'; }
export const carsBack = (G, now) => (G.car || []).filter((c) => carState(c, now) === 'back').length;
export function startCaravan() { return { ok: false }; }
export function collectCaravan() { return null; }

/* ───────── trained priests ───────── */
export function startTraining(G, now) {
  if (!G.trainOn || G.train.length >= G.trainSlots) return { ok: false };
  if (G.res.silver + EPS < TRAIN.cost) return { ok: false, lack: { silver: Math.ceil(TRAIN.cost - G.res.silver) } };
  G.res.silver -= TRAIN.cost;
  G.train.push({ t0: now, t1: now + gmMs(G, TRAIN.min) });
  return { ok: true };
}
/** Today's quiz question (deterministic by day), or null when the day's three are used. */
export function quizToday(G, now) {
  const day = dayKey(now);
  if (G.quiz.day !== day) { G.quiz.day = day; G.quiz.n = 0; }
  if (G.quiz.n >= TRAIN.quizPerDay) return null;
  const seed = [...day].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  for (let k = 0; k < QUIZ.length; k++) {
    const q = QUIZ[(seed + G.quiz.n * 5 + k) % QUIZ.length];
    if (!G.quiz.done[q.id + day]) return q;
  }
  return null;
}
/** → {ok: bool, correct: bool, cut: ms} A correct answer pays silver and shortens the earliest training. */
export function answerQuiz(G, qid, choice, now) {
  const q = QUIZ.find((x) => x.id === qid), day = dayKey(now);
  if (!q || G.quiz.done[qid + day] || G.quiz.n >= TRAIN.quizPerDay) return { ok: false };
  G.quiz.done[qid + day] = 1; G.quiz.n++;
  const correct = choice === q.ok;
  let cut = 0;
  if (correct) {
    G.res.silver += TRAIN.quizSilver;
    const t = G.train.slice().sort((a, b) => a.t1 - b.t1)[0];
    if (t) { cut = Math.min(gmMs(G, TRAIN.quizCutMin), Math.max(0, t.t1 - now)); t.t1 -= cut; }
  }
  return { ok: true, correct, cut };
}

/* ───────── daily: wage, streak (Shabbat and Yom Tov never break it), tasks, the golden vine ───────── */
/**
 * First visit of a calendar day: the streak, the wage and the day's three tasks.
 * isRestDay(dayKey) → true for Shabbat / Yom Tov (index.js passes calendar.js); skipped days don't break the streak.
 * → null (same day) | {day, streak, wage:{...}, broke:boolean}
 */
export function dailyCheck(G, now, isRestDay = () => false) {
  const today = dayKey(now), D = G.daily;
  if (D.day === today) return null;
  let streak = 1, broke = false;
  if (D.day) {
    let ok = true, k = addDays(D.day, 1), guard = 0;
    while (k < today && guard++ < 400) { if (!isRestDay(k)) { ok = false; break; } k = addDays(k, 1); }
    streak = ok ? D.streak + 1 : 1; broke = !ok && D.streak > 1;
  }
  D.day = today; D.streak = streak;
  const wage = DAILY.wage(streak);
  gain(G, wage);
  D.wageDay = today;
  D.tasks = tasksFor(today);
  return { day: today, streak, wage, broke };
}
function tasksFor(day) {
  const h = [...day].reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) >>> 0, 5);
  const pick = (a, b, bit) => ((h >> bit) & 1 ? a : b);
  return [pick('perfect', 'strikes', 1), pick('level', 'stones', 2), pick('learn', 'quiz', 3)]
    .map((id) => ({ id, n: 0, goal: TASKS[id].goal, done: false }));
}
/** Count progress on today's tasks. → {leaf, grape, cluster} (what the vine got now) */
export function taskProgress(G, id, n = 1) {
  const out = { leaf: 0, grape: 0, cluster: 0 };
  for (const t of G.daily.tasks) {
    if (t.done || t.id !== id) continue;
    t.n = Math.min(t.goal, t.n + n);
    if (t.n >= t.goal) { t.done = true; G.vine.leaves++; out.leaf++; }
  }
  if (out.leaf && G.daily.tasks.length && G.daily.tasks.every((t) => t.done)) {
    G.vine.grapes++; out.grape++; G.vine.grapeDays++;
    if (G.vine.grapeDays % VINE.clusterDays === 0) { G.vine.clusters++; out.cluster++; }
  }
  return out;
}
/** The size for world.setVine: every task is a leaf, and the world hangs a grape per 3 and a cluster per 10. */
export const vineSize = (G) => G.vine.leaves;

/* ───────── the Middot book ───────── */
export function readMishnah(G, id) {
  if (!G.book.un[id]) return { ok: false };
  const first = !G.book.read[id];
  G.book.read[id] = 1;
  const all = Object.keys(G.book.read).length;
  return { ok: true, first, siyum: first && all === 34 };
}

/* ───────── strikes ───────── */
/** A stroke's worth: normal 1, perfect 2 (v6: no combo multiplier on work — the combo is juice). */
export function strikeValue(perfect) { return perfect ? 2 : 1; }
export function noteStrike(G, perfect) {
  G.stats.strikes++;
  if (perfect) { G.stats.perfect++; G.stats.combo = (G.stats.combo || 0) + 1; G.stats.best = Math.max(G.stats.best, G.stats.combo); }
  else G.stats.combo = 0;
  return G.stats.combo;
}

// ── econ14 ── (D2) the coins, paid at once (Ant. 20.220): pure, fixed, nothing random, no timers
const econOf = (G) => (isObj(G.econ) ? G.econ : (G.econ = {}));
function earn(G, coins, why) {
  const e = econOf(G);
  G.res.silver = (G.res.silver || 0) + coins;
  e.earned = (e.earned || 0) + coins;
  if (why) e[why] = (e[why] || 0) + coins;
  return coins;
}
/** A job is done (FUN14's playJob): coins = stars × (level + 2); a skip pays PAY.skip. → { coins, stars, first, id, site } */
export function payJob(G, o = {}) {
  const e = econOf(G), stars = PAY.starsOf(num(o.q, 0), !!o.skipped);
  const coins = earn(G, o.skipped ? PAY.skip : PAY.coins(stars, o.level), 'jobs');
  e.nJobs = (e.nJobs || 0) + 1;
  const first = !e.paid1; e.paid1 = 1;
  return { coins, stars, first, id: o.id || null, site: o.site || null, level: Math.max(1, Math.min(3, o.level | 0 || 1)) };
}
/** A course is closed by the player's job: +PAY.course. → { coins } */
export function payCourse(G) { return { coins: earn(G, PAY.course, 'courses'), course: true }; }
/** The stage's key moment: twice a hard job's pay at its quality (0…1), on top of REWARD. → { coins, stars } */
export function payMoment(G, q = 0.8) { const stars = PAY.starsOf(num(q, 0.8)); return { coins: earn(G, PAY.momentX * PAY.coins(stars, PAY.momentLevel), 'moments'), stars }; }
/** In-between games: at most PAY.gameMin coins a minute played (half a job's rate). → the coins kept */
export function payGame(G, coins, minutes) { const c = Math.max(0, Math.min(Math.floor(num(coins, 0)), Math.ceil(PAY.gameMin * Math.max(0, num(minutes, 0))))); return c ? earn(G, c, 'games') : 0; }
/** a cost of coins alone that the treasurer would cover now (a survey or a dig: building never waits on the shop) */
export function treasurerCovers(G, cost) {
  const ks = Object.keys(cost || {}).filter((k) => cost[k] > 0);
  return ks.length === 1 && ks[0] === 'silver' && !canAfford(G.res, cost);
}
/** the treasurer pays the shortfall "מקופת המקדש" (Shekalim 5:2, the gizbarim). → the coins he added (0: none needed) */
export function treasurer(G, cost, id = null) {
  if (!treasurerCovers(G, cost)) return 0;
  const short = Math.ceil(cost.silver - (G.res.silver || 0) - EPS);
  if (!(short > 0)) return 0;
  G.res.silver = (G.res.silver || 0) + short;
  const e = econOf(G); e.tre = (e.tre || 0) + short; e.treLast = { id, n: short };
  return short;
}
// ── /econ14 ──

/* ───────── the v5 façade (hooks/next.js, hooks/index.js read these) ───────── */
/** Why a site cannot progress right now: null, {lack:{res:n}} for a step's materials, or {moment:true}. */
export function blockOf(G, id) {
  const s = G.st[id];
  if (!s || s.done) return null;
  if (s.ready) return { moment: true };
  const j = jobOf(G, id);
  if (j && j.kind === 'pay' && !canAfford(G.res, j.cost)) return { lack: lacking(G.res, j.cost) };
  return null;
}
/** → {kind: 'moment'|'build'|'blocked'|'start'|'priests'|'done'|'none', id?, lack?} (nextAction in v5 words) */
export function recommend(G) {
  const a = nextAction(G);
  switch (a.kind) {
    case 'moment': return { kind: 'moment', id: a.id };
    case 'play': return G.st[a.id] ? { kind: 'blocked', id: a.id, lack: a.lack } : { kind: 'start', id: a.id };
    case 'start': return { kind: 'start', id: a.id };
    case 'priests': return { kind: 'priests', id: a.id, need: a.need };
    case 'done': return { kind: 'done' };
    case 'none': return { kind: 'none' };
    default: return { kind: 'build', id: a.id };
  }
}
/** The meter: always the five materials; the altar's whole stones once the altar chapter is open or held. */
export function hudRes(G) {
  const keys = ['stone', 'cedar', 'gold', 'silver', 'bronze'];
  if (G.res.wstone >= 1 || ['yesod', 'sovev', 'guf', 'karnot'].some((id) => { const s = statusOf(G, id); return s === 'avail' || s === 'building'; })) keys.push('wstone');
  return keys;
}

/* ───────── demo: finish the current chapter ───────── */
export function skipChapter(G) {
  const ch = CHAPTERS.find((c) => c.id === chapterOf(G));
  if (!ch) return [];
  const out = [];
  if (ch.id === 4) G.priests = Math.max(G.priests, 10);
  for (let guard = 0; guard < 20; guard++) {
    const next = ch.stages.find((id) => !isDone(G, id) && stageById(id).deps.every((d) => isDone(G, d)));
    if (!next) break;
    G.st[next] = { ...fromFraction(G, next, 1, { m: true }) };
    if (next === 'har') G.bh = G.bh.map(() => 0);
    const c = completeStage(G, next);
    if (c) out.push(c);
  }
  return out;
}

/** ── supervisor (30.9, the owner: "מצב הדגמה לא עובד בשלב א. הוא עובר ישר לשלב ב … כדי לבחון בעצמי את כל השלבים") the demo's
    stage jump: a FRESH demo save with every stage before `id` done (STAGES order satisfies every dep; each one as a player would
    have it: its rewards, unlocks, crews and chapters), `id` itself at its start, the tutorial and the opening behind, and the
    player's name and mishmar kept. Only ever the demo's own save ('bh_demo'); the real game is never touched. → G | null */
export function demoAt(prev, id, now = Date.now()) {
  const i = STAGES.findIndex((s) => s.id === id);
  if (i < 0) return null;
  const G = fresh(now, { demo: true });
  if (prev) { G.name = prev.name || ''; G.mishmar = prev.mishmar || 0; if (prev.m3 && typeof prev.m3 === 'object') G.m3 = prev.m3; }
  G.ftue = 99; G.op = 1;
  G.story.demoJump = id;
  for (const s of STAGES.slice(0, i)) {
    G.st[s.id] = { ...fromFraction(G, s.id, 1, { m: true }) };
    if (s.id === 'har') G.bh = G.bh.map(() => 0);
    completeStage(G, s.id);
  }
  if (STAGES[i].ch >= 4) G.priests = Math.max(G.priests, 10);   // (the House's stages need trained kohanim, as skipChapter gives chapter 4)
  for (const [k, v] of Object.entries(DEMO_RES)) G.res[k] = Math.max(G.res[k] || 0, v);                       // the demo's stock, whatever the rewards left
  G.res.stone = Math.max(G.res.stone || 0, 600);   // (a tester who jumped to a stage builds a few courses before the quarry's games come round; a fresh demo keeps the mentor's 40, so the investor sees the first level)
  G.focus = id;
  return G;
}

/* ───────── offline report (welcome back) ───────── */
export function snapshot(G) {
  const st = {};
  for (const s of STAGES) { const x = G.st[s.id] && !G.st[s.id].done ? site(G, s.id) : null; st[s.id] = { status: statusOf(G, s.id), p: progressOf(G, s.id), set: x ? x.set : 0, ph: x ? x.p : null }; }
  return { st, bh: G.bh.slice(), res: { ...G.res }, priests: G.priests };
}
