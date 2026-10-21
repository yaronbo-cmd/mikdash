// The inner complex, laid out from Mishnah Middot. 1 unit = 1 amah.
// Axes: +x = east, -x = west, +z = south, -z = north, +y = up.
// Azara interior: x ∈ [-187, 0] (187), z ∈ [-67.5, 67.5] (135)  — Middot 5:1
// Ezrat Nashim interior: x ∈ [6, 141] (135×135)                — Middot 2:5
// Levels: Temple Mount 0 · Chel & Ezrat Nashim 6 (12 steps × ½) · Ezrat Yisrael 13.5 (15 steps × ½)
//         Ezrat Kohanim 16 (+2½, R. Eliezer b. Yaakov) · Heichal floor 22 (12 steps × ½, אוטם 6)
// Every piece is routed into one of the 15 build stages (B.stage(id)); see PROJECT.md §6.
import * as THREE from 'three';
import { rng } from './util.js';
import { mkParts, groundAO } from './batch.js';
import * as PL from './places.js';
import { BLOOD } from './avodah/works/blood.js';   // ── blooda25 ── (the ember's orange; the palette's one source)

export const COMPLEX = { x0: -193, x1: 147, z0: -73.5, z1: 73.5 };
// the Heichal's rear block is split here: heichal x ∈ [−139, −92], kodesh (Holy of Holies + its share) x ∈ [−176, −139]
export const KODESH_X = -139;
// the carved inside of the house (see buildTemple): the room's ceiling height (walls to 62, כיור band, beams to 65)
// and the openings of the upper storey over the Kodesh HaKodashim [x, z] (Middot 4:5; number and places: illustration)
export const HOUSE_IN = { floor: 22, wall: 62, ceil: 65, openings: [[-154, 0], [-149, 0], [-144, 0]] };

// b minus the axis-aligned boxes in `holes`, as a set of boxes passed to out([x0, y0, z0, x1, y1, z1])
export function carve(out, b, holes) {
  const h = holes.find((q) => q[0] < b[3] && q[3] > b[0] && q[1] < b[4] && q[4] > b[1] && q[2] < b[5] && q[5] > b[2]);
  if (!h) { out(b); return; }
  const rest = holes.filter((q) => q !== h);
  const [x0, y0, z0, x1, y1, z1] = b;
  const hx0 = Math.max(x0, h[0]), hx1 = Math.min(x1, h[3]), hy0 = Math.max(y0, h[1]), hy1 = Math.min(y1, h[4]), hz0 = Math.max(z0, h[2]), hz1 = Math.min(z1, h[5]);
  for (const p of [[x0, y0, z0, hx0, y1, z1], [hx1, y0, z0, x1, y1, z1], [hx0, y0, z0, hx1, hy0, z1], [hx0, hy1, z0, hx1, y1, z1],
    [hx0, hy0, z0, hx1, hy1, hz0], [hx0, hy0, hz1, hx1, hy1, z1]]) if (p[3] - p[0] > 1e-4 && p[4] - p[1] > 1e-4 && p[5] - p[2] > 1e-4) carve(out, p, rest);
}

