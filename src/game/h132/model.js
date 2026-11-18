/* ── build 132 ── h132/model.js — stage 09 "הסובב וחוט הסיקרא" (spec docs/specs/shlav-09-he.md, approved 18.11). Pure: no three.js, no DOM.
 * The core of the stage's model: the plan and the save, the stage's flow, the flaw registry, the loss table, the one grading, the lines.
 * Each work's own rules live in its own pure file beside this one (form-model.js, fill-model.js, strip-model.js, sikra-model.js), so
 * the lanes never edit the same file.
 *
 *   H132 · LINES · WORDS · LOSS · lossPts · applyLoss · starsOf · qOf · grade · NEXT_STAGE
 *   PLAN · KINDS · LEVELS · NEEDS · VISIT · STAGE_FLOW · freshH132 · createH132(save) · fromOld(oldDone)
 *   blockAfter(kind) · blockOf(save) · stage(kind, lv, save) · westSlots(flaws) · flawsOf(save, f)
 *
 * THE STAGE'S FLOW (ירון 18.11: a level per visit) — ONE table, VISIT, and the round it makes (STAGE_FLOW):
 *   · round 1 is the building order at the first level: form1 → fill1 → strip1 → sikra1 → the ending; the stage counts as built after it
 *     (the stage page, ?stage=9 / __H132_FULL, plays round 1) and the next stage opens;
 *   · after round 1 every station is open, in any order: its work plays at its own next level (M.nextLevel(kind) = min(VISIT.max,
 *     levels done + 1); after the last it stays there). One block: a return visit begins from its work's own pre-state (stage(kind, lv)),
 *     and at its end the world is the built one again with the best play of that work kept (its stars and its flaws; M.done);
 *   · the per-work links (#form1 … #sikra3) keep every level reachable (M.autoTo).
 * Every model and view takes the level, and every work begins from stage(kind, lv, save) — whatever was played before.
 *
 * The save (G.h132): { v, cur, done, res, plays, best, i, intro, film, crews, flaws: [{ f, work, lv, n, at, wall, zone, slot }],
 *   form: { work }, fill: { work }, strip: { work }, sikra: { work } }
 *   · `<kind>.work` is the act's own blob while a work is open (M.keep(kind, blob); M.workOf(kind) on begin), cleared when it ends.
 *   · flaws are what stays in the world (rule 55): the damages of the loss table and the visible marks of no points (an uneven layer, a
 *     seam, a pink mark …). Each is kept with its work and level; the world draws each where it is; work 4 reads the west wall's
 *     slots from them (westSlots: the spec's table, exactly).
 *
 * Units: amot, seconds. Nothing random at play time (rule 56). Every place is the book's (BOOK.s09).
 */
import { BOOK } from '../world/grid.js';

const S9 = BOOK.s09;

/* ───────── the constants ───────── */
export const H132 = Object.freeze({
  LOSS: 20,
  // (the stub acts of the works not yet coded: how long their picture is held before they finish, seconds)
  STUB_SECS: 2.2,
});

/** the next stage (spec: "מדרגת הסובב ... נוצרת רק כשיוצקים את הגוש הבא, בשלב 10"): the end card after this stage names it */
export const NEXT_STAGE = 'גוף המזבח';

/* ───────── the lines (copied from the spec, docs/specs/shlav-09-he.md, and nowhere else) ───────── */
export const LINES = Object.freeze({
  stage: 'שלב 09: הסובב וחוט הסיקרא · התבנית, המילוי, השליפה, החוט',
  ill: '(המחשה)',
});
/** the full-screen word of a perfect work (spec, each work's "מילת ההצלחה על כל המסך") and the quick word (rule 64) */
export const WORDS = Object.freeze({ form: 'נסגר!', fill: 'גוש שלם!', strip: 'נחשף!', sikra: 'הקפה אחת!', quick: 'מושלם!' });

