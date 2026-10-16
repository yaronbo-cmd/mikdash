/* ─────────────────────────────────────────────────────────────────────────────
 * games/cycle.js — (FUN12, wave 12) the quarry's cycle. Every "▶ המחצבה" takes the next game of a round: the board (MATCH3), then
 * other games that fit the work, then the board again, longer and harder, in a round that grows (the owner, 29.9 21:01: "צריך
 * לגוון עם משחק אחר ואח"כ לחזור לקנדי קראש הקשה יותר בסבב יותר ארוך של משחקים").
 *   round k: the board, then gapOf(k) = min(2 + k, 4) others, rotating הקלע של דוד → חמש אבנים (GAMES13) → נדבך על נדבך →
 *   חציבת גוש (never twice in a row). The board of round k ≥ 1 is its next ladder level played long (match3/levels.js `round`: more moves, a longer goal).
 *   The place is saved in G.games.cycle = { k, i, j, n, last } (i: 0 = the board, 1… the others; j: the others played so far).
 *   plan(G, a) → { game, name, round, run(ctx, host), done(r) } | null   index.js playLevel (`// ── fun12 ──`) routes through it
 *   pill(G, a) → { game, name, mult } | null                          index.js boardPays: the pill names the next game
 * Every game answers in the board's shape { won, stars, level, collected:{stone}, quit, attempts } and reports its stones live
 * (onEvent('m3collect', {res, n})), so the host's one accounting path — the live meter, grantLevel, starBonus, m3Won/m3Lost —
 * pays them all. The pay: about what the board brings at its level (the pill's "כ־N"), ×0.8 … ×1.2 by the result; a quit keeps
 * what was gathered. Nothing random is sold, nothing is lost; a declined start does not move the cycle.
 * ──────────────────────────────────────────────────────────────────────────── */
import { createShell, factHTML, esc, reducedMotion, sleep, injectCSS } from './shell.js';
import * as STACK from './stack.js';
import * as SLING from './sling.js';
import * as KNUCKLE from './knuckle.js';   // ── games13 ── (wave 13) חמש אבנים joins the quarry's round: a game of stones a boy of that time played
import { ICON } from '../match3/art.js';

export const OTHERS = ['sling', 'knuckle', 'stack', 'quarry'];
export const NAMES = { board: 'המחצבה', sling: 'הקלע של דוד', stack: 'נדבך על נדבך', quarry: 'חציבת גוש', knuckle: 'חמש אבנים' };
export const SHORT = { board: 'הלוח', sling: 'הקלע', stack: 'נדבכים', quarry: 'חציבה', knuckle: 'חמש אבנים' };
export const ROUND_MAX = 2;                       // the board grows for two rounds (levels.js ROUND_MOVES each), then stays
export const EXTRA = 0.5;                         // a second (third …) round of the same game in one visit pays half
export const gapOf = (k) => Math.min(2 + Math.max(0, k | 0), 4);
/* why each game belongs to the quarry's work (the intro card; the facts with their sources come at the end) */
export const WHY = {
  sling: 'דוד הקדיש את שלל מלחמותיו לבית ה׳ (שמואל ב ח, יא; דברי הימים א כו, כז). הפל את המגינים — ואבני המגדלים הולכות לבנייה.',
  stack: 'אבני המחצבה עולות לחומה: נדבך על נדבך. כל נדבך ישר — עוד אבנים לבנייה.',
  quarry: 'חוצבים גוש מן הסלע: חריצים סביבו, ואז יתדות — עד שהוא נבקע.',
  knuckle: 'בין עבודה לעבודה שיחקו הילדים בעצמות קטנות — "חמש אבנים". כל סבב שתעבור מביא אבנים לבנייה.',
};

