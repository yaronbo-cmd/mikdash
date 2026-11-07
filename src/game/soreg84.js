/* ── build 84 ── soreg84.js — STAGE 03 REBUILT AS PHYSICAL ACTS (the owner, 3.11: "לא שינית כלום, המשחקונים נשארו גרועים"; the review
 * "המשחקונים 03–13 — בחינת האתגר, הסיפוק וההארד פאן" §3 stage 03 and §5: each act repeated at a rising level, risk inside the act, the
 * score "האבנים שלך" — מהודר a whole stone, כשר a half, a failed act 0 though the stone stands).
 *
 * THE STONE LATTICE (הסורג): Josephus describes the partition as stone — "a stone balustrade, three cubits high, very gracefully wrought"
 * (Wars 5.193; Ant. 15.417); the Mishnah gives its height as ten handbreadths (Middot 2:3). So the lattice is pierced stone slabs; the way
 * they are set — between grooved posts, lowered by a small hoist — is an illustration (המחשה). Each slab must continue the carved pattern
 * of the one before it. The crew lifts the slabs off the cart one at a time; he looks, turns a slab that stands back to front, sends back
 * one that does not continue, and lowers the right one on the rope: his finger pays out the rope (down lowers, up raises) and its side
 * pull is the tag line that steadies the swing. The slab enters the grooves only when it hangs straight over them; else it knocks on the
 * post tops and swings (a jam). Set down too fast, its edge chips. Three slabs a section, three sections, each harder: tighter grooves,
 * less damping, wind, slabs that come back to front, patterns whose wrong phase is hard to see.
 *
 * THE WARNING STONES: "upon it stood pillars at equal distances from one another" (Wars 5.193–194). The master builder paces the gap once;
 * he must set every stone that many paces from the one before — the count shown at first, then only the ticks, then carrying the weight.
 *
 * Pure (no DOM, no three): har42.js draws and drives it; the tests read it. Never a Divine Name. ── /build 84 ── */

export const SOREG84 = Object.freeze({
  bay: 1.5, post: 0.26, pil: 0.5, H: 1.68, T: 0.2, postH: 1.86, rim: 0.11, side: 0.05,   // (amot: the slab between its posts' faces; 10 טפחים high)
  apex: 6.6, hang: 0.85,   // (the hoist's sheave over the sill; the slab's bottom over the post tops when the crew hooks it)
  g: 19.6,   // (amot/s²: an amah ≈ ½ m)
  payK: 1.35,   // (amot of rope per screen height of finger travel)
  pullA: 1.6,   // (amot/s² of the tag line at full pull)
  bays: 3, parts: 3,
  cands: Object.freeze([Object.freeze([2, 3, 3]), Object.freeze([3, 3, 4]), Object.freeze([3, 4, 4])]),
  kinds: Object.freeze(['diamonds', 'rings', 'tri']),
  he: Object.freeze({ diamonds: 'מעוינים', rings: 'מעוינים וטבעות', tri: 'משולשים' }),
  p: 0.42, bar: 0.05, ring: 0.1, hstep: 0.3,
  jamUp: 0.28, jamKick: 0.55, helpAt: 3,
  tolMax: 0.17, tolMin: 0.05, dampMax: 1.9, dampMin: 0.28, sway0: Object.freeze([0.12, 0.42]), vChip: Object.freeze([1.5, 0.7]), wind: 0.9,
  // ── build 85 ── (the owner, 3.11, on 84's lattice: "צריך יותר תנופה לצדדים שייקח זמן להתאפס על ירוק"; "אם מורידים חזק מדי — שיישבר האריח";
  // "דו־צדדיות שצריך להפוך את האריח"; "התנועתיות של האריח על המתקן — זה או ימין או שמאל — אפשר לשחרר"): the slab swings free on its rope —
  // across the line (x) and toward / away from it (z) — and twists on the hook's swivel (r); it has a dressed face and a plain back, and
  // must go in with the dressed face out; set down hard it breaks. The rope is a winch brake lever: where it is left, it pays out at that speed.
  damp85: Object.freeze([0.95, 0.16]), sway85: Object.freeze([0.3, 0.55]), tolZk: 0.8, tolR: Object.freeze([0.24, 0.09]),
  dampYaw: 0.45, dampYawHeld: 2.6, twist0: Object.freeze([0.25, 0.7]), twistPull: 0.12, windYaw: 0.35, spinK: 1.12, squareK: 2.2,
  flipP: Object.freeze([0.5, 0.6, 0.7]), vBreakK: 1.75, vTol: 0.4, vTolR: 0.7, dampZHeld: 2.2, vDown: 2.6, vUp: 1.3, jamYaw: 0.5,
  // ── build 88 ── (the owner, 3.11: "ככל שהלחיצה של השחקן מתארכת עוצמת המהירות של הירידה גדלה — שיהיה גם מבחן בעדינות"; "כותב לי תיקון טעות גם
  // אם … רגע לפני ההנחה עצרתי והנחתי מאוד בעדינות"): held down, the rope runs out faster the longer he holds (from hold0 of vDown, a full
  // vDown after holdRamp seconds, up to holdMax — past the break); let go, it stops; a new hold starts slow again. A slab that only touches
  // a post's top (slower than vKnock) is set back a little — no knock counted; only a real blow is a knock.
  hold0: 0.12, holdRamp: 1.6, holdMax: 1.8, vKnock: 0.55,
});
/** ── build 88 ── the lowering speed (a multiple of vDown) after holding t seconds */
export const hold88 = (t, c = SOREG84) => (t > 0 ? Math.min(c.holdMax, c.hold0 + (1 - c.hold0) * (t / c.holdRamp)) : 0);

