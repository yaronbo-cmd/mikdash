/* ── build 136 ── h136/kelonsa-model.js — work 2 "כלונסות הארז, שלא יבעט", the model (spec docs/specs/shlav-13-he.md v4, עבודה 2). Pure.
 * The pole (11.6 amot, "ויותר מעט": Melekhet Shelomoh; round and thick: Tiferet Yisrael) hangs on a short rope from a wheeled trolley on a
 * temporary wooden rail (y 72) over the 11-amah gap between the Heichal's wall (x −92, the deep pocket to −93) and the Ulam's front
 * (x −81, the shallow seat to −80.7). Two hands on one thing, two roles:
 *   · the WORK hand on the leather strap at the pole's middle SLIDES it along (the strap is tied to the trolley): its x;
 *   · the HELPING hand on the ring at the east end TILTS it (±20°, up and down), with a little weight: it goes on after the finger stops.
 * THE CHAIN OF MOVES (spec "מגע" 1–5): it hangs tilted, the east end up; tilt it down under the level's threshold (6° / 4° / 2.5°) and
 * slide it west: the west end goes into the deep pocket (under half the threshold: a clean entry, +10); over it, the end jams on the
 * pocket's rim (a scratch, −20) and backs off a little by itself. At the pocket's bottom (−93) the east end is clear of the wall (−81.4):
 * slide it back east, the east end goes into the seat and stops there; both fingers off with each end in its socket ≥ 0.05 = the LOCK,
 * a deep "תוק". A drag faster than 3 amot/s swings it along and the end knocks the pocket's rim: 20 at most, no damage.
 * GEOMETRY KEPT SIMPLE (the spec's rule, not a rigid body: a rigid 11.6 cannot turn between walls 11 apart): the walls stop the pole only
 * along its length — the west end at the pocket's mouth unless it may enter, the east end at the seat's bottom; the tilt is free, and
 * the lock asks that the west end went DEEP this time (so tilting it level in the middle of the gap is not a lock: that was the trap).
 * THE WALL KICKS (levels 2–3): the Ulam's front leans slowly east, out of the hall, in sections — level 2 two (north z −30 … 0, south
 * 0 … 30), level 3 three (−30 … −10, −10 … 10, 10 … 30), each at its own pace up to 0.4 at most (0.4 in 30 s at level 2, in 20 s at
 * level 3), never falling. Each pole belongs to one section and its lock FREEZES that section (it does not pull it back); a frozen
 * section slows each moving neighbour to half its pace (two frozen neighbours: a quarter). The crack between two sections is their lean's
 * difference. A section that reaches 0.4 leaves a crack in the plaster (−20); the pole can still lock there.
 * THE ARITHMETIC THAT IS THE GAME: 11.6 − 11 = 0.6 of bearing for both ends together; every amah the wall moves is taken from it. A
 * balanced pole at lean d: west end at −92.3 + d/2, east at −80.7 + d/2, each bearing 0.3 − d/2.
 * GRADES (the step takes the lower): balance = the smaller bearing over (0.6 − d)/2: ≥ 90% 40, ≥ 75% 20, else 10; steadiness = the lean
 * at the lock: ≤ 0.1 40, ≤ 0.25 20, else 10 (level 1: no lean, always 40). A clean entry: +10 apart.
 * Levels: 1 one pole (z 0), no lean, the path's shadow, threshold 6°, the tilt rights itself slowly (one thumb slides); 2 two (z −20,
 * 20), two sections, threshold 4°; 3 three (z −20, 0, 20), three sections, 2.5° — the order he chooses matters.
 * Units: amot, seconds, degrees. Nothing random. */
import { BOOK } from '../world/grid.js';