const int = (v) => (Number.isFinite(+v) ? Math.max(0, Math.floor(+v)) : 0);
/** the cycle's place in the save (made on first use; a save that already played boards starts with another game) */
export function cycleOf(G) {
  if (!G || typeof G !== 'object') return { k: 0, i: 0, j: 0, n: 0, last: '' };
  if (!G.games || typeof G.games !== 'object' || Array.isArray(G.games)) G.games = {};
  let c = G.games.cycle;
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    const played = int(G.stats && G.stats.levels) > 0 || int(G.m3 && G.m3.level && G.m3.level.quarry) > 1;
    c = G.games.cycle = { k: 0, i: played ? 1 : 0, j: 0, n: 0, last: '' };
  }
  c.k = int(c.k); c.j = int(c.j); c.n = int(c.n); c.i = Math.min(int(c.i), gapOf(c.k));
  if (typeof c.last !== 'string') c.last = '';
  return c;
}
const at = (c) => (c.i === 0 ? 'board' : OTHERS[c.j % OTHERS.length]);
function step(c) {
  if (c.i === 0) c.i = 1;
  else { c.j++; c.i++; if (c.i > gapOf(c.k)) { c.i = 0; c.k++; } }
  c.n++;
}
/** the game the next quarry action takes */
export const peek = (G) => at(cycleOf(G));
/** the games ahead, in order (tests, the producer): ahead(G, 8) → ['sling', 'stack', 'board', …] */
export function ahead(G, n = 8) { const c = { ...cycleOf(G) }, out = []; for (let x = 0; x < n; x++) { out.push(at(c)); step(c); } return out; }
/** the cycle moves on after a played action → the game that was played */
export function advance(G) { const c = cycleOf(G), was = at(c); step(c); c.last = was; return was; }
/** the board's round: 0 the first time, then 1, 2 when it comes back (longer and harder) */
export const roundOf = (G) => Math.min(ROUND_MAX, cycleOf(G).k);
/** the cycle takes the quarry's stone actions: the pill's and the site's (a stone need), the meter's "▶ שחק" and a tap on the
    quarry (no need: stone) — not the altar's whole stones (the board's Beit Kerem), not silver alone, not the demo reel */
export function applies(G, a) {
  if (!G || !a || a.kind !== 'play' || (a.field || 'quarry') !== 'quarry' || (G.demo && G.story && G.story.reel)) return false;   // (supervisor, 30.9: the demo is the owner's testing mode; only the investor reel keeps the board alone)
  const n = a.need || {}, any = Object.keys(n).some((k) => n[k] > 0);
  return !(n.wstone > 0) && (!any || n.stone > 0);
}
/** the pill: which game the next action opens, and the board's pay multiplier when it comes back longer */
export function pill(G, a) {
  if (!applies(G, a)) return null;
  const game = (G.ftue | 0) < 99 ? 'board' : peek(G);
  return { game, name: NAMES[game], mult: game === 'board' ? 1 + 0.11 * roundOf(G) : 1 };
}

/** index.js playLevel: the plan for this action → { game, name, round, run(ctx, host), done(r) } | null */
export function plan(G, a) {
  if (!applies(G, a)) return null;
  const c = cycleOf(G), real = at(c);
  const game = (G.ftue | 0) < 99 ? 'board' : real, forced = game !== real;   // (the first-time flow teaches the board; its place waits)
  const round = game === 'board' && !forced ? roundOf(G) : 0;
  return {
    game, name: NAMES[game], round,
    /** ctx: the board's own ctx (root, need, sfx, haptic, demo, onEvent …); host: { board: runLevel, pay, runMinigame } */
    run(ctx = {}, host = {}) {
      try { if (typeof ctx.onEvent === 'function') ctx.onEvent('cycle', { game, k: c.k, i: c.i, round, next: ahead(G, 2)[1] || '' }); } catch (e) { /* the log is optional */ }
      if (game === 'board') return typeof host.board === 'function' ? host.board(round ? { ...ctx, round } : ctx) : Promise.resolve(null);
      return runOther(game, ctx, host, G);
    },
    /** after the action: the cycle moves on (not when the start was declined, nor for the first-time flow's board) */
    done(r) {
      if (forced) return null;
      if (!r || typeof r !== 'object' || (r.quit && !(r.attempts > 0))) return null;
      return advance(G);
    },
  };
}