/** the loss table (spec "טבלת ההפסד"): label, points, and whether it is shown on the block's face (the west wall's slots) */
export const LOSS = Object.freeze({
  'form.crack': ['לוח נסדק: טלאי על הלוח', 20],
  'fill.bulge': ['לוח מתנפח: הלוח מתקמר לתמיד', 20],
  'fill.nest': ['"קן": אבנים חשופות על פני הגוש', 20],
  'fill.dent': ['שקע בראש הגוש', 20],
  'fill.collapse': ['התמוטטות המרכז: התל גולש לפינה', 0],
  'fill.uneven': ['שכבה לא ישרה: שקע או גבשושית', 0],
  'strip.torn': ['פינה קרועה: סדק בפינת הגוש', 20],
  'strip.patch': ['כתם קרוע על פאת הגוש', 20],
  'sikra.wavy': ['קטע גלי', 20],
  'sikra.gap': ['רווח בקו', 20],
  'sikra.drip': ['טפטוף אדום מתחת לקו', 20],
  'sikra.blot': ['כתם על הקו', 20],
  'sikra.blot2': ['כתם כפול בנקודת הסגירה', 20],
  'sikra.smear': ['מריחה בפינה', 20],
  'sikra.seam': ['תפר קטן בקו', 0],
  'sikra.pink': ['סימן ורוד מתחת לקו', 0],
  'sikra.pale': ['קו חיוור', 0],
});
export const FLAWS = Object.freeze(Object.keys(LOSS));
export const lossPts = (f) => (LOSS[f] ? LOSS[f][1] : 0);
/** the score after a loss: never below zero */
export const applyLoss = (score, pts) => Math.max(0, (score | 0) - Math.max(0, pts | 0));

/* ───────── grades (the one system: 40 / 20 / 10; any damage caps the work at 10) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
export const grade = (dmg, clean) => ((dmg | 0) > 0 ? 10 : clean ? 40 : 20);

/* ═════════════════ the plan, the flow and the save ═════════════════ */
export const KINDS = Object.freeze(['form', 'fill', 'strip', 'sikra']);
export const LEVELS = Object.freeze([1, 2, 3]);
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv }))).map((m, i) => Object.freeze({ ...m, n: i })));
/** the stage's sequence (ירון 18.11, a level per visit — ONE table): round 1 the kinds in the building order at the first level; each
 *  later visit to a station: that work at its next level, up to the last */
export const VISIT = Object.freeze({ first: 1, max: 3 });
/** round 1 (the stage page; the goal pill counts it: "N מתוך 4 עבודות") */
export const STAGE_FLOW = Object.freeze(KINDS.map((k) => k + VISIT.first));
/** what each kind needs standing in the world before it (the block's state machine) — stage() stages it when the save lacks it */
export const NEEDS = Object.freeze({ form: [], fill: ['form'], strip: ['form', 'fill'], sikra: ['form', 'fill', 'strip'] });
/** the block's states, in order (h132/world.js draws each from the save) */
export const BLOCK = Object.freeze(['site', 'formLying', 'formUp', 'filled', 'bare', 'lined']);
const BEGIN = Object.freeze({ form: 'formLying', fill: 'formUp', strip: 'filled', sikra: 'bare' });
const AFTER = Object.freeze({ form: 'formUp', fill: 'filled', strip: 'bare', sikra: 'lined' });
export const blockAfter = (kind) => AFTER[kind] || 'site';
export const blockBefore = (kind) => BEGIN[kind] || 'site';

export function freshH132() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, i: 0, intro: 0, film: 0, crews: 0, flaws: [], bestOf: {}, stash: null,
    form: { work: null }, fill: { work: null }, strip: { work: null }, sikra: { work: null } };
}
const byId = (id) => PLAN.find((m) => m.id === id) || null;
const kindIdx = (k) => KINDS.indexOf(k);
/** the flow's works before a kind (by the kinds' order) — what must be done before a work of that kind can be picked off the flow */
const flowBefore = (k) => STAGE_FLOW.filter((id) => kindIdx(byId(id).k) < kindIdx(k));

