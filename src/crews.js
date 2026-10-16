/* ─────────────────────────────────────────────────────────────────────────────
 * crews.js — the Phase A building crews, seen at work (CREWS agent; docs/CREWS.md).
 *
 *   const crews = createCrews({ scene, camera, life, stages, actors, animals, terrainH });
 *   crews.setCrews(siteId, n, ids?)  n crews (0–4) at a building site: 4–5 people per crew; ids: the crews' numbers in the
 *                                    game (G.crews indices) so each crew keeps its colour wherever it works
 *   crews.setQuarry(n, ids?)         n crews in the quarry (the outcrop on the platform's north-east)
 *   crews.caravan(routeId, state)    'wagons' | 'cedar' | 'alexandria' | 'beitkerem';
 *                                    state: { status: 'out', left: ms, total: ms, site? } | { status: 'back', site? } |
 *                                           'collected' | 'none' (also a plain 'out' / 'back')
 *   crews.trainees(n)                n young kohanim in the training yard by the Lishkat HaGazit, with their master
 *   crews.cheer(siteId)              the site's crews celebrate (the stage is complete)
 *   crews.update(dt)                 every frame (main.js registers it as a life updater)
 *   crews.setEnabled(bool), crews.reset(), crews.stats, crews.setScale(px)
 *
 * People are actors.js figures (their own createActors instance: one draw call per dress kind in view + one for all
 * the tools), the oxen are animals.js bulls (one draw call), the carts two instanced meshes (bodies, wheels), the dust
 * one Points object. Everything is culled per instance (frustum + distance) and nothing allocates per frame.
 * The crews are drawn only while the world is in its building phase (life.phase === 'build'): the whole-Temple view,
 * Phase B and the tour (stages.demoMode) hide them by themselves, and they come back with Phase A.
 *
 * Where the sources speak, the scene follows them (drafts for the owner, PROJECT.md §2):
 * · the House itself was built by kohanim trained as masons and carpenters (Josephus, Ant. 15.11.2, 15.11.6): the
 *   crews at the Ulam, the Heichal and the Kodesh HaKodashim wear the kohen's white, and the trainees learn with
 *   hammer and chisel by the Lishkat HaGazit, where the Sanhedrin judged the priesthood (Middot 5:4);
 * · the altar's stones are whole, "שלא הונף עליהן ברזל" (Middot 3:4): no chisel and no iron there — wooden mallets,
 *   whole field stones carried in the arms, and lime for the whitewash in the finishing phase;
 * · Herod "got ready a thousand waggons" for the stones (Ant. 15.11.2, Whiston): the wagons route is a train of ox carts;
 *   cedar comes "מן הלבנון אל ים יפוא" (Ezra 3:7) and up the road; Nikanor's doors come from Alexandria (Yoma 38a).
 * The road: over Wilson's causeway from the Upper City to the Temple Mount's west side (the Coponius gate, Middot 1:3),
 * then along the north side of the courts to the site. Road, colours, dress and numbers: illustration.
 * 1 unit = 1 amah; +x east, +z south, +y up.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { createActors as defActors, ACTOR_S } from './actors.js';
import { createAnimals as defAnimals, Blobs } from './animals.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

/* ───────── the people ───────── */
const TUNIC = ['#D6C8A8', '#C4AE86', '#AD9570', '#E2D6BE', '#9C8466', '#CBBB9C', '#A58E70', '#DACCB0'];
// the crews' colours (head cloth and belt): crew 1 blue (the builder's own), 2 red, 3 green, 4 ochre — illustration
const CREW_COL = ['#2F6DB5', '#B5452F', '#4F8A3C', '#D29A2A'];
const BOSS_TUNIC = '#6E5237';
// every crew is a mixed team (4–5); the roles adapt to the phase, the site and the crane (see roleFor)
const CREW = [
  ['boss', 'mason', 'mason', 'carrier'],
  ['sawA', 'sawB', 'mason', 'carrier'],
  ['rope', 'rope', 'rope', 'carrier'],
  ['mason', 'mason', 'carrier', 'carrier', 'carrier'],
];

/* ───────── where each site's crews work ─────────
   Hand-placed on open, walkable ground outside each site's footprint (and beyond its scaffold), clear of the hero's
   work spot and of the other sites' ground (stages.js DEF). stand: [x, z, faceX, faceZ] (a mason faces his stone,
   laid between him and the face point) · pile / drop: the carriers' loop · saw: [x, z, yaw of the beam] ·
   rope: the tag-line men at the crane · boss: the foreman · enter: where new people come from.
   kind: 'kohen' (the House: priests), 'altar' (no iron), 'bronze'. */
const SITES = {
  wall: { stand: [[60, -90, 61, -84], [67, -92, 67, -86], [112, -92, 111, -86], [119, -90, 119, -84], [84, -95, 86, -89], [128, -94, 127, -88], [52, -93, 53, -87], [138, -91, 137, -85]],
    pile: [78, -106], drop: [80, -83], saw: [100, -105, 0], rope: [[36, -84], [31, -89], [53, -85]], boss: [72, -98], enter: [80, -124] },
  sorag: { stand: [[176, 30, 170, 30], [178, 50, 172, 50], [175, -30, 169, -30], [177, -46, 171, -46], [180, 62, 174, 62], [176, -60, 170, -60]],
    pile: [192, 40], drop: [169, 24], saw: [190, 6, Math.PI / 2], rope: [[88, -94], [104, -95], [84, -100]], boss: [185, 25], enter: [215, 40] },
  gates: { stand: [[158, 30, 153, 25], [161, 38, 156, 33], [157, -26, 152, -21], [160, -34, 155, -29]],
    pile: [171, 44], drop: [153, 17], saw: [169, -46, 0], rope: [[163, 1], [165, 12], [169, 7]], boss: [167, 26], enter: [190, 20] },
  nashim: { stand: [[68, -20, 69, -26], [75, -24, 77, -30], [60, 22, 57, 28], [70, 26, 70, 32], [57, -24, 55, -30], [80, 21, 83, 27]],
    pile: [56, -12], drop: [96, -25], saw: [84, 15, 0], rope: [[82, -7], [95, -5], [78, -14]], boss: [64, -6], enter: [122, 8] },
  nikanor: { stand: [[36, -14, 31, -12], [40, -20, 35, -19], [44, -12, 39, -9], [38, 27, 33, 25]],
    pile: [52, -22], drop: [29, -13], saw: [50, 22, Math.PI / 2], rope: [[30, -5], [34, -9], [27, -10]], boss: [46, 8], enter: [72, -10] },
  // (the chambers' crews work the open court in front of the slaughter area's fittings: the north wall hides the rest from
  //  the site's camera)
  lishka: { stand: [[-46, -20, -46, -25], [-38, -21, -38, -26], [-30, -20, -30, -25], [-50, -12, -51, -17]],
    pile: [-42, -5], drop: [-38, -24], saw: [-58, -4, Math.PI / 2], rope: [[-166, -38], [-154, -37], [-170, -44]], boss: [-33, -11], enter: [-20, 2] },
  // (wave 4: the altar's camera looks from the north-east, north of the Nikanor gatehouse (stages.js DEF view), so the setters
  //  work the north face and the east face south of the builder, and the whole stones are piled to the north-west)
  yesod: { kind: 'altar', stand: [[-20, 6, -22, 6], [-40, -23, -40, -21], [-20, 10.5, -22, 10.5], [-30, -23.5, -30, -21.5], [-20, 1.5, -22, 1.5], [-47, -23, -47, -21]],
    pile: [-62, -25], drop: [-52, -22], rope: [[-26, -27], [-20, -24], [-14, -22]], boss: [-36, -28], enter: [-72, -30] },
  kiyor: { kind: 'bronze', stand: [[-57, 13, -60, 15], [-56, 28, -59, 26], [-69, 12, -66, 15]],
    pile: [-51, 34], drop: [-58, 22], saw: [-52, 45, Math.PI / 2], rope: [[-68, 24], [-58, 32], [-70, 30]], boss: [-52, 16], enter: [-40, 52] },
  ulam: { kind: 'kohen', stand: [[-50, 18, -53, 18], [-50, 32, -53, 31], [-51, -30, -53.5, -30], [-50, -42, -53, -41]],
    pile: [-50, 44], drop: [-53, 24], saw: [-20, 28, Math.PI / 2], rope: [[-52, -24], [-52, -36], [-48, -30]], boss: [-48, 16], enter: [-30, 56] },
  heichal: { kind: 'kohen', stand: [[-146, -44, -146, -40], [-140, -48, -140, -44], [-133, -45, -133, -41], [-126, -48, -126, -44]],
    pile: [-112, -54], drop: [-118, -41], saw: [-99, -55, 0], rope: [[-108, -50], [-99, -50], [-104, -55]], boss: [-122, -54], enter: [-120, -62] },
  kodesh: { kind: 'kohen', stand: [[-182, -44, -182, -40], [-176, -48, -176, -44], [-152, -45, -152, -41], [-146, -48, -146, -44]],
    pile: [-184, -54], drop: [-178, -40], saw: [-150, -54, 0], rope: [[-172, -50], [-163, -51], [-168, -55]], boss: [-158, -54], enter: [-130, -58] },
};
for (const id of ['sovev', 'guf', 'karnot']) SITES[id] = SITES.yesod;
// the altar's pile of whole stones: the same field stones as its courses
// (the har crew works at a boulder: its slots are made around the rock, see harLayout)
// ── site9 ── the boulder field (wave 9): read from stages.boulderSpots() in createCrews; this copy is the fallback
let BOULDER_XZR = [[206.3, -8.6, 8.6], [202.3, 15.3, 7.4], [225.9, 10.3, 9.2], [221.8, 34.1, 7.8], [128, -84, 8.4], [123.9, -60.2, 7.6],
  [147.6, -65.1, 8.8], [143.5, -41.3, 7.4], [167.2, -46.3, 8.4], [163.1, -22.5, 7.8], [186.8, -27.4, 8.6], [182.7, -3.6, 9]];   // mirrors stages.js BOULDERS
// the stages' crane (mirrors stages.js DEF[id].crane): the tag lines' fallback target when the world gives no block
const CRANE = { wall: [44, -96, 50], sorag: [96, -104, 20], gates: [143, 6, 22], nashim: [88, -14, 26], nikanor: [3, -7, 24], lishka: [-160, -44, 30],
  yesod: [-13, -31, 24], sovev: [-13, -31, 24], guf: [-13, -31, 26], karnot: [-13, -31, 26], kiyor: [-63, 30, 16], ulam: [-84, -30, 30], heichal: [-104, -26, 28], kodesh: [-168, -26, 28] };

/* ───────── the quarry (stages.js: the outcrop at (208, −208), its cut benches and the stock piles QPILES) ───────── */
const QUARRY = {
  pick: [[190, -223, 196, -222], [229, -188, 225, -194], [203, -231, 205, -226]],
  split: [186, -208], lever: [[203, -230, 206, -226]], pile: [185, -191], boss: [180, -200], enter: [170, -180],
};
/* ───────── the training yard, by the Lishkat HaGazit (Middot 5:4), inside the azara's south side ───────── */
const YARD = { master: [-52, 50.5, -52, 57], seats: [[-58, 56], [-53.5, 56.5], [-49, 56], [-44.5, 56.5], [-56, 61], [-51, 61.5], [-46, 61]], enter: [-40, 60] };

/* ───────── caravans: the road (two lanes along the north side of the courts), the gate, Wilson's causeway ───────── */
const ROUTE_CARGO = { wagons: 'stone', cedar: 'log', alexandria: 'door', beitkerem: 'fieldstone' };
const CAUSEWAY = { x0: -470, x1: -304, z: -59 };
const GATE_IN = [-286, -56.5];
const LANE_IN = -112, LANE_OUT = -126, LANE_X = -250;
const CARTS = 3, CART_GAP = 12.5;                         // carts per train; distance between carts along the road
const SITE_X = { wall: 70, sorag: 60, gates: 60, nashim: 60, nikanor: 30, lishka: -140, yesod: -30, sovev: -30, guf: -30, karnot: -30, kiyor: -60, ulam: -60, heichal: -115, kodesh: -160, har: 40, quarry: 40 };

