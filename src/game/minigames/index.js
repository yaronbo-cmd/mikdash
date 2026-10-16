/* ─────────────────────────────────────────────────────────────────────────────
 * The precision games of the site (FUN, wave 6): the builder's own hands on the key stones.
 *
 *   import { runMinigame, MINIGAMES } from './game/minigames/index.js';
 *   const r = await runMinigame('crane', { root, world: stages, site: 'wall', level: 0…4, seed, demo, onEvent, sfx, haptic, reduced, best });
 *   // → { ok, kind, quality 0…1, perfect, ms, score, skipped, tier 0…3, best, isPB, tries }   (always resolves; never throws)
 *   // ctx.stones (crane: 1–4) and ctx.quick (no result card, no fact: a segment's quick lift, ~5 s)
 *
 * kinds: crane המנוף (set a key stone) · dress הסיתות (dress a cornerstone) · plumb האנך והפלס (inspect a course) ·
 *        whole אבנים שלמות (the altar's stones) · quarry המחצבה (free a block: channels, then even wedges).
 * 3D anchors, all guarded (SITE, PEOPLE, WORLD): `world` may be the raw stages (BUILD passes that) or the world with
 * `.stages`. Read: stages.nextSlot(site), stages.slots(site, course) (the crane shows the real joints below),
 * stages.frontView(site) + ctx.look / world.look (frames the site above the sheet), stages.hero.workpiece(state) (the
 * dressing: rough → drafted → dressed). Missing any of them, the game plays alone in its sheet.
 * Each game ends with one true fact (a draft for CONTENT: bus/SOURCES.md), a tier and a personal best.
 * ──────────────────────────────────────────────────────────────────────────── */
import { runFrame, calm, simulate, TIERS, tierOf, rng, starsOf, feed, STARS_Q } from './frame.js';
import { runInWorld, craftsOf } from '../hands.js';   // ── flow16 ── the screen is the tool: a craft played in the world, no sheet ── /flow16 ──
import { crane } from './crane.js';
import { dress } from './dress.js';
import { plumb } from './plumb.js';
import { whole } from './whole.js';
import { quarry } from './quarry.js';
// ── games14 ── the jobs' games (wave 14): FUN14's jobs.js deals a job as soon as GAMES[game] exists
import { saw } from './saw.js';
import { cover } from './cover.js';
import { pull } from './pull.js';
import { tread } from './tread.js';
import { rafts } from './rafts.js';
import { waves } from './waves.js';
// ── /games14 ──

export const GAMES = { crane, dress, plumb, whole, quarry };
// ── games14 ── (FUN14 and ECON14: add yours by your own Object.assign line, in your own fence)
Object.assign(GAMES, { saw, cover, pull, tread, rafts, waves });
// ── /games14 ──
export { TIERS, tierOf, simulate, rng, calm, starsOf, feed, STARS_Q };   // (games14: the star floor, the bots' feed)

/* the crane's key stones (BUILD's `what`): a kicker each; the great stone brings the master course (bus/SOURCES.md §3.10) */
const WHAT = {
  first: { kicker: 'האבן הראשונה' }, corner: { kicker: 'אבן פינה' }, lintel: { kicker: 'המשקוף', hint: 'הקש כשהמשקוף מעל שני העמודים' },
  great: { kicker: 'האבן הגדולה', hint: 'אבן כבדה ואיטית, והרוח מזיזה אותה — הקש כשהיא מעל מקומה', fact: { he: 'בנדבך הגדול שבמנהרות הכותל יש אבן שאורכה כ־13.5 מטר וגובהה 3.3 מטר; משקלה — מאות טונות.', ref: 'ד. בהט, מנהרת הכותל המערבי (2013)', status: 'draft' } },
};

/* (wave 8B) "הנח את אבן הפינה" can open the quarry or the dressing (content.js keyOf): the sheet says how this game makes
 * that stone, so the prompt and the game tell one story (QA8B N4d) */
const MAKES = {
  quarry: { corner: { kicker: 'אבן הפינה · חציבה', lead: 'קודם חוצבים את אבן הפינה מן הסלע: הקש כשמד הכוח מגיע לפס הזהוב' } },
  dress: { corner: { kicker: 'אבן הפינה · סיתות', lead: 'מסתתים את אבן הפינה: הקש כשהאזמל נוגע בעיגול הזהוב — עיגול אחרי עיגול' } },
};

