/* ── fable32 (build 6) ── day33.js — "יום במקדש": the fire-and-day loop copied from 99 Nights in the Forest (docs/MIKDASH99.md §3–4,
 * docs/FOREST33-RESEARCH.md §1–2, §8 #1–#4), in the shift's own rig (stations, walk, camera, hud, flow31's path and prompt):
 *   the fire   — אש המערכה on the altar: a fuel meter 0…100 that drains all day, NEVER out (a floor of embers — "אש תמיד תוקד על המזבח
 *                לא תכבה", ויקרא ו, ו), fed by logs carried up the ramp; six levels by the logs fed in all (the court "opens" — build 7);
 *   the wood   — לשכת העץ at the court's south: "בקעו" = 5 taps, a log pops into the basket (5 at most); one log in four is wormy —
 *                "התליעו" (מידות ב, ה): a tap-inspect says פסול, it is thrown away;
 *   the ramp   — "העלו עצים — החזיקו": the kevesh act (stations.js holdWalk), the climb; at the top the logs go onto the pyre, +10 each;
 *   the day    — 180 s of day, 60 s of night: at night the court darkens, the fuel drains slower, and once "איש הר הבית" passes — a tap on
 *                the torch (מידות א, ב); the first night cannot be failed. Days count up; the best day is kept.
 * The engine's surface is the shift engine's (index.js, flow31.js and the twin read: start/stop/tick/work/state/flowNext/pause/onEnd/
 * tapStation/debug). Every text a draft (טיוטה); never a Divine Name. ── /fable32 ── */
import { verb31, goLabel31 } from './layout31.js';
import { SHARED } from './draw.js';
import { DAYSCORE, interludeScore } from './score35.js';   // ── fable32 (build 14) ── ── /fable32 ──

export const DAY33 = Object.freeze({ idleOffer: 12, dayS: 180, nightS: 60, fuel0: 22, drainS: 240, nightDrain: 0.5, floor: 5, perLog: 10, basket: 5, worm: 0.25, taps: 5, levels: [0, 6, 17, 67, 137, 300], reach: 3.2, torchAfter: 12,
  // ── build 7 ── the court opens by the fire's level (99 Nights' fog): what each level unlocks; the washing's bonus; the strength meter
  unlock: { wood: 1, kevesh: 1, kiyor: 2, pen: 2, oil: 3, salt: 3, bake: 3, song: 3 }, lambs: 6, tamidFuel: 15, tamidMiss: 10, lostFrom: 2, lostReward: 15, washBonus: 0.25, power0: 100, powerChop: 4, powerRun: 0.8, powerLow: 30, bread: 60,
  // ── build 8 ── the economy (99 Nights: diamonds come from quests and badges, never from days; the Pelt Trader on day 2 with 3 wares): פרוטות
  taskReward: 5, merchantDay: 2, merchantP: 0.35, merchantS: 75, merchantAt: { x: -13, y: 16, z: 3 },
  // ── build 10 ── the night in בית המוקד (מידות א, ו–ח: the kohanim slept there; the hall −178…−142 × −83…−58) — a fade and he is there; the Levites' song after the dawn tamid; the fire's look by its meter
  moked: { x: -160, y: 16, z: -68, back: { x: -34, z: 50 } }, songS: 60, songFuel: 10, songReward: 5 });
// ── recovered (R6) ── the tables of builds 17–26 that the day's own modules import (ramp19, kiyor20, deshen21, maaracha22, pis23, pen25,
// heichal26, fx18, focus17), placed in the bundle's order; R7 fills the rest of day33 in around them. The names are the build reports'
// where they have one (B17, C18, POOL23, P25, BLEM25, at25, P26, POOL26), else the recovery's in their style.
// ── recovered (build 17) ── B17 (the report's: "B17.graceK"): the focused day of build 17 (focus17.js, E.b17) — the fire's start and its
// drain by day/night (drain, drainK), the logs' grades, the tamid's dawn and dusk, the first two minutes' grace (grace s, ×graceK on
// the timing act's window), the catch-up, the warning and the critical fuel, the slots of the bar (slots, maxSlots), the pen's and
// the wood's times, the levels by the logs and the day's goals
export const B17 = Object.freeze({ fuel0: 70, drain: Object.freeze([0.25, 0.4]), drainK: Object.freeze([0.7, 0.6]), perLogGrade: Object.freeze({ gold: 10, good: 8, ok: 6 }), tamid: Object.freeze({ dawn: 45, dusk: 170, fire: 60 }),
  grace: 120, graceK: 1.5, catchK: Object.freeze({ below: 60, at: 20, max: 2 }), warn: 40, crit: 25, powerShow: 50, night: false, slots: Object.freeze(['kiyor', 'wood', 'kevesh', 'song', 'pen', 'bake']), maxSlots: 5,
  penBefore: 60, rushTamid: 25, woodAt: 60, tamidLead: 50, levels: Object.freeze([0, 5, 10, 40, 90, 200]), goals: Object.freeze({ wood: 10, kevesh: 2, kiyor: 1, song: 1, bake: 1 }), power: false });
// ── recovered (build 18) ── C18 (the report's name: "C18.kiyorK"): the coins — a gold act pays 2, a good 1 (pay); a streak of 3 (streak); the
// tamid's 5; the gift (nedava: 10 coins, at 140 s, p 0.3); the chests by the gate (chests); the three pads to buy at (pads: the good axe,
// the big basket, the laver's second spigot — kiyorK: its walk ×0.6); the errand's 75
export const C18 = Object.freeze({ pay: Object.freeze({ gold: 2, good: 1, ok: 0 }), streak: 3, tamid: 5, nedava: 10, nedavaP: 0.3, nedavaAt: 140, chests: Object.freeze({ n: 13, max: 10, x: -12.7, z0: 6, dz: 1.2, hi: 60, lo: 40, hiS: 12, loS: 25, walkS: 4, reach: 3.6 }),
  pads: Object.freeze([Object.freeze({ id: 'axe', icon: '🪓', he: 'גרזן טוב', price: 80, x: -31, z: 51 }), Object.freeze({ id: 'basket10', icon: '🧺', he: 'טנא גדול', price: 120, x: -45, z: 51 }), Object.freeze({ id: 'kiyor2', icon: '🚰', he: 'דד שני לכיור', price: 40, x: -50.5, z: 16.5 })]),
  errand: 75, padR: 3, padS: 1.5, kiyorK: 0.6 });
// ── recovered (build 19) ── the ramp run (ramp19.js): the bag's two sizes, the climb's rate, the logs' flight, the goal, the sway, the salt
export const R19 = Object.freeze({ bag: Object.freeze([480, 340]), rate: 33, fly: 0.25, goal: 0.8, after: 5, v0: 3, v1: 7.5, swayMax: 0.5, saltK: 0.4, slipV: 5.5, par: 6, head: 12, hold: 0.35 });
// ── recovered (build 20) ── the laver's act (kiyor20.js): the two hands' hold (hold; the second, hold2), the water's rise, his place and
// turn at the laver (act), the spigot's two places (spig), its camera (cam)
export const K20 = Object.freeze({ hold: 3.5, hold2: 2.5, back: 0.3, up: 1.2, upMax: 7, down: 6, rise: 0.35, act: Object.freeze({ x: -60.2, z: 20, yaw: -1.12 }), spig: Object.freeze([11, 0]), cam: Object.freeze({ az: 0.45, el: 0.16, d: 7, t: Object.freeze({ x: -61, y: 19.75, z: 20.3 }) }) });
// ── recovered (build 21) ── תרומת הדשן (deshen21.js): the swipe (px) and how straight, the coal's layers; the pan's bed and his stand at it,
// the way up the ramp and down (up, head, foot, go), the walk, the pour at the heap, the wind and the spill, the score, its cameras
export const D21 = Object.freeze({ swipe: 120, straight: 0.5, layers: 4, bed: { x: -28.5, z: 5.5 }, stand: { x: -30.7, z: 5.5, yaw: Math.PI / 2 }, up: [[-34, 44.6], [-34, 11.6]], head: { x: -42, z: 11.8 }, foot: { x: -42, z: 44 },
  walk: 7, full: 0.7, desc: 3.5, turn: 0.35, wind: 20, wind1: 0.5, fix: 50, max: 45, spillA: 35, spillT: [1.5, 0.8], loss: 20, heap: { x: -28, z: 33 }, go: [[-42, 44], [-28, 44.3], [-28, 34.7]], goV: 8, pour: 1.3, end: 2, score: 150, pts: 50,
  coins: [3, 1, 0], dawn: 2.6, sw: 0.3, ms: 200, nr: 2.6, bal: Object.freeze({ wind: Object.freeze([0.12, 0.35]), shake: Object.freeze([0.5, 1.4]), fix: 2.4, spill: 0.8, gap: 1, v: 7 }),
  cam: { az: 1.25, el: 0.785, d: 9, t: { x: -29.6, y: 25.6, z: 5.6 } }, fol: { el: 0.26, d: 10, ty: 2.2 }, camC: { az: 0.75, el: 0.4, d: 20, t: { x: -34, y: 17.5, z: 38.5 } }, camP: { az: 0.2, el: 0.5, d: 11, t: { x: -28.4, y: 17, z: 33.8 } } });
