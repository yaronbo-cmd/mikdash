/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/index.js: the engagement layer of Phase A (HOOKS agent, docs/HOOKS.md). Everything the playtest bots found
 * missing between "a strike" and "a reason to come back", as one module the game controller calls:
 *
 *   const hooks = createHooks({ G: () => G, now, ui, emit, sfx, coach, act, busy });
 *   hooks.mount()                     after ui.mount(): the appointment strip under the goal pill
 *   hooks.tick(t)                     every second: strip countdowns, the rest card, the just-in-time hint, festivals
 *   hooks.goalNote(G, r) / goalAction(r)   the goal pill: an ETA or an action when the goal waits
 *   hooks.onStrike() · onMash() · tapMeter    honest rhythm (hooks/rhythm.js)
 *   hooks.stageDoneExtra(c)            finds inline, what opens now, the chapter ladder (one card instead of four)
 *   hooks.ftueEndText() · welcomeNext() · sessionEnd()
 *
 * Rules kept (PROJECT.md §2, GDD §10): no gambling, no purchases, no fake scarcity, no guilt or streak-loss shaming,
 * nothing lost by leaving. The rest card says so in words: the site works for you, leave whenever you like.
 * All texts are drafts (טיוטה).
 * ──────────────────────────────────────────────────────────────────────────── */
import * as LOOP from './loop.js';  // wave 6: registers __BH_PARTS.fun (the new loop's hooks) for BUILD's index.js
import '../minigames/index.js';     // wave 6: registers __BH_PARTS.minigames (the site's precision games)
import { ROUTES, RIDX, RES, FINDS, STAGES, MOMENTS, stageById, T, TRAIN } from '../content.js';
import { srcHTML } from '../ui.js';
import * as S from '../state.js';
import * as N from './next.js';
import * as R from './rhythm.js';
import * as D from './demo.js';
import * as WK from './week.js';
import { dayInfo } from '../../calendar.js';
import * as AV from './avodah.js';
import MYST from '../../../content/mysteries.json' with { type: 'json' };
import '../../avodah/hooks/tour.js';   // (round 3) the scenes panel's hook (stamps, the next stop, the doors) is registered at start: the tour opens from Phase A too

const REST_AFTER_S = 20;          // this long with nothing to do (and no strike) → the rest card
const IDLE_CUE_S = 30;            // (round 3) crews waiting at a blocked site this long → one cue, with one tap to move them
const REST_GAP_MS = 10 * 60000;   // at most once per 10 minutes, and never twice for the same situation
const LRI = '⁦', PDI = '⁩';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Festivals shown once a year as a calm, sourced card (a live-event touch in Phase A; Phase B owns the service). */
export const FESTIVALS = {
  sukkot: {
    t: 'חג הסוכות · שער המים', kick: 'חג שמח',
    q: 'וְלָמָּה נִקְרָא שְׁמוֹ שַׁעַר הַמַּיִם. שֶׁבּוֹ מַכְנִיסִין צְלוֹחִית שֶׁל מַיִם שֶׁל נִסּוּךְ בֶּחָג',
    ref: 'משנה מדות ב, ו',
    d: 'בחג הסוכות ניסכו מים על המזבח (משנה סוכה ד, ט). את צלוחית המים הכניסו בשער המים, השלישי משערי הדרום של העזרה (מדות א, ד).',
    focus: 'gates',
  },
};

