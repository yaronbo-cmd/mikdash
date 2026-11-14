/* ── build 128 ── h128/model.js — stage 06 "שער ניקנור וחמש עשרה המעלות" (spec docs/specs/shlav-06-he.md, approved 14.11; brief
 * docs/specs/build128-brief.md §2, §4–§8). Pure: no three.js, no DOM. The acts, the world, the bot and the tests share every rule here.
 *
 *   H128                    the constants (rope bands, the hand's gain, gravity in amot, the sea's waves)
 *   LINES                   the stage's sourced lines (constants the brief's author can correct)
 *   SEA_LV · CAP · RING_LV · BOLT_LV · LEAF   the level tables
 *   seaAt(x, z, t, o)       the sea's surface (Gerstner waves + the play's single swells): { y, nx, nz } — the SAME sum the sea's
 *                           vertex shader evaluates (h128/sea3d.js reads WAVES and swellShape from here)
 *   seaFresh/seaStep        station 1, segments 1–2: the four lashing ropes through the swells (the rope is the gauge)
 *   holdFresh/holdStep      station 1, segment 2's hold: both thumbs on the second door's rings through three swells
 *   akkoFresh/akkoStep      station 1, segment 3: the hook, the hoist, the landing
 *   capFresh/capStep        station 2: the capstan, the sledge, the wedge, the crew's fatigue
 *   ringPlan · rowFit · rowSolutions · keyFresh/keyStep · tplLight · stoneSound    station 3: the template, the row, the closing stone
 *   boltFresh/boltStep · pairFresh/pairStep                                         station 4: the wickets' bolts
 *   leafFresh/leafStep      the closing of the gate: two leaves, twenty men
 *   *Pts(r)                 each work's points: 40 clean, 20 no damage, 10 otherwise (any damage caps at 10)
 *   createH128(save)        the free-choice face of the director (as h120's): plan, open, pick, done, free rings, the save
 *
 * Units: amot, seconds, degrees where named. Nothing random at play time: every table is fixed or a seeded function of its address.
 */
import { BOOK, ringOf } from '../world/grid.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const S6 = BOOK.s06;

/* ───────── the constants ───────── */
export const H128 = Object.freeze({
  G: 20.4,                         // gravity in amot/s² (9.81 m/s², an amah 0.48 m)
  BAND: Object.freeze({ slack: 0.30, quiet: 0.70, sings: 0.90 }), T_MAX: 1.2,
  GAIN: 0.5 / 120,                 // the hand: tension per px of drag (0.5 per 120 px)
  LAG: 0.12,                       // the rope follows the hand with this lag (s)
  FRAY_S: 3,                       // seconds in the frays band before a strand parts (a worn rope: before it tears)
  RING_LIM: 1.0, WORN_LIM: 0.8,    // a loaded rope past this pulls its ring out of the deck
  SNATCH: 0.25,                    // a slack rope's load when the door slides and snatches
  STRETCH: 0.04,                   // a rope eases this much after it took a load (the wet rope gives)
  BACK: 1.0,                       // the back roll comes this long after the crest (s)
  CREST_W: 0.45,                   // the load's bell in time (s)
  LOSS: 20, LOSS_DENT: 40,
});
export const ROPES = Object.freeze(['portFore', 'portAft', 'stbdFore', 'stbdAft']);
export const HEADS = Object.freeze(['port', 'stbd', 'bow', 'stern']);
/** which ropes take the crest's load (+D) and which the back roll's (+D/2): the deck tips away from the swell */
export function lowRopes(head) {
  switch (head) {
    case 'port': return { crest: ['stbdFore', 'stbdAft'], back: ['portFore', 'portAft'] };
    case 'stbd': return { crest: ['portFore', 'portAft'], back: ['stbdFore', 'stbdAft'] };
    case 'bow': return { crest: ['portAft', 'stbdAft'], back: ['portFore', 'stbdFore'] };
    default: return { crest: ['portFore', 'stbdFore'], back: ['portAft', 'stbdAft'] };   // stern
  }
}
/** the rope of the same door (fore ↔ aft) */
export const partnerOf = (id) => (id.endsWith('Fore') ? id.replace('Fore', 'Aft') : id.replace('Aft', 'Fore'));
export const bandOf = (t) => (t < H128.BAND.slack ? 'slack' : t <= H128.BAND.quiet ? 'quiet' : t <= H128.BAND.sings ? 'sings' : 'frays');

/* ───────── the lines (rule 11: every claim with its source; brief §12 — the strings it has not checked letter by letter are marked) ───────── */
export const LINES = Object.freeze({
  open: 'כשהלך ניקנור להביא דלתות מאלכסנדריא של מצרים (יומא לח ע"א)',
  throw: 'נטלו אחת מהן והטילוה לים (יומא לח ע"א)',
  hold: 'הטילוני עמה',
  holdPic: 'עמד הוא וכרכה',
  calm: 'מיד נח הים מזעפו (יומא לח ע"א)',
  sorry: 'והיה מצטער על חברתה (יומא לח ע"א)',
  akko: 'כיון שהגיע לנמלה של עכו, היתה מבצבצת ויוצאה מתחת דופני הספינה (יומא לח ע"א)',
  steps: 'מוקפות כחצי גורן עגולה (מידות ב, ה)',
  wickets: 'שני פשפשים היו לו (מידות ב, ו)',
  twenty: 'שער של נחושת שעשרים איש סגרוהו בקושי (יוסף בן מתתיהו, מלחמת היהודים ו, 293; זיהויו עם שער ניקנור אינו ודאי)',
  levites: 'ועליהן הלויים אומרים בשיר (מידות ב, ה)',
  stage: 'שער ניקנור עומד בלי דלתות. הדלתות בדרך מאלכסנדריא',
  capWalk: 'הדלת על המזחלת: מעלים אותה אל הסף',
});
/** the quick words (rule 64) */
export const QUICK = Object.freeze({ rope: 'החבל שר!', hook: 'נתפס!', soft: 'נחיתה רכה!', quiet: 'חבל שקט!', wedge: 'טריז!', noLight: 'בלי קו אור!', bull: 'בול!', closed: 'נסגר!', locked: 'ננעל!', together: 'יחד!' });
/** the loss table (brief §11): label and points */
export const LOSS = Object.freeze({
  'sea.torn': ['חבל עיגון נקרע', 20], 'sea.ring': ['טבעת נעקרה מהסיפון', 20], 'cap.timber': ['המזחלת החליקה לאחור', 20],
  'ring.crack': ['אבן מעלה נסדקה', 20], 'ring.corner': ['אבן הסגירה נתקעה ונשברה בה פינה', 20], 'bolt.tooth': ['שן של בריח התעקמה', 20],
  'close.dent': ['כנף השער נחבטה', 40],
});

/* ───────── grades (the one system: 40 / 20 / 10; any damage caps the work at 10) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
const grade = (dmg, clean, ok = true) => ((dmg | 0) > 0 ? 10 : clean ? 40 : ok ? 20 : 10);

/* ═════════════════ the sea ═════════════════ */
/* The waves of the sea itself (a sum of four Gerstner waves) — in the ship's world frame (x the ship's way, z to starboard). The
 * storm `k` (0 calm … 1 storm) scales each wave's height between its calm and storm value. L wavelength, A (calm, storm) height, Q
 * steepness (0..1), dir in degrees from +x. The shader reads this very table. */