// ── recovered (build 22) ── סידור המערכה (maaracha22.js): six logs to lay (need, their sizes: two large, two medium, two small), the swipe,
// the score; the bands and the gaps of a good pyre, the logs' radius and length, the fire's catch; the pyre, his stand, the sorting
// place in the wood chamber (sortAt) and the cameras
export const M22 = Object.freeze({ need: 6, sizes: 'LLMMSS', budget: [9, 5], next: [[0.3, 0.7], [0.1, 0.5]], swipe: 60, pts: 15, mis: 20, score: 100, fast: 25, airB: 25, good: 85, thr: [60, 70], sw: 0.3,
  band: Object.freeze([Object.freeze([0.25, 0.45]), Object.freeze([0.3, 0.4])]), gv: 1.2, l0: -0.6, r: { L: 0.3, M: 0.21, S: 0.11 }, len: { L: 4, M: 3, S: 1.7 }, span: 1.2, gap: [0.06, 0.36, 0.9], ember: 8, fire: [64, 0.22], ign: 1.8, end: 2.6,
  sorted: 0.9, pyre: { x: -30, z: -3.5 }, stand: { x: -28.6, z: 1.6, yaw: -2.85 }, sortAt: { x: -42.2, z: 57.8, yaw: Math.PI / 2 }, camS: { t: [-38.6, 17.2, 58], p: [-36.6, 18.3, 53.2] },
  camB: { az: -0.3, el: 1.05, d: 8.6, t: { x: -30, y: 25.9, z: -3.3 } }, camP: { az: 0.55, el: 0.3, d: 14, t: { x: -30, y: 30, z: -3.5 } } });
// ── recovered (build 23) ── the lot (pis23.js; יומא ב, א–ד): the roles open by the day (open), the second lot from day 4 (two), the pick; the
// circle of kohanim (c, r, seats) and the ממונה's call, the counting (n1, n2), the show; and the short forms of the morning's tasks
// when the lot gives them (need/sizes/layn/budget for the pyre, d21 for the ashes); its cameras
export const P23 = Object.freeze({ open: Object.freeze(['deshen', 'm22', 'lamb']), two: 4, pick: 3, yest: 0.25, bal: 0.5, in: 0.6, call: 0.4, step: 0.2, n1: 8, n2: 6, show: 1.2, show2: 0.6,
  fin: Object.freeze({ dy: 0.3, ms: 200, x: 0.51, auto: 6 }), c: Object.freeze({ x: -51, z: 23.4 }), r: 3.2, seats: 8, run: 10.5, fire: 86, need: 4, sizes: 'LLMS', layn: Object.freeze([2, 1, 1]),
  budget: Object.freeze([7, 4.5]), bad: Object.freeze([3, 2]), sorted: 0.6, d21: Object.freeze({ full: 0.5, walk: 10, goV: 11, pour: 1 }), up: 0.6, upMax: 9, dT: Object.freeze([2, 8]),
  cam: Object.freeze({ az: 1.45, el: 0.88, d: 12, t: Object.freeze({ x: -51, y: 17.6, z: 23.4 }) }), fol: Object.freeze({ el: 0.36, d: 12, ty: 2.4 }) });
// ── recovered (build 23) ── POOL23 (the report's: "the POOL23 registry"): the morning's roles in the first lot — built: played by him
export const POOL23 = Object.freeze([['deshen', 'תרומת הדשן', '🔥', 1], ['m22', 'סידור המערכה', '🪵', 1], ['lamb', 'בדיקת הטלה', '🐑', 1], ['chavitin', 'החביתין', '🍞'], ['ketoret', 'הקטורת', '💨'], ['shir', 'השיר', '🎶']].map(([id, he, icon, built]) => Object.freeze({ id, he, icon, built: !!built })));
// ── recovered (build 23) ── the roles book's rows (pis23.js's rolesBook23): each role of a pool with his record in save.roles23 — open
// once he has played it, how often, his best and last (the name is the recovery's)
export const bookOf23 = (save, pool = POOL23) => { const rec = (save && save.roles23) || {}; return pool.map((r) => { const m = rec[r.id] || {}; return { id: r.id, he: r.he, icon: r.icon, built: r.built, open: (m.n | 0) > 0, n: m.n | 0, best: m.best | 0, last: m.last | 0 }; }); };
// ── recovered (build 25) ── P25 (the report's: "P25.stand"): the lamb pen (pen25.js) — the pen's door and his stand at it, the side, the
// rings; the act's times (in, bring, aside, zoom, blem, clean, ok, lead, end), a false approval's delay (fals) and rejections (rej), the
// dawn, the score; the cameras (cam, zd, camP)
export const P25 = Object.freeze({ door: { x: -17.6, z: -47.4, yaw: -Math.PI / 2, s: 0.8 }, stand: { x: -18.6, z: -44.2 }, side: { x: -13.2, z: -47.6 }, rings: { x: -36, z: -41 }, in: 0.5, bring: 0.9, aside: 0.9,
  zoom: 0.4, blem: 1.6, clean: 0.45, ok: 0.9, lead: 2.2, end: 0.6, fals: 3.2, rej: 2, pB: 0.5, dirt: 2, dawn: 26, tT: [8, 24], sw: 0.25, score: 120, fa: 40, wr: 20, fast: 20, hy: 0.9,
  cam: { az: 1.876, el: 0.36, d: 2.9, ty: 1 }, zd: 2.2, camP: { az: 0.2, el: 0.3, d: 6.5, ty: 1.2 } });
const list25 = (ids, he) => Object.freeze(ids.split(' ').map((id, i) => Object.freeze({ id, he: he.split('|')[i] })));
// ── recovered (build 25) ── BLEM25 (the report's: "6 kinds × 8 places — המחשה"): the blemishes' kinds, the places on the lamb, the dirt
export const BLEM25 = Object.freeze({ cats: list25('wart crack cloud wound tear swell', 'יבלת / בליטה|סדק / חריץ|כתם / עכירות אישון|פצע / חתך|קרע / חסר בבשר|נפיחות / עיוות'),
  regs: list25('earR earL eyeR eyeL hoofF hoofB back belly', 'אוזן ימין|אוזן שמאל|עין ימין|עין שמאל|טלף קדמית|טלף אחורית|גב|בטן'), dirt: Object.freeze(['straw', 'mud']) });
// (the eight places on the lamb's rig: x, y, z and the normal; the last 1 = on the head, which turns about HEAD25)
const REGION25 = [[-0.34, 1.67, 1, -0.52, 0.85, 0, 1], [0.34, 1.67, 1, 0.52, 0.85, 0, 1], [-0.185, 1.665, 1.23, -0.6, 0.1, 0.8, 1], [0.185, 1.665, 1.23, 0.6, 0.1, 0.8, 1],
  [0.27, 0.12, 0.42, 1, 0, 0, 0], [0.27, 0.12, -0.52, 1, 0, 0, 0], [0.14, 1.8, -0.2, 0.24, 0.97, 0, 0], [0.36, 0.78, 0, 0.7, -0.7, 0, 0]];
const HEAD25 = [0, 1.36, 0.62];
/** ── recovered (build 25) ── at25 (the report's name): a place on the lamb (BLEM25.regs index) in the world — the lamb at L {x, y, z, yaw, s},
 *  its head turned by yaw and pitch → { x, y, z, nx, ny, nz } */