// ── site14 ── the crews' saw bench at a site ([x, z, yaw of the beam] | null), for stages.js's saw job (jobSpot, the plank pile)
export function sawBench(id) { const L = SITES[id]; return L && L.saw ? L.saw.slice() : null; }
// ── /site14 ──
export function createCrews(ctx = {}) {
  const { scene, camera, life = null, stages = null } = ctx;
  const terrainH = typeof ctx.terrainH === 'function' ? ctx.terrainH : () => 0;
  const mkActors = (ctx.actors && ctx.actors.createActors) || (typeof ctx.actors === 'function' ? ctx.actors : defActors);
  const mkAnimals = (ctx.animals && ctx.animals.createAnimals) || (typeof ctx.animals === 'function' ? ctx.animals : defAnimals);
  const warn = (e) => { try { console.warn('[crews]', e && e.message ? e.message : e); } catch (_) { /* */ } };
  // ── site9 ── the boulder field as the world has it (one source: stages.js BOULDERS)
  try { const bs = stages && typeof stages.boulderSpots === 'function' ? stages.boulderSpots() : null; if (Array.isArray(bs) && bs.length === 12 && bs.every((b) => Array.isArray(b) && b.length >= 3)) BOULDER_XZR = bs.map((b) => [+b[0], +b[1], +b[2]]); } catch (e) { /* */ }

  /* ── the ground: the world as built (stages.groundAt), Wilson's causeway deck, else the terrain ── */
  let groundFn = null;
  try { if (stages && typeof stages.groundAt === 'function') groundFn = stages.groundAt; } catch (e) { /* */ }
  function ground(x, z) {
    if (x < -299.5 && x > -471 && z > -71 && z < -47) return 0.25;
    if (groundFn) { try { const y = groundFn(x, z); if (Number.isFinite(y)) return y; } catch (e) { /* the world is changing */ } }
    return x < -300 || x > 277 || z < -480 || z > 400 ? terrainH(x, z) : 0;
  }

  const ownBlobs = !(life && life.blobs);
  const blobs = life && life.blobs ? life.blobs : new Blobs(scene, 256);
  const actors = mkActors({ scene, camera, blobs, ground, max: 160, maxItems: 220 });   // ── site16 ── (the life layer shares the instance)
  const animals = mkAnimals({ scene, camera, blobs, ground });

  /* ── carts: bodies and wheels, instanced; per-instance culling by us ── */
  const MAXC = 18;   // ── site13 ── (was 12: + the site's own cart train, siteTrain below)
  const cartMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  const cartGeo = cartGeometry(), wheelGeo = wheelGeometry();
  const cartMesh = new THREE.InstancedMesh(cartGeo, cartMat, MAXC), wheelMesh = new THREE.InstancedMesh(wheelGeo, cartMat, MAXC * 2);
  for (const m of [cartMesh, wheelMesh]) { m.count = 0; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(m); }
  cartMesh.name = 'crews-carts'; wheelMesh.name = 'crews-wheels';

  /* ── dust: one Points object (hammer strikes, the quarry, the carts) ── */
  const dust = makeDust(160);
  scene.add(dust.points);
  if (life && Array.isArray(life.fx)) life.fx.push(dust.points);

  /* ── shared scratch (no per-frame allocations) ── */
  const fr = new THREE.Frustum(), pm = new THREE.Matrix4(), sph = new THREE.Sphere();
  const V = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S3 = new THREE.Vector3(1, 1, 1);
  const camP = new THREE.Vector3();
  let T = 0, enabled = true, shown = true, pxScale = 600;

  let seed = 91;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  /* ───────── people ───────── */
  const people = [];      // every worker record
  function person(variant, x, z, o = {}) {
    // (kohanim keep their own hair colour in iCol2; a worker's is the crew colour of his head cloth and belt)
    const a = actors.add(variant, x, z, { yaw: o.yaw || 0, fadeIn: o.fadeIn !== false, col2: variant === 'worker' ? o.col2 || CREW_COL[0] : undefined });
    if (o.fadeIn !== false) { a.vis = 0; a.visT = 1; }
    const tunic = o.col || TUNIC[Math.floor(rnd() * TUNIC.length)];
    if (variant === 'worker') a.col.set(tunic);
    const w = {
      a, role: 'idle', site: null, crew: 0, slot: 0, x, z, fx: x, fz: z + 1, st: 'idle', t: 0, off: rnd() * 10, per: 0.95 + rnd() * 0.35,
      path: [[x, z]], faceTo: [x, z + 1], item: null, tool: null, chisel: null, block: null, rope: null, cheer: 0, leaving: false,
      carry: null, from: [0, 0], to: [0, 0], lastU: 0, lod: true, gone: false, hopY: 0, tunic, point: 0,
    };
    // ── people7 ── actors vary more in height now; the crews keep the old ±4 % (a mason's blow is solved at ACTOR_S)
    a.s = ACTOR_S * (0.96 + rnd() * 0.08) * (a.young ? 0.97 : 1);
    w.s0 = a.s;
    people.push(w);
    return w;
  }
  function setTool(w, item) {
    if (w.tool === item) return;
    w.tool = item;
    actors.setItem(w.a, item);
    w.a.fill = 0;
    if (!w.lod) w.a.item = null;
  }
  function walkTo(w, x, z, speed) {
    const a = w.a;
    w.path[0][0] = x; w.path[0][1] = z;
    a.path = w.path; a.pi = 0; a.speed = speed || 2.6; a.face = null;
  }
  const arrived = (w) => !w.a.path;
  function dropProps(w) {
    if (w.chisel) { actors.unprop(w.chisel); w.chisel = null; }
    if (w.block) { actors.unprop(w.block); w.block = null; }
  }
  function dismiss(w, x, z) {
    if (w.leaving) return;
    w.leaving = true; w.role = 'leave'; w.st = 'leave'; w.t = 0;
    if (w.up) { w.up = null; w.wasUp = true; w.cheer = 0; x = undefined; }     // (a scaffold man climbs down out of sight)
    dropProps(w);
    if (w.rope) { w.rope.alive = false; w.a.rope = null; }
    if (x !== undefined) walkTo(w, x, z, 2.8);
  }
  function destroy(w) {
    dropProps(w);
    if (w.a.rope) w.a.rope = null;
    actors.remove(w.a);
    w.gone = true;
    const i = people.indexOf(w); if (i >= 0) people.splice(i, 1);
  }

  /* ───────── sites ───────── */
  const sites = {};       // id → { id, n, want, crews: [[w…]…], props: [], phase, crane, dirty, cheer, bould }
  function siteState(id) {
    if (!sites[id]) sites[id] = { id, n: 0, crews: [], props: [], phase: -1, crane: false, dirty: true, cheer: 0, bould: -1, chk: 0, pile: null, bench: null };
    return sites[id];
  }
  function sitePhase(id) {
    try { const s = stages && stages.status ? stages.status(id) : null; if (s) { const p = s.shown !== undefined ? s.shown : s.progress; return p < 0.15 ? 0 : p < 0.7 ? 1 : 2; } } catch (e) { /* */ }
    return 1;
  }
  // the stages' crane (read-only, through the world's public API — stages.crane(out), wave 4): which site it serves and where
  // its block hangs (filled into one object, no allocation per frame)
  const craneNow = { site: null, x: 0, y: -1e9, z: 0, carry: false };
  const craneRead = () => { try { return stages && typeof stages.crane === 'function' ? stages.crane(craneNow) : null; } catch (e) { return null; } };
  const craneSite = () => { const c = craneRead(); return c ? c.site : null; };
  // the site's scaffold, read-only from the world (stages.scaffold(id), wave 4: runs [a, b, outward normal, y0, y1], lift,
  // rows, the site's camera direction): masons stand on its boards on the faces the site's camera sees (the court walls hide
  // the ground behind them)
  function scaffOf(id) {
    try {
      const sc = stages && typeof stages.scaffold === 'function' ? stages.scaffold(id) : null;
      if (!sc || !sc.runs) return null;
      const v = sc.view || { az: -30 }, az = v.az * Math.PI / 180, cx = Math.cos(az), cz = Math.sin(az);
      const runs = sc.runs.filter((r) => r[2][0] * cx + r[2][1] * cz > 0.3 && Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1]) > 8);
      return runs.length ? { sc, runs } : null;
    } catch (e) { return null; }
  }
  function scaffSpot(S, k) {
    const run = S.runs[k % S.runs.length], t = 0.2 + 0.6 * ((k * 0.618 + 0.13 + Math.floor(k / S.runs.length) * 0.29) % 1);
    const [a, b, n] = run, o = S.sc.rows === 1 ? 0.85 : 2.15;
    const x = a[0] + (b[0] - a[0]) * t + n[0] * o, z = a[1] + (b[1] - a[1]) * t + n[1] * o;
    return { S, run, x, z, fx: x - n[0] * 3, fz: z - n[1] * 3 };
  }
  // the board below the rising wall (where stages.js stands its own masons: scaffold(id).level(run))
  function scaffY(sp) {
    const y = sp.S.sc.level(sp.run);
    return typeof y === 'number' ? y : sp.run[3];
  }
  function roleFor(id, k, j, phase, craneHere) {
    const L = SITES[id], kind = L ? L.kind : null;
    let r = CREW[k % CREW.length][j];
    if (id === 'har') { if (r === 'sawA' || r === 'sawB' || r === 'rope') r = j === 3 ? 'carrier' : 'mason'; return r === 'mason' ? 'digger' : r; }
    if (r === 'rope' && (!craneHere || phase === 0)) r = j === 0 ? 'carrier' : 'mason';
    if ((r === 'sawA' || r === 'sawB') && (!L || !L.saw)) r = r === 'sawA' ? 'mason' : 'carrier';
    if (r === 'mason' && phase === 0 && kind !== 'altar') r = 'digger';
    return r;
  }
  // the crews wanted: their game ids (colours) in order; without ids, 0 … n−1
  function idList(n, ids) {
    const out = [];
    for (let k = 0; k < n; k++) out.push(Array.isArray(ids) && Number.isFinite(+ids[k]) ? Math.max(0, Math.floor(+ids[k])) : k);
    return out;
  }
  function setCrews(id, n, ids, opts) {
    if (id === 'quarry') return setQuarry(n, ids);
    if (!SITES[id] && id !== 'har') return false;
    const s = siteState(id);
    s.waiting = !!(opts && opts.waiting);        // ── people6 ── (PEOPLE) the site waits (a key stone, materials, Shabbat): the crew rests
    const want = clamp(Math.floor(+n || 0), 0, 4), list = idList(want, ids), key = list.join(',');
    if (want === s.n && key === s.ids && !s.dirty) return true;
    s.n = want; s.ids = key; s.idList = list; s.dirty = true;
    return true;
  }
  // keep the crews whose ids are still wanted, dismiss the others, add the new ones (at the end)
  function rosterSync(list, want, make, dismissCrew) {
    for (let k = list.length - 1; k >= 0; k--) if (!want.includes(list[k].id)) { const crew = list[k]; list.splice(k, 1); dismissCrew(crew); }
    for (const id of want) if (!list.some((c) => c.id === id)) { const crew = make(id, list.length); crew.id = id; list.push(crew); }
  }
  // (re)build a site's roster: crews are added or dismissed at the end; roles re-dealt when the phase or crane changes
  function syncSite(s) {
    s.dirty = false;
    const id = s.id, L = id === 'har' ? harLayout(s) : frontLayout(s, id);   // ── site11 ── (frontLayout)
    if (!L) return;
    const phase = s.phase = sitePhase(id), craneHere = s.crane = craneSite() === id;
    const kohen = L.kind === 'kohen';
    rosterSync(s.crews, s.idList || idList(s.n), (cid, k) => {
      const crew = [];
      // (five people: the size of the largest crew, so a crew keeps its people when the roles are dealt again)
      for (let j = 0; j < 5; j++) {
        const x = L.enter[0] + (rnd() - 0.5) * 6, z = L.enter[1] + (rnd() - 0.5) * 6;
        const w = person(kohen ? 'kohen' : 'worker', x, z, { col2: CREW_COL[cid % 4] });
        w.site = id; w.crew = cid; w.role = ''; w.st = 'new'; w.fresh = true;
        crew.push(w);
      }
      return crew;
    }, (crew) => { for (const w of crew) dismiss(w, L.enter[0] + (rnd() - 0.5) * 8, L.enter[1] + (rnd() - 0.5) * 8); });
    // deal the roles and slots
    const cnt = { stand: 0, carrier: 0, rope: 0, up: 0 };
    const S = phase >= 1 && !(id === 'har' && L.bay) ? scaffOf(id) : null;   // ── site9 ── (the Mount's walls: in the bay, not on its far faces)
    for (let k = 0; k < s.crews.length; k++) {
      const crew = s.crews[k], size = CREW[k % CREW.length].length;
      for (let j = 0; j < crew.length; j++) {
        const w = crew[j];
        // a crew in a smaller slot of the roster sends its fifth man home for now (he comes back when it moves up)
        if (j >= size) { if (w.a.visT !== 0 || w.st !== 'off') { w.st = 'off'; w.role = 'off'; w.a.visT = 0; dropProps(w); setTool(w, null); if (w.rope) { w.rope.alive = false; w.a.rope = null; w.rope = null; } } continue; }
        if (w.st === 'off') { w.a.visT = 1; w.st = 'goto'; w.fresh = true; }
        const r = roleFor(id, k, j, phase, craneHere);
        // every other mason works up on the scaffold, facing the camera's side of the site
        if (r === 'mason' && S && cnt.up <= cnt.stand && cnt.up < 3) { assignUp(w, scaffSpot(S, cnt.up++), L); continue; }
        const slot = r === 'mason' || r === 'digger' ? cnt.stand++ : r === 'carrier' ? cnt.carrier++ : r === 'rope' ? cnt.rope++ : 0;
        assign(w, r, slot, L, s);
        nearSlot(w, L.enter);
      }
    }
    sitePiles(s, L, phase);
  }
  // a site's stone pile (the carriers' pickup) and its sawing bench, as props
  function sitePiles(s, L, phase) {
    const want = s.n > 0 && L.pile && s.id !== 'har' && !s.frontOn;   // ── site11 ── (one pile: the world's stock at the working front)
    const kind = L.kind === 'altar' ? 'fieldstone' : 'stone';
    if (want && !s.pile) {
      s.pile = [];
      const [px, pz] = L.pile, gy = ground(px, pz);
      const n = kind === 'fieldstone' ? 5 : 6;
      for (let i = 0; i < n; i++) {
        const l = i < 3 ? 0 : i < 5 ? 1 : 2, c = i < 3 ? i - 1 : i < 5 ? i - 3.5 : 0;
        const p = kind === 'fieldstone'
          ? actors.prop(kind, px + c * 1.3, gy + 0.36 + l * 0.6, pz + (l ? 0.2 : 0), i * 1.7, { s: 1.35 })
          : actors.prop(kind, px + c * 1.35, gy + 0.36 + l * 0.72, pz, 0, { s: 1.42 });
        if (p) s.pile.push(p);
      }
    } else if (!want && s.pile) { for (const p of s.pile) actors.unprop(p); s.pile = null; }
    const bench = s.n > 1 && L.saw;
    if (bench && !s.bench) { const [bx, bz, yaw] = L.saw; s.bench = actors.prop('beam', bx, ground(bx, bz), bz, yaw, { s: 1 }); }
    else if (!bench && s.bench) { actors.unprop(s.bench); s.bench = null; }
  }
  // ── site11 ── (STAGING R5, §6 W6: "around him the masons dress at their bankers and 2 carriers bring the next block"; the owner,
  // 29.9: the kohen at work from point to point) every other site's working front follows the posed crane and its stock
  // (stages.js sitePose): the carriers' loop from the stock to the course beside his slot, the tag-line men by the stock under
  // the jib, the foreman between the stock and the course; the far masons keep their stands. Re-dealt when the stock moves on
  // (≥ 12 amot: a stone, a segment, the crews' stones) — the gangs walk on with the work.
  function frontLayout(s, id) {
    const L0 = SITES[id];
    if (!L0 || id === 'har' || !stages || typeof stages.workSpot !== 'function' || typeof stages.nextSlot !== 'function') return L0;
    let sk = null, sl = null, c = null;
    try { c = craneRead(); if (c && c.site === id && c.posed) { sk = stages.workSpot(id, 'stock'); sl = stages.nextSlot(id); } } catch (e) { sk = null; }
    if (c && c.site === id && !c.posed && s.frontOn && s.fl) return s.fl;   // (the crane rolling on: the gangs keep their places until it stands)
    if (!sk || !sl || !Array.isArray(sl.n) || !Array.isArray(sl.face) || !Array.isArray(sk.face)) { s.front = -1; s.frontOn = false; return L0; }
    s.frontOn = true;
    const nx = sl.n[0], nz = sl.n[1], ux = -nz, uz = nx, [px, pz] = sk.face, [sx, , sz] = sl.face;
    s.front = Math.round(px / 12) * 97 + Math.round(pz / 12);
    const F = s.fl || (s.fl = {});
    Object.assign(F, L0);
    F.pile = [sk.x, sk.z];                                                   // (where a carrier takes a block off the stock)
    F.drop = [sx + nx * 4.5 + ux * 5, sz + nz * 4.5 + uz * 5];             // (beside his slot, on his other side)
    F.rope = [[px + ux * 4, pz + uz * 4], [px - ux * 4, pz - uz * 4], [c.bx + ux * 3, c.bz + uz * 3]];
    F.boss = [(px + sx) / 2 + ux * 9, (pz + sz) / 2 + uz * 9];
    F.enter = [px + nx * 22, pz + nz * 22];
    return F;
  }
  // the har crew breaks a boulder: slots around the rock the builder works at (or the one nearest him)
  const harL = { stand: [], pile: null, drop: null, rope: [], boss: [0, 0], enter: [0, 0], dump: [0, 0] };
  for (let i = 0; i < 8; i++) harL.stand.push([0, 0, 0, 0]);
  let heroX = 150, heroZ = -96, heroAt = null;
  function harLayout(s) {
    // ── site9 ── (DESIGN9 16:08, R5 "the frame has no one in it but him") the Mount's walls: the crew works in the working bay
    // (stages.js harBay) — men at the dressing yard's bankers and round the stock, carriers between the stock and a banker
    try {
      const st = stages && stages.status ? stages.status('har') : null;
      if (st && st.status === 'building' && st.shown >= 0.15 && typeof stages.workSpot === 'function') {
        const yd = stages.workSpot('har', 'yard'), sk = stages.workSpot('har', 'stock');
        if (yd && Array.isArray(yd.bankers) && yd.bankers.length && sk && Array.isArray(yd.n) && Array.isArray(yd.along)) {
          s.bould = 1000 + Math.round(sk.x / 8) * 97 + Math.round(sk.z / 8);   // (re-dealt when the bay moves)
          const nb = yd.bankers.length, [ax, az] = yd.along, [nx, nz] = yd.n;
          for (let i = 0; i < 8; i++) {
            const S = harL.stand[i];
            if (i < nb) { const b = yd.bankers[i], t = b.stone || b; S[0] = b.x; S[1] = b.z; S[2] = t.x; S[3] = t.z; }
            else { const k = i - nb, o = (k - 2) * 2.4; S[0] = sk.x + ax * o - nx * 2.2; S[1] = sk.z + az * o - nz * 2.2; S[2] = S[0] + nx * 3; S[3] = S[1] + nz * 3; }
          }
          harL.drop = [yd.bankers[0].x, yd.bankers[0].z]; harL.pile = [sk.x, sk.z];
          harL.boss[0] = sk.x - nx * 6 + ax * 5; harL.boss[1] = sk.z - nz * 6 + az * 5;
          harL.enter[0] = sk.x - nx * 14; harL.enter[1] = sk.z - nz * 14;
          harL.bay = true;
          return harL;
        }
      }
    } catch (e) { /* */ }
    harL.bay = false;
    let states = null;
    try { states = stages && stages.boulders; } catch (e) { /* */ }
    let bi = -1;
    if (heroAt && /^b\d+$/.test(heroAt)) { const i = +heroAt.slice(1); if (!states || states[i] > 0) bi = i; }
    if (bi < 0) { let bd = Infinity; for (let i = 0; i < BOULDER_XZR.length; i++) { if (states && !(states[i] > 0)) continue; const d = Math.hypot(BOULDER_XZR[i][0] - heroX, BOULDER_XZR[i][1] - heroZ); if (d < bd) { bd = d; bi = i; } } }
    if (bi < 0) bi = 4;
    s.bould = bi;
    const [bx, bz, r] = BOULDER_XZR[bi];
    // the builder's side of the rock (the camera looks over his shoulder): the crew works its flanks, where it is seen
    const ha = Math.atan2(heroZ - bz, heroX - bx);
    for (let i = 0; i < 8; i++) {
      const a = ha + (i % 2 ? 1 : -1) * (1.25 + Math.floor(i / 2) * 0.38), rr = r + 1.5;
      const S = harL.stand[i]; S[0] = bx + Math.cos(a) * rr; S[1] = bz + Math.sin(a) * rr; S[2] = bx; S[3] = bz;
    }
    // the rubble is carried off the flank to a heap, the foreman watches from the builder's side
    harL.drop = [bx + Math.cos(ha - 1.75) * (r + 2.5), bz + Math.sin(ha - 1.75) * (r + 2.5)];
    harL.pile = [bx + Math.cos(ha - 1.95) * (r + 15), bz + Math.sin(ha - 1.95) * (r + 15)];
    harL.boss[0] = bx + Math.cos(ha + 0.75) * (r + 7); harL.boss[1] = bz + Math.sin(ha + 0.75) * (r + 7);
    harL.enter[0] = bx + Math.cos(ha + 0.9) * (r + 24); harL.enter[1] = bz + Math.sin(ha + 0.9) * (r + 24);
    return harL;
  }

  // a new hand fades in a few steps from his post, on the side the crew comes from, and walks in (spread in time)
  function nearSlot(w, enter) {
    if (!w.fresh) return;
    w.fresh = false;
    const ex = enter[0] - w.x, ez = enter[1] - w.z, d = Math.hypot(ex, ez) || 1, k = Math.min(1, (5 + rnd() * 4) / d);
    w.a.x = w.x + ex * k + (rnd() - 0.5) * 2; w.a.z = w.z + ez * k + (rnd() - 0.5) * 2; w.a.y = ground(w.a.x, w.a.z);
    w.t = -rnd() * 5;                                         // (carriers start their rounds at different times)
  }
  // a mason on the scaffold: he appears on his board (no walking up the poles) and follows the rising lifts
  function assignUp(w, sp, L) {
    const a = w.a, altar = L.kind === 'altar';
    w.role = 'mason'; w.slot = -1; w.st = 'work'; w.t = 0; w.cheer = 0; w.up = sp; w.fresh = false;
    if (w.rope) { w.rope.alive = false; a.rope = null; w.rope = null; }
    dropProps(w);
    if (a.variant === 'worker') a.col.set(w.tunic);
    setTool(w, altar ? 'mallet' : 'hammer');
    if (!altar && L.kind !== 'bronze') w.chisel = actors.prop('chisel', sp.x, 0, sp.z, 0, { s: ACTOR_S, fadeIn: true });
    const moved = Math.hypot(a.x - sp.x, a.z - sp.z) > 0.5;
    a.x = w.x = sp.x; a.z = w.z = sp.z; w.fx = sp.fx; w.fz = sp.fz; a.path = null;
    a.fixedY = scaffY(sp); a.y = a.fixedY;
    if (moved) a.vis = 0;
    a.visT = 1;
    a.yaw = Math.atan2(sp.fx - sp.x, sp.fz - sp.z); w.faceTo[0] = sp.fx; w.faceTo[1] = sp.fz; a.face = w.faceTo;
  }
  /* ── a person takes a role at a slot ── */
  function assign(w, role, slot, L, s) {
    const a = w.a;
    const altar = L.kind === 'altar', kohen = L.kind === 'kohen';
    w.role = role; w.slot = slot; w.st = 'goto'; w.t = 0; w.cheer = 0; w.fit = false;   // (── people6 ── fitted again at the first blow)
    if (w.up) { w.up = null; a.vis = 0; a.visT = 1; w.fresh = true; }        // (down from the scaffold: he reappears below)
    a.fixedY = undefined; a.look = null;
    if (a.variant === 'worker' && role !== 'boss') a.col.set(w.tunic);
    if (w.rope) { w.rope.alive = false; a.rope = null; w.rope = null; }
    dropProps(w);
    let x = w.x, z = w.z, fx = x, fz = z + 1;
    if (role === 'mason' || role === 'digger') {
      const S = L.stand[slot % L.stand.length], ring = Math.floor(slot / L.stand.length);
      x = S[0] + ring * 2.2; z = S[1] + ring * 1.4; fx = S[2] + ring * 2.2; fz = S[3] + ring * 1.4;
      w.yard = null; w.rHit = undefined; w.bHit = undefined;
      if (role === 'mason') {
        const bronze = L.kind === 'bronze';
        setTool(w, altar ? 'mallet' : 'hammer');
        // ── people6 ── (PEOPLE) the first ground masons work at SITE's dressing yard, on SITE's own stones
        const yd = !altar && !bronze && s.id !== 'har' ? yardSpot(w, s.id, slot) : null;
        if (yd) { x = yd.x; z = yd.z; fx = yd.fx; fz = yd.fz; }
        // the stone he dresses: a block before him (a whole field stone at the altar)
        const d = Math.hypot(fx - x, fz - z) || 1, ux = (fx - x) / d, uz = (fz - z) / d;
        if (yd) { /* (SITE's stone on SITE's banker) */ } else if (s.id !== 'har') {
          const bx = x + (ux * 1.5 + uz * 0.35) * ACTOR_S, bz = z + (uz * 1.5 - ux * 0.35) * ACTOR_S;
          w.block = actors.prop(altar ? 'fieldstone' : 'stone', bx, ground(bx, bz) + (altar ? 0.62 : 0.6), bz, Math.atan2(ux, uz) + Math.PI / 2, { s: altar ? 2.2 : 2.4, fadeIn: true });
        }
        if (!altar && !bronze && s.id !== 'har' && !(yd && !yd.chisel)) w.chisel = actors.prop('chisel', x, 0, z, 0, { s: ACTOR_S, fadeIn: true });
      } else setTool(w, 'pick');
    } else if (role === 'carrier') {
      setTool(w, null);
      const P = L.pile, D = L.drop, off = (slot % 5 - 2) * 2.1 + (rnd() - 0.5) * 0.8;
      if (s.id === 'har') { w.from[0] = L.drop[0] + off; w.from[1] = L.drop[1] - off; w.to[0] = L.pile[0] + off; w.to[1] = L.pile[1]; }
      else if (s.phase === 0) { w.from[0] = D[0] + off; w.from[1] = D[1] + off * 0.5; w.to[0] = P[0] + off; w.to[1] = P[1] + off * 0.5; }
      else { w.from[0] = P[0] + off; w.from[1] = P[1] + off * 0.5; w.to[0] = D[0] + off; w.to[1] = D[1] + off * 0.5; }
      // the load: earth (foundations, the hill), dressed stone, whole stones at the altar, lime when finishing
      w.carry = s.id === 'har' || s.phase === 0 ? 'basket' : altar ? (s.phase === 2 ? 'basket' : 'fieldstone') : s.phase === 2 ? 'basket' : 'stone';
      x = w.from[0]; z = w.from[1]; fx = w.to[0]; fz = w.to[1];
    } else if (role === 'sawA' || role === 'sawB') {
      const [bx, bz, yaw] = L.saw, c = Math.cos(yaw), sn = Math.sin(yaw);
      w.bench = L.saw; w.aside = false;   // ── site16 ──
      // bench-local: the beam along x; the cut at x = 0.9; the sawyers on either side (−z / +z), facing each other
      const lz = role === 'sawA' ? -1.62 : 1.62;
      x = bx + 0.9 * c + lz * sn; z = bz - 0.9 * sn + lz * c;
      fx = bx + 0.9 * c; fz = bz - 0.9 * sn;
      setTool(w, role === 'sawA' ? 'saw' : null);
    } else if (role === 'rope') {
      const R = L.rope[slot % L.rope.length];
      x = R[0]; z = R[1];
      if (w.ambient) { x += 1.9; z += 1.5; }   // ── site16 ── (beside the crew's tag-line men, not on them)
      setTool(w, null);
      w.rope = w.rope || { alive: true, neck: new THREE.Vector3() };
      w.rope.alive = true;
    } else if (role === 'boss') {
      x = L.boss[0]; z = L.boss[1];
      if (w.ambient) { x += 2.6; z += 2.1; }   // ── site16 ──
      if (a.variant === 'worker') a.col.set(BOSS_TUNIC);
      setTool(w, 'staff');
      fx = x + 1; fz = z;
    }
    // ── people6 ── (PEOPLE) nobody stands in the builder's work: 4 amot clear round his feet and his stone (SITE's dress spot)
    if (!w.yard && stages && typeof stages.workSpot === 'function') {
      let sp = null; try { sp = stages.workSpot(s.id, 'dress'); } catch (e) { /* */ }
      if (sp && typeof sp.x === 'number') for (const c of [[sp.x, sp.z], sp.stone ? [sp.stone.x, sp.stone.z] : null]) {
        if (!c) continue;
        const dx = x - c[0], dz = z - c[1], d = Math.hypot(dx, dz);
        if (d < 4) { const k = (4 - d) / (d || 1); x += (d ? dx : 1) * k; z += dz * k; fx += (d ? dx : 1) * k; fz += dz * k; }
      }
    }
    w.x = x; w.z = z; w.fx = fx; w.fz = fz;
    walkTo(w, x, z, 2.7);
    if (kohen && a.variant !== 'kohen') { /* (a site changes kind only with its crews) */ }
  }

  /* ───────── the quarry ───────── */
  const quarry = { n: 0, crews: [], block: null, dirty: false };
  function setQuarry(n, ids) {
    const want = clamp(Math.floor(+n || 0), 0, 4), list = idList(want, ids), key = list.join(',');
    if (want === quarry.n && key === quarry.ids) return true;
    quarry.n = want; quarry.ids = key; quarry.idList = list; quarry.dirty = true;
    return true;
  }
  const QCREW = [['pick', 'split', 'qcarry'], ['split', 'lever', 'qcarry'], ['pick', 'split', 'qcarry'], ['pick', 'qcarry', 'split']];
  function syncQuarry() {
    quarry.dirty = false;
    rosterSync(quarry.crews, quarry.idList || idList(quarry.n), (cid) => {
      const crew = [];
      for (let j = 0; j < 3; j++) { const w = person('worker', QUARRY.enter[0] + (rnd() - 0.5) * 6, QUARRY.enter[1] + (rnd() - 0.5) * 6, { col2: CREW_COL[cid % 4] }); w.site = 'quarry'; w.crew = cid; w.fresh = true; crew.push(w); }
      return crew;
    }, (crew) => { for (const w of crew) dismiss(w, QUARRY.enter[0] + (rnd() - 0.5) * 8, QUARRY.enter[1] + (rnd() - 0.5) * 8); });
    const cnt = { pick: 0, split: 0, lever: 0, qcarry: 0 };
    for (let k = 0; k < quarry.crews.length; k++) quarry.crews[k].forEach((w, j) => { qAssign(w, QCREW[k % 4][j], cnt[QCREW[k % 4][j]]++); nearSlot(w, QUARRY.enter); });
    // the block being split, set on the ground once anyone works here
    if (quarry.n && !quarry.block) { const [x, z] = QUARRY.split; quarry.block = actors.prop('stone', x, ground(x, z) + 0.6, z, 0.2, { s: 2.2 }); }
    else if (!quarry.n && quarry.block) { actors.unprop(quarry.block); quarry.block = null; }
  }
  function qAssign(w, role, slot) {
    w.role = role; w.slot = slot; w.st = 'goto'; w.t = 0; dropProps(w);
    let x, z, fx, fz;
    if (role === 'pick') { const P = QUARRY.pick[slot % QUARRY.pick.length]; [x, z, fx, fz] = P; setTool(w, 'pick'); w.role = 'digger'; }
    else if (role === 'split') {
      const [bx, bz] = QUARRY.split, s = slot % 2 ? 1 : -1, ring = Math.floor(slot / 2);
      x = bx + s * (1.85 + ring * 0.4); z = bz + ring * 1.6 * s; fx = bx; fz = bz;
      setTool(w, 'hammer'); w.role = 'mason';
    } else if (role === 'lever') { const P = QUARRY.lever[0]; [x, z, fx, fz] = P; x += slot * 2; setTool(w, 'pick'); w.role = 'lever'; }
    else {
      const off = slot * 1.4;
      w.from[0] = QUARRY.split[0] - 1 + off; w.from[1] = QUARRY.split[1] + 2.4; w.to[0] = QUARRY.pile[0] + off; w.to[1] = QUARRY.pile[1] - 2;
      x = w.from[0]; z = w.from[1]; fx = w.to[0]; fz = w.to[1]; w.carry = 'stone'; setTool(w, null); w.role = 'carrier';
    }
    w.x = x; w.z = z; w.fx = fx; w.fz = fz;
    walkTo(w, x, z, 2.7);
  }

  /* ───────── the training yard ───────── */
  const yard = { n: 0, list: [], master: null, dirty: false };
  function trainees(n) {
    const want = clamp(Math.floor(+n || 0), 0, YARD.seats.length);
    if (want === yard.n) return true;
    yard.n = want; yard.dirty = true;
    return true;
  }
  function syncYard() {
    yard.dirty = false;
    if (yard.n && !yard.master) {
      const w = person('kohen', YARD.enter[0], YARD.enter[1], {});
      w.site = 'yard'; w.role = 'master'; w.st = 'goto'; setTool(w, 'staff'); w.fresh = true;
      w.x = YARD.master[0]; w.z = YARD.master[1]; w.fx = YARD.master[2]; w.fz = YARD.master[3];
      walkTo(w, w.x, w.z, 2.2); nearSlot(w, YARD.enter);
      yard.master = w;
    } else if (!yard.n && yard.master) { dismiss(yard.master, YARD.enter[0], YARD.enter[1]); yard.master = null; }
    while (yard.list.length > yard.n) dismiss(yard.list.pop(), YARD.enter[0], YARD.enter[1]);
    while (yard.list.length < yard.n) {
      const i = yard.list.length, [sx, sz] = YARD.seats[i];
      const w = person('kohen', YARD.enter[0] + (rnd() - 0.5) * 4, YARD.enter[1] + (rnd() - 0.5) * 4, {});
      w.site = 'yard'; w.role = 'mason'; w.st = 'goto'; w.per = 1.25 + rnd() * 0.4; w.fresh = true;
      w.a.s = w.s0 = ACTOR_S * 0.94; w.a.young = true;      // young kohanim (no beard yet)
      setTool(w, 'hammer');
      w.x = sx; w.z = sz; w.fx = sx + (YARD.master[0] - sx) * 0.1; w.fz = sz - 2;
      const bx = sx - 0.35, bz = sz - 1.55;
      w.block = actors.prop('stone', bx, ground(bx, bz) + 0.4, bz, 0.1 * i, { s: 1.1, fadeIn: true });
      w.chisel = actors.prop('chisel', sx, 0, sz, 0, { s: ACTOR_S * 0.94, fadeIn: true });
      walkTo(w, sx, sz, 2.4); nearSlot(w, YARD.enter);
      yard.list.push(w);
    }
  }

  /* ───────── caravans ───────── */
  const trains = {};      // routeId → train
  function trainFor(rid) {
    if (trains[rid]) return trains[rid];
    const t = { rid, cargo: ROUTE_CARGO[rid] || 'stone', status: 'none', leg: null, s: 0, len: 0, speed: 4, pts: [], cum: [], t: 0, vis: 0, visT: 0,
      carts: [], site: null, yardX: 40, waitArrive: 0, depart: 0, cheer: 0, unload: 0 };
    for (let i = 0; i < CARTS; i++) {
      const c = { x: 0, z: 0, yaw: 0, wheel: 0, ax: 0, az: 0, oxL: null, oxR: null, drv: null, anchorL: { x: 0, z: 0, speed: 3 }, anchorR: { x: 0, z: 0, speed: 3 }, cargo: [], s: 0, vis: 0 };
      t.carts.push(c);
    }
    trains[rid] = t;
    return t;
  }
  // a polyline route: pts [[x, z]…] with cumulative lengths; posAt(t, s) → (px, pz, dirX, dirZ) in scratch
  const RP = { x: 0, z: 0, dx: 1, dz: 0 };
  function setRoute(t, pts) {
    t.pts.length = 0; t.cum.length = 0;
    let L = 0;
    for (let i = 0; i < pts.length; i++) { if (i) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); t.pts.push(pts[i]); t.cum.push(L); }
    t.len = L;
  }
  function posAt(t, s) {
    const P = t.pts, C = t.cum, n = P.length;
    if (!n) { RP.x = RP.z = 0; return RP; }
    if (s <= 0) { RP.x = P[0][0]; RP.z = P[0][1]; const d = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]) || 1; RP.dx = (P[1][0] - P[0][0]) / d; RP.dz = (P[1][1] - P[0][1]) / d; RP.x += RP.dx * s; RP.z += RP.dz * s; return RP; }
    let i = 1; while (i < n - 1 && C[i] < s) i++;
    const a = P[i - 1], b = P[i], seg = C[i] - C[i - 1] || 1, u = Math.min(1.5, (s - C[i - 1]) / seg);
    RP.dx = (b[0] - a[0]) / seg; RP.dz = (b[1] - a[1]) / seg;
    RP.x = a[0] + (b[0] - a[0]) * u; RP.z = a[1] + (b[1] - a[1]) * u;
    return RP;
  }
  // each route parks in its own bay along the inner lane (a train is ~40 amot long)
  const BAY = { wagons: 0, cedar: -46, alexandria: 46, beitkerem: -92 };
  const yardXFor = (site, rid) => clamp(SITE_X[site] !== undefined ? SITE_X[site] : 40, -118, 14) + (BAY[rid] || 0);
  // the inbound road: over the causeway, in at the west gate, north round the courts, east along the inner lane
  function inboundRoute(t) {
    const X = t.yardX;
    setRoute(t, [[CAUSEWAY.x0 - 10, CAUSEWAY.z + 4], [CAUSEWAY.x1, CAUSEWAY.z + 4], [GATE_IN[0], GATE_IN[1]], [LANE_X, GATE_IN[1]], [LANE_X, LANE_IN], [X, LANE_IN]]);
  }
  // the outbound road: a turn at the yard, west along the outer lane, out at the gate, over the causeway
  function outboundRoute(t) {
    const X = t.yardX;
    setRoute(t, [[X, LANE_IN], [X + 10, LANE_IN - 4], [X + 8, LANE_OUT], [X - 6, LANE_OUT], [LANE_X - 12, LANE_OUT], [LANE_X - 12, GATE_IN[1]], [GATE_IN[0], GATE_IN[1]], [CAUSEWAY.x1, CAUSEWAY.z - 4], [CAUSEWAY.x0 - 10, CAUSEWAY.z - 4]]);
  }
  function ensureTrainPeople(t) {
    for (const c of t.carts) {
      if (!c.oxL) {
        c.oxL = animals.add('bull', 0, 0, { yaw: 0, calm: true, hidden: true, scale: 0.86 });
        c.oxR = animals.add('bull', 0, 0, { yaw: 0, calm: true, hidden: true, scale: 0.88 });
        for (const o of [c.oxL, c.oxR]) { o.followDist = 0.05; o.tint = new THREE.Color(0.92, 0.9, 0.86); }
      }
      if (!c.drv) {
        const w = person('worker', 0, 0, { col2: '#6A4E2E', fadeIn: false });
        w.a.vis = w.a.visT = 0; w.site = 'car'; w.role = 'driver'; w.st = 'drive'; setTool(w, 'staff');
        c.drv = w;
      }
    }
  }
  function setTrainCargo(t, on) {
    for (const c of t.carts) {
      if (on && !c.cargo.length) {
        const key = t.cargo === 'keystone', n = t.cargo === 'door' || key ? 1 : t.cargo === 'log' ? 3 : 2;   // ── site9 ── (the key stone: one great block)
        for (let i = 0; i < n; i++) { const p = actors.prop(key ? 'stone' : t.cargo, 0, 0, 0, 0, { s: t.cargo === 'log' ? 2.4 : t.cargo === 'door' ? 1 : key ? 2.6 : 1.9, fadeIn: false }); if (p) c.cargo.push(p); }
      } else if (!on && c.cargo.length) { for (const p of c.cargo) actors.unprop(p); c.cargo.length = 0; }
    }
  }
  // state from the game: 'out' (with the time left), 'back' (waiting to be collected), 'collected', 'none'
  function caravan(rid, state) {
    const st = typeof state === 'string' ? { status: state } : state || { status: 'none' };
    const t = trainFor(rid);
    const status = st.status || 'none';
    if (st.site) t.site = st.site;
    if (status === 'out' || status === 'back') { resetDrivers(t); t.fading = false; }
    if (status === 'out') {
      const total = Math.max(1, (+st.total || +st.left || 60000) / 1000), left = clamp((+st.left || 0) / 1000, 0, total);
      const elapsed = total - left;
      // the legs: departure (drive out), the road beyond the city (unseen), the arrival (in over the causeway)
      // a short trip (the demo mode runs every timer ×60) only rolls out of its bay and back in, fading
      const short = total < 90;
      const dep = short ? Math.min(7, total * 0.3) : Math.min(75, total * 0.3), arr = short ? Math.min(8, total * 0.4) : Math.min(95, total * 0.45);
      t.short = short;
      if (t.status === 'out' && Math.abs(t.arriveAt - (T + left)) < 3) return true;     // nothing new
      t.status = 'out'; t.total = total; t.arriveAt = T + left; t.depDur = dep; t.arrDur = arr;
      t.yardX = yardXFor(t.site, rid);
      ensureTrainPeople(t);
      if (elapsed < dep - 1) { startDepart(t, true); setTrainCargo(t, false); t.legT0 = T - elapsed; t.legDur = dep; placeTrain(t, lerp(t.s0, t.s1, easeIO(clamp(elapsed / dep, 0, 1))), true); t.visT = 1; }
      else if (left > arr) { t.leg = 'away'; t.visT = 0; hideTrain(t); }
      else { t.leg = 'arrive'; inboundRoute(t); setTrainCargo(t, true); t.legT0 = t.arriveAt - arr; t.legDur = arr; const u = clamp((arr - left) / arr, 0, 1), s0 = shortFrom(t); placeTrain(t, s0 + (t.len - s0) * (1 - Math.pow(1 - u, 2.2)), true); t.visT = 1; }
      return true;
    }
    if (status === 'back') {
      if (t.status === 'back') return true;
      const wasArriving = t.status === 'out' && t.leg === 'arrive';
      t.status = 'back'; t.site = st.site || t.site; t.yardX = yardXFor(t.site, rid);
      ensureTrainPeople(t); inboundRoute(t); setTrainCargo(t, true);
      t.leg = 'parked'; t.visT = 1;
      placeTrain(t, t.len, !wasArriving);
      t.cheer = wasArriving ? 3.2 : 0;
      if (wasArriving) arrivalFX(t);
      return true;
    }
    if (status === 'collected') {
      if (t.status !== 'back' && t.status !== 'out') { t.status = 'none'; return true; }
      t.status = 'leaving'; t.leg = 'unload'; t.unload = 0; t.visT = 1;
      ensureTrainPeople(t);
      return true;
    }
    // none
    if (t.status !== 'none') { t.status = 'none'; t.leg = null; t.visT = 0; hideTrain(t); setTrainCargo(t, false); }
    return true;
  }
  // (a new plan for a train that was unloading: its drivers go back to their oxen, with their goads)
  function resetDrivers(t) { for (const c of t.carts) if (c.drv && c.drv.busy) { c.drv.busy = false; setTool(c.drv, 'staff'); c.drv.a.bowT = 0; } }
  function hideTrain(t) {
    resetDrivers(t);
    for (const c of t.carts) {
      if (c.oxL) { c.oxL.visT = 0; c.oxR.visT = 0; c.oxL.follow = c.oxR.follow = null; }
      if (c.drv) { c.drv.a.visT = 0; c.drv.a.path = null; }
      for (const p of c.cargo) p.visT = 0;
    }
  }
  // lay one cart (and its oxen, driver, load) at distance cs along the route; instant: teleport what follows
  const YOKE = 5.4, OX_BACK = 1.25, OX_SIDE = 1.2, DRV_SIDE = 2.6;
  function layCart(t, c, cs, instant, dt, speed, moved) {
    posAt(t, cs); c.ax = RP.x; c.az = RP.z;
    posAt(t, cs + YOKE); const yx = RP.x, yz = RP.z, ydx = RP.dx, ydz = RP.dz;
    c.yaw = Math.atan2(yx - c.ax, yz - c.az); c.x = c.ax; c.z = c.az;
    c.wheel += moved / 1.18;
    const px = ydz, pz = -ydx, oyaw = Math.atan2(ydx, ydz);
    // hidden beyond the causeway's end (and anywhere else across the western wall's line: the gate lets the road through)
    const hid = inWall(c.x, c.z) || offRoad(c.x) || cs < -2 || t.fading;
    c.vis = instant ? (hid ? 0 : 1) : c.vis + ((hid ? 0 : 1) - c.vis) * Math.min(1, dt * 5);
    const ox = yx - ydx * OX_BACK, oz = yz - ydz * OX_BACK;
    c.anchorL.x = ox + px * OX_SIDE; c.anchorL.z = oz + pz * OX_SIDE;
    c.anchorR.x = ox - px * OX_SIDE; c.anchorR.z = oz - pz * OX_SIDE;
    const sp = Math.max(0.2, speed) * 1.1;
    c.anchorL.speed = c.anchorR.speed = sp;
    if (c.oxL) {
      const oh = inWall(ox, oz) || offRoad(ox) || cs + YOKE < -2 || t.fading;
      c.oxL.visT = c.oxR.visT = oh ? 0 : 1;
      c.oxL.speed = c.oxR.speed = moved > 1e-4 ? sp : 1.4;
      c.oxL.follow = c.anchorL; c.oxR.follow = c.anchorR;
      if (instant || (oh && c.oxL.vis < 0.02)) { snapOx(c.oxL, c.anchorL, oyaw); snapOx(c.oxR, c.anchorR, oyaw); }
    }
    if (c.drv && !c.drv.busy) {
      const a = c.drv.a, dx = yx + px * DRV_SIDE - ydx * 1.4, dz = yz + pz * DRV_SIDE - ydz * 1.4;
      { const ex = a.x - camP.x, ez = a.z - camP.z; a.s = c.drv.s0 * farScale(ex * ex + ez * ez); }
      const dh = inWall(dx, dz) || offRoad(dx) || cs < -2 || t.fading;
      a.visT = dh ? 0 : 1;
      if (instant || (dh && a.vis < 0.02)) { a.x = dx; a.z = dz; a.yaw = oyaw; a.y = ground(dx, dz); a.path = null; if (instant) a.vis = a.visT; }
      else if (Math.abs(dx - a.x) + Math.abs(dz - a.z) > 0.2) walkTo(c.drv, dx, dz, Math.max(1.2, sp * 1.15));
      c.drv.x = dx; c.drv.z = dz;
      if (c.drv.cheer > 0) {
        c.drv.cheer -= dt;
        const k = Math.min(1, c.drv.cheer * 2);
        a.armT[2] = a.arm[2] = lerp(0.62, 2.7, k); a.armT[3] = a.arm[3] = lerp(-0.05, 0.3, k);
        if (c.drv.cheer <= 0) { a.armT[2] = 0.62; a.armT[3] = -0.05; }
      } else {
        // ── people7 ── each driver urges his oxen with the goad now and then, on his own beat (no two carts in sync)
        const u = Math.sin(T * 1.1 + c.drv.off * 3);
        a.armT[2] = 0.62 + (u > 0.55 ? (u - 0.55) * 2.4 : 0); a.armT[3] = -0.05 + 0.08 * Math.sin(T * 0.7 + c.drv.off);
      }
    }
    // the load rides on the bed
    const cy = ground(c.x, c.z), cc = Math.cos(c.yaw), sn = Math.sin(c.yaw);
    for (let k = 0; k < c.cargo.length; k++) {
      const p = c.cargo[k];
      let lx = 0, ly = 1.82, lz = -0.2, yaw = c.yaw;
      if (t.cargo === 'stone') { lz = k ? -1.15 : 0.75; ly = 2.2; yaw = c.yaw + Math.PI / 2; }
      else if (t.cargo === 'fieldstone') { lx = k ? 0.45 : -0.45; lz = k ? -0.9 : 0.5; ly = 2.28; }
      else if (t.cargo === 'keystone') { lz = -0.25; ly = 2.3; yaw = c.yaw + Math.PI / 2; }   // ── site9 ──
      else if (t.cargo === 'log') { lx = k === 1 ? 0 : k ? 0.46 : -0.46; ly = 2.14 + (k === 1 ? 0.72 : 0); yaw = c.yaw + Math.PI / 2; }
      p.x = c.x + lx * cc + lz * sn; p.y = cy + ly; p.z = c.z - lx * sn + lz * cc; p.yaw = yaw;
      if (t.leg !== 'unload') p.visT = c.vis > 0.5 ? 1 : 0;
      if (instant) p.vis = p.visT;
      else if (c.vis < 0.3 && p.vis > c.vis) p.vis = c.vis;
    }
    // the wheels throw a little dust on the move
    if (speed > 0.5 && c.vis > 0.5 && near(c.x, c.z, 320) && Math.random() < dt * 2.5) dust.puff(c.x, cy + 0.3, c.z, 2.2, 1);
  }
  /* ── site8 ── the Mount's rubble cart (SITE8B, wave 8B; DESIGN8B P0-4 / M1): while the Mount is surveyed and dug, one ox cart
     shuttles between the builder's rock and a dump at the Mount's east edge, where its retaining wall will rise — loaded with
     the rubble on the way out, empty on the way back; it waits to load by the rock and to tip at the dump. Uses the trains'
     cart, oxen, driver and load (layCart); drawn by writeCarts. */
  const shut = { rid: 'har-cart', cargo: 'fieldstone', status: 'shuttle', leg: 'load', s: 0, len: 0, speed: 3, pts: [], cum: [], t: 0, vis: 0, visT: 0,
    carts: [{ x: 0, z: 0, yaw: 0, wheel: 0, ax: 0, az: 0, oxL: null, oxR: null, drv: null, anchorL: { x: 0, z: 0, speed: 3 }, anchorR: { x: 0, z: 0, speed: 3 }, cargo: [], s: 0, vis: 0 }],
    site: 'har', yardX: 0, fading: true, on: false, wait: 0, A: [0, 0], B: [0, 0], placed: false };
  function harDigging() {
    try { const st = stages && stages.status ? stages.status('har') : null; return !!st && st.status === 'building' && st.shown < 0.15 && (stages.boulders || []).some((v) => v > 0); } catch (e) { return false; }
  }
  // the loading place: beside the rock the builder works (the side toward the dump), and the dump on the east edge
  function shuttleEnds() {
    let bi = -1, bd = 1e9; const bs = stages && stages.boulders;
    for (let i = 0; i < BOULDER_XZR.length; i++) { if (bs && !(bs[i] > 0)) continue; const d = Math.hypot(BOULDER_XZR[i][0] - heroX, BOULDER_XZR[i][1] - heroZ); if (d < bd) { bd = d; bi = i; } }
    const [bx, bz, r] = bi >= 0 ? BOULDER_XZR[bi] : [heroX, heroZ, 6];
    const Bx = 262, Bz = clamp(bz * 0.6 + 20, -240, 260), ux = Bx - bx, uz = Bz - bz, L = Math.hypot(ux, uz) || 1;
    shut.A[0] = bx + (ux / L) * (r + 12) + (uz / L) * 6; shut.A[1] = bz + (uz / L) * (r + 12) - (ux / L) * 6;
    shut.B[0] = Bx; shut.B[1] = Bz;
  }
  function shuttleLeg(from, to) {
    const mx = (from[0] + to[0]) / 2 + (to[1] - from[1]) * 0.12, mz = (from[1] + to[1]) / 2 - (to[0] - from[0]) * 0.12;
    setRoute(shut, [[from[0], from[1]], [mx, mz], [to[0], to[1]]]); shut.s = 0;
  }
  let digOn = false;   // (harDigging() read twice a second in update's check, not every frame: no per-frame allocation)
  function shuttleUpdate(dt) {
    const want = enabled && digOn, c = shut.carts[0];
    if (!want) {
      if (!shut.on) return;
      shut.fading = true; layCart(shut, c, shut.s, false, dt, 0, 0);
      if (c.vis < 0.02) { shut.on = false; if (c.oxL) c.oxL.visT = c.oxR.visT = 0; if (c.drv) c.drv.a.visT = 0; setTrainCargo(shut, false); }
      return;
    }
    ensureTrainPeople(shut);
    if (!shut.on) { shut.on = true; shut.fading = false; shuttleEnds(); shuttleLeg(shut.B, shut.A); shut.s = Math.max(0, shut.len - YOKE); shut.leg = 'load'; shut.wait = 2.5; layCart(shut, c, shut.s, true, dt, 0, 0); }
    shut.fading = false;
    let speed = 0, moved = 0;
    if (shut.leg === 'load' || shut.leg === 'tip') {
      shut.wait -= dt;
      if (shut.wait <= 0) {
        if (shut.leg === 'load') { setTrainCargo(shut, true); shuttleEnds(); shuttleLeg(shut.A, shut.B); shut.leg = 'out'; }
        else { setTrainCargo(shut, false); dust.puff(c.x, ground(c.x, c.z) + 0.6, c.z, 4, 5); shuttleEnds(); shuttleLeg(shut.B, shut.A); shut.leg = 'back'; }
      }
    } else {
      // (the cart runs to YOKE short of the leg's end: its oxen stand at the end)
      speed = shut.leg === 'out' ? 2.6 : 3.4; moved = Math.max(0, Math.min(speed * dt, shut.len - YOKE - shut.s)); shut.s += moved;
      if (shut.s >= shut.len - YOKE - 0.01) { shut.leg = shut.leg === 'out' ? 'tip' : 'load'; shut.wait = shut.leg === 'tip' ? 2.2 : 5; }
    }
    layCart(shut, c, shut.s, false, dt, speed, moved);
  }
  /* ── site9 ── the key stone's cart (SITE9, wave 9; DESIGN8B M11 "after the game the ox cart brings the corner block down the
     quarry road; the crane sets it"): one ox cart with the hewn block rolls in along the road to the site's stock pile, stops
     beside it, the block is unloaded (the stages add it to the pile for the crane), and the cart drives on and fades out.
     keyCart(from, to, beyond?, cargo?) → Promise<true> as the load is unloaded (≈ 1.4 s after the cart stops); cargo 'stone' = a
     segment's stones for the stock (two blocks on the bed). Drawn by writeCarts. */
  const kc = { rid: 'key-cart', cargo: 'keystone', status: 'key', leg: 'idle', s: 0, len: 0, speed: 3, pts: [], cum: [], t: 0, vis: 0, visT: 0,
    carts: [{ x: 0, z: 0, yaw: 0, wheel: 0, ax: 0, az: 0, oxL: null, oxR: null, drv: null, anchorL: { x: 0, z: 0, speed: 3 }, anchorR: { x: 0, z: 0, speed: 3 }, cargo: [], s: 0, vis: 0 }],
    site: 'har', yardX: 0, fading: true, on: false, wait: 0, stopS: 0, done: null };
  function keyCart(from, to, beyond, cargo) {
    if (kc.done) { const d = kc.done; kc.done = null; d(true); }
    if (!Array.isArray(from) || !Array.isArray(to)) return Promise.resolve(false);
    const c = kc.carts[0];
    setTrainCargo(kc, false); kc.cargo = cargo === 'stone' ? 'stone' : 'keystone';   // (a segment's stones: two blocks on the bed)
    ensureTrainPeople(kc); resetDrivers(kc);
    const dx = to[0] - from[0], dz = to[1] - from[1], L = Math.hypot(dx, dz) || 1;
    const end = Array.isArray(beyond) ? beyond : [to[0] + (dx / L) * 30, to[1] + (dz / L) * 30];
    setRoute(kc, [[from[0], from[1]], [to[0], to[1]], [end[0], end[1]]]);
    kc.stopS = L; kc.s = 0; kc.leg = 'in'; kc.on = true; kc.fading = false; kc.wait = 0;
    setTrainCargo(kc, false); setTrainCargo(kc, true);
    layCart(kc, c, 0, true, 0, 0, 0); fadeInTrain(kc);
    return new Promise((res) => { kc.done = res; });
  }
  function keyCartUpdate(dt) {
    if (!kc.on) return;
    const c = kc.carts[0];
    let speed = 0, moved = 0;
    if (kc.leg === 'in') {
      const left = kc.stopS - kc.s;
      speed = left < 7 ? Math.max(0.7, left * 0.5) : 3.4; moved = Math.max(0, Math.min(speed * dt, left)); kc.s += moved;
      if (kc.s >= kc.stopS - 0.02) { kc.leg = 'unload'; kc.wait = 1.4; }
    } else if (kc.leg === 'unload') {
      kc.wait -= dt;
      if (kc.wait <= 0) {
        setTrainCargo(kc, false); dust.puff(c.x, ground(c.x, c.z) + 0.8, c.z, 5, 6);
        kc.leg = 'rest'; kc.wait = 2.5;
        if (kc.done) { const d = kc.done; kc.done = null; d(true); }
      }
    } else if (kc.leg === 'rest') {
      kc.wait -= dt; if (kc.wait <= 0) kc.leg = 'out';
    } else {
      speed = 3; moved = Math.max(0, Math.min(speed * dt, kc.len - YOKE - kc.s)); kc.s += moved;
      if (kc.s > kc.stopS + 9 || moved <= 0) kc.fading = true;
      if (kc.fading && c.vis < 0.02) { kc.on = false; kc.leg = 'idle'; if (c.oxL) c.oxL.visT = c.oxR.visT = 0; if (c.drv) c.drv.a.visT = 0; setTrainCargo(kc, false); return; }
    }
    layCart(kc, c, kc.s, false, dt, speed, moved);
  }
  function fadeInTrain(t) {
    for (const c of t.carts) { c.vis = 0; if (c.oxL) { c.oxL.vis = c.oxR.vis = 0; } if (c.drv) c.drv.a.vis = 0; for (const p of c.cargo) p.vis = 0; }
  }
  function snapOx(o, A, yaw) { o.x = A.x; o.z = A.z; o.yaw = yaw; o.y = ground(o.x, o.z); if (o.visT === 0) o.vis = 0; }
  function placeTrain(t, s, instant) {
    t.s = s;
    for (let i = 0; i < t.carts.length; i++) layCart(t, t.carts[i], s - i * CART_GAP, instant, 0, 0, 0);
  }
  // the gate (the western wall has no modelled opening): the train is hidden while it passes through the wall
  // (the western wall has its gate at the causeway since wave 4 — mount.js, the Coponius gate, z −66…−52: the trains drive
  //  through it; anything else crossing the wall's line is still hidden)
  const inWall = (x, z) => x > -306 && x < -286.5 && !(z > -65.5 && z < -52.5);
  const offRoad = (x) => x < CAUSEWAY.x0 + 6;
  function arrivalFX(t) {
    const c = t.carts[0];
    if (c) { dust.burst(c.x, ground(c.x, c.z) + 0.6, c.z, 14, 3.2); }
    for (const cc of t.carts) if (cc.drv) cc.drv.cheer = 2.6;
    // the site's foreman turns to the train and points with his rod
    const s = t.site && sites[t.site];
    const boss = s && s.crews.length && s.crews[0][0] && s.crews[0][0].role === 'boss' ? s.crews[0][0] : null;
    if (boss && c) { boss.faceTo[0] = c.x; boss.faceTo[1] = c.z; boss.a.face = boss.faceTo; boss.point = 1.4; boss.t = 3.5; }
  }
  const TAIL = (CARTS - 1) * CART_GAP;
  const CARRY_OF = { stone: 'stone', log: 'log', fieldstone: 'fieldstone', door: null };
  // one driver's unloading: to the bed, take a load, carry it toward the site (south of the lane), set it down, again
  function unloadStep(t, c, dt) {
    const d = c.drv; if (!d) return false;
    const a = d.a;
    const bx = c.x + Math.sin(c.yaw + Math.PI / 2) * 2.2, bz = c.z + Math.cos(c.yaw + Math.PI / 2) * 2.2;
    if (!d.busy) { d.busy = true; d.uk = c.cargo.length; setTool(d, null); d.ust = 'go'; d.ut = 0; walkTo(d, bx, bz, 2.4); }
    d.ut += dt;
    switch (d.ust) {
      case 'go': if (arrived(d)) { d.ust = 'take'; d.ut = 0; a.bowT = 0.7; d.faceTo[0] = c.x; d.faceTo[1] = c.z; a.face = d.faceTo; } break;
      case 'take':
        if (d.ut > 0.6) {
          a.bowT = 0;
          d.uk--;
          const p = c.cargo[d.uk]; if (p) { p.visT = 0; p.vis = Math.min(p.vis, 0.3); }
          const item = CARRY_OF[t.cargo];
          if (!item) { dust.puff(c.x, ground(c.x, c.z) + 2, c.z, 2.5, 2); if (d.uk > 0) { d.ust = 'take'; d.ut = -0.4; a.bowT = 0.7; } else { d.ust = 'home'; d.ut = 0; setTool(d, 'staff'); walkTo(d, bx, bz, 2.4); } break; }
          setTool(d, item);
          walkTo(d, c.x + (d.uk % 2 ? 1.5 : -1.5), LANE_IN + 7 + (d.uk % 2), 2.3);
          d.ust = 'carry'; d.ut = 0;
        }
        break;
      case 'carry': if (arrived(d)) { d.ust = 'put'; d.ut = 0; a.bowT = 0.7; } break;
      case 'put':
        if (d.ut > 0.6) {
          a.bowT = 0; setTool(d, null);
          if (near(a.x, a.z, 250)) dust.puff(a.x + Math.sin(a.yaw) * 1.2, a.y + 0.3, a.z + Math.cos(a.yaw) * 1.2, 1.8, 2);
          d.ust = d.uk > 0 ? 'go' : 'home'; d.ut = 0;
          if (d.ust === 'home') setTool(d, 'staff');
          walkTo(d, bx, bz, 2.8);
        }
        break;
      case 'home': if (arrived(d)) d.ust = 'done'; break;
      default: return false;
    }
    return d.ust !== 'done';
  }
  function startDepart(t, fresh) {
    outboundRoute(t);
    t.leg = 'depart'; t.s0 = fresh ? TAIL + 2 : 0; t.s1 = t.short ? t.s0 + 26 : t.len + TAIL + 6;
  }
  // a short roll-in: the train appears on the lane 30 amot before its bay (fading in) and rolls up to it
  const shortFrom = (t) => (t.short ? Math.max(0, t.len - 30) : 0);
  function trainUpdate(t, dt) {
    if (t.status === 'none') return;
    if (t.status === 'site') { siteTrainStep(t, dt); return; }   // ── site13 ──
    let s = t.s, speed = 0;
    if (t.status === 'out') {
      if (t.leg === 'depart') {
        const u = clamp((T - t.legT0) / t.legDur, 0, 1);
        s = lerp(t.s0, t.s1, easeIO(u)); speed = (t.s1 - t.s0) / t.legDur * 1.4;
        t.fading = t.short && u > 0.72;
        if (u >= 1) { t.leg = 'away'; t.fading = false; hideTrain(t); }
      } else if (t.leg === 'away') {
        if (T >= t.arriveAt - t.arrDur) { t.leg = 'arrive'; inboundRoute(t); setTrainCargo(t, true); t.legT0 = t.arriveAt - t.arrDur; t.legDur = t.arrDur; placeTrain(t, shortFrom(t), true); if (t.short) fadeInTrain(t); }
        else return;
      }
      if (t.leg === 'arrive') {
        const u = clamp((T - t.legT0) / t.legDur, 0, 1), s0 = shortFrom(t);
        s = s0 + (t.len - s0) * (1 - Math.pow(1 - u, 2.2)); speed = (t.len - s0) / t.legDur * 1.6 * Math.pow(1 - u, 1.2);
        if (u >= 1) { s = t.len; t.leg = 'parked'; t.cheer = 3.2; arrivalFX(t); }
      }
    } else if (t.status === 'back') {
      s = t.len;
    } else if (t.status === 'leaving') {
      if (t.leg === 'unload') {
        t.unload += dt;
        // each driver takes the loads off his cart, one at a time, and sets them down by the lane toward the site
        let busy = false;
        for (let i = 0; i < t.carts.length; i++) if (unloadStep(t, t.carts[i], dt)) busy = true;
        if (!busy || t.unload > 40) {
          t.short = false;
          for (const c of t.carts) if (c.drv) { c.drv.busy = false; setTool(c.drv, 'staff'); c.drv.a.bowT = 0; }
          setTrainCargo(t, false); startDepart(t, false); t.legT0 = T; t.legDur = clamp((t.s1 - t.s0) / 5.2, 30, 75); s = t.s0;
        }
      } else {
        const u = clamp((T - t.legT0) / t.legDur, 0, 1);
        s = lerp(t.s0, t.s1, easeIO(u)); speed = (t.s1 - t.s0) / t.legDur * 1.4;
        if (u >= 1) { t.status = 'none'; t.leg = null; hideTrain(t); return; }
      }
    }
    if (t.leg === 'away') return;
    // (the oxen and drivers follow at the train's real pace: eased legs run up to three times their average)
    const moved = Math.abs(s - t.s), pace = dt > 0 ? moved / dt : speed;
    t.s = s;
    for (let i = 0; i < t.carts.length; i++) layCart(t, t.carts[i], s - i * CART_GAP, false, dt, pace, moved);
    if (t.cheer > 0) t.cheer -= dt;
  }

  // ── site13 ── (the owner, 30.9 11:12: "צריך לדעתי עוד מכונות … שייראה מלא פעילות"; PRODUCER-S13a #7: "a cart in 2 of 52
  // frames") while a walled site or the altar is being built, a train of three ox carts brings its stones from the quarry
  // (at the altar: whole field stones, מדות ג, ד): in along a lane beside the site (stages.cartLane()), a stop where the loads
  // come off by the crews' pile, on and out empty at the far end, and in again loaded — always on the move, always in view.
  // Illustration (Ant. 15.11.2: "a thousand waggons" for the stones).
  const siteTr = { id: null, s: -30, wait: 0, chk: 0, lane: null, unloaded: false };
  function siteTrainSync(dt) {
    siteTr.chk -= dt;
    if (siteTr.chk > 0) return;
    siteTr.chk = 0.5;
    let lane = null;
    try { lane = stages && typeof stages.cartLane === 'function' ? stages.cartLane() : null; } catch (e) { lane = null; }
    const t = trainFor('site');
    if (!lane) {
      if (t.status !== 'none') { t.status = 'none'; t.leg = null; hideTrain(t); setTrainCargo(t, false); }
      siteTr.id = null; return;
    }
    if (siteTr.id !== lane.id || t.status !== 'site') {
      siteTr.id = lane.id; siteTr.lane = lane; siteTr.s = -28; siteTr.wait = 0; siteTr.unloaded = false;
      setTrainCargo(t, false); t.cargo = lane.cargo || 'stone';
      setRoute(t, [lane.a, lane.b]); t.status = 'site'; t.leg = 'site'; t.fading = false; t.site = lane.id;
      ensureTrainPeople(t); resetDrivers(t); setTrainCargo(t, true); placeTrain(t, siteTr.s, true);
    }
  }
  function siteTrainStep(t, dt) {
    const L = siteTr.lane; if (!L) return;
    const stop = t.len * (L.stop || 0.55), end = t.len + CART_GAP * CARTS + 6;
    let s = siteTr.s, speed = 0;
    if (siteTr.wait > 0) {
      siteTr.wait -= dt;
      if (!siteTr.unloaded && siteTr.wait < 5) { siteTr.unloaded = true; setTrainCargo(t, false); for (const c of t.carts) if (c.vis > 0.5) dust.puff(c.x, ground(c.x, c.z) + 0.6, c.z, 3, 2); }
    } else {
      // ── site14 ── (her oxen from אוצר המלאכה: stages.setOwned({ oxen }) — the train comes and goes faster)
      const ox = stages && stages.jobs && stages.jobs.owned ? +stages.jobs.owned.oxen || 0 : 0;
      const sp = 4.6 * (1 + 0.25 * ox) * (s < stop ? clamp((stop - s) / 10 + 0.25, 0.25, 1) : 1);
      s += sp * dt; speed = sp;
      if (!siteTr.unloaded && s >= stop) { s = stop; siteTr.wait = 8 / (1 + 0.25 * ox); }
      if (s > end) { s = -28; siteTr.unloaded = false; setTrainCargo(t, true); placeTrain(t, s, true); }
    }
    t.fading = s - CART_GAP * (CARTS - 1) > t.len - 4;
    const moved = Math.abs(s - t.s); t.s = s; siteTr.s = s;
    for (let i = 0; i < t.carts.length; i++) layCart(t, t.carts[i], s - i * CART_GAP, false, dt, speed, moved);
  }
  // a site at work shows a little rising dust even from far away (the close-up puffs are spawned at each blow)
  function workDust() {
    for (const id in sites) {
      const s = sites[id]; if (!s.n || !s.crews.length) continue;
      const crew = s.crews[Math.floor(rnd() * s.crews.length)], w = crew[Math.floor(rnd() * crew.length)];
      if (!w || w.st !== 'work' || (w.role !== 'mason' && w.role !== 'digger')) continue;
      const a = w.a, dx = a.x - camP.x, dz = a.z - camP.z, d2 = dx * dx + dz * dz;
      if (d2 < 140 * 140 || d2 > 800 * 800 || rnd() < 0.35) continue;
      dust.puff(a.x + Math.sin(a.yaw) * 1.6, a.y + 0.8, a.z + Math.cos(a.yaw) * 1.6, 3.5 + Math.sqrt(d2) / 110, 1);
    }
    if (quarry.n && rnd() < 0.6) { const [x, z] = QUARRY.split, d2 = (x - camP.x) ** 2 + (z - camP.z) ** 2; if (d2 > 140 * 140 && d2 < 800 * 800) dust.puff(x, ground(x, z) + 1.2, z, 4 + Math.sqrt(d2) / 110, 1); }
  }

  /* ───────── cheering (a stage is complete) ───────── */
  function cheer(id) {
    const s = sites[id];
    if (!s) return false;
    s.cheer = 3.4;
    for (const crew of s.crews) for (const w of crew) w.cheer = 3.2 + rnd() * 0.4;
    return true;
  }

  /* ───────── per frame ───────── */
  const near = (x, z, d) => { const dx = x - camP.x, dz = z - camP.z; return dx * dx + dz * dz < d * d; };
  const farScale = (d2) => (d2 < 220 * 220 ? 1 : 1 + Math.min(0.35, (Math.sqrt(d2) - 220) / 950));
  let chk = 0;
  function update(dt) {
    if (!(dt > 0)) dt = 0;
    if (dt > 0.25) dt = 0.25;
    T += dt;
    const phaseOk = !life || life.phase === undefined || life.phase === 'build';
    const on = enabled && phaseOk;
    if (!on) {
      if (shown) { shown = false; actors.setEnabled(false); animals.setEnabled(false); cartMesh.count = wheelMesh.count = 0; cartMesh.visible = wheelMesh.visible = false; dust.points.visible = false; }
      actors.update(dt); animals.update(dt);
      return;
    }
    if (!shown) { shown = true; actors.setEnabled(true); animals.setEnabled(true); dust.points.visible = true; }
    if (camera) { camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); fr.setFromProjectionMatrix(pm); camP.copy(camera.position); }
    // every half second: the hero's place, the phases, the crane
    chk -= dt;
    if (chk <= 0) {
      chk = 0.5;
      try { if (stages && stages.hero) { heroAt = stages.hero.at || null; const p = stages.hero.position; if (p) { heroX = p.x; heroZ = p.z; } } } catch (e) { /* */ }
      const cs = craneSite();
      digOn = harDigging();   // ── site8 ──
      workDust();
      try { lifeSync(); } catch (e) { warn(e); }   // ── site16 ── the life layer follows the active stage and the finished ones
      for (const id in sites) {
        const s = sites[id];
        if (!s.n && !s.crews.length) continue;
        if (!s.dirty && s.n) {
          if (sitePhase(id) !== s.phase || (cs === id) !== s.crane) s.dirty = true;
          else if (id === 'har') { const b = s.bould; harLayout(s); if (s.bould !== b) s.dirty = true; }
          else { const f = s.front; frontLayout(s, id); if (s.front !== f) s.dirty = true; }   // ── site11 ── (the stock moved on)
        }
      }
    }
    for (const id in sites) { const s = sites[id]; if (s.dirty) { try { syncSite(s); } catch (e) { warn(e); s.dirty = false; } } }
    if (quarry.dirty) { try { syncQuarry(); } catch (e) { warn(e); quarry.dirty = false; } }
    if (yard.dirty) { try { syncYard(); } catch (e) { warn(e); yard.dirty = false; } }
    // the tag lines' target: the crane's block when it hangs at the site
    let cx = 0, cy = -1e9, cz = 0, cSite = null;
    { const c = craneRead(); if (c && c.site) { cSite = c.site; cx = c.x; cy = c.y; cz = c.z; } }
    // ── site16 ── the craft in the world: the crews' beam hides under the craft's own log; sawA steps aside, sawB follows the blade
    { const C = LIFE.craft; let ok = false; try { if (stages && typeof stages.craftState === 'function') { stages.craftState(C); ok = true; } } catch (e) { /* */ } if (!ok) C.kind = null;
      for (const id in sites) { const s = sites[id]; if (s.bench) { const hide = C.kind === 'saw' && C.site === id; if ((s.bench.visT === 0) !== hide) s.bench.visT = hide ? 0 : 1; } }
      if (LIFE.bench) { const hide = C.kind === 'saw' && C.site === LIFE.benchSite; if ((LIFE.bench.visT === 0) !== hide) LIFE.bench.visT = hide ? 0 : 1; } }
    for (let i = people.length - 1; i >= 0; i--) {
      const w = people[i];
      if (w.gone) continue;
      if (site20Yield(w, dt, LIFE.craft)) continue;   // ── site20 ── (the crowd before the piece) ── /site20 ──
      try { personUpdate(w, dt, cSite, cx, cy, cz); } catch (e) { warn(e); }
    }
    try { siteTrainSync(dt); } catch (e) { warn(e); }   // ── site13 ── the building site's own cart train
    for (const rid in trains) trainUpdate(trains[rid], dt);
    try { shuttleUpdate(dt); } catch (e) { warn(e); }   // ── site8 ── the Mount's rubble cart
    try { keyCartUpdate(dt); } catch (e) { warn(e); }   // ── site9 ── the key stone's cart
    if (ownBlobs) blobs.begin();
    actors.update(dt);
    animals.update(dt);
    if (ownBlobs) blobs.end();
    writeCarts();
    dust.update(dt, camera, pxScale);
  }

  // ── site20 ── the crowd before the piece (the general work craft, fable20): the crews' and the life layer's people within 5 amot of the
  // piece he works step two paces off (to 5.4 amot) and face it — they are watching him; when the work is done they walk back to their
  // place and their own business goes on. stages.craftState gives C.wOn / C.wx / C.wz. → true while the person is held
  const Y_R = 5, Y_OUT = 5.4;
  function site20Yield(w, dt, C) {
    const a = w.a; let Y = w.y20;
    if (Y && w.leaving) { w.y20 = null; return false; }
    if (!Y) {
      if (!C.wOn || w.leaving || w.up || w.role === 'driver' || w.role === 'off' || a.vis < 0.3) return false;
      const dx = a.x - C.wx, dz = a.z - C.wz, d = Math.hypot(dx, dz);
      if (d >= Y_R) return false;
      const ux = d > 0.2 ? dx / d : 1, uz = d > 0.2 ? dz / d : 0;
      w.y20 = Y = { hx: a.x, hz: a.z, k: 1, t: 0 };
      walkTo(w, C.wx + ux * Y_OUT, C.wz + uz * Y_OUT, 3.4);
      return true;
    }
    Y.t += dt;
    if (Y.k === 1) { if (arrived(w) || Y.t > 3) { Y.k = 2; Y.t = 0; } else return true; }
    if (Y.k === 2) {
      if (C.wOn) { w.faceTo[0] = C.wx; w.faceTo[1] = C.wz; a.face = w.faceTo; return true; }
      Y.k = 3; Y.t = 0; walkTo(w, Y.hx, Y.hz, 2.8); return true;
    }
    if (Y.k === 3) {
      if (!arrived(w) && Y.t < 6) return true;
      w.y20 = null; w.faceTo[0] = w.fx; w.faceTo[1] = w.fz; a.face = w.faceTo; return false;
    }
    return false;
  }
  // ── /site20 ──
  const R_HIT = 1.05, R_TOP = 2.95;
  function personUpdate(w, dt, cSite, cx, cy, cz) {
    const a = w.a;
    // leaving: walk off, then fade and go
    if (w.leaving) {
      if (w.cheer > 0) { w.cheer -= dt; doCheer(w, dt); return; }
      if (!w.wasUp) a.fixedY = undefined;
      w.t += dt;
      // (removed on our next frame, not inside the actors' own loop)
      if (arrived(w) || w.t > 9) { if (a.visT !== 0) { a.visT = 0; a.onHide = () => { w.dead = true; }; } }
      if (w.dead) destroy(w);
      return;
    }
    if (w.role === 'driver' || w.role === 'idle' || w.role === '' || w.role === 'off') return;
    // LOD: the tools only near the camera (every item instance draws all the items' vertices); far away, people grow a
    // little so a phone still reads them (up to 1.35× beyond ~550 amot)
    const dx = a.x - camP.x, dz = a.z - camP.z, d2 = dx * dx + dz * dz;
    a.s = w.s0 * farScale(d2);
    const lod = d2 < 300 * 300;
    if (lod !== w.lod) { w.lod = lod; a.item = lod ? w.tool : null; }
    if (w.chisel) w.chisel.visT = w.chisel.vis = lod && w.st === 'work' ? 1 : 0;
    // walking to the slot
    if (w.st === 'goto' || w.st === 'new') {
      if (arrived(w)) { w.st = 'work'; if (w.t > 0) w.t = 0; a.face = w.faceTo; w.faceTo[0] = w.fx; w.faceTo[1] = w.fz; }
      else return;
    }
    if (w.cheer > 0) {
      w.cheer -= dt; doCheer(w, dt);
      // back to work: the hold of his tool (the roles that pose every frame set their own arms)
      if (w.cheer <= 0) { a.fixedY = w.up ? scaffY(w.up) : undefined; a.bowT = 0; a.tiltT = 0; const it = w.tool; w.tool = undefined; setTool(w, it); }
      return;
    }
    const role = w.role;
    if (w.up) a.fixedY = scaffY(w.up);
    // ── people6 ── (PEOPLE) a waiting site: its crew rests — some sit, some talk, one drinks — each in his own way
    const site = sites[w.site];
    if (site && site.waiting && role !== 'boss' && role !== 'master') return rest(w, dt);
    if (w.resting) { w.resting = false; a.knT = 0; a.bowT = 0; a.look = null; const it = w.tool; w.tool = undefined; setTool(w, it); }
    if (role === 'mason' || role === 'digger' || role === 'lever') return swing(w, dt, role);
    if (role === 'carrier') return carrier(w, dt);
    // ── site16 ── the life layer's roles
    if (role === 'plaster') return plaster(w, dt);
    if (role === 'sweep') return sweep(w, dt);
    if (role === 'survey') return survey(w, dt);
    if (role === 'guard') return;
    if (role === 'sawA' || role === 'sawB') {
      const C = LIFE.craft, craftOn = C.kind === 'saw' && C.site === w.site && w.bench;
      if (role === 'sawA') {
        // (the kohen takes the sawyer's place: he steps to the beam's end and watches; back when the craft ends)
        if (craftOn && !w.aside) { w.aside = true; const [bx, bz, yaw] = w.bench, c = Math.cos(yaw), sn = Math.sin(yaw); walkTo(w, bx + 3.2 * c - 1.1 * sn, bz - 3.2 * sn - 1.1 * c, 2.4); w.faceTo[0] = bx + 0.9 * c; w.faceTo[1] = bz - 0.9 * sn; a.face = w.faceTo; a.item = null; }
        else if (!craftOn && w.aside) { w.aside = false; w.st = 'goto'; walkTo(w, w.x, w.z, 2.7); a.item = w.lod ? w.tool : null; }
        if (w.aside) { a.armT[0] = 0.25; a.armT[2] = 0.3; a.armT[1] = a.armT[3] = 0.05; a.bowT = 0.04; a.arm[0] += (a.armT[0] - a.arm[0]) * Math.min(1, dt * 4); a.arm[2] += (a.armT[2] - a.arm[2]) * Math.min(1, dt * 4); a.bow += (a.bowT - a.bow) * Math.min(1, dt * 4); return; }
      } else if (craftOn && C.near) {
        // his partner's arms follow the real blade (0 at him … 1 at the kohen)
        const k = (0.5 - C.blade) * 2, r = 0.6 + 0.2 * k;
        a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.3; a.arm[3] = a.armT[3] = -0.3;
        a.bow = a.bowT = 0.16 + 0.05 * k;
        return;
      }
      // ── /site16 ──
      const ph = (T + w.off * 0.1) * 5.4 + (role === 'sawB' ? Math.PI : 0), k = Math.sin(ph);
      const r = 0.6 + 0.2 * k;
      a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.3; a.arm[3] = a.armT[3] = -0.3;
      a.bow = a.bowT = 0.16 + 0.05 * k;
      return;
    }
    if (role === 'rope') {
      const here = cSite === w.site && cy > -1e8;
      if (w.rope) {
        if (here) w.rope.neck.set(cx, cy, cz);
        else { const C = CRANE[w.site]; if (C) w.rope.neck.set(C[0] + 2, ground(C[0], C[1]) + C[2] * 0.55, C[1] + 2); }
        a.rope = w.rope; w.rope.alive = true;
        w.faceTo[0] = w.rope.neck.x; w.faceTo[1] = w.rope.neck.z; a.face = w.faceTo;
      }
      const k = Math.sin(T * 1.7 + w.off);
      a.arm[0] = a.armT[0] = 1.25 + 0.06 * k; a.arm[2] = a.armT[2] = 1.35 + 0.06 * k; a.arm[1] = a.armT[1] = -0.12; a.arm[3] = a.armT[3] = -0.08;
      a.bow = a.bowT = -0.2 + 0.07 * k;
      return;
    }
    if (role === 'boss' || role === 'master') return boss(w, dt);
  }
  function rest(w, dt) {
    const a = w.a;
    if (!w.resting) { w.resting = true; w.restK = Math.floor((w.off * 7.3) % 3); if (w.chisel) w.chisel.visT = 0; a.item = null; }
    const k = w.restK, u = T * 0.7 + w.off;
    if (k === 0 && !w.up) { a.knT = 0.92; a.bowT = 0.08; a.armT[0] = 0.55; a.armT[2] = 0.55; a.armT[1] = a.armT[3] = 0.12; }
    else if (k === 1 || w.up) { a.knT = 0; a.bowT = 0.03; a.armT[0] = 0.1; a.armT[1] = 0.05; a.armT[2] = 0.35 + Math.max(0, Math.sin(u * 1.3)) * 0.6; a.armT[3] = -0.15; }
    else { a.knT = 0; const d = Math.max(0, Math.sin(u * 0.8)); a.armT[2] = 0.4 + d * 1.6; a.armT[3] = -0.35 * d; a.armT[0] = 0.05; a.bowT = -0.12 * d; }
    a.arm[0] += (a.armT[0] - a.arm[0]) * Math.min(1, dt * 4); a.arm[1] += (a.armT[1] - a.arm[1]) * Math.min(1, dt * 4);
    a.arm[2] += (a.armT[2] - a.arm[2]) * Math.min(1, dt * 4); a.arm[3] += (a.armT[3] - a.arm[3]) * Math.min(1, dt * 4);
    a.tilt = a.tiltT = 0;
  }
  function doCheer(w, dt) {
    const a = w.a, u = T * 5 + w.off;
    a.arm[0] = a.armT[0] = 2.75 + 0.15 * Math.sin(u); a.arm[2] = a.armT[2] = 2.75 + 0.15 * Math.sin(u + 1.3);
    a.arm[1] = a.armT[1] = 0.35; a.arm[3] = a.armT[3] = 0.35;
    a.bow = a.bowT = -0.06; a.tilt = a.tiltT = -2.4;
    a.fixedY = (w.up ? scaffY(w.up) : ground(a.x, a.z)) + Math.abs(Math.sin(u * 0.9)) * 0.45;
    if (w.chisel) w.chisel.visT = w.chisel.vis = 0;
  }
  // the work swing: a mason's hammer on the chisel (or a mallet on a whole stone), a two-handed pick, a lever
  function swing(w, dt, role) {
    const a = w.a;
    const fine = sites[w.site] && sites[w.site].phase === 2 && role === 'mason' && w.site !== 'quarry' && w.site !== 'yard';
    const per = fine ? w.per * 0.62 : role === 'digger' ? w.per * 1.25 : w.per;
    const u = ((T + w.off) % per) / per;
    let r, bow;
    const top = fine ? 2.0 : role === 'digger' ? 2.9 : R_TOP, hit = role === 'digger' ? 0.62 : w.rHit || R_HIT;
    const bh = w.bHit !== undefined && role === 'mason' ? w.bHit : 0.34;   // (── people6 ── a yard mason's solved blow)
    if (role === 'lever') {
      // prying a block: both hands on the bar, leaning in rhythm
      const k = 0.5 - 0.5 * Math.cos(u * TAU);
      r = 1.2 - 0.35 * k; bow = 0.25 + 0.35 * k;
      a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.2; a.arm[3] = a.armT[3] = -0.2;
      a.bow = a.bowT = bow; a.tilt = a.tiltT = -r + 1.9;
      return;
    }
    if (u < 0.52) { const v = easeIO(u / 0.52); r = lerp(hit, top, v); bow = lerp(role === 'digger' ? 0.55 : bh, w.yard ? bh - 0.05 : 0.04, v); }
    else if (u < 0.66) { const v = (u - 0.52) / 0.14; r = lerp(top, hit, v * v); bow = lerp(w.yard ? bh - 0.05 : 0.04, role === 'digger' ? 0.58 : bh + 0.02 * (1 - v * v), v * v); }
    else { const v = (u - 0.66) / 0.34; r = hit + Math.sin(v * Math.PI) * 0.1; bow = role === 'digger' ? 0.55 : bh; }
    const hitNow = w.lastU < 0.66 && u >= 0.66;
    w.lastU = u;
    if (hitNow) { r = hit; bow = role === 'digger' ? 0.55 : bh; }   // (── people6 ── the contact frame is the blow's exact pose)
    if (role === 'digger') {
      a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.12; a.arm[3] = a.armT[3] = -0.12;
      a.tilt = a.tiltT = -r + 0.35;
    } else {
      a.arm[2] = a.armT[2] = r; a.arm[3] = a.armT[3] = -0.1;
      // the left hand holds the chisel on the stone (none at the altar: no iron there; at SITE's banker: solved to its grip)
      a.arm[0] = a.armT[0] = w.yard ? w.yard.lp : w.chisel ? 0.98 : 0.55; a.arm[1] = a.armT[1] = w.yard ? w.yard.ls : w.chisel ? -0.34 : 0.05;
      a.tilt = a.tiltT = -r + 0.2;
    }
    a.bow = a.bowT = bow;
    // ── people6 ── (PEOPLE) the contact: the tool's head meets the chisel's butt (or the whole stone, or the ground) on
    // the hit frame, the chisel's edge stands ON the stone, and the dust comes from there. The hit pose is the same at
    // every blow, so the stone and the chisel are fitted to it once (on the first blow at this place)
    if (hitNow) {
      toolPoint(w, a, role, V);
      if (!w.fit && !w.up && role === 'mason') {
        // (a yard mason is fitted on his life-size pose: far from the camera people grow, and the fit is kept for good)
        if (w.yard) { a.x = w.yard.x; a.z = w.yard.z; a.yaw = w.yard.yaw; a.y = ground(a.x, a.z); const s1 = a.s; a.s = w.s0; toolPoint(w, a, role, V); a.s = s1; w.hitX = V.x; w.hitY = V.y; w.hitZ = V.z; }
        fitWork(w, a, V);
      }
      if (w.lod && near(a.x, a.z, 160)) {
        if (w.chisel && w.fit) { dust.puff(w.tipX, w.tipY, w.tipZ, 1.1, 1); }
        else dust.puff(V.x, role === 'digger' ? ground(V.x, V.z) + 0.15 : V.y, V.z, role === 'digger' ? 2.2 : 1.1, role === 'digger' ? 2 : 1);
      }
    }
    if (w.chisel && w.chisel.vis > 0 && (!w.fit || w.up)) {
      actors.handWorld(a, 1, V);
      w.chisel.x = V.x; w.chisel.y = V.y; w.chisel.z = V.z; w.chisel.yaw = a.yaw; w.chisel.tilt = 0.35;
    }
  }
  // the point of the tool that strikes, in world space, for the pose of this frame (the items' frames: actors.js)
  const HEAD = { hammer: [0, -0.735, 0.06], mallet: [0, -0.81, 0.05], pick: [0, -1.1, 0.55] };
  function toolPoint(w, a, role, out) {
    const loc = HEAD[w.tool] || HEAD.hammer, tilt = a.tilt, c = Math.cos(tilt), sn = Math.sin(tilt);
    const ly = loc[1] * c - loc[2] * sn, lz = loc[1] * sn + loc[2] * c, S = a.s;
    if (w.tool === 'pick') { actors.handWorld(a, 1, V2); actors.handWorld(a, -1, out); out.add(V2).multiplyScalar(0.5); out.y += 0.12 * S; }
    else actors.handWorld(a, -1, out);
    const cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    out.x += lz * sy * S; out.y += ly * S; out.z += lz * cy * S;
    return out;
  }
  // put the chisel (its butt at the blow, its edge down on the stone) and the stone (its top under the edge) in place
  function fitWork(w, a, C) {
    w.fit = true;
    const cy = Math.cos(a.yaw), sy = Math.sin(a.yaw), S = ACTOR_S;
    let tx = C.x, ty = C.y, tz = C.z;
    if (w.chisel) {
      // the chisel prop (tilt 0.35): butt 0.08 above its grip, edge 0.54 below, both turned by the tilt
      const t = 0.35, bY = 0.08 * Math.cos(t) * S, bZ = 0.08 * Math.sin(t) * S, eY = -0.54 * Math.cos(t) * S, eZ = -0.54 * Math.sin(t) * S;
      const px = C.x - bZ * sy, py = C.y - bY, pz = C.z - bZ * cy;
      Object.assign(w.chisel, { x: px, y: py, z: pz, yaw: a.yaw, tilt: t });
      tx = px + eZ * sy; ty = py + eY; tz = pz + eZ * cy;
      w.tipX = tx; w.tipY = ty; w.tipZ = tz;
    }
    if (w.block) {
      const altar = w.block.item === 'fieldstone', half = altar ? 0.34 * 0.85 * 2.2 * 0.95 : 0.25 * 2.4;
      w.block.x = tx + sy * (altar ? 0.35 : 0.55); w.block.z = tz + cy * (altar ? 0.35 : 0.55); w.block.y = ty - half;
    }
  }

  // ── people6 ── (PEOPLE) SITE's dressing yard (stages.workSpot, guarded): its bankers and the stones on them. A mason there
  // stands on the side of his banker away from the stock pile, and his blow is solved for SITE's stone: the arm's angle
  // at the contact brings the chisel's edge down onto the stone's top, and his feet are placed so it lands on the near
  // margin. Without SITE's yard (or out of a mason's reach) he keeps the hand-placed stand and his own block.
  function yardOf(id) {
    if (!stages || typeof stages.workSpot !== 'function') return null;
    try {
      const info = typeof stages.siteInfo === 'function' ? stages.siteInfo(id) : null;
      if (!info || info.status !== 'building' || info.kind === 'cast' || info.kind === 'field') return null;
      if (info.phase && info.phase !== 'courses' && info.phase !== 'foundation') return null;
      const y = stages.workSpot(id, 'yard'), yb = Array.isArray(y) ? y : y && Array.isArray(y.bankers) ? y.bankers : null;
      if (yb) return yb.filter((b) => b && b.stone).map((b) => ({ st: b.stone, state: b.state || 'rough' }));
      // (SITE without the 'yard' kind yet: its bankers as drawn today, beyond the builder's banker along the same row —
      //  at 11.5 + 3.8·i amot from the stock pile, stones dressed / drafted / rough; bus/PEOPLE.md 20:50)
      const d = stages.workSpot(id, 'dress'), k = stages.workSpot(id, 'stock');
      if (!d || !d.stone || !k || !k.face) return null;
      const px = k.face[0], pz = k.face[1];
      let rx = d.stone.x - px, rz = d.stone.z - pz; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
      let fx = px - k.x, fz = pz - k.z; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
      const base = typeof info.base === 'number' ? info.base : null;
      return ['dressed', 'drafted', 'rough'].map((state, i) => {
        const bx = px + rx * (11.5 + i * 3.8) + fx * 0.5, bz = pz + rz * (11.5 + i * 3.8) + fz * 0.5, g = base !== null ? base : ground(bx, bz), rough = state === 'rough';
        return { state, st: { x: bx, y: g + (rough ? 1.66 : 1.62), z: bz, w: 2.1, h: rough ? 1.05 : 0.95, d: rough ? 1.3 : 1.25, yaw: Math.atan2(fx, fz) + Math.PI / 2 } };
      });
    } catch (e) { return null; }
  }
  // the point that meets the stone for a hit pose (arm angle rh, bow) of this man where he stands: the chisel's edge
  // (fitWork's chisel frame), or the hammer's face itself on a rough stone (no chisel: pitching off the waste)
  const YP = [0, 0, 0, 0, 0, 0, 0, 0];
  function edgeAt(w, a, rh, bow, out, chis) {
    YP[0] = a.arm[2]; YP[1] = a.arm[3]; YP[2] = a.bow; YP[3] = a.tilt; YP[4] = a.kn; YP[5] = a.sway; YP[6] = a.wk; YP[7] = a.s;
    a.arm[2] = rh; a.arm[3] = -0.1; a.bow = bow; a.tilt = -rh + 0.2; a.kn = 0; a.sway = 0; a.wk = 0; a.s = w.s0 || a.s;
    toolPoint(w, a, 'mason', out);
    a.arm[2] = YP[0]; a.arm[3] = YP[1]; a.bow = YP[2]; a.tilt = YP[3]; a.kn = YP[4]; a.sway = YP[5]; a.wk = YP[6]; a.s = YP[7];
    if (!chis) return out;
    const S = ACTOR_S, t = 0.35, cy = Math.cos(a.yaw), sy = Math.sin(a.yaw);
    const bY = 0.08 * Math.cos(t) * S, bZ = 0.08 * Math.sin(t) * S, eY = -0.54 * Math.cos(t) * S, eZ = -0.54 * Math.sin(t) * S;
    out.x += (eZ - bZ) * sy; out.y += eY - bY; out.z += (eZ - bZ) * cy;
    return out;
  }
  function leftHand(w, a, p, bow, out) {
    YP[0] = a.arm[0]; YP[1] = a.arm[1]; YP[2] = a.bow; YP[3] = a.kn; YP[4] = a.sway; YP[5] = a.wk; YP[7] = a.s;
    a.arm[0] = p; a.arm[1] = 0.1; a.bow = bow; a.kn = 0; a.sway = 0; a.wk = 0; a.s = w.s0 || a.s;
    actors.handWorld(a, 1, out);
    a.arm[0] = YP[0]; a.arm[1] = YP[1]; a.bow = YP[2]; a.kn = YP[3]; a.sway = YP[4]; a.wk = YP[5]; a.s = YP[7];
    return out;
  }
  // the k-th ground mason of a site at SITE's k-th banker: his feet, what he faces, and his blow
  function yardSpot(w, id, k) {
    const Y = yardOf(id), b = Y && Y[k];
    if (!b) return null;
    const a = w.a, st = b.st, sy0 = Math.sin(st.yaw), cy0 = Math.cos(st.yaw), chis = b.state !== 'rough';
    // the stone's depth axis (local z): he stands on the side away from the pile (for SITE's bankers the row's direction)
    let rx = sy0, rz = cy0;
    let kk = null; try { kk = stages.workSpot(id, 'stock'); } catch (e) { /* */ }
    if (kk && kk.face && (st.x - kk.face[0]) * rx + (st.z - kk.face[1]) * rz < 0) { rx = -rx; rz = -rz; }
    const along = ((w.off * 3.7) % 1 - 0.5) * 0.7;                       // not everyone on the middle of the margin
    const top = st.y + st.h / 2, aim = top + (chis ? 0 : 0.07);
    const tx = st.x + rx * (st.d / 2 - 0.28) + cy0 * along, tz = st.z + rz * (st.d / 2 - 0.28) - sy0 * along;
    const x0 = a.x, y0 = a.y, z0 = a.z, yaw0 = a.yaw;
    a.yaw = Math.atan2(-rx, -rz);
    let px = tx + rx * 1.6, pz = tz + rz * 1.6, rh = R_HIT, ok = false;
    const bow = chis ? 0.14 : 0.3;
    for (let it = 0; it < 3; it++) {
      a.x = px; a.z = pz; a.y = ground(px, pz);
      let lo = 0.4, hi = 2.1;
      for (let j = 0; j < 20; j++) { const m = (lo + hi) / 2; edgeAt(w, a, m, bow, V3, chis); if (V3.y < aim) lo = m; else hi = m; }
      rh = (lo + hi) / 2; edgeAt(w, a, rh, bow, V3, chis);
      px += tx - V3.x; pz += tz - V3.z;
      ok = Math.abs(V3.y - aim) < 0.05 && rh > 0.55 && rh < 1.95;
    }
    // his left hand steadies the work: down on the stone's top, on his left (the rig's arm cannot cross to the chisel)
    let lp = chis ? 0.98 : 0.55, ls = chis ? -0.34 : 0.05;
    if (ok) {
      a.x = px; a.z = pz; a.y = ground(px, pz);
      let lo = 0.2, hi = 1.55;
      for (let j = 0; j < 18; j++) { const m = (lo + hi) / 2; leftHand(w, a, m, bow, V3); if (V3.y < top + 0.1) lo = m; else hi = m; }
      const p = (lo + hi) / 2; leftHand(w, a, p, bow, V3);
      const over = (V3.x - st.x) * rx + (V3.z - st.z) * rz;              // (how far from the stone's centre, toward him)
      if (Math.abs(V3.y - top - 0.1) < 0.06 && over < st.d / 2 - 0.08) { lp = p; ls = 0.1; }
    }
    a.x = x0; a.y = y0; a.z = z0; a.yaw = yaw0;
    // (out of reach, or his feet would stand in the stone: the old stand)
    if (!ok || (px - st.x) * rx + (pz - st.z) * rz < st.d / 2 + 0.35) return null;
    w.yard = { x: px, z: pz, yaw: Math.atan2(-rx, -rz), tx, ty: top, tz, state: b.state, lp, ls };
    w.rHit = rh; w.bHit = bow;
    return { x: px, z: pz, fx: px - rx * 6, fz: pz - rz * 6, chisel: chis };
  }
  // a carrier: load at one end, walk, set it down at the other, walk back
  function carrier(w, dt) {
    const a = w.a;
    w.t += dt;
    switch (w.st) {
      case 'work': if (w.t >= 0) { w.st = 'load'; w.t = 0; a.bowT = 0.85; } break;
      case 'load':
        if (w.t > 0.8 + (w.off % 1) * 0.9) { setTool(w, w.carry); if (!w.lod) a.item = null; a.bowT = 0; w.st = 'carry'; walkTo(w, w.to[0], w.to[1], (w.carry === 'basket' ? 2.2 : 1.8) * (0.9 + (w.off % 0.2))); }
        break;
      case 'carry':
        if (arrived(w)) { w.st = 'unload'; w.t = 0; a.bowT = 0.75; }
        break;
      case 'unload':
        if (w.t > 0.7) {
          setTool(w, null); a.bowT = 0; w.st = 'back'; walkTo(w, w.from[0], w.from[1], 2.6);
          if (near(a.x, a.z, 200)) dust.puff(a.x + Math.sin(a.yaw) * 1.2, a.y + 0.3, a.z + Math.cos(a.yaw) * 1.2, 1.6, 2);
        }
        break;
      case 'back':
        if (arrived(w)) { w.st = 'load'; w.t = 0; a.bowT = 0.85; w.faceTo[0] = w.to[0]; w.faceTo[1] = w.to[1]; }
        break;
      default: w.st = 'load'; w.t = 0;
    }
  }
  // the foreman (or the master in the yard): watches one worker after another, points with his rod
  function boss(w, dt) {
    const a = w.a;
    w.t -= dt;
    if (w.t <= 0) {
      w.t = 3 + rnd() * 3.5;
      const list = w.site === 'yard' ? yard.list : sites[w.site] ? sites[w.site].crews.flat() : null;
      if (list && list.length) {
        const o = list[Math.floor(rnd() * list.length)];
        if (o && o !== w && !o.gone && o.role !== 'off') { w.faceTo[0] = o.a.x; w.faceTo[1] = o.a.z; a.face = w.faceTo; }
      } else if (w.site === 'yard') { w.faceTo[0] = w.fx; w.faceTo[1] = w.fz; a.face = w.faceTo; }
      w.point = rnd() < 0.55 ? 1.4 : 0;
    }
    if (w.point > 0) {
      w.point -= dt;
      const k = Math.min(1, w.point * 3, (1.4 - w.point) * 4);
      a.arm[2] = a.armT[2] = lerp(0.5, 1.45, k); a.arm[3] = a.armT[3] = lerp(-0.05, 0.12, k);
      a.tilt = a.tiltT = lerp(0, -1.1, k);
    } else { a.armT[2] = 0.5; a.armT[3] = -0.05; a.tiltT = 0; }
  }

  /* ── the carts' instances (culled here) ── */
  function writeCarts() {
    let n = 0, nw = 0;
    for (const rid of cartKeys()) {
      const t = rid === shut.rid ? shut : rid === kc.rid ? kc : trains[rid];
      if (t.status === 'none' || t.leg === 'away' || (t === shut && !shut.on) || (t === kc && !kc.on)) continue;
      for (const c of t.carts) {
        if (c.vis < 0.02 || n >= MAXC) continue;
        const cy = ground(c.x, c.z);
        sph.center.set(c.x, cy + 1.5, c.z); sph.radius = 5;
        if (camera && (!fr.intersectsSphere(sph) || !near(c.x, c.z, 700))) continue;
        const sc = c.vis < 1 ? Math.max(0.001, c.vis) : 1;
        E.set(0, c.yaw, 0); Q.setFromEuler(E); V.set(c.x, cy, c.z); S3.set(sc, sc, sc);
        M4.compose(V, Q, S3); M4.toArray(cartMesh.instanceMatrix.array, n * 16); n++;
        for (let sd = 0; sd < 2; sd++) {
          const side = sd ? -1 : 1;
          E.set(c.wheel, c.yaw, 0, 'YXZ'); Q.setFromEuler(E);
          V2.set(side * 1.32, 1.18, 0).applyAxisAngle(UPV, c.yaw); V.set(c.x + V2.x * sc, cy + V2.y * sc, c.z + V2.z * sc);
          M4.compose(V, Q, S3); M4.toArray(wheelMesh.instanceMatrix.array, nw * 16); nw++;
        }
      }
    }
    cartMesh.count = n; wheelMesh.count = nw; cartMesh.visible = n > 0; wheelMesh.visible = nw > 0;
    if (n) cartMesh.instanceMatrix.needsUpdate = true;
    if (nw) wheelMesh.instanceMatrix.needsUpdate = true;
  }
  const UPV = new THREE.Vector3(0, 1, 0);
  const ckeys = [];
  function cartKeys() { ckeys.length = 0; for (const rid in trains) ckeys.push(rid); ckeys.push(shut.rid); ckeys.push(kc.rid); return ckeys; }   // ── site8 ── (+ the Mount's cart) ── site9 ── (+ the key stone's)

  // ── site16 ── WORKERS EVERYWHERE — the life layer (WAVE16-BRIEF C; the owner, 4.10: "הוא ריק מפועלים"). Not an economy: ~28
  // figures at real work points round the active stage (bankers along the front, the stock's carriers, the crane's tag-line men,
  // carriers on the quarry's road with their loads, two sawyers at the bench, a surveyor pair with a cord, a foreman) and 3–4 at
  // each of the last LIFE_DONE finished stages (plasterers and a sweeper; at the Mount, guards at the Chuldah gates and sweepers
  // on the plaza), ~40 in all — "פועלי הורדוס" (fiction: המחשה on their card). The same actors instance, roles and animations as
  // the crews (no new rigs, no draw call of their own: the crews' instance holds 160); a neutral head cloth (LIFE_COL) — the
  // player's own crews keep their colours. They never set a stone or pay anything. Re-dealt when the active stage, the crane,
  // the front or the player's crews at the site change (they walk in from the site's `enter`).
  const LIFE_COL = '#8A7E6E', LIFE_DONE = 4, QROAD = [185, -191];
  const LIFE = { on: true, key: '', people: [], chk: 0, craft: { kind: null, site: null, blade: 0, cut: 0, near: false } };
  const lifeIds = () => { try { return Array.isArray(stages && stages.ids) ? stages.ids : Object.keys(SITES); } catch (e) { return Object.keys(SITES); } };
  const lifeStatus = (id) => { try { const s = stages && stages.status ? stages.status(id) : null; return s ? s.status : null; } catch (e) { return null; } };
  function lifePerson(variant, x, z, o) { const w = person(variant, x, z, o); w.ambient = true; w.crew = -1; LIFE.people.push(w); return w; }
  function lifeClear() { for (const w of LIFE.people) if (!w.gone) dismiss(w, w.a.x + (rnd() - 0.5) * 10, w.a.z + (rnd() - 0.5) * 10); LIFE.people.length = 0; if (LIFE.bench) { actors.unprop(LIFE.bench); LIFE.bench = null; } }
  // the roster for the active site (its layout as the crews see it) and for the finished ones
  function lifeSync() {
    const ids = lifeIds(), building = ids.filter((id) => lifeStatus(id) === 'building');
    let active = building.find((id) => id === heroAt) || building[0] || null;
    if (active && !SITES[active] && active !== 'har') active = null;
    const done = []; for (const id of ids) { if (id === active) break; if (lifeStatus(id) === 'done' && (SITES[id] || id === 'har') && !done.includes(SITES[id] === SITES.yesod && id !== 'yesod' ? 'yesod' : id)) done.push(SITES[id] === SITES.yesod && id !== 'yesod' ? 'yesod' : id); }
    const last = done.slice(-LIFE_DONE);
    const s = active ? siteState(active) : null, cs = active ? craneSite() === active : false;
    if (s) { try { if (active === 'har') harLayout(s); else frontLayout(s, active); } catch (e) { /* the layout as it is */ } }   // (s.front / s.bould as of now)
    const key = `${active}|${last.join(',')}|${s ? s.crews.length : 0}|${cs}|${s ? sitePhase(active) : 0}|${s ? s.front : 0}|${s ? s.bould : 0}|${enabled}|${LIFE.on}`;
    if (key === LIFE.key) return;
    LIFE.key = key;
    lifeClear();
    if (!enabled || !LIFE.on) return;
    try { if (active) lifeActive(active, s, cs); } catch (e) { warn(e); }
    for (const id of last) { try { lifeDone(id); } catch (e) { warn(e); } }
  }
  function lifeActive(id, s, craneHere) {
    const L0 = id === 'har' ? harLayout(s) : frontLayout(s, id); if (!L0) return;
    s.phase = sitePhase(id);
    // (the Mount's bay has no tag-line spots and no bench of its own: the crane's men by the stock, a bench 9 amot along the yard —
    //  where stages.js's saw craft puts its own)
    const L = Object.assign({}, L0);
    if (!(L.rope && L.rope.length) && L.pile) L.rope = [[L.pile[0] + 3.5, L.pile[1] + 3], [L.pile[0] - 3.5, L.pile[1] + 3], [L.pile[0], L.pile[1] + 5.5]];
    if (!L.saw) { try { const yd = stages.workSpot(id, 'yard'); if (yd && Array.isArray(yd.along)) L.saw = [yd.x + yd.along[0] * 9, yd.z + yd.along[1] * 9, Math.atan2(-yd.along[1], yd.along[0])]; } catch (e) { /* no yard */ } }
    const kohen = L.kind === 'kohen', phase = s.phase;
    const mk = (role, slot) => {
      const x = L.enter[0] + (rnd() - 0.5) * 8, z = L.enter[1] + (rnd() - 0.5) * 8;
      const w = lifePerson(kohen ? 'kohen' : 'worker', x, z, { col2: LIFE_COL });
      w.site = id; w.st = 'new'; w.fresh = true;
      assign(w, role, slot, L, s); nearSlot(w, L.enter);
      return w;
    };
    // the bankers along the front (beyond the crews' slots: their own rings), the stock's carriers, the crane's crew, a foreman
    const masonR = id === 'har' ? 'digger' : (phase === 0 && L.kind !== 'altar') ? 'digger' : 'mason';
    for (let k = 0; k < 10; k++) mk(masonR, 6 + k);
    for (let k = 0; k < 6; k++) mk('carrier', 5 + k);
    for (let k = 0; k < 2; k++) { const w = mk('carrier', 11 + k); w.carry = 'jar'; }   // (water for the men)
    if (craneHere && L.rope && L.rope.length) for (let k = 0; k < 3; k++) mk('rope', 3 + k);
    mk('boss', 1);
    // the carriers on the quarry's road: from the quarry's pile 40 amot toward the site, with their loads (never through a wall)
    for (let k = 0; k < 4; k++) {
      const w = mk('carrier', 10 + k), dx = L.pile[0] - QROAD[0], dz = L.pile[1] - QROAD[1], d = Math.hypot(dx, dz) || 1, off = (k - 1.5) * 2.2;
      w.from[0] = QROAD[0] + off * dz / d; w.from[1] = QROAD[1] - off * dx / d; w.to[0] = QROAD[0] + dx / d * 40 + off * dz / d; w.to[1] = QROAD[1] + dz / d * 40 - off * dx / d;
      w.carry = 'stone'; w.a.x = w.x = w.from[0] + dx / d * (8 + k * 8); w.a.z = w.z = w.from[1] + dz / d * (8 + k * 8); w.a.y = ground(w.a.x, w.a.z); walkTo(w, w.from[0], w.from[1], 2.6); w.t = -k * 0.7;
    }
    // two sawyers at the bench (when no crew of the player's saws there), the beam under them
    if (L.saw && s.crews.length < 2) { mk('sawA', 0); mk('sawB', 0); if (!s.bench) { const [bx, bz, yaw] = L.saw; LIFE.bench = actors.prop('beam', bx, ground(bx, bz), bz, yaw, { s: 1 }); LIFE.benchSite = id; } }
    // a surveyor pair with a cord along the next course
    try {
      const sl = stages && typeof stages.nextSlot === 'function' ? stages.nextSlot(id) : null;
      if (sl && Array.isArray(sl.n) && Array.isArray(sl.face)) {
        const nx = sl.n[0], nz = sl.n[1], tx = -nz, tz = nx, out = id === 'har' ? 3.2 : 2.6;
        const A = mk('survey', 0), B = mk('survey', 1);
        A.x = sl.face[0] + nx * out + tx * 5; A.z = sl.face[2] + nz * out + tz * 5; B.x = sl.face[0] + nx * out - tx * 5; B.z = sl.face[2] + nz * out - tz * 5;
        A.fx = B.x; A.fz = B.z; B.fx = A.x; B.fz = A.z; A.mate = B; B.mate = A;
        walkTo(A, A.x, A.z, 2.7); walkTo(B, B.x, B.z, 2.7);
        A.rope = { alive: true, neck: new THREE.Vector3() }; setTool(A, null); setTool(B, null);
      }
    } catch (e) { /* no course yet */ }
  }
  // a finished stage: two plasterers at its face, a sweeper on his round; the Mount: guards at the Chuldah gates, sweepers on the plaza
  function lifeDone(id) {
    const mk = (variant, role, x, z, fx, fz, o = {}) => {
      const w = lifePerson(variant, x + (rnd() - 0.5) * 4, z + (rnd() - 0.5) * 4, { col2: LIFE_COL, ...o });
      w.site = id; w.role = role; w.st = 'goto'; w.x = x; w.z = z; w.fx = fx; w.fz = fz; w.t = 0; w.fresh = false; w.a.fixedY = undefined;
      walkTo(w, x, z, 2.4);
      return w;
    };
    if (id === 'har') {
      // (the double gate's guards (Middot 1:1: the Levites' watches at the gates) and two sweepers on the plaza before it)
      for (const [gx, gz] of [[-107, 312], [-95, 312]]) { const g = mk('levite', 'guard', gx, gz, gx, gz + 6); setTool(g, 'staff'); }
      for (let k = 0; k < 2; k++) { const w = mk('worker', 'sweep', -104 + k * 12, 296 + k * 4, -90 + k * 4, 302 - k * 6); w.from[0] = w.x; w.from[1] = w.z; w.to[0] = w.fx; w.to[1] = w.fz; setTool(w, 'staff'); }
      return;
    }
    const L = SITES[id]; if (!L || !L.stand || L.stand.length < 2) return;
    const kohen = L.kind === 'kohen';
    for (let k = 0; k < 2; k++) { const S = L.stand[k]; mk(kohen ? 'kohen' : 'worker', 'plaster', S[0], S[1], S[2], S[3]); }
    const P = L.stand[2] || L.stand[0], Q = L.stand[3] || L.stand[1];
    const w = mk(kohen ? 'kohen' : 'worker', 'sweep', P[0], P[1], Q[0], Q[1]); w.from[0] = P[0]; w.from[1] = P[1]; w.to[0] = Q[0]; w.to[1] = Q[1]; setTool(w, 'staff');
  }
  // their work, each frame (personUpdate): the plasterer's trowel round, the sweeper's slow round, the surveyors' cord
  function plaster(w, dt) {
    const a = w.a, u = T * 1.6 + w.off;
    a.arm[2] = a.armT[2] = 1.35 + 0.22 * Math.sin(u); a.arm[3] = a.armT[3] = -0.18 + 0.12 * Math.cos(u);
    a.arm[0] = a.armT[0] = 0.9 + 0.08 * Math.sin(u * 0.5); a.arm[1] = a.armT[1] = -0.12;
    a.bow = a.bowT = 0.06 + 0.03 * Math.sin(u * 0.7);
  }
  function sweep(w, dt) {
    const a = w.a;
    a.tiltT = 1.15; a.bowT = 0.22; a.armT[2] = 0.35; a.armT[3] = -0.12; a.armT[0] = 0.5; a.armT[1] = -0.2;
    if (arrived(w)) { w.t += dt; if (w.t > 1.2 + (w.off % 1)) { w.t = 0; const toA = Math.hypot(a.x - w.to[0], a.z - w.to[1]) < 1.5; walkTo(w, toA ? w.from[0] : w.to[0], toA ? w.from[1] : w.to[1], 1.1); } }
    else { a.ph += dt * 1.5; }
  }
  function survey(w, dt) {
    const a = w.a, m = w.mate;
    if (!m || m.gone) return;
    w.faceTo[0] = m.a.x; w.faceTo[1] = m.a.z; a.face = w.faceTo;
    const k = Math.sin(T * 0.9 + w.off);
    a.arm[0] = a.armT[0] = 1.05 + 0.05 * k; a.arm[2] = a.armT[2] = 1.1 + 0.05 * k; a.arm[1] = a.armT[1] = -0.2; a.arm[3] = a.armT[3] = -0.2;
    a.bow = a.bowT = 0.05;
    if (w.rope) { actors.handWorld(m.a, 1, w.rope.neck); a.rope = w.rope; w.rope.alive = true; }
  }
  /** the ambient workers in the camera's view (tests): { total, inView, bySite } */
  function lifeCount() {
    const bySite = {}; let inView = 0, total = 0;
    for (const w of LIFE.people) {
      if (w.gone || w.leaving) continue; total++;
      const a = w.a; if (a.vis < 0.5) continue;
      sph.center.set(a.x, a.y + 2, a.z); sph.radius = 3;
      if (!fr.intersectsSphere(sph)) continue;
      inView++; bySite[w.site] = (bySite[w.site] || 0) + 1;
    }
    return { total, inView, bySite, key: LIFE.key };
  }
  function lifeList() { return LIFE.people.filter((w) => !w.gone).map((w) => ({ x: w.a.x, y: w.a.y, z: w.a.z, site: w.site, role: w.role, vis: w.a.vis, st: w.st })); }
  /** the person under a ray (the tap-to-identify card): { kind: 'crew' | 'life', crew, site, role } | null */
  const pkS = new THREE.Sphere(), pkV = new THREE.Vector3();
  function pickPerson(ray0) {
    const ray = ray0 && ray0.ray ? ray0.ray : ray0;   // (a Raycaster or its Ray)
    if (!ray || typeof ray.intersectSphere !== 'function') return null;
    let best = null, bd = Infinity;
    for (const w of people) {
      if (w.gone || w.leaving || w.a.vis < 0.5 || w.role === 'off' || w.role === '') continue;
      const a = w.a; pkS.center.set(a.x, a.y + 1.1 * a.s, a.z); pkS.radius = 1.15 * a.s;
      if (!ray.intersectSphere(pkS, pkV)) continue;
      const d = pkV.distanceTo(ray.origin); if (d < bd) { bd = d; best = w; }
    }
    return best ? { kind: best.ambient ? 'life' : 'crew', crew: best.crew, site: best.site, role: best.role, dist: bd } : null;
  }
  // ── /site16 ──
  function reset() {
    for (const id in sites) { sites[id].n = 0; sites[id].ids = ''; sites[id].idList = []; sites[id].dirty = true; }
    quarry.n = 0; quarry.ids = ''; quarry.idList = []; quarry.dirty = true;
    yard.n = 0; yard.dirty = true;
    for (const rid in trains) caravan(rid, 'none');
  }

  const api = {
    setCrews, setQuarry, caravan, trainees, cheer, update, reset,
    lifeCount, lifeList, pickPerson, setLife(v) { LIFE.on = !!v; LIFE.key = ''; },   // ── site16 ── the life layer and the tap card
    setEnabled(v) { enabled = !!v; },
    setScale(s) { if (Number.isFinite(s) && s > 0) pxScale = s; },
    get enabled() { return enabled; },
    get stats() {
      let vis = 0; for (const w of people) if (w.a.vis > 0.5) vis++;
      const siteN = {}; for (const id in sites) siteN[id] = { crews: sites[id].n, people: sites[id].crews.reduce((k, c) => k + c.filter((w) => w.role !== 'off').length, 0), phase: sites[id].phase };
      const tr = {}; for (const rid in trains) tr[rid] = { status: trains[rid].status, leg: trains[rid].leg, s: Math.round(trains[rid].s), len: Math.round(trains[rid].len) };
      return { people: people.length, visible: vis, sites: siteN, quarry: quarry.n, trainees: yard.list.length, trains: tr, carts: cartMesh.count, actorsDrawn: actors.drawn, animalsDrawn: animals.drawn, items: actors.items.count };
    },
    _actors: actors, _animals: animals, _people: people, _sites: sites, _trains: trains, SITES,
    // ── site8 ── the Mount's rubble cart, for tests: { on, leg, x, z, vis, len }
    keyCart,   // ── site9 ── keyCart(from, to, beyond?) → Promise<true> as the key stone is unloaded (stages.deliverKeyStone drives it)
    get keyCartState() { const c = kc.carts[0]; return { on: kc.on, leg: kc.leg, x: Math.round(c.x), z: Math.round(c.z), vis: +c.vis.toFixed(2), s: Math.round(kc.s), stop: Math.round(kc.stopS) }; },
    get mountCart() { const c = shut.carts[0]; return { on: shut.on, leg: shut.leg, x: Math.round(c.x), z: Math.round(c.z), vis: +c.vis.toFixed(2), len: Math.round(shut.len) }; },
  };
  return api;
}

