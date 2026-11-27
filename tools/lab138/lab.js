/* build 138 — the lab: the two works of stage 15 on a plain page (the gray prototypes), the same views as the game (src/game/h138). */
import { makeScreen } from '../../src/game/h138/screen.js';
const cv = document.getElementById('c');
const el = (cls, html) => { const d = document.createElement('div'); d.className = 'lab-ui ' + cls; d.innerHTML = html; document.body.appendChild(d); return d; };
const scoreEl = el('score', '0'); let total = 0;
const SC = makeScreen(cv, { add(n) { total = Math.max(0, total + n); scoreEl.textContent = total; } });
export function lab(kind, make) {
  const ids = [1, 2, 3].map((n) => kind + n);
  let view = null, id = null;
  const bar = el('lv', ids.map((k) => `<button data-id="${k}">${k}</button>`).join(''));
  function go(k) {
    id = k; total = 0; scoreEl.textContent = '0'; SC.clear(); document.querySelectorAll('.lab-ui.card').forEach((d) => d.remove());
    bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.id === k));
    const lv = +k.slice(-1);
    view = make(SC, lv, { onEnd(r, words) {
      const n = [0, 50, 100, 200][r.stars | 0]; if (n) SC.bonus(320, 120, n, '★'.repeat(r.stars));
      const s = r.stars | 0, d = el('card', `<h3>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</h3><div>${words}</div><div>${Math.round((r.q || 0) * 100)}% · ${total} נקודות${r.dmg ? ' · נזק ' + r.dmg : ''}</div><p><button data-a="again">שוב</button><button data-a="next">רמה הבאה</button></p>`);
      d.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; d.remove(); go(b.dataset.a === 'next' ? kind + Math.min(3, lv + 1) : id); });
      window.__LAB_END = r;
    } });
  }
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { location.hash = b.dataset.id; go(b.dataset.id); } });
  const h = (location.hash || '').replace('#', ''); go(ids.includes(h) ? h : ids[0]);
  let last = performance.now();
  const loop = (ms) => { const dt = (ms - last) / 1000; last = ms; if (view) view.frame(dt); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
