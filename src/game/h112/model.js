/* ── build 112 ── h112/model.js — stage 03 "הסורג והחיל" in the old world (spec: Claude Doc "איפיון שלב 03 בעולם הישן", approved by the
 * owner 8.11 20:53, "תעדכן את המסמך… ובצע"). Pure: no three.js, no DOM. The plan (15 missions: five stations × three levels), where each
 * opens on the soreg's east side, the kohen's posts and bays on each run, the drift of his posts that the ring's closing bay inherits,
 * the steps of the east axis, the save.
 *
 *   const M = createH112(save?) → the face of stage 01's model (h109/model.js) for the director:
 *     M.st · M.mission() · M.done(res) · M.finished() · M.levelOf(m) · M.progress() · M.streak(n)
 *   plus M.shown(m) → the share of the crews' ring the world shows while mission m is open · M.unitEnd(m) · M.slabsLaid() (the 13)
 *
 * The soreg in the old world (temple.js 43–55): a lattice 10 tefachim high (Middot 2:3) on the line x = 165 (east), z = ±91.5 (north,
 * south), its entrance in the east z −8…8; inside it the Chel, 10 amot (to the wall at x 147) and its 12 steps of half an amah
 * (the podium x ≤ 157, top 6; 11 treads to x 162.5). The kohen works on the east side (spec "המסלול בעולם"); the crews build the rest.
 * Amot throughout (an amah = 24 fingers).
 */

import { BOOK } from '../world/grid.js';

export const H112 = Object.freeze({
  BAY: 3,             // a bay: post centre to post centre (amot)
  POST_W: 0.44, POST_H: 1.87,          // a post (temple.js 46: 0.44 square, the lattice's 1.67 and its rail)
  TALL_W: 1.45, TALL_H: 2.7,           // a tall post: a frame with a groove for the warning slab
  GROOVE: 0.08, SILL: 0.12, SLAB_H: 1.55, SLAB_T: 0.16,
  WARN_W: 0.95, WARN_H: 1.2, WARN_T: 0.2,
  STEP: 0.5,          // a step: half an amah high, half an amah deep (Middot 2:3)
  FLIGHT: [-4, 4],    // the kohen's flight across the east axis (z)
  FINGERS: 24,
  TEXT: ['NO', 'STRANGER', 'MAY ENTER'],   // the slab's text in the game: English (the owner's decision, 8.11); the real one is Greek
});

/** the soreg's lines: their outward normal */
export const LINE = Object.freeze({ E: [1, 0], N: [0, -1], S: [0, 1] });
const P = (x, z, o = {}) => Object.freeze({ x, z, ...o });
// ── build 126 ── (rule 65) the posts' places, the sightings' eyes, the openings and the flight are the book's (world/grid.js BOOK.s03);
// this file keeps who sets each post, the tall ones, the bays and the rules
const B3 = BOOK.s03;
const BP = (lv, i, o) => { const [x, z] = B3.runs[lv].posts[i]; return P(x, z, o); };
/**
 * the three runs (spec "המסלול בעולם"): the posts in order along the run, who sets each (crew | k: the kohen), the tall ones (a frame
 * for a warning slab; warn: one is already set there by the crews), the line each is on; the kohen's bays (slabs), the order he lays
 * them, the closing bay (his last post to the crews' next), the sightings (from the camera's end, the near true posts first).
 */
