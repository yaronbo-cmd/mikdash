/* ── build 138 ── h138/teivah-model.js — stage 15 "קודש הקדשים", work 1 "האומן בתיבה" (spec docs/specs/shlav-15-he.md v4, עבודה 1).
 * Pure and deterministic (rule 56: nothing random). The player's kohen is lowered in a box through a lul (Middot 4:5, "שלא יזונו
 * עיניהן"); through a hand-size opening he sees only the gold patch before the box (0.35 × 0.35 amah). A raised lip in the gold
 * (ריקוע) is NEVER drawn: the only information is the bend of the flexible wooden tool (12° × the lip's height near its tip).
 *   · a lip = a polyline on the wall (2–6 points, a height 0…1 at each), sampled every 0.01 amah; two crossing lips have an order
 *     (top / bottom): the tool bends by the top one only;
 *   · a PASS = one continuous drag, from touch to lift or until the tip leaves the lip, covering ≥ 60% of a segment's length, along it
 *     (≤ 20°) and slow (≤ 140 dp/s): the whole segment's height halves. Under 2° of bend the lip "snaps" flat (height 0);
 *   · across (> 45°) or fast (> 260 dp/s) over a raised lip's core = a CREASE (damage, kept); rubbing a sound place more than three
 *     drags = a SCRATCH (damage, kept) — "מתקנין מה שצריך בלבד";
 *   · the box turns slowly on its rope (illustration: the rope twists) — the patch, and the lip with it, wander; the pole pressed to the
 *     wall stops it and stays; a cross or fast pass knocks it loose;
 *   · level 3: the last lip is in the corner; the tool reaches its far half only with the box turned 45°, and then the opening faces the
 *     room: with the shutter open the view is black and the tool stops; with the shutter closed he works by the bend alone.
 * Units: amah on the wall, seconds; speeds in dp/s (the 640 × 360 screen; the opening's 0.35 amah = 216 dp → K dp per amah). */
export const TV = Object.freeze({
  K: 617,            // dp per amah on the wall (0.35 amah fills 60% of 360 dp)
  PATCH: 0.35,       // the patch seen through the opening
  REACH: 0.17,       // the tool's tip reaches ±0.17 amah from the opening's centre
  R: 0.04,           // the bend reads the lip within 0.04 amah of the tip
  CORE: 0.45,        // "over the lip" = within 45% of R (the crease zone); the outer ring only warns
  BEND: 12,          // degrees at height 1
  SNAP: 2,           // degrees: under it the lip is flat
  ALONG: 20, ACROSS: 45, SLOW: 140, FAST: 260, MOVE: 30,
  PROBE: 60,         // dp/s: probing INTO a lip slower than this is safe (build 138 prototype: a child feels for it; tune)
  COVER: 0.6,        // a pass covers ≥ 60% of a segment
  RUB: 3,            // a sound place rubbed more than 3 drags = a scratch
  CELL: 0.04,
  TURN: 45,          // the corner's turn (degrees)
  FACE: 20,          // past 20° of turn the opening faces the room
  DIST: 0.8,         // the opening is 0.8 amah from the wall
});
const DEG = Math.PI / 180;

/** the levels (spec "טבלת הרמות"): stations = one defect each (the box goes down to it by itself); heights; the rope's turn */
const L1 = { wall: 'north', spin: 1, poleNeed: false, stations: [
  { lips: [{ pts: [[-0.12, -0.02], [0.12, 0.03]], h: [1, 1] }] },
  { lips: [{ pts: [[-0.03, -0.13], [0.02, 0.12]], h: [1, 0.9] }] },
  { lips: [{ pts: [[-0.12, 0.09], [0.11, -0.07]], h: [0.95, 1] }] },
] };
const L2 = { wall: 'west', spin: 4, poleNeed: true, stations: [
  { lips: [{ pts: [[-0.13, 0.05], [0.12, 0.0]], h: [0.62, 0.66] }] },
  { lips: [{ pts: [[-0.13, -0.1], [-0.05, -0.02], [0.02, -0.03], [0.07, 0.05], [0.1, 0.13]], h: [0.6, 0.7, 0.66, 0.6, 0.55] }] },   // long and turning
  { lips: [{ pts: [[0.03, -0.13], [-0.02, 0.12]], h: [0.55, 0.62] }] },
  { lips: [{ pts: [[-0.12, -0.08], [0.0, 0.0], [0.12, -0.06]], h: [0.6, 0.66, 0.6] }] },
] };
const L3 = { wall: 'south', spin: 4, poleNeed: true, stations: [
  { lips: [{ pts: [[-0.12, 0.02], [0.12, -0.04]], h: [0.55, 0.6] }] },
  { lips: [{ pts: [[-0.06, -0.13], [0.0, -0.02], [-0.04, 0.12]], h: [0.58, 0.62, 0.55] }] },
  { lips: [{ pts: [[-0.13, -0.11], [-0.04, -0.06], [0.05, -0.07], [0.12, 0.02], [0.08, 0.12]], h: [0.5, 0.6, 0.6, 0.55, 0.5] }] },
  { lips: [{ pts: [[-0.12, 0.08], [0.12, 0.1]], h: [0.6, 0.6] }] },
  // the corner: two crossing lips; their near ends (x < 0.12) can be felt with the opening still on the wall, their far halves only turned
  { corner: true, lips: [
    { pts: [[-0.02, -0.06], [0.14, -0.02], [0.3, 0.03]], h: [0.55, 0.62, 0.6], top: true },
    { pts: [[0.02, 0.07], [0.15, 0.0], [0.29, -0.07]], h: [0.55, 0.6, 0.55] },
  ] },
] };
export const LEVELS = Object.freeze({ 1: L1, 2: L2, 3: L3 });

