/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/around-ui.js — HOOK20: the DOM of "המסביב": the live "היום" board, the kohen's profile, the near circle's board ("המשמר שלי"),
 * the share line, the tab-row actions. The rules are hooks/around.js and hooks/riddle.js (pure). Registers __BH_PARTS.around.
 * Every row is a tappable button that goes to its place; nothing pressing, nothing lost. Texts are drafts (טיוטה).
 * ──────────────────────────────────────────────────────────────────────────── */
import * as A from './around.js';
import * as RD from './riddle.js';
import { STAGES } from '../content.js';
import * as S from '../state.js';
import * as TL from '../tools.js';   // ── tools21 ──
import { MISHMAROT } from '../../calendar.js';
import { CRAFTS, levelOf, shapeOf } from '../craftxp.js';
import { titleOf, nextTitle, fmt } from '../score.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stars = (n) => '★'.repeat(Math.max(0, Math.min(3, n | 0))) + '☆'.repeat(3 - Math.max(0, Math.min(3, n | 0)));
const he = (n) => fmt(n);
const pl = (n, one, many) => (n === 1 ? one : `${fmt(n)} ${many}`);

/* ── the styles: tokens from the HUD's (--gm-*), light and dark come with them ── */
export const CSS = `
.ar-row{display:flex;align-items:center;gap:10px;width:100%;min-height:48px;text-align:start;padding:8px 12px;margin:0 0 6px;border:1px solid var(--gm-line);border-radius:14px;background:var(--gm-raise);color:var(--gm-ink);font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.ar-row:active{transform:scale(.99)}
.ar-row .ar-ic{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--gm-bar);font:900 15px/1 "Heebo",sans-serif;color:var(--gm-gold)}
.ar-row .ar-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.ar-row .ar-t b{font-size:15px}.ar-row .ar-t small{font-size:13px;color:var(--gm-soft)}
.ar-row .ar-go{flex:none;color:var(--gm-faint);font-size:18px}
.ar-row.gold{border-color:var(--gm-gold-hi);box-shadow:0 0 0 1px #E8B94A55}
.ar-row.done .ar-ic{background:var(--gm-ok);color:#fff}
.ar-head{display:flex;align-items:center;gap:12px;margin:2px 0 10px}
.ar-seal{flex:none;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8B94A 60%,#B98A24);color:#4A3208;font:900 24px/1 "Heebo",sans-serif;box-shadow:inset 0 0 0 2px #fff7,0 2px 8px #0003}
.ar-head h3{margin:0;font-size:20px}.ar-head p{margin:2px 0 0;font-size:13px;color:var(--gm-soft)}
.ar-kv{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 10px}
.ar-kv div{background:var(--gm-bar);border-radius:12px;padding:8px 6px;text-align:center}.ar-kv b{display:block;font-size:20px;color:var(--gm-gold)}.ar-kv small{font-size:12px;color:var(--gm-soft)}
.ar-cr{display:flex;align-items:center;gap:8px;padding:6px 2px;border-bottom:1px solid var(--gm-line);font-size:14px}.ar-cr b{flex:1}.ar-cr i{font-style:normal;color:var(--gm-gold);letter-spacing:1px}.ar-cr small{color:var(--gm-soft)}
.ar-act{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 4px}
.ar-btn{min-height:44px;padding:8px 16px;border-radius:14px;border:1px solid var(--gm-line);background:var(--gm-raise);color:var(--gm-ink);font:700 15px "Heebo",sans-serif;cursor:pointer}
.ar-btn.gold{background:linear-gradient(#F5D77E,#E0A83A);border-color:#B98A24;color:#3B2A08}
.ar-rank{display:flex;align-items:center;gap:8px;min-height:48px;width:100%;padding:6px 12px;margin:0 0 6px;border:1px solid var(--gm-line);border-radius:14px;background:var(--gm-raise);color:var(--gm-ink);font:inherit;text-align:start}
.ar-rank.me{border-color:var(--gm-gold-hi);background:#E8B94A22}
.ar-rank .n{flex:none;width:26px;font:900 18px "Heebo",sans-serif;color:var(--gm-gold);text-align:center}
.ar-rank .w{flex:1;min-width:0}.ar-rank .w b{display:block;font-size:15px}.ar-rank .w small{font-size:12px;color:var(--gm-soft)}
.ar-rank .v{flex:none;text-align:end;font-size:13px;color:var(--gm-soft)}.ar-rank .v b{color:var(--gm-gold);font-size:16px}
.ar-in{box-sizing:border-box;min-height:44px;padding:6px 10px;border-radius:12px;border:1px solid var(--gm-line);background:var(--gm-raise);color:var(--gm-ink);font:16px "Heebo",sans-serif;width:100%}
.ar-code{font:900 26px/1.1 monospace;letter-spacing:5px;direction:ltr;text-align:center;padding:10px;background:var(--gm-bar);border-radius:12px;margin:6px 0}
.ar-form{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-top:6px}
.ar-note{font-size:12.5px;color:var(--gm-soft);margin:6px 0}
/* the level slot opens the profile (hook20) */
.gm-top .gm-xp[data-a]{pointer-events:auto;cursor:pointer;position:relative}.gm-top .gm-xp[data-a]::after{content:"";position:absolute;inset:-6px -4px}
/* the riddle */
.rd{padding:2px 0 6px}.rd h3{margin:0 0 2px;font-size:18px}.rd .rd-dots{display:flex;gap:6px;margin:4px 0 8px}.rd .rd-dots i{width:22px;height:6px;border-radius:3px;background:var(--gm-bar)}.rd .rd-dots i.on{background:var(--gm-gold-hi)}.rd .rd-dots i.cur{background:var(--gm-gold)}
.rd .rd-q{font-size:16px;font-weight:700;margin:4px 0 8px}
.rd .rd-slots{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.rd .rd-slot{flex:1 1 30%;min-width:96px;min-height:58px;border:2px dashed var(--gm-line);border-radius:14px;padding:6px;background:var(--gm-bar);color:var(--gm-ink);font:inherit;text-align:center;cursor:pointer}
.rd .rd-slot.hot{border-color:var(--gm-gold-hi);background:#E8B94A33}
.rd .rd-slot b{display:block;font-size:14px;margin-bottom:4px;color:var(--gm-gold)}
.rd .rd-chips{display:flex;flex-wrap:wrap;gap:6px}
.rd .rd-chip{min-height:44px;padding:6px 12px;border-radius:12px;border:1px solid var(--gm-line);background:var(--gm-raise);color:var(--gm-ink);font:700 14px "Heebo",sans-serif;cursor:pointer}
.rd .rd-chip.sel{border-color:var(--gm-gold-hi);box-shadow:0 0 0 2px #E8B94A88;background:#E8B94A33}
.rd .rd-chip.in{background:var(--gm-ok);color:#fff;border-color:transparent;min-height:36px;padding:4px 8px;cursor:default;margin:2px}
.rd .rd-chip.no{animation:rd-shake .32s}.rd .rd-chip.off{opacity:.38}.rd .rd-chip.ord{background:var(--gm-ok);color:#fff}
@keyframes rd-shake{25%{transform:translateX(5px)}75%{transform:translateX(-5px)}}
.rd .rd-stairs{display:block;width:100%;height:150px;background:var(--gm-bar);border-radius:14px;cursor:pointer;touch-action:manipulation}
.rd .rd-cnt{font:900 22px "Heebo",sans-serif;color:var(--gm-gold);text-align:center;margin:6px 0}
.rd .rd-hint{margin:8px 0;padding:8px 10px;border-radius:12px;background:#E8B94A2E;border:1px solid var(--gm-gold-hi);font-size:14px}
.rd .rd-foot{display:flex;gap:8px;margin-top:10px;align-items:center}
.rd .rd-say{font-size:13px;color:var(--gm-soft);min-height:18px}
.rd .rd-win{text-align:center;padding:10px 4px}.rd .rd-win .big{font:900 28px "Heebo",sans-serif;color:var(--gm-gold)}
.rd .rd-lock{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px 12px;border-radius:14px;background:var(--gm-bar);color:var(--gm-soft);filter:saturate(.3)}
.rd .rd-fact{margin:8px 0;padding:10px;border-radius:12px;background:var(--gm-bar);font-size:14px;text-align:start}.rd .rd-fact small{display:block;color:var(--gm-soft);margin-top:4px}
/* the end chain */
.ec{position:absolute;inset:0;z-index:60;display:grid;place-items:center;background:rgba(24,18,10,.22);pointer-events:none;opacity:0;transition:opacity .18s}
.ec-card{pointer-events:auto}
.ec.on{opacity:1}
.ec-card{position:relative;overflow:hidden;box-sizing:border-box;width:min(420px,88vw);padding:18px 18px 14px;border-radius:22px;background:var(--gm-solid);color:var(--gm-ink);border:1px solid var(--gm-gold-hi);box-shadow:0 12px 40px rgba(0,0,0,.4);text-align:center;direction:rtl;transform:translateY(14px) scale(.96);animation:ec-in .32s cubic-bezier(.2,1.3,.4,1) forwards}
@keyframes ec-in{to{transform:none}}
.ec-card h2{position:relative;margin:0 0 6px;font:900 24px/1.2 "Heebo",sans-serif;color:var(--gm-gold)}.ec-card p{position:relative;margin:4px 0;font-size:16px}
.ec-card .ec-big{position:relative;font:900 34px/1.1 "Heebo",sans-serif;color:var(--gm-gold)}
.ec-card .ec-bar{position:relative;height:14px;border-radius:7px;background:var(--gm-bar);margin:10px 4px;overflow:hidden}.ec-card .ec-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#E8B94A,#FFD66E);transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.ec-card .ar-btn{position:relative;margin-top:8px;min-width:140px}
.ec-card .gm-st-rays{opacity:.55;animation:ec-spin 6s linear infinite}
@keyframes ec-spin{to{transform:rotate(360deg)}}
@media (orientation:landscape) and (max-height:540px){.ec-card{padding:10px 14px 10px;width:min(380px,60vw)}.ec-card h2{font-size:20px}.ec-card .ec-big{font-size:26px}.ec-card p{font-size:14px;margin:2px 0}.ar-row{min-height:46px}}
@media (prefers-reduced-motion:reduce){.ec-card,.rd .rd-chip.no{animation:none;transform:none}.ec-card .gm-st-rays{animation:none}}

/* ── board21 ── the board's flashes (the yardstick: the Brawl Stars board): rows slide in 40 ms apart, the numbers count up, the player's row glows gold,
   the medals flip once, the level ring fills, the dinar coin spins when it lands. Base styles are the FINAL state; the animations are "from"
   states under .ar-play (added on open, removed after) — so a re-render or reduced motion lands on the true picture at once. */
.ar-rank{perspective:400px;position:relative}
.ar-rank .n.medal{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;margin-inline:-2px;font:900 16px/1 "Heebo",sans-serif;color:#3B2A08;box-shadow:inset 0 0 0 2px #fff8,0 1px 4px #0004}
.ar-rank .n.m1{background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8B94A 60%,#B98A24)}.ar-rank .n.m2{background:radial-gradient(circle at 35% 30%,#F4F6F8,#B8C0C8 60%,#8A939C)}.ar-rank .n.m3{background:radial-gradient(circle at 35% 30%,#F6D9BC,#CD8F55 60%,#97612F)}
.ar-rank.me{border-color:var(--gm-gold-hi);background:linear-gradient(90deg,#E8B94A33,#E8B94A18);box-shadow:0 0 0 1px #E8B94A99,0 0 14px #E8B94A55}
.ar-rank.demo{opacity:.92}.ar-rank.demo .w small{color:var(--gm-soft)}
.ar-rank em.ar-demo{font:700 11px/1 "Heebo",sans-serif;font-style:normal;padding:2px 6px;border-radius:8px;margin-inline-start:6px;background:var(--gm-bar);color:var(--gm-soft);border:1px dashed var(--gm-line);vertical-align:middle}
.ar-rank .ar-upa{flex:none;font:900 18px/1 "Heebo",sans-serif;color:#2E9B4F}
.ar-sec-d{display:flex;align-items:center;gap:8px;margin:10px 0 6px}.ar-sec-d b{flex:1;font-size:13px;color:var(--gm-soft)}
.ar-coin{display:inline-block;width:13px;height:13px;border-radius:50%;vertical-align:-2px;margin-inline-end:3px;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8B94A 60%,#B98A24);box-shadow:inset 0 0 0 1px #fff8,0 0 0 1px #B98A2488}
.ar-coin.big{width:22px;height:22px;vertical-align:-5px}
.ar-coin.spin{animation:ar-coin .7s ease-in-out both}
.ar-ring{position:relative;flex:none;width:68px;height:68px;display:grid;place-items:center}
.ar-ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.ar-ring circle{fill:none;stroke-width:5}.ar-ring .bg{stroke:var(--gm-bar)}
.ar-ring .f{stroke:#E8B94A;stroke-linecap:round;stroke-dasharray:176;stroke-dashoffset:calc(176 * (1 - var(--f,0)))}
.ar-ring .ar-seal{width:52px;height:52px;font-size:22px}
.ar-play .ar-rank,.ar-play .ar-cr,.ar-play .ar-kv div{animation:ar-slide .34s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0) * 40ms)}
.ar-play .ar-rank.me{animation:ar-slide .34s cubic-bezier(.2,.8,.2,1) both,ar-glow 1.3s ease-in-out .5s 3;animation-delay:calc(var(--i,0) * 40ms),calc(var(--i,0) * 40ms + 500ms)}
.ar-play .ar-rank .n.medal{animation:ar-flip .9s ease-in-out both;animation-delay:calc(var(--i,0) * 40ms + 380ms)}
.ar-play .ar-seal{animation:ar-flip .9s ease-in-out .3s both}
.ar-play .ar-ring .f{animation:ar-ring .95s cubic-bezier(.2,.8,.2,1) .2s both}
.ar-play .ar-rank .ar-upa{animation:ar-up .7s ease-in-out .9s 3 both}
@keyframes ar-slide{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
@keyframes ar-glow{0%,100%{box-shadow:0 0 0 1px #E8B94A99,0 0 6px #E8B94A33}50%{box-shadow:0 0 0 2px #FFD66E,0 0 22px #FFD66Ecc}}
@keyframes ar-flip{from{transform:perspective(160px) rotateY(0)}to{transform:perspective(160px) rotateY(360deg)}}
@keyframes ar-ring{from{stroke-dashoffset:176}}
@keyframes ar-coin{from{transform:perspective(120px) rotateY(0)}to{transform:perspective(120px) rotateY(720deg)}}
@keyframes ar-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
/* the end chain: the bar's shine, the locked silhouette of tomorrow */
.ec-card .ec-bar i{position:relative;transition:width 1.3s cubic-bezier(.22,.9,.25,1)}
.ec-card .ec-bar i::after{content:"";position:absolute;top:0;bottom:0;width:36px;inset-inline-start:-40px;background:linear-gradient(100deg,transparent,#FFFFFFAA,transparent);animation:ec-shine 1.3s ease-in-out .15s 1 both}
@keyframes ec-shine{to{inset-inline-start:calc(100% + 4px)}}
.ec-lock{position:relative;display:flex;align-items:center;gap:10px;margin:8px 4px 2px;padding:10px 12px;border-radius:14px;background:var(--gm-bar);border:1px dashed var(--gm-line);text-align:start}
.ec-lock .sil{flex:none;width:34px;height:34px;border-radius:50%;background:#0003;display:grid;place-items:center}
.ec-lock .sil::before{content:"";width:12px;height:9px;border-radius:2px;background:var(--gm-soft);box-shadow:0 -7px 0 -3px transparent;margin-top:5px}
.ec-lock .sil::after{content:"";position:absolute;width:8px;height:8px;border:2px solid var(--gm-soft);border-bottom:0;border-radius:6px 6px 0 0;margin-top:-6px}
.ec-lock b{display:block;font-size:14px}.ec-lock small{color:var(--gm-soft);font-size:12px}
@media (prefers-reduced-motion:reduce){.ar-play .ar-rank,.ar-play .ar-cr,.ar-play .ar-kv div,.ar-play .ar-rank .n.medal,.ar-play .ar-seal,.ar-play .ar-ring .f,.ar-play .ar-rank .ar-upa,.ar-rank .ar-upa,.ar-coin.spin,.ec-card .ec-bar i::after{animation:none!important}.ec-card .ec-bar i{transition:none}}
/* ── /board21 ── */
`;
export function injectCSS(doc = document) {
  if (doc.getElementById('ar20-css')) return;
  const st = doc.createElement('style'); st.id = 'ar20-css'; st.textContent = CSS; doc.head.appendChild(st);
}

