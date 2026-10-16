/* ─────────────────────────────────────────────────────────────────────────────
 * sanctuary.js — the inside of the house: Ulam → Heichal → Kodesh HaKodashim, and its vessels (PROJECT.md §12
 * `world.sanctuary`). 1 unit = 1 amah; +x east, +z south, +y up. Coordinates come from places.js.
 *
 * temple.js carves the house hollow (walls, doorway, openings) and keeps it in the build stages. This module adds
 * what moves, changes state or needs its own lighting: the gold plating, floor and beamed ceiling of the rooms,
 * the four doors, the two parochot, the Menorah, the Shulchan with the bread, the golden altar, the Even HaShtiya,
 * the lamp flames, the ketoret cloud and one warm light rig. Everything here follows its build stage: it shows only
 * when stages.isDone('heichal') / ('kodesh') (the doors, visible from outside, too), and the rooms are culled
 * whenever the camera is outside and cannot see in.
 *
 * Draw calls inside: shell gold ×2 (Heichal, Kodesh), stone ×2, vessels ×1 (one mesh; groups switched in the shader),
 * parochot ×1, doors ×1, Even HaShtiya ×1, flames ×1, smoke ×1 (+1 highlight ring while shown).
 * Everything is a DRAFT (PROJECT.md §2.2); illustration choices are marked "illustration" below.
 *
 * Wave 3 (World agent) additions — all backward compatible:
 *   enter('heichal', { via: 'wicket' })  the opener's way (Tamid 3:7; Middot 4:2): to the northern wicket in the Ulam, a cut
 *                                        through the cell into the Heichal, before the shut great gate, which opens from
 *                                        inside; resolves when it stands open. ⚑ owner option (the default walk is unchanged)
 *   focus('heichal-gate', ms)            inside the Heichal, facing the great gate (portrait screens: a step farther back)
 *   anchor(id) → [x, y, z] | null        anchor points for the vessels (list at ANCHORS below)
 *   state.menorahAxis                    'ew' (default) | 'ns': the line along which the seven lamps stand. 'ew' = east–west,
 *                                        along the room; 'ns' = north–south, across it. It decides which lamp is "the western
 *                                        lamp" (setLamps index 0): with 'ew' the second from the east (Tamid 6:1 as read
 *                                        here), with 'ns' the middle one. Set by setMenorah({ axis }). ⚑ owner decision.
 *   On time: walks, tweens, waits and the fade run on the wall clock as well as on update(dt), with a wall-clock backstop,
 *   so focus/enter/exit resolve on time under a slow renderer (SwiftShader) or a paused loop. A quick focus (ms < 4 s)
 *   into the house from outside is a cut, not a walk.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Batch } from './batch.js';
import * as PL from './places.js';
import * as TX from './tex.js';
import { HOUSE_IN, carve } from './temple.js';
import { rng, clamp, lerp, smooth } from './util.js';

const TEF = 1 / 6;                    // a tefach, in amot
const FLOOR = HOUSE_IN.floor;         // 22
const WALL = HOUSE_IN.wall;           // 62: the lower storey is 40 high (Middot 4:6)
const CEIL = HOUSE_IN.ceil;           // 65
const H = PL.HEICHAL, K = PL.KODESH;
const GOLD = '#EDC35A', GOLD_DEEP = '#E2B75A';

/* vessel groups (one merged mesh; a group can be hidden or highlighted in the shader) */
const G = { still: 0, menSE: 1, menRE: 2, menSN: 3, menRN: 4, stone: 5, shulchan: 6, bread: 7, bez: 8, altar: 9, coals: 10 };
const NG = 12;

/* ───────── small geometry helpers ───────── */
function clean(g) {
  g = g.index ? g.toNonIndexed() : g;
  for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
  if (!g.attributes.normal) g.computeVertexNormals();
  return g;
}
const V2 = (a) => a.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0005), y));
const lathe = (prof, seg = 12) => new THREE.LatheGeometry(V2(prof), seg);
const boxG = (x0, y0, z0, x1, y1, z1) => new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

// parts of the vessel mesh: colour (linear), metalness, roughness, group
class Parts {
  constructor() { this.list = []; }
  add(g, color, metal, rough, grp = 0) {
    g = clean(g);
    const n = g.attributes.position.count, c = new THREE.Color(color);
    const col = new Float32Array(n * 3), mr = new Float32Array(n * 2), gr = new Float32Array(n).fill(grp);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; mr[i * 2] = metal; mr[i * 2 + 1] = rough; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aMR', new THREE.BufferAttribute(mr, 2));
    g.setAttribute('aGrp', new THREE.BufferAttribute(gr, 1));
    this.list.push(g);
    return g;
  }
  gold(g, grp, rough = 0.2) { return this.add(g, GOLD, 1, rough, grp); }
}

// a transform for "local" vessel coordinates: origin on the floor, local X = the vessel's long axis
function place(g, x, z, axisEW = true, y = FLOOR) {
  if (!axisEW) g.rotateY(-Math.PI / 2);   // local +X → world +z
  return g.translate(x, y, z);
}

/* ───────── the Menorah (Exodus 25:31–36; Menachot 28b) ─────────
 * 18 tefachim high: "הרגלים והפרח שלשה טפחים, וטפחיים חלק, וטפח שבו גביע וכפתור ופרח, וטפחיים חלק, וטפח כפתור ושני קנים
 * יוצאין ממנו ... וטפח חלק ... וטפח כפתור ושני קנים ... וטפח חלק ... וטפח כפתור ושני קנים ... וטפחיים חלק, נשתיירו שם שלשה
 * טפחים שבהן שלשה גביעים וכפתור ופרח". 22 cups, 11 knobs, 9 flowers in all; three cups, a knob and a flower on each
 * branch; three legs. "גביעין ... כמין כוסות אלכסנדריים, כפתורים ... כמין תפוחי הכרתיים, פרחים ... כמין פרחי העמודין".
 * Branches: 'straight' (diagonal — Rashi on Exodus 25:32 "באלכסון", the Rambam's drawing) or 'round' (the Arch of Titus):
 * an OPEN OWNER DECISION, both are built and switchable. The spread of the lamps (0.4 amah apart) is an illustration. */
const OS = 1.45;   // ornament scale: the vessel is drawn a little stout so that it reads at room scale (illustration)
const CUP = [[0.004, 0], [0.012, 0.004], [0.016, 0.02], [0.03, 0.045], [0.05, 0.068], [0.056, 0.074], [0.05, 0.075], [0.03, 0.06], [0.004, 0.055]];
const FLOWER = [[0.02, 0], [0.026, 0.012], [0.04, 0.03], [0.064, 0.05], [0.07, 0.056], [0.058, 0.058], [0.03, 0.052], [0.004, 0.05]];
const LAMP_DX = [1.2, 0.8, 0.4];                  // outer, middle, inner branch: lamp offset from the shaft
const KNOB_Y = [8.5 * TEF, 10.5 * TEF, 12.5 * TEF];   // the knobs from which the three pairs issue (tefach 9, 11, 13)
const TOP = 3.0;                                   // 18 tefachim

function menorahGeos(style) {
  const gold = [];
  const put = (g) => { gold.push(g); return g; };
  const orn = (prof, s = 1) => lathe(prof.map(([r, y]) => [r * s * OS, y * s * Math.min(OS, 1.15)]), 12);
  const knob = (r = 0.05, h = 0.075) => new THREE.SphereGeometry(1, 12, 8).scale(r * OS, h / 2 * 1.1, r * OS);
  // three legs and the flower above them (the lowest 3 tefachim)
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 2 + k * Math.PI * 2 / 3, cx = Math.cos(a), cz = Math.sin(a);
    const c = new THREE.CatmullRomCurve3([[0, 0.43, 0], [0.12, 0.36, 0], [0.3, 0.2, 0], [0.4, 0.05, 0]].map(([r, y]) => new THREE.Vector3(r * cx, y, r * cz)));
    put(new THREE.TubeGeometry(c, 12, 0.048, 8, false));
    put(new THREE.SphereGeometry(0.075, 10, 6).scale(1.3, 0.55, 1.3).translate(0.42 * cx, 0.04, 0.42 * cz));
  }
  put(orn(FLOWER, 1.25).translate(0, 0.38, 0));
  // the shaft
  put(new THREE.CylinderGeometry(0.062, 0.07, TOP - 0.44, 14, 1, true).translate(0, 0.44 + (TOP - 0.44) / 2 - 0.03, 0));
  // tefach 6: cup, knob, flower
  put(orn(CUP).translate(0, 5 * TEF + 0.005, 0)); put(knob().translate(0, 5 * TEF + 0.1, 0)); put(orn(FLOWER, 0.9).translate(0, 5 * TEF + 0.12, 0));
  // the three branch knobs
  for (const y of KNOB_Y) put(knob(0.06, 0.09).translate(0, y, 0));
  // the top 3 tefachim of the shaft: three cups, a knob, a flower — and the middle lamp
  for (let k = 0; k < 3; k++) put(orn(CUP).translate(0, 2.5 + k * 0.09, 0));
  put(knob().translate(0, 2.815, 0)); put(orn(FLOWER).translate(0, 2.87, 0));
  const lamps = [[0, TOP]];
  // the six branches
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
    const d = LAMP_DX[i] * s, y0 = KNOB_Y[i], end = TOP - 0.08, pts = [];
    if (style === 'round') {
      const R = Math.abs(d);
      for (let k = 0; k <= 14; k++) { const a = -Math.PI / 2 + (k / 14) * Math.PI / 2; pts.push(new THREE.Vector3(Math.sign(d) * R * Math.cos(a), y0 + R + R * Math.sin(a), 0)); }
      if (end > y0 + R + 0.01) pts.push(new THREE.Vector3(d, end, 0));
    } else {
      // straight and diagonal, from the knob to under the lamp
      for (let k = 0; k <= 6; k++) pts.push(new THREE.Vector3(d * k / 6, lerp(y0, end, k / 6), 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    put(new THREE.TubeGeometry(curve, style === 'round' ? 28 : 8, 0.05, 10, false));
    // along the top of the branch (by length from its end): flower, knob, three cups
    const L = curve.getLength(), at = (dist, g) => {
      const u = clamp(1 - dist / L, 0, 1), p = curve.getPointAt(u), t = curve.getTangentAt(u);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), t);
      g.applyQuaternion(q).translate(p.x, p.y, p.z); put(g);
    };
    at(0.075, orn(FLOWER)); at(0.14, knob().translate(0, 0, 0));
    for (let k = 0; k < 3; k++) at(0.24 + k * 0.09, orn(CUP).translate(0, -0.04, 0));
    lamps.push([d, TOP]);
  }
  // the seven lamps: small oval gold lamps, spouts turned toward the middle lamp (Menachot 98b: "אל מול פני המנורה");
  // the middle one toward the west (illustration)
  const flames = [];
  for (const [d] of lamps) {
    const dir = d === 0 ? -1 : -Math.sign(d);           // spout direction along local X (middle lamp: −X = west)
    put(new THREE.SphereGeometry(0.085, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).scale(1.4, 0.75, 1).translate(d, TOP - 0.03, 0));
    put(new THREE.TorusGeometry(0.08, 0.011, 5, 16).rotateX(Math.PI / 2).scale(1.4, 1, 1).translate(d, TOP - 0.03, 0));
    put(new THREE.CylinderGeometry(0.022, 0.034, 0.1, 8).rotateZ(Math.PI / 2 * -dir).translate(d + dir * 0.14, TOP - 0.026, 0));
    flames.push([d + dir * 0.19, TOP + 0.01]);
  }
  return { gold: gold.map(clean), flames };
}

/* ───────── the Shulchan (Exodus 25:23–30; Menachot 11:5–6), R. Meir's measure: 12 × 6 tefachim = 2 × 1 amot ─────────
 * The loaves (10 × 5 tefachim) lie across the table's width, turned up two tefachim on each side, in two stacks of six
 * with two tefachim between them "כדי שתהא הרוח מנשבת ביניהן". Four gold supports (סניפין) split at their tops, and 28 half-
 * hollow rods, 14 to a stack (three under each loaf but the lowest; two over the fifth) (Menachot 11:6; 97a). The two
 * bezichin of levona on the stacks (the Sages in Menachot 11:5; Abba Shaul: in the space between them). The supports
 * stand on the floor beside the table (illustration of how they held the rods). */
