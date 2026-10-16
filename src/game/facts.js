/**
 * ── flow8 ── (wave 8B, BRIEF8B §5) true facts that rotate: the owner, 28.9 — "פרט מידע אמיתי: כל פעם חוזר על אותו דבר …
 * רשימת פרטי מידע אמיתיים, עדיף שקשורים לכל שלב/נושא … רנדומלי וללא חזרות, כך שכל פעם שאני פותח מחדש את המשחק אראה פריט אחר".
 *
 *   setFacts(list)              FACTS8B's content/facts.json (main.js `// ── build8 ──`); tolerant of its field names
 *   createFacts({ G, stage })   → { next(topic?), pool(topic?) }   the game's rotation; the seen set lives in the save (G.fx)
 *   bootFact(el, store)         the loading screen: a new fact on every open (its id reaches the save when the game loads)
 *
 * The pick: the facts tagged with the topic AND the current stage first, then the topic, then the stage, then any; never one
 * already seen (G.fx.seen, across sessions) until that pool is spent — then that pool starts over, never with the last one.
 * With no facts.json (a lone branch, the tests) the pool falls back to the verified texts the game already carries: the stages'
 * Middot cards, the stories and the finds (content.js). Pure, no DOM except bootFact; no JSON import (node tests load this).
 */
import { STAGES, STORY, FINDS, stageById } from './content.js';

const arr = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
/** one fact in the game's shape: { id, he, ref, stages: [], topics: [], illus, status } | null */
export function normFact(f, i = 0) {
  if (!f || typeof f !== 'object') return null;
  const he = str(f.he) || str(f.text_he) || str(f.text) || str(f.d);
  if (!he) return null;
  const src = f.source && typeof f.source === 'object' ? f.source : null;
  const ref = str(f.ref) || str(f.src) || (typeof f.source === 'string' ? str(f.source) : '') || (src ? str(src.he) || str(src.ref) || str(src.text) : '') || str(f.source_he);
  const tags = [...arr(f.tags), ...arr(f.tag)].map(String);
  const stages = [...arr(f.stages), ...arr(f.stage), ...tags.filter((t) => stageById(t))].map(String).filter((t) => stageById(t));
  const topics = [...arr(f.topics), ...arr(f.topic), ...tags.filter((t) => !stageById(t))].map(String);
  return { id: str(f.id) || `f${i}`, he, ref, stages: [...new Set(stages)], topics: [...new Set(topics)], illus: !!f.illus, status: str(f.status) || 'draft' };
}
export function normFacts(raw) {
  const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.facts) ? raw.facts : [];
  const out = [], ids = new Set();
  list.forEach((f, i) => { const n = normFact(f, i); if (n && !ids.has(n.id)) { ids.add(n.id); out.push(n); } });
  return out;
}
/** the verified texts the game already carries (when facts.json is absent) */
function fallback() {
  const out = [];
  for (const s of STAGES) { const c = s.card; if (c && (c.q || c.d) && c.ref) out.push({ id: `card_${s.id}`, he: c.q || c.d, ref: c.ref, stages: [s.id], topics: [], status: 'draft' }); }
  for (const k of ['priests', 'rain', 'ch4', 'finale']) { const o = STORY[k]; if (o && o.ref && (o.d || o.q)) out.push({ id: `story_${k}`, he: o.d || o.q, ref: o.ref, stages: [], topics: [k === 'priests' || k === 'ch4' ? 'priests' : 'jerusalem'], status: 'draft' }); }
  for (const [k, f] of Object.entries(FINDS || {})) if (f && f.d && f.ref) out.push({ id: `find_${k}`, he: f.d, ref: f.ref, stages: [], topics: ['stone'], status: 'draft' });
  return out;
}
let LIST = null, LIST_FB = null, STAGE_TOPICS = {};
export function setFacts(raw) {
  const n = normFacts(raw); LIST = n.length ? n : null;
  STAGE_TOPICS = raw && typeof raw === 'object' && raw.stage_topics && typeof raw.stage_topics === 'object' ? raw.stage_topics : {};   // FACTS8B: a stage's fallback topics, in order
  return n.length;
}
export const stageTopics = (id) => (Array.isArray(STAGE_TOPICS[id]) ? STAGE_TOPICS[id].map(String) : []);
export function allFacts() { return LIST || LIST_FB || (LIST_FB = fallback()); }

