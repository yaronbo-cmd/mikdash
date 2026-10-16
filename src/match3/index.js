/* ─────────────────────────────────────────────────────────────────────────────
 * match3/index.js — "משחק האוצר": the Temple match-3, the hook before each building step (the owner's daughter's idea).
 *
 *   const r = await runLevel({ root, field, level, need, seed, demo, onEvent, sfx, haptic, save, map, daily, vessels });
 *   // r = { won, stars, moves, collected:{stone, cedar, gold, silver, bronze[, wstone]}, score, ms, quit, field, level, attempts }
 *   levelInfo(field, level) · FIELDS · the pure engine (createBoard, resolve, findMatches, hasMove, reshuffle, hint, …)
 *
 * Never throws; the promise always resolves (an error resolves { quit:true, error }). What was gathered is kept on a loss
 * or an exit (⚑ owner: default yes — "ממש את האבנים", no guilt). Retries are free; nothing is ever bought.
 * Events (onEvent(type, data)): m3open · m3start · m3match · m3special · m3combo · m3collect · m3win · m3lose · m3quit · m3close.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as E from './engine.js';
import { FIELDS, FIELD_IDS, levelSpec, levelInfo as info, hintOf, isHard, difficulty, TUTORIAL } from './levels.js';
import { createUI, VESSEL_CARDS, ALBUM_AT, albumAt } from './ui.js';
import { createView } from './view.js';

export { FIELDS, FIELD_IDS, levelSpec, difficulty, TUTORIAL } from './levels.js';
export { createBoard, resolve, findMatches, findRuns, hasMove, allMoves, isValidSwap, reshuffle, hint, botMove, playBot, finale, goalsMet, goalLeft, cloneState, KINDS } from './engine.js';

export function levelInfo(field, level, o) { try { return info(field, level, o); } catch (e) { return null; } }
/* a board for (field, level) — the same level always gives the same board unless a seed is passed */
export function generate(field, level, seed) { const sp = levelSpec(field, level, seed != null ? { seed } : {}); return E.createBoard(sp, sp.seed); }

