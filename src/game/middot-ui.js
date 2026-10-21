/* ─────────────────────────────────────────────────────────────────────────────
 * middot-ui.js: MIDDOT10 (wave 10), the Middot book that pays, and every place in it a door to the world.
 *
 *   decorateBook(el, o)  ui.js renderSheet's hook (the middot10 fence), after the book's page is rendered into `el`:
 *     - a mishna's text: every place it names becomes a link (middot.js placeSpans: matched without the niqqud, shown with it);
 *     - the learning points, a warm line, the title; each chapter's short quiz; the final test (מבחן סיום המסכת).
 *     o = { G, sel (the open mishna id or null), ch (the chapter tab, 0..4), ctx (the HUD's: act, sfx, now), ui: {closeSheet,
 *     openSheet, renderSheet, toast, flashRes} }
 *   placeFlight(key, o)  index.js's showPlace (the middot10 fence): the book closes, the camera flies to the place, its card
 *     opens (the tap-to-identify card, src/info.js), a chip leads back to the same mishna. A place not built yet is seen in the
 *     whole-Temple view (never during the first-time flow). The game's own camera nets hold while the place is shown.
 * The rules: middot-quiz.js. The texts here are ours (drafts); every question shows its source and טיוטה.
 * ──────────────────────────────────────────────────────────────────────────── */
import { MIDDOT, MIDX, PLACE, placeSpans } from './middot.js';
import * as Q from './middot-quiz.js';
import { gain } from './state.js';
import { stageById, TRAIN } from './content.js';
import { MD_CSS } from './middot-ui.css.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n) => `<b class="gm-num">${n}</b>`;
const draft = '<span class="gm-draft">טיוטה</span>';
let cur = null;   // the last decorateBook's options (the delegated clicks read them)
const told = new Set();   // chapters whose "studied" toast was shown this session

function css(doc) {
  if (doc.getElementById('md10-css')) return;
  const s = doc.createElement('style'); s.id = 'md10-css'; s.textContent = MD_CSS; doc.head.appendChild(s);
}
const PIN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const pin = (o) => { try { const i = o && o.ui && o.ui.icon ? o.ui.icon('pin') : ''; return i || PIN; } catch (e) { return PIN; } };
const play = (o, k, x) => { try { if (o && o.ctx && o.ctx.sfx) o.ctx.sfx.play(k, x); } catch (e) { /* a sound we lack */ } };

/** a mishna's text with its place names as links (the original letters and marks, escaped) */
export function linkedHTML(m) {
  const sp = placeSpans(m.he, m.id);
  let h = '', at = 0;
  for (const s of sp) {
    const P = PLACE[s.key];
    h += esc(m.he.slice(at, s.s));
    // (a span, not a <button>: a button is an atomic inline box, its padding would open the lines; this one wraps like text)
    h += `<span class="md-pl" role="button" tabindex="0" data-md="place" data-k="${esc(s.key)}" aria-label="${esc(P.he)}: איפה זה בעולם">${esc(m.he.slice(s.s, s.e))}</span>`;
    at = s.e;
  }
  return { html: h + esc(m.he.slice(at)), n: sp.length };
}

/* ───────── the book's page ───────── */
export function decorateBook(el, o) {
  if (!el || !o || !o.G) return;
  cur = o; o.root = (el.closest && el.closest('.gm')) || null;
  const doc = el.ownerDocument || document;
  css(doc);
  try { Q.ensure(o.G); } catch (e) { return; }
  if (!el.__md10) {
    el.__md10 = true; el.addEventListener('click', onClick);
    el.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('md-pl')) { e.preventDefault(); e.target.click(); } });
  }
  if (o.sel && MIDX[o.sel] !== undefined) mishnaPage(el, o, MIDDOT[MIDX[o.sel]]);
  else indexPage(el, o);
}

function mishnaPage(el, o, m) {
  const p = el.querySelector('.gm-q');
  if (p && !p.__md10) {
    const L = linkedHTML(m);
    p.innerHTML = L.html; p.__md10 = true;
    if (L.n) {
      const tip = el.ownerDocument.createElement('div');
      tip.className = 'md-tip';
      tip.innerHTML = `<span class="md-ic" aria-hidden="true">${pin(o)}</span><span>הקש על שם של <b>מקום</b> כדי לראות איפה הוא בעולם</span>`;
      p.after(tip);
    }
  }
  // the chapter just studied: its quiz waits here, at the end of the mishna (and a toast says so once, the text may be long)
  const c = +m.id.split('.')[0], st = Q.chapter(o.G, c);
  if (st.ready && !st.taken && !told.has(c)) {
    told.add(c);
    try { if (o.ui && o.ui.toast) o.ui.toast({ icon: 'book', title: `למדת את פרק ${st.he}׳!`, body: 'מבחן קצר מחכה לך בסוף המשנה', kind: 'mini', ms: 4200 }); } catch (e) { /* HUD */ }
  }
  if (st.ready && !el.querySelector('.md-done')) {
    const d = el.ownerDocument.createElement('div');
    d.className = 'md-done';
    d.innerHTML = st.taken
      ? `<div>מבחן על פרק ${st.he}׳ · השיא שלך ${num(st.best)} מתוך ${num(st.size)}</div><button class="gm-btn" data-md="quiz" data-c="${c}">לנסות שוב את המבחן</button>`
      : `<div><b>למדת את פרק ${st.he}׳!</b> מבחן קצר מחכה לך: ${num(st.size)} שאלות, ${num(Q.RULES.per)} נקודות לכל תשובה נכונה.</div><button class="gm-btn gm-btn-gold" data-md="quiz" data-c="${c}">למבחן על פרק ${st.he}׳</button>`;
    const ref = el.querySelector('.gm-ref:last-child') || null;
    if (ref) ref.before(d); else el.appendChild(d);
  }
}