export const WAVES = Object.freeze([
  Object.freeze({ L: 150, A: [0.55, 2.3], Q: 0.55, dir: 28 }),
  Object.freeze({ L: 88, A: [0.32, 1.35], Q: 0.6, dir: -19 }),
  Object.freeze({ L: 46, A: [0.14, 0.62], Q: 0.7, dir: 71 }),
  Object.freeze({ L: 23, A: [0.06, 0.26], Q: 0.75, dir: -55 }),
]);
/** a swell of the play: from `head` (port, stbd, bow, stern), crest at the ship (x 0, z 0) at t0, height H, width w, speed c */
export const SWELL = Object.freeze({ H: 4.2, w: 14, c: 11 });
const HEAD_DIR = { port: [0, 1], stbd: [0, -1], bow: [-1, 0], stern: [1, 0] };   // the way it travels (from port it runs to starboard)
export const headDir = (head) => HEAD_DIR[head] || HEAD_DIR.port;
/** the swell's height shape at signed distance u (amot, + ahead of the crest) — a long dark back (u < 0) and a steeper front */
export function swellShape(u, H = SWELL.H, w = SWELL.w) {
  const k = u < 0 ? w * 1.6 : w * 0.7, v = u / k;
  return H / Math.cosh(v) ** 2;
}
/** where a swell's crest is along its way at time t: its distance past the ship (negative before it comes) */
export const swellPos = (sw, t) => (t - sw.t0) * (sw.c || SWELL.c);
function gerst(px, pz, t, k, out) {
  let dx = 0, dz = 0, y = 0, sx = 0, sz = 0;
  for (const W of WAVES) {
    const kk = TAU / W.L, w = Math.sqrt(H128.G * kk), a = W.dir * DEG, ux = Math.cos(a), uz = Math.sin(a);
    const A = W.A[0] + (W.A[1] - W.A[0]) * k, th = kk * (ux * px + uz * pz) - w * t, c = Math.cos(th), s = Math.sin(th);
    const q = W.Q / (kk * A * WAVES.length + 1e-9) * A * kk;   // (Q per wave, normalised so the sum never loops)
    dx += q * ux * A * c; dz += q * uz * A * c; y += A * s;
    sx += A * kk * ux * c; sz += A * kk * uz * c;   // slope dy/dx, dy/dz (of the undisplaced field: enough for the ship and the light)
  }
  out.dx = dx; out.dz = dz; out.y = y; out.sx = sx; out.sz = sz; return out;
}
const _g = {};
/**
 * the sea's surface at (x, z) at time t: { y, nx, nz, steep } — o.k the storm (0..1), o.swells [{ head, t0, H, w, c }] in the ship's
 * frame, o.ship [x, z] the ship's place in the sea's frame (the swells travel with it). Two fixed-point steps invert the Gerstner
 * displacement, so the ship, the doors and the camera sit on the same water the shader draws.
 */
export function seaAt(x, z, t, o = {}) {
  const k = clamp(+o.k || 0, 0, 1);
  let px = x, pz = z;
  for (let it = 0; it < 2; it++) { gerst(px, pz, t, k, _g); px = x - _g.dx; pz = z - _g.dz; }
  gerst(px, pz, t, k, _g);
  let y = _g.y, sx = _g.sx, sz = _g.sz;
  const sh = o.ship || [0, 0];
  for (const sw of o.swells || []) {
    const d = headDir(sw.head), u = (x - sh[0]) * d[0] + (z - sh[1]) * d[1] - swellPos(sw, t), H = sw.H || SWELL.H, w = sw.w || SWELL.w;
    const h = swellShape(u, H, w), e = 0.05, g = (swellShape(u + e, H, w) - swellShape(u - e, H, w)) / (2 * e);
    y += h; sx += g * d[0]; sz += g * d[1];
  }
  const L = Math.hypot(sx, 1, sz);
  return { y, nx: -sx / L, nz: -sz / L, steep: Math.hypot(sx, sz) };
}

/* ── station 1, segments 1 and 2: the ropes through the swells ── */
export const SEA_LV = Object.freeze({
  sea1: Object.freeze({ D: 0.30, heads: ['port', 'bow', 'stbd', 'stern'], gap: 12, first: 14, drift: 0.012, worn: null, sky: [0, 1] }),
  sea2: Object.freeze({ D: 0.40, heads: ['stbd', 'port', 'bow'], gap: 10, first: 12, drift: 0.016, worn: 'portAft', sky: [1, 1] }),
});
/** the worn rope shares its load with its partner (the same door's other rope) when the partner is set in the upper quiet band and not
 *  loaded itself in that roll: each then takes half (brief §4, sea2: "its load must be shared") */
export const SHARE = 0.6;
export function seaFresh(id = 'sea1') {
  const L = SEA_LV[id], r = {};
  for (const k of ROPES) r[k] = { t: 0.45, tgt: 0.45, worn: L.worn === k ? 1 : 0, knot: 0, torn: 0, ring: 0, fray: 0, load: 0, eff: 0.45 };
  return {
    id, t: 0, ropes: r, sw: L.heads.map((head, i) => ({ head, t0: L.first + i * L.gap, crest: 0, back: 0, clean: 1, slide: 0 })),
    dmg: 0, flags: { 'sea.torn': 0, 'sea.ring': 0 }, ev: [], done: 0, frays: 0, quick: 0,
  };
}
const bell = (x) => Math.exp(-(x * x));
/**
 * one step of the ropes (dt s). inp: { rope: id | null (the rope under the finger), dy: px of drag this step (+ toward the player =
 * haul, − pays out) }. Returns the state; s.ev collects this step's events: { e: 'crest'|'back'|'snatch'|'ring'|'strand'|'torn'|
 * 'clean'|'sing', rope?, sw? } for the act's sound and words.
 */
export function seaStep(s, inp = {}, dt = 1 / 60) {
  const L = SEA_LV[s.id]; s.ev = [];
  if (s.done) return s;
  const t0 = s.t, t1 = s.t + dt; s.t = t1;
  const R = s.ropes, a = 1 - Math.exp(-dt / H128.LAG);
  for (const k of ROPES) {
    const r = R[k];
    if (inp.rope === k && Number.isFinite(inp.dy)) r.tgt = clamp(r.tgt + inp.dy * H128.GAIN, 0, H128.T_MAX);
    r.tgt = Math.max(0, r.tgt - L.drift * dt);
    r.t += (r.tgt - r.t) * a; r.t = clamp(r.t, 0, H128.T_MAX);
    r.load = 0;
  }
  // the swells: the load's bell on the low ropes at the crest and on the others at the back roll; the judgement at each peak
  for (const w of s.sw) {
    const { crest, back } = lowRopes(w.head);
    for (const [ids, tc, D, key] of [[crest, w.t0, L.D, 'crest'], [back, w.t0 + H128.BACK, L.D / 2, 'back']]) {
      const ph = (s.t - tc) / H128.CREST_W;
      if (ph > -3 && ph < 3) { for (const k of ids) R[k].load += loadOn(s, w, k, ids, D) * bell(ph); for (const [k, d] of Object.entries(sharesOf(s, ids, D))) R[k].load += d * bell(ph); }
      if (t0 < tc && t1 >= tc && !w[key]) { w[key] = 1; judge(s, w, ids, D, key); }
    }
    if (w.back && !w.judged) { w.judged = 1; s.ev.push({ e: w.clean ? 'clean' : 'rough', sw: w }); if (w.clean) s.ev.push({ e: 'sing', sw: w }); }
  }
  // the frays band (the rope's own tension and its load now): a strand parts after 3 s in a row, a worn rope tears
  for (const k of ROPES) {
    const r = R[k]; r.eff = r.t + r.load;
    if (r.eff > H128.BAND.sings) { r.fray += dt; s.frays = 1; } else r.fray = 0;
    if (r.fray >= H128.FRAY_S) {
      r.fray = 0;
      if (!r.worn) { r.worn = 1; s.ev.push({ e: 'strand', rope: k }); }
      else { r.torn++; r.knot = 1; s.dmg++; s.flags['sea.torn']++; r.t = r.tgt = 0.5; s.ev.push({ e: 'torn', rope: k }); }
    }
  }
  const last = s.sw[s.sw.length - 1];
  if (last.judged && s.t >= last.t0 + H128.BACK + 1.5) s.done = 1;
  return s;
}
function loadOn(s, w, k, ids, D) {
  const r = s.ropes[k];
  let d = r.t < H128.BAND.slack ? D + H128.SNATCH : D;
  const p = s.ropes[partnerOf(k)];
  if (r.worn && !ids.includes(partnerOf(k)) && p.t >= SHARE) d /= 2;
  return d;
}
/** the ropes not loaded in this roll that take a share: the partner of a loaded worn rope, set high (D / 2) */
function sharesOf(s, ids, D) { const o = {}; for (const k of ids) { const r = s.ropes[k], p = partnerOf(k); if (r.worn && !ids.includes(p) && s.ropes[p].t >= SHARE) o[p] = D / 2; } return o; }
function judge(s, w, ids, D, key) {
  s.ev.push({ e: key, sw: w });
  const sh = sharesOf(s, ids, D);
  for (const k of [...ids, ...Object.keys(sh)]) {
    const r = s.ropes[k], share = !ids.includes(k), slack = !share && r.t < H128.BAND.slack, load = share ? sh[k] : loadOn(s, w, k, ids, D), eff = r.t + load;
    if (slack) { w.clean = 0; w.slide = 1; s.ev.push({ e: 'snatch', rope: k, sw: w }); }
    const lim = r.worn ? H128.WORN_LIM : H128.RING_LIM;
    if (eff > lim) {
      w.clean = 0; r.ring++; r.knot = 1; s.dmg++; s.flags['sea.ring']++; r.t = r.tgt = 0.5;
      s.ev.push({ e: 'ring', rope: k, sw: w });
    } else if (eff > (r.worn ? H128.WORN_LIM : H128.BAND.sings)) w.clean = 0;
    r.tgt = Math.max(0, r.tgt - H128.STRETCH); r.t = Math.max(0, r.t - H128.STRETCH);
  }
}
/** sea1, sea2's swells' points: 40 every swell clean and no damage; 20 no damage; 10 otherwise */
export function seaPts(s) { return grade(s.dmg, s.sw.every((w) => w.clean)); }

