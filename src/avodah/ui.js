/* ─────────────────────────────────────────────────────────────────────────────
 * ui.js: the Phase B HUD (DOM, RTL, phone first). No rules here: it reads ctx.model() and calls ctx.act.*.
 *   top bar (home · "מה קורה עכשיו במקדש" + the next appointment · sound) · the service progress ·
 *   the home panel with three tabs (היום · ספר העבודה · הדרך שלי) · modal cards (sources, the name pick,
 *   the summary) · toasts. Every content card carries the "טיוטה" tag while it is a draft.
 * ──────────────────────────────────────────────────────────────────────────── */
import { CSS } from './ui.css.js';
import { MISHMAROT } from '../calendar.js';
import { STEPS, GAMES, BOOK, MEMUNIM, ROLES, card as toCard, FALLBACK, event as contentEvent, step as contentStep, dayItem, shirWhy, chalilToday, haazinuPart, DETAIL, needHe, PITUM_LINES, KETORET_YEAR } from './data.js';
import { RANKS } from './state.js';

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LRI = '⁦', PDI = '⁩';
const iso = (n) => LRI + n + PDI;
const ST = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const SVG = (b) => `<svg class="av-i" viewBox="0 0 24 24" aria-hidden="true">${b}</svg>`;
export const ICON = {
  home: SVG(`<path ${ST} d="M3.5 11 12 4l8.5 7"/><path ${ST} d="M6 10v10h12V10"/>`),
  soundOn: SVG(`<path ${ST} d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path ${ST} d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>`),
  soundOff: SVG(`<path ${ST} d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path ${ST} d="m16 9.5 5 5m0-5-5 5"/>`),
  flame: SVG('<path d="M12 3c3 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 1 3 3 4 0-3-1-5 0-8z" fill="#E8913A" stroke="#A8521C" stroke-width="1.2"/>'),
  book: SVG(`<path ${ST} d="M12 6.5C10 5 6.5 4.5 3.5 5v13c3-.5 6.5 0 8.5 1.5 2-1.5 5.5-2 8.5-1.5V5c-3-.5-6.5 0-8.5 1.5z"/><path ${ST} d="M12 6.5v13"/>`),
};

/** A content card as HTML (title, summary, quote, source, the draft tag). */
export function cardHTML(c, { level = 'h2', quote = true } = {}) {
  if (!c) return '';
  const tag = (c.draft ? '<span class="av-draft">טיוטה</span>' : '') + (c.needsCheck ? ' <span class="av-draft av-check">בבדיקה</span>' : '');   // the fallbacks are now verified content (content/avodah_fallbacks.json)
  const H = level;
  return `<${H}>${esc(c.title)} ${tag}</${H}>${c.summary ? `<p>${esc(c.summary)}</p>` : ''}${quote && c.quote ? `<p class="av-q">"${esc(c.quote)}"</p>` : ''}${c.source ? `<span class="av-ref">${esc(c.source)}</span>` : ''}`;
}

