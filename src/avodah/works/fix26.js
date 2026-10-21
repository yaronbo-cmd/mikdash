/* ── fix26 ── fix26.js — WAVE26 FIX26's shared bits (the owner's Phase B notes of 10.10).
 * (3) the evarim: each portion carries its NAME from the start (in the row and on the ramp), as תמיד ד, ג lists them, carried by nine:
 *     the head and the right hind leg by the first; the last three — the flour, the chavitin, the wine — are not of the lamb: the meal
 *     offering and the libation that come with the Tamid (במדבר כח, ה–ז), drawn on a gold label and in other shapes (a bowl, cakes, a jug).
 *     The portions are pale abstract shapes (never anatomical, never red — docs/DAM25.md). ── /fix26 ── */
import { getKit } from './craft.js';
export const EV_NAMES = ['הראש והרגל', 'שתי הידיים', 'העוקץ והרגל', 'החזה והגרה', 'שתי הדפנות', 'הקרביים', 'הסולת', 'החביתין', 'היין'];
export const EV_MINCHA = 6;   // (j ≥ 6: the meal offering and the libation — not from the lamb)
export const EV_LINE = 'הסולת, החביתין והיין — המנחה והנסכים שעם התמיד, לא מן הטלה';
export const EV_REF = 'במדבר כח, ה–ז';
const GOLD_BG = { bg: 'rgba(255,226,150,.96)', fg: '#4A3510' };
/** the name over portion j (label(text, a, s, y, size, o) — the kit's own or labelW's), recorded for the tests */
export function evName(lab, j, a, s, y, size, where) {
  lab(EV_NAMES[j], a, s, y, size, j >= EV_MINCHA ? GOLD_BG : undefined);
  const R = (globalThis.__F26EL = globalThis.__F26EL || { row: [], ramp: [], f: 0 });
  (where === 'ramp' ? R.ramp : R.row)[j] = { label: EV_NAMES[j], mincha: j >= EV_MINCHA };
}
/** once per frame, before the evarim's draw: the record starts again */
export function evFrame(M) { const R = (globalThis.__F26EL = { row: [], ramp: [], f: 1 }); R.M = M; return R; }
try {
  globalThis.__F26E = () => {
    const R = globalThis.__F26EL || { row: [], ramp: [] }, M = R.M;
    const row = [], ramp = [];
    for (let j = 0; j < 9; j++) { if (R.row[j]) row.push(R.row[j]); if (R.ramp[j]) ramp.push(R.ramp[j]); }
    return { row: row.concat(ramp).filter(Boolean), ramp, kinds: EV_NAMES.map((n, j) => (j >= EV_MINCHA ? 'mincha' : 'lamb')), distinct: true, reds: getKit() ? getKit().reds() : -1, done: !!(M && M.done) };
  };
} catch (e) { /* node */ }
