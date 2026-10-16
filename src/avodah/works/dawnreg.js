/* ── tamida23 ── dawnreg.js — the dawn's world crafts into ENGINE22's registry (day/works.js), and the dawn's sheet errands re-pointed to
 * them BY ID (tasks.js TEMPLATES: same id, same hour, same ממונה bubble; `game` → `sheet`, a `work` and its points). The sheet games stay
 * in the code (portrait plays them; the home's sheet still settles its errand through `sheet`). Under two thumbs the work wins.
 * The kit is WORKSA22's, bound through its warmWorks. קידוש ידיים ורגליים: the kiyor's craft (WORKSB22's WORKS.kiyor) — ⚑ default. ── /tamida23 ── */
import { WORKS } from '../day/works.js';
import { TEMPLATES } from '../day/tasks.js';
import { PLACE22 } from '../day/places.js';
import { warmWorks } from './register.js';
import { getKit } from './craft.js';
import { payis, payis2, deshen, maaracha, taleh, barkai } from './dawn.js';
import { shaarim, heichal, zerika, evarim } from './dawn2.js';
import { s27Opts } from './slice27.js';   // ── slice27 ── ── /slice27 ──

export const DAWN_WORKS = { payis, payis2, deshen, maaracha, taleh, barkai, shaarim, heichal, zerika, evarim };
const ICON = { payis: '☝', payis2: '☝', deshen: '🔥', maaracha: '🪵', taleh: '🐑', barkai: '🌅', shaarim: '🚪', heichal: '🕯', zerika: '🥣', evarim: '🧺' };
/** task id → [work id, points] */
export const DAWN_TASKS = {
  'g-payis1': ['payis', 12], 'g-payis2': ['payis2', 12], 'g-kiddush': ['kiddush', 10], 'g-deshen': ['deshen', 14], 'g-maaracha': ['maaracha', 14],
  'g-barkai': ['barkai', 12], 'g-taleh': ['taleh', 14], 'g-shaarim': ['shaarim', 12], 'g-heichal': ['heichal', 14], 'g-zerika': ['zerika', 14], 'g-evarim': ['evarim', 14],
};
/** the stage on free floor: the kit sets it along the camera's line; beside the altar, the ramp or a chamber that line can run into a solid
 *  (the follow camera swings round a wall). If more than one of nine footprint samples is blocked, turn the stage about him (±80° at most,
 *  so the camera still sees it), push it, or make it smaller — the first footprint that is free wins; otherwise it stays as the kit set it. */
export function refit(ctx, bd) {
  const k = getKit(); if (!k || !bd || !ctx || typeof ctx.free !== 'function' || typeof ctx.hero !== 'function') return null;
  const F = k.F, h = ctx.hero(); if (!h || !F.on) return null;
  if (F.anchor) return { moved: false, anchor: F.anchor };   // ── places24 ── (the stage is the real place)
  const bad = (ox, oz, fx, fz, K) => { let n = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const a = bd[0] + (bd[1] - bd[0]) * i / 2, s = bd[2] + (bd[3] - bd[2]) * j / 2, aa = F.a0 + (a - F.a0) * F.Ca; if (ctx.free(ox + (fx * aa - fz * s) * K, oz + (fz * aa + fx * s) * K) === false) n++; } return n; };
  if (bad(F.x, F.z, F.fx, F.fz, F.K) <= 1) return { moved: false };
  const dx = F.x - h.x, dz = F.z - h.z, along = dx * F.fx + dz * F.fz, side = -dx * F.fz + dz * F.fx, base = Math.atan2(F.fx, F.fz), K0 = F.K;
  let best = null;
  const put = (c) => { Object.assign(F, { fx: c.fx, fz: c.fz, yaw: c.yaw, x: c.ox, z: c.oz, K: c.K }); F.y = typeof ctx.ground === 'function' ? ctx.ground(c.ox, c.oz) : F.y; F.fit = { K: +c.K.toFixed(2), Ca: +F.Ca.toFixed(2), turned: +c.d.toFixed(2), lat: c.lat, blocked: c.n }; return { moved: true, d: c.d, push: c.push, lat: c.lat, sc: c.sc, n: c.n }; };
  for (const sc of [1, 0.82, 0.68, 0.56]) for (const d of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4]) for (const lat of [0, 2.5, -2.5, 5, -5]) for (const push of [0, 1.2, -0.8, 2.4]) {
    const yaw = base + d, fx = Math.sin(yaw), fz = Math.cos(yaw), K = K0 * sc, sd = side + lat, ox = h.x + fx * (along + push) - fz * sd, oz = h.z + fz * (along + push) + fx * sd;
    const n = bad(ox, oz, fx, fz, K), c = { fx, fz, yaw, ox, oz, K, d, push, lat, sc, n };
    if (n <= 1) return put(c);
    if (!best || n < best.n) best = c;
  }
  return best && best.n < 6 ? put(best) : { moved: false, blocked: true };
}
function reg(id, w) {
  WORKS[id] = {
    id, he: w.he, icon: ICON[id], fact: w.fact, place: w.place,
    begin(ctx) { if (!warmWorks(ctx)) return null; const r = w.begin(); if (r && r.ok) { try { w.lastFit = refit(ctx, w.bounds); } catch (e) { /* the kit's own place stands */ } } return r && r.ok ? { ok: true, at: r.at } : null; },
    model(ctx) { warmWorks(ctx); return w.model(s27Opts(ctx) /* ── slice27 ── (the level: L1 / L2) ── /slice27 ── */); },
    update: (M) => w.update(M), touch: (d, M) => w.touch(d, M), box: () => w.box(), hooks: () => w.hooks(),
    end(r, ctx) {
      w.end(r);
      try { if (ctx && typeof ctx.mentor === 'function' && r && !r.skipped) { ctx.mentored = true; ctx.mentor(w.fact.he, `${w.fact.ref}${w.fact.illus ? ' · המחשה' : ''} · טיוטה`); } } catch (e) { /* the mentor's */ }
    },
  };
}
for (const id in DAWN_WORKS) reg(id, DAWN_WORKS[id]);
/** קידוש ידיים ורגליים: WORKSB22's kiyor craft (the mukhni raises it, the twelve spouts run — WORKS.kiyor, resolved at the start: it
 *  registers after this file); its end also settles the dawn's "fill the kiyor" errand when still open (one act at one place, not two) */