function warmLine(G) {
  const s = Q.summary(G), f = Q.final(G);
  const anyReady = Q.CHAPTERS.some((c) => Q.chapter(G, c).ready);
  if (f.done) return 'סיימת את מבחן המסכת. הדרן עלך, מסכת מידות! אפשר לחזור ולהיבחן, והשיא נשמר.';
  if (f.open) return `כל חמשת הפרקים נבחנו! מבחן סיום המסכת פתוח: עד ${Q.RULES.finSize * Q.RULES.finPer + Q.RULES.siyum} נקודות.`;
  if (s.pts > 0) return `יפה מאוד! נבחנת על ${s.taken} מתוך 5 פרקים. אחרי כולם: מבחן סיום המסכת, והרבה נקודות.`;
  if (anyReady) return 'למדת פרק! מבחן קצר מחכה לך בפרק, ועליו נקודות.';
  return 'קרא את המשניות שנפתחו בפרק, ומבחן קצר יחכה לך בסופו. על כל תשובה נכונה: נקודות.';
}

function indexPage(el, o) {
  const doc = el.ownerDocument, G = o.G;
  if (!el.querySelector('.md-pts')) {
    const s = Q.summary(G), f = Q.final(G);
    const box = doc.createElement('div');
    box.className = 'md-pts';
    let h = `<div class="md-pts-h"><span class="md-star" aria-hidden="true">★</span><span class="md-n gm-num">${s.pts}</span><span>נקודות לימוד</span>${s.title ? `<span class="md-title">${esc(s.title)}</span>` : ''}</div>`;
    h += `<p class="md-warm">${esc(warmLine(G))}</p>`;
    if (f.open) h += `<button class="gm-btn ${f.done ? '' : 'gm-btn-gold'}" data-md="quiz" data-c="fin">${f.done ? `מבחן סיום המסכת שוב · השיא ${f.best} מתוך ${f.size}` : 'למבחן סיום המסכת'}</button>`;
    box.innerHTML = h;
    const intro = el.querySelector('p.gm-muted');
    if (intro) { intro.after(box); intro.innerHTML = intro.innerHTML.replace(/ (<b class="gm-num">)/g, '\u00a0$1'); }   // (PRODUCER10 N30: "נקראו" / "0" wrapped apart)
    else el.prepend(box);
  }
  const tabs = el.querySelector('.gm-tabs');
  if (tabs && !el.querySelector('.md-chq')) {
    const c = (o.ch | 0) + 1, st = Q.chapter(G, c);
    const d = doc.createElement('div');
    if (st.ready) {
      d.className = 'md-chq';
      d.innerHTML = `<button class="gm-btn ${st.taken ? '' : 'gm-btn-gold'}" data-md="quiz" data-c="${c}">מבחן על פרק ${st.he}׳</button><small>${st.taken ? `השיא שלך: ${st.best} מתוך ${st.size} · אפשר לנסות שוב` : `${st.size} שאלות · ${Q.RULES.per} נקודות לכל תשובה נכונה`}</small>`;
    } else {
      d.className = 'md-chq md-wait';
      d.textContent = st.open === 0 ? `המשניות של פרק ${st.he}׳ נפתחות כשבונים. אחרי שתלמד אותן: מבחן קצר ונקודות.`
        : st.missing > 0 ? `קרא עוד ${st.missing === 1 ? 'משנה אחת' : `${st.missing} משניות`} בפרק ${st.he}׳, ומבחן קצר יחכה לך.`
          : `פרק ${st.he}׳: עוד אין שאלות על המשניות שנפתחו.`;
    }
    tabs.after(d);
  }
  dailyRow(el, o);   // ── FUN11 ── today's question sits with the learning points (one system)
}

function onClick(e) {
  const b = e.target.closest('[data-md]');
  if (!b || !cur) return;
  e.stopPropagation();
  const o = cur;
  if (b.dataset.md === 'place') {
    play(o, 'ui');
    const act = o.ctx && o.ctx.act;
    if (act && typeof act.showPlace === 'function') act.showPlace(b.dataset.k, o.sel || null);
    return;
  }
  if (b.dataset.md === 'quiz') { play(o, 'ui'); openQuiz(o, b.dataset.c === 'fin' ? 'fin' : +b.dataset.c); }
  if (b.dataset.md === 'pq') { play(o, 'ui'); const act = o.ctx && o.ctx.act; if (act && typeof act.placeQuiz === 'function') act.placeQuiz(); }
}

/* ───────── the quiz ───────── */
const RESULT_LINE = (r, n) => (r === n ? 'מושלם! ידעת הכול.' : r / n >= 0.6 ? 'יפה מאוד! למדת היטב.' : 'כל תשובה היא עוד משהו שלמדת. אפשר לנסות שוב מתי שתרצה.');