function shulchanGeos() {
  const gold = [], bread = [], bez = [], lev = [];
  const L = 2, W = 1, HT = 1.5, top = 0.07;
  // top, crown ("זר זהב סביב"), frame a handbreadth ("מסגרת טפח"), four legs, four rings
  gold.push(boxG(-L / 2, HT - top, -W / 2, L / 2, HT, W / 2));
  for (const [x0, z0, x1, z1] of [[-L / 2, -W / 2, L / 2, -W / 2 + 0.05], [-L / 2, W / 2 - 0.05, L / 2, W / 2], [-L / 2, -W / 2, -L / 2 + 0.05, W / 2], [L / 2 - 0.05, -W / 2, L / 2, W / 2]]) {
    gold.push(boxG(x0, HT, z0, x1, HT + 0.09, z1));
    gold.push(boxG(x0 - (x0 < -0.9 ? 0.012 : 0), HT + 0.085, z0 - (z0 < -0.45 ? 0.012 : 0), x1 + (x1 > 0.9 ? 0.012 : 0), HT + 0.11, z1 + (z1 > 0.45 ? 0.012 : 0)));
  }
  const fy = HT - top - 0.3;
  for (const [x0, z0, x1, z1] of [[-L / 2 + 0.06, -W / 2 + 0.06, L / 2 - 0.06, -W / 2 + 0.1], [-L / 2 + 0.06, W / 2 - 0.1, L / 2 - 0.06, W / 2 - 0.06], [-L / 2 + 0.06, -W / 2 + 0.06, -L / 2 + 0.1, W / 2 - 0.06], [L / 2 - 0.1, -W / 2 + 0.06, L / 2 - 0.06, W / 2 - 0.06]]) gold.push(boxG(x0, fy, z0, x1, fy + TEF, z1));
  const leg = [[0.045, 0], [0.06, 0.03], [0.045, 0.08], [0.04, 0.6], [0.055, 0.66], [0.04, 0.72], [0.04, HT - top - 0.05], [0.055, HT - top]];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    gold.push(lathe(leg, 10).translate(sx * (L / 2 - 0.08), 0, sz * (W / 2 - 0.08)));
    gold.push(new THREE.TorusGeometry(0.06, 0.012, 6, 14).translate(sx * (L / 2 - 0.08), fy + 0.08, sz * (W / 2 + 0.005)));
  }
  // the two stacks: loaf = a U across the table (z), 5 tefachim along the table (x)
  const lw = 5 * TEF, gap = 2 * TEF, th = 0.055, horn = 7 / 24, pitch = horn + 0.05;
  const stacks = [-(gap / 2 + lw / 2), gap / 2 + lw / 2];
  const y0 = HT + 0.01;
  for (const cx of stacks) {
    for (let k = 0; k < 6; k++) {
      const y = y0 + k * pitch, x0 = cx - lw / 2 + 0.01, x1 = cx + lw / 2 - 0.01;
      // a baked loaf, soft-edged, shaped like an open box across the table ("כמין תיבה פרוצה", Menachot 94b)
      bread.push(loafGeo(W - 0.04, horn, th + 0.02, x1 - x0).translate(cx, y, 0));
      // rods over this loaf (three; two over the fifth; none over the sixth)
      const n = k < 4 ? 3 : k === 4 ? 2 : 0;
      for (let r = 0; r < n; r++) {
        const rx = n === 3 ? cx + (r - 1) * 0.26 : cx + (r - 0.5) * 0.4;
        gold.push(new THREE.CylinderGeometry(0.02, 0.02, W + 0.3, 6, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI).translate(rx, y + horn + 0.035, 0));
      }
    }
    // the two supports of this stack, split at their tops (and a prong at each level for the rods)
    for (const s of [-1, 1]) {
      const z = s * (W / 2 + 0.17), ytop = y0 + 6 * pitch + 0.1;
      gold.push(lathe([[0.07, 0], [0.075, 0.02], [0.04, 0.06], [0.03, 0.2], [0.03, ytop - 0.15], [0.036, ytop - 0.12]], 10).translate(cx, 0, z));
      for (const sx of [-1, 1]) gold.push(new THREE.CylinderGeometry(0.02, 0.026, 0.2, 6).rotateZ(sx * 0.35).translate(cx + sx * 0.04, ytop - 0.03, z));
      for (let k = 0; k < 5; k++) gold.push(boxG(cx - 0.34, y0 + k * pitch + horn + 0.012, z - 0.03, cx + 0.34, y0 + k * pitch + horn + 0.03, z + 0.03));
    }
    // the bazich on top of the stack: a small gold bowl with a heap of frankincense
    const by = y0 + 5 * pitch + horn + 0.02;
    bez.push(lathe([[0.004, 0], [0.07, 0.004], [0.1, 0.03], [0.115, 0.07], [0.105, 0.072], [0.09, 0.035], [0.004, 0.02]], 14).translate(cx, by, 0));
    bez.push(new THREE.CylinderGeometry(0.012, 0.016, 0.16, 6).rotateZ(Math.PI / 2).translate(cx + 0.18, by + 0.05, 0));
    lev.push(new THREE.SphereGeometry(0.095, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.55, 1).translate(cx, by + 0.045, 0));
  }
  return { gold, bread, bez, lev, height: y0 + 6 * pitch };
}

// the cross-section of a loaf (a U with rounded corners) extruded along the table's length
function loafGeo(w, h, t, len) {
  const S = new THREE.Shape(), a = w / 2, r = 0.05, ri = 0.03;
  S.moveTo(-a, h - t / 2); S.lineTo(-a, r); S.quadraticCurveTo(-a, 0, -a + r, 0); S.lineTo(a - r, 0); S.quadraticCurveTo(a, 0, a, r);
  S.lineTo(a, h - t / 2); S.quadraticCurveTo(a, h + t * 0.15, a - t / 2, h + t * 0.15); S.quadraticCurveTo(a - t, h + t * 0.15, a - t, h - t / 2);
  S.lineTo(a - t, t + ri); S.quadraticCurveTo(a - t, t, a - t - ri, t); S.lineTo(-a + t + ri, t); S.quadraticCurveTo(-a + t, t, -a + t, t + ri);
  S.lineTo(-a + t, h - t / 2); S.quadraticCurveTo(-a + t, h + t * 0.15, -a + t / 2, h + t * 0.15); S.quadraticCurveTo(-a, h + t * 0.15, -a, h - t / 2);
  const g = new THREE.ExtrudeGeometry(S, { depth: len - 0.03, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2, curveSegments: 4 });
  return g.translate(0, 0, -(len - 0.03) / 2).rotateY(Math.PI / 2);
}

/* ───────── the golden altar (Exodus 30:1–4): an amah by an amah, two amot high, horns, a crown, rings under it ───────── */
function goldAltarGeos() {
  const gold = [], coals = [];
  const s = 0.5, HT = 2;
  gold.push(boxG(-s + 0.02, 0, -s + 0.02, s - 0.02, HT - 0.02, s - 0.02));
  gold.push(boxG(-s - 0.04, 0, -s - 0.04, s + 0.04, 0.1, s + 0.04));                  // a plinth (illustration)
  for (const y of [HT - 0.2, HT - 0.02]) gold.push(boxG(-s - 0.03, y, -s - 0.03, s + 0.03, y + 0.07, s + 0.03));   // the crown
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) gold.push(boxG(sx * s - (sx > 0 ? 0.16 : 0), HT, sz * s - (sz > 0 ? 0.16 : 0), sx * s + (sx < 0 ? 0.16 : 0), HT + 0.16, sz * s + (sz < 0 ? 0.16 : 0)));
  for (const sz of [-1, 1]) for (const sx of [-0.25, 0.25]) gold.push(new THREE.TorusGeometry(0.05, 0.011, 6, 12).translate(sx, HT - 0.32, sz * (s + 0.01)));
  // coals heaped on the roof of the altar (when the ketoret is offered)
  const r = rng(31);
  for (let k = 0; k < 26; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.32, sz = 0.05 + r() * 0.05;
    coals.push(new THREE.IcosahedronGeometry(sz, 0).scale(1, 0.6, 1).rotateY(r() * 3).translate(Math.cos(a) * d, HT + 0.03 + (0.32 - d) * 0.25 + r() * 0.03, Math.sin(a) * d));
  }
  return { gold, coals };
}

