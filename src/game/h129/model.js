/* ── build 129 ── h129/model.js — stage 07 "הלשכות" (spec docs/specs/shlav-07-he.md, approved 14.11; brief docs/specs/build129-brief.md
 * §2, §10). Pure: no three.js, no DOM. The acts, the world, the bot and the tests share every rule here.
 *
 *   H129 · LINES · QUICK · LOSS · lossPts · applyLoss · starsOf · qOf      the constants, the sourced lines, the words, the loss table
 *   Gazit   stoneFresh · stoneStep · corners · seatOf · benchState · testPlan · arcPoly · roomFor · aisles · walkCheck · semichaPlan ·
 *           semichaFresh · semichaSend · gazitPts
 *   Golah   GOLAH_LV · golahFresh · fillStep · pullStep · golahStep · pourStep · flow · troughsDone · golahPts
 *   Vault   VAULT_LV · legFresh · legStep · wedgeFresh · wedgeStep · shoulder · joints · wedgeLoads · vaultPts
 *   Night   slabFresh · slabStep · nightPts
 *   PLAN · createH129(save)   the free-choice face of the director (as h128's): the three stations free, inside each in order,
 *                             the night after the nine; the damages kept in the save (marks) and drawn where they happened
 *
 * Units: amot, seconds. Nothing random at play time (rule 56): every table is fixed; the one choice that changes between plays (which
 * judge leaves in the semicha) is a fixed table read by the save's play count. Every place comes from the book (BOOK.s07).
 */
import { BOOK } from '../world/grid.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const S7 = BOOK.s07, GZ = S7.gazit, GL = S7.golah;

/* ───────── the constants ───────── */
export const H129 = Object.freeze({
  // Gazit: the crew's bars (the stone follows the finger late), a crack's speed, the sight rules, the mats and stands, the walkers
  STONE: Object.freeze({ VMAX: 3, K: 2.2, ACC: 6, CRACK: 1.5 }),
  SEE: Object.freeze({ BLOCK: 0.5, FACE: 100 }),
  MATS: Object.freeze([12, 10, 8]), MAT_D: 1.2, STAND: 1,
  WALK: Object.freeze({ INK: 0.6, SEAT: 0.8, GRID: 0.25 }),
  // Golah (the brief's start values; the pull's windows tuned, see GOLAH)
  ROPE_OFF: 0.9, BUCKET_R: 0.5,
  // Vault and night: see VAULT_LV and SLAB
  LOSS: 20, LOSS_BIG: 40,
});

/* ───────── the lines (brief §11: copied from the spec's table and nowhere else) ───────── */
export const LINES = Object.freeze({
  sanh3: 'סנהדרין היתה כחצי גרן עגלה, כדי שיהו רואין זה את זה. ושני סופרי הדינין עומדין לפניהם, אחד מימין ואחד משמאל, וכותבין דברי המזכין ודברי המחיבין (סנהדרין ד, ג)',
  sanh4: 'ושלש שורות של תלמידי חכמים יושבין לפניהם, כל אחד ואחד מכיר את מקומו. היו צריכין לסמך, סומכין מן הראשונה. אחד מן השניה בא לו לראשונה ואחד מן השלישית בא לו לשניה, ובוררין להן עוד אחד מן הקהל ומושיבין אותו בשלישית. ולא היה יושב במקומו של ראשון, אלא יושב במקום הראוי לו (סנהדרין ד, ד)',
  middot54: 'לשכת הגולה, שם היה בור קבוע, והגלגל נתון עליו, ומשם מספיקים מים לכל העזרה. לשכת הגזית, שם היתה סנהדרי גדולה של ישראל יושבת (מידות ה, ד)',
  middot18: 'בית המוקד, כפה, ובית גדול היה, מקף רובדין של אבן, וזקני בית אב ישנים שם, ומפתחות העזרה בידם, ופרחי כהנה, איש כסתו בארץ (מידות א, ח)',
  middot19: 'ומקום היה שם, אמה על אמה, וטבלא של שיש וטבעת היתה קבועה בה, ושלשלת שהמפתחות היו תלויות בה. הגיע זמן הנעילה, הגביה את הטבלא בטבעת ונטל את המפתחות מן השלשלת, ונעל הכהן מבפנים, ובן לוי ישן לו מבחוץ. גמר מלנעל, החזיר את המפתחות לשלשלת ואת הטבלא למקומה, נתן כסותו עליה, ישן לו (מידות א, ט)',
  night: 'כך ייראה הלילה בבית המוקד (המחשה)',
  // (the Golah's own words of the same mishnah, for its station and its look sample)
  golah: 'לשכת הגולה, שם היה בור קבוע, והגלגל נתון עליו, ומשם מספיקים מים לכל העזרה (מידות ה, ד)',
});
/** the quick words (rule 64), per station (brief §4–§6) */
export const QUICK = Object.freeze({
  sees: 'רואה!', allSee: 'כולם רואים!', room: 'יש מקום!', writes: 'כותב!', seated: 'במקומו!',
  beat: 'בקצב!', passed: 'חלפו!', dry: 'בלי טיפה!', full: 'מלאה!',
  holds: 'מחזיק!', out: 'יצא!', stands: 'עומדת!',
});
/** the loss table (brief §10): label and points (vault.stone: 20 in the small arches, 40 in the great vault — lossPts) */
export const LOSS = Object.freeze({
  'gazit.crack': ['אבן ספסל סדוקה', 20], 'gazit.ink': ['כתם דיו שנשפך', 20],
  'golah.bucket': ['דלי סדוק שמטפטף', 20], 'golah.rim': ['אבן שבורה בפי הבור', 20], 'golah.flood': ['כתם מים משוקת שעלתה על גדותיה', 20],
  'vault.crack': ['סדק בתקרה מתפר שנפתח', 20], 'vault.stone': ['אבן קשת שנפלה', 20], 'night.slab': ['פינה סדוקה בטבלת השיש', 20],
});
/** the points a damage costs in a work (the great vault's fallen stone costs twice) */
export const lossPts = (flag, work) => (flag === 'vault.stone' && work === 'vaultM' ? H129.LOSS_BIG : LOSS[flag] ? LOSS[flag][1] : 0);
/** the score after a loss: never below zero */
export const applyLoss = (score, pts) => Math.max(0, (score | 0) - Math.max(0, pts | 0));

/* ───────── grades (the one system: 40 / 20 / 10; any damage caps the work at 10) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
const grade = (dmg, clean) => ((dmg | 0) > 0 ? 10 : clean ? 40 : 20);

/* ═════════════════ station 1: לשכת הגזית ═════════════════ */
const ROOM = { x0: GZ.in[0], z0: GZ.in[1], x1: GZ.in[2], z1: GZ.in[3] }, HOLY = GZ.holy;
const DEG = Math.PI / 180;
/** a bench stone: centre (x, z), its long axis' angle a (radians from +x toward +z), length and depth; its inner face looks along
 *  n = (sin a, −cos a) — at a = 0 north, toward the holy line */