/* ── build 89 ── (the owner's choice, 3.11 17:07: "מיומנות חדשה בכל קטע" — section 1 and the woven sections felt the same):
 * section 1 — the grip, the swing, the face (as before);
 * section 2 — the slab may come up from the cart UPSIDE DOWN (its carved coping at the bottom): he turns it right way up in its own plane
 *   with two fingers (a mouse's wheel on a computer) before it can go into the grooves;
 * section 3 — GUSTS of wind come and go (the pennant on the crane's head flies a moment before each), and his slabs go in the order
 *   bay 1, bay 3, then bay 2: the last one CLOSES between two set slabs, a tight place (a narrower window to go in).
 * All of it illustration (המחשה). */
export const SOREG89 = Object.freeze({
  upP: Object.freeze([0, 0.7, 0.4]),   // (the chance a slab comes up upside down, by section; never in the first)
  tolU: Object.freeze([0.22, 0.1]), dampRoll: 3.0, dampRollHeld: 4.5, rightK: 1.2, rollCarry: 0.4,
  order: Object.freeze([Object.freeze([1, 2, 3]), Object.freeze([1, 2, 3]), Object.freeze([1, 3, 2])]),
  tightK: 0.55, tightR: 0.6,   // (the closing slab: its window across and toward, and its twist)
  gustEvery: Object.freeze([4.2, 6.6]), gustLen: 1.5, gustK: 2.6, gustWarn: 1.0, gustFirst: 2.6,
});
/* ── build 90 ── (the owner, 3.11 20:51, on 89 with a mouse: "הסיבוב שלו לא דינמי אלא קופץ במלאכותיות מצד למשנהו"): the finger no longer
 * sets the slab's angle; it sets where the slab is being turned to, and the slab follows on its swivel with its own weight — a little behind,
 * a little past, then settling (a spring and a damper). Let go, it keeps the turn it had and slows. And his hand on the slab steadies its
 * swing across as well as toward and away (the sideways drag on the slab now turns it). */
export const SOREG90 = Object.freeze({ kT: 60, cT: 9 });
const TAU = Math.PI * 2;
/** an angle brought to −π…π */
export const wrapPi = (a) => a - TAU * Math.round(a / TAU);
/** the bay his slab i of section k goes into */
export const bay89 = (k, i, c = SOREG89) => c.order[Math.max(0, Math.min(2, k | 0))][Math.max(0, Math.min(2, i | 0))];
/** the gust at time t: { e 0…1 (its strength now), dir ±1, warn (the pennant flies: one comes) } */
export function gust89(gusts, t, c = SOREG89) {
  if (!Array.isArray(gusts) || !gusts.length) return { e: 0, dir: 1, warn: false };
  for (const g of gusts) {
    if (t >= g.t0 && t <= g.t0 + c.gustLen) return { e: Math.sin((Math.PI * (t - g.t0)) / c.gustLen), dir: g.dir, warn: false };
    if (t >= g.t0 - c.gustWarn && t < g.t0) return { e: 0, dir: g.dir, warn: true };
  }
  return { e: 0, dir: 1, warn: false };
}

