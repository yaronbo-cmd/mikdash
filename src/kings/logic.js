/* ─────────────────────────────────────────────────────────────────────────────
 * kings/logic.js — the pure rules of trade with the kings of the nations (no DOM; node-testable).
 *
 *   ensure(G) → G.kings (guarded defaults)       partners(G, now, opts) → the courts and their state
 *   offers(G, partnerId, now, opts)              accept(G, offerId, now, {apply, rest, needs, demo}) → {ok, cost, eta, voyage}
 *   settle(G, now) → deliveries that reached Jerusalem since the last call (they wait at the storehouse)
 *   unload(G, voyageId, now, {apply, rest}) → {ok, res, rel, seal, letters, item}      unloadAll(G, now, opts)
 *   status(G, now) → {sea, arrived, news, badge}        phase(voyage, now) → where it is now
 *
 * Time is real time (G.demo ×60). Nothing is random, nothing is ever lost: an arrived cargo waits until unloaded;
 * Shabbat (opts.rest) only pauses new deals and unloading. apply(delta) is BUILD's meter: it returns false to refuse.
 * ──────────────────────────────────────────────────────────────────────────── */
import { PARTNERS, PIDX, OFFERS, OIDX, LEVELS, LEGS, LETTERS } from './data.js';

const MIN = 60000;
const NONE = Object.freeze([]);
export const DEMO_SPEED = 60;

/** Global tuning (BUILD's economy sim may scale): cost × silver, yield × goods, time × voyage length. */
export const TUNE = { cost: 1, yield: 1, time: 1 };
export function tune(o = {}) {
  for (const k of ['cost', 'yield', 'time']) if (typeof o[k] === 'number' && o[k] > 0) TUNE[k] = o[k];
  return { ...TUNE };
}

/** G.kings with guarded defaults (any missing or broken field is repaired, nothing else touched). */
export function ensure(G) {
  if (!G || typeof G !== 'object') return null;
  let k = G.kings;
  if (!k || typeof k !== 'object' || Array.isArray(k)) k = G.kings = {};
  k.v = 1;
  for (const f of ['rel', 'seals', 'letters', 'flags', 'done', 'items', 'byP']) if (!k[f] || typeof k[f] !== 'object') k[f] = {};
  if (!Array.isArray(k.voy)) k.voy = [];
  // a voyage is kept while it can still be delivered (its court exists, its legs and cargo are sane) — even if a later
  // version renamed its offer: nothing that set out is ever lost
  k.voy = k.voy.filter((v) => v && typeof v === 'object' && typeof v.id === 'string' && PIDX[v.p] !== undefined && Array.isArray(v.legs)
    && v.legs.length && v.gives && typeof v.gives === 'object' && Number.isFinite(v.end) && Number.isFinite(v.t0));
  if (!Array.isArray(k.news)) k.news = [];
  k.n = Number.isFinite(k.n) ? k.n : 0;
  for (const v of k.voy) { const m = +String(v.id).slice(1); if (m > k.n) k.n = m; }   // never reuse a voyage id
  return k;
}

/** `now` may be ms or a function returning ms (BUILD passes its clock). */
const tnow = (t) => (typeof t === 'function' ? +t() : t == null ? Date.now() : +t);
const speed = (G, opts) => ((opts && opts.demo) || (G && G.demo) ? DEMO_SPEED : 1);
const restAt = (opts, now) => { const r = opts && opts.rest; try { return typeof r === 'function' ? !!r(now) : !!r; } catch (e) { return false; } };
const isDone = (G, id) => !!(G && G.st && G.st[id] && G.st[id].done);

/** A building milestone (BUILD's G.st). Without a building state (a harness, a test) every gate is open. */
export function gateOpen(G, gate) {
  if (!gate) return true;
  if (!G || !G.st || typeof G.st !== 'object') return true;
  if (gate === 'nikanor') return isDone(G, 'nashim') || !!G.st.nikanor;   // its deps are done, or the gate's stage is started (BUILD v6: G.st[id] exists once started)
  return isDone(G, gate);
}

export function levelOf(pts) { let l = 0; for (let i = 0; i < LEVELS.length; i++) if (pts >= LEVELS[i].at) l = i; return l; }
export function relOf(G, pid) {
  const k = ensure(G); const pts = (k && +k.rel[pid]) || 0; const lvl = levelOf(pts); const nx = LEVELS[lvl + 1];
  return { lvl, pts, next: nx ? nx.at : null, label: LEVELS[lvl].n };
}

