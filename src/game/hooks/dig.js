/* ─────────────────────────────────────────────────────────────────────────────
 * dig.js — "חפירת היום" (the dig of the day, FUN wave 7): the brush game and the find's card.
 *
 *   openDig({ find, at, next, nextWhen, reward, n, of, best, sfx, emit, auto, root }) → Promise<{ ms, skipped, isPB }>
 *
 * The player sweeps the earth off a square of soil with a finger (dust, a soft brush sound, a tick of haptics); at ~2/3
 * uncovered the rest falls away, the find glows, and its card tells its true archaeology: what it is, where and when it
 * was found, by whom, where it is shown today, the source and "טיוטה". Under it: tomorrow's dig site (a known tease,
 * never a random prize). Nothing here can be lost or failed: the find and its reward were already given at the tap
 * (hooks/loop.js dig()); the brushing is the pleasure of uncovering it. The art is procedural (canvas), abstract, and
 * never draws a letter of a real inscription, a pagan symbol, or bones.
 * ──────────────────────────────────────────────────────────────────────────── */

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CSS = `
.fx-dig{position:fixed;inset:0;z-index:100000;background:rgba(24,16,8,.97);color:#F6EBD2;direction:rtl;display:flex;flex-direction:column;align-items:center;overflow:auto;padding:14px 16px 20px;box-sizing:border-box;font:15px/1.45 "Heebo",system-ui,sans-serif;opacity:0;transition:opacity .25s}
.fx-dig.on{opacity:1}
.fx-dig *{box-sizing:border-box}
.fx-dig header{width:100%;max-width:380px;display:flex;align-items:flex-start;gap:10px}
.fx-dig header div{flex:1;min-width:0}
.fx-dig h2{margin:0;font:800 20px/1.2 "Heebo",system-ui,sans-serif;color:#F3D27A}
.fx-dig header small{display:block;color:#D9C49A;font-size:13px;margin-top:2px}
.fx-dig .fx-dx{min-width:44px;min-height:44px;border-radius:12px;border:1px solid #6B5436;background:#2E2215;color:#F6EBD2;font-size:18px;cursor:pointer}
.fx-dig .fx-pit{position:relative;margin:12px 0 8px;border-radius:14px;overflow:hidden;box-shadow:0 0 0 3px #5A4128,0 10px 30px rgba(0,0,0,.5);touch-action:none;transition:box-shadow .6s}
.fx-dig .fx-pit canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.fx-dig .fx-pit .fx-earth{transition:opacity .5s}
.fx-dig .fx-pit.lit{box-shadow:0 0 0 3px #C8962E,0 0 36px 6px rgba(243,210,122,.55)}
.fx-dig .fx-pit.lit .fx-earth{opacity:0}
.fx-dig .fx-art{transition:transform 1.2s ease-out}
.fx-dig .fx-pit.lit .fx-art{transform:scale(1.03)}
.fx-dig .fx-pit::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,244,200,.6) 48%,transparent 66%);transform:translateX(-130%);pointer-events:none}
.fx-dig .fx-pit.lit::after{animation:fxshine 1.1s .35s ease-out 1 forwards}
@keyframes fxshine{to{transform:translateX(130%)}}
.fx-dig .fx-row{width:100%;max-width:380px;display:flex;align-items:center;gap:10px;min-height:44px}
.fx-dig .fx-prog{flex:1;height:8px;border-radius:5px;background:#3B2C1B;overflow:hidden}.fx-dig .fx-prog i{display:block;height:100%;width:0;background:#C8962E;transition:width .15s}
.fx-dig .fx-skip{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #6B5436;background:transparent;color:#F6EBD2;font:600 14px "Heebo",system-ui,sans-serif;cursor:pointer}
.fx-dig .fx-hint{color:#D9C49A;font-size:14px}
.fx-dig .fx-card2{width:100%;max-width:380px;background:#FFF8E6;color:#2A1F12;border-radius:16px;padding:14px;margin-top:6px;transform:translateY(16px);opacity:0;transition:transform .4s,opacity .4s}
.fx-dig .fx-card2.on{transform:none;opacity:1}
.fx-dig .fx-card2 h3{margin:0 0 4px;font:800 19px/1.25 "Heebo",system-ui,sans-serif}
.fx-dig .fx-card2 p{margin:6px 0 0;font-size:14.5px}
.fx-dig .fx-meta{margin-top:8px;font-size:13.5px;color:#4A3A22}.fx-dig .fx-meta b{color:#2A1F12}
.fx-dig .fx-src{display:block;margin-top:8px;font-size:12px;color:#6B5436}
.fx-dig .fx-tag{font-size:11px;background:#E8C77A;border-radius:6px;padding:0 5px;color:#1C140A;margin-inline-start:4px}
.fx-dig .fx-got{display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:10px;font-weight:700;color:#7A5A12}
.fx-dig .fx-pb{color:#1F6B3A}
.fx-dig .fx-next{margin-top:10px;padding:8px 10px;border-radius:10px;background:#F3E6C4;font-size:14px}
.fx-dig .fx-ok{margin-top:12px;width:100%;min-height:48px;border:0;border-radius:12px;background:#C8962E;color:#1C140A;font:800 16px "Heebo",system-ui,sans-serif;cursor:pointer}
@media (prefers-reduced-motion: reduce){.fx-dig,.fx-dig *{transition:none!important}.fx-dig .fx-pit.lit::after{animation:none}}
`;