const RES = ['stone', 'cedar', 'gold', 'silver', 'bronze'];
const RES_FIELD = { stone: 'quarry', wstone: 'quarry', cedar: 'forest', gold: 'gold', bronze: 'gold' };
const ALBUM_ID = VESSEL_CARDS.map((v) => v.id);
const STAR_BONUS = [0, 0.15, 0.3, 0.5];
const SPECIAL_HE = { [E.ROW]: 'מקבת!', [E.COL]: 'אזמל!', [E.AREA]: 'יתד!', [E.SLIGHT]: 'אור המנורה!' };
const defM3 = () => ({ level: { quarry: 1, forest: 1, gold: 1 }, best: {}, album: {}, seen: {} });
function norm(v) {
  if (!v || typeof v !== 'object') return defM3();
  const d = defM3();
  v.level = Object.assign(d.level, v.level && typeof v.level === 'object' ? v.level : {});
  for (const k of ['best', 'album', 'seen']) if (!v[k] || typeof v[k] !== 'object') v[k] = {};
  // (wave 7) cards open one per board (told); a v15 save keeps every card it had already opened (≥ ALBUM_AT)
  if (!v.told || typeof v.told !== 'object') { v.told = {}; for (const id of ALBUM_ID) if ((v.album[id] || 0) >= ALBUM_AT) v.told[id] = 1; }
  return v;
}
function saveIO(save) {
  return {
    get() { try { return norm(save && typeof save.get === 'function' ? save.get() : save); } catch (e) { return defM3(); } },
    set(m3) { try { if (save && typeof save.set === 'function') save.set(m3); else if (save && typeof save === 'object' && save !== m3) Object.assign(save, m3); } catch (e) { /* the host keeps its save */ } },
  };
}
export function pickField(ctx = {}) {
  if (FIELDS[ctx.field]) return ctx.field;
  const need = ctx.need || {};
  let best = null;
  for (const k of Object.keys(need)) if (RES_FIELD[k] && need[k] > 0 && (!best || need[k] > need[best])) best = k;
  return best ? RES_FIELD[best] : 'quarry';
}
const sfxOf = (sfx) => (name, o) => {
  try {
    if (!sfx) return;
    if (typeof sfx.play === 'function') { if (typeof sfx.has === 'function' && !sfx.has(name)) return; sfx.play(name, o); }
    else if (typeof sfx === 'function') sfx(name, o);
  } catch (e) { /* sound is never load-bearing */ }
};
const hapticOf = (ctx) => (p) => {
  try {
    if (typeof ctx.haptic === 'function') return ctx.haptic(p);
    if (ctx.sfx && typeof ctx.sfx.haptic === 'function') return ctx.sfx.haptic(p);
    if (globalThis.navigator && navigator.vibrate) navigator.vibrate(p);
  } catch (e) { /* no haptics */ }
};
const frame = () => new Promise((r) => (globalThis.requestAnimationFrame ? requestAnimationFrame(() => r()) : setTimeout(r, 16)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function runLevel(ctx = {}) {
  const t0 = Date.now();
  const collected = { stone: 0, cedar: 0, gold: 0, silver: 0, bronze: 0 };
  let U = null, result = null;
  const emit = (type, data) => { try { if (typeof ctx.onEvent === 'function') ctx.onEvent(type, data); } catch (e) { /* the host's problem */ } };
  try {
    if (!globalThis.document) throw new Error('no DOM');
    result = await play(ctx, collected, emit, (u) => { U = u; });
  } catch (e) {
    try { console.warn('[match3]', e); } catch (x) { /* */ }
    result = { won: false, stars: 0, moves: 0, collected, score: 0, ms: 0, quit: true, field: pickField(ctx), level: ctx.level || 1, attempts: 0, error: String(e && e.message || e) };
  } finally {
    try { if (U) U.destroy(); } catch (e) { /* */ }
  }
  result.ms = Date.now() - t0;
  emit('m3close', { result });
  return result;
}

async function play(ctx, collected, emit, setU) {
  const io = saveIO(ctx.save);
  const m3 = io.get();
  const demo = !!ctx.demo;
  const snd = sfxOf(ctx.sfx), buzz = hapticOf(ctx);
  let reduced = false;
  try { reduced = !!(globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* */ }
  let field = pickField(ctx);
  let level = ctx.level > 0 ? ctx.level | 0 : (m3.level[field] || 1);
  const res = { won: false, stars: 0, moves: 0, collected, score: 0, ms: 0, quit: false, field, level, attempts: 0 };
  let onExit = null;
  const U = createUI(ctx.root || document.body, { field, onExit: () => onExit && onExit() });
  setU(U);
  emit('m3open', { field, level });
  let view = null;
  const onResize = () => { try { U.fit(); if (view) view.resize(); } catch (e) { /* */ } };
  // ── land33 ── the phone turned: lay out again by the new aspect — now, and once more when the browser has settled its size
  let turnT = 0;
  const onTurn = () => { onResize(); clearTimeout(turnT); turnT = setTimeout(onResize, 180); };
  globalThis.addEventListener('resize', onResize);
  globalThis.addEventListener('orientationchange', onTurn);
  // ── /land33 ──
  const needOf = () => { const n = ctx.need || {}; const k = Object.keys(n).find((x) => n[x] > 0 && RES_FIELD[x] === field); return k ? { [k]: n[k] } : null; };
  try {
    let showMap = ctx.map !== false && !demo;
    for (let loop = 0; loop < 999; loop++) {
      if (view) { view.destroy(); view = null; }        // the last board stays behind its card until now
      if (showMap) {
        const ch = await mapFlow(U, m3, field, ctx);
        if (ch.quit) { res.quit = true; break; }
        field = ch.play; level = ch.level; showMap = false;
      }
      res.field = field; res.level = level; res.attempts++;
      emit('m3start', { field, level, attempt: res.attempts });
      const r = await attempt({ ctx, U, field, level, demo, reduced, snd, buzz, emit, m3, need: needOf(), pre: { ...collected }, setView: (v) => { view = v; }, setExit: (f) => { onExit = f; } });
      if (r.map) { showMap = true; res.attempts--; continue; }
      if (r.pre) res.attempts--;                         // declined at the start card
      for (const k of Object.keys(r.got)) collected[k] = (collected[k] || 0) + r.got[k];
      for (let k = 0; k < 6; k++) if (r.kinds[k]) { const id = ALBUM_ID[k]; m3.album[id] = (m3.album[id] || 0) + r.kinds[k]; }
      // (wave 7, FUN) the vessel collection: at most ONE card opens at the end of a board, in the album's order, when enough
      // of that vessel was gathered (30, 60, 90 … — albumAt); so the collection is a string of small surprises, not one heap
      const opened = []; m3.told = m3.told || {};
      if (!r.quit || r.used > 0) { const v = VESSEL_CARDS.find((x) => !m3.told[x.id] && (m3.album[x.id] || 0) >= albumAt(x.k)); if (v) { m3.told[v.id] = 1; opened.push(v.id); emit('m3album', { opened }); } }
      res.moves += r.used; res.score = Math.max(res.score, r.score);
      if (r.quit) { res.quit = true; emit('m3quit', { field, level }); io.set(m3); break; }
      if (r.won) {
        res.won = true; res.stars = Math.max(res.stars, r.stars);
        const key = field + ':' + level, b = m3.best[key] || { stars: 0, score: 0 };
        const best = r.score > b.score;
        m3.best[key] = { stars: Math.max(b.stars, r.stars), score: Math.max(b.score, r.score) };
        m3.level[field] = Math.max(m3.level[field] || 1, level + 1);
        delete m3.seen['lose:' + field + ':' + level];
        io.set(m3);
        emit('m3win', { field, level, stars: r.stars, score: r.score, moves: r.used });
        const need = needOf(), main = need && Object.keys(need)[0];
        const left = main ? Math.max(0, need[main] - (collected[main] || 0)) : 0;
        const ch = demo ? (await sleep(1800), 'done') : await U.card('won', { stars: r.stars, score: r.score, best, got: r.got, bonus: r.bonus, res: r.main, needLeft: left, next: level + 1, album: m3.album, told: m3.told, opened, gathered: r.kinds });
        if (ch === 'next') { level++; continue; }
        break;
      }
      if (!r.quit) m3.seen['lose:' + field + ':' + level] = (m3.seen['lose:' + field + ':' + level] || 0) + 1;
      io.set(m3);
      emit('m3lose', { field, level, near: r.near, left: r.left });
      const ch = demo ? 'done' : await U.card('lost', { near: r.near, left: r.left, got: r.got, album: m3.album, told: m3.told, opened, gathered: r.kinds });
      if (ch === 'retry') continue;
      break;
    }
  } finally {
    globalThis.removeEventListener('resize', onResize);
    globalThis.removeEventListener('orientationchange', onTurn); clearTimeout(turnT);   // (land33)
    if (view) view.destroy();
  }
  if (!collected.wstone) delete collected.wstone;
  return res;
}

async function mapFlow(U, m3, field, ctx) {
  let f = field;
  for (;;) {
    const fields = {};
    for (const id of FIELD_IDS) {
      const best = {};
      for (const k of Object.keys(m3.best)) { const [ff, L] = k.split(':'); if (ff === id) best[+L] = m3.best[k]; }
      fields[id] = { cur: m3.level[id] || 1, best };
    }
    const ch = await U.card('map', { field: f, fields, needField: ctx.need ? pickField({ need: ctx.need }) : null, hardOf: isHard });
    if (ch.album) { await U.card('album', { album: m3.album, told: m3.told, vessels: ctx.vessels, field: ch.field }); f = ch.field; continue; }
    return ch;
  }
}

/* one attempt at a level: resolves { won, quit, map, stars, score, used, got, kinds, near, left, bonus, main } */
async function attempt(a) {
  const { ctx, U, field, level, demo, reduced, snd, buzz, emit } = a;
  const spec = levelSpec(field, level, { need: ctx.need, seed: ctx.seed != null && level === (ctx.level || level) ? ctx.seed : undefined, round: ctx.round | 0 });   // (FUN12: the quarry's cycle — the board back in a longer round)
  const gs = demo ? 0.45 : ctx.goalScale > 0 && ctx.goalScale < 1 ? ctx.goalScale : 1;          // goalScale: tests only
  if (gs < 1) spec.goals = spec.goals.map((g) => ({ t: g.t, n: Math.max(3, Math.round(g.n * gs)) }));
  const s = E.createBoard(spec, spec.seed);
  // mercy without money (FUN): after two losses on this level the next try starts with a wedge on the board
  const gift = !demo && (a.m3.seen['lose:' + field + ':' + level] || 0) >= 2;
  if (gift) {
    const mid = (s.R >> 1) * s.C + (s.C >> 1);
    for (let d = 0; d < s.N; d++) { const i = (mid + d) % s.N; if (s.k[i] >= 0 && s.k[i] < 6 && !s.lk[i] && !s.sp[i]) { s.sp[i] = E.AREA; break; } }
  }
  // (wave 7, FUN) the first board of each field: a tool one swap away, so the first special comes in the first seconds
  let planted = null;
  if (!gift && !demo && level === 1 && !a.m3.best[field + ':1'] && !a.m3.seen['lose:' + field + ':1']) { try { planted = E.plantFour(s); } catch (e) { /* the board stays as dealt */ } }
  const main = spec.goals[0].t;
  const dailyOn = ctx.daily && ctx.daily.field === field && ctx.daily.mult > 1 ? Math.min(3, +ctx.daily.mult) : 0;
  const whole = spec.obj && spec.obj.kind === 'wstone';
  const hintTxt = whole ? 'אבנים שלמות נאספות רק בהתאמה לידן — שום כלי ברזל לא נוגע בהן (מדות ג, ד; טיוטה).' : hintOf(field, level);
  U.setup({ field, level, R: s.R, C: s.C, moves: s.moves, goals: spec.goals, stars: spec.stars, hint: hintTxt, need: a.need, illus: FIELDS[field].illus, place: whole ? 'בקעת בית כרם' : '' });
  await frame();
  const kinds = [0, 0, 0, 0, 0, 0];
  // the need pill counts what this call already gathered (earlier boards, the star bonus) plus this board
  const needGot = (res, extra = 0) => { const o = {}; for (const k of Object.keys(a.need || {})) o[k] = ((a.pre && a.pre[k]) || 0) + (s.t[k] || 0) + (k === res ? extra : 0); return o; };
  U.need(a.need, needGot());
  let quit = false, busy = false, done = null, idleT = 0, fin = false, auto = demo;
  const finish = (r) => { if (done) { const d = done; done = null; clearTimeout(idleT); d(r); } };
  const view = createView({
    root: U.el, hit: U.hit, s, field, reduced, speed: demo ? 0.5 : 1,
    target: (k) => U.target(k),
    onFly: (r, n) => { U.add(r, n); U.need(a.need, needGot()); },
    onInput: (x, y) => { if (!auto) move(x, y); },
    // (wave 8B) the autopilot plays only in demo or a test, and a real touch takes the board over at once, at the player's pace
    onTouch: () => { if (!auto) return; auto = false; view.setSpeed(1); U.hint('הלוח בידיים שלך — החלף שני כלים סמוכים'); emit('m3human', { field, level }); },
  });
  a.setView(view);
  view.lock(true);
  if (!demo) {
    const ch = await U.card('start', { field, level, place: whole ? 'בקעת בית כרם' : '', moves: s.moves, goals: spec.goals, hint: hintTxt, hard: spec.hard, illus: FIELDS[field].illus, canMap: true, gift, diff: difficulty(level), daily: dailyOn ? { res: main, mult: dailyOn } : null, round: spec.round | 0 });
    if (ch === 'map') return { map: true };
    if (ch === 'quit') return { quit: true, pre: true, won: false, score: 0, used: 0, got: {}, kinds };
  }
  snd('m3start');
  view.lock(false);
  const hooks = {
    onClear(st) {
      let n = 0;
      for (const g of st.gone) if (g[0] && g[2] >= 0 && g[2] < 6) { n++; kinds[g[2]]++; }
      if (n) { snd(st.c > 1 ? 'm3cascade' : 'm3match', { n: Math.min(5, n), combo: st.c, step: st.c }); if (st.c <= 2) snd('m3rise'); emit('m3match', { n, cascade: st.c }); }
      for (const m of st.made) { const kind = m[2] === E.SLIGHT ? 'color' : m[2] === E.AREA ? 'bomb' : 'line'; snd('m3special', { kind }); emit('m3special', { kind }); if (st.made.length <= 2 && !fin) view.label(m[1], SPECIAL_HE[m[2]] || ''); }
      if (st.blasts.length) {
        const b = st.blasts[0], kind = b[1] === E.SLIGHT ? 'color' : b[1] === E.AREA ? 'bomb' : 'line';
        snd('m3blast', { kind }); buzz(st.blasts.length > 1 ? [12, 30, 12] : 12);
        if (b[1] === 5 || b[1] === 6 || b[3] === 99) emit('m3combo', { kinds: st.blasts.map((x) => x[1]) });
      }
      for (const k of Object.keys(st.res)) emit('m3collect', { res: k, n: st.res[k] });
    },
    onLand() { snd('m3land'); },
  };
  const truth = () => { for (const g of spec.goals) U.set(g.t, s.t[g.t] || 0); for (const k of RES) if (s.t[k] && !spec.goals.some((g) => g.t === k)) U.set(k, s.t[k]); U.score(s.score, E.goalsMet(s)); U.need(a.need, needGot()); };
  const idle = () => {
    clearTimeout(idleT);
    view.hint(null);
    // (wave 8B) a field's first board: the first two hints come with a hand that shows the swipe itself
    idleT = setTimeout(() => { if (!busy) view.hint(planted && s.used === 0 ? planted : E.hint(s), { hand: !auto && level === 1 && s.used < 2 }); }, level <= 2 && s.used < 2 ? 900 : 5000);
  };
  async function move(x, y) {
    if (busy || quit || !done) return;
    busy = true; view.lock(true); view.hint(null); clearTimeout(idleT);
    try {
      const ok = E.isValidSwap(s, x, y);
      snd('m3swap');
      await view.swap(x, y, ok);
      if (!ok) { snd('m3bad'); buzz(8); return; }
      const r = E.resolve(s, x, y, true);
      U.moves(s.moves);
      await view.play(r.steps, hooks);
      view.sync(s);
      truth();
      if (s.moves === 5) snd('m3moves');
      if (E.goalsMet(s)) return await win();
      if (s.moves <= 0) return lose();
    } finally {
      busy = false;
      if (done && !quit) { view.lock(false); idle(); }
    }
  }
  async function win() {
    view.lock(true);
    snd('m3win'); buzz([20, 40, 20]);
    view.praise(s.moves > 0 ? 'הבונים מברכים!' : 'הצלחתם!');
    view.celebrate();
    if (s.moves > 0) U.hint('כל מהלך שנשאר הופך לכלי עבודה — עוד חומר לבנייה!');
    await sleep(700 * (demo ? 0.5 : 1));
    view.setSpeed(demo ? 0.35 : 0.6);
    fin = true;
    const steps = E.finale(s, true, 10);
    for (const st of steps) { await view.play([st], hooks); U.moves(Math.max(0, s.moves)); }
    view.sync(s);
    truth();
    const stars = s.score >= spec.stars[2] ? 3 : s.score >= spec.stars[1] ? 2 : 1;
    snd('m3stars', { n: stars });
    const got = gotOf(), res = FIELDS[field].res === main ? main : main;
    const mult = ctx.daily && ctx.daily.field === field && ctx.daily.mult > 1 ? Math.min(3, +ctx.daily.mult) : 1;
    const bonus = Math.round((got[res] || 0) * (STAR_BONUS[stars] + (mult - 1)));
    if (bonus && got[res] != null) got[res] += bonus;
    U.need(a.need, needGot(res, bonus));
    await sleep(500);
    finish({ won: true, stars, score: s.score, used: s.used, got, kinds, bonus, main: res });
  }
  function lose() {
    view.lock(true);
    snd('m3fail');
    const left = E.goalLeft(s);
    const need = left.reduce((q, g) => q + g.n, 0), rest = left.reduce((q, g) => q + g.left, 0);
    finish({ won: false, score: s.score, used: s.used, got: gotOf(), kinds, near: rest <= Math.max(4, need * 0.2), left });
  }
  function gotOf() {
    const g = {};
    for (const k of RES) g[k] = s.t[k] || 0;
    if (s.t.wstone) g.wstone = s.t.wstone;
    return g;
  }
  // ── ux24 ── the gold "חזרה לבנייה" once enough is gathered: the board ends as a quit with what it gathered (credited live), no card
  if (typeof U.onBack === 'function') U.onBack(demo ? null : () => { if (!done || quit) return; quit = true; view.lock(true); finish({ won: false, quit: true, back: true, score: s.score, used: s.used, got: gotOf(), kinds }); });
  U.need(a.need, needGot());
  // ── /ux24 ──
  a.setExit(async () => {
    if (!done || quit) return;
    const ch = await U.card('exit');
    if (ch === 'quit' && done) { quit = true; view.lock(true); finish({ won: false, quit: true, score: s.score, used: s.used, got: gotOf(), kinds }); }
  });
  const p = new Promise((r) => { done = r; });
  if (ctx.test) globalThis.__M3_TEST = { s, view, spec, move: (x, y) => move(x, y), hint: () => E.hint(s) };
  truth();
  idle();
  if (demo) (async () => {
    let rs = E.hashSeed('demo', field, level) || 1;
    const rnd = () => { rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0; return rs / 4294967296; };
    await sleep(500);
    for (let q = 0; q < 200 && done && !busy && auto; q++) {
      const m = E.botMove(s, 1, rnd);
      if (!m) break;
      view.hint(m); await sleep(260);
      if (!auto) break;
      await move(m[0], m[1]);
      await sleep(180);
    }
  })();
  const r = await p;
  a.setExit(null);
  return r;
}

/* BUILD finds us without an import (bus/BUILD.md): one harmless line */
try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.match3 = { runLevel, levelInfo, FIELDS, pickField }; } catch (e) { /* */ }