const CSS = `
.gm .gm-goal{flex-direction:column;align-items:center;gap:5px}
.gm-next{pointer-events:auto;display:flex;gap:6px;justify-content:center;flex-wrap:nowrap;max-width:min(94vw,520px);overflow:hidden}
.gm-next button{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:var(--gm-chip);border:1px solid var(--gm-line)!important;box-shadow:0 2px 8px rgba(40,28,12,.1);font:600 12.5px/1 "Heebo",system-ui,sans-serif;color:var(--gm-soft);white-space:nowrap;-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur))}
.gm-next button .gm-i{width:16px;height:16px}
.gm-next button{position:relative}.gm-next button::after{content:'';position:absolute;inset:-9px -2px}   /* a 44-px hit area, same look (UI-S5) */
.gm-next button b{color:var(--gm-ink);font-weight:700}
.gm-next button.back{border-color:var(--gm-gold-hi)!important;color:var(--gm-gold-ink);background:linear-gradient(180deg,#F8DD95,#EDC25E)!important}
.gm.has-next .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 134px)}
body.gm-demo-on .gm.has-next .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 162px)}
.gm.has-next .gm-demo{top:calc(env(safe-area-inset-top,0px) + 128px)}
.gm-pill .gm-note2{color:var(--gm-gold);font-weight:700}
.gm-card .gm-find{margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--gm-bar)}
.gm-card .gm-find p{font-size:13.5px;line-height:1.5;margin-top:3px}
.gm-card .gm-ladder{margin-top:12px}
.gm-card .gm-ladder small{display:block;font:600 12.5px/1.3 "Heebo",sans-serif;color:var(--gm-soft);margin-bottom:5px}
.gm-card .gm-opens{margin-top:10px;font:600 13.5px/1.45 "Heebo",sans-serif}
.gm-card .gm-opens b{color:var(--gm-gold)}
.gm-card ul.gm-appts{padding-inline-start:18px;margin:6px 0 0;font:500 14.5px/1.65 "Heebo",sans-serif}
.gm-demo .gm-hl{background:#7A2E8C;color:#fff;border-color:#7A2E8C}
.gm-demo .gm-hl small{font-weight:500;opacity:.85;margin-inline-start:4px}
.gm-toast .gm-tbtn{display:inline-block;margin-inline-start:8px;padding:6px 12px;min-height:44px;border-radius:999px;border:1px solid var(--gm-gold-hi,#E0B04A);background:linear-gradient(180deg,#F8DD95,#EDC25E);color:var(--gm-gold-ink,#5A3B00);font:700 13px/1 "Heebo",system-ui,sans-serif;cursor:pointer;pointer-events:auto}
.gm-card ul.gm-reel{padding-inline-start:18px;margin:6px 0 0;font:500 14px/1.6 "Heebo",sans-serif;columns:2;column-gap:14px}
.gm-card ul.gm-reel li::marker{content:'✓ ';color:var(--gm-gold)}
.gm-ripple{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid rgba(255,244,214,.9);box-shadow:0 0 8px rgba(255,200,90,.5);pointer-events:none;opacity:0}
.gm-ripple.go{animation:gm-rip .38s ease-out forwards}
@keyframes gm-rip{from{transform:scale(.35);opacity:.8}to{transform:scale(1.25);opacity:0}}
@media (prefers-reduced-motion: reduce){.gm-ripple.go{animation:none;opacity:0}}
`;

