/* ─────────────────────────────────────────────────────────────────────────────
 * places.js — the shared map of the Temple for the service (Phase B) and for the world.
 * ONE source of truth for every coordinate that more than one module uses:
 *   temple.js / sanctuary.js (architecture and vessels), animals.js / actors.js / avodah3d.js / life.js
 *   (animals, kohanim, props, effects) and src/avodah/* (the gameplay of the service).
 * Units: 1 = 1 amah (~48 cm). Axes: +x east, −x west, +z SOUTH, −z NORTH, +y up (PROJECT.md §4).
 * `src`: the source for the place. `illus: true`: the sources give no exact position, so this is our
 * illustration choice, and any card that shows it must say so.
 * Change a coordinate only together with the geometry that depends on it, and log it in PROJECT.md §11.
 * Nothing here is approved content: it is a drafting aid (PROJECT.md §2.2).
 * ──────────────────────────────────────────────────────────────────────────── */

export const LEVEL = { mount: 0, chel: 6, nashim: 6, yisrael: 13.5, azara: 16, heichal: 22, altarTop: 25, redLine: 21 };

/* ───────── The house (Middot 4:6–7) ─────────
 * East → west from x = −76: Ulam wall 5, Ulam 11, Heichal wall 6, Heichal 40, amah traksin 1,
 * Kodesh HaKodashim 20, wall 6, cell 6, cell wall 5 (ends at x = −176). Inside width 20.
 * The lower storey is 40 high above the 6-amah אטום, so its floor is y = 22 and its ceiling y = 62. */
export const ULAM = { x0: -92, x1: -81, z0: -30, z1: 30, y0: 22, y1: 95, src: 'מדות ד, ז' };
export const HEICHAL_DOOR = { x0: -98, x1: -92, z0: -5, z1: 5, y0: 22, y1: 42, src: 'מדות ד, א' };   // 20 high, 10 wide
export const HEICHAL = { x0: -138, x1: -98, z0: -10, z1: 10, y0: 22, y1: 62, src: 'מדות ד, ו–ז' };
export const AMAH_TRAKSIN = { x0: -139, x1: -138, src: 'מדות ד, ז; יומא ה, א' };
// two curtains an amah apart: the outer one folded back at the south, the inner one at the north (Yoma 5:1)
export const PAROCHOT = { outer: { x: -138, open: 'south' }, inner: { x: -139, open: 'north' }, src: 'יומא ה, א' };
export const KODESH = { x0: -159, x1: -139, z0: -10, z1: 10, y0: 22, y1: 62, src: 'מדות ד, ז' };
// "משנטל הארון, אבן היתה שם ... ושתיה היתה נקראת, גבוהה מן הארץ שלש אצבעות" — NO Ark in the Second Temple
export const EVEN_SHTIYA = { x: -149, z: 0, y: 22, h: 0.125, src: 'יומא ה, ב' };
// openings in the upper storey over the Kodesh HaKodashim, for lowering the craftsmen in boxes (Middot 4:5)
export const UPPER_OPENINGS = { x0: -159, x1: -139, z0: -10, z1: 10, y: 67, src: 'מדות ד, ה' };

/* ───────── The vessels of the Heichal ─────────
 * Sides: the table north, the menorah south, each 2½ amot from the wall, the golden altar between them
 * and drawn slightly outward (Yoma 33b). How far along the room they stood is not stated for the Second Temple
 * (Menachot 98b's "from half the house inward" is said of Solomon's tables): the x values are an illustration. */
export const SHULCHAN = { x: -125, z: -7.5, y: 22, len: 2, wid: 1, h: 1.5, src: 'יומא לג, ב; שמות כה, כג', illus: true };
export const MENORAH = { x: -125, z: 7.5, y: 22, h: 3, lamps: 7, src: 'יומא לג, ב; מנחות כח, ב', illus: true };   // 18 tefachim = 3 amot
export const MENORAH_STONE = { x: -122.8, z: 7.5, steps: 3, src: 'תמיד ג, ט', illus: true };   // "ואבן היתה לפני המנורה ובה שלש מעלות"
export const GOLD_ALTAR = { x: -121, z: 0, y: 22, w: 1, h: 2, src: 'יומא לג, ב; שמות ל, א–ב', illus: true };
// two tables inside the Ulam at the entrance of the house: marble (bread going in) and gold (bread coming out)
export const ULAM_TABLES = { marble: { x: -89.5, z: -7 }, gold: { x: -89.5, z: 7 }, src: 'מנחות יא, ז', illus: true };