export function at25(reg, L, yaw = 0, pitch = 0) {
  const row = REGION25[reg] || REGION25[6];
  let [x, y, z, nx, ny, nz] = row;
  if (row[6]) {
    const c = Math.cos(pitch), s = Math.sin(pitch), dy = y - HEAD25[1], dz = z - HEAD25[2];
    y = HEAD25[1] + c * dy - s * dz; z = HEAD25[2] + s * dy + c * dz;
    const ny0 = ny; ny = c * ny0 - s * nz; nz = s * ny0 + c * nz;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), dx = x - HEAD25[0], dz2 = z - HEAD25[2];
    x = HEAD25[0] + cy * dx + sy * dz2; z = HEAD25[2] - sy * dx + cy * dz2;
    const nx0 = nx; nx = cy * nx0 + sy * nz; nz = -sy * nx0 + cy * nz;
  }
  const u = Math.cos(L.yaw), h = Math.sin(L.yaw), k = L.s || 1;
  return { x: L.x + k * (u * x + h * z), y: (L.y || 16) + k * y, z: L.z + k * (-h * x + u * z), nx: u * nx + h * nz, ny, nz: -h * nx + u * nz };
}
// ── recovered (build 26) ── P26 (the report's: "P26.open (the schedule)", "P26.reach (3.2)", P26.gate, P26.foot): the second lot's inner
// roles in the Heichal (heichal26.js) — the schedule of his role by the day (open), the Heichal's gate and its reach, the inner altar and
// the menorah, the act's steps and pulls, the pour, the lamps (lx, ly, lz), the lot's walk-in (lotIn), the ramp's foot (foot), the times
export const P26 = Object.freeze({ open: Object.freeze(['menorah', 'inner', 'menorah']), gate: Object.freeze({ x: -89.3, z: 0 }), reach: 3.2, alt: Object.freeze({ x: -119.7, z: 0.4 }), walkM: Object.freeze({ x: -121.1, z: 5.9 }),
  men: Object.freeze({ x: -122.8, z: 7.2, y: 0.6 }), in: 0.4, step: 0.45, set: 0.5, sw: 0.25, ms: 200, key: 0.8, back: 0.5, opn: 1.1, pulls: 7, hand: 0.15, dy: 0.2, vmax: 2.4, scr: 5, wick: 0.25,
  pour: Object.freeze({ r0: 1.5, r1: 0.34, knee: 0.7, lo: 0.9, hi: 1, max: 1.16 }), spill: 0.5, lit: 0.3, leave: 0.7, kuz: 0.5, ev: 0.2, lotIn: 0.35, foot: Object.freeze({ x: -42, z: 45 }),
  lx: Object.freeze([-126.01, -125.61, -125.21, -125.19, -124.79, -124.39, -123.99]), ly: 25, lz: 7.5, tT: Object.freeze({ inner: Object.freeze([4, 12]), menorah: Object.freeze([13, 39]) }), score: 120, fast: 20 });
// ── recovered (build 26) ── POOL26 (the report's): the second lot's thirteen roles (יומא ב, ג) — built: the inner altar's and the
// menorah's ashes; the rest "כהנים אחרים — בקרוב"
export const POOL26 = Object.freeze([['shochet', 'השחיטה', '🔪'], ['zorek', 'זריקת הדם', '🏺'], ['inner', 'דישון מזבח הפנימי', '🥣', 1], ['menorah', 'דישון המנורה', '🪔', 1], ['rosh', 'הראש והרגל', '🧺'], ['yadaim', 'שתי הידיים', '🧺'], ['oketz', 'העוקץ והרגל', '🧺'], ['chaze', 'החזה והגרה', '🧺'], ['dfanot', 'שתי הדפנות', '🧺'], ['kerev', 'הקרביים', '🧺'], ['solet', 'הסולת', '🌾'], ['chavt', 'החביתין', '🍞'], ['yayin', 'היין', '🍇']].map(([id, he, icon, built]) => Object.freeze({ id, he, icon, built: !!built, lot: 2 })));
// ── recovered (build 19) ── on the ramp (its rectangle: x −46…−30, z 10.5…42.5) and the ramp's height at z (16 at the foot → 25 at the top)
export const onRamp19 = (x, z) => x > -46 && x < -30 && z > 10.5 && z < 42.5;
export const rampY19 = (z) => 16 + 9 * Math.min(1, Math.max(0, (42.5 - z) / 32));
/** the ממונה's tasks — three a day, by the day's number; each pays 5 פרוטות (שקלים ה, א: the fifteen officers) */
export const TASKS33 = Object.freeze([
  { id: 'chop6', text: '🪵 בקעו 6 גזרים', key: 'chops', goal: 6 }, { id: 'carry10', text: '🔥 העלו 10 גזרים', key: 'carried', goal: 10 }, { id: 'chop12', text: '🪵 בקעו 12 גזרים', key: 'chops', goal: 12 },
  { id: 'wash', text: '💧 קדשו ידיים ורגליים', key: 'washes', goal: 1 }, { id: 'jars2', text: '🏺 פתחו 2 כדים', key: 'jars', goal: 2 }, { id: 'bake1', text: '🍞 אפו לחם', key: 'baked', goal: 1 }, { id: 'carry20', text: '🔥 העלו 20 גזרים', key: 'carried', goal: 20 },
]);   // (day 1: the wood alone; day 2: the laver and the stores — what the fire's level opens by then)
/** the shop (MIKDASH99 §5) — what פרוטות buy, kept in save.day33 */
export const SHOP33 = Object.freeze([
  { id: 'axe', icon: '🪓', label: 'גרזן טוב', sub: 'גזר ב־3 הקשות במקום 5', price: 25 }, { id: 'basket10', icon: '🧺', label: 'טנא גדול', sub: '10 גזרים בסל', price: 30 }, { id: 'basket20', icon: '🧺', label: 'טנא ענק', sub: '20 גזרים בסל', price: 90, needs: 'basket10' },
  { id: 'bowl', icon: '🥣', label: 'קערת לישה', sub: 'לחם שמשיב 90 כוח', price: 35 }, { id: 'rug', icon: '🧶', label: 'שטיח לפינה', sub: 'בבית המוקד, ללילה', price: 20 }, { id: 'lamp', icon: '🪔', label: 'מנורת שמן לפינה', sub: 'בבית המוקד, ללילה', price: 20 },   /* (build 11: the אבנט's colours are fixed by the halacha — no dye; the cosmetics are the night corner's) */
]);
/** ── build 11 ── ספר הזכרונות (99 Nights' badge board, claimed at the board): earned by play, claimed at night in בית המוקד for פרוטות */
export const BADGES33 = Object.freeze([
  { id: 'log1', text: '🪵 הגזר הראשון', pay: 2, test: (s) => s.chops - s.worms >= 1 }, { id: 'log25', text: '🪵 25 גזרים כשרים', pay: 5, test: (s) => s.chops - s.worms >= 25 }, { id: 'log100', text: '🪵 100 גזרים', pay: 15, test: (s) => s.chops - s.worms >= 100 },
  { id: 'lvl2', text: '🔥 המערכה ברמה 2', pay: 3, test: (s) => s.level >= 2 }, { id: 'lvl4', text: '🔥 המערכה ברמה 4', pay: 10, test: (s) => s.level >= 4 }, { id: 'lvl6', text: '🔥 המערכה שלמה — רמה 6', pay: 15, test: (s) => s.level >= 6 },
  { id: 'bread1', text: '🍞 הלחם הראשון', pay: 3, test: (s) => s.baked >= 1 }, { id: 'lambs6', text: '🐑 שישה טלאים מבוקרים', pay: 8, test: (s) => s.lambs.every((q) => q.ok) }, { id: 'lost1', text: '🐑 טלה אבוד הושב', pay: 5, test: (s) => s.lostBack >= 1 },
  { id: 'song3', text: '🎶 שלושה שירים בקצב', pay: 8, test: (s) => s.songs >= 3 }, { id: 'day3', text: '🌙 שלושה ימים בעזרה', pay: 5, test: (s) => s.day >= 3 }, { id: 'day7', text: '🌙 שבוע בעזרה', pay: 10, test: (s) => s.day >= 7 }, { id: 'day33', text: '🌅 33 ימי שירות', pay: 15, test: (s) => s.day >= 33 },
  { id: 'watch5', text: '🔥 חמישה משמרות ערים', pay: 5, test: (s) => s.watches >= 5 }, { id: 'trade1', text: '🧺 סחר עם הסוחר', pay: 3, test: (s) => s.trades >= 1 },
]);
export const tasksForDay = (day) => { const out = []; for (let i = 0; i < 3; i++) out.push(TASKS33[((Math.max(1, day) - 1) * 3 + i) % TASKS33.length]); return out; };
const GAME_HE = { tiles: 'זיכרון המקדש', pen: 'הוצאת הטלה מהדיר', m3: 'משחק האוצר' }, GAME_ICON = { tiles: '🃏', pen: '🐑', m3: '💎' }, GAME_SUB = { tiles: 'קלפים מתהפכים', pen: 'פאזל הזזה', m3: 'שלושה בשורה' };   // ── fable32 (build 14) ── ── /fable32 ──
const say = (fn, ...a) => { try { return fn && fn(...a); } catch (e) { console.warn('[day33]', e && e.message); return undefined; } };
const pos3 = (p) => (p && Number.isFinite(p.x) ? { x: p.x, y: Number.isFinite(p.y) ? p.y : 16, z: p.z } : null);
export const levelOf33 = (fed) => { let l = 1; for (let i = 1; i < DAY33.levels.length; i++) if (fed >= DAY33.levels[i]) l = i + 1; return Math.min(6, l); };