export function buildTemple(B, P) {
  const { box, cornice, wall, door, gate } = mkParts(B);
  const S = (id) => B.stage(id);

  /* ───────── Chel podium + its 12 steps ───────── */
  S('sorag');
  const cx0 = -203, cx1 = 157, cz0 = -83.5, cz1 = 83.5;
  box('ash', cx0, 0, cz0, cx1, 5.75, cz1);
  box('pave', cx0, 5.75, cz0, cx1, 6, cz1, -999);
  for (let i = 0; i < 11; i++) { const e = 5.5 - 0.5 * i; box('pave', cx0 - e, 0.5 * i, cz0 - e, cx1 + e, 0.5 * (i + 1), cz1 + e, -999); }
  P('chel', cx0 - 9, 0, cz0 - 9, cx1 + 9, 6, cz1 + 9);

  /* ───────── Soreg: lattice, 10 tefachim ───────── */
  const sH = 1.67, s0x = -211, s1x = 165, s0z = -91.5, s1z = 91.5;
  const posts = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 4));
    for (let k = 0; k <= n; k++) { const px = ax + (bx - ax) * k / n, pz = az + (bz - az) * k / n; box('wmarble', px - 0.22, 0, pz - 0.22, px + 0.22, sH + 0.2, pz + 0.22, -999); }
  };
  const runX = (a, b, z) => { if (b - a < 0.6) return; box('lattice', a, 0, z - 0.12, b, sH - 0.12, z + 0.12, -999); box('wmarble', a, sH - 0.12, z - 0.2, b, sH + 0.08, z + 0.2, -999); posts(a, z, b, z); };
  const runZ = (a, b, x) => { if (b - a < 0.6) return; box('lattice', x - 0.12, 0, a, x + 0.12, sH - 0.12, b, -999); box('wmarble', x - 0.2, sH - 0.12, a, x + 0.2, sH + 0.08, b, -999); posts(x, a, x, b); };
  const segs = (a, b, gaps) => { const out = []; let s = a; for (const [g0, g1] of gaps) { out.push([s, g0]); s = g1; } out.push([s, b]); return out; };
  for (const [a, b] of segs(s0x, s1x, [[-166, -154], [-101, -89], [-44, -32]])) runX(a, b, s0z);
  for (const [a, b] of segs(s0x, s1x, [[-166, -154], [-124, -112], [-44, -32]])) runX(a, b, s1z);
  runZ(s0z, s1z, s0x);
  for (const [a, b] of segs(s0z, s1z, [[-8, 8]])) runZ(a, b, s1x);

  /* ───────── Walls ───────── */
  S('wall');
  const WT = 44;
  wall(-193, -73.5, -187, 73.5, 6, WT);            // west (behind the Kodesh HaKodashim)
  wall(-187, -73.5, -178, -67.5, 6, WT); wall(-142, -73.5, 0, -67.5, 6, WT);   // north
  // Beit HaMoked stands in the line of the north wall (its hall is open across the boundary, Middot 1:6): this piece of the
  // wall is its own mesh, which sanctuary.js hides once the lishka stage (and so Beit HaMoked) is built
  extraMats(B);
  wall(-178, -73.5, -142, -67.5, 6, WT, 'wallMoked');
  wall(-187, 67.5, 0, 73.5, 6, WT);                // south
  wall(0, -73.5, 6, -14, 6, WT); wall(0, 14, 6, 73.5, 6, WT);   // Nikanor wall
  wall(6, -73.5, 141, -67.5, 6, 40); wall(6, 67.5, 141, 73.5, 6, 40);   // Ezrat Nashim N/S
  wall(141, -73.5, 147, -13, 6, 22); wall(141, 13, 147, 73.5, 6, 22);   // low eastern wall (Middot 2:4)
  // footings down to the Mount: the walls rise before the Chel podium is laid around them (hidden inside it afterwards)
  for (const [a, b, c, d] of [[-193, -73.5, -187, 73.5], [-187, -73.5, 6, -67.5], [-187, 67.5, 6, 73.5], [0, -67.5, 6, -14], [0, 14, 6, 67.5],
    [6, -73.5, 141, -67.5], [6, 67.5, 141, 73.5], [141, -73.5, 147, -13], [141, 13, 147, 73.5], [-187, -67.5, 0, 67.5]]) box('ash', a, 0, b, c, 6, d, 0);
  P('azara-gates', -193, 6, -73.5, 0, WT, -67.5); P('azara-gates', -193, 6, 67.5, 0, WT, 73.5); P('azara-gates', -193, 6, -73.5, -187, WT, 73.5);
  P('ezrat-nashim', 6, 6, -73.5, 141, 40, -67.5); P('ezrat-nashim', 6, 6, 67.5, 141, 40, 73.5);
  P('east-wall', 141, 6, -73.5, 147, 22, 73.5);

  /* ───────── Gates of the Azara (Middot 1:4–5) ───────── */
  S('gates');
  gate('N', -104, -78, -86, -64, 6, 50, -95, 10, 6, 26, 'gold');   // שער הקרבן
  gate('N', -47, -78, -29, -64, 6, 50, -38, 10, 6, 26, 'gold');    // שער הניצוץ
  gate('S', -169, 64, -151, 78, 6, 50, -160, 10, 6, 26, 'gold');   // שער הדלק
  gate('S', -127, 64, -109, 78, 6, 50, -118, 10, 6, 26, 'gold');   // שער הבכורות
  gate('S', -47, 64, -29, 78, 6, 50, -38, 10, 6, 26, 'gold');      // שער המים
  for (const [a, b, c, d] of [[-104, -78, -86, -64], [-47, -78, -29, -64], [-169, 64, -151, 78], [-127, 64, -109, 78], [-47, 64, -29, 78]]) P('azara-gates', a, 6, b, c, 51, d);
  // ── site14 ── (BRAIN14-SITE14 cause 5: "the building floats, not him") footings down to the Mount under the parts that stand on
  // the Chel's terrace (y 6): the gates, the chambers, Nikanor and the Ezrat Nashim can rise before the sorag lays the terrace round
  // them (the demo's order builds the gates and the Ezrat Nashim first); hidden inside the terrace once it is laid
  for (const [a, b, c, d] of [[-104, -78, -86, -64], [-47, -78, -29, -64], [-169, 64, -151, 78], [-127, 64, -109, 78], [-47, 64, -29, 78]]) box('ash', a, 0, b, c, 6, d, 0);
  // ── /site14 ──

  /* ───────── Beit HaMoked — "כיפה", a great house (Middot 1:6–9) ───────── */
  S('lishka');
  extraMats(B);
  buildMoked(B, box, cornice, door);
  P('beit-hamoked', -178, 6, -83, -142, 43, -58);
  box('ash', -178, 0, -83, -142, 6, -58, 0); box('ash', -100, 0, 58, -62, 6, 82, 0);   // ── site14 ── (their footings: as the gates')

  /* ───────── Lishkat HaGazit — half in the holy (Middot 5:4) ───────── */
  box('ash', -100, 6, 58, -62, 28, 82);
  cornice(-100, 58, -62, 82, 28, 0.4);
  B.slab('cedar', [[-101.5, 27.7, 56.5], [-101.5, 36.5, 70], [-60.5, 36.5, 70], [-60.5, 27.7, 56.5]], 0.6, { down: [0, -1] });
  B.slab('roof', [[-101.5, 28.1, 56.5], [-101.5, 36.9, 70], [-60.5, 36.9, 70], [-60.5, 28.1, 56.5]], 0.4, { down: [0, -1] });
  B.slab('cedar', [[-101.5, 36.5, 70], [-101.5, 27.7, 83.5], [-60.5, 27.7, 83.5], [-60.5, 36.5, 70]], 0.6, { down: [0, 1] });
  B.slab('roof', [[-101.5, 36.9, 70], [-101.5, 28.1, 83.5], [-60.5, 28.1, 83.5], [-60.5, 36.9, 70]], 0.4, { down: [0, 1] });
  B.tri('ash', [-100, 28, 58], [-100, 28, 82], [-100, 36, 70]);
  B.tri('ash', [-62, 28, 82], [-62, 28, 58], [-62, 36, 70]);
  for (let x = -94; x <= -68; x += 6.5) box('dark', x - 1, 17, 82, x + 1, 23, 82.1, -999);
  P('gazit', -101, 6, 56, -60, 37, 84);

  /* ───────── Azara floors: Ezrat Yisrael 13.5 → Duchan → Ezrat Kohanim 16 ───────── */
  S('wall');
  box('ash', -8, 6, -67.5, 0, 13.25, 67.5); box('pave', -8, 13.25, -67.5, 0, 13.5, 67.5, -999);
  box('pave', -9, 6, -67.5, -8, 14.5, 67.5, -999);     // the 1-amah step on which the Duchan stands
  box('pave', -10, 6, -67.5, -9, 15, 67.5, -999);      // three half-amah steps
  box('pave', -11, 6, -67.5, -10, 15.5, 67.5, -999);
  box('ash', -187, 6, -67.5, -11, 15.75, 67.5); box('pave', -187, 15.75, -67.5, -11, 16, 67.5, -999);
  P('azara', -187, 6, -67.5, -12, 16, 67.5);
  P('duchan', -12, 6, -67.5, 0, 15.6, 67.5);

  /* ───────── Twelve steps between the altar and the Ulam (Middot 3:6) ───────── */
  S('ulam');
  const xr = [-55, -56, -57, -60, -61, -62, -65, -66, -67, -70, -71, -72];   // treads 1,1,3 · 1,1,3 · 1,1,3 · 1,1,4
  for (let i = 0; i < 12; i++) box('pave', -76.2, 15.9, -50, xr[i], 16 + 0.5 * (i + 1), 50, -999);
  P('steps12', -76, 16, -50, -55, 22.2, 50);

  /* ───────── The Altar (Middot 3:1) ───────── */
  const A = (x0, y0, z0, x1, y1, z1) => box('plaster', x0, y0, z0, x1, y1, z1, 16);
  S('yesod');
  A(-54, 16, -19.5, -22, 17, -18.5);   // yesod — the whole north
  A(-54, 16, -18.5, -53, 17, 12.5);    // yesod — the whole west
  A(-53, 16, 11.5, -52, 17, 12.5);     // one amah into the south
  A(-23, 16, -18.5, -22, 17, -17.5);   // one amah into the east
  A(-53, 16, -18.5, -23, 17, 11.5);    // the first course under the body
  S('sovev');
  A(-53, 17, -18.5, -23, 22, 11.5);    // up to the sovev
  box('red', -53.06, 20.85, -18.56, -22.94, 21.15, 11.56, -999);   // חוט הסיקרא
  S('guf');
  A(-52, 22, -17.5, -24, 25, 10.5);    // above the sovev
  // Kevesh — south of the altar, 32 × 16, a smooth ramp
  B.hexa('plaster', [[-46, 16, 10.5], [-46, 16, 42.5], [-30, 16, 42.5], [-30, 16, 10.5],
                     [-46, 25, 10.5], [-46, 16.05, 42.5], [-30, 16.05, 42.5], [-30, 25, 10.5]], 16);
  S('karnot');
  for (const xa of [-52, -25]) for (const za of [-17.5, 9.5]) A(xa, 25, za, xa + 1, 26, za + 1);   // horns
  // the service on the altar's top: the great maaracha (east), the second one for the ketoret coals (by the SW horn),
  // the ash heap (תפוח) in the middle (Tamid 2:2–5), the two silver bowls (Sukkah 4:9); the holes on the yesod (Middot 3:2);
  // the marble slab with a ring (Middot 3:3) and the place of the ashes east of the kevesh (Tamid 1:4)
  extraMats(B);
  buildAltarService(B, box, S);
  S('karnot');
  P('altar', -54, 16, -19.5, -22, 27, 12.5);
  P('kevesh', -46, 16, 12.5, -30, 24, 42.5);

  /* ───────── North of the altar: rings, pillars with cedar, marble tables (Middot 3:5) ───────── */
  S('lishka');
  for (let k = 0; k < 6; k++) for (const x of [-47, -41, -35, -29]) {
    const g = new THREE.TorusGeometry(0.45, 0.09, 6, 12); g.rotateX(Math.PI / 2); g.translate(x, 16.1, -29.5 - 4 * k); B.geo('iron', g, -999);
  }
  for (let k = 0; k < 8; k++) { const x = -52 + 4 * k; box('wmarble', x - 0.4, 16, -60.4, x + 0.4, 19.6, -59.6, 16); }
  box('cedar', -52.6, 19.6, -60.45, -23.4, 20.5, -59.55, -999);
  for (let k = 0; k < 8; k++) for (let q = 0; q < 3; q++) { const x = -52.9 + 4 * k + q * 0.9; box('iron', x - 0.06, 18.8, -60.02, x + 0.06, 19.6, -59.98, -999); }
  for (let k = 0; k < 7; k++) { const x = -50 + 4 * k; box('wmarble', x - 0.35, 16, -56.3, x + 0.35, 17.2, -55.7, 16); box('wmarble', x - 1.3, 17.2, -56.8, x + 1.3, 17.5, -55.2, -999); }
  P('slaughter', -54, 16, -62, -22, 21, -27);

  /* ───────── The Kiyor, between the Ulam and the altar, drawn to the south (Middot 3:6) ───────── */
  S('kiyor');
  buildKiyor(B, box);
  P('kiyor', -66, 19, 17.5, -61, 23.5, 22.5);

  /* ───────── The Heichal: 100 × 100 × 100, a lion — narrow behind, wide in front (Middot 4:6–7) ───────── */
  const M = (x0, y0, z0, x1, y1, z1) => box('marble', x0, y0, z0, x1, y1, z1, 16);
  const KX = KODESH_X;
  // pieces of the rear block that run east–west are cut at KX: the western part belongs to the Kodesh HaKodashim stage
  const split = (fn, x0, x1) => { if (x0 < KX) { S('kodesh'); fn(x0, Math.min(x1, KX)); } if (x1 > KX) { S('heichal'); fn(Math.max(x0, KX), x1); } };
  // The house is hollow (Middot 4:1, 4:6–7): east → west the Heichal wall 6 (x −98…−92) with its doorway 10 × 20, the Heichal 40,
  // the amah traksin 1 (no wall in the Second Temple: two curtains, Yoma 5:1), the Kodesh HaKodashim 20 (x −159…−139),
  // then wall, cell and cell wall (solid here); inside 20 wide (z ±10). Floor 22 on the 6-amah אטום; the lower storey
  // 40 high (→ 62), then the כיור band (62–63) and the beamed ceiling (to 65); above it the upper storey stays solid,
  // pierced over the Kodesh HaKodashim by the openings for the craftsmen's boxes (Middot 4:5).
  // The side cells (תאים), the ramp and the upper storey are not carved: they are never seen.
  // The interior finish (gold plating, floor, ceiling, vessels, curtains, doors) is built by sanctuary.js.
  const HOLES = [[-159, 22, -10, -98, HOUSE_IN.ceil, 10], [-98, 22, -5, -92, 42, 5],
    ...HOUSE_IN.openings.map(([x, z]) => [x - 1, HOUSE_IN.ceil - 0.01, z - 1, x + 1, 67, z + 1])];
  split((a, b) => carve((q) => M(...q), [a, 16, -35, b, 112, 35], HOLES), -176, -92);   // heichal + kodesh hakodashim + cells, 70 wide
  S('ulam');
  M(-92, 16, -50, -81, 112, -30);          // ulam shoulders — 15 amot beyond the heichal each side
  M(-92, 16, 30, -81, 112, 50);
  M(-81, 16, -50, -76, 112, -10);          // ulam front wall, around the 20 × 40 opening
  M(-81, 16, 10, -76, 112, 50);
  M(-81, 62, -10, -76, 112, 10);
  M(-81, 16, -10, -76, 22, 10);
  M(-92, 95, -30, -81, 112, 30);           // ulam hall ceiling
  M(-92, 16, -30, -81, 21.75, 30);
  box('pave', -92, 21.75, -30, -81, 22, 30, -999);
  // the Ulam hall — shaded interior surfaces (the west face is open where the Heichal's doorway is)
  carve((q) => box('marbleIn', ...q, 22), [-92, 22, -30, -91.95, 95, 30], [[-93, 22, -5, -91, 42, 5]]);
  box('marbleIn', -92, 22, -30, -81, 95, -29.95, 22);
  box('marbleIn', -92, 22, 29.95, -81, 95, 30, 22); box('marbleIn', -92, 94.95, -30, -81, 95, 30, -999);
  // (world7: the roof slabs in the walls' white marble, not the courts' paving — from the Mount of Olives and in the opening
  // vision the roof read as a dull purple lid; same stages, same draw calls)
  split((a, b) => box('marble', a, 112, -35, b, 112.3, 35, -999), -176, -92);
  S('ulam');
  box('marble', -92, 112, -50, -76, 112.3, 50, -999);
  // the frame of the Heichal's doorway (20 × 10), seen inside the Ulam. The four gold doors — two opening into the
  // doorway, two into the house (Middot 4:1) — move, so they are built by sanctuary.js.
  S('heichal');
  box('marble', -92, 22, -6.3, -91.2, 43, -5, -999); box('marble', -92, 22, 5, -91.2, 43, 6.3, -999); box('marble', -92, 42, -6.3, -91.2, 43, 6.3, -999);
  // ── site13 ── the Heichal's doors as the finish hangs them ("דלתות ההיכל", מדות ד, א), seen from the court through the Ulam:
  // two cedar leaves in the doorway, shown only while the stage is building (stages.js hides them once sanctuary.js's gold
  // doors stand there)
  box('cedar', -92.1, 22, -4.95, -91.75, 41.95, -0.05, -999); box('cedar', -92.1, 22, 0.05, -91.75, 41.95, 4.95, -999);
  for (const zc of [-2.5, 2.5]) for (const y of [27, 36.5]) box('cedar', -91.75, y, zc - 1.9, -91.6, y + 0.35, zc + 1.9, -999);
  // the two wickets of the great gate, north and south (Middot 4:2); through the northern one a kohen went into the cell
  // and from it into the Heichal to open the doors from inside (Tamid 3:7). Size and exact place: illustration.
  for (const s of [-1, 1]) {
    const zc = s * 12.5;
    box('marble', -92, 22, zc - 1.7, -91.4, 28.2, zc - 1.2, -999); box('marble', -92, 22, zc + 1.2, -91.4, 28.2, zc + 1.7, -999);
    box('marble', -92, 27.6, zc - 1.7, -91.4, 28.2, zc + 1.7, -999);
    box('dark', -91.95, 22, zc - 1.2, -91.9, 27.6, zc + 1.2, -999);
    box('gold', -91.9, 22, zc - 1.15, -91.78, 27.55, zc + 1.15, -999);
    box('gold', -91.78, 24.4, zc - 1.0, -91.7, 24.6, zc + 1.0, -999); box('gold', -91.78, 26.1, zc - 1.0, -91.7, 26.3, zc + 1.0, -999);
  }
  // the poles (כלונסות) the golden vine is trained on, over the Heichal's opening (Middot 3:8). The vine itself — its gold
  // stems, leaves, grapes and clusters — is stages.js's (it is hung with the Ulam and grows with the player's daily tasks;
  // wave 4 removed the old fixed lumps of gold that stood here, which read as blobs, not a vine)
  // (── site13 ── the poles and Queen Helena's candelabrum belong to the Ulam's stage: its finish raises the poles in "כלונסות הארז"
  //  and the gold in "גפן הזהב" — stages.js FINCUT)
  S('ulam');
  box('cedar', -91.55, 22, -10.25, -91.2, 46.8, -9.75, -999); box('cedar', -91.55, 22, 9.75, -91.2, 46.8, 10.25, -999);
  box('cedar', -91.55, 46.45, -10.25, -91.2, 46.9, 10.25, -999);
  // Queen Helena's golden candelabrum over the opening (Yoma 3:10)
  B.cyl('gold', -86.5, 53.6, 0, 1.7, 1.0, 0.55, 18, -999);
  box('gold', -86.56, 54.2, -0.06, -86.44, 95, 0.06, -999);
  S('ulam');
  buildUlamItems(B, box);
  // five oak lintels over the Ulam opening, 22 → 30 amot, stone courses between (Middot 3:7)
  for (let i = 0; i < 5; i++) { const hw = 11 + i, y0 = 62.3 + 2 * i; box('oak', -76, y0, -hw, -75.3, y0 + 1.1, hw, -999); }
  // four engaged columns — the façade as drawn on the Bar Kokhba tetradrachm (schematic)
  for (const zc of [-38, -19.5, 19.5, 38]) {
    box('marble', -79, 22, zc - 3.3, -72.6, 24, zc + 3.3, -999);
    B.cyl('wmarble', -75.2, 24, zc, 2.5, 2.7, 66, 22, 22);
    B.cyl('wmarble', -75.2, 90, zc, 3.3, 2.5, 3, 22, -999);
    box('wmarble', -78.8, 93, zc - 3.6, -71.6, 94.5, zc + 3.6, -999);
  }
  box('marble', -76, 94.5, -50, -72.4, 100, 50, -999);
  box('gold', -72.4, 96.8, -50, -72.2, 97.8, 50, -999);
  // gold cornice band under the parapet (all round)
  box('gold', -76, 109.6, -50.25, -75.75, 110.6, 50.25, -999);
  box('gold', -92, 109.6, -50.25, -76, 110.6, -50, -999); box('gold', -92, 109.6, 50, -76, 110.6, 50.25, -999);
  split((a, b) => { box('gold', a, 109.6, -35.25, b, 110.6, -35, -999); box('gold', a, 109.6, 35, b, 110.6, 35.25, -999); }, -176, -92);
  S('kodesh');
  box('gold', -176.25, 109.6, -35, -176, 110.6, 35, -999);
  // parapet (מעקה, 3 amot)
  const Pp = (x0, z0, x1, z1) => { box('marble', x0, 112, z0, x1, 115, z1, -999); box('gold', x0, 115, z0, x1, 115.22, z1, -999); };   // (world7: the spikes' gold coping — illustration)
  S('ulam');
  Pp(-77, -50, -76, 50); Pp(-92, -50, -77, -49); Pp(-92, 49, -77, 50);
  Pp(-92, -49, -91, -35); Pp(-92, 35, -91, 49);
  split((a, b) => { Pp(a, -35, b, -34); Pp(a, 34, b, 35); }, -176, -92);
  S('kodesh');
  Pp(-176, -34, -175, 34);
  // כלה עורב — gold spikes against the ravens (Middot 4:6)
  // (world7: 0.22 → 0.34 wide, on a gold coping — from the courts and the Mount of Olives the roofline now reads as a gold crest)
  const spike = (x, z) => { S(x < KX ? 'kodesh' : x > -92 ? 'ulam' : 'heichal'); const g = new THREE.ConeGeometry(0.34, 1.0, 5); g.translate(x, 115.7, z); B.geo('gold', g, -999); };
  const lineSp = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.25)); for (let k = 0; k <= n; k++) spike(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n); };
  lineSp(-76.5, -49.5, -76.5, 49.5);
  lineSp(-91.5, -49.5, -77.5, -49.5); lineSp(-91.5, 49.5, -77.5, 49.5);
  lineSp(-91.5, -48.3, -91.5, -35.5); lineSp(-91.5, 35.5, -91.5, 48.3);
  lineSp(-175.5, -34.5, -92.5, -34.5); lineSp(-175.5, 34.5, -92.5, 34.5); lineSp(-175.5, -33.3, -175.5, 33.3);
  S('heichal');
  P('heichal', -176, 16, -35, -92, 116, 35); P('heichal', -92, 16, -50, -81, 116, 50);
  S('ulam');
  P('ulam', -81, 16, -50, -71.5, 116, 50);

  /* ───────── Nikanor: the eastern gate, bronze that shone like gold ───────── */
  S('nikanor');
  gate('E', -4, -14, 10, 14, 6, 50, 0, 10, 13.5, 33.5, 'bronze');
  wall(0, -26, 8, -14, 6, 32); wall(0, 14, 8, 26, 6, 32);   // its two chambers
  box('ash', -4, 0, -26, 10, 6, 26, 0);   // ── site14 ── (its footing, as the gates'; the steps' below)
  P('nikanor', -4, 6, -26, 11, 51, 26);
  // fifteen steps, "not straight but rounded like half a threshing floor" (Middot 2:5)
  for (let j = 0; j < 15; j++) {
    const R = 6 + 0.5 * (j + 1), top = 13.5 - 0.5 * j;
    const g = new THREE.CylinderGeometry(R, R, top - 5.9, 56, 1, false, 0, Math.PI);
    g.translate(10, (top + 5.9) / 2, 0); B.geo('pave', g, -999);
  }
  P('steps15', 10, 6, -13.5, 23.5, 13.6, 13.5);
  { const g = new THREE.CylinderGeometry(13.5, 13.5, 5.9, 56, 1, false, 0, Math.PI); g.translate(10, 2.95, 0); B.geo('ash', g, 0); }   // ── site14 ── (the steps' footing)

  /* ───────── Ezrat Nashim: four unroofed chambers, gallery, eastern gate ───────── */
  S('gates');
  gate('E', 138, -13, 150, 13, 6, 38, 0, 10, 6, 26, 'gold');
  P('east-wall', 138, 6, -13, 151, 38, 13);
  box('ash', 138, 0, -13, 150, 6, 13, 0);   // ── site14 ── (its footing)
  S('nashim');
  // ── site13 ── (the owner, 30.9 11:12: "לוודא שבכל שלבי הבנייה נראית ההתקדמות … בעזרת נשים ומצורעים לא בטוח שראיתי את זה";
  // PRODUCER-S13a #6) the four corner chambers are built in two parts: their walls' lower courses (6 … 13.09, a course joint of
  // the ashlar) are the stage's courses; their upper walls, copings, lintels and what each chamber holds are the set
  // 'nashim-lc', which stages.js raises in the finish ("לשכות הפינות"), one chamber at a time, each named as it rises. The
  // gallery (הגזוזטרא, the finish's first step) is cedar on cedar brackets, laid along the court in the finish.
  const YS = 13.09;
  // ── site14 ── the court's own floor on its fill (top 5.9, under the Chel's terrace at 6 once it is laid): before the sorag, the
  // chambers, the jars, the pool and the hearth stand on it, not in the air 6 amot over the Mount (stages.js groundAt knows it)
  box('ash', 6, 0, -67.5, 141, 5.9, 67.5, 0);
  const cw = (x0, z0, x1, z1) => { box('ash', x0, 6, z0, x1, YS, z1); B.stage('nashim-lc'); box('ash', x0, YS, z0, x1, 20, z1, 6); B.stage('nashim'); };
  const LC = (fn) => { B.stage('nashim-lc'); fn(); B.stage('nashim'); };
  // SE — Nazirites
  cw(101, 27.5, 103, 67.5); cw(101, 27.5, 117, 29.5); cw(125, 27.5, 141, 29.5); LC(() => box('ash', 117, 16, 27.5, 125, 20, 29.5, 6));
  // NE — wood
  cw(101, -67.5, 103, -27.5); cw(101, -29.5, 117, -27.5); cw(125, -29.5, 141, -27.5); LC(() => box('ash', 117, 16, -29.5, 125, 20, -27.5, 6));
  // NW — lepers
  cw(44, -67.5, 46, -27.5); cw(6, -29.5, 22, -27.5); cw(30, -29.5, 46, -27.5); LC(() => box('ash', 22, 16, -29.5, 30, 20, -27.5, 6));
  // SW — wine and oil
  cw(44, 27.5, 46, 67.5); cw(6, 27.5, 22, 29.5); cw(30, 27.5, 46, 29.5); LC(() => box('ash', 22, 16, 27.5, 30, 20, 29.5, 6));
  B.stage('nashim-lc');   // ── site13 ── (the copings and everything each chamber holds rise with it)
  for (const [a, b, c, d] of [[101, 27.5, 141, 29.5], [101, -29.5, 141, -27.5], [6, -29.5, 46, -27.5], [6, 27.5, 46, 29.5]]) box('ash', a - 0.3, 19.6, b - 0.3, c + 0.3, 20.4, d + 0.3, -999);
  for (const [a, b, c, d] of [[101, 27.5, 103, 67.5], [101, -67.5, 103, -27.5], [44, -67.5, 46, -27.5], [44, 27.5, 46, 67.5]]) box('ash', a - 0.3, 19.6, b, c + 0.3, 20.4, d, -999);
  // wood stacks (NE)
  for (const [px, pz] of [[112, -58], [128, -58], [112, -42], [128, -42]]) {
    let lay = 0;
    for (const n of [5, 4, 3]) {
      for (let k = 0; k < n; k++) { const g = new THREE.CylinderGeometry(0.38, 0.38, 8, 7); g.rotateZ(Math.PI / 2); g.translate(px, 6.38 + lay * 0.68, pz - (n - 1) * 0.4 + k * 0.8); B.geo('cedar', g, -999); }
      lay++;
    }
  }
  // the paving stone that looked different from the others, where (by one tradition) the Ark lies hidden (Shekalim 6:2)
  B.stage('nashim');   // ── site13 ── (the court's own paving stays with the stage)
  box('wmarble', PL.ODD_STONE.x - 0.8, 5.99, PL.ODD_STONE.z - 0.55, PL.ODD_STONE.x + 0.8, 6.05, PL.ODD_STONE.z + 0.55, -999);
  B.stage('nashim-lc');   // ── site13 ──
  // Nazirites' hearth and pot (SE)
  box('ash', 117.5, 6, 46.5, 124.5, 7.2, 53.5, 6);
  B.cyl('bronze', 121, 7.2, 50, 2.3, 1.5, 2.4, 20, -999);
  // wine and oil jars (SW)
  const jar = new THREE.LatheGeometry([[0, 0], [0.5, 0.05], [0.9, 0.6], [1.05, 1.5], [0.9, 2.3], [0.45, 2.7], [0.4, 3.1], [0.55, 3.2], [0.01, 3.2]].map(([a, b]) => new THREE.Vector2(a, b)), 10);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { const g = jar.clone(); g.translate(13 + j * 4.2, 6, 42 + i * 5); B.geo('clay', g, 6); }
  // immersion pool (NW)
  box('ash', 14, 6, -60, 38, 7.3, -59); box('ash', 14, 6, -45, 38, 7.3, -44); box('ash', 14, 6, -59, 15, 7.3, -45); box('ash', 37, 6, -59, 38, 7.3, -45);
  box('water', 15, 6, -59, 37, 7.0, -45, -999);
  B.stage('nashim');   // ── site13 ──
  // gallery "כצוצרה" around the court
  // (── site13 ── cedar: the finish's first step "הגזוזטרא" is paid in cedar (content.js PROJ.nashim); laid from west to east
  //  in the finish, and not counted among the courses' stones)
  for (const s of [-1, 1]) {
    const zw = s * 67.5, zi = s * 62.8;
    box('cedar', 46, 19.2, Math.min(zw, zi), 101, 20, Math.max(zw, zi), -999);
    box('cedar', 46, 20, Math.min(zi, zi + s * 0.3), 101, 21.3, Math.max(zi, zi + s * 0.3), -999);
    for (let x = 48.5; x <= 99; x += 5.5) box('cedar', x - 0.6, 17.4, Math.min(zw, zw - s * 3.2), x + 0.6, 19.2, Math.max(zw, zw - s * 3.2), -999);
  }
  P('ezrat-nashim', 6, 6, -67.5, 141, 14, 67.5);
  P('l-nezirim', 101, 6, 27.5, 141, 21, 67.5);
  P('l-etzim', 101, 6, -67.5, 141, 21, -27.5);
  P('l-metzoraim', 6, 6, -67.5, 46, 21, -27.5);
  P('l-shemanya', 6, 6, 27.5, 46, 21, 67.5);
  // the north chambers (salt, hides, rinsing) and Beit Avtinas over the Water Gate
  S('lishka');
  buildNorthChambers(B, box);
  buildAvtinas(B, box);
  B.stage('_');
}