/* ── the live board: "היום" ── */
const row = (to, ic, t, small, cls = '') => `<button class="ar-row ${cls}" data-a="aroundGo" data-to="${to}"><span class="ar-ic" aria-hidden="true">${ic}</span><span class="ar-t"><b>${t}</b>${small ? `<small>${small}</small>` : ''}</span><span class="ar-go" aria-hidden="true">‹</span></button>`;
export function riddleState(G, day, done = 0) {
  const c = RD.current(G, day, done);
  if (!c) return { has: false };
  return { has: true, solved: !!c.R.solved, title: c.def.title, step: c.R.step, of: c.def.steps.length, tomorrow: RD.tomorrow(day, done) };
}
const doneStages = (G) => STAGES.filter((s) => S.isDone(G, s.id)).length;
export function boardHTML(G, now, sc) {
  const day = A.dayOf(now), td = A.today(G, day), sk = A.streak(G, day), rs = riddleState(G, day, doneStages(G));
  const mish = G.mishmar ? `משמר ${esc(MISHMAROT[G.mishmar - 1] || '')}` : '';
  let h = `<div class="gm-sec" style="margin-top:0">מה בנית היום</div>`;
  h += row('store', '▤', td.courses || td.stones || td.jobs ? `${pl(td.courses, 'נדבך אחד', 'נדבכים')} · ${pl(td.stones, 'אבן אחת', 'אבנים')}` : 'היום עוד לא התחלת לבנות', `★ ${he(td.pts)} נקודות היום${td.jobs ? ` · ${he(td.jobs)} עבודות` : ''}`);
  h += row('crews', '☗', `הצוות שלי: ${he((G.crews || []).length)} אומנים`, mish || (G.name ? esc(G.name) : ''));
  if (rs.has) h += row('riddle', rs.solved ? '✓' : '?', rs.solved ? 'חידת היום נפתרה' : `חידת היום: ${esc(rs.title)}`, rs.solved ? `מחר חידה חדשה${rs.tomorrow ? `: ${esc(rs.tomorrow)}` : ''}` : `שלב ${rs.step + 1} מתוך ${rs.of} · בלי טיימר, בלי עונש`, rs.solved ? 'done' : 'gold');
  h += row('profile', '☀', sk.n > 1 ? `${he(sk.n)} ימים ברצף` : sk.days > 1 ? 'יום 1 מחדש' : 'יום 1', `${pl(sk.days, 'יום משחק אחד', 'ימי משחק')} בסך הכול`);
  const g = sc || {};
  h += row('treasure', '◉', `דינרים: ${he(g.coins || 0)}`, `עוד ★ ${he(g.left == null ? 10000 : g.left)} לדינר הבא`);
  h += row('circle', '☷', 'המשמר שלי', 'הכהנים בטלפון הזה, והמשפחה');
  h += `<p class="ar-note">מחר: ${esc(A.tomorrowLine(G, rs.has ? rs.tomorrow : ''))}</p>`;
  return h + `<div class="gm-sec">המשימות של היום</div>`;
}

