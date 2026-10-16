/* ── slice27 ── slice27.js — WAVE27 SLICE27: six works "done" (PLAY27 §ב; the six thumb verbs): המדורה (beat), תרומת הדשן (carry),
 * המערכה (aim), המוכני והקידוש (hold), האברים (target), הפיס (stop). This file holds what the six share:
 *   · the per-work level counter in the save — A.day.lv27[work] = { gold, lv } (gold: the gold runs, practice runs count; level 2 opens
 *     at 3 gold runs of level 1) — s27Opts(ctx) hands a work's model { level: 0 | 1, l2 } (level 1 = acts.js's narrower gold window too);
 *   · the stamp with a name after the source line (`.s27-stamp`), and "רמה 2 נפתחה";
 *   · the events table (one sample: the coal on the ramp) — a second event is a data entry in EVENTS27;
 *   · a tap on a figure/target in the world (the canvas, not the button): pick27;
 *   · the beat of a rhythm work when no music plays (beat27).
 * No penalties: a wrong pick is a word ("זו של הקטורת"), never a loss. Nothing red. No Divine Name. ── /slice27 ── */

/** the work ids of the slice (task.work → the counter's key) */
export const SLICE27 = { fire: 'fire', deshen: 'deshen', maaracha: 'maaracha', kiddush: 'kiddush', evarim: 'evarim', payis: 'payis', payis2: 'payis' };
export const STAMP27 = { fire: 'האש נשמרה', deshen: 'מחצי הכבש ולמטה', maaracha: 'שלוש מערכות', kiddush: 'הכיור מלא', evarim: 'כולם בשורה', payis: 'ניחשתם!' };
export const STAMP27_ICON = { fire: '🔥', deshen: '🥄', maaracha: '🪵', kiddush: '💧', evarim: '🧺', payis: '☝' };
export const GOLD_RUNS = 3, GOLD_Q = 0.88;   // ⚑ (a gold run: the acts' quality ≥ 0.88 — most acts gold)
const keyOf = (work) => SLICE27[work] || null;

/* ───────── the save ───────── */
const ST = { box: null, persist: null };
export function bind27(dayBox, persist) { if (typeof document !== 'undefined') css27(document); ST.box = dayBox || null; ST.persist = persist || null; if (ST.box && (!ST.box.lv27 || typeof ST.box.lv27 !== 'object')) ST.box.lv27 = {}; }
function rec(key) { const b = ST.box && ST.box.lv27; if (!b) return { gold: 0, lv: 1 }; if (!b[key] || typeof b[key] !== 'object') b[key] = { gold: 0, lv: 1 }; const r = b[key]; if (!Number.isFinite(r.gold)) r.gold = 0; if (r.lv !== 2) r.lv = r.gold >= GOLD_RUNS ? 2 : 1; return r; }
export function level27(work) { const k = keyOf(work); return k ? rec(k).lv : 1; }
/** a run ended: count it (gold → +1; practice runs count too). → { key, gold, lv, up: true when level 2 opened now, isGold } */
export function record27(work, r) {
  const k = keyOf(work); if (!k || !r || r.skipped || r.ok === false) return null;
  const R = rec(k), q = Number.isFinite(r.quality) ? r.quality : 0, isGold = q >= GOLD_Q || (k === 'payis' && !!r.guessed);
  let up = false;
  if (isGold) { R.gold++; if (R.lv < 2 && R.gold >= GOLD_RUNS) { R.lv = 2; up = true; } }
  try { ST.persist && ST.persist(); } catch (e) { /* */ }
  return { key: k, gold: R.gold, lv: R.lv, up, isGold };
}
/** the options a work's model is made with (the reg's model(ctx)) */
export function s27Opts(ctx) {
  const w = ctx && ctx.task ? ctx.task.work : null, lv = w ? level27(w) : 1, f = +globalThis.__S27_LV;
  const L2 = f === 2 || (f !== 1 && lv >= 2);
  return { level: L2 ? 1 : 0, l2: L2, practice: !!(ctx && ctx.task && ctx.task.practice), finger: true /* (the lots open with his own finger) */ };
}