/** the block's state with no work open: after the last kind whose work is done (any level), else the bare site */
export function blockOf(save) {
  const st = save || {}, d = st.done || [];
  if (st.crews) return 'lined';
  let s = 'site';
  for (const k of KINDS) if (d.some((id) => byId(id) && byId(id).k === k)) s = AFTER[k];
  // (a kind done but an earlier one not — a link page — still shows the later state: the world never goes back)
  return s;
}
/** the save's flaws (of one kind, or all), each as kept */
export const flawsOf = (save, f) => ((save && save.flaws) || []).filter((x) => !f || x.f === f);

/** the west wall's flaw slots (spec, work 4, "הפגמים שעוברים לקיר המערבי"): the first torn corner at 2.5, the bulged boards' marks in
 *  the order they bulged at 5, 7, 9, 11, the nests in the order of the pockets at 14, 16, 18, 20, the torn patch at 24, the second
 *  torn corner at 27.8 (amot from the NW corner). The patched board (work 1) and a dent or bump on the top do not pass. With no flaw
 *  on the face: the one fixed rough patch at the wall's middle (15). → [{ f, slot, d, at: [x, z], y }] in the wall's order */
export function westSlots(flaws) {
  const L = Array.isArray(flaws) ? flaws : [], K = S9.sikra, D = K.slotD, out = [];
  const torn = L.filter((x) => x.f === 'strip.torn'), bulge = L.filter((x) => x.f === 'fill.bulge'), nest = L.filter((x) => x.f === 'fill.nest'), patch = L.filter((x) => x.f === 'strip.patch');
  if (torn[0]) out.push({ f: 'strip.torn', slot: 'tornA', d: D.tornA, at: [...K.slots.tornA] });
  bulge.slice(0, 4).forEach((x, i) => out.push({ f: 'fill.bulge', slot: 'bulge' + (i + 1), d: D.bulge[i], at: [...K.slots.bulge[i]] }));
  nest.slice(0, 4).forEach((x, i) => out.push({ f: 'fill.nest', slot: 'nest' + (i + 1), d: D.nest[i], at: [...K.slots.nest[i]] }));
  if (patch[0]) out.push({ f: 'strip.patch', slot: 'patch', d: D.patch, at: [...K.slots.patch] });
  if (torn[1]) out.push({ f: 'strip.torn', slot: 'tornB', d: D.tornB, at: [...K.slots.tornB] });
  if (!out.length) out.push({ f: 'rough', slot: 'rough', d: D.rough, at: [...K.rough] });
  for (const o of out) o.y = S9.lineY;
  return out.sort((a, b) => a.d - b.d);
}

/** the world as a work of `kind` at level `lv` begins it (spec, each work's "מה רואים" and "רמות"), from the save — whatever was played
 *  before (a link page, the station, the stage's flow): every work starts from this, never from what the last act left.
 *  → { kind, lv, block, walls?, parts?, wedge?, wind?, layers?, loads?, caravan?, walls4?, corners?, sun?, flaws, west? } */