/* ── the art: a square of excavated soil and the find in it (all abstract strokes; w = the canvas size in px) ── */
function rngOf(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function speckle(c, w, col, n, R) { c.fillStyle = col; for (let i = 0; i < n; i++) { const r = 0.4 + R() * 1.6 * (w / 320); c.beginPath(); c.arc(R() * w, R() * w, r, 0, 6.283); c.fill(); } }
function stone(c, x, y, W, H, R, tone = '#D8CBB0') {
  const g = c.createLinearGradient(x, y, x + W, y + H); g.addColorStop(0, '#EFE6D2'); g.addColorStop(1, tone);
  c.fillStyle = g; c.fillRect(x, y, W, H);
  c.strokeStyle = 'rgba(70,52,30,.55)'; c.lineWidth = Math.max(1, W / 160); c.strokeRect(x, y, W, H);
  c.fillStyle = 'rgba(90,70,40,.18)'; for (let i = 0; i < 70; i++) c.fillRect(x + R() * W, y + R() * H, 1.2, 1.2);
}
function glyphs(c, x, y, W, lineH, lines, col, R, round = false) {       // abstract strokes, never real letters
  c.strokeStyle = col; c.lineWidth = Math.max(1.2, lineH / 7); c.lineCap = 'round';
  for (let l = 0; l < lines; l++) {
    let gx = x + W; const gy = y + l * lineH * 1.45;
    while (gx > x + lineH * 0.6) {
      const k = Math.floor(R() * 4), h = lineH * 0.8, s = lineH * 0.55;
      c.beginPath();
      if (k === 0) { c.moveTo(gx, gy); c.lineTo(gx, gy + h); }
      else if (k === 1) { c.moveTo(gx, gy + h); c.lineTo(gx - s / 2, gy); c.lineTo(gx - s, gy + h); }
      else if (k === 2 && round) { c.arc(gx - s / 2, gy + h / 2, s / 2, 0, 6.283); }
      else { c.moveTo(gx, gy); c.lineTo(gx - s, gy); c.moveTo(gx - s / 2, gy); c.lineTo(gx - s / 2, gy + h); }
      c.stroke(); gx -= s + lineH * 0.35;
    }
  }
}
function coin(c, cx, cy, r, metal, R, chalice = false) {
  const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  if (metal === 'silver') { g.addColorStop(0, '#F4F7FA'); g.addColorStop(1, '#8E979F'); } else { g.addColorStop(0, '#D39A5A'); g.addColorStop(1, '#5E3F22'); }
  c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 6.283); c.fill();
  c.strokeStyle = metal === 'silver' ? 'rgba(60,66,72,.7)' : 'rgba(50,30,14,.7)'; c.lineWidth = Math.max(1, r / 14);
  c.beginPath(); c.arc(cx, cy, r * 0.86, 0, 6.283); c.stroke();
  c.fillStyle = c.strokeStyle; for (let i = 0; i < 28; i++) { const a = (i / 28) * 6.283; c.beginPath(); c.arc(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, r * 0.025, 0, 6.283); c.fill(); }
  if (chalice) {                                   // the cup on the shekel of the revolt (finds.json: "a chalice on one face")
    c.beginPath(); c.moveTo(cx - r * 0.34, cy - r * 0.42); c.lineTo(cx + r * 0.34, cy - r * 0.42); c.quadraticCurveTo(cx + r * 0.3, cy - r * 0.02, cx + r * 0.06, cy + r * 0.04);
    c.lineTo(cx + r * 0.06, cy + r * 0.28); c.lineTo(cx + r * 0.26, cy + r * 0.4); c.lineTo(cx - r * 0.26, cy + r * 0.4); c.lineTo(cx - r * 0.06, cy + r * 0.28); c.lineTo(cx - r * 0.06, cy + r * 0.04);
    c.quadraticCurveTo(cx - r * 0.3, cy - r * 0.02, cx - r * 0.34, cy - r * 0.42); c.closePath(); c.lineWidth = Math.max(1.2, r / 16); c.stroke();
  } else { c.fillStyle = 'rgba(40,24,10,.25)'; for (let i = 0; i < 16; i++) c.fillRect(cx + (R() - 0.5) * r, cy + (R() - 0.5) * r, 2, 2); }   // worn blank: no symbols
}
export function drawFind(c, kind, w, seed = 7) {
  const R = rngOf(seed);
  const g = c.createRadialGradient(w / 2, w / 2, w * 0.1, w / 2, w / 2, w * 0.75); g.addColorStop(0, '#C9A877'); g.addColorStop(1, '#8F6D45');
  c.fillStyle = g; c.fillRect(0, 0, w, w);
  speckle(c, w, 'rgba(90,64,36,.5)', 260, R); speckle(c, w, 'rgba(236,214,170,.35)', 120, R);
  const u = w / 100;
  switch (kind) {
    case 'shekel': coin(c, 50 * u, 50 * u, 27 * u, 'silver', R, true); break;
    case 'coins': coin(c, 36 * u, 42 * u, 11 * u, 'bronze', R); coin(c, 60 * u, 36 * u, 10 * u, 'bronze', R); coin(c, 54 * u, 62 * u, 11 * u, 'bronze', R);
      c.fillStyle = 'rgba(210,196,170,.9)'; c.fillRect(8 * u, 76 * u, 84 * u, 12 * u); c.fillStyle = 'rgba(70,52,30,.4)'; c.fillRect(8 * u, 76 * u, 84 * u, 1.5 * u); break;   // a paving slab's edge
    case 'plaster': c.fillStyle = '#B7B4AC'; c.fillRect(0, 40 * u, w, 34 * u); c.fillStyle = '#9C998F'; c.fillRect(0, 40 * u, w, 3 * u);
      c.fillStyle = 'rgba(80,80,80,.25)'; for (let i = 0; i < 80; i++) c.fillRect(R() * w, 42 * u + R() * 30 * u, 1.5, 1.5); coin(c, 54 * u, 57 * u, 10 * u, 'bronze', R); break;
    case 'block': stone(c, 8 * u, 34 * u, 84 * u, 30 * u, R);
      c.strokeStyle = 'rgba(60,44,24,.6)'; c.lineWidth = 2.5 * u; c.strokeRect(5 * u, 31 * u, 90 * u, 36 * u); break;   // the channels cut around it
    case 'giant': stone(c, 4 * u, 30 * u, 92 * u, 40 * u, R, '#CFC2A5');
      c.fillStyle = '#3B2C1B'; c.beginPath(); c.arc(12 * u, 76 * u, 1.6 * u, 0, 6.283); c.fill(); c.fillRect(11.3 * u, 77.5 * u, 1.4 * u, 6 * u); break;   // a tiny figure for scale
    case 'inscr': stone(c, 10 * u, 28 * u, 80 * u, 46 * u, R);
      c.fillStyle = 'rgba(70,52,30,.35)'; c.fillRect(56 * u, 28 * u, 24 * u, 12 * u);                     // the carved niche
      glyphs(c, 30 * u, 46 * u, 50 * u, 6 * u, 1, 'rgba(60,42,22,.85)', R);
      c.fillStyle = '#9C7A50'; c.beginPath(); c.moveTo(10 * u, 28 * u); c.lineTo(16 * u, 40 * u); c.lineTo(11 * u, 52 * u); c.lineTo(17 * u, 74 * u); c.lineTo(10 * u, 74 * u); c.fill(); break;   // the broken end
    case 'slab': stone(c, 14 * u, 16 * u, 72 * u, 68 * u, R, '#DCD2BE'); glyphs(c, 20 * u, 22 * u, 60 * u, 5 * u, 7, 'rgba(163,52,44,.85)', R, true); break;
    case 'box': c.fillStyle = '#E2D7BF'; c.beginPath(); c.moveTo(14 * u, 36 * u); c.lineTo(26 * u, 26 * u); c.lineTo(90 * u, 26 * u); c.lineTo(78 * u, 36 * u); c.closePath(); c.fill();
      stone(c, 14 * u, 36 * u, 64 * u, 38 * u, R); c.fillStyle = '#C9BC9E'; c.beginPath(); c.moveTo(78 * u, 36 * u); c.lineTo(90 * u, 26 * u); c.lineTo(90 * u, 64 * u); c.lineTo(78 * u, 74 * u); c.closePath(); c.fill();
      glyphs(c, 22 * u, 44 * u, 50 * u, 4.5 * u, 1, 'rgba(60,42,22,.8)', R, true); break;
    case 'key': c.strokeStyle = '#3A3430'; c.lineWidth = 3.2 * u; c.lineCap = 'round';
      c.beginPath(); c.arc(30 * u, 40 * u, 7 * u, 0, 6.283); c.moveTo(37 * u, 40 * u); c.lineTo(66 * u, 40 * u); c.lineTo(66 * u, 50 * u); c.moveTo(60 * u, 40 * u); c.lineTo(60 * u, 48 * u); c.stroke();
      c.lineWidth = 2.6 * u; c.strokeStyle = '#5A4630'; c.beginPath(); c.moveTo(24 * u, 80 * u); c.lineTo(62 * u, 62 * u); c.stroke();
      c.strokeStyle = '#3A3430'; c.beginPath(); c.moveTo(54 * u, 58 * u); c.quadraticCurveTo(64 * u, 60 * u, 72 * u, 70 * u); c.stroke();
      c.fillStyle = '#4A423C'; for (const x of [76, 86]) { c.beginPath(); c.moveTo(x * u, 60 * u); c.lineTo((x + 6) * u, 60 * u); c.lineTo((x + 3) * u, 80 * u); c.fill(); } break;
    case 'margins': default: stone(c, 12 * u, 24 * u, 76 * u, 52 * u, R);
      c.fillStyle = 'rgba(248,242,228,.55)'; c.fillRect(20 * u, 32 * u, 60 * u, 36 * u);                   // the flat boss
      c.strokeStyle = 'rgba(80,60,34,.35)'; c.lineWidth = 1; for (let x = 13; x < 88; x += 1.6) { c.beginPath(); c.moveTo(x * u, 25 * u); c.lineTo(x * u, 31 * u); c.moveTo(x * u, 69 * u); c.lineTo(x * u, 75 * u); c.stroke(); }
      break;
  }
}

