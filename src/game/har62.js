/* ── build 62 ── har62.js — stage 01 again, "הפטיש בהר": the Mount changes under his hands (docs/specs/shlav-alef-olam-he.md §3, §5).
 * Pure: the parts in their new order, the places on the real Mount, the Mount's share as each part is done (the crews build it between them —
 * world61), the eight sectors on the crest (rock → split → levelled → paved), and the hammer, the new act: the crew strikes on a beat and he
 * strikes with them (the LIFT family's timing; on the beat — big flakes and the ground comes down fast; off it — a dull knock, a little).
 * har42.js plays it; stages.js draws the sectors (setSectors62). The method is המחשה. Never a Divine Name. ── /build 62 ── */

/** the parts of stage 01, in order: the south-east corner (the measure, the corner stone, his courses in the east wall), the crest (three rocks
 *  read where they lie, two sectors brought down by his hammer, the paving in the first), the great stone in the west, the inscription at the
 *  south-west corner, the reveal */
export const PARTS62 = Object.freeze(['open', 'rope', 'lift', 'corner', 'course0', 'course1', 'rock0', 'hammer0', 'rock1', 'hammer1', 'rock2', 'pave', 'roll', 'trace', 'reveal']);

/** the Mount's share (stages.js 'har', 0…1) once each part is done; between them the crews creep toward the next (world61). The fill reaches the
 *  plaza (0) at ≈ 0.7 — before the great stone and the inscription, which are played on it; the crest's last bench goes at the reveal */
export const MOUNT62 = Object.freeze({ open: 0.15, rope: 0.17, lift: 0.19, corner: 0.21, course0: 0.24, course1: 0.27, rock0: 0.31, hammer0: 0.36, rock1: 0.4, hammer1: 0.45, rock2: 0.49, pave: 0.7, roll: 0.78, trace: 0.9, reveal: 1 });
export function mount62(part) { const v = MOUNT62[part]; return Number.isFinite(v) ? v : 0.15; }
/** the share the Mount stands at while `part` is played: the one before it */
export function mountBefore62(part) { const i = PARTS62.indexOf(part); return i <= 0 ? MOUNT62.open : mount62(PARTS62[i - 1]); }

/** the places, on the real Mount (mount.js PLAT: x −300…277, z −480…400; the plaza at 0):
 *   se    — inside the south-east corner, on the valley's floor in the Mount (−49), before the fill comes: the rope, the wheel, his courses
 *   west  — on the fill in the Mount's south-west, once it is level (0), clear of the porticoes: the great stone's run, east to its course
 *   sw    — the south-west corner's top: the parapet stone with the inscription
 *  (each is the `base` that har42's offsets — P(dx, dz) — were laid out from: the acts' views stay as tuned) */
export const ZONE62 = Object.freeze({ se: Object.freeze({ x: 250, z: 360 }), west: Object.freeze({ x: -205, z: 176 }), sw: Object.freeze({ x: -320, z: 374 }) });

/** the eight sectors on the crest's east flank: two columns of four, 34 amot square — his in the eastern (natural ground ≈ 13 amot over the
 *  plaza: from the follow camera, south-east of him, the floor he brings down is seen over its low east side), the crews' in the western (≈ 28). `his` — the
 *  rock read there (0…2), and his hammer's sector (hammer0 in rock0's, hammer1 in rock1's); the rest the crews bring down as the Mount rises
 *  (`crew`: the share at which they begin; they take CREW62.span of it) */
export const SECT62 = Object.freeze([
  Object.freeze({ x: -40, z: -24, half: 17, his: 0 }), Object.freeze({ x: -40, z: -64, half: 17, his: 1 }), Object.freeze({ x: -40, z: 16, half: 17, his: 2, crew: 0.49 }),
  Object.freeze({ x: -76, z: -24, half: 17, crew: 0.3 }), Object.freeze({ x: -76, z: -64, half: 17, crew: 0.34 }), Object.freeze({ x: -76, z: 16, half: 17, crew: 0.4 }),
  Object.freeze({ x: -76, z: -104, half: 17, crew: 0.44 }), Object.freeze({ x: -40, z: -104, half: 17, crew: 0.52 }),
]);
export const CREW62 = Object.freeze({ span: 0.1, pave0: 0.72, paveSpan: 0.04, paveStep: 0.018 });
/** the sector of a rock / a hammer part (index in SECT62), or −1 */
export function sectorOf62(part) { const m = /^(?:rock|hammer)(\d)$/.exec(part || ''); if (!m) return -1; const n = +m[1]; return SECT62.findIndex((s) => s.his === n); }