export const VALUE84 = Object.freeze({ mehudar: 1, kasher: 0.5, tikkun: 0 });
export const Q84 = Object.freeze({ mehudar: 1, kasher: 0.7, tikkun: 0.3 });

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const frac = (v) => v - Math.floor(v);

/** the carved pattern at (X, Y) amot in the section's own coordinates (X to the right as seen from outside, Y up from the sill) → 0 a hole
 *  through the stone, 1 the stone's face, 2 a carved accent (drawn darker) */
export function motif84(kind, X, Y, c = SOREG84) {
  const p = c.p, s2 = Math.SQRT2;
  const u = (X + Y) / p, v = (X - Y) / p;
  const du = Math.abs(u - Math.round(u)) * p / s2, dv = Math.abs(v - Math.round(v)) * p / s2;
  if (kind === 'tri') {
    const h = c.hstep, dh = Math.abs(Y / h - Math.round(Y / h)) * h;
    if (dv < c.bar || dh < c.bar * 0.8) return 1;
    // a small round boss in every other triangle (the ones pointing up): the hand of the pattern
    const cellY = Math.floor(Y / h), xs = X - Y;   // (along the "/" bars)
    const q = frac(xs / p), up = q < 0.5;
    if (up) { const cx = (Math.floor(xs / p) + 0.25) * p + Y, cy = cellY * h + h * 0.36; if (Math.hypot(X - cx, (Y - cy) * 1.2) < c.bar * 1.2) return 2; }
    return 0;
  }
  if (du < c.bar || dv < c.bar) return 1;
  if (kind === 'rings') {
    // a ring in every other hole along the row: the holes' centres are where u and v are both half-integers
    const iu = Math.floor(u), iv = Math.floor(v);
    if ((((iu % 2) + 2) % 2) === 0) {
      const cu = iu + 0.5, cv = iv + 0.5, cx = ((cu + cv) * p) / 2, cy = ((cu - cv) * p) / 2, r = Math.hypot(X - cx, Y - cy);
      if (Math.abs(r - c.ring) < c.bar * 0.7) return 2;
    }
  }
  return 0;
}

/** the slab's face at its own (x, Y): a candidate { off, flip } in bay X0 (its window's left edge in the section) → the pattern there,
 *  with the slab's own rim (top and bottom) and thin side ribs */
export function face84(kind, X0, cand, x, Y, c = SOREG84) {
  if (Y < c.rim || Y > c.H - c.rim || x < c.side || x > c.bay - c.side) return 1;
  const xx = cand && cand.flip ? c.bay - x : x;
  return motif84(kind, X0 + (cand ? cand.off : 0) + xx, Y, c);
}

/** does this slab, as it stands, continue the pattern? — sampled over its face against the right one (≥ 97 % alike) */
export function fits84(kind, X0, cand, c = SOREG84, n = 28) {
  let same = 0, all = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = c.side + ((i + 0.5) / n) * (c.bay - 2 * c.side), Y = c.rim + ((j + 0.5) / n) * (c.H - 2 * c.rim);
    const a = face84(kind, X0, cand, x, Y, c) > 0, b = face84(kind, X0, { off: 0, flip: false }, x, Y, c) > 0;
    all++; if (a === b) same++;
  }
  return same / all >= 0.97;
}

/** bay j's window in its section (the anchor slab j 0, his slabs 1…3): its left edge in pattern X */
export const bayX84 = (j, c = SOREG84) => j * (c.bay + c.post);

/** the slab's difficulty 0…1: its place among the nine (section k, slab i) and his level in the family */
export function diff84(k, i, L = 1, c = SOREG84) { const n = k * c.bays + i, N = c.parts * c.bays - 1; return clamp(n / N * 0.8 + (clamp(L | 0, 1, 4) - 1) * 0.1, 0, 1); }

/** one slab's set-up: the section's kind, its candidates on the cart (one right; the rest a wrong phase; in the third section any may
 *  stand back to front) and the hoist's numbers by its difficulty */
