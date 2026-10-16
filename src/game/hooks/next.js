/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/next.js: "what's next?" (HOOKS agent, docs/HOOKS.md §5). Pure functions over the save G and `now`: no DOM.
 *
 *   appointments(G, now)   every timer that will bring something: caravans, trainee priests, crews reaching a phase
 *                          boundary or finishing a site, sorted by time (the appointment strip, the rest card)
 *   blockedInfo(G, id, now) what a site waits for, and whether it is already on its way (the goal pill's ETA)
 *   goalNote(G, r, now)    one short line that makes a blocked or waiting goal actionable ("מגיע בעוד 4:12",
 *                          "שלח משלחת", "חצוב במחצבה")
 *   restState(G, now)      is this a natural stopping point? (nothing to build, nothing to collect or start)
 *   chapterLadder(G)       the current chapter with endowed progress (sites in progress count partly)
 *   opensAfter(G, id)      what completing a site opens (the next-unlock preview)
 *   hintFor(G, now)        a just-in-time hint: a material the goal needs that nobody is bringing
 * Design notes: an open loop the player can see (a timer, a half-built wall) is what brings people back
 * (Ovsiankina: interrupted tasks are resumed ~67% of the time, Ghibellini & Meier 2025), and a goal that shows
 * its road is what keeps them going (goal gradient, Kivetz et al. 2006). Nothing here punishes an absence.
 * ──────────────────────────────────────────────────────────────────────────── */
import { STAGES, stageById, ROUTES, RIDX, CHAPTERS, PHASE_AT, RES, DECKS } from '../content.js';   // ── flow16 ── (DECKS: the course loop's sites) ── /flow16 ──
import * as S from '../state.js';

const routeFor = (res) => ROUTES.find((R) => R.res === res) || null;

/* (wave 7) BUILD7's state v6 tells when the crews set their next stone (S.crewEta, ms | null); read by name, so a tree
 * without it keeps the v5 phase clock below */
const SX = { ...S };   // a copy, so a tree without crewEta builds without a warning
const crewEta = (G, id, now) => { try { const f = SX.crewEta; const ms = typeof f === 'function' ? f(G, id, now) : null; return typeof ms === 'number' && ms >= 0 && ms < 864e5 ? ms : null; } catch (e) { return null; } };

/** Every appointment, soonest first: {kind: 'caravan'|'priest'|'stone'|'phase'|'finish', id?, res?, n?, at, ms, back?}
 *  'stone' = the crews at a site set their next stone in ms (wave 7, with BUILD7's S.crewEta) */
export function appointments(G, now) {
  const out = [];
  for (const c of G.car || []) {
    const R = ROUTES[RIDX[c.r]]; if (!R) continue;
    out.push({ kind: 'caravan', id: c.r, res: R.res, n: c.y, at: c.t1, ms: Math.max(0, c.t1 - now), back: now >= c.t1 });
  }
  for (const t of G.train || []) out.push({ kind: 'priest', at: t.t1, ms: Math.max(0, t.t1 - now) });
  for (const id of S.buildingSites(G)) {
    if (typeof SX.crewEta === 'function') {             // state v6 (BUILD7): the crews' next stone, or no chip (the v5 phase clock means nothing there)
      const eta = S.crewsAt(G, id) ? crewEta(G, id, now) : null;
      if (eta != null) out.push({ kind: 'stone', id, at: now + eta, ms: eta });
      continue;
    }
    const n = S.crewsAt(G, id);
    if (!n || S.blockOf(G, id)) continue;
    const d = stageById(id), s = G.st[id];
    const cap = d.W * (s.ph >= 3 ? 1 : PHASE_AT[s.ph]);
    const left = cap - s.w;
    if (!(left > 0)) continue;
    const boost = G.vol && G.vol.id === id && G.vol.until > now ? 2 : 1;
    const ms = S.gmMs(G, left / (d.crew * n * boost));
    out.push({ kind: s.ph >= 3 ? 'finish' : 'phase', id, phase: s.ph, at: now + ms, ms });
  }
  out.sort((a, b) => a.ms - b.ms);
  return out;
}

/** What a building site waits for: {id, items: [{res, n, eta (ms|null), covered, route, canSend, quarry}]} | null */
export function blockedInfo(G, id, now) {
  const b = S.blockOf(G, id);
  if (!b || !b.lack) return null;
  const items = Object.entries(b.lack).map(([res, n]) => {
    // the caravans already bringing this material, soonest first: the first one whose running total covers the need
    const coming = G.car.filter((c) => ROUTES[RIDX[c.r]] && ROUTES[RIDX[c.r]].res === res).sort((a, b) => a.t1 - b.t1);
    let sum = 0, eta = null, covered = false;
    for (const c of coming) { sum += c.y; if (sum >= n) { eta = Math.max(0, c.t1 - now); covered = true; break; } }
    if (!covered && coming.length) eta = Math.max(0, coming[coming.length - 1].t1 - now);
    const R = routeFor(res);
    const canSend = !!R && S.routeOpen(G, R.id) && S.carFree(G) > 0 && !G.car.some((c) => c.r === R.id);
    return { res, n, eta, covered, coming: coming.length, route: R ? R.id : null, canSend, quarry: res === 'stone' && S.isDone(G, 'har') };
  });
  return { id, items };
}

const clock = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};
export const fmtClock = clock;
const LRI = '⁦', PDI = '⁩';