/* ── station 1, segment 2: the hold. Both thumbs on the second door's two rings through three swells; each swell slips one hand
 *    (fixed per swell) off its ring during 1.2 s; that thumb must lift and take the ring again before the next swell. A swell that
 *    finds a hand off does not count and comes again. Mouse: the sailor holds the other ring; the slipping hand is the pointer's. ── */
export const HOLD = Object.freeze({ N: 3, P: 5.5, SLIP: 1.2, FIRST: 2.5, order: Object.freeze(['L', 'R', 'L', 'R', 'L', 'R']) });
export function holdFresh(opt = {}) { return { t: 0, on: { L: 0, R: 0 }, prev: { L: 0, R: 0 }, slip: { L: 0, R: 0 }, off: { L: 0, R: 0 }, held: 0, swells: 0, next: null, started: 0, done: 0, mouse: !!opt.mouse, ev: [] }; }
/** inp: { L: bool (the left thumb on its ring), R: bool } — with opt mouse, R is the sailor's and always held, the slipping hand L */
export function holdStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  for (const h of ['L', 'R']) {
    const want = s.mouse && h === 'R' ? true : !!inp[h], edge = want && !s.prev[h];
    s.prev[h] = want;
    if (s.slip[h] > 0) { s.slip[h] -= dt; if (s.slip[h] <= 0) { s.slip[h] = 0; s.on[h] = 0; s.off[h] = 1; s.ev.push({ e: 'off', hand: h }); } continue; }
    if (s.off[h]) { if (edge) { s.off[h] = 0; s.on[h] = 1; s.ev.push({ e: 'grip', hand: h }); } continue; }
    if (want && !s.on[h]) { s.on[h] = 1; s.ev.push({ e: 'grip', hand: h }); } else if (!want && s.on[h]) { s.on[h] = 0; s.off[h] = 1; }
  }
  if (!s.started) { if (s.on.L && s.on.R) { s.started = 1; s.next = s.t + HOLD.FIRST; s.ev.push({ e: 'line' }); } return s; }
  if (s.t >= s.next) {
    const counts = s.on.L && s.on.R && !s.slip.L && !s.slip.R;
    if (counts) s.held++;
    s.swells++;
    s.ev.push({ e: counts ? 'held' : 'again' });
    if (s.held >= HOLD.N) { s.done = 1; s.ev.push({ e: 'calm' }); return s; }
    const hand = s.mouse ? 'L' : HOLD.order[s.held % HOLD.order.length];
    if (s.on[hand]) s.slip[hand] = HOLD.SLIP;
    s.next = s.t + HOLD.P;
  }
  return s;
}

/* ── station 1, segment 3: Akko. The hook (the ring above the water 1.2 s in every 3 s; the hook takes within 0.4 of it), the
 *    hoist (a pendulum: a haul while it swings toward the quay calms it, a haul while it swings back feeds it; past 25° the derrick's
 *    crew stops until it is under 15°), the landing (touchdown ≤ 0.5 amot/s is soft). The door's lag on the rope (0.8 s) is the
 *    leaves' (LEAF) on purpose. ── */
export const AKKO = Object.freeze({ PER: 3, UP: 1.2, RING_A: 0.5, HOOK_R: 0.4, LEN: 9, LIFT: 6, TH0: -10, K_CALM: 0.9, K_FEED: 0.22, STOP: 25, GO: 15, CLEAN: 15, DAMP: 0.03, HOLD_DAMP: 0.6, SLEW: 3, DROP: 3, TAU: 0.8, SOFT: 0.5, HMAX: 1.5 });
/** the door's ring over the water at time t (amot, + above): above for UP s of every PER s */
export function ringY(t) { const ph = (((t % AKKO.PER) + AKKO.PER) % AKKO.PER) / AKKO.PER, c0 = Math.cos(Math.PI * AKKO.UP / AKKO.PER); return AKKO.RING_A * (Math.cos(TAU * ph) - c0) / (1 - c0) * 1; }
export function akkoFresh() { return { t: 0, phase: 'hook', tries: 0, inR: 0, th: AKKO.TH0 * DEG, w: 0, lift: 0, first: 0, maxSw: 0, stop: 0, slew: 0, y: AKKO.DROP, v: 0, land: null, done: 0, ev: [] }; }
/**
 * inp: hook phase { hx, hy } the hook's place relative to the ring's rest (amot: x along the side, y up); hoist { haul } (amot/s of
 * rope hauled, ≥ 0); land { ease } (amot/s paid out, ≥ 0). Events: miss, hook, stop, go, slew, touch { soft, v }.
 */
export function akkoStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  if (s.phase === 'hook') {
    const ry = ringY(s.t), hx = +inp.hx || 0, hy = Number.isFinite(inp.hy) ? inp.hy : 9;
    const near = Math.hypot(hx, hy - ry) <= AKKO.HOOK_R;
    if (near && !s.inR) { s.tries++; if (ry > 0) { s.phase = 'hoist'; s.ev.push({ e: 'hook', first: s.tries === 1 }); } else s.ev.push({ e: 'miss' }); }
    s.inR = near ? 1 : 0;
    return s;
  }
  if (s.phase === 'hoist') {
    let h = clamp(+inp.haul || 0, 0, AKKO.HMAX);
    const deg = Math.abs(s.th) / DEG;
    if (!s.stop && deg > AKKO.STOP) { s.stop = 1; s.ev.push({ e: 'stop' }); }
    if (s.stop && deg < AKKO.GO && Math.abs(s.w) < 0.25) { s.stop = 0; s.ev.push({ e: 'go' }); }
    if (s.stop) h = 0;
    if (h > 0 && !s.first) s.first = 1;
    const w0 = Math.sqrt(H128.G / AKKO.LEN);
    let acc = -w0 * w0 * Math.sin(s.th) - (s.stop ? AKKO.HOLD_DAMP : AKKO.DAMP) * s.w;
    s.w += acc * dt;
    if (h > 0) { if (s.w > 0) s.w *= Math.exp(-AKKO.K_CALM * h * dt); else s.w -= AKKO.K_FEED * h * dt; }
    s.th += s.w * dt;
    s.lift = Math.min(AKKO.LIFT, s.lift + h * dt);
    if (s.first) s.maxSw = Math.max(s.maxSw, Math.abs(s.th) / DEG);
    if (s.lift >= AKKO.LIFT && Math.abs(s.th) / DEG <= AKKO.GO) { s.phase = 'slew'; s.slew = 0; s.ev.push({ e: 'slew' }); }
    return s;
  }
  if (s.phase === 'slew') {
    s.slew += dt; s.th *= Math.exp(-2 * dt); s.w *= Math.exp(-2 * dt);
    if (s.slew >= AKKO.SLEW) { s.phase = 'land'; s.th = 0; s.w = 0; }
    return s;
  }
  // the landing: the door's speed follows the rope paid out, late (its weight); no rope paid, the brake holds
  const e = clamp(+inp.ease || 0, 0, 3);
  s.v += (e - s.v) * (1 - Math.exp(-dt / AKKO.TAU));
  s.y -= s.v * dt;
  if (s.y <= 0) { s.y = 0; s.land = { v: +s.v.toFixed(3), soft: s.v <= AKKO.SOFT }; s.done = 1; s.ev.push({ e: 'touch', ...s.land }); }
  return s;
}
/** 40: the hook at the first try, the swing never past 15° after the first haul, a soft landing; else 20 (no damage here) */
export function akkoPts(s) { return s.tries === 1 && s.maxSw <= AKKO.CLEAN && s.land && s.land.soft ? 40 : 20; }