/* ───────────────────────── geometry: the ox cart ─────────────────────────
   A two-wheeled cart with a plank bed and low sides, the pole forward to the yoke over the oxen's necks.
   Axle at the origin (y = wheel radius); +z forward. Vertex colours (wood). Wheels are a separate instanced mesh. */
function colored(g, hex) {
  g = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}
function rodG(a, b, r) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(r, r, L, 6, 1).translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  return g.translate(A.x, A.y, A.z);
}
function merge(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3));
  g.computeBoundingSphere();
  return g;
}
function cartGeometry() {
  const W = '#8E6B45', W2 = '#6F5234', W3 = '#A88258';
  const parts = [
    colored(new THREE.BoxGeometry(2.3, 0.22, 4.0).translate(0, 1.62, -0.2), W3),                 // the bed
    colored(new THREE.BoxGeometry(0.12, 0.5, 4.0).translate(1.1, 1.95, -0.2), W),                // the sides
    colored(new THREE.BoxGeometry(0.12, 0.5, 4.0).translate(-1.1, 1.95, -0.2), W),
    colored(new THREE.BoxGeometry(2.3, 0.45, 0.12).translate(0, 1.93, -2.15), W),
    colored(new THREE.BoxGeometry(0.34, 0.26, 0.5).translate(0, 1.4, 0), W2),                     // axle block
    colored(rodG([-1.3, 1.18, 0], [1.3, 1.18, 0], 0.1), W2),                                     // the axle
    colored(rodG([0, 1.5, 1.7], [0, 2.15, 6.1], 0.12), W2),                                       // the pole
    colored(rodG([-1.9, 2.3, 5.6], [1.9, 2.3, 5.6], 0.11), W),                                   // the yoke over the necks
    colored(rodG([-1.55, 2.3, 5.6], [-1.55, 1.85, 5.55], 0.05), W2), colored(rodG([1.55, 2.3, 5.6], [1.55, 1.85, 5.55], 0.05), W2),
    colored(rodG([-0.85, 2.3, 5.6], [-0.85, 1.85, 5.55], 0.05), W2), colored(rodG([0.85, 2.3, 5.6], [0.85, 1.85, 5.55], 0.05), W2),
  ];
  return merge(parts);
}
function wheelGeometry() {
  // a solid wheel of planks with a hub, rotating about x
  const parts = [
    colored(new THREE.CylinderGeometry(1.18, 1.18, 0.2, 14).rotateZ(Math.PI / 2), '#7C5C3B'),
    colored(new THREE.CylinderGeometry(0.3, 0.3, 0.42, 8).rotateZ(Math.PI / 2), '#5A4029'),
    colored(new THREE.BoxGeometry(0.24, 2.3, 0.14), '#6A4D31'),
  ];
  return merge(parts);
}