const KS = BOOK.s13.kelonsa;
const RAD = Math.PI / 180;
export const KL = Object.freeze({
  H: KS.len / 2, W_FACE: -92, POCKET: KS.pocket.x0, ENTRY: -92.45, DEEP: -92.9, E_FACE: -81, SEAT_D: 0.3, MIN_BEAR: 0.05,
  X0: -86.5, TILT0: KS.tilt0, TILT_MAX: 20, TH: { 1: 6, 2: 4, 3: 2.5 },
  K_SLIDE: 60, C_SLIDE: 14,   // the strap's pull on the trolley (heavy: it lags the finger)
  K_TILT: 28, C_TILT: 6.5,    // the ring's pull on the tilt (a little overshoot: its weight)
  FAST: 3, BACK: 0.35, RIGHT: 3,    // amot/s that swing it; how far a jammed end backs off; level 1's self-righting, deg/s
  LEAN: { 1: 0, 2: 0.4 / 30, 3: 0.4 / 20 }, DMAX: 0.4,
  SECT: { 1: [[-30, 30]], 2: [[-30, 0], [0, 30]], 3: [[-30, -10], [-10, 10], [10, 30]] },
  POLES: { 1: [0], 2: [-20, 20], 3: [-20, 0, 20] },
});
export const secOf = (lv, z) => { const L = KL.SECT[lv] || KL.SECT[1]; for (let i = 0; i < L.length; i++) if (z >= L[i][0] && z <= L[i][1]) return i; return 0; };
export function fresh(lv) {
  const zs = KL.POLES[lv] || KL.POLES[1], ns = (KL.SECT[lv] || KL.SECT[1]).length;
  const S = { lv, zs: zs.slice(), d: new Array(ns).fill(0), frozen: new Array(ns).fill(false), cracked: new Array(ns).fill(false), leaning: false,
    locked: {}, steps: [], flaws: [], first: true, t: 0, done: false, cur: null, two: false };
  S.th = KL.TH[lv] || 6;
  // (level 1 has one pole: it is his at once; levels 2–3 he chooses which pole he works on)
  if (zs.length === 1) pick(S, zs[0]);
  return S;
}
export const leftPoles = (S) => S.zs.filter((z) => !S.locked[z]);
/** he chooses a pole (it rides up on its trolley to the middle of the gap, tilted) */
export function pick(S, z) {
  if (S.locked[z] || !S.zs.includes(z)) return false;
  S.cur = z; S.sec = secOf(S.lv, z);
  S.px = KL.X0; S.vx = 0; S.phi = KL.TILT0; S.w = 0; S.sway = 0; S.sv = 0.15;
  S.inW = false; S.deep = false; S.clean = false; S.jam = false; S.cap = 0; S.phase = 'hang'; S.pt = 0; S.fast = 0;
  return true;
}
/** the ends' x (with the small swing along) and their bearings in the sockets */
export function ends(S) {
  const c = Math.cos(S.phi * RAD), xw = S.px + S.sway - KL.H * c, xe = S.px + S.sway + KL.H * c, d = S.d[S.sec] || 0, ef = KL.E_FACE + d;
  return { xw, xe, bw: KL.W_FACE - xw, be: xe - ef, ef, d, yw: -KL.H * Math.sin(S.phi * RAD), ye: KL.H * Math.sin(S.phi * RAD) };
}
export const bearing = (S) => { const e = ends(S); return Math.min(e.bw, e.be); };
/** one step. inp: { slide: target x of the trolley (null: no finger on the strap), tilt: target tilt deg (null: no finger on the ring),
 *  held: any finger on the pole } → events */