export function openQuiz(o, which) {
  const G = o.G, qs = Q.build(G, which, Math.random);
  const root = o.root || document.querySelector('.gm') || document.body;
  if (!qs.length) { if (o.ui && o.ui.toast) o.ui.toast({ icon: 'book', title: 'עוד אין מבחן', body: 'קרא קודם את המשניות שנפתחו בפרק', kind: 'mini' }); return null; }
  const title = which === 'fin' ? 'מבחן סיום המסכת' : `מבחן על פרק ${Q.CH_HE[which - 1]}׳`;
  const w = document.createElement('div');
  w.className = 'gm-modal md-qz';
  w.innerHTML = '<div class="gm-card" role="dialog" aria-modal="true"></div>';
  const card = w.firstChild;
  root.appendChild(w);
  requestAnimationFrame(() => w.classList.add('on'));
  let i = 0, right = 0, locked = false;
  const close = () => { w.classList.remove('on'); setTimeout(() => { w.remove(); try { o.ui.renderSheet(); } catch (e) { /* the sheet is gone */ } }, 220); };
  const prog = () => `<div class="md-prog" aria-hidden="true">${qs.map((_, k) => `<i class="${k < i || (k === i && locked) ? 'on' : ''}"></i>`).join('')}</div>`;
  function ask() {
    const q = qs[i]; locked = false;
    card.innerHTML = `<div class="gm-kick">${esc(title)} · שאלה ${i + 1} מתוך ${qs.length} ${q.draft ? draft : ''}</div>${prog()}<h2>${esc(q.q)}</h2>
      <div class="md-list">${q.a.map((a, k) => `<button type="button" class="md-ans" data-k="${k}"><span class="md-mk" aria-hidden="true"></span><span>${esc(a)}</span></button>`).join('')}</div>
      <div class="md-fb"></div>
      <div class="gm-btn-row"><button class="gm-btn" data-x="close" style="flex:1">יציאה</button></div>`;
    const first = card.querySelector('.md-ans'); if (first) first.focus({ preventScroll: true });
  }
  function answer(k) {
    if (locked) return; locked = true;
    const q = qs[i], ok = k === q.ok;
    if (ok) { right++; play(o, 'chime', { combo: 5 }); }
    for (const b of card.querySelectorAll('.md-ans')) {
      b.disabled = true;
      const bk = +b.dataset.k;
      if (bk === q.ok) { b.classList.add('md-right'); b.querySelector('.md-mk').textContent = '✓'; }
      else if (bk === k) b.classList.add('md-chosen');
    }
    card.querySelector('.md-prog').outerHTML = prog();
    const last = i === qs.length - 1;
    card.querySelector('.md-fb').innerHTML = `<div class="gm-note"><b>${ok ? 'נכון!' : `התשובה: ${esc(q.a[q.ok])}.`}</b> ${esc(q.ex)}<span class="gm-ref">${esc(q.ref)}${q.draft ? ` · ${draft}` : ''}</span></div>`;
    card.querySelector('.gm-btn-row').innerHTML = `<button class="gm-btn gm-btn-gold" data-x="next" style="flex:1">${last ? 'לתוצאה' : 'לשאלה הבאה'}</button>`;
    const nx = card.querySelector('[data-x="next"]'); if (nx) nx.focus({ preventScroll: true });
  }
  function result() {
    const r = Q.record(G, which, right, qs.length, qs.map((q) => q.id));
    if (!r) { close(); return; }
    if (r.silver > 0) { try { gain(G, { silver: r.silver }); } catch (e) { G.res.silver += r.silver; } }
    try { if (o.ctx && o.ctx.act && o.ctx.act.bookSave) o.ctx.act.bookSave(); } catch (e) { /* storage */ }
    if (r.silver > 0) { try { if (o.ui.refresh) o.ui.refresh(); o.ui.flashRes(['silver']); } catch (e) { /* HUD */ } }
    play(o, r.siyum || r.title ? 'fanfare' : r.silver > 0 ? 'coin' : 'chime');
    const gains = [];
    if (r.gained > 0) gains.push(`<span>★ +${r.gained} נקודות לימוד</span>`);
    if (r.silver > 0) gains.push(`<span>+${r.silver} כסף</span>`);
    const keep = r.gained > 0 ? '' : `<p>השיא שלך: ${num(r.best)} מתוך ${num(r.n)}. הנקודות שלך שמורות.</p>`;
    card.innerHTML = `<div class="md-res"><div class="gm-kick">${esc(title)}${qs.some((q) => q.draft) ? ` ${draft}` : ''}</div>
      <div class="md-big">${r.right} מתוך ${r.n}</div>
      <p>${esc(RESULT_LINE(r.right, r.n))}</p>
      ${r.siyum ? '<p><b>הדרן עלך, מסכת מידות!</b> סיימת את מבחן המסכת.</p>' : ''}
      ${r.title ? `<p>התואר שלך: <span class="md-title">${esc(r.title)}</span></p>` : ''}
      ${gains.length ? `<div class="md-gain">${gains.join('')}</div>` : ''}${keep}
      <p class="gm-muted" style="font-size:13px">סך הכול: ★ ${r.pts} נקודות לימוד</p></div>
      <div class="md-row2 gm-btn-row"><button class="gm-btn" data-x="again">עוד פעם</button><button class="gm-btn gm-btn-gold" data-x="close">חזרה לספר</button></div>`;
  }
  w.addEventListener('click', (e) => {
    const a = e.target.closest('.md-ans');
    if (a && !a.disabled) { answer(+a.dataset.k); return; }
    const x = e.target.closest('[data-x]'); if (!x) return;
    play(o, 'ui');
    if (x.dataset.x === 'next') { if (i < qs.length - 1) { i++; ask(); } else result(); }
    else if (x.dataset.x === 'again') { w.remove(); openQuiz(o, which); }
    else if (x.dataset.x === 'close') close();
  });
  ask();
  return w;
}

