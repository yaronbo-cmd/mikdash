/* ── build 130 ── h130/eve.js — the stage's ending, "ולא היתה חצר בירושלים שאינה מאירה מאור בית השואבה" (spec "הסיום"; brief §6),
 * right after the fourth bowl, all in the game's world:
 *   dusk   evening falls on the world (the world's clock: the pack's time.setTime('dusk') → 'night')
 *   rise   the four flames burn at the menorah's head and the camera rises with them over the wall (BOOK.s05.eve.cam.rise)
 *   city   the courtyards of Jerusalem (the city of src/city.js) light up one by one, the nearest first; how far the light reaches is
 *          the light's own result (model.js lightOf: the oil in the bowls and the wicks he chose → st.light.reach)
 *   down   the camera comes down (eve.cam.down): men with torches below, women above in the gallery he built; a column badly placed (one
 *          at the end of a sagging or cracked span) throws a long shadow across the court
 *   card   a small card with the stage's score, the world behind it; then the act ends (the pack's finale plays the film, then the end
 *          card). From here on the menorah burns in every night the game shows (light3d.js lightSync: the lit bowls and their glow).
 * No Levites on the fifteen steps: they are built in stage 06. A tap during the rise, the city or the descent moves to the next beat.
 * Pure helpers (tested): reachRadius, cityLit, badCols, evePts.
 */
import { LINES, RUNS, spans, colXZ, qOf, starsOf, lightOf } from './model.js';
import { SH130, GEO, Y } from './world.js';
import { lightWorld, lightSync, SL } from './light3d.js';
import { card, esc } from '../h129/ui7.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, EV = S5.eve, LT = S5.light, FLOOR = S5.court.floor;
/** the ending's numbers: how far the light reaches over the city (amot from the menorah: the least and the most), the courtyards drawn,
 *  each beat's seconds, the shadow's length and width (amot), the figures below and above */
export const EK = Object.freeze({
  R0: 260, R1: 1900, MAXP: 1400, LAMP_I: 900, LAMP_D: 170, LAMP_K: 1.6, DUSK: 2.6, RISE: 4.0, CITY: 7.0, DOWN: 4.5, SHADOW: 34, SHADOW_W: 1.4, MEN: 14, WOMEN: 4, ARC: 0.7,
});
export const ELINES = Object.freeze({
  title: 'הערב', walk: 'הערב: האור של בית השואבה',
  score: 'עזרת הנשים', pts: 'נקודות', stars: 'כוכבים',
});
/** amot from the menorah the light reaches over the city, for a reach 0 … 1 */
export const reachRadius = (reach) => EK.R0 + (EK.R1 - EK.R0) * Math.max(0, Math.min(1, +reach || 0));
/** how many of the courtyards (their distances from the menorah, sorted) are lit at a reach, and at a moment u (0 … 1) of the wave */
export function cityLit(dists, reach, u = 1) {
  // (the wave runs over the courtyards the light reaches, nearest first: the city's nearest houses stand far from the menorah, and a
  //  wave over the radius from 0 left the city dark for half its beat — build 130 part 3)
  const R = reachRadius(reach);
  let n = 0; while (n < dists.length && dists[n] <= R) n++;
  return Math.floor(n * Math.max(0, Math.min(1, u)));
}
/** the badly placed columns: the columns at the ends of a sagging or cracked span, per side → [{ side, a, x, z, kind }] */
export function badCols(gal) {
  const out = [];
  for (const [side, L] of Object.entries(gal || {})) {
    const R = RUNS[side]; if (!R || !L || !Array.isArray(L.cols)) continue;
    const cols = L.cols.map(Number);
    for (const g of spans(R, cols)) {
      if (g.kind === 'ok' || g.kind === 'straight') continue;
      for (const a of [g.a0, g.a1]) if (cols.some((c) => Math.abs(c - a) < 1e-6) && !out.some((q) => q.side === side && Math.abs(q.a - a) < 1e-6)) { const [x, z] = colXZ(R, a); out.push({ side, a, x, z, kind: g.kind }); }
    }
  }
  return out;
}
/** the evening's own points: the light's reach (40 the city lit whole, 20 most of it, 10 less) */
export const evePts = (reach) => (reach >= 0.75 ? 40 : reach >= 0.4 ? 20 : 10);