/* ═════════ Sprint 2 (sanctuary agent): the places of the service ═════════ */
// materials used only here (added to the shared table so the build stages can clone them)
function extraMats(B) {
  const M = B.mats; if (M.silver) return;
  const std = (o) => new THREE.MeshStandardMaterial(o);
  // (few new materials: every material is a draw call in each build stage that uses it)
  M.silver = { mat: std({ color: '#DCE0E4', metalness: 1, roughness: 0.22 }), tile: 5 };
  M.ember = { mat: std({ color: BLOOD.ember, emissive: new THREE.Color(1.75, 0.72, 0.14), roughness: 0.9 }), tile: 4, cast: false };   // ── blooda25 ── orange coals (DAM25 §4.6: red is the blood's and the line's only)
  // the roofs of Beit HaMoked and Beit Avtinas, which open when the camera comes close (sanctuary.js finds this mesh by
  // its name in the lishka stage)
  M.roofCut = { mat: groundAO(M.ash.mat.clone(), { macro: 0.1 }), tile: 24 };
  M.wallMoked = { mat: groundAO(M.ash.mat.clone(), { macro: 0.1 }), tile: 24 };
}
const lathe = (pts, seg = 14) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.001), y)), seg);

function buildMoked(B, box, cornice, door) {
  const r = rng(61);
  // walls (1 amah) round the hall; floor at the azara's level, 16
  box('ash', -178, 6, -83, -142, 30, -82); box('ash', -178, 6, -59, -142, 16, -58);
  box('ash', -178, 6, -82, -177, 30, -59); box('ash', -143, 6, -82, -142, 30, -59);
  box('ash', -178.5, 28.7, -83.5, -141.5, 30.25, -82, -999); box('ash', -178.5, 28.7, -82, -177, 30.25, -59, -999); box('ash', -143, 28.7, -82, -141.5, 30.25, -59, -999);
  // the south wall, over the azara, and its cornice come off with the dome when the camera is close (a cutaway)
  // (open to the azara at GATES.moked, x −162…−158: the hall's way in from the holy side)
  carve((q) => box('roofCut', ...q), [-178, 16, -59, -142, 30, -58], [[PL.GATES.moked.x - 2, 15.9, -60, PL.GATES.moked.x + 2, 24, -57]]);
  box('roofCut', -178.5, 28.7, -59, -141.5, 30.25, -57.5, -999);
  box('ash', -178, 15.7, -59, -142, 16.3, -57.8, -999);
  const well = [-175, 9.5, -81, -171, 16.5, -75];     // the stair down to the immersion (NW chamber)
  carve((q) => box('ash', ...q), [-177, 6, -82, -143, 15.75, -59], [well]);
  carve((q) => box('wmarble', ...q, -999), [-177, 15.75, -82, -143, 16, -59], [well]);
  // the dome ("בית המוקד כפה") — its own mesh, taken off when the camera comes close
  { const g = new THREE.CylinderGeometry(12.5, 12.5, 36, 28, 1, false, 0, Math.PI); g.rotateZ(Math.PI / 2); g.translate(-160, 30.2, -70.5); B.geo('roofCut', g, -999); }
  door('N', -83, -160, 10, 6, 24, 'gold');
  // "שנים שערים היו לבית המוקד, אחד פתוח לחיל ואחד פתוח לעזרה" — the one to the azara a small wicket (R. Yehuda, Middot 1:7)
  box('ash', PL.GATES.moked.x - 2.4, 23.6, -59.3, PL.GATES.moked.x + 2.4, 24.4, -57.7, -999);   // a lintel over the way to the azara
  // the four chambers "כקיטונות פתוחות לטרקלין" (Middot 1:6), low partitions with a doorway to the hall
  const C = PL.MOKED_CHAMBERS, H = 27;
  const part = (x0, z0, x1, z1, gap) => {        // a wall with a doorway gap [a, b] along its length
    if (!gap) { box('ash', x0, 16, z0, x1, H, z1); return; }
    const alongX = x1 - x0 > z1 - z0;
    if (alongX) { box('ash', x0, 16, z0, gap[0], H, z1); box('ash', gap[1], 16, z0, x1, H, z1); box('ash', gap[0], 23, z0, gap[1], H, z1); }
    else { box('ash', x0, 16, z0, x1, H, gap[0]); box('ash', x0, 16, gap[1], x1, H, z1); box('ash', x0, 23, gap[0], x1, H, gap[1]); }
  };
  const LD = PL.LAMBS_CHAMBER_DOOR;   // the lambs' chamber opens east on the hall
  part(-177, -68.5, -166, -67.5); part(-167, -67.5, -166, -59, [LD.z - LD.w / 2, LD.z + LD.w / 2]);           // SW: lambs
  part(-154, -68.5, -143, -67.5); part(-154, -67.5, -153, -59, [-65, -61.5]);           // SE: bakers
  part(-154, -73.5, -143, -72.5); part(-154, -82, -153, -73.5, [-80, -76.5]);           // NE: the stones
  part(-177, -73.5, -166, -72.5); part(-167, -82, -166, -73.5, [-80, -76.5]);           // NW: down to the immersion
  for (const [x0, z0, x1, z1] of [[-177.3, -68.8, -165.7, -67.2], [-154.3, -68.8, -142.7, -67.2], [-154.3, -73.8, -142.7, -72.2], [-177.3, -73.8, -165.7, -72.2]]) box('ash', x0, H, z0, x1, H + 0.6, z1, -999);
  // "מקף רובדין של אבן" — stone ledges round the hall; the young kohanim slept on the floor
  box('ash', -166, 16, -82, -163.2, 17, -80.4); box('ash', -156.8, 16, -82, -154, 17, -80.4);
  box('ash', -166, 16, -60.6, -163.2, 17, -59); box('ash', -156.8, 16, -60.6, -154, 17, -59);
  box('ash', -177, 16, -72.5, -175.4, 17, -68.5); box('ash', -144.6, 16, -72.5, -143, 17, -68.5);
  // "וראשי פספסין מבדילין בין קדש לחל" — a line of tiles across the hall where the azara begins (z −67.5)
  box('wmarble', -166, 16, -67.7, -154, 16.03, -67.3, -999);
  // the place of the keys: "אמה על אמה, וטבלא של שיש, וטבעת היתה קבועה בה" (Middot 1:9)
  box('wmarble', -160.5, 16, -76.5, -159.5, 16.04, -75.5, -999);
  { const g = new THREE.TorusGeometry(0.22, 0.05, 6, 14); g.rotateX(Math.PI / 2); g.translate(-160, 16.07, -76); B.geo('iron', g, -999); }
  // a hearth in the hall (the name "בית המוקד"; illustration)
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; box('ash', -160 + Math.cos(a) * 1.3 - 0.3, 16, -70.5 + Math.sin(a) * 1.3 - 0.3, -160 + Math.cos(a) * 1.3 + 0.3, 16.5, -70.5 + Math.sin(a) * 1.3 + 0.3, -999); }
  for (let k = 0; k < 5; k++) { const g = new THREE.CylinderGeometry(0.14, 0.14, 1.8, 6); g.rotateZ(Math.PI / 2); g.rotateY(k * 1.2); g.translate(-160, 16.25 + (k % 2) * 0.12, -70.5); B.geo('dark', g, -999); }
  for (let k = 0; k < 9; k++) { const g = new THREE.IcosahedronGeometry(0.16 + r() * 0.1, 0); g.translate(-160 + (r() - 0.5) * 1.4, 16.2, -70.5 + (r() - 0.5) * 1.4); B.geo('ember', g, -999); }   // ── blooda25 ── (was 'red': the coals of בית המוקד are the ember's orange)
  // SW — the lambs' chamber: a manger along the west wall, two stall rails, hay in the corners; the middle of the floor
  // (y = 16) stays clear for the lambs (the Life agent places six there)
  { const L = C.lambs;
    box('cedar', L.x0 + 0.1, 16, L.z0 + 1.2, L.x0 + 1.3, 16.9, L.z1 - 1.2); box('cedar', L.x0 + 0.3, 16.9, L.z0 + 1.4, L.x0 + 1.1, 17.05, L.z1 - 1.4, -999);
    for (const z of [L.z0 + 3.2, L.z0 + 5.6]) { box('cedar', L.x0 + 1.3, 16, z - 0.08, L.x0 + 3.6, 17.3, z + 0.08); box('cedar', L.x0 + 1.3, 16.6, z - 0.1, L.x0 + 3.6, 16.75, z + 0.1, -999); }
    // (the hay itself — straw-coloured, in the corners and the manger — is pens.js buildLambsChamber's; wave 4 removed the
    // dark cedar-coloured mounds that stood here and read as puddles under the lambs, QA P2-7)
    // a low gate of rails at the chamber's doorway
    }
  // SE — the bakers of the showbread: an oven, a kneading trough, a table with moulds and loaves (illustration)
  { const L = C.bakers;
    B.geo('clay', lathe([[1.1, 0], [1.2, 0.5], [1.05, 1.9], [0.75, 2.4], [0.6, 2.45], [0.55, 2.3]], 16).translate(L.x1 - 2, 16, L.z1 - 2));
    { const g = new THREE.CircleGeometry(0.55, 12); g.rotateX(-Math.PI / 2); g.translate(L.x1 - 2, 18.3, L.z1 - 2); B.geo('dark', g, -999); }
    box('cedar', L.x0 + 1, 16, L.z0 + 1, L.x0 + 4.5, 17.2, L.z0 + 2.4); box('clay', L.x0 + 1.2, 17.2, L.z0 + 1.2, L.x0 + 4.3, 17.35, L.z0 + 2.2, -999);
    box('cedar', L.x0 + 5, 17.6, L.z0 + 0.8, L.x1 - 0.8, 17.8, L.z0 + 2.6); for (const [x, z] of [[L.x0 + 5.2, L.z0 + 1], [L.x1 - 1, L.z0 + 1], [L.x0 + 5.2, L.z0 + 2.4], [L.x1 - 1, L.z0 + 2.4]]) box('cedar', x - 0.1, 16, z - 0.1, x + 0.1, 17.6, z + 0.1);
    for (let k = 0; k < 3; k++) { const x = L.x0 + 5.6 + k * 1.2; box('iron', x, 17.8, L.z0 + 1.1, x + 0.9, 17.86, L.z0 + 2.3, -999); box('iron', x, 17.8, L.z0 + 1.1, x + 0.9, 18.15, L.z0 + 1.16, -999); box('iron', x, 17.8, L.z0 + 2.24, x + 0.9, 18.15, L.z0 + 2.3, -999); }
    for (let k = 0; k < 4; k++) box('clay', L.x0 + 1.1, 16 + k * 0.32, L.z1 - 1.6, L.x0 + 2.2, 16.24 + k * 0.32, L.z1 - 0.4, -999); }
  // NE — the stones of the altar the Greek kings defiled, stored by the Hasmoneans (a neat stack)
  { const L = C.stones;
    for (let lay = 0; lay < 3; lay++) for (let i = 0; i < 4 - lay; i++) for (let j = 0; j < 2; j++) {
      const g = new THREE.BoxGeometry(1.7 + r() * 0.3, 0.95, 1.15 + r() * 0.2, 1, 1, 1); g.rotateY((r() - 0.5) * 0.12);
      g.translate(L.x0 + 2 + i * 2 + lay, 16.48 + lay * 0.97, L.z0 + 2.2 + j * 1.5); B.geo('wmarble', g, 16);
    } }
  // NW — the way down to the immersion: a stair under the building, lamps on both sides (Tamid 1:1)
  for (let k = 0; k < 12; k++) box('wmarble', -175, 9.5, -75 - 0.5 * (k + 1), -171, 16 - 0.5 * (k + 1), -75 - 0.5 * k, -999);
  box('ash', -175.3, 16, -81.3, -170.7, 16.6, -81, -999); box('ash', -175.3, 16, -81.3, -175, 16.6, -75, -999); box('ash', -171, 16, -81.3, -170.7, 16.6, -75, -999);
  for (const z of [-77, -79.5]) { box('gold', -175.02, 14.4 - (z + 77) * 0.5, z - 0.15, -174.9, 14.8 - (z + 77) * 0.5, z + 0.15, -999); box('gold', -171.1, 14.4 - (z + 77) * 0.5, z - 0.15, -170.98, 14.8 - (z + 77) * 0.5, z + 0.15, -999); }
}

