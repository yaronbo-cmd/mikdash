/* ── places24 ── anchors.js — the REAL places of the Tamid's works (WAVE24 PLACES24): "רוצים להראות בדיוק רב ככל הניתן את העבודות".
 * A work in `anchor` mode is not a model stage set down beside the אמרכל: the stage IS the place. kit.place({ anchor: id }) puts the
 * kit's frame on the real point (world amot, src/places.js), turned to the place's own facing, at the figures' scale (K: a kohen as tall
 * as the אמרכל); the work draws only what the place lacks (a kohen, a shovel, a log, a lamb) — the altar, the ramp, the menorah, the
 * golden altar, the laver, the דוכן, the steps and the gates are the world's own geometry (temple.js, sanctuary.js, avodah3d.js,
 * water.js). Coordinates: +x east, −x west, +z south, −z north, y up (amot; the azara's floor is 16, the altar's top 25, the
 * Heichal's floor 22).
 *   ANCHORS[id] = { id, he, x, y, z, face: [fx, fz] (the frame's "a" axis: ahead, as the camera looks), K, area: [x0, x1, z0, z1]
 *                   (the place's footprint: the works' props stay within 3 amot of it), solids: [WALLS22 rect names the props may stand
 *                   on/in], has: [what the world already draws there], pts: { name: [x, y, z] }, view: { p, t } (a camera that sees
 *                   the act: the camera may stand where the player may not — inside the Heichal's door — the אמרכל stays outside),
 *                   hero: [x, z] (where the errand's marker stands: open floor, the place in sight) }
 * Nothing red, no Divine Name. ── /places24 ── */
import { ALTAR, KEVESH, MAARACHOT, DESHEN_PLACE, LIMBS_PLACE, KIYOR, KIYOR_MECHANISM, MENORAH, MENORAH_STONE, GOLD_ALTAR, HEICHAL_DOOR, DUCHAN, ULAM_STEPS, GATES, LAMBS_CHAMBER_DOOR, LEVEL, LIBATION_BOWLS, ALTAR_CORNERS, TAMID_RING, SHULCHAN } from '../../places.js';

/** the figures' scale on a real place: man() at scale 1 is ~1.5 local units tall; × 2.3 ≈ 3.4 amot ≈ 1.65 m — the אמרכל's height */
export const KA = 2.3;
const RAMP_Y = (z) => LEVEL.azara + (KEVESH.zFoot - z) / (KEVESH.zFoot - KEVESH.zTop) * (LEVEL.altarTop - LEVEL.azara);
const STEPS_X = [-55, -56, -57, -60, -61, -62, -65, -66, -67, -70, -71, -72];   // the 12 steps up to the Ulam (temple.js / avodah3d.js)
const stepY = (x) => { let n = 0; for (const xr of STEPS_X) if (x <= xr) n++; return LEVEL.azara + 0.5 * n; };
const H_FLOOR = LEVEL.heichal;
/** the floor under (x, z) on and about the real places (the same as avodah3d.js groundY where they overlap; a test reads it) */
export function placeGround(x, z) {
  const T = ALTAR.body;
  if (x >= T.x0 && x <= T.x1 && z >= T.z0 && z <= T.z1) return LEVEL.altarTop;
  if (x >= KEVESH.x0 && x <= KEVESH.x1 && z > KEVESH.zTop && z <= KEVESH.zFoot) return RAMP_Y(z);
  if (x > -76.2 && x < -54.5 && Math.abs(z) < 50) return stepY(x);
  if (x <= -76.2 && x >= -176 && Math.abs(z) < 30) return H_FLOOR;
  if (x > -11 && x <= -10) return 15.5;   // (the three half-amah steps up from the דוכן's step: avodah3d.js groundY)
  if (x > -10 && x <= -9) return 15;
  if (x > -9 && x <= -8) return 14.5;
  if (x > -8 && x <= 0 && Math.abs(z) <= 67.5) return LEVEL.yisrael;   // (the court of Israel)
  if (x > 0 && x < 24 && Math.abs(z) < 14) { const r = Math.hypot(x - 10, z); return x < 10 ? LEVEL.yisrael : Math.max(LEVEL.nashim, Math.min(LEVEL.yisrael, LEVEL.yisrael - (r - 6.5))); }   // (Nikanor's gatehouse and its fifteen rounded steps: avodah3d.js groundY)
  return LEVEL.azara;
}
export const rampY = RAMP_Y;

