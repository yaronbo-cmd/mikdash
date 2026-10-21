/* ─────────────────────────────────────────────────────────────────────────────
 * pen/index.js — "הוצאת הטלה מהדיר": the sliding-block pen puzzle (a self-contained mini-game module).
 *
 *   const r = await runPen({ root, level, seed, onEvent, sfx, haptic, save, test });
 *   // r = { won, stars, moves, optimal, ms, perutot, quit }   (perutot: all the rounds of this call; the rest: the last round)
 *
 * Never throws; the promise always resolves (an error resolves { quit:true, error }). The X resolves quit:true.
 * No clock: losing is impossible, only more moves. Nothing is ever bought.
 * Events (onEvent(type, data)): pnopen · pnstart · pnmove · pnundo · pnhint · pnwin · pnquit · pnclose.
 * Sounds (sfx.play(name)): pnslide · pnblock · pnhint · pnundo · pnwin · pnstars — all optional.
 * save (an object, or {get,set}): { level, best:{ [level]: { stars, moves } }, perutot } — the host keeps it.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as E from './engine.js';
import { createUI } from './ui.js';

export { load, canMove, range, move, undo, reset, hint, isWon, solve, generate, puzzle, stars, gain, bandOf, hashSeed, KINDS, KIND_HE, HAND, HAND_MAX } from './engine.js';
export { piece, pieceSvg, pen, PIECE_KINDS, DEFS, COIN } from './art.js';

const FW_MS = 2600;
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

export async function runPen(ctx = {}) {
  const out = { won: false, stars: 0, moves: 0, optimal: 0, ms: 0, perutot: 0, quit: false };
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
  let s = null, attempt = 0, exitAsk = false, playing = false, busy = false, t0 = 0, finish = null, total = 0;
  const U = createUI(ctx.root, {
    canDrag: () => playing && !busy,
    range: (id) => (s ? E.range(s, id) : { min: 0, max: 0 }),
    onMove: (id, delta) => doMove(id, delta),
    onTapLamb: () => tapLamb(),
    onBlocked: (id) => { if (!playing) return; U.shake(id); snd('pnblock'); buzz(12); },
    onHint: () => doHint(),
    onUndo: () => doUndo(),
    onReset: () => doReset(),
    onExit: () => askExit(),
  });
  setU(U);
  U.coins(total);
  emit('pnopen', { level });
  const end = (how) => { if (finish) { const f = finish; finish = null; f(how); } };

  function doMove(id, delta) {
    if (!playing || busy) return false;
    const n = E.move(s, id, delta);
    if (!n) return false;
    s = n; U.sync(s); snd('pnslide'); buzz(8); emit('pnmove', { id, delta, moves: s.moves });
    if (s.won) win();
    return true;
  }
  function tapLamb() {
    if (!playing || busy) return;
    const lamb = E.lambOf(s);
    if (!lamb || lamb.x === 0) return;
    if (!E.canMove(s, lamb.id, -lamb.x)) { U.shake(lamb.id); snd('pnblock'); buzz(12); return; }
    doMove(lamb.id, -lamb.x);
  }
  async function win() {
    busy = true;
    await U.walkOut();
    end('won');
  }
  async function doHint() {
    if (!playing || busy) return;
    const r = E.hint(s);
    if (!r.move) return;
    s = r.s; U.sync(s); snd('pnhint'); buzz(10); emit('pnhint', { move: r.move });
    await U.lit(r.move[0], r.move[1], 1400);
  }
  function doUndo() {
    if (!playing || busy) return;
    const n = E.undo(s);
    if (!n) return;
    s = n; U.sync(s); snd('pnundo'); buzz(10); emit('pnundo', { moves: s.moves });
  }
  function doReset() {
    if (!playing || busy) return;
    const n = E.reset(s);
    if (n === s) return;
    s = n; U.sync(s); snd('pnundo'); buzz(10); emit('pnundo', { moves: 0, reset: true });
  }
  async function askExit() {
    if (exitAsk) return;
    exitAsk = true;
    if (!playing) { end('quit'); exitAsk = false; return; }
    const c = await U.card('exit');
    exitAsk = false;
    if (c === 'quit') end('quit');
  }
  if (ctx.test && globalThis.window) {
    window.__PN_TEST = { s: () => s, move: doMove, tapLamb, hint: doHint, undo: doUndo, reset: doReset, U, solve: () => E.solve(s) };
  }

  let last = null;
  try {
    for (;;) {
      attempt++;
      const seed = ctx.seed != null ? (E.hashSeed(ctx.seed, level, attempt) >>> 0) : E.hashSeed('pen', level, attempt, Date.now(), Math.random());
      await sleep(20);   // the overlay paints before the generator works (up to ~1 s on the high levels)
      s = E.load(E.puzzle(level, seed));
      U.board(s);
      playing = false; busy = false;
      const go = await U.card('start', { level, optimal: s.optimal, pieces: s.pieces.length });
      if (go !== 'go') { out.quit = true; emit('pnquit', { level }); break; }
      // ── the round ──
      t0 = Date.now(); playing = true; emit('pnstart', { level, seed, optimal: s.optimal, pieces: s.pieces.length });
      const how = await new Promise((resolve) => { finish = resolve; });
      const ms = Date.now() - t0;
      playing = false; finish = null;
      if (how === 'quit') { last = { won: false, ms, moves: s.moves, optimal: s.optimal }; out.quit = true; emit('pnquit', { level, moves: s.moves }); break; }
      // won
      const st = E.stars(s.moves, s.optimal), g = E.gain(st, level);
      total += g; last = { won: true, ms, stars: st, moves: s.moves, optimal: s.optimal };
      const cur = io.get();
      const prev = cur.best[level] || { stars: 0, moves: Infinity };
      const best = st > (prev.stars || 0) || s.moves < (prev.moves == null ? Infinity : prev.moves);
      cur.best[level] = { stars: Math.max(st, prev.stars || 0), moves: Math.min(s.moves, prev.moves == null ? Infinity : prev.moves) };
      cur.level = Math.max(cur.level || 1, level + 1); cur.perutot = (cur.perutot || 0) + g;
      io.set(cur);
      snd('pnwin'); buzz(40); emit('pnwin', { level, stars: st, ms, moves: s.moves, optimal: s.optimal, perutot: g });
      U.coins(total); U.fireworks(FW_MS); U.sparkleCoins();
      await sleep(700);
      snd('pnstars');
      const c = await U.card('won', { stars: st, moves: s.moves, optimal: s.optimal, ms, perutot: g, total, best, next: level + 1 });
      if (c === 'again') { level++; continue; }
      break;
    }
  } finally {
    playing = false;
    if (ctx.test && globalThis.window) delete window.__PN_TEST;
    U.destroy();
  }
  out.perutot = total;
  if (last) { out.won = !!last.won; out.ms = last.ms | 0; out.stars = last.stars || 0; out.moves = last.moves | 0; out.optimal = last.optimal | 0; }
  emit('pnclose', out);
  return out;
}
