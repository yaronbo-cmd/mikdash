/* ── build 97 ── court97.js — stage 05, the women's court built before his eyes (the owner, 4.11 06:15, on build 95: "בגרסה הישנה 15 עזרת
 * נשים הייתה ממש בנייה של הקירות. אני רוצה לשלב בין המשחקונים החדשים לאלו שהיו בגרסה הישנה. ושבמבט מצלמה יראו את הפועלים של הבנייה הישנה
 * כשהם בונים את העזרת נשים"). The court's four corner chambers rise from their footings during the stage, stone by stone, set by the
 * world's crane while he walks and works (build 15's crews and crane), never ahead of his works; and build 15's two wall jobs come back as
 * works of the stage beside the gallery's beams and pegs: the treadwheel (tread.js, his feet in the crane's great wheel lift the
 * chamber's stones) and the snap-line (snap.js, the red line that opens a course). The plan of the opening is drawn as the builders drew
 * it: lime lines on the ground, stakes and cords, the walls' edges in a mason's pale line (the owner, 4.11 05:03: "הצהוב הזה לא טוב צריך
 * להחליף במשהו יותר אדריכלי"). Pure: no THREE, no DOM. har42.js plays it. The wheel, the cord, the lime: המחשה. Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** ncap: the chambers' stones laid before the finish (stages.js: 235 in all, courses 85, 44, 46, 60: the first course's are the outer faces
 *  only, inside the court's own wall and never seen from the court, so it stands from the start); start: laid by his first visit (the
 *  hidden first course and a first run of the inner faces); crewS: the seconds the crews take for one work's share; lead: how much of the next
 *  work's share they lay before he does it; liftMs / gap: a crane lift's length and the pause after it; behind: stones behind by more
 *  than this are set at once (a jump: a work done away from the site) */
export const COURT97 = Object.freeze({ ncap: 200, start: 92, crewS: 45, lead: 0.85, liftMs: 2400, gap: 0.8, behind: 6 });

/** stage 05's works: build 15's wall jobs among build 93's (the treadwheel twice — the second heavier — and the line) */
export const PARTS97 = Object.freeze(['open', 'tread97', 'line97', 'beams', 'beams2', 'beams3', 'tread97b', 'pegs', 'pegs2', 'corner', 'walk', 'reveal']);
/** what opens each (site63 open63): the line after the first lift; the heavy lift after the line; the corner after the walls' jobs too */
export const DEP97 = Object.freeze({ tread97: [], line97: ['tread97'], beams: [], beams2: ['beams'], beams3: ['beams2'], tread97b: ['line97'], pegs: ['beams'], pegs2: ['beams2', 'pegs'], corner: ['beams3', 'pegs2', 'tread97b'], walk: ['corner'] });
/** each old job: the game (minigames/), its level (0–2), the stones his lift sets */
export const JOB97 = Object.freeze({ tread97: Object.freeze({ game: 'tread', L: 0, n: 3 }), tread97b: Object.freeze({ game: 'tread', L: 1, n: 3 }), line97: Object.freeze({ game: 'snap', L: 1, n: 0 }) });

/** the crews' share of the stage (0…1) after `done` of `works` works and c (0…lead) of the next one's share */
export function share97(done, works, c = 0) { const n = Math.max(1, works | 0); return clamp(((done | 0) + clamp(+c || 0, 0, COURT97.lead)) / n, 0, 1); }
/** the stones the chambers should show for a share: from the start's to ncap */
export function want97(share, C = COURT97) { return C.start + Math.round(clamp(+share || 0, 0, 1) * (C.ncap - C.start)); }
/** the crews' creep toward the next work's share (seconds dt): c grows by dt / crewS, up to lead */
export function creep97(c, dt, C = COURT97) { return Math.min(C.lead, Math.max(0, +c || 0) + Math.max(0, +dt || 0) / C.crewS); }
/** what the crane does now: 'jump' (far behind: set at once to want − 1), 'lift' (one stone up), or null */
export function next97(have, want, busy, C = COURT97) { const d = (want | 0) - (have | 0); if (d <= 0) return null; if (d > C.behind) return 'jump'; return busy ? null : 'lift'; }

/** a chamber's slot he may lift into: on an inner face (seen from the court), not the outer, inside the court's own wall (x 6…141, z ±67.5) */
export const inner97 = (q) => !!q && Array.isArray(q.face) && Math.abs(q.face[2]) < 66 && q.face[0] > 7.5 && q.face[0] < 139.5;
/** the treadwheel's foot from a touch's x on the screen (w: its width): the right half the right foot, the left half the left */
export const foot97 = (x, w) => (x >= w / 2 ? 'R' : 'L');
/** a job's grade from the old game's result (quality 0…1): ≥ .85 מהודר (1), ≥ .55 כשר (½), else 0 — as rate30 */
export const q97 = (r) => { const q = r && Number.isFinite(+r.quality) ? +r.quality : 0; return q >= 0.85 ? 1 : q >= 0.55 ? 0.5 : 0; };

/** the opening's plan, as the builders drew it: per wall [x0, z0, x1, z1] the footprint rects of stages.js 'nashim' (four chambers and the
 *  north and south walls between them) — the lime lines run round each; the stakes at their corners */
export const PLAN97 = Object.freeze([[101, -67.5, 141, -27.5], [101, 27.5, 141, 67.5], [6, -67.5, 46, -27.5], [6, 27.5, 46, 67.5], [46, -67.5, 101, -62.8], [46, 62.8, 101, 67.5]]);
/** the segments of a rect's outline (for the lime and the cords) */
export function edges97(r) { const [x0, z0, x1, z1] = r; return [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]]; }