export function createUI({ root, ctx }) {
  const doc = root.ownerDocument || document;
  let el = null, tab = 'today', homeOpen = false, modalOpen = 0, toastT = 0;
  const E = {};

  function mount() {
    if (el) return;
    if (!doc.getElementById('av-css')) { const s = doc.createElement('style'); s.id = 'av-css'; s.textContent = CSS; doc.head.appendChild(s); }
    el = doc.createElement('div');
    el.className = 'av';
    el.innerHTML = `
      <div class="av-top">
        <button class="av-rb" data-a="home" aria-label="הבית">${ICON.home}</button>
        <button class="av-status" data-a="status" aria-live="polite"><b></b><small></small></button>
        <button class="av-rb" data-a="mute" aria-label="צליל"></button>
      </div>
      <div class="av-prog av-hidden"><div><span class="t"></span><span class="dots"></span></div></div>
      <section class="av-home" role="dialog" aria-label="העבודה בבית">
        <nav class="av-tabs" aria-label="לשוניות">
          <button data-tab="today" aria-pressed="true">היום</button>
          <button data-tab="book" aria-pressed="false">ספר העבודה</button>
          <button data-tab="path" aria-pressed="false">הדרך שלי</button>
        </nav>
        <div class="av-body"></div>
      </section>
      <div class="av-toast" role="status" aria-live="polite"></div>`;
    root.appendChild(el);
    doc.body.classList.add('av-on');
    const q = (s) => el.querySelector(s);
    Object.assign(E, { status: q('.av-status'), sB: q('.av-status b'), sS: q('.av-status small'), mute: q('[data-a="mute"]'), prog: q('.av-prog'), progT: q('.av-prog .t'), progD: q('.av-prog .dots'), home: q('.av-home'), body: q('.av-body'), tabs: q('.av-tabs'), toast: q('.av-toast') });
    el.addEventListener('click', onClick);
    refreshMute();
  }
  function destroy() { if (el) { el.remove(); el = null; } doc.body.classList.remove('av-on'); }
  function refreshMute() { if (E.mute) E.mute.innerHTML = ctx.sfx && ctx.sfx.muted ? ICON.soundOff : ICON.soundOn; }

  function onClick(e) {
    const b = e.target.closest('[data-a],[data-tab],[data-play],[data-step]');
    if (!b || !el.contains(b)) return;
    ctx.sfx && ctx.sfx.play('ui');
    if (b.dataset.tab) { tab = b.dataset.tab; renderHome(); return; }
    if (b.dataset.play) { ctx.act.play(b.dataset.play, b.dataset.mode || 'practice'); return; }
    if (b.dataset.step) { openStep(b.dataset.step); return; }
    const a = b.dataset.a;
    if (a === 'home') { try { if (window.__SCENES && window.__SCENES.state.open) { window.__SCENES.close(); return; } } catch (e) { /* no tour */ } if (!ctx.busy()) toggleHome(); else ctx.act.quit(); }   // (QA P1-9) the tour closes back to the home (its onClose shows it), never under the panel
    else if (a === 'status') { if (!ctx.busy()) { tab = 'today'; showHome(true); } }
    else if (a === 'mute') { ctx.act.mute(); refreshMute(); }
    else if (a === 'join') ctx.act.join();
    else if (a === 'scenes') { if (window.__openScenes) { showHome(false); window.__openScenes(b.dataset.k || 'tour'); } }   // ── scenes ──
    else if (a === 'build') { if (ctx.act.exit) ctx.act.exit(); }
  }

  /* ───────── top bar ───────── */
  function setStatus({ live, title, sub }) {
    if (!el) return;
    E.sB.innerHTML = `${live ? '<span class="av-livedot"></span>' : ''}${esc(title)}`;
    E.sS.textContent = sub || '';
  }
  function progress(list, i, label, marks = null) {
    if (!el) return;
    if (!list) { E.prog.classList.add('av-hidden'); return; }
    E.prog.classList.remove('av-hidden');
    E.progT.textContent = `${label} · ${iso(`${Math.min(i + 1, list.length)}/${list.length}`)}`;
    // ── hooks ── marks[k]: the games he does "בפועל" today (a gold ring on their dots: "my work is coming")
    E.progD.innerHTML = list.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'cur' : ''}${marks && marks[k] ? ' mine' : ''}"></i>`).join('');
  }

  /* ───────── the home panel ───────── */
  function showHome(on) { homeOpen = !!on; if (!el) return; E.home.classList.toggle('on', homeOpen); if (homeOpen) renderHome(); }
  function toggleHome() { showHome(!homeOpen); }
  function renderHome(keep = false) {
    if (!el || !homeOpen) return;
    E.tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tab === tab ? 'true' : 'false'));
    const m = ctx.model(), y = E.body.scrollTop;
    E.body.innerHTML = tab === 'book' ? bookHTML(m) : tab === 'path' ? pathHTML(m) : todayHTML(m);
    // ── service13 ── the periodic refresh (every 20 s) keeps his place in the panel: it threw him back to the top, away
    // from the boxes lower down (Beit Avtinas and the pens) — a new tab or a new opening still starts at the top
    E.body.scrollTop = keep ? y : 0;
  }
  function todayHTML(m) {
    const th = m.theme, st = m.status, A = m.A;
    const mm = th.mishmar ? `משמר השבוע: ${esc(th.mishmar.nameHe)}` : '';
    let h = `<div class="av-head"><div class="av-grow"><h2>${esc(th.dateHe)}</h2><p>${esc(th.labelHe)}${mm ? ' · ' + mm : ''}</p></div>${A.mishmar && th.mishmar && th.mishmar.index === A.mishmar ? '<span class="av-badge real">המשמר שלך בשבוע!</span>' : ''}</div>`;
    h += `<div class="av-box"><h3>סיור בבית המקדש</h3><small>העזרות, הכיור, לשכת הטלאים, האולם, ההיכל וקודש הקדשים (בצפייה) · איפה הארון? · סדר העבודה של יום הכיפורים</small><div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="av-btn gold" data-a="scenes" data-k="tour">צא לסיור</button><button class="av-btn" data-a="scenes" data-k="ark">איפה הארון?</button><button class="av-btn" data-a="scenes" data-k="yk">יום הכיפורים · צפייה</button></div></div>`;   // ── scenes ──
    h += `<p class="av-muted" style="font:500 12.5px/1.4 Heebo,sans-serif;color:var(--av-soft)">${esc(A.name || 'כהן צעיר')}${A.mishmar ? ` · משמר ${esc(MISHMAROT[A.mishmar - 1])}` : ''}</p>`;
    // the day's opening ritual: today's lots (drawn at the first payis of the Jerusalem day)
    const L = A.lots && A.lots.day === m.day ? A.lots : null;
    const R = L && ROLES.find((x) => x.id === L.role);
    const bar = `<div class="av-bar"><i style="width:${Math.round((m.todayDone / m.shachar.length) * 100)}%"></i></div><small>התמיד של שחר היום: ${iso(`${m.todayDone}/${m.shachar.length}`)} עבודות</small>`;
    const HK = ctx.hooks;   // ── hooks ── the day panel (the payis, בפועל, נכחת בזמן, the ritual, next, tomorrow)
    if (HK) h += HK.phaseA() + (st.live ? '' : HK.today(m));
    else h += L && R ? `<div class="av-box"><h3>הפייס של היום</h3><p>התפקיד שלך: <b>${esc(R.win)}</b>${L.deshen ? ' · תרומת הדשן' : ''}${L.ketoret ? ' · <b>הקטורת!</b>' : ''}</p><small>את העבודה הזאת תעשה היום "בפועל".</small>${bar}</div>`
      : '<div class="av-box"><h3>הפייס של היום מחכה</h3><small>התחל את התמיד של שחר — בלשכת הגזית יוגרל התפקיד שלך להיום.</small></div>';
    // live
    if (st.live) {
      h += `<div class="av-box live"><h3><span class="av-livedot"></span>עכשיו במקדש: ${esc(st.live.he)} <span class="av-badge live">חי</span></h3>
        <p>${esc(st.currentHe || '')}</p><small>עד ${esc(st.liveUntil || '')} בשעון ירושלים. מי שמצטרף עכשיו מקבל סימן "נכחת בזמן".</small>
        <button class="av-btn gold av-go" data-a="join" style="margin-top:10px;width:100%">הצטרף עכשיו</button></div>`;
      if (HK) h += HK.today(m);   // ── hooks ── (while live, the day panel follows the live box)
    } else {
      h += `<div class="av-box"><h3>עכשיו במקדש: ${esc(st.currentHe || 'שקט')}</h3>${st.next ? `<p>הבא: <b>${esc(st.next.whenHe)}</b> (${esc(st.next.textHe.replace(st.next.he + ' ', ''))})</p>` : ''}<small>בינתיים — תרגל כל חלק של העבודה, בכל שעה.</small></div>`;
    }
    if (st.barkai) h += `<small style="display:block;margin:6px 2px;color:var(--av-soft);font:500 12px/1.4 Heebo,sans-serif">ברקאי ${esc(st.barkaiHe)} (אומדן: "האיר פני כל המזרח").</small>`;
    h += svcHTML(m);   // ── service13 ── Beit Avtinas' ketoret in store, tomorrow's animals, the lambs' chamber (before the song: the new place)
    // ── avoda12 ── the Levites' song of the day, every day (the owner, 29.9: "הלויים שיר של יום בכל יום"): the psalm, why today, the chalil
    if (th.psalm) {
      const why = shirWhy(th.info && typeof th.info.weekday === 'number' ? th.info.weekday : th.psalm.js_weekday), ch = chalilToday(th.info);
      const hz = th.info && th.info.isShabbat ? haazinuPart(m.day) : null;   // Shabbat's musaf: one of Haazinu's six parts (⚑ which)
      h += `<div class="av-box av-shirday"><h3>שיר של יום · ${esc(th.psalm.day_he)} <span class="av-draft">טיוטה</span></h3><p>הלויים על הדוכן: "${esc(th.psalm.first_words_he)}" (${esc(th.psalm.psalm_ref)}) <span class="av-ref">${esc(th.psalm.source || 'תמיד ז, ד')}</span></p>${why ? `<small style="display:block">למה היום? "${esc(why)}" <span class="av-ref">ראש השנה לא, א</span></small>` : ''}${ch ? '<small style="display:block">והיום גם החליל מנגן לפני המזבח — אחד משנים עשר ימים בשנה <span class="av-ref">ערכין ב, ג</span></small>' : ''}${hz ? `<small style="display:block">ובמוסף של שבת: שירת האזינו, חלק ${hz.n} מששה — "${esc(hz.he)}" <span class="av-ref">ראש השנה לא, א</span> <span class="av-draft">⚑ טיוטה</span></small>` : ''}<button class="av-btn" data-play="shir" style="margin-top:8px;width:100%">${m.sangToday ? '✓ שרת היום עם הלויים · שוב' : 'לשיר עם הלויים · הצלצל, הכינור והחצוצרות'}</button></div>`;
    }
    // the day's special
    if (th.sukkot || th.kind !== 'weekday') h += festHTML(th);
    // practice
    h += '<div class="av-sec">לימוד — כל חלק, בכל שעה</div><div class="av-grid">';
    h += `<button class="av-tile wide" data-play="shachar" data-mode="practice"><b>התמיד של שחר — כל הסדר</b><small>${iso(m.shachar.length)} עבודות, מן הפייס ועד השיר של יום</small></button>`;
    // ── hooks ── each tile shows its mastery tier (למד · מיומן · בקי · מומחה)
    const tierTag = (g) => { const k = HK ? HK.tier(g) : 0; return k ? `<i class="hk-tag hk-t${k}">${esc(HK.tierHe(k))}</i>` : ''; };
    for (const g of m.shachar) h += `<button class="av-tile${A.games[g] ? ' done' : ''}" data-play="${g}"><b>${esc(GAMES[g].he)}</b><small>${esc(stepsLine(g))}</small>${tierTag(g)}</button>`;
    h += '</div><div class="av-sec">המשך היום</div><div class="av-grid">';
    h += `<button class="av-tile${A.games.korbanot ? ' done' : ''}" data-play="korbanot"><b>קרבנות העולים לרגל</b><small>מקום, דם, אכילה — זבחים ה</small></button>`;
    // ── ui ── (QA P2-15) on a day with a Musaf it is part of today; on other days its practice tile waits under "שבת ומועד"
    const musafTile = `<button class="av-tile${A.games.musaf ? ' done' : ''}" data-play="musaf"><b>${th.musaf.length ? 'מוסף היום' : 'מוסף של שבת'}</b><small>${esc(th.musaf.map((x) => x.name_he).join(' · ') || 'במדבר כח · אין מוסף היום')}</small></button>`;
    if (th.musaf.length) h += musafTile;
    h += `<button class="av-tile${A.games.erev ? ' done' : ''}" data-play="erevchain"><b>התמיד של בין הערביים</b><small>שחיטה, אברים, נרות, חביתין, שיר — ועד נעילת השערים</small></button>`;
    h += `<button class="av-tile${A.games.neirot ? ' done' : ''}" data-play="neirot"><b>הדלקת הנרות</b><small>מן הנר המערבי</small></button>`;
    // ── avoda12 ── the evening's new moments, to practise alone
    for (const g of ['machar', 'neilah']) h += `<button class="av-tile${A.games[g] ? ' done' : ''}" data-play="${g}"><b>${esc(GAMES[g].he)}</b><small>${esc(stepsLine(g))}</small></button>`;
    h += svcTiles(A);   // ── service13 ──
    h += '</div><div class="av-sec">שבת ומועד</div><div class="av-grid">';
    if (!th.musaf.length) h += musafTile;   // ── ui ──
    h += `<button class="av-tile${A.games.lechem ? ' done' : ''}" data-play="lechem"><b>לחם הפנים</b><small>בכל שבת — השולחן לעולם אינו ריק</small></button>`;
    h += `<button class="av-tile${A.games.aravot ? ' done' : ''}" data-play="aravot"><b>ערבות סביב המזבח</b><small>סוכות · "אנא ה׳ הושיעה נא"</small></button>`;
    h += `<button class="av-tile${A.games.shoevah ? ' done' : ''}" data-play="shoevah"><b>שמחת בית השואבה</b><small>לילות חול המועד</small></button>`;
    h += '</div>';
    if (ctx.exitable && ctx.exitable()) h += '<div class="av-sec">בניין הבית</div><button class="av-btn av-go" data-a="build" style="width:100%">חזרה לבניית הבית · שלב א׳</button>';
    return h;
  }
  /* ── service13 ── the home's box: the ketoret he compounded at Beit Avtinas (a gentle invitation when there is none or
   * little — never a warning), tomorrow's animals from the calendar, and the lambs' chamber (always six or more) */
  function svcHTML(m) {
    const v = m.svc;
    if (!v) return '';
    const Y = KETORET_YEAR, half = (x) => (x % 1 ? `${Math.floor(x) ? Math.floor(x) : ''}½` : String(x));
    let k = '';
    if (!v.made && v.manim <= 0) k = `<p>בבית אבטינס מפטמים את הקטורת לכל השנה — ${Y.manim} מנה. בוא לשקול את אחד עשר הסממנים ולשחוק בקצב: "הדק היטב, היטב הדק".</p>`;
    else if (v.manim <= 0) k = '<p>הקטורת שפיטמת הוקטרה כולה, יום אחר יום. בית אבטינס ישמחו לעזרתך בפיטום חדש.</p>';
    else k = `<p>באוצר הקטורת שפיטמת: <b>${half(v.manim)} מנה</b> — מנה ליום, ושלושה מנים לחפינת הכהן הגדול ביום הכיפורים.${v.low ? ' היא מתמעטת — בית אבטינס ישמחו לעזרתך.' : ''}</p>`;
    if (v.manim > 0) k += `<div class="av-bar" aria-label="אוצר הקטורת"><i style="width:${Math.max(2, Math.round((v.manim / Y.manim) * 100))}%"></i></div>`;
    k += `<small style="display:block">מנה ליום: "${esc(PITUM_LINES.day.quote)}" <span class="av-ref">${esc(PITUM_LINES.day.source)}</span></small>`;
    const nd = v.need && v.need.tomorrow;
    const tt = v.tended;
    let d = nd ? `<p style="margin-top:6px">מחר צריך: <b>${esc(needHe(nd))}</b>${v.need.tomorrowRest ? ' · מחר מנוחה' : ''}</p>` : '';
    d += `<small style="display:block">בלשכת הטלאים: שישה טלאים בדוקים לפחות <span class="av-ref">${esc(PITUM_LINES.six.source)}</span>${tt && (tt.w || tt.f || tt.n) ? ` · היום: ${[tt.w && 'השקית', tt.f && 'נתת מספוא', tt.n && `בדקת ${tt.n}`].filter(Boolean).join(', ')} ✓` : ''}${v.checked ? ` · בדקת עד היום ${iso(v.checked)} טלאים` : ''}</small>`;
    return `<div class="av-box av-svc"><h3>בית אבטינס והדיר <span class="av-draft">טיוטה</span></h3>${k}${d}<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="av-btn${!v.made || v.low ? ' gold' : ''}" data-play="pitum" style="flex:1 1 140px;min-height:44px">לפטם קטורת</button><button class="av-btn" data-play="dir" style="flex:1 1 140px;min-height:44px">לדיר וללשכת הטלאים</button></div></div>`;
  }
  const svcTiles = (A) => `<button class="av-tile${A.games.pitum ? ' done' : ''}" data-play="pitum"><b>${esc(GAMES.pitum.he)}</b><small>בית אבטינס · כריתות ו</small></button><button class="av-tile${A.games.dir ? ' done' : ''}" data-play="dir"><b>${esc(GAMES.dir.he)}</b><small>מים, מספוא ובדיקת טלאים · ערכין ב, ה</small></button>`;
  // ── /service13 ──
  function festHTML(th) {
    let h = `<div class="av-box fest"><h3>${esc(th.labelHe)}${th.evening ? ' <span class="av-badge gold">מן הערב</span>' : ''}</h3>`;
    if (th.musaf.length) h += `<p>מוסף: ${esc(th.musaf.map((m) => `${m.name_he} — ${[m.bulls && `${m.bulls} פרים`, m.rams && `${m.rams} אילים`, m.lambs && `${m.lambs} כבשים`, m.goats && `${m.goats} שעיר`].filter(Boolean).join(', ')}`).join(' · '))}</p>`;
    if (th.sukkot) {
      const nm = contentEvent('nisuch_hamayim');
      h += `<p><b>ניסוך המים</b> — עם התמיד של שחר: צלוחית זהב מן השילוח, "הגבה ידך!" <span class="av-draft">טיוטה</span></p><small>${esc(nm ? nm.source : '')}</small>`;
      if (th.sukkot.aravot) h += `<p><b>ערבות סביב המזבח</b> — זוקפים ענפי ערבה בצדי המזבח ומקיפים אותו ${th.sukkot.day === 7 ? 'שבע פעמים (הושענא רבה)' : 'פעם אחת'}. <span class="av-draft">טיוטה</span></p><small>${esc(FALLBACK.aravot.source)}</small>`;
      else h += `<p><b>ערבה — לא היום</b>: הערבה אינה דוחה את השבת (רק כשהיום השביעי חל בשבת). ניסוך המים — כן, כל שבעת הימים. <span class="av-draft">טיוטה</span></p><small>${esc(FALLBACK.aravot_shabbat.source)}</small>`;
      if (th.sukkot.shoevah) h += `<p><b>שמחת בית השואבה</b> — ${th.sukkot.shoevahNow ? 'עכשיו, בעזרת הנשים' : esc(th.sukkot.shoevahWhen || '')}. "מי שלא ראה שמחת בית השואבה לא ראה שמחה מימיו". <span class="av-draft">טיוטה</span></p><small>סוכה ה, א–ד</small>`;
      else h += '<small>אין שמחת בית השואבה בליל יום טוב ובליל שבת — "שאינה דוחה לא את השבת ולא את יום טוב" (סוכה ה, א).</small>';
    }
    if (th.events.some((e) => e.id === 'lechem_hapanim')) h += '<p><b>לחם הפנים</b> מתחלף היום, והבזיכים מוקטרים. <span class="av-draft">טיוטה</span></p><small>מנחות יא, ז</small>';
    if (th.sukkot && ctx.hooks) h += ctx.hooks.fest(th);   // ── hooks ── the bulls 13 → 7, the mishmarot, the festival days
    return h + '</div>';
  }
  // (── avoda12 ── a new moment has no step of the 40: its tile shows its own item's source)
  const stepsLine = (g) => GAMES[g].steps.slice(0, 2).map((id) => (contentStep(id) || {}).name_he || id).join(' · ') || (GAMES[g].day && dayItem(GAMES[g].day[0]) ? dayItem(GAMES[g].day[0]).source : '');
  function bookHTML(m) {
    const A = m.A, n = Object.keys(A.book).length;
    let h = `<div class="av-head"><div class="av-grow"><h2>ספר העבודה</h2><p>${iso(n)} מתוך ${iso(STEPS.length)} שלבי היום — מן השמירה בלילה ועד הקטר האברים בלילה.</p></div></div><div class="av-bar"><i style="width:${Math.round((n / STEPS.length) * 100)}%"></i></div>`;
    h += '<div style="margin-top:8px">';
    for (const b of BOOK) {
      const got = A.book[b.id];
      h += `<div class="av-row ${got ? 'on' : 'off'}"><span class="n">${b.order}</span><button data-step="${b.id}"><b>${esc(b.he)}</b><small>${got ? `${got.live ? 'נכחת בזמן · ' : ''}נלמד ${iso(got.n)} פעמים` : b.game ? `במשחק: ${esc(GAMES[b.game].he)}` : ''}</small></button><span class="av-draft">טיוטה</span></div>`;
    }
    // ── avoda12 ── more of the day (wave 12): the moments beyond the forty, each with its source — a tap plays it
    h += '</div><div class="av-sec">ועוד מעבודות היום</div><div class="av-grid">';
    for (const g of DETAIL) {
      const it = GAMES[g] && GAMES[g].day ? dayItem(GAMES[g].day[0]) : null;
      h += `<button class="av-tile${A.games[g] ? ' done' : ''}" data-play="${g}"><b>${esc(GAMES[g].he)}</b><small>${esc(it ? it.source : '')}${A.games[g] ? ` · ${iso(A.games[g].n)} פעמים` : ''}</small></button>`;
    }
    h += svcTiles(A);   // ── service13 ──
    return h + '</div>';
  }
  function pathHTML(m) {
    const A = m.A, r = m.rank;
    let h = `<div class="av-head"><div class="av-grow"><h2>הדרך שלי</h2><p>${esc(A.name || 'כהן צעיר')}${A.mishmar ? ` · משמר ${esc(MISHMAROT[A.mishmar - 1])}` : ''}</p></div><span class="av-badge gold">${iso(A.points)} זכויות</span></div>`;
    if (m.phaseA && m.phaseA.priests) h += `<div class="av-box"><h3>בית האב שלך</h3><small>${iso(m.phaseA.priests)} כהנים שהכשרת בבניין הבית (שלב א׳) משרתים עכשיו במשמר ${A.mishmar ? esc(MISHMAROT[A.mishmar - 1]) : 'שלך'}.</small></div>`;
    h += `<div class="av-box"><h3>רצף ימים: ${iso(A.streak.n)} ${A.streak.best > A.streak.n ? `<small style="display:inline">(שיא ${iso(A.streak.best)})</small>` : ''}</h3><small>עבודה אחת ביום שומרת על הרצף. שבת ויום טוב לעולם אינם שוברים אותו.</small></div>`;
    const ket = A.ketoret.done;
    h += `<div class="av-box ${ket ? 'fest' : ''}"><h3>${ICON.flame} הקטורת ${ket ? '<span class="av-badge real">הקטרת!</span>' : '<span class="av-badge">חדש לקטורת</span>'}</h3><small>${ket ? `ביום ${esc(A.ketoret.day)}. "מעולם לא שנה אדם בה" (יומא כו, א) — רגע של פעם בחיים.` : 'רק מי שעוד לא הקטיר משתתף בפיס השלישי — "חדשים לקטורת" (תמיד ה, ב). בתוך ימים ספורים של השתתפות תזכה.'}</small></div>`;
    h += `<div class="av-sec">שלושה עשר התפקידים (${iso(m.rolesDone)} מתוך 13)</div><div class="av-roles">${ROLES.map((x) => `<span class="${A.roles[x.id] ? 'got' : ''}">${esc(x.win)}</span>`).join('')}</div>`;   // ── ui ── (QA P2-8)
    h += `<div class="av-sec">חמשה עשר הממונים (${iso(r.rank)} מתוך 15)</div>`;   // ── ui ── (QA P2-8) "x מתוך N", not a reversed "N/x"
    if (r.next) h += `<div class="av-bar"><i style="width:${Math.round(((A.points - r.prev) / (r.next - r.prev)) * 100)}%"></i></div><small style="display:block;margin:4px 2px;color:var(--av-soft);font-size:12px">עוד ${iso(r.next - A.points)} זכויות לפגישה עם הממונה הבא</small>`;
    h += '<div class="av-ladder">';
    MEMUNIM.forEach((mm, k) => {
      const met = k < r.rank;
      h += `<div class="${met ? 'met' : 'lock'}"><b>${k + 1}</b><span class="av-grow">${met ? `<strong>${esc(mm.name_he)}</strong> — ${esc(mm.role_he)}` : `ממונה ${k + 1} · ${iso(RANKS[k])} זכויות`}</span>${met ? '<span class="av-draft">טיוטה</span>' : ''}</div>`;
    });
    h += '</div><small style="display:block;margin-top:8px;color:var(--av-soft);font-size:12px">"אלו הן הממנין שהיו במקדש" — שקלים ה, א.</small>';
    if (ctx.hooks) h += ctx.hooks.path();   // ── hooks ── mastery per work, the vessels, the mishmar's turn
    return h;
  }
  function openStep(id) {
    const s = contentStep(id);
    if (!s) return;
    card({ kicker: 'ספר העבודה', cards: [toCard(s)], button: 'סגור' });
  }

  /* ───────── modal cards ───────── */
  function modal(html, { onOpen } = {}) {
    return new Promise((resolve) => {
      const w = doc.createElement('div');
      w.className = 'av-modal';
      w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
      w.innerHTML = `<div class="av-card">${html}</div>`;
      el.appendChild(w);
      modalOpen++;
      requestAnimationFrame(() => w.classList.add('on'));
      const close = (v) => { modalOpen--; w.classList.remove('on'); setTimeout(() => w.remove(), ctx.fast ? 20 : 220); resolve(v); };
      w.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) { ctx.sfx && ctx.sfx.play('ui'); close(b.dataset.v); } });
      if (onOpen) onOpen(w, close);
      const go = w.querySelector('.av-go'); if (go) go.focus({ preventScroll: true });
    });
  }
  /** Source cards after a mini-game: the first open, the rest folded. gains: [{t, cls}] */
  function card({ kicker = '', cards = [], gains = [], text = '', button = 'הבא', alt = null, brief = false }) {
    const [first, ...rest] = cards.filter(Boolean);
    const HK = ctx.hooks, short = !!(brief && HK && first);   // ── hooks ── a repeat: the brief card
    let h = `<div class="av-kick">${esc(kicker)}</div>`;
    if (text) h += `<p style="margin-top:6px;font-weight:700">${esc(text)}</p>`;
    if (gains.length) h += `<div class="av-gain">${gains.map((g) => `<span class="${g.cls || ''}">${esc(g.t)}</span>`).join('')}</div>`;
    h += short ? HK.brief(first, cardHTML) : first ? `<div class="av-sub">${cardHTML(first)}</div>` : '';
    if (rest.length) h += `<details><summary>עוד מקורות (${rest.length})</summary>${rest.map((c) => `<div class="av-sub">${cardHTML(c, { level: 'h4' })}</div>`).join('')}</details>`;
    h += `<button type="button" class="av-btn gold av-go" data-v="next">${esc(button)}</button>`;
    if (alt) h += `<button type="button" class="av-btn av-alt" data-v="alt" style="width:100%;margin-top:8px">${esc(alt)}</button>`;
    // ── hooks ── the brief card moves on by itself after a few seconds (a thin bar shows it); any touch keeps it open
    if (short && HK.autoMs > 0) {
      h += `<div class="hk-auto" aria-hidden="true"><i style="animation-duration:${HK.autoMs}ms"></i></div>`;
      return modal(h, {
        onOpen(w, close) {
          let t = setTimeout(() => { if (w.classList.contains('on') && w.isConnected) close('next'); }, HK.autoMs);
          const stop = () => { clearTimeout(t); t = 0; const b = w.querySelector('.hk-auto'); if (b) b.remove(); };
          w.addEventListener('pointerdown', stop, true); w.addEventListener('click', stop, true); w.addEventListener('keydown', stop, true);
        },
      });
    }
    return modal(h);
  }
  function summary({ title, lines = [], gains = [], quote = null, button = 'חזרה לבית', alt = null }) {
    let h = `<div class="av-kick">סוף העבודה</div><h2>${esc(title)}</h2>`;
    if (quote) h += `<p class="av-q">"${esc(quote.q)}"</p><span class="av-ref">${esc(quote.src)}</span> <span class="av-draft">טיוטה</span>`;
    if (lines.length) h += `<ul style="margin:10px 0 0;padding-inline-start:18px;font:500 14px/1.6 Heebo,sans-serif">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    if (gains.length) h += `<div class="av-gain">${gains.map((g) => `<span class="${g.cls || ''}">${esc(g.t)}</span>`).join('')}</div>`;
    h += `<button type="button" class="av-btn gold av-go" data-v="home">${esc(button)}</button>`;
    if (alt) h += `<button type="button" class="av-btn av-alt" data-v="alt" style="width:100%;margin-top:8px">${esc(alt)}</button>`;   // ── hooks ──
    return modal(h);
  }
  /** The 10-second name + mishmar pick (skipped when the Phase A save has them).
   *  ── avoda12 ── (N69) a name he already chose (in Phase A) is never asked again: the card greets him by it and asks
   *  only the mishmar. */
  function namePick({ name: known = '' } = {}) {
    let pick = 0;
    const nm = String(known || '').trim();
    const ask = nm
      ? `<h2 class="av-greet">שלום, הכהן ${esc(nm)}!</h2>`
      : `<h2>איך קוראים לך?</h2>
      <input class="av-input" maxlength="24" aria-label="השם שלך" placeholder="השם שלך (לא חובה)">`;
    const h = `<div class="av-kick">כהן צעיר מגיע למקדש <span class="av-draft">טיוטה</span></div>${ask}
      <p style="margin-top:12px"><b>לאיזה משמר אתה שייך?</b></p>
      <div class="av-mishmarot" role="group" aria-label="המשמרות">${MISHMAROT.map((m, i) => `<button type="button" data-m="${i + 1}" aria-pressed="false">${esc(m)}</button>`).join('')}</div>
      <p style="margin-top:8px;font-size:12.5px;color:var(--av-soft)">24 משמרות הכהונה (דברי הימים א כד). כל משמר עובד שבוע אחד בתורו.</p>
      <div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="av-btn gold av-go" style="flex:1" data-v="ok">יאללה לעבודה</button><button type="button" class="av-btn" data-v="rand">בחר בשבילי</button></div>`;
    let input = null;
    return modal(h, {
      onOpen(w) {
        input = w.querySelector('.av-input');
        w.querySelector('.av-mishmarot').addEventListener('click', (e) => {
          const b = e.target.closest('[data-m]'); if (!b) return;
          pick = +b.dataset.m;
          w.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        });
      },
    }).then((v) => ({ name: nm ? nm.slice(0, 24) : input ? input.value.trim().slice(0, 24) : '', mishmar: v === 'rand' || !pick ? 1 + Math.floor(Math.random() * 24) : pick }));
  }
  /** The first visit: three lines on how the House works. ── avoda12 ── (N69) greeted by his name: "שלום, הכהן <name>" */
  function intro(name) {
    const h = `<div class="av-kick">העבודה בבית <span class="av-draft">טיוטה</span></div><h2 class="av-greet">${esc(name ? `שלום, הכהן ${name} — ` : '')}ברוך הבא לעבודה</h2>
      <!-- ── fable27 ── the kid's intro: three lines (FRESH27: "קיר טקסט"; the old lines spoke of a fair lottery — the lots are counting) ── /fable27 ── -->
      <ul style="margin:6px 0 0;padding-inline-start:18px;font:500 16px/1.7 Heebo,sans-serif">
        <li>אתה כהן במקדש. למעלה כתוב <b>לאן ללכת</b> — החץ מראה את הדרך.</li>
        <li>אגודל שמאל — <b>הולכים</b>. אגודל ימין — <b>עובדים</b>.</li>
        <li>טעות לא מענישה. ממשיכים.</li>
      </ul>
      <button type="button" class="av-btn gold av-go" data-v="go">לעבודה</button>`;
    return modal(h);
  }
  function toast(text, ms = 2600) {
    if (!el) return;
    E.toast.textContent = text; E.toast.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => E.toast.classList.remove('on'), ms);
  }
  return {
    mount, destroy, setStatus, progress, showHome, renderHome, card, summary, namePick, intro, toast, refreshMute,
    get homeOpen() { return homeOpen; }, get busy() { return modalOpen > 0; }, get el() { return el; },
    setTab(t) { tab = t; renderHome(); },
  };
}