function sampleLip(l, i) {
  const S = [];
  for (let s = 0; s < l.pts.length - 1; s++) {
    const [ax, ay] = l.pts[s], [bx, by] = l.pts[s + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(L / 0.01));
    for (let j = 0; j < n; j++) { const t = j / n; S.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t, h: l.h[s] + (l.h[s + 1] - l.h[s]) * t, seg: s }); }
  }
  const e = l.pts[l.pts.length - 1]; S.push({ x: e[0], y: e[1], h: l.h[l.h.length - 1], seg: l.pts.length - 2 });
  const dirs = []; for (let s = 0; s < l.pts.length - 1; s++) { const [ax, ay] = l.pts[s], [bx, by] = l.pts[s + 1]; dirs.push(Math.atan2(by - ay, bx - ax)); }
  return { i, top: !!l.top, s: S, dirs, nseg: l.pts.length - 1, fixed: false, creased: false };
}
export function fresh(lv) {
  const P = LEVELS[lv] || L1;
  return {
    lv, wall: P.wall, spin: P.spin, poleNeed: P.poleNeed, k: 0, n: P.stations.length,
    st: null, t: 0, theta: 0, phase: 0, pole: false, poleUsed: false, shutter: 0, turn: 0,
    tip: { x: 0, y: 0 }, bend: 0, bendTop: 0, drag: null, nDrags: 0, free: true,
    creases: [], scratches: [], rub: {}, grades: [], done: false, rising: false, rose: false, stopped: false, early: false,
    stationLog: null,
  };
}
export function enter(S) {
  const P = LEVELS[S.lv] || L1, D = P.stations[S.k];
  S.st = { corner: !!D.corner, lips: D.lips.map(sampleLip) };
  S.theta = 0; S.pole = false; S.turn = 0; S.tip = startTip(S.st); S.rub = {}; S.bend = 0;
  S.stationLog = { crease: 0, scratch: 0, sloppy: 0 };
  return S;
}
/** where the tool rests when the box arrives: the reachable place farthest from every lip (never on one) */
function startTip(st) {
  let best = { x: 0, y: -0.14 }, bd = -1;
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const p = { x: i * 0.04, y: j * 0.035 }; let d = 9;
    for (const l of st.lips) for (const q of l.s) d = Math.min(d, Math.hypot(q.x - p.x, q.y - p.y));
    if (d > bd + 1e-9) { bd = d; best = p; }
  }
  return best;
}
/** the opening's centre on the wall (amah): the rope's turn and, at the corner, the box's turn */
export function viewC(S) { return { x: TV.DIST * Math.tan(S.theta * DEG) + (S.turn / TV.TURN) * TV.REACH, y: 0 }; }
export const facesRoom = (S) => !!(S.st && S.st.corner && S.turn > TV.FACE);
export const blind = (S) => facesRoom(S) || S.shutter > 0.5;
export const toolStopped = (S) => facesRoom(S) && S.shutter < 0.5;
const ang = (a, b) => { let d = Math.abs(a - b) % Math.PI; if (d > Math.PI / 2) d = Math.PI - d; return d / DEG; };