/* ── the kohen's profile ── */
export function shareLine(G, now, sc) {
  const L = A.lineOf(G, A.dayOf(now)), t = titleOf(L.d) || 'כהן';
  return `${L.name || 'כהן'}, ${t} · ${he(L.d)} דינרים · ${he(L.s)} אבנים · ${he(L.t)} ימים ברצף · בונים את בית המקדש השני`;
}
export function profileHTML(G, now, sc) {
  const day = A.dayOf(now), L = A.lineOf(G, day), sk = A.streak(G, day), t = titleOf(L.d), nt = nextTitle(L.d);
  const xp = G.xp && typeof G.xp === 'object' ? G.xp : {}, lv = Object.values(xp).reduce((m, v) => Math.max(m, levelOf(+v || 0)), 1);
  const best = (G.around && G.around.best) || {};
  const topK = Object.keys(xp).reduce((m, k) => (m == null || (+xp[k] || 0) > (+xp[m] || 0) ? k : m), null), sh = topK ? shapeOf(topK, +xp[topK] || 0) : null;
  const fr = sh && sh.next ? Math.max(0, Math.min(1, ((+xp[topK] || 0) - sh.base) / Math.max(1, sh.next - sh.base))) : (sh ? 1 : 0);   // ── board21 ── the level ring: progress to the next level of the craft he plays most
  let h = `<div class="ar-head"><span class="ar-ring" style="--f:${fr.toFixed(3)}" role="img" aria-label="רמה ${lv}, ${Math.round(fr * 100)} אחוז לרמה הבאה"><svg viewBox="0 0 68 68" aria-hidden="true"><circle class="bg" cx="34" cy="34" r="28"/><circle class="f" cx="34" cy="34" r="28"/></svg><span class="ar-seal" aria-hidden="true">${lv}</span></span><div><h3>${esc(L.name || 'כהן')}</h3><p>${esc(t || 'כהן בתחילת הדרך')}${G.mishmar ? ` · משמר ${esc(MISHMAROT[G.mishmar - 1] || '')}` : ''}</p></div></div>`;
  const cu = (n) => `<b class="cu" data-to="${n}">${he(n)}</b>`;
  h += `<div class="ar-kv"><div style="--i:0">${cu(L.d)}<small><i class="ar-coin" aria-hidden="true"></i>דינרים</small></div><div style="--i:1">${cu(L.s)}<small>אבנים</small></div><div style="--i:2">${cu(L.t || sk.n)}<small>ימים ברצף</small></div></div>`;
  h += `<p class="ar-note">★ ${he(L.score)} נקודות${nt ? ` · עוד ${pl(nt.left, 'דינר אחד', 'דינרים')} לתואר ${esc(nt.t)}` : ''} · ${pl(sk.days, 'יום משחק אחד', 'ימי משחק')} · ${he(doneStages(G))} מתוך ${he(STAGES.length)} שלבים נבנו</p>`;
  h += `<div class="gm-sec">המלאכות שלמדתי</div>`;
  const keys = Object.keys(xp).filter((k) => xp[k] > 0);
  h += keys.length ? keys.map((k, ki) => { const C = CRAFTS[k] || { name: k, icon: '⚒' }; return `<div class="ar-cr" style="--i:${ki + 3}"><span aria-hidden="true">${C.icon}</span><b>${esc(C.name)}</b><small>רמה ${levelOf(xp[k])}</small><i aria-label="הציון הטוב ביותר">${stars(best[k] || 0)}</i></div>`; }).join('') : `<p class="ar-note">עוד לא למדת מלאכה. בעבודה הראשונה היא תופיע כאן.</p>`;
  // ── tools21 ── "הכלים שלי": each tool, its tier's name and its multiplier (a better tool is prettier and pays more)
  h += `<div class="gm-sec">הכלים שלי</div>` + TL.IDS.map((id) => { const t = TL.tierOf(G, id); return `<div class="ar-cr" data-tool="${id}"><span aria-hidden="true">${'●'.repeat(t)}${'○'.repeat(3 - t)}</span><b>${esc(TL.nameOf(G, id))}</b><small>${TL.XM(TL.multOf(G, id))}</small></div>`; }).join('');
  // ── /tools21 ──
  h += `<div class="ar-act"><button class="ar-btn gold" data-a="aroundShare">שתף</button><button class="ar-btn" data-a="aroundGo" data-to="circle">המשמר שלי</button><button class="ar-btn" data-a="aroundGo" data-to="menu">תפריט</button></div>`;
  return h;
}