export function stoneFresh(i) { return { i, x: GZ.row0.xs[i], z: GZ.row0.z, a: 0, L: GZ.row0.L, D: GZ.row0.D, s: 0, crack: 0 }; }
export const row0 = () => GZ.row0.xs.map((_, i) => stoneFresh(i));
const axis = (s) => [Math.cos(s.a), Math.sin(s.a)];
export const normalOf = (s) => [Math.sin(s.a), -Math.cos(s.a)];
/** a stone's (or a mat's) four corners */
export function corners(s) {
  const [ux, uz] = axis(s), nx = Math.sin(s.a), nz = -Math.cos(s.a), l = s.L / 2, d = s.D / 2;
  return [[s.x - ux * l - nx * d, s.z - uz * l - nz * d], [s.x + ux * l - nx * d, s.z + uz * l - nz * d], [s.x + ux * l + nx * d, s.z + uz * l + nz * d], [s.x - ux * l + nx * d, s.z - uz * l + nz * d]];
}
/** its two ends' middles: −1 the end at −axis, +1 the other */
export const endOf = (s, e) => { const [ux, uz] = axis(s); return [s.x + e * ux * s.L / 2, s.z + e * uz * s.L / 2]; };
/** the judge's seat on a stone: its middle */
export const seatOf = (s) => [s.x, s.z];
const inRoom = (p, m = 0) => p[0] >= ROOM.x0 + m && p[0] <= ROOM.x1 - m && p[1] >= ROOM.z0 + m && p[1] <= ROOM.z1 - m;
/** two rectangles (corner lists) overlap (separating axes) */
export function overlap(A, B) {
  for (const P of [A, B]) for (let i = 0; i < 4; i++) {
    const p = P[i], q = P[(i + 1) % 4], ax = -(q[1] - p[1]), az = q[0] - p[0];
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const c of A) { const v = c[0] * ax + c[1] * az; a0 = Math.min(a0, v); a1 = Math.max(a1, v); }
    for (const c of B) { const v = c[0] * ax + c[1] * az; b0 = Math.min(b0, v); b1 = Math.max(b1, v); }
    if (a1 <= b0 + 1e-9 || b1 <= a0 + 1e-9) return false;
  }
  return true;
}
const blockedPose = (s, others) => corners(s).some((c) => !inRoom(c)) || others.some((o) => o !== s && o.i !== s.i && overlap(corners(s), corners(o)));
/**
 * one step of a bench stone under the finger (dt s). finger: { grip: 'mid' | -1 | +1 (an end), x, z } or null. The crew pushes it
 * with bars: the gripped point (the middle, or the end — the other end stays) follows at a speed that goes toward
 * min(VMAX, K × distance) with the crew's acceleration ACC. A stone stops at the room's walls and at other stones; hitting at more
 * than CRACK amot/s cracks a corner (once per stone). Returns events: 'bump' | 'crack'.
 */
