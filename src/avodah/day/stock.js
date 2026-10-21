/* stock.js — the Temple's stores (ENGINE22; the contract). A low store opens a restock task and NEVER blocks a Tamid
 * (the Temple has its reserve): `take` takes what there is and says how much. Values are floats inside, whole numbers outside.
 *   const S = createStock({ save, emit })      save = G.avodah.day.stock
 *   S.get(k) · S.take(k, n) → n taken · S.add(k, n) · S.low() → [k…] · S.snapshot() · S.drain(hours, block) · S.KINDS */
export const KINDS = ['wood', 'oil', 'wine', 'flour', 'salt', 'lambs', 'doves', 'ketoret'];
export const START = { wood: 14, oil: 9, wine: 9, flour: 9, salt: 6, lambs: 6, doves: 10, ketoret: 4 };
export const MAX = { wood: 24, oil: 14, wine: 14, flour: 14, salt: 10, lambs: 9, doves: 16, ketoret: 6 };
export const LOW = { wood: 5, oil: 4, wine: 4, flour: 4, salt: 2, lambs: 6, doves: 4, ketoret: 2 };
export const HE = { wood: 'עצים', oil: 'שמן', wine: 'יין', flour: 'סולת', salt: 'מלח', lambs: 'טלאים בדוקים', doves: 'יונים וקינים', ketoret: 'קטורת' };
// the day's quiet use per temple hour while the gates are open (the offerings, the nesachim, the fire)
const USE = { wood: 0.7, oil: 0.35, wine: 0.45, flour: 0.45, salt: 0.1, doves: 0.55 };
export function createStock({ save = {}, emit = () => {} } = {}) {
  for (const k of KINDS) if (!Number.isFinite(save[k])) save[k] = START[k];
  const S = {
    KINDS, HE,
    get: (k) => Math.floor(save[k] + 1e-9),
    take(k, n = 1) {
      if (!(k in save) || !(n > 0)) return 0;
      const got = Math.min(n, Math.floor(save[k] + 1e-9)); if (got <= 0) return 0;
      const was = S.low(); save[k] -= got; emit('stock', { k, d: -got, v: S.get(k) });
      for (const x of S.low()) if (!was.includes(x)) emit('stockLow', { k: x });
      return got;
    },
    add(k, n = 1) { if (!(k in save) || !(n > 0)) return 0; const a = Math.min(MAX[k], save[k] + n) - save[k]; save[k] += a; emit('stock', { k, d: a, v: S.get(k) }); return a; },
    low: () => KINDS.filter((k) => save[k] < LOW[k]),
    /** the day's quiet use: `hours` of temple time in `block` ('day' and 'dawn' and 'evening' use; the night barely) */
    drain(hours, block) {
      const f = block === 'day' ? 1 : block === 'dawn' || block === 'evening' ? 0.6 : block === 'close' ? 0.1 : 0.15;
      const was = S.low();
      for (const k in USE) save[k] = Math.max(0, save[k] - USE[k] * f * hours);
      for (const x of S.low()) if (!was.includes(x)) emit('stockLow', { k: x });
    },
    snapshot() { const o = {}; for (const k of KINDS) o[k] = S.get(k); return o; },
    /** the horizon's "חסר: …" (the Hebrew names of what is low) */
    lowHe: () => S.low().map((k) => HE[k]),
  };
  return S;
}