export const RUNS = Object.freeze({
  1: {
    where: 'המזרח, צפונית לכניסה',
    posts: [BP(1, 0, { crew: 1, line: 'E', site: 1 }), BP(1, 1, { crew: 1, line: 'E' }), BP(1, 2, { crew: 1, line: 'E', tall: 1, warn: 1 }), BP(1, 3, { crew: 1, line: 'E' }),
      BP(1, 4, { crew: 1, line: 'E' }), BP(1, 5, { k: 1, line: 'E', tall: 1 }), BP(1, 6, { k: 1, line: 'E' }), BP(1, 7, { k: 1, line: 'E' }), BP(1, 8, { crew: 1, line: 'E', site: 1 })],
    c0: 4, kposts: [5, 6, 7], bays: [[4, 5], [5, 6], [6, 7]], order: [0, 1, 2], close: [7, 8], warnAt: 5, warnFrom: 2, every: 3,
    crewBays: [[0, 1], [1, 2], [2, 3], [3, 4]],
    sight: [{ posts: [5, 6, 7], eye: B3.runs[1].eye, dir: B3.runs[1].dir, near: B3.runs[1].near, far: 8, axis: 'x' }],
    hole: B3.holes[1],
    pattern: 'diag',
  },
  2: {
    where: 'הפינה הצפונית-מזרחית',
    posts: [BP(2, 0, { crew: 1, line: 'N', tall: 1, warn: 1, site: 1 }), BP(2, 1, { crew: 1, line: 'E', corner: 1 }), BP(2, 2, { crew: 1, line: 'E' }),
      BP(2, 3, { k: 1, line: 'E' }), BP(2, 4, { k: 1, line: 'E', tall: 1 }), BP(2, 5, { k: 1, line: 'E', tall: 1 }), BP(2, 6, { k: 1, line: 'E' }),
      BP(2, 7, { crew: 1, line: 'E' }), BP(2, 8, { crew: 1, line: 'E', site: 1 })],
    c0: 2, kposts: [3, 4, 5, 6], bays: [[2, 3], [3, 4], [4, 5], [5, 6]], order: [0, 1, 2, 3], close: [6, 7], warnAt: 4, warnFrom: 0, every: 4,
    crewBays: [[0, 1], [1, 2], [7, 8]],
    sight: [{ posts: [3, 4, 5, 6], eye: B3.runs[2].eye, dir: B3.runs[2].dir, near: B3.runs[2].near, far: 7, axis: 'x' }],
    hole: B3.holes[2],
    pattern: 'ring',
  },
  3: {
    where: 'המזרח, דרומית לכניסה, עד הפינה',
    posts: [BP(3, 0, { crew: 1, line: 'E', site: 1 }), BP(3, 1, { crew: 1, line: 'E' }), BP(3, 2, { crew: 1, line: 'E', tall: 1, warn: 1 }), BP(3, 3, { crew: 1, line: 'E' }),
      BP(3, 4, { crew: 1, line: 'E' }), BP(3, 5, { k: 1, line: 'E', tall: 1 }), BP(3, 6, { k: 1, line: 'E', tall: 1 }), BP(3, 7, { k: 1, line: 'E', corner: 1 }),
      BP(3, 8, { crew: 1, line: 'S' }), BP(3, 9, { crew: 1, line: 'S' }), BP(3, 10, { crew: 1, line: 'S', site: 1 })],
    c0: 4, kposts: [5, 6, 7], bays: [[4, 5], [5, 6], [6, 7]], order: [0, 2, 1], close: [7, 8], warnAt: 6, warnFrom: 2, every: 4,
    crewBays: [[0, 1], [1, 2], [2, 3], [3, 4], [8, 9], [9, 10]],
    // the row turns the corner (spec 1, level 3): along the east line first, then from the south line's far end, the corner post again
    sight: [{ posts: [5, 6, 7], eye: B3.runs[3].eye, dir: B3.runs[3].dir, near: B3.runs[3].near, far: -1, axis: 'x' }, { posts: [7], eye: B3.eye2[3], dir: [1, 0], near: 10, far: 8, axis: 'z' }],
    hole: B3.holes[3],
    pattern: 'ring',
    wind: 1,
  },
});
/** the steps' place (the east axis, behind the entrance; spec 4 and open question 5): the kohen's flight of twelve */
// (x0: the flight is keyed half an amah into the Chel's edge, where its twelfth stone, the coping, meets the floor at 6)
export const STEPS = Object.freeze({ z0: B3.steps.z0, z1: B3.steps.z1, x0: B3.steps.x0, hole: B3.stepsHole });   // (build 126: the book's)
/** step k (1..12): its riser's line (x of its outer face), its top, the stone's depth; the 12th is the coping that meets the Chel's floor */
export function stepOf(k) {
  const top = H112.STEP * k;
  if (k >= 12) return { k, face: B3.podium, top: 6, D: 0.5, bed: 5.5 };   // (build 126: the podium's edge is the book's)
  const face = B3.podium + 6 - 0.5 * k;   // temple.js 39: tread k−1's box reaches 157 + 5.5 − 0.5(k−1)
  return { k, face, top, D: 1.0, bed: top - H112.STEP };
}
// the levels' steps (spec 4: L1 1–4 with marks; L2 5–8, the gauge plain; L3 9–12 without a gauge, the 12th meets the floor)
export const STEPS_OF = Object.freeze({ 1: [1, 2, 3, 4], 2: [5, 6, 7, 8], 3: [9, 10, 11, 12] });

