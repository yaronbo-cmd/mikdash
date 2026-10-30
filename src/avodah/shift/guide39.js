/* ── fable32 (build 39) ── guide39.js — the guided walk (the owner, 26.10 00:07: "לחצת - זזת לכיוון הנקודה. לא לחצת נשארת לעמוד. בלי
 * שרואים בכלל גויסטיק."; 00:12: "המסלול לא עוקף קירות… אבל הוא גם לא נתקע בקיר… אנחנו 'מובילים' אותו לאן שאנחנו רוצים אותו"; 00:16:
 * several open tasks — the drag's direction chooses; docs/specs/hachraot-he.md "הליכה מובלת", input-protocol-he.md "עדכון 26.10.2026").
 * A thumb held on the world → twin.js asks dir(h, drag) each frame: the way to the current task's place — the engine's flowNext() (and its
 * open alternatives, E.alt39()) — along a real path over the floors he can walk (flow31's: down the ramp first, the court's floors round
 * the chambers' block, the House's floor through its doors), the next point of it as a unit vector, slower over the last amot, null on
 * arrival. Released → twin.js stops him. No target → no motion. Several targets → the one whose way from him best matches the drag (the
 * world direction of the drag, from twin.js), held until another is clearly better (hysteresis). Never a Divine Name. ── /fable32 ── */
import { planPath } from '../day/guide27.js';
import { onHigh, rampWay } from '../day/world22.js';
import { placeGround } from '../works/anchors.js';
import { rings27 } from './day33.js';

/** the walk's numbers: arrive within `arrive` of the place; a way point passed within `pass`; re-planned every `replanS` s once he is
 *  `replanMove` off its leg (or blocked `stuckS` s — within `near` of the place that is arrival); slower over the last `slowIn` amot (never under `minK` of the pace); the drag picks a
 *  target once it is `pickPx` long, and a new one only when its match is `hyst` better (cosines) */
export const G39 = Object.freeze({ near: 2.5, arrive: 0.35, pass: 0.7, replanS: 0.6, replanMove: 1.2, stuckS: 0.8, slowIn: 2.2, minK: 0.25, pickPx: 28, hyst: 0.3, speed: 0.82 });

/** the way from (x, z) to p over isFree (flow31's plan: on the altar down the ramp first; to the altar straight) — [{x, z}…], p last */
export function way39(x, z, p, isFree) {
  const ramp = rampWay(x, z),
    pts = ramp.length && !onHigh(p.x, p.z)
      ? ramp.concat(planPath(ramp[ramp.length - 1].x, ramp[ramp.length - 1].z, p.x, p.z, isFree, placeGround, null) || [{ x: p.x, z: p.z }])
      : onHigh(p.x, p.z) ? [{ x: p.x, z: p.z }] : planPath(x, z, p.x, p.z, isFree, placeGround, null) || [{ x: p.x, z: p.z }];
  const out = pts.map((q) => ({ x: q.x, z: q.z }));
  if (!out.length || Math.hypot(out[out.length - 1].x - p.x, out[out.length - 1].z - p.z) > 0.3) out.push({ x: p.x, z: p.z });
  return out;
}