function buildKiyor(B, box) {
  const K = PL.KIYOR, X = K.x, Z = K.z, M = PL.KIYOR_MECHANISM;
  // the pit it sank into at night ("שלא יהיו מימיו נפסלין בלינה", Yoma 3:10): a curb round a shaft, water deep below
  box('ash', X - 1.45, 18.75, Z - 2.4, X + 1.45, 19.2, Z - 1.9); box('ash', X - 1.45, 18.75, Z + 1.9, X + 1.45, 19.2, Z + 2.4);
  box('ash', X - 1.45, 18.75, Z - 1.9, X - 1.05, 19.2, Z + 1.9); box('ash', X + 1.05, 18.75, Z - 1.9, X + 1.45, 19.2, Z + 1.9);
  box('ash', X - 1.05, 16, Z - 1.9, X + 1.05, 18.9, Z - 1.85, 19); box('ash', X - 1.05, 16, Z + 1.85, X + 1.05, 18.9, Z + 1.9, 19);
  box('ash', X - 1.05, 16, Z - 1.85, X - 1, 18.9, Z + 1.85, 19); box('ash', X + 1, 16, Z - 1.85, X + 1.05, 18.9, Z + 1.85, 19);
  box('water', X - 1, 17.1, Z - 1.85, X + 1, 17.2, Z + 1.85, -999);
  // ── water ── (WATER, wave 6) the parts Ben Katin's wheel moves (Yoma 3:10; Tamid 3:8) are sets of their own, so world.water
  // can lower the kiyor into its pit at night and turn the wheel: 'kiyor-basin' (stand, basin, its water, spigots, lugs),
  // 'kiyor-wheel' (the wheel; its drum and hub stay), 'kiyor-chains'. water.js builds them into the kiyor stage's group with that stage's own
  // materials (SITE's reveal applies); anything else that builds every set of the Batch (the labs) builds them as usual.
  B.stage('kiyor-basin');
  // ── end water ──
  // the kiyor: bronze (Exodus 30:18), a stand (כן) rising out of the shaft, a deep basin, its rim at the level of places.KIYOR
  B.geo('bronze', lathe([[0.95, 0], [0.98, 0.15], [0.72, 0.45], [0.5, 1.1], [0.48, 1.7], [0.55, 2.0], [0.8, 2.3], [0.75, 2.45]], 20).translate(X, 18.7, Z), 16);
  B.geo('bronze', lathe([[0.55, 0], [0.9, 0.12], [1.55, 0.45], [2.05, 0.95], [2.3, 1.45], [2.4, 1.75], [2.42, 1.86], [2.3, 1.86], [2.18, 1.6], [1.95, 1.1], [1.4, 0.55], [0.6, 0.3]], 32).translate(X, K.rim - 1.86 + 0.01, Z), -999);
  { const g = new THREE.CircleGeometry(2.2, 32); g.rotateX(-Math.PI / 2); g.translate(X, K.rim - 0.14, Z); B.geo('water', g, -999); }
  // Ben Katin's twelve spigots (דדים), each with a small tap; and four lugs on the rim for the chains
  for (let k = 0; k < K.spigots; k++) {
    const a = k / K.spigots * Math.PI * 2 + Math.PI / 12, c = Math.cos(a), s = Math.sin(a);
    const g = new THREE.CylinderGeometry(0.075, 0.1, 0.62, 8); g.rotateZ(Math.PI / 2 - 0.35); g.rotateY(-a); g.translate(X + c * 2.08, K.rim - 1.08, Z + s * 2.08); B.geo('bronze', g, -999);
    const t = new THREE.CylinderGeometry(0.05, 0.05, 0.24, 6); t.translate(X + c * 2.3, K.rim - 0.98, Z + s * 2.3); B.geo('bronze', t, -999);
  }
  for (const z of [-1, 1]) { const g = new THREE.TorusGeometry(0.2, 0.05, 6, 12); g.rotateY(Math.PI / 2); g.translate(X, K.rim + 0.12, Z + z * 2.25); B.geo('bronze', g, -999); }
  B.stage('kiyor');   // ── water ──
  // the mechanism (מוכני): a wooden windlass over the pit — posts, a beam, a drum with two chains, a great wheel.
  // "Its sound was heard in Jericho" (Tamid 3:8). The form is an illustration.
  const [za, zb] = M.posts, AY = M.axleY;
  for (const z of [za, zb]) {
    box('oak', X - 0.35, 19, z - 0.35, X + 0.35, AY + 1.6, z + 0.35);
    for (const s of [-1, 1]) { const g = new THREE.BoxGeometry(0.28, 4.4, 0.28); g.rotateZ(s * 0.5); g.translate(X + s * 1.05, 20.9, z); B.geo('oak', g, 19); }
  }
  box('oak', X - 0.45, AY + 1.6, za - 0.6, X + 0.45, AY + 2.4, zb + 0.6);
  { const g = new THREE.CylinderGeometry(0.42, 0.42, M.wheel.z - za + 0.5, 14); g.rotateX(Math.PI / 2); g.translate(X, AY, (za + M.wheel.z) / 2 + 0.1); B.geo('oak', g, -999); }
  B.stage('kiyor-chains');   // ── water ──
  for (const z of [Z - 2.25, Z + 2.25]) for (let k = 0; k < 14; k++) {
    const y = K.rim + 0.3 + k * ((AY - 0.42 - K.rim - 0.3) / 14), g = new THREE.BoxGeometry(0.1, 0.36, k % 2 ? 0.05 : 0.2);
    g.translate(X, y + 0.18, z); B.geo('bronze', g, -999);
  }
  B.stage('kiyor-wheel');   // ── water ──
  { const W = M.wheel, g = new THREE.TorusGeometry(W.r, 0.13, 8, 36); g.translate(X, AY, W.z); B.geo('oak', g, -999);
    const g2 = new THREE.TorusGeometry(W.r - 0.25, 0.07, 6, 36); g2.translate(X, AY, W.z); B.geo('oak', g2, -999);
    for (let k = 0; k < 8; k++) { const s = new THREE.BoxGeometry(0.16, W.r * 2 - 0.1, 0.14); s.rotateZ(k * Math.PI / 8); s.translate(X, AY, W.z); B.geo('oak', s, -999); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, h = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6); h.rotateX(Math.PI / 2); h.translate(X + Math.cos(a) * (W.r + 0.05), AY + Math.sin(a) * (W.r + 0.05), W.z + 0.3); B.geo('oak', h, -999); }
    B.stage('kiyor');   // ── water ── (the drum and the hub turn about their own axis: they stay in the stage)
    const hub = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 12); hub.rotateX(Math.PI / 2); hub.translate(X, AY, W.z); B.geo('bronze', hub, -999); }
}