/* ───────── the parochot: two curtains an amah apart (Yoma 5:1), 40 × 20, a handbreadth thick (Shekalim 8:5) ───────── */
const PN_U = 56, PN_V = 22, P_THICK = TEF;
function parochetGeometry() {
  // two curtains × (front + back) grids + the free edge strip; positions rewritten by foldParochot()
  const perSurf = (PN_U + 1) * (PN_V + 1), perCurt = perSurf * 2 + (PN_V + 1) * 2;
  const pos = new Float32Array(perCurt * 2 * 3), uv = new Float32Array(perCurt * 2 * 2), idx = [];
  for (let c = 0; c < 2; c++) {
    const base = c * perCurt;
    for (let side = 0; side < 2; side++) {
      const o = base + side * perSurf;
      for (let j = 0; j <= PN_V; j++) for (let i = 0; i <= PN_U; i++) {
        const k = o + j * (PN_U + 1) + i;
        uv[k * 2] = (i / PN_U) * 20 / 2; uv[k * 2 + 1] = (j / PN_V) * 40 / 2;
      }
      for (let j = 0; j < PN_V; j++) for (let i = 0; i < PN_U; i++) {
        const a = o + j * (PN_U + 1) + i, b = a + 1, d = a + PN_U + 1, e = d + 1;
        if (side === 0) idx.push(a, b, d, b, e, d); else idx.push(a, d, b, b, d, e);
      }
    }
    // the free (moving) edge: a strip joining front and back at i = 0
    const eo = base + perSurf * 2;
    for (let j = 0; j <= PN_V; j++) for (let s = 0; s < 2; s++) { const k = eo + j * 2 + s; uv[k * 2] = s * 0.08; uv[k * 2 + 1] = (j / PN_V) * 20; }
    for (let j = 0; j < PN_V; j++) { const a = eo + j * 2, b = a + 1, d = a + 2, e = a + 3; idx.push(a, d, b, b, d, e); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.userData = { perSurf, perCurt };
  return g;
}
// open ∈ [0, 1]: the free edge (south for the outer curtain, north for the inner) is gathered back and pinned, leaving
// an opening at the floor that narrows upward — "החיצונה היתה פרופה מן הדרום והפנימית מן הצפון" (Yoma 5:1).
function foldParochot(g, outer, inner) {
  const { perSurf, perCurt } = g.userData, P = g.attributes.position.array;
  const set = (k, x, y, z) => { P[k * 3] = x; P[k * 3 + 1] = y; P[k * 3 + 2] = z; };
  for (let c = 0; c < 2; c++) {
    const f = clamp(c === 0 ? outer : inner, 0, 1), xc = c === 0 ? PL.PAROCHOT.outer.x : PL.PAROCHOT.inner.x;
    const zs = c === 0 ? 1 : -1;                            // the free edge: z = +10 (south) for the outer one, −10 for the inner
    const base = c * perCurt, Wo = 6 * f, Ht = 30 * f, Lg = 10;
    const xAt = (s, y, side) => {
      // s: distance from the free edge (0 … 20); y: height
      const v = (y - FLOOR) / 40, open = y - FLOOR < Ht ? Wo * Math.pow(1 - (y - FLOOR) / Math.max(Ht, 1e-3), 1.35) : 0;
      const s2 = s < Lg ? open + s * (1 - open / Lg) : s;
      const comp = s < Lg ? open / Lg * (1 - s / Lg) : 0;      // how gathered the cloth is here
      const amp = 0.32 + comp * 1.5 + (1 - v) * 0.05;
      const ph = s * 2 * Math.PI / 2.2 + Math.sin(s * 0.9) * 0.6;
      const bulge = comp * 0.9 * Math.sin(Math.PI * clamp((y - FLOOR) / Math.max(Ht, 1), 0, 1));   // gathered cloth leans back
      const dx = Math.sin(ph) * amp - bulge * (c === 0 ? 1 : -1);
      const lift = s < 1.2 ? (1.2 - s) * 0.25 * f * (1 - v) : 0;
      return [xc + dx + side * P_THICK / 2 * (c === 0 ? 1 : -1), y + lift, zs * (10 - 0.02 - s2)];
    };
    for (let side = 0; side < 2; side++) {
      const o = base + side * perSurf;
      for (let j = 0; j <= PN_V; j++) {
        const y = FLOOR + 0.03 + (WALL - 0.02 - FLOOR - 0.03) * (j / PN_V);
        for (let i = 0; i <= PN_U; i++) { const [x, yy, z] = xAt(20 * i / PN_U, y, side ? 1 : -1); set(o + j * (PN_U + 1) + i, x, yy, z); }
      }
    }
    const eo = base + perSurf * 2;
    for (let j = 0; j <= PN_V; j++) for (let s = 0; s < 2; s++) { const k = base + s * perSurf + j * (PN_U + 1); set(eo + j * 2 + s, P[k * 3], P[k * 3 + 1], P[k * 3 + 2]); }
  }
  g.attributes.position.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingSphere();
}

/* ───────── a door leaf of the Heichal: 20 high, 4.75 wide, gold; local X from the hinge ───────── */
function doorLeafGeometry() {
  const W = 4.75, Hh = 19.9, T = 0.3, parts = [boxG(0, 0, -T / 2, W, Hh, T / 2)];
  for (const s of [-1, 1]) {
    const z0 = s * T / 2, z1 = s * (T / 2 + 0.12);
    const zz = [Math.min(z0, z1), Math.max(z0, z1)];
    parts.push(boxG(0.08, 0.1, zz[0], 0.4, Hh - 0.1, zz[1]), boxG(W - 0.4, 0.1, zz[0], W - 0.08, Hh - 0.1, zz[1]));
    for (const y of [0.1, 5.2, 10.6, 15.8, Hh - 0.42]) parts.push(boxG(0.4, y, zz[0], W - 0.4, y + 0.32, zz[1]));
  }
  for (const y of [1.2, Hh - 1.6]) parts.push(new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8).translate(0, y + 0.6, 0));   // hinge pins
  const g = mergeGeometries(parts.map(clean)), P = g.attributes.position, N = g.attributes.normal, uv = new Float32Array(P.count * 2);
  for (let i = 0; i < P.count; i++) { const ax = Math.abs(N.getX(i)); uv[i * 2] = (ax > 0.5 ? P.getZ(i) : P.getX(i)) / 2.5; uv[i * 2 + 1] = P.getY(i) / 2.5; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/* ───────── the interior light environment (reflected by the gold): a warm room, the doorway toward the east ───────── */
function interiorEquirect(day, lamp) {
  const w = 256, h = 128, c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const L = 0.35 + 0.65 * lamp;
  const gr = x.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, `rgb(${22 * L | 0},${17 * L | 0},${11 * L | 0})`);
  gr.addColorStop(0.42, `rgb(${96 * L | 0},${76 * L | 0},${50 * L | 0})`);
  gr.addColorStop(0.58, `rgb(${122 * L | 0},${98 * L | 0},${64 * L | 0})`);
  gr.addColorStop(1, `rgb(${46 * L | 0},${40 * L | 0},${32 * L | 0})`);
  x.fillStyle = gr; x.fillRect(0, 0, w, h);
  // warm glows: the lamps (south, low) and the lit gold on the far walls
  const glow = (u, v, r, col) => { const g = x.createRadialGradient(u * w, v * h, 0, u * w, v * h, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  glow(0.75, 0.56, 38, `rgba(255,190,110,${0.55 * lamp})`);
  glow(0.25, 0.52, 46, `rgba(230,160,80,${0.3 * lamp})`);
  glow(0.0, 0.5, 40, `rgba(200,140,70,${0.25 * lamp})`); glow(1.0, 0.5, 40, `rgba(200,140,70,${0.25 * lamp})`);
  // the doorway (east = u 0.5), bright by day
  const dl = day;
  x.fillStyle = `rgba(${255 * dl | 0},${236 * dl | 0},${205 * dl | 0},${0.9 * dl + 0.05})`;
  x.fillRect(w * 0.47, h * 0.36, w * 0.06, h * 0.14);
  glow(0.5, 0.44, 30, `rgba(255,230,190,${0.35 * dl})`);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

/* ───────── shader patches ───────── */
// gold plating: the reflected room fades toward the (unlit) ceiling
function patchShell(mat, U) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSW;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvSW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vSW; uniform float uTopDark; uniform vec4 uBlob[6]; uniform vec4 uRing; uniform float uTime;`)
      .replace('#include <aomap_fragment>', `#include <aomap_fragment>
      { float hk = mix(1.0, uTopDark, smoothstep(${(FLOOR + 3).toFixed(1)}, ${(CEIL - 1).toFixed(1)}, vSW.y));
        float occ = 1.0;
        for (int i = 0; i < 6; i++) { vec2 d = (vSW.xz - uBlob[i].xy) / uBlob[i].zw; occ *= 1.0 - 0.6 * exp(-2.2 * dot(d, d)) * step(vSW.y, ${(FLOOR + 0.4).toFixed(1)}); }
        reflectedLight.indirectDiffuse *= hk * occ; reflectedLight.indirectSpecular *= hk * occ;
        reflectedLight.directDiffuse *= mix(1.0, occ, 0.7); reflectedLight.directSpecular *= mix(1.0, occ, 0.7); }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      if (uRing.w > 0.001) { float r = length(vSW.xz - uRing.xy); float b = exp(-pow((r - uRing.z) / 0.12, 2.0)) + 0.25 * exp(-pow((r - uRing.z) / 0.45, 2.0));
        totalEmissiveRadiance += vec3(2.4, 1.6, 0.55) * b * uRing.w * (0.75 + 0.25 * sin(uTime * 4.0)) * step(vSW.y, ${(FLOOR + 0.2).toFixed(1)}); }`);
  };
  mat.customProgramCacheKey = () => 'sanct-shell';
  return mat;
}
// vessels: per-vertex metalness/roughness, groups hidden / highlighted / glowing
function patchVessel(mat, U) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
      attribute vec2 aMR; attribute float aGrp; varying vec2 vMR; varying float vHi; varying float vEm;
      uniform float uVis[${NG}]; uniform float uHi[${NG}]; uniform float uEm[${NG}];`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
      { int gi = int(aGrp + 0.5); vMR = aMR; vHi = uHi[gi]; vEm = uEm[gi]; if (uVis[gi] < 0.5) transformed = vec3(0.0); }`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vMR; varying float vHi; varying float vEm; uniform float uTime;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = vMR.y;')
      .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = vMR.x;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(2.3, 0.72, 0.16) * vEm * (0.8 + 0.2 * sin(uTime * 7.0 + vViewPosition.x * 9.0 + vViewPosition.y * 5.0));
      if (vHi > 0.001) { float fr = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
        totalEmissiveRadiance += vec3(1.6, 1.05, 0.35) * vHi * (0.12 + 0.9 * fr * fr) * (0.7 + 0.3 * sin(uTime * 4.0)); }`);
  };
  mat.customProgramCacheKey = () => 'sanct-vessel';
  return mat;
}

function particleMat(tex, color, additive) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, color: { value: color }, scale: { value: 600 } },
    vertexShader: `attribute float size; attribute float alpha; varying float vA; uniform float scale;
      void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * scale / max(0.5, -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
      void main(){ vec4 t = texture2D(map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)); if (vA < 0.003) discard; gl_FragColor = vec4(color * t.rgb, t.a * vA); }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

/* ═════════════════════════════ createSanctuary ═════════════════════════════ */
export function createSanctuary(ctx) {
  const { scene, camera, renderer } = ctx;
  const controls = ctx.controls || null;
  const stages = () => ctx.stages || null;
  const done = (id) => { const s = stages(); return !s || !s.isDone || s.isDone(id); };
  const opts = Object.assign({ branchStyle: 'straight', menorahAxis: 'ew' }, ctx.options || {});
  const root = new THREE.Group(); root.name = 'sanctuary'; scene.add(root);
  const inner = new THREE.Group(); inner.name = 'sanctuary-in'; root.add(inner);          // the Heichal (culled outside)
  const innerK = new THREE.Group(); innerK.name = 'sanctuary-kodesh'; root.add(innerK);   // the Kodesh HaKodashim
  let time = 0;
  const baseFov = camera.fov;

  /* ── materials ── */
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const tGold = TX.texGoldPlate(101, 512), tHammer = TX.texGoldPlate(103, 256, false), tStone = TX.texPaving(131, 512, [40, 12, 84]), tWeave = TX.texWeave(111, 512), tRock = TX.texRock(97, 256);
  for (const t of [tGold.map, tGold.normalMap, tStone.map, tStone.normalMap, tWeave.map, tWeave.normalMap, tRock.map, tRock.normalMap]) t.anisotropy = aniso;
  const pmrem = new THREE.PMREMGenerator(renderer);
  let envRT = null, envKey = '';
  const U = {
    uTopDark: { value: 0.35 }, uTime: { value: 0 },
    uBlob: { value: [new THREE.Vector4(PL.MENORAH.x, PL.MENORAH.z, 0.9, 0.9), new THREE.Vector4(PL.SHULCHAN.x, PL.SHULCHAN.z, 1.35, 0.85), new THREE.Vector4(PL.GOLD_ALTAR.x, PL.GOLD_ALTAR.z, 0.8, 0.8), new THREE.Vector4(PL.MENORAH_STONE.x - 0.75, PL.MENORAH_STONE.z, 0.95, 0.8), new THREE.Vector4(0, 0, 0.01, 0.01), new THREE.Vector4(0, 0, 0.01, 0.01)] },
    uRing: { value: new THREE.Vector4(0, 0, 1, 0) },
  };
  const UV = { uVis: { value: new Array(NG).fill(1) }, uHi: { value: new Array(NG).fill(0) }, uEm: { value: new Array(NG).fill(0) }, uTime: U.uTime };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const shellGold = patchShell(std({ color: GOLD_DEEP, map: tGold.map, normalMap: tGold.normalMap, normalScale: new THREE.Vector2(0.6, 0.6), metalness: 1, roughness: 0.46, envMapIntensity: 1.15 }), U);
  const shellStone = patchShell(std({ color: '#E9E1D2', map: tStone.map, normalMap: tStone.normalMap, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.62, envMapIntensity: 1.35 }), U);
  const shellDark = std({ color: '#0E0A06', roughness: 1 });
  const vesselMat = patchVessel(std({ vertexColors: true, envMapIntensity: 1.1 }), UV);
  // (the emissive term stands for the warm light the gold room throws back on the cloth)
  const fabricMat = std({ map: tWeave.map, normalMap: tWeave.normalMap, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.93, side: THREE.DoubleSide, envMapIntensity: 0.45, emissiveMap: tWeave.map, emissive: new THREE.Color(0, 0, 0) });
  // the curtain farther from the eye is seen in the dark amah between them
  fabricMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vFX;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvFX = (modelMatrix * vec4(transformed, 1.0)).x;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vFX;').replace('#include <map_fragment>', `#include <map_fragment>
      { float far = cameraPosition.x > ${PL.PAROCHOT.outer.x - 0.5} ? smoothstep(${PL.PAROCHOT.outer.x - 0.45}, ${PL.PAROCHOT.inner.x - 0.05}, vFX) : smoothstep(${PL.PAROCHOT.inner.x + 0.45}, ${PL.PAROCHOT.outer.x + 0.05}, vFX);
        diffuseColor.rgb *= mix(1.0, 0.28, far); }`);
  };
  fabricMat.customProgramCacheKey = () => 'sanct-fabric';
  // (wave 4: paler, with a soft glow of its own so it reads in the dim room as stone, not as a shadow — QA P2-14)
  // (the rock texture is a mid-grey limestone; the colour lifts it above the paving's own tone — values over 1 on purpose)
  const rockMat = std({ color: new THREE.Color(1.62, 1.53, 1.38), map: tRock.map, normalMap: tRock.normalMap, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.88, envMapIntensity: 2.6, vertexColors: true, emissive: new THREE.Color(0.42, 0.38, 0.31), emissiveMap: tRock.map, emissiveIntensity: 0.8 });
  // (world7: seen from the courts the doors stand in the Ulam's shade and reflected one even sky — flat mustard; a deeper gold,
  // a stronger hammered relief and a lower roughness make the reflection break up and glint, so they read as beaten gold)
  const doorMat = std({ color: '#E4AE3E', normalMap: tHammer.normalMap, normalScale: new THREE.Vector2(1.5, 1.5), metalness: 1, roughness: 0.2, emissive: new THREE.Color('#2E1C03') });
  const inMats = [shellGold, shellStone, vesselMat, fabricMat, rockMat];

  /* ── the shell: gold plating, floor, the כיור band and the beamed ceiling ── */
  const SB = new Batch({ gold: { mat: shellGold, tile: 5 }, stone: { mat: shellStone, tile: 12 }, dark: { mat: shellDark, tile: 10, cast: false } });
  const e = 0.03;
  const plate = (k, x0, y0, z0, x1, y1, z1) => SB.box(k, x0, y0, z0, x1, y1, z1, -999);
  function shell(x0, x1, room) {
    // floor (stone), the side walls, the kiyur band 62–63 (a plain gold moulding) and the ceiling at 65 with beams
    plate('stone', x0, FLOOR, -10, x1, FLOOR + e, 10);
    plate('gold', x0, FLOOR, -10, x1, WALL, -10 + e); plate('gold', x0, FLOOR, 10 - e, x1, WALL, 10);
    plate('gold', x0, WALL, -10, x1, WALL + 1, -9.7); plate('gold', x0, WALL, 9.7, x1, WALL + 1, 10);
    plate('gold', x0, WALL + 1, -10, x1, CEIL, -10 + e); plate('gold', x0, WALL + 1, 10 - e, x1, CEIL, 10);
    // ceiling with the openings of the upper storey (Kodesh only)
    const holes = room === 'K' ? HOUSE_IN.openings.map(([x, z]) => [x - 1, CEIL - 1, z - 1, x + 1, CEIL + 1, z + 1]) : [];
    carve((q) => plate('gold', ...q), [x0, CEIL - e, -10, x1, CEIL, 10], holes);
    // beams (תקרה) across the room, every 2.5 amot, plated
    for (let x = x1 - 1.5; x > x0 + 0.5; x -= 2.5) {
      if (room === 'K' && HOUSE_IN.openings.some(([ox]) => Math.abs(ox - x) < 1.5)) continue;
      plate('gold', x - 0.35, CEIL - 1.1, -9.7, x + 0.35, CEIL - e, 9.7);
    }
    plate('gold', x0, CEIL - 0.6, -9.7, x1, CEIL - e, -9.2); plate('gold', x0, CEIL - 0.6, 9.2, x1, CEIL - e, 9.7);
    if (room === 'K') for (const [x, z] of HOUSE_IN.openings) {
      // the shafts of the openings, dark, closed above by the upper storey's floor
      plate('dark', x - 1, CEIL, z - 1, x + 1, 67, z - 1 + e); plate('dark', x - 1, CEIL, z + 1 - e, x + 1, 67, z + 1);
      plate('dark', x - 1, CEIL, z - 1, x - 1 + e, 67, z + 1); plate('dark', x + 1 - e, CEIL, z - 1, x + 1, 67, z + 1);
      plate('dark', x - 1, 67 - e, z - 1, x + 1, 67, z + 1);
      plate('gold', x - 1.2, CEIL - 0.25, z - 1.2, x + 1.2, CEIL - e, z - 1); plate('gold', x - 1.2, CEIL - 0.25, z + 1, x + 1.2, CEIL - e, z + 1.2);
      plate('gold', x - 1.2, CEIL - 0.25, z - 1, x - 1, CEIL - e, z + 1); plate('gold', x + 1, CEIL - 0.25, z - 1, x + 1.2, CEIL - e, z + 1);
    }
  }
  // Heichal (with the amah traksin): x −139 … −98
  SB.stage('H');
  shell(PL.AMAH_TRAKSIN.x0, H.x1, 'H');
  // the east wall inside: gold, except "behind the doors" (Middot 4:1), where the open inner doors lie — plain stone
  plate('gold', H.x1 - e, 42, -10, H.x1, WALL, 10);
  plate('gold', H.x1 - e, FLOOR, -10, H.x1, 42, -9.95); plate('gold', H.x1 - e, FLOOR, 9.95, H.x1, 42, 10);
  plate('stone', H.x1 - e, FLOOR, -9.95, H.x1, 42, -5); plate('stone', H.x1 - e, FLOOR, 5, H.x1, 42, 9.95);
  plate('gold', H.x1 - e, WALL, -9.7, H.x1 - 0.3, WALL + 1, 9.7); plate('gold', H.x1 - e, WALL + 1, -10, H.x1, CEIL, 10);
  // Kodesh HaKodashim: x −159 … −139
  SB.stage('K');
  shell(K.x0, K.x1, 'K');
  plate('gold', K.x0, FLOOR, -10, K.x0 + e, CEIL, 10);
  plate('gold', K.x0, WALL, -9.7, K.x0 + 0.3, WALL + 1, 9.7);
  const shellH = SB.build(inner, 'H'), shellK = SB.build(innerK, 'K');
  for (const m of [...shellH, ...shellK]) { m.castShadow = false; m.receiveShadow = true; }

  /* ── the Even HaShtiya: natural rock, three fingerbreadths above the floor (Yoma 5:2). Its extent: illustration ──
     Wave 4 (QA P2-14: at phone size the old soft, dark, flat blob read as a stain): a pale, living rock with an angular
     outline of broken facets, a flat-topped plateau at the full three fingerbreadths (0.125 amah) with a short steep edge all
     round, weathered hollows and a darker band on its sides — so its edge reads as a rock standing on the floor. */
  const rock = (() => {
    const g = new THREE.PlaneGeometry(6.4, 5.2, 56, 44).rotateX(-Math.PI / 2), p = g.attributes.position, r = rng(7);
    // the outline: nine broken facets (straight between their corners), not a smooth blob
    const NF = 9, fr = Array.from({ length: NF }, (_, k) => 0.84 + 0.16 * r() - (k % 3 === 1 ? 0.05 : 0)), fa = Array.from({ length: NF }, (_, k) => (k + (r() - 0.5) * 0.5) / NF * Math.PI * 2);
    const R = (a) => { a = (a + Math.PI * 2) % (Math.PI * 2); for (let k = 0; k < NF; k++) { const a0 = fa[k], a1 = k + 1 < NF ? fa[k + 1] : fa[0] + Math.PI * 2; let aa = a < a0 ? a + Math.PI * 2 : a; if (aa >= a0 && aa <= a1) { const t = (aa - a0) / (a1 - a0), b = fr[(k + 1) % NF]; return fr[k] * (1 - t) + b * t; } } return 0.9; };
    const bumps = Array.from({ length: 12 }, () => [(r() - 0.5) * 4.4, (r() - 0.5) * 3.4, 0.4 + r() * 0.9]);
    const col = new Float32Array(p.count * 3), H0 = PL.EVEN_SHTIYA.h;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const rr = Math.hypot(x / 3.05, z / 2.45) / R(Math.atan2(z / 2.45, x / 3.05));
      // the plateau: the full three fingerbreadths, gently uneven, with weathered hollows (never a dressed face)
      let n = 0.86 + 0.08 * Math.sin(x * 2.9 + z * 1.3) + 0.05 * Math.sin(x * 6.7 - z * 4.9) + 0.03 * Math.sin(z * 11.3 + x * 2.1);
      for (const [bx, bz, br] of bumps) n -= 0.22 * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (br * br * 0.2));
      const edge = 1 - smooth(0.9, 1.0, rr);                      // the short steep side all round
      let y = H0 * clamp(n, 0.55, 1) * edge;
      if (rr >= 1) y = -0.02;
      p.setY(i, y);
      // pale limestone on top, a darker band down its sides (the edge in shade), a little warmth in the hollows
      const shade = rr >= 1 ? 0.5 : 0.5 + 0.5 * (1 - smooth(0.82, 0.99, rr)), warm = clamp(1 - n, 0, 0.3);
      col[i * 3] = shade * (1 - warm * 0.1); col[i * 3 + 1] = shade * (1 - warm * 0.16); col[i * 3 + 2] = shade * (1 - warm * 0.3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    // (finer rock detail than one texture stretched over the whole stone)
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.7, uv.getY(i) * 1.4);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g.translate(PL.EVEN_SHTIYA.x, FLOOR + 0.01, PL.EVEN_SHTIYA.z), rockMat);
    m.receiveShadow = true; m.name = 'even-shtiya';
    return m;
  })();
  innerK.add(rock);

  /* ── the vessels (one mesh) ── */
  const VP = new Parts();
  const axisEW = opts.menorahAxis !== 'ns';
  const menVariants = {};
  for (const style of ['straight', 'round']) for (const ax of ['ew', 'ns']) {
    const { gold, flames } = menorahGeos(style), grp = G['men' + (style === 'straight' ? 'S' : 'R') + (ax === 'ew' ? 'E' : 'N')];
    for (const g of gold) VP.gold(place(g, PL.MENORAH.x, PL.MENORAH.z, ax === 'ew'), grp, 0.18);
    menVariants[style + ax] = { grp, flames: flames.map(([d, y]) => (ax === 'ew' ? new THREE.Vector3(PL.MENORAH.x + d, FLOOR + y, PL.MENORAH.z) : new THREE.Vector3(PL.MENORAH.x, FLOOR + y, PL.MENORAH.z + d))) };
  }
  // the stone with three steps before the menorah, rising toward it (Tamid 3:9); sizes: illustration
  {
    const sx = PL.MENORAH_STONE.x, sz = PL.MENORAH_STONE.z;
    for (let k = 0; k < 3; k++) VP.add(boxG(sx + 0.25 - 0.5 * k, FLOOR, sz - 0.6, sx + 0.75 - 0.5 * k, FLOOR + 0.3 * (k + 1), sz + 0.6), '#E9E1D0', 0, 0.42, G.stone);
  }
  const sh = shulchanGeos();
  for (const g of sh.gold) VP.gold(place(g, PL.SHULCHAN.x, PL.SHULCHAN.z), G.shulchan, 0.24);
  const crust = ['#C98E52', '#BF8448', '#CF9660', '#C4894C', '#D29A62', '#BB8046'];
  sh.bread.forEach((g, i) => VP.add(place(g, PL.SHULCHAN.x, PL.SHULCHAN.z), crust[i % 6], 0, 0.8, G.bread));
  for (const g of sh.bez) VP.gold(place(g, PL.SHULCHAN.x, PL.SHULCHAN.z), G.bez, 0.22);
  for (const g of sh.lev) VP.add(place(g, PL.SHULCHAN.x, PL.SHULCHAN.z), '#EDE4CC', 0, 0.7, G.bez);
  const ga = goldAltarGeos();
  for (const g of ga.gold) VP.gold(place(g, PL.GOLD_ALTAR.x, PL.GOLD_ALTAR.z), G.altar, 0.22);
  for (const g of ga.coals) VP.add(place(g, PL.GOLD_ALTAR.x, PL.GOLD_ALTAR.z), '#7A2A12', 0, 0.9, G.coals);
  const vessels = new THREE.Mesh(mergeGeometries(VP.list), vesselMat);
  vessels.name = 'vessels'; vessels.castShadow = false; vessels.receiveShadow = true;
  inner.add(vessels);

  /* ── the parochot ── */
  const parG = parochetGeometry();
  const parochot = new THREE.Mesh(parG, fabricMat);
  parochot.name = 'parochot'; parochot.receiveShadow = true; parochot.frustumCulled = false;
  inner.add(parochot);

  /* ── the doors: four leaves, two opening into the doorway, two into the house (Middot 4:1) ── */
  const doors = new THREE.InstancedMesh(doorLeafGeometry(), doorMat, 4);
  doors.name = 'heichal-doors'; doors.castShadow = true; doors.receiveShadow = true; doors.frustumCulled = false;
  root.add(doors);
  // the two wickets of the great gate, on the Ulam's side of its wall: the northern one, by which the opener went in to the
  // cell and from it into the Heichal, and the southern one, by which no man ever entered (Middot 4:2; Tamid 3:7). Their
  // size and exact place beside the gate: illustration. One mesh (the doors' material).
  const WICKET = { x: H.x1 + 6, z: 7.9, w: 2.4, h: 5.6 };
  const wickets = (() => {
    const parts = [];
    for (const s of [-1, 1]) {
      const z0 = s * WICKET.z - WICKET.w / 2, z1 = s * WICKET.z + WICKET.w / 2, x = WICKET.x;
      parts.push(boxG(x + 0.02, FLOOR, z0, x + 0.16, FLOOR + WICKET.h, z1));                                    // the leaf
      parts.push(boxG(x, FLOOR + WICKET.h, z0 - 0.3, x + 0.3, FLOOR + WICKET.h + 0.35, z1 + 0.3));              // lintel
      parts.push(boxG(x, FLOOR, z0 - 0.3, x + 0.3, FLOOR + WICKET.h, z0), boxG(x, FLOOR, z1, x + 0.3, FLOOR + WICKET.h, z1 + 0.3));
      for (const y of [1.2, 2.9, 4.5]) parts.push(boxG(x + 0.16, FLOOR + y, z0 + 0.12, x + 0.22, FLOOR + y + 0.14, z1 - 0.12));
      parts.push(new THREE.SphereGeometry(0.11, 8, 6).translate(x + 0.26, FLOOR + 2.6, s * WICKET.z - s * 0.8));   // the ring
    }
    const g = mergeGeometries(parts.map(clean)), P = g.attributes.position, uv = new Float32Array(P.count * 2);
    for (let i = 0; i < P.count; i++) { uv[i * 2] = P.getZ(i) / 2.5; uv[i * 2 + 1] = P.getY(i) / 2.5; }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const m = new THREE.Mesh(g, doorMat); m.name = 'heichal-wickets'; m.castShadow = false; m.receiveShadow = true;
    root.add(m); return m;
  })();
  const HX_OUT = H.x1 + 6 - 0.22, HX_IN = H.x1 - 0.2, HZ = 4.82;   // hinge lines (x) and their distance from the axis
  // [hinge x, hinge z, angle closed, angle open]; local +X runs from the hinge toward the middle when closed
  const LEAVES = [[HX_OUT, -HZ, -Math.PI / 2, -Math.PI], [HX_OUT, HZ, Math.PI / 2, Math.PI], [HX_IN, -HZ, -Math.PI / 2, -Math.PI * 1.5], [HX_IN, HZ, Math.PI / 2, Math.PI * 1.5]];

  /* ── flames of the lamps (additive, bloom) and the ketoret cloud ── */
  const NF = 4;
  const fl = { pos: new Float32Array(7 * NF * 3), size: new Float32Array(7 * NF), alpha: new Float32Array(7 * NF), seed: new Float32Array(7 * NF).map(() => Math.random()) };
  const flG = new THREE.BufferGeometry();
  flG.setAttribute('position', new THREE.BufferAttribute(fl.pos, 3)); flG.setAttribute('size', new THREE.BufferAttribute(fl.size, 1)); flG.setAttribute('alpha', new THREE.BufferAttribute(fl.alpha, 1));
  const flameMat = particleMat(TX.texFlame(), new THREE.Color(4.2, 2.1, 0.8), true);
  const flames = new THREE.Points(flG, flameMat); flames.frustumCulled = false; flames.name = 'lamp-flames'; flames.renderOrder = 3;
  inner.add(flames);
  // the ketoret cloud: camera-facing quads (instanced; point sprites are too small on some phones for a room-filling cloud)
  const NS = 96;
  const sm = { pos: new Float32Array(NS * 3), size: new Float32Array(NS), alpha: new Float32Array(NS), age: new Float32Array(NS).fill(99), life: new Float32Array(NS), v: new Float32Array(NS * 3), room: new Uint8Array(NS) };
  const smG = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
  smG.instanceCount = NS;
  smG.setAttribute('iPos', new THREE.InstancedBufferAttribute(sm.pos, 3)); smG.setAttribute('iSize', new THREE.InstancedBufferAttribute(sm.size, 1)); smG.setAttribute('iAlpha', new THREE.InstancedBufferAttribute(sm.alpha, 1));
  for (const k of ['iPos', 'iSize', 'iAlpha']) smG.attributes[k].setUsage(THREE.DynamicDrawUsage);
  const smokeMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: TX.texPuff(9) }, color: { value: new THREE.Color('#B9AC9C') }, scale: { value: 1 } },
    vertexShader: `attribute vec3 iPos; attribute float iSize; attribute float iAlpha; varying vec2 vUv; varying float vA; varying float vD;
      void main(){ vUv = uv; vA = iAlpha; vec4 mv = modelViewMatrix * vec4(iPos, 1.0); vD = -mv.z; mv.xy += position.xy * iSize;
        gl_Position = projectionMatrix * mv; if (iAlpha < 0.002) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; varying vec2 vUv; varying float vA; varying float vD;
      void main(){ vec4 t = texture2D(map, vUv); gl_FragColor = vec4(color * t.rgb, t.a * vA * smoothstep(2.0, 9.0, vD)); }`,
    transparent: true, depthWrite: false,
  });
  const smoke = new THREE.Mesh(smG, smokeMat); smoke.frustumCulled = false; smoke.name = 'ketoret'; smoke.renderOrder = 4;
  root.add(smoke);

  /* ── one warm light rig: a point light at the lamps (moved into the Kodesh HaKodashim for that view) ── */
  const light = new THREE.PointLight('#FFB36A', 0, 46, 2);
  const LIGHT_H = new THREE.Vector3(PL.MENORAH.x + 0.5, FLOOR + 5.5, PL.MENORAH.z - 3.2), LIGHT_K = new THREE.Vector3(PL.EVEN_SHTIYA.x + 0.5, FLOOR + 9, PL.EVEN_SHTIYA.z - 1);
  light.position.copy(LIGHT_H);
  scene.add(light);

  /* ── the highlight ring (outside places; inside, the floor shader draws it) ── */
  const ringTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.74, 'rgba(255,255,255,0)'); g.addColorStop(0.88, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.45, 0.45), map: ringTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.visible = false; ring.frustumCulled = false; ring.renderOrder = 5; root.add(ring);

  /* ───────── state ───────── */
  const S = {
    lamps: [1, 1, 1, 1, 1, 1, 1], lampShow: [1, 1, 1, 1, 1, 1, 1],
    coals: 0, coalsShow: 0, smoke: 0, kSmoke: 0,
    par: { outer: 0, inner: 0 }, parShow: { outer: -1, inner: -1 },
    doors: 0, doorsShow: -1,
    bread: 'full', bez: true,
    style: opts.branchStyle === 'round' ? 'round' : 'straight', axis: axisEW ? 'ew' : 'ns',
    hi: null, hiT: 0,
    inRoom: 0, inK: 0, lastIn: false, room: 'out',
  };
  // lamp order for setLamps: index 0 = "the western lamp" as Tamid 6:1 reads with the lamps in a row east–west
  // ("שני נרות מזרחיים ... מדשן את המזרחי ומניח את המערבי"): the 2nd from the east; 1 = the easternmost; 2…6 westward.
  // With the north–south layout the western lamp is the middle one (index 0 = middle). Illustration — see the report.
  const lampOrder = () => (S.axis === 'ew' ? [1, 0, 2, 3, 4, 5, 6] : [3, 0, 1, 2, 4, 5, 6]);
  function flamePositions() {
    const v = menVariants[S.style + S.axis];
    // the seven by position along the row: east → west (ew) or north → south (ns)
    const all = v.flames.slice().sort((a, b) => (S.axis === 'ew' ? b.x - a.x : a.z - b.z));
    return lampOrder().map((k) => all[k]);
  }
  let FP = flamePositions();

  function applyVessels() {
    const vis = UV.uVis.value;
    for (const k of ['menSE', 'menRE', 'menSN', 'menRN']) vis[G[k]] = 0;
    vis[G['men' + (S.style === 'straight' ? 'S' : 'R') + (S.axis === 'ew' ? 'E' : 'N')]] = 1;
    vis[G.bread] = S.bread === 'empty' ? 0 : 1;
    vis[G.bez] = S.bez ? 1 : 0;
    vis[G.coals] = S.coalsShow > 0.01 ? 1 : 0;
    UV.uEm.value[G.coals] = 2.8 * S.coalsShow;
  }
  function applyDoors() {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
    const v = S.doorsShow, vo = clamp(v * 1.25, 0, 1), vi = clamp(v * 1.25 - 0.25, 0, 1);   // the outer pair leads a little
    const ease = (t) => t * t * (3 - 2 * t);
    LEAVES.forEach(([hx, hz, a0, a1], i) => {
      const t = ease(i < 2 ? vo : vi);
      q.setFromAxisAngle(Y, lerp(a0, a1, t)); p.set(hx, FLOOR + 0.05, hz);
      m.compose(p, q, s); doors.setMatrixAt(i, m);
    });
    doors.instanceMatrix.needsUpdate = true;
    if (ctx.requestShadow && (v === 0 || v === 1)) ctx.requestShadow();
  }
  function applyParochot() { foldParochot(parG, S.parShow.outer, S.parShow.inner); }

  applyVessels(); applyDoors(); S.doorsShow = 0; applyDoors(); S.parShow.outer = 0; S.parShow.inner = 0; applyParochot();

  /* ───────── environment for the gold (warm room + the doorway) ───────── */
  function refreshEnv(force) {
    const T = ctx.getTime ? ctx.getTime() : null;
    const day = T ? (T.night ? 0.04 : clamp(T.sunI / 3.1, 0.2, 1)) * (0.25 + 0.75 * S.doorsShow) : 0.6;
    const lamp = S.lampShow.reduce((a, b) => a + b, 0) / 7;
    const key = (Math.round(day * 8) / 8) + ':' + (Math.round(lamp * 4) / 4);
    if (!force && key === envKey) return;
    envKey = key;
    const tex = interiorEquirect(day, 0.25 + 0.75 * lamp);
    const rt = pmrem.fromEquirectangular(tex);
    tex.dispose();
    for (const m of inMats) { m.envMap = rt.texture; m.needsUpdate = m.needsUpdate || !m.userData.envSet; m.userData.envSet = true; }
    if (envRT) envRT.dispose();
    envRT = rt;
  }
  refreshEnv(true);

  /* ───────── where the camera is ───────── */
  const inHeichalRoom = (p) => p.x > K.x0 && p.x < H.x1 && Math.abs(p.z) < 10 && p.y > FLOOR && p.y < CEIL;
  const inDoorway = (p) => p.x >= H.x1 && p.x <= H.x1 + 6 && Math.abs(p.z) < 5 && p.y > FLOOR && p.y < 42;
  const inUlam = (p) => p.x > H.x1 + 6 && p.x < PL.ULAM.x1 + 5 && Math.abs(p.z) < 30 && p.y > FLOOR - 1 && p.y < PL.ULAM.y1;
  const doorC = new THREE.Vector3(H.x1 + 3, 32, 0);
  let interiorOn = false, kodeshOn = false;
  function refreshVisibility(cam) {
    const c = cam || camera, p = c.position;
    // (S.moment: the Heichal's key moment — its gold plating — is watched from inside before the stage is marked done)
    const hDone = done('heichal') || !!S.moment, kDone = done('kodesh');
    doors.visible = hDone; wickets.visible = hDone;
    const inR = inHeichalRoom(p) || inDoorway(p);
    const seeIn = S.doorsShow > 0.02 && p.x > H.x1 && p.distanceTo(doorC) < 190;
    interiorOn = hDone && (inR || seeIn || S.forceIn);
    kodeshOn = interiorOn && kDone && (inR || S.parShow.outer > 0.02 || S.parShow.inner > 0.02 || S.forceIn);
    inner.visible = interiorOn;
    innerK.visible = kodeshOn;
    // the sky's clouds and stars are drawn without depth test: inside the closed rooms they would show through the walls
    const roomIn = inHeichalRoom(p) || inDoorway(p) || inUlam(p);
    if (roomIn !== S.skyHidden) {
      S.skyHidden = roomIn;
      for (const c of ctx.clouds || []) c.visible = !roomIn;
      if (ctx.stars) { if (roomIn) ctx.stars.visible = false; else { const T = ctx.getTime ? ctx.getTime() : null; ctx.stars.visible = T ? !!T.night : true; } }
    } else if (roomIn && ctx.stars && ctx.stars.visible) ctx.stars.visible = false;
    light.intensity = interiorOn ? lightLevel() : 0;
    // the Beit HaMoked and Beit Avtinas roofs open when the camera comes close (cutaway)
    roofs(p);
  }
  // (the effects are shown here, not in onBeforeRender: the GTAO pass hides them around its own scene render)
  const SMOKE_COL = new THREE.Color('#B9AC9C');
  function fxVisibility() {
    smoke.visible = interiorOn && (S.smoke > 0.001 || S.kSmoke > 0.001 || smokeAlive > 0);
    // the cloud is unlit: its colour follows the room's light (the lamps, and the day through the doors)
    const T = ctx.getTime ? ctx.getTime() : null, lamp = S.lampShow.reduce((a, b) => a + b, 0) / 7;
    const day = T && !T.night ? 0.35 * S.doorsShow : 0;
    smokeMat.uniforms.color.value.copy(SMOKE_COL).multiplyScalar(S.room === 'kodesh' ? 0.35 : clamp(0.14 + 0.36 * lamp + day, 0.14, 0.8) * (T && T.night ? 0.8 : 1));
    ring.visible = !!S.hi && !!S.hiOut;
  }
  function lightLevel() {
    const lamp = S.lampShow.reduce((a, b) => a + b, 0) / 7;
    if (S.room === 'kodesh') return 16 + 14 * S.kSmoke;
    return (14 + 70 * lamp) * (1 + 0.04 * Math.sin(time * 9.3) + 0.03 * Math.sin(time * 15.1));
  }
  const prevOBR = scene.onBeforeRender;
  scene.onBeforeRender = function (r, s, cam, rt) { refreshVisibility(cam); if (prevOBR) prevOBR.call(this, r, s, cam, rt); };

  /* ── chamber roofs (built by temple.js into the lishka stage as their own meshes) ── */
  // (one mesh for both roofs: it opens when the camera is close to either chamber)
  const ROOF_AT = [[new THREE.Vector3((PL.BEIT_HAMOKED.x0 + PL.BEIT_HAMOKED.x1) / 2, 20, (PL.BEIT_HAMOKED.z0 + PL.BEIT_HAMOKED.z1) / 2), 150],
    [new THREE.Vector3((PL.BEIT_AVTINAS.x0 + PL.BEIT_AVTINAS.x1) / 2, PL.BEIT_AVTINAS.y0, (PL.BEIT_AVTINAS.z0 + PL.BEIT_AVTINAS.z1) / 2), 120]];
  let roofMesh, wallMesh;
  function roofs(p) {
    if (roofMesh === undefined) { const g = scene.getObjectByName('stage-lishka'); if (!g) return; roofMesh = g.children.find((o) => o.name === 'roofCut') || null; }
    if (roofMesh) roofMesh.visible = !!(S.roofsShut || ROOF_AT.every(([c, d]) => p.distanceTo(c) > d));
    // the piece of the azara's north wall where Beit HaMoked stands: shown until Beit HaMoked is built (temple.js)
    if (wallMesh === undefined) { const g = scene.getObjectByName('stage-wall'); if (g) wallMesh = g.children.find((o) => o.name === 'wallMoked') || null; }
    if (wallMesh) wallMesh.visible = !done('lishka');
  }

  /* ───────── animation ───────── */
  let smokeAlive = 0;
  const RND = rng(99);
  function spawnSmoke(i, room) {
    const k = i * 3;
    sm.room[i] = room;
    if (room === 0) { sm.pos[k] = PL.GOLD_ALTAR.x + (RND() - 0.5) * 0.5; sm.pos[k + 1] = FLOOR + 2.2; sm.pos[k + 2] = PL.GOLD_ALTAR.z + (RND() - 0.5) * 0.5; }
    else { sm.pos[k] = PL.EVEN_SHTIYA.x + (RND() - 0.5) * 1.5; sm.pos[k + 1] = FLOOR + 1.2; sm.pos[k + 2] = PL.EVEN_SHTIYA.z + (RND() - 0.5) * 1.5; }
    sm.v[k] = (RND() - 0.5) * 0.6; sm.v[k + 1] = 1.2 + RND() * 1.2; sm.v[k + 2] = (RND() - 0.5) * 0.6;
    sm.age[i] = 0; sm.life[i] = 9 + RND() * 7;
  }
  function updateSmoke(dt) {
    smokeAlive = 0;
    const lvl = [S.smoke, S.kSmoke];
    for (let i = 0; i < NS; i++) {
      const k = i * 3;
      if (sm.age[i] >= sm.life[i]) {
        // re-spawn at a rate that follows the level (room 0 = the Heichal, 1 = the Kodesh HaKodashim)
        const room = i % 3 === 0 ? 1 : 0, L = lvl[room];
        if (L > 0.001 && RND() < dt * 3 * L) spawnSmoke(i, room); else { sm.alpha[i] = 0; continue; }
      }
      smokeAlive++;
      sm.age[i] += dt;
      const u = sm.age[i] / sm.life[i], room = sm.room[i];
      // rise, slow down under the ceiling and spread through the room
      sm.v[k + 1] *= 1 - dt * 0.25;
      sm.v[k] += (RND() - 0.5) * dt * 0.8; sm.v[k + 2] += (RND() - 0.5) * dt * 0.8;
      sm.pos[k] += sm.v[k] * dt; sm.pos[k + 1] += sm.v[k + 1] * dt; sm.pos[k + 2] += sm.v[k + 2] * dt;
      const x0 = room ? K.x0 + 2 : PL.AMAH_TRAKSIN.x1 + 1.5, x1 = room ? K.x1 - 1 : H.x1 - 2;
      if (sm.pos[k] < x0 || sm.pos[k] > x1) { sm.v[k] *= -0.5; sm.pos[k] = clamp(sm.pos[k], x0, x1); }
      if (Math.abs(sm.pos[k + 2]) > 8.5) { sm.v[k + 2] *= -0.5; sm.pos[k + 2] = clamp(sm.pos[k + 2], -8.5, 8.5); }
      if (sm.pos[k + 1] > WALL - 3) { sm.v[k + 1] = Math.min(sm.v[k + 1], 0); sm.pos[k + 1] = WALL - 3; sm.v[k] += (RND() - 0.5) * dt * 2; }
      sm.size[i] = 2.5 + u * (room ? 9 : 13);
      sm.alpha[i] = Math.sin(Math.PI * u) * 0.085 * clamp(lvl[room] * 1.3, 0.25, 1);
    }
    const A = smG.attributes; A.iPos.needsUpdate = A.iSize.needsUpdate = A.iAlpha.needsUpdate = true;
  }
  function updateFlames() {
    for (let l = 0; l < 7; l++) {
      const P = FP[l], L = S.lampShow[l];
      for (let j = 0; j < NF; j++) {
        const i = l * NF + j, s = fl.seed[i], ph = time * (7 + s * 5) + s * 40;
        fl.pos[i * 3] = P.x + Math.sin(ph) * 0.012; fl.pos[i * 3 + 1] = P.y + 0.07 + j * 0.035 + Math.sin(ph * 1.3) * 0.01; fl.pos[i * 3 + 2] = P.z + Math.cos(ph * 0.9) * 0.012;
        fl.size[i] = L * (0.34 - j * 0.05) * (0.9 + 0.1 * Math.sin(ph * 2.1));
        fl.alpha[i] = L > 0.01 ? 0.85 - j * 0.12 : 0;
      }
    }
    const A = flG.attributes; A.position.needsUpdate = A.size.needsUpdate = A.alpha.needsUpdate = true;
  }

  /* ───────── the camera: walking in and out ───────── */
  const V3 = (a) => new THREE.Vector3(...a);
  const EYE = FLOOR + 3.6;
  const PATH = {
    // (the 22 amot between the altar and the Ulam are all steps: the walk comes round the altar's north side)
    steps: [[-46, 22.5, -26.5], [-82, 28, -6]],
    corner: [[-58, 23.3, -23], [-90, 29, -4]],
    stair: [[-63.5, 24.6, -7], [-92, 29, 0]],
    top: [[-71, EYE + 0.2, 0], [-100, 28.5, 0]],
    ulam: [[-78.2, EYE - 0.2, 9.5], [-92, 29, -2.5]],
    // (portrait screens: up at the top of the doorway and the golden vine over it — a phone's narrow frame cannot hold the
    // whole 20-amah doorway from inside the 11-amah Ulam)
    ulamTall: [[-77.4, 34, 0.8], [-92, 44, 0]],
    door: [[-95, EYE, 0], [-120, 26, 0]],
    heichal: [[-108, EYE + 1.2, 0.4], [-124, FLOOR + 1.9, 0.6]],
    // (portrait screens: on the axis from the doorway, so the Shulchan, the golden altar and the Menorah all fit whole in the
    // narrow frame — a phone's width holds ±16°)
    heichalTall: [[-92.6, EYE + 2.4, 0], [-124, FLOOR + 1.6, 0]],
    parochet: [[-131, EYE + 0.4, 3], [-137.5, 27, 6]],
    // (wave 4, QA P2-18: from the north-west corner, a little lower and farther back, so the whole Even HaShtiya sits in the
    // lower middle of the frame with the Kohen Gadol and the parochot behind it — measured with the wide screens' side panel)
    kodesh: [[-155, FLOOR + 6, -4], [-148, FLOOR + 1, 0.5]],   // (the target stays inside the room: the controls need it)
    // (portrait screens: from the west wall, the Even HaShtiya in the middle and the parochot behind it; wave 4: higher, so the
    // whole rock and the Kohen Gadol east of it sit above the panel with the room's 64° lens)
    kodeshTall: [[-158.5, FLOOR + 13, 1.6], [-148, FLOOR + 1.5, 0]],
  };
  const kodeshPose = () => (camera.aspect < 0.8 ? PATH.kodeshTall : PATH.kodesh);
  let walk = null;
  const heichalPose = () => (camera.aspect < 0.8 ? PATH.heichalTall : PATH.heichal);
  const ulamPose = () => (camera.aspect < 0.8 ? PATH.ulamTall : PATH.ulam);
  // a touch or a click stops a walk or a tween where it is (the promise resolves false)
  renderer.domElement.addEventListener('pointerdown', () => {
    if (walk && !walk.waiting) { const r = walk.resolve; clearTimeout(walk.bk); walk = null; r(false); }
    if (tween) { const r = tween.resolve; clearTimeout(tween.bk); tween = null; r(false); }
  });
  const fade = (() => { let el = null; return (a) => { if (typeof document === 'undefined') return; if (!el) { el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;background:#050302;opacity:0;pointer-events:none;z-index:1'; document.body.appendChild(el); } el.style.opacity = String(a); }; })();
  function setControlsInside(on) {
    if (!controls) return;
    // inside: close to the target, no idle rotation, and free to look up (the world's orbit stops just above the horizon)
    if (on) { if (S.savedCtl == null) S.savedCtl = [controls.minDistance, controls.maxDistance, controls.autoRotateSpeed, controls.maxPolarAngle]; controls.minDistance = 0.3; controls.maxDistance = 90; controls.autoRotateSpeed = 0; controls.maxPolarAngle = Math.PI * 0.86; }
    else if (S.savedCtl) { [controls.minDistance, controls.maxDistance, controls.autoRotateSpeed, controls.maxPolarAngle] = S.savedCtl; S.savedCtl = null; }
  }
  function poseNow() { return [camera.position.toArray(), controls ? controls.target.toArray() : camera.position.clone().add(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)).toArray()]; }
  const cancelFly = () => { if (ctx.cancelFly) ctx.cancelFly(); };
  function setPose(p, t) {
    cancelFly();
    const pv = V3(p);
    if (inHeichalRoom(pv) || inDoorway(pv) || inUlam(pv)) setControlsInside(true);
    camera.position.copy(pv); if (controls) { controls.target.set(t[0], t[1], t[2]); controls.update(); } else camera.lookAt(t[0], t[1], t[2]);
  }
  /* ── on time (World agent, wave 3) ──
   * Walks, tweens, waits and the fade used to advance only by update(dt). The loop clamps dt per frame (0.05, or
   * __DT_MAX in tests), so under SwiftShader — 2–3 s a frame — a 1.6 s focus took several seconds of wall clock (the
   * integration run's 6.9 s timeout), and with a paused loop it never ended. Now each of them runs on the wall clock too
   * (its progress is the larger of simulation time and real time since it began, as main.js's flights do), and a
   * wall-clock backstop finishes it (snaps to its end) and resolves if no frame comes at all. */
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const backstop = (sec, fn) => setTimeout(fn, (Math.max(0, sec) * 1.25 + 1.5) * 1000);
  // a walk: legs of [pos, target] keyframes along Catmull-Rom curves; `at` callbacks when a key is reached
  function finishWalk(w) {
    if (walk !== w) return;
    for (const k in w.holds) { const h = w.holds[k]; if (!h.done) { h.done = true; if (h.act) h.act(true); } }
    const p = w.P.getPointAt(1), t = w.T.getPointAt(1);
    camera.position.copy(p); if (controls) { controls.target.copy(t); controls.update(); } else camera.lookAt(t);
    walk = null; if (w.end) w.end(); w.resolve(true);
  }
  function startWalk(keys, { ms, speed = 7.5, holds = {}, end = null, maxSec = 14 } = {}) {
    if (walk && walk.resolve) walk.resolve(false);
    return new Promise((resolve) => {
      if (ms === 0) {
        for (const k in holds) if (holds[k].act) holds[k].act(true);
        const last = keys[keys.length - 1]; setControlsInside(true); setPose(last[0], last[1]); if (end) end(); resolve(true); return;
      }
      const P = new THREE.CatmullRomCurve3(keys.map((k) => V3(k[0])), false, 'centripetal'), T = new THREE.CatmullRomCurve3(keys.map((k) => V3(k[1])), false, 'centripetal');
      const len = P.getLength(), dur = ms != null ? ms / 1000 : clamp(len / speed, 1.2, maxSec);
      // the fraction of the path at each key (for holds)
      const lens = P.getLengths(keys.length * 40), fr = keys.map((_, i) => lens[Math.round(i * 40)] / len);
      const w = walk = { P, T, dur, t: 0, u: 0, resolve, holds, fr, end, waiting: null, w0: nowMs(), held: 0 };
      // (a door hold adds at most the doors' own 1.8 s)
      w.bk = backstop(dur + (Object.keys(holds).length ? 1.8 : 0), () => finishWalk(w));
      cancelFly(); setControlsInside(true);
    });
  }
  function stepWalk(dt) {
    const w = walk; if (!w) return;
    if (w.waiting) {
      // a hold (the doors opening) ends when its condition is met — or after the doors' own time on the wall clock
      if (!w.waitW0) w.waitW0 = nowMs();
      const late = nowMs() - w.waitW0 > 1900;
      if (w.waiting() || late) { if (late) { S.doorsShow = S.doors; applyDoors(); } w.held += nowMs() - w.waitW0; w.waitW0 = 0; w.waiting = null; } else return;
    }
    w.t = Math.max(w.t + dt, (nowMs() - w.w0 - w.held) / 1000);
    const lin = clamp(w.t / w.dur, 0, 1), u = lin < 0.5 ? 2 * lin * lin : 1 - Math.pow(-2 * lin + 2, 2) / 2;
    for (const k in w.holds) {
      const h = w.holds[k];
      if (!h.done && u >= w.fr[k] - 1e-4) { h.done = true; if (h.act) h.act(false); if (h.until) { w.waiting = h.until; w.u = u; } }
    }
    w.u = u;
    const p = w.P.getPointAt(u), t = w.T.getPointAt(u);
    camera.position.copy(p); if (controls) { controls.target.copy(t); } else camera.lookAt(t);
    if (lin >= 1) { walk = null; clearTimeout(w.bk); if (w.end) w.end(); w.resolve(true); }
  }
  // a pose tween (for focus inside, and the kodesh-view fade)
  let tween = null;
  function tweenTo(p, t, ms, keepIn = true) {
    if (tween && tween.resolve) { clearTimeout(tween.bk); tween.resolve(false); }
    return new Promise((resolve) => {
      const [p0, t0] = poseNow();
      if (!ms) { tween = null; setPose(p, t); resolve(true); return; }
      const w = tween = { p0: V3(p0), t0: V3(t0), p1: V3(p), t1: V3(t), dur: ms / 1000, s: 0, resolve, w0: nowMs() };
      w.bk = backstop(w.dur, () => { if (tween !== w) return; tween = null; camera.position.copy(w.p1); if (controls) { controls.target.copy(w.t1); controls.update(); } else camera.lookAt(w.t1); w.resolve(true); });
      cancelFly(); if (keepIn) setControlsInside(true);
    });
  }
  function stepTween(dt) {
    const w = tween; if (!w) return;
    w.s = Math.max(w.s + dt, (nowMs() - w.w0) / 1000); const lin = clamp(w.s / w.dur, 0, 1), e = lin < 0.5 ? 4 * lin ** 3 : 1 - Math.pow(-2 * lin + 2, 3) / 2;
    camera.position.lerpVectors(w.p0, w.p1, e); if (controls) controls.target.lerpVectors(w.t0, w.t1, e);
    if (lin >= 1) { tween = null; clearTimeout(w.bk); w.resolve(true); }
  }
  // a timed wait inside update (for flights driven by main.js, which run on the wall clock)
  const waits = [];
  const waitFor = (sec) => new Promise((r) => {
    const W = { t: sec, r, w0: nowMs(), sec };
    W.bk = backstop(sec, () => { const i = waits.indexOf(W); if (i >= 0) { waits.splice(i, 1); r(true); } });
    waits.push(W);
  });

  const openDoors = (instant) => { S.doors = 1; if (instant) { S.doorsShow = 1; applyDoors(); } };
  // the walk from where the camera is: the keys still ahead (west of it), a door hold in the Ulam
  const ULAM_AXIS = [[-85.5, EYE, 0], [-99, 29.5, 0]];
  function routeIn(room, from) {
    const keys = [], holds = {};
    const [p0, t0] = from || poseNow();
    keys.push([p0, t0]);
    const seq = room === 'ulam' ? ['steps', 'corner', 'stair', 'top', 'ulam'] : ['steps', 'corner', 'stair', 'top', 'ulam', 'door', 'heichal'];
    for (const k of seq) {
      const key = k === 'heichal' ? heichalPose() : k === 'ulam' ? (room !== 'ulam' ? ULAM_AXIS : ulamPose()) : PATH[k];
      if (key[0][0] > p0[0] - 1.5 && k !== seq[seq.length - 1]) continue;
      keys.push(key);
      if (k === 'ulam' && room !== 'ulam') holds[keys.length - 1] = { act: openDoors, until: () => S.doorsShow > 0.8 };
    }
    return { keys, holds };
  }
  // far away: first a flight to the foot of the steps
  const approach = (ms, brisk) => {
    const p = camera.position;
    if (ms === 0 || p.distanceTo(V3(PATH.steps[0])) < 70 || inUlam(p) || inHeichalRoom(p) || inDoorway(p)) return Promise.resolve(true);
    return tweenTo(PATH.steps[0], PATH.steps[1], brisk ? 1400 : clamp(p.distanceTo(V3(PATH.steps[0])) * 5, 1800, 3600), false);
  };
  // a quick focus cuts short a walk or a move still under way (its promise resolves false), so the camera stays where it is put
  function stopMotion() {
    if (walk) { const w = walk; walk = null; clearTimeout(w.bk); w.resolve(false); }
    if (tween) { const w = tween; tween = null; clearTimeout(w.bk); w.resolve(false); }
  }
  // a respectful cut: fade to dark, move, fade back (the Kodesh HaKodashim view; a quick focus from outside; the wicket)
  function fadeCut(go, instant) {
    if (instant) { go(); return Promise.resolve(true); }
    return new Promise((resolve) => {
      fade(0); let t = 0, swapped = false;
      const w0 = nowMs();
      const me = (dt) => {
        t = Math.max(t + dt, (nowMs() - w0) / 1000);
        if (t < 0.6) fade(t / 0.6);
        else if (!swapped) { swapped = true; go(); fade(1); }
        else if (t < 1.4) fade(1 - (t - 0.8) / 0.6);
        else { fade(0); fadeAnim = null; clearTimeout(bk); resolve(true); }
      };
      const bk = backstop(1.4, () => { if (fadeAnim !== me) return; if (!swapped) go(); fade(0); fadeAnim = null; resolve(true); });
      fadeAnim = me;
    });
  }
  // the opener's way in (Tamid 3:7; Middot 4:2): to the northern wicket in the Ulam, "נכנס לתא, ומן התא אל ההיכל" (a cut — the
  // cell is not modelled), and inside, before the great gate, still shut; it opens from inside. ⚑ an option for the owner:
  // enter('heichal', { via: 'wicket' }). The promise resolves when the gate stands open.
  const WICKET_POSE = [[H.x1 + 10.5, EYE - 0.3, -3.2], [WICKET.x, FLOOR + 3.4, -WICKET.z]];
  const gatePose = () => (camera.aspect < 0.8 ? FOCUS['heichal-gate-tall'] : FOCUS['heichal-gate']);
  function enterByWicket(o = {}) {
    if (o.ms === 0) { S.doors = 1; S.doorsShow = 1; applyDoors(); S.room = 'heichal'; setControlsInside(true); setPose(...gatePose()); return Promise.resolve(true); }
    S.doors = 0;
    const toUlam = inUlam(camera.position) ? tweenTo(...WICKET_POSE, 900) : approach(o.ms).then(() => { const r = routeIn('ulam'); r.keys[r.keys.length - 1] = WICKET_POSE; return startWalk(r.keys, { ms: o.ms }); });
    return toUlam
      .then(() => fadeCut(() => { S.doorsShow = 0; applyDoors(); S.room = 'heichal'; setControlsInside(true); setPose(...gatePose()); }))
      .then(() => { S.doors = 1; return waitFor(2.1); })
      .then(() => true);
  }
  function enter(room = 'heichal', o = {}) {
    // (o.force, wave 4: the Heichal's gold-polishing moment looks inside while the stage is still finishing — stages.js
    // momentFX('inside', 'heichal'); the house stands complete by then, only the stage is not yet marked done)
    if (o.force && !done('heichal')) S.moment = true;
    if (!done('heichal') && !S.moment) return Promise.resolve(false);
    if (room === 'heichal' && o.via === 'wicket' && S.room !== 'heichal' && S.room !== 'kodesh') { S.hi = null; return enterByWicket(o); }
    if (room !== 'ulam' && room !== 'heichal' && room !== 'kodesh-view') room = 'heichal';
    S.hi = null;
    const p = camera.position;
    // already inside the Heichal: go straight to the target pose
    if (room === 'kodesh-view') {
      if (S.room === 'kodesh') return Promise.resolve(true);
      const inside = inHeichalRoom(p) && p.x > K.x1;
      const pre = inside || o.ms === 0 ? Promise.resolve(true) : approach(o.ms).then(() => { const r = routeIn('heichal'); return startWalk(r.keys, { ms: o.ms, holds: r.holds }); });
      return pre.then(() => (o.ms === 0 ? (openDoors(true), true) : tweenTo(...PATH.parochet, 1600))).then(() => kodeshCut(true, o.ms === 0));
    }
    if (S.room === 'kodesh') return kodeshCut(false, o.ms === 0).then(() => enter(room, o));
    if (inHeichalRoom(p) && room === 'heichal') { S.room = 'heichal'; return tweenTo(...heichalPose(), o.ms === 0 ? 0 : 1400); }
    // with no duration asked for, the walk-in is brisk (the doors open as it starts; at most ~5 s in all), so it answers
    // within the gameplay's 6 s (ketoret.js enters without a duration); the tour and the mini-games that pass ms are unchanged
    const brisk = o.ms === undefined;
    if (brisk && room !== 'ulam') S.doors = 1;
    return approach(o.ms, brisk).then(() => { const r = routeIn(room); return startWalk(r.keys, { ms: o.ms, holds: r.holds, maxSec: brisk ? 3.4 : 14, end: () => { S.room = room; } }); });
  }
  // the watch-only view of the Kodesh HaKodashim (Yom Kippur): a respectful cut (fade) — the camera does not walk in
  function kodeshCut(inside, instant) {
    const go = () => {
      if (inside) { S.room = 'kodesh'; S.parBefore = { ...S.par }; S.par.outer = S.par.inner = 1; S.parShow.outer = S.parShow.inner = 1; applyParochot(); setPose(...kodeshPose()); }
      else { S.room = 'heichal'; if (S.parBefore) { Object.assign(S.par, S.parBefore); S.parBefore = null; } setPose(...PATH.parochet); }
      setControlsInside(true);
    };
    return fadeCut(go, instant);
  }
  let fadeAnim = null;
  function exit(o = {}) {
    const p = camera.position, keys = [];
    const run = () => {
      const [p0, t0] = poseNow();
      keys.length = 0; keys.push([p0, t0]);
      // the keys still ahead (east of the camera), then the steps
      for (const k of [PATH.door, [[-86, EYE, 0], [-60, 26, 0]], [[-71, EYE + 0.4, 0], [-40, 25, 0]]]) if (k[0][0] > p0[0] + 1.5) keys.push(k);
      keys.push([PL.SHOTS.ulamSteps.p, PL.SHOTS.ulamSteps.t]);
      // (the way out is brisk: at most 4 s, so exit() answers within the gameplay's 6 s even from the Kodesh view)
      return startWalk(keys, { ms: o.ms, maxSec: 4, end: () => { S.room = 'out'; S.moment = false; setControlsInside(false); } });
    };
    if (S.room === 'kodesh' || (inHeichalRoom(p) && p.x < K.x1)) return kodeshCut(false, o.ms === 0).then(run);
    return run();
  }

  /* ───────── focus / highlight / pick ───────── */
  const B3 = (x0, y0, z0, x1, y1, z1) => new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
  const PICKS = [
    { id: 'menorah', box: B3(PL.MENORAH.x - 1.35, FLOOR, PL.MENORAH.z - 1.35, PL.MENORAH.x + 1.35, FLOOR + 3.2, PL.MENORAH.z + 1.35), in: true, grp: 'men' },
    { id: 'menorah-stone', box: B3(PL.MENORAH_STONE.x - 1.75, FLOOR, PL.MENORAH_STONE.z - 0.6, PL.MENORAH_STONE.x + 0.75, FLOOR + 0.9, PL.MENORAH_STONE.z + 0.6), in: true, grp: 'stone' },
    { id: 'shulchan', box: B3(PL.SHULCHAN.x - 1.1, FLOOR, PL.SHULCHAN.z - 0.75, PL.SHULCHAN.x + 1.1, FLOOR + 3.8, PL.SHULCHAN.z + 0.75), in: true, grp: 'shulchan' },
    { id: 'gold-altar', box: B3(PL.GOLD_ALTAR.x - 0.6, FLOOR, PL.GOLD_ALTAR.z - 0.6, PL.GOLD_ALTAR.x + 0.6, FLOOR + 2.3, PL.GOLD_ALTAR.z + 0.6), in: true, grp: 'altar' },
    { id: 'parochet', box: B3(PL.AMAH_TRAKSIN.x0 - 0.5, FLOOR, -10, PL.AMAH_TRAKSIN.x1 + 0.5, WALL, 10), in: true },
    { id: 'even-shtiya', box: B3(PL.EVEN_SHTIYA.x - 3.2, FLOOR, PL.EVEN_SHTIYA.z - 2.6, PL.EVEN_SHTIYA.x + 3.2, FLOOR + 0.4, PL.EVEN_SHTIYA.z + 2.6), in: true, kodesh: true },
    { id: 'upper-openings', box: B3(K.x0, CEIL - 1.5, -2, K.x1, 67, 2), in: true, kodesh: true },
    { id: 'heichal-doors', box: B3(H.x1 - 0.6, FLOOR, -5.2, H.x1 + 6.2, 42, 5.2), stage: 'heichal', out: true },
    { id: 'heichal-in', box: B3(PL.AMAH_TRAKSIN.x1, FLOOR, -10, H.x1, CEIL, 10), in: true, last: true },
    { id: 'ulam-tables', box: B3(PL.ULAM_TABLES.marble.x - 1.2, FLOOR, PL.ULAM_TABLES.marble.z - 0.8, PL.ULAM_TABLES.gold.x + 1.2, FLOOR + 1.8, PL.ULAM_TABLES.marble.z + 0.8).union(B3(PL.ULAM_TABLES.gold.x - 1.2, FLOOR, PL.ULAM_TABLES.gold.z - 0.8, PL.ULAM_TABLES.gold.x + 1.2, FLOOR + 1.8, PL.ULAM_TABLES.gold.z + 0.8)), stage: 'ulam', out: true, near: 160 },
    { id: 'ulam-chains', box: B3(-89, 30, -25, -84, 95, 25), stage: 'ulam', out: true, near: 200, last: true },
    { id: 'kiyor', box: B3(PL.KIYOR.x - 3, 16, PL.KIYOR.z - 3, PL.KIYOR.x + 3, PL.KIYOR.rim + 1, PL.KIYOR.z + 3), stage: 'kiyor', out: true },
    { id: 'mechanism', box: B3(PL.KIYOR.x - 2.5, 16, PL.KIYOR.z + 3, PL.KIYOR.x + 2.5, 30, PL.KIYOR.z + 7.5).union(B3(PL.KIYOR.x - 1.2, 28, PL.KIYOR.z - 4, PL.KIYOR.x + 1.2, 31, PL.KIYOR.z + 4)), stage: 'kiyor', out: true },
    { id: 'lambs', box: B3(PL.LAMBS_CHAMBER.x0, 16, PL.LAMBS_CHAMBER.z0, PL.LAMBS_CHAMBER.x1, 26, PL.LAMBS_CHAMBER.z1), stage: 'lishka', out: true, near: 170 },
    { id: 'moked-bakers', box: B3(-153, 16, -67.5, -143, 26, -59), stage: 'lishka', out: true, near: 170 },
    { id: 'moked-stones', box: B3(-153, 16, -82, -143, 26, -73.5), stage: 'lishka', out: true, near: 170 },
    { id: 'moked-tevila', box: B3(-177, 10, -82, -167, 26, -73.5), stage: 'lishka', out: true, near: 170 },
    { id: 'avtinas', box: B3(PL.BEIT_AVTINAS.x0, PL.BEIT_AVTINAS.y0, PL.BEIT_AVTINAS.z0, PL.BEIT_AVTINAS.x1, PL.BEIT_AVTINAS.y0 + 12, PL.BEIT_AVTINAS.z1), stage: 'lishka', out: true },
    { id: 'salt', box: B3(PL.NORTH_CHAMBERS.salt.x0, 16, PL.NORTH_CHAMBERS.z0, PL.NORTH_CHAMBERS.salt.x1, 28, PL.NORTH_CHAMBERS.z1), stage: 'lishka', out: true },
    { id: 'parva', box: B3(PL.NORTH_CHAMBERS.parva.x0, 16, PL.NORTH_CHAMBERS.z0, PL.NORTH_CHAMBERS.parva.x1, 30, PL.NORTH_CHAMBERS.z1), stage: 'lishka', out: true },
    { id: 'rinse', box: B3(PL.NORTH_CHAMBERS.rinse.x0, 16, PL.NORTH_CHAMBERS.z0, PL.NORTH_CHAMBERS.rinse.x1, 28, PL.NORTH_CHAMBERS.z1), stage: 'lishka', out: true },
    { id: 'maaracha', box: B3(PL.MAARACHOT.great.x - 3, 25, PL.MAARACHOT.great.z - 3, PL.MAARACHOT.great.x + 3, 27.5, PL.MAARACHOT.great.z + 3), stage: 'karnot', out: true },
    { id: 'maaracha-ketoret', box: B3(PL.MAARACHOT.ketoret.x - 1.6, 25, PL.MAARACHOT.ketoret.z - 1.6, PL.MAARACHOT.ketoret.x + 1.6, 26.5, PL.MAARACHOT.ketoret.z + 1.6), stage: 'karnot', out: true },
    { id: 'tapuach', box: B3(PL.MAARACHOT.tapuach.x - 3.3, 25, PL.MAARACHOT.tapuach.z - 3.3, PL.MAARACHOT.tapuach.x + 3.3, 27.2, PL.MAARACHOT.tapuach.z + 3.3), stage: 'karnot', out: true },
    { id: 'shitin', box: B3(PL.SHITIN.x - 1.4, 21, PL.SHITIN.z - 1.4, PL.SHITIN.x + 1.4, 26.6, PL.SHITIN.z + 1.4), stage: 'karnot', out: true },
    { id: 'ring-slab', box: B3(-56.5, 16, 12.5, -53.5, 16.6, 15.5), stage: 'guf', out: true },
    { id: 'odd-stone', box: B3(PL.ODD_STONE.x - 0.9, 5.9, PL.ODD_STONE.z - 0.7, PL.ODD_STONE.x + 0.9, 6.3, PL.ODD_STONE.z + 0.7), stage: 'nashim', out: true, near: 120 },
    { id: 'wood-chamber', box: B3(PL.WOOD_CHAMBER.x0, 6, PL.WOOD_CHAMBER.z0, PL.WOOD_CHAMBER.x1, 20, PL.WOOD_CHAMBER.z1), stage: 'nashim', out: true, last: true },
    { id: 'deshen', box: B3(PL.DESHEN_PLACE.x - 1.8, 16, PL.DESHEN_PLACE.z - 1.8, PL.DESHEN_PLACE.x + 1.8, 17.2, PL.DESHEN_PLACE.z + 1.8), stage: 'guf', out: true },
  ];
  const byId = Object.fromEntries(PICKS.map((p) => [p.id, p]));
  const hitV = new THREE.Vector3();
  function pick(raycaster) {
    const ray = raycaster.ray, p = camera.position;
    let best = null, bd = Infinity;
    for (const P of PICKS) {
      if (P.in ? !(P.kodesh ? kodeshOn : interiorOn) : !done(P.stage)) continue;
      if (P.in && !inHeichalRoom(p) && !inDoorway(p) && !inUlam(p) && p.distanceTo(doorC) > 190) continue;
      if (P.near && p.distanceTo(P.box.getCenter(hitV)) > P.near) continue;
      if (P.box.containsPoint(ray.origin) && !P.last) continue;
      if (!ray.intersectBox(P.box, hitV)) continue;
      let d = hitV.distanceTo(ray.origin);
      if (P.last) d += 1000;                       // the room itself only when no vessel is hit
      if (d < bd) { bd = d; best = P; }
    }
    return best ? { kind: 'vessel', id: best.id, dist: best.last ? bd - 1000 : bd, box: best.box } : null;
  }
  const FOCUS = {
    menorah: [[-119.2, FLOOR + 3.2, 3.2], [-125, FLOOR + 1.9, 7.5]],
    'menorah-stone': [[-119.5, FLOOR + 2.6, 4], [-123.5, FLOOR + 0.8, 7.5]],
    shulchan: [[-119.2, FLOOR + 3.4, -3.2], [-125, FLOOR + 2, -7.5]],
    'gold-altar': [[-116.5, FLOOR + 3.3, 0.6], [-121, FLOOR + 1.5, 0]],
    parochet: [[-124, FLOOR + 6, 0], [-138, FLOOR + 12, 0]],
    'heichal-in': PATH.heichal,
    // inside the Heichal, facing the great gate (the opener's view, Tamid 3:7): the inner doors and the doorway
    'heichal-gate': [[-113, EYE + 0.6, -1.2], [-96, 29.5, 0]],
    // the way between the parochot at the south end (Yoma 5:1), and the parochet face-on at a man's height (Yoma 5:4)
    'parochot-south': [[-117, EYE + 0.6, -2.5], [-137.5, FLOOR + 3.2, 7.5]],
    'parochet-front': [[-117.5, EYE + 1.4, 2.5], [-137, FLOOR + 4.5, 0]],
    'heichal-gate-tall': [[-116.5, EYE + 1.2, -1.5], [-96, 30.5, 0]],
    'even-shtiya': PATH.kodesh, 'upper-openings': [[-141.8, FLOOR + 6.5, 8.2], [-149, CEIL, 0]],   // (portrait: kodeshTall)
    'heichal-doors': [[-72, EYE + 1, 6], [-95, 32, 0]],
    'ulam-tables': [[-80, EYE + 1.5, 0], [-89.5, FLOOR + 1, 0]],
    'ulam-chains': [[-70, 34, 0], [-87, 60, 0]],
  };
  const OUT_FOCUS = {
    kiyor: [PL.SHOTS.kiyor.p, PL.SHOTS.kiyor.t], mechanism: [[-48, 30, 34], [-63.5, 24, 23]],
    lambs: [PL.SHOTS.lambs.p, PL.SHOTS.lambs.t], 'moked-bakers': [[-128, 42, -40], [-148, 17, -63]], 'moked-stones': [[-128, 44, -52], [-148, 17, -78]], 'moked-tevila': [[-150, 46, -52], [-172, 14, -78]],
    avtinas: [[-20, 78, 100], [-38, 52, 71]], salt: [[-60, 34, -30], [-79.5, 20, -62]], parva: [[-52, 36, -28], [-70.5, 22, -62]], rinse: [[-44, 34, -30], [-61.5, 20, -62]],
    maaracha: [[-8, 36, 18], [-29.5, 25.5, -3.5]], 'maaracha-ketoret': [[-36, 34, 26], [-49.5, 25.5, 6.5]], tapuach: [[-14, 38, 16], [-38, 25.5, -3.5]],
    shitin: [[-44, 30, 26], [-53, 24, 11.5]],
    'wood-chamber': [[96, 44, -8], [121, 8, -47]], 'odd-stone': [[112, 16, -38], [120, 6, -50]], 'ring-slab': [[-46, 24, 24], [-55, 16.3, 14]], deshen: [[-16, 26, 30], [-29.3, 16.5, 18]],
  };
  // (measured on a 390×844 phone with the tour panel: the subject between the top of the screen and the panel)
  const OUT_TALL = { 'odd-stone': 1.15, avtinas: 1.0, 'wood-chamber': 1.15, kiyor: 2.8, mechanism: 2.2, lambs: 1.5, parva: 1.4 };
  const OUT_TALL_UP = { kiyor: 2.5, mechanism: 1.5 };   // (the kiyor with Ben Katin's wheel above it: aim at their middle)
  function highlight(id) {
    S.hi = id && byId[id] ? id : null; S.hiT = 0;
    const H_ = UV.uHi.value; H_.fill(0);
    U.uRing.value.w = 0; S.hiOut = false;
    if (!S.hi) return;
    const P = byId[S.hi], c = P.box.getCenter(new THREE.Vector3()), sz = P.box.getSize(new THREE.Vector3());
    if (P.grp) {
      const gs = P.grp === 'men' ? ['menSE', 'menRE', 'menSN', 'menRN'] : P.grp === 'shulchan' ? ['shulchan', 'bread', 'bez'] : P.grp === 'altar' ? ['altar', 'coals'] : [P.grp];
      for (const k of gs) H_[G[k]] = 1;
      U.uRing.value.set(c.x, c.z, Math.max(sz.x, sz.z) * 0.55 + 0.3, 1);
    } else {
      S.hiOut = true;
      ring.position.set(c.x, P.box.min.y + 0.15, c.z); ring.scale.setScalar(Math.max(sz.x, sz.z) * 0.62 + 0.8);
    }
  }
  function focus(id, ms = 1600) {
    if (FOCUS[id]) {
      const inside = inHeichalRoom(camera.position) || inDoorway(camera.position);
      const [p, t] = FOCUS[id];
      if (id === 'even-shtiya' || id === 'upper-openings') { const [kp, kt] = id === 'even-shtiya' ? kodeshPose() : [p, t]; return enter('kodesh-view', { ms: ms === 0 ? 0 : undefined }).then(() => tweenTo(kp, kt, ms)); }
      if (id === 'heichal-doors' || id === 'ulam-tables' || id === 'ulam-chains') {
        if (inside && ms && ms < 4000) return fadeCut(() => { stopMotion(); S.room = 'out'; setControlsInside(false); setPose(p, t); }).then(() => true);   // (a quick focus: a cut, on time)
        if (inside) return exit({ ms: ms === 0 ? 0 : undefined }).then(() => tweenTo(p, t, ms)); if (ctx.flyToPos && ms) { ctx.flyToPos(V3(p), V3(t), ms); return waitFor(ms / 1000); } setPose(p, t); return Promise.resolve(true);
      }
      if (id === 'heichal-gate') { const [gp, gt] = gatePose(); return (inside ? Promise.resolve(true) : enter('heichal', { ms: ms === 0 ? 0 : undefined })).then((ok) => (ok === false && !done('heichal') ? false : tweenTo(gp, gt, ms))); }
      // from outside: a quick focus (ms under 4 s) is a cut into the room, so it ends on time; a slow one walks in. (Also while
      // a walk-in is still under way: the cut ends it where the focus wants the camera.)
      if (!inside && ms && ms < 4000 && done('heichal')) {
        return fadeCut(() => { stopMotion(); openDoors(true); S.room = 'heichal'; setControlsInside(true); setPose(p, t); }).then(() => true);
      }
      // (inside already, but a walk-in still under way: it ends here, and the focus takes the camera on)
      if (inside && walk) { stopMotion(); S.room = 'heichal'; openDoors(true); }
      const pre = inside ? Promise.resolve(true) : enter('heichal', { ms: ms === 0 ? 0 : undefined });
      return pre.then((ok) => (ok === false && !done('heichal') ? false : tweenTo(p, t, ms)));
    }
    if (OUT_FOCUS[id]) {
      let [p, t] = OUT_FOCUS[id];
      // portrait phones (the panel docks at the bottom and the frame is narrow): farther and a little higher, as world.look
      // does; per place, so small things (the odd stone) stay readable
      if (typeof innerHeight !== 'undefined' && innerHeight > innerWidth) {
        const k = OUT_TALL[id] || 1.4, d = Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]), up = OUT_TALL_UP[id] || 0;
        p = [t[0] + (p[0] - t[0]) * k, t[1] + (p[1] - t[1]) * k + d * (k - 1) * 0.12 + up, t[2] + (p[2] - t[2]) * k];
        t = [t[0], t[1] + up, t[2]];
      }
      const inside = inHeichalRoom(camera.position) || inDoorway(camera.position) || inUlam(camera.position);
      // from inside the house, a quick focus (ms under 4 s) is a cut out to the place, so it ends on time; a slow one walks out
      if (inside && ms && ms < 4000) {
        return fadeCut(() => { stopMotion(); S.room = 'out'; if (S.parBefore) { Object.assign(S.par, S.parBefore); S.parBefore = null; } setControlsInside(false); setPose(p, t); }).then(() => true);
      }
      const pre = inside ? exit({ ms: ms === 0 ? 0 : undefined }) : Promise.resolve(true);
      return pre.then(() => {
        setControlsInside(false);
        if (!ms || !ctx.flyToPos) { setPose(p, t); return true; }
        ctx.flyToPos(V3(p), V3(t), ms); return waitFor(ms / 1000);
      });
    }
    return Promise.resolve(false);
  }

  /* ───────── anchor points (World agent, wave 3; for the mini-games' vessels): anchor(id) → [x, y, z] or null ─────────
   * gate (the great gate, mid-doorway) · gate-in / gate-out (its inner and outer faces, at a man's height) ·
   * wicket-north / wicket-south (Middot 4:2) · gold-altar-top (its roof, where the coals and the ketoret go) ·
   * shulchan-east / shulchan-west (the ends of the table top) · shulchan-top · shulchan-stack-east / -west (the foot of each
   * stack of six) · menorah-stone (its top step) · menorah-stone-1…3 (the three steps, low → high, Tamid 3:9) ·
   * menorah (the middle lamp; each lamp: lampPosition(i)) · parochet (the outer curtain's face) · parochot-south (the way
   * between them, Yoma 5:1) · even-shtiya · ulam-table-marble / ulam-table-gold. Positions follow places.js (illustration
   * where it says so). */
  const STK = 1 / 6 + 5 / 12;   // the stacks' centres from the table's middle (Menachot 11:5: two tefachim between them)
  const ANCHORS = {
    gate: [H.x1 + 3, FLOOR + 10, 0], 'gate-in': [H.x1 - 0.4, FLOOR + 3, 0], 'gate-out': [H.x1 + 6.4, FLOOR + 3, 0],
    'wicket-north': [WICKET.x + 0.2, FLOOR + WICKET.h / 2, -WICKET.z], 'wicket-south': [WICKET.x + 0.2, FLOOR + WICKET.h / 2, WICKET.z],
    'gold-altar-top': [PL.GOLD_ALTAR.x, FLOOR + 2.02, PL.GOLD_ALTAR.z],
    'shulchan-east': [PL.SHULCHAN.x + 1, FLOOR + 1.5, PL.SHULCHAN.z], 'shulchan-west': [PL.SHULCHAN.x - 1, FLOOR + 1.5, PL.SHULCHAN.z],
    'shulchan-top': [PL.SHULCHAN.x, FLOOR + 1.5, PL.SHULCHAN.z],
    'shulchan-stack-east': [PL.SHULCHAN.x + STK, FLOOR + 1.51, PL.SHULCHAN.z], 'shulchan-stack-west': [PL.SHULCHAN.x - STK, FLOOR + 1.51, PL.SHULCHAN.z],
    'menorah-stone': [PL.MENORAH_STONE.x - 0.5, FLOOR + 0.9, PL.MENORAH_STONE.z],
    'menorah-stone-1': [PL.MENORAH_STONE.x + 0.5, FLOOR + 0.3, PL.MENORAH_STONE.z], 'menorah-stone-2': [PL.MENORAH_STONE.x, FLOOR + 0.6, PL.MENORAH_STONE.z],
    'menorah-stone-3': [PL.MENORAH_STONE.x - 0.5, FLOOR + 0.9, PL.MENORAH_STONE.z],
    parochet: [PL.AMAH_TRAKSIN.x1 + 0.15, FLOOR + 6, 0], 'parochot-south': [PL.AMAH_TRAKSIN.x0 + 0.5, FLOOR + 2, 9.4],
    'even-shtiya': [PL.EVEN_SHTIYA.x, FLOOR + PL.EVEN_SHTIYA.h, PL.EVEN_SHTIYA.z],
    'ulam-table-marble': [PL.ULAM_TABLES.marble.x, FLOOR + 1.3, PL.ULAM_TABLES.marble.z], 'ulam-table-gold': [PL.ULAM_TABLES.gold.x, FLOOR + 1.3, PL.ULAM_TABLES.gold.z],
  };
  const ANCHOR_ALIAS = { 'golden-altar-top': 'gold-altar-top', 'gold-altar': 'gold-altar-top', 'great-gate': 'gate', 'wicket': 'wicket-north', 'shulchan-ends': 'shulchan-east', 'menorah-stone-top': 'menorah-stone' };
  function anchor(id) {
    const k = ANCHORS[id] ? id : ANCHOR_ALIAS[id];
    if (k) return ANCHORS[k].slice();
    if (id === 'menorah') { const v = FP[0]; const m = FP.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / 7); return [m.x, v.y, m.z]; }
    return null;
  }

  /* ───────── the eye inside: daylight dimmed, exposure up, a wider lens ───────── */
  function applyEye() {
    const T = ctx.getTime ? ctx.getTime() : null;
    if (T && ctx.hemi) {
      if (S.inK > 0.001 || S.lastIn) {
        ctx.hemi.intensity = T.hI * lerp(1, 0.28, S.inK);
        scene.environmentIntensity = T.envI * lerp(1, 0.5, S.inK);
        renderer.toneMappingExposure = T.exp * lerp(1, 1.18, S.inK);
        S.lastIn = S.inK > 0.001;
      }
      const tk = (T.night ? 'n' : 'd') + T.sunI;
      if (tk !== lastT.key) { lastT.key = tk; envKey = ''; }
    }
    // (the world's lens is long; in a 20-amah room it would see one vessel at a time)
    if (S.fovK > 0.001 || S.fovSet) {
      const f = lerp(baseFov, camera.aspect < 1 ? 64 : 50, S.fovK);
      if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
      S.fovSet = S.fovK > 0.001;
    }
  }

  /* ───────── the per-frame update ───────── */
  const lastT = { key: '' };
  function update(dt = 0) {
    time += dt; U.uTime.value = time;
    // eased states
    const ap = (cur, tgt, rate) => { const d = tgt - cur; return Math.abs(d) < 1e-3 ? tgt : cur + d * Math.min(1, dt * rate); };
    for (let i = 0; i < 7; i++) S.lampShow[i] = ap(S.lampShow[i], S.lamps[i], 3.5);
    const c0 = S.coalsShow; S.coalsShow = ap(S.coalsShow, S.coals, 2); if (c0 !== S.coalsShow) applyVessels();
    const d0 = S.doorsShow; if (S.doorsShow !== S.doors) { const d = S.doors - S.doorsShow; S.doorsShow = Math.abs(d) < 0.002 ? S.doors : S.doorsShow + Math.sign(d) * Math.min(Math.abs(d), dt / 1.8); }
    if (d0 !== S.doorsShow) applyDoors();
    let pc = false;
    for (const k of ['outer', 'inner']) { const t0 = S.parShow[k]; if (t0 !== S.par[k]) { const d = S.par[k] - t0; S.parShow[k] = Math.abs(d) < 0.002 ? S.par[k] : t0 + Math.sign(d) * Math.min(Math.abs(d), dt / 2.2); pc = true; } }
    if (pc) applyParochot();
    if (fadeAnim) fadeAnim(dt);
    stepWalk(dt); stepTween(dt);
    const wn = nowMs();
    for (let i = waits.length - 1; i >= 0; i--) { const W = waits[i]; W.t -= dt; if (W.t <= 0 || wn - W.w0 >= W.sec * 1000) { clearTimeout(W.bk); waits.splice(i, 1); W.r(true); } }
    // inside: the camera stays in the rooms; the daylight (hemisphere) is dimmed and the eye adapts
    const p = camera.position, inR = inHeichalRoom(p) || inDoorway(p);
    S.inK = ap(S.inK, inR ? 1 : 0, 2.5);
    S.fovK = ap(S.fovK || 0, inR || inUlam(p) ? 1 : 0, 2.5);
    if (inR && controls && controls.autoRotate) controls.autoRotate = false;
    if ((inR || inUlam(p)) && !S.savedCtl) setControlsInside(true);
    if (inR && !walk && !tween && controls) {
      const t = controls.target;
      if (!(inHeichalRoom(t) || inDoorway(t) || inUlam(t))) { setControlsInside(false); }
      else { p.x = clamp(p.x, S.room === 'kodesh' ? K.x0 + 0.5 : PL.AMAH_TRAKSIN.x1 + 0.4, H.x1 + 5.5); p.z = clamp(p.z, -9.5, 9.5); p.y = clamp(p.y, FLOOR + 0.8, WALL - 1); }
    }
    if (!inR && !inUlam(p) && S.savedCtl && !walk && !tween) { setControlsInside(false); if (S.room !== 'out') S.room = 'out'; }
    applyEye();
    if (interiorOn) {
      updateFlames();
      const lk = S.lampShow.reduce((a, b) => a + b, 0) / 7;
      fabricMat.emissive.setRGB(0.32, 0.24, 0.2).multiplyScalar(S.room === 'kodesh' ? 0.25 : 0.25 + 0.75 * lk);
      if (Math.abs(time * 2 % 1) < dt * 2 || !envKey) refreshEnv(false);
    }
    if (smoke.visible || S.smoke > 0 || S.kSmoke > 0) updateSmoke(dt);
    if (S.hi) { S.hiT += dt; if (S.hiOut) ring.material.opacity = 0.65 + 0.35 * Math.sin(S.hiT * 4); }

    refreshVisibility(camera);   // (also done just before each render, in scene.onBeforeRender)
    fxVisibility();
    // the flames' point size follows the viewport
    const ps = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    flameMat.uniforms.scale.value = ps;
    light.position.copy(S.room === 'kodesh' ? LIGHT_K : LIGHT_H);
  }

  /* ───────── public API (PROJECT.md §12) ───────── */
  const api = {
    enter, exit,
    setLamps(levels) { if (!Array.isArray(levels)) levels = new Array(7).fill(+levels || 0); for (let i = 0; i < 7; i++) S.lamps[i] = clamp(+levels[i] || 0, 0, 1); },
    setGoldAltar({ coals, smoke: s } = {}) { if (coals !== undefined) S.coals = coals ? (coals === true ? 1 : clamp(+coals, 0, 1)) : 0; if (s !== undefined) S.smoke = clamp(+s || 0, 0, 1); },
    setParochot({ outer, inner: inn } = {}) { if (outer !== undefined) S.par.outer = clamp(+outer || 0, 0, 1); if (inn !== undefined) S.par.inner = clamp(+inn || 0, 0, 1); },
    setDoors(v) { S.doors = clamp(+v || 0, 0, 1); },
    setBread(state) { S.bread = state === 'empty' ? 'empty' : 'full'; applyVessels(); },
    setBezichin(on) { S.bez = !!on; applyVessels(); },
    highlight, focus, pick, update,
    // extras
    setKodeshSmoke(v) { S.kSmoke = clamp(+v || 0, 0, 1); },
    setMenorah({ style, axis } = {}) { if (style) S.style = style === 'round' ? 'round' : 'straight'; if (axis) S.axis = axis === 'ns' ? 'ns' : 'ew'; FP = flamePositions(); applyVessels(); },
    lampPosition(i) { return FP[clamp(i | 0, 0, 6)].clone(); },
    anchor,   // (World agent, wave 3: anchor points for the vessels, see above)
    // snap every animated state to its target (tests, cuts)
    settle() {
      const p = camera.position, inR = inHeichalRoom(p) || inDoorway(p);
      S.inK = inR ? 1 : 0; S.fovK = inR || inUlam(p) ? 1 : 0; applyEye();
      refreshVisibility(camera); fxVisibility(); S.lampShow = S.lamps.slice(); S.coalsShow = S.coals; S.doorsShow = S.doors; applyDoors(); S.parShow.outer = S.par.outer; S.parShow.inner = S.par.inner; applyParochot(); applyVessels(); updateFlames(); refreshEnv(true); },
    get state() { return { lamps: S.lamps.slice(), coals: S.coals, smoke: S.smoke, kodeshSmoke: S.kSmoke, parochot: { ...S.par }, doors: S.doors, bread: S.bread, bezichin: S.bez, branchStyle: S.style, menorahAxis: S.axis, room: S.room, highlight: S.hi, interior: interiorOn, walking: !!walk || !!tween } },
    ids: PICKS.map((p) => p.id),
    fx: [flames, smoke, ring],
    places: { lamps: () => FP.map((v) => v.clone()) },
    _dbg: { inner, innerK, doors, parochot, vessels, light, flames, smoke, S, U, UV, refreshVisibility, PATH },
  };
  return api;
}