/* ───────── שאלת היום (FUN11, wave 11): the daily question inside the learning points (middot-quiz.js DAILY) ─────────
 * o = { G, day, perDay, ctx: {act, sfx}, ui (the HUD: toast, refresh, flashRes, openSheet, root), save(), onRight() → a line or '' }
 * index.js's act.quizOpen (the middot10 fence) calls it from everywhere the game offers "שאלה ממסכת מידות": the book, the daily
 * tasks, the training yard and the rest card. One question at a time, the next one of today's three a tap away. */
const stageName = (id) => { try { const s = stageById(id); return (s && s.n) || ''; } catch (e) { return ''; } };
export function openDaily(o) {
  const G = o && o.G;
  if (!G) return null;
  const root = (o.ui && o.ui.root) || document.querySelector('.gm') || document.body;
  if (!document.getElementById('md10-css')) css(document);
  const perDay = o.perDay || Q.DAILY.perDay;
  const w = document.createElement('div');
  w.className = 'gm-modal md-qz md-daily';
  w.innerHTML = '<div class="gm-card" role="dialog" aria-modal="true"></div>';
  const card = w.firstChild;
  root.appendChild(w);
  requestAnimationFrame(() => w.classList.add('on'));
  let q = null, locked = false, done = false;
  const close = (then) => { if (done) return; done = true; w.classList.remove('on'); setTimeout(() => { w.remove(); try { if (typeof then === 'function') then(); else if (o.ui && o.ui.sheet && o.ui.renderSheet) o.ui.renderSheet(); } catch (e) { /* the HUD */ } }, 220); };   // (the sheet under it — the book, the day's tasks — shows the answer's result)
  const n0 = () => perDay - Q.dailyLeft(G, o.day, perDay);   // answered today
  const openMishna = (m) => close(() => {   // (the book at that mishna, read as a tap on its row would: the daily task, the chapter's quiz)
    try { if (o.ctx && o.ctx.act && typeof o.ctx.act.readMishnah === 'function') o.ctx.act.readMishnah(m); } catch (e) { /* */ }
    try { o.ui.openSheet('book', m); } catch (e) { /* the HUD */ }
  });
  const isOpen = (m) => !!(G.book && G.book.un && G.book.un[m]);
  function ask() {
    q = Q.dailyPick(G, o.day, perDay); locked = false;
    if (!q) {
      const s = Q.summary(G);
      card.innerHTML = `<div class="gm-kick">שאלת היום ${draft}</div><h2>לשאלות של היום כבר ענית</h2>
        <p>מחר יחכו לך שלוש שאלות חדשות. ובינתיים: המבחנים של הפרקים בספר מידות, ועליהם עוד נקודות.</p>
        <div class="md-gain"><span>★ ${s.pts} נקודות לימוד</span></div>
        <div class="md-row2 gm-btn-row"><button class="gm-btn" data-x="close">סגור</button><button class="gm-btn gm-btn-gold" data-x="book">לספר מידות</button></div>`;
      return;
    }
    const mi = MIDX[q.m], mRef = mi !== undefined ? MIDDOT[mi].ref : q.ref;
    const hint = q.tier === 0 ? '' : isOpen(q.m)
      ? `<div class="md-hint">התשובה כתובה ב${esc(mRef.replace('משנה ', ''))}. <button type="button" class="md-link" data-x="read">לקרוא קודם</button></div>`
      : `<div class="md-hint">התשובה כתובה ב${esc(mRef.replace('משנה ', ''))}, שתיפתח בספר כשתבנה${(() => { const m = MIDDOT[mi]; const n = m && m.at && m.at !== 'start' ? stageName(m.at) : ''; return n ? ` את ${esc(n)}` : ''; })()}. אפשר לנחש!</div>`;
    card.innerHTML = `<div class="gm-kick">שאלת היום · ${n0() + 1} מתוך ${perDay} ${q.draft ? draft : ''}</div>
      <h2>${esc(q.q)}</h2>${hint}
      <div class="md-list">${q.a.map((a, k) => `<button type="button" class="md-ans" data-k="${k}"><span class="md-mk" aria-hidden="true"></span><span>${esc(a)}</span></button>`).join('')}</div>
      <div class="md-fb"></div>
      <p class="gm-muted md-per" style="font-size:12.5px;margin:6px 0 0">תשובה נכונה: ★ ${Q.DAILY.pts} נקודות לימוד · שלוש שאלות ביום, ושום דבר לא הולך לאיבוד</p>
      <div class="gm-btn-row"><button class="gm-btn" data-x="close" style="flex:1">אחר כך</button></div>`;
  }
  function answer(k) {
    if (locked || !q) return; locked = true;
    const r = Q.dailyAnswer(G, q, k, o.day, perDay);
    if (!r.ok) { ask(); return; }
    let extra = '';
    if (r.correct) {
      play(o, 'chime', { combo: 5 });
      try { extra = (typeof o.onRight === 'function' && o.onRight()) || ''; } catch (e) { extra = ''; }
    }
    if (r.silver > 0) { try { gain(G, { silver: r.silver }); } catch (e) { G.res.silver += r.silver; } }
    try { if (typeof o.save === 'function') o.save(); } catch (e) { /* storage */ }
    try { if (o.ui && o.ui.refresh) o.ui.refresh(); if (r.silver > 0 && o.ui.flashRes) o.ui.flashRes(['silver']); } catch (e) { /* HUD */ }
    for (const b of card.querySelectorAll('.md-ans')) {
      b.disabled = true;
      const bk = +b.dataset.k;
      if (bk === q.ok) { b.classList.add('md-right'); b.querySelector('.md-mk').textContent = '✓'; }
      else if (bk === k) b.classList.add('md-chosen');
    }
    const hint = card.querySelector('.md-hint'); if (hint) hint.remove();
    const per = card.querySelector('.md-per'); if (per) per.remove();
    const gains = [];
    if (r.gained > 0) gains.push(`<span>★ +${r.gained} נקודות לימוד</span>`);
    if (r.silver > 0) gains.push(`<span>+${r.silver} כסף</span>`);
    if (extra) gains.push(`<span>${esc(extra)}</span>`);
    card.querySelector('.md-fb').innerHTML = `<div class="gm-note"><b>${r.correct ? 'נכון!' : `התשובה: ${esc(q.a[q.ok])}.`}</b> ${esc(q.ex)}<span class="gm-ref">${esc(q.ref)}${q.draft ? ` · ${draft}` : ''}</span></div>
      ${gains.length ? `<div class="md-gain">${gains.join('')}</div>` : `<p class="gm-muted" style="margin:6px 0 0;font-size:13px">עכשיו אתה יודע — וזה העיקר. סך הכול: ★ ${r.pts} נקודות לימוד</p>`}`;
    const btns = [];
    if (isOpen(q.m)) btns.push(`<button class="gm-btn" data-x="read">למשנה בספר</button>`);
    btns.push(r.left > 0 ? `<button class="gm-btn gm-btn-gold" data-x="next">עוד שאלה (${r.left})</button>` : `<button class="gm-btn gm-btn-gold" data-x="close">סיום</button>`);
    card.querySelector('.gm-btn-row').outerHTML = `<div class="md-row2 gm-btn-row">${btns.join('')}</div>`;
    const nx = card.querySelector('.gm-btn-gold'); if (nx) nx.focus({ preventScroll: true });
  }
  w.addEventListener('click', (e) => {
    const a = e.target.closest('.md-ans');
    if (a && !a.disabled) { answer(+a.dataset.k); return; }
    const x = e.target.closest('[data-x]'); if (!x) return;
    play(o, 'ui');
    if (x.dataset.x === 'next') ask();
    else if (x.dataset.x === 'read' && q) openMishna(q.m);
    else if (x.dataset.x === 'book') close(() => { try { o.ui.openSheet('book'); } catch (err) { /* the HUD */ } });
    else if (x.dataset.x === 'close') close();
  });
  ask();
  return w;
}