/* ═════════════════ station 2: the capstan ═════════════════ */
const RMP = S6.ramp;
export const CAP = Object.freeze({
  TURN: 3.2,                        // amot of rope per turn of the capstan
  TAU_V: 0.8,                       // the sledge follows the rope late and heavy
  TAU_S: 1.2,                       // the rope's stretch relaxes
  SPEED: 0.5,                       // the tension's share of the sledge's speed (s)
  BASE: 0.30, SLOPE: 0.05, ROUGH: 0.13,   // the tension at rest: the floor, the slope's share, a rough timber's
  K: 0.35, K_ROUGH: 0.25,           // the tension per amah of stretch and of speed's share
  WEAR: Object.freeze({ sings: 0.08, frays: 0.35 }), SPLICE: 1 / 3,
  FAT: 0.046,                       // fatigue per second of hauling per unit tension (a clean climb's no-rest total about 2.2)
  HOLD_X: 3,                        // holding a loaded rope with no wedge tires three times faster
  REST: 0.2,                        // fatigue falls this much a second on a wedge (full rest in 5 s)
  GRACE: 4,                         // at full fatigue they hold this long; then they let it down to the last wedge
  DOWN: 0.6, RUN: 3,                // braked down; running back when a strand parts
  WEDGE_V: 0.15, WEDGE_D: 0.5,      // the wedge drops only this slow and this near a notch (amot/s, amot)
  L: RMP.sledge.L, TAIL0: RMP.sledge.tail,
});
/** the sledge's climb d (amot its tail has come from the start) ↔ the tail's world x */
export const tailX = (d) => CAP.TAIL0 - d;
export const NOTCH_D = Object.freeze(RMP.notch.map((x) => CAP.TAIL0 - x));
export const CAP_END = NOTCH_D[NOTCH_D.length - 1];
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
/** the share of the sledge on the slope (0..1) and on a rough timber (the sledge's middle third over it: 0..1) */
export function rampAt(d) {
  const t = tailX(d), h = t - CAP.L;
  const slope = overlap(h, t, RMP.sill[0], RMP.low[0]) / CAP.L;
  const m0 = t - CAP.L * 2 / 3, m1 = t - CAP.L / 3;
  let rough = 0; for (const [a, b] of RMP.rough) rough = Math.max(rough, overlap(m0, m1, a, b) / Math.min(b - a, m1 - m0));
  return { slope, rough: clamp(rough, 0, 1) };
}
export const capBase = (d) => { const r = rampAt(d); return CAP.BASE + CAP.SLOPE * r.slope + CAP.ROUGH * r.rough; };
export const capK = (d) => CAP.K + CAP.K_ROUGH * rampAt(d).rough;
export function capFresh() { return { t: 0, d: 0, v: 0, u: 0, s: 0, ten: CAP.BASE, wear: 0, F: 0, wedge: -1, lastWedge: -1, rests: [], spent: 0, grace: 0, mode: 'haul', runs: 0, backs: 0, timber: [], frayed: 0, dmg: 0, quietRun: 1, segFrom: 0, done: 0, ev: [] }; }
/** inp: { turn (turns/s of the finger round the drum, the hauling way +; the other way does nothing), tap (the wedge man tapped) } */
export function capStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  const loaded = rampAt(s.d).slope > 0;
  // the run back (a strand parted) and the let-down (fatigue): the sledge goes back to the last wedge, nothing the player does counts
  if (s.mode === 'run' || s.mode === 'down') {
    const to = s.lastWedge >= 0 ? NOTCH_D[s.lastWedge] : 0, sp = s.mode === 'run' ? CAP.RUN : CAP.DOWN;
    s.v = -sp; s.d = Math.max(to, s.d - sp * dt); s.u = 0; s.s *= Math.exp(-dt / 0.3);
    if (s.d <= to + 1e-9) { s.d = to; s.v = 0; s.mode = 'haul'; s.wedge = s.lastWedge; if (s.wedge < 0 && to <= 0) s.wedge = -2; s.ev.push({ e: 'back' }); }
    s.ten = capBase(s.d); return s;
  }
  let u = Math.max(0, +inp.turn || 0) * CAP.TURN;
  if (s.F >= 1) u = 0;
  // the wedge: off as soon as they haul again
  if (s.wedge !== -1 && u > 0.05) { s.wedge = -1; s.segFrom = s.d; s.quietRun = 1; }
  const wedged = s.wedge !== -1;
  if (wedged) { s.v = 0; s.s *= Math.exp(-dt / 0.3); }
  else {
    s.v += (u - s.v) * (1 - Math.exp(-dt / CAP.TAU_V));
    if (!loaded && u <= 0.05) s.v *= Math.exp(-dt / 0.3);
    s.s += (u - s.v - s.s / CAP.TAU_S) * dt;
    s.d = Math.max(0, s.d + s.v * dt);
  }
  s.u = u;
  const ten = wedged ? capBase(s.d) * 0.4 : capBase(s.d) + capK(s.d) * (s.s + CAP.SPEED * Math.max(0, s.v));
  s.ten = clamp(ten, 0, H128.T_MAX);
  const band = bandOf(s.ten);
  // the rope wears in the upper bands; at full wear a strand parts and the sledge runs back to the last wedge, breaking a timber
  if (!wedged && (band === 'sings' || band === 'frays')) { s.wear += CAP.WEAR[band] * dt; s.quietRun = 0; if (band === 'frays') s.frayed = 1; }
  if (s.wear >= 1) {
    s.wear = CAP.SPLICE; s.dmg++; s.runs++; s.mode = 'run'; s.timber.push(s.lastWedge); s.F = Math.min(s.F, 0.99);
    s.ev.push({ e: 'part' }); return s;
  }
  // fatigue: hauling (by the tension), holding a loaded rope with no wedge (three times), resting on a wedge
  if (wedged) s.F = Math.max(0, s.F - CAP.REST * dt);
  else if (u > 0.05) s.F += CAP.FAT * s.ten * dt;
  else if (loaded) s.F += CAP.HOLD_X * CAP.FAT * 0.5 * dt;
  if (s.F >= 1) {
    s.F = 1; s.grace += dt;
    if (s.grace >= CAP.GRACE && !wedged && loaded) { s.mode = 'down'; s.backs++; s.grace = 0; s.F = 0.9; s.ev.push({ e: 'letdown' }); return s; }
  } else s.grace = 0;
  // a notch passed with the rope quiet all the way since the last one: the quick word
  for (let i = 0; i < NOTCH_D.length; i++) { const nd = NOTCH_D[i]; if (s.d - s.v * dt < nd && s.d >= nd) { if (s.quietRun && s.segFrom < nd - 6) s.ev.push({ e: 'quiet', notch: i }); s.quietRun = 1; s.segFrom = nd; } }
  // the tap on the wedge man
  if (inp.tap) {
    const i = NOTCH_D.findIndex((nd) => Math.abs(s.d - nd) <= CAP.WEDGE_D);
    if (i >= 0 && Math.abs(s.v) < CAP.WEDGE_V) {
      s.wedge = s.lastWedge = i; s.d = NOTCH_D[i]; s.v = 0; if (!s.rests.includes(i)) s.rests.push(i); s.ev.push({ e: 'wedge', notch: i });
      if (i === NOTCH_D.length - 1) { s.done = 1; s.ev.push({ e: 'top' }); }
    } else s.ev.push({ e: 'clack' });
  }
  if (s.d >= CAP_END - CAP.WEDGE_D && !s.done && Math.abs(s.v) < CAP.WEDGE_V && u <= 0.05) { /* waits for the last wedge */ }
  return s;
}
/** 40: no damage, no run back or let-down, the rope never frayed; 20: no damage; 10 otherwise */
export function capPts(s) { return grade(s.dmg, !s.runs && !s.backs && !s.frayed); }