export function stage(kind, lv, save) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1)), flaws = flawsOf(save).map((x) => ({ ...x }));
  const out = { kind, lv: L, block: blockBefore(kind), flaws };
  if (kind === 'form') {
    // level 1: two walls already stand (east and west: the walls with sockets rise first); 2 and 3: all four lying; 3: the wind
    out.walls = { E: L === 1 ? 'up' : 'lie', W: L === 1 ? 'up' : 'lie', N: 'lie', S: 'lie' };
    out.order = ['E', 'W', 'N', 'S'];   // (a wall with a tongue rises after the one with the socket: E and W first, in either order)
    out.stakes = [];   // (no stake driven yet, at every level: the spec has four stakes "בכל מקרה")
    out.wind = L === 3;
  } else if (kind === 'fill') {
    out.layers = 5; out.loadsPerLayer = 4; out.layerMix = { big: 1, small: 1, tub: 2 };   // (2+1+1+1 units a layer)
    out.order = L === 1 ? 'fixed' : 'mixed'; out.caravan = L === 3;
    out.walls = { E: 'up', W: 'up', N: 'up', S: 'up' };
  } else if (kind === 'strip') {
    // level 1: the braces and the belts already gone (4 parts); 2: all 12; 3: 12 and the wedge (13)
    const walls = ['wall:N', 'wall:S', 'wall:E', 'wall:W'], belts = ['belt:N', 'belt:S', 'belt:E', 'belt:W'], braces = ['brace:N', 'brace:S', 'brace:E', 'brace:W'];
    out.parts = L === 1 ? walls : L === 2 ? [...braces, ...belts, ...walls] : [...braces, ...belts, 'wedge', ...walls];
    out.wedge = L === 3;
  } else if (kind === 'sikra') {
    // level 1: one wall (the east) and the north-east corner; at measuring the east wall's two corners. 2 and 3: four walls, four corners
    out.walls4 = L === 1 ? ['E'] : [...S9.order];
    out.corners = L === 1 ? ['SE', 'NE'] : ['SE', 'NE', 'NW', 'SW'];
    out.sun = L === 3;
    out.west = westSlots(flaws);
  }
  return out;
}