/** the book's own row for today's question (ui.js bookHTML draws "שאלה ממסכת מידות · … כסף"; the learning points own it now) */
function dailyRow(el, o) {
  const b = el.querySelector('[data-a="quiz"]'), row = b && b.closest('.gm-btn-row');
  if (!row || row.__fun11) return;
  row.__fun11 = true;
  let left = 0;
  try { left = Q.dailyLeft(o.G, dayOf(o), dailyPer(o)); } catch (e) { left = 0; }
  row.classList.add('md-dq');
  b.classList.toggle('gm-btn-gold', left > 0);
  b.innerHTML = `${(o.ui && o.ui.icon && o.ui.icon('book')) || ''} שאלת היום`;
  const sm = row.querySelector('small');
  if (sm) sm.textContent = left > 0 ? `${left === 1 ? 'עוד שאלה אחת' : `עוד ${left} שאלות`} היום · ★ ${Q.DAILY.pts} נקודות לימוד לכל תשובה נכונה` : 'ענית על שאלות היום · מחר יחכו שלוש חדשות';
  const box = el.querySelector('.md-pts');
  if (box) box.appendChild(row);
  // (FUN11) "איפה זה?" — the places quiz in the world, beside today's question
  if (box && !box.querySelector('.md-pqb') && (o.G.ftue | 0) >= 99 && o.ctx && o.ctx.act && typeof o.ctx.act.placeQuiz === 'function') {   // (not in the first minutes: the whole-Temple view is not open yet)
    const pr = el.ownerDocument.createElement('div');
    pr.className = 'gm-btn-row md-dq md-pqr';
    let best = null; try { best = o.G.book && o.G.book.quiz ? o.G.book.quiz.pl : null; } catch (e) { best = null; }
    pr.innerHTML = `<button class="gm-btn md-pqb" data-md="pq">איפה זה?</button><small>המצלמה עפה למקום בבית — ואתה אומר איך קוראים לו · ★ ${Q.PLACES_Q.per} לכל מקום${best != null ? ` · השיא שלך ${best} מתוך ${Q.PLACES_Q.size}` : ''}</small>`;
    box.appendChild(pr);
  }
}
const dayOf = (o) => { try { const t = o.ctx && typeof o.ctx.now === 'function' ? o.ctx.now() : Date.now(); const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; } catch (e) { return ''; } };
const dailyPer = () => (TRAIN && TRAIN.quizPerDay) || Q.DAILY.perDay;