/* ═════════════════ station 3: the fifteen steps ═════════════════ */
/* Lengths in quarter amot (q) along the ring's outer edge. A ring's gap (G) is left at the middle of its half arc by the crews, who lay
 * from both ends. The masons' way (המחשה): the player lays the ring's own stones from the gap's two edges toward the middle IN TURN
 * (left, right, left, …: the first at the north edge), and the hole that remains must be the closing stone's (C) and stand on the
 * ring's middle mark (the keystone at the half arc's middle: each side's stones sum to (G − C) / 2). Each joint (between two stones,
 * and the hole's two edges) must stand at least JOINT q from every joint of the course below it (ring i − 1; under ring 1 the steps'
 * footing course). The stones differ in length, so the choice and the order decide where the joints fall; every ring's row has
 * exactly one way (the tests prove it, and that without the course below more than one way would close). */
export const Q = 0.25, JOINT = 2;
export const RING_LV = Object.freeze({
  1: Object.freeze({ cls: 1, hard: 'template', tol: 0.20, lag: 0, joint: 2, n: 3, fit: 3, decoy: 0, strangers: 6, crack: 0 }),
  8: Object.freeze({ cls: 8, hard: 'row', tol: 0.15, lag: 0, joint: 2, n: 5, fit: 6, decoy: 1, strangers: 2, crack: 0 }),
  15: Object.freeze({ cls: 15, hard: 'key', tol: 0.08, lag: 0.35, joint: 2, n: 3, fit: 4, decoy: 0, strangers: 3, crack: 1 }),
});
/** a ring's rules: rings 2–6 as ring 1, 7–11 as ring 8, 12–14 as ring 15 (brief §6 free work) */
export const ringCls = (i) => (i <= 6 ? 1 : i <= 11 ? 8 : 15);
const rngOf = (seed) => { let t = (seed * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let q = Math.imul(t ^ (t >>> 15), 1 | t); q ^= q + Math.imul(q ^ (q >>> 7), 61 | q); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; };
/** the half arc's outer length (q) */
export const arcQ = (i) => Math.PI * ringOf(i).R / Q;
/** the joints of the steps' footing course under ring 1 (q from ring 1's gap's left edge; המחשה) */
export const FOOT = Object.freeze([4, 14, 25, 36]);
/* the fixed tables of the player's three rings (found by genTable's seeded search and written here; the tests prove each has one
 * way): the gap G and closing stone C (q), the row's two sides (stone lengths from the left edge, from the right edge), the fitting
 * decoy, the cracked twin (the index of the sound stone it copies), the strangers [length, their ring] */
const FIXED = {
  1: { G: 32, C: 10, left: [6, 5], right: [11], decoy: [], crackOf: null, strangers: [[14, 3], [13, 4], [8, 4], [11, 5], [8, 4], [13, 5]] },
  8: { G: 61, C: 13, left: [7, 12, 5], right: [9, 15], decoy: [14], crackOf: null, strangers: [[11, 6], [10, 12]] },
  15: { G: 44, C: 14, left: [8, 7], right: [15], decoy: [], crackOf: 2, strangers: [[7, 11], [15, 13], [16, 13]] },
};
const PLAN_CACHE = new Map();
/** the joints (q from the gap's left edge) of an arrangement: each side's stones from its edge; a side's last joint is the hole's edge */
export function jointsOf(G, C, left, right) {
  const J = []; let a = 0; for (const l of left) { a += l; J.push(a); }
  let b = G; for (const l of right) { b -= l; J.push(b); }
  void C; return J;
}
const clear = (J, below, w = JOINT) => J.every((j) => below.every((k) => Math.abs(j - k) >= w));
/** every way to close: arrangements { left: [ids], right: [ids] } (laid in turn: left has as many as right or one more) of the given
 *  stones whose sides each sum to (G − C) / 2 and whose joints clear the course below. stones: [{ id, len }]; opt.free: any side
 *  split and order (no turn, no middle mark: only the hole's length) */
export function rowSolutions(G, C, below, stones, opt = {}) {
  const out = [], n = stones.length, used = new Array(n).fill(false), need = G - C, half = need / 2, w = opt.joint || JOINT;
  const clr = (J) => clear(J, below, w);
  if (opt.free) {
    const right = (L, R, sL, sR) => {
      if (sL + sR === need) { if (L.length + R.length) out.push({ left: L.map((i) => stones[i].id), right: R.map((i) => stones[i].id) }); return; }
      for (let i = 0; i < n; i++) { if (used[i]) continue; const l = stones[i].len; if (sL + sR + l > need || !clr([G - sR - l])) continue; used[i] = true; right(L, [...R, i], sL, sR + l); used[i] = false; }
    };
    const left = (L, sL) => {
      right(L, [], sL, 0);
      for (let i = 0; i < n; i++) { if (used[i]) continue; const l = stones[i].len; if (sL + l > need || !clr([sL + l])) continue; used[i] = true; left([...L, i], sL + l); used[i] = false; }
    };
    left([], 0); return out;
  }
  if (half !== Math.floor(half)) return out;
  const rec = (L, R, sL, sR) => {
    if (sL === half && sR === half && L.length + R.length && (L.length === R.length || L.length === R.length + 1)) { out.push({ left: L.map((i) => stones[i].id), right: R.map((i) => stones[i].id) }); return; }
    const toLeft = L.length === R.length;
    for (let i = 0; i < n; i++) {
      if (used[i]) continue; const l = stones[i].len;
      if (toLeft) { if (sL + l > half || !clr([sL + l])) continue; used[i] = true; rec([...L, i], R, sL + l, sR); used[i] = false; }
      else { if (sR + l > half || !clr([G - sR - l])) continue; used[i] = true; rec(L, [...R, i], sL, sR + l); used[i] = false; }
    }
  };
  rec([], [], 0, 0);
  return out;
}
/** the crews' stones of ring i outside its gap (seeded): lengths from the north end to the gap's left edge, from the south end to its right */
function crewSides(i, G) {
  const A = arcQ(i), half = (A - G) / 2, rn = rngOf(i * 131 + 7), side = () => { const L = []; let s = 0; while (s < half - 14) { const l = 8 + Math.floor(rn() * 6); L.push(l); s += l; } L.push(+(half - s).toFixed(4)); return L; };
  return { north: side(), south: side() };
}
/** the absolute joints of ring i (angles, rad from the north end) as the plan lays it */
function ringJointsAbs(P) {
  const R = ringOf(P.i).R, A = arcQ(P.i), g0 = (A - P.G) / 2, out = [];
  let s = 0; for (const l of P.crew.north) { s += l; out.push(s); }
  const lens = (ids) => ids.map((id) => P.yard.find((y) => y.id === id).len);
  for (const j of jointsOf(P.G, P.C, lens(P.sol.left), lens(P.sol.right))) out.push(g0 + j);
  s = A; for (const l of P.crew.south) { s -= l; out.push(s); }
  return out.map((q) => (q * Q) / R);
}
/** the joints of the course below ring i in ring i's gap frame (q from its gap's left edge) */
function belowOf(i, G) {
  if (i === 1) return FOOT.filter((q) => q > 0 && q < G);
  const P = ringPlan(i - 1), R = ringOf(i).R, g0 = (arcQ(i) - G) / 2;
  return ringJointsAbs(P).map((a) => (a * R) / Q - g0).filter((q) => q > 0 && q < G).map((q) => +q.toFixed(3));
}
function build(i, T) {
  const L = RING_LV[ringCls(i)], yard = [];
  let n = 0; const id = () => `s${i}.${n++}`;
  const sol = { left: [], right: [] };
  for (const l of T.left) { const o = { id: id(), len: l, ring: i }; yard.push(o); sol.left.push(o.id); }
  for (const l of T.right) { const o = { id: id(), len: l, ring: i }; yard.push(o); sol.right.push(o.id); }
  for (const l of T.decoy) yard.push({ id: id(), len: l, ring: i });
  if (T.crackOf != null) { const tw = yard[T.crackOf]; yard.push({ id: id(), len: tw.len, ring: i, crack: 1 }); }
  for (const [l, r] of T.strangers) yard.push({ id: id(), len: l, ring: r });
  // the yard's order on the ground: a fixed shuffle of the ring's own address
  const rn = rngOf(i * 977 + 3); for (let k = yard.length - 1; k > 0; k--) { const j = Math.floor(rn() * (k + 1)); const t = yard[k]; yard[k] = yard[j]; yard[j] = t; }
  return { i, cls: ringCls(i), joint: L.joint, R: ringOf(i).R, G: T.G, C: T.C, n: T.left.length + T.right.length, yard, sol, tol: L.tol, lag: L.lag, hard: L.hard };
}
/** the generated table of a crew ring or a free one (seeded by i; tried until its row has exactly one way and the joints decide it) */
export function genTable(i, opt = {}) {
  const L = RING_LV[ringCls(i)], LEN = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  for (let at = 0; at < 20000; at++) {
    const rn = rngOf(i * 7919 + at * 104729 + 11), pick = () => LEN[Math.floor(rn() * LEN.length)];
    const C = 4 + Math.floor(rn() * 11), kL = Math.ceil(L.n / 2), kR = L.n - kL;
    const half = Math.min(16 * kR, Math.max(5 * kL, Math.round(L.n / 2 * 8.5 + (rn() - 0.5) * 6))), G = 2 * half + C;
    const below = belowOf(i, G), ok = (j) => below.every((k) => Math.abs(j - k) >= L.joint);
    // (every way each side can reach the middle mark with its joints clear; one pair of them, with no length used twice, is the row)
    const seqs = (k, from, dir) => { const out = []; const rec = (L, p) => { if (L.length === k) { if (p === half) out.push(L.slice()); return; } for (const l of LEN) { if (L.includes(l) || p + l > half || (L.length < k - 1 && half - p - l < 5)) continue; if (!ok(from + dir * (p + l))) continue; L.push(l); rec(L, p + l); L.pop(); } }; rec([], 0); return out; };
    const SL = seqs(kL, 0, 1), SR = seqs(kR, G, -1), pairs = [];
    for (const x of SL) for (const y of SR) if (!y.some((l) => x.includes(l))) pairs.push([x, y]);
    if (!pairs.length) continue;
    const [left, right] = pairs[Math.floor(rn() * pairs.length)], used = [...left, ...right];
    const T = { G, C, left, right, decoy: [], crackOf: L.crack ? Math.floor(rn() * L.n) : null, strangers: [] };
    for (let d = 0; d < L.decoy; d++) { const c = LEN.filter((l) => !used.includes(l)); const l = c[Math.floor(rn() * c.length)]; used.push(l); T.decoy.push(l); }
    const others = [-4, -3, -2, 2, 3, 4].map((o) => i + o).filter((r) => r >= 1 && r <= 15);
    for (let d = 0; d < L.strangers; d++) T.strangers.push([pick(), others[Math.floor(rn() * others.length)]]);
    const P = build(i, T), sound = P.yard.filter((y) => y.ring === i && !y.crack);
    const S = rowSolutions(G, C, below, sound, { joint: L.joint });
    if (S.length !== 1 || S[0].left.join() !== P.sol.left.join() || S[0].right.join() !== P.sol.right.join()) continue;
    // (the joints decide it: without the course below more than one way would close)
    if (opt.jointsDecide && rowSolutions(G, C, [], sound, { joint: L.joint }).length < 2) continue;
    return T;
  }
  throw new Error('ringPlan: no unique table for ring ' + i);
}
/**
 * ring i's plan (1 … 15): { i, cls, R, G, C, n, yard [{ id, len (q), ring, crack? }], sol { left, right } (the one way), below (the
 * joints of the course below, q from the gap's left edge), crew { north, south } (the crews' stones outside the gap), arc (q), g0 (the
 * gap's left edge from the north end, q), tol, lag, hard }. Fixed tables for 1, 8, 15; a seeded table for the others.
 */
export function ringPlan(i) {
  i = clamp(i | 0, 1, 15);
  if (PLAN_CACHE.has(i)) return PLAN_CACHE.get(i);
  const T = FIXED[i] || genTable(i, { jointsDecide: true });
  const P = build(i, T);
  P.below = belowOf(i, T.G); P.crew = crewSides(i, T.G); P.arc = arcQ(i); P.g0 = (P.arc - T.G) / 2;
  deepFreeze(P); PLAN_CACHE.set(i, P);
  return P;
}
const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };
/** step 1, the template: the line of light between the ring's template and a stone (px at the play camera: 0 for a fitting stone,
 *  2 … 6 for a stranger from 2 … 4 rings away) */