export function stoneStep(st, finger, dt, others = []) {
  const C = H129.STONE, ev = [];
  if (!finger) { st.s = 0; return ev; }
  const P = finger.grip === 'mid' ? [st.x, st.z] : endOf(st, finger.grip), dx = finger.x - P[0], dz = finger.z - P[1], d = Math.hypot(dx, dz);
  const want = Math.min(C.VMAX, C.K * d);
  st.s = want < st.s ? want : Math.min(want, st.s + C.ACC * dt);
  const step = Math.min(d, st.s * dt); if (step <= 1e-9) return ev;
  const nP = [P[0] + (dx / d) * step, P[1] + (dz / d) * step], next = { ...st };
  if (finger.grip === 'mid') { next.x = nP[0]; next.z = nP[1]; } else {
    const e = finger.grip, Q = endOf(st, -e), vx = nP[0] - Q[0], vz = nP[1] - Q[1], l = Math.hypot(vx, vz) || 1;
    // (the pivot end stays; the gripped end swings round it, the stone keeps its length)
    next.a = Math.atan2(e * vz / l, e * vx / l); next.x = Q[0] + e * Math.cos(next.a) * st.L / 2; next.z = Q[1] + e * Math.sin(next.a) * st.L / 2;
  }
  if (blockedPose(next, others)) {
    if (st.s > C.CRACK && !st.crack) { st.crack = 1; ev.push('crack'); } else ev.push('bump');
    st.s = 0; return ev;
  }
  st.x = next.x; st.z = next.z; st.a = next.a; return ev;
}
/** a point's distance to a segment */
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? clamp(((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vz);
}
/** a stone wholly in the chol half and inside the room */
export const legalStone = (s) => corners(s).every((c) => c[1] >= HOLY && inRoom(c));
/** the bench: per stone legal; per judge pair sees[i][j] — the line from seat i to seat j passes no other seated judge closer than
 *  BLOCK, and j lies within FACE degrees of seat i's facing. A stone over the holy line has no judge (he stands beside it). */
export function benchState(stones) {
  const n = stones.length, legal = stones.map(legalStone), seat = stones.map(seatOf), sees = [];
  const cosF = Math.cos(H129.SEE.FACE * DEG);
  for (let i = 0; i < n; i++) {
    sees.push([]);
    for (let j = 0; j < n; j++) {
      if (i === j) { sees[i].push(true); continue; }
      if (!legal[i] || !legal[j]) { sees[i].push(false); continue; }
      const nn = normalOf(stones[i]), dx = seat[j][0] - seat[i][0], dz = seat[j][1] - seat[i][1], l = Math.hypot(dx, dz) || 1;
      let ok = (nn[0] * dx + nn[1] * dz) / l >= cosF - 1e-9;
      for (let k = 0; ok && k < n; k++) if (k !== i && k !== j && legal[k] && segDist(seat[k], seat[i], seat[j]) < H129.SEE.BLOCK) ok = false;
      sees[i].push(ok);
    }
  }
  const allSee = legal.every(Boolean) && sees.every((r) => r.every(Boolean));
  return { legal, seat, sees, allSee };
}
/** the live test: three raisers (the west end, the east end, the middle) and, for each, who turns at once and who leans and searches */
export function testPlan(stones) {
  const B = benchState(stones), by = stones.map((s, i) => i).sort((a, b) => stones[a].x - stones[b].x);
  const raisers = [by[0], by[by.length - 1], by[(by.length - 1) >> 1]];
  const rounds = raisers.map((r) => {
    const turns = [], leans = [];
    stones.forEach((_, j) => { if (j === r || !B.legal[j]) return; (B.sees[j][r] ? turns : leans).push(j); });
    return { r, turns, leans };
  });
  return { raisers, rounds, standing: B.legal.map((l, i) => (l ? -1 : i)).filter((i) => i >= 0), pass: B.allSee };
}
/** the arc: the polygon of the stones' inner faces (west to east) closed by the holy line */
export function arcPoly(stones) {
  const S = stones.slice().sort((a, b) => a.x - b.x), P = [];
  for (const s of S) { const c = corners(s), f = [c[0], c[1]].sort((a, b) => a[0] - b[0]); P.push(f[0], f[1]); }
  return [[P[0][0], HOLY], ...P, [P[P.length - 1][0], HOLY]];
}
export function inPoly(p, P) {
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
/** a mat (row 0, 1, 2: 12, 10, 8 long) or a scribe's stand (1 × 1) as a rectangle */
export const matOf = (k, x, z, a = 0) => ({ k, x, z, a, L: H129.MATS[k], D: H129.MAT_D });
export const standOf = (side, x, z) => ({ side, x, z, a: 0, L: H129.STAND, D: H129.STAND });
/** the students' seats on a mat: one an amah apart along it, index 0 the head (the −axis end) */
export function matSeats(m) { const [ux, uz] = axis(m), n = Math.round(m.L); return Array.from({ length: n }, (_, q) => { const o = -m.L / 2 + 0.5 + q; return [m.x + ux * o, m.z + uz * o]; }); }
/**
 * room for the students and the scribes: each mat wholly inside the arc, in the chol half, on no stone, mat or stand; each scribe's
 * stand one west and one east of the middle stone, inside the room and the chol half, on nothing, with a free line to all seven
 * judges (no other judge within BLOCK of the line). → { ok, mats: [{ inside, free }], stands: [{ side, ok, sees }] }
 */
export function roomFor(stones, mats, stands) {
  const poly = arcPoly(stones), mid = stones.slice().sort((a, b) => a.x - b.x)[(stones.length - 1) >> 1], seat = stones.map(seatOf);
  const rects = [...stones.map(corners), ...mats.map(corners), ...stands.map(corners)];
  const R = mats.map((m, i) => {
    const c = corners(m), inside = c.every((p) => p[1] >= HOLY && inPoly(p, poly)), mine = stones.length + i;
    return { k: m.k, inside, free: !rects.some((r, q) => q !== mine && overlap(c, r)) };
  });
  const T = stands.map((s, i) => {
    const c = corners(s), mine = stones.length + mats.length + i;
    const side = s.x < mid.x ? 'W' : 'E', place = c.every((p) => p[1] >= HOLY && inRoom(p)) && !rects.some((r, q) => q !== mine && overlap(c, r));
    const sees = seat.map((p, j) => seat.every((o, k) => k === j || segDist(o, [s.x, s.z], p) >= H129.SEE.BLOCK));
    return { side, ok: place && sees.every(Boolean), sees };
  });
  const sides = new Set(T.filter((t) => t.ok).map((t) => t.side));
  const ok = mats.length === 3 && R.every((r) => r.inside && r.free) && stands.length === 2 && T.every((t) => t.ok) && sides.has('W') && sides.has('E');
  return { ok, mats: R, stands: T, poly };
}
/* the walkers (gazit3): a path drawn on the floor. layout: { stones, mats (all sat on), stands, free: [{ id, x, z }] } */
/** walk a path: he stops at the edge of a mat people sit on (stays standing: a mistake, no damage); passing within INK of a scribe's
 *  stand spills the ink there (the stain stays: gazit.ink); a path that ends within SEAT of a free place seats him there.
 *  → { end: [x, z], stopped, ink: [x, z] | null, seat: id | null } */
export function walkCheck(path, layout, who) {
  const W = H129.WALK, mats = (layout.mats || []).map(corners), stones = (layout.stones || []).map(corners), stands = layout.stands || [];
  const inRect = (p, c) => { let s = 0; for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], v = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); if (i === 0) s = Math.sign(v); else if (Math.sign(v) !== s && v !== 0) return false; } return true; };
  const pts = []; for (let i = 0; i + 1 < path.length; i++) { const a = path[i], b = path[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.1)); for (let q = 0; q < n; q++) pts.push([a[0] + ((b[0] - a[0]) * q) / n, a[1] + ((b[1] - a[1]) * q) / n]); }
  if (path.length) pts.push(path[path.length - 1]);
  const last = pts[pts.length - 1] || [0, 0];
  let end = pts[0] || last, stopped = false, ink = null;
  for (const p of pts) {
    const nearEnd = Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.9;
    if (mats.some((c) => inRect(p, c)) && !nearEnd) { stopped = true; break; }
    if (stones.some((c) => inRect(p, c)) && !nearEnd) { stopped = true; break; }
    if (!ink) for (const s of stands) if (Math.hypot(p[0] - s.x, p[1] - s.z) < W.INK + H129.STAND / 2) { ink = [s.x + (p[0] - s.x) * 0.5, s.z + (p[1] - s.z) * 0.5]; break; }
    end = p;
  }
  let seat = null;
  if (!stopped) { let best = W.SEAT; for (const f of layout.free || []) { const d = Math.hypot(f.x - end[0], f.z - end[1]); if (d <= best) { best = d; seat = f.id; } } }
  return { who, end, stopped, ink, seat };
}
/** the aisles: from the crowd's place at the door, which free places a walker can reach without stepping on a mat that people sit on,
 *  on a stone or by a stand (a grid of GRID amot over the chol half). → { reach(x, z) → bool, ids: [free ids reachable] } */
export function aisles(layout) {
  const g = H129.WALK.GRID, x0 = ROOM.x0, z0 = HOLY, nx = Math.ceil((ROOM.x1 - x0) / g), nz = Math.ceil((ROOM.z1 - z0) / g);
  const blocks = [...(layout.mats || []), ...(layout.stones || [])].map(corners), stands = layout.stands || [];
  const inR = (p, c) => { let s = 0; for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4], v = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); if (i === 0) s = Math.sign(v); else if (Math.sign(v) !== s && v !== 0) return false; } return true; };
  const free = new Uint8Array(nx * nz);
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const p = [x0 + (i + 0.5) * g, z0 + (j + 0.5) * g];
    free[j * nx + i] = blocks.some((c) => inR(p, c)) || stands.some((s) => Math.hypot(p[0] - s.x, p[1] - s.z) < H129.WALK.INK + H129.STAND / 2) ? 0 : 1;
  }
  const cell = (x, z) => [clamp(Math.floor((x - x0) / g), 0, nx - 1), clamp(Math.floor((z - z0) / g), 0, nz - 1)];
  const seen = new Uint8Array(nx * nz), q = [];
  const [ci, cj] = cell(GZ.crowd[0], GZ.crowd[1]); if (free[cj * nx + ci]) { seen[cj * nx + ci] = 1; q.push(cj * nx + ci); }
  while (q.length) { const c = q.shift(), i = c % nx, j = (c / nx) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= nx || b >= nz) continue; const k = b * nx + a; if (free[k] && !seen[k]) { seen[k] = 1; q.push(k); } } }
  // a free place is reached when a reached cell lies within SEAT of it (he steps the last bit onto the mat's end or the bench)
  const reach = (x, z) => { const r = H129.WALK.SEAT, [a0, b0] = cell(x - r, z - r), [a1, b1] = cell(x + r, z + r); for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) if (seen[b * nx + a] && Math.hypot(x0 + (a + 0.5) * g - x, z0 + (b + 0.5) * g - z) <= r) return true; return false; };
  return { reach, ids: (layout.free || []).filter((f) => reach(f.x, f.z)).map((f) => f.id) };
}
/** which judge leaves in the semicha: a fixed table read by the play count (never the same twice running, the table's wrap too) */
export const LEAVE = Object.freeze([3, 0, 6, 2, 5, 1, 4]);
/** the semicha (Sanhedrin 4:4): the judge who leaves and the four moves in order. Each row moves up one place by itself, so its free
 *  place is at its end ("במקום הראוי לו"): the head of row 1 to the empty seat on the bench; the head of row 2 to the end of row 1; the
 *  head of row 3 to the end of row 2; one of the crowd at the door to the end of row 3. */