/** the bend the tip feels: 12° × the height near it (the top lip first), smooth from the ring's edge to the core */
export function feel(S, p) {
  const lips = S.st.lips; let best = 0, who = null, core = false;
  const tops = lips.filter((l) => l.top && !l.fixed);
  const nearTop = tops.some((l) => l.s.some((q) => q.h > 0.01 && Math.hypot(q.x - p.x, q.y - p.y) < TV.R));
  for (const l of lips) {
    if (l.fixed) continue; if (nearTop && !l.top) continue;
    for (const q of l.s) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d >= TV.R || q.h <= 0) continue; const f = q.h * (1 - (d / TV.R) * (d / TV.R)); if (f > best) { best = f; who = l; core = d < TV.R * TV.CORE; } }
  }
  return { deg: TV.BEND * best, lip: who, core, h: best };
}
/**
 * one step. input: { tool: { down, dx, dy } (the handle's drag this frame, dp), pole: 'pin' | 'free' | null, turn: degrees | null,
 *   shutter: 0…1 | null, rise: bool } → events [{ e, … }]
 */
export function step(S, dt, inp = {}) {
  const E = []; if (S.done || !S.st) return E;
  S.t += dt;
  if (inp.rise) { S.early = true; S.done = true; E.push({ e: 'rise', early: true }); return E; }
  if (inp.pole === 'pin' && !S.pole) { S.pole = true; S.poleUsed = true; E.push({ e: 'pole' }); }
  if (inp.pole === 'free' && S.pole) { S.pole = false; E.push({ e: 'pole-off' }); }
  if (inp.shutter != null) { const was = S.shutter > 0.5; S.shutter = Math.max(0, Math.min(1, inp.shutter)); if ((S.shutter > 0.5) !== was) E.push({ e: S.shutter > 0.5 ? 'shut' : 'open' }); }
  if (inp.turn != null && S.st.corner) S.turn = Math.max(0, Math.min(TV.TURN, inp.turn));
  // the rope's twist (illustration): a slow swing; the pole stops it
  if (!S.pole) { S.phase += dt; const w = S.spin * Math.sin(0.35 * S.phase); S.theta += w * dt; }
  // the tool
  const T = inp.tool || {};
  const vc = viewC(S);
  if (T.down && !S.drag) { S.drag = { len: 0, cover: new Map(), cells: new Set(), creased: new Set(), lastOn: S.t, free: S.nDrags === 0 }; S.nDrags++; }
  if (!T.down && S.drag) E.push(...endPass(S));
  if (T.down && S.drag && !toolStopped(S)) {
    const ddx = (T.dx || 0) / TV.K, ddy = -(T.dy || 0) / TV.K;
    const nx = Math.max(-TV.REACH, Math.min(TV.REACH, S.tip.x + ddx)), ny = Math.max(-TV.REACH, Math.min(TV.REACH, S.tip.y + ddy));
    const mx = nx - S.tip.x, my = ny - S.tip.y, md = Math.hypot(mx, my); S.tip.x = nx; S.tip.y = ny;
    const v = dt > 0 ? (md * TV.K) / dt : 0, dir = Math.atan2(my, mx);
    const p = { x: vc.x + S.tip.x, y: vc.y + S.tip.y };
    const f = feel(S, p);
    if (f.lip) S.drag.lastOn = S.t;
    if (md > 0 && v > TV.MOVE * 0.5) {
      if (f.lip && f.h > 0) {
        // along or across the lip under the tip (the nearest sample's segment)
        // the angle to the lip: the best of the segments within reach of the tip (a turn's two segments both count)
        let a = 90; for (const q of f.lip.s) { if (Math.hypot(q.x - p.x, q.y - p.y) < TV.R) a = Math.min(a, ang(dir, f.lip.dirs[q.seg])); }
        if (f.core && ((a > TV.ACROSS && v > TV.PROBE) || v > TV.FAST) && !S.drag.creased.has(f.lip.i)) {
          S.drag.creased.add(f.lip.i);
          if (!S.drag.free) { S.creases.push({ x: p.x, y: p.y, k: S.k }); S.stationLog.crease++; E.push({ e: 'crease', at: { ...p } }); }
          else E.push({ e: 'crease-free', at: { ...p } });
          if (S.pole) { S.pole = false; E.push({ e: 'pole-off', knocked: true }); }
        } else if (a <= TV.ALONG && v <= TV.SLOW) {
          // covered: every sample of the lip under the tip's reach counts for its segment (and a covered BOTTOM sample under an unfixed top = crease)
          for (const l of S.st.lips) { if (l.fixed) continue; for (let j = 0; j < l.s.length; j++) { const q = l.s[j]; if (Math.hypot(q.x - p.x, q.y - p.y) < TV.R * 0.6) { const key = l.i + ':' + j; S.drag.cover.set(key, 1); } } }
        } else if (a > TV.ALONG && a <= TV.ACROSS && f.core && v > TV.MOVE) { S.stationLog.sloppy = Math.max(S.stationLog.sloppy, 1); }
        if (v > TV.FAST && S.pole && f.core) { S.pole = false; E.push({ e: 'pole-off', knocked: true }); }
      } else {
        // a sound place: count the drag once in its cell
        const c = Math.round(p.x / TV.CELL) + ',' + Math.round(p.y / TV.CELL);
        if (v > TV.MOVE && !S.drag.cells.has(c)) { S.drag.cells.add(c); S.rub[c] = (S.rub[c] | 0) + 1; if (S.rub[c] === TV.RUB) E.push({ e: 'worn', at: { ...p } }); if (S.rub[c] === TV.RUB + 1 && !S.drag.free) { S.scratches.push({ x: p.x, y: p.y, k: S.k }); S.stationLog.scratch++; E.push({ e: 'scratch', at: { ...p } }); } }
      }
    }
    S.drag.len += md;
    if (S.drag && S.t - S.drag.lastOn > 0.15 && S.drag.cover.size) E.push(...endPass(S, true));
  }
  // the bend (shown on the handle): what the tip feels now, eased with one small shiver when it leaves the lip
  const f2 = feel(S, { x: vc.x + S.tip.x, y: vc.y + S.tip.y });
  const was = S.bend; S.bend += (f2.deg - S.bend) * Math.min(1, dt * 14);
  if (was < 0.6 && f2.deg >= 0.6) E.push({ e: 'tick' });
  S.feel = f2;
  return E;
}
function endPass(S, keep) {
  const E = []; const D = S.drag; if (!D) return E;
  if (D.cover.size) {
    for (const l of S.st.lips) {
      if (l.fixed) continue;
      const tops = S.st.lips.filter((o) => o !== l && o.top && !o.fixed);
      for (let s = 0; s < l.nseg; s++) {
        const idx = []; for (let j = 0; j < l.s.length; j++) if (l.s[j].seg === s) idx.push(j);
        const c = idx.filter((j) => D.cover.has(l.i + ':' + j)).length;
        if (c / idx.length < TV.COVER) continue;
        // a bottom lip pressed where an unfixed top lies over it: a crease (fix the top first)
        if (!l.top && tops.length && idx.some((j) => D.cover.has(l.i + ':' + j) && tops.some((o) => o.s.some((q) => q.h > 0.01 && Math.hypot(q.x - l.s[j].x, q.y - l.s[j].y) < TV.R * 0.7)))) {
          if (!D.free) { const q = l.s[idx[idx.length >> 1]]; S.creases.push({ x: q.x, y: q.y, k: S.k }); S.stationLog.crease++; E.push({ e: 'crease', at: { x: q.x, y: q.y }, under: true }); }
          continue;
        }
        for (const j of idx) l.s[j].h *= 0.5;
        E.push({ e: 'pass', lip: l.i, seg: s });
      }
      if (Math.max(...l.s.map((q) => q.h)) * TV.BEND < TV.SNAP) { for (const q of l.s) q.h = 0; l.fixed = true; E.push({ e: 'snap', lip: l.i }); }
    }
  }
  S.drag = keep ? { len: 0, cover: new Map(), cells: new Set(), creased: D.creased, lastOn: S.t, free: D.free } : null;
  if (S.st.lips.every((l) => l.fixed)) {
    const L = S.stationLog, g = L.crease ? 'ok' : L.scratch || L.sloppy ? 'good' : 'gold';
    S.grades.push(g); E.push({ e: 'station', grade: g, k: S.k });
    S.drag = null;
    if (S.k + 1 >= S.n) { S.done = true; E.push({ e: 'rise' }); } else { S.k++; enter(S); E.push({ e: 'next', k: S.k }); }
  }
  return E;
}
/** the result: stars by the base (steps × 40 × the level's multiplier) and the damage */
export function result(S, mul) {
  const pts = S.grades.reduce((a, g) => a + (g === 'gold' ? 40 : g === 'good' ? 20 : 10), 0) * mul;
  const base = S.n * 40 * mul, q = base ? pts / base : 0, dmg = S.creases.length + S.scratches.length;
  const stars = S.early && S.grades.length < S.n ? (S.grades.length ? 1 : 0) : q >= 0.85 && !dmg ? 3 : q >= 0.65 ? 2 : 1;
  return { stars, q, pts, dmg, perfect: stars === 3 };
}
