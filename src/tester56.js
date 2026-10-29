/* ── build 56ב ── tester56.js — the tester's stage menu: five quick taps in the screen's top-right corner open a list of every stage
 * built so far; a choice starts that stage from its beginning (with stones enough to play it through) — for the owner to play each one
 * on his phone through the artifact's link, where a URL's fixtures cannot be passed (the owner, 29.10 18:07–18:12). Choosing a stage
 * clears this phone's game save (the settings stay) — said on the menu, and a second tap confirms. The stage is kept for one start
 * (bh_fix / bh_fixh, applied by fix56.js) and the page reloads. Phase B: a save with every role already served (day 3), so the roles
 * book's "לתרגל" opens each of the eight; the lobby opens. Every text a draft; never a Divine Name. */
import { clearSave56, seedB56 } from './fix56.js';   // (the clearing and the seed run at the NEXT start: the game saves itself as the page unloads)
const STAGES56 = [
  { id: '01', he: '01 · שיטוח ההר', q: 'h42stock=99' },
  { id: '02', he: '02 · חומת העזרה', q: 'h45go=1&h42stock=99' },
  { id: '03', he: '03 · הסורג והחיל', q: 'h46go=1&h42stock=99' },
  { id: '04', he: '04 · שערי העזרה', q: 'h47go=1&h42stock=99' },
  { id: '05', he: '05 · עזרת הנשים', q: 'h48go=1&h42stock=99' },
  { id: '06', he: '06 · שער ניקנור', q: 'h49go=1&h42stock=99' },
  { id: '06v', he: '06 · מסע הדלתות של ניקנור', q: 'h49go=1&h49voy=1&h42stock=99' },
  { id: '07', he: '07 · הלשכות', q: 'h50go=1&h42stock=99' },
  { id: 't3', he: 'מבחן אומן — לפני פרק המזבח', q: 'h50test=1&h42stock=99' },
  { id: '08', he: '08 · היסוד', q: 'h55go=1&h42stock=99' },
  { id: '09', he: '09 · הסובב וחוט הסיקרא', q: 'h56go=1&h42stock=99' },
  { id: '10', he: '10 · גוף המזבח והכבש', q: 'h57go=1&h42stock=99' },   // ── build 57 ──
  { id: '11', he: '11 · הקרנות', q: 'h58go=1&h42stock=99' },   // ── build 58 ──
  { id: 'B', he: 'שלב ב׳ — המשמרת, וכל העבודות לתרגול', q: 'tester=1', h: 'shift=card', b: true },
];
const CSS56 = `.t56{position:fixed;inset:0;z-index:99999;background:rgba(18,12,6,.94);direction:rtl;color:#FFF3D6;font:600 15px/1.3 Heebo,system-ui,sans-serif;overflow:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 18px}
.t56 h3{margin:2px 0 4px;font-size:18px;color:#FFD66E}.t56 p{margin:0 0 10px;font-size:12.5px;font-weight:500;opacity:.85}
.t56 .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.t56 button{min-height:46px;border-radius:12px;border:1.5px solid #C8923A;background:#3A2A14;color:#FFF3D6;font:700 14.5px/1.2 Heebo,system-ui,sans-serif;text-align:right;padding:8px 12px;touch-action:manipulation}
.t56 button.b{background:#23324A;border-color:#7FA6D8}.t56 button.ok{background:#C8923A;color:#1B1208}
.t56 .x{position:sticky;top:0;float:left;min-height:44px;min-width:88px;text-align:center;background:#5A2A1A;border-color:#E08A6A}`;
let open56 = null;
function openMenu56(doc) {
  if (open56) return;
  const st = doc.createElement('style'); st.textContent = CSS56; doc.head.appendChild(st);
  const el = doc.createElement('div'); el.className = 't56'; el.setAttribute('role', 'dialog');
  el.innerHTML = `<button class="x" data-x="1">סגירה ✕</button><h3>בודק — פתיחת שלב</h3>
    <p>בוחרים שלב — והוא נפתח מתחילתו, עם אבנים לכל העבודות. <b>ההתקדמות בטלפון הזה מתאפסת</b> (ההגדרות נשמרות). לחיצה שנייה מאשרת.</p>
    <div class="g">${STAGES56.map((s) => `<button data-id="${s.id}" class="${s.b ? 'b' : ''}">${s.he}</button>`).join('')}</div>
    <p style="margin-top:12px">טיוטה — להמחשה. כל שלב נפתח פעם אחת; לשלב אחר — פותחים שוב את התפריט (חמש הקשות בפינה הימנית העליונה).</p>`;
  let armed = null;
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    ev.stopPropagation();
    if (b.dataset.x) { close(); return; }
    const s = STAGES56.find((q) => q.id === b.dataset.id); if (!s) return;
    if (armed !== b) { if (armed) { armed.classList.remove('ok'); armed.textContent = STAGES56.find((q) => q.id === armed.dataset.id).he; } armed = b; b.classList.add('ok'); b.textContent = 'לחצו שוב — ' + s.he; return; }
    try {
      const ls = globalThis.localStorage;
      ls.setItem('bh_fixclear', s.b ? 'B' : '1');
      ls.setItem('bh_fix', s.q); if (s.h) ls.setItem('bh_fixh', s.h); else ls.removeItem('bh_fixh');
    } catch (e) { b.textContent = 'לא נשמר — הדפדפן חוסם אחסון'; return; }
    b.textContent = 'נפתח…';
    try { globalThis.location.reload(); } catch (e) { b.textContent = 'סגרו ופתחו את הקישור מחדש'; }   // (the artifact's frame may refuse a reload: the choice waits for the next opening)
  });
  function close() { try { el.remove(); st.remove(); } catch (e) { /* */ } open56 = null; }
  doc.body.appendChild(el); open56 = el;
}
/** five quick taps (within 2.5 s) in the screen's top-right corner — 64 px — open the menu; the taps are not swallowed */
export function installTester56(doc = globalThis.document) {
  if (!doc || !doc.addEventListener) return;
  let taps = [];
  doc.addEventListener('pointerdown', (ev) => {
    try {
      const W = globalThis.innerWidth || 0;
      if (ev.clientX < W - 64 || ev.clientY > 64) { taps = []; return; }
      const t = performance.now(); taps = taps.filter((x) => t - x < 2500); taps.push(t);
      if (taps.length >= 5) { taps = []; openMenu56(doc); }
    } catch (e) { /* */ }
  }, true);
  globalThis.__T56 = { open: () => openMenu56(doc), stages: STAGES56 };
}
export { STAGES56 };