export function semichaPlan(save) {
  const n = save && save.plays ? save.plays.gazit3 | 0 : 0, leave = LEAVE[n % LEAVE.length];
  return { leave, moves: [{ who: 'row0:head', to: 'bench:' + leave }, { who: 'row1:head', to: 'row0:end' }, { who: 'row2:head', to: 'row1:end' }, { who: 'crowd', to: 'row2:end' }] };
}
/** the semicha's state: which places are free now (the leaver's seat at the start) */
export function semichaFresh(plan) { return { plan, k: 0, free: new Set([plan.moves[0].to]), seated: [], standing: [], moved: [] }; }
/** send move k along a path (walkCheck's result r): he sits only if his place is free when he arrives; else he stays standing where his
 *  path ends (a mistake, no damage). A seated move frees the place he left (his row moves up: its end is free) */
export function semichaSend(S, k, r) {
  const m = S.plan.moves[k]; if (!m || S.moved.includes(k)) return { ok: false, why: 'done' };
  const ok = !r.stopped && r.seat === m.to && S.free.has(m.to);
  if (ok) {
    S.free.delete(m.to); S.seated.push(k); S.moved.push(k);
    const nxt = S.plan.moves[k + 1]; if (nxt) S.free.add(nxt.to);
    if (S.k === k) S.k++;
    return { ok: true };
  }
  S.standing.push({ k, at: r.end }); return { ok: false, why: r.stopped ? 'mat' : S.free.has(m.to) ? 'far' : 'notFree' };
}
/** a Gazit work's points: no damage and no failed test / standing man → 40; no damage → 20; damage → 10 */
export const gazitPts = (r) => grade(r.dmg, !r.fails && !r.standing);

/* ═════════════════ station 2: לשכת הגולה ═════════════════ */
/** the levels: the water's depth (amot below the floor, from the book) and the troughs in use with their sizes (units of one full bucket) */
export const GOLAH_LV = Object.freeze({
  golah1: Object.freeze({ depth: GL.depth[0], troughs: Object.freeze({ A: 2.0 }) }),
  golah2: Object.freeze({ depth: GL.depth[1], troughs: Object.freeze({ A: 1.5, C: 2.5 }) }),
  golah3: Object.freeze({ depth: GL.depth[2], troughs: Object.freeze({ A: 1.0, B: 2.0, C: 1.5 }) }),
});
/** the swing and the water (the brief's start values; CALM/PERFECT/FEED tuned so the two windows do not overlap: a pull is judged by
 *  the nearer of the swing's middle and its end) */
export const GOLAH = Object.freeze({
  FILL: 0.5, W0: 0.3, LIFT: 1.5, LIFT_F: 0.5, HANG: 5, T0: 0.9, TL: 0.045, A0: 0.3, A_F: 0.5,
  // (tuned: with the brief's FEED_K 0.25 and a 2 s decay a fed swing levels off near 0.5 and never reaches the wall; 0.45 and 3 s let
  //  a swing fed at its ends grow to the wall in a few pulls, and a left-alone swing of 0.8 is under 0.11 in six seconds)
  CALM: 0.12, CALM_K: 0.75, PERFECT: 0.06, FEED: 0.1, FEED_K: 0.45, TAU: 3,
  KNOCK: 1.1, KNOCK_SPILL: 0.15, KNOCK_K: 0.7, CRACK: 1.3, DRIP: 0.02, MEET: 0.5, CLASH: 0.8, CLASH_SPILL: 0.2, CLASH_CRACK: 1.2, CLASH_K: 0.6,
  RIM: 0.5, STOP: 0.2,
  POUR_T: 3, RUN: 6, OUT: 1.2, OVER: 0.1, DONE: 0.9, POOL_OUT: 1,
});
/** the channel's lengths (amot along it) from the head trough: each spur's mouth and the spur's own length, from the book */
export const CHANNEL = (() => {
  const M = GL.channel.main, seg = [], spur = {};
  let d = 0; for (let i = 0; i + 1 < M.length; i++) { const L = Math.hypot(M[i + 1][0] - M[i][0], M[i + 1][1] - M[i][1]); seg.push([d, d + L, M[i], M[i + 1]]); d += L; }
  const total = d;
  for (const k of Object.keys(GL.sluice)) {
    const s = GL.sluice[k]; let at = 0;
    for (const [a, , p, q] of seg) { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), t = ((s[0] - p[0]) * (q[0] - p[0]) + (s[1] - p[1]) * (q[1] - p[1])) / (L * L); if (t >= -1e-9 && t <= 1 + 1e-9 && segDist(s, p, q) < 1e-6) { at = a + t * L; break; } }
    const sp = GL.channel.spurs.find((r) => r[0] === s[0]); spur[k] = { at, len: sp ? Math.abs(sp[2] - sp[1]) : 0 };
  }
  return Object.freeze({ total, spur: Object.freeze(spur), order: Object.freeze(Object.keys(spur).sort((a, b) => spur[a].at - spur[b].at)) });
})();
const periodOf = (y) => GOLAH.T0 + GOLAH.TL * (y + GOLAH.HANG);
/** the Golah's state for a level: the bucket in the water (b: 0 or 1, the two alternate), its fill f, its depth y (amot below the
 *  floor), the swing (amplitude A amot sideways, phase ph), the troughs, the channel */
