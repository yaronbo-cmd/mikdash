/* ─────────────────────────────────────────────────────────────────────────────
 * avodah3d.js — world.avodah (PROJECT.md §12): the scripted world layer of the service, driven by src/avodah/*.
 *   const av = createAvodah3D({ scene, camera, life })   (or { scene, camera, animals, blobs, ground } in a test scene)
 *   av.kohen(id, { garments: 'kohen' | 'gadol' | 'gadol-white', role, at }) → { walkTo(place) → P, face(target) → P,
 *       carry(item | null), pose(p) → P, remove(), + place(place, yaw) (instant), look(target | null), position, item }
 *     (the same id returns the same kohen; new kohanim come out of Lishkat HaGazit unless `at` is given)
 *   av.animal(kind, at, { by }) → { leadTo(place, { by }) → P, inspect(on), hide() → P, show() → P, remove(), position }
 *     (animal('lamb', 'lambsChamber') walks one of the six checked lambs out of its chamber; a kohen within 10 amot,
 *     or `by`, leads it on a rope)
 *   av.slaughter(animal, at = the morning ring, { onCut, kohen, mekabel }) → P · av.sprinkle(corner, level, { kohen }) → P
 *   av.limbs('kevesh' | 'salt' | 'fire', { gadol }) → P · av.libation('wine' | 'water') → P · av.trumpets({ stay }) → P
 *   av.levites(on) → P · av.blessing(on) → P · av.bow(on) → P · av.fire(level) · av.smoke(level)   (level 0…3, 1 = daily)
 *   av.pilgrim(offering | kind, { to, woman }) → { pilgrim, animal, animals?, arrived: P, remove() } · av.pilgrims(n)
 *   av.birdOffering('olah' | 'chatat') → P · av.pens.fill(n) → n · av.lambsChamber.count(n) → n
 *   av.update(dt) — in the full world it runs inside life.update (so __T.step / render advance it too).
 *   extra: av.pick(raycaster) → { kind: 'kohen' | 'levite' | 'pilgrim' | 'animal', id, variant | species, handle } | null
 *          av.ambient(on) — pilgrims coming and going, kohanim washing at the kiyor (on by default in the full world)
 *          kohen handle .wash() → P (hands and feet at the kiyor, Tamid 1:4)
 *          ── water ── (WATER, wave 6) av.useWater(world.water) (main.js): wash() then pours a spigot's stream on the hands
 *          and feet; sprinkle('SW', 'yesod') and av.shirayim('S' | 'W', { kohen }) → P pour the rest of the blood as a thin
 *          trickle into the two holes at the SW corner (Middot 3:2; Yoma 5:6) — the guarded hook for the step that pours
 *          it; libation(kind) pours into its bowl and the bowls empty (Sukkah 4:9). Without world.water: as before.
 *   Places: a name (kiyor altar maaracha altarTop kevesh keveshFoot keveshTop limbs ring ringMorning ringAfternoon rings
 *   tables NE NW SE SW shitin ulamSteps heichalDoor duchan ezratYisrael nikanor lambsChamber moked gazit korban nitzotz
 *   mayim delek bechorot salt parva rinse deshen), a places.js object (KIYOR, TAMID_RING, GATES.korban, …), [x, z] or
 *   { x, z }, or another actor / animal handle.
 * Every Promise resolves when its motion ends (true, or false when replaced/unknown) and never rejects; unknown
 * arguments are ignored. Times are simulation time (update(dt)), not wall-clock.
 * Dignity (PROJECT.md §2.9): no knife, no wound, no spray. slaughter() asks the camera to cut away (opts.onCut),
 * hides the calm animal in a 0.4 s dip and ends with a little dark red inside the kohen's mizrak; blood is otherwise
 * only a soft mark on the altar that fades.
 * Sources for the choreography (drafting aids for the content agent to verify, PROJECT.md §2.1): Tamid 1:4, 3:3–7:3,
 * Middot 1:4–8, 3:1–5, Zevachim 5:4, 6:2–5, Sukkah 4:9, Sotah 38a, Yoma 3:10, 25a, Arachin 2:3–6, Pesachim 58b.
 * Where they are silent (which way the Levites face, where exactly the trumpeters stand, spacing): illustration.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import * as PL from './places.js';
import { createAnimals, Blobs, ANIMAL_KINDS } from './animals.js';
import { createActors, ITEMS } from './actors.js';
import { buildPens, buildLambsChamber } from './pens.js';
import { terrainH } from './world.js';
import { BLOOD, gameMin, markStage, nextDawn } from './avodah/works/blood.js';   // ── blooda25 ── (the marks' colours and their day clock)

const { ALTAR, KEVESH, KIYOR, TAMID_RING, LIMBS_PLACE, SHITIN, LEVEL, LAMBS_CHAMBER, GATES, MAARACHOT } = PL;
const XR12 = [-55, -56, -57, -60, -61, -62, -65, -66, -67, -70, -71, -72];   // the 12 steps up to the Ulam (temple.js)
const TOP = ALTAR.body;                                                          // the altar's top: x −52…−24, z −17.5…10.5
const RAMP_Y = (z) => LEVEL.azara + (KEVESH.zFoot - z) / (KEVESH.zFoot - KEVESH.zTop) * (LEVEL.altarTop - LEVEL.azara);

/** floor height anywhere the service goes (courts, steps, kevesh, altar top, lambs' chamber; outside: the Mount) */
export function groundY(x, z) {
  if (x >= TOP.x0 && x <= TOP.x1 && z >= TOP.z0 && z <= TOP.z1) return LEVEL.altarTop;
  if (x >= KEVESH.x0 && x <= KEVESH.x1 && z > KEVESH.zTop && z <= KEVESH.zFoot) return RAMP_Y(z);
  const az = Math.abs(z);
  if (x > -76.2 && x < -54.5 && az < 50) { let n = 0; for (const xr of XR12) if (x <= xr) n++; return LEVEL.azara + 0.5 * n; }
  if (x <= -76.2 && x >= -92 && az < 30) return LEVEL.heichal;
  if (x < -92 && x > -176 && az < 10) return LEVEL.heichal;
  if (x > -187 && x <= -11 && az <= 67.5) return LEVEL.azara;
  if (x >= -178 && x <= -142 && z >= -83 && z < -67.5) return LEVEL.azara;
  if (x > -11 && x <= -10 && az <= 67.5) return 15.5;
  if (x > -10 && x <= -9 && az <= 67.5) return 15;
  if (x > -9 && x <= -8 && az <= 67.5) return 14.5;
  if (x > -8 && x <= 0 && az <= 67.5) return LEVEL.yisrael;
  if (x > 0 && x < 24 && az < 14) { const r = Math.hypot(x - 10, z); return x < 10 ? LEVEL.yisrael : Math.max(LEVEL.nashim, Math.min(LEVEL.yisrael, LEVEL.yisrael - (r - 6.5))); }
  if (x > -203 && x < 157 && az < 83.5) return LEVEL.chel;
  if (x > -300 && x < 277 && z > -480 && z < 400) return LEVEL.mount;
  return terrainH(x, z);
}
const isHigh = (x, z) => (x >= TOP.x0 - 0.01 && x <= TOP.x1 + 0.01 && z >= TOP.z0 - 0.01 && z <= TOP.z1 + 0.01) || (x >= KEVESH.x0 && x <= KEVESH.x1 && z > KEVESH.zTop && z <= KEVESH.zFoot - 0.5);

/* ───────────────────────── navigation: two small visibility graphs (the floor, and the kevesh + altar top) ───────────────────────── */
const R_ = (x0, x1, z0, z1) => ({ x0, x1, z0, z1 });
const FLOOR_OBS = [
  R_(-54.9, -21.1, -20.4, 13.4),               // the altar with its yesod
  R_(-46.9, -29.1, 13.4, 42.9),                // the kevesh
  R_(-66.1, -60.9, 17.4, 22.6),                // the kiyor
  R_(-176.9, -91.2, -35.9, 35.9), R_(-92, -76.5, -50.9, 50.9),   // the house and the Ulam
  R_(-53.6, -22.4, -61.5, -54.6),              // hook pillars and marble tables (Middot 3:5)
  R_(-100.9, -61.1, 57.1, 83),                 // Lishkat HaGazit
  R_(-84.5, -56.5, -68, -57.6),                // the north chambers (salt, hides, rinsing)
  // Beit HaMoked: its south wall with the door to the azara at GATES.moked (Middot 1:6–8), and the lambs' chamber's
  // east wall with its opening into the hall (the room is the Sanctuary agent's; this is where our path assumes the openings)
  R_(-178.5, -162, -58.8, -57.4), R_(-158, -141.5, -58.8, -57.4), R_(-143, -141, -84, -57.4),
  R_(-167.6, -166.4, -67.6, -64), R_(-167.6, -166.4, -61.2, -57.4),
];
// ── worksa22 ── (the works' dioramas stand on open floor: not on the altar's top or ramp, not in a wall or the house)
export const floorFree = (x, z) => !isHigh(x, z) && !FLOOR_OBS.some((r) => insideR(x, z, r));
// ── /worksa22 ──
const HIGH_OBS = [
  R_(-41.6, -34.4, -7.1, 0.1),                 // the ash heap (tapuach) in the middle
  R_(-32.6, -26.4, -6.4, -0.6),                // the great maaracha (east)
  R_(-51.2, -47.8, 5.2, 7.8),                  // the maaracha of the ketoret (south-west)
];
const FLOOR_NODES = [
  [-160, -52], [-150, -52], [-120, -45], [-100, -45], [-84, -54], [-56, -53], [-38, -52.5], [-20, -53], [-16, -24], [-16, 0], [-16, 17],
  [-16, 48], [-26.5, 46], [-38, 46.5], [-49.5, 46], [-56.5, 15], [-56.5, -22], [-59.5, 26], [-68, 30], [-100, 48], [-150, 48], [-38, -24], [-50, -24],
  [-26, -24], [-48.5, 26], [-27, 25], [-5, 0], [-5, 30], [-5, -30], [-38, -64], [-95, -60], [-160, -61], [-164, -62.6], [-160, -55.5],
];
const HIGH_NODES = [[-38, 41.5], [-38, 10.2], [-38, 6.5], [-45, 6.5], [-30, 6.5], [-26, 3], [-26, -12], [-38, -12.5], [-50, -12], [-50.5, 1], [-44, 3.5]];
const segHits = (ax, az, bx, bz, r) => {
  // segment vs rectangle (slab test); points inside the rectangle count as a hit only if the segment crosses it
  let t0 = 0, t1 = 1; const dx = bx - ax, dz = bz - az;
  for (const [p, d, lo, hi] of [[ax, dx, r.x0, r.x1], [az, dz, r.z0, r.z1]]) {
    if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) return false; }
    else { let u0 = (lo - p) / d, u1 = (hi - p) / d; if (u0 > u1) [u0, u1] = [u1, u0]; t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) return false; }
  }
  return t1 - t0 > 1e-4;
};
const insideR = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
function losOK(a, b, obs) {
  for (const r of obs) {
    // (a start or end point inside an obstacle — e.g. standing right at the altar corner — only blocks if the line goes deeper in)
    if (insideR(a[0], a[1], r) || insideR(b[0], b[1], r)) continue;
    if (segHits(a[0], a[1], b[0], b[1], r)) return false;
  }
  return true;
}
function graphRoute(a, b, nodes, obs) {
  if (losOK(a, b, obs)) return [b];
  const P = [a, ...nodes, b], n = P.length, dist = new Array(n).fill(Infinity), prev = new Array(n).fill(-1), done = new Array(n).fill(false);
  dist[0] = 0;
  for (let it = 0; it < n; it++) {
    let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    done[u] = true; if (u === n - 1) break;
    for (let v = 0; v < n; v++) {
      if (done[v] || v === u) continue;
      const d = Math.hypot(P[u][0] - P[v][0], P[u][1] - P[v][1]);
      if (dist[u] + d < dist[v] && losOK(P[u], P[v], obs)) { dist[v] = dist[u] + d; prev[v] = u; }
    }
  }
  if (prev[n - 1] < 0) return [b];               // no way round: go straight (never stuck)
  const out = []; for (let v = n - 1; v > 0; v = prev[v]) out.unshift(P[v]);
  return out;
}
// ── engine22 ── the same solids for the two thumbs' walk (src/avodah/day/world22.js): the walls, the altar, the kevesh, the House, the Ulam, the laver
export const WALLS22 = FLOOR_OBS;
// ── /engine22 ──
const K_FOOT = [-38, 45.2], K_BOTTOM = [-38, 41.5];
/** a list of [x, z] from (x0, z0) to (x1, z1) that keeps off the altar, the kevesh, the house and the walls */
export function route(x0, z0, x1, z1) {
  const a = [x0, z0], b = [x1, z1], ha = isHigh(x0, z0), hb = isHigh(x1, z1);
  const hi = (p, q) => {
    // on the kevesh + top: ramp ↔ top goes through the head of the ramp
    const ramp = (p2) => p2[1] > KEVESH.zTop + 0.3, pts = [];
    if (ramp(p) !== ramp(q)) pts.push([-38, 9.5]);
    pts.push(q);
    const out = []; let s = p;
    for (const t of pts) { out.push(...graphRoute(s, t, HIGH_NODES, HIGH_OBS)); s = t; }
    return out;
  };
  if (!ha && !hb) return graphRoute(a, b, FLOOR_NODES, FLOOR_OBS);
  if (ha && hb) return hi(a, b);
  if (!ha && hb) return [...graphRoute(a, K_FOOT, FLOOR_NODES, FLOOR_OBS), ...hi(K_BOTTOM, b)];
  return [...hi(a, K_BOTTOM), ...graphRoute(K_FOOT, b, FLOOR_NODES, FLOOR_OBS)];
}

