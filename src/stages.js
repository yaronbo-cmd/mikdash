// Phase A construction layer: the 15 build stages as separately revealable groups, the natural hill
// (Mount Moriah) with its boulders, footprints and pins, foundation works, scaffolding, a treadwheel
// crane, workers, and the builder hero (הבנאי). The game logic drives it through createStages(ctx).
// 1 unit = 1 amah; +x east, +z south, +y up. Hot loops reuse preallocated objects (no per-frame garbage).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildMaterial, setBuilding, buildDepthMaterial, BUILD_TIME, revealUniforms, jointUniforms, XRAY, xrayCode } from './batch.js';   // ── twin18 ── (XRAY) ── /twin18 ──
import { rng, makeNoise, smooth, lerp, clamp } from './util.js';
import { terrainH, terrainColor } from './world.js';
import { PLAT } from './mount.js';
import { sawBench as crewsSawBench } from './crews.js';   // ── site14 ── (the saw job's bench)
import * as TX from './tex.js';
import { PROJ } from './game/content.js';   // ── site15 ── (a task's stones are the game's logical ones, PROJ C×P: the scenes map them to the world's)

export const STAGE_IDS = ['har', 'wall', 'sorag', 'gates', 'nashim', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const FOUND = 0.15;   // progress below which the site is in its foundation phase

/* ───────────────────────── per-stage site layout ─────────────────────────
   foot: footprint rects [x0,z0,x1,z1] · base: ground level of the site · bottom: reveal start (default = geometry min y)
   scaff: { lift, gap, rows, runs: [[a], [b], [outward normal], y0, y1] } — runs lie on the building face
   crane: ground = standing beside the stage, jib leaning over it (reach = distance to the setting line)
          top    = standing on the rising masonry, jib leaning out to hoist from the ground (reach = to the pile)
   spot: the hero's work spot (r = nav region) · view: camera direction for focus() · crew: [masons, carriers] */
const DEF = {
  har: {
    foot: [[-300, -480, 277, 400]], base: 0, bottom: -62, stone: 'ash',
    scaff: { lift: 6, gap: 9, rows: 1, runs: [
      [[277, -480], [277, -20], [1, 0], -62, 34], [[277, 132], [277, 400], [1, 0], -62, 34],
      [[-180, -480], [277, -480], [0, -1], -40, 34],
      [[-300, -480], [-300, -76], [-1, 0], -62, 34], [[-300, -42], [-300, 344], [-1, 0], -62, 34],
      [[-300, 400], [-154, 400], [0, 1], -62, 36], [[74, 400], [277, 400], [0, 1], -62, 36]] },
    crane: { mode: 'top', x: 270, z: 72, dir: [1, 0], H: 24, reach: 12 },
    spot: { x: 246, z: 36, face: [277, 36], r: 'out' }, view: { az: -22, el: 24 }, pin: [-40, 0], crew: [10, 8], crewRuns: [0, 1, 0, 1, 0, 2], crewT: [0.35, 0.95],
    // (site8, wave 8B: the plain focus of the Mount's walls frames their working front — the builder, the crane, the crews at
    // the east face — not the whole 880-amah Mount, the owner's "very large zoom-out"; its survey and dig frame the builder's
    // rock: boulderView; key moments still frame the whole Mount)
    frame: { c: [258, 40], r: 44 },
    quarry: [[-30, -90], [10, -20], [-20, 60], [-110, 110], [-230, 40], [-200, -120], [-90, -170], [30, 110]],
  },
  wall: {
    foot: [[-193, -73.5, 147, 73.5]], base: 0, stone: 'ash',
    scaff: { lift: 4, gap: 5.5, rows: 2, runs: [
      [[-193, -73.5], [6, -73.5], [0, -1], 0, 44.5], [[6, -73.5], [141, -73.5], [0, -1], 0, 40.5],
      [[-193, 73.5], [6, 73.5], [0, 1], 0, 44.5], [[6, 73.5], [141, 73.5], [0, 1], 0, 40.5],
      [[147, -73.5], [147, -13], [1, 0], 0, 22.5], [[147, 13], [147, 73.5], [1, 0], 0, 22.5],
      [[-193, -73.5], [-193, 73.5], [-1, 0], 0, 44.5]] },
    crane: { mode: 'ground', x: 44, z: -96, dir: [0, 1], H: 50, reach: 25.5 },
    spot: { x: 98, z: -86, face: [98, -73.5], r: 'chel' }, view: { az: -34, el: 30 }, crew: [10, 7], crewRuns: [1, 1, 0, 1, 4, 1, 6, 0, 1, 2], crewT: [0.08, 0.92],
    // (wave 4: the site's camera frames the working face — the builder, the crane, the crews and their stone pile north of the
    // wall — not the whole 340-amah courts, where people were specks on a phone; key moments still frame the whole site)
    frame: { c: [90, -86], r: 36 },
  },
  sorag: {
    foot: [[-211.5, -92, 165.5, 92]], base: 0, stone: 'ash',
    crane: { mode: 'ground', x: 96, z: -104, dir: [0, 1], H: 20, reach: 11 },
    spot: { x: 172, z: 40, face: [160, 40], r: 'out' }, view: { az: -34, el: 34 }, crew: [8, 6],
  },
  gates: {
    foot: [[-104, -78, -86, -64], [-47, -78, -29, -64], [-169, 64, -151, 78], [-127, 64, -109, 78], [-47, 64, -29, 78], [138, -13, 150, 13]], base: 6, stone: 'ash', bottom: 6,   // ── site14 ── (bottom: the footings below it, temple.js)
    scaff: { lift: 4, gap: 4.5, rows: 2, runs: [
      [[-104, -78], [-86, -78], [0, -1], 6, 51], [[-47, -78], [-29, -78], [0, -1], 6, 51],
      [[-169, 78], [-151, 78], [0, 1], 6, 51], [[-127, 78], [-109, 78], [0, 1], 6, 51], [[-47, 78], [-29, 78], [0, 1], 6, 51],
      [[150, -13], [150, 13], [1, 0], 6, 39]] },
    crane: { mode: 'top', x: 143, z: 6, dir: [1, 0], H: 22, reach: 12 },
    spot: { x: 159, z: 22, face: [150, 6], r: 'chel' }, view: { az: -30, el: 28 }, crew: [8, 6],
  },
  nashim: {
    foot: [[101, -67.5, 141, -27.5], [101, 27.5, 141, 67.5], [6, -67.5, 46, -27.5], [6, 27.5, 46, 67.5], [46, -67.5, 101, -62.8], [46, 62.8, 101, 67.5]], base: 6, stone: 'ash', bottom: 5.99,   // ── site14 ──
    scaff: { lift: 4, gap: 5, rows: 1, runs: [
      [[101, -67.5], [101, -27.5], [-1, 0], 6, 20.5], [[101, -27.5], [141, -27.5], [0, 1], 6, 20.5],
      [[101, 27.5], [101, 67.5], [-1, 0], 6, 20.5], [[101, 27.5], [141, 27.5], [0, -1], 6, 20.5],
      [[46, -67.5], [46, -27.5], [1, 0], 6, 20.5], [[6, -27.5], [46, -27.5], [0, 1], 6, 20.5],
      [[46, 27.5], [46, 67.5], [1, 0], 6, 20.5], [[6, 27.5], [46, 27.5], [0, -1], 6, 20.5]] },
    crane: { mode: 'ground', x: 88, z: -14, dir: [0.62, -0.78], H: 26, reach: 13 },
    spot: { x: 86, z: -34, face: [101, -40], r: 'en' }, view: { az: -40, el: 34 }, crew: [8, 6],
  },
  nikanor: {
    foot: [[-4, -26, 23.5, 26]], base: 6, stone: 'ash', bottom: 5.9,   // ── site14 ──
    scaff: { lift: 4, gap: 4.5, rows: 2, runs: [
      [[10, -14], [10, 14], [1, 0], 6, 51], [[8, -26], [8, -14], [1, 0], 6, 32.5], [[8, 14], [8, 26], [1, 0], 6, 32.5]] },
    crane: { mode: 'top', x: 3, z: -7, dir: [1, 0], H: 24, reach: 13 },
    spot: { x: 34, z: 17, face: [14, 5], r: 'en' }, view: { az: -12, el: 22 }, crew: [6, 5],
  },
  lishka: {
    foot: [[-178, -83, -142, -58], [-100, 58, -62, 82], [-54, -62, -22, -27]], base: 6, stone: 'ash', bottom: 6,   // ── site14 ──
    scaff: { lift: 4, gap: 5, rows: 1, runs: [
      [[-178, -83], [-142, -83], [0, -1], 0, 31], [[-142, -83], [-142, -73.5], [1, 0], 6, 31], [[-178, -83], [-178, -73.5], [-1, 0], 6, 31],
      [[-100, 82], [-62, 82], [0, 1], 0, 29], [[-62, 73.5], [-62, 82], [1, 0], 6, 29], [[-100, 73.5], [-100, 82], [-1, 0], 6, 29]] },
    crane: { mode: 'ground', x: -160, z: -44, dir: [0, -1], H: 30, reach: 16 },
    spot: { x: -18, z: -42, face: [-30, -46], r: 'az' }, view: { az: -55, el: 32 }, crew: [8, 6],
  },
  yesod: {
    foot: [[-54, -19.5, -22, 12.5]], base: 16, stone: 'field',
    crane: { mode: 'ground', x: -13, z: -31, dir: [-0.69, 0.72], H: 24, reach: 13 },
    // (wave 4: the site's camera from the north-east, so the line of sight passes north of the Nikanor gatehouse, which hid the
    // whole altar from the old east view once it was built; the builder, the hot spot and the crews on the east and north faces)
    spot: { x: -16.5, z: -4, face: [-24, -4], r: 'az' }, view: { az: -60, el: 32 }, crew: [6, 5],
  },
  sovev: {
    foot: [[-54, -19.5, -22, 12.5]], base: 16, stone: 'field',
    scaff: { lift: 3, gap: 4, rows: 1, runs: [
      [[-53, -18.5], [-23, -18.5], [0, -1], 16, 22.5], [[-23, -18.5], [-23, 11.5], [1, 0], 16, 22.5],
      [[-53, 11.5], [-23, 11.5], [0, 1], 16, 22.5], [[-53, -18.5], [-53, 11.5], [-1, 0], 16, 22.5]] },
    crane: { mode: 'ground', x: -13, z: -31, dir: [-0.69, 0.72], H: 24, reach: 14 },
    spot: { x: -16.5, z: -4, face: [-24, -4], r: 'az' }, view: { az: -60, el: 32 }, crew: [6, 5],
  },
  guf: {
    foot: [[-54, -19.5, -22, 12.5], [-46, 12.5, -30, 42.5]], base: 16, stone: 'field',
    scaff: { lift: 3, gap: 4, rows: 1, runs: [
      [[-52, -17.5], [-24, -17.5], [0, -1], 16, 25.5], [[-24, -17.5], [-24, 10.5], [1, 0], 16, 25.5], [[-52, -17.5], [-52, 10.5], [-1, 0], 16, 25.5]] },
    crane: { mode: 'ground', x: -13, z: -31, dir: [-0.69, 0.72], H: 26, reach: 15 },
    spot: { x: -16.5, z: -4, face: [-24, -4], r: 'az' }, view: { az: -60, el: 32 }, crew: [6, 5],
  },
  karnot: {
    foot: [[-54, -19.5, -22, 12.5]], base: 16, stone: 'field',
    crane: { mode: 'ground', x: -13, z: -31, dir: [-0.69, 0.72], H: 26, reach: 15 },
    spot: { x: -16.5, z: -4, face: [-24, -4], r: 'az' }, view: { az: -60, el: 36 }, crew: [5, 4],
  },
  kiyor: {
    foot: [[-66, 17.5, -61, 22.5]], base: 16, stone: 'bronze',
    crane: { mode: 'ground', x: -63, z: 30, dir: [0, -1], H: 16, reach: 9.5 },
    spot: { x: -55, z: 22, face: [-63.5, 20], r: 'az' }, view: { az: 30, el: 32 }, crew: [3, 3],
  },
  ulam: {
    foot: [[-92, -50, -71.6, 50], [-76.2, -50, -55, 50]], base: 16, stone: 'marble',
    scaff: { lift: 4, gap: 5, rows: 2, runs: [
      [[-71.6, -50], [-71.6, 50], [1, 0], 16, 116], [[-92, -50], [-71.6, -50], [0, -1], 16, 116], [[-92, 50], [-71.6, 50], [0, 1], 16, 116]] },
    crane: { mode: 'top', x: -84, z: -30, dir: [1, 0], H: 30, reach: 17 },
    spot: { x: -48, z: 30, face: [-70, 22], r: 'az' }, view: { az: -8, el: 18 }, crew: [9, 6],
  },
  heichal: {
    foot: [[-139, -35, -92, 35]], base: 16, stone: 'marble',
    scaff: { lift: 4, gap: 5, rows: 2, runs: [
      [[-139, -35], [-92, -35], [0, -1], 16, 116], [[-139, 35], [-92, 35], [0, 1], 16, 116], [[-139, -35], [-139, 35], [-1, 0], 16, 116]] },
    crane: { mode: 'top', x: -104, z: -26, dir: [0, -1], H: 28, reach: 16 },
    // (wave 4: from the east-north-east and higher, over the azara's north wall and its chambers, which hid the court north of
    // the house where the kohanim work; framed on that court and the rising north face, up to 40 amot of it)
    spot: { x: -116, z: -47, face: [-116, -35], r: 'az' }, view: { az: -30, el: 34 }, crew: [9, 6], frame: { c: [-121, -42], r: 34, y: 'reveal' },
  },
  kodesh: {
    foot: [[-176, -35, -139, 35]], base: 16, stone: 'marble',
    scaff: { lift: 4, gap: 5, rows: 2, runs: [
      [[-176, -35], [-139, -35], [0, -1], 16, 116], [[-176, 35], [-139, 35], [0, 1], 16, 116], [[-176, -35], [-176, 35], [-1, 0], 16, 116]] },
    crane: { mode: 'top', x: -168, z: -26, dir: [0, -1], H: 28, reach: 16 },
    spot: { x: -158, z: -47, face: [-158, -35], r: 'az' }, view: { az: -62, el: 26 }, crew: [8, 6],
  },
};
const STONE = { ash: '#D8C9A6', marble: '#EEE8DC', field: '#D9D2C2', bronze: '#C99A5B' };
// the hot spot (a glowing stone laid on the build line, on the side the hero works from): [x, z, top, floor]
// (nikanor: below its floor the stone sits on the fifteen steps at [x, z, bottom])
const HOT = {
  har: [272, 36, 32, -62], wall: [98, -70.5, 40.25, 0], sorag: [156, 40, 6, 0], gates: [148, 9, 38.25, 6],
  nashim: [102, -40, 20.4, 6], nikanor: [8.5, 9.5, 50.25, 13.5, 17.2, 6.9, 6], lishka: [-27.5, -58.6, 20.5, 16],
  yesod: [-24.5, -4, 17, 16], sovev: [-24.5, -4, 22, 17], guf: [-25.5, -4, 25, 22], karnot: [-24.5, -17, 26, 25],
  kiyor: [-62.5, 20.3, 23.1, 16], ulam: [-78.5, 24.6, 112, 22.4], heichal: [-116, -33, 112, 16], kodesh: [-158, -33, 112, 16],
};
// ── site13 ── (PRODUCER-S13a #6; the owner: "בעזרת נשים ומצורעים לא בטוח שראיתי את זה") the Ezrat Nashim's four corner chambers
// (temple.js set 'nashim-lc'), in the order they rise in the finish "לשכות הפינות": the one beside his finish spot first. r: the
// chamber's rect · n: its name · d: what it was for (מדות ב, ה; טיוטה) · at: where he stands to raise it (its door) · face.
const NASHIM_LC = [
  { r: [101, -67.5, 141, -27.5], n: 'לשכת דיר העצים', d: 'כאן בדקו כהנים בעלי מום את עצי המערכה מתולעת', at: [121, -21], face: [121, -29] },
  { r: [6, -67.5, 46, -27.5], n: 'לשכת המצורעים', d: 'בפינה הצפונית־מערבית של עזרת הנשים', at: [26, -21], face: [26, -29] },
  { r: [6, 27.5, 46, 67.5], n: 'לשכת בית שמניה', d: 'שם נתנו יין ושמנים (אבא שאול)', at: [26, 21], face: [26, 29] },
  { r: [101, 27.5, 141, 67.5], n: 'לשכת הנזירים', d: 'שם בישלו הנזירים את שלמיהם וגילחו את שערם', at: [121, 21], face: [121, 29] },
];
// the quarry: a limestone outcrop left on the new platform (NE), cut back for stone while the Temple rises
const QX = 208, QZ = -208, QSPOT = { x: 196, z: -199, face: [208, -208] };
const QROCKS = [[210, -210, 10.5, 1.25, 0.3], [223, -200, 8, 1.1, 1.9], [215, -225, 8.5, 1.05, 4.1], [198, -221, 6, 1.0, 2.6], [230, -219, 5.5, 0.95, 5.3]];
// fresh-cut benches on the face the builder works, a lever, half-cut blocks: [x, y, z, sx, sy, sz, yaw, colour, pitch]
const QBENCH = [[201.6, 1.0, -203.2, 4.2, 2.0, 13, 0.64, '#EAE0C8'], [203.6, 2.0, -204.7, 4.2, 4.0, 11, 0.64, '#E3D8BE'], [205.6, 3.0, -206.2, 4.2, 6.0, 9, 0.64, '#DCD0B4'],
  [199.4, 1.3, -205.5, 0.2, 0.2, 5.6, 2.3, '#6B4E31', -0.35]];
// where the cut stone waits for the carts (6 blocks a pile), beside the path in from the east side of the platform
const QPILES = [[185, -190, 0.05], [203, -186, 0.1], [185, -179, 0], [203, -175, 0], [185, -168, 0.05], [203, -164, 0.1]];
// ── site11 ── (PRODUCER10 top-10 #6, FUN11's opener) the game table by the quarry: under a striped awning, a board and its pieces,
// two benches — a door to the in-between games in the world (a tap on it opens them: main.js `// ── site11 ──`)
const GTAB = { x: 168, z: -174, yaw: 0.35 };

/* ───────────────────────── small geometry helpers ───────────────────────── */
function strip(g) { g = g.index ? g.toNonIndexed() : g; for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a); return g; }
// colour a part; tint = how much the instance colour applies (workers); bone = rigid skin binding (hero)
function part(g, hex, { tint = -1, bone = -1, glow = -1 } = {}) {
  g = strip(g);
  const n = g.attributes.position.count, c = new THREE.Color(hex), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  if (tint >= 0) g.setAttribute('aTint', new THREE.BufferAttribute(new Float32Array(n).fill(tint), 1));
  if (glow >= 0) g.setAttribute('aGlow', new THREE.BufferAttribute(new Float32Array(n).fill(glow), 1));
  if (bone >= 0) {
    const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { si[i * 4] = bone; sw[i * 4] = 1; }
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    g.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
  }
  return g;
}
// a cylinder between two points
function rod(a, b, r0, r1 = r0, seg = 6) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), d = Bv.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1);
  g.translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  g.translate(A.x, A.y, A.z);
  return g;
}
const boxAt = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
function canvasTex(size, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const easeIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOut = (u) => 1 - Math.pow(1 - u, 3);
const easeIn = (u) => u * u * u;

/* ───────────────────────── the natural hill ─────────────────────────
   A rocky mound over the platform footprint, highest at the future Holy of Holies (the Foundation Stone),
   a spur running north, limestone terraces. While `har` builds, the vertex shader levels it: inside the
   footprint the fill rises behind the retaining walls and the crest is cut down to the paving; a 4-amot
   trench is opened along the walls; outside, the slopes settle back to the valley terrain. */
const HN1 = makeNoise(101), HN2 = makeNoise(202), HN3 = makeNoise(303);
const { X0, X1, Z0, Z1 } = PLAT, TRENCH = 4;
function hillBump(x, z) {
  // a north–south ridge, crest near the future Holy of Holies, falling steeply west (Tyropoeon), gently east (Kidron) and south (Ophel)
  const dx = (x + 140) / (x < -140 ? 150 : 215), dz = (z + 20) / (z < -20 ? 430 : 300);
  let b = 84 * Math.exp(-(dx * dx + dz * dz) * 1.45);
  const n1 = HN1(x / 110, z / 110, 4), n2 = HN2(x / 26, z / 26, 3);
  b += (n1 - 0.5) * 22 * smooth(0, 26, b) + (1 - Math.abs(2 * n2 - 1)) * 4.2 * smooth(3, 30, b);
  // irregular limestone benches with rocky risers — (site8, from WORLD8's s8-world 0b0bcd2) broken up: they come and go in
  // patches (bm), their height and the warp of their line vary, so no riser runs round the hill as one long band
  const wp = (HN3(x / 55 + 11, z / 55 - 4, 3) - 0.5) * 16 + (HN1(x / 19 - 3, z / 19 + 8, 2) - 0.5) * 5;
  const st = 5.2 + 3 * HN2(x / 140 + 2, z / 140 - 6, 2), t = (b + wp) / st, fl = Math.floor(t);
  const bm = smooth(0.32, 0.62, HN1(x / 70 + 7, z / 70 - 5, 3));
  b = lerp(b, (fl + smooth(0.7, 1, t - fl)) * st - wp, 0.66 * smooth(3, 12, b) * (0.2 + 0.8 * bm));
  b += 4 * smooth(26, 0, Math.hypot(x + 150, z)) * (0.6 + 0.8 * HN3(x / 7, z / 7, 2));   // the bare summit rock
  return Math.max(0, b);
}
const dOut = (x, z) => Math.max(X0 - x, x - X1, Z0 - z, z - Z1, 0);
function hillY0(x, z) {
  const inner = -49 + 15 * smooth(-380, -480, z), d = dOut(x, z);
  // outside the platform the surface lies just over the terrain while it takes on the terrain's look (see the
  // colour blend in makeHill), then sinks under it, so the rim never shows as a line
  const base = d > 0 ? lerp(inner, terrainH(x, z) + 0.5, smooth(0, 10, d)) - 2 * smooth(40, 62, d) : inner;
  // the spur runs on to the north: its slopes die away slowly and irregularly there, quickly into the valleys
  const north = d > 0 ? clamp((Z0 - z) / d, 0, 1) : 0;
  const fade = (40 + 80 * north) * (0.8 + 0.4 * HN1(x / 70 + 3, z / 70, 2));
  return base + hillBump(x, z) * smooth(fade, 0, d);
}

function makeHill(T) {
  const lines = (a0, a1, m, m1 = m) => {
    const L = new Set();
    for (let v = a0 - m; v <= a1 + m1 + 1e-6; v += 6) L.add(+v.toFixed(3));
    const sp = [a0, a0 + 0.25, a0 + TRENCH - 0.25, a0 + TRENCH, a1 - TRENCH, a1 - TRENCH + 0.25, a1 - 0.25, a1];
    const out = [...L].filter((v) => sp.every((s) => Math.abs(v - s) > 1.2)).concat(sp);
    return Float64Array.from(out.sort((p, q) => p - q));
  };
  const XS = lines(X0, X1, 66), ZS = lines(Z0, Z1, 150, 66), nx = XS.length, nz = ZS.length, N = nx * nz;
  const pos = new Float32Array(N * 3), uv = new Float32Array(N * 2), col = new Float32Array(N * 3);
  const ter = new Float32Array(N), kk = new Float32Array(N), y0 = new Float32Array(N), bl = new Float32Array(N);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i, x = XS[i], z = ZS[j];
    const y = hillY0(x, z);
    pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z; y0[k] = y;
    uv[k * 2] = x / 26; uv[k * 2 + 1] = -z / 26;
    ter[k] = terrainH(x, z);
    const out = x <= X0 || x >= X1 || z <= Z0 || z >= Z1;
    kk[k] = out ? 0 : (x < X0 + TRENCH || x > X1 - TRENCH || z < Z0 + TRENCH || z > Z1 - TRENCH) ? 1 : 2;
  }
  const idx = [];
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // colours: pale rock on steep ground and the crest, dry grass and scrub on the benches, dust at the rim
  const nor = g.attributes.normal.array, C = (h) => new THREE.Color(h);
  const rock = C('#E4DCCB'), rockD = C('#C4B79E'), grass = C('#B9B27A'), grassB = C('#A4A767'), soil = C('#B98E68'), scrub = C('#7F8C4E'), dust = C('#D6C8A6');
  const c = new THREE.Color(), tc = new THREE.Color();
  for (let k = 0; k < N; k++) {
    const x = pos[k * 3], z = pos[k * 3 + 2], ny = nor[k * 3 + 1];
    c.copy(grass).lerp(grassB, HN2(x / 70 + 5, z / 70, 3));
    c.lerp(soil, smooth(0.55, 0.75, HN1(x / 45 - 7, z / 45 + 2, 3)) * 0.45);            // terra rossa between the rocks
    c.lerp(soil, smooth(0.6, 0.8, HN2(x / 16 + 4, z / 16 - 1, 2)) * 0.4);               // (site8/world8) small pockets of red earth
    c.lerp(scrub, smooth(0.6, 0.8, HN3(x / 30, z / 30, 3)) * 0.65);
    c.lerp(scrub, smooth(0.62, 0.8, HN1(x / 11 + 2, z / 11 + 5, 2)) * 0.5);             // (site8/world8) scrub in clumps
    // (site8/world8) rock: the risers only in outcrops (oc), not a pale line along each; bare slabs here and there off them
    const oc = HN3(x / 21 + 1, z / 21 + 9, 2);
    c.lerp(rock, clamp(smooth(0.95, 0.8, ny) * (0.3 + 1.1 * oc) + smooth(10, 26, y0[k]) * 0.5 + smooth(0.74, 0.86, HN2(x / 13 - 5, z / 13 + 3, 2)) * 0.55, 0, 1));
    c.lerp(rockD, smooth(0.55, 0.75, HN1(x / 18 + 3, z / 18, 2)) * 0.3 * smooth(0.97, 0.85, ny));
    c.lerp(dust, smooth(-30, -46, y0[k]) * 0.4);
    // melt into the surrounding terrain along an irregular line: past it the hill takes the terrain's own colour,
    // texture and flat shading (aBl, see the shader), so where it finally sinks under the terrain nothing shows
    const m = smooth(-6, 30, dOut(x, z) + (HN2(x / 48 + 9, z / 48 - 3, 2) - 0.5) * 26);
    if (m > 0) {
      const gx = terrainH(x + 2, z) - terrainH(x - 2, z), gz = terrainH(x, z + 2) - terrainH(x, z - 2);
      c.lerp(terrainColor(x, z, ter[k], 4 / Math.hypot(gx, 4, gz), tc), m);
    }
    bl[k] = m;
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aTer', new THREE.BufferAttribute(ter, 1));
  g.setAttribute('aK', new THREE.BufferAttribute(kk, 1));
  g.setAttribute('aBl', new THREE.BufferAttribute(bl, 1));
  g.computeBoundingSphere();
  const U = { uCut: { value: 0 }, uFill: { value: -1000 }, uFillCol: { value: new THREE.Color('#BFA27C') }, uCutCol: { value: new THREE.Color('#E6DDCB') }, uGround: { value: T.ground.map },
    // ── site8 ── the levelled patches where the rocks stood: (x, z, half size, level); half size 0 = none (siteLife grows them)
    uPatch: { value: Array.from({ length: 12 }, () => new THREE.Vector4(0, 0, 0, 0)) },
    // ── site9 ── the Mount's working bay (x0, z0, x1, z1; off when x1 < x0) and how far it is dug (0…1): see harBay
    uPit: { value: new THREE.Vector4(0, 0, -1, -1) }, uPitK: { value: 0 },
    // ── site12 ── the crest's cut: x the floor being cut this course, y the floor of the course before, z the sweep's front
    // (0…1 across the crest from the east, hSw), w a bench's height; x = y = 1000: uncut
    uCrest: { value: new THREE.Vector4(1000, 1000, 0, 2.5) },
    // ── site12 ── the plaza's paving laid from the west as the last courses go up: x the paving's front (paved west of it), y on;
    // east of the front the fill lies a little over the paving's top, so the brown fill shows until it is paved
    uPave: { value: new THREE.Vector2(1e4, 0) } };
  // ── site12 ── (the owner's note 2, 29.9 21:01: "בשלב שיטוח ההר צריך שכשעושים זום אאוט רואים את ההתקדמות של החציבה. אני בשלב 3
  // עכשיו וזה נראה בדיוק כמו בשלב ראשון") the crest comes down in benches, COURSE BY COURSE: each of the Mount's six courses
  // cuts a new floor (uCrest.x) swept across the crest from the east over the last course's floor (uCrest.y), with a rim of
  // three benches cut into the slope below it; the rest of the hill keeps its shape and its colours until the fill (uFill,
  // behind the rising walls) buries it. (v21 squashed the whole crest by uCut and washed the hill one brown: from far every
  // course looked the same.) The CPU mirror (hv) draws the same.
  const morph = `
    float hY0 = position.y;
    float hSw = clamp((14.0 - position.x + 16.0 * sin(position.z / 61.0)) / 270.0, 0.0, 1.0);
    float hLv = mix(uCrest.y, uCrest.x, 1.0 - smoothstep(uCrest.z - 0.012, uCrest.z + 0.012, hSw));
    float hBt = (hY0 - hLv) / uCrest.w;
    float hYc = hBt >= 0.0 ? hLv : (hBt > -3.0 ? hLv + uCrest.w * (floor(hBt) + smoothstep(0.72, 1.0, fract(hBt))) : hY0);
    // (site9: the working bay at the Mount's working front is dug down to the fill, so the first courses are seen from the hill)
    if (aK > 1.5 && uPit.z > uPit.x) { vec2 pq = max(uPit.xy - position.xz, position.xz - uPit.zw);
      hYc = mix(hYc, min(hYc, uFill), (1.0 - smoothstep(-4.0, 4.0, max(pq.x, pq.y))) * uPitK); }
    float hYI = max(hYc, min(uFill, -0.4));
    if (aK > 1.5 && uPave.y > 0.5 && position.x >= uPave.x) hYI = max(hYI, 0.35);   // ── site12 ── (not yet paved)
    float hY = aK < 0.5 ? mix(hY0, aTer - 0.6, uCut) : (aK < 1.5 ? (uCut > 0.0 ? -155.0 : hY0) : hYI);
    float hPk = 0.0, hPl = 0.0;
    if (aK > 1.5) for (int i = 0; i < 12; i++) { vec4 P = uPatch[i]; if (P.z <= 0.0) continue;
      vec2 d = abs(position.xz - P.xy); float k = 1.0 - smoothstep(P.z * 0.72, P.z, max(d.x, d.y));
      if (k > hPk) { hPk = k; hPl = P.w; } }
    hPk *= 1.0 - smoothstep(0.0, 0.3, uCut);
    hY = mix(hY, hPl, hPk * 0.92);`;
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(1.3, 1.3, 1.3), vertexColors: true, map: T.rock.map, normalMap: T.rock.normalMap, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.96 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aTer; attribute float aK; attribute float aBl; uniform float uCut; uniform float uFill; uniform vec4 uPatch[12]; uniform vec4 uPit; uniform float uPitK; uniform vec4 uCrest; uniform vec2 uPave; varying float vLev; varying float vWk; varying float vNw; varying float vLv; varying float vDp; varying float vH0; varying vec2 vHXZ; varying float vBl; varying float vPk;')
      .replace('#include <beginnormal_vertex>', `${morph}
    float hFlat = aK > 1.5 ? max(step(hYc + 0.01, hYI), hPk) : uCut;
    vPk = hPk;
    vLev = aK > 1.5 ? step(hYc + 0.01, hYI) : 0.0;
    // ── site12 ── the worked crest (its floor and benches: fresh-cut rock, lit by its facets), the floor cut this course, and
    // the spoil tipped on the slope just above the fill (the next lift); everything else keeps the hill's own colours (v21
    // washed it all brown by the second course: "the site is cleared soon after the works begin")
    vWk = aK > 1.5 && hBt > -3.0 ? 1.0 - vLev : 0.0;
    vNw = hLv < uCrest.y - 0.3 ? 1.0 : 0.0;
    vLv = hLv;
    vDp = aK > 1.5 && uFill > -999.0 ? (1.0 - smoothstep(uFill + 4.0, uFill + 12.0, hYc)) * (1.0 - vLev) * (1.0 - vWk) : 0.0;
    vH0 = hY0;
    vHXZ = position.xz;
    vBl = aBl;
    vec3 objectNormal = normalize(mix(normal, vec3(0.0, 1.0, 0.0), hFlat));
    #ifdef USE_TANGENT
      vec3 objectTangent = vec3(tangent.xyz);
    #endif`)
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(position.x, hY, position.z);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform vec3 uFillCol; uniform vec3 uCutCol; uniform sampler2D uGround; uniform vec4 uCrest; varying float vLev; varying float vWk; varying float vNw; varying float vLv; varying float vDp; varying float vH0; varying vec2 vHXZ; varying float vBl; varying float vPk;
        float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float hn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hh(i), hh(i + vec2(1.0, 0.0)), f.x), mix(hh(i + vec2(0.0, 1.0)), hh(i + vec2(1.0, 1.0)), f.x), f.y); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        // ── site12 ── the worked crest: fresh-cut rock with the chisel's lines, its benches' risers darker (from far, the rings of
        // the benches), this course's new floor paler than the last course's; the spoil tipped above the fill: loose, lumpy
        { float bt = (vH0 - vLv) / uCrest.w, rz = bt < 0.0 && bt > -3.0 ? smoothstep(0.6, 0.78, fract(bt)) : 0.0;
          float cl = smoothstep(0.9, 1.0, abs(fract(vHXZ.x / 2.5 + 0.2 * hn(vHXZ / 5.0)) * 2.0 - 1.0)) * 0.6;
          // (the rock map's own grain kept — a flat pale wash read as fog from far, PRODUCER12 N70 — and blotches of 20–50 amot)
          float tl = clamp(dot(diffuseColor.rgb, vec3(0.333)) / max(0.05, 1.3 * dot(vColor.rgb, vec3(0.333))), 0.0, 1.4);
          float bl = 0.82 + 0.1 * hn(vHXZ / 19.0) + 0.1 * hn(vHXZ / 47.0 + 3.0);
          // (linear colour: a warm limestone of sRGB ≈ #BCB09A — the r1/r2 shots' 0.8 read white under the noon sun)
          vec3 wc = vec3(0.5, 0.43, 0.32) * bl * (0.74 + 0.3 * tl) * (1.0 - 0.1 * cl) * mix(0.9, 1.08, vNw) * (1.0 - 0.3 * rz);
          diffuseColor.rgb = mix(diffuseColor.rgb, wc, clamp(vWk, 0.0, 1.0) * 0.92); }
        { float n = hn(vHXZ / 4.0), lp = step(0.7, hn(vHXZ / 2.7 + 7.0));
          vec3 dc = mix(uFillCol * 0.95, vec3(0.42, 0.33, 0.22), 0.3 + 0.3 * n) * (1.0 - 0.2 * lp);
          diffuseColor.rgb = mix(diffuseColor.rgb, dc, clamp(vDp, 0.0, 1.0) * 0.85); }
        { float n = hn(vHXZ / 23.0) * 0.6 + hn(vHXZ / 6.0) * 0.4, sp = step(0.83, hn(vHXZ / 2.3));
          vec3 fc = uFillCol * (0.8 + 0.34 * n) + vec3(0.12, 0.1, 0.07) * sp;
          diffuseColor.rgb = mix(diffuseColor.rgb, fc, clamp(vLev, 0.0, 1.0) * 0.9); }
        diffuseColor.rgb = mix(diffuseColor.rgb, vColor.rgb * texture2D(uGround, vec2(vHXZ.x, -vHXZ.y) / 30.0).rgb, vBl);
        { float cl = smoothstep(0.93, 1.0, abs(fract(vHXZ.x / 3.0) * 2.0 - 1.0)) * 0.5 + smoothstep(0.95, 1.0, abs(fract(vHXZ.y / 1.5 + 0.3 * hn(vHXZ / 4.0)) * 2.0 - 1.0)) * 0.35;
          // ── site8 ── the levelled patch: fresh-cut rock, paler than the weathered hill but keeping its grain, the chisel's lines
          vec3 pc = uCutCol * (0.8 + 0.1 * hn(vHXZ / 2.0)) * (1.0 - 0.16 * cl) * (0.62 + 0.45 * dot(diffuseColor.rgb, vec3(0.333)));
          diffuseColor.rgb = mix(diffuseColor.rgb, pc, smoothstep(0.35, 0.8, vPk) * 0.72); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        normal = normalize(mix(normal, nonPerturbedNormal, vBl));
        // ── site12 ── the cut rock lit by its own facets: the benches' treads and risers, the sweep's fresh face
        if (vWk > 0.5) normal = normalize(mix(normal, normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition))), 0.85));`);
  };
  mat.customProgramCacheKey = () => 'hill';
  const depth = new THREE.MeshDepthMaterial();
  depth.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aTer; attribute float aK; uniform float uCut; uniform float uFill; uniform vec4 uPatch[12]; uniform vec4 uPit; uniform float uPitK; uniform vec4 uCrest; uniform vec2 uPave;')
      .replace('#include <begin_vertex>', `${morph}\nvec3 transformed = vec3(position.x, hY, position.z);`);
  };
  depth.customProgramCacheKey = () => 'hilldepth';
  const mesh = new THREE.Mesh(g, mat);
  mesh.customDepthMaterial = depth;
  mesh.receiveShadow = true; mesh.castShadow = true; mesh.matrixAutoUpdate = false; mesh.frustumCulled = false;
  mesh.name = 'hill';

  // CPU mirror of the shader (heights of the rendered triangles)
  let patchN = 0;   // ── site8 ── patches on (siteLife sets it through setPatchN)
  // ── site12 ── each vertex's place in the crest's sweep (hSw in the shader), fixed
  const sw = new Float32Array(N);
  for (let k = 0; k < N; k++) sw[k] = clamp((14 - pos[k * 3] + 16 * Math.sin(pos[k * 3 + 2] / 61)) / 270, 0, 1);
  const hv = (k) => {
    const Y = y0[k], cut = U.uCut.value;
    if (kk[k] < 0.5) return lerp(Y, ter[k] - 0.6, cut);
    if (kk[k] < 1.5) return cut > 0 ? -155 : Y;
    // ── site12 ── the crest's floor and its benches, as the shader cuts them
    const C = U.uCrest.value, lv = lerp(C.y, C.x, 1 - smooth(C.z - 0.012, C.z + 0.012, sw[k])), bt = (Y - lv) / C.w;
    let yc = bt >= 0 ? lv : bt > -3 ? lv + C.w * (Math.floor(bt) + smooth(0.72, 1, bt - Math.floor(bt))) : Y;
    // (site9: the working bay, as the shader digs it)
    { const P = U.uPit.value; if (P.z > P.x && U.uPitK.value > 0) { const px = pos[k * 3], pz = pos[k * 3 + 2], pd = Math.max(P.x - px, px - P.z, P.y - pz, pz - P.w); yc = lerp(yc, Math.min(yc, U.uFill.value), (1 - smooth(-4, 4, pd)) * U.uPitK.value); } }
    let y = Math.max(yc, Math.min(U.uFill.value, -0.4));
    { const P = U.uPave.value; if (P.y > 0.5 && pos[k * 3] >= P.x) y = Math.max(y, 0.35); }   // ── site12 ── (not yet paved)
    // (site8: the levelled patches, as the shader draws them)
    if (patchN && cut < 0.3) {
      const px = pos[k * 3], pz = pos[k * 3 + 2]; let pk = 0, pl = 0;
      for (const P of U.uPatch.value) { if (P.z <= 0) continue; const kk2 = 1 - smooth(P.z * 0.72, P.z, Math.max(Math.abs(px - P.x), Math.abs(pz - P.y))); if (kk2 > pk) { pk = kk2; pl = P.w; } }
      if (pk > 0) y = lerp(y, pl, pk * 0.92 * (1 - smooth(0, 0.3, cut)));
    }
    return y;
  };
  const find = (A, v) => { const n = A.length; if (v <= A[0]) return 0; if (v >= A[n - 1]) return n - 2; let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (A[m] <= v) lo = m; else hi = m; } return lo; };
  function heightAt(x, z) {
    const i = find(XS, x), j = find(ZS, z);
    const u = clamp((x - XS[i]) / (XS[i + 1] - XS[i]), 0, 1), v = clamp((z - ZS[j]) / (ZS[j + 1] - ZS[j]), 0, 1);
    const a = j * nx + i, b = a + 1, c2 = a + nx, d = c2 + 1;
    if (u + v <= 1) { const ha = hv(a); return ha + (hv(b) - ha) * u + (hv(c2) - ha) * v; }
    const hd = hv(d); return hd + (hv(c2) - hd) * (1 - u) + (hv(b) - hd) * (1 - v);
  }

  // scrub, a few wild olives and bare bedrock slabs on the slopes (cleared when the works begin)
  const r = rng(515), bushes = [];
  for (let t = 0; t < 3000 && bushes.length < 170; t++) {
    const x = X0 + 16 + r() * (X1 - X0 - 32), z = Z0 + 16 + r() * (Z1 - Z0 - 32);
    const y = heightAt(x, z), sl = Math.abs(heightAt(x + 5, z) - y) + Math.abs(heightAt(x, z + 5) - y);
    const rockish = r() < 0.3;
    if (!rockish && (HN3(x / 40, z / 40, 2) < 0.45 || sl > 4.5)) continue;
    if (rockish && y < -40) continue;
    if (Math.abs(x + 150) < 16 && Math.abs(z) < 16) continue;
    const k = rockish ? 2.2 + r() * 4.5 : 1.3 + r() * 2.4, tree = !rockish && r() < 0.16;
    if (BOULDERS.some((b) => Math.hypot(x - b[0], z - b[1]) < b[2] + 6)) continue;   // ── site9 ── (none in the boulder field's rocks)
    bushes.push([x, y, z, tree ? k * 1.7 : k, r() * 6.28, rockish ? 1 : tree ? 2 : 0]);
  }
  const bg = new THREE.IcosahedronGeometry(1, 0);
  const bm = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }), bushes.length);
  { const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), cc = new THREE.Color(), e = new THREE.Euler();
    const pal = ['#5F7040', '#6C7A45', '#56673A', '#76834B'].map((h) => new THREE.Color(h)), rk = ['#BFB6A1', '#B3A993', '#C8C0AD'].map((h) => new THREE.Color(h)), ol = new THREE.Color('#7D8A63');
    bushes.forEach(([x, y, z, k, a, kind], i) => {
      if (kind === 1) { e.set((r() - 0.5) * 0.4, a, (r() - 0.5) * 0.4); q.setFromEuler(e); p.set(x, y - k * 0.16, z); s.set(k * 1.7, k * 0.34, k * 1.25); cc.copy(rk[i % 3]); }
      else if (kind === 2) { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a); p.set(x, y + k * 0.75, z); s.set(k * 1.25, k * 0.8, k * 1.2); cc.copy(ol); }
      else { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), a); p.set(x, y + k * 0.3, z); s.set(k * 1.3, k * 0.75, k * 1.1); cc.copy(pal[i % 4]); }
      M.compose(p, q, s); bm.setMatrixAt(i, M); bm.setColorAt(i, cc);
    }); }
  bm.castShadow = true; bm.receiveShadow = true; bm.frustumCulled = false;
  // ── site12 ── the scrub stays on the hill until the works reach it (v21 cleared it all at the first course): gone under the
  // fill and the spoil tipped just above it, and from the cut crest with its benches
  const bushM = bushes.map((_, i) => { const M = new THREE.Matrix4(); bm.getMatrixAt(i, M); return M; }), ZM = new THREE.Matrix4().makeScale(0, 0, 0);
  const bushOff = new Uint8Array(bushes.length);
  function bushCull(fill, C) {
    let ch = false;
    bushes.forEach(([x, y, z], i) => {
      const s = clamp((14 - x + 16 * Math.sin(z / 61)) / 270, 0, 1), lv = lerp(C.y, C.x, 1 - smooth(C.z - 0.012, C.z + 0.012, s));
      const off = y < fill + 13 || y > lv - 3 * C.w - 1 ? 1 : 0;
      if (off !== bushOff[i]) { bushOff[i] = off; bm.setMatrixAt(i, off ? ZM : bushM[i]); ch = true; }
    });
    if (ch) bm.instanceMatrix.needsUpdate = true;
    return ch;
  }
  return { mesh, bushes: bm, U, heightAt, bushCull, setPatchN: (n) => { patchN = n; } };
}

/* ───────────────────────── boulders ───────────────────────── */
// ── site9 ── the boulder field (DESIGN8B §4 "bring the work to the hero", STAGING-he "ההחלטה הבימויית"): the 12 rocks the builder
// breaks lie in one field on the Mount's east shoulder, from boulder 4's spot (128, −84) toward the crane and the courses spot
// (246, 36), in a zigzag ≈ 24 amot apart (≈ 2.2 s of walking each, ≈ 24 s for the run instead of ≈ 80 s over 430 × 260 amot), the
// last rock 24 amot from where the walls begin; the ground there slopes ≤ 12°. Radii kept per index (G.bh's order, old saves
// unchanged). BORDER = the strike order along the path (nearest-first from the builder's own spot walks the same order).
// v17's spread: [[-172,-122],[-96,-132],[-24,-118],[60,-110],[128,-84],[178,-30],[186,40],[124,112],[34,124],[-58,118],[-142,124],[-240,-30]]
const BOULDERS = [[206.3, -8.6, 8.6], [202.3, 15.3, 7.4], [225.9, 10.3, 9.2], [221.8, 34.1, 7.8], [128, -84, 8.4], [123.9, -60.2, 7.6],
  [147.6, -65.1, 8.8], [143.5, -41.3, 7.4], [167.2, -46.3, 8.4], [163.1, -22.5, 7.8], [186.8, -27.4, 8.6], [182.7, -3.6, 9]];
const BORDER = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3];
function makeBoulderChunks(T) {
  // one rock, cut into three pie slices around its vertical axis (fresh stone shows in the cuts)
  let g = new THREE.IcosahedronGeometry(1, 2);
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  g = mergeVerticesSimple(g);
  const p = g.attributes.position, N3 = makeNoise(9);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = 0.8 + N3(x * 1.7 + 3, z * 1.7 + y * 1.3, 3) * 0.42;
    x *= k; y *= k; z *= k;
    if (y < -0.25) y = -0.25 + (y + 0.25) * 0.35;
    p.setXYZ(i, x * 1.08, y * 0.82, z);
  }
  const pa = p.array, ix = g.index.array, nt = ix.length / 3;
  const seeds = [0.3, 0.3 + 2.1, 0.3 + 4.2];
  const sector = (x, z) => { let a = Math.atan2(z, x) - seeds[0]; a = ((a % 6.2832) + 6.2832) % 6.2832; return a < 2.1 ? 0 : a < 4.2 ? 1 : 2; };
  const out = [[], [], []], outer = new THREE.Color('#CFC6B0'), outerD = new THREE.Color('#A89C84'), inner = new THREE.Color('#F4EEDF');
  const faceOf = new Int8Array(nt);
  for (let t = 0; t < nt; t++) {
    const a = ix[t * 3], b = ix[t * 3 + 1], c = ix[t * 3 + 2];
    faceOf[t] = sector((pa[a * 3] + pa[b * 3] + pa[c * 3]) / 3, (pa[a * 3 + 2] + pa[b * 3 + 2] + pa[c * 3 + 2]) / 3);
  }
  const edgeUse = new Map();
  for (let t = 0; t < nt; t++) for (let e = 0; e < 3; e++) {
    const a = ix[t * 3 + e], b = ix[t * 3 + (e + 1) % 3], key = a < b ? a + '_' + b : b + '_' + a;
    (edgeUse.get(key) || edgeUse.set(key, []).get(key)).push([t, a, b]);
  }
  const V = (k) => [pa[k * 3], pa[k * 3 + 1], pa[k * 3 + 2]];
  const push = (s, A, B, C, col) => out[s].push(A, B, C, col);
  for (let t = 0; t < nt; t++) {
    const a = ix[t * 3], b = ix[t * 3 + 1], c = ix[t * 3 + 2], s = faceOf[t];
    const cy = (pa[a * 3 + 1] + pa[b * 3 + 1] + pa[c * 3 + 1]) / 3;
    push(s, V(a), V(b), V(c), outer.clone().lerp(outerD, smooth(0.1, -0.25, cy)));
  }
  for (const list of edgeUse.values()) {
    if (list.length !== 2 || faceOf[list[0][0]] === faceOf[list[1][0]]) continue;
    for (const [t, a, b] of list) {
      const s = faceOf[t], A = V(a), B = V(b), A2 = [0, A[1], 0], B2 = [0, B[1], 0];
      push(s, B, A, A2, inner); push(s, B, A2, B2, inner);
    }
  }
  const geos = out.map((L) => {
    const n = L.length / 4, P = new Float32Array(n * 9), Cc = new Float32Array(n * 9), UV = new Float32Array(n * 6);
    for (let t = 0; t < n; t++) {
      const [A, B, C, col] = [L[t * 4], L[t * 4 + 1], L[t * 4 + 2], L[t * 4 + 3]];
      P.set(A, t * 9); P.set(B, t * 9 + 3); P.set(C, t * 9 + 6);
      for (let q = 0; q < 3; q++) { Cc[t * 9 + q * 3] = col.r; Cc[t * 9 + q * 3 + 1] = col.g; Cc[t * 9 + q * 3 + 2] = col.b; }
      const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const nx = Math.abs(e1[1] * e2[2] - e1[2] * e2[1]), ny = Math.abs(e1[2] * e2[0] - e1[0] * e2[2]), nz = Math.abs(e1[0] * e2[1] - e1[1] * e2[0]);
      for (let q = 0; q < 3; q++) {
        const Pp = [A, B, C][q];
        const u = ny >= nx && ny >= nz ? [Pp[0], Pp[2]] : nx >= nz ? [Pp[2], Pp[1]] : [Pp[0], Pp[1]];
        UV[t * 6 + q * 2] = u[0] * 0.28; UV[t * 6 + q * 2 + 1] = u[1] * 0.28;
      }
    }
    const G = new THREE.BufferGeometry();
    G.setAttribute('position', new THREE.BufferAttribute(P, 3));
    G.setAttribute('color', new THREE.BufferAttribute(Cc, 3));
    G.setAttribute('uv', new THREE.BufferAttribute(UV, 2));
    G.computeVertexNormals();
    return G;
  });
  const dirs = seeds.map((s) => [Math.cos(s + 1.05), Math.sin(s + 1.05)]);
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(1.32, 1.32, 1.32), vertexColors: true, map: T.rock.map, roughness: 0.9, flatShading: true });
  return { geos, dirs, mat };
}
// (BufferGeometryUtils.mergeVertices without the attribute juggling: positions only)
function mergeVerticesSimple(g) {
  const p = g.attributes.position, map = new Map(), verts = [], idx = [];
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
    let k = map.get(key);
    if (k === undefined) { k = verts.length / 3; map.set(key, k); verts.push(p.getX(i), p.getY(i), p.getZ(i)); }
    idx.push(k);
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); o.setIndex(idx);
  return o;
}

/* ───────────────────────── particles: dust, gold sparkles ───────────────────────── */
class Puffs {
  constructor(n, tex, color, additive) {
    this.n = n; this.alive = 0;
    this.pos = new Float32Array(n * 3); this.vel = new Float32Array(n * 3); this.size = new Float32Array(n); this.alpha = new Float32Array(n);
    this.age = new Float32Array(n).fill(1); this.life = new Float32Array(n).fill(1); this.s0 = new Float32Array(n); this.s1 = new Float32Array(n);
    this.grav = new Float32Array(n); this.drag = new Float32Array(n); this.a0 = new Float32Array(n); this.tw = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, color: { value: color }, scale: { value: 600 } },
      vertexShader: `attribute float size; attribute float alpha; varying float vA; uniform float scale;
        void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * scale / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
        void main(){ if (vA < 0.004) discard; vec4 t = texture2D(map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)); gl_FragColor = vec4(color * t.rgb, t.a * vA); }`,
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.visible = false;
    this.cur = 0;
  }
  // o: {spread, up, speed, s0, s1, life, grav, drag, alpha, ring}
  spawn(x, y, z, count, o) {
    for (let c = 0; c < count; c++) {
      const i = this.cur; this.cur = (this.cur + 1) % this.n;
      const a = Math.random() * 6.2832, sp = (o.speed || 0) * (0.4 + Math.random() * 0.8), sx = o.spread || 0;
      const rx = o.ring ? Math.cos(a) * o.ring : (Math.random() - 0.5) * sx, rz = o.ring ? Math.sin(a) * o.ring : (Math.random() - 0.5) * sx;
      this.pos[i * 3] = x + rx; this.pos[i * 3 + 1] = y + (Math.random() - 0.3) * (o.spreadY || sx * 0.3); this.pos[i * 3 + 2] = z + rz;
      this.vel[i * 3] = Math.cos(a) * sp; this.vel[i * 3 + 1] = (o.up || 0) * (0.5 + Math.random() * 0.8); this.vel[i * 3 + 2] = Math.sin(a) * sp;
      this.age[i] = 0; this.life[i] = (o.life || 1.5) * (0.7 + Math.random() * 0.6);
      this.s0[i] = o.s0 || 2; this.s1[i] = (o.s1 || 6) * (0.8 + Math.random() * 0.5);
      this.grav[i] = o.grav || 0; this.drag[i] = o.drag || 1.2; this.a0[i] = (o.alpha || 0.6) * (0.7 + Math.random() * 0.3); this.tw[i] = o.twinkle ? Math.random() * 6.28 : -1;
    }
    this.alive = 1; this.points.visible = true;
  }
  update(dt, t) {
    if (!this.alive) return;
    let any = 0;
    for (let i = 0; i < this.n; i++) {
      if (this.age[i] >= this.life[i]) { this.alpha[i] = 0; continue; }
      any = 1;
      const a = (this.age[i] += dt), k = a / this.life[i], dr = Math.exp(-this.drag[i] * dt);
      this.vel[i * 3] *= dr; this.vel[i * 3 + 2] *= dr; this.vel[i * 3 + 1] = this.vel[i * 3 + 1] * dr - this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
      this.size[i] = this.s0[i] + (this.s1[i] - this.s0[i]) * Math.sqrt(k);
      let al = this.a0[i] * Math.min(1, a / 0.12) * (1 - k) * (1 - k);
      if (this.tw[i] >= 0) al *= 0.55 + 0.45 * Math.sin(t * 17 + this.tw[i]);
      this.alpha[i] = k >= 1 ? 0 : al;
    }
    const A = this.points.geometry.attributes;
    A.position.needsUpdate = A.size.needsUpdate = A.alpha.needsUpdate = true;
    if (!any) { this.alive = 0; this.points.visible = false; }
  }
}

// stone chips — instanced little boxes that fly, bounce and fade
class Chips {
  constructor(n) {
    this.n = n; this.m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }), n);
    this.m.frustumCulled = false; this.m.count = 0; this.m.castShadow = false;
    this.p = new Float32Array(n * 3); this.v = new Float32Array(n * 3); this.ax = new Float32Array(n * 3); this.ang = new Float32Array(n); this.av = new Float32Array(n);
    this.age = new Float32Array(n).fill(9); this.life = new Float32Array(n).fill(1); this.sz = new Float32Array(n); this.fy = new Float32Array(n);
    this.cur = 0; this.hi = 0; this.M = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.s = new THREE.Vector3(); this.pp = new THREE.Vector3(); this.a3 = new THREE.Vector3(); this.c = new THREE.Color();
    for (let i = 0; i < n; i++) this.m.setColorAt(i, this.c.set('#ddd'));
  }
  spawn(x, y, z, count, hex, { speed = 9, up = 10, size = 0.35, floor = y - 0.5, life = 1.6, dir = null } = {}) {
    this.c.set(hex);
    for (let k = 0; k < count; k++) {
      const i = this.cur; this.cur = (this.cur + 1) % this.n;
      const a = Math.random() * 6.2832, sp = speed * (0.35 + Math.random() * 0.8);
      let vx = Math.cos(a) * sp, vz = Math.sin(a) * sp;
      if (dir) { vx = vx * 0.45 + dir[0] * sp; vz = vz * 0.45 + dir[1] * sp; }
      this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z;
      this.v[i * 3] = vx; this.v[i * 3 + 1] = up * (0.45 + Math.random() * 0.8); this.v[i * 3 + 2] = vz;
      this.a3.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      this.ax[i * 3] = this.a3.x; this.ax[i * 3 + 1] = this.a3.y; this.ax[i * 3 + 2] = this.a3.z;
      this.ang[i] = Math.random() * 6; this.av[i] = (Math.random() - 0.5) * 22;
      this.age[i] = 0; this.life[i] = life * (0.7 + Math.random() * 0.6); this.sz[i] = size * (0.5 + Math.random()); this.fy[i] = floor;
      const l = 0.85 + Math.random() * 0.25; this.m.setColorAt(i, this.c.clone().multiplyScalar(l));
      if (i + 1 > this.hi) this.hi = i + 1;
    }
    this.m.instanceColor.needsUpdate = true;
  }
  update(dt) {
    if (!this.hi) return;
    let hi = 0;
    for (let i = 0; i < this.hi; i++) {
      const a = this.age[i];
      if (a >= this.life[i]) { this.s.set(0, 0, 0); this.M.makeScale(0, 0, 0); this.m.setMatrixAt(i, this.M); continue; }
      hi = i + 1;
      this.age[i] = a + dt;
      const j = i * 3;
      this.v[j + 1] -= 32 * dt;
      this.p[j] += this.v[j] * dt; this.p[j + 1] += this.v[j + 1] * dt; this.p[j + 2] += this.v[j + 2] * dt;
      if (this.p[j + 1] < this.fy[i]) { this.p[j + 1] = this.fy[i]; this.v[j + 1] *= -0.32; this.v[j] *= 0.55; this.v[j + 2] *= 0.55; this.av[i] *= 0.6; }
      this.ang[i] += this.av[i] * dt;
      const k = this.age[i] / this.life[i], sz = this.sz[i] * (k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1);
      this.a3.set(this.ax[j], this.ax[j + 1], this.ax[j + 2]); this.q.setFromAxisAngle(this.a3, this.ang[i]);
      this.pp.set(this.p[j], this.p[j + 1] + sz * 0.3, this.p[j + 2]); this.s.set(sz, sz * 0.7, sz * 0.85);
      this.M.compose(this.pp, this.q, this.s); this.m.setMatrixAt(i, this.M);
    }
    this.hi = hi; this.m.count = hi; this.m.instanceMatrix.needsUpdate = true;
  }
}

/* ───────────────────────── glow sprites + GPU flames ─────────────────────────
   Glows: every warm light in one Points draw (braziers, path lamps, the lantern, the hot spot, strike flashes);
   per-point HDR colour, size, alpha and a shader flicker. Flames: rising flame tongues animated entirely in the
   vertex shader (a fire is a base point, a scale and a seed per particle), so lit fires cost no CPU per frame. */
class Glows {
  constructor(n, tex) {
    this.n = n; this.hi = 0; this.dirty = false;
    this.pos = new Float32Array(n * 3); this.size = new Float32Array(n); this.alpha = new Float32Array(n); this.col = new Float32Array(n * 3); this.flick = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aCol', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aFlick', new THREE.BufferAttribute(this.flick, 1).setUsage(THREE.DynamicDrawUsage));
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, scale: { value: 600 }, uTime: BUILD_TIME },
      vertexShader: `attribute float size; attribute float alpha; attribute vec3 aCol; attribute float aFlick; uniform float scale; uniform float uTime;
        varying vec3 vC; varying float vA;
        void main(){
          float f = 1.0 - aFlick * (0.5 + 0.5 * sin(uTime * 11.0 + position.x * 1.7 + position.z) * sin(uTime * 6.7 + position.z * 2.3 + position.y));
          vC = aCol; vA = alpha * f;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = vA < 0.002 ? 0.0 : size * (0.9 + 0.1 * f) * scale / max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `uniform sampler2D map; varying vec3 vC; varying float vA;
        void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.visible = false; this.points.renderOrder = 6;
  }
  set(i, x, y, z, size, c, alpha, flick = 0) {
    const j = i * 3;
    this.pos[j] = x; this.pos[j + 1] = y; this.pos[j + 2] = z; this.size[i] = size;
    this.col[j] = c.r; this.col[j + 1] = c.g; this.col[j + 2] = c.b; this.alpha[i] = alpha; this.flick[i] = flick;
    if (i + 1 > this.hi) this.hi = i + 1;
    this.dirty = true;
  }
  off(i) { if (this.alpha[i] !== 0) { this.alpha[i] = 0; this.dirty = true; } }
  flush() {
    if (!this.dirty) return;
    this.dirty = false;
    let hi = 0; for (let i = 0; i < this.hi; i++) if (this.alpha[i] > 0) hi = i + 1;
    this.hi = hi;
    const g = this.points.geometry, A = g.attributes;
    A.position.needsUpdate = A.size.needsUpdate = A.alpha.needsUpdate = A.aCol.needsUpdate = A.aFlick.needsUpdate = true;
    g.setDrawRange(0, hi); this.points.visible = hi > 0;
  }
}
class Flames {
  constructor(n, tex) {
    this.n = n; this.count = 0;
    this.pos = new Float32Array(n * 3); this.seed = new Float32Array(n); this.sc = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(this.seed, 1));
    g.setAttribute('aScale', new THREE.BufferAttribute(this.sc, 1));
    g.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: tex }, scale: { value: 600 }, uTime: BUILD_TIME, uCol: { value: new THREE.Color(3.2, 1.55, 0.55) } },
      vertexShader: `attribute float aSeed; attribute float aScale; uniform float scale; uniform float uTime; varying float vA;
        void main(){
          float ph = fract(uTime * (1.5 + aSeed * 0.9) + aSeed * 7.13);
          vec3 p = position;
          p.x += sin(aSeed * 91.0 + uTime * 3.1) * 0.16 * aScale * (0.3 + ph);
          p.z += cos(aSeed * 57.0 + uTime * 2.7) * 0.16 * aScale * (0.3 + ph);
          p.y += ph * 1.5 * aScale;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aScale * (1.3 - ph * 0.85) * (0.8 + aSeed * 0.4) * scale / max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
          vA = sin(3.14159 * ph) * 0.9;
        }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 uCol; varying float vA;
        void main(){ vec4 t = texture2D(map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)); gl_FragColor = vec4(uCol * t.rgb, t.a * vA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false; this.points.visible = false; this.points.renderOrder = 6;
  }
  add(x, y, z, s, k) {
    for (let j = 0; j < k && this.count < this.n; j++) {
      const i = this.count++;
      this.pos[i * 3] = x + (j % 3 - 1) * 0.12 * s; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z + ((j >> 1) % 2 - 0.5) * 0.2 * s;
      this.seed[i] = (i * 0.618034 + j * 0.13) % 1; this.sc[i] = s * (0.8 + ((i * 7) % 5) * 0.1);
    }
  }
  flush() {
    const g = this.points.geometry, A = g.attributes;
    A.position.needsUpdate = A.aSeed.needsUpdate = A.aScale.needsUpdate = true;
    g.setDrawRange(0, this.count); this.points.visible = this.count > 0;
  }
}

/* ───────────────────────── the plan / showcase ghost ─────────────────────────
   A gold hologram of the stage geometry: the stage meshes' own geometry (shared, nothing copied) drawn additively
   with a fresnel rim, faint horizontal scan lines and a bright line where the drawing-in front is (uY). */
const GHOST_VS = `varying vec3 vW; varying vec3 vN;
  void main(){
    vec4 p = vec4(position, 1.0); vec3 n = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p; n = mat3(instanceMatrix) * n;
    #endif
    vW = (modelMatrix * p).xyz; vN = normalize(mat3(modelMatrix) * n);
    gl_Position = projectionMatrix * (modelViewMatrix * p);
  }`;
const GHOST_FS = `uniform vec3 uCol; uniform float uA; uniform float uY; uniform float uTime; uniform float uFace; uniform float uBand;
  varying vec3 vW; varying vec3 vN;
  void main(){
    if (vW.y > uY || uA < 0.003) discard;
    vec3 n = normalize(vN), V = normalize(cameraPosition - vW);
    float f = 1.0 - abs(dot(n, V)), vert = 1.0 - 0.85 * abs(n.y);
    // faint faces, a fresnel rim, fine gold courses every 2.5 amot on the walls, and a bright drawing-in front
    float course = 1.0 - smoothstep(0.6, 1.6, abs(fract(vW.y / 2.5 + 0.5) - 0.5) * 2.5 / max(fwidth(vW.y), 1e-3));
    float band = smoothstep(uY - 2.2, uY, vW.y);
    float a = (0.03 * uFace + 0.3 * f * f * f) * (0.35 + 0.65 * vert) + course * 0.3 * vert + band * 0.9 * uBand;
    gl_FragColor = vec4(uCol * (1.0 + band * 1.5 * uBand), uA * a);
  }`;

const GHOST_GOLD = new THREE.Color(2.0, 1.25, 0.3);   // the vision (showPlan): the full gold hologram
const GHOST_SOFT = new THREE.Color(1.15, 0.95, 0.62);  // the chapter showcase: a paler gold, over the wide shot (the owner, 28.9)

/* ───────────────────────── workers (instanced) ───────────────────────── */
function workerGeos() {
  const lathe = new THREE.LatheGeometry([[0.001, 1.02], [0.56, 1.05], [0.47, 1.5], [0.42, 1.78], [0.47, 2.3], [0.44, 2.66], [0.3, 2.9], [0.13, 3.0], [0.001, 3.02]].map(([a, b]) => new THREE.Vector2(a, b)), 9);
  const body = mergeGeometries([
    part(lathe, '#ffffff', { tint: 1 }),
    part(new THREE.CylinderGeometry(0.455, 0.46, 0.16, 9).translate(0, 1.76, 0), '#6E5638', { tint: 0 }),
    part(new THREE.CylinderGeometry(0.12, 0.14, 0.3, 7).translate(0, 3.02, 0), '#C99466', { tint: 0 }),
    part(new THREE.SphereGeometry(0.29, 9, 7).translate(0, 3.3, 0.02), '#C99466', { tint: 0 }),
    part(new THREE.SphereGeometry(0.31, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(1, 0.85, 1).translate(0, 3.33, -0.01), '#E4DAC4', { tint: 0 }),
    part(rod([0.44, 2.72, 0], [0.56, 2.15, 0.05], 0.12, 0.11), '#ffffff', { tint: 1 }),
    part(rod([0.56, 2.15, 0.05], [0.6, 1.62, 0.16], 0.1, 0.09), '#C99466', { tint: 0 }),
  ]);
  // right arm (pivot at the shoulder, hanging along −y) with a stone-dresser's hammer pointing forward
  const arm = mergeGeometries([
    part(rod([0, 0, 0], [0, -0.58, 0.02], 0.12, 0.11), '#ffffff', { tint: 1 }),
    part(rod([0, -0.58, 0.02], [0, -1.1, 0.1], 0.1, 0.09), '#C99466', { tint: 0 }),
    part(rod([0, -1.12, 0.06], [0, -1.18, 0.8], 0.045), '#7A5A3A', { tint: 0 }),
    part(boxAt(0.2, 0.2, 0.46, 0, -1.19, 0.86).rotateY(0), '#6A6560', { tint: 0 }),
  ]);
  // ── site13 ── (N76 c: "at the altar the crew swing dark-headed hammers"; the brief: "at the altar, by hands") the same arm with
  // a bare hand: the carriers, the men at the machines, and every worker at the altar (whole stones, no iron: מדות ג, ד)
  const arm2 = mergeGeometries([
    part(rod([0, 0, 0], [0, -0.58, 0.02], 0.12, 0.11), '#ffffff', { tint: 1 }),
    part(rod([0, -0.58, 0.02], [0, -1.1, 0.1], 0.1, 0.09), '#C99466', { tint: 0 }),
    part(new THREE.SphereGeometry(0.11, 6, 5).translate(0, -1.14, 0.12), '#C99466', { tint: 0 }),
  ]);
  const leg = mergeGeometries([
    part(rod([0, 0, 0], [0, -1.02, 0], 0.13, 0.11), '#C99466', { tint: 0 }),
    part(boxAt(0.2, 0.1, 0.38, 0, -1.03, 0.07), '#4A3726', { tint: 0 }),
  ]);
  return { body, arm, arm2, leg };
}
function tintMaterial() {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aTint;')
      .replace('#include <color_vertex>', `vColor = vec4(1.0);
      #ifdef USE_COLOR
        vColor.rgb *= color;
      #endif
      #ifdef USE_INSTANCING_COLOR
        vColor.rgb *= mix(vec3(1.0), instanceColor.rgb, aTint);
      #endif`);
  };
  m.customProgramCacheKey = () => 'tint';
  return m;
}

// ── hero (PEOPLE) ── the hero's model (buildHero)
/* ───────────────────────── the hero (skinned, ONE draw call) ─────────────────────────
   PEOPLE, wave 6. One SkinnedMesh holds the builder, all his tools and his workpiece (a wooden banker and the stone on it),
   so the whole scene of his work is one draw call. Rigid parts, one bone each; the joints are capped by spheres.
   Model space = the bind pose: he faces +z, his left is +x, 1 unit = 1 amah before HERO_S (he is drawn 1.6× life size for
   the phone, and so is his workpiece). The workpiece bones hang under their own Object3D (wpRoot), not under the hero, so
   the banker stays put while he steps, turns or walks away.
   Bones: 0 root · 1 hips · 2 spine · 3 head · 4–6 left upper arm, forearm, hand · 7–9 right · 10–12 left thigh, shin, foot ·
   13–15 right · 16 lantern · tools 17 mallet (wood) 18 hammer (iron) 19 pick 20 sledge (right hand) 21 chisel (left hand)
   22 plumb line (kept hanging) 23 rope (aimed and stretched) 24 carried stone · workpiece 25 root 26 banker 27 rough
   28 drafted 29 dressed 30 quarry block with its wedges 31 whole field stone.
   Sources for the look: barefoot on the Temple Mount (Berakhot 9:5, "לא יכנס להר הבית ... במנעלו"); the Herodian ashlar's
   drafted margins and flat boss (the stones of the Western Wall, archaeology); the tools (mallet, hammer, chisel, pick,
   wedges, plumb line): illustration of Roman-period masonry. The tunic, head cloth and sash: illustration. */
const HERO_S = 1.6;
const HJ = {   // joints in model space (bind pose)
  hips: [0, 1.15, 0], waist: [0, 1.62, 0], neck: [0, 3.0, 0], shL: [0.5, 2.7, 0], elL: [0.5, 2.1, 0], wrL: [0.5, 1.55, 0],
  hipL: [0.2, 1.15, 0], knL: [0.2, 0.63, 0], anL: [0.2, 0.13, 0],
};
const HL = { up: 0.6, fore: 0.55, thigh: 0.52, shin: 0.5, palm: 0.11 };
// the striking tools, in the hand's frame: the grip is at the palm, the handle runs along +z, the head's centre sits L along
// it and its striking face hh below that (−y). two = the left hand's grip along the handle (two-handed tools)
const HTOOL = {
  mallet: { L: 0.6, hh: 0.19, two: 0 }, hammer: { L: 0.54, hh: 0.2, two: 0 },
  pick: { L: 1.18, hh: 0.52, two: 0.5 }, sledge: { L: 1.02, hh: 0.17, two: 0.42 },
};
function buildHero() {
  // ── people7 ── the kohen's dress (wave 7): Herod "bought a thousand sacerdotal garments for as many of the priests, and had
  // some of them taught the arts of stone-cutters" (Josephus, Ant. 15.11.2 §390; docs/SOURCES-S6.md 3.2) — the hero is one of
  // them (docs/GDD.md, "a young kohen"): the white linen ketonet with its sleeves to the wrist, the avnet of shesh, techelet,
  // argaman and tola'at shani wound at the height of the elbows with its ends hanging (as actors.js), the migba'at; barefoot.
  // Working in them on the site: illustration (⚑ owner). Skin, hair and beard vary through look() (the vertex colours and
  // three beard bones, still one draw call); a thin dark outline (one more draw call) keeps his silhouette on pale stone.
  const LIN = '#F6F2E9', LIN2 = '#E4DCCB', LIN3 = '#D3C8B3', TECH = '#2C5CA6', ARG = '#7A2D6C', SHANI = '#B8222C',
    SK = '#D2A078', SK2 = '#C08A62', HAIR = '#3A2618', EYE = '#1B120C', WHITE = '#FBF8F2', LIPS = '#9C5B4C', WOOD = '#8C6A43', WOOD2 = '#B08658', WOOD3 = '#6E5234', IRON = '#55514C',
    IRON2 = '#7C7771', ROPE = '#B89A62', ASH = '#D8C9A6', ASHR = '#C7B48E', ASHD = '#E2D5B6', ROCK = '#D6CAAE';
  const NB = 39, B = {};   // ── tools21 ── (39: + the rope's coil on his shoulder)
  ['root', 'hips', 'spine', 'head', 'uArmL', 'fArmL', 'handL', 'uArmR', 'fArmR', 'handR', 'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR',
    'lamp', 'tMallet', 'tHammer', 'tPick', 'tSledge', 'tChisel', 'tPlumb', 'tRope', 'tCarry',
    'wp', 'wpBanker', 'wpRough', 'wpDrafted', 'wpDressed', 'wpQuarry', 'wpField', 'beardY', 'beardS', 'beardF', 'lids', 'avnet', 'belt', 'tCoil'].forEach((k, i) => { B[k] = i; });
  const parts = [], tags = [];
  const add = (g, c, b, glow = 0) => { const q = part(g, c, { bone: b, glow: 0 }); if (glow) q.attributes.aGlow.array.fill(glow); parts.push(q); };
  // a tagged part: its colour follows look() (skin · skin2 · hair); face details (glow −0.4) take no outline
  const addT = (tag, g, c, b, glow = 0) => { add(g, c, b, glow); tags[parts.length - 1] = tag; };
  const sph = (r, x, y, z, sx = 1, sy = 1, sz = 1, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h).scale(sx, sy, sz).translate(x, y, z);
  const V2 = (pts) => pts.map(([a, b]) => new THREE.Vector2(a, b));
  // ── bare feet and the shins (the ketonet reaches the ankles: the feet show, the shins only in a stride)
  for (const [s, sh, ft] of [[1, B.shinL, B.footL], [-1, B.shinR, B.footR]]) {
    const x = 0.2 * s;
    addT('skin', rod([x, 0.63, 0], [x, 0.14, -0.01], 0.12, 0.085, 8), SK, sh);
    addT('skin', sph(0.1, x, 0.1, 0.05, 1, 0.75, 1.9), SK, ft);                         // the foot
    addT('skin2', sph(0.075, x + 0.015 * s, 0.05, 0.2, 1.3, 0.55, 0.9), SK2, ft);        // the toes
  }
  // ── the ketonet's skirt, to the ankles, in soft folds (more toward the hem), skinned to the legs: each vertex blends the
  // hips with the thigh and the shin on its side (more leg toward the hem, a soft seam down the middle), so the linen parts
  // in a stride and hangs between planted feet
  const robe = new THREE.LatheGeometry(V2([[0.62, 0.2], [0.6, 0.32], [0.575, 0.62], [0.55, 0.95], [0.52, 1.25], [0.5, 1.38], [0.42, 1.52], [0.001, 1.54]]), 24);
  { const p = robe.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z); if (r < 0.01) continue; const a = Math.atan2(z, x), k = 1 + 0.06 * Math.sin(a * 9 + 0.6) * clamp((1.45 - y) / 1.2, 0, 1); p.setX(i, x * k); p.setZ(i, z * k); } }
  const hem = new THREE.TorusGeometry(0.615, 0.03, 5, 24).rotateX(Math.PI / 2).translate(0, 0.22, 0);
  // its lining (the same skirt turned inside out): seen through the hem when he bends, it is linen, not the outline's dark
  const lining = robe.clone().scale(-0.985, 1, 0.985); { const n = lining.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i)); }
  for (const [g, c, gl] of [[robe, LIN, 0], [hem, LIN2, 0], [lining, LIN3, -0.4]]) {
    const q = part(g, c, { bone: B.hips, glow: 0 }), p = q.attributes.position, si = q.attributes.skinIndex.array, sw = q.attributes.skinWeight.array;
    if (gl) q.attributes.aGlow.array.fill(gl);
    for (let i = 0; i < p.count; i++) {
      // (the thighs only, and at most half: a stroke's bent knees and planted feet must never fold the linen inside out)
      const x = p.getX(i), y = p.getY(i), k = clamp((1.3 - y) / 1.0, 0, 1) * 0.5, f = clamp(0.5 + x / 0.7, 0, 1);
      si.set([B.hips, B.thighL, B.thighR, 0], i * 4); sw.set([1 - k, k * f, k * (1 - f), 0], i * 4);
    }
    parts.push(q);
  }
  // ── the upper ketonet (spine), bloused a little over the skirt's top (no seam where the two meet), the neckline, the neck
  add(new THREE.LatheGeometry(V2([[0.001, 1.4], [0.535, 1.41], [0.505, 1.56], [0.46, 1.85], [0.52, 2.3], [0.55, 2.55], [0.47, 2.8], [0.25, 2.95], [0.001, 2.96]]), 18), LIN, B.spine);
  add(new THREE.TorusGeometry(0.22, 0.03, 5, 14).rotateX(Math.PI / 2).translate(0, 2.9, 0.03), LIN2, B.spine);
  addT('skin', new THREE.CylinderGeometry(0.14, 0.16, 0.3, 8).translate(0, 2.98, 0), SK, B.spine);
  // ── the avnet wound round the chest at the height of the elbows (Rambam, Klei HaMikdash 10:1 "כנגד אצילי ידיו"), in bands
  // of its four colours, the ends hanging in front (illustration, as actors.js)
  { let y = 1.95; for (const [c, h] of [[LIN2, 0.035], [TECH, 0.06], [LIN2, 0.025], [ARG, 0.06], [LIN2, 0.025], [SHANI, 0.06], [LIN2, 0.035]]) { const r0 = 0.494 + (y - 1.95) * 0.14; add(new THREE.CylinderGeometry(r0 + h * 0.14, r0, h, 20).translate(0, y + h / 2, 0), c, B.avnet); y += h; } }
  [TECH, ARG, SHANI].forEach((c, k) => add(boxAt(0.07, 0.95, 0.03, 0.1 + k * 0.075, 1.52, 0.535).rotateX(-0.04), c, B.avnet));
  // or, outside the service, a plain linen girdle in its place (look({ avnet: false }); the avnet is sha'atnez — ⚑ owner)
  add(new THREE.CylinderGeometry(0.535, 0.494, 0.28, 20).translate(0, 2.09, 0), LIN2, B.belt);
  add(boxAt(0.09, 0.7, 0.03, 0.16, 1.66, 0.535).rotateX(-0.04), LIN3, B.belt);
  // ── the head (a touch bigger than life, for the phone): eyes with whites and a catch-light, brows, nose, mouth, ears; hair
  // at the back and the temples under the migba'at; three beards (young · short · full) on their own bones (look())
  addT('skin', sph(0.35, 0, 3.4, 0.02, 0.95, 1.04, 1, 18, 14), SK, B.head);
  for (const s of [1, -1]) {
    add(sph(0.092, 0.13 * s, 3.385, 0.3, 1, 0.92, 0.5), WHITE, B.head, -0.4);
    add(sph(0.056, 0.124 * s, 3.378, 0.338, 1, 1.12, 0.55), EYE, B.head, -0.4);
    add(sph(0.019, 0.108 * s, 3.402, 0.368, 1, 1, 0.6, 6, 4), WHITE, B.head, -0.4);
    addT('hair', new THREE.BoxGeometry(0.17, 0.05, 0.06).rotateZ(-0.16 * s).translate(0.13 * s, 3.49, 0.318), HAIR, B.head, -0.4);
    addT('skin', sph(0.075, 0.335 * s, 3.37, 0.0, 0.45, 1, 0.8), SK, B.head);
  }
  addT('skin2', sph(0.06, 0, 3.3, 0.35, 0.85, 1.1, 1), SK2, B.head, -0.4);
  // the eyelids: closed over the eyes, folded away to a point on their own bone except in a blink (the runtime)
  for (const s of [1, -1]) addT('skin', sph(0.1, 0.13 * s, 3.385, 0.312, 1.02, 0.95, 0.72, 10, 7), SK, B.lids, -0.4);
  add(sph(0.042, 0, 3.185, 0.365, 1.5, 0.38, 0.5, 8, 5), LIPS, B.head, -0.4);
  addT('hair', sph(0.345, 0, 3.43, -0.035, 1.0, 1.02, 1.0, 16, 10), HAIR, B.head);
  // the beards: young (a short chin beard), short (trimmed round the jaw), full (as wave 6), each with its moustache
  for (const [b, th, sy, mo] of [[B.beardY, 0.64, 1.06, 0.8], [B.beardS, 0.6, 1.14, 1], [B.beardF, 0.59, 1.34, 1.15]]) {
    addT('hair', new THREE.SphereGeometry(0.36, 16, 7, 0, Math.PI * 2, Math.PI * th, Math.PI * (1 - th)).scale(0.97, sy, 1.03).translate(0, 3.4, 0.03), HAIR, b);
    addT('hair', sph(0.1 * mo, 0, 3.232, 0.352, 1.35, 0.36, 0.5, 8, 5), HAIR, b, -0.4);
  }
  // the migba'at: linen wound round the head (Exodus 28:40; its shape: illustration, as actors.js), low on the brow
  add(new THREE.LatheGeometry(V2([[0.31, 3.5], [0.385, 3.55], [0.405, 3.67], [0.395, 3.8], [0.345, 3.93], [0.21, 4.02], [0.001, 4.05]]), 18), LIN, B.head);
  for (const [y, r, t] of [[3.58, 0.4, 0.08], [3.7, 0.408, -0.07], [3.82, 0.38, 0.06]]) add(new THREE.TorusGeometry(r, 0.03, 5, 20).rotateX(Math.PI / 2 + t).translate(0, y, 0), LIN2, B.head);
  // ── arms: the ketonet's sleeves to the wrist (Rambam, Klei HaMikdash 8:16), mitten hands with a thumb (palm 0.11 below the wrist)
  for (const [s, u, f, h] of [[1, B.uArmL, B.fArmL, B.handL], [-1, B.uArmR, B.fArmR, B.handR]]) {
    const x = 0.5 * s;
    add(sph(0.165, x, 2.7, 0), LIN, u);
    add(rod([x, 2.72, 0], [x, 2.13, 0], 0.155, 0.135, 8), LIN, u);
    add(sph(0.13, x, 2.1, 0), LIN, f);
    add(rod([x, 2.1, 0], [x, 1.64, 0], 0.13, 0.112, 8), LIN, f);
    add(new THREE.CylinderGeometry(0.118, 0.118, 0.045, 8).translate(x, 1.645, 0), LIN3, f);
    addT('skin', rod([x, 1.66, 0], [x, 1.57, 0], 0.085, 0.08, 8), SK, f);
    addT('skin', sph(0.085, x, 1.56, 0), SK, h);
    addT('skin', sph(0.1, x, 1.45, 0.02, 0.85, 1.15, 0.95), SK, h);
    addT('skin2', sph(0.045, x - 0.05 * s, 1.47, 0.1, 1, 1.4, 1), SK2, h);
  }
  // ── the tools (right-hand grip GR, left-hand grip GL; handles along +z)
  const GR = [-0.5, 1.44, 0.02], GL = [0.5, 1.44, 0.02];
  const at = (g, d) => g.translate(GR[0] + d[0], GR[1] + d[1], GR[2] + d[2]);
  // ── tools21 ── the tools in three tiers (tools.js): each part carries its three colours (tier 1 · 2 · 3) and setTools() recolours the
  // vertices, once; the top tier adds a bronze / gold band (the bands are wood-coloured at tier 1: a grip's wrap). Wood stays wood:
  // the mallet never gets an iron head (Middot 3:4); its bands are bronze and gold.
  const BRZ = '#B07A3C', GLD = '#E3B341', STL = '#8A9BAA', STL2 = '#B4C2CE', STL3 = '#C6D2DC', STL4 = '#E2EAF0';
  const toolCols = [];
  const addTl = (tool, cols, g, b, probe = false) => { add(g, cols[0], b); toolCols[parts.length - 1] = { tool, cols, probe }; };
  const cyl = (r, h, d) => at(new THREE.CylinderGeometry(r, r, h, 9).rotateX(Math.PI / 2), d);   // a ring round a handle (along +z)
  // the wooden mallet (the altar's stones are never touched by iron, Middot 3:4) — a mason's round mallet
  add(at(rod([0, 0, -0.1], [0, 0, 0.62], 0.045, 0.04, 6), [0, 0, 0]), WOOD, B.tMallet);
  addTl('mallet', [WOOD2, '#A97C48', '#B88B52'], at(new THREE.CylinderGeometry(0.15, 0.17, 0.38, 10), [0, 0, 0.6]), B.tMallet, true);
  addTl('mallet', [WOOD3, '#7A5C3A', '#8A6840'], at(new THREE.CylinderGeometry(0.175, 0.175, 0.05, 10), [0, -0.17, 0.6]), B.tMallet);
  for (const y of [-0.1, 0.12]) addTl('mallet', [WOOD2, BRZ, GLD], at(new THREE.CylinderGeometry(0.178, 0.178, 0.035, 10), [0, y, 0.6]), B.tMallet);
  addTl('mallet', [WOOD, BRZ, GLD], cyl(0.056, 0.05, [0, 0, 0.3]), B.tMallet);
  // the iron hammer: a square striking face below, a pein above
  add(at(rod([0, 0, -0.1], [0, 0, 0.58], 0.042, 0.038, 6), [0, 0, 0]), WOOD, B.tHammer);
  addTl('hammer', [IRON, STL, STL3], at(new THREE.BoxGeometry(0.15, 0.3, 0.15), [0, -0.05, 0.54]), B.tHammer, true);
  addTl('hammer', [IRON2, STL2, STL4], at(new THREE.BoxGeometry(0.19, 0.1, 0.19), [0, -0.15, 0.54]), B.tHammer);
  addTl('hammer', [IRON2, STL2, STL4], at(new THREE.ConeGeometry(0.075, 0.2, 4).rotateY(Math.PI / 4), [0, 0.19, 0.54]), B.tHammer);
  addTl('hammer', [WOOD, BRZ, GLD], cyl(0.056, 0.05, [0, 0, 0.36]), B.tHammer);
  addTl('hammer', [WOOD, WOOD, GLD], cyl(0.05, 0.04, [0, 0, -0.1]), B.tHammer);
  // the pick: a long haft, a point below (the striking end) and a narrow blade above
  add(at(rod([0, 0, -0.1], [0, 0, 1.24], 0.05, 0.045, 6), [0, 0, 0]), WOOD, B.tPick);
  addTl('pick', [IRON, STL, STL3], at(new THREE.BoxGeometry(0.12, 0.16, 0.14), [0, 0, 1.18]), B.tPick, true);
  addTl('pick', [IRON2, STL2, STL4], at(new THREE.ConeGeometry(0.065, 0.44, 5).rotateX(Math.PI), [0, -0.3, 1.18]), B.tPick);
  addTl('pick', [IRON2, STL2, STL4], at(new THREE.BoxGeometry(0.05, 0.36, 0.1), [0, 0.25, 1.18]), B.tPick);
  addTl('pick', [WOOD, BRZ, GLD], cyl(0.062, 0.05, [0, 0, 0.95]), B.tPick);
  addTl('pick', [WOOD, WOOD, GLD], cyl(0.056, 0.04, [0, 0, -0.1]), B.tPick);
  // the sledge (for the wedges)
  add(at(rod([0, 0, -0.1], [0, 0, 1.08], 0.05, 0.047, 6), [0, 0, 0]), WOOD, B.tSledge);
  addTl('sledge', [IRON, STL, STL3], at(new THREE.BoxGeometry(0.2, 0.34, 0.2), [0, 0, 1.02]), B.tSledge, true);
  addTl('sledge', [WOOD, BRZ, GLD], cyl(0.062, 0.05, [0, 0, 0.82]), B.tSledge);
  addTl('sledge', [WOOD, WOOD, GLD], cyl(0.056, 0.04, [0, 0, -0.1]), B.tSledge);
  // the chisel in the left hand, pointing forward along +z (its tip 0.3 ahead of the palm, its butt 0.2 behind)
  addTl('chisel', [IRON2, STL2, STL4], rod([GL[0], GL[1], GL[2] - 0.2], [GL[0], GL[1], GL[2] + 0.22], 0.035, 0.03, 6), B.tChisel, true);
  addTl('chisel', [IRON2, STL2, STL4], new THREE.ConeGeometry(0.04, 0.1, 4).rotateX(Math.PI / 2).scale(1, 0.4, 1).translate(GL[0], GL[1], GL[2] + 0.27), B.tChisel);
  addTl('chisel', [IRON, STL, GLD], new THREE.CylinderGeometry(0.045, 0.045, 0.05, 6).rotateX(Math.PI / 2).translate(GL[0], GL[1], GL[2] - 0.2), B.tChisel);
  // the plumb line: a cord from the right hand and its bob (kept hanging straight down)
  addTl('plumb', ['#E8E0CC', '#E8E0CC', '#F2E6B0'], at(rod([0, 0, 0], [0, -0.62, 0], 0.012, 0.012, 4), [0, 0, 0]), B.tPlumb);
  addTl('plumb', ['#8C7A5A', '#B8734A', '#E0AC3E'], at(new THREE.ConeGeometry(0.07, 0.16, 8).rotateX(Math.PI), [0, -0.68, 0]), B.tPlumb, true);
  addTl('plumb', ['#8C7A5A', '#B8734A', '#E0AC3E'], at(sph(0.06, 0, 0, 0, 1, 0.7, 1, 8, 5), [0, -0.61, 0]), B.tPlumb);
  // the rope: one unit along +z from the grip (the runtime aims and stretches it); idle, it is coiled on his shoulder (a slanted sash of two turns)
  addTl('rope', [ROPE, '#C9A872', '#E6C77E'], at(rod([0, 0, 0], [0, 0, 1], 0.035, 0.035, 5), [0, 0, 0]), B.tRope, true);
  for (const [y, r] of [[2.2, 0.6], [2.33, 0.612]]) addTl('rope', [ROPE, '#C9A872', '#E6C77E'], new THREE.TorusGeometry(r, 0.048, 6, 26).rotateX(Math.PI / 2).rotateZ(0.62).translate(0, y, 0), B.tCoil);
  // ── /tools21 ──
  // a whole stone carried in both hands (centred between them, in front of the chest)
  add(new THREE.IcosahedronGeometry(0.28, 1).scale(1.25, 0.8, 0.95).translate(0, 1.4, 0.3), ROCK, B.tCarry);
  // ── the lantern (hung from the left hand when he walks, from the banker's post when he works; kept upright)
  const LX = 0.62, LY = 1.1, LZ = 0.22, BR = '#5A4128';
  add(rod([0.5, 1.44, 0.1], [LX, LY + 0.36, LZ], 0.022, 0.022, 4), BR, B.lamp);
  add(new THREE.ConeGeometry(0.2, 0.14, 6).translate(LX, LY + 0.3, LZ), BR, B.lamp);
  add(boxAt(0.3, 0.05, 0.3, LX, LY - 0.14, LZ), BR, B.lamp);
  for (const [dx, dz] of [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]) add(boxAt(0.035, 0.36, 0.035, LX + dx, LY + 0.06, LZ + dz), BR, B.lamp);
  add(new THREE.CylinderGeometry(0.1, 0.11, 0.3, 8).translate(LX, LY + 0.05, LZ), '#FFD890', B.lamp, 1);
  // ── the workpiece (its own frame: the origin on the ground under the stone, +z away from the hero); aGlow −1 = no rim
  const wadd = (g, c, b) => { const q = part(g, c, { bone: b, glow: 0 }); q.attributes.aGlow.array.fill(-1); parts.push(q); };
  // (a hash of the position, so the faces' shared corners move together and the stone stays closed)
  const hsh = (x, y, z, k) => { let h = Math.imul(Math.round(x * 997) | 0, 73856093) ^ Math.imul(Math.round(y * 997) | 0, 19349663) ^ Math.imul(Math.round(z * 997) | 0, 83492791) ^ Math.imul(k, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295 - 0.5; };
  const jitter = (g, a, keepTop) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (keepTop !== undefined && y > keepTop - 0.01) continue; p.setXYZ(i, x + hsh(x, y, z, 1) * a, y + hsh(x, y, z, 2) * a * 0.6, z + hsh(x, y, z, 3) * a); } g.computeVertexNormals(); return g; };
  // the banker: a heavy plank on four splayed legs, with stretchers; the top at y 0.95
  wadd(boxAt(1.55, 0.12, 1.0, 0, 0.89, 0), WOOD2, B.wpBanker);
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) wadd(rod([0.6 * sx, 0.86, 0.36 * sz], [0.7 * sx, 0, 0.44 * sz], 0.065, 0.075, 6), WOOD, B.wpBanker);
  wadd(rod([-0.66, 0.3, 0.4], [0.66, 0.3, 0.4], 0.045), WOOD3, B.wpBanker); wadd(rod([-0.66, 0.3, -0.4], [0.66, 0.3, -0.4], 0.045), WOOD3, B.wpBanker);
  wadd(rod([0.72, 0, 0.3], [0.72, 1.55, 0.3], 0.04), WOOD3, B.wpBanker);   // the post (the lantern hangs here at night)
  // the stone: 1.25 × 0.7 × 0.85 on the banker (y 0.95 … 1.65). rough: split from the bed, every face uneven
  const SW = 1.25, SH = 0.7, SD = 0.85, Y0 = 0.95, Y1 = Y0 + SH;
  wadd(jitter(new THREE.BoxGeometry(SW, SH, SD, 5, 3, 4).translate(0, Y0 + SH / 2, 0), 0.15), ASHR, B.wpRough);
  // drafted: a flat margin chiselled round the top and the front face; the rest still rough and proud
  wadd(jitter(new THREE.BoxGeometry(SW - 0.04, SH - 0.04, SD - 0.04, 4, 2, 3).translate(0, Y0 + SH / 2 - 0.02, 0.01), 0.07), ASHR, B.wpDrafted);
  for (const [w, d, x, z] of [[SW, 0.13, 0, -SD / 2 + 0.065], [SW, 0.13, 0, SD / 2 - 0.065], [0.13, SD, -SW / 2 + 0.065, 0], [0.13, SD, SW / 2 - 0.065, 0]]) wadd(boxAt(w, 0.03, d, x, Y1 - 0.015, z), ASHD, B.wpDrafted);
  wadd(jitter(new THREE.BoxGeometry(SW - 0.3, 0.1, SD - 0.3, 3, 1, 2).translate(0, Y1 + 0.03, 0), 0.05), ASHR, B.wpDrafted);
  // dressed: flat margins and a flat, slightly raised boss on the top and the front (the Herodian ashlar)
  wadd(boxAt(SW, SH, SD, 0, Y0 + SH / 2, 0), ASH, B.wpDressed);
  wadd(boxAt(SW - 0.26, 0.05, SD - 0.26, 0, Y1 + 0.025, 0), ASHD, B.wpDressed);
  wadd(boxAt(SW - 0.26, SH - 0.26, 0.04, 0, Y0 + SH / 2, -SD / 2 - 0.02), ASHD, B.wpDressed);
  // the quarry block: a block still in the bedrock, a line of iron wedges driven into its channel (the split: wedges, illus.)
  wadd(jitter(new THREE.BoxGeometry(1.9, 0.95, 1.25, 4, 2, 3).translate(0, 0.47, 0), 0.08, 0.95), ROCK, B.wpQuarry);
  wadd(boxAt(1.7, 0.06, 0.1, 0, 0.93, 0), '#A89A7E', B.wpQuarry);
  for (const x of [-0.55, 0, 0.55]) { wadd(boxAt(0.14, 0.2, 0.08, x, 1.0, 0), IRON, B.wpQuarry); wadd(boxAt(0.18, 0.04, 0.12, x, 1.1, 0), IRON2, B.wpQuarry); }
  wadd(jitter(new THREE.BoxGeometry(3.2, 0.3, 2.4, 5, 1, 4).translate(0, 0.1, 0.2), 0.12, 0.25), '#CDBF9F', B.wpQuarry);   // the bed around it
  // a whole field stone for the altar (Middot 3:4 "אבנים שלמות"): never dressed; on the banker to be set
  wadd(jitter(new THREE.IcosahedronGeometry(0.45, 1).scale(1.3, 0.8, 1.05).translate(0, Y0 + 0.34, 0), 0.08), '#D9D2C2', B.wpField);
  // ── people7 ── the vertex ranges look() recolours (skin, skin2, hair), before the merge keeps the parts' order
  const ranges = []; { let v0 = 0; parts.forEach((q, i) => { const n = q.attributes.position.count; if (tags[i]) ranges.push([tags[i], v0, n]); v0 += n; }); }
  // ── tools21 ── the tool parts' vertex ranges (their three tier colours)
  const toolRanges = []; { let v0 = 0; parts.forEach((q, i) => { const n = q.attributes.position.count; if (toolCols[i]) toolRanges.push({ ...toolCols[i], v0, n }); v0 += n; }); }
  // ── /tools21 ──
  const geo = mergeGeometries(parts);
  geo.computeBoundingSphere();
  // lantern glass (aGlow 1), a view-dependent rim on the man (aGlow 0: readable at night, gold with a combo), none on the stone
  const U = { uLamp: { value: new THREE.Color(0, 0, 0) }, uRim: { value: new THREE.Color(0, 0, 0) } };
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow; varying float vGlow;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGlow = aGlow;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uLamp; uniform vec3 uRim; varying float vGlow;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float fr = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
          totalEmissiveRadiance += uLamp * max(vGlow, 0.0) + uRim * (fr * fr * fr) * (1.0 - abs(vGlow)); }`);
  };
  mat.customProgramCacheKey = () => 'hero';
  const mesh = new THREE.SkinnedMesh(geo, mat);
  const bones = new Array(NB);
  const mk = (k, x, y, z, parent) => { const b = new THREE.Bone(); b.name = 'hero-' + k; b.position.set(x, y, z); if (parent) parent.add(b); bones[B[k]] = b; return b; };
  const root = mk('root', 0, 0, 0, null), hips = mk('hips', 0, 1.15, 0, root), spine = mk('spine', 0, 0.47, 0, hips), head = mk('head', 0, 1.38, 0, spine);
  for (const [s, u, f, h, t, sh, ft] of [[1, 'uArmL', 'fArmL', 'handL', 'thighL', 'shinL', 'footL'], [-1, 'uArmR', 'fArmR', 'handR', 'thighR', 'shinR', 'footR']]) {
    const ub = mk(u, 0.5 * s, 1.08, 0, spine), fb = mk(f, 0, -HL.up, 0, ub); mk(h, 0, -HL.fore, 0, fb);
    const tb = mk(t, 0.2 * s, 0, 0, hips), sb = mk(sh, 0, -HL.thigh, 0, tb); mk(ft, 0, -HL.shin, 0, sb);
  }
  const hR = bones[B.handR], hL = bones[B.handL];
  for (const k of ['tMallet', 'tHammer', 'tPick', 'tSledge', 'tPlumb', 'tRope']) mk(k, 0, -HL.palm, 0.02, hR);
  mk('tChisel', 0, -HL.palm, 0.02, hL);
  mk('lamp', 0.5, 1.44, 0.1, root);
  mk('tCarry', 0, 1.4, 0.3, root);
  mk('tCoil', -0.0, 1.0, 0, spine);   // ── tools21 ── (the rope's coil: on the spine, a sash across the chest)
  for (const k of ['beardY', 'beardS', 'beardF']) mk(k, 0, 0, 0, head);
  mk('lids', 0, 0.48, 0.312, head); mk('avnet', 0, 0, 0, spine); mk('belt', 0, 0, 0, spine);
  mesh.add(root);
  // the workpiece: its own root in the scene (placed and scaled by the runtime)
  const wpRoot = new THREE.Object3D(); wpRoot.name = 'hero-workpiece';
  const wp = mk('wp', 0, 0, 0, null); wpRoot.add(wp);
  for (const k of ['wpBanker', 'wpRough', 'wpDrafted', 'wpDressed', 'wpQuarry', 'wpField']) mk(k, 0, 0, 0, wp);
  root.updateMatrixWorld(true); wpRoot.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton(bones));
  bones[B.lids].scale.setScalar(1e-4);   // (after the bind: the lids open)
  mesh.frustumCulled = false; mesh.castShadow = false; mesh.receiveShadow = true;
  // blob shadow + a gold ring (Brawl-style player marker), one quad
  const tex = canvasTex(128, (x, s) => {
    const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(20,14,6,.55)'); g.addColorStop(0.42, 'rgba(20,14,6,.28)'); g.addColorStop(0.6, 'rgba(20,14,6,0)');
    g.addColorStop(0.74, 'rgba(255,214,110,0)'); g.addColorStop(0.8, 'rgba(255,220,120,.95)'); g.addColorStop(0.9, 'rgba(255,200,80,.9)'); g.addColorStop(0.97, 'rgba(255,200,80,0)');
    x.fillStyle = g; x.fillRect(0, 0, s, s);
  });
  const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, toneMapped: false }));
  ring.renderOrder = 2; ring.frustumCulled = false;
  const bn = {}; for (const k in B) bn[k] = bones[B[k]];
  // ── people7 ── the outline: the same skinned geometry and skeleton, back faces pushed out along the normal in screen
  // space (≈ 2 px at any distance), dark umber; the workpiece (aGlow −1) and the face's details (−0.4) take none
  const OU = { uOut: { value: 0.0052 } };
  const oMat = new THREE.MeshBasicMaterial({ color: '#2A1D14', side: THREE.BackSide });
  oMat.onBeforeCompile = (sh) => {
    sh.uniforms.uOut = OU.uOut;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGlow; uniform float uOut;')
      .replace('#include <project_vertex>', `#include <project_vertex>
        { vec3 nv = normalize(normalMatrix * objectNormal); vec2 d = (projectionMatrix * vec4(nv, 0.0)).xy; float l = length(d);
          d = l > 1e-5 ? d / l : vec2(0.0); d.x *= projectionMatrix[0][0] / projectionMatrix[1][1];
          gl_Position.xy += d * uOut * clamp(18.0 / gl_Position.w, 0.55, 1.0) * gl_Position.w;
          if (aGlow < -0.2) gl_Position = vec4(0.0, 0.0, 2.0, 1.0); }`);
  };
  oMat.customProgramCacheKey = () => 'hero-outline';
  const outline = new THREE.SkinnedMesh(geo, oMat);
  outline.name = 'hero-outline'; outline.frustumCulled = false; outline.castShadow = false;
  outline.bind(mesh.skeleton, mesh.bindMatrix);
  mesh.add(outline);
  // ── people7 ── look({ skin: 0–3, hair: 0–3, beard: 'young'|'short'|'full' }): his skin, hair and beard (the player's
  // hero keeps one look; BUILD may offer a choice, ⚑). Recolours the vertex ranges once; no allocation per frame.
  const SKINS = [['#E3B592', '#CF9C78'], ['#D2A078', '#C08A62'], ['#B98460', '#A2704F'], ['#93613F', '#7E5234']];
  const HAIRS = ['#3A2618', '#1B1411', '#5A3A22', '#7A4526'];
  const LOOK = { skin: 1, hair: 0, beard: 'young', avnet: true };
  const cTmp = new THREE.Color();
  function look(o) {
    if (o && typeof o === 'object') {
      if (Number.isInteger(o.skin) && SKINS[o.skin]) LOOK.skin = o.skin;
      if (Number.isInteger(o.hair) && HAIRS[o.hair]) LOOK.hair = o.hair;
      if (['young', 'short', 'full'].includes(o.beard)) LOOK.beard = o.beard;
      if (typeof o.avnet === 'boolean') LOOK.avnet = o.avnet;
    }
    const col = geo.attributes.color;
    for (const [tag, v0, n] of ranges) {
      cTmp.set(tag === 'hair' ? HAIRS[LOOK.hair] : SKINS[LOOK.skin][tag === 'skin2' ? 1 : 0]);
      for (let i = v0; i < v0 + n; i++) col.setXYZ(i, cTmp.r, cTmp.g, cTmp.b);
    }
    col.needsUpdate = true;
    bn.beardY.scale.setScalar(LOOK.beard === 'young' ? 1 : 1e-4); bn.beardS.scale.setScalar(LOOK.beard === 'short' ? 1 : 1e-4); bn.beardF.scale.setScalar(LOOK.beard === 'full' ? 1 : 1e-4);
    bn.avnet.scale.setScalar(LOOK.avnet ? 1 : 1e-4); bn.belt.scale.setScalar(LOOK.avnet ? 1e-4 : 1);
    return { skin: LOOK.skin, hair: LOOK.hair, beard: LOOK.beard, avnet: LOOK.avnet };
  }
  look();
  // ── tools21 ── setTools({ hammer: 1–3, … }): each tool's tier colours (the top tier brighter, with a bronze / gold band) and its size;
  // toolTier(id) · toolColor(id): the probe part's current colour (tests). No allocation per frame; recoloured once per change.
  const TIERS = {}, TIER_SCALE = [1, 1.06, 1.13];
  function setTools(map) {
    if (!map || typeof map !== 'object') return TIERS;
    const col = geo.attributes.color;
    for (const k of Object.keys(map)) { const t = Math.max(1, Math.min(3, map[k] | 0 || 1)); TIERS[k] = t; }
    for (const r of toolRanges) {
      cTmp.set(r.cols[(TIERS[r.tool] || 1) - 1]);
      for (let i = r.v0; i < r.v0 + r.n; i++) col.setXYZ(i, cTmp.r, cTmp.g, cTmp.b);
    }
    col.needsUpdate = true;
    return TIERS;
  }
  const toolTier = (id) => TIERS[id] || 1;
  const toolColor = (id) => { const r = toolRanges.find((q) => q.tool === id && q.probe); if (!r) return null; const c = geo.attributes.color; cTmp.setRGB(c.getX(r.v0), c.getY(r.v0), c.getZ(r.v0)); return '#' + cTmp.getHexString(); };
  // ── /tools21 ──
  return { mesh, ring, U, OU, outline, look, setTools, toolTier, toolColor, tierScale: TIER_SCALE, wpRoot, lampAt: new THREE.Vector3(LX, LY, LZ), lampBind: new THREE.Vector3(0.5, 1.44, 0.1), bones: bn, B, stone: { w: SW, h: SH, d: SD, y0: Y0, y1: Y1 } };
}
// ── /hero ──

/* ───────────────────────── the stones' layout (wave 6) ─────────────────────────
   The stone textures' joints (tex.js texAshlar / texMarble): rows per tile and each block's left joint per canvas row. WORLD's
   tex.js returns them as `joints` (445b64d); until that is merged the same numbers are rebuilt here from the same RNG sequence
   (cyclic(): the lengths, then the offset; then 19 / 23 draws per block for its tone and detail). */
const JOINT_SPEC = {   // key: [seed, rows, [min, max] block length (share of the tile), RNG draws per block]
  ash: [7, 11, [0.15, 0.36], 19], ashBig: [13, 11, [0.16, 0.42], 19], ash2: [9, 11, [0.15, 0.36], 19], marble: [23, 12, [0.16, 0.30], 23],
  field: [77, 10, [0.10, 0.24], 0],   // the altar's whole field stones on the plaster's 10-amah tile (1 amah courses; illus.)
};
function jointsOf(seed, rows, len, per, size = 1024) {
  const r = rng(seed), edges = [];
  for (let ry = 0; ry < rows; ry++) {
    const L = []; let s = 0; const minL = size * len[0], maxL = size * len[1];
    while (s < size) { const l = minL + r() * (maxL - minL); L.push(l); s += l; }
    const k = size / s, off = r() * size, ed = [];
    let x = off;
    for (const l of L) { ed.push((x / size) % 1); x += l * k; for (let q = 0; q < per; q++) r(); }
    edges.push(ed);
  }
  return { rows, edges };
}
const JCACHE = {};
// canvas rows (top first) → rows from the bottom of the tile (v up), each sorted
const bottomFirst = (j) => j.edges.map((_, rb) => j.edges[j.rows - 1 - rb].slice().sort((a, b) => a - b));

/* ── real stones in motion (wave 6): one low-poly Herodian ashlar (unit box: drafted margins round a raised flat boss on both
   long faces) and one rough quarry block (a jittered box), each drawn as ONE InstancedMesh for every pile, banker and bench ── */
function ashlarGeometry() {
  const g = mergeGeometries([boxAt(1, 1, 0.88, 0, 0, 0), boxAt(0.76, 0.7, 0.12, 0, 0.0, 0.44), boxAt(0.76, 0.7, 0.12, 0, 0.0, -0.44),
    boxAt(0.94, 0.06, 0.82, 0, 0.47, 0)].map(strip));   // (+ a thin top bed, so a pile's upper faces read as dressed)
  g.computeBoundingSphere();
  return g;
}
function roughGeometry() {
  const g = mergeVerticesSimple(new THREE.BoxGeometry(1, 1, 1, 2, 2, 2).toNonIndexed());
  const p = g.attributes.position, h = (x, y, z) => { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = (Math.abs(x) > 0.4) + (Math.abs(y) > 0.4) + (Math.abs(z) > 0.4) >= 3 ? 0.86 : 1;
    p.setXYZ(i, x * k + (h(x, y, z) - 0.5) * 0.12, y * k + (h(y, z, x) - 0.5) * 0.1, z * k + (h(z, x, y) - 0.5) * 0.12);
  }
  const o = g.toNonIndexed(); o.computeVertexNormals(); o.computeBoundingSphere();
  return o;
}

/* ───────────────────────── createStages ───────────────────────── */
export function createStages(ctx) {
  const { scene, camera, B, mats, T } = ctx;
  const life = ctx.life;
  const R = rng(4321);
  const tmpM = new THREE.Matrix4(), tmpM2 = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler();
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpS = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), ONE = new THREE.Vector3(1, 1, 1);
  let time = 0;
  const shake = { t: 0, amp: 0, off: new THREE.Vector3() };

  /* ── the stones' joints per material (the reveal finds each stone from them; wave 6) ── */
  const FIELD = new Set(['yesod', 'sovev', 'guf', 'karnot']), GOLDFIN = new Set(['ulam', 'heichal', 'kodesh']);
  // ── site13 ── the finish-only materials that get a cut of their own, step by step (FINCUT, finishCuts)
  const FINMAT = { nashim: ['cedar'], ulam: ['gold', 'oak', 'cedar'], heichal: ['gold', 'cedar'], kodesh: ['gold'], gates: ['gold'], har: ['archStone'] };   // ── site14 ── (gates: her gold · har: Robinson's Arch, her arch)
  const JU = {};
  const COL = { m: null, C: null, jm: null, order: [] };   // ── site14 ── (the Stoa's columns: jobReveal 'column')
  function jointsFor(k, id) {
    const key = k === 'plaster' && FIELD.has(id) ? 'field' : k, spec = JOINT_SPEC[key];
    if (!spec || (key === 'field' && k !== 'plaster')) return null;
    return (key !== 'field' && T && T[key] && T[key].joints) || JCACHE[key] || (JCACHE[key] = jointsOf(...spec));
  }
  function perFor(id, k) {
    // ── site13 ── (PRODUCER-S13a #6: "the finish … changes nothing a child can see") each finish-only material of a stage has its
    // own cut (J.z, mode J.w — finishCuts below): the gold of each house, the Ulam's oak lintels and cedar poles, the Ezrat
    // Nashim's cedar gallery
    if (FINMAT[id] && FINMAT[id].includes(k)) return JU[id + '|' + k] || (JU[id + '|' + k] = jointUniforms(0, null, true));
    if (k === 'gold' && GOLDFIN.has(id)) return JU.goldFin || (JU.goldFin = jointUniforms(0, null, true));   // gold plates: 'finish'
    const j = jointsFor(k, id); if (!j) return null;
    const key = k === 'plaster' ? 'field' : k;
    return JU[key] || (JU[key] = jointUniforms(j.rows, bottomFirst(j)));
  }

  /* ── stage groups ── */
  const ST = {}, list = [];
  STAGE_IDS.forEach((id, idx) => {
    const def = DEF[id];
    const U = revealUniforms();
    const group = new THREE.Group(); group.name = 'stage-' + id; group.visible = false;
    const cache = {}, matList = [];
    const matFor = (k) => cache[k] || (cache[k] = (matList.push(buildMaterial(mats[k].mat, U, mats[k].tile, perFor(id, k))), matList[matList.length - 1]));
    const meshes = B.build(group, id, matFor);
    // ── site13 ── (PRODUCER-S13a #6) the Ezrat Nashim's corner chambers' upper walls and fittings (temple.js set 'nashim-lc'): their
    // own reveal — one horizontal cut per chamber (batch.js: uC.w < 0 → a cut per rect in uRK[i].x) — raised in the finish
    let lc = null;
    if (id === 'nashim' && B.sets && B.sets['nashim-lc'] && Object.keys(B.sets['nashim-lc']).length) {
      const U2 = revealUniforms(), g2 = new THREE.Group(); g2.name = 'nashim-chambers';
      const c2 = {}, m2 = [];
      const mf2 = (k) => c2[k] || (c2[k] = (m2.push(buildMaterial(mats[k].mat, U2, mats[k].tile, k === 'ash' ? perFor(id, k) : null)), m2[m2.length - 1]));
      const ms = B.build(g2, 'nashim-lc', mf2);
      NASHIM_LC.forEach((c, i) => { U2.uRect.value[i].set(c.r[0], c.r[1], c.r[2], c.r[3]); U2.uRK.value[i].set(1e6, 0, 0, 0); });
      U2.uC.value.set(0, 1, 0, -NASHIM_LC.length); U2.uGlow.value.setRGB(3.4, 2.25, 0.72);
      group.add(g2);
      lc = { U: U2, group: g2, meshes: ms, mats: m2, shown: 0, label: -1, labelT: 0, lastLab: -1 };
    }
    let colMat = null;
    if (id === 'har' && ctx.columns) for (const C of ctx.columns) {
      if (!colMat) { colMat = buildMaterial(C.mat, U, 10); matList.push(colMat); }
      const m = new THREE.InstancedMesh(C.geo, colMat, C.list.length);
      const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(C.sxz, C.sy, C.sxz), p = new THREE.Vector3();
      C.list.forEach(([x, z], i) => { p.set(x, 0, z); M.compose(p, q, s); m.setMatrixAt(i, M); });
      m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; group.add(m); meshes.push(m);
      m.computeBoundingBox();
      // ── site14 ── the royal Stoa's set (its wider columns): her "מקימים עמוד" raises them one by one, from its south-east end
      if (C.sxz > 1.2) { COL.m = m; COL.C = C; COL.order = C.list.map((_, i) => i).sort((a, b) => C.list[a][1] - C.list[b][1] || C.list[b][0] - C.list[a][0]); }
    }
    const bb = new THREE.Box3();
    for (const m of meshes) { const b = m.isInstancedMesh ? m.boundingBox : m.geometry.boundingBox; if (b) bb.union(b); }
    const depth = buildDepthMaterial(U);
    const foot = def.foot;
    const fb = { x0: Math.min(...foot.map((f) => f[0])), z0: Math.min(...foot.map((f) => f[1])), x1: Math.max(...foot.map((f) => f[2])), z1: Math.max(...foot.map((f) => f[3])) };
    const st = {
      id, idx, def, group, meshes, mats: matList, cache, depth, U, bb, fb, lc,   // ── site13 ── (lc: the Ezrat Nashim's chambers)
      bottom: def.bottom !== undefined ? def.bottom : bb.min.y, top: bb.max.y, base: def.base,
      status: 'done', target: 1, disp: 1, lastY: 0, scaff: null, glowBoost: 0, seq: 0, ghost: null, tl: null,
    };
    scene.add(group);
    ST[id] = st; list.push(st);
  });
  // the height the masonry has reached: the laid courses + the share of the current one (wave 6: from the stones)
  const revealY = (st) => {
    if (st.disp < FOUND) return st.bottom - 1;
    const L = st.lay;
    if (!L || L.kind === 'cast' || !L.N || L.n < 0) return lerp(st.bottom, st.top + 0.3, (st.disp - FOUND) / (1 - FOUND));
    return L.n >= L.N ? st.top + 0.3 : Math.min(st.top + 0.3, L.y0 + (L.cur + L.frac) * L.H);
  };
  const isDone = (id) => ST[id] && ST[id].status === 'done';

  /* ── the stone-by-stone site (wave 6): stones in courses, the crews' working fronts, the reveal's uniforms ──
     Each footprint rect's perimeter is split into K ≈ L/110 amot sectors, each a crew's working front; the working rect's first
     sector starts just before the site's working face (DEF.spot.face), so every course begins in front of the site camera.
     The stones are the texture's blocks on the building's OUTER faces (inner faces follow at the same place on the perimeter);
     they are set course by course, round-robin over the fronts, the working front first — so one stone per front is one new
     stone in view, and the whole building rises evenly. batch.js finds each fragment's stone + front and compares it with the
     per-front thresholds set here. The kiyor is cast bronze: 12 pours, the old horizontal cut with a melt line. */
  const FR = { f: 0, p: 0, r: 0, edge: 0 }, EDGE_N = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  function frontOf(L, x, z, out = FR) {   // (the JS twin of batch.js bcFrontOf)
    let best = 0, bs = 1e9;
    for (let i = 0; i < L.rects.length; i++) {
      const R = L.rects[i], cx = clamp(x, R.x0, R.x1), cz = clamp(z, R.z0, R.z1), dO = Math.hypot(x - cx, z - cz);
      const sc = dO > 0 ? dO + 1000 : -1 / (1 + Math.min(x - R.x0, R.x1 - x, z - R.z0, R.z1 - z));
      if (sc < bs) { bs = sc; best = i; }
    }
    const R = L.rects[best], cx = clamp(x, R.x0, R.x1), cz = clamp(z, R.z0, R.z1);
    const eN = cz - R.z0, eS = R.z1 - cz, eW = cx - R.x0, eE = R.x1 - cx, m = Math.min(eN, eS, eW, eE);
    let s, e;
    if (m === eN) { s = cx - R.x0; e = 0; } else if (m === eE) { s = R.W + cz - R.z0; e = 1; } else if (m === eS) { s = R.W + R.D + R.x1 - cx; e = 2; } else { s = 2 * R.W + R.D + R.z1 - cz; e = 3; }
    let u = (s - R.s0) / R.L; u = (u - Math.floor(u)) * R.K;
    const f = Math.min(Math.floor(u), R.K - 1);
    out.f = R.base + f; out.p = u - f; out.r = best; out.edge = e; out.s = s;
    return out;
  }
  // a point on a rect's perimeter at arc length s → [x, z, outward nx, nz]
  function perimAt(R, s) {
    s = ((s % R.L) + R.L) % R.L;
    if (s < R.W) return [R.x0 + s, R.z0, 0, -1];
    if (s < R.W + R.D) return [R.x1, R.z0 + s - R.W, 1, 0];
    if (s < 2 * R.W + R.D) return [R.x1 - (s - R.W - R.D), R.z1, 0, 1];
    return [R.x0, R.z1 - (s - 2 * R.W - R.D), -1, 0];
  }
  const SITE_KIND = (id) => (id === 'kiyor' ? 'cast' : FIELD.has(id) ? 'field' : GOLDFIN.has(id) ? 'marble' : id === 'har' ? 'platform' : 'ashlar');
  function layout(st) {
    if (st.lay) return st.lay;
    const id = st.id, def = st.def, U = st.U;
    const L = st.lay = { kind: SITE_KIND(id), rects: [], F: 1, blocks: [], cs: [], order: [], N: 0, rounds: 0, y0: st.bottom, H: 1, C: 1, n: -1, cur: 0, frac: 0, virtual: false };
    if (L.kind === 'cast') {   // cast bronze: 12 pours; the melt level rises pour by pour
      L.C = L.N = L.rounds = 12; L.H = (st.top - st.bottom) / 12;
      L.cs = Array.from({ length: 12 }, (_, c) => ({ fr: [[c]], n: 1, cum: c, rs: [0], R: 1 }));
      L.blocks = L.cs.map((_, c) => ({ x: def.foot[0][0] / 2 + def.foot[0][2] / 2, y: st.bottom + (c + 0.5) * L.H, z: (def.foot[0][1] + def.foot[0][3]) / 2, w: 5, h: L.H, nx: 0, nz: 1, c, f: 0, p: 0.5, j: 0, g: c }));
      L.order = L.blocks.map((_, i) => i);
      U.uC.value.set(st.bottom, L.H, 0, 0);
      return L;
    }
    // the rects, the working one first; K sectors each (≤ 32 fronts in all)
    const wp = (def.spot && def.spot.face) || [(st.fb.x0 + st.fb.x1) / 2, st.fb.z0];
    let rs = def.foot.map(([x0, z0, x1, z1]) => ({ x0, z0, x1, z1, W: x1 - x0, D: z1 - z0, L: 2 * (x1 - x0 + z1 - z0), K: 1, s0: 0, base: 0 }));
    L.rects = rs; frontOf(L, wp[0], wp[1]);
    rs = [rs[FR.r], ...rs.filter((_, i) => i !== FR.r)]; L.rects = rs;
    for (const r of rs) r.K = Math.max(1, Math.round(r.L / 110));
    let tot = rs.reduce((a, r) => a + r.K, 0);
    while (tot > 32) { rs.reduce((a, r) => (r.K > a.K ? r : a)).K--; tot--; }
    let F = 0; for (const r of rs) { r.base = F; F += r.K; }
    L.F = F;
    { const r = rs[0], K = r.K; r.K = 1; frontOf(L, wp[0], wp[1]); r.K = K; r.s0 = FR.s - 0.3 * r.L / K; }
    // the stones: texture blocks on the outer faces of the jointed materials
    const found = new Set(), per = {};
    for (const m of st.meshes) {
      if (m.isInstancedMesh || !m.geometry.attributes.uv) continue;
      const k = m.name, j = jointsFor(k, id); if (!j) continue;
      const tile = mats[k].tile, rows = j.rows, E = bottomFirst(j), Hk = tile / rows, out = per[k] || (per[k] = []);
      const P = m.geometry.attributes.position.array, UV = m.geometry.attributes.uv.array, NA = m.geometry.attributes.normal.array;
      for (let t = 0, nt = P.length / 9; t < nt; t++) {
        const a = t * 9, ua = t * 6, nx = NA[a], ny = NA[a + 1], nz = NA[a + 2];
        if (Math.abs(ny) >= 0.5) continue;
        const cx = (P[a] + P[a + 3] + P[a + 6]) / 3, cz = (P[a + 2] + P[a + 5] + P[a + 8]) / 3;
        frontOf(L, cx, cz); const en = EDGE_N[FR.edge];
        if (nx * en[0] + nz * en[1] < 0.7) continue;   // not an outer face
        const u0 = UV[ua], v0 = UV[ua + 1], du1 = UV[ua + 2] - u0, dv1 = UV[ua + 3] - v0, du2 = UV[ua + 4] - u0, dv2 = UV[ua + 5] - v0, det = du1 * dv2 - du2 * dv1;
        if (Math.abs(det) < 1e-9) continue;
        const iv = 1 / det, e1 = [P[a + 3] - P[a], P[a + 4] - P[a + 1], P[a + 5] - P[a + 2]], e2 = [P[a + 6] - P[a], P[a + 7] - P[a + 1], P[a + 8] - P[a + 2]];
        const Pu = [0, 1, 2].map((q) => (e1[q] * dv2 - e2[q] * dv1) * iv), Pv = [0, 1, 2].map((q) => (e2[q] * du1 - e1[q] * du2) * iv);
        const umin = Math.min(u0, u0 + du1, u0 + du2), umax = Math.max(u0, u0 + du1, u0 + du2), vmin = Math.min(v0, v0 + dv1, v0 + dv2), vmax = Math.max(v0, v0 + dv1, v0 + dv2);
        const plane = Math.round((Math.abs(nx) > Math.abs(nz) ? cx : cz) * 10);
        for (let r = Math.floor(vmin * rows + 1e-6); r < Math.ceil(vmax * rows - 1e-6); r++) {
          if (Math.min((r + 1) / rows, vmax) - Math.max(r / rows, vmin) < 0.5 / rows) continue;   // a sliver of a course
          const ed = E[((r % rows) + rows) % rows], ne = ed.length, vc = (r + 0.5) / rows;
          for (let ti = Math.floor(umin) - 1; ti <= Math.floor(umax); ti++) for (let q = 0; q < ne; q++) {
            const b0 = ti + ed[q], b1 = q + 1 < ne ? ti + ed[q + 1] : ti + 1 + ed[0];
            if (Math.min(b1, umax) - Math.max(b0, umin) < 0.5 * (b1 - b0)) continue;   // mostly off this face
            const uc = (b0 + b1) / 2, key = k + '|' + Math.round(nx * 4) + ',' + Math.round(nz * 4) + '|' + plane + '|' + r + '|' + Math.round(uc * 4096);
            if (found.has(key)) continue;
            found.add(key);
            const du = uc - u0, dv = vc - v0;
            out.push({ x: P[a] + du * Pu[0] + dv * Pv[0], y: P[a + 1] + du * Pu[1] + dv * Pv[1], z: P[a + 2] + du * Pu[2] + dv * Pv[2], w: (b1 - b0) * tile, h: Hk, nx, nz, H: Hk });
          }
        }
      }
    }
    // the courses follow the material with the most stones
    let mainK = null; for (const k of Object.keys(per)) if (!mainK || per[k].length > per[mainK].length) mainK = k;
    let blocks = mainK ? Object.values(per).flat() : [];
    if (blocks.length >= 6) {
      L.H = mats[mainK].tile / jointsFor(mainK, id).rows; L.y0 = Math.floor((st.bottom + 1e-3) / L.H) * L.H;
      // ── site12 ── (the owner's note 2, 29.9: "בשלב 3 … נראה בדיוק כמו בשלב ראשון") the stones below the site's bottom — the
      // Mount's body under the ground, −150…−62 — are not stones to set: all 13,674 of them were counted in course 0 (of the
      // Mount's 35,867), so the game's first two courses of six never raised its walls or its fill. They show as laid (the
      // reveal's course < 0); only the Mount has any (every other site's bottom is its geometry's lowest point).
      blocks = blocks.filter((b) => b.y >= L.y0);
    }
    else {   // no dressed faces to count (the soreg's lattice, small pieces): stones of ~4 amot along the perimeter, 1.5-amah courses
      L.virtual = true; L.H = 1.5; L.y0 = st.bottom; blocks = [];
      const C = Math.max(1, Math.ceil((st.top - st.bottom) / L.H - 1e-3));
      for (const R of rs) for (let f = 0; f < R.K; f++) {
        const len = R.L / R.K, m = Math.max(1, Math.round(len / 4));
        for (let c = 0; c < C; c++) for (let q = 0; q < m; q++) {
          const [x, z, nx, nz] = perimAt(R, R.s0 + (f + (q + 0.5) / m) * len);
          blocks.push({ x, y: L.y0 + (c + 0.5) * L.H, z, w: len / m, h: L.H, nx, nz });
        }
      }
    }
    L.C = Math.max(1, Math.ceil((st.top - L.y0) / L.H - 1e-3));
    L.cs = Array.from({ length: L.C }, () => ({ fr: Array.from({ length: F }, () => []), n: 0, cum: 0, rs: [], R: 0 }));
    blocks.forEach((b, i) => { frontOf(L, b.x, b.z); b.f = FR.f; b.p = FR.p; b.c = clamp(Math.floor((b.y - L.y0) / L.H), 0, L.C - 1); L.cs[b.c].fr[b.f].push(i); });
    L.blocks = blocks;
    let cum = 0;
    for (const cs of L.cs) {
      for (const a of cs.fr) { a.sort((i, j) => blocks[i].p - blocks[j].p); a.forEach((bi, j) => { blocks[bi].j = j; }); }
      cs.R = cs.fr.reduce((a, x) => Math.max(a, x.length), 0); cs.cum = cum; let k = 0;
      for (let j = 0; j < cs.R; j++) { cs.rs.push(k); for (let f = 0; f < F; f++) if (cs.fr[f].length > j) { blocks[cs.fr[f][j]].g = L.order.length; L.order.push(cs.fr[f][j]); k++; } }
      cs.n = k; cum += k; L.rounds += cs.R;
    }
    L.N = cum;
    // the reveal's static uniforms
    rs.forEach((r, i) => { U.uRect.value[i].set(r.x0, r.z0, r.x1, r.z1); U.uRK.value[i].set(r.K, r.L, r.s0, r.base); });
    U.uC.value.set(L.y0, L.H, 0, rs.length);
    U.uF.value.y = L.kind === 'field' ? 1 : 0;
    return L;
  }
  // the threshold between the cnt-th and the next stone of a front (−1: none set, 2: all)
  const thAt = (B, a, cnt) => (cnt <= 0 ? -1 : cnt >= a.length ? 2 : (B[a[cnt - 1]].p + B[a[cnt]].p) / 2);
  // show n stones: the current course, each front's threshold, the working front's ghosts and its freshest stone
  function stonesTo(st, n, force = false) {
    const L = st.lay, U = st.U; if (!L) return;
    n = clamp(Math.round(n), 0, L.N);
    if (n === L.n && !force) return;
    const prev = L.n; L.n = n;
    // ── flow10 ── the Mount's stones set ahead of the count: shown by the count now
    if (L.pend && L.pend.length && L.pend[0].g < n) { L.pend = L.pend.filter((p) => p.g >= n); propsDirty = true; }
    if (L.kind === 'cast') { L.cur = Math.min(n, L.C); L.frac = 0; return; }
    let cur = 0; while (cur < L.C && L.cs[cur].cum + L.cs[cur].n <= n) cur++;
    L.cur = cur;
    const B = L.blocks, th = U.uTh.value;
    if (cur >= L.C) { L.frac = 1; for (const v of th) v.set(2, 2, 2, 2); U.uC.value.z = L.C; U.uW.value.set(-1, 0, 0, -9); return; }
    const cs = L.cs[cur], k = n - cs.cum;
    L.frac = cs.n ? k / cs.n : 0;
    let j = 0; while (j + 1 < cs.R && cs.rs[j + 1] <= k) j++;
    let q = k - (cs.rs[j] || 0), rank = 0, cnt0 = 0;
    for (let f = 0; f < L.F; f++) {
      const a = cs.fr[f], m = a.length;
      let cnt;
      if (m <= j) cnt = m; else { cnt = j + (rank < q ? 1 : 0); rank++; }
      if (f === 0) cnt0 = cnt;
      th[f >> 2].setComponent(f & 3, m === 0 ? (cs.n ? k / cs.n : 1) : thAt(B, a, cnt));
    }
    U.uC.value.z = cur;
    const a0 = cs.fr[0];
    U.uW.value.x = a0.length ? thAt(B, a0, Math.min(a0.length, cnt0 + (st.ghostN === undefined ? 3 : st.ghostN))) : -1;
    // the freshest stone of the working front glows as it settles
    if (n > prev && prev >= 0) {
      for (let i = n - 1; i >= Math.max(prev, n - L.F - 1); i--) {
        const b = B[L.order[i]];
        if (b.f !== 0) continue;
        const af = L.cs[b.c].fr[0];
        U.uW.value.set(U.uW.value.x, b.j > 0 ? (b.p + B[af[b.j - 1]].p) / 2 : -1, b.j + 1 < af.length ? (b.p + B[af[b.j + 1]].p) / 2 : 2, b.c);
        U.uF.value.x = 1;
        break;
      }
    }
  }

  /* ── the hill + boulders ── */
  const hill = makeHill(T);
  scene.add(hill.mesh, hill.bushes);
  // ── site12 ── (the owner's note 2) the Mount's crest by its six courses (content.js PROJ.har; the game sends a logical stone k of
  // 192 as k / 192 of the real count, so the shown progress IS the logical course): the floor each course cuts, from the top of
  // the rock (40 amot over the platform's level at its peak) down to the level; within a course the new floor sweeps across the
  // crest from the east (the working side) and its fresh face moves west. harCut follows the Mount's shown progress every frame.
  const HAR_CR = [41, 30, 21, 13.5, 7.5, 3, -0.4];
  let bushAt = null;
  function harCut(disp) {
    const U = hill.U, C = U.uCrest.value;
    U.uCut.value = disp < FOUND ? 0 : smooth(FOUND, 0.95, disp);
    if (disp < FOUND) C.set(1000, 1000, 0, 2.5);
    else { const c = clamp((disp - FOUND) / (1 - FOUND), 0, 1) * 6, k = Math.min(5, Math.floor(c)); C.set(HAR_CR[k + 1], HAR_CR[k], -0.03 + (c - k) * 1.06, 2.5); }
    // the plaza's paving (mount.js's paving, drawn once the walls pass the platform's level): laid from the west from the fourth
    // course on, up to x 180 by the last; the strip by the bay — where the finish's paving patch grows at his strokes (N40) — in
    // the finish, and all of it once the finish is paid off. Until then the brown fill shows there (the hill's fill 0.35 over it)
    const hs = ST.har, P = U.uPave.value, c6 = disp < FOUND ? 0 : clamp((disp - FOUND) / (1 - FOUND), 0, 1) * 6;
    if (!hs || hs.status !== 'building' || disp < FOUND || c6 < 3.3 || U.uFill.value < -0.45) P.set(1e4, 0);
    else if (hs.phase === 'finish' || hs.phase === 'done') P.set((hs.finish || 0) >= 0.999 || hs.phase === 'done' ? 1e4 : 180, 1);
    else P.set(lerp(X0 - 10, 180, smooth(3.3, 6, c6)), 1);
    const key = [Math.round(U.uFill.value), C.x, C.y, Math.round(C.z * 60)].join();
    if (key !== bushAt) { bushAt = key; if (hill.bushCull(U.uFill.value, C)) requestShadow(false); }
    // (the heaps, the rubble and the carts move with the fill's edge and the crest's front: harCourseProps)
    const pk = disp < FOUND ? '' : [Math.round(Math.min(U.uFill.value, -0.4) / 3), C.x, Math.round(C.z * 10), P.y, Math.round(P.x / 20)].join();
    if (pk !== harPropsAt) { harPropsAt = pk; propsDirty = true; }
  }
  let harPropsAt = '';
  const BC = makeBoulderChunks(T);
  const bMesh = BC.geos.map((g) => { const m = new THREE.InstancedMesh(g, BC.mat, BOULDERS.length + QROCKS.length); m.count = BOULDERS.length; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m; });
  const bSt = BOULDERS.map(([x, z, r], i) => ({ x, z, r, yaw: R() * 6.28, sy: 0.8 + R() * 0.25, state: 2, anim: null, t: 0, crack: 0,
    lv: hill.heightAt(x, z), pt: -1, rub: 0 }));   // ── site8 ── the level of its patch, the time since it was split (−1: standing), its rubble left (0…1)

  // ── site14 ── the world's terrain as shown: main.js's terrain shader lowers it in the Mount's working bay (uPit, 8 amot wider)
  // (its mesh, world.js buildTerrain: 261 × 261 vertices at xs = 910 t + 2730 t³, lowered vertex by vertex, then interpolated)
  const TER_XS = new Float32Array(261); for (let i = 0; i <= 260; i++) { const t = i / 130 - 1; TER_XS[i] = 910 * t + 2730 * t * t * t; }
  const terIdx = (v) => { if (v <= TER_XS[0]) return 0; if (v >= TER_XS[260]) return 259; let lo = 0, hi = 260; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TER_XS[m] <= v) lo = m; else hi = m; } return lo; };
  function terV(x, z) {
    let y = terrainH(x, z); const U = hill.U, P = U.uPit.value, k = U.uPitK.value;
    if (k > 0 && P.z > P.x && Math.max(P.x - 8 - x, x - P.z - 8, P.y - 8 - z, z - P.w - 8) < 0) y += (Math.min(y, U.uFill.value - 0.3) - y) * k;
    return y;
  }
  function terrainShown(x, z) {
    const i = terIdx(x), j = terIdx(z), x0 = TER_XS[i], x1 = TER_XS[i + 1], z0 = TER_XS[j], z1 = TER_XS[j + 1];
    const u = clamp((x - x0) / (x1 - x0), 0, 1), v = clamp((z - z0) / (z1 - z0), 0, 1);
    if (u + v <= 1) { const ha = terV(x0, z0); return ha + (terV(x1, z0) - ha) * u + (terV(x0, z1) - ha) * v; }
    const hd = terV(x1, z1); return hd + (terV(x0, z1) - hd) * (1 - u) + (terV(x1, z0) - hd) * (1 - v);
  }
  /* ── navigation: the ground level wherever the hero or a worker stands ── */
  const XR12 = [-55, -56, -57, -60, -61, -62, -65, -66, -67, -70, -71, -72];
  // ── site20 ── (the owner, 9/11: "הדמות נבלעת בתוך הקיר") PLAN A: from course 3 up, under two thumbs, the kohen works ON the wall's laid top.
  // The ground of the wall's band (the ring: 6 amot thick) is the top as laid (shownTop) while the wall builds and twin is on; a visible
  // earth ramp (המחשה) leans on the band's inner face by the working slot — he walks up it with the stick, and a walk the game asks for
  // goes up it when he is inside the court; the band's and the ramp's edges are walls to the stick (never off the top).
  const S20 = { act: false, on: false, nx: 0, nz: 1, ux: 1, uz: 0, ax: 0, az: 0, w: 6.4, SL: 0.6, top: 0, topE: 0, base: 0, Lr: 0, t: 0, dirty: false, mesh: null, ky: '' };
  const S20_OUT = [-193, -73.5, 147, 73.5], S20_IN = [-187, -67.5, 141, 67.5], S20_THICK = 6, S20_MIN = 6.4;
  function s20Band(x, z) {
    if (!(x > S20_OUT[0] && x < S20_OUT[2] && z > S20_OUT[1] && z < S20_OUT[3])) return false;
    if (x > S20_IN[0] && x < S20_IN[2] && z > S20_IN[1] && z < S20_IN[3]) return false;
    return !(x > 141 && Math.abs(z) < 13);   // (the eastern gap)
  }
  /** the height of the wall's top (and the ramp) at (x, z) as shown; −1e9 where neither is */
  function s20Top(x, z) {
    if (!S20.act) return -1e9;
    let y = -1e9;
    if (s20Band(x, z)) { const t = shownTop('wall', x, z, ST.wall.top, 0); if (t > 0.5) y = t; }
    if (S20.on) {
      const dx = x - S20.ax, dz = z - S20.az, s = -(dx * S20.nx + dz * S20.nz), q = dx * S20.ux + dz * S20.uz;
      if (s >= -0.2 && s <= S20.Lr && Math.abs(q) <= S20.w / 2) y = Math.max(y, S20.base + (S20.topE - S20.base) * (1 - Math.max(0, s) / S20.Lr));
    }
    return y;
  }
  // ── /site20 ──
  function groundAt(x, z) {
    if (!isDone('har')) {
      const hs = ST.har;
      if (hs.status !== 'building') return hill.heightAt(x, z);
      // ── site14 ── (BRAIN14-SITE14 probe: at the east face's dress spots he stood 1.5–2.3 amot inside the laid courses) the rock
      // or the platform's body as its courses show it (the body is one solid under the whole Mount: its cap is the top laid)
      if (x > X0 && x < X1 && z > Z0 && z < Z1) return Math.max(hill.heightAt(x, z), shownTop('har', x, z, 0, -150));
      return terrainShown(x, z);   // ── site14 ── (beyond the platform: the valley's terrain, as its shader lowers it in the Mount's bay)
    }
    if (x < X0 || x > X1 || z < Z0 || z > Z1) return terrainShown(x, z);
    // ── site14 ── (the owner, 30.9 23:27: "הדמות עדיין לפעמים צפה באוויר או שוקעת"; BRAIN14-SITE14 causes 2–3) every floor as it
    // is SHOWN (shownTop: batch.js's reveal — the courses laid, the stones of this course where they are laid — not only once
    // its stage is done) and every stair as stairs (temple.js 35–41, 104–117, 120–135, 272–277): the Chel's 12 half-amah steps,
    // the duchan's, Nikanor's 15 rounded ones, the Ulam's 12, the altar's levels and the kevesh
    let y = 0;
    const d = Math.max(-203 - x, x - 157, -83.5 - z, z - 83.5);   // the Chel's terrace (y 6) and its steps, round it
    if (d <= 5.5) y = Math.max(y, shownTop('sorag', x, z, d <= 0 ? 6 : 0.5 * (Math.floor((5.5 - d) / 0.5 + 1e-9) + 1), 0));
    if (Math.abs(z) < 67.5 && x > -187 && x < 0) y = Math.max(y, shownTop('wall', x, z, x <= -11 ? 16 : x <= -10 ? 15.5 : x <= -9 ? 15 : x <= -8 ? 14.5 : 13.5, 0));
    if (x >= 10 && Math.abs(z) < 13.5) { const r = Math.hypot(x - 10, z); if (r <= 13.5) y = Math.max(y, shownTop('nikanor', x, z, 13.5 - 0.5 * (r <= 6.5 ? 0 : Math.ceil((r - 6.5) / 0.5 - 1e-9)), 0)); }
    if (x > 6 && x < 141 && Math.abs(z) < 67.5) y = Math.max(y, shownTop('nashim', x, z, 5.9, 0));   // (the court's floor on its footing)
    if (x > -76.2 && x < -54.5 && Math.abs(z) < 50) { let n = 0; for (const xr of XR12) if (x <= xr) n++; if (n) y = Math.max(y, shownTop('ulam', x, z, 16 + 0.5 * n, 15.9)); }
    if (x > -92 && x < -76 && Math.abs(z) < 30 && (x < -81 || Math.abs(z) < 10)) y = Math.max(y, shownTop('ulam', x, z, 22, 16));   // (the Ulam's hall and its opening's sill)
    if (x > -139 && x <= -92 && Math.abs(z) < 10) y = Math.max(y, shownTop('heichal', x, z, 22, 16));   // ── recovered (build 26) ── (the Heichal's floor: he may go in)
    // (── site13 ── N76 b) the altar as it stands — the yesod's ledge, the sovev, the top — and the kevesh (temple.js 120–137)
    if (x > -54 && x < -22 && z > -19.5 && z < 42.5) {
      if (z <= 12.5) {
        const yes = (z <= -18.5) || (x <= -53) || (x <= -23 && z <= 11.5) || (x >= -23 && z <= -17.5) || (x <= -52 && z >= 11.5);
        if (yes) y = Math.max(y, shownTop('yesod', x, z, 17, 16));
        if (x >= -53 && x <= -23 && z >= -18.5 && z <= 11.5) y = Math.max(y, shownTop('sovev', x, z, 22, 17));
        if (x >= -52 && x <= -24 && z >= -17.5 && z <= 10.5) y = Math.max(y, shownTop('guf', x, z, 25, 22));
      }
      if (x > -46 && x < -30 && z >= 10.5) y = Math.max(y, shownTop('guf', x, z, 16.05 + 8.95 * clamp((42.5 - z) / 32, 0, 1), 16));
    }
    if (S20.act) { const t = s20Top(x, z); if (t > -1e8) y = t; }   // ── site20 ── (the wall's laid top, and its ramp) ── /site20 ──
    return y;
  }
  // ── site14 ── the top of stage `id`'s masonry SHOWN at (x, z) for a solid from `bottom` to `top`: `top` once done; while it
  // builds, batch.js's reveal (the stone-by-stone branch: the courses below the current one, this course's stones where its
  // front is laid, the cap of the course below elsewhere; the horizontal cut uY for the cast kiyor); −∞ where nothing shows
  function shownTop(id, x, z, top, bottom) {
    const st = ST[id]; if (!st) return -1e9;
    if (st.status === 'done') return top;
    if (st.status !== 'building' || !st.group.visible) return -1e9;
    const U = st.U, C = U.uC.value;
    let cap = U.uY.value;
    if (C.w > 0.5 && st.lay && st.lay.rects && st.lay.rects.length) {
      const f = frontOf(st.lay, x, z), th = U.uTh.value[f.f >> 2], t = th ? [th.x, th.y, th.z, th.w][f.f & 3] : 0;
      cap = C.x + (C.z + (f.p < t ? 1 : 0)) * C.y;
    }
    return cap < bottom + 1e-3 ? -1e9 : Math.min(top, cap);
  }
  // ── /site14 ──

  /* ── FX ── */
  const dustCol = new THREE.Color('#C9B58F'), goldCol = new THREE.Color(3.2, 2.2, 0.75);
  const dust = new Puffs(260, T.puff, dustCol, false), spark = new Puffs(360, TX.texGlow(), goldCol, true);
  const chips = new Chips(220);
  scene.add(dust.points, spark.points, chips.m);
  const ringTex = canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.8, 'rgba(255,255,255,0)'); g.addColorStop(0.95, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
  const ringFx = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 0.85, 0.25), map: ringTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  ringFx.visible = false; ringFx.frustumCulled = false; scene.add(ringFx);
  const ringS = { t: 1, r0: 10, r1: 80, y: 0 };
  // particle options without allocations: one shared object, filled positionally for each spawn
  const PO_ = { spread: 0, spreadY: 0, speed: 0, up: 0, s0: 0, s1: 0, life: 0, grav: 0, drag: 0, alpha: 0, twinkle: false, ring: 0 };
  function PO(spread, spreadY, speed, up, s0, s1, life, grav, drag, alpha, twinkle = false, ring = 0) {
    const o = PO_; o.spread = spread; o.spreadY = spreadY; o.speed = speed; o.up = up; o.s0 = s0; o.s1 = s1; o.life = life; o.grav = grav; o.drag = drag; o.alpha = alpha; o.twinkle = twinkle; o.ring = ring;
    return o;
  }
  function dustBurst(x, y, z, n = 14, size = 5, spread = 4, up = 3) { dust.spawn(x, y, z, n, PO(spread, 1, spread * 1.2, up, size * 0.5, size * 1.8, 2.2, -0.3, 1.6, 0.3)); }
  function sparkBurst(x, y, z, n = 30, spread = 8, up = 10) { spark.spawn(x, y, z, n, PO(spread, spread * 0.5, spread * 0.6, up, 1.8, 0.6, 1.6, 5, 1.4, 1, true)); }

  /* ── footprint outlines: one mesh for all stages, per-stage intensity in a uniform array ── */
  const OL = { I: new Float32Array(16), base: new Float32Array(16) };
  const outline = (() => {
    const P = [], N = [], S = [], I = [], D = [], V = [], HY = [], idx = [];
    // per sample: a ground ribbon (2 vertices, aV = 0) and a vertical glow curtain (2 vertices, aS = 0, aV = 0 → 1)
    const seg = (st, ax, az, bx, bz, nx, nz, dist0) => {
      const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / (st.id === 'har' ? 5 : 8)));
      for (let k = 0; k <= n; k++) {
        const t = k / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t;
        const y = st.id === 'har' ? hill.heightAt(x, z) + 1.2 : st.base + 0.3;
        const hy = hill.heightAt(x, z) + 1.2;
        for (const [s, v] of [[-1, 0], [1, 0], [0, 0], [0, 1]]) { P.push(x, y, z); N.push(nx, nz); S.push(s); V.push(v); I.push(st.idx); D.push(dist0 + L * t); HY.push(hy); }
        if (k) { const b = P.length / 3 - 8; idx.push(b, b + 1, b + 4, b + 1, b + 5, b + 4, b + 2, b + 3, b + 6, b + 3, b + 7, b + 6); }
      }
      return dist0 + L;
    };
    for (const st of list) for (const [x0, z0, x1, z1] of st.def.foot) {
      const e = 1.2; let d = 0;
      // each edge extends past the corners so the band closes; normals point outward
      d = seg(st, x0 - e, z0, x1 + e, z0, 0, -1, d); d = seg(st, x1, z0 - e, x1, z1 + e, 1, 0, d);
      d = seg(st, x1 + e, z1, x0 - e, z1, 0, 1, d); d = seg(st, x0, z1 + e, x0, z0 - e, -1, 0, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('aN', new THREE.Float32BufferAttribute(N, 2));
    g.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1));
    g.setAttribute('aI', new THREE.Float32BufferAttribute(I, 1));
    g.setAttribute('aD', new THREE.Float32BufferAttribute(D, 1));
    g.setAttribute('aV', new THREE.Float32BufferAttribute(V, 1));
    g.setAttribute('aHY', new THREE.Float32BufferAttribute(HY, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { uI: { value: OL.I }, uTime: BUILD_TIME, uCol: { value: new THREE.Color(2.3, 1.62, 0.5) }, uPlan: { value: 0 } },
      vertexShader: `attribute vec2 aN; attribute float aS; attribute float aI; attribute float aD; attribute float aV; attribute float aHY; uniform float uI[16]; uniform float uPlan;
        varying float vS; varying float vI; varying float vD; varying float vV; varying float vK;
        void main(){
          vI = uI[int(aI + 0.5)]; vS = aS; vD = aD; vV = aV; vK = aS == 0.0 ? 1.0 : 0.0;
          vec3 base = vec3(position.x, mix(position.y, aHY, uPlan), position.z);
          float d = distance(cameraPosition, base);
          float on = vI > 0.0 ? 1.0 : 0.0;
          float w = clamp(d * 0.0045, 0.7, 8.0) * on, h = clamp(d * 0.011, 1.6, 16.0) * on * (vI > 0.5 ? 1.0 : 0.45);
          vec3 p = base + vec3(aN.x, 0.0, aN.y) * aS * w * 0.5 + vec3(0.0, aV * h, 0.0);
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `uniform vec3 uCol; uniform float uTime; varying float vS; varying float vI; varying float vD; varying float vV; varying float vK;
        void main(){
          if (vI < 0.002) discard;
          float pulse = 0.62 + 0.38 * sin(uTime * 3.4);
          float f = fract(vD / 90.0 - uTime * 0.22);
          float dash = smoothstep(0.0, 0.08, f) * (1.0 - smoothstep(0.1, 0.24, f));
          float alpha = vK > 0.5 ? (1.0 - vV) * (1.0 - vV) * 0.5 : 1.0 - smoothstep(0.55, 1.0, abs(vS));
          gl_FragColor = vec4(uCol * (0.9 + dash * 1.6), clamp(vI * alpha * (pulse + dash * 0.8), 0.0, 1.0));
        }`,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -8,
    });
    const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 3; mesh.visible = false;
    scene.add(mesh);
    return mesh;
  })();

  /* ── pins over available sites ── */
  const pinGeo = new THREE.OctahedronGeometry(1, 0).scale(0.75, 1.5, 0.75).translate(0, 1.5, 0);
  const pins = new THREE.InstancedMesh(pinGeo, new THREE.MeshStandardMaterial({ color: '#F2C14E', emissive: '#FFB21E', emissiveIntensity: 1.3, metalness: 0.5, roughness: 0.3, flatShading: true }), 15);
  pins.count = 0; pins.frustumCulled = false; scene.add(pins);
  const beamTex = canvasTex(64, (x, s) => { const g = x.createLinearGradient(0, 0, 0, s); g.addColorStop(0, '#000'); g.addColorStop(0.5, '#555'); g.addColorStop(1, '#fff'); x.fillStyle = g; x.fillRect(0, 0, s, s); }, false);
  const beams = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.62, 0.2), alphaMap: beamTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), 15);
  beams.count = 0; beams.frustumCulled = false; beams.renderOrder = 4; scene.add(beams);
  // a soft pulsing halo behind each pin gem
  const halo = new Puffs(15, TX.texGlow(), new THREE.Color(2.2, 1.5, 0.45), true);
  halo.points.renderOrder = 5; scene.add(halo.points);
  // stages sharing a site (the altar's courses) show one pin when the vision or the showcase lights them all
  for (const st of list) {
    const p = st.def.pin, fb = st.fb, x = p ? p[0] : (fb.x0 + fb.x1) / 2, z = p ? p[1] : (fb.z0 + fb.z1) / 2;
    st.pinXZ = [x, z]; st.pinDup = list.some((o) => o.idx < st.idx && o.pinXZ && Math.hypot(o.pinXZ[0] - x, o.pinXZ[1] - z) < 3);
  }
  function pinPos(st, out) {
    const p = st.def.pin, fb = st.fb;
    const x = p ? p[0] : (fb.x0 + fb.x1) / 2, z = p ? p[1] : (fb.z0 + fb.z1) / 2;
    const y = st.id === 'har' ? hill.heightAt(x, z) + 52 : Math.max(st.top, st.base + 20) + 10;
    return out.set(x, y, z);
  }

  /* ── foundation props (stakes, ropes, flags, stone piles) in one instanced mesh ── */
  const props = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.88 }), 4000);
  props.count = 0; props.castShadow = true; props.receiveShadow = true; props.frustumCulled = false; scene.add(props);
  const field = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.7, 0), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }), 1200);
  field.count = 0; field.castShadow = true; field.frustumCulled = false; scene.add(field);
  // (wave 6) real stones: dressed/drafted ashlars and rough blocks — same materials (and programs) as props / field
  const ashGeo = ashlarGeometry(), roughGeo = roughGeometry();
  const ashI = new THREE.InstancedMesh(ashGeo, props.material, 900), roughI = new THREE.InstancedMesh(roughGeo, field.material, 300);
  for (const m of [ashI, roughI]) { m.count = 0; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.visible = false; scene.add(m); }
  const dirtTex = TX.texGround(97, 256).map;
  const dirtMat = new THREE.MeshStandardMaterial({ color: '#B89C74', map: dirtTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
  dirtMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aSize; varying vec2 vLoc; varying vec2 vSz;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvLoc = uv; vSz = aSize;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n#ifdef USE_MAP\nvMapUv = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xz / 11.0;\n#endif');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vLoc; varying vec2 vSz;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec2 e = min(vLoc, 1.0 - vLoc) * vSz; float a = smoothstep(0.0, 3.5, min(e.x, e.y));
          diffuseColor.a *= a * 0.92; }`);
  };
  dirtMat.customProgramCacheKey = () => 'dirt';
  const dirtGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  dirtGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(new Float32Array(64 * 2), 2));
  const dirt = new THREE.InstancedMesh(dirtGeo, dirtMat, 64);
  dirt.count = 0; dirt.receiveShadow = true; dirt.frustumCulled = false; dirt.renderOrder = 1; scene.add(dirt);

  let propsDirty = true;
  /* ── site8 ── the Mount's working patch in props (DESIGN8B R4/R5): every split rock's patch staked out — a stake and a red rag
     at each corner, a cord along each side at its current size — its spoil heap growing as the rubble goes, a basket on it;
     at the builder's rock and the three next: picks and a lever lying ready, baskets, a water jar; the survey's pegs and cord
     from the builder's rock to the next one (the line the gangs work along) */
  function mountProps(put, putF, putR, putA) {
    const hr = heroRock();
    surveyProps(put);
    // the Mount's first retaining course at its east face, by the crane and the cart's dump (DESIGN8B M6): the chalk line of the
    // wall's face along the edge, and two great ashlars laid on it for every rock split — the dig's progress seen at a glance
    { let k = 0; for (const b of bSt) if (b.state <= 0 && b.pt >= 0) k++;
      const X = X1 - 2.6, z0 = 6, z1 = 138;
      for (let z = z0; z < z1; z += 6) { const y = groundAt(X + 1.4, z + 3); put(X + 1.4, y + 0.06, z + 3, 0.35, 0.05, 6, 0, '#F2ECDD'); }
      const n = Math.min(24, k * 2);
      for (let i = 0; i < n; i++) { const z = z0 + 4 + i * 5.3, y = Math.max(groundAt(X, z - 2.6), groundAt(X, z + 2.6)); putA(X, y + 1.1, z, 2.4, 2.2, 5.1, 0, i % 3 ? '#D8C9A6' : '#CFBF99'); }
      if (n) put(X - 3.2, groundAt(X - 3.2, z0 + 4 + n * 5.3) + 0.9, z0 + 4 + n * 5.3, 0.22, 1.8, 0.22, 0, '#6B4E31');   // the setting-out peg at the course's end
    }
    for (let i = 0; i < bSt.length; i++) {
      const b = bSt[i];
      if (b.state <= 0 && b.pt >= 0) {
        const P = hill.U.uPatch.value[i], h = P.z > 0 ? P.z : b.r * 1.05, y0 = b.lv;
        const cs = [[b.x - h, b.z - h], [b.x + h, b.z - h], [b.x + h, b.z + h], [b.x - h, b.z + h]];
        for (let k = 0; k < 4; k++) {
          const [ax, az] = cs[k], [bx, bz] = cs[(k + 1) % 4];
          put(ax, y0 + 0.9, az, 0.22, 2.0, 0.22, 0, '#6B4E31');
          put(ax, y0 + 2.1, az, 0.05, 0.7, 1.0, k * 1.57 + 0.6, '#B8352A');
          const L = Math.hypot(bx - ax, bz - az);
          put((ax + bx) / 2, y0 + 1.25, (az + bz) / 2, 0.07, 0.07, L, Math.atan2(bx - ax, bz - az), '#EDE3C8');
        }
        // the spoil heap: grows as the rubble goes (three lumps), a basket on its flank
        const sp = spoilSpot(b), g = groundAt(sp[0], sp[1]), k = (1 - b.rub) * 0.85 + 0.15;
        putF(sp[0], g + 0.3, sp[1], 5.2 * k, 2.6 * k, 4.6 * k, b.yaw, '#C9B596');
        putF(sp[0] + 2.2, g + 0.2, sp[1] - 1.6, 3.4 * k, 1.7 * k, 3.1 * k, b.yaw + 1, '#BBA684');
        putF(sp[0] - 2, g + 0.15, sp[1] + 1.8, 2.8 * k, 1.3 * k, 2.6 * k, b.yaw + 2, '#D4C3A2');
        if (b.rub > 0.001) putF(sp[0] + 3.4, g + 0.3, sp[1] + 2.2, 0.62, 0.45, 0.62, i, '#8A6A3E');
        // chips on the patch, fewer as it is swept
        for (let q = 0; q < Math.round(8 * b.rub); q++) { const a = q * 2.4 + i, rr = b.r * (0.5 + 0.5 * ((q * 37) % 10) / 10), x = b.x + Math.cos(a) * rr, z = b.z + Math.sin(a) * rr; putR(x, groundAt(x, z) + 0.25, z, 0.9, 0.6, 0.8, a, '#D6CCB4', 1, a * 0.3); }
      } else if (b.state > 0 && (i === hr || Math.hypot(b.x - hero.x, b.z - hero.z) < 170)) {
        // tools ready at a standing rock: two picks and a lever on the ground, baskets, a water jar (on the side away from the builder)
        const a0 = Math.atan2(hero.z - b.z, hero.x - b.x) + Math.PI + 0.5, rr = b.r + 3.2;
        const tx = b.x + Math.cos(a0) * rr, tz = b.z + Math.sin(a0) * rr, ty = groundAt(tx, tz), yaw = a0 + 1.2;
        const cy = Math.cos(yaw), sy = Math.sin(yaw);
        for (let q = 0; q < 2; q++) {
          const ox = tx + cy * q * 1.3, oz = tz - sy * q * 1.3;
          put(ox, ty + 0.12, oz, 0.13, 0.13, 3.1, yaw, '#7A5A3A');                                  // the handle
          put(ox + sy * 1.5, ty + 0.18, oz + cy * 1.5, 1.1, 0.2, 0.22, yaw, '#5E5A55');            // the pick's head
        }
        put(tx - cy * 1.6, ty + 0.14, tz + sy * 1.6, 0.16, 0.16, 4.4, yaw + 0.2, '#6B4E31');       // the lever
        putF(tx + sy * 3.2, ty + 0.32, tz + cy * 3.2, 0.66, 0.46, 0.66, i, '#8A6A3E');             // baskets
        putF(tx + sy * 3.2 + 1, ty + 0.3, tz + cy * 3.2 - 0.6, 0.62, 0.44, 0.62, i + 1, '#7E6038');
        putF(tx - sy * 1.4 - cy, ty + 0.5, tz - cy * 1.4 + sy, 0.42, 0.62, 0.42, 0, '#A0673E');     // a water jar
        if (i === hr) {
          // the survey's pegs and cord to the next rock: the line the gangs work along
          let nb = -1, nd = 1e9; for (let k = 0; k < bSt.length; k++) { const q = bSt[k]; if (k === i || q.state <= 0) continue; const d = Math.hypot(q.x - b.x, q.z - b.z); if (d < nd) { nd = d; nb = k; } }
          if (nb >= 0 && nd < 200) {
            const q = bSt[nb], ux = (q.x - b.x) / nd, uz = (q.z - b.z) / nd, s0 = b.r + 2, s1 = nd - q.r - 2, m = Math.max(1, Math.round((s1 - s0) / 7));
            let px = 0, py = 0, pz = 0;
            for (let k = 0; k <= m; k++) {
              const t = s0 + (s1 - s0) * k / m, x = b.x + ux * t + uz * 1.5, z = b.z + uz * t - ux * 1.5, y = groundAt(x, z);
              put(x, y + 0.7, z, 0.18, 1.5, 0.18, 0, '#6B4E31');
              if (k) { const L = Math.hypot(x - px, z - pz, y - py); put((x + px) / 2, (y + py) / 2 + 1.25, (z + pz) / 2, 0.06, 0.06, L, Math.atan2(x - px, z - pz), '#EDE3C8', -Math.atan2(y - py, Math.hypot(x - px, z - pz))); }
              px = x; py = y; pz = z;
            }
          }
        }
      }
    }
  }
  /* ── site12 ── (the owner's note 2: "רואים את ההתקדמות של החציבה") the Mount's courses seen from far: the rock cut from the
     crest goes into the fill behind the rising walls (STAGING M15): spoil heaps tipped along the fill's edge (the next lift),
     rubble and squared blocks along the cut crest's rim, and ox carts between the two — where they are moves every course.
     Candidates on a fixed jittered grid (their natural height computed once); none in the working bay, by the walls, or on the
     paving patch; all in the props' instances (no draw call). Illustration: no source describes how the rock was carted. */
  let harCand = null;
  function harCourseProps(put, putF, putR) {
    const hs = ST.har, U = hill.U, C = U.uCrest.value, fill = Math.min(U.uFill.value, -0.4);
    if (hs.status !== 'building' || hs.disp < FOUND || hs.phase === 'finish' || hs.phase === 'done' || C.x > 999) return;
    if (!harCand) {
      harCand = [];
      const r = rng(1212);
      for (let x = X0 + 22; x < X1 - 20; x += 19) for (let z = Z0 + 24; z < Z1 - 24; z += 19) {
        const px = x + (r() - 0.5) * 12, pz = z + (r() - 0.5) * 12;
        harCand.push({ x: px, z: pz, y0: hillY0(px, pz), h: r(), yaw: r() * 6.28, sw: clamp((14 - px + 16 * Math.sin(pz / 61)) / 270, 0, 1) });
      }
      // (in a shuffled order: the caps below then sample the whole Mount — in grid order they filled up in its west half)
      for (let i = harCand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = harCand[i]; harCand[i] = harCand[j]; harCand[j] = t; }
    }
    const bz = crane.st === hs ? crane.bz : 40;
    const clear = (p) => !(p.x > X1 - 78 && Math.abs(p.z - bz) < 62) && !(p.x > 180 && p.x < 236 && p.z > 0 && p.z < 70);
    const rims = [], tips = [], loads = [], k6 = Math.min(5, Math.floor(clamp((hs.disp - FOUND) / (1 - FOUND), 0, 1) * 6));
    for (const p of harCand) {
      if (!clear(p)) continue;
      const lv = lerp(C.y, C.x, 1 - smooth(C.z - 0.012, C.z + 0.012, p.sw)), rimLo = lv - 3 * C.w;
      // (both on the hill's own slope: above the fill — never on the finished platform — and below the cut's benches)
      if (p.y0 >= fill + 1.5 && p.y0 < Math.min(fill + 10, rimLo - 0.5) && p.h < 0.62 && tips.length < 70) tips.push(p);
      else if (p.y0 >= Math.max(rimLo - 7, fill + 1) && p.y0 < rimLo - 0.5 && p.h < 0.7 && rims.length < 44) rims.push(p);
      // (the loads tipped on this course's lift of the fill, not yet spread: where they lie changes with every course)
      else if (p.y0 < fill - 2 && fill < -1 && ((p.h * 7919 + k6 * 0.618) % 1) < 0.1 && loads.length < 70) loads.push(p);
    }
    // (big enough to read from the pinch-out, paler than the tamped fill: r3 showed two of them at 490 amot)
    for (const p of loads) { const g = groundAt(p.x, p.z), s = 1.1 + 0.5 * ((p.h * 31) % 1); putF(p.x, g + 0.4, p.z, 6.5 * s, 2.4 * s, 5.4 * s, p.yaw, p.h < 0.5 ? '#CDB595' : '#D8C3A2'); putF(p.x + 4 * s, g + 0.3, p.z - 2 * s, 3.6 * s, 1.5 * s, 3 * s, p.yaw + 1, '#C2A887'); }
    // the spoil tipped at the fill's edge: two or three lumps, the colour of the fill
    for (const p of tips) {
      const g = groundAt(p.x, p.z), s = 0.8 + 0.5 * p.h;
      putF(p.x, g + 0.5, p.z, 7.5 * s, 3.2 * s, 6.2 * s, p.yaw, p.h < 0.3 ? '#B99873' : '#C4A682');
      putF(p.x + 3.4 * Math.cos(p.yaw), g + 0.3, p.z + 3.4 * Math.sin(p.yaw), 4.6 * s, 2.1 * s, 4 * s, p.yaw + 1, '#AD8C66');
    }
    // the rubble at the crest's rim: pale cut rock heaped, a few squared blocks beside it
    for (let i = 0; i < rims.length; i++) {
      const p = rims[i], g = groundAt(p.x, p.z), s = 0.75 + 0.5 * p.h;
      putF(p.x, g + 0.3, p.z, 7 * s, 2.2 * s, 6 * s, p.yaw, p.h < 0.35 ? '#B9AC92' : '#C6B99D');
      putF(p.x + 3 * Math.cos(p.yaw + 1), g + 0.2, p.z + 3 * Math.sin(p.yaw + 1), 4 * s, 1.4 * s, 3.4 * s, p.yaw + 2, '#A99C84');
      if (i % 2 === 0) for (let q = 0; q < 2; q++) { const a = p.yaw + 2 + q * 0.7; putR(p.x + Math.cos(a) * 5.5, g + 0.7, p.z + Math.sin(a) * 5.5, 2.4, 1.3, 1.7, a, '#D2C6AC'); }
    }
    // ox carts on the way from the rim to the tipping edge: 3 in the first course, one more each course
    const nc = Math.min(8, 3 + Math.floor(clamp((hs.disp - FOUND) / (1 - FOUND), 0, 1) * 6));
    for (let i = 0; i < nc && rims.length && tips.length; i++) {
      const a = rims[(i * 7) % rims.length], b = tips[(i * 11 + 3) % tips.length], t = 0.3 + 0.4 * (((i * 37) % 10) / 10);
      const x = lerp(a.x, b.x, t), z = lerp(a.z, b.z, t), yaw = Math.atan2(b.x - a.x, b.z - a.z), g = groundAt(x, z);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      put(x, g + 1.25, z, 2.2, 0.8, 3.4, yaw, '#7A5A3A');                                               // the bed
      putF(x, g + 1.8, z, 1.7, 0.9, 2.6, yaw, '#D6CCB4');                                               // its load of rubble
      for (const sd of [-1, 1]) putF(x + cy * sd * 1.25, g + 0.8, z - sy * sd * 1.25, 0.35, 1.6, 1.6, yaw, '#4E3A26');   // wheels
      for (const sd of [-1, 1]) putF(x + sy * 4.2 + cy * sd * 0.8, g + 1.2, z + cy * 4.2 - sy * sd * 0.8, 1.1, 1.5, 2.6, yaw, sd > 0 ? '#8C6A4A' : '#A07E5A');   // the oxen
      put(x + sy * 2.4, g + 1.2, z + cy * 2.4, 0.12, 0.12, 3.2, yaw, '#6B4E31');                        // the yoke's pole
    }
    // the paving's front (uPave): a chalk line along it and stacks of slabs waiting on the fill just east of it
    const PV = U.uPave.value;
    if (PV.y > 0.5 && PV.x > X0 && PV.x < X1) {
      for (let z = Z0 + 30; z < Z1 - 30; z += 12) { const g = groundAt(PV.x + 0.8, z); if (g < 1) put(PV.x + 0.8, g + 0.06, z, 0.3, 0.04, 12, 0, '#F2ECDD'); }
      for (let z = Z0 + 40, i = 0; z < Z1 - 40; z += 44, i++) {
        const x = PV.x + 4, g = groundAt(x, z); if (g > 1 || !clear({ x, z })) continue;
        for (let q = 0; q < 3; q++) put(x, g + 0.3 + q * 0.42, z + (i % 2) * 2, 2.6, 0.38, 1.8, 0.1 * i, q % 2 ? '#DAD2C2' : '#E3DCCD');
      }
    }
  }
  /** ── site12 ── (the owner's note 2) a whole-Mount frame for a course's beat: the crest a bench lower, the fill, the walls and the
   *  paving — from the south-east over the Kidron (test/site_mount_courses.cjs's 'se' camera) → { x, y, z, dist, az, el, p, t } in
   *  view.lookAt's convention (dist before its portrait × 1.35; p already for this screen) | null (other sites keep their beat) */
  function courseView(id) {
    if (id !== 'har') return courseBeatView(id);   // ── director13 ──
    if (!ST.har || ST.har.status !== 'building') return null;
    const x = -20, y = -12, z = -10, dist = 713, az = 49, el = 28;
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
    scPos(x, y, z, portrait ? dist * 1.35 : dist, az, el, scP);
    return { x, y, z, dist, az, el, p: [scP[0], scP[1], scP[2]], t: [x, y, z] };
  }
  // ── director13 ── (C7, PRODUCER-S13a #9: the course beat at the walled sites was "from 70 amot, 44° down, over the next slot: the
  // crane's jib and top fill the frame, the course a strip at the bottom, him ~10 px; at the gates' 3rd course the empty paving")
  // every other site's course beat: ALONG the course just closed, from outside its face, 27° up, 84 amot on a phone — the course's
  // top at the frame's centre (its middle third), running away along the face; the camera on the side away from the crane, so
  // the crane stands behind the course, never in front; a clear line (frameBlocked: the courts, the finished sites, the site's own
  // courses, the stock, the crane's column) — else the nearest clear turn or rise. → { x, y, z, dist, az, el, p, t } (dist in
  // view.lookAt's convention, before its portrait × 1.35; p for this screen) | null
  function courseBeatView(id) {
    const st = ST[id]; if (!st || st.status !== 'building' || st.disp < FOUND) return null;
    const s = nextSlot(id); if (!s || !Array.isArray(s.n)) return null;
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
    const D = portrait ? 84 : 84 / 1.35, EL = 27;
    let [ux, uz] = slotTangent(id, s);
    const nx = s.n[0], nz = s.n[1];
    // (the course just closed: its top is the next slot's bed; on the altar and the low lattice a little above, so its face shows)
    const g = groundAt(s.face[0] + nx * 4, s.face[2] + nz * 4), ty = Math.max(g + 1.2, s.y - (s.h || 1) * 0.5);
    // (a little along the course away from the camera: the laid run fills the frame's middle, the next slot at its near edge)
    if (crane.st === st && crane.g.visible && (crane.bx - s.face[0]) * ux + (crane.bz - s.face[2]) * uz < 0) { ux = -ux; uz = -uz; }   // (u: toward the crane)
    const tx = s.face[0] + ux * 6, tz = s.face[2] + uz * 6;
    // the camera: from the far side of the crane (−u), turned outward 35°
    const aOut = Math.atan2(nz, nx), aBack = Math.atan2(-uz, -ux), dA = Math.atan2(Math.sin(aOut - aBack), Math.cos(aOut - aBack));
    const az0 = (aBack + Math.sign(dA || 1) * 35 * DEG) / DEG;
    let az = az0, el = EL;
    const tries = [[0, 0], [10, 0], [-10, 0], [0, 6], [20, 0], [-20, 0], [10, 6], [-10, 6], [30, 3], [-30, 3], [0, 12], [45, 6], [-45, 6], [180, 0], [160, 6], [-160, 6], [0, 20]];
    for (const [da, de] of tries) {
      const a = az0 + da * Math.sign(dA || 1), e = EL + de; scPos(tx, ty, tz, D, a, e, scP);
      if (!frameBlockedApi(scP[0], scP[1], scP[2], tx, ty, tz, id)) { az = a; el = e; break; }
    }
    scPos(tx, ty, tz, D, az, el, scP);
    return { x: tx, y: ty, z: tz, dist: portrait ? D / 1.35 : D, az, el, p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], course: s.course };
  }
  // ── /director13 ──
  /** ── site12 ── (N61) in a site's dig: (x, z, r) → true when a prop of radius r there would stand on his dig spot or between it
   *  and the slot he digs toward (the ring and the pointer); outside the dig: never */
  function digClear(st) {
    if (st.phase !== 'dig') return () => false;
    const w = workSpot(st.id, 'set'), s = w ? nextSlot(st.id) : null;
    if (!w || !s) return () => false;
    const ax = w.x, az = w.z, bx = s.face[0], bz = s.face[2], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    return (x, z, r) => { const t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1); return Math.hypot(x - ax - dx * t, z - az - dz * t) < r + 1.4; };
  }
  /** ── site11 ── the game table (GTAB): all in the props' own instances, no draw call of its own */
  function gameTable(put) {
    const { x: X, z: Z, yaw } = GTAB, c = Math.cos(yaw), sn = Math.sin(yaw), y0 = groundAt(X, Z);
    const at = (u, v) => [X + u * c + v * sn, Z - u * sn + v * c];   // (u across the table, v along it)
    const P = (u, y, v, sx, sy, sz, hex) => { const [x, z] = at(u, v); put(x, y0 + y, z, sx, sy, sz, yaw, hex); };
    // the table: a top, four legs, a gold-trimmed board with 4 × 4 squares, the pieces of a game in play
    P(0, 1.45, 0, 2.4, 0.14, 3.4, '#8A6A45');
    for (const [u, v] of [[-1.05, -1.5], [1.05, -1.5], [-1.05, 1.5], [1.05, 1.5]]) P(u, 0.72, v, 0.16, 1.44, 0.16, '#6E5236');
    P(0, 1.55, 0, 1.9, 0.06, 1.9, '#C9A24A');
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) P(-0.66 + i * 0.44, 1.59, -0.66 + j * 0.44, 0.42, 0.04, 0.42, (i + j) % 2 ? '#3E2E22' : '#EFE6D2');
    for (const [i, j, w] of [[0, 0, 1], [1, 1, 1], [3, 0, 1], [2, 3, 0], [0, 3, 0], [3, 2, 0]]) P(-0.66 + i * 0.44, 1.72, -0.66 + j * 0.44, 0.24, 0.22, 0.24, w ? '#F7F2E6' : '#9E2F24');
    // two benches, one each side
    for (const u of [-2.1, 2.1]) { P(u, 0.85, 0, 0.8, 0.16, 3.0, '#7A5C3C'); for (const v of [-1.2, 1.2]) P(u, 0.4, v, 0.6, 0.8, 0.16, '#6E5236'); }
    // the awning on four poles (seen from far: red and cream stripes), and a small pennant on the pole by the road
    for (const [u, v] of [[-2.9, -2.5], [2.9, -2.5], [-2.9, 2.5], [2.9, 2.5]]) P(u, 2.7, v, 0.16, 5.4, 0.16, '#6E5236');
    for (let k = 0; k < 6; k++) P(0, 5.45 - Math.abs(k - 2.5) * 0.06, -2.5 + 0.42 + k * 0.84, 6.2, 0.08, 0.84, k % 2 ? '#EDE3C8' : '#B8352A');
    P(2.9, 5.9, -2.5, 0.12, 1.2, 0.12, '#6E5236'); { const [x, z] = at(2.9, -2.05); put(x, y0 + 6.2, z, 0.05, 0.55, 0.9, yaw, '#D8A83A'); }
  }
  function rebuildProps() {
    propsDirty = false;
    let n = 0, nf = 0, nd = 0, na = 0, nr = 0;
    const tmpC = tmpC0;
    const put = (x, y, z, sx, sy, sz, yaw, hex, rot = 0) => {
      if (n >= 4000) return;
      tmpQ.setFromEuler(tmpE.set(rot, yaw, 0)); tmpV.set(x, y, z); tmpS.set(sx, sy, sz);
      tmpM.compose(tmpV, tmpQ, tmpS); props.setMatrixAt(n, tmpM); props.setColorAt(n, tmpC.set(hex)); n++;
    };
    // an ashlar / a rough block (centre, size, yaw, tone)
    const putA = (x, y, z, sx, sy, sz, yaw, hex, k = 1) => {
      if (na >= 900) return;
      tmpQ.setFromEuler(tmpE.set(0, yaw, 0)); tmpV.set(x, y, z); tmpS.set(sx, sy, sz);
      tmpM.compose(tmpV, tmpQ, tmpS); ashI.setMatrixAt(na, tmpM); ashI.setColorAt(na, tmpC.set(hex).multiplyScalar(k)); na++;
    };
    const putR = (x, y, z, sx, sy, sz, yaw, hex, k = 1, rot = 0) => {
      if (nr >= 300) return;
      tmpQ.setFromEuler(tmpE.set(rot, yaw, rot * 0.6)); tmpV.set(x, y, z); tmpS.set(sx, sy, sz);
      tmpM.compose(tmpV, tmpQ, tmpS); roughI.setMatrixAt(nr, tmpM); roughI.setColorAt(nr, tmpC.set(hex).multiplyScalar(k)); nr++;
    };
    const putF = (x, y, z, sx, sy, sz, yaw, hex) => {   // a heap / a jar / a coil (the rough icosahedron, flattened)
      if (nf >= 1200) return;
      tmpV.set(x, y, z); tmpQ.setFromEuler(tmpE.set(0, yaw, 0)); tmpS.set(sx, sy, sz);
      tmpM.compose(tmpV, tmpQ, tmpS); field.setMatrixAt(nf, tmpM); field.setColorAt(nf, tmpC.set(hex)); nf++;
    };
    for (const st of list) {
      if (st.status !== 'building') continue;
      const found = st.disp < FOUND + 0.04, def = st.def;
      const gy = (x, z) => (st.id === 'har' ? groundAt(x, z) : st.base);
      if (found && st.id === 'har') mountProps(put, putF, putR, putA);   // ── site8 ── the working patch round the builder
      if (!found && st.id === 'har') harCourseProps(put, putF, putR);    // ── site12 ── the courses seen from far: heaps, rubble, carts
      // ── site11 ── (STAGING R4 · W1 / G1 / A2: "tap 1: the builder drives the corner stake … the cord runs on") every other site's
      // survey is laid out as he strikes: the stakes, cords and rags go round the footprint from the corner nearest his survey
      // stake, a quarter before his first stroke and a quarter more at each (surveyShown), all of it from the dig on
      const svF = found && st.id !== 'har' && st.phase === 'survey' ? surveyShown(st) : 1;
      let svE = 0;
      const svN = svF < 1 ? Math.ceil(def.foot.length * 4 * svF) : 1e9;
      if (found) for (const [x0, z0, x1, z1] of svF < 1 ? surveyOrder(st) : def.foot) {
        // stakes every ~6 amot, a rope along each edge, a red rag on each corner
        let edges = [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]];
        if (svF < 1) { const sp = workSpot(st.id, 'survey'); if (sp) { let bi = 0, bd = 1e9; edges.forEach((e, i) => { const d = Math.hypot(e[0] - sp.x, e[1] - sp.z); if (d < bd) { bd = d; bi = i; } }); edges = edges.slice(bi).concat(edges.slice(0, bi)); } }
        for (const [ax, az, bx, bz] of edges) {
          if (svE++ >= svN) break;
          const L = Math.hypot(bx - ax, bz - az), k = Math.max(1, Math.round(L / 6)), yaw = Math.atan2(bx - ax, bz - az);
          for (let i = 0; i < k; i++) { const x = ax + (bx - ax) * i / k, z = az + (bz - az) * i / k; put(x, gy(x, z) + 0.8, z, 0.2, 1.8, 0.2, 0, '#6B4E31'); }
          if (st.id !== 'har') put((ax + bx) / 2, st.base + 1.3, (az + bz) / 2, 0.07, 0.07, L, yaw, '#E9DEC4');
          else for (let i = 0; i < k; i++) { const xa = ax + (bx - ax) * i / k, za = az + (bz - az) * i / k, xb = ax + (bx - ax) * (i + 1) / k, zb = az + (bz - az) * (i + 1) / k; const ya = gy(xa, za) + 1.3, yb = gy(xb, zb) + 1.3; put((xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2, 0.07, 0.07, Math.hypot(xb - xa, zb - za, yb - ya), yaw, '#E9DEC4', -Math.atan2(yb - ya, Math.hypot(xb - xa, zb - za))); }
          put(ax, gy(ax, az) + 2.05, az, 0.05, 0.7, 1.0, yaw + 0.6, '#B8352A');
        }
        if (st.id !== 'har' && st.phase !== 'survey') {
          // foundation trenches along the edges, with spoil heaps beside them
          const tw = Math.min(3.5, (x1 - x0) * 0.2, (z1 - z0) * 0.2);
          // ── site12 ── (N61, PRODUCER-S11 #1: "at the Ulam's dig he stands half inside a rock; the ring on it") no bank or spoil heap
          // where he digs, nor between him and the slot: at a site of two rects (the Ulam) the other rect's heaps lay on his spot
          const dg = digClear(st);
          for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, 1], [x1, z0, x1, z1, -1, 0], [x1, z1, x0, z1, 0, -1], [x0, z1, x0, z0, 1, 0]]) {
            const L = Math.hypot(bx - ax, bz - az), yaw = Math.atan2(bx - ax, bz - az);
            // (wave 6) cut down to the rock: a pale bedrock floor between the shadowed walls (thin, just above the dirt decal),
            // earth banked on both lips, so the cut reads sunk
            const mx = (ax + bx) / 2, mz = (az + bz) / 2;
            put(mx + nx * tw / 2, st.base + 0.085, mz + nz * tw / 2, tw * 0.62, 0.03, L, yaw, '#D4C8AA');
            put(mx + nx * tw * 0.1, st.base + 0.09, mz + nz * tw * 0.1, tw * 0.2, 0.03, L, yaw, '#3B2E22');
            put(mx + nx * tw * 0.9, st.base + 0.09, mz + nz * tw * 0.9, tw * 0.2, 0.03, L, yaw, '#4A3A2A');
            const kb = Math.max(1, Math.ceil(L / 12));
            // ── site11 ── (by touch, 29.9: at the wall's first course the banks stood as tall beige tents in his working frame) once
            // the courses start the trench is being filled round the first stones: its banks lie low, the tall heaps are gone
            // (and in the dig they lie lower too: by touch at the altar's dig a bank stood before him like a tent, PRODUCER11 s3-13)
            const lay = st.phase === 'courses' ? 0.3 : 0.6;
            for (let i = 0; i < kb; i++) {   // lumpy earth: short heaps, jittered, in a few tones (not a straight plank)
              const t = (i + 0.5) / kb, j = (Math.abs(i * 37 + (ax | 0)) % 7) / 7, x = lerp(ax, bx, t) - nx * (1.6 + j * 0.5), z = lerp(az, bz, t) - nz * (1.6 + j * 0.5);
              const ln = (L / kb) * (0.9 + j * 0.3) / 1.4, tone = ['#B8A07A', '#AD9570', '#C2AB86'][i % 3];
              if (!dg(x, z, 1.4 + ln / 2)) putF(x, st.base + 0.2 * lay, z, 2.6 + j * 0.8, (1.4 + j * 0.7) * lay, ln, yaw + (j - 0.5) * 0.3, tone);
              if (!dg(x + nx * (tw + 3.4 + j), z + nz * (tw + 3.4 + j), 1.2 + ln / 2)) putF(x + nx * (tw + 3.4 + j), st.base + 0.16 * lay, z + nz * (tw + 3.4 + j), 2.2 + j * 0.6, (1.1 + j * 0.5) * lay, ln * 0.9, yaw - (j - 0.5) * 0.3, tone);
              if (i % 4 === 1 && lay > 0.5 && !dg(x - nx * 1.6, z - nz * 1.6, 0.6)) putF(x - nx * 1.6, st.base + 0.3, z - nz * 1.6, 0.62, 0.45, 0.62, i, '#8A6A3E');   // a basket of earth
            }
            const heaps = lay > 0.5 ? Math.min(6, Math.floor(L / 14)) : 0;
            for (let i = 0; i < heaps && nf < 1200; i++) {
              const t = (i + 0.5) / heaps, hx = lerp(ax, bx, t) - nx * 2.6, hz = lerp(az, bz, t) - nz * 2.6, s = 1.3 + ((i * 37) % 5) * 0.25;
              if (dg(hx, hz, s * 2.2)) continue;
              tmpV.set(hx, st.base + 0.2, hz); tmpQ.setFromEuler(tmpE.set(0, i * 1.3, 0)); tmpS.set(s * 2.2, s * 0.7, s * 1.6);
              tmpM.compose(tmpV, tmpQ, tmpS); field.setMatrixAt(nf, tmpM); field.setColorAt(nf, tmpC.set('#9C7D5A')); nf++;
            }
          }
        }
        if (st.id !== 'har' && nd < 64) {
          const w = x1 - x0 + 5, d = z1 - z0 + 5;
          tmpV.set((x0 + x1) / 2, st.base + 0.06, (z0 + z1) / 2); tmpS.set(w, 1, d); tmpM.compose(tmpV, tmpQ.identity(), tmpS);
          dirt.setMatrixAt(nd, tmpM); dirtGeo.attributes.aSize.setXY(nd, w, d); nd++;
        }
      }
      // stone piles next to the crane's pick point and along the work side (+ quarried blocks around the Mount's crest)
      const piles = (st.piles || []).concat(!found && def.quarry ? def.quarry.map(([x, z], i) => [x, z, i * 0.7]) : []);
      for (const [px, pz, yaw] of piles) {
        const y = gy(px, pz), hex = STONE[def.stone] || STONE.ash;
        if (def.stone === 'field') {
          for (let i = 0; i < 9 && nf < 1200; i++) {
            const a = i * 2.4, rr = i < 6 ? 1.3 : 0.5;
            tmpV.set(px + Math.cos(a) * rr, y + (i < 6 ? 0.45 : 1.2), pz + Math.sin(a) * rr); tmpQ.setFromEuler(tmpE.set(a, a * 1.7, 0)); const s = 0.9 + (i % 3) * 0.2; tmpS.set(s, s * 0.8, s);
            tmpM.compose(tmpV, tmpQ, tmpS); field.setMatrixAt(nf, tmpM); field.setColorAt(nf, tmpC.set(hex).multiplyScalar(0.85 + (i % 4) * 0.06)); nf++;
          }
        } else if (st.stock !== undefined && px === (st.piles && st.piles[0] && st.piles[0][0])) {
          // the site's stock: the stones waiting for the crane, stacked 3 × 2 a layer (≤ 24 drawn)
          const c = Math.cos(yaw), s = Math.sin(yaw), ns = Math.min(24, st.stock);
          for (let k = 0; k < ns; k++) {
            const l = Math.floor(k / 6), i = k % 3, j = Math.floor(k / 3) % 2, ox = (i - 1) * 2.25 + (l % 2) * 0.3, oz = (j - 0.5) * 1.4;
            putA(px + ox * c + oz * s, y + 0.5 + l * 1.0, pz - ox * s + oz * c, 2.1, 0.95, 1.25, yaw + ((k * 7) % 5 - 2) * 0.012, hex, 0.9 + ((k * 5) % 3) * 0.05);
          }
        } else {
          for (let l = 0; l < 3; l++) for (let i = 0; i < 3 - l; i++) for (let j = 0; j < 2; j++) {
            const ox = (i - (2 - l) / 2) * 2.2, oz = (j - 0.5) * 1.3;
            const c = Math.cos(yaw), s = Math.sin(yaw);
            putA(px + ox * c + oz * s, y + 0.5 + l * 1.0, pz - ox * s + oz * c, 2.05, 0.95, 1.2, yaw, hex, 0.88 + ((i + j + l) % 3) * 0.06);
          }
        }
      }
    }
    // the quarry outcrop: fresh-cut benches, a lever, and the cut stone waiting for the carts (piles grow with the stock)
    if (quarryOn) {
      for (const b of QBENCH) put(...b);
      const nq = Math.min(QPILES.length * 6, qStock);
      for (let k = 0; k < nq; k++) {
        const [px, pz, yaw] = QPILES[Math.floor(k / 6)], j = k % 6, l = j < 3 ? 0 : j < 5 ? 1 : 2, i = j < 3 ? j : j < 5 ? j - 3 : 0;
        const ox = (i - (2 - l) / 2) * 2.2, c = Math.cos(yaw), s = Math.sin(yaw);
        putA(px + ox * c, 0.5 + l, pz - ox * s, 2.05, 0.95, 1.25, yaw, STONE.ash, 0.88 + (k % 3) * 0.06);
      }
      quarryStones(put, putR, putA, putF);
      gameTable(put);   // ── site11 ──
    }
    paveProps(put);   // ── site11 ── the Mount's paving (N40)
    finishProps(put, putF, putR);   // ── site11 ── every other site's finish at his spot (N52)
    // after dark: braziers at the working sites, oil lamps along the builder's paths
    nightProps(put);
    siteDressing(put, putA, putR, putF);
    jobProps(put, putA);   // ── site14 ── the planks, the chalk line, her lamps
    treadProps(put);       // ── site15 ── the stones the operator seated, until the count reveals them
    props.count = n; field.count = nf; dirt.count = nd;
    ashI.count = na; roughI.count = nr; ashI.visible = na > 0; roughI.visible = nr > 0;
    ashI.instanceMatrix.needsUpdate = true; if (ashI.instanceColor) ashI.instanceColor.needsUpdate = true;
    roughI.instanceMatrix.needsUpdate = true; if (roughI.instanceColor) roughI.instanceColor.needsUpdate = true;
    props.instanceMatrix.needsUpdate = true; if (props.instanceColor) props.instanceColor.needsUpdate = true;
    field.instanceMatrix.needsUpdate = true; if (field.instanceColor) field.instanceColor.needsUpdate = true;
    dirt.instanceMatrix.needsUpdate = true; dirtGeo.attributes.aSize.needsUpdate = true;
    requestShadow(true);
  }

  /* the dressing yard's bankers (≤ 4): 2 dressed · 1 drafted · 0 rough, from setWork({dressing}) (default one of each) */
  function yardSeq(st) {
    const D = st.dressing, dz = D === undefined ? { rough: 1, drafted: 1, dressed: 1 } : typeof D === 'number'
      ? { dressed: Math.ceil(D / 3), drafted: Math.ceil((D - Math.ceil(D / 3)) / 2), rough: Math.max(0, D - Math.ceil(D / 3) - Math.ceil((D - Math.ceil(D / 3)) / 2)) } : D;
    return [...Array(Math.min(3, dz.dressed | 0)).fill(2), ...Array(Math.min(3, dz.drafted | 0)).fill(1), ...Array(Math.min(3, dz.rough | 0)).fill(0)].slice(0, 4);
  }
  // for PEOPLE's masons: each banker's stone box (as drawn) and the mason's feet on the side away from the pile
  function yardBankers(st) {
    const [px, pz, yaw] = pileOf(st), fx = Math.sin(yaw), fz = Math.cos(yaw), rx = fz, rz = -fx, yw = yaw + Math.PI / 2;
    const gy = (x, z) => (st.id === 'har' ? groundAt(x, z) : st.base), fld = st.def.stone === 'field';
    return yardSeq(st).map((k, i) => {
      const bx = px + rx * (11.5 + i * 3.8) + fx * 0.5, bz = pz + rz * (11.5 + i * 3.8) + fz * 0.5, y = gy(bx, bz), rough = fld || k === 0;
      const x = bx + rx * 1.5, z = bz + rz * 1.5;
      return { x, y: gy(x, z), z, face: [bx, bz], state: fld ? 'field' : ['rough', 'drafted', 'dressed'][k],
        stone: { x: bx, y: y + (rough && !fld ? 1.66 : 1.62), z: bz, w: fld ? 1.4 : 2.1, h: fld ? 0.9 : rough ? 1.05 : 0.95, d: fld ? 1.1 : rough ? 1.3 : 1.25, yaw: yw } };
    });
  }
  /* ── the site's ground (wave 6): survey chalk lines, the dressing yard, timber, rope coils, water jars, tool racks, chips;
     the great stones set at har; all through the props / ashlar / rough / heap instances (no extra draw calls) ── */
  // ── site11 ── (rule 8 at every site) the dressing round the stock (the timber stack, the coils, the jars, the tool rack, the yard)
  // lies on the stock's far side from the course: a crane on the laid course faces out, and "behind" its stock was his banker's
  // place at the slot's foot (by touch at the gates the timber stack stood where he dresses)
  function dressFlip(st, px, pz, yaw) {
    if (st.id === 'har') return 1;
    const s = st.status === 'building' && st.disp >= FOUND ? nextSlot(st.id) : null;
    return s && (px - s.face[0]) * Math.sin(yaw) + (pz - s.face[2]) * Math.cos(yaw) > 0 ? -1 : 1;
  }
  function siteDressing(put, putA, putR, putF) {
    for (const st of list) {
      if (st.status === 'done' && st.great) { for (const g of st.great) putA(g.x, g.y, g.z, g.w, g.h, g.d, g.yaw, STONE.ash, 1.04); continue; }   // (they stay in the wall)
      if (st.status !== 'building') continue;
      const def = st.def, L = st.lay, ph = st.phase || (st.disp < FOUND ? 'foundation' : 'courses');
      const gy = (x, z) => (st.id === 'har' ? groundAt(x, z) : st.base);
      if (ph === 'survey') {   // chalk lines of the plan (the outer faces and, for walls, the inner face), the reed, a plumb line
        for (const [x0, z0, x1, z1] of def.foot) {
          const ins = Math.min(6, (x1 - x0) / 4, (z1 - z0) / 4);
          for (const o of (ins > 1.5 ? [0, ins] : [0])) {
            const a0 = x0 + o, b0 = z0 + o, a1 = x1 - o, b1 = z1 - o;
            for (const [ax, az, bx, bz] of [[a0, b0, a1, b0], [a1, b0, a1, b1], [a1, b1, a0, b1], [a0, b1, a0, b0]]) {
              const l = Math.hypot(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2;
              put(cx, gy(cx, cz) + 0.03, cz, 0.12, 0.05, l, Math.atan2(bx - ax, bz - az), '#F4F0E6');
            }
          }
        }
        const f = def.spot.face, x = f[0] + 2.5, z = f[1] + 2.5, y = gy(x, z);
        put(x, y + 0.06, z, 0.09, 0.09, 6, 0.4, '#8A6A3E');                 // the measuring reed, six amot (Ezekiel 40:5; its use here is illus.)
        put(x - 1.2, y + 1.6, z + 1.0, 0.1, 3.2, 0.1, 0, '#6B4E31'); put(x - 1.2, y + 3.2, z + 1.4, 0.08, 0.08, 1.0, 0, '#6B4E31');
        put(x - 1.2, y + 2.2, z + 1.85, 0.015, 1.9, 0.015, 0, '#E9DEC4'); putF(x - 1.2, y + 1.15, z + 1.85, 0.16, 0.26, 0.16, 0, '#6F6A63');   // plumb bob
        continue;
      }
      if (!L || L.kind === 'cast') continue;
      const [px, pz, yaw] = pileOf(st), fl = dressFlip(st, px, pz, yaw), fx = Math.sin(yaw), fz = Math.cos(yaw), rx = fz, rz = -fx;
      const at = (a, b) => [px + rx * a + fx * b, pz + rz * a + fz * b];
      const atB = (a, b) => at(a, b * fl);   // ── site11 ── (the props behind the stock: on its far side from the course)
      const busy = ph === 'courses' || ph === 'foundation', done = L.N ? Math.max(0, L.n) / L.N : 0;
      // the dressing yard beyond the hero's banker (PEOPLE's, at 7 amot): bankers with stones rough → drafted → dressed
      if (busy) {
        const seq = yardSeq(st);
        const hex = STONE[def.stone] || STONE.ash;
        seq.forEach((k, i) => {
          const [bx, bz] = at(11.5 + i * 3.8, 0.5), y = gy(bx, bz), yw = yaw + Math.PI / 2;
          put(bx, y + 1.0, bz, 2.7, 0.28, 1.35, yw, '#8B6A45'); put(bx - rx * 1.05, y + 0.45, bz - rz * 1.05, 0.28, 0.9, 1.1, yw, '#6B4E31'); put(bx + rx * 1.05, y + 0.45, bz + rz * 1.05, 0.28, 0.9, 1.1, yw, '#6B4E31');
          if (def.stone === 'field') putR(bx, y + 1.62, bz, 1.4, 0.9, 1.1, yw, hex, 0.92, 0.2);
          else if (k === 0) putR(bx, y + 1.66, bz, 2.1, 1.05, 1.3, yw, hex, 0.8);
          else putA(bx, y + 1.62, bz, 2.1, 0.95, 1.25, yw, hex, k === 1 ? 0.84 : 1.0);
          // chips at the banker's foot, growing as the building rises (── site11 ── none at the altar: its whole stones are never
          // dressed, Middot 3:4 — straw under them instead)
          const [cx, cz] = at(11.5 + i * 3.8, 2.1), cs = 0.7 + Math.min(1.6, done * 2.2) + i * 0.1;
          if (def.stone === 'field') putF(cx, y + 0.05, cz, 1.6, 0.12, 1.2, i * 1.7, '#D8C27A');
          else putF(cx, y + 0.08, cz, cs * 1.5, 0.22 + done * 0.25, cs, i * 1.7, '#E3D8C0');
        });
      }
      if (ph === 'finish' && st.id !== 'kiyor') {   // plasterers' boards / the gilders' tables / the altar's whitewash buckets
        const gold = GOLDFIN.has(st.id);
        for (let i = 0; i < 3; i++) {
          const [bx, bz] = at(11.5 + i * 4.2, 0.5), y = gy(bx, bz), yw = yaw + Math.PI / 2;
          put(bx, y + 0.95, bz, 3.0, 0.14, 1.4, yw, gold ? '#8B6A45' : '#B9AE9A');
          put(bx - rx * 1.2, y + 0.45, bz - rz * 1.2, 0.2, 0.9, 1.2, yw, '#6B4E31'); put(bx + rx * 1.2, y + 0.45, bz + rz * 1.2, 0.2, 0.9, 1.2, yw, '#6B4E31');
          if (gold) for (let q = 0; q < 3; q++) put(bx + rx * (q - 1) * 0.8, y + 1.06, bz + rz * (q - 1) * 0.8, 0.6, 0.03, 0.9, yw, '#E9B949');
          else putF(bx, y + 1.3, bz, 0.45, 0.55, 0.45, 0, '#EDEAE2');   // a bucket of lime
        }
      }
      if (!busy && ph !== 'finish') continue;
      // behind the pile: a timber stack, two rope coils, water jars, a tool rack; dust underfoot
      { const [tx, tz] = atB(-5, -4.5), y = gy(tx, tz);
        for (let l = 0; l < 3; l++) for (let i = 0; i < 4 - l; i++) put(tx + rx * (i - (3 - l) / 2) * 0.46, y + 0.2 + l * 0.38, tz + rz * (i - (3 - l) / 2) * 0.46, 0.36, 0.36, 6.5, yaw, l % 2 ? '#9A7650' : '#A7825A'); }
      for (let i = 0; i < 2; i++) { const [cx, cz] = atB(-1.2 + i * 1.5, -6.2), y = gy(cx, cz); putF(cx, y + 0.14, cz, 0.95, 0.22, 0.95, i, '#B79E74'); }
      for (let i = 0; i < 3; i++) { const [jx, jz] = atB(1.8 + i * 0.95, -6.4 + (i % 2) * 0.5), y = gy(jx, jz); putF(jx, y + 0.62, jz, 0.42, 0.7, 0.42, i, '#A8674A'); }
      { const [kx, kz] = atB(5.2, -6.6), y = gy(kx, kz), yw = yaw + Math.PI / 2;
        put(kx, y + 1.0, kz, 0.14, 2.0, 0.14, yw, '#6B4E31'); put(kx + rx * 2.2, y + 1.0, kz + rz * 2.2, 0.14, 2.0, 0.14, yw, '#6B4E31');
        put(kx + rx * 1.1, y + 1.8, kz + rz * 1.1, 0.12, 0.12, 2.4, yaw + Math.PI / 2, '#6B4E31');
        for (let q = 0; q < 5; q++) put(kx + rx * (0.3 + q * 0.4), y + 1.25, kz + rz * (0.3 + q * 0.4) + 0.12, 0.06, 1.1, 0.06, 0, q % 2 ? '#8A7A66' : '#7A5A3A'); }
      // the great stones set at the Mount (their own instances, proud of the face by a finger)
      if (st.great) for (const g of st.great) putA(g.x, g.y, g.z, g.w, g.h, g.d, g.yaw, STONE.ash, 1.04);
      // ── flow10 ── the Mount's stones the player set ahead of the count (liftLand), where the crane set them
      if (L.pend) for (const g of L.pend) if (g.g >= L.n) putA(g.x, g.y, g.z, g.w, g.h, g.d, g.yaw, STONE[def.stone] || STONE.ash, 1.0);
    }
  }
  // the quarry: rough blocks being cut from the benches and levered free (the cut stone waits in QPILES as ashlars)
  function quarryStones(put, putR, putA, putF) {
    // each bench (QBENCH 0–2) shows its exposed strip: blocks scored round by channels, half cut, wedged free
    for (let k = 0; k < 3; k++) {
      const [cx, cy, cz, sx, sy, sz, yaw] = QBENCH[k], top = cy + sy / 2, ux = Math.sin(yaw), uz = Math.cos(yaw), vx = uz, vz = -ux;
      const v0 = -sx / 2 + 0.75, P = (u, v) => [cx + ux * u + vx * v, cz + uz * u + vz * v];
      for (let j = 0; j < 3; j++) {
        const u = (j - 1) * 2.7 - 0.6 + k * 0.4, w = 2.3, d = 1.3, h = 1.1, stage = (j + k) % 3, [bx, bz] = P(u, v0);
        // the channels round the block (dark, a hand wide)
        for (const [du, dv, lu, lv] of [[0, -d / 2 - 0.08, w + 0.3, 0.16], [0, d / 2 + 0.08, w + 0.3, 0.16], [-w / 2 - 0.08, 0, 0.16, d], [w / 2 + 0.08, 0, 0.16, d]]) {
          const [x, z] = P(u + du, v0 + dv); put(x, top + 0.015, z, lv, 0.03, lu, yaw, '#5E5446');
        }
        if (stage === 0) continue;   // only scored so far
        const lift = stage === 2 ? 0.14 : -0.62;   // half cut (sunk in the rock) · wedged free (raised on its wedges)
        putR(bx, top + h / 2 + lift, bz, d * 0.97, h, w * 0.97, yaw, '#E6DBC2', 0.9 + k * 0.04);
        if (stage === 2) for (const du of [-0.7, 0.1, 0.9]) { const [x, z] = P(u + du, v0 - d / 2 - 0.05); put(x, top + 0.1, z, 0.22, 0.16, 0.12, yaw, '#6B5A44'); }
      }
    }
    // freed blocks on the floor in front of the lowest bench, and the spalls
    const [cx, , cz, sx, , , yaw] = QBENCH[0], ux = Math.sin(yaw), uz = Math.cos(yaw), vx = uz, vz = -ux;
    for (const [u, v, r, k] of [[-3.4, -4.4, 0.25, 0.92], [0.6, -5.2, -0.3, 0.86], [3.8, -4.6, 0.6, 0.95]]) putR(cx + ux * u + vx * v, 0.55, cz + uz * u + vz * v, 1.3, 1.1, 2.3, yaw + r, '#E6DBC2', k);
    putF(196.8, 0.1, -213.2, 4.2, 0.4, 3.0, 0.4, '#E8DFC9'); putF(190.5, 0.08, -201.8, 3.2, 0.3, 2.4, 1.2, '#E3D8C0');   // spalls
    void sx; void putA;
  }


  /* ── scaffolding: two instanced meshes per building stage, instances sorted by lift ── */
  const woodMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.86 });
  const poleGeo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true).translate(0, 0.5, 0);
  const boardGeo = new THREE.BoxGeometry(1, 1, 1);
  function makeScaffold(st) {
    const S = st.def.scaff; if (!S) return null;
    const lift = S.lift, rows = S.rows || 2, gap = S.gap || 5, off = rows === 2 ? [1.0, 3.3] : [1.2];
    const poles = [], boards = [];     // [key(top height), matrix array(16)]
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
    const pole = (a, b, r, key) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
      q.setFromUnitVectors(UP, tmpV.set(dx / L, dy / L, dz / L)); p.set(a[0], a[1], a[2]); s.set(r, L, r);
      M.compose(p, q, s); poles.push([key, M.toArray()]);
    };
    const board = (cx, cy, cz, len, w, yaw, key) => { q.setFromAxisAngle(UP, yaw); p.set(cx, cy, cz); s.set(w, 0.22, len); M.compose(p, q, s); boards.push([key, M.toArray()]); };
    for (const [a, b, n, y0, y1] of S.runs) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), tx = (b[0] - a[0]) / L, tz = (b[1] - a[1]) / L;
      const nb = Math.max(1, Math.round(L / gap)), nl = Math.max(1, Math.ceil((y1 - y0) / lift)), yaw = Math.atan2(tx, tz);
      const X = (t, o) => a[0] + tx * t + n[0] * o, Z = (t, o) => a[1] + tz * t + n[1] * o;
      for (let k = 0; k < nl; k++) {
        const ya = y0 + k * lift, yb = Math.min(y1 + 1.5, ya + lift), key = yb;
        for (let i = 0; i <= nb; i++) {
          const t = L * i / nb;
          for (const o of off) pole([X(t, o), ya, Z(t, o)], [X(t, o), yb, Z(t, o)], 0.17, key);
          if (rows === 2) pole([X(t, off[0] - 0.8), yb - 0.25, Z(t, off[0] - 0.8)], [X(t, off[1] + 0.3), yb - 0.25, Z(t, off[1] + 0.3)], 0.12, key);
          else pole([X(t, 0.1), yb - 0.25, Z(t, 0.1)], [X(t, off[0] + 0.4), yb - 0.25, Z(t, off[0] + 0.4)], 0.12, key);
          if (i < nb && (i + k) % 3 === 0) { const o = off[off.length - 1], t2 = L * (i + 1) / nb; pole([X(t, o), ya, Z(t, o)], [X(t2, o), yb, Z(t2, o)], 0.11, key); }
        }
        for (const o of off) pole([X(-0.6, o), yb - 0.1, Z(-0.6, o)], [X(L + 0.6, o), yb - 0.1, Z(L + 0.6, o)], 0.12, key);
        const bo = rows === 2 ? (off[0] + off[1]) / 2 : off[0] - 0.35, bw = rows === 2 ? 2.2 : 1.4;
        board(X(L / 2, bo), yb + 0.05, Z(L / 2, bo), L + 0.8, bw, yaw, key);
        if (rows === 2 && k % 2 === 1) board(X(L / 2, off[1] + 0.05), yb + 0.75, Z(L / 2, off[1] + 0.05), L, 0.14, yaw, key);   // toe rail
      }
    }
    poles.sort((u, v) => u[0] - v[0]); boards.sort((u, v) => u[0] - v[0]);
    const mk = (geo, arr) => {
      const m = new THREE.InstancedMesh(geo, woodMat, Math.max(1, arr.length)), keys = new Float32Array(arr.length);
      arr.forEach(([k, a], i) => { keys[i] = k; m.instanceMatrix.array.set(a, i * 16); m.setColorAt(i, c.setHSL(0.08, 0.3, 0.33 + ((i * 7919) % 13) / 13 * 0.12)); });
      m.count = 0; m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m);
      return { m, keys, n: arr.length };
    };
    return { P: mk(poleGeo, poles), Bd: mk(boardGeo, boards), lift, shown: -1, remove: -1 };
  }
  const countBelow = (keys, h) => { let lo = 0, hi = keys.length; while (lo < hi) { const m = (lo + hi) >> 1; if (keys[m] <= h) lo = m + 1; else hi = m; } return lo; };
  function setScaffoldHeight(sc, h) {
    const a = countBelow(sc.P.keys, h), b = countBelow(sc.Bd.keys, h);
    if (a !== sc.P.m.count || b !== sc.Bd.m.count) { sc.P.m.count = a; sc.Bd.m.count = b; return true; }
    return false;
  }
  function disposeScaffold(sc) { for (const k of [sc.P, sc.Bd]) { scene.remove(k.m); k.m.dispose(); } }
  const removing = [];   // scaffolds being struck after completion

  /* ── the treadwheel crane (one, at the most recently started site) ── */
  const crane = (() => {
    const wood = new THREE.MeshStandardMaterial({ map: T.wood.map, color: new THREE.Color(0.98, 0.93, 0.88), roughness: 0.86 });
    wood.onBeforeCompile = (sh) => { { const x = xrayCode(sh.vertexShader, sh.fragmentShader, sh); sh.vertexShader = x.vs; sh.fragmentShader = x.fs; }   /* ── twin18 ── (the crane is seen through too) ── /twin18 ── */ sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n{ float l = dot(diffuseColor.rgb, vec3(0.3, 0.55, 0.15)); diffuseColor.rgb = mix(vec3(l), diffuseColor.rgb, 0.45) * 1.25; }'); };
    wood.customProgramCacheKey = () => 'cranewood';
    const dark = '#6E5236';
    const baseG = mergeGeometries([
      boxAt(0.7, 0.6, 12, 3.1, 0.3, 0), boxAt(0.7, 0.6, 12, -3.1, 0.3, 0),
      boxAt(6.9, 0.5, 0.6, 0, 0.55, -5), boxAt(6.9, 0.5, 0.6, 0, 0.55, 5), boxAt(6.9, 0.5, 0.6, 0, 0.55, -1.5),
      rod([2.3, 0.6, -2.6], [2.3, 4.6, -1.6], 0.2), rod([2.3, 0.6, -0.6], [2.3, 4.6, -1.6], 0.2),
      rod([-2.3, 0.6, -2.6], [-2.3, 4.6, -1.6], 0.2), rod([-2.3, 0.6, -0.6], [-2.3, 4.6, -1.6], 0.2),
      rod([2.6, 4.6, -1.6], [-2.6, 4.6, -1.6], 0.17),
    ].map(strip));
    const wheelParts = [];
    const WR = 3.6, WW = 2.0;
    for (const sx of [-WW / 2, WW / 2]) {
      for (let k = 0; k < 16; k++) { const a0 = k / 16 * 6.2832, a1 = (k + 1) / 16 * 6.2832; wheelParts.push(rod([sx, Math.cos(a0) * WR, Math.sin(a0) * WR], [sx, Math.cos(a1) * WR, Math.sin(a1) * WR], 0.16)); }
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI; wheelParts.push(rod([sx, Math.cos(a) * WR, Math.sin(a) * WR], [sx, -Math.cos(a) * WR, -Math.sin(a) * WR], 0.12)); }
    }
    for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * 6.2832; wheelParts.push(boxAt(WW + 0.2, 0.12, 1.2, 0, Math.cos(a) * (WR - 0.05), Math.sin(a) * (WR - 0.05)).rotateX(0)); }
    wheelParts.push(rod([-1.5, 0, 0], [1.5, 0, 0], 0.32, 0.32, 8));
    // orient the tread boards tangentially
    const wheelG = mergeGeometries(wheelParts.map((g, i) => {
      if (i >= wheelParts.length - 17 && i < wheelParts.length - 1) { const k = i - (wheelParts.length - 17), a = (k + 0.5) / 16 * 6.2832; g.translate(0, -Math.cos(a) * (WR - 0.05), -Math.sin(a) * (WR - 0.05)); g.rotateX(-a); g.translate(0, Math.cos(a) * (WR - 0.05), Math.sin(a) * (WR - 0.05)); }
      return strip(g);
    }));
    const legsG = legsGeo(20);
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const base = new THREE.Mesh(baseG, wood), wheel = new THREE.Mesh(wheelG, wood), legs = new THREE.Mesh(legsG, wood);
    base.castShadow = true; wheel.castShadow = false; legs.castShadow = false;
    wheel.position.set(0, 4.6, -1.6);
    const tilt = new THREE.Group(); tilt.position.set(0, 0.6, 1.2); tilt.add(legs); g.add(base, wheel, tilt);
    const ropes = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 6, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }), 8);
    ropes.frustumCulled = false; ropes.castShadow = false; scene.add(ropes); ropes.visible = false;
    const rc = new THREE.Color();
    ['#CDBB94', '#CDBB94', '#BFAE88', '#BFAE88', dark, '#CDBB94', '#CDBB94', dark].forEach((h, i) => ropes.setColorAt(i, rc.set(h)));
    const blockMat = new THREE.MeshStandardMaterial({ color: '#D8C9A6', roughness: 0.85 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 1.3), blockMat); block.castShadow = false; scene.add(block); block.visible = false;
    const fieldBlock = new THREE.IcosahedronGeometry(0.85, 0), boxBlock = ashGeo;   // (wave 6: a real ashlar on the hook)
    return { g, base, wheel, tilt, legs, ropes, block, blockMat, fieldBlock, boxBlock, st: null, H: 20, t: 0, aP: 0.15, aW: 0.4, wheelA: 0, ropeL: 5, walking: 0, placeX: 0, placeZ: 0, fwd: new THREE.Vector2(0, 1) };
  })();
  function legsGeo(H) {
    const w = (f) => 2.5 - 2.25 * f;
    return mergeGeometries([rod([2.5, 0, 0], [0.25, H, 0], 0.27, 0.2), rod([-2.5, 0, 0], [-0.25, H, 0], 0.27, 0.2),
      ...[0.22, 0.5, 0.78].map((f) => rod([w(f), H * f, 0], [-w(f), H * f, 0], 0.14)),
      rod([w(0.22), H * 0.22, 0], [-w(0.5), H * 0.5, 0], 0.1), rod([-w(0.5), H * 0.5, 0], [w(0.78), H * 0.78, 0], 0.1),
      new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10).rotateZ(Math.PI / 2).translate(0, H - 0.2, 0)].map(strip));
  }
  function craneSetup(st) {
    liftFlush();
    const C = crane, d = st.def.crane;
    C.st = st; C.t = R() * 3;
    const L = Math.hypot(d.dir[0], d.dir[1]); C.fwd.set(d.dir[0] / L, d.dir[1] / L);
    C.H = d.H; C.mode = d.mode;
    C.g.rotation.y = Math.atan2(C.fwd.x, C.fwd.y);
    if (d.mode === 'ground') { C.aW = Math.asin(clamp(d.reach / d.H, 0.05, 0.62)); C.aP = 0.12; }
    else { C.aP = Math.asin(clamp(d.reach / d.H, 0.1, 0.72)); C.aW = -0.12; }
    if (C.legsH !== d.H) { C.legs.geometry.dispose(); C.legs.geometry = legsGeo(d.H); C.legsH = d.H; }
    C.block.geometry = st.def.stone === 'field' ? C.fieldBlock : C.boxBlock;
    if (st.def.stone === 'field') C.block.scale.set(1, 1, 1); else C.block.scale.set(2.1, 1.0, 1.3);
    C.bx = d.x; C.bz = d.z; C.byFix = null; C.lift = null; C.calm = !!st.lifted;
    st.harPosed = false;   // ── site9 ── (the Mount's walls: harBay poses it at the working front)
    st.posed = false; C.glide = null;   // ── site11 ── (every other site: sitePose)
    C.blockMat.color.set(STONE[st.def.stone] || STONE.ash); C.blockMat.emissive.setRGB(0, 0, 0);
    // the pile under the jib tip at the pick angle
    const reachP = d.H * Math.sin(C.aP);
    st.piles = [[d.x + C.fwd.x * (reachP + 1.2), d.z + C.fwd.y * (reachP + 1.2), Math.atan2(C.fwd.x, C.fwd.y)]];
    C.g.visible = true; C.ropes.visible = true; C.block.visible = true;
  }
  // the crane leaves in mid-lift (another site, a phase change, the stage done): the stone is set at once and the promise
  // resolves, so a caller waiting on liftStone never hangs
  function liftFlush() {
    const C = crane, L = C.lift; if (!L) return;
    C.lift = null; C.t = 0;
    if (L.landed) return;
    L.landed = true;
    const st = L.it.st;
    if (st.status === 'building' && st.disp >= FOUND) liftLand(L.it); else L.it.resolve(false);
  }
  function craneRelease() { liftFlush(); const C = crane; if (C.st) { const d = C.st.def.crane; dustBurst(d.x, craneY(C.st), d.z, 18, 7, 7, 3); } C.st = null; C.g.visible = false; C.ropes.visible = false; C.block.visible = false; }
  function craneY(st) {
    const d = st.def.crane;
    if (d.mode === 'ground') return groundAt(d.x, d.z);
    if (st.id === 'har') return groundAt(d.x, d.z);
    return Math.max(st.base, revealY(st) - 0.05);
  }
  const ropeSet = (i, ax, ay, az, bx, by, bz, r) => {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.max(1e-3, Math.hypot(dx, dy, dz));
    tmpQ.setFromUnitVectors(UP, tmpV.set(dx / L, dy / L, dz / L)); tmpV2.set(ax, ay, az); tmpS.set(r, L, r);
    tmpM.compose(tmpV2, tmpQ, tmpS); crane.ropes.setMatrixAt(i, tmpM);
  };
  function craneUpdate(dt) {
    const C = crane, st = C.st; if (!st) return;
    if (C.glide && !C.lift) glideStep(C, st, dt);   // ── site11 ── (sitePose: it rolls to the working front on its wheels)
    const d = st.def.crane, fx = C.fwd.x, fz = C.fwd.y, bx0 = C.bx, bz0 = C.bz;
    const by = C.byFix !== null ? C.byFix : craneY(st);
    C.g.position.set(bx0, by, bz0);
    C.t += dt;
    const tipH = (a) => by + 0.6 + C.H * Math.cos(a), tipR = (a) => 1.2 + C.H * Math.sin(a);
    let a, hy, carry = true, sw = 0, syaw = C.g.rotation.y + Math.sin(time * 0.9) * 0.08;
    if (TW.on && TW.st === st && !C.lift && treadCrane(C, dt, by, tipH, tipR, TW_OUT)) {   // ── site15 ── המנופאי: in his hands
      a = TW_OUT.a; hy = TW_OUT.hy; carry = TW_OUT.carry; sw = TW_OUT.sw; syaw = TW_OUT.yaw;
    } else if (KS.on && KS.st === st && !C.lift) {   // ── crafta19 ── the key stone in his hands: hung over its slot, lowered by the thumb ── /crafta19 ──
      a = C.aW; hy = KS.s.y + KS.hy; carry = !KS.gone; sw = 0; syaw = KS.s.yaw;
    } else if (C.lift) {
      const r = liftStep(C, dt, by, tipH, tipR);
      a = r.a; hy = r.hy; carry = r.carry; sw = r.sw; syaw = r.yaw;
    } else if (C.calm) {   // (the site sets its stones by liftStone: the crane waits, hook up, a little sway)
      a = C.aP; hy = Math.min(tipH(C.aP), tipH(C.aW)) - 3 + Math.sin(time * 0.7) * 0.15; carry = false;
    } else {
      const P = 9.5, t = C.t % P;
      const yPick = groundAt(bx0 + fx * tipR(C.aP), bz0 + fz * tipR(C.aP)) + 0.5;
      const yPlace = (st.id === 'har' ? revealY(st) : Math.max(st.base, revealY(st))) + 0.5;   // ── site9 ── (the Mount's courses lie below its base 0)
      const top = Math.min(tipH(C.aP), tipH(C.aW)) - 3;
      if (t < 3) { a = C.aP; hy = lerp(yPick, top, easeIO(t / 3)); }
      else if (t < 4.6) { a = lerp(C.aP, C.aW, easeIO((t - 3) / 1.6)); hy = top; }
      else if (t < 5.8) { a = C.aW; hy = lerp(top, Math.min(yPlace, top), easeIO((t - 4.6) / 1.2)); }
      else if (t < 6.3) { a = C.aW; hy = Math.min(yPlace, top); if (t - dt < 5.8) { const px = bx0 + fx * tipR(C.aW), pz = bz0 + fz * tipR(C.aW); dustBurst(px, hy - 0.4, pz, 5, 3.2, 2, 1.2); } carry = false; }
      else if (t < 7.4) { a = C.aW; hy = lerp(Math.min(yPlace, top), top, easeIO((t - 6.3) / 1.1)); carry = false; }
      else if (t < 8.6) { a = lerp(C.aW, C.aP, easeIO((t - 7.4) / 1.2)); hy = top; carry = false; }
      else { a = C.aP; hy = lerp(top, yPick, easeIO((t - 8.6) / 0.9)); carry = false; }
    }
    C.tilt.rotation.x = a;
    const tx = bx0 + fx * tipR(a), tz = bz0 + fz * tipR(a), ty = tipH(a);
    // the load swings on its rope (damped): the hook lags along the jib's line
    const twOn = TW.on && TW.st === st && !C.lift, ksOn = KS.on && KS.st === st && !C.lift, hx = ksOn ? KS.hx : tx + fx * sw + (twOn ? TW.ox : 0), hz = ksOn ? KS.hz : tz + fz * sw + (twOn ? TW.oz : 0);   // ── site15 ── (the 2nd and 3rd slots along the course) ── crafta19 ── (ksOn: the key stone over its slot, offset by the thumb) ── /crafta19 ──
    const newL = ty - hy;
    C.wheelA += (newL - C.ropeL) / 0.9; C.walking = Math.abs(newL - C.ropeL) / Math.max(dt, 1e-4) > 0.3 ? 1 : 0; C.ropeL = newL;
    C.wheel.rotation.x = C.wheelA + (C.roll || 0);
    // wheel axle (world)
    const cy = Math.cos(C.g.rotation.y), sy = Math.sin(C.g.rotation.y);
    const ax = bx0 + (-1.6) * sy, az = bz0 + (-1.6) * cy, ay = by + 4.6;
    ropeSet(0, ax, ay, az, tx, ty, tz, 0.07);
    ropeSet(1, tx, ty - 0.2, tz, hx, hy + 0.6, hz, 0.06);
    // back stays to stakes behind the crane
    const bx = bx0 - fx * (C.H * 0.55 + 4), bz = bz0 - fz * (C.H * 0.55 + 4), bgy = C.byFix !== null ? by : groundAt(bx, bz);
    ropeSet(2, tx, ty, tz, bx + fz * 4, bgy, bz - fx * 4, 0.06);
    ropeSet(3, tx, ty, tz, bx - fz * 4, bgy, bz + fx * 4, 0.06);
    ropeSet(4, bx + fz * 4, bgy - 0.5, bz - fx * 4, bx + fz * 4, bgy + 1.2, bz - fx * 4, 0.22);
    ropeSet(7, bx - fz * 4, bgy - 0.5, bz + fx * 4, bx - fz * 4, bgy + 1.2, bz + fx * 4, 0.22);
    // sling
    const sl = C.lift ? Math.min(1.2, C.lift.s.w * 0.33) : 0.7, cs = Math.cos(syaw), sn = Math.sin(syaw);
    ropeSet(5, hx, hy + 0.6, hz, hx + sl * cs, hy + 0.35, hz - sl * sn, 0.04);
    ropeSet(6, hx, hy + 0.6, hz, hx - sl * cs, hy + 0.35, hz + sl * sn, 0.04);
    C.ropes.instanceMatrix.needsUpdate = true;
    C.block.visible = carry;
    C.block.position.set(hx, hy - (C.lift ? C.lift.s.h * 0.5 - 0.5 : 0), hz); C.block.rotation.y = syaw;
  }
  /* ── liftStone on the crane (wave 6): roll along the face if the slot is out of reach, hook down to the stock pile, lift,
     tilt over with a damped swing, lower into the slot, settle (a small drop, dust); the count goes up as it lands ── */
  // where the crane stands to set slot `s` of site `st` (and its pick and work angles): 'ground' outside the face leaning in,
  // 'top' (or a face too tall for it) on the laid course behind — craneLiftStart's pose, and ── site11 ── sitePose's
  function craneWorkPose(st, s, H) {
    const d = st.def.crane, nx = s.n[0], nz = s.n[1];
    let mode = d.mode === 'ground' ? 'ground' : 'top', aW = 0.3, D = 1.2 + H * Math.sin(0.3);
    // ── site11 ── (rule 8 at every site: his banker 4 amot out from the slot) the smaller ground cranes lean out to 12 amot, so
    // their 12-amah base stands clear of his banker (3.4 amot) and their stock 6 amot from it
    const cast = !!(st.lay && st.lay.kind === 'cast');   // (the laver's pours keep v20's crane)
    if (mode === 'ground' && !cast && st.id !== 'har' && st.id !== 'wall' && D < 12) { D = 12; aW = Math.asin(clamp((D - 1.2) / H, 0.05, 0.95)); }
    if (mode === 'ground' && groundAt(s.x + nx * D, s.z + nz * D) + 0.6 + H * Math.cos(aW) < s.y + s.h / 2 + 3) mode = 'top';
    let bx, bz, byFix, fx, fz, aP;
    // ── site11 ── (by touch, 29.9: the wall's crane straight out from the slot put its legs across the frame over his shoulder;
    // beside it toward the laid stones, the crane and its stock left the frame) a ground crane stands out from the face AND
    // along it toward the unlaid side, where the working frame looks from (0.8 D out, 0.6 D along: the same reach): its stock
    // on the frame's side beside his banker, its legs rising at the frame's edge to the hook over the slot, above him
    // (the wall's tall crane only: at the smaller ground cranes (the altar, the Ezrat Nashim, the chambers, the lattice) its stock
    //  would stand on his own spot on the unlaid side — there it goes toward the laid stones, beyond the slot from the frame)
    if (mode === 'ground' && st.id !== 'har' && !cast) {
      const sg = st.id === 'wall' ? -1 : 1, [ux, uz] = slotTangent(st.id, s), ox = nx * 0.8 + sg * ux * 0.6, oz = nz * 0.8 + sg * uz * 0.6;
      bx = s.x + ox * D; bz = s.z + oz * D; fx = -ox; fz = -oz; byFix = null; aP = 0.1;
      return { mode, bx, bz, byFix, fx, fz, aP, aW };
    }
    if (mode === 'ground') { fx = -nx; fz = -nz; bx = s.x + nx * D; bz = s.z + nz * D; byFix = null; aP = 0.1; }
    else { aW = 0.1; D = 1.2 + H * Math.sin(aW); fx = nx; fz = nz; bx = s.x - nx * D; bz = s.z - nz * D; byFix = s.y - s.h / 2; aP = Math.asin(clamp(d.reach / H, 0.1, 0.72)); }
    return { mode, bx, bz, byFix, fx, fz, aP, aW };
  }
  function craneLiftStart(it) {
    const C = crane, st = it.st, s = slotOf(it.b, false), H = C.H;
    let { mode, bx, bz, byFix, fx, fz, aP, aW } = craneWorkPose(st, s, H);
    // ── site9 ── the Mount's walls: the crane stands on the laid course and lifts from the stock BEHIND it, in the working bay
    if (st.id === 'har' && mode === 'top') { aP = HAR_AP(H); byFix = Math.max(byFix, groundAt(bx, bz) - 0.2); st.harPitK = hill.U.uPitK.value; }   // (── flow10 ── harBay)
    C.glide = null;   // ── site11 ── (a lift takes over a roll in progress: it rolls on from where the crane is)
    const from = [C.bx, C.bz], far = Math.hypot(bx - C.bx, bz - C.bz);
    C.lift = { it, s, t: 0, from, to: [bx, bz], roll: far > 0.3 && far < 40 ? clamp(far / 14, 0.5, 1.4) : 0, fx, fz, aP, aW, byFix,
      a0: C.tilt.rotation.x, h0: C.block.position.y, sw: 0.7, k: clamp(it.dur / 4.2, 0.5, 3), picked: false, landed: false, great: it.great };
    if (!C.lift.roll) { C.bx = bx; C.bz = bz; C.fwd.set(fx, fz); C.g.rotation.y = Math.atan2(fx, fz); C.byFix = byFix; dustBurst(bx, (byFix !== null ? byFix : groundAt(bx, bz)) + 0.3, bz, 10, 5, 4, 1.5); }
    C.aP = aP; C.aW = aW;
    const scale = it.great ? [Math.min(12, s.w * 2.4), s.h * 1.02, Math.max(s.d, 2.6)] : [s.w * 0.98, s.h * 0.97, s.d];
    C.block.scale.set(...scale); C.block.geometry = st.def.stone === 'field' ? C.fieldBlock : C.boxBlock;
    if (st.def.stone === 'field') C.block.scale.set(s.w * 0.55, s.h * 0.75, s.d * 0.5);
    // the kiyor is cast, not built: the hook carries a glowing crucible that pours over the mould (illus.)
    const cast = !!(st.lay && st.lay.kind === 'cast');
    if (cast) { C.block.geometry = C.fieldBlock; C.block.scale.set(1.3, 0.85, 1.3); C.blockMat.color.set('#6E4A2E'); C.blockMat.emissive.set('#FF6A10'); C.blockMat.emissiveIntensity = 0.9; }
    // ── site13 ── (N64: "no stone on the hook that I can see" — the key stone the same colour as the course behind it) the key
    // stone on the hook glows warm gold and trails a few sparks until it lands; its landing throws gold sparks and dust
    else if (it.great) { C.blockMat.color.set('#EFE2C2'); C.blockMat.emissive.set('#9A6A18'); C.blockMat.emissiveIntensity = 0.75; }
    else { C.blockMat.color.set(STONE[st.def.stone] || STONE.ash); C.blockMat.emissive.setRGB(0, 0, 0); }
    C.lift.cast = cast;
    // the stock pile moves with the crane (under the pick point)
    const pr = 1.2 + H * Math.sin(aP), px = bx + fx * pr, pz = bz + fz * pr;
    st.piles = [[px, pz, Math.atan2(fx, fz)]]; propsDirty = true;
    st.lifted = true; C.calm = true;
  }
  const LS = { a: 0, hy: 0, carry: true, sw: 0, yaw: 0 };   // liftStep's result (reused: no per-frame allocation)
  const liftOut = (a, hy, carry, sw, yaw) => { LS.a = a; LS.hy = hy; LS.carry = carry; LS.sw = sw; LS.yaw = yaw; return LS; };
  const loadSwing = (tt) => 0.9 * Math.exp(-2.3 * tt) * Math.sin(5.4 * tt);   // the load's damped swing on its rope
  function liftStep(C, dt, by, tipH, tipR) {
    const L = C.lift, k = L.k, s = L.s, st = C.st;
    L.t += dt;
    let t = L.t;
    // 0 · roll along the face (the wheel turns as it goes)
    if (L.roll && t < L.roll) {
      const u = easeIO(t / L.roll);
      C.bx = lerp(L.from[0], L.to[0], u); C.bz = lerp(L.from[1], L.to[1], u); C.roll = (C.roll || 0) + dt * 2.2;
      if (u > 0.5 && !L.turned) { L.turned = true; C.fwd.set(L.fx, L.fz); C.g.rotation.y = Math.atan2(L.fx, L.fz); C.byFix = L.byFix; }
      if (Math.random() < dt * 8) dustBurst(C.bx, by + 0.2, C.bz, 2, 2.5, 1.5, 0.4);
      return liftOut(L.a0, Math.min(tipH(L.a0), tipH(C.aW)) - 3, false, 0, C.g.rotation.y);
    }
    if (L.roll && !L.rolled) { L.rolled = true; C.bx = L.to[0]; C.bz = L.to[1]; C.fwd.set(L.fx, L.fz); C.g.rotation.y = Math.atan2(L.fx, L.fz); C.byFix = L.byFix; }
    t -= L.roll;
    const T1 = 0.7 * k, T2 = T1 + 1.0 * k, T3 = T2 + 1.1 * k, T4 = T3 + 0.9 * k, T5 = T4 + 0.32, T6 = T5 + 0.7;
    // (heights are the stone's centre; the hook rides h/2 − 0.5 above it)
    const fx = C.fwd.x, fz = C.fwd.y, pickY = groundAt(C.bx + fx * tipR(C.aP), C.bz + fz * tipR(C.aP)) + s.h * 0.5 + 0.1;
    const top = Math.min(Math.max(s.y + s.h + 3.5, pickY + 4), Math.min(tipH(C.aP), tipH(C.aW)) - 2.8 - s.h * 0.5), setY = L.cast ? s.y + s.h + 1.4 : s.y;
    if (L.it.great && !L.cast && L.picked && !L.landed && Math.random() < dt * 9) { const b = C.block.position; spark.spawn(b.x, b.y + 0.4, b.z, 2, PO(1.4, 0.6, 0.8, 1.2, 1.6, 0.5, 1.1, 1.5, 1.2, 1, true)); }   // ── site13 ── (N64)
    const yawS = Math.atan2(fx, fz), dyw = ((s.yaw - yawS + Math.PI * 2.5) % Math.PI) - Math.PI / 2, yawT = yawS + dyw;
    let a, hy, sw = 0, carry = true, yaw = yawS;
    if (t < T1) { a = lerp(L.a0, C.aP, easeIO(t / T1)); hy = lerp(top, pickY, easeIO(t / T1)); carry = false; }
    else if (t < T2) {
      if (!L.picked) { L.picked = true; if (st.stock > 0) { st.stock--; propsDirty = true; } dustBurst(C.bx + fx * tipR(C.aP), pickY - s.h * 0.5, C.bz + fz * tipR(C.aP), 5, 2.5, 1.6, 0.8); }
      a = C.aP; hy = lerp(pickY, top, easeIO((t - T1) / (T2 - T1)));
    }
    else if (t < T3) { const u = easeIO((t - T2) / (T3 - T2)); a = lerp(C.aP, C.aW, u); hy = top; sw = loadSwing(t - T2) * (C.aW > C.aP ? -1 : 1); yaw = yawS + (yawT - yawS) * u * 0; }
    else if (t < T4) { const u = easeIO((t - T3) / (T4 - T3)); a = C.aW; hy = lerp(top, setY + 0.45, u); sw = loadSwing(t - T2) * (C.aW > C.aP ? -1 : 1); yaw = yawT + (yawS - yawT) * (1 - u) * (1 - u); }
    else if (t < T5) {   // the settle: a small drop onto its bed
      a = C.aW; hy = lerp(setY + 0.45, setY, easeIn((t - T4) / (T5 - T4))); yaw = yawT;
    } else {
      if (!L.landed) {
        L.landed = true;
        if (L.it.great && !L.cast) { sparkBurst(s.face[0], s.y + s.h * 0.6, s.face[2], 44, 7, 9); dustBurst(s.face[0], s.y - s.h * 0.4, s.face[2], 22, 7, 5, 2.4); C.blockMat.emissive.setRGB(0, 0, 0); }   // ── site13 ── (N64)
        if (st.status !== 'building') L.it.resolve(false); else { if (L.it.great) { (st.great = st.great || []).push(greatStone(s)); propsDirty = true; } liftLand(L.it); }
      }
      a = C.aW; hy = lerp(setY, top, easeIO(clamp((t - T5) / (T6 - T5), 0, 1))); carry = false; yaw = yawT;
      if (t >= T6) { C.lift = null; C.t = 0; }
    }
    return liftOut(a, hy + s.h * 0.5 - 0.5, carry, sw, yaw);
  }
  function greatStone(s) {   // a master-course / Josephus stone laid over the face (proud by a finger)
    const w = Math.min(12, s.w * 2.4), d = Math.max(s.d, 2.6);
    return { x: s.face[0] - s.n[0] * (d / 2 - 0.04), y: s.y, z: s.face[2] - s.n[1] * (d / 2 - 0.04), w, h: s.h * 1.02, d, yaw: s.yaw };
  }

  /* ── workers ── */
  const WG = workerGeos(), wMat = tintMaterial();
  const NW = 72;   // ── site13 ── (was 44: + the men at the crews' machines, MK below)
  const wBody = new THREE.InstancedMesh(WG.body, wMat, NW), wArm = new THREE.InstancedMesh(WG.arm, wMat, NW), wLeg = new THREE.InstancedMesh(WG.leg, wMat, NW * 2);
  const wStone = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.55, 0.62), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }), NW);
  const wArm2 = new THREE.InstancedMesh(WG.arm2, wMat, NW);   // ── site13 ── (bare hands: see workerGeos)
  for (const m of [wBody, wArm, wLeg, wStone, wArm2]) { m.count = 0; m.frustumCulled = false; m.receiveShadow = true; scene.add(m); }
  const WPAL = ['#DCD0B6', '#C7B28C', '#A88F6A', '#8E7A5C', '#BBA78A', '#E6DECD', '#9C8C73', '#7F6B4F'].map((h) => new THREE.Color(h));
  const W = [];
  for (let i = 0; i < NW; i++) { const c = WPAL[i % WPAL.length]; wBody.setColorAt(i, c); wArm.setColorAt(i, c); wArm2.setColorAt(i, c); W.push({ role: 'idle', st: null, x: 0, y: 0, z: 0, yaw: 0, ph: R() * 6.28, sp: 2.6 + R() * 0.9, ax: 0, az: 0, bx: 0, bz: 0, t: 0, dir: 1, wait: 0, carry: false, run: null, o: 0 }); }
  let nWork = 0, workDirty = true;
  function assignWorkers() {
    workDirty = false;
    let n = 0;
    const sites = list.filter((s) => s.status === 'building');
    for (const st of sites) {
      // ── site8 ── the Mount's survey and dig: gangs at the rocks round the builder, carriers at the split ones (mountGangs)
      if (st.id === 'har' && st.disp < FOUND) { n = mountGangs(st, n); continue; }
      const def = st.def, [nm0, nc0] = def.crew || [6, 5], found = st.disp < FOUND;
      const nm = Math.min(nm0, NW - n), runs = def.scaff ? def.scaff.runs : null;
      for (let k = 0; k < nm; k++) {
        const w = W[n++]; w.st = st; w.ph = R() * 6.28;
        if (!found && runs) {
          const run = runs[(def.crewRuns ? def.crewRuns[k % def.crewRuns.length] : k) % runs.length], [a, b, nn] = run;
          const t = def.crewT ? def.crewT[0] + (def.crewT[1] - def.crewT[0]) * ((k * 0.618 + 0.3) % 1) : 0.12 + 0.76 * ((k * 0.618 + 0.3) % 1);
          const o = def.scaff.rows === 1 ? 0.85 : 2.15;
          w.role = 'mason'; w.run = run; w.x = lerp(a[0], b[0], t) + nn[0] * o; w.z = lerp(a[1], b[1], t) + nn[1] * o; w.yaw = Math.atan2(-nn[0], -nn[1]);
        } else {
          // on the ground at the footprint edge (diggers in the foundation phase)
          const f = def.foot[k % def.foot.length], per = 2 * (f[2] - f[0] + f[3] - f[1]);
          let s = ((k * 0.382 + 0.1) % 1) * per, x, z, yaw;
          const w0 = f[2] - f[0], h0 = f[3] - f[1];
          if (s < w0) { x = f[0] + s; z = f[1] - 1.4; yaw = 0; }
          else if ((s -= w0) < h0) { x = f[2] + 1.4; z = f[1] + s; yaw = -Math.PI / 2; }
          else if ((s -= h0) < w0) { x = f[2] - s; z = f[3] + 1.4; yaw = Math.PI; }
          else { s -= w0; x = f[0] - 1.4; z = f[3] - s; yaw = Math.PI / 2; }
          if (st.id === 'har') { const e = [[277, 40], [277, -60], [277, 100], [277, 150], [150, -480], [277, -150], [60, -480], [277, 230]][k % 8]; x = e[0] + (e[0] === 277 ? 5 : 0); z = e[1] + (e[1] === -480 ? -5 : 0); yaw = e[0] === 277 ? -Math.PI / 2 : 0; }
          w.role = found ? 'dig' : 'mason'; w.run = null; w.x = x; w.z = z; w.yaw = yaw;
        }
      }
      const piles = st.piles && st.piles.length ? st.piles : [[(st.fb.x0 + st.fb.x1) / 2, st.fb.z0 - 12, 0]];
      // quarrymen cutting the crest, each beside a pile of quarried blocks
      if (def.quarry && !found) for (let k = 0; k < def.quarry.length * 2 && n < NW; k++) {
        const w = W[n++], [qx, qz] = def.quarry[k >> 1], a = (k & 1 ? 0.9 : -0.7) + qx * 0.01;
        w.st = st; w.role = 'dig'; w.run = null; w.ph = R() * 6.28;
        w.x = qx + Math.cos(a) * 7; w.z = qz + Math.sin(a) * 7; w.yaw = Math.atan2(-Math.cos(a), -Math.sin(a)) + 0.4;
      }
      const nc = Math.min(nc0, NW - n);
      for (let k = 0; k < nc; k++) {
        const w = W[n++]; w.st = st; w.role = 'carry'; w.t = R(); w.dir = k % 2 ? 1 : -1; w.wait = R() * 1.5; w.ph = R() * 6.28;
        const [px, pz] = piles[k % piles.length];
        // drop point: toward the site from the pile
        let tx, tz;
        if (runs && !found) { const run = runs[k % runs.length], [a, b, nn] = run, t = 0.2 + 0.6 * R(), o = (def.scaff.rows === 2 ? 3.3 : 1.2) + 1.6; tx = lerp(a[0], b[0], t) + nn[0] * o; tz = lerp(a[1], b[1], t) + nn[1] * o; }
        else { const cx = clamp(px, st.fb.x0 - 2, st.fb.x1 + 2), cz = clamp(pz, st.fb.z0 - 2, st.fb.z1 + 2); tx = cx + (R() - 0.5) * 8; tz = cz + (R() - 0.5) * 8; if (st.id === 'har') { tx = 283 + R() * 4; tz = -60 + R() * 220; } }
        const ox = found ? px + (R() - 0.5) * 30 : px + (R() - 0.5) * 3, oz = found ? pz + (R() - 0.5) * 30 - 10 : pz + (R() - 0.5) * 3;
        if (found) { w.ax = ox; w.az = oz; w.bx = px; w.bz = pz; } else { w.ax = ox; w.az = oz; w.bx = tx; w.bz = tz; }
      }
      // one walker inside the crane's treadwheel
      if (crane.st === st && !found && n < NW) { const w = W[n++]; w.st = st; w.role = 'tread'; }
      // ── site13 ── the men at the crews' machines: one walks the crews' treadwheel, a tag-line man at its pile, two haul the
      // shear-legs' fall, two lever the sledge from behind and two pull it (their places follow the machines: workersUpdate)
      if (MK.sites[st.id]) for (const [role, k] of MK_MEN) { if (n >= NW) break; const w = W[n++]; w.st = st; w.role = role; w.mk = k; w.run = null; w.ph = R() * 6.28; }
    }
    // quarrymen at the outcrop (two per quarry crew)
    if (quarryOn) for (let k = 0; k < Math.min(8, qCrews * 2) && n < NW; k++) {
      const w = W[n++], rk = QROCKS[k % QROCKS.length], a = 2.2 + (k >> 1) * 0.5 + (k & 1) * 0.9;
      w.st = null; w.role = 'dig'; w.run = null; w.ph = R() * 6.28;
      w.x = rk[0] + Math.cos(a) * (rk[2] + 1.4); w.z = rk[1] + Math.sin(a) * (rk[2] + 1.4); w.yaw = Math.atan2(rk[0] - w.x, rk[1] - w.z);
    }
    // the kodesh moment: two men at the windlass on the roof
    if (bx.on) for (let k = 0; k < 2 && n < NW; k++) { const w = W[n++]; w.st = null; w.role = 'winch'; w.run = null; w.ph = k * 3.14; w.x = BXX + (k ? 4.5 : -4.5); w.z = BXZ - 1.5; w.yaw = 0; }
    nWork = n;
    wBody.count = wArm.count = n; wLeg.count = n * 2;
    wBody.instanceColor.needsUpdate = true; wArm.instanceColor.needsUpdate = true;
  }
  // ── site8 ── the Mount's gangs (DESIGN8B R5: "crews at the NEXT target, not only the current"): two men breaking the far side
  // of the builder's own rock, two at each of the three standing rocks nearest him, two carriers taking the rubble of each
  // split rock to its spoil heap while it lasts; a stake man at the newest patch's corner
  const mgA = [];
  function mountGangs(st, n) {
    const hr = heroRock();
    mgA.length = 0;
    for (let i = 0; i < bSt.length; i++) if (bSt[i].state > 0 && i !== hr) mgA.push(i);
    mgA.sort((a, b) => Math.hypot(bSt[a].x - hero.x, bSt[a].z - hero.z) - Math.hypot(bSt[b].x - hero.x, bSt[b].z - hero.z));
    const put = (x, z, yaw, role) => { if (n >= NW) return; const w = W[n++]; w.st = st; w.role = role; w.run = null; w.ph = R() * 6.28; w.x = x; w.z = z; w.yaw = yaw; return w; };
    const pair = (bi, a0, spread) => {
      const b = bSt[bi];
      for (const sg of [-1, 1]) { const a = a0 + sg * spread, rr = b.r + 1.3, x = b.x + Math.cos(a) * rr, z = b.z + Math.sin(a) * rr; put(x, z, Math.atan2(b.x - x, b.z - z), 'dig'); }
    };
    if (hr >= 0) { const b = bSt[hr], a0 = Math.atan2(hero.z - b.z, hero.x - b.x); pair(hr, a0 + Math.PI, 0.75); }
    if (crane.st === st && n < NW) { const w = W[n++]; w.st = st; w.role = 'tread'; }   // a man in the crane's treadwheel
    for (let k = 0; k < Math.min(3, mgA.length); k++) { const b = bSt[mgA[k]]; pair(mgA[k], Math.atan2(hero.z - b.z, hero.x - b.x), 1.25); }
    // carriers: rubble → the spoil heap (on the patch's downhill side)
    for (let i = 0; i < bSt.length && n < NW - 1; i++) {
      const b = bSt[i]; if (b.state > 0 || !(b.rub > 0.001)) continue;
      const hp = spoilSpot(b);
      for (let k = 0; k < 2; k++) {
        const w = W[n++]; w.st = st; w.role = 'carry'; w.t = R(); w.dir = k ? 1 : -1; w.wait = R() * 1.2; w.ph = R() * 6.28;
        const a = b.yaw + k * 2.1; w.ax = b.x + Math.cos(a) * b.r * 0.9; w.az = b.z + Math.sin(a) * b.r * 0.9; w.bx = hp[0] + (k - 0.5) * 2.4; w.bz = hp[1] - (k - 0.5) * 2.4;
      }
    }
    return n;
  }
  // where a split rock's rubble is heaped: just outside its patch, on the downhill side (the lower of four)
  const spoilOut = [0, 0];
  function spoilSpot(b) {
    let best = 0, by = 1e9; const d = b.r * 2.05 + 4;
    // (site9: in the boulder field the heap goes where no other rock or its patch is — the field's edge — the lowest such side)
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + 0.4, x = b.x + Math.cos(a) * d, z = b.z + Math.sin(a) * d;
      let pen = 0; for (const q of bSt) if (q !== b) pen = Math.max(pen, q.r * 1.9 + 5 - Math.hypot(q.x - x, q.z - z));
      const y = hill.heightAt(x, z) + pen * 4; if (y < by) { by = y; best = a; }
    }
    spoilOut[0] = b.x + Math.cos(best) * d; spoilOut[1] = b.z + Math.sin(best) * d;
    return spoilOut;
  }
  // masons stand on the highest board below the wall top they are laying
  const scaffLevel = (st, run) => { const L = st.def.scaff.lift, y0 = run[3], m = Math.floor((Math.min(revealY(st), run[4]) - y0 - 0.5) / L); return y0 + Math.max(0, m) * L + (m > 0 ? 0.21 : 0); };
  const tmpC0 = new THREE.Color();
  const wmBody = new THREE.Matrix4(), wmT = new THREE.Matrix4(), wmR = new THREE.Matrix4(), wv = new THREE.Vector3(), wq = new THREE.Quaternion(), we = new THREE.Euler();
  function workersUpdate(dt) {
    let ns = 0, na = 0, nb = 0;
    for (let i = 0; i < nWork; i++) {
      const w = W[i], st = w.st;
      let lean = 0, arm = 0, legA = 0, bob = 0, stone = false;
      if (w.role === 'carry') {
        if (w.wait > 0) { w.wait -= dt; }
        else {
          const L = Math.hypot(w.bx - w.ax, w.bz - w.az) || 1;
          w.t += w.dir * w.sp * dt / L;
          if (w.t >= 1) { w.t = 1; w.dir = -1; w.wait = 0.9 + R() * 0.8; if (st.disp >= FOUND) dustBurst(w.bx, w.y + 0.3, w.bz, 2, 1.6, 1, 0.6); }
          else if (w.t <= 0) { w.t = 0; w.dir = 1; w.wait = 0.8 + R() * 0.9; }
          w.ph += w.sp * dt * 2.1;
          legA = Math.sin(w.ph) * 0.55; bob = Math.abs(Math.cos(w.ph)) * 0.1;
        }
        w.x = lerp(w.ax, w.bx, w.t); w.z = lerp(w.az, w.bz, w.t);
        const hx = w.bx - w.ax, hz = w.bz - w.az; w.yaw = Math.atan2(hx * w.dir, hz * w.dir);
        w.y = groundAt(w.x, w.z);
        stone = w.dir > 0;
        arm = stone ? -2.75 : Math.sin(w.ph + Math.PI) * 0.4;
        lean = stone ? 0.08 : 0.04;
      } else if (w.role === 'mason' || w.role === 'dig') {
        w.ph += dt * (w.role === 'dig' ? 3.6 : 5.2);
        const s = Math.sin(w.ph), hit = Math.max(0, s);
        if (w.role === 'dig') { lean = 0.35 + hit * 0.35; arm = -1.6 + hit * 1.5; bob = -hit * 0.15; }
        else if (st && FIELD.has(st.id)) { lean = 0.42 + hit * 0.12; arm = -0.75 + hit * 0.35; bob = -hit * 0.05; }   // ── site13 ── (the altar: a whole stone seated by hand, no iron)
        else { lean = 0.12 + hit * 0.12; arm = -2.2 + Math.pow(hit, 0.6) * 1.7; }
        w.y = w.run ? scaffLevel(st, w.run) : groundAt(w.x, w.z);
      } else if (w.role === 'winch') {
        w.ph += dt * (bx.moving ? 5 : 0.9);
        arm = -1.35 + Math.sin(w.ph) * 0.6; lean = 0.2 + Math.cos(w.ph) * 0.07;
        w.y = BXY;
      } else if (w.role.charCodeAt(0) === 109 && w.role.charCodeAt(1) === 107) {   // ── site13 ── 'mk…': a man at the crews' machines
        const P = MK.man(w, dt); lean = P.lean; arm = P.arm; legA = P.legA; bob = P.bob;
      } else if (w.role === 'tread') {
        const C = crane, d = st.def.crane;
        w.yaw = C.g.rotation.y + Math.PI;
        const cy = Math.cos(C.g.rotation.y), sy = Math.sin(C.g.rotation.y);
        w.x = d.x - 1.6 * sy; w.z = d.z - 1.6 * cy; w.y = C.g.position.y + 4.6 - 3.55;
        if (C.walking) { w.ph += dt * 7; legA = Math.sin(w.ph) * 0.5; bob = Math.abs(Math.cos(w.ph)) * 0.08; arm = -0.9 + Math.sin(w.ph) * 0.2; lean = 0.25; }
        else { arm = -0.9; lean = 0.15; }
      }
      // ── site20 ── the crowd before the piece (fable20's general work): a mason, digger or carrier within 5 amot of it takes two steps off and
      // watches him (a still stance, facing the piece); back at his place when the work is done
      let ox = 0, oz = 0;
      if (w.role === 'mason' || w.role === 'dig' || w.role === 'carry') {
        let tx = 0, tz = 0;
        if (GW.on && !GW.done) { const dx = w.x - (GW.x + GW.fx * 1.3), dz = w.z - (GW.z + GW.fz * 1.3), d = Math.hypot(dx, dz); if (d < 5) { const k = Math.min(4.5, 5.6 - d), ux = d > 0.2 ? dx / d : 1, uz = d > 0.2 ? dz / d : 0; tx = ux * k; tz = uz * k; } }
        const e = 1 - Math.exp(-dt * 2.6); w.o20x = (w.o20x || 0) + (tx - (w.o20x || 0)) * e; w.o20z = (w.o20z || 0) + (tz - (w.o20z || 0)) * e;
        ox = w.o20x; oz = w.o20z;
        const om = Math.hypot(ox, oz);
        if (om > 0.15) { const wk = clamp(om / 1.2, 0, 1), fy = Math.atan2((GW.x + GW.fx * 1.3) - (w.x + ox), (GW.z + GW.fz * 1.3) - (w.z + oz)); let dy = fy - w.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); lean += (0.05 - lean) * wk; arm += (-0.4 - arm) * wk; bob *= 1 - wk; legA *= 1 - wk; if (tx || tz) w.yaw += dy * Math.min(1, dt * 6); }
      }
      // ── /site20 ──
      we.set(lean, w.yaw, 0, 'YXZ'); wq.setFromEuler(we); wv.set(w.x + ox, w.y + bob, w.z + oz);   // ── site20 ── (+ox, +oz) ── /site20 ──
      wmBody.compose(wv, wq, ONE); wBody.setMatrixAt(i, wmBody);
      wmT.makeTranslation(-0.44, 2.72, 0); wmR.makeRotationX(arm); tmpM.multiplyMatrices(wmBody, wmT).multiply(wmR);
      // ── site13 ── a hammer only for a mason or a digger away from the altar; bare hands for the rest (N76 c)
      if ((w.role === 'mason' || w.role === 'dig') && !(st && FIELD.has(st.id))) { wArm.setMatrixAt(na, tmpM); wArm.setColorAt(na, WPAL[i % WPAL.length]); na++; }
      else { wArm2.setMatrixAt(nb, tmpM); wArm2.setColorAt(nb, WPAL[i % WPAL.length]); nb++; }
      we.set(0, w.yaw, 0); wq.setFromEuler(we); wv.set(w.x + ox, w.y + bob, w.z + oz); tmpM2.compose(wv, wq, ONE);   // ── site20 ── (+ox, +oz) ── /site20 ──
      for (let s = 0; s < 2; s++) {
        wmT.makeTranslation(s ? -0.2 : 0.2, 1.05, 0); wmR.makeRotationX(s ? -legA : legA);
        tmpM.multiplyMatrices(tmpM2, wmT).multiply(wmR); wLeg.setMatrixAt(i * 2 + s, tmpM);
      }
      if (stone) {
        wmT.makeTranslation(-0.3, 3.16, 0.05); wmR.makeRotationZ(0.12);
        tmpM.multiplyMatrices(wmBody, wmT).multiply(wmR); wStone.setMatrixAt(ns, tmpM);
        wStone.setColorAt(ns, tmpC0.set(STONE[st.def.stone] || STONE.ash)); ns++;
      }
    }
    wStone.count = ns;
    wArm.count = na; wArm2.count = nb;   // ── site13 ──
    for (const m of [wBody, wArm, wLeg, wStone, wArm2]) m.instanceMatrix.needsUpdate = true;
    for (const m of [wArm, wArm2]) if (m.instanceColor) m.instanceColor.needsUpdate = true;
    if (wStone.instanceColor) wStone.instanceColor.needsUpdate = true;
  }

  // ── site13 ── (the owner, 30.9 11:12: "נראה שאני עובד לבד רק גלגלית אחת ישנה והיא שלי. צריך לדעתי עוד מכונות כאלה בסביבה ועוד
  // מכונות בניה מגניבות מהימים ההם שייראה מלא פעילות"; PRODUCER-S13a #7) at every walled site being built, along the course he
  // lays (toward its laid stones, where his working frame looks): the crews' treadwheel crane (the great wheel walked by a man,
  // Vitruvius 10.2's rota) lifting THEIR stones from their pile onto the course — on the ground, or on the rising wall once the
  // course is higher than it can reach; a shear-legs (two poles, a pulley block, two men on the fall) raising a block; a sledge
  // on rollers bringing a long block, levered from behind and hauled in front. All illustration (המחשה): the sources describe
  // the stones, not Herod's machines. Instanced: 8 draw calls for all of them (≤ 4 sites); the men are the workers' own.
  const MK_SITES = new Set(['wall', 'sorag', 'gates', 'nashim', 'nikanor', 'lishka', 'ulam', 'heichal', 'kodesh']);
  const MK_MEN = [['mkTread', 0], ['mkTag', 0], ['mkHaul', 0], ['mkHaul', 1], ['mkLever', 0], ['mkLever', 1], ['mkPull', 0], ['mkPull', 1]];
  const MK = (() => {
    const N = 4;
    const mk = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, n); m.count = 0; m.frustumCulled = true; m.castShadow = shadow; m.receiveShadow = true; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.name = 'site13-machines'; scene.add(m); return m; };
    const wood = crane.base.material;
    const base = mk(crane.base.geometry, wood, N), wheel = mk(crane.wheel.geometry, wood, N, false), legs = mk(legsGeo(20), wood, N, false);
    const shear = mk(mergeGeometries([rod([2.3, 0, 0], [0.22, 10, 0], 0.24, 0.18), rod([-2.3, 0, 0], [-0.22, 10, 0], 0.24, 0.18), rod([1.85, 2.2, 0], [-1.85, 2.2, 0], 0.12), rod([1.2, 5.2, 0], [-1.2, 5.2, 0], 0.1),
      boxAt(1.0, 0.55, 0.7, 0, 10.05, 0), new THREE.CylinderGeometry(0.5, 0.5, 0.36, 10).rotateZ(Math.PI / 2).translate(0, 9.55, 0.45)].map(strip)), wood, N, false);
    const sled = mk(mergeGeometries([boxAt(0.4, 0.4, 6.2, 1.15, 0.78, 0), boxAt(0.4, 0.4, 6.2, -1.15, 0.78, 0), ...[-2.5, -0.85, 0.85, 2.5].map((z) => boxAt(2.8, 0.2, 0.42, 0, 1.06, z)), rod([-1.1, 0.8, 3.1], [1.1, 0.8, 3.1], 0.12)].map(strip)), wood, N);
    const roll = mk(strip(new THREE.CylinderGeometry(0.29, 0.29, 3.3, 8).rotateZ(Math.PI / 2)), wood, N * 3);
    const ropes = mk(new THREE.CylinderGeometry(1, 1, 1, 5, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#BFAE88', roughness: 0.9 }), N * 9, false);
    const stones = mk(ashGeo, props.material, N * 3);
    const cS = new THREE.Color(STONE.ash); for (let i = 0; i < N * 3; i++) stones.setColorAt(i, cS);
    return { N, base, wheel, legs, shear, sled, roll, ropes, stones, all: [base, wheel, legs, shear, sled, roll, ropes, stones], sites: {}, nr: 0, ns: 0, nroll: 0, P: { lean: 0, arm: 0, legA: 0, bob: 0 } };
  })();
  const mkM = new THREE.Matrix4(), mkM2 = new THREE.Matrix4(), mkQ = new THREE.Quaternion(), mkV = new THREE.Vector3(), mkS = new THREE.Vector3(), mkE = new THREE.Euler();
  function mkRope(ax, ay, az, bx, by, bz, r) {
    if (MK.nr >= MK.ropes.instanceMatrix.count) return;
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.max(1e-3, Math.hypot(dx, dy, dz));
    mkQ.setFromUnitVectors(UP, mkV.set(dx / L, dy / L, dz / L)); mkS.set(r, L, r); mkV.set(ax, ay, az);
    mkM.compose(mkV, mkQ, mkS); MK.ropes.setMatrixAt(MK.nr++, mkM);
  }
  function mkStone(x, y, z, yaw, sx, sy, sz) {
    if (MK.ns >= MK.stones.instanceMatrix.count) return;
    mkE.set(0, yaw, 0); mkQ.setFromEuler(mkE); mkV.set(x, y, z); mkS.set(sx, sy, sz); mkM.compose(mkV, mkQ, mkS); MK.stones.setMatrixAt(MK.ns++, mkM);
  }
  // the site's working line: where his course runs now (the settled next slot), re-read when it moved on 30 amot or turned a corner
  function mkAnchor(m, st) {
    const s = settledSlot(st) || nextSlot(st.id);
    if (!s) return m.ok;
    // (toward the laid stones: beyond him in the working frame, which looks from the unlaid side — DIRECTOR13's wall frame looks
    //  from the laid side (C4), so at the wall they stand on the unlaid side, with his crane, behind the slot)
    let [ux, uz] = slotTangent(st.id, s); if (st.id === 'wall') { ux = -ux; uz = -uz; }
    if (!m.ok || Math.hypot(s.face[0] - m.ax, s.face[2] - m.az) > 30 || s.n[0] * m.nx + s.n[1] * m.nz < 0.9) {
      m.ax = s.face[0]; m.az = s.face[2]; m.nx = s.n[0]; m.nz = s.n[1]; m.ux = ux; m.uz = uz; m.ok = true;
      const run = mkRun(st, m);   // (a short run: the machines close up toward the slot, the shear-legs by the corner)
      // (the crews' crane 18 amot on — its hook and load over the course at the edge of his working frame; at the wall, with his big
      //  crane on the same side, 26 — the shear-legs a little farther, the sledge's run beside them)
      const aC0 = st.id === 'wall' ? 26 : 18;
      m.aC = Math.min(aC0, Math.max(8, run - 4)); m.aS = Math.min(38, Math.max(m.aC + 10, run + 6)); m.aL = Math.min(34, Math.max(12, run + 4));
      // (clear of the other sites standing there: at the Ulam the altar and the laver are its neighbours)
      const so = MK_OUT[st.id] || 15.5;
      m.oC = mkOut(st, m, [m.aC - 3, m.aC, m.aC + 3], [9.5, 15, 21], 6.5); m.oS = mkOut(st, m, [m.aS], [6, 12, 18], 3);
      m.so = mkOut(st, m, [m.aL - 34, m.aL - 23, m.aL - 12, m.aL], [so, so + 7, so + 14, so - 7], 2.5);
    }
    return true;
  }
  const mkAt = (m, along, out) => [m.ax + m.ux * along + m.nx * out, m.az + m.uz * along + m.nz * out];
  // how far the face runs on from the slot toward the laid stones (a probe just inside the face, 2 amot a step, ≤ 60)
  function mkRun(st, m) {
    const F = st.def.foot; let a = 0;
    for (let d = 2; d <= 60; d += 2) {
      const x = m.ax + m.ux * d - m.nx * 0.8, z = m.az + m.uz * d - m.nz * 0.8;
      if (!F.some((f) => x > f[0] - 0.3 && x < f[2] + 0.3 && z > f[1] - 0.3 && z < f[3] + 0.3)) break;
      a = d;
    }
    return a;
  }
  // per site: the sledge's lane out from the face (clear of the crews' masons and the carts' lane)
  const MK_OUT = { wall: 24, gates: 17, sorag: 17 };
  // is (x, z) with radius r clear of every other site that stands or is being built (the laver by the Ulam, the altar beside it…)?
  // (the Mount, the courts' wall and the Chel's ring are the ground everything stands on, not obstacles)
  function mkClear(st, x, z, r) {
    for (const o of list) {
      if (o === st || o.id === 'har' || o.id === 'wall' || o.id === 'sorag' || (o.status !== 'done' && o.status !== 'building')) continue;
      for (const f of o.def.foot) if (x > f[0] - r && x < f[2] + r && z > f[1] - r && z < f[3] + r) return false;
    }
    return true;
  }
  // the first of the outs that is clear at `along` (or along a run of alongs)
  function mkOut(st, m, alongs, outs, r) {
    for (const o of outs) if (alongs.every((a) => { const [x, z] = mkAt(m, a, o); return mkClear(st, x, z, r); })) return o;
    return outs[0];
  }
  function machinesUpdate(dt) {
    let k = 0;
    MK.nr = 0; MK.ns = 0; MK.nroll = 0;
    let changed = false;
    for (const st of list) {
      const want = MK_SITES.has(st.id) && st.status === 'building' && k < MK.N;   // (from the survey on: the owner sees a stage's first minutes)
      let m = MK.sites[st.id];
      if (!want) { if (m) { delete MK.sites[st.id]; changed = true; } continue; }
      if (!m) { m = MK.sites[st.id] = { st, ok: false, ax: 0, az: 0, nx: 0, nz: 1, ux: 1, uz: 0, t: R() * 10, ts: R() * 12, tl: R() * 36, wheelA: 0, ropeL: 5, walking: 0, dropped: false }; changed = true; }
      m.at = (m.at || 0) - dt;
      if (m.at <= 0 || !m.ok) { m.at = 0.5; mkAnchor(m, st); }   // (the course's line, twice a second: slots() allocates)
      if (!m.ok) continue;
      mkSite(m, st, k, dt); k++;
    }
    if (changed) workDirty = true;
    // (culled as a whole when none of its machines is in view: its bounding sphere follows them)
    for (const M of MK.all) { M.count = M === MK.roll ? MK.nroll : M === MK.ropes ? MK.nr : M === MK.stones ? MK.ns : k; M.visible = M.count > 0; if (M.count) { M.instanceMatrix.needsUpdate = true; M.computeBoundingSphere(); } }
  }
  function mkSite(m, st, k, dt) {
    m.t += dt * (m.boost > 0 ? 1.7 : 1) * (1 + 0.15 * JOBS.owned.machines); m.ts += dt * (1 + 0.15 * JOBS.owned.machines); m.tl += dt; if (m.boost > 0) m.boost -= dt;   // ── site14 ── (the treadwheel job: walked fast; her machines: busier)
    // ── the crews' treadwheel crane: on the ground out from the face, or on the rising wall once the course is above its reach
    const topY = revealY(st), H = 22;
    const [gx, gz] = mkAt(m, m.aC, m.oC), g0 = groundAt(gx, gz);
    const onTop = topY - g0 > H - 6;
    const [bx, bz] = onTop ? mkAt(m, m.aC, -6) : [gx, gz], by = onTop ? topY - 0.05 : g0;   // (on the wall: its 12-amah base clear of the face)
    const fx = onTop ? m.nx : -m.nx, fz = onTop ? m.nz : -m.nz, yaw = Math.atan2(fx, fz);
    const [pxp, pzp] = onTop ? mkAt(m, m.aC, 8) : mkAt(m, m.aC, m.oC - 4.9);   // the crews' pile under the jib at its pick angle
    const aP = Math.asin(clamp((Math.hypot(pxp - bx, pzp - bz) - 1.2) / H, 0.05, 0.7)), aW = Math.asin(clamp(((onTop ? 1.6 : m.oC + 0.9) - 1.2) / H, 0.03, 0.7));
    const tipH = (a) => by + 0.6 + H * Math.cos(a), tipR = (a) => 1.2 + H * Math.sin(a);
    const pickY = groundAt(pxp, pzp) + 0.55, placeY = Math.min(Math.max(topY, st.base) + 0.5, Math.min(tipH(aP), tipH(aW)) - 3.2), hi = Math.min(tipH(aP), tipH(aW)) - 3;
    const P = 10, t = m.t % P;
    let a, hy, carry = true;
    if (t < 3) { a = aP; hy = lerp(pickY, hi, easeIO(t / 3)); m.dropped = false; }
    else if (t < 4.6) { a = lerp(aP, aW, easeIO((t - 3) / 1.6)); hy = hi; }
    else if (t < 5.8) { a = aW; hy = lerp(hi, placeY, easeIO((t - 4.6) / 1.2)); }
    else if (t < 6.3) { a = aW; hy = placeY; if (!m.dropped) { m.dropped = true; const d = tipR(aW); dustBurst(bx + fx * d, placeY - 0.4, bz + fz * d, 4, 2.6, 1.6, 1); } }
    else if (t < 7.4) { a = aW; hy = lerp(placeY, hi, easeIO((t - 6.3) / 1.1)); carry = false; }
    else if (t < 8.6) { a = lerp(aW, aP, easeIO((t - 7.4) / 1.2)); hy = hi; carry = false; }
    else { a = aP; hy = lerp(hi, pickY, easeIO((t - 8.6) / 1.4)); carry = false; }
    const newL = tipH(a) - hy; m.wheelA += (newL - m.ropeL) / 0.9; m.walking = Math.abs(newL - m.ropeL) / Math.max(dt, 1e-4) > 0.3 ? 1 : 0; m.ropeL = newL;
    m.bx = bx; m.by = by; m.bz = bz; m.yaw = yaw; m.fx = fx; m.fz = fz;
    mkE.set(0, yaw, 0); mkQ.setFromEuler(mkE); mkV.set(bx, by, bz); mkM.compose(mkV, mkQ, ONE); MK.base.setMatrixAt(k, mkM);
    mkM2.makeTranslation(0, 4.6, -1.6); tmpM.makeRotationX(m.wheelA); mkM2.multiply(tmpM); tmpM.multiplyMatrices(mkM, mkM2); MK.wheel.setMatrixAt(k, tmpM);
    mkM2.makeTranslation(0, 0.6, 1.2); tmpM.makeRotationX(a); mkM2.multiply(tmpM); tmpM.makeScale(1, H / 20, 1); mkM2.multiply(tmpM); tmpM.multiplyMatrices(mkM, mkM2); MK.legs.setMatrixAt(k, tmpM);
    const tx = bx + fx * tipR(a), tz = bz + fz * tipR(a), ty = tipH(a);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), axx = bx - 1.6 * sy, axz = bz - 1.6 * cy;
    mkRope(axx, by + 4.6, axz, tx, ty, tz, 0.07);
    mkRope(tx, ty - 0.2, tz, tx, hy + 0.55, tz, 0.06);
    const sb = H * 0.55 + 4, sx0 = bx - fx * sb, sz0 = bz - fz * sb, sgy = onTop ? by : groundAt(sx0, sz0);
    mkRope(tx, ty, tz, sx0 + fz * 4, sgy, sz0 - fx * 4, 0.05); mkRope(tx, ty, tz, sx0 - fz * 4, sgy, sz0 + fx * 4, 0.05);
    if (carry) mkStone(tx, hy, tz, yaw, 2.0, 0.95, 1.25);
    mkStone(pxp - fz * 1.2, pickY - 0.05, pzp + fx * 1.2, yaw, 2.0, 0.95, 1.25);   // the next one waiting on the pile
    const mc = m.crane || (m.crane = {}); mc.tx = tx; mc.ty = ty; mc.tz = tz; mc.hy = hy; mc.pxp = pxp; mc.pzp = pzp; mc.pickY = pickY;
    // ── the shear-legs: two poles leaning over the course, a block raised on the fall by two men
    const [hx, hz] = mkAt(m, m.aS, m.oS), hgy = groundAt(hx, hz), tilt = 0.26, Hs = 11, syaw = Math.atan2(-m.nx, -m.nz);
    mkE.set(tilt, syaw, 0, 'YXZ'); mkQ.setFromEuler(mkE); mkV.set(hx, hgy, hz); mkS.set(1, Hs / 10, 1); mkM.compose(mkV, mkQ, mkS); MK.shear.setMatrixAt(k, mkM);
    const apx = hx - m.nx * Hs * Math.sin(tilt), apz = hz - m.nz * Hs * Math.sin(tilt), apy = hgy + Hs * Math.cos(tilt) * 0.955;
    const ts = m.ts % 12, lift = ts < 4 ? easeIO(ts / 4) : ts < 7 ? 1 : ts < 10 ? 1 - easeIO((ts - 7) / 3) : 0;
    const ly = groundAt(apx, apz) + 0.6 + lift * 6.2;
    mkRope(apx, apy, apz, apx, ly + 0.5, apz, 0.06);
    const [h1x, h1z] = mkAt(m, m.aS - 0.7, m.oS + 8.2);
    mkRope(apx, apy, apz, h1x, groundAt(h1x, h1z) + 1.55, h1z, 0.05);
    mkStone(apx, ly, apz, syaw, 2.4, 1.0, 1.4);
    (m.shear || (m.shear = {})).lift = ts < 4 ? 1 : 0;
    // ── the sledge on rollers: along the course, 15 amot out, levered and hauled; a new block every trip
    const u = (m.tl % 36) / 36, along = m.aL - 34 + 34 * u, so = m.so, [lx, lz] = mkAt(m, along, so), lgy = groundAt(lx, lz), lyaw = Math.atan2(m.ux, m.uz);
    mkE.set(0, lyaw, 0); mkQ.setFromEuler(mkE); mkV.set(lx, lgy + 0.25, lz); mkM.compose(mkV, mkQ, ONE); MK.sled.setMatrixAt(k, mkM);
    for (let r = 0; r < 3; r++) {
      if (MK.nroll >= MK.roll.instanceMatrix.count) break;
      const off = -2.4 + r * 2.4, rx = lx + m.ux * off, rz = lz + m.uz * off;
      mkE.set(along / 0.29, lyaw, 0, 'YXZ'); mkQ.setFromEuler(mkE); mkV.set(rx, lgy + 0.29, rz); mkM.compose(mkV, mkQ, ONE); MK.roll.setMatrixAt(MK.nroll++, mkM);
    }
    mkStone(lx, lgy + 1.95, lz, lyaw + Math.PI / 2, 4.4, 1.5, 1.8);
    const [p1x, p1z] = mkAt(m, along + 8, so);
    mkRope(lx + m.ux * 3.1, lgy + 0.9, lz + m.uz * 3.1, p1x, groundAt(p1x, p1z) + 1.5, p1z, 0.05);
    (m.sled || (m.sled = {})).along = along;
  }
  // where a man at the machines stands and how he moves (workersUpdate draws him)
  function mkMan(w, dt) {
    const P = MK.P, m = w.st && MK.sites[w.st.id];
    P.lean = 0.1; P.arm = -0.9; P.legA = 0; P.bob = 0;
    if (!m || !m.crane) { w.x = 0; w.z = 0; w.y = -500; return P; }
    const k = w.mk || 0;
    if (w.role === 'mkTread') {
      const cy = Math.cos(m.yaw), sy = Math.sin(m.yaw);
      w.x = m.bx - 1.6 * sy; w.z = m.bz - 1.6 * cy; w.y = m.by + 4.6 - 3.55; w.yaw = m.yaw + Math.PI;
      if (m.walking) { w.ph += dt * 7; P.legA = Math.sin(w.ph) * 0.5; P.bob = Math.abs(Math.cos(w.ph)) * 0.08; P.arm = -0.9 + Math.sin(w.ph) * 0.2; P.lean = 0.25; }
      else { P.arm = -0.9; P.lean = 0.15; }
    } else if (w.role === 'mkTag') {   // the tag-line man by the crews' pile, steadying the load
      const c = m.crane; w.x = c.pxp + m.ux * 2.4 + m.nx * 1.5; w.z = c.pzp + m.uz * 2.4 + m.nz * 1.5; w.y = groundAt(w.x, w.z);
      w.yaw = Math.atan2(c.tx - w.x, c.tz - w.z); w.ph += dt * 1.3; P.arm = -2.3 + Math.sin(w.ph) * 0.25; P.lean = -0.05;
    } else if (w.role === 'mkHaul') {   // two men on the shear-legs' fall: they lean back and step as the block goes up
      const [x, z] = mkAt(m, m.aS - 0.7 + k * 1.5, m.oS + 8.2 + k * 1.3); w.x = x; w.z = z; w.y = groundAt(x, z);
      w.yaw = Math.atan2(-m.nx, -m.nz); const on = m.shear.lift;
      w.ph += dt * (on ? 5 : 0.8); P.arm = -1.45 + (on ? Math.sin(w.ph) * 0.3 : 0); P.lean = on ? -0.3 + Math.sin(w.ph) * 0.06 : -0.08; P.legA = on ? Math.sin(w.ph) * 0.25 : 0;
    } else if (w.role === 'mkLever') {   // two men with levers behind the sledge
      const a = m.sled.along - 4.3, [x, z] = mkAt(m, a, m.so + (k ? 1.0 : -1.0)); w.x = x; w.z = z; w.y = groundAt(x, z);
      w.yaw = Math.atan2(m.ux, m.uz); w.ph += dt * 3.2; const s = Math.sin(w.ph + k * 1.6);
      P.lean = 0.45 + s * 0.12; P.arm = -0.5 + s * 0.35; P.legA = s * 0.2;
    } else if (w.role === 'mkPull') {   // two men hauling the sledge's rope ahead of it
      const a = m.sled.along + 8 + k * 1.6, [x, z] = mkAt(m, a, m.so + (k ? 0.7 : -0.7)); w.x = x; w.z = z; w.y = groundAt(x, z);
      w.yaw = Math.atan2(m.ux, m.uz); w.ph += dt * 4.2; P.lean = 0.42; P.arm = -0.35 + Math.sin(w.ph) * 0.15; P.legA = Math.sin(w.ph + k) * 0.45; P.bob = Math.abs(Math.cos(w.ph)) * 0.06;
    }
    return P;
  }
  MK.man = mkMan;
  // ── /site13 ──

  // ── hero (PEOPLE) ── the hero runtime: walking, the strokes, the workpiece, the API
  /* ── the hero ── PEOPLE, wave 6: every stroke lands on a real stone.
     A stroke: the feet are planted at the tool's reach (one small step at most), the whole body rises in anticipation, the
     downswing accelerates so the tool's head (or the chisel's edge) meets the target ON the contact frame, a small recoil,
     the follow-through, a weight shift and a breath. The arms are two-bone IK every frame toward keyed wrist targets; the
     downswing is a rotation of the contact pose round the shoulder (or the elbow, for the mallet), so the contact key is
     exact. Chips, dust and sparks start at the contact point. Kinds: dress (the iron hammer on a rough stone; mallet and
     chisel on the margins and the boss) · tamp (the wooden mallet; the altar's whole stones take no iron, Middot 3:4) ·
     split (the sledge on the quarry's wedges) · pick (a boulder, the quarry block, bedrock) · measure (the plumb line) ·
     pull (a rope) · carry (a whole stone lifted in both arms). No allocations per frame. */
  const HB = buildHero(), HN = HB.bones, HSt = HB.stone;
  HB.wpRoot.scale.setScalar(HERO_S); HB.wpRoot.visible = true; scene.add(HB.wpRoot);
  const hero = { mesh: HB.mesh, ring: HB.ring, b: HN, x: 150, y: 0, z: -96, yaw: -0.4, vis: false, path: null, seg: 0, speed: 11, walkAmt: 0, ph: 0,
    fade: 1, door: null, resolve: null, region: 'out', at: null, face: null, scale: HERO_S, breath: 0, tool: 'wood', mote: 0,
    stroke: null, queue: null, work: 0, idle: 0, lastHit: -9, contact: new THREE.Vector3(), hitHex: '#CFC3A8', held: 'mallet', chiselOn: 0,
    step: null, glance: 0, glanceT: 2.5, glanceK: 0, shift: 0 };
  hero.mesh.scale.setScalar(HERO_S); hero.ring.scale.setScalar(HERO_S * 3.2);
  scene.add(hero.mesh, hero.ring);
  hero.mesh.visible = hero.ring.visible = false;
  // the nav chain between the regions: platform/hill → Chel → Ezrat Nashim → (Nikanor) → Azara
  const HUB = { out: [192, 0], chel: [155.5, 0], enE: [130, 0], enW: [25, 0], nik: [11.5, 0], azE: [-6, 0], az: [-15, 0] };
  const CHAIN = ['out', 'chel', 'enE', 'enW', 'nik', 'azE', 'az'];
  const REG_NODE = { out: 'out', chel: 'chel', en: 'enE', az: 'az' };
  // ── site14 ── (the probe: "nikanor courses — feet 6, the gate's courses 2 over them": he walked through the gatehouse rising on
  // his line) a gate being built is passed like a built one: he fades through its line
  const gateUp = (id) => isDone(id) || (ST[id] && ST[id].status === 'building' && ST[id].group.visible);
  const doorAfter = { chel: () => gateUp('gates'), nik: () => gateUp('nikanor') };   // the segment leaving this node passes a gate
  function spotFor(target) {
    if (typeof target === 'string' && DEF[target]) { const s = DEF[target].spot; return { x: s.x, z: s.z, fx: s.face[0], fz: s.face[1], r: s.r, key: target }; }
    if (target === 'quarry') return { x: QSPOT.x, z: QSPOT.z, fx: QSPOT.face[0], fz: QSPOT.face[1], r: 'out', key: 'quarry' };
    if (target && target.boulder !== undefined) {
      const b = bSt[target.boulder]; if (!b) return null;
      let dx = hero.x - b.x, dz = hero.z - b.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      // (stand where the pick's point meets the rock's side at the tool's reach: the stroke then needs no step)
      const hy = 1.25 * HERO_S + 0.12 * b.r, k = Math.sqrt(Math.max(0.05, 1 - (hy / (b.r * b.sy)) ** 2)), r = b.r * k + 2.1 * HERO_S;
      return { x: b.x + dx * r, z: b.z + dz * r, fx: b.x, fz: b.z, r: 'out', key: 'b' + target.boulder };
    }
    if (target && target.x !== undefined) {
      const f = Array.isArray(target.face) ? target.face : null;
      return { x: target.x, z: target.z, fx: f ? f[0] : target.faceX ?? target.x + 1, fz: f ? f[1] : target.faceZ ?? target.z, r: target.region || regionOf(target.x, target.z), key: target.key || null, stone: target.stone || null };
    }
    return null;
  }
  function regionOf(x, z) {
    if (!isDone('wall')) return 'out';
    if (x > -187 && x < 0 && Math.abs(z) < 67.5) return 'az';
    if (x > 6 && x < 141 && Math.abs(z) < 67.5) return 'en';
    if (x > -212 && x < 166 && Math.abs(z) < 92) return 'chel';
    return 'out';
  }
  // inside the Azara the hero keeps to the aisles: north/south of the Heichal, south of the kevesh
  // on the Chel ring the hero goes round the corners of Ezrat Nashim instead of through its walls
  // ── site13 ── (N76 b) on the altar's top or its kevesh: round the south and up the kevesh (never through the altar's side)
  const onAltar = (x, z) => isDone('guf') && ((x > -52.3 && x < -23.7 && z > -17.8 && z < 10.8) || (x > -46 && x < -30 && z >= 10.8 && z < 42.5));
  const segXZ = (x0, z0, x1, z1, bx0, bz0, bx1, bz1) => {   // does the segment pass over the box [bx0, bz0, bx1, bz1] (a slab test)
    let t0 = 0, t1 = 1; const dx = x1 - x0, dz = z1 - z0;
    for (const [p, q] of [[-dx, x0 - bx0], [dx, bx1 - x0], [-dz, z0 - bz0], [dz, bz1 - z0]]) {
      if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
      const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t0 < t1;
  };
  const crossAltar = (x0, z0, x1, z1) => segXZ(x0, z0, x1, z1, -54.5, -20, -21.5, 13);
  // ── site13 ── (PRODUCER13 19:40, "SITE13 · route": "a 63-amah heroReturn walked as 193 amot — the long walks still loop through
  // the hub") inside one region he walks straight unless the line passes over something standing there: in the Azara the
  // House, the altar and its kevesh, the chamber north of the altar and the laver; on the Chel ring the courts; in the Ezrat
  // Nashim its corner chambers. Then the hub and the corner detours, as before.
  const upOr = (id) => ST[id] && (ST[id].status === 'building' || ST[id].status === 'done');
  function regionBoxes(r) {
    const B = [];
    if (r === 'az') {
      if (upOr('ulam')) B.push([-93, -51, -70.6, 51]);
      if (upOr('heichal') || upOr('kodesh')) B.push([-177, -36, -91, 36]);
      if (upOr('yesod')) B.push([-54.5, -20, -21.5, 13]);
      if (upOr('guf')) B.push([-46.5, 12, -29.5, 43]);
      if (upOr('lishka')) B.push([-54.5, -62.5, -21.5, -26.5]);
      if (upOr('kiyor')) B.push([-67, 16.5, -60, 23.5]);
    } else if (r === 'chel') B.push([-194, -74.5, 148, 74.5]);
    else if (r === 'en' && upOr('nashim')) B.push([5, -68, 47, -27], [100, -68, 142, -27], [5, 27, 47, 68], [100, 27, 142, 68]);
    return B;
  }
  // (a box he stands in or at the edge of — a chamber he works in, his banker by a wall — is no obstacle to leaving it)
  const inB = (b, x, z) => x > b[0] - 1.2 && x < b[2] + 1.2 && z > b[1] - 1.2 && z < b[3] + 1.2;
  function regionBlocked(r, x0, z0, x1, z1, B = regionBoxes(r)) {
    return B.some((b) => !inB(b, x0, z0) && !inB(b, x1, z1) && segXZ(x0, z0, x1, z1, b[0], b[1], b[2], b[3]));
  }
  // ── site13 ── (PRODUCER13 N87, N90: "44 amot walked as 223", "33 as 230" — round the House by the hub, out and back) in the Azara a
  // walk round what stands there goes by its open aisles: the shortest way through one or two of these corner points, each leg
  // clear (checked offline on the producer's walks: 33 → 44 amot, 44 → 42, 63 → 63; the Heichal's north from the hub 111 → 169);
  // none found: the old way by the hub and the corner detours
  const AZ_WP = [[-15, 0], [-15, -24], [-15, 24], [-15, 55], [-15, -65], [-38, 55], [-60, -65], [-65, 56], [-62, -56], [-59, -24], [-58, 27], [-59, 0],
    [-100, 58], [-100, -58], [-140, 58], [-140, -58], [-181, 58], [-181, -58], [-181, 0]];
  function azPath(x0, z0, x1, z1) {
    const B = regionBoxes('az'), blk = (a, b, c, e) => regionBlocked('az', a, b, c, e, B);
    const W = AZ_WP.filter((w) => !B.some((b) => w[0] > b[0] && w[0] < b[2] && w[1] > b[1] && w[1] < b[3]));
    let best = null, bl = 1e9;
    for (const a of W) {
      if (blk(x0, z0, a[0], a[1])) continue;
      const la = Math.hypot(a[0] - x0, a[1] - z0);
      if (!blk(a[0], a[1], x1, z1)) { const L = la + Math.hypot(x1 - a[0], z1 - a[1]); if (L < bl) { bl = L; best = [a]; } continue; }
      for (const c of W) {
        if (c === a || blk(a[0], a[1], c[0], c[1]) || blk(c[0], c[1], x1, z1)) continue;
        const L = la + Math.hypot(c[0] - a[0], c[1] - a[1]) + Math.hypot(x1 - c[0], z1 - c[1]); if (L < bl) { bl = L; best = [a, c]; }
      }
    }
    return best;
  }
  const detourAz = (x, z) => (onAltar(x, z) ? (z < 10.8 ? [[-15, 47], [-38, 47], [-38, 11]] : [[-15, 47], [-38, 47]]) :
    x < -20 && z <= -30 ? [[-15, -53], [x, -53]] : x < -95 && z >= 30 ? [[-15, 53], [x, 53]] : x < -40 && z > 15 ? [[-15, 47], [x, 47]] : []);
  const detourChel = (x, z) => (Math.abs(z) > 60 && x < 150 ? [[155.5, Math.sign(z) * 79], [x, Math.sign(z) * 79]] : []);
  const detour = (r, x, z) => (r === 'az' ? detourAz(x, z) : r === 'chel' ? detourChel(x, z) : []);
  function route(sp, x0 = hero.x, z0 = hero.z) {
    const pts = [];
    const walls = isDone('wall');
    const fromR = walls ? regionOf(x0, z0) : 'out', toR = walls ? sp.r : 'out';
    // (supervisor, 30.9 · PRODUCER13a: "stood and moved side to side for no reason") a short step inside one region goes straight:
    // through the region's hub and both ends' detours a 4-amah step to the crews' next slot became a 236-amah loop out of the
    // frame and back, every few seconds at the demo's ×60
    // (── site13 ── not over the altar's side: on its top both ends, or neither and not across it)
    const aF = onAltar(x0, z0), aT = onAltar(sp.x, sp.z);
    if (fromR === toR && Math.hypot(sp.x - x0, sp.z - z0) <= 20 && aF === aT && (aF || !crossAltar(x0, z0, sp.x, sp.z))) { pts.push({ x: sp.x, z: sp.z }); return pts; }
    if (fromR === toR && !aF && !aT && !regionBlocked(fromR, x0, z0, sp.x, sp.z)) { pts.push({ x: sp.x, z: sp.z }); return pts; }   // ── site13 ──
    if (fromR === 'az' && toR === 'az' && !aF && !aT) { const w = azPath(x0, z0, sp.x, sp.z); if (w) { for (const [x, z] of w) pts.push({ x, z }); pts.push({ x: sp.x, z: sp.z }); return pts; } }   // ── site13 ──
    for (const [x, z] of detour(fromR, x0, z0).reverse()) pts.push({ x, z });
    if (fromR !== toR) {
      let i = CHAIN.indexOf(REG_NODE[fromR]), j = CHAIN.indexOf(REG_NODE[toR]);
      if (fromR === 'en' && x0 < 80) i = CHAIN.indexOf('enW');
      if (toR === 'en' && sp.x < 80) j = CHAIN.indexOf('enW');
      const stepD = i < j ? 1 : -1, c0 = pts.length;
      for (let k = i; ; k += stepD) {
        const node = CHAIN[k], [x, z] = HUB[node];
        const nxt = CHAIN[k + stepD];
        pts.push({ x, z, door: false, node });
        if (k === j) break;
        // a gate between this node and the next: fade through it
        const gateNode = stepD > 0 ? node : nxt;
        if (doorAfter[gateNode] && doorAfter[gateNode]()) pts[pts.length - 1].doorNext = true;
      }
      // ── site13 ── (PRODUCER13 20:03: "nikanor: 77 amot for 21" — a step across the gate ran out to each court's hub and back) a
      // court's own hub (the Ezrat Nashim's west one, the Azara's) is skipped when the line past it is clear: through the gate
      const pureHub = (q) => q && (q.node === 'enW' || q.node === 'az') && !q.doorNext;
      if (pts.length - c0 >= 2 && c0 === 0 && pureHub(pts[0]) && !regionBlocked(fromR, x0, z0, pts[1].x, pts[1].z)) pts.shift();
      const last = pts[pts.length - 1], prev = pts[pts.length - 2] || { x: x0, z: z0 };
      if (pts.length >= 2 && pureHub(last) && !detour(toR, sp.x, sp.z).length && !regionBlocked(toR, prev.x, prev.z, sp.x, sp.z)) pts.pop();
    } else if ((toR === 'az' || toR === 'chel') && fromR === toR) {
      const h = HUB[toR]; pts.push({ x: h[0], z: h[1] });
    }
    for (const [x, z] of detour(toR, sp.x, sp.z)) pts.push({ x, z });
    pts.push({ x: sp.x, z: sp.z });
    return pts;
  }
  // ── nav19 ── every walk the game asks for, kept for the tests and the audit: [t, from, to, way's length, straight, legs, twin, kind]
  const NAV_LOG = [];
  function navLog(sp, L, n) { NAV_LOG.push([Math.round(time * 10) / 10, Math.round(hero.x), Math.round(hero.z), Math.round(sp.x), Math.round(sp.z), Math.round(L * 10) / 10, Math.round(Math.hypot(sp.x - hero.x, sp.z - hero.z) * 10) / 10, n, TWD.twin ? 1 : 0, sp.key || '', hero.dash || 0]); if (NAV_LOG.length > 60) NAV_LOG.shift(); }
  // ── /nav19 ──
  const NAV_DIRECT = 14, NAV_V = 33, NAV_T = 1.4;   // ── nav19 ── (a straight step under two thumbs ≤ 14 amot · the compass: 33 amot/s, ≤ 1.4 s) ── /nav19 ──
  function heroWalkTo(target) {
    const sp = spotFor(target);
    if (!sp) return Promise.resolve(false);
    if (TWD.on) return Promise.resolve(false);   // ── twin17 ── (the left thumb has him: a walk the game asks for meanwhile is not taken — the stroke lands where he is) ── /twin17 ──
    if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); }
    heroCancel();
    hero.vis = true; hero.mesh.visible = hero.ring.visible = true;
    let pts = route(sp);
    // ── nav19 ── (the owner 7.10 01:31 "הרבה הליכות מיותרות", note 16: a stroke at the Ezrat Nashim's banker walked him round the court
    // by its hubs) under two thumbs a short step the game asks for goes STRAIGHT when his own feet could take it: no hub, no loop
    // (and a way that goes ROUND — more than 2.5 times the straight line and over 30 amot: a wall rising between him and his banker, he
    // inside the court and it outside — is never walked for a job under two thumbs: he steps over as through a gate, out and in, 0.44 s)
    hero.dash = 0;
    if (TWD.twin) {
      const d0 = Math.hypot(sp.x - hero.x, sp.z - hero.z);
      if (d0 <= NAV_DIRECT && twinLine(hero.x, hero.z, sp.x, sp.z).d < 0.8) pts = [{ x: sp.x, z: sp.z }];
      else if (!inR(TW_KODESH, sp.x, sp.z)) { let L0 = 0, qx = hero.x, qz = hero.z; for (const p of pts) { L0 += Math.hypot(p.x - qx, p.z - qz); qx = p.x; qz = p.z; } if (L0 > Math.max(30, d0 * 2.5)) { hero.door = { phase: 0, t: 0, x: sp.x, z: sp.z }; pts = [{ x: sp.x, z: sp.z }]; hero.dash = 2; } }
    }
    // ── /nav19 ──
    { const w = s20Way(sp); if (w) { pts = w; hero.door = null; hero.dash = 0; } }   // ── site20 ── (up the wall's ramp) ── /site20 ──
    let L = 0, px = hero.x, pz = hero.z; for (const p of pts) { L += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; }
    navLog(sp, L, pts.length);   // ── nav19 ── (the walk audit's ring) ── /nav19 ──
    if (TWD.twin && L > 14) return heroDash(target);   // ── stages21 ── (kid run: the saw's walk to its bench ran 2 s, by himself) under two thumbs a way over 14 amot a craft or a job asks for is the compass's — ≤ 1.5 s, a dust trail or a fade ── /stages21 ──
    hero.speed = clamp(L / 5.5, 11, 30);
    hero.path = pts; hero.seg = 0; hero.face = [sp.fx, sp.fz]; hero.target = sp;
    return new Promise((res) => { hero.resolve = res; });
  }
  function heroPlace(target) {
    const sp = spotFor(target); if (!sp) return;
    if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); }
    heroCancel();
    hero.path = null; hero.x = sp.x; hero.z = sp.z; hero.y = groundAt(sp.x, sp.z); hero.at = sp.key; hero.region = sp.r;
    hero.yaw = Math.atan2(sp.fx - sp.x, sp.fz - sp.z); hero.face = null;
    hero.vis = true; hero.mesh.visible = hero.ring.visible = true;
    wpArrive(sp);
  }
  // ── twin17 ── (the owner, 5.10: "באחד זז ובשני מכה") the kohen walked by the left thumb (src/game/twin.js): a velocity on the
  // ground (amot/s, world axes), never through what stands — a ground step over an amah (a wall, a ledge, the bay's side), a
  // standing rock, the lifting crane's base, a treadwheel crane, the Mount's stock. Already inside one: only a step out of it.
  const TWD = { vx: 0, vz: 0, on: false, blocked: 0, freed: 0, sx: 1e9, sz: 1e9, st: 0, cx: 0, cz: 0, cr: 0, site: 'har', side: 1, rock: false };   // ── twin18 ── (side, rock: round a rock) ── /twin18 ──
  const TW_TURN = [0.6, 1.1, 1.5];   // ── twin18 ── (round a rock: the turns tried, radians) ── /twin18 ──
  // ── twin18 ── every stage: the solids the thumb never walks into once they stand (the House, the chambers, the gatehouses, the laver),
  // and the Kodesh HaKodashim's block always — the player never enters it (PROJECT.md §2.5). Inside one already: in it or out, never in.
  const TW_SOLID = ['ulam', 'heichal', 'kodesh', 'lishka', 'kiyor', 'gates'], TW_KODESH = [-176, -35, -139, 35];
  const inR = (f, x, z) => x > f[0] && x < f[2] && z > f[1] && z < f[3];
  function twinSolid(x, z, x0, z0) {
    if (TWD.pass && TWD.pass(x, z)) return false;   // ── recovered (build 26) ── (where day33 lets him through — world22's Ulam and Heichal)
    if (inR(TW_KODESH, x, z) && !inR(TW_KODESH, x0, z0)) return true;
    for (let i = 0; i < TW_SOLID.length; i++) {
      const st = ST[TW_SOLID[i]]; if (!st || (st.status !== 'building' && st.status !== 'done') || !st.def || !st.def.foot) continue;
      const F = st.def.foot; for (let k = 0; k < F.length; k++) if (inR(F[k], x, z) && !inR(F[k], x0, z0)) return true;
    }
    return false;
  }
  // ── /twin18 ──
  const twinCirc = (x, z, x0, z0, cx, cz, r) => { const d1 = Math.hypot(x - cx, z - cz); return d1 < r && d1 < Math.hypot(x0 - cx, z0 - cz) - 1e-4; };
  function twinFree(x, z, x0, z0) {
    const g0 = groundAt(x0, z0), g1 = groundAt(x, z);
    TWD.rock = false;   // ── twin18 ── (what stopped him: a round thing — he may go round it) ── /twin18 ──
    if (!Number.isFinite(g1) || g1 - g0 > 1.05) return false;   // (up a wall or a ledge: never; down off a ledge: he hops, as a walk fades over an edge)
    if (S20.act && g0 - g1 > 1.05 && s20Top(x0, z0) > -1e8 && !(s20Top(x, z) > -1e8)) return false;   // ── site20 ── (the top's and the ramp's edges are walls: never off the wall) ── /site20 ──
    TWD.rock = true;   // ── twin18 ── ── /twin18 ──
    for (let i = 0; i < bSt.length; i++) { const b = bSt[i]; if (b.state > 0 && twinCirc(x, z, x0, z0, b.x, b.z, b.r * 0.92 + 0.8)) return false; }
    if (crane.st && Number.isFinite(crane.bx) && twinCirc(x, z, x0, z0, crane.bx, crane.bz, 3.4)) return false;
    for (const id in MK.sites) { const m = MK.sites[id]; if (m && m.ok && Number.isFinite(m.bx) && twinCirc(x, z, x0, z0, m.bx, m.bz, 4.2)) return false; }
    if (TWD.cr > 0 && twinCirc(x, z, x0, z0, TWD.cx, TWD.cz, TWD.cr)) return false;
    TWD.rock = false;   // ── twin18 ── ── /twin18 ──
    if (twinSolid(x, z, x0, z0)) return false;   // ── twin18 ── ── /twin18 ──
    if (TWD.xtra && TWD.xtra(x, z, x0, z0)) return false;   // ── engine22 ── (Phase B: the Temple's walls, the altar, the courts' bounds — src/avodah/day) ── /engine22 ──
    return true;
  }
  /** one frame of the thumb's walk → moved (the stride plays) */
  function twinStep(H, dt) {
    const sp = Math.hypot(TWD.vx, TWD.vz); if (sp < 0.01) return false;
    // (the stock's pile, read twice a second: workSpot allocates)
    if ((TWD.st -= dt) <= 0) { TWD.st = 0.5; TWD.cr = 0; try { const sid = TWD.site || 'har', s = ST[sid] && ST[sid].status === 'building' ? workSpot(sid, 'stock') : null; if (s && Array.isArray(s.face)) { TWD.cx = s.face[0]; TWD.cz = s.face[1]; TWD.cr = 2.6; } } catch (e) { /* no stock */ } }   // ── twin18 ── (sid: the stock of the stage he works at) ── /twin18 ──
    const ux = TWD.vx / sp, uz = TWD.vz / sp;
    let left = sp * Math.min(dt, 0.6), moved = false;
    for (let g = 0; g < 40 && left > 1e-4; g++) {
      const s = Math.min(0.45, left); left -= s;
      if (twinFree(H.x + ux * s, H.z + uz * s, H.x, H.z)) { H.x += ux * s; H.z += uz * s; moved = true; continue; }
      const rk = TWD.rock;   // ── twin18 ── ── /twin18 ──
      if (Math.abs(ux) > 0.25 && twinFree(H.x + ux * s, H.z, H.x, H.z)) { H.x += ux * s * Math.abs(ux); moved = true; continue; }   // (along the wall)
      if (Math.abs(uz) > 0.25 && twinFree(H.x, H.z + uz * s, H.x, H.z)) { H.z += uz * s * Math.abs(uz); moved = true; continue; }
      // ── twin18 ── (kid17: a drag straight at a rock stopped him dead — both axes go deeper into a circle) round it: the nearest turn of
      // the thumb's way that is free (the side he took last first, so he never dithers), at no less than half his pace
      // (a wall or a ledge met head-on: he stops there, as before — only a slant along it, never a sideways walk)
      { const nT = rk ? 6 : 4; let ok = false; for (let q = 0; q < nT && !ok; q++) { const a = TW_TURN[q >> 1] * ((q & 1) ? -TWD.side : TWD.side), c = Math.cos(a), sn = Math.sin(a), rx = ux * c - uz * sn, rz = ux * sn + uz * c, k = s * Math.max(0.55, c);
        if (twinFree(H.x + rx * k, H.z + rz * k, H.x, H.z)) { H.x += rx * k; H.z += rz * k; if (q & 1) TWD.side = -TWD.side; ok = true; } }
        if (ok) { moved = true; continue; } }
      // ── /twin18 ──
      // (fix round, kid17 "stuck at the bench": boxed in — no way out of where he stands in any of 8 directions — the thumb always walks
      //  him out: this step is taken whatever stands there)
      let way = false; for (let q = 0; q < 8 && !way; q++) { const a = q * 0.7854; way = twinFree(H.x + Math.cos(a) * 0.45, H.z + Math.sin(a) * 0.45, H.x, H.z); }
      if (!way) { H.x += ux * s; H.z += uz * s; moved = true; TWD.freed++; continue; }
      TWD.blocked++; break;
    }
    const want = Math.atan2(ux, uz); let dy = want - H.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); H.yaw += dy * Math.min(1, dt * 14);
    H.speed = clamp(sp, 4, 30);
    if (moved) { H.at = null; H.region = regionOf(H.x, H.z); }
    return moved;
  }
  /** (fix round) where his feet can get to by the thumb's own rules: a greedy search on a 1.5-amah grid from (x0, z0) toward (x1, z1)
      (each step checked in thirds, as the walk does) → the reachable cell nearest the target { x, z, d: its distance, n } */
  const TW_D4 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function twinReach(x0, z0, x1, z1, max = 700) {
    // (the straight line first, as the walk takes it: most markers are in plain sight of his feet — no search)
    { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(L / 0.45); let px = x0, pz = z0, ok = true;
      for (let k = 1; k <= n && ok; k++) { const nx = x0 + (x1 - x0) * k / n, nz = z0 + (z1 - z0) * k / n; ok = twinFree(nx, nz, px, pz); px = nx; pz = nz; }
      if (ok) return { x: x1, z: z1, d: 0, n: 0 }; }
    const S = 1.5, seen = new Set(['0,0']), fr = [];
    const h = (i, j) => Math.hypot(x0 + i * S - x1, z0 + j * S - z1);
    fr.push([0, 0, h(0, 0)]);
    let bi = 0, bj = 0, bh = h(0, 0), n = 0;
    while (fr.length && n++ < max) {
      let k = 0; for (let q = 1; q < fr.length; q++) if (fr[q][2] < fr[k][2]) k = q;
      const c = fr[k]; fr[k] = fr[fr.length - 1]; fr.pop();
      if (c[2] < bh) { bh = c[2]; bi = c[0]; bj = c[1]; }
      if (c[2] < S) break;
      const xa = x0 + c[0] * S, za = z0 + c[1] * S;
      for (const [di, dj] of TW_D4) {
        const a = c[0] + di, b = c[1] + dj, id = a + ',' + b; if (seen.has(id)) continue;
        const xb = x0 + a * S, zb = z0 + b * S; let ok = true, px = xa, pz = za;
        for (let s = 1; s <= 3 && ok; s++) { const nx = xa + (xb - xa) * s / 3, nz = za + (zb - za) * s / 3; ok = twinFree(nx, nz, px, pz); px = nx; pz = nz; }
        if (!ok) continue;
        seen.add(id); fr.push([a, b, h(a, b)]);
      }
    }
    return { x: x0 + bi * S, z: z0 + bj * S, d: bh, n };
  }
  // ── twin18 ── the last point a straight drag from (x0, z0) toward (x1, z1) reaches by the walk's own rules (a kid drags straight at a
  // marker: it stands there, where a straight drag gets him) → { x, z, d: what is left to the target }
  function twinLine(x0, z0, x1, z1) {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 0.45)); let px = x0, pz = z0;
    for (let k = 1; k <= n; k++) { const nx = x0 + (x1 - x0) * k / n, nz = z0 + (z1 - z0) * k / n; if (!twinFree(nx, nz, px, pz)) break; px = nx; pz = nz; }
    return { x: px, z: pz, d: Math.hypot(x1 - px, z1 - pz) };
  }
  // ── /twin18 ──
  function heroDrive(vx, vz) {
    const sm29 = hero.speedMul > 0 ? hero.speedMul : 1;   // ── shift29 ── (the shift's run: ×1.8 — shift/walk.js sets stages.hero.speedMul) ── /shift29 ──
    const x = Number.isFinite(+vx) ? +vx * sm29 : 0, z = Number.isFinite(+vz) ? +vz * sm29 : 0, on = Math.hypot(x, z) > 0.01;
    // (the thumb takes him: a walk the game asked for ends where he is — its promise says no — but a stroke goes on: both thumbs at once)
    if (on && !TWD.on) { if (hero.path) { hero.path = null; if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); } } hero.face = null; hero.vis = true; hero.mesh.visible = hero.ring.visible = true; }
    TWD.vx = x; TWD.vz = z; TWD.on = on;
  }
  // ── /twin17 ──
  // ── nav19 ── (note 3: "לחיצה על המצפן אמורה להעביר את השחקן לנקודת המשחק") the compass brings him to his work in ≤ 1.5 s: the
  // way the game walks (route), at three times his pace with a dust trail when it fits in 1.4 s; else a fade out where he is and in at
  // his work (as through a gate). Never into the Kodesh HaKodashim. → Promise<bool> (arrived, faced) · hero.dash: 1 walk, 2 fade
  function heroDash(target) {
    const sp = spotFor(target);
    if (!sp || !Number.isFinite(sp.x) || inR(TW_KODESH, sp.x, sp.z)) return Promise.resolve(false);
    TWD.vx = TWD.vz = 0; TWD.on = false;
    if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); }
    heroCancel(); hero.door = null; hero.fade = 1;
    hero.vis = true; hero.mesh.visible = hero.ring.visible = true;
    let pts = Math.hypot(sp.x - hero.x, sp.z - hero.z) <= NAV_DIRECT * 2 && twinLine(hero.x, hero.z, sp.x, sp.z).d < 0.8 ? [{ x: sp.x, z: sp.z }] : route(sp);
    let L = 0, px = hero.x, pz = hero.z; for (const p of pts) { L += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; }
    { const w = s20Way(sp); if (w) { pts = w; L = 0; px = hero.x; pz = hero.z; for (const p of pts) { L += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; } } }   // ── site20 ── (up the wall's ramp: ≤ 3 s) ── /site20 ──
    if (pts.some((p) => p.doorNext) || (L / NAV_V > NAV_T && !(pts.length === 3 && s20Top(sp.x, sp.z) > -1e8 && L / NAV_V < 3))) { hero.door = { phase: 0, t: 0, x: sp.x, z: sp.z }; pts = [{ x: sp.x, z: sp.z }]; hero.dash = 2; hero.speed = 11; }
    else { hero.dash = 1; hero.speed = Math.max(NAV_V, L / NAV_T); }
    hero.dashT = 0; hero.path = pts; hero.seg = 0; hero.face = [sp.fx, sp.fz]; hero.target = sp;
    return new Promise((res) => { hero.resolve = res; });
  }
  // ── /nav19 ──

  /* ── the workpiece: the banker and the stone in front of the hero's work spot ──
     states rough → drafted → dressed (a building stone), 'quarry' (a block wedged in the bedrock), 'field' (a whole stone for
     the altar), null (none). auto: the old one-tap flow — the stone advances by itself as he dresses it, and a finished stone
     makes way for the next; BUILD's workpiece(state) takes over (auto off). */
  const WP_STATES = { rough: 'wpRough', drafted: 'wpDrafted', dressed: 'wpDressed', quarry: 'wpQuarry', field: 'wpField' };
  const wp = { state: null, auto: true, x: 0, y: 0, z: 0, yaw: 0, key: null, n: 0, pop: 0, i: 0 };
  function wpPlace(x, z, yaw) { wp.x = x; wp.z = z; wp.yaw = yaw; wp.y = groundAt(x, z); if (JOBS.owned.lamps) propsDirty = true; }   // ── site14 ── (her lamps move with the banker)
  // in front of feet at (x, z) facing yaw: the stone's centre 2.05 ahead and 0.25 to his right (model units × HERO_S)
  function wpFront(x, z, yaw) { const c = Math.cos(yaw), s = Math.sin(yaw), mx = -0.25 * HERO_S, mz = 2.05 * HERO_S; wpPlace(x + mx * c + mz * s, z - mx * s + mz * c, yaw); }
  function wpSet(state, silent) {
    const s = state && WP_STATES[state] ? state : null;
    if (s === wp.state) return;
    const was = wp.state; wp.state = s; wp.n = 0;
    if (!silent && hero.vis && (s || was)) { wp.pop = 1; dustBurst(wp.x, wp.y + 1.6 * HERO_S, wp.z, 5, 2.4, 1.8, 1.2); }
  }
  function wpDefault(key) {
    if (key === 'quarry') return 'quarry';
    if (key && key[0] === 'b') return null;                 // the boulders: no banker
    if (hero.tool === 'wood' && DEF[key] && DEF[key].stone === 'field') return 'field';
    return DEF[key] ? 'rough' : null;
  }
  // arriving at a work spot (auto mode): the banker is set up in front of him (a site's own stone is dressed there)
  function wpArrive(sp) {
    if (!sp || !wp.auto) return;
    const yaw = Math.atan2(sp.fx - sp.x, sp.fz - sp.z);
    if (sp.stone && typeof sp.stone.x === 'number') wpPlace(sp.stone.x, sp.stone.z, typeof sp.stone.yaw === 'number' ? sp.stone.yaw : yaw);
    else if (sp.key === 'quarry') { const c = Math.cos(yaw), s = Math.sin(yaw), mz = 1.95 * HERO_S; wpPlace(sp.x + mz * s, sp.z + mz * c, yaw); }
    else wpFront(sp.x, sp.z, yaw);
    const st = sp.key ? wpDefault(sp.key) : wp.state || 'rough';
    wp.state = null; wpSet(st, true); wp.pop = st ? 1 : 0;
  }

  /* ── model space (the bind pose: he faces +z, his left is +x) ↔ world ── */
  const S_ = HERO_S;
  function m2w(m, out) { const c = Math.cos(hero.yaw), s = Math.sin(hero.yaw); return out.set(hero.x + (m.x * c + m.z * s) * S_, hero.y + m.y * S_, hero.z + (-m.x * s + m.z * c) * S_); }
  function w2m(w, out, x = hero.x, y = hero.y, z = hero.z, yaw = hero.yaw) { const c = Math.cos(yaw), s = Math.sin(yaw), dx = w.x - x, dz = w.z - z; return out.set((dx * c - dz * s) / S_, (w.y - y) / S_, (dx * s + dz * c) / S_); }
  function wpToWorld(lx, ly, lz, out) { const c = Math.cos(wp.yaw), s = Math.sin(wp.yaw), S = S_; return out.set(wp.x + (lx * c + lz * s) * S, wp.y + ly * S, wp.z + (-lx * s + lz * c) * S); }
  function dirM(w, out, yaw = hero.yaw) { const c = Math.cos(yaw), s = Math.sin(yaw); return out.set(w.x * c - w.z * s, w.y, w.x * s + w.z * c); }

  /* ── the kinds of work ── tool · the preferred contact in model space [x, z] · timing (s) · the swing's top and ready
     angles (rad, round the pivot) · beta: the handle's slope at contact · pivot: 1 the shoulder, 0.5 the elbow · bow0 */
  const HKIND = {
    dress: { tool: 'hammer', pref: [-0.26, 1.75], tA: 0.3, tC: 0.4, tE: 0.86, top: -2.1, ready: -0.55, beta: 0.22, pivot: 1, bow0: 0.12 },
    chisel: { tool: 'mallet', chisel: true, pref: [0.1, 1.22], tA: 0.27, tC: 0.4, tE: 0.86, top: -1.2, ready: -0.5, pivot: 0.55, bow0: 0.3 },
    tamp: { tool: 'mallet', pref: [-0.22, 1.62], tA: 0.3, tC: 0.4, tE: 0.86, top: -1.9, ready: -0.5, beta: 0.28, pivot: 1, bow0: 0.12 },
    pick: { tool: 'pick', two: true, pref: [-0.06, 2.1], tA: 0.3, tC: 0.42, tE: 0.95, top: -2.3, ready: -0.6, beta: 0.55, pivot: 1, bow0: 0.1 },
    split: { tool: 'sledge', two: true, pref: [-0.04, 1.9], tA: 0.33, tC: 0.45, tE: 1.0, top: -2.4, ready: -0.6, beta: 0.12, pivot: 1, bow0: 0.2 },
    measure: { tool: 'plumb', pref: [-0.32, 1.3], tC: 0.9, tE: 1.4 },
    pull: { tool: 'rope', tC: 1.0, tE: 1.3 },
    carry: { tool: 'carry', pref: [0.0, 1.05], tC: 1.1, tE: 1.9 },
  };
  const IRON_TOOLS = { hammer: 1, pick: 1, sledge: 1 };
  const craneO = { site: null, x: 0, y: 0, z: 0, carry: false };
  const L12 = HL.up + HL.fore;
  // temporaries (no allocations per frame)
  const hA = new THREE.Vector3(), hB = new THREE.Vector3(), hC = new THREE.Vector3(), hD = new THREE.Vector3(), hE = new THREE.Vector3(), hF = new THREE.Vector3(), hG = new THREE.Vector3();
  const hN = new THREE.Vector3(), hM = new THREE.Vector3(), hK = new THREE.Vector3(), hT = new THREE.Vector3();
  const hQ = new THREE.Quaternion(), hQ2 = new THREE.Quaternion(), hQ3 = new THREE.Quaternion(), hQs = new THREE.Quaternion(), hQh = new THREE.Quaternion(), hQu = new THREE.Quaternion();
  const hMat = new THREE.Matrix4(), hE3 = new THREE.Euler(), hRay = new THREE.Raycaster(), hHits = [];
  const X_ = new THREE.Vector3(1, 0, 0), Y_ = new THREE.Vector3(0, 1, 0), Z_ = new THREE.Vector3(0, 0, 1);
  // the elbows: back when the arms hang or swing, out and down when they work; the knees forward
  const POLE_R = new THREE.Vector3(-0.8, -0.5, 0.1).normalize(), POLE_L = new THREE.Vector3(0.8, -0.5, 0.1).normalize(), POLE_K = new THREE.Vector3(0, 0.1, 1).normalize();
  const POLE_RB = new THREE.Vector3(-0.28, -0.15, -0.95).normalize(), POLE_LB = new THREE.Vector3(0.28, -0.15, -0.95).normalize();
  // the pose being built this frame (model space)
  const PZ = {
    drop: 0, bow: 0, twist: 0, roll: 0, sx: 0, hy: 0, hp: 0,
    WR: new THREE.Vector3(), QR: new THREE.Quaternion(), WL: new THREE.Vector3(), QL: new THREE.Quaternion(),
    FL: new THREE.Vector3(0.22, 0.13, 0.05), FR: new THREE.Vector3(-0.22, 0.13, -0.05), look: null,
    shR: new THREE.Vector3(), shL: new THREE.Vector3(), poleR: new THREE.Vector3(), poleL: new THREE.Vector3(), hipsP: new THREE.Vector3(), spineQ: new THREE.Quaternion(), hipsQ: new THREE.Quaternion(), spineP: new THREE.Vector3(),
    lookAt: new THREE.Vector3(), lookOn: 0,
  };
  // a hand frame from its y (the palm's back → the tool's face is −y) and z (the handle) axes
  function frameQ(y, z, out) { hK.crossVectors(y, z).normalize(); hMat.makeBasis(hK, y, z); return out.setFromRotationMatrix(hMat); }
  // the shoulders for a body pose (model space): the waist pivot drops, the spine bows (x), twists (y) and leans (z)
  function bodyQ(bow, twist, roll, out) { hE3.set(bow, twist, roll, 'YXZ'); return out.setFromEuler(hE3); }
  function shoulderAt(side, drop, bow, twist, roll, sx, out) {
    bodyQ(bow, twist, roll, hQ3);
    out.set(0.5 * side, 1.08, 0).applyQuaternion(hQ3);
    return out.add(hG.set(sx, HJ.waist[1] - drop, 0));
  }

  /* ── plan a stroke: where the tool meets what, where the feet go, the keys ── */
  function strokeTarget(kind, target, S) {
    // → S.C (world contact), S.n (world normal, out of the surface), S.face (the yaw to face), S.hex, S.floor, S.onWp
    S.onWp = false; S.boulder = null;
    const bi = target && target.boulder !== undefined ? target.boulder : null;
    if (bi !== null && bSt[bi] && bSt[bi].state > 0) {
      const b = bSt[bi], gy = hill.heightAt(b.x, b.z);
      let dx = hero.x - b.x, dz = hero.z - b.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      // aim at the rock's shoulder, 1.25 model units above his feet, on the side he stands; the surface from the rock itself
      const yAim = Math.max(gy, hero.y) + 1.25 * S_;
      hA.set(hero.x, yAim, hero.z); hB.set(-dx, 0, -dz);
      hRay.set(hA, hB); hRay.far = L + b.r; hHits.length = 0;
      for (const m of bMesh) { if (m.visible) m.raycast(hRay, hHits); }
      let best = null; for (const h of hHits) if (h.instanceId === bi && (!best || h.distance < best.distance)) best = h;
      const cy = gy - b.r * 0.12;
      if (best) S.C.copy(best.point);
      else { const ry = b.r * b.sy, k = Math.sqrt(Math.max(0.05, 1 - ((yAim - cy) / ry) ** 2)); S.C.set(b.x + dx * b.r * k, yAim, b.z + dz * b.r * k); }
      S.n.set((S.C.x - b.x) / (b.r * b.r), (S.C.y - cy) / (b.r * b.r * b.sy * b.sy), (S.C.z - b.z) / (b.r * b.r)).normalize();
      S.face = Math.atan2(-dx, -dz); S.hex = '#CFC4AC'; S.floor = gy; S.boulder = bi;
      return;
    }
    if (target && typeof target === 'object' && typeof target.x === 'number' && typeof target.z === 'number' && typeof target.y === 'number' && !target.stone) {
      // a point (a slot's box: its face toward him). Out of his reach → he works on his own stone instead.
      const gy = groundAt(target.x, target.z), hy = Math.hypot(target.x - hero.x, target.z - hero.z);
      if (target.y - Math.max(gy, hero.y) < 2.3 * S_ && hy < 4.5 * S_) {
        S.C.set(target.x, target.y + (typeof target.h === 'number' ? target.h / 2 : 0), target.z); S.n.set(0, 1, 0);
        S.face = Math.atan2(target.x - hero.x, target.z - hero.z); S.hex = STONE.ash; S.floor = gy;
        return;
      }
    }
    // the workpiece: set it up here if there is none, with the state the work needs
    if (!wp.state || (kind === 'split') !== (wp.state === 'quarry')) {
      const key = hero.at || (target === 'quarry' ? 'quarry' : null);
      if (!wp.state || wp.auto) {
        const yaw = hero.yaw, c = Math.cos(yaw), s = Math.sin(yaw);
        if (kind === 'split' || key === 'quarry') { const mz = 1.95 * S_; wpPlace(hero.x + mz * s, hero.z + mz * c, yaw); wpSet('quarry'); }
        else { wpFront(hero.x, hero.z, yaw); wpSet(hero.tool === 'wood' && kind !== 'dress' ? 'field' : wpDefault(key) || 'rough'); }
      }
    }
    S.onWp = true; S.face = wp.yaw;
    const st = wp.state, i = wp.i;
    const xs = [0, -0.3, 0.28, -0.14, 0.15, -0.38, 0.36];
    if (st === 'quarry') {
      if (kind === 'split') wpToWorld([-0.55, 0, 0.55][i % 3], 1.12, 0, S.C);
      else wpToWorld(xs[i % 7] * 1.2, 0.96, -0.5, S.C);
      S.hex = '#E4D9C0'; S.floor = wp.y;
    } else if (st === 'field') {
      wpToWorld(xs[i % 7] * 0.4, HSt.y0 + 0.66, -0.12, S.C); S.hex = '#D9D2C2'; S.floor = wp.y;
    } else {
      const top = HSt.y1 + (st === 'dressed' ? 0.05 : st === 'drafted' ? 0.0 : 0.02);
      if (kind === 'measure') wpToWorld(0.25, HSt.y1 + 0.05, -HSt.d / 2 - 0.08, S.C);
      else if (S.chisel) wpToWorld(xs[i % 7] * 0.9, top, -HSt.d / 2 + (st === 'dressed' ? 0.14 : 0.07), S.C);
      else wpToWorld(xs[i % 7] * 0.9, top, -HSt.d / 2 + 0.13, S.C);
      S.hex = st === 'rough' ? '#CBB894' : STONE.ash; S.floor = wp.y;
    }
    S.n.set(0, 1, 0);
  }
  function planStroke(kind, target, opts) {
    const chisel = kind === 'dress' && hero.tool !== 'wood' && (wp.state === 'drafted' || wp.state === 'dressed');
    const kk = kind === 'dress' ? (hero.tool === 'wood' ? 'tamp' : chisel ? 'chisel' : 'dress') : kind;
    const K = HKIND[kk];
    const tempo = clamp(+opts.tempo || 1, 0.6, 1.6);
    const S = { kind, kk, K, tool: K.tool, chisel: !!K.chisel, two: !!K.two, t: 0, tempo, hit: false, res: null, quality: opts.quality || 'normal', shake: opts.shake !== false, target,
      C: new THREE.Vector3(), n: new THREE.Vector3(0, 1, 0), face: hero.yaw, hex: '#CFC3A8', floor: 0, onWp: false, boulder: null,
      Cm: new THREE.Vector3(), nm: new THREE.Vector3(), Wc: new THREE.Vector3(), Qc: new THREE.Quaternion(), Wt: new THREE.Vector3(), Qt: new THREE.Quaternion(),
      W0: new THREE.Vector3(), Q0: new THREE.Quaternion(), WLc: new THREE.Vector3(), QLc: new THREE.Quaternion(), WL0: new THREE.Vector3(), QL0: new THREE.Quaternion(),
      P: new THREE.Vector3(), axis: new THREE.Vector3(), B: new THREE.Vector3(), rope: new THREE.Vector3(),
      bow: 0, drop: 0, stand: null };
    if (kind === 'pull') { strokePull(S, target); return S; }
    strokeTarget(kind, target, S);
    // the stand: keep the feet if the contact already falls near the preferred point, else one small step
    w2m(S.C, hA, hero.x, hero.y, hero.z, S.face);
    const px = K.pref[0], pz = K.pref[1];
    let x = hero.x, z = hero.z;
    const turn = Math.abs(Math.atan2(Math.sin(S.face - hero.yaw), Math.cos(S.face - hero.yaw)));
    if (Math.abs(hA.x - px) > 0.42 || Math.abs(hA.z - pz) > 0.24 || turn > 0.5) {
      const c = Math.cos(S.face), s = Math.sin(S.face);
      // move so that the contact sits at (px, pz) in the new model frame (the side offset only as far as needed)
      const ex = Math.abs(hA.x - px) > 0.42 ? hA.x - px : 0, ez = hA.z - pz;
      x = hero.x + (ex * c + ez * s) * S_; z = hero.z + (-ex * s + ez * c) * S_;
      S.stand = { x0: hero.x, z0: hero.z, yaw0: hero.yaw, x, z, yaw: S.face, t: 0, dur: 0.24 };
    } else if (turn > 0.02) S.stand = { x0: hero.x, z0: hero.z, yaw0: hero.yaw, x, z, yaw: S.face, t: 0, dur: 0.14 };
    const gy = groundAt(x, z);
    w2m(S.C, S.Cm, x, gy, z, S.face); dirM(S.n, S.nm, S.face);
    strokeKeys(S);
    return S;
  }
  // the keys of a strike (model space, in the planted frame): contact, top, the pivot and axis; the body at contact
  function strokeKeys(S) {
    const K = S.K, T = HTOOL[S.tool];
    if (S.kk === 'measure') {
      S.Wc.copy(S.Cm).add(hA.set(0, HL.palm, -0.02)); S.Qc.identity(); S.bow = 0.18; S.drop = 0.06; return;
    }
    if (S.kk === 'carry') { S.bow = 0.8; S.drop = 0.32; return; }
    const y = hA, z = hB;
    if (S.chisel) {
      // the chisel: its edge ON the stone, leaning back toward him 25°; the left hand holds it, the mallet strikes its butt
      const a = hC.copy(S.nm).multiplyScalar(Math.cos(0.44)).addScaledVector(Z_, -Math.sin(0.44)).normalize();
      const zl = hD.copy(a).negate();
      const palmL = hE.copy(S.Cm).addScaledVector(a, 0.32);
      shoulderAt(1, 0.1, 0.4, 0.05, 0, 0, hF);
      const yl = hG.copy(hF).sub(palmL).normalize(); yl.addScaledVector(zl, -yl.dot(zl)).normalize();
      frameQ(yl, zl, S.QLc);
      S.WLc.copy(palmL).addScaledVector(yl, HL.palm).addScaledVector(zl, -0.02);
      S.B.copy(palmL).addScaledVector(a, 0.225);
      y.copy(a);
      z.set(0.8, -0.15, 0.55); z.addScaledVector(y, -z.dot(y)).normalize();
      frameQ(y, z, S.Qc);
      S.Wc.copy(S.B).addScaledVector(y, T.hh + HL.palm).addScaledVector(z, -(T.L + 0.02));
    } else {
      // the handle slopes down by beta toward the target, turned a little inward; the face (or the pick's point) is ⟂ to it
      y.set(0, Math.cos(K.beta), Math.sin(K.beta)); z.set(0, -Math.sin(K.beta), Math.cos(K.beta));
      if (!S.two) { hQ.setFromAxisAngle(Y_, 0.14); y.applyQuaternion(hQ); z.applyQuaternion(hQ); }
      frameQ(y, z, S.Qc);
      S.Wc.copy(S.Cm).addScaledVector(y, T.hh + HL.palm).addScaledVector(z, -(T.L + 0.02));
      if (S.two) { S.WLc.copy(S.Wc).addScaledVector(z, T.two); S.QLc.copy(S.Qc); }
    }
    // the body at contact: the least bow that brings the wrists into reach
    let bow = K.bow0, drop = 0.06;
    for (let k = 0; k < 18; k++) {
      drop = 0.05 + bow * 0.28;
      const dR = shoulderAt(-1, drop, bow, 0.1, 0, 0.04, hF).distanceTo(S.Wc);
      const dL = S.two || S.chisel ? shoulderAt(1, drop, bow, 0.1, 0, 0.04, hF).distanceTo(S.WLc) : 0;
      if (dR < L12 * 0.94 && dL < L12 * 0.94) break;
      bow += 0.05;
    }
    S.bow = Math.min(bow, 1.05); S.drop = drop;
    // the pivot of the swing and its axis (the hand's x at contact)
    shoulderAt(-1, S.drop, S.bow, 0.1, 0, 0.04, hF);
    S.P.copy(hF).lerp(S.Wc, 1 - K.pivot);
    S.axis.set(1, 0, 0).applyQuaternion(S.Qc);
  }
  // a rope pulled toward the crane's block (or up and ahead)
  function strokePull(S, target) {
    S.face = hero.yaw;
    if (target && typeof target === 'object' && typeof target.x === 'number') S.rope.set(target.x, typeof target.y === 'number' ? target.y : hero.y + 6 * S_, target.z);
    else {
      let ci = null; try { ci = api.crane ? api.crane(craneO) : null; } catch (e) { ci = null; }
      if (ci && typeof ci.x === 'number' && Math.hypot(ci.x - hero.x, ci.z - hero.z) < 60) S.rope.set(ci.x, ci.y, ci.z);
      else { const c = Math.cos(hero.yaw), s = Math.sin(hero.yaw); S.rope.set(hero.x + s * 8 * S_, hero.y + 5 * S_, hero.z + c * 8 * S_); }
    }
    S.face = Math.atan2(S.rope.x - hero.x, S.rope.z - hero.z);
    S.C.copy(S.rope); S.hex = '#B89A62'; S.floor = hero.y;
    const turn = Math.abs(Math.atan2(Math.sin(S.face - hero.yaw), Math.cos(S.face - hero.yaw)));
    if (turn > 0.02) S.stand = { x0: hero.x, z0: hero.z, yaw0: hero.yaw, x: hero.x, z: hero.z, yaw: S.face, t: 0, dur: 0.18 };
    w2m(S.rope, S.Cm, hero.x, hero.y, hero.z, S.face);
    S.bow = -0.22; S.drop = 0.16;
  }
  // rotate the contact pose round the pivot by th (0 = contact)
  function swingAt(S, th, W, Q) {
    hQ.setFromAxisAngle(S.axis, th);
    W.copy(S.Wc).sub(S.P).applyQuaternion(hQ).add(S.P);
    Q.copy(hQ).multiply(S.Qc);
  }

  /* ── act: one stroke; the promise resolves on the contact frame (a wall-clock backstop resolves it if the loop stalls) ── */
  const impactCbs = [];
  function heroAct(kind, target, opts = {}) {
    if (TW.on && TW.inWheel) return Promise.resolve(false);   // ── site15 ── (the operator: no strokes inside the wheel)
    if (!HKIND[kind] && kind !== 'dress') kind = 'dress';
    hero.vis = true; hero.mesh.visible = hero.ring.visible = true;
    if (hero.path) return Promise.resolve(false);               // (walking: the caller walks him first)
    return new Promise((res) => {
      const job = { kind, target, opts, res };
      if (hero.stroke && !hero.stroke.free) { if (hero.queue && hero.queue.res) hero.queue.res(false); hero.queue = job; }
      else startStroke(job);
      const t0 = HKIND[kind === 'dress' ? 'dress' : kind].tC || 0.5;
      setTimeout(() => { if (job.res) { const r = job.res; job.res = null; if (hero.queue === job) hero.queue = null; r(!!job.started); } }, (t0 + 0.6) * 1600 + 900);
    });
  }
  // ── site11 ── (PRODUCER11 N59: "at the altar's survey he holds an iron pick"; STAGING A1 "כאן — בלי ברזל") by the altar being built
  // (at one of its work spots) his tool is the wooden mallet for every stroke but the dig's pick in the ground; elsewhere a dressing
  // stroke is iron again
  function nearAltar() {   // (he stands at one of an altar stage's work spots: its survey stake, its dig, his banker at the slot)
    for (const id of ['yesod', 'sovev', 'guf', 'karnot']) {
      const st = ST[id]; if (!st || st.status !== 'building') continue;
      for (const k of ['dress', 'set', 'survey']) { const w = workSpot(id, k); if (w && Math.hypot(hero.x - w.x, hero.z - w.z) < 3.5) return true; }
    }
    return false;
  }
  // ── site12 ── (PRODUCER-S11 #6, N59: "the tool in his hand at yesod/sovev/guf/karnot, and the dig's picks away from the stones")
  // he stands at the altar being built — its footprint and the kevesh, 9 amot round — wherever the game walked him
  function atAltar() {
    if (hero.x < -63 || hero.x > -13 || hero.z < -29 || hero.z > 52) return false;
    for (const id of ['yesod', 'sovev', 'guf', 'karnot']) { const st = ST[id]; if (st && st.status === 'building') return true; }
    return false;
  }
  function startStroke(job) {
    // ── site12 ── no iron at the altar at all: the dig's pick (it struck the whole field stone on his banker) and a reset's sledge
    // are the wooden mallet there too — he seats and tamps; the survey is the measuring cord (the plumb's line)
    { const alt = nearAltar() || atAltar();
      if (alt) { if (job.kind === 'pick' || job.kind === 'split') job.kind = 'tamp'; if (hero.tool !== 'wood') setTool('wood'); if (IRON_TOOLS[hero.held]) hero.held = 'mallet'; }
      else if (hero.tool === 'wood' && job.kind === 'dress') setTool('iron'); }
    gestEnd(false);
    const S = planStroke(job.kind, job.target, job.opts);
    S.job = job; job.started = true; job.S = S;
    // ── crafta19 ── (FUN19 §2, the owner's 8: "אין סנכרון בין המכה, ההקשה…") the snap: from the armed pose — the tool held up at the
    // swing's top — the touch is the fall alone: contact ≈ 90 ms after it (the 0.30-s anticipation goes); the follow-through as before
    // (snap: no planting step — the fall starts at once from where he stands; the contact is re-keyed to his feet and he faces it)
    if (job.opts && job.opts.snap && S.stand && S.K && S.K.top != null) { hero.yaw = S.stand.yaw; S.face = S.stand.yaw; S.stand = null; const gy = groundAt(hero.x, hero.z); w2m(S.C, S.Cm, hero.x, gy, hero.z, S.face); dirM(S.n, S.nm, S.face); strokeKeys(S); }
    if (job.opts && job.opts.snap && S.K && S.K.tA != null && S.K.top != null) { S.t = S.K.tA; S.tempo = clamp((S.K.tC - S.K.tA) / SNAP_FALL, 1, 2.4); S.snap = true; S.topTh = armTop(S); }
    // ── /crafta19 ──
    // where the hands start: the pose of this frame
    S.W0.copy(PZ.WR); S.Q0.copy(PZ.QR); S.WL0.copy(PZ.WL); S.QL0.copy(PZ.QL);
    hero.stroke = S; hero.held = S.tool === 'plumb' || S.tool === 'rope' || S.tool === 'carry' ? hero.held : S.tool;
    if (S.stand) hero.step = S.stand;
  }
  // ── crafta19 ── the armed ready pose (FUN19 §2: "between strokes a striking tool is held up in a ready pose; touch-down is the fall").
  // arm(kind, target) plans the stroke where he stands (its small planting step once) and holds the tool up at the swing's top,
  // breathing, until a stroke (act with { snap: true }), a walk, or arm(null). → bool
  const SNAP_FALL = 0.09;
  function armPlan() {
    const A = hero.armed; if (!A) return false;
    let kind = A.kind;
    if ((nearAltar() || atAltar()) && (kind === 'pick' || kind === 'split')) kind = 'tamp';
    const S = planStroke(kind, A.target, {});
    if (!S.K || S.K.top == null) { hero.armed = null; return false; }
    S.topTh = armTop(S);
    if (S.stand) hero.step = S.stand;
    hero.readyS = S; hero.idle = 0; hero.chiselKeep = S.chisel ? 1 : 0;
    if (!(S.tool === 'plumb' || S.tool === 'rope' || S.tool === 'carry')) hero.held = S.tool;
    A.n = (A.n | 0) + 1;
    return true;
  }
  /** the swing's raised angle for this contact: the hands high over his head and a little behind (a tall rock's shoulder put HKIND's
   *  fixed top under his hips) — the most raised of the arc, searched once per plan */
  function armTop(S) {
    if (S.chisel) return S.K.top;
    let best = S.K.top, bv = -1e9;
    for (let th = -0.9; th >= -3.4; th -= 0.1) { swingAt(S, th, hC, hQ2); const v = hC.y - 0.35 * Math.max(0, hC.z) - 0.6 * Math.max(0, -hC.z - 0.5); if (v > bv) { bv = v; best = th; } }
    return best;
  }
  function heroArm(kind, target) {
    if (!kind) { hero.armed = null; return false; }
    if (!hero.vis || hero.path || (TW.on && TW.inWheel)) return false;
    if (!HKIND[kind] && kind !== 'dress') kind = 'dress';
    hero.armed = { kind, target: target === undefined ? null : target, n: 0, t: time };
    if (hero.stroke) return true;   // (his stroke's own ready pose: the follow-through rises into it)
    if (hero.gest) gestEnd(false);
    return armPlan();
  }
  // ── /crafta19 ──
  function heroCancel() {
    if (hero.stroke && hero.stroke.job && hero.stroke.job.res) { const r = hero.stroke.job.res; hero.stroke.job.res = null; r(false); }
    if (hero.queue && hero.queue.res) { const r = hero.queue.res; hero.queue.res = null; r(false); }
    hero.stroke = null; hero.queue = null; hero.step = null;
    gestEnd(false); if (hero.gestQ && hero.gestQ.res) { const r = hero.gestQ.res; hero.gestQ = null; r(false); }
  }
  /* ── people7 ── gestures: his life between strokes (wave 7). gesture(kind) → Promise<bool> when it ends:
     'gotit' — a nod and a small fist when a stone is set (also by itself when a stone is set at the site he works at);
     'proud' — chest up, hands on the hips, looking up at the work (the end of a key moment; by itself when his site is done);
     'wipe' (the brow), 'think' (a hand at the beard, eyeing the stone), 'stretch' (hands at the small of the back): between
     strokes he plays these by himself now and then. During a stroke a gesture waits for its end; a walk, a new stroke or a
     new gesture ends one (false). One small object per gesture, nothing per frame. */
  const GEST = { gotit: 1.15, proud: 3.4, wipe: 1.7, think: 2.4, stretch: 1.9 }, IDLE_G = ['think', 'wipe', 'stretch', 'think', 'wipe'];
  function heroGesture(kind, opts = {}) {
    if (!GEST[kind] || !hero.vis || hero.path) return Promise.resolve(false);
    return new Promise((res) => {
      const G = { kind, t: 0, dur: GEST[kind] * (opts && opts.hold ? 2 : 1), res };
      if (hero.stroke) { if (hero.gestQ && hero.gestQ.res) hero.gestQ.res(false); hero.gestQ = G; } else { gestEnd(false); hero.gest = G; }
    });
  }
  function gestEnd(ok) {
    const G = hero.gest; hero.gest = null; if (G && G.res) { const r = G.res; G.res = null; r(ok); }
    if (!ok && hero.gestQ && hero.gestQ.res && !hero.stroke) { const r = hero.gestQ.res; hero.gestQ = null; r(false); }
  }
  // (a one-argument ease for the gestures only: named apart — as `smooth` it shadowed util's smooth(e0, e1, x) for the whole
  // stages closure, and from the gestures' commit on the hill's cut stood still at 6 % through the Mount's courses, the
  // showcase's fade grew to ~200 (the owner's yellow wash, 28.9) and the vision's fade stayed at 0.12)
  const ease01 = (u) => u * u * (3 - 2 * u);
  function poseGesture(G) {
    const t = G.t, d = G.dur, e = ease01(clamp(t / 0.3, 0, 1)) * ease01(clamp((d - t) / 0.4, 0, 1));
    const bodyTo = (bow, drop, hp, hy) => { PZ.bow = lerp(PZ.bow, bow, e); PZ.drop = lerp(PZ.drop, drop, e); PZ.hp = lerp(PZ.hp, hp, e); PZ.hy = lerp(PZ.hy, hy, e); PZ.sx *= 1 - e; PZ.roll *= 1 - e; };
    if (G.kind === 'gotit') {
      // a nod, and the free hand makes a small fist before the chest, pumped once
      const nod = Math.sin(clamp(t / 0.6, 0, 1) * Math.PI), pump = Math.max(0, Math.sin(clamp((t - 0.3) / 0.45, 0, 1) * Math.PI)) * 0.12;
      bodyTo(-0.06, 0, 0.3 * nod - 0.08, 0); PZ.look = null;
      PZ.WL.lerp(hA.set(0.46, 2.62 - pump * 1.6, 0.44), e); PZ.QL.slerp(hQ.setFromAxisAngle(X_, Math.PI - 0.35), e); PZ.poleL.copy(POLE_L); PZ.leftFree = false;
    } else if (G.kind === 'proud') {
      // standing tall, the hands on the hips and the elbows out, looking up at the work
      bodyTo(-0.1, 0, -0.24, 0.1); PZ.look = null;
      PZ.WR.lerp(hA.set(-0.54, 1.76, 0.15), e); PZ.QR.slerp(hQ.setFromAxisAngle(Z_, 0.85), e); PZ.poleR.set(-1, 0.35, -0.2).normalize();
      PZ.WL.lerp(hA.set(0.54, 1.76, 0.15), e); PZ.QL.slerp(hQ.setFromAxisAngle(Z_, -0.85), e); PZ.poleL.set(1, 0.35, -0.2).normalize(); PZ.leftFree = false;
      PZ.FL.lerp(hA.set(0.3, 0.13, 0.1), e); PZ.FR.lerp(hA.set(-0.3, 0.13, -0.03), e);
    } else if (G.kind === 'wipe') {
      // the back of the free hand across the brow, left to right, and a breath out
      const sw = ease01(clamp((t - 0.35) / 0.75, 0, 1));
      bodyTo(0.05, 0.02, 0.14, 0); PZ.look = null;
      PZ.WL.lerp(hA.set(0.33 - 0.3 * sw, 3.44, 0.46), e); PZ.QL.slerp(hQ.setFromAxisAngle(Z_, -1.5), e); PZ.poleL.set(1, -0.35, 0.15).normalize(); PZ.leftFree = false;
    } else if (G.kind === 'think') {
      // a hand at the beard, eyeing the stone
      bodyTo(0.12, 0.04, 0.2, 0);
      if (wp.state) { wpToWorld(0, HSt.y1, 0, hC); w2m(hC, PZ.lookAt); PZ.look = PZ.lookAt; }
      const st = 0.03 * Math.sin(t * 5);
      PZ.WL.lerp(hA.set(0.12, 2.93 + st, 0.46), e); PZ.QL.slerp(hQ.setFromAxisAngle(X_, Math.PI - 0.2), e); PZ.poleL.set(0.7, -0.7, 0.1).normalize(); PZ.leftFree = false;
    } else if (G.kind === 'stretch') {
      // both hands at the small of the back, leaning back, the face up
      const k = ease01(clamp((t - 0.2) / 0.6, 0, 1));
      bodyTo(-0.15 * k, 0, -0.3 * k, 0); PZ.look = null;
      PZ.WR.lerp(hA.set(-0.3, 1.74, -0.4), e); PZ.QR.slerp(hQ.setFromAxisAngle(Z_, 0.5), e); PZ.poleR.set(-1, 0, -0.6).normalize();
      PZ.WL.lerp(hA.set(0.3, 1.74, -0.4), e); PZ.QL.slerp(hQ.setFromAxisAngle(Z_, -0.5), e); PZ.poleL.set(1, 0, -0.6).normalize(); PZ.leftFree = false;
    }
  }
  // the stones set at the site he works at, and its status (a stone set → 'gotit'; the site done → 'proud')
  function gestWatch(dt) {
    const H = hero, st = H.at && ST[H.at], n = st && st.lay ? st.lay.n : -1, done = st ? st.status === 'done' : false;
    H.gotT = Math.max(0, (H.gotT || 0) - dt);
    if (H.watchAt !== H.at) { H.watchAt = H.at; H.watchN = n; H.watchDone = done; return; }
    if (n > H.watchN && H.watchN >= 0 && !H.path && H.gotT <= 0 && (!H.gest || H.gest.kind !== 'proud')) { H.gotT = 4; heroGesture('gotit'); }
    if (done && !H.watchDone && !H.path) heroGesture('proud');
    H.watchN = n; H.watchDone = done;
  }
  function heroSwing(opts = {}) {
    // the old one-tap strike: a real stroke of the work where he stands
    const at = hero.at;
    let kind = 'dress', target = null;
    if (at && at[0] === 'b' && !DEF[at]) { kind = 'pick'; target = { boulder: +at.slice(1) }; }
    else if (at === 'quarry') { kind = 'split'; target = 'quarry'; }
    else if (hero.tool === 'wood') kind = 'tamp';
    return heroAct(kind, target, opts);
  }
  // the contact frame
  function heroImpact(S) {
    S.hit = true;
    const C = S.C;
    hero.lastHit = time; hero.contact.copy(C); hero.hitHex = S.hex;
    if (S.kk !== 'measure' && S.kk !== 'pull' && S.kk !== 'carry') {
      const big = S.tool === 'pick' || S.tool === 'sledge' ? 1 : 0;
      chips.spawn(C.x, C.y + 0.1, C.z, 7 + big * 5, S.hex, { speed: 5 + big * 2, up: 7 + big * 2, size: 0.26 + big * 0.06, floor: S.floor });
      dustBurst(C.x, C.y + 0.15, C.z, 4 + big * 3, 2.2 + big, 1.6 + big, 1.1);
      if (IRON_TOOLS[S.tool] || S.chisel) spark.spawn(C.x, C.y + 0.15, C.z, 6 + big * 4 + 3 * JOBS.owned.tools, PO(0.5, 0, 7 + JOBS.owned.tools, 4.5, 1.0, 0.3, 0.4, 14, 2.5, 1));   // ── site14 ── (her tools: a keener edge, more sparks)
      if (S.shake) { shake.t = 0.16 + 0.06 * big; shake.amp = 0.32 + 0.2 * big; }
    }
    if (S.onWp) {
      wp.i++;
      if (wp.auto) {
        wp.n++;
        const st = wp.state;
        if (S.kk === 'dress' && st === 'rough' && wp.n >= 3) wpSet('drafted');
        else if (S.kk === 'chisel' && st === 'drafted' && wp.n >= 4) wpSet('dressed');
        else if (S.kk === 'chisel' && st === 'dressed' && wp.n >= 3) { wpSet(null, true); wpSet('rough'); }
        else if (S.kk === 'tamp' && st === 'field' && wp.n >= 4) { wpSet(null, true); wpSet('field'); }
        else if (S.kk === 'split' && st === 'quarry' && wp.n >= 6) { dustBurst(C.x, C.y, C.z, 10, 4, 3, 2); wpSet(null, true); wpSet('quarry'); }
      }
    }
    const info = { kind: S.kind, tool: S.chisel ? 'chisel' : S.tool, x: C.x, y: C.y, z: C.z, target: S.target, quality: S.quality, t: time, workpiece: S.onWp ? wp.state : null };
    for (const cb of impactCbs.slice()) { try { cb(info); } catch (e) { /* a listener's error never stops the stroke */ } }
    const job = S.job;
    if (job && job.res) { const r = job.res; job.res = null; r(true); }
  }

  /* ── the pose of one frame ── */
  function strokePose(S, dt) {
    const K = S.K;
    S.t += dt * S.tempo;
    const t = S.t, tC = K.tC;
    let contactNow = false;
    if (!S.hit && t >= tC) { S.t = tC; contactNow = true; }
    const u = S.t;
    if (S.kk === 'measure') poseMeasure(S, u);
    else if (S.kk === 'pull') posePull(S, u);
    else if (S.kk === 'carry') poseCarry(S, u);
    else poseStrike(S, u);
    PZ.look = S.kk === 'pull' ? null : S.Cm;
    if (contactNow) return 'contact';
    if (S.t >= (K.tE || tC + 0.5)) return 'end';
    if (S.t >= tC + 0.12) S.free = true;                        // a queued stroke may start from here
    return null;
  }
  function poseStrike(S, t) {
    const K = S.K, tA = K.tA, tC = K.tC, tR = tC + 0.075, tE = K.tE;
    let th, bw, dr, tw, sx;
    const bc = S.bow, dc = S.drop;
    if (t < tA) {
      // anticipation: from where the hands were to the top of the swing, the whole body rising and turning back
      const u = easeOut(clamp(t / tA, 0, 1));
      swingAt(S, K.top, hC, hQ2);
      PZ.WR.copy(S.W0).lerp(hC, u); PZ.QR.copy(S.Q0).slerp(hQ2, u);
      bw = lerp(PZ.bow, bc * 0.35 - 0.06, u); dr = lerp(PZ.drop, 0.02, u); tw = lerp(PZ.twist, S.chisel ? -0.08 : -0.3, u); sx = lerp(PZ.sx, -0.05, u);
      if (S.two) { PZ.WL.copy(S.WL0).lerp(hD.copy(hC).addScaledVector(hE.set(0, 0, 1).applyQuaternion(hQ2), HTOOL[S.tool].two), u); PZ.QL.copy(S.QL0).slerp(hQ2, u); }
      else if (S.chisel) { const v = easeIO(clamp(t / (tA * 0.8), 0, 1)); PZ.WL.copy(S.WL0).lerp(S.WLc, v); PZ.QL.copy(S.QL0).slerp(S.QLc, v); }
      finishBody(bw, dr, tw, sx, t / tA);
      if (!S.two && !S.chisel) { hD.copy(PZ.WL); hQ3.copy(PZ.QL); restLeft(0.15); PZ.WL.lerpVectors(hD, PZ.WL, u); PZ.QL.slerpQuaternions(hQ3, PZ.QL, u); }
      return;
    }
    if (t <= tC) {
      // the downswing accelerates into the contact
      const u = clamp((t - tA) / (tC - tA), 0, 1), e = u * u * (1.6 - 0.6 * u);
      th = (S.topTh != null ? S.topTh : K.top) * (1 - e);   // ── crafta19 ── (topTh: from the armed pose's raised angle) ── /crafta19 ──
      bw = lerp(bc * 0.35 - 0.06, bc, e); dr = lerp(0.02, dc, e); tw = lerp(S.chisel ? -0.08 : -0.3, 0.1, e); sx = lerp(-0.05, 0.05, e);
    } else if (t <= tR) {
      const u = (t - tC) / (tR - tC), e = Math.sin(u * Math.PI / 2);
      th = -0.28 * e; bw = bc - 0.05 * e; dr = dc; tw = 0.1; sx = 0.05;
    } else {
      // the follow-through settles into the ready pose, with a breath
      const u = clamp((t - tR) / (tE - tR), 0, 1), e = easeIO(u);
      th = lerp(-0.28, K.ready, e); bw = lerp(bc - 0.05, bc * 0.8, e) + Math.sin(u * Math.PI) * -0.04; dr = lerp(dc, dc * 0.6, e); tw = lerp(0.1, 0, e); sx = lerp(0.05, 0.02, e);
    }
    swingAt(S, th, PZ.WR, PZ.QR);
    if (S.two) { PZ.WL.copy(PZ.WR).addScaledVector(hE.set(0, 0, 1).applyQuaternion(PZ.QR), HTOOL[S.tool].two); PZ.QL.copy(PZ.QR); }
    else if (S.chisel) { PZ.WL.copy(S.WLc); PZ.QL.copy(S.QLc); }
    finishBody(bw, dr, tw, sx, 1);
    if (!S.two && !S.chisel) restLeft(0.15 + bw * 0.2);
  }
  function finishBody(bw, dr, tw, sx, k) {
    PZ.bow = bw; PZ.drop = dr; PZ.twist = tw; PZ.sx = sx; PZ.roll = -sx * 0.6;
    PZ.poleR.copy(POLE_R); PZ.poleL.copy(PZ.leftFree ? POLE_LB : POLE_L); PZ.leftFree = false;
    // a mason's stance: the left foot forward, the right back, knees flexing with the drop
    PZ.FL.set(0.26, 0.13, 0.3); PZ.FR.set(-0.27, 0.13, -0.24);
  }
  function poseMeasure(S, t) {
    const u = easeIO(clamp(t / 0.5, 0, 1));
    PZ.WR.copy(S.W0).lerp(S.Wc, u); PZ.QR.copy(S.Q0).slerp(S.Qc, u);
    finishBody(lerp(PZ.bow, S.bow, u), lerp(PZ.drop, S.drop, u), 0, 0.02, u);
    restLeft(0.15);
  }
  function posePull(S, t) {
    // reach along the rope, then haul back, leaning away; the beat lands at the end of the haul
    const tC = S.K.tC, reach = t < 0.35 ? easeIO(t / 0.35) : t < tC ? 1 - easeIn((t - 0.35) / (tC - 0.35)) : easeIO(clamp((t - tC) / 0.3, 0, 1)) * 0.2;
    const d = hA.copy(S.Cm).sub(hB.set(0, 2.1, 0.3)).normalize();
    PZ.WR.set(-0.12, 2.0 - PZ.drop, 0.45).addScaledVector(d, 0.2 + reach * 0.55);
    frameQ(hC.set(0, 1, 0).addScaledVector(d, -d.y).normalize(), d, PZ.QR);
    PZ.WL.copy(PZ.WR).addScaledVector(d, 0.42).add(hC.set(0.1, 0, 0)); PZ.QL.copy(PZ.QR);
    finishBody(lerp(0.12, S.bow, 1 - reach), lerp(0.05, S.drop, 1 - reach), 0, 0, 1);
    PZ.FL.set(0.24, 0.13, 0.32); PZ.FR.set(-0.24, 0.13, -0.3);
  }
  function poseCarry(S, t) {
    // bend at the knees, both hands under the stone, lift it to the chest (the beat), and set it down again
    const tC = S.K.tC, tE = S.K.tE;
    const down = t < 0.45 ? easeIO(t / 0.45) : t < 0.6 ? 1 : t < tC ? 1 - easeIO((t - 0.6) / (tC - 0.6)) : t < tC + 0.25 ? 0 : t < tE - 0.2 ? easeIO((t - tC - 0.25) / (tE - tC - 0.45)) : 1 - easeIO((t - tE + 0.2) / 0.2);
    const lift = t >= 0.6 && t < tE - 0.2 ? 1 : 0;
    const sy = lerp(1.62, 0.36, down), sz = lerp(0.62, 1.0, down);
    HN.tCarry.position.set(0, lift ? sy : 0.36, lift ? sz : 1.0);
    PZ.WR.set(-0.3, sy + 0.05, sz - 0.02); PZ.WL.set(0.3, sy + 0.05, sz - 0.02);
    frameQ(hC.set(-1, 0.2, 0).normalize(), hD.set(0, -1, 0.1).normalize(), PZ.QR); frameQ(hC.set(1, 0.2, 0).normalize(), hD.set(0, -1, 0.1).normalize(), PZ.QL);
    finishBody(lerp(0.12, S.bow, down), lerp(0.03, S.drop, down), 0, 0, 1);
  }
  // the free arms hang from the shoulders (the tool arm a little forward, its tool pointing down and ahead)
  function restRight(bend) {
    shoulderAt(-1, PZ.drop, PZ.bow, PZ.twist, PZ.roll, PZ.sx, hF);
    PZ.WR.copy(hF).add(hA.set(-0.04, -1.04 + bend * 0.2, 0.08 + bend * 0.25));
    hQ.setFromAxisAngle(X_, 1.0 - bend * 0.6); PZ.QR.copy(hQ); PZ.poleR.copy(POLE_RB);
  }
  function restLeft(bend) {
    shoulderAt(1, PZ.drop, PZ.bow, PZ.twist, PZ.roll, PZ.sx, hF);
    PZ.WL.copy(hF).add(hA.set(0.03, -1.07 + bend * 0.15, 0.04 + bend * 0.12));
    hQ.setFromAxisAngle(X_, 0.1 + bend * 0.3); PZ.QL.copy(hQ); PZ.poleL.copy(POLE_LB); PZ.leftFree = true;
  }

  /* ── the skeleton from the pose: hips, spine, head by hand; arms and legs by two-bone IK ── */
  function ik2(A, T, pole, L1, L2, qParent, bU, bL, qUout, qLout) {
    hN.subVectors(T, A); let d = hN.length();
    if (d < 1e-5) { hN.set(0, -1, 0); d = 1e-5; } else hN.multiplyScalar(1 / d);
    d = clamp(d, Math.abs(L1 - L2) + 0.02, (L1 + L2) * 0.999);
    hM.copy(pole).addScaledVector(hN, -pole.dot(hN));
    if (hM.lengthSq() < 1e-6) hM.set(0, 0, 1).addScaledVector(hN, -hN.z);
    hM.normalize();
    const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    hE.copy(A).addScaledVector(hN, a).addScaledVector(hM, h);                                // the elbow / knee
    hK.crossVectors(hN, hM).normalize();                                                     // the hinge
    hT.copy(hE).sub(A).normalize().negate(); hC.crossVectors(hK, hT); hMat.makeBasis(hK, hT, hC); qUout.setFromRotationMatrix(hMat);
    hT.copy(A).addScaledVector(hN, d).sub(hE).normalize().negate(); hC.crossVectors(hK, hT); hMat.makeBasis(hK, hT, hC); qLout.setFromRotationMatrix(hMat);
    bU.quaternion.copy(hQ3.copy(qParent).invert().multiply(qUout));
    bL.quaternion.copy(hQ3.copy(qUout).invert().multiply(qLout));
  }
  const qUA = new THREE.Quaternion(), qLA = new THREE.Quaternion(), qFt = new THREE.Quaternion();
  // outside a stroke the pose eases toward its targets (a stroke sets them exactly: its contact is exact)
  const PV = { WR: new THREE.Vector3(), QR: new THREE.Quaternion(), WL: new THREE.Vector3(), QL: new THREE.Quaternion(), FL: new THREE.Vector3(), FR: new THREE.Vector3(), bow: 0, drop: 0, twist: 0, sx: 0, roll: 0 };
  function poseSnap() { PV.WR.copy(PZ.WR); PV.QR.copy(PZ.QR); PV.WL.copy(PZ.WL); PV.QL.copy(PZ.QL); PV.FL.copy(PZ.FL); PV.FR.copy(PZ.FR); PV.bow = PZ.bow; PV.drop = PZ.drop; PV.twist = PZ.twist; PV.sx = PZ.sx; PV.roll = PZ.roll; }
  function poseEase(a, af) {
    PZ.WR.lerpVectors(PV.WR, PZ.WR, a); PZ.QR.slerpQuaternions(PV.QR, PZ.QR, a); PZ.WL.lerpVectors(PV.WL, PZ.WL, a); PZ.QL.slerpQuaternions(PV.QL, PZ.QL, a);
    PZ.FL.lerpVectors(PV.FL, PZ.FL, af); PZ.FR.lerpVectors(PV.FR, PZ.FR, af);
    PZ.bow = lerp(PV.bow, PZ.bow, a); PZ.drop = lerp(PV.drop, PZ.drop, a); PZ.twist = lerp(PV.twist, PZ.twist, a); PZ.sx = lerp(PV.sx, PZ.sx, a); PZ.roll = lerp(PV.roll, PZ.roll, a);
  }
  function applyPose() {
    const b = HN;
    // hips: dropped, shifted over the front foot, a touch of yaw with the twist
    b.hips.position.set(PZ.sx, HJ.hips[1] - PZ.drop, 0);
    hE3.set(0, PZ.twist * 0.35, PZ.roll * 0.5, 'YXZ'); PZ.hipsQ.setFromEuler(hE3); b.hips.quaternion.copy(PZ.hipsQ);
    // the spine carries the rest of the bow and twist
    bodyQ(PZ.bow, PZ.twist, PZ.roll, PZ.spineQ);
    b.spine.quaternion.copy(hQ3.copy(PZ.hipsQ).invert().multiply(PZ.spineQ));
    // the spine's model position: hips + hipsQ·(0, 0.47, 0)
    PZ.spineP.set(0, 0.47, 0).applyQuaternion(PZ.hipsQ).add(b.hips.position);
    // the head: looks at what he works on, or glances about
    let hy = PZ.hy, hp = PZ.hp;
    if (PZ.look) {
      hA.set(0, 1.38 + 0.36, 0).applyQuaternion(PZ.spineQ).add(PZ.spineP);                  // the eyes
      hB.copy(PZ.look).sub(hA); hB.applyQuaternion(hQ3.copy(PZ.spineQ).invert());
      hy = clamp(Math.atan2(hB.x, hB.z), -0.9, 0.9); hp = clamp(Math.atan2(-hB.y, Math.hypot(hB.x, hB.z)), -0.5, 0.75);
    }
    PZ.hyS = (PZ.hyS || 0) + (hy - (PZ.hyS || 0)) * 0.25; PZ.hpS = (PZ.hpS || 0) + (hp - (PZ.hpS || 0)) * 0.25;
    hE3.set(PZ.hpS, PZ.hyS, 0, 'YXZ'); b.head.quaternion.setFromEuler(hE3);
    // arms
    for (const side of [-1, 1]) {
      hA.set(0.5 * side, 1.08, 0).applyQuaternion(PZ.spineQ).add(PZ.spineP);                 // the shoulder
      const R = side < 0;
      ik2(hA, R ? PZ.WR : PZ.WL, R ? PZ.poleR : PZ.poleL, HL.up, HL.fore, PZ.spineQ, R ? b.uArmR : b.uArmL, R ? b.fArmR : b.fArmL, qUA, qLA);
      (R ? b.handR : b.handL).quaternion.copy(hQ3.copy(qLA).invert().multiply(R ? PZ.QR : PZ.QL));
      if (R) hQh.copy(R ? PZ.QR : PZ.QL);
    }
    // legs: the feet planted, the knees forward
    for (const side of [1, -1]) {
      const L = side > 0;
      hA.set(0.2 * side, 0, 0).applyQuaternion(PZ.hipsQ).add(b.hips.position);
      ik2(hA, L ? PZ.FL : PZ.FR, POLE_K, HL.thigh, HL.shin, PZ.hipsQ, L ? b.thighL : b.thighR, L ? b.shinL : b.shinR, qUA, qLA);
      hE3.set(PZ.footPitch ? PZ.footPitch * (L ? 1 : -1) : 0, side * 0.12, 0, 'YXZ'); qFt.setFromEuler(hE3);
      (L ? b.footL : b.footR).quaternion.copy(hQ3.copy(qLA).invert().multiply(qFt));
    }
  }
  // tools: the held one shows, the rest fold away (the plumb hangs straight, the rope reaches its target)
  const TOOL_BONES = { mallet: 'tMallet', hammer: 'tHammer', pick: 'tPick', sledge: 'tSledge', plumb: 'tPlumb', rope: 'tRope', carry: 'tCarry' };
  // ── tools21 ── the tool is the job's, not the kohen's (the owner's note 6): when no stroke or arm is pending it hangs behind him — the
  // hammer across his back, the sledge and the pick slanted on it, the mallet and the chisel at his belt, the plumb at his belt, the
  // rope coiled on his shoulder — and comes to his hand in ≤ 90 ms on a stroke or an arm (a short arc, no pop). One tool at a time.
  // The hang is a pose in the spine's frame (spine-local, bind units); the tool's bone is moved from the hand's frame to it by k (0 hand · 1 hung).
  const HANG = {   // p: where the grip sits · d: where the handle points (spine-local); no d: upright (the plumb)
    hammer: { p: [-0.38, 0.62, -0.62], d: [1, 0.18, 0] }, sledge: { p: [-0.42, -0.28, -0.64], d: [0.5, 1, 0] }, pick: { p: [0.42, -0.28, -0.7], d: [-0.5, 1, 0] },
    mallet: { p: [-0.64, 0.25, -0.05], d: [0, -1, 0.12] }, chisel: { p: [0.62, 0.3, -0.05], d: [0, -1, 0.05] }, plumb: { p: [-0.62, 0.4, 0.0], d: null },
  };
  for (const k in HANG) { const q = HANG[k]; q.q = new THREE.Quaternion(); if (q.d) q.q.setFromUnitVectors(Z_, new THREE.Vector3(q.d[0], q.d[1], q.d[2]).normalize()); q.v = new THREE.Vector3(q.p[0], q.p[1], q.p[2]); }
  const TM = { sp: new THREE.Matrix4(), h: new THREE.Matrix4(), g: new THREE.Matrix4(), H: new THREE.Matrix4(), i: new THREE.Matrix4() };
  const TV = { a: new THREE.Vector3(), b: new THREE.Vector3(), s: new THREE.Vector3() }, TQ = { a: new THREE.Quaternion(), b: new THREE.Quaternion() };
  /** the tool bone `id` ('R' right hand · 'L' left) at blend k between the hand and its hook */
  function toolHang(bone, side, kind, k) {
    const b = HN, hg = HANG[kind]; if (!hg) return;
    b.hips.updateMatrix(); b.spine.updateMatrix();
    const ua = side === 'R' ? b.uArmR : b.uArmL, fa = side === 'R' ? b.fArmR : b.fArmL, ha = side === 'R' ? b.handR : b.handL;
    ua.updateMatrix(); fa.updateMatrix(); ha.updateMatrix();
    TM.sp.multiplyMatrices(b.hips.matrix, b.spine.matrix);
    TM.h.copy(TM.sp).multiply(ua.matrix).multiply(fa.matrix).multiply(ha.matrix);          // the hand bone's model-space frame
    TM.i.copy(TM.h).multiply(TM.g.makeTranslation(0, -HL.palm, 0.02));                      // the grip in the hand
    TM.i.decompose(TV.a, TQ.a, TV.s);
    TM.g.copy(TM.sp).multiply(TM.H.compose(hg.v, hg.q, TV.s.set(1, 1, 1)));                 // the grip on its hook
    TM.g.decompose(TV.b, TQ.b, TV.s);
    const u = k * k * (3 - 2 * k);
    TV.a.lerp(TV.b, u); TV.a.y += Math.sin(Math.PI * u) * 0.42;                             // (a short arc up and over)
    TQ.a.slerp(TQ.b, u);
    TM.H.compose(TV.a, TQ.a, TV.s.set(1, 1, 1));
    TM.g.copy(TM.h).invert().multiply(TM.H);                                                // → the bone's local, in the hand's frame
    TM.g.decompose(bone.position, bone.quaternion, TV.s);
  }
  // ── /tools21 ──
  function toolsUpdate(S, dt) {
    // ── site12 ── (N59) between strokes at the altar being built, never an iron tool in his hand: the wooden mallet
    if (!S && IRON_TOOLS[hero.held] && atAltar()) hero.held = 'mallet';
    const want = S ? S.tool : hero.held;
    for (const k in TOOL_BONES) HN[TOOL_BONES[k]].scale.setScalar(k === want ? (HB.tierScale[HB.toolTier(k) - 1] || 1) : 1e-4);   // ── tools21 ── (the top tier's head is bigger)
    // ── tools21 ── hung or in hand: k eases to the target (to the hand ≤ 90 ms, to the hook 0.28 s)
    { const tgt = hero.toolIn ? 0 : 1; hero.hungK = hero.hungK == null ? 1 : hero.hungK; hero.hungK = tgt < hero.hungK ? Math.max(tgt, hero.hungK - dt / 0.09) : Math.min(tgt, hero.hungK + dt / 0.28); }
    hero.chiselOn += ((S && S.chisel ? 1 : hero.held === 'mallet' && hero.chiselKeep > 0 ? 1 : 0) - hero.chiselOn) * Math.min(1, dt * 20);
    if (hero.chiselOn > 0.5) hero.chiselSeen = 1;
    HN.tChisel.scale.setScalar((hero.chiselOn > 0.5 || (hero.chiselSeen && hero.held === 'mallet' && !S && hero.hungK > 0.3)) ? (HB.tierScale[HB.toolTier('chisel') - 1] || 1) : 1e-4);   // ── tools21 ── (hung at his belt after the first chisel work)
    if (want === 'plumb') {
      // the plumb hangs from the palm, swinging a little and settling
      const k = S ? Math.exp(-S.t * 4) : 0, sw = Math.sin(time * 9) * 0.35 * k;
      hQ.setFromAxisAngle(X_, sw); hQ2.copy(hQh).invert().multiply(hQ);
      HN.tPlumb.quaternion.copy(hQ2);
    }
    if (want === 'rope' && S) {
      // aim the rope from the right palm at its target, stretched to reach it
      hA.set(0, -HL.palm, 0.02).applyQuaternion(PZ.QR).add(PZ.WR);
      hB.copy(S.Cm).sub(hA); const L = hB.length(); hB.multiplyScalar(1 / Math.max(L, 1e-4));
      hQ.setFromUnitVectors(Z_, hB); HN.tRope.quaternion.copy(hQ2.copy(PZ.QR).invert().multiply(hQ));
      HN.tRope.scale.set(1, 1, Math.max(0.01, L));
    } else HN.tRope.scale.setScalar(1e-4);
    if (want !== 'carry') HN.tCarry.position.set(0, 1.4, 0.3);
    // ── tools21 ── the hang (only the bone that is shown; k 0 leaves the hand's own pose untouched)
    HN.tCoil.scale.setScalar(want === 'rope' && !S ? (HB.tierScale[HB.toolTier('rope') - 1] || 1) : 1e-4);
    if (hero.hungK > 0.001) {
      if (HANG[want]) toolHang(HN[TOOL_BONES[want]], 'R', want, hero.hungK);
      if (HN.tChisel.scale.x > 0.5) toolHang(HN.tChisel, 'L', 'chisel', hero.hungK);
    }
    // ── /tools21 ──
  }
  function wpUpdate(dt) {
    const R = HB.wpRoot;
    // (v27: the banker stands on the ground as it is NOW — the Mount's bay opens over 2.2 s (uPitK) and its floor rises with the
    //  courses; a banker set up at the old height hung 12 amot in the air, and the ring with it: the ring probe's first strike)
    if (wp.state) { const gy = groundAt(wp.x, wp.z); if (Number.isFinite(gy) && Math.abs(gy - wp.y) > 0.02) wp.y = gy; }
    R.position.set(wp.x, wp.y, wp.z); R.rotation.set(0, wp.yaw, 0);
    wp.pop = Math.max(0, wp.pop - dt * 3.5);
    const k = 1 - 0.18 * Math.sin(wp.pop * Math.PI) * wp.pop;
    HN.wpBanker.scale.setScalar(wp.state && wp.state !== 'quarry' ? 1 : 1e-4);
    for (const s in WP_STATES) {
      const bn = HN[WP_STATES[s]];
      if (s === wp.state) { bn.scale.set(k, 1 / k, k); } else bn.scale.setScalar(1e-4);
    }
    HN.wp.scale.setScalar(wp.state ? 1 : 1e-4);
  }

  function heroUpdate(dt) {
    if (!hero.vis) { glows.off(G_LANTERN); glows.off(G_AURA); return; }
    const H = hero;
    // walking
    let moving = false;
    if (H.door) {
      H.door.t += dt;
      const u = H.door.t / 0.22;
      if (H.door.phase === 0) { H.fade = 1 - clamp(u, 0, 1); if (u >= 1) { dustBurst(H.x, H.y + 0.5, H.z, 6, 3, 2, 1); H.x = H.door.x; H.z = H.door.z; H.y = groundAt(H.x, H.z); H.door.phase = 1; H.door.t = 0; dustBurst(H.x, H.y + 0.5, H.z, 6, 3, 2, 1); } }
      else { H.fade = clamp(u, 0, 1); if (u >= 1) { H.door = null; H.fade = 1; } }
    } else if (TWD.on) moving = twinStep(H, dt);   // ── twin17 ── (the left thumb wins over a walk the game asked for: it goes on at the release) ── /twin17 ──
    else if (H.path) {
      const p = H.path[H.seg], dx = p.x - H.x, dz = p.z - H.z, d = Math.hypot(dx, dz), step = H.speed * dt;
      if (d <= step || d < 0.05) {
        H.x = p.x; H.z = p.z;
        if (p.doorNext && H.path[H.seg + 1]) { const q = H.path[H.seg + 1]; H.door = { phase: 0, t: 0, x: q.x, z: q.z }; H.seg++; }
        H.seg++;
        if (H.seg >= H.path.length) {
          H.path = null; H.at = H.target.key; H.region = H.target.r;
          wpArrive(H.target);
          if (H.resolve) { const r = H.resolve; H.resolve = null; H.arriving = r; }
        }
      } else {
        H.x += dx / d * step; H.z += dz / d * step; moving = true;
        const want = Math.atan2(dx, dz); let dy = want - H.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); H.yaw += dy * Math.min(1, dt * 12);
      }
    }
    // ── nav19 ── the compass's quick walk leaves a dust trail at his heels (one pooled burst every 50 ms); it ends with the walk
    if (H.dash) { if (!H.path && !H.door) H.dash = 0; else if (moving && H.dash === 1 && (H.dashT -= dt) <= 0) { H.dashT = 0.05; dust.spawn(H.x, H.y + 0.3, H.z, 3, PO(1.2, 0.4, 1.6, 1.2, 0.9, 2.6, 0.9, -0.3, 1.6, 0.55)); } }
    // ── /nav19 ──
    if (!moving && H.face) {
      const want = Math.atan2(H.face[0] - H.x, H.face[1] - H.z); let dy = want - H.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      H.yaw += dy * Math.min(1, dt * 10);
      if (Math.abs(dy) < 0.05) { H.face = null; if (H.arriving) { const r = H.arriving; H.arriving = null; r(true); } }
    } else if (!moving && H.arriving) { const r = H.arriving; H.arriving = null; r(true); }
    // ── nav19 ── (note 12) a stroke struck while the thumb walks him: its planted step (from where he stood at the tap) is dropped — it
    // waited for him to stop, then slid him back there and turned him to the banker, away from where the thumb had walked him
    if (H.step && moving && TWD.on) H.step = null;
    // ── /nav19 ──
    // the small step that plants the feet for a stroke
    let stepping = 0;
    if (H.step && !moving) {
      const st = H.step; st.t += dt; const u = clamp(st.t / st.dur, 0, 1), e = easeIO(u);
      H.x = lerp(st.x0, st.x, e); H.z = lerp(st.z0, st.z, e);
      let dyw = st.yaw - st.yaw0; dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw)); H.yaw = st.yaw0 + dyw * e;
      stepping = Math.sin(u * Math.PI);
      if (u >= 1) H.step = null;
    }
    // ── site14 ── (the owner, 30.9 23:27: "הדמות עדיין לפעמים צפה באוויר או שוקעת"; BRAIN14-SITE14 cause 1) his feet ON the ground
    // as shown, every frame: the old filter lagged s·v/14 behind it (0.16–1.1 amah on the Mount's slopes at his 11–30 amot/s,
    // sinking uphill and floating down); a stair's half-amah tread is taken as a step. A walk over an edge of more than an amah
    // (a floor with no stairs there yet) fades out and back like a gate, so he is never seen in the air or inside a floor (d)
    const gy = groundAt(H.x, H.z);
    // (an edge: the ground jumps more than an amah within half an amah — a slope of the Mount's rock never does)
    let edge = false;
    if (moving && H.path && H.path[H.seg]) {
      const p = H.path[H.seg], ex = p.x - H.x, ez = p.z - H.z, el = Math.hypot(ex, ez) || 1, lim = Math.min(el, Math.max(1.1, H.speed * 0.12));
      let g0 = gy;
      for (let k = 0.45; k <= lim + 1e-6; k += 0.45) { const g2 = groundAt(H.x + ex / el * k, H.z + ez / el * k); if (Math.abs(g2 - g0) > 1.05) { edge = true; break; } g0 = g2; }
    }
    const stepD = H.px === undefined ? 0 : Math.hypot(H.x - H.px, H.z - H.pz); H.px = H.x; H.pz = H.z;
    const gyL = gy + TW.lift;   // ── site15 ── (on the treadwheel's bottom tread: no edge there)
    if (Math.abs(gyL - H.y) > 1.05 + 2.2 * stepD && !H.door) { H.edgeT = 0.14; if (H.edgeF > 0.5) dustBurst(H.x, gy + 0.5, H.z, 6, 3, 2, 1); }
    H.edgeT = Math.max(0, (H.edgeT || 0) - dt);
    H.edgeF = clamp((H.edgeF === undefined ? 1 : H.edgeF) + ((edge || H.edgeT > 0 ? 0 : 1) - (H.edgeF === undefined ? 1 : H.edgeF)) * Math.min(1, dt * 22), 0, 1);
    H.y = gyL;   // ── site15 ── (inside the treadwheel: on the bottom tread, 1.2 over the crane's base)
    // ── /site14 ──
    const inWheel = !moving && TW.on && TW.inWheel;   // ── site15 ── המנופאי: he walks the wheel in place at the model's pace
    H.walkAmt += ((moving ? 1 : inWheel ? clamp(TW.v / 0.8, 0, 1) : 0) - H.walkAmt) * Math.min(1, dt * 10);
    const run = clamp((H.speed - 11) / 14, 0, 1);
    if (moving) H.ph += H.speed * dt / (2.2 * HERO_S) * Math.PI * 0.5;
    else if (inWheel) H.ph += TW.v * 3.6 * dt / (2.2 * HERO_S) * Math.PI * 0.5;
    if (inWheel && TW.kick > 0) { H.ph += dt * 12 * TW.kick; H.walkAmt = Math.max(H.walkAmt, TW.kick); TW.kick = Math.max(0, TW.kick - dt * 4); }   // ── crafta19 ── (the touch-down lifts his foot at once — the step's first frame; the swipe lands it) ── /crafta19 ──
    if (stepping) H.ph += dt * 9;
    H.breath += dt;
    gestWatch(dt);
    // the stroke (after the step)
    let S = H.stroke;
    if (S && !H.step) {
      const ev = strokePose(S, dt);
      if (ev === 'contact') heroImpact(S);
      if (S.free && H.queue) { const q = H.queue; H.queue = null; startStroke(q); if (!H.step) strokePose(H.stroke, 0); }
      else if (ev === 'end') { H.stroke = null; H.readyS = S; H.idle = 0; H.chiselKeep = S.chisel ? 1 : 0; if (H.gestQ) { H.gest = H.gestQ; H.gestQ = null; } }
    } else if (S && H.step) {
      // stepping into place: the arms start to rise
      PZ.look = S.Cm;
    }
    const wa = H.walkAmt, sw = Math.sin(H.ph), br = Math.sin(H.breath * 1.9);
    // ── crafta19 ── armed: a walk drops it (the game arms him again where he stops to work); a gesture's end, or a stroke's, plans it again
    if (H.armed && (moving || H.path || H.door || (TW.on && TW.inWheel))) H.armed = null;
    if (H.armed && !H.stroke && !H.step && !H.gest && (!H.readyS || !H.readyS.K || H.readyS.K.top == null)) armPlan();
    // ── /crafta19 ──
    if (!H.stroke || H.step) {
      H.idle += dt;
      poseSnap();
      const R = H.readyS;
      // ── people7 ── a gesture plays over the standing pose (it ends the ready pose)
      const G = H.gest && !moving && !H.step ? H.gest : null;
      if (G) { G.t += dt; if (G.t >= G.dur) { gestEnd(true); } else if (R) { H.readyS = null; H.chiselKeep = 0; } }
      if (!H.gest && R && (H.idle < 1.6 || (H.armed && R.K.top != null)) && !moving && !stepping && R.kk !== 'pull' && R.kk !== 'carry') {   // ── crafta19 ── (armed: held as long as he is armed) ── /crafta19 ──
        // between strokes: hold the ready pose, breathing
        const up = !!(H.armed && R.K.top != null);   // ── crafta19 ── the tool UP at the swing's top (the touch is the fall), breathing ── /crafta19 ──
        finishBody(up ? R.bow * 0.35 - 0.06 + br * 0.012 : R.bow * 0.8 + br * 0.012, up ? 0.02 : R.drop * 0.6, up ? (R.chisel ? -0.08 : -0.3) : 0, up ? -0.05 : 0.02, 1);
        if (R.kk === 'measure') { PZ.WR.copy(R.Wc); PZ.QR.copy(R.Qc); restLeft(0.15); }
        else { swingAt(R, up ? (R.topTh != null ? R.topTh : R.K.top) * (0.97 + 0.03 * br) : R.K.ready, PZ.WR, PZ.QR); if (R.two) { PZ.WL.copy(PZ.WR).addScaledVector(hE.set(0, 0, 1).applyQuaternion(PZ.QR), HTOOL[R.tool].two); PZ.QL.copy(PZ.QR); } else if (R.chisel) { PZ.WL.copy(R.WLc); PZ.QL.copy(R.QLc); } else restLeft(0.2); }
        PZ.look = R.Cm;
      } else {
        if (R && H.idle >= 1.6) { H.readyS = null; H.chiselKeep = 0; }
        // walking or standing: the stride, the arms swinging (the tool arm less), breathing, weight shifts and glances
        const k = H.work;
        const shift = Math.sin(H.breath * 0.37) * 0.035 * (1 - wa);
        PZ.drop = 0.02 + 0.05 * wa + Math.abs(Math.cos(H.ph)) * -0.06 * wa + 0.03 * stepping;
        PZ.bow = (0.1 + run * 0.12) * wa + br * 0.012 * (1 - wa) + 0.04;
        PZ.twist = sw * 0.12 * wa; PZ.sx = shift; PZ.roll = -shift * 0.8 + sw * 0.03 * wa;
        const str = 0.34 * Math.max(wa, stepping);
        PZ.FL.set(0.21, 0.13 + Math.max(0, -Math.cos(H.ph)) * 0.16 * Math.max(wa, stepping), 0.04 + sw * str);
        PZ.FR.set(-0.21, 0.13 + Math.max(0, Math.cos(H.ph)) * 0.16 * Math.max(wa, stepping), -0.04 - sw * str);
        restRight(0.12);
        hA.set(0, 0, 0); shoulderAt(-1, PZ.drop, PZ.bow, PZ.twist, PZ.roll, PZ.sx, hF);
        hB.copy(PZ.WR).sub(hF).applyAxisAngle(X_, -sw * 0.28 * wa); PZ.WR.copy(hF).add(hB);
        restLeft(0.1);
        shoulderAt(1, PZ.drop, PZ.bow, PZ.twist, PZ.roll, PZ.sx, hF);
        hB.copy(PZ.WL).sub(hF).applyAxisAngle(X_, sw * 0.5 * wa); PZ.WL.copy(hF).add(hB);
        // glances when idle
        H.glanceT -= dt;
        if (H.glanceT <= 0) { H.glanceT = 2.5 + Math.random() * 4; H.glance = (Math.random() - 0.5) * 1.1; }
        PZ.hy = moving ? 0 : H.glance * (1 - wa); PZ.hp = moving ? 0.05 : 0.04;
        if (!H.step) PZ.look = null;
        if (H.readyS && moving) H.readyS = null;
        H.work = k;
        // ── people7 ── his life between strokes: now and then, at his banker, a gesture of his own
        if (H.gest && !moving) poseGesture(H.gest);
        else if (!moving && !stepping && H.idle > 2.4 && !CR.kind && (wp.state ? Math.hypot(wp.x - H.x, wp.z - H.z) < 5 * HERO_S : !!H.at)) {   // ── site16 ── (no idle gesture with his hands on the saw / the cord)
          H.idleNext = (H.idleNext === undefined ? 1.5 : H.idleNext) - dt;
          if (H.idleNext <= 0) { H.idleNext = 5 + Math.random() * 5; H.idleI = ((H.idleI || 0) + 1) % IDLE_G.length; heroGesture(IDLE_G[H.idleI]); }
        }
      }
      if (craftPosing() && !moving && !stepping && !H.gest) craftPose();   // ── site16 ── his hands on the saw / the cord
      poseEase(Math.min(1, dt * 11), Math.min(1, dt * (moving ? 30 : 14)));
    }
    applyPose();
    // ── people7 ── he blinks every few seconds (the lids fold down from the top of the eyes)
    H.blinkT = (H.blinkT === undefined ? 2 : H.blinkT) - dt;
    if (H.blinkT <= 0) { H.blinkT = 2.4 + Math.random() * 3.6; H.blink = 0.17; }
    if (H.blink > 0) { H.blink -= dt; const b = Math.sin(clamp(1 - H.blink / 0.17, 0, 1) * Math.PI); HN.lids.scale.set(1, Math.max(0.02, b), 1); if (H.blink <= 0) HN.lids.scale.setScalar(1e-4); }
    H.toolIn = !!(H.stroke || H.step || H.armed || craftPosing() || (H.readyS && !moving && !stepping && !H.gest && H.idle < 1.6));   // ── tools21 ── (in his hand: a stroke, the arm, the ready pose a moment after it; else hung)
    toolsUpdate(H.stroke, dt);
    wpUpdate(dt);
    H.mesh.position.set(H.x, H.y, H.z); H.mesh.rotation.y = H.yaw;
    const fv = Math.min(H.fade, H.edgeF === undefined ? 1 : H.edgeF);   // ── site14 ── (the edge's fade)
    const s = HERO_S * (fv < 1 ? Math.max(0.001, fv) : 1);
    H.mesh.scale.setScalar(s);
    H.ring.position.set(H.x, H.y + 0.06, H.z);
    H.ring.material.opacity = 0.75 + 0.25 * Math.sin(time * 3.2);
    H.ring.scale.setScalar(HERO_S * 3.1 * (fv < 1 ? fv : 1) * (1 + comboV * 0.12));
    // after dark: the lantern (hung on the banker's post while he works there, in his left hand when he walks) and a thin
    // cool rim; a combo warms the rim to gold, brightens the ring and sends up motes
    const lampOn = nightK > 0.02 && H.fade > 0.3;
    const atBanker = wp.state && wp.state !== 'quarry' && Math.hypot(wp.x - H.x, wp.z - H.z) < 5 * HERO_S && !moving;
    if (atBanker) { wpToWorld(0.72, 1.55, 0.3, hA); w2m(hA, HN.lamp.position); }
    else HN.lamp.position.set(0, -HL.palm, 0.02).applyQuaternion(PZ.QL).add(PZ.WL);
    HN.lamp.quaternion.identity();
    HN.lamp.scale.setScalar(lampOn ? 1 : 1e-4);
    const cv = comboV, fl = 0.9 + 0.1 * Math.sin(time * 17) * Math.sin(time * 5.3);
    HB.U.uLamp.value.setRGB(7, 4.2, 1.5).multiplyScalar(nightK * fl);
    HB.U.uRim.value.setRGB(0.12 * nightK + 0.7 * cv, 0.16 * nightK + 0.45 * cv, 0.26 * nightK + 0.1 * cv);
    H.ring.material.color.setRGB(1 + 0.6 * cv, 1 + 0.3 * cv, 1 - 0.2 * cv);
    if (lampOn) {
      hA.copy(HN.lamp.position).sub(HB.lampBind).add(HB.lampAt);
      m2w(hA, lampW);
      glows.set(G_LANTERN, lampW.x, lampW.y, lampW.z, 2.6, cLantern, 0.75 * nightK * fl, 0.12);
    } else glows.off(G_LANTERN);
    if (cv > 0 && H.fade > 0.5) {
      glows.set(G_AURA, H.x, H.y + 2.2 * HERO_S, H.z, 6.5 + 2.5 * cv, cAura, 0.05 + 0.1 * cv, 0);
      H.mote += dt * (2 + 8 * cv);
      while (H.mote > 1) {
        H.mote -= 1;
        const a = Math.random() * 6.2832, rr = 1.6 + Math.random() * 1.4;
        spark.spawn(H.x + Math.cos(a) * rr, H.y + 0.4 + Math.random() * 2.5, H.z + Math.sin(a) * rr, 1, PO(0.2, 0, 0.3, 3 + 2 * cv, 0.35 + 0.25 * cv, 0.1, 1.1, -0.8, 0.4, 1, true));
      }
    } else glows.off(G_AURA);
  }
  // the hero's public API (stages.hero): the game (BUILD) and the hooks (FUN) call it, guarded; every promise resolves
  const heroApi = {
    walkTo: heroWalkTo, swing: heroSwing, place: heroPlace, show: (v) => { hero.vis = !!v; hero.mesh.visible = hero.ring.visible = !!v; if (!v) heroCancel(); },
    twinSite: (id) => { TWD.site = id || 'har'; TWD.twin = !!id; },   // ── twin18 ── ── /twin18 ── (── nav19 ── TWD.twin: two thumbs on)
    dash: heroDash, get dashing() { return hero.dash || 0; }, navLog: () => NAV_LOG.slice(),   // ── nav19 ── ── /nav19 ──
    // ── engine22 ── Phase B's two thumbs: the Temple's own solids (xtra(x, z, x0, z0) → true = blocked) and a place by coordinates (the builder's feet)
    twinExtra: (f) => { TWD.xtra = typeof f === 'function' ? f : null; },
    twinPass: (f) => { TWD.pass = typeof f === 'function' ? f : null; },   // ── recovered (build 26) ── (pass(x, z) → true = never solid here)
    setPos: (x, z, yaw) => { if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); } heroCancel(); hero.path = null; hero.door = null; hero.fade = 1; hero.x = x; hero.z = z; hero.y = groundAt(x, z); if (Number.isFinite(yaw)) hero.yaw = yaw; hero.face = null; hero.vis = true; hero.mesh.visible = hero.ring.visible = true; },
    // ── /engine22 ──
    get speedMul() { return hero.speedMul || 1; }, set speedMul(v) { hero.speedMul = v > 0 && v < 4 ? +v : 1; },   // ── shift29 ── ── /shift29 ──
    drive: heroDrive, get driving() { return TWD.on; }, get twinBlocked() { return TWD.blocked; }, get twinFreed() { return TWD.freed; }, free: (x, z, x0, z0) => twinFree(x, z, x0, z0), reach: (x0, z0, x1, z1, max) => twinReach(x0, z0, x1, z1, max), line: (x0, z0, x1, z1) => twinLine(x0, z0, x1, z1),   // ── twin18 ── (line) ── /twin18 ──   // ── twin17 ── ── /twin17 ──
    get walking() { return !!hero.path; },   // ── twin17 ── ── /twin17 ──
    ks: () => (KS.on && KS.s ? { on: true, x: KS.hx, y: KS.s.y + KS.hy + KS.s.h / 2, z: KS.hz, cy: KS.s.y + KS.hy, sy: KS.s.y, landT: KS.landT, gone: KS.gone, done: KS.done } : { on: false }),   // ── site20 ── (the test's eyes) ── /site20 ──
    workersNear: (x, z, r) => { const o = []; for (let i = 0; i < nWork; i++) { const w = W[i]; const px = w.x + (w.o20x || 0), pz = w.z + (w.o20z || 0), d = Math.hypot(px - x, pz - z); if (d <= r) o.push([w.role, +px.toFixed(1), +pz.toFixed(1), +d.toFixed(1)]); } return o; },   // ── site20 ── (the test's eyes: the stage's own workers as drawn) ── /site20 ──
    s20: () => ({ act: S20.act, on: S20.on, ax: S20.ax, az: S20.az, nx: S20.nx, nz: S20.nz, ux: S20.ux, uz: S20.uz, Lr: S20.Lr, top: S20.top, topE: S20.topE, base: S20.base, topAt: (x, z) => s20Top(x, z) }),   // ── site20 ── (the wall's plan A: the test's eyes) ── /site20 ──
    twinState: () => `${TWD.on ? 'D' : ''}${hero.path ? 'P' : ''}${hero.door ? 'R' : ''}${hero.step ? 'T' : ''}${hero.stroke ? 'K' : ''}${hero.vis ? '' : 'H'} b${TWD.blocked} f${TWD.freed}`,   // ── twin17 ── (debug) ── /twin17 ──
    get position() { return new THREE.Vector3(hero.x, hero.y, hero.z); }, get at() { return hero.at; }, get yaw() { return hero.yaw; }, get mesh() { return hero.mesh; }, get ring() { return hero.ring; },   // ── fable32 (build 15) ── (hero35 hides the box-figure under the real one) ── /fable32 ──
    setTool, get tool() { return hero.tool; },
    get held() { return hero.stroke ? hero.stroke.tool : hero.held; },   // ── site12 ── (N59) the tool in his hand this frame
    /** one stroke → Promise<bool> on the contact frame. kind: dress|tamp|split|pick|measure|pull|carry */
    act: heroAct,
    // ── crafta19 ── arm(kind, target) → bool: the tool held up at the swing's top until a stroke ({ snap: true }: the fall alone, contact
    // ≈ 90 ms) or a walk; arm(null) lowers it. armed → { kind, n } | null · stroke → { t, kk, snap, hit } | null (tests: his act's first frame)
    standOf: (target) => { const s = spotFor(target); return s ? { x: s.x, z: s.z } : null; },
    arm: heroArm, get armed() { return hero.armed ? { kind: hero.armed.kind, n: hero.armed.n | 0, up: !!(hero.readyS && !hero.stroke && hero.readyS.K && hero.readyS.K.top != null) } : null; },
    get stroke() { const S = hero.stroke; return S ? { t: S.t, kk: S.kk, snap: !!S.snap, hit: !!S.hit } : null; },
    _ca: () => { const R = hero.readyS, v = (q) => q ? [q.x, q.y, q.z].map((n) => +n.toFixed(2)) : null; return { R: R ? { kk: R.kk, top: R.K.top, Wc: v(R.Wc), P: v(R.P), axis: v(R.axis), Cm: v(R.Cm) } : null, idle: +hero.idle.toFixed(2), step: !!hero.step, gest: hero.gest ? hero.gest.kind : null, stroke: !!hero.stroke, path: !!hero.path }; },
    // ── /crafta19 ──
    /** cb({kind, tool, x, y, z, target, quality, t, workpiece}) at every contact → off() */
    onImpact(cb) { if (typeof cb !== 'function') return () => {}; impactCbs.push(cb); return () => { const i = impactCbs.indexOf(cb); if (i >= 0) impactCbs.splice(i, 1); }; },
    /** the stone on his banker: 'rough'|'drafted'|'dressed'|'quarry'|'field'|null; at: {x, z, yaw} | a site id | a workSpot. No args → the state */
    workpiece(state, at) {
      if (state === undefined) return wp.state;
      wp.auto = false;
      // ── site11 ── (STAGING §8, מדות ג, ד: the altar's stones are whole, never touched by iron) at the altar — his wooden
      // mallet in hand, or a field site named — the stone on his banker is a whole field stone whatever state the caller
      // asks: carried, fitted and seated, never drafted or dressed
      if ((state === 'rough' || state === 'drafted' || state === 'dressed') && (hero.tool === 'wood' || (typeof at === 'string' && DEF[at] && DEF[at].stone === 'field'))) state = 'field';
      if (at && typeof at === 'string' && DEF[at]) { const s = DEF[at].spot; wpFront(s.x, s.z, Math.atan2(s.face[0] - s.x, s.face[1] - s.z)); }
      else if (at && typeof at === 'object' && at.stone && typeof at.stone.x === 'number') wpPlace(at.stone.x, at.stone.z, at.stone.yaw ?? wp.yaw);
      else if (at && typeof at === 'object' && typeof at.x === 'number') { if (Array.isArray(at.face)) wpFront(at.x, at.z, Math.atan2(at.face[0] - at.x, at.face[1] - at.z)); else wpPlace(at.x, at.z, at.yaw ?? wp.yaw); }
      else if (!wp.state && state) wpFront(hero.x, hero.z, hero.yaw);
      wpSet(state);
      return wp.state;
    },
    /** the current or last contact point {x, y, z} */
    contact(out) { const o = out && typeof out === 'object' ? out : {}; o.x = hero.contact.x; o.y = hero.contact.y; o.z = hero.contact.z; return o; },
    get busy() { return !!hero.stroke; },
    /** ── people7 ── his look: { skin: 0–3, hair: 0–3, beard: 'young'|'short'|'full', avnet: bool } → the look now (no args: read it) */
    look: (o) => HB.look(o),
    // ── tools21 ── toolState() → { held, hung (k > .5), k, inHand: [the tools shown with k < .5], shown: [every tool shown], tier, color } (tests: the tool on his back, in his hand)
    toolState() {
      const shown = [];
      for (const k in TOOL_BONES) if (HN[TOOL_BONES[k]].scale.x > 0.5) shown.push(k);
      if (HN.tChisel.scale.x > 0.5) shown.push('chisel');
      const kk = hero.hungK == null ? 1 : hero.hungK, h = hero.stroke ? hero.stroke.tool : hero.held;
      return { held: h, hung: kk > 0.5, k: +kk.toFixed(3), shown, inHand: kk < 0.5 ? shown.filter((x) => x !== 'carry' && !(x === 'chisel' && shown.includes('mallet'))) : [],   // (the chisel is the mallet's pair: one tool)
      coil: HN.tCoil.scale.x > 0.5, tier: HB.toolTier(h), color: HB.toolColor(h), tiers: { hammer: HB.toolTier('hammer'), mallet: HB.toolTier('mallet') }, wood: hero.tool === 'wood' };
    },
    toolColor: (id) => HB.toolColor(id), toolTier: (id) => HB.toolTier(id),
    // ── /tools21 ──
    /** ── people7 ── a gesture → Promise<bool> at its end: 'gotit' | 'proud' | 'wipe' | 'think' | 'stretch' (opts.hold: twice as long) */
    gesture: heroGesture,
    /** ── people7 ── a camera that frames him: { p: [x, y, z], t: [x, y, z] } from his front-left, `dist` amot away (default
     *  40: he stands ≈ 90 px tall on a 390×844 phone at fov 45), `el` degrees up (default 24) — e.g. the opening's last frame.
     *  opts: { az } radians from his facing (0 in front, π behind; default 0.55), or 'shoulder' (over his left shoulder, what
     *  he works on beside him: a boulder or the quarry face never stands between him and the camera) */
    view(dist = 40, el = 24, opts) {
      const az = opts === 'shoulder' ? 2.45 : opts && typeof opts === 'object' && Number.isFinite(+opts.az) ? +opts.az : 0.55;
      const d = clamp(+dist || 40, 6, 400), e = clamp(+el || 24, 2, 80) * Math.PI / 180, a = hero.yaw + az, cy = hero.y + 2.4 * HERO_S;
      return { p: [hero.x + Math.sin(a) * Math.cos(e) * d, cy + Math.sin(e) * d, hero.z + Math.cos(a) * Math.cos(e) * d], t: [hero.x, cy, hero.z] };
    },
    get gesturing() { return hero.gest ? hero.gest.kind : null; },
    _pose: PZ, _wp: wp,
  };
  // ── /hero ──

  /* ── boulders ── */
  function boulderMatrices(i) {
    const b = bSt[i];
    const gy = hill.heightAt(b.x, b.z) - b.r * 0.12;
    for (let c = 0; c < 3; c++) {
      let sc = b.state > 0 || b.anim === 'shatter' ? 1 : 0;
      // ── site8 ── split: its three chunks lie round the patch as rubble, and go (carted off) as `rub` runs down
      if (b.state <= 0 && b.anim !== 'shatter' && b.rub > 0.001) {
        const [dx, dz] = BC.dirs[c], cyw = Math.cos(b.yaw), syw = Math.sin(b.yaw), wx = dx * cyw + dz * syw, wz = -dx * syw + dz * cyw;
        const k = 0.46 * Math.cbrt(b.rub), px = b.x + wx * b.r * 0.95, pz = b.z + wz * b.r * 0.95;
        tmpE.set(wz * 0.35, b.yaw + c, -wx * 0.35, 'YXZ'); tmpQ.setFromEuler(tmpE);
        tmpV.set(px, hill.heightAt(px, pz) - b.r * k * 0.1, pz); tmpS.set(b.r * k, b.r * b.sy * k, b.r * k * 0.95);
        tmpM.compose(tmpV, tmpQ, tmpS); bMesh[c].setMatrixAt(i, tmpM);
        continue;
      }
      let ox = 0, oy = 0, oz = 0, rx = 0, rz = 0;
      const [dx, dz] = BC.dirs[c];
      const cyw = Math.cos(b.yaw), syw = Math.sin(b.yaw);
      const wx = dx * cyw + dz * syw, wz = -dx * syw + dz * cyw;
      const cr = b.crack;
      ox = wx * cr * 0.55; oz = wz * cr * 0.55; rx = wz * cr * 0.12; rz = -wx * cr * 0.12;
      if (b.anim === 'shatter') {
        // (site8: the chunks spring apart and settle round the rock as rubble — they no longer vanish)
        const t = b.t, e = 1 - Math.pow(1 - Math.min(1, t / 0.7), 2);
        ox = wx * b.r * 0.95 * e; oz = wz * b.r * 0.95 * e; oy = 7 * t - 10 * t * t; if (oy < -b.r * 0.1) oy = -b.r * 0.1;
        if (t > 0.7) oy = Math.abs(Math.sin((t - 0.7) * Math.PI / 0.2)) * (1.3 - c * 0.3) * Math.exp(-(t - 0.7) * 3.2);   // ── crafta19 ── (the chunks bounce twice more as they settle) ── /crafta19 ──
        rx = wz * 0.35 * e; rz = -wx * 0.35 * e;
        sc = 1 - 0.54 * e;
      }
      if ((b.anim === 'crack' || b.anim === 'jolt') && b.t < 0.25) { const j = Math.sin(b.t * 90) * (b.anim === 'jolt' ? 0.12 : 0.18) * (1 - b.t / 0.25); ox += j; oz -= j; }
      tmpE.set(rx, b.yaw, rz, 'YXZ'); tmpQ.setFromEuler(tmpE);
      tmpV.set(b.x + ox, gy + oy, b.z + oz); tmpS.set(b.r * sc, b.r * b.sy * sc, b.r * sc * 0.95);
      tmpM.compose(tmpV, tmpQ, tmpS); bMesh[c].setMatrixAt(i, tmpM);
    }
  }
  function boulderAll() { for (let i = 0; i < bSt.length; i++) boulderMatrices(i); for (const m of bMesh) m.instanceMatrix.needsUpdate = true; }
  let bVisible = false;
  function setBoulders(states) {
    bSt.forEach((b, i) => { const s = states && states[i] !== undefined ? states[i] : 0; b.state = s; b.crack = s === 1 ? 1 : 0; b.anim = null;
      if (s > 0) { b.pt = -1; b.rub = 0; } else if (b.pt < 0) { b.pt = 90; b.rub = 0; } });   // ── site8 ── (a resync: the patches levelled, the rubble gone)
    workDirty = true; propsDirty = true;
    bVisible = bSt.some((b) => b.state > 0 || b.rub > 0.001);
    for (const m of bMesh) m.visible = bVisible || quarryOn;
    if (bSt.every((b) => b.state > 0) && ST.har.phase !== 'dig') survey.on = false;   // ── site8 ── (a new game's survey starts afresh)
    boulderAll(); requestShadow(true);
  }
  // hp: the boulder's remaining hit points after this hit (the game's count); without it one hit = one step
  function hitBoulder(i, hp) {
    const b = bSt[i];
    if (!b || b.state <= 0) return Promise.resolve(false);
    const gy = hill.heightAt(b.x, b.z);
    const to = hp === undefined || hp === null || !isFinite(+hp) ? b.state - 1 : Math.max(0, Math.floor(+hp));
    if (to >= b.state || (to > 1 && b.state > 1)) {
      // no visible step (a boulder with more hit points left): a jolt and a few chips
      if (to < b.state) b.state = to;
      b.anim = 'jolt'; b.t = 0;
      chips.spawn(b.x, gy + b.r * 0.6, b.z, 8, '#CFC4AC', { speed: 6, up: 8, size: 0.32, floor: gy });
      dustBurst(b.x, gy + b.r * 0.4, b.z, 5, 4, 3, 1.5);
      shake.t = 0.12; shake.amp = 0.25;
      return new Promise((res) => { b.done = res; });
    }
    if (to >= 1) {
      b.state = to; b.anim = 'crack'; b.t = 0;
      chips.spawn(b.x, gy + b.r * 0.6, b.z, 16, '#CFC4AC', { speed: 8, up: 11, size: 0.4, floor: gy });
      dustBurst(b.x, gy + b.r * 0.4, b.z, 10, 5, 5, 2);
      shake.t = 0.18; shake.amp = 0.35;
      return new Promise((res) => { b.done = res; });
    }
    b.state = 0; b.anim = 'shatter'; b.t = 0; b.pt = 0; b.rub = 1; workDirty = true; propsDirty = true;   // ── site8 ──
    chips.spawn(b.x, gy + b.r * 0.6, b.z, 46, '#D6CCB4', { speed: 14, up: 15, size: 0.55, floor: gy, life: 2.2 });
    dustBurst(b.x, gy + b.r * 0.5, b.z, 26, 8, 10, 4);
    sparkBurst(b.x, gy + b.r, b.z, 14, 6, 8);
    shake.t = 0.3; shake.amp = 0.6;
    return new Promise((res) => { b.done = res; });
  }
  function bouldersUpdate(dt) {
    let any = false;
    for (let i = 0; i < bSt.length; i++) {
      const b = bSt[i];
      if (!b.anim) continue;
      any = true; b.t += dt;
      if (b.anim === 'crack') { b.crack = Math.min(1, b.t / 0.18); if (b.t > 0.45) { b.anim = null; b.crack = 1; if (b.done) { const r = b.done; b.done = null; r(true); } requestShadow(true); } }
      else if (b.anim === 'jolt') { if (b.t > 0.3) { b.anim = null; if (b.done) { const r = b.done; b.done = null; r(true); } } }
      else if (b.t > 1.1) { b.anim = null; if (b.done) { const r = b.done; b.done = null; r(true); } bVisible = bSt.some((q) => q.state > 0 || q.rub > 0.001); for (const m of bMesh) m.visible = bVisible || quarryOn; requestShadow(true); }
      boulderMatrices(i);
    }
    if (any || (ST.har.status === 'building' && bVisible)) { if (!any) boulderAll(); for (const m of bMesh) m.instanceMatrix.needsUpdate = true; }
  }

  /* ── shadows are baked on demand (renderer.shadowMap.autoUpdate = false) ── */
  let shadowWant = false, shadowAge = 9;
  function requestShadow(now) { shadowWant = true; if (now) shadowAge = 9; }

  /* ── applying a stage's status ── */
  let dirtyGlobal = true;
  const nOf = (st) => (st.disp < FOUND || !st.lay ? 0 : Math.round((st.disp - FOUND) / (1 - FOUND) * st.lay.N));
  function applyStage(st, prev) {
    const s = st.status, building = s === 'building';
    if (st.lay && (!building || prev !== 'building')) { st.lay.pend = null; st.lay.pendTop = -1; st.lay.nwc = null; }   // ── flow10 ── (liftLand)
    if (building) { layout(st); st.lay.n = -1; stonesTo(st, nOf(st), true); } else if (st.lay) st.lay.n = -1;
    st.mats.forEach((m) => setBuilding(m, building));
    if (st.lc) st.lc.mats.forEach((m) => setBuilding(m, building));   // ── site13 ── (the chambers' own reveal)
    for (const m of st.meshes) m.customDepthMaterial = building ? st.depth : undefined;
    st.group.visible = s === 'done' || (building && st.disp >= FOUND);
    st.U.uY.value = building ? revealY(st) : 1e6;
    st.U.uGlow.value.setRGB(3.4, 2.25, 0.72).multiplyScalar(building ? 1 : 0);
    if (building && !st.scaff) { st.scaff = makeScaffold(st); if (st.scaff) st.scaff.shown = -1; }
    if (!building && st.scaff) {
      if (s === 'done' && prev === 'building') { st.scaff.remove = 0; st.scaff.from = st.scaff.P.m.count; st.scaff.fromB = st.scaff.Bd.m.count; removing.push(st.scaff); }
      else disposeScaffold(st.scaff);
      st.scaff = null;
    }
    craneDirty = true;
    if (building && !st.piles) { const d = st.def.crane; const L = Math.hypot(d.dir[0], d.dir[1]), fx = d.dir[0] / L, fz = d.dir[1] / L; const rp = d.H * Math.sin(d.mode === 'ground' ? 0.12 : Math.asin(clamp(d.reach / d.H, 0.1, 0.72))) + 1.2; st.piles = [[d.x + fx * rp, d.z + fz * rp, Math.atan2(fx, fz)]]; }
    propsDirty = true; workDirty = true; dirtyGlobal = true;
    requestShadow(true);
  }
  function applyGlobal() {
    dirtyGlobal = false;
    const all = list.every((s) => s.status === 'done');
    const altar = ['yesod', 'sovev', 'guf', 'karnot'].every(isDone);
    if (life) {
      if (ctx.setPhase) ctx.setPhase(all ? 'complete' : 'build'); else life.setPhase(all ? 'complete' : 'build');
      life.setFire(altar);
      life.setPilgrims(isDone('har'));
    }
    const hs = ST.har;
    hill.mesh.visible = hs.status !== 'done';
    hill.bushes.visible = hs.status !== 'done';   // ── site12 ── (the scrub goes where the works reach it: harCut)
    if (hs.status !== 'building') { hill.U.uFill.value = -1000; harCut(0); }
    // outlines: available sites pulse, the next two locked ones show faintly, building sites keep a thin line in the foundation phase
    const firstOpen = list.findIndex((s) => s.status !== 'done');
    let any = false;
    for (const st of list) {
      let v = 0;
      if (st.status === 'avail') v = 1;
      else if (st.status === 'building' && st.disp < FOUND) v = 0.35;
      else if (st.status === 'locked' && isDone('har') && firstOpen >= 0 && st.idx > firstOpen && st.idx <= firstOpen + 2 && list[firstOpen].status !== 'locked') v = 0.12;
      OL.I[st.idx] = OL.base[st.idx] = v; if (v > 0) any = true;
    }
    outline.visible = any;
    // the quarry exists from the platform's completion until the Temple is finished
    const qOn = isDone('har') && !all;
    if (qOn !== quarryOn) { quarryOn = qOn; quarryRocks(); propsDirty = true; workDirty = true; }
  }

  // Compile the reveal (BCLIP) shader variants ahead of time: one proxy per distinct material, compiled
  // against the real scene's lights. Programs are shared by cache key, so this warms every stage, and the
  // proxies are kept alive so the programs stay cached. Called automatically when a stage first leaves 'done'.
  let warmed = null;
  function prewarm() {
    if (warmed || !ctx.renderer) return warmed || Promise.resolve();
    ensureGhost();
    const ps = new THREE.Scene(), U = revealUniforms(), seen = new Set();
    warmScene = ps;
    const g = new THREE.BoxGeometry(1, 1, 1); g.setAttribute('aBase', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1));
    for (const st of list) for (const m of st.meshes) {
      const src = m.material, key = (m.isInstancedMesh ? 'I' : 'M') + src.customProgramCacheKey() + src.type + !!src.map + !!src.normalMap + !!src.alphaMap + src.side + src.transparent;
      if (seen.has(key)) continue; seen.add(key);
      const pm = buildMaterial(src, U, 10); pm.userData.bcCap = src.userData.bcCap; pm.userData.bcSide = src.userData.bcSide; setBuilding(pm, true);
      const o = m.isInstancedMesh ? new THREE.InstancedMesh(g, pm, 1) : new THREE.Mesh(g, pm);
      o.visible = false; ps.add(o);
    }
    // the scaffold's instanced timber is created lazily; give it a proxy too
    { const o = new THREE.InstancedMesh(poleGeo, woodMat, 1); o.setColorAt(0, new THREE.Color(1, 1, 1)); o.visible = false; ps.add(o); }
    // compile for the target the frame is really drawn into (the composer's HDR buffer: no tone mapping, linear output)
    const R2 = ctx.renderer, prev = R2.getRenderTarget(), rt = ctx.renderTarget ? ctx.renderTarget() : null;
    if (rt) R2.setRenderTarget(rt);
    // (async where the driver compiles in parallel; otherwise a one-off synchronous compile)
    const par = R2.compileAsync && R2.extensions && R2.extensions.has('KHR_parallel_shader_compile');
    try {
      const a = par ? R2.compileAsync(scene, camera) : Promise.resolve(R2.compile(scene, camera));
      const b = par ? R2.compileAsync(ps, camera, scene) : Promise.resolve(R2.compile(ps, camera, scene));
      warmed = Promise.all([a, b]).catch(() => {});
    } finally { R2.setRenderTarget(prev); }
    return warmed;
  }

  function setStage(id, status, progress, opts = {}) {
    const st = ST[id]; if (!st) return;
    if (!['locked', 'avail', 'building', 'done'].includes(status)) return;
    // a site the timelapse is replaying keeps playing: a live update only moves the end of its replay
    if (st.tl && !opts._tl) {
      if (!opts.instant && (status === 'building' || status === 'done')) { st.tl.to = { status, p: status === 'done' ? 1 : clamp(progress === undefined ? st.tl.to.p : +progress || 0, 0, 1) }; return; }
      tlDrop(st);
    }
    if (status !== 'done' && !warmed) prewarm();
    const prev = st.status;
    if (status === 'building' && prev !== 'building') st.seq = ++seqN;
    st.status = status;
    if (status === 'building') {
      const p = clamp(progress === undefined ? st.target : +progress || 0, 0, 1);
      st.target = p;
      if (prev !== 'building' || opts.instant) st.disp = p;
    } else { st.target = st.disp = status === 'done' ? 1 : 0; }
    applyStage(st, opts.instant ? null : prev);
    if (status === 'done' && prev === 'building' && !opts.instant) finishFX(st);
    // the golden vine hangs when the Ulam is finished (QA P1-3); an Ulam taken back down (a new game) takes it down
    if (id === 'ulam') { if (status !== 'done' && status !== 'building') vs.early = false; vineSync(!!opts.instant || prev === status); }
  }
  function setAll(status, opts = { instant: true }) { for (const st of list) setStage(st.id, status, status === 'building' ? 0 : undefined, opts); }

  /* ── FX triggers ── */
  const siteTopV = new THREE.Vector3();
  // points along the site's working faces (scaffold runs, else the footprint edges)
  function edgePoint(st, u, out) {
    const runs = st.def.scaff && st.def.scaff.runs;
    if (runs) { const run = runs[Math.floor(u * runs.length) % runs.length], t = (u * runs.length) % 1, [a, b, n] = run; return out.set(lerp(a[0], b[0], t) + n[0] * 2.5, run[3], lerp(a[1], b[1], t) + n[1] * 2.5); }
    const f = st.def.foot[Math.floor(u * st.def.foot.length) % st.def.foot.length], t = (u * st.def.foot.length) % 1, per = 2 * (f[2] - f[0] + f[3] - f[1]);
    let s = t * per; const w = f[2] - f[0], h = f[3] - f[1];
    if (s < w) return out.set(f[0] + s, st.base, f[1] - 1); s -= w;
    if (s < h) return out.set(f[2] + 1, st.base, f[1] + s); s -= h;
    if (s < w) return out.set(f[2] - s, st.base, f[3] + 1); s -= w;
    return out.set(f[0] - 1, st.base, f[3] - s);
  }
  const eP = new THREE.Vector3();
  function finishFX(st) {
    const fb = st.fb, cx = (fb.x0 + fb.x1) / 2, cz = (fb.z0 + fb.z1) / 2, size = Math.max(fb.x1 - fb.x0, fb.z1 - fb.z0);
    const n = clamp(Math.round(size / 18), 4, 22);
    for (let k = 0; k < n; k++) {
      edgePoint(st, (k + R() * 0.6) / n, eP);
      const y = st.id === 'har' ? groundAt(eP.x, eP.z) : Math.max(eP.y, st.base);
      dustBurst(eP.x, y + 1, eP.z, 5, 6 + size * 0.02, 5, 2.5);
      if (k % 2 === 0) sparkBurst(eP.x, Math.min(st.top, y + (st.top - st.base) * 0.8), eP.z, 10, 5, 9);
    }
    st.glowBoost = 1;
  }
  function ringAt(x, y, z, r1) { ringFx.position.set(x, y, z); ringS.t = 0; ringS.r0 = r1 * 0.12; ringS.r1 = r1; ringFx.visible = true; }
  function celebrate(id) {
    const st = ST[id]; if (!st) return;
    const fb = st.fb, cx = (fb.x0 + fb.x1) / 2, cz = (fb.z0 + fb.z1) / 2, top = st.id === 'har' ? 40 : st.top;
    for (let k = 0; k < 6; k++) spark.spawn(cx + (R() - 0.5) * (fb.x1 - fb.x0) * 0.5, top + 4, cz + (R() - 0.5) * (fb.z1 - fb.z0) * 0.5, 40, PO(6, 0, 18, 26, 2.4, 0.8, 2.4, 14, 0.9, 1, true));
    ringAt(cx, (st.id === 'har' ? 0 : st.base) + 0.4, cz, Math.max(fb.x1 - fb.x0, fb.z1 - fb.z0) * 0.8);
    st.glowBoost = 1.4;
    shake.t = 0.25; shake.amp = 0.4;
  }
  function workFX(id) {
    const st = ST[id]; if (!st) return;
    const sp = st.def.spot, fb = st.fb;
    // at the build line, on the side the hero works from
    const x = clamp(sp.face[0], fb.x0, fb.x1), z = clamp(sp.face[1], fb.z0, fb.z1);
    const y = st.status === 'building' ? Math.max(st.base, revealY(st)) : st.base + 1;
    dustBurst(x, y, z, 6, 4, 3, 1.5);
    sparkBurst(x, y + 1, z, 12, 4, 7);
    chips.spawn(x, y + 0.5, z, 8, STONE[st.def.stone] || STONE.ash, { speed: 6, up: 8, size: 0.3, floor: st.id === 'har' ? groundAt(x, z) : st.base });
    st.glowBoost = Math.max(st.glowBoost, 0.6);
  }

  /* ═══════════════════ world API v2 (GDD §12): night, hot spot, vision, moments, juice, timelapse, quarry ═══════════════════ */
  // transparent effects live under one group (main.js hides stages.fx from the AO pass)
  const fxG = new THREE.Group(); fxG.name = 'stage-fx'; scene.add(fxG);
  const glowTex = TX.texGlow(), glows = new Glows(96, glowTex), glowsTop = new Glows(8, glowTex), flames = new Flames(240, TX.texFlame());
  glowsTop.mat.depthTest = false; glowsTop.points.renderOrder = 11;
  fxG.add(glows.points, glowsTop.points, flames.points);
  const G_LANTERN = 1, G_AURA = 2, G_BRAZ = 8, G_LAMP = 40, G_END = 96, T_HOT = 0, T_FLASH = 1;   // (T_: glowsTop slots)
  const cFire = new THREE.Color(2.6, 1.05, 0.28), cLamp = new THREE.Color(2.4, 1.1, 0.3), cLantern = new THREE.Color(3.0, 1.7, 0.6);
  const cAura = new THREE.Color(1.7, 1.15, 0.35), cHot = new THREE.Color(2.8, 1.75, 0.45), cFlash = new THREE.Color(3.6, 2.3, 0.7);
  const lampW = new THREE.Vector3(), pA = new THREE.Vector3(), pB = new THREE.Vector3(), sfxP = new THREE.Vector3(), camDir = new THREE.Vector3();
  const easeBack = (u) => 1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2);

  /* ── night: braziers at the working sites, lamps on the paths, two real lights (the site, the lantern) ── */
  let nightWas = false, nightK = 0;
  const workL = life && life.workLights ? life.workLights : [];
  const nightOn = () => !!(life && life.night);
  const buildPhase = () => !life || life.phase === 'build';
  let phaseWas = null;
  function nightTick(dt) {
    const night = nightOn(), ph = life ? life.phase : 'build';
    // (the point-light count changes with the night, and at night with the phase: warm the hidden variants too)
    if (night !== nightWas || (night && ph !== phaseWas)) { nightWas = night; propsDirty = true; if (warmed) rewarm(); }
    phaseWas = ph;
    nightK += ((night && buildPhase() ? 1 : 0) - nightK) * Math.min(1, dt * 2.5);
    if (nightK < 1e-3) nightK = 0;
  }
  function workLights() {
    const L0 = workL[0], L1 = workL[1];
    if (!nightOn() || !buildPhase()) return;          // (life.js owns them in the complete phase; they are off by day)
    if (L0) {
      const st = hero.at && ST[hero.at] && ST[hero.at].status === 'building' ? ST[hero.at] : crane.st || (hs.id && ST[hs.id].status === 'building' ? ST[hs.id] : null);
      const sp = hero.at === 'quarry' && quarryOn ? QSPOT : st ? st.def.spot : null;
      if (sp) {
        L0.position.set(lerp(sp.x, sp.face[0], 0.3), groundAt(sp.x, sp.z) + 13, lerp(sp.z, sp.face[1], 0.3));
        L0.color.setRGB(1, 0.6, 0.28); L0.distance = 95; L0.decay = 2;
        L0.intensity = 330 * nightK * (0.93 + 0.07 * Math.sin(time * 13) * Math.sin(time * 7.3));
      } else L0.intensity = 0;
    }
    if (L1) {
      if (hero.vis && hero.fade > 0.3 && nightK > 0.02) { L1.position.set(lampW.x, hero.y + 7.5, lampW.z); L1.color.setRGB(1, 0.7, 0.4); L1.distance = 28; L1.decay = 2; L1.intensity = 20 * nightK; }
      else L1.intensity = 0;
    }
  }
  function nightProps(put) {
    for (let i = G_BRAZ; i < G_END; i++) glows.off(i);
    flames.count = 0;
    if (nightOn() && buildPhase()) {
      let nb = G_BRAZ, nl = G_LAMP;
      const brazier = (x, z) => {
        if (nb >= G_LAMP) return;
        const gy = groundAt(x, z);
        put(x, gy + 1.05, z, 0.26, 2.1, 0.26, 0, '#3E2E20');
        put(x, gy + 0.12, z, 1.0, 0.24, 1.0, 0.4, '#3E2E20');
        put(x, gy + 2.2, z, 1.3, 0.42, 1.3, 0.4, '#7A5530');
        glows.set(nb++, x, gy + 2.8, z, 5.2, cFire, 0.8, 0.45);
        flames.add(x, gy + 2.35, z, 1.9, 7);
      };
      for (const st of list) {
        if (st.status !== 'building') continue;
        const sp = st.def.spot, dx = sp.face[0] - sp.x, dz = sp.face[1] - sp.z, L = Math.hypot(dx, dz) || 1, fx = dx / L, fz = dz / L;
        brazier(sp.x + fx * 1.5 - fz * 6.5, sp.z + fz * 1.5 + fx * 6.5);
        brazier(sp.x + fx * 1.5 + fz * 6.5, sp.z + fz * 1.5 - fx * 6.5);
        const d = st.def.crane;
        if (crane.st === st && d.mode === 'ground') brazier(d.x - crane.fwd.x * 6 + crane.fwd.y * 5, d.z - crane.fwd.y * 6 - crane.fwd.x * 5);
      }
      if (quarryOn) brazier(QSPOT.x - 6, QSPOT.z - 5);
      // oil lamps on posts along the paths from the platform's east side to the open sites and the quarry
      if (isDone('har')) {
        const lamp = (x, z) => {
          if (nl >= G_END) return;
          for (let i = G_LAMP; i < nl; i++) if (Math.abs(glows.pos[i * 3] - x) < 8 && Math.abs(glows.pos[i * 3 + 2] - z) < 8) return;
          const gy = groundAt(x, z);
          put(x, gy + 1.5, z, 0.2, 3.0, 0.2, 0, '#3A2A1C');
          put(x, gy + 3.1, z, 0.55, 0.28, 0.55, 0.3, '#8A6436');
          glows.set(nl++, x, gy + 3.5, z, 2.8, cLamp, 0.85, 0.35);
          flames.add(x, gy + 3.25, z, 0.9, 3);
        };
        const ids = [];
        for (const st of list) if (st.status === 'building' || st.status === 'avail') ids.push(st.id);
        if (quarryOn) ids.push('quarry');
        for (const id of ids) {
          const sp = spotFor(id), pts = route(sp, HUB.out[0], HUB.out[1]), last = pts.length - 1;
          let px = HUB.out[0], pz = HUB.out[1], s = 4, side = 1;
          for (let q = 0; q <= last; q++) {
            const p = pts[q], sx = p.x - px, sz = p.z - pz, L = Math.hypot(sx, sz);
            if (L < 0.01) continue;
            const end = q === last ? L - 9 : L;
            for (; s < end; s += 17) { const t = s / L; lamp(px + sx * t - sz / L * 2.9 * side, pz + sz * t + sx / L * 2.9 * side); side = -side; }
            s -= L; if (s < 0) s = 0;
            px = p.x; pz = p.z;
          }
        }
      }
    }
    flames.flush();
  }
  // a change of the light count (night) recompiles every lit material: warm the hidden ones too (the reveal variants,
  // the effects), at the same moment rather than on the first tap after dark; in parallel where the driver can
  let warmScene = null;
  function rewarm() {
    const R2 = ctx.renderer; if (!R2) return;
    const prev = R2.getRenderTarget(), rt = ctx.renderTarget ? ctx.renderTarget() : null;
    if (rt) R2.setRenderTarget(rt);
    const par = R2.compileAsync && R2.extensions && R2.extensions.has('KHR_parallel_shader_compile');
    try {
      if (par) { R2.compileAsync(scene, camera).catch(() => {}); if (warmScene) R2.compileAsync(warmScene, camera, scene).catch(() => {}); }
      else { R2.compile(scene, camera); if (warmScene) R2.compile(warmScene, camera, scene); }
    } catch (e) { /* compiled on demand */ } finally { R2.setRenderTarget(prev); }
  }

  /* ── the hot spot: a glowing stone on the build line (tapping it = tapping the site) ── */
  const hsMat = new THREE.MeshStandardMaterial({ color: '#E6C27A', roughness: 0.5, emissive: new THREE.Color('#FFA82E'), emissiveIntensity: 1 });
  const hsMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 1.6), hsMat);
  hsMesh.visible = false; hsMesh.receiveShadow = true; hsMesh.frustumCulled = false; scene.add(hsMesh);
  const hs = { id: null, st: null, a: 0, pulse: 0, mote: 0, yaw: 0, pos: new THREE.Vector3() };
  function hotPoint(st, out) {
    const H = HOT[st.id];
    if (!H) { const fb = st.fb; return out.set((fb.x0 + fb.x1) / 2, st.base + 1, (fb.z0 + fb.z1) / 2); }
    let x = H[0], z = H[1], y = st.status === 'building' && st.disp >= FOUND ? revealY(st) + 0.5 : -1e9;
    if (H.length > 4 && y < H[3]) { x = H[4]; z = H[5]; y = clamp(y, H[6] + 0.5, H[3] + 0.5); } else y = clamp(y, H[3] + 0.5, H[2] + 0.5);
    return out.set(x, y, z);
  }
  function hotspot(id) {
    const st = id && ST[id];
    hs.id = st ? id : null;
    if (st) { hs.st = st; const sp = st.def.spot; hs.yaw = Math.atan2(sp.face[0] - sp.x, sp.face[1] - sp.z); }
  }
  function hotUpdate(dt) {
    const st = hs.st, live = !!(hs.id && st && (st.status === 'building' || st.status === 'avail'));
    hs.a += ((live ? 1 : 0) - hs.a) * Math.min(1, dt * 7);
    if (!st || hs.a < 0.01) { hsMesh.visible = false; glowsTop.off(T_HOT); return; }
    const p = hotPoint(st, hs.pos), pul = 0.5 + 0.5 * Math.sin(time * 4.4), k = hs.a;
    // ── site11 ── (PRODUCER11 N45: "the kohen half hidden behind the survey marker's gold glow"; STAGING R2 "nothing else pulses")
    // at a site being built the game's ring marks his work: the beacon stays a quiet stone — no glow drawn over everything, no
    // pulse, no motes; a site waiting to start keeps its full beacon
    const quiet = st.status === 'building';
    hsMesh.visible = true; hsMesh.position.copy(p); hsMesh.rotation.y = hs.yaw;
    hsMesh.scale.setScalar(k * (quiet ? 0.7 : 1 + hs.pulse * 0.3));
    hsMat.emissiveIntensity = quiet ? 0.6 : 1 + 1.3 * pul + hs.pulse * 3;
    // the beacon keeps a readable size on screen: small close up, larger from afar
    const gs = clamp(p.distanceTo(camera.position) * 0.045, 3.2, 16);
    if (quiet) glowsTop.off(T_HOT);
    else glowsTop.set(T_HOT, p.x, p.y + 0.5, p.z, gs * (1 + 0.25 * pul + hs.pulse * 0.8), cHot, k * (0.5 + 0.2 * pul + 0.6 * hs.pulse), 0);
    hs.pulse = Math.max(0, hs.pulse - dt * 2.8);
    if (live && !quiet && (hs.mote += dt) > 0.4) { hs.mote = 0; spark.spawn(p.x, p.y + 0.7, p.z, 1, PO(1.8, 0.3, 0.4, 2.8, 0.9, 0.3, 1.2, -0.6, 0.6, 0.9, true)); }
  }

  /* ── screen anchors for the HUD (CSS px, like main.js view.project) ── */
  const spV = new THREE.Vector3(), spOut = { x: 0, y: 0, on: false };
  function targetPoint(t, v) {
    if (t === 'hero') return v.set(hero.x, hero.y + 2.4 * HERO_S, hero.z);
    if (t === 'quarry') return v.set(lerp(QSPOT.x, QX, 0.55), 3.4, lerp(QSPOT.z, QZ, 0.55));
    if (typeof t === 'string') { const st = ST[t]; if (!st) return null; hotPoint(st, v); v.y += 0.6; return v; }
    if (t && t.boulder !== undefined) { const b = bSt[t.boulder]; if (!b) return null; return v.set(b.x, hill.heightAt(b.x, b.z) + b.r * 0.72, b.z); }
    if (t && t.isVector3) return v.copy(t);
    if (t && typeof t.x === 'number' && typeof t.z === 'number') return v.set(t.x, typeof t.y === 'number' ? t.y : groundAt(t.x, t.z), t.z);
    return null;
  }
  function screenPos(target, out) {
    if (!targetPoint(target, spV)) return null;
    const o = out && typeof out === 'object' ? out : spOut;
    camera.updateMatrixWorld();
    spV.project(camera);
    o.on = spV.z > -1 && spV.z < 1;
    o.x = (spV.x * 0.5 + 0.5) * innerWidth; o.y = (-spV.y * 0.5 + 0.5) * innerHeight;
    return o;
  }

  /* ── the crane: at the preferred site (setCraneSite) once it is past its foundations, else at the most recently
     started one; progress updates never move it ── */
  let cranePref = null, craneDirty = true, seqN = 0;
  function setCraneSite(id) { cranePref = id && ST[id] ? id : null; craneDirty = true; }
  function craneAssign() {
    craneDirty = false;
    // (site8: the Mount's treadwheel crane stands at its east face from the survey on — DESIGN8B R5, "the crane in the background")
    const ok = (st) => !!st && st.status === 'building' && (st.disp >= FOUND || st.id === 'har');
    let want = ok(ST[cranePref]) ? ST[cranePref] : null;
    if (!want) for (const st of list) if (ok(st) && (!want || st.seq > want.seq)) want = st;
    if (want === crane.st) return;
    if (crane.st) craneRelease();
    if (want) craneSetup(want);
    propsDirty = true; workDirty = true;
  }

  /* ── the vision (showPlan) and the chapter showcase: a gold ghost of the stages ── */
  const ghostG = new THREE.Group(); ghostG.visible = false; fxG.add(ghostG);
  const pinFx = new Float32Array(16);   // extra pin light per stage (plan, showcase)
  function ensureGhost() {
    if (list[0].ghost) return;
    scene.updateMatrixWorld();
    for (const st of list) {
      const U = { uCol: { value: GHOST_GOLD.clone() }, uA: { value: 0 }, uY: { value: 1e5 }, uTime: BUILD_TIME, uFace: { value: 1 }, uBand: { value: 1 } };
      const mk = () => new THREE.ShaderMaterial({ uniforms: U, vertexShader: GHOST_VS, fragmentShader: GHOST_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, depthFunc: THREE.LessEqualDepth, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
      let mat = null, matI = null;
      const g = new THREE.Group(); g.visible = false;
      for (const m of st.meshes) {
        let o;
        if (m.isInstancedMesh) { o = new THREE.InstancedMesh(m.geometry, matI || (matI = mk()), m.count); o.instanceMatrix = m.instanceMatrix; }
        else {
          // (no floors: the platform's paving would cover the hill in a sheet of light)
          if (m.geometry.attributes.position.count < 200 || m.material === st.cache.pave) continue;
          o = new THREE.Mesh(m.geometry, mat || (mat = mk()));
        }
        o.matrixAutoUpdate = false; o.matrix.copy(m.matrixWorld); o.frustumCulled = false; o.renderOrder = 7;
        g.add(o);
      }
      ghostG.add(g); st.ghost = { g, U };
    }
  }
  // a point on a stage's footprint outline, on the ground as it is now (the hill before the platform exists)
  function footPoint(st, u, out) {
    const F = st.def.foot, f = F[Math.floor(u * F.length) % F.length], w = f[2] - f[0], h = f[3] - f[1];
    let s = ((u * F.length) % 1) * 2 * (w + h), x, z;
    if (s < w) { x = f[0] + s; z = f[1]; } else if ((s -= w) < h) { x = f[2]; z = f[1] + s; } else if ((s -= h) < w) { x = f[2] - s; z = f[3]; } else { s -= w; x = f[0]; z = f[3] - s; }
    return out.set(x, st.id === 'har' || !isDone('har') ? hill.heightAt(x, z) : st.base, z);
  }
  function outlineSparkle(st, n) { for (let k = 0; k < n; k++) { footPoint(st, (k + Math.random() * 0.6) / n, pA); sparkBurst(pA.x, pA.y + 1.5, pA.z, 5, 3, 6); } }
  const plan = { on: false, t: 0, dur: 2.6, res: null, fired: 0 };
  function showPlan(ms = 2600) {
    ensureGhost(); planStop(false); showStop(false);
    plan.on = true; plan.t = 0; plan.dur = Math.max(0.8, (+ms || 2600) / 1000); plan.fired = 0;
    ghostG.visible = true;
    for (const st of list) { const U = st.ghost.U; st.ghost.g.visible = true; U.uA.value = 0; U.uY.value = st.bottom - 1; U.uFace.value = 1; U.uBand.value = 1; U.uCol.value.copy(GHOST_GOLD); }
    outline.material.uniforms.uPlan.value = isDone('har') ? 0 : 1;
    return new Promise((res) => { plan.res = res; });
  }
  function planUpdate(dt) {
    if (!plan.on) return;
    plan.t += dt;
    const u = plan.t / plan.dur, fade = 1 - smooth(0.78, 1, u);
    for (const st of list) {
      const a = clamp((u - 0.02 - st.idx * 0.034) / 0.2, 0, 1), U = st.ghost.U;
      U.uY.value = lerp(st.bottom - 1, st.top + 3, easeOut(a));
      U.uA.value = a > 0 ? (0.5 + 0.9 * (1 - a)) * fade : 0;
      const on = a > 0 ? (0.55 + 0.45 * (1 - a)) * fade : 0;
      OL.I[st.idx] = Math.max(OL.base[st.idx], on); pinFx[st.idx] = on;
      if (a > 0 && !(plan.fired & (1 << st.idx))) { plan.fired |= 1 << st.idx; outlineSparkle(st, st.id === 'har' ? 10 : 4); }
    }
    outline.visible = true;
    if (u >= 1) planStop(true);
  }
  function planStop(ok) {
    if (!plan.on) return;
    plan.on = false;
    for (const st of list) if (st.ghost) { st.ghost.U.uA.value = 0; st.ghost.g.visible = false; }
    ghostG.visible = false; pinFx.fill(0); outline.material.uniforms.uPlan.value = 0; dirtyGlobal = true;
    if (plan.res) { const r = plan.res; plan.res = null; r(ok); }
  }
  const show = { on: false, t: 0, res: null, done: [], rest: [], fired: 0, T0: 1.5, step: 0.3, t1: 0, end: 0 };
  function wideShot(p, t) {
    t.set(-25, 10, -25);
    const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), f = Math.min(vf, hf * 1.1);
    const dist = clamp(290 / Math.sin(f / 2) * 0.72, 480, 1900), el = THREE.MathUtils.degToRad(31), az = THREE.MathUtils.degToRad(-24);
    return p.set(t.x + Math.cos(el) * Math.cos(az) * dist, t.y + Math.sin(el) * dist, t.z + Math.cos(el) * Math.sin(az) * dist);
  }
  function showcase() {
    ensureGhost(); planStop(false); showStop(false); orbitStop(false);
    show.done = list.filter((s) => s.status === 'done'); show.rest = list.filter((s) => s.status !== 'done');
    show.on = true; show.t = 0; show.fired = 0; show.T0 = 1.5; show.step = Math.min(0.3, 3.2 / Math.max(1, show.done.length));
    show.t1 = show.T0 + show.step * show.done.length + 0.5; show.end = show.t1 + (show.rest.length ? 3.6 : 0.8);
    ghostG.visible = true;
    // ── the owner, 28.9 21:16 ("יותר מדי אור צהוב" as the game passed to the altar's yesod): the showcase washed the screen in
    // yellow — every finished site lit at 3.5× with a full band, and the Mount's hologram (its platform and hundreds of stoa
    // columns, drawn additively) became one sheet of light over the wide shot. Now: a paler gold, a faint band, finished
    // sites at a third of it, and the Mount marked only by its outline and sparks (it is the ground under everything)
    for (const st of list) {
      const U = st.ghost.U; st.ghost.g.visible = st.id !== 'har'; U.uA.value = 0; U.uY.value = st.bottom - 1;
      U.uFace.value = st.status === 'done' ? 1.2 : 0.8; U.uBand.value = 0.3; U.uCol.value.copy(GHOST_SOFT);
    }
    if (ctx.flyToPos) { wideShot(pA, pB); ctx.flyToPos(pA, pB, 1600); }
    return new Promise((res) => { show.res = res; });
  }
  function showUpdate(dt) {
    if (!show.on) return;
    show.t += dt;
    const t = show.t, fade = 1 - smooth(show.end - 0.9, show.end, t);
    for (let i = 0; i < show.done.length; i++) {
      // now: every finished site glows in turn
      // (a band of light sweeps up through the building)
      const st = show.done[i], a = clamp((t - show.T0 - i * show.step) / 1.3, 0, 1), U = st.ghost.U, on = a > 0 && a < 1 ? Math.sin(Math.PI * a) : 0;
      U.uY.value = lerp(st.bottom - 1, st.top + 4, easeIO(Math.min(1, a * 1.3))); U.uA.value = on * 0.45;
      OL.I[st.idx] = Math.max(OL.base[st.idx], on * 0.8);
      if (a > 0 && !(show.fired & (1 << st.idx))) {
        show.fired |= 1 << st.idx; outlineSparkle(st, 4);
        const fb = st.fb; spark.spawn((fb.x0 + fb.x1) / 2, (st.id === 'har' ? 30 : st.top) + 3, (fb.z0 + fb.z1) / 2, 18, PO(Math.min(40, fb.x1 - fb.x0), 0, 8, 12, 2.2, 0.6, 1.8, 8, 1, 1, true));
      }
    }
    for (let i = 0; i < show.rest.length; i++) {
      // to come: the rest of the Temple draws itself as a ghost
      const st = show.rest[i], a = clamp((t - show.t1 - i * 0.09) / 1.1, 0, 1), U = st.ghost.U;
      U.uY.value = lerp(st.bottom - 1, st.top + 3, easeOut(a)); U.uA.value = a > 0 ? (0.32 + 0.3 * (1 - a)) * fade : 0;
      pinFx[st.idx] = a > 0 ? 0.4 * fade : 0;
      OL.I[st.idx] = Math.max(OL.base[st.idx], a > 0 ? 0.5 * fade : 0);
    }
    outline.visible = true;
    if (t >= show.end) showStop(true);
  }
  function showStop(ok) {
    if (!show.on) return;
    show.on = false;
    for (const st of list) if (st.ghost) { st.ghost.U.uA.value = 0; st.ghost.g.visible = false; }
    ghostG.visible = false; pinFx.fill(0); dirtyGlobal = true;
    if (show.res) { const r = show.res; show.res = null; r(ok); }
  }

  /* ── the camera circles a finished site (released at once on any input or flight) ── */
  const orb = { on: false, t: 0, dur: 3, res: null, a0: 0, a1: 0, r0: 0, r1: 0, h0: 0, h1: 0, c: new THREE.Vector3(), t0: new THREE.Vector3(), lp: new THREE.Vector3(), lt: new THREE.Vector3() };
  function orbit(id, seconds = 3) {
    const st = ST[id], C = ctx.controls;
    if (!st || !C) return Promise.resolve(false);
    orbitStop(false);
    const fb = st.fb, har = st.id === 'har', h = har ? 60 : st.top - st.base;
    orb.c.set((fb.x0 + fb.x1) / 2, har ? -5 : st.base + h * 0.38, (fb.z0 + fb.z1) / 2);
    const rad = 0.5 * Math.hypot(fb.x1 - fb.x0, fb.z1 - fb.z0, h * 0.8) + 4;
    const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), f = Math.min(vf, hf * 1.15);
    const dist = Math.max(55, rad / Math.sin(f / 2) * 0.92), el = THREE.MathUtils.degToRad((st.def.view || { el: 28 }).el);
    const p = camera.position, s = +seconds || 3;
    orb.t0.copy(C.target);
    orb.a0 = Math.atan2(p.z - orb.c.z, p.x - orb.c.x); orb.r0 = Math.hypot(p.x - orb.c.x, p.z - orb.c.z); orb.h0 = p.y - orb.c.y;
    orb.r1 = Math.cos(el) * dist; orb.h1 = Math.sin(el) * dist;
    orb.a1 = orb.a0 + Math.sign(s) * Math.min(1.7, 0.42 * Math.abs(s));
    orb.dur = Math.max(0.5, Math.abs(s)); orb.t = 0; orb.on = true;
    orb.lp.copy(p); orb.lt.copy(C.target);
    return new Promise((res) => { orb.res = res; });
  }
  function orbitUpdate(dt) {
    if (!orb.on) return;
    const C = ctx.controls;
    if (camera.position.distanceToSquared(orb.lp) > 4 || C.target.distanceToSquared(orb.lt) > 4) { orbitStop(false); return; }
    orb.t += dt;
    const u = Math.min(1, orb.t / orb.dur), e = easeIO(u), k = easeOut(Math.min(1, orb.t / Math.min(1.1, orb.dur * 0.45)));
    const a = lerp(orb.a0, orb.a1, e), rr = lerp(orb.r0, orb.r1, k), hh = lerp(orb.h0, orb.h1, k);
    C.target.lerpVectors(orb.t0, orb.c, k);
    camera.position.set(orb.c.x + Math.cos(a) * rr, orb.c.y + hh, orb.c.z + Math.sin(a) * rr);
    camera.lookAt(C.target);
    orb.lp.copy(camera.position); orb.lt.copy(C.target);
    if (u >= 1) orbitStop(true);
  }
  function orbitStop(ok) { if (!orb.on) return; orb.on = false; if (orb.res) { const r = orb.res; orb.res = null; r(ok); } }
  if (ctx.controls && ctx.controls.addEventListener) ctx.controls.addEventListener('start', () => orbitStop(false));

  /* ── the red line (sovev key moment, Middot 3:1): a glowing cord drawn round the altar ── */
  const RL = { x0: -53.2, x1: -22.8, z0: -18.7, z1: 11.7 };
  const rlPer = 2 * ((RL.x1 - RL.x0) + (RL.z1 - RL.z0));
  const rlAt = (u, out) => {
    let s = u * rlPer; const w = RL.x1 - RL.x0, h = RL.z1 - RL.z0;
    if (s < w) return out.set(RL.x0 + s, 0, RL.z0); s -= w;
    if (s < h) return out.set(RL.x1, 0, RL.z0 + s); s -= h;
    if (s < w) return out.set(RL.x1 - s, 0, RL.z1); s -= w;
    return out.set(RL.x0, 0, RL.z1 - s);
  };
  const rlMesh = (() => {
    const P = [], V = [], Lp = [], Hh = [], idx = [];
    const C4 = [[RL.x0, RL.z0], [RL.x1, RL.z0], [RL.x1, RL.z1], [RL.x0, RL.z1], [RL.x0, RL.z0]];
    for (const [layer, hh] of [[0, 0.2], [1, 1.5]]) {
      let d = 0;
      for (let s = 0; s < 4; s++) {
        const [ax, az] = C4[s], [bx, bz] = C4[s + 1], L = Math.hypot(bx - ax, bz - az), b = P.length / 3;
        for (const [x, z, dd] of [[ax, az, d], [bx, bz, d + L]]) for (const v of [-1, 1]) { P.push(x, v * hh, z); V.push(v); Lp.push(dd / rlPer); Hh.push(layer); }
        idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
        d += L;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('aV', new THREE.Float32BufferAttribute(V, 1)); g.setAttribute('aL', new THREE.Float32BufferAttribute(Lp, 1)); g.setAttribute('aH', new THREE.Float32BufferAttribute(Hh, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { uA: { value: 0 }, uHead: { value: 1 }, uCol: { value: new THREE.Color(1.6, 0.06, 0.04) }, uTime: BUILD_TIME },
      vertexShader: `attribute float aV; attribute float aL; attribute float aH; varying float vV; varying float vL; varying float vH;
        void main(){ vV = aV; vL = aL; vH = aH; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uA; uniform float uHead; uniform vec3 uCol; uniform float uTime; varying float vV; varying float vL; varying float vH;
        void main(){
          float head = smoothstep(0.05, 0.0, abs(vL - uHead)) * step(uHead, 0.999);
          float drawn = max(step(vL, uHead), head);
          float v = 1.0 - abs(vV);
          float a = vH < 0.5 ? smoothstep(0.0, 0.35, v) : 0.3 * v * v * v;
          float sh = 0.88 + 0.12 * sin(vL * 70.0 - uTime * 5.0);
          gl_FragColor = vec4(uCol * (vH < 0.5 ? 1.0 : 1.6) * (1.0 + head * 2.0), clamp(uA * a * sh * drawn, 0.0, 1.0));
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(g, m); mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 8; fxG.add(mesh);
    return mesh;
  })();
  const rl = { on: false, t: 0, flash: false };
  function redLine(f) {
    if (f === null || f === undefined || f === false) { rl.on = false; rlMesh.visible = false; return; }
    rl.on = true; rl.t = 0; rl.flash = false;
    rlMesh.position.y = 16 + 10 * clamp(+f || 0, 0, 1); rlMesh.visible = true;
    rlMesh.material.uniforms.uHead.value = 0;
  }
  function redLineUpdate(dt) {
    if (!rl.on) return;
    rl.t += dt;
    const t = rl.t, U = rlMesh.material.uniforms, head = clamp(t / 0.85, 0, 1), y = rlMesh.position.y;
    U.uHead.value = head;
    U.uA.value = t < 0.85 ? 1.35 : t < 2.6 ? 1 + 0.22 * Math.sin((t - 0.85) * 7) : Math.max(0, 1 - (t - 2.6) / 1.3);
    if (head < 1) { rlAt(head, pA); spark.spawn(pA.x, y, pA.z, 2, PO(0.4, 0, 3, 3, 1.4, 0.4, 0.8, 6, 1.5, 1, true)); }
    else if (!rl.flash) { rl.flash = true; for (let k = 0; k < 10; k++) { rlAt(k / 10 + 0.03, pA); sparkBurst(pA.x, y, pA.z, 3, 1.5, 4); } }
    if (t > 3.9) { rl.on = false; rlMesh.visible = false; }
  }

  /* ── the craftsmen lowered in boxes (kodesh key moment, Middot 4:5): a windlass over an opening in the roof.
     The box goes down through the opening and is never seen inside. ── */
  const BXX = -149, BXZ = 0, BXY = 112.3, BXS = 1.3;
  const bxRig = (() => {
    const P = [], wood = '#7A5A38', dark = '#5C4128';
    P.push(part(boxAt(4.4, 0.06, 4.4, 0, 0.04, 0), '#120D08'));
    for (const [x, z, w, d] of [[0, -2.4, 5.2, 0.45], [0, 2.4, 5.2, 0.45], [-2.4, 0, 0.45, 4.4], [2.4, 0, 0.45, 4.4]]) P.push(part(boxAt(w, 0.28, d, x, 0.14, z), dark));
    for (const s of [-1, 1]) {
      const x = s * 3.05;
      P.push(part(rod([x, 0, -1.9], [x, 6.3, 0], 0.16), wood), part(rod([x, 0, 1.9], [x, 6.3, 0], 0.16), wood));
      P.push(part(rod([x, 2.2, -1.2], [x, 2.2, 1.2], 0.1), wood), part(boxAt(0.5, 0.3, 4.4, x, 0.15, 0), dark));
    }
    const mesh = new THREE.Mesh(mergeGeometries(P), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
    mesh.position.set(BXX, BXY, BXZ); mesh.scale.setScalar(BXS); mesh.castShadow = true; mesh.receiveShadow = true; mesh.visible = false; scene.add(mesh);
    return mesh;
  })();
  const bxDrum = (() => {
    const P = [part(new THREE.CylinderGeometry(0.5, 0.5, 5.5, 12).rotateZ(Math.PI / 2), '#8C6A43')];
    for (const s of [-1, 1]) P.push(part(boxAt(0.14, 1.3, 0.16, s * 3.35, -0.55, 0), '#5C4128'), part(rod([s * 3.35, -1.15, 0], [s * 3.95, -1.15, 0], 0.07), '#5C4128'));
    const mesh = new THREE.Mesh(mergeGeometries(P), bxRig.material);
    mesh.position.set(BXX, BXY + 6.3 * BXS, BXZ); mesh.scale.setScalar(BXS); mesh.visible = false; scene.add(mesh);
    return mesh;
  })();
  const bxBox = (() => {
    const P = [];
    // an open-topped plank box; the craftsman's head and shoulders show above its rim
    for (const [w, d, x, z] of [[2.4, 0.14, 0, -1.13], [2.4, 0.14, 0, 1.13], [0.14, 2.12, -1.13, 0], [0.14, 2.12, 1.13, 0]]) P.push(part(boxAt(w, 2.0, d, x, 1.0, z), '#9A7248'));
    P.push(part(boxAt(2.4, 0.14, 2.4, 0, 0.07, 0), '#7A5A38'));
    for (const y of [0.45, 1.55]) for (const [w, d, x, z] of [[2.5, 0.1, 0, -1.2], [2.5, 0.1, 0, 1.2], [0.1, 2.3, -1.2, 0], [0.1, 2.3, 1.2, 0]]) P.push(part(boxAt(w, 0.16, d, x, y, z), '#5C4128'));
    P.push(part(new THREE.CylinderGeometry(0.42, 0.5, 0.5, 10).translate(0, 1.95, 0), '#EFE9DB'), part(new THREE.SphereGeometry(0.3, 10, 8).translate(0, 2.45, 0), '#D2A078'));
    P.push(part(new THREE.SphereGeometry(0.32, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).translate(0, 2.5, 0), '#F2EBDD'));
    const mesh = new THREE.Mesh(mergeGeometries(P), bxRig.material);
    mesh.scale.setScalar(BXS); mesh.visible = false; scene.add(mesh);     // (moving: no baked shadow)
    return mesh;
  })();
  const bxRopes = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 5, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#CDBB94', roughness: 0.9 }), 2);
  bxRopes.visible = false; bxRopes.frustumCulled = false; scene.add(bxRopes);
  const bxObjs = [bxRig, bxDrum, bxBox, bxRopes];
  const bx = { on: false, t: 0, d: 0, last: -9, t1: -9, moving: false };
  function boxes(t) {
    if (t === null || t === undefined || t === false) { boxesHide(); return; }
    const u = clamp(+t || 0, 0, 1);
    bx.t = u; bx.last = time;
    if (u >= 1) { if (bx.t1 < 0) bx.t1 = time; } else bx.t1 = -9;
    if (!bx.on) { bx.on = true; bx.d = u; for (const o of bxObjs) o.visible = true; workDirty = true; dustBurst(BXX, BXY + 0.5, BXZ, 8, 4, 4, 1.5); requestShadow(true); }
  }
  function boxesHide() {
    if (!bx.on) return;
    bx.on = false; bx.t1 = -9;
    for (const o of bxObjs) o.visible = false;
    workDirty = true; dustBurst(BXX, BXY + 1, BXZ, 10, 5, 5, 2); requestShadow(true);
  }
  function boxesUpdate(dt) {
    if (!bx.on) return;
    if (time - bx.last > 1.5 || (bx.t1 >= 0 && time - bx.t1 > 1.5)) { boxesHide(); return; }
    const was = bx.d;
    bx.d += (bx.t - bx.d) * Math.min(1, dt * 8);
    bx.moving = Math.abs(bx.d - was) > dt * 0.02;
    bxDrum.rotation.x = -bx.d * 10;
    const yb = BXY + (4.4 - bx.d * 7.8) * BXS, sw = Math.sin(time * 2.1) * 0.035 * (1 - bx.d);
    bxBox.position.set(BXX, yb, BXZ); bxBox.rotation.set(sw, 0, sw * 0.6);
    for (let k = 0; k < 2; k++) {
      const s = k ? 1 : -1, ax = BXX + s * 0.6 * BXS, ay = BXY + 5.85 * BXS, bx2 = BXX + s * 0.95 * BXS, by = yb + 2.05 * BXS;
      const dx = ax - bx2, dy = ay - by, L = Math.max(0.01, Math.hypot(dx, dy));
      tmpQ.setFromUnitVectors(UP, tmpV2.set(dx / L, dy / L, 0)); tmpV.set(bx2, by, BXZ); tmpS.set(0.05, L, 0.05);
      tmpM.compose(tmpV, tmpQ, tmpS); bxRopes.setMatrixAt(k, tmpM);
    }
    bxRopes.instanceMatrix.needsUpdate = true;
  }

  /* ── the golden vine over the Heichal's doorway, inside the Ulam (Middot 3:8): leaves, grapes, clusters ──
     QA P1-3 (wave 4): the vine is HUNG when the Ulam is finished — its key moment hangs a leaf, a grape and a cluster
     (moments.js; the first gold beat at the Ulam hangs it already behind the moment's card) — and from then on it is always
     there: its gold stems on the cedar poles and a first, sparse foliage over the whole vine. It GROWS with the player's
     leaves, grapes and clusters (the daily tasks, game/state.js G.vine). The finished Temple (demoMode: Phase B, the tour,
     the whole view) shows it GROWN, and so does the investor demo once its Ulam is done (main.js "── world ──").
     setVine(n | { leaves, grapes, clusters }, vine?, { grown }) — a bare n counts leaves (grapes n/3, clusters n/10). */
  const VINE_HUNG = { leaves: 44, grapes: 6, clusters: 2 }, VINE_GROWN = { leaves: 300, grapes: 96, clusters: 30 };
  const vine = (() => {
    const X = -90.8, vr = rng(808), SP = 0.62;
    const pole = (z) => { const P = []; for (let y = 22.3; y <= 46.61; y += 0.9) P.push([X, y, z + Math.sin(y * 0.9 + z) * 0.28]); return P; };
    const bar = (z0, z1) => { const P = []; for (let k = 0; k <= 14; k++) { const t = k / 14; P.push([X, 46.9 + Math.sin(t * Math.PI * 2) * 0.35, lerp(z0, z1, t)]); } return P; };
    const tendril = (z, d, h) => { const P = []; for (let k = 0; k <= 16; k++) { const t = k / 16; P.push([X, 47.2 + t * h, z + d * (Math.sin(t * Math.PI * 1.3) * 2.2 + t * 1.5)]); } return P; };
    const tiers = [[pole(-9.9), pole(9.9)], [bar(-9.9, 0), bar(9.9, 0)],
      [[-8, -1, 11], [8, 1, 11.5], [-4.5, 1, 13], [4.5, -1, 12.5], [-1.5, -1, 9], [1.5, 1, 9.5], [-6, 1, 7], [6, -1, 7.5]].map(([z, d, h]) => tendril(z, d, h))];
    const len = (P) => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]); return L; };
    const at = (P, s, out) => {   // point + tangent at arc length s
      for (let i = 1; i < P.length; i++) {
        const L = Math.hypot(P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]);
        if (s <= L || i === P.length - 1) { const t = clamp(s / L, 0, 1); out[0] = X; out[1] = lerp(P[i - 1][1], P[i][1], t); out[2] = lerp(P[i - 1][2], P[i][2], t); out[3] = (P[i][1] - P[i - 1][1]) / L; out[4] = (P[i][2] - P[i - 1][2]) / L; return out; }
        s -= L;
      }
      return out;
    };
    // leaf slots: tier by tier, round robin over the tier's stems; a second, denser pass fills in
    const slots = [], q = [0, 0, 0, 0, 0];
    let n1 = 0;
    for (let pass = 0; pass < 2; pass++) {
      for (const T of tiers) {
        const counts = T.map((P) => Math.floor(len(P) / SP));
        const mx = Math.max(...counts);
        for (let k = 0; k < mx; k++) for (let j = 0; j < T.length; j++) {
          if (k >= counts[j]) continue;
          at(T[j], (k + (pass ? 0.5 : 0.15)) * SP, q);
          const side = (k + j + pass) % 2 ? 1 : -1, off = pass ? 0.85 : 0.42;
          slots.push({ x: X + 0.1 + vr() * 0.35, y: q[1] - q[4] * side * off, z: q[2] + q[3] * side * off, rot: Math.atan2(q[4], q[3]) + side * (0.9 + vr() * 0.5), yaw: (vr() - 0.5) * 0.7, s: 0.75 + vr() * 0.45 });
        }
      }
      if (!pass) n1 = slots.length;
    }
    // the order in which leaves appear: the hung vine's first foliage spread evenly over the whole vine, then the growth
    // along the stems (poles, the bar over the door, the tendrils), then the denser second pass
    const lOrder = [], used = new Uint8Array(slots.length);
    for (let k = 0; k < VINE_HUNG.leaves; k++) { const i = Math.min(n1 - 1, Math.floor((k + 0.5) * n1 / VINE_HUNG.leaves)); if (!used[i]) { used[i] = 1; lOrder.push(i); } }
    for (let i = 0; i < slots.length; i++) if (!used[i]) lOrder.push(i);
    // stems: gold tubes that grow in when the vine is hung (aG: the growth value at which each vertex shows)
    const tubes = [];
    let base = 0;
    for (const T of tiers) {
      const counts = T.map((P) => Math.floor(len(P) / SP)), mx = Math.max(...counts);
      T.forEach((P, j) => {
        const curve = new THREE.CatmullRomCurve3(P.map((p) => new THREE.Vector3(p[0], p[1], p[2]))), segs = Math.max(4, P.length * 2), g = new THREE.TubeGeometry(curve, segs, 0.11, 5, false);
        const L = len(P), n = g.attributes.position.count, G = new Float32Array(n);
        for (let i = 0; i < n; i++) { const s = Math.floor(i / 6) / segs * L; G[i] = (base + (s / SP) * T.length + j) / n1; }
        g.deleteAttribute('uv'); g.setAttribute('aG', new THREE.BufferAttribute(G, 1)); tubes.push(g);
      });
      base += counts.reduce((a, b) => a + b, 0);
    }
    const gold = new THREE.MeshStandardMaterial({ color: '#E7B64A', metalness: 0.85, roughness: 0.3, emissive: new THREE.Color('#6A470E'), emissiveIntensity: 0.55, side: THREE.DoubleSide });
    const stemMat = new THREE.MeshStandardMaterial({ color: '#D9A53C', metalness: 0.85, roughness: 0.35, emissive: new THREE.Color('#5A3C0A'), emissiveIntensity: 0.5 });
    const uG = { value: 0 };
    stemMat.onBeforeCompile = (sh) => {
      sh.uniforms.uG = uG;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aG; varying float vG;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvG = aG;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uG; varying float vG;').replace('#include <clipping_planes_fragment>', 'if (vG > uG) discard;\n#include <clipping_planes_fragment>');
    };
    stemMat.customProgramCacheKey = () => 'vinestem';
    const stem = new THREE.Mesh(mergeGeometries(tubes), stemMat);
    // a vine leaf, palmate, in the wall plane (facing east, out of the Heichal's front)
    const lp = [[0, 0.02], [0.3, 0.2], [0.52, 0.12], [0.5, 0.42], [0.66, 0.6], [0.36, 0.66], [0.3, 0.98], [0, 0.78], [-0.3, 0.98], [-0.36, 0.66], [-0.66, 0.6], [-0.5, 0.42], [-0.52, 0.12], [-0.3, 0.2]];
    const lv = [0, 0, 0.45], lidx = [];
    for (const [a, b] of lp) lv.push(0, b, a);
    for (let i = 0; i < lp.length; i++) lidx.push(0, 1 + i, 1 + ((i + 1) % lp.length));
    const leafG = new THREE.BufferGeometry(); leafG.setAttribute('position', new THREE.Float32BufferAttribute(lv, 3)); leafG.setIndex(lidx);
    leafG.translate(0, -0.1, 0); leafG.computeVertexNormals();
    const grapeG = new THREE.SphereGeometry(0.24, 8, 6);
    const cl = [];
    for (let k = 0; k < 14; k++) { const l = k < 5 ? 0 : k < 9 ? 1 : k < 12 ? 2 : 3, a = (k * 2.4) % 6.28, r = [0.36, 0.28, 0.18, 0.08][l]; cl.push(new THREE.SphereGeometry(0.2, 7, 5).translate(Math.cos(a) * r, -0.25 - l * 0.3, Math.sin(a) * r)); }
    cl.push(rod([0, 0.1, 0], [0, -0.3, 0], 0.04)); for (const g of cl) { g.deleteAttribute('uv'); }
    const clusterG = mergeGeometries(cl.map((g) => (g.index ? g.toNonIndexed() : g)));
    // (one bounding sphere round the whole vine: the three instanced meshes are culled with it, so the vine costs no draw
    // calls in views that do not see the Ulam's west wall)
    const vSphere = new THREE.Sphere(new THREE.Vector3(X + 0.3, 41.5, 0), 22);
    const inst = (g, n) => { const m = new THREE.InstancedMesh(g, gold, n); m.count = 0; m.boundingSphere = vSphere.clone(); m.receiveShadow = true; return m; };
    const leaves = inst(leafG, 360), grapes = inst(grapeG, 120), clusters = inst(clusterG, 36);
    const grp = new THREE.Group(); grp.visible = false; grp.add(stem, leaves, grapes, clusters); scene.add(grp);
    // grapes hang under the first pass's leaves, spread evenly along the stems; clusters under the lintel bar and the tendrils.
    // Each list is then taken in a stride order, so the first few (the hung vine's) are spread over the whole vine.
    const stride = (A, P) => A.map((_, i) => A[(i * P) % A.length]);
    const gSlots = [], cSlots = [];
    for (let i = 0; i < 120; i++) { const s = slots[Math.floor(i * n1 / 120)]; gSlots.push({ x: s.x + 0.25, y: s.y - 0.55 + vr() * 0.2, z: s.z + (vr() - 0.5) * 0.4, rot: 0, yaw: 0, s: 0.8 + vr() * 0.4 }); }
    const tierStart = tiers[0].reduce((a, P) => a + Math.floor(len(P) / SP), 0);
    for (let i = 0; i < 36; i++) { const s = slots[tierStart + ((i * 7 + 3) % Math.max(1, n1 - tierStart))]; cSlots.push({ x: s.x + 0.35, y: s.y - 0.5, z: s.z, rot: 0, yaw: vr() * 6.28, s: 0.85 + vr() * 0.4 }); }
    return { grp, stem, uG, gold, n1, on: false, stemT: 0, kinds: [{ m: leaves, slots: lOrder.map((i) => slots[i]), cap: 360, want: 0, d: 0 }, { m: grapes, slots: stride(gSlots, 43), cap: 120, want: 0, d: 0 }, { m: clusters, slots: stride(cSlots, 13), cap: 36, want: 0, d: 0 }] };
  })();
  // what the player's vine holds (the game's G.vine), and whether the finished Temple shows it grown
  const vs = { leaves: 0, grapes: 0, clusters: 0, grown: false, demo: false, early: false };
  const vineHung = () => !!(ST.ulam && (ST.ulam.status === 'done' || vs.early));
  function vineSync(instant) {
    const K = vine.kinds, hung = vineHung(), on = hung || vs.grown;
    if (!on) {
      for (const k of K) k.want = 0;
      vine.on = false;
      if (instant) { for (const k of K) { k.d = 0; k.m.count = 0; } vine.stemT = 0; vine.uG.value = 0; vine.grp.visible = false; }
      return;
    }
    const grown = vs.grown || (vs.demo && hung);
    const n = [VINE_HUNG.leaves + vs.leaves, VINE_HUNG.grapes + vs.grapes, VINE_HUNG.clusters + vs.clusters];
    if (grown) { n[0] = Math.max(n[0], VINE_GROWN.leaves); n[1] = Math.max(n[1], VINE_GROWN.grapes); n[2] = Math.max(n[2], VINE_GROWN.clusters); }
    K.forEach((k, i) => { k.want = clamp(Math.floor(n[i]), 0, k.cap); });
    if (!vine.on) { vine.on = true; vine.grp.visible = true; vine.stemT = instant ? 1 : Math.min(vine.stemT, 0.999); }
    if (instant) {
      vine.stemT = 1; vine.uG.value = 2;
      for (const k of K) { k.d = k.want; for (let i = 0; i < k.want; i++) vineSlot(k, i, k.d); k.m.count = k.want; k.m.instanceMatrix.needsUpdate = true; }
    }
  }
  function setVine(size, v, o) {
    if (size && typeof size === 'object') v = size;
    if (v && typeof v === 'object') { vs.leaves = Math.max(0, +v.leaves || 0); vs.grapes = Math.max(0, +v.grapes || 0); vs.clusters = Math.max(0, +v.clusters || 0); }
    else { const n = Math.max(0, Math.floor(+size || 0)); vs.leaves = n; vs.grapes = Math.floor(n / 3); vs.clusters = Math.floor(n / 10); }
    // (the game is in charge again: the finished Temple's grown vine gives way to the player's own — a cut, not a wilting)
    const was = vs.grown;
    vs.grown = !!(o && o.grown); vs.demo = !!(o && o.demo);
    vineSync(was && !vs.grown);
  }
  const vE = new THREE.Euler();
  function vineSlot(K, i, d) {
    const s = K.slots[i], a = clamp(d - i, 0, 1), k = a <= 0 ? 0 : a >= 1 ? 1 : easeBack(a);
    vE.set(s.rot, s.yaw, 0, 'YXZ'); tmpQ.setFromEuler(vE); tmpV.set(s.x, s.y, s.z); tmpS.setScalar(Math.max(1e-4, s.s * k));
    tmpM.compose(tmpV, tmpQ, tmpS); K.m.setMatrixAt(i, tmpM);
  }
  function vineUpdate(dt) {
    if (!vine.grp.visible) return;
    // hanging: the gold stems grow up the poles, along the bar over the door and out along the tendrils (2.2 s); then the
    // leaves, the grapes and the clusters come; taken down (the Ulam unbuilt): the other way round
    if (vine.on) vine.stemT = Math.min(1, vine.stemT + dt / 2.2);
    else if (!vine.kinds.some((k) => k.d > 0)) vine.stemT = Math.max(0, vine.stemT - dt / 0.8);
    vine.uG.value = vine.stemT >= 1 ? 2 : vine.stemT * 1.03;
    const hold = vine.on && vine.stemT < 1;
    let any = false;
    for (const K of vine.kinds) {
      const want = hold ? 0 : K.want;
      if (K.d !== want) {
        const was = K.d, rate = Math.max(14, Math.abs(want - K.d) * 2.5);
        K.d = K.d < want ? Math.min(want, K.d + rate * dt) : Math.max(want, K.d - rate * dt * 3);
        const lo = Math.max(0, Math.floor(Math.min(was, K.d)) - 1), hi = Math.min(K.cap, Math.ceil(Math.max(was, K.d)) + 1);
        for (let i = lo; i < hi; i++) vineSlot(K, i, K.d);
        if (K.d > was) for (let i = Math.ceil(was); i < K.d && i < Math.ceil(was) + 3; i++) { const s = K.slots[i]; spark.spawn(s.x + 0.4, s.y, s.z, 1, PO(0.5, 0, 0.6, 1.5, 1.1, 0.3, 0.9, -0.3, 1, 0.9, true)); }
        K.m.count = Math.min(K.cap, Math.ceil(K.d)); K.m.instanceMatrix.needsUpdate = true;
      }
      if (K.d > 0 || want > 0) any = true;
    }
    if (!any && !vine.on && vine.stemT <= 0) vine.grp.visible = false;
  }

  /* ── night rain (Ta'anit 23a): streaks around the camera, animated in the vertex shader; the paving turns wet ── */
  const rain = (() => {
    const N = 2400, P = new Float32Array(N * 6), E = new Float32Array(N * 2), S = new Float32Array(N * 2), rr = rng(77);
    for (let i = 0; i < N; i++) {
      const x = (rr() - 0.5) * 160, y = rr() * 100, z = (rr() - 0.5) * 160, s = rr();
      for (let k = 0; k < 2; k++) { P[i * 6 + k * 3] = x; P[i * 6 + k * 3 + 1] = y; P[i * 6 + k * 3 + 2] = z; E[i * 2 + k] = k; S[i * 2 + k] = s; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aEnd', new THREE.BufferAttribute(E, 1)); g.setAttribute('aSeed', new THREE.BufferAttribute(S, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: BUILD_TIME, uC: { value: new THREE.Vector3() }, uA: { value: 0 }, uCol: { value: new THREE.Color(0.66, 0.74, 0.9) } },
      vertexShader: `attribute float aEnd; attribute float aSeed; uniform float uTime; uniform vec3 uC; uniform float uA; varying float vA;
        void main(){
          float H = 100.0, y = mod(position.y - uTime * (68.0 + aSeed * 30.0), H), fall = H - y;
          vec3 w = uC + vec3(position.x + fall * 0.2, y - 50.0, position.z + fall * 0.1);
          w += vec3(0.2, -1.0, 0.1) * aEnd * (2.4 + aSeed * 1.8);
          vA = uA * (0.22 + 0.4 * aSeed) * smoothstep(0.0, 10.0, y) * smoothstep(H, H - 10.0, y) * (1.0 - aEnd * 0.85);
          gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
        }`,
      fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ gl_FragColor = vec4(uCol, vA); }`,
      transparent: true, depthWrite: false,
    });
    const L = new THREE.LineSegments(g, m); L.frustumCulled = false; L.visible = false; L.renderOrder = 9; fxG.add(L);
    return { L, U: m.uniforms, want: false, k: 0, wet: -1 };
  })();
  const paves = list.map((st) => st.cache.pave).filter(Boolean).map((m) => ({ m, r: m.roughness, c: m.color.clone() }));
  function setRain(on) { rain.want = !!on; }
  function rainUpdate(dt) {
    const want = rain.want && buildPhase() ? 1 : 0;
    rain.k += (want - rain.k) * Math.min(1, dt * (want ? 0.8 : 1.5));
    if (rain.k < 0.003) rain.k = want ? rain.k : 0;
    rain.L.visible = rain.k > 0.003;
    if (rain.L.visible) { camera.getWorldDirection(camDir); rain.U.uC.value.copy(camera.position).addScaledVector(camDir, 45); rain.U.uA.value = rain.k; }
    // wet paving: darker, and glossy enough to catch the braziers
    if (Math.abs(rain.k - rain.wet) > 0.02 || (rain.k === 0 && rain.wet !== 0)) {
      rain.wet = rain.k;
      for (const p of paves) { p.m.roughness = lerp(p.r, 0.2, rain.k); p.m.color.copy(p.c).multiplyScalar(1 - 0.28 * rain.k); }
    }
  }

  /* ── the Heichal's gold catches the sun: a glint runs along the façade ── */
  const star = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.texStar(), color: new THREE.Color(4, 3.1, 1.7), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
  star.visible = false; star.renderOrder = 10; fxG.add(star);
  const golds = ['ulam', 'heichal', 'kodesh'].map((id) => ST[id].cache.gold).filter(Boolean).map((m) => ({ m, e: m.emissive.clone(), i: m.emissiveIntensity }));
  const sh = { on: false, t: 0, dur: 3, res: null };
  function shine() {
    shineStop(false);
    sh.on = true; sh.t = 0; star.visible = true;
    return new Promise((res) => { sh.res = res; });
  }
  function shineUpdate(dt) {
    if (!sh.on) return;
    sh.t += dt;
    const u = sh.t / sh.dur, e = Math.sin(Math.PI * clamp(u * 1.1, 0, 1)), w = easeIO(clamp(u / 0.85, 0, 1));
    for (const g of golds) { g.m.emissive.setRGB(1, 0.7, 0.26); g.m.emissiveIntensity = e * 0.85; }
    // along the gold cornice under the parapet, north to south, flaring at the ends
    const z = lerp(-50, 50, w), s = (14 + 10 * Math.sin(u * 23) * Math.sin(u * 7)) * (0.4 + e);
    star.position.set(-75.4, 110.2, z); star.scale.set(s, s, 1); star.material.rotation = u * 1.2;
    star.material.opacity = Math.min(1, e * 1.6);
    if (Math.random() < 0.7) spark.spawn(-75.2, 110.2 + Math.random() * 5.5, z + (Math.random() - 0.5) * 6, 2, PO(1, 0, 2, 3, 1.8, 0.4, 1.1, 3, 1, 1, true));
    if (u >= 1) shineStop(true);
  }
  function shineStop(ok) {
    if (!sh.on) return;
    sh.on = false; star.visible = false;
    for (const g of golds) { g.m.emissive.copy(g.e); g.m.emissiveIntensity = g.i; }
    if (sh.res) { const r = sh.res; sh.res = null; r(ok); }
  }

  /* ── strike juice: normal · perfect (gold ring, flecks, flash) · combo (and the build edge glows brighter) ── */
  let comboN = 0, comboV = 0, flashI = 0;
  const flashA = new Float32Array(4), flashS = new Float32Array(4);
  function flash(x, y, z, s) { flashI = (flashI + 1) % 4; flashA[flashI] = 1; flashS[flashI] = s; glowsTop.set(T_FLASH + flashI, x, y, z, s, cFlash, 1, 0); }
  // ── hero (PEOPLE) ── strike juice from the contact point
  function strikeFX(target, quality = 'normal', level = 0) {
    const q = quality === 'combo' ? 2 : quality === 'perfect' ? 1 : 0, L = clamp(+level || (q === 2 ? 2 : 0), 0, 12);
    const st = typeof target === 'string' ? ST[target] : null;
    // the hero has just struck: his stroke already threw chips and dust where his tool met the stone, and the juice
    // starts there too (never from a point in the air)
    const byHero = time - hero.lastHit < 0.35;
    if (byHero) sfxP.copy(hero.contact);
    else if (!targetPoint(target, sfxP)) return;
    const p = sfxP;
    let hex = byHero ? hero.hitHex : '#CFC3A8', floor = byHero ? groundAt(p.x, p.z) : p.y - 0.45;
    if (!byHero) {
      if (st) hex = STONE[st.def.stone] || STONE.ash;
      else if (target && target.boulder !== undefined) { hex = '#CFC4AC'; floor = hill.heightAt(p.x, p.z); p.y -= 1.5; }
      else if (target === 'quarry') { hex = '#E4D9C0'; floor = 0; }
    }
    if (!byHero || q > 0) {
      dustBurst(p.x, p.y, p.z, (byHero ? 1 : 5) + q * 2, 3.5, 2.5 + q, 1.4);
      chips.spawn(p.x, p.y + 0.3, p.z, (byHero ? 1 : 8) + q * 5, hex, { speed: 6 + q * 2, up: 8 + q * 2, size: 0.3, floor });
    }
    if (hero.tool === 'iron' && !byHero) spark.spawn(p.x, p.y + 0.4, p.z, 7, PO(0.8, 0, 8, 5, 1.1, 0.3, 0.45, 14, 2.5, 1));
    if (st) st.glowBoost = Math.max(st.glowBoost, 0.55 + q * 0.35);
    if (q >= 1) {
      spark.spawn(p.x, p.y + 0.5, p.z, 24 + L * 2, PO(0, 0, 21 + L, 1.5, 2.2, 0.5, 0.65, 1, 3.4, 1, false, 1));
      spark.spawn(p.x, p.y + 0.6, p.z, 12 + L * 3, PO(1.5, 0, 5, 13 + L, 1.3, 0.35, 1.3, 10, 1.1, 1, true));
      flash(p.x, p.y + 0.8, p.z, clamp(p.distanceTo(camera.position) * 0.06, 3.5, 18) * (1 + 0.15 * q + 0.04 * L));
      if (st && hs.st === st) hs.pulse = 1;
      ringAt(p.x, p.y + 0.2, p.z, 7 + L * 0.8);
    }
    if (q === 2 && st) st.glowBoost = Math.max(st.glowBoost, 0.7 + 0.16 * Math.min(L, 8));
  }
  // ── /hero ──
  /* ── key moments (src/game/moments.js, through the game's guarded world): one beat of a moment in the world.
     'frame' (arg: a stage id): the camera flies to the site, placed above (portrait) or left of (wide) the moment's card.
     'fire': the first fire on the finished altar (the karnot moment): life's altar fire, sparks and a flash on its top.
     'gold' | 'dust' (arg: a stage id): a burst of gold sparks or of stone dust at that site.
     'inside' | 'outside' (arg: 'heichal'): into the gold interior and back out (the Heichal's moment). Unknown kinds do nothing. */
  const mfxP = new THREE.Vector3();
  function momentFX(kind, arg) {
    if (kind === 'frame') return typeof arg === 'string' && ST[arg] ? frameMoment(arg) : false;
    // 'inside' | 'outside' (arg 'heichal', wave 4 — for the gold-polishing moment): a cut into the Heichal's gold interior (the
    // sanctuary layer, which main.js sets as stages.sanctuary; the moment's card still covers the lower screen) and back out
    if ((kind === 'inside' || kind === 'outside') && arg === 'heichal') {
      const sa = api.sanctuary;
      if (!sa || typeof sa.enter !== 'function') return false;
      try { const p = kind === 'inside' ? sa.enter('heichal', { ms: 0, force: true }) : sa.exit({ ms: 0 }); if (p && p.catch) p.catch(() => false); } catch (e) { return false; }
      return true;
    }
    if (kind === 'fire') {
      const st = ST.karnot; if (!st || !st.fb) return;
      if (life && life.setFire) life.setFire(true);
      mfxP.set((st.fb.x0 + st.fb.x1) / 2, Math.max(st.base + 8, st.top - 0.8), (st.fb.z0 + st.fb.z1) / 2);
      sparkBurst(mfxP.x, mfxP.y + 0.6, mfxP.z, 70, 7, 16);
      dustBurst(mfxP.x, mfxP.y + 2, mfxP.z, 10, 6, 3, 5);
      flash(mfxP.x, mfxP.y + 2, mfxP.z, clamp(mfxP.distanceTo(camera.position) * 0.09, 5, 26));
      ringAt(mfxP.x, mfxP.y + 0.2, mfxP.z, 18);
      return;
    }
    // (the Ulam's moment hangs a leaf, a grape and a cluster on the vine: its first gold beat hangs the vine in the world,
    // behind the moment's card, once the Ulam itself stands complete)
    if (kind === 'gold' && arg === 'ulam' && ST.ulam && !vineHung() && (ST.ulam.status === 'done' || (ST.ulam.status === 'building' && ST.ulam.target >= 0.99))) { vs.early = true; vineSync(false); }
    if ((kind === 'gold' || kind === 'dust') && typeof arg === 'string' && targetPoint(arg, mfxP)) {
      if (kind === 'gold') { spark.spawn(mfxP.x, mfxP.y + 1, mfxP.z, 40, PO(3, 1, 9, 6, 1.6, 0.5, 1.2, 4, 1.6, 1, true)); flash(mfxP.x, mfxP.y + 1, mfxP.z, clamp(mfxP.distanceTo(camera.position) * 0.07, 4, 20)); }
      else dustBurst(mfxP.x, mfxP.y, mfxP.z, 14, 5, 4, 2.5);
    }
  }
  function setComboLevel(n) { comboN = Math.max(0, Math.floor(+n || 0)); comboV = Math.min(comboN, 5) / 5; }
  function flashUpdate(dt) {
    for (let i = 0; i < 4; i++) {
      if (flashA[i] <= 0) continue;
      flashA[i] = Math.max(0, flashA[i] - dt * 4.5);
      glowsTop.alpha[T_FLASH + i] = flashA[i] * flashA[i] * 0.85; glowsTop.size[T_FLASH + i] = flashS[i] * (1.35 - 0.35 * flashA[i]); glowsTop.dirty = true;
    }
  }
  // ── hero (PEOPLE) ── the hero's tools
  function setTool(k) {
    const t = k === 'iron' ? 'iron' : 'wood';
    // ── site12 ── (N59) wood again while an iron tool is still in his hand (a pick from a dig): the mallet
    if (t === hero.tool) { if (t === 'wood' && IRON_TOOLS[hero.held]) hero.held = 'mallet'; return; }
    hero.tool = t;
    // the tool in his hand: the iron hammer, or the wooden mallet (the altar's stones: no iron, Middot 3:4)
    if (t === 'wood' || hero.held === 'mallet' || hero.held === 'hammer') hero.held = t === 'iron' ? 'hammer' : 'mallet';
    // at the altar the banker holds a whole stone (auto mode)
    if (wp.auto && hero.at && DEF[hero.at] && !hero.path) { const want = wpDefault(hero.at); if (want && want !== wp.state) wpSet(want); }
    if (hero.vis) {
      hA.set(0, -HL.palm, 0.3).applyQuaternion(PZ.QR).add(PZ.WR); m2w(hA, hB);
      dust.spawn(hB.x, hB.y, hB.z, 6, PO(1.2, 0, 1.5, 1.2, 1.2, 3, 0.9, 0, 1.5, 0.35));
      spark.spawn(hB.x, hB.y, hB.z, 6, PO(0.8, 0, 2, 3, 1.2, 0.3, 0.7, 2, 1, 1, true));
    }
  }
  // ── /hero ──

  /* ── the "while you were away" timelapse: each changed site replayed fast, one after another ── */
  const tl = { on: false, items: null, i: -1, t: 0, slice: 1, res: null, cam: true, dust: 0 };
  let wSpeed = 1, cSpeed = 1;
  function tlState(v, st) {
    if (typeof v === 'number') return v >= 1 ? { status: 'done', p: 1 } : { status: 'building', p: clamp(v, 0, 1) };
    if (v && typeof v === 'object') {
      const s = ['locked', 'avail', 'building', 'done'].includes(v.status) ? v.status : 'building';
      return { status: s, p: s === 'done' ? 1 : clamp(+(v.p !== undefined ? v.p : v.progress) || 0, 0, 1) };
    }
    return { status: st.status, p: st.target };
  }
  function playTimelapse(changes, ms = 4000, opts = {}) {
    tlStop(false);
    const items = [];
    for (const c of changes || []) {
      const st = c && ST[c.id];
      if (!st || st.tl) continue;
      const it = { st, from: tlState(c.from !== undefined ? c.from : c.a, st), to: tlState(c.to !== undefined ? c.to : c.b, st), started: false, p0: 0 };
      st.tl = it; items.push(it);
    }
    if (!items.length) return Promise.resolve(true);
    Object.assign(tl, { on: true, items, i: -1, t: 0, cam: opts.camera !== false, slice: Math.max(0.9, (+ms || 4000) / 1000 / items.length) });
    return new Promise((res) => { tl.res = res; });
  }
  function tlStart(it) {
    it.started = true;
    const a = it.from;
    it.p0 = a.status === 'building' ? a.p : a.status === 'done' ? 1 : 0;
    setStage(it.st.id, 'building', it.p0, { instant: true, _tl: true });
    if (tl.cam) focus(it.st.id, Math.min(1100, tl.slice * 360));
  }
  function tlEnd(it, fx = true) {
    const st = it.st, b = it.to;
    st.tl = null;
    if (b.status === 'done') {
      setStage(st.id, 'done', 1, fx ? { _tl: true } : { instant: true, _tl: true });
      if (fx) { const fb = st.fb; ringAt((fb.x0 + fb.x1) / 2, (st.id === 'har' ? 0 : st.base) + 0.4, (fb.z0 + fb.z1) / 2, Math.max(fb.x1 - fb.x0, fb.z1 - fb.z0) * 0.7); }
    } else setStage(st.id, b.status, b.p, { instant: true, _tl: true });
  }
  function tlDrop(st) {
    const it = st.tl; st.tl = null;
    if (tl.on && tl.items) { const k = tl.items.indexOf(it); if (k > tl.i) tl.items.splice(k, 1); }
  }
  function tlUpdate(dt) {
    wSpeed = 1; cSpeed = 1;
    if (!tl.on) return;
    tl.t += dt;
    const k = Math.floor(tl.t / tl.slice);
    if (k !== tl.i) {
      const cur = tl.items[tl.i];
      if (cur && cur.st.tl === cur) tlEnd(cur);
      tl.i = k;
      if (k >= tl.items.length) { tlFinish(true); return; }
      tlStart(tl.items[k]);
    }
    const it = tl.items[k];
    if (!it || it.st.tl !== it) return;
    const st = it.st, u = (tl.t - k * tl.slice) / tl.slice;
    const p1 = it.to.status === 'done' ? 1 : it.to.status === 'building' ? it.to.p : it.p0;
    st.target = lerp(it.p0, p1, easeIO(clamp((u - 0.2) / 0.62, 0, 1)));
    if (u > 0.2 && u < 0.86) {
      wSpeed = 4; cSpeed = 3.5;
      if ((tl.dust += dt) > 0.09) {
        tl.dust = 0; edgePoint(st, Math.random(), pA);
        const y = st.id === 'har' ? groundAt(pA.x, pA.z) : Math.max(st.base, revealY(st));
        dustBurst(pA.x, y, pA.z, 2, 4, 3, 1.5);
        if (Math.random() < 0.35) sparkBurst(pA.x, y + 1, pA.z, 4, 3, 5);
      }
    }
  }
  function tlFinish(ok) {
    if (!tl.on) return;
    tl.on = false;
    for (const it of tl.items) if (it.st.tl === it) tlEnd(it, false);
    tl.items = null;
    if (tl.res) { const r = tl.res; tl.res = null; r(ok); }
  }
  function tlStop(ok) { tlFinish(ok); }

  /* ── the quarry: shown once the platform exists, until the Temple is finished ── */
  let quarryOn = false, qStock = 0, qCrews = 0;
  function setQuarryStock(n, crews) {
    qStock = Math.max(0, Math.floor(+n || 0));
    if (crews !== undefined) qCrews = clamp(Math.floor(+crews || 0), 0, 4);
    propsDirty = true; workDirty = true;
  }
  function quarryRocks() {
    for (const m of bMesh) m.count = BOULDERS.length + (quarryOn ? QROCKS.length : 0);
    if (quarryOn) QROCKS.forEach(([x, z, r, sy, yaw], k) => {
      const gy = groundAt(x, z) - r * 0.2;
      tmpE.set(0.12 * Math.sin(yaw * 3), yaw, 0.1 * Math.cos(yaw * 2), 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(x, gy, z); tmpS.set(r, r * sy, r * 0.95); tmpM.compose(tmpV, tmpQ, tmpS);
      for (let c = 0; c < 3; c++) bMesh[c].setMatrixAt(BOULDERS.length + k, tmpM);
    });
    for (const m of bMesh) { m.instanceMatrix.needsUpdate = true; m.visible = bVisible || quarryOn; }
    requestShadow(true);
  }
  function resetFx() { planStop(false); showStop(false); orbitStop(false); tlStop(false); redLine(null); boxesHide(); shineStop(false); }

  /* ── picking ── */
  const pickBox = new THREE.Box3(), sph = new THREE.Sphere(), hitP = new THREE.Vector3();
  function pick(raycaster) {
    const ray = raycaster.ray;
    let best = null, bd = Infinity;
    if (bVisible) for (let i = 0; i < bSt.length; i++) {
      const b = bSt[i]; if (b.state <= 0) continue;
      sph.center.set(b.x, hill.heightAt(b.x, b.z) + b.r * 0.35, b.z); sph.radius = b.r * 1.15;
      if (ray.intersectSphere(sph, hitP)) { const d = hitP.distanceTo(ray.origin); if (d < bd) { bd = d; best = { kind: 'boulder', index: i }; } }
    }
    if (best) return best;
    // the hot spot (a tap on the glowing stone is a tap on its site), the quarry outcrop
    if (hs.id && hsMesh.visible) {
      sph.center.copy(hs.pos); sph.radius = Math.max(2.6, hs.pos.distanceTo(ray.origin) * 0.022);
      if (ray.intersectSphere(sph, hitP)) { const d = hitP.distanceTo(ray.origin) - 60; if (d < bd) { bd = d; best = { kind: 'site', id: hs.id }; } }
    }
    if (quarryOn) {
      sph.center.set(QX + 2, 4, QZ - 2); sph.radius = 19;
      if (ray.intersectSphere(sph, hitP)) { const d = hitP.distanceTo(ray.origin); if (d < bd) { bd = d; best = { kind: 'quarry' }; } }
      // ── site11 ── the game table (a 44-px target at least: its sphere grows with the distance)
      sph.center.set(GTAB.x, groundAt(GTAB.x, GTAB.z) + 2.6, GTAB.z); sph.radius = Math.max(4.2, sph.center.distanceTo(ray.origin) * 0.03);
      if (ray.intersectSphere(sph, hitP)) { const d = hitP.distanceTo(ray.origin) - 20; if (d < bd) { bd = d; best = { kind: 'table' }; } }
    }
    for (const st of list) {
      if (st.status !== 'avail' && st.status !== 'building') continue;
      pinPos(st, sph.center); sph.radius = Math.max(4, sph.center.distanceTo(ray.origin) * 0.03);
      if (st.status === 'avail' && ray.intersectSphere(sph, hitP)) { const d = hitP.distanceTo(ray.origin) - 50; if (d < bd) { bd = d; best = { kind: 'site', id: st.id }; } }
      for (const [x0, z0, x1, z1] of st.def.foot) {
        const y0 = st.id === 'har' ? -60 : st.base - 1, y1 = st.id === 'har' ? 40 : Math.max(st.top, st.base + 6);
        pickBox.min.set(x0 - 2, y0, z0 - 2); pickBox.max.set(x1 + 2, y1, z1 + 2);
        if (ray.intersectBox(pickBox, hitP)) { const d = hitP.distanceTo(ray.origin) + (st.id === 'har' ? 400 : 0); if (d < bd) { bd = d; best = { kind: 'site', id: st.id }; } }
      }
    }
    return best;
  }
  function siteCenter(id) { const st = ST[id]; if (!st) return null; const fb = st.fb; const cx = (fb.x0 + fb.x1) / 2, cz = (fb.z0 + fb.z1) / 2; return new THREE.Vector3(cx, st.id === 'har' ? 0 : (st.base + st.top) / 2, cz); }
  function siteTop(id) { const st = ST[id]; if (!st) return null; return pinPos(st, new THREE.Vector3()); }

  /* ── site8 ── the Mount's close camera (SITE8B, wave 8B; the owner, 28.9: "the last two stones are hidden, you can't see what
     you strike", "a very large zoom-out"). v16 framed a boulder from one fixed bearing (az 25, el 30) and re-aimed only when the
     rock left the screen, so a rock behind the crest, behind another rock, or with the builder on its far side stayed as it was.
     Now every pose on the rough Mount checks its line of sight: the ray from the rock (and the builder) to the camera is
     marched over the ground and past the standing boulders, and the pose turns / rises until it clears. The Mount's own
     focus frames the builder's work (the rock, the builder, the gang beside it), never the whole 880-amah hill. */
  const SC_CLEAR = 2.5;                       // amot the line of sight keeps above the ground
  const scH = (x, z) => (x > X0 - 60 && x < X1 + 60 && z > Z0 - 140 && z < Z1 + 60 ? groundAt(x, z) : terrainH(x, z));
  // the camera's floor (main.js clampCam): 7 over the Mount, else 14 over the terrain
  const scMinY = (x, z) => (x > -310 && x < 290 && z > -490 && z < 410 ? camFloor(x, z) : terrainH(x, z) + 14);
  /** ── site9 ── the camera's floor over the Mount (main.js clampCam asks): 7 over the platform's level — but in the Mount's
   *  walls' phases, where the work is 45–64 amot below that level (the working bay), 8 over the ground, so the walls' frame can
   *  look into the bay from the hill's side instead of from 70 amot overhead */
  function camFloor(x, z) {
    const hs = ST.har;
    // ── site15 ── the survey and the dig too: the rocks lie 40 amot under the platform's level (the first rock's ground at −43),
    // and from a floor of 7 every frame of him there was a 60° look-down — 67 px of his 3.6 amot (task-scenes: har.survey)
    if (hs.status === 'building' && hs.phase !== 'finish' && hs.phase !== 'done') return Math.min(7, scH(x, z) + 8);
    return 7;
  }
  // the smallest clearance of the segment target → camera over the ground; −1 when a standing boulder (not `skip`) is in the way
  // (the margin asked of the ray grows with the distance from the target: none at the target, SC_CLEAR from ~20 amot out;
  //  `req` false = the bare clearance)
  function sightClear(px, py, pz, tx, ty, tz, skip = -1, req = true) {
    const L = Math.hypot(px - tx, py - ty, pz - tz), n = clamp(Math.ceil(L / 4), 10, 70);
    let m = 1e9;
    for (let k = 1; k <= n; k++) {
      const u = k / n, x = tx + (px - tx) * u, y = ty + (py - ty) * u, z = tz + (pz - tz) * u;
      if (L * u < 3) continue;
      const c = y - scH(x, z) - (req ? Math.min(SC_CLEAR, 0.12 * L * u) : 0); if (c < m) m = c;
    }
    if (bVisible) for (let i = 0; i < bSt.length; i++) {
      const b = bSt[i]; if (i === skip || b.state <= 0) continue;
      // distance from the boulder's centre to the segment (the rock as a sphere of 0.9 r)
      const cy = hill.heightAt(b.x, b.z) + b.r * 0.35, vx = px - tx, vy = py - ty, vz = pz - tz, wx = b.x - tx, wy = cy - ty, wz = b.z - tz;
      const u = clamp((wx * vx + wy * vy + wz * vz) / (L * L || 1), 0, 1);
      if (u * L < 2) continue;
      if (Math.hypot(wx - vx * u, wy - vy * u, wz - vz * u) < b.r * 0.9) return -1;
    }
    return m;
  }
  const mountRough = () => !isDone('har');
  /** is (x, y, z) hidden from `from` (default: the camera) by the rough Mount — the hill or a standing boulder? */
  function occluded(x, y, z, from) {
    if (!mountRough()) return false;
    const P = from || camera.position;
    let skip = -1; for (let i = 0; i < bSt.length; i++) { const b = bSt[i]; if (b.state > 0 && Math.hypot(b.x - x, b.z - z) < b.r + 1) { skip = i; break; } }
    return sightClear(P.x, P.y, P.z, x, y, z, skip, false) < 0;
  }
  // a pose from (x, y, z): distance d, azimuth / elevation in degrees (0° az = from +x/east, the host lookAt's convention)
  const DEG = Math.PI / 180, scP = [0, 0, 0], tmpV3a = new THREE.Vector3(), tmpV3b = new THREE.Vector3();
  const scPos = (x, y, z, d, az, el, o) => { const a = az * DEG, e = el * DEG; o[0] = x + Math.cos(e) * Math.cos(a) * d; o[1] = y + Math.sin(e) * d; o[2] = z + Math.cos(e) * Math.sin(a) * d; return o; };
  const SC_DAZ = [0, 20, -20, 40, -40, 60, -60, 90, -90, 120, -120, 150, -150, 180], SC_DEL = [0, 8, 16, 26];
  // the candidate turns, cheapest first: a turn of 20° costs about as much as 9° more elevation
  const SC_C = []; for (const de of SC_DEL) for (const da of SC_DAZ) SC_C.push([da, de]);
  SC_C.sort((a, b) => (Math.abs(a[0]) + 2.2 * a[1]) - (Math.abs(b[0]) + 2.2 * b[1]));
  /** the pose nearest to the asked one (degrees; `d` = the real distance) whose line of sight to (x, y, z) — and to every point
   *  of `also` [[x, y, z]…] — clears the rough Mount → { az, el, dist, moved }; null once the Mount is done (the courts' views are
   *  hand-set) */
  function clearView(x, y, z, d = 128, az = 25, el = 30, also = null, skip = -1) {
    if (!mountRough()) return null;
    let best = null, bc = -1e9, bAz = az, bEl = el;
    for (const [da, de] of SC_C) {
      const e = Math.min(62, el + de), a = az + da;
      scPos(x, y, z, d, a, e, scP);
      if (scP[1] < scMinY(scP[0], scP[2]) + 1 || scP[1] < scH(scP[0], scP[2]) + 6) continue;
      let c = sightClear(scP[0], scP[1], scP[2], x, y, z, skip);
      if (also) for (const q of also) c = Math.min(c, sightClear(scP[0], scP[1], scP[2], q[0], q[1], q[2], q.length > 3 ? q[3] : skip));
      if (c >= 0) return { az: a, el: e, dist: d, moved: da !== 0 || de !== 0 };
      if (c > bc) { bc = c; bAz = a; bEl = e; }
    }
    // (no clear pose: the least blocked one; if every pose was under the ground, the steepest)
    best = bc > -1e9 ? { az: bAz, el: bEl, dist: d, moved: true, blocked: true } : { az, el: 62, dist: d, moved: true, blocked: true };
    return best;
  }
  /** the boulder camera: the rock `i`, the builder where he stands to strike it (from where he is now) and the gang at its
   *  flanks in one close frame, from his side of the rock, turned ~50° so neither hides the other, with a clear line of sight.
   *  → { p: [x, y, z], t: [x, y, z], dist, az, el } (dist = the real distance; the portrait factor is in it) */
  function boulderView(i, from) {
    const b = bSt[i]; if (!b) return null;
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
    const f = from && typeof from.x === 'number' ? from : hero;
    let dx = f.x - b.x, dz = f.z - b.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    if (L < 1) { dx = 0.8; dz = 0.6; }
    const hr = b.r + 2.1 * HERO_S, hx = b.x + dx * hr, hz = b.z + dz * hr;
    const g = hill.heightAt(b.x, b.z), hy = scH(hx, hz);
    // DESIGN8B's CAM.STRIKE: the rock's centre at ground + 0.45 r, 72 amot on a portrait phone (the whole rock ≈ 85 % of the
    // width, the builder ≥ 80 px), el 24°, from his side turned BV_TURN — away from the next rock, which then stands behind the
    // target in the upper third
    // ── site11 ── (PRODUCER10 N9, ⚑ default: "the rocks' camera leaves him mid-glide") turned 18°, not 28°: walking the 24 amot
    // from the last rock he started ≈ 11 amot to the side, outside a portrait frame's half-width (≈ 10 amot); at 18° he stays in
    const BV_TURN = 18;
    const tx = b.x, tz = b.z, ty = g + 0.45 * b.r;
    const ha = Math.atan2(dz, dx) / DEG, d = portrait ? 72 : 60;
    let nb = -1, nd = 1e9;
    for (let k = 0; k < bSt.length; k++) { const q = bSt[k]; if (k === i || q.state <= 0) continue; const dd = Math.hypot(q.x - b.x, q.z - b.z); if (dd < nd) { nd = dd; nb = k; } }
    let side = 1;
    if (nb >= 0) { const na = Math.atan2(bSt[nb].z - b.z, bSt[nb].x - b.x) / DEG, dA = (a) => Math.abs(((a - na + 540) % 360) - 180); side = dA(ha + BV_TURN) >= dA(ha - BV_TURN) ? 1 : -1; }
    const also = [[b.x, g + b.r * 0.7, b.z], [hx, hy + 2.6, hz, -1]];   // (the builder: his own rock may hide him too)
    // both sides are tried; the one that needs the smaller turn / rise wins (the next rock's side breaks a tie)
    const cost = (c, pa, pen) => (c ? Math.abs(c.az - pa) + 2.2 * (c.el - 24) + (c.blocked ? 500 : 0) + pen : 1e9);
    const pa = ha + BV_TURN * side, pb = ha - BV_TURN * side;
    const ca = clearView(tx, ty, tz, d, pa, 24, also, i), cb = clearView(tx, ty, tz, d, pb, 24, also, i);
    const c = (cost(ca, pa, 0) <= cost(cb, pb, 8) ? ca : cb) || { az: pa, el: 24, dist: d };
    scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
    return { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], dist: c.dist, az: c.az, el: c.el, hero: [hx, hy, hz], blocked: !!c.blocked };
  }
  /** DESIGN8B's CAM.WALL for the Mount's walls: between the builder's banker and the course's next slot, 64 amot on a portrait
   *  phone, el 20°, from outside the face turned 35° along it (the banker and the builder low, the slot, the crane's hook and
   *  the crew above); the slot alone when the banker is far from it → { p, t } | null */
  function wallView(id) {
    const s = nextSlot(id); if (!s) return null;
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
    if (id === 'har') {
      // ── site9 ── the Mount's walls: from the hill's side down into the working bay (harBay) — the builder at his banker and
      // the stock in the lower half, the crane on the laid course and the next slot at the face in the upper half; the
      // valley and the Mount of Olives behind. (v17 framed the hill's bare top: the course lay 19 amot down a 4-amah trench.)
      const w = workSpot('har', 'dress'), b = w && w.stone ? w.stone : null;
      const bx = b ? b.x : s.face[0] - s.n[0] * 12, bz = b ? b.z : s.face[2] - s.n[1] * 12, by = b ? b.y : groundAt(bx, bz) + 1.5;
      const tx = bx * 0.7 + s.face[0] * 0.3, tz = bz * 0.7 + s.face[2] * 0.3, ty = Math.max(by, s.y) + 1;   // (DESIGN9 16:22: nearer the banker)
      const d = portrait ? 70 : 56, aIn = Math.atan2(-s.n[1], -s.n[0]) / DEG, e0 = 36;
      const cost = (c, a) => (c ? Math.abs(c.az - a) + 2.2 * (c.el - e0) + (c.blocked ? 500 : 0) : 1e9);
      // ── director13 ── (game-courses-touch part 1: at the first course's stones the next slot lay 19 amot down the trench, hidden
      // by the bay's bank from the frame's pose) the line to the next slot must clear the Mount too, and to him at his banker
      const sAlso = [[s.face[0], s.y + (s.h || 1) / 2 + 0.3, s.face[2]], ...(w && typeof w.x === 'number' ? [[w.x, (w.y || by) + 2.2, w.z]] : [])];
      const ca = clearView(tx, ty, tz, d, aIn + 30, e0, sAlso), cb = clearView(tx, ty, tz, d, aIn - 30, e0, sAlso);
      // ── /director13 ──
      const c = (cost(ca, aIn + 30) <= cost(cb, aIn - 30) + 6 ? ca : cb) || { az: aIn + 30, el: e0, dist: d };
      scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
      return { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], az: c.az, el: c.el, dist: c.dist, blocked: !!c.blocked };
    }
    // ── site9 ── (DESIGN9 15:48, CAM.WALL for the wall) over the builder's shoulder ALONG the face: the slot at the course's
    // height + 1, 45 amot real on a phone, el 24°, from the course's unlaid side turned 25° outward — the builder at his banker
    // low, the slot and the laid stones running away behind, the crane's hook above (v17: ≈ 220 amot, the builder 24 px)
    if (id === 'wall') {
      // ── director13 ── (C4, PRODUCER-S13a d1-37, PRODUCER13 b1-34: "the crane's wheel and jib fill the lower-right quarter and cross the
      // frame") the wall's ground crane stands out from the face toward the course's UNLAID side (craneWorkPose, sg −1) — the side this
      // frame looked from, so it stood between the camera and him. The frame now looks from the LAID side, turned 25° outward: his
      // banker and he low in front of the course he laid, the slot, the crane behind it, its hook over the slot.
      const [ux, uz] = slotTangent(id, s), a = Math.atan2(uz, ux), o = Math.atan2(s.n[1], s.n[0]);
      // ── /director13 ──
      const da = Math.atan2(Math.sin(o - a), Math.cos(o - a)), az = (a + Math.sign(da || 1) * 25 * DEG) / DEG, el = 24;
      // ── site11 ── (the higher courses: he dresses on the ground at the slot's foot — his banker is drawn on the ground — and the
      // slot climbs to 40 amot: the frame rises with the course only as far as keeps him in it, and steps back a little)
      const w = workSpot(id, 'dress'), gy = w ? groundAt(w.x, w.z) + 2 : s.y, dy = Math.max(0, s.y + 1 - gy);
      const tx = s.face[0], tz = s.face[2], ty = dy > 8 ? gy + Math.min(dy, 26) * 0.55 : s.y + 1, d = (portrait ? 60 : 60 / 1.35) * (1 + clamp(dy - 14, 0, 12) * 0.01);   // (DESIGN9 16:22: 45 was too close)
      scPos(tx, ty, tz, d, az, el, scP);
      return { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], az, el, dist: d, blocked: false };
    }
    const w = workSpot(id, 'dress'), k = w && w.stone && Math.hypot(w.stone.x - s.face[0], w.stone.z - s.face[2]) < 46 ? 0.5 : 0;
    // (the Mount's first courses are laid deep in the trench at its edge: frame them at the ground's level, where the builder,
    //  his banker, the crane and the stock stand, not 40 amot down in the cut)
    const sy = id === 'har' ? Math.max(s.y, groundAt(s.face[0] - s.n[0] * 14, s.face[2] - s.n[1] * 14) - 1) : s.y;
    const tx = lerp(s.face[0], k ? w.stone.x : 0, k), tz = lerp(s.face[2], k ? w.stone.z : 0, k), ty = lerp(sy, k ? w.stone.y : 0, k) + 1;
    // (the Mount's walls retain the hill: its lower courses are seen from the hill's side, where the builder works; both sides
    //  are tried, the cheaper clear one wins)
    const d = portrait ? 64 : 50, azO = Math.atan2(s.n[1], s.n[0]) / DEG + 35, azI = azO + 180 - 70, e0 = id === 'har' ? 26 : 20;
    const cost = (c, a) => (c ? Math.abs(c.az - a) + 2.2 * (c.el - e0) + (c.blocked ? 500 : 0) : 1e9);
    const co = clearView(tx, ty, tz, d, azO, e0), ci = clearView(tx, ty, tz, d, azI, e0);
    const c = (id === 'har' ? (cost(ci, azI) <= cost(co, azO) + 10 ? ci : co) : (cost(co, azO) <= cost(ci, azI) + 10 ? co : ci)) || { az: azO, el: e0, dist: d };
    scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
    return { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], az: c.az, el: c.el, dist: c.dist, blocked: !!c.blocked };
  }
  /** ── flow10 ── (BRIEF10; the owner, 28.9 21:42: "בשלב שיטוח ההר נדבך 5 השחקן נעלם") the course check (בדיקת הנדבכים, the
   *  plumb) at the Mount: where the builder stands — at the course's next slot on the bay's side, 2 amot behind its stone, facing
   *  the face — and a close frame of him with his plumb, over his shoulder from the hill's side (a clear line of sight), panned so
   *  that he stands in the screen's upper half: the plumb game's sheet covers the lower 45 %. The check's own frontView looks from
   *  outside the face, where the Mount's courses lie 15 amot under the outer bank.
   *  → { spot: { x, y, z, face: [x, z] }, target: { x, y, z } (the plumb's mark on the face), p, t, dist } | null */
  function checkView(id = 'har', ndcY = 0.3) {
    const st = ST[id]; if (!st || st.status !== 'building' || st.disp < FOUND) return null;
    const s = nextSlot(id); if (!s) return null;
    // (1.6 amot behind the stone's back, 9 along the face away from the crane at the slot — by touch, 4.5 left him behind its
    //  treadwheel — and the camera from that side, so the crane stands behind him, never between)
    const nx = s.n[0], nz = s.n[1], back = s.d + 1.6;
    let [ux, uz] = slotTangent(id, s);
    if (crane.st === st && (s.face[0] - crane.bx) * ux + (s.face[2] - crane.bz) * uz < -2) { ux = -ux; uz = -uz; }
    const x = s.face[0] - nx * back + ux * 9, z = s.face[2] - nz * back + uz * 9, y = groundAt(x, z);
    const target = { x: x + nx * 1.5, y: y + 1.3, z: z + nz * 1.5 };   // (the plumb's mark: on the course's back, at his chest)
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
    const tx = x, ty = y + 1.5, tz = z, d = portrait ? 36 : 28, e0 = 24, aIn = Math.atan2(-nz, -nx) / DEG;   // (by touch, 30 filled the frame with him: the course too)
    const side = (a) => (Math.cos(a * DEG) * ux + Math.sin(a * DEG) * uz > 0 ? 0 : 300);   // (the camera on his side, away from the crane)
    const cost = (c, a) => (c ? Math.abs(c.az - a) + 2.2 * (c.el - e0) + (c.blocked ? 500 : 0) + side(c.az) : 1e9);
    const ca = clearView(tx, ty, tz, d, aIn + 40, e0), cb = clearView(tx, ty, tz, d, aIn - 40, e0);
    const c = (cost(ca, aIn + 40) <= cost(cb, aIn - 40) ? ca : cb) || { az: aIn + 40, el: e0, dist: d };
    scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
    const p = new THREE.Vector3(scP[0], scP[1], scP[2]), t = new THREE.Vector3(tx, ty, tz);
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * c.dist;
    const fwd = tmpV.copy(t).sub(p).normalize(), right = tmpV2.crossVectors(fwd, UP).normalize(), up = tmpS.crossVectors(right, fwd).normalize();
    const pan = up.multiplyScalar(-ndcY * halfH); p.add(pan); t.add(pan);
    return { spot: { x, y, z, face: [s.face[0], s.face[2]] }, target, p: p.toArray(), t: t.toArray(), dist: c.dist };
  }
  /** ── site11 ── the working frame of a site other than the Mount, by its phase (STAGING §3, §5–§8): the survey — CAM.SURVEY at
   *  the builder's survey stake (45 amot real, el 28°); the dig — CAM.TRENCH at the trench's end where he digs (55, el 34°); the
   *  courses — CAM.WALL-A: the midpoint of his banker and the next slot (58, el 24°; the wall keeps its own over-the-shoulder
   *  wallView). Always from the site's own side (def.view.az: chosen so no other building hides it — the altar's −60 passes
   *  north of Nikanor). The finish and the key moments keep the site's frame. → { p, t, dist, az, el } | null */
  // ── site11 ── (PRODUCER11 s1-22: a working frame at the Ezrat Nashim sat behind the courts' north wall, the kohen hidden) a
  // working frame's line of sight against the courts' buildings: the courts' walls as four slabs (with the east gate's gap), every
  // other built site's footprint as a box up to its built height (the lattice and the laver are too low to matter)
  // ── site12 ── (site_clear.cjs: at the chambers' dig the camera stood 1 amah from the Nikanor wall, which the slabs lacked) the
  // wall stage's own pieces (temple.js), each with its height: west, north and south of the azara, the Nikanor wall, the Ezrat
  // Nashim's north and south, the low eastern wall (Middot 2:4)
  const WALL_SLABS = [[-193, -73.5, -187, 73.5, 44], [-187, -73.5, 0, -67.5, 44], [-187, 67.5, 0, 73.5, 44], [0, -73.5, 6, -14, 44], [0, 14, 6, 73.5, 44],
    [6, -73.5, 141, -67.5, 40], [6, 67.5, 141, 73.5, 40], [141, -73.5, 147, -13, 22], [141, 13, 147, 73.5, 22]];
  // ── site12 ── (N55) the drawn courses of a site, mesh by mesh, up to its built height: a chamber's own walls round him, the altar's
  // tiers under the course he sets — what the footprint's box cannot tell (a box holding the line's end is skipped)
  const fbRay = new THREE.Raycaster(), fbHits = [], fbA = new THREE.Vector3(), fbD = new THREE.Vector3();
  function meshBlocked(st, px, py, pz, tx, ty, tz) {
    fbA.set(px, py, pz); fbD.set(tx - px, ty - py, tz - pz); const L = fbD.length(); if (L < 2) return false;
    fbRay.set(fbA, fbD.multiplyScalar(1 / L)); fbRay.near = 0; fbRay.far = L - 1.2;
    const top = st.status === 'done' ? 1e9 : revealY(st) + 0.05;
    for (const m of st.meshes) {
      if (m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position) continue;
      fbHits.length = 0; m.raycast(fbRay, fbHits);
      for (const h of fbHits) if (h.point.y <= top) return true;
    }
    return false;
  }
  function segBox(px, py, pz, qx, qy, qz, x0, y0, z0, x1, y1, z1) {
    let t0 = 0, t1 = 1;
    for (const [p, q, a, b] of [[px, qx, x0, x1], [py, qy, y0, y1], [pz, qz, z0, z1]]) {
      const d = q - p;
      if (Math.abs(d) < 1e-9) { if (p < a || p > b) return false; continue; }
      let ta = (a - p) / d, tb = (b - p) / d; if (ta > tb) { const t = ta; ta = tb; tb = t; }
      t0 = Math.max(t0, ta); t1 = Math.min(t1, tb); if (t0 > t1) return false;
    }
    return t1 > 0.02 && t0 < 0.97;   // (not the target's own face)
  }
  function frameBlocked(px, py, pz, tx, ty, tz, id, boxes) {
    if (py < groundAt(px, pz) + 3) return true;
    if (boxes) for (const B of boxes) {
      // ── director13 ── (C8, PRODUCER-S13a r1-10/11: at the altar's courses every pose was "blocked" and the frame fell back to el 54
      // across the altar's top, him hidden behind the sovev) a box that holds the line's end — his banker beside the crane's column
      // or the stock's dressing — cannot judge the line: every ray to him ends inside it. It is skipped, as a footprint holding
      // the target is (below)
      if (Array.isArray(B)) { if (tx > B[0] && tx < B[3] && ty > B[1] && ty < B[4] && tz > B[2] && tz < B[5]) continue; if (segBox(px, py, pz, tx, ty, tz, B[0], B[1], B[2], B[3], B[4], B[5])) return true; continue; }
      // an oriented box on the ground ({ o, r, f, hr, hf, y0, y1 }: the site's dressing props round the stock): the segment in
      // the box's own axes
      const lx = (x, z) => (x - B.o[0]) * B.r[0] + (z - B.o[1]) * B.r[1], lz = (x, z) => (x - B.o[0]) * B.f[0] + (z - B.o[1]) * B.f[1];
      if (Math.abs(lx(tx, tz)) < B.hr && Math.abs(lz(tx, tz)) < B.hf && ty > B.y0 && ty < B.y1) continue;   // ── director13 ── (the same)
      if (segBox(lx(px, pz), py, lz(px, pz), lx(tx, tz), ty, lz(tx, tz), -B.hr, B.y0, -B.hf, B.hr, B.y1, B.hf)) return true;
    }
    for (const st of list) {
      // (the altar's own earlier stages count: by touch the finished sovev hid him at the guf's dig on its far side, s3-27; a target
      //  on the face itself is not blocked — segBox ignores the segment's last 3 %)
      // ── site12 ── (PRODUCER-S11 #1, N55: "the frame through the site's OWN built parts — the lishka's walls, the yesod, the altar")
      // the site's own courses count too, up to their built height; a rect he works inside (the target in it) does not
      if (st.id === 'har' || st.id === 'sorag' || st.id === 'kiyor') continue;
      if (st.status !== 'done' && !(st.status === 'building' && st.disp >= FOUND)) continue;
      const top = st.status === 'done' ? st.top : revealY(st); if (!(top > st.base + 0.5)) continue;
      const rects = st.id === 'wall' ? WALL_SLABS : st.def.foot;
      if (st.id === id) { if (meshBlocked(st, px, py, pz, tx, ty, tz)) return true; continue; }   // (its own courses: exactly)
      let inside = false;
      for (const [x0, z0, x1, z1, h] of rects) {
        // (a box holding the line's end — the slot on top of the altar's lower tiers, a course inside a chamber — is its mesh's
        //  to judge, below; by touch every pose of the guf's courses was "blocked" by the sovev's box and fell back to el 54)
        if (tx > x0 - 0.6 && tx < x1 + 0.6 && tz > z0 - 0.6 && tz < z1 + 0.6) { inside = true; continue; }
        if (segBox(px, py, pz, tx, ty, tz, x0, st.base - 1, z0, x1, h ? Math.min(h, top) : top, z1)) return true;
      }
      // (── site12 ── N74, PRODUCER12 19:47: at the Ezrat Nashim's dig the game's close frame stood behind the court wall's face,
      //  14 amot from the camera — the courts' wall is judged by its drawn mesh too, not only by its pieces' boxes)
      if ((inside || st.id === 'wall') && meshBlocked(st, px, py, pz, tx, ty, tz)) return true;
    }
    return false;
  }
  // the cheapest clear pose round (az, el): a turn of 20° costs about as much as 9° more elevation (as clearView on the Mount)
  // (── site12 ── the old WV_C list, [0, 26] tenth, and the extra turns WV_C2 are one list now: WV_ALL)
  // also: more points that must be seen from it ([x, y, z]: his banker), boxes: more things that may stand in the way (the stock)
  // ── site12 ── (site_clear.cjs: at the altar's guf every one of these was blocked and the frame fell back to el 54, him hidden
  // behind the sovev) more turns round him, and a fallback that keeps HIM in sight: all clear › him and the target › him alone
  // (site_clear.cjs, the chambers' survey: the walls round it rejected the first nine and [0, 26] won — el 54, him 70 px: a steep
  //  frame shrinks him. Turns all the way round at a low elevation come first now; the big rises after them)
  const WV_ALL = [[0, 0], [0, 8], [20, 0], [-20, 0], [0, 16], [20, 8], [-20, 8], [40, 0], [-40, 0], [40, 12], [-40, 12], [60, 8], [-60, 8],
    [90, 8], [-90, 8], [120, 8], [-120, 8], [150, 8], [-150, 8], [180, 8], [0, 26], [60, 20], [-60, 20], [90, 20], [-90, 20], [120, 20],
    [-120, 20], [150, 20], [-150, 20], [180, 20], [0, 36]];
  function clearPose(tx, ty, tz, d, az, el, id, also, boxes) {
    const hasHim = !!(also && also.length), him = hasHim ? also[also.length - 1] : [tx, ty, tz];
    let best = null, bestK = 0;
    for (const [da, de] of WV_ALL) {
      const a = az + da, e = Math.min(64, el + de); scPos(tx, ty, tz, d, a, e, scP);
      const hOk = !frameBlocked(scP[0], scP[1], scP[2], him[0], him[1], him[2], id, boxes); if (!hOk) continue;
      const tOk = hasHim ? !frameBlocked(scP[0], scP[1], scP[2], tx, ty, tz, id, boxes) : true;
      const aOk = tOk && (!hasHim || also.every((q) => q === him || !frameBlocked(scP[0], scP[1], scP[2], q[0], q[1], q[2], id, boxes)));
      if (aOk) return { az: a, el: e };
      const k = tOk ? 2 : 1; if (k > bestK) { bestK = k; best = { az: a, el: e }; }
    }
    if (best) return best;
    // (site_clear.cjs, the guf's courses: the altar on one side, the crane, its stock and the yard on the other — no line at these
    //  heights; from higher up, over the crane's wheel and the stock, the first turn that sees HIM)
    for (const [da, de] of WV_ALL) {
      if (de > 8) continue;
      const a = az + da, e = Math.min(64, el + 30); scPos(tx, ty, tz, d, a, e, scP);
      if (!frameBlocked(scP[0], scP[1], scP[2], him[0], him[1], him[2], id, boxes)) return { az: a, el: e };
    }
    return { az, el: Math.min(64, el + 30) };
  }
  /** ── site11 ── (FLOW11's request, N55) does a built wall, a finished site, the site's stock and its dressing, or the crane stand
   *  between (px, py, pz) and (tx, ty, tz)? — the working frames' own test, for the game's fitted frames → bool */
  // ── site12 ── (site_clear.cjs: at the altar's courses the crane's column — 6.8 amot square, 0.9 of its height — beside his banker
  // closed every line to him with the altar on the other side) the crane as it stands in the way: its treadwheel and base, up to
  // 11 amot; its legs above are two thin timbers
  const craneBox = (cy) => [crane.bx - 3, cy, crane.bz - 3, crane.bx + 3, cy + Math.min(crane.H * 0.9, 11), crane.bz + 3];
  function frameBlockedApi(px, py, pz, tx, ty, tz, id) {
    if (![px, py, pz, tx, ty, tz].every(Number.isFinite)) return false;
    const st = ST[id], boxes = [];
    if (st && st.status === 'building') {
      const pl = st.piles && st.piles[0];
      if (pl && id !== 'har') {
        const gp = groundAt(pl[0], pl[1]), fq = dressFlip(st, pl[0], pl[1], pl[2]), fx = Math.sin(pl[2]), fz = Math.cos(pl[2]), rx = fz, rz = -fx;
        const ob = (a0, a1, b0, b1, h) => ({ o: [pl[0] + rx * (a0 + a1) / 2 + fx * (b0 + b1) / 2, pl[1] + rz * (a0 + a1) / 2 + fz * (b0 + b1) / 2], r: [rx, rz], f: [fx, fz], hr: (a1 - a0) / 2, hf: (b1 - b0) / 2, y0: gp - 1, y1: gp + h });
        boxes.push([pl[0] - 2.6, gp, pl[1] - 2.6, pl[0] + 2.6, gp + 3.2, pl[1] + 2.6], fq > 0 ? ob(-6.4, 8, -8.2, -1, 2.4) : ob(-6.4, 8, 1, 8.2, 2.4), ob(9.6, 24.6, -1.2, 2.4, 2.4));
      }
      if (crane.st === st && crane.g.visible && id !== 'har') { const cy = crane.byFix !== null ? crane.byFix : craneY(st); boxes.push(craneBox(cy)); }
    }
    return frameBlocked(px, py, pz, tx, ty, tz, id, boxes);
  }
  // ── director13 ── (N74, C5, the finish frames OFF in probe df2) the survey's, the dig's and the finish's frames must see HIM — his
  // chest and his head where he stands — not only the work point (clearPose's `also`: the last point is him)
  // (the height he stands at: a 'set' spot at a high course lies on the scaffold — he works on the ground under it)
  const heroAlso = (w) => { const g = groundAt(w.x, w.z), y = Number.isFinite(g) ? Math.min(w.y, g + 2) : w.y; return [[w.x, y + 3.4, w.z], [w.x, y + 2.2, w.z]]; };
  function siteWorkView(id) {
    const st = ST[id]; if (!st || id === 'har' || st.status !== 'building') return null;
    const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8, k = portrait ? 1 : 1 / 1.35;
    let az = (st.def.view || { az: -25 }).az, also = null, boxes = null;
    let tx, ty, tz, d, el;
    if (st.phase === 'survey') {
      const w = workSpot(id, 'survey'); if (!w) return null;
      tx = w.x; tz = w.z; ty = w.y + 1.5; d = 45; el = 28;
      also = heroAlso(w);   // ── director13 ──
    } else if (st.phase === 'dig') {
      const w = workSpot(id, 'set'); if (!w) return null;
      tx = w.x; tz = w.z; ty = w.y + 1; d = 50; el = 34;
      also = heroAlso(w);   // ── director13 ──
    } else if (st.phase === 'courses' || st.phase === 'foundation') {
      if (id === 'wall') return null;   // (wallView)
      const s = nextSlot(id), w = workSpot(id, 'dress'); if (!s) return null;
      const b = w && w.stone ? w.stone : null, near = b && Math.hypot(b.x - s.face[0], b.z - s.face[2]) < 40;
      tx = near ? (b.x + s.face[0]) / 2 : s.face[0]; tz = near ? (b.z + s.face[2]) / 2 : s.face[2];
      // (he works on the ground at the slot's foot: the frame rises with the course only as far as keeps him in it)
      const gy = near ? b.y : s.y, dy = Math.max(0, s.y - gy);
      // ── site12 ── (site_clear.cjs: at the Ulam's courses his feet fell below the phone's safe frame) the frame rises less
      ty = gy + 1 + Math.min(dy, 20) * 0.4;
      d = 52 * (1 + clamp(dy - 14, 0, 12) * 0.01); el = 24;
      // (by touch, 29.9, the gates: from the site's own side the stock stood between the camera and him) over his shoulder
      // along the face, as the wall's frame the owner liked (N50): from the course's unlaid side turned 25° outward — his banker
      // low, the slot and the laid stones running away, the crane's hook above; the stock and the built courts kept out of the way
      const [ux, uz] = slotTangent(id, s), a0 = Math.atan2(-uz, -ux), o = Math.atan2(s.n[1], s.n[0]), da = Math.atan2(Math.sin(o - a0), Math.cos(o - a0));
      az = (a0 + Math.sign(da || 1) * 25 * DEG) / DEG;
      if (b) also = [[b.x, b.y + 1.2, b.z], [w.x, w.y + 1.9, w.z]];   // (his banker, and him where he stands at it)
      const pl = st.piles && st.piles[0];
      if (pl) {
        // the stock, and the site's dressing round it (siteDressing: the timber stack, coils, jars and the tool rack behind it, the
        // yard's bankers beside it — by touch at the gates the timber stack stood before him in the frame over his shoulder)
        const gp = groundAt(pl[0], pl[1]), fq = dressFlip(st, pl[0], pl[1], pl[2]), fx = Math.sin(pl[2]), fz = Math.cos(pl[2]), rx = fz, rz = -fx;
        const ob = (a0, a1, b0, b1, h) => ({ o: [pl[0] + rx * (a0 + a1) / 2 + fx * (b0 + b1) / 2, pl[1] + rz * (a0 + a1) / 2 + fz * (b0 + b1) / 2], r: [rx, rz], f: [fx, fz], hr: (a1 - a0) / 2, hf: (b1 - b0) / 2, y0: gp - 1, y1: gp + h });
        boxes = [[pl[0] - 2.6, gp, pl[1] - 2.6, pl[0] + 2.6, gp + 3.2, pl[1] + 2.6], fq > 0 ? ob(-6.4, 8, -8.2, -1, 2.4) : ob(-6.4, 8, 1, 8.2, 2.4), ob(9.6, 24.6, -1.2, 2.4, 2.4)];
      }
    } else if (st.phase === 'finish') {
      // (CAM.PAVE / CAM.TOP: the finish — the coping, the beams, the doors, the plaster — at his finish spot by the face, the
      //  face rising behind him; the key moments keep the whole site)
      const w = workSpot(id, 'set'); if (!w) return null;
      tx = w.x; tz = w.z; ty = w.y + 4; d = 56; el = 34;
      also = heroAlso(w);   // ── director13 ──
    } else return null;
    // ── director13 ── (N74/C5, PRODUCER13 m2-24/25: at the Ezrat Nashim's dig the frame looked over the court's east wall, its cornice
    // filling the frame and only his turban above it) a work point inside the women's court is seen from inside the court: the
    // bearing toward the court's middle first (its walls then stand behind him, not between)
    if (id === 'nashim' && st.phase !== 'courses' && st.phase !== 'foundation' && tx > 8 && tx < 139 && Math.abs(tz) < 66) az = Math.atan2(0 - tz, 73.5 - tx) / DEG;
    // ── /director13 ──
    // (the treadwheel crane standing at the site — at its yard in the survey and the dig: by touch, the Ulam's dig framed through
    //  its legs, PRODUCER11 s4-10 — a column round its base up to its height)
    if (crane.st === st && crane.g.visible) { const cy = crane.byFix !== null ? crane.byFix : craneY(st); (boxes || (boxes = [])).push(craneBox(cy)); }
    const c = clearPose(tx, ty, tz, d * k, az, el, id, also, boxes);   // ── site11 ── (never behind a wall, the stock or the crane)
    scPos(tx, ty, tz, d * k, c.az, c.el, scP);
    return { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz], dist: d * k, az: c.az, el: c.el };
  }
  /** ── flow10 ── fly the camera to { p, t } (the game's own frames of the Mount's courses: the check, the corner stone's landing) */
  function flyTo(p, t, ms = 1200) {
    if (typeof ctx.flyToPos !== 'function' || !Array.isArray(p) || !Array.isArray(t)) return false;
    orbitStop(false); ctx.flyToPos(tmpV3a.set(p[0], p[1], p[2]), tmpV3b.set(t[0], t[1], t[2]), ms); return true;
  }
  /** the rock the builder works (or will: the standing one nearest him) */
  function heroRock() {
    let bi = -1, bd = 1e9;
    for (let i = 0; i < bSt.length; i++) { const b = bSt[i]; if (b.state <= 0) continue; const d = Math.hypot(b.x - hero.x, b.z - hero.z) - (b.state === 1 ? 20 : 0); if (d < bd) { bd = d; bi = i; } }
    // ── site9 ── (the boulder field) the rock he stands at or a cracked one; else the next along the field's path, not the nearest
    if (bi >= 0 && (bSt[bi].state === 1 || bd < bSt[bi].r + 6)) return bi;
    for (const i of BORDER) if (bSt[i].state > 0) return i;
    return bi;
  }
  /** ── site9 ── the boulder field for the game: 12 × [x, z, r] in G.bh's index order, `.order` = the strike order (a fresh copy) */
  function boulderSpots() {
    const a = BOULDERS.map((b) => b.slice());
    a.order = BORDER.slice();
    return a;
  }
  /* the Mount's working patch (site8, DESIGN8B P0-3/P0-4): each split rock leaves a levelled patch of fresh-cut rock that the
     gangs widen over ~40 s (the hill's uPatch; the ground where people stand follows it), its rubble carted off in ~30 s to a
     spoil heap beside the patch; the gangs move to the rocks nearest the builder */
  let slRock = -2, slT = 0;
  // the survey (DESIGN8B M2): every stroke of the builder while the Mount is surveyed drives one more peg of the line he measures —
  // from where he stands toward the east face, 6 amot apart, the cord running on to the newest peg, a chalk line along it
  const survey = { n: 0, x: 0, z: 0, ux: 1, uz: 0, on: false };
  heroApi.onImpact(() => {
    const hs = ST.har;
    if (hs.status !== 'building' || hs.phase !== 'survey') return;
    if (!survey.on) { survey.on = true; survey.n = 0; survey.x = hero.x; survey.z = hero.z; const dx = X1 - 8 - hero.x, dz = 36 - hero.z, L = Math.hypot(dx, dz) || 1; survey.ux = dx / L; survey.uz = dz / L; }
    survey.n = Math.min(12, survey.n + 1); propsDirty = true;
  });
  // ── site11 ── (PRODUCER11 N40: "the Mount's finish — nothing in frame shows paving, the kohen behind the platform's wall") the
  // plaza's paving laid where he works: a patch west of the east portico, strip by strip from the east inward — two strips at
  // each of his strokes (counted here, as the survey's pegs), the whole patch once the step is done (finish 1)
  // (west of Solomon's portico, x 236…277 in mount.js: by touch the first patch lay under its roof, the camera among its columns)
  const PAVE = { x0: 190, x1: 228, z0: 12, z1: 56, NS: 8 };
  const pave = { k: 0 };   // (── site15 ── PAVE.pat: her chosen pattern, taskScene's o.choice)
  heroApi.onImpact(() => { const hs = ST.har; if (hs.status === 'building' && hs.phase === 'finish' && pave.k < PAVE.NS) { pave.k = Math.min(PAVE.NS, pave.k + 2); propsDirty = true; } });
  function paveN() {
    const hs = ST.har; if (hs.status !== 'building' || hs.phase !== 'finish') return -1;
    return (hs.finish || 0) >= 0.999 ? PAVE.NS : Math.max(pave.k, Math.round((hs.finish || 0) * PAVE.NS));
  }
  function paveFront() { const n = Math.max(0, paveN()), W = (PAVE.x1 - PAVE.x0) / PAVE.NS; return PAVE.x1 - n * W; }
  function paveProps(put) {
    const n = paveN(); if (n < 0) { pave.k = 0; return; }
    const W = (PAVE.x1 - PAVE.x0) / PAVE.NS, cz = (PAVE.z0 + PAVE.z1) / 2;
    let y = -1e9; for (const [x, z] of [[PAVE.x0, PAVE.z0], [PAVE.x1, PAVE.z0], [PAVE.x0, PAVE.z1], [PAVE.x1, PAVE.z1], [(PAVE.x0 + PAVE.x1) / 2, cz]]) y = Math.max(y, groundAt(x, z));
    // the bed: levelled sand where the paving goes, a chalk line at the front
    put((PAVE.x0 + PAVE.x1) / 2, y + 0.03, cz, PAVE.x1 - PAVE.x0 + 1, 0.06, PAVE.z1 - PAVE.z0 + 1, 0, '#DCCFAE');
    const fx = PAVE.x1 - n * W;
    if (n < PAVE.NS) put(fx - 0.2, y + 0.08, cz, 0.18, 0.05, PAVE.z1 - PAVE.z0, 0, '#F2ECDD');
    // the pavers: two columns a strip, rows of 2.2 amot, tone by tone
    const rows = Math.floor((PAVE.z1 - PAVE.z0) / 2.2);
    for (let k = 0; k < n; k++) for (let c = 0; c < 2; c++) for (let r = 0; r < rows; r++) {
      const x = PAVE.x1 - k * W - (c + 0.5) * W / 2, z = PAVE.z0 + (r + 0.5) * 2.2 + (c ? 0.55 : 0) * ((k + r) % 2 ? 1 : -1) * 0;
      // ── site15 ── her choice of pattern (STORY15 har.pave, המחשה: the Sifting Project's tiles): diamonds (a checker of two tones),
      // stars (a dark tile among light ones), triangles (three tones running); none chosen: the tones as before
      const P = PAVE.pat, i2 = k * 2 + c, tone = P === 'diamonds' ? ((i2 + r) % 2 ? '#C9B892' : '#EDE4CF') : P === 'stars' ? ((i2 + 2 * r) % 3 === 0 ? '#B89C6E' : '#EAE0C8') : P === 'triangles' ? ['#E8DDC6', '#CDBB95', '#F0E8D6'][(i2 + 2 * r) % 3] : ['#E8DDC6', '#E1D5BC', '#EDE4CF', '#DDD0B5'][(k * 7 + c * 3 + r) % 4];
      put(x, y + 0.16, z, W / 2 - 0.12, 0.26, 2.08, 0, tone);
    }
    // the slabs waiting at the front, stacked (fewer as the patch grows)
    if (n < PAVE.NS) for (let j = 0; j < Math.max(2, 8 - n); j++) put(fx - 3.4, y + 0.2 + j * 0.28, PAVE.z0 + 4 + (j % 2) * 0.1, W / 2 - 0.2, 0.26, 2.0, 0.05 * (j % 3), '#E4D8BF');
  }
  // ── site11 ── (PRODUCER11 N52: "the finish — nothing in frame shows the beams going in") every other site's finish, where he
  // works: the step's items made at his finish spot — cedar beams, coping stones, gold or bronze plates, the kevesh's whole
  // stones, lime buckets, the red cord — one more on the stack at each of his strokes (counted here, 4 a step), the whole stack
  // once the step is paid off. The steps' materials mirror content.js PROJ's `fin` (the world's own picture of them).
  const FIN_KIND = { wall: ['stone', 'cedar'], gates: ['cedar', 'gold'], nashim: ['cedar', 'cedar'], sorag: ['stone'], nikanor: ['bronze', 'bronze', 'stone'],
    lishka: ['cedar', 'cedar'], sovev: ['red'], guf: ['wstone'], karnot: ['lime'], kiyor: ['bronze'], ulam: ['cedar', 'cedar', 'gold', 'gold'],
    heichal: ['cedar', 'cedar', 'cedar', 'gold', 'gold', 'gold'], kodesh: ['cedar', 'gold', 'gold'] };
  const fin = { id: null, step: -1, k: 0 };
  const finStep = (st) => { const K = FIN_KIND[st.id]; return K ? Math.min(K.length - 1, Math.floor((st.finish || 0) * K.length + 1e-6)) : -1; };
  heroApi.onImpact(() => {
    for (const st of list) {
      if (st.id === 'har' || st.status !== 'building' || st.phase !== 'finish' || !FIN_KIND[st.id] || (st.finish || 0) >= 0.999) continue;
      const sp = workSpot(st.id, 'set'); if (!sp || Math.hypot(hero.x - sp.x, hero.z - sp.z) > 24) continue;
      const k = finStep(st);
      if (fin.id !== st.id || fin.step !== k) { fin.id = st.id; fin.step = k; fin.k = 0; }
      fin.k = Math.min(4, fin.k + 1); propsDirty = true; return;
    }
  });
  function finishProps(put, putF, putR) {
    for (const st of list) {
      if (st.id === 'har' || st.status !== 'building' || st.phase !== 'finish' || !FIN_KIND[st.id]) continue;
      const sp = workSpot(st.id, 'set'); if (!sp) continue;
      const all = (st.finish || 0) >= 0.999, step = finStep(st), kind = FIN_KIND[st.id][Math.max(0, step)];
      const n = all ? 4 : fin.id === st.id && fin.step === step ? fin.k : 0;
      // beside him, on his right as he faces the work: the stack's own place, along the face
      const fx = sp.face[0] - sp.x, fz = sp.face[1] - sp.z, L = Math.hypot(fx, fz) || 1, ax = fz / L, az = -fx / L, bx = fx / L, bz = fz / L;
      const cx = sp.x + ax * 3.4 - bx * 0.6, cz = sp.z + az * 3.4 - bz * 0.6, y = groundAt(cx, cz), yaw = Math.atan2(ax, az);
      const P = (u, h, v, sx, sy, sz, hex, rot) => put(cx + ax * u + bx * v, y + h, cz + az * u + bz * v, sx, sy, sz, yaw, hex, rot || 0);
      if (kind === 'cedar') {   // two trestles, the squared beams stacked on them
        for (const u of [-1.8, 1.8]) P(u, 0.45, 0, 0.3, 0.9, 1.4, '#6E5236');
        for (let i = 0; i < n; i++) P(0, 1.2 + Math.floor(i / 2) * 0.58, (i % 2 ? 0.34 : -0.34), 5.4, 0.55, 0.55, i % 2 ? '#8B5A3C' : '#94623F');
      } else if (kind === 'gold' || kind === 'bronze') {   // a low table, the plates laid on it, catching the light
        P(0, 0.75, 0, 2.2, 0.12, 1.4, '#7A5C3C'); for (const [u, v] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) P(u, 0.36, v, 0.12, 0.72, 0.12, '#6E5236');
        for (let i = 0; i < n; i++) P(-0.55 + (i % 2) * 1.1, 0.84 + Math.floor(i / 2) * 0.05, (Math.floor(i / 2) ? 0.25 : -0.25), 0.95, 0.05, 0.62, kind === 'gold' ? '#EAC54F' : '#B87333');
      } else if (kind === 'lime') {   // buckets of lime, a float on each (the whitewash, without iron)
        for (let i = 0; i < n; i++) { putF(cx + ax * (i - 1.5) * 0.9, y + 0.35, cz + az * (i - 1.5) * 0.9, 0.62, 0.7, 0.62, 0, '#F2EFE6'); }
      } else if (kind === 'red') {   // coils of the red cord
        for (let i = 0; i < n; i++) putF(cx + ax * (i - 1.5) * 0.8, y + 0.18, cz + az * (i - 1.5) * 0.8, 0.55, 0.2, 0.55, i, '#B8352A');
      } else if (kind === 'wstone') {   // the kevesh's whole field stones
        for (let i = 0; i < n; i++) putR(cx + ax * (i % 2 ? 0.7 : -0.7), y + 0.5 + Math.floor(i / 2) * 0.8, cz + az * (i % 2 ? 0.7 : -0.7) + bz * 0.2, 1.1, 0.8, 0.9, i * 0.9, '#D9CFBA', 1, 0.2);
      } else {   // coping stones / steps: pale dressed blocks on a pallet
        P(0, 0.08, 0, 2.4, 0.16, 1.6, '#7A5C3C');
        for (let i = 0; i < n; i++) P((i % 2 ? 0.55 : -0.55), 0.5 + Math.floor(i / 2) * 0.72, 0, 1.0, 0.7, 1.4, '#E6DCC6');
      }
    }
  }
  // ── site13 ── (the owner, 30.9 11:12: "לוודא שבכל שלבי הבנייה נראית ההתקדמות של הבניה"; PRODUCER-S13a #6: the Ulam's finish
  // 0 %, the Heichal's 0 %, the Ezrat Nashim's 2.1 %) the finish shows ON the building, step by step: each finish-only material
  // has its own cut (J.z; J.w 1 = a height, 2 = laid along +x), moved from `from` to `to` through its step by his strokes there
  // (fin.k of 4) and whole once the step is paid off; eased, so a step the crews finish at once still rises in view.
  // [step, from, to, mode]: the Ulam's five oak lintels one above the other (מדות ג, ז), the cedar poles over the Heichal's door
  // (מדות ג, ח), the gold inside the hall with the golden vine, then the façade's gold band, cornice, coping and spikes; the
  // Heichal's and the Kodesh's gold bands, copings and the כלה עורב spikes (מדות ד, ו) in their gold steps; the Ezrat Nashim's
  // cedar gallery laid from west to east (מדות ב, ה).
  const FINCUT = {
    nashim: { cedar: [[0, 45.5, 101.6, 2]] },
    ulam: { oak: [[0, 61.8, 72.6, 1]], cedar: [[1, 21.9, 47.2, 1]], gold: [[2, 21.9, 95.4, 1], [3, 95.4, 116.8, 1]] },
    heichal: { cedar: [[2, 21.9, 42.1, 1]], gold: [[3, 21.9, 111, 1], [4, 111, 115.5, 1], [5, 115.5, 116.8, 1]] },
    kodesh: { gold: [[1, 21.9, 111, 1], [2, 111, 116.8, 1]] },
    gates: { gold: [[1, 6, 50, 1]] },   // ── site14 ── (the gates' gold leaves: her "שפשף עד שיבריק", then the finish's gold step)
    har: { archStone: [[0, -60.5, 2.2, 1]] },   // ── site14 ── (Robinson's Arch: only her arch jobs raise it; whole once the Mount is done)
  };
  const finCut = {};   // `${id}|${k}` → the eased cut
  function stepFrac(st, step) {   // how far the finish's step `step` has come: 0 before it, 1 once paid off
    const K = FIN_KIND[st.id], F = K ? K.length : 1, f = st.finish || 0;
    if (st.phase !== 'finish') return 0;
    if (f >= (step + 1) / F - 1e-6) return 1;
    if (finStep(st) !== step) return 0;
    return fin.id === st.id && fin.step === step ? fin.k / 4 : 0;
  }
  function finishCuts(dt) {
    for (const id of Object.keys(FINCUT)) {
      const st = ST[id]; if (!st) continue;
      const building = st.status === 'building';
      for (const k of Object.keys(FINCUT[id])) {
        const J = JU[id + '|' + k]; if (!J) continue;
        const rows = FINCUT[id][k], key = id + '|' + k;
        let want;
        if (!building) want = 1e6;
        else {
          want = rows[0][1];
          for (const [s, a, b] of rows) { const u = stepFrac(st, s); if (u > 0) want = a + (b - a) * u; }
          if (st.phase !== 'finish') want = rows[0][1] - 5;
          if (k === 'gold' && JOBS.goldH[id] !== undefined) want = Math.max(want, Math.min(revealY(st), JOBS.goldH[id]));   // ── site14 ── (her gold, on the courses built)
          if (k === 'archStone') { JOBS.archY = Math.min(JOBS.archT, JOBS.archY + dt * 9); want = JOBS.archY >= 2.1 ? 1e6 : -60.5 + Math.floor((JOBS.archY + 60.5) / 2.6) * 2.6; finCut[key] = want; }   // ── site14 ── (her arch: a course of its stones at a time, 2.6 amot, ≈ 3.4 a second)
        }
        let v = finCut[key]; if (v === undefined || !building || Math.abs(want - v) > 400) v = want;
        else v += (want - v) * (1 - Math.exp(-dt * 2.2));
        finCut[key] = v;
        J.J.value.z = v >= rows[rows.length - 1][2] - 0.05 ? 1e6 : v; J.J.value.w = building ? rows[0][3] : 0;
      }
    }
    // the Heichal's cedar doors stand in the doorway only while it is built (then sanctuary.js's gold doors hang there)
    { const h = ST.heichal; if (h) for (const m of h.meshes) if (m.name === 'cedar') m.visible = h.status === 'building'; }
    // the Ulam's golden vine hangs over the Heichal's door from its step on (גפן הזהב), not only once the Ulam is done
    { const u = ST.ulam, e = !!(u && u.status === 'building' && u.phase === 'finish' && stepFrac(u, 2) > 0); if (e !== vs.early) { vs.early = e; vineSync(false); } }
    // the Ezrat Nashim's four corner chambers, one at a time: at each of his strokes of "לשכות הפינות" one rises (the next,
    // where he now stands — workSpot), all four once the step is paid off; each named as it rises (finishLabel)
    const sn = ST.nashim, lc = sn && sn.lc;
    if (lc) {
      const on = sn.status === 'building';
      let tg = 0;
      if (sn.status === 'done') tg = NASHIM_LC.length;
      else if (on && sn.phase === 'finish') tg = stepFrac(sn, 1) * NASHIM_LC.length;
      if (!on) lc.shown = tg;
      else if (lc.shown < tg) lc.shown = Math.min(tg, lc.shown + dt / 2.6);
      else lc.shown = tg;
      const i0 = Math.max(0, Math.ceil(lc.shown - 1e-6) - 1);   // (the chamber rising now, or the one just risen)
      if (!on || sn.phase !== 'finish') lc.lastLab = -1;
      else if (lc.shown > 0 && i0 !== lc.lastLab) { lc.lastLab = i0; lc.label = i0; lc.labelT = 0; }
      if (lc.label >= 0) { lc.labelT += dt; if (lc.labelT > 8 || !on || sn.phase !== 'finish') lc.label = -1; }
      NASHIM_LC.forEach((c, i) => { const u = clamp(lc.shown - i, 0, 1); lc.U.uRK.value[i].x = !on || u >= 1 ? 1e6 : u <= 0 ? 5 : lerp(5.9, 20.7, easeIO(u)); });
      for (const m of lc.meshes) m.castShadow = !on;
    }
  }
  /** ── site13 ── the name of the Ezrat Nashim's chamber rising now (for a label on screen): { text, sub, src, x, y, z, t } | null */
  function finishLabel() {
    const sn = ST.nashim, lc = sn && sn.lc; if (!lc || lc.label < 0) return null;
    const c = NASHIM_LC[lc.label], r = c.r;
    return { text: c.n, sub: c.d, src: 'מדות ב, ה · טיוטה', x: (r[0] + r[2]) / 2, y: 26, z: (r[1] + r[3]) / 2, t: lc.labelT, i: lc.label };
  }
  // the building site's cart lane for crews.js's train of ox carts from the quarry (crews.js siteTrain): the lane runs beside
  // the site in open ground (never through a built footprint or a court's wall), a → b, the loads coming off at `stop`; at the
  // altar the carts bring whole field stones (מדות ג, ד). { id, a, b, stop, cargo } | null (no walled site or altar at work)
  const CART_LANE = {
    // (b ≥ 22 amot short of any wall: the first cart drives on past b while the last one reaches it)
    wall: [[-40, -112], [165, -112], 0.62], sorag: [[187, -88], [187, 88], 0.5], gates: [[180, -80], [180, 72], 0.5],
    nashim: [[52, -42], [52, 40], 0.4], nikanor: [[58, -42], [58, 40], 0.5], lishka: [[-10, -46], [-10, 44], 0.35],
    yesod: [[-10, -46], [-10, 44], 0.4], kiyor: [[-12, 44], [-12, -44], 0.42],
    ulam: [[-14, 44], [-14, -44], 0.45], heichal: [[-58, -61], [-118, -61], 0.5], kodesh: [[-96, -52], [-160, -52], 0.52],
  };
  for (const id of ['sovev', 'guf', 'karnot']) CART_LANE[id] = CART_LANE.yesod;
  function cartLane() {
    let best = null;
    for (const st of list) if (st.status === 'building' && CART_LANE[st.id] && (!best || st.seq > best.seq)) best = st;
    if (!best) return null;
    const L = CART_LANE[best.id];
    return { id: best.id, a: L[0], b: L[1], stop: L[2], cargo: FIELD.has(best.id) ? 'fieldstone' : 'stone' };
  }
  // ── /site13 ──
  // ── site11 ── the survey at every other site, as he strikes: his strokes there counted (the Mount's survey has its own pegs)
  const siteSv = { id: null, n: 0 };
  heroApi.onImpact(() => {
    for (const st of list) {
      if (st.id === 'har' || st.status !== 'building' || st.phase !== 'survey') continue;
      const sp = workSpot(st.id, 'survey'); if (!sp || Math.hypot(hero.x - sp.x, hero.z - sp.z) > 30) continue;
      if (siteSv.id !== st.id) { siteSv.id = st.id; siteSv.n = 0; }
      siteSv.n = Math.min(3, siteSv.n + 1); propsDirty = true; return;
    }
  });
  function surveyShown(st) { return siteSv.id === st.id ? Math.min(1, 0.25 + 0.25 * siteSv.n) : 0.25; }
  // the footprint's rects, the one nearest his survey stake first
  function surveyOrder(st) {
    const sp = workSpot(st.id, 'survey'); if (!sp) return st.def.foot;
    const d = (f) => Math.hypot(Math.max(f[0] - sp.x, 0, sp.x - f[2]), Math.max(f[1] - sp.z, 0, sp.z - f[3]));
    return st.def.foot.slice().sort((a, b) => d(a) - d(b));
  }
  function surveyProps(put) {
    if (!survey.on || !survey.n) return;
    let px = 0, py = 0, pz = 0;
    for (let k = 0; k <= survey.n; k++) {
      const t = 5 + k * 6, x = survey.x + survey.ux * t - survey.uz * 2, z = survey.z + survey.uz * t + survey.ux * 2, y = groundAt(x, z);
      put(x, y + 0.8, z, 0.2, 1.8, 0.2, 0, '#6B4E31');
      if (k === survey.n) put(x, y + 2.0, z, 0.05, 0.7, 1.0, 0.6, '#B8352A');
      if (k) {
        const L = Math.hypot(x - px, z - pz, y - py), yaw = Math.atan2(x - px, z - pz), tilt = -Math.atan2(y - py, Math.hypot(x - px, z - pz));
        put((x + px) / 2, (y + py) / 2 + 1.3, (z + pz) / 2, 0.06, 0.06, L, yaw, '#EDE3C8', tilt);
        put((x + px) / 2, (y + py) / 2 + 0.07, (z + pz) / 2, 0.3, 0.04, L, yaw, '#F2ECDD', tilt);   // the chalk line
      }
      px = x; py = y; pz = z;
    }
  }
  function siteLife(dt) {
    const hs = ST.har, rough = hs.status === 'building' && hs.disp < FOUND;
    let n = 0, moved = false, rubAny = false;
    for (let i = 0; i < bSt.length; i++) {
      const b = bSt[i], P = hill.U.uPatch.value[i];
      if (!rough || b.pt < 0 || b.state > 0) { if (P.z !== 0) { P.z = 0; moved = true; } continue; }
      if (b.pt < 90) b.pt += dt;
      const half = b.r * (1.05 + 0.85 * smooth(0.8, 40, b.pt));
      if (Math.abs(P.z - half) > 0.08 || P.x !== b.x || P.y !== b.z) { P.set(b.x, b.z, half, b.lv); moved = true; }
      if (!(Math.abs((b.pz || 0) - half) < 1)) { b.pz = half; propsDirty = true; }   // (the stakes follow the patch as it widens)
      n++;
      const rub = b.anim === 'shatter' ? 1 : Math.max(0, 1 - Math.max(0, b.pt - 1.2) / 30);
      if (rub !== b.rub) { const was = b.rub; b.rub = rub; if (Math.floor(was * 6) !== Math.floor(rub * 6)) propsDirty = true; if (rub <= 0.001) workDirty = true; }
      if (b.rub > 0.001) rubAny = true;
    }
    hill.setPatchN(n);
    if (moved) { slT += dt; if (slT > 0.5) { slT = 0; requestShadow(false); for (let i = 0; i < bSt.length; i++) if (bSt[i].state > 0 || bSt[i].rub > 0.001) boulderMatrices(i); for (const m of bMesh) m.instanceMatrix.needsUpdate = true; } }
    if (rubAny || bVisible) { for (let i = 0; i < bSt.length; i++) if (bSt[i].state <= 0 && !bSt[i].anim && bSt[i].rub > 0.001) boulderMatrices(i); }
    const bv = bSt.some((q) => q.state > 0 || q.rub > 0.001);
    if (bv !== bVisible) { bVisible = bv; for (const m of bMesh) m.visible = bVisible || quarryOn; }
    // the gangs follow the builder from rock to rock
    if (rough) { const hr = heroRock(); if (hr !== slRock) { slRock = hr; workDirty = true; propsDirty = true; } }
  }
  // ── /site8 ──

  /* ── site9 ── the Mount's walls framed (DESIGN8B M7/M8/M10, CAM.WALL; BRIEF9 "the v17 frame of the wall is bare ground"): the
     Mount's first courses rise out of a 4-amah trench at the east face, 19 amot under the hill, where nothing could see them. In
     the walls' phases the working front gets a WORKING BAY: the hill behind the face is dug down to the fill's level over
     ≈ 44 × 72 amot (the bay's floor IS the fill, so it fills again as the walls rise); the treadwheel crane stands on the laid
     course at the next slot and lifts from the stock BEHIND it in the bay, where the builder's banker and the dressing yard
     stand. The builder, his banker, the stock, the crane and the rising course: one frame from the hill's side (wallView). */
  const HAR_PILE = 9;                                                      // the stock's distance behind the crane's base
  const HAR_AP = (H) => -Math.asin(clamp((HAR_PILE + 1.2) / H, 0.1, 0.72));  // the crane's pick angle: back, over the stock
  let bayZ = null, bayFill = -1000, bayChk = 0;
  function harCranePose(st) {
    const C = crane, s = nextSlot('har'); if (!s || C.st !== st || C.lift) return false;
    const H = C.H, nx = s.n[0], nz = s.n[1], aW = 0.1, D = 1.2 + H * Math.sin(aW), bx = s.x - nx * D, bz = s.z - nz * D;
    C.bx = bx; C.bz = bz; C.fwd.set(nx, nz); C.g.rotation.y = Math.atan2(nx, nz); C.byFix = Math.max(s.y - s.h / 2, groundAt(bx, bz) - 0.2);
    C.aW = aW; C.aP = HAR_AP(H);
    const pr = 1.2 + H * Math.sin(C.aP);
    st.piles = [[bx + nx * pr, bz + nz * pr, Math.atan2(nx, nz)]];
    st.harPosed = true; propsDirty = true; workDirty = true;
    st.harPitK = hill.U.uPitK.value;   // ── flow10 ── (posed before the bay was dug: again once it is — harBay)
    return true;
  }
  function harBay(dt) {
    const hs = ST.har, U = hill.U;
    const on = hs.status === 'building' && hs.disp >= FOUND && hs.phase !== 'finish' && hs.phase !== 'done' && U.uFill.value > -999;
    if (on && crane.st === hs && !crane.lift && !hs.harPosed) harCranePose(hs);
    // (the next slot ran on along the front — the game set stones without the crane: a segment, a resume — the crane, its stock
    //  and the builder's banker go to it, so the frame keeps them together; checked twice a second)
    bayChk -= dt;
    if (on && bayChk <= 0 && crane.st === hs && !crane.lift) {
      bayChk = 0.5;
      const s = nextSlot('har');
      if (s && Math.hypot(s.x - s.n[0] * 3.6 - crane.bx, s.z - s.n[1] * 3.6 - crane.bz) > 20) { harCranePose(hs); dustBurst(crane.bx, crane.byFix + 0.3, crane.bz, 10, 5, 4, 1.5); }
      // ── flow10 ── (site_mount: the crane's frame 24 amot over the bay) posed while the bay was still being dug, it stood on the
      // hill's old surface until its first lift: posed again once the bay is dug
      else if (s && hs.harPitK !== undefined && hs.harPitK < 0.99 && U.uPitK.value >= 0.99) harCranePose(hs);
    }
    if (on && crane.st === hs && (bayZ === null || Math.abs(crane.bz - bayZ) > 24)) bayZ = crane.bz;   // (the bay follows the crane)
    const k0 = U.uPitK.value, k = on && bayZ !== null ? Math.min(1, k0 + dt / 2.2) : Math.max(0, k0 - dt / 1.5);
    if (k !== k0) { U.uPitK.value = k; propsDirty = true; requestShadow(false); }
    if (k > 0 && Math.abs(U.uFill.value - bayFill) > 0.5) { bayFill = U.uFill.value; propsDirty = true; }   // (the stock and bankers stand on the rising fill)
    if (k > 0 && bayZ !== null) { const P = U.uPit.value; if (P.y !== bayZ - 36) P.set(X1 - 46, bayZ - 36, X1 + 2, bayZ + 36); }
    else if (k <= 0 && U.uPit.value.z > U.uPit.value.x) { U.uPit.value.set(0, 0, -1, -1); bayZ = null; }
  }

  /* ── site11 ── (STAGING §6 R8, W4–W6; the owner, 29.9: "he walks from point to point at his work") every other site's working
     front, posed: the crane stands where it will lift the next slot's stone (craneWorkPose: outside the face leaning in, or on
     the laid course), its stock under its pick point beside the builder's banker. At a load, a resync or the crane's arrival
     it is posed at once (the first frame holds the builder, his banker, the stock, the crane and the course: at v20 the wall's
     crane and stock waited at its yard, 46 amot from the slot, until the first lift); when the next slot runs on (a stone set,
     the crews' stones, a segment) the crane ROLLS there on its wheels (≤ 60 amot; farther: at once) and the stock goes with it.
     posed(id) / onPosed(id, fn) tell the game (FLOW11's reload landing, N34) when to place him and fly the frame. */
  let poseChk = 0;
  const poseWait = [];
  const poseOn = (st) => st.status === 'building' && st.disp >= FOUND && (st.phase === 'courses' || st.phase === 'foundation') && !!st.lay && st.lay.kind !== 'cast';
  function poseAt(st, P) {
    const C = crane;
    C.glide = null; C.bx = P.bx; C.bz = P.bz; C.fwd.set(P.fx, P.fz); C.g.rotation.y = Math.atan2(P.fx, P.fz); C.byFix = P.byFix; C.aP = P.aP; C.aW = P.aW;
    const pr = 1.2 + C.H * Math.sin(P.aP);
    st.piles = [[P.bx + P.fx * pr, P.bz + P.fz * pr, Math.atan2(P.fx, P.fz)]];
    st.posed = true; propsDirty = true; workDirty = true;
  }
  function glideStep(C, st, dt) {
    const G = C.glide; G.t += dt;
    const u = easeIO(clamp(G.t / G.dur, 0, 1));
    C.bx = lerp(G.from[0], G.P.bx, u); C.bz = lerp(G.from[1], G.P.bz, u); C.roll = (C.roll || 0) + dt * 2.2;
    if (u > 0.5 && !G.turned) { G.turned = true; C.fwd.set(G.P.fx, G.P.fz); C.g.rotation.y = Math.atan2(G.P.fx, G.P.fz); C.byFix = G.P.byFix; C.aP = G.P.aP; C.aW = G.P.aW; }
    if (Math.random() < dt * 8) dustBurst(C.bx, (C.byFix !== null ? C.byFix : groundAt(C.bx, C.bz)) + 0.2, C.bz, 2, 2.5, 1.5, 0.4);
    if (G.t >= G.dur) { poseAt(st, G.P); const [px, pz] = st.piles[0]; dustBurst(px, groundAt(px, pz) + 0.4, pz, 8, 4, 2.5, 1.1); }
  }
  function sitePoseUpdate(dt) {
    const C = crane, st = C.st;
    if ((poseChk -= dt) <= 0 && st && st.id !== 'har' && !C.lift && !C.glide && poseOn(st) && !(stockHold && stockHold.st === st) && !(keyWait && keyWait.st === st)) {
      poseChk = 0.5;
      const s = Math.abs(st.target - st.disp) < 1e-3 ? nextSlot(st.id) : null;   // (a load's ripple first: the pose is the settled count's)
      if (s) {
        const P = craneWorkPose(st, s, C.H), far = Math.hypot(P.bx - C.bx, P.bz - C.bz);
        if (!st.posed || far > 60) { poseAt(st, P); if (st.posed && far > 60) dustBurst(P.bx, groundAt(P.bx, P.bz) + 0.3, P.bz, 10, 5, 4, 1.5); }
        else if (far > 6) C.glide = { t: 0, dur: clamp(far / 9, 0.8, 4), from: [C.bx, C.bz], P, turned: false };
      }
    }
    for (let i = poseWait.length - 1; i >= 0; i--) {
      const w = poseWait[i], ok = posed(w.id);
      if (ok || (w.t += dt) > w.max) { poseWait.splice(i, 1); try { w.fn(ok); } catch (e) { /* the caller's */ } }
    }
  }
  /** ── site11 ── (N34, FLOW11) is site `id`'s working front posed — its crane, stock and the builder's banker where the next
   *  stone is worked, the load's ripple settled? true also when there is nothing to pose (not building, the survey, the dig,
   *  the finish, no crane there) */
  function posed(id) {
    const st = ST[id]; if (!st) return false;
    if (st.status !== 'building') return true;
    if (Math.abs(st.target - st.disp) > 1e-3) return false;
    if (id === 'har') {
      if (st.disp < FOUND || st.phase === 'finish' || st.phase === 'done') return true;
      return crane.st !== st ? !craneDirty : !!st.harPosed && !crane.lift && hill.U.uPitK.value >= 0.99;
    }
    if (!poseOn(st)) return true;
    if (craneDirty) return false;
    return crane.st !== st || (!!st.posed && !crane.glide);
  }
  /** ── site11 ── fn(ok) once, when site `id` is posed (ok = true) or after maxMs (ok = false); at once if it is posed now */
  function onPosed(id, fn, maxMs = 12000) {
    if (typeof fn !== 'function') return false;
    if (posed(id)) { try { fn(true); } catch (e) { /* the caller's */ } return true; }
    poseWait.push({ id, fn, t: 0, max: clamp(+maxMs || 12000, 500, 60000) / 1000 });
    return true;
  }

  /* ── camera focus ── */
  // ndc (optional, key moments): where on the screen the site should sit, e.g. {x: 0, y: 0.5} = the upper quarter;
  // the camera is panned (position and target together), so the view is the same, only moved
  let focusRe = null;   // ── site11 ── (the site whose frame is flown again once it is posed)
  const focusT = new THREE.Vector3(1e9, 0, 0);   // (where the last plain focus looked: the re-frame only if the camera still does)
  let focusD0 = 0;
  // the camera still goes where the last plain focus sent it (no other flight since: its look-at target is not moving away)
  function focusLooks() {
    if (focusT.x > 1e8) return false;
    const c = ctx.controls && ctx.controls.target;
    return !c || c.distanceTo(focusT) <= focusD0 + 2;
  }
  function focusMark(t) { focusT.set(t[0], t[1], t[2]); const c = ctx.controls && ctx.controls.target; focusD0 = c ? c.distanceTo(focusT) : 0; }
  function focus(id, dur = 1900, ndc = null) {
    const st = ST[id]; if (!st || !ctx.flyToPos) return;
    if (ndc || (focusRe && focusRe !== id)) focusRe = null;   // (a moment's frame, another site's: the pending re-frame is dropped)
    focusT.x = 1e9;
    orbitStop(false);
    // ── site8 ── the Mount's plain focus in its survey and dig: the builder's rock, close (see boulderView); key moments keep theirs
    if (id === 'har' && !ndc && st.status === 'building' && (st.phase === 'survey' || st.phase === 'dig' || st.disp < FOUND) && bVisible) {
      const bi = heroRock();
      const v = bi >= 0 ? boulderView(bi) : null;
      if (v) { ctx.flyToPos(tmpV3a.set(v.p[0], v.p[1], v.p[2]), tmpV3b.set(v.t[0], v.t[1], v.t[2]), dur); return; }
    }
    // ── site11 ── (N40) the Mount's finish: CAM.PAVE — the paving's front and him, 60 amot, el 40°, from the plaza's side (west),
    // turned 25°: the east wall behind the patch, never between
    if (id === 'har' && !ndc && st.status === 'building' && st.phase === 'finish') {
      const w = workSpot('har', 'set');
      if (w) {
        const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8, tx = (w.x + paveFront()) / 2, tz = w.z, ty = w.y + 1.5;
        scPos(tx, ty, tz, portrait ? 60 : 46, 180 + 25, 40, scP);
        ctx.flyToPos(tmpV3a.set(scP[0], scP[1], scP[2]), tmpV3b.set(tx, ty, tz), dur); return;
      }
    }
    // ── site8 ── the Mount's walls (their foundation and courses): CAM.WALL, at working distance — not the 880-amah frame
    // ── site9 ── the court's wall too (DESIGN9's P0: v17 framed it from ≈ 220 amot, the builder 24 px)
    // ── site11 ── (a load: the count ripples in from 0 for a second, so the wall's frame goes by its phase, and the frame is
    // flown again once the site is posed — the settled slot, crane and banker: N34's "no empty first frame")
    if (!ndc && st.status === 'building' && id !== 'har' && !posed(id) && focusRe !== id) { focusRe = id; onPosed(id, (ok) => { if (focusRe === id) { focusRe = null; if (ok && ST[id].status === 'building' && focusLooks()) focus(id, 900); } }, 6000); }
    if ((id === 'har' || id === 'wall') && !ndc && st.status === 'building' && (id === 'wall' ? st.phase === 'courses' || st.phase === 'foundation' : st.disp >= FOUND) && st.phase !== 'finish') {
      const v = wallView(id);
      if (v) { focusMark(v.t); ctx.flyToPos(tmpV3a.set(v.p[0], v.p[1], v.p[2]), tmpV3b.set(v.t[0], v.t[1], v.t[2]), dur); return; }
    }
    // ── site11 ── (STAGING R1 "the camera at working distance", §5–§8) every other site's survey, dig and courses: CAM.SURVEY /
    // CAM.TRENCH / CAM.WALL-A at the builder's work point, from the site's own side — not its whole footprint (the wall's survey
    // and dig were framed from ≈ 220 amot, the gates' courses from ≈ 400)
    if (!ndc && id !== 'har' && st.status === 'building') {
      const v = siteWorkView(id);
      if (v) { focusMark(v.t); ctx.flyToPos(tmpV3a.set(v.p[0], v.p[1], v.p[2]), tmpV3b.set(v.t[0], v.t[1], v.t[2]), dur); return; }
    }
    // ── site11 ── (PRODUCER11 N42: "the great stone's moment: above the card a green blur, the camera 2,300 amot away") the Mount's
    // key moment frames its east wall — the courses he laid, the crane at the working front — from outside the face at
    // 110 amot, not the whole 880-amah Mount (its first course lies under the valley's floor there: the wall above it is shown)
    if (id === 'har' && ndc && st.status === 'building') {
      const g = st.great && st.great.length ? st.great[0] : null, tz = g ? g.z : 36, tx = X1, ty = -22;
      const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
      scPos(tx, ty, tz, portrait ? 110 : 85, 14, 22, scP);
      const p = new THREE.Vector3(scP[0], scP[1], scP[2]), t = new THREE.Vector3(tx, ty, tz);
      if (ndc.x || ndc.y) {
        const vf = THREE.MathUtils.degToRad(camera.fov), halfH = Math.tan(vf / 2) * p.distanceTo(t), halfW = halfH * camera.aspect;
        const fwd = tmpV.copy(t).sub(p).normalize(), right = tmpV2.crossVectors(fwd, UP).normalize(), up = tmpS.crossVectors(right, fwd).normalize();
        const pan = right.multiplyScalar(-(ndc.x || 0) * halfW).add(up.multiplyScalar(-(ndc.y || 0) * halfH));
        p.add(pan); t.add(pan);
      }
      ctx.flyToPos(p, t, dur); return;
    }
    const fb = st.fb, v = (ndc && ndc.view) || st.def.view || { az: -25, el: 28 };
    // (a site's own working frame — the builder and the crews at work — for the game's plain focus; the key moments frame the
    // whole site: they pass ndc)
    const fr = !ndc && st.def.frame ? st.def.frame : null;
    const cx = fr ? fr.c[0] : (fb.x0 + fb.x1) / 2, cz = fr ? fr.c[1] : (fb.z0 + fb.z1) / 2;
    const h = st.id === 'har' ? 60 : st.top - st.base;
    let ty = st.id === 'har' ? -5 : st.base + h * 0.38;
    let rad = 0.5 * Math.hypot(fb.x1 - fb.x0, fb.z1 - fb.z0, h * 0.8) + 4;
    if (fr) { rad = fr.r; if (fr.y === 'reveal') ty = st.base + clamp((st.status === 'building' ? revealY(st) : st.top) - st.base, 10, 40) * 0.5; }
    if (fr && st.id === 'har') ty = clamp((st.status === 'building' ? revealY(st) : 0) - 10, -52, 8);   // ── site8 ── (the Mount's walls rise from its rock, 62 below the platform)
    const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    const f = Math.min(vf, hf * 1.15);
    const dist = Math.max(55, rad / Math.sin(f / 2) * 0.92) * (ndc && ndc.zoom ? ndc.zoom : 1);
    const el = THREE.MathUtils.degToRad(v.el), az = THREE.MathUtils.degToRad(v.az);
    const p = new THREE.Vector3(cx + Math.cos(el) * Math.cos(az) * dist, ty + Math.sin(el) * dist, cz + Math.cos(el) * Math.sin(az) * dist);
    const t = new THREE.Vector3(cx, ty, cz);
    if (ndc && (ndc.x || ndc.y)) {
      const fwd = tmpV.copy(t).sub(p).normalize(), right = tmpV2.crossVectors(fwd, UP).normalize(), up = tmpS.crossVectors(right, fwd).normalize();
      const halfH = Math.tan(vf / 2) * dist, halfW = halfH * camera.aspect;
      const pan = right.multiplyScalar(-(ndc.x || 0) * halfW).add(up.multiplyScalar(-(ndc.y || 0) * halfH));
      p.add(pan); t.add(pan);
    }
    ctx.flyToPos(p, t, dur);
  }
  /* key moments: frame the site where the moment's card leaves it visible (the card sits at the bottom of a portrait
     screen and on the right of a wide one: moments.js CSS) */
  // a moment's own camera angle where the site's usual one hides what the moment is about: the altar's top (the
  // horns, the first fire) from higher up; the kevesh from the south-east
  const MOMENT_VIEW = { karnot: { az: -24, el: 56 }, guf: { az: 36, el: 52 }, yesod: { az: -24, el: 44 } };
  function frameMoment(id, dur = 1200) {
    const a = camera.aspect, wide = a >= 1.25 && innerWidth >= 820;
    const view = MOMENT_VIEW[id] || null;
    focus(id, dur, a < 1 ? { x: 0, y: 0.5, zoom: 1.45, view } : wide ? { x: -0.36, y: 0.04, zoom: 1.15, view } : view ? { view } : null);
    return true;
  }

  /* ── per-frame ── */
  const pv = new THREE.Vector3();
  // ── twin18 ── the see-through follows him while twin is ON (batch.js XRAY)
  let xrOn = false;
  function xrayStep() { if (xrOn && hero.vis) { XRAY.uXr.value.set(hero.x, hero.y + 1.8, hero.z, 1); XRAY.uXrC.value.copy(camera.position); if (cbXray(XRAY.uXr.value)) XRAY.uXr.value.w = 2; } else XRAY.uXr.value.w = 0; }   // ── craftb19 ── (cbXray: a craft's box fully clear) ── /craftb19 ──
  // ── /twin18 ──
  function update(dt) {
    xrayStep();   // ── twin18 ── ── /twin18 ──
    time += dt; BUILD_TIME.value = time;
    shadowAge += dt;
    nightTick(dt);
    tlUpdate(dt);
    liftsUpdate(dt);
    keyWaitUpdate(dt);   // ── site9 ── (deliverKeyStone's fallback on the world's clock)
    // progress easing + reveal (a site in the timelapse follows its replay exactly)
    for (const st of list) {
      if (st.status !== 'building') continue;
      const was = st.disp;
      if (st.tl) st.disp = st.target;
      else {   // eased, with a floor of ~10 stones a second so the last stones of a ripple land exactly
        const d = st.target - st.disp, floor = st.lay && st.lay.N ? dt * 10 * (1 - FOUND) / st.lay.N : 1e-4;
        const step = d * (1 - Math.exp(-dt * 3.2));
        st.disp = Math.abs(d) <= Math.max(1e-4, floor) ? st.target : st.disp + (Math.abs(step) < floor ? Math.sign(d) * floor : step);
      }
      if ((was < FOUND) !== (st.disp < FOUND)) { st.group.visible = st.disp >= FOUND; propsDirty = true; workDirty = true; dirtyGlobal = true; craneDirty = true; }
      if (st.lay) {   // wave 6: the stones follow the eased progress one by one (a jump ripples in along the fronts)
        const n = nOf(st), p0 = st.lay.n;
        if (n !== p0) { stonesTo(st, n); stoneFX(st, p0, st.lay.n); }
        const uf = st.U.uF.value; if (uf.x > 0) uf.x = Math.max(0, uf.x - dt * 1.1);
      }
      const y = revealY(st);
      st.U.uY.value = y;
      if (Math.abs(y - st.lastY) > 0.6) { st.lastY = y; requestShadow(false); }
      // the build edge: brighter on strikes, and while a combo runs at the builder's site; a little softer at night
      const cb = hero.at === st.id ? comboV : 0, g = (1 + st.glowBoost * 1.2 + cb * 0.6) * (1 - 0.72 * nightK);
      st.U.uGlow.value.setRGB(3.4 * g, (2.25 + cb * 0.5) * g, (0.72 + cb * 0.4) * g);
      if (st.scaff) { if (setScaffoldHeight(st.scaff, st.disp < FOUND ? -1e9 : y + 0.01)) requestShadow(false); }
      if (st.id === 'har') {
        hill.U.uFill.value = st.disp < FOUND ? -1000 : y - 1.5;
        harCut(st.disp);   // ── site12 ── (the crest by the course; the scrub stays until the works reach it)
      }
    }
    for (const st of list) if (st.glowBoost > 0) { st.glowBoost = Math.max(0, st.glowBoost - dt * 1.4); }
    // struck scaffolds
    for (let i = removing.length - 1; i >= 0; i--) {
      const sc = removing[i]; sc.remove += dt;
      const u = clamp(sc.remove / 0.9, 0, 1);
      const nP = Math.floor(sc.from * (1 - easeIn(u))), nB = Math.floor(sc.fromB * (1 - easeIn(u)));
      if (nP < sc.P.m.count) {
        for (let k = nP; k < sc.P.m.count; k += Math.max(1, Math.floor(sc.from / 22))) { sc.P.m.getMatrixAt(k, tmpM); pv.setFromMatrixPosition(tmpM); if (Math.random() < 0.35) dust.spawn(pv.x, pv.y, pv.z, 1, PO(2, 0, 2, -1, 3, 8, 1.4, 0, 1.2, 0.4)); }
      }
      sc.P.m.count = nP; sc.Bd.m.count = nB;
      if (u >= 1) { disposeScaffold(sc); removing.splice(i, 1); requestShadow(true); }
    }
    if (craneDirty) craneAssign();
    if (dirtyGlobal) applyGlobal();
    if (propsDirty) rebuildProps();
    if (workDirty) assignWorkers();
    planUpdate(dt); showUpdate(dt);
    // pins: the available sites, and any the vision or the showcase lights up
    let np = 0;
    for (const st of list) {
      const w = Math.max(st.status === 'avail' ? 1 : 0, st.pinDup ? 0 : pinFx[st.idx]);
      if (w < 0.02) continue;
      pinPos(st, pv);
      const d = pv.distanceTo(camera.position), s = clamp(d * 0.012, 1.4, 22) * (0.45 + 0.55 * w), bob = Math.sin(time * 2.4 + np) * s * 0.35;
      tmpQ.setFromAxisAngle(UP, time * 1.6); tmpV.set(pv.x, pv.y + bob, pv.z); tmpS.set(s, s, s);
      tmpM.compose(tmpV, tmpQ, tmpS); pins.setMatrixAt(np, tmpM);
      const gy = st.id === 'har' || !isDone('har') ? hill.heightAt(pv.x, pv.z) : st.base, bw = clamp(d * 0.0016, 0.25, 2.2) * (st.status === 'avail' ? 1 : 0.5);
      tmpQ.identity(); tmpV.set(pv.x, gy, pv.z); tmpS.set(bw, Math.max(0.01, pv.y - gy + s * 0.5), bw); tmpM.compose(tmpV, tmpQ, tmpS); beams.setMatrixAt(np, tmpM);
      halo.pos[np * 3] = pv.x; halo.pos[np * 3 + 1] = pv.y + s * 1.5 + bob; halo.pos[np * 3 + 2] = pv.z;
      halo.size[np] = s * 5.5; halo.alpha[np] = (0.55 + 0.25 * Math.sin(time * 3.4)) * w;
      np++;
    }
    // ── site15 ── the "!" markers over the next tasks' spots (taskMarks): the pins' own instances, smaller, a thin beam
    for (const m of TS.marks) {
      if (np >= 15) break;
      const d = Math.hypot(m.x - camera.position.x, m.y - camera.position.y, m.z - camera.position.z), s = clamp(d * 0.0085, 0.8, 9), bob = Math.sin(time * 3 + np * 1.7) * s * 0.3;
      tmpQ.setFromAxisAngle(UP, time * 2.1 + np); tmpV.set(m.x, m.y + s * 0.4 + bob, m.z); tmpS.set(s * 0.8, s * 0.8, s * 0.8);
      tmpM.compose(tmpV, tmpQ, tmpS); pins.setMatrixAt(np, tmpM);
      const gy = groundAt(m.x, m.z), bw = clamp(d * 0.0012, 0.18, 1.4);
      tmpQ.identity(); tmpV.set(m.x, gy, m.z); tmpS.set(bw, Math.max(0.01, m.y + s * 0.4 - gy), bw); tmpM.compose(tmpV, tmpQ, tmpS); beams.setMatrixAt(np, tmpM);
      halo.pos[np * 3] = m.x; halo.pos[np * 3 + 1] = m.y + s * 1.6 + bob; halo.pos[np * 3 + 2] = m.z;
      halo.size[np] = s * 4.5; halo.alpha[np] = 0.5 + 0.25 * Math.sin(time * 3.4 + np);
      np++;
    }
    if (np || pins.count) {
      pins.count = beams.count = np;
      pins.instanceMatrix.needsUpdate = true; beams.instanceMatrix.needsUpdate = true;
      for (let k = np; k < 15; k++) halo.alpha[k] = 0;
      const A = halo.points.geometry.attributes; A.position.needsUpdate = A.size.needsUpdate = A.alpha.needsUpdate = true;
    }
    halo.points.visible = np > 0;
    hotUpdate(dt);
    craneUpdate(dt * cSpeed);
    workersUpdate(dt * wSpeed);
    heroUpdate(dt);
    workLights();
    bouldersUpdate(dt);
    redLineUpdate(dt); boxesUpdate(dt); vineUpdate(dt); rainUpdate(dt); shineUpdate(dt); flashUpdate(dt);
    glows.flush(); glowsTop.flush();
    dust.update(dt, time); spark.update(dt, time); chips.update(dt);
    if (ringFx.visible) {
      ringS.t += dt; const u = ringS.t / 1.1;
      if (u >= 1) ringFx.visible = false;
      else { const r = lerp(ringS.r0, ringS.r1, easeOut(u)); ringFx.scale.set(r, 1, r); ringFx.material.opacity = (1 - u) * (1 - u) * 0.55; }
    }
    orbitUpdate(dt);
    // camera shake (applied around the render by main.js through shakeOffset)
    if (shake.t > 0) { shake.t -= dt; const a = shake.amp * Math.max(0, shake.t) / 0.25; shake.off.set((Math.random() - 0.5) * a, (Math.random() - 0.5) * a, (Math.random() - 0.5) * a); }
    else shake.off.set(0, 0, 0);
    if (shadowWant && shadowAge > 0.3) { shadowWant = false; shadowAge = 0; if (ctx.requestShadow) ctx.requestShadow(); }
    // ── site8 ── the rough hill's cut follows the Mount's shown progress every frame (a new game after the opening kept a stale
    // cut of 0.06 through its survey and dig, and the drawn hill buried the rocks below the platform's level: QA8B / owner note 1)
    { const hs = ST.har;
      if (hs.status === 'building') { if (hs.disp < FOUND) hill.U.uFill.value = -1000; harCut(hs.disp); }   // ── site12 ── (+ the crest)
      else if (hs.status !== 'done' && (hill.U.uCut.value !== 0 || hill.U.uCrest.value.x < 999)) { hill.U.uFill.value = -1000; harCut(0); } }
    siteLife(dt);   // ── site8 ── the Mount's working patch (below)
    harBay(dt);     // ── site9 ── the Mount's working bay at its walls' working front
    sitePoseUpdate(dt);   // ── site11 ── every other site's working front: the crane, its stock and his banker at the next slot
    finishCuts(dt);       // ── site13 ── the finish on the building, step by step; the Ezrat Nashim's chambers one at a time
    jobsUpdate(dt); marksUpdate();   // ── site14 ── the jobs' results: the Stoa's columns, her lamps, her marks
    taskUpdate(dt); treadTick(dt);   // ── site15 ── a task's scene in progress; the operator's feet on the tread
    craftTick(dt);   // ── site16 ── the craft's props: the bench and the log, the blade, the cord
    machinesUpdate(dt);   // ── site13 ── the crews' machines at the walled sites
  }

  function setScale(s) { for (const p of [dust, spark, halo, glows, glowsTop, flames]) p.mat.uniforms.scale.value = s; }

  /* ── the site API (wave 6; docs/SITE.md): siteInfo · setWork · liftStone · nextSlot · slots · workSpot · frontView ── */
  const PHASES = ['survey', 'dig', 'foundation', 'courses', 'finish', 'done'], PH_P = { survey: 0.03, dig: 0.08 };
  function stoneFX(st, a, b) {   // dust (and chips at the working front) where the newest stones settle
    const L = st.lay; if (!L || a < 0 || b <= a || !st.group.visible || L.kind === 'cast') return;
    for (let i = b - 1, k = 0; i >= a && k < 5; i--) {
      const bl = L.blocks[L.order[i]], dx = bl.x - camera.position.x, dz = bl.z - camera.position.z;
      if (dx * dx + dz * dz > (bl.f === 0 ? 400 : 160) ** 2) continue;
      k++;
      const x = bl.x + bl.nx * 0.5, y = bl.y - bl.h * 0.45, z = bl.z + bl.nz * 0.5;
      dustBurst(x, y, z, bl.f === 0 ? 8 : 3, bl.f === 0 ? 2.4 : 1.6, 1.3, 0.7);
      if (bl.f === 0) chips.spawn(x, y + 0.2, z, 5, '#D9CBA8', { speed: 3, up: 3.5, size: 0.22, life: 1.1 });
    }
  }
  // the global index of the working front's next stone (the crane's and the hero's stone), or −1 when all are set
  function nextWorkIdx(L) {
    const n = Math.max(0, L.n);
    // ── flow10 ── the Mount: the next stone ON the east face in the working bay (harSlotOk), after the stones the player has
    // already set there (L.pend); cached per count (a course holds up to ~1,600 stones; before site12, course 0 held 13,674)
    if (ST.har && ST.har.lay === L) {
      const from = Math.max(n, (L.pendTop ?? -1) + 1), c = L.nwc;
      if (c && c.from === from) return c.i;
      let i = -1; for (let k = from; k < L.N; k++) if (harSlotOk(L, L.blocks[L.order[k]])) { i = k; break; }
      if (i < 0) for (let k = n; k < L.N; k++) if (L.blocks[L.order[k]].f === 0) { i = k; break; }
      if (i < 0 && n < L.N) i = n;
      L.nwc = { from, i };
      return i;
    }
    for (let i = n; i < L.N; i++) if (L.blocks[L.order[i]].f === 0) return i;
    return n < L.N ? n : -1;
  }
  /** ── flow10 ── (the owner, 28.9: "the builder vanishes in the Mount's courses"; v19's replay: his banker flipped between the bay's
   *  floor and a ledge 15 amot above it every stone or two) the Mount's working front (front 0, the east face) also holds the
   *  outer face of the Shushan gate's stairs, 18 amot out at x 295 (mount.js), and its course 0 takes every stone below y0 + H —
   *  the foundation rows down to −148, under the bay's floor. The crane stood at whichever came next, and its stock and the
   *  builder's banker with it. A player's slot on the Mount is a stone of the east face's own line (≤ 3 amot off the rect's
   *  edge) at the bay's floor or above (≥ y0 − 2): the crane, the stock and the banker stay in the bay, one frame. */
  function harSlotOk(L, b) {
    if (b.f !== 0 || b.y < L.y0 - 2) return false;
    const r = L.rects[0]; if (!r) return true;
    const d = Math.abs(b.nx) >= Math.abs(b.nz) ? Math.abs(b.x - (b.nx > 0 ? r.x1 : r.x0)) : Math.abs(b.z - (b.nz > 0 ? r.z1 : r.z0));
    return d <= 3;
  }
  // a stone's box: centre inset half its depth behind the face; the face looks along (sin yaw, cos yaw)
  function slotOf(b, set) {
    const d = Math.min(2.4, Math.max(0.9, b.h * 0.9));
    return { x: b.x - b.nx * d / 2, y: b.y, z: b.z - b.nz * d / 2, w: b.w, h: b.h, d, yaw: Math.atan2(b.nx, b.nz), n: [b.nx, b.nz],
      face: [b.x, b.y, b.z], course: b.c, index: b.j, stone: b.g, set: !!set };
  }
  function pileOf(st) {
    // ── flow10 ── (by touch, site_mount: after the rocks the builder walked to a banker on the outer bank) the Mount's walls
    // before its crane is posed in the bay (the first frames of the courses, while the progress eases past the foundation):
    // the stock where harCranePose will put it, behind the next slot in the bay — never the crane's default pile on the ledge
    if (st === ST.har && !st.harPosed && st.status === 'building' && (st.phase === 'courses' || st.phase === 'foundation')) {
      const s = nextSlot('har');
      if (s) { const H = st.def.crane.H, D = 1.2 + H * Math.sin(0.1), pr = 1.2 + H * Math.sin(HAR_AP(H)), bx = s.x - s.n[0] * D, bz = s.z - s.n[1] * D; return [bx + s.n[0] * pr, bz + s.n[1] * pr, Math.atan2(s.n[0], s.n[1])]; }
    }
    if (st.piles && st.piles.length) return st.piles[0];
    const d = st.def.crane, l = Math.hypot(d.dir[0], d.dir[1]), fx = d.dir[0] / l, fz = d.dir[1] / l;
    const rp = d.H * Math.sin(d.mode === 'ground' ? 0.12 : Math.asin(clamp(d.reach / d.H, 0.1, 0.72))) + 1.2;
    return [d.x + fx * rp, d.z + fz * rp, Math.atan2(fx, fz)];
  }
  function siteInfo(id) {
    const st = ST[id]; if (!st) return null;
    const L = layout(st);
    return { id, kind: L.kind, stones: L.N, courses: L.C, perCourse: L.cs.map((c) => c.n), fronts: L.F, rounds: L.rounds,
      H: +L.H.toFixed(4), y0: +L.y0.toFixed(3), bottom: st.bottom, top: st.top, base: st.base,
      set: Math.max(0, L.n), course: L.cur, phase: st.phase || null, status: st.status, virtual: L.virtual };
  }
  let stockHold = null, keyWait = null;   // ── site9 ── the stock cart's hold on the pile · the key stone's cart (below)
  function setWork(id, o = {}) {
    const st = ST[id]; if (!st || !o || typeof o !== 'object') return null;
    const L = layout(st);
    const ph = PHASES.includes(o.phase) ? o.phase : (st.phase && st.phase !== 'done' ? st.phase : 'courses');
    if (o.ghost !== undefined) st.ghostN = clamp(Math.round(+o.ghost || 0), 0, 12);
    if (o.finish !== undefined) st.finish = clamp(+o.finish || 0, 0, 1);
    if (o.stock !== undefined) {
      const v = clamp(Math.round(+o.stock || 0), 0, 99);
      // ── site9 ── (DESIGN8B M7 / DESIGN9 W4: "an ox cart unloads the blocks onto the pile") a delivery of 4+ stones to a site
      // whose crane is there comes in by the stock cart: the pile shows the new stones when it unloads (≈ 12 s); meanwhile
      // later calls only move the number it will show
      if (stockHold && stockHold.st === st) stockHold.to = v;
      else if (v >= (st.stock || 0) + 4 && st.stock !== undefined && st.disp >= FOUND && crane.st === st && typeof api.keyCart === 'function' && !(keyWait && keyWait.st === st)) stockCart(st, v);
      else st.stock = v;
    }
    if (o.dressing !== undefined) st.dressing = o.dressing;
    st.phase = ph;
    if (ph === 'done') { if (st.status !== 'done') setStage(id, 'done'); propsDirty = true; return { stones: L.N, course: L.C, index: 0 }; }
    let n = o.stones !== undefined ? clamp(Math.round(+o.stones || 0), 0, L.N) : Math.max(0, L.n);
    if (ph === 'finish') n = L.N;
    // ── flow10 ── (the Mount's stones set ahead of the count) the count went back: a new game, a reset — they go too
    if (L.pend !== undefined && n < L.n) { L.pend = null; L.pendTop = -1; L.nwc = null; propsDirty = true; }
    const p = PH_P[ph] !== undefined ? PH_P[ph] : FOUND + (1 - FOUND) * (L.N ? n / L.N : 1);
    setStage(id, 'building', p);
    const U = st.U.uF.value;
    U.z = ph === 'finish' ? (st.finish || 0) : 0;
    U.w = ph === 'finish' ? st.bottom + (st.finish || 0) * (st.top - st.bottom + 1) : -1e6;
    if (L.n >= 0) stonesTo(st, L.n, true);   // (ghost count changes)
    propsDirty = true;
    const i = nextWorkIdx(L), b = i >= 0 ? L.blocks[L.order[i]] : null;
    return { stones: n, course: b ? b.c : L.C, index: b ? b.j : 0 };
  }
  // ── site12 ── (N75) the working front's next slot for the count the site settles to (a ripple, the dig: the shown count lags)
  function settledSlot(st) {
    const L = layout(st); if (!L.N) return null;
    if (st.disp >= FOUND && Math.abs(st.target - st.disp) < 1e-3) return nextSlot(st.id);
    const n0 = L.n, c0 = L.nwc; L.n = Math.round(clamp((st.target - FOUND) / (1 - FOUND), 0, 1) * L.N); L.nwc = null;
    try { return nextSlot(st.id); } finally { L.n = n0; L.nwc = c0; }
  }
  function nextSlot(id) {
    const st = ST[id]; if (!st) return null;
    const L = layout(st), i = nextWorkIdx(L);
    return i < 0 ? null : slotOf(L.blocks[L.order[i]], false);
  }
  /** ── site9 ── the face's direction at slot `s`, toward the course's laid stones (the previous slot; else away from the next) */
  function slotTangent(id, s) {
    const arr = slots(id, s.course) || [];
    let p = null, q = null; for (const o of arr) { if (o.index === s.index - 1) p = o; else if (o.index === s.index + 1) q = o; }
    let ux, uz;
    if (p) { ux = p.face[0] - s.face[0]; uz = p.face[2] - s.face[2]; } else if (q) { ux = s.face[0] - q.face[0]; uz = s.face[2] - q.face[2]; } else { ux = -s.n[1]; uz = s.n[0]; }
    const L = Math.hypot(ux, uz) || 1; return [ux / L, uz / L];
  }
  function slots(id, course) {
    const st = ST[id]; if (!st) return null;
    const L = layout(st), c = course === undefined ? Math.min(L.cur, L.C - 1) : clamp(Math.round(+course || 0), 0, L.C - 1);
    // the working front's stones of that course (or, where its run is lower than the others, the first front that has some)
    const F = L.cs[c].fr, fr = F[0] && F[0].length ? F[0] : (F.find((a) => a && a.length) || []);
    // ── flow10 ── the Mount: the east face's own stones in the bay (harSlotOk), set when shown or set ahead of the count (L.pend)
    if (id === 'har') { const P = L.pend || []; return fr.filter((bi) => harSlotOk(L, L.blocks[bi])).map((bi) => slotOf(L.blocks[bi], L.blocks[bi].g < L.n || P.some((p) => p.g === L.blocks[bi].g))); }
    return fr.map((bi) => slotOf(L.blocks[bi], L.blocks[bi].g < L.n));
  }
  function workSpot(id, kind = 'set') {
    const st = ST[id]; if (!st && kind !== 'quarry') return null;
    if (kind === 'quarry') return { x: QSPOT.x, y: groundAt(QSPOT.x, QSPOT.z), z: QSPOT.z, face: QSPOT.face.slice() };
    const def = st.def, sp = def.spot;
    // ── site11 ── (FLOW11's request) where he stands in the site's key moment's frame: in front of the site on the camera's side,
    // 8 amot out from its footprint, facing the work (the Mount: on the plaza at the east wall's edge, over the course he laid)
    if (kind === 'moment') {
      if (id === 'har') { const z = st.great && st.great.length ? st.great[0].z : 36, x = X1 - 5; return { x, y: groundAt(x, z), z, face: [X1 + 20, z], kind: 'moment' }; }
      const fb = st.fb, cx = (fb.x0 + fb.x1) / 2, cz = (fb.z0 + fb.z1) / 2, v = MOMENT_VIEW[id] || def.view || { az: -25 }, a = v.az * DEG, ux = Math.cos(a), uz = Math.sin(a);
      const tx = ux ? ((ux > 0 ? fb.x1 : fb.x0) - cx) / ux : 1e9, tz = uz ? ((uz > 0 ? fb.z1 : fb.z0) - cz) / uz : 1e9, t = Math.min(Math.abs(tx), Math.abs(tz)) + 8;
      const x = cx + ux * t, z = cz + uz * t;
      const [mx, mz] = soregOff(x, z);   // ── site14 ── (never inside the soreg's lattice)
      return { x: mx, y: groundAt(mx, mz), z: mz, face: [cx, cz], kind: 'moment' };
    }
    // the Mount's survey and dig happen among its boulders, where the builder already stands: no spot of ours (the caller
    // keeps its own, as without this API), so the first strokes need no walk
    if (id === 'har' && (kind === 'survey' || kind === 'set') && (st.status !== 'building' || st.disp < FOUND || st.phase === 'survey' || st.phase === 'dig')) return null;
    // ── site11 ── (N40) the Mount's finish: he paves at the patch's front, on the laid side, facing the bed; a new place along
    // the strip at each pair of strips (he walks from point to point)
    if (id === 'har' && st.status === 'building' && st.phase === 'finish' && (kind === 'set' || kind === 'dress')) {
      const n = Math.max(0, paveN()), fx = paveFront(), zz = PAVE.z0 + 8 + ((n * 11) % (PAVE.z1 - PAVE.z0 - 16));
      const x = Math.min(PAVE.x1 - 1, fx + 1.6);
      return { x, y: groundAt(x, zz), z: zz, face: [fx - 2.5, zz] };
    }
    // ── site9 ── (DESIGN9 15:48, rule 1, "the stone is dressed where it is set") at the wall the builder's banker stands at the
    // course's next slot — on the ground or the scaffold's board, 3 amot out from the face, he 1.9 amot along it — not by the
    // crane's pile, from where the slot ran ≈ 11 amot a stone out of every frame
    // ── site11 ── (the owner, 29.9: "he walks from point to point at his work" — at every stage) every other site too: his banker
    // on the ground at the foot of the next slot, 4 amot out (no scaffold under it there: it never floats), the stone lifted
    // from there by the crane; at the altar a whole stone that he carries, fits and seats (never dressed)
    // ── site12 ── (PRODUCER12 N75: at the chambers he walked 150 amot to the crane's yard and back, twice — during a load's ripple
    // and the dig the shown count was below the stones and 'dress' fell back to the yard's banker by the default pile) the next
    // slot of the count the site is settling to, from the dig on
    if (kind === 'dress' && id !== 'har' && st.status === 'building' && st.phase !== 'finish' && st.phase !== 'survey' && layout(st).kind !== 'cast') {
      const s = settledSlot(st);
      if (s) {
        // (his banker is drawn on the ground — hero.workpiece places it at the ground's height — so its box says so too: the
        //  ring and the pointer the game hangs on it sit on the stone he dresses, not in the air above it at the wall's courses)
        // (── site13 ── PRODUCER13 N88: "after the survey on the altar's top he runs down the kevesh and round to the corner at the
        //  base, 147 amot") the horns are set on the altar's top (מדות ג, א): at the karnot he works them from the top, beside each
        const wl = id === 'wall', out = wl ? 3.0 : id === 'karnot' && isDone('guf') ? -2.8 : 4.0;
        const [ux, uz] = slotTangent(id, s), lo = -1e9;
        { const T = s20Spot(st, s, ux, uz, 'dress'); if (T) return T; }   // ── site20 ── (on the wall's laid top) ── /site20 ──
        const [nx, nz] = standSide(st, s, out);   // ── site14 ──
        let sx = s.face[0] + nx * out - ux * 1.0, sz = s.face[2] + nz * out - uz * 1.0;
        const ho = houseOut(id, sx, sz); if (ho) { sx = ho[0] + 1.9; sz = ho[1]; }   // ── site14 ── (an inner slot of the House: worked from outside it)
        const g = Math.max(groundAt(sx, sz), lo), x = ho ? sx - 1.9 : sx - ux * 1.9, z = ho ? sz : sz - uz * 1.9;
        return { x, y: Math.max(groundAt(x, z), lo), z, face: [sx, sz], stone: { x: sx, y: g + 1.1 + 0.45, z: sz, w: 1.8, h: 0.9, d: 1.0, yaw: Math.atan2(ux, uz) } };
      }
    }
    // ── site14 ── (the probe: "kiyor dress — the banker inside the laver") the cast laver is worked from his site spot beside it
    if (layout(st).kind === 'cast' && (kind === 'dress' || kind === 'set')) return { x: sp.x, y: groundAt(sp.x, sp.z), z: sp.z, face: sp.face.slice() };
    if (kind === 'stock' && id === 'sorag') { const p = workSpotRaw(st, kind); const [x, z] = soregOff(p.x, p.z); return { ...p, x, z, y: groundAt(x, z) }; }
    if (kind === 'stock' || kind === 'dress' || kind === 'yard') {
      const [px, pz, yaw] = pileOf(st), fx = Math.sin(yaw), fz = Math.cos(yaw), rx = fz, rz = -fx;
      if (kind === 'stock') { const x = px - fx * 3.2, z = pz - fz * 3.2; return { x, y: groundAt(x, z), z, face: [px, pz] }; }
      // (wave 6) the dressing yard's bankers (siteDressing: 4 bankers at 11.5 … 22.9 amot along `along`); x,z = its middle
      if (kind === 'yard') { const x = px + rx * 17.2 + fx * 0.5, z = pz + rz * 17.2 + fz * 0.5; return { x, y: groundAt(x, z), z, face: [x, z], along: [rx, rz], n: [fx, fz], bankers: yardBankers(st) }; }
      // the dressing yard: a banker beside the stock pile (PEOPLE draws the hero's own banker + stone at `stone`)
      const sx = px + rx * 7, sz = pz + rz * 7, x = sx + rx * 1.9, z = sz + rz * 1.9, gy = groundAt(sx, sz);
      return { x, y: groundAt(x, z), z, face: [sx, sz], stone: { x: sx, y: gy + 1.1 + 0.45, z: sz, w: 1.8, h: 0.9, d: 1.0, yaw: Math.atan2(-rx, -rz) } };
    }
    // ── site13 ── the Ezrat Nashim's "לשכות הפינות": he raises the corner chambers one at a time, at each one's door (the one rising
    // now, then the next): from point to point round the court
    if (id === 'nashim' && st.lc && st.status === 'building' && st.phase === 'finish' && (kind === 'set' || kind === 'dress') && finStep(st) >= 1 && (st.finish || 0) < 0.999) {
      const c = NASHIM_LC[clamp(Math.floor(st.lc.shown + 1e-6), 0, NASHIM_LC.length - 1)], x = c.at[0], z = c.at[1];
      return { x, y: groundAt(x, z), z, face: c.face.slice() };
    }
    // ── site13 ── (N76 b) the karnot's survey on the altar's top, at its north-east corner where the first horn goes (מדות ג, א)
    if (id === 'karnot' && kind === 'survey' && isDone('guf')) return { x: -27.2, y: 25, z: -14.6, face: [-24.5, -17] };
    const s = nextSlot(id);
    // ── site14 ── (the probe: "kiyor finish:set — feet 16, the laver's base at 18.9": his set spot was inside the cast laver) the
    // laver is cast, not set stone by stone: he works it from his site spot beside it

    if (kind === 'survey' || !s) {
      const f = sp.face, dx = sp.x - f[0], dz = sp.z - f[1], l = Math.hypot(dx, dz) || 1, x = f[0] + dx / l * 3, z = f[1] + dz / l * 3;
      return { x, y: groundAt(x, z), z, face: f.slice() };
    }
    // 'set': on the scaffold board (or the ground) in front of the next slot
    // ── site11 ── (PRODUCER11 N61: "at the Ulam's dig he stands half inside the rock") in the dig he works from the lane between
    // the trench's two earth banks (the inner one lies 0.3…3.8 amot out), 4.8 amot out, not inside the inner bank at 1.8
    { const T = s20Spot(st, s, 0, 0, 'set'); if (T) return T; }   // ── site20 ── ── /site20 ──
    const out = id !== 'har' && (st.phase === 'dig' || st.disp < FOUND) ? 4.8 : 1.8;
    const [snx, snz] = standSide(st, s, out), o2 = snx !== s.n[0] || snz !== s.n[1] ? Math.max(out, 4.2) : out;   // ── site14 ── (flipped at the Ulam: clear of its columns' plinths)
    const x = s.face[0] + snx * o2, z = s.face[2] + snz * o2, g = groundAt(x, z);
    { const ho = houseOut(id, x, z); if (ho) return { x: ho[0], y: groundAt(ho[0], ho[1]), z: ho[1], face: [ho[0], ho[2]] }; }   // ── site14 ──
    return { x, y: Math.max(g, s.y - s.h / 2 - 1.0), z, face: [s.face[0], s.face[2]], slot: s };
  }
  // ── site14 ── (the probe: at the Ulam he stood inside its front wall — the slots on the steps' inner edge, x = −76.2, face
  // west into the Ulam's own rect) a stand `out` from the face that falls inside another of the site's footprint rects is taken
  // on the face's other side → the normal to stand by
  // ── site14 ── (the probe: at the Heichal and the Kodesh he stood — and walked — inside the House's own base: the slots on the
  // inner wall between them, x = −139, put his stand 4 amot into the other) a stand inside the House is moved out to its side,
  // 4 amot from the wall, facing it — never into the Kodesh HaKodashim → [x, z, the wall's z] | null
  function houseOut(id, x, z) {
    if ((id !== 'heichal' && id !== 'kodesh') || x < -177.5 || x > -91.5 || Math.abs(z) > 35.5) return null;
    const sg = z < 0 ? -1 : 1; return [clamp(x, -174, -95), sg * 39.5, sg * 35];
  }
  // ── site14 ── (the probe: the sorag's stock and moment spots stood in the soreg's lattice, temple.js 43–55) a stand within an
  // amah of the lattice's line is moved 1.3 amot off it, outward
  function soregOff(x, z) {
    if (x > -212 && x < 166) { if (Math.abs(z + 91.5) < 1) z = -92.8; else if (Math.abs(z - 91.5) < 1) z = 92.8; }
    if (z > -92.5 && z < 92.5) { if (Math.abs(x + 211) < 1) x = -212.3; else if (Math.abs(x - 165) < 1) x = 166.3; }
    return [x, z];
  }
  // (the stock spot as before, for soregOff)
  function workSpotRaw(st, kind) {
    const [px, pz, yaw] = pileOf(st), fx = Math.sin(yaw), fz = Math.cos(yaw), x = px - fx * 3.2, z = pz - fz * 3.2;
    return { x, y: groundAt(x, z), z, face: [px, pz] };
  }
  // ── site20 ── the spot ON the wall's laid top (twin only; from the course whose laid top is ≥ 6.4 amot): the banker 1.6 amot inside the
  // face at the slot, he 1.9 amot along it, on the unlaid side; 'set': 2.2 inside the face, facing it → a work spot | null
  function s20Spot(st, s, ux, uz, kind) {
    if (st.id !== 'wall' || !s || s.y - s.h / 2 < S20_MIN || !s20Refresh()) return null;
    const fx = s.face[0], fz = s.face[2], nx = s.n[0], nz = s.n[1];
    if (kind === 'set') { const x = fx - nx * 2.2, z = fz - nz * 2.2; return { x, y: groundAt(x, z), z, face: [fx, fz], slot: s, top: true }; }
    const sx = fx - nx * 1.6 - ux * 1.0, sz = fz - nz * 1.6 - uz * 1.0, x = sx - ux * 1.9, z = sz - uz * 1.9, g = groundAt(sx, sz);
    return { x, y: groundAt(x, z), z, face: [sx, sz], top: true, stone: { x: sx, y: g + 1.1 + 0.45, z: sz, w: 1.8, h: 0.9, d: 1.0, yaw: Math.atan2(ux, uz) } };
  }
  /** the way up for a walk the game asks for when he is inside the court and the spot is on the top: [the ramp's foot, its mouth, the spot] | null */
  function s20Way(sp) {
    if (!S20.act || !S20.on || !(s20Top(sp.x, sp.z) > -1e8) || s20Top(hero.x, hero.z) > -1e8) return null;
    const fx = S20.ax - S20.nx * S20.Lr, fz = S20.az - S20.nz * S20.Lr;
    if (Math.hypot(hero.x - fx, hero.z - fz) > 70 || (hero.x - S20.ax) * S20.nx + (hero.z - S20.az) * S20.nz > 0.5) return null;   // (outside the wall: through the gate, as before)
    const L = twinLine(hero.x, hero.z, fx, fz); if (L.d > 1.2) return null;
    return [{ x: fx, z: fz }, { x: S20.ax + S20.nx * 1.5, z: S20.az + S20.nz * 1.5 }, { x: sp.x, z: sp.z }];
  }
  const S20_Q = [[-0.5, 0, 0], [0.5, 0, 0], [0.5, 1, 1], [-0.5, 1, 1]];
  function s20Mesh() {
    if (S20.mesh) return S20.mesh;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(5 * 6 * 3), 3));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#94724A', roughness: 1, flatShading: true, side: THREE.DoubleSide }));
    m.name = 'site20-ramp'; m.frustumCulled = false; m.visible = false; m.castShadow = false; m.receiveShadow = true; scene.add(m); S20.mesh = m; return m;
  }
  function s20Shape() {
    const m = s20Mesh(), P = m.geometry.attributes.position.array, w = S20.w, Lr = S20.Lr, yb = S20.base - 2.6;
    const pt = (q, ss, y) => [S20.ax + S20.ux * q - S20.nx * ss, y, S20.az + S20.uz * q - S20.nz * ss];
    const A = pt(-w / 2, 0, S20.topE), B = pt(w / 2, 0, S20.topE), C = pt(w / 2, Lr, S20.base), D = pt(-w / 2, Lr, S20.base);
    const A2 = pt(-w / 2, 0, yb), B2 = pt(w / 2, 0, yb), C2 = pt(w / 2, Lr, yb), D2 = pt(-w / 2, Lr, yb);
    const quads = [[A, B, C, D], [A, D, D2, A2], [B, C, C2, B2], [D, C, C2, D2], [A, B, B2, A2]];
    let k = 0; for (const [a, b, c, d] of quads) for (const v of [a, b, c, a, c, d]) { P[k++] = v[0]; P[k++] = v[1]; P[k++] = v[2]; }
    m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
    m.visible = true; S20.dirty = false;
  }
  function s20Refresh() { const st = ST.wall; return (S20.act = !!(TWD.twin && TWD.site === 'wall' && st && st.status === 'building' && st.group.visible && st.disp >= FOUND)); }
  /** each frame: whether plan A is on; twice a second the ramp's place and height from the working slot */
  function s20Tick(dt) {
    const st = ST.wall, was = S20.act; s20Refresh();
    if (!S20.act) { if (S20.on) { S20.on = false; if (S20.mesh) S20.mesh.visible = false; } return; }
    if (!was) S20.t = 0;
    if ((S20.t -= dt) <= 0) {
      S20.t = 0.5;
      const s = nextSlot('wall'), lv = s ? s.y - s.h / 2 : 0;
      if (!s || lv < S20_MIN) { if (S20.on) { S20.on = false; if (S20.mesh) S20.mesh.visible = false; } }
      else {
        const [ux, uz] = slotTangent('wall', s), nx = s.n[0], nz = s.n[1], tx = -nz, tz = nx;   // (tx, tz: the width's axis)
        const okAt = (mx, mz) => s20Band(mx + nx * 3 + tx * 3.4, mz + nz * 3 + tz * 3.4) && s20Band(mx + nx * 3 - tx * 3.4, mz + nz * 3 - tz * 3.4) && s20Band(mx + nx * 5, mz + nz * 5);
        const hx = hero.x, hz = hero.z;
        const near = S20.on && (() => { const dx = hx - S20.ax, dz = hz - S20.az, ss = -(dx * S20.nx + dz * S20.nz), q = dx * S20.ux + dz * S20.uz; return ss > -7 && ss < S20.Lr + 4 && Math.abs(q) < S20.w / 2 + 3; })();
        const keep = S20.on && S20.nx === nx && S20.nz === nz && Math.abs((s.face[0] - S20.ax) * tx + (s.face[2] - S20.az) * tz) < 16;
        if (!keep && !near) {
          let best = null; for (const d of [-10, 10, -16, 16]) { const mx = s.face[0] - nx * S20_THICK - ux * d, mz = s.face[2] - nz * S20_THICK - uz * d; if (okAt(mx, mz)) { best = [mx, mz]; break; } }
          if (best) { S20.ax = best[0]; S20.az = best[1]; S20.nx = nx; S20.nz = nz; S20.ux = tx; S20.uz = tz; S20.on = true; S20.dirty = true; S20.fresh = true; }
          else { S20.on = false; if (S20.mesh) S20.mesh.visible = false; }
        }
        if (S20.on) {
          const o = S20.on; S20.on = false;
          const top = Math.max(lv, shownTop('wall', S20.ax + S20.nx * 1.0, S20.az + S20.nz * 1.0, st.top, 0));
          let Lr = 12, base = 0; for (let k = 0; k < 3; k++) { base = groundAt(S20.ax - S20.nx * Lr, S20.az - S20.nz * Lr); Lr = Math.max(4, (top - base) / S20.SL); }
          S20.on = o; S20.top = top; S20.base = base;
          if (S20.fresh || S20.topE < 0.01) { S20.topE = top; S20.fresh = false; S20.dirty = true; }
        }
      }
    }
    if (S20.on) {
      const dt0 = S20.top - S20.topE;
      if (Math.abs(dt0) > 0.005) { S20.topE += Math.sign(dt0) * Math.min(Math.abs(dt0), dt * 6); S20.dirty = true; }
      S20.Lr = Math.max(4, (S20.topE - S20.base) / S20.SL);
      if (S20.dirty) s20Shape();
    }
  }
  // ── /site20 ──
  function standSide(st, s, out) {
    const nx = s.n[0], nz = s.n[1];
    // ── stages21 ── (the owner, 8.10: "בשלב העזרת נשים השחקן בתוך הקיר"; the kid run at the Ezrat Nashim: his banker stood at z −71.5, 4 amot out
    // from the chambers' north face — inside the DONE wall's ring (−73.5…−67.5), the camera's every bearing blocked by its body) a stand that falls
    // in the finished wall's ring is taken on the face's other side — in the chamber, on the court's floor, looking out at the stone
    if (st.id !== 'wall' && out > 0 && ST.wall && ST.wall.status === 'done' && s20Band(s.face[0] + nx * out, s.face[2] + nz * out) && !s20Band(s.face[0] - nx * out, s.face[2] - nz * out)) return [-nx, -nz];
    // ── /stages21 ──
    if (st.id !== 'ulam' || out <= 0) return [nx, nz];   // (only the Ulam: elsewhere the other rect is open ground — the kevesh, a gallery)
    const x = s.face[0] + nx * out, z = s.face[2] + nz * out;
    return x > -92.5 && x < -76 && Math.abs(z) < 50.5 ? [-nx, -nz] : [nx, nz];   // (its walls and hall, temple.js 179–187)
  }
  // a camera pose on the working front: outside the face, a little behind the laid stones, looking along the course
  function frontView(id, dist = 26) {
    const s = nextSlot(id); if (!s) return null;
    const [nx, nz] = s.n, tx = -nz, tz = nx, D = clamp(+dist || 26, 8, 120);
    const t = [s.face[0] + tx * D * 0.12, s.y - 0.5, s.face[2] + tz * D * 0.12];
    return { p: [s.face[0] + nx * D - tx * D * 0.42, s.y + D * 0.42, s.face[2] + nz * D - tz * D * 0.42], t };
  }
  // liftStone: the crane sets the working front's next stone (the crane's animation lands in craneLift; a fallback timer here)
  const lifts = [];
  function liftStone(id, o = {}) {
    { const p = caLiftNow(id, o); if (p) return p; }   // ── crafta19 ── (the key stone he just set on the crane: counted where it lies) ── /crafta19 ──
    const st = ST[id]; if (!st || st.status !== 'building') return Promise.resolve(false);
    const L = layout(st); if (L.kind !== 'cast' && st.disp < FOUND) return Promise.resolve(false);
    const i = nextWorkIdx(L); if (i < 0) return Promise.resolve(false);
    const b = L.blocks[L.order[i]];
    return new Promise((resolve) => {
      lifts.push({ st, b, i, t: 0, dur: clamp((+o.ms || 4200) / 1000, 0.3, 12), great: !!o.great, resolve });
    });
  }
  function liftLand(it) {
    const st = it.st, L = st.lay;
    // ── flow10 ── the Mount: the player's stone stays where the crane set it. The game's count is block-linear and the Mount's
    // course 0 holds every deep row, so the east face's next slot in the bay lies up to ≈ 3 stones ahead of the count: the
    // stone waits as a set stone of its own (L.pend, drawn with the site's props) until the count reveals it — no jump of the
    // count ahead of the game (its next sync took it back: the stone vanished and the crane set it again)
    if (st === ST.har && L.kind !== 'cast') {
      const s = slotOf(it.b, true);
      if (!it.great && it.i >= L.n) (L.pend || (L.pend = [])).push({ g: it.i, x: s.x, y: s.y, z: s.z, w: s.w * 0.98, h: s.h * 0.97, d: s.d, yaw: s.yaw });
      L.pendTop = Math.max(L.pendTop ?? -1, it.i); L.nwc = null; propsDirty = true; workDirty = true;
      dustBurst(s.face[0], s.y - s.h * 0.5, s.face[2], 6, 3, 1.6, 0.9);
      st.U.uF.value.x = 1; st.glowBoost = 1;
      shake.t = 0.18; shake.amp = 0.12;
      it.resolve({ course: it.b.c, index: it.b.j, stones: Math.max(L.n, it.i + 1) });
      return;
    }
    const n = Math.max(L.n, it.i + 1);
    st.target = st.disp = FOUND + (1 - FOUND) * n / L.N;
    const p0 = L.n; stonesTo(st, n); stoneFX(st, p0, L.n);
    st.U.uF.value.x = 1; st.glowBoost = 1;
    shake.t = 0.18; shake.amp = 0.12;
    it.resolve({ course: it.b.c, index: it.b.j, stones: n });
  }
  function liftsUpdate(dt) {
    for (let k = lifts.length - 1; k >= 0; k--) {
      const it = lifts[k];
      if (it.st.status !== 'building') { lifts.splice(k, 1); if (crane.lift && crane.lift.it === it) crane.lift = null; it.resolve(false); }
    }
    if (crane.lift || !lifts.length) return;
    const it = lifts[0];
    if (crane.st !== it.st) { cranePref = it.st.id; craneAssign(); }
    if (crane.st !== it.st) { lifts.shift(); liftLand(it); return; }   // (no crane there: set at once)
    // the stone may have been set meanwhile (setWork): lift the working front's next one
    const L = it.st.lay, i = nextWorkIdx(L);
    if (i < 0) { lifts.shift(); it.resolve(false); return; }
    it.i = i; it.b = L.blocks[L.order[i]];
    lifts.shift(); it.onCrane = true;
    craneLiftStart(it);
  }
  /** ── site9 ── (DESIGN8B M11, the owner's note "חצוב את אבן הפינה") the key stone the player hewed in the quarry game
   *  arrives: an ox cart brings the block down the road to the site's stock pile (crews.js keyCart, attached by main.js
   *  `// ── site9 ──`), it is unloaded onto the pile, and the crane sets it in the working front's next slot (liftStone,
   *  `great` by default: a stone proud of the face). → Promise<{ course, index, stones } | false> as it lands, ≈ 12–15 s.
   *  Always resolves: no cart → the crane lifts at once; the cart held up → the crane lifts after 22 s of the world's time
   *  (or 120 s of real time); `false` when the stage is not building. o = { what: 'corner' | …, great, ms, camera = true }:
   *  the camera holds one shot along the cart's lane (the cart, the pile, the crane, the slot) until it lands, then the
   *  site's working frame (focus) */
  function deliverKeyStone(id, o = {}) {
    const st = ST[id]; if (!st || st.status !== 'building') return Promise.resolve(false);
    o = o && typeof o === 'object' ? o : {};
    const great = o.great !== undefined ? !!o.great : true, ms = +o.ms || 5200;
    if (st.disp < FOUND) return liftStone(id, { great, ms });
    if (crane.st !== st) { cranePref = id; craneAssign(); }
    if (typeof api.keyCart !== 'function' || crane.st !== st) return liftStone(id, { great, ms });
    const [px, pz] = pileOf(st), fx = crane.fwd.x, fz = crane.fwd.y;
    // the road in: along the pile's long side (across the crane's reach), from the quarry's side; the cart stops beside the pile,
    // the block is set down on it, and the cart drives on
    // (a lane beside the stock, 4.5 amot farther from the face than the pile: clear of the builder's banker and the dressing
    //  yard, which stand on the pile's own line)
    let ux = fz, uz = -fx; if (ux * (QX - px) + uz * (QZ - pz) < 0) { ux = -ux; uz = -uz; }
    const tx = px - fx * 4.5, tz = pz - fz * 4.5;
    const from = [tx + ux * 30, tz + uz * 30], to = [tx, tz], beyond = [tx - ux * 34, tz - uz * 34];
    const ready = api.keyCart(from, to, beyond);
    // the camera (QA9 16:03: on the merge the player did not see the beat): ONE shot along the cart's lane from the quarry's
    // side — the cart with the block coming down the lane, the pile, the crane and the slot beyond — held until the stone
    // lands, then back to the site's working frame (the game holds its own camera meanwhile)
    const cam = o.camera !== false && typeof ctx.flyToPos === 'function';
    if (cam) {
      const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
      const cx = px + fx * 4 + ux * 8, cz = pz + fz * 4 + uz * 8, cy = groundAt(cx, cz) + 3;
      const a = Math.atan2(uz, ux) / DEG, ai = Math.atan2(-fz, -fx) / DEG, da = ((ai - a + 540) % 360) - 180;
      scPos(cx, cy, cz, portrait ? 70 : 52, a + Math.sign(da || 1) * 25, 36, scP);
      ctx.flyToPos(tmpV3a.set(scP[0], scP[1], scP[2]), tmpV3b.set(cx, cy, cz), 1100);
    }
    return new Promise((resolve) => {
      let done = false;
      const go = () => {
        if (done) return; done = true; if (keyWait && keyWait.go === go) keyWait = null; clearTimeout(timer);
        if (st.stock !== undefined) { st.stock = Math.min(99, st.stock + 1); propsDirty = true; }
        // (DESIGN9 16:22: then CAM.SLOT on the slot — 40 amot, el 16°, from the hill's side turned past the crane's legs — until
        //  it lands + 1 s, then the site's frame)
        const sl = cam ? nextSlot(id) : null;
        if (sl && id === 'har' && typeof ctx.flyToPos === 'function') {
          // ── flow10 ── (BRIEF10: "the corner stone seen landing on the hook") at the Mount the whole lift in one steady frame —
          // the stock 12.6 amot behind the slot, the crane, the hook at the top of its swing (≈ 20 amot up) and the slot (CAM.SLOT
          // at 40 amot, el 16°, lost the block above the frame)
          const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8;
          // ── site11 ── (PRODUCER11 N64: at t18 "no stone on the hook that I can see", he at the frame's bottom corner) a little
          // higher and closer: the block on the hook seen over the laid course, him ≥ 80 px
          const nx = sl.n[0], nz = sl.n[1], tx = sl.face[0] - nx * 7, tz = sl.face[2] - nz * 7, ty = sl.y + 6;
          // (from the hill's side over the bay, turned 32° along the face — as the bay's frame, centred on the lift: from
          //  along the face, the camera stood in the bay's end wall; by touch the cut face filled half the frame)
          const aIn = Math.atan2(-nz, -nx) / DEG, d = portrait ? 56 : 44, e0 = 38;
          const cost = (c, a) => (c ? Math.abs(c.az - a) + 2.2 * (c.el - e0) + (c.blocked ? 500 : 0) : 1e9);
          const ca = clearView(tx, ty, tz, d, aIn + 32, e0), cb = clearView(tx, ty, tz, d, aIn - 32, e0);
          const c = (cost(ca, aIn + 32) <= cost(cb, aIn - 32) ? ca : cb) || { az: aIn + 32, el: e0, dist: d };
          scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
          ctx.flyToPos(tmpV3a.set(scP[0], scP[1], scP[2]), tmpV3b.set(tx, ty, tz), 1200);
        } else if (sl && typeof ctx.flyToPos === 'function') {
          const portrait = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8, aIn = Math.atan2(-sl.n[1], -sl.n[0]) / DEG;
          const tx = sl.face[0], ty = sl.y + sl.h * 0.5 + 1, tz = sl.face[2];
          const c = clearView(tx, ty, tz, portrait ? 40 : 30, aIn + 28, 16) || { az: aIn + 28, el: 16, dist: portrait ? 40 : 30 };
          scPos(tx, ty, tz, c.dist, c.az, c.el, scP);
          ctx.flyToPos(tmpV3a.set(scP[0], scP[1], scP[2]), tmpV3b.set(tx, ty, tz), 1200);
        }
        liftStone(id, { great, ms }).then((r) => { if (cam) setTimeout(() => { if (st.status === 'building') focus(id, 1300); }, 1000); resolve(r); }, () => resolve(false));
      };
      const timer = setTimeout(go, 120000);
      if (keyWait) keyWait.go(); keyWait = { t: 0, go, st };
      Promise.resolve(ready).then(go, go);
    });
  }
  // ── site9 ── the stock cart: the same ox cart (two rough blocks on its bed) brings a segment's stones to the pile
  function stockCart(st, to) {
    const [px, pz] = pileOf(st), fx = crane.fwd.x, fz = crane.fwd.y;
    let ux = fz, uz = -fx; if (ux * (QX - px) + uz * (QZ - pz) < 0) { ux = -ux; uz = -uz; }
    const tx = px - fx * 4.5, tz = pz - fz * 4.5;
    const hold = stockHold = { st, to, t: 0 };
    const done = () => { if (stockHold !== hold) return; stockHold = null; st.stock = hold.to; propsDirty = true; dustBurst(px, groundAt(px, pz) + 0.5, pz, 10, 5, 3, 1.2); };
    hold.done = done;
    Promise.resolve(api.keyCart([tx + ux * 30, tz + uz * 30], [tx, tz], [tx - ux * 34, tz - uz * 34], 'stone')).then(done, done);
  }
  function keyWaitUpdate(dt) {
    if (stockHold) { stockHold.t += dt; if (stockHold.t > 20 || stockHold.st.status !== 'building') stockHold.done(); }
    if (keyWait) { keyWait.t += dt; if (keyWait.t > 22) keyWait.go(); }
  }

  /* ── read-only views for the crews layer (wave 4, the CREWS agent's request; src/crews.js) ──
     crane(out?) → { site, x, y, z, carry } — the site the treadwheel crane serves and where its block hangs (carry: the block
       is on the hook), or null while it stands idle. Pass `out` to have it filled (no allocation per frame).
     scaffold(id) → { id, runs, lift, gap, rows, view, bottom, top, get shown, get status, level(run) } | null — the site's
       scaffold runs ([a, b, outward normal, y0, y1] on the building's faces), its lift and rows, the site's camera direction,
       and level(run): the height of the board below the rising masonry on that run (where stages.js stands its own masons). */
  function craneInfo(out) {
    if (!crane.st) return null;
    const o = out && typeof out === 'object' ? out : {};
    const b = crane.block.position;
    o.site = crane.st.id; o.carry = !!crane.block.visible; o.x = b.x; o.y = b.y; o.z = b.z;   // (the hook: where the block hangs)
    // ── site11 ── where it stands and faces (its tag-line men stand by it), and whether it is posed at the working front
    o.bx = crane.bx; o.bz = crane.bz; o.fx = crane.fwd.x; o.fz = crane.fwd.y; o.posed = !!(crane.st.posed || crane.st.harPosed) && !crane.glide;
    return o;
  }
  function scaffoldInfo(id) {
    const st = ST[id]; if (!st || !st.def.scaff || !st.def.scaff.runs) return null;
    const sc = st.def.scaff, v = st.def.view || { az: -25, el: 28 };
    return {
      id, runs: sc.runs.map((r) => [r[0].slice(), r[1].slice(), r[2].slice(), r[3], r[4]]), lift: sc.lift, gap: sc.gap || 5, rows: sc.rows || 2,
      view: { az: v.az, el: v.el }, bottom: st.bottom, top: st.top,
      get shown() { return st.disp; }, get status() { return st.status; },
      level: (run) => (Array.isArray(run) && run.length >= 5 ? scaffLevel(st, run) : null),
    };
  }

  // test / debug helpers
  // ── site14 ── the jobs in the building (WAVE14-BRIEF SITE14 #3; contract on bus/SITE14.md): a job's result stays in view.
  // jobReveal(id, kind, q, o) → { x, y, z, p, t, dur } | null · jobSpot(id, o) → a walkTo target · stoneMark(site, mark) ·
  // marks() · setOwned({ lamps, tools, machines, oxen }). Everything here draws through the props, the machines and the
  // stages' own materials (0 lasting draw calls), except the inscription and the marks' plates (+1 each, only where they are).
  const JOBS = { gilds: [], archT: -60.5, archY: -60.5, n: {}, goldH: {}, planks: {}, cols: 0, colT: 9, colAt: -1, lines: [], plaster: {}, tread: {}, letters: null, marks: [], owned: { lamps: 0, tools: 0, machines: 0, oxen: 0 } };
  const JOB_GOLD = { gates: [6, 50], ulam: [21.9, 95.4], heichal: [21.9, 111], kodesh: [21.9, 111], nikanor: [6, 50] };
  function jobSiteOf(o) {
    if (o && typeof o === 'object' && ST[o.site]) return o.site;
    let best = null; for (const st of list) if (st.status === 'building' && (!best || st.seq > best.seq)) best = st;
    return best ? best.id : 'har';
  }
  // a camera on (x, y, z) from his side of it, `dist` away, `el` degrees up
  function jobFrame(x, y, z, dist = 30, el = 22) {
    let a = Math.atan2(hero.x - x, hero.z - z); if (!Number.isFinite(a) || Math.hypot(hero.x - x, hero.z - z) < 1) a = 0.6;
    const e = el * DEG; return { p: [x + Math.sin(a) * Math.cos(e) * dist, y + Math.sin(e) * dist, z + Math.cos(a) * Math.cos(e) * dist], t: [x, y, z] };
  }
  const jobOut = (x, y, z, dur, dist, el) => ({ x, y, z, dur, ...jobFrame(x, y, z, dist, el) });
  // the crews' saw bench at a site (crews.js SITES[id].saw: [x, z, yaw]; main.js hands it over as stages.sawBench)
  function benchOf(id) { const b = crewsSawBench(id); return Array.isArray(b) && b.length >= 3 ? b : null; }
  // the royal Stoa's columns (main.js `royal`, the har group's second instanced set): the ones her jobs raised stand while the
  // Mount builds (a material of their own: the Mount's courses would cut them), the newest tilting up from the ground
  const colM4 = new THREE.Matrix4(), colQ = new THREE.Quaternion(), colV = new THREE.Vector3(), colS = new THREE.Vector3(), colE = new THREE.Euler();
  function colSync(dt) {
    const hs = ST.har; if (!COL.m || !hs) return;
    // (the Stoa's own columns rise with the Mount's last courses as before; hers stand on the platform's body as its courses show
    //  it, where the Stoa will stand, until the courses reach the Stoa's floor: then the Stoa's own take their places)
    const on = hs.status === 'building' && hs.group.visible && JOBS.cols > 0 && revealY(hs) < 0;
    if (!on) { if (COL.jm) COL.jm.visible = false; return; }
    if (!COL.jm) {
      const U = revealUniforms(); U.uY.value = 1e6; U.uC.value.set(0, 1, 0, 0);
      COL.jm = new THREE.InstancedMesh(COL.C.geo, buildMaterial(COL.C.mat, U, 10), COL.C.list.length);
      COL.jm.castShadow = true; COL.jm.receiveShadow = true; COL.jm.name = 'site14-columns'; COL.jm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      hs.group.add(COL.jm);
    }
    JOBS.colT += dt;
    const n = Math.min(JOBS.cols, COL.order.length);
    for (let k = 0; k < n; k++) {
      const [x, z] = COL.C.list[COL.order[k]], y = groundAt(x, z);
      // (the newest: hand over hand from the ground, a little sway, never a fall — pull.js)
      const u = k === n - 1 ? clamp(JOBS.colT / 2.6, 0, 1) : 1, tilt = (1 - easeOut(u)) * 1.45 + Math.sin(u * 9) * 0.05 * (1 - u);
      colE.set(-tilt, 0, 0); colQ.setFromEuler(colE); colV.set(x, y - 0.2, z); colS.set(COL.C.sxz, COL.C.sy, COL.C.sxz); colM4.compose(colV, colQ, colS); COL.jm.setMatrixAt(k, colM4);
    }
    COL.jm.count = n; COL.jm.visible = true; COL.jm.instanceMatrix.needsUpdate = true; COL.jm.computeBoundingSphere();
  }
  // the treadwheel: the crews' crane at the site walks its wheel fast and hoists the job's stone (machinesUpdate's cycle)
  function jobTread(site) {
    const m = MK.sites[site]; if (!m || !m.crane) return null;
    m.t = 0; m.boost = 7;
    const wx = m.bx - Math.sin(m.yaw) * 1.6, wz = m.bz - Math.cos(m.yaw) * 1.6, wy = m.by + 5.5, sx = Math.cos(m.yaw), sz = -Math.sin(m.yaw);
    return { x: wx, y: wy, z: wz, dur: 7, p: [wx + sx * 24 - Math.sin(m.yaw) * 8, wy + 8, wz + sz * 24 - Math.cos(m.yaw) * 8], t: [wx, wy + 2, wz] };
  }
  const JOB = {
    gold(site, q) {
      const g = JOB_GOLD[site], st = ST[site]; if (!g || !st) return null;
      const n = (JOBS.n[site + '|gold'] || 0);
      JOBS.goldH[site] = Math.min(g[1], g[0] + (n + 0.5 + 0.5 * q) * (g[1] - g[0]) / 6);
      const s = nextSlot(site), y = clamp(Math.min(revealY(st), JOBS.goldH[site]) - 2, st.base + 1, st.top);
      const x = s ? s.face[0] : (st.fb.x0 + st.fb.x1) / 2, z = s ? s.face[2] : st.fb.z1;
      // (the House's gold is high up — its bands at 96.8 and 109.6 — so on its courses her gold is a band of leaf along the
      //  course just laid, on the face she worked, until the finish's own gold takes over)
      if (s && (GOLDFIN.has(site) || site === 'nikanor')) {
        const [ux, uz] = slotTangent(site, s), gy = Math.max(st.base + 0.9, revealY(st) - 1.2);
        JOBS.gilds.push({ site, x: s.face[0] + s.n[0] * 0.08, y: gy, z: s.face[2] + s.n[1] * 0.08, ux, uz, len: 18 + 6 * q, hex: site === 'nikanor' ? '#C9873E' : '#EBC45A' }); propsDirty = true;
        const cx = s.face[0] + ux * 9, cz = s.face[2] + uz * 9;
        for (let k = 0; k < 4; k++) setTimeout(() => sparkBurst(cx + ux * (k * 3 - 4), gy + 0.4, cz + uz * (k * 3 - 4), 16 + Math.round(10 * q), 3, 5), k * 260);
        return { x: cx, y: gy, z: cz, dur: 2.4, p: [cx + s.n[0] * 26, gy + 9, cz + s.n[1] * 26], t: [cx, gy, cz] };
      }
      for (let k = 0; k < 4; k++) setTimeout(() => sparkBurst(x + (R() - 0.5) * 8, y + R() * 3, z + (R() - 0.5) * 8, 14 + Math.round(10 * q), 5, 7), k * 260);
      return jobOut(x, y, z, 2.4, 34, 16);
    },
    bronze(site, q) { return JOB.gold(site === 'kiyor' ? 'nikanor' : site, q); },
    saw(site) {
      const b = benchOf(site) || benchOf('wall'); if (!b) return null;
      JOBS.planks[site] = Math.min(12, (JOBS.planks[site] || 0) + 1); propsDirty = true;
      const [bx, bz, yaw] = b, c = Math.cos(yaw), s = Math.sin(yaw), x = bx + 5.2 * c, z = bz - 5.2 * s, g = groundAt(x, z);
      dustBurst(x, g + 0.6, z, 8, 2.4, 2, 1.4);
      return { x, y: g + 0.6, z, dur: 1.6, p: [x + 6 * c + 9 * s, g + 11, z - 6 * s + 9 * c], t: [x - 1.5 * c, g + 0.6, z + 1.5 * s] };
    },
    column() {
      if (!COL.m) return null;
      JOBS.cols = Math.min(COL.order.length, JOBS.cols + 1); JOBS.colT = 0;
      const [x, z] = COL.C.list[COL.order[JOBS.cols - 1]], y = groundAt(x, z);
      setTimeout(() => dustBurst(x, y + 0.6, z, 14, 5, 4, 2), 2500);
      return jobOut(x, y + 9, z, 2.8, 46, 14);
    },
    line(site) {
      const s = nextSlot(site), st = ST[site]; if (!s || !st) return null;
      const [ux, uz] = slotTangent(site, s), L = st.lay;
      JOBS.lines = JOBS.lines.filter((l) => l.site !== site);
      // (snapped on the laid course's top, where this course's stones will stand: the bottom of the next slot)
      JOBS.lines.push({ site, cur: L ? L.cur : 0, x: s.face[0] - s.n[0] * 0.25, y: s.y - s.h / 2 + 0.03, z: s.face[2] - s.n[1] * 0.25, ux, uz, len: 26 });
      propsDirty = true;
      return jobOut(s.face[0] + ux * 6, s.y - s.h / 2, s.face[2] + uz * 6, 1.2, 22, 30);
    },
    tread(site) { return TW.clearT > 0 ? null : jobTread(site); },   // ── site15 ── (the operator just set the stones himself in the world: no reveal on the crews' wheel)
    crane(site) { return jobTread(site); },
    plaster(site) {
      const st = ST[site]; if (!st || !FIELD.has(site)) return null;
      const k = JOBS.plaster[site] = Math.min(1, (JOBS.plaster[site] || 0) + 0.25);
      const m = st.cache.plaster; if (m && m.color) { if (!m.userData.c0) m.userData.c0 = m.color.clone(); m.color.copy(m.userData.c0).lerp(new THREE.Color('#FFFDF5'), k * 0.85); }
      const x = (st.fb.x0 + st.fb.x1) / 2, z = st.fb.z0, y = Math.min(revealY(st), st.top);
      dustBurst(x, y, z, 10, 5, 6, 2);
      return jobOut(x, y, z, 1.4, 34, 22);
    },
    letters(site, q) { return jobLetters(q); },
    // the cedar rafts reach the site: two more cedar beams on the sawyers' pile (רפסודות הארזים; עזרא ג, ז)
    rafts(site, q) { const r = JOB.saw(site, q); if (r) JOBS.planks[site] = Math.min(12, JOBS.planks[site] + 1); return r; },
    // Robinson's Arch at the Mount's south-west corner (mount.js 109–125): each arch job lays the next part, from the pier up
    // (the voussoirs from both haunches, the keystone at −5 last, then the deck), eased stone by stone over ≈ 3 s
    arch(site, q) {
      if (!ST.har || isDone('har')) return null;
      const n = JOBS.archN = (JOBS.archN || 0) + 1;
      JOBS.archT = Math.min(2.2, -60.5 + n * (31.5 + 4 * q));
      const y = clamp(JOBS.archT - 6, -55, -4);
      setTimeout(() => dustBurst(-315, y, 363, 12, 6, 6, 2), 2200);
      return { x: -315, y, z: 348, dur: 3, p: [-366, 2, 296], t: [-318, -28, 360] };
    },
  };
  function jobReveal(id, kind, q, o) {
    const site = jobSiteOf(o), f = JOB[id]; if (!f) return null;
    q = clamp(+q || 0, 0, 1);
    let r = null; try { r = f(site, q, o || {}); } catch (e) { console.warn('[jobReveal]', id, e); r = null; }
    if (r) JOBS.n[site + '|' + id] = (JOBS.n[site + '|' + id] || 0) + 1;
    return r;
  }
  // where he stands for a job (hero.walkTo it): the saw's bench (the crews' sawA, a crewman at sawB), the Stoa's column foot,
  // the course's end for the line, the treadwheel's foot, the gold's façade point; else the site's own dress spot
  function jobSpot(id, o) {
    const site = jobSiteOf(o);
    if (id === 'saw') { const b = benchOf(site); if (b) { const [bx, bz, yaw] = b, c = Math.cos(yaw), s = Math.sin(yaw), x = bx + 0.9 * c - 1.62 * s, z = bz - 0.9 * s - 1.62 * c; return { x, y: groundAt(x, z), z, face: [bx + 0.9 * c, bz - 0.9 * s], key: 'saw' }; } }
    if (id === 'column' && COL.C) { const i = COL.order[Math.min(JOBS.cols, COL.order.length - 1)], [x, z] = COL.C.list[i]; return { x: x + 4, y: groundAt(x + 4, z - 9), z: z - 9, face: [x, z] }; }
    if (id === 'tread' && crane.st && crane.st.id === site && !crane.lift && crane.g.visible) { const P = treadWheelPoint(); return { x: P.x, y: P.y, z: P.z, face: P.face, key: 'tread' }; }   // ── site15 ── המנופאי
    if ((id === 'tread' || id === 'crane') && MK.sites[site] && MK.sites[site].bx !== undefined) { const m = MK.sites[site], x = m.bx - m.fx * 4 + m.fz * 3, z = m.bz - m.fz * 4 - m.fx * 3; return { x, y: groundAt(x, z), z, face: [m.bx, m.bz] }; }
    if (id === 'letters') { const x = -282, z = 384; return { x, y: groundAt(x, z), z, face: [-286, 388] }; }
    if (id === 'arch') { const x = -292, z = 352; return { x, y: groundAt(x, z), z, face: [-318, 362] }; }
    return workSpot(site, id === 'gold' || id === 'line' ? 'set' : 'dress');
  }
  // the job's props: the planks by the bench, the chalk line on the course, her lamps at the banker
  function jobProps(put, putA) {
    for (const id in JOBS.planks) {
      const st = ST[id], b = benchOf(id); if (!b || !st || st.status !== 'building') continue;
      // (beyond the beam's end, along it: the sawn planks stacked crosswise, three a layer)
      const [bx, bz, yaw] = b, c = Math.cos(yaw), s = Math.sin(yaw), px = bx + 5.2 * c, pz = bz - 5.2 * s, g = groundAt(px, pz);
      for (let k = 0; k < JOBS.planks[id]; k++) { const l = Math.floor(k / 3), j = k % 3; put(px + (j - 1) * 0.8 * c, g + 0.16 + l * 0.3, pz - (j - 1) * 0.8 * s, 0.7, 0.28, 5.2, yaw + Math.PI / 2 * 0, k % 2 ? '#B07A4A' : '#9C6A3F'); }
    }
    for (const l of JOBS.lines) {
      const st = ST[l.site]; if (!st || st.status !== 'building' || (st.lay && st.lay.cur !== l.cur)) continue;
      const yaw = Math.atan2(l.ux, l.uz);
      put(l.x + l.ux * l.len / 2, l.y, l.z + l.uz * l.len / 2, 0.06, 0.05, l.len, yaw, '#C0462E');
      for (const e of [0, l.len]) put(l.x + l.ux * e, l.y + 0.45, l.z + l.uz * e, 0.16, 1.0, 0.16, 0, '#6B4E31');
    }
    for (const g of JOBS.gilds) {
      const st = ST[g.site]; if (!st || st.status !== 'building' || st.phase === 'finish') continue;
      put(g.x + g.ux * g.len / 2, g.y, g.z + g.uz * g.len / 2, 0.06, 0.9, g.len, Math.atan2(g.ux, g.uz), g.hex);
    }
    const nL = JOBS.owned.lamps | 0;
    if (nL && wp.state && wp.state !== 'quarry' && hero.vis) {
      const c = Math.cos(wp.yaw), s = Math.sin(wp.yaw);
      for (let k = 0; k < nL; k++) { const lx = (-0.9 + k * 0.36) * HERO_S, lz = -0.62 * HERO_S, x = wp.x + lx * c + lz * s, z = wp.z - lx * s + lz * c; put(x, wp.y + 1.62 * HERO_S, z, 0.34, 0.13, 0.5, wp.yaw, '#A0623A'); }
    }
  }
  function jobsUpdate(dt) {
    colSync(dt); letPlace();
    // her lamps lit at dusk (three glows over the six; slots 3–5 of the glows)
    const nL = JOBS.owned.lamps | 0;
    for (let k = 0; k < 3; k++) {
      if (nL > k * 2 && nightK > 0.02 && wp.state && wp.state !== 'quarry' && hero.vis) {
        const c = Math.cos(wp.yaw), s = Math.sin(wp.yaw), lx = (-0.72 + k * 0.72) * HERO_S, lz = -0.62 * HERO_S;
        glows.set(3 + k, wp.x + lx * c + lz * s, wp.y + 1.8 * HERO_S, wp.z - lx * s + lz * c, 2.2, cLantern, 0.7 * nightK, 0.15);
      } else glows.off(3 + k);
    }
  }
  // ── the inscription "לבית התקיעה" (Mazar 1968; War 4.9.12), on the parapet stone at the south-west corner, traced by her
  const LET = { mesh: null, tex: null, q: 0 };
  function jobLetters(q) {
    LET.q = Math.max(LET.q, q);
    if (!LET.mesh) {
      const cvs = document.createElement('canvas'); cvs.width = 512; cvs.height = 184;
      LET.tex = new THREE.CanvasTexture(cvs); LET.tex.colorSpace = THREE.SRGBColorSpace;
      // (one draw call: no groups; the faces but the south one take a plain corner of the canvas)
      const g = new THREE.BoxGeometry(4.2, 1.5, 1.4), uv = g.attributes.uv; g.clearGroups();
      for (let i = 0; i < uv.count; i++) if (i < 16 || i > 19) uv.setXY(i, 0.01, 0.01);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: LET.tex, roughness: 0.88 }));
      m.castShadow = true; m.receiveShadow = true; m.name = 'site14-inscription';
      scene.add(m); LET.mesh = m;
    }
    const cv = LET.tex.image, x2 = cv.getContext('2d'), W2 = cv.width, H2 = cv.height;
    x2.fillStyle = '#D8CBAE'; x2.fillRect(0, 0, W2, H2);
    x2.font = `bold ${Math.round(H2 * 0.36)}px serif`; x2.textAlign = 'center'; x2.textBaseline = 'middle'; x2.direction = 'rtl';
    x2.fillStyle = `rgba(62, 44, 24, ${0.5 + 0.5 * LET.q})`; x2.fillText('לבית התקיעה לה[...]', W2 / 2, H2 * 0.54);
    LET.tex.needsUpdate = true;
    letPlace();
    const P = LET.mesh.position;
    sparkBurst(P.x, P.y + 0.6, P.z + 0.9, 18, 3, 4);
    return { x: P.x, y: P.y, z: P.z, dur: 2, p: [P.x - 2.5, P.y + 1.6, P.z + 8], t: [P.x, P.y, P.z] };
  }
  // (on the platform by the corner while the Mount builds, dressed and waiting; on the corner's top once its walls stand: the
  //  place of the trumpeting, War 4.9.12)
  function letPlace() {
    if (!LET.mesh) return;
    const up = isDone('har') || (ST.har && ST.har.status === 'building' && revealY(ST.har) >= 33);
    if (up) LET.mesh.position.set(-297.4, 32.78, 396.6);
    else { const x = -286, z = 388; LET.mesh.position.set(x, groundAt(x, z) + 0.78, z); }
    LET.mesh.visible = !!(isDone('har') || (ST.har && ST.har.status === 'building' && ST.har.group.visible));
  }
  // ── her mark (האבן שלי): the next stone the crane sets at the site carries it on its face; a plate per mark in one mesh (an atlas)
  const MRK = { mesh: null, tex: null, n: 0, max: 16, dirty: false };
  function stoneMark(site, mark) {
    const st = ST[site], s = nextSlot(site); if (!st || !s) return null;
    if (!MRK.mesh) {
      MRK.tex = canvasTex(512, (x2, S) => { x2.clearRect(0, 0, S, S); }, true);
      MRK.mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ map: MRK.tex, transparent: true, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }));
      MRK.mesh.name = 'site14-marks'; MRK.mesh.frustumCulled = false; scene.add(MRK.mesh);
    }
    const i = MRK.n % MRK.max; MRK.n++;
    const cv = MRK.tex.image, x2 = cv.getContext('2d'), T4 = cv.width / 4, ox = (i % 4) * T4, oy = Math.floor(i / 4) * T4;
    x2.clearRect(ox, oy, T4, T4);
    x2.strokeStyle = 'rgba(150, 40, 25, 0.95)'; x2.lineWidth = T4 * 0.07; x2.lineCap = x2.lineJoin = 'round';
    if (mark && typeof mark.getContext === 'function') x2.drawImage(mark, ox + T4 * 0.08, oy + T4 * 0.08, T4 * 0.84, T4 * 0.84);
    else for (const sk of (mark && mark.strokes) || []) { x2.beginPath(); sk.forEach(([u, v], k) => { const px = ox + T4 * (0.08 + 0.84 * clamp(+u || 0, 0, 1)), py = oy + T4 * (0.08 + 0.84 * clamp(+v || 0, 0, 1)); if (k) x2.lineTo(px, py); else x2.moveTo(px, py); }); x2.stroke(); }
    MRK.tex.needsUpdate = true;
    const rec = { n0: st.lay ? Math.max(0, st.lay.n) : 0, site, course: s.course, index: s.index, x: s.face[0] + s.n[0] * 0.04, y: s.y, z: s.face[2] + s.n[1] * 0.04, nx: s.n[0], nz: s.n[1], tile: i, shown: false };
    JOBS.marks = JOBS.marks.filter((m) => m.tile !== i); JOBS.marks.push(rec); MRK.dirty = true;
    return { course: rec.course, index: rec.index };
  }
  function marksUpdate() {
    if (!MRK.mesh) return;
    // (her stone is the next the crane sets there: shown once the site has laid one more than when she marked it)
    for (const m of JOBS.marks) { const L = ST[m.site] && ST[m.site].lay, sh = isDone(m.site) || !!(L && L.n > m.n0); if (sh !== m.shown) { m.shown = sh; MRK.dirty = true; } }
    if (!MRK.dirty) return; MRK.dirty = false;
    const P = [], UV = [], N = [];
    for (const m of JOBS.marks) {
      if (!m.shown) continue;
      // (t × up = n: the plate faces out of the stone; u runs along t, the viewer's right)
      const tx = m.nz, tz = -m.nx, w = 0.55, h = 0.4, u0 = (m.tile % 4) / 4, v0 = 1 - Math.floor(m.tile / 4) / 4, du = 0.25;
      const q = [[-w, -h, u0, v0 - du], [w, -h, u0 + du, v0 - du], [w, h, u0 + du, v0], [-w, h, u0, v0]];
      for (const k of [0, 1, 2, 0, 2, 3]) { const [a, b, u, v] = q[k]; P.push(m.x + tx * a, m.y + b, m.z + tz * a); UV.push(u, v); N.push(m.nx, 0, m.nz); }
    }
    const g = MRK.mesh.geometry; g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    MRK.mesh.visible = P.length > 0;
  }
  function setOwned(o) {
    if (!o || typeof o !== 'object') return { ...JOBS.owned };
    for (const k of ['lamps', 'tools', 'machines', 'oxen']) if (o[k] !== undefined) JOBS.owned[k] = clamp(Math.round(+o[k] || 0), 0, k === 'lamps' ? 6 : 3);
    propsDirty = true;
    return { ...JOBS.owned };
  }
  // ── /site14 ──
  // ── site15 ── the tasks' scenes (WAVE15-BRIEF SITE15; the contract on bus/SITE15.md). taskScene(stage, task, o) → Promise ·
  // taskMarks(list) · taskSpot(stage, task). A scene is a short script on the world's clock (taskUpdate, from update()): the
  // camera frames the spot (the world's own frames, fitted to K80 here — he ≥ 90 px asked, ≥ 80 read), the kohen WALKS there
  // (walkTo, the routes of v27 — never placed), the crews and the crane work, the building changes with dust and sparkle, and
  // the promise resolves with a screen point for the mentor's bubble. A tap on the canvas (after 1.2 s) or the host's end()
  // skips: the world snaps to the task's end state. Nothing here lasts per frame but the marks (the pins' own instances).
  const TS = { run: null, marks: [], seq: 0, tapOn: false, cS: null };
  const TS_KINDS = ['survey', 'dig', 'courses', 'finish', 'job', 'moment'];
  const TS_ACT = { line: 'measure', arch: 'tamp', F1: 'tamp', column: 'pull', tread: 'pull', crane: 'pull', saw: 'pull', wheel: 'pull', rafts: 'pull', gold: 'dress', plaster: 'tamp', bronze: 'dress', letters: 'dress', waves: 'pull' };
  const tsLog = (d) => { try { const L = globalThis.__GAME_LOG; if (Array.isArray(L)) L.push({ type: 'taskScene', d, t: Date.now() }); } catch (e) { /* tests only */ } };
  const tsLogical = (id, o) => (o && +o.n > 0 ? +o.n : PROJ[id] ? PROJ[id].C * PROJ[id].P : 0);   // the game's stones (PROJ C×P)
  /** the world's state of a stage, as syncSite's setWork would say it → { phase, stones, finish, course, set } */
  function tsState(st, o) {
    if (!st) return { phase: null, stones: 0, finish: 0, course: 0, set: 0 };
    const L = st.lay || layout(st), n = Math.max(0, L.n), real = L.N || 1, lg = tsLogical(st.id, o);
    return { phase: st.status === 'done' ? 'done' : st.status !== 'building' ? null : st.phase || (n ? 'courses' : 'foundation'), stones: n, finish: st.finish || 0, course: L.cur, set: Math.round(n / real * lg) };
  }
  /** the task's end state in WORLD units (META15's own `o.world` first) → { phase, stones, finish } | null (a job, the moment) */
  function tsEnd(st, T, o) {
    const w = o && o.world && typeof o.world === 'object' ? o.world : null;
    if (w && w.stones !== undefined && typeof w.phase === 'string') return { phase: w.phase, stones: Math.round(+w.stones || 0), finish: clamp(+w.finish || 0, 0, 1) };
    const L = st.lay || layout(st), real = L.N, id = st.id, n = tsLogical(id, o), cur = Math.max(0, L.n);
    if (T.kind === 'survey') return { phase: 'dig', stones: 0, finish: 0 };
    if (T.kind === 'dig') return { phase: 'foundation', stones: 0, finish: 0 };
    if (T.kind === 'courses') { const to = Math.max(0, +T.to || 0), s = Math.max(cur, n > 0 ? Math.min(real, Math.round(to / n * real)) : cur); return { phase: s > 0 ? 'courses' : 'foundation', stones: s, finish: 0 }; }
    if (T.kind === 'finish') { const F = PROJ[id] && PROJ[id].fin ? Math.max(1, PROJ[id].fin.length) : FIN_KIND[id] ? FIN_KIND[id].length : 1, f = Math.max(0, Math.floor(+(T.f ?? T.step) || 0)), c = Math.max(1, Math.floor(+T.n || 1)); return { phase: 'finish', stones: real, finish: clamp((f + c) / F, 0, 1) }; }
    if (T.kind === 'job' && +T.to > (+T.from || 0)) { const to = +T.to, s = Math.max(cur, n > 0 ? Math.min(real, Math.max(1, Math.round(to / n * real))) : cur); return { phase: 'courses', stones: s, finish: 0 }; }   // (the key stone: a job that sets stones)
    return null;
  }
  /** a point on screen from a camera at p looking at t (the host's lens: fov, zoom) → { x, y } | null (behind it) */
  function tsProj(p, t, x, y, z) {
    const W0 = typeof innerWidth === 'number' && innerWidth > 0 ? innerWidth : 390, H0 = typeof innerHeight === 'number' && innerHeight > 0 ? innerHeight : 844;
    let fx = t[0] - p[0], fy = t[1] - p[1], fz = t[2] - p[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
    let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
    const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
    const qx = x - p[0], qy = y - p[1], qz = z - p[2], cz = qx * fx + qy * fy + qz * fz; if (cz <= 0.5) return null;
    const LZ = Math.tan((camera.fov || 32) * DEG / 2) / (camera.zoom || 1);
    return { x: (0.5 + (qx * rx + qz * rz) / (cz * LZ * (W0 / H0)) / 2) * W0, y: (0.5 - (qx * ux + qy * uy + qz * uz) / (cz * LZ) / 2) * H0, W0, H0, r: [rx, rz] };
  }
  /** his height on screen (K80's 3.6 amot, feet → head) and his middle, from a camera at p looking at t → { px, x, y } | null */
  function tsHero(p, t, at) {
    const a = tsProj(p, t, at.x, at.y, at.z), b = tsProj(p, t, at.x, at.y + 3.6, at.z);
    return a && b ? { px: Math.abs(a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, top: Math.min(a.y, b.y), W0: a.W0, H0: a.H0, r: a.r } : null;
  }
  /** a frame { p, t } fitted to him at `at` (STAGING rule 1 / K80): in along its own ray until he is ≥ 90 px (never nearer than
   *  22 amot to its target), then panned toward him while he stands outside the safe frame (the top bar, the bottom HUD and the
   *  mentor's bubble) → { p, t, px } */
  function tsFit(p, t, at, safe, also = null, soft = false) {
    const out = { p: p.slice(), t: t.slice(), px: 0 };
    if (!at || !Number.isFinite(at.x) || !Number.isFinite(at.y)) return out;
    const top = safe && +safe.top > 0 ? +safe.top : 150, bot = safe && +safe.bottom > 0 ? +safe.bottom : 250;
    const d0 = Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]);
    const cam = (k, u, w = 0) => { const s0 = tsHero(p, t, at), rx = s0 ? s0.r[0] : 0, rz = s0 ? s0.r[1] : 0;
      const tt = [t[0] + (at.x - t[0]) * u + rx * w, t[1] + (at.y + 1.8 - t[1]) * u, t[2] + (at.z - t[2]) * u + rz * w]; return { p: [tt[0] + (p[0] - t[0]) * k, tt[1] + (p[1] - t[1]) * k, tt[2] + (p[2] - t[2]) * k], t: tt }; };
    // (`also`: points that stay in the frame — him where he walks from — so the pull-in stops before they leave it)
    const alsoIn = (c) => !also || also.every((a) => { const q = tsProj(c.p, c.t, a.x, a.y, a.z); return q && q.x > 30 && q.x < q.W0 - 30 && q.y > top && q.y < q.H0 - bot; });
    let k = 1, s = tsHero(p, t, at);
    // (soft: the slot and the crane's hook may stop the pull-in only once he is ≥ 80 px — the game's fitHero rule)
    while (s && s.px < 90 && d0 * k * 0.94 >= 22) { const c = cam(k * 0.94, 0), s2 = tsHero(c.p, c.t, at); if (!s2 || ((!soft || s.px >= 80) && !alsoIn(c))) break; k *= 0.94; s = s2; }
    const ok = (q) => q && q.y > top + 30 && q.y < q.H0 - bot - 10 && q.x > 70 && q.x < q.W0 - 70;
    let u = 0;
    while (s && !ok(s) && u < 1) { u = Math.min(1, u + 0.15); const c = cam(k, u); if (!soft && !alsoIn(c)) break; s = tsHero(c.p, c.t, at); }
    // (both in: the frame's target between him and the spot when he walks from afar)
    if (also && also.length && u === 0 && !soft) { for (const f of [0.5, 0.35, 0.2]) { const a = also[0], t2 = [t[0] + (a.x - t[0]) * f, t[1] + (a.y + 1.8 - t[1]) * f, t[2] + (a.z - t[2]) * f], c = { p: [t2[0] + (p[0] - t[0]) * k, t2[1] + (p[1] - t[1]) * k, t2[2] + (p[2] - t[2]) * k], t: t2 }; const s2 = tsHero(c.p, c.t, at); if (s2 && ok(s2) && alsoIn(c)) { out.p = c.p; out.t = c.t; out.px = Math.round(s2.px); return out; } } }
    const c = cam(k, u);
    out.p = c.p; out.t = c.t; out.px = s ? Math.round(s.px) : 0;
    return out;
  }
  const tsFly = (R, p, t, ms = 1100, also = null, soft = false) => { if (!Array.isArray(p) || !Array.isArray(t)) return false; const f = tsFit(p, t, R.spot || R.at3(), R.o.safe, also, soft); R.frame = f; R.px = f.px; return flyTo(f.p, f.t, ms); };
  /** the work around him that stays in a courses' frame: the next slot's face and the crane's hook (soft: once he is ≥ 80 px) */
  function tsWorkAlso(id) {
    const out = [], s = nextSlot(id);
    if (s && Array.isArray(s.face)) out.push({ x: s.face[0], y: s.y + (s.h || 1) / 2 + 0.3, z: s.face[2] });
    if (crane.st && crane.st.id === id && crane.g.visible) out.push({ x: crane.bx, y: (crane.byFix !== null ? crane.byFix : groundAt(crane.bx, crane.bz)) + 6, z: crane.bz });
    return out;
  }
  const tsPlay = (R, name) => { const f = R.sfx; if (!f) return; try { f(name); } catch (e) { /* the host's */ } };
  /** where the task happens in the world → { x, y, z } | null (the markers, a pointer on screen) */
  function taskSpot(stage, task) {
    const st = ST[stage]; if (!st) return null;
    const T = task && task.do && typeof task.do === 'object' ? task.do : task && typeof task === 'object' ? task : {};
    const k = T.kind;
    let w = null;
    try {
      if (k === 'job') w = jobSpot(T.job, { site: stage });
      else if (k === 'moment') w = workSpot(stage, 'moment');
      else if (k === 'survey') w = workSpot(stage, 'survey');
      else if (k === 'dig') w = stage === 'har' ? (() => { const i = heroRock(); return i >= 0 ? { x: bSt[i].x, z: bSt[i].z } : null; })() : workSpot(stage, 'set');
      else if (k === 'courses') { const s = nextSlot(stage); w = s ? { x: s.face[0], y: s.y + s.h, z: s.face[2] } : workSpot(stage, 'dress'); }
      else if (k === 'finish') w = workSpot(stage, 'set');
    } catch (e) { w = null; }
    if (!w || typeof w.x !== 'number') { const fb = st.fb; const x = (fb.x0 + fb.x1) / 2, z = (fb.z0 + fb.z1) / 2; return { x, y: Math.max(groundAt(x, z), st.status === 'building' ? revealY(st) : st.base) + 2, z }; }
    return { x: w.x, y: typeof w.y === 'number' ? w.y + 1.5 : groundAt(w.x, w.z) + 2, z: w.z };
  }
  /** "!" markers over the next open tasks' spots: list = [{ stage, task }] or [{ x, y, z }]; [] clears → n drawn */
  function taskMarks(list) {
    const out = [];
    for (const m of Array.isArray(list) ? list : []) {
      if (!m) continue;
      const q = typeof m.x === 'number' && typeof m.z === 'number' ? { x: m.x, y: typeof m.y === 'number' ? m.y : groundAt(m.x, m.z) + 2, z: m.z } : taskSpot(m.stage, m.task);
      if (q && out.length < 6 && !out.some((o) => Math.hypot(o.x - q.x, o.z - q.z) < 2)) out.push(q);
    }
    TS.marks = out;
    return out.length;
  }
  /** he walks to `sp` for the scene (a brisk walk, ≤ 3.6 s for 110 amot; never placed) → the walk's seconds */
  function tsWalk(R, sp) {
    if (R.o.hero === false || !sp || (typeof sp.x !== 'number' && sp.boulder === undefined)) { R.arrived = true; return 0; }
    const hp = hero;
    if (sp.boulder === undefined && Math.hypot(hp.x - sp.x, hp.z - sp.z) < 1.2 && !hero.path) { R.arrived = true; if (Array.isArray(sp.face)) hero.face = [sp.face[0], sp.face[1]]; return 0; }
    const run = R.seq;
    const target = sp.boulder !== undefined ? { boulder: sp.boulder } : { x: sp.x, z: sp.z, ...(Array.isArray(sp.face) ? { face: sp.face.slice() } : {}), ...(sp.stone ? { stone: sp.stone } : {}), ...(sp.key ? { key: sp.key } : {}) };
    heroWalkTo(target).then((ok) => { if (TS.run === R || R.seq === run) { R.arrived = true; R.walkOk = ok; } });
    let L = 0, px = hp.x, pz = hp.z; if (hero.path) for (const q of hero.path) { L += Math.hypot(q.x - px, q.z - pz); px = q.x; pz = q.z; }
    hero.speed = clamp(L / 3.4, 11, L > 150 ? 36 : 32);   // (the rocks → the bay is 136–153 amot: 4.3 s; a brisker pace beyond 150)
    R.walkS = L / hero.speed + 0.3;
    return R.walkS;
  }
  /** a step at time `at` (or when he arrives, if `arrive`), in order */
  const tsStep = (R, at, fn, arrive = false) => { R.steps.push({ at, fn, arrive }); };
  /** the site's end state applied (the world snaps there; a skip, or the scene's last beat) */
  function tsApplyEnd(R, instant) {
    const E = R.end; if (!E) return;
    const st = R.st, L = st.lay || layout(st);
    const o = { phase: E.phase, stones: Math.max(E.stones, Math.max(0, L.n)), finish: E.finish };
    if (instant) o.instant = true;
    if (E.phase === 'dig' && st.id === 'har') { setWork(st.id, o); return; }
    setWork(st.id, o);
  }
  function tsFinish(R, skipped) {
    if (R.done) return; R.done = true;
    if (TS.run === R) TS.run = null;
    if (TS.cS !== null) { cSpeed = TS.cS; TS.cS = null; }
    tsTapOff();
    try { if (skipped) { tsApplyEnd(R, true); if (R.kind === 'dig' && R.stage === 'har') { setBoulders(bSt.map(() => 0)); } if (R.kind === 'survey' && R.stage === 'har') { survey.n = 12; propsDirty = true; } if (R.kind === 'finish' && R.stage === 'har') { pave.k = PAVE.NS; propsDirty = true; } } else tsApplyEnd(R, false); } catch (e) { console.warn('[taskScene] end', e); }
    // the mentor's bubble: over his head on screen, inside the safe frame (the frame he was fitted to, else the camera as it is)
    let at = null;
    try {
      const h = R.at3(), f = R.frame, p = f ? f.p : [camera.position.x, camera.position.y, camera.position.z], t = f ? f.t : [ctx.controls.target.x, ctx.controls.target.y, ctx.controls.target.z];
      const s = tsHero(p, t, h);
      if (s) { R.px = Math.round(s.px); at = { x: Math.round(clamp(s.x, 60, s.W0 - 60)), y: Math.round(clamp(s.top - 24, 120, s.H0 - 300)) }; }
    } catch (e) { at = null; }
    const state = tsState(R.st, R.o);
    tsLog({ id: R.id, stage: R.stage, kind: R.kind, at: skipped ? 'skip' : 'end', s: Math.round(R.t * 10) / 10, px: R.px, stones: state.stones });
    const res = R.res; R.res = null;
    if (res) res({ ok: true, skipped: !!skipped, kind: R.kind, id: R.id, at, px: R.px, moment: R.kind === 'moment' ? (typeof R.T.moment === 'string' && R.T.moment) || R.stage : null, ...state });
  }
  function taskUpdate(dt) {
    const R = TS.run; if (!R) return;
    R.t += dt;
    if (!R.arrived && !hero.path && R.t > 0.4) R.arrived = true;
    while (R.i < R.steps.length) {
      const s = R.steps[R.i];
      if (!(R.t >= s.at || (s.arrive && R.arrived))) break;
      R.i++;
      try { s.fn(); } catch (e) { console.warn('[taskScene] step', e); }
    }
    if (R.t >= R.dur || R.t >= 9) tsFinish(R, false);
  }
  // a tap on the 3D canvas skips (after 1.2 s: the tap that spent the ★ is not read)
  const tsTap = (e) => { const R = TS.run; if (!R || R.t < R.tapT) return; if (!e || !e.target || e.target.tagName !== 'CANVAS') return; tsFinish(R, true); };
  function tsTapOn() { if (TS.tapOn || typeof addEventListener !== 'function') return; TS.tapOn = true; addEventListener('pointerdown', tsTap, { capture: true, passive: true }); }
  function tsTapOff() { if (!TS.tapOn) return; TS.tapOn = false; removeEventListener('pointerdown', tsTap, { capture: true }); }
  /** the camera's frame for the scene's spot by kind: the world's own frames (bus/SITE15.md) */
  function tsFrameOf(R) {
    const id = R.stage, st = R.st, k = R.kind;
    let v = null;
    try {
      if (k === 'survey' || k === 'dig' || k === 'finish') v = id === 'har' ? null : siteWorkView(id);
      if (!v && k === 'survey' && id === 'har' && R.spot) {   // along the pegs' line, from behind his shoulder: the cord runs away into the frame
        const ux = survey.ux, uz = survey.uz, tx = R.spot.x + ux * 10, tz = R.spot.z + uz * 10, ty = groundAt(tx, tz) + 1.5, az = Math.atan2(-uz, -ux) / DEG + 38;
        const cv = clearView(tx, ty, tz, 48, az, 26, [[R.spot.x, R.spot.y + 2.4, R.spot.z]]) || { az, el: 26, dist: 48 };
        scPos(tx, ty, tz, cv.dist, cv.az, cv.el, scP); v = { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz] };
      }
      if (!v && k === 'dig' && id === 'har') { const i = heroRock(); if (i >= 0) { const b = boulderView(i); if (b) v = { p: b.p, t: b.t }; } }
      if (!v && (k === 'courses' || (k === 'job' && R.end))) v = wallView(id);
      if (!v && k === 'finish' && id === 'har') { const w = workSpot('har', 'set'); if (w) { const tx = (w.x + paveFront()) / 2, tz = w.z, ty = w.y + 1.5; scPos(tx, ty, tz, 56, 205, 38, scP); v = { p: [scP[0], scP[1], scP[2]], t: [tx, ty, tz] }; } }
      if (!v) {   // close on him at the spot, from outside the site (its centre behind him) — at the Mount from its inside (the hill's side:
        // from outside, its finished courses stand between the camera and him in the bay) — the first bearing whose line to his chest
        // and head is clear of the built walls, the stock and the crane (frameBlockedApi) and of the rough hill (sightClear)
        const w = R.spot || { x: hero.x, y: hero.y, z: hero.z }, c = siteCenter(id) || { x: w.x + 10, z: w.z };
        const a0 = (Math.hypot(w.x - c.x, w.z - c.z) > 3 ? Math.atan2(w.z - c.z, w.x - c.x) / DEG : 0) + (id === 'har' ? 180 : 0) + 30, y = (typeof w.y === 'number' ? w.y : groundAt(w.x, w.z)) + 1.8, d = 46;
        let best = null;
        for (const [da, de] of [[0, 0], [-25, 0], [25, 0], [-50, 0], [50, 0], [-80, 0], [80, 0], [0, 12], [-110, 4], [110, 4], [150, 8], [-150, 8], [180, 0], [0, 24], [0, 36]]) {
          scPos(w.x, y, w.z, d, a0 + da, 26 + de, scP);
          if (scP[1] < scMinY(scP[0], scP[2]) + 1) continue;
          if (frameBlockedApi(scP[0], scP[1], scP[2], w.x, y, w.z, id) || frameBlockedApi(scP[0], scP[1], scP[2], w.x, y + 1.6, w.z, id)) continue;
          if (mountRough() && (sightClear(scP[0], scP[1], scP[2], w.x, y, w.z) < 0 || sightClear(scP[0], scP[1], scP[2], w.x, y + 1.6, w.z) < 0)) continue;
          best = { p: [scP[0], scP[1], scP[2]], t: [w.x, y, w.z] }; break;
        }
        if (!best) { const cv = clearView(w.x, y, w.z, d, a0, 26) || { az: a0, el: 26, dist: d }; scPos(w.x, y, w.z, cv.dist, cv.az, cv.el, scP); best = { p: [scP[0], scP[1], scP[2]], t: [w.x, y, w.z] }; }
        v = best;
      }
    } catch (e) { v = null; }
    return v;
  }
  /** the scene by kind: its spot, its frame, its beats */
  function tsPlan(R) {
    const id = R.stage, st = R.st, T = R.T, k = R.kind;
    R.end = tsEnd(st, T, R.o);
    const L = layout(st), real = L.N, n = tsLogical(id, R.o);
    // the world at the task's start (behind the task: snapped forward, never back — a fixture, a save out of step)
    if (k === 'survey') { if (st.status !== 'building' || st.phase !== 'survey' || st.disp >= FOUND) setWork(id, { phase: 'survey', stones: 0, instant: true }); }
    else if (k === 'dig') { if (st.status !== 'building' || (st.phase !== 'dig' && st.phase !== 'survey') || st.disp >= FOUND) setWork(id, { phase: 'dig', stones: 0, instant: true }); else if (st.phase === 'survey') setWork(id, { phase: 'dig', stones: 0 }); }
    else if (k === 'courses') { const from = Math.max(0, +T.from || 0), fs = n > 0 ? Math.min(real, Math.round(from / n * real)) : 0; if (st.status !== 'building' || st.phase === 'survey' || st.phase === 'dig' || st.disp < FOUND || Math.max(0, L.n) < fs) setWork(id, { phase: fs > 0 ? 'courses' : 'foundation', stones: Math.max(fs, Math.max(0, L.n)), instant: true }); }
    else if (k === 'finish') { if (st.status !== 'building' || st.phase !== 'finish') setWork(id, { phase: 'finish', finish: Math.max(0, (R.end ? R.end.finish : 0) - 1 / (PROJ[id] && PROJ[id].fin ? Math.max(1, PROJ[id].fin.length) : 1)), instant: true }); }
    else if (st.status !== 'building' && st.status !== 'done' && k !== 'moment') setWork(id, { phase: 'courses' });
    if (typeof api.setCrews === 'function' && st.status === 'building' && k !== 'moment') { try { api.setCrews(id, 2); } catch (e) { /* crews.js */ } }
    // where he stands, and the camera's first frame
    let sp = null;
    try {
      if (k === 'survey') sp = id === 'har' ? null : workSpot(id, 'survey');
      else if (k === 'dig') { if (id === 'har') { const i = heroRock(); sp = i >= 0 ? { boulder: i } : null; } else sp = workSpot(id, 'set'); }
      else if (k === 'courses') sp = workSpot(id, 'dress') || workSpot(id, 'set');
      else if (k === 'finish') sp = workSpot(id, 'set') || workSpot(id, 'dress');
      else if (k === 'job') sp = T.job === 'key' || T.job === 'strike' || (id === 'har' && !['column', 'arch', 'letters', 'saw', 'rafts', 'tread', 'crane'].includes(T.job)) ? (workSpot(id, 'dress') || workSpot(id, 'set')) : jobSpot(T.job, { site: id });   // (the Mount: the line's and the gold's stand lay outside the east face, behind the laid course from the bay's frame)
      else if (k === 'moment') sp = workSpot(id, 'moment');
    } catch (e) { sp = null; }
    if (sp && sp.boulder !== undefined) { const s0 = spotFor(sp); R.spot = s0 ? { x: s0.x, y: groundAt(s0.x, s0.z), z: s0.z } : null; }
    else R.spot = sp && typeof sp.x === 'number' ? { x: sp.x, y: typeof sp.y === 'number' ? sp.y : groundAt(sp.x, sp.z), z: sp.z } : null;
    if (id === 'har' && k === 'survey' && !R.spot) {   // the Mount's survey: where he stands, 14 amot on along the line he measures (toward the east face)
      const dx = X1 - 8 - hero.x, dz = 36 - hero.z, l = Math.hypot(dx, dz) || 1, x = hero.x + dx / l * Math.min(14, l), z = hero.z + dz / l * Math.min(14, l);
      R.spot = { x, y: groundAt(x, z), z }; sp = { x, z, face: [X1 - 8, 36] };
    }
    // (a job's spot far from the site — Robinson's pier, 500 amot from the bay — is not walked in a scene: he works at his banker and the reveal's frame shows the place)
    if (k === 'job' && sp && typeof sp.x === 'number') { let Lw = 0; try { const s0 = spotFor(sp); let px = hero.x, pz = hero.z; for (const q of route(s0)) { Lw += Math.hypot(q.x - px, q.z - pz); px = q.x; pz = q.z; } } catch (e) { Lw = 0; } if (Lw > 190) { sp = null; R.spot = { x: hero.x, y: hero.y, z: hero.z }; R.cut = true; } }
    // (the walk: far spots — the arch's pier 100 amot from the bay — are walked too; the beats start when he arrives or at 4.2 s)
    const walkS = tsWalk(R, sp);
    const tA = Math.min(4.2, Math.max(0.6, walkS));
    const v = tsFrameOf(R);
    // (a long walk: the first frame holds the spot AND him where he starts — he walks into it; the tight frame as he arrives)
    const far = R.spot && walkS > 1.3 && Math.hypot(hero.x - R.spot.x, hero.z - R.spot.z) > 14;
    const work = k === 'courses' || (k === 'job' && R.end);   // (the slot and the crane stay in: soft)
    if (v && far) { const h0 = { x: hero.x, y: hero.y, z: hero.z }; tsFly(R, v.p, v.t, 1000, [h0]); tsStep(R, Math.max(0.9, walkS - 1.0), () => tsFly(R, v.p, v.t, 1000, work ? tsWorkAlso(id) : null, work), true); }
    else if (v) tsFly(R, v.p, v.t, 1100, work ? tsWorkAlso(id) : null, work);
    const act = (kind, target, o) => { if (R.o.hero === false || hero.path || R.done) return; heroAct(kind, target, { shake: false, ...(o || {}) }); };
    const burst = (x, y, z) => { dustBurst(x, y + 0.6, z, 10, 4, 3, 1.5); sparkBurst(x, y + 1.5, z, 18, 4, 7); };
    const E = R.end;
    if (k === 'survey') {
      // the pegs and the cord (the Mount: 12 pegs toward the east face; elsewhere the site's stakes), his measuring strokes
      if (id === 'har') { survey.on = true; survey.n = 0; const sx = R.spot ? R.spot.x : hero.x, sz = R.spot ? R.spot.z : hero.z; survey.x = sx; survey.z = sz; const dx = X1 - 8 - sx, dz = 36 - sz, l = Math.hypot(dx, dz) || 1; survey.ux = dx / l; survey.uz = dz / l; }
      else { siteSv.id = id; siteSv.n = 0; }
      for (let i = 0; i < 12; i++) tsStep(R, tA + 0.25 + i * 0.26, () => {
        if (id === 'har') { survey.n = Math.min(12, i + 1); const t = 5 + survey.n * 6, x = survey.x + survey.ux * t - survey.uz * 2, z = survey.z + survey.uz * t + survey.ux * 2; dustBurst(x, groundAt(x, z) + 0.6, z, 4, 1.5, 1.5, 0.8); if (i % 4 === 0) tsPlay(R, 'measure'); }
        else if (i % 4 === 3) { siteSv.n = Math.min(3, siteSv.n + 1); tsPlay(R, 'measure'); }
        propsDirty = true;
      }, i === 0);
      for (let i = 0; i < 3; i++) tsStep(R, tA + 0.1 + i * 1.15, () => act('measure', id === 'har' ? undefined : id), i === 0);
      tsStep(R, tA + 3.5, () => { tsPlay(R, 'chime'); if (R.spot) sparkBurst(R.spot.x, R.spot.y + 2, R.spot.z, 24, 5, 8); });
      R.dur = Math.min(8.5, tA + 4.2);
    } else if (k === 'dig') {
      if (id === 'har') {
        // the boulders: his own rock split (three strikes), two more struck by the gangs' side, the rest crumble in a cascade
        const order = bSt.map((b, i) => i).filter((i) => bSt[i].state > 0).sort((a, b) => Math.hypot(bSt[a].x - (R.spot ? R.spot.x : hero.x), bSt[a].z - (R.spot ? R.spot.z : hero.z)) - Math.hypot(bSt[b].x - (R.spot ? R.spot.x : hero.x), bSt[b].z - (R.spot ? R.spot.z : hero.z)));
        const first = sp && sp.boulder !== undefined ? sp.boulder : order[0];
        if (first !== undefined) { const rest = order.filter((i) => i !== first); order.length = 0; order.push(first, ...rest); }
        for (let s = 0; s < 3; s++) tsStep(R, tA + 0.1 + s * 0.75, () => { if (order.length) act('split', { boulder: order[0] }); if (s === 2 && order.length) { hitBoulder(order[0], 0); tsPlay(R, 'shatter'); } else if (order.length) { hitBoulder(order[0], 2); tsPlay(R, 'split'); } }, s === 0);
        for (let j = 1; j < order.length; j++) tsStep(R, tA + 2.6 + (j - 1) * 0.28, () => { hitBoulder(order[j], 0); if (j % 3 === 1) tsPlay(R, 'crack'); });
        tsStep(R, tA + 2.6 + Math.max(0, order.length - 1) * 0.28 + 0.9, () => { tsPlay(R, 'chime'); setBoulders(bSt.map(() => 0)); });
        R.dur = Math.min(8.8, tA + 2.6 + Math.max(0, order.length - 1) * 0.28 + 1.6);
      } else {
        // the trench: his pick at its end, the diggers at work, the spoil's dust along the line
        const w = R.spot, s = nextSlot(id);
        for (let i = 0; i < 4; i++) tsStep(R, tA + 0.1 + i * 0.9, () => { act('pick', id); if (w) { const u = (i + 1) / 5, x = s ? lerp(w.x, s.face[0], u) : w.x, z = s ? lerp(w.z, s.face[2], u) : w.z; dustBurst(x, groundAt(x, z) + 0.4, z, 8, 3, 2.5, 1.2); } if (i % 2 === 0) tsPlay(R, 'thud'); }, i === 0);
        tsStep(R, tA + 3.9, () => { tsPlay(R, 'chime'); if (w) sparkBurst(w.x, w.y + 1.5, w.z, 22, 5, 8); });
        R.dur = Math.min(8.5, tA + 4.6);
      }
    } else if (k === 'courses') {
      // the crane sets two stones (faster, as the demo's crane), the rest land as the camera holds (setWork's ripple), the
      // courses rising; he dresses at his banker meanwhile
      const target = E ? E.stones : Math.max(0, L.n);
      TS.cS = cSpeed; cSpeed = 2.4;
      let lifts = 0;
      const lift = () => { const Lw = st.lay || layout(st), i = nextWorkIdx(Lw); if (i < 0 || i + 1 > target || st.status !== 'building' || st.disp < FOUND) return; lifts++; liftStone(id, { ms: 2600 }).then((r) => { if (r && !R.done) { tsPlay(R, 'settle'); } }); tsPlay(R, 'rope'); };
      tsStep(R, Math.min(tA, 1.2), lift, true);
      tsStep(R, Math.min(tA, 1.2) + 1.5, lift);
      for (let i = 0; i < 3; i++) tsStep(R, tA + 0.2 + i * 1.3, () => act('dress'), i === 0);
      tsStep(R, Math.min(tA, 1.2) + 3.2, () => { const Lw = st.lay || layout(st); if (target > Math.max(0, Lw.n)) { setWork(id, { phase: 'courses', stones: target }); st.glowBoost = 1; } tsPlay(R, 'thud'); });
      tsStep(R, Math.min(tA, 1.2) + 4.6, () => { tsPlay(R, 'chime'); const s = nextSlot(id); const x = s ? s.face[0] : (st.fb.x0 + st.fb.x1) / 2, z = s ? s.face[2] : st.fb.z1, y = s ? s.y : revealY(st); sparkBurst(x, y + 1, z, 26, 6, 9);
        // (the frame again, on the course as it stands now: at the Mount his ground is the fill, which rose with the courses)
        const v2 = tsFrameOf(R); R.spot = { x: hero.x, y: hero.y, z: hero.z }; if (v2) tsFly(R, v2.p, v2.t, 1000, tsWorkAlso(id), true); });
      R.dur = Math.min(8.8, Math.min(tA, 1.2) + 6.0);
    } else if (k === 'finish') {
      // the step's reveal on the building (finCut eases it), its props one by one at his strokes; the Mount's paving strip by strip
      const F = E ? E.finish : 1;
      if (id === 'har' && typeof R.o.choice === 'string') { PAVE.pat = R.o.choice; propsDirty = true; }   // (the paving's pattern she chose: המחשה)
      if (id === 'har') { for (let i = 0; i < 4; i++) tsStep(R, tA + 0.1 + i * 0.8, () => { act('tamp', id); pave.k = Math.min(PAVE.NS, pave.k + 2); propsDirty = true; if (i % 2 === 0) tsPlay(R, 'thud'); }, i === 0); }
      else { const step = Math.max(0, Math.round(F * (FIN_KIND[id] ? FIN_KIND[id].length : 1)) - 1); for (let i = 0; i < 4; i++) tsStep(R, tA + 0.1 + i * 0.8, () => { act('tamp', id); if (fin.id !== id || fin.step !== step) { fin.id = id; fin.step = step; fin.k = 0; } fin.k = Math.min(4, fin.k + 1); propsDirty = true; if (i % 2 === 0) tsPlay(R, 'hammer'); }, i === 0); }
      tsStep(R, tA + 3.4, () => { setWork(id, { phase: 'finish', finish: F }); st.glowBoost = 1; tsPlay(R, 'chime'); if (R.spot) burst(R.spot.x, R.spot.y, R.spot.z); });
      R.dur = Math.min(8.6, tA + 5.0);
    } else if (k === 'job' && E && E.stones > Math.max(0, L.n)) {
      // the stage's first stone (job 'key': "הניחו את האבן הראשונה"): the crane sets it, great, glowing on the hook (SITE9/13)
      TS.cS = cSpeed; cSpeed = 1.6;
      tsStep(R, Math.min(tA, 1.2), () => { if (st.status === 'building' && st.disp >= FOUND) { liftStone(id, { great: T.job === 'key', ms: 3200 }).then((r) => { if (r && !R.done) tsPlay(R, 'settle'); }); tsPlay(R, 'rope'); } }, true);
      for (let i = 0; i < 3; i++) tsStep(R, tA + 0.3 + i * 1.3, () => act('dress'), i === 0);
      tsStep(R, Math.min(tA, 1.2) + 4.2, () => { tsPlay(R, 'chime'); const s = nextSlot(id); if (s) sparkBurst(s.face[0], s.y + 1, s.face[2], 26, 6, 9); });
      R.dur = Math.min(8.6, Math.min(tA, 1.2) + 5.2);
    } else if (k === 'job') {
      // a job the crews do (the "הצוות יעשה" path): his strokes of the job's kind, then SITE14's reveal — framed with him when it
      // is near (the line on the course, the gold), else a cutaway to the place (the Stoa's column, the arch, the inscription:
      // v27's jobRevealAt did the same) and back to him for the scene's last frame
      const job = typeof T.job === 'string' ? T.job : 'line', actK = TS_ACT[job] || 'tamp', tR = Math.min(tA, 3.4) + 1.6;
      for (let i = 0; i < 2; i++) tsStep(R, Math.min(tA, 3.4) + 0.1 + i * 0.9, () => act(actK, actK === 'dress' ? undefined : id), i === 0);
      tsStep(R, tR, () => {
        const r = jobReveal(job, 'stone', R.q, { site: id });
        tsPlay(R, 'chime');
        if (r) sparkBurst(r.x, r.y + 0.5, r.z, 20, 5, 8);
        if (!(r && Array.isArray(r.p) && Array.isArray(r.t))) return;
        const d = clamp(+r.dur || 1.6, 1, 2.2), h = { x: hero.x, y: hero.y, z: hero.z }, back = R.frame;
        const f = tsFit(r.p, r.t, h, R.o.safe, [h]), sh = tsHero(f.p, f.t, h), top = R.o.safe && +R.o.safe.top > 0 ? +R.o.safe.top : 150, bot = R.o.safe && +R.o.safe.bottom > 0 ? +R.o.safe.bottom : 250;
        const near = !!(sh && sh.px >= 72 && sh.y > top + 20 && sh.y < sh.H0 - bot && sh.x > 60 && sh.x < sh.W0 - 60);
        const farR = Math.hypot(r.t[0] - h.x, r.t[2] - h.z) > 150;
        flyTo(f.p, f.t, farR ? 260 : 900);
        if (near) { R.frame = f; R.px = Math.round(sh.px); R.dur = Math.min(8.8, R.t + d + 1.3); }
        else { R.dur = Math.min(8.8, R.t + d + 2.2); tsLater(R, R.t + d + 0.2, () => { if (back) { R.frame = back; flyTo(back.p, back.t, farR ? 260 : 900); } }); }
        tsLog({ id: R.id, stage: id, kind: k, at: 'reveal', job, near });
      });
      R.dur = Math.min(8.6, tR + 3.4);
    } else if (k === 'moment') {
      // the walk to the moment's spot, framed close; META15 plays the moment itself (runMoment: its own frame and card)
      tsStep(R, tA + 0.2, () => { if (R.o.hero !== false && !hero.path) heroGesture('proud'); tsPlay(R, 'chime'); }, true);
      R.dur = Math.min(6, tA + 1.6);
    }
  }
  const tsSort = (R) => { R.steps = R.steps.map((q, i) => ({ ...q, i })).sort((a, b) => a.at - b.at || a.i - b.i); };
  const tsLater = (R, at, fn) => { const tail = R.steps.slice(R.i); tail.push({ at, fn, arrive: false, i: 1e6 }); tail.sort((a, b) => a.at - b.at || a.i - b.i); R.steps = R.steps.slice(0, R.i).concat(tail); };
  function taskScene(stage, task, o) {
    const st = ST[stage];
    const T = task && task.do && typeof task.do === 'object' ? task.do : task && typeof task === 'object' ? task : {};
    const kind = TS_KINDS.includes(T.kind) ? T.kind : null;
    const id = (task && typeof task.id === 'string' && task.id) || (task && task.task && typeof task.task === 'object' && task.task.id) || `${stage}.${kind}`;
    o = o && typeof o === 'object' ? o : {};
    if (!st || !kind) return Promise.resolve({ ok: false, skipped: false, kind, id, at: null, px: 0, moment: null, ...tsState(st, o) });
    if (TS.run) tsFinish(TS.run, true);
    const R = { seq: ++TS.seq, stage, st, kind, id, task, T, o, t: 0, i: 0, dur: 6, steps: [], done: false, res: null, px: 0, frame: null, spot: null, end: null, arrived: false, walkS: 0,
      q: clamp(+o.q || 0.8, 0, 1), tapT: o.tap === false ? 1e9 : 1.2, sfx: typeof o.sfx === 'function' ? o.sfx : typeof api.sfx === 'function' ? api.sfx : null,
      at3: () => ({ x: hero.x, y: hero.y, z: hero.z }) };
    const p = new Promise((res) => { R.res = res; });
    const end = () => tsFinish(R, true);
    p.skip = end;
    if (typeof o.skip === 'function') { try { o.skip(end); } catch (e) { /* the host's */ } }
    TS.run = R;
    try { tsPlan(R); tsSort(R); } catch (e) { console.warn('[taskScene]', e); R.steps = []; R.dur = 0.6; }
    tsTapOn();
    tsLog({ id, stage, kind, at: 'start', s: 0, walk: Math.round(R.walkS * 10) / 10, spot: R.spot ? [R.spot.x, R.spot.y, R.spot.z].map(Math.round) : null, from: [hero.x, hero.y, hero.z].map(Math.round) });
    return p;
  }
  // ── site15 ── המנופאי (the crane operator; the owner, 2.10 14:28: "הכהן לומד מקצוע"). The treadwheel job plays IN THE WORLD: he
  // walks into the lifting crane's great wheel (the crane that sets the site's stones), the game's hold buttons drive the real
  // wheel through the rope's length, the real block rises over the next slot and seats on the release; the sheet keeps only its
  // controls (tread.js draws a meter strip when linked). treadBegin(site) → { ok, at } · treadUpdate(s) each frame from the
  // game's draw · treadEnd(r). GAMES14's model and scoring are untouched; the stones are counted by FUN14's setShare as before —
  // the three stones he seats stand as props until the count's ripple reveals the real ones (≤ 3 s).
  const TW = { on: false, site: null, st: null, slots: [], i: 0, h: 0, mark: 0.7, phase: 'lift', pt: 0, v: 0, over: false, placed: false, set: [], hy: null, hySet: null, ox: 0, oz: 0, at: null, dy: 1.2, lift: 0, inWheel: false, clearT: 0 };
  /** where he stands inside the wheel (world): on the bottom tread, facing the wheel's rolling direction (the jib's side) */
  function treadWheelPoint() {
    const C = crane, st = C.st, by = C.byFix !== null ? C.byFix : craneY(st);
    const fx = C.fwd.x, fz = C.fwd.y, x = C.bx - 1.6 * fx, z = C.bz - 1.6 * fz;
    return { x, y: by + 1.2, z, face: [x + fx * 3, z + fz * 3], dy: by + 1.2 - groundAt(x, z) };
  }
  /** the frame: the wheel face-on from its side, him inside it, the slot and the hook kept in (soft), K80 */
  function treadFrame() {
    const C = crane, s = TW.slots[0]; if (!s) return false;
    const fx = C.fwd.x, fz = C.fwd.y, by = C.byFix !== null ? C.byFix : craneY(C.st), ax = C.bx - 1.6 * fx, az = C.bz - 1.6 * fz, ay = by + 4.6;
    // (the target between the wheel and the slot; 58 amot on a portrait phone: its narrow frame holds the wheel at one side and the
    //  slot at the other — he ≈ 95 px inside the wheel; the fit pulls in only below 90 px and stops when the slot or the hook would leave)
    const tx = lerp(ax, s.face[0], 0.5), ty = lerp(ay, s.y + 1, 0.5), tz = lerp(az, s.face[2], 0.5);
    const P = TW.at, him = { x: P.x, y: P.y, z: P.z }, d = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8 ? 58 : 44, el = 16 * DEG;
    const also = [{ x: s.face[0], y: s.y + (s.h || 1) / 2 + 0.3, z: s.face[2] }, { x: C.bx + fx * (1.2 + C.H * Math.sin(C.aW)), y: by + 0.6 + C.H * Math.cos(C.aW) - 2, z: C.bz + fz * (1.2 + C.H * Math.sin(C.aW)) }];
    let best = null;
    for (const [sg, de, fwdK] of [[1, 0, 0.35], [-1, 0, 0.35], [1, 10, 0.5], [-1, 10, 0.5], [1, 24, 0.2], [-1, 24, 0.2]]) {
      const sx = fz * sg, sz = -fx * sg, e = el + de * DEG, p = [tx + (sx * Math.cos(e) + fx * fwdK) * d / Math.hypot(1, fwdK), ty + Math.sin(e) * d, tz + (sz * Math.cos(e) + fz * fwdK) * d / Math.hypot(1, fwdK)];
      if (p[1] < scMinY(p[0], p[2]) + 1 || p[1] < groundAt(p[0], p[2]) + 4) continue;
      if (frameBlockedApi(p[0], p[1], p[2], him.x, him.y + 2, him.z, TW.site) || (mountRough() && sightClear(p[0], p[1], p[2], him.x, him.y + 2, him.z) < 0)) continue;
      best = p; break;
    }
    if (!best) { const e = el; best = [tx + fz * Math.cos(e) * d, ty + Math.sin(e) * d, tz - fx * Math.cos(e) * d]; }
    const f = tsFit(best, [tx, ty, tz], him, { top: 150, bottom: 330 }, also, true);
    return flyTo(f.p, f.t, 1000);
  }
  function treadBegin(site) {
    const st = ST[site], C = crane;
    if (!st || st.status !== 'building' || st.disp < FOUND || !st.lay || st.lay.kind === 'cast' || TS.run) return { ok: false, why: 'site' };
    if (C.st !== st) { cranePref = site; craneAssign(); }
    if (C.st !== st || C.lift || lifts.length) return { ok: false, why: C.lift || lifts.length ? 'lifting' : 'crane' };
    const open = (slots(site) || []).filter((q) => !q.set).slice(0, 3);
    if (!open.length) return { ok: false, why: 'slots' };
    try { if (site === 'har') { if (!st.harPosed) harCranePose(st); } else if (!st.posed || C.glide) poseAt(st, craneWorkPose(st, open[0], C.H)); } catch (e) { /* the pose as it is */ }
    Object.assign(TW, { on: true, site, st, slots: open, i: 0, h: 0, mark: 0.7, phase: 'lift', pt: 0, v: 0, over: false, placed: false, set: [], hy: null, hySet: null, ox: 0, oz: 0, lift: 0, inWheel: false, clearT: 0 });
    C.calm = true; C.glide = null;
    C.block.scale.set(open[0].w * 0.98, open[0].h * 0.97, open[0].d); C.block.geometry = st.def.stone === 'field' ? C.fieldBlock : C.boxBlock; C.blockMat.color.set(STONE[st.def.stone] || STONE.ash); C.blockMat.emissive.setRGB(0, 0, 0);
    const P = treadWheelPoint(); TW.at = P; TW.dy = clamp(P.dy, 0, 2.5);
    heroWalkTo({ x: P.x, z: P.z, face: P.face, key: 'tread' });
    hero.speed = clamp(hero.speed, 11, 24);
    treadFrame();
    tsLog({ id: 'tread', stage: site, kind: 'tread', at: 'begin', spot: [P.x, P.y, P.z].map((v) => Math.round(v * 10) / 10), from: [hero.x, hero.y, hero.z].map(Math.round), slots: open.length });
    return { ok: true, at: { x: P.x, y: P.y, z: P.z } };
  }
  /** each frame from tread.js's draw: { ang, h, v, mark, phase, pt, i, n, over, done } */
  function treadUpdate(q) {
    if (!TW.on || !q) return false;
    const i = Math.max(0, Math.min(TW.slots.length - 1, q.i | 0));
    if (i !== TW.i) { TW.i = i; TW.placed = false; TW.hySet = null; const a = TW.slots[0], b = TW.slots[i]; TW.ox = b.x - a.x; TW.oz = b.z - a.z; }
    if (q.phase === 'set' && TW.phase !== 'set') TW.hySet = TW.hy;
    TW.h = +q.h || 0; TW.mark = +q.mark || 0.7; TW.v = +q.v || 0; TW.over = !!q.over; TW.phase = q.phase || 'lift'; TW.pt = +q.pt || 0;
    return true;
  }
  function treadEnd(r) {
    if (!TW.on) return false;
    const C = crane, st = TW.st, site = TW.site;
    TW.on = false; TW.inWheel = false; TW.clearT = 3.2;
    if (C.st === st) C.calm = !!st.lifted;
    tsLog({ id: 'tread', stage: site, kind: 'tread', at: 'end', set: TW.set.length, q: r && typeof r.quality === 'number' ? Math.round(r.quality * 100) / 100 : null });
    // ── nav19 ── (the owner 01:31, the walk audit #14) under two thumbs the wheel's end is a step out of it — 4 amot sideways, along its
    // axle, on the side away from the crane's base — not a walk back to his banker; the stick or the compass takes him on
    const P = TW.at;
    if (TWD.twin && P && Array.isArray(P.face)) { try { const fx = P.face[0] - P.x, fz = P.face[1] - P.z, l = Math.hypot(fx, fz) || 1, ax = -fz / l, az = fx / l; let bx = P.x, bz = P.z, bd = -1;
      for (let sg = -1; sg <= 1; sg += 2) { const x = P.x + ax * sg * 4, z = P.z + az * sg * 4, d = Number.isFinite(crane.bx) ? Math.hypot(x - crane.bx, z - crane.bz) : 1; if (d > bd) { bd = d; bx = x; bz = z; } }
      heroWalkTo({ x: bx, z: bz, face: [bx + fx / l, bz + fz / l] }); } catch (e) { /* stays */ } return true; }
    // ── /nav19 ──
    try { const w = workSpot(site, 'dress') || workSpot(site, 'set'); if (w && typeof w.x === 'number') heroWalkTo({ x: w.x, z: w.z, face: Array.isArray(w.face) ? w.face : undefined, stone: w.stone || undefined }); } catch (e) { /* the game walks him */ }
    return true;
  }
  /** the crane in the operator's hands (craneUpdate): the jib over the slot, the block at the model's height, the seating */
  function treadCrane(C, dt, by, tipH, tipR, out) {
    const s = TW.slots[TW.i]; if (!s) return false;
    // the stone comes up from the stock under the pick angle and swings over to the slot as he walks (liftStep's own path), so
    // the lift is seen even at a first course a cubit off the ground; a release in the mark lowers it the last stretch into its bed
    const fx = C.fwd.x, fz = C.fwd.y, top = Math.min(tipH(C.aW), tipH(C.aP)) - 2.8 - s.h * 0.5;
    const pickY = groundAt(C.bx + fx * tipR(C.aP), C.bz + fz * tipR(C.aP)) + s.h * 0.5 + 0.1, u = clamp(TW.h / Math.max(0.05, TW.mark), 0, 1.15);
    const a = lerp(C.aP, C.aW, easeIO(clamp(u, 0, 1)));
    let hy = Math.min(top, lerp(pickY, Math.max(s.y + 1.2, pickY + 3), u));
    let carry = true;
    if (TW.phase === 'set') {
      const k = clamp(TW.pt / 0.45, 0, 1); hy = lerp(TW.hySet === null ? hy : TW.hySet, s.y, easeIn(k));
      if (k >= 1 && !TW.placed) {
        TW.placed = true; TW.set.push({ x: s.x, y: s.y, z: s.z, w: s.w * 0.98, h: s.h * 0.97, d: s.d, yaw: s.yaw }); propsDirty = true;
        dustBurst(s.face[0], s.y - s.h * 0.4, s.face[2], 12, 3.5, 2, 1.2); sparkBurst(s.face[0], s.y + s.h * 0.6, s.face[2], 22, 4, 7);
        shake.t = 0.18; shake.amp = 0.14; TW.st.U.uF.value.x = 1; TW.st.glowBoost = 1;
      }
      carry = !TW.placed;
    }
    TW.hy = hy;
    out.a = TW.phase === 'set' ? C.aW : a; out.hy = hy; out.carry = carry; out.sw = TW.over ? Math.sin(time * 4.2) * 0.45 : 0; out.yaw = s.yaw;
    return true;
  }
  const TW_OUT = { a: 0, hy: 0, carry: true, sw: 0, yaw: 0 };
  /** the stones he seated, until the count's ripple reveals the real ones (rebuildProps) */
  function treadProps(put) { for (const q of TW.set) put(q.x, q.y, q.z, q.w, q.h, q.d, q.yaw, STONE[TW.st && TW.st.def.stone] || STONE.ash); }
  function treadTick(dt) {
    caCoil(dt); caSvTick(dt); ksTick(dt); dsTick(dt); clTick(dt); gwTick(dt);   // ── crafta19 ── (the rope coiled on the drum; the survey's cord; the key stone's slot and shadow) ── /crafta19 ──
    s20Tick(dt);   // ── site20 ── (plan A: the wall's top and its ramp) ── /site20 ──
    if (TW.clearT > 0) { TW.clearT -= dt; if (TW.clearT <= 0 && TW.set.length) { TW.set = []; propsDirty = true; } }
    if (!TW.on) { if (TW.lift > 0) TW.lift = Math.max(0, TW.lift - dt * 3); return; }
    const P = TW.at, near = !!(P && !hero.path && Math.hypot(hero.x - P.x, hero.z - P.z) < 1.6);
    TW.inWheel = near;
    TW.lift += ((near ? TW.dy : 0) - TW.lift) * Math.min(1, dt * 6);
  }
  // ── /site15 ──
  // ── site16 ── the crafts IN THE WORLD (WAVE16-BRIEF B; the owner, 4.10: "שזה יהיה בתוך העולם ולא כמשחקון חיצוני"). stages.craft =
  // { tread, saw, line }, each { begin(site) → { ok, at, why? }, update(model), end(result), box() → { x, y, w, h } | null, on() }.
  // No sheet is drawn here: FLOW16's hands.js owns the input and the hint; box() tells it where the work is on the screen.
  // · tread — SITE15's treadBegin / treadUpdate / treadEnd (the operator in the crane's wheel), wrapped.
  // · saw — the sawyer: the kohen walks to the crews' bench (crews.js SITES[id].saw; a bench of our own by the stock where a site
  //   has none), stands at the sawyer's place, both hands on the two-man saw across the log; update(saw.js's model) slides the
  //   real blade with `blade` (0 at the partner … 1 pulled to him), the kerf runs down the log with `c`; end: the log parts (the
  //   piece beyond the cut drops), the planks join the pile through the game's own jobReveal 'saw' as today. The saw in two: המחשה.
  // · line — the surveyor: the kohen walks to the course's far end; the dyed cord runs from the stake at the course's start along
  //   the laid course's top to his hands; update(snap.js's model) lifts the cord's middle with `lift` (0…1 → up to 1.2 amot); the
  //   snap (phase 'snap') drops it with dust along the line and leaves the chalk line (jobReveal 'line'); end: his walk back.
  // One InstancedMesh of boxes (one draw call) draws the bench, the log, the blade, the kerf and the cord's segments.
  const CR = { kind: null, site: null, st: null, at: null, t: 0, near: false, after: 0, done: false,
    bench: null, blade: 0, pp: 0, cut: 0, plank: 0, planks: 2, parted: false, partT: 0, partQ: 0,
    cord: null, lift: 0, liftS: 0, phase: '', snapT: 0, lines: 0, q: 0, hand: new THREE.Vector3(), mid: new THREE.Vector3() };
  const crMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.05 }), 28);
  crMesh.name = 'site16-craft'; crMesh.frustumCulled = false; crMesh.castShadow = true; crMesh.visible = false; crMesh.count = 0;
  crMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  { const c = new THREE.Color(1, 1, 1); for (let i = 0; i < 28; i++) crMesh.setColorAt(i, c); }
  scene.add(crMesh);
  const crC = new THREE.Color();
  let crN = 0;
  function crPut(x, y, z, w, h, d, yaw, hex, pitch = 0) {
    if (crN >= 28) return;
    tmpE.set(pitch, yaw, 0, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(x, y, z); tmpS.set(w, h, d); tmpM.compose(tmpV, tmpQ, tmpS);
    crMesh.setMatrixAt(crN, tmpM); crMesh.setColorAt(crN, crC.set(hex)); crN++;
  }
  function crBegin() { crN = 0; }
  function crEnd() { crMesh.count = crN; crMesh.visible = crN > 0; if (crN) { crMesh.instanceMatrix.needsUpdate = true; if (crMesh.instanceColor) crMesh.instanceColor.needsUpdate = true; } }
  // the bench: the crews' (SITES[id].saw: [x, z, yaw of the beam]); without one, our own 9 amot along the site's dressing yard
  function craftBench(site) { const b = craftBench0(site); return b && TWD.twin ? cbAcross(b, site) : b; }   // ── craftb19 ── ── /craftb19 ──
  // ── craftb19 ── under two thumbs the log runs ACROSS the follow camera's view and he stands on its near side (his back to the camera,
  // his partner beyond): the push (thumb up) drives the blade away up the screen. The crews' own bench keeps its place: hers stands
  // beside it, toward the camera, when that ground is clear
  function cbAcross(b, site) {
    const yaw = 1.5 * Math.PI - CB_AZ;
    if (b.own) return { x: b.x, z: b.z, yaw, own: true };
    const x = b.x + Math.cos(CB_AZ) * 4, z = b.z + Math.sin(CB_AZ) * 4;
    return Number.isFinite(groundAt(x, z)) && cbSeen(x, z, site) ? { x, z, yaw, own: true } : { x: b.x, z: b.z, yaw: b.yaw, own: false };
  }
  // ── /craftb19 ──
  function craftBench0(site) {
    const b = benchOf(site); if (b) return { x: b[0], z: b[1], yaw: b[2], own: false };
    try {
      const yd = workSpot(site, 'yard'); if (!yd || !Array.isArray(yd.along)) return null;
      const [ax, az] = yd.along, x = yd.x + ax * 9, z = yd.z + az * 9;
      if (!Number.isFinite(groundAt(x, z))) return null;
      return { x, z, yaw: Math.atan2(-az, ax), own: true };
    } catch (e) { return null; }
  }
  // bench-local → world (the beam along local x, the sawyers on ±z; crews.js assign 'sawA')
  function benchW(b, lx, lz, out) { const c = Math.cos(b.yaw), s = Math.sin(b.yaw); out.x = b.x + lx * c + lz * s; out.z = b.z - lx * s + lz * c; return out; }
  const crP = { x: 0, z: 0 }, crP2 = { x: 0, z: 0 };
  /** the camera at K80 on the work: from its side, him and the work in frame (treadFrame's search, the work's own axis) */
  function craftFrame(tx, ty, tz, fx, fz, him, also, far = false) {
    const d = (typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8 ? 36 : 30) * (far ? 1.12 : 1), el = (far ? 30 : 27) * DEG, fk = far ? 0 : 1;
    let best = null;
    for (const [sg, de, fwdK0] of [[1, 0, -0.55], [-1, 0, -0.55], [1, 8, -0.75], [-1, 8, -0.75], [1, 16, -0.4], [-1, 16, -0.4]]) {
      const fwdK = fwdK0 * fk;
      const sx = fz * sg, sz = -fx * sg, e = el + de * DEG, p = [tx + (sx * Math.cos(e) + fx * fwdK) * d / Math.hypot(1, fwdK), ty + Math.sin(e) * d, tz + (sz * Math.cos(e) + fz * fwdK) * d / Math.hypot(1, fwdK)];
      if (p[1] < scMinY(p[0], p[2]) + 1 || p[1] < groundAt(p[0], p[2]) + 3) continue;
      if (frameBlockedApi(p[0], p[1], p[2], him.x, him.y + 2, him.z, CR.site) || (mountRough() && sightClear(p[0], p[1], p[2], him.x, him.y + 2, him.z) < 0)) continue;
      best = p; break;
    }
    if (!best) best = [tx + fz * Math.cos(el) * d - fx * 0.4 * d, ty + Math.sin(el) * d, tz - fx * Math.cos(el) * d - fz * 0.4 * d];
    const f = tsFit(best, [tx, ty, tz], him, { top: 150, bottom: 330 }, also, !far);   // (far: the cord's middle and the stake stay in; he ≥ 80 px)
    return flyTo(f.p, f.t, 1000);
  }
  function craftGuard(site) {
    const st = ST[site];
    if (!st || st.status !== 'building' || TS.run || TW.on || CR.kind) return { ok: false, why: CR.kind ? 'busy' : 'site' };
    return null;
  }
  function craftWalkBack(site) {
    if (TWD.twin) return;   // ── nav19 ── (the owner 01:31: under two thumbs he stays where the craft left him — the stick or the compass takes him back) ── /nav19 ──
    try { const w = workSpot(site, 'dress') || workSpot(site, 'set'); if (w && typeof w.x === 'number') heroWalkTo({ x: w.x, z: w.z, face: Array.isArray(w.face) ? w.face : undefined, stone: w.stone || undefined }); } catch (e) { /* the game walks him */ }
  }
  const craftSaw = {
    begin(site) {
      const g = craftGuard(site); if (g) return g;
      const b = craftBench(site); if (!b) return { ok: false, why: 'bench' };
      const st = ST[site];
      Object.assign(CR, { kind: 'saw', site, st, t: 0, near: false, after: 0, done: false, bench: b, blade: 0, pp: 0, cut: 0, plank: 0, planks: 2, parted: false, partT: 0, partQ: 0, phase: 'saw' });
      benchW(b, 0.9, -1.62, crP); benchW(b, 0.9, 0, crP2);
      const at = { x: crP.x, y: groundAt(crP.x, crP.z), z: crP.z };
      CR.at = at;
      heroWalkTo({ x: at.x, z: at.z, face: [crP2.x, crP2.z], key: 'saw' });
      const work = { x: crP2.x, y: groundAt(crP2.x, crP2.z) + 1.9, z: crP2.z };   // (the cut on the log: hands.js's anchor)
      hero.speed = clamp(hero.speed, 11, 24);
      // the frame: along the bench's z (from him to his partner), the log's two ends kept in
      const c = Math.cos(b.yaw), s = Math.sin(b.yaw), gy = groundAt(crP2.x, crP2.z);
      benchW(b, -1.6, 0, crP); const e1 = { x: crP.x, y: gy + 1.8, z: crP.z }; benchW(b, 2.1, 0, crP); const e2 = { x: crP.x, y: gy + 1.8, z: crP.z };
      craftFrame(crP2.x, gy + 1.6, crP2.z, s, c, at, [e1, e2]);
      tsLog({ id: 'saw', stage: site, kind: 'saw', at: 'begin', spot: [at.x, at.y, at.z].map((v) => Math.round(v * 10) / 10), from: [hero.x, hero.y, hero.z].map(Math.round), bench: [Math.round(b.x), Math.round(b.z)], own: b.own });
      return { ok: true, at: work, stand: at };
    },
    update(m) {
      if (CR.kind !== 'saw' || !m) return false;
      CR.blade = clamp(+m.blade || 0, 0, 1); CR.pp = clamp(+m.pp || 0, 0, 1); CR.cut = clamp(+m.c || 0, 0, 1);
      if (Number.isFinite(+m.planks)) CR.planks = Math.max(1, m.planks | 0);
      const pl = Math.max(0, m.plank | 0);
      if (pl > CR.plank) { CR.plank = pl; craftSawPart(); }   // (a plank came off: the piece beyond the kerf drops)
      CR.phase = m.phase || 'saw';
      if (m.done) CR.done = true;
      return true;
    },
    end(r) {
      if (CR.kind !== 'saw') return false;
      if (!CR.parted) craftSawPart();
      CR.partQ = r && typeof r.quality === 'number' ? clamp(r.quality, 0, 1) : 0.7;
      tsLog({ id: 'saw', stage: CR.site, kind: 'saw', at: 'end', cut: Math.round(CR.cut * 100) / 100, planks: CR.plank, q: r && typeof r.quality === 'number' ? Math.round(r.quality * 100) / 100 : null });
      craftWalkBack(CR.site);
      CR.done = true; CR.after = 2.4;
      return true;
    },
    box() {
      if (CR.kind !== 'saw' || !CR.bench) return null;
      const b = CR.bench, gy = groundAt(b.x, b.z), top = gy + 1.9;
      // the kerf's reach: the blade's run between the two sawyers at the cut, the log's top to its underside
      return crBoxOf([[0.9, top + 0.7, -1.3], [0.9, top + 0.7, 1.3], [0.9, top - 0.7, -1.3], [0.9, top - 0.7, 1.3]].map(([lx, y, lz]) => { benchW(b, lx, lz, crP); return [crP.x, y, crP.z]; }));
    },
    on: () => CR.kind === 'saw',
  };
  function craftSawPart() { if (CR.parted) return; CR.parted = true; CR.partT = 0; const b = CR.bench; if (!b) return; benchW(b, 1.5, 0, crP); const gy = groundAt(crP.x, crP.z); dustBurst(crP.x, gy + 1.6, crP.z, 10, 2.4, 2, 1.4); }
  const CR_LIFT_T = 0.72;   // where the cord is lifted: 0.72 of the way from the stake to his hand (near him: he and the lift share one frame)
  const crBump = (t) => (t <= 0.44 ? 0 : Math.sin(Math.PI * (t - 0.44) / 0.56));
  const craftLine = {
    begin(site) {
      const g = craftGuard(site); if (g) return g;
      const st = ST[site], s = nextSlot(site);
      if (!s || !Array.isArray(s.n) || !Array.isArray(s.face)) return { ok: false, why: 'course' };
      let ux, uz, nx, nz; try { [ux, uz] = slotTangent(site, s); [nx, nz] = standSide(st, s, 1.8); } catch (e) { return { ok: false, why: 'course' }; }
      const len = 26, y0 = s.y - s.h / 2 + 0.03;
      const cord = { x0: s.face[0] - s.n[0] * 0.25, y0, z0: s.face[2] - s.n[1] * 0.25, ux, uz, nx, nz, len, course: st.lay ? st.lay.cur : 0 };
      // his stand: the course's far end, out from the face (never inside the House)
      let sx = cord.x0 + ux * (len + 1.2) + nx * 2.2, sz = cord.z0 + uz * (len + 1.2) + nz * 2.2;
      const ho = houseOut(site, sx, sz); if (ho) { sx = ho[0]; sz = ho[1]; }
      const at = { x: sx, y: groundAt(sx, sz), z: sz };
      Object.assign(CR, { kind: 'line', site, st, t: 0, near: false, after: 0, done: false, cord, lift: 0, liftS: 0, phase: 'show', snapT: 0, lines: 0, q: 0 });
      CR.at = at;
      heroWalkTo({ x: at.x, z: at.z, face: [cord.x0 + ux * (len - 2), cord.z0 + uz * (len - 2)], key: 'line' });
      hero.speed = clamp(hero.speed, 11, 24);
      const mx = cord.x0 + ux * len * CR_LIFT_T, mz = cord.z0 + uz * len * CR_LIFT_T, tx = lerp(at.x, mx, 0.5), tz = lerp(at.z, mz, 0.5);
      craftFrame(tx + nx * 1.0, y0 + 1.4, tz + nz * 1.0, ux, uz, at, [{ x: mx, y: y0 + 2.4, z: mz }, { x: at.x, y: at.y + 2.4, z: at.z }], true);
      tsLog({ id: 'line', stage: site, kind: 'line', at: 'begin', spot: [at.x, at.y, at.z].map((v) => Math.round(v * 10) / 10), from: [hero.x, hero.y, hero.z].map(Math.round), len });
      return { ok: true, at: { x: mx, y: y0 + 1.6, z: mz }, stand: at };   // (at: where the cord is lifted — hands.js's anchor; stand: his)
    },
    update(m) {
      if (CR.kind !== 'line' || !m) return false;
      const ph = m.phase || '';
      CR.lift = ph === 'snap' || ph === 'done' || ph === 'show' ? 0 : clamp((+m.lift || 0) + (+m.wind || 0), 0, 1.2);   // (snapped: down on the course)
      if (ph === 'snap' && CR.phase !== 'snap') craftSnap(m);
      CR.phase = ph;
      if (m.done) CR.done = true;
      return true;
    },
    end(r) {
      if (CR.kind !== 'line') return false;
      tsLog({ id: 'line', stage: CR.site, kind: 'line', at: 'end', lines: CR.lines, q: r && typeof r.quality === 'number' ? Math.round(r.quality * 100) / 100 : null });
      craftWalkBack(CR.site);
      CR.done = true; CR.after = 1.2;
      return true;
    },
    box() {
      if (CR.kind !== 'line' || !CR.cord) return null;
      const c = CR.cord, M = CR.mid, y = M.y - CR.liftS * 1.2, dx = c.ux * 3, dz = c.uz * 3;
      return crBoxOf([[M.x - dx, y - 0.4, M.z - dz], [M.x + dx, y - 0.4, M.z + dz], [M.x - dx, y + 1.5, M.z - dz], [M.x + dx, y + 1.5, M.z + dz]]);
    },
    on: () => CR.kind === 'line',
  };
  // the snap: the cord drops, dust along the line, the chalk line on the course (the game's jobReveal 'line' replaces it later: one line a site)
  function craftSnap(m) {
    const c = CR.cord; if (!c) return;
    const q = Array.isArray(m.q) && m.q.length ? clamp(+m.q[m.q.length - 1] || 0, 0, 1) : 0.8;
    CR.lines++; CR.q = q; CR.snapT = 0.4;
    for (let k = 0; k < 5; k++) { const t = 0.1 + 0.2 * k, x = c.x0 + c.ux * c.len * t, z = c.z0 + c.uz * c.len * t; dustBurst(x + c.nx * 0.3, c.y0 + 0.3, z + c.nz * 0.3, 6 + Math.round(6 * q), 2, 1.6, 1.2); }
    shake.t = 0.12; shake.amp = 0.08 * q;
    try { jobReveal('line', q, { site: CR.site }); } catch (e) { /* the line's props */ }
  }
  /** the screen rect (CSS px) of world points, padded; null when none is before the camera */
  const crBoxV = new THREE.Vector3(), crBoxOut = { x: 0, y: 0, w: 0, h: 0 };
  function crBoxOf(pts) {
    camera.updateMatrixWorld();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, n = 0;
    const W = typeof innerWidth === 'number' ? innerWidth : 390, Hh = typeof innerHeight === 'number' ? innerHeight : 844;
    for (const p of pts) {
      crBoxV.set(p[0], p[1], p[2]).project(camera); if (crBoxV.z <= -1 || crBoxV.z >= 1) continue;
      const x = (crBoxV.x * 0.5 + 0.5) * W, y = (-crBoxV.y * 0.5 + 0.5) * Hh;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); n++;
    }
    if (!n) return null;
    const pad = 22; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W, x1 + pad); y1 = Math.min(Hh, y1 + pad);
    if (x1 <= x0 || y1 <= y0) return null;
    const o = crBoxOut; o.x = Math.round(x0); o.y = Math.round(y0); o.w = Math.round(Math.max(44, x1 - x0)); o.h = Math.round(Math.max(44, y1 - y0));   // (one object, reused: a caller that keeps it copies it)
    return o;
  }
  /** his hands on the work (heroUpdate, between strokes): the saw's handle sliding with the blade; the cord's end held before him */
  function craftPose() {
    if (caPose()) return;   // ── crafta19 ── the survey: he kneels at the stake, the reel in his hands ── /crafta19 ──
    if (cbPose()) return;   // ── craftb19 ── his arm on the cloth; the plumb line held out ── /craftb19 ──
    if (CR.kind === 'saw') {
      const z = 0.42 + 0.5 * (1 - CR.blade);
      PZ.WR.set(-0.13, 1.72 - PZ.drop, z); PZ.WL.set(0.13, 1.72 - PZ.drop, z);
      frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
      finishBody(0.14 + 0.1 * (1 - CR.blade), 0.06 + 0.04 * CR.blade, 0, 0, 1);
      PZ.FL.set(0.26, 0.13, 0.34); PZ.FR.set(-0.26, 0.13, -0.3);
      PZ.look = null;
    } else if (CR.kind === 'line') {
      const ten = CR.caOn ? clamp(CR.caTenS, 0, 1.15) : 0;   // ── crafta19 ── (he leans back as the thumb pulls; the hands draw in) ── /crafta19 ──
      PZ.WR.set(-0.16, 1.55 - PZ.drop, 0.5 - 0.22 * ten); PZ.WL.set(0.16, 1.62 - PZ.drop, 0.5 - 0.22 * ten);
      frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
      finishBody(0.08 - 0.34 * ten, 0.03 + 0.08 * ten, 0, 0, 1);
      PZ.FL.set(0.24, 0.13, 0.1); PZ.FR.set(-0.24, 0.13, -0.1);
    }
  }
  const craftPosing = () => (!!CR.kind && CR.near && !hero.path) || caPosing();   // ── crafta19 ── (|| the survey's kneel) ── /crafta19 ──
  // the craft's props each frame (one instanced mesh): the bench and the log (parting), the blade, the kerf; the cord's 12 segments
  function craftTick(dt) {
    if (!CR.kind) { if (crMesh.visible) { crBegin(); crEnd(); } return; }
    CR.t += dt;
    const P = CR.at; CR.near = !!(P && !hero.path && Math.hypot(hero.x - P.x, hero.z - P.z) < 1.6);
    if (CR.done) { CR.after -= dt; if (CR.after <= 0) { CR.kind = null; CR.cord = null; CR.bench = null; crBegin(); crEnd(); return; } }
    crBegin();
    if (CR.kind === 'saw') {
      const b = CR.bench, gy = groundAt(b.x, b.z), top = gy + 1.9, cedar = '#B07A4A', wood = '#8C6A43';
      if (CR.parted) CR.partT += dt;
      // the trestles (two, at ±1.4), the log on them: whole until the kerf is through, then in two — the far piece dropped beside
      for (const lx of [-1.4, 1.4]) { benchW(b, lx, 0, crP); crPut(crP.x, gy + 0.68, crP.z, 0.22, 1.36, 0.9, b.yaw, wood); crPut(crP.x, gy + 1.42, crP.z, 0.5, 0.12, 1.1, b.yaw, wood); }
      if (!CR.parted) { benchW(b, 0, 0, crP); crPut(crP.x, gy + 1.62, crP.z, 4.2, 0.5, 0.55, b.yaw, cedar); }
      else {
        benchW(b, -0.6, 0, crP); crPut(crP.x, gy + 1.62, crP.z, 3.0, 0.5, 0.55, b.yaw, cedar);
        const u = easeIn(clamp(CR.partT / 0.5, 0, 1)); benchW(b, 1.5 + 0.35 * u, 0.25 * u, crP);
        crPut(crP.x, lerp(gy + 1.62, gy + 0.28, u), crP.z, 1.2, 0.5, 0.55, b.yaw + 0.5 * u, cedar, 0.9 * u);
      }
      // the kerf: a dark groove at the cut, running down with the model's c
      if (!CR.parted && CR.cut > 0.01) { benchW(b, 0.9, 0, crP); const dep = 0.5 * CR.cut; crPut(crP.x, top - dep / 2 + 0.01, crP.z, 0.05, dep + 0.02, 0.58, b.yaw, '#3A2A1A'); }
      // the blade: across the log at the cut, sliding between the two sawyers with `blade` (the kohen on −z)
      const z0 = -1.62 + (0.42 + 0.5 * (1 - CR.blade)) * HERO_S;
      benchW(b, 0.9, z0 + 1.15, crP); const yb = CR.parted ? top - 0.42 : top - 0.5 * CR.cut + 0.1;
      crPut(crP.x, yb, crP.z, 0.03, 0.16, 2.3, b.yaw, '#B9B6AE'); crPut(crP.x, yb + 0.1, crP.z, 0.04, 0.03, 2.3, b.yaw, wood);
      benchW(b, 0.9, z0, crP); crPut(crP.x, yb + 0.02, crP.z, 0.4, 0.06, 0.06, b.yaw, wood);
      benchW(b, 0.9, z0 + 2.3, crP); crPut(crP.x, yb + 0.02, crP.z, 0.4, 0.06, 0.06, b.yaw, wood);
    } else if (CR.kind === 'line') {
      const c = CR.cord;
      CR.liftS += (CR.lift - CR.liftS) * Math.min(1, dt * 14);
      // ── crafta19 ── the tension (my cord model): the sag eases out to straight as it rises, the colour brightens; snapped → straight on the course
      if (CR.caOn) { CR.caTenS += ((CR.snapT > 0 || CR.phase === 'snap' ? 1 : CR.caTen) - CR.caTenS) * Math.min(1, dt * 18); CR.caSag = 0.85 * Math.pow(1 - clamp(CR.caTenS, 0, 1), 1.4); CR.caHue = Math.min(5, Math.max(0, Math.round(clamp(CR.caTenS, 0, 1) * 5))); }
      // ── /crafta19 ──
      if (CR.snapT > 0) { CR.snapT -= dt; CR.liftS = 0; }
      // the cord's end in his hands (while he walks: at the far stake)
      const H = CR.hand;
      if (CR.near) { H.set(hero.x + Math.sin(hero.yaw) * 0.55 * HERO_S, hero.y + 1.6 * HERO_S, hero.z + Math.cos(hero.yaw) * 0.55 * HERO_S); }
      else H.set(c.x0 + c.ux * c.len, c.y0 + 0.9, c.z0 + c.uz * c.len);
      const ax = c.x0, ay = c.y0 + 0.9, az = c.z0, N = 12;
      CR.mid.set(lerp(ax, H.x, CR_LIFT_T), lerp(ay, H.y, CR_LIFT_T) + CR.liftS * 1.2, lerp(az, H.z, CR_LIFT_T));
      let px = ax, py = ay, pz = az;
      for (let k = 1; k <= N; k++) {
        const t = k / N, x = lerp(ax, H.x, t), y = lerp(ay, H.y, t) + crBump(t) * CR.liftS * 1.2 + (CR.snapT > 0 ? Math.sin(t * Math.PI * 3 + CR.snapT * 40) * 0.08 * CR.snapT : 0) - (CR.caOn ? Math.sin(Math.PI * t) * CR.caSag : 0), z = lerp(az, H.z, t);   // ── crafta19 ── (− the slack cord's sag, gone as it tightens) ── /crafta19 ──
        const dx = x - px, dy = y - py, dz = z - pz, L = Math.hypot(dx, dy, dz) || 0.01;
        crPut((x + px) / 2, (y + py) / 2, (z + pz) / 2, 0.07, 0.07, L, Math.atan2(dx, dz), CR.caOn ? CA_CORD[CR.caHue] : '#C0462E', -Math.asin(clamp(dy / L, -1, 1)));   // ── crafta19 ── (dull → bright as it tightens) ── /crafta19 ──
        px = x; py = y; pz = z;
      }
      crPut(ax, c.y0 + 0.45, az, 0.16, 1.0, 0.16, 0, '#6B4E31');   // the first stake
    }
    cbProps(dt);   // ── craftb19 ── the rub's bench and cloth, the plumb's stones, line and bob ── /craftb19 ──
    crEnd();
  }
  const CR_TQ = { ang: 0, h: 0, v: 0, mark: 0.7, phase: 'lift', pt: 0, i: 0, n: 0, over: false, done: false };
  const craftApi = {
    tread: { begin: treadBegin, end: treadEnd, on: () => TW.on,
      // (hands.js passes tread.js's model itself: its mark is a function, its feet an object — mapped to treadUpdate's shape, no allocation)
      update(M) { if (!M) return false; if (typeof M.mark !== 'function') return treadUpdate(M); const q = CR_TQ; q.ang = M.ang; q.h = M.h; q.v = M.v; q.mark = M.mark(); q.phase = M.phase; q.pt = M.pt; q.i = M.i; q.n = M.n; q.over = M.over; q.done = M.done; return treadUpdate(q); },
      box() { if (!TW.on) return null; const P = treadWheelPoint(), C = crane, fx = C.fwd.x, fz = C.fwd.y, r = 2.4; return crBoxOf([[P.x + fx * r, P.y + 2.4 + r, P.z + fz * r], [P.x - fx * r, P.y + 2.4 + r, P.z - fz * r], [P.x + fx * r, P.y + 2.4 - r, P.z + fz * r], [P.x - fx * r, P.y + 2.4 - r, P.z - fz * r]]); } },
    saw: craftSaw, line: craftLine,
  };
  // ── crafta19 ── the treadwheel's craft under two thumbs (FUN19 §2; the owner's notes 5, 18): the touch-down lifts his foot (kick), the
  // model's steps turn the wheel and wind the rope — the rope COILS on the drum, turn by turn, as the stone rises (one instanced mesh of
  // rope turns on the axle, ≤ 12); every stride's act answered on its frame (juice.hit: the "+N" over the wheel), the lift's bonus paid
  const CA_COIL = 12, caCoilM = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.16, 5, 14), new THREE.MeshStandardMaterial({ color: '#B89A62', roughness: 0.9 }), CA_COIL);
  caCoilM.name = 'crafta19-coil'; caCoilM.frustumCulled = false; caCoilM.visible = false; caCoilM.count = 0; caCoilM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(caCoilM);
  const caJ = { x: 0, y: 0, z: 0 }, CA_AT = { x: 0, y: 0, z: 0 }, CA_SVAT = { x: 0, y: 0, z: 0 }, caQ = new THREE.Quaternion(), caQ2 = new THREE.Quaternion();
  let caTurns = 0, caSpin = 0;
  function caCoil(dt) {
    const C = crane;
    if (!TW.on || !C.st || TW.st !== C.st) { if (caCoilM.visible) { caCoilM.visible = false; caCoilM.count = 0; } caTurns = 0; return; }
    // turns wound: two always on the drum, ten more over a stone's lift (h / mark)
    const want = 2 + 10 * clamp(TW.h / Math.max(0.05, TW.mark || 0.7), 0, 1);
    caTurns += (want - caTurns) * Math.min(1, dt * 6); caSpin = C.wheelA;
    const ry = C.g.rotation.y, cy = Math.cos(ry), sy = Math.sin(ry), by = C.byFix !== null ? C.byFix : craneY(C.st);
    const ax = C.bx + (-1.6) * sy, az = C.bz + (-1.6) * cy, ay = by + 4.6, n = Math.min(CA_COIL, Math.ceil(caTurns));
    caQ.setFromAxisAngle(UP, ry + Math.PI / 2); caQ2.setFromAxisAngle(tmpV.set(0, 0, 1), caSpin); caQ.multiply(caQ2);
    for (let k = 0; k < n; k++) {
      const u = (k - (CA_COIL - 1) / 2) * 0.17, r = 0.42 + 0.05 * Math.min(1, Math.max(0, caTurns - k));   // (along the axle; a turn grows in as it winds)
      tmpV.set(ax + cy * u, ay, az - sy * u); tmpS.set(r, r, r * 0.9); tmpM.compose(tmpV, caQ, tmpS); caCoilM.setMatrixAt(k, tmpM);
    }
    caCoilM.count = n; caCoilM.visible = n > 0; caCoilM.instanceMatrix.needsUpdate = true;
  }
  function caActs(M, at, trade) {
    const A = M && M.acts; if (!A || !M.juice) return;
    const P = globalThis.__BH_PARTS, J = P && P.juice;
    for (let i = 0; i < A.length; i++) { const a = A[i]; if (a.juiced) continue; a.juiced = true;
      try { const L = globalThis.__CRAFT_ACTS || (globalThis.__CRAFT_ACTS = []); if (L.length < 400) L.push({ t: performance.now(), kind: M.kind, n: a.n, q: a.q, pts: a.pts, p: a.power }); } catch (e) { /* tests' log */ }
      if (J && typeof J.hit === 'function') { caJ.x = at.x; caJ.y = at.y; caJ.z = at.z; try { J.hit('craft', { at: caJ, text: a.say ? `+${a.pts} ${a.say}` : `+${a.pts}`, perfect: a.q === 2, combo: 0, craft: trade, grade: a.q === 2 ? 'perfect' : a.q === 1 ? 'good' : 'soft', quality: a.q === 2 ? 1 : a.q === 1 ? 0.82 : 0.6, pts: a.pts }); } catch (e) { /* juice's */ } }
      try { const T = globalThis.__TWIN; if (T && typeof T.graded === 'function') T.graded(a.q); } catch (e) { /* twin's */ }
    }
    // (a bonus: its "+N" and word fly to the score like an act's — juice.hit with explicit pts; else straight to the score)
    const B = M.bonuses; if (B) for (const b of B) { if (b.done) continue; b.done = true; try { if (J && typeof J.hit === 'function') { caJ.x = at.x; caJ.y = at.y + 1.4; caJ.z = at.z; J.hit('craft', { at: caJ, text: `+${b.pts} ${b.say}`, perfect: false, combo: 0, craft: trade, grade: 'good', quality: 0.82, pts: b.pts }); } else { const S = P && P.score; if (S && typeof S.add === 'function') S.add(b.pts, `${M.kind}:${b.say}`); } } catch (e) { /* hook19's */ } }
  }
  {
    const T0 = craftApi.tread, up0 = T0.update;
    T0.raw = true;   // (hands.js passes the model itself: its acts)
    T0.touch = (down) => { if (down && TW.on) TW.kick = 1; };
    T0.act = () => true;   // (idempotent: update answers every act once)
    T0.update = (M) => { const r = up0(M); if (TW.on && M && M.juice) { const P = TW.at; if (P) { caJ.x = P.x; caJ.y = P.y + 5.2; caJ.z = P.z; caActs(M, caJ, 'המנופאים'); } caLiftAt(); } return r; };
    // (the coordinator, B2: __HANDS.atW() for the lift — the midpoint of the wheel's hub and the stone, live, so the closer craft camera
    //  keeps the stone rising in view; begin hands out the one object update moves)
    const b0 = T0.begin; T0.begin = (site) => { const r = b0(site); if (r && r.ok && r.at) { CA_AT.x = r.at.x; CA_AT.y = r.at.y + 3; CA_AT.z = r.at.z; caLiftAt(); r.at = CA_AT; } return r; };
  }
  // the dyed cord (note 17): my cord model's tension drives the world's sag and colour; the snap prints the red line (jobReveal 'line')
  const CA_CORD = ['#7E5446', '#93533F', '#A84F37', '#BD4B30', '#D24829', '#E84522'];
  Object.assign(CR, { caOn: false, caTen: 0, caTenS: 0, caSag: 0.85, caHue: 0 });
  const CA_LQ = { phase: 'ready', lift: 0, wind: 0, q: null, done: false };
  {
    const L0 = craftApi.line, up0 = L0.update, b0 = L0.begin;
    L0.raw = true;
    L0.begin = (site) => { const r = b0(site); CR.caOn = false; CR.caTen = 0; CR.caTenS = 0; return r; };
    L0.touch = (down, M) => { if (M && typeof M.touch === 'function') M.touch(down); if (down && CR.kind === 'line' && CR.caOn) { CR.caTen = Math.max(CR.caTen, 0.08); CR.caTenS = Math.max(CR.caTenS, 0.06); } };   // (the touch-down: his grip takes up the slack at once)
    L0.act = () => true;
    L0.update = (M) => {
      if (!M || typeof M.tension !== 'number') return up0(M);   // (the sheet's snap model, as before)
      if (CR.kind !== 'line') return false;
      CR.caOn = true; CR.caTen = M.phase === 'snap' || M.phase === 'done' ? 1 : Math.max(M.tension, M.grip || 0);
      CA_LQ.phase = M.phase === 'pull' || M.phase === 'auto' ? 'lift' : M.phase; CA_LQ.q = M.q; CA_LQ.done = M.done;
      const r = up0(CA_LQ);
      if (M.juice) { caJ.x = CR.mid.x; caJ.y = CR.mid.y + 0.6; caJ.z = CR.mid.z; caActs(M, caJ, 'המודדים'); }
      return r;
    };
  }
  // the survey (note 7; FUN19 §3, the Mount's measure): he kneels at the first stake with the reel; the measuring cord pays out with the
  // thumb toward the far stake (a visual 36 amot: המחשה), sagging while it runs and taut at the release; the stakes of the measured line
  // drive in (the world's own survey pegs); the counter in amot is the game's (index.js), from caSurvey()
  const CS = { on: false, site: null, x: 0, y: 0, z: 0, ux: 1, uz: 0, L: 16, u: 0, uS: 0, phase: '', side: 0, grip: 0, near: false, done: false, after: 0, spin: 0, end: new THREE.Vector3(), mid: new THREE.Vector3() };
  const CS_N = 14, csMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.85 }), CS_N + 3);
  csMesh.name = 'crafta19-survey'; csMesh.frustumCulled = false; csMesh.visible = false; csMesh.count = 0; csMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(csMesh);
  { const c = new THREE.Color(1, 1, 1); for (let i = 0; i < CS_N + 3; i++) csMesh.setColorAt(i, c); }
  let csK = 0;
  function csPut(x, y, z, w, h, d, yaw, hex, pitch = 0) { if (csK >= CS_N + 3) return; tmpE.set(pitch, yaw, 0, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(x, y, z); tmpS.set(w, h, d); tmpM.compose(tmpV, tmpQ, tmpS); csMesh.setMatrixAt(csK, tmpM); csMesh.setColorAt(csK, crC.set(hex)); csK++; }
  const caPosing = () => (CS.on && CS.near && !hero.path) || (KS.on && !KS.gone && KS.landT < 0 && !hero.path) || (CL.on && !CL.done && !hero.path);
  function caPose() {
    if (!caPosing()) return false;
    if (CL.on && !CL.done && !(CS.on && CS.near)) {   // hand over hand on the rope: high, and back with every heave
      const hv = CL.M ? CL.M.heave : 0, g = CL.grip, alt = CL.M && CL.M.k % 2 ? 1 : -1;
      PZ.WR.set(-0.14, 3.1 - 0.7 * hv * (alt > 0 ? 1 : 0.4) - 0.15 * g, 0.55); PZ.WL.set(0.14, 3.3 - 0.7 * hv * (alt < 0 ? 1 : 0.4) - 0.15 * g, 0.6);
      frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
      finishBody(-0.1 - 0.32 * hv - 0.08 * g, 0.06 + 0.12 * hv, 0, 0, 1); PZ.FL.set(0.25, 0.13, 0.36); PZ.FR.set(-0.25, 0.13, -0.32); PZ.look = null;
      return true;
    }
    if (KS.on && !(CS.on && CS.near)) {   // the tagline in both hands, reaching toward the stone, leaning back a little as it comes down
      const r = 0.06 * Math.sin(time * 1.7), k = 1 - clamp(KS.y, 0, 1);
      PZ.WR.set(-0.12, 2.25 - 0.35 * k, 0.62 + r); PZ.WL.set(0.14, 2.45 - 0.35 * k, 0.72 + r);
      frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
      finishBody(-0.08 - 0.08 * k, 0.05 + 0.06 * k, 0, 0, 1); PZ.FL.set(0.25, 0.13, 0.32); PZ.FR.set(-0.25, 0.13, -0.3); PZ.look = null;
      return true;
    }
    const r = Math.sin(CS.spin) * 0.07, g = CS.grip;
    PZ.WR.set(-0.14 + r, 1.25 - 0.1 * g, 0.62 + r); PZ.WL.set(0.14 - r, 1.3 - 0.1 * g, 0.6 - r);
    frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
    finishBody(0.42 + 0.06 * g, 0.62, 0, 0, 1);
    PZ.FL.set(0.26, 0.13, 0.5); PZ.FR.set(-0.24, 0.05, -0.62);   // (one knee down: the reel before him)
    PZ.look = null;
    return true;
  }
  function caSvTick(dt) {
    if (!CS.on) { if (csMesh.visible) { csMesh.visible = false; csMesh.count = 0; } return; }
    if (CS.done) { CS.after -= dt; if (CS.after <= 0) { CS.on = false; csMesh.visible = false; csMesh.count = 0; return; } }
    CS.near = !hero.path && Math.hypot(hero.x - CS.x, hero.z - CS.z) < 3;
    const was = CS.uS; CS.uS += ((CS.phase === 'stamp' || CS.phase === 'done' ? 1 : clamp(CS.u, 0, 1.2)) - CS.uS) * Math.min(1, dt * 16); CS.spin += (CS.uS - was) * 40;
    const sx = CS.x + CS.ux * 0.9, sz = CS.z + CS.uz * 0.9, sy = groundAt(sx, sz), Lc = Math.max(0.3, CS.L * CS.uS), ex = sx + CS.ux * Lc, ez = sz + CS.uz * Lc, ey = groundAt(ex, ez);
    CS.end.set(ex, ey + 1.0, ez); CS.mid.set((sx + ex) / 2, (sy + ey) / 2 + 1, (sz + ez) / 2);
    if (!CS.done) { CA_SVAT.x = sx + CS.ux * Math.max(4, CS.L * 0.5); CA_SVAT.y = sy + 1.2; CA_SVAT.z = sz + CS.uz * Math.max(4, CS.L * 0.5); }   // (the cord's half-way: the whole run in frame)
    const taut = CS.phase === 'stamp' || CS.phase === 'done', sag = taut ? 0 : 0.5 + 0.4 * CS.uS;
    csK = 0;
    let px = sx, py = sy + 1.0, pz = sz;
    for (let k = 1; k <= CS_N; k++) {
      const t = k / CS_N, x = lerp(sx, ex, t), z = lerp(sz, ez, t), y = groundAt(x, z) + 1.0 - (taut ? 0.4 * t : Math.sin(Math.PI * t) * sag + 0.6 * t);
      const dx = x - px, dy = y - py, dz = z - pz, L = Math.hypot(dx, dy, dz) || 0.01;
      csPut((x + px) / 2, (y + py) / 2, (z + pz) / 2, 0.08, 0.08, L, Math.atan2(dx, dz), taut ? '#F2E6C4' : '#D8C9A0', -Math.asin(clamp(dy / L, -1, 1)));
      px = x; py = y; pz = z;
    }
    csPut(sx, sy + 0.5, sz, 0.18, 1.1, 0.18, 0, '#6B4E31');   // the first stake
    const fx = CS.x + CS.ux * (CS.L + 0.9), fz = CS.z + CS.uz * (CS.L + 0.9), fy = groundAt(fx, fz);
    csPut(fx, fy + 0.8, fz, 0.2, 1.6, 0.2, 0, '#6B4E31'); csPut(fx, fy + 1.7, fz, 0.34, 0.24, 0.34, 0, '#FFD66E');   // the far stake, its gold cap
    csMesh.count = csK; csMesh.visible = true; csMesh.instanceMatrix.needsUpdate = true; if (csMesh.instanceColor) csMesh.instanceColor.needsUpdate = true;
  }
  craftApi.survey = {
    raw: true,
    begin(site) {
      const st = ST[site];
      if (site !== 'har' || !st || st.status !== 'building' || TS.run || TW.on || CR.kind || CS.on && !CS.done) return { ok: false, why: 'site' };
      // (the cord runs away from the camera, up the screen: the stake, the cord, the far stake and the counter all in one frame)
      let dx = hero.x - camera.position.x, dz = hero.z - camera.position.z; if (Math.hypot(dx, dz) < 1) { dx = X1 - 8 - hero.x; dz = 36 - hero.z; }
      const l = Math.hypot(dx, dz) || 1;
      Object.assign(CS, { on: true, site, x: hero.x, y: hero.y, z: hero.z, ux: dx / l, uz: dz / l, u: 0, uS: 0, phase: 'ready', side: 0, grip: 0, done: false, after: 0, near: true });
      hero.face = [hero.x + CS.ux * 3, hero.z + CS.uz * 3];
      survey.on = true; survey.n = 0; survey.x = hero.x; survey.z = hero.z; survey.ux = CS.ux; survey.uz = CS.uz; propsDirty = true;
      CA_SVAT.x = hero.x + CS.ux * 4; CA_SVAT.y = hero.y + 1.2; CA_SVAT.z = hero.z + CS.uz * 4;
      return { ok: true, at: CA_SVAT };   // (live: the cord's middle as it pays out — the closer camera keeps it in)
    },
    touch(down, M) { if (M && typeof M.touch === 'function') M.touch(down); CS.grip = down ? 1 : 0; },
    act: () => true,
    update(M) {
      if (!CS.on || !M) return false;
      CS.u = +M.u || 0; CS.side = M.side | 0;
      if (M.phase === 'stamp' && CS.phase !== 'stamp') { survey.n = Math.min(12, Math.round(12 * (CS.side + 1) / Math.max(1, M.sides))); propsDirty = true; dustBurst(CS.end.x, CS.end.y - 0.6, CS.end.z, 10, 3, 2, 1.2); sparkBurst(CS.end.x, CS.end.y + 0.6, CS.end.z, 14, 3, 5); }
      CS.phase = M.phase || '';
      if (M.juice) { caJ.x = CS.end.x; caJ.y = CS.end.y + 1.2; caJ.z = CS.end.z; caActs(M, caJ, 'המודדים'); }
      return true;
    },
    end() { if (!CS.on) return false; CS.done = true; CS.after = 1.6; CS.grip = 0; survey.n = 12; propsDirty = true; return true; },
    box() { if (!CS.on) return null; return crBoxOf([[CS.x, CS.y + 2.5, CS.z], [CS.end.x, CS.end.y + 1.5, CS.end.z], [CS.x, CS.y, CS.z], [CS.end.x, CS.end.y - 1, CS.end.z]]); },
    on: () => CS.on,
  };
  function caSurvey(out) { const o = out || {}; o.on = CS.on; o.u = CS.uS; o.phase = CS.phase; o.side = CS.side; o.near = CS.near; o.grip = CS.grip; o.ex = CS.end.x; o.ey = CS.end.y; o.ez = CS.end.z; o.pegs = survey.n; o.spin = CS.spin; o.bow = PZ.bow; o.drop = PZ.drop; return o; }
  // the key stone on the crane (RESEARCH19's B2, approved): the site's crane hangs the stone over its slot (nextSlot); the model's hang
  // (y 1 → 0) lowers it 7 amot onto its bed, its offset along the course moves it; a shadow under it shrinks onto the slot as it nears, a
  // gold frame marks the slot; he holds the tagline at his banker (his arms toward the stone); the landing: a bounce, dust, the count
  // (the game's own lift is then taken at once: caLiftNow — no second lift of the same stone)
  const KS = { on: false, st: null, site: null, s: null, ux: 1, uz: 0, hy: 7, hx: 0, hz: 0, y: 1, off: 0, gone: false, landT: -1, done: false, after: 0, skip: null, skipT: -9, at: { x: 0, y: 0, z: 0 } };
  const KS_HANG = 7, ksMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#FFD66E' }), 5);
  ksMesh.name = 'crafta19-keyslot'; ksMesh.frustumCulled = false; ksMesh.visible = false; ksMesh.count = 0; ksMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(ksMesh);
  const ksShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#1A120A', transparent: true, opacity: 0.4, depthWrite: false }));
  ksShadow.name = 'crafta19-keyshadow'; ksShadow.visible = false; ksShadow.renderOrder = 2; scene.add(ksShadow);
  const ksTag = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#B89A62', roughness: 0.9 })); ksTag.name = 'crafta19-tagline'; ksTag.visible = false; scene.add(ksTag);
  // ── site20 ── the key stone's landing (RESEARCH19: "+N far from the stone, the stone half behind the dither, near the top of the frame"):
  // a dust ring on the bed, a 0.12-s nudge of the camera, the sparks — on the music's downbeat when the thud was moved to it
  KS.fx = -1; KS.dly = 0; KS.dlyT = -9;
  function ksLand() {
    KS.fx = -1; const s = KS.s; if (!s) return;
    const by = s.y - s.h * 0.5 + 0.25;
    dustBurst(s.face[0], s.y - s.h * 0.4, s.face[2], 14, 3.5, 2.2, 1.3); sparkBurst(s.x, s.y + s.h * 0.6, s.z, 12, 3, 5);
    dust.spawn(s.x, by, s.z, 22, PO(0.3, 0.15, 4.2, 0.25, 1.5, 3.8, 1.2, 0, 2.2, 0.55, false, Math.max(s.w, s.d) * 0.45));   // (the ring: the puffs start on a circle round the bed and spread)
    shake.t = Math.max(shake.t, 0.12); shake.amp = Math.max(shake.amp, 0.2);
  }
  /** the model's thud for the stone's landing: moved to the music's next beat when that is ≤ 0.35 s away (hands.js asks) → handled */
  function ksSfx(e, play) {
    if (!KS.on || e.sfx !== 'thud') return false;
    let d = 0; try { const M = globalThis.__BH_MUSIC, b = M && typeof M.beat === 'function' ? M.beat() : null; if (b && b.period > 0.2 && Number.isFinite(+b.toNext)) { const t = ((+b.toNext % b.period) + b.period) % b.period; if (t > 0.02 && t <= 0.35) d = t; } } catch (err) { d = 0; }
    if (d <= 0) return false;
    if (KS.landT >= 0 && time - KS.landT < 0.25 && KS.fx >= 0) KS.fx = KS.landT + d; else { KS.dly = d; KS.dlyT = time; }
    setTimeout(() => { try { play('thud', e.o || {}); } catch (err) { /* sfx's */ } }, d * 1000);
    return true;
  }
  // ── /site20 ──
  function ksTick(dt) {
    if (!KS.on) { if (ksMesh.visible) { ksMesh.visible = false; ksShadow.visible = false; ksTag.visible = false; } return; }
    if (KS.done) { KS.after -= dt; if (KS.after <= 0) { KS.on = false; const C = crane; if (C.st === KS.st) C.calm = !!(KS.st && KS.st.lifted); return; } }
    const s = KS.s, C = crane;
    // the stone's place: over the slot, offset along the course; the bounce of the landing
    const bt = KS.landT >= 0 ? (time - KS.landT) : -1, bounce = bt >= 0 && bt < 0.35 ? Math.sin(bt / 0.35 * Math.PI) * 0.18 * (1 - bt / 0.35) : 0;
    KS.hy = KS.y * KS_HANG + bounce;
    KS.hx = s.x + KS.ux * KS.off * s.w; KS.hz = s.z + KS.uz * KS.off * s.w;
    KS.at.x = KS.hx; KS.at.y = s.y + KS.hy; KS.at.z = KS.hz; KS.at.ks = true;   // ── site20 ── (__HANDS.atW: the stone's own point — the camera frames it; was the midpoint between him and it) ── /site20 ──
    if (KS.fx >= 0 && time >= KS.fx) ksLand();   // ── site20 ── (the landing's dust ring, nudge and sparks on the beat) ── /site20 ──
    // the slot's gold frame (4 bars at the bed's top), the shadow shrinking onto it as the stone nears
    const top = s.y - s.h / 2 + 0.04, c = Math.cos(s.yaw), sn = Math.sin(s.yaw), hw = s.w / 2, hd = s.d / 2, glow = KS.gone ? 0 : 1;
    let k = 0;
    const bar = (lx, lz, w, d) => { tmpV.set(s.x + lx * c + lz * sn, top + 0.03, s.z - lx * sn + lz * c); tmpE.set(0, s.yaw, 0, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpS.set(w, 0.06 * glow + 1e-4, d); tmpM.compose(tmpV, tmpQ, tmpS); ksMesh.setMatrixAt(k++, tmpM); };
    bar(0, hd, s.w, 0.1); bar(0, -hd, s.w, 0.1); bar(hw, 0, 0.1, s.d); bar(-hw, 0, 0.1, s.d);
    ksMesh.count = k; ksMesh.visible = !KS.gone; ksMesh.instanceMatrix.needsUpdate = true;
    const u = clamp(KS.y, 0, 1), sc = 1 + 0.9 * u;
    ksShadow.position.set(KS.hx, top + 0.06, KS.hz); ksShadow.rotation.set(0, s.yaw, 0); ksShadow.scale.set(s.w * sc, 1, s.d * sc);
    ksShadow.material.opacity = 0.18 + 0.5 * (1 - u); ksShadow.visible = !KS.gone && KS.landT < 0;
    // the tagline: from his hands to the stone's near corner
    if (!KS.gone && KS.landT < 0) {
      hA.set(hero.x + Math.sin(hero.yaw) * 0.8, hero.y + 2.4, hero.z + Math.cos(hero.yaw) * 0.8); hB.set(KS.hx, s.y + KS.hy - s.h * 0.3, KS.hz);
      const L = hA.distanceTo(hB); ksTag.position.copy(hA).lerp(hB, 0.5); ksTag.lookAt(hB); ksTag.scale.set(0.05, 0.05, L); ksTag.visible = L < 40;
    } else ksTag.visible = false;
  }
  /** the game's lift of the stone he just set: taken at once where he set it (the count) — never a second lift of the same stone */
  function caLiftNow(id, o) {
    if (KS.skip !== id || time - KS.skipT > 6) return null;
    KS.skip = null;
    const st = ST[id]; if (!st || st.status !== 'building') return null;
    const L = layout(st), i = nextWorkIdx(L); if (i < 0) return null;
    const b = L.blocks[L.order[i]];
    return new Promise((resolve) => { try { liftLand({ st, b, i, t: 0, dur: 0.3, great: !!(o && o.great), resolve }); } catch (e) { resolve(false); } KS.gone = true; });
  }
  craftApi.crane = {
    raw: true,
    begin(site) {
      const st = ST[site], C = crane;
      if (!st || st.status !== 'building' || st.disp < FOUND || !st.lay || st.lay.kind === 'cast' || TS.run || TW.on || CR.kind || (KS.on && !KS.done)) return { ok: false, why: 'site' };
      if (C.st !== st) { cranePref = site; craneAssign(); }
      if (C.st !== st || C.lift || lifts.length) return { ok: false, why: 'crane' };
      const sl = nextSlot(site); if (!sl || !Array.isArray(sl.face)) return { ok: false, why: 'slot' };
      try { if (site === 'har') { if (!st.harPosed) harCranePose(st); } else if (!st.posed || C.glide) poseAt(st, craneWorkPose(st, sl, C.H)); } catch (e) { /* the pose as it is */ }
      let ux = 1, uz = 0; try { [ux, uz] = slotTangent(site, sl); } catch (e) { /* along x */ }
      Object.assign(KS, { on: true, st, site, s: sl, ux, uz, y: 1, off: 0, gone: false, landT: -1, done: false, after: 0, hy: KS_HANG });
      C.calm = true; C.glide = null;
      C.block.scale.set(sl.w * 0.98, sl.h * 0.97, sl.d); C.block.geometry = st.def.stone === 'field' ? C.fieldBlock : C.boxBlock; C.blockMat.color.set(STONE[st.def.stone] || STONE.ash);
      // he faces the stone where he stands (his banker; no walk)
      hero.face = [sl.x, sl.z];
      KS.at.x = sl.x; KS.at.y = sl.y + KS_HANG; KS.at.z = sl.z; KS.at.ks = true; KS.fx = -1; KS.dly = 0;   // ── site20 ── (the stone's own point, not the midpoint: the craft camera frames the stone) ── /site20 ──
      tsLog({ id: 'crane', stage: site, kind: 'crane', at: 'begin', slot: [sl.x, sl.y, sl.z].map((v) => Math.round(v * 10) / 10) });
      return { ok: true, at: KS.at };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') M.touch(down); },
    act: () => true,
    update(M) {
      if (!KS.on || !M || typeof M.y !== 'number') return false;
      KS.y = clamp(M.y, 0, 1); KS.off = typeof M.off === 'function' ? M.off() : 0;
      if (M.phase === 'set' && KS.landT < 0) {
        KS.landT = time;   // ── site20 ── (the landing's effects: ksLand, on the music's beat when the thud was moved to it) ── /site20 ──
        KS.fx = time + (time - KS.dlyT < 0.25 ? KS.dly : 0); KS.dly = 0; if (KS.fx <= time) ksLand();
      }
      if (M.juice) { caJ.x = KS.hx; caJ.y = KS.s.y + KS.hy + KS.s.h * 0.5 + 0.1; caJ.z = KS.hz; caActs(M, caJ, 'המנופאים'); }   // ── site20 ── (the "+N" is born ON the stone's top) ── /site20 ──
      return true;
    },
    end(r) {
      if (!KS.on) return false;
      KS.done = true; KS.after = 0.25;
      if (KS.fx >= 0) ksLand();   // ── site20 ── ── /site20 ──
      if (KS.landT >= 0 && r && !r.skipped) { KS.skip = KS.site; KS.skipT = time; }   // (the game's lift of this stone follows at once: caLiftNow)
      else KS.gone = true;
      return true;
    },
    box() { if (!KS.on || !KS.s) return null; const s = KS.s; return crBoxOf([[KS.hx, s.y + KS.hy + s.h, KS.hz], [s.x, s.y - s.h, s.z], [hero.x, hero.y + 3.5, hero.z]]); },
    on: () => KS.on,
    sfx: ksSfx,   // ── site20 ── (hands.js: the thud on the beat) ── /site20 ──
  };
  // dressing at the banker (B2): his raised mallet falls on the chisel at each stroke the model asks for (a swipe, a tap); the contact
  // is the act (the model grades it on the beat); the struck margin of the stone on his banker turns smooth and pale, strip by strip
  const DS = { on: false, site: null, M: null, busy: false, done: false, after: 0, at: { x: 0, y: 0, z: 0 } };
  const dsMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#F4EDDC', roughness: 0.55, emissive: '#3A2E1A', emissiveIntensity: 0.25 }), 4);
  dsMesh.name = 'crafta19-margins'; dsMesh.frustumCulled = false; dsMesh.visible = false; dsMesh.count = 0; dsMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(dsMesh);
  function dsTick(dt) {
    if (!DS.on) { if (dsMesh.visible) { dsMesh.visible = false; dsMesh.count = 0; } return; }
    if (DS.done) { DS.after -= dt; if (DS.after <= 0) { DS.on = false; dsMesh.visible = false; dsMesh.count = 0; return; } }
    const M = DS.M; if (!M || !wp.state) { dsMesh.visible = false; return; }
    const W = HSt.w, D = HSt.d, y = HSt.y1 + 0.012, m = 0.11, P = M.prog;
    wpToWorld(0, HSt.y1, 0, hD); DS.at.x = (hero.x + hD.x) / 2; DS.at.y = hD.y + 0.5; DS.at.z = (hero.z + hD.z) / 2;
    tmpE.set(0, wp.yaw, 0, 'YXZ'); tmpQ.setFromEuler(tmpE);
    let k = 0;
    // (front, right, back, left: each strip grows from its corner as its strokes land)
    const strip = (cx, cz, along, len, u) => { if (u <= 0.001) return; const l = len * u; wpToWorld(along ? cx - (len - l) / 2 : cx, y, along ? cz : cz - (len - l) / 2, hE); tmpS.set((along ? l : m) * S_, 0.02 * S_, (along ? m : l) * S_); tmpM.compose(hE, tmpQ, tmpS); dsMesh.setMatrixAt(k++, tmpM); };
    strip(0, -D / 2 + m / 2, true, W, P[0]); strip(W / 2 - m / 2, 0, false, D, P[1]); strip(0, D / 2 - m / 2, true, W, P[2]); strip(-W / 2 + m / 2, 0, false, D, P[3]);
    dsMesh.count = k; dsMesh.visible = k > 0; dsMesh.instanceMatrix.needsUpdate = true;
  }
  function dsStrike() {
    const M = DS.M; if (!M || DS.busy || !M.queue.length) return;
    const tap = M.queue.shift(); DS.busy = true;
    heroAct('dress', undefined, { snap: true, shake: false }).then((hit) => {
      DS.busy = false; M.pending = Math.max(0, M.pending - 1);
      if (!DS.on || DS.done) return;
      const a = M.impact(hit !== false ? tap : true);   // (no contact — he was moved: still a stroke, ≤ good; a job always finishes)
      if (a) { caJ.x = hero.contact.x; caJ.y = hero.contact.y + 0.4; caJ.z = hero.contact.z; caActs(M, caJ, 'סתתים'); if (a.q >= 2) sparkBurst(hero.contact.x, hero.contact.y + 0.1, hero.contact.z, 10, 2, 3); }
      if (M.phase === 'end' && wp.state && wp.state !== 'field') { wpSet('drafted'); sparkBurst(wp.x, wp.y + HSt.y1 * S_, wp.z, 26, 3, 6); }
      dsStrike();
    });
  }
  craftApi.dress = {
    raw: true,
    begin(site) {
      const st = ST[site];
      if (!st || st.status !== 'building' || TS.run || TW.on || CR.kind || (DS.on && !DS.done) || KS.on && !KS.done) return { ok: false, why: 'site' };
      if (!wp.state || Math.hypot(wp.x - hero.x, wp.z - hero.z) > 5 * HERO_S) { wpFront(hero.x, hero.z, hero.yaw); wpSet(hero.tool === 'wood' ? 'field' : 'rough'); }
      else if (wp.state !== 'field') wpSet('rough');
      wp.auto = false;
      Object.assign(DS, { on: true, site, M: null, busy: false, done: false, after: 0 });
      heroArm('dress');
      wpToWorld(0, HSt.y1, 0, hD); DS.at.x = (hero.x + hD.x) / 2; DS.at.y = hD.y + 0.5; DS.at.z = (hero.z + hD.z) / 2;
      return { ok: true, at: DS.at };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') { M.touch(down); if (down && DS.on) { DS.M = M; dsStrike(); } } },   // (the touch-down: the mallet falls at once)
    act: () => true,
    update(M) { if (!DS.on || !M || !Array.isArray(M.queue)) return false; DS.M = M; if (!hero.armed && !DS.busy) heroArm('dress'); dsStrike(); return true; },
    end() { if (!DS.on) return false; DS.done = true; DS.after = 2.5; hero.armed = null; return true; },
    box() { if (!DS.on || !wp.state) return null; wpToWorld(-HSt.w / 2, HSt.y1, -HSt.d / 2, hA); wpToWorld(HSt.w / 2, HSt.y1, HSt.d / 2, hB); return crBoxOf([[hA.x, hA.y, hA.z], [hB.x, hB.y, hB.z], [hero.x, hero.y + 3.6, hero.z]]); },
    on: () => DS.on,
  };
  function caDress() { const M = DS.M; return { on: DS.on, busy: DS.busy, prog: M ? M.prog.slice() : null, m: M ? M.m : 0, strips: dsMesh.count, wp: wp.state, armed: !!hero.armed, stroke: hero.stroke ? hero.stroke.kk : null }; }
  // the column pull (B2): a marble column lies before him, its foot at the socket; the shear legs stand over it, the rope runs from its
  // head over their pulley down to his hands; each heave raises it (the model's u: 0 lying → 1 standing) and he leans back on the rope;
  // at 90° it drops into its socket with dust. One mesh each (the column, the legs, the rope): no allocation per frame
  const CL = { on: false, site: null, M: null, x: 0, z: 0, fx: 0, fz: 1, u: 0, grip: 0, stood: false, done: false, after: 0, at: { x: 0, y: 0, z: 0 } };
  const CL_LEN = 9, clCol = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, CL_LEN, 14).translate(0, CL_LEN / 2, 0), new THREE.MeshStandardMaterial({ color: '#EDE6D6', roughness: 0.5 }));
  clCol.name = 'crafta19-column'; clCol.visible = false; clCol.castShadow = true; scene.add(clCol);
  const clLegs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#7A5A3A', roughness: 0.9 }), 4);
  clLegs.name = 'crafta19-shear'; clLegs.frustumCulled = false; clLegs.visible = false; clLegs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(clLegs);
  const clV = new THREE.Vector3(), clV2 = new THREE.Vector3();
  function clBar(k, a, b, r) { const L = a.distanceTo(b); tmpV.copy(a).lerp(b, 0.5); tmpQ.setFromUnitVectors(UP, tmpV2.copy(b).sub(a).normalize()); tmpS.set(r, L, r); tmpM.compose(tmpV, tmpQ, tmpS); clLegs.setMatrixAt(k, tmpM); }
  function clTick(dt) {
    if (!CL.on) { if (clCol.visible) { clCol.visible = false; clLegs.visible = false; } return; }
    if (CL.done) { CL.after -= dt; if (CL.after <= 0) { CL.on = false; clCol.visible = false; clLegs.visible = false; return; } }
    const M = CL.M, u = M ? clamp(M.u, 0, 1) : CL.u; CL.u = u;
    const gy = groundAt(CL.x, CL.z), ang = (Math.PI / 2) * (1 - u);   // (0: standing; π/2: lying toward him)
    // the column: its foot at the socket, tipped toward him by ang about the axis across his line
    clCol.position.set(CL.x, gy - (CL.stood ? 0 : 0) , CL.z);
    tmpE.set(0, Math.atan2(CL.fx, CL.fz), 0, 'YXZ'); tmpQ.setFromEuler(tmpE); clCol.quaternion.copy(tmpQ); clCol.rotateX(-ang);
    clCol.visible = true;
    // the head (where the rope is tied), the shear legs' apex over the socket, the rope to his hands
    clV.set(0, CL_LEN, 0).applyQuaternion(clCol.quaternion).add(clCol.position);
    const ax = CL.x + CL.fx * 1.5, az = CL.z + CL.fz * 1.5, apex = clV2.set(ax, gy + CL_LEN + 2.2, az);
    const sx = -CL.fz, sz = CL.fx;
    clBar(0, hA.set(CL.x - CL.fx * 2 + sx * 3, gy, CL.z - CL.fz * 2 + sz * 3), apex, 0.22); clBar(1, hA.set(CL.x - CL.fx * 2 - sx * 3, gy, CL.z - CL.fz * 2 - sz * 3), apex, 0.22);
    clBar(2, clV, apex, 0.07);
    hB.set(hero.x + Math.sin(hero.yaw) * 0.7, hero.y + 2.6, hero.z + Math.cos(hero.yaw) * 0.7); clBar(3, apex, hB, 0.07);
    clLegs.count = 4; clLegs.visible = true; clLegs.instanceMatrix.needsUpdate = true;
    CL.at.x = (CL.x + hero.x) / 2; CL.at.y = gy + CL_LEN * 0.45; CL.at.z = (CL.z + hero.z) / 2;
    if (M && M.phase !== 'raise' && !CL.stood) { CL.stood = true; dustBurst(CL.x, gy + 0.4, CL.z, 22, 4, 3, 1.6); shake.t = 0.22; shake.amp = 0.2; }
  }
  craftApi.pull = {
    raw: true,
    begin(site) {
      const st = ST[site];
      if (!st || st.status !== 'building' || TS.run || TW.on || CR.kind || (CL.on && !CL.done) || (DS.on && !DS.done) || (KS.on && !KS.done)) return { ok: false, why: 'site' };
      // the socket 13 amot before him, away from the camera (up the screen: the column rises in the frame); he stands where he is
      let dx = hero.x - camera.position.x, dz = hero.z - camera.position.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      Object.assign(CL, { on: true, site, M: null, x: hero.x + dx * 13, z: hero.z + dz * 13, fx: -dx, fz: -dz, u: 0, grip: 0, stood: false, done: false, after: 0 });
      hero.face = [hero.x + dx * 3, hero.z + dz * 3];
      CL.at.x = hero.x + dx * 6; CL.at.y = hero.y + 3; CL.at.z = hero.z + dz * 6;
      return { ok: true, at: CL.at };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') M.touch(down); CL.grip = down ? 1 : 0; },
    act: () => true,
    update(M) { if (!CL.on || !M || typeof M.u !== 'number') return false; CL.M = M; if (M.juice) { caJ.x = clV.x; caJ.y = clV.y + 0.5; caJ.z = clV.z; caActs(M, caJ, 'הבנאים'); } return true; },
    end() { if (!CL.on) return false; CL.done = true; CL.after = 2.8; return true; },
    box() { if (!CL.on) return null; return crBoxOf([[CL.x, groundAt(CL.x, CL.z), CL.z], [clV.x, clV.y, clV.z], [hero.x, hero.y + 3.6, hero.z]]); },
    on: () => CL.on,
  };
  function caColumn() { const M = CL.M; return { on: CL.on, u: CL.u, k: M ? M.k : 0, phase: M ? M.phase : '', stood: CL.stood, grip: CL.grip, head: [clV.x, clV.y, clV.z].map((v) => +v.toFixed(2)), bow: PZ.bow }; }
  function caKey() { const C = crane; return { on: KS.on, site: KS.site, y: KS.y, off: KS.off, landT: KS.landT, gone: KS.gone, shadow: ksShadow.visible ? +ksShadow.scale.x.toFixed(2) : 0, shadowO: +ksShadow.material.opacity.toFixed(2), block: [C.block.position.x, C.block.position.y, C.block.position.z].map((v) => +v.toFixed(2)), carry: C.block.visible, slot: KS.s ? [KS.s.x, KS.s.y, KS.s.z].map((v) => +v.toFixed(2)) : null, tag: ksTag.visible, skip: KS.skip }; }
  function caCord() { return { kind: CR.kind, on: CR.caOn, ten: CR.caTen, tenS: CR.caTenS, sag: CR.caSag, hue: CR.caHue, lines: CR.lines, phase: CR.phase, near: CR.near, midY: CR.kind === 'line' ? CR.mid.y : 0, bow: PZ.bow }; }
  function caLiftAt() {
    const C = crane; if (!TW.on || !C.st) return;
    const ry = C.g.rotation.y, by = C.byFix !== null ? C.byFix : craneY(C.st), hx = C.bx - 1.6 * Math.sin(ry), hz = C.bz - 1.6 * Math.cos(ry), hy = by + 4.6, B = C.block.position;
    const ok = C.block.visible && Number.isFinite(B.x);
    CA_AT.x = ok ? (hx + B.x) / 2 : hx; CA_AT.y = ok ? (hy + B.y) / 2 : hy; CA_AT.z = ok ? (hz + B.z) / 2 : hz;
  }
  /** tests: the treadwheel as the player sees it */
  function caTread() { const C = crane; return { on: TW.on, inWheel: TW.inWheel, h: TW.h, v: TW.v, phase: TW.phase, i: TW.i, set: TW.set.length, wheelA: C.wheelA, ropeL: C.ropeL, turns: caCoilM.count, kick: TW.kick || 0, ph: hero.ph, walk: hero.walkAmt, block: [C.block.position.x, C.block.position.y, C.block.position.z] }; }
  // ── /crafta19 ──
  /** the craft running now (tests, crews.js): fills `out` — no allocation when one is passed */
  function craftState(out) {
    const o = out && typeof out === 'object' ? out : {};
    o.kind = CR.kind; o.site = CR.site; o.near = CR.near; o.done = CR.done; o.t = CR.t;
    o.blade = CR.blade; o.cut = CR.cut; o.plank = CR.plank; o.parted = CR.parted; o.lift = CR.liftS; o.phase = CR.phase; o.lines = CR.lines; o.snapT = CR.snapT;
    o.at = CR.at ? [CR.at.x, CR.at.y, CR.at.z] : null; o.midY = CR.kind === 'line' ? CR.mid.y : 0; o.handY = CR.kind === 'line' ? CR.hand.y : 0;
    o.bench = CR.bench ? [CR.bench.x, CR.bench.z, CR.bench.own] : null; o.n = crN;
    o.wOn = GW.on && !GW.done; o.wx = GW.x + GW.fx * 1.3; o.wz = GW.z + GW.fz * 1.3;   // ── site20 ── (the general work's piece: the crowd steps aside, crews.js) ── /site20 ──
    return o;
  }
  // ── /site16 ──
  // ── craftb19 ── the later crafts IN THE WORLD (wave 19, FUN19 §2 — binding; the owner's notes 14, 15): stages.craft.cover (the rub:
  // plaster, bronze, gold) and stages.craft.plumb, on the hooks of contract 1 — begin(site) → { ok, at }, act(power, quality),
  // update(model), end(result), box(), touch(down). The model (minigames/cover.js, plumb.js) says WHEN the impact is (a tile rubbed
  // clean, the bob settling): it logs M.acts and pushes the "+N" with its sound and buzz on that frame; here the world answers on the
  // same frame (cbAnswer): every act once, whether hands.js calls act() or update() finds it first.
  // · cover — a slanted bench before him (a door leaf to gild, a bronze leaf to polish, a block of the altar's whole stones to whiten:
  //   המחשה), between him and the camera, its face toward the camera; he stands behind it, facing it, his right hand on the cloth where
  //   the thumb rubs; the mask (a 24×16 texture) fills where the cloth goes; the last tile sends a glint across the whole panel, and the
  //   finished panel stays in the world (the plaster stays white, the gold shines) until the next one.
  const CB = { kind: null, M: null, seen: 0, cloth: { x: 0.5, y: 0.5, on: false }, P: new THREE.Vector3(), X: new THREE.Vector3(), Y: new THREE.Vector3(), N: new THREE.Vector3(),
    W: 3.4, D: 2.2, flipX: false, placed: false, side: 0, jump: 0, at: { x: 0, y: 0, z: 0 }, ver: -1, shineT: 0, flash: new Float32Array(12), skin: 'gold', touchT: 0, hand: new THREE.Vector3(), lookM: new THREE.Vector3(), handOn: 0, rgb: new Uint8Array(30) };
  const CB_LAT = { t: 0, ms: -1, fr: -1, f0: 0 };   // (tests: the touch's time, and the world frame that posed it — ms after the touch, frames after it)
  const cbTouched = () => { CB.jump = 2; CB_LAT.t = performance.now(); CB_LAT.f0 = CB.nF | 0; CB_LAT.ms = -1; CB_LAT.fr = -1; };
  const cbSnap = () => { if (CB.jump > 0) { if (CB.jump === 2 && CB_LAT.t && CB_LAT.ms < 0) { CB_LAT.ms = Math.round(performance.now() - CB_LAT.t); CB_LAT.fr = (CB.nF | 0) - CB_LAT.f0 + 1; } CB.jump--; poseSnap(); } };
  const CB_SLOPE = 34 * Math.PI / 180;
  // the see-through over a craft (FUN19: the surface changing under his arm is the delight — it must read): while a craft of mine runs
  // and he stands at it, the cone aims between him and the work, wider, and what stands in front is fully clear (batch.js, w = 2)
  function cbXray(v) {
    if (KS.on && !KS.gone && KS.s && !KS.done) { v.set((v.x + KS.hx) / 2, Math.max(v.y, KS.s.y + 1.5), (v.z + KS.hz) / 2, 2); return true; }   // ── site20 ── (the key stone's craft: the line to him AND to the stone is clear — the dither never lies over the stone) ── /site20 ──
    if (!CB.placed || !CR.kind || CR.done || CB.kind !== CR.kind) return false;
    const P = CR.kind === 'cover' ? CB.P : CR.kind === 'plumb' ? PL.A : null;
    if (P) v.set((v.x + P.x) / 2, (v.y + P.y) / 2, (v.z + P.z) / 2, 2);
    else if (CR.kind === 'saw' && CR.bench) { benchW(CR.bench, 0.9, 0, crP); v.set((v.x + crP.x) / 2, v.y, (v.z + crP.z) / 2, 2); }
    return true;
  }
  // the stands for the rub round his banker (sideways, back along its face): [side, ahead] pairs, the first the follow camera sees clear
  const CB_STANDS = [4.4, -1.2, -4.4, -1.2, 4.4, -4, -4.4, -4, 0, -5.5, 6.5, 1, -6.5, 1, 0, -8];
  // the twin follow camera (twin.js CAM: bearing 0.42, 57° up, 30 amot × 0.62 at a craft) over a point → is the line to him and to his
  // right on the screen (the bench) clear of the site's walls?
  const CB_AZ = 0.42, CB_CE = Math.cos(0.995), CB_SE = Math.sin(0.995), CB_D = 30 * 0.62;
  function cbSeen(x, z, site) {
    const gy = groundAt(x, z); if (!Number.isFinite(gy)) return false;
    const cx = x + CB_CE * Math.cos(CB_AZ) * CB_D, cy = gy + 1.6 + CB_SE * CB_D, cz = z + CB_CE * Math.sin(CB_AZ) * CB_D;
    const rx = Math.sin(CB_AZ), rz = -Math.cos(CB_AZ);   // (the screen's right on the ground: forward −(cos, sin) × up)
    return !frameBlockedApi(cx, cy, cz, x, gy + 2.2, z, site) && !frameBlockedApi(cx, cy, cz, x + rx * 2.6, gy + 1.9, z + rz * 2.6, site);
  }   // (the bench's slope from the horizontal: its face to a camera 57° above)
  const cbData = new Uint8Array(24 * 16 * 4);
  const cbTex = new THREE.DataTexture(cbData, 24, 16, THREE.RGBAFormat);
  cbTex.colorSpace = THREE.SRGBColorSpace; cbTex.magFilter = THREE.LinearFilter; cbTex.minFilter = THREE.LinearFilter; cbTex.generateMipmaps = false;
  const cbMat = new THREE.MeshStandardMaterial({ map: cbTex, emissiveMap: cbTex, emissive: 0xffffff, emissiveIntensity: 0.34, roughness: 0.42, metalness: 0.1, side: THREE.DoubleSide });   // (self-lit a little: no environment map here, a metal face would read black)
  const cbMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cbMat);
  cbMesh.name = 'craftb19-panel'; cbMesh.visible = false; cbMesh.matrixAutoUpdate = false; cbMesh.castShadow = false; cbMesh.receiveShadow = true;
  scene.add(cbMesh);
  const CB_SKIN = { gold: ['#7D6633', '#C9922F', '#FFEDB0', 0.18, 0.36], plaster: ['#8F8573', '#E6E1D3', '#FFFFFF', 0.0, 0.85], bronze: ['#4C4A30', '#B47A2C', '#FFE39A', 0.15, 0.4] };
  const cbHex = (h, o, k) => { CB.rgb[o] = parseInt(h.slice(1, 3), 16) * k; CB.rgb[o + 1] = parseInt(h.slice(3, 5), 16) * k; CB.rgb[o + 2] = parseInt(h.slice(5, 7), 16) * k; };
  /** the camera's right and forward on the ground (unit) → out.x/z, out2.x/z */
  function cbCamAxes(r, f) {
    if (TWD.twin) { f.set(-Math.cos(CB_AZ), 0, -Math.sin(CB_AZ)); r.set(Math.sin(CB_AZ), 0, -Math.cos(CB_AZ)); return r; }   // (two thumbs: the follow camera's own bearing — not a key moment's shot that happens to be on screen)
    camera.updateMatrixWorld(); camera.getWorldDirection(tmpV);
    let fx = tmpV.x, fz = tmpV.z; const L = Math.hypot(fx, fz) || 1; fx /= L; fz /= L;
    f.set(fx, 0, fz); r.set(-fz, 0, fx); return r;
  }
  const cbR = new THREE.Vector3(), cbF = new THREE.Vector3(), cbM4 = new THREE.Matrix4(), cbV = new THREE.Vector3();
  /** a point on the panel, (u, v) in the model's box (u 0 left → 1 right on the screen; v 0 top → 1 bottom) → out (world) */
  function cbAt(u, v, out, lift = 0.04) {
    const x = ((CB.flipX ? 1 - u : u) - 0.5) * CB.W, y = (0.5 - v) * CB.D;
    return out.copy(CB.P).addScaledVector(CB.X, x).addScaledVector(CB.Y, y).addScaledVector(CB.N, lift);
  }
  function cbPlace() {
    // the panel's frame: X along the camera's right, Y up the slope (away from the camera), N its face (up and toward the camera)
    cbCamAxes(cbR, cbF);
    CB.X.copy(cbR); CB.Y.copy(cbF).multiplyScalar(Math.cos(CB_SLOPE)).addScaledVector(UP, Math.sin(CB_SLOPE)).normalize(); CB.N.crossVectors(CB.X, CB.Y).normalize();
    if (CB.N.y < 0) CB.N.negate();
    // where: between him and the camera (he behind it, facing the camera) — or, when a wall of the site stands between the camera and
    // that place, at his right on the screen, or his left
    camera.updateMatrixWorld(); const cp = TWD.twin ? cbV.set(hero.x + CB_CE * Math.cos(CB_AZ) * CB_D, hero.y + 1.6 + CB_SE * CB_D, hero.z + CB_CE * Math.sin(CB_AZ) * CB_D) : camera.position;   // (two thumbs: where the follow camera will be)
    let px = 0, pz = 0, gy = 0; CB.side = 0;
    for (let c = 0; c < 3; c++) {
      const d = c === 2 ? 1.7 : 2.6, sx = c === 2 ? -cbF.x : c === 0 ? cbR.x : -cbR.x, sz = c === 2 ? -cbF.z : c === 0 ? cbR.z : -cbR.z;   // (his right on the screen first: he faces it, his working arm toward the camera; then his left; then before him)
      px = hero.x + sx * d; pz = hero.z + sz * d; gy = Math.max(groundAt(px, pz), hero.y);
      if (!frameBlockedApi(cp.x, cp.y, cp.z, px, gy + 2.6, pz, CR.site)) { CB.side = c; break; }
      if (c === 2) { px = hero.x + cbR.x * 2.6; pz = hero.z + cbR.z * 2.6; gy = Math.max(groundAt(px, pz), hero.y); CB.side = 0; }
    }
    CB.P.set(px, gy + 1.9 * HERO_S * 0.95, pz);
    cbM4.makeBasis(CB.X, CB.Y, CB.N); cbM4.scale(cbV.set(CB.W, CB.D, 1)); cbM4.setPosition(CB.P);
    cbMesh.matrix.copy(cbM4); cbMesh.matrixWorldNeedsUpdate = true;
    // the screen's left on the panel: −X projects left of +X (else the mask is drawn mirrored)
    cbV.copy(CB.P).addScaledVector(CB.X, -1).project(camera); const xl = cbV.x; cbV.copy(CB.P).addScaledVector(CB.X, 1).project(camera); CB.flipX = cbV.x < xl;
  }
  /** the mask from the model: dull → clean per cell, the act's tile flashing, the glint across at the end */
  function cbPaint(M) {
    const C = 24, R = 16, S = CB.rgb, sh = CB.shineT > 0 ? 1 - CB.shineT / 0.9 : -1;
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) {
      const k = j * C + i, c = M ? (M.off && M.off[k] ? -1 : M.clean(k)) : 1;
      let r, g, b;
      if (c < 0) { r = 132; g = 86; b = 47; }   // (behind the door's hinge: cedar, no gold)
      else {
        const e = c < 0.5 ? c * 2 : (c - 0.5) * 2, o0 = c < 0.5 ? 0 : 3, o1 = c < 0.5 ? 3 : 6;
        r = S[o0] + (S[o1] - S[o0]) * e; g = S[o0 + 1] + (S[o1 + 1] - S[o0 + 1]) * e; b = S[o0 + 2] + (S[o1 + 2] - S[o0 + 2]) * e;
        const t = TILE_T(i, j), f = CB.flash[t];
        let add = f > 0 ? 90 * f / 0.35 : 0;
        if (sh >= 0) { const u = i / (C - 1) + (j / (R - 1)) * 0.35, w = u - (sh * 1.7 - 0.35); add += 150 * Math.exp(-w * w * 60); }
        r += add; g += add; b += add * 0.85;
      }
      const ii = CB.flipX ? C - 1 - i : i, o = ((R - 1 - j) * C + ii) * 4;
      cbData[o] = r > 255 ? 255 : r; cbData[o + 1] = g > 255 ? 255 : g; cbData[o + 2] = b > 255 ? 255 : b; cbData[o + 3] = 255;
    }
    cbTex.needsUpdate = true;
  }
  const TILE_T = (i, j) => Math.min(2, Math.floor(j * 3 / 16)) * 4 + Math.min(3, Math.floor(i * 4 / 24));
  /** the world's answer to one act (once): the tile flashes, the cloth's dust or the gold's sparkle at it, a small shake on gold */
  function cbAnswer(a) {
    if (!a || a.done) return; a.done = true;
    try { const L = globalThis.__CRAFT_ACTS || (globalThis.__CRAFT_ACTS = []); if (L.length < 400) L.push({ t: performance.now(), kind: CB.kind, n: a.n, q: a.q, pts: a.pts }); } catch (e) { /* tests' log */ }
    if (CB.kind === 'cover') {
      const t = a.tile != null ? a.tile : 0; if (t >= 0 && t < 12) CB.flash[t] = 0.35;
      cbAt(a.x, a.y, cbV, 0.12);
      if (CB.skin === 'plaster') dustBurst(cbV.x, cbV.y, cbV.z, 6 + 3 * a.q, 1.6, 1.2, 0.8);
      else sparkBurst(cbV.x, cbV.y, cbV.z, 8 + 8 * a.q, 2.2, 3);
      if (a.q >= 2) { shake.t = Math.max(shake.t, 0.08); shake.amp = Math.max(shake.amp, 0.05); }
    } else if (CB.kind === 'plumb') plAnswer(a);
    else if (CB.kind === 'saw' && CR.bench) {   // the push bit: sawdust spurts from the kerf; on gold, a few golden motes (המחשה: cedar)
      const b = CR.bench, gy = groundAt(b.x, b.z); benchW(b, 0.9, 0.25, crP);
      dustBurst(crP.x, gy + 1.75, crP.z, 10 + 4 * a.q, 1.8, 1.6, 1.2);
      if (a.q >= 2) sparkBurst(crP.x, gy + 2.0, crP.z, 6, 1.4, 1.6);
    }
    cbJuice(a);
    try { const TW = globalThis.__TWIN; if (TW && typeof TW.graded === 'function') TW.graded(a.q); } catch (e) { /* the button answers the act at its impact (crafta19's T.graded) */ }
    tsLog({ id: CB.kind, stage: CR.site, kind: CB.kind, at: 'act', n: a.n, q: a.q, pts: a.pts });
  }
  // the act's "+N" through JUICE18 / HOOK19's juice.hit at the impact (the number, its one flight to the score capsule, the craft's xp, the
  // sound, the buzz) — under two thumbs, when the model left its own pop to the world (M.juice); the job's bonus by score.add
  const CB_TRADE = { gold: 'צורפים', plaster: 'סיידים', bronze: 'נחושתנים', plumb: 'מודדים', saw: 'נגרים' }, cbJ = { x: 0, y: 0, z: 0 };
  const cbJuiceOn = () => { const P = globalThis.__BH_PARTS; return !!(TWD.twin && P && P.juice && typeof P.juice.hit === 'function'); };
  function cbJuice(a) {
    const M = CB.M; if (!M || !M.juice || a.juiced) return;
    const P = globalThis.__BH_PARTS, J = P && P.juice; if (!J || typeof J.hit !== 'function') return;
    a.juiced = true;
    if (CB.kind === 'cover') cbAt(a.x, a.y, cbV, 0.1); else if (CB.kind === 'plumb') cbV.copy(PL.mark); else if (CR.bench) { const b = CR.bench; benchW(b, 0.9, 0, crP); cbV.set(crP.x, groundAt(b.x, b.z) + 1.9, crP.z); } else cbV.set(hero.x, hero.y + 2, hero.z);
    cbJ.x = cbV.x; cbJ.y = cbV.y - 1.2; cbJ.z = cbV.z;
    try { J.hit('craft', { at: cbJ, text: a.say ? `+${a.pts} ${a.say}` : `+${a.pts}`, perfect: a.q === 2, craft: CB_TRADE[CB.kind === 'cover' ? CB.skin : CB.kind] || null, grade: a.q === 2 ? 'perfect' : a.q === 1 ? 'good' : 'soft', quality: a.q === 2 ? 1 : a.q === 1 ? 0.82 : 0.6, pts: a.pts }); } catch (e) { /* juice's */ }
  }
  function cbBonus(M) {
    const B = M && M.bonuses; if (!B) return;
    for (const b of B) { if (b.done) continue; b.done = true; try { const S = globalThis.__BH_PARTS && globalThis.__BH_PARTS.score; if (S && typeof S.add === 'function' && M.juice) S.add(b.pts, `${CB.kind}:${b.say}`); } catch (e) { /* hook19's */ } }
  }
  /** he has stopped at his work: the bench goes up before him (or the plumb's stones beside him), he turns to it */
  function cbArrive() {
    CB.placed = true; CR.at = { x: hero.x, y: hero.y, z: hero.z }; CR.near = true;
    if (CB.kind === 'cover') {
      cbPlace(); hero.face = [CB.P.x, CB.P.z]; cbMesh.visible = true;
      CB.at.x = CB.P.x; CB.at.y = CB.P.y; CB.at.z = CB.P.z;
      if (!TWD.twin) craftFrame(CB.P.x, CB.P.y, CB.P.z, cbF.x, cbF.z, CR.at, [{ x: hero.x, y: hero.y + 5, z: hero.z }]);
    } else if (CB.kind === 'plumb') plPlace();
    tsLog({ id: CB.kind, stage: CR.site, kind: CB.kind, at: 'placed', side: CB.side, spot: [hero.x, hero.y, hero.z].map((v) => Math.round(v * 10) / 10) });
  }
  const craftCover = {
    raw: true,
    begin(site) {
      const g = craftGuard(site); if (g) return g;
      Object.assign(CR, { kind: 'cover', site, st: ST[site], t: 0, near: true, after: 0, done: false, phase: 'rub' });
      CB.kind = 'cover'; CB.M = null; CB.seen = 0; CB.touching = false; CB.cloth.on = false; CB.shineT = 0; CB.flash.fill(0); CB.ver = -1; CB.handOn = 0; CB.touchT = 0;
      CB.skin = FIELD.has(site) ? 'plaster' : site === 'nikanor' || site === 'kiyor' ? 'bronze' : 'gold';
      CB.placed = false; cbMesh.visible = false;   // (the bench is set up where he stops: the job's walk to its spot first)
      CR.at = { x: hero.x, y: hero.y, z: hero.z }; CB.at.x = hero.x; CB.at.y = hero.y + 2.4; CB.at.z = hero.z;
      // his stand: beside his banker (the strike and the rub at one place — note 16), out in the yard where the camera sees the bench
      // (the gold's own spot is on the wall's course, in the crane's frame and behind the towers); he steps there, then the bench goes up
      { const ws = workSpot(site, 'dress');
        if (ws && typeof ws.x === 'number' && Array.isArray(ws.face)) {
          let fx = ws.face[0] - ws.x, fz = ws.face[1] - ws.z; const L = Math.hypot(fx, fz) || 1; fx /= L; fz /= L;
          // (two thumbs: the first stand the follow camera sees clear — him and the bench at his right on the screen; no wall between)
          let sx = ws.x - fz * 4.4 - fx * 1.2, sz = ws.z + fx * 4.4 - fz * 1.2;
          if (TWD.twin) for (let c = 0; c < CB_STANDS.length; c += 2) { const a = CB_STANDS[c], b = CB_STANDS[c + 1], x = ws.x - fz * a + fx * b, z = ws.z + fx * a + fz * b; if (cbSeen(x, z, site)) { sx = x; sz = z; break; } }
          if (Number.isFinite(groundAt(sx, sz)) && Math.hypot(hero.x - sx, hero.z - sz) > 1.2) heroWalkTo({ x: sx, z: sz, key: 'cover' });
        } }
      if (!hero.path) cbArrive();
      const K = CB_SKIN[CB.skin]; cbHex(K[0], 0, 1); cbHex(K[1], 3, 1); cbHex(K[2], 6, 1);
      cbMat.metalness = K[3]; cbMat.roughness = K[4];
      for (let k = 0; k < cbData.length; k += 4) { cbData[k] = CB.rgb[0]; cbData[k + 1] = CB.rgb[1]; cbData[k + 2] = CB.rgb[2]; } cbTex.needsUpdate = true;
      tsLog({ id: 'cover', stage: site, kind: 'cover', at: 'begin', skin: CB.skin, placed: CB.placed });
      return { ok: true, at: CB.at };
    },
    touch(down) { CB.nT = (CB.nT | 0) + 1; if (CR.kind !== 'cover') return; CB.touching = !!down; if (down) { CB.cloth.on = true; cbTouched(); } },
    act(power, q) { if (CR.kind !== 'cover' || !CB.M) return false; const A = CB.M.acts; for (let i = CB.seen; i < A.length; i++) cbAnswer(A[i]); CB.seen = A.length; return true; },
    update(M) {
      if (CR.kind !== 'cover' || !M) return false;
      CB.M = M; if (M.pad == null) M.pad = !!TWD.twin;   // (two thumbs: the right thumb rubs on the pad — cover.js's pad mode)
      if (M.juice == null) M.juice = cbJuiceOn(); cbBonus(M);
      if (!CB.placed && ((!hero.path && !hero.door) || CR.t > 3)) cbArrive();
      const A = M.acts; if (A) { for (let i = CB.seen; i < A.length; i++) cbAnswer(A[i]); CB.seen = A.length; }
      // the cloth: where the thumb (or a tap's sweep) is now
      let on = !!CB.touching; for (const id in M.ps) { const p = M.ps[id]; if (p) { CB.cloth.x = p[0]; CB.cloth.y = p[1]; on = true; break; } }
      if (on && !CB.cloth.on) CB.jump = 2;   // (a fresh touch: his hand goes to the cloth on this frame, not eased in)
      CB.cloth.on = on;
      if (M.phase === 'shine' && CB.shineT <= 0 && !CB.shone) { CB.shineT = 0.9; CB.shone = true; sparkBurst(CB.P.x, CB.P.y + 0.3, CB.P.z, 26, 4, 5); }
      if (M.phase === 'rub') CB.shone = false;
      if (M.ver !== CB.ver) { CB.ver = M.ver; cbPaint(M); }
      if (M.done) CR.done = true;
      return true;
    },
    end(r) {
      if (CR.kind !== 'cover') return false;
      if (CB.M) { CB.ver = -1; cbPaint(CB.M); }
      tsLog({ id: 'cover', stage: CR.site, kind: 'cover', at: 'end', acts: CB.M && CB.M.acts ? CB.M.acts.length : 0, q: r && typeof r.quality === 'number' ? Math.round(r.quality * 100) / 100 : null });
      CR.done = true; CR.after = 1.6; CB.cloth.on = false;
      return true;
    },
    box() {
      if (CR.kind !== 'cover' || !CB.placed) return null;
      const W = CB.W / 2, D = CB.D / 2, P = CB.P, X = CB.X, Y = CB.Y;
      return crBoxOf([[P.x - X.x * W + Y.x * D, P.y + Y.y * D, P.z - X.z * W + Y.z * D], [P.x + X.x * W + Y.x * D, P.y + Y.y * D, P.z + X.z * W + Y.z * D], [P.x - X.x * W - Y.x * D, P.y - Y.y * D, P.z - X.z * W - Y.z * D], [P.x + X.x * W - Y.x * D, P.y - Y.y * D, P.z + X.z * W - Y.z * D]]);
    },
    on: () => CR.kind === 'cover',
  };
  /** each frame (craftTick, between crBegin and crEnd): the bench's legs, the cloth in his hand; the flashes and the glint run down */
  function cbProps(dt) {
    CB.nF = (CB.nF | 0) + 1;   // (tests: the world's frames while a craft runs)
    if (CB.placed && CR.near && (hero.gest || hero.gestQ) && (CR.kind === 'cover' || CR.kind === 'plumb' || CR.kind === 'saw')) gestEnd(false);   // (his hands stay on the work: no 'gotit' over a craft)
    if (CR.kind === 'cover' && CB.kind === 'cover' && CB.placed) {
      // the trestle under the bench: two legs at its near corners, a beam under its high edge
      for (const s of [-0.42, 0.42]) { cbAt(0.5 + s, 0.92, cbV, -0.05); const gy = groundAt(cbV.x, cbV.z); crPut(cbV.x, (cbV.y + gy) / 2, cbV.z, 0.16, Math.max(0.1, cbV.y - gy), 0.16, 0, '#6B4E31'); cbAt(0.5 + s, 0.08, cbV, -0.05); crPut(cbV.x, (cbV.y + gy) / 2, cbV.z, 0.16, Math.max(0.1, cbV.y - gy), 0.16, 0, '#6B4E31'); }
      let fl = false; for (let t = 0; t < 12; t++) if (CB.flash[t] > 0) { CB.flash[t] = Math.max(0, CB.flash[t] - dt); fl = true; }
      if (CB.shineT > 0) { CB.shineT = Math.max(0, CB.shineT - dt); fl = true; }
      if (fl && CB.M) cbPaint(CB.M);
      // the cloth: under his hand while the thumb rubs (or the tap's sweep runs), else folded on the bench's corner
      CB.handOn += ((CB.cloth.on ? 1 : 0) - CB.handOn) * Math.min(1, dt * 18);
      if (CB.handOn > 0.05) { cbAt(CB.cloth.x, CB.cloth.y, cbV, 0.08); crPut(cbV.x, cbV.y, cbV.z, 0.62, 0.1, 0.48, Math.atan2(CB.X.x, CB.X.z), CB.skin === 'plaster' ? '#E9E4D6' : '#EFE8D8'); }
      else { cbAt(0.93, 0.12, cbV, 0.06); crPut(cbV.x, cbV.y, cbV.z, 0.5, 0.12, 0.36, Math.atan2(CB.X.x, CB.X.z), '#E9E4D6'); }
    }
    if (CR.kind === 'plumb') plProps(dt);
    if (CR.kind === 'saw' && CR.bench && !CR.parted) { const b = CR.bench, gy = groundAt(b.x, b.z); benchW(b, 0.9, 0, crP); crPut(crP.x, gy + 1.875, crP.z, 0.04, 0.014, 0.6, b.yaw, '#B23A26'); }   // (the chalk line the kerf follows)
  }
  /** his pose at the work (heroUpdate, between strokes) → true when a craft of mine posed him */
  function cbPose() {
    if (!CB.placed) return false;
    CB.nP = (CB.nP | 0) + 1;
    if (CR.kind === 'cover' && CB.kind === 'cover') {
      // the right hand on the cloth (the thumb's point on the panel), the palm down on the face; the left hand flat on the bench's edge
      cbAt(CB.cloth.on ? CB.cloth.x : 0.55, CB.cloth.on ? CB.cloth.y : 0.6, cbV, CB.cloth.on ? 0.16 : 0.55);   // (between strokes the cloth is lifted off the face; the touch presses it down)
      w2m(cbV, hA); hA.y = Math.max(1.3, hA.y); CB.lookM.copy(hA);
      const reach = Math.hypot(hA.x + 0.5, hA.y - 2.7, hA.z), k = clamp((reach - 1.0) / 1.2, 0, 1);
      PZ.WR.copy(hA); dirM(CB.N, hB); hB.normalize(); dirM(CB.Y, hC); hC.normalize(); frameQ(hB, hC, PZ.QR);
      cbAt(0.12, 0.35, cbV, 0.14); w2m(cbV, hD); PZ.WL.copy(hD); PZ.QL.copy(PZ.QR);
      finishBody(0.18 + 0.32 * k + (CB.cloth.on ? 0.03 * Math.sin(time * 18) : 0), 0.06 + 0.1 * k, (CB.cloth.on ? -0.12 : 0) + clamp(-hA.x * 0.12, -0.25, 0.25), 0, 1);
      PZ.FL.set(0.26, 0.13, 0.32); PZ.FR.set(-0.26, 0.13, -0.18);
      PZ.look = CB.lookM; PZ.leftFree = false;
      cbSnap();   // (the touch's first frame: no easing — FUN19 "his first frame within 50 ms")
      return true;
    }
    if (CR.kind === 'plumb') return plPose();
    if (CR.kind === 'saw' && CB.kind === 'saw') {   // (SITE16's sawyer, and a lean into the saw while the thumb is down: the touch's own first frame)
      const lean = CB.touching ? 0.12 : 0, z = 0.42 + 0.5 * (1 - CR.blade) + lean * 0.5;   // (the grip pressed forward and down as the thumb lands)
      PZ.WR.set(-0.13, 1.72 - PZ.drop - lean * 0.4, z); PZ.WL.set(0.13, 1.72 - PZ.drop - lean * 0.4, z);
      frameQ(hC.set(0, 1, 0), hD.set(0, 0, 1), PZ.QR); PZ.QL.copy(PZ.QR);
      finishBody(0.14 + 0.1 * (1 - CR.blade) + lean, 0.06 + 0.04 * CR.blade + lean * 0.6, 0, 0, 1);
      PZ.FL.set(0.26, 0.13, 0.34); PZ.FR.set(-0.26, 0.13, -0.3); PZ.look = null;
      cbSnap();
      return true;
    }
    return false;
  }
  // · plumb — the check you can see (note 15): two stones stacked beside him (the course and the stone on it: המחשה), toward the camera;
  //   he faces the camera, his right arm out holding the line at the top stone's end, the hammer hung on his belt. The line pays out,
  //   the bob swings and damps; the top stone slides with the thumb's swipes; the gold mark at the base; "ting" when it hangs on it.
  const PL = { C: new THREE.Vector3(), U: new THREE.Vector3(), F: new THREE.Vector3(), A: new THREE.Vector3(), bob: new THREE.Vector3(), mark: new THREE.Vector3(), lookM: new THREE.Vector3(),
    w: 2.4, h0: 1.5, h1: 1.35, dp: 1.25, K: 0.9, Lf: 2.7, dS: 0, glowT: 0, heldWas: null, gy: 0 };
  const plW = (u, f, y, out) => out.set(PL.C.x + PL.U.x * u + PL.F.x * f, PL.gy + y, PL.C.z + PL.U.z * u + PL.F.z * f);
  function plAnswer(a) {
    plW(PL.w / 2, -PL.dp / 2 - 0.1, 0.3, cbV);
    if (a.q >= 1) { sparkBurst(cbV.x, cbV.y, cbV.z, 10 + 8 * a.q, 1.6, 2.4); PL.glowT = 0.9; }
    else dustBurst(cbV.x, cbV.y + 1.4, cbV.z, 8, 2, 1.6, 1);
  }
  const craftPlumb = {
    raw: true,
    begin(site) {
      const g = craftGuard(site); if (g) return g;
      Object.assign(CR, { kind: 'plumb', site, st: ST[site], t: 0, near: true, after: 0, done: false, phase: 'ready' });
      CB.kind = 'plumb'; CB.M = null; CB.seen = 0; CB.touching = false; PL.dS = 0; PL.glowT = 0;
      CR.at = { x: hero.x, y: hero.y, z: hero.z }; CB.at.x = hero.x; CB.at.y = hero.y + 2.4; CB.at.z = hero.z;
      PL.heldWas = hero.held; hero.held = 'line';   // (no tool in his hands but the line: the hammer goes to his belt)
      CB.placed = false;
      if (!hero.path) cbArrive();
      tsLog({ id: 'plumb', stage: site, kind: 'plumb', at: 'begin', placed: CB.placed });
      return { ok: true, at: CB.at };
    },
    touch(down, M) {   // the touch-down lets the line run out while held; the release lets it go (the bob drops and swings)
      if (CR.kind !== 'plumb') return; CB.touching = !!down; if (down) cbTouched();
      try { if (M && down && M.phase === 'ready') M.grab(0.5, 7, false); else if (M && !down && M.phase === 'pay') { M.held = false; if (M.ps) delete M.ps[7]; } } catch (e) { /* the model's */ }
    },
    act() { if (CR.kind !== 'plumb' || !CB.M) return false; const A = CB.M.acts; for (let i = CB.seen; i < A.length; i++) cbAnswer(A[i]); CB.seen = A.length; return true; },
    update(M) {
      if (CR.kind !== 'plumb' || !M) return false;
      CB.M = M; CR.phase = M.phase; if (M.juice == null) M.juice = cbJuiceOn(); cbBonus(M);
      if (!CB.placed && ((!hero.path && !hero.door) || CR.t > 3)) cbArrive();
      const A = M.acts; if (A) { for (let i = CB.seen; i < A.length; i++) cbAnswer(A[i]); CB.seen = A.length; }
      if (M.done) CR.done = true;
      return true;
    },
    end(r) {
      if (CR.kind !== 'plumb') return false;
      if (hero.held === 'line') hero.held = PL.heldWas || 'hammer';
      tsLog({ id: 'plumb', stage: CR.site, kind: 'plumb', at: 'end', acts: CB.M && CB.M.acts ? CB.M.acts.length : 0, q: r && typeof r.quality === 'number' ? Math.round(r.quality * 100) / 100 : null });
      CR.done = true; CR.after = 1.4;
      return true;
    },
    box() {
      if (CR.kind !== 'plumb' || !CB.placed) return null;
      const w = PL.w / 2 + 0.9, f = PL.dp / 2 + 0.3, top = PL.h0 + PL.h1 + 0.4;
      plW(-w, -f, 0, cbV); const a = [cbV.x, cbV.y, cbV.z]; plW(w, -f, 0, cbV); const b = [cbV.x, cbV.y, cbV.z]; plW(-w, -f, top, cbV); const c = [cbV.x, cbV.y, cbV.z]; plW(w, -f, top, cbV);
      return crBoxOf([a, b, c, [cbV.x, cbV.y, cbV.z]]);
    },
    on: () => CR.kind === 'plumb',
  };
  function plPlace() {
    cbCamAxes(PL.U, PL.F);
    PL.C.set(hero.x - PL.U.x * 1.75 - PL.F.x * 0.8, 0, hero.z - PL.U.z * 1.75 - PL.F.z * 0.8);
    PL.gy = Math.max(groundAt(PL.C.x, PL.C.z), hero.y - 0.4); PL.C.y = PL.gy;
    hero.face = [hero.x - PL.F.x * 6 - PL.U.x * 1.5, hero.z - PL.F.z * 6 - PL.U.z * 1.5];   // (he faces the camera, turned a little to the stones)
    plW(PL.w / 2, -PL.dp / 2 - 0.08, PL.h0 + PL.h1 + 0.05, PL.A);
    CB.at.x = PL.A.x; CB.at.y = PL.A.y - 1.2; CB.at.z = PL.A.z;
    if (!TWD.twin) craftFrame(PL.C.x, PL.gy + 1.6, PL.C.z, PL.F.x, PL.F.z, CR.at, [{ x: hero.x, y: hero.y + 5, z: hero.z }]);
  }
  function plProps(dt) {
    if (!CB.placed) return;
    const M = CB.M, yaw = Math.atan2(PL.U.x, PL.U.z) - Math.PI / 2, stone = '#CDBB93', stone2 = '#BFAE86';
    const d = M ? M.d : 0, s = M ? M.s : 0, pay = M ? M.pay : 0;
    PL.dS += (d - PL.dS) * Math.min(1, dt * 16);
    if (PL.glowT > 0) PL.glowT = Math.max(0, PL.glowT - dt);
    // the course stone and the stone on it (slid by the thumb), the gold mark on its peg at the base
    plW(0, 0, PL.h0 / 2, cbV); crPut(cbV.x, cbV.y, cbV.z, PL.w, PL.h0, PL.dp, yaw, stone2);
    plW(PL.dS * PL.K, 0, PL.h0 + PL.h1 / 2, cbV); crPut(cbV.x, cbV.y, cbV.z, PL.w, PL.h1 - 0.04, PL.dp, yaw, stone);
    if (PL.glowT > 0) { plW(PL.dS * PL.K + PL.w / 2 - 0.03, -PL.dp / 2 - 0.02, PL.h0 + PL.h1 / 2, cbV); crPut(cbV.x, cbV.y, cbV.z, 0.07, PL.h1, 0.07, yaw, '#FFE27A'); }
    plW(PL.w / 2, -PL.dp / 2 - 0.1, 0.12, PL.mark); crPut(PL.mark.x, PL.mark.y, PL.mark.z, 0.5, 0.24, 0.26, yaw, '#7A5A36');
    crPut(PL.mark.x, PL.mark.y + 0.14, PL.mark.z, 0.14, 0.05, 0.34, yaw, PL.glowT > 0 ? '#FFF6C0' : '#FFD24A');
    // the line from his hand at the top stone's end, the bob at its end (swinging along U), paid out with the model
    plW(PL.w / 2 + PL.dS * PL.K, -PL.dp / 2 - 0.1, PL.h0 + PL.h1 + 0.12, PL.A);
    const L = Math.max(0.15, pay * PL.Lf), sw = (s * PL.K);
    PL.bob.set(PL.A.x + PL.U.x * sw, PL.A.y - Math.sqrt(Math.max(0.01, L * L - sw * sw)), PL.A.z + PL.U.z * sw);
    const dx = PL.bob.x - PL.A.x, dy = PL.bob.y - PL.A.y, dz = PL.bob.z - PL.A.z, LL = Math.hypot(dx, dy, dz) || 0.01;
    crPut((PL.A.x + PL.bob.x) / 2, (PL.A.y + PL.bob.y) / 2, (PL.A.z + PL.bob.z) / 2, 0.07, LL, 0.07, Math.atan2(PL.U.x, PL.U.z), '#F4EBD3', Math.atan2(-sw, Math.max(0.05, PL.A.y - PL.bob.y)));
    crPut(PL.bob.x, PL.bob.y - 0.14, PL.bob.z, 0.32, 0.38, 0.32, yaw + 0.785, '#6E6658');
    // the hammer hung on his belt (note 15: the plumb in his hand, the hammer stowed)
    m2w(cbV.set(-0.42, 1.38, 0.12), hA); crPut(hA.x, hA.y - 0.15, hA.z, 0.08, 0.62, 0.08, hero.yaw, '#8C6A43');
    m2w(cbV.set(-0.42, 1.72, 0.12), hA); crPut(hA.x, hA.y, hA.z, 0.3, 0.13, 0.15, hero.yaw, '#5E5E66');
  }
  function plPose() {
    // the right arm out, the hand at the line's top (the top stone's end); the left hand on the hip; he leans a little and watches the bob
    w2m(PL.A, hA); hA.y += 0.05;
    PZ.WR.copy(hA); frameQ(hB.set(0, 1, 0), hC.set(0, 0, 1), PZ.QR);
    PZ.WL.set(0.54, 1.76, 0.15); PZ.QL.setFromAxisAngle(Z_, -0.85);
    const k = clamp((Math.hypot(hA.x + 0.5, hA.y - 2.7, hA.z) - 0.9) / 1.0, 0, 1);
    finishBody(0.06 + 0.22 * k, 0.04, clamp(-hA.x * 0.15, -0.3, 0.3), 0, 1);
    PZ.poleL.set(1, 0.35, -0.2).normalize();
    PZ.FL.set(0.26, 0.13, 0.16); PZ.FR.set(-0.28, 0.13, -0.06);
    w2m(PL.bob, PL.lookM); PZ.look = PL.lookM; PZ.leftFree = false;
    if (CB.touching) { PZ.WR.y += 0.08; }   // (his grip lifts as the line runs out)
    cbSnap();
    return true;
  }
  craftApi.cover = craftCover; craftApi.plumb = craftPlumb;
  // ── fable20 ── the general work craft under two thumbs (the owner's notes 2, 13, 19, 21: "the character does nothing", "the same
  // screen at every stage"): every job the world has no craft of its own for — the course stone (F1, arch), the sea-wave course (waves),
  // the letters (letters), the well's wheel (wheel), the aqueduct's channel (aqueduct), the rafts' logs (rafts) — is worked on a real
  // workpiece before him, 2 amot up the screen. The touch-down drops his tool at once (FUN19 §2), the impact is the act (acts.js, graded on
  // the beat), and the piece answers on that frame: the stone slides onto its gold bed, a groove is cut, the wheel turns and the bucket
  // rises, a channel segment is seated, a log is pegged. One instanced mesh (≤ 48 unit boxes), nothing allocated per frame. המחשה.
  const GW = { on: false, site: null, job: null, look: 'block', M: null, busy: false, k: 0, n: 8, u: 0, hop: 0, ang: 0, x: 0, y: 0, z: 0, fx: 0, fz: 1, done: false, after: 0, at: { x: 0, y: 0, z: 0 }, tgt: { x: 0, y: 0, z: 0 }, tgtV: new THREE.Vector3(), arm: 'dress' };
  const GW_N = 48, gwMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.85 }), GW_N);
  gwMesh.name = 'fable20-work'; gwMesh.frustumCulled = false; gwMesh.visible = false; gwMesh.count = 0; gwMesh.castShadow = true; gwMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  { const c = new THREE.Color(1, 1, 1); for (let i = 0; i < GW_N; i++) gwMesh.setColorAt(i, c); }
  scene.add(gwMesh);
  // (a second, unlit mesh for the marks that must read crisp whatever the sun: the gold bed, the grooves, the water — hex '!…')
  const gwGlow = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), GW_N);
  gwGlow.name = 'fable20-work-glow'; gwGlow.frustumCulled = false; gwGlow.visible = false; gwGlow.count = 0; gwGlow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  { const c = new THREE.Color(1, 1, 1); for (let i = 0; i < GW_N; i++) gwGlow.setColorAt(i, c); }
  scene.add(gwGlow);
  const gwC = new THREE.Color(); let gwN = 0, gwG = 0;
  const GW_K = 1.7;   // (the piece's scale about its spot: it reads at a phone's size under the follow camera)
  function gwPut(x, y, z, w, h, d, yaw, hex, pitch = 0, roll = 0) {
    const K = GW_K, unlit = hex.charCodeAt(0) === 33;
    tmpE.set(pitch, yaw, roll, 'YXZ'); tmpQ.setFromEuler(tmpE); tmpV.set(GW.x + (x - GW.x) * K, GW.y + (y - GW.y) * K, GW.z + (z - GW.z) * K); tmpS.set(w * K, h * K, d * K); tmpM.compose(tmpV, tmpQ, tmpS);
    if (unlit) { if (gwG >= GW_N) return; gwGlow.setMatrixAt(gwG, tmpM); gwGlow.setColorAt(gwG, gwC.set(hex.slice(1))); gwG++; return; }
    if (gwN >= GW_N) return;
    gwMesh.setMatrixAt(gwN, tmpM); gwMesh.setColorAt(gwN, gwC.set(hex)); gwN++;
  }
  /** clear of every site's stock pile and quarry pile (the walk does not know them) — 6 amot round */
  function gwClear(x, z) {
    for (const id in ST) { const st = ST[id]; if (!st || !st.piles) continue; for (const p of st.piles) if (Math.hypot(p[0] - x, p[1] - z) < 6) return false; if (st.def && st.def.quarry) for (const q of st.def.quarry) if (Math.hypot(q[0] - x, q[1] - z) < 5) return false; }
    return true;
  }
  /** is the point in the camera's sight — nothing of the world (the stock, the crane, a wall) between them? (once per begin) */
  const gwRay = new THREE.Raycaster(), gwHits = [];
  function gwSeen(x, y, z) {
    try {
      tmpV.set(x, y, z); tmpV2.copy(tmpV).sub(camera.position); const d = tmpV2.length(); tmpV2.normalize();
      gwRay.set(camera.position, tmpV2); gwRay.far = d - 0.6; gwRay.camera = camera; gwHits.length = 0;
      gwRay.intersectObjects(scene.children, true, gwHits);
      for (const h of gwHits) { const o = h.object; if (!o.visible || o.isSprite || o.isPoints || o.isLine || o === gwMesh || o === gwGlow || o === hero.mesh || o === hero.ring || (o.material && o.material.transparent && o.material.opacity < 0.5)) continue; let p = o, ofHero = false; while (p) { if (p === hero.mesh) { ofHero = true; break; } p = p.parent; } if (ofHero) continue; return false; }
      return true;
    } catch (e) { return true; }
  }
  /** a point of the piece's frame: a along his line (away from him), s across it (to his right), y up from the ground at the spot */
  function gwP(a, s, y, out) { out.set(GW.x + GW.fx * a - GW.fz * s, GW.y + y, GW.z + GW.fz * a + GW.fx * s); return out; }
  /** the same point at the piece's scale (where the strike lands, where the "+N" is born) */
  function gwPK(a, s, y, out) { const K = GW_K; out.set(GW.x + (GW.fx * a - GW.fz * s) * K, GW.y + y * K, GW.z + (GW.fz * a + GW.fx * s) * K); return out; }
  /** a bar in the wheel's plane (along his line and up): its centre (a, s, y), its length, its thickness, its angle about the axle */
  function gwBar(a, s, y, len, th, rot, hex) {
    if (gwN >= GW_N) return;
    const K = GW_K;
    gwP(a, s, y, tmpV); tmpV.set(GW.x + (tmpV.x - GW.x) * K, GW.y + (tmpV.y - GW.y) * K, GW.z + (tmpV.z - GW.z) * K); tmpE.set(0, Math.atan2(GW.fx, GW.fz), 0, 'YXZ'); tmpQ.setFromEuler(tmpE).multiply(tmpQ2.setFromAxisAngle(GW_X, rot)); tmpS.set(th * K, th * K, len * K); tmpM.compose(tmpV, tmpQ, tmpS);
    gwMesh.setMatrixAt(gwN, tmpM); gwMesh.setColorAt(gwN, gwC.set(hex)); gwN++;
  }
  const GW_X = new THREE.Vector3(1, 0, 0), tmpQ2 = new THREE.Quaternion();
  const GW_LOOK = { F1: 'block', arch: 'block', waves: 'waves', letters: 'letters', wheel: 'wheel', aqueduct: 'channel', rafts: 'rafts' };
  const GW_ARM = { wheel: 'pull', aqueduct: 'tamp', rafts: 'tamp' };
  const GW_TRADE = { F1: 'סתתים', arch: 'סתתים', waves: 'סתתים', letters: 'חרטים', wheel: 'שואבי מים', aqueduct: 'בוני האמה', rafts: 'נגרים' };
  function gwTick(dt) {
    if (!GW.on) { if (gwMesh.visible || gwGlow.visible) { gwMesh.visible = gwGlow.visible = false; gwMesh.count = gwGlow.count = 0; } return; }
    if (GW.done) { GW.after -= dt; if (GW.after <= 0) { GW.on = false; gwMesh.visible = gwGlow.visible = false; gwMesh.count = gwGlow.count = 0; return; } }
    const p = GW.n > 0 ? clamp(GW.k / GW.n, 0, 1) : 0;
    GW.u += (p - GW.u) * (1 - Math.exp(-dt * 6));
    if (GW.hop > 0) GW.hop = Math.max(0, GW.hop - dt * 3.2);
    const hop = Math.sin(GW.hop * Math.PI) * 0.16, yaw = Math.atan2(GW.fx, GW.fz), L = GW.look;
    gwN = 0; gwG = 0;
    if (L === 'block') {
      // the course stone before him, its gold bed 2.6 amot on: each strike moves it a step onto the bed; the bed's frame fades as it lands
      const bed = 2.6, a = GW.u * bed, glow = GW.done ? 0 : 1;
      gwP(a, 0, 0.62 + hop, hA); gwPut(hA.x, hA.y, hA.z, 2.1, 1.24, 1.3, yaw, '#8E7046');   // (a warm quarry stone: it stands out of the pale yard)
      gwP(a, 0, 0.62 + hop, hA); gwPut(hA.x, hA.y + 0.58, hA.z, 1.8, 0.1, 1.1, yaw, '#D9C9A2');   // the boss on its face
      gwP(a, 0, 0.62 + hop, hA); gwPut(hA.x, hA.y - 0.56, hA.z, 2.2, 0.1, 1.4, yaw, '!#3A2C1C');   // its shadowed foot
      if (glow) { gwP(bed, 0.65, 0.07, hA); gwPut(hA.x, hA.y, hA.z, 2.0, 0.12, 0.14, yaw, '!#FFD24A'); gwP(bed, -0.65, 0.07, hA); gwPut(hA.x, hA.y, hA.z, 2.0, 0.12, 0.14, yaw, '!#FFD24A');
        gwP(bed + 1.0, 0, 0.07, hA); gwPut(hA.x, hA.y, hA.z, 0.14, 0.12, 1.4, yaw, '!#FFD24A'); gwP(bed - 1.0, 0, 0.07, hA); gwPut(hA.x, hA.y, hA.z, 0.14, 0.12, 1.4, yaw, '!#FFD24A'); }
      gwPK(a, 0, 1.0 + hop, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y - 0.5; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.tgtV.y + 0.3; GW.at.z = GW.tgtV.z;
    } else if (L === 'waves') {
      // a slab stands before him; each strike cuts one wave crest into its face (two rows of crests, right to left)
      gwP(1.3, 0, 0.7, hA); gwPut(hA.x, hA.y, hA.z, 0.45, 1.4, 3.0, yaw, STONE.ash);
      for (let j = 0; j < Math.min(GW.k, 16); j++) { const row = j >> 3, i = j & 7, s = 1.25 - i * 0.36, yy = 1.0 - row * 0.5 + 0.1 * Math.sin(i * 1.3); gwP(1.06, s, yy, hA); gwPut(hA.x, hA.y, hA.z, 0.06, 0.09, 0.3, yaw, '!#4A3A26', 0, (i & 1 ? 0.5 : -0.5)); }
      const s = GW.k < 16 ? 1.25 - (GW.k & 7) * 0.36 : 0, yy = GW.k < 16 ? 1.0 - (GW.k >> 3) * 0.5 : 0.8;
      gwPK(1.06, s, yy, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.y + 1.9; GW.at.z = GW.tgtV.z;
    } else if (L === 'letters') {
      // a lintel lies before him; each strike cuts a stroke of a letter (upright and flat bars, right to left — המחשה: "לבית התקיעה")
      gwP(1.4, 0, 0.18, hA); gwPut(hA.x, hA.y, hA.z, 1.3, 0.36, 2.6, yaw, STONE.marble);
      for (let j = 0; j < Math.min(GW.k, 16); j++) { const i = j >> 1, s = 1.1 - i * 0.3, up = !(j & 1); gwP(1.4 + (up ? 0 : 0.18), s + (up ? 0 : 0.08), 0.37, hA); gwPut(hA.x, hA.y, hA.z, up ? 0.5 : 0.07, 0.03, up ? 0.07 : 0.22, yaw, '!#3E2E1C'); }
      const j = Math.min(GW.k, 15), s = 1.1 - (j >> 1) * 0.3;
      gwPK(1.4, s, 0.37, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.y + 1.3; GW.at.z = GW.tgtV.z;
    } else if (L === 'wheel') {
      // the well: its stone rim, two posts, the wheel on its axle (12 rim bars, 4 spokes), the rope and the bucket rising with the turns
      for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2; gwP(2.2 + Math.cos(t) * 1.0, Math.sin(t) * 1.0, 0.3, hA); gwPut(hA.x, hA.y, hA.z, 0.8, 0.6, 0.36, yaw + t + Math.PI / 2, '#B9AA8A'); }
      gwP(2.2, 1.25, 1.4, hA); gwPut(hA.x, hA.y, hA.z, 0.2, 2.8, 0.2, yaw, '#6B4E31'); gwP(2.2, -1.25, 1.4, hA); gwPut(hA.x, hA.y, hA.z, 0.2, 2.8, 0.2, yaw, '#6B4E31');
      gwP(2.2, 0, 2.8, hA); gwPut(hA.x, hA.y, hA.z, 2.7, 0.12, 0.12, yaw, '#4E3822');   // the axle across (along s)
      const ang = GW.ang, R = 0.9;
      for (let i = 0; i < 12; i++) { const t = ang + i / 12 * Math.PI * 2; gwBar(2.2 + Math.cos(t) * R, 0.55, 2.8 + Math.sin(t) * R, 0.5, 0.14, -t - Math.PI / 2, '#8A6A45'); }
      for (let i = 0; i < 4; i++) { const t = ang + i / 4 * Math.PI; gwBar(2.2, 0.55, 2.8, 2 * R - 0.1, 0.1, -t, '#8A6A45'); }
      const by = 0.1 + GW.u * 2.2;
      gwP(2.2, 0, (by + 2.8) / 2, hA); gwPut(hA.x, hA.y, hA.z, 0.05, Math.max(0.05, 2.8 - by), 0.05, yaw, '#B89A62');   // the rope
      gwP(2.2, 0, by, hA); gwPut(hA.x, hA.y, hA.z, 0.5, 0.45, 0.5, yaw, '#5A4A3A');   // the bucket
      if (GW.done) { gwP(2.2, 0, by + 0.25, hA); gwPut(hA.x, hA.y, hA.z, 0.4, 0.06, 0.4, yaw, '!#5FA8E6'); }   // water in it
      gwPK(2.2, -0.55, 2.8, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.y + 3.4; GW.at.z = GW.tgtV.z;
    } else if (L === 'channel') {
      // the aqueduct's channel runs away from him: each seated segment a trough (bed and two cheeks); the water follows the laid length
      const n = Math.min(GW.n, 10), seg = 1.3;
      gwP(1.2 + n * seg / 2, 0, 0.03, hA); gwPut(hA.x, hA.y, hA.z, 1.1, 0.06, n * seg + 0.4, yaw, '!#6B5A42');   // the channel's trench, marked out from the start
      gwP(1.2 + n * seg + 0.5, 0, 0.4, hA); gwPut(hA.x, hA.y, hA.z, 0.12, 0.8, 0.12, yaw, '#6B4E31');   // the far stake
      for (let j = 0; j < Math.min(GW.k, n); j++) { const a = 1.2 + j * seg + seg / 2, sc = j === GW.k - 1 ? 1 - hop * 2 : 1; gwP(a, 0, 0.14, hA); gwPut(hA.x, hA.y, hA.z, 0.9 * sc, 0.28, seg * 0.96 * sc, yaw, '#CBB894');
        gwP(a, 0.4, 0.42, hA); gwPut(hA.x, hA.y, hA.z, 0.14, 0.3 * sc, seg * 0.96 * sc, yaw, STONE.ash); gwP(a, -0.4, 0.42, hA); gwPut(hA.x, hA.y, hA.z, 0.14, 0.3 * sc, seg * 0.96 * sc, yaw, STONE.ash); }
      const wl = GW.u * n * seg; if (wl > 0.2) { gwP(1.2 + wl / 2, 0, 0.36, hA); gwPut(hA.x, hA.y, hA.z, 0.6, 0.08, wl, yaw, '!#5FA8E6'); }
      const a = 1.2 + Math.min(GW.k, n - 1) * seg + seg / 2; gwPK(a, 0, 0.6, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y - 0.3; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.y + 1.4; GW.at.z = GW.tgtV.z;
    } else {
      // the rafts: cedar logs laid side by side before him, each pegged with a strike; a cross-beam over them at the end
      const n = Math.min(GW.n, 12);
      gwP(1.4, 0, 0.12, hA); gwPut(hA.x, hA.y, hA.z, 0.3, 0.24, n * 0.42 + 0.4, yaw, '#5A4A3A'); gwP(3.8, 0, 0.12, hA); gwPut(hA.x, hA.y, hA.z, 0.3, 0.24, n * 0.42 + 0.4, yaw, '#5A4A3A');   // the chocks the logs lie on
      for (let j = 0; j < Math.min(GW.k, n); j++) { const s = (j - (n - 1) / 2) * 0.42; gwP(2.6, s, 0.2 + (j === GW.k - 1 ? hop : 0), hA); gwPut(hA.x, hA.y, hA.z, 3.6, 0.36, 0.36, yaw, '#8A5A32'); }
      if (GW.done) { gwP(1.6, 0, 0.5, hA); gwPut(hA.x, hA.y, hA.z, 0.3, 0.2, n * 0.42, yaw, '#6B4E31'); gwP(3.6, 0, 0.5, hA); gwPut(hA.x, hA.y, hA.z, 0.3, 0.2, n * 0.42, yaw, '#6B4E31'); }
      const s = (Math.min(GW.k, n - 1) - (n - 1) / 2) * 0.42; gwPK(1.4, s, 0.4, GW.tgtV); GW.tgt.x = GW.tgtV.x; GW.tgt.y = GW.tgtV.y - 0.2; GW.tgt.z = GW.tgtV.z;
      GW.at.x = GW.tgtV.x; GW.at.y = GW.y + 1.4; GW.at.z = GW.tgtV.z;
    }
    gwMesh.count = gwN; gwMesh.visible = gwN > 0; gwMesh.instanceMatrix.needsUpdate = true; if (gwMesh.instanceColor) gwMesh.instanceColor.needsUpdate = true;
    gwGlow.count = gwG; gwGlow.visible = gwG > 0; gwGlow.instanceMatrix.needsUpdate = true; if (gwGlow.instanceColor) gwGlow.instanceColor.needsUpdate = true;
  }
  /** the strike asked by the model's queue: his snap stroke at the piece; the contact is the act (M.impact), answered here on its frame */
  function gwLand(M, a) {
    if (!a) return;
    GW.k = Math.min(GW.n, GW.k + 1); GW.hop = 1; GW.ang += (Math.PI * 2) / Math.max(4, GW.n);
    const c = GW.arm === 'pull' ? GW.tgtV : hero.contact;
    caJ.x = c.x; caJ.y = c.y + 0.4; caJ.z = c.z; caActs(M, caJ, GW_TRADE[GW.job] || 'סתתים');
    dustBurst(GW.tgt.x, GW.tgt.y + 0.1, GW.tgt.z, a.q >= 2 ? 12 : 7, 2.4, 2, 1.1);
    if (a.q >= 2) sparkBurst(GW.tgt.x, GW.tgt.y + 0.2, GW.tgt.z, 12, 2, 3);
    if (M.phase === 'end' && !GW.done) { GW.k = GW.n; sparkBurst(GW.at.x, GW.at.y - 0.6, GW.at.z, 24, 3, 6); dustBurst(GW.tgt.x, GW.tgt.y, GW.tgt.z, 16, 3, 3, 1.4); shake.t = 0.18; shake.amp = 0.16; }
  }
  function gwStrike() {
    const M = GW.M; if (!M || !Array.isArray(M.queue) || !M.queue.length) return;
    M.worldOn = true;
    if (GW.arm === 'pull') {
      // the heave: every touch is a turn of the wheel (the act lands 90 ms after it); his pull on the rope plays alongside, one at a time
      const tap = M.queue.shift();
      if (!GW.busy) { GW.busy = true; heroAct('pull', GW.tgt, { snap: true, shake: false, tempo: 1.6 }).then(() => { GW.busy = false; }); }
      setTimeout(() => { M.pending = Math.max(0, M.pending - 1); if (!GW.on || GW.done) return; gwLand(M, M.impact(tap)); }, 90);
      gwStrike(); return;
    }
    if (GW.busy) return;
    const tap = M.queue.shift(); GW.busy = true;
    heroAct(GW.arm, GW.tgt, { snap: true, shake: false }).then((hit) => {
      GW.busy = false; M.pending = Math.max(0, M.pending - 1);
      if (!GW.on || GW.done) return;
      gwLand(M, M.impact(hit !== false ? tap : true));
      gwStrike();
    });
  }
  craftApi.work = {
    raw: true, generic: true,
    begin(site, o) {
      const st = ST[site];
      const why = !st ? 'no-site' : st.status !== 'building' ? 'status' : TS.run ? 'TS' : TW.on ? 'TW' : CR.kind ? 'CR' : (GW.on && !GW.done) ? 'GW' : (DS.on && !DS.done) ? 'DS' : (KS.on && !KS.done) ? 'KS' : (CL.on && !CL.done) ? 'CL' : '';
      GW.why = why;
      if (why) return { ok: false, why };
      // (the button woke within reach of the marker: a walk the game still asked for ends here — the piece is set where he stands)
      if (hero.path) { hero.path = null; if (hero.resolve) { const r = hero.resolve; hero.resolve = null; r(false); } }
      const job = o && o.job || 'F1';
      // the piece 2.4 amot from him, to the screen's left and a little up (the free quarter of the frame: not under the pill, not over
      // the thumbs), on the ground there
      let ax = hero.x - camera.position.x, az = hero.z - camera.position.z; const l = Math.hypot(ax, az) || 1; ax /= l; az /= l;
      tmpV.set(1, 0, 0).applyQuaternion(camera.quaternion); let rx = tmpV.x, rz = tmpV.z; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;
      // (the first free direction of four — left-up, left, up, right-up — by the walk's own obstacles: the stock, the crane, the rocks)
      let dx = 0, dz = 0, best = -1; GW.dirs = '';
      // (never straight up the screen: there he stands between the camera and the piece)
      for (const [kr, ka] of [[-1, 0.15], [1, 0.15], [-0.8, 0.6], [0.8, 0.6], [-0.8, -0.5], [0.8, -0.5]]) {
        let ex = rx * kr + ax * ka, ez = rz * kr + az * ka; const el = Math.hypot(ex, ez) || 1; ex /= el; ez /= el;
        const f1 = twinFree(hero.x + ex * 2.6, hero.z + ez * 2.6, hero.x, hero.z), f2 = f1 && twinFree(hero.x + ex * 6.5, hero.z + ez * 6.5, hero.x + ex * 2.6, hero.z + ez * 2.6), f3 = gwClear(hero.x + ex * 4.5, hero.z + ez * 4.5), f4 = gwSeen(hero.x + ex * 4.5, groundAt(hero.x + ex * 4.5, hero.z + ez * 4.5) + 1.6, hero.z + ez * 4.5);
        const sc = (f1 ? 8 : 0) + (f2 ? 4 : 0) + (f4 ? 2 : 0) + (f3 ? 1 : 0);
        GW.dirs += `${kr},${ka}:${+f1}${+f2}${+f3}${+f4} `;
        if (sc > best) { best = sc; dx = ex; dz = ez; if (sc === 15) break; }
      }
      const x = hero.x + dx * 2.6, z = hero.z + dz * 2.6;
      Object.assign(GW, { on: true, site, job, look: GW_LOOK[job] || 'block', M: null, busy: false, k: 0, n: Math.max(4, (o && o.n) | 0 || 8), u: 0, hop: 0, ang: 0, x, y: groundAt(x, z), z, fx: dx, fz: dz, done: false, after: 0, arm: GW_ARM[job] || 'dress' });
      hero.face = [x, z];
      gwTick(0);
      if (GW.arm !== 'pull') heroArm(GW.arm, GW.tgt);
      return { ok: true, at: GW.at };
    },
    touch(down, M) { if (M && typeof M.touch === 'function') { M.touch(down); if (down && GW.on) { GW.M = M; M.worldOn = true; gwStrike(); } } },
    act: () => true,
    update(M) { if (!GW.on || !M || !Array.isArray(M.queue)) return false; GW.M = M; M.worldOn = true; if (M.n > 0 && GW.n !== M.n) GW.n = M.n; if (!hero.armed && !GW.busy && GW.arm !== 'pull') heroArm(GW.arm, GW.tgt); gwStrike(); return true; },
    end() { if (!GW.on) return false; GW.done = true; GW.after = 2.6; hero.armed = null; return true; },
    box() { if (!GW.on) return null; gwPK(0.4, -1.6, 0, hA); gwPK(3.2, 1.6, 0, hB); return crBoxOf([[hA.x, hA.y, hA.z], [hB.x, hB.y + 3, hB.z], [hA.x, hA.y + 3, hA.z], [hB.x, hB.y, hB.z]]); },
    on: () => GW.on,
  };
  function caWork() { return { on: GW.on, why: GW.why || '', dirs: GW.dirs, job: GW.job, look: GW.look, k: GW.k, n: GW.n, u: +GW.u.toFixed(2), busy: GW.busy, done: GW.done, armed: !!hero.armed, stroke: !!hero.stroke, at: [+GW.at.x.toFixed(1), +GW.at.y.toFixed(1), +GW.at.z.toFixed(1)], boxes: gwMesh.count + gwGlow.count, vis: gwMesh.visible, parent: !!gwMesh.parent, i0: (() => { gwMesh.getMatrixAt(0, tmpM); tmpV.setFromMatrixPosition(tmpM); return [+tmpV.x.toFixed(1), +tmpV.y.toFixed(1), +tmpV.z.toFixed(1)]; })(), spot: [+GW.x.toFixed(1), +GW.y.toFixed(1), +GW.z.toFixed(1)], hero: [+hero.x.toFixed(1), +hero.y.toFixed(1), +hero.z.toFixed(1)], scr: (() => { tmpV.set(GW.at.x, GW.at.y, GW.at.z).project(camera); return [Math.round((tmpV.x * 0.5 + 0.5) * innerWidth), Math.round((-tmpV.y * 0.5 + 0.5) * innerHeight)]; })() }; }
  // ── /fable20 ──
  // the saw (SITE16's bench, the blade and the kerf) takes saw.js's world model itself (raw): its acts answered here — the sawdust at the
  // kerf on each cutting push; the chalk line on the log (cbProps); the board drops at the model's plank (SITE16's craftSawPart)
  craftSaw.raw = true;
  { const b0 = craftSaw.begin, u0 = craftSaw.update;
    craftSaw.begin = (site) => { const r = b0(site); if (r && r.ok) { CB.kind = 'saw'; CB.M = null; CB.seen = 0; CB.placed = true; CB.touching = false; } return r; };
    craftSaw.update = (m) => { const r = u0(m); if (CR.kind === 'saw' && m && m.acts) { CB.M = m; if (m.juice == null) m.juice = cbJuiceOn(); cbBonus(m); for (let i = CB.seen; i < m.acts.length; i++) cbAnswer(m.acts[i]); CB.seen = m.acts.length; } return r; };
    craftSaw.touch = (down, m) => { if (CR.kind !== 'saw') return; CB.touching = !!down; if (down) { cbTouched(); try { if (m && typeof m.touchPush === 'function') m.touchPush(); } catch (e) { /* the model's */ } } };   // (the touch-down is the push: its bite ≈ 90 ms later)
    craftSaw.act = () => { if (CR.kind !== 'saw' || !CB.M) return false; const A = CB.M.acts; for (let i = CB.seen; i < A.length; i++) cbAnswer(A[i]); CB.seen = A.length; return true; }; }
  /** tests: the craft of mine running now — its acts, the panel's light, the plumb's state, his right hand (world) */
  const cbHandV = new THREE.Vector3();
  function craftB() {
    const M = CB.M; let lit = 0; for (let k = 0; k < cbData.length; k += 4) lit += cbData[k] + cbData[k + 1] + cbData[k + 2];
    m2w(PZ.WR, cbHandV);
    return { kind: CR.kind, cb: CB.kind, acts: M && M.acts ? M.acts.length : 0, q: M && M.acts ? M.acts.map((a) => a.q) : [], pts: M ? M.pts | 0 : 0, phase: M ? M.phase : null, ver: M ? M.ver | 0 : 0,
      d: M && M.d != null ? Math.round(M.d * 1000) / 1000 : null, s: M && M.s != null ? Math.round(M.s * 1000) / 1000 : null, pay: M && M.pay != null ? M.pay : null, tiles: M ? M.tiles | 0 : 0,
      panel: cbMesh.visible, flip: CB.flipX, side: CB.side, P: [Math.round(CB.P.x * 10) / 10, Math.round(CB.P.y * 10) / 10, Math.round(CB.P.z * 10) / 10], box: craftCover.box() && { ...craftCover.box() }, lit: Math.round(lit / (cbData.length * 0.75)), hand: [cbHandV.x, cbHandV.y, cbHandV.z], held: hero.held, near: CR.near, done: CR.done, placed: CB.placed, nT: CB.nT | 0, nP: CB.nP | 0, nF: CB.nF | 0, step: !!hero.step, lat: { ms: CB_LAT.ms, fr: CB_LAT.fr }, on: CB.cloth.on, touching: !!CB.touching, posing: craftPosing(), gest: !!hero.gest, stroke: !!hero.stroke, walking: !!hero.path, door: !!hero.door, t: Math.round(CR.t * 10) / 10 };
  }
  // ── /craftb19 ──
  function buildMode() {
    resetFx();
    vs.grown = false;
    setAll('locked');
    setStage('har', 'avail');
    setBoulders(bSt.map(() => 2));
    heroPlace({ x: 96, z: -58, faceX: 400, faceZ: -160, region: 'out' });
    hero.at = null;
  }
  function demoMode() {
    resetFx();
    setAll('done');
    vs.grown = true; vineSync(true);        // the finished Temple: the golden vine grown (QA P1-3)
    setBoulders([]);
    hero.vis = false; hero.mesh.visible = hero.ring.visible = false; hero.path = null;
  }

  const api = {
    ids: STAGE_IDS.slice(),
    setStage, setBoulders, hitBoulder,
    hero: heroApi,   // ── hero (PEOPLE) ── the hero API is built in the hero block (walkTo swing place show setTool tool position at act onImpact workpiece …)
    pick, siteCenter, siteTop, focus, celebrate, workFX, update,
    // GDD §12 world API (v2)
    hotspot, screenPos, setCraneSite, showPlan, orbit, showcase, redLine, boxes, setVine, rain: setRain, shine,
    strikeFX, setComboLevel, playTimelapse, setQuarryStock, momentFX,
    crane: craneInfo, scaffold: scaffoldInfo,   // (read-only, for src/crews.js)
    ashlar: { geometry: ashGeo, material: props.material, rough: roughGeo, roughMaterial: field.material },   // (wave 6: real stones for carts; share, don't dispose)
    // wave 6: the construction site stone by stone (docs/SITE.md)
    siteInfo, setWork, liftStone, nextSlot, slots, workSpot, frontView,
    // ── site8 ── the Mount's close camera (wave 8B): boulderView(i, from?) → { p, t, dist, az, el, hero } · clearView(x, y, z, dist,
    // az, el, also?) → { az, el, dist, moved } | null · occluded(x, y, z, from?) → bool · heroRock() → the builder's rock (−1: none)
    boulderView, clearView, occluded, heroRock, wallView,
    // ── site9 ── the boulder field (wave 9): boulderSpots() → 12 × [x, z, r] in G.bh's order, `.order` = the strike order ·
    // deliverKeyStone(id, { what, great, ms }) → Promise<{ course, index, stones } | false>: the cart brings the hewn key stone, the
    // crane sets it (main.js `// ── site9 ──` attaches crews.keyCart as stages.keyCart)
    boulderSpots, deliverKeyStone, camFloor,
    // ── flow10 ── the course check's stand and frame at the Mount: checkView(id) → { spot, target, p, t } | null · flyTo(p, t, ms)
    checkView, flyTo,
    // ── site11 ── (N34, FLOW11's reload landing) posed(id) → bool: the site's crane, stock and banker stand at the working
    // front and the load's ripple has settled · onPosed(id, fn(ok), maxMs = 12000): fn once, when it is (or after maxMs)
    posed, onPosed, sitePosed: posed, siteWorkView, frameBlocked: frameBlockedApi, courseView,   // ── site12 ── (courseView)
    // ── site13 ── finishLabel() → the Ezrat Nashim's chamber rising now { text, sub, src, x, y, z, t, i } | null (main.js shows it) ·
    // machines() → the crews' machines per site (the census: { id: { crane, shear, sled, onTop } })
    // ── site14 ── the jobs in the building: jobReveal(id, kind, q, o) · jobSpot(id, o) · stoneMark(site, mark) · marks() · setOwned(o)
    setTools: (m) => HB.setTools(m), jobReveal, jobSpot, stoneMark, marks: () => JOBS.marks.map((m) => ({ site: m.site, course: m.course, index: m.index, x: m.x, y: m.y, z: m.z, nx: m.nx, nz: m.nz, shown: m.shown })), setOwned, jobs: JOBS,
    // ── site15 ── the tasks' scenes (bus/SITE15.md): taskScene(stage, task, { q, skip, sfx, world, n, tap, hero, safe }) → Promise ·
    // taskMarks(list) → n · taskSpot(stage, task) → { x, y, z } | null · the scene running now (tests): taskRunning()
    treadBegin, treadUpdate, treadEnd, tread: () => ({ on: TW.on, site: TW.site, i: TW.i, h: TW.h, hy: TW.hy, phase: TW.phase, set: TW.set.length, inWheel: TW.inWheel, at: TW.at ? [TW.at.x, TW.at.y, TW.at.z] : null, block: [crane.block.position.x, crane.block.position.y, crane.block.position.z], carry: crane.block.visible }),   // ── site15 ── המנופאי
    craft: craftApi, craftState, dustBurst, sparkBurst,   // ── site16 ── the crafts in the world: stages.craft = { tread, saw, line } (bus/SITE16.md)
    craftB,   // ── craftb19 ── (tests: my crafts' state) ── /craftb19 ──
    caTread, caCord, caSurvey, caKey, caDress, caColumn, caWork,   // ── crafta19 ── (tests; the survey's counter) ── /crafta19 ──
    // ── twin17 ── (twin.js) his feet, read every frame without a new vector; a small shake for a touch on material
    xray: (on) => { xrOn = !!on; },   // ── twin18 ── ── /twin18 ──
    // ── twin20 ── the right thumb's aim in the world: ONE flat arrow on the ground from (x, z) along dir (radians, from +x toward +z), len in amot
    aim: (x, z, dir, len, on, hot) => {
      let A = createStages.__aim20; if (!A || A.scene !== scene) {
        const sh = new THREE.Shape(); sh.moveTo(0, -0.22); sh.lineTo(0.72, -0.22); sh.lineTo(0.72, -0.5); sh.lineTo(1, 0); sh.lineTo(0.72, 0.5); sh.lineTo(0.72, 0.22); sh.lineTo(0, 0.22); sh.closePath();
        const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2);
        const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xFFB020, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
        m.name = 'twin20-aim'; m.renderOrder = 998; m.frustumCulled = false; m.visible = false; scene.add(m); A = createStages.__aim20 = { scene, m };
      }
      const m = A.m; m.visible = !!on; if (!on) return false;
      m.position.set(x, groundAt(x, z) + 0.2, z); m.rotation.y = -dir; m.scale.set(Math.max(0.5, len), 1, Math.max(0.5, Math.min(1.2, len * 0.22)));
      m.material.color.setHex(hot ? 0x58E08A : 0xFFB020); return true;
    },
    aimOn: () => !!(createStages.__aim20 && createStages.__aim20.m.visible),
    // ── /twin20 ──
    heroXYZ: (out) => { const o = out || {}; o.x = hero.x; o.y = hero.y; o.z = hero.z; o.yaw = hero.yaw; o.vis = hero.vis; return o; },
    twinShake: (t = 0.08, amp = 0.1) => { shake.amp = shake.t > 0 ? Math.max(shake.amp, amp) : amp; shake.t = Math.max(shake.t, t); },
    // ── /twin17 ──
    taskScene, taskMarks, taskSpot, taskRunning: () => (TS.run ? { id: TS.run.id, stage: TS.run.stage, kind: TS.run.kind, t: TS.run.t, dur: TS.run.dur, arrived: TS.run.arrived, px: TS.run.px } : null),
    finishLabel, cartLane, machines: () => Object.fromEntries(Object.entries(MK.sites).filter(([, m]) => m.crane).map(([id, m]) => [id, { crane: [m.crane.tx, m.crane.ty, m.crane.tz], hook: [m.crane.tx, m.crane.hy, m.crane.tz], base: [m.bx, m.by, m.bz], shear: mkAt(m, m.aS, m.oS), sled: mkAt(m, m.sled ? m.sled.along : 0, m.so || 15.5) }])),
    // ── site11 ── the game table by the quarry (a tap → pick() → { kind: 'table' }; main.js opens the games): { x, y, z, on }
    gameTable: () => ({ x: GTAB.x, y: groundAt(GTAB.x, GTAB.z) + 2.6, z: GTAB.z, on: quarryOn }),
    quarry: { x: QX, z: QZ, spot: { x: QSPOT.x, z: QSPOT.z } }, hasQuarry: true,
    // extras
    status: (id) => (ST[id] ? { status: ST[id].status, progress: ST[id].target, shown: ST[id].disp } : null),
    // the golden vine as shown: hung (the Ulam done), grown (the finished Temple), and the leaves, grapes, clusters in view
    vineState: () => ({ on: vine.on, hung: vineHung(), grown: vs.grown || (vs.demo && vineHung()), visible: vine.grp.visible, stems: vine.stemT, want: vine.kinds.map((k) => k.want), shown: vine.kinds.map((k) => k.m.count) }),
    isDone, groundAt, setAll, buildMode, demoMode, setScale, prewarm,
    shakeOffset: shake.off,
    fx: [dust.points, spark.points, halo.points, outline, beams, ringFx, hero.ring, fxG],
    get boulders() { return bSt.map((b) => b.state); },
    _dbg: { crane, ST, hero, hill, W, pave: () => paveN(), get nWork() { return nWork; }, glows, flames, hs, vine, rain, bx, tl, plan, show, orb, get quarryOn() { return quarryOn; }, get nightK() { return nightK; }, get combo() { return comboN; } },
  };
  demoMode();
  return api;
}