/* BUILD's labels for its key stones (src/game/index.js keyStone) → the variants' keys */
export const WHAT_KEY = { 'האבן הראשונה': 'first', 'אבן גדולה': 'great', 'אבן פינה': 'corner', 'המשקוף': 'lintel', 'אבן שלמה לנדבך': 'course' };

/** The catalogue for BUILD's UI and CONTENT's review: { kind: { n, kicker, hint, secs, step, tiers, fact } } */
export const MINIGAMES = Object.fromEntries(Object.values(GAMES).map((g) => [g.kind, { n: g.n, kicker: g.kicker, hint: g.hint, secs: g.secs, step: g.step, tiers: TIERS, fact: g.fact }]));
// ── fun14 ── (wave 14) the course loop's own jobs (src/game/jobs.js deals them by GAMES' keys): the snap-line that opens a
// course (her ❤️ החוט הצבוע), place.js (her ❤️ בניית קשת, then השלם את הנדבך) and the wheel (her ❤️) — after the catalogue:
// MINIGAMES stays the key stones' five precision games (the daily challenge, CONTENT's review)
import { snap } from './snap.js';
import { place, course } from './place.js';
import { wheel } from './wheel.js';
Object.assign(GAMES, { snap, place, course, wheel });
// ── /fun14 ──

const has = (o, k) => !!o && typeof o[k] === 'function';
const call = (o, k, ...a) => { try { return has(o, k) ? o[k](...a) : undefined; } catch (e) { return undefined; } };

function stagesOf(ctx) {
  const w = ctx.stages || ctx.world;
  if (!w) return null;
  if (has(w, 'nextSlot') || has(w, 'siteInfo') || w.hero) return w;
  return w.stages || null;
}

/** The real course for the crane: the next free stones of the slot's course and the course below, along the face. */
export function craneCourse(st, site, slot) {
  if (!slot || !has(st, 'slots')) return null;
  const cur = call(st, 'slots', site, slot.course), below = call(st, 'slots', site, slot.course - 1);
  if (!Array.isArray(cur) || !Array.isArray(below) || below.length < 2) return null;
  const yaw = +slot.yaw || 0, ax = Math.cos(yaw), az = -Math.sin(yaw), unit = +slot.w || 1;
  const map = (p) => ({ u: (((+p.x || 0) - slot.x) * ax + ((+p.z || 0) - slot.z) * az) / unit, w: (+p.w || unit) / unit });
  let free = cur.filter((p) => p && !p.set).map(map).sort((a, b) => a.u - b.u);
  let low = below.map(map).sort((a, b) => a.u - b.u);
  let ahead = free.filter((p) => p.u > -0.05);
  if (ahead.length < 2) {                          // the front works the other way: mirror the face
    const flip = (p) => ({ u: -p.u, w: p.w });
    free = free.map(flip).sort((a, b) => a.u - b.u); low = low.map(flip).sort((a, b) => a.u - b.u);
    ahead = free.filter((p) => p.u > -0.05);
  }
  const targets = ahead.slice(0, 4);
  if (!targets.length || Math.abs(targets[0].u) > 0.2) return null;
  return { targets, below: low };
}

/* the sound at contact without a main.js change: the first game that brings BUILD's sfx and the world binds PEOPLE's
 * onImpact and WATER's events to the kit once (guarded, once per kit) — BUILD may also bind them itself at start */
const BOUND = new WeakSet();
/** bindSound({ sfx, world }, stages?) — BUILD may call it at start (idempotent: once per kit) */
export function bindSound(ctx = {}, st = stagesOf(ctx)) {
  const S = ctx.sfx;
  if (!S || (typeof S !== 'function' && typeof S !== 'object') || BOUND.has(S)) return;
  BOUND.add(S);
  try { if (st && st.hero && has(S, 'bindHero')) S.bindHero(st.hero); } catch (e) { /* guarded */ }
  try { const w = ctx.world; if (w && w.water && has(S, 'bindWater')) S.bindWater(w.water); } catch (e) { /* guarded */ }
  try { if (has(S, 'dayBed')) S.dayBed('site'); } catch (e) { /* guarded */ }       // by day the site is never silent
}