export function createDay33(o = {}) {
  const S = o.world || null, T = o.twin || null, hud = o.hud || null, ST = o.stations || null, CAM = o.camera || null, view = o.view || null;
  const STN = (ST && ST.STATIONS) || o.STATIONS || {};
  const save = o.save || {}; const rng = o.rng || Math.random;
  const sfx = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* */ } };
  const st = { phase: 'opening', t: 0, day: 1, night: false, left: DAY33.dayS, fuel: DAY33.fuel0, fed: 0, level: 1, logs: 0, watched: true, torchAt: 0, torchOn: false, paused: false, best: +save.bestDay || 0, chops: 0, worms: 0, carried: 0, lastMsg: '', washed: false, power: DAY33.power0, oil: 0, flour: 0, salt: 0, bread: 0, baked: 0, opened: {}, px: NaN, pz: NaN, perutot: +save.perutot || 0, dayStats: {}, tasks: [], merchant: null, merchantSeen: 0, basketMax: DAY33.basket, axeTaps: DAY33.taps, breadPower: DAY33.bread, lambs: Array.from({ length: 6 }, (_, i) => ({ i, ok: false })), lost: null, lostDay: 0, tamids: 0, song: null, songs: 0, inMoked: false, lostBack: 0, watches: 0, trades: 0, badges: {}, claimed: {}, ended33: false };
  { const cl = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {}; for (const k in cl) st.claimed[k] = 1; }
  { const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : {}; if (own.axe) st.axeTaps = 3; if (own.basket20) st.basketMax = 20; else if (own.basket10) st.basketMax = 10; if (own.bowl) st.breadPower = 90; }
  let acting = null, ended = false, raf = 0, lastMs = 0, goal = null, hintNow = null, fuelPin = null, L0 = null;
  const log = []; L0 = (...a) => { log.push([Math.round(st.t * 10) / 10, ...a]); if (log.length > 120) log.shift(); };
  const ends = []; const hp = { x: 0, y: 16, z: 0 };
  const heroP = () => { try { if (o.heroPos) return o.heroPos(); if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ } return hp; };
  const drive = (vx, vz) => { try { S && S.hero && S.hero.drive(vx, vz); } catch (e) { /* */ } };
  const standOf = (id) => { const s = STN[id]; return s ? { x: s.stand.x, y: (s.at && s.at.y) || 16, z: s.stand.z } : null; };
  const project = (p) => { if (!p || !view || !view.project) return null; try { const q = view.project(p.x, p.y, p.z); return q && q.on !== false ? { x: q.x, y: q.y } : null; } catch (e) { return null; } };
  const stamp = (t, kind = 'info') => { if (t === st.lastMsg) return; st.lastMsg = t; say(() => hud && hud.stamp(t, { kind })); };

  /* ───────── build 10: the fade and the move (the night in בית המוקד) ───────── */
  let fadeEl = null;
  function fade(then, text) {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc) { then && then(); return; }
    if (!fadeEl) { fadeEl = doc.createElement('div'); fadeEl.className = 'd33-fade'; fadeEl.style.cssText = 'position:fixed;inset:0;z-index:40;background:#07050A;opacity:0;transition:opacity .55s;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#FFF4DC;font:900 22px/1.3 "Heebo",system-ui,sans-serif;direction:rtl;text-align:center;padding:0 24px'; doc.body.appendChild(fadeEl); }
    fadeEl.textContent = text || ''; fadeEl.style.pointerEvents = 'auto'; fadeEl.style.opacity = '1';
    setTimeout(() => { try { then && then(); } catch (e) { /* */ } setTimeout(() => { if (fadeEl) { fadeEl.style.opacity = '0'; fadeEl.style.pointerEvents = 'none'; } }, 900); }, 600);
  }
  const moveHero = (x, z, yaw) => { try { S && S.hero && S.hero.setPos && S.hero.setPos(x, z, yaw); } catch (e) { /* */ } st.px = x; st.pz = z; };
  /* ───────── the court opens by level (build 7) ───────── */
  const open33 = (id) => (DAY33.unlock[id] || 99) <= st.level;
  const shown33 = () => Object.keys(DAY33.unlock).filter(open33);
  function unlockStep() {
    for (const id of shown33()) if (!st.opened[id]) { st.opened[id] = 1; if (st.level > 1 && STN[id]) { setTimeout(() => stamp(`נפתח: ${STN[id].he}`, 'combo'), 1500); L0('open', id); } }
  }
  const tired = () => st.power < DAY33.powerLow;
  /** can he use the station now? (a full basket at the wood, an empty one at the ramp, a washed morning, a bowl without its three — the prompt does not show) */
  const usable = (id) => (id === 'song' ? !!st.song : id === 'pen' ? st.lambs.some((q) => !q.ok) : id === 'wood' ? st.logs < st.basketMax : id === 'kevesh' ? st.logs > 0 && !atTop(heroP()) : id === 'kiyor' ? !st.washed : id === 'bake' ? st.oil > 0 && st.flour > 0 && st.salt > 0 : true);
  /* ───────── the economy (build 8) ───────── */
  const stat = (k, n = 1) => { st.dayStats[k] = (st.dayStats[k] | 0) + n; taskStep(); };
  function pay(n, why) { st.perutot += n; save.perutot = st.perutot; say(() => o.persist && o.persist()); L0('pay', n, why); }
  // ── fable32 (build 14) ── the one score (score35.js: Phase A's master score — the capsule reads the same in both phases); the gear he carries (flow31 draws it);
  // the flights (a log into the basket, the logs onto the pyre); the idle offer (nothing to do 12 s → "משחק קצר?")
  const SC = o.score || null;
  const score = (n, why) => { if (!SC || !(n > 0)) return; try { SC.add(n, why); } catch (e) { /* */ } L0('score', n, why); };
  const scoreAct = (id, r) => { if (!SC) return; try { const g = r && r.gold ? 'gold' : r && r.quality >= 0.8 ? 'good' : 'ok'; const n = SC.grade(g); SC.add(n, 'act:' + id); L0('score', n, g); } catch (e) { /* */ } };
  st.fx = []; const fx = (kind, from, to, n = 1) => { st.fx.push({ kind, from: { ...from }, to: to ? { ...to } : null, n, t: 0, dur: kind === 'unload' ? 0.9 : 0.6 }); if (st.fx.length > 8) st.fx.shift(); };
  const fxStep = (dt) => { for (const f of st.fx) f.t += dt; st.fx = st.fx.filter((f) => f.t < f.dur); };
  // ── /fable32 ──
  function newTasks() { st.dayStats = {}; st.tasks = tasksForDay(st.day).map((q) => ({ ...q, done: false })); }
  function taskStep() { for (const q of st.tasks) if (!q.done && (st.dayStats[q.key] | 0) >= q.goal) { q.done = true; pay(DAY33.taskReward, q.id); score(DAYSCORE.task, 'task'); stamp(`משימת הממונה: ${q.text.replace(/^\S+\s/, '')} ✓ +${DAY33.taskReward} פרוטות`, 'combo'); sfx('coin'); L0('task', q.id); } }
  let merchantPin = null;
  function merchantStep() {
    if (st.night) { if (st.merchant) { st.merchant = null; stamp('הסוחר הלך לישון', 'info'); } }
    if (st.merchant && !merchantPin && hud && hud.pin) merchantPin = say(() => hud.pin('merchant33', { icon: '🧺', label: 'הסוחר' })) || null;
    if (!st.merchant && merchantPin) { say(() => merchantPin.close()); merchantPin = null; }
    if (merchantPin) { const m = DAY33.merchantAt; say(() => merchantPin.at(project({ x: m.x, y: m.y + 5, z: m.z }), st.bread > 0)); }
    if (st.night) return;
    if (!st.merchant && st.merchantSeen < st.day && (st.day === DAY33.merchantDay || (st.day > DAY33.merchantDay && st.merchantRoll))) {
      st.merchantSeen = st.day; st.merchant = { until: st.t + DAY33.merchantS, want: 'bread' };
      stamp('סוחר בשער! מבקש כיכר לחם — ונותן לבחור אחת משלוש', 'combo'); sfx('chime'); L0('merchant');
    }
    if (st.merchant && st.t >= st.merchant.until) { st.merchant = null; stamp('הסוחר המשיך בדרכו', 'info'); L0('merchant-gone'); }
    SHARED.merchant33 = st.merchant ? { ...DAY33.merchantAt, want: st.merchant.want } : null;
  }
  function trade() {
    if (!st.merchant || !hud || !hud.choice) return false;
    if (st.bread <= 0) { stamp('הסוחר מבקש כיכר לחם — אין לכם', 'no'); sfx('miss'); return false; }
    const wares = [
      { icon: '🧺', label: 'טנא גדול', sub: '10 גזרים בסל', go: () => { st.bread--; st.basketMax = Math.max(st.basketMax, 10); stamp('טנא גדול — 10 בסל', 'combo'); } },
      { icon: '🪓', label: 'גרזן טוב', sub: 'גזר ב־3 הקשות', go: () => { st.bread--; st.axeTaps = Math.min(st.axeTaps, 3); stamp('גרזן טוב — 3 הקשות לגזר', 'combo'); } },
      { icon: '🪙', label: '12 פרוטות', sub: 'לחנות', go: () => { st.bread--; pay(12, 'merchant'); stamp('+12 פרוטות', 'combo'); } },
    ];
    st.paused = true; sfx('ui');
    say(() => hud.choice({ title: 'הסוחר בשער', text: 'הוא לוקח כיכר אחת ונותן אחת משלוש (כמו סוחר הפרוות — ⚑ המחשה)', items: wares.map((w) => ({ ...w, go: () => { w.go(); st.merchant = null; st.trades++; sfx('coin'); L0('trade', w.label); return true; } })), closeLabel: 'לא עכשיו', onClose: () => { st.paused = false; } }));
    return true;
  }
  /* ───────── the lambs (build 9): six in the pen, inspected on the beat (ערכין ב, ה); a tamid at dawn and dusk takes one; a lost lamb from level 2 ───────── */
  const okLambs = () => st.lambs.filter((l) => l.ok).length;
  function tamid(when) {
    const l = st.lambs.find((q) => q.ok);
    if (l) { l.ok = false; st.tamids++; st.fuel = Math.min(100, st.fuel + DAY33.tamidFuel); stamp(`תמיד של ${when} — טלה מבוקר למזבח (+${DAY33.tamidFuel} אש)`, 'combo'); sfx('fanfare'); L0('tamid', when); }
    else if (open33('pen')) { st.fuel = Math.max(DAY33.floor, st.fuel - DAY33.tamidMiss); stamp(`תמיד של ${when} — אין טלה מבוקר! (−${DAY33.tamidMiss} אש)`, 'no'); sfx('miss'); L0('tamid-miss', when); }
  }
  function lostStep(dt) {
    if (!st.lost) { if (open33('pen') && st.lostDay < st.day && !st.night && st.left < DAY33.dayS - 25 && rng() < 0.02 * dt * 10) { st.lostDay = st.day; const a = rng() * Math.PI * 2, r = 22 + rng() * 10; st.lost = { x: -38 + Math.cos(a) * r, z: 20 + Math.sin(a) * r, yaw: rng() * 6.28, t: 0, follow: false }; stamp('🐑 טלה ברח מהדיר! הביאו אותו חזרה', 'no'); sfx('tick'); L0('lost'); } return; }
    const Lm = st.lost; Lm.t += dt;
    if (Lm.follow) { const h = heroP(), dx = h.x - Lm.x, dz = h.z - Lm.z, d = Math.hypot(dx, dz); if (d > 2.2) { const sp = Math.min(14, d * 2.5); Lm.x += dx / d * sp * dt; Lm.z += dz / d * sp * dt; Lm.yaw = Math.atan2(dx, dz); Lm.walk = true; } else Lm.walk = false;
      const P = STN.pen.at; if (Math.hypot(P.x - Lm.x, P.z - Lm.z) < 5) { st.lost = null; const free = st.lambs.find((q) => !q.ok); if (free) free.ok = true; st.lostBack++; score(DAYSCORE.lostLamb, 'lamb'); pay(DAY33.lostReward, 'lamb'); stamp(`הטלה הושב לדיר — מבוקר! +${DAY33.lostReward} פרוטות`, 'combo'); sfx('fanfare'); L0('lost-back'); } }
    else { Lm.yaw += (rng() - 0.5) * dt * 2; const sp = 1.6; Lm.x += Math.sin(Lm.yaw) * sp * dt; Lm.z += Math.cos(Lm.yaw) * sp * dt; Lm.walk = true; if (Lm.x < -52 || Lm.x > -14) Lm.yaw += Math.PI; if (Lm.z < -18 || Lm.z > 48) Lm.yaw += Math.PI; }
    SHARED.lost33 = Lm;
  }
  /* ───────── build 11: the badges (earned by play; claimed at night in the Moked) and the 33rd day ───────── */
  function badgeStep() { for (const b of BADGES33) if (!st.badges[b.id] && b.test(st)) { st.badges[b.id] = 1; score(DAYSCORE.badge, 'badge'); stamp(`ספר הזכרונות: ${b.text} — לקבל בלילה בבית המוקד`, 'combo'); sfx('chime'); L0('badge', b.id); } }
  const unclaimed = () => BADGES33.filter((b) => st.badges[b.id] && !st.claimed[b.id]);
  function claimBook() {
    const list = unclaimed(); if (!hud || !hud.choice) return false;
    if (!list.length) { stamp('ספר הזכרונות — אין מה לקבל עכשיו', 'info'); return false; }
    st.paused = true; sfx('ui');
    say(() => hud.choice({ title: 'ספר הזכרונות', text: 'מה שעשיתם בעזרה נרשם; קבלו את הפרוטות (המחשה: לוח המתגים)', items: list.map((b) => ({ icon: '📜', label: b.text, sub: `+${b.pay} פרוטות`, go: () => { st.claimed[b.id] = 1; save.badges33 = { ...(save.badges33 || {}), [b.id]: 1 }; pay(b.pay, 'badge:' + b.id); stamp(`${b.text} — +${b.pay} פרוטות`, 'combo'); sfx('coin'); L0('claim', b.id); return unclaimed().length === 0; } })), closeLabel: 'די', onClose: () => { st.paused = false; } }));
    return true;
  }
  /* ───────── the fire ───────── */
  function feed(n) {
    if (n <= 0) return;
    const before = st.level, per = DAY33.perLog * (st.washed ? 1 + DAY33.washBonus : 1); st.fuel = Math.min(100, st.fuel + per * n); st.fed += n; st.level = levelOf33(st.fed);
    SHARED.flare33 = performance.now(); sfx('chime'); L0('feed', n, Math.round(st.fuel));
    stamp(`+${Math.round(n * per)} אש — ${n} גזרים על המערכה${st.washed ? ' (ידיים מקודשות: +25%)' : ''}`, 'combo');
    if (st.level > before) { sfx('fanfare'); setTimeout(() => stamp(`המערכה ברמה ${st.level} — העזרה נפתחת`, 'combo'), 900); L0('level', st.level); }
  }
  function drainStep(dt) {
    const k = st.night ? DAY33.nightDrain : 1; st.fuel = Math.max(DAY33.floor, st.fuel - dt * 100 / DAY33.drainS * k);
    if (st.fuel <= DAY33.floor + 0.01 && !st.embers) { st.embers = true; stamp('נשארה גחלת — הביאו עצים!', 'no'); sfx('miss'); L0('embers'); }
    if (st.fuel > 20 && st.embers) st.embers = false;
  }

  /* ───────── the day and the night ───────── */
  function setSky(night) {
    try { const W = globalThis.__T; if (W && typeof W.setTime === 'function') W.setTime(night ? 'dusk' : 'noon');   /* (build 12: the owner — 'בלילה לא רואים כלום'; dusk, not the dark night) */ } catch (e) { /* */ }
  }
  function dayStep(dt) {
    st.left = Math.max(0, st.left - dt);
    if (!st.night && st.left <= 0) { tamid('בין הערביים'); st.night = true; st.left = DAY33.nightS; st.watched = false; st.torchOn = false; st.torchAt = st.t + DAY33.torchAfter + rng() * 20; setSky(true); st.song = null; sfx('tick'); L0('night', st.day);
      if (o.walk && o.walk.stop) say(() => o.walk.stop()); goal = null;
      fade(() => { moveHero(DAY33.moked.x, DAY33.moked.z, Math.PI / 2); st.inMoked = true; stamp('לילה בבית המוקד — האש של העזרה דועכת לאט; כשאיש הר הבית עובר, הקישו על הלפיד', 'info'); }, 'השמש שקעה — לבית המוקד (מידות א, ו–ח)'); }
    else if (st.night && st.left <= 0) {
      st.night = false; st.day++; st.left = DAY33.dayS; setSky(false); score(DAYSCORE.day, 'day');
      fade(() => { moveHero(DAY33.moked.back.x, DAY33.moked.back.z, Math.PI); st.inMoked = false; const had = okLambs() > 0; tamid('שחר'); if (had && open33('song')) { st.song = { until: st.t + DAY33.songS }; stamp('תמיד של שחר — הלויים על הדוכן: לכו לשיר (60 שניות)', 'combo'); L0('song-open'); } }, `יום ${st.day} — "ראו טלה מלשכת הטלאים" (תמיד ג, ג)`);
      st.washed = false; st.power = Math.min(DAY33.power0, st.power + 30); newTasks(); st.merchantRoll = rng() < DAY33.merchantP;
      if (st.day > st.best) { st.best = st.day; save.bestDay = st.best; say(() => o.persist && o.persist()); }
      stamp(`יום ${st.day} בעזרה`, 'combo'); sfx('chime'); L0('day', st.day);
    }
    if (st.night && !st.torchOn && !st.watched && st.t >= st.torchAt) { st.torchOn = true; stamp('איש הר הבית עובר — הקישו על הלפיד!', 'info'); sfx('tick'); L0('torch'); }
    if (st.night && st.torchOn && !st.watched && st.t >= st.torchAt + 10) { st.torchOn = false; st.watched = true; if (st.day > 1) { st.fuel = Math.max(DAY33.floor, st.fuel - 10); stamp('נרדמתם במשמר — "חובטו במקלו" (−10 אש)', 'no'); sfx('miss'); } else stamp('לילה ראשון — הפעם בלי עונש', 'info'); L0('torch-miss'); }
  }

  /* ───────── the walks (the shift's walk module) ───────── */
  function walkTo(p, then, r = 1.8, face) {
    if (!p) return false;
    if (o.walk && o.walk.to) { goal = { p, r, then, ext: true }; say(() => o.walk.to(p.x, p.z, r, face).then((ok) => { if (goal && goal.p === p) { goal = null; if (ok && then) then(); } })); return true; }
    goal = { p, r, then }; return true;
  }
  function walkStep(dt) {
    if (!goal || goal.ext) return;
    const h = heroP(), d = Math.hypot(goal.p.x - h.x, goal.p.z - h.z);
    if (d <= goal.r) { drive(0, 0); const f = goal.then; goal = null; if (f) f(); return; }
    const v = Math.min(o.speed || 16, Math.max(5, d * 3)); drive((goal.p.x - h.x) / d * v, (goal.p.z - h.z) / d * v);
  }

  /* ───────── the acts ───────── */
  function nx33() {
    if (st.night && st.torchOn && !st.watched) return { id: 'torch', kind: 'torch' };
    if (st.logs >= st.basketMax) return { id: 'kevesh', kind: 'station' };
    if (st.logs > 0 && st.fuel <= DAY33.floor + 0.01) return { id: 'kevesh', kind: 'station' };   // (embers: whatever he carries, up now)
    if (st.lost) return { id: 'lamb', kind: 'lamb' };
    if (st.song && open33('song')) return { id: 'song', kind: 'station' };   // (build 10: the dawn's song window)
    if (open33('kiyor') && !st.washed && !st.night) return { id: 'kiyor', kind: 'station' };   // (the morning: hands and feet first — the day's +25%)
    if (open33('pen') && okLambs() === 0 && st.lambs.some((q) => !q.ok) && st.left < 70) return { id: 'pen', kind: 'station' };   // (the tamid is near and no lamb is ready)
    if (tired() && st.bread <= 0 && open33('bake')) { if (st.oil > 0 && st.flour > 0 && st.salt > 0) return { id: 'bake', kind: 'station' }; if (st.oil <= 0 || st.flour <= 0) return { id: 'oil', kind: 'station' }; return { id: 'salt', kind: 'station' }; }
    return { id: 'wood', kind: 'station' };
  }
  async function runAt(id) {
    if (acting || st.phase !== 'run' || !ST || !ST.act) return false;
    const h = heroP(), p = standOf(id); if (!p) return false;
    if (Math.hypot(p.x - h.x, p.z - h.z) > DAY33.reach + 0.3) return tapStation(id);
    if (!open33(id)) { stamp(`${STN[id].he} — נפתח ברמה ${DAY33.unlock[id] || '?'} של האש`, 'no'); sfx('miss'); return false; }
    if (id === 'wood' && st.logs >= st.basketMax) { stamp('הסל מלא — לכבש!', 'no'); sfx('miss'); return false; }
    if (id === 'kevesh' && st.logs <= 0) { stamp('אין עצים בסל — ללשכת העץ', 'no'); sfx('miss'); return false; }
    if (id === 'kiyor' && st.washed) { stamp('כבר קידשתם היום — פעם אחת ביום', 'no'); sfx('miss'); return false; }
    if (id === 'song' && !st.song) { stamp('הלויים שרים אחרי תמיד של שחר', 'no'); sfx('miss'); return false; }
    if (id === 'bake' && !(st.oil > 0 && st.flour > 0 && st.salt > 0)) { stamp(`ללחם צריך סולת, שמן ומלח — יש ${st.flour}/${st.oil}/${st.salt}`, 'no'); sfx('miss'); return false; }
    if (id === 'wood') { try { STN.wood.n = st.axeTaps + (tired() ? 3 : 0); } catch (e) { /* */ } }
    acting = { id }; drive(0, 0); L0('act', id);
    let r = null; try { const pr = ST.act(id, null); if (STN[id].verb === 'tapN' && ST.poke) say(() => ST.poke('start'));   /* (build 11: the tap that opened the act is its first hit — "5 הקשות" means five) */ r = await pr; } catch (e) { r = { quality: 0.6, gold: false }; }
    acting = null;
    if (ended) return false;
    if (!r || !(r.quality > 0)) { stamp('הפסקתם באמצע — הקישו שוב כשתרצו', 'info'); L0('idle', id); return false; }
    scoreAct(id, r); st.idleT = 0;
    if (id === 'song') { if (r && r.gold) { st.songs++; st.song = null; st.fuel = Math.min(100, st.fuel + DAY33.songFuel); pay(DAY33.songReward, 'song'); stamp(`שיר של יום — בקצב! +${DAY33.songFuel} אש, +${DAY33.songReward} פרוטות`, 'combo'); sfx('fanfare'); L0('song'); stat('songs'); } else { stamp('לא בקצב — שירו שוב', 'no'); sfx('miss'); } }
    else if (id === 'pen') { const l = st.lambs.find((q) => !q.ok); if (r && r.gold && l) { l.ok = true; stamp(`הצלחתם! הדיר נפתח — הטלה נכנס ומבוקר: ${okLambs()}/${DAY33.lambs} (ערכין ב, ה)`, 'combo'); sfx('coin'); L0('inspect'); stat('inspected'); } else if (l) { stamp('לא הצלחתם — הדיר לא נפתח בזמן, הטלה ברח! תפסו אותו', 'no'); sfx('miss'); L0('pen-bolt'); if (!st.lost) { const P = STN.pen.at, a = rng() * Math.PI * 2; st.lost = { x: P.x + Math.cos(a) * 14, z: P.z + 10 + Math.abs(Math.sin(a)) * 8, yaw: a, t: 0, follow: false }; } } }   // (build 12: the owner — 'פתח את הדיר: הצלחת / לא הצלחת')
    else if (id === 'kiyor') { st.washed = true; stamp('ידיים ורגליים מקודשות — היום כל גזר +25%', 'combo'); sfx('coin'); L0('wash'); stat('washes'); }
    else if (id === 'oil') { st.oil++; st.flour++; stamp(`שמן וסולת — ${st.oil}/${st.flour}`, 'info'); sfx('coin'); L0('oil'); stat('jars'); }
    else if (id === 'salt') { st.salt++; stamp(`מלח — ${st.salt}`, 'info'); sfx('coin'); L0('salt'); }
    else if (id === 'bake') { st.oil--; st.flour--; st.salt--; st.bread++; st.baked++; stamp(`לחם — ${st.bread} בסל (בית גרמו)`, 'combo'); sfx('chime'); L0('bake'); stat('baked'); }
    else if (id === 'wood') {
      st.power = Math.max(0, st.power - DAY33.powerChop); st.chops++;
      if (rng() < DAY33.worm) { st.worms++; stamp('גזר מתולע — פסול למזבח (מידות ב, ה)', 'no'); sfx('miss'); L0('worm'); }
      else { st.logs++; stamp(`גזר כשר — ${st.logs}/${st.basketMax} בסל`, r && r.gold ? 'combo' : 'info'); sfx('coin'); L0('log', st.logs); stat('chops'); { const h = heroP(); fx('load', { x: STN.wood.at.x, y: 17, z: STN.wood.at.z }, { x: h.x, y: 18, z: h.z }, 1); } }
    } else if (id === 'kevesh') { st.atTop = true; stamp('עליתם — הניחו את העצים על המערכה (הקישו)', 'info'); L0('top'); }
    return true;
  }
  function tapStation(id) {
    if (st.phase !== 'run' || acting || !STN[id]) return false;
    const p = standOf(id), h = heroP(); if (!p) return false;
    if (Math.hypot(p.x - h.x, p.z - h.z) <= DAY33.reach) return runAt(id);
    walkTo(p, () => { SHARED.arrive32 = { t: performance.now(), x: p.x, z: p.z, id }; sfx('ok'); L0('arrive', id); }, o.walk ? 1.8 : 3, pos3(STN[id].at));
    return true;
  }
  function stopAt33(h) {
    if (st.phase !== 'run' || acting) return null;
    const n = nx33(); if (n.kind !== 'station') return null;
    const p = standOf(n.id); if (!p || Math.hypot(p.x - h.x, p.z - h.z) > 2.4) return null;
    if (st.arr !== n.id) { st.arr = n.id; sfx('ok'); try { if (navigator.vibrate) navigator.vibrate([18, 40, 18]); } catch (e) { /* */ } SHARED.arrive32 = { t: performance.now(), x: p.x, z: p.z, id: n.id }; L0('arrive', n.id); }
    return pos3(STN[n.id].at) || p;
  }

  /* ───────── the button's word (flow31 places it beside the thing) ───────── */
  function work(h) {
    if (st.phase !== 'run') return null;
    if (acting) { const sa = ST && ST.state ? say(() => ST.state()) : null, s = STN[acting.id] || {}; if (sa && sa.phase === 'tail') return { icon: '✓', label: 'יפה!', job: 'sh:done', noRing: true, go: () => {}, act31: true }; return { icon: s.icon || '✋', label: acting.id === 'kevesh' ? 'העלו עצים — החזיקו' : verb31(acting.id, s), job: 'sh:act', noRing: true, go: () => {}, act31: true }; }
    const n = nx33();
    if (st.night && st.inMoked && !(st.torchOn && !st.watched) && unclaimed().length) return { icon: '📜', label: `ספר הזכרונות (${unclaimed().length})`, job: 'sh:book', noRing: true, go: () => claimBook() };   // (build 11)
    if (st.night && st.inMoked && !(st.torchOn && !st.watched) && !st.tilesNight && o.games) return { icon: '🃏', label: 'משחק לילה — זיכרון, הדיר, האוצר', job: 'sh:tiles', noRing: true, go: () => { st.tilesNight = true; offerPlay(); } };   // ── fable32 (build 13) ── (the interlude at night in the Moked: once a night, the clock held; פרוטות) ── /fable32 ──
    if (!st.night && st.logs > 0 && atTop(h)) return { icon: '🔥', label: 'הניחו על המערכה — הקישו', job: 'sh:lay', noRing: true, near31: true, id31: 'pyre', at: { ...PYRE, y: PYRE.y + 1 }, go: () => layLogs() };   // ── fable32 (build 14.1) ── ── /fable32 ──
    if (n.kind === 'torch') return { icon: '🔥', label: 'הלפיד — הקישו', job: 'sh:torch', noRing: true, go: () => { st.watched = true; st.torchOn = false; st.watches++; stamp('המשמר ער — יפה!', 'combo'); sfx('coin'); L0('torch-ok'); } };
    if (n.kind === 'lamb' && st.lost) { const Lm = st.lost, d = Math.hypot(Lm.x - h.x, Lm.z - h.z); if (!Lm.follow) { if (d <= DAY33.reach + 0.5) return { icon: '🐑', label: 'קחו את הטלה', job: 'sh:lamb', noRing: true, near31: true, id31: 'lamb', go: () => { Lm.follow = true; stamp('הטלה הולך אחריכם — לדיר!', 'combo'); sfx('coin'); L0('lamb-take'); } }; return { icon: '🐑', label: 'לך לטלה', job: 'sh:go:lamb', noRing: true, go31: true, id31: 'lamb', go: () => walkTo({ x: Lm.x, y: 16, z: Lm.z }, null, 2.5) }; } }
    // (build 7: any OPEN station within reach is his to use — the Roblox way; the next one is only the path's suggestion)
    let nearId = null, nd = 1e9; for (const id of shown33()) { if (!usable(id)) continue; const q = standOf(id); if (!q) continue; const d2 = Math.hypot(q.x - h.x, q.z - h.z); if (d2 <= DAY33.reach + 0.2 && d2 < nd) { nd = d2; nearId = id; } }
    if (nearId && nearId !== n.id) { const s2 = STN[nearId], p2 = standOf(nearId); return { icon: s2.icon || '✋', label: nearId === 'kevesh' ? 'העלו עצים — החזיקו' : verb31(nearId, s2), job: 'sh:' + nearId, noRing: true, near31: true, id31: nearId, at: { ...p2, y: (p2.y || 16) + 1 }, go: () => runAt(nearId) }; }
    if (st.merchant && !nearId) { const m = DAY33.merchantAt, dm = Math.hypot(m.x - h.x, m.z - h.z); if (dm <= DAY33.reach + 1) return { icon: '🧺', label: st.bread > 0 ? 'הסוחר — תנו לחם' : 'הסוחר מבקש לחם', job: 'sh:merchant', noRing: true, near31: true, id31: 'merchant', go: () => trade() }; }
    if (st.bread > 0 && st.power < 70 && !nearId) return { icon: '🍞', label: 'אכלו לחם', job: 'sh:eat', noRing: true, go: () => { st.bread--; st.power = Math.min(DAY33.power0, st.power + st.breadPower); stamp(`אכלתם — כוח ${Math.round(st.power)}`, 'combo'); sfx('coin'); L0('eat'); } };
    const s = STN[n.id], p = standOf(n.id); if (!s || !p) return null;
    const d = Math.hypot(p.x - h.x, p.z - h.z);
    if (d <= DAY33.reach + 0.2) return { icon: s.icon || '✋', label: n.id === 'kevesh' ? 'העלו עצים — החזיקו' : verb31(n.id, s), job: 'sh:' + n.id, noRing: true, near31: true, id31: n.id, at: { ...p, y: (p.y || 16) + 1 }, go: () => runAt(n.id) };
    if (!st.night && (st.idleT || 0) >= DAY33.idleOffer && o.games && !acting) return { icon: '🃏', label: 'משחק קצר?', job: 'sh:play', noRing: true, go: () => offerPlay() };   // ── fable32 (build 14) ── (idle 12 s, nothing near: the owner — 'אם רדום ואין מה לעשות אפשר להקפיץ משחק') ── /fable32 ──
    return { icon: s.icon || '➜', label: goLabel31(s.he), job: 'sh:go:' + n.id, noRing: true, go31: true, id31: n.id, go: () => tapStation(n.id) };
  }
  // ── fable32 (build 14) ── the interludes from the court: a choice card (never a must), the day's clock held while one plays; its פרוטות and score are the player's
  async function playGame(key) {
    const g = o.games && o.games[key]; if (!g || st.playing) return false;
    st.playing = key; st.paused = true; drive(0, 0); st.idleT = 0;
    let r = null; try { r = await g(); } catch (e) { r = null; }
    st.paused = false; st.playing = null;
    if (r && r.perutot > 0) { save.perutot = (+save.perutot || 0) + (r.perutot | 0); st.perutot = save.perutot; say(() => o.persist && o.persist()); }
    const pts = interludeScore(key, r); if (pts > 0) score(pts, key);
    if (r && r.won) { stamp(`${GAME_HE[key] || key}: +${r.perutot | 0} פרוטות${pts ? ` · +${pts} ★` : ''}`, 'combo'); sfx('coin'); stat('games'); }
    L0('game', key, r ? r.won : null);
    return !!(r && r.won);
  }
  // ── fable32 (build 14.1) ── at the ramp's top: HIS tap lays the logs on the pyre (they arc from the basket onto the fire); nothing goes up by itself
  const PYRE = { x: -29.5, y: 25.5, z: -3.5 }, TOP = { x: -34, y: 25, z: 12 };
  const atTop = (h) => h.z < 16 && h.z > 2 && Math.abs(h.x - TOP.x) < 6 && (h.y || 16) > 22;
  function layLogs() {
    if (st.logs <= 0) return false;
    const h = heroP(), n = st.logs; st.logs = 0; st.carried += n; st.atTop = false;
    fx('unload', { x: h.x, y: (h.y || 25) + 2, z: h.z }, PYRE, n);
    feed(n); stat('carried', n); st.idleT = 0; score(DAYSCORE.act.good, 'lay'); L0('lay', n);
    return true;
  }
  // ── /fable32 ──
  function offerPlay() {
    if (!hud || !hud.choice || !o.games) return false;
    st.idleT = 0;
    const items = Object.keys(o.games).map((k) => ({ icon: GAME_ICON[k] || '🎲', label: GAME_HE[k] || k, sub: GAME_SUB[k] || '', go: () => { playGame(k); return true; } }));
    say(() => hud.choice({ title: 'משחק קצר?', text: 'הממונה: "יש רגע? שחקו — הפרוטות והנקודות שלכם" (טיוטה)', items, closeLabel: 'אחר כך', onClose: () => {} }));
    return true;
  }
  // ── /fable32 ──
  function flowNext() { const n = nx33(); if (n.kind === 'lamb' && st.lost && !st.lost.follow) return { id: 'lamb', kind: 'station', pid: null, at: { x: st.lost.x, y: 16, z: st.lost.z } }; if (n.kind === 'lamb' && st.lost) return { id: 'pen', kind: 'station', pid: null, at: standOf('pen') }; if (n.kind !== 'station') return null; return { id: n.id, kind: 'station', pid: null, at: standOf(n.id) }; }
  function hintStep() {
    if (!hud || !hud.hint) return;
    let h = null;
    if (st.phase === 'run' && st.day === 1) {
      const w = work(heroP());
      if (st.night) h = st.torchOn && !st.watched ? 'הקישו על הלפיד!' : 'לילה בבית המוקד — נחים עד השחר';
      else if (w && w.near31) h = w.id31 === 'wood' ? 'הקישו 5 פעמים על הכפתור שליד העצים' : w.id31 === 'kevesh' ? 'החזיקו — הכהן עולה בכבש עם העצים' : w.id31 === 'pen' ? '3 הקשות מהירות — השער נפתח והטלה נכנס' : `הקישו על הכפתור שליד ${STN[w.id31] ? STN[w.id31].he : ''}`;
      // (build 14: no walk hints — the owner: 'יותר פשוט להאיר את הבועה הרלוונטית'; the next place's chip pulses, the path lies on the floor)
    }
    if (h !== hintNow) { hintNow = h; say(() => hud.hint(h)); }
  }

  /* ───────── the HUD ───────── */
  function push() {
    if (!hud) return;
    say(() => hud.set({ score: Math.round(st.fuel), combo: 1, rival: 0, rivalName: '', sec: Math.ceil(st.left), left: st.left, t: st.t, phase: st.phase, day33: { score35: SC ? say(() => SC.get()) : null, day: st.day, night: st.night, logs: st.logs, basket: st.basketMax, level: st.level, fuel: st.fuel, power: st.power, bread: st.bread, washed: st.washed, perutot: st.perutot, lambs: open33('pen') ? `${okLambs()}/${DAY33.lambs}` : '' } }));
    if (hud.tasks) say(() => hud.tasks(st.tasks.map((q) => ({ text: q.text, n: Math.min(q.goal, st.dayStats[q.key] | 0), goal: q.goal, done: !!q.done }))));
    if (fuelPin) { const m = STN.kevesh && STN.kevesh.at ? { x: -29.5, y: 25 + 3.5, z: -3.5 } : null; say(() => fuelPin.text(`${Math.round(st.fuel)}/100 · רמה ${st.level}`)); say(() => fuelPin.at(project(m), st.fuel <= DAY33.floor + 0.01)); }
  }

  /* ───────── the loop ───────── */
  function tick(dt) {
    if (!(dt > 0) || ended) return st;
    if (st.paused) { drive(0, 0); return st; }
    dt = Math.min(dt, 0.25);
    if (st.phase !== 'run') return st;
    st.t += dt; drainStep(dt); dayStep(dt); walkStep(dt); unlockStep(); merchantStep(); lostStep(dt);
    { const h = heroP(); if (Number.isFinite(st.px)) { const sp = Math.hypot(h.x - st.px, h.z - st.pz) / dt; if (sp > 8 && sp < 60) st.power = Math.max(0, st.power - DAY33.powerRun * dt); } st.px = h.x; st.pz = h.z; }
    if (tired() && !st.tiredSaid) { st.tiredSaid = true; stamp('עייפים — הבקיעה איטית. אכלו לחם', 'no'); } if (!tired()) st.tiredSaid = false;
    SHARED.lambs33 = st.lambs; if (!st.lost) SHARED.lost33 = null;
    { const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : {}; SHARED.moked33 = st.inMoked ? { x: DAY33.moked.x, z: DAY33.moked.z, rug: !!own.rug, lamp: !!own.lamp } : null; }
    badgeStep();
    if (st.day >= 33 && !st.ended33) { st.ended33 = true; fade(() => { stamp('33 ימי שירות — המשמר נגמר. השערים נפתחים עם שיר הלויים (המחשה)', 'combo'); sfx('fanfare'); L0('end33'); }, '33 ימי שירות'); }
    if (st.song && st.t >= st.song.until) { st.song = null; stamp('השיר נגמר — מחר שוב', 'info'); L0('song-close'); }
    try { globalThis.__FIRE33 = 0.25 + 0.75 * (st.fuel / 100) + 0.12 * (st.level - 1); } catch (e) { /* */ }
    try { globalThis.__LOGS33 = st.logs; } catch (e) { /* */ }   // (build 14: the ramp act draws the basket with his logs)   // (the pyre's flames by the meter and the level — life.js)
    fxStep(dt);
    { const h = heroP(); const moved = Number.isFinite(st.ix) && Math.hypot(h.x - st.ix, h.z - st.iz) > 0.3; st.ix = h.x; st.iz = h.z; st.idleT = moved || acting || st.night || st.lost ? 0 : (st.idleT || 0) + dt; }
    hintStep(); push();
    return st;
  }
  function loop(ms) { if (!raf) return; const dt = lastMs ? (ms - lastMs) / 1000 : 0; lastMs = ms; tick(dt); raf = requestAnimationFrame(loop); }
  function state() { return { t: Math.round(st.t * 100) / 100, phase: st.phase, day: st.day, night: st.night, left: Math.round(st.left), fuel: Math.round(st.fuel * 10) / 10, fed: st.fed, level: st.level, logs: st.logs, basket: st.basketMax, watched: st.watched, perutot: st.perutot, tasks: st.tasks.map((q) => [q.id, !!q.done]), merchant: !!st.merchant, lambsOk: okLambs(), lostLamb: st.lost ? { x: Math.round(st.lost.x), z: Math.round(st.lost.z), follow: !!st.lost.follow } : null, tamids: st.tamids, badges: Object.keys(st.badges), claimed: Object.keys(st.claimed), songs: st.songs, song: !!st.song, inMoked: st.inMoked, torchOn: st.torchOn, paused: !!st.paused, best: st.best, chops: st.chops, worms: st.worms, washed33: st.washed, power: Math.round(st.power), oil: st.oil, flour: st.flour, salt: st.salt, bread: st.bread, open: shown33(), acting: !!acting, next: nx33().id, flowNext: nx33().id, carried: null, score: Math.round(st.fuel), rival: 0, rivalName: '', combo: 1, served: 0, lost: 0, count: 0, stars: 0, spawned: 0, lav31: true, washed: true, mode: 'day33' }; }

  const E = {
    start() {
      ended = false; st.phase = 'run'; st.t = 0;
      if (CAM && CAM.on) say(() => CAM.on());
      if (ST && ST.place) say(() => ST.place());
      if (hud && hud.pin) fuelPin = say(() => hud.pin('fire33', { icon: '🔥', label: 'אש המערכה' })) || null;
      try { globalThis.__SH_STOP = stopAt33; } catch (e) { /* */ }
      newTasks(); setSky(false); push(); L0('start');
      if (o.raf && typeof requestAnimationFrame === 'function') { lastMs = 0; raf = requestAnimationFrame(loop); }
      return E;
    },
    stop() {
      if (raf) { try { cancelAnimationFrame(raf); } catch (e) { /* */ } raf = 0; }
      ended = true; try { if (globalThis.__SH_STOP === stopAt33) delete globalThis.__SH_STOP; } catch (e) { /* */ } drive(0, 0); goal = null;
      if (o.walk && o.walk.stop) say(() => o.walk.stop());
      if (fuelPin) { say(() => fuelPin.close()); fuelPin = null; } if (merchantPin) { say(() => merchantPin.close()); merchantPin = null; } SHARED.merchant33 = null; SHARED.lambs33 = null; SHARED.lost33 = null; SHARED.moked33 = null;
      if (ST && ST.clear) say(() => ST.clear());
      if (CAM && CAM.off) say(() => CAM.off());
      setSky(false); try { delete globalThis.__FIRE33; if (fadeEl) { fadeEl.remove(); fadeEl = null; } } catch (e) { /* */ }
    },
    state, tick, work, marks: () => [], flowNext, next31: () => nx33(),
    // ── fable32 (build 14) ── what he carries and holds (flow31 draws it on him): the axe within reach of the wood (or chopping), the back-basket with his logs; the flights
    gear: () => { const h = heroP(); const w = st.phase === 'run' && !st.night ? say(() => work(h)) : null; const nearWood = !!((w && w.near31 && w.id31 === 'wood') || (acting && acting.id === 'wood')); return { axe: nearWood, logs: st.logs, basketMax: st.basketMax, acting: acting ? acting.id : null, carrying: st.logs > 0 }; },
    fx33: () => st.fx,
    playGame, offerPlay,
    // ── /fable32 ──
    pause(on) { st.paused = !!on; if (st.paused) drive(0, 0); return st.paused; },
    tapStation, tapPilgrim: () => false, tapGate: () => false, take: () => false, leave: () => {}, runAt, st33: st, shown33,
    onEnd(cb) { if (typeof cb === 'function') ends.push(cb); return E; },
    get level() { return { n: 1, count: 0 }; },
    debug: { log: () => log.slice(), feed, skip: (s) => { for (let i = 0; i < Math.round(s * 10); i++) tick(0.1); return state(); }, setFuel: (v) => { st.fuel = v; }, logs: (n) => { st.logs = n; }, night: () => { st.left = 0; }, fed: (n) => { st.fed = n; st.level = levelOf33(n); }, power: (v) => { st.power = v; }, bread: (n) => { st.bread = n; }, lose: () => { st.lostDay = 0; st.lost = { x: -30, z: 30, yaw: 0, t: 0, follow: false }; }, lambOk: (n) => { st.lambs.forEach((q, i) => { q.ok = i < n; }); }, merchant: () => { st.merchantSeen = 0; st.day = Math.max(st.day, DAY33.merchantDay); merchantStep(); }, trade, perutot: () => st.perutot, song: () => { st.song = { until: st.t + DAY33.songS }; }, claim: claimBook, day: (n) => { st.day = n; } },
  };
  return E;
}
// ── /fable32 ──