/* ── the overlay ── */
export function openDig(o = {}) {
  return new Promise((resolve) => {
    const doc = (o.root && o.root.ownerDocument) || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.body || !o.find) { resolve({ ms: 0, skipped: true }); return; }
    const win = doc.defaultView || globalThis;
    if (!doc.getElementById('fx-dig-css')) { const s = doc.createElement('style'); s.id = 'fx-dig-css'; s.textContent = CSS; doc.head.appendChild(s); }
    const sfx = (n, x) => { try { const s = o.sfx; if (s && typeof s.play === 'function') s.play(n, x); else if (typeof s === 'function') s(n, x); } catch (e) { /* audio is best-effort */ } };
    const buzz = (p) => { try { if (o.sfx && typeof o.sfx.haptic === 'function') o.sfx.haptic(p); } catch (e) { /* no haptics */ } };
    let reduced = false; try { reduced = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* motion */ }
    const auto = !!(o.auto || globalThis.__MG_AUTO);
    const f = o.find, at = o.at || {};
    const root = doc.createElement('div');
    root.className = 'fx-dig'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'חפירת היום'); root.lang = 'he';
    const size = Math.max(220, Math.min(340, (win.innerWidth || 390) - 40, (win.innerHeight || 844) - 330));
    root.innerHTML = `<header><div><h2>חפירת היום</h2><small>${esc(at.where || '')}${at.date ? ' · ' + esc(at.date) : ''}</small></div><button type="button" class="fx-dx" data-x aria-label="סגור">✕</button></header>
      <div class="fx-pit" style="width:${size}px;height:${size}px"><canvas class="fx-art"></canvas><canvas class="fx-earth" aria-label="עפר מעל הממצא: גרור את האצבע כדי לנקות"></canvas><canvas class="fx-dust"></canvas></div>
      <div class="fx-row" data-z="row"><span class="fx-hint">${reduced ? 'הקש כדי לחשוף' : 'גרור את האצבע על העפר'}</span><div class="fx-prog"><i></i></div><button type="button" class="fx-skip" data-skip>חשוף הכול</button></div>
      <div data-z="card"></div>`;
    (o.root || doc.body).appendChild(root);
    requestAnimationFrame(() => root.classList.add('on'));
    const pit = root.querySelector('.fx-pit'), [cArt, cEarth, cDust] = pit.querySelectorAll('canvas'), bar = root.querySelector('.fx-prog i');
    const dpr = Math.min(2, win.devicePixelRatio || 1), W = Math.round(size * dpr);
    for (const cv of [cArt, cEarth, cDust]) { cv.width = W; cv.height = W; }
    const art = cArt.getContext('2d'), earth = cEarth.getContext('2d'), dust = cDust.getContext('2d');
    try { drawFind(art, at.art || 'margins', W, (f.id || '').length * 97 + 13); } catch (e) { /* the card still tells it */ }
    /* the earth: two strata of soil, darker on top */
    const R = rngOf(W + 5), eg = earth.createLinearGradient(0, 0, 0, W); eg.addColorStop(0, '#6E4F2E'); eg.addColorStop(1, '#8A6440');
    earth.fillStyle = eg; earth.fillRect(0, 0, W, W); speckle(earth, W, 'rgba(40,26,12,.55)', 420, R); speckle(earth, W, 'rgba(190,160,110,.4)', 260, R);
    for (let i = 0; i < 9; i++) { earth.fillStyle = `rgba(${150 + (R() * 40) | 0},${120 + (R() * 30) | 0},${80 + (R() * 20) | 0},.9)`; earth.beginPath(); earth.arc(R() * W, R() * W, (2 + R() * 5) * dpr, 0, 6.283); earth.fill(); }   // pebbles
    /* the brush stamp, made once */
    const rad = Math.round(W * 0.1), stamp = doc.createElement('canvas'); stamp.width = stamp.height = rad * 2;
    const sc = stamp.getContext('2d'), sg = sc.createRadialGradient(rad, rad, 0, rad, rad, rad); sg.addColorStop(0, 'rgba(0,0,0,.95)'); sg.addColorStop(0.6, 'rgba(0,0,0,.6)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
    sc.fillStyle = sg; sc.fillRect(0, 0, rad * 2, rad * 2);
    earth.globalCompositeOperation = 'destination-out';
    /* coverage: a 20 × 20 grid of cells, each needs two passes of the brush */
    const N = 20, cell = new Uint8Array(N * N); let cleared = 0, t0 = 0, done = false, last = null, lastSnd = 0, lastBuzz = 0, dabs = 0;
    const need = 0.66;
    /* dust: a fixed pool, drawn only while alive */
    const P = Array.from({ length: 48 }, () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, r: 1 })); let pi = 0, anim = 0;
    function puff(x, y) {
      if (reduced) return;
      for (let k = 0; k < 2; k++) { const p = P[pi++ % P.length]; p.x = x; p.y = y; p.vx = (Math.random() - 0.5) * 2.4 * dpr; p.vy = (-0.6 - Math.random() * 1.6) * dpr; p.life = 1; p.r = (1 + Math.random() * 2.2) * dpr; }
      if (!anim) anim = requestAnimationFrame(tick);
    }
    function tick() {
      anim = 0; dust.clearRect(0, 0, W, W); let alive = false;
      for (const p of P) { if (p.life <= 0) continue; alive = true; p.x += p.vx; p.y += p.vy; p.vy += 0.09 * dpr; p.life -= 0.045; dust.fillStyle = `rgba(196,164,112,${Math.max(0, p.life).toFixed(2)})`; dust.beginPath(); dust.arc(p.x, p.y, p.r, 0, 6.283); dust.fill(); }
      if (alive) anim = requestAnimationFrame(tick);
    }
    function dab(x, y) {
      earth.drawImage(stamp, x - rad, y - rad);
      const cs = W / N, r2 = (rad * 0.8) ** 2;
      for (let j = Math.max(0, Math.floor((y - rad) / cs)); j <= Math.min(N - 1, Math.floor((y + rad) / cs)); j++) {
        for (let i = Math.max(0, Math.floor((x - rad) / cs)); i <= Math.min(N - 1, Math.floor((x + rad) / cs)); i++) {
          const dx = (i + 0.5) * cs - x, dy = (j + 0.5) * cs - y;
          if (dx * dx + dy * dy <= r2 && cell[j * N + i] < 2) { cell[j * N + i]++; if (cell[j * N + i] === 2) cleared++; }
        }
      }
      if (++dabs % 2 === 0) puff(x, y);
      const t = performance.now();
      if (t - lastSnd > 90) { lastSnd = t; sfx('brush', { force: 0.6 + Math.random() * 0.4 }); }
      if (t - lastBuzz > 140) { lastBuzz = t; buzz(4); }
      const p = cleared / (N * N);
      bar.style.width = Math.min(100, Math.round((100 * p) / need)) + '%';
      if (p >= need) reveal(false);
    }
    function stroke(x, y) {
      if (done) return;
      if (!t0) t0 = performance.now();
      if (last) { const dx = x - last[0], dy = y - last[1], d = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(d / (rad * 0.35))); for (let k = 1; k <= n && !done; k++) dab(last[0] + (dx * k) / n, last[1] + (dy * k) / n); }
      else dab(x, y);
      last = [x, y];
    }
    const pos = (e) => { const b = cEarth.getBoundingClientRect(); return [((e.clientX - b.left) / b.width) * W, ((e.clientY - b.top) / b.height) * W]; };
    let down = false;
    pit.addEventListener('pointerdown', (e) => { if (done) return; if (reduced) { reveal(false); return; } down = true; last = null; try { pit.setPointerCapture(e.pointerId); } catch (x) { /* capture */ } const [x, y] = pos(e); stroke(x, y); e.preventDefault(); });
    pit.addEventListener('pointermove', (e) => { if (!down || done) return; const [x, y] = pos(e); stroke(x, y); e.preventDefault(); });
    const up = () => { down = false; last = null; };
    pit.addEventListener('pointerup', up); pit.addEventListener('pointercancel', up);

    let result = null;
    function reveal(skipped) {
      if (done) return; done = true;
      const ms = t0 ? Math.round(performance.now() - t0) : 0;
      result = { ms, skipped: skipped || auto || !t0 };
      bar.style.width = '100%';
      pit.classList.add('lit');
      sfx('find'); buzz([18, 40, 28]);
      const pb = !result.skipped && o.onTime ? o.onTime(ms) : null;
      result.isPB = !!(pb && pb.isPB);
      setTimeout(() => card(pb), reduced ? 0 : 450);
    }
    function card(pb) {
      const row = root.querySelector('[data-z="row"]'); if (row) row.remove();
      const host = root.querySelector('[data-z="card"]');
      const time = result && !result.skipped && result.ms ? `<span class="${pb && pb.isPB ? 'fx-pb' : ''}">חשפת ב־${(result.ms / 1000).toFixed(1)} ש׳${pb && pb.isPB ? ' · שיא אישי!' : ''}</span>` : '';
      const nextLine = o.next ? `<div class="fx-next">${esc(o.nextWhen || 'מחר')} בחפירה: <b>${esc(o.next.where || '')}</b> — מה מסתתר שם?</div>` : '<div class="fx-next">כל הממצאים של העונה באלבום שלך ✓</div>';
      host.innerHTML = `<div class="fx-card2"><h3>${esc(f.he)}</h3><p>${esc(f.text)}</p>
        <div class="fx-meta">${at.found ? `<div><b>נמצא:</b> ${esc(at.found)}</div>` : ''}${at.shown ? `<div><b>היום:</b> ${esc(at.shown)}</div>` : ''}</div>
        <span class="fx-src">${esc(f.ref || '')}<span class="fx-tag">טיוטה</span></span>
        <div class="fx-got"><span>${esc(o.reward || '')}</span><span>${o.n ? `${o.n} מתוך ${o.of} באלבום` : ''}</span>${time}</div>
        ${nextLine}<button type="button" class="fx-ok" data-x>לאלבום ✓</button></div>`;
      requestAnimationFrame(() => { const c2 = host.querySelector('.fx-card2'); if (c2) c2.classList.add('on'); });
      try { const b = host.querySelector('.fx-ok'); if (b) b.focus({ preventScroll: true }); } catch (e) { /* focus */ }
      if (o.autoClose) setTimeout(close, 4200);          // #demo: the owner's reel moves on by itself
    }
    let shut = false;
    function close() {
      if (shut) return; shut = true;
      if (!done) reveal(true);
      if (anim) cancelAnimationFrame(anim);
      win.removeEventListener('keydown', onKey);
      root.classList.remove('on'); setTimeout(() => root.remove(), 220);
      try { if (o.emit) o.emit('dig', { id: f.id, ms: result ? result.ms : 0, skipped: !!(result && result.skipped) }); } catch (e) { /* host */ }
      resolve(result || { ms: 0, skipped: true });
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    win.addEventListener('keydown', onKey);
    root.addEventListener('click', (e) => { if (e.target.closest('[data-skip]')) reveal(true); else if (e.target.closest('[data-x]')) close(); });
    if (auto) {                                        // bots, tests, #demo: the brush sweeps by itself in ~1.2 s
      let k = 0; const path = []; for (let j = 0; j < 7; j++) for (let i = 0; i <= 10; i++) path.push([(j % 2 ? 10 - i : i) * W / 10, (j + 0.5) * W / 7]);
      const iv = setInterval(() => { if (done || k >= path.length) { clearInterval(iv); if (!done) reveal(true); return; } for (let s = 0; s < 4 && k < path.length; s++, k++) stroke(path[k][0], path[k][1]); }, 60);
    }
  });
}