// ── games13 ── (wave 13) "שלבי הפילוס": where the check opens with the A-frame level (the string on the gold notch — the owner's
// "הפלס עם המחט"), then the plumb. `courses`: the course check (index.js courseCheck, ctx.check === 'courses'; content.js
// checkEvery: the Mount every course); `inspect`: the stage's inspection at its end (runInspect), after the finish it levels.
// Elsewhere as before: the course check is 3 plumb rounds; the inspection 3 plumb + 2 level.
export const LEVEL_ORDER = ['level', 'level', 'plumb'];
export const LEVEL_AT = {
  courses: { har: { surface: 'course', kicker: 'פילוס הנדבך · הר הבית' } },
  rock: { har: { surface: 'rock', kicker: 'פילוס הסלע · הר הבית', order: ['level', 'level'], lead: 'הפלס על הסלע: הקש כשהחוט עובר על החריץ הזהוב שבמרכז' } },   // (N82: the bedrock leveled once the rocks are gone — if DIRECTOR13 calls check: 'rock')
  inspect: {
    har: { surface: 'paving', kicker: 'ריצוף הרחבה · הפלס' },
    nashim: { surface: 'floor', kicker: 'רצפת עזרת הנשים · הפלס' },
    nikanor: { surface: 'steps', kicker: 'ט״ו המעלות · הפלס' },
    karnot: { surface: 'altar', kicker: 'ראש המזבח · פלס של עץ' },
  },
};
const LEAD = 'הפלס: הקש כשהחוט עובר על החריץ הזהוב שבמרכז — ואחר כך האנך';
/** the level's place for a plumb game's ctx → { surface, kicker, lead } | null */
export function levelAt(ctx = {}) {
  const t = LEVEL_AT[ctx.check === 'courses' || ctx.check === 'rock' ? ctx.check : 'inspect'], L = t && ctx.site ? t[ctx.site] : null;
  return L ? { lead: LEAD, ...L } : null;
}
// ── /games13 ──

