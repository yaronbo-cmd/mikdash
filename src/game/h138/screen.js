/* ── build 138 ── h138/screen.js — the 2D screen the two works of stage 15 draw on (the view from inside the teivah fills the whole
 * screen; the amah's section): a canvas over the game in the 640 × 360 dp frame (landscape, centred), its fingers (the first on a work
 * object = the work hand; another = the helper; the mouse: left = work, right held = helper), the points through a sink (the game's
 * X.hit / X.loss, or the lab's counter), the pops, quiet sounds. The same code in the lab's prototypes and in the game. */
export function makeScreen(cv, sink = {}) {
  const g = cv.getContext('2d');
  const V = { s: 1, ox: 0, oy: 0, dpr: 1 };
  const W = () => cv.clientWidth || innerWidth, H = () => cv.clientHeight || innerHeight;
  function fit() { V.dpr = Math.min(2, devicePixelRatio || 1); cv.width = W() * V.dpr; cv.height = H() * V.dpr; V.s = Math.min(W() / 640, H() / 360); V.ox = (W() - 640 * V.s) / 2; V.oy = (H() - 360 * V.s) / 2; }
  fit(); addEventListener('resize', fit);
  const frameDp = () => { if (cv.width !== Math.round(W() * V.dpr)) fit(); g.setTransform(V.dpr * V.s, 0, 0, V.dpr * V.s, V.dpr * V.ox, V.dpr * V.oy); };
  const toDp = (x, y) => { const r = cv.getBoundingClientRect(); return { x: (x - r.left - V.ox) / V.s, y: (y - r.top - V.oy) / V.s }; };
  const toPx = (x, y) => { const r = cv.getBoundingClientRect(); return { x: r.left + V.ox + x * V.s, y: r.top + V.oy + y * V.s }; };
  const pops = [];
  function pop(x, y, text, color, big) {
    try {
      const p = toPx(x, y), d = document.createElement('div'); d.className = 'h109-ui h138-pop'; d.textContent = text;
      d.style.cssText = `position:fixed;z-index:62;left:${p.x}px;top:${p.y}px;color:${color};font:900 ${big ? 28 : 20}px Heebo,system-ui;direction:ltr;white-space:nowrap;transform:translate(-50%,-50%);text-shadow:0 2px 4px rgba(0,0,0,.7);pointer-events:none;transition:transform 1.3s ease-out,opacity 1.3s`;
      document.body.appendChild(d); pops.push(d); setTimeout(() => { d.style.transform = 'translate(-50%,-170%)'; d.style.opacity = '0'; }, 20); setTimeout(() => d.remove(), 1500);
    } catch (e) { /* */ }
  }
  let run = 0;
  const add = (n, why) => { try { sink.add && sink.add(n, why); } catch (e) { /* */ } };
  function hit(x, y, grade, mul) {
    const base = grade === 'gold' ? 40 : grade === 'good' ? 20 : 10; run = grade === 'gold' ? run + 1 : 0;
    add(base * mul, 'step'); pop(x, y, '+' + base * mul, grade === 'gold' ? '#FFD24A' : grade === 'good' ? '#FFFFFF' : '#DDD');
    if (run >= 3) { add(50, 'run'); pop(x, y - 30, 'רצף +50', '#FFE9A0', true); run = 0; }
  }
  function loss(x, y, n, label) { run = 0; let own = false; try { own = !!(sink.loss && sink.loss(n, label, toPx(x, y))); } catch (e) { /* */ } if (own) return; add(-n, 'loss'); pop(x, y, `−${n} ${label}`, '#FF7A6A', true); }
  function bonus(x, y, n, label) { add(n, 'bonus'); pop(x, y, `${label} +${n}`, '#9EF08A'); }
  const actx = sink.audio || (() => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } })();
  function snd(kind) {
    const c = typeof actx === 'function' ? actx() : actx; if (!c || c.state !== 'running' || sink.muted) return;
    try {
      const t = c.currentTime, o = c.createOscillator(), gn = c.createGain(), f = c.createBiquadFilter();
      const P = { tick: [900, 0.05, 0.08, 'triangle'], crease: [140, 0.25, 0.22, 'sawtooth'], snap: [520, 0.35, 0.06, 'sine'], cloth: [90, 0.35, 0.18, 'sine'], catch: [220, 0.4, 0.07, 'sine'], tear: [180, 0.3, 0.2, 'sawtooth'] }[kind] || [440, 0.1, 0.05, 'sine'];
      o.type = P[3]; o.frequency.setValueAtTime(P[0], t); o.frequency.exponentialRampToValueAtTime(P[0] * 0.6, t + P[1]);
      f.type = 'lowpass'; f.frequency.value = 1800; gn.gain.setValueAtTime(P[2], t); gn.gain.exponentialRampToValueAtTime(0.0001, t + P[1]);
      o.connect(f); f.connect(gn); gn.connect(c.__bhOut || c.destination); o.start(t); o.stop(t + P[1] + 0.02);
    } catch (e) { /* */ }
  }
  const resume = () => { try { const c = typeof actx === 'function' ? actx() : actx; if (c && c.state !== 'running') c.resume(); } catch (e) { /* */ } };
  function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* */ } }
  function hand(on, x, y, t) { if (!on) return; g.save(); g.font = '30px system-ui'; g.textAlign = 'center'; g.fillText('👆', x, y + 6 * Math.sin(t * 5)); g.restore(); }
  // the fingers
  const F = new Map(); let claim = () => null;
  const dn = (e) => {
    resume();
    const p = toDp(e.clientX, e.clientY); const f = { id: e.pointerId, x: p.x, y: p.y, x0: p.x, y0: p.y, button: e.button, pointerType: e.pointerType, dx: 0, dy: 0, role: null };
    f.role = claim(f); if (!f.role) return; e.preventDefault(); e.stopPropagation(); F.set(e.pointerId, f); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  };
  const mv = (e) => { const f = F.get(e.pointerId); if (!f) return; const p = toDp(e.clientX, e.clientY); f.dx += p.x - f.x; f.dy += p.y - f.y; f.x = p.x; f.y = p.y; };
  const up = (e) => { const f = F.get(e.pointerId); if (f) f.up = true; };
  const ctx = (e) => e.preventDefault();
  cv.style.touchAction = 'none';
  cv.addEventListener('pointerdown', dn); cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('contextmenu', ctx);
  return {
    g, V, frameDp, toDp, pop, hit, loss, bonus, snd, buzz, hand, F,
    fingers(fn) { claim = fn; },
    take(role) { for (const f of F.values()) if (f.role === role) { const o = { ...f }; f.dx = 0; f.dy = 0; return o; } return null; },
    has(role) { for (const f of F.values()) if (f.role === role) return true; return false; },
    sweep() { for (const [k, f] of F) if (f.up) F.delete(k); },
    clear() { F.clear(); run = 0; },
    resetRun() { run = 0; },
    dispose() { removeEventListener('resize', fit); cv.removeEventListener('pointerdown', dn); cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('contextmenu', ctx); for (const d of pops) { try { d.remove(); } catch (e) { /* */ } } },
  };
}
