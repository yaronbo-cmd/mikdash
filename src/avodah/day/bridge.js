/* bridge.js — POLISH23 (wave 23, item 2): the day's points go into Phase A's master score (src/game/score.js: the 10,000 → "דינר זהב").
 * Phase A's game is stopped while Phase B plays, so the bridge opens the kohen's own save (the slot the phone is on), runs the SAME
 * createScore on it with `once` keys (a task pays its score once a day, never twice), and writes it back — leaving `lastSeen` as it
 * was (the building's offline time is Phase A's own). A coin earned here stays "unseen": Phase A plays its celebration when he is back.
 * With no Phase A save yet (a link straight to #avodah) the points live in Phase B's own box (A.day.sc), and the HUD coin still fills.
 *   const B = createBridge({ box: A.day, store, now }) → B.add(n, why, onceKey) → { n, total, coins } · B.get() → { total, base, next, frac, coins } · B.k
 * ⚑ the rate: one day-point = SCALE (10) score points (a work's 12 → 120, like a course's end 50–200): the day fills a coin slowly, as Phase A does. */
import * as S from '../../game/state.js';
import { createScore, fmt } from '../../game/score.js';
import { slotKey, slotCur } from '../../game/hooks/around.js';

export const SCALE = 10;
export { fmt };
export function createBridge(o = {}) {
  const store = o.store || S.storage, now = typeof o.now === 'function' ? o.now : () => Date.now();
  const box = o.box || {};
  if (!box.sc || typeof box.sc !== 'object') box.sc = {};
  let G = null, key = '', lastSeen = 0, real = false;
  const emit = (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* the host's */ } };
  /** the save we add to: the kohen's own (when there is one) or Phase B's box */
  function open() {
    key = ''; real = false;
    try { key = slotKey(slotCur(store)); } catch (e) { key = S.SAVE_KEY; }
    let raw = null; try { raw = store.get(key); } catch (e) { raw = null; }
    if (raw) { try { const r = S.load(store, key, now()); G = r.G; lastSeen = G.lastSeen; real = !G.demo; if (G.demo) { G = null; real = false; } } catch (e) { G = null; } }
    if (!G) { G = box.sc; real = false; }
    return G;
  }
  function persist() {
    if (real) { try { store.set(key, JSON.stringify({ ...G, lastSeen })); } catch (e) { /* storage */ } }
    else if (typeof o.persist === 'function') { try { o.persist(); } catch (e) { /* the host's */ } }
  }
  const SC = createScore({ G: () => G, persist: () => {}, emit: () => {}, stage: () => 'avodah', now });
  const B = {
    k: SCALE,
    add(n, why = 'day', once) {
      open();
      const r = SC.add(Math.max(0, Math.floor(n || 0)), why, once ? { once: String(once) } : {});
      if (r.n > 0) persist();
      if (r.coins && r.coins.length) emit('dayDinar', { n: r.coins.length, total: r.total });
      return r;
    },
    get() { if (!G) open(); return SC.get(); },
    /** tests: where the points go */
    get real() { return real; },
  };
  return B;
}