export function golahFresh(id = 'golah1') {
  const L = GOLAH_LV[id], tr = {};
  for (const k of Object.keys(L.troughs)) tr[k] = { size: L.troughs[k], v: 0, flood: 0 };
  return {
    id, depth: L.depth, t: 0, phase: 'fill', b: 0, f: 0, y: L.depth, A: 0, ph: 0, spilled: 0, met: 0, trip: 0,
    cracked: [0, 0], rim: 0, head: 0, parcels: [], pool: 0, sluice: { A: 0, B: 0, C: 0 }, troughs: tr, dmg: 0, flags: {}, puddles: [],
    knocks: 0, clashes: 0, perfect: 0, streak: 0, stops: 0, done: 0, ev: [],
  };
}
const flag = (s, f, at) => { s.dmg += lossPts(f, s.id); (s.flags[f] = s.flags[f] || []).push(at == null ? 1 : at); s.ev.push({ e: 'loss', f, at }); };
/** fill: a finger held on the rope of the bucket in the water fills it FILL per second (0 … 1); weight = W0 + f */
export function fillStep(s, hold, dt) {
  if (s.phase !== 'fill' || !hold) return s;
  s.f = Math.min(1, s.f + GOLAH.FILL * dt); return s;
}
export const weightOf = (s) => GOLAH.W0 + s.f;
export const periodNow = (s) => periodOf(s.y);
/** the swing's lateral place of the full bucket now (amot) and of the empty one (half as far, the other way) */
export const swingX = (s) => s.A * Math.sin(s.ph);
/** the empty bucket's depth: the rope over one wheel — as the full one rises, the empty one goes down the same */
export const emptyY = (s) => s.depth - s.y;
/**
 * a pull (hand over hand) at the state's time: the full bucket rises LIFT − LIFT_F·f, the empty one goes down the same. The first pull
 * starts the swing (A0 + A_F·f). A pull within CALM·T of the swing's pass through the middle calms it (× CALM_K; within PERFECT·T it
 * is perfect: "בקצב!"); within FEED·T of an end it feeds it (+ FEED_K × weight). → 'perfect' | 'calm' | 'feed' | 'plain'
 */
export function pullStep(s) {
  if (s.phase === 'fill') { if (s.f <= 0) return null; s.phase = 'pull'; s.A = GOLAH.A0 + GOLAH.A_F * s.f; s.ph = 0; s.spilled = 0; s.met = 0; s.meetDue = 0; s.trip++; }
  if (s.phase !== 'pull') return null;
  const T = periodOf(s.y), w = (2 * Math.PI) / T;
  const m = (((s.ph % Math.PI) + Math.PI) % Math.PI) / w, dMid = Math.min(m, T / 2 - m), dEnd = Math.abs(T / 4 - dMid);
  let kind = 'plain';
  if (dMid <= GOLAH.CALM * T && s.A > 0) { kind = dMid <= GOLAH.PERFECT * T ? 'perfect' : 'calm'; s.A *= GOLAH.CALM_K; }
  // (build 129 G5: a swing that has died — under STOP — has no end to feed: a pull on a still bucket is plain. Before, a last pull that
  //  came a moment late on a bucket left to go still fed it from nothing, +0.585 at a full bucket, and the rim stone broke: unfair)
  else if (dEnd <= GOLAH.FEED * T && s.A >= GOLAH.STOP) { kind = 'feed'; s.A += GOLAH.FEED_K * weightOf(s); if (s.A > GOLAH.KNOCK) knock(s); }   // (fed at the end: thrown into the wall now)
  if (kind === 'perfect') { s.perfect++; s.streak++; } else s.streak = 0;
  const y0 = s.y; s.y = Math.max(0, s.y - (GOLAH.LIFT - GOLAH.LIFT_F * s.f));
  // (build 129, part 3: a pull lifts the bucket a whole step at once, so it may jump over the meeting's window: a pull that carries the
  //  full bucket past the empty one is the meeting, judged at the next moment of the swing)
  if (!s.met && (y0 - s.depth / 2) * (s.y - s.depth / 2) <= 0) s.meetDue = 1;
  s.ev.push({ e: 'pull', kind });
  if (s.y <= 0) arrive(s);
  return kind;
}
function arrive(s) {
  s.phase = 'rim'; s.y = 0;
  if (s.A > GOLAH.RIM && !s.rim) { s.rim = 1; flag(s, 'golah.rim', s.b); }
  else if (s.A < GOLAH.STOP && s.spilled <= 0) { s.stops++; s.ev.push({ e: 'dry' }); }
  s.ev.push({ e: 'rim', A: s.A });
}
/** time passes (dt s): the swing (dies in about six seconds left alone), the knocks on the shaft's wall, the meeting, the drip of a
 *  cracked bucket, the pour and the water in the channel */
export function golahStep(s, dt) {
  s.ev = s.ev || []; s.t += dt;
  if (s.phase === 'pull' || s.phase === 'rim') {
    const T = periodOf(s.y), c0 = Math.cos(s.ph); s.ph += (2 * Math.PI * dt) / T; s.A *= Math.exp(-dt / GOLAH.TAU);
    if (s.phase === 'pull') {
      if (s.A > GOLAH.KNOCK && c0 * Math.cos(s.ph) <= 0) knock(s);   // (at an end of the swing)
      if (!s.met && (s.meetDue || Math.abs(s.y - emptyY(s)) < GOLAH.MEET)) {
        s.met = 1; s.meetDue = 0; const sum = s.A * 1.5;   // (the full one's swing and the empty one's, half as far)
        if (sum > GOLAH.CLASH) {
          s.clashes++; spill(s, GOLAH.CLASH_SPILL); s.A *= GOLAH.CLASH_K;
          if (sum > GOLAH.CLASH_CRACK && !s.cracked[s.b]) { s.cracked[s.b] = 1; flag(s, 'golah.bucket', s.b); }
          s.ev.push({ e: 'clash' });
        } else s.ev.push({ e: 'passed' });
      }
    }
    if (s.cracked[s.b] && s.f > 0) spill(s, GOLAH.DRIP * dt, true);
  }
  flow(s, dt);
  return s;
}
function knock(s) {
  s.knocks++; spill(s, GOLAH.KNOCK_SPILL);
  if (s.A > GOLAH.CRACK && !s.cracked[s.b]) { s.cracked[s.b] = 1; flag(s, 'golah.bucket', s.b); }
  s.ev.push({ e: 'knock' }); s.A *= GOLAH.KNOCK_K;
}
function spill(s, k, drip) { const v = Math.min(s.f, k); s.f -= v; if (!drip) s.spilled += v; }
/** the pour at the rim: tilt 0 … 1 (the drag's depth); a full tilt pours f units over POUR_T·f seconds into the head trough. When the
 *  bucket is empty the next trip begins: the other bucket is now in the water. */
export function pourStep(s, tilt, dt) {
  if (s.phase !== 'rim') return 0;
  const v = Math.min(s.f, (clamp(tilt, 0, 1) / GOLAH.POUR_T) * dt); s.f -= v; s.head += v;
  if (s.f <= 1e-6) { s.f = 0; s.phase = 'fill'; s.b = 1 - s.b; s.y = s.depth; s.A = 0; s.ev.push({ e: 'poured' }); }
  return v;
}
/** set a sluice stone: open (raised: its spur takes the water) or closed (lowered: the water goes on) */
export function sluiceSet(s, k, open) { if (k in s.sluice) s.sluice[k] = open ? 1 : 0; }
/**
 * the water (dt s): the head trough lets OUT units/s into the channel; the water runs RUN amot/s; at each spur an open sluice takes all
 * of it into its trough (after the spur's length), a closed one sends it on; past the last spur — every sluice closed — it stands in
 * the channel (the pool: nothing is lost) and goes to the first open sluice when one opens. A trough filled more than OVER past its size
 * overflows (golah.flood once per trough: a puddle and a wet stain stay); a level is done when each of its troughs holds DONE of its size.
 */