/* ───────────────────────── dust ───────────────────────── */
function makeDust(n) {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.45, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const pos = new Float32Array(n * 3), size = new Float32Array(n), alpha = new Float32Array(n);
  const vel = new Float32Array(n * 3), age = new Float32Array(n).fill(99), life = new Float32Array(n).fill(1), s0 = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const U = { map: { value: tex }, color: { value: new THREE.Color('#D2BF98') }, scale: { value: 600 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `attribute float size; attribute float alpha; varying float vA; uniform float scale;
      void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * scale / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); if (t.a * vA < 0.01) discard; gl_FragColor = vec4(color, t.a * vA); }`,
    transparent: true, depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.renderOrder = 2; points.name = 'crews-dust';
  let head = 0, live = 0;
  function spawn(x, y, z, s, sp, up, lf) {
    const i = head; head = (head + 1) % n;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    const a = Math.random() * 6.283;
    vel[i * 3] = Math.cos(a) * sp; vel[i * 3 + 1] = up; vel[i * 3 + 2] = Math.sin(a) * sp;
    age[i] = 0; life[i] = lf; s0[i] = s;
  }
  return {
    points,
    puff(x, y, z, s = 1.5, k = 1) { for (let j = 0; j < k * 2; j++) spawn(x, y, z, s * (0.7 + Math.random() * 0.6), 0.6 + Math.random() * 0.8, 0.5 + Math.random() * 0.6, 1.1 + Math.random() * 0.7); live = 2.5; },
    burst(x, y, z, k = 10, s = 3) { for (let j = 0; j < k; j++) spawn(x + (Math.random() - 0.5) * 6, y, z + (Math.random() - 0.5) * 6, s * (0.7 + Math.random() * 0.6), 1 + Math.random() * 1.6, 0.4 + Math.random(), 1.6 + Math.random()); live = 3; },
    update(dt, camera, px) {
      if (live <= 0) { if (points.visible && alpha[0] !== 0) { alpha.fill(0); geo.attributes.alpha.needsUpdate = true; } return; }
      live -= dt;
      if (camera) U.scale.value = (typeof innerHeight !== 'undefined' ? innerHeight : 800) * Math.min(typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1, 1.5) / (2 * Math.tan(camera.fov * Math.PI / 360));
      for (let i = 0; i < n; i++) {
        if (age[i] >= life[i]) { alpha[i] = 0; continue; }
        age[i] += dt;
        const k = age[i] / life[i];
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3] *= 1 - dt * 1.5; vel[i * 3 + 2] *= 1 - dt * 1.5; vel[i * 3 + 1] *= 1 - dt * 0.8;
        size[i] = s0[i] * (0.6 + k * 1.6);
        alpha[i] = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 0.42 * (1 - k * 0.3);
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.size.needsUpdate = true; geo.attributes.alpha.needsUpdate = true;
    },
  };
}
