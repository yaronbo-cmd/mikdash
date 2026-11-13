/* ── build 113 ── h113/model.js — stage 04 "שערי העזרה" in the old world (spec: Claude Doc "איפיון שלב 04 בעולם הישן: שערי העזרה",
 * rev 24, approved by the owner 9.11 10:56: "מאושר. בנה."). Pure: no three.js, no DOM. The plan (15 missions: five stations × three
 * levels, one north gate per level), the gates' places, the measures and thresholds of the spec's table, the precision that runs on
 * from station to station (a socket too deep lowers the leaf, a socket off its place leans it or leaves a gap at the lock), the save.
 *
 *   const M = createH113(save?) → the face of stage 01's model (h109/model.js) for the director:
 *     M.st · M.mission() · M.done(res) · M.finished() · M.levelOf(m) · M.progress() · M.streak(n)
 *   plus M.shown(m) (the crews' share of the gatehouses) · M.unitEnd(m) (a gate locked) · M.gatesDone() (the "שערים 0/6")
 *
 * The openings (stage 02, h111): ten amot wide, from the Chel's terrace (6) to twenty amot up (26), Middot 2:3. The kohen's three are
 * the north ones (spec, open question 1): שער הניצוץ (x −38) and שער הקרבן (x −95) in their gatehouses (stages.js 'gates': the doors at
 * the gatehouse's outer face, z −78), and בית המוקד (x −160), whose house is the chambers' stage: its gate stands at the wall's outer
 * face for now. The south three rise in the crews' hands meanwhile. Amot throughout: an amah = 6 tefachim = 24 fingers.
 */

export const H113 = Object.freeze({
  FINGER: 1 / 24, TEFACH: 1 / 6,
  OPEN_W: 10, OPEN_H: 20, FLOOR: 6, TOP: 26,
  JAMB_W: 2, DEPTH: 2.5,               // a jamb pier: two amot wide beside the opening, as deep as the frame
  LINTEL_L: 14, LINTEL_H: 2.5,         // the lintel: fourteen long (two amot on each jamb), two and a half high and deep
  LEAF_W: 5, LEAF_H: 19.55, LEAF_T: 0.42, PIN: 0.4, PIN_B: 0.16, SILL: 6.12,   // a leaf: half the opening; its upper pin 0.4 above it (it must tilt 6° to pass under the lintel), the lower 0.16 below
  SOCKET_D: 3 / 24,                    // the socket's depth: three fingers (spec 1)
  BAR_L: 7,                            // the bar: seven amot of cedar (spec 5)
});
const F = H113.FINGER;

/** the kohen's gates, one per level (spec "המסלול בעולם"); s: the inward direction along z (north: +1); zf: the frame's outer face */
export const GATES = Object.freeze({
  1: Object.freeze({ key: 'nitzotz', name: 'שער הניצוץ', c: -38, zf: -78, s: 1, house: 1, yard: 1 }),
  2: Object.freeze({ key: 'korban', name: 'שער הקרבן', c: -95, zf: -78, s: 1, house: 1, yard: 1 }),
  3: Object.freeze({ key: 'moked', name: 'שער בית המוקד', c: -160, zf: -76, s: 1, house: 0, yard: 1 }),
});
/** the south three: the crews' (spec "המסלול בעולם"); each done as one of the kohen's is locked */
export const SOUTH = Object.freeze([
  Object.freeze({ key: 'mayim', name: 'שער המים', c: -38, zf: 78, s: -1, word: 'צלוחית המים בחג' }),
  Object.freeze({ key: 'bechorot', name: 'שער הבכורות', c: -118, zf: 78, s: -1, word: '' }),
  Object.freeze({ key: 'delek', name: 'שער הדלק', c: -160, zf: 78, s: -1, word: 'עצים למערכה' }),
]);
/** the carpenters' yard (spec: "חצר הנגרים על החיל"): on the Chel between the gatehouses of the two first gates, the leaf along x */
export const YARD = Object.freeze({ x0: -84.4, x1: -64.4, z: -80.2, top: 7.55, post: -77.6, rack: [-62.6, -47.8], wall: -73.95 });

