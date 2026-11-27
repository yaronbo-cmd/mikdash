/* build 138 — the lab's shell: stage 15's gray prototypes on a plain 2D page (the spec's "שני אבות־טיפוס אפורים", ChatGPT's gate: the
 * mechanic proved fun under the fingers before the full code). The models are the game's own (src/game/h138/*-model.js); the shell
 * gives: the 640 × 360 dp frame (landscape, centred), the fingers (the first on a work object = the work hand; another = the helper;
 * the mouse: left = work, right held = helper), the points (40 / 20 / 10 × the level), the pops, the end card, the level buttons. */
export const cv = document.getElementById('c');
export const g = cv.getContext('2d');
export const V = { w: 640, h: 360, s: 1, ox: 0, oy: 0, dpr: 1 };
function fit() {
  V.dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = innerWidth * V.dpr; cv.height = innerHeight * V.dpr;
  V.s = Math.min(innerWidth / 640, innerHeight / 360); V.ox = (innerWidth - 640 * V.s) / 2; V.oy = (innerHeight - 360 * V.s) / 2;
}
fit(); addEventListener('resize', fit);
/** draw in dp: call once per frame before drawing */
export function frameDp() { g.setTransform(V.dpr * V.s, 0, 0, V.dpr * V.s, V.dpr * V.ox, V.dpr * V.oy); }
export const toDp = (x, y) => ({ x: (x - V.ox) / V.s, y: (y - V.oy) / V.s });
const el = (cls, html, css) => { const d = document.createElement('div'); d.className = 'lab-ui ' + cls; d.innerHTML = html; if (css) d.style.cssText = css; document.body.appendChild(d); return d; };
const scoreEl = el('score', '0');
export let total = 0;
export function addPts(n) { total = Math.max(0, total + n); scoreEl.textContent = total; }
export function resetPts() { total = 0; addPts(0); }
export function pop(x, y, text, color, big) {
  const d = el('pop', text, `left:${V.ox + x * V.s}px;top:${V.oy + y * V.s}px;color:${color};font-size:${big ? 28 : 20}px`);
  setTimeout(() => d.classList.add('up'), 20); setTimeout(() => d.remove(), 1500);
}
let run = 0;
export function hit(x, y, grade, mul) {
  const base = grade === 'gold' ? 40 : grade === 'good' ? 20 : 10; run = grade === 'gold' ? run + 1 : 0;
  addPts(base * mul); pop(x, y, '+' + base * mul, grade === 'gold' ? '#FFD24A' : grade === 'good' ? '#FFFFFF' : '#DDD');
  if (run >= 3) { addPts(50); pop(x, y - 30, 'רצף +50', '#FFE9A0', true); run = 0; }
}
export function loss(x, y, n, label) { addPts(-n); run = 0; pop(x, y, `−${n} ${label}`, '#FF7A6A', true); }
export function bonus(x, y, n, label) { addPts(n); pop(x, y, `${label} +${n}`, '#9EF08A'); }
export function resetRun() { run = 0; }
// quiet sounds (WebAudio; the work reads without them): a wooden tick, a soft cloth thud
const actx = (() => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } })();
addEventListener('pointerdown', () => { try { if (actx && actx.state !== 'running') actx.resume(); } catch (e) { /* */ } }, true);
export function snd(kind) {
  if (!actx || actx.state !== 'running') return;
  try {
    const t = actx.currentTime, o = actx.createOscillator(), gn = actx.createGain(), f = actx.createBiquadFilter();
    const P = { tick: [900, 0.05, 0.08, 'triangle'], crease: [140, 0.25, 0.22, 'sawtooth'], snap: [520, 0.35, 0.06, 'sine'], cloth: [90, 0.35, 0.18, 'sine'], catch: [220, 0.4, 0.07, 'sine'], tear: [180, 0.3, 0.2, 'sawtooth'] }[kind] || [440, 0.1, 0.05, 'sine'];
    o.type = P[3]; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[0] * 0.6, t + P[1]);
    f.type = 'lowpass'; f.frequency.value = 1800;
    gn.gain.setValueAtTime(P[2], t); gn.gain.exponentialRampToValueAtTime(0.0001, t + P[1]);
    o.connect(f); f.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + P[1] + 0.02);
  } catch (e) { /* */ }
}
export function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* */ } }
/** the end card: stars, the score, again / next level */
export function card(res, onAgain, onNext, words) {
  const s = res.stars | 0;
  const d = el('card', `<h3>${'★'.repeat(s)}${'☆'.repeat(3 - s)}</h3><div>${words || ''}</div><div>${Math.round((res.q || 0) * 100)}% · ${total} נקודות${res.dmg ? ' · נזק ' + res.dmg : ''}</div><p><button data-a="again">שוב</button><button data-a="next">רמה הבאה</button></p>`);
  d.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; d.remove(); (b.dataset.a === 'next' ? onNext : onAgain)(); });
  window.__LAB_END = res;
  return d;
}
/** the level buttons */
export function levels(list, go) {
  const bar = el('lv', list.map((id) => `<button data-id="${id}">${id}</button>`).join(''));
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { location.hash = b.dataset.id; go(b.dataset.id); } });
  const mark = (id) => bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
  return mark;
}
/** the fingers: each pointer, in dp, with its role chosen by the page's `claim(p)` on down ('work' | 'helper' | other | null) */
export const F = new Map();
export function fingers(claim) {
  cv.style.touchAction = 'none';
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('pointerdown', (e) => {
    const p = toDp(e.clientX, e.clientY); const f = { id: e.pointerId, x: p.x, y: p.y, x0: p.x, y0: p.y, t0: performance.now(), button: e.button, dx: 0, dy: 0, role: null };
    f.role = claim(f); if (!f.role) return; F.set(e.pointerId, f); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  });
  cv.addEventListener('pointermove', (e) => { const f = F.get(e.pointerId); if (!f) return; const p = toDp(e.clientX, e.clientY); f.dx += p.x - f.x; f.dy += p.y - f.y; f.x = p.x; f.y = p.y; });
  const up = (e) => { const f = F.get(e.pointerId); if (f) { f.up = true; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
}
/** the finger in a role (and its motion since the last frame), then forget the lifted ones */
export function take(role) { for (const f of F.values()) if (f.role === role) { const o = { ...f }; f.dx = 0; f.dy = 0; return o; } return null; }
export function sweep() { for (const [k, f] of F) if (f.up) F.delete(k); }
export function hand(on, x, y, t) { if (!on) return; g.save(); g.font = '30px system-ui'; g.textAlign = 'center'; g.fillText('👆', x, y + 6 * Math.sin(t * 5)); g.restore(); }
