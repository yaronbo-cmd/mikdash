/* ── build 63 ── site63.js — the building loop of stages 01 and 02 (docs/specs/shlav-alef-olam-he.md §4): site → work → result in the
 * structure → site. After each work the camera pulls back from what he made to the structure (the result shot, 2–3 s); then the site:
 * the works open now (2–5, by the structure's own order — a course after the one under it) are marked on it, and he walks to the one he
 * chooses (a tap on its name, or his own walk to its place). Pure: the order of each stage's works, what is open, the share of the
 * structure by how many works are done. har42.js plays it. Never a Divine Name. ── /build 63 ── */

/** what each work needs done before it (the structure's own order). Stage 01 (PARTS62): the rope first (the plaza's edge measured); then
 *  the south-east corner (the wheel → the corner stone → his two courses) and the crest's three rocks (each rock → its hammer) side by side;
 *  the paving once the crest is down and the fill is level; the great stone and the inscription on the level plaza. Stage 02 (PARTS45):
 *  the line first; the pulley and the first course; the course over it; the giant once the pulley stands and a course is laid; the corner
 *  over the second course; the top course last */
export const DEP63 = Object.freeze({
  har: Object.freeze({
    rope: [], lift: ['rope'], corner: ['lift'], course0: ['corner'], course1: ['course0'],
    rock0: ['rope'], hammer0: ['rock0'], rock1: ['rope'], hammer1: ['rock1'], rock2: ['rope'],
    pave: ['course1', 'hammer0', 'hammer1', 'rock2'], roll: ['pave'], trace: ['roll'],
  }),
  wall: Object.freeze({
    line: [], pulley: ['line'], wcourse0: ['line'], wcourse1: ['wcourse0'], giant: ['pulley', 'wcourse0'], wcorner: ['wcourse1'], top: ['giant', 'wcorner'],
  }),
  // ── build 73 ── stage 03 (PARTS46) in the loop: the first lattice panel and the warning stones side by side; each panel after the one
  // beside it (the soreg closes panel by panel); the bows at the breaches once the soreg is closed and the warning stands
  soreg: Object.freeze({ lattice0: [], warn: [], lattice1: ['lattice0'], lattice2: ['lattice1'], bows: ['lattice2', 'warn'] }),
  // ── build 74 ── stage 04 (PARTS47): the lintel and the gates' names side by side; the two leaves once the lintel is up
  gates: Object.freeze({ lintel: [], names: [], leaf: ['lintel'], leaf7: ['lintel'] }),
  // ── build 75 ── stage 05 (PARTS48): the wood's sorting and the gallery's beams side by side; the pegs in the beams; the corner after the
  // pegs; the walk on the gallery once its corner is closed
  nashim: Object.freeze({ wood: [], beams: [], pegs: ['beams'], corner: ['pegs'], walk: ['corner'] }),
  // ── build 76 ── stage 06 (PARTS49): one after another — the doors' voyage (the exception, at sea), the lever and pegs at the gate, the
  // leaves hung, then the fifteen steps in the opening; the loop's result shot and walk between them
  nikanor: Object.freeze({ voyage: [], lever: ['voyage'], hang: ['lever'], steps: ['hang'] }),
  // ── build 77 ── stage 07 (PARTS50): the three chambers side by side — the hewn stone's compass, the exiles' hub, the hearth's dome; in
  // each its next work after its first (the benches after the compass, the buckets' wheel after the hub)
  lishka: Object.freeze({ compass: [], hub: [], dome: [], benches: ['compass'], wheel: ['hub'] }),
  // ── build 78 ── stage 08 (PARTS55): the first inspection first (what makes a stone unfit); then the field stones, the nail's test and
  // "no iron" side by side; the last row once the three are done
  yesod: Object.freeze({ inspect: [], field: ['inspect'], nail: ['inspect'], iron: ['inspect'], last: ['field', 'nail', 'iron'] }),
  // ── build 79 ── stage 09 (PARTS56): the side light and the tap's test side by side (the stones checked); the sovev's course once both are done; the red line on it last
  sovev: Object.freeze({ light: [], tap: [], sovev: ['light', 'tap'], thread: ['sovev'] }),
  // ── build 80 ── stage 10 (PARTS57): the stones' check with its decoys and the ramp side by side; the lime once the body and the ramp stand
  guf: Object.freeze({ decoy: [], kevesh: [], sid: ['decoy', 'kevesh'] }),
  // ── build 81 ── stage 11 (PARTS58): the four horns and the two holes side by side; the first fire once the altar is whole
  karnot: Object.freeze({ horns: [], holes: [], fire: ['horns', 'holes'] }),
  // ── build 82 ── stage 12 (spec §6 "12": יציקה, 12 דדים, הברגה, מוכני): the cast first; then the spigots and the wheel side by side; the screw after the spigots
  kiyor: Object.freeze({ cast: [], spigots: ['cast'], screw: ['spigots'], mukhni: ['cast'] }),
});
export const SITE63 = Object.freeze({ max: 5, near: 4.5, shotT: 2.6, hold: 0.5, back: 2.4, minD: 46, up: 0.62 });

/** the works open now, in the stage's order: not done, all they need done; none left → 'reveal'; at most SITE63.max */
export function open63(stg, parts, done) {
  const D = DEP63[stg]; if (!D) return [];
  const d = new Set(done || []), out = [];
  for (const p of parts) { if (p === 'open' || p === 'reveal' || d.has(p) || !D[p]) continue; if (D[p].every((q) => d.has(q))) out.push(p); }
  if (!out.length && parts.includes('reveal') && parts.every((p) => p === 'open' || p === 'reveal' || d.has(p))) return ['reveal'];
  return out.slice(0, SITE63.max);
}
/** the works done, from an old save (one work after another): the ones before the current */
export function migrate63(parts, at) { return parts.slice(1, Math.max(1, at | 0)).filter((p) => p !== 'reveal'); }
/** the structure's share once n works are done (the stage's shares in its own order: MOUNT62 by the n-th part) */
export function shareAt63(parts, shares, n) { const k = Math.max(0, Math.min(parts.length - 1, n | 0)); const v = shares[parts[k]]; return Number.isFinite(v) ? v : 0; }

/** the result shot (§4 step 6): from the act's view, back and up from what he made, until the structure around it is in the frame —
 *  at u (0…1), eased; held SITE63.hold s at the end */
export function shotView63(v0, at, u, c = SITE63) {
  const dx = v0.p[0] - at.x, dz = v0.p[2] - at.z, L = Math.hypot(dx, dz) || 1, D0 = Math.hypot(L, v0.p[1] - at.y), D1 = Math.max(c.minD, D0 * c.back);
  const e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u), D = D0 + (D1 - D0) * e, el0 = Math.atan2(v0.p[1] - at.y, L), el = el0 + (Math.max(el0, c.up) - el0) * e;
  const t = [v0.t[0] + (at.x - v0.t[0]) * e, v0.t[1] + (at.y - v0.t[1]) * e, v0.t[2] + (at.z - v0.t[2]) * e];
  return { p: [at.x + (dx / L) * D * Math.cos(el), at.y + D * Math.sin(el), at.z + (dz / L) * D * Math.cos(el)], t };
}

export const LINE63 = Object.freeze({
  site: 'עבודות פתוחות — בחרו אחת, או לכו אליה',
  shot: 'זה נכנס לבניין',
  chips: 'עבודות פתוחות',
});