export function slab84(k, i, L = 1, rnd = Math.random, c = SOREG84) {
  const kind = c.kinds[clamp(k, 0, 2)], d = diff84(k, i, L, c), bay = bay89(k, i), X0 = bayX84(bay, c);   // ── build 89 ── (section 3: bays 1, 3, 2)
  const nC = c.cands[clamp(k, 0, 2)][clamp(i, 0, 2)] + (L >= 3 && i === 2 ? 1 : 0);
  const offs = kind === 'rings' ? [c.p, c.p * 0.5, c.p * 1.5] : kind === 'tri' ? [c.p * 0.5, c.p * 0.25, c.p * 0.75] : [c.p * 0.5, c.p * 0.25, c.p * 0.75];
  const out = [{ off: 0, flip: !(k === 0 && i === 0 && L <= 1) && rnd() < c.flipP[clamp(k, 0, 2)], right: true }];   // ── build 85 ── (any kind: its plain back may come out first)
  for (let t = 0, q = 0; out.length < nC && t < 40; t++, q++) {
    const cand = { off: offs[q % offs.length] + (q >= offs.length ? c.p : 0), flip: rnd() < 0.5, right: false };
    // (never a wrong one that would fit either way round)
    if (fits84(kind, X0, cand, c, 14) || fits84(kind, X0, { ...cand, flip: !cand.flip }, c, 14)) continue;
    out.push(cand);
  }
  // the cart's order: shuffled, but never the right one first at a level above 1 (a look first)
  for (let a = out.length - 1; a > 0; a--) { const b = Math.floor(rnd() * (a + 1)); [out[a], out[b]] = [out[b], out[a]]; }
  if ((L > 1 || k > 0) && out.length > 1 && out[0].right) { [out[0], out[1]] = [out[1], out[0]]; }
  const spec = {
    k, i, kind, X0, d, cands: out,
    tol: +lerp(c.tolMax, c.tolMin, d).toFixed(3), damp: +lerp(c.damp85[0], c.damp85[1], d).toFixed(3),
    sway0: +lerp(c.sway85[0], c.sway85[1], d).toFixed(3) * (rnd() < 0.5 ? -1 : 1), vChip: +lerp(c.vChip[0], c.vChip[1], d).toFixed(3),
    swayZ0: +(lerp(c.sway85[0], c.sway85[1], d) * 0.6).toFixed(3) * (rnd() < 0.5 ? -1 : 1), twist0: +lerp(c.twist0[0], c.twist0[1], d).toFixed(3) * (rnd() < 0.5 ? -1 : 1),
    tolZ: +(lerp(c.tolMax, c.tolMin, d) * c.tolZk).toFixed(3), tolR: +lerp(c.tolR[0], c.tolR[1], d).toFixed(3), vBreak: +(lerp(c.vChip[0], c.vChip[1], d) * c.vBreakK).toFixed(3),
    wind: k >= 2 || d > 0.62 ? +(c.wind * (0.6 + 0.4 * d)).toFixed(3) : 0, ghost: k === 0 && i === 0 && L <= 1,
  };
  // ── build 89 ── (drawn after the rest: the earlier numbers stay as they were for the same seed)
  const C9 = SOREG89, kk = clamp(k, 0, 2);
  spec.bay = bay; spec.tolU = +lerp(C9.tolU[0], C9.tolU[1], d).toFixed(3);
  spec.upside = kk > 0 && rnd() < C9.upP[kk];
  spec.u0 = spec.upside ? +(Math.PI + (rnd() - 0.5) * 0.5).toFixed(3) : 0;
  spec.gusts = [];
  if (kk === 2) { let t = C9.gustFirst; for (let n = 0; n < 40; n++) { spec.gusts.push({ t0: +t.toFixed(2), dir: rnd() < 0.5 ? -1 : 1 }); t += C9.gustLen + lerp(C9.gustEvery[0], C9.gustEvery[1], rnd()); } if (!spec.wind) spec.wind = +(c.wind * 0.6).toFixed(3); }
  spec.closing = kk === 2 && clamp(i, 0, 2) === 2;
  if (spec.closing) { spec.tol = +(spec.tol * C9.tightK).toFixed(3); spec.tolZ = +(spec.tolZ * C9.tightK).toFixed(3); spec.tolR = +(spec.tolR * C9.tightR).toFixed(3); }
  return spec;
}

/** THE HOIST (build 85): the slab on its rope under the sheave. step(dt, pay, pull, held): pay — amot of rope let out this frame (− hauls
 *  in); pull — the tag line, a number (across) or { x, z } (across, and away from him), −1…1; held — his hand on the tag line (it steadies the
 *  twist). A pendulum about the sheave in two directions (its length the rope's), damped, the wind's gusts; the slab twists on the hook's
 *  swivel (r: 0 its dressed face out, π its plain back out). Over the posts' tops it enters the grooves only straight over them in both
 *  directions and square to them (r within tolR of 0 or π), else it knocks and swings (a jam); in the grooves it slides straight down; on
 *  the sill, its speed decides a clean seat, a chipped edge, or a broken slab. turn(): the crew gives it a half-turn's spin on the swivel
 *  (it spins on until his hand catches it). Events: 'jam', 'enter', 'leave', 'seat' (with chip, back), 'break'. */