export function createHooks({ G, now, ui, emit = () => {}, sfx, coach = () => {}, act = {}, busy = () => false, restAfterS = REST_AFTER_S } = {}) {
  const tapMeter = R.createTapMeter();
  try { LOOP.useKit({ sfx, emit }); } catch (e) { /* (wave 7) the dig of the day speaks with BUILD's sound kit */ }
  let strip = null, style = null, lastStrike = -1e12, idleFrom = 0, restSig = '', restAt = -1e12, hint = null, mashTold = false, festTried = false, stripSig = '';
  let idleSince = 0, idleToldAt = -1e12, hlSig = '';   // (round 3)

  function mount() {
    const root = ui.root; if (!root) return;
    const doc = root.ownerDocument || document;
    if (!doc.getElementById('gm-hooks-css')) { style = doc.createElement('style'); style.id = 'gm-hooks-css'; style.textContent = CSS; doc.head.appendChild(style); }
    const goal = root.querySelector('.gm-goal');
    if (goal && !goal.querySelector('.gm-next')) {
      strip = doc.createElement('div');
      strip.className = 'gm-next';
      strip.setAttribute('role', 'status');
      strip.setAttribute('aria-label', 'מה מגיע בקרוב');
      goal.appendChild(strip);
      strip.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-k]'); if (!b) return;
        if (sfx) sfx.play('ui');
        if (b.dataset.k === 'caravan') ui.openSheet('caravans');
        else if (b.dataset.k === 'priest') ui.openSheet('crews');
        else if (b.dataset.id) ui.openSheet('stage', b.dataset.id);
        emit('stripTap', b.dataset.k);
      });
    }
    // the demo strip: the highlight reel next to "skip chapter"
    const demo = root.querySelector('.gm-demo');
    if (demo && !demo.querySelector('.gm-hl')) {
      const b = doc.createElement('button');
      b.className = 'gm-hl'; b.type = 'button'; b.textContent = 'הרגע הבא ✦';
      b.addEventListener('click', () => { if (act.demoNext) act.demoNext(); });
      demo.appendChild(b);
    }
    refreshDemo();
    // (round 3) the one-tap buttons inside toasts: collect a caravan that just arrived, move waiting crews
    if (!root.__hkToasts) {
      root.__hkToasts = true;
      root.addEventListener('click', (e) => {
        const b = e.target && e.target.closest && e.target.closest('[data-hk]'); if (!b) return;
        const g = G();
        if (b.dataset.hk === 'collect') { const k = g.car.findIndex((c) => c.r === b.dataset.r); if (k >= 0 && act.collectCaravan) act.collectCaravan(k); emit('arrivalCollect', { r: b.dataset.r }); }
        else if (b.dataset.hk === 'move') { let n = 0; for (const c of N.idleCrews(g)) { const to = N.crewTarget(G()); if (to && act.assignCrew) { act.assignCrew(c.i, to); n++; } } emit('idleMove', { n }); }
      });
    }
    // every touch on the world is acknowledged at once (a burst of taps used to get one strike and no other sign)
    if (!ripples.length) {
      for (let k = 0; k < 4; k++) { const r = doc.createElement('div'); r.className = 'gm-ripple'; r.setAttribute('aria-hidden', 'true'); root.appendChild(r); ripples.push(r); }
      doc.addEventListener('pointerdown', onPointer, { passive: true, capture: true });
    }
    renderStrip(now());
  }
  const ripples = []; let ripK = 0, ripAt = null;
  const HUD_SEL = '.gm-top, .gm-goal, .gm-dock, .gm-sheet, .gm-modal, .gm-mo, .gm-demo, .gm-toasts, .gm-back, button, input, a';
  /* (the handler only notes the point: main.js counts a tap as pointerdown → pointerup within 450 ms, so nothing may
     slow it down; the ripple is drawn on the next frame, by the compositor, without a forced layout) */
  function onPointer(e) {
    if (!ripples.length || e.isPrimary === false || ui.busy || ui.whole) return;
    const t = e.target;
    if (t && t.closest && t.closest(HUD_SEL)) return;
    const first = !ripAt;
    ripAt = { x: e.clientX, y: e.clientY };
    if (first) requestAnimationFrame(drawRipple);
  }
  function drawRipple() {
    const p = ripAt; ripAt = null;
    if (!p) return;
    const r = ripples[ripK++ % ripples.length];
    r.style.left = `${p.x}px`; r.style.top = `${p.y}px`;
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof r.animate === 'function') r.animate([{ transform: 'scale(.35)', opacity: 0.8 }, { transform: 'scale(1.25)', opacity: 0 }], { duration: 380, easing: 'ease-out', fill: 'forwards' });
    else { r.classList.remove('go'); requestAnimationFrame(() => r.classList.add('go')); }
    r.dataset.at = `${Math.round(p.x)},${Math.round(p.y)}`;      // (for the tests)
  }

  /* ── (round 3) the investor reel: the button counts the highlights, and after the last one it opens the outro ── */
  function refreshDemo() {
    const b = ui.root && ui.root.querySelector('.gm-demo .gm-hl'); if (!b) return;
    const g = G(); if (!g || !g.demo) return;
    const left = D.highlightsLeft(g), n = D.HIGHLIGHTS.length;
    const sig = String(left);
    if (sig === hlSig) return;
    hlSig = sig;
    b.style.display = '';
    b.innerHTML = left ? `הרגע הבא ✦<small>${LRI}${n - left + 1}/${n}${PDI}</small>` : 'סיום ההדגמה ✦';
    b.setAttribute('aria-label', left ? `הרגע הבא: ${D.nextHighlight(g).what}` : 'סיום ההדגמה: מה עוד אפשר לראות');
  }
  /** the reel is over (QA P1-4): an outro that says what was shown and opens the two doors — the service, the tour */
  async function demoOutro() {
    const g = G(); if (!g || !g.demo) return null;
    emit('demoOutro');
    const html = `<div class="gm-kick">סוף ההדגמה <span class="gm-draft">${T.draft}</span></div><h2>הבית נבנה. עכשיו הוא עובד.</h2>`
      + `<p>ראיתם את שמונת הרגעים של הבנייה:</p><ul class="gm-reel">${D.HIGHLIGHTS.map((h) => `<li>${esc(h.what)}</li>`).join('')}</ul>`
      + `<p style="margin-top:10px">ובשלב ב׳ — העבודה בבית, לפי השעון האמיתי של ירושלים: הפייס בבוקר, התפקיד שלך, והשיר של יום. או סיור בבית עצמו.</p>`;
    const buttons = [];
    if (act.canAvodah) buttons.push({ label: 'העבודה בבית · 3 דקות ✦', value: 'mine', gold: true });
    if (typeof window !== 'undefined' && typeof window.__openScenes === 'function') buttons.push({ label: 'סיור בבית המקדש · 10 תחנות', value: 'tour', gold: !buttons.length });
    buttons.push({ label: 'להישאר בבית הבנוי', value: 'stay' });
    const v = await ui.modal(html, { buttons });
    emit('demoOutroChoice', v || 'stay');
    if (v === 'mine' && act.enterAvodah) { try { localStorage.setItem(AV.INTENT_KEY, 'mine'); } catch (e) { /* Phase B opens on its home */ } act.enterAvodah(); }
    else if (v === 'tour') window.__openScenes('tour');
    return v;
  }
  /** the wood chamber is built: the Ark's tradition is a mystery found where it happened (Shekalim 6:1–2), never a lock */
  async function mysteryInvite(save) {
    const g = G();
    if (!g || g.demo || !g.story || g.story.arkInv || typeof window === 'undefined' || typeof window.__openScenes !== 'function') return false;
    if (typeof navigator !== 'undefined' && navigator.webdriver && !window.__HK_FORCE) return false;   // (never a surprise card inside a scripted e2e run)
    g.story.arkInv = 1; if (save) save();
    const st = (Array.isArray(MYST) ? MYST : []).find((x) => x && x.id === 'the_odd_stone');
    const q = st && st.quote ? String(st.quote).split('. ')[0] : '';
    const html = `<div class="gm-kick">תעלומה <span class="gm-draft">${T.draft}</span></div><h2>אבן אחת ברצפה</h2>`
      + (q ? `<p class="gm-q">"${esc(q)}"</p><span class="gm-ref">שקלים ו, ב</span>` : '')
      + `<p style="margin-top:8px">בבית השני לא היה ארון בקודש הקדשים. אבל כהן אחד ראה פעם שאחת מאבני הרצפה שונה מחברותיה, ומאז ידעו ששם נגנז הארון. המשנה אומרת: כנגד דיר העצים (שקלים ו, א). במשחק: כאן, ליד לשכת העצים שבנית עכשיו (פרשנות של המשחק).</p>`;
    const v = await ui.modal(html, { buttons: [{ label: 'לחקור: איפה הארון? (5 צעדים)', value: 'go', gold: true }, { label: 'אחר כך', value: 'later' }] });
    emit('mysteryInvite', v || 'later');
    if (v !== 'go') return false;
    window.__openScenes('ark');
    return true;
  }
  /** crews wait at a site that lacks a material: one cue now and then (three in all), with one tap to move them */
  function idleCue(idle) {
    const g = G(), to = N.crewTarget(g), c0 = idle[0];
    if (!to || !c0) return false;
    const lack = Object.keys(c0.lack)[0];
    const where = to === 'quarry' ? 'למחצבה' : pre('ל', shortName(to));
    ui.toast({ icon: 'crew', title: idle.length > 1 ? `${idle.length} צוותים מחכים` : 'צוות מחכה', body: `${esc(pre('ב', shortName(c0.at)))} חסר ${esc(RES[lack] ? RES[lack].n : lack)}, ו${idle.length > 1 ? 'הצוותים לא בונים' : 'הצוות לא בונה'}. <button type="button" class="gm-tbtn" data-hk="move">להעביר ${esc(where)}</button>`, ms: 9000 });
    emit('idleCue', { n: idle.length, at: c0.at, to });
    return true;
  }
  /** a caravan reaches its bay right now (the world's carts arrive on the same timer): the game's "משלחת חזרה!" told
      better — what came and for which site — with one tap to collect (after the tutorial; it teaches the sheet first).
      → true when shown (the caller then skips its plain toast) */
  function arrivalBeat() {
    const g = G(), t = now();
    if (!g || g.ftue < 99) return false;
    const back = (g.car || []).filter((c) => t >= c.t1).sort((a, b) => b.t1 - a.t1)[0];
    const R = back && ROUTES[RIDX[back.r]];
    if (!R) return false;
    const r = S.recommend(g), site = r.id && r.kind !== 'start' ? stageById(r.id) : null;
    const res = RES[R.res] ? RES[R.res].n : '';
    ui.toast({ icon: R.res, title: `המשלחת הגיעה: ${R.n}`, body: `${LRI}${back.y}${PDI} ${esc(res)}${site ? ` ${esc(pre('ל', site.n))}` : ''} מחכים בעגלות <button type="button" class="gm-tbtn" data-hk="collect" data-r="${esc(back.r)}">לאסוף</button>`, ms: 8000 });
    emit('arrivalBeat', { r: back.r });
    return true;
  }
  /** Hebrew prefixes on a name with the article: ב + החומה → בחומה, ל + ההיכל → להיכל */
  function pre(p, name) { const n = String(name || ''); return p && n.startsWith('ה') ? p + n.slice(1) : p + n; }

  /* ── (round 3) moments on a repeat: the demo on a device that already played them (the presenter's next investor).
     A normal save plays each moment once, so only the map's "שוב" and the demo repeat; a family's shared tablet never
     gets the short version for a new player's first time. moments.js receives `repeat` (ignored until it reads it). ── */
  const SEEN_KEY = 'bh_seen_moments';
  function momentRepeat(kind) { const g = G(); if (!g || !g.demo) return false; try { return !!JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')[kind]; } catch (e) { return false; } }
  function momentSeen(kind) { const g = G(); if (!g || !g.demo) return; try { const o = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); o[kind] = (o[kind] || 0) + 1; localStorage.setItem(SEEN_KEY, JSON.stringify(o)); } catch (e) { /* no storage */ } }

  /* ── the appointment strip: the next two things that will come, always visible (the "why come back") ── */
  const ICON_OF = { caravan: (a) => a.res, priest: () => 'priest', phase: () => 'crew', finish: () => 'crew', stone: () => 'crew' };
  function chipLabel(a, two) {
    if (a.kind === 'caravan') return RES[a.res] ? RES[a.res].n : '';
    if (a.kind === 'priest') return 'כהן';
    if (a.kind === 'stone') return two ? `צוות ${shortName(a.id)}: אבן בעוד` : 'הצוות מניח אבן בעוד';   // (wave 7) the chip in words
    return shortName(a.id);
  }
  function renderStrip(t) {
    if (!strip) return;
    const g = G();
    const show = g.ftue >= 6 && !ui.whole;
    const appts = show ? N.appointments(g, t).slice(0, 2) : [];
    const sig = appts.map((a) => a.kind + (a.id || '') + (a.back ? 'b' : '') + Math.ceil(a.ms / 1000)).join('|');
    if (sig === stripSig) return;
    stripSig = sig;
    const icon = (a) => (ui.icon ? ui.icon(ICON_OF[a.kind](a)) : '');
    strip.innerHTML = appts.map((a) => `<button type="button" data-k="${a.kind}" ${a.id ? `data-id="${esc(a.id)}"` : ''} class="${a.back ? 'back' : ''}" aria-label="${esc(N.apptLine(a, g))}">${icon(a)}<span>${esc(chipLabel(a, appts.length > 1))}</span><b>${a.back ? 'חזרה!' : LRI + N.fmtClock(a.ms) + PDI}</b></button>`).join('');
    const has = appts.length > 0;
    if (ui.root) ui.root.classList.toggle('has-next', has);
    strip.classList.toggle('gm-hidden', !has);
  }
  const SHORT = { har: 'ההר', wall: 'החומה', gates: 'השערים', nashim: 'עזרת הנשים', sorag: 'הסורג', nikanor: 'ניקנור', lishka: 'הלשכות', yesod: 'היסוד', sovev: 'הסובב', guf: 'המזבח', karnot: 'הקרנות', kiyor: 'הכיור', ulam: 'האולם', heichal: 'ההיכל', kodesh: 'קודש הקדשים' };
  const shortName = (id) => SHORT[id] || (stageById(id) ? stageById(id).n : id);

  /* ── the goal pill: a waiting goal says when, or what to do ── */
  function goalNote(g, r) { return N.goalNote(g, r, now()); }
  function goalAction(r) { const n = N.goalNote(G(), r, now()); return n ? n.action : null; }
  function goalTarget(r) { const n = N.goalNote(G(), r, now()); return n && n.id ? n.id : null; }

  /* ── every second ── */
  function tick(t) {
    const g = G();
    renderStrip(t);
    refreshDemo();
    const idle = g.ftue >= 99 ? N.idleCrews(g) : [];
    if (idle.length) { if (!idleSince) idleSince = t; } else idleSince = 0;
    if (ui.refreshPill) ui.refreshPill(g);                 // a waiting goal counts down on the pill
    // idleness is counted even while the player browses a sheet (a curious player reads while waiting); the card
    // itself only comes when nothing is open
    const st = N.restState(g, t);
    if (g.ftue >= 99 && st.idle && t - lastStrike >= 8000) { if (!idleFrom) idleFrom = t; } else idleFrom = 0;
    if (busy() || ui.busy || ui.whole) return;
    // the just-in-time hint: the goal waits for a material that nobody is bringing (once per material)
    if (g.ftue >= 8 && !hint && !coachBusy()) {
      const h = N.hintFor(g, t);
      if (h) { hint = h; g.story[h.key] = 1; coach('dock', h.text); emit('hint', { res: h.res, route: h.route }); setTimeout(() => { if (hint === h) { hint = null; clearCoachIf(h.text); } }, 9000); }
    }
    if (idleSince && t - idleSince >= IDLE_CUE_S * 1000 && t - idleToldAt >= REST_GAP_MS && (g.story.idleCue || 0) < 3 && !coachBusy()) {
      idleToldAt = t; idleSince = 0;
      if (idleCue(idle)) { g.story.idleCue = (g.story.idleCue || 0) + 1; return; }
    }
    // festivals: once a year, at a calm moment
    // (not under automation: a surprise card must not land in the middle of a scripted e2e run during the festival week)
    if (!festTried && g.ftue >= 99 && t - lastStrike > 6000) { festTried = true; if (!(typeof navigator !== 'undefined' && navigator.webdriver) && festival(t)) return; }
    // the rest card: a natural stopping point, told honestly
    if (!idleFrom || t - idleFrom < restAfterS * 1000 || t - restAt < REST_GAP_MS) return;
    const sig = st.appts.map((a) => a.kind + (a.id || '')).join(',') + '/' + st.blocked.map((b) => b.id).join(',');
    if (sig === restSig) return;
    restSig = sig; restAt = t; idleFrom = 0;
    restCard(st, t);
  }
  const coachBusy = () => { const b = ui.root && ui.root.querySelector('.gm-bub'); return !!b && !b.classList.contains('gm-hidden'); };
  /* hide the coach only if it still says our line (the tutorial may have taken the bubble over meanwhile) */
  function clearCoachIf(text) { const b = ui.root && ui.root.querySelector('.gm-bub'); if (b && !b.classList.contains('gm-hidden') && b.textContent.includes(text)) coach(null, ''); }

  async function restCard(st, t) {
    const g = G();
    const lines = st.appts.slice(0, 3).map((a) => `<li>${N.apptHTML(a, g, esc)}</li>`);   // ── flow8 ── the clocks tick (ui.js tick)
    for (const b of st.blocked.slice(0, 2)) {
      const it = b.items[0];
      if (!it) continue;
      const wait = it.covered ? '' : it.canSend ? ' · אפשר לשלוח משלחת' : '';
      lines.push(`<li>${esc(stageById(b.id).n)}: חסר ${esc(RES[it.res].n)} ${LRI}${it.n}${PDI}${wait}</li>`);
    }
    const ladder = N.chapterLadder(g);
    const html = `<div class="gm-kick">הפסקה טובה <span class="gm-draft">${T.draft}</span></div><h2>האתר עובד בשבילך</h2>`
      + (lines.length ? `<p>מה יקרה בזמן הקרוב:</p><ul class="gm-appts">${lines.join('')}</ul>` : '<p>הצוותים ממשיכים לעבוד.</p>')
      + (ladder ? ladderHTML(ladder) : '')
      + (st.unread ? `<div class="gm-note">בינתיים: ${st.unread === 1 ? 'משנה חדשה מחכה' : `${LRI}${st.unread}${PDI} משניות חדשות מחכות`} בספר מידות.</div>` : '')
      + `<p class="gm-muted" style="margin-top:10px;font-size:13.5px">אפשר לצאת עכשיו. האתר ממשיך לעבוד עד 12 שעות, ושום דבר לא הולך לאיבוד.</p>`;
    emit('restCard', { appts: st.appts.length, next: st.appts[0] ? st.appts[0].ms : null, blocked: st.blocked.length });
    // meaningful things to do while the site works (never busywork): an unread mishnah, today's Middot questions
    const quizLeft = TRAIN.quizPerDay - (g.quiz && g.quiz.day === S.dayKey(t) ? g.quiz.n : 0);
    const buttons = [];
    // (round 3) before the player leaves: crews that wait at a blocked site would wait all night (the playtest: 24 crew-hours)
    const idle = N.idleCrews(g), to = idle.length ? N.crewTarget(g) : null;
    if (idle.length && to) buttons.push({ label: `להעביר ${idle.length > 1 ? `${LRI}${idle.length}${PDI} צוותים שמחכים` : 'את הצוות שמחכה'} ${to === 'quarry' ? 'למחצבה' : pre('ל', shortName(to))}`, value: 'move' });
    if (st.unread) buttons.push({ label: 'לספר מידות', value: 'book' });
    if (quizLeft > 0 && act.quizOpen) buttons.push({ label: 'שאלת היום ממסכת מידות', value: 'quiz' });   // (FUN11: the book's daily question, learning points)
    else if (act.placeQuiz && (g.ftue | 0) >= 99) buttons.push({ label: 'איפה זה? · חידון מקומות בבית', value: 'places' });   // (FUN11: the day's questions done → the places quiz)
    buttons.push({ label: T.close, value: null, gold: true });
    const v = await ui.modal(html, { buttons });
    if (v === 'book') ui.openSheet('book');
    if (v === 'quiz') act.quizOpen();
    if (v === 'places') act.placeQuiz();
    if (v === 'move') { let n = 0; for (const c of N.idleCrews(G())) { const t2 = N.crewTarget(G()); if (t2 && act.assignCrew) { act.assignCrew(c.i, t2); n++; } } emit('idleMove', { n, from: 'rest' }); }
  }
  function ladderHTML(l) {
    const p = Math.round(l.frac * 100);
    return `<div class="gm-ladder"><small>פרק ${'אבגד'[l.id - 1]}׳ · ${esc(l.n)} · ${LRI}${l.done}/${l.total}${PDI} אתרים</small><div class="gm-bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(4, p)}%"></i></div></div>`;
  }

  /* ── a stage is done: one card with the finds inside, what opens now and the chapter ladder ── */
  function stageDoneExtra(c) {
    const g = G();
    let h = '';
    // (round 3) a moment skipped (the child after 25 s, a hurried presenter) still leaves its one true detail in the card
    const M = c.momentSkipped && MOMENTS[c.momentSkipped];
    if (M) h += `<div class="gm-find gm-mskip"><b>${esc(M.n)}: ${esc(M.done || '')}</b>${srcHTML(M.src)}</div>`;
    for (const k of [c.momentFind, c.find]) {
      const f = k && FINDS[k];
      if (f) h += `<div class="gm-find"><b>ממצא: ${esc(f.n)}</b><p>${esc(f.d)}</p><span class="gm-ref">${esc(f.ref)}</span></div>`;
    }
    const opens = N.opensAfter(g, c.id).filter((id) => S.statusOf(g, id) === 'avail');
    if (opens.length) h += `<p class="gm-opens"><b>נפתח עכשיו:</b> ${opens.map((id) => esc(stageById(id).n)).join(' · ')}</p>`;
    const l = N.chapterLadder(g);
    if (l && !c.chapter && l.total > 1) h += ladderHTML(l);
    return h;
  }

  /* ── the weekly goal (hooks/week.js): counted on site completions and collected caravans ── */
  function onWeek(kind) {
    const g = G(), r = WK.noteWeek(g, kind, now());
    if (!r) return;
    if (sfx) sfx.play('fanfare');
    ui.toast({ icon: 'vine', title: 'יעד השבוע הושלם!', body: `אשכול לגפן הזהב · ${LRI}+${r.reward.silver}${PDI} כסף`, ms: 5600 });
    emit('weekDone', { key: g.week.key });
  }
  function weekHTML(g) {
    const v = WK.weekView(g, now());
    const row = (label, n, need) => `<div class="gm-row"><span class="gm-grow">${label}<small><span class="gm-num">${Math.min(n, need)}/${need}</span></small></span>${n >= need ? '<span class="gm-check">✓</span>' : ''}</div>`;
    let h = `<div class="gm-sec">יעד השבוע</div>`;
    if (v.shabbat && !v.done) return h + `<p class="gm-muted">שבת שלום. יעד השבוע הבא מתחיל ביום ראשון.</p>`;
    h += row(`לסיים ${v.need.sites} אתרי בנייה`, v.sites, v.need.sites) + row(`להביא ${v.need.caravans} משלחות הביתה`, v.caravans, v.need.caravans);
    h += `<div class="gm-bar" style="margin-top:8px" role="progressbar" aria-valuenow="${Math.round(v.frac * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(3, Math.round(v.frac * 100))}%"></i></div>`;
    h += `<p class="gm-muted" style="margin-top:6px;font-size:13px">${v.done ? 'הושלם: אשכול נתלה על הגפן. יעד חדש ביום ראשון.' : `פרס: אשכול לגפן הזהב ו־${LRI}${v.need.reward.silver}${PDI} כסף. השבוע: מיום ראשון עד ערב שבת.`} <span class="gm-draft">${T.draft}</span></p>`;
    return h;
  }

  /* ── the key moments already played can be played again, for the joy of it (no rewards: not a grind) ── */
  function momentsHTML(g) {
    const done = STAGES.filter((st) => st.moment && S.isDone(g, st.id) && MOMENTS[st.moment]);
    if (!done.length) return '';
    return `<div class="gm-sec">רגעים מיוחדים</div>` + done.map((st) => `<div class="gm-row"><span class="gm-grow">${esc(MOMENTS[st.moment].n)}<small>${esc(st.n)}</small></span><button class="gm-btn sm" data-a="replay" data-k="${st.moment}">שוב</button></div>`).join('')
      + `<p class="gm-muted" style="margin-top:6px;font-size:12.5px">לשחק שוב בשביל הכיף ובשביל הפרט האמיתי. בלי פרסים ובלי ניקוד.</p>`;
  }

  /* ── the quarry when stone is not what is missing: say so once in a while (hollow taps, HOOKS.md F6) ── */
  let quarryN = 0, quarryToldAt = -1e12;
  function onQuarry() {
    const g = G(), t = now();
    if (N.stoneNeeded(g) > 0) { quarryN = 0; return; }
    if (++quarryN < 20 || t - quarryToldAt < 10 * 60000) return;
    quarryN = 0; quarryToldAt = t;
    const r = S.recommend(g), note = N.goalNote(g, r, t);
    const lack = r.kind === 'blocked' && r.lack ? Object.entries(r.lack).map(([k, v]) => `${RES[k].n} ${LRI}${v}${PDI}`).join(', ') : '';
    ui.toast({ icon: 'stone', title: 'יש די אבן לעכשיו', body: lack ? `${esc(stageById(r.id).n)}: חסר ${lack}${note ? ` · ${esc(note.text)}` : ''}` : 'האבן במחסן מספיקה לאתרים הפתוחים. האתר ממשיך לעבוד גם בלעדיך.', ms: 5600 });
    emit('quarryEnough');
  }

  /* ── honest rhythm ── */
  function onStrike() { lastStrike = now(); idleFrom = 0; }
  function onMash() {
    emit('mash');
    const g = G();
    if (mashTold || coachBusy()) return;
    mashTold = true;
    g.story.mashTip = (g.story.mashTip || 0) + 1;
    if (g.story.mashTip > 3) return;
    const tip = 'טיפ: הקש פעם אחת, בדיוק כשטבעת הזהב נסגרת. כך מקבלים מכה מדויקת.';
    coach(null, tip);
    setTimeout(() => clearCoachIf(tip), 4500);
  }

  /* ── the end of the tutorial: the real next appointment (the old toast promised the wall even when it waited for cedar) ── */
  function ftueEndText() {
    const g = G(), t = now();
    const a = N.appointments(g, t).find((x) => !x.back);
    const next = a ? ` הבא: ${N.apptHTML(a, g, esc)}.` : '';   // ── flow8 ── HTML (the toast's body): its clock ticks
    return `עכשיו אתה יודע לבנות.${next} אפשר לחזור מאוחר יותר: האתר ממשיך לעבוד.`;
  }
  /* ── the welcome card: what to do first ── */
  function welcomeNext() {
    const g = G(), t = now();
    const back = S.carsBack(g, t);
    const r = S.recommend(g);
    if (back) return back > 1 ? 'קודם כול: לאסוף את המשלחות שחזרו' : 'קודם כול: לאסוף את המשלחת שחזרה';
    if (r.kind === 'moment') return `קודם כול: ${stageById(r.id).n} · ${T.momentReady}`;
    if (r.kind === 'start') return `אפשר להתחיל: ${stageById(r.id).n}`;
    if (r.kind === 'build') return `ממשיכים: ${stageById(r.id).n}`;
    return '';
  }
  function sessionEnd() {
    const g = G(), t = now();
    const a = N.appointments(g, t);
    emit('sessionEnd', { timers: a.length, next: a[0] ? a[0].ms : null });
  }

  /* ── the Phase A → Phase B handoff (hooks/avodah.js): the altar complete, Chanukat HaBayit ── */
  async function avodahInvite(kind) {
    const g = G(), key = kind === 'altar' ? 'avInvAltar' : 'avInvFinale';
    if (!g || !g.story || g.story[key] || !act.canAvodah) return false;
    if (kind === 'altar' && !AV.tester44()) return false;   // ── fable32 (build 44) ── (the mid-Phase A invitation: testers only — v2 §12) ── /fable32 ──
    g.story[key] = 1;
    const I = AV.invite(kind);
    emit('avodahInvite', kind);
    const v = await ui.modal(`<div class="gm-kick">${esc(I.kick)} <span class="gm-draft">טיוטה</span></div><h2>${esc(I.title)}</h2><p class="gm-q">"${esc(I.q)}"</p><span class="gm-ref">${esc(I.ref)}</span><p style="margin-top:8px">${esc(I.d)}</p>`,
      { buttons: [{ label: esc(I.go), value: 'go', gold: true }, { label: esc(I.stay), value: 'stay' }] });
    if (v !== 'go') return false;
    try { localStorage.setItem(AV.INTENT_KEY, I.intent); } catch (e) { /* no storage: Phase B opens on its home */ }
    emit('avodahGo', kind);
    act.enterAvodah();
    return true;
  }
  const avodahMenu = () => AV.menuLabel(G());

  /* ── festivals ── */
  function festival(t, force) {
    let id = force || null;
    if (!id) { try { const i = dayInfo(new Date(t)); if (i && i.holiday && FESTIVALS[i.holiday.id]) id = i.holiday.id; } catch (e) { /* no calendar */ } }
    if (!id || !FESTIVALS[id]) return false;
    const g = G();
    let year = '';
    try { year = String(dayInfo(new Date(t)).hebrew.year); } catch (e) { year = String(new Date(t).getFullYear()); }
    const key = `fest_${id}_${year}`;
    if (g.story[key] && !force) return false;
    g.story[key] = 1;
    const F = FESTIVALS[id];
    emit('festival', id);
    ui.storyCard(F, F.kick);
    return true;
  }

  return {
    mount, tick, goalNote, goalAction, goalTarget, stageDoneExtra, onWeek, weekHTML, momentsHTML, onStrike, onMash, onQuarry, tapMeter, ftueEndText, welcomeNext, sessionEnd,
    avodahInvite, avodahMenu, demoOutro, mysteryInvite, refreshDemo, momentRepeat, momentSeen, arrivalBeat,
    renderStrip: () => { stripSig = ''; renderStrip(now()); },
    liveMs: (key) => N.liveMs(G(), key, now()),   // ── flow8 ── a live clock's ms now (ui.js tick), null when it is gone
    get hint() { return hint; },
    clearHint() { if (hint) { const h = hint; hint = null; clearCoachIf(h.text); } },
    /** test hooks */
    _: { festival: (id) => festival(now(), id), restNow: () => restCard(N.restState(G(), now()), now()), idleNow: () => idleCue(N.idleCrews(G())), N, R, D, WK },
  };
}