/* ───────── the events (data): one sample — the coal on the ramp ───────── */
/** each: { id, work, he, say, pts, when(M) → bool (the model's moment it may fire), chance(M, run) → bool } */
export const EVENTS27 = [
  { id: 'coal', work: 'deshen', he: 'גחלת נפלה על הכבש — הקישו עליה וכבו אותה', done: 'כיביתם! הכבש נקי', src: 'המחשה', pts: 20,
    when: (M) => !!(M.mv && M.mv.act === 'down' && M.mv.t > 0.32 && M.mv.t < 0.6),
    chance: (M, run) => M.l2 || run % 2 === 1 || globalThis.__S27_EV === 1 },
];
const RUNS = {};   // (the runs of each work this session: the event's rhythm — never random)
export function evBegin(M, work) { RUNS[work] = (RUNS[work] | 0) + 1; M.ev27 = null; M.evDone = []; M.evRun = RUNS[work] - 1; if (globalThis.__S27_EV === 0) M.evOff = true; }
/** the model's step: may an event fire now? → the event (it is set on M.ev27: the model pauses its act until the tap resolves it) */
export function evTick(M, work) {
  if (M.ev27 || M.evOff || M.phase !== 'work') return null;
  for (const E of EVENTS27) {
    if (E.work !== work || M.evDone.includes(E.id)) continue;
    if (!E.when(M)) continue;
    M.evDone.push(E.id);
    if (!E.chance(M, M.evRun | 0)) continue;
    M.pending = 0; M.ev27 = { id: E.id, E, t: 0 }; M.say = E.he; M.sayT = 6; M.fx.push({ sfx: 'tick', haptic: [10, 20, 10] });
    try { (globalThis.__S27E = globalThis.__S27E || []).push({ id: E.id, fired: Math.round(performance.now()) }); } catch (e) { /* */ }
    return M.ev27;
  }
  return null;
}
/** the tap that resolves it (one tap; gold, a word, "המחשה") — the caller's act */
export function evResolve(M, bonusFn) {
  const v = M.ev27; if (!v) return false;
  M.ev27 = null; M.say = `${v.E.done} · ${v.E.src}`; M.sayT = 2.4; M.evPut = 0.8;
  try { bonusFn && bonusFn(v.E.pts, v.E.done); } catch (e) { /* */ }
  M.fx.push({ sfx: 'perfect', haptic: [12, 30, 18] });
  try { const L = globalThis.__S27E || []; for (let i = L.length - 1; i >= 0; i--) if (L[i].id === v.id && !L[i].res) { L[i].res = Math.round(performance.now()); break; } } catch (e) { /* */ }
  return true;
}

/* ───────── a tap on a target in the world (the canvas) ───────── */
const PK = { on: false, list: [], fn: null, r: 80, f: 0 };
/** a touch on the world: the canvas, or the walk zone that lies over the canvas's lower left (during a work a figure there is a target
 *  too) — never a button, the HUD, a card or the list */
export function worldTarget(e) {
  const t = e && e.target; if (!t) return false;
  const c = document.getElementById('c') || document.querySelector('canvas'); if (t === c) return true;
  if (!t.closest) return false;
  if (t.closest('button, .tw-btn, .tw-goal, .dy-hud, .dy-list, .dy-say, [data-dy], .g27-skip, .tw-mk, a, input')) return false;
  return !!t.closest('.tw-zone, .tw-base') || t.classList.contains('gm');
}
function pkDown(e) {
  if (!PK.list.length || !PK.fn) return;
  try { globalThis.__S27PK = { t: e.target && (e.target.id || String(e.target.className).slice(0, 24) || e.target.tagName), x: e.clientX, y: e.clientY, n: PK.list.length }; } catch (x) { /* */ } if (!worldTarget(e)) return;
  let best = null, bd = PK.r; for (const p of PK.list) { const d = Math.hypot(p.x - e.clientX, p.y - e.clientY); if (d < bd) { bd = d; best = p; } }
  if (best && PK.fn(best.id) !== false) { e.stopImmediatePropagation(); e.preventDefault(); }
}
/** the targets this frame: list = [{ id, x, y }] in CSS px (empty → off); fn(id) → false when not taken */
export function pick27(list, fn, r = 80) {
  PK.list = list || []; PK.fn = fn; PK.r = r; PK.f = performance.now();
  const want = PK.list.length > 0;
  if (want !== PK.on && typeof window !== 'undefined') { PK.on = want; if (want) window.addEventListener('pointerdown', pkDown, true); else window.removeEventListener('pointerdown', pkDown, true); }
}
export const pickList27 = () => PK.list.slice();

