/* ── shift29 ── lab.js — SHIFT29B's own bench (`#shiftlab`, or __SHIFTLAB.start() in a test): the pilgrims, the stations, the camera and
 * the run in the day's world WITHOUT the engine (SHIFT29A's) — a minimal loop to try the modules by touch: a pilgrim every 8 s, a tap on
 * him walks the kohen to him and takes him, a tap on a station walks there and runs its act (the route's order kept: "לא — … קודם").
 * Not the game: no clock, no score, no stars. Never a Divine Name. ── /shift29 ── */
import { createPilgrims, ROUTES } from './pilgrims.js';
import { createStations, STATIONS } from './stations.js';
import { createShiftCam } from './camera.js';
import { createWalk } from './walk.js';
import { onTick } from './draw.js';

const LAB = { on: false, mods: null, raf: 0, last: 0, every: 8, clock: 0, served: 0, n: 0, types: ['olah', 'ken', 'mincha'] };
function taken(P) { return P && P.state === 'taken'; }
async function start(o = {}) {
  if (LAB.on) return LAB.mods;
  const D = globalThis.__DAY, T = globalThis.__T; if (!D || !T || !D.twin) return null;
  try { D.clock.pause(); } catch (e) { /* */ }
  const S = T.stages, view = T.view, twin = D.twin, root = document.querySelector('.gm.dy-gm') || document.body;
  let cur = null;
  const walk = createWalk({ world: S, twin });
  const P = createPilgrims({ world: S, view, root, patienceS: o.patienceS || 40,
    onTap: async (p) => { if (st.busy) return; if (p.state !== 'wait') return; const ok = await walk.to(p._x, p._z, 2.4); if (ok && p.state === 'wait') { if (cur && cur.state === 'taken') P.release(cur); P.take(p); cur = p; } },
    onLeave: () => {} });
  const st = createStations({ world: S, view, root, twin, ctx: { sfx: T.sfx || null },
    onTap: async (id) => {
      if (st.busy) return;
      const s = STATIONS[id], ok = await walk.to(s.stand.x, s.stand.z, 1.6, s.at); if (!ok || !cur) return;
      if (cur.route[cur.step] !== id) { st.wrong(id, cur.route[cur.step]); return; }
      P.release(cur); const r = await st.act(id, cur); LAB.last = r; cur.step++;
      if (cur.step >= cur.route.length) { P.done(cur); LAB.served++; cur = null; return; }
      P.take(cur);
    } });
  st.place(); const cam = createShiftCam(view, twin, { world: S }); cam.on(); walk.run(true);
  LAB.mods = { P, st, cam, walk }; LAB.on = true; LAB.clock = LAB.every - 0.5; LAB.n = 0;
  if (o.spawn !== false) P.spawn(LAB.types[LAB.n++ % 3]);
  LAB.off = onTick((ms, dt) => { if (!LAB.on) return; P.tick(dt); if (o.spawn !== false && (LAB.clock += dt) >= LAB.every) { LAB.clock = 0; P.spawn(LAB.types[LAB.n++ % 3]); } });
  return LAB.mods;
}
function stop() { if (!LAB.on) return; LAB.on = false; if (LAB.off) { LAB.off(); LAB.off = null; } const m = LAB.mods; try { m.cam.off(); m.walk.run(false); m.walk.stop(); m.P.destroy(); m.st.destroy(); } catch (e) { /* */ } LAB.mods = null; try { globalThis.__DAY.clock.resume(); } catch (e) { /* */ } }
try {
  globalThis.__SHIFTLAB = { start, stop, get mods() { return LAB.mods; }, state: () => ({ on: LAB.on, served: LAB.served, last: LAB.last || null }), ROUTES, STATIONS };
  if (typeof location !== 'undefined' && /shiftlab/.test(location.hash || '')) {
    const iv = setInterval(() => { const D = globalThis.__DAY; if (D && D.twin && D.D && D.D.active) { clearInterval(iv); setTimeout(() => start(), 1200); } }, 400);
  }
} catch (e) { /* node */ }