export const tplLight = (P, stone) => { const d = Math.abs(stone.ring - P.i); return d === 0 ? 0 : clamp(2 * (d - 1), 2, 6); };
/** the mallet's sound on a stone */
export const stoneSound = (stone) => (stone.crack ? 'dull' : 'clear');
/** step 2, the row: { left: [ids], right: [ids], loose: [{ id, side }] } → { rest (q, the hole left), sL, sR, mid (the hole on the
 *  middle mark), turn (laid in turn), bull (rest = C on the mark, every joint clear, every stone the ring's), over [joint q over a
 *  joint below], gape [ids of strangers in the row], joints, cracked } */
export function rowFit(P, row) {
  const by = (id) => P.yard.find((y) => y.id === id);
  const L = (row.left || []).map(by).filter(Boolean), R = (row.right || []).map(by).filter(Boolean);
  const sL = L.reduce((a, s) => a + s.len, 0), sR = R.reduce((a, s) => a + s.len, 0), rest = P.G - sL - sR;
  const J = jointsOf(P.G, P.C, L.map((s) => s.len), R.map((s) => s.len));
  const over = J.filter((j) => P.below.some((k) => Math.abs(j - k) < P.joint));
  const gape = [...L, ...R].filter((s) => s.ring !== P.i).map((s) => s.id);
  const half = (P.G - P.C) / 2, mid = sL === half && sR === half, turn = L.length === R.length || L.length === R.length + 1;
  return { rest, sL, sR, mid, turn, bull: rest === P.C && mid && turn && !over.length && !gape.length && !(row.loose && row.loose.length), over, gape, joints: J, cracked: [...L, ...R].some((s) => s.crack) };
}
/** the side the next stone goes to (in turn, the first at the left: north)*/
export const nextSide = (row) => ((row.left || []).length === (row.right || []).length ? 'left' : 'right');
/** a stone let go `off` q from its place against its neighbour: home within a quarter amah (1 q), else it stays loose */
export const slidesHome = (off) => Math.abs(off) <= 1;

/** step 3, the closing stone: two crowbars, advances a and b (0..1); it moves only while |a − b| ≤ tol; beyond it the leading corner
 *  jams; pushing a jammed corner 0.8 s in a row breaks it (damage); the heavy stone answers the bars `lag` s late */
export const KEY = Object.freeze({ BREAK: 0.8, RATE: 0.6 });
export function keyFresh(P) { return { a: 0, b: 0, tol: P.tol, lag: P.lag, q: [], t: 0, jam: 0, jamT: 0, jams: 0, corner: 0, crack: 0, dmg: 0, done: 0, ev: [] }; }
/** inp: { da, db } the bars' pushes this step (advance units; − pulls back). opt.cracked: the row holds a cracked stone */
export function keyStep(s, inp = {}, dt = 1 / 60, opt = {}) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  s.q.push([s.t, +inp.da || 0, +inp.db || 0]);
  let da = 0, db = 0;
  while (s.q.length && s.q[0][0] <= s.t - s.lag + 1e-9) { const e = s.q.shift(); da += e[1]; db += e[2]; }
  const lead = s.a - s.b;
  // the leading corner cannot go further while the stone is askew
  const jamA = lead >= s.tol - 1e-9 && da > 0, jamB = -lead >= s.tol - 1e-9 && db > 0;
  if (jamA) da = 0; if (jamB) db = 0;
  s.a = clamp(s.a + da, 0, 1); s.b = clamp(s.b + db, 0, 1);
  if (Math.abs(s.a - s.b) > s.tol) { if (s.a > s.b) s.a = s.b + s.tol; else s.b = s.a + s.tol; }
  const jam = jamA || jamB;
  if (jam && !s.jam) { s.jams++; s.ev.push({ e: 'jam', side: jamA ? 'a' : 'b' }); }
  s.jam = jam ? 1 : 0;
  if (jam) { s.jamT += dt; if (s.jamT >= KEY.BREAK && !s.corner) { s.corner = 1; s.dmg++; s.ev.push({ e: 'corner' }); } } else s.jamT = 0;
  if (s.a >= 1 && s.b >= 1) {
    s.done = 1;
    if (opt.cracked && !s.crack) { s.crack = 1; s.dmg++; s.ev.push({ e: 'crack' }); }
    s.ev.push({ e: 'closed' });
  }
  return s;
}
/** a ring's points: 40 no wrong mark carried to the row, the row right at the first laying, the closing with no jam, no damage */
export function ringPts(r) { return grade(r.dmg, !r.wrongCarried && r.firstLay && !r.jams); }

