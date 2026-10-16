/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/endchain.js — HOOK20 (item 2): the end chain after every course and every stage, 10–15 s, each card closing itself (2.6 s) or at a
 * tap anywhere / the one gold "המשך":  the stamp "הנדבך הושלם!" → the crew's line → the points flying into the dinar (the bar fills; at a
 * dinar the game's own card follows) → "מחר: …" (a known tease, never a prize) → back to the world. No sad branch: a course with no gold
 * acts gets the same chain without the gold line. The bed drops 6 dB under it (music.duck) and music.cue('courseDone') stings on the beat.
 *   const C = createEndChain({ root, ui, sfx, G, now, score, act, quiet, tomorrow, music });
 *   C.request({ kind: 'course' | 'stage', name, stones, noStamp })   → queued until quiet() twice in a row (≤ 25 s), then run; one pending at most
 *   C.running · C.pending · C.last = { kind, ms, cards }
 * Texts are drafts (טיוטה). Nothing is paid, lost or pressed: leaving does nothing.
 * ──────────────────────────────────────────────────────────────────────────── */
import { esc } from './around-ui.js';
import { fmt } from '../score.js';

export const CARD_MS = 2600;
// ── board21 ── the "+★" counts up (0.9 s, eased) and the coin spins when it lands; reduced motion: the true number at once
function countUp(c, pts) {
  const el = c.querySelector('.ec-pts'), coin = c.querySelector('.ar-coin');
  if (!el) return;
  let red = false; try { red = !!(globalThis.matchMedia && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* none */ }
  const done = () => { el.textContent = '+★ ' + fmt(pts); if (coin && !red) coin.classList.add('spin'); };
  if (red || pts <= 0) { done(); return; }
  const t0 = performance.now(), MS = 900; el.textContent = '+★ 0';
  const step = () => { const k = Math.min(1, (performance.now() - t0) / MS); el.textContent = '+★ ' + fmt(Math.round(pts * (1 - Math.pow(1 - k, 3)))); if (k < 1) (globalThis.requestAnimationFrame || ((f) => setTimeout(f, 16)))(step); };
  step(); setTimeout(done, MS + 40);
}
// ── /board21 ──
export function createEndChain(o) {
  const st = { running: false, pending: null, tm: 0, ok: 0, last: null, mark: null, gold0: 0 };
  const doc = () => o.root.ownerDocument || document;
  const G = () => o.G();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let layer = null;

  function card(html, { ms = CARD_MS, gold = true, rays = false, after } = {}) {
    return new Promise((res) => {
      if (!layer) return res();
      const c = doc().createElement('div'); c.className = 'ec-card'; c.setAttribute('role', 'status');
      c.innerHTML = html + `<button class="ar-btn gold" data-ec="go">המשך</button>`;
      layer.textContent = ''; layer.appendChild(c);
      if (rays && o.ui && typeof o.ui.rays === 'function') o.ui.rays(c);
      let done = false;
      const t0 = performance.now();
      const end = () => { if (done) return; done = true; clearInterval(t); globalThis.removeEventListener('pointerdown', end, true); res(); };
      const t = setInterval(() => { if (performance.now() - t0 >= ms && !globalThis.__EC_HOLD) end(); }, 120);   // (__EC_HOLD: a test holds a card to look at it)
      // a tap anywhere closes it — and still reaches the game: the layer never takes the thumbs (the supervisor: twin-touch's stick
      // stood still for three seconds behind the chain). The card itself takes pointers (its button).
      globalThis.addEventListener('pointerdown', end, true);
      if (typeof after === 'function') { try { after(c); } catch (e) { /* the card's */ } }
    });
  }

  async function run(info) {
    st.running = true; const t0 = performance.now(), M = o.music && o.music();
    const g0 = o.score(); let cards = 0;
    try {
      layer = doc().createElement('div'); layer.className = 'ec'; layer.setAttribute('data-ec', 'layer');
      o.root.appendChild(layer); void layer.offsetWidth; layer.classList.add('on');
      try { if (M && typeof M.cue === 'function') M.cue('courseDone'); if (M && typeof M.duck === 'function') M.duck(true, 0.5); } catch (e) { /* the music's */ }
      if (!info.noStamp && o.ui && o.ui.stamp) { layer.style.background = 'transparent'; await o.ui.stamp(info.kind === 'stage' ? 'השלב הושלם!' : 'הנדבך הושלם!', { ms: 1200, cue: '' }); layer.style.background = ''; cards++; }
      const crew = (G().crews || []).length, mish = o.mishmar ? o.mishmar() : '';
      await card(`<h2>${info.kind === 'stage' ? 'הבית עומד' : 'עשיתם את זה יחד'}</h2><p>${crew > 0 ? `${fmt(crew)} אומנים בנו איתך${mish ? `, משמר ${esc(mish)}` : ''}` : 'בנית את הנדבך בעצמך'}</p><p class="ec-big">${fmt(info.stones || 0)} אבנים</p>`, { rays: info.kind === 'stage' }); cards++;
      // the points into the coin: the score since the last chain, the bar from where it stood to where it stands
      const g1 = o.score(), pts = Math.max(0, info.pts || 0), goldN = Math.max(0, info.golds || 0);
      const f0 = Math.max(0, Math.min(1, ((g1.total - pts) - g1.base) / 10000)), crossed = (g1.unseen || 0) > 0;
      await card(`<h2>הנקודות נכנסות לדינר</h2><p class="ec-big"><span class="ec-pts" data-to="${pts}">+★ ${fmt(pts)}</span> <i class="ar-coin big" aria-hidden="true"></i></p>${goldN > 0 ? `<p>זהב ×${fmt(goldN)}</p>` : ''}<div class="ec-bar" role="img" aria-label="${Math.round(g1.frac * 100)} אחוז לדינר הבא"><i style="width:${(f0 * 100).toFixed(1)}%"></i></div><p>${crossed ? 'דינר זהב חדש!' : `עוד ★ ${fmt(g1.left)} לדינר הבא`}</p>`, { after: (c) => { const b = c.querySelector('.ec-bar i'); setTimeout(() => { if (b) b.style.width = (crossed ? 100 : g1.frac * 100).toFixed(1) + '%'; }, 80); countUp(c, pts); } }); cards++;
      if (crossed && o.act && typeof o.act.dinarNow === 'function') { layer.classList.remove('on'); layer.style.display = 'none'; try { await o.act.dinarNow(); } catch (e) { /* the coin's */ } layer.style.display = ''; layer.classList.add('on'); }
      await card(`<h2>מחר</h2><p>${esc(o.tomorrow ? o.tomorrow() : 'יום חדש במקדש')}</p>${(o.tomorrowTitle && o.tomorrowTitle()) ? `<div class="ec-lock" aria-label="חידה נעולה למחר"><span class="sil" aria-hidden="true"></span><span><b>חידת מחר: ${esc(o.tomorrowTitle())}</b><small>נפתחת מחר. עד אז היא רק צל.</small></span></div>` : ''}<p class="ar-note">מה שנפתח, ימשיך להיות שלכם.</p>`); cards++;
    } finally {
      try { if (M && typeof M.duck === 'function') M.duck(false); } catch (e) { /* the music's */ }
      if (layer) { const l = layer; layer = null; l.classList.remove('on'); setTimeout(() => l.remove(), 200); }
      st.running = false; st.last = { kind: info.kind, ms: Math.round(performance.now() - t0), cards };
      try { o.emit && o.emit('endChain', { ...st.last }); } catch (e) { /* the host's */ }
      void g0;
    }
  }
  function poll() {
    clearTimeout(st.tm); st.tm = 0;
    if (!st.pending) return;
    if (st.running) { st.tm = setTimeout(poll, 500); return; }
    if (performance.now() - st.pending.at > 25000) { st.pending = null; st.ok = 0; return; }
    if (o.quiet(st.pending)) st.ok++; else st.ok = 0;
    if (st.ok >= 2) { const info = st.pending; st.pending = null; st.ok = 0; run(info); return; }
    st.tm = setTimeout(poll, 450);
  }
  return {
    request(info) {
      const tot = o.score().total || 0, gd = o.golds ? o.golds() : 0;
      if (st.mark == null) st.mark = tot;
      const prev = st.pending;   // (a course still waiting: its points join this one's)
      const pts = Math.max(0, tot - st.mark) + (prev ? prev.pts : 0), golds = Math.max(0, gd - st.gold0) + (prev ? prev.golds : 0);
      st.mark = tot; st.gold0 = gd;
      st.pending = { ...info, pts, golds, at: performance.now() }; st.ok = 0; clearTimeout(st.tm); st.tm = setTimeout(poll, 300);
    },
    /** the points counted from now (a new game / a loaded save) */
    reset() { st.mark = o.score().total || 0; st.gold0 = o.golds ? o.golds() : 0; st.pending = null; },
    get running() { return st.running; }, get pending() { return !!st.pending; }, get last() { return st.last; },
    runNow: (info) => run({ kind: 'course', ...info }),
  };
}