export function createHoist84(spec, c = SOREG84) {
  const top = c.postH + c.hang;
  const s = { ph: 'hang', yb: top, x: spec.sway0 || 0, vx: 0, z: spec.swayZ0 || 0, vz: 0, r: (spec.r0 || 0) + (spec.twist0 || 0), vr: 0, t: 0, jams: 0, chip: false, broken: false, back: false, vLand: 0, help: false, ev: [],
    u: Number.isFinite(spec.u0) ? spec.u0 : 0, vu: 0, gust: { e: 0, dir: 1, warn: false } };   // ── build 89 ── (u: the slab turned in its own plane — 0 right way up, π upside down; the gust now)
  const C9 = SOREG89, tolU = () => (Number.isFinite(spec.tolU) ? spec.tolU : 9), upright = () => Math.abs(wrapPi(s.u)) <= tolU();
  const L = () => Math.max(0.4, c.apex - (s.yb + c.H));
  const tolZ = () => (Number.isFinite(spec.tolZ) ? spec.tolZ : spec.tol), tolR = () => (Number.isFinite(spec.tolR) ? spec.tolR : 9);
  /** the twist off square (0…π/2) and which face is out */
  const sq = () => { const k = Math.round(s.r / Math.PI); return { off: Math.abs(s.r - k * Math.PI), back: ((k % 2) + 2) % 2 === 1 }; };
  const aligned = () => Math.abs(s.x) <= spec.tol && Math.abs(s.z) <= tolZ() && sq().off <= tolR() && Math.hypot(s.vx, s.vz) <= c.vTol && Math.abs(s.vr) <= c.vTolR && upright() && Math.abs(s.vu) <= c.vTolR;   // ── build 89 ── (and right way up, not turning)   // (and still: a slab swinging through the middle knocks the grooves' edges)
  function step(dt, pay = 0, pull = 0, held = false) {
    s.ev = []; if (s.ph === 'seated' || s.ph === 'broken' || !(dt > 0)) return s;
    s.t += dt;
    const px = typeof pull === 'number' ? pull : (pull && pull.x) || 0, pz = typeof pull === 'number' ? 0 : (pull && pull.z) || 0;
    const vNow = pay / dt; s.v = (s.v || 0) + (vNow - (s.v || 0)) * Math.min(1, dt / 0.09);
    if (s.ph === 'hang') {
      const y1 = Math.min(top, s.yb - pay);
      // the swing in two directions and the twist (a few sub-steps: the short rope at the top swings fast)
      const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n, damp = s.help ? Math.max(spec.damp, 3.2) : spec.damp, dr = held || s.help ? c.dampYawHeld : c.dampYaw, w = L();
      for (let q = 0; q < n; q++) {
        const tt = s.t + q * h, G9 = gust89(spec.gusts, tt), gx = (spec.wind ? spec.wind * (Math.sin(tt * 0.9) * 0.7 + Math.sin(tt * 2.3 + 1) * 0.3) : 0) + (G9.e ? G9.e * G9.dir * C9.gustK * (spec.wind || 0.6) : 0), gz = spec.wind ? spec.wind * 0.6 * Math.sin(tt * 0.7 + 2) + (G9.e ? G9.e * 0.5 * C9.gustK * spec.wind : 0) : 0;   // ── build 89 ── (the gusts)
        const ax = -(c.g / w) * s.x - (held ? Math.max(damp, c.dampZHeld) : damp) * s.vx + clamp(px, -1, 1) * c.pullA + gx;   // ── build 90 ── (held: steadied across too)
        const az = -(c.g / w) * s.z - (held ? Math.max(damp, c.dampZHeld) : damp) * s.vz + clamp(pz, -1, 1) * c.pullA + gz;   // ── build 86 ── (his hand on the stone steadies its swing toward and away)
        const sqr = (held || s.help) && s.rT == null ? -c.squareK * (s.r - Math.round(s.r / Math.PI) * Math.PI) : 0;   // (his hand on the line squares it to the nearer face: past a half-turn, the other one)
        const ar = -dr * s.vr + sqr + clamp(px, -1, 1) * c.twistPull + (spec.wind ? c.windYaw * spec.wind * Math.sin(tt * 0.5 + 0.7) : 0) + (s.rT != null ? SOREG90.kT * (s.rT - s.r) - SOREG90.cT * s.vr : 0);   // ── build 90 ── (turned by his finger: it follows, with its weight)
        s.vx += ax * h; s.x += s.vx * h; s.vz += az * h; s.z += s.vz * h; s.vr += ar * h; s.r += s.vr * h;
        // ── build 89 ── the turn in its own plane: free on the sling, slowed by its friction (more with his hand on it); the crew (after three knocks) rights it
        s.vu += (-(held || s.help ? C9.dampRollHeld : C9.dampRoll) * s.vu + (s.help ? -C9.rightK * 3 * wrapPi(s.u) : 0)) * h; if (!s.rollF) s.u += s.vu * h;   // (while his fingers turn it, it follows them only)
      }
      s.gust = gust89(spec.gusts, s.t); s.rollF = false;
      if (s.yb > c.postH && y1 <= c.postH) {
        if (aligned()) { s.ph = 'groove'; s.yb = Math.min(y1, c.postH - 0.001); s.ev.push('enter'); }
        else if (!(s.v > c.vKnock) && Number.isFinite(c.vKnock)) { s.yb = c.postH + 0.04; s.vx += Math.sign(s.x || 1) * c.jamKick * 0.2; s.v = 0; s.ev.push('touch'); }   // ── build 88 ── (a gentle touch on the post's top: no knock)
        else { s.jams++; s.yb = c.postH + c.jamUp; s.vx += Math.sign(s.x || 1) * c.jamKick; s.vz += Math.sign(s.z || 1) * c.jamKick * 0.6; s.vr += Math.sign((s.r - Math.round(s.r / Math.PI) * Math.PI) || 1) * c.jamYaw; if (!upright()) s.vu += Math.sign(wrapPi(s.u) || 1) * c.jamYaw * 0.6; s.v = 0; s.ev.push('jam'); if (s.jams >= c.helpAt) s.help = true; }
      } else s.yb = y1;
      return s;
    }
    if (s.ph === 'groove') {
      const k = Math.min(1, dt * 14); s.x += (0 - s.x) * k; s.vx = 0; s.z += (0 - s.z) * k; s.vz = 0; const r0 = Math.round(s.r / Math.PI) * Math.PI; s.r += (r0 - s.r) * k; s.vr = 0; s.u -= wrapPi(s.u) * k; s.vu = 0; s.rT = null;   // ── build 89 ── (the grooves hold it square and upright)
      if (s.yb - pay >= c.postH) { s.ph = 'hang'; s.yb = c.postH + 0.01; s.ev.push('leave'); return s; }   // (hauled back up out of the grooves: a look at the seam, and back)
      const y1 = s.yb - pay;
      if (y1 <= 0) {
        s.yb = 0; s.vLand = Math.max(0, s.v); s.back = sq().back;
        if (Number.isFinite(spec.vBreak) && s.vLand > spec.vBreak) { s.ph = 'broken'; s.broken = true; s.ev.push('break'); }
        else { s.ph = 'seated'; s.chip = s.vLand > spec.vChip; s.ev.push('seat'); }
      } else s.yb = y1;
    }
    return s;
  }
  /** the crew's half-turn on the swivel: a spin that carries it about π if nothing stops it (his hand on the line slows it sooner) */
  function turn(dir = 0, k = 1) { if (s.ph !== 'hang') return false; const d = dir ? Math.sign(dir) : s.vr < -0.05 ? -1 : 1; s.vr += d * Math.PI * c.dampYaw * c.spinK * clamp(k, 0.4, 1.6); return true; }   // ── build 86 ── (either way: his swipe's direction; its strength)
  /** ── build 87 ── (the owner, 3.11: "האריח לא מסתובב 360 — רק ימינה ושמאלה"): his finger turns it directly, all the way round and on;
   *  let go, it keeps the spin it had (and the swivel's friction slows it) */
  function twistBy(dr, dt) { if (s.ph !== 'hang' || !Number.isFinite(dr)) return false; if (s.rT == null) s.rT = s.r; s.rT += dr; return true; }   // ── build 90 ── (where it is being turned to; it follows in step())
  /** ── build 90 ── his finger lifted: the slab keeps the turn it had */
  function twistEnd() { s.rT = null; }
  /** ── build 89 ── his two fingers (or the mouse's wheel) turn it in its own plane; let go, it keeps a little of the turn */
  function rollBy(du, dt) { if (s.ph !== 'hang' || !Number.isFinite(du)) return false; s.u += du; s.rollF = true; if (dt > 0) s.vu += ((du / dt) * C9.rollCarry - s.vu) * Math.min(1, dt / 0.08); return true; }
  return { step, turn, twistBy, twistEnd, rollBy, upright, state: () => s, L, top, aligned, sq };
}