/** the kind a flaw belongs to ('fill.bulge' → 'fill') */
const kindOfFlaw = (x) => String((x && x.f) || '').split('.')[0];
/** a play better than another: more stars, then more points */
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
export function createH132(save) {
  const st = save && save.v === 1 ? save : freshH132();
  const F = freshH132();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  for (const k of KINDS) { if (!st[k] || typeof st[k] !== 'object') st[k] = F[k]; for (const [q, v] of Object.entries(F[k])) if (st[k][q] === undefined) st[k][q] = v; }
  if (!Array.isArray(st.flaws)) st.flaws = [];
  if (!st.bestOf || typeof st.bestOf !== 'object') st.bestOf = {};
  if (st.cur && !byId(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const inFlow = (id) => STAGE_FLOW.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    mission() { return st.cur ? byId(st.cur) : null; },
    /** the next work of round 1 (null when round 1 is done) */
    next() { if (st.crews) return null; const id = STAGE_FLOW.find((x) => !d(x)); return id ? byId(id) : null; },
    /** the levels of a kind played (each counted once) and the level its station plays next (a level per visit, VISIT) */
    levelsDone(kind) { return LEVELS.filter((lv) => d(kind + lv)).length; },
    nextLevel(kind) { return Math.min(VISIT.max, M.levelsDone(kind) + VISIT.first); },
    /** the work a visit to a kind's station plays now */
    visitOf(kind) { return byId(kind + M.nextLevel(kind)); },
    /** 1 while the stage is being built, then 2 (the return visits) */
    round() { return M.finished() ? 2 : 1; },
    /** a work can be picked: in round 1 the flow's next, or (a link) a work whose kind's round-1 works before it are done; after round 1
     *  any work (a station's visit, a link — a level played already is played again) */
    canDo(m) {
      if (!m) return false;
      if (M.finished()) return true;
      if (d(m.id)) return false;
      if (inFlow(m.id)) { const n = M.next(); return !!n && n.id === m.id; }
      return flowBefore(m.k).every(d);
    },
    /** what the walk offers: in round 1 the flow's next work; after it every station, each at its own next level */
    open() { if (!M.finished()) { const n = M.next(); return n ? [n] : []; } return KINDS.map((k) => M.visitOf(k)); },
    pick(id) {
      const m = id ? byId(id) : null; st.cur = m && M.canDo(m) ? m.id : null;
      // a work of a kind with a play kept: its flaws set aside while it plays again (M.done keeps the better of the two)
      st.stash = null;
      if (st.cur && st.bestOf[m.k]) { st.stash = { k: m.k, flaws: st.flaws.filter((x) => kindOfFlaw(x) === m.k) }; st.flaws = st.flaws.filter((x) => kindOfFlaw(x) !== m.k); }
      return M.mission();
    },
    nDone() { return STAGE_FLOW.filter(d).length; },
    count() { return [M.nDone(), STAGE_FLOW.length]; },
    finished() { return !!st.crews || STAGE_FLOW.every(d); },
    levelOf(m) { return m.lv | 0 || 1; },
    /** the world as the work `m` (or the open one) begins it */
    stageOf(m) { const w = m || M.mission(); return w ? stage(w.k, w.lv, st) : null; },
    /** the block's state now: the open work's start, else after the last done */
    block() { const m = M.mission(); return m ? blockBefore(m.k) : blockOf(st); },
    /* ── the flaw registry ── */
    /** a flaw kept in the save where it happened; returns its points (the director's X.loss takes them). o: { at, wall, zone, n } */
    flaw(f, o = {}) {
      if (!LOSS[f]) return 0;
      const m = M.mission();
      st.flaws.push({ f, work: o.work || (m && m.id) || null, lv: o.lv || (m && m.lv) || 0, n: o.n | 0, at: o.at == null ? null : o.at, wall: o.wall || null, zone: o.zone || null });
      return lossPts(f);
    },
    flaws(f) { return flawsOf(st, f); },
    westSlots() { return westSlots(st.flaws); },
    /** a work played again from its link: its own flaws go first (the save keeps the last play of each work) */
    clearFlaws(id) { st.flaws = st.flaws.filter((x) => x.work !== id); },
    /* ── the open work's blob ── */
    workOf(kind) { return (st[kind] && st[kind].work) || null; },
    keep(kind, blob) { if (st[kind]) st[kind].work = blob == null ? null : blob; },
    /* ── results ── */
    resultOf(id) { return st.res[id] || null; },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      const r = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {}, loss: res.loss | 0 };
      // each level keeps its best play; the kind keeps its best play's flaws in the world (a worse return visit leaves the world as it was)
      if (!st.res[m.id] || better(r, st.res[m.id])) st.res[m.id] = r;
      const was = st.bestOf[m.k];
      if (!was || better(r, was)) { st.bestOf[m.k] = { id: m.id, stars: r.stars, pts: r.pts }; }
      else if (st.stash && st.stash.k === m.k) st.flaws = [...st.flaws.filter((x) => kindOfFlaw(x) !== m.k), ...st.stash.flaws];
      st.stash = null;
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      if (st[m.k]) st[m.k].work = null;
      st.cur = null; st.i = st.done.length;
      return null;
    },
    /** the director's link and kind pages: the first work not done that `want` takes, in the plan's order (a kind's page: its levels
     *  1, 2, 3), with what it needs of the flow before it done as the crews' (2 stars, no flaw) */
    autoTo(want) {
      const off = PLAN.find((m) => !d(m.id) && want(m)) || (M.finished() ? PLAN.find(want) : null);
      if (off) {
        for (const id of inFlow(off.id) ? STAGE_FLOW.slice(0, STAGE_FLOW.indexOf(off.id)) : flowBefore(off.k)) if (!d(id)) { st.cur = id; M.done({ stars: 2 }); }
        return M.pick(off.id);
      }
      return null;
    },
    progress() { return Math.min(1, M.nDone() / STAGE_FLOW.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 09 (the game before build 132: the old sovev site) was finished: the new stage "built by the crews" (no
 *  points, its works open to play again from their links: st.crews); else a fresh one */
export function fromOld(oldDone) {
  const st = freshH132();
  if (oldDone) st.crews = 1;
  return st;
}