/* ───────── the spec's table ("מידות וספים") ───────── */
export const LV = Object.freeze({
  1: Object.freeze({ depthTol: 1, tests40: 2, smoke: 3, rateLo: 1, rateHi: 2, tiltOk: 3, slip: 9, sway: 1 / 3, chipV: 1.5, leafTilt: [6, 9], leafDrop: 14, pinTol: 2, window: Infinity, rings: 2, block: 1, pins: 2, keys: 1 }),
  2: Object.freeze({ depthTol: 0.5, tests40: 1, smoke: 2.8, rateLo: 1, rateHi: 2, tiltOk: 2, slip: 7, sway: 1 / 4, chipV: 1.3, leafTilt: [6, 9], leafDrop: 13, pinTol: 1.5, window: 12, rings: 4, block: 1, pins: 3, keys: 2 }),
  3: Object.freeze({ depthTol: 0.5, tests40: 1, smoke: 2.5, rateLo: 1, rateHi: 2, tiltOk: 1.5, slip: 6, sway: 1 / 4, chipV: 1.1, leafTilt: [6, 8], leafDrop: 12, pinTol: 1.5, window: 8, rings: 4, block: 0.5, pins: 4, keys: 3, thin: 3, pishTol: 0.25, pishPin: 0.5 }),
});

/** the sockets each level's kohen drills (spec 1): L1 the two lower; L2 one lower and one upper (the lintel on the ground, by the
 *  template plank); L3 one lower beside a flint knot (its mirror on the other side the crews drill where he marks), and the two of the
 *  wicket (pishpesh) with the thin drill */
export const SOCKETS = Object.freeze({
  1: Object.freeze([{ id: 'L', side: -1, where: 'sill' }, { id: 'R', side: 1, where: 'sill' }]),
  2: Object.freeze([{ id: 'L', side: -1, where: 'sill' }, { id: 'U', side: -1, where: 'lintel', template: 1 }]),
  3: Object.freeze([{ id: 'L', side: -1, where: 'sill', flint: 1 }, { id: 'M', side: 1, where: 'sill', mirror: 1 }, { id: 'P1', side: -1, where: 'pish', thin: 1 }, { id: 'P2', side: -1, where: 'pish', thin: 1 }]),
});
/** a socket's place: one tefach in from the jamb (the pin's head, its gauge); x along the sill, d into the frame's depth from its face */
export function socketAt(lv, side) { const G = GATES[lv]; return { x: G.c + side * (H113.OPEN_W / 2 - H113.TEFACH), d: H113.DEPTH / 2 }; }

/** the leaf's planks (spec 3): widths (amot), knot (a hidden flaw: it splits at the first peg), hole (the wicket's plank), the pile's
 *  order; each level's way: chalked widths (L1), by eye against amah marks (L2), the wicket's plank (L3) */
export const PILES = Object.freeze({
  1: Object.freeze([{ w: 3 }, { w: 2 }, { w: 1.5 }, { w: 1 }]),
  // (two ways exactly, one through the knotted plank: 2½ + 2½, or 1 + 1 + 1 + 2)
  2: Object.freeze([{ w: 2.5 }, { w: 1 }, { w: 2 }, { w: 1 }, { w: 2.5, knot: 1 }, { w: 1 }]),
  3: Object.freeze([{ w: 1.5 }, { w: 2, hole: 1 }, { w: 2.5 }, { w: 1 }, { w: 3 }, { w: 1.5 }]),
});
export const PISH_PILE = Object.freeze([{ w: 0.75 }, { w: 0.5 }, { w: 0.5 }, { w: 0.25 }]);
export const PISH = Object.freeze({ w: 1, h: 1.6, x0: 0.25 });   // the wicket in the leaf: one amah wide, from a quarter amah off the floor
/** a sum of widths that closes the leaf: exactly five (spec 3: "סכום לא מדויק אי אפשר לקבע") */
export const leafClosed = (ws) => Math.abs(ws.reduce((a, w) => a + w, 0) - H113.LEAF_W) < 1e-6;
/** every way the pile closes the leaf (the puzzle has more than one: rule 30) */
export function solutions(lv) {
  const P = PILES[lv], out = [];
  for (let mask = 1; mask < 1 << P.length; mask++) {
    const ix = P.map((_, i) => i).filter((i) => mask & (1 << i)), ws = ix.map((i) => P[i].w);
    if (!leafClosed(ws)) continue;
    if (lv === 3 && !ix.some((i) => P[i].hole)) continue;   // (the wicket's leaf: its plank is in it)
    out.push(ix);
  }
  return out;
}