/** one slab's result: { right, jams, chip } → { rating, v (האבנים שלך), q } — the wrong slab seated is a failed act (0: the crew sets the
 *  right one); three jams and the crew steadied it (0); a jam or two, or a chipped edge — כשר; clean — מהודר */
export function slabQ84(r) {
  const br = r.breaks | 0;   // ── build 85 ── (a slab broken on the sill: the next one at most כשר; two broken — 0)
  const rating = !r.right || r.back || r.jams >= SOREG84.helpAt || br >= 2 ? 'tikkun' : r.jams > 0 || r.chip || br ? 'kasher' : 'mehudar';
  return { rating, v: VALUE84[rating], q: Q84[rating] };
}

/** a section's grade from its three slabs → q 0…1 (the mean) */
export const partQ84 = (items) => (items.length ? Math.round((items.reduce((a, r) => a + Q84[r.rating], 0) / items.length) * 1000) / 1000 : 0);

/** the score in the world: the items [[part, i, v], …] → their sum (halves kept) */
export const yours84 = (items) => (Array.isArray(items) ? items.reduce((a, q) => a + (Number(q && q[2]) || 0), 0) : 0);
/** the sum as he reads it: 4, 4½ */
export const yoursHe84 = (n) => { const w = Math.floor(n + 1e-9), h = n - w > 0.25; return h ? (w ? `${w}½` : '½') : String(w); };