/** The meter by default (tests, no BUILD): refuse a cost that is not affordable; otherwise add. */
export function applyRes(G, d) {
  if (!G) return false;
  const r = G.res && typeof G.res === 'object' ? G.res : (G.res = {});
  for (const [key, v] of Object.entries(d)) if (v < 0 && (r[key] || 0) + v < 0) return false;
  for (const [key, v] of Object.entries(d)) r[key] = (r[key] || 0) + v;
  return true;
}

function priceOf(o, rel) { return o.gift ? 0 : Math.round(o.cost * TUNE.cost * (rel.lvl >= 2 ? 0.85 : 1)); }
function goodsOf(o) { const g = {}; for (const [key, v] of Object.entries(o.gives)) g[key] = Math.round(v * TUNE.yield); return g; }
function timeOf(G, o, rel, opts) { return Math.round(o.min * MIN * TUNE.time * (rel.lvl >= 4 ? 0.75 : 1) / speed(G, opts)); }
const unfinished = (k, pid) => k.voy.find((v) => v.p === pid);

/** The offers of one court, each with ok / why ('busy' | 'lack' | 'locked' | 'rest' | 'done') and what it needs. */
export function offers(G, pid, now = Date.now(), opts = {}) {
  now = tnow(now);
  const k = ensure(G); const p = PARTNERS[PIDX[pid]];
  if (!k || !p) return [];
  const rel = relOf(G, pid);
  const busy = unfinished(k, pid);
  const rest = restAt(opts, now);
  const silver = (G.res && +G.res.silver) || 0;
  const needs = (opts && opts.needs) || {};
  const out = [];
  for (const o of OFFERS) {
    if (o.p !== pid) continue;
    if (o.ftue && (k.byP[pid] || +k.rel[pid] > 0 || k.done[o.id] || (busy && busy.o !== o.id))) continue;   // a first taste only
    if (o.until && k.flags[o.until]) continue;                                                  // replaced (the market → the treaty)
    const cost = priceOf(o, rel), gives = goodsOf(o), ms = timeOf(G, o, rel, opts);
    let why = null, need = null, lack = null;
    if (o.once && k.done[o.id] && !(busy && busy.o === o.id)) why = 'done';
    else if (o.needs && !k.flags[o.needs]) { why = 'locked'; need = { flag: o.needs }; }
    else if (o.lvl && rel.lvl < o.lvl) { why = 'locked'; need = { lvl: o.lvl, label: LEVELS[o.lvl].n }; }
    else if (o.gate && !gateOpen(G, o.gate)) { why = 'locked'; need = { gate: o.gate }; }
    else if (busy) why = 'busy';
    else if (rest) why = 'rest';
    else if (cost > silver) { why = 'lack'; lack = { silver: cost - silver }; }
    out.push({
      id: o.id, partner: pid, n: o.n, d: o.d, gives, cost, ms, ok: !why, why, need, lack,
      gift: !!o.gift, once: !!o.once, lvl: o.lvl || 0, illus: !!o.illus, storm: !!o.storm, item: o.item || null,
      now: Object.keys(gives).some((r) => (needs[r] || 0) > 0),
    });
  }
  return out;
}

function legsOf(o, ms) {
  return (LEGS[o.id] || LEGS[o.p]).map(([kind, path, a, b, share]) => [kind, path, a, b, Math.round(ms * share)]);
}
const totalOf = (legs) => legs.reduce((s, l) => s + l[4], 0);

/** Close a deal: pay (through apply), and the ship or caravan sets out. */
export function accept(G, offerId, now = Date.now(), opts = {}) {
  now = tnow(now);
  const k = ensure(G);
  if (!k) return { ok: false, why: 'nogame' };
  const o = OFFERS[OIDX[offerId]];
  if (!o) return { ok: false, why: 'unknown' };
  const view = offers(G, o.p, now, opts).find((x) => x.id === offerId);
  if (!view) return { ok: false, why: 'hidden' };
  if (!view.ok) return { ok: false, why: view.why, need: view.need, lack: view.lack };
  if (view.cost > 0) {
    const apply = opts.apply || ((d) => applyRes(G, d));
    let r; try { r = apply({ silver: -view.cost }); } catch (e) { r = false; }
    if (r === false) return { ok: false, why: 'lack', lack: { silver: Math.max(1, view.cost - ((G.res && +G.res.silver) || 0)) } };
  }
  const legs = legsOf(o, view.ms);
  const end = now + totalOf(legs);
  const v = { id: 'v' + (++k.n), p: o.p, o: o.id, t0: now, end, legs, gives: view.gives, cost: view.cost };
  if (o.storm) v.ev = [{ k: 'storm', at: now + Math.round((end - now) * o.storm) }];
  k.voy.push(v);
  if (o.once || o.ftue) k.done[o.id] = now;
  return { ok: true, cost: view.cost, eta: end, voyage: v };
}