export function flow(s, dt) {
  const G = GOLAH, C = CHANNEL;
  const out = Math.min(s.head, G.OUT * dt); if (out > 0) { s.head -= out; s.parcels.push({ d: 0, v: out, to: null }); }
  const open = C.order.filter((k) => s.sluice[k] && s.troughs[k]);
  if (s.pool > 0 && open.length) { const v = Math.min(s.pool, G.POOL_OUT * dt); s.pool -= v; s.parcels.push({ d: C.spur[open[0]].at, v, to: null }); }
  const keep = [];
  for (const p of s.parcels) {
    const d0 = p.d; p.d += G.RUN * dt;
    if (p.to) { if (p.d >= C.spur[p.to].at + C.spur[p.to].len) { into(s, p.to, p.v); continue; } keep.push(p); continue; }
    let taken = false;
    for (const k of C.order) { const at = C.spur[k].at; if (d0 <= at + 1e-9 && p.d >= at - 1e-9 && s.sluice[k] && s.troughs[k]) { p.to = k; taken = true; if (p.d >= at + C.spur[k].len) into(s, k, p.v); else keep.push(p); break; } }
    if (taken) continue;
    if (p.d >= C.total) { s.pool += p.v; continue; }
    keep.push(p);
  }
  s.parcels = keep;
  if (!s.done && troughsDone(s) && s.head <= 1e-6 && !s.parcels.length) { s.done = 1; s.ev.push({ e: 'done' }); }
  return s;
}
function into(s, k, v) {
  const T = s.troughs[k]; T.v += v;
  const was = T.full; T.full = T.v >= GOLAH.DONE * T.size; if (T.full && !was) s.ev.push({ e: 'full', k });
  if (T.v > T.size + GOLAH.OVER) {
    const x = T.v - (T.size + GOLAH.OVER); T.v -= x; T.spilt = (T.spilt || 0) + x;
    if (!T.flood) { T.flood = 1; s.puddles.push(k); flag(s, 'golah.flood', k); }
  }
}
/** water in the channel now (running and standing), for the look */
export const channelWater = (s) => s.pool + s.parcels.reduce((a, p) => a + p.v, 0);
export const troughsDone = (s) => Object.values(s.troughs).every((T) => T.v >= GOLAH.DONE * T.size);
/** a Golah work's points: no damage and no knock or clash → 40; no damage → 20; damage → 10 */
export const golahPts = (s) => grade(s.dmg, !s.knocks && !s.clashes);

/* ═════════════════ station 3: the arches ═════════════════ */
/** per work: the thrust T0 (units of the small arch's), the weight stones each shoulder needs (M; the rock leg none), the crew's pace
 *  (s per stone), the wedge pairs and their biases (+: toward the left leg), which side is rock (vaultS: the right, the south leg) */
export const VAULT_LV = Object.freeze({
  vaultN: Object.freeze({ T0: 1, M: Object.freeze({ L: 5, R: 5 }), pace: 3, pairs: 1, bias: Object.freeze([0]), rock: null }),
  vaultS: Object.freeze({ T0: 1, M: Object.freeze({ L: 8, R: 0 }), pace: 3, pairs: 2, bias: Object.freeze([0.2, 0.15]), rock: 'R' }),
  vaultM: Object.freeze({ T0: 3, M: Object.freeze({ L: 9, R: 9 }), pace: 1.5, pairs: 4, bias: Object.freeze([0.1, -0.15, 0.2, -0.05]), rock: null }),
});
export const LEG = Object.freeze({ PMAX: 1.4, RUN: 0.15, LIFT: 0.25, HOLD: 0.6, CREEP: 0.35, RATE: 0.5, LIMIT: 0.3, REL: 0.2, SLOW: 0.5 });
/** part A's state: per leg its weight stones m, its displacement x (+ outward), the grip's creep g, the net push, the timers */
export function legFresh(id = 'vaultN') {
  const L = VAULT_LV[id], leg = (side) => ({ side, rock: L.rock === side, m: 0, x: 0, g: 0, p: 0, net: 0, over: 0, under: 0, ran: 0, lifted: 0, rel0: -1, on: 0 });
  return { id, t: 0, L: leg('L'), R: leg('R'), laid: 0, dmg: 0, flags: {}, runs: 0, lifts: 0, perfect: 0, done: 0, ev: [] };
}
export const thrustOf = (S, side) => { const L = VAULT_LV[S.id], g = S[side], M = L.M[side]; return g.rock || !M ? 0 : L.T0 * (1 - 0.8 * Math.min(g.m, M) / M); };
/**
 * part A (dt s). press: { L, R } — each thumb's inward reach on its leg's grip (0 … 1.4 in units of the arch's T0, from how far
 * inward the finger is from the grip; null: the thumb is off). The leg pushes the grip outward under the finger at a rate that
 * follows its thrust, so the thumb's effective press p = reach − creep wanes and the player re-presses, less as the weight goes on. Net
 * push (T − p·T0) outward over RUN·T0 for HOLD s: the leg runs out and the crown sinks (a mistake; past LIMIT a joint opens for good:
 * vault.crack); inward over LIFT·T0 for HOLD s: the crown lifts and a joint opens (the same). When T < REL·T0 on both legs, a slow
 * letting go (over SLOW s at least, no leg moving) is the perfect release ("מחזיק!"). opt.mouse: the crew's prop holds the right leg.
 */