/** createGuide39({ E, freeFor(p) → isFree, clock() → s }) → { dir(h, drag), targets(), state(), reset() } */
export function createGuide39(o = {}) {
  const E = o.E,
    freeFor = o.freeFor,
    clock = o.clock || (() => (typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000));
  const st = { id: null, key: '', pts: null, i: 0, t0: 0, ox: NaN, oz: NaN, bx: NaN, bz: NaN, bt: 0, n: 0, picks: 0, replans: 0, arrived: null };
  function targets() {
    let s = null;
    try { s = E && E.state ? E.state() : null; } catch (e) { s = null; }
    if (!s || s.phase !== 'run' || s.acting) return [];
    const out = [];
    try {
      const n = E.flowNext ? E.flowNext() : null;
      if (n && n.at && Number.isFinite(n.at.x)) out.push({ id: n.id, at: n.at });
    } catch (e) { /* the engine's */ }
    try {
      for (const a of (E.alt39 ? E.alt39() : []) || []) if (a && a.at && !out.some((q) => q.id === a.id)) out.push({ id: a.id, at: a.at });
    } catch (e) { /* the engine's */ }
    return out;
  }
  // (the floors by the place, and the place of slaughter's floor while he stands on it — day33 rings27, the twin's pass with the blood
  // roles: the zorek's way out of the rings to the altar's corners; the chambers' block round it stays a wall)
  const floors = (h, T) => {
    if (!freeFor) return () => true;
    const a = freeFor(T.at);
    return rings27(h.x, h.z) && !rings27(T.at.x, T.at.z) ? (x, z) => a(x, z) || rings27(x, z) : a;
  };
  function plan(h, T) {
    st.pts = way39(h.x, h.z, T.at, floors(h, T));
    st.i = 0;
    st.t0 = clock();
    st.ox = h.x;
    st.oz = h.z;
    st.replans++;
  }
  /** the unit direction toward the first way point of T's way from h (for the drag's choice) */
  function head(h, T) {
    const pts = way39(h.x, h.z, T.at, floors(h, T));
    for (const q of pts) {
      const d = Math.hypot(q.x - h.x, q.z - h.z);
      if (d > G39.pass) return { x: (q.x - h.x) / d, z: (q.z - h.z) / d };
    }
    const d = Math.hypot(T.at.x - h.x, T.at.z - h.z) || 1;
    return { x: (T.at.x - h.x) / d, z: (T.at.z - h.z) / d };
  }
  function choose(h, T, drag) {
    if (T.length === 1) return T[0];
    const cur = T.find((q) => q.id === st.id) || T[0];
    if (!drag) return cur;
    let best = cur,
      bd = -2;
    const dc = (() => { const v = head(h, cur); return v.x * drag.x + v.z * drag.z; })();
    for (const q of T) {
      const v = head(h, q),
        d = v.x * drag.x + v.z * drag.z;
      if (d > bd) { bd = d; best = q; }
    }
    if (best !== cur && bd - dc < G39.hyst) best = cur;
    if (best.id !== st.id) st.picks++;
    return best;
  }
  /** h: the hero {x, z}; drag: the world direction of the thumb's drag {x, z} (unit) or null → { x, z, k, id } | null (no target or
   *  arrived: stand) */
  function dir(h, drag) {
    const T = targets();
    if (!T.length || !h) { st.id = null; st.pts = null; st.arrived = null; return null; }
    const tg = choose(h, T, drag);
    const key = `${tg.id}:${Math.round(tg.at.x * 4)}:${Math.round(tg.at.z * 4)}`;
    const now = clock();
    if (tg.id !== st.id || key !== st.key || !st.pts) { st.id = tg.id; st.key = key; plan(h, tg); st.bx = h.x; st.bz = h.z; st.bt = now; }
    // (blocked — no headway for stuckS: a new way from where he stands)
    if (Math.hypot(h.x - st.bx, h.z - st.bz) > 0.25) { st.bx = h.x; st.bz = h.z; st.bt = now; }
    else if (now - st.bt > G39.stuckS) {
      // (no headway: near the place — a fence, a vessel's foot, the place itself in a solid — he is there: stand; else a new way from here)
      if (Math.hypot(tg.at.x - h.x, tg.at.z - h.z) <= G39.near) { st.arrived = tg.id; return null; }
      plan(h, tg); st.bx = h.x; st.bz = h.z; st.bt = now;
    }
    else if (now - st.t0 > G39.replanS) {   // (pushed off the way — a wall's slide, a crowd: a new way once he is replanMove off its leg)
      const a = st.i > 0 ? st.pts[st.i - 1] : { x: st.ox, z: st.oz }, b = st.pts[st.i], ux = b.x - a.x, uz = b.z - a.z, L2 = ux * ux + uz * uz,
        u = L2 > 1e-6 ? Math.max(0, Math.min(1, ((h.x - a.x) * ux + (h.z - a.z) * uz) / L2)) : 0;
      if (Math.hypot(h.x - (a.x + ux * u), h.z - (a.z + uz * u)) > G39.replanMove) plan(h, tg);
    }
    const pts = st.pts,
      end = pts[pts.length - 1],
      left = Math.hypot(end.x - h.x, end.z - h.z);
    if (left <= G39.arrive) { st.arrived = tg.id; return null; }
    st.arrived = null;
    while (st.i < pts.length - 1 && Math.hypot(pts[st.i].x - h.x, pts[st.i].z - h.z) <= G39.pass) st.i++;
    const q = pts[st.i],
      d = Math.hypot(q.x - h.x, q.z - h.z) || 1;
    st.n++;
    return { x: (q.x - h.x) / d, z: (q.z - h.z) / d, k: Math.max(G39.minK, Math.min(1, left / G39.slowIn)), id: tg.id, left };   // ── build 51 ── (left: the way still to go — twin.js WALK51 slows him near the place) ── /build 51 ──
  }
  return {
    dir,
    targets,
    reset() { st.id = null; st.pts = null; st.key = ''; },
    state: () => ({ id: st.id, arrived: st.arrived, pts: st.pts ? st.pts.map((q) => [Math.round(q.x * 10) / 10, Math.round(q.z * 10) / 10]) : null, i: st.i, n: st.n, picks: st.picks, replans: st.replans }),
  };
}