/* ── the near circle: "המשמר שלי" ── */
export function circleHTML(G, now, store) {
  const day = A.dayOf(now), L = A.lineOf(G, day);
  const B = A.boardRows(G, day, store, G), rows = B.rows;
  let h = `<p class="ar-note">הכהנים של הטלפון הזה, ומי שהקלדת מהמשפחה. הכול נשאר אצלכם: אין שרת ואין שמות של זרים.${B.fam === 0 && B.shown ? ' עד שיצטרפו בני משפחה, שלושה כהנים מהמחשב מראים איפה אתה עומד: דמויות לדוגמה, לא ילדים אמיתיים.' : ''}</p><div class="gm-sec" style="margin-top:6px">הדירוג</div>`;
  const rowH = (r, i) => {
    const attr = r.demo || r.kin || r.cur ? 'disabled' : `data-a="aroundSlot" data-id="${esc(r.id)}"`;
    const medal = i < 3 ? ` medal m${i + 1}` : '';
    const sub = r.demo ? 'דמות לדוגמה: כהן מהמחשב, לא ילד אמיתי' : r.kin ? 'מהמשפחה, לפי הקוד שהוקלד' : r.cur ? 'משחק עכשיו' : 'הקש כדי לעבור לכהן הזה';
    const cu = (n) => `<b class="cu" data-to="${n}">${he(n)}</b>`;
    return `<button class="ar-rank ${r.cur ? 'me' : ''} ${r.demo ? 'demo' : ''}" style="--i:${i}" data-me="${r.cur ? 1 : 0}" ${attr}><span class="n${medal}">${i + 1}</span><span class="w"><b>${esc(r.name)}${r.cur ? ' (אני)' : ''}${r.demo ? '<em class="ar-demo">לדוגמה</em>' : ''}</b><small>${sub}</small></span><span class="v"><i class="ar-coin" aria-hidden="true"></i>${cu(r.d)} ${r.d === 1 ? 'דינר' : 'דינרים'}<br>${r.s === 1 ? 'אבן אחת' : `${cu(r.s)} אבנים`} · ${r.t === 1 ? 'יום אחד' : `${cu(r.t)} ימים`}</span></button>`;
  };
  const top = rows.filter((r) => !r.demo || B.fam === 0), low = rows.filter((r) => r.demo && B.fam > 0);
  top.forEach((r, i) => { h += rowH(r, i); });
  if (B.fam > 0) {
    h += `<div class="ar-sec-d"><b>${B.shown ? 'דמויות לדוגמה (כהנים מהמחשב)' : 'דמויות לדוגמה מוסתרות'}</b><button class="ar-btn" data-a="aroundDemo">${B.shown ? 'הסתר' : 'הצג'}</button></div>`;
    low.forEach((r, i) => { h += rowH(r, top.length + i); });
  }
  h += `<div class="ar-act"><button class="ar-btn" data-a="aroundSlotAdd">+ כהן נוסף בטלפון הזה</button></div>`;
  h += `<div class="gm-sec">הקוד שלי</div><div class="ar-code" dir="ltr">${A.codeOf(L)}</div><p class="ar-note">בני המשפחה מקלידים את הקוד בטלפון שלהם. הקוד נושא מספרים בלבד: דינרים, אבנים וימים.</p>`;
  h += `<div class="gm-sec">להוסיף את אחי / בן דוד</div><div class="ar-form"><input class="ar-in" id="ar-kl" maxlength="14" placeholder="שם: אחי" aria-label="שם"><input class="ar-in" id="ar-kc" maxlength="8" placeholder="הקוד" dir="ltr" autocapitalize="characters" aria-label="הקוד של בן המשפחה"><button class="ar-btn gold" data-a="aroundKin">הוסף</button></div><p class="ar-note" id="ar-km" aria-live="polite"></p>`;
  return h;
}