export function legStep(S, press, dt, opt = {}) {
  const V = VAULT_LV[S.id], C = LEG; S.ev = []; if (S.done) return S;
  // (build 129: the centering holds the arch until his thumbs are on: the crew's first stone and the legs' thrust wait for every leg that
  //  needs a hand to be held at once — with a mouse the left one, the crew's prop has the right)
  if (!S.go) { if (['L', 'R'].every((k) => S[k].rock || (opt.mouse && k === 'R') || (press && press[k] != null))) S.go = 1; else return S; }
  S.t += dt;
  // the crew lays a weight stone every pace seconds, the sides in turn (only where the leg needs it)
  const need = ['L', 'R'].filter((k) => !S[k].rock && V.M[k] > 0), want = Math.min(Math.floor(S.t / V.pace), need.reduce((a, k) => a + V.M[k], 0));
  while (S.laid < want) { const k = need.length === 1 ? need[0] : need[S.laid % 2]; if (S[k].m < V.M[k]) S[k].m++; else S[need.find((q) => q !== k)].m++; S.laid++; S.ev.push({ e: 'weight', side: k }); }
  let both = true;
  for (const k of ['L', 'R']) {
    const g = S[k], T = thrustOf(S, k) / V.T0;
    let reach = press ? press[k] : null;
    if (opt.mouse && k === 'R') reach = T + 0.02 + g.g;   // (the crew's prop: always just right)
    if (g.rock) { g.p = 0; g.net = 0; continue; }
    if (reach == null) { g.on = 0; g.g = 0; g.p = 0; } else {
      if (!g.on) { g.on = 1; g.g = 0; }
      g.g += C.CREEP * thrustOf(S, k) * dt;                        // (the leg pushes the grip back under the finger: in the great vault three times as hard)
      g.p = clamp(reach - g.g, 0, C.PMAX);
    }
    g.net = T - g.p;
    if (g.net > C.RUN) { g.over += dt; if (g.over > C.HOLD) { if (!g.ran) { g.ran = 1; S.runs++; S.ev.push({ e: 'run', side: k }); } g.x += (g.net - C.RUN) * C.RATE * dt; } } else { g.over = 0; g.ran = 0; }
    if (g.net < -C.LIFT) { g.under += dt; if (g.under > C.HOLD) { if (!g.lifted) { g.lifted = 1; S.lifts++; S.ev.push({ e: 'lift', side: k }); } g.x -= (-g.net - C.LIFT) * C.RATE * dt; } } else { g.under = 0; g.lifted = 0; }
    if (Math.abs(g.x) > C.LIMIT && !S.flags['vault.crack']) { S.dmg += lossPts('vault.crack', S.id); S.flags['vault.crack'] = [k]; S.ev.push({ e: 'loss', f: 'vault.crack', side: k }); }
    if (T > C.REL + 1e-9) both = false;
  }
  // the release: both legs light enough (T ≤ REL·T0); a press that wanes from its hold to nothing over SLOW s or more on every leg, no
  // leg run or lifted in the part: the perfect release ("מחזיק!"); then the arch holds by itself (the part ends)
  const legs = ['L', 'R'].filter((k) => !S[k].rock && !(opt.mouse && k === 'R'));
  if (both) {
    for (const k of legs) { const g = S[k], T = thrustOf(S, k) / V.T0; if (g.p >= 0.85 * T) g.rel0 = -1; else if (g.rel0 < 0) g.rel0 = S.t; }
    if (legs.every((k) => S[k].p <= 0.02)) {
      const slow = legs.every((k) => S[k].rel0 >= 0 && S.t - S[k].rel0 >= C.SLOW);
      S.done = 1; if (slow && !S.runs && !S.lifts && !S.dmg) { S.perfect = 1; S.ev.push({ e: 'holds' }); } S.ev.push({ e: 'done' });
    }
  }
  return S;
}
/* part B: the wedges. Each pair i has a left and a right wedge; out 0 (in) … 1 (out). The imbalance at pair i = (outL − outR) + bias_i.
 * Over LIGHT the joints by that pair open and show a strip of light; over CRACK the joint stays a crack (vault.crack); over STONE a stone
 * slips and falls on the centering (vault.stone: −20, in vaultM −40), the crew lays a replacement of another shade (the arch settles:
 * the bias drops by SETTLE). The arch never collapses. The cure for light: push the wedge back, touch that shoulder (bias ∓ CURE). */
export const WEDGE = Object.freeze({ STEP: 0.2, LIGHT: 0.35, CRACK: 0.6, STONE: 0.85, CURE: 0.15, SETTLE: 0.5, LOADED: 0.4, JUMP: 0.3, CARRY: 0.12, FREE_AT: 0.6 });
/** vaultM: what holds each wedge (it is loaded until each wedge it names is out FREE_AT or more). Fixed; topological orders exist in
 *  plenty; '1L' and '4R' are free from the start (at least one is always free: the table has no cycle) */
export const LOADS = Object.freeze({ '1L': [], '4R': [], '1R': ['4R'], '4L': ['1L'], '2L': ['1L'], '2R': ['1R'], '3L': ['2L', '4L'], '3R': ['2R', '4R'] });
export function wedgeFresh(id = 'vaultN', legs = null) {
  const V = VAULT_LV[id], P = [];
  // (part A's leftovers: a leg left displaced adds its own imbalance to every pair — zero unless part A left one out)
  const extra = legs ? clamp((legs.L.x || 0) - (legs.R.x || 0), -0.3, 0.3) : 0;
  for (let i = 0; i < V.pairs; i++) P.push({ L: 0, R: 0, bias: V.bias[i] + extra, light: 0, crack: 0, stones: 0 });
  return { id, pairs: P, dmg: 0, flags: {}, lights: 0, jumps: 0, done: 0, ev: [] };
}
const wid = (i, side) => `${i + 1}${side}`;
/** vaultM: free (moves easily: gain 1) or loaded (moves hard and creaks: gain LOADED) for every wedge now */
export function wedgeLoads(S) {
  const out = {};
  for (let i = 0; i < S.pairs.length; i++) for (const side of ['L', 'R']) {
    const id = wid(i, side), need = S.id === 'vaultM' ? LOADS[id] || [] : [];
    out[id] = need.every((q) => { const pi = +q[0] - 1, sd = q[1]; return S.pairs[pi][sd] >= WEDGE.FREE_AT; }) ? 'free' : 'loaded';
  }
  return out;
}
/** the joints now: per pair its imbalance and what the eye sees ('closed' | 'light'), with the cracks and fallen stones so far */
export function joints(S) { return S.pairs.map((p) => { const imb = p.L - p.R + p.bias; return { imb, see: Math.abs(imb) > WEDGE.LIGHT ? 'light' : 'closed', crack: p.crack, stones: p.stones }; }); }
/**
 * a drag on wedge (pair i, side) of dx (+ out, − back in), at most STEP of its way per drag; a loaded wedge moves LOADED as far, carries
 * some of the load to its side (CARRY per full step) and, pulled more than STEP at once, jumps its pair's imbalance (JUMP).
 */
