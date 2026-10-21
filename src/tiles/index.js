/* ─────────────────────────────────────────────────────────────────────────────
 * tiles/index.js — "זיכרון המקדש": the Temple memory tile-flip (a self-contained mini-game module).
 *
 *   const r = await runTiles({ root, level, seed, onEvent, sfx, haptic, save, test });
 *   // r = { won, stars, pairs, misses, ms, perutot, quit }   (perutot: all the rounds of this call; the rest: the last round)
 *
 * Never throws; the promise always resolves (an error resolves { quit:true, error }). The X resolves quit:true.
 * The clock is kind: running out is "נגמר הזמן — נסו שוב" with a free retry. Nothing is ever bought.
 * Events (onEvent(type, data)): tlopen · tlstart · tlflip · tlmatch · tlmiss · tlhint · tlshuffle · tlundo · tlwin · tllose · tlquit · tlclose.
 * Sounds (sfx.play(name)): tlstart · tlflip · tlmatch · tlstreak · tlmiss · tlhint · tlshuffle · tlundo · tlwin · tlstars · tllose — all optional.
 * save (an object, or {get,set}): { level, best:{ [level]: { stars, perutot } }, perutot } — the host keeps it.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as E from './engine.js';
import { createUI } from './ui.js';

export { deal, flip, settle, undo, hint, shuffle, isWon, stars, gain, timeLimit, gridOf, connectedOf, hashSeed, PICS, PIC_HE, LEVELS, MAX_LEVEL } from './engine.js';
export { svg, pic, PIC_IDS, DEFS, ROSETTE, COIN } from './art.js';

const MISS_MS = 700, FLIP_MS = 460, FW_MS = 2600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sfxOf = (sfx) => (name, o) => {
  try {
    if (!sfx) return;
    if (typeof sfx.play === 'function') { if (typeof sfx.has === 'function' && !sfx.has(name)) return; sfx.play(name, o); }
    else if (typeof sfx === 'function') sfx(name, o);
  } catch (e) { /* sound is never load-bearing */ }
};
const hapticOf = (ctx) => (ms) => {
  try {
    if (typeof ctx.haptic === 'function') return ctx.haptic(ms);
    if (ctx.sfx && typeof ctx.sfx.haptic === 'function') return ctx.sfx.haptic(ms);
    if (globalThis.navigator && typeof navigator.vibrate === 'function') navigator.vibrate(ms);
  } catch (e) { /* no haptics */ }
};
const defSave = () => ({ level: 1, best: {}, perutot: 0 });
function norm(v) {
  if (!v || typeof v !== 'object') return defSave();
  if (!(v.level >= 1)) v.level = 1;
  if (!v.best || typeof v.best !== 'object') v.best = {};
  if (!(v.perutot >= 0)) v.perutot = 0;
  return v;
}
function saveIO(save) {
  return {
    get() { try { return norm(save && typeof save.get === 'function' ? save.get() : save); } catch (e) { return defSave(); } },
    set(d) { try { if (save && typeof save.set === 'function') save.set(d); else if (save && typeof save === 'object' && save !== d) Object.assign(save, d); } catch (e) { /* the host keeps its save */ } },
  };
}

export async function runTiles(ctx = {}) {
  const out = { won: false, stars: 0, pairs: 0, misses: 0, ms: 0, perutot: 0, quit: false };
  let U = null;
  try {
    return await run(ctx, out, (u) => { U = u; });
  } catch (e) {
    try { if (U) U.destroy(); } catch (e2) { /* */ }
    return Object.assign(out, { quit: true, error: String(e && e.message || e) });
  }
}

