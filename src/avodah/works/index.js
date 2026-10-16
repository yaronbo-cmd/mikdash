/* ── worksa22 ── works/index.js — Phase B's world crafts of WORKSA22 (the night, the pen, the wood). initWorks(ctx) once at world-live,
 * then WORKS[id].hooks() + WORKS[id].model(o) for hands.js runInWorld(M, { input: 'twin', hooks, fact }). ── /worksa22 ── */
import { initWorks, getKit } from './craft.js';
import { night, moked, lambs } from './night.js';
import { pen } from './pen.js';
import { wood } from './wood.js';

export const WORKS = { night, moked, lambs, pen, wood };
/** where each work starts (ENGINE22's markers): the place ids of the contract */
export const WORK_PLACE = { night: 'moked', moked: 'moked', lambs: 'moked', pen: 'pen', wood: 'wood' };
export { initWorks, getKit };