/**
 * One short line for the goal pill when the goal waits (r = S.recommend(G)): {text, action}
 * action: 'caravans' (send one) | 'quarry' | 'wait' | 'crews' (train priests) | null
 */
export function goalNote(G, r, now) {
  if (!r) return null;
  if (r.kind === 'blocked' && r.id) {
    const info = blockedInfo(G, r.id, now);
    if (!info) return null;
    // the material that will take the longest decides what the pill says
    const it = info.items.slice().sort((a, b) => (b.covered ? b.eta : Infinity) - (a.covered ? a.eta : Infinity))[0];
    if (it.covered && it.eta <= 0) return { text: 'המשלחת חזרה: אסוף אותה', action: 'caravans', eta: 0, res: it.res };
    // a material that arrives within two minutes: just count down; otherwise a site that can start now comes first
    // (the fork in the road: the recommended site waits, another one can be begun in parallel)
    if (it.covered && it.eta <= 2 * 60000) return { text: `מגיע בעוד ${LRI}${clock(it.eta)}${PDI}`, action: 'caravans', eta: it.eta, res: it.res };
    const alt = startable(G);
    if (alt && !(it.canSend && !it.coming)) return { text: `בינתיים אפשר להתחיל: ${stageById(alt).n}`, action: 'start', id: alt };
    if (it.covered) return { text: `מגיע בעוד ${LRI}${clock(it.eta)}${PDI}`, action: 'caravans', eta: it.eta, res: it.res };
    if (it.canSend) return { text: 'שלח משלחת', action: 'caravans', res: it.res };
    if (it.quarry) return { text: 'אפשר לחצוב במחצבה', action: 'quarry', res: it.res };
    if (it.coming) return { text: `עוד משלחת בדרך · ${LRI}${clock(it.eta)}${PDI}`, action: 'caravans', eta: it.eta, res: it.res };
    // the route is open but every caravan slot is out: say when one comes back
    if (S.carFree(G) <= 0 && G.car.length) {
      const free = Math.max(0, Math.min(...G.car.map((c) => c.t1)) - now);
      return { text: free > 0 ? `כל המשלחות בדרך · אחת חוזרת בעוד ${LRI}${clock(free)}${PDI}` : 'משלחת חזרה: אסוף ושלח', action: 'caravans', eta: free, res: it.res };
    }
    return { text: 'ממתין למשלחת', action: 'caravans', res: it.res };
  }
  if (r.kind === 'priests') {
    const t = G.train.slice().sort((a, b) => a.t1 - b.t1)[0];
    if (t) return { text: `כהן הבא בעוד ${LRI}${clock(t.t1 - now)}${PDI}`, action: 'crews', eta: Math.max(0, t.t1 - now) };
    return { text: G.trainOn ? 'הכשר כהנים' : '', action: 'crews' };
  }
  return null;
}

