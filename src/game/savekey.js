/* ── b131 ── savekey.js — the game's saves kept apart per version page. Every build is served on one origin (…/mikdash/v/NN/, the
 * main site at …/mikdash/), and a stage or work link (?stage=8, #pit1, ?work=…) removes the save: on a version page that wiped every
 * other version's and the main site's. On a path …/v/<seg>/… each save key gets ':v<seg>'; anywhere else (the main site, an artifact
 * page, file://, the probes) the key is exactly as before. No migration.
 *   verSuffix(path) → '' | ':v<seg>'      saveKey(k, path?) → k (+ the suffix when k is one of the game's saves)
 * The saves: the game's (bh_beta2, the demo's bh_demo, a family slot's bh_save_<id>, the slots' list bh_slots and pointer bh_slot),
 * its settings (bh_settings) and the avodah phase's save (bh_avodah). ── /b131 ── */
export const SAVE_KEYS = /^(bh_beta2|bh_demo|bh_save_[A-Za-z0-9_]*|bh_slots|bh_slot|bh_settings|bh_avodah)$/;
export function verSuffix(path) {
  const m = /\/v\/([A-Za-z0-9_-]+)\//.exec(String(path || ''));
  return m ? ':v' + m[1] : '';
}
const here = () => { try { return (globalThis.location && globalThis.location.pathname) || ''; } catch (e) { return ''; } };
export function saveKey(k, path) {
  if (typeof k !== 'string' || !SAVE_KEYS.test(k)) return k;
  return k + verSuffix(path === undefined ? here() : path);
}