/* ── THE WARNING STONES ── */
export const WARN84 = Object.freeze({ pace: 1.5, n: 4, gaps: Object.freeze([5, 6, 7]), cad: 0.55, cadHeavy: 0.82, demoCad: 0.62 });

/** the run's set-up: the gap in paces (the same for all: equal distances) and what each stone shows — footprints, the count, the weight */
export function warn84(L = 1, rnd = Math.random, c = WARN84) {
  const lv = clamp(L | 0, 1, 4), gap = c.gaps[Math.floor(rnd() * c.gaps.length)] + (lv >= 3 ? 1 : 0);
  const stones = Array.from({ length: c.n }, (_, i) => ({
    prints: i === 0 && lv <= 2, count: lv <= 1 ? i <= 1 : lv <= 2 ? i === 0 : false, heavy: i === c.n - 1, cad: i === c.n - 1 ? c.cadHeavy : c.cad,
  }));
  return { gap, stones, L: lv };
}

/** the paces: he walks a whole pace at a time (held: one after another; let go: the pace under way ends); a step back; set the stone */
export function createPaces84(spec, c = WARN84) {
  const s = { i: 0, n: 0, t: 0, walking: 0, hold: false, err: [], placed: [], done: false, ev: [] };
  const cad = () => (spec.stones[s.i] ? spec.stones[s.i].cad : c.cad);
  function step(dt, hold) {
    s.ev = []; s.hold = !!hold; if (s.done) return s;
    if (s.walking) { s.t += dt; if (s.t >= cad()) { s.n += s.walking; s.t = 0; s.ev.push(s.walking > 0 ? 'pace' : 'back'); s.walking = 0; } }
    if (!s.walking && s.hold) { s.walking = 1; s.t = 0; }
    return s;
  }
  function back() { if (s.done || s.walking || s.n <= 0) return false; s.walking = -1; s.t = 0; return true; }
  /** the pace under way as a fraction (for the figure between paces) */
  const at = () => s.n + (s.walking ? (s.walking * Math.min(1, s.t / cad())) : 0);
  function set() {
    if (s.done || s.walking || s.n <= 0) return null;
    const e = s.n - spec.gap, a = Math.abs(e), rating = a === 0 ? 'mehudar' : a === 1 ? 'kasher' : 'tikkun';
    const r = { i: s.i, paces: s.n, err: e, rating, v: VALUE84[rating], moved: a >= 2 };
    s.err.push(e); s.placed.push(r); s.i++; s.n = 0; s.t = 0;
    if (s.i >= spec.stones.length) s.done = true;
    return r;
  }
  const q = () => partQ84(s.placed);
  return { step, back, set, at, q, state: () => s, cad };
}