export function step(S, dt, inp = {}) {
  const ev = []; if (S.done) return ev;
  S.t += dt;
  // the lean (from his first touch of the work)
  if (inp.slide != null || inp.tilt != null) S.leaning = true;
  const base = KL.LEAN[S.lv] || 0;
  if (base && S.leaning) {
    for (let i = 0; i < S.d.length; i++) {
      if (S.frozen[i] || S.d[i] >= KL.DMAX) continue;
      let k = 1; if (i > 0 && S.frozen[i - 1]) k *= 0.5; if (i < S.d.length - 1 && S.frozen[i + 1]) k *= 0.5;
      S.d[i] = Math.min(KL.DMAX, S.d[i] + base * k * dt);
      if (S.d[i] >= KL.DMAX && !S.cracked[i]) { S.cracked[i] = true; S.flaws.push({ f: 'kelonsa.crack', at: i }); ev.push({ k: 'crack', sec: i }); }
    }
  }
  if (S.cur == null || S.phase !== 'hang') { if (S.phase === 'locked') { S.pt += dt; if (S.pt > 1.2) { S.phase = 'idle'; S.cur = null; if (!leftPoles(S).length) { S.done = true; ev.push({ k: 'done' }); } else ev.push({ k: 'choose' }); } } return ev; }
  if (inp.slide != null && inp.tilt != null) S.two = true;
  // the tilt: the ring's pull (with its weight), or level 1's slow self-righting
  const lim = S.inW ? S.th * 0.98 : KL.TILT_MAX;
  if (inp.tilt != null) { const tg = Math.max(-lim, Math.min(lim, inp.tilt)); S.w += (KL.K_TILT * (tg - S.phi) - KL.C_TILT * S.w) * dt; }
  else { S.w *= Math.max(0, 1 - 4 * dt); if (S.lv === 1) { const r = KL.RIGHT * dt; S.phi += Math.max(-r, Math.min(r, -S.phi)); } }
  S.phi += S.w * dt;
  if (Math.abs(S.phi) > lim) { S.phi = Math.sign(S.phi) * lim; S.w = 0; }
  // the slide: the strap pulls the trolley (heavy); the swing along it
  if (inp.slide != null) S.vx += (KL.K_SLIDE * (inp.slide - S.px) - KL.C_SLIDE * S.vx) * dt; else S.vx *= Math.max(0, 1 - 6 * dt);
  const fast = Math.abs(S.vx) > KL.FAST;
  if (fast) { S.fast = 0.6; S.sv += Math.sign(S.vx) * 0.6 * dt; }
  S.fast = Math.max(0, S.fast - dt);
  S.sv += (-9 * S.sway - 1.2 * S.sv) * dt; S.sway += S.sv * dt;
  const px0 = S.px; S.px += S.vx * dt;
  // the walls, along the pole
  let E = ends(S);
  if (!S.inW && E.xw < KL.ENTRY) {
    if (Math.abs(S.phi) < S.th) {
      S.inW = true; S.clean = Math.abs(S.phi) < S.th / 2; ev.push({ k: 'enter', clean: S.clean, tilt: +S.phi.toFixed(2) });
      if (S.fast > 0) { S.cap = 20; ev.push({ k: 'knock' }); }
    } else {
      // the jam: the end on the pocket's rim, a scratch (the work's first is a free try), it backs off by itself
      S.px += KL.ENTRY - E.xw + KL.BACK; S.vx = 0; S.sway = 0;
      if (!S.jam) {
        S.jam = true;
        if (S.first) { S.first = false; ev.push({ k: 'free', tilt: +S.phi.toFixed(2) }); }
        else { S.flaws.push({ f: 'kelonsa.rim', at: S.cur }); ev.push({ k: 'jam', tilt: +S.phi.toFixed(2) }); }
      }
    }
  }
  if (S.jam && E.xw > KL.ENTRY + 0.25) S.jam = false;
  E = ends(S);
  if (S.inW) {
    if (E.xw < KL.POCKET) { S.px += KL.POCKET - E.xw; if (S.vx < 0) { if (S.vx < -KL.FAST) { S.cap = 20; ev.push({ k: 'knock' }); } S.vx = 0; } S.sway = Math.max(S.sway, 0); }
    E = ends(S);
    if (!S.deep && E.xw <= KL.DEEP) { S.deep = true; ev.push({ k: 'deep' }); }
    if (E.xw > KL.W_FACE + 0.02) { S.inW = false; S.deep = false; ev.push({ k: 'out' }); }
  }
  E = ends(S);
  // the east end: the seat's bottom stops it (only level enough; else the wall's face)
  // (only near level: a tilted east end rides over the seat — the spec's rule; the rigid wall would push the pole west and jam it)
  const stopE = E.ef + KL.SEAT_D;
  if (Math.abs(S.phi) < S.th && E.xe > stopE) { const was = E.xe; S.px -= was - stopE; if (S.vx > 0) S.vx = 0; if (Math.abs(S.phi) < S.th && E.be > 0.2 && !S.seatT) { S.seatT = 1; ev.push({ k: 'seat' }); } }
  if (E.be < 0) S.seatT = 0;
  void px0;
  // the lock: both fingers off, it went deep this time, each end in its socket by 0.05 at least
  E = ends(S);
  if (!inp.held && S.deep && S.inW && Math.abs(S.phi) < S.th && E.bw >= KL.MIN_BEAR && E.be >= KL.MIN_BEAR) lock(S, ev);
  return ev;
}
export function grades(S) {
  const E = ends(S), d = E.d, A = 0.6 - d, bal = Math.min(E.bw, E.be) / (A / 2);
  const gb = bal >= 0.9 ? 40 : bal >= 0.75 ? 20 : 10, gs = S.lv === 1 ? 40 : d <= 0.1 ? 40 : d <= 0.25 ? 20 : 10;
  return { bal, gb, gs, d, bw: E.bw, be: E.be };
}
function lock(S, ev) {
  const G = grades(S); let g = Math.min(G.gb, G.gs); if (S.cap) g = Math.min(g, S.cap);
  S.first = false;
  S.frozen[S.sec] = true;
  const gn = g >= 40 ? 'gold' : g >= 20 ? 'good' : 'ok';
  const st = { z: S.cur, grade: gn, d: +G.d.toFixed(3), bw: +G.bw.toFixed(3), be: +G.be.toFixed(3), clean: S.clean, tilt: +S.phi.toFixed(2), two: S.two };
  S.locked[S.cur] = st; S.steps.push(st); S.phase = 'locked'; S.pt = 0; S.two = false;
  ev.push({ k: 'lock', ...st });
}
export function result(S) {
  const n = S.steps.length || 1, pts = S.steps.reduce((a, s) => a + (s.grade === 'gold' ? 40 : s.grade === 'good' ? 20 : 10), 0);
  const gold = S.steps.filter((s) => s.grade === 'gold').length, flaws = S.flaws.length, cracks = S.flaws.filter((x) => x.f === 'kelonsa.crack').length;
  const allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = allGold && !flaws ? 3 : !flaws && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: allGold && !flaws, flags: { poles: S.steps.length, gold, flaws, cracks, clean: S.steps.filter((s) => s.clean).length } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, steps: S.steps, flaws: S.flaws, first: S.first }; }