/* ═════════════════ station 4: the wickets' bolts ═════════════════ */
export const BOLT_LV = Object.freeze({
  wicketN: Object.freeze({ tol: 14, END: 720, dry: 0, plate: 0 }),
  wicketS: Object.freeze({ tol: 10, END: 720, dry: 1, plate: 1, DRY_AT: 0.4, ROCK: 15, ROCKS: 3 }),
  wickets: Object.freeze({ END: [720, 1080], TOG: 0.3, TOG_MOUSE: 1.2, LAST: 10, BACK: 90 }),
});
export const BOLT = Object.freeze({ BREAK: 0.8, BLOCK_OK: 0.5 });
export function boltFresh(id = 'wicketN') { const L = BOLT_LV[id]; return { id, a: 0, b: 0, tol: L.tol, END: L.END, blk: 0, blkT: 0, blkMax: 0, tooth: [0, 0], dmg: 0, dry: L.dry ? { stuck: 0, free: 0, rocks: 0, back: 0 } : null, done: 0, t: 0, ev: [] }; }
/** inp: { da (left ring, with the clock, degrees this step), db (right ring, against it) }; the bolts travel min(a, b) / END */
export function boltStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  let da = +inp.da || 0, db = +inp.db || 0;
  const L = BOLT_LV[s.id];
  // the dry lower bolt: at 40% it sticks; both rings rocked back 15° and forward again, three times, free it
  if (s.dry && !s.dry.free) {
    const S = L.DRY_AT * s.END, m = Math.min(s.a, s.b);
    if (!s.dry.stuck && m >= S) { s.dry.stuck = 1; s.ev.push({ e: 'stick' }); }
    if (s.dry.stuck) {
      if (!s.dry.back && s.a <= S - L.ROCK && s.b <= S - L.ROCK) s.dry.back = 1;
      if (s.dry.back && s.a >= S - 1 && s.b >= S - 1) { s.dry.back = 0; s.dry.rocks++; s.ev.push({ e: 'rock', n: s.dry.rocks }); if (s.dry.rocks >= L.ROCKS) { s.dry.free = 1; s.ev.push({ e: 'free' }); } }
      if (!s.dry.free) { if (s.a + da > S) da = Math.max(0, S - s.a); if (s.b + db > S) db = Math.max(0, S - s.b); }
    }
  }
  // the teeth mesh only while |a − b| ≤ tol: the leading ring goes no further (it shakes, it squeals); forcing it bends a tooth
  const lead = s.a - s.b, blA = lead >= s.tol - 1e-9 && da > 0, blB = -lead >= s.tol - 1e-9 && db > 0;
  if (blA) da = 0; if (blB) db = 0;
  s.a = clamp(s.a + da, 0, s.END); s.b = clamp(s.b + db, 0, s.END);
  if (s.a - s.b > s.tol) s.a = s.b + s.tol; else if (s.b - s.a > s.tol) s.b = s.a + s.tol;
  const bl = blA || blB;
  if (bl && !s.blk) s.ev.push({ e: 'squeal', ring: blA ? 'a' : 'b' });
  s.blk = bl ? 1 : 0;
  if (bl) {
    s.blkT += dt; s.blkMax = Math.max(s.blkMax, s.blkT);
    const k = blA ? 0 : 1;
    if (s.blkT >= BOLT.BREAK && !s.tooth[k]) { s.tooth[k] = 1; s.dmg++; s.ev.push({ e: 'tooth', bolt: k }); }
  } else s.blkT = 0;
  if (s.a >= s.END && s.b >= s.END) { s.done = 1; s.ev.push({ e: 'locked' }); }
  return s;
}
export const travelOf = (s) => Math.min(s.a, s.b) / s.END;
export function boltPts(s) { return grade(s.dmg, s.blkMax <= BOLT.BLOCK_OK); }
/** level 3: both wickets, one per thumb (the masons follow each ring exactly): north two turns, south three; both must lock within
 *  0.3 s (mouse: both in their last 10° and the second knock within 1.2 s); one locked alone waits, turned back a quarter it opens */
export function pairFresh(opt = {}) { const L = BOLT_LV.wickets; return { w: [0, 0], END: L.END.slice(), lock: [null, null], tries: 0, together: 0, first: 1, t: 0, mouse: !!opt.mouse, done: 0, ev: [] }; }
export function pairStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  const L = BOLT_LV.wickets, win = s.mouse ? L.TOG_MOUSE : L.TOG;
  const d = [+inp.dN || 0, +inp.dS || 0];
  for (let k = 0; k < 2; k++) {
    if (s.lock[k] != null) { if (d[k] < 0) { s.w[k] += d[k]; if (s.w[k] <= s.END[k] - L.BACK) { s.lock[k] = null; s.ev.push({ e: 'open', k }); } } continue; }
    s.w[k] = clamp(s.w[k] + d[k], 0, s.END[k]);
    if (s.w[k] >= s.END[k]) { s.lock[k] = s.t; s.ev.push({ e: 'knock', k }); }
  }
  if (s.lock[0] != null && s.lock[1] != null) {
    const ok = Math.abs(s.lock[0] - s.lock[1]) <= win;
    if (ok) { s.done = 1; s.together = 1; s.ev.push({ e: 'together' }); }
  } else if ((s.lock[0] != null || s.lock[1] != null)) {
    const k = s.lock[0] != null ? 0 : 1;
    if (s.t - s.lock[k] > win && !s.alone) { s.alone = 1; s.first = 0; s.tries++; s.ev.push({ e: 'alone', k }); }
  } else s.alone = 0;
  return s;
}
export function pairPts(s) { return s.done ? (s.first ? 40 : 20) : 10; }

/* ═════════════════ the closing of the gate: two leaves, twenty men ═════════════════ */
/* Per leaf: φ (deg) from 90 (open) to 0 (closed), ω (deg/s, − closing); slow to start (each heave a small kick), slow to stop (a small
 * friction: the coast's time constant 1/c). The men's cycle (set, lean, heave, step) is a phase that runs faster as the leaf turns
 * faster; a heave in the lean window has full force, out of it a third. A pull down the screen is the brake. The north hinge is stiffer. */