/** the tab row's own actions (ui.js's default branch calls this). env: { ui, ctx, store, reload } → true when handled */
export function handle(a, d, env, el) {
  const { ui, ctx } = env, G = ctx.G(), now = ctx.now();
  if (a === 'aroundGo') { const to = d.to; if (to === 'riddle' || to === 'profile' || to === 'circle' || to === 'treasure' || to === 'menu' || to === 'store' || to === 'crews' || to === 'book' || to === 'daily') ui.openSheet(to); return true; }
  if (a === 'aroundShare') {
    const text = shareLine(G, now, ctx.score && ctx.score());
    try { if (navigator.share) { navigator.share({ text }).catch(() => {}); return true; } } catch (e) { /* no share */ }
    try { navigator.clipboard.writeText(text); ui.toast({ icon: 'star', title: 'הועתק', body: text, ms: 2800 }); } catch (e) { ui.toast({ icon: 'star', title: 'השורה שלי', body: text, ms: 5000 }); }
    return true;
  }
  if (a === 'aroundDemo') { if (A.ensure(G)) { G.around.demo = A.boardRows(G, A.dayOf(now), env.store, G).shown ? 'hide' : 'show'; ctx.act.persistNow && ctx.act.persistNow(); ui.renderSheet(); } return true; }
  if (a === 'aroundSlotAdd') { const id = A.slotAdd(env.store); ctx.act.persistNow && ctx.act.persistNow(); A.slotSwitch(id, env.store); env.reload(); return true; }
  if (a === 'aroundSlot') { ctx.act.persistNow && ctx.act.persistNow(); if (A.slotSwitch(d.id, env.store)) env.reload(); return true; }
  if (a === 'aroundKin') {
    const root = el && el.closest('.gm-sh-b') || document, l = root.querySelector('#ar-kl'), c = root.querySelector('#ar-kc'), m = root.querySelector('#ar-km');
    const ok = A.addKin(G, l && l.value, c && c.value, now);
    if (m) m.textContent = ok ? 'נוסף לדירוג.' : 'הקוד לא מתאים. בדקו שהוא בן 6 תווים ושרשמתם שם.';
    if (ok) { ctx.act.persistNow && ctx.act.persistNow(); ui.renderSheet(); }
    return true;
  }
  return false;
}