/* ───────── איפה זה? (FUN11, wave 11): the camera flies to a place of the Temple, and he names it ─────────
 * "Interesting" in the owner's words: a view, a choice, a true thing learned. Five places, three names each; the right name opens
 * the words of the Mishnah that name it (its first mention, with its source and טיוטה). A place he has built is shown as it
 * stands; while few are built, the round is seen in the whole-Temple view ("כך ייראה בבית השלם"). 5 points a right name, the
 * best attempt counts (middot-quiz PLACES_Q); nothing is lost. The game's camera nets wait while it runs (hold) and take the
 * frame back to his work when it ends.
 * o = { G, view, S, whole(), enterWhole, exitWhole, ui (the HUD), hold(s) → release, ctx: {act, sfx}, save } */
export const PQ_KEYS = ['nikanor', 'steps15', 'altar', 'kevesh', 'kiyor', 'ulam', 'heichal', 'kodesh', 'beit-hamoked', 'gazit', 'ezrat-nashim', 'east-wall', 'duchan', 'chel', 'shushan', 'karnot', 'redline', 'steps12', 'cells', 'ezrat-yisrael'];
const FIRST = (() => { const f = {}; try { for (const m of MIDDOT) for (const s of placeSpans(m.he, m.id)) if (!f[s.key]) f[s.key] = { m, s }; } catch (e) { /* */ } return f; })();
/** the words of the Mishnah around a place's first mention (a sentence or so, with its marks) */
export function placeQuote(key) {
  const F = FIRST[key]; if (!F) return null;
  const he = F.m.he, a = F.s.s, b = F.s.e;
  let s = Math.max(he.lastIndexOf('.', a - 1), he.lastIndexOf(':', a - 1)) + 1;
  if (a - s > 110) { const c = he.lastIndexOf(',', a - 1); s = c > a - 110 ? c + 1 : Math.max(0, a - 90); }
  let e = he.indexOf('.', b); if (e < 0) e = he.length; if (e - b > 130) { const c = he.indexOf(',', b); e = c > 0 && c - b <= 130 ? c : b + 110; }
  return { text: (s > 0 ? '…' : '') + he.slice(s, e).trim() + (e < he.length ? '…' : ''), ref: F.m.ref, id: F.m.id };
}
/** a place's camera for a phone in portrait: the place over the lower card (panned down: NDC y ≈ +0.3) */
function flyPlace(key, view, ms = 1700) {
  const pose = poseOf(key); if (!pose || !view) return false;
  let [tx, ty, tz] = pose;
  if (typeof innerHeight === 'number' && innerHeight > innerWidth) {
    const a = (pose[4] * Math.PI) / 180, e = (pose[5] * Math.PI) / 180, sft = 0.3 * Math.tan((16 * Math.PI) / 180) * pose[3] * 1.35;
    tx += Math.sin(e) * Math.cos(a) * sft; ty -= Math.cos(e) * sft; tz += Math.sin(e) * Math.sin(a) * sft;
  }
  view.lookAt(tx, ty, tz, pose[3], pose[4], pose[5], ms);
  return true;
}
function shuffle(a, rnd = Math.random) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function placeRounds(G, S, rnd = Math.random) {
  const built = PQ_KEYS.filter((k) => { const P = PLACE[k]; try { return P && P.pt && (!P.stage || S.isDone(G, P.stage)); } catch (e) { return false; } });
  const useBuilt = built.length >= 5, pool = shuffle((useBuilt ? built : PQ_KEYS.filter((k) => PLACE[k] && PLACE[k].pt)).slice(), rnd).slice(0, Q.PLACES_Q.size);
  return { whole: !useBuilt, rounds: pool.map((k) => {
    const others = shuffle(PQ_KEYS.filter((x) => x !== k && PLACE[x] && PLACE[x].he !== PLACE[k].he), rnd).slice(0, 2);
    const names = shuffle([k, ...others], rnd);
    return { key: k, names, ok: names.indexOf(k) };
  }) };
}
export function openPlaceQuiz(o) {
  const G = o && o.G;
  if (!G || !o.view || typeof o.view.lookAt !== 'function') return null;
  if (!document.getElementById('md10-css')) css(document);
  const plan = placeRounds(G, o.S || { isDone: () => true });
  if (!plan.rounds.length) return null;
  try { if (o.ui && o.ui.closeSheet) o.ui.closeSheet(); } catch (e) { /* */ }
  dropChip();
  let entered = false;
  if (plan.whole && !(o.whole && o.whole()) && typeof o.enterWhole === 'function' && (G.ftue | 0) >= 99) { try { o.enterWhole(); entered = true; } catch (e) { entered = false; } }
  const release = typeof o.hold === 'function' ? o.hold(600) : null;
  const root = (o.ui && o.ui.root) || document.querySelector('.gm') || document.body;
  const w = document.createElement('div');
  w.className = 'md-pq'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'איפה זה?');
  root.appendChild(w);
  document.body.classList.add('md-place-on');
  requestAnimationFrame(() => w.classList.add('on'));
  let i = 0, right = 0, locked = false, done = false, poll = 0;
  const R = plan.rounds;
  const end = (reopen) => {
    if (done) return; done = true; clearInterval(poll);
    w.classList.remove('on'); document.body.classList.remove('md-place-on');
    setTimeout(() => w.remove(), 240);
    try { if (entered && o.whole && o.whole() && o.exitWhole) o.exitWhole(); } catch (e) { /* the view */ }
    if (release) release();
    if (reopen) { try { o.ui.openSheet('book'); } catch (e) { /* the HUD */ } }
  };
  const prog = () => `<div class="md-prog" aria-hidden="true">${R.map((_, k) => `<i class="${k < i || (k === i && locked) ? 'on' : ''}"></i>`).join('')}</div>`;
  function ask() {
    const r = R[i]; locked = false;
    flyPlace(r.key, o.view);
    w.innerHTML = `<div class="gm-card"><div class="gm-kick">איפה זה? · ${i + 1} מתוך ${R.length} ${draft}</div>${prog()}
      <h2>${plan.whole ? 'במקדש השלם: איזה מקום במרכז התמונה?' : 'איזה מקום אתה רואה במרכז התמונה?'}</h2>
      <div class="md-list">${r.names.map((k, n) => `<button type="button" class="md-ans" data-n="${n}"><span class="md-mk" aria-hidden="true"></span><span>${esc(PLACE[k].he)}</span></button>`).join('')}</div>
      <div class="md-fb"></div>
      <div class="gm-btn-row"><button class="gm-btn" data-x="close" style="flex:1">יציאה</button></div></div>`;
  }
  function answer(n) {
    if (locked) return; locked = true;
    const r = R[i], ok = n === r.ok;
    if (ok) { right++; play(o, 'chime', { combo: 5 }); }
    for (const b of w.querySelectorAll('.md-ans')) {
      b.disabled = true;
      const bn = +b.dataset.n;
      if (bn === r.ok) { b.classList.add('md-right'); b.querySelector('.md-mk').textContent = '✓'; }
      else if (bn === n) b.classList.add('md-chosen');
    }
    w.querySelector('.md-prog').outerHTML = prog();
    const q = placeQuote(r.key), last = i === R.length - 1;
    w.querySelector('.md-fb').innerHTML = `<div class="gm-note"><b>${ok ? 'נכון!' : 'זה'} ${esc(PLACE[r.key].he)}.</b>${q ? ` <span class="md-pq-q">${esc(q.text)}</span><span class="gm-ref">${esc(q.ref)} · ${draft}</span>` : ''}</div>`;
    w.querySelector('.gm-btn-row').innerHTML = `<button class="gm-btn gm-btn-gold" data-x="next" style="flex:1">${last ? 'לתוצאה' : 'למקום הבא'}</button>`;
  }
  function result() {
    const rec = Q.record(G, 'pl', right, R.length, []);
    if (rec && rec.silver > 0) { try { gain(G, { silver: rec.silver }); } catch (e) { G.res.silver += rec.silver; } }
    try { if (typeof o.save === 'function') o.save(); } catch (e) { /* storage */ }
    try { if (o.ui && o.ui.refresh) o.ui.refresh(); if (rec && rec.silver > 0 && o.ui.flashRes) o.ui.flashRes(['silver']); } catch (e) { /* HUD */ }
    play(o, rec && rec.silver > 0 ? 'coin' : 'chime');
    const gains = [];
    if (rec && rec.gained > 0) gains.push(`<span>★ +${rec.gained} נקודות לימוד</span>`);
    if (rec && rec.silver > 0) gains.push(`<span>+${rec.silver} כסף</span>`);
    w.innerHTML = `<div class="gm-card md-res"><div class="gm-kick">איפה זה? ${draft}</div><div class="md-big">${right} מתוך ${R.length}</div>
      <p>${right === R.length ? 'מושלם! אתה מכיר את הבית.' : right >= 3 ? 'יפה מאוד! אתה מכיר את הבית.' : 'כל מקום שראית הוא עוד משהו שלמדת. אפשר לנסות שוב.'}</p>
      ${gains.length ? `<div class="md-gain">${gains.join('')}</div>` : rec ? `<p>השיא שלך: ${num(rec.best)} מתוך ${num(R.length)}. הנקודות שלך שמורות.</p>` : ''}
      <div class="md-row2 gm-btn-row"><button class="gm-btn" data-x="again">עוד סיבוב</button><button class="gm-btn gm-btn-gold" data-x="book">חזרה לספר</button></div></div>`;
  }
  w.addEventListener('click', (e) => {
    const a = e.target.closest('.md-ans');
    if (a && !a.disabled) { answer(+a.dataset.n); return; }
    const x = e.target.closest('[data-x]'); if (!x) return;
    play(o, 'ui');
    if (x.dataset.x === 'next') { if (i < R.length - 1) { i++; ask(); } else result(); }
    else if (x.dataset.x === 'again') { end(false); setTimeout(() => openPlaceQuiz(o), 260); }
    else if (x.dataset.x === 'book') end(true);
    else if (x.dataset.x === 'close') end(true);
  });
  // the quiz steps aside when the player goes elsewhere (the menu, another card): the camera's nets are never held for nothing
  poll = setInterval(() => { if (document.querySelector('.gm-sheet.on') || document.querySelector('.gm-modal.on:not(.md-qz)') || (entered && o.whole && !o.whole())) end(false); }, 500);
  ask();
  return w;
}