export function wedgeStep(S, i, side, dx) {
  S.ev = []; const p = S.pairs[i]; if (!p || S.done) return S;
  const load = wedgeLoads(S)[wid(i, side)], sg = side === 'L' ? 1 : -1;
  let d = clamp(dx, -WEDGE.STEP, WEDGE.STEP);
  if (load === 'loaded') {
    if (dx > WEDGE.STEP + 1e-9) { p.bias += sg * WEDGE.JUMP; S.jumps++; S.ev.push({ e: 'jump', i, side }); }
    d *= WEDGE.LOADED; if (d > 0) p.bias += sg * WEDGE.CARRY * (d / (WEDGE.STEP * WEDGE.LOADED)); S.ev.push({ e: 'creak', i, side });
  }
  p[side] = clamp(p[side] + d, 0, 1);
  judgeJoint(S, i);
  if (d > 0 && p[side] >= 1 && p[side] - d < 1 && !p.lightNow) S.ev.push({ e: 'out', i, side });   // ("יצא!": out with no light)
  if (S.pairs.every((q) => q.L >= 1 && q.R >= 1)) { S.done = 1; S.ev.push({ e: 'done' }); }
  return S;
}
function judgeJoint(S, i) {
  const p = S.pairs[i], imb = p.L - p.R + p.bias, a = Math.abs(imb);
  const was = p.lightNow; p.lightNow = a > WEDGE.LIGHT ? 1 : 0; if (p.lightNow && !was) { S.lights++; p.light++; S.ev.push({ e: 'light', i }); }
  if (a > WEDGE.CRACK && !p.crack) { p.crack = 1; S.dmg += lossPts('vault.crack', S.id); (S.flags['vault.crack'] = S.flags['vault.crack'] || []).push(i); S.ev.push({ e: 'loss', f: 'vault.crack', i }); }
  if (a > WEDGE.STONE) {
    p.stones++; S.dmg += lossPts('vault.stone', S.id); (S.flags['vault.stone'] = S.flags['vault.stone'] || []).push(i); S.ev.push({ e: 'loss', f: 'vault.stone', i });
    p.bias -= Math.sign(imb) * WEDGE.SETTLE; p.lightNow = Math.abs(p.L - p.R + p.bias) > WEDGE.LIGHT ? 1 : 0;
  }
}
/** the cure: touch the shoulder on the light's side: the crew lays one more weight stone there (the imbalance eases by CURE) */
export function shoulder(S, i, side) {
  S.ev = []; const p = S.pairs[i]; if (!p) return S;
  const sg = side === 'L' ? 1 : -1, imb = p.L - p.R + p.bias;
  if (Math.sign(imb) === sg) { p.bias -= sg * WEDGE.CURE; S.ev.push({ e: 'weight', i, side }); }
  judgeJoint(S, i); return S;
}
/** a vault work's points: no damage, no run, lift, light or jump → 40; no damage → 20; damage → 10 */
export const vaultPts = (A, B) => grade((A ? A.dmg : 0) + (B ? B.dmg : 0), !(A && (A.runs || A.lifts)) && !(B && (B.lights || B.jumps)));

/* ═════════════════ the night: the marble slab ═════════════════ */
/** the slab's lift h (0 down … 1 open against its prop); the thumbs' target; at most VMAX per second toward it (late), with FOLLOW
 *  gain; let go below OPEN while lifting: it falls back with a bang (no damage; an elder lifts his head); lowering, it touches down
 *  faster than SOFT: a corner cracks (night.slab). A slab let go above the floor falls at FALL per second², hard. */
export const SLAB = Object.freeze({ VMAX: 0.5, FOLLOW: 6, OPEN: 0.8, SOFT: 0.35, FALL: 6, TOUCH: 0.01 });
export function slabFresh() { return { h: 0, v: 0, phase: 'lift', bangs: 0, keys: 0, dmg: 0, flags: {}, done: 0, ev: [] }; }
/** dt s; lift: the thumbs' target (may go below 0 when pressed down; null: let go) */
export function slabStep(S, lift, dt) {
  S.ev = []; if (S.done) return S;
  if (S.phase === 'open') { if (lift != null && lift < SLAB.OPEN) S.phase = 'lower'; else return S; }
  const held = lift != null;
  if (held) { const want = clamp((lift - S.h) * SLAB.FOLLOW, -SLAB.VMAX, SLAB.VMAX); S.v = want; }
  else if (S.h > 0) S.v -= SLAB.FALL * dt; else S.v = 0;
  const h0 = S.h; S.h += S.v * dt;
  if (S.phase === 'lift' && S.h >= SLAB.OPEN) { S.h = Math.max(S.h, SLAB.OPEN); S.phase = 'open'; S.keys = 1; S.v = 0; S.ev.push({ e: 'keys' }); return S; }
  if (S.v <= 0 && S.h <= SLAB.TOUCH) {
    S.h = 0; const sp = -S.v; S.v = 0;
    if (h0 > SLAB.TOUCH) {
      if (S.phase === 'lift') { if (!held) { S.bangs++; S.ev.push({ e: 'bang' }); } }
      else { if (sp > SLAB.SOFT && !S.flags['night.slab']) { S.dmg += lossPts('night.slab', 'night'); S.flags['night.slab'] = [1]; S.ev.push({ e: 'loss', f: 'night.slab' }); } S.done = 1; S.ev.push({ e: 'down', soft: sp <= SLAB.SOFT }); }
    }
  }
  return S;
}
export const nightPts = (S) => grade(S.dmg, !S.bangs);

/* ═════════════════ the plan and the save ═════════════════ */
const MISSIONS = () => [
  { k: 'gazit', id: 'gazit1', lv: 1 }, { k: 'gazit', id: 'gazit2', lv: 2 }, { k: 'gazit', id: 'gazit3', lv: 3 },
  { k: 'golah', id: 'golah1', lv: 1 }, { k: 'golah', id: 'golah2', lv: 2 }, { k: 'golah', id: 'golah3', lv: 3 },
  { k: 'vault', id: 'vaultN', lv: 1 }, { k: 'vault', id: 'vaultS', lv: 2 }, { k: 'vault', id: 'vaultM', lv: 3 },
  { k: 'night', id: 'night', lv: 1 },
];
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['gazit', 'golah', 'vault', 'night']);
const PREV = { gazit2: 'gazit1', gazit3: 'gazit2', golah2: 'golah1', golah3: 'golah2', vaultS: 'vaultN', vaultM: 'vaultS' };
export function freshH129() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, i: 0,
    // the damages kept to the eye (rule 55): { f, work, at, n } in the order they happened; the player's own layouts and water
    marks: [], gazit: { stones: null, mats: null, stands: null }, golah: { troughs: {} }, vault: {}, night: {} };
}
export function createH129(save) {
  const st = save && save.v === 1 ? save : freshH129();
  for (const [k, v] of Object.entries(freshH129())) if (st[k] === undefined) st[k] = v;
  if (st.cur && !PLAN.some((m) => m.id === st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || null : null; },
    /** the three stations free among themselves; inside a station in order; the night after the nine */
    canDo(m) {
      if (!m || d(m.id)) return false;
      if (m.id === 'night') return PLAN.filter((x) => x.id !== 'night').every((x) => d(x.id));
      return !PREV[m.id] || d(PREV[m.id]);
    },
    open() { return PLAN.filter((m) => M.canDo(m)); },
    pick(id) { const m = id ? PLAN.find((x) => x.id === id) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    nDone() { return PLAN.filter((m) => d(m.id)).length; },
    count() { return [M.nDone(), PLAN.length]; },
    finished() { return PLAN.every((m) => d(m.id)); },
    levelOf(m) { return m.lv | 0 || 1; },
    /** a damage, kept in the save where it happened; returns its points (the director's X.loss takes them) */
    mark(f, work, at, n = 0) { const p = lossPts(f, work); if (!p) return 0; st.marks.push({ f, work, at: at == null ? null : at, n }); return p; },
    marksOf(f) { return st.marks.filter((x) => !f || x.f === f); },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {} };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      st.cur = null; st.i = st.done.length;
      return null;
    },
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open(), hit = O.find(want); if (hit) return M.pick(hit.id);
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    progress() { return Math.min(1, M.nDone() / PLAN.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
