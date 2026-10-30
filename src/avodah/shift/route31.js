/* ── shift29 ── ── route31 ── route31.js — the true routes of the shift's offerings as short acts, with their sources (WAVE31 ROUTE31).
 *   ROUTES31[type]  the stations in order (the laver is not in them: it is the kohen's own act, once per round, before the work)
 *   STATIONS31[id]  { id, he, label, verb, icon, at, stand, src, illus } — the places are the shift's (FLOW31 lays them out: at/stand
 *                   may be replaced by its layout; the ids are the contract)
 *   VERB31[id]      the button's word for the act (the gold gesture first; a tap always finishes it)
 *   SRC31 / mentorLines(types)   the sources, one line per station (the end card's fold)
 *   PARTS31         the parts at the tables: pale abstract shapes, never anatomical, never red (DAM25 "דם כן, פגר לא")
 * Every text is a draft (טיוטה); "המחשה" where the pose or the place is the game's. Never a Divine Name; no red outside BLOOD. ── /route31 ── */
import { ALTAR_CORNERS, KEVESH, MAARACHOT, LEVEL } from '../../places.js';
import { PLACE31 } from './layout31.js';   // ── fable32 (build 3) ── the places' one source: the real anchors ── /fable32 ──

/** the routes: עולה 🐑 — סמיכה → שחיטה → זריקה → ניתוח → העלאה בכבש; מנחה 🌾 — הגשה → קמיצה → הקטרה; קן 🕊 — מליקה → מיצוי */
export const ROUTES31 = Object.freeze({
  olah: Object.freeze(['samicha', 'shechita', 'zerika', 'nituach', 'kevesh']),
  mincha: Object.freeze(['hagasha', 'kemitza', 'haktara']),
  ken: Object.freeze(['melika', 'mitzui']),
});
/** the kohen's own opening act: once per round, before the first act of the work */
export const LAVER31 = Object.freeze({ id: 'kiyor', once: true, label: 'קידוש ידיים ורגליים — פעם אחת לפני העבודה', src: 'שמות ל, יט–כא; זבחים יט: (קידש ידיו ביום — לכל היום) · טיוטה' });

const RAMP_X = (KEVESH.x0 + KEVESH.x1) / 2;   // (the ramp's middle line: −38)
/** the places: FLOW31's layout (bus 18:45, layout31.js PLACE31) — the open field east of the altar, the slaughter's spot NE of its east
 *  face (המחשה: the true rings are north), the altar's real corners, the real ramp's foot. ⚑ the הגשה at the SE corner (המחשה — the true
 *  one is at the SW corner, מנחות ה, ה, behind the ramp: 38 amot from the field) */