function buildAltarService(B, box, S) {
  const r = rng(5), MA = PL.MAARACHOT;
  S('karnot');
  // the great maaracha: logs laid crosswise, the lower ones charred, embers between
  const log = (k, x, y, z, len, rad, rotY) => { const g = new THREE.CylinderGeometry(rad, rad * 1.06, len, 7); g.rotateZ(Math.PI / 2); g.rotateY(rotY); g.translate(x, y, z); B.geo(k, g, -999); };
  { const { x, z } = MA.great;
    for (let lay = 0; lay < 4; lay++) for (let i = 0; i < 5; i++) {
      const o = (i - 2) * 1.05 + (r() - 0.5) * 0.2, y = 25.3 + lay * 0.5;
      log('cedar', lay % 2 ? x + o : x, y, lay % 2 ? z : z + o, 5.2 + r() * 0.6, 0.26 + r() * 0.05, lay % 2 ? Math.PI / 2 + (r() - 0.5) * 0.1 : (r() - 0.5) * 0.1);
    }
    for (let k = 0; k < 22; k++) { const g = new THREE.IcosahedronGeometry(0.2 + r() * 0.16, 0); g.translate(x + (r() - 0.5) * 4.4, 25.15 + r() * 0.5, z + (r() - 0.5) * 4.4); B.geo('ember', g, -999); } }
  // the second maaracha, for the coals of the ketoret: small, of fine fig wood (Tamid 2:5)
  { const { x, z } = MA.ketoret;
    for (let lay = 0; lay < 3; lay++) for (let i = 0; i < 3; i++) { const o = (i - 1) * 0.55; log('cedar', lay % 2 ? x + o : x, 25.2 + lay * 0.36, lay % 2 ? z : z + o, 2.4, 0.16, lay % 2 ? Math.PI / 2 : 0); }
    for (let k = 0; k < 8; k++) { const g = new THREE.IcosahedronGeometry(0.12 + r() * 0.08, 0); g.translate(x + (r() - 0.5) * 1.6, 25.1 + r() * 0.2, z + (r() - 0.5) * 1.6); B.geo('ember', g, -999); } }
  // the תפוח: the heap of ashes in the middle
  // ── light28 ── the owner's shot 4: a white featureless mound. Now a heaped cone of grey-brown ash (a lathe: steep flanks, a rounded crown, the
  // shovels' furrows down its sides), a darker rim where it meets the altar's top, and the ash's dust strewn about its foot
  { const { x, z } = MA.tapuach;
    const prof = [[3.45, 0], [3.25, 0.18], [2.8, 0.55], [2.15, 1.05], [1.45, 1.55], [0.85, 1.92], [0.35, 2.12], [0, 2.18]].map(([r, y]) => new THREE.Vector2(r, y));
    const g = new THREE.LatheGeometry(prof, 30), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), a = Math.atan2(pz, px), n = 1 + 0.07 * Math.sin(a * 7 + py * 1.3) + 0.05 * Math.sin(a * 13 - py * 2.1) - 0.04 * Math.max(0, Math.sin(a * 5)) * Math.min(1, py); p.setXYZ(i, px * n, py * (1 + 0.06 * Math.sin(a * 3)), pz * n); }
    g.computeVertexNormals(); g.translate(x, 25, z); B.geo('tapuach28', g, -999);
    const rim = new THREE.TorusGeometry(3.3, 0.3, 6, 30); rim.rotateX(Math.PI / 2); rim.scale(1, 0.55, 1); rim.translate(x, 25.06, z); B.geo('tapuachRim28', rim, -999);
    const rr = rng(828);
    for (let k = 0; k < 16; k++) { const t = rr() * Math.PI * 2, d = 3.7 + rr() * 2.2, w = 0.35 + rr() * 0.55; const f = new THREE.CylinderGeometry(w, w * 1.15, 0.05, 9); f.scale(1, 1, 0.6 + rr() * 0.6); f.rotateY(rr() * 3); f.translate(x + Math.cos(t) * d, 25.03, z + Math.sin(t) * d); B.geo('tapuachDust28', f, -999); }
  }
  // ── /light28 ──
  // two silver bowls by the SW horn, perforated — water (west) and wine (east) (Sukkah 4:9)
  for (const [x, y, z] of [PL.LIBATION_BOWLS.water, PL.LIBATION_BOWLS.wine]) {
    B.geo('silver', lathe([[0.02, 0], [0.18, 0.02], [0.3, 0.12], [0.36, 0.3], [0.33, 0.31], [0.26, 0.15], [0.02, 0.07]], 16).translate(x, y, z), -999);
    B.geo('silver', lathe([[0.1, 0], [0.12, 0.08], [0.06, 0.12]], 10).translate(x, y - 0.02, z), -999);
  }
  // the two holes on the yesod at the SW corner, "כמין שני חטמין דקין" (Middot 3:2); and the marble slab with its ring in
  // the paving at that corner (Middot 3:3)
  S('guf');
  for (const [x, y, z] of PL.LIBATION_BOWLS.holes) { const g = new THREE.CircleGeometry(0.2, 12); g.rotateX(-Math.PI / 2); g.translate(x, y + 0.012, z); B.geo('dark', g, -999); }
  { const { x, z } = PL.RING_SLAB; box('plaster', x - 0.5, 15.98, z - 0.5, x + 0.5, 16.045, z + 0.5, -999);
    const g = new THREE.TorusGeometry(0.2, 0.045, 6, 14); g.rotateX(Math.PI / 2); g.translate(x, 16.08, z); B.geo('dark', g, -999); }
  // the place of the ashes on the floor east of the kevesh (Tamid 1:4)
  { const g = new THREE.SphereGeometry(0.62, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.5, 1.2); g.translate(PL.DESHEN_PLACE.x + 0.3, 16, PL.DESHEN_PLACE.z); B.geo('plaster', g, -999); }
}

