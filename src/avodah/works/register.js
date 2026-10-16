/* ── worksa22 ── register.js — WORKSA22's five works into ENGINE22's registry (src/avodah/day/works.js; ids as the task engine looks them up:
 * 'watch' (the night round), 'fire' (בית המוקד), 'lambs' (the lamb check), 'pen', 'wood'). ENGINE22's day/index.js imports this file in its
 * `// ── works-imports ──` fence. A work here is Path A of the contract: model(ctx) → an acts.js-style model, run by hands.js runInWorld
 * (input 'twin') with hooks { begin, update, end, box, touch }; end(r, ctx) hands the mentor line (the source, after the end).
 * warmWorks(ctx) — call once when Phase B's world goes live (the torch light is made then: a light added mid-play recompiles materials). ── /worksa22 ── */
import { WORKS, warmers } from '../day/works.js';
import { groundY, floorFree } from '../../avodah3d.js';
import { initWorks, getKit, getCtx } from './craft.js';
import { night, moked, lambs } from './night.js';
import { pen } from './pen.js';
import { wood } from './wood.js';
import { s27Opts } from './slice27.js';   // ── slice27 ── ── /slice27 ──

let CUR = null, SCENE = null;
function bind(ctx) {
  CUR = ctx || CUR; if (!CUR) return false;
  if (!getKit() || SCENE !== CUR.scene) { SCENE = CUR.scene; initWorks({ scene: CUR.scene, camera: CUR.camera, ground: (x, z) => (CUR.ground || groundY)(x, z), free: (x, z) => (CUR.free ? CUR.free(x, z) : floorFree(x, z)), hero: () => CUR.hero(), stock: CUR.stock, world: CUR.world /* ── places24 ── (the sanctuary, the water) */ }); }
  else { const c = getCtx(); c.stock = CUR.stock; c.camera = CUR.camera; c.world = CUR.world; /* ── places24 ── */ }
  return true;
}
export function warmWorks(ctx) { return bind(ctx); }
try { globalThis.__W22 = { kit: getKit, works: () => WORKS }; } catch (e) { /* tests read the stage's frame */ }   // (tests)
warmers.push((ctx) => warmWorks(ctx));
const ICON = { watch: '🔦', fire: '🔥', lambs: '🐑', pen: '🐐', wood: '🪵' };
function reg(id, w) {
  WORKS[id] = {
    id, he: w.he, icon: ICON[id], fact: w.fact, place: w.place,
    begin(ctx) { if (!bind(ctx)) return null; const r = w.begin(); return r && r.ok ? { ok: true, at: r.at } : null; },
    model(ctx) { bind(ctx); return w.model(s27Opts(ctx) /* ── slice27 ── (the level: L1 / L2) ── /slice27 ── */); },
    update: (M) => w.update(M), touch: (d, M) => w.touch(d, M), box: () => w.box(), hooks: () => w.hooks(),
    end(r, ctx) {
      w.end(r);
      try { const c = ctx || CUR; if (c && typeof c.mentor === 'function' && r && !r.skipped) { c.mentored = true; c.mentor(w.fact.he, `${w.fact.ref}${w.fact.illus ? ' · המחשה' : ''} · טיוטה`); } } catch (e) { /* the mentor's */ }
    },
  };
}
import { anchorWorks } from './places24.js';   // ── places24 ── (the night watch at the real posts)
anchorWorks({ night });
reg('watch', night); reg('fire', moked); reg('lambs', lambs); reg('pen', pen); reg('wood', wood);
