// ── tamidb23 ──
/* tamidreg.js — TAMIDB23's works into ENGINE22's registry (src/avodah/day/works.js), the way WORKSA22's register.js does it (the shared
 * kit is bound by its warmWorks): ids as tasks.js names them in `work` — ketoret · birkat · shir · erev · neirot · shir2.
 * The sheet games (src/avodah/minigames) stay in the code; the tasks keep their sheet id in `sheet`. ── /tamidb23 ── */
import { WORKS } from '../day/works.js';
import { warmWorks } from './register.js';
import { getCtx } from './craft.js';
import { ketoret, birkat, erev, neirot } from './tamid.js';
import { shir, shir2 } from './song.js';

const ICON = { ketoret: '💨', birkat: '🙌', shir: '🎵', erev: '🌇', neirot: '🕯', shir2: '🎵' };
import { anchorWorks } from './places24.js';   // ── places24 ──
export function registerTamidB(R = WORKS) {
  anchorWorks({ ketoret, birkat, erev, neirot, shir, shir2 });   // ── places24 ── (their anchored draws on the real places)
  for (const [id, w] of Object.entries({ ketoret, birkat, shir, erev, neirot, shir2 })) {
    R[id] = {
      id, he: w.he, icon: ICON[id], fact: w.fact, place: w.place,
      begin(ctx) { if (!warmWorks(ctx)) return null; const r = w.begin(); return r && r.ok ? { ok: true, at: r.at } : null; },
      model(ctx) { warmWorks(ctx); return w.model({ level: 0 }); },
      update: (M) => w.update(M), touch: (d, M) => w.touch(d, M), box: () => w.box(), hooks: () => w.hooks(),
      end(r, ctx) {
        w.end(r);
        try { const c = ctx || getCtx(); if (c && typeof c.mentor === 'function' && r && !r.skipped) { c.mentored = true; c.mentor(w.fact.he, `${w.fact.ref}${w.fact.illus ? ' · המחשה' : ''} · טיוטה`); } } catch (e) { /* the mentor's */ }
      },
      state: () => w.state(),
    };
  }
  return R;
}
// ── /tamidb23 ──