const MAX_SEEN = 800;
/** the pick (pure): list, topic, stage, seen (Set of ids), last id, rnd() → { fact, reset: ids to forget } */
export function pickFact(list, { topic = '', stage = '', seen = new Set(), last = '', rnd = Math.random, stageTopics: st = [] } = {}) {
  const has = (f, t) => !!t && (f.stages.includes(t) || f.topics.includes(t));
  const tiers = [];
  if (topic && stage && topic !== stage) tiers.push(list.filter((f) => has(f, topic) && has(f, stage)));
  if (topic) tiers.push(list.filter((f) => has(f, topic)));
  if (stage) tiers.push(list.filter((f) => has(f, stage)));
  if (st.length) tiers.push(list.filter((f) => st.some((t) => has(f, t))));   // the stage's own topics (FACTS8B's stage_topics)
  tiers.push(list);
  for (const t of tiers) {
    const fresh = t.filter((f) => !seen.has(f.id));
    if (fresh.length) return { fact: fresh[Math.floor(rnd() * fresh.length) % fresh.length], reset: [] };
  }
  // every fact of every tier was seen: the first non-empty pool starts over (never with the last one shown)
  const pool = tiers.find((t) => t.length) || [];
  if (!pool.length) return { fact: null, reset: [] };
  const again = pool.length > 1 ? pool.filter((f) => f.id !== last) : pool;
  return { fact: again[Math.floor(rnd() * again.length) % again.length], reset: pool.map((f) => f.id) };
}

export const BOOT_KEY = 'bh_fx_boot';
/** the game's rotation. G: () => the save; stage: () => the current stage id (the site in focus / the recommended one) */
export function createFacts({ G, stage = () => '', store = null, rnd = Math.random } = {}) {
  function fx() {
    const g = G(); if (!g) return null;
    if (!g.fx || typeof g.fx !== 'object') g.fx = { seen: [], last: '', n: 0 };
    if (!Array.isArray(g.fx.seen)) g.fx.seen = [];
    // the loading screen's pick (bootFact) joins the seen set once the save is here
    if (store) { try { const b = store.get(BOOT_KEY); if (b) { if (!g.fx.seen.includes(b)) g.fx.seen.push(b); g.fx.last = b; store.set(BOOT_KEY, ''); } } catch (e) { /* storage */ } }
    return g.fx;
  }
  function next(topic = '') {
    const f = fx(), list = allFacts();
    if (!f || !list.length) return null;
    let st = ''; try { st = stage() || ''; } catch (e) { st = ''; }
    const seen = new Set(f.seen);
    const r = pickFact(list, { topic: String(topic || ''), stage: st, seen, last: f.last, rnd, stageTopics: stageTopics(topic && stageById(topic) ? topic : st) });
    if (!r.fact) return null;
    if (r.reset.length) { const drop = new Set(r.reset); f.seen = f.seen.filter((id) => !drop.has(id)); }
    f.seen.push(r.fact.id); if (f.seen.length > MAX_SEEN) f.seen.splice(0, f.seen.length - MAX_SEEN);
    f.last = r.fact.id; f.n = (f.n || 0) + 1;
    const o = r.fact;
    return { id: o.id, he: o.he, ref: o.ref, illus: o.illus, status: o.status, stages: o.stages.slice(), topics: o.topics.slice() };
  }
  return { next, pool: (topic) => allFacts().filter((f) => !topic || f.stages.includes(topic) || f.topics.includes(topic)).length, seen: () => { const f = fx(); return f ? f.seen.length : 0; } };
}

/** the loading screen (main.js, before the world is built): a fact the save has not seen, on the stage the player is at;
 *  its id waits in BOOT_KEY for the game (createFacts). el: the #load element. → the fact or null */
export function bootFact(el, store = null, saveKey = 'bh_beta2') {
  if (!el || !el.querySelector) return null;
  const get = (k) => { try { return store ? store.get(k) : localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { if (store) store.set(k, v); else localStorage.setItem(k, v); } catch (e) { /* storage */ } };
  let seen = new Set(), last = '', stage = 'har';
  try {
    const g = JSON.parse(get(saveKey) || 'null');
    if (g && typeof g === 'object') {
      if (g.fx && Array.isArray(g.fx.seen)) { seen = new Set(g.fx.seen); last = g.fx.last || ''; }
      const b = STAGES.find((s) => g.st && g.st[s.id] && !g.st[s.id].done);
      if (b) stage = b.id; else if (g.st && g.st.har && g.st.har.done) stage = (STAGES.find((s) => !(g.st[s.id] && g.st[s.id].done)) || STAGES[0]).id;
    }
  } catch (e) { /* a fresh device */ }
  const prev = get(BOOT_KEY); if (prev) seen.add(prev);   // (a boot whose game never loaded)
  const r = pickFact(allFacts(), { stage, seen, last: prev || last, stageTopics: stageTopics(stage) });
  if (!r.fact) return null;
  set(BOOT_KEY, r.fact.id);
  const inner = el.querySelector('.inner') || el;
  let box = inner.querySelector('.fx-boot');
  if (!box) {
    box = document.createElement('div'); box.className = 'fx-boot';
    box.style.cssText = 'margin:18px auto 0;max-width:min(86vw,420px);font:500 15px/1.55 "Heebo",system-ui,sans-serif;opacity:.94;text-align:center';
    inner.appendChild(box);
  }
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  box.innerHTML = `<b style="display:block;font-size:12px;letter-spacing:.4px;opacity:.8;margin-bottom:4px">פרט אמיתי · טיוטה</b>${esc(r.fact.he)}${r.fact.ref ? `<small style="display:block;margin-top:6px;font-size:12px;opacity:.75">${esc(r.fact.ref)}</small>` : ''}`;
  return r.fact;
}