/** An available site whose foundations can be paid now (and whose priests are there), in the graph's order. */
export function startable(G) {
  const s = STAGES.find((x) => S.statusOf(G, x.id) === 'avail' && x.priests <= G.priests && S.canAfford(G.res, x.cost[0]));
  return s ? s.id : null;
}

/** A natural stopping point: nothing to strike, collect, play or start right now. → {idle, appts, blocked, unread} */
export function restState(G, now) {
  const r = S.recommend(G);
  // ── flow16 ── the balance: in a course's loop his hands never wait for the stock (jobs.js freeHands) — the deal is always there, so
  // an empty stock is no "natural stopping point" (the rest card said "האתר עובד בשבילך" over a kohen who could work)
  const hands = G.ftue >= 99 && S.buildingSites(G).some((id) => { const st = G.st[id]; return !!(st && st.p === 'courses' && !st.ready && !st.done && DECKS[id]); });
  // ── /flow16 ──
  const busy = hands || r.kind === 'build' || r.kind === 'moment' || r.kind === 'start' || r.kind === 'done' || !!startable(G);
  const back = S.carsBack(G, now) > 0;
  const blocked = S.buildingSites(G).map((id) => blockedInfo(G, id, now)).filter(Boolean);
  const unread = Object.keys(G.book.un).filter((k) => !G.book.read[k]).length;
  const canSendNeeded = blocked.some((b) => b.items.some((it) => !it.covered && it.canSend));
  return { idle: !busy && !back && !canSendNeeded, rec: r, appts: appointments(G, now), blocked, unread, canSendNeeded };
}

/** The chapter now, with endowed progress: done sites count 1, sites in progress count their fraction. */
export function chapterLadder(G) {
  const ch = CHAPTERS.find((c) => c.id === S.chapterOf(G));
  if (!ch) return null;
  const done = ch.stages.filter((id) => S.isDone(G, id)).length;
  const part = ch.stages.reduce((a, id) => a + S.progressOf(G, id), 0);
  return { id: ch.id, n: ch.n, done, total: ch.stages.length, frac: part / ch.stages.length };
}

/** Sites that open once `id` is done (every other dependency already done). */
export function opensAfter(G, id) {
  return STAGES.filter((s) => s.deps.includes(id) && s.deps.every((d) => d === id || S.isDone(G, d))).map((s) => s.id);
}

/**
 * A just-in-time hint for the first time the goal waits for a material that nobody is bringing:
 * → {key, res, route, text} | null. (The hint names the route; the coach points at the caravans tab.)
 */
export function hintFor(G, now) {
  const r = S.recommend(G);
  if (r.kind !== 'blocked' || !r.id) return null;
  const info = blockedInfo(G, r.id, now);
  if (!info) return null;
  const it = info.items.find((x) => !x.covered && !x.coming && x.canSend);
  if (!it) return null;
  const key = 'hint_' + it.res;
  if (G.story && G.story[key]) return null;
  const R = ROUTES[RIDX[it.route]];
  const first = R.ftue && !G.carCount[R.id];
  return { key, res: it.res, route: R.id, text: `${stageById(r.id).n}: חסר ${RES[it.res].n}. שלח את המשלחת "${R.n}"${first ? ' (הפעם הראשונה קצרה)' : ''}` };
}

/** The appointments worth a line of text (the rest card, the end of the tutorial). `clk`: the clock's text in its place
 *  (flow8: apptHTML passes a marker for the live element) */
