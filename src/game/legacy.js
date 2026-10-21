/* legacy.js: what the v5 migration needs from the 2D beta (save 'bh_beta2', v ≤ 4). Nothing else uses it.
 * The 2D stage order and each stage's total work, and the 2D resource keys. */
export const V4_WORK = {
  har: 24, wall: 14, sorag: 8, gates: 12, nashim: 14, nikanor: 12, lishka: 10, yesod: 12, sovev: 10, guf: 16,
  karnot: 8, kiyor: 10, ulam: 18, heichal: 22, kodesh: 16,
};
export const V4_ORDER = Object.keys(V4_WORK);
/** 2D resource → v5 resource (techelet and workers have no v5 equivalent; they convert to silver). */
export const V4_RES = { s: 'stone', c: 'cedar', n: 'bronze', g: 'gold', si: 'silver' };
export const V4_TO_SILVER = { t: 1, k: 2 };