function buildUlamItems(B, box) {
  // the two tables at the entrance of the house, marble and gold (Menachot 11:7); which is north: illustration
  const table = (k, x, z) => {
    box(k, x - 0.55, 23.38, z - 1.05, x + 0.55, 23.5, z + 1.05, -999);
    box(k, x - 0.5, 23.2, z - 1, x + 0.5, 23.38, z + 1, -999);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(k, x + sx * 0.42 - 0.07, 22, z + sz * 0.92 - 0.07, x + sx * 0.42 + 0.07, 23.2, z + sz * 0.92 + 0.07);
    box(k, x - 0.45, 22.5, z - 0.95, x + 0.45, 22.6, z + 0.95, -999);
  };
  table('wmarble', PL.ULAM_TABLES.marble.x, PL.ULAM_TABLES.marble.z);
  table('gold', PL.ULAM_TABLES.gold.x, PL.ULAM_TABLES.gold.z);
  // golden chains fixed in the Ulam's ceiling (Middot 3:8): links of alternating orientation
  for (const z of [-24, -15, 15, 24]) {
    const y0 = 95, y1 = 25.5, n = Math.round((y0 - y1) / 0.34);
    for (let k = 0; k < n; k++) { const y = y0 - k * 0.34, g = new THREE.BoxGeometry(k % 2 ? 0.05 : 0.16, 0.38, k % 2 ? 0.16 : 0.05); g.translate(-86.5, y - 0.19, z); B.geo('gold', g, -999); }
    box('gold', -87, 94.6, z - 0.5, -86, 95, z + 0.5, -999);
  }
}