export const STATIONS31 = {
  samicha: { id: 'samicha', he: 'הסמיכה', label: 'סמכו — הקישו', verb: 'tapOn', icon: '🤲', at: { x: -17.4, y: LEVEL.azara, z: -10.2 }, stand: { x: -15.2, z: -11.6 },   /* (the slaughter's own stand: "במקום שסומכין שוחטין, ותכף לסמיכה שחיטה" — מנחות ט, ח) */ 
    src: 'מנחות ט, ח (סומך בשתי ידיו; במקום שסומכין שוחטין, ותכף לסמיכה שחיטה); זבחים ה, ד · המחשה: התנוחה' },
  shechita: { id: 'shechita', he: 'השחיטה', label: 'שחטו — גררו מהר', verb: 'slice', icon: '🔪', at: { x: -17.4, y: LEVEL.azara, z: -11.6 }, stand: { x: -15.2, z: -11.6 }, 
    src: 'זבחים ה, ד (שחיטתה בצפון) · המחשה: המקום בשטח המשמרת, הטבעות האמיתיות בצפון' },
  zerika: { id: 'zerika', he: 'הזריקה', label: 'זרקו — גררו לפינה', verb: 'drag', icon: '🔥', at: { x: ALTAR_CORNERS.NE[0], y: LEVEL.azara, z: ALTAR_CORNERS.NE[1] }, stand: { x: -20.4, z: -16.3 }, 
    src: 'זבחים ה, ד (שתי מתנות שהן ארבע, למטה מחוט הסיקרא); מדות ג, א' },
  nituach: { id: 'nituach', he: 'הניתוח', label: 'נתחו — 3 הקשות', verb: 'tap3', icon: '🪵', at: { x: -13.4, y: LEVEL.azara, z: -16.8 }, stand: { x: -13.4, z: -14.4 }, 
    src: 'זבחים ה, ד (טעונה הפשט ונתוח); תמיד ד, ב–ג · המחשה: החלקים צורות בהירות' },
  kevesh: { id: 'kevesh', he: 'הכבש', label: 'עלו — החזיקו', verb: 'holdWalk', icon: '⛰️', at: { x: -34, y: LEVEL.azara, z: KEVESH.zFoot }, stand: { x: -31.6, z: KEVESH.zFoot + 2.4 }, 
    src: 'תמיד ד, ג (האברים בכבש); ז, ג (עלה בכבש והקטיר) · המחשה: העלייה בהליכה אחת' },
  hagasha: { id: 'hagasha', he: 'ההגשה', label: 'הגישו — הקישו', verb: 'tapOn', icon: '🌾', at: { x: ALTAR_CORNERS.SE[0], y: LEVEL.azara, z: 12.5 }, stand: { x: -21, z: 15 }, 
    src: 'מנחות ה, ה–ו (מגישה בקרן דרומית מערבית כנגד חודה של קרן) · טיוטה · המחשה: במשחק בקרן הדרומית־מזרחית' },
  kemitza: { id: 'kemitza', he: 'הקמיצה', label: 'קמצו — החזיקו', verb: 'hold', icon: '✊', at: { x: -19.6, y: LEVEL.azara, z: 30.5 }, stand: { x: -17.3, z: 30.5 }, 
    src: 'ויקרא ב, ב (וקמץ משם מלא קומצו); מנחות א, ב · המחשה: היד' },
  haktara: { id: 'haktara', he: 'ההקטרה', label: 'הקטירו — הקישו', verb: 'tapOn', icon: '🔥', at: { x: -34, y: LEVEL.azara, z: KEVESH.zFoot }, stand: { x: -31.6, z: KEVESH.zFoot + 2.4 }, 
    src: 'ויקרא ב, ב (והקטיר הכהן את אזכרתה המזבחה); מנחות ו, א (השיריים לכהנים)' },
  melika: { id: 'melika', he: 'המליקה', label: 'מלקו — הקישו בקצב', verb: 'tapBeat', icon: '🕊', at: { x: ALTAR_CORNERS.SE[0], y: LEVEL.azara, z: 10 }, stand: { x: -20.2, z: 9.7 }, 
    src: 'זבחים ו, ה (עולת העוף: בקרן דרומית מזרחית, מולק ממול ערפה) · המחשה: למטה — באמת עלה בכבש לסובב; גב הכהן מסתיר' },
  mitzui: { id: 'mitzui', he: 'המיצוי', label: 'מצו — גררו למטה', verb: 'dragDown', icon: '🧱', at: { x: ALTAR_CORNERS.SE[0], y: LEVEL.azara, z: 12 }, stand: { x: -20.2, z: 13.9 }, 
    src: 'זבחים ו, ה (וממצה את דמה על קיר המזבח — למעלה); ו, ד (חטאת העוף — למטה)' },
};
// ── fable32 (build 3) ── the places come from layout31's PLACE31 (the real anchors) — the coordinates above are wave 31's field, kept only as the fallback ── /fable32 ──
for (const id in STATIONS31) if (PLACE31[id]) { STATIONS31[id].at = PLACE31[id].at; STATIONS31[id].stand = PLACE31[id].stand; }
/** FLOW31 reads STATIONS[id].verb31: the act's word */
for (const id in STATIONS31) STATIONS31[id].verb31 = STATIONS31[id].label;
/** the act's button word (FLOW31's one verb, within 3 amot of the station) */
export const VERB31 = Object.freeze(Object.fromEntries(Object.keys(STATIONS31).map((id) => [id, STATIONS31[id].label]).concat([['kiyor', 'קדשו — החזיקו']])));
/** the station's short name for "לך ל…" */
export const NAME31 = Object.freeze(Object.fromEntries(Object.keys(STATIONS31).map((id) => [id, STATIONS31[id].he]).concat([['kiyor', 'הכיור']])));
export const SRC31 = Object.freeze(Object.fromEntries(Object.keys(STATIONS31).map((id) => [id, STATIONS31[id].src]).concat([['kiyor', LAVER31.src]])));
/** the mentor's fold: one line per station of the routes played (the laver first) */
export function mentorLines(types = ['olah']) {
  const out = [`${NAME31.kiyor}: ${SRC31.kiyor}`];
  for (const t of types) for (const id of ROUTES31[t] || []) { const l = `${NAME31[id]}: ${SRC31[id]}`; if (!out.includes(l)) out.push(l); }
  return out;
}
/** the act's gesture thresholds: the slice ≥ 60 px within 300 ms; the drag down ≥ 24 px; the climb's hold */
export const SLICE31 = Object.freeze({ px: 60, ms: 300 });
export const CLIMB31 = Object.freeze({ s: 4, gold: 0.8, tail: 1.05, top: Object.freeze({ x: -33.2, z: 0.8 }), tailDay: 0.2 });   // (the tail: the rest of the climb, the parts onto the pyre, the flame)
// ── recovered (16–26c) ── s 1 → 4; top: the climb's last point, on the ramp's top; tailDay: the tail in the day (both read by stations.js)
/** the parts (תמיד ד, ב–ג: the order of the limbs) — drawn as pale abstract shapes: a list of kinds and sizes, nothing anatomical */
export const PARTS31 = Object.freeze([
  { kind: 'slab', w: 0.34, d: 0.2, h: 0.08, hex: '#EFE8DA' },
  { kind: 'slab', w: 0.3, d: 0.18, h: 0.08, hex: '#E8DFCC' },
  { kind: 'round', r: 0.12, hex: '#F2ECE0' },
  { kind: 'long', r: 0.06, len: 0.36, hex: '#E4DACB' },
  { kind: 'round', r: 0.1, hex: '#EDE5D5' },
  { kind: 'long', r: 0.055, len: 0.32, hex: '#E9E1D2' },
]);
export const PART_KINDS = Object.freeze(['slab', 'round', 'long']);
/** the pyre's place (the great maaracha): the parts and the fistful go onto it */
export const PYRE31 = MAARACHOT.great;
/** the ken's mark: עולת העוף — above the line at the SE corner (זבחים ו, ה; DAM25 row 17) ⚑ one bird per ken in the game */
export const KEN_MARK31 = Object.freeze({ corner: 'SE', level: 'upper' });
/** the olah's mark: below the line at the NE corner (זבחים ה, ד) */
export const OLAH_MARK31 = Object.freeze({ corner: 'NE', level: 'lower' });
/** the act's "+N" (gold / good / a touch-less end) — the slaughter has no number (DAM25 §2.4) */
export const ACTPTS31 = Object.freeze({ gold: 3, good: 2, slow: 1 });
export const actPts31 = (id, q, gold) => (id === 'shechita' ? 0 : gold ? ACTPTS31.gold : q >= 0.6 ? ACTPTS31.good : ACTPTS31.slow);
// ── /route31 ── ── /shift29 ──