export const LEAF = Object.freeze({
  KICK: 2.6,                         // deg/s added by one full heave
  C: Object.freeze([0.10, 0.17]),    // friction (1/s): [south, north] — the north hinge stiffer
  BRAKE: 4,                          // deg/s² while the men dig in their heels
  WIN: Object.freeze([0.35, 0.7]),   // the cycle's lean window
  T0: 2.2, T1: 1.0, TK: 0.12,        // the cycle's period at rest, its least, its shortening per deg/s
  SOFT: 3, DENT: 6, BOUNCE: 12, WAIT: 3, MEET: 2,
});
export function leafFresh() { return { f: [90, 90], w: [0, 0], ph: [0, 0], heaves: [0, 0], slips: [0, 0], bounces: 0, dent: [0, 0], dmg: 0, wait: [0, 0], waited: 0, done: 0, t: 0, ev: [] }; }
/** the men's period at this leaf's speed (s) */
export const cycleOf = (w) => clamp(LEAF.T0 - LEAF.TK * Math.abs(w), LEAF.T1, LEAF.T0);
export const inWindow = (ph) => ph >= LEAF.WIN[0] && ph <= LEAF.WIN[1];
/** inp: { heave: [bool, bool] (a short push this step: index 0 the south / left leaf, 1 the north / right), brake: [bool, bool] } */
export function leafStep(s, inp = {}, dt = 1 / 60) {
  s.ev = []; if (s.done) return s;
  s.t += dt;
  const hv = inp.heave || [], br = inp.brake || [];
  for (let k = 0; k < 2; k++) {
    if (s.wait[k]) { s.w[k] = 0; continue; }
    // the men's cycle runs on; a heave restarts it from the step
    s.ph[k] = (s.ph[k] + dt / cycleOf(s.w[k])) % 1;
    if (hv[k]) {
      const full = inWindow(s.ph[k]);
      s.w[k] -= LEAF.KICK * (full ? 1 : 1 / 3); s.heaves[k]++; if (!full) { s.slips[k]++; s.ev.push({ e: 'slip', k }); } else s.ev.push({ e: 'heave', k });
      s.ph[k] = LEAF.WIN[1] + 0.01;
    }
    if (br[k]) { const b = LEAF.BRAKE * dt; s.w[k] = Math.abs(s.w[k]) <= b ? 0 : s.w[k] + Math.sign(-s.w[k]) * b; }
    s.w[k] *= Math.exp(-LEAF.C[k] * dt);
    s.f[k] = clamp(s.f[k] + s.w[k] * dt, 0, 90);
    // the other leaf waits at 3°: this one meets it when it comes within MEET of it, slow
    if (s.wait[1 - k] && s.f[k] <= LEAF.WAIT + LEAF.MEET && Math.abs(s.w[k]) <= LEAF.SOFT) { s.f = [0, 0]; s.w = [0, 0]; s.done = 1; s.ev.push({ e: 'meet' }); return s; }
    if (s.f[k] <= 90 && s.f[k] >= 90 && s.w[k] > 0) s.w[k] = 0;
    // the jamb
    if (s.f[k] <= 0) {
      const v = Math.abs(s.w[k]), o = 1 - k;
      if (v > LEAF.DENT) { if (!s.dent[k]) { s.dent[k] = 1; s.dmg++; } s.f[k] = LEAF.BOUNCE; s.w[k] = 0; s.bounces++; s.ev.push({ e: 'dent', k }); }
      else if (v > LEAF.SOFT) { s.f[k] = LEAF.BOUNCE; s.w[k] = 0; s.bounces++; s.ev.push({ e: 'bounce', k }); }
      else if (s.f[o] <= LEAF.MEET && Math.abs(s.w[o]) <= LEAF.SOFT) { s.f = [0, 0]; s.w = [0, 0]; s.done = 1; s.ev.push({ e: 'together' }); return s; }
      else { s.f[k] = LEAF.WAIT; s.w[k] = 0; s.wait[k] = 1; s.waited = 1; s.ev.push({ e: 'wait', k }); }
    }
  }
  return s;
}
export function leafPts(s) { return grade(s.dmg, !s.bounces && !s.waited); }

/* ═════════════════ the plan and the save ═════════════════ */
const MISSIONS = () => [
  { k: 'sea', id: 'sea1', lv: 1 }, { k: 'sea', id: 'sea2', lv: 2 }, { k: 'sea', id: 'sea3', lv: 3 }, { k: 'capstan', id: 'capstan', lv: 1 },
  { k: 'steps', id: 'ring1', ring: 1, lv: 1 }, { k: 'steps', id: 'ring8', ring: 8, lv: 2 }, { k: 'steps', id: 'ring15', ring: 15, lv: 3 },
  { k: 'wicket', id: 'wicketN', lv: 1 }, { k: 'wicket', id: 'wicketS', lv: 2 }, { k: 'wicket', id: 'wickets', lv: 3 },
  { k: 'close', id: 'close', lv: 1 },
];
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['sea', 'capstan', 'steps', 'wicket', 'close']);
const HIS_RINGS = [1, 8, 15];
/** a free ring's work: ringF:<i> for a ring the crews have not closed (2–7, 9–14), with its class's rules */
export function freeOf(id) { const m = /^ringF:(\d+)$/.exec(id || ''); if (!m) return null; const i = +m[1]; if (i < 1 || i > 15 || HIS_RINGS.includes(i)) return null; return { k: 'steps', id, ring: i, lv: ringCls(i) === 1 ? 1 : ringCls(i) === 8 ? 2 : 3, free: true }; }
export function freshH128() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0,
    sea: { ring: {}, torn: {}, knot: {}, worn: {} }, cap: { timber: [], rests: [] }, rings: {}, bolts: { N: { tooth: [0, 0] }, S: { tooth: [0, 0] } },
    close: { dent: [0, 0] }, film: 0, i: 0 };
}
const FREE_CACHE = {};
export function createH128(save) {
  const st = save && save.v === 1 ? save : freshH128();
  for (const [k, v] of Object.entries(freshH128())) if (st[k] === undefined) st[k] = v;
  if (st.cur && !PLAN.some((m) => m.id === st.cur) && !freeOf(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || M.freeMission(st.cur) : null; },
    /** the order: sea1 → sea2 → sea3 → capstan; then the rings (1, 8, 15 in order) and the wickets (N, S, both in order) freely; close last */
    canDo(m) {
      if (!m || d(m.id)) return false;
      if (m.free) return M.free().some((x) => x.id === m.id);
      switch (m.id) {
        case 'sea1': return true;
        case 'sea2': return d('sea1');
        case 'sea3': return d('sea2');
        case 'capstan': return d('sea3');
        case 'ring1': case 'wicketN': return d('capstan');
        case 'ring8': return d('ring1');
        case 'ring15': return d('ring8');
        case 'wicketS': return d('wicketN');
        case 'wickets': return d('wicketS');
        case 'close': return PLAN.filter((x) => x.id !== 'close').every((x) => d(x.id));
        default: return false;
      }
    },
    open() { return PLAN.filter((m) => M.canDo(m)).concat(M.free()); },
    pick(id) { const m = id ? (PLAN.find((x) => x.id === id) || M.freeMission(id)) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    freeMission(id) { const m = freeOf(id); if (!m) return null; FREE_CACHE[id] = FREE_CACHE[id] || Object.freeze(m); return FREE_CACHE[id]; },
    /** the free rings open once ring 15 is closed: every ring he has not closed (the crews close what he leaves, at the stage's end) */
    free() { if (!d('ring15')) return []; const L = []; for (let i = 2; i <= 14; i++) if (!HIS_RINGS.includes(i) && !d('ringF:' + i)) L.push(M.freeMission('ringF:' + i)); return L; },
    nDone() { return PLAN.filter((m) => d(m.id)).length; },
    count() { return [M.nDone(), PLAN.length]; },
    finished() { return PLAN.every((m) => d(m.id)); },
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open().filter((m) => !m.free), hit = O.find(want); if (hit) return M.pick(hit.id);
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    levelOf(m) { return m.lv | 0 || 1; },
    /** the rings standing (the crews' and his): before the capstan none; after ring 1 the crews lay 2–7 (their gaps closed only at the
     *  stage's end unless he closes them), after ring 8 9–14, after ring 15 the last */
    ringsLaid() { if (!d('capstan')) return 0; return d('ring15') ? 15 : d('ring8') ? 14 : d('ring1') ? 7 : 0; },
    ringClosed(i) { if (HIS_RINGS.includes(i)) return d('ring' + i); return d('ringF:' + i) || M.finished(); },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {} };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      st.cur = null; st.i = st.done.length;
      M.defaults(m);
      return null;
    },
    /** what the crews leave of a work not played: a ring closed the one way, clean */
    defaults(m) {
      if (m.k === 'steps') { const i = m.ring, P = ringPlan(i); if (!st.rings[i]) st.rings[i] = { left: P.sol.left.slice(), right: P.sol.right.slice(), crack: 0, corner: 0, clean: 1, by: 'c' }; }
      if (m.k === 'capstan' && !st.cap.done) st.cap.done = 1;
    },
    progress() { return Math.min(1, M.nDone() / PLAN.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
