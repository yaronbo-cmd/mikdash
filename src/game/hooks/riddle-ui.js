/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/riddle-ui.js — HOOK20: the sheet of "חידת היום" (rules: hooks/riddle.js). Tap-only: tap a name, then tap its place; tap the stairs
 * to count; tap the answers in their order. A wrong try is a small shake and nothing else. No timer is shown: a hint arrives at 30 s and a
 * second at 60 s of the step (the clock is the page's, kept per step, not reset by closing the sheet). A reset puts the step back.
 *   mount(el, env)   env: { G, day, done, act, sfx, onChange() }   the sheet body is built once per state; the sheet's refresh does not touch it
 * ──────────────────────────────────────────────────────────────────────────── */
import * as RD from './riddle.js';
import { esc } from './around-ui.js';

const T0 = { key: '', t: 0 };       // the step's clock: kept by (day, riddle, step)
let TIMER = 0;
export function stop() { clearInterval(TIMER); TIMER = 0; }
const stepKey = (R) => `${R.day}|${R.id}|${R.step}`;

export function sig(G, day, done) { const c = RD.current(G, day, done); return c ? `${c.R.id}:${c.R.step}:${c.R.solved ? 1 : 0}` : 'none'; }
export const shell = (G, day, done) => `<div class="rd" data-sig="${esc(sig(G, day, done))}"></div>`;

export function mount(el, env) {
  stop();
  const { G, day, done } = env, c = RD.current(G, day, done);
  if (!c) { el.innerHTML = '<p class="ar-note">עוד אין חידה להיום. היא תבוא עם הנדבך הראשון.</p>'; return; }
  const { R, def } = c, play = (n, o) => { try { env.sfx && env.sfx.play(n, o); } catch (e) { /* the kit's */ } };
  const say = (t) => { const s = el.querySelector('.rd-say'); if (s) s.textContent = t || ''; };
  if (R.solved) { win(); return; }
  const step = def.steps[R.step];
  const k = stepKey(R); if (T0.key !== k) { T0.key = k; T0.t = performance.now(); }
  let sel = null, placed = {}, cnt = 0, seq = [], hintShown = 0;
  const dots = def.steps.map((_, i) => `<i class="${i < R.step ? 'on' : i === R.step ? 'cur' : ''}"></i>`).join('');
  const head = `<h3>${esc(def.title)}</h3><div class="rd-dots" role="img" aria-label="שלב ${R.step + 1} מתוך ${def.steps.length}">${dots}</div><div class="rd-q">${esc(step.q)}</div>`;
  const foot = `<div class="rd-hint" hidden></div><div class="rd-say" aria-live="polite"></div><div class="rd-foot"><button class="ar-btn" data-rd="reset">מההתחלה</button><span class="ar-note" style="margin:0">אין טיימר ואין עונש. מחר חידה חדשה.</span></div>`;

  const pass = () => {
    play('good');
    const r = RD.advance(G, day);
    try { env.onChange && env.onChange(); } catch (e) { /* the host's */ }
    if (r.solved) { env.act.riddleSolved && env.act.riddleSolved(def.id, day); play('levelUp'); }
    mount(el, env);
  };
  const body = () => {
    if (step.t === 'place') {
      const free = step.items.filter((it) => !placed[it.id]);
      el.innerHTML = head + `<div class="rd-slots">${step.slots.map((s) => `<button class="rd-slot ${sel ? 'hot' : ''}" data-rd="slot" data-id="${s.id}"><b>${esc(s.he)}</b>${step.items.filter((it) => placed[it.id] === s.id).map((it) => `<span class="rd-chip in">${esc(it.he)}</span>`).join('')}</button>`).join('')}</div><div class="rd-chips">${free.map((it) => `<button class="rd-chip ${sel === it.id ? 'sel' : ''}" data-rd="item" data-id="${it.id}">${esc(it.he)}</button>`).join('')}</div>` + foot;
    } else if (step.t === 'choose') {
      el.innerHTML = head + `<div class="rd-chips" style="flex-direction:column">${step.a.map((a, i) => `<button class="rd-chip ${placed[i] ? 'off' : ''}" data-rd="opt" data-i="${i}">${esc(a)}</button>`).join('')}</div>` + foot;
    } else if (step.t === 'count') {
      const n = step.n, W = 300, H = 150, dx = (W - 20) / n, dy = (H - 24) / n;
      let svg = '';
      for (let i = 0; i < n; i++) { const x = 10 + i * dx, y = H - 12 - (i + 1) * dy, on = i < cnt; svg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(dx - 1.5).toFixed(1)}" height="${((i + 1) * dy).toFixed(1)}" rx="2" fill="${on ? '#E8B94A' : '#B7A07A'}" opacity="${on ? 1 : .55}"/>`; }
      el.innerHTML = head + `<svg class="rd-stairs" data-rd="stair" viewBox="0 0 ${W} ${H}" role="button" aria-label="הקישו כדי לספור מעלה"><title>מעלות</title>${svg}</svg><div class="rd-cnt" aria-live="polite">${cnt}</div><div class="rd-foot"><button class="ar-btn gold" data-rd="num">זה המספר</button></div>` + foot;
    } else if (step.t === 'order') {
      const sh = RD.shown(step);
      el.innerHTML = head + `<div class="rd-chips" style="flex-direction:column">${sh.map((i) => `<button class="rd-chip ${seq.includes(i) ? 'ord' : ''}" data-rd="ord" data-i="${i}">${seq.includes(i) ? (seq.indexOf(i) + 1) + '. ' : ''}${esc(step.items[i])}</button>`).join('')}</div>` + foot;
    }
    hints(true);
  };
  const hints = (redraw) => {
    const lv = RD.hintAt(performance.now() - T0.t), box = el.querySelector('.rd-hint');
    if (!box || !lv) return;
    if (lv === hintShown && !redraw) return;
    hintShown = lv; box.hidden = false; box.textContent = 'רמז: ' + (lv >= 2 ? step.h2 : step.h1);
    if (!redraw) play('soft');
  };
  const shake = (btn) => { if (!btn) return; btn.classList.remove('no'); void btn.offsetWidth; btn.classList.add('no'); play('soft'); };
  el.onclick = (e) => {
    const b = e.target.closest('[data-rd]'); if (!b || !el.contains(b)) return;
    const a = b.dataset.rd;
    if (a === 'reset') { sel = null; placed = {}; cnt = 0; seq = []; body(); say('אפשר שוב, מההתחלה.'); return; }
    if (a === 'item') { sel = sel === b.dataset.id ? null : b.dataset.id; play('ui'); body(); return; }
    if (a === 'slot') {
      if (!sel) { say('בחרו קודם שם, ואז את מקומו.'); return; }
      const ok = RD.check(step, { item: sel, slot: b.dataset.id });
      if (ok) { placed[sel] = b.dataset.id; sel = null; play('pop'); if (step.items.every((it) => placed[it.id])) { pass(); return; } body(); say('מקום נכון.'); }
      else { const id = sel; sel = null; body(); shake(el.querySelector(`[data-rd="slot"][data-id="${b.dataset.id}"]`)); say('לא כאן. נסו מקום אחר, אין עונש.'); void id; }
      return;
    }
    if (a === 'opt') { const i = +b.dataset.i; if (RD.check(step, i)) { pass(); return; } placed[i] = 1; body(); shake(el.querySelector(`[data-rd="opt"][data-i="${i}"]`)); say('עוד לא. נסו תשובה אחרת.'); return; }
    if (a === 'stair') { cnt = Math.min(cnt + 1, 40); play('ui'); body(); return; }
    if (a === 'num') { if (RD.check(step, cnt)) { pass(); return; } cnt = 0; body(); say(`ספרתי ${'עד כאן'}; נסו לספור שוב, אחת אחת.`); return; }
    if (a === 'ord') {
      const i = +b.dataset.i; if (seq.includes(i)) return;
      if (i === seq.length) { seq.push(i); play('pop'); if (seq.length === step.items.length) { if (RD.check(step, seq)) { pass(); return; } } body(); say('נכון, הלאה.'); }
      else { seq = []; body(); shake(el.querySelector(`[data-rd="ord"][data-i="${i}"]`)); say('לא בדיוק. מתחילים את הסדר מהתחלה, אין עונש.'); }
    }
  };
  function win() {
    const tm = RD.tomorrow(day, done);
    el.innerHTML = `<div class="rd-win"><div class="big">פתרתם!</div><p>דינר אחד נוסף לתיבה, והעובדה נשמרה בספר מידות.</p><div class="rd-fact">${esc(def.fact)}<small>${esc(def.ref)} · טיוטה</small></div></div>
      <div class="ar-act" style="justify-content:center"><button class="ar-btn gold" data-a="aroundGo" data-to="book">לספר</button><button class="ar-btn" data-a="aroundGo" data-to="daily">להיום</button></div>
      <div class="rd-lock"><span aria-hidden="true">🔒</span><span><b>מחר: ${esc(tm || 'חידה חדשה')}</b><br><small>החידה הבאה נפתחת מחר</small></span></div>`;
  }
  body();
  TIMER = setInterval(() => { if (!el.isConnected) { stop(); return; } hints(false); }, 1000);
}