/* ───────── איפה זה בעולם: the flight, the card, the way back ───────── */
let chip = null;
function dropChip() {
  if (!chip) return;
  const c = chip; chip = null; clearInterval(c.poll); c.el.classList.remove('on'); setTimeout(() => c.el.remove(), 260);
  document.body.classList.remove('md-place-on');
  if (c.release) c.release();
}

/** the camera pose of a place for view.lookAt: [x, y, z, dist, az°, el°] (0° az = from the east, like main.js view.lookAt) */
export const WIDE = 4.2;   // (a phone in portrait sees ~15° across: w × 4.2 × 1.35 puts a place of width w across ~2/3 of it)
export function poseOf(key) {
  const P = PLACE[key]; if (!P) return null;
  const [p, t] = P.pt, dx = p[0] - t[0], dy = p[1] - t[1], dz = p[2] - t[2], d = Math.hypot(dx, dy, dz);
  return [t[0], t[1], t[2], Math.max(d, (P.w || 0) * WIDE), (Math.atan2(dz, dx) * 180) / Math.PI, (Math.asin(dy / d) * 180) / Math.PI];
}

/**
 * o = { from (the mishna to return to), view, W, G: () => G, S, whole: () => bool, enterWhole, exitWhole, hooks, ui (the HUD),
 *       hold: (seconds) → a release function (the game's camera nets wait) }
 * → true when the camera flies
 */