/** the book's page: the daily riddle's row, and the facts the solved ones kept */
export function bookRiddle(G, now) {
  const day = A.dayOf(now), rs = riddleState(G, day, doneStages(G)), kept = RD.solvedBook(G);
  let h = '';
  if (rs.has) h += row('riddle', rs.solved ? '✓' : '?', rs.solved ? 'חידת היום נפתרה' : `חידת היום: ${esc(rs.title)}`, rs.solved ? 'מחר חידה חדשה' : 'חידה על המקדש. עזרה אחרי חצי דקה', rs.solved ? 'done' : 'gold');
  if (kept.length) h += `<div class="gm-sec">נשמר מן החידות</div>` + kept.map((k) => `<div class="gm-row" style="display:block"><b>${esc(k.title)}</b><small style="display:block">${esc(k.fact)} · ${esc(k.ref)} · טיוטה</small></div>`).join('');
  return h;
}

// ── board21 ── on open: the board scrolls to the player's own row, rows slide in, numbers count up, the rank-up stamps, the coin spins
const reduced = () => { try { return !!(globalThis.matchMedia && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
export const COUNT_MS = 600;
let playTok = 0;
/** root: the sheet body (.gm-sh-b). env: { G, now, stamp(text, o), banner(text, o) }. Returns { place, up, reduced } (for tests) */
export function onOpen(kind, root, env = {}) {
  if (!root || (kind !== 'circle' && kind !== 'profile')) return null;
  const red = reduced(), out = { place: 0, up: false, reduced: red };
  root.classList.remove('ar-play'); root.dataset.arTok = String(++playTok);   // (a play left over from an earlier open ends here)
  const nums = [...root.querySelectorAll('.cu')];
  const final = () => { nums.forEach((e) => { e.textContent = he(+e.dataset.to || 0); }); };
  if (kind === 'circle') {
    const rowsEl = [...root.querySelectorAll('.ar-rank')], me = root.querySelector('.ar-rank.me');
    // the board scrolls to HIS row — the kid looks for himself (centred in the sheet's body)
    if (me) { const b = root.getBoundingClientRect(), r = me.getBoundingClientRect(); if (r.top < b.top + 4 || r.bottom > b.bottom - 4) root.scrollTop = Math.max(0, root.scrollTop + (r.top - b.top) - (b.height - r.height) / 2); }   // (a board that fits stays whole)
    // the place among the ranked rows (the demos at the bottom are not above him); a key of the kind of board: a change of the set is not a climb
    const place = me ? rowsEl.indexOf(me) + 1 : 0, fam = rowsEl.filter((e) => !e.classList.contains('demo') && e.dataset.me !== '1').length, dem = rowsEl.filter((e) => e.classList.contains('demo')).length;
    if (env.G && place) {
      const rs = A.rankSeen(env.G, place, fam + '|' + dem); out.place = place; out.up = rs.up;
      if (rs.up && me) {
        const arrow = (root.ownerDocument || document).createElement('i'); arrow.className = 'ar-upa'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '▲';
        me.appendChild(arrow);
        const txt = `עלית למקום ${place}!`;
        if (!red && env.stamp) { try { env.stamp(txt, { ms: 1500, cue: '' }); } catch (e) { /* the stamp's */ } }
        else if (env.banner) { try { env.banner(txt, { ms: 2200 }); } catch (e) { /* the banner's */ } }
        out.text = txt;
      }
    }
  }
  if (red) { final(); return out; }
  root.classList.add('ar-play'); const tok = ++playTok; root.dataset.arTok = String(tok);
  const t0 = performance.now(); nums.forEach((e) => { e.textContent = '0'; });
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / COUNT_MS), e = 1 - Math.pow(1 - k, 3);
    nums.forEach((el) => { el.textContent = he(Math.round((+el.dataset.to || 0) * e)); });
    if (k < 1) (globalThis.requestAnimationFrame || ((f) => setTimeout(f, 16)))(step);
  };
  step();
  setTimeout(() => { final(); if (root.dataset.arTok !== String(tok)) return; root.querySelectorAll('.ar-coin').forEach((c) => c.classList.add('spin')); }, COUNT_MS + 30);   // (the true number, whatever the frames did; the coin lands)
  setTimeout(() => { if (root.dataset.arTok !== String(tok)) return; root.classList.remove('ar-play'); root.querySelectorAll('.ar-coin.spin').forEach((c) => c.classList.remove('spin')); }, 4600);   // (only this open's own timer: a later open keeps its play)
  return out;
}
// ── /board21 ──