WORKS.kiddush = {
  id: 'kiddush', he: 'קידוש ידיים ורגליים', icon: '💧',
  begin(ctx) { const K = WORKS.kiyor; return K && K.begin ? K.begin(ctx) : { ok: true }; },
  async run(ctx) {
    const K = WORKS.kiyor; if (!K || typeof K.run !== 'function') return { ok: true, quality: 1, score: 10 };
    const r = await K.run(ctx);
    if (r && r.ok !== false && !r.skipped) {
      try { const k = ctx.tasks && ctx.tasks.get('kiyor'); if (k && k.state === 'open') ctx.tasks.done('kiyor', r.quality); } catch (e) { /* the day's */ }
      try { if (ctx.tasks) { const k2 = ctx.tasks.get('kiyor2'); if (k2 && k2.state !== 'done' && k2.state !== 'open') { ctx.tasks.force('kiyor2', { say: true }); globalThis.__F26K2 = Math.round(performance.now()); } } } catch (e) { /* the day's */ }   // ── fix26 ── (the washing emptied it: the refill opens now, its ממונה's bubble after the epilogue) ── /fix26 ──
      try { ctx.mentored = true; ctx.mentor('הזוכה קידש ידיו ורגליו מן הכיור, ונטל מחתת הכסף ועלה לראש המזבח; ובן קטין עשה מוכני לכיור — שלא יהיו מימיו נפסלים בלינה', 'תמיד א, ד; יומא ג, י · טיוטה'); } catch (e) { /* the mentor's */ }
    }
    return r;
  },
  end() { /* the kiyor tears itself down */ },
};
/** two markers moved onto the open floor east of the altar (the sheet's spots stand on the ramp's edge and against the altar's east face:
 *  a stage set there lands inside the solid) — ⚑ default; the works still show the altar and the ramp in their dioramas */
PLACE22.deshenFloor = { x: -16, z: 30, he: 'מזרח הכבש' };
PLACE22.altarFloor = { x: -15.5, z: -7, he: 'המזבח' };
const MOVE = { 'g-deshen': 'deshenFloor', 'g-maaracha': 'altarFloor' };
for (const t of TEMPLATES) {
  const m = DAWN_TASKS[t.id]; if (!m || !t.game) continue;
  if (MOVE[t.id]) t.place = MOVE[t.id];
  t.sheet = t.game; delete t.game; t.work = m[0]; t.pts = m[1]; if (ICON[m[0]]) t.icon = ICON[m[0]];   // (the parts' errand shows a basket, not the sheet's meat)
}
// ── places24 ── the dawn's works on their real places (works/places24.js), and their markers moved there
import { anchorWorks, moveMarkers } from './places24.js';
anchorWorks(DAWN_WORKS); moveMarkers(PLACE22, TEMPLATES);
// ── /places24 ──
try { globalThis.__TA23 = { works: DAWN_WORKS, tasks: DAWN_TASKS }; } catch (e) { /* tests */ }