/* ───────── the city's courtyards: warm glows on the houses round the Mount, ordered by distance from the menorah ───────── */
const GLOW_PX = 64;   // (the glow's canvas, px)
function glowTex(T) {
  const c = document.createElement('canvas'), h = GLOW_PX / 2; c.width = c.height = GLOW_PX; const g = c.getContext('2d');
  const r = g.createRadialGradient(h, h, 0, h, h, h); r.addColorStop(0, 'rgba(255,236,190,1)'); r.addColorStop(0.35, 'rgba(255,180,90,0.55)'); r.addColorStop(1, 'rgba(255,140,40,0)');
  g.fillStyle = r; g.fillRect(0, 0, GLOW_PX, GLOW_PX);
  const t = new T.CanvasTexture(c); t.needsUpdate = true; return t;
}
function cityPoints(X) {
  const T = X.THREE, P = [], [mx, mz] = LT.menorah, v = new T.Vector3(), M4 = new T.Matrix4();
  X.scene.traverse((o) => {
    if (!o.isInstancedMesh || P.length > 8000) return;
    let p = o, isCity = false; while (p) { if (/city/i.test(p.name || '')) { isCity = true; break; } p = p.parent; } if (!isCity) return;
    o.updateMatrixWorld(true);
    for (let i = 0; i < o.count; i += 3) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); const d = Math.hypot(v.x - mx, v.z - mz); if (d > 150) P.push([v.x, v.y, v.z, d]); }
  });
  P.sort((a, b) => a[3] - b[3]);
  const step = Math.max(1, Math.floor(P.length / EK.MAXP)), U = P.filter((_, i) => i % step === 0).slice(0, EK.MAXP);
  const pos = new Float32Array(U.length * 3); U.forEach((p, i) => { pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1] + 4; pos[i * 3 + 2] = p[2]; });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setDrawRange(0, 0);
  const pts = new T.Points(geo, new T.PointsMaterial({ size: 9, sizeAttenuation: false, map: glowTex(T), transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xFFC27A, fog: false }));
  pts.name = 'h130-eve-city'; pts.frustumCulled = false; pts.renderOrder = 4;
  return { pts, dists: U.map((p) => p[3]) };
}

export const EVE = {
  icon: '🌙', title: ELINES.title,
  walkLine: () => ELINES.walk,
  stand: () => { const [x, z] = LT.menorah; return { x: x + 9, z: z + 9, face: [x, z] }; },
  make(m, X) { return makeEve(m, X); },
};

