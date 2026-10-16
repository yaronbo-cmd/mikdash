/* ── tools21 ── tools.js — the kohen's tools as a mechanism (wave 21, the owner's notes 6 and 7: "the hammer is not part of the
 * character, each job has its own tool, hung behind him when he does not work"; "a better tool is prettier and its points are more").
 * Pure rules over the save (G.tools) + one small runtime: which tool the job in hand uses (use), and its tier's multiplier, which
 * acts.js (act) and juice.js (hit) read from globalThis.__TOOL_MULT. Never real money: tiers are bought in silver (shop.js) or earned.
 *
 *   TOOLS          the nine tools, each with three tiers: name · look (stages.js reads the tier) · ×1.0 / ×1.15 / ×1.3
 *   JOB_TOOL       the job → its tool (jobs.js stamps it on JOBS[job].tool)
 *   tierOf / multOf / priceOf / canBuy / buy      the shop's rules (⚑ 300 silver to tier 2, 900 to tier 3)
 *   earn(G, stageIdx)                             reaching stage 3 / 7 upgrades the tools at tier 1 to tier 2, free
 *   use(id, say) / mult()                         the tool in hand now and its multiplier (once per job the float says it)
 * Wood is not iron: the altar's mallet stays wood at every tier (a bronze band at the top, never an iron head). */

export const TIER_MULT = [1, 1.15, 1.3];
export const TIER_PRICE = [0, 300, 900];            // the price of REACHING tier 1, 2, 3 (tier 1 is free)
export const EARN = { 3: ['hammer', 'chisel', 'mallet'], 7: ['sledge', 'pick', 'plumb', 'rope', 'cord', 'saw'] };   // ⚑ stages nashim (3) and yesod (7)
export const TOOLS = {
  hammer: { n: 'הפטיש', tiers: ['פטיש ברזל פשוט', 'פטיש פלדה מחוזקת', 'פטיש האומן'], mesh: true },
  chisel: { n: 'האזמל', tiers: ['אזמל ברזל פשוט', 'אזמל פלדה מחוזקת', 'אזמל האומן'], mesh: true },
  mallet: { n: 'המקבת', tiers: ['מקבת עץ', 'מקבת עץ מחוזקת', 'מקבת האומן'], mesh: true },
  sledge: { n: 'הקורנס', tiers: ['קורנס ברזל פשוט', 'קורנס פלדה מחוזקת', 'קורנס האומן'], mesh: true },
  pick: { n: 'המכוש', tiers: ['מכוש ברזל פשוט', 'מכוש פלדה מחוזקת', 'מכוש האומן'], mesh: true },
  plumb: { n: 'האנך', tiers: ['אנך עופרת', 'אנך נחושת', 'אנך האומן'], mesh: true },
  rope: { n: 'החבל', tiers: ['חבל קנבוס', 'חבל קלוע', 'חבל האומן'], mesh: true },
  cord: { n: 'חוט המדידה', tiers: ['חוט פשתן', 'חוט קלוע', 'חוט האומן'], mesh: false },
  saw: { n: 'המשור', tiers: ['משור ברזל פשוט', 'משור פלדה מחוזקת', 'משור האומן'], mesh: false },
};
export const IDS = Object.keys(TOOLS);
/** the job's tool (the trade: hammer and chisel dress; the sledge splits; the pick digs; the mallet is the altar's; the cord surveys) */
export const JOB_TOOL = { strike: 'hammer', key: 'chisel', letters: 'chisel', arch: 'mallet', F1: 'mallet', line: 'cord', column: 'rope', tread: 'rope', waves: 'rope', rafts: 'rope', plumb: 'plumb', saw: 'saw' };
/** a stroke's tool by the hero's act kind (stages.js HKIND): the altar's stones are touched by wood alone */
export const STROKE_TOOL = { dress: 'hammer', chisel: 'chisel', tamp: 'mallet', pick: 'pick', split: 'sledge', measure: 'plumb', pull: 'rope' };
export const strokeTool = (kind, altar = false) => { const t = STROKE_TOOL[kind] || null; return altar && (t === 'hammer' || t === 'chisel' || t === 'pick' || t === 'sledge') ? 'mallet' : t; };
export const jobTool = (job, altar = false) => { const t = JOB_TOOL[job] || null; return altar && job === 'strike' ? 'mallet' : t; };

