/* ── worksb22 ── indexb.js — the four works of the day's second half, built against one ctx (see common.js for the ctx and the contract):
 *   const W = createWorksB22(ctx); W.gate | W.seals | W.kiyor | W.close   each { id, model(o), begin(o), touch, update(M), end(), box(), on(), tick(dt) }
 *   WORKS_B22 — the ids → the factories (ENGINE22 registers them like Phase A's crafts); W.update(dt) ticks whichever is running. */
import { createGateWork } from './gate.js';
import { createSealsWork } from './seals.js';
import { createKiyorWork } from './kiyor.js';
import { createCloseWork } from './close.js';

export const WORKS_B22 = { gate: createGateWork, seals: createSealsWork, kiyor: createKiyorWork, close: createCloseWork };
export function createWorksB22(ctx) {
  const W = {};
  for (const id in WORKS_B22) W[id] = WORKS_B22[id](ctx);
  W.update = (dt) => { for (const id in WORKS_B22) if (W[id].on()) W[id].tick(dt); };
  W.running = () => Object.keys(WORKS_B22).filter((id) => W[id].on());
  return W;
}
// ── /worksb22 ──