/** Run one precision game. Always resolves (a calm result on any failure, and after 3 minutes at most). */
export function runMinigame(kind, ctx = {}) {
  let game = GAMES[kind];
  if (!game) return Promise.resolve(calm(kind));
  // ── games14 ── a job's variant: its skin (the gold, the plaster, the bronze) or the saw for two (ctx.duel)
  if (typeof game.pick === 'function') { try { game = game.pick(ctx) || game; } catch (e) { /* the base game */ } }
  // ── /games14 ──
  if (globalThis.__MG_AUTO) ctx = { ...ctx, demo: true, fast: true };   // test harnesses: the game plays itself and resolves in ~1 s
  try {
    const st = stagesOf(ctx);
    if (!globalThis.__MG_AUTO) bindSound(ctx, st);
    const what = WHAT_KEY[ctx.what] || ctx.what;                // BUILD may pass its Hebrew label ('אבן גדולה') or the key ('great')
    if (what !== ctx.what) ctx = { ...ctx, what };
    const setup = { stones: ctx.stones | 0, what };             // crane: 1–4 stones (1 + quick = a segment's quick lift); what: BUILD's key stone
    // ── fun14 ── the course loop's jobs (src/game/jobs.js): the job's skin, its site and how often it was played there
    if (ctx.skin) setup.skin = ctx.skin;
    if (ctx.site) setup.site = ctx.site;
    if (ctx.n != null) setup.n = ctx.n | 0;
    // ── /fun14 ──
    const V = kind === 'crane' && WHAT[ctx.what];
    // ── games13 ── the level with the needle where the work IS leveling (the owner, 30.9 11:12): two level rounds, then the plumb
    const LV = kind === 'plumb' ? levelAt(ctx) : null;
    if (LV) { setup.order = (LV.order || LEVEL_ORDER).slice(); setup.surface = LV.surface; ctx = { ...ctx, ...(ctx.check === 'courses' || ctx.check === 'rock' ? { quick: true } : {}), kicker: ctx.kicker || LV.kicker, lead: ctx.lead || LV.lead, hint: ctx.hint || 'הקש כשהחוט עובר על החריץ הזהוב' }; }
    else if (kind === 'plumb' && ctx.check === 'courses') { setup.rounds = 3; ctx = { ...ctx, quick: true, kicker: ctx.kicker || 'בדיקת הנדבכים' }; }   // light: ~7 s, no card
    // ── /games13 ──
    if (V) ctx = { ...ctx, kicker: ctx.kicker || V.kicker, hint: ctx.hint || V.hint, fact: ctx.fact || V.fact };
    const K = MAKES[kind] && MAKES[kind][what];
    if (K) ctx = { ...ctx, kicker: ctx.kicker || K.kicker, lead: ctx.lead || K.lead };
    if (st && ctx.site) {
      const slot = ctx.slot || call(st, 'nextSlot', ctx.site);
      if (kind === 'crane') setup.crane = craneCourse(st, ctx.site, slot);
      // ── site15 ── המנופאי: the treadwheel in the world when the site's lifting crane can take him (else the sheet's game as before)
      if (kind === 'tread' && !ctx.demo && !globalThis.__MG_AUTO && has(st, 'treadBegin') && ctx.quick) { try { const tb = st.treadBegin(ctx.site); if (tb && tb.ok) setup.tread = st; } catch (e) { setup.tread = null; } }   // ── flow16 ── (the strip only for a quick run: the craft in the world takes the job's tread below) ── /flow16 ──
      // ── /site15 ──
      const look = has(ctx, 'look') ? ctx.look : ctx.world && has(ctx.world, 'look') ? (p, t) => ctx.world.look(p, t) : null;
      const fv = call(st, 'frontView', ctx.site);
      if (look && fv && fv.p && fv.t && !setup.tread) { try { look(fv.p, fv.t); } catch (e) { /* guarded */ } }   // ── site15 ── (the operator's own frame)
      const hero = st.hero;
      setup.onWorld = (what) => { if (hero && /^(rough|drafted|dressed|quarry|field)$/.test(what)) call(hero, 'workpiece', what); };   // PEOPLE's workpiece states
    }
    let timer = 0;
    const cap = new Promise((res) => { timer = setTimeout(() => res(calm(kind, 180000)), ctx.fast ? 30000 : 180000); });
    const after = (r) => {
      clearTimeout(timer);
      if (setup.tread) { try { setup.tread.treadEnd(r); } catch (e) { /* guarded */ } }   // ── site15 ── (he walks back to his banker)
      // (wave 7) a masterly try earns the kohen's proud pose (PEOPLE7's hero.gesture, guarded; 'gotit' already comes with the stone)
      try { const hero = st && st.hero; if (hero && has(hero, 'gesture') && r && !r.skipped && (r.isPB || (r.tier === 3 && r.perfect))) setTimeout(() => { try { hero.gesture('proud'); } catch (e) { /* guarded */ } }, 350); } catch (e) { /* guarded */ }
      return r;
    };
    const sheet = () => Promise.race([runFrame(game, { ...ctx, setup }), cap]).catch(() => calm(kind)).then(after);
    // ── flow16 ── the craft in the world (src/game/hands.js): when the world offers it (SITE16's stages.craft[kind], or SITE15's
    // treadwheel) and the site is live — not the demo reel, not a test's autopilot, not a quick check. The sheet stays the lab's
    // and the fallback (a begin that says no: the sheet, as today)
    const live = !ctx.demo && !globalThis.__MG_AUTO && (!ctx.quick || (ctx.twin && (kind === 'crane' || kind === 'plumb'))) && st && ctx.site && !setup.tread;   // ── twin17 ── (the quick lift too, under two thumbs) ── /twin17 ──
    let cr = live ? craftsOf(ctx.world || st)[kind] : null;
    try { ctx.onEvent && ctx.onEvent('mgLive', { kind, live: !!live, cr: !!cr, twin: !!(ctx.twin), quick: !!ctx.quick, demo: !!ctx.demo, st: !!st, site: ctx.site || null }); } catch (e) { /* the host's */ }   // ── crafta19 ── (tests) ── /crafta19 ──
    // ── twin17 ── two thumbs (src/game/twin.js): every job's model is played in the world by the right thumb — its craft when the
    // world has one, else at his hands (the work's point follows him to his spot); no sheet
    const tw = live && ctx.twin && typeof ctx.twin.onWork === 'function' ? ctx.twin : null;
    // ── fable20 ── a job without a craft of its own in the world: the general work craft (stages.craft.work — a real workpiece before him)
    // with work.js's model (acts on the beat); only at his hands when the world has none
    let generic = false;
    if (!cr && tw) {
      const W0 = ctx.world || st, raw = W0 && W0.craft && W0.craft.work, crW = raw ? craftsOf(W0).work : null;
      if (raw && crW && typeof raw.begin === 'function') {
        const job = ctx.job || kind, lv = Math.max(0, Math.min(4, ctx.level | 0));
        cr = { ...crW, begin: (site) => raw.begin(site, { job, n: WORK_N[lv] }) };
        game = { ...work, model: (o) => workModel({ ...o, kind, job }), fact: ctx.fact || game.fact, hint: work.hint, howto: work.howto };
        generic = true;
      } else cr = twinCraft(ctx);
    }
    // ── /fable20 ──
    // ── /twin17 ──
    if (cr && game.world && typeof game.world.model === 'function' && !(game.world.twinOnly && !tw)) game = game.world;   // ── crafta19 ── (twinOnly: my world models are the two thumbs' — portrait keeps the sheet's model in the world) ── /crafta19 ── ── craftb19 ── (a craft played in the world: its world model — the plumb's line paid out and nudged, the saw's back and forth) ── /craftb19 ──
    if (cr && typeof game.model === 'function') {
      const M = game.model({ level: Math.max(0, Math.min(4, ctx.level | 0)), rng: rng(ctx.seed == null ? (Date.now() & 0xffff) : ctx.seed >>> 0), setup });
      // ── twin18 ── (kid17: the treadwheel's craft said no — the crane busy, no open slot — and its sheet came over the job the thumb had
      // started) under two thumbs a craft that refuses to begin is played at his hands instead: never a sheet
      let refused = false; const cr0 = cr;
      if (tw && has(cr0, 'begin')) cr = { ...cr0, begin: (site) => { const b = cr0.begin(site); if (!b || b.ok === false) refused = true; return b; } };
      // ── /twin18 ──
      const wo = { kind, site: ctx.site, world: ctx.world || st, view: ctx.view, ui: ctx.ui, heroPos: ctx.heroPos, root: ctx.root, hooks: cr, buttons: game.buttons, hint: ctx.hint || game.hint, howto: game.howto, fact: ctx.fact || game.fact, sfx: ctx.sfx, haptic: ctx.haptic, onEvent: ctx.onEvent, level: ctx.level | 0, ...(tw ? { input: 'twin', twin: tw, job: ctx.job || null, generic } : {}) };   // ── twin17 ── (input) ── /twin17 ── ── twin18 ── (wo) ── /twin18 ──
      const p = runInWorld(M, wo);
      try { ctx.onEvent && ctx.onEvent('mgPath', { kind, tw: !!tw, world: !!(game && game.twinOnly), hooks: !!cr0, refused, generic }); } catch (e) { /* the host's */ }   // ── crafta19 ── (tests: how the job is played) ── /crafta19 ──
      return Promise.race([p, cap]).catch(() => null).then((r) => (r ? after(r) : refused && tw ? Promise.race([runInWorld(M, { ...wo, hooks: twinCraft(ctx) }), cap]).catch(() => null).then((r2) => (r2 ? after(r2) : sheet())) : sheet()));   // ── twin18 ── (refused: at his hands) ── /twin18 ──
    }
    // ── /flow16 ──
    return sheet();
  } catch (e) {
    return Promise.resolve(calm(kind));
  }
}