/* ───────── the beat (the music's when it plays, else the work's own metronome) ───────── */
/** → { period, u (0…1 since the last beat), err (s to the nearest beat) } — `t` the work's own clock, `p` its period */
export function beat27(t, p) {
  try { const B = globalThis.__CRAFT_BEAT ? globalThis.__CRAFT_BEAT() : null; if (B && B.period > 0 && Number.isFinite(+B.toNext)) { const P = +B.period, to = ((+B.toNext % P) + P) % P, since = P - to; return { period: P, u: since / P, err: Math.min(since, to) }; } } catch (e) { /* */ }
  const ph = ((t % p) + p) % p; return { period: p, u: ph / p, err: Math.min(ph, p - ph) };
}
/** the grade of a tap now: gold within `win` s of the beat, good within 0.24, else ok (it still counts: a log is a log) */
export const beatGrade27 = (b, win) => (b.err <= win ? 2 : b.err <= 0.24 ? 1 : 0);

/* ───────── the stamp (after the source line) ───────── */
const CSS27 = `.dy-gm.s27-busy .dy-hud{pointer-events:none}.s27-stamp{position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 22px 12px;border-radius:18px;background:rgba(40,30,16,.82);border:3px solid #E8C25A;color:#FFF1CC;z-index:33;pointer-events:none;opacity:0;font:900 30px/1.05 "Heebo",sans-serif;text-shadow:0 2px 8px #000;direction:rtl}
.s27-stamp.on{animation:s27-st 3.4s ease-out forwards}.s27-stamp.on.hold{animation:none;opacity:1;transform:translate(-50%,-50%) rotate(-3deg)}.s27-stamp i{font-style:normal;font-size:28px}.s27-stamp small{font:700 13px/1.2 "Heebo",sans-serif;color:#F3DFA8}.s27-stamp em{font:800 15px/1.2 "Heebo",sans-serif;color:#9FE0A8;font-style:normal}
@keyframes s27-st{0%{opacity:0;transform:translate(-50%,-50%) scale(2) rotate(-6deg)}14%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-3deg)}82%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1) rotate(-3deg)}}`;
let stampEl = null;
function css27(doc) { try { if (doc && doc.head && !doc.getElementById('s27-css')) { const s = doc.createElement('style'); s.id = 's27-css'; s.textContent = CSS27; doc.head.appendChild(s); } } catch (e) { /* node */ } }
/** show the stamp: the work's name, its gold count toward level 2 (or the level), "רמה 2 נפתחה!" */
export function stamp27(root, work, info, r) {
  const k = keyOf(work); if (!k || !root) return null;
  const doc = root.ownerDocument || document;
  css27(doc);
  if (!stampEl || !stampEl.isConnected) { stampEl = doc.createElement('div'); stampEl.className = 's27-stamp'; stampEl.setAttribute('role', 'status'); root.appendChild(stampEl); }
  let name = STAMP27[k];
  if (k === 'payis' && !(r && r.guessed)) name = 'הפיס נספר';   // ⚑ (a lot without a right guess: "הפיס נספר"; with one — "ניחשתם!")
  const I = info || { gold: 0, lv: 1 }, prog = I.lv >= 2 ? 'רמה 2' : `זהב ${Math.min(I.gold, GOLD_RUNS)}/${GOLD_RUNS} לרמה 2`;
  stampEl.innerHTML = `<i>${STAMP27_ICON[k] || '★'}</i><b>${name}</b><small>${prog}${r && r.practice ? ' · תרגול' : ''}</small>${I.up ? '<em>רמה 2 נפתחה!</em>' : ''}`;
  stampEl.classList.remove('on'); void stampEl.offsetWidth; stampEl.classList.add('on'); stampEl.classList.toggle('hold', !!globalThis.__S27_STAMP_HOLD); clearTimeout(stampEl.__t); stampEl.__t = setTimeout(() => stampEl && stampEl.classList.remove('on', 'hold'), globalThis.__S27_STAMP_HOLD ? 30000 : 3500);   // (__S27_STAMP_HOLD: tests — the shot takes seconds)
  const rec2 = { work: k, name, at: Math.round(performance.now()), lv: I.lv, gold: I.gold, up: !!I.up };
  try { (globalThis.__S27S = globalThis.__S27S || []).push(rec2); } catch (e) { /* */ }
  return rec2;
}
try { globalThis.__S27 = { level: level27, opts: s27Opts, events: EVENTS27, picks: pickList27, box: () => ST.box && ST.box.lv27 }; } catch (e) { /* node */ }
// ── /slice27 ──