/* ───────── The outer altar (Middot 3:1–4) ───────── */
export const ALTAR = { x0: -54, x1: -22, z0: -19.5, z1: 12.5, top: 25, body: { x0: -52, x1: -24, z0: -17.5, z1: 10.5 }, src: 'מדות ג, א' };
// corners of the lower body, for blood below or above the red line (y = 21). The olah: NE and SW,
// "two gifts that are four" (Zevachim 5:4; Tamid 4:1).
export const ALTAR_CORNERS = { NE: [-23, -18.5], NW: [-53, -18.5], SE: [-23, 11.5], SW: [-53, 11.5] };
export const MAARACHOT = { great: { x: -29.5, z: -3.5 }, ketoret: { x: -49.5, z: 6.5 }, tapuach: { x: -38, z: -3.5 }, src: 'תמיד ב, ד–ה' };
// SW horn: the two holes for the blood of the west and south yesod, and the two silver bowls of the libations
export const SHITIN = { x: -53, z: 11.5, src: 'מדות ג, ב; סוכה ד, ט' };
export const KEVESH = { x0: -46, x1: -30, zTop: 10.5, zFoot: 42.5, src: 'מדות ג, ג' };
export const LIMBS_PLACE = { x: -44.5, z0: 26.5, z1: 42.5, src: 'תמיד ד, ג' };   // "מחצי הכבש ולמטה במערבו"
export const DESHEN_PLACE = { x: -29.3, z: 32.5, src: 'תמיד א, ד', illus: true };   // "הלך למזרחו של כבש כעשר אמות ... רחוק מן הכבש שלשה טפחים"

/* ───────── The kiyor, between the Ulam and the altar, drawn to the south (Middot 3:6) ───────── */
export const KIYOR = { x: -63.5, z: 20, y: 19, rim: 22.95, spigots: 12, src: 'מדות ג, ו; יומא ג, י' };

/* ───────── The place of slaughter, north of the altar (Middot 3:5) ───────── */
export const RINGS = { xs: [-47, -41, -35, -29], zs: [-29.5, -33.5, -37.5, -41.5, -45.5, -49.5], y: 16.1, src: 'מדות ג, ה' };
// the morning Tamid "על קרן צפונית מערבית, על טבעת שניה", the afternoon one at the north-east (Tamid 4:1)
export const TAMID_RING = { morning: [-47, -33.5], afternoon: [-29, -33.5], src: 'תמיד ד, א', illus: true };
export const HOOK_PILLARS = { xs: [-52, -48, -44, -40, -36, -32, -28, -24], z: -60, src: 'מדות ג, ה' };
export const MARBLE_TABLES = { xs: [-50, -46, -42, -38, -34, -30, -26], z: -56, src: 'מדות ג, ה' };

/* ───────── Chambers ───────── */
// Beit HaMoked: half inside the azara (the south part), half outside; four chambers opening on its hall (Middot 1:6–8).
export const BEIT_HAMOKED = { x0: -178, x1: -142, z0: -83, z1: -58, src: 'מדות א, ו–ח' };
// the lambs' chamber, in the part that is inside the holy; six checked lambs always waiting (Arachin 2:5)
export const LAMBS_CHAMBER = { x0: -178, x1: -167, z0: -67.5, z1: -58, floor: 16, src: 'מדות א, ו; תמיד ג, ג; ערכין ב, ה', illus: true };
// (Life agent) the openings the service's paths use: the lambs' chamber opens east into Beit HaMoked's hall, and the hall
// opens south into the azara at GATES.moked (Middot 1:6–8: the four chambers open on the hall). Positions: illustration.
export const LAMBS_CHAMBER_DOOR = { x: -167, z: -62.6, w: 2.8, faces: 'east', illus: true };
// north chambers: salt, hides (פרוה), rinsing (מדיחין) (Middot 5:3). Positions along the wall: illustration.
export const NORTH_CHAMBERS = { salt: { x0: -84, x1: -75 }, parva: { x0: -75, x1: -66 }, rinse: { x0: -66, x1: -57 }, z0: -67.5, z1: -57, src: 'מדות ה, ג', illus: true };
// south chambers: wood, the well (גולה), Gazit (built in temple.js) (Middot 5:4)
export const GAZIT = { x0: -100, x1: -62, z0: 58, z1: 82, src: 'מדות ה, ד' };
// Beit Avtinas, where the ketoret was made: an upper chamber (over the Water Gate: illustration)
export const BEIT_AVTINAS = { x0: -47, x1: -29, z0: 64, z1: 78, y0: 50, src: 'מדות א, א; יומא א, ה', illus: true };
// the odd paving stone in the wood chamber (Shekalim 6:2: a kohen saw a floor stone that differed from the others).
// Its place in the chamber: illustration (Sprint 3, sanctuary agent)
export const ODD_STONE = { x: 120, z: -50, y: 6, src: 'שקלים ו, ב', illus: true };
// the wood chamber of Ezrat Nashim (NE), where by tradition the Ark was hidden (Shekalim 6:1–2)
export const WOOD_CHAMBER = { x0: 101, x1: 141, z0: -67.5, z1: -27.5, src: 'מדות ב, ה; שקלים ו, א–ב' };