const G = (x, z) => placeGround(x, z);
const P3 = (x, z, dy = 0) => [x, G(x, z) + dy, z];
export const ANCHORS = {
  /** the altar's top: the great מערכה in the east, the תפוח in the middle, the ketoret's מערכה at the south-west; the ramp's head at the south */
  altar: {
    he: 'ראש המזבח', x: -33, y: LEVEL.altarTop, z: 2, face: [-1, 0], K: KA,
    area: [ALTAR.body.x0, ALTAR.body.x1, ALTAR.body.z0, ALTAR.body.z1], solids: ['altar', 'kevesh'],
    has: ['altar', 'horns', 'sovev', 'maarachot', 'tapuach', 'kevesh', 'libation-bowls'],
    pts: { great: [MAARACHOT.great.x, LEVEL.altarTop, MAARACHOT.great.z], tapuach: [MAARACHOT.tapuach.x, LEVEL.altarTop, MAARACHOT.tapuach.z], ketoret: [MAARACHOT.ketoret.x, LEVEL.altarTop, MAARACHOT.ketoret.z],
      rampHead: [-38, LEVEL.altarTop, KEVESH.zTop - 0.6], pile: [-26.5, LEVEL.altarTop, 6.5], horns: [[-23, ALTAR_CORNERS.NE[1]], [-53, ALTAR_CORNERS.NW[1]], [-23, ALTAR_CORNERS.SE[1]], [-53, ALTAR_CORNERS.SW[1]]],
      bowls: [LIBATION_BOWLS.wine[0], LIBATION_BOWLS.wine[1], LIBATION_BOWLS.wine[2]], swHorn: [-51.6, LEVEL.altarTop, 9.6] },
    view: { p: [-11, 38.5, 22], t: [-33, 25.4, -1] },
    hero: [-17, 3],
  },
  /** the ramp (כבש): 32 long, 16 wide, from the floor (z 42.5, y 16) up to the altar's top (z 10.5, y 25); the kohen walks on its slope */
  ramp: {
    he: 'הכבש', x: -38, y: RAMP_Y(26.5), z: 26.5, face: [0, -1], K: KA,
    area: [KEVESH.x0 - 5, KEVESH.x1 + 3, KEVESH.zTop - 15, KEVESH.zFoot + 2], solids: ['kevesh', 'altar'],   // (+ the ash place east of the ramp: DESHEN_PLACE x −29.3)   // (west of the ramp: the table of fats, the limbs' place)
    has: ['kevesh', 'altar', 'sovev'],
    pts: { foot: [-38, LEVEL.azara, KEVESH.zFoot + 0.6], top: [-38, LEVEL.altarTop, KEVESH.zTop], deshen: [DESHEN_PLACE.x, LEVEL.azara, DESHEN_PLACE.z], limbs: [LIMBS_PLACE.x, RAMP_Y(34.5), 34.5],
      fire: [MAARACHOT.great.x, LEVEL.altarTop, MAARACHOT.great.z + 2], tapuach: [MAARACHOT.tapuach.x, LEVEL.altarTop, MAARACHOT.tapuach.z] },
    view: { p: [-8, 33, 52], t: [-35, 20.5, 22] },
    hero: [-25, 36],
  },
  /** the menorah inside the Heichal (south side, 2½ amot from the wall; the stone with three steps before it, תמיד ג, ט) — the camera goes in, the אמרכל stays outside */
  menorah: {
    he: 'המנורה', x: MENORAH.x, y: H_FLOOR, z: MENORAH.z, face: [-1, 0], K: KA, inside: true,
    area: [MENORAH.x - 2, MENORAH_STONE.x + 2, MENORAH.z - 3, MENORAH.z + 2], solids: ['house'],
    has: ['menorah', 'lamps', 'menorah-stone', 'golden-altar', 'shulchan', 'doors'],
    pts: { stone: [MENORAH_STONE.x, H_FLOOR, MENORAH_STONE.z], stand: [MENORAH_STONE.x + 1.4, H_FLOOR, MENORAH_STONE.z - 0.6], lampsY: H_FLOOR + MENORAH.h, door: [HEICHAL_DOOR.x0 - 0.5, H_FLOOR, 0] },
    view: { p: [-127.6, H_FLOOR + 5.0, 0.6], t: [-123.9, H_FLOOR + 1.9, 7.4] },   // (from the north-west: the kohen on the stone and the lamps side by side)
    hero: [-74.5, 0],
  },
  /** the golden altar in the Heichal's middle, before the פרוכת */
  golden: {
    he: 'מזבח הזהב', x: GOLD_ALTAR.x, y: H_FLOOR, z: GOLD_ALTAR.z, face: [-1, 0], K: KA, inside: true,
    area: [GOLD_ALTAR.x - 2, GOLD_ALTAR.x + 4, -3, 3], solids: ['house'],
    has: ['golden-altar', 'coals', 'ketoret-cloud', 'menorah', 'shulchan', 'doors'],
    pts: { top: [GOLD_ALTAR.x, H_FLOOR + GOLD_ALTAR.h + 0.02, GOLD_ALTAR.z], stand: [GOLD_ALTAR.x + 1.5, H_FLOOR, GOLD_ALTAR.z + 0.4], shulchan: [SHULCHAN.x, H_FLOOR, SHULCHAN.z], door: [HEICHAL_DOOR.x0 - 0.5, H_FLOOR, 0] },
    view: { p: [-112.4, H_FLOOR + 5.6, -4.4], t: [-121.2, H_FLOOR + 1.6, 0.8] },
    hero: [-74.5, 0],
  },
  /** the laver (כיור) between the Ulam and the altar, to the south; Ben Katin's 12 spouts and the wheel over it (water.js moves them) */
  laver: {
    he: 'הכיור', x: KIYOR.x, y: LEVEL.azara, z: KIYOR.z, face: [-1, 0], K: KA,
    area: [KIYOR.x - 3, KIYOR.x + 3, KIYOR.z - 4, KIYOR.z + 7], solids: ['kiyor'],
    has: ['kiyor', 'spouts', 'water', 'mukhni-wheel', 'chains'],
    pts: { rim: [KIYOR.x, KIYOR.rim, KIYOR.z], spoutR: 2.08, spoutY: KIYOR.rim - 1.08, wheel: [KIYOR_MECHANISM.x, KIYOR_MECHANISM.axleY, KIYOR_MECHANISM.wheel.z], wheelR: KIYOR_MECHANISM.wheel.r,
      stand: [KIYOR.x + 3.0, G(KIYOR.x + 3.0, KIYOR.z), KIYOR.z] },
    view: { p: [-49, 27.5, 31], t: [-63.5, 21.6, 21] },
    hero: [-57, 14.2],
  },
  /** the Levites' platform (דוכן) between the court of Israel and the court of the kohanim, one amah high, and its three half-amah steps */
  duchan: {
    he: 'הדוכן', x: (DUCHAN.x0 + DUCHAN.x1) / 2, y: DUCHAN.y, z: -8, face: [-1, 0], K: KA,
    area: [DUCHAN.x0 - 3, DUCHAN.x1 + 6, DUCHAN.z0, DUCHAN.z1], solids: [],   // (and the court of Israel before it: the people)
    has: ['duchan', 'steps'],
    pts: { from: [-8.5, DUCHAN.y, -15], to: [-8.5, DUCHAN.y, -3.75], benArza: [-10.6, 15, -8.4], trumpets: [[-49.5, LEVEL.azara + 1, 27.3], [-49.5, LEVEL.azara + 1, 30.3]] /* (on the table of fats, west of the ramp — avodah3d.js) */, people: [-4, LEVEL.yisrael, -8] },
    view: { p: [-24, 27, -24], t: [-9, 15.5, -7] },
    hero: [-13.5, -6],
  },
  /** the twelve steps of the Ulam: the kohanim stand on them facing the court for the blessing (תמיד ז, ב) */
  steps: {
    he: 'מעלות האולם', x: -70.5, y: stepY(-70.5), z: 0, face: [1, 0], K: KA,
    area: [ULAM_STEPS.x0, ULAM_STEPS.x1 + 2, -16, 16], solids: [],
    has: ['steps', 'ulam', 'heichal-door'],
    pts: { top: [-74, LEVEL.heichal, 0], row: [-71.5, stepY(-71.5), 0], foot: [-56, stepY(-56), 0] },
    view: { p: [-56.0, 27.8, -6.5], t: [-71.2, 22.6, 0.6] },   // (from before the steps, north of the altar's line: the row face the camera; the ketoret's pyre out of frame)
    hero: [-60, 8.5],
  },
  /** Nikanor's gate: a gatehouse (temple.js gate('E', −4…10, ±14)) whose doorway — 10 wide, 20 high (13.5 → 33.5) — and its two bronze
   *  leaves face east, over the fifteen rounded steps to the women's court; the leaves are the world's (merged, shut): the work draws
   *  them swinging open in front of them, the doorway dark behind (the props the place lacks: the motion) */
  nikanor: {
    he: 'שער ניקנור', x: 10, y: LEVEL.yisrael, z: 0, face: [-1, 0], K: KA,
    area: [6, 18, -9, 9], solids: [],
    has: ['gatehouse', 'doorway', 'leaves (shut)', 'steps15'],
    pts: { hingeN: [10.55, LEVEL.yisrael, -5], hingeS: [10.55, LEVEL.yisrael, 5], wicket: [10.45, LEVEL.yisrael, -7.4], leafW: 5, leafH: 19.8 },
    view: { p: [41, 33, 13], t: [10.5, 21.5, 0] },   // (from the women's court, over the fifteen steps: the doorway whole, the trumpeters on the top step)
    hero: [-9.5, -3.4],
  },
  /** the lambs' chamber of Beit HaMoked (the Tamid's lamb waits there, checked): its door into the hall */
  pen: {
    he: 'לשכת הטלאים', x: LAMBS_CHAMBER_DOOR.x + 1.5, y: LEVEL.azara, z: LAMBS_CHAMBER_DOOR.z, face: [-1, 0], K: KA,
    area: [LAMBS_CHAMBER_DOOR.x - 3, LAMBS_CHAMBER_DOOR.x + 8, LAMBS_CHAMBER_DOOR.z - 4, LAMBS_CHAMBER_DOOR.z + 6], solids: [],
    has: ['lambs-chamber', 'door'],
    pts: { door: [LAMBS_CHAMBER_DOOR.x, LEVEL.azara, LAMBS_CHAMBER_DOOR.z], mat: [LAMBS_CHAMBER_DOOR.x + 3.2, LEVEL.azara, LAMBS_CHAMBER_DOOR.z + 0.6], ring: [TAMID_RING.morning[0], LEVEL.azara, TAMID_RING.morning[1]] },
    view: { p: [-153, 29, -49], t: [-166, 17.5, -61.5] },
    hero: [-163, -55],
  },
  /** the place of slaughter north of the altar: the morning Tamid at the second ring of the north-west (תמיד ד, א), and the altar's two
   *  corners for its blood — north-east and south-west (זבחים ה, ד): the kohen walks from the ring to the one, and round the north and the
   *  west to the other */
  rings: {
    he: 'בית המטבחיים', x: TAMID_RING.morning[0], y: LEVEL.azara, z: TAMID_RING.morning[1], face: [0, 1], K: KA,
    area: [-58, -18, -50, 16], solids: [],
    has: ['rings', 'pillars', 'tables', 'altar', 'corners'],
    pts: { ring: [TAMID_RING.morning[0], LEVEL.azara, TAMID_RING.morning[1]], ne: [ALTAR_CORNERS.NE[0], LEVEL.azara, ALTAR_CORNERS.NE[1]], sw: [ALTAR_CORNERS.SW[0], LEVEL.azara, ALTAR_CORNERS.SW[1]] },
    view: { p: [-33, 31, -16], t: [-46, 17.5, -36] },
    hero: [-56.5, -36],   // (west of the rings: the camera comes from the south-east, he is never between)
  },
  /** the night's posts on the azara's north side (מדות א, א: the kohanim guard at בית הניצוץ and בית המוקד; the Levites at the gates and by
   *  לשכת הקרבן) — the watch walks from post to post; Beit HaMoked's door to the azara is the last */
  moked: {
    he: 'משמרות הלילה', x: GATES.moked.x, y: LEVEL.azara, z: GATES.moked.z + 1, face: [0, -1], K: KA,
    area: [GATES.moked.x - 8, GATES.nitzotz.x + 8, -67.5, -48], solids: [],
    has: ['gates', 'posts', 'wall'],
    pts: { postW: [GATES.moked.x - 2.3, LEVEL.azara, GATES.moked.z + 0.9], postE: [GATES.moked.x + 2.3, LEVEL.azara, GATES.moked.z + 0.9] },
    view: { p: [-150, 26, -42], t: [-160, 18.5, -57] },
    hero: [-33, -51],
  },
};
for (const id in ANCHORS) ANCHORS[id].id = id;
/** the night's posts: three real gates of the azara's north side and their Levite guards (מדות א, א) — שער הניצוץ, שער הקרבן, בית המוקד */
export const NIGHT_POSTS = [
  { he: 'שער הניצוץ', x: GATES.nitzotz.x, z: -65.5 }, { he: 'שער הקרבן', x: GATES.korban.x, z: -65.5 }, { he: 'בית המוקד', x: GATES.moked.x + 3.4, z: -56.4 },
];
/** the world's WALLS22 rects, by name (the order of avodah3d.js FLOOR_OBS): a prop on the altar's top is "in" the altar rect but above its floor */
export const SOLID_NAMES = ['altar', 'kevesh', 'kiyor', 'house', 'ulam', 'tables', 'gazit', 'north', 'moked1', 'moked2', 'moked3', 'lambs1', 'lambs2'];
/** the works → their anchor (the deliverable of PLACES24; PAYIS24 builds its own works against ANCHORS / kit.place({ anchor })) */
export const WORK_ANCHOR = {
  deshen: 'ramp', maaracha: 'altar', heichal: 'menorah', neirot: 'golden', ketoret: 'golden', taleh: 'pen', kiddush: 'laver', kiyor: 'laver',
  shir: 'duchan', shir2: 'duchan', birkat: 'steps', shaarim: 'nikanor', gates: 'nikanor', night: 'moked', zerika: 'rings', evarim: 'ramp', erev: 'rings',
};
export const anchorOf = (id) => ANCHORS[id] || null;
/** the switch: anchor mode on (default); `globalThis.__PLACES24 = 0` puts the works back on their model stages (a test / a fallback) */
export const anchorsOn = () => { try { return globalThis.__PLACES24 !== 0; } catch (e) { return true; } };
try { globalThis.__ANCHORS24 = { ANCHORS, WORK_ANCHOR, placeGround, NIGHT_POSTS }; } catch (e) { /* tests */ }