/* ───────────────────────── named places (and aliases from places.js) ───────────────────────── */
const ringStand = (r) => ({ x: r[0], z: r[1], face: [r[0], r[1] + 3] });
const C = PL.ALTAR_CORNERS;
const PLACE = {
  kiyor: { x: KIYOR.x + 3.1, z: KIYOR.z, face: [KIYOR.x, KIYOR.z] },
  altar: { x: -29.5, z: 1.4, face: [MAARACHOT.great.x, MAARACHOT.great.z] },
  maaracha: { x: -29.5, z: 1.4, face: [MAARACHOT.great.x, MAARACHOT.great.z] },
  altartop: { x: -38, z: 7, face: [-38, -3.5] },
  kevesh: { x: -38, z: 28, face: [-38, 10] }, keveshfoot: { x: -38, z: 45.5, face: [-38, 30] }, keveshtop: { x: -38, z: 9, face: [-38, -3.5] },
  limbs: { x: -42.4, z: 34, face: [LIMBS_PLACE.x, 34] }, limbsplace: { x: -42.4, z: 34, face: [LIMBS_PLACE.x, 34] },
  ring: ringStand(TAMID_RING.morning), tamidring: ringStand(TAMID_RING.morning), ringmorning: ringStand(TAMID_RING.morning), ringafternoon: ringStand(TAMID_RING.afternoon),
  rings: { x: -38, z: -40, face: [-38, -30] }, slaughter: { x: -38, z: -40, face: [-38, -30] }, tables: { x: -38, z: -53.4, face: [-38, -56] },
  ne: { x: C.NE[0] + 2.3, z: C.NE[1] - 2.4, face: C.NE }, nw: { x: C.NW[0] - 2.5, z: C.NW[1] - 2.4, face: C.NW },
  se: { x: C.SE[0] + 2.3, z: C.SE[1] + 2.3, face: C.SE }, sw: { x: C.SW[0] - 2.5, z: C.SW[1] + 2.4, face: C.SW },
  shitin: { x: -49.4, z: 8.2, face: [-51.6, 10] },
  ulamsteps: { x: -60.5, z: 0, face: [-30, 0] }, heichaldoor: { x: -74, z: 0, face: [-95, 0] },
  duchan: { x: -8.5, z: 0, face: [-30, 0] }, ezratyisrael: { x: -4, z: 0, face: [-30, 0] }, nikanor: { x: -3, z: 0, face: [-30, 0] },
  lambschamber: { x: (LAMBS_CHAMBER.x0 + LAMBS_CHAMBER.x1) / 2, z: (LAMBS_CHAMBER.z0 + LAMBS_CHAMBER.z1) / 2, face: [-150, -62] },
  moked: { x: GATES.moked.x, z: -55.5, face: [-150, -50] }, mokeddoor: { x: GATES.moked.x, z: -55.5, face: [-150, -50] },
  gazit: { x: -81, z: 55.5, face: [-81, 40] }, korban: { x: GATES.korban.x, z: -61, face: [-95, -40] }, nitzotz: { x: -38, z: -64, face: [-38, -50] },
  mayim: { x: -38, z: 64, face: [-38, 50] }, delek: { x: -160, z: 64, face: [-160, 50] }, bechorot: { x: -118, z: 64, face: [-118, 50] },
  salt: { x: -79.5, z: -55.2, face: [-79.5, -60] }, parva: { x: -70.5, z: -55.2, face: [-70.5, -60] }, rinse: { x: -61.5, z: -55.2, face: [-61.5, -60] },
  deshen: { x: -27.4, z: 18, face: [-29.3, 18] },
};
const ALIAS = { gateskorban: 'korban', gatesnitzotz: 'nitzotz', gatesmoked: 'moked', gatesmayim: 'mayim', gatesnikanor: 'nikanor', beithamoked: 'moked', maarachot: 'maaracha',
  maarachotgreat: 'maaracha', great: 'maaracha', top: 'altartop', desheplace: 'deshen', deshenplace: 'deshen', lishkatgazit: 'gazit', lambs: 'lambschamber',
  saltchamber: 'salt', northchamberssalt: 'salt', ringsnorth: 'rings', northeast: 'ne', northwest: 'nw', southeast: 'se', southwest: 'sw', sovev: 'altartop' };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '');
// the places.js objects themselves are accepted too (walkTo(PL.KIYOR), slaughter(lamb, PL.TAMID_RING), …)
const BY_OBJ = new Map([[PL.ALTAR, 'altar'], [PL.KEVESH, 'kevesh'], [PL.KIYOR, 'kiyor'], [PL.SHITIN, 'shitin'], [PL.LIMBS_PLACE, 'limbs'], [PL.TAMID_RING, 'ring'],
  [PL.RINGS, 'rings'], [PL.LAMBS_CHAMBER, 'lambschamber'], [PL.BEIT_HAMOKED, 'moked'], [PL.MAARACHOT, 'maaracha'], [PL.GAZIT, 'gazit'], [PL.DUCHAN, 'duchan'],
  [PL.ULAM_STEPS, 'ulamsteps'], [PL.DESHEN_PLACE, 'deshen'], [PL.HOOK_PILLARS, 'tables'], [PL.MARBLE_TABLES, 'tables'], [PL.HEICHAL_DOOR, 'heichaldoor'],
  [PL.NORTH_CHAMBERS, 'salt'], [PL.ALTAR_CORNERS, 'ne']].filter(([o]) => o));
/** place → { x, z, face? } or null */
function resolvePlace(p) {
  if (!p && p !== 0) return null;
  if (Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1])) return { x: +p[0], z: +p[p.length === 3 ? 2 : 1] };
  if (typeof p === 'object') {
    if (BY_OBJ.has(p)) { const q = PLACE[BY_OBJ.get(p)]; return { x: q.x, z: q.z, face: q.face }; }
    if (PL.GATES && Object.values(PL.GATES).includes(p)) { const k = Object.keys(PL.GATES).find((g) => PL.GATES[g] === p), q = PLACE[k]; if (q) return { x: q.x, z: q.z, face: q.face }; }
    if (p._a) return { x: p._a.x, z: p._a.z };
    if (p._h) return { x: p._h.x, z: p._h.z };
    if (isFinite(p.x) && isFinite(p.z)) return { x: +p.x, z: +p.z, face: p.face };
    if (isFinite(p.x0) && isFinite(p.x1) && isFinite(p.z0) && isFinite(p.z1)) return { x: (p.x0 + p.x1) / 2, z: (p.z0 + p.z1) / 2 };
    return null;
  }
  const k = norm(p), q = PLACE[k] || PLACE[ALIAS[k]];
  return q ? { x: q.x, z: q.z, face: q.face } : null;
}

/* ───────────────────────── blood marks on the altar (one draw call) ───────────────────────── */
function makeMarks(scene) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  for (let i = 0; i < 9; i++) {
    const px = 32 + (Math.sin(i * 2.3) * 9), py = 26 + i * 2.6, r = 13 - i * 0.9, g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshLambertMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), mat, 48);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(48 * 3).fill(1), 3);
  m.count = 0; m.frustumCulled = false; m.renderOrder = 2; m.name = 'altar-marks'; scene.add(m);
  const list = [], DARK = new THREE.Color(BLOOD.mark), PLASTER = new THREE.Color('#EFE9DC'), col = new THREE.Color();
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
  return {
    // ── blooda25 ── a mark ages by the DAY's clock when the day runs (DAM25 ⚑4: wet 20′ → dry to 90′ → a trace to the evening; gone at
    // dawn; at most 8 per corner); without the day (Phase A, the harness) by real seconds as before (120 s, fading from 30 s)
    add(x, y, z, nx, nz, w, h, flat = false, corner = '') {
      if (corner) { let c = 0; for (const k of list) if (k.corner === corner) c++; if (c >= 16) list.splice(list.findIndex((k) => k.corner === corner), 1); }
      if (list.length >= 48) list.shift(); list.push({ x, y, z, nx, nz, w, h, flat, t: 0, life: 120, born: gameMin(), corner });
    },
    update(dt) {
      let n = 0; const gm = gameMin();
      for (let i = list.length - 1; i >= 0; i--) { const k = list[i]; k.t += dt; if (k.born == null || gm == null ? k.t > k.life : gm >= nextDawn(k.born) || gm < k.born - 1) list.splice(i, 1); }
      for (const k of list) {
        let a, d = 0.62;
        if (k.born != null && gm != null) { const st = markStage(gm - k.born); k.stage = st.stage; a = Math.min(1, k.t / 0.35); d = st.k; DARK.set(st.hex); }
        else { a = Math.min(1, k.t / 0.35) * (1 - Math.max(0, (k.t - 30) / (k.life - 30))); DARK.set(BLOOD.mark); }
        col.copy(PLASTER).lerp(DARK, d * a);
        if (k.flat) E.set(-Math.PI / 2, 0, 0); else E.set(0, Math.atan2(k.nx, k.nz), 0);
        Q.setFromEuler(E); P.set(k.x, k.y, k.z); S.set(k.w, k.h, 1); M4.compose(P, Q, S);
        m.setMatrixAt(n, M4); m.setColorAt(n, col); n++;
      }
      m.count = n; m.visible = n > 0; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    },
    get n() { return list.length; },
    list: () => list.map((k) => ({ x: +k.x.toFixed(2), y: +k.y.toFixed(2), z: +k.z.toFixed(2), corner: k.corner, stage: k.stage || 'wet', t: +k.t.toFixed(2) })),   // ── blooda25 ── (tests)
    clear() { list.length = 0; },
    mesh: m,
  };
}
// where a mark goes: the two faces at a corner of the lower body (below or above the red line), the horn, or the yesod
function cornerMarks(marks0, corner, level) {
  const marks = { add: (x, y, z, nx, nz, w, h, flat) => marks0.add(x, y, z, nx, nz, w, h, flat, corner + ':' + level) };   // ── blooda25 ── (each mark knows its corner)
  const [cx, cz] = C[corner], sx = corner[1] === 'E' ? 1 : -1, sz = corner[0] === 'S' ? 1 : -1;
  if (level === 'upper') {
    // on the horn and just under it (the horns: 1 × 1 at the corners of the top)
    const hx = sx > 0 ? -24 : -52, hz = sz > 0 ? 10.5 : -17.5;
    marks.add(hx + 0.02 * sx, 25.2, hz - sz * 0.55, sx, 0, 0.9, 1.3); marks.add(hx - sx * 0.55, 25.2, hz + 0.02 * sz, 0, sz, 0.9, 1.3);
  } else if (level === 'yesod') {
    const yes = corner !== 'SE';
    if (yes) marks.add(cx + sx * 0.45, 17.03, cz + sz * 0.45, 0, 1, 1.7, 1.7, true);
    marks.add(cx + 0.03 * sx, 17.5, cz - sz * 0.8, sx, 0, 1.3, 0.9); marks.add(cx - sx * 0.8, 17.5, cz + 0.03 * sz, 0, sz, 1.3, 0.9);
  } else {
    marks.add(cx + 0.03 * sx, 19.4, cz - sz * 0.75, sx, 0, 1.2, 1.9); marks.add(cx - sx * 0.75, 19.4, cz + 0.03 * sz, 0, sz, 1.2, 1.9);
  }
}