const MISSIONS = () => {
  const L = [];
  for (const lv of [1, 2, 3]) {
    L.push({ k: 'posts', id: `posts${lv}`, lv });
    L.push({ k: 'slab', id: `slab${lv}`, lv });
    L.push({ k: 'warn', id: `warn${lv}`, lv });
    L.push({ k: 'steps', id: `steps${lv}`, lv });
    L.push({ k: 'close', id: `close${lv}`, lv });
  }
  return L;
};
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['posts', 'slab', 'warn', 'steps', 'close']);
const WEIGHT = { posts: 1.5, slab: 2.5, warn: 1.5, steps: 2, close: 2 };
const TOTAL = PLAN.reduce((a, m) => a + WEIGHT[m.k], 0);

/* ───────── the geometry of a run ───────── */
/** a post's half-width along its line */
export const halfW = (p) => (p.tall ? H112.TALL_W / 2 : H112.POST_W / 2);
/** the slab a bay takes: its width (groove to groove) from the posts' centres */
export function bayWidth(a, b) { return Math.hypot(b.x - a.x, b.z - a.z) - halfW(a) - halfW(b) + 2 * H112.GROOVE; }
export const fingers = (w) => Math.round(w * H112.FINGERS);
/** the drift of his row (spec 5): the run's closing bay inherits the sum of his posts' errors; a level's own base, its sign */
const DRIFT = { 1: [0.05, 1], 2: [0.14, -1], 3: [0.2, 1] };
export function driftOf(lv, errs = []) {
  const [b, s] = DRIFT[lv] || DRIFT[1];
  const sum = errs.reduce((a, e) => a + Math.abs(+e || 0), 0);
  return Math.max(-0.45, Math.min(0.45, s * (b + 0.9 * sum)));
}
/** the posts of a run as they stand: the kohen's with their errors (across the line) and his last one moved by the drift (along) */
export function runPosts(lv, save) {
  const R = RUNS[lv], S = save && save.posts && save.posts[lv];
  const out = R.posts.map((p) => ({ ...p }));
  if (!S) return out;
  R.kposts.forEach((pi, j) => {
    const p = out[pi], e = S.e ? S.e[j] || 0 : 0, n = LINE[p.line];
    p.x += n[0] * e; p.z += n[1] * e;
    if (p.corner && S.ez != null) p.z += S.ez;   // (the corner: its second sighting, along z)
  });
  // his last post: the drift along the run (the closing bay grows or shrinks)
  const last = out[R.kposts[R.kposts.length - 1]], prev = out[R.kposts[R.kposts.length - 2]], d = S.drift || 0;
  if (last && prev && !last.corner) { const ux = last.x - prev.x, uz = last.z - prev.z, L = Math.hypot(ux, uz) || 1; last.x -= (ux / L) * d; last.z -= (uz / L) * d; }
  else if (last && last.corner) { const b = out[R.close[1]]; b.x -= d; }   // (the corner: the crews' first post on the south line, set from the other side, takes it)
  return out;
}
/** the closing bay's slab width as the posts stand, and the slabs on the cart (spec 5: L1 regular / narrow / wide; L2 two close; L3 unmarked) */
export function closingOf(lv, save) {
  const R = RUNS[lv], ps = runPosts(lv, save), [a, b] = R.close;
  const need = bayWidth(ps[a], ps[b]), W = bayWidth(RUNS[lv].posts[a], RUNS[lv].posts[b]);
  const cart = lv === 1 ? [W - 0.25, W, W + 0.25] : lv === 2 ? [W - 0.22, W - 0.12, W + 0.1] : [W, W + 0.18, W + 0.3];
  return { need: +need.toFixed(3), nominal: +W.toFixed(3), cart: cart.map((w) => +w.toFixed(3)), marks: lv < 3, labels: lv < 3, wind: lv >= 3 };
}
/** the warning slab's post: every `every`th from the crews' last warning (spec 3); the tall posts of the run (one right, the others not) */
export function warnOf(lv) {
  const R = RUNS[lv];
  const talls = R.posts.map((p, i) => (p.tall && !p.warn ? i : -1)).filter((i) => i >= 0);
  return { at: R.warnAt, from: R.warnFrom, every: R.every, talls, word: lv === 1 ? 'NO' : lv === 2 ? 'ENTER' : 'STRANGER', flips: lv >= 3 ? 2 : 1 };
}