function buildNorthChambers(B, box) {
  const N = PL.NORTH_CHAMBERS, z0 = N.z0, z1 = N.z1, H = 27, r = rng(83);
  const xs = [N.salt.x0, N.salt.x1, N.parva.x1, N.rinse.x1];
  // cross walls, a front with a wide opening for each chamber, flat roofs
  for (const x of xs) box('ash', x - 0.5, 16, z0, x + 0.5, H, z1);
  for (const [a, b] of [[N.salt.x0, N.salt.x1], [N.parva.x0, N.parva.x1], [N.rinse.x0, N.rinse.x1]]) {
    const c = (a + b) / 2;
    box('ash', a, 16, z1 - 1, c - 3, H, z1); box('ash', c + 3, 16, z1 - 1, b, H, z1); box('ash', c - 3, 23.5, z1 - 1, c + 3, H, z1);
    box('ash', a - 0.5, H, z0, b + 0.5, H + 0.7, z1 + 0.3, -999);
  }
  // salt: heaps and sacks
  for (let k = 0; k < 3; k++) { const g = new THREE.ConeGeometry(1.2 + r() * 0.4, 1.3 + r() * 0.4, 14); g.translate(N.salt.x0 + 2 + k * 2.6, 16.7, z0 + 2.2 + (k % 2) * 1.2); B.geo('wmarble', g); }
  for (let k = 0; k < 4; k++) B.geo('cedar', lathe([[0.45, 0], [0.55, 0.3], [0.5, 1.0], [0.3, 1.25], [0.12, 1.3]], 10).translate(N.salt.x0 + 1.5 + k * 1.3, 16, z1 - 3));
  // hides: salted on wooden racks
  for (let k = 0; k < 3; k++) {
    const x = N.parva.x0 + 1.8 + k * 2.6;
    box('cedar', x - 0.08, 16, z0 + 1.5, x + 0.08, 19.4, z0 + 1.66); box('cedar', x - 0.08, 16, z0 + 5.5, x + 0.08, 19.4, z0 + 5.66); box('cedar', x - 0.1, 19.3, z0 + 1.4, x + 0.1, 19.5, z0 + 5.8, -999);
    const g = new THREE.BoxGeometry(3.8, 2.4, 0.06, 6, 1, 1); g.rotateY(Math.PI / 2); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + Math.sin(p.getZ(i) * 2) * 0.12);
    g.translate(x + 0.15, 18.1, z0 + 3.6); B.geo('clay', g, -999);
  }
  { const g = new THREE.ConeGeometry(0.8, 0.8, 12); g.translate(N.parva.x1 - 1.6, 16.4, z1 - 2.8); B.geo('wmarble', g); }
  // on the parva's roof: the immersion of the Kohen Gadol on Yom Kippur — a pool in a low walled court
  { const a = N.parva.x0 + 1, b = N.parva.x1 - 1;
    box('ash', a, H + 0.7, z0 + 0.5, b, H + 3, z0 + 1); box('ash', a, H + 0.7, z1 - 1.5, b, H + 3, z1 - 1); box('ash', a, H + 0.7, z0 + 1, a + 0.5, H + 3, z1 - 1.5); box('ash', b - 0.5, H + 0.7, z0 + 1, b, H + 3, z1 - 1.5);
    box('water', a + 1.2, H + 0.72, z0 + 2.2, b - 1.2, H + 0.78, z1 - 2.7, -999); box('ash', a + 0.9, H + 0.7, z0 + 1.9, b - 0.9, H + 0.95, z0 + 2.2, -999); }
  // rinsing: stone troughs with water, a marble table; the winding stair up to the parva's roof (a small stair house)
  for (let k = 0; k < 2; k++) { const x = N.rinse.x0 + 1.4 + k * 3.4; box('ash', x, 16, z0 + 1.2, x + 2.6, 17.1, z0 + 3); box('water', x + 0.2, 16.8, z0 + 1.4, x + 2.4, 16.95, z0 + 2.8, -999); }
  box('wmarble', N.rinse.x0 + 2, 17.2, z1 - 3.6, N.rinse.x0 + 5, 17.4, z1 - 2.2, -999); box('wmarble', N.rinse.x0 + 3.3, 16, z1 - 3.1, N.rinse.x0 + 3.7, 17.2, z1 - 2.7);
  box('ash', N.rinse.x0 + 0.5, H + 0.7, z0 + 0.5, N.rinse.x0 + 3.5, H + 4.2, z0 + 3.5); box('dark', N.rinse.x0 + 0.49, H + 0.7, z0 + 1.2, N.rinse.x0 + 0.5, H + 3.2, z0 + 2.8, -999);
}