const clamp01 = (v) => Math.max(0, Math.min(1, v));
/** what the crews have done in sector i at the Mount's share p: { lv: 0…1 brought down, pv: 0…1 paved } (his own sectors: nothing — his
 *  hammer does it; but the paving of all but his first is theirs, in turn after the fill is level) */
export function crewSec62(i, p) {
  const s = SECT62[i]; if (!s) return { lv: 0, pv: 0 };
  const lv = Number.isFinite(s.crew) ? clamp01((p - s.crew) / CREW62.span + 1e-9) : 0;
  const pv = i === 0 ? 0 : clamp01((p - CREW62.pave0 - i * CREW62.paveStep) / CREW62.paveSpan + 1e-9);
  return { lv, pv };
}
/** the ground's level in a sector brought down by k (0…1) from its top: the plaza (0) at k = 1, eased (fast at first, the last strokes fine) */
export function secLevel62(top, k) { const u = clamp01(k), e = 1 - (1 - u) * (1 - u); return top + (0 - top) * e; }

/** a long way between two places: farther than `far` amot, the walk is a glide — the camera up over the Mount and down (≤ `T` s, rule 14:
 *  no cut, no black), him set at the far end on the way */
export const GLIDE62 = Object.freeze({ far: 70, T: 2.8, up: 150 });
export function glide62(a, b, c = GLIDE62) { return !!a && !!b && Math.hypot(b.x - a.x, b.z - a.z) > c.far; }
/** the glide's camera at u (0…1): from the view `v0` up over the middle of the way and down to `v1` — an arc, eased */
export function glideView62(v0, v1, u, c = GLIDE62) {
  const e = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u), arc = Math.sin(Math.PI * clamp01(u)) * c.up;
  const L = (a, b) => a + (b - a) * e;
  return { p: [L(v0.p[0], v1.p[0]), L(v0.p[1], v1.p[1]) + arc, L(v0.p[2], v1.p[2])], t: [L(v0.t[0], v1.t[0]), L(v0.t[1], v1.t[1]) + arc * 0.35, L(v0.t[2], v1.t[2])] };
}

/** THE HAMMER (the LIFT family's timing; המחשה): the crew's hewers strike on a beat; each tap of his is a stroke. Within `win` s of a crew's
 *  stroke — on the beat: big flakes, the sector comes down by `big` of a stroke's share; off it — a dull knock, `dull` of it. The ground
 *  comes down to the plaza after ≈ `need` strokes on the beat (more off it: never stuck — no time limit, no fail). The level: the beat
 *  quicker and the window narrower */
export const HAMMER62 = Object.freeze({ beat: Object.freeze([0.95, 0.8, 0.68]), win: Object.freeze([0.22, 0.16, 0.12]), need: Object.freeze([8, 10, 12]), big: 1, dull: 0.35, lead: 1.2 });
export function createHammer62(L = 1, c = HAMMER62) {
  const li = Math.max(0, Math.min(2, (L | 0) - 1)), beat = c.beat[li], win = c.win[li], need = c.need[li];
  let t = -c.lead, k = 0, hits = 0, on = 0, last = null, done = false;
  const phase = () => { const u = t / beat; return u - Math.floor(u); };
  return {
    L: li + 1, beat, win, need,
    /** time passes (s) → the crew's stroke fell in this step? */
    step(dt) { if (done) return false; const p0 = t < 0 ? -1 : Math.floor(t / beat); t += dt; const p1 = t < 0 ? -1 : Math.floor(t / beat); return p1 > p0 && t >= 0; },
    /** his stroke → 'big' | 'dull' | 'wait' (before the crew's first stroke, or after the end) */
    tap() {
      if (done || t < 0) return 'wait';
      const ph = phase(), off = Math.min(ph, 1 - ph) * beat, good = off <= win;
      hits++; if (good) on++; k = Math.min(1, k + (good ? c.big : c.dull) / need); last = good ? 'big' : 'dull'; if (k >= 1 - 1e-9) done = true;
      return last;
    },
    state() { return { t, k, hits, on, last, done, phase: t < 0 ? 0 : phase(), beat, win, need, q: hits ? on / hits : 0 }; },
  };
}

/** the lines (each with its source or המחשה) */
export const LINE62 = Object.freeze({
  hammer: 'הקישו יחד עם הצוות — בקצב · המחשה',
  big: 'בקצב! הסלע נשבר והקרקע יורדת',
  dull: 'מחוץ לקצב — מכה עמומה. חכו למכה של הצוות',
  down: 'הגזרה ירדה לגובה הרחבה · המחשה',
  cart: 'הגושים עולים לעגלה · המחשה',
  far: 'אל העבודה הבאה — מעל ההר',
});