const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
/** the save's block, made whole (state.js calls it on load) */
export function ensure(G) {
  if (!isObj(G.tools)) G.tools = {};
  const T = G.tools;
  if (!isObj(T.tier)) T.tier = {};
  if (!isObj(T.earned)) T.earned = {};
  for (const k of Object.keys(T.tier)) if (!TOOLS[k]) delete T.tier[k];
  for (const k of IDS) { const v = Math.floor(+T.tier[k]); T.tier[k] = v >= 3 ? 3 : v >= 2 ? 2 : 1; }
  return T;
}
export const tierOf = (G, id) => (TOOLS[id] ? ensure(G).tier[id] : 1);
export const multOf = (G, id) => TIER_MULT[tierOf(G, id) - 1] || 1;
export const nameOf = (G, id) => (TOOLS[id] ? TOOLS[id].tiers[tierOf(G, id) - 1] : '');
/** the price of the next tier, or null at the top */
export const priceOf = (G, id) => { const t = tierOf(G, id); return TOOLS[id] && t < 3 ? TIER_PRICE[t] : null; };
/** can she buy the next tier now? → { ok, price } | { ok:false, full? , lack? } (nothing changes) */
export function canBuy(G, id) {
  if (!TOOLS[id]) return { ok: false };
  const price = priceOf(G, id); if (price == null) return { ok: false, full: true };
  const have = Math.floor((G.res && G.res.silver) || 0);
  return have >= price ? { ok: true, price } : { ok: false, price, lack: price - have };
}
/** buy it: the silver goes, the tier rises. → { ok, id, tier, price, name } */
export function buy(G, id) {
  const c = canBuy(G, id); if (!c.ok) return { ...c, id };
  G.res.silver = Math.max(0, (G.res.silver || 0) - c.price);
  const T = ensure(G); T.tier[id] += 1; T.bought = (T.bought | 0) + 1;
  return { ok: true, id, tier: T.tier[id], price: c.price, name: TOOLS[id].tiers[T.tier[id] - 1] };
}
/** reaching stage `idx` (0-based): the tools at tier 1 of its group become tier 2, once. → the ids upgraded (empty most times) */
export function earn(G, idx) {
  const T = ensure(G), out = [];
  for (const s of Object.keys(EARN)) {
    if (idx < +s || T.earned[s]) continue;
    T.earned[s] = 1;
    for (const id of EARN[s]) if (T.tier[id] < 2) { T.tier[id] = 2; out.push(id); }
  }
  return out;
}
/** the look the 3D model reads: { tier, mult } for a tool */
export const lookOf = (G, id) => ({ tier: tierOf(G, id), mult: multOf(G, id) });

/* ── the runtime: the tool in hand for the job being played ── */
const RT = { G: null, id: null, said: null, mult: 1, say: null };
/** the save the runtime reads (index.js: once, and again when the save is replaced) */
export function attach(G, say) {
  RT.G = G; if (typeof say === 'function') RT.say = say; if (G) ensure(G);
  if (G && RT.id) use(RT.id);   // (a tier bought or earned while the tool is in hand: its multiplier and its float now)
  else publish();
}
function publish() { try { globalThis.__TOOL_MULT = RT.mult; } catch (e) { /* a frozen global */ } }
/** the job's tool is in his hand: its multiplier now on (acts.js / juice.js read __TOOL_MULT). The float says it once per job. */
export function use(id, o = {}) {
  if (!id || !TOOLS[id] || !RT.G) { RT.id = null; RT.mult = 1; publish(); return 1; }
  const m = multOf(RT.G, id);
  RT.id = id; RT.mult = m; publish();
  if (m > 1 && RT.said !== id) { RT.said = id; if (RT.say) { try { RT.say(`${XM(m)} ${nameOf(RT.G, id)}`, id); } catch (e) { /* the host's */ } } }
  return m;
}
/** the job is over: back to ×1 and the float may speak again */
export function release() { RT.id = null; RT.mult = 1; RT.said = null; publish(); }
/** "×1.15" kept left-to-right inside right-to-left text (a bidi isolate) */
export const XM = (m) => `\u2066×${m}\u2069`;
export const mult = () => RT.mult;
export const current = () => RT.id;
