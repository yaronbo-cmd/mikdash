/* works/all.js — the one place the day's hand-works register (ENGINE22). day/index.js imports this file; a work lands when its
 * line is live. At the merge of s22-worksa / s22-worksb: uncomment the two lines (their files do not exist in s22-engine alone). */
import './dawnreg.js';   // ── tamida23 ── the dawn's Tamid crafts (dawn.js + dawn2.js; the sheet errands re-pointed by id) ── /tamida23 ──
import './register.js';   // WORKSA22: WORKS.watch / fire / lambs / pen / wood (+ warmers)
import { WORKS } from '../day/works.js'; import { registerWorksB } from './registerb.js'; registerWorksB(WORKS);   // WORKSB22: queue / seals / account / kiyor / vessels / gates
// ── tamidb23 ── the Tamid's later works (ketoret · birkat · shir · erev · neirot · shir2)
import { registerTamidB } from './tamidreg.js'; registerTamidB(WORKS);
// ── /tamidb23 ──
// ── payis24 ──
import './more.js';   // the lots in the player's hand (payis.js), the pitum · private offerings · wood offering · trumpeters (more.js) — loads last: it re-registers payis/payis2
// ── /payis24 ──
// ── shift29 ── SHIFT29B's bench (#shiftlab) and its modules in the bundle (the engine imports them itself)
import '../shift/lab.js';
// ── /shift29 ──
export {};