export function apptLine(a, G, clk) {
  const t = clk != null ? clk : `${LRI}${clock(a.ms)}${PDI}`;
  if (a.kind === 'caravan') { const R = ROUTES[RIDX[a.id]]; return a.back ? `${R.n}: חזרה ומחכה לאיסוף` : `${R.n}: חוזרת בעוד ${t} (${LRI}+${a.n}${PDI} ${RES[R.res].n})`; }
  if (a.kind === 'priest') return `כהן מסיים את ההכשרה בעוד ${t}`;
  const d = stageById(a.id);
  if (a.kind === 'stone') return `${d.n}: הצוות מניח את האבן הבאה בעוד ${t}`;
  if (a.kind === 'finish') return `${d.n}: הצוות יסיים בעוד ${t}`;
  const next = stageById(a.id).cost[G.st[a.id].ph] || {};
  const need = Object.keys(next).length ? ` (ואז צריך ${Object.entries(next).map(([k, v]) => `${LRI}${v}${PDI} ${RES[k].n}`).join(', ')})` : '';
  return `${d.n}: הצוות יגיע לשלב הבא בעוד ${t}${need}`;
}

/** ── flow8 ── (the owner, 28.9: "בעוד 0:02 לא סופר אחורה") the same line as HTML whose clock ticks: a `.gm-live` element
 *  that the HUD's tick re-reads every second (ui.js tick → hooks.liveMs(key)); `esc` escapes the text around it */
const MARK = '\u0001';
export const liveKey = (a) => `${a.kind}:${a.id || ''}`;
export const liveClock = (a) => `<b class="gm-live" dir="ltr" data-until="${Math.round(a.at)}" data-live="${liveKey(a)}">${clock(a.ms)}</b>`;
export function apptHTML(a, G, esc) { return esc(apptLine(a, G, MARK)).replace(MARK, liveClock(a)); }
/** ms until the appointment `key` (liveKey) now, or null when it is gone (the stone set, the crew moved) */
export function liveMs(G, key, now) { const a = appointments(G, now).find((x) => liveKey(x) === key); return a ? (a.back ? 0 : a.ms) : null; }

/** Stone the open and building sites still need beyond the stock (0: quarrying now adds nothing the goal needs). */
export function stoneNeeded(G) {
  let need = 0;
  for (const s of STAGES) {
    const st = S.statusOf(G, s.id);
    if (st !== 'avail' && st !== 'building') continue;
    const from = st === 'building' ? G.st[s.id].ph : 0;
    for (let k = from; k < 3; k++) need += s.cost[k].stone || 0;
  }
  return Math.max(0, need - (G.res.stone || 0));
}

/* ── round 3: crews that wait (the world still shows them at work) ──
 * The playtest (docs/PLAYTEST.md round 3): a first-timer's crews spent 65% of their in-session time, and all of the night,
 * at a site that waited for cedar or white stone; a crew there does nothing, while the quarry or another site could use it. */
/** crews at a building site that waits for a material: [{i, at, lack: {res: n}}] */
export function idleCrews(G) {
  const out = [];
  (G.crews || []).forEach((c, i) => {
    if (!c.at || c.at === 'quarry') return;
    const b = S.blockOf(G, c.at);
    if (b && b.lack) out.push({ i, at: c.at, lack: b.lack });
  });
  return out;
}
/** where an idle crew is useful now: a site that can take work (the fewest crews first), else the quarry, else null */
export function crewTarget(G) {
  const work = S.buildingSites(G).filter((id) => !S.blockOf(G, id)).sort((a, b) => S.crewsAt(G, a) - S.crewsAt(G, b));
  if (work.length) return work[0];
  return S.isDone(G, 'har') ? 'quarry' : null;
}
/** caravans whose timer ended in (from, to]: the moment a train reaches its bay in the world → [{k, r, res, n}] */
export function arrivals(G, from, to) {
  const out = [];
  (G.car || []).forEach((c, k) => { if (c.t1 > from && c.t1 <= to) { const R = ROUTES[RIDX[c.r]]; if (R) out.push({ k, r: c.r, res: R.res, n: c.y, name: R.n }); } });
  return out;
}