/* ───────────────────────── the layer ───────────────────────── */
export function createAvodah3D(ctx = {}) {
  const scene = ctx.scene, camera = ctx.camera || null, life = ctx.life || null;
  const G = ctx.ground || groundY;
  const blobs = ctx.blobs || (life && life.blobs) || new Blobs(scene, 256);
  const ownAnimals = !ctx.animals && !(life && life.animals);
  const animals = ctx.animals || (life && life.animals) || createAnimals({ scene, camera, blobs, ground: G });
  const actors = createActors({ scene, camera, blobs, ground: G });
  if (life && life.setCamera && camera) life.setCamera(camera);
  const marks = makeMarks(scene);
  const warn = (e) => { try { console.warn('[avodah3d]', e && e.message ? e.message : e); } catch (_) { /* */ } };
  // a function that never throws and always returns a Promise that resolves
  const safe = (fn) => (...a) => { try { const r = fn(...a); return r && typeof r.then === 'function' ? r.then((v) => v, (e) => { warn(e); return false; }) : Promise.resolve(r); } catch (e) { warn(e); return Promise.resolve(false); } };
  const safeSync = (fn, dflt = null) => (...a) => { try { return fn(...a); } catch (e) { warn(e); return dflt; } };

  // simulation-time waits
  const timers = [];
  // ── world api (s4) ── (World agent) a wait also ends when its time has passed on the wall clock (the loop clamps dt, so a
  // slow renderer runs the simulation slower than real time), and a wall-clock backstop resolves it even when the loop
  // does not run at all. So every promise of this layer resolves on time (see actors.js "world api (s4)").
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const wait = (sec) => new Promise((res) => {
    const T = { t: Math.max(0, sec), res, w0: nowMs(), sec: Math.max(0, sec) };
    T.bk = setTimeout(() => { const i = timers.indexOf(T); if (i >= 0) { timers.splice(i, 1); res(true); } }, (T.sec * 1.6 + 2.5) * 1000);
    timers.push(T);
  });
  // a fade-out that always ends (the animals' fade runs in their update; this finishes it after 1.5 s of wall clock)
  const fadeOut = (h, then) => new Promise((res) => {
    let done = false; const fin = () => { if (done) return; done = true; if (then) then(); res(true); };
    h.visT = 0; h.onHide = fin;
    setTimeout(() => { if (!done) { h.vis = 0; if (h.onHide === fin) h.onHide = null; fin(); } }, 1500);
  });
  // ── end world api (s4) ──

  /* ── kohanim and other people ── */
  const cast = new Map();          // id → handle
  let autoId = 0;
  const GARB = { kohen: 'kohen', gadol: 'gadol', 'gadol-white': 'gadol-white', gadolwhite: 'gadol-white', lavan: 'gadol-white', white: 'gadol-white', levite: 'levite', levi: 'levite', pilgrim: 'pilgrim', woman: 'woman' };
  function makeHandle(a, id) {
    const h = {
      id, _a: a,
      get position() { return { x: a.x, y: a.y, z: a.z }; },
      get alive() { return a.alive; },
      walkTo: safe((place, opts = {}) => {
        const p = resolvePlace(place); if (!p || !a.alive) return Promise.resolve(false);
        const path = route(a.x, a.z, p.x, p.z);
        // (── world api (s4) ── opts.maxSec: walk faster on a long way, so the walk takes at most maxSec seconds)
        let speed = opts.speed;
        if (opts.maxSec > 0) { let L = 0, px = a.x, pz = a.z; for (const q of path) { L += Math.hypot(q[0] - px, q[1] - pz); px = q[0]; pz = q[1]; } speed = Math.max(speed || a.speed, L / opts.maxSec); }
        return actors.walk(a, path, speed).then((ok) => (ok && p.face && opts.face !== false ? actors.face(a, p.face[0], p.face[1]).then(() => ok) : ok));
      }),
      face: safe((target) => {
        if (!a.alive) return false;
        if (typeof target === 'number' && isFinite(target)) return actors.face(a, a.x + Math.sin(target), a.z + Math.cos(target));
        const p = resolvePlace(target); if (!p) return false;
        return actors.face(a, p.x, p.z);
      }),
      carry: safeSync((item) => { if (!a.alive) return false; actors.setItem(a, item && ITEMS.includes(item) ? item : null); return true; }, false),
      pose: safe((p) => (a.alive ? actors.pose(a, typeof p === 'string' ? p : 'stand') : false)),
      place: safeSync((place, yaw) => {
        const p = resolvePlace(place); if (!p || !a.alive) return false;
        a.path = null; if (a.res) { const r = a.res; a.res = null; r(false); }
        a.x = p.x; a.z = p.z; a.y = (a.ground || G)(p.x, p.z);
        if (typeof yaw === 'number') a.yaw = yaw; else if (p.face) a.yaw = Math.atan2(p.face[0] - p.x, p.face[1] - p.z);
        return true;
      }, false),
      look: safeSync((target) => { const p = target === null ? null : resolvePlace(target); a.look = p ? [p.x, p.z] : null; return true; }, false),
      // "he sanctified his hands and feet from the kiyor" (Tamid 1:4): to a free spigot, bend, wash, stand
      wash: safe(async (o = {}) => {
        if (!a.alive) return false;
        const i = kiyorSlot(a), ang = i / 12 * Math.PI * 2 + Math.PI / 12;
        const sx = KIYOR.x + Math.cos(ang) * 3.3, sz = KIYOR.z + Math.sin(ang) * 3.3;
        await actors.walk(a, route(a.x, a.z, sx, sz), 3.2);
        await actors.face(a, KIYOR.x, KIYOR.z);
        const item = a.item; if (item) actors.setItem(a, null);
        // ── water ── (WATER, wave 6) bent into the posture, the spigot's stream falls on his hands and runs over his feet
        // (world.water; without it, the old pause)
        const bend = actors.pose(a, 'wash');
        if (water && water._washAt) { await wait(0.45); await water._washAt(h, i, { hold: o && o.hold !== undefined ? o.hold : 2.6 }); await bend; }
        else { await bend; await wait(2.2); }
        // ── end water ──
        await actors.pose(a, 'stand');
        kiyorFree(a); if (item) actors.setItem(a, item);
        return true;
      }),
      remove: safeSync(() => { cast.delete(id); if (!a.alive) return true; a.visT = 0; a.onHide = () => actors.remove(a); return true; }, false),
      get item() { return a.item; },
    };
    return h;
  }
  function spawnActor(variant, x, z, opts = {}) { return actors.add(variant, x, z, { yaw: opts.yaw || 0, fadeIn: opts.fadeIn !== false, item: opts.item || null, speed: opts.speed }); }
  const kohen = safeSync((id, opts = {}) => {
    if (id === undefined || id === null) id = 'kohen' + (++autoId);
    id = String(id);
    const old = cast.get(id);
    if (old && old._a.alive) return old;
    const v = GARB[norm(opts.garments || 'kohen')] || GARB[opts.garments] || 'kohen';
    // they come out of Lishkat HaGazit, where the lots were drawn (Yoma 25a), unless told where to appear
    const at = resolvePlace(opts.at) || PLACE.gazit;
    const a = spawnActor(v, at.x + ((cast.size % 5) - 2) * 1.2, at.z, { yaw: Math.PI });
    a.role = opts.role || null;
    const h = makeHandle(a, id); cast.set(id, h); return h;
  });

  // the kiyor's twelve spigots (Yoma 3:10): which kohen washes at which (east half first; the steps are to the west)
  const spigots = new Array(12).fill(null);
  function kiyorSlot(a) {
    const pref = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6];
    for (const i of pref) if (!spigots[i] || !spigots[i].alive || spigots[i] === a) { spigots[i] = a; return i; }
    return 0;
  }
  const kiyorFree = (a) => { const i = spigots.indexOf(a); if (i >= 0) spigots[i] = null; };

  /* ── animals ── */
  const beasts = new Set();
  function nearestKohen(x, z, maxD = 12, exclude = null) {
    let best = null, bd = maxD;
    for (const h of cast.values()) { const a = h._a; if (!a.alive || a === exclude || a.ambient || a.variant === 'pilgrim' || a.variant === 'woman' || a.variant === 'levite') continue; const d = Math.hypot(a.x - x, a.z - z); if (d < bd) { bd = d; best = h; } }
    return best;
  }
  const byHandle = (k) => (k && k._a ? k : typeof k === 'string' ? cast.get(k) : null);
  function makeAnimalHandle(an, kind) {
    const h = {
      kind, _h: an,
      get position() { return { x: an.x, y: an.y, z: an.z }; },
      get alive() { return an.alive; },
      leadTo: safe((place, opts = {}) => {
        const p = resolvePlace(place); if (!p || !an.alive) return Promise.resolve(false);
        const lead = byHandle(opts.by || opts.kohen || h._leader) || nearestKohen(an.x, an.z, 10);
        an.headFix = null;
        if (lead && lead._a.alive) {
          const L = lead._a;
          an.follow = L; an.followDist = 2.4; an.path = null; L.rope = an; h._leader = lead;
          // the leader stops a little past the spot so the animal ends up on it
          const path = route(L.x, L.z, p.x, p.z);
          if (path.length) {
            const e = path[path.length - 1], f = path.length > 1 ? path[path.length - 2] : [L.x, L.z], d = Math.hypot(e[0] - f[0], e[1] - f[1]) || 1;
            const ext = [e[0] + (e[0] - f[0]) / d * 2.2, e[1] + (e[1] - f[1]) / d * 2.2];
            if (isHigh(ext[0], ext[1]) === isHigh(e[0], e[1])) path.push(ext);
          }
          return actors.walk(L, path, opts.speed || 2.6).then(async (ok) => {
            // settle: the animal steps up beside the leader
            await wait(0.8);
            an.follow = null;
            if (opts.release !== false) { L.rope = null; h._leader = null; }
            return ok;
          });
        }
        return animals.walk(an, route(an.x, an.z, p.x, p.z), 1.7);
      }),
      // checked again "by the light of torches" though it was checked the evening before (Tamid 3:4): the nearest kohen
      // holds up a torch while it is inspected, and takes his vessel back afterwards
      inspect: safeSync((on = true) => {
        an.inspect = on ? 1 : 0; ring.set(an, !!on);
        if (on) {
          const k = byHandle(h._leader) || nearestKohen(an.x, an.z, 8);
          if (k && k._a.item !== 'torch') { h._torch = k; h._prevItem = k._a.item; actors.setItem(k._a, 'torch'); k._a.look = [an.x, an.z]; }
        } else if (h._torch) {
          const A = h._torch._a; if (A.alive && A.item === 'torch') actors.setItem(A, h._prevItem || null); A.look = null; h._torch = null;
        }
        return true;
      }, false),
      hide: safe(() => (an.alive ? fadeOut(an) : false)),   // (── world api (s4) ── always ends)
      show: safe(() => new Promise((res) => { if (!an.alive) return res(false); an.visT = 1; setTimeoutSim(0.45, () => res(true)); })),
      remove: safeSync(() => { beasts.delete(h); ring.set(an, false); for (const x of actors.list) if (x.rope === an) x.rope = null; if (!an.alive) return true; an.visT = 0; an.onHide = () => animals.remove(an); return true; }, false),
    };
    // ── world api (s4) ── (World agent, for the Avodah agent) where a part of the animal is now, in world amot, with its head
    // turned as it is drawn: h.partPosition('ear' | 'eye' | 'nose' | 'lip' | 'mouth' | 'head' | 'horn' | 'beard' | 'neck' |
    // 'body' | 'back' | 'tail' | 'leg' | 'hindleg' | 'hoof', side?) → [x, y, z] (side 'left' | 'right'; default: the side
    // nearer the camera) or null; h.facing → yaw in radians (0 = facing south, +z; atan2(dx, dz)); h.forward → [dx, dz]
    h.partPosition = safeSync((part, side) => partPosition(an, part, side), null);
    Object.defineProperty(h, 'facing', { get: () => an.yaw });
    Object.defineProperty(h, 'forward', { get: () => [Math.sin(an.yaw), Math.cos(an.yaw)] });
    Object.defineProperty(h, 'scale', { get: () => an.s });
    // ── end world api (s4) ──
    return h;
  }
  // ── world api (s4) ── the parts of each kind in its model frame (+z forward, +x its left), from animals.js's models
  const SHEEP_PARTS = { piv: [0, 1.36, 0.62], head: [0, 1.57, 1.07], ear: [0.3, 1.6, 1.0], eye: [0.155, 1.66, 1.19], nose: [0, 1.49, 1.43], lip: [0, 1.35, 1.33], mouth: [0, 1.41, 1.39], neck: [0, 1.45, 0.85], body: [0, 1.12, 0], back: [0, 1.66, -0.1], tail: [0, 0.97, -0.93], leg: [0.19, 0.5, 0.42], hindleg: [0.19, 0.5, -0.52], hoof: [0.19, 0.05, 0.42] };
  const BULL_PARTS = { piv: [0, 2.25, 1.35], head: [0, 2.05, 2.12], ear: [0.46, 2.3, 1.95], eye: [0.25, 2.25, 2.1], nose: [0, 1.78, 2.66], lip: [0, 1.62, 2.5], mouth: [0, 1.66, 2.58], horn: [0.72, 3.02, 2.28], neck: [0, 2.3, 1.7], body: [0, 1.95, -0.1], back: [0, 2.72, -0.1], tail: [0, 1.0, -1.7], leg: [0.36, 0.8, 0.95], hindleg: [0.36, 0.8, -1.1], hoof: [0.36, 0.08, 0.95] };
  const PARTS3D = {
    lamb: { k: 1, p: SHEEP_PARTS }, ram: { k: 1.18, p: { ...SHEEP_PARTS, ear: [0.24, 1.6, 1.08], horn: [0.4, 1.62, 1.0] } },
    goat: { k: 1, p: { piv: [0, 1.5, 0.66], head: [0, 1.72, 1.08], ear: [0.25, 1.52, 1.02], eye: [0.13, 1.8, 1.14], nose: [0, 1.58, 1.32], lip: [0, 1.5, 1.3], mouth: [0, 1.53, 1.33], horn: [0.14, 2.14, 0.74], beard: [0, 1.25, 1.24], neck: [0, 1.6, 0.9], body: [0, 1.3, -0.05], back: [0, 1.76, -0.05], tail: [0, 1.58, -0.92], leg: [0.17, 0.55, 0.5], hindleg: [0.17, 0.55, -0.55], hoof: [0.17, 0.05, 0.5] } },
    bull: { k: 1, p: BULL_PARTS }, calf: { k: 0.62, p: { ...BULL_PARTS, horn: undefined } },
    dove: { k: 1, p: { piv: [0, 0.4, 0.2], head: [0, 0.46, 0.25], eye: [0.06, 0.48, 0.31], nose: [0, 0.45, 0.36], mouth: [0, 0.45, 0.36], neck: [0, 0.38, 0.2], body: [0, 0.26, 0], back: [0, 0.4, 0], tail: [0, 0.26, -0.28], leg: [0.05, 0.05, 0.02], hoof: [0.05, 0.0, 0.02] } },
  };
  PARTS3D.turtledove = PARTS3D.dove;
  const HEAD_PARTS = new Set(['head', 'ear', 'eye', 'nose', 'lip', 'mouth', 'horn', 'beard']);
  function partPosition(an, part, side) {
    const D = PARTS3D[an.kind]; if (!D) return null;
    const q = D.p[String(part || 'head').toLowerCase()]; if (!q) return null;
    let x = q[0], y = q[1], z = q[2];
    if (x !== 0) {
      // which side: asked, or the one nearer the camera (+x is the animal's left)
      let sgn = side === 'right' || side === 'r' ? -1 : side === 'left' || side === 'l' ? 1 : 0;
      if (!sgn) { sgn = 1; if (camera) { const c = Math.cos(an.yaw), s2 = Math.sin(an.yaw); const lx = (camera.position.x - an.x) * c - (camera.position.z - an.z) * s2; sgn = lx >= 0 ? 1 : -1; } }
      x *= sgn;
    }
    if (HEAD_PARTS.has(String(part).toLowerCase())) {
      // the head as the shader turns it: rY(yaw of the head) · rX(pitch) about the head pivot
      const P0 = D.p.piv, dx = x - P0[0], dy = y - P0[1], dz = z - P0[2], cp = Math.cos(an.hp || 0), sp = Math.sin(an.hp || 0);
      const y1 = cp * dy - sp * dz, z1 = sp * dy + cp * dz, cy = Math.cos(an.hy || 0), sy = Math.sin(an.hy || 0);
      x = P0[0] + cy * dx + sy * z1; y = P0[1] + y1; z = P0[2] - sy * dx + cy * z1;
    }
    const S = (an.s || 1) * D.k, c = Math.cos(an.yaw), s2 = Math.sin(an.yaw);
    x *= S; y *= S; z *= S;
    return [an.x + x * c + z * s2, an.y + y, an.z - x * s2 + z * c];
  }
  // ── end world api (s4) ──
  const setTimeoutSim = (sec, fn) => { wait(sec).then(fn); };
  const KIND = { lamb: 'lamb', keves: 'lamb', kevesh: 'lamb', sheep: 'lamb', ram: 'ram', ayil: 'ram', goat: 'goat', ez: 'goat', seir: 'goat', bull: 'bull', par: 'bull', calf: 'calf', egel: 'calf', dove: 'dove', yona: 'dove', turtledove: 'turtledove', tor: 'turtledove' };
  const animal = safeSync((kind, at, opts = {}) => {
    const k = KIND[norm(kind)] || (ANIMAL_KINDS.includes(kind) ? kind : null);
    if (!k) return null;
    let an = null;
    const key = norm(at || '');
    if (k === 'lamb' && (key === 'lambschamber' || key === 'lambs') && chamber) {
      // one of the six checked lambs walks out of its stall; the chamber is kept at six (Arachin 2:5)
      // (── world api (s4) ── opts.index: the lamb the player chose, from lambsChamber.positions() / .pick())
      an = (opts.index !== undefined && opts.index !== null ? takeLamb(opts.index) : null) || chamber.take();
      if (an) { an.fixedY = undefined; an.ground = G; setTimeoutSim(20, () => chamber.count(Math.max(chamber.n, 6))); }
    }
    if (!an) {
      const p = resolvePlace(at) || { x: -38, z: -46 };
      an = animals.add(k, p.x, p.z, { ground: G, calm: true, yaw: opts.yaw !== undefined ? opts.yaw : Math.PI, hidden: true });
      an.visT = 1;
    }
    an.calm = true; an.graze = false; an.wander = null;
    const h = makeAnimalHandle(an, k); beasts.add(h);
    if (opts.by || opts.kohen) h._leader = byHandle(opts.by || opts.kohen);
    return h;
  });
  // a soft gold ring under an animal being inspected (by torchlight, Tamid 3:4)
  const ring = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.72, 'rgba(255,255,255,0)'); g.addColorStop(0.86, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.6, 1.15, 0.45), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    m.visible = false; m.renderOrder = 3; m.frustumCulled = false; scene.add(m);
    let who = null, T = 0;
    return {
      mesh: m,
      set(an, on) { if (on) who = an; else if (who === an) who = null; m.visible = !!who; },
      update(dt) { T += dt; if (!who || !who.alive || who.vis <= 0) { m.visible = false; return; } m.visible = true; m.position.set(who.x, who.y + 0.06, who.z); m.scale.setScalar(3.2 + Math.sin(T * 3) * 0.15); },
    };
  })();

  /* ── the stations of the service ── */
  const ensureKohen = (id, at, opts = {}) => { const h = kohen(id, { at, garments: opts.garments || 'kohen' }); if (h && h._a.vis === 0) h._a.visT = 1; return h; };
  const RING_DEFAULT = TAMID_RING.morning;
  const slaughter = safe(async (animalH, at, opts = {}) => {
    const h = animalH && animalH._h ? animalH : null;
    if (!h || !h._h.alive) return false;
    const an = h._h;
    const p = resolvePlace(at) || { x: RING_DEFAULT[0], z: RING_DEFAULT[1] };
    const R = [p.x, p.z];
    // the kohen: given, or the one leading it, or the nearest, or a new one ("the one who won the Tamid", Tamid 3:1)
    let k = byHandle(opts.kohen) || h._leader || nearestKohen(an.x, an.z, 20);
    if (Math.hypot(an.x - R[0], an.z - R[1]) > 1.6) {
      if (!k) k = ensureKohen('shochet', 'rings');
      await h.leadTo(R, { by: k });
    }
    if (!k) k = ensureKohen('shochet', [R[0] + 1.8, R[1]]);
    const A = k._a;
    A.rope = null; an.follow = null;
    if (Math.hypot(an.x - R[0], an.z - R[1]) > 0.3) await animals.walk(an, [[R[0], R[1]]], 1.2);
    // the lamb: head to the south, its face turned west (Tamid 4:1); calm
    an.path = null; an.face = [an.x, an.z + 6]; an.headFix = -0.55; an.inspect = 0;
    // the shochet stands in the east, facing west (Tamid 4:1)
    await actors.walk(A, route(A.x, A.z, R[0] + 1.9, R[1] - 0.2), 2.4);
    await actors.face(A, R[0], R[1] - 0.2);
    await wait(0.8);
    // the cut-away: the camera leaves; the animal is hidden in a short dip
    try { if (typeof opts.onCut === 'function') opts.onCut(); } catch (e) { warn(e); }
    await fadeOut(an);   // (── world api (s4) ── always ends)
    animals.remove(an); beasts.delete(h); ring.set(an, false);
    // after the cut: the receiver holds the mizrak, a little dark red inside (Tamid 4:1 "קבל המקבל")
    const rec = byHandle(opts.mekabel) || k;
    actors.setItem(rec._a, 'mizrak'); rec._a.fill = 1;
    await actors.pose(rec._a, 'stand');
    return true;
  });
  const CORNERS = ['NE', 'NW', 'SE', 'SW'];
  const sprinkle = safe(async (corner, level, opts = {}) => {
    const cn = CORNERS.includes(String(corner).toUpperCase()) ? String(corner).toUpperCase() : 'NE';
    const lv = ['lower', 'upper', 'yesod'].includes(level) ? level : 'lower';
    let k = byHandle(opts.kohen);
    if (!k) for (const h of cast.values()) if (h._a.alive && !h._a.ambient && h._a.item === 'mizrak') { if (!k || h._a.fill > k._a.fill) k = h; }
    const [cx, cz] = C[cn], sx = cn[1] === 'E' ? 1 : -1, sz = cn[0] === 'S' ? 1 : -1;
    if (!k) k = nearestKohen(cx, cz, 80) || ensureKohen('mekabel', [cx + sx * 3, cz + sz * 3]);
    const A = k._a;
    if (A.item !== 'mizrak') { actors.setItem(A, 'mizrak'); A.fill = 1; }
    // where he stands: on the floor outside the corner, or (upper) on top beside the horn
    let st = lv === 'upper' ? [sx > 0 ? -25.9 : -50.1, sz > 0 ? 8.3 : -15.3] : [cx + sx * 2.3, cz + sz * 2.4];
    let aim = lv === 'upper' ? [sx > 0 ? -24.5 : -51.5, sz > 0 ? 10 : -17] : [cx, cz];
    // ── water ── (WATER, wave 6) the rest of the blood is poured from right beside the yesod, the vessel just above it (never
    // thrown across): he stands on the floor at the yesod's edge, facing it
    if (lv === 'yesod' && cn === 'SW' && water && typeof water.shirayimSpot === 'function') { const p = water.shirayimSpot(opts.yesod || 'S'); if (p) { st = [p.x, p.z]; aim = p.face; } }
    // ── end water ──
    await actors.walk(A, route(A.x, A.z, st[0], st[1]), 3.2);
    await actors.face(A, aim[0], aim[1]);
    // "throws" from the vessel (zerika) — or pours the remainder on the yesod (Tamid 4:1); the mark appears softly
    const g = actors.pose(A, lv === 'yesod' ? 'pour' : 'throw');
    await wait(lv === 'yesod' ? 0.9 : 0.42);
    // ── water ── (WATER, wave 6) on the yesod at the SW corner the rest of the blood runs, a thin trickle, into the two holes
    // (Middot 3:2) instead of a flat mark; anywhere else, the soft mark as before
    if (lv === 'yesod' && cn === 'SW' && water && water.pour) await water.pour('shirayim', { corner: opts.yesod || 'S', from: handAt(A) });
    else cornerMarks(marks, cn, lv);
    // ── end water ──
    await g;
    if (lv === 'yesod') A.fill = 0;
    return true;
  });

  /* ── the limbs: to the kevesh, salted, to the fire (Tamid 4:3, 7:3; Yoma 33a) ── */
  const onKevesh = [];                 // props lying on the lower western half of the kevesh
  const LIMB_ITEMS = ['limb', 'limb', 'limb', 'limb', 'limb', 'bazach'];
  const limbSlot = (i) => { const z = LIMBS_PLACE.z1 - 2 - i * 2.35; return [LIMBS_PLACE.x, z]; };
  const limbs = safe(async (stepName, opts = {}) => {
    const st = norm(stepName);
    if (st === 'kevesh') {
      // six carriers in a row from the marble tables, round the east of the altar, up to the lower western half
      const carriers = LIMB_ITEMS.map((it, i) => { const h = ensureKohen('evarim' + (i + 1), [-46 + i * 3, -52.5]); actors.setItem(h._a, it); return h; });
      await Promise.all(carriers.map(async (h, i) => {
        const A = h._a, [sx, sz] = limbSlot(i);
        await wait(i * 0.7);
        await actors.walk(A, route(A.x, A.z, sx + 1.9, sz), 3.2);
        await actors.face(A, sx, sz);
        await actors.pose(A, 'bow');
        // (drawn half again as large as life, to be read on a phone from the altar camera)
        onKevesh.push(actors.prop(A.item, sx, RAMP_Y(sz) + 0.05, sz, Math.PI / 2, { s: 1.65 }));
        actors.setItem(A, null);
        await actors.pose(A, 'stand');
      }));
      // then they go to Lishkat HaGazit to say Shema (Tamid 4:3 – 5:1)
      carriers.forEach((h, i) => { const A = h._a; wait(0.4 + i * 0.3).then(() => actors.walk(A, route(A.x, A.z, -84 + i * 1.5, 55.5), 3.2)).then(() => h.remove()); });
      return true;
    }
    if (st === 'salt') {
      // the carriers salted what they had set down (Tamid 4:3 "ומלחום"); one kohen with the salt from the kevesh foot
      const h = ensureKohen('molach', 'keveshfoot'); const A = h._a;
      actors.setItem(A, 'salt');
      for (let i = 0; i < Math.max(1, onKevesh.length); i++) {
        const p = onKevesh[i], z = p ? p.z : limbSlot(i)[1];
        await actors.walk(A, route(A.x, A.z, LIMBS_PLACE.x + 1.9, z), 3);
        await actors.face(A, LIMBS_PLACE.x, z);
        await actors.pose(A, 'throw');
        if (p) p.fill = 1;
      }
      actors.setItem(A, null);
      return true;
    }
    if (st === 'fire') {
      // the limbs go up to the great maaracha; the fire takes them, flares, and the column of smoke thickens
      const n = Math.max(1, onKevesh.length);
      // "when the Kohen Gadol wished to burn, he went up the kevesh with the Segan at his right … they handed him the limbs,
      // he leaned on them and threw them" (Tamid 7:3; Yoma 33a) — opts.gadol, or a Kohen Gadol already in the courts
      let KG = opts.gadol === false ? null : byHandle(opts.gadol);
      if (!KG && opts.gadol) for (const h of cast.values()) if (h._a.alive && (h._a.variant === 'gadol' || h._a.variant === 'gadol-white')) KG = h;
      if (!KG && opts.gadol === true) KG = kohen('kohen-gadol', { garments: 'gadol', at: 'keveshfoot' });
      const FIRE_AT = [-29.5, 1.6];
      if (KG) {
        const segan = ensureKohen('segan', 'keveshfoot');
        await Promise.all([
          actors.walk(KG._a, route(KG._a.x, KG._a.z, FIRE_AT[0], FIRE_AT[1]), 2.6),
          actors.walk(segan._a, route(segan._a.x, segan._a.z, FIRE_AT[0] + 1.6, FIRE_AT[1] + 0.6), 2.6),
        ]);
        await actors.face(KG._a, MAARACHOT.great.x, MAARACHOT.great.z);
        actors.face(segan._a, MAARACHOT.great.x, MAARACHOT.great.z);
      }
      const carriers = [];
      for (let i = 0; i < n; i++) carriers.push(ensureKohen('maalim' + (i + 1), [-48.5, 26 + i * 1.6]));
      let queue = Promise.resolve();
      await Promise.all(carriers.map(async (h, i) => {
        const A = h._a, p = onKevesh[i];
        await wait(i * 0.8);
        if (p) {
          await actors.walk(A, route(A.x, A.z, LIMBS_PLACE.x + 1.8, p.z), 3.2);
          await actors.face(A, p.x, p.z);
          actors.unprop(p); actors.setItem(A, p.item);
        } else actors.setItem(A, 'limb');
        if (KG) {
          // up to the Kohen Gadol, hand it over; he leans on it and throws it (one at a time)
          const stand = [FIRE_AT[0] - 1.8 - (i % 2) * 0.8, FIRE_AT[1] + 1.2 + (i % 3) * 0.6];
          await actors.walk(A, route(A.x, A.z, stand[0], stand[1]), 3);
          await actors.face(A, KG._a.x, KG._a.z);
          const mine = queue.then(async () => {
            actors.setItem(A, null); actors.setItem(KG._a, 'limb');
            await actors.pose(KG._a, 'bow');
            const g = actors.pose(KG._a, 'throw'); await wait(0.5); actors.setItem(KG._a, null); fx.flare(); await g;
            await actors.pose(KG._a, 'stand');
          });
          queue = mine; await mine;
        } else {
          const stand = [FIRE_AT[0] + ((i % 3) - 1) * 1.6, FIRE_AT[1]];
          await actors.walk(A, route(A.x, A.z, stand[0], stand[1]), 3);
          await actors.face(A, MAARACHOT.great.x, MAARACHOT.great.z);
          const g = actors.pose(A, 'throw');
          await wait(0.5);
          actors.setItem(A, null);
          fx.flare();
          await g;
        }
        await wait(0.3);
        actors.walk(A, route(A.x, A.z, -31 - i * 1.3, 46), 3.2).then(() => h.remove());
      }));
      onKevesh.length = 0;
      return true;
    }
    return false;
  });

  /* ── libation at the south-west horn, into the silver bowls (Sukkah 4:9; Zevachim 6:2; Tamid 7:3) ── */
  const bowls = [];
  const libation = safe(async (kind) => {
    const water = norm(kind) === 'water';
    if (!bowls.length) bowls.push(actors.prop('bowl', -51.2, LEVEL.altarTop, 9.6, 0, { fadeIn: false }), actors.prop('bowl', -50.2, LEVEL.altarTop, 10.1, 0, { fadeIn: false }));
    const h = ensureKohen(water ? 'menasech-mayim' : 'menasech', 'keveshfoot'); const A = h._a;
    actors.setItem(A, water ? 'flask' : 'kuz');
    await actors.walk(A, route(A.x, A.z, PLACE.shitin.x, PLACE.shitin.z), 3);
    await actors.face(A, -51.6, 10);
    // ── water ── (WATER, wave 6) the stream from the vessel into its bowl; the bowls empty down into the shitin (world.water)
    const g = actors.pose(A, 'pour');
    const bw = bowls[water ? 0 : 1];
    const W = waterLayer();
    if (W && W.pour) { await wait(0.5); await W.pour(water ? 'water' : 'wine', { from: handAt(A), to: { x: bw.x, y: bw.y + 0.05, z: bw.z } }); }
    await g;
    // ── end water ──
    bowls[water ? 0 : 1].fill = water ? 0 : 1;   // "מערבי של מים, מזרחי של יין" (Sukkah 4:9): bowls[0] is the western one
    return true;
  });

  /* ── the trumpets, the Levites, the blessing, the bowing ── */
  const levs = [];
  const DUCHAN_X = -8.5;
  // ── avoda12 ── levites(on, { chalil }): on the chalil's twelve days (Arachin 2:3: "ובשנים עשר יום בשנה החליל מכה לפני
  // המזבח" — the first day of Pesach, Shavuot, the eight days of the Chag) two of the lyre players hold chalilim instead
  const CHALIL_AT = [1, 10];
  const levites = safe(async (on = true, opts = {}) => {
    if (on === false || on === 0) {
      for (const a of levs.splice(0)) { a.playing = false; a.visT = 0; a.onHide = () => actors.remove(a); }
      return true;
    }
    const chalil = !!(opts && opts.chalil);
    if (!levs.length) {
      // at least twelve Levites on the duchan (Arachin 2:6); at least nine lyres and one cymbal (2:5), at least two harps (2:3) — Ben Arza's (Tamid 7:3)
      const inst = ['kinor', 'kinor', 'kinor', 'kinor', 'nevel', 'kinor', 'cymbals', 'kinor', 'kinor', 'nevel', 'kinor', 'kinor'];
      inst.forEach((it, i) => {
        const z = -22 + i * 4 + (it === 'cymbals' ? 0 : 0), x = i % 2 ? DUCHAN_X - 1.2 : DUCHAN_X;
        const a = actors.add('levite', x, z, { yaw: -Math.PI / 2, fadeIn: true, y: x < -9 ? 15 : 14.5 });
        a.fixedY = x < -9 ? 15 : 14.5; actors.setItem(a, chalil && CHALIL_AT.includes(i) ? 'halil' : it); a.playing = true; a.benArza = it === 'cymbals';
        levs.push(a);
      });
    } else levs.forEach((a, i) => { a.playing = true; a.visT = 1; if (CHALIL_AT.includes(i)) actors.setItem(a, chalil ? 'halil' : 'kinor'); });
    await wait(0.5);
    return true;
  });
  const trumpeters = [];
  const trumpets = safe(async (opts = {}) => {
    if (!trumpeters.length) {
      // "two kohanim stand on the table of fats with two silver trumpets" (Tamid 7:3) — west of the kevesh; after the first
      // tekiah–teruah–tekiah they come and stand beside Ben Arza, before the libation and the song, one at his right and one at his left (ibid.): on the step behind the duchan
      const ben = levs.find((a) => a.benArza);
      const spots = ben ? [[-10.4, ben.z - 1.8], [-10.4, ben.z + 1.8]] : [[-49.5, 27], [-49.5, 30.5]];
      for (const [x, z] of spots) {
        const h = ensureKohen('chatzotzrot' + (trumpeters.length + 1), [x, z]); const A = h._a;
        A.x = x; A.z = z; A.yaw = ben ? -Math.PI / 2 : Math.PI / 2; A.face = null;
        actors.setItem(A, 'trumpet');
        trumpeters.push(h);
      }
    }
    // tekiah, teruah, tekiah
    const bl = (dur, stacc) => { for (const h of trumpeters) { h._a.playing = true; h._a.blast = { t: 0, dur, stacc }; } return wait(dur + 0.25); };
    await bl(1.3, false); await bl(1.3, true); await bl(1.3, false);
    for (const h of trumpeters) h._a.playing = false;
    if (opts.stay === false) { for (const h of trumpeters.splice(0)) h.remove(); }
    return true;
  });
  const blessers = [];
  const blessing = safe(async (on = true) => {
    if (on === false || on === 0) {
      for (const h of blessers.splice(0)) { actors.pose(h._a, 'stand'); wait(0.6).then(() => h.remove()); }
      return true;
    }
    if (!blessers.length) {
      // on the steps of the Ulam, facing the people; "the first ones" to the south of their brothers, the five vessels
      // in their hands (Tamid 7:2 — teni, kuz, machta, bazach, kaf)
      for (let i = 0; i < 11; i++) {
        const z = -15 + i * 3, x = i % 2 ? -62.5 : -59.5;
        const h = ensureKohen('mevarech' + (i + 1), [x, z]); const A = h._a; A.x = x; A.z = z; A.yaw = Math.PI / 2; A.face = null;
        blessers.push(h);
      }
      ['teni', 'kuz', 'machta', 'bazach', 'kaf'].forEach((it, i) => {
        const z = 25 + i * 2.6, x = -60.5;   // (beyond the kiyor, which stands at z 17.5–22.5)
        const h = ensureKohen('rishonim' + (i + 1), [x, z]); const A = h._a; A.x = x; A.z = z; A.yaw = Math.PI / 2; A.face = null;
        actors.setItem(A, it); A.fill = it === 'machta' ? 1 : 0; h.vessel = true;
        blessers.push(h);
      });
    }
    // "in the Temple, above their heads" (Tamid 7:2; Sotah 38a)
    await Promise.all(blessers.filter((h) => !h.vessel).map((h) => actors.pose(h._a, 'bless')));
    return true;
  });
  const bow = safe(async (on = true) => {
    const down = !(on === false || on === 0);
    const ps = [];
    for (const a of actors.list) {
      // pilgrims on their way stop where they are and bow down; kohanim busy with the service go on
      if ((a.variant === 'pilgrim' || a.variant === 'woman') && a.path) a.paused = down;
      if (!a.alive || (a.path && !a.paused) || a.gesture || a.variant === 'levite') continue;
      if (a.poseName === 'bless' && down) continue;
      if (trumpeters.some((h) => h._a === a)) continue;
      ps.push(actors.pose(a, down ? 'kneel' : 'stand'));
    }
    if (life && life.setBow) life.setBow(down ? 1 : 0);
    await Promise.all(ps);
    return true;
  });

  /* ── fire and smoke (life.js owns the altar fire and the column of smoke) ── */
  const fx = {
    level: 1, smoke: 1, fl: 0, fls: 0,
    flare() { this.fl = 3; this.fls = 9; },
    apply() {
      if (!life) return;
      const f = this.level * (1 + (this.fl > 0 ? 0.45 * Math.min(1, this.fl / 1.5) : 0));
      const s = this.smoke * (1 + (this.fls > 0 ? 0.5 * Math.min(1, this.fls / 3) : 0));
      if (life.setFireLevel) life.setFireLevel(f);
      if (life.setSmokeLevel) life.setSmokeLevel(s);
    },
  };
  const num = (v, d) => { const n = Number(v); return isFinite(n) ? Math.max(0, Math.min(3, n)) : d; };
  const fire = safeSync((k) => { fx.level = num(k, 1); fx.apply(); return true; }, false);
  const smoke = safeSync((k) => { fx.smoke = num(k, 1); fx.apply(); return true; }, false);

  /* ── pilgrims ── */
  const OFFER = { olah: 'lamb', shelamim: 'lamb', todah: 'lamb', chatat: 'goat', asham: 'ram', bechor: 'calf', maaser: 'lamb', pesach: 'lamb', nedava: 'lamb', neder: 'lamb', par: 'bull', kinim: 'dove', ken: 'dove', yoledet: 'dove', birds: 'dove', bird: 'dove', of: 'dove' };
  const pilgrim = safeSync((offering, opts = {}) => {
    const key = norm(offering || 'olah');
    const kind = KIND[key] || OFFER[key] || 'lamb';
    const bird = kind === 'dove' || kind === 'turtledove';
    if (bird) {
      // with a basket of two birds, in through Nikanor from the Court of the Women (the yoledet stood at Nikanor)
      const a = actors.add(key === 'yoledet' || opts.woman ? 'woman' : 'pilgrim', 4, 3 + Math.random() * 2, { yaw: -Math.PI / 2, fadeIn: true });
      actors.setItem(a, 'cage');
      const birds = [animals.add(kind, a.x, a.z, { calm: true, scale: 0.8 }), animals.add(kind, a.x, a.z, { calm: true, scale: 0.8 })];
      birds.forEach((b, i) => { b.held = { x: 0, y: 0, z: 0, yaw: 0 }; b.heldBy = a; b.heldOff = i ? 0.1 : -0.1; });
      const h = makeHandle(a, 'pilgrim' + (++autoId)); cast.set(h.id, h);
      const arrived = actors.walk(a, route(a.x, a.z, -5.5, 6 + Math.random() * 6), 2.4).then(() => actors.face(a, -30, 4)).then(() => true, () => false);
      return { pilgrim: h, animal: makeAnimalHandle(birds[0], kind), animals: birds.map((b) => makeAnimalHandle(b, kind)), arrived, remove() { h.remove(); birds.forEach((b) => { b.visT = 0; b.onHide = () => animals.remove(b); }); } };
    }
    // with an animal on a rope, in through the Gate of the Offering (Middot 1:5; the name: "where the most holy offerings
    // slaughtered in the north were brought in" — Bartenura there: "שם מכניסים קדשי קדשים ששחיטתן בצפון")
    const g = PLACE.korban;
    const a = actors.add(opts.woman ? 'woman' : 'pilgrim', g.x + (Math.random() - 0.5) * 3, g.z, { yaw: 0, fadeIn: true });
    const an = animals.add(kind, a.x, a.z - 2.2, { ground: G, calm: true, hidden: true }); an.visT = 1;
    an.follow = a; an.followDist = 2.4; a.rope = an;
    const h = makeHandle(a, 'pilgrim' + (++autoId)); cast.set(h.id, h);
    const ah = makeAnimalHandle(an, kind); ah._leader = h; beasts.add(ah);
    const to = opts.to ? resolvePlace(opts.to) : { x: -44 + Math.random() * 14, z: -46 + Math.random() * 5 };
    const arrived = actors.walk(a, route(a.x, a.z, to.x, to.z), 2.4).then(() => true, () => false);
    return { pilgrim: h, animal: ah, arrived, remove() { h.remove(); ah.remove(); } };
  });
  // ambient pilgrims: come in through the Gate of the Offering with an animal, wait a while in the north, go back out
  const amb = [];
  let ambN = 0, ambSeq = 0;
  const pilgrims = safeSync((n) => { ambN = Math.max(0, Math.min(24, Math.round(Number(n) || 0))); return ambN; }, 0);
  function ambientStep(dt) {
    while (amb.length > ambN) { const p = amb.pop(); p.h.remove(); }
    if (amb.length < ambN && (!amb.length || amb[amb.length - 1].age > 3)) {
      const offers = ['olah', 'shelamim', 'chatat', 'asham', 'olah', 'bechor', 'todah'];
      const r = pilgrim(offers[(ambSeq++) % offers.length], { to: [-60 + Math.random() * 40, -48 + Math.random() * 6] });
      if (r) amb.push({ h: r, age: 0, stay: 25 + Math.random() * 30, leaving: false });
    }
    for (const p of amb) {
      p.age += dt;
      if (!p.leaving && p.age > p.stay) {
        p.leaving = true; const A = p.h.pilgrim._a;
        actors.walk(A, route(A.x, A.z, PLACE.korban.x, PLACE.korban.z), 2.2).then(() => { const i = amb.indexOf(p); if (i >= 0) amb.splice(i, 1); p.h.remove(); });
      }
    }
  }

  /* ── bird offerings: olah above at the south-east horn, chatat below at the south-west corner (Zevachim 6:2, 6:4–5) ── */
  const birdOffering = safe(async (kind) => {
    const olah = norm(kind) !== 'chatat';
    const h = ensureKohen(olah ? 'olat-haof' : 'chatat-haof', 'keveshfoot'); const A = h._a;
    const dv = animals.add(Math.random() < 0.5 ? 'dove' : 'turtledove', A.x, A.z, { calm: true, scale: 0.8 });
    dv.held = { x: 0, y: 0, z: 0, yaw: 0 }; dv.heldBy = A; dv.heldOff = 0;
    const st = olah ? [-25.9, 8.3] : [PLACE.sw.x, PLACE.sw.z];
    await actors.walk(A, route(A.x, A.z, st[0], st[1]), 3);
    await actors.face(A, olah ? -24.5 : C.SW[0], olah ? 10 : C.SW[1]);
    await actors.pose(A, 'lift');
    await wait(0.6);
    await fadeOut(dv, () => animals.remove(dv));   // (── world api (s4) ── always ends)
    cornerMarks(marks, olah ? 'SE' : 'SW', olah ? 'upper' : 'lower');
    await actors.pose(A, 'stand');
    return true;
  });

  /* ── the pens (outside the Mount) and the lambs' chamber ── */
  let pensObj = null, chamber = null;
  try { chamber = buildLambsChamber(scene, animals); chamber.count(6); } catch (e) { warn(e); }
  const pens = {
    fill: safeSync((n) => {
      if (!pensObj) pensObj = buildPens(scene, animals);
      const r = pensObj.fill(n);
      // shepherds and dove sellers while the pens are open
      if (!pensObj.folk) pensObj.folk = [];
      if (r > 0 && !pensObj.folk.length) for (const p of pensObj.people) {
        const a = actors.add(p.role === 'seller' ? (pensObj.folk.length % 2 ? 'woman' : 'pilgrim') : 'pilgrim', p.x, p.z, { yaw: p.yaw, ground: terrainH });
        a.ground = terrainH; if (p.role === 'shepherd') actors.setItem(a, 'staff');
        pensObj.folk.push(a);
      }
      if (r === 0 && pensObj.folk.length) for (const a of pensObj.folk.splice(0)) actors.remove(a);
      return r;
    }, 0),
    get count() { return pensObj ? pensObj.count : 0; },
    /** ── service13 ── the pens tended ('water' | 'hay'): the flock walks to the troughs or the hay → how many came */
    tend: safeSync((k) => (pensObj && pensObj.tend ? pensObj.tend(k) : 0), 0),
  };
  const lambsChamber = { count: safeSync((n) => (chamber ? chamber.count(n) : 0), 0), get n() { return chamber ? chamber.n : 0; } };
  // ── world api (s4) ── (World agent, for the Avodah agent) the lambs in their chamber, to choose one in 3D:
  //   lambsChamber.positions() → [{ i, x, y, z, yaw, head: [x, y, z] }]   (i = the index animal() takes with { index: i })
  //   lambsChamber.pick(raycaster | ray) → i or -1
  lambsChamber.positions = safeSync(() => (chamber ? chamber.lambs.map((an, i) => ({ i, x: an.x, y: an.y, z: an.z, yaw: an.yaw, head: partPosition(an, 'head') })) : []), []);
  lambsChamber.pick = safeSync((ray) => {
    const r = ray && ray.ray ? ray.ray : ray; if (!r || !r.origin || !chamber) return -1;
    let best = -1, bd = Infinity;
    chamber.lambs.forEach((an, i) => { _lsp.center.set(an.x, an.y + 1.15 * an.s, an.z); _lsp.radius = 1.0 * an.s; if (r.intersectSphere(_lsp, _lsc)) { const d = _lsc.distanceTo(r.origin); if (d < bd) { bd = d; best = i; } } });
    return best;
  }, -1);
  const _lsp = new THREE.Sphere(), _lsc = new THREE.Vector3();
  // the chosen lamb leaves; the last one steps over into its stall, so the chamber refills at the end of the row
  function takeLamb(i) {
    const L = chamber && chamber.lambs; i = Math.round(Number(i));
    if (!L || !(i >= 0 && i < L.length)) return null;
    const an = L[i], last = L[L.length - 1];
    L.pop();
    if (last !== an) {
      L[i] = last;
      const sp = chamber.spots[i];
      if (sp) { last.ground = G; animals.walk(last, [[sp[0], sp[1]]], 0.9).then(() => { last.fixedY = LAMBS_CHAMBER.floor; last.yaw = Math.PI / 2; }); }
    }
    return an;
  }
  // ── end world api (s4) ──

  // ── yk ── (World agent, wave 3) the Kohen Gadol's service on Yom Kippur — watch only (Yoma 3–7; PROJECT.md §2.5, §2.9)
  //   av.yomKippur(step, { onCount }) → Promise (resolves when the step's motion ends; never rejects)
  //   step: immersion · white · confession · lots · ketoret · even-shtiya · sprinkle · parochet · machta-out · exit · end
  // Each step first sets its stage at once — the Kohen Gadol in the right garments and place, the bull, the two goats
  // with the kalpi, the people — so steps can be taken in any order or skipped; then it plays a short choreography.
  // A newer step (or 'end') cancels what is left of the older one. Dignity: he is never shown immersing (a linen sheet
  // stands between him and the people, Yoma 3:6), no blood is shown (the sprinklings are the motion of the hand only),
  // no Name is written; in the Kodesh HaKodashim he is seen only from the sanctuary's fixed watch view (the camera never
  // walks his path there). Places and poses where the Mishnah is silent: illustration.
  const YK = {
    kg: null, dress: null, segan: null, rosh: null, bull: null, goats: [], kalpi: null, lots: [], machta: null, crowd: [], sheet: null, seq: 0, wasAmbient: null,
    // the bull "between the Ulam and the altar, its head to the south and its face to the west"; he stands in the east facing
    // west (Yoma 3:8) — on the first landing of the twelve steps (Middot 3:6)
    BULL: [-59.2, -8.2], KG_BULL: [-57.3, -6.3],
    // "to the east of the azara, to the north of the altar" (Yoma 3:9): the two goats, the kalpi; the Segan at his right,
    // the head of the father's house at his left (Yoma 4:1)
    KG_LOTS: [-14.5, -30], GOATS: [[-18.6, -32.2], [-18.6, -27.8]], KALPI: [-16.4, -30],
    // the Heichal: from the doors to between the parochot, at the south end ("החיצונה היתה פרופה מן הדרום", Yoma 5:1)
    IN_PATH: [[-99.5, 0.6], [-112, 2.5], [-126, 4.2], [-134.5, 7.4], [-137.4, 8.7]],
    // at the stone to set the machta on it; a little east of it for the sprinklings (seen above the panel in both views)
    STONE: [PL.EVEN_SHTIYA.x, PL.EVEN_SHTIYA.z], KG_STONE: [-146.2, 0.9], KG_SPRINKLE: [-144.4, 1.0],
    ROOF_Y: 27.72,
  };
  const ykAlive = (my) => my === YK.seq;
  const vis = (h, on, instant) => { if (!h || !h._a) return; const A = h._a; A.visT = on ? 1 : 0; if (instant) A.vis = A.visT; };
  // the Kohen Gadol: gold (gadol), white (gadol-white) or his own clothes (own); a change of garments makes a new figure
  function ykKG(dress, at, yaw, instant = true) {
    if (!YK.kg || YK.dress !== dress || !YK.kg._a.alive) {
      if (YK.kg) YK.kg.remove();
      YK.kg = dress === 'own'
        ? (() => { const a = actors.add('pilgrim', at[0], at[1], { yaw: yaw || 0, col: '#F1EBDD', col2: '#E6D9BC', scale: 1.02 }); const h = makeHandle(a, 'kohen-gadol-own'); cast.set(h.id, h); return h; })()
        : kohen('kohen-gadol-' + dress, { garments: dress, at });
      YK.dress = dress;
    }
    const h = YK.kg, A = h._a;
    A.fixedY = undefined; A.paused = false;
    h.place(at, typeof yaw === 'number' ? yaw : undefined);
    if (typeof yaw === 'number') A.yaw = yaw;
    A.face = null; A.look = null; actors.pose(A, 'stand');
    vis(h, true, instant);
    return h;
  }
  const ykHelper = (id, dress, at, yaw) => { const h = kohen(id, { garments: dress || 'kohen', at }); h.place(at, yaw); vis(h, true, true); return h; };
  function ykBull(on) {
    if (!on) { if (YK.bull) { YK.bull.remove(); YK.bull = null; } return null; }
    if (!YK.bull || !YK.bull._h.alive) YK.bull = animal('bull', YK.BULL, { yaw: 0 });
    const an = YK.bull && YK.bull._h; if (!an) return null;
    an.path = null; an.follow = null; an.x = YK.BULL[0]; an.z = YK.BULL[1]; an.yaw = 0; an.face = [an.x, an.z + 6]; an.headFix = -0.55; an.vis = an.visT = 1;
    return YK.bull;
  }
  function ykGoats(on) {
    if (!on) { for (const g of YK.goats) g.remove(); YK.goats = []; for (const p of YK.lots) actors.unprop(p); YK.lots = []; if (YK.kalpi) { actors.unprop(YK.kalpi); YK.kalpi = null; } return; }
    YK.GOATS.forEach(([x, z], i) => {
      let g = YK.goats[i];
      if (!g || !g._h.alive) { g = animal('goat', [x, z], { yaw: Math.PI / 2 }); YK.goats[i] = g; }
      const an = g && g._h; if (!an) return;
      an.path = null; an.follow = null; an.x = x; an.z = z; an.yaw = Math.PI / 2; an.face = [x + 6, z]; an.headFix = null; an.vis = an.visT = 1;
    });
    if (!YK.kalpi) YK.kalpi = actors.prop('kalpi', YK.KALPI[0], LEVEL.azara, YK.KALPI[1], 0, { fadeIn: false });
  }
  // the people in the azara and the kohanim near the altar, facing the House (they bow at the confession, Yoma 6:2)
  function ykCrowd(on) {
    if (!on) { for (const a of YK.crowd.splice(0)) { a.visT = 0; a.onHide = () => actors.remove(a); } return; }
    if (YK.crowd.length) return;
    let r = 11;
    const rnd = () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; };
    for (let i = 0; i < 18; i++) {
      const x = -7.5 + (i % 3) * 2.6 + rnd() * 0.6, z = -21 + Math.floor(i / 3) * 8 + rnd() * 1.4;
      YK.crowd.push(actors.add(i % 5 === 3 ? 'woman' : 'pilgrim', x, z, { yaw: -Math.PI / 2 + (rnd() - 0.5) * 0.3, fadeIn: true }));
    }
    // the kohanim stand between the Ulam and the altar, north and south of the bull, facing it (they too bow, Yoma 6:2)
    for (const [x, z, yaw] of [[-62, -18.5, 0.4], [-58.6, -19.5, 0.1], [-55.8, -17.4, -0.3], [-63.5, 3.2, Math.PI - 0.4], [-59.8, 4.6, Math.PI], [-56.2, 3.4, Math.PI + 0.35]]) {
      YK.crowd.push(actors.add('kohen', x, z, { yaw, fadeIn: true }));
    }
  }
  function ykSheet(on) {
    if (on && !YK.sheet) {
      // "פרסו סדין של בוץ בינו לבין העם" (Yoma 3:6): a linen sheet along the south edge of the parva's roof (Middot 5:3)
      const g = new THREE.PlaneGeometry(7.4, 4.4, 14, 6), P = g.attributes.position;
      for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, Math.sin(x * 1.9) * 0.1 + Math.sin(x * 4.3 + y) * 0.03); }
      g.computeVertexNormals();
      YK.sheet = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#F4EFE3', roughness: 0.96, side: THREE.DoubleSide }));
      const N = PL.NORTH_CHAMBERS;
      YK.sheet.position.set((N.parva.x0 + N.parva.x1) / 2, YK.ROOF_Y + 2.2, N.z1 - 1.75); YK.sheet.name = 'yk-sheet'; YK.sheet.castShadow = true;
      scene.add(YK.sheet);
    }
    if (YK.sheet) YK.sheet.visible = !!on;
  }
  function ykClearKodesh() { if (YK.machta) { actors.unprop(YK.machta); YK.machta = null; } }
  const ykMachtaOnStone = () => { if (!YK.machta) YK.machta = actors.prop('machtaGold', YK.STONE[0] + 0.9, LEVEL.heichal + PL.EVEN_SHTIYA.h + 0.02, YK.STONE[1], -Math.PI / 2, { fill: 1, fadeIn: false }); return YK.machta; };
  // the people bow down while he confesses — and rise with "ברוך שם כבוד מלכותו לעולם ועד" (Yoma 3:8, 6:2): world.avodah.bow,
  // with the Kohen Gadol kept at his confession (his hands stay on the bull)
  async function ykBow(my, sec) {
    const A = YK.kg && YK.kg._a;
    bow(true); if (A && A.alive) actors.pose(A, 'semicha');
    await wait(sec);
    bow(false); if (A && A.alive) actors.pose(A, 'semicha');
    return ykAlive(my);
  }
  const walkIn = (A, pts, speed) => actors.walk(A, pts.map((p) => [p[0], p[1]]), speed);
  const yomKippur = safe(async (step, opts = {}) => {
    const st = norm(step);
    const my = ++YK.seq;
    // (the ordinary life of the courts pauses while the service is shown, and comes back at 'end')
    if (st !== 'end' && YK.wasAmbient === null) { YK.wasAmbient = ambientOn; if (ambientOn) ambient(false); }
    if (st === 'end') {
      if (YK.kg) YK.kg.remove(); YK.kg = null; YK.dress = null;
      for (const k of ['segan', 'rosh']) if (YK[k]) { YK[k].remove(); YK[k] = null; }
      ykBull(false); ykGoats(false); ykCrowd(false); ykSheet(false); ykClearKodesh();
      if (life && life.setBow) life.setBow(0);
      if (YK.wasAmbient) ambient(true);
      YK.wasAmbient = null;
      return true;
    }
    // the stage of each step
    ykSheet(st === 'immersion' || st === 'white');
    ykBull(st === 'confession' || st === 'white');
    ykGoats(st === 'lots');
    ykCrowd(st === 'confession' || st === 'lots' || st === 'exit');
    if (st !== 'lots') for (const k of ['segan', 'rosh']) if (YK[k]) { YK[k].remove(); YK[k] = null; }
    if (!['evenshtiya', 'sprinkle', 'parochet', 'machtaout'].includes(st)) ykClearKodesh();
    if (life && life.setBow) life.setBow(0);
    const N = PL.NORTH_CHAMBERS, RINSE_DOOR = [(N.rinse.x0 + N.rinse.x1) / 2, N.z1 + 1.6];
    if (st === 'immersion') {
      // in gold, from the court to the rinsing chamber, whose stair leads up to the parva's roof (Middot 5:3); he goes up
      // behind the sheet — the camera stays outside
      const h = ykKG('gadol', [-52, -44], -Math.PI / 2, false), A = h._a;
      await walkIn(A, [[-58, -50], [RINSE_DOOR[0], RINSE_DOOR[1]], [RINSE_DOOR[0], N.z1 - 2.5]], 2.6);
      if (!ykAlive(my)) return false;
      vis(h, false); await wait(0.6);
      return true;
    }
    if (st === 'white') {
      // in white: he is seen for a moment on the roof beside the sheet, then comes down and goes toward his bull
      // (wave 4, QA P2-17: he stays on the roof beside the sheet long enough to be seen there, in the chapter's frame)
      const h = ykKG('gadol-white', [N.rinse.x0 + 2.2, N.z1 - 3.6], 0.3, false), A = h._a;
      A.fixedY = YK.ROOF_Y; A.y = YK.ROOF_Y;
      await wait(4.6); if (!ykAlive(my)) return false;
      vis(h, false); await wait(0.6); if (!ykAlive(my)) return false;
      A.fixedY = undefined; h.place(RINSE_DOOR, Math.PI); A.y = LEVEL.azara; vis(h, true);
      await walkIn(A, [[RINSE_DOOR[0], RINSE_DOOR[1] + 3], [-57, -24], [YK.KG_BULL[0] + 0.6, YK.KG_BULL[1] - 4]], 2.4);
      return ykAlive(my);
    }
    if (st === 'confession') {
      // hands on his bull, he confesses; the people bow down
      const h = ykKG('gadol-white', [YK.KG_BULL[0] + 1.2, YK.KG_BULL[1] - 3.5], -Math.PI / 2), A = h._a;
      await walkIn(A, [YK.KG_BULL], 1.6); if (!ykAlive(my)) return false;
      await actors.face(A, YK.BULL[0], YK.KG_BULL[1]); if (!ykAlive(my)) return false;
      await actors.pose(A, 'semicha');
      await wait(1.4); if (!ykAlive(my)) return false;
      const ok = await ykBow(my, 4.2);
      if (!ykAlive(my)) return false;
      await actors.pose(A, 'stand');
      return ok;
    }
    if (st === 'lots') {
      // at the goats: he shakes the kalpi and brings up the two lots, one in each hand; then gives each goat its lot
      const h = ykKG('gadol-white', YK.KG_LOTS, -Math.PI / 2), A = h._a;
      YK.segan = YK.segan || ykHelper('segan-yk', 'kohen', [YK.KG_LOTS[0] + 0.6, YK.KG_LOTS[1] - 1.8], -Math.PI / 2);
      YK.rosh = YK.rosh || ykHelper('rosh-beit-av-yk', 'kohen', [YK.KG_LOTS[0] + 0.6, YK.KG_LOTS[1] + 1.8], -Math.PI / 2);
      await wait(0.8); if (!ykAlive(my)) return false;
      await walkIn(A, [[YK.KALPI[0] + 1.3, YK.KALPI[1]]], 1.2); if (!ykAlive(my)) return false;
      await actors.pose(A, 'bow'); await wait(1.0); if (!ykAlive(my)) return false;
      actors.setItem(A, 'goral');
      await actors.pose(A, 'lift'); await wait(1.6); if (!ykAlive(my)) return false;
      await actors.pose(A, 'stand');
      // "נתנו על שני השעירים" (Yoma 4:1); on the goats' heads: illustration
      for (let i = 0; i < 2; i++) {
        const g = YK.goats[i]; if (!g) continue;
        const hd = g.partPosition('head') || [g.position.x, g.position.y + 1.9, g.position.z];
        await walkIn(A, [[hd[0] + 1.5, hd[2]]], 1.2); if (!ykAlive(my)) return false;
        await actors.face(A, hd[0], hd[2]);
        await actors.pose(A, 'bow');
        YK.lots.push(actors.prop('goral1', hd[0], hd[1] + 0.2, hd[2], Math.PI / 2, { s: 1 }));
        await wait(0.5); await actors.pose(A, 'stand');
      }
      actors.setItem(A, null);
      return ykAlive(my);
    }
    if (st === 'ketoret') {
      // "נטל את המחתה בימינו ואת הכף בשמאלו, היה מהלך בהיכל" (Yoma 5:1): through the Heichal to between the parochot, at the
      // south; he goes in (out of sight). Then he comes out and says a short prayer in the Heichal (ibid.)
      const h = ykKG('gadol-white', YK.IN_PATH[0], -Math.PI / 2), A = h._a;
      actors.setItem(A, 'ykKetoret'); A.fill = 1;
      await actors.pose(A, 'carry');
      await walkIn(A, YK.IN_PATH.slice(1), 1.9); if (!ykAlive(my)) return false;
      vis(h, false); await wait(4.5); if (!ykAlive(my)) return false;
      actors.setItem(A, null); await actors.pose(A, 'stand');
      h.place([-136.2, 8.2], Math.PI / 2 + 0.4); vis(h, true);
      await walkIn(A, [[-131, 5]], 1.4); if (!ykAlive(my)) return false;
      await actors.face(A, -120, 4); await actors.pose(A, 'bow'); await wait(2.4); if (!ykAlive(my)) return false;
      await actors.pose(A, 'stand');
      return true;
    }
    if (st === 'evenshtiya') {
      // he sets the machta on the stone and heaps the ketoret on the coals; the house fills with smoke (Yoma 5:1–2)
      const h = ykKG('gadol-white', YK.KG_STONE, -Math.PI / 2), A = h._a;
      await actors.pose(A, 'bow'); ykMachtaOnStone(); await wait(1.6); if (!ykAlive(my)) return false;
      await actors.pose(A, 'stand');
      return true;
    }
    if (st === 'sprinkle') {
      // once upward and seven downward, "כמצליף", counting aloud (Yoma 5:3) — the motion of the hand only
      ykMachtaOnStone();
      const h = ykKG('gadol-white', YK.KG_SPRINKLE, -Math.PI / 2), A = h._a;
      actors.setItem(A, 'mizrak'); A.fill = 0;
      await wait(0.6);
      for (let n = 0; n < 8; n++) {
        if (!ykAlive(my)) return false;
        if (typeof opts.onCount === 'function') { try { opts.onCount(n); } catch (e) { warn(e); } }
        const g = actors.pose(A, 'flick'); await wait(1.1); await g;
      }
      return ykAlive(my);
    }
    if (st === 'parochet') {
      // toward the parochet from outside: the bull's blood, then the goat's; then the two are mixed (Yoma 5:4) — the motion only
      const h = ykKG('gadol-white', [-133.2, 0.4], -Math.PI / 2), A = h._a;
      actors.setItem(A, 'mizrak'); A.fill = 0;
      await wait(0.8);
      for (let n = 0; n < 8; n++) { if (!ykAlive(my)) return false; const g = actors.pose(A, 'flick'); await wait(1.0); await g; }
      return ykAlive(my);
    }
    if (st === 'machtaout') {
      // at the end of the day, in white again, he goes in to take out the kaf and the machta (Yoma 7:4); then gold again for the afternoon ketoret and the lamps, and only then his own clothes (ibid.) — the world skips the gold step
      ykMachtaOnStone();
      // (he comes in by the north end of the inner parochet, which was folded open at the north, Yoma 5:1)
      const h = ykKG('gadol-white', [-140.6, -7.6], -Math.PI / 2 + 0.5, false), A = h._a;
      await walkIn(A, [YK.KG_STONE], 1.3); if (!ykAlive(my)) return false;
      await actors.face(A, YK.STONE[0], YK.STONE[1]);
      await actors.pose(A, 'bow'); await wait(0.8); if (!ykAlive(my)) return false;
      ykClearKodesh(); actors.setItem(A, 'machtaGold'); A.fill = 0;
      await actors.pose(A, 'raise'); await wait(1.4); if (!ykAlive(my)) return false;
      await actors.pose(A, 'carry');
      await walkIn(A, [[-141, -7.9]], 1.3); if (!ykAlive(my)) return false;
      vis(h, false);
      return true;
    }
    if (st === 'exit') {
      // "הביאו לו בגדי עצמו ולבש, ומלוין אותו עד ביתו" (Yoma 7:4): in his own clothes, the people go with him out to the east
      const h = ykKG('own', [-18, -2], Math.PI / 2), A = h._a;
      const path = [[-4, 0], [6, 0], [30, 0], [120, 0]];
      const escorts = YK.crowd.filter((a) => a.alive).slice(0, 14);
      escorts.forEach((a, i) => { a.paused = false; actors.pose(a, 'stand'); const off = [((i % 4) - 1.5) * 1.6, 1.8 + Math.floor(i / 4) * 1.7]; wait(0.3 + i * 0.12).then(() => { if (ykAlive(my) && a.alive) actors.walk(a, path.map(([x, z]) => [x - off[1], z + off[0]]), 2.1); }); });
      await walkIn(A, path, 2.1);
      return ykAlive(my);
    }
    return false;
  });
  // ── end yk ──
  /* ── per frame ── */
  let T = 0;
  const HV = new THREE.Vector3();
  function update(dt) {
    if (!(dt > 0)) dt = 0;
    T += dt;
    const wnow = nowMs();
    for (let i = timers.length - 1; i >= 0; i--) { const t = timers[i]; t.t -= dt; if (t.t <= 0 || wnow - t.w0 >= t.sec * 1000) { timers.splice(i, 1); clearTimeout(t.bk); t.res(true); } }
    const enabled = !life || life.phase !== 'build';
    actors.setEnabled(enabled);
    if (pensObj) pensObj.mesh.visible = enabled;
    if (chamber) chamber.mesh.visible = enabled;
    if (ownAnimals) animals.update(dt);
    // trumpet blasts: the trumpet lifts a little on each blast (a quick pulse for the teruah)
    for (const h of trumpeters) {
      const a = h._a, b = a.blast;
      if (b) { b.t += dt; const u = b.t / b.dur; a.sway = 0; a.tiltT = u < 1 ? (b.stacc ? -0.08 * (Math.sin(b.t * 30) > 0 ? 1 : 0) : -0.1) : 0; if (u >= 1) a.blast = null; }
    }
    // birds carried in a basket, a dove in the kohen's hand
    for (const an of animals.list) {
      if (!an.heldBy) continue;
      const A = an.heldBy;
      if (!A.alive) { an.heldBy = null; an.held = null; an.visT = 0; an.onHide = () => animals.remove(an); continue; }
      if (A.item === 'cage') { HV.copy(A.hand); an.held.x = HV.x + Math.cos(A.yaw) * an.heldOff; an.held.y = HV.y + 0.04; an.held.z = HV.z - Math.sin(A.yaw) * an.heldOff; }
      else { actors.handWorld(A, -1, HV); an.held.x = HV.x; an.held.y = HV.y - 0.1; an.held.z = HV.z; }
      an.held.yaw = A.yaw;
    }
    ambientStep(dt);
    ambientWash(dt);
    actors.update(dt);
    marks.update(dt);
    ring.update(dt);
    if (fx.fl > 0 || fx.fls > 0) { fx.fl = Math.max(0, fx.fl - dt); fx.fls = Math.max(0, fx.fls - dt); fx.apply(); }
  }

  // ambient life in the courts: a few pilgrims with their offerings, and two kohanim who wash at the kiyor in turn;
  // ambient(false) clears the stage (e.g. before the morning Tamid: nothing is offered before it, Pesachim 58b)
  const washers = [];
  let ambientOn = false, washT = 0;
  const ambient = safeSync((on = true) => {
    ambientOn = !(on === false || on === 0);
    pilgrims(ambientOn ? 3 : 0);
    if (!ambientOn) for (const h of washers.splice(0)) h.remove();
    return ambientOn;
  }, false);
  let twelveT = 25;   // ── water ── (the twelve: soon after ambient life begins, then every three minutes)
  function ambientWash(dt) {
    if (!ambientOn) return;
    if (globalThis.__K20LAVER) { for (const h of washers.splice(0)) h.remove(); return; }   // ── recovered (build 20) ── (kiyor20 holds the laver: the two ambient washers go)
    if (life && life.phase === 'build') return;   // ── water ── (on the building site the actors are hidden: no washing, no streams)
    if (washers.length < 2) { const h = kohen('kiyor-' + (washers.length + 1), { at: [-52 - washers.length * 3, 30 + washers.length * 4] }); h._a.ambient = true; washers.push(h); }
    // ── water ── (WATER, wave 6) now and then the twelve kohanim busy with the Tamid sanctify hands and feet at once, one at
    // each of Ben Katin's spigots (Yoma 37a) — only while the kiyor is up (daylight); the two washers wait for them
    if (water && typeof water.washTogether === 'function') {
      twelveT -= dt;
      let idle = twelveT <= 0 && !water.down && !water.twelve && !water.holding && !(life && life.night);
      for (let i = 0; idle && i < washers.length; i++) if (washers[i].busy) idle = false;
      if (idle) { twelveT = 180; water.washTogether({ n: 12 }); }
      if (water.twelve) return;
    }
    // ── end water ──
    washT -= dt;
    if (washT <= 0) {
      washT = 7;
      if (water && water.state && water.state.down) return;   // ── water ── (the kiyor is lowered for the night: no washing)
      const h = washers.find((w) => w._a.alive && !w._a.path && !w.busy);
      if (h) {
        h.busy = true;
        h.wash().then(() => actors.walk(h._a, route(h._a.x, h._a.z, -50 - Math.random() * 6, 28 + Math.random() * 12), 2.6)).then(() => { h.busy = false; });
      }
    }
  }

  // the full world: its helpers join life.fx (hidden during the AO pass); the folds are open; ambient life on
  if (life) {
    if (Array.isArray(life.fx)) life.fx.push(marks.mesh, ring.mesh);
    try { pens.fill(48); } catch (e) { warn(e); }
    ambient(true);
  }

  // tap to identify: the nearest kohen, Levite, pilgrim or animal under the ray → { kind, id, variant | species, handle }
  const _sc = new THREE.Vector3(), _sp = new THREE.Sphere();
  const pick = safeSync((ray) => {
    const r = ray && ray.ray ? ray.ray : ray; if (!r || !r.origin) return null;
    let best = null, bd = Infinity;
    for (const a of actors.list) {
      if (!a.alive || a.vis < 0.5) continue;
      _sp.center.set(a.x, a.y + 1.9 * a.s, a.z); _sp.radius = 1.1 * a.s;
      if (r.intersectSphere(_sp, _sc)) { const d = _sc.distanceTo(r.origin); if (d < bd) { bd = d; best = { a }; } }
    }
    for (const an of animals.list) {
      if (!an.alive || an.vis < 0.5 || an.held) continue;
      _sp.center.set(an.x, an.y + an.K.d.r * 0.45 * an.s, an.z); _sp.radius = an.K.d.r * 0.55 * an.s;
      if (r.intersectSphere(_sp, _sc)) { const d = _sc.distanceTo(r.origin); if (d < bd) { bd = d; best = { an }; } }
    }
    if (!best) return null;
    if (best.a) {
      let id = null, handle = null; for (const [k, h] of cast) if (h._a === best.a) { id = k; handle = h; }
      const kind = best.a.variant === 'levite' ? 'levite' : best.a.variant === 'pilgrim' || best.a.variant === 'woman' ? 'pilgrim' : 'kohen';
      return { kind, id, variant: best.a.variant, role: best.a.role || null, item: best.a.item, handle };
    }
    let handle = null; for (const h of beasts) if (h._h === best.an) handle = h;
    return { kind: 'animal', species: best.an.kind, handle };
  });

  // ── water ── (WATER, wave 6) world.water, when the world has it (main.js `// ── water ──`); every use is guarded
  let water = ctx.water || null;
  const useWater = (w) => { water = w || null; return !!water; };
  const waterLayer = () => water;   // (libation() has its own `water`, a flag)
  const handAt = (A, side = -1) => { try { const o = { x: 0, y: 0, z: 0 }; actors.handWorld(A, side, o); return Number.isFinite(o.y) ? o : null; } catch (e) { return null; } };
  // the rest of the blood poured on the yesod (Tamid 4:1; Yoma 5:6): a guarded hook for the step that pours it —
  // shirayim(corner = 'S' | 'W', { kohen }) → P. The kohen (the one holding the mizrak, else the nearest) goes to the yesod
  // at the SW corner and pours; the thin trickle runs into the two holes there (Middot 3:2).
  const shirayim = safe(async (corner = 'S', opts = {}) => sprinkle('SW', 'yesod', { ...opts, yesod: String(corner).toUpperCase().startsWith('W') ? 'W' : 'S' }));
  // ── end water ──
  const api = {
    kohen, animal, pick, ambient, slaughter, sprinkle, limbs, libation, trumpets, levites, blessing, bow, fire, smoke, pilgrim, pilgrims, birdOffering, pens, lambsChamber, update,
    // extras for tests and the world: the ground, the route, the named places, counts
    groundY, route, places: Object.keys(PLACE), wait,
    useWater, shirayim,   // ── water ──
    // ── blooda25 ── a mark on the real altar without a kohen walking there (the works draw their own kohen): the Γ below the line ('lower'),
    // the dot on the horn ('upper'), the yesod; marks() lists them (tests), clearMarks() (a new dawn)
    mark: safeSync((corner = 'NE', level = 'lower') => { if (!C[corner]) return false; cornerMarks(marks, corner, level); return true; }, false),
    marks: () => marks.list(), clearMarks: () => marks.clear(),
    // ── /blooda25 ──
    get stats() { return { actors: actors.list.length, animals: animals.list.length, marks: marks.n, props: actors.props.length, draws: actors.drawn + (ownAnimals ? animals.drawn : 0) }; },
    _actors: actors, _animals: animals, _cast: cast,
  };
  // ── yk ── (and its state, for tests and the scenes panel)
  api.yomKippur = yomKippur;
  api.ykState = () => ({ step: YK.seq, dress: YK.kg && YK.kg._a.alive ? YK.dress : null, x: YK.kg ? YK.kg._a.x : null, z: YK.kg ? YK.kg._a.z : null, item: YK.kg ? YK.kg._a.item : null, visible: !!(YK.kg && YK.kg._a.visT > 0),
    bull: !!(YK.bull && YK.bull._h.alive), goats: YK.goats.filter((g) => g && g._h.alive).length, kalpi: !!YK.kalpi, lots: YK.lots.length, machta: !!YK.machta, crowd: YK.crowd.filter((a) => a.alive).length, sheet: !!(YK.sheet && YK.sheet.visible) });
  // ── end yk ──
  if (life && life.addUpdater) life.addUpdater(update);
  return api;
}