/* ───────── the precision that runs on (spec "הדיוק מצטבר") ───────── */
const sockOf = (st, lv, id) => { const S = st.sock && st.sock[lv]; return S && S.list ? S.list.find((s) => s.id === id) || null : null; };
/**
 * what the kohen's leaf inherits at its hanging and its lock (fingers): low (its socket too deep: it sits low and scrapes the sill),
 * lean (its upper socket not over the lower: a strip of light at its side), wobble (an oval socket: the head walked), gap (between the
 * two leaves when closed: + a gap, − they jam; the socket's place, the leaf's planks, the hanging's own error)
 */
export function inherit(st, lv) {
  const o = { low: 0, lean: 0, wobble: 0, gap: 0 };
  const L = sockOf(st, lv, 'L');
  if (L) { if (L.deep) o.low = Math.max(0, L.dd); if (L.walked) o.wobble = 1; }
  if (lv === 1) {
    const R = sockOf(st, lv, 'R');
    o.lean = L ? L.ex / F : 0;
    o.gap -= ((L ? L.ex : 0) + (R ? R.ex : 0)) / F;
  } else if (lv === 2) {
    const U = sockOf(st, lv, 'U');
    o.lean = ((L ? L.ex : 0) - (U ? U.ex : 0)) / F;
    o.gap -= (L ? L.ex : 0) / F;
  } else {
    const M2 = sockOf(st, lv, 'M');
    // (the flint: both sockets set back by the same shift, mirrored; the difference is a step where the leaves meet)
    o.gap += Math.abs(((L ? L.shift || 0 : 0) - (M2 ? M2.shift || 0 : 0))) / F;
    o.lean = L ? L.ex / F : 0;
  }
  const Lf = st.leaf && st.leaf[lv];
  if (Lf && Lf.gap) o.gap += Lf.gap;
  const Hg = st.hang && st.hang[lv];
  if (Hg && Hg.gap) o.gap += Hg.gap;
  for (const k of ['low', 'lean', 'gap']) o[k] = +o[k].toFixed(2);
  return o;
}
/** the gap the shims must close at the lock (spec 5): the leaves' meeting, rounded to whole fingers; 0 when it is within half a finger */
export function lockGap(st, lv) { const g = inherit(st, lv).gap; return Math.abs(g) < 0.5 ? 0 : Math.round(g); }
/** the ring that is not in line (spec 5: L1 none unless the leaf leans; L2–3 one, its block a finger / half a finger) */
export function ringOff(st, lv) {
  const I = inherit(st, lv), L = LV[lv];
  if (lv === 1) return Math.abs(I.lean) >= 1 ? { ring: 1, by: Math.sign(I.lean) || 1 } : null;
  return { ring: lv === 2 ? 2 : 1, by: I.lean ? Math.sign(I.lean) : 1, block: L.block };
}
/** the key board's pegs (spec 5): the lock's pins (positions along the bar, as fractions of its slot) and each key on the chain */
export function lockOf(lv) {
  const L = LV[lv], pins = [0.2, 0.42, 0.64, 0.86].slice(0, L.pins);
  const keys = [];
  // the right key: a peg under every pin; L2 the first on the chain lacks its middle peg; L3 one lacks a peg, one is the wicket's
  if (lv === 1) keys.push({ pegs: pins.slice(), ok: 1 });
  if (lv === 2) { keys.push({ pegs: [pins[0], pins[2]], ok: 0, miss: 1 }); keys.push({ pegs: pins.slice(), ok: 1 }); }
  if (lv === 3) { keys.push({ pegs: [pins[0], pins[1], pins[3]], ok: 0, miss: 2 }); keys.push({ pegs: pins.slice(), ok: 1, long: 1 }); keys.push({ pegs: [0.3, 0.7], ok: 0, pish: 1 }); }
  return { pins, keys };
}