/** Where a voyage is at `now`: {i, kind, path, a, b, f (0..1 along the leg), left (ms to Jerusalem)} or kind 'arrived'. */
export function phase(v, now = Date.now()) {
  now = tnow(now);
  let t = now - v.t0;
  if (t < 0) t = 0;
  for (let i = 0; i < v.legs.length; i++) {
    const [kind, path, a, b, ms] = v.legs[i];
    if (ms <= 0) continue;
    if (t < ms) return { i, kind, path, a, b, f: t / ms, left: Math.max(0, v.end - now) };
    t -= ms;
  }
  const last = v.legs[v.legs.length - 1];
  return { i: v.legs.length, kind: 'arrived', path: last[1], a: last[3], b: last[3], f: 1, left: 0 };
}

function earnLetter(k, id, now, got) { if (!k.letters[id]) { k.letters[id] = now; got.push(id); } }
function news(k, kind, p, at, extra) { k.news.push({ k: kind, p, at, ...(extra || {}) }); if (k.news.length > 20) k.news.splice(0, k.news.length - 20); }

/** Voyages that reached Jerusalem (and told events that happened on the way) since the last call. Pure and idempotent. */
export function settle(G, now = Date.now()) {
  now = tnow(now);
  const k = ensure(G);
  if (!k || !k.voy.length) return NONE;
  let out = null;
  for (const v of k.voy) {
    if (v.ev) for (const e of v.ev) if (!e.done && now >= e.at) {
      e.done = true;
      if (e.k === 'storm') { const got = []; earnLetter(k, 'storm', e.at, got); news(k, 'storm', v.p, e.at, { v: v.id }); }
    }
    if (!v.arr && now >= v.end) {
      v.arr = v.end;
      news(k, 'arrive', v.p, v.end, { v: v.id });
      (out || (out = [])).push({ id: v.id, partner: v.p, offer: v.o, res: { ...v.gives }, at: v.end });
    }
  }
  return out || NONE;
}

/** The arrival beat: the cargo goes into the meter; relationship, the court's seal, letters, special items. */
export function unload(G, vid, now = Date.now(), opts = {}) {
  now = tnow(now);
  const k = ensure(G);
  if (!k) return { ok: false, why: 'nogame' };
  const i = k.voy.findIndex((x) => x.id === vid);
  if (i < 0) return { ok: false, why: 'unknown' };
  const v = k.voy[i];
  if (now < v.end) return { ok: false, why: 'sea', left: v.end - now };
  if (restAt(opts, now)) return { ok: false, why: 'rest' };
  settle(G, now);
  const apply = opts.apply || ((d) => applyRes(G, d));
  let r; try { r = apply({ ...v.gives }); } catch (e) { r = false; }
  if (r === false) return { ok: false, why: 'apply' };
  k.voy.splice(i, 1);
  const o = OFFERS[OIDX[v.o]] || { id: v.o, p: v.p };
  const before = relOf(G, v.p).lvl;
  k.rel[v.p] = ((+k.rel[v.p]) || 0) + (o.pts || 1);
  const got = [];
  let seal = null, item = null, flag = null, event = null;
  if (!k.seals[v.p]) { k.seals[v.p] = now; seal = v.p; }
  if (o.sets && !k.flags[o.sets]) { k.flags[o.sets] = now; flag = o.sets; }
  if (o.item && !k.items[o.item]) { k.items[o.item] = now; item = o.item; }
  if (v.ev) for (const e of v.ev) if (e.k === 'storm') earnLetter(k, 'storm', e.at, got);
  if (o.id === 'rome_mines' && !k.flags.agrippa) {   // the first copper under the treaty: Agrippa visits Jerusalem (an event)
    k.flags.agrippa = now; k.rel.rome = (+k.rel.rome || 0) + 2; event = 'agrippa'; news(k, 'agrippa', 'rome', now);
  }
  const rel = relOf(G, v.p);
  for (const L of LETTERS) {
    if (L.p !== v.p) continue;
    if ((L.lvl && rel.lvl >= L.lvl) || (L.ev && (L.ev === o.id || L.ev === flag || L.ev === event))) earnLetter(k, L.id, now, got);
  }
  k.byP[v.p] = (k.byP[v.p] || 0) + 1;
  for (const nw of k.news) if (nw.v === v.id) nw.seen = true;
  return { ok: true, id: v.id, partner: v.p, offer: v.o, res: { ...v.gives }, rel: { ...rel, up: rel.lvl > before }, seal, letters: got, item, flag, event };
}

