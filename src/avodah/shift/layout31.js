// ── flow31 ── layout31.js — the shift's stations in ONE open field (docs/WAVE31-BRIEF.md FLOW31 (1)): the court east and south-east of the
// altar, which the player sees from the line at the gate — no altar between two stations of a route, the path a straight run.
//   PLACE31[id] = { at:{x,y,z} (the thing), stand:{x,z} (where the kohen stands), he, icon }   — ROUTE31's acts take their places from here.
//   GATE31 — the line's head (the pilgrims come in at Nikanor's gate, x −10, z −3…3).
// World amot: x grows to the east (the altar x −54…−22, its east face at −22; the court's east wall at −10), z grows to the south
// (the altar z −19.5…12.5; the ramp x −46…−30, its foot at z 42.5). Build 3 (fable32): the REAL anchors — the laver, the morning ring,
// the north tables, the altar's corners, the ramp's foot. Never a Divine Name.
import { LEVEL, ALTAR_CORNERS, KEVESH, KIYOR, TAMID_RING, MARBLE_TABLES } from '../../places.js';

const Y = LEVEL.azara;
const P = (he, icon, ax, az, sx, sz, ay = Y) => Object.freeze({ he, icon, at: Object.freeze({ x: ax, y: ay, z: az }), stand: Object.freeze({ x: sx, z: sz }) });
const NE = ALTAR_CORNERS.NE, SE = ALTAR_CORNERS.SE, SW = ALTAR_CORNERS.SW, FOOT = { x: (KEVESH.x1 + KEVESH.x0) / 2 + 4, z: KEVESH.zFoot };   // (the foot's east half: −34, 42.5)
const RING = TAMID_RING.morning, TABLE = { x: MARBLE_TABLES.xs[4], z: MARBLE_TABLES.z };   // (the morning ring, −47 −33.5; the fifth table, −38 −56)

// ── fable32 (build 3) ── the owner (13.10): "הפעולות לא מבוצעות במקומן" — every act at its REAL place, nothing moved for the walk's sake:
// the laver on the Ulam's steps (the kohen stands at the steps' foot, x −54.3 — the feet's rule), the slaughter at the morning ring north
// of the altar, the cutting at a marble table, the הגשה at the SW corner, the ken at the SE corner, the parts up the real ramp.
// The legs are long (the court is 187 amot): 2–5 s at 20 amot/s — that is the court. ── /fable32 ──
export const PLACE31 = Object.freeze({
  // the laver: the kohen's own opening act, once a round (מדות ג, ו: between the Ulam and the altar, drawn to the south)
  kiyor: P('הכיור', '💧', KIYOR.x, KIYOR.z, -54.3, KIYOR.z, Y + 3),
  // the olah — the slaughter at the rings north of the altar (תמיד ד, א: the morning Tamid at the NW corner's ring)
  samicha: P('הסמיכה', '🤲', RING[0], RING[1], RING[0] + 2, RING[1] + 2.5),      // (at the slaughter's own stand — מנחות ט, ח: "במקום שסומכין שוחטין, ותכף לסמיכה שחיטה")
  shechita: P('השחיטה', '🔪', RING[0], RING[1], RING[0] + 2, RING[1] + 2.5),      // (the ring and the linen screen: blood.js — DAM25)
  zerika: P('הזריקה', '🩸', NE[0], NE[1], NE[0] + 2.6, NE[1] + 2.2),   // (the altar's NE corner, below the line — זבחים ה, ד)
  nituach: P('הניתוח', '🔪', TABLE.x, TABLE.z, TABLE.x, TABLE.z + 3),       // (the marble tables in the north — מדות ג, ה; תמיד ד, ב)
  kevesh: P('הכבש', '🔥', FOOT.x, FOOT.z, FOOT.x + 2.4, FOOT.z + 2.4),   // (the ramp's foot: the parts carried up — תמיד ד, ג; ז, ג)
  // the mincha
  hagasha: P('ההגשה', '🌾', SW[0], SW[1] + 1, SW[0] - 0.5, SW[1] + 3.5),   // (the altar's SW corner — מנחות ה, ה)
  kemitza: P('הקמיצה', '🌾', -49, 24, -47, 24),         // (in the court south-west of the altar, by the הגשה — מנחות א, ב; ⚑ the spot המחשה)
  haktara: P('ההקטרה', '🔥', FOOT.x, FOOT.z, FOOT.x + 2.4, FOOT.z + 2.4),   // (up the ramp to the pyre: the same foot as the olah's parts)
  // the ken — the altar's SE corner (עולת העוף above the line there; זבחים ו, ד–ה)
  melika: P('המליקה', '🕊', SE[0], SE[1] - 1.5, SE[0] + 2.8, SE[1] - 1.8),
  mitzui: P('המיצוי', '🕊', SE[0], SE[1] + 0.5, SE[0] + 2.8, SE[1] + 2.4),
});
/** the line's head (the pilgrims' queue runs south from it along x −15) */
export const GATE31 = Object.freeze({ x: -15, y: Y, z: 3 });
/** the routes, as the brief names them (ROUTE31 owns the acts and may change them; the layout's distances are measured on these) */
export const ROUTES31 = Object.freeze({
  olah: ['samicha', 'shechita', 'zerika', 'nituach', 'kevesh'],
  mincha: ['hagasha', 'kemitza', 'haktara'],
  ken: ['melika', 'mitzui'],
});
/** the legs of a route (amot, straight): [[from, to, d]] from the gate */
export function legs31(route, from = GATE31) {
  const out = []; let p = from, n = 'gate';
  for (const id of route) { const s = PLACE31[id] && PLACE31[id].stand; if (!s) continue; out.push([n, id, Math.round(Math.hypot(s.x - p.x, s.z - p.z) * 10) / 10]); p = s; n = id; }
  return out;
}
/** the button's word in reach of a place (the act's verb + its gesture); a STATIONS entry's own `verb31` wins (ROUTE31's) */
export const VERB31 = Object.freeze({
  kiyor: 'קדשו ידיים — החזיקו', samicha: 'סמכו — הקישו', shechita: 'שחטו — גררו', zerika: 'זרקו — גררו לפינה', nituach: 'נתחו — הקישו',
  hagasha: 'הגישו — הקישו', kevesh: 'העלו — החזיקו', kemitza: 'קמצו — החזיקו', haktara: 'הקטירו — הקישו', melika: 'מלקו — הקישו בקצב', mitzui: 'מצו — גררו למטה',
  // (wave 29–30's stations, until ROUTE31's acts land)
  seals: 'החותם — הקישו', rings: 'שחטו — הקישו', altar: 'זרקו — גררו לפינה', duchan: 'הקן — הקישו בקצב',
});
export const verb31 = (id, st) => String((st && st.verb31) || VERB31[id] || (st && st.label) || 'עבודה').replace(/ — /, '\u00A0— ');   // (the dash kept on the verb's line)
/** "לך ל<place>": the place's name with its article folded (הכבש → לכבש) */
export const goLabel31 = (he) => 'לך ' + 'ל' + String(he || '').replace(/^ה(?=[א-ת])/, '');
// ── /flow31 ──