/* ───────── Sprint 2 additions (sanctuary agent) ───────── */
// the marble slab with a ring in the paving at the SW corner of the altar, the way down to the drain (Middot 3:3)
export const RING_SLAB = { x: -54.3, z: 14.2, y: 16, src: 'מדות ג, ג', illus: true };
// the two silver libation bowls on the altar by the SW horn (Sukkah 4:9) and the two holes on the yesod there (Middot 3:2)
export const LIBATION_BOWLS = { water: [-50.3, 25, 9.3], wine: [-49.1, 25, 9.3], holes: [[-53.55, 17, 12], [-52.5, 17, 12]], src: 'סוכה ד, ט; מדות ג, ב', illus: true };
// Ben Katin's mechanism for the kiyor: a pit under it and a wooden windlass over it (Yoma 3:10; Tamid 3:8). Form: illustration
export const KIYOR_MECHANISM = { x: -63.5, z: 20, posts: [16.2, 23.8], axleY: 28.6, wheel: { z: 25, r: 2.3 }, src: 'יומא ג, י; תמיד ג, ח', illus: true };
// the four chambers of Beit HaMoked, opening on its hall (Middot 1:6); the lambs' one is LAMBS_CHAMBER above
export const MOKED_CHAMBERS = {
  lambs: { x0: -177, x1: -167, z0: -67.5, z1: -59 }, bakers: { x0: -153, x1: -143, z0: -67.5, z1: -59 },
  stones: { x0: -153, x1: -143, z0: -82, z1: -73.5 }, tevila: { x0: -177, x1: -167, z0: -82, z1: -73.5 },
  floor: 16, src: 'מדות א, ו', illus: true,
};
// the ketoret workshop in the upper chamber of Beit Avtinas: where its mortars stand (illustration)
export const AVTINAS_FLOOR = 50.25;

/* ───────── Where people stand ───────── */
export const DUCHAN = { x0: -9, x1: -8, z0: -25, z1: 25, y: 14.5, src: 'מדות ב, ו' };   // the Levites' platform
export const ULAM_STEPS = { x0: -76, x1: -55, z0: -50, z1: 50, src: 'מדות ג, ו; תמיד ז, ב' };   // the priestly blessing
export const GATES = {
  korban: { x: -95, z: -71 }, nitzotz: { x: -38, z: -71 }, moked: { x: -160, z: -58 },
  delek: { x: -160, z: 71 }, bechorot: { x: -118, z: 71 }, mayim: { x: -38, z: 71 },
  nikanor: { x: 3, z: 0 }, nashimEast: { x: 144, z: 0 }, src: 'מדות א, ד–ה',
};
// the animal pens ("דיר") outside the Temple Mount: north of the platform (illustration; the agent picks flat ground)
export const PENS = { x0: 20, x1: 150, z0: -570, z1: -505, illus: true };   // ground rises gently −33 → −27 (terrainH); kept
// (Life agent) the entrance of the folds, on their south side toward the Mount; the folds and stalls are in pens.js
export const PENS_GATE = { x: 85, z: -505, src: 'נחמיה ג, א (שער הצאן)', illus: true };

/* ───────── Camera hints: position p, target t (the world may refine them) ───────── */
export const SHOTS = {
  altarTop: { p: [-6, 40, 30], t: [-38, 25, -3] },
  slaughter: { p: [-8, 30, 2], t: [-42, 18, -34] },   // over the altar's north-east corner to the rings
  kevesh: { p: [-10, 28, 50], t: [-38, 20, 25] },
  kiyor: { p: [-50, 26, 34], t: [-63.5, 21, 20] },
  ulamSteps: { p: [-44, 34, 22], t: [-78, 30, 0] },   // from the south-east, over the kevesh's foot: the Ulam steps, the doors and the vine; the altar fire stays out of frame
  heichalDoor: { p: [-70, 26, 0], t: [-95, 30, 0] },
  heichalIn: { p: [-100, 26, 0], t: [-125, 24, 0] },
  lambs: { p: [-155, 30, -45], t: [-172, 17, -62] },
  duchan: { p: [-30, 22, 30], t: [-9, 16, 0] },
  barkai: { p: [-100, 118, 20], t: [300, 60, 1500] },   // from high up, looking south-east toward Hebron
  pens: { p: [140, 12, -492], t: [82, -30, -540] },   // (Life agent: outside the north wall and portico; the ground there is at y ≈ −31)
  // wide establishing shots for the Phase B home (on a phone the panel covers the lower part of the screen)
  houseWide: { p: [-8, 52, 44], t: [-86, 44, 0] },
  altarWide: { p: [14, 54, 58], t: [-40, 20, 0] },
  slaughterWide: { p: [-6, 58, 38], t: [-40, 16, -34] },   // inside the azara (QA P1-8: the old pose sat against the east wall)
  keveshWide: { p: [14, 44, 72], t: [-38, 20, 22] },
};