export function unloadAll(G, now = Date.now(), opts = {}) {
  now = tnow(now);
  const k = ensure(G); if (!k) return [];
  const ids = k.voy.filter((v) => now >= v.end).map((v) => v.id);
  return ids.map((id) => unload(G, id, now, opts)).filter((r) => r.ok);
}

/** For the dock button's badge: what is at sea, what waits at the storehouse, unseen news. */
export function status(G, now = Date.now()) {
  now = tnow(now);
  const k = ensure(G);
  let sea = 0, arrived = 0;
  if (k) for (const v of k.voy) if (now >= v.end) arrived++; else sea++;
  const news = k ? newsOf(G).length : 0;
  // (wave 7, FUN) a messenger waits: the first deal's story (ui.js story) — after the first course, until it is told or a deal is made
  const story = k && !k.story && !k.voy.length && !Object.keys(k.done).length && (((G.fun && G.fun.stats && G.fun.stats.courses) | 0) >= 1) ? 1 : 0;
  return { sea, arrived, news, story, badge: arrived + news + story };
}

/** The courts: relationship, what is happening with each, whether anything there is open now. */
export function partners(G, now = Date.now(), opts = {}) {
  now = tnow(now);
  const k = ensure(G);
  return PARTNERS.map((p) => {
    const rel = relOf(G, p.id);
    const v = k ? unfinished(k, p.id) : null;
    const offs = offers(G, p.id, now, opts);
    let st = 'ready', why = null, voyage = null;
    if (v) { const ph = phase(v, now); voyage = { id: v.id, offer: v.o, left: ph.left, kind: ph.kind, end: v.end }; st = ph.kind === 'arrived' ? 'arrived' : (ph.kind === 'cart' ? 'road' : (ph.kind === 'sea' ? 'sea' : 'road')); }
    else if (offs.length && offs.every((x) => x.why === 'locked' || x.why === 'done')) {
      st = 'locked'; const g = offs.find((x) => x.need && x.need.gate); why = g ? { gate: g.need.gate } : { done: offs.every((x) => x.why === 'done') };
    }
    return { id: p.id, n: p.n, short: p.short, place: p.place, rel, status: st, why, voyage, gift: !!p.gift, quest: !!p.quest, seal: !!(k && k.seals[p.id]), now: offs.some((x) => x.now && x.ok), taste: offs.some((x) => x.ok && OFFERS[OIDX[x.id]].ftue) };
  });
}

/** Unseen told events (storm, Agrippa) for the court's news line; mark them seen with seen(G). */
export function newsOf(G) { const k = ensure(G); return k ? k.news.filter((x) => !x.seen && x.k !== 'arrive') : []; }
export function seen(G) { const k = ensure(G); if (k) for (const x of k.news) if (x.k !== 'arrive') x.seen = true; }

/** BUILD's shortage chip ("⚓ צור: 80 ארז ב־15 כסף"): the open offer that brings `res` now — one that covers `need` first,
 *  then the soonest. null when no court can help now (busy, locked, no silver, Shabbat). */
export function bestFor(G, res, need = 0, now = Date.now(), opts = {}) {
  let best = null;
  for (const p of PARTNERS) for (const x of offers(G, p.id, now, opts)) {
    if (!x.ok || !x.gives[res]) continue;
    const r = [x.gives[res] < need, x.ms];
    if (!best || r[0] < best.r[0] || (r[0] === best.r[0] && r[1] < best.r[1])) best = { ...x, r };
  }
  return best;
}