/* ───────── the plan ───────── */
const MISSIONS = () => {
  const L = [];
  for (const lv of [1, 2, 3]) for (const k of ['socket', 'lintel', 'leaf', 'hang', 'lock']) L.push({ k, id: `${k}${lv}`, lv });
  return L;
};
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['socket', 'lintel', 'leaf', 'hang', 'lock']);
const WEIGHT = { socket: 2, lintel: 2, leaf: 2, hang: 2, lock: 2 };
const TOTAL = PLAN.reduce((a, m) => a + WEIGHT[m.k], 0);

/* ───────── the save ───────── */
export function freshH113() {
  return { v: 1, i: 0, done: [], res: {}, best: 0, plays: {}, form: {}, sock: {}, lintel: {}, leaf: {}, hang: {}, lock: {}, gold: {}, intro: 0, gilders: 0, watch: 0 };
}
export function createH113(save) {
  const st = save && save.v === 1 ? save : freshH113();
  for (const [k, v] of Object.entries(freshH113())) if (st[k] === undefined) st[k] = v;
  const M = {
    st,
    get plan() { return PLAN; },
    mission() { return st.i < PLAN.length ? PLAN[st.i] : null; },
    finished() { return st.i >= PLAN.length; },
    levelOf(m) { const n = (st.plays[m.id] | 0); return Math.min(3, (m.lv | 0) + (n > 0 ? 1 : 0)); },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost, ...((res.loss | 0) > 0 ? { loss: res.loss | 0 } : {}) };   // (build 125: the points its damage cost, when it cost any)
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      st.done.push(m.id); st.i++;
      // a mission passed without being played (a minigame's own page skips to it; tests) leaves the gate as the crews would have
      const lv = m.lv;
      st.form[lv] = 1;
      if (m.k === 'socket' && !(st.sock[lv] && st.sock[lv].done)) st.sock[lv] = { done: 1, list: SOCKETS[lv].map((s) => ({ id: s.id, ex: 0, dd: 0, shift: s.flint || s.mirror ? 0.07 : 0 })) };
      if (m.k === 'lintel' && !(st.lintel[lv] && st.lintel[lv].done)) st.lintel[lv] = { done: 1, tilt: 0 };
      if (m.k === 'leaf' && !(st.leaf[lv] && st.leaf[lv].done)) st.leaf[lv] = { done: 1, gap: 0, planks: (solutions(lv).find((ix) => !ix.some((i) => PILES[lv][i].knot)) || solutions(lv)[0]).map((i) => PILES[lv][i].w) };
      if (m.k === 'hang' && !(st.hang[lv] && st.hang[lv].done)) st.hang[lv] = { done: 1, gap: 0 };
      if (m.k === 'lock' && !(st.lock[lv] && st.lock[lv].done)) st.lock[lv] = { done: 1 };
      return M.mission();
    },
    progress() { let w = 0; for (const id of st.done) { const m = PLAN.find((x) => x.id === id); if (m) w += WEIGHT[m.k]; } return Math.min(1, w / TOTAL); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
    /** the crews' gatehouses while mission m is open: low (under the lintels) through the first two gates, then up to the top */
    shown(m) { if (!m) return 1; const n = m.n; return n < 10 ? 0.08 + (0.36 * n) / 9 : Math.min(0.96, 0.44 + (0.52 * (n - 9)) / 5); },
    /** the gates closed (spec: "יעד שערים 0/6"): the kohen's locked and as many of the south three, which the crews finish with his */
    gatesDone() { let n = 0; for (const lv of [1, 2, 3]) if (st.lock[lv] && st.lock[lv].done) n += 2; return n; },
    /** a gate closes with its lock: the level is whole */
    unitEnd(m) {
      if (m.k !== 'lock') return null;
      const ids = KINDS.map((k) => `${k}${m.lv}`), r = ids.map((id) => st.res[id]).filter(Boolean);
      if (r.length < 5) return null;
      const all3 = r.every((x) => x.stars >= 3);
      return { title: `${GATES[m.lv].name} נעול`, sub: all3 ? 'מהודר' : 'כשר', bonus: `${GATES[m.lv].name} · ${all3 ? 'מהודר' : 'כשר'}` };
    },
  };
  return M;
}
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
/** points by the spec's rule: 40 clean, 20 (a mistake without damage, a wrong key), 10 (the crew fixed it: lead, wedges, a strip) */
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