export function placeFlight(key, o = {}) {
  const P = PLACE[key], pose = poseOf(key);
  if (!P || !pose || !o.view || typeof o.view.lookAt !== 'function') return false;
  const G = o.G ? o.G() : null;
  let built = true, building = false;
  try { built = !P.stage || !o.S || !G || o.S.isDone(G, P.stage); } catch (e) { built = true; }
  try { building = !built && typeof o.S.statusOf === 'function' && o.S.statusOf(G, P.stage) === 'building'; } catch (e) { building = false; }
  const inWhole = !!(o.whole && o.whole());
  let entered = false;
  // (PRODUCER10 N29) a place the player is building right now is shown as it stands, never swapped for the finished House
  if (!built && !building && !inWhole && G && G.ftue >= 99 && typeof o.enterWhole === 'function') { try { o.enterWhole(); entered = true; } catch (e) { entered = false; } }
  try { if (o.ui && o.ui.closeSheet) o.ui.closeSheet(); } catch (e) { /* no sheet */ }
  dropChip();
  // on a phone in portrait the place's card covers the lower part of the screen: the camera is panned down (the target and the
  // camera together, the view unchanged) so the place sits in the upper part, over the card (NDC y ≈ +0.3; fov 32°)
  let [tx, ty, tz] = pose;
  const portrait = typeof innerHeight === 'number' && innerHeight > innerWidth;
  if (portrait) {
    const a = (pose[4] * Math.PI) / 180, e = (pose[5] * Math.PI) / 180, sft = 0.3 * Math.tan((16 * Math.PI) / 180) * pose[3] * 1.35;
    tx += Math.sin(e) * Math.cos(a) * sft; ty -= Math.cos(e) * sft; tz += Math.sin(e) * Math.sin(a) * sft;
  }
  o.view.lookAt(tx, ty, tz, pose[3], pose[4], pose[5], 1900);
  const show = (o.hooks && typeof o.hooks.showInfo === 'function' && o.hooks.showInfo) || (globalThis.__T && typeof globalThis.__T.showInfo === 'function' && globalThis.__T.showInfo) || null;
  if (P.info && show) { try { show(P.info); } catch (e) { /* no card */ } }
  const release = typeof o.hold === 'function' ? o.hold(45) : null;
  // the chip: the place's name, a line when it has no card or is not built yet, and the way back to the book
  const root = (o.ui && o.ui.root) || document.querySelector('.gm') || document.body;
  if (!document.getElementById('md10-css')) css(document);
  const el = document.createElement('div');
  el.className = 'md-back'; el.setAttribute('role', 'status');
  const note = building && !inWhole ? 'כאן אתה בונה עכשיו' : !built && (entered || inWhole) ? 'עוד לא נבנה: כך ייראה בבית השלם' : !built ? 'עוד לא נבנה: כאן ייבנה' : !P.info ? P.hint || '' : '';
  el.innerHTML = `<span class="md-ic" aria-hidden="true">${pin(o)}</span><span class="md-where">${esc(P.he)}${note ? `<small>${esc(note)}</small>` : ''}</span><button type="button" data-md="back">חזרה לספר</button>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  document.body.classList.add('md-place-on');   // (PRODUCER10 N26, N28) one way back, and nothing under the card
  const t0 = Date.now();
  chip = { el, release, entered, poll: 0 };
  chip.poll = setInterval(() => {
    // the chip goes when the player moves on: another sheet or card of the game, the whole view left by its own button, 40 s
    const sheet = document.querySelector('.gm-sheet.on'), modal = document.querySelector('.gm-modal:not(.md-qz)');
    if (sheet || modal || (entered && o.whole && !o.whole()) || Date.now() - t0 > 40000) dropChip();
  }, 400);
  el.addEventListener('click', (e) => {
    if (!e.target.closest('[data-md="back"]')) return;
    e.stopPropagation();
    const was = chip && chip.entered;
    dropChip();
    try { if (was && o.whole && o.whole() && o.exitWhole) o.exitWhole(); } catch (err) { /* the view */ }
    const card = document.getElementById('card'), cx = document.getElementById('cx');
    if (card && card.classList.contains('on') && cx) cx.click();
    try { if (o.ui && o.ui.openSheet) o.ui.openSheet('book', o.from && MIDX[o.from] !== undefined ? o.from : undefined); } catch (err) { /* the HUD */ }
  });
  return true;
}