/* ───────── the other games in the quarry's frame ───────── */
const CSS = `
.g10-cy-strip{display:flex;justify-content:center;flex-wrap:wrap;gap:4px;margin:0 0 6px}
.g10-cy-strip span{font:700 11.5px/1.9 "Heebo",sans-serif;padding:0 8px;border-radius:999px;background:rgba(200,150,74,.18);color:#6E4200}
.g10-cy-strip span.on{background:linear-gradient(#FFD569,#DF951A);color:#452300}
.g10-cy-strip span.done{opacity:.55}
.g10-cy-pay{font:700 14px/1.4 "Heebo",sans-serif;color:#6E4200;margin:4px 0 0}
.g10-stars{font:900 30px/1 "Frank Ruhl Libre",serif;letter-spacing:4px;color:#D8AB58;margin:2px 0 4px}
.g10-stars b{color:#F2A516;text-shadow:0 2px 0 #94580C}
`;
const STONE_HE = (n) => (n === 1 ? 'אבן אחת' : `${n} אבנים`);
/** this round's games from its board: [{ g, on (the one now), done }] (the intro's strip) */
export function roundGames(G) {
  const c = cycleOf(G), list = [];
  const s = { ...c, i: 0, j: Math.max(0, c.j - Math.max(0, c.i - 1)) };   // the round from its board (N73: and from its first other game)
  for (let x = 0; x <= gapOf(c.k); x++) { list.push({ g: at(s), on: x === c.i, done: x < c.i }); step(s); }
  return list;
}
function strip(G, game) {
  const list = roundGames(G);
  list.push({ g: 'board', next: true });
  return `<div class="g10-cy-strip" aria-label="הסבב במחצבה">${list.map((o) => `<span class="${o.on ? 'on' : o.done ? 'done' : ''}">${o.done ? '✓ ' : ''}${esc(o.next ? 'הלוח, ארוך יותר' : SHORT[o.g])}</span>`).join('')}</div>`;
}
function payLine(add) {
  return add > 0 ? `<div class="g10-pay" data-pay="stone:${add}"><span class="g10-ic" data-ic="stone"></span>+${STONE_HE(add)} לבנייה</div>` : '';
}
function paintIcons(root) {
  for (const s of root.querySelectorAll('.g10-ic[data-ic]')) { try { const cv = ICON(s.dataset.ic, 24); const im = document.createElement('canvas'); im.width = cv.width; im.height = cv.height; im.style.cssText = 'width:24px;height:24px'; im.getContext('2d').drawImage(cv, 0, 0); s.replaceWith(im); } catch (e) { s.remove(); } }
}
const starsHTML = (n) => `<div class="g10-stars" aria-label="${n} כוכבים מתוך 3">${[1, 2, 3].map((q) => (q <= n ? '<b>★</b>' : '☆')).join('')}</div>`;
/* the facts in rotation per game (G.games.fx, the hub's own counter) */
function nextFact(G, id, list) {
  if (!list || !list.length) return null;
  const s = G && G.games ? G.games : {};
  if (!s.fx || typeof s.fx !== 'object') s.fx = {};
  const i = (s.fx[id] | 0) % list.length; s.fx[id] = i + 1;
  return list[i];
}