// ── twin17 ── a job with no craft in the world, under two thumbs: its work is at his hands (followed as he walks to his spot)
function twinCraft(ctx) {
  const at = { x: 0, y: 0, z: 0 };
  const put = () => { try { const p = typeof ctx.heroPos === 'function' ? ctx.heroPos() : null; if (p && Number.isFinite(p.x)) { at.x = p.x; at.y = p.y + 1.3; at.z = p.z; } } catch (e) { /* */ } };
  let k = 0;
  return { begin: () => { put(); return { ok: true, at }; }, update: () => { if (++k % 6 === 0) put(); }, end: () => {}, box: null };
}
// ── /twin17 ──
/* BUILD's branch must build without mine: it also finds the games here (bus/BUILD.md) */
try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.minigames = { runMinigame, MINIGAMES, bindSound }; } catch (e) { /* no global */ }
// ── econ14 ── ❤️ "חריטת אותיות" (FUN14 deals 'letters' → 'draw'); האבן שלי's pad is drawMark: the shop opens it through the frame
// (setup.out gets her strokes), so it is not a deck's game
import { draw, drawMark } from './draw.js';
import { pipes } from './pipes.js';   // "אמת המים" (FUN14: job 'aqueduct' → game 'pipes')
Object.assign(GAMES, { draw, pipes });
// ── crafta19 ── the survey under two thumbs (FUN19 §3: the Mount's measure; a world craft, no sheet) ── /crafta19 ──
import { survey } from './survey.js';
Object.assign(GAMES, { survey });
import { work, workModel, WORK_N } from './work.js';   // ── fable20 ── (the general work in the world; not a deck's game) ── /fable20 ──
export { drawMark };
try { const P = globalThis.__BH_PARTS; if (P && P.minigames) Object.assign(P.minigames, { runFrame, drawMark }); } catch (e) { /* no global */ }
// ── /econ14 ──