function makeEve(m, X) {
  const T = X.THREE, M = X.M, st = M.st, A = { phase: 'dusk', t: 0, ended: false, lit: 0, n: 0, reach: 0, figs: 0, shadows: 0, beat: 0 };
  const root = new T.Group(); root.name = 'h130-eve'; X.props.root.add(root);
  const own = [];
  const time = () => { try { return X.pack && X.pack.time; } catch (e) { return null; } };
  const wait = async (s) => { const b = A.beat; const t0 = A.t; while (A.t - t0 < s && A.beat === b) { await X.wait(0.1); if (A.ended) throw new Error('eve ended'); } };
  const L = st.light || {}, reach = Number.isFinite(+L.reach) ? +L.reach : (Array.isArray(L.bowls) ? lightOf(L.bowls, L.wicks || []).reach : 0.5);
  A.reach = +reach.toFixed(3);
  let city = null, light = null;
  function figures() {
    // (gang: the act's own men for the figures gate — a figure it does not own it takes out of the act's frame, and the evening's crowd
    //  was never seen; build 130 part 3)
    const AC = X.actors && X.actors(); if (!AC) return;
    const [mx, mz] = LT.menorah;
    // the men below, round the menorah with torches (a ring, its open side toward the camera's descent)
    // (the men stand in an arc on the menorah's far side from the descent's camera, EK.ARC radians each way: a ring's near side stood
    //  at the frame's foot, its flanks at the frame's edges, and they were cut once the camera settled — build 130 closing)
    const e = EV.cam.down[0], a0 = Math.atan2(e[2] - mz, e[0] - mx) + Math.PI;
    for (let i = 0; i < EK.MEN; i++) {
      const a = a0 + ((i + 0.5) / EK.MEN - 0.5) * 2 * EK.ARC, r = 11 + (i % 3) * 2.5, x = mx + Math.cos(a) * r, z = mz + Math.sin(a) * r;
      const f = AC.add('pilgrim', x, z, { yaw: Math.atan2(mx - x, mz - z), item: 'torch', fadeIn: false }); if (f) { f.gang = 1; own.push(f); }
    }
    // the women above, along the galleries he built (on the floor, behind the railing)
    for (const side of ['N', 'S', 'E']) {
      const R = RUNS[side], G = M.galOf ? M.galOf(side) : null; if (!R || !G) continue;
      const s = Math.sign(R.wall - R.line), across = R.line + s * 2.2;
      for (let i = 0; i < EK.WOMEN; i++) {
        const al = R.a0 + ((i + 0.5) / EK.WOMEN) * (R.a1 - R.a0); if (R.cut && al > R.cut[0] - 1 && al < R.cut[1] + 1) continue;
        const x = R.axis === 'x' ? al : across, z = R.axis === 'x' ? across : al;
        const f = AC.add('woman', x, z, { y: Y.GFLOOR, yaw: Math.atan2(mx - x, mz - z), fadeIn: false }); if (f) { f.y = f.fixedY = Y.GFLOOR; f.gang = 1; own.push(f); }
      }
    }
    A.figs = own.length;
  }
  function shadows() {
    const B = badCols(st.gal || {}), [mx, mz] = LT.menorah;
    const mat = new T.MeshBasicMaterial({ color: 0x05040A, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    for (const c of B) {
      const dx = c.x - mx, dz = c.z - mz, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
      // (a strip from the column's foot away from the flames: laid flat, its length along the way (ux, uz))
      const g = new T.PlaneGeometry(EK.SHADOW_W, EK.SHADOW); g.translate(0, EK.SHADOW / 2, 0);
      const s = new T.Mesh(g, mat); s.rotation.x = -Math.PI / 2; s.renderOrder = 3;
      const turn = new T.Group(); turn.rotation.y = Math.atan2(-ux, -uz); turn.position.set(c.x, FLOOR + 0.03, c.z); turn.add(s); root.add(turn);
    }
    A.shadows = B.length;
  }
  /** the city shot's aim: the middle of the courtyards the light will reach (the book's aim looked over the Mount away from the
   *  houses: the city still showed the court's walls and no courtyard — build 130 part 3); the book's aim when the city is not drawn */
  function cityAim(c) {
    if (!city || !city.dists.length) return c[1];
    // (the houses stand round the Mount: the side with the most of them, in twelve sectors round the menorah, and their middle)
    const n = Math.max(1, cityLit(city.dists, reach, 1)), p = city.pts.geometry.attributes.position.array, [mx, mz] = LT.menorah;
    const B = Array.from({ length: 12 }, () => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const k = Math.floor(((Math.atan2(p[i * 3 + 2] - mz, p[i * 3] - mx) + Math.PI) / (Math.PI * 2)) * 12) % 12, b = B[k];
      b[0] += p[i * 3]; b[1] += p[i * 3 + 1]; b[2] += p[i * 3 + 2]; b[3]++;
    }
    const b = B.reduce((m, q) => (q[3] > m[3] ? q : m));
    return [b[0] / b[3], b[1] / b[3], b[2] / b[3]];
  }
  function score() {
    const r = st.res || {}, pts = Object.values(r).reduce((a, q) => a + (q.pts | 0), 0), stars = Object.values(r).reduce((a, q) => a + (q.stars | 0), 0);
    const loss = (st.marks || []).length;
    return { pts, stars, loss };
  }
  async function run() {
    const C = EV.cam, [mx, mz] = LT.menorah, head = [mx, FLOOR + 50, mz];
    X.kohen(false); X.hand(null); X.line('');
    try { lightWorld(X, st); lightSync(X, st); } catch (e) { /* */ }
    // dusk
    try { const E = time(); if (E && E.setTime) E.setTime('dusk'); } catch (e) { /* */ }
    X.shot([mx + 26, FLOOR + 14, mz + 34], head, 0.01); await wait(EK.DUSK);
    try { const E = time(); if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ }
    light = new T.PointLight(0xFFB060, EK.LAMP_I, EK.LAMP_D, EK.LAMP_K); light.position.set(mx, FLOOR + 51, mz); root.add(light);
    // rise with the flames over the wall
    A.phase = 'rise'; A.beat++;
    X.shot(C.rise[0], C.rise[1], EK.RISE); await wait(EK.RISE + 0.6);
    // the city's courtyards, one by one
    A.phase = 'city'; A.beat++;
    try { city = cityPoints(X); root.add(city.pts); A.n = city.dists.length; } catch (e) { city = null; }
    X.shot(C.city[0], cityAim(C.city), 2.4); X.line(LINES.eve, 0); await wait(2.0);
    A.cityT = A.t;
    await wait(EK.CITY);
    if (city) { A.lit = cityLit(city.dists, reach, 1); city.pts.geometry.setDrawRange(0, A.lit); }
    // down: men with torches below, women above; a badly placed column's long shadow
    A.phase = 'down'; A.beat++;
    X.line(LINES.eveAhead, 0);
    try { figures(); } catch (e) { console.warn('[h130] eve figures', e && e.message); }
    try { shadows(); } catch (e) { console.warn('[h130] eve shadows', e && e.message); }
    X.shot(C.down[0], C.down[1], EK.DOWN); await wait(EK.DOWN + 1.2);
    // the card with the score, the world behind it
    A.phase = 'card'; A.beat++; X.line('');
    const S = score();
    await card(X, `<b style="font-size:20px">${esc(ELINES.score)}</b><p style="margin:10px 0">${esc(LINES.eve)}</p><p style="margin:6px 0;font-size:22px">${S.pts} ${esc(ELINES.pts)} · ${S.stars} ${esc(ELINES.stars)} ★</p><small>${esc(LINES.eveAhead)}</small>`, 9000);
    finish();
  }
  function finish() {
    if (A.ended) return;
    const pts = evePts(reach), q = qOf(pts);
    X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, at: { x: LT.menorah[0], y: FLOOR + 2, z: LT.menorah[1] }, flags: { reach: A.reach, lit: A.lit, of: A.n, shadows: A.shadows } });
  }
  return {
    close: true,
    begin() { run().catch((e) => { if (!A.ended) { console.warn('[h130] eve', e && e.message); finish(); } }); },
    update(dt) {
      A.t += dt;
      if (city && A.phase === 'city' && A.cityT != null) { const u = Math.min(1, (A.t - A.cityT) / EK.CITY); A.lit = cityLit(city.dists, reach, u); city.pts.geometry.setDrawRange(0, A.lit); }
      if (light) light.intensity = 820 + 160 * Math.sin(A.t * 7.3) * Math.sin(A.t * 2.9);
    },
    down() { if (A.phase === 'rise' || A.phase === 'city' || A.phase === 'down') A.beat++; },
    move() {}, up() {}, wants: () => false, holds: () => false, cancel() {},
    at() { return { x: LT.menorah[0], y: FLOOR + 2, z: LT.menorah[1] }; },
    end() {
      A.ended = true;
      const AC = X.actors && X.actors(); for (const f of own) { try { AC.remove(f); } catch (e) { /* */ } }
      // (the city's courtyards and the court's glow belong to the evening; the menorah's own glow stays with the light's world)
      try { X.props.remove(root); } catch (e) { try { root.parent && root.parent.remove(root); } catch (e2) { /* */ } }
      try { const E = time(); if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ }
      void SH130; void GEO; void SL;
    },
    dbg() { return { id: m.id, phase: A.phase, t: +A.t.toFixed(1), lit: A.lit, of: A.n, reach: A.reach, figs: A.figs, shadows: A.shadows }; },
  };
}