/* ───────── the save ───────── */
export function freshH112() {
  return { v: 1, i: 0, done: [], res: {}, best: 0, plays: {}, posts: {}, slabs: {}, warn: {}, steps: { n: 0, h: [] }, close: {}, intro: 0, ride: 0, reader: 0 };
}
export function createH112(save) {
  const st = save && save.v === 1 ? save : freshH112();
  for (const [k, v] of Object.entries(freshH112())) if (st[k] === undefined) st[k] = v;
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
      // a mission passed without being played (a minigame's own page skips to it; tests) leaves the world as the crews would have
      const lv = m.lv;
      if (m.k === 'posts' && !(st.posts[lv] && st.posts[lv].done)) { const n = RUNS[lv].kposts.length; st.posts[lv] = { done: 1, e: Array(n).fill(0), ez: 0, drift: driftOf(lv, []) }; }
      if (m.k === 'slab' && !(st.slabs[lv] && st.slabs[lv].done)) st.slabs[lv] = { done: 1, laid: RUNS[lv].bays.map(() => 1) };
      if (m.k === 'warn' && !(st.warn[lv] && st.warn[lv].done)) st.warn[lv] = { done: 1, cov: 1, stains: 0 };
      if (m.k === 'steps') { const top = STEPS_OF[lv][STEPS_OF[lv].length - 1]; if (st.steps.n < top) { while (st.steps.h.length < top) st.steps.h.push(0); st.steps.n = top; } }
      if (m.k === 'close' && !(st.close[lv] && st.close[lv].done)) { const C = closingOf(lv, st); st.close[lv] = { done: 1, w: C.need, cut: 0 }; }
      return M.mission();
    },
    progress() { let w = 0; for (const id of st.done) { const m = PLAN.find((x) => x.id === id); if (m) w += WEIGHT[m.k]; } return Math.min(1, w / TOTAL); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
    /** the share of the crews' ring (the soreg round both courts and the Chel's courses) the world shows while mission m is open */
    shown(m) { if (!m) return 1; return Math.min(0.96, 0.12 + (0.84 * m.n) / (PLAN.length - 1)); },
    /** the 13 (spec "המספר שלוש עשרה"): his lattice slabs laid and his closings */
    slabsLaid() {
      let n = 0;
      for (const lv of [1, 2, 3]) { const s = st.slabs[lv]; if (s && s.laid) n += s.laid.filter(Boolean).length; if (st.close[lv] && st.close[lv].done) n++; }
      return n;
    },
    /** a level closes with its closing bay: the run is whole */
    unitEnd(m) {
      if (m.k !== 'close') return null;
      const ids = KINDS.map((k) => `${k}${m.lv}`), r = ids.map((id) => st.res[id]).filter(Boolean);
      if (r.length < 5) return null;
      const all3 = r.every((x) => x.stars >= 3);
      return { title: `קטע ${m.lv} מתוך 3 של הסורג`, sub: all3 ? 'מהודר' : 'כשר', bonus: `קטע ${m.lv} · ${all3 ? 'מהודר' : 'כשר'}` };
    },
  };
  return M;
}
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