async function run(ctx, out, setU) {
  const snd = sfxOf(ctx.sfx), buzz = hapticOf(ctx), emit = (t, d) => { try { if (typeof ctx.onEvent === 'function') ctx.onEvent(t, d); } catch (e) { /* */ } };
  const io = saveIO(ctx.save), sv = io.get();
  let level = Math.max(1, (ctx.level | 0) || sv.level || 1);
  let s = null, attempt = 0, exitAsk = false, playing = false, busy = false, pausedAt = 0, t0 = 0, paused = 0, finish = null;
  const U = createUI(ctx.root, {
    onTap: (i) => tap(i),
    onHint: () => doHint(),
    onShuffle: () => doShuffle(),
    onUndo: () => doUndo(),
    onExit: () => askExit(),
  });
  setU(U);
  emit('tlopen', { level });
  const elapsed = () => (playing ? (pausedAt ? pausedAt : Date.now()) - t0 - paused : 0);
  const pause = () => { if (playing && !pausedAt) pausedAt = Date.now(); };
  const resume = () => { if (pausedAt) { paused += Date.now() - pausedAt; pausedAt = 0; } };
  const end = (how) => { if (finish) { const f = finish; finish = null; f(how); } };

  async function tap(i) {
    if (!playing || busy || pausedAt) return;
    const r = E.flip(s, i);
    if (r.ev === 'noop') return;
    s = r.s; U.sync(s); snd('tlflip'); buzz(8); emit('tlflip', { i });
    if (r.ev === 'match') {
      busy = true;
      await sleep(FLIP_MS * 0.7);
      U.match(r.a, r.b, r.gain, r.streak);
      snd(r.streak >= 2 ? 'tlstreak' : 'tlmatch'); buzz(r.streak >= 2 ? 30 : 18);
      emit('tlmatch', { a: r.a, b: r.b, gain: r.gain, streak: r.streak, pic: s.tiles[r.a].pic });
      busy = false;
      if (r.won) end('won');
    } else if (r.ev === 'miss') {
      await sleep(MISS_MS);
      if (!playing || !s.pending) return;
      U.miss(r.a, r.b); snd('tlmiss'); emit('tlmiss', { a: r.a, b: r.b });
      await sleep(200);
      if (!s.pending) return;
      s = E.settle(s); U.sync(s);
    }
  }
  async function doHint() {
    if (!playing || busy || pausedAt) return;
    const r = E.hint(s);
    if (!r.pair) return;
    s = r.s; U.sync(s); snd('tlhint'); buzz(10); emit('tlhint', { pair: r.pair });
    await U.lit(r.pair, 1000);
  }
  async function doShuffle() {
    if (!playing || busy || pausedAt) return;
    busy = true;
    const z = E.shuffle(s);
    snd('tlshuffle'); buzz(12); emit('tlshuffle', {});
    await U.shuffleFx();
    s = z; U.sync(s);
    busy = false;
  }
  async function doUndo() {
    if (!playing || busy || pausedAt) return;
    const r = E.undo(s);
    if (!r.pair) return;
    busy = true;
    s = r.s; U.sync(s); snd('tlundo'); buzz(10); emit('tlundo', { pair: r.pair });
    await U.peek(r.pair, 900);
    busy = false;
  }
  async function askExit() {
    if (exitAsk) return;
    exitAsk = true;
    if (!playing) { end('quit'); exitAsk = false; return; }
    pause();
    const c = await U.card('exit');
    exitAsk = false;
    if (c === 'quit') { end('quit'); return; }
    resume();
  }
  if (ctx.test && globalThis.window) {
    window.__TL_TEST = {
      s: () => s, tap, hint: doHint, shuffle: doShuffle, undo: doUndo, U,
      pair: () => { if (!s) return null; const by = {}; s.tiles.forEach((t, i) => { if (!t.done) (by[t.pic] = by[t.pic] || []).push(i); }); return Object.values(by).find((v) => v.length === 2) || null; },
      missPair: () => { if (!s) return null; const a = s.tiles.findIndex((t) => !t.done && !t.up); const b = s.tiles.findIndex((t, i) => !t.done && !t.up && i !== a && t.pic !== s.tiles[a].pic); return a >= 0 && b >= 0 ? [a, b] : null; },
      timeout: () => { t0 = Date.now() - (s ? s.limit + 1000 : 0); paused = 0; },
      elapsed,
    };
  }

  let total = 0, last = null;
  try {
    for (;;) {
      attempt++;
      const seed = ctx.seed != null ? (E.hashSeed(ctx.seed, level, attempt) >>> 0) : E.hashSeed('tiles', level, attempt, Date.now(), Math.random());
      s = E.deal(level, seed);
      U.board(s);
      playing = false; busy = false; pausedAt = 0; paused = 0;
      const go = await U.card('start', { level, pairs: s.pairs, cols: s.cols, rows: s.rows, limit: s.limit, conn: E.connectedOf(level, s.pairs) > 0 });
      if (go !== 'go') { out.quit = true; emit('tlquit', { level }); break; }
      // ── the round ──
      t0 = Date.now(); playing = true; snd('tlstart'); emit('tlstart', { level, seed, pairs: s.pairs });
      U.clock(0, s.limit);
      const how = await new Promise((resolve) => {
        finish = resolve;
        const iv = setInterval(() => {
          if (!playing) return;
          const ms = elapsed();
          U.clock(ms, s.limit);
          if (ms >= s.limit && !s.won) end('lost');
        }, 250);
        finish = (v) => { clearInterval(iv); resolve(v); };
      });
      const ms = elapsed();
      playing = false; finish = null;
      if (how === 'quit') { total += s.perutot; last = { won: false, ms, pairs: s.matches, misses: s.misses }; out.quit = true; emit('tlquit', { level, perutot: s.perutot }); break; }
      if (how === 'lost') {
        total += s.perutot; last = { won: false, ms, pairs: s.matches, misses: s.misses };
        snd('tllose'); emit('tllose', { level, matches: s.matches, pairs: s.pairs, perutot: s.perutot });
        const c = await U.card('lost', { matches: s.matches, pairs: s.pairs, perutot: s.perutot });
        if (c === 'retry') continue;
        break;
      }
      // won
      const st = E.stars(s, ms);
      total += s.perutot; last = { won: true, ms, stars: st, pairs: s.matches, misses: s.misses };
      const cur = io.get();
      const prev = cur.best[level] || { stars: 0, perutot: 0 };
      const best = s.perutot > (prev.perutot || 0) || st > (prev.stars || 0);
      cur.best[level] = { stars: Math.max(st, prev.stars || 0), perutot: Math.max(s.perutot, prev.perutot || 0) };
      cur.level = Math.max(cur.level || 1, level + 1); cur.perutot = (cur.perutot || 0) + s.perutot;
      io.set(cur);
      snd('tlwin'); buzz(40); emit('tlwin', { level, stars: st, ms, misses: s.misses, perutot: s.perutot });
      U.fireworks(FW_MS); U.sparkleCoins();
      await sleep(900);
      snd('tlstars');
      const c = await U.card('won', { stars: st, pairs: s.pairs, misses: s.misses, ms, perutot: s.perutot, total, best, bestStreak: s.bestStreak, next: level + 1 });
      if (c === 'again') { level++; continue; }
      break;
    }
  } finally {
    playing = false;
    if (ctx.test && globalThis.window) delete window.__TL_TEST;
    U.destroy();
  }
  out.perutot = total;
  if (last) { out.won = !!last.won; out.ms = last.ms | 0; out.stars = last.stars || 0; out.pairs = last.pairs | 0; out.misses = last.misses | 0; }
  emit('tlclose', out);
  return out;
}