async function runOther(game, ctx, host, G) {
  const T = Math.max(10, Math.round(+host.pay || 0) || 40);   // the pill's promise: what the board would bring now
  const emit = (t, d) => { try { if (typeof ctx.onEvent === 'function') ctx.onEvent(t, d); } catch (e) { /* the host's */ } };
  const res = { won: false, stars: 0, level: 0, collected: { stone: 0 }, quit: false, attempts: 0, game, score: 0 };
  const live = (n) => { n = Math.max(0, Math.round(n)); if (!n) return 0; res.collected.stone += n; emit('m3collect', { res: 'stone', n, game }); return n; };
  // the board's silver coins: a game played for a step that also lacks silver brings some, as a board would (≤ a quarter of T)
  const silver = () => { const n = Math.min(Math.max(0, +(ctx.need && ctx.need.silver) || 0), Math.round(T * 0.25)); if (n > 0 && res.attempts > 0 && !res.collected.silver) { res.collected.silver = n; emit('m3collect', { res: 'silver', n, game }); } };
  const settle = (want, got) => live(Math.max(0, Math.round(want) - got));   // the attempt's pay, what its play already brought taken off
  const save = () => { try { if (typeof host.save === 'function') host.save(); } catch (e) { /* */ } };
  // the test runs' boards play themselves (__M3_AUTO): so do these, in a moment
  if (ctx.demo) {
    emit('m3open', { field: 'quarry', game });
    await sleep(350);
    live(T); res.won = true; res.stars = 2; res.attempts = 1; res.level = 1; silver();
    emit('m3close', { game, result: res });
    return res;
  }
  if (game === 'quarry') {
    const rm = host.runMinigame;
    if (typeof rm !== 'function') return null;   // (no precision games in this build: the host's card)
    const lv = Math.min(4, 1 + roundOf(G));
    const r = await rm('quarry', { root: ctx.root, level: lv, seed: 7000 + cycleOf(G).n, demo: false, onEvent: ctx.onEvent, sfx: ctx.sfx, haptic: ctx.haptic, reduced: reducedMotion(),
      kicker: 'המחצבה · חציבת גוש', lead: 'חוצבים גוש מן הסלע: הקש כשמד הכוח מגיע לפס הזהוב' });
    const q = r && typeof r === 'object' ? Math.max(0, Math.min(1, +r.quality || 0)) : 0.6;
    res.attempts = 1; res.level = lv; res.won = !!r && !r.skipped && q >= 0.45;
    res.stars = r && !r.skipped ? Math.max(res.won ? 1 : 0, Math.min(3, r.tier | 0)) : 1;
    settle(T * (0.8 + 0.4 * q), 0); silver();
    return res;
  }
  // the sling and the stack: the games' full-screen frame (the board's warm look)
  injectCSS('g10-cy-css', CSS);
  const S = createShell(ctx.root || document.body, { sfx: sfxOf(ctx.sfx) });
  S.el.classList.add('g10-cycle'); S.el.dataset.game = game;
  const gm = game === 'sling' ? SLING.GAME : game === 'knuckle' ? KNUCKLE.GAME : STACK.GAME;
  const reduced = reducedMotion();
  try {
    const lis = gm.how.map((l, i) => `<li data-n="${i + 1}">${l}</li>`).join('');
    const q = gm.quote ? `<p class="g10-q">״${esc(gm.quote.he)}״ <span class="g10-src" style="display:inline">(${esc(gm.quote.src)}) <span class="g10-tag">טיוטה</span></span></p>` : '';
    const lvTxt = game === 'sling' ? ` · שלב ${SLING.levelOf(G)} מתוך ${SLING.LEVELS.length}` : '';
    const intro = S.card(`${strip(G, game)}<canvas class="g10-hic" width="64" height="64" aria-hidden="true"></canvas><h2>${esc(gm.title)}${esc(lvTxt)}</h2><p style="font-size:15px">${esc(WHY[game])}</p><ul class="g10-how">${lis}</ul>${q}<p class="g10-cy-pay">כ־${esc(STONE_HE(T))} לבנייה · גם בלי לנצח</p>`,
      [{ value: 'go', label: 'התחל', gold: true }, { value: 'back', label: 'חזרה לבנייה' }], { cls: 'g10-howto g10-cy-intro' });
    try { const cv = S.el.querySelector('.g10-cy-intro .g10-hic'), dpr = Math.min(2, globalThis.devicePixelRatio || 1); cv.width = cv.height = Math.round(56 * dpr); const g = cv.getContext('2d'); g.scale(dpr, dpr); gm.icon(g, 56); } catch (e) { /* decoration */ }
    const v = await intro;
    if (v !== 'go') { res.quit = true; return res; }
    emit('m3open', { field: 'quarry', game });
    for (let guard = 0; guard < 40; guard++) {
      res.attempts++;
      // the first round pays what the board would; a round more in the same visit pays half (a short game is not a stone farm)
      const K = res.attempts === 1 ? 1 : EXTRA;
      let got = 0;
      if (game === 'sling') {
        const lv = SLING.levelOf(G), nT = SLING.targetsOf(lv);
        const r = await SLING.GAME.run(S, { sfx: sfxOf(ctx.sfx), reduced, level: lv, onDown: () => { const n = live((T * K * 0.6) / Math.max(1, nT)); got += n; return n; } });
        if (!r || r.quit) { res.quit = true; break; }
        res.level = lv; res.score = Math.max(res.score, r.score | 0);
        if (r.won) { res.won = true; res.stars = Math.max(res.stars, r.stars | 0); }
        SLING.record(G, lv, r); save();
        const add = settle(T * K * (r.won ? 0.9 + 0.1 * (r.stars | 0) : 0.6 + 0.2 * (r.down / Math.max(1, r.targets))), got) + got;
        const fact = nextFact(G, 'sling', SLING.FACTS);
        const last = lv === SLING.LEVELS.length;
        const [h2, p] = r.won ? (r.goliath ? [SLING.winTitle(lv), '״וַתִּטְבַּע הָאֶבֶן בְּמִצְחוֹ וַיִּפֹּל עַל פָּנָיו אָרְצָה״ (שמואל א יז, מט; טיוטה).'] : [SLING.winTitle(lv), `שלב ${lv}: ${r.used === 1 ? 'באבן אחת' : `ב־${r.used} אבנים`}.`])
          : [r.down ? 'כמעט!' : 'עוד ניסיון?', r.down ? `נפלו ${r.down} מתוך ${r.targets}. באבנים הבאות — עוד קצת.` : 'חמש האבנים עפו. נסה למשוך יותר או פחות.'];
        const btns = r.won ? [{ value: 'next', label: last ? 'מהתחלה: שלב 1' : `לשלב ${lv + 1}`, gold: true }, { value: 'close', label: 'חזרה לבנייה' }]
          : [{ value: 'again', label: 'עוד פעם', gold: true }, { value: 'close', label: 'חזרה לבנייה' }];
        const pv = S.card(`${r.won ? starsHTML(r.stars | 0) : ''}<h2>${esc(h2)}</h2><p>${esc(p)}</p>${payLine(add)}${factHTML(fact)}`, btns, { cls: 'g10-result g10-sl-res' });
        paintIcons(S.el);
        const ch = await pv;
        if (ch === 'close') break;
        continue;
      }
      if (game === 'knuckle') {   // ── games13 ── חמש אבנים: each round passed (ones · twos · threes · fours) brings stones live; the fewer misses, the more
        const r = await KNUCKLE.GAME.run(S, { duel: false, sfx: sfxOf(ctx.sfx), reduced, onRound: () => { if (got < T * K * 0.7) got += live(Math.min(T * K * 0.7 - got, (T * K * 0.7) / 4)); } });
        if (!r || r.quit) { res.quit = true; break; }
        const m = (r.misses && r.misses[0]) | 0, stars = m === 0 ? 3 : m <= 3 ? 2 : 1;
        res.won = true; res.level = Math.max(res.level, 4); res.stars = Math.max(res.stars, stars);
        const add = settle(T * K * (0.8 + 0.4 * Math.max(0, 1 - m / 8)), got) + got;
        const fact = nextFact(G, 'knuckle', KNUCKLE.FACTS);
        const [h2, p] = KNUCKLE.GAME.words(false, r);
        const pv = S.card(`${starsHTML(stars)}<h2>${esc(h2)}</h2><p>${esc(p)}</p>${payLine(add)}${factHTML(fact)}`, [{ value: 'again', label: 'עוד פעם', gold: true }, { value: 'close', label: 'חזרה לבנייה' }], { cls: 'g10-result' });
        paintIcons(S.el);
        if ((await pv) === 'close') break;
        continue;
      }   // ── /games13 ──
      // נדבך על נדבך: every course that stays brings stones; the wall's height is the pay
      const r = await STACK.GAME.run(S, { duel: false, sfx: sfxOf(ctx.sfx), reduced, onCourse: (n) => { if (got < T * K * 0.7) got += live(Math.min(T * K * 0.7 - got, (T * K * 0.7) / 20)); } });
      if (!r || r.quit) { res.quit = true; break; }
      const n = (r.courses && r.courses[0]) | 0, pf = (r.perfect && r.perfect[0]) | 0;
      const stars = n >= 15 ? 3 : n >= 9 ? 2 : n >= 3 ? 1 : 0;
      res.level = Math.max(res.level, n); res.stars = Math.max(res.stars, stars); if (stars) res.won = true;
      const add = settle(T * K * (0.8 + 0.4 * Math.min(1, n / 20)), got) + got;
      const fact = nextFact(G, 'stack', STACK.FACTS);
      const nd = n === 1 ? 'נדבך אחד' : `${n} נדבכים`, nx = n < 3 ? 3 : n < 9 ? 9 : n < 15 ? 15 : 0;   // (the stars: 3 · 9 · 15 courses)
      const line = !n ? 'האבן הראשונה החטיאה את היסוד — עוד פעם?'
        : `${pf ? `${pf === 1 ? 'אחד מדויק' : `${pf} מדויקים`} · ` : ''}${nx ? `לכוכב הבא: ${nx} נדבכים` : 'שלושה כוכבים — חומה של אומן!'}`;
      const pv = S.card(`${stars ? starsHTML(stars) : ''}<h2>${n ? `בנית ${esc(nd)}!` : 'כמעט!'}</h2><p>${esc(line)}</p>${payLine(add)}${factHTML(fact)}`,
        [{ value: 'again', label: 'עוד פעם', gold: true }, { value: 'close', label: 'חזרה לבנייה' }], { cls: 'g10-result' });
      paintIcons(S.el);
      if ((await pv) === 'close') break;
    }
    silver();
    emit('m3close', { game, result: res });
    return res;
  } finally {
    S.destroy();
  }
}
const sfxOf = (k) => (name, p) => {
  try {
    if (!k) return;
    if (typeof k.play === 'function') { if (typeof k.has === 'function' && !k.has(name)) return; k.play(name, p); } else if (typeof k === 'function') k(name, p);
  } catch (e) { /* sound is never load-bearing */ }
};
