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
/* ── recovered (builds 16–26c) ── the day grew from build 15's loop into the shift's engine of builds 16–26c (the bundle kept no comment and
 * no local name; the comments above each block and the names are the recovery's, but where the build reports or the original lines
 * quoted in the session transcript give them — day33.js:369–373, :924, :936, :1074, :1214, :1234, :1267, :1304, :1356, :1385 —
 * and those lines' own comments):
 *   build 16 the saved day (save.day33state; resumeDay33 for the start screen) · 17 the focused day (o.b17: B17, the two tamids, the
 *   card and the bar — focus17.js; emit17 → E.on17) · 18 the coins in the world (C18, ENABLE_TEMPLE_COINS, the chests, the pads,
 *   own18) · 19 the ramp run (R19, the salt, the sway, the ghost) · 20 the laver's act (K20, gate20) · 21 תרומת הדשן (D21, gate21)
 *   · 22 סידור המערכה (M22, gate22) · 23 the lot (P23, POOL23, draw23, mastery23, rec23, gate23) · 24 no auto-walk (peek24, pk24)
 *   · 25 the lamb pen (P25, BLEM25, lamb25, hash25, at25, gate25) · 26 the second lot and the Heichal (P26, POOL26, draw26, gate26L,
 *   gate26, open26, at26, fill26, ev26, lit26, done26; 26b: the lot where he stands, free26/circle26).
 * ── fable32 (build 27) ── · 27 the second lot's two blood roles, "מי שוחט, מי זורק" (יומא ב, ג; תמיד ד, א): P27, BLOOD27, gate27,
 *   r27start/r27Step, the binding (r27bind), the cut on its gold moment (r27tap), the receiving under the stream (r27move), the swirl
 *   on the way (r27swirl, the clot meter), the two gifts below the line (r27throw), the rest on the southern yesod (r27swipe), done27;
 *   the great gate opened by the inner roles' winners when his role is a blood one (gateNpc27). dam27.js draws and hears them.
 * Every module of builds 17–27 reads the engine through E (E.b17, E.on17, E.focus17() … E.r26(), E.r27(), E.st33). Never a Divine Name. */
import { goLabel31, verb31 } from './layout31.js';
import { SHARED } from './draw.js';
import { DAYSCORE, interludeScore } from './score35.js';
import { free, houseFloor, onHigh, HOUSE22, WEST27, westStrip27 } from '../day/world22.js';
import { evlog } from './evlog16.js';
import './route31.js';
import { RATE30, LINE30, ACT30, quality30, mastery30, rate30, best30, pay30, served30, role30 } from './rate30.js';   // ── fable32 (build 30) ── one rating for every act ── /fable32 ──
import { J32, jr32, meet32, log32, served32, hebDate32 } from './journal32.js';   // ── fable32 (build 32) ── the kohen's journal ── /fable32 ──
import { clock29, where29 } from './time29.js';   // ── fable32 (build 32) ── (the journal's real date where the phone is) ── /fable32 ──
import { CH33, LINE33, day33n, pick33, offer33, ofDay33, stalls33, upLine33 } from './lamb33.js';   // ── fable32 (build 33) ── "הטלה המבוקר": the chamber's run and the morning's lamb ── /fable32 ──
import { LVL36, par36, lvl36, rec36, ensure36, migrate36, boker36, addBoker36, L36 } from './lvl36.js';   // ── fable32 (build 36) ── the four mastery levels of every built role (svivat-avoda-he.md §4) ── /fable32 ──
export const DAY33 = Object.freeze({
  // ── fable32 (build 28) ── (idleOffer: 12 — build 14's "משחק קצר?" after 12 s idle in the day — is gone with the offer) ── /fable32 ──
  dayS: 180,
  nightS: 60,
  fuel0: 22,
  drainS: 240,
  nightDrain: 0.5,
  floor: 5,
  perLog: 10,
  basket: 5,
  worm: 0.25,
  taps: 3,
  levels: [0, 6, 17, 67, 137, 300],
  reach: 3.2,
  torchAfter: 12,
  // ── recovered (11–26c) ── the bundle's keys of the later builds: the logs by the act's grade, the lay on the pyre (its reach, time and
  // stack), the good axe, the tired swing, the pen's misses, the stores, the lost lamb's reach, the merchant's warning, the start's minimal
  // screen (build 16), the saved day (every 10 s; kept 24 h until build 28, kept for good since)
  perLogGrade: { gold: 15, good: 10, ok: 7 },
  layReach: 6.5,
  layS: 0.35,
  stackMax: 12,
  fuelPin: false,
  axeK: 1.35,
  swingTiredC: 1.25,
  penMisses: 3,
  storeMax: 3,
  lostNear: 15,
  merchantWarn: 20,
  minimal: true,
  saveEvery: 10,   // ── fable32 (build 28) ── (the saved day has no expiry any more: saveMaxH, 24 h, is gone — "לא מאבדים כלום", rohvi-he.md §3) ── /fable32 ──
  // ── build 7 ── the court opens by the fire's level (99 Nights' fog): what each level unlocks; the washing's bonus; the strength meter
  unlock: { wood: 1, kevesh: 1, kiyor: 2, pen: 2, oil: 3, salt: 3, bake: 3, song: 3 },
  lambs: 6,
  tamidFuel: 15,
  tamidMiss: 10,
  lostFrom: 2,
  lostReward: 15,
  washBonus: 0.25,
  power0: 100,
  powerChop: 4,
  powerRun: 0.8,
  powerLow: 30,
  bread: 60,
  // ── build 8 ── the economy (99 Nights: diamonds come from quests and badges, never from days; the Pelt Trader on day 2 with 3 wares): פרוטות
  taskReward: 5,
  merchantDay: 2,
  merchantP: 0.35,
  merchantS: 120,
  merchantAt: { x: -13, y: 16, z: 3 },
  // ── build 10 ── the night in בית המוקד (מידות א, ו–ח: the kohanim slept there; the hall −178…−142 × −83…−58) — a fade and he is there; the Levites' song after the dawn tamid; the fire's look by its meter
  moked: { x: -160, y: 16, z: -68, back: { x: -34, z: 50 } },
  songS: 60,
  songFuel: 10,
  songReward: 5,
});
// ── recovered (R6–R7) ── the tables of builds 17–26 (the day's own modules import them: ramp19, kiyor20, deshen21, maaracha22, pis23,
// pen25, heichal26, fx18, focus17) and their helpers, in the bundle's order. The names are the build reports' where they have one (B17,
// C18, POOL23, draw23, mastery23, P25, BLEM25, at25, lamb25, hash25, P26, POOL26, draw26, ev26, fill26), else the recovery's in their style.
// ── recovered (build 17) ── B17 (the report's: "B17.graceK"): the focused day of build 17 (focus17.js, E.b17) — the fire's start and its
// drain by day/night (drain, drainK), the logs' grades, the tamid's dawn and dusk, the first two minutes' grace (grace s, ×graceK on
// the timing act's window), the catch-up, the warning and the critical fuel, the slots of the bar (slots, maxSlots), the pen's and
// the wood's times, the levels by the logs and the day's goals
export const B17 = Object.freeze({
  fuel0: 70,
  drain: Object.freeze([0.25, 0.4]),
  drainK: Object.freeze([0.7, 0.6]),
  perLogGrade: Object.freeze({ gold: 10, good: 8, ok: 6 }),
  tamid: Object.freeze({ dawn: 45, dusk: 170, fire: 60 }),
  grace: 120,
  graceK: 1.5,
  catchK: Object.freeze({ below: 60, at: 20, max: 2 }),
  warn: 40,
  crit: 25,
  powerShow: 50,
  night: false,
  slots: Object.freeze(['kiyor', 'wood', 'kevesh', 'song', 'pen', 'bake']),
  maxSlots: 5,
  penBefore: 60,
  rushTamid: 25,
  woodAt: 60,
  tamidLead: 50,
  levels: Object.freeze([0, 5, 10, 40, 90, 200]),
  goals: Object.freeze({ wood: 10, kevesh: 2, kiyor: 1, song: 1, bake: 1 }),
  power: false,
});
// ── recovered (build 18) ── C18 (the report's name: "C18.kiyorK"): the coins — a gold act pays 2, a good 1 (pay); a streak of 3 (streak); the
// tamid's 5; the gift (nedava: 10 coins; ── fable32 (build 28) ── at a fixed moment, 140 s of the day — no chance, the old p 0.3 is gone:
// a prize by luck is a bet, PLAY-PRINCIPLES §6 ── /fable32 ──); the chests by the gate (chests); the three pads to buy at (pads: the good axe,
// the big basket, the laver's second spigot — kiyorK: its walk ×0.6); the errand's 75
export const C18 = Object.freeze({
  pay: Object.freeze({ gold: 2, good: 1, ok: 0 }),
  streak: 3,
  tamid: 5,
  nedava: 10,
  nedavaAt: 140,
  chests: Object.freeze({ n: 13, max: 10, x: -12.7, z0: 6, dz: 1.2, hi: 60, lo: 40, hiS: 12, loS: 25, walkS: 4, reach: 3.6 }),
  pads: Object.freeze([
    Object.freeze({ id: 'axe', icon: '🪓', he: 'גרזן טוב', price: 80, x: -31, z: 51 }),
    Object.freeze({ id: 'basket10', icon: '🧺', he: 'טנא גדול', price: 120, x: -45, z: 51 }),
    Object.freeze({ id: 'kiyor2', icon: '🚰', he: 'דד שני לכיור', price: 40, x: -50.5, z: 16.5 }),
  ]),
  errand: 75,
  padR: 3,
  padS: 1.5,
  kiyorK: 0.6,
});
// ── recovered (build 18) ── ENABLE_TEMPLE_COINS (the report's): the temple's coins on — shift/index.js turns build 18's coins on by it
// (with ?coins=0 off)
export const ENABLE_TEMPLE_COINS = true;
// ── recovered (build 19) ── the ramp run (ramp19.js): the bag's two sizes, the climb's rate, the logs' flight, the goal, the sway, the salt
export const R19 = Object.freeze({
  bag: Object.freeze([480, 340]),
  rate: 33,
  fly: 0.25,
  goal: 0.8,
  after: 5,
  v0: 3,
  v1: 7.5,
  swayMax: 0.5,
  saltK: 0.4,
  slipV: 5.5,
  par: 6,
  head: 12,
  hold: 0.35,
});
// ── recovered (build 20) ── the laver's act (kiyor20.js): the two hands' hold (hold; the second, hold2), the water's rise, his place and
// turn at the laver (act), the spigot's two places (spig), its camera (cam)
export const K20 = Object.freeze({
  hold: 3.5,
  hold2: 2.5,
  back: 0.3,
  up: 1.2,
  upMax: 7,
  down: 6,
  rise: 0.35,
  rise30: 2.4,   // ── fable32 (build 30) ── (with the lot on: the rise holds 2.4 s — RATE30.wordS: the laver's rating and its source line before the lot's circle) ── /fable32 ──
  act: Object.freeze({ x: -60.2, z: 20, yaw: -1.12 }),
  spig: Object.freeze([11, 0]),
  cam: Object.freeze({ az: 0.45, el: 0.16, d: 7, t: Object.freeze({ x: -61, y: 19.75, z: 20.3 }) }),
});
// ── recovered (build 21) ── תרומת הדשן (deshen21.js): the swipe (px) and how straight, the coal's layers; the pan's bed and his stand at it,
// the way up the ramp and down (up, head, foot, go), the walk, the pour at the heap, the wind and the spill, the score, its cameras
export const D21 = Object.freeze({
  swipe: 120,
  straight: 0.5,
  layers: 4,
  bed: { x: -28.5, z: 5.5 },
  stand: { x: -30.7, z: 5.5, yaw: Math.PI / 2 },
  up: [
    [-34, 44.6],
    [-34, 11.6],
  ],
  head: { x: -42, z: 11.8 },
  foot: { x: -42, z: 44 },
  walk: 7,
  full: 0.7,
  desc: 3.5,
  turn: 0.35,
  wind: 20,
  wind1: 0.5,
  fix: 50,
  max: 45,
  spillA: 35,
  spillT: [1.5, 0.8],
  loss: 20,
  heap: { x: -28, z: 33 },
  go: [
    [-42, 44],
    [-28, 44.3],
    [-28, 34.7],
  ],
  goV: 8,
  pour: 1.3,
  end: 2,
  score: 150,
  pts: 50,   // ── fable32 (build 30) ── (coins: [3, 1, 0] by the spills is gone — the coins by the rating, rate30) ── /fable32 ──
  dawn: 2.6,
  sw: 0.3,
  ms: 200,
  nr: 2.6,
  bal: Object.freeze({ wind: Object.freeze([0.12, 0.35]), shake: Object.freeze([0.5, 1.4]), fix: 2.4, spill: 0.8, gap: 1, v: 7 }),
  cam: { az: 1.25, el: 0.785, d: 9, t: { x: -29.6, y: 25.6, z: 5.6 } },
  fol: { el: 0.26, d: 10, ty: 2.2 },
  camC: { az: 0.75, el: 0.4, d: 20, t: { x: -34, y: 17.5, z: 38.5 } },
  camP: { az: 0.2, el: 0.5, d: 11, t: { x: -28.4, y: 17, z: 33.8 } },
});
// ── recovered (build 22) ── סידור המערכה (maaracha22.js): six logs to lay (need, their sizes: two large, two medium, two small), the swipe,
// the score; the bands and the gaps of a good pyre, the logs' radius and length, the fire's catch; the pyre, his stand, the sorting
// place in the wood chamber (sortAt) and the cameras
export const M22 = Object.freeze({
  need: 6,
  sizes: 'LLMMSS',
  budget: [9, 5],
  next: [
    [0.3, 0.7],
    [0.1, 0.5],
  ],
  swipe: 60,
  pts: 15,
  mis: 20,
  score: 100,
  airB: 25,   // ── fable32 (build 30) ── (fast: 25 — the points for a quick sort — is gone: the rating is accuracy, not speed) ── /fable32 ──
  good: 85,
  thr: [60, 70],
  sw: 0.3,
  band: Object.freeze([Object.freeze([0.25, 0.45]), Object.freeze([0.3, 0.4])]),
  gv: 1.2,
  l0: -0.6,
  r: { L: 0.3, M: 0.21, S: 0.11 },
  len: { L: 4, M: 3, S: 1.7 },
  span: 1.2,
  gap: [0.06, 0.36, 0.9],
  ember: 8,
  fire: [64, 0.22],
  ign: 1.8,
  end: 2.6,
  sorted: 0.9,
  pyre: { x: -30, z: -3.5 },
  stand: { x: -28.6, z: 1.6, yaw: -2.85 },
  sortAt: { x: -42.2, z: 57.8, yaw: Math.PI / 2 },
  camS: { t: [-38.6, 17.2, 58], p: [-36.6, 18.3, 53.2] },
  camB: { az: -0.3, el: 1.05, d: 8.6, t: { x: -30, y: 25.9, z: -3.3 } },
  camP: { az: 0.55, el: 0.3, d: 14, t: { x: -30, y: 30, z: -3.5 } },
});
// ── recovered (build 22) ── the woods by the log's size (L, M, S) and the unfit (olive, vine, the wormy)
const KINDS22 = Object.freeze({ L: ['fig', 'pine'], M: ['fig', 'walnut', 'pine'], S: ['walnut', 'pine'], bad: ['olive', 'vine', 'worm'] });
// ── recovered (build 23) ── the lot (pis23.js; יומא ב, א–ד): the roles open by the day (open), the second lot from day 4 (two), the pick; the
// circle of kohanim (c, r, seats) and the ממונה's call, the counting (n1, n2), the show; and the short forms of the morning's tasks
// when the lot gives them (need/sizes/layn/budget for the pyre, d21 for the ashes); its cameras
export const P23 = Object.freeze({
  open: Object.freeze(['deshen', 'm22', 'lamb']),
  draw: 4,   // ── fable32 (build 28) ── (from the fourth morning the lot DRAWS one role, never yesterday's — was `two: 4`, two cards and "במה תבחר?"; the owner, 22.10 09:19: "פיס נקי, קלף אחד") ── /fable32 ──
  pick: 3,   // (the engine's choice phase, auto-pick after 3 s: kept for a lot of two cards, which no draw gives since build 28)
  yest: 0.25,
  bal: 0.5,
  in: 0.6,
  call: 0.4,
  step: 0.2,
  n1: 8,
  n2: 6,
  show: 1.2,
  show2: 0.6,
  fin: Object.freeze({ dy: 0.3, ms: 200, x: 0.51, auto: 6 }),
  c: Object.freeze({ x: -51, z: 23.4 }),
  r: 3.2,
  seats: 8,
  run: 10.5,
  fire: 86,
  need: 4,
  sizes: 'LLMS',
  layn: Object.freeze([2, 1, 1]),
  budget: Object.freeze([7, 4.5]),
  bad: Object.freeze([3, 2]),
  sorted: 0.6,
  d21: Object.freeze({ full: 0.5, walk: 10, goV: 11, pour: 1 }),
  up: 0.6,
  upMax: 9,   // ── fable32 (build 30) ── (dT: [2, 8] — the ashes' time scale in their mastery — is gone) ── /fable32 ──
  cam: Object.freeze({ az: 1.45, el: 0.88, d: 12, t: Object.freeze({ x: -51, y: 17.6, z: 23.4 }) }),
  fol: Object.freeze({ el: 0.36, d: 12, ty: 2.4 }),
});
// ── recovered (build 23) ── POOL23 (the report's: "the POOL23 registry"): the morning's roles in the first lot — built: played by him
export const POOL23 = Object.freeze(
  [
    ['deshen', 'תרומת הדשן', '🔥', 1],
    ['m22', 'סידור המערכה', '🪵', 1],
    ['lamb', 'בדיקת הטלה', '🐑', 1],
    ['chavitin', 'החביתין', '🍞'],
    ['ketoret', 'הקטורת', '💨'],
    ['shir', 'השיר', '🎶'],
  ].map(([id, he, icon, built]) => Object.freeze({ id, he, icon, built: !!built })),
);
// ── recovered (build 23) ── how often he has played a role (save.roles23's count); draw23 (the report's): the morning's lot — the role of
// the day by P23.open, then never yesterday's and the least played first; two roles from the fourth morning
// ── fable32 (build 28) ── from the fourth morning (P23.draw) ONE role, never yesterday's — as the second lot (draw26) draws: "הִתְקִינוּ
// שֶׁלֹּא יְהוּ תוֹרְמִין אֶת הַמִּזְבֵּחַ אֶלָּא בְפַיִס" (יומא ב, ב); mornings 1–3 as before ── /fable32 ──
// ── fable32 (build 31) ── the mornings he had the role: a practice run (the roles book's "לתרגל") adds to the record's n and its own pr,
// and the lot counts n − pr — practice never moves the lot's weights, its "never yesterday's" or a first time ── /fable32 ──
const timesOf = (rec, id) => (rec && rec[id] ? Math.max(0, (rec[id].n | 0) - (rec[id].pr | 0)) : 0);
function draw23(n, rec, ids, rnd = Math.random) {
  const h = (rec && rec.h) || [],
    yest = h.length ? h[h.length - 1][1] : null,
    fixed = P23.open[n - 1];
  if (fixed && ids.includes(fixed)) return [fixed];
  const most = Math.max(0, ...ids.map((x) => timesOf(rec, x))),
    weight = (a) => (a === yest ? P23.yest : 1) * (1 + P23.bal * (most - timesOf(rec, a))),
    pick = (ids) => {
      let sum = 0,
        cum = ids.map((x) => (sum += weight(x))),
        r = rnd() * sum;
      for (let i = 0; i < ids.length; i++) if (r < cum[i]) return ids[i];
      return ids[ids.length - 1];
    },
    lastPair = h.length ? h[h.length - 1].slice(1) : [],
    fresh = ids.find((x) => !timesOf(rec, x) && !lastPair.includes(x));
  if (n < P23.draw) return [fresh || pick(ids)];
  const rest = ids.filter((x) => x !== yest);
  return [fresh || pick(rest.length ? rest : ids)];   // ── fable32 (build 28) ── (one card; was: [first, pick(others)] — two to choose from) ── /fable32 ──
}
// ── recovered (build 23) ── mastery23 (the report's: "mastery23('inner'|'menorah'|'lamb')"): a role's mastery 0…100 from its own record.
// ── fable32 (build 30) ── accuracy only (the owner, 22.10 09:19: "מהודר / כשר / טעון תיקון לפי דיוק; מהירות רק כקצב בתוך הפעולה"): it was
// 20–50 % the own time (the ashes 50, the lamb 35, the inner altar 45, the menorah 30, the shochet 30, the zorek 20, the pyre's sort 30) —
// now rate30.js's quality30 × 100, the same measures without the clock; a save's older values stay as they were (never rewritten).
// (timeBudget, the pyre's sort budget, no longer counts.) ── /fable32 ──
function mastery23(id, r) {
  return r ? mastery30(id, r) : 0;
}
// ── recovered (build 23) ── the roles book's rows (pis23.js's rolesBook23): each role of a pool with his record in save.roles23 — open
// once he has played it, how often, his best and last (the name is the recovery's)
// ── fable32 (build 30) ── each row also has its rating: the best (rate), the times מהודר (h) and the skill title (title) — rate30's role30 ── /fable32 ──
// ── fable32 (build 31) ── had: the mornings he had it (timesOf — the lot is the key; a practice run never opens a role); pr: its practice runs ── /fable32 ──
export const bookOf23 = (save, pool = POOL23) => {
  const rec = (save && save.roles23) || {};
  return pool.map((x) => {
    const a = rec[x.id] || {},
      r = role30(a);
    return { id: x.id, he: x.he, icon: x.icon, built: x.built, open: (a.n | 0) > 0, n: a.n | 0, best: a.best | 0, last: a.last | 0, rate: r.best, h: r.h, title: r.title ? r.title.he : null, had: timesOf(rec, x.id), pr: a.pr | 0 };
  });
};
/** ── fable32 (build 31) ── the roles book's practice (hachraot-he.md "עולם ומבנה", 21.10 23:46: "ספר התפקידים — אימון בכל תפקיד בנוי,
 *  לשיא"): any role he has had in a real morning — the laver too — opens its act directly (createDay33's o.practice): the same place, the
 *  same court round it, the same controls and rating; no tamid clock, no day timer. It changes the role's record (rec23: n, best, r30 —
 *  the rating, the מהודר count, the title — and pr, its own count); never the coins, the day, the lot, the mornings served, the tasks or
 *  the badges. endS: the end card this long after the act's end — as its rating's word (RATE30.wordS, 2.4 s) ends, so no other line shows
 *  between them; gate27: the court opens the great gate this long after he stands at the ring (the day: 9 s after the second lot, his walk
 *  to the ring in it — המחשה) ── /fable32 ── */
export const PRAC31 = Object.freeze({
  roles: Object.freeze(['kiyor', 'deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek']),
  first: Object.freeze(['deshen', 'm22', 'lamb']),
  endS: 2.35,
  gate27: 5,
});
// ── recovered (build 25) ── P25 (the report's: "P25.stand"): the lamb pen (pen25.js) — the pen's door and his stand at it, the side, the
// rings; the act's times (in, bring, aside, zoom, blem, clean, ok, lead, end), a false approval's delay (fals) and rejections (rej), the
// dawn, the score; the cameras (cam, zd, camP)
export const P25 = Object.freeze({
  door: { x: -17.6, z: -47.4, yaw: -Math.PI / 2, s: 0.8 },
  stand: { x: -18.6, z: -44.2 },
  side: { x: -13.2, z: -47.6 },
  rings: { x: -36, z: -41 },
  in: 0.5,
  bring: 0.9,
  aside: 0.9,
  zoom: 0.4,
  blem: 1.6,
  clean: 0.45,
  ok: 0.9,
  lead: 2.2,
  end: 0.6,
  fals: 3.2,
  rej: 2,
  pB: 0.5,
  dirt: 2,
  dawn: 26,
  sw: 0.25,
  score: 120,
  fa: 40,
  wr: 20,   // ── fable32 (build 30) ── (tT: [8, 24] and fast: 20 — the own time's share of the mastery and the quick coins — are gone) ── /fable32 ──
  hy: 0.9,
  cam: { az: 1.876, el: 0.36, d: 2.9, ty: 1 },
  zd: 2.2,
  camP: { az: 0.2, el: 0.3, d: 6.5, ty: 1.2 },
});
const list25 = (ids, he) => Object.freeze(ids.split(' ').map((id, i) => Object.freeze({ id, he: he.split('|')[i] })));
// ── recovered (build 25) ── BLEM25 (the report's: "6 kinds × 8 places — המחשה"): the blemishes' kinds, the places on the lamb, the dirt
export const BLEM25 = Object.freeze({
  cats: list25('wart crack cloud wound tear swell', 'יבלת / בליטה|סדק / חריץ|כתם / עכירות אישון|פצע / חתך|קרע / חסר בבשר|נפיחות / עיוות'),
  regs: list25('earR earL eyeR eyeL hoofF hoofB back belly', 'אוזן ימין|אוזן שמאל|עין ימין|עין שמאל|טלף קדמית|טלף אחורית|גב|בטן'),
  dirt: Object.freeze(['straw', 'mud']),
});
// (the eight places on the lamb's rig: x, y, z and the normal; the last 1 = on the head, which turns about HEAD25)
const REGION25 = [
  [-0.34, 1.67, 1, -0.52, 0.85, 0, 1],
  [0.34, 1.67, 1, 0.52, 0.85, 0, 1],
  [-0.185, 1.665, 1.23, -0.6, 0.1, 0.8, 1],
  [0.185, 1.665, 1.23, 0.6, 0.1, 0.8, 1],
  [0.27, 0.12, 0.42, 1, 0, 0, 0],
  [0.27, 0.12, -0.52, 1, 0, 0, 0],
  [0.14, 1.8, -0.2, 0.24, 0.97, 0, 0],
  [0.36, 0.78, 0, 0.7, -0.7, 0, 0],
];
const HEAD25 = [0, 1.36, 0.62];
/** ── recovered (build 25) ── at25 (the report's name): a place on the lamb (BLEM25.regs index) in the world — the lamb at L {x, y, z, yaw, s},
 *  its head turned by yaw and pitch → { x, y, z, nx, ny, nz } */
export function at25(reg, L, yaw = 0, pitch = 0) {
  let row = REGION25[reg] || REGION25[6],
    [x, y, z, nx, ny, nz] = row;
  if (row[6]) {
    const c = Math.cos(pitch),
      s = Math.sin(pitch),
      dy = y - HEAD25[1],
      dz = z - HEAD25[2];
    y = HEAD25[1] + c * dy - s * dz;
    z = HEAD25[2] + s * dy + c * dz;
    const ny0 = ny;
    ny = c * ny0 - s * nz;
    nz = s * ny0 + c * nz;
    const cy = Math.cos(yaw),
      sy = Math.sin(yaw),
      dx = x - HEAD25[0],
      dz2 = z - HEAD25[2];
    x = HEAD25[0] + cy * dx + sy * dz2;
    z = HEAD25[2] - sy * dx + cy * dz2;
    const nx0 = nx;
    nx = cy * nx0 + sy * nz;
    nz = -sy * nx0 + cy * nz;
  }
  const u = Math.cos(L.yaw),
    h = Math.sin(L.yaw),
    k = L.s || 1;
  return { x: L.x + k * (u * x + h * z), y: (L.y || 16) + k * y, z: L.z + k * (-h * x + u * z), nx: u * nx + h * nz, ny, nz: -h * nx + u * nz };
}
// ── recovered (build 25) ── hash25 (the report's: "murmur3's finalizer"): the day's seed; lamb25 (the report's): the morning's lamb —
// seeded by the day, at most two blemished or rejected a morning, his first lamb easier to read
const hash25 = (a, b, c = 0) => {
  let h = Math.imul(a | 0, 2654435761) ^ Math.imul((b | 0) + 1663821227, 2246822519) ^ Math.imul((c | 0) + 625341585, 3266489917);
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// ── fable32 (build 36) ── P36 (lvl36.js — the lamb's level): small — the blemish in an ear or an eye only (the pen draws it small); mimic
// — the dirt looks like a blemish (the zoom no longer tells: he brushes, and then knows) ── /fable32 ──
function lamb25(day, k, first = false, blems = 0, rej = 0, P36 = null) {
  const rnd = (a) => hash25(day | 0, k | 0, a),
    canBlem = blems < 2 && rej < P25.rej,
    nR = BLEM25.regs.length,
    nC = BLEM25.cats.length;
  if (first)
    return k > 0
      ? { blem: null, dirt: [], big: true }
      : rnd(1) < 0.5
        ? { blem: { c: Math.floor(rnd(2) * nC) % nC, r: [6, 1, 3, 4][Math.floor(rnd(3) * 4) % 4] }, dirt: [], big: true }
        : { blem: null, dirt: [{ r: [6, 7, 1][Math.floor(rnd(4) * 3) % 3], kind: 'straw' }], big: true };
  const newBlem = canBlem && rnd(1) < ((P36 && P36.pB) || P25.pB) ? { c: Math.floor(rnd(2) * nC) % nC, r: P36 && P36.small ? Math.floor(rnd(3) * 4) % 4 : Math.floor(rnd(3) * nR) % nR, ...(P36 && P36.small ? { small: 1 } : {}) } : null,
    nDirt = Math.floor(rnd(4) * (((P36 && P36.dirt) || P25.dirt) + 1)) % (((P36 && P36.dirt) || P25.dirt) + 1),   // ── fable32 (build 36) ── (level 4: more spots to read — P36.dirt, P36.pB) ── /fable32 ──
    dirt = [];
  for (let i = 0; i < 8 && dirt.length < nDirt; i++) {
    const r = Math.floor(rnd(10 + i) * nR) % nR;
    if ((!newBlem || r !== newBlem.r) && !dirt.some((x) => x.r === r)) dirt.push({ r, kind: BLEM25.dirt[Math.floor(rnd(20 + i) * 2) % 2], ...(P36 && P36.mimic ? { mimic: Math.floor(rnd(30 + i) * 6) % 6 } : {}) });
  }
  return { blem: newBlem, dirt, big: false };
}
// ── recovered (build 26) ── P26 (the report's: "P26.open (the schedule)", "P26.reach (3.2)", P26.gate, P26.foot): the second lot's inner
// roles in the Heichal (heichal26.js) — the schedule of his role by the day (open), the Heichal's gate and its reach, the inner altar and
// the menorah, the act's steps and pulls, the pour, the lamps (lx, ly, lz), the lot's walk-in (lotIn), the ramp's foot (foot), the times
export const P26 = Object.freeze({
  open: Object.freeze(['menorah', 'inner', 'menorah', 'shochet', 'zorek']),   // ── fable32 (build 27) ── (morning 4 the shochet, 5 the zorek; then the draw, never yesterday's) ── /fable32 ──
  gate: Object.freeze({ x: -89.3, z: 0 }),
  reach: 3.2,
  alt: Object.freeze({ x: -119.7, z: 0.4 }),
  walkM: Object.freeze({ x: -121.1, z: 5.9 }),
  men: Object.freeze({ x: -122.8, z: 7.2, y: 0.6 }),
  in: 0.4,
  step: 0.45,
  set: 0.5,
  sw: 0.25,
  ms: 200,
  key: 0.8,
  back: 0.5,
  opn: 1.1,
  pulls: 7,
  hand: 0.15,
  dy: 0.2,
  vmax: 2.4,
  scr: 5,
  wick: 0.25,
  pour: Object.freeze({ r0: 1.5, r1: 0.34, knee: 0.7, lo: 0.9, hi: 1, max: 1.16 }),
  spill: 0.5,
  lit: 0.3,
  leave: 0.7,
  kuz: 0.5,
  ev: 0.2,
  lotIn: 0.35,
  foot: Object.freeze({ x: -42, z: 45 }),
  lx: Object.freeze([-126.01, -125.61, -125.21, -125.19, -124.79, -124.39, -123.99]),
  ly: 25,
  lz: 7.5,
  score: 120,   // ── fable32 (build 30) ── (tT — the time scales of the mastery — and fast: 20 are gone) ── /fable32 ──
});
// ── recovered (build 26) ── POOL26 (the report's): the second lot's thirteen roles (יומא ב, ג) — built: the inner altar's and the
// menorah's ashes; the rest "כהנים אחרים — בקרוב"
export const POOL26 = Object.freeze(
  [
    ['shochet', 'השחיטה', '🔪', 1],   // ── fable32 (build 27) ── (built: o.p27) ── /fable32 ──
    ['zorek', 'זריקת הדם', '🏺', 1],
    ['inner', 'דישון מזבח הפנימי', '🥣', 1],
    ['menorah', 'דישון המנורה', '🪔', 1],
    ['rosh', 'הראש והרגל', '🧺'],
    ['yadaim', 'שתי הידיים', '🧺'],
    ['oketz', 'העוקץ והרגל', '🧺'],
    ['chaze', 'החזה והגרה', '🧺'],
    ['dfanot', 'שתי הדפנות', '🧺'],
    ['kerev', 'הקרביים', '🧺'],
    ['solet', 'הסולת', '🌾'],
    ['chavt', 'החביתין', '🍞'],
    ['yayin', 'היין', '🍇'],
  ].map(([id, he, icon, built]) => Object.freeze({ id, he, icon, built: !!built, lot: 2 })),
);
// ── recovered (build 26) ── draw26 (the report's): the second lot — the role by P26.open, from the fourth morning never yesterday's;
// ev26: the morning's event (a lamp gone out); fill26: the pour's fill curve (fast to the knee, slow after)
function draw26(n, rec, ids, rnd = Math.random, done = {}) {
  const h = (rec && rec.h) || [],
    yest = h.length ? h[h.length - 1][1] : null,
    fixed = P26.open[n - 1];
  if (fixed && ids.includes(fixed) && fixed !== yest) return [fixed];
  let rest = ids.filter((x) => x !== yest),
    pool = rest.length ? rest : ids,
    most = Math.max(0, ...pool.map((x) => done[x] | 0)),
    w = pool.map((x) => 1 + 0.5 * (most - (done[x] | 0))),
    r = rnd() * w.reduce((s, x) => s + x, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= w[i]) < 0) return [pool[i]];
  return [pool[pool.length - 1]];
}
const ev26 = (day, seen) => !seen && hash25(day | 0, 26, 7) < P26.ev;
// ── fable32 (build 27) ── the second lot's two blood roles (יומא ב, ג: "מי שוחט, מי זורק"; תמיד ד, א): BLOOD27 — built with o.p27; P27 — the
// places (the morning's ring, north-west, the second row: "של שחר היה נשחט על קרן צפונית מערבית, על טבעת שניה"; the lamb's head south and
// its face west; the shochet east of it, facing west; the receiver by the neck; the two corners' stands out on their diagonals; the
// southern yesod by the south-west corner), the act's times, the cut's needle (one way in `sweep` s, back and forth; PERFECT in `win` —
// the owner's protocol, [0.425, 0.575]), the receiving (the vessel under the stream: |pos − stream| < tol fills in fillS s), the swirl
// (still s without a circle → the clot meter rises), the throw (the pull → the height on the wall: under `line` (the red thread, y 21),
// over the yesod (`low`); ±deg of the corner → both faces, Γ; ≤ side° → one face), the base's swipe, the inner roles' winners' gate
// (gateNpc s after the lot) and their five lamps (men5 s after the gate) when his role is a blood one, the mastery's time scales, score.
// The numbers are a game's (המחשה), not halacha.
export const BLOOD27 = Object.freeze(['shochet', 'zorek']);
export const P27 = Object.freeze({
  ring: Object.freeze({ x: -47, z: -33.5 }),
  lamb: Object.freeze({ x: -47.3, z: -33.5 }),
  stand: Object.freeze({ x: -45.3, z: -33.4 }),
  recv: Object.freeze({ x: -48.8, z: -31.3 }),
  reach: 2.6,
  corner: Object.freeze({ NE: Object.freeze([-23, -18.5]), SW: Object.freeze([-53, 11.5]) }),
  at: Object.freeze({ NE: Object.freeze({ x: -20.6, z: -20.9 }), SW: Object.freeze({ x: -55.3, z: 13.9 }) }),
  hole: Object.freeze({ x: -52.6, y: 17.05, z: 12.1 }),
  aimR: 2.4,
  in: 0.45,
  bound: 0.6,
  cutd: 0.9,
  npcCut: 0.7,
  full: 0.3,
  splash: 0.7,
  poured: 0.9,
  sweep: 1.15,
  sweep1: 1.4,
  win: Object.freeze([0.425, 0.575]),
  fillS: 2.5,
  tol: 0.15,
  sMax: 0.75,
  still: 3,
  coagUp: 0.3,
  coagDn: 0.7,
  swirlRad: 1.4,
  line: 21,
  low: 17.2,
  y0: 16.6,
  yK: 8,
  minPow: 0.12,
  deg: 3,
  side: 28,
  dn: 0.22,
  ms: 300,
  gateNpc: 9,
  men5: 8,
  score: 120,   // ── fable32 (build 30) ── (tT and fast: 20 are gone — the rating is accuracy) ── /fable32 ──
});
const blood27 = (r) => r === 'shochet' || r === 'zorek';
/** ── fable32 (build 27) ── the place of slaughter's floor north of the altar (the rings' rows, south of the hook pillars and the tables,
 *  מדות ג, ה): the stick walks it (stages.js's 'lishka' footprint, x −54 … −22, z −62 … −27, is solid to him there); its east side runs
 *  past the footprint's edge (−21.9), so he comes in from the east too — from the lamb pen's door on a lamb morning (an east edge at
 *  −22.4 had left an unseen wall 0.4 amah wide: the autoplayer stood at x −22.0 for 100 s) */
export const rings27 = (x, z) => x > -53.6 && x < -21.9 && z > -46 && z < -27;
/** ── fable32 (build 27) ── the cut's needle at t s into the cut: 0 → 1 → 0 … (one way in `sweep` s) */
export const needle27 = (t, sweep = P27.sweep) => {
  const x = (Math.max(0, t) / sweep) % 2;
  return x < 1 ? x : 2 - x;
};
/** ── fable32 (build 27) ── the stream's place under the neck at t s into the receiving (−sMax … sMax; a gentle wander, two waves) */
export const stream27 = (t, k = 1) => P27.sMax * k * (0.65 * Math.sin(1.25 * t + 0.4) + 0.35 * Math.sin(2.7 * t + 1.9));
/** ── fable32 (build 27) ── a throw's mark: the pull p (0…1) → the height on the wall, the aim a (degrees off the corner's edge) →
 *  { res: 'weak' | 'high' | 'perfect' | 'good' | 'miss', y, face: 0 (both) | −1 (the first face) | 1 (the second), q } */
export function throw27(p, a, deg = P27.deg) {   // ── fable32 (build 36) ── (deg: the corner's Γ by the level — lvl36.js) ── /fable32 ──
  const y = P27.y0 + P27.yK * Math.max(0, Math.min(1, +p || 0)),
    d = Math.abs(+a || 0);
  if (!(p >= P27.minPow)) return { res: 'weak', y, face: 0, q: 0 };
  if (y >= P27.line) return { res: 'high', y, face: 0, q: 0 };
  if (d <= deg) return { res: 'perfect', y, face: 0, q: 1 };
  if (d <= P27.side) return { res: 'good', y, face: a < 0 ? -1 : 1, q: 0.6 };
  return { res: 'miss', y, face: a < 0 ? -1 : 1, q: 0 };
}
const fill26 = (f, dt) => {
  let P = P26.pour,
    t = dt;
  if (f < P.knee) {
    const k = Math.min(t, (P.knee - f) / P.r0);
    f += k * P.r0;
    t -= k;
  }
  return Math.min(P.max, f + t * P.r1);
};
// ── recovered (build 19) ── on the ramp (its rectangle: x −46…−30, z 10.5…42.5) and the ramp's height at z (16 at the foot → 25 at the top)
export const onRamp19 = (x, z) => x > -46 && x < -30 && z > 10.5 && z < 42.5;
// (the salt's cell on the ramp: 2-amah columns × 1-amah rows)
const cell19 = (x, z) => (Math.floor(z - 10.5) << 3) + Math.floor((x + 46) / 2);
export const rampY19 = (z) => 16 + 9 * Math.min(1, Math.max(0, (42.5 - z) / 32));
/** the ממונה's tasks — three a day, by the day's number; each pays 5 פרוטות (שקלים ה, א: the fifteen officers) */
export const TASKS33 = Object.freeze([
  { id: 'chop6', text: '🪵 בקעו 3 גזרים', key: 'chops', goal: 3, st: 'wood' },
  { id: 'carry10', text: '🔥 העלו 5 גזרים', key: 'carried', goal: 5, st: 'kevesh' },
  { id: 'chop12', text: '🪵 בקעו 5 גזרים', key: 'chops', goal: 5, st: 'wood' },
  { id: 'wash', text: '💧 קדשו ידיים ורגליים', key: 'washes', goal: 1, st: 'kiyor' },
  { id: 'jars2', text: '🏺 פתחו 2 כדים', key: 'jars', goal: 2, st: 'oil' },
  { id: 'bake1', text: '🍞 אפו לחם', key: 'baked', goal: 1, st: 'bake' },
  { id: 'carry20', text: '🔥 העלו 10 גזרים', key: 'carried', goal: 10, st: 'kevesh' },
]);
/** the shop (MIKDASH99 §5) — what פרוטות buy, kept in save.day33 */
export const SHOP33 = Object.freeze([
  { id: 'axe', icon: '🪓', label: 'גרזן טוב', sub: 'חלון רחב יותר לבקיעה בזמן', price: 25 },
  { id: 'basket10', icon: '🧺', label: 'טנא גדול', sub: '10 גזרים בסל', price: 30 },
  { id: 'basket20', icon: '🧺', label: 'טנא ענק', sub: '20 גזרים בסל', price: 90, needs: 'basket10' },
  { id: 'bowl', icon: '🥣', label: 'קערת לישה', sub: 'לחם שמשיב 90 כוח', price: 35 },   /* (build 11: the אבנט's colours are fixed by the halacha — no dye; the cosmetics are the night corner's) */
  { id: 'rug', icon: '🧶', label: 'שטיח לפינה', sub: 'בבית המוקד, ללילה', price: 20 },
  { id: 'lamp', icon: '🪔', label: 'מנורת שמן לפינה', sub: 'בבית המוקד, ללילה', price: 20 },
]);
/** ── build 11 ── ספר הזכרונות (99 Nights' badge board, claimed at the board): earned by play, claimed at night in בית המוקד for פרוטות */
export const BADGES33 = Object.freeze([
  { id: 'log1', text: '🪵 הגזר הראשון', pay: 2, test: (s) => s.chops - s.worms >= 1 },
  { id: 'log25', text: '🪵 25 גזרים כשרים', pay: 5, test: (s) => s.chops - s.worms >= 25 },
  { id: 'log100', text: '🪵 100 גזרים', pay: 15, test: (s) => s.chops - s.worms >= 100 },
  { id: 'lvl2', text: '🔥 המערכה ברמה 2', pay: 3, test: (s) => s.level >= 2 },
  { id: 'lvl4', text: '🔥 המערכה ברמה 4', pay: 10, test: (s) => s.level >= 4 },
  { id: 'lvl6', text: '🔥 המערכה שלמה — רמה 6', pay: 15, test: (s) => s.level >= 6 },
  { id: 'bread1', text: '🍞 הלחם הראשון', pay: 3, test: (s) => s.baked >= 1 },
  { id: 'lambs6', text: '🐑 שישה טלאים מבוקרים', pay: 8, test: (s) => s.lambs.every((q) => q.ok) },
  { id: 'lost1', text: '🐑 טלה אבוד הושב', pay: 5, test: (s) => s.lostBack >= 1 },
  { id: 'song3', text: '🎶 שלושה שירים בקצב', pay: 8, test: (s) => s.songs >= 3 },
  { id: 'day3', text: '🌙 שלושה ימים בעזרה', pay: 5, test: (s) => s.day >= 3 },
  { id: 'day7', text: '🌙 שבוע בעזרה', pay: 10, test: (s) => s.day >= 7 },
  { id: 'day33', text: '🌅 33 ימי שירות', pay: 15, test: (s) => s.day >= 33 },
  { id: 'watch5', text: '🔥 חמישה משמרות ערים', pay: 5, test: (s) => s.watches >= 5 },
  { id: 'trade1', text: '🧺 סחר עם הסוחר', pay: 3, test: (s) => s.trades >= 1 },
]);
// (day 1: the wood alone; day 2: the laver and the stores — what the fire's level opens by then; build 20: the laver's own act skipped)
export const tasksForDay = (day, level = 1, skip = null) => {
  const ok = (a) => !(skip && skip.includes(a.st)) && (DAY33.unlock[a.st] || 99) <= Math.max(1, level | 0),
    out = [];
  for (let i = 0; i < 3; i++) out.push(TASKS33[((Math.max(1, day) - 1) * 3 + i) % TASKS33.length]);
  const base = TASKS33.filter((x) => x.st === 'wood' || x.st === 'kevesh');
  for (let i = 0; i < out.length; i++) {
    if (ok(out[i])) continue;
    const r = base.find((x) => !out.includes(x)) || base[(day + i) % base.length];
    out[i] = r;
  }
  return out;
};
/** ── fable32 (build 28) ── the ממונה's tasks of the day the player goes on with, for the lobby's full screen ("משימות הממונה — יום N";
 *  it always said "יום 1"): the saved day's own three with their marks, or — a day saved at night, or none — the next day's three, as the
 *  engine will set them (tasksForDay by the fire's level, the laver's task skipped as in the shipped day: build 20) → { day, tasks: [{ id, text,
 *  done }] } ── /fable32 ── */
export function tasksNow33(save, on35 = true) {
  const s = savedDay33(save),
    day = s ? resumeDay33(save) : 1,
    level = s ? levelIn(+s.fed || 0, B17.levels) : 1,
    marks = s && !s.night && Array.isArray(s.tasks) ? new Map(s.tasks.filter((x) => Array.isArray(x)).map(([id, done]) => [id, !!done])) : null;
  // ── fable32 (build 35) ── the morning's tasks are the work's (TASKS35): the saved day's own three with their marks, or the day's three
  // as the engine will set them; "תרגלת תפקיד בספר" and "בדקת טלה בלשכה" are marked the moment they are done from the opening screen ── /fable32 ──
  if (on35) {
    const ids = marks ? [...marks.keys()] : [],
      list = ids.length && ids.every((id) => TASKS35.some((q) => q.id === id)) ? ids.map((id) => TASKS35.find((q) => q.id === id)) : tasks35ForDay(day, save);
    return { day, tasks: list.map((q) => ({ id: q.id, text: q.text, goal: 1, done: !!(marks && marks.get(q.id)) || lobby35done(q.id, save, day) })) };
  }
  return { day, tasks: tasksForDay(day, level, ['kiyor']).map((q) => ({ id: q.id, text: q.text, goal: q.goal, done: !!(marks && marks.get(q.id)) })) };
}
/** ── fable32 (build 35) ── E1 of the work environment (docs/specs/svivat-avoda-he.md §3 and §9 item 1; the owner, 22.10 22:02: "האש לא
 *  במרכז. כל העבודה חשובה."): the fire goes to the background and the morning is measured by the work, not by a clock. With o.e35 (shift/
 *  index.js flags33: on unless __SH35_OFF; it needs b17) the morning has no fuel meter, no drain, no "האש דועכת" and no alarm, no 180/60
 *  day and night, no tamid countdown and no lateness, no feeding loop (the wood, the ramp's trips, the salt as chores, the stores, the
 *  old pen, the song, the merchant, the lost lamb); the code of that loop stays behind the flag, with no door to it. The fire always burns
 *  — "אש תמיד תוקד על המזבח לא תכבה" (ויקרא ו, ו) — and its look tells the morning: the maaracha's rating that morning (his, or the court's
 *  when the court did it — כשר) sets the flame's height and sparks: מהודר high and clean, כשר normal (and טעון תיקון — fixed by an elder
 *  kohen — normal too: never a penalty, never a meter). Before the morning's lot it is the night's fire; from the lot to the new pyre's
 *  lighting, the coals the ashes' role sweeps (trumat-hadeshen-he.md, maaracha-he.md — kept). The ramp run lives in the maaracha role: the
 *  logs carried up once, the stick's depth the speed, the right thumb's hold steadying the basket (R19). The morning ends when its built
 *  work is done — a calm close ("הבוקר הושלם": the court round the altar, the fire as it burns) and then the summary of the work. The
 *  ממונה's three tasks a day are about the work itself (TASKS35). ── /fable32 ── */
export const E35 = Object.freeze({
  close: 4.6,   // the close: 0.6 s to dark (the scene changes there), the altar's view, the calm line — then the summary
  fade: 0.6,
  look: Object.freeze({ night: 0.85, ember: 0.31, kasher: 1, mehudar: 1.45 }),   // __FIRE33 (life.js: 0.25 … 1.6; at 1.6 the pyre seen from beside it on the altar's top blooms over the frame)
  fuel: Object.freeze({ night: 70, ember: 8, kasher: 80, mehudar: 100 }),   // the same on the old 0…100 scale (fx18's crowd and choir; the pyre's woodpile)
  spark: Object.freeze({ kasher: 0, mehudar: 1 }),   // __FIRE35.sp: the sparks; .clean: the smoke white and thin
  cam: Object.freeze({ p: Object.freeze([-8, 43, 30]), t: Object.freeze([-32, 23, -2]), e: 40 }),   // the altar from the south-east, above: its fire, the ramp's top, the court east of it
  src: 'אש תמיד תוקד על המזבח לא תכבה — ויקרא ו, ו · טיוטה',
  taskEvery: 0.5,
});
/** ── fable32 (build 35) ── the ממונה's tasks (שקלים ה, א: the officers — המחשה): three a day, about the work itself — never a count of logs
 *  or salt; each pays DAY33.taskReward as before; none is lost or punished. "תפקיד שלא היה לך עד היום" only while the lots still have a role
 *  he never had; "תרגלת תפקיד בספר" once he has a role to practise; "בדקת טלה בלשכה" where the lamb chamber is built ── */
export const TASKS35 = Object.freeze([
  Object.freeze({ id: 'kiyorH', text: '💧 מהודר בכיור' }),
  Object.freeze({ id: 'prac', text: '🎭 תרגלת תפקיד בספר' }),
  Object.freeze({ id: 'roleH', text: '⭐ מהודר בתפקיד שלך' }),
  Object.freeze({ id: 'ch33', text: '🐑 בדקת טלה בלשכה' }),
  Object.freeze({ id: 'twoH', text: '✨ שתי עבודות מהודרות' }),
  Object.freeze({ id: 'fresh', text: '🆕 תפקיד שלא היה לך עד היום' }),
]);
/** the roles the lots can give (the built ones) */
const lotRoles35 = (on = {}) => [
  ...POOL23.filter((x) => x.built && (on.p25 !== false || x.id !== 'lamb')).map((x) => x.id),
  ...(on.p26 !== false ? POOL26.filter((x) => x.built && (on.p27 !== false || !blood27(x.id))).map((x) => x.id) : []),
];
/** what each task needs to be offered (the save as the day begins) */
function avail35(id, save, on = {}) {
  const rec = (save && save.roles23) || {};
  if (id === 'fresh') return lotRoles35(on).some((x) => !timesOf(rec, x));
  if (id === 'prac') return ['kiyor', ...lotRoles35(on)].some((x) => timesOf(rec, x) > 0);
  if (id === 'ch33') return on.p25 !== false;
  return true;
}
/** ── fable32 (build 35) ── the badges a morning of the work can earn (the mornings served); the rest were the old loop's ── */
export const BADGE35 = Object.freeze(['day3', 'day7', 'day33']);
/** the day's three (by the day's number, two places on each day — so no day has both of the opening screen's two; a task that cannot be
 *  offered gives its place to the next) */
export function tasks35ForDay(day, save, on = {}) {
  const N = TASKS35.length,
    out = [];
  for (let i = 0; out.length < 3 && i < N * 2; i++) {
    const q = TASKS35[((Math.max(1, day | 0) - 1) * 2 + i) % N];
    if (!out.includes(q) && avail35(q.id, save, on)) out.push(q);
  }
  return out;
}
/** the two done outside the morning (the opening screen's doors): marked with the game day they belong to (shift/index.js) */
const lobby35done = (id, save, day) => (id === 'prac' ? (save && save.prac35) === day : id === 'ch33' ? (save && save.ch35) === day : false);
const GAME_HE = { tiles: 'זיכרון המקדש', pen: 'הוצאת הטלה מהדיר', m3: 'משחק האוצר' };   // ── fable32 (build 14) ── ── /fable32 ──
const GAME_ICON = { tiles: '🃏', pen: '🐑', m3: '💎' };
const GAME_SUB = { tiles: 'קלפים מתהפכים', pen: 'פאזל הזזה', m3: 'שלושה בשורה' };
const say = (fn, ...a) => {
  try {
    return fn && fn(...a);
  } catch (e) {
    console.warn('[day33]', e && e.message);
    return;
  }
};
const pos3 = (p) => (p && Number.isFinite(p.x) ? { x: p.x, y: Number.isFinite(p.y) ? p.y : 16, z: p.z } : null);
// ── recovered (build 16) ── the saved day (save.day33state) and resumeDay33: the day to go on with, 0 = none (lobby35's start: "המשך יום
// N"; the name is the recovery's); levelIn: the fire's level by the logs fed and a level table
// ── fable32 (build 28) ── no expiry: a day saved 48 h or 30 days ago goes on as it was (until build 28 a day older than 24 h was gone — day 1,
// the fire at level 1, the stations locked). Only its shape is checked: an object with a day ≥ 1 ── /fable32 ──
const savedDay33 = (save) => {
  const s = save && save.day33state;
  return !s || typeof s !== 'object' || Array.isArray(s) || !(s.day >= 1) ? null : s;
};
export const resumeDay33 = (save) => {
  const s = savedDay33(save);
  return s ? (s.night ? (s.day | 0) + 1 : s.day | 0) : 0;
};
const levelIn = (fed, levels) => {
  let l = 1;
  for (let i = 1; i < levels.length; i++) if (fed >= levels[i]) l = i + 1;
  return Math.min(6, l);
};
export const levelOf33 = (fed) => levelIn(fed, DAY33.levels);
export function createDay33(o = {}) {
  // ── recovered (17–26c) ── the builds' flags (o.b17 … o.p26, each needs the one before it), the focused day's events (on17 → emit17)
  const S = o.world || null,
    T = o.twin || null,
    hud = o.hud || null,
    ST = o.stations || null,
    CAM = o.camera || null,
    view = o.view || null,
    STN = (ST && ST.STATIONS) || o.STATIONS || {},
    save = o.save || {},
    rng = o.rng || Math.random,
    sfx = (n, a) => {
      try {
        if (o.sfx && o.sfx.play) o.sfx.play(n, a);
      } catch (e) {}
    },
    b17 = !!o.b17,
    night17 = !b17 || (o.night != null ? !!o.night : globalThis.__SH_NIGHT === true ? true : B17.night),
    powerOn = !b17 || B17.power,
    levelFor = (a) => (b17 ? levelIn(a, B17.levels) : levelOf33(a)),
    l18 = b17 && !!(o.court18 || o.coins),
    c18 = l18 && !!o.coins,
    b19 = b17 && !!o.b19,
    g20 = b19 && !!o.g20,
    g21 = g20 && !!o.d21,
    g22 = g21 && !!o.m22,
    p23 = g22 && !!o.p23,
    p25 = p23 && !!o.p25,
    p26 = p23 && !!o.p26,
    p27 = p26 && !!o.p27,   // ── fable32 (build 27) ── ── /fable32 ──
    e35 = b17 && !!o.e35,   // ── fable32 (build 35) ── the morning measured by the work (E35; svivat-avoda-he.md §3) ── /fable32 ──
    // ── fable32 (build 31) ── a practice run (PRAC31): its role, its seed (the lamb's spots, the menorah's lamp gone out), the day and the
    // fire's level he goes on with (the court as he left it); only when the role's own build is on ── /fable32 ──
    prac = (() => {
      const P = o.practice,
        r = P && P.role,
        on = { kiyor: g20 && p23, deshen: g21 && p23, m22: g22 && p23, lamb: p25, inner: p26, menorah: p26, shochet: p27, zorek: p27 };
      return r && PRAC31.roles.includes(r) && on[r]
        ? { role: r, seed: (P.seed | 0) || 101, day: Math.max(2, P.day | 0), fed: Math.max(0, +P.fed || 0), end: null, done: null,
            // ── fable32 (build 33) ── the lamb chamber's run (shift/index.js runChamber33: lamb33.js — one lamb a day, by the day's seed, at
            // an easy level — the pen's first lamb, big; its places in Beit HaMoked, CH33; the real hour's sky; his lambs and the court's in
            // the stalls; done: today's lamb inspected — the stock only) ── /fable32 ──
            ch33: r === 'lamb' && P.ch33 && typeof P.ch33 === 'object' ? { dn: P.ch33.dn | 0, done: !!P.ch33.done, sky: P.ch33.sky || 'noon', lit: P.ch33.lit === 'night' ? 'night' : 'day', mine: Math.max(0, P.ch33.mine | 0), court: Math.max(0, P.ch33.court | 0), tags: Array.isArray(P.ch33.tags) ? P.ch33.tags.map((x) => x | 0) : [], next: P.ch33.next | 0, out: null } : null }
        : null;
    })(),
    // ── fable32 (build 33) ── the pen's places: the azara's pen (P25), or in the chamber's run the hall before the lamb chamber's door
    // (CH33: the same layout, so the pen's authored views read it the same) and the stall his lamb walks to (the next free one) ── /fable32 ──
    CH33P = prac && prac.ch33 ? Object.freeze({ ...P25, door: CH33.door, stand: CH33.stand, side: CH33.side, via: CH33.via, rings: stalls33(prac.ch33.mine, prac.ch33.court).next }) : null,
    pl25 = () => CH33P || P25,
    // ── fable32 (build 36) ── the level of an act (lvl36.js): his pick in the roles book, never above what is open (in a practice run the
    // same — the run's save is a copy of his); o.lv36 or globalThis.__LV36 — the tests' and the tools' override (a number for every role,
    // or { id: L }; the autoplayer's --level) ── /fable32 ──
    lvOf36 = (id) => {
      let f = o.lv36 != null ? o.lv36 : globalThis.__LV36 != null ? globalThis.__LV36 : null;
      if (f && typeof f === 'object') f = f[id];
      return f ? Math.max(1, Math.min(4, f | 0)) : lvl36(save, id);
    },
    act20 = K20.act,
    cam20 = K20.cam,
    subs17 = [],
    emit17 = (a, b = {}) => {
      if (!b17) return;
      const c = { type: a, t: Math.round(st.t * 100) / 100, ...b };
      for (const x of subs17)
        try {
          x(c);
        } catch (e) {
          console.warn('[day33] on17', e && e.message);
        }
    },
    st = {
      phase: 'opening',
      t: 0,
      day: 1,
      night: false,
      left: DAY33.dayS,
      fuel: DAY33.fuel0,
      fed: 0,
      level: 1,
      logs: 0,
      watched: true,
      torchAt: 0,
      torchOn: false,
      paused: false,
      best: +save.bestDay || 0,
      chops: 0,
      worms: 0,
      carried: 0,
      lastMsg: '',
      washed: false,
      power: DAY33.power0,
      oil: 0,
      flour: 0,
      salt: 0,
      bread: 0,
      baked: 0,
      opened: {},
      px: NaN,
      pz: NaN,
      perutot: +save.perutot || 0,
      dayStats: {},
      tasks: [],
      merchant: null,
      merchantSeen: 0,
      basketMax: DAY33.basket,
      axeTaps: DAY33.taps,
      axeK: 1,
      breadPower: DAY33.bread,
      lambs: Array.from({ length: 6 }, (_, i) => ({ i, ok: false })),
      lost: null,
      lostDay: 0,
      tamids: 0,
      song: null,
      songs: 0,
      inMoked: false,
      lostBack: 0,
      watches: 0,
      trades: 0,
      badges: {},
      claimed: {},
      ended33: false,
      basketQ: [],
      bookNight: 0,
      stuckT: 0,
      saveT: 0,
    };
  {
    const cl = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {};
    for (const k in cl) st.claimed[k] = 1;
  }
  {
    const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : {};
    if (own.axe) {
      st.axeTaps = 2;
      st.axeK = DAY33.axeK;
    }
    if (own.basket20) st.basketMax = 20;
    else if (own.basket10) st.basketMax = 10;
    if (own.bowl) st.breadPower = 90;
  }
  // ── recovered (build 16) ── the day saved and resumed (save.day33state: these keys, the lambs, the badges, the tasks)
  const kept33 = [
    'day',
    'fed',
    'level',
    'logs',
    'fuel',
    'perutot',
    'chops',
    'worms',
    'carried',
    'baked',
    'songs',
    'lostBack',
    'watches',
    'trades',
    'tamids',
    'oil',
    'flour',
    'salt',
    'bread',
    'power',
    'washed',
    'left',
    'basketQ',
    'dayStats',
    'merchantSeen',
    'tamD',
    'tamE',
    'rampBest',
    'laidDay',
    'pDay0',
    'sDay0',
    'lowDay',
    'lateDay',
    'earnD',
    'ndDay',
    'ch18',
    'r19',
    'd21day',
    'd21r',
    'm22day',
    'm22r',
    'm22c',
    'p23day',
    'lot',
    'npc23',
    'p25day',
    'p25r',
    'p26day',
    'role26',
    'g26day',
    'g26t',
    'r26day',
    'r26r',
    'men5t',
    'r30day',   // ── fable32 (build 30) ── (the day's ratings, for its summary) ── /fable32 ──
    'l36day',   // ── fable32 (build 36) ── (the day's acts with their levels: "בוקר מהודר" across a resumed morning) ── /fable32 ──
    'fire35',   // ── fable32 (build 35) ── (the morning's maaracha: the fire's look — 'mehudar' | 'kasher' — and its day) ── /fable32 ──
    'f35day',
    'fresh35',
  ];
  Object.assign(st, {
    tamD: 'wait',
    tamE: 'wait',
    rampBest: 0,
    laidDay: 0,
    pDay0: st.perutot,
    sDay0: 0,
    lowDay: 100,
    lateDay: 0,
    streak: 0,
    trip: null,
    summary: null,
    dayT: 0,
  });
  Object.assign(st, { earnD: 0, ndDay: 0, ch18: { n: 0, t: 0, c: [], k: 0, walk: null }, pad18: null, buys18: [] });
  Object.assign(st, { r30day: [], l36day: [], end30: null, say30: null });   // ── fable32 (build 30) ── the day's ratings; the end's word; a word of feedback ── /fable32 ──
  Object.assign(st, { fire35: null, f35day: 0, fresh35: 0, close35: null, task35T: 0 });   // ── fable32 (build 35) ── the fire's look, a first role's day, the close ── /fable32 ──
  if (b19) st.r19 = { g: [], gd: 0, n: 0, cov: 0, sd: 0, bag: 0, bm: 0, bags: 0, fl: [], rn: 0, slips: 0, picks: 0 };
  if (b17) st.fuel = B17.fuel0;
  st.resumed = 0;
  {
    const was = prac ? null : savedDay33(save);   // ── fable32 (build 31) ── (a practice run never reads — or writes — the saved day) ── /fable32 ──
    if (was) {
      for (const k of kept33)
        if (was[k] !== undefined && was[k] !== null)
          st[k] = Array.isArray(was[k]) ? was[k].slice() : typeof was[k] === 'object' ? { ...was[k] } : was[k];
      st.level = levelFor(st.fed);
      if (Array.isArray(was.lambs))
        st.lambs.forEach((x, i) => {
          x.ok = !!was.lambs[i];
        });
      if (was.badges) for (const k in was.badges) st.badges[k] = 1;
      if (was.night) {
        st.day = (was.day | 0) + 1;
        st.left = DAY33.dayS;
        st.washed = false;
        st.logs = 0;
        st.basketQ = [];
        st.dayStats = {};
        st.r30day = [];   // ── fable32 (build 30) ── ── /fable32 ──
        st.l36day = [];
      }
      if (!Array.isArray(st.r30day)) st.r30day = [];
      if (!Array.isArray(st.l36day)) st.l36day = [];
      // ── fable32 (build 35) ── an older save's day goes on in the morning of the work: what it held of the old loop — logs in the basket
      // (the pyre's carry starts again with its act), the tamids' states, the day's clock, its "late" — is let go; its saved fuel is not
      // the fire (the fire's look is the morning's own: fire35) ── /fable32 ──
      if (e35) Object.assign(st, { logs: 0, basketQ: [], m22c: 0, tamD: 'wait', tamE: 'wait', lateDay: 0, left: DAY33.dayS, laidDay: 0 });
      if (e35 && st.f35day !== st.day) st.fire35 = null;
      // ── fable32 (build 34) ── the saved moments are the old clock's — st.t starts again at 0 — so the gate's time and the five lamps'
      // (the zorek's first gift waits for them: "הטבת חמש נרות קודם לדם התמיד") are past: a day resumed (a reload, "מהתחלה", the next
      // visit) after the gate opened held the zorek at "מרסו — חמש נרות קודם" until the new clock reached the old one — minutes (the naive kid's
      // run: 129 s and more, the scripted bot too) ── /fable32 ──
      if (Number.isFinite(st.men5t)) st.men5t = Math.min(st.men5t, 0);
      if (Number.isFinite(st.g26t)) st.g26t = Math.min(st.g26t, -60);
      st.left = Math.min(DAY33.dayS, Math.max(20, +st.left || DAY33.dayS));
      st.resumed = st.day;
      st.resumeTasks = Array.isArray(was.tasks) ? was.tasks : null;
      if (was.night) st.resumeTasks = null;
    }
  }
  // ── fable32 (build 30) ── "שימשת N בקרים": a save from before build 30 gets its count once, at the day's start — the second lots it held
  // (served30's fallback), less today's if the lot was held and its role not yet done (then that morning counts when it is: morning30) ── /fable32 ──
  if (save.served30 == null && !prac) save.served30 = Math.max(0, served30(save) - (p26 && st.p26day === st.day && st.r26day !== st.day && (save.roles26 && save.roles26.m) > 0 ? 1 : 0));
  // ── fable32 (build 32) ── the kohen's journal, made once at the day's start (journal32's jr32): an older save's roles had, the laver had,
  // the lots held count as met — before any act of today adds to a record (so a role's first time is still its first) ── /fable32 ──
  if (!prac) jr32(save);
  migrate36(save);   // ── fable32 (build 36) ── (an older save's roles made level-aware once: their counts are level 1's, their points from them, their titles kept) ── /fable32 ──
  // ── fable32 (build 31) ── a practice run's morning: everything of the morning done but his role (the gates as after the lot — p23done's
  // and the second lot's — for that role), the court's kohanim at the other parts as on a day with that lot (npc23: the pyre's wood or the
  // ashes' pan; npc25: the court's lamb), the fire as the day has it then (the laver: the day's start; the pre-dawn roles: the embers; the
  // second lot's: rekindled), no tasks, no "33 days" end; the court's level as he left it (prac.fed) ── /fable32 ──
  if (prac) {
    const d = (st.day = prac.day),
      r = prac.role,
      second = !PRAC31.first.includes(r) && r !== 'kiyor';
    st.fed = prac.fed;
    st.level = levelFor(st.fed);
    st.washed = r !== 'kiyor';
    Object.assign(st, { p23day: d, d21day: d, m22day: d, p25day: d, p26day: d, r26day: d, g26day: 0, lot: 'deshen', npc23: null, npc25: d, ended33: true, tasks: [] });
    if (r === 'deshen') Object.assign(st, { d21day: 0, m22day: 0, npc23: 'm22' });
    else if (r === 'm22') Object.assign(st, { lot: 'm22', m22day: 0, npc23: 'deshen' });
    else if (r === 'lamb') Object.assign(st, { lot: 'lamb', p25day: 0, m22day: 0, npc23: 'm22', npc25: 0 });
    else if (second) Object.assign(st, { role26: r, r26day: 0, l26t: PRAC31.gate27 - P27.gateNpc });
    st.fuel = r === 'kiyor' ? (b17 ? B17.fuel0 : DAY33.fuel0) : second ? P23.fire : M22.ember;
    if (r !== 'lamb' && r !== 'kiyor' && p25 && st.lambs[0]) st.lambs[0].ok = true;   // (the court's lamb, checked: lambIn)
    if (prac.ch33 && prac.ch33.done) st.p25day = d;   // ── fable32 (build 33) ── (today's lamb already inspected: the chamber shows its stock, no lamb comes) ── /fable32 ──
    if (prac.ch33) st.fuel = 80;   // ── fable32 (build 33) ── (the chamber is not the altar: its fire is not his there — no warning, no alarm; its meter is hidden) ── /fable32 ──
    if (e35) Object.assign(st, { fire35: second || prac.ch33 ? 'kasher' : null, f35day: second || prac.ch33 ? d : 0 });   // ── fable32 (build 35) ── (a second lot's role, the chamber: the court's pyre burns) ── /fable32 ──
  }
  if (!powerOn) st.power = DAY33.power0;
  if (b19)
    Object.assign(st.r19, { acc: 0, sc: 0, gr: [], A: 0, ph: 0, sw: 0, sp: 0, slip: -9, run: null, arm: 0, gt: -1, gp: null, lane: 0, lt: -9 });
  if (b19 && e35) st.r19.fl = [];   // ── fable32 (build 35) ── (no log of the old trips lies on the ramp) ── /fable32 ──
  {
    const was = prac ? null : savedDay33(save);
    if (b17 && was && was.night)
      Object.assign(st, { tamD: 'wait', tamE: 'wait', rampBest: 0, laidDay: 0, lowDay: 100, lateDay: 0, pDay0: st.perutot, earnD: 0 });
  }
  {
    const ch = st.ch18;
    st.ch18 = { n: Math.min(C18.chests.max, ch.n | 0), t: 0, c: Array.isArray(ch.c) ? ch.c.slice(0, C18.chests.max) : [], k: ch.k | 0, walk: null };
  }
  let acting = null,
    ended = false,
    raf = 0,
    lastMs = 0,
    goal = null,
    hintNow = null,
    L0 = null,
    log = [];
  L0 = (...a) => {
    log.push([Math.round(st.t * 10) / 10, ...a]);
    if (log.length > 120) log.shift();
  };
  let ends = [],
    hp = { x: 0, y: 16, z: 0 },
    heroP = () => {
      try {
        if (o.heroPos) return o.heroPos();
        if (S && S.heroXYZ) S.heroXYZ(hp);
      } catch (e) {}
      return hp;
    },
    drive = (vx, vz) => {
      try {
        if (S && S.hero) S.hero.drive(vx, vz);
      } catch (e) {}
    },
    standOf = (id) => {
      if (id === 'chests') return { x: chests.x - 2, y: 16, z: chests.z0 + ((chests.n - 1) * chests.dz) / 2 };
      if (id === 'pad') {
        const a = padOpen();
        return a ? { x: a.x, y: 16, z: a.z } : null;
      }
      if (id === 'deshen') {
        const h = heroP(),
          d21 = st.d21;
        return d21 && (d21.ph === 'foot' || d21.ph === 'go')
          ? { x: D21.go[2][0], y: 16, z: D21.go[2][1] }
          : onHigh(h.x, h.z)
            ? { x: D21.stand.x, y: 25, z: D21.stand.z }
            : Math.hypot(D21.up[0][0] - h.x, D21.up[0][1] - h.z) < 3.5
              ? { x: D21.up[1][0], y: 25, z: D21.up[1][1] }
              : { x: D21.up[0][0], y: 16, z: D21.up[0][1] };
      }
      if (id === 'm22') {
        const h = heroP();
        return st.m22
          ? onHigh(h.x, h.z)
            ? { x: M22.stand.x, y: 25, z: M22.stand.z }
            : Math.hypot(-34 - h.x, 44.6 - h.z) < 3.5
              ? { x: -34, y: 25, z: 11.6 }
              : { x: -34, y: 16, z: 44.6 }
          : { x: STN.wood.stand.x, y: 16, z: STN.wood.stand.z };
      }
      if (id === 'saltR' || id === 'log19') {
        const a = near19(heroP()),
          b = st.r19.fl[0];
        return a && id === 'log19' && b ? { x: b.x, y: rampY19(b.z), z: b.z } : { x: -34, y: a ? 25 : 16, z: a ? 11.5 : 44 };
      }
      const s = STN[id];
      return s ? { x: s.stand.x, y: (s.at && s.at.y) || 16, z: s.stand.z } : null;
    },
    project = (p) => {
      if (!p || !view || !view.project) return null;
      try {
        const q = view.project(p.x, p.y, p.z);
        return q && q.on !== false ? { x: q.x, y: q.y } : null;
      } catch (e) {
        return null;
      }
    },
    stamp = (t, kind = 'info') => {
      if (t !== st.lastMsg) {
        st.lastMsg = t;
        say(() => hud && hud.stamp(t, { kind }));
      }
    },
    fadeEl = null;
  /* ───────── build 10: the fade and the move (the night in בית המוקד) ───────── */
  function fade(then, text) {
    const doc = typeof document < 'u' ? document : null;
    if (!doc) {
      if (then) then();
      return;
    }
    if (!fadeEl) {
      fadeEl = doc.createElement('div');
      fadeEl.className = 'd33-fade';
      fadeEl.style.cssText =
        'position:fixed;inset:0;z-index:40;background:#07050A;opacity:0;transition:opacity .55s;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#FFF4DC;font:900 22px/1.3 "Heebo",system-ui,sans-serif;direction:rtl;text-align:center;padding:0 24px';
      doc.body.appendChild(fadeEl);
    }
    fadeEl.textContent = text || '';
    fadeEl.style.pointerEvents = 'auto';
    fadeEl.style.opacity = '1';
    setTimeout(() => {
      try {
        if (then) then();
      } catch (e) {}
      setTimeout(() => {
        if (fadeEl) {
          fadeEl.style.opacity = '0';
          fadeEl.style.pointerEvents = 'none';
        }
      }, 900);
    }, 600);
  }
  const moveHero = (x, z, yaw) => {
      try {
        if (S && S.hero && S.hero.setPos) S.hero.setPos(x, z, yaw);
      } catch (e) {}
      st.px = x;
      st.pz = z;
    },
    /* ───────── the court opens by level (build 7) ───────── */
    open33 = (id) => (b19 && id === 'salt') || (g20 && id === 'kiyor') || (DAY33.unlock[id] || 99) <= st.level,
    // ── recovered (20–26) ── the morning's gates: while one is open the clock, the fire and the other stations wait (gate20: the laver;
    // gate21: תרומת הדשן; gate22: סידור המערכה; gate23: the lot; gate25: the lamb; gate26L/gate26: the second lot and his inner role)
    gate20 = () => g20 && !st.washed && !st.night && st.phase === 'run';
  function gate20no(id) {
    L0('gate', id);
    emit17('gate', { id });
    return false;
  }
  const gate21 = () => g21 && st.washed && (!p23 || st.p23day === st.day) && st.d21day !== st.day && !st.night && st.phase === 'run',
    gate22 = () => g22 && st.washed && st.d21day === st.day && st.m22day !== st.day && !st.night && st.phase === 'run' && !lambDay25(),
    lambDay25 = () => p25 && st.p23day === st.day && st.lot === 'lamb',
    gate25 = () => p25 && st.washed && lambDay25() && st.p25day !== st.day && !st.night && st.phase === 'run',
    carry22 = () => !!(st.m22 && st.m22.ph === 'carry'),
    gate23 = () => p23 && st.washed && st.p23day !== st.day && !st.night && st.phase === 'run',
    roles23 = () => (save.roles23 && typeof save.roles23 === 'object' ? save.roles23 : (save.roles23 = { m: 0, h: [] })),
    first21 = () => (p23 ? !timesOf(roles23(), 'deshen') : st.day === 1),
    first22 = () => (p23 ? !timesOf(roles23(), 'm22') : st.day === 1),
    need22 = () => (p23 ? P23.need : M22.need),
    d21k = (a) => (p23 ? P23.d21[a] : D21[a]),
    lotOn = () => !!st.p23,
    // ── fable32 (build 26) ── the second lot (gate26L) and his inner role (gate26): after the pre-dawn task, still the morning — the clock, the fire, the stations wait ── /fable32 ──
    pre26 = () => p26 && st.washed && st.p23day === st.day && !gate21() && !gate22() && !gate25() && !st.night && st.phase === 'run',
    gate26L = () => pre26() && st.p26day !== st.day,
    gate26 = () => pre26() && st.p26day === st.day && st.r26day !== st.day && !blood27(st.role26),   // ── fable32 (build 27) ── (his inner role only) ── /fable32 ──
    gate27 = () => p27 && pre26() && st.p26day === st.day && st.r26day !== st.day && blood27(st.role26),   // ── fable32 (build 27) ── (his blood role) ── /fable32 ──
    on27 = () => !!(st.r27 && st.r27.ph !== 'out'),
    act27 = () => !!(st.r27 && !/^(carry|carry2|out)$/.test(st.r27.ph)),
    open26 = () => p26 && st.g26day === st.day,
    gateAny = () => gate20() || gate23() || gate21() || gate22() || gate25() || gate26L() || gate26() || gate27();   // ── fable32 (build 25) ── ── /fable32 ── ── fable32 (build 26) ── ── /fable32 ──
  function gate26no(id) {   // ── fable32 (build 26) ── ── /fable32 ──
    L0('gate26', id);
    emit17('gate', { id, p26: true });
    return false;
  }
  function gate25no(id) {
    L0('gate25', id);
    emit17('gate', { id, p25: true });
    return false;
  }
  function gate21no(id) {
    L0('gate21', id);
    emit17('gate', { id, d21: true });
    return false;
  }
  function gate22no(id) {
    L0('gate22', id);
    emit17('gate', { id, m22: true });
    return false;
  }
  function gate23no(id) {
    L0('gate23', id);
    emit17('gate', { id, p23: true });
    return false;
  }
  // ── fable32 (build 35) ── (the morning of the work: the old loop's stations — the wood's timing act, the ramp's trips, the stores, the
  // bakers, the old pen, the song — have no chip and no door; the salt chamber stays, its bag salting the ramp — tied to the ramp as it was) ── /fable32 ──
  const shown33 = () => (e35 ? ['salt'] : Object.keys(DAY33.unlock)).filter(open33);
  function unlockStep() {
    for (const id of shown33())
      if (!st.opened[id]) {
        st.opened[id] = 1;
        if (st.level > 1 && STN[id]) {
          setTimeout(() => stamp(`נפתח: ${STN[id].he}`, 'combo'), 1500);
          L0('open', id);
        }
      }
  }
  const tired = () => powerOn && st.power < DAY33.powerLow,
    /** can he use the station now? (a full basket at the wood, an empty one at the ramp, a washed morning, a bowl without its three — the prompt does not show) */
    usable = (id) =>
      id === 'song'
        ? !!st.song
        : id === 'pen'
          ? st.lambs.some((q) => !q.ok)
          : id === 'wood'
            ? st.logs < st.basketMax
            : id === 'oil'
              ? st.oil < DAY33.storeMax
              : id === 'salt'
                ? b19
                  ? st.r19.bag < 110 || st.salt <= 0
                  : st.salt < DAY33.storeMax
                : id === 'kevesh'
                  ? st.logs > 0 && !atTop(heroP())
                  : id === 'kiyor'
                    ? !st.washed
                    : id === 'bake'
                      ? st.oil > 0 && st.flour > 0 && st.salt > 0
                      : true,
    /* ───────── the economy (build 8) ───────── */
    stat = (k, n = 1) => {
      st.dayStats[k] = (st.dayStats[k] | 0) + n;
      taskStep();
    };
  function pay(n, why, at) {
    if (prac) return L0('pay31', 0, why);   // ── fable32 (build 31) ── (a practice run pays no coins — קופת המקדש is the day's) ── /fable32 ──
    st.perutot += n;
    save.perutot = st.perutot;
    say(() => o.persist && o.persist());
    L0('pay', n, why);
    if (n > 0) {
      st.earnD += n;
      if (c18) emit17('coins', { n, why, at: at || null });
    }
  }
  const over = (id, up = 2.6) => {
      const s = STN[id];
      return s && s.at ? { x: s.at.x, y: (s.at.y || 16) + up, z: s.at.z } : null;
    },
    payAct = (g, why, at) => {
      if (c18) {
        const n = C18.pay[g] | 0;
        if (n > 0) pay(n, why, at);
      }
    };
  // ── fable32 (build 28) ── the gift at a fixed moment: once a day, when the day's clock reaches C18.nedavaAt (dayStep calls it every
  // tick) — no rng (it was rng() < 0.3 at a gold streak or a tamid on time, from 20 s) ── /fable32 ──
  function nedavaStep() {
    if (!c18 || st.ndDay === st.day || st.night || st.summary || st.dayT < C18.nedavaAt) return;
    st.ndDay = st.day;
    const C = C18.chests;
    emit17('nedava');
    pay(C18.nedava, 'nedava', { x: C.x - 1.5, y: 19, z: C.z0 - 3 });
    L0('nedava');
  }
  // ── fable32 (build 14) ── the one score (score35.js: Phase A's master score — the capsule reads the same in both phases); the gear he carries (flow31 draws it);
  // the flights (a log into the basket, the logs onto the pyre); the idle offer (nothing to do 12 s → "משחק קצר?") — ── fable32 (build 28) ── gone from the
  // day: the interludes open from the lobby's start screen only (the owner, 22.10 09:19: "משחק קצר? — רק ממסך הפתיחה") ── /fable32 ──
  const SC = o.score || null,
    score = (n, why) => {
      if (!SC || !(n > 0)) return;
      try {
        SC.add(n, why);
      } catch (e) {}
      L0('score', n, why);
    },
    scoreAct = (id, r) => {
      if (SC)
        try {
          const g = r && r.gold ? 'gold' : r && r.quality >= 0.8 ? 'good' : 'ok',
            n = SC.grade(g);
          SC.add(n, 'act:' + id);
          L0('score', n, g);
        } catch (e) {}
    };
  st.fx = [];
  const fx = (kind, from, to, n = 1) => {
      st.fx.push({
        kind,
        from: { ...from },
        to: to ? { ...to } : null,
        n,
        t: 0,
        dur: kind === 'unload' ? 0.9 : kind === 'lay1' ? DAY33.layS : 0.6,
        arc: kind === 'lay1' ? 0.9 : 2.2,
      });
      if (st.fx.length > 8) st.fx.shift();
    },
    fxStep = (dt) => {
      for (const f of st.fx) f.t += dt;
      st.fx = st.fx.filter((f) => f.t < f.dur);
    };
  // ── /fable32 ──
  function newTasks() {
    st.dayStats = {};
    st.tasks = e35
      ? tasks35ForDay(st.day, save, { p25, p26, p27 }).map((q) => ({ ...q, key: q.id, goal: 1, done: false }))   // ── fable32 (build 35) ── (the work's tasks) ── /fable32 ──
      : tasksForDay(st.day, st.level, g20 ? ['kiyor'] : null).map((q) => ({ ...q, done: false }));
  }
  // ── fable32 (build 35) ── the work's tasks (TASKS35): each read off the morning itself — the day's ratings (st.r30day), a role's first
  // real morning (st.fresh35), and the two the opening screen's doors mark (save.prac35, save.ch35: the game day they belong to) ── /fable32 ──
  function done35(id) {
    const r = Array.isArray(st.r30day) ? st.r30day : [],
      mine = [p23 && st.p23day === st.day ? st.lot : null, p26 && st.p26day === st.day ? st.role26 : null].filter(Boolean);
    if (id === 'kiyorH') return r.some(([a, b]) => a === 'kiyor' && b === 'mehudar');
    if (id === 'roleH') return r.some(([a, b]) => b === 'mehudar' && mine.includes(a));
    if (id === 'twoH') return r.filter(([, b]) => b === 'mehudar').length >= 2;
    if (id === 'fresh') return st.fresh35 === st.day;
    return lobby35done(id, save, st.day);
  }
  function taskStep35() {
    for (const q of st.tasks)
      if (!q.done && done35(q.id)) {
        q.done = true;
        pay(DAY33.taskReward, q.id);
        score(DAYSCORE.task, 'task');
        emit17('task', { text: q.text, pay: DAY33.taskReward, id: q.id });
        sfx('coin');
        L0('task', q.id);
        evlog('task35', q.id);
      }
  }
  function saveState(why) {
    if (prac) return;   // ── fable32 (build 31) ── (a practice run: the saved day is the real day's, untouched — "המשך יום N" stays where it was) ── /fable32 ──
    const out = {};
    for (const k of kept33) out[k] = Array.isArray(st[k]) ? st[k].slice() : st[k] && typeof st[k] === 'object' ? { ...st[k] } : st[k];
    out.lambs = st.lambs.map((x) => !!x.ok);
    out.badges = { ...st.badges };
    out.night = !!st.night || !!st.summary;
    out.tasks = st.tasks.map((x) => [x.id, !!x.done]);
    out.at = Date.now();
    out.why = why;
    save.day33state = out;
    say(() => o.persist && o.persist());
  }
  function taskStep() {
    if (e35) return taskStep35();   // ── fable32 (build 35) ── ── /fable32 ──
    for (const q of st.tasks)
      if (!q.done && (st.dayStats[q.key] | 0) >= q.goal) {
        q.done = true;
        pay(DAY33.taskReward, q.id);
        score(DAYSCORE.task, 'task');
        if (b17) emit17('task', { text: q.text, pay: DAY33.taskReward });
        else stamp(`משימת הממונה: ${q.text.replace(/^\S+\s/, '')} ✓ +${DAY33.taskReward} פרוטות`, 'combo');
        sfx('coin');
        L0('task', q.id);
      }
  }
  let merchantPin = null;
  function merchantStep() {
    if (st.night && st.merchant) {
      st.merchant = null;
      stamp('הסוחר הלך לישון', 'info');
    }
    if (st.merchant && !merchantPin && hud && hud.pin) merchantPin = say(() => hud.pin('merchant33', { icon: '🧺', label: 'הסוחר' })) || null;
    if (!st.merchant && merchantPin) {
      say(() => merchantPin.close());
      merchantPin = null;
    }
    if (merchantPin) {
      const m = DAY33.merchantAt;
      say(() => merchantPin.at(project({ x: m.x, y: m.y + 5, z: m.z }), st.bread > 0));
    }
    if (!st.night) {
      if (
        !st.merchant &&
        !gateAny() &&
        st.merchantSeen < st.day &&
        (st.day === DAY33.merchantDay || (st.day > DAY33.merchantDay && st.merchantRoll))
      ) {
        st.merchantSeen = st.day;
        st.merchant = { until: st.t + DAY33.merchantS, want: 'bread' };
        stamp('סוחר בשער! מבקש כיכר לחם — ונותן לבחור אחת משלוש', 'combo');
        sfx('chime');
        L0('merchant');
      }
      if (st.merchant && !st.merchant.warned && st.merchant.until - st.t <= DAY33.merchantWarn) {
        st.merchant.warned = true;
        stamp(`הסוחר עוזב בעוד ${DAY33.merchantWarn} שניות`, 'no');
        sfx('tick');
        L0('merchant-warn');
      }
      if (st.merchant && st.t >= st.merchant.until) {
        st.merchant = null;
        stamp('הסוחר המשיך בדרכו', 'info');
        L0('merchant-gone');
      }
      SHARED.merchant33 = st.merchant ? { ...DAY33.merchantAt, want: st.merchant.want } : null;
    }
  }
  function trade() {
    if (!st.merchant || !hud || !hud.choice) return false;
    if (st.bread <= 0) {
      stamp('הסוחר מבקש כיכר לחם — אין לכם', 'no');
      sfx('miss');
      return false;
    }
    const wares = [
      {
        icon: '🧺',
        label: 'טנא גדול',
        sub: '10 גזרים בסל',
        go: () => {
          st.bread--;
          st.basketMax = Math.max(st.basketMax, 10);
          stamp('טנא גדול — 10 בסל', 'combo');
        },
      },
      {
        icon: '🪓',
        label: 'גרזן טוב',
        sub: 'חלון רחב לבקיעה',
        go: () => {
          st.bread--;
          st.axeTaps = Math.min(st.axeTaps, 2);
          st.axeK = DAY33.axeK;
          stamp('גרזן טוב — הטבעת סלחנית יותר', 'combo');
        },
      },
      {
        icon: '🪙',
        label: '12 פרוטות',
        sub: 'לחנות',
        go: () => {
          st.bread--;
          pay(12, 'merchant');
          stamp('+12 פרוטות', 'combo');
        },
      },
    ];
    st.paused = true;
    sfx('ui');
    say(() =>
      hud.choice({
        title: 'הסוחר בשער',
        text: 'הוא לוקח כיכר אחת ונותן אחת משלוש (כמו סוחר הפרוות — ⚑ המחשה)',
        items: wares.map((w) => ({
          ...w,
          go: () => {
            w.go();
            st.merchant = null;
            st.trades++;
            sfx('coin');
            L0('trade', w.label);
            return true;
          },
        })),
        closeLabel: 'לא עכשיו',
        onClose: () => {
          st.paused = false;
        },
      }),
    );
    return true;
  }
  /* ───────── the lambs (build 9): six in the pen, inspected on the beat (ערכין ב, ה); a tamid at dawn and dusk takes one; a lost lamb from level 2 ───────── */
  const okLambs = () => st.lambs.filter((l) => l.ok).length;
  function tamid(when) {
    const l = st.lambs.find((q) => q.ok);
    if (l) {
      l.ok = false;
      st.tamids++;
      st.fuel = Math.min(100, st.fuel + DAY33.tamidFuel);
      stamp(`תמיד של ${when} — טלה מבוקר למזבח (+${DAY33.tamidFuel} אש)`, 'combo');
      sfx('fanfare');
      L0('tamid', when);
    } else if (open33('pen')) {
      st.fuel = Math.max(DAY33.floor, st.fuel - DAY33.tamidMiss);
      stamp(`תמיד של ${when} — אין טלה מבוקר! (−${DAY33.tamidMiss} אש)`, 'no');
      sfx('miss');
      L0('tamid-miss', when);
    }
  }
  function lostStep() {
    const ok =
      o.walkable ||
      ((a, b) => {
        if (!free(a, b) || onHigh(a, b) || a < -54 || a > -12 || b < -60 || b > 62) return false;
        try {
          if (S && S.hero && typeof S.hero.reach === 'function') {
            const c = S.hero.reach(-20, 20, a, b, 600);
            return c && c.d < 2.5;
          }
        } catch (e) {}
        return true;
      });
    for (let i = 0; i < 20; i++) {
      const a = rng() * Math.PI * 2,
        b = 22 + rng() * 10,
        c = -38 + Math.cos(a) * b,
        d = 20 + Math.sin(a) * b;
      if (ok(c, d)) return { x: c, z: d };
    }
    return null;
  }
  const lostFree = (a, b) => {
    try {
      return free(a, b) && !onHigh(a, b);
    } catch (e) {
      return true;
    }
  };
  function lostTick(dt) {
    if (!st.lost) {
      if (open33('pen') && st.lostDay < st.day && !st.night && st.left < DAY33.dayS - 25 && rng() < 0.02 * dt * 10) {
        st.lostDay = st.day;
        const a = lostStep();
        if (a) {
          st.lost = { x: a.x, z: a.z, yaw: rng() * 6.28, t: 0, follow: false };
          stamp('🐑 טלה ברח מהדיר! הביאו אותו חזרה', 'no');
          sfx('tick');
          L0('lost', Math.round(a.x), Math.round(a.z));
        } else L0('lost-nospot');
      }
      return;
    }
    const Lm = st.lost;
    Lm.t += dt;
    const h = STN.pen.at,
      stand = STN.pen.stand;
    if (Lm.home) {
      const dx = h.x - Lm.x,
        dz = h.z - Lm.z,
        d = Math.hypot(dx, dz);
      if (d > 1.2) {
        Lm.x += (dx / d) * Math.min(d, 12 * dt);
        Lm.z += (dz / d) * Math.min(d, 12 * dt);
        Lm.yaw = Math.atan2(dx, dz);
        Lm.walk = true;
      } else {
        st.lost = null;
        const free = st.lambs.find((q) => !q.ok);
        if (free) free.ok = true;
        st.lostBack++;
        score(DAYSCORE.lostLamb, 'lamb');
        pay(DAY33.lostReward, 'lamb', over('pen'));
        stamp(`הטלה הושב לדיר — מבוקר! +${DAY33.lostReward} פרוטות`, 'combo');
        sfx('fanfare');
        L0('lost-back');
        evlog('lamb_back');
        if (b17) stat('v_lamb');
        emit17('done', { text: 'הטלה בדיר!', sub: `+${DAY33.lostReward} פרוטות` });
      }
    } else if (Lm.follow) {
      const hp = heroP(),
        a = hp.x - Lm.x,
        b = hp.z - Lm.z,
        d = Math.hypot(a, b);
      if (d > 2.2) {
        const k = Math.min(14, d * 2.5);
        Lm.x += (a / d) * k * dt;
        Lm.z += (b / d) * k * dt;
        Lm.yaw = Math.atan2(a, b);
        Lm.walk = true;
      } else Lm.walk = false;
      if (d <= 9 && (Math.hypot(stand.x - hp.x, stand.z - hp.z) <= DAY33.reach + 2 || Math.hypot(h.x - hp.x, h.z - hp.z) <= 5)) {
        Lm.home = true;
        Lm.follow = false;
        stamp('הטלה נכנס לדיר…', 'info');
        L0('lost-home');
      }
    } else {
      Lm.yaw += (rng() - 0.5) * dt * 2;
      const sp = 1.6,
        a = Lm.x + Math.sin(Lm.yaw) * sp * dt,
        b = Lm.z + Math.cos(Lm.yaw) * sp * dt;
      if (lostFree(a, b)) {
        Lm.x = a;
        Lm.z = b;
        Lm.walk = true;
      } else {
        Lm.yaw += Math.PI * (0.75 + rng() * 0.5);
        Lm.walk = false;
      }
      if (Lm.x < -52 || Lm.x > -14) Lm.yaw += Math.PI;
      if (Lm.z < -18 || Lm.z > 48) Lm.yaw += Math.PI;
    }
    SHARED.lost33 = Lm;
  }
  /* ───────── build 11: the badges (earned by play; claimed at night in the Moked) and the 33rd day ───────── */
  function badgeStep() {
    for (const b of BADGES33)
      if (!st.badges[b.id] && (!e35 || BADGE35.includes(b.id)) && b.test(st)) {   // ── fable32 (build 35) ── (BADGE35: the old loop's — the logs, the fire's levels, the bread, the six lambs, the lost lamb, the song, the watch, the merchant — are not earned in the morning of the work) ── /fable32 ──
        st.badges[b.id] = 1;
        score(DAYSCORE.badge, 'badge');
        if (b17 && !night17) emit17('pop', { text: `📜 ${b.text}` });
        else stamp(`ספר הזכרונות: ${b.text} — לקבל בלילה בבית המוקד`, 'combo');
        sfx('chime');
        L0('badge', b.id);
      }
  }
  const unclaimed = () => BADGES33.filter((b) => st.badges[b.id] && !st.claimed[b.id]);
  function claimBook(quiet) {
    const list = unclaimed();
    if (!hud || !hud.choice) return false;
    if (!list.length) {
      stamp('ספר הזכרונות — אין מה לקבל עכשיו', 'info');
      st.bookNight = st.day;
      return false;
    }
    st.paused = true;
    if (!quiet) sfx('ui');
    const close = () => {
      st.paused = false;
      st.bookNight = st.day;
    };
    say(() =>
      hud.choice({
        title: 'ספר הזכרונות',
        text: 'מה שעשיתם בעזרה נרשם; קבלו את הפרוטות (המחשה: לוח המתגים)',
        items: list.map((b) => ({
          icon: '📜',
          label: b.text,
          sub: `+${b.pay} פרוטות`,
          go: () => {
            if (!st.claimed[b.id]) {
              st.claimed[b.id] = 1;
              save.badges33 = { ...(save.badges33 || {}), [b.id]: 1 };
              pay(b.pay, 'badge:' + b.id);
              stamp(`${b.text} — +${b.pay} פרוטות`, 'combo');
              sfx('coin');
              L0('claim', b.id);
            }
            return unclaimed().length === 0;
          },
        })),
        closeLabel: 'די',
        quiet: !!quiet,
        refresh: () => claimBook(true),
        onClose: close,
      }),
    );
    return true;
  }
  /* ───────── the fire ───────── */
  function feed(n, grades, lay) {
    if (n <= 0) return;
    let perG = (b17 ? B17.perLogGrade : DAY33.perLogGrade) || {},
      per = 0;
    for (let i = 0; i < n; i++) {
      const a = grades && grades[i];
      per += (a && perG[a]) || (b17 ? B17.perLogGrade.good : DAY33.perLog);
    }
    const before = st.level,
      add = per * (st.washed ? 1 + DAY33.washBonus : 1) * (b17 ? catchK(st.fuel) : 1);
    st.fuel = Math.min(100, st.fuel + add);
    st.fed += n;
    st.level = levelFor(st.fed);
    SHARED.flare33 = performance.now();
    L0('feed', n, Math.round(st.fuel));
    try {
      globalThis.__FLARE33 = performance.now() + (lay ? 300 : 0);
    } catch (e) {}
    if (lay && b17) {
      if (!l18) sfx('whoosh');
      emit17('lay', { n: Math.round(add * 10) / 10, at: { x: PYRE.x, y: PYRE.y + 3, z: PYRE.z }, fuel: st.fuel, g: grades && grades[0] });
    } else if (lay) {
      sfx('whoosh');
      say(() => hud && hud.float && hud.float(`+${Math.round(add)} 🔥`, project({ x: PYRE.x, y: PYRE.y + 4, z: PYRE.z })));
    } else {
      sfx('chime');
      stamp(`+${Math.round(add)} אש — ${n} גזרים על המערכה${st.washed ? ' (ידיים מקודשות: +25%)' : ''}`, 'combo');
    }
    if (st.level > before) {
      sfx('fanfare');
      setTimeout(() => stamp(`המערכה ברמה ${st.level} — העזרה נפתחת`, 'combo'), 900);
      L0('level', st.level);
      emit17('level', { level: st.level });
    }
  }
  const catchK = (fuel) => {
      const c = B17.catchK;
      return 1 + (c.max - 1) * Math.max(0, Math.min(1, (c.below - fuel) / (c.below - c.at)));
    },
    drainNow = () => (b17 ? B17.drain[st.day > 1 ? 1 : 0] * (B17.drainK[0] + (B17.drainK[1] * st.fuel) / 100) : 100 / DAY33.drainS);
  function drainStep(dt) {
    if (gateAny()) return;
    const k = st.night ? DAY33.nightDrain : 1;
    st.fuel = Math.max(DAY33.floor, st.fuel - dt * drainNow() * k);
    if (b17 && st.fuel < st.lowDay) st.lowDay = st.fuel;
    if (st.fuel <= DAY33.floor + 0.01 && !st.embers) {
      st.embers = true;
      if (!b17) stamp('נשארה גחלת — הביאו עצים!', 'no');
      sfx('miss');
      L0('embers');
    }
    if (st.fuel > 20 && st.embers) st.embers = false;
  }
  /* ───────── the day and the night ───────── */
  function setSky(night) {
    try {
      const W = globalThis.__T;
      if (W && typeof W.setTime === 'function')
        W.setTime(prac && !ended ? (prac.ch33 ? prac.ch33.sky /* ── fable32 (build 33) ── (the chamber at the real hour where the phone is) ── /fable32 ── */ : PRAC31.first.includes(prac.role) || prac.role === 'kiyor' ? 'predawn' : 'noon') /* ── fable32 (build 31) ── (the hour of his role's morning) ── /fable32 ── */ : night ? 'dusk' : g21 && !ended && (g22 ? st.m22day : st.d21day) !== st.day ? 'predawn' : 'noon');
    } catch (e) {}
  }
  // ── fable32 (build 35) ── the fire's look (E35): the night's fire before the morning's lot; from the lot until today's pyre is lit, the
  // coals the ashes' role sweeps (as the agreed specs have them); then the pyre's look — by the maaracha's rating (his, or the court's: כשר)
  // for the rest of the morning. Never drained, never a meter: st.fuel follows the look on the old scale (fx18's court, the woodpile) ── /fable32 ──
  const look35 = () => {
    if (st.f35day === st.day && st.fire35) return st.fire35 === 'mehudar' ? 'mehudar' : 'kasher';
    // (today's pyre lit — his or the court's — in a save from before build 35, which kept no look: his rating, or the court's כשר)
    if (g22 && (st.m22day === st.day || (p23 && st.p23day === st.day && ((st.lot === 'lamb' && st.p25day === st.day) || (st.lot === 'deshen' && st.d21day === st.day)))) && !(prac && PRAC31.first.includes(prac.role)))
      return p23 && st.lot === 'm22' && st.m22r && st.m22r.day === st.day && st.m22r.rating === 'mehudar' ? 'mehudar' : 'kasher';
    if (prac && prac.role === 'kiyor') return 'night';
    return (p23 ? st.p23day === st.day : g21 && st.d21day === st.day) ? 'ember' : 'night';
  };
  function fire35Step() {
    const k = look35();
    st.fuel = E35.fuel[k];
    try {
      globalThis.__FIRE33 = E35.look[k];
      globalThis.__FIRELOW33 = 0;
      globalThis.__FIRE35 = { k, sp: E35.spark[k] || 0, clean: k === 'mehudar' ? 1 : 0 };
    } catch (e) {}
  }
  /** the pyre lit this morning: its look for the rest of the morning (his rating; the court's is כשר) */
  function lit35(rating) {
    if (!e35) return;
    st.fire35 = rating === 'mehudar' ? 'mehudar' : 'kasher';
    st.f35day = st.day;
    L0('fire35', st.fire35);
    emit17('fire35', { look: st.fire35 });
  }
  const lambReady = () => !open33('pen') || okLambs() > 0,
    grace17 = () => b17 && st.day === 1 && (g22 ? st.dayT : st.t) < B17.grace;
  // ── recovered (build 17) ── the focused day's two tamids (B17.tamid: dawn 45 s, dusk 170 s, the fire at 60): on time, late, offered late;
  // the day's summary at sunset and the next day (E.nextDay)
  function tamidStep() {
    const tm = B17.tamid;
    for (const [x, q, it] of [
      ['tamD', 'שחר', tm.dawn],
      ['tamE', 'בין הערביים', tm.dusk],
    ]) {
      const a = st[x];
      if (a === 'wait' && st.dayT >= it)
        if ((st.fuel >= tm.fire && lambReady()) || grace17()) offer17(x, q, true);
        else {
          st[x] = 'late';
          st.lateDay++;
          const a = st.fuel < tm.fire ? `האש צריכה ${tm.fire}` : 'צריך טלה מבוקר';
          stamp(`הממונה: "התמיד איחר" — ${a}`, 'no');
          sfx('late17');
          emit17('late', { when: q, why: a, need: tm.fire, k: x });
          L0('tamid-late', q);
          evlog('tamid', { when: q, late: true, fuel: Math.round(st.fuel) });
        }
      else if (a === 'late' && st.fuel >= tm.fire && lambReady()) offer17(x, q, false);
    }
  }
  function offer17(k, when, onTime) {
    const lamb = open33('pen') ? st.lambs.find((x) => x.ok) : null;
    if (lamb) lamb.ok = false;
    st.tamids++;
    st[k] = onTime ? 'ok' : 'lateDone';
    st.fuel = Math.min(100, st.fuel + DAY33.tamidFuel);
    stamp(onTime ? `תמיד של ${when} — בזמן ★` : `תמיד של ${when} — הוקרב באיחור`, onTime ? 'combo' : 'info');
    sfx(onTime ? 'trumpet17' : 'chime');
    emit17('tamid', { when, onTime, k });
    L0('tamid', when, onTime);
    evlog('tamid', { when, onTime, fuel: Math.round(st.fuel) });
    if (c18 && onTime) pay(C18.tamid, 'tamid', { x: PYRE.x, y: PYRE.y + 4, z: PYRE.z });   // ── fable32 (build 28) ── (the gift no longer rides on it) ── /fable32 ──
    if (k === 'tamD' && open33('song') && !st.song) {
      st.song = { until: st.t + DAY33.songS };
      setTimeout(() => stamp('הלויים על הדוכן — לכו לשיר (60 שניות)', 'combo'), 1500);
      L0('song-open');
    }
  }
  function tamid17() {
    if (!b17) return null;
    const tm = B17.tamid;
    return st.tamD === 'wait'
      ? { k: 'tamD', when: 'שחר', inS: Math.max(0, tm.dawn - st.dayT), late: false }
      : st.tamD === 'late'
        ? { k: 'tamD', when: 'שחר', inS: 0, late: true }
        : st.tamE === 'wait'
          ? { k: 'tamE', when: 'בין הערביים', inS: Math.max(0, tm.dusk - st.dayT), late: false }
          : st.tamE === 'late'
            ? { k: 'tamE', when: 'בין הערביים', inS: 0, late: true }
            : { k: 'sun', when: 'שקיעה', inS: Math.max(0, st.left), late: false, done: true };
  }
  // ── fable32 (build 35) ── the court's acts this morning: the roles the lots gave the other kohanim (the first lot's built roles but his,
  // the second lot's built roles but his) — "כל העבודה חשובה": named plainly in the summary, no rating ── /fable32 ──
  function court35() {
    const out = [];
    if (p23 && st.p23day === st.day) for (const x of POOL23) if (x.built && x.id !== st.lot && (p25 || x.id !== 'lamb')) out.push({ id: x.id, he: x.he });
    if (p26 && st.p26day === st.day) for (const x of POOL26) if (x.built && x.id !== st.role26 && (p27 || !blood27(x.id))) out.push({ id: x.id, he: x.he });
    return out;
  }
  // ── fable32 (build 30) ── the day's summary: the day's ratings in place of the stars (they were 1 + each tamid on time — the clock, not
  // the work): how many מהודר, כשר, טעון תיקון, and each act's word; the praise by them (never a reproach) ── /fable32 ──
  function summary17() {
    const ok = (a) => st[a] === 'ok',
      list = (Array.isArray(st.r30day) ? st.r30day : []).map(([id, r]) => ({ id, he: ACT30[id] ? ACT30[id].he : id, rating: r })),
      r30 = { h: list.filter((x) => x.rating === 'mehudar').length, k: list.filter((x) => x.rating === 'kasher').length, t: list.filter((x) => x.rating === 'tikkun').length },
      tasks = st.tasks.filter((x) => x.done).length,
      praise = !list.length
        ? 'עבודה טובה! מחר — עוד בוקר בעזרה'
        : r30.h === list.length
          ? 'עבודה מהודרת! כל העבודות היום — מהודרות'
          : r30.t
            ? 'עבודה טובה! ומה שטעון תיקון — מתקנים בפעם הבאה'
            : 'יפה מאוד! כל העבודות כשרות',
      pad = c18 ? pads18().find((x) => !own18(x.id)) : null;
    return {
      day: st.day,
      ratings: list,
      r30,
      served: served30(save),
      // ── fable32 (build 35) ── the morning of the work: no tamid rows (no clock, no "late"; the evening is the opening screen's), the
      // court's acts named plainly (the roles the lots gave the other kohanim today), the ממונה's three by name, the fire's look ── /fable32 ──
      e35,
      tamids: e35
        ? []
        : [
            { when: 'שחר', ok: ok('tamD') },
            { when: 'בין הערביים', ok: ok('tamE') },
          ],
      court: e35 ? court35() : [],
      taskList: e35 ? st.tasks.map((x) => ({ id: x.id, text: x.text, done: !!x.done })) : [],
      fire: e35 ? look35() : null,
      rampBest: st.rampBest ? Math.round(st.rampBest * 10) / 10 : 0,
      logs: st.laidDay,
      low: Math.round(st.lowDay),
      perutot: st.perutot - st.pDay0,
      tasks: [tasks, st.tasks.length],
      score: SC ? Math.max(0, Math.round((say(() => SC.get().total) || 0) - st.sDay0)) : 0,
      badges: [],
      praise,
      c18: c18 ? { earn: st.earnD, total: st.perutot, next: pad ? { ...pad, have: Math.min(st.perutot, pad.price) } : null } : null,
      d21: g21 && st.d21r && st.d21r.day === st.day ? { ...st.d21r } : null,
      m22: g22 && st.m22r && st.m22r.day === st.day ? { ...st.m22r } : null,
      p23:
        p23 && st.p23day === st.day && st.lot
          ? (() => {
              const a = POOL23.find((x) => x.id === st.lot),
                b = st.lot === 'deshen' ? st.d21r : st.lot === 'lamb' ? st.p25r : st.m22r,
                c = roles23()[st.lot] || {};
              return {
                id: st.lot,
                he: a ? a.he : st.lot,
                m: b && b.day === st.day ? b.mastery : null,
                rating: b && b.day === st.day ? b.rating || null : null,   // ── fable32 (build 30) ── ── /fable32 ──
                best: c.best | 0,
                rec: !!(b && b.day === st.day && b.rec),
              };
            })()
          : null,
      p26:
        p26 && st.r26r && st.r26r.day === st.day
          ? (() => {
              const r26r = st.r26r,
                a = POOL26.find((x) => x.id === r26r.role);
              return { he: a ? a.he : r26r.role, m: r26r.mastery, rating: r26r.rating || null, rec: !!r26r.rec };   // ── fable32 (build 30) ── (+ rating) ── /fable32 ──
            })()
          : null,
    };
  }
  function endDay17() {
    for (const [x, q] of e35 ? [] : [   // ── fable32 (build 35) ── (no tamid clock in the morning of the work: nothing is "late") ── /fable32 ──
      ['tamD', 'שחר'],
      ['tamE', 'בין הערביים'],
    ])
      if (st[x] === 'wait' || st[x] === 'late') {
        if (st[x] === 'wait') st.lateDay++;
        st[x] = 'lateDone';
        st.tamids++;
        L0('tamid-dusk', q);
      }
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    if (acting && ST && ST.cancel) say(() => ST.cancel('dusk'));
    if (st.lost) {
      st.lost = null;
      SHARED.lost33 = null;
    }
    st.song = null;
    if (b19) {
      L0('fl-lost', st.r19.fl.length);
      st.r19.fl = [];
    }
    const sum = summary17();
    for (const x of unclaimed()) {
      st.claimed[x.id] = 1;
      save.badges33 = { ...(save.badges33 || {}), [x.id]: 1 };
      pay(x.pay, 'badge:' + x.id);
      sum.badges.push({ text: x.text, pay: x.pay });
    }
    sum.perutot = st.perutot - st.pDay0;
    sum.c18 = summary17().c18;
    st.summary = sum;
    st.close35 = null;
    st.paused = true;
    setSky(!e35);   // ── fable32 (build 35) ── (the morning's summary under the morning's sky — the evening is the opening screen's real hour) ── /fable32 ──
    sfx('fanfare');
    evlog('day_summary', { day: st.day, r30: sum.r30, logs: sum.logs, low: sum.low });   // ── fable32 (build 30) ── (the ratings, not the stars) ── /fable32 ──
    saveState('night');
    L0('summary', st.day, sum.r30.h, sum.r30.k, sum.r30.t);
    emit17('summary', sum);
  }
  // ── fable32 (build 35) ── the morning ends on its work: the built work done — his acts (the laver, the first lot's role, the second
  // lot's) and the court's (the roles the lots gave them) — his last rating's word over, no card up: a calm close (E35.close s — 0.6 s to
  // dark with "הבוקר הושלם", where the scene changes; then the altar seen from the south-east, its fire as the morning's pyre burns, the
  // court round it, the source line), then the summary of the work. No clock: an older save whose morning was done goes straight to it. ── /fable32 ──
  const workDone35 = () =>
    e35 &&
    !prac &&
    st.phase === 'run' &&
    !st.night &&
    !st.summary &&
    st.washed &&
    !gateAny() &&
    (!p23 || st.p23day === st.day) &&
    (!p26 || st.r26day === st.day) &&
    (p23 || ((!g21 || st.d21day === st.day) && (!g22 || st.m22day === st.day))) &&
    !acting &&
    !st.k20 &&
    !st.p23 &&
    !(st.d21 && st.d21.ph !== 'end') &&
    !(st.m22 && st.m22.ph !== 'end') &&
    !(st.p25 && !/^(lead|end|out)$/.test(st.p25.ph)) &&
    !(st.r26 && st.r26.ph !== 'out') &&
    !(st.r27 && st.r27.ph !== 'out');
  function close35Step() {
    const C = st.close35;
    if (!C) {
      if (st.l36q && st.l36q.length) return;   // ── fable32 (build 36) ── (the levels' cards first) ── /fable32 ──
      if (!workDone35() || (st.end30 && st.t < st.end30.until) || st.j32q || st.j32card || st.tl33card) return;
      st.close35 = { t0: st.t, ph: 'fade' };
      if (o.walk && o.walk.stop) say(() => o.walk.stop());
      goal = null;
      drive(0, 0);
      L0('close35', look35());
      evlog('morning_close', { day: st.day, look: look35(), r30: (st.r30day || []).map((x) => x.join(':')) });
      emit17('close35', { ph: 'fade', look: look35() });
      fade(null, 'הבוקר הושלם');
      return;
    }
    drive(0, 0);
    const k = st.t - C.t0;
    if (C.ph === 'fade' && k >= E35.fade) {
      C.ph = 'view';
      sfx('chime');
      emit17('close35', { ph: 'view', look: look35(), src: E35.src });
    }
    if (k >= E35.close) endDay17();
  }
  /** the close's view (the camera's authored view while it lasts — first in the shift's chain; a cut under the dark) */
  const camWork35 = () => {
    const C = st.close35;
    if (!C || C.ph !== 'view') return null;
    const V = E35.cam;
    return { x: V.t[0], z: V.t[2], view: { p: V.p.slice(), t: V.t.slice(), e: V.e } };
  };
  function nextDay() {
    return st.summary
      ? ((st.summary = null),
        (st.close35 = null),   // ── fable32 (build 35) ── ── /fable32 ──
        (st.paused = false),
        st.day++,
        (st.left = DAY33.dayS),
        (st.dayT = 0),
        setSky(false),
        score(DAYSCORE.day, 'day'),
        (st.washed = false),
        (st.power = Math.min(DAY33.power0, st.power + 30)),
        newTasks(),
        (st.merchantRoll = rng() < DAY33.merchantP),
        (st.r26 = null),
        (st.r27 = null),
        (st.r30day = []),   // ── fable32 (build 30) ── ── /fable32 ──
        (st.l36day = []),
        (st.end30 = null),
        Object.assign(st, {
          tamD: 'wait',
          tamE: 'wait',
          rampBest: 0,
          laidDay: 0,
          lowDay: st.fuel,
          lateDay: 0,
          pDay0: st.perutot,
          sDay0: (SC && say(() => SC.get().total)) || 0,
          streak: 0,
          trip: null,
          earnD: 0,
        }),
        st.day > st.best && ((st.best = st.day), (save.bestDay = st.best), say(() => o.persist && o.persist())),
        p23 && (acting ? (ST && ST.cancel && say(() => ST.cancel('dawn')), (st.wake24 = 1)) : wake23()),
        stamp(`יום ${st.day} בעזרה`, 'combo'),
        sfx('chime'),
        L0('day', st.day),
        emit17('day', { day: st.day }),
        evlog('day_end', { day: st.day - 1 }),
        saveState('day'),
        true)
      : false;
  }
  function dayStep(dt) {
    if (!gateAny()) st.left = Math.max(0, st.left - dt);
    if (b17) {
      st.dayT = DAY33.dayS - st.left;
      if (!st.night) tamidStep();
      if (!st.night) nedavaStep();   // ── fable32 (build 28) ── (the gift's fixed moment) ── /fable32 ──
    }
    if (b17 && !night17 && !st.night && st.left <= 0) {
      if (!st.summary) endDay17();
      return;
    }
    if (!st.night && st.left <= 0) {
      if (!b17) tamid('בין הערביים');
      st.night = true;
      st.left = DAY33.nightS;
      st.watched = false;
      st.torchOn = false;
      st.torchAt = st.t + DAY33.torchAfter + rng() * 20;
      setSky(true);
      st.song = null;
      sfx('tick');
      L0('night', st.day);
      if (st.lost) {
        st.lost = null;
        SHARED.lost33 = null;
        L0('lost-night');
      }
      evlog('night', { day: st.day, fuel: Math.round(st.fuel) });
      saveState('night');
      if (o.walk && o.walk.stop) say(() => o.walk.stop());
      goal = null;
      if (acting && ST && ST.cancel) say(() => ST.cancel('night'));
      fade(() => {
        moveHero(DAY33.moked.x, DAY33.moked.z, Math.PI / 2);
        st.inMoked = true;
        stamp('לילה בבית המוקד — האש של העזרה דועכת לאט; כשאיש הר הבית עובר, הקישו על הלפיד', 'info');
      }, 'השמש שקעה — לבית המוקד (מידות א, ו–ח)');
    } else if (st.night && st.left <= 0) {
      st.night = false;
      st.day++;
      st.left = DAY33.dayS;
      setSky(false);
      score(DAYSCORE.day, 'day');
      if (b17) Object.assign(st, { tamD: 'wait', tamE: 'wait', rampBest: 0, laidDay: 0, lowDay: st.fuel, lateDay: 0, pDay0: st.perutot, dayT: 0 });
      fade(() => {
        moveHero(DAY33.moked.back.x, DAY33.moked.back.z, Math.PI);
        st.inMoked = false;
        const had = okLambs() > 0;
        if (!b17) {
          tamid('שחר');
          if (had && open33('song')) {
            st.song = { until: st.t + DAY33.songS };
            stamp('תמיד של שחר — הלויים על הדוכן: לכו לשיר (60 שניות)', 'combo');
            L0('song-open');
          }
        }
      }, `יום ${st.day} — "ראו טלה מלשכת הטלאים" (תמיד ג, ג)`);
      st.washed = false;
      st.power = Math.min(DAY33.power0, st.power + 30);
      newTasks();
      st.merchantRoll = rng() < DAY33.merchantP;
      st.r26 = null;
      st.r27 = null;
      st.r30day = [];   // ── fable32 (build 30) ── ── /fable32 ──
      st.l36day = [];
      if (st.day > st.best) {
        st.best = st.day;
        save.bestDay = st.best;
        say(() => o.persist && o.persist());
      }
      stamp(`יום ${st.day} בעזרה`, 'combo');
      sfx('chime');
      L0('day', st.day);
      evlog('day_end', { day: st.day - 1 });
      saveState('day');
    }
    if (st.night && !st.torchOn && !st.watched && st.t >= st.torchAt) {
      st.torchOn = true;
      stamp('איש הר הבית עובר — הקישו על הלפיד!', 'info');
      sfx('tick');
      L0('torch');
    }
    if (st.night && st.torchOn && !st.watched && st.t >= st.torchAt + 10) {
      st.torchOn = false;
      st.watched = true;
      if (st.day > 1) {
        st.fuel = Math.max(DAY33.floor, st.fuel - 10);
        stamp('נרדמתם במשמר — "חובטו במקלו" (−10 אש)', 'no');
        sfx('miss');
      } else stamp('לילה ראשון — הפעם בלי עונש', 'info');
      L0('torch-miss');
    }
  }
  const nearLost = () => {
    if (!st.lost) return false;
    const h = heroP();
    return Math.hypot(st.lost.x - h.x, st.lost.z - h.z) <= DAY33.lostNear;
  };
  /* ───────── the acts ───────── */
  function nx33() {
    if (st.night && st.torchOn && !st.watched) return { id: 'torch', kind: 'torch' };
    if (gate20()) return { id: 'kiyor', kind: 'station' };
    if (gate23()) return { id: 'p23', kind: 'lot' };
    if (gate21()) return { id: 'deshen', kind: 'station' };
    if (gate22()) return { id: 'm22', kind: 'station' };
    if (e35) return gateAny() ? { id: 'gate', kind: 'gate' } : { id: 'done35', kind: 'done' };   // ── fable32 (build 35) ── (no next chore: the morning's next is its next act, then its close) ── /fable32 ──
    if (st.logs >= basketCap()) return { id: 'kevesh', kind: 'station' };
    if (st.logs > 0 && st.fuel <= DAY33.floor + 0.01) return { id: 'kevesh', kind: 'station' };   // (embers: whatever he carries, up now)
    if (b17) return next17();
    if (st.lost && !st.night && (st.lost.follow || st.lost.home || (nearLost() && !(b17 && st.fuel < B17.warn)))) return { id: 'lamb', kind: 'lamb' };
    if (b17) {
      const a = tamid17(),
        b = !!(a && !a.done && (a.late || a.inS < B17.penBefore)) && !(grace17() && st.t + a.inS < B17.grace);
      if (open33('pen') && okLambs() === 0 && st.lambs.some((x) => !x.ok) && b && st.fuel >= B17.warn) return { id: 'pen', kind: 'station' };
      if (st.fuel < B17.warn || (a && !a.done && (a.late || a.inS < B17.rushTamid) && st.fuel < B17.tamid.fire))
        return { id: 'wood', kind: 'station' };
    }
    return st.song && open33('song')
      ? { id: 'song', kind: 'station' }   // (build 10: the dawn's song window)
      : open33('kiyor') && !st.washed && !st.night   // (the morning: hands and feet first — the day's +25%)
        ? { id: 'kiyor', kind: 'station' }
        : !b17 && open33('pen') && okLambs() === 0 && st.lambs.some((q) => !q.ok) && st.left < 70   // (the tamid is near and no lamb is ready)
          ? { id: 'pen', kind: 'station' }
          : tired() && st.bread <= 0 && open33('bake')
            ? st.oil > 0 && st.flour > 0 && st.salt > 0
              ? { id: 'bake', kind: 'station' }
              : st.oil <= 0 || st.flour <= 0
                ? { id: 'oil', kind: 'station' }
                : { id: 'salt', kind: 'station' }
            : { id: 'wood', kind: 'station' };
  }
  const statN = (a) => st.dayStats[a] | 0,
    basketCap = () => (b17 && st.basketMax > DAY33.basket && woodRush(tamid17()) ? DAY33.basket : st.basketMax),
    penN = () => {
      const a = statN('inspected');
      return [a, a + st.lambs.filter((x) => !x.ok).length];
    };
  function woodRush(tm) {
    return (
      st.fuel < B17.woodAt ||
      !!(
        tm &&
        !tm.done &&
        !(grace17() && st.t + tm.inS < B17.grace) &&
        (tm.late || (tm.inS < B17.tamidLead && st.fuel - drainNow() * tm.inS < B17.tamid.fire + 3)) &&
        st.fuel < 97
      )
    );
  }
  // ── recovered (build 18) ── the coins in the world: the chests by the gate (the pilgrims' coins), the pads to buy at (own18)
  const chests = C18.chests,
    own18 = (a) => !!(save.day33 && typeof save.day33 === 'object' && save.day33[a]),
    // ── fable32 (build 35) ── (the pads in the court: "גרזן טוב" and "טנא גדול" were the wood loop's — no use left, hidden; the laver's
    // second spigot stays as it is — the owner's open decision, svivat-avoda-he.md §11.1) ── /fable32 ──
    pads18 = () => (e35 ? C18.pads.filter((x) => x.id === 'kiyor2') : C18.pads),
    padOpen = () => (c18 && pads18().find((x) => !own18(x.id) && st.perutot >= x.price)) || null;
  function chestStep(dt) {
    const ch = st.ch18,
      h = heroP();
    if (ch.walk) {
      if (st.t >= ch.walk.at) {
        ch.n = Math.min(chests.max, ch.n + 1);
        ch.c.push(ch.walk.i);
        emit17('drop', { i: ch.walk.i });
        ch.walk = null;
      }
    } else if (ch.n < chests.max && st.fuel >= chests.lo && (ch.t += dt) >= (st.fuel >= chests.hi ? chests.hiS : chests.loS)) {
      ch.t = 0;
      const a = (ch.k++ * 5) % chests.n;
      ch.walk = { i: a, at: st.t + chests.walkS };
      emit17('pilgrim', { i: a, s: chests.walkS });
    }
    if (
      ch.n > 0 &&
      Math.abs(h.x - chests.x) < chests.reach &&
      h.z > chests.z0 - 1.5 &&
      h.z < chests.z0 + (chests.n - 1) * chests.dz + 1.5 &&
      (h.y || 16) < 20
    ) {
      const n = ch.n;
      ch.n = 0;
      ch.c = [];
      ch.t = 0;
      stat('v_chests');
      emit17('collect', { n });
      pay(n, 'chests', { x: chests.x, y: 17.5, z: h.z });
      L0('chests', n);
    }
  }
  function padStep(dt) {
    if (gateAny()) {
      if (st.pad18) {
        st.pad18 = null;
        emit17('pad', { id: null });
      }
      return;
    }
    let h = heroP(),
      pad = null;
    for (const x of pads18()) if (!own18(x.id) && Math.hypot(h.x - x.x, h.z - x.z) <= C18.padR && (h.y || 16) < 20) pad = x;
    if (!pad || st.perutot < pad.price) {
      if (st.pad18) {
        st.pad18 = null;
        emit17('pad', { id: null });
      }
      return;
    }
    if (!st.pad18 || st.pad18.id !== pad.id) {
      st.pad18 = { id: pad.id, t: 0, price: pad.price };
      emit17('pad', { id: pad.id, at: { x: pad.x, y: 16.4, z: pad.z } });
    }
    if ((st.pad18.t += dt) < C18.padS) return;
    st.pad18 = null;
    st.perutot -= pad.price;
    save.perutot = st.perutot;
    (save.day33 && typeof save.day33 === 'object' ? save.day33 : (save.day33 = {}))[pad.id] = 1;
    if (pad.id === 'axe') {
      st.axeTaps = Math.min(st.axeTaps, 2);
      st.axeK = DAY33.axeK;
    } else if (pad.id === 'basket10') st.basketMax = Math.max(st.basketMax, 10);
    st.buys18.push([pad.id, st.day, Math.round(st.dayT)]);
    say(() => o.persist && o.persist());
    sfx('fanfare');
    emit17('buy', { id: pad.id, he: pad.he, at: { x: pad.x, y: 17, z: pad.z } });
    L0('buy', pad.id);
  }
  // ── recovered (build 19) ── the ramp run: the salt (a bag at the salt station, held — the grains fly onto the ramp's cells), the basket's
  // sway and the slip, the fallen logs, the ghost of the best run (save.gh19), the climb's camera
  const near19 = (h) => onHigh(h.x, h.z) || (Math.abs(h.x + 38) < 8 && h.z > 42 && h.z < 47.5),
    nearK24 = (h) => {
      const s = standOf('kevesh');
      return !!s && Math.hypot(s.x - h.x, s.z - h.z) <= DAY33.reach + 0.2;
    },
    saltDue = () => b19 && st.r19.cov < R19.goal && st.r19.bags < 3 && st.logs <= 0 && (st.day > 1 || statN('carried') >= R19.after);
  function ramp19Step(dt) {
    const R = st.r19,
      h = heroP(),
      tw = o.twin,
      pace = tw && tw.pace,
      onR = onRamp19(h.x, h.z),
      yaw = Number.isFinite(h.yaw) ? h.yaw : Math.PI,
      cl = (a, b, c) => (a < b ? b : a > c ? c : a),
      C = R19,
      now = st.t;
    if (R.gd !== st.day) Object.assign(R, { gd: st.day, g: Array(256).fill(0), n: 0, cov: 0, bags: 0, rn: 0 });
    const moved = Number.isFinite(R.x) ? Math.hypot(h.x - R.x, h.z - R.z) : 0,
      vz = Number.isFinite(R.z) ? (h.z - R.z) / dt : 0;
    R.x = h.x;
    R.z = h.z;
    R.sp += (Math.min(12, moved / dt) - R.sp) * Math.min(1, dt * 8);
    const held = !!(tw && tw.held19 && tw.held19()) && (!gateAny() || carry22()),
      stickOn = !!(tw && tw.stick && tw.stick().on),
      loaded = st.logs > 0,
      salting = !loaded && R.bag > 0,
      up = near19(h) && h.z > C.head,
      climbing = loaded && up,
      // ── fable32 (build 35) ── the ramp run lives in the maaracha role (svivat-avoda-he.md §3; rizat-hakevesh-he.md; input-protocol-he.md
      // decision 3): his sorted logs go up the ramp to the altar's top ONCE, as R19 runs it — the stick's depth the speed, the right thumb's
      // hold steadying the basket, a fast unsteady run on bare stone may drop a log (a gold ring: picked up, never lost), the ghost of his best
      // run and its time; on the way from the wood chamber to the ramp's foot the morning's quick pace as before ── /fable32 ──
      run35 = e35 && carry22(),
      strong = !!(p23 && st.p23day === st.day && gateAny()) && !(run35 && near19(h));
    if (pace) pace.k = strong ? P23.run / 7 : climbing ? (now - R.slip < 0.6 ? 1 : C.v1) / 7 : 0;
    R.sc = salting && up && held ? 1 : 0;
    const sy = Math.sin(yaw),
      cy = Math.cos(yaw);
    if (R.sc) {
      R.acc += C.rate * dt;
      for (; R.acc >= 1 && R.bag > 0; R.acc--) {
        R.bag--;
        const a = Math.random() * 2 - 1,
          b = 1.5 + Math.random() * 1.6 + 1.2 * (1 - a * a);
        R.gr.push([h.x + sy * b - cy * a * 4.2, h.z + cy * b + sy * a * 4.2, 0, h.x + sy * 0.5, h.z + cy * 0.5, (h.y || 16) + 2.2]);
      }
    }
    R.gr = R.gr.filter((x) => {
      if ((x[2] += dt) < C.fly) return 1;
      const a = cell19(x[0], x[1]);
      if (onRamp19(x[0], x[1]) && !R.g[a]) {
        R.g[a] = 1;
        if ((a & 7) > 3) R.cov = ++R.n / 128;
      }
      return 0;
    });
    if (R.cov >= C.goal && R.sd !== st.day) {
      R.sd = st.day;
      const a = { x: -34, y: 22, z: 26 };
      emit17('salted', { at: a });
      payAct('gold', 'salt', a);
      L0('salted');
    }
    const easy = !run35 && st.day === 1 && R.rn < 2,   // ── fable32 (build 35) ── (the maaracha's run sways from the first: the hold has something to steady) ── /fable32 ──
      bare = onR && !R.g[cell19(h.x, h.z)],
      want = climbing && !easy ? C.swayMax * cl((R.sp - 3.2) / (C.v1 - 3.2), 0, 1) * (bare ? 1 : C.saltK) * (held ? C.hold : 1) : 0;
    R.A = want > R.A ? Math.min(want, R.A + 0.5 * dt) : Math.max(want, R.A - (now - R.slip < 1.2 ? 0.6 : 1.5) * dt);
    R.ph += dt * (4 + R.sp);
    R.sw = R.A * Math.sin(R.ph);
    if (climbing && onR && !easy && bare && (!carry22() || (run35 && !first22())) && R.sp > C.slipV && R.A > 0.3 && now - R.slip > 2 && rng() < dt * 3.5 * (R.A - 0.3)) {   // ── fable32 (build 35) ── (in the maaracha's run a log may drop — never on his first maaracha) ── /fable32 ──
      R.slip = now;
      R.slips++;
      R.A = 0.9;
      if (R.run) R.run.c = 0;
      st.logs--;
      R.fl.push({ x: h.x, z: h.z + 0.7, v: 6, g: st.basketQ.pop() || 'good' });
      emit17('slip', { at: { x: h.x, y: (h.y || 16) + 4.6, z: h.z } });
      L0('slip', Math.round(h.z));
    }
    R.fl = R.fl.filter((x) => {
      if (x.v > 0) {
        x.z = Math.min(42.2, x.z + x.v * dt);
        x.v = Math.max(0, x.v - 3 * dt);
      }
      return x.v > 3 || st.logs >= st.basketMax || Math.hypot(x.x - h.x, x.z - h.z) > 1.3
        ? 1
        : (st.logs++, st.basketQ.push(x.g), R.picks++, emit17('pop', { text: '+1 🪵' }), emit17('pick'), 0);
    });
    if (strong) {
      R.arm = 0;
      if (R.run) R.run = null;
    } else if (climbing && h.z > 40) R.arm = 1;
    if (R.arm && climbing && onR && h.z < 40) {
      R.arm = 0;
      R.rn++;
      const gh19 = save.gh19;
      R.run = { t0: now, p: [], c: 1 };
      R.gp = gh19 && gh19.p;
      R.gt = gh19 ? now : -1;
      if (run35 ? first22() : st.day === 1 && R.rn === 2) emit17('sway');   // ── fable32 (build 35) ── (the maaracha's first run: "החזיקו — הסל מתייצב") ── /fable32 ──
    }
    const run = R.run;
    if (run) {
      while (run.p.length * 0.05 <= now - run.t0) run.p.push(Math.round(h.x * 10) / 10, Math.round(h.z * 10) / 10);
      if (h.z <= C.head) {
        R.run = null;
        top19(now - run.t0, run);
      } else if (!onR) R.run = null;
    }
    if (onR && h.z > C.head && stickOn && !R.sc) {
      R.lane = (vz < -1.5 ? h.x < -38.5 : vz > 1.5 && h.x > -37.5) ? R.lane + dt : 0;
      if (R.lane > 0.8 && now - R.lt > 5) {
        R.lt = now;
        emit17('lane', { up: vz < 0 });
      }
    }
    if (onR && h.z > C.head + 0.5) SHARED.cam17 = { id: 'ramp', az: 0.2, el: 0.33, d: 14, look: { x: h.x + 5 * sy, z: h.z + 5 * cy } };
    else if (SHARED.cam17 && SHARED.cam17.id === 'ramp') SHARED.cam17 = null;
    globalThis.__ARM19 = R.sc;
  }
  function top19(t, run) {
    const best = save.gh19,
      g = run.c ? (t <= R19.par ? 'gold' : 'good') : 'ok',
      h = heroP(),
      at = { x: h.x, y: 28, z: h.z };
    if (run.c && !(best && best.t <= t)) {
      save.gh19 = { t: Math.round(t * 10) / 10, p: run.p };
      say(() => o.persist && o.persist());
      if (best) emit17('rec', { t });
    }
    stat('climbs');
    stat('v_kevesh');
    if (!st.rampBest || t < st.rampBest) st.rampBest = t;
    st.trip = { n: st.logs, laid: 0 };
    emit17('top', { dur: Math.round(t * 10) / 10, g, m22: !!(e35 && st.m22) });
    emit17('act', { id: 'kevesh', g, at });
    // ── fable32 (build 35) ── (the maaracha's run: part of its act — its coins are the act's, by its rating; the run's time and drops kept
    // with the act's record) ── /fable32 ──
    if (e35 && st.m22) st.m22.run = { t: Math.round(t * 10) / 10, g, slips: st.r19.slips - (st.m22.slip0 | 0) };
    else payAct(g, 'act:kevesh', at);
    L0('top', t, g);
  }
  // ── fable32 (build 36) ── a balance of the levels (lvl36.js — the laver's stream and the teni carried out, at level 4): as the ashes'
  // pan (D21.bal's way) — a drift that turns now and then, a small shake, the right thumb's counter (K.bin −1…1 × fix); past lim a
  // spill, at most one every gap s (the tilt then eased). True when it spilled. ── /fable32 ──
  function bal36(K, B, dt, shake = 1) {
    if ((K.wt -= dt) <= 0) {
      K.wd = rng() < 0.5 ? -1 : 1;
      K.wt = 0.6 + rng() * 0.9;
    }
    (K.kt -= dt) > 0 || ((K.kd = rng() * 2 - 1), (K.kt = 0.15 + rng() * 0.15));
    K.bT = (K.bT || 0) + dt;
    K.b = clamp(K.b + (K.wd * B.wind * (0.8 + 0.4 * Math.sin(K.bT * 2.3)) + shake * B.shake * K.kd + (K.bin == null ? 0 : K.bin) * B.fix) * dt, -1, 1);
    if (Math.abs(K.b) > B.lim && !(K.bT - K.sT < B.gap)) {
      K.sT = K.bT;
      K.spills++;
      K.b *= 0.4;
      return true;
    }
    return false;
  }
  function k20bal(v) {
    const K = st.k20;
    return K && K.P36 && K.P36.bal ? ((K.bin = v == null || !Number.isFinite(+v) ? null : clamp(+v, -1, 1)), true) : false;
  }
  // ── recovered (build 20) ── the laver: up to the spigots, both hands held under (L, R) till the ring fills, the rise, the walk down
  function k20start() {
    if (!gate20() || st.k20 || st.summary) return false;
    const h = heroP(),
      d = Math.hypot(act20.x - h.x, act20.z - h.z);
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    const L36k = lvOf36('kiyor'),
      P36k = par36('kiyor', L36k);   // ── fable32 (build 36) ── (the laver's level: the ring's guide, the hold's length, the balance) ── /fable32 ──
    st.k20 = {
      lv: L36k,
      P36: P36k,
      b: 0,
      bin: null,
      wd: 1,
      wt: 0,
      kd: 0,
      kt: 0,
      sT: -9,
      spills: 0,
      ph: 'up',
      t: 0,
      t0: st.t,
      p: 0,
      L: false,
      R: false,
      flow: false,
      held: 0,
      lifts: 0,
      sx: h.x,
      sz: h.z,
      dur: p23 ? Math.max(P23.up, d / P23.upMax) : Math.max(K20.up, d / K20.upMax),
      T: (own18('kiyor2') ? K20.hold2 : K20.hold) * (P36k.hold || 1),   // ── fable32 (build 36) ── (level 3 on: the water runs longer) ── /fable32 ──
      two: own18('kiyor2'),
      first: !save.k20seen,
    };
    L0('k20', Math.round(h.x), Math.round(h.z));
    evlog('act_start', 'kiyor');
    emit17('k20', { ph: 'up', first: st.k20.first, T: st.k20.T });
    return true;
  }
  function k20Step(dt) {
    const K = st.k20;
    if (!K) {
      if (gate20() && !acting && !st.summary && !st.paused) {
        const h = heroP(),
          s = standOf('kiyor');
        if (s && Math.hypot(s.x - h.x, s.z - h.z) <= DAY33.reach && (h.y || 16) < 20) k20start();
      }
      return;
    }
    K.t += dt;
    if (K.ph === 'up') {
      const k = Math.min(1, K.t / K.dur);
      moveHero(K.sx + (act20.x - K.sx) * k, K.sz + (act20.z - K.sz) * k, act20.yaw);
      if (k >= 1) {
        K.ph = 'pose';
        K.t = 0;
        emit17('k20', { ph: 'pose' });
      }
    } else if (K.ph === 'pose') {
      const a = K.L && K.R;
      if (K.flow && !a) K.lifts++;
      K.flow = a;
      if (a) {
        K.p = Math.min(1, K.p + dt / K.T);
        K.held += dt;
        // ── fable32 (build 36) ── level 4: the stream tilts — the thumbs' heights level it ("ימין על ימין, שמאל על שמאל"); past the
        // edge the water runs off a hand (a spill, counted as a lift is) ── /fable32 ──
        if (K.P36 && K.P36.bal && bal36(K, K.P36.bal, dt)) emit17('k20spill', { n: K.spills, a: Math.sign(K.b) });
      } else K.p = Math.max(0, K.p - K20.back * dt);
      if (K.p >= 1) {
        K.ph = 'rise';
        K.t = 0;
        K.flow = false;
        st.washed = true;
        st.d21g0 = st.t;
        st.k20T = Math.round((st.t - K.t0) * 10) / 10;
        save.k20seen = 1;
        say(() => o.persist && o.persist());
        stat('washes');
        stat('v_kiyor');
        L0('wash', st.k20T, K.lifts);
        evlog('act_done', { id: 'kiyor', grade: 'gate', s: st.k20T, lifts: K.lifts });
        emit17('unlock', { first: K.first, s: st.k20T, held: Math.round(K.held * 10) / 10, lifts: K.lifts, at: { x: act20.x, y: 20.5, z: act20.z } });
        // ── fable32 (build 30) ── the laver rated too: the hands held under the spigots (its lifts), its coins, the roles book's row ── /fable32 ──
        st.k20r = { day: st.day, lifts: K.lifts, held: Math.round(K.held * 10) / 10, s: st.k20T, first: K.first, lv36: K.lv, ...(K.P36 && K.P36.bal ? { spills36: K.spills } : {}) };   // ── fable32 (build 36) ── (its level; level 4's spills) ── /fable32 ──
        rec23('kiyor', st.k20r);
        end30('kiyor', st.k20r, { x: act20.x, y: 20.5, z: act20.z }, false);
      }
    } else if (K.ph === 'rise') {
      if (K.t >= (p23 ? K20.rise30 : K20.rise)) {
        if (p23) {
          st.k20 = null;
          emit17('k20', { ph: 'end' });
          p23start();
          return;
        }
        K.ph = 'down';
        K.t = 0;
        const s = standOf('kiyor');
        K.ex = s.x;
        K.ez = s.z;
        K.dur = Math.hypot(s.x - act20.x, s.z - act20.z) / K20.down;
      }
    } else if (K.ph === 'down') {
      const k = Math.min(1, K.t / K.dur);
      moveHero(act20.x + (K.ex - act20.x) * k, act20.z + (K.ez - act20.z) * k, Math.atan2(K.ex - act20.x, K.ez - act20.z));
      if (k >= 1) {
        st.k20 = null;
        emit17('k20', { ph: 'end' });
      }
    }
  }
  const camWork20 = () => {
      const K = st.k20;
      if (!K || K.ph === 'down') return null;
      const C = cam20,
        t = C.t,
        c = Math.cos(C.el);
      return {
        x: act20.x,
        z: act20.z,
        k: 0.62,
        share: 0,
        view: { t: [t.x, t.y, t.z], p: [t.x + c * Math.cos(C.az) * C.d, t.y + Math.sin(C.el) * C.d, t.z + c * Math.sin(C.az) * C.d] },
      };
    },
    clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v),
    r1 = (v) => Math.round(v * 10) / 10,
    swipeWhy = (dx, dy, ms, min) => (Math.abs(dx) > min ? (Math.abs(dy) > 0.5 * Math.abs(dx) ? 'crooked' : ms > D21.ms ? 'slow' : '') : 'short');
  // ── recovered (build 21) ── תרומת הדשן: the sweep of the coals (four layers), the walk down the ramp with the pan (the balance, the wind,
  // the spills), the turn at the foot, the pour onto the heap
  function d21start() {
    if (!gate21() || st.d21 || st.summary) return false;
    const h = heroP();
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    const L36d = lvOf36('deshen'),
      P36d = par36('deshen', L36d);   // ── fable32 (build 36) ── (the ashes' level: the inner coals' side of each scoop, the heavy pan, the heap's exact place) ── /fable32 ──
    st.d21 = {
      lv: L36d,
      P36: P36d,
      side: P36d.inner ? Array.from({ length: D21.layers }, () => (rng() < 0.5 ? -1 : 1)) : null,
      outer: 0,
      off: 0,
      ph: 'in',
      t: 0,
      T: 0,
      sx: h.x,
      sz: h.z,
      px: h.x,
      pz: h.z,
      vx: 0,
      vz: 0,
      yw: D21.stand.yaw,
      n: 0,
      cov: 100,
      fill: 0,
      a: 0,
      b: 0,
      v: 0,
      sy: 0,
      sT: -9,
      wd: 1,
      wt: 0,
      kd: 0,
      kt: 0,
      spills: 0,
      in: null,
    };
    if (!Number.isFinite(st.d21g0)) st.d21g0 = st.t;
    L0('d21', Math.round(h.x), Math.round(h.z));
    evlog('act_start', 'deshen');
    emit17('d21', { ph: 'in' });
    return true;
  }
  function d21swipe(dx, dy = 0, ms = 0) {
    const K = st.d21;
    if (!K || K.ph !== 'sweep') return false;
    const why = swipeWhy(dx, dy, ms, D21.sw);
    // ── fable32 (build 36) ── level 2 on: "חתה מן המאוכלות הפנימיות" — each scoop from the side where the consumed coals glow (K.side[n]);
    // a scoop from the other side takes none ("מן הפנימיות") and is counted (the rating's outer — a retry, never a loss) ── /fable32 ──
    if (!why && K.side && Math.sign(dx) !== K.side[Math.min(K.n, K.side.length - 1)]) {
      K.outer++;
      emit17('d21swipe', { ok: false, why: 'outer', n: K.outer });
      return false;
    }
    return why
      ? (emit17('d21swipe', { ok: false, why }), false)
      : (K.n++,
        (K.cov = 100 - (100 / D21.layers) * K.n),
        (K.fill = (100 / D21.layers) * K.n),
        emit17('d21swipe', { ok: true, n: K.n, cov: K.cov, fill: K.fill, dir: Math.sign(dx), at: { x: D21.bed.x, y: 25.4, z: D21.bed.z } }),
        K.n >= D21.layers && ((K.ph = 'full'), (K.t = 0), (K.swS = r1(K.T - (K.sw0 || 0))), emit17('d21', { ph: 'full' })),
        true);
  }
  function d21stick(v) {
    const K = st.d21;
    return K ? ((K.sy = Number.isFinite(+v) ? Math.max(0, Math.min(1, +v)) : 0), true) : false;
  }
  function d21bal(v) {
    const K = st.d21;
    return K ? ((K.in = v == null || !Number.isFinite(+v) ? null : clamp(+v, -1, 1)), true) : false;
  }
  function d21tap() {
    const K = st.d21;
    if (!K || K.ph !== 'foot' || !K.near) return false;
    const h = heroP();
    // ── fable32 (build 36) ── level 4: "רחוק מן הכבש שלשה טפחים" — the heap's exact place (the gold mark): a tap beside it is taken, and
    // counted (the rating's off) ── /fable32 ──
    if (K.P36 && K.P36.exact) {
      const g = D21.go[2];
      K.off = Math.hypot(g[0] - h.x, g[1] - h.z) > K.P36.exact ? 1 : 0;
      K.offD = Math.round(Math.hypot(g[0] - h.x, g[1] - h.z) * 100) / 100;
    }
    K.ph = 'go';
    K.t = 0;
    K.sx = h.x;
    K.sz = h.z;
    K.fS = r1(K.T - (K.f0 != null ? K.f0 : K.T));
    emit17('d21', { ph: 'go' });
    return true;
  }
  const move21 = (K, x, z, yaw, dt) => {
    if (dt > 0) {
      K.vx = (x - K.px) / dt;
      K.vz = (z - K.pz) / dt;
    }
    K.px = x;
    K.pz = z;
    K.yw = yaw;
    moveHero(x, z, yaw);
  };
  function d21Step(dt) {
    const K = st.d21;
    if (!K) {
      if (gate21() && !acting && !st.summary && !st.paused) {
        const h = heroP();
        if (atTop(h) && Math.hypot(D21.stand.x - h.x, D21.stand.z - h.z) <= DAY33.reach) d21start();
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const stand = D21.stand,
      head = D21.head,
      foot = D21.foot;
    if (K.ph === 'in') {
      const k = Math.min(1, K.t / 0.4);
      move21(K, K.sx + (stand.x - K.sx) * k, K.sz + (stand.z - K.sz) * k, stand.yaw, dt);
      if (k >= 1) {
        K.ph = 'sweep';
        K.t = 0;
        K.vx = K.vz = 0;
        K.sw0 = K.T;
        emit17('d21', { ph: 'sweep' });
      }
    } else if (K.ph === 'full') {
      if (K.t >= d21k('full')) {
        K.ph = 'walk';
        K.t = 0;
        K.sx = K.px;
        K.sz = K.pz;
        K.s = 0;
        K.v = 0;
        K.b = 0;
        K.L1 = Math.hypot(head.x - K.sx, head.z - K.sz);
        K.y0 = Math.atan2(head.x - K.sx, head.z - K.sz);
        emit17('d21', { ph: 'walk' });
      }
    } else if (K.ph === 'walk' || K.ph === 'desc') {
      const bal = K.P36 && K.P36.heavy ? { ...D21.bal, spill: K.P36.heavy.spill, wind: D21.bal.wind.map((x) => x * K.P36.heavy.wind), shake: D21.bal.shake.map((x) => x * K.P36.heavy.shake) } : D21.bal,   // ── fable32 (build 36) ── (level 3 on: the full silver pan — more sway, a narrower balance) ── /fable32 ──
        a = first21() ? 0 : 1,
        b = 1 - Math.exp(-dt / 0.05),
        c = foot.z - head.z;
      K.v = K.v * (1 - b) + (K.sy || 0) * bal.v * b;
      K.s = Math.min(K.L1 + c, K.s + K.v * dt);
      if (K.s < K.L1) {
        const a = K.s / K.L1;
        move21(K, K.sx + (head.x - K.sx) * a, K.sz + (head.z - K.sz) * a, K.y0, dt);
      } else {
        if (K.ph === 'walk') {
          K.ph = 'desc';
          K.t = 0;
          K.a0 = K.T;
          emit17('d21', { ph: 'desc' });
        }
        move21(K, head.x, head.z + K.s - K.L1, K.y0 * (1 - Math.min(1, K.t / 0.3)), dt);
      }
      if ((K.wt -= dt) <= 0) {
        K.wd = rng() < 0.5 ? -1 : 1;
        K.wt = 0.6 + rng() * 0.9;
      }
      (K.kt -= dt) > 0 || ((K.kd = rng() * 2 - 1), (K.kt = 0.15 + rng() * 0.15));
      K.b = clamp(
        K.b +
          (K.wd * bal.wind[a] * (0.8 + 0.4 * Math.sin(K.T * 2.3)) + (K.v / bal.v) * bal.shake[a] * K.kd + (K.in == null ? 0 : K.in) * bal.fix) * dt,
        -1,
        1,
      );
      K.a = K.b * D21.max;
      if (Math.abs(K.b) > bal.spill && !(K.T - K.sT < bal.gap)) {
        const h = heroP();
        K.sT = K.T;
        K.spills++;
        K.b *= 0.4;
        K.a = K.b * D21.max;
        K.fill = Math.max(20, K.fill - D21.loss);
        emit17('d21spill', { n: K.spills, pts: D21.pts, a: Math.sign(K.b), at: { x: h.x, y: (h.y || 16) + 1.4, z: h.z } });
        L0('d21spill');
      }
      if (K.s >= K.L1 + c) {
        K.ph = 'turn';
        K.t = 0;
        K.vx = K.vz = 0;
        K.in = null;
        K.sy = 0;
        emit17('d21', { ph: 'turn' });
      }
    } else if (K.ph === 'turn') {
      const k = Math.min(1, K.t / D21.turn);
      move21(K, foot.x, foot.z, Math.PI * k, dt);
      if (k >= 1) {
        K.ph = 'foot';
        K.t = 0;
        emit17('d21', { ph: 'foot' });
      }
    } else if (K.ph === 'foot') {
      const a = D21.go[2],
        h = heroP();
      K.near = Math.hypot(a[0] - h.x, a[1] - h.z) <= D21.nr;
      if (K.near && K.f0 == null) K.f0 = K.T;
    } else if (K.ph === 'go') {
      const a = D21.go[2],
        k = Math.min(1, K.t / 0.3);
      move21(K, K.sx + (a[0] - K.sx) * k, K.sz + (a[1] - K.sz) * k, Math.PI, dt);
      if (k >= 1) {
        K.ph = 'pour';
        K.t = 0;
        K.vx = K.vz = 0;
        emit17('d21', { ph: 'pour', at: { x: D21.heap.x, y: 16.2, z: D21.heap.z } });
      }
    } else if (K.ph === 'pour' && K.t >= d21k('pour')) d21done();
    else if (K.ph === 'end' && K.t >= D21.end) st.d21 = null;
  }
  function d21done() {
    const K = st.d21,
      spills = K.spills,
      pts = Math.max(0, D21.score - D21.pts * spills),
      at = { x: D21.heap.x, y: 17.5, z: D21.heap.z },
      rec = {
        day: st.day,
        completionTimeSeconds: r1(st.t - (Number.isFinite(st.d21g0) ? st.d21g0 : st.t - K.T)),
        ashCollectedPercent: K.fill,
        embersSpilledCount: spills,
        scoreEarned: pts,
        actS: r1(K.T),
        ownS: r1((K.swS || 0) + (K.fS || 0)),
        lv36: K.lv || 1,   // ── fable32 (build 36) ── (its level; the scoops from the outer side, the heap beside its place) ── /fable32 ──
        ...(K.side ? { outer36: K.outer | 0 } : {}),
        ...(K.P36 && K.P36.exact ? { off36: K.off | 0, offD36: K.offD } : {}),
      };
    st.d21day = st.day;
    K.ph = 'end';
    K.t = 0;
    st.d21r = rec;
    if (g22) st.fuel = Math.min(st.fuel, M22.ember);
    if (p23 && st.lot === 'deshen') {
      st.m22day = st.day;
      st.m22c = 0;
      st.npc23 = null;
      st.fuel = Math.max(st.fuel, P23.fire);
      st.lowDay = st.fuel;
      try {
        globalThis.__FLARE33 = performance.now();
      } catch (e) {}
      rec23('deshen', rec);
      emit17('p23lit', { at: { x: M22.pyre.x, y: 28, z: M22.pyre.z } });
      lit35('kasher');   // ── fable32 (build 35) ── (the court's pyre: כשר) ── /fable32 ──
    }
    end30('deshen', rec, at, p23 ? st.lot === 'deshen' && !p26 : false);   // ── fable32 (build 30) ── (the coins by the rating: were 3 / 1 / 0 by the spills) ── /fable32 ──
    score(pts, 'deshen');
    if (b17) stat('v_deshen');
    L0('d21done', rec.completionTimeSeconds, spills);
    evlog('deshen', rec);
    emit17('d21done', { ...rec, at });
    saveState('d21');
  }
  const camView = (c) => {
      const t = c.t,
        ce = Math.cos(c.el);
      return { t: [t.x, t.y, t.z], p: [t.x + ce * Math.cos(c.az) * c.d, t.y + Math.sin(c.el) * c.d, t.z + ce * Math.sin(c.az) * c.d] };
    },
    camWork21 = () => {
      const K = st.d21;
      if (!K) return null;
      const ph = K.ph,
        h = heroP();
      if (ph === 'foot') return null;
      let view;
      if (ph === 'walk' || ph === 'desc') {
        const fol = D21.fol,
          a = h.x + K.vx / 2.4,
          b = h.z + K.vz / 2.4,
          s = Math.sin(K.yw),
          c = Math.cos(K.yw),
          d = (onRamp19(a, b) ? rampY19(b) : h.y || 16) + fol.ty,
          f = fol.d * (1 + (0.15 * (K.v || 0)) / D21.bal.v),
          g = Math.cos(fol.el) * f;
        view = { t: [a, d, b], p: [a - s * g, d + Math.sin(fol.el) * f, b - c * g] };
      } else view = camView(ph === 'go' || ph === 'pour' || ph === 'end' ? D21.camP : ph === 'turn' ? D21.camC : D21.cam);
      return { x: h.x, z: h.z, view };
    },
    // ── fable32 (build 36) ── the air's band by the level (lvl36.js): level 3 on narrower about its middle (band — the share of the width
    // kept); the second pyre's (layer 4, level 4) narrower still (band2) ── /fable32 ──
    band22 = (ly) => {
      const b = M22.band[first22() ? 0 : 1],
        P = st.m22 && st.m22.P36,
        k = P ? ((ly || (st.m22 && st.m22.layer)) === 4 ? P.band2 || P.band : P.band) : 1;
      if (!(k > 0 && k < 1)) return b;
      const mid = (b[0] + b[1]) / 2,
        half = ((b[1] - b[0]) / 2) * k;
      return [Math.round((mid - half) * 1000) / 1000, Math.round((mid + half) * 1000) / 1000];
    },
    gap24 = (gap, r) => Math.max(0, (gap - 2 * r) / (gap + 2 * r)),
    pickOne = (arr) => arr[Math.floor(rng() * arr.length) % arr.length],
    budget22 = () => (p23 ? P23.budget : M22.budget)[first22() ? 0 : 1],
    ph22 = (K, ph, extra) => {
      K.ph = ph;
      K.t = 0;
      emit17('m22', { ph, ...extra });
    };
  // ── recovered (build 22) ── סידור המערכה: the logs dealt (sizes, woods, the unfit), sorted by swipes, stacked in three layers with the air
  // between them (the gaps' band), lit
  function deal22(P36) {
    const logs = [...(p23 ? P23.sizes : M22.sizes)].map((x) => ({ sp: pickOne(KINDS22[x]), size: x, ok: 1 }));
    for (let a = logs.length - 1; a > 0; a--) {
      const b = Math.floor(rng() * (a + 1)) % (a + 1);
      [logs[a], logs[b]] = [logs[b], logs[a]];
    }
    const first = first22(),
      bad = first ? KINDS22.bad : Array.from({ length: p23 ? Math.max(P23.bad[1], (P36 && P36.bad) | 0) : rng() < 0.5 ? 4 : 3 }, () => pickOne(KINDS22.bad));   // (day 1: the three unfit in order) ── fable32 (build 36) ── (level 2 on: more olive and vine among the fit — P36.bad) ── /fable32 ──
    bad.forEach((x, i) => {
      const a =
        x === 'worm'
          ? { sp: pickOne(KINDS22.M), worm: 1, size: pickOne([...'LMS']) }
          : { sp: x, size: pickOne(x === 'olive' ? ['L', 'M'] : ['M', 'S']) };
      logs.splice(first ? 1 + (p23 ? 2 : 3) * i : 1 + Math.floor(rng() * (logs.length - 1)), 0, { ...a, ok: 0 });
    });
    return logs;
  }
  function m22start() {
    if (!gate22() || st.m22 || st.summary) return false;
    const h = heroP();
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    const L36m = lvOf36('m22'),
      P36m = par36('m22', L36m);   // ── fable32 (build 36) ── (the pyre's level: the unfit woods, the air's band, the logs laid wrong counted, the second pyre) ── /fable32 ──
    st.m22 = {
      lv: L36m,
      P36: P36m,
      airMiss: 0,
      s2: 0,
      ph: 'in',
      t: 0,
      T: 0,
      sx: h.x,
      sz: h.z,
      q: deal22(P36m),
      i: -1,
      ls: 'gap',
      lt: 0,
      cur: null,
      got: [],
      bad: 0,
      pts: 0,
      warned: 0,
      s0: NaN,
      sortT: 0,
      layer: 1,
      air: 50,
      gaps: [null, null],
      mis: 0,
    };
    evlog('act_start', 'maaracha');
    emit17('m22', { ph: 'in' });
    return true;
  }
  function m22swipe(dx, dy = 0, ms = 0) {
    const m22 = st.m22;
    if (!m22 || m22.ph !== 'sort' || m22.ls !== 'on') return null;
    const a = swipeWhy(dx, dy, ms, M22.sw);
    if (a) {
      emit17('m22sw', { ok: false, why: a });
      return null;
    }
    const cur = m22.cur,
      b = dx > 0,
      c = { take: b, fit: !!cur.ok, sp: cur.sp, worm: !!cur.worm };
    if (b && cur.ok) m22.got.push({ sp: cur.sp, size: cur.size, at: null });
    else if (b) {
      m22.bad++;
      c.warn = first22() && !m22.warned;
      if (c.warn) m22.warned = 1;
      else m22.pts += M22.pts;
      c.pts = c.warn ? 0 : M22.pts;
    } else if (cur.ok) m22.q.push({ ...cur });
    m22.ls = 'out';
    m22.lt = 0;
    c.n = m22.got.length;
    emit17('m22sw', { ok: true, ...c });
    if (m22.got.length >= need22()) {
      m22.sortT = r1(st.t - m22.s0);
      ph22(m22, 'sorted', { s: m22.sortT });
    }
    return c;
  }
  function air22() {
    const K = st.m22,
      band = band22(),
      gaps = [];
    for (const x of [1, 2]) {
      const a = K.got.filter((q) => q.at && q.at.ly === x),
        b = M22.r['LM'[x - 1]],
        c = a.length === 2 ? Math.abs(a[0].at.x - a[1].at.x) - 2 * b : null;
      K.gaps[x - 1] = c == null ? null : Math.round(c * 100) / 100;
      if (c != null) gaps.push(gap24(c + 2 * b, b));
    }
    K.gap = gaps.length ? gaps.reduce((s, x) => s + x, 0) / gaps.length : null;
    K.air = K.gap == null ? 50 : Math.max(0, Math.round(100 - (15 * Math.abs(K.gap - (band[0] + band[1]) / 2)) / ((band[1] - band[0]) / 2)));
    // ── fable32 (build 36) ── level 4: "וסדרו מערכה שניה של קטרת" (תמיד ב, ה) — after the big pyre, two fig logs for the second, its band
    // narrower still (layer 4: beside the big one — המחשה: nearer than the mishnah's place, so it is in the frame) ── /fable32 ──
    if (K.ph === 'stack' && K.layer === 4 && K.P36 && K.P36.second && !K.s2) {
      K.s2 = 1;
      for (let i = 0; i < K.P36.second; i++) K.got.push({ sp: 'fig', size: 'M', at: null, s2: 1 });
      emit17('m22', { ph: 'second', n: K.P36.second });
      return;
    }
    if (K.ph === 'stack' && K.layer > (K.s2 ? 4 : 3)) ph22(K, 'ready');
  }
  function m22place(x, dy = 0) {
    const m22 = st.m22;
    if (!m22 || m22.ph !== 'stack') return null;
    const a = m22.got[x];
    if (!a || a.at) return null;
    const layer = m22.layer,
      b = sz22(layer),   // ── fable32 (build 36) ── (layer 4: the second pyre's fig logs) ── /fable32 ──
      span = M22.span;
    if (a.size !== b) {
      m22.mis++;
      emit17('m22no', { k: x, ly: layer, lat: clamp(+dy || 0, -span, span) });
      return { ok: false, why: b };
    }
    let c = m22.got.filter((x) => x.at && x.at.ly === layer),
      d = 2 * M22.r[b],
      f = layN22(layer),
      g = f < 2 ? 0 : layer === 3 ? (c.length ? 0.16 : -0.16) : clamp(+dy || 0, -span, span);
    if ((layer < 3 || layer === 4) && f > 1 && c.length) {
      const x0 = c[0].at.x;
      if (Math.abs(g - x0) < d) {
        g = x0 + (g >= x0 ? d : -d);
        if (Math.abs(g) > span) g = x0 - Math.sign(g) * d;
      }
      const a = gap24(Math.abs(g - x0), M22.r[b]),
        f = band22(layer);
      if (a < f[0] || a > f[1]) {
        const b = a < f[0] ? 'tight' : 'wide';
        if (m22.P36 && m22.P36.strict) m22.airMiss++;   // ── fable32 (build 36) ── (level 3 on: a log laid outside the band is counted — the rating's airMiss36) ── /fable32 ──
        emit17('m22air', { k: x, ly: layer, why: b, gap: Math.round(a * 100) });
        return { ok: false, why: b, gap: a };
      }
    }
    a.at = { ly: layer, x: g };
    st.logs = Math.max(0, st.logs - 1);
    st.m22c = Math.max(0, (st.m22c | 0) - 1);
    if (c.length + 1 >= f) m22.layer++;
    air22();
    emit17('m22put', { k: x, ly: layer, air: m22.air });
    return { ok: true, ly: layer, x: g, air: m22.air };
  }
  const layN22 = (layer) => (layer === 4 ? 2 : p23 ? P23.layn[layer - 1] : 2),   // ── fable32 (build 36) ── (layer 4: the second pyre's two) ── /fable32 ──
    sz22 = (layer) => (layer === 4 ? 'M' : 'LMS'[layer - 1]),
    two22 = (layer) => (layer < 3 || layer === 4) && layN22(layer) > 1;
  function hold22(K) {
    const size = sz22(K.layer),
      laid = K.got.filter((x) => x.at && x.at.ly === K.layer);
    K.hold = K.got.findIndex((x) => !x.at && x.size === size && (K.layer === 4 ? x.s2 : !x.s2));
    K.gl = two22(K.layer) && !laid.length ? M22.l0 * (K.layer === 2 || K.layer === 4 ? 0.75 : 1) : 0;
  }
  function m22stick(v) {
    const K = st.m22;
    return K ? ((K.sv = Number.isFinite(+v) ? clamp(+v, -1, 1) : 0), true) : false;
  }
  function m22put() {
    const m22 = st.m22;
    if (!m22) return false;
    if (m22.ph === 'ready') return m22tap();
    if (m22.ph !== 'stack' || !(m22.hold >= 0)) return false;
    const a = m22place(m22.hold, m22.gl);
    if (a && a.ok && m22.ph === 'stack') hold22(m22);
    return !!(a && a.ok);
  }
  function m22tap() {
    const m22 = st.m22;
    return !m22 || m22.ph !== 'ready' ? false : (ph22(m22, 'ignite'), true);
  }
  function m22Step(dt) {
    const K = st.m22;
    if (!K) {
      if (gate22() && !acting && !st.summary && !st.paused && !st.d21) {
        const h = heroP(),
          stand = STN.wood.stand;
        if (!onHigh(h.x, h.z) && Math.hypot(stand.x - h.x, stand.z - h.z) <= DAY33.reach) m22start();
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const sortAt = M22.sortAt,
      stand = M22.stand;
    if (K.ph === 'in' || K.ph === 'stackIn') {
      const a = K.ph === 'in' ? sortAt : stand,
        k = Math.min(1, K.t / 0.5);
      moveHero(K.sx + (a.x - K.sx) * k, K.sz + (a.z - K.sz) * k, a.yaw);
      if (k >= 1) {
        ph22(K, K.ph === 'in' ? 'sort' : 'stack');
        if (K.ph === 'stack') hold22(K);
      }
    } else if (K.ph === 'sort') {
      K.lt += dt;
      const a = first22(),
        b = Number.isFinite(K.s0) && st.t - K.s0 > budget22();
      if (K.ls === 'out' && K.lt >= 0.12) {
        K.ls = 'gap';
        K.lt = 0;
      }
      if (K.ls === 'gap' && K.lt >= M22.next[a ? 0 : 1][b ? 1 : 0] && K.i + 1 < K.q.length) {
        K.cur = K.q[++K.i];
        K.ls = 'on';
        K.lt = 0;
        if (!Number.isFinite(K.s0)) K.s0 = st.t;
      }
    } else if (K.ph === 'sorted') {
      if (K.t >= (p23 ? P23.sorted : M22.sorted)) {
        const a = need22();
        st.logs += a;
        st.m22c = a;
        if (b19) K.slip0 = st.r19.slips | 0;   // ── fable32 (build 35) ── (the run's drops are counted from here) ── /fable32 ──
        ph22(K, 'carry');
        emit17('done', { text: p23 ? 'ארבעה גזרים כשרים!' : 'שישה גזרים כשרים!', sub: 'למזבח' });
      }
    } else if (K.ph === 'carry') {
      const h = heroP();
      if (
        atTop(h) &&
        !acting &&
        !(e35 && b19 && st.r19.fl.length) &&   // ── fable32 (build 35) ── (a log dropped on the ramp: picked up first — the pyre needs all of them) ── /fable32 ──
        (Math.hypot(stand.x - h.x, stand.z - h.z) <= DAY33.reach || Math.hypot(M22.pyre.x - h.x, M22.pyre.z - h.z) <= DAY33.layReach)
      ) {
        if (o.walk && o.walk.stop) say(() => o.walk.stop());
        goal = null;
        drive(0, 0);
        K.ph = 'stackIn';
        K.t = 0;
        K.sx = h.x;
        K.sz = h.z;
      }
    } else if (K.ph === 'stack') {
      const layer = K.layer,
        a = two22(layer),
        b = K.got.filter((x) => x.at && x.at.ly === layer),
        c = M22.r[sz22(layer)];
      if (a) K.gl = clamp(K.gl + (K.sv || 0) * M22.gv * dt, -M22.span, M22.span);
      K.pv = a && b.length === 1 ? gap24(Math.max(2 * c, Math.abs(K.gl - b[0].at.x)), c) : null;
    } else if (K.ph === 'ignite' && K.t >= M22.ign) m22done();
    else if (K.ph === 'end' && K.t >= M22.end) st.m22 = null;
  }
  function m22done() {
    const K = st.m22,
      air = K.air,
      bad = K.bad,
      at = { x: M22.pyre.x, y: 28, z: M22.pyre.z },
      good = air >= M22.good,
      k = Math.max(0, M22.score + (good ? M22.airB : 0) - K.pts - 10 * K.mis),   // ── fable32 (build 30) ── (no "fast" points; the coins by the rating below) ── /fable32 ──
      n = Math.round(M22.fire[0] + M22.fire[1] * air),
      b = {
        day: st.day,
        sortingTimeSeconds: K.sortT,
        structuralIntegrityScore: Math.max(0, 100 - M22.mis * K.mis),
        airflowQualityScore: air,
        airGap: K.gap == null ? null : Math.round(K.gap * 100),
        invalidWoodSelectedCount: bad,
        warned: K.warned | 0,   // ── fable32 (build 30) ── (the first morning's warned wood: not in the rating) ── /fable32 ──
        finalScoreEarned: k,
        fire: n,
        actS: r1(K.T),
        cracks: K.mis,
        lv36: K.lv || 1,   // ── fable32 (build 36) ── (its level; the logs laid outside the band at level 3 on; the second pyre at level 4) ── /fable32 ──
        ...(K.P36 && K.P36.strict ? { airMiss36: K.airMiss | 0 } : {}),
        ...(K.s2 ? { second36: K.got.filter((x) => x.s2 && x.at).length } : {}),
        ...(e35 && K.run ? { run: { ...K.run } } : {}),   // ── fable32 (build 35) ── (the ramp run inside the act: its time, its grade, its drops — not in the rating) ── /fable32 ──
      };
    st.m22day = st.day;
    st.m22r = b;
    st.m22c = 0;
    K.ph = 'end';
    K.t = 0;
    if (p23) {
      st.npc23 = null;
      rec23('m22', b);
    }
    lit35(end30('m22', b, at, p23 ? !p26 : true));   // ── fable32 (build 30) ── ── /fable32 ── ── fable32 (build 35) ── (his pyre's rating: the fire's look) ── /fable32 ──
    if (e35) b.look = st.fire35;
    st.fuel = Math.max(st.fuel, n);
    st.lowDay = st.fuel;
    try {
      globalThis.__FLARE33 = performance.now();
    } catch (e) {}
    score(k, 'm22');
    L0('m22done', b.sortingTimeSeconds, bad, air);
    evlog('maaracha', b);
    emit17('m22done', { ...b, at });
    saveState('m22');
  }
  // ── recovered (build 23) ── the lot (pis23.js): the circle (seat23), the raised fingers, the ממונה's count, the cards; the record
  // (save.roles23: rec23, mastery23); build 26b: free26/circle26 — the second lot's circle forms where he stands
  const CIRC23 = Object.freeze({ x: P23.c.x, z: P23.c.z, a0: Math.PI }),
    circ23 = () => (st.p23 && st.p23.C) || CIRC23,
    seat23 = (i, C = circ23()) => {
      const a = C.a0 + (i * 2 * Math.PI) / P23.seats;
      return { x: C.x + Math.cos(a) * P23.r, z: C.z + Math.sin(a) * P23.r };
    },
    free26 = (x, z) =>
      !onHigh(x, z) &&
      !(x < -54.95 && x > -76.5 && Math.abs(z) < 50.5) &&
      !(x > -54.6 && x < -21.4 && z > -62.6 && z < -26.4) &&
      [
        [0, 0],
        [0.5, 0],
        [-0.5, 0],
        [0, 0.5],
        [0, -0.5],
      ].every(([arr, a]) => free(x + arr, z + a));
  function circle26(h) {
    let best = null;
    for (const [x, q] of [[0, 0], ...[0.8, 1.6].flatMap((x) => [0, 1, 2, 3, 4, 5, 6, 7].map((q) => [x, (q * Math.PI) / 4]))]) {
      const a = h.x + Math.cos(q) * x,
        b = h.z + Math.sin(q) * x;
      if (x && !free26(a, b)) continue;
      const ang = Math.atan2(P26.gate.z - b, P26.gate.x - a);
      for (let i = 0; i < 16; i++) {
        let c = ang + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 8),
          d = { x: a + Math.cos(c) * P23.r, z: b + Math.sin(c) * P23.r, a0: c + Math.PI },
          f = free26(d.x, d.z) ? 1 : 0;
        for (let i = 1; i < P23.seats; i++) {
          const a = seat23(i, d);
          if (free26(a.x, a.z)) f++;
        }
        if (f === P23.seats) return d;
        if (!best || f > best.n) best = { C: d, n: f };
      }
    }
    return best.C;
  }
  function camAz23(C) {
    for (let i = 0; i < 9; i++) {
      const a = P23.cam.az + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.45,
        b = Math.cos(P23.cam.el) * P23.cam.d,
        c = C.x + Math.cos(a) * b,
        d = C.z + Math.sin(a) * b;
      if (free(c, d) && free((c + C.x) / 2, (d + C.z) / 2) && !onHigh(c, d)) return a;
    }
    return P23.cam.az;
  }
  function p23start(k26) {
    if (!(k26 ? gate26L() : gate23()) || st.p23 || st.summary) return false;   // ── fable32 (build 26) ── (k26: the second lot — the same circle, its own registry and count) ── /fable32 ──
    const h = heroP(),
      rec = k26 ? roles26() : roles23(),
      n = (rec.m | 0) + 1,
      ids = k26
        ? draw26(
            n,
            rec,
            POOL26.filter((x) => x.built && (p27 || !blood27(x.id))).map((x) => x.id),   // ── fable32 (build 27) ── ── /fable32 ──
            rng,
            Object.fromEntries(POOL26.map((x) => [x.id, timesOf(roles23(), x.id)])),
          )
        : draw23(
            n,
            rec,
            POOL23.filter((x) => x.built && (p25 || x.id !== 'lamb')).map((x) => x.id),
            rng,
          ),
      a = ids.length > 1,
      b = [1];
    for (let i = 1; i < P23.seats; i++) b.push(rng() < 0.5 ? 1 : 2);
    let c = P23.seats - (a || k26 ? P23.n2 : P23.n1) + 1,
      d = 1;
    for (let a = c; a < P23.seats; a++) d += b[a];
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    const f = k26 ? circle26(h) : CIRC23,
      g = seat23(0, f);
    st.p23 = {
      ph: 'in',
      t: 0,
      T: 0,
      t0: st.t,
      n,
      cards: ids,
      F: b,
      s0: c,
      N: d,
      k: -1,
      pick: -1,
      auto: false,
      raised: false,
      rS: null,
      sx: h.x,
      sz: h.z,
      dur: Math.max(k26 ? P26.lotIn : P23.in, Math.hypot(g.x - h.x, g.z - h.z) / 9),
      k26: !!k26,
      C: f,
      caz: k26 ? camAz23(f) : P23.cam.az,
    };
    L0('p23', n, ids.join('/'));
    evlog('act_start', k26 ? 'p26' : 'p23');
    emit17('p23', { ph: 'in', n, cards: ids, F: b, s0: c, N: d, k26: !!k26, C: f });
    return true;
  }
  function p23Step(dt) {
    const K = st.p23;
    if (!K) {
      if (gate23() && !st.k20 && !acting && !st.summary && !st.paused) p23start();
      else if (gate26L() && !acting && !st.summary && !st.paused && !st.d21 && !st.m22 && !st.p25 && !(st.end30 && st.t < st.end30.until)) {   // ── fable32 (build 30) ── (the second lot waits for the act's rating word: its source line shows) ── /fable32 ──
        const h = heroP();
        if ((h.y || 16) < 20 && !onHigh(h.x, h.z)) p23start(true);
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const a = K.C || CIRC23,
      b = seat23(0, a),
      ang = Math.atan2(a.x - b.x, a.z - b.z),
      c = K.cards.length > 1;
    if (K.ph === 'in') {
      const k = Math.min(1, K.t / K.dur);
      moveHero(K.sx + (b.x - K.sx) * k, K.sz + (b.z - K.sz) * k, k < 1 ? Math.atan2(b.x - K.sx, b.z - K.sz) : ang);
      if (k >= 1) {
        K.ph = 'raise';
        K.t = 0;
      }
    } else if (K.ph === 'raise') {
      if (!K.raised && K.T >= P23.fin.auto) p23raise('auto');
      if (K.raised) {
        K.ph = 'call';
        K.t = 0;
        emit17('p23', { ph: 'call', N: K.N });
      }
    } else if (K.ph === 'call') {
      if (K.t >= P23.call) {
        K.ph = 'count';
        K.t = P23.step;
      }
    } else if (K.ph === 'count') {
      if (K.t >= P23.step) {
        K.t = 0;
        const a = P23.seats - K.s0 + 1;
        if (K.k + 1 < a) {
          K.k++;
          let b = (K.s0 + K.k) % P23.seats,
            c = 1;
          for (let s0 = K.s0; s0 < K.s0 + K.k; s0++) c += K.F[s0 % P23.seats];
          emit17('p23tick', { k: K.k, i: b, from: c, to: Math.min(K.N, c + K.F[b] - 1), last: K.k === a - 1 });
        } else {
          K.ph = c ? 'choose' : 'show';
          K.pick = c ? -1 : 0;
          emit17('p23', { ph: K.ph, cards: K.cards });
        }
      }
    } else if (K.ph === 'choose') {
      if (K.t >= P23.pick) p23pick(0, true);
    } else if (K.ph === 'show' && K.t >= (c ? P23.show2 : K.k26 ? 0.9 : P23.show)) p23done();
  }
  function p23raise(how) {
    const K = st.p23;
    return !K || K.raised || (K.ph !== 'in' && K.ph !== 'raise')
      ? false
      : ((K.raised = how === 'auto' ? 'auto' : true),
        (K.rS = r1(K.T)),
        emit17('p23raise', { auto: K.raised === 'auto', s: K.rS }),
        L0('p23raise', K.rS),
        true);
  }
  function p23pick(i, auto) {
    const K = st.p23;
    return !K || K.ph !== 'choose' || !(i >= 0 && i < K.cards.length)
      ? false
      : ((K.pick = i | 0),
        (K.auto = !!auto),
        (K.ph = 'show'),
        (K.t = 0),
        emit17('p23', { ph: 'show', pick: K.pick, auto: K.auto, cards: K.cards }),
        true);
  }
  function p23done() {
    const K = st.p23,
      role = K.cards[Math.max(0, K.pick)],
      rec = K.k26 ? roles26() : roles23();
    st.p23 = null;
    if (K.k26) {
      st.p26day = st.day;
      st.role26 = role;
      st.l26t = st.t;   // ── fable32 (build 27) ── (the lot's end: the inner roles' winners go up to the gate) ── /fable32 ──
      rec.m = K.n;
      rec.h = [...(rec.h || []), [K.n, role]].slice(-8);
      say(() => o.persist && o.persist());
      const a = { id: role, cards: K.cards, n: K.n, s: r1(K.T), up: K.rS, upAuto: K.raised === 'auto', k26: true };
      j32lot(true);   // ── fable32 (build 32) ── ── /fable32 ──
      L0('p26done', role, a.s);
      evlog('lot26', a);
      emit17('p23done', a);
      saveState('p26');
      return;
    }
    st.p23day = st.day;
    st.lot = role;
    rec.m = K.n;
    rec.h = [...(rec.h || []), [K.n, role, ...K.cards]].slice(-8);
    say(() => o.persist && o.persist());
    st.fuel = Math.min(st.fuel, M22.ember);
    if (role === 'm22') {
      st.d21day = st.day;
      st.npc23 = 'deshen';
    } else st.npc23 = 'm22';
    if (p25)
      if (role === 'lamb') st.d21day = st.day;
      else {
        st.npc25 = st.day;
        lambIn();
      }
    const a = { id: role, cards: K.cards, pick: K.pick, auto: K.auto, n: K.n, s: r1(K.T), up: K.rS, upAuto: K.raised === 'auto' };
    j32lot(false);   // ── fable32 (build 32) ── ── /fable32 ──
    L0('p23done', role, a.s);
    evlog('lot', a);
    emit17('p23done', a);
    saveState('p23');
  }
  function rec23(id, r) {
    const rolesBook = roles23(),
      m = rolesBook[id] || (rolesBook[id] = { n: 0, best: 0, last: 0 }),
      q = quality30(id, r),   // ── fable32 (build 30) ── (accuracy only: mastery23 = round(100 q); its rating, counted in the record's r30) ── /fable32 ──
      mastery = mastery23(id, r),
      rating = rate30(q),
      oldBest = m.best | 0,
      first = !m.n,
      was = role30(m).best,
      c = m.r30 && typeof m.r30 === 'object' ? m.r30 : (m.r30 = { h: 0, k: 0, t: 0, best: null });
    if (!prac && id !== 'kiyor' && !Math.max(0, (m.n | 0) - (m.pr | 0))) st.fresh35 = st.day;   // ── fable32 (build 35) ── (a role he never had in a real morning: the task "תפקיד שלא היה לך עד היום") ── /fable32 ──
    m.n = (m.n | 0) + 1;
    if (prac) m.pr = (m.pr | 0) + 1;   // ── fable32 (build 31) ── (a practice run: its own count — the lot reads n − pr) ── /fable32 ──
    m.last = mastery;
    m.best = Math.max(oldBest, mastery);
    c[RATE30.key[rating]] = (c[RATE30.key[rating]] | 0) + 1;
    c.best = best30(c.best, rating);
    // ── fable32 (build 36) ── the act's level counted (lvl36.js rec36): its mastery points (never lost), the next level opened at two
    // מהודר, a title risen to — in a real morning a card after the rating's word (st.l36q, as the journal's) and a page in the journal;
    // in practice the end card says it (the record goes back whole: merge31) ── /fable32 ──
    const L36r = Math.max(1, Math.min(4, r.lv36 | 0 || 1)),
      u36 = rec36(m, L36r, rating, { d: st.day, t: now32(), pr: !!prac });
    if (u36) {
      r.lv36 = L36r;
      r.pts36 = u36.pts;
      if (u36.up) r.up36 = u36.up.ti;
      if (u36.opened) r.open36 = u36.opened;
      if (u36.up || u36.opened) {
        emit17('l36up', { id, lv: L36r, ti: u36.up ? u36.up.ti : null, opened: u36.opened, title: u36.title.he, was: u36.was.he, pts: u36.total });
        if (!prac && b17) (st.l36q || (st.l36q = [])).push({ id, kind: 'l36', lv: L36r, ti: u36.up ? u36.up.ti : null, opened: u36.opened, at: st.t + J32.cardS });
      }
    }
    r.mastery = mastery;
    r.q = Math.round(q * 1000) / 1000;
    r.rating = rating;
    r.rec = !first && mastery > oldBest;
    if (prac) r.practice = true;
    say(() => o.persist && o.persist());
    // ── fable32 (build 31) ── a practice run's record goes to the player's own save (shift/index.js: merge31 — this role's entry only) ── /fable32 ──
    if (prac) emit17('p31rec', { id, rec: JSON.parse(JSON.stringify(m)), rating, q: r.q });
    emit17('p23rec', { id, m: mastery, prev: oldBest, best: m.best, rec: !first && mastery > oldBest, first, n: m.n, rating, was: was || null });
    L0('p23rec', id, mastery, oldBest);
  }
  // ── fable32 (build 30) ── the act's end: its rating (the record's, or rate30 of its quality), its coins by the rating (RATE30.pay: מהודר 3
  // · כשר 2 · טעון תיקון 1 — "טעון תיקון" pays too: a label, never a loss), the day's list (its summary), the word in the step card for
  // RATE30.wordS; "rate30" for the end card (end30.js: the source line, its card). morning: the morning's last act — "שימשת N בקרים" ── /fable32 ──
  function end30(id, rec, at, morning) {
    const q = rec.q != null ? rec.q : Math.round(quality30(id, rec) * 1000) / 1000,
      rating = rec.rating || rate30(q),
      coins = prac && !prac.ch33 ? 0 : pay30(rating);   // ── fable32 (build 31) ── (a practice run: no coins) ── /fable32 ── ── fable32 (build 33) ── (the chamber's inspection is an act like any: its coins by the rating — shift/index.js adds them to his save; nothing else) ── /fable32 ──
    Object.assign(rec, { q, rating, coins });
    st.r30day = [...(Array.isArray(st.r30day) ? st.r30day : []), [id, rating]].slice(-12);
    st.l36day = [...(Array.isArray(st.l36day) ? st.l36day : []), [id, rating, rec.lv36 | 0 || 1]].slice(-12);   // ── fable32 (build 36) ── (the day's acts with their levels: "בוקר מהודר") ── /fable32 ──
    st.end30 = { id, rating, until: st.t + RATE30.wordS };
    st.say30 = null;
    pay(coins, id, at);
    if (!prac) j32end(id, rating);   // ── fable32 (build 32) ── (the journal: its pages, the morning's entry, the unlock card) ── /fable32 ──
    if (morning && !prac) morning30();   // ── fable32 (build 31) ── (a practice run is not a morning served) ── /fable32 ──
    // ── fable32 (build 31) ── the practice's end: its card as the rating's word ends (tick: "p31end") — only his own role's act ends it ── /fable32 ──
    if (prac && id === prac.role && !prac.end) prac.end = { id, rating, q, at: st.t + PRAC31.endS, shown: false, lv36: rec.lv36 | 0, pts36: rec.pts36 | 0, open36: rec.open36 | 0, ...(prac.ch33 ? { ch33: true, out: prac.ch33.out, blem: prac.ch33.blem || null, coins } : {}) };   // ── fable32 (build 33) ── (the chamber's: the lamb in or out, its blemish, the coins) ── /fable32 ──
    emit17('rate30', { id, rating, q, he: ACT30[id] ? ACT30[id].he : id, coins, at: at || null, served: served30(save) });
    evlog('rate30', { id, rating, q });
    L0('rate30', id, rating, q);
    return rating;
  }
  /** ── fable32 (build 31) ── a practice run: he stands where his act begins (each act's own start test then takes him in at once — the
   *  laver by wake23, the ashes on the altar's top at their place, the pyre at the wood chamber's sorting place, the lamb at the pen's door,
   *  the Heichal's two at its gate, the shochet east of the lamb, the zorek at the vessel by its neck) ── /fable32 ── */
  function place31() {
    const r = prac && prac.role;
    if (!r || r === 'kiyor') return;
    const w = STN.wood && STN.wood.stand,
      at =
        r === 'deshen'
          ? { x: D21.stand.x, z: D21.stand.z, yaw: D21.stand.yaw }
          : r === 'm22'
            ? w
              ? { x: w.x, z: w.z, yaw: Math.PI / 2 }
              : null
            : r === 'lamb' && prac.ch33
              ? { x: CH33.start.x, z: CH33.start.z, yaw: CH33.start.yaw }   // ── fable32 (build 33) ── (the chamber: in the azara before Beit HaMoked's door — the left thumb walks him in) ── /fable32 ──
              : r === 'lamb'
              ? { x: P25.stand.x, z: P25.stand.z, yaw: Math.atan2(P25.door.x - P25.stand.x, P25.door.z - P25.stand.z) }
              : r === 'inner' || r === 'menorah'
                ? { x: P26.gate.x + 1.2, z: P26.gate.z, yaw: -Math.PI / 2 }
                : r === 'shochet'
                  ? { x: P27.stand.x, z: P27.stand.z, yaw: -Math.PI / 2 }
                  : { x: P27.recv.x, z: P27.recv.z, yaw: Math.atan2(P27.lamb.x - P27.recv.x, P27.lamb.z - P27.recv.z) };
    if (at) moveHero(at.x, at.z, at.yaw);
    L0('p31', r, prac.seed);
    evlog('practice31', { id: r, seed: prac.seed });
  }
  /** the morning served (once a day): save.served30 — from an older save's second lots (served30) on */
  function morning30() {
    if (st.srv30 === st.day) return;
    st.srv30 = st.day;
    save.served30 = served30(save) + 1;
    served32(save, st.day);   // ── fable32 (build 32) ── (the journal's entry of this morning: served whole) ── /fable32 ──
    // ── fable32 (build 36) ── "בוקר מהודר" (svivat-avoda-he.md §4.4 — a challenge he may take, never a streak): every act of his this
    // morning מהודר, each at level 3 or more → its page in the journal (save.lvl36.boker) and its card ── /fable32 ──
    const acts36 = (Array.isArray(st.l36day) ? st.l36day : []).filter((x) => Array.isArray(x) && LVL36[x[0]]);
    if (boker36(acts36) && addBoker36(save, st.day, now32(), acts36)) {
      emit17('l36boker', { day: st.day, acts: acts36.map((x) => x.slice()) });
      if (b17) (st.l36q || (st.l36q = [])).push({ id: 'boker', kind: 'boker36', at: st.t + J32.cardS + 0.05 });
    }
    say(() => o.persist && o.persist());
  }
  // ── fable32 (build 32) ── the kohen's journal (journal32.js; book32.js shows it). An act's end in a real morning: its pages are his
  // (meet32), the morning's entry gets its rating (log32: the real time — time29's clock — and the Hebrew date where the phone is); the
  // first time the lot's role ends ("עמוד חדש ביומן") — or the first page ever ("היומן שלך נפתח") — its card comes as the act's rating
  // word ends (J32.cardS = RATE30.wordS): the day waits under it (paused, "j32new") until "המשך" or the journal closes (E.j32done) ── /fable32 ──
  const now32 = () => {
      try {
        return o.now ? +o.now() : clock29();
      } catch (e) {
        return Date.now();
      }
    },
    where32 = () => {
      try {
        return o.where ? o.where() : where29();
      } catch (e) {
        return null;
      }
    };
  function j32end(id, rating) {
    const t = now32(),
      m = meet32(save, id, { d: st.day, t });
    log32(save, { d: st.day, t, h: hebDate32(t, where32()) }, id, rating);
    if (m && m.fresh) emit17('j32page', { id, hello: m.hello });
    if (m && b17 && (m.card || m.hello) && !st.j32q && !st.j32card) {
      st.j32q = { id, hello: !!m.hello, at: st.t + J32.cardS };
      L0('j32q', id, m.hello ? 1 : 0);
    }
    say(() => o.persist && o.persist());
  }
  /** the lot's end: its page (the lot's own source) is his — no card (the lot is not a role) */
  function j32lot(k26) {
    if (prac) return;
    meet32(save, k26 ? 'lot2' : 'lot', { d: st.day, t: now32() });
  }
  /** the tick: the card as the word ends (not over the day's summary or the night: then the page waits, "חדש", without a card) */
  function j32Step() {
    const Q = st.j32q;
    if (!Q || st.t < Q.at) return false;
    st.j32q = null;
    if (st.summary || st.night || st.phase !== 'run') return false;
    const j = jr32(save);
    if (Q.hello && j) j.hello = true;
    st.j32card = { id: Q.id, hello: Q.hello };
    st.paused = true;
    drive(0, 0);
    let26();
    evlog('journal32_card', { id: Q.id, hello: Q.hello });
    L0('j32new', Q.id, Q.hello ? 1 : 0);
    emit17('j32new', { id: Q.id, hello: Q.hello });
    say(() => o.persist && o.persist());
    return true;
  }
  // ── fable32 (build 36) ── the levels' cards (a title risen to, a level opened, "בוקר מהודר") — the journal's card's way: as the act's
  // rating word ends, after any journal card, the day waiting under it until "המשך" (E.j32done); never in practice ── /fable32 ──
  function l36Step() {
    const q = st.l36q;
    if (!Array.isArray(q) || !q.length || st.j32q || st.j32card || st.tl33card || st.t < q[0].at) return false;
    const Q = q.shift();
    if (prac || st.summary || st.night || st.phase !== 'run') return false;
    st.j32card = { id: Q.id, kind: Q.kind, lv: Q.lv | 0, ti: Q.ti || null, opened: Q.opened | 0 };
    st.paused = true;
    drive(0, 0);
    let26();
    evlog('l36_card', { id: Q.id, kind: Q.kind, lv: Q.lv, ti: Q.ti, opened: Q.opened });
    L0('l36new', Q.id, Q.kind);
    emit17('l36new', { ...st.j32card });
    return true;
  }
  /** the card closed ("המשך", or the journal it opened): the day goes on */
  function j32done() {
    if (!st.j32card) return false;
    st.j32card = null;
    st.paused = false;
    return true;
  }
  // ── fable32 (build 33) ── "הטלה המבוקר" in a real morning (lamb33.js; time-gating-hooks-he.md hook 1): the morning's Tamid lamb is the
  // oldest of his that is ready (inspected four or more real days ago — the chamber's kohanim's offerings of those he did not come for
  // settled first), assigned once a game day: for the lamb's role when he takes it at the pen (the pen's first lamb is his, whole, with
  // its tag — newLamb25), for any other role once the first lot is done. Its card once ("tl33new": "הטלה שבדקת ביום שני עולה היום
  // לתמיד" — the day waits under it, as under the journal's card, until "המשך": E.tl33done); the lamb leaves the chamber (offer33) and the
  // morning's journal entry has it. Never in practice, never in the chamber's run; nothing of it is power — no speed, no bonus. ── /fable32 ──
  const dn33 = () => day33n(now32(), where32());
  function tl33take() {
    if (prac || !b17) return null;
    let L = ofDay33(save, st.day);
    if (!L) {
      const dn = dn33(),
        P = pick33(save, dn);
      if (!P) return null;
      const t = now32();
      L = offer33(save, P, { dn, gd: st.day, t, h: hebDate32(t, where32()) });
      L0('tl33', L.i, L.c);
      evlog('tl33', { i: L.i, c: L.c, d: L.d, gd: st.day });
    }
    try {
      const j = jr32(save),
        e = j && j.log.find((x) => x && x.d === st.day);
      if (e) e.l33 = L.c + 1;   // (the morning's entry in "הבקרים שלי": its lamb)
    } catch (e) {}
    st.tl33c = L.c;
    st.tl33cd = st.day;
    say(() => o.persist && o.persist());
    return { i: L.i, c: L.c, d: L.d };
  }
  function tl33Step() {
    if (prac || !b17 || st.tl33card || st.j32card || st.j32q || st.summary || st.night || st.phase !== 'run') return false;
    const K = st.p25;
    let m = null,
      role = '';
    if (K && K.mine && K.k === 0 && K.ph === 'scan') {
      m = K.mine;
      role = 'lamb';
    } else if (p23 && st.p23day === st.day && !st.p23 && !(p25 && st.lot === 'lamb')) {
      if (st.tl33try !== st.day) {
        st.tl33try = st.day;
        st.tl33m = tl33take();
        st.tl33at = st.t + 1.2;   // (a moment after the lot's end)
      }
      if (st.tl33m && st.t >= st.tl33at && !act30()) {
        m = st.tl33m;
        role = st.lot;
      }
    }
    if (!m) return false;
    const L = ofDay33(save, st.day);
    if (!L || L.i !== m.i || L.seen) return false;
    L.seen = 1;
    st.tl33card = { i: L.i, c: L.c, d: L.d, role };
    st.paused = true;
    drive(0, 0);
    let26();
    L0('tl33new', L.i, role);
    evlog('tl33_card', { i: L.i, role });
    emit17('tl33new', { i: L.i, c: L.c, d: L.d, role, line: upLine33(L, dn33()) });
    say(() => o.persist && o.persist());
    return true;
  }
  function tl33done() {
    if (!st.tl33card) return false;
    st.tl33card = null;
    st.paused = false;
    return true;
  }
  const wake23 = () => {
      const s = standOf('kiyor');
      if (s) moveHero(s.x, s.z, -Math.PI / 2);
      st.p23 = null;
    },
    camWork23 = () => {
      const K = st.p23;
      if (!K) return null;
      const C = K.C || CIRC23;
      return { x: C.x, z: C.z, view: K.k26 ? camView({ ...P23.cam, az: K.caz, t: { x: C.x, y: P23.cam.t.y, z: C.z } }) : camView(P23.cam) };
    },
    lambIn = () => {
      const l = open33('pen') && st.lambs.find((x) => !x.ok);
      if (l) l.ok = true;
    },
    first25 = () => !timesOf(roles23(), 'lamb'),
    door25 = () => { const D = pl25().door; return { x: D.x, y: 16, z: D.z, yaw: D.yaw, s: D.s }; };   // ── fable32 (build 33) ── (the chamber's door in its run) ── /fable32 ──
  // ── recovered (build 25) ── the lamb pen: the door, the scan by torchlight, the zoom on a spot, the dirt wiped, the stamps תמים / פסול,
  // the dawn clock (a false approval's delay), the other kohanim's lamb (npc25)
  function newLamb25(K) {
    let L = lamb25(prac ? prac.seed : st.day, prac && prac.ch33 ? 0 : K.k, K.first || !!(prac && prac.ch33), K.blems, K.rej, prac && prac.ch33 ? null : K.P36);   // ── fable32 (build 36) ── (the level's lamb; the chamber's stays easy) ── /fable32 ──   // ── fable32 (build 31) ── (a practice run: its own seed — another lamb each time) ── /fable32 ── ── fable32 (build 33) ── (the chamber: the day's one lamb at an easy level — the pen's first lamb: big, one blemish in a plain place or a straw) ── /fable32 ──
    if (K.mine && K.k === 0) L = { ...L, blem: null };   // ── fable32 (build 33) ── (the morning's lamb is the one he inspected four days ago — whole; a straw may be on it) ── /fable32 ──
    if (L.blem) K.blems++;
    const spots = [...(L.blem ? [{ kind: 'blem', c: L.blem.c, r: L.blem.r, ...(L.blem.small ? { small: 1 } : {}) }] : []), ...L.dirt.map((x) => ({ kind: 'dirt', d: x.kind, r: x.r, ...(x.mimic != null ? { mimic: x.mimic } : {}) }))]
      .sort((a, b) => a.r - b.r)
      .map((x, i) => ({ ...x, i, seen: false, gone: false }));
    K.L = { blem: L.blem, big: L.big, spots };
    K.fo = -1;
    K.zi = -1;
  }
  function p25start() {
    if (!gate25() || st.p25 || st.summary) return false;
    const h = heroP();
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    const L36l = prac && prac.ch33 ? 1 : lvOf36('lamb'),
      P36l = par36('lamb', L36l);   // ── fable32 (build 36) ── (the lamb's level: small blemishes, dirt like a blemish, two lambs; the chamber's run stays at its easy level) ── /fable32 ──
    const K = (st.p25 = {
      lv: L36l,
      P36: P36l,
      judged: 0,
      ph: 'in',
      t: 0,
      T: 0,
      own: 0,
      sx: h.x,
      sz: h.z,
      k: 0,
      blems: 0,
      rej: 0,
      fa: 0,
      wr: 0,
      dm: 0,
      insp: 0,
      br: 0,
      fo: -1,
      zi: -1,
      first: first25() || !!(prac && prac.ch33),   // ── fable32 (build 33) ── (the chamber: the easy reading of a first lamb — the bigger focus) ── /fable32 ──
      L: null,
      mine: tl33take(),   // ── fable32 (build 33) ── (a real morning: the lamb he inspected four or more days ago, its tag — tl33take) ── /fable32 ──
    });
    newLamb25(K);
    evlog('act_start', 'lamb');
    emit17('p25', { ph: 'in', first: K.first, k: 0 });
    return true;
  }
  const ph25 = (K, ph, extra) => {
    K.ph = ph;
    K.t = 0;
    emit17('p25', { ph, k: K.k, ...extra });
  };
  function p25Step(dt) {
    const K = st.p25;
    if (!K) {
      if (gate25() && !acting && !st.summary && !st.paused) {
        const h = heroP(),
          stand = pl25().stand;   // ── fable32 (build 33) ── (the chamber's in its run) ── /fable32 ──
        if ((h.y || 16) < 20 && Math.hypot(stand.x - h.x, stand.z - h.z) <= DAY33.reach) p25start();
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const ph = K.ph;
    if (ph === 'scan' || ph === 'zoom' || ph === 'dirt' || ph === 'clean' || ph === 'blem' || ph === 'false') K.own += dt;
    if (ph === 'in') {
      const stand = pl25().stand,
        door = pl25().door,   // ── fable32 (build 33) ── ── /fable32 ──
        k = Math.min(1, K.t / P25.in);
      moveHero(K.sx + (stand.x - K.sx) * k, K.sz + (stand.z - K.sz) * k, Math.atan2(door.x - stand.x, door.z - stand.z));
      if (k >= 1) ph25(K, 'scan');
    } else if (ph === 'zoom' && K.t >= P25.zoom) {
      const a = K.L.spots[K.zi];
      // ── fable32 (build 36) ── level 3 on: up close a blemish and dirt look alike — both ask for the brush ('dirt', amb); the brush
      // takes the dirt, and a blemish stays (then shown) ── /fable32 ──
      const amb = !!(K.P36 && K.P36.mimic);
      ph25(K, a.kind === 'dirt' || amb ? 'dirt' : 'blem', { c: a.c, r: a.r, ...(amb ? { amb: true } : {}) });
    } else if ((ph === 'clean' && K.t >= P25.clean) || (ph === 'blem' && K.t >= P25.blem)) {
      K.zi = -1;
      ph25(K, 'scan');
    } else if (ph === 'aside' && K.t >= P25.aside) (prac && prac.ch33 ? ch33end(K, 'blem') : ph25(K, 'wait'));   // ── fable32 (build 33) ── (the chamber: one lamb — a בעל מום goes, the act ends) ── /fable32 ──
    else if (ph === 'bring' && K.t >= P25.bring) ph25(K, 'scan');
    else if (ph === 'false' && K.t >= P25.fals) (prac && prac.ch33 ? ch33end(K, 'blem') : ph25(K, 'wait', { fals: true }));   // ── fable32 (build 33) ── (its blemish shown: it does not enter) ── /fable32 ──
    else if (ph === 'ok' && K.t >= P25.ok) p25done();
    else if (ph === 'lead' && K.t >= P25.lead) ph25(K, 'end');
    else if (ph === 'end' && K.t >= P25.end) st.p25 = null;
    else if (ph === 'out' && K.t >= P25.end) st.p25 = null;   // ── fable32 (build 33) ── (the chamber's בעל מום: gone) ── /fable32 ──
  }
  function p25focus(i) {
    const K = st.p25;
    if (!K || K.ph !== 'scan') return false;
    const spot = K.L.spots[i],
      fo = spot && !spot.gone ? i | 0 : -1;
    K.fo = fo;
    return fo >= 0;
  }
  function p25tap() {
    const K = st.p25;
    if (!K) return false;
    if (K.ph === 'scan') {
      const spot = K.L.spots[K.fo];
      return !spot || spot.gone ? false : ((K.zi = K.fo), (spot.seen = true), K.insp++, ph25(K, 'zoom'), true);
    }
    return K.ph === 'blem' ? ((K.zi = -1), ph25(K, 'scan'), true) : K.ph === 'wait' ? (K.k++, newLamb25(K), ph25(K, 'bring'), true) : false;
  }
  function p25swipe(dx, dy = 0, ms = 0) {
    const K = st.p25;
    if (!K || K.ph !== 'dirt') return false;
    const why = swipeWhy(dx, dy, ms, P25.sw);
    if (why) {
      emit17('p25swipe', { ok: false, why });
      return false;
    }
    const spot = K.L.spots[K.zi];
    K.br++;
    if (spot.kind === 'blem') {   // ── fable32 (build 36) ── (level 3 on: the brush on a blemish — it stays: a blemish) ── /fable32 ──
      emit17('p25swipe', { ok: true, stays: true });
      ph25(K, 'blem', { c: spot.c, r: spot.r, stays: true });
      return true;
    }
    spot.gone = true;
    emit17('p25swipe', { ok: true });
    ph25(K, 'clean');
    return true;
  }
  function p25stamp(how) {
    const K = st.p25;
    if (!K || !/^(scan|zoom|dirt|clean|blem)$/.test(K.ph) || (how !== 'tamim' && how !== 'pasul')) return false;
    const lambBlem = K.L.blem;
    if (how === 'pasul') {
      if (K.rej >= P25.rej) {
        emit17('p25no', { why: 'max' });
        return false;
      }
      K.rej++;
      const dirty = K.L.spots.some((x) => x.kind === 'dirt' && !x.gone),
        truth = lambBlem ? '' : dirty ? 'dirt' : 'whole';
      if (truth === 'dirt') K.dm++;
      else if (truth === 'whole') K.wr++;
      K.zi = -1;
      // ── fable32 (build 33) ── the chamber's one lamb: a whole lamb rejected is a free retry — it stays, "הטלה תמים — הביטו שוב" (the
      // rating counts it, rate30's −0.2) ── /fable32 ──
      if (prac && prac.ch33 && truth) {
        ph25(K, 'scan', { v: how, ok: false, why: truth, again: true });
        emit17('p25stamp', { v: how, ok: false, why: truth, ch33: true });
        return true;
      }
      K.judged++;   // ── fable32 (build 36) ── (a lamb judged — level 4 judges two) ── /fable32 ──
      ph25(K, 'aside', { v: how, ok: !!lambBlem, why: truth, blem: lambBlem ? { ...lambBlem } : null });
      emit17('p25stamp', { v: how, ok: !!lambBlem, why: truth, ch33: !!(prac && prac.ch33) });
      return true;
    }
    K.zi = -1;
    K.judged++;
    // ── fable32 (build 36) ── level 4: "שני טלאים להשוואה" — a whole lamb judged first, a second is brought and judged too (the תמים of
    // them goes up — the first: המחשה) ── /fable32 ──
    if (!lambBlem && K.P36 && K.P36.two && K.judged < 2 && !(prac && prac.ch33)) {
      emit17('p25stamp', { v: how, ok: true, two: true });
      K.k++;
      newLamb25(K);
      ph25(K, 'bring', { two: true });
      return true;
    }
    return lambBlem
      ? (K.fa++,
        ph25(K, 'false', { v: how, blem: { ...lambBlem } }),
        emit17('p25stamp', { v: how, ok: false, why: 'blem', blem: { ...lambBlem }, ch33: !!(prac && prac.ch33) }),
        true)
      : (ph25(K, 'ok', { v: how }), emit17('p25stamp', { v: how, ok: true }), true);
  }
  /** ── fable32 (build 33) ── the chamber's inspection ends: 'tamim' — the lamb gets its tag and is led into the chamber, to its stall;
   *  'blem' — a בעל מום (found, or approved and then shown): it does not enter. The act is rated like any (rate30: its coins by the
   *  rating — shift/index.js adds them; the record is the run's copy, never the lot's). "ch33rec": the outcome for his save (lamb33's
   *  inspect33), at once; the end card as the rating's word ends ("ch33end", the tick). ── /fable32 ── */
  function ch33end(K, out) {
    const C = prac.ch33,
      blem = K.L && K.L.blem ? { ...K.L.blem } : null,
      a = { x: CH33.door.x, y: 18.2, z: CH33.door.z },
      b = {
        day: st.day,
        ownS: r1(K.own),
        lambs: 1,
        rejections: K.rej,
        falseApprovals: K.fa,
        wrongRejections: K.wr,
        dirtMistaken: K.dm,
        inspected: K.insp,
        brushed: K.br,
        scoreEarned: Math.max(0, P25.score - P25.fa * K.fa - P25.wr * (K.wr + K.dm)),
        ch33: out,
      };
    C.out = out;
    C.blem = out === 'blem' ? blem : null;
    st.p25day = st.day;
    st.p25r = b;
    ph25(K, out === 'tamim' ? 'lead' : 'out');
    rec23('lamb', b);
    end30('lamb', b, a, false);
    L0('ch33', out, b.rating);
    evlog('lamb33', { out, rating: b.rating, q: b.q, dn: C.dn });
    emit17('ch33rec', { out, rating: b.rating, q: b.q, coins: b.coins, blem: C.blem, dn: C.dn });
  }
  function p25done() {
    if (prac && prac.ch33) return ch33end(st.p25, 'tamim');   // ── fable32 (build 33) ── (the chamber: no pyre, no court — its own end) ── /fable32 ──
    const K = st.p25,
      own = r1(K.own),
      k = Math.max(0, P25.score - P25.fa * K.fa - P25.wr * (K.wr + K.dm)),   // ── fable32 (build 30) ── (no "fast" points; the coins by the rating) ── /fable32 ──
      a = { x: P25.door.x, y: 18.2, z: P25.door.z },
      b = {
        day: st.day,
        ownS: own,
        lambs: K.k + 1,
        rejections: K.rej,
        falseApprovals: K.fa,
        wrongRejections: K.wr,
        dirtMistaken: K.dm,
        inspected: K.insp,
        brushed: K.br,
        scoreEarned: k,
        lv36: K.lv || 1,   // ── fable32 (build 36) ── (its level; the lambs judged) ── /fable32 ──
        judged36: K.judged | 0,
      };
    st.p25day = st.day;
    st.p25r = b;
    ph25(K, 'lead');
    st.m22day = st.day;
    st.m22c = 0;
    st.npc23 = null;
    st.fuel = Math.max(st.fuel, P23.fire);
    st.lowDay = st.fuel;
    try {
      globalThis.__FLARE33 = performance.now();
    } catch (e) {}
    lambIn();
    stat('inspected');
    stat('v_pen');
    rec23('lamb', b);
    end30('lamb', b, a, !p26);   // ── fable32 (build 30) ── ── /fable32 ──
    emit17('p23lit', { at: { x: M22.pyre.x, y: 28, z: M22.pyre.z } });
    lit35('kasher');   // ── fable32 (build 35) ── (the court's pyre: כשר) ── /fable32 ──
    score(k, 'lamb');
    evlog('lamb25', b);
    emit17('p25done', { ...b, at: a });
    saveState('p25');
  }
  const view25 = () => {
      const c = P25.cam,
        L = door25(),
        asp = Math.max(0.4, (globalThis.innerWidth || 844) / (globalThis.innerHeight || 390));
      return camView({ az: c.az, el: c.el, d: Math.max(c.d, 3.5 / asp), t: { x: L.x, y: 16 + c.ty, z: L.z } });
    },
    spotView25 = (K) => {
      const spot = K.L.spots[K.zi],
        at = at25(spot.r, door25(), spot.r < 4 ? P25.hy : 0),
        v = view25(),
        d = Math.hypot(v.p[0] - at.x, v.p[1] - at.y, v.p[2] - at.z) || 1,
        a = [0, 1, 2].map((x) => ((v.p[x] - [at.x, at.y, at.z][x]) / d) * 0.55 + [at.nx, at.ny, at.nz][x] * 0.45),
        b = Math.hypot(...a) || 1;
      return { p: a.map((x, i) => [at.x, at.y, at.z][i] + (x / b) * P25.zd), t: [at.x, at.y, at.z] };
    },
    camWork25 = () => {
      const K = st.p25,
        C = prac && prac.ch33;
      // ── fable32 (build 33) ── the chamber's run: after its inspection (or when today's is done) the stock's view — the stalls from the
      // south, the hall's south wall cut away; the lamb led in to its stall seen the same way ── /fable32 ──
      if (C && (!K || /^(lead|end|out)$/.test(K.ph)) && (C.done || C.out)) { const V = globalThis.__CH33VIEW || CH33.view; return { x: CH33.door.x, z: CH33.door.z, view: { p: V.p.slice(), t: V.t.slice(), e: 2 } }; }   // (__CH33VIEW: the browser checks may look closer)
      if (C && !K && !C.done && !C.out) return { x: CH33.door.x, z: CH33.door.z, view: { p: CH33.walk.p.slice(), t: CH33.walk.t.slice(), e: 2.4 } };   // ── fable32 (build 34) ── (the chamber's walk in, before the inspection: CH33.walk — the follow camera, 4 m behind him in the strip before the hall, showed his head over the whole screen) ── /fable32 ──
      if (!K) return null;
      const ph = K.ph,
        L = door25(),
        stand = pl25().stand,   // ── fable32 (build 33) ── ── /fable32 ──
        camP = P25.camP,
        a =
          (ph === 'zoom' || ph === 'dirt' || ph === 'clean' || ph === 'blem') && K.zi >= 0
            ? { ...spotView25(K), e: 10 }
            : /^(ok|lead|end|false|out)$/.test(ph)
              ? { ...camView({ ...camP, t: { x: (L.x + stand.x) / 2 - 1, y: 16 + camP.ty, z: (L.z + stand.z) / 2 } }), e: 3 }
              : { ...view25(), e: ph === 'in' ? 2.4 : 6 };
      return { x: L.x, z: L.z, view: a };
    },
    // ── recovered (build 26) ── inside the Heichal: the gate's bolt and key, the inner altar's ashes into the teni (pulls), the menorah's
    // wicks, oil (the pour's band) and fire; the morning's event (a lamp gone out: the drag from the next); save.roles26, save.jer26
    roles26 = () => (save.roles26 && typeof save.roles26 === 'object' ? save.roles26 : (save.roles26 = { m: 0, h: [] })),
    first26 = (role) => !timesOf(roles23(), role),
    HANDS26 = /^(pull|wick|wipe|pour|spill|new|drag|altar|teni36)$/,   // ── fable32 (build 36) ── (+ the levels' altar fire and teni) ── /fable32 ──
    YAW26 = -Math.PI / 2;
  function r26start(how) {
    const h = heroP(),
      role = st.role26 === 'inner' ? 'inner' : 'menorah',
      first = first26(role),
      L36h = lvOf36(role),
      P36h = par36(role, L36h),   // ── fable32 (build 36) ── (the Heichal's level: the inner altar's pulls and its teni out; the menorah's band, its lamps gone out) ── /fable32 ──
      west = role === 'menorah' && !!P36h.west,
      ev = role === 'menorah' && (!!P36h.ev || ev26(prac ? prac.seed : st.day, first));   // ── fable32 (build 31) ── ── /fable32 ── ── fable32 (build 36) ── (level 3 on: the eastern lamp is out every time — "מדשנן ומדליקן מן הדולקים") ── /fable32 ──
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    st.r26 = {
      lv: L36h,
      P36: P36h,
      west,
      wrong: 0,
      b: 0,
      bin: null,
      wd: 1,
      wt: 0,
      kd: 0,
      kt: 0,
      sT: -9,
      spills: 0,
      ph: how,
      t: 0,
      T: 0,
      role,
      own: 0,
      sx: h.x,
      sz: h.z,
      kp: 0,
      held: false,
      n: 0,
      ash: 1,
      acc: 100,
      scr: 0,
      ord: west ? [5, 6, 4, 3, 2, 1, 0] : ev ? [6, 4, 3, 2, 1, 0] : [4, 3, 2, 1, 0],   // ── fable32 (build 36) ── (level 4: the western of the two is out too — it first, from the outer altar's fire, then the eastern from it) ── /fable32 ──
      li: 0,
      fill: 0,
      q: [],
      under: 0,
      over: 0,
      refused: 0,
      ev,
      lit: [0, 0, 0, 0, 0, west ? 0 : 1, ev ? 0 : 1],
      first,
    };
    evlog('act_start', 'r26');
    emit17('r26', { ph: how, role, ev, first, lamp: st.r26.ord[0] });
    return true;
  }
  const ph26 = (K, ph, extra) => {
      K.ph = ph;
      K.t = 0;
      emit17('r26', { ph, role: K.role, li: K.li, lamp: K.ord[K.li], n: K.n, ...extra });
    },
    glide26 = (K, x, z, dur) => {
      const k = Math.min(1, K.t / dur);
      moveHero(K.sx + (x - K.sx) * k, K.sz + (z - K.sz) * k, YAW26);
      return k >= 1;
    },
    at26 = (role) => (role === 'inner' ? P26.alt : P26.walkM);
  function r26Step(dt) {
    const K = st.r26,
      h = heroP();
    if (!K) {
      if (gate26() && !acting && !st.summary && !st.paused && !st.p23) {
        const S0 = open26() ? at26(st.role26) : P26.gate;
        if (Math.hypot(S0.x - h.x, S0.z - h.z) <= P26.reach) r26start(open26() ? 'step' : 'in');
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const ph = K.ph;
    if (HANDS26.test(ph)) K.own += dt;
    if (ph === 'in') {
      if (glide26(K, P26.gate.x, P26.gate.z, P26.in)) ph26(K, 'bolt');
    } else if (ph === 'key') {
      K.kp = Math.max(0, Math.min(1, K.kp + (K.held ? dt / P26.key : -dt * P26.back)));
      if (K.kp >= 1) {
        st.g26day = st.day;
        st.g26t = st.t;
        st.men5t = K.role === 'inner' ? st.t + 14 : null;
        HOUSE22.gate = true;
        K.held = false;
        const a = !save.jer26;
        save.jer26 = 1;
        say(() => o.persist && o.persist());
        ph26(K, 'open', { jer: a });
        emit17('r26gate', { jer: a, at: { x: -95, y: 30, z: 0 } });
        L0('r26gate');
      }
    } else if (ph === 'open' && K.t >= P26.opn) ph26(K, 'walk');
    else if (ph === 'walk') {
      const a = at26(K.role);
      if (!acting && Math.hypot(a.x - h.x, a.z - h.z) <= P26.reach) {
        K.sx = h.x;
        K.sz = h.z;
        ph26(K, 'step');
      }
    } else if (ph === 'step') {
      const a = K.role === 'inner' ? P26.alt : P26.men;
      if (glide26(K, a.x, a.z, P26.step)) ph26(K, K.role === 'inner' ? 'set' : 'wick');
    } else if (ph === 'set' && K.t >= P26.set) ph26(K, 'pull');
    else if (ph === 'leave' && K.t >= P26.leave) done26();
    // ── fable32 (build 36) ── the inner altar's level 4: "נכנס ונטל את הטני והשתחוה ויצא" (תמיד ו, א) — the full teni lifted (lift36)
    // and carried out to the great gate (teni36: his glide, P36.teni.s seconds) held level by the right thumb (bal36); a coal that falls
    // is counted (the rating's spills36) — the second entry folded into his act: המחשה ── /fable32 ──
    else if (ph === 'lift36' && K.t >= 0.5) {
      K.sx = h.x;
      K.sz = h.z;
      ph26(K, 'teni36');
    } else if (ph === 'teni36') {
      const B = K.P36.teni,
        k = Math.min(1, K.t / B.s);
      moveHero(K.sx + (P26.gate.x + 1.2 - K.sx) * k, K.sz + (P26.gate.z - K.sz) * k, -YAW26);
      if (bal36(K, B, dt)) emit17('r26spill', { n: K.spills, a: Math.sign(K.b) });
      if (k >= 1) done26();
    }
    else if (ph === 'pour' && K.held) {
      K.fill = fill26(K.fill, dt);
      if (K.fill >= P26.pour.max) pour26(K);
    } else if (ph === 'spill' && K.t >= P26.spill) {
      K.fill = 0;
      ph26(K, 'pour');
    } else if (ph === 'lit' && K.t >= P26.lit) {
      K.fill = 0;
      if (++K.li < K.ord.length) ph26(K, 'wick');
      else ph26(K, 'kuz');
    } else if (ph === 'kuzd') {
      if (glide26(K, P26.walkM.x, P26.walkM.z, P26.kuz)) done26();
    } else if (ph === 'out' && (h.x > -54.5 || K.t > 60)) st.r26 = null;
  }
  function r26swipe(dx, dy = 0, ms = 0) {
    const K = st.r26,
      ph = K ? K.ph : '';
    if (ph !== 'bolt' && ph !== 'wick' && ph !== 'wipe') return false;
    const why =
      ph === 'wick'
        ? dy < -P26.wick
          ? Math.abs(dx) > 0.5 * Math.abs(dy)
            ? 'crooked'
            : ms > P26.ms
              ? 'slow'
              : ''
          : 'short'
        : swipeWhy(dx, dy, ms, P26.sw);
    if (why) {
      if (ph !== 'bolt') K.refused++;
      emit17('r26swipe', { ok: false, why, ph });
      return false;
    }
    const both = ph === 'wick' && K.li > 0;
    emit17('r26swipe', { ok: true, ph, both });
    ph26(K, ph === 'bolt' ? 'key' : ph === 'wick' && !both ? 'wipe' : 'pour', both ? { both } : undefined);
    return true;
  }
  function r26hold(on) {
    const K = st.r26;
    if (!K || (K.ph !== 'key' && K.ph !== 'pour') || (on && st.paused)) return false;
    const was = K.held;
    K.held = !!on;
    if (K.ph === 'pour' && was && !on) pour26(K);
    return true;
  }
  function let26() {
    const K = st.r26;
    !K || !K.held || ((K.held = false), emit17('r26hold', { off: true, why: 'pause', ph: K.ph, fill: K.fill }), L0('r26let', K.ph));
  }
  function pour26(K) {
    const P = K.P36 && K.P36.lo ? { ...P26.pour, lo: K.P36.lo, hi: K.P36.hi } : P26.pour,   // ── fable32 (build 36) ── (level 2 on: the half-log's band narrower) ── /fable32 ──
      fill = K.fill,
      li = K.li,
      q = K.q[li] == null ? 1 : K.q[li];
    K.held = false;
    if (fill > P.hi) {
      K.over++;
      K.q[li] = Math.min(q, 0.45);
      emit17('r26pour', { ok: false, why: 'over', fill });
      ph26(K, 'spill', { fill });
      return;
    }
    if (fill < P.lo) {
      if (fill > 0.02) {
        K.under++;
        K.q[li] = Math.min(q, 0.8);
        emit17('r26pour', { ok: false, why: 'under', fill });
      }
      return;
    }
    K.q[li] = q;
    emit17('r26pour', { ok: true, fill });
    ph26(K, 'new');
  }
  function r26pull(v) {
    const K = st.r26;
    if (!K || K.ph !== 'pull') return false;
    K.n++;
    const last = K.n >= P26.pulls,
      fast = v > ((K.P36 && K.P36.vmax) || P26.vmax);   // ── fable32 (build 36) ── (level 2 on: the gold more sensitive — a slower pull scratches) ── /fable32 ──
    K.ash = last ? 0 : Math.max(0, 1 - P26.hand * K.n);
    if (fast) {
      K.scr++;
      K.acc = Math.max(0, K.acc - P26.scr);
    }
    emit17('r26pull', { n: K.n, sweep: last, scratch: fast, ash: K.ash, acc: K.acc });
    if (last) ph26(K, K.P36 && K.P36.teni ? 'lift36' : 'leave');   // ── fable32 (build 36) ── (level 4: the teni goes out with him) ── /fable32 ──
    return true;
  }
  function r26tap() {
    const K = st.r26;
    if (!K) return false;
    if (K.ph === 'new') {
      const lamp = K.ord[K.li];
      emit17('r26wick', { lamp });
      if (K.west && lamp === 5) ph26(K, 'altar');   // ── fable32 (build 36) ── (level 4: the western lamp — from the outer altar's fire, brought in a pan: המחשה) ── /fable32 ──
      else if (K.ev && lamp === 6) ph26(K, 'drag');
      else lit26(K, lamp, lamp + 1);
      return true;
    }
    return K.ph === 'kuz' ? ((K.sx = P26.men.x), (K.sz = P26.men.z), ph26(K, 'kuzd'), true) : false;
  }
  function lit26(K, lamp, from, drag) {
    K.lit[lamp] = 1;
    if (K.li === K.ord.length - 1) st.men5t = st.t;
    ph26(K, 'lit', { lamp, from, drag: !!drag });
  }
  function r26light(src) {
    const K = st.r26;
    if (K && K.ph === 'altar') {   // ── fable32 (build 36) ── (the western lamp: only from the altar's fire; from a lamp — refused, counted) ── /fable32 ──
      if (src !== 'altar') {
        K.wrong++;
        emit17('r26fire', { ok: false, why: 'altar', n: K.wrong });
        return false;
      }
      lit26(K, 5, 'altar', true);
      return true;
    }
    return !K || K.ph !== 'drag' ? false : (lit26(K, 6, 5, true), true);
  }
  function r26bal(v) {   // ── fable32 (build 36) ── (the teni carried out, level 4: the right thumb's counter) ── /fable32 ──
    const K = st.r26;
    return K && K.P36 && K.P36.teni ? ((K.bin = v == null || !Number.isFinite(+v) ? null : clamp(+v, -1, 1)), true) : false;
  }
  function done26() {
    const K = st.r26,
      own = r1(K.own),
      inner = K.role === 'inner',
      qs = K.q.filter((x) => x != null),
      pourQ = qs.length ? qs.reduce((s, x) => s + x, 0) / qs.length : 0,
      n = Math.round(P26.score * (inner ? K.acc / 100 : pourQ)),   // ── fable32 (build 30) ── (no "fast" points; the coins by the rating) ── /fable32 ──
      g = inner
        ? { day: st.day, role: 'inner', ownS: own, pulls: K.n, scratches: K.scr, accuracy: K.acc, lv36: K.lv || 1, ...(K.P36 && K.P36.teni ? { spills36: K.spills | 0 } : {}) }   // ── fable32 (build 36) ── (its level; level 4's coals fallen from the teni) ── /fable32 ──
        : {
            day: st.day,
            role: 'menorah',
            ownS: own,
            lamps: K.ord.length,
            pourQ: Math.round(pourQ * 100) / 100,
            under: K.under,
            over: K.over,
            refused: K.refused,
            relit: !!K.ev,
            lv36: K.lv || 1,   // ── fable32 (build 36) ── (its level; level 4: the western lamp from the altar, a fire from a lamp refused) ── /fable32 ──
            ...(K.west ? { west36: 1, wrong36: K.wrong | 0 } : {}),
          };
    Object.assign(g, { scoreEarned: n, actS: r1(K.T) });
    st.r26day = st.day;
    st.r26r = g;
    const k = inner ? { x: -121, y: 24.5, z: 0 } : { x: -124.8, y: 25.5, z: 7.5 };
    rec23(K.role, g);
    end30(K.role, g, k, true);   // ── fable32 (build 30) ── (before 'out': the end's word follows the act) ── /fable32 ──
    ph26(K, 'out');
    score(n, 'r26');
    L0('r26done', K.role, own);
    evlog('heichal26', g);
    emit17('r26done', { ...g, at: k });
    saveState('r26');
  }
  function camWork26() {
    const r26 = st.r26;
    if (!r26) return null;
    let ph = r26.ph,
      h = heroP(),
      a = null;
    if (ph === 'in' || ph === 'bolt' || ph === 'key') a = { p: [-82.3, 26.4, 7.6], t: [-92.6, 24.4, -1.4], e: ph === 'in' ? 2.4 : 4 };
    else if (ph === 'open') a = { p: [-83.8, 25.6, 5.8], t: [-104, 24.2, -1.4], e: 1.5 };
    else if (ph === 'walk')
      a =
        h.x > -97.5
          ? h.x > -84.5
            ? null
            : { p: [h.x + 7.5, 27.6, h.z * 0.6 + 1.5], t: [h.x - 9, 23.6, h.z * 0.4], e: 3 }
          : { p: [-102.4, 28.8, -6.8], t: [-123.4, 23.6, 2.6], e: 2 };
    else if (ph === 'out') a = h.x > -97.5 ? null : { p: [Math.max(-135, h.x - 8), 27.4, h.z * 0.5 - 1.5], t: [h.x + 9, 23.4, 0], e: 2.4 };
    else if (r26.role === 'inner') a = { p: [-123.9, 26.2, -3.6], t: [-120.5, 23.1, 0.2], e: 2.6 };
    else if (ph === 'step') a = { p: [-119.6, 27, 3.2], t: [-124.4, 24, 7.4], e: 2.2 };
    else if (ph === 'kuz' || ph === 'kuzd') a = { p: [-120.9, 25.1, 4.5], t: [-122.8, 22.8, 7.4], e: 2.6 };
    else {
      const b = P26.lx[r26.ord[Math.min(r26.li, r26.ord.length - 1)]];
      a = { p: [Math.min(b + 0.55, -124.5), 26.1, 4.5], t: [b - 0.15, 24.9, 7.5], e: 3 };
    }
    return a ? { x: a.t[0], z: a.t[2], view: a } : null;
  }
  // ── fable32 (build 27) ── the second lot's two blood roles (תמיד ד, א). The shochet: at the morning's ring the lamb is bound — "לא היו
  // כופתין את הטלה, אלא מעקדין אותו", "יד ורגל" (a right drag brings the foreleg to the hindleg; no rope) —, he waits for the great
  // gate ("לא היה שוחט השוחט, עד ששומע קול שער הגדול שנפתח", תמיד ג, ז) and cuts on the needle's gold moment (a right tap; outside it
  // a free retry). The zorek: "שחט השוחט, וקבל המקבל" — the vessel under the stream (a right drag ↔), then by the stick to the
  // corners while the right thumb swirls ("ממרס… כדי שלא יקרש"); the two gifts below the red thread (a pull back and a release), and
  // the rest on the southern yesod (a swipe down). The other role's kohen is the court's (dam27.js). His role a blood one, the
  // inner roles' winners open the great gate (gateNpc27) and tend the five lamps — and "הטבת חמש נרות קודם לדם התמיד" (יומא לג, א):
  // the first gift waits for them (hold).
  const HANDS27 = /^(bind|cut|recv|carry|aim|carry2|aim2|base)$/,
    yawTo = (x0, z0, x1, z1) => Math.atan2(x1 - x0, z1 - z0);
  function gateNpc27() {
    st.g26day = st.day;
    st.g26t = st.t;
    st.men5t = st.t + P27.men5;
    L0('r26gate', 'npc');
    emit17('r26gate', { jer: false, npc: true, at: { x: -95, y: 30, z: 0 } });
  }
  function r27start() {
    const h = heroP(),
      role = st.role26 === 'zorek' ? 'zorek' : 'shochet',
      first = first26(role),
      a = role === 'shochet' ? P27.stand : P27.recv,
      L36b = lvOf36(role),
      P36b = par36(role, L36b);   // ── fable32 (build 36) ── (the blood roles' level: the cut's window and pace, the binding's direction; the stream, the line's guide, the Γ, the clot) ── /fable32 ──
    if (o.walk && o.walk.stop) say(() => o.walk.stop());
    goal = null;
    drive(0, 0);
    st.r27 = {
      lv: L36b,
      P36: P36b,
      ph: 'in',
      t: 0,
      T: 0,
      role,
      first,
      own: 0,
      sx: h.x,
      sz: h.z,
      tx: a.x,
      tz: a.z,
      binds: 0,
      rebinds: 0,
      tc: 0,
      miss: 0,
      u: 0,
      sweep: (first ? P27.sweep1 : P27.sweep) * (role === 'shochet' && P36b.sweep ? P36b.sweep : 1),   // ── fable32 (build 36) ── (level 4: the needle quicker) ── /fable32 ──
      pos: 0,
      sp: 0,
      fill: 0,
      inT: 0,
      totT: 0,
      tr: 0,
      sk: first ? 0.8 : 1,
      fillAcc: 0,
      coag: 0,
      coagMax: 0,
      clot: false,
      lastSw: 0,
      swAcc: 0,
      circT: 0,
      circ: 0,
      gifts: [],
      retries: 0,
      high: 0,
      wide: 0,
      corner: 'NE',
      cutT: null,
    };
    evlog('act_start', 'r27');
    emit17('r27', { ph: 'in', role, first });
    return true;
  }
  const ph27 = (K, ph, extra) => {
      K.ph = ph;
      K.t = 0;
      emit17('r27', { ph, role: K.role, corner: K.corner, ...extra });
    },
    glide27 = (K, x, z, dur, yaw) => {
      const k = Math.min(1, K.t / dur);
      moveHero(K.sx + (x - K.sx) * k, K.sz + (z - K.sz) * k, yaw);
      return k >= 1;
    };
  function swirl27(K, dt) {
    K.swAcc *= Math.exp(-dt * 1.2);
    const still = K.T - K.lastSw,
      cg = (K.P36 && K.P36.coag) || 1;   // ── fable32 (build 36) ── (level 4: the blood clots sooner and faster) ── /fable32 ──
    K.coag = Math.max(0, Math.min(1, K.coag + (still > P27.still / cg ? P27.coagUp * cg : -P27.coagDn) * dt));
    if (K.coag > K.coagMax) K.coagMax = K.coag;
    if (K.coag >= 1 && !K.clot) {
      K.clot = true;
      emit17('r27clot', { on: true });
    } else if (K.clot && K.coag < 0.6) {
      K.clot = false;
      emit17('r27clot', { on: false });
    }
  }
  function r27Step(dt) {
    const K = st.r27,
      h = heroP();
    if (gate27() || (K && K.ph !== 'out')) {
      if (!(st.l26t <= st.t)) st.l26t = st.t;
      if (!open26() && st.t >= st.l26t + P27.gateNpc) gateNpc27();
    }
    if (!K) {
      if (gate27() && !acting && !st.summary && !st.paused && !st.p23) {
        const a = st.role26 === 'zorek' ? P27.recv : P27.stand;
        if (Math.hypot(a.x - h.x, a.z - h.z) <= P27.reach) r27start();
      }
      return;
    }
    K.t += dt;
    K.T += dt;
    const ph = K.ph;
    if (HANDS27.test(ph)) K.own += dt;
    if (ph === 'in') {
      if (glide27(K, K.tx, K.tz, P27.in, K.role === 'shochet' ? -Math.PI / 2 : yawTo(K.tx, K.tz, P27.lamb.x, P27.lamb.z))) ph27(K, K.role === 'shochet' ? 'bind' : 'wait');
    } else if (ph === 'bound') {
      if (K.t >= P27.bound) ph27(K, open26() ? 'cut' : 'wait');
    } else if (ph === 'wait') {
      if (open26() && K.t >= 0.3) ph27(K, 'cut', K.role === 'zorek' ? { npc: true } : undefined);
    } else if (ph === 'cut') {
      if (K.role === 'shochet') {
        K.tc += dt;
        K.u = needle27(K.tc, K.sweep);
      } else if (K.t >= P27.npcCut) {
        K.cutT = st.t;
        ph27(K, 'recv');
      }
    } else if (ph === 'cutd') {
      if (K.t >= P27.cutd) done27();
    } else if (ph === 'recv') {
      K.tr += dt;
      K.totT += dt;
      K.sp = stream27(K.tr, K.sk);
      if (Math.abs(K.pos - K.sp) < ((K.P36 && K.P36.tol) || P27.tol)) {   // ── fable32 (build 36) ── (the stream's width by the level) ── /fable32 ──
        K.fill = Math.min(1, K.fill + dt / P27.fillS);
        K.inT += dt;
      }
      if (K.fill >= 1) {
        K.fillAcc = Math.round((100 * K.inT) / Math.max(1e-3, K.totT));
        ph27(K, 'full');
      }
    } else if (ph === 'full') {
      if (K.t >= P27.full) {
        K.lastSw = K.T;
        ph27(K, 'carry');
      }
    } else if (ph === 'carry' || ph === 'carry2' || ph === 'hold') {
      swirl27(K, dt);
      const c = ph === 'carry2' ? 'SW' : 'NE',
        a = P27.at[c];
      if (ph === 'hold') {
        if (K.t <= 0.4) glide27(K, a.x, a.z, 0.35, yawTo(a.x, a.z, P27.corner.NE[0], P27.corner.NE[1]));
        if (K.t > 0.4 && (st.men5t == null || st.t >= st.men5t)) {
          K.sx = h.x;
          K.sz = h.z;
          ph27(K, 'aim');
        }
      } else if (!acting && Math.hypot(a.x - h.x, a.z - h.z) <= P27.aimR) {
        K.corner = c;
        K.sx = h.x;
        K.sz = h.z;
        drive(0, 0);
        ph27(K, c === 'NE' ? (st.men5t != null && st.t < st.men5t ? 'hold' : 'aim') : 'aim2');
      }
    } else if (ph === 'aim' || ph === 'aim2') {
      if (K.clot) swirl27(K, dt);   // ── fable32 (build 36) ── (the clot circled away at the corner) ── /fable32 ──
      const c = ph === 'aim2' ? 'SW' : 'NE',
        a = P27.at[c];
      if (K.t <= 0.4) glide27(K, a.x, a.z, 0.35, yawTo(a.x, a.z, P27.corner[c][0], P27.corner[c][1]));
    } else if (ph === 'splash') {
      if (K.t >= P27.splash) {
        K.lastSw = K.T;
        ph27(K, 'carry2');
      }
    } else if (ph === 'splash2') {
      if (K.t >= P27.splash) {
        K.sx = h.x;
        K.sz = h.z;
        ph27(K, 'base');
      }
    } else if (ph === 'base') {
      if (K.t <= 0.4) glide27(K, P27.at.SW.x, P27.at.SW.z, 0.35, yawTo(P27.at.SW.x, P27.at.SW.z, P27.hole.x, P27.hole.z));
    } else if (ph === 'poured') {
      if (K.t >= P27.poured) done27();
    } else if (ph === 'out' && K.t >= 0.6) st.r27 = null;
  }
  function r27bind(ok = true) {
    const K = st.r27;
    if (!K || K.ph !== 'bind') return false;
    K.binds++;
    if (!ok) {
      K.rebinds++;
      emit17('r27bind', { ok: false });
      return false;
    }
    emit17('r27bind', { ok: true });
    ph27(K, 'bound');
    return true;
  }
  function r27tap() {
    const K = st.r27;
    if (!K || K.ph !== 'cut' || K.role !== 'shochet' || st.paused) return false;
    const u = needle27(K.tc, K.sweep),
      W = (K.P36 && K.P36.win) || P27.win;   // ── fable32 (build 36) ── (the gold's width by the level) ── /fable32 ──
    if (u < W[0] || u > W[1]) {
      K.miss++;
      emit17('r27cut', { ok: false, u: Math.round(u * 1000) / 1000, n: K.miss });
      return false;
    }
    K.cutT = st.t;
    emit17('r27cut', { ok: true, u: Math.round(u * 1000) / 1000 });
    ph27(K, 'cutd');
    return true;
  }
  function r27move(d) {
    const K = st.r27;
    if (!K || K.ph !== 'recv' || !Number.isFinite(+d) || st.paused) return false;
    K.pos = Math.max(-1, Math.min(1, K.pos + +d));
    return true;
  }
  function r27swirl(rad) {
    const K = st.r27,
      r = Math.abs(+rad || 0);
    if (!K || !(/^(full|carry|carry2|hold)$/.test(K.ph) || (K.clot && /^aim2?$/.test(K.ph))) || !(r > 0) || st.paused) return false;   // ── fable32 (build 36) ── (a vessel that clotted on the way: circled at the corner too — it could not be, and the throw said "נקרש" for ever: a soft-lock of build 27 the levels' quicker clot showed) ── /fable32 ──
    K.swAcc += r;
    K.circT += r;
    if (K.swAcc >= P27.swirlRad) {
      K.swAcc = 0;
      K.lastSw = K.T;
    }
    if (K.circT >= Math.PI * 2) {
      K.circT -= Math.PI * 2;
      K.circ++;
      emit17('r27circ', { n: K.circ });
    }
    return true;
  }
  function r27throw(p, a) {
    const K = st.r27;
    if (!K || (K.ph !== 'aim' && K.ph !== 'aim2') || st.paused) return null;
    if (K.clot) {
      emit17('r27throw', { res: 'clot', corner: K.corner });
      return 'clot';
    }
    const r = throw27(p, a, (K.P36 && K.P36.deg) || P27.deg),
      ev = { ...r, y: Math.round(r.y * 100) / 100, corner: K.corner, a: Math.round((+a || 0) * 10) / 10, p: Math.round((+p || 0) * 100) / 100 };
    if (r.res === 'weak') {
      emit17('r27throw', ev);
      return 'weak';
    }
    if (r.res === 'high' || r.res === 'miss') {
      K.retries++;
      if (r.res === 'high') K.high++;
      else K.wide++;
      emit17('r27throw', ev);
      return r.res;
    }
    K.gifts.push(r.q);
    emit17('r27throw', ev);
    ph27(K, K.ph === 'aim' ? 'splash' : 'splash2', { res: r.res, face: r.face });
    return r.res;
  }
  function r27swipe(dx, dy = 0, ms = 0) {
    const K = st.r27;
    if (!K || K.ph !== 'base' || st.paused) return false;
    const why = dy < P27.dn ? 'short' : Math.abs(dx) > 0.6 * dy ? 'crooked' : ms > P27.ms ? 'slow' : '';
    emit17('r27swipe', { ok: !why, why });
    if (why) return false;
    ph27(K, 'poured');
    return true;
  }
  function done27() {
    const K = st.r27,
      own = r1(K.own),
      sh = K.role === 'shochet',
      g = sh
        ? { day: st.day, role: 'shochet', ownS: own, misses: K.miss, rebinds: K.rebinds, first: !!K.first, lv36: K.lv || 1 }   // ── fable32 (build 36) ── (its level) ── /fable32 ──
        : {
            day: st.day,
            role: 'zorek',
            ownS: own,
            fillAcc: K.fillAcc | 0,
            gifts: K.gifts.slice(),
            retries: K.retries,
            high: K.high,
            wide: K.wide,
            clotMax: Math.round(K.coagMax * 100),
            first: !!K.first,
            lv36: K.lv || 1,   // ── fable32 (build 36) ── (its level) ── /fable32 ──
          };
    g.cutT = K.cutT;
    g.actS = r1(K.T);
    rec23(K.role, g);
    const q = (g.mastery | 0) / 100,
      n = Math.round(P27.score * q),   // ── fable32 (build 30) ── (no "fast" points; the coins by the rating) ── /fable32 ──
      at = sh ? { x: P27.lamb.x, y: 17.2, z: P27.lamb.z } : { x: P27.hole.x, y: 17.6, z: P27.hole.z };
    Object.assign(g, { scoreEarned: n });
    st.r26day = st.day;
    st.r26r = g;
    end30(K.role, g, at, true);   // ── fable32 (build 30) ── ── /fable32 ──
    ph27(K, 'out');
    score(n, 'r27');
    L0('r27done', K.role, own);
    evlog('dam27', g);
    emit17('r27done', { ...g, at });
    saveState('r27');
  }
  /** ── fable32 (build 27) ── the authored views (CAM24's way: the context per step): the ring from the north, medium-long, never
   *  close on the lamb's neck; beside him at each corner (his head in the lower left third, the corner's edge in the middle); the
   *  southern yesod from the south-west; none while he walks */
  function camWork27() {
    const K = st.r27;
    if (!K || K.ph === 'out' || K.ph === 'carry' || K.ph === 'carry2') return null;
    const ph = K.ph;
    let a;
    if (K.role === 'shochet') a = { p: [-46.2, 23.6, -42.4], t: [-46.4, 16.5, -33.6], e: ph === 'in' ? 2 : 2.6 };   // (from the north, behind the lamb's rear: he east of it, the lamb west, the legs between them; the neck at the far end, ≈ 9.9 amot off)
    else if (/^(in|wait|cut|recv|full)$/.test(ph)) a = { p: [-46.8, 23.6, -42.2], t: [-47.5, 16.5, -33], e: 2.4 };
    // (the corners: he stands on the corner's diagonal, so a view from behind him had his head on the corner's lower half — the views
    // stand 62–65° round from the diagonal, 10 amot off and 6 up: the corner's edge from the yesod to over the thread in the frame's
    // middle (the thread ≈ 85 px from the top on a 296-px frame), his head beside it in the lower left third, both faces seen)
    else if (/^(hold|aim|splash)$/.test(ph)) a = { p: [-18.4, 22, -27.4], t: [-22.56, 19.75, -18.27], e: 2.2 };
    else if (/^(aim2|splash2)$/.test(ph)) a = { p: [-57.2, 22, 20.6], t: [-53.45, 19.75, 11.29], e: 2.2 };
    else a = { p: [-55.9, 20.7, 18.9], t: [-52.6, 17.1, 12.4], e: 2.2 };
    return { x: a.t[0], z: a.t[2], view: a };
  }
  // ── /fable32 ──
  function card22(h) {
    const K = st.m22,
      ph = K ? K.ph : '';
    return !K || ph === 'carry'
      ? {
          icon: K ? '⛰️' : '🪵',
          label: K ? (atTop(h) ? 'למערכה' : goLabel31('הכבש')) : goLabel31(STN.wood.he),
          job: 'sh:go:m22',
          noRing: true,
          go31: true,
          go: () => peek24(),
        }
      : { icon: '🔥', label: 'המערכה', job: 'sh:m22', noRing: true, go: () => {} };
  }
  const camWork22 = () => {
    const K = st.m22;
    if (!K || K.ph === 'carry') return null;
    const h = heroP(),
      ph = K.ph;
    return {
      x: h.x,
      z: h.z,
      view: ph === 'in' || ph === 'sort' || ph === 'sorted' ? M22.camS : camView(ph === 'ignite' || ph === 'end' ? M22.camP : M22.camB),
    };
  };
  // ── recovered (build 17) ── the focused day's next step (after the gates: the lost lamb at home, the pen before a tamid, the fire low, the
  // day's goals), the act's answers (hitOf / missOf: the slot's +1, the streak, the coins)
  function next17() {
    const tm = tamid17(),
      lost = st.lost,
      goals = B17.goals,
      go = (a) => ({ id: a, kind: 'station' });
    if (lost && (lost.home || (lost.follow && st.fuel >= B17.crit))) return { id: 'lamb', kind: 'lamb' };
    const a = !!(tm && !tm.done && (tm.late || tm.inS < B17.penBefore)) && !(grace17() && st.t + tm.inS < B17.grace);
    if (open33('pen') && okLambs() === 0 && st.lambs.some((x) => !x.ok) && a && st.fuel >= B17.warn) return go('pen');
    if (b19 && st.r19.fl.length && !st.logs && (near19(heroP()) || !woodRush(tm))) return go('log19');
    if (woodRush(tm)) return go('wood');
    if (st.song && open33('song')) return go('song');
    if (open33('kiyor') && !st.washed) return go('kiyor');
    if (saltDue()) return go(st.r19.bag >= 110 || (st.r19.bag > 0 && near19(heroP())) ? 'saltR' : 'salt');
    if (c18 && st.logs <= 0 && st.fuel >= C18.errand) {
      if (padOpen()) return go('pad');
      if (st.ch18.n >= chests.max) return go('chests');
    }
    return lost
      ? { id: 'lamb', kind: 'lamb' }
      : open33('pen') && st.lambs.some((x) => !x.ok)
        ? go('pen')
        : open33('bake') && statN('baked') < goals.bake
          ? go(st.oil > 0 && st.flour > 0 ? (st.salt > 0 ? 'bake' : 'salt') : 'oil')
          : go('wood');
  }
  const word17 = (g) =>
      g !== 'gold' ? 'טוב' : st.streak >= 5 ? `כהן זריז! ×${st.streak}` : st.streak >= 3 ? 'כהן זריז!' : st.streak === 2 ? 'מצוין!' : 'מושלם!',
    POP17 = { wood: ['+1 🪵', 'card'], oil: ['+1 🏺', 'bake'], salt: ['+1 🧂', 'bake'], bake: ['+1 🍞', 'bake'], pen: ['+1 🐑', 'card'] };
  function hitOf(id, g) {
    const r = hit33(id, g);
    if (!b17) return r;
    const pop = POP17[id] || ['+1', 'card'],
      s = STN[id],
      at = s ? { x: s.at.x, y: (s.at.y || 16) + 2.6, z: s.at.z } : null;
    if (id === 'wood' && st.lastWorm) {
      if (l18) emit17('act', { id, g, at });
    } else emit17('hit', { id, g, streak: st.streak, text: pop[0], to: pop[1], at });
    payAct(g, 'hit:' + id, at);
    if (c18 && g === 'gold' && st.streak > 0 && st.streak % C18.streak === 0) pay(1, 'streak', at);   // ── fable32 (build 28) ── (the gift no longer rides on it) ── /fable32 ──
    if (id === 'wood' && st.logs >= basketCap() && !r.more) emit17('done', { text: 'הסל מלא!', sub: 'לכבש' });
    if (id === 'pen' && !r.more) emit17('done', { text: 'הטלאים מבוקרים!' });
    return { ...r, word: word17(g), streak: st.streak };
  }
  function hit33(id, g) {
    const q = g === 'gold' ? 1 : g === 'good' ? 0.85 : 0.6;
    scoreAct(id, { quality: q, gold: g === 'gold' });
    st.idleT = 0;
    if (b17) st.streak = g === 'gold' ? st.streak + 1 : 0;
    st.lastWorm = false;
    if (id === 'wood') {
      if (!grace17() && powerOn) st.power = Math.max(0, st.power - DAY33.powerChop);
      st.chops++;
      if (!grace17() && rng() < DAY33.worm) {
        st.lastWorm = true;
        st.worms++;
        if (st.wormSaid) say(() => hud && hud.float && hud.float('מתולע — פסול', project({ x: STN.wood.at.x, y: 20, z: STN.wood.at.z })));
        else {
          st.wormSaid = true;
          stamp('גזר מתולע — פסול למזבח (מידות ב, ה)', 'no');
        }
        sfx('miss');
        L0('worm');
      } else {
        st.logs++;
        st.basketQ.push(g);
        L0('log', st.logs, g);
        stat('chops');
        {
          const h = heroP();
          fx('load', { x: STN.wood.at.x, y: 17, z: STN.wood.at.z - 1 }, { x: h.x, y: 18, z: h.z }, 1);
        }
      }
      return { more: st.logs < basketCap() };
    }
    if (id === 'oil') {
      st.oil++;
      st.flour++;
      L0('oil');
      stat('jars');
      return { more: st.oil < DAY33.storeMax };
    }
    if (id === 'salt') {
      st.salt++;
      L0('salt');
      return { more: st.salt < DAY33.storeMax };
    }
    if (id === 'bake') {
      if (st.oil > 0 && st.flour > 0 && st.salt > 0) {
        st.oil--;
        st.flour--;
        st.salt--;
        st.bread++;
        st.baked++;
        L0('bake');
        stat('baked');
      }
      return { more: st.oil > 0 && st.flour > 0 && st.salt > 0 };
    }
    if (id === 'pen') {
      const a = st.lambs.find((x) => !x.ok);
      if (a) {
        a.ok = true;
        stamp(`הצלחתם! הדיר נפתח — הטלה נכנס ומבוקר: ${okLambs()}/${DAY33.lambs} (ערכין ב, ה)`, 'combo');
        sfx('coin');
        L0('inspect');
        stat('inspected');
      }
      return { more: st.lambs.some((x) => !x.ok) };
    }
    return { more: false };
  }
  function missOf(id, n) {
    if (b17) {
      st.streak = 0;
      emit17('miss', { id, grace: grace17(), at: over(id) });
      if (grace17()) return null;
    }
    if (id === 'pen' && n >= DAY33.penMisses) {
      stamp('לא הצלחתם — הדיר לא נפתח בזמן, הטלה ברח! תפסו אותו', 'no');
      sfx('miss');
      L0('pen-bolt');
      if (!st.lost) {
        const at = STN.pen.at,
          a = rng() * Math.PI * 2;
        st.lost = { x: at.x + Math.cos(a) * 14, z: at.z + 10 + Math.abs(Math.sin(a)) * 8, yaw: a, t: 0, follow: false };
      }
      return { end: true };
    }
    return null;
  }
  // ── fable32 (build 35) ── (the old loop's stations: no door in the morning of the work — the laver, the salt's bag, the pyre's carry) ── /fable32 ──
  const door35 = (id) => !e35 || id === 'kiyor' || id === 'salt' || (id === 'kevesh' && carry22());
  async function runAt(id) {
    if (!door35(id)) return false;   // ── fable32 (build 35) ── ── /fable32 ──
    if (acting || st.phase !== 'run' || !ST || !ST.act) return false;
    if (st.k20 || st.d21 || st.p25) return false;
    if (gate20() && id !== 'kiyor') return gate20no(id);   // ── fable32 (build 20) ── (the kiddush runs; before it, no other station) ── /fable32 ── ── fable32 (build 21) ── (terumat hadeshen likewise) ── /fable32 ──
    if (gate23() || st.p23) return gate23no(id);   // ── fable32 (build 23) ── (the lot) ── /fable32 ──
    if (gate21()) return gate21no(id);
    if (gate25()) return id === 'pen' ? peek24() : gate25no(id);   /* ── fable32 (build 25) ── */
    if ((st.r26 && st.r26.ph !== 'out') || gate26L() || gate26() || gate27() || on27()) return gate26no(id);   /* ── fable32 (build 26) ── */ /* ── fable32 (build 27) ── */
    if (gate22() && !(id === 'kevesh' && carry22())) return id === 'wood' && !st.m22 ? peek24('wood') : gate22no(id);
    const h = heroP(),
      p = standOf(id);
    if (!p) return false;
    if (id === 'pyre') return !!(atTop(h) && st.logs > 0 && layLogs());
    if (Math.hypot(p.x - h.x, p.z - h.z) > DAY33.reach + 0.3) return tapStation(id);
    if (!open33(id)) {
      stamp(`${STN[id].he} — נפתח ברמה ${DAY33.unlock[id] || '?'} של האש`, 'no');
      sfx('miss');
      return false;
    }
    if (id === 'wood' && st.logs >= st.basketMax) {
      stamp('הסל מלא — לכבש!', 'no');
      sfx('miss');
      return false;
    }
    if (id === 'kevesh' && st.logs <= 0) {
      stamp('אין עצים בסל — ללשכת העץ', 'no');
      sfx('miss');
      return false;
    }
    if (id === 'kiyor' && st.washed) {
      stamp('כבר קידשתם היום — פעם אחת ביום', 'no');
      sfx('miss');
      return false;
    }
    if (g20 && id === 'kiyor') return k20start();
    if (id === 'song' && !st.song) {
      stamp('הלויים שרים אחרי תמיד של שחר', 'no');
      sfx('miss');
      return false;
    }
    if (id === 'bake' && !(st.oil > 0 && st.flour > 0 && st.salt > 0)) {
      stamp(`ללחם צריך סולת, שמן ומלח — יש ${st.flour}/${st.oil}/${st.salt}`, 'no');
      sfx('miss');
      return false;
    }
    if (id === 'wood')
      try {
        STN.wood.n = st.axeTaps + (tired() ? 3 : 0);
      } catch (e) {}
    if (b19 && id === 'kevesh') return peek24('pyre');
    if (b19 && id === 'salt') {
      const r19 = st.r19;
      if (!usable(id)) return false;
      r19.bm = r19.bag = R19.bag[st.day > 1 ? 1 : 0];
      r19.bags++;
      st.salt = Math.max(st.salt, DAY33.storeMax);
      stat('v_salt');
      emit17('act', { id, g: 'gold', at: over(id) });
      emit17('done', { text: 'שק מלח על החגורה', sub: 'שלא יחליקו (עירובין י, יד)' });
      try {
        globalThis.__HERO35.play('PickUp', { once: true, speed: 1.6, restart: true });
      } catch (e) {}
      L0('bag');
      return true;
    }
    acting = { id };
    drive(0, 0);
    L0('act', id);
    evlog('act_start', id);
    let swing = STN[id].verb === 'swing',
      hits = 0,
      opts = swing
        ? {
            C: id === 'wood' && tired() ? DAY33.swingTiredC : 0,
            k: (id === 'wood' ? st.axeK : 1) * (grace17() ? B17.graceK : 1),   /* ── fable32 (build 17b) ── (day 1's first two minutes: ×1.5) ── */
            grace: grace17(),
            onHit: (a) => {
              hits++;
              return hitOf(id, a);
            },
            onMiss: (a) => missOf(id, a),
            fb18: l18,
          }
        : { fb18: l18, kK: id === 'kiyor' && own18('kiyor2') ? C18.kiyorK : 1 },   // ── fable32 (build 18) ── (fb18: the act's sounds and buzz are focus17/fx18's — one place) ── /fable32 ──
      t0 = st.t,
      r = null;
    try {
      const pr = ST.act(id, null, opts);   /* (build 11: the tap that opened the act is its first hit — "5 הקשות" means five) */
      if (STN[id].verb === 'tapN' && ST.poke) say(() => ST.poke('start'));
      r = await pr;
    } catch (e) {
      r = { quality: 0.6, gold: false };
    }
    acting = null;
    if (ended) return false;
    if (swing) {
      if (!hits && r && r.quality > 0 && !(r.hits > 0)) {
        hits = 1;
        hitOf(id, r.gold ? 'gold' : r.quality >= 0.8 ? 'good' : 'ok');
      }
      st.idleT = 0;
      return hits
        ? (evlog('act_done', { id, grade: r && r.gold ? 'gold' : 'good', hits, golds: r && r.golds, misses: r && r.misses }),
          L0('session', id, hits, r && r.why),
          b17 && stat('v_' + id),
          id === 'wood' && st.logs >= st.basketMax && !b17 && stamp('הסל מלא — לכבש!', 'combo'),
          true)
        : ((!r || r.why !== 'stick') && stamp('הפסקתם באמצע — הקישו שוב כשתרצו', 'info'),
          L0('idle', id),
          evlog('act_done', { id, grade: 'none' }),
          false);
    }
    if (!r || !(r.quality > 0)) {
      stamp('הפסקתם באמצע — הקישו שוב כשתרצו', 'info');
      L0('idle', id);
      evlog('act_done', { id, grade: 'none' });
      return false;
    }
    const g = r && r.gold ? 'gold' : r && r.quality >= 0.8 ? 'good' : 'ok';
    evlog('act_done', { id, grade: g });
    scoreAct(id, r);
    st.idleT = 0;
    if (b17 && (id !== 'song' || r.gold)) stat('v_' + id);
    if (l18 && (id !== 'song' || r.gold)) {
      const h = heroP(),
        a = id === 'kevesh' ? { x: h.x, y: (h.y || 25) + 3, z: h.z } : over(id);
      emit17('act', { id, g, at: a });
      if (id !== 'song') payAct(g, 'act:' + id, a);
    }
    if (id === 'song')
      if (r && r.gold) {
        emit17('done', { text: 'שיר של יום!', sub: `+${DAY33.songFuel} אש` });
        st.songs++;
        st.song = null;
        st.fuel = Math.min(100, st.fuel + DAY33.songFuel);
        pay(DAY33.songReward, 'song', over('song'));
        stamp(`שיר של יום — בקצב! +${DAY33.songFuel} אש, +${DAY33.songReward} פרוטות`, 'combo');
        sfx('fanfare');
        L0('song');
        stat('songs');
      } else {
        stamp('לא בקצב — שירו שוב', 'no');
        sfx('miss');
      }
    else if (id === 'pen') {   // (build 12: the owner — 'פתח את הדיר: הצלחת / לא הצלחת')
      const l = st.lambs.find((q) => !q.ok);
      if (r && r.gold && l) {
        l.ok = true;
        stamp(`הצלחתם! הדיר נפתח — הטלה נכנס ומבוקר: ${okLambs()}/${DAY33.lambs} (ערכין ב, ה)`, 'combo');
        sfx('coin');
        L0('inspect');
        stat('inspected');
      } else if (l) {
        stamp('לא הצלחתם — הדיר לא נפתח בזמן, הטלה ברח! תפסו אותו', 'no');
        sfx('miss');
        L0('pen-bolt');
        if (!st.lost) {
          const P = STN.pen.at,
            a = rng() * Math.PI * 2;
          st.lost = { x: P.x + Math.cos(a) * 14, z: P.z + 10 + Math.abs(Math.sin(a)) * 8, yaw: a, t: 0, follow: false };
        }
      }
    } else if (id === 'kiyor') {
      st.washed = true;
      if (b17) emit17('done', { text: 'ידיים ורגליים מקודשות!', sub: 'כל גזר +25%' });
      else stamp('ידיים ורגליים מקודשות — היום כל גזר +25%', 'combo');
      sfx('coin');
      L0('wash');
      stat('washes');
    } else if (id === 'oil') {
      st.oil++;
      st.flour++;
      stamp(`שמן וסולת — ${st.oil}/${st.flour}`, 'info');
      sfx('coin');
      L0('oil');
      stat('jars');
    } else if (id === 'salt') {
      st.salt++;
      stamp(`מלח — ${st.salt}`, 'info');
      sfx('coin');
      L0('salt');
    } else if (id === 'bake') {
      st.oil--;
      st.flour--;
      st.salt--;
      st.bread++;
      st.baked++;
      stamp(`לחם — ${st.bread} בסל (בית גרמו)`, 'combo');
      sfx('chime');
      L0('bake');
      stat('baked');
    } else if (id === 'wood') {
      st.power = Math.max(0, st.power - DAY33.powerChop);
      st.chops++;
      if (rng() < DAY33.worm) {
        st.worms++;
        stamp('גזר מתולע — פסול למזבח (מידות ב, ה)', 'no');
        sfx('miss');
        L0('worm');
      } else {
        st.logs++;
        st.basketQ.push(g);
        stamp(`גזר כשר — ${st.logs}/${st.basketMax} בסל`, r && r.gold ? 'combo' : 'info');
        sfx('coin');
        L0('log', st.logs);
        stat('chops');
        {
          const h = heroP();
          fx('load', { x: STN.wood.at.x, y: 17, z: STN.wood.at.z }, { x: h.x, y: 18, z: h.z }, 1);
        }
      }
    } else if (id === 'kevesh') {
      st.atTop = true;
      if (b17) {
        stat('climbs');
        const a = st.t - t0;
        if (a > 0.5 && (!st.rampBest || a < st.rampBest)) st.rampBest = a;
        st.trip = { n: st.logs, laid: 0 };
        emit17('top', { dur: Math.round(a * 10) / 10 });
      } else stamp('עליתם — הניחו את העצים על המערכה (הקישו)', 'info');
      L0('top');
    }
    return true;
  }
  function tapStation(id) {
    if (st.phase !== 'run' || acting || !STN[id] || !door35(id)) return false;   // ── fable32 (build 35) ── (door35) ── /fable32 ──
    if (st.k20 || st.d21 || st.p25) return false;
    if (gate20() && id !== 'kiyor') return gate20no(id);   // ── fable32 (build 20) ── ── /fable32 ── ── fable32 (build 21) ── ── /fable32 ──
    if (gate23() || st.p23) return gate23no(id);   // ── fable32 (build 23) ── ── /fable32 ──
    if (gate21()) return gate21no(id);
    if (gate25()) return id === 'pen' ? peek24() : gate25no(id);   /* ── fable32 (build 25) ── */
    if ((st.r26 && st.r26.ph !== 'out') || gate26L() || gate26() || gate27() || on27()) return gate26no(id);   /* ── fable32 (build 26) ── */ /* ── fable32 (build 27) ── */
    if (gate22() && !(id === 'kevesh' && carry22())) return id === 'wood' && !st.m22 ? peek24('wood') : gate22no(id);
    if (id === 'pyre') return runAt('pyre');
    const p = standOf(id),
      h = heroP();
    return p ? (Math.hypot(p.x - h.x, p.z - h.z) <= DAY33.reach ? runAt(id) : peek24(id)) : false;
  }
  // ── recovered (build 24) ── peek24 (the report's): no auto-walk — a tap shows the way (st.pk24: the tapped slot's way, 3 s) and pulses the
  // chip; he walks by the stick
  function peek24(id) {
    const at = id === 'pyre' ? { ...PYRE } : id ? standOf(id) : null,
      slot = id ? bar17().find((x) => x.id === id) : null,
      s = id && STN[id];
    st.pk24 = at && id !== nx33().id ? { id, at, until: st.t + 3 } : null;
    SHARED.pulse31 = performance.now();
    const text = slot ? `${slot.icon} ${slot.he} · ${slot.badge}` : s ? `${s.icon || ''} ${s.he}` : '';
    if (text) emit17('pop', { text });
    emit17('pulse', { id: id || null });
    L0('peek', id);
    return true;
  }
  function stopAt33(h) {
    if (st.phase !== 'run' || acting || gate27() || st.r27) return null;   // ── fable32 (build 27) ── ── /fable32 ──
    const n = nx33();
    if (n.kind !== 'station') return null;
    const p = standOf(n.id);
    if (!p || Math.hypot(p.x - h.x, p.z - h.z) > 2.4) return null;
    if (st.arr !== n.id && !b17) {
      st.arr = n.id;
      sfx('ok');
      try {
        if (navigator.vibrate) navigator.vibrate([18, 40, 18]);
      } catch (e) {}
      SHARED.arrive32 = { t: performance.now(), x: p.x, z: p.z, id: n.id };
      L0('arrive', n.id);
    }
    return pos3((STN[n.id] || {}).at) || p;
  }
  /* ───────── the button's word (flow31 places it beside the thing) ───────── */
  const actLabel = (id, s) =>
    id === 'kevesh' ? (b19 ? 'עלו בכבש — בסטיק' : 'העלו עצים — החזיקו') : b19 && id === 'salt' ? 'מלאו שק מלח — הקישו' : verb31(id, s);
  function work(h) {
    if (st.phase !== 'run') return null;
    if (prac && prac.ch33 && !st.p25 && !gate25()) return null;   // ── fable32 (build 33) ── (the chamber's run: no other work — the azara's stations are the day's) ── /fable32 ──
    if (acting) {
      const sa = ST && ST.state ? say(() => ST.state()) : null,
        s2 = STN[acting.id] || {};
      return sa && sa.phase === 'tail' && !(STN[acting.id] && STN[acting.id].verb === 'swing') && acting.id !== 'kevesh'
        ? { icon: '✓', label: 'יפה!', job: 'sh:done', noRing: true, go: () => {}, act31: true }
        : { icon: s2.icon || '✋', label: actLabel(acting.id, s2), job: 'sh:act', noRing: true, go: () => {}, act31: true };
    }
    if (e35 && (st.close35 || workDone35())) return null;   // ── fable32 (build 35) ── (the work done: no button — the close comes) ── /fable32 ──
    const n = nx33();
    if (st.night && st.inMoked && !(st.torchOn && !st.watched) && unclaimed().length && st.bookNight !== st.day)   // (build 11)
      return { icon: '📜', label: `ספר הזכרונות (${unclaimed().length})`, job: 'sh:book', noRing: true, go: () => claimBook() };
    if (st.night && st.inMoked && !(st.torchOn && !st.watched) && !st.tilesNight && o.games)   // ── fable32 (build 13) ── (the interlude at night in the Moked: once a night, the clock held; פרוטות) ── /fable32 ──
      return {
        icon: '🃏',
        label: 'משחק לילה — זיכרון, הדיר, האוצר',
        job: 'sh:tiles',
        noRing: true,
        go: () => {
          st.tilesNight = true;
          offerPlay();
        },
      };
    if (st.k20) return { icon: '💧', label: 'שתי הטבעות — החזיקו', job: 'sh:k20', noRing: true, go: () => {} };
    if (lotOn() || gate23()) return { icon: '☝', label: 'הפיס', job: 'sh:p23', noRing: true, go: () => {} };
    if (st.p25) return { icon: '🐑', label: 'בדיקת הטלה', job: 'sh:p25', noRing: true, go: () => {} };
    if (gate25()) return { icon: '🐑', label: goLabel31(prac && prac.ch33 ? 'לשכת הטלאים' : 'דיר הטלאים'), job: 'sh:go:p25', noRing: true, go31: true, go: () => peek24() };   // ── fable32 (build 33) ── ── /fable32 ──
    if (st.r26 && st.r26.ph !== 'walk' && st.r26.ph !== 'out')
      return { icon: st.role26 === 'inner' ? '🥣' : '🪔', label: 'ההיכל', job: 'sh:r26', noRing: true, go: () => {} };
    // ── fable32 (build 27) ── (his blood role: at its work, or the way to the ring and to the corners) ── /fable32 ──
    if (act27()) return { icon: st.role26 === 'shochet' ? '🔪' : '🏺', label: st.role26 === 'shochet' ? 'השחיטה' : 'זריקת הדם', job: 'sh:r27', noRing: true, go: () => {} };
    if (gate27() || on27())
      return {
        icon: st.role26 === 'shochet' ? '🔪' : '🏺',
        label: goLabel31(!st.r27 ? 'הטבעות' : st.r27.ph === 'carry2' ? 'קרן מערבית דרומית' : 'קרן מזרחית צפונית'),
        job: 'sh:go:r27',
        noRing: true,
        go31: true,
        go: () => peek24(),
      };
    if (gate26L() || gate26())
      return {
        icon: gate26L() ? '☝' : '🗝️',
        label: gate26L() ? (onHigh(h.x, h.z) ? goLabel31('רגל הכבש') : 'הפיס השני') : goLabel31(open26() ? 'ההיכל' : 'שער ההיכל'),   /* ── fable32 (build 26b) ── (the lot where he stands) ── */
        job: 'sh:go:r26',
        noRing: true,
        go31: true,
        go: () => peek24(),
      };
    if (st.d21)
      return st.d21.ph === 'foot'
        ? st.d21.near
          ? { icon: '🔥', label: 'צברו את הגחלים — הקישו', job: 'sh:d21pour', noRing: true, go: d21tap }
          : { icon: '🔥', label: 'לטבעת הזהב', job: 'sh:go:d21', noRing: true, go31: true, go: () => peek24() }
        : { icon: '🔥', label: 'תרומת הדשן', job: 'sh:d21', noRing: true, go: () => {} };
    if (gate21())
      return { icon: '🔥', label: goLabel31(onHigh(h.x, h.z) ? 'הגחלים' : 'הכבש'), job: 'sh:go:d21', noRing: true, go31: true, go: () => peek24() };
    if (
      b19 &&
      !st.night &&
      (!gateAny() || (carry22() && st.logs > 0)) &&
      (near19(h) || nearK24(h)) &&
      h.z > R19.head &&
      (st.logs > 0 || st.r19.bag > 0)
    ) {
      const hold = () => {};
      return st.logs > 0
        ? { icon: '🧺', label: 'ייצבו את הסל — החזיקו', job: 'sh:run19', noRing: true, go: hold }
        : { icon: '🧂', label: 'זרו מלח — החזיקו', job: 'sh:salt19', noRing: true, go: hold };
    }
    if (gate22()) return card22(h);
    if (!st.night && st.logs > 0 && atTop(h) && !gateAny())
      return atPyre(h)
        ? {
            icon: '🔥',
            label: 'הניחו גזר — הקישו',
            job: 'sh:lay',
            noRing: true,
            near31: true,
            id31: 'pyre',
            at: { ...PYRE, y: PYRE.y + 1 },
            go: () => layLogs(),
          }
        : { icon: '🔥', label: 'למערכה', job: 'sh:go:pyre', noRing: true, go31: true, id31: 'pyre', go: () => layLogs() };
    const down = { icon: '⬇️', label: 'ירדו מהמזבח', job: 'sh:go:down', noRing: true, go31: true, go: () => peek24() };
    if (!st.night && st.logs <= 0 && atTop(h)) return down;
    if (gate20()) {
      const s = standOf('kiyor'),
        kiyor = STN.kiyor;
      return !s || !kiyor
        ? null
        : atTop(h)
          ? down
          : Math.hypot(s.x - h.x, s.z - h.z) <= DAY33.reach + 0.2
            ? {
                icon: '💧',
                label: 'קדשו ידיים ורגליים',
                job: 'sh:kiyor',
                noRing: true,
                near31: true,
                id31: 'kiyor',
                at: { ...s, y: (s.y || 16) + 1 },
                go: () => runAt('kiyor'),
              }
            : { icon: '💧', label: goLabel31(kiyor.he), job: 'sh:go:kiyor', noRing: true, go31: true, id31: 'kiyor', go: () => peek24() };
    }
    if (n.kind === 'torch')
      return {
        icon: '🔥',
        label: 'הלפיד — הקישו',
        job: 'sh:torch',
        noRing: true,
        go: () => {
          st.watched = true;
          st.torchOn = false;
          st.watches++;
          stamp('המשמר ער — יפה!', 'combo');
          sfx('coin');
          L0('torch-ok');
        },
      };
    if (st.night) return { icon: '🌙', label: 'לילה — נחים עד השחר', job: 'sh:wait', noRing: true, go: () => {} };
    if (n.kind === 'lamb' && st.lost) {
      const Lm = st.lost,
        d2 = Math.hypot(Lm.x - h.x, Lm.z - h.z);
      if (!Lm.follow)
        return d2 <= DAY33.reach + 0.5
          ? {
              icon: '🐑',
              label: 'קחו את הטלה',
              job: 'sh:lamb',
              noRing: true,
              near31: true,
              id31: 'lamb',
              go: () => {
                Lm.follow = true;
                stamp('הטלה הולך אחריכם — לדיר!', 'combo');
                sfx('coin');
                L0('lamb-take');
              },
            }
          : { icon: '🐑', label: 'לך לטלה', job: 'sh:go:lamb', noRing: true, go31: true, id31: 'lamb', go: () => peek24() };
    }
    // (build 7: any OPEN station within reach is his to use — the Roblox way; the next one is only the path's suggestion)
    let crit = b17 && !e35 && st.fuel < B17.crit,   // ── fable32 (build 35) ── (no low fire in the morning of the work) ── /fable32 ──
      nearId = null,
      nd = 1e9;
    for (const id of shown33()) {
      if (!usable(id) || (crit && id !== 'wood' && id !== 'kevesh') || (b19 && id === 'kevesh')) continue;
      const q = standOf(id);
      if (!q) continue;
      const d2 = Math.hypot(q.x - h.x, q.z - h.z);
      if (d2 <= DAY33.reach + 0.2 && d2 < nd) {
        nd = d2;
        nearId = id;
      }
    }
    if (nearId && nearId !== n.id) {
      const s2 = STN[nearId],
        p2 = standOf(nearId);
      return {
        icon: s2.icon || '✋',
        label: actLabel(nearId, s2),
        job: 'sh:' + nearId,
        noRing: true,
        near31: true,
        id31: nearId,
        at: { ...p2, y: (p2.y || 16) + 1 },
        go: () => runAt(nearId),
      };
    }
    if (st.merchant && !nearId && !crit) {
      const m = DAY33.merchantAt;
      if (Math.hypot(m.x - h.x, m.z - h.z) <= DAY33.reach + 1)
        return {
          icon: '🧺',
          label: st.bread > 0 ? 'הסוחר — תנו לחם' : 'הסוחר מבקש לחם',
          job: 'sh:merchant',
          noRing: true,
          near31: true,
          id31: 'merchant',
          go: () => trade(),
        };
    }
    if (st.bread > 0 && st.power < 70 && !nearId && !crit)
      return {
        icon: '🍞',
        label: 'אכלו לחם',
        job: 'sh:eat',
        noRing: true,
        go: () => {
          st.bread--;
          st.power = Math.min(DAY33.power0, st.power + st.breadPower);
          stamp(`אכלתם — כוח ${Math.round(st.power)}`, 'combo');
          sfx('coin');
          L0('eat');
        },
      };
    const s = STN[n.id],
      p = standOf(n.id);
    if (!s || !p) return null;
    const d = Math.hypot(p.x - h.x, p.z - h.z);
    // ── fable32 (build 28) ── (the idle offer of build 14 — 12 s with nothing near → "משחק קצר?" — is out of the day: the way, as for any station) ── /fable32 ──
    return d <= DAY33.reach + 0.2
        ? {
            icon: s.icon || '✋',
            label: actLabel(n.id, s),
            job: 'sh:' + n.id,
            noRing: true,
            near31: true,
            id31: n.id,
            at: { ...p, y: (p.y || 16) + 1 },
            go: () => runAt(n.id),
          }
        : { icon: s.icon || '➜', label: goLabel31(s.he), job: 'sh:go:' + n.id, noRing: true, go31: true, id31: n.id, go: () => tapStation(n.id) };
  }
  // ── fable32 (build 14) ── the interludes from the court: a choice card (never a must), the day's clock held while one plays; its פרוטות and score are the player's
  async function playGame(key) {
    const g = o.games && o.games[key];
    if (!g || st.playing) return false;
    st.playing = key;
    st.paused = true;
    drive(0, 0);
    st.idleT = 0;
    evlog('play_game', key);
    let r = null;
    try {
      r = await g();
    } catch (e) {
      r = null;
    }
    st.paused = false;
    st.playing = null;
    if (r && r.perutot > 0) {
      save.perutot = (+save.perutot || 0) + (r.perutot | 0);
      st.perutot = save.perutot;
      say(() => o.persist && o.persist());
    }
    const pts = interludeScore(key, r);
    if (pts > 0) score(pts, key);
    if (r && r.won) {
      stamp(`${GAME_HE[key] || key}: +${r.perutot | 0} פרוטות${pts ? ` · +${pts} ★` : ''}`, 'combo');
      sfx('coin');
      stat('games');
    }
    L0('game', key, r ? r.won : null);
    return !!(r && r.won);
  }
  // ── fable32 (build 14.1) ── at the ramp's top: HIS tap lays the logs on the pyre (they arc from the basket onto the fire); nothing goes up by itself
  const PYRE = { x: -29.5, y: 25.5, z: -3.5 },
    TOP = { x: -34, y: 25, z: 12 },
    FOOT19 = { x: -38, y: 16, z: 44.5 },
    atTop = (h) => (h.y || 16) > 22 && h.x > -53 && h.x < -23 && h.z > -18.5 && h.z < 16.5,
    atPyre = (a) => Math.hypot(PYRE.x - a.x, PYRE.z - a.z) <= DAY33.layReach;
  function layLogs() {
    if (st.logs <= 0) return false;
    if (gate20()) return gate20no('pyre');
    if (lotOn() || gate23()) return gate23no('pyre');
    if (st.p25 || gate25()) return gate25no('pyre');
    if ((st.r26 && st.r26.ph !== 'out') || gate26L() || gate26() || gate27() || on27()) return gate26no('pyre');   // ── fable32 (build 26) ── ── /fable32 ──
    if (gate21()) return gate21no('pyre');
    if (gate22()) return carry22() ? false : gate22no('pyre');
    const h = heroP();
    if (!atPyre(h)) return peek24('pyre');
    const n = st.basketQ.length ? st.basketQ.shift() : null;
    st.logs--;
    st.carried++;
    st.atTop = false;
    st.laidT = st.t;
    st.laid = (st.laid | 0) + 1;
    const k = Math.min(DAY33.stackMax - 1, stackN());
    fx('lay1', { x: h.x, y: (h.y || 25) + 2.2, z: h.z }, stackSlot(k), 1);
    feed(1, [n], true);
    stat('carried', 1);
    st.idleT = 0;
    L0('lay', 1, n);
    if (c18) pay(C18.pay[n] || 1, 'lay', { x: PYRE.x, y: PYRE.y + 3, z: PYRE.z });
    if (b17) {
      st.laidDay++;
      if (st.trip) st.trip.laid++;
      if (st.logs <= 0) emit17('done', { text: 'המערכה בוערת!', sub: `+${(st.trip && st.trip.laid) || 1} גזרים` });
    }
    try {
      const __HERO35 = globalThis.__HERO35;
      if (__HERO35 && __HERO35.loaded) __HERO35.play('PickUp', { once: true, at: 0.15, speed: 2.4, restart: true, fade: 0.08 });
    } catch (e) {}
    if (st.logs <= 0) {
      score(DAYSCORE.act.good, 'lay');
      evlog('lay', { n: st.laid, fuel: Math.round(st.fuel) });
      st.laid = 0;
    }
    return true;
  }
  const stackN = () => Math.max(1, Math.min(DAY33.stackMax, Math.round(st.fuel / (100 / DAY33.stackMax))));
  function stackSlot(i) {
    const row = Math.floor(i / 4),
      col = i % 4,
      odd = row % 2 === 1,
      off = (col - 1.5) * 0.9;
    return { x: PYRE.x + (odd ? off : 0), y: PYRE.y + 1.9 + row * 0.5, z: PYRE.z + (odd ? 0 : off), cross: odd };
  }
  // ── /fable32 ──
  function offerPlay() {
    if (!hud || !hud.choice || !o.games) return false;
    st.idleT = 0;
    const items = Object.keys(o.games).map((k) => ({
      icon: GAME_ICON[k] || '🎲',
      label: GAME_HE[k] || k,
      sub: GAME_SUB[k] || '',
      go: () => {
        playGame(k);
        return true;
      },
    }));
    say(() =>
      hud.choice({
        title: 'משחק לילה',   // ── fable32 (build 28) ── (the night's offer only, in the Moked — B17.night, off in the shipped day; was "משחק קצר?", which is the lobby's door now) ── /fable32 ──
        text: 'הממונה: "יש רגע? שחקו — הפרוטות והנקודות שלכם" (טיוטה)',
        items,
        closeLabel: 'אחר כך',
        onClose: () => {},
      }),
    );
    return true;
  }
  // ── /fable32 ──
  function flowNext() {
    if (
      (prac && prac.end) ||   // ── fable32 (build 31) ── (a practice run: after his act, no next place — the card comes) ── /fable32 ──
      (prac && prac.ch33 && (prac.ch33.done || prac.ch33.out)) ||   // ── fable32 (build 33) ── (the chamber: today's lamb inspected — no next place) ── /fable32 ──
      st.night ||
      st.k20 ||
      lotOn() ||
      gate23() ||
      st.p25 ||
      (st.r26 && st.r26.ph !== 'walk' && st.r26.ph !== 'out') ||
      act27() ||
      (st.d21 && st.d21.ph !== 'foot') ||
      (st.m22 && !carry22())
    )
      return null;
    if (gate26L()) {
      const h = heroP();
      return onHigh(h.x, h.z) ? { id: 'lot26', kind: 'station', pid: null, at: { x: P26.foot.x, y: 16, z: P26.foot.z } } : null;
    }
    if (gate26()) {   /* ── fable32 (build 26b) ── (no walk back to a circle: the lot where he stands — from the altar's top, down the ramp first) ── */
      const S0 = open26() ? at26(st.role26) : P26.gate;
      return { id: 'r26', kind: 'station', pid: null, at: { x: S0.x, y: 22, z: S0.z } };
    }
    if (gate27() || on27()) {   /* ── fable32 (build 27) ── (to his place at the ring; with the vessel, to the north-east corner, then round the north and the west to the south-west) ── */
      const a = !st.r27 ? (st.role26 === 'zorek' ? P27.recv : P27.stand) : P27.at[st.r27.ph === 'carry2' ? 'SW' : 'NE'];
      return { id: 'r27', kind: 'station', pid: null, at: { x: a.x, y: 16, z: a.z } };
    }
    /* ── fable32 (build 26) ── (the way back to the circle; up the steps to the great gate; in, to his vessel) ── */ /* ── fable32 (build 21) ── (no path while he sweeps and goes down; at the foot — to the ring) ── */ /* ── fable32 (build 22) ── (nor while he sorts or stacks) ── */
    if (gate21()) return { id: 'deshen', kind: 'station', pid: null, at: standOf('deshen') };
    if (gate22() && e35 && carry22() && b19 && st.r19.fl.length) return { id: 'log19', kind: 'station', pid: null, at: standOf('log19') };   // ── fable32 (build 35) ── (a log dropped on the run: the way to it first) ── /fable32 ──
    if (gate22()) return { id: 'm22', kind: 'station', pid: null, at: standOf('m22') };
    if (gate25()) return { id: prac && prac.ch33 ? 'ch33' : 'pen', kind: 'station', pid: null, at: { x: pl25().stand.x, y: 16, z: pl25().stand.z } };   /* ── fable32 (build 33) ── (the chamber's door in its run) ── */   /* ── fable32 (build 25) ── (the way to the pen's door) ── */
    if (st.pk24 && st.t < st.pk24.until) return { id: st.pk24.id, kind: 'station', pid: null, at: st.pk24.at };   /* ── fable32 (build 24) ── (a tapped slot's way, 3 s) ── */ /* ── build 16 ── (no path at night) ── */ /* ── fable32 (build 20) ── (nor in the kiddush) ── */
    if (
      !st.night &&
      st.logs > 0 &&
      !acting &&
      (atTop(heroP()) || (b19 && st.r19.run) || (b19 && !gateAny() && (near19(heroP()) || nearK24(heroP())) && nx33().id === 'kevesh'))   /* ── fable32 (build 19) ── (running up: the way is up) ── */ /* ── fable32 (build 24) ── (at the ramp's foot, the ramp his next: the way goes on up — the stick climbs) ── */
    )
      return { id: 'pyre', kind: 'station', pid: null, at: { ...PYRE } };   /* ── build 16 ── (review #2: the bubble pointed at the ramp's foot while he stood at the top with logs) ── */
    const n = nx33();
    return n.kind === 'lamb' && st.lost && !st.lost.follow
      ? { id: 'lamb', kind: 'station', pid: null, at: { x: st.lost.x, y: 16, z: st.lost.z } }
      : n.kind === 'lamb' && st.lost
        ? { id: 'pen', kind: 'station', pid: null, at: standOf('pen') }
        : n.kind !== 'station'
          ? null
          : { id: n.id, kind: 'station', pid: null, at: standOf(n.id) };
  }
  // ── recovered (build 17) ── the focused day's card and bar (focus17.js draws them): the step now (step17), the slots (bar17), a tap on a
  // slot (tap17), on the fire or the tamid (fire17), on the card (go17); hot17: how near the next place
  const CARD17 = {
      wood: ['🪵', () => `בקעו ${basketCap()} גזרים`, () => [st.logs, basketCap()]],
      kevesh: ['⛰️', () => 'העלו את הגזרים בכבש', () => [st.logs, 0]],
      kiyor: ['💧', () => 'קדשו ידיים ורגליים', () => (g20 ? [0, 0] : [0, 1])],
      pen: ['🐑', () => 'בקרו טלאים לתמיד', () => (b17 ? penN() : [okLambs(), DAY33.lambs])],
      song: ['🎶', () => 'שירו עם הלויים', () => [0, 1]],
      oil: ['🏺', () => 'הביאו שמן וסולת ללחם', () => [st.oil, 1]],
      salt: ['🧂', () => (b19 ? 'מלאו שק מלח' : 'הביאו מלח ללחם'), () => (b19 ? [0, 0] : [st.salt, 1])],
      saltR: ['🧂', () => 'מלחו את הכבש', () => [0, 0]],
      log19: ['🪵', () => 'הרימו את הגזר שנפל', () => [0, 0]],
      bake: ['🍞', () => (powerOn ? 'אפו לחם — כוח לכהן' : 'אפו לחם'), () => (b17 ? [statN('baked'), B17.goals.bake] : [st.bread, 1])],
      lamb: ['🐑', () => (st.lost && st.lost.follow ? 'הובילו את הטלה לדיר' : 'החזירו את הטלה לדיר'), () => [0, 1]],
      chests: ['🪙', () => 'השופרות מלאים — עברו לידם', () => [st.ch18.n, chests.max]],
      pad: [
        '🪙',
        () => {
          const a = padOpen();
          return a ? `${a.icon} ${a.he} — עמדו על המשטח` : '';
        },
        () => [0, 0],
      ],
    },
    TO17 = {
      wood: 'לעצים',
      kiyor: 'לכיור',
      pen: 'לדיר',
      song: 'לדוכן',
      oil: 'לשמנים',
      salt: 'למלח',
      bake: 'לאופים',
      lamb: 'לטלה',
      kevesh: 'לכבש',
      chests: 'לשופרות',
      pad: 'לגזבר',
      saltR: 'לכבש',
      log19: 'לגזר',
    };
  // ── fable32 (build 30) ── an act in progress (the morning's acts and the lots: from his first step into it to its end) — while it is,
  // the step card is its ONE line (rate30's LINE30, 2–4 words) and nothing else says words over the world (rohvi-he.md §14; the owner,
  // 22.10 09:19: "שורה אחת של 2–4 מילים בזמן הפעולה; המקור בשורה אחת בסוף הפעולה"); a word of feedback replaces it for a moment
  // (E.say30: the modules' "ארוך יותר ↔", "מעל החוט — לא כאן" …); at the act's end its rating, RATE30.wordS ── /fable32 ──
  // ── fable32 (build 36) ── the role he will play (or plays) now — the laver until washed, the first lot's role once the lot gave it and
  // until it ends, the second lot's likewise; in a practice run its role — and its level { id, lv } (null between his acts) ── /fable32 ──
  function lv36now() {
    if (!b17 || st.summary || st.night || st.close35) return null;
    let id = null;
    if (prac) id = prac.ch33 ? null : prac.end ? null : prac.role;
    else if (st.k20 && st.k20.ph !== 'rise' && st.k20.ph !== 'down') id = 'kiyor';
    else if (g20 && !st.washed) id = 'kiyor';
    else if (st.d21 && st.d21.ph !== 'end') id = 'deshen';
    else if (st.m22 && st.m22.ph !== 'end' && st.p23day === st.day && st.lot === 'm22') id = 'm22';
    else if (st.p25 && !/^(lead|end|out)$/.test(st.p25.ph)) id = 'lamb';
    else if (st.r26 && st.r26.ph !== 'out') id = st.r26.role;
    else if (st.r27 && st.r27.ph !== 'out') id = st.r27.role;
    else if (p23 && st.p23day === st.day && !st.p23 && st.lot && (st.lot === 'deshen' ? st.d21day : st.lot === 'm22' ? st.m22day : st.p25day) !== st.day) id = st.lot;
    else if (p26 && st.p26day === st.day && !st.p23 && st.role26 && st.r26day !== st.day) id = st.role26;
    if (!id || !LVL36[id]) return null;
    const K = id === 'kiyor' ? st.k20 : id === 'deshen' ? st.d21 : id === 'm22' ? st.m22 : id === 'lamb' ? st.p25 : id === st.role26 && (st.r26 || st.r27) ? st.r26 || st.r27 : prac ? st.r26 || st.r27 : null;
    return { id, lv: K && K.lv ? K.lv : lvOf36(id) };
  }
  /** the act in progress of a role: its level and its knobs (the role modules draw by them) — or the level he would play it at */
  function lv36act(id) {
    const K = id === 'kiyor' ? st.k20 : id === 'deshen' ? st.d21 : id === 'm22' ? st.m22 : id === 'lamb' ? st.p25 : id === 'inner' || id === 'menorah' ? st.r26 && st.r26.role === id && st.r26 : id === 'shochet' || id === 'zorek' ? st.r27 && st.r27.role === id && st.r27 : null,
      lv = K && K.lv ? K.lv : lvOf36(id);
    return { id, lv, p: (K && K.P36) || par36(id, lv) };
  }
  const act30 = () =>
      !!(st.k20 && (st.k20.ph === 'up' || st.k20.ph === 'pose')) ||
      !!st.p23 ||
      !!(st.d21 && st.d21.ph !== 'end') ||
      !!(st.m22 && st.m22.ph !== 'end') ||
      !!(st.p25 && !/^(lead|end|out)$/.test(st.p25.ph)) ||   // ── fable32 (build 33) ── (+ out) ── /fable32 ──
      !!(st.r26 && st.r26.ph !== 'out') ||
      !!(st.r27 && st.r27.ph !== 'out'),
    say30 = (text, kind = 'info', s = 1.6) => {
      if (!text || !act30()) return false;
      st.say30 = { text: String(text), kind, until: st.t + s };
      return true;
    },
    word30 = () => (st.end30 && st.t < st.end30.until && !act30() ? st.end30 : null);
  function step17() {
    if (!b17 || st.phase !== 'run' || st.summary || st.night) return null;
    const a = step17a();
    if (!a) return a;
    if (act30()) {
      const w = st.say30 && st.t < st.say30.until ? st.say30 : null;
      return w ? { ...a, text: w.text, say: w.kind } : a;
    }
    const e = word30();
    return e ? { ...a, icon: RATE30.icon[e.rating], text: RATE30.he[e.rating], n: 0, goal: 0, say: 'r30-' + e.rating, r30: e.id } : a;
  }
  function step17a() {
    const h = heroP(),
      L30 = LINE30;
    if (prac && prac.ch33 && !st.p25 && !gate25()) return { id: 'ch33', icon: '🐑', text: 'הטלאים בלשכה', n: 0, goal: 0, st: null };   // ── fable32 (build 33) ── (the chamber's run after its inspection: its stock, not the day's fire) ── /fable32 ──
    if (e35 && (st.close35 || workDone35())) return { id: 'close35', icon: '🌅', text: 'הבוקר הושלם', n: 0, goal: 0, st: null };   // ── fable32 (build 35) ── (the work done: the morning's close) ── /fable32 ──
    if (st.k20 && (st.k20.ph === 'up' || st.k20.ph === 'pose')) return { id: 'kiyor', icon: '💧', text: L30.kiyor[st.k20.ph], n: 0, goal: 0, st: 'kiyor' };
    if (gate23() || lotOn()) {
      const p23 = st.p23;
      return {
        id: 'p23',
        icon: '☝',
        text: p23 ? (!p23.raised ? L30.lot.raise : p23.ph === 'show' || p23.ph === 'choose' ? L30.lot.show : L30.lot.count) : L30.lot.raise,   // ── fable32 (build 30) ── (was 'הוציאו אצבע — החליקו למעלה' / 'הפיס — הממונה סופר אצבעות') ── /fable32 ──
        n: 0,
        goal: 0,
        st: null,
      };
    }
    if (gate25() || st.p25) {
      const p25 = st.p25,
        a = p25 ? p25.ph : '',
        sp = p25 && p25.zi >= 0 && p25.L ? p25.L.spots[p25.zi] : null;
      return {
        id: 'p25',
        icon: '🐑',
        text: p25
          ? a === 'dirt' && sp
            ? `${sp.d === 'mud' ? 'בוץ' : 'קש'} — ${L30.lamb.dirt}`
            : a === 'blem' && sp && sp.kind === 'blem'
              ? `${BLEM25.cats[sp.c].he.split(' / ')[0]} · ${BLEM25.regs[sp.r].he}`   // (the blemish — המחשה: its kinds and places, the end's card)
              : (prac && prac.ch33 && /^(lead|end|out)$/.test(a) ? 'הטלאים בלשכה' : prac && prac.ch33 && prac.ch33.lit === 'day' && a === 'scan' ? LINE33.scan : '') || L30.lamb[a] || L30.lamb.scan   // ── fable32 (build 33) ── (the chamber by day: "הביטו", not the torch's "האירו") ── /fable32 ──
          : prac && prac.ch33 ? 'לשכת הטלאים — לכו לפתח הלשכה' : 'בדיקת הטלה — לכו לדיר הטלאים',
        n: 0,
        goal: 0,
        st: 'pen',
      };
    }
    if (gate26L())
      return {
        id: 'p26',
        icon: '☝',
        text: onHigh(h.x, h.z) ? 'הפיס השני — רדו מן המזבח' : 'הפיס השני — הכהנים מתכנסים סביבכם',
        n: 0,
        goal: 0,
        st: null,
      };
    if (gate27() || on27()) {   // ── fable32 (build 27) ── ── /fable32 ──
      const K = st.r27,
        sh = st.role26 === 'shochet',
        ph = K ? K.ph : '',
        T27 = sh ? L30.shochet : L30.zorek,   // ── fable32 (build 30) ── (the one line; were the longer T27 lines) ── /fable32 ──
        text = K ? (!sh && ph === 'wait' && open26() ? T27.waitOpen : T27[ph] || (sh ? 'השחיטה' : 'זריקת הדם')) : `${sh ? 'השחיטה' : 'זריקת הדם'} — לכו לטבעות, צפונית למזבח`;
      return { id: 'r27', icon: sh ? '🔪' : '🏺', text, n: K && !sh ? K.gifts.length : 0, goal: K && !sh ? 2 : 0, st: null };
    }
    if (gate26() || (st.r26 && st.r26.ph !== 'out')) {
      const r26 = st.r26,
        a = r26 ? r26.ph : '',
        b = st.role26 !== 'inner',
        c = b ? 'דישון המנורה' : 'דישון מזבח הפנימי',
        L = b ? L30.menorah : L30.inner,
        d = r26
          ? (b && a === 'wick' && r26.li > 0 ? L.wick2 : L[a]) || (b ? 'הטיבו את הנרות' : 'חפנו את הדשן')   // ── fable32 (build 30) ── (the one line) ── /fable32 ──
          : open26()
            ? b
              ? 'היכנסו להיכל — אל המנורה שבדרום'
              : 'היכנסו להיכל — אל מזבח הזהב'
            : `${c} — עלו לשער ההיכל`,
        f = r26 && !/^(in|bolt|key|open|walk)$/.test(a);
      return { id: 'r26', icon: b ? '🪔' : '🥣', text: d, n: f ? (b ? r26.li : r26.n) : 0, goal: f ? (b ? r26.ord.length : P26.pulls) : 0, st: null };
    }
    if (gate21()) {
      const d21 = st.d21,
        a = d21 ? d21.ph : '';
      return {
        id: 'deshen',
        icon: '🔥',
        text: d21 ? (a === 'foot' && d21.near ? L30.deshen.near : L30.deshen[a] || L30.deshen.go) : 'תרומת הדשן — עלו למזבח',   // ── fable32 (build 30) ── ── /fable32 ──
        n: d21 ? d21.n : 0,
        goal: a === 'in' || a === 'sweep' ? D21.layers : 0,
        st: 'kevesh',
      };
    }
    if (gate22()) {
      const m22 = st.m22,
        a = m22 ? m22.ph : '',
        b = a === 'in' || a === 'sort' || a === 'sorted',
        c = a === 'stack' || a === 'stackIn';
      return {
        id: 'm22',
        icon: a === 'carry' ? '⛰️' : a === 'ready' || a === 'ignite' || a === 'end' ? '🔥' : '🪵',
        text: m22
          ? a === 'in' || a === 'sort'
            ? first22()
              ? L30.m22.first
              : L30.m22.sort
            : c
              ? (m22.layer === 4 ? L30.m22.s2 : L30.m22[(p23 ? 'l' : 'L') + Math.min(3, m22.layer || 1)]) || L30.m22.l1   // ── fable32 (build 36) ── (layer 4: the second pyre's line) ── /fable32 ──
              : a === 'carry' && e35 && b19 && st.r19.fl.length
                ? L30.m22.log   // ── fable32 (build 35) ── (a log dropped on the run) ── /fable32 ──
                : L30.m22[a] || L30.m22.ignite   // ── fable32 (build 30) ── ── /fable32 ──
          : 'סדרו את המערכה הגדולה',
        n: b ? m22.got.length : c ? m22.got.filter((x) => x.at).length : 0,
        goal: b || c ? need22() : 0,
        st: m22 ? 'kevesh' : 'wood',
      };
    }
    if (st.logs > 0 && atTop(h)) {
      const a = st.trip || { n: st.logs, laid: 0 };
      return { id: 'pyre', icon: '🔥', text: 'הניחו על המערכה — הקישו', n: a.laid, goal: Math.max(a.n, a.laid + st.logs), st: 'kevesh' };
    }
    if (st.logs <= 0 && atTop(h)) {
      const id = nx33().id;
      return {
        id: 'down',
        icon: '⬇️',
        text: `רדו מהמזבח — ${TO17[id] || 'לעצים'}`,
        n: 0,
        goal: 0,
        st: id === 'oil' || id === 'salt' ? 'bake' : id === 'lamb' ? 'pen' : id,
      };
    }
    const a = b19 && st.r19.run ? { id: 'kevesh' } : nx33(),
      b = CARD17[a.id];
    if (!b) return null;
    const [c, d] = b[2](),
      f = a.id === 'oil' || a.id === 'salt' ? 'bake' : a.id === 'lamb' ? 'pen' : a.id,
      g = { id: a.id, icon: b[0], text: b[1](), n: c, goal: d, st: f };
    if (a.id === 'wood' || a.id === 'kevesh') {
      const a = tamid17();
      if (st.fuel < B17.crit) Object.assign(g, { icon: '🔥', text: 'האש דועכת — הביאו עצים', fire: 'crit' });
      else if (a && a.late && st.fuel < B17.tamid.fire) Object.assign(g, { icon: '🔥', text: 'הביאו עצים — התמיד מחכה לאש', fire: 'tamid' });
    }
    return g;
  }
  function bar17() {
    if (!b17 || st.phase !== 'run' || st.night) return [];
    let step = step17(),
      cur = step ? step.st : null,
      goals = B17.goals,
      a = {
        kiyor: [st.washed ? 1 : 0, goals.kiyor],
        wood: [statN('carried'), goals.wood],
        kevesh: [statN('climbs'), goals.kevesh],
        song: [statN('songs'), goals.song],
        pen: penN(),
        bake: [statN('baked'), goals.bake],
      },
      // ── fable32 (build 35) ── (the bar's dead slots hidden: the wood, the ramp's trips, the song, the old pen and the bakers were the
      // old loop's — the laver alone is the morning's; the chain bar of the morning is a later build, svivat-avoda-he.md §6) ── /fable32 ──
      b = (e35 ? (st.washed ? [] : ['kiyor']) : B17.slots).filter((x) => (x === 'song' ? open33('song') && (!!st.song || statN('songs') > 0) : open33(x))),   // (e35: the laver's slot while it is the morning's next; then none)
      c = gateAny(),
      d = gate20() ? 'kiyor' : gate23() || gate26L() || gate26() || gate27() || on27() ? '' : gate25() ? 'pen' : gate22() && !st.m22 ? 'wood' : 'kevesh';
    if (!e35 && st.fuel < B17.crit && !c) b = b.filter((x) => x === 'wood' || x === 'kevesh');   // ── fable32 (build 35) ── (!e35) ── /fable32 ──
    while (b.length > B17.maxSlots) {
      const c = b.findIndex((x) => x !== cur && a[x][0] >= a[x][1]);
      b.splice(c >= 0 ? c : b.length - 1, 1);
    }
    return b.map((x) => {
      const b = STN[x] || {},
        [f, g] = a[x],
        k = f >= g;
      return {
        id: x,
        icon: b.icon || '•',
        he: b.he || x,
        n: f,
        goal: g,
        done: k,
        badge: k ? '✓' : `${f}/${g}`,
        need: x === cur,
        lock: c && x !== d,
        empty: !k && ((x === 'kevesh' && !st.logs) || (x === 'bake' && !(st.oil > 0 && st.flour > 0 && st.salt > 0))),
      };
    });
  }
  function tap17(id) {
    if (!b17 || st.phase !== 'run' || acting || st.summary || st.k20) return false;
    const h = heroP();
    L0('bar', id);
    evlog('bar', id);
    return gate20() && id !== 'kiyor'
      ? gate20no(id)
      : gate23() || st.p23
        ? gate23no(id)
        : st.p25
          ? false
          : gate25()
            ? id === 'pen'
              ? peek24()
              : gate25no(id)
            : (st.r26 && st.r26.ph !== 'out') || act27()
              ? false
              : gate26L() || gate26() || gate27() || on27()
                ? gate26no(id)
                : st.d21
                  ? false
                  : gate21()
                    ? id === 'kevesh'
                      ? peek24()
                      : gate21no(id)
                    : gate22()
                      ? id === (st.m22 ? 'kevesh' : 'wood')
                        ? peek24()
                        : gate22no(id)
                      : peek24(
                          id === 'kevesh' && atTop(h) && st.logs > 0
                            ? 'pyre'
                            : id === 'bake'
                              ? st.oil > 0 && st.flour > 0
                                ? st.salt > 0
                                  ? 'bake'
                                  : 'salt'
                                : 'oil'
                              : id,
                        );
  }
  function fire17() {
    if (!b17 || st.phase !== 'run' || acting || st.summary || st.k20) return false;
    const h = heroP();
    L0('fire17');
    evlog('fire17');
    return gate20()
      ? gate20no('fire')
      : lotOn() || gate23()
        ? gate23no('fire')
        : st.d21 || st.p25 || (st.r26 && st.r26.ph !== 'out' && st.r26.ph !== 'walk') || act27()
          ? false
          : gate21() || gate22() || gate25() || gate26L() || gate26() || gate27() || on27()
            ? peek24()
            : peek24(st.logs > 0 ? (atTop(h) ? 'pyre' : 'kevesh') : 'wood');
  }
  function go17() {
    if (!b17 || st.phase !== 'run' || acting || st.summary || st.k20) return false;
    const step = step17();
    return !step || lotOn() || step.id === 'p23' || st.p25 || (st.r26 && st.r26.ph !== 'walk' && st.r26.ph !== 'out') || act27()
      ? false
      : (L0('card17', step.id), evlog('card17', step.id), peek24());
  }
  function hotStep() {
    if (!b17) return;
    const n = acting ? null : flowNext();
    if (!n || !n.at) {
      st.hot17 = null;
      return;
    }
    const h = heroP(),
      d = Math.hypot(n.at.x - h.x, n.at.z - h.z),
      a = n.id === 'pyre' ? DAY33.layReach : DAY33.reach + 0.2;
    st.hot17 = { id: n.id, d: Math.round(d * 10) / 10, r: a };
    if (d <= a) {
      if (st.arr17 !== n.id) {
        st.arr17 = n.id;
        emit17('arrive', { id: n.id });
        SHARED.arrive32 = { t: performance.now(), x: n.at.x, z: n.at.z, id: n.id };
        L0('arrive', n.id);
      }
    } else if (d > a + 3 || st.arr17 !== n.id) st.arr17 = null;
  }
  // (build 14: no walk hints — the owner: 'יותר פשוט להאיר את הבועה הרלוונטית'; the next place's chip pulses, the path lies on the floor)
  function hintStep() {
    if (!hud || !hud.hint) return;
    let h = null;
    if (st.phase === 'run' && st.day === 1) {
      const w = work(heroP());
      if (st.night) h = st.torchOn && !st.watched ? 'הקישו על הלפיד!' : 'לילה בבית המוקד — נחים עד השחר';
      else if (w && w.job === 'sh:run19') h = 'החזיקו — הסל יציב · עולים בימין';
      else if (w && w.job === 'sh:salt19') h = 'החזיקו והלכו — זורים מלח';
      else if (w && w.near31)
        h =
          w.id31 === 'wood'
            ? 'הקישו כשהטבעת נסגרת על הגזר — מכה אחת לגזר'
            : w.id31 === 'kevesh'
              ? 'החזיקו — הכהן עולה בכבש עם העצים'
              : w.id31 === 'pen'
                ? 'הקישו כשהטבעת נסגרת — השער נפתח והטלה נכנס'
                : `הקישו על הכפתור שליד ${STN[w.id31] ? STN[w.id31].he : ''}`;
    }
    if (h !== hintNow) {
      hintNow = h;
      say(() => hud.hint(h));
    }
  }
  /* ───────── the HUD ───────── */
  function push() {
    if (hud) {
      say(() =>
        hud.set({
          score: Math.round(st.fuel),
          combo: 1,
          rival: 0,
          rivalName: '',
          sec: Math.ceil(st.left),
          left: st.left,
          t: st.t,
          phase: st.phase,
          day33: {
            b17,
            score35: SC ? say(() => SC.get()) : null,
            day: st.day,
            night: st.night,
            logs: st.logs,
            basket: st.basketMax,
            level: st.level,
            fuel: st.fuel,
            power: st.power,
            bread: st.bread,
            washed: st.washed,
            perutot: st.perutot,
            lambs: open33('pen') ? `${okLambs()}/${DAY33.lambs}` : '',
          },
        }),
      );
      if (hud.tasks && !b17)
        say(() => hud.tasks(st.tasks.map((q) => ({ text: q.text, n: Math.min(q.goal, st.dayStats[q.key] | 0), goal: q.goal, done: !!q.done }))));
    }
  }
  /* ───────── the loop ───────── */
  function tick(dt) {
    if (!(dt > 0) || ended) return st;
    if (st.paused) {
      drive(0, 0);
      let26();
      return st;
    }
    dt = Math.min(dt, 0.25);
    if (st.phase !== 'run') return st;
    st.t += dt;
    // ── fable32 (build 31) ── a practice run: no day — no clock, no tamid, no drain, no gift, no merchant, no lost lamb, no chests; the
    // act's end card as its word ends (the day waits there: paused, as under any card) ── /fable32 ──
    if (prac) {
      const P = prac.end;
      if (P && !P.shown && st.t >= P.at) {
        P.shown = true;
        prac.done = { id: P.id, rating: P.rating, q: P.q };
        st.paused = true;
        drive(0, 0);
        let26();
        evlog('practice31_end', { id: P.id, rating: P.rating, q: P.q });
        L0('p31end', P.id, P.rating);
        if (P.ch33) emit17('ch33end', { id: P.id, rating: P.rating, q: P.q, out: P.out, blem: P.blem, coins: P.coins, dn: prac.ch33.dn });   // ── fable32 (build 33) ── (the chamber's end card: chamber33.js) ── /fable32 ──
        else emit17('p31end', { id: P.id, rating: P.rating, q: P.q, lv36: P.lv36 | 0, pts36: P.pts36 | 0, open36: P.open36 | 0 });   // ── fable32 (build 36) ── (+ its level, its points, a level opened) ── /fable32 ──
        return st;
      }
    } else {
      if (j32Step()) return st;   // ── fable32 (build 32) ── (the unlock card: the day waits under it) ── /fable32 ──
      if (l36Step()) return st;   // ── fable32 (build 36) ── (the levels' card) ── /fable32 ──
      if (tl33Step()) return st;   // ── fable32 (build 33) ── (the morning's lamb: its card, once — the day waits under it) ── /fable32 ──
      if (e35) {
        // ── fable32 (build 35) ── the morning of the work: no drain, no day clock and no night, no tamid timers, no "נפתח:" stamps, no
        // merchant, no lost lamb (the old loop's code stays behind the flag); the ממונה's tasks read off the work; the close on the work ── /fable32 ──
        if ((st.task35T += dt) >= E35.taskEvery) {
          st.task35T = 0;
          taskStep35();
        }
        close35Step();
      } else {
        drainStep(dt);
        dayStep(dt);
        unlockStep();
        merchantStep();
        lostTick(dt);
      }
    }
    if (c18 && !st.summary && !st.night && !prac) {
      chestStep(dt);
      padStep(dt);
    }
    if (g20) k20Step(dt);
    if (p23 && st.wake24 && !acting) {
      st.wake24 = 0;
      wake23();
    }
    if (p23) p23Step(dt);
    if (p25) p25Step(dt);
    if (p26) {
      r26Step(dt);
      HOUSE22.on = gate26() || !!st.r26;
      HOUSE22.gate = HOUSE22.on && open26();
    }
    if (p27) {   // ── fable32 (build 27) ── ── /fable32 ──
      r27Step(dt);
      WEST27.on = gate27() || on27();
    }
    SHARED.strong24 = !!(p23 && st.p23day === st.day && gateAny() && flowNext());
    if (g21) d21Step(dt);
    if (g22) m22Step(dt);
    if (b19 && !st.summary) ramp19Step(dt);
    {
      const h = heroP();
      if (Number.isFinite(st.px)) {
        const sp = Math.hypot(h.x - st.px, h.z - st.pz) / dt;
        if (sp > 8 && sp < 60 && powerOn) st.power = Math.max(0, st.power - DAY33.powerRun * dt);
      }
      st.px = h.x;
      st.pz = h.z;
    }
    if (tired() && !st.tiredSaid) {
      st.tiredSaid = true;
      if (!b17) stamp('עייפים — הבקיעה איטית. אכלו לחם', 'no');
    }
    if (!tired()) st.tiredSaid = false;
    SHARED.lambs33 = st.lambs;
    if (!st.lost) SHARED.lost33 = null;
    {
      const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : {};
      SHARED.moked33 = st.inMoked ? { x: DAY33.moked.x, z: DAY33.moked.z, rug: !!own.rug, lamp: !!own.lamp } : null;
    }
    if (!prac) badgeStep();   // ── fable32 (build 31) ── (no badges in a practice run) ── /fable32 ──
    if (st.day >= 33 && !st.ended33) {
      st.ended33 = true;
      fade(() => {
        stamp('33 ימי שירות — המשמר נגמר. השערים נפתחים עם שיר הלויים (המחשה)', 'combo');
        sfx('fanfare');
        L0('end33');
      }, '33 ימי שירות');
    }
    if (st.song && st.t >= st.song.until) {
      st.song = null;
      stamp('השיר נגמר — מחר שוב', 'info');
      L0('song-close');
    }
    if (e35) fire35Step();   // ── fable32 (build 35) ── (the fire's look: the morning's pyre, never a meter) ── /fable32 ──
    else
      try {
        globalThis.__FIRE33 = 0.25 + 0.75 * (st.fuel / 100) + 0.12 * (st.level - 1);
        if (b17) globalThis.__FIRELOW33 = Math.max(0, Math.min(1, (B17.warn - st.fuel) / 30));
      } catch (e) {}
    try {
      globalThis.__LOGS33 = st.logs;   // (build 14: the ramp act draws the basket with his logs)   // (the pyre's flames by the meter and the level — life.js)
    } catch (e) {}
    fxStep(dt);
    {
      const h = heroP(),
        moved = Number.isFinite(st.ix) && Math.hypot(h.x - st.ix, h.z - st.iz) > 0.3;
      st.ix = h.x;
      st.iz = h.z;
      st.idleT =
        moved || acting || st.night || st.lost || st.p25 || (st.r26 && st.r26.ph !== 'walk' && st.r26.ph !== 'out') || act27() ? 0 : (st.idleT || 0) + dt;
    }
    {
      const h = heroP(),
        a = Number.isFinite(st.sx) && Math.hypot(h.x - st.sx, h.z - st.sz) > 0.3;
      st.sx = h.x;
      st.sz = h.z;
      st.stuckT = a || acting || st.night || st.p25 || (st.r26 && st.r26.ph !== 'walk' && st.r26.ph !== 'out') || act27() ? 0 : st.stuckT + dt;
      if (st.stuckT >= 10) {
        st.stuckT = 0;
        evlog('stuck', { x: Math.round(h.x), z: Math.round(h.z), y: Math.round((h.y || 16) * 10) / 10, next: nx33().id, logs: st.logs });
      }
    }
    st.saveT += dt;
    if (st.saveT >= DAY33.saveEvery) {
      st.saveT = 0;
      saveState('tick');
    }
    camPyre();
    hotStep();
    hintStep();
    push();
    return st;
  }
  function camPyre() {
    const h = heroP();
    const on = st.phase === 'run' && !st.night && !acting && !(st.m22 && !carry22()) && atTop(h) && (st.logs > 0 || st.t - (st.laidT == null ? -99 : st.laidT) < 2.5);
    if (on) {
      if (!Number.isFinite(st.pyreAz)) {
        const dx = PYRE.x - h.x,
          dz = PYRE.z - h.z,
          a = Math.atan2(-dz, -dx),
          a1 = a + 1,
          a2 = a - 1;
        st.pyreAz = Math.sin(a1) > Math.sin(a2) ? a1 : a2;
      }
      SHARED.cam17 = { id: 'pyre', az: st.pyreAz, el: 0.42, d: 13, look: { x: (h.x + PYRE.x) / 2, z: (h.z + PYRE.z) / 2 } };
    } else {
      st.pyreAz = NaN;
      if (SHARED.cam17 && SHARED.cam17.id === 'pyre') SHARED.cam17 = null;
    }
  }
  function loop(ms) {
    if (!raf) return;
    const dt = lastMs ? (ms - lastMs) / 1e3 : 0;
    lastMs = ms;
    tick(dt);
    raf = requestAnimationFrame(loop);
  }
  function state() {
    return {
      t: Math.round(st.t * 100) / 100,
      phase: st.phase,
      day: st.day,
      night: st.night,
      left: Math.round(st.left),
      fuel: Math.round(st.fuel * 10) / 10,
      fed: st.fed,
      level: st.level,
      logs: st.logs,
      basket: st.basketMax,
      watched: st.watched,
      perutot: st.perutot,
      tasks: st.tasks.map((q) => [q.id, !!q.done]),
      merchant: !!st.merchant,
      lambsOk: okLambs(),
      lostLamb: st.lost ? { x: Math.round(st.lost.x), z: Math.round(st.lost.z), follow: !!st.lost.follow } : null,
      tamids: st.tamids,
      badges: Object.keys(st.badges),
      claimed: Object.keys(st.claimed),
      songs: st.songs,
      song: !!st.song,
      inMoked: st.inMoked,
      torchOn: st.torchOn,
      paused: !!st.paused,
      best: st.best,
      chops: st.chops,
      worms: st.worms,
      washed33: st.washed,
      power: Math.round(st.power),
      oil: st.oil,
      flour: st.flour,
      salt: st.salt,
      bread: st.bread,
      open: shown33(),
      acting: !!acting,
      next: nx33().id,
      resumed: st.resumed,
      bookNight: st.bookNight,
      atTop: atTop(heroP()),
      flowNext: nx33().id,
      carried: null,
      score: Math.round(st.fuel),
      rival: 0,
      rivalName: '',
      combo: 1,
      served: 0,
      lost: 0,
      count: 0,
      stars: 0,
      spawned: 0,
      lav31: true,
      washed: true,
      mode: 'day33',
      b17,
      tamD: st.tamD,
      tamE: st.tamE,
      summary: !!st.summary,
      step: (b17 && (step17() || {}).id) || null,
      streak: st.streak,
      rampBest: Math.round((st.rampBest || 0) * 10) / 10,
      laidDay: st.laidDay,
      low: Math.round(st.lowDay),
      v17: b17 ? Object.fromEntries(Object.entries(st.dayStats).filter(([arr]) => arr[0] === 'v')) : null,
      climbs: st.dayStats.climbs | 0,
      woodNow: b17 ? woodRush(tamid17()) : null,
      gate: gate20(),
      k20: st.k20 ? { ph: st.k20.ph, p: Math.round(st.k20.p * 100) / 100, L: st.k20.L, R: st.k20.R } : null,
      k20T: st.k20T || null,
      gate21: gate21(),
      d21: st.d21 ? st.d21.ph : null,
      d21r: st.d21r || null,
      gate22: gate22(),
      m22: st.m22 ? st.m22.ph : null,
      m22r: st.m22r || null,
      gate23: gate23(),
      p23: st.p23 ? st.p23.ph : null,
      lot: p23 && st.p23day === st.day ? st.lot : null,
      gate25: gate25(),
      p25: st.p25 ? st.p25.ph : null,
      p25r: st.p25r || null,
      gate26L: gate26L(),
      gate26: gate26(),
      role26: p26 && st.p26day === st.day ? st.role26 : null,
      r26: st.r26 ? st.r26.ph : null,
      r26r: st.r26r || null,
      open26: open26(),
      gate27: gate27(),   // ── fable32 (build 27) ── ── /fable32 ──
      r27: st.r27 ? st.r27.ph : null,
      prac31: prac ? prac.role : null,   // ── fable32 (build 31) ── ── /fable32 ──
      e35,   // ── fable32 (build 35) ── (the morning of the work: its close, the fire's look) ── /fable32 ──
      close35: st.close35 ? st.close35.ph : null,
      look35: e35 ? look35() : null,
    };
  }
  const E = {
    start() {
      ended = false;
      st.phase = 'run';
      st.t = 0;
      if (CAM && CAM.on) say(() => CAM.on());
      if (ST && ST.place) say(() => ST.place());
      try {
        globalThis.__SH_STOP = stopAt33;
      } catch (e) {}
      if (g22 && st.m22day !== st.day && st.m22c) {
        st.logs = Math.max(0, st.logs - st.m22c);
        st.m22c = 0;
      }
      if (p26 && S && S.hero && S.hero.twinPass) say(() => S.hero.twinPass((a, b) => houseFloor(a, b) || (p27 && (rings27(a, b) || westStrip27(a, b)))));   // ── fable32 (build 27) ── (the place of slaughter's floor: stages' 'lishka' footprint keeps it solid) ── /fable32 ──
      if (p23 && !st.washed) wake23();
      if (prac) place31();   // ── fable32 (build 31) ── (at his act's place: it begins at once) ── /fable32 ──
      if (prac) st.tasks = [];
      else if (st.resumeTasks) {
        // ── fable32 (build 35) ── (the saved day's own three, as they were set — the lots since may have changed what a new list would hold;
        // an older save's wood and ramp tasks give way to the day's three of the work) ── /fable32 ──
        const R = st.resumeTasks.filter((x) => Array.isArray(x));
        if (e35 && R.length && R.every(([x]) => TASKS35.some((q) => q.id === x))) st.tasks = R.map(([x, d]) => ({ ...TASKS35.find((q) => q.id === x), key: x, goal: 1, done: !!d }));
        else {
          newTasks();
          for (const [x, q] of R) {
            const a = st.tasks.find((q) => q.id === x);
            if (a && q) a.done = true;
          }
        }
        st.resumeTasks = null;
      } else newTasks();
      if (b17) {
        st.sDay0 = (SC && say(() => SC.get().total)) || 0;
        if (!st.resumed) st.pDay0 = st.perutot;
      }
      setSky(false);
      push();
      L0('start');
      evlog('day_start', { day: st.day, resumed: st.resumed });
      if (st.resumed) setTimeout(() => stamp(e35 ? `המשך יום ${st.day}` : `המשך יום ${st.day} — המערכה ברמה ${st.level}`, 'combo'), 1200);   // ── fable32 (build 35) ── (no fire's "level" in the morning of the work) ── /fable32 ──
      if (o.raf && typeof requestAnimationFrame === 'function') {
        lastMs = 0;
        raf = requestAnimationFrame(loop);
      }
      return E;
    },
    stop() {
      if (raf) {
        try {
          cancelAnimationFrame(raf);
        } catch (e) {}
        raf = 0;
      }
      if (st.phase === 'run' && st.t > 5) saveState('stop');
      ended = true;
      try {
        if (globalThis.__SH_STOP === stopAt33) delete globalThis.__SH_STOP;
      } catch (e) {}
      drive(0, 0);
      goal = null;
      if (o.walk && o.walk.stop) say(() => o.walk.stop());
      if (merchantPin) {
        say(() => merchantPin.close());
        merchantPin = null;
      }
      SHARED.merchant33 = null;
      SHARED.lambs33 = null;
      SHARED.lost33 = null;
      SHARED.moked33 = null;
      if (ST && ST.clear) say(() => ST.clear());
      if (CAM && CAM.off) say(() => CAM.off());
      setSky(false);
      try {
        delete globalThis.__FIRE33;
        delete globalThis.__FIRELOW33;
        delete globalThis.__FIRE35;   // ── fable32 (build 35) ── ── /fable32 ──
        if (fadeEl) {
          fadeEl.remove();
          fadeEl = null;
        }
      } catch (e) {}
      if (SHARED.cam17 && /^(pyre|ramp)$/.test(SHARED.cam17.id)) SHARED.cam17 = null;
      globalThis.__ARM19 = 0;
      st.k20 = null;
      st.d21 = null;
      st.m22 = null;
      st.p23 = null;
      st.p25 = null;
      SHARED.strong24 = false;
      st.r26 = null;
      st.r27 = null;
      HOUSE22.on = HOUSE22.gate = false;
      WEST27.on = false;
      if (p26 && S && S.hero && S.hero.twinPass) say(() => S.hero.twinPass(null));
    },
    state,
    tick,
    work,
    marks: () => [],
    flowNext,
    next31: () => nx33(),
    b17,
    night17,
    on17(a) {
      if (typeof a === 'function') subs17.push(a);
      return () => {
        const b = subs17.indexOf(a);
        if (b >= 0) subs17.splice(b, 1);
      };
    },
    step17,
    bar17,
    tap17,
    // ── fable32 (build 30) ── the act in progress (its one line), a word of feedback in it, the end's word, the day's ratings, the laver's record ── /fable32 ──
    act30,
    say30,
    word30: () => {
      const e = word30();
      return e ? { ...e } : null;
    },
    r30day: () => (Array.isArray(st.r30day) ? st.r30day.slice() : []),
    k20r: () => st.k20r || null,
    // ── fable32 (build 31) ── a practice run: its role (null in the day), its state (the end: its rating, once the card is up — done) ── /fable32 ──
    prac31: prac ? prac.role : null,
    p31: () => (prac ? { role: prac.role, seed: prac.seed, day: st.day, end: prac.end ? { ...prac.end } : null, done: prac.done ? { ...prac.done } : null } : null),
    // ── fable32 (build 31) ── the player's save, for the day summary's roles book (read-only there: no practice mid-day) ── /fable32 ──
    book31: () => save,
    // ── fable32 (build 32) ── the journal's unlock card (book32.js's createUnlock32): the card up now, its end; the save's persist (a page
    // opened mid-day is no longer "חדש") ── /fable32 ──
    j32card: () => (st.j32card ? { ...st.j32card } : null),
    // ── fable32 (build 36) ── the levels: the role he plays next or now and its level (the step card's chip), the act's own level and knobs
    // (the role modules read them), the levels' cards waiting ── /fable32 ──
    lv36now,
    lv36act,
    l36q: () => (Array.isArray(st.l36q) ? st.l36q.map((x) => ({ ...x })) : []),
    j32q: () => (st.j32q ? { ...st.j32q } : null),
    j32done,
    persist32: () => say(() => o.persist && o.persist()),
    // ── fable32 (build 33) ── "הטלה המבוקר": the morning's card (chamber33.js createTl33) and its end; today's lamb's tag (the colour's index —
    // the pen's lamb, the court's at its door, the shochet's at the ring draw it); the chamber's run (its day, outcome, places) ── /fable32 ──
    tl33card: () => (st.tl33card ? { ...st.tl33card } : null),
    tl33done,
    tl33tag: () => (!prac && st.tl33cd === st.day && Number.isFinite(st.tl33c) ? st.tl33c : null),
    ch33: () => (prac && prac.ch33 ? { ...prac.ch33, tags: prac.ch33.tags.slice(), blem: prac.ch33.blem ? { ...prac.ch33.blem } : null } : null),
    pl25,
    tamid17,
    nextDay,
    grace17,
    fire17,
    go17,
    // ── fable32 (build 35) ── the morning of the work: its flag, the close (its phase), the fire's look, the close's view, the pads in the court ── /fable32 ──
    e35,
    close35: () => (st.close35 ? { ...st.close35, look: look35() } : null),
    look35: () => (e35 ? look35() : null),
    workDone35: () => !!workDone35(),
    camWork35,
    pads18: () => pads18().slice(),
    tasks35: () => st.tasks.map((x) => ({ id: x.id, text: x.text, done: !!x.done })),
    focus17: () => ({
      e35,
      close35: st.close35 ? st.close35.ph : null,
      look: e35 ? look35() : null,
      tasks: e35 ? st.tasks.map((x) => ({ id: x.id, text: x.text, done: !!x.done })) : null,
      fuel: st.fuel,
      drain: e35 ? 0 : drainNow(),
      tamid: e35 ? null : tamid17(),
      power: st.power,
      bread: st.bread,
      bake: open33('bake'),
      step: step17(),
      bar: bar17(),
      grace: grace17(),
      streak: st.streak,
      hot: st.hot17 || null,
      summary: st.summary,
      day: st.day,
      phase: st.phase,
      night: st.night,
      acting: acting ? acting.id : null,
      level: st.level,
      lambs: okLambs(),
      logs: st.logs,
      basket: st.basketMax,
      score: SC ? say(() => SC.get()) : null,
      perutot: st.perutot,
      c18: l18
        ? { coins: c18, ch: st.ch18, pad: st.pad18, pads: pads18(), own: pads18().map((x) => own18(x.id)), tams: e35 ? 0 : (st.tamD === 'ok') + (st.tamE === 'ok') }   // ── fable32 (build 35) ── (pads: the court's live pads) ── /fable32 ──
        : null,
      gate: gateAny(),
    }),
    c18,
    l18,
    b19,
    gh19: () => save.gh19,
    g20,
    gate20,
    camWork20,
    k20: () => st.k20,
    k20in(a, b) {
      const k20 = st.k20;
      return !k20 || (a !== 'L' && a !== 'R') ? false : ((k20[a] = !!b), true);
    },
    k20bal,   // ── fable32 (build 36) ── (the laver's level 4: the thumbs' heights level the stream) ── /fable32 ──
    g21,
    gate21,
    d21: () => st.d21,
    d21swipe,
    d21bal,
    d21stick,
    d21tap,
    camWork21,
    d21r: () => st.d21r || null,
    g22,
    gate22,
    m22: () => st.m22,
    m22swipe,
    m22place,
    m22stick,
    m22put,
    m22tap,
    band22,
    gap24,
    camWork22,
    m22r: () => st.m22r || null,
    p26on: p26,
    gate26L,
    gate26,
    open26,
    role26: () => (p26 && st.p26day === st.day ? st.role26 : null),
    r26: () => st.r26,
    r26swipe,
    r26hold,
    r26pull,
    r26tap,
    r26light,
    r26bal,   // ── fable32 (build 36) ── (the inner altar's level 4: the teni held level) ── /fable32 ──
    camWork26,
    r26r: () => st.r26r || null,
    g26t: () => (open26() ? st.g26t : null),
    men5t: () => (open26() && Number.isFinite(st.men5t) ? st.men5t : null),
    roles26: () => roles26(),
    // ── fable32 (build 27) ── the blood roles (dam27.js; tests) ── /fable32 ──
    p27on: p27,
    gate27,
    r27: () => st.r27,
    r27bind,
    r27tap,
    r27move,
    r27swirl,
    r27throw,
    r27swipe,
    camWork27,
    p25on: p25,
    gate25,
    p25: () => st.p25,
    p25focus,
    p25tap,
    p25swipe,
    p25stamp,
    camWork25,
    p25r: () => st.p25r || null,
    npc25: () => p25 && st.npc25 === st.day,
    p23on: p23,
    gate23,
    p23: () => st.p23,
    p23pick,
    p23raise: () => p23raise(),
    lot23: () => (p23 && st.p23day === st.day ? st.lot : null),
    npc23: () => (p23 && st.p23day === st.day && st.npc23) || null,
    roles23: () => roles23(),
    first21,
    first22,
    camWork23,
    seat23,
    circ23,
    // ── fable32 (build 14) ── what he carries and holds (flow31 draws it on him): the axe within reach of the wood (or chopping), the back-basket with his logs; the flights
    gear: () => {
      const h = heroP(),
        w = st.phase === 'run' && !st.night ? say(() => work(h)) : null;
      return {
        axe: !!((w && w.near31 && w.id31 === 'wood') || (acting && acting.id === 'wood')),
        logs: st.logs,
        basketMax: st.basketMax,
        acting: acting ? acting.id : null,
        carrying: st.logs > 0,
        sw: b19 && st.r19.sw,
      };
    },
    fx33: () => st.fx,
    pyre33: () => {
      const n =
          st.phase === 'run' && !(st.m22 && /^(stack|ready|ignite|end)/.test(st.m22.ph)) && !(p23 && st.p23day === st.day && st.npc23 === 'm22')
            ? stackN()
            : 0,
        slots = [];
      for (let i = 0; i < n; i++) slots.push(stackSlot(i));
      return { n, fuel: st.fuel, slots };
    },
    // ── /fable32 ──
    playGame,
    offerPlay,
    pause(on) {
      st.paused = !!on;
      if (st.paused) {
        drive(0, 0);
        let26();
      }
      return st.paused;
    },
    tapStation,
    tapPilgrim: () => false,
    tapGate: () => false,
    take: () => false,
    leave: () => {},
    runAt,
    st33: st,
    shown33: () => (prac && prac.ch33 ? [] : e35 ? [] : shown33()),   // ── fable32 (build 33) ── (the chamber's run: no chip of the azara's stations) ── /fable32 ── ── fable32 (build 35) ── (the morning of the work: no station chip — the salt chamber's bag is offered at its door, its chip said the old timing act's "קחו מלח — בזמן" and lay under the acts' pads) ── /fable32 ──
    onEnd(cb) {
      if (typeof cb === 'function') ends.push(cb);
      return E;
    },
    get level() {
      return { n: 1, count: 0 };
    },
    debug: {
      log: () => log.slice(),
      feed,
      skip: (s) => {
        for (let i = 0; i < Math.round(s * 10); i++) tick(0.1);
        return state();
      },
      setFuel: (v) => {
        st.fuel = v;
      },
      logs: (n) => {
        st.logs = n;
      },
      night: () => {
        st.left = 0;
        if (e35 && !st.summary && st.phase === 'run' && !prac) endDay17();   // ── fable32 (build 35) ── (no clock: the morning's end at once — the tools' "to the summary") ── /fable32 ──
      },
      fed: (n) => {
        st.fed = n;
        st.level = levelFor(n);
      },
      power: (v) => {
        st.power = v;
      },
      bread: (n) => {
        st.bread = n;
      },
      lose: () => {
        st.lostDay = 0;
        st.lost = { x: -30, z: 30, yaw: 0, t: 0, follow: false };
      },
      lambOk: (n) => {
        st.lambs.forEach((q, i) => {
          q.ok = i < n;
        });
      },
      merchant: () => {
        st.merchantSeen = 0;
        st.day = Math.max(st.day, DAY33.merchantDay);
        merchantStep();
      },
      trade,
      perutot: () => st.perutot,
      song: () => {
        st.song = { until: st.t + DAY33.songS };
      },
      claim: claimBook,
      day: (n) => {
        st.day = n;
      },
      lostSpot: lostStep,
      saveState,
      atTop: () => atTop(heroP()),
      wash20: () => {
        st.washed = true;
        st.k20 = null;
      },
      skip21: () => {
        st.d21 = null;
        st.d21day = st.day;
      },
      skip22: () => {
        st.m22 = null;
        st.m22day = st.day;
      },
      skip23: (a = 'deshen') => {
        st.p23 = null;
        st.p23day = st.day;
        st.lot = a;
        st.npc23 = a === 'm22' ? 'deshen' : 'm22';
        if (a === 'm22' || a === 'lamb') st.d21day = st.day;
      },
      skip25: () => {
        st.p25 = null;
        st.p25day = st.day;
        st.m22day = st.day;
      },
      skip26: (a = 'menorah') => {
        st.p23 = null;
        st.p26day = st.day;
        st.role26 = a;
        st.l26t = st.t;   // ── fable32 (build 27) ── ── /fable32 ──
      },
      done26: () => {
        st.r26 = null;
        st.p26day = st.day;
        st.r26day = st.day;
        st.g26day = st.day;
      },
    },
  };
  return E;
}