/** a reload in the middle: the spec's "ביצוע חוזר" for the poles is all of the level together — the work starts again from the props */
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.flaws = (b.flaws || []).filter((x) => x.f === 'kelonsa.crack' || x.f === 'kelonsa.rim'); S.first = false; return S; }

/* ───────── a bot (step 0, the probes): tilt down, slide in deep, back to the seat, let go balanced ───────── */
export function bot(S, o = {}) {
  if (S.cur == null) { const L = leftPoles(S); if (!L.length) return {}; const mid = S.lv === 3 && L.includes(0) ? 0 : L[0]; return { pick: o.order ? o.order.find((z) => L.includes(z)) : mid }; }
  if (S.phase !== 'hang') return {};
  const E = ends(S), half = S.th * 0.3;
  if (!S.deep) {
    if (Math.abs(S.phi) > half) return { tilt: 0, slide: S.px, held: true };
    return { tilt: 0, slide: S.px - 0.45, held: true };
  }
  // back east to the balanced place: the east end's bearing = the west's
  const want = (E.bw - E.be) / 2;   // (>0: move east)
  if (Math.abs(want) > 0.01) return { tilt: 0, slide: S.px + want * 1.0, held: true };
  if (Math.abs(S.vx) > 0.02) return { tilt: 0, slide: S.px, held: true };
  return { held: false };
}
