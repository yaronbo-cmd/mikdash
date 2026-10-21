/* ─────────────────────────────────────────────────────────────────────────────
 * kings/index.js — trade and diplomacy with the kings of the nations (KINGS, wave 6). The public API.
 *
 *   import * as K from './kings/index.js';        // BUILD imports it guarded; the flow never waits on it
 *   K.ensure(G) · K.partners(G, now, opts) · K.offers(G, partnerId, now, opts) · K.accept(G, offerId, now, opts)
 *   K.settle(G, now) → deliveries due · K.unload(G, voyageId, now, opts) · K.unloadAll(G, now, opts)
 *   K.status(G, now) · K.bestFor(G, res, need, now, opts) → the offer for a shortage chip · K.tune({cost, yield, time})
 *   K.openCourt(ctx) → Promise<{deals, unloaded}> (the map and the courts; resolves on close)
 *     ctx = { root, G, now: () => ms, apply(delta) → false to refuse, onEvent(name, data), demo, sfx, needs, rest,
 *             partner?, offer? (opens its contract), arrivals?, top? }
 * ──────────────────────────────────────────────────────────────────────────── */
export {
  ensure, partners, offers, accept, settle, unload, unloadAll, bestFor, status, phase, tune, TUNE, relOf, levelOf, gateOpen,
  applyRes, newsOf, seen, DEMO_SPEED,
} from './logic.js';
export { PARTNERS, OFFERS, LETTERS, SEALS, LEVELS, RES } from './data.js';
export { openCourt } from './ui.js';

import * as K from './index.js';
try { (globalThis.__BH_PARTS ||= {}).kings = K; } catch (e) { /* a frozen global: BUILD passes parts instead */ }