function buildAvtinas(B, box) {
  // Beit Avtinas: an upper chamber (Middot 1:1) where the ketoret was compounded; over the Water Gate (illustration)
  const A = PL.BEIT_AVTINAS, y0 = PL.AVTINAS_FLOOR, H = y0 + 8.5, r = rng(29);
  const x0 = A.x0 + 0.5, x1 = A.x1 - 0.5, z0 = A.z0 + 0.5, z1 = A.z1 - 0.5;
  box('ash', x0, y0, z0, x1, y0 + 0.05, z1, -999);
  box('ash', x0, y0, z0, x1, H, z0 + 1); box('ash', x0, y0, z1 - 1, x1, H, z1); box('ash', x0, y0, z0 + 1, x0 + 1, H, z1 - 1); box('ash', x1 - 1, y0, z0 + 1, x1, H, z1 - 1);
  box('wmarble', x0 + 1, y0, z0 + 1, x1 - 1, y0 + 0.1, z1 - 1, -999);
  for (let k = 0; k < 5; k++) { const x = x0 + 2 + k * 3.1; box('dark', x, y0 + 3.2, z0 - 0.01, x + 0.8, y0 + 6.6, z0, -999); box('dark', x, y0 + 3.2, z1, x + 0.8, y0 + 6.6, z1 + 0.01, -999); }
  box('dark', x0 - 0.01, y0 + 0.1, (z0 + z1) / 2 - 1.2, x0, y0 + 5.5, (z0 + z1) / 2 + 1.2, -999);
  // the roof (its own mesh: it opens when the camera comes close)
  box('roofCut', x0 - 0.4, H, z0 - 0.4, x1 + 0.4, H + 0.6, z1 + 0.4, -999);
  // stone mortars with their pestles, jars of spices, sacks, a low table
  for (let k = 0; k < 3; k++) {
    const x = x0 + 3 + k * 3.2, z = z0 + 3.2;
    B.geo('wmarble', lathe([[0.75, 0], [0.8, 0.6], [0.72, 1.0], [0.55, 1.02], [0.5, 0.55], [0.01, 0.5]], 14).translate(x, y0 + 0.1, z));
    const g = new THREE.CylinderGeometry(0.12, 0.16, 1.9, 8); g.rotateZ(0.35); g.translate(x + 0.2, y0 + 1.6, z); B.geo('cedar', g, -999);
  }
  const jar = [[0, 0], [0.3, 0.03], [0.5, 0.35], [0.55, 0.8], [0.45, 1.2], [0.25, 1.4], [0.27, 1.55], [0.01, 1.55]];
  for (let k = 0; k < 11; k++) B.geo('clay', lathe(jar, 10).scale(0.8 + r() * 0.3, 0.8 + r() * 0.3, 0.8 + r() * 0.3).translate(x1 - 2 - (k % 4) * 1.2, y0 + 0.1, z1 - 2 - Math.floor(k / 4) * 1.3));
  for (let k = 0; k < 4; k++) B.geo('cedar', lathe([[0.5, 0], [0.6, 0.3], [0.55, 0.9], [0.3, 1.15], [0.1, 1.2]], 10).translate(x0 + 2 + k * 1.4, y0 + 0.1, z1 - 2.2));
  box('cedar', x0 + 9, y0 + 1.1, z0 + 5.5, x0 + 12.5, y0 + 1.3, z0 + 7.5, -999);
  for (const [x, z] of [[x0 + 9.2, z0 + 5.7], [x0 + 12.3, z0 + 5.7], [x0 + 9.2, z0 + 7.3], [x0 + 12.3, z0 + 7.3]]) box('cedar', x - 0.1, y0 + 0.1, z - 0.1, x + 0.1, y0 + 1.1, z + 0.1);
  for (let k = 0; k < 5; k++) { const g = new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1, 0.5, 1); g.translate(x0 + 9.6 + k * 0.6, y0 + 1.3, z0 + 6.5 + (k % 2) * 0.3); B.geo(k % 2 ? 'wmarble' : 'clay', g, -999); }
}

// Sukkot night: four golden menorot, 50 amot, four gold bowls each (Sukkah 5:2; Bavli 52b)
export const MENOROT = [[58, -26], [58, 26], [89, -26], [89, 26]];
export function buildMenorot(B) {
  for (const [x, z] of MENOROT) {
    B.cyl('gold', x, 6, z, 1.1, 2.1, 2, 16, -999);
    B.cyl('gold', x, 8, z, 0.45, 0.55, 46, 10, -999);
    B.box('gold', x - 3.2, 53.8, z - 0.3, x + 3.2, 54.4, z + 0.3, -999);
    B.box('gold', x - 0.3, 53.8, z - 3.2, x + 0.3, 54.4, z + 3.2, -999);
    for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) B.cyl('gold', x + dx, 54.4, z + dz, 0.95, 0.55, 0.9, 12, -999);
    for (const [dx, dz] of [[1.5, 0], [-1.5, 0]]) {    // a ladder
      const g = new THREE.CylinderGeometry(0.1, 0.1, 50, 5); g.rotateZ(0.12); g.translate(x + 3.1 + dx * 0.4, 30, z + dz); B.geo('cedar', g, -999);
    }
  }
}