/* ── THE WARNING STONES, build 85 (the owner, 3.11, on 84's paces: "לא הבנתי מה המשחק. אני צועד ולא מבין מה אני אמור לעשות"): by EYE, not
 * by count. The master builder sets the first two stones — the gap between them is the measure; he sets each next stone the same distance
 * from the one before, both gaps in sight side by side; then the measuring cord is laid on his gap and shows how far off. Held: he walks
 * with the stone's crew behind him; let go: he stops — the heavy last stone keeps them going a little (its weight), so let go early. Each
 * stone a harder look: the camera turns along the line (the gaps foreshortened), the tolerance tightens. ── */
export const WARN85 = Object.freeze({ pace: 1.5, n: 3, gaps: Object.freeze([5, 6, 7]), v: 2.2, vHeavy: 1.5, acc: 9, accHeavy: 1.3, vBack: 1.6 /* ── build 88 ── (1.2: back a little quicker) */,
  tolM: Object.freeze([0.07, 0.05, 0.04]), tolK: 2.6, lvTol: 0.1, view: Object.freeze([0, 0.15, 0.25]) });
/** the run: the measure G (amot) and each stone's tolerance (מהודר within tolM of G; כשר within tolK times that), weight and view angle */
export function warn85(L = 1, rnd = Math.random, c = WARN85) {
  const lv = clamp(L | 0, 1, 4), G = (c.gaps[Math.floor(rnd() * c.gaps.length)] + (lv >= 3 ? 1 : 0)) * c.pace, k = 1 - (lv - 1) * c.lvTol;
  const stones = Array.from({ length: c.n }, (_, i) => ({ tolM: +(G * c.tolM[i] * k).toFixed(3), tolK: +(G * c.tolM[i] * k * c.tolK).toFixed(3), heavy: i === c.n - 1, yaw: c.view[i] }));
  return { G, stones, L: lv };
}
/** his walk from the stone before (x: amot along the line): step(dt, fwd, back); set() only when he has stopped; the heavy stone glides */
export function createWalk85(spec, c = WARN85) {
  const s = { i: 0, x: 0, v: 0, err: [], placed: [], done: false, ev: [] };
  const cur = () => spec.stones[Math.min(s.i, spec.stones.length - 1)];
  function step(dt, fwd, back) {
    s.ev = []; if (s.done || !(dt > 0)) return s;
    const hv = cur().heavy, vt = fwd ? (hv ? c.vHeavy : c.v) : back ? -c.vBack : 0, a = hv ? c.accHeavy : c.acc, v0 = s.v;
    s.v += clamp(vt - s.v, -a * dt, a * dt); s.x += s.v * dt; if (s.x < 0) { s.x = 0; s.v = Math.max(0, s.v); }
    if (Math.abs(v0) > 0.05 && Math.abs(s.v) <= 0.05) s.ev.push('stop');
    return s;
  }
  const stopped = () => Math.abs(s.v) <= 0.05;
  function set() {
    if (s.done || !stopped() || s.x < 0.5) return null;
    const st = cur(), e = s.x - spec.G, a = Math.abs(e), rating = a <= st.tolM ? 'mehudar' : a <= st.tolK ? 'kasher' : 'tikkun';
    const r = { i: s.i, x: s.x, err: +e.toFixed(3), rating, v: VALUE84[rating], moved: rating === 'tikkun' };
    s.err.push(r.err); s.placed.push(r); s.i++; s.x = 0; s.v = 0;
    if (s.i >= spec.stones.length) s.done = true;
    return r;
  }
  const q = () => partQ84(s.placed);
  return { step, set, stopped, q, cur, state: () => s };
}

/* ── THE THIRTEEN BOWS: with the procession, on its beat (not graded — a moment; "together" counted) ── */
export const BOW84 = Object.freeze({ n: 13, gapX: 2.6, walk: 4.6, bowT: 1.05, win: 0.4 });
/** was his bow with theirs? his swipe's time against the procession's bow's start */
export const together84 = (tHis, tTheirs, c = BOW84) => Number.isFinite(tHis) && Number.isFinite(tTheirs) && tHis >= tTheirs - c.win && tHis <= tTheirs + c.bowT;
