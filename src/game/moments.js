/* ─────────────────────────────────────────────────────────────────────────────
 * moments.js: the key-moment framework (GDD §4.5) and all fifteen of Phase A's key moments (docs/MOMENTS.md).
 *
 *   const r = await playMoment('breaches', ctx);   // → {ok: true, skipped: boolean}
 *
 * A moment is a 10–40 s hands-on overlay framed over the 3D view (the camera has already flown to the site).
 * There is no fail state: a miss only nudges, retrying is instant, and "דלג" always completes it.
 *   greatStone (har)   hold to lower a giant ashlar with the crane, release on the mark
 *   breaches  (sorag)  tap the 13 breaches in the soreg to repair them (Middot 2:3)
 *   redLine   (sovev)  drag the red line to the middle of the altar's height (Middot 3:1)
 *   boxes     (kodesh) hold to lower the craftsmen's box through the opening, keeping it steady (Middot 4:5).
 *                      The Holy of Holies below is never drawn: only darkness.
 * wave 3 (the kind is the stage id):
 *   wall      "הנדבך הראשון": five ashlars, no joint over a joint (Herodian masonry, archaeology) · court 187×135 (5:1)
 *   gates     each of the seven gates to its wall (1:4–5)      nashim   the wormy logs out of the wood chamber (2:5)
 *   nikanor   the storm at sea (Yoma 38a), the fifteen steps (2:5)   lishka   dress a smooth hewn stone (5:4)
 *   yesod     "בלי ברזל": a wooden tool, whole stones only (3:4)     guf      stones up the kevesh, whitewash (3:3–4)
 *   karnot    four horns, then the first fire (3:1)             kiyor    pour the bronze, Ben Katin's 12 spigots (Yoma 3:10)
 *   ulam      five lintels (3:7), the golden vine (3:8)         heichal  polish the gold (4:1), the façade at sunrise (Josephus)
 * wave 12 (WORLD12): chanukat  the finale's night of light — fill and light the four golden menorot (4 bowls each, Sukkah 5:2),
 *                      the world lights with them (world.fest(k), world.festDone()); the end card offers world.invite()
 * ctx: { root, text (content MOMENTS[kind]), sfx, haptic(ms), world (guarded), reduced, T (UI strings), fmtSrc }
 * world (every member optional; a replay from the map passes {}): redLine(f), boxes(u), fx(quality, n) → strikeFX at
 *   the site, tool(k) → hero.setTool, momentFX(kind, arg) → stages.js momentFX ('fire' | 'gold' | 'dust'), vineN.
 * ──────────────────────────────────────────────────────────────────────────── */
const SVGNS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

export function playMoment(kind, ctx) {
  const GAMES = { greatStone, breaches, redLine, boxes, karnot, kiyor, ulam, yesod, heichal, gates, nikanor, wall, nashim, lishka, guf, chanukat };   // (world12: + chanukat, the finale)
  const game = GAMES[kind];
  ensureCss();
  return new Promise((resolve) => {
    const M = ctx.text;
    const wrap = document.createElement('div');
    wrap.className = 'gm-mo';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', M.n);
    wrap.innerHTML = `<div class="gm-mo-card">
      <div class="gm-mo-top"><span class="gm-mo-k">${ctx.T.momentKicker || 'רגע מיוחד'}</span><b class="gm-mo-t"></b><span class="gm-draft">${ctx.T.draft}</span></div>
      <div class="gm-mo-play"></div>
      <p class="gm-mo-hint" aria-live="polite"></p>
      <div class="gm-mo-end" hidden><div class="gm-mo-src"></div><button type="button" class="gm-btn gm-btn-gold gm-mo-go">${ctx.T.next}</button></div>
      <button type="button" class="gm-mo-skip">${ctx.T.skip}</button>
    </div>`;
    wrap.querySelector('.gm-mo-t').textContent = M.n;
    const hint = wrap.querySelector('.gm-mo-hint'); hint.textContent = M.hint;
    const play = wrap.querySelector('.gm-mo-play');
    (ctx.root || document.body).appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('on'));
    let finished = false, stop = () => {};
    const close = (skipped) => {
      if (finished && !skipped) return;
      finished = true;
      stop();
      wrap.classList.remove('on');
      setTimeout(() => wrap.remove(), 260);
      resolve({ ok: true, skipped });
    };
    const done = () => {
      if (finished) return;
      finished = true;
      stop();
      hint.textContent = M.done;
      hint.classList.add('ok');
      // ── land17 ── popups 'book' (the owner's setting "חלונות מידע: רק בספר"): the source is saved in the book, a small float says so, and the
      // moment ends by itself a beat after its play — no end card to read (the play itself, which asks the player, always stays)
      try {
        if (ctx.bookNote && ctx.bookNote(M)) {
          wrap.querySelector('.gm-mo-skip').hidden = true;
          wrap.querySelectorAll('.gm-mo-hold').forEach((b) => { b.hidden = true; });
          setTimeout(() => { finished = false; close(false); }, 1200);
          return;
        }
      } catch (e) { /* the book's: fall through to the card */ }
      // ── /land17 ──
      const end = wrap.querySelector('.gm-mo-end');
      wrap.querySelector('.gm-mo-src').innerHTML = ctx.fmtSrc ? ctx.fmtSrc(M.src) : '';
      end.hidden = false;
      wrap.querySelector('.gm-mo-skip').hidden = true;
      // ── flow11 ── (PRODUCER11 N65: "החזק להורדה" stayed drawn over the landed stone) the moment's hold buttons go with the play
      wrap.querySelectorAll('.gm-mo-hold').forEach((b) => { b.hidden = true; });
      const go = wrap.querySelector('.gm-mo-go');
      go.focus({ preventScroll: true });
      go.addEventListener('click', () => { finished = false; close(false); }, { once: true });
    };
    wrap.querySelector('.gm-mo-skip').addEventListener('click', () => { finished = false; close(true); });
    const api = { play, hint, done, sfx: ctx.sfx, haptic: ctx.haptic || (() => {}), world: ctx.world, reduced: !!ctx.reduced, T: ctx.T };
    stop = game ? game(api) || (() => {}) : (() => {});
    if (!game) done();
  });
}

/* A requestAnimationFrame loop that stops itself; returns the stopper. */
function loop(fn) {
  let id = 0, last = performance.now(), live = true;
  const f = (now) => { if (!live) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; fn(dt, now); id = requestAnimationFrame(f); };
  id = requestAnimationFrame(f);
  return () => { live = false; cancelAnimationFrame(id); };
}
/* Hold-to-act input on an element: returns {held()} and a cleanup. */
function holdInput(target, btn) {
  let held = false;
  const on = (e) => { held = true; if (e && e.cancelable) e.preventDefault(); };
  const off = () => { held = false; };
  for (const t of [target, btn]) { if (!t) continue; t.addEventListener('pointerdown', on); t.addEventListener('pointerup', off); t.addEventListener('pointerleave', off); t.addEventListener('pointercancel', off); }
  const key = (e) => { if (e.code === 'Space' || e.key === ' ') { held = e.type === 'keydown'; e.preventDefault(); } };
  addEventListener('keydown', key); addEventListener('keyup', key);
  return { held: () => held, off: () => { removeEventListener('keydown', key); removeEventListener('keyup', key); } };
}
function holdButton(api, label) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'gm-btn gm-mo-hold'; b.textContent = label;
  api.play.appendChild(b);
  return b;
}

/* ───────── האבן הגדולה: hold to lower, release on the mark ───────── */
function greatStone(api) {
  const svg = el('svg', { viewBox: '0 0 300 270', class: 'gm-mo-svg', role: 'img', 'aria-label': 'מנוף מוריד אבן גדולה' }, api.play);
  // the wall course with its seat
  for (let k = 0; k < 5; k++) el('rect', { x: k * 60 + (k % 2 ? 0 : -30), y: 246, width: 58, height: 22, rx: 2, class: 'gm-mo-ashlar' }, svg);
  el('rect', { x: 0, y: 200, width: 88, height: 44, rx: 2, class: 'gm-mo-ashlar' }, svg);
  el('rect', { x: 212, y: 200, width: 88, height: 44, rx: 2, class: 'gm-mo-ashlar' }, svg);
  el('line', { x1: 86, y1: 200, x2: 214, y2: 200, class: 'gm-mo-mark' }, svg);
  // the crane: a mast, a jib and the rope
  el('path', { d: 'M18 262 L40 10 L262 26', class: 'gm-mo-crane' }, svg);
  el('circle', { cx: 40, cy: 40, r: 22, class: 'gm-mo-wheel' }, svg);
  const rope = el('line', { x1: 150, y1: 20, x2: 150, y2: 30, class: 'gm-mo-rope' }, svg);
  const stone = el('g', {}, svg);
  el('rect', { x: -60, y: 0, width: 120, height: 44, rx: 3, class: 'gm-mo-big' }, stone);
  el('rect', { x: -52, y: 6, width: 104, height: 32, rx: 2, class: 'gm-mo-boss' }, stone);   // אפיק שפה ועייל שפה: the drafted margin
  const btn = holdButton(api, api.T.hold || 'החזק להורדה');
  const H = holdInput(svg, btn);
  let y = 34, t = 0, creak = 0, lastHeld = false, settled = false;
  const TARGET = 200, TOL = 6;
  const stop = loop((dt) => {
    t += dt;
    const held = H.held();
    if (held && !settled) {
      y += 58 * dt;
      creak -= dt; if (creak <= 0) { api.sfx && api.sfx.play('creak'); creak = 0.55; }
      if (y > TARGET + 12) {                        // too far: it touches the course and lifts back a little
        y = TARGET - 22; api.sfx && api.sfx.play('settle'); api.haptic(20);
        api.hint.textContent = 'עדין יותר: שחרר כשהאבן על הסימן';
      }
    }
    if (lastHeld && !held && !settled) {
      if (Math.abs(y - TARGET) <= TOL) {
        settled = true; y = TARGET;
        api.sfx && api.sfx.play('settle'); api.haptic(40);
        stone.classList.add('placed');
        setTimeout(api.done, 450);
      } else if (y < TARGET) api.hint.textContent = 'עוד קצת למטה';
    }
    lastHeld = held;
    const sway = api.reduced || settled ? 0 : Math.sin(t * 2.3) * (held ? 1.6 : 0.8);
    stone.setAttribute('transform', `translate(150 ${y.toFixed(1)}) rotate(${sway.toFixed(2)})`);
    rope.setAttribute('y2', (y + 1).toFixed(1));
  });
  return () => { stop(); H.off(); };
}

/* ───────── שלוש עשרה הפרצות: tap each breach ───────── */
function breaches(api) {
  const svg = el('svg', { viewBox: '0 0 360 230', class: 'gm-mo-svg', role: 'group', 'aria-label': 'הסורג ובו שלוש עשרה פרצות' }, api.play);
  const defs = el('defs', {}, svg);
  const pat = el('pattern', { id: 'gm-lat', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('path', { d: 'M0 4.5 H9 M4.5 0 V9', class: 'gm-mo-latline' }, pat);
  const counter = document.createElement('div'); counter.className = 'gm-mo-count'; api.play.appendChild(counter);
  const rows = [{ y: 38, n: 7 }, { y: 138, n: 6 }];
  let left = 13;
  const upd = () => { counter.textContent = `${13 - left} / 13`; };
  upd();
  for (const r of rows) {
    el('rect', { x: 10, y: r.y, width: 340, height: 54, rx: 6, fill: 'url(#gm-lat)', class: 'gm-mo-fence' }, svg);
    el('rect', { x: 10, y: r.y - 6, width: 340, height: 7, rx: 3, class: 'gm-mo-rail' }, svg);
    el('rect', { x: 10, y: r.y + 53, width: 340, height: 7, rx: 3, class: 'gm-mo-rail' }, svg);
    const gap = 340 / r.n;
    for (let k = 0; k < r.n; k++) {
      const cx = 10 + gap * (k + 0.5);
      const g = el('g', { class: 'gm-mo-gap', tabindex: 0, role: 'button', 'aria-label': 'פרצה' }, svg);
      el('rect', { x: cx - gap / 2 + 2, y: r.y - 10, width: gap - 4, height: 76, fill: 'transparent' }, g);   // a big hit area
      el('rect', { x: cx - 14, y: r.y + 1, width: 28, height: 52, rx: 3, class: 'gm-mo-hole' }, g);
      const fix = () => {
        if (g.classList.contains('fixed')) return;
        g.classList.add('fixed');
        el('rect', { x: cx - 14, y: r.y + 1, width: 28, height: 52, rx: 3, class: 'gm-mo-patchbg' }, g);
        el('rect', { x: cx - 14, y: r.y + 1, width: 28, height: 52, rx: 3, fill: 'url(#gm-lat)', class: 'gm-mo-patch' }, g);
        el('circle', { cx, cy: r.y + 27, r: 6, class: 'gm-mo-puff' }, g);
        left--; upd();
        api.sfx && api.sfx.play(left ? 'settle' : 'chime', { combo: 13 - left });
        api.haptic(15);
        if (!left) setTimeout(api.done, 500);
      };
      g.addEventListener('pointerdown', (e) => { e.preventDefault(); fix(); });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fix(); } });
    }
  }
  return () => {};
}

/* ───────── חוט הסיקרא: drag the red line to the middle ───────── */
function redLine(api) {
  const svg = el('svg', { viewBox: '0 0 300 262', class: 'gm-mo-svg gm-mo-drag', role: 'slider', 'aria-label': 'גובה חוט הסיקרא', tabindex: 0 }, api.play);
  const G0 = 244, TOP = 54, U = (G0 - TOP) / 10;                 // the altar's height in 10 equal parts
  el('rect', { x: 0, y: G0, width: 300, height: 18, class: 'gm-mo-ground' }, svg);
  el('rect', { x: 34, y: G0 - U, width: 232, height: U, class: 'gm-mo-alt' }, svg);             // יסוד
  el('rect', { x: 46, y: G0 - 6 * U, width: 208, height: 5 * U, class: 'gm-mo-alt' }, svg);     // up to the סובב
  el('rect', { x: 58, y: TOP, width: 184, height: G0 - 6 * U - TOP, class: 'gm-mo-alt' }, svg);
  for (const x of [58, 222]) el('rect', { x, y: TOP - 14, width: 20, height: 14, class: 'gm-mo-alt' }, svg);   // horns
  for (let k = 1; k < 10; k++) el('line', { x1: k < 1 ? 34 : k < 6 ? 46 : 58, y1: G0 - k * U, x2: k < 1 ? 266 : k < 6 ? 254 : 242, y2: G0 - k * U, class: 'gm-mo-course' }, svg);
  const lab = (y, t) => { const e = el('text', { x: 150, y, class: 'gm-mo-lab', 'text-anchor': 'middle' }, svg); e.textContent = t; };
  lab(G0 - U * 0.28, 'יסוד'); lab(G0 - 6 * U + 13, 'סובב'); lab(TOP - 4, 'קרנות');
  const mid = G0 - 5 * U;
  const line = el('g', { class: 'gm-mo-red' }, svg);
  el('rect', { x: 30, y: -3, width: 240, height: 6, rx: 3 }, line);
  el('circle', { cx: 280, cy: 0, r: 11 }, line);
  let y = TOP + 1.5 * U, dragging = false, done = false, lastStep = Math.round(y / (U / 4));
  const place = () => { line.setAttribute('transform', `translate(0 ${y.toFixed(1)})`); svg.setAttribute('aria-valuenow', ((G0 - y) / U).toFixed(1)); };
  place();
  const toY = (e) => { const r = svg.getBoundingClientRect(); return ((e.clientY - r.top) / r.height) * 262; };
  const move = (ny) => {
    y = clamp(ny, TOP - 8, G0 - 4);
    const s = Math.round(y / (U / 4));
    if (s !== lastStep) { lastStep = s; api.sfx && api.sfx.play('ui'); if (Math.abs(y - mid) < U * 0.35) api.haptic(8); }
    place();
  };
  const check = () => {
    if (done) return;
    if (Math.abs(y - mid) <= U * 0.35) {
      done = true; y = mid; place(); line.classList.add('set');
      api.sfx && api.sfx.play('chime', { combo: 4 }); api.haptic(35);
      api.world && api.world.redLine && api.world.redLine(0.5);
      setTimeout(api.done, 500);
    } else api.hint.textContent = y < mid ? 'נמוך יותר: באמצע גובה המזבח' : 'גבוה יותר: באמצע גובה המזבח';
  };
  svg.addEventListener('pointerdown', (e) => { if (done) return; dragging = true; svg.setPointerCapture && svg.setPointerCapture(e.pointerId); move(toY(e)); e.preventDefault(); });
  svg.addEventListener('pointermove', (e) => { if (dragging && !done) move(toY(e)); });
  const up = () => { if (dragging) { dragging = false; check(); } };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('keydown', (e) => {
    if (done) return;
    if (e.key === 'ArrowUp') { move(y - U / 4); e.preventDefault(); }
    else if (e.key === 'ArrowDown') { move(y + U / 4); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') { check(); e.preventDefault(); }
  });
  return () => {};
}

/* ───────── האומנים בתיבות: lower the box slowly, keep it steady ───────── */
function boxes(api) {
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg', role: 'img', 'aria-label': 'תיבה יורדת מן העלייה' }, api.play);
  const defs = el('defs', {}, svg);
  const lg = el('linearGradient', { id: 'gm-dark', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#1a140e', 'stop-opacity': '0.85' }, lg);
  el('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '1' }, lg);
  el('rect', { x: 0, y: 124, width: 300, height: 176, fill: 'url(#gm-dark)' }, svg);            // below: never shown
  el('rect', { x: 0, y: 108, width: 118, height: 18, class: 'gm-mo-floor' }, svg);
  el('rect', { x: 182, y: 108, width: 118, height: 18, class: 'gm-mo-floor' }, svg);            // the opening (לול) between
  el('rect', { x: 0, y: 0, width: 300, height: 108, class: 'gm-mo-upper' }, svg);
  el('circle', { cx: 150, cy: 20, r: 14, class: 'gm-mo-wheel' }, svg);
  const ropes = [el('line', { class: 'gm-mo-rope' }, svg), el('line', { class: 'gm-mo-rope' }, svg)];
  const box = el('g', {}, svg);
  el('rect', { x: -24, y: 0, width: 48, height: 40, rx: 3, class: 'gm-mo-box' }, box);
  el('path', { d: 'M-24 12 H24 M-24 28 H24', class: 'gm-mo-boxline' }, box);
  const meter = document.createElement('div'); meter.className = 'gm-mo-meter'; meter.innerHTML = '<i></i>'; api.play.appendChild(meter);
  const bar = meter.firstChild;
  const btn = holdButton(api, api.T.hold || 'החזק להורדה');
  const H = holdInput(svg, btn);
  let y = 46, sway = 0, t = 0, creak = 0, done = false, paused = false, lastHint = '';
  const END = 262;
  const stop = loop((dt) => {
    t += dt;
    const held = H.held() && !done;
    if (held) sway += 9 * dt; else sway = Math.max(0, sway - 14 * dt);
    if (sway > 12) paused = true;
    if (paused && sway < 4) paused = false;
    if (held && !paused) {
      y += 42 * dt;
      creak -= dt; if (creak <= 0) { api.sfx && api.sfx.play('creak'); creak = 0.7; }
    }
    const want = paused ? 'התיבה מתנדנדת. הרפה רגע' : 'החזק כדי להוריד את התיבה לאט';
    if (!done && want !== lastHint) { lastHint = want; api.hint.textContent = want; }
    bar.style.width = `${Math.min(100, (sway / 12) * 100).toFixed(0)}%`;
    meter.classList.toggle('hot', sway > 8);
    const u = clamp((y - 46) / (END - 46), 0, 1);
    api.world && api.world.boxes && api.world.boxes(u);
    if (!done && y >= END) { done = true; api.sfx && api.sfx.play('settle'); api.haptic(30); setTimeout(api.done, 400); }
    const a = api.reduced ? 0 : Math.sin(t * 4) * sway * 0.9;
    box.setAttribute('transform', `translate(150 ${y.toFixed(1)}) rotate(${a.toFixed(2)})`);
    ropes[0].setAttribute('x1', 140); ropes[0].setAttribute('y1', 24); ropes[0].setAttribute('x2', (150 - 18 + a * 0.4).toFixed(1)); ropes[0].setAttribute('y2', y.toFixed(1));
    ropes[1].setAttribute('x1', 160); ropes[1].setAttribute('y1', 24); ropes[1].setAttribute('x2', (150 + 18 + a * 0.4).toFixed(1)); ropes[1].setAttribute('y2', y.toFixed(1));
    box.style.opacity = y > 150 ? String(clamp(1 - (y - 150) / 110, 0.15, 1)) : '1';
  });
  return () => { stop(); H.off(); };
}

/* ═════════════════════ wave 3: the eleven remaining key moments (docs/MOMENTS.md) ═════════════════════
 * Shared rules: no fail state (a miss nudges and the same step is tried again at once), big touch targets
 * (≥ 44 px on a 390 px phone), every step has a sound and a haptic tick, every world call is optional (a replay
 * from the map passes world: {}), and every timer and animation stops when the moment is skipped. */

/* the new moments' look, kept here (ui.css.js is the HUD's); injected once */
const CSS2 = `
.gm-m2 .gm-m2-btn{cursor:pointer;outline:none}
.gm-m2 .gm-m2-btn:focus-visible .gm-m2-ring{stroke:#fff}
.gm-m2-stone{fill:#EDE3CF;stroke:#B9A57F;stroke-width:1.5}
.gm-m2-stone2{fill:#D9CAA8;stroke:#A8916A;stroke-width:1.5}
.gm-m2-walk{fill:none;stroke:rgba(150,128,90,.55);stroke-width:1;stroke-dasharray:4 3}
.gm-m2-lab{font:600 10.5px "Heebo",sans-serif;fill:#7E6746}
.gm-m2-labb{font:800 12px "Heebo",sans-serif;fill:#6A5436}
.gm-m2-ring{fill:rgba(255,200,74,.16);stroke:#E8A91C;stroke-width:2.5;stroke-dasharray:6 4;animation:gm-m2-pulse 1.1s ease-in-out infinite}
.gm-m2-slot{fill:rgba(74,58,38,.35);stroke:#FFC84A;stroke-width:1.5}
.gm-m2-hornT{fill:#E6D9BA;stroke:#8C7651;stroke-width:1}
.gm-m2-hornS{fill:#BFA77C;stroke:#8C7651;stroke-width:1}
.gm-m2-log{fill:#8A5A2E;stroke:#5C3A1C;stroke-width:1}
.gm-m2-logE{fill:#B98552;stroke:#5C3A1C;stroke-width:.8}
.gm-m2-ember{fill:#FF8A2A}
.gm-m2-fire{mix-blend-mode:normal}
.gm-m2-tray{fill:rgba(120,96,60,.12);stroke:rgba(120,96,60,.35);stroke-width:1;stroke-dasharray:3 3}
.gm-m2-drag{cursor:grab;touch-action:none}
.gm-m2-bar{position:absolute;bottom:12px;inset-inline-start:34px;inset-inline-end:34px;height:12px;border-radius:5px;background:rgba(0,0,0,.14);overflow:hidden;pointer-events:none}
.gm-m2-bar.gm-m2-hi{top:46px;bottom:auto;background:rgba(255,255,255,.4);z-index:2}
.gm-m2-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#F2B233,#E4572E);border-radius:5px}
.gm-m2-pop{animation:gm-m2-pop .45s ease-out}
.gm-m2-shake{animation:gm-m2-shake .35s ease-in-out}
.gm-m2-spark{fill:#FFD76A;animation:gm-m2-spark .7s ease-out forwards}
.gm-m2-row{position:absolute;bottom:8px;inset-inline:8px;display:flex;gap:10px;justify-content:center}
.gm-m2-row .gm-btn{min-height:48px;min-width:112px;font-weight:800}
.gm-m2-tag{position:absolute;top:6px;left:50%;transform:translateX(-50%);white-space:nowrap;pointer-events:none;font:800 13px/1 "Heebo",sans-serif;background:var(--gm-solid);border-radius:999px;padding:5px 10px;box-shadow:var(--gm-shadow)}
@keyframes gm-m2-pulse{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes gm-m2-pop{0%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes gm-m2-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes gm-m2-spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
@media (prefers-reduced-motion: reduce){.gm-m2-ring,.gm-m2-pop,.gm-m2-shake,.gm-m2-spark{animation:none}}
/* the site stays in view: the card at the bottom of a portrait screen, on the right of a wide one (stages.js frames
   the camera to match: momentFX('frame')) */
@media (orientation: portrait){.gm-mo{place-items:end center;padding-bottom:max(10px,env(safe-area-inset-bottom));background:linear-gradient(180deg,rgba(10,8,5,0) 0%,rgba(10,8,5,.1) 38%,rgba(10,8,5,.5) 100%)}}
@media (orientation: landscape) and (min-width: 820px){.gm-mo{justify-items:right;align-items:center;padding-right:28px;background:linear-gradient(270deg,rgba(10,8,5,.5) 0%,rgba(10,8,5,.1) 45%,rgba(10,8,5,0) 70%)}}
`;
function ensureCss() {
  if (typeof document === 'undefined' || document.getElementById('gm-m2-css')) return;
  const s = document.createElement('style'); s.id = 'gm-m2-css'; s.textContent = CSS2;
  (document.head || document.documentElement).appendChild(s);
}

/* ── helpers ── */
/** setTimeout / tween bookkeeping: everything stops with the moment (skip or done) */
function jobs() {
  const ids = new Set(); let live = true;
  return {
    after(ms, fn) { if (!live) return 0; const id = setTimeout(() => { ids.delete(id); if (live) fn(); }, ms); ids.add(id); return id; },
    /** fn(u 0..1) every frame for ms, then end() */
    tween(ms, fn, end) {
      const t0 = performance.now();
      const f = (now) => { if (!live) return; const u = Math.min(1, (now - t0) / Math.max(1, ms)); fn(u); if (u < 1) requestAnimationFrame(f); else if (end) end(); };
      requestAnimationFrame(f);
    },
    stop() { live = false; for (const id of ids) clearTimeout(id); ids.clear(); },
    get live() { return live; },
  };
}
const ease = (u) => 1 - (1 - u) * (1 - u) * (1 - u);
/** client (px) → the svg's user units, whatever its letterboxing */
function svgPt(svg, e) {
  const m = svg.getScreenCTM && svg.getScreenCTM();
  if (m && typeof DOMPoint === 'function') { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return { x: p.x, y: p.y }; }
  const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
  return { x: vb.x + ((e.clientX - r.left) / r.width) * vb.width, y: vb.y + ((e.clientY - r.top) / r.height) * vb.height };
}
/** a tappable svg group (pointer + Enter/Space) */
function tappable(parent, label, onTap, cls = '') {
  const g = el('g', { class: `gm-m2-btn ${cls}`.trim(), tabindex: 0, role: 'button', 'aria-label': label }, parent);
  g.addEventListener('pointerdown', (e) => { e.preventDefault(); onTap(e); });
  g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTap(e); } });
  return g;
}
/** drag an svg element with the pointer: start(p) → move(p) → end(p, moved) in svg units */
function dragger(svg, target, { start, move, end }) {
  let on = false, pid = 0, p0 = null, moved = 0;
  target.addEventListener('pointerdown', (e) => {
    if (on) return;
    on = true; pid = e.pointerId; p0 = svgPt(svg, e); moved = 0;
    try { svg.setPointerCapture(e.pointerId); } catch (x) { /* synthetic events */ }
    e.preventDefault(); e.stopPropagation();
    if (start) start(p0);
  });
  svg.addEventListener('pointermove', (e) => { if (!on || e.pointerId !== pid) return; const p = svgPt(svg, e); moved = Math.max(moved, Math.hypot(p.x - p0.x, p.y - p0.y)); if (move) move(p); });
  const up = (e) => { if (!on || e.pointerId !== pid) return; on = false; if (end) end(svgPt(svg, e), moved); };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
}
/** a few gold sparks flying out of (x, y) */
function sparks(svg, x, y, n = 8, reduced = false) {
  if (reduced) return;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + Math.random() * 0.5, d = 16 + Math.random() * 18;
    const c = el('circle', { cx: x, cy: y, r: 2.2 + Math.random() * 1.6, class: 'gm-m2-spark' }, svg);
    c.style.setProperty('--dx', `${(Math.cos(a) * d).toFixed(1)}px`); c.style.setProperty('--dy', `${(Math.sin(a) * d).toFixed(1)}px`);
    setTimeout(() => c.remove(), 750);
  }
}
/** the moment's small helpers bound to its api */
function kit(api) {
  const J = jobs();
  const sfx = (n, o) => { if (api.sfx) api.sfx.play(n, o); };
  const world = (name, ...a) => { const w = api.world; if (w && typeof w[name] === 'function') { try { w[name](...a); } catch (e) { /* the world is optional */ } } };
  const say = (t, ok) => { api.hint.textContent = t; api.hint.classList.toggle('ok', !!ok); };
  const tag = (() => { let e = null; return (t) => { if (!e) { e = document.createElement('div'); e.className = 'gm-m2-tag'; api.play.appendChild(e); } e.textContent = t; }; })();
  const finish = (ms = 600) => J.after(ms, api.done);
  return { J, sfx, world, say, tag, finish };
}

/* ───────── הקרנות והאש הראשונה (karnot): set the four horns, then light the first fire (Middot 3:1) ─────────
 * The altar's top from above, to scale: 28 × 28 amot at the top level; a horn at each corner, one amah by one
 * ("מקום הקרנות אמה מזה ואמה מזה"); inside them the priests' walkway (one amah); in the middle the 24 × 24 מערכה. */
function karnot(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'ראש המזבח מלמעלה: ארבע פינות לקרנות, ובאמצע המערכה' }, api.play);
  const defs = el('defs', {}, svg);
  const rg = el('radialGradient', { id: 'gm-m2-fireg', cx: '50%', cy: '70%', r: '60%' }, defs);
  el('stop', { offset: '0', 'stop-color': '#FFF4B8' }, rg); el('stop', { offset: '.45', 'stop-color': '#FFB43A' }, rg); el('stop', { offset: '1', 'stop-color': '#E4572E', 'stop-opacity': '0' }, rg);
  const A = 8, X0 = 38, Y0 = 12, S = 28 * A;                     // one amah = 8 units; the top level is 28 × 28
  el('rect', { x: X0 - 7, y: Y0 - 7, width: S + 14, height: S + 14, rx: 5, class: 'gm-m2-stone2' }, svg);   // the סובב's edge below
  el('rect', { x: X0, y: Y0, width: S, height: S, rx: 3, class: 'gm-m2-stone' }, svg);
  for (let k = 1; k < 7; k++) el('line', { x1: X0, y1: Y0 + k * 4 * A, x2: X0 + S, y2: Y0 + k * 4 * A, class: 'gm-mo-course' }, svg);   // the stone courses
  el('rect', { x: X0 + A, y: Y0 + A, width: S - 2 * A, height: S - 2 * A, class: 'gm-m2-walk' }, svg);   // inside the horns: 26 × 26
  const M0 = X0 + 2 * A, MS = S - 4 * A;                                                                 // the מערכה: 24 × 24
  el('rect', { x: M0, y: M0 - X0 + Y0, width: MS, height: MS, rx: 2, fill: 'rgba(120,96,60,.08)', stroke: 'rgba(120,96,60,.4)', 'stroke-dasharray': '2 3' }, svg);
  const lab = (x, y, t, c = 'gm-m2-lab') => { const e = el('text', { x, y, class: c, 'text-anchor': 'middle' }, svg); e.textContent = t; return e; };
  lab(150, Y0 + S - 2 * A - 8, 'מקום המערכה · 24 על 24');
  lab(X0 + 1.5 * A + 3.5, Y0 + S / 2, 'מקום הילוך רגלי הכהנים').setAttribute('transform', `rotate(-90 ${X0 + 1.5 * A + 3.5} ${Y0 + S / 2})`);
  // the wood of the מערכה (in the middle), and its fire
  const my = Y0 + S / 2 + 4, wood = el('g', {}, svg);
  for (const [dx, dy, w, r] of [[-44, 16, 88, -8], [-40, 4, 80, 10], [-36, -8, 74, -4], [-30, -20, 60, 7]]) {
    const g = el('g', { transform: `translate(150 ${my + dy}) rotate(${r})` }, wood);
    el('rect', { x: dx, y: -6, width: w, height: 12, rx: 6, class: 'gm-m2-log' }, g);
    el('ellipse', { cx: dx + w, cy: 0, rx: 3.5, ry: 6, class: 'gm-m2-logE' }, g);
  }
  const embers = [0, 1, 2, 3, 4, 5].map((k) => el('circle', { cx: 150 - 30 + k * 12, cy: my + 4 + (k % 2) * 8, r: 3.4, opacity: 0, class: 'gm-m2-ember' }, svg));
  const fire = el('g', { class: 'gm-m2-fire', transform: `translate(150 ${my + 10}) scale(0)` }, svg);
  el('path', { d: 'M-46 0 C-50 -40 -20 -52 -18 -96 C0 -64 22 -70 16 -118 C44 -80 52 -44 46 0 Z', fill: 'url(#gm-m2-fireg)' }, fire);
  el('path', { d: 'M-24 0 C-26 -26 -8 -34 -6 -62 C8 -40 22 -40 20 -76 C34 -48 34 -22 26 0 Z', fill: '#FFE08A', opacity: '.85' }, fire);
  // the four corners: a slot of one amah, a big glowing ring to aim at
  const corners = [[X0, Y0], [X0 + S - A, Y0], [X0, Y0 + S - A], [X0 + S - A, Y0 + S - A]];
  const slots = corners.map(([x, y], i) => {
    const cx = x + A / 2, cy = y + A / 2;
    const ring = el('circle', { cx, cy, r: 20, class: 'gm-m2-ring' }, svg);
    el('rect', { x, y, width: A, height: A, class: 'gm-m2-slot' }, svg);
    return { i, cx, cy, ring, horn: null };
  });
  { const lx = X0 + S - 1.5 * A + 3.5, ly = Y0 + S - 46; lab(lx, ly, 'קרן: אמה על אמה', 'gm-m2-labb').setAttribute('transform', `rotate(90 ${lx} ${ly})`); }
  // the tray: four horns, drawn close (big); they shrink as they go to their far corner
  const tray = el('rect', { x: 14, y: 252, width: 272, height: 44, rx: 10, class: 'gm-m2-tray' }, svg);
  // a horn: a cube of one amah (its footprint is the slot), drawn at a slant so its height shows
  const hornShape = (g) => {
    el('path', { d: 'M-4 -2 L4 -2 L4 6 L-4 6 Z', class: 'gm-m2-hornS' }, g);
    el('path', { d: 'M4 -2 L7 -7 L7 1 L4 6 Z', fill: '#A08660', stroke: '#8C7651', 'stroke-width': 1 }, g);
    el('path', { d: 'M-4 -2 L4 -2 L7 -7 L-1 -7 Z', class: 'gm-m2-hornT' }, g);
  };
  const BIG = 2.6;
  let placed = 0, phase = 'horns';
  const pieces = [0, 1, 2, 3].map((k) => {
    const home = { x: 60 + k * 60, y: 274 };
    const g = el('g', { class: 'gm-m2-drag', tabindex: 0, role: 'button', 'aria-label': 'קרן' }, svg);
    el('circle', { r: 22, fill: 'transparent' }, g);                // a finger-sized hit area
    const body = el('g', {}, g); hornShape(body);
    const P = { g, body, home, x: home.x, y: home.y, s: BIG, busy: false, done: false };
    const put = () => { g.setAttribute('transform', `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)})`); body.setAttribute('transform', `scale(${P.s.toFixed(2)})`); };
    P.put = put; put();
    const flyTo = (x, y, s, ms, end) => { const a = { x: P.x, y: P.y, s: P.s }; P.busy = true; g.setAttribute('data-busy', '1'); K.J.tween(ms, (u) => { const e = ease(u); P.x = a.x + (x - a.x) * e; P.y = a.y + (y - a.y) * e; P.s = a.s + (s - a.s) * e; put(); }, () => { P.busy = false; g.removeAttribute('data-busy'); if (end) end(); }); };
    P.flyTo = flyTo;
    const seat = (slot) => {
      slot.horn = P; P.done = true; g.removeAttribute('tabindex'); g.style.pointerEvents = 'none';
      flyTo(slot.cx, slot.cy, 1.25, 260, () => {
        slot.ring.remove(); placed++;
        el('circle', { cx: slot.cx, cy: slot.cy, r: 12, fill: 'none', stroke: '#E8A91C', 'stroke-width': 2, class: 'gm-m2-pop' }, svg);
        K.sfx('settle'); K.sfx('chime', { combo: placed }); api.haptic(25); sparks(svg, slot.cx, slot.cy, 7, api.reduced);
        K.world('fx', placed === 4 ? 'perfect' : 'normal', placed);
        K.tag(`קרנות ${placed} / 4`);
        if (placed === 4) toFire();
      });
    };
    const nearest = (p) => { let b = null, bd = 1e9; for (const s of slots) { if (s.horn) continue; const d = Math.hypot(s.cx - p.x, s.cy - p.y); if (d < bd) { bd = d; b = s; } } return { s: b, d: bd }; };
    dragger(svg, g, {
      start() { if (P.busy || P.done) return; K.sfx('ui'); },
      move(p) { if (P.busy || P.done) return; P.x = p.x; P.y = p.y; P.s = 1 + (BIG - 1) * clamp((p.y - 40) / 230, 0, 1); put(); },
      end(p, moved) {
        if (P.busy || P.done) return;
        const n = nearest(moved < 8 ? { x: -1e3, y: -1e3 } : p);
        if (moved < 8) { const free = slots.find((s) => !s.horn); if (free) seat(free); return; }     // a tap: the next free corner
        if (n.s && n.d < 34) seat(n.s);
        else { K.say('קרוב יותר לאחת הפינות'); K.sfx('ui'); flyTo(home.x, home.y, BIG, 240); }
      },
    });
    g.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !P.done && !P.busy) { e.preventDefault(); const free = slots.find((s) => !s.horn); if (free) seat(free); } });
    return P;
  });
  K.tag('קרנות 0 / 4');
  // the fire: hold on the מערכה
  let heat = 0, holding = false, crackle = 0, lit = false;
  const bar = document.createElement('div'); bar.className = 'gm-m2-bar'; bar.innerHTML = '<i></i>'; bar.hidden = true; api.play.appendChild(bar);
  const hot = el('rect', { x: M0, y: M0 - X0 + Y0, width: MS, height: MS, fill: 'transparent', 'aria-label': 'המערכה', role: 'button', tabindex: -1 }, svg);
  const H = holdInput(hot, null);
  function toFire() {
    phase = 'fire';
    tray.style.display = 'none';
    K.J.after(350, () => {
      K.say('החזק על העצים עד שהאש תיאחז');
      bar.hidden = false; hot.setAttribute('tabindex', 0); hot.classList.add('gm-m2-btn'); wood.classList.add('gm-m2-pop');
      K.tag('האש הראשונה');
    });
  }
  const stopLoop = loop((dt) => {
    if (phase !== 'fire' || lit) return;
    holding = H.held();
    heat = clamp(heat + (holding ? dt / 2.4 : -dt * 0.12), 0, 1);
    if (holding) { crackle -= dt; if (crackle <= 0) { K.sfx('crack'); api.haptic(6); crackle = 0.28 + Math.random() * 0.2; } }
    bar.firstChild.style.width = `${(heat * 100).toFixed(0)}%`;
    embers.forEach((e, k) => e.setAttribute('opacity', clamp(heat * 3 - k * 0.35, 0, 1).toFixed(2)));
    const s = heat < 0.25 ? 0 : (heat - 0.25) / 0.75, fl = api.reduced ? 1 : 1 + Math.sin(performance.now() / 90) * 0.06;
    fire.setAttribute('transform', `translate(150 ${my + 10}) scale(${(s * fl).toFixed(3)} ${(s * (2 - fl)).toFixed(3)})`);
    if (heat >= 1) {
      lit = true;
      K.sfx('chime', { combo: 8 }); K.sfx('settle'); api.haptic([30, 40, 60]);
      K.world('momentFX', 'fire');
      sparks(svg, 150, my - 40, 14, api.reduced);
      K.say('האש בוערת על המזבח', true);
      K.finish(900);
    }
  });
  return () => { stopLoop(); H.off(); K.J.stop(); };
}

/* ───────── שנים עשר הדדים (kiyor): pour the bronze to the line, then fit Ben Katin's spigots (Yoma 3:10) ─────────
 * The mould fills while the button is held; released on the line it cools into bronze (over the line, the spill is
 * scraped off and the level goes back: try again). Then the kiyor from above: it had only two spigots, and Ben Katin
 * made twelve (Mishnah Yoma 3:10), so that twelve priests could sanctify their hands and feet at once (Yoma 37a). */
function kiyor(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'יציקת הכיור מנחושת, ושנים עשר דדים' }, api.play);
  const defs = el('defs', {}, svg);
  const mg = el('linearGradient', { id: 'gm-m2-molten', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#FFE9A0' }, mg); el('stop', { offset: '.35', 'stop-color': '#FFA23A' }, mg); el('stop', { offset: '1', 'stop-color': '#C4471C' }, mg);
  const cp = el('clipPath', { id: 'gm-m2-mould' }, defs);
  const BOWL = 'M62 112 Q62 252 150 252 Q238 252 238 112 Z';
  el('path', { d: BOWL }, cp);
  /* phase 1: the mould */
  const P1 = el('g', {}, svg);
  el('path', { d: 'M44 104 L256 104 L256 118 Q256 272 150 272 Q44 272 44 118 Z', fill: '#B59B6E', stroke: '#8A7250', 'stroke-width': 2 }, P1);   // the clay mould
  el('path', { d: BOWL, fill: '#4A3A28' }, P1);
  const TOP = 112, BOT = 252, LINE = 0.8, lineY = BOT - LINE * (BOT - TOP);
  const molten = el('rect', { x: 50, y: BOT, width: 200, height: 0, fill: 'url(#gm-m2-molten)', 'clip-path': 'url(#gm-m2-mould)' }, P1);
  el('line', { x1: 52, y1: lineY, x2: 248, y2: lineY, class: 'gm-mo-mark' }, P1);
  const lt = el('text', { x: 254, y: lineY - 5, class: 'gm-m2-labb', 'text-anchor': 'start' }, P1); lt.textContent = 'הקו';
  const cru = el('g', {}, P1);                                        // the crucible, tipping as it pours
  el('path', { d: 'M-26 -20 L26 -20 L20 22 L-20 22 Z', fill: '#6E6258', stroke: '#3E3630', 'stroke-width': 2 }, cru);
  el('ellipse', { cx: 0, cy: -20, rx: 26, ry: 6, fill: '#FF9B35', stroke: '#3E3630', 'stroke-width': 2 }, cru);
  const stream = el('line', { x1: 150, y1: 70, x2: 150, y2: 70, stroke: '#FFB547', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 }, P1);
  const btn = holdButton(api, 'החזק לצקת');
  const H = holdInput(svg, btn);
  let level = 0.04, lastHeld = false, phase = 'pour', tip = 0;
  K.tag('יציקת הנחושת');
  const stopLoop = loop((dt) => {
    if (phase !== 'pour') return;
    const held = H.held();
    tip = clamp(tip + (held ? dt * 5 : -dt * 4), 0, 1);
    cru.setAttribute('transform', `translate(118 44) rotate(${(tip * 58).toFixed(1)})`);
    stream.setAttribute('opacity', tip > 0.6 ? '1' : '0');
    if (held && tip > 0.6) {
      level = Math.min(1, level + dt * 0.24);
      if ((level * 100 | 0) % 7 === 0) api.haptic(4);
      if (level > LINE + 0.07) {                                      // over the line: the spill is scraped off, try again
        level = 0.5; K.sfx('crack'); api.haptic(20);
        K.say('יותר מדי: הנחושת עלתה על הקו. נסה שוב, ושחרר על הקו');
      }
    }
    const y = BOT - level * (BOT - TOP);
    molten.setAttribute('y', y.toFixed(1)); molten.setAttribute('height', (BOT - y).toFixed(1));
    stream.setAttribute('x1', 142); stream.setAttribute('y1', 66); stream.setAttribute('x2', 146); stream.setAttribute('y2', y.toFixed(1));
    if (lastHeld && !held) {
      if (Math.abs(level - LINE) <= 0.05) { phase = 'cool'; level = LINE; cool(); }
      else if (level < LINE) K.say('עוד קצת: עד הקו');
    }
    lastHeld = held;
  });
  function cool() {
    btn.remove(); stream.setAttribute('opacity', '0');
    K.sfx('settle'); api.haptic(35); K.world('fx', 'perfect', 3);
    K.say('הנחושת מתקררת…');
    K.J.tween(900, (u) => { molten.setAttribute('fill', u < 0.5 ? 'url(#gm-m2-molten)' : '#A8743A'); molten.setAttribute('opacity', (1 - 0.25 * Math.sin(u * Math.PI)).toFixed(2)); }, () => K.J.after(250, spigots));
  }
  /* phase 2: the kiyor from above, and its spigots */
  function spigots() {
    P1.remove(); phase = 'spigots';
    const P2 = el('g', {}, svg);
    el('circle', { cx: 150, cy: 150, r: 92, fill: '#B07A40', stroke: '#7A4E24', 'stroke-width': 3 }, P2);      // the bronze rim
    el('circle', { cx: 150, cy: 150, r: 78, fill: '#6FA7C8', stroke: '#8C5A2C', 'stroke-width': 2 }, P2);       // the water
    el('ellipse', { cx: 128, cy: 126, rx: 30, ry: 10, fill: 'rgba(255,255,255,.35)', transform: 'rotate(-30 128 126)' }, P2);
    const c = el('text', { x: 150, y: 156, class: 'gm-m2-labb', 'text-anchor': 'middle' }, P2); c.textContent = 'הכיור, מלמעלה';
    const R = 106; let n = 2;
    const spigot = (g, a) => {
      const x = 150 + Math.cos(a) * 96, y = 150 + Math.sin(a) * 96, x2 = 150 + Math.cos(a) * 114, y2 = 150 + Math.sin(a) * 114;
      el('line', { x1: x, y1: y, x2, y2, stroke: '#8C5A2C', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: x2, cy: y2, r: 5, fill: '#D9A45A', stroke: '#7A4E24', 'stroke-width': 1.5 }, g);
    };
    K.tag('דדים 2 / 12');
    K.say('היו לכיור רק שני דדים. הקש להוסיף');
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      if (k === 0 || k === 6) { spigot(el('g', {}, P2), a); continue; }          // the two it had
      const cx = 150 + Math.cos(a) * R, cy = 150 + Math.sin(a) * R;
      const g = tappable(P2, 'מקום לדד', () => {
        if (g.dataset.done) return;
        g.dataset.done = '1'; ring.remove(); spigot(g, a); g.classList.add('gm-m2-pop');
        n++; K.tag(`דדים ${n} / 12`);
        K.sfx('settle'); K.sfx('chime', { combo: n - 2 }); api.haptic(15); sparks(svg, cx, cy, 6, api.reduced);
        K.world('fx', n === 12 ? 'perfect' : 'normal', n);
        if (n === 12) {
          K.say('שנים עשר כהנים יכולים לקדש ידיהם ורגליהם יחד', true);
          for (let j = 0; j < 12; j++) {                                          // water from every spigot
            const b = (j / 12) * Math.PI * 2, x = 150 + Math.cos(b) * 118, y = 150 + Math.sin(b) * 118;
            el('line', { x1: x, y1: y, x2: x + Math.cos(b) * 12, y2: y + Math.sin(b) * 12 + 8, stroke: '#7FC4EA', 'stroke-width': 3, 'stroke-linecap': 'round', class: 'gm-m2-pop' }, P2);
          }
          K.J.after(1300, () => { P2.remove(); night(); });
        }
      });
      g.setAttribute('data-k', k);
      el('circle', { cx, cy, r: 19, fill: 'transparent' }, g);
      const ring = el('circle', { cx, cy, r: 13, class: 'gm-m2-ring' }, g);
    }
  }
  /* phase 3: night. Ben Katin's mukhni sinks the kiyor into the water, "שלא יהיו מימיו נפסלין בלינה" (Yoma
     3:10); the wheel's creak, the Mishnah says, was heard as far as Jericho (Tamid 3:8). Hold to turn the wheel. */
  function night() {
    phase = 'night';
    const P3 = el('g', {}, svg);
    el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#1C2436' }, P3);
    for (let k = 0; k < 14; k++) el('circle', { cx: (k * 71) % 290 + 5, cy: (k * 37) % 90 + 8, r: 1.3, fill: '#F4EBC8' }, P3);
    el('rect', { x: 60, y: 226, width: 180, height: 70, fill: '#20496A' }, P3);                                          // the well's water
    el('rect', { x: 52, y: 214, width: 8, height: 86, fill: '#6E6250' }, P3); el('rect', { x: 240, y: 214, width: 8, height: 86, fill: '#6E6250' }, P3);
    const wheel = el('g', { transform: 'translate(270 120)' }, P3);
    el('circle', { r: 26, fill: 'none', stroke: '#9A6B3E', 'stroke-width': 5 }, wheel);
    for (let k = 0; k < 4; k++) el('line', { x1: 0, y1: 0, x2: Math.cos(k * Math.PI / 4) * 26, y2: Math.sin(k * Math.PI / 4) * 26, stroke: '#9A6B3E', 'stroke-width': 3, transform: `rotate(${k * 45})` }, wheel);
    const rope = el('line', { x1: 150, y1: 30, x2: 150, y2: 70, class: 'gm-mo-rope' }, P3);
    el('line', { x1: 150, y1: 30, x2: 270, y2: 94, class: 'gm-mo-rope' }, P3);
    const basin = el('g', {}, P3);
    el('path', { d: 'M-54 0 Q-54 42 0 42 Q54 42 54 0 Z', fill: '#B07A40', stroke: '#7A4E24', 'stroke-width': 2.5 }, basin);
    el('ellipse', { cx: 0, cy: 0, rx: 54, ry: 10, fill: '#6FA7C8', stroke: '#8C5A2C', 'stroke-width': 2 }, basin);
    const surf = el('rect', { x: 60, y: 226, width: 180, height: 6, fill: 'rgba(160,200,230,.5)' }, P3);
    const btn2 = holdButton(api, 'סובב את המוכני');
    const H2 = holdInput(wheel, btn2);
    let d = 0, ang = 0, creak = 0, fin = false;
    K.tag('בלילה'); K.say('בלילה שקע הכיור במים, שלא ייפסלו בלינה. החזק כדי לסובב');
    const stop3 = loop((dt) => {
      if (fin) return;
      const held = H2.held();
      if (held) { d = Math.min(1, d + dt / 2.6); ang += dt * 140; creak -= dt; if (creak <= 0) { K.sfx('creak'); api.haptic(6); creak = 0.42; } }
      wheel.setAttribute('transform', `translate(270 120) rotate(${ang.toFixed(1)})`);
      const y = 70 + d * 190;
      basin.setAttribute('transform', `translate(150 ${y.toFixed(1)})`); rope.setAttribute('y2', y.toFixed(1));
      if (d >= 1) {
        fin = true; btn2.remove(); H2.off(); P3.appendChild(surf);
        K.sfx('chime', { combo: 6 }); api.haptic([15, 25]); K.world('fx', 'perfect', 12);
        K.say('את קול העץ של המוכני שמעו עד יריחו', true); K.finish(1400);
      }
    });
    stops.push(() => { stop3(); H2.off(); });
  }
  const stops = [];
  return () => { stopLoop(); H.off(); K.J.stop(); for (const f of stops) f(); };
}

/** Pieces to put into slots: drag one near a free slot (within snap), or tap it to send it to the next free slot.
 *  make(g) draws a piece; each is {g, P}; onSeat(slot, piece, count) after it lands; far drops fly home with a nudge. */
function slotPieces(api, K, svg, { homes, slots, make, snap = 34, big = 1, small = 1, nudge = 'קרוב יותר למקום המסומן', label = 'חלק', onSeat, fits = () => true }) {
  let count = 0;
  const all = homes.map((home, k) => {
    const g = el('g', { class: 'gm-m2-drag', tabindex: 0, role: 'button', 'aria-label': label, 'data-piece': k }, svg);
    el('circle', { r: 24, fill: 'transparent' }, g);
    const body = el('g', {}, g); make(body, k);
    const P = { k, g, body, home, x: home.x, y: home.y, s: big, busy: false, done: false };
    const put = () => { g.setAttribute('transform', `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)})`); body.setAttribute('transform', `scale(${P.s.toFixed(2)})`); };
    put();
    const fly = (x, y, sc, ms, end) => { const a = { x: P.x, y: P.y, s: P.s }; P.busy = true; K.J.tween(ms, (u) => { const e = ease(u); P.x = a.x + (x - a.x) * e; P.y = a.y + (y - a.y) * e; P.s = a.s + (sc - a.s) * e; put(); }, () => { P.busy = false; if (end) end(); }); };
    const seat = (slot) => {
      slot.piece = P; P.done = true; g.removeAttribute('tabindex'); g.style.pointerEvents = 'none';
      fly(slot.x, slot.y, small, 260, () => { count++; if (slot.ring) slot.ring.remove(); if (onSeat) onSeat(slot, P, count); });
    };
    const free = (p) => { let b = null, bd = 1e9; for (const s of slots) { if (s.piece || !fits(s, P)) continue; const d = p ? Math.hypot(s.x - p.x, s.y - p.y) : s.order || 0; if (d < bd) { bd = d; b = s; } } return { s: b, d: bd }; };
    dragger(svg, g, {
      start() { if (!P.busy && !P.done) K.sfx('ui'); },
      move(p) { if (P.busy || P.done) return; P.x = p.x; P.y = p.y; P.s = small + (big - small) * clamp((p.y - 40) / 230, 0, 1); put(); },
      end(p, moved) {
        if (P.busy || P.done) return;
        if (moved < 8) { const f = free(null); if (f.s) seat(f.s); return; }
        const n = free(p);
        if (n.s && n.d < snap) seat(n.s);
        else { K.say(nudge); K.sfx('ui'); fly(home.x, home.y, big, 240); }
      },
    });
    g.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !P.done && !P.busy) { e.preventDefault(); const f = free(null); if (f.s) seat(f.s); } });
    return P;
  });
  return all;
}

/* ───────── המלתראות וגפן הזהב (ulam): five lintels over the Ulam's opening (Middot 3:7), then the golden vine (3:8) ─────────
 * The opening is 20 amot wide; the lowest lintel overhangs it by an amah on each side (22), each one above overhangs
 * the one below by an amah on each side, so the top one is 30; a course of stones between each two. Drop each lintel
 * when it swings centred. Then hang a leaf, a grape and a cluster on the vine over the Heichal's door, as every
 * volunteer did ("כָּל מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ"). */
function ulam(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'פתח האולם וחמש המלתראות שמעליו' }, api.play);
  const A = 6, CX = 150, OPEN = 20 * A;                              // one amah = 6 units
  const P1 = el('g', {}, svg);
  el('rect', { x: 0, y: 0, width: 300, height: 300, fill: 'rgba(255,255,255,.12)' }, P1);
  // the façade's two sides and the top of the opening (dark: the hall behind)
  const baseY = 262;
  el('rect', { x: CX - OPEN / 2, y: 206, width: OPEN, height: 94, fill: '#3A2E22' }, P1);
  for (const s of [-1, 1]) el('rect', { x: s < 0 ? 0 : CX + OPEN / 2, y: 206, width: CX - OPEN / 2, height: 94, class: 'gm-m2-stone' }, P1);
  const lt = el('text', { x: CX, y: 250, class: 'gm-m2-lab', 'text-anchor': 'middle', fill: '#EFE3C8' }, P1); lt.textContent = 'הפתח: עשרים אמה'; lt.style.fill = '#EFE3C8';
  const stack = el('g', {}, P1);
  let n = 0, topY = 206;
  const LH = 12, CH = 7;                                               // a lintel's height, a stone course's height (drawn)
  const mk = (w) => { const g = el('g', {}, P1); el('rect', { x: -w / 2, y: -LH, width: w, height: LH, rx: 2, fill: '#9A6B3E', stroke: '#5E3E1E', 'stroke-width': 1.5 }, g); el('path', { d: `M${-w / 2 + 4} ${-LH / 2} H${w / 2 - 4}`, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1.2 }, g); const t = el('text', { x: 0, y: -3, class: 'gm-m2-lab', 'text-anchor': 'middle' }, g); t.textContent = `${w / A} אמה`; t.style.fill = '#FFF1D6'; return g; };
  let cur = null, curW = 0, t = 0, busy = false, x = CX, done1 = false;
  const rope = el('line', { x1: CX, y1: 0, x2: CX, y2: 30, class: 'gm-mo-rope' }, P1);
  const next = () => {
    curW = (22 + 2 * n) * A; cur = mk(curW); cur.setAttribute('data-swing', n); busy = false; t = Math.random() * 3;
    K.tag(`מלתרא ${n + 1} / 5`);
  };
  next();
  const drop = el('g', {}, api.play);
  const row = document.createElement('div'); row.className = 'gm-m2-row';
  row.innerHTML = '<button type="button" class="gm-btn gm-btn-gold" data-a="drop">הורד</button>';
  api.play.appendChild(row);
  const dropBtn = row.querySelector('button');
  const tryDrop = () => {
    if (busy || done1 || !cur) return;
    busy = true;
    const off = x - CX, ok = Math.abs(off) <= A * 0.9, y0 = 40, y1 = topY;
    K.sfx('creak');
    K.J.tween(380, (u) => { cur.setAttribute('transform', `translate(${x.toFixed(1)} ${(y0 + (y1 - y0) * ease(u)).toFixed(1)})`); rope.setAttribute('y2', (y0 + (y1 - y0) * ease(u) - LH).toFixed(1)); rope.setAttribute('x1', x.toFixed(1)); rope.setAttribute('x2', x.toFixed(1)); }, () => {
      if (!ok) {
        K.sfx('settle'); api.haptic(20); cur.classList.add('gm-m2-shake');
        K.say('לא במרכז. הקש כשהעודף שווה משני הצדדים');
        K.J.tween(360, (u) => { cur.setAttribute('transform', `translate(${x.toFixed(1)} ${(y1 + (y0 - y1) * ease(u)).toFixed(1)})`); }, () => { cur.classList.remove('gm-m2-shake'); busy = false; });
        return;
      }
      // seated, centred: the next course of stones goes on top of it
      cur.setAttribute('transform', `translate(${CX} ${topY})`); cur.removeAttribute('data-swing'); stack.appendChild(cur);
      K.sfx('settle'); K.sfx('chime', { combo: n + 2 }); api.haptic(30); sparks(svg, CX + curW / 2, topY - 6, 5, api.reduced); sparks(svg, CX - curW / 2, topY - 6, 5, api.reduced);
      K.world('fx', n === 4 ? 'perfect' : 'normal', n + 1);
      topY -= LH; n++;
      if (n === 1) { const a = el('text', { x: CX, y: topY + LH + 22, class: 'gm-m2-labb', 'text-anchor': 'middle' }, stack); a.textContent = 'אמה מזה ואמה מזה'; a.style.fill = '#FFE7A8'; }
      if (n < 5) {
        el('rect', { x: CX - curW / 2 - A / 2, y: topY - CH, width: curW + A, height: CH, class: 'gm-m2-stone2' }, stack);   // נדבך של אבנים
        topY -= CH; K.say('נדבך של אבנים, ועליו המלתרא הבאה'); next();
      } else { done1 = true; row.remove(); rope.remove(); K.say('חמש מלתראות: העליונה שלושים אמה', true); K.J.after(1100, vine); }
    });
  };
  dropBtn.addEventListener('click', tryDrop);
  svg.addEventListener('pointerdown', (e) => { if (!done1 && !e.target.closest('.gm-m2-drag')) tryDrop(); });
  const stopLoop = loop((dt) => {
    if (busy || done1 || !cur) return;
    t += dt * (1.3 + n * 0.22);
    x = CX + Math.sin(t) * 44;
    cur.setAttribute('transform', `translate(${x.toFixed(1)} 40)`);
    rope.setAttribute('x1', x.toFixed(1)); rope.setAttribute('x2', x.toFixed(1)); rope.setAttribute('y2', 28);
  });
  /* phase 2: the vine over the Heichal's door, on cedar poles */
  function vine() {
    P1.remove();
    const P2 = el('g', {}, svg);
    el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#E9DDC4' }, P2);
    el('rect', { x: 100, y: 120, width: 100, height: 140, fill: '#C9A24A', stroke: '#8C6A20', 'stroke-width': 2 }, P2);     // the Heichal's door (gold)
    el('path', { d: 'M150 120 V260', stroke: '#8C6A20', 'stroke-width': 2 }, P2);
    const dl = el('text', { x: 150, y: 200, class: 'gm-m2-lab', 'text-anchor': 'middle' }, P2); dl.textContent = 'פתחו של היכל';
    for (const y of [70, 96]) el('rect', { x: 40, y, width: 220, height: 6, rx: 3, fill: '#8A5A2E' }, P2);                    // the cedar poles (כלונסות)
    el('path', { d: 'M52 104 C80 60 110 118 150 76 C190 40 214 112 250 70', fill: 'none', stroke: '#C9A227', 'stroke-width': 6, 'stroke-linecap': 'round' }, P2);
    for (const [x, y] of [[70, 86], [96, 96], [124, 90], [176, 64], [206, 84], [232, 88]]) el('path', { d: `M${x} ${y} q8 -12 16 0 q-8 10 -16 0z`, fill: '#E2B93B', stroke: '#9C7A18', 'stroke-width': 1 }, P2);
    const note = el('text', { x: 150, y: 290, class: 'gm-m2-lab', 'text-anchor': 'middle' }, P2);
    const vn = api.world && typeof api.world.vineN === 'number' ? api.world.vineN : null;
    note.textContent = vn ? `בגפן שלך כבר ${vn} עלים מן המשימות היומיות` : 'כל מי שהתנדב הביא ותלה';
    const kinds = ['עלה', 'גרגיר', 'אשכול'];
    const slots = [[112, 104], [150, 80], [190, 100]].map(([x, y], i) => ({ x, y, order: i, ring: el('circle', { cx: x, cy: y, r: 16, class: 'gm-m2-ring' }, P2) }));
    const draw = (g, k) => {
      if (k === 0) el('path', { d: 'M-10 0 q10 -16 20 0 q-10 13 -20 0z', fill: '#E7BF3E', stroke: '#9C7A18', 'stroke-width': 1.2 }, g);
      else if (k === 1) el('circle', { r: 6, fill: '#E7BF3E', stroke: '#9C7A18', 'stroke-width': 1.2 }, g);
      else for (const [dx, dy] of [[-6, -6], [0, -6], [6, -6], [-3, 0], [3, 0], [0, 6]]) el('circle', { cx: dx, cy: dy, r: 4.2, fill: '#E7BF3E', stroke: '#9C7A18', 'stroke-width': 1 }, g);
    };
    el('rect', { x: 20, y: 214, width: 260, height: 58, rx: 12, class: 'gm-m2-tray' }, P2);
    kinds.forEach((kname, k) => { const t = el('text', { x: 80 + k * 70, y: 266, class: 'gm-m2-labb', 'text-anchor': 'middle' }, P2); t.textContent = kname; });
    K.tag('גפן הזהב');
    K.say('תלה בגפן עלה, גרגיר ואשכול, כמו כל מתנדב');
    slotPieces(api, K, svg, {
      homes: [0, 1, 2].map((k) => ({ x: 80 + k * 70, y: 238 })), slots, make: draw, big: 1.6, small: 1.1, label: 'תרומה לגפן',
      nudge: 'קרוב יותר לגפן, אל אחד המקומות הזוהרים',
      onSeat(slot, P, c) {
        K.sfx('chime', { combo: 3 + c * 2 }); K.sfx('leaf'); api.haptic(15); sparks(svg, slot.x, slot.y, 8, api.reduced);
        K.world('momentFX', 'gold', 'ulam');
        if (c === 3) { K.say('גפן הזהב תלויה על פתח ההיכל', true); K.finish(900); }
      },
    });
  }
  return () => { stopLoop(); K.J.stop(); };
}

/* ───────── בלי ברזל (yesod): a tool that is not iron, and only whole stones (Middot 3:4) ─────────
 * "שֶׁהַבַּרְזֶל פּוֹסֵל בִּנְגִיעָה. וּבִפְגִימָה לְכָל דָּבָר. נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה וְכֻלָּן כְּשֵׁרוֹת".
 * First pick the tool (the iron ones are refused with the reason); the builder's tool in the world becomes wood.
 * Then six unhewn field stones from Beit Kerem, one at a time: lay the whole ones, set aside the chipped ones. */
function yesod(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'כלי העבודה ואבני המזבח' }, api.play);
  const P1 = el('g', {}, svg);
  const tl = el('text', { x: 150, y: 44, class: 'gm-m2-labb', 'text-anchor': 'middle' }, P1); tl.textContent = 'במה בונים את המזבח?';
  const TOOLS = [
    { id: 'iron', n: 'פטיש ברזל', draw: (g) => { el('rect', { x: -5, y: -10, width: 10, height: 74, rx: 4, fill: '#8A5A2E' }, g); el('rect', { x: -26, y: -30, width: 52, height: 24, rx: 4, fill: '#7D8288', stroke: '#4C5056', 'stroke-width': 2 }, g); } },
    { id: 'wood', n: 'מקבת עץ', draw: (g) => { el('rect', { x: -5, y: -10, width: 10, height: 74, rx: 4, fill: '#8A5A2E' }, g); el('rect', { x: -28, y: -34, width: 56, height: 30, rx: 10, fill: '#B98552', stroke: '#6E4722', 'stroke-width': 2 }, g); for (const x of [-16, 0, 16]) el('line', { x1: x, y1: -30, x2: x, y2: -8, stroke: 'rgba(90,56,26,.35)', 'stroke-width': 1.5 }, g); } },
    { id: 'trowel', n: 'כפיס של ברזל', draw: (g) => { el('rect', { x: -5, y: 22, width: 10, height: 42, rx: 4, fill: '#8A5A2E' }, g); el('path', { d: 'M0 22 L0 8 L-26 -30 L26 -30 L0 8', fill: '#8C9096', stroke: '#4C5056', 'stroke-width': 2 }, g); } },
  ];
  let picked = false;
  TOOLS.forEach((T, k) => {
    const x = 60 + k * 90, g = tappable(P1, T.n, () => pick(T, g), '');
    g.setAttribute('data-tool', T.id);
    el('rect', { x: x - 42, y: 70, width: 84, height: 160, rx: 14, fill: 'rgba(255,255,255,.35)', stroke: 'rgba(120,96,60,.35)', 'stroke-width': 1.5, class: 'gm-m2-ring', style: 'animation:none;stroke-dasharray:none' }, g);
    const d = el('g', { transform: `translate(${x} 140)` }, g); T.draw(d);
    const t = el('text', { x, y: 222, class: 'gm-m2-labb', 'text-anchor': 'middle' }, g); t.textContent = T.n;
  });
  K.tag('בחר כלי');
  function pick(T, g) {
    if (picked) return;
    if (T.id !== 'wood') {
      g.classList.remove('gm-m2-shake'); void g.getBBox(); g.classList.add('gm-m2-shake');
      K.sfx('crack'); api.haptic(25);
      K.say(T.id === 'trowel' ? 'לא סדו את המזבח בכפיס של ברזל, שמא יגע ויפסול' : 'ברזל פוסל בנגיעה: אסור שיגע באבני המזבח');
      return;
    }
    picked = true; K.sfx('chime', { combo: 4 }); api.haptic(25); sparks(svg, 150, 110, 8, api.reduced);
    K.world('tool', 'wood');
    K.say('מקבת עץ. עכשיו האבנים', true);
    K.J.after(800, stones);
  }
  /* phase 2: the stones */
  function stones() {
    P1.remove();
    const P2 = el('g', {}, svg);
    // the altar's base course, seen from the side: four seats
    el('rect', { x: 20, y: 70, width: 260, height: 42, rx: 4, class: 'gm-m2-stone2' }, P2);
    const lab = el('text', { x: 150, y: 128, class: 'gm-m2-lab', 'text-anchor': 'middle' }, P2); lab.textContent = 'יסוד המזבח';
    const seats = [0, 1, 2, 3].map((k) => ({ x: 55 + k * 63, y: 91 }));
    for (const s of seats) el('ellipse', { cx: s.x, cy: s.y, rx: 27, ry: 17, fill: 'rgba(74,58,38,.25)', stroke: '#C9A227', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, P2);
    const rej = el('g', {}, P2);
    const rl = el('text', { x: 266, y: 60, class: 'gm-m2-lab', 'text-anchor': 'middle' }, P2); rl.textContent = 'פסולות';
    const LIST = [false, true, false, false, true, false];               // chipped?
    let i = 0, laid = 0, rejected = 0, busy = false, cur = null;
    const drawStone = (chipped, k) => {
      const g = el('g', {}, P2);
      const r = 26 + (k % 3) * 3, wob = (a) => r * (1 + 0.1 * Math.sin(a * 3 + k) + 0.06 * Math.cos(a * 5 + k * 2));
      let d = '';
      for (let a = 0; a < 6.3; a += 0.35) { const rr = wob(a); d += `${d ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr * 0.78).toFixed(1)}`; }
      el('path', { d: d + 'Z', fill: ['#D9D2C2', '#CFC6B2', '#DDD5C0'][k % 3], stroke: '#9C927E', 'stroke-width': 2 }, g);
      el('ellipse', { cx: -8, cy: -8, rx: 10, ry: 5, fill: 'rgba(255,255,255,.35)' }, g);
      if (chipped) { el('path', { d: `M${r * 0.5} ${-r * 0.62} L${r * 0.18} ${-r * 0.2} L${r * 0.78} ${-r * 0.1} Z`, fill: '#B8AE98', stroke: '#6F6552', 'stroke-width': 1.5 }, g); el('path', { d: `M${r * 0.18} ${-r * 0.2} l-9 12 l4 5`, fill: 'none', stroke: '#6F6552', 'stroke-width': 1.3 }, g); }
      return g;
    };
    const show = () => {
      if (i >= LIST.length) return;
      cur = drawStone(LIST[i], i); cur.setAttribute('data-stone', LIST[i] ? 'chipped' : 'whole');
      const y = 196; busy = true;
      K.J.tween(300, (u) => { cur.setAttribute('transform', `translate(${(-40 + 190 * ease(u)).toFixed(1)} ${y}) scale(1.7)`); }, () => { busy = false; cur.setAttribute('data-ready', '1'); });
      K.tag(`אבן ${i + 1} / ${LIST.length}`); K.sfx('creak');
    };
    const row = document.createElement('div'); row.className = 'gm-m2-row';
    row.innerHTML = '<button type="button" class="gm-btn" data-a="reject">לפסול</button><button type="button" class="gm-btn gm-btn-gold" data-a="lay">להניח במזבח</button>';
    api.play.appendChild(row);
    const act = (lay) => {
      if (busy || !cur || i >= LIST.length) return;
      const chipped = LIST[i];
      if (lay === chipped) {                                                 // wrong: explain, and the same stone again
        cur.classList.remove('gm-m2-shake'); void cur.getBBox(); cur.classList.add('gm-m2-shake'); api.haptic(20); K.sfx('ui');
        K.say(chipped ? 'האבן פגומה. "נִפְגְּמָה אַחַת מֵהֶן, הִיא פְסוּלָה"' : 'האבן שלמה. אפשר להניח אותה');
        return;
      }
      busy = true; const g = cur; cur = null;
      if (lay) {
        const s = seats[laid++];
        K.J.tween(320, (u) => { const e = ease(u); g.setAttribute('transform', `translate(${(150 + (s.x - 150) * e).toFixed(1)} ${(196 + (s.y - 196) * e).toFixed(1)}) scale(${(1.7 - 0.7 * e).toFixed(2)})`); }, () => {
          K.sfx('settle'); api.haptic(25); K.world('fx', 'normal', laid); sparks(svg, s.x, s.y - 10, 5, api.reduced); next();
        });
        K.say('אבן שלמה, למזבח', true);
      } else {
        rejected++;
        K.J.tween(320, (u) => { const e = ease(u); g.setAttribute('transform', `translate(${(150 + (116 + rejected * 3) * e).toFixed(1)} ${(196 - (160 + rejected * 4) * e - Math.sin(u * Math.PI) * 30).toFixed(1)}) scale(${(1.7 - 1.2 * e).toFixed(2)}) rotate(${(e * 40).toFixed(0)})`); }, () => { rej.appendChild(g); K.sfx('crack'); api.haptic(10); next(); });
        K.say('פגומה: פסולה, וכל השאר כשרות');
      }
    };
    const next = () => {
      i++; busy = false;
      if (i < LIST.length) { show(); return; }
      row.remove(); K.tag(`${laid} שלמות · ${rejected} פסולות`);
      K.sfx('chime', { combo: 7 }); K.say('רק אבנים שלמות עלו למזבח', true); K.finish(900);
    };
    row.querySelector('[data-a="lay"]').addEventListener('click', () => act(true));
    row.querySelector('[data-a="reject"]').addEventListener('click', () => act(false));
    K.say('אבן שלמה: להניח. אבן פגומה: לפסול');
    show();
  }
  return () => { K.J.stop(); };
}

/* ───────── הבית בזהב (heichal): polish the gold inside (Middot 4:1), then the façade at sunrise ─────────
 * "שֶׁכָּל הַבַּיִת טוּחַ בְּזָהָב, חוּץ מֵאַחַר הַדְּלָתוֹת": rub each plate until it shines; the wall behind the open
 * door stays stone (rubbing there explains why). Then raise the sun: the façade turns gold and white, "like a
 * mountain covered with snow" (Josephus, War 5.5.6, in a free translation, on the card). */
function heichal(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'קיר ההיכל מבפנים: לוחות זהב לצחצוח' }, api.play);
  const defs = el('defs', {}, svg);
  const gg = el('linearGradient', { id: 'gm-m2-gold', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  el('stop', { offset: '0', 'stop-color': '#FFF0A8' }, gg); el('stop', { offset: '.45', 'stop-color': '#E7B93A' }, gg); el('stop', { offset: '1', 'stop-color': '#A87414' }, gg);
  const P1 = el('g', {}, svg);
  el('rect', { x: 10, y: 22, width: 280, height: 238, rx: 4, fill: '#CBBFA6', stroke: '#9C8E72', 'stroke-width': 2 }, P1);   // the wall's stone
  // the inner door, opened back against the wall: behind it, no gold
  el('rect', { x: 226, y: 36, width: 56, height: 214, fill: '#B9AE95' }, P1);
  const door = el('g', { 'data-door': '1' }, P1);
  el('rect', { x: 230, y: 40, width: 48, height: 206, rx: 3, fill: '#8A5A2E', stroke: '#5C3A1C', 'stroke-width': 2 }, door);
  for (const y of [62, 140, 218]) el('rect', { x: 238, y: y - 14, width: 32, height: 44, rx: 2, fill: 'none', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1.5 }, door);
  const dl = el('text', { x: 254, y: 272, class: 'gm-m2-lab', 'text-anchor': 'middle' }, P1); dl.textContent = 'אחר הדלת';
  const plates = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const x = 18 + c * 51, y = 30 + r * 112, w = 47, h = 104;
    const g = el('g', { 'data-plate': r * 4 + c }, P1);
    el('rect', { x, y, width: w, height: h, rx: 2, fill: 'url(#gm-m2-gold)', stroke: '#8C6A20', 'stroke-width': 1.2 }, g);
    const dull = el('rect', { x, y, width: w, height: h, rx: 2, fill: '#7A6440' }, g);
    const streak = el('path', { d: `M${x + 6} ${y + h - 10} L${x + w - 10} ${y + 8}`, stroke: '#FFFBE0', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 }, g);
    plates.push({ x, y, w, h, g, dull, streak, v: 0, done: false });
  }
  let shone = 0, last = null, tick = 0, doorSaid = 0, phase = 'polish';
  K.tag('לוחות 0 / 8');
  const rub = (p) => {
    if (phase !== 'polish') return;
    const d = last ? Math.min(40, Math.hypot(p.x - last.x, p.y - last.y)) : 0; last = p;
    if (p.x > 226 && p.y > 36 && p.y < 250) { if (d > 0 && performance.now() - doorSaid > 1500) { doorSaid = performance.now(); K.say('חוץ מאחר הדלתות: שם לא היה זהב'); K.sfx('ui'); api.haptic(10); } return; }
    const P = plates.find((q) => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h);
    if (!P || P.done) return;
    P.v = Math.min(1, P.v + d / 200);
    P.dull.setAttribute('opacity', (1 - P.v).toFixed(2));
    tick += d; if (tick > 45) { tick = 0; K.sfx('ui'); api.haptic(4); if (!api.reduced && Math.random() < 0.5) sparks(svg, p.x, p.y, 3); }
    if (P.v >= 1) {
      P.done = true; shone++;
      P.streak.setAttribute('opacity', '0.8'); P.g.classList.add('gm-m2-pop');
      K.sfx('chime', { combo: shone }); api.haptic(18); sparks(svg, P.x + P.w / 2, P.y + P.h / 2, 8, api.reduced);
      K.tag(`לוחות ${shone} / 8`);
      if (shone === 8) { K.world('momentFX', 'gold', 'heichal'); K.say('כל הבית טוח בזהב, חוץ מאחר הדלתות', true); phase = 'gap'; K.J.after(1300, sunrise); }
    }
  };
  let down = false;
  svg.addEventListener('pointerdown', (e) => { if (phase !== 'polish') return; down = true; last = svgPt(svg, e); try { svg.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } e.preventDefault(); rub(last); });
  svg.addEventListener('pointermove', (e) => { if (down) rub(svgPt(svg, e)); });
  const up = () => { down = false; last = null; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  // keyboard: each Enter polishes the next plate a quarter of the way
  svg.setAttribute('tabindex', 0);
  svg.addEventListener('keydown', (e) => { if (phase !== 'polish' || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); const P = plates.find((q) => !q.done); if (P) { last = { x: P.x + 5, y: P.y + 5 }; rub({ x: P.x + 5 + 65, y: P.y + 5 }); } });
  /* phase 2: the façade at sunrise */
  function sunrise() {
    P1.remove(); phase = 'sun';
    const P2 = el('g', {}, svg);
    const sky = el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#1E2A44' }, P2);
    const hill = el('path', { d: 'M0 250 Q80 226 150 232 Q230 238 300 222 L300 300 L0 300 Z', fill: '#3A3226' }, P2);
    // the House's front (schematic, after the four columns of the Bar Kokhba coin as in the world): white stone,
    // gold on its face, the opening with the lintels above it; the courts' walls in front
    const F = el('g', {}, P2);
    const white = [], gold = [];
    white.push(el('rect', { x: 52, y: 62, width: 180, height: 176, fill: '#5A6378' }, F));
    for (let k = 0; k < 13; k++) gold.push(el('path', { d: `M${56 + k * 14} 62 l3 -9 l3 9 z`, fill: '#6B6A60' }, F));        // the parapet's spikes
    gold.push(el('rect', { x: 52, y: 62, width: 180, height: 14, fill: '#6B6A60' }, F));                                     // the frieze
    for (const x of [66, 98, 178, 210]) { white.push(el('rect', { x: x - 5, y: 84, width: 10, height: 148, fill: '#5A6378', stroke: 'rgba(90,80,60,.28)', 'stroke-width': 1.2 }, F)); gold.push(el('rect', { x: x - 8, y: 80, width: 16, height: 8, fill: '#6B6A60' }, F)); }
    for (let k = 0; k < 5; k++) gold.push(el('rect', { x: 142 - 11 - k * 2.2, y: 146 - k * 8, width: 22 + k * 4.4, height: 5, fill: '#6B6A60' }, F));   // the five lintels
    el('rect', { x: 131, y: 150, width: 22, height: 82, fill: '#231C14' }, F);                                                // the opening
    gold.push(el('path', { d: 'M126 150 C132 142 138 156 142 148 C148 140 152 156 158 148', fill: 'none', stroke: '#6B6A60', 'stroke-width': 3 }, F));   // the vine
    const wall = el('rect', { x: 0, y: 214, width: 300, height: 30, fill: '#4A4638' }, P2);                                   // the courts' walls
    const glow = el('rect', { x: 44, y: 50, width: 196, height: 196, fill: '#FFE9A8', opacity: 0, style: 'mix-blend-mode:screen' }, F);
    const sheen = el('rect', { x: -60, y: 40, width: 40, height: 220, fill: 'rgba(255,255,255,.55)', transform: 'skewX(-20)', opacity: 0 }, F);
    const snow = el('text', { x: 142, y: 272, class: 'gm-m2-labb', 'text-anchor': 'middle', opacity: 0 }, P2); snow.textContent = 'כהר מכוסה שלג';
    snow.style.fill = '#FFFFFF'; snow.style.fontSize = '17px'; snow.style.paintOrder = 'stroke'; snow.style.stroke = 'rgba(40,30,20,.55)'; snow.style.strokeWidth = '3px';
    // the sun on its track (the right edge): drag it up
    el('rect', { x: 262, y: 40, width: 10, height: 200, rx: 5, fill: 'rgba(255,255,255,.25)' }, P2);
    const sun = el('g', { class: 'gm-m2-drag', tabindex: 0, role: 'slider', 'aria-label': 'השמש עולה', 'data-sun': '1' }, P2);
    el('circle', { r: 26, fill: 'transparent' }, sun);
    el('circle', { r: 14, fill: '#FFC24A', stroke: '#FFF2B8', 'stroke-width': 3 }, sun);
    let u = 0, fin = false;
    const mix = (a, b, t) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
    const paint = () => {
      sun.setAttribute('transform', `translate(267 ${(236 - u * 190).toFixed(1)})`);
      sky.setAttribute('fill', u < 0.5 ? mix('#1E2A44', '#E9A07A', u * 2) : mix('#E9A07A', '#BFE0F4', (u - 0.5) * 2));
      hill.setAttribute('fill', mix('#3A3226', '#8C7A58', u));
      for (const w of white) w.setAttribute('fill', mix('#5A6378', '#FBFAF6', clamp(u * 1.3, 0, 1)));
      for (const g of gold) g.setAttribute(g.tagName === 'path' && g.getAttribute('fill') === 'none' ? 'stroke' : 'fill', mix('#6B6A60', '#F2C23E', clamp(u * 1.2, 0, 1)));
      wall.setAttribute('fill', mix('#4A4638', '#E6DCC6', u));
      sheen.setAttribute('opacity', u > 0.6 && u < 1 ? '1' : '0'); sheen.setAttribute('x', (-60 + (u - 0.6) / 0.4 * 420).toFixed(0));
      glow.setAttribute('opacity', (clamp((u - 0.55) / 0.45, 0, 1) * 0.12).toFixed(2));
      snow.setAttribute('opacity', clamp((u - 0.8) / 0.2, 0, 1).toFixed(2));
    };
    paint();
    K.tag('זריחה');
    K.say('גרור את השמש למעלה');
    let lastStep = 0;
    const set = (v) => {
      if (fin) return;
      u = clamp(v, 0, 1); paint();
      const st = Math.floor(u * 8); if (st !== lastStep) { lastStep = st; K.sfx('chime', { combo: st + 1 }); api.haptic(5); }
      if (u >= 0.96) {
        fin = true; u = 1; paint();
        K.sfx('fanfare'); api.haptic([20, 30, 50]); sparks(svg, 145, 90, 14, api.reduced);
        K.world('momentFX', 'gold', 'heichal');
        K.say('ההיכל בוהק באור הבוקר', true); K.finish(1200);
      }
    };
    dragger(svg, sun, { move: (p) => set((236 - p.y) / 190), end: (p, moved) => { if (moved < 8) set(u + 0.25); } });
    sun.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(u + 0.1); } });
  }
  return () => { K.J.stop(); };
}

/* ───────── שבעת השערים (gates): each gate's name to its side of the azara (Middot 1:4–5) ─────────
 * "שִׁבְעָה שְׁעָרִים הָיוּ בָעֲזָרָה, שְׁלשָׁה בַצָּפוֹן וּשְׁלשָׁה בַדָּרוֹם וְאֶחָד בַּמִּזְרָח". The plan faces west (the House
 * at the top, Nikanor at the bottom; north on the right). Tap the wall a gate stands in; it flies to its place there.
 * A wrong wall answers with the Mishnah's words for that gate. The order inside each side follows the world
 * (temple.js), which is an illustration choice (the card says so). */
function gates(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'תכנית העזרה: חומת צפון, חומת דרום וחומת מזרח' }, api.play);
  const X0 = 78, X1 = 222, Y0 = 34, Y1 = 250;                         // the azara, west at the top: 135 wide (N–S), 187 long (E–W)
  el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: '#E7DBC1', stroke: '#A8916A', 'stroke-width': 6 }, svg);
  el('rect', { x: 124, y: Y0 + 14, width: 52, height: 64, rx: 2, fill: '#E9C766', stroke: '#9C7A18', 'stroke-width': 1.5 }, svg);   // the House
  el('rect', { x: 136, y: 150, width: 28, height: 28, fill: '#D9D2C2', stroke: '#9C927E', 'stroke-width': 1.5 }, svg);          // the altar
  const lab = (x, y, t, c = 'gm-m2-lab', rot = 0) => { const e = el('text', { x, y, class: c, 'text-anchor': 'middle' }, svg); e.textContent = t; if (rot) e.setAttribute('transform', `rotate(${rot} ${x} ${y})`); return e; };
  lab(150, Y0 + 50, 'הבית'); lab(150, 168, 'מזבח');
  lab(150, 24, 'מערב'); lab(150, 292, 'מזרח', 'gm-m2-labb'); lab(261, 24, 'צפון', 'gm-m2-labb'); lab(39, 24, 'דרום', 'gm-m2-labb');
  // the gates, as in the world (fractions of the length from the west)
  const L = (Y1 - Y0);
  const G = [
    { n: 'שער המים', side: 'S', f: 0.797, why: 'שער המים בדרום: בו הכניסו את צלוחית המים לניסוך בחג (מדות ב, ו)' },
    { n: 'שער הניצוץ', side: 'N', f: 0.797, why: '"וְשֶׁבַּצָּפוֹן, שַׁעַר הַנִּיצוֹץ" (מדות א, ה)' },
    { n: 'שער ניקנור', side: 'E', f: 0.5, why: '"שֶׁבַּמִּזְרָח, שַׁעַר נִקָּנוֹר" (מדות א, ד)' },
    { n: 'שער הדלק', side: 'S', f: 0.144, why: '"שֶׁבַּדָּרוֹם, שַׁעַר הַדֶּלֶק" (מדות א, ד)' },
    { n: 'שער הקרבן', side: 'N', f: 0.492, why: 'בצפון: "שֵׁנִי לוֹ, שַׁעַר הַקָּרְבָּן" (מדות א, ה)' },
    { n: 'שער הבכורות', side: 'S', f: 0.369, why: 'בדרום: "שֵׁנִי לוֹ, שַׁעַר הַבְּכוֹרוֹת" (מדות א, ד)' },
    { n: 'בית המוקד', side: 'N', f: 0.144, why: 'בצפון: "שְׁלִישִׁי לוֹ, בֵּית הַמּוֹקֵד" (מדות א, ה)' },
  ];
  const at = (g) => g.side === 'E' ? { x: 150, y: Y1 } : { x: g.side === 'N' ? X1 : X0, y: Y0 + g.f * L };
  for (const g of G) { const p = at(g); el('rect', { x: p.x - (g.side === 'E' ? 9 : 5), y: p.y - (g.side === 'E' ? 5 : 9), width: g.side === 'E' ? 18 : 10, height: g.side === 'E' ? 10 : 18, fill: '#6E5A3E' }, svg); }
  // the three walls to tap (big strips)
  const zone = (side, x, y, w, h, label) => { const z = tappable(svg, label, () => choose(side), ''); z.setAttribute('data-side', side); el('rect', { x, y, width: w, height: h, fill: 'transparent' }, z); return z; };
  zone('S', 0, Y0 - 6, X0 + 16, Y1 - Y0 + 12, 'חומת הדרום'); zone('N', X1 - 16, Y0 - 6, 300 - X1 + 16, Y1 - Y0 + 12, 'חומת הצפון'); zone('E', X0 - 10, Y1 - 16, X1 - X0 + 20, 300 - Y1 + 16, 'חומת המזרח');
  // the name card waiting to be placed
  const chip = el('g', { 'data-chip': '1', 'pointer-events': 'none' }, svg);
  const chipBg = el('rect', { x: -52, y: -15, width: 104, height: 30, rx: 15, fill: '#FFF8E6', stroke: '#C9A227', 'stroke-width': 2 }, chip);
  const chipT = el('text', { x: 0, y: 5, class: 'gm-m2-labb', 'text-anchor': 'middle' }, chip);
  let i = 0, busy = false, placed = 0;
  const show = () => {
    const g = G[i]; chipT.textContent = g.n; chip.setAttribute('data-side', g.side);
    chip.setAttribute('transform', 'translate(150 118) scale(1.25)'); chip.classList.remove('gm-m2-pop'); void chip.getBBox(); chip.classList.add('gm-m2-pop');
    K.tag(`שער ${i + 1} / 7`);
  };
  K.say('באיזו חומה עומד השער? הקש עליה');
  show();
  function choose(side) {
    if (busy || i >= G.length) return;
    const g = G[i];
    if (side !== g.side) { chip.classList.remove('gm-m2-shake'); void chip.getBBox(); chip.classList.add('gm-m2-shake'); api.haptic(20); K.sfx('ui'); K.say(g.why); return; }
    busy = true; const p = at(g);
    const tx = g.side === 'E' ? 150 : g.side === 'N' ? 261 : 39, ty = g.side === 'E' ? Y1 + 16 : p.y;       // the name outside its wall
    K.J.tween(300, (u) => { const e = ease(u); chip.setAttribute('transform', `translate(${(150 + (tx - 150) * e).toFixed(1)} ${(118 + (ty - 118) * e).toFixed(1)}) scale(${(1.25 - 0.45 * e).toFixed(2)})`); }, () => {
      // the name stays by its gate
      const t = el('text', { x: tx, y: ty + 4, class: 'gm-m2-labb', 'text-anchor': 'middle' }, svg); t.textContent = g.n; t.style.fontSize = '10px';
      el('rect', { x: p.x - (g.side === 'E' ? 9 : 5), y: p.y - (g.side === 'E' ? 5 : 9), width: g.side === 'E' ? 18 : 10, height: g.side === 'E' ? 10 : 18, fill: '#E8B531', class: 'gm-m2-pop' }, svg);
      sparks(svg, p.x, p.y, 6, api.reduced);
      placed++; K.sfx('settle'); K.sfx('chime', { combo: placed }); api.haptic(18); K.world('fx', placed === 7 ? 'perfect' : 'normal', placed);
      i++; busy = false;
      if (i < G.length) { K.say(placed === 1 ? 'נכון! והשער הבא?' : 'נכון!', true); show(); }
      else { chip.remove(); K.tag('7 / 7'); K.say('שלושה בצפון, שלושה בדרום ואחד במזרח', true); K.finish(1000); }
    });
  }
  return () => { K.J.stop(); };
}

/* ───────── הסערה והמעלות (nikanor): the storm at sea (Bavli Yoma 38a), then the fifteen steps (Middot 2:5) ─────────
 * The sailors threw one door into the sea; when they came for the second, Nikanor held it: "הטילוני עמה" (in plain Hebrew "השליכו אותי איתה"), and
 * the sea rested. Hold the door until the sea is calm (letting go only lets the waves rise a little). Then lay the
 * fifteen steps from Ezrat Nashim up to the gate, "מֻקָּפוֹת כַּחֲצִי גֹרֶן עֲגֻלָּה", one tap each. */
function nikanor(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'ספינה בסערה, וניקנור מחבק את הדלת' }, api.play);
  const P1 = el('g', {}, svg);
  const sky = el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#28324A' }, P1);
  const rain = el('g', { stroke: 'rgba(200,215,235,.55)', 'stroke-width': 1.4 }, P1);
  for (let k = 0; k < 26; k++) el('line', { x1: (k * 37) % 300, y1: (k * 53) % 200, x2: (k * 37) % 300 - 6, y2: (k * 53) % 200 + 16 }, rain);
  const ship = el('g', {}, P1);
  el('path', { d: 'M-92 0 L92 0 L70 34 L-70 34 Z', fill: '#6B4526', stroke: '#3E2814', 'stroke-width': 2 }, ship);        // the hull
  el('rect', { x: -3, y: -92, width: 6, height: 92, fill: '#4A3220' }, ship);                                              // the mast
  el('path', { d: 'M3 -86 L58 -30 L3 -26 Z', fill: '#D8CDB4', stroke: '#8C7C5E', 'stroke-width': 1.5 }, ship);           // the sail
  const door = el('g', { 'data-door': '1', class: 'gm-m2-btn', tabindex: 0, role: 'button', 'aria-label': 'הדלת' }, ship);
  el('rect', { x: -70, y: -44, width: 30, height: 44, rx: 2, fill: '#C9A04A', stroke: '#7A5A1A', 'stroke-width': 2 }, door); // the bronze door
  el('rect', { x: -64, y: -38, width: 18, height: 14, fill: 'none', stroke: 'rgba(90,60,10,.5)', 'stroke-width': 1.5 }, door);
  el('rect', { x: -64, y: -20, width: 18, height: 14, fill: 'none', stroke: 'rgba(90,60,10,.5)', 'stroke-width': 1.5 }, door);
  el('rect', { x: -86, y: -60, width: 60, height: 70, fill: 'transparent' }, door);                                       // a big hit area
  const man = el('g', {}, ship);                                                                                          // Nikanor, holding it
  el('circle', { cx: -30, cy: -40, r: 6, fill: '#C99466' }, man); el('path', { d: 'M-36 -32 L-24 -32 L-26 -6 L-34 -6 Z', fill: '#E4DAC4' }, man);
  const arm = el('path', { d: 'M-34 -28 L-44 -24', stroke: '#C99466', 'stroke-width': 4, 'stroke-linecap': 'round' }, man);
  const sea = el('path', { fill: '#2F5877' }, P1), foam = el('path', { fill: 'none', stroke: 'rgba(235,245,255,.7)', 'stroke-width': 2 }, P1);
  const lost = el('g', {}, P1);                                                                                           // the first door, already in the sea
  el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 2, fill: '#B89042', stroke: '#6E5018', 'stroke-width': 1.5 }, lost);
  const bar = document.createElement('div'); bar.className = 'gm-m2-bar gm-m2-hi'; bar.innerHTML = '<i></i>'; api.play.appendChild(bar);
  const btn = holdButton(api, 'חבק את הדלת');
  const H = holdInput(door, btn);
  let calm = 0, t = 0, phase = 'storm', crash = 0;
  const mix = (a, b, u) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * u).toString(16).padStart(2, '0')).join(''); };
  K.tag('סערה בים');
  K.say('המלחים השליכו דלת אחת לים. החזק את הדלת השנייה');
  const stopLoop = loop((dt) => {
    if (phase !== 'storm') return;
    t += dt;
    const held = H.held();
    calm = clamp(calm + (held ? dt / 3.2 : -dt * 0.1), 0, 1);
    const amp = (1 - calm) * 16 + 2, rock = api.reduced ? 0 : Math.sin(t * 1.7) * (1 - calm) * 9;
    let d = 'M0 300 L', f = 'M';
    for (let x = 0; x <= 300; x += 15) { const y = 222 + Math.sin(x / 26 + t * 2.4) * amp + Math.sin(x / 11 - t * 3.1) * amp * 0.35; d += `${x} ${y.toFixed(1)} L`; f += `${x} ${y.toFixed(1)} ${x < 300 ? 'L' : ''}`; }
    sea.setAttribute('d', d + '300 300 Z'); foam.setAttribute('d', f);
    const sy = 200 + Math.sin(t * 2.4 + 5.8) * amp * 0.6;
    ship.setAttribute('transform', `translate(150 ${sy.toFixed(1)}) rotate(${rock.toFixed(2)})`);
    lost.setAttribute('transform', `translate(264 ${(216 + Math.sin(264 / 26 + t * 2.4) * amp + Math.sin(264 / 11 - t * 3.1) * amp * 0.35).toFixed(1)}) rotate(${(Math.sin(t) * 14).toFixed(1)})`);
    sky.setAttribute('fill', mix('#28324A', '#9CC3E4', calm)); sea.setAttribute('fill', mix('#2F5877', '#3F86B8', calm));
    rain.setAttribute('opacity', (1 - calm).toFixed(2)); rain.setAttribute('transform', `translate(${((t * 60) % 37).toFixed(1)} ${((t * 160) % 53).toFixed(1)})`);
    arm.setAttribute('d', held ? 'M-34 -28 L-46 -30' : 'M-34 -28 L-40 -18');
    bar.firstChild.style.width = `${(calm * 100).toFixed(0)}%`;
    crash -= dt; if (crash <= 0 && calm < 0.8) { K.sfx(calm < 0.4 ? 'settle' : 'creak'); api.haptic(held ? 6 : 12); crash = 0.9 + calm; }
    if (held && calm > 0.05 && calm < 0.5 && !/אותי/.test(api.hint.textContent)) K.say('"הטילוני עמה" — השליכו אותי איתה');
    if (calm >= 1) {
      phase = 'calm'; btn.remove(); bar.remove(); H.off();
      K.sfx('chime', { combo: 6 }); api.haptic([20, 30, 40]);
      K.say('מיד נח הים מזעפו', true);
      K.J.after(1300, () => { K.say('ובנמל עכו יצאה הדלת הראשונה מתחת לדופן הספינה', true); K.sfx('leaf'); lost.setAttribute('transform', 'translate(214 222) rotate(0)'); lost.classList.add('gm-m2-pop'); });
      K.J.after(3000, steps);
    }
  });
  /* phase 2: the fifteen steps, rounded "like half a round threshing floor" */
  function steps() {
    P1.remove();
    const P2 = el('g', {}, svg);
    el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#EFE5D0' }, P2);
    // the gate at the top (bronze: never changed to gold, Middot 2:3), the steps below it
    el('rect', { x: 118, y: 10, width: 64, height: 64, rx: 3, fill: '#B98A3E', stroke: '#6E5018', 'stroke-width': 2 }, P2);
    el('path', { d: 'M150 12 V72', stroke: '#6E5018', 'stroke-width': 2 }, P2);
    const gl = el('text', { x: 150, y: 92, class: 'gm-m2-labb', 'text-anchor': 'middle' }, P2); gl.textContent = 'שער ניקנור';
    const arcs = el('g', {}, P2);
    let n = 0;
    K.tag('מעלה 0 / 15');
    K.say('הקש כדי להניח מעלה, מלמטה למעלה');
    const lay = () => {
      if (n >= 15) return;
      const k = n, y = 274 - k * 11.6, rx = 132 - k * 5.2, ry = 26 - k * 0.9;
      // one step: the half-ring's tread (lighter) and riser (darker), opening toward the viewer
      const g = el('g', { class: 'gm-m2-pop' }, arcs);
      el('path', { d: `M${150 - rx} ${y} A${rx} ${ry} 0 0 0 ${150 + rx} ${y} L${150 + rx} ${y - 5} A${rx} ${ry} 0 0 1 ${150 - rx} ${y - 5} Z`, fill: '#C9B48C', stroke: '#8E7A55', 'stroke-width': 1 }, g);
      el('path', { d: `M${150 - rx} ${y - 5} A${rx} ${ry} 0 0 0 ${150 + rx} ${y - 5}`, fill: 'none', stroke: '#F4EBD6', 'stroke-width': 3 }, g);
      arcs.insertBefore(g, arcs.firstChild);                        // a higher step is drawn behind the lower ones
      n++;
      K.tag(`מעלה ${n} / 15`); K.sfx('settle'); K.sfx('chime', { combo: Math.min(10, n) }); api.haptic(12);
      if (n % 5 === 0) K.world('fx', n === 15 ? 'perfect' : 'normal', n);
      if (n === 15) { K.say('חמש עשרה מעלות, כנגד חמש עשרה "שיר המעלות"', true); sparks(svg, 150, 80, 12, api.reduced); K.finish(1000); }
      else if (n === 8) K.say('עליהן עמדו הלוים בכלי שיר ואמרו שירה');
    };
    const tapZone = tappable(P2, 'הנח מעלה', lay); tapZone.setAttribute('data-step', '1');
    el('rect', { x: 0, y: 100, width: 300, height: 200, fill: 'transparent' }, tapZone);
    P2.appendChild(tapZone);
  }
  return () => { stopLoop(); H.off(); K.J.stop(); };
}

/* ───────── הנדבך הראשון (wall): five stones, no joint over a joint ─────────
 * Herodian masonry as the excavations around the Mount show it (archaeology, not Mishnah; the card says so): the
 * joints of each course fall away from the joints of the course below, so every stone sits on two. For each stone
 * two cut ashlars are offered, drawn from the same starting point, with the joints of the course below dropped as
 * plumb lines through them: take the one whose end misses the lines. A joint over a joint flashes and is lifted. */
function wall(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'חומת העזרה: נדבך חדש מעל נדבך' }, api.play);
  const ashlar = (p, x, y, w, h, extra = {}) => {
    const g = el('g', extra, p);
    el('rect', { x, y, width: w, height: h, fill: '#D8C9A6', stroke: '#9C8358', 'stroke-width': 1.5 }, g);
    el('rect', { x: x + 4, y: y + 4, width: Math.max(2, w - 8), height: h - 8, fill: '#E4D6B6', stroke: 'rgba(156,131,88,.45)', 'stroke-width': 1 }, g);   // the drafted margin
    return g;
  };
  const CY = 96, H = 34;                                               // the new course's top; each course is H high
  // the courses below (already built), and the joints of the one right under the new course
  const J = [0, 58, 118, 170, 232, 300];
  for (let k = 0; k < 5; k++) ashlar(svg, J[k], CY + H, J[k + 1] - J[k], H);
  const J2 = [0, 34, 92, 146, 204, 262, 300];
  for (let k = 0; k < 6; k++) ashlar(svg, J2[k], CY + 2 * H, J2[k + 1] - J2[k], H);
  el('rect', { x: 0, y: CY + 3 * H, width: 300, height: 10, fill: '#BFA67C' }, svg);
  const lab = el('text', { x: 150, y: CY - 44, class: 'gm-m2-lab', 'text-anchor': 'middle' }, svg); lab.textContent = 'חיבור לא ייפול מעל חיבור';
  // plumb lines from the joints below, down through the choices
  const plumbs = el('g', {}, svg);
  for (const x of J.slice(1, -1)) el('line', { x1: x, y1: CY + H, x2: x, y2: 292, stroke: '#C0392B', 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: 0.7 }, plumbs);
  const course = el('g', {}, svg);
  // each step: the start, and the two offered lengths (the bad one ends on a joint)
  const STEPS = [{ good: 30, bad: 58 }, { good: 58, bad: 88 }, { good: 57, bad: 30 }, { good: 55, bad: 87 }, { good: 100, bad: 32 }];
  const opts = el('g', {}, svg);
  let i = 0, x0 = 0, busy = false;
  const ROW = [214, 256];
  const render = () => {
    opts.innerHTML = '';
    const st = STEPS[i], swap = i % 2 === 1, lens = swap ? [st.bad, st.good] : [st.good, st.bad];
    lens.forEach((w, r) => {
      const g = tappable(opts, `אבן באורך ${w}`, () => pick(w === st.good, w, g), '');
      g.setAttribute('data-opt', w === st.good ? 'good' : 'bad');
      el('rect', { x: 0, y: ROW[r] - 6, width: 300, height: H + 12, fill: 'transparent' }, g);
      ashlar(g, x0, ROW[r], w, H);
      el('line', { x1: x0 + w, y1: ROW[r] - 4, x2: x0 + w, y2: ROW[r] + H + 4, stroke: '#3C2F1E', 'stroke-width': 2.5 }, g);   // its end joint
    });
    K.tag(`אבן ${i + 1} / 5`);
  };
  const setBusy = (b) => { busy = b; if (b) svg.setAttribute('data-busy', '1'); else svg.removeAttribute('data-busy'); };
  const pick = (good, w, g) => {
    if (busy) return;
    setBusy(true);
    const ghost = ashlar(course, x0, CY - 30, w, H, { opacity: 0.95 });
    K.sfx('creak');
    K.J.tween(260, (u) => ghost.setAttribute('transform', `translate(0 ${(30 * ease(u)).toFixed(1)})`), () => {
      if (!good) {                                                     // a joint over a joint: flash it, lift the stone
        const hit = el('line', { x1: x0 + w, y1: CY - 6, x2: x0 + w, y2: CY + 2 * H, stroke: '#E0392B', 'stroke-width': 5, class: 'gm-m2-pop' }, svg);
        K.sfx('crack'); api.haptic(25); K.say('תפר מעל תפר: החיבור נופל מעל חיבור. נסה את האבן השנייה');
        g.classList.add('gm-m2-shake');
        K.J.tween(300, (u) => ghost.setAttribute('transform', `translate(0 ${(30 - 34 * ease(u)).toFixed(1)})`), () => { ghost.remove(); hit.remove(); g.classList.remove('gm-m2-shake'); setBusy(false); });
        return;
      }
      ghost.setAttribute('transform', 'translate(0 30)');
      K.sfx('settle'); api.haptic(25); sparks(svg, x0 + w / 2, CY + 2, 6, api.reduced); K.world('fx', i === 4 ? 'perfect' : 'normal', i + 1);
      x0 += w; i++; setBusy(false);
      if (i < STEPS.length) { K.say('כל אבן יושבת על שתיים', true); render(); }
      else { opts.remove(); plumbs.remove(); K.tag('5 / 5'); K.sfx('chime', { combo: 7 }); K.say('נדבך שלם: אף חיבור מעל חיבור', true); K.finish(1000); }
    });
  };
  K.say('בחר את האבן שהחיבור שלה לא נופל על הקו האדום');
  render();
  return () => { K.J.stop(); };
}

/* ───────── לשכת העצים (nashim): take out the wood with worms (Middot 2:5) ─────────
 * In the north-east chamber of Ezrat Nashim, priests with a blemish checked the wood for the altar:
 * "וְכָל עֵץ שֶׁנִּמְצָא בוֹ תוֹלַעַת, פָּסוּל מֵעַל גַּבֵּי הַמִּזְבֵּחַ". Find the logs with worm holes (a worm peeks out
 * now and then) and tap them out to the pile of the unfit; a clean log just says so. */
function nashim(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'ערימת עצים בלשכת העצים' }, api.play);
  el('rect', { x: 0, y: 0, width: 300, height: 300, fill: '#E6D8BC' }, svg);
  for (let k = 0; k < 6; k++) el('line', { x1: 0, y1: 50 + k * 48, x2: 300, y2: 50 + k * 48, stroke: 'rgba(150,128,90,.25)', 'stroke-width': 1 }, svg);   // the paving
  const t0 = el('text', { x: 150, y: 40, class: 'gm-m2-lab', 'text-anchor': 'middle' }, svg); t0.textContent = 'לשכת העצים · מזרחית צפונית';
  const pileL = el('text', { x: 44, y: 292, class: 'gm-m2-labb', 'text-anchor': 'middle' }, svg); pileL.textContent = 'פסולים';
  el('rect', { x: 8, y: 244, width: 72, height: 36, rx: 8, class: 'gm-m2-tray' }, svg);
  const POS = [[60, 84], [150, 84], [240, 84], [60, 124], [150, 124], [240, 124], [60, 164], [150, 164], [240, 164], [150, 204]];
  const WORMY = new Set([1, 5, 6, 8]);
  let found = 0, out = 0;
  const worms = [];
  const logs = POS.map(([x, y], k) => {
    const wormy = WORMY.has(k);
    const g = tappable(svg, 'בול עץ', () => tapLog(g, k, wormy), '');
    g.setAttribute('data-log', wormy ? 'worm' : 'clean');
    const b = el('g', { transform: `translate(${x} ${y}) rotate(${(k % 3) - 1})` }, g);
    el('rect', { x: -44, y: -18, width: 88, height: 36, fill: 'transparent' }, b);
    el('rect', { x: -38, y: -12, width: 76, height: 24, rx: 12, fill: ['#8A5A2E', '#94643A', '#7E5228'][k % 3], stroke: '#5C3A1C', 'stroke-width': 1.2 }, b);
    el('ellipse', { cx: 38, cy: 0, rx: 5, ry: 12, fill: '#C49A62', stroke: '#5C3A1C', 'stroke-width': 1 }, b);
    el('ellipse', { cx: 38, cy: 0, rx: 2.5, ry: 6, fill: 'none', stroke: 'rgba(92,58,28,.5)', 'stroke-width': 1 }, b);
    el('path', { d: 'M-30 -4 H10 M-20 5 H24', stroke: 'rgba(40,24,10,.3)', 'stroke-width': 1.2 }, b);          // the bark
    if (wormy) {
      for (const [hx, hy] of [[-14, -3], [4, 4], [16, -5]]) el('circle', { cx: hx, cy: hy, r: 2.2, fill: '#2B1A0C' }, b);
      const w = el('path', { d: 'M4 4 q3 -6 6 -3 q3 3 6 -2', fill: 'none', stroke: '#E9B8A0', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, b);
      worms.push({ w, k, ph: k * 1.7 });
    }
    return { g, b, x, y };
  });
  K.tag('תולעים 0 / 4');
  K.say('חפש עצים עם חורי תולעת, והקש כדי להוציא אותם');
  function tapLog(g, k, wormy) {
    if (g.dataset.out) return;
    if (!wormy) {
      if (g.dataset.ok) return;
      g.dataset.ok = '1'; K.sfx('ui'); api.haptic(8);
      const L = logs[k], c = el('text', { x: L.x, y: L.y + 5, class: 'gm-m2-labb', 'text-anchor': 'middle' }, svg); c.textContent = '✓'; c.style.fill = '#2E7D32';
      K.say('העץ הזה נקי. חפש חורים קטנים');
      return;
    }
    g.dataset.out = '1'; found++; g.style.pointerEvents = 'none';
    const L = logs[k], tx = 44, ty = 262 - out * 7; out++;
    K.sfx('crack'); api.haptic(18); K.tag(`תולעים ${found} / 4`);
    K.J.tween(380, (u) => { const e = ease(u); L.b.setAttribute('transform', `translate(${(L.x + (tx - L.x) * e).toFixed(1)} ${(L.y + (ty - L.y) * e - Math.sin(u * Math.PI) * 40).toFixed(1)}) rotate(${(e * 18).toFixed(0)}) scale(${(1 - 0.3 * e).toFixed(2)})`); }, () => {
      K.sfx('settle');
      if (found === 4) {
        K.sfx('chime', { combo: 7 }); K.world('fx', 'perfect', 4);
        for (const q of logs) if (!q.g.dataset.out) sparks(svg, q.x, q.y, 4, api.reduced);
        K.say('רק עצים נקיים יעלו למזבח', true); K.finish(900);
      } else K.say('פסול מעל גבי המזבח');
    });
  }
  const stopLoop = loop(() => {
    const now = performance.now() / 1000;
    for (const W of worms) { const v = api.reduced ? 1 : clamp(Math.sin(now * 2.2 + W.ph) * 1.6, 0, 1); W.w.setAttribute('opacity', v.toFixed(2)); }
  });
  return () => { stopLoop(); K.J.stop(); };
}

/* ───────── אבן גזית (lishka): dress a smooth stone for the Chamber of Hewn Stone (Middot 5:4) ─────────
 * "גזית" is hewn, dressed stone. Run the chisel across the rough face, band by band (short strokes add up); a
 * finished band chimes; when all five are smooth, the straightedge shows the face is flat. */
function lishka(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'אבן גולמית לסיתות' }, api.play);
  const X0 = 36, X1 = 264, Y0 = 62, BH = 34, NB = 5, Y1 = Y0 + BH * NB, BINS = 24;
  el('rect', { x: X0 - 6, y: Y0 - 6, width: X1 - X0 + 12, height: Y1 - Y0 + 12, rx: 4, fill: '#B8A67E' }, svg);        // the block's edge
  el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: '#EDE2C8' }, svg);                                  // the dressed face under the rough
  const t0 = el('text', { x: 150, y: 40, class: 'gm-m2-lab', 'text-anchor': 'middle' }, svg); t0.textContent = 'לשכת הגזית · אבן לקיר';
  const R = (a) => { const x = Math.sin(a * 12.9898) * 43758.5453; return x - Math.floor(x); };
  const bands = [];
  for (let b = 0; b < NB; b++) {
    const y = Y0 + b * BH, g = el('g', { 'data-band': b }, svg);
    let d = `M${X0} ${y + BH}`;
    for (let x = X0; x <= X1; x += 12) d += ` L${x} ${(y + 4 + R(b * 31 + x) * 10).toFixed(1)}`;
    d += ` L${X1} ${y + BH} Z`;
    el('path', { d, fill: '#C9B690', stroke: '#9C8660', 'stroke-width': 1 }, g);
    for (let k = 0; k < 9; k++) el('circle', { cx: X0 + 12 + R(b * 7 + k) * (X1 - X0 - 24), cy: y + 12 + R(b * 13 + k * 3) * (BH - 16), r: 3 + R(k + b) * 4, fill: '#B39E74' }, g);
    bands.push({ g, bins: new Array(BINS).fill(0), done: false, y });
  }
  const bar = document.createElement('div'); bar.className = 'gm-m2-bar'; bar.innerHTML = '<i></i>'; api.play.appendChild(bar);
  let smooth = 0, last = null, travel = 0, down = false, fin = false;
  K.tag('פסים 0 / 5');
  K.say('העבר את האזמל על האבן לרוחבה, פס אחרי פס');
  const chip = (x, y) => {
    if (api.reduced) return;
    const c = el('circle', { cx: x, cy: y, r: 2 + Math.random() * 2, class: 'gm-m2-spark' }, svg);
    c.style.fill = '#CDBB94'; c.style.setProperty('--dx', `${(Math.random() * 30 - 15).toFixed(0)}px`); c.style.setProperty('--dy', `${(10 + Math.random() * 24).toFixed(0)}px`);
    setTimeout(() => c.remove(), 750);
  };
  const cover = (a, b) => {
    if (fin) return;
    const y = (a.y + b.y) / 2; if (y < Y0 || y >= Y1) return;
    const B = bands[Math.floor((y - Y0) / BH)]; if (!B || B.done) return;
    const lo = clamp(Math.min(a.x, b.x), X0, X1), hi = clamp(Math.max(a.x, b.x), X0, X1);
    const i0 = Math.floor(((lo - X0) / (X1 - X0)) * BINS), i1 = Math.min(BINS - 1, Math.floor(((hi - X0) / (X1 - X0)) * BINS));
    for (let i = i0; i <= i1; i++) B.bins[i] = 1;
    travel += hi - lo;
    if (travel > 26) { travel = 0; K.sfx('strike', { combo: smooth + 1 }); api.haptic(5); chip(b.x, y); }
    const cov = B.bins.reduce((s, v) => s + v, 0) / BINS;
    B.g.setAttribute('opacity', (1 - cov * 0.8).toFixed(2));
    bar.firstChild.style.width = `${(((smooth + cov) / NB) * 100).toFixed(0)}%`;
    if (cov >= 0.85) {
      B.done = true; smooth++; B.g.setAttribute('opacity', '0');
      K.sfx('chime', { combo: smooth + 1 }); api.haptic(15); K.tag(`פסים ${smooth} / 5`);
      for (let k = 0; k < 4; k++) chip(X0 + Math.random() * (X1 - X0), B.y + BH / 2);
      K.world('fx', smooth === NB ? 'perfect' : 'normal', smooth);
      if (smooth === NB) finish();
    }
  };
  // the chisel follows the finger
  const tool = el('g', { opacity: 0, 'pointer-events': 'none' }, svg);
  el('rect', { x: -4, y: -44, width: 8, height: 30, rx: 3, fill: '#8A5A2E' }, tool);
  el('path', { d: 'M-5 -14 L5 -14 L3 0 L-3 0 Z', fill: '#8C9096', stroke: '#4C5056', 'stroke-width': 1 }, tool);
  const toolAt = (p) => { tool.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(24)`); tool.setAttribute('opacity', '1'); };
  svg.addEventListener('pointerdown', (e) => { if (fin) return; down = true; last = svgPt(svg, e); toolAt(last); try { svg.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } e.preventDefault(); });
  svg.addEventListener('pointermove', (e) => { if (!down) return; const p = svgPt(svg, e); cover(last, p); last = p; toolAt(p); });
  const up = () => { tool.setAttribute('opacity', '0'); if (down && !fin) { const open = bands.find((B) => !B.done && B.bins.some((v) => v)); if (open) K.say('עוד קצת לאורך הפס, עד הקצה'); } down = false; last = null; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.setAttribute('tabindex', 0);
  svg.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; e.preventDefault(); const B = bands.find((q) => !q.done); if (B) cover({ x: X0, y: B.y + BH / 2 }, { x: X1, y: B.y + BH / 2 }); });
  function finish() {
    fin = true; bar.remove();
    // the straightedge: laid on the face, it touches everywhere
    const rule = el('g', {}, svg);
    el('rect', { x: X0 - 10, y: -8, width: X1 - X0 + 20, height: 8, rx: 2, fill: '#7A5A36' }, rule);
    K.J.tween(500, (u) => rule.setAttribute('transform', `translate(0 ${(Y0 - 20 + (Y1 - Y0 + 10) * ease(u)).toFixed(1)})`), () => {
      K.sfx('chime', { combo: 8 }); api.haptic([15, 20, 30]); sparks(svg, 150, 150, 10, api.reduced);
      K.say('אבן גזית: חלקה וישרה', true); K.finish(900);
    });
  }
  return () => { K.J.stop(); };
}

/* ───────── הכבש והסיד (guf): stones up the kevesh, then whitewash (Middot 3:3–4) ─────────
 * The ramp rises on the altar's south, 32 amot long (3:3): drag each whole stone up it to the top (let go too low
 * and it slides back). Then whitewash altar and ramp, "פַּעֲמַיִם בַּשָּׁנָה, אַחַת בַּפֶּסַח וְאַחַת בֶּחָג" (3:4), with a
 * wooden float: they did not plaster them with an iron trowel, lest it touch and disqualify. */
function guf(api) {
  const K = kit(api);
  const svg = el('svg', { viewBox: '0 0 300 300', class: 'gm-mo-svg gm-m2', role: 'group', 'aria-label': 'המזבח והכבש מן הצד' }, api.play);
  el('rect', { x: 0, y: 256, width: 300, height: 44, fill: '#CDBB94' }, svg);                                             // the azara's floor
  // the altar's south side (x ≤ 80) and the ramp: 32 amot rising to the altar's top
  const AX = 80, TOP = 150, FOOT = { x: 292, y: 256 }, HEAD = { x: AX, y: TOP };
  const altar = el('path', { d: `M0 ${TOP} L${AX} ${TOP} L${AX} 256 L0 256 Z`, fill: '#D9D2C2', stroke: '#9C927E', 'stroke-width': 2 }, svg);
  el('rect', { x: AX - 10, y: TOP - 10, width: 10, height: 10, fill: '#D9D2C2', stroke: '#9C927E', 'stroke-width': 1.5 }, svg);   // a horn
  const ramp = el('path', { d: `M${HEAD.x} ${HEAD.y} L${FOOT.x} ${FOOT.y} L${AX} 256 Z`, fill: '#D3CAB6', stroke: '#9C927E', 'stroke-width': 2 }, svg);
  for (let k = 1; k < 5; k++) el('line', { x1: 0, y1: TOP + k * 21, x2: AX, y2: TOP + k * 21, stroke: 'rgba(120,110,90,.35)', 'stroke-width': 1 }, svg);
  const rl = el('text', { x: 196, y: 246, class: 'gm-m2-lab', 'text-anchor': 'middle' }, svg); rl.textContent = 'הכבש · 32 אמה';
  const al = el('text', { x: 40, y: 206, class: 'gm-m2-lab', 'text-anchor': 'middle' }, svg); al.textContent = 'המזבח';
  const top = el('g', {}, svg);                                                                                          // the stones hauled up
  const along = (u) => ({ x: FOOT.x + (HEAD.x - FOOT.x) * u, y: FOOT.y + (HEAD.y - FOOT.y) * u });
  const NS = 4; let hauled = 0, phase = 'haul';
  K.tag(`אבנים 0 / ${NS}`);
  K.say('גרור את האבן במעלה הכבש, עד המזבח');
  const makeStone = () => {
    const g = el('g', { class: 'gm-m2-drag', tabindex: 0, role: 'button', 'aria-label': 'אבן שלמה', 'data-haul': '1' }, svg);
    el('circle', { r: 26, fill: 'transparent' }, g);
    el('path', { d: 'M-14 -2 Q-12 -14 0 -13 Q13 -14 14 -3 Q15 9 2 10 Q-13 11 -14 -2 Z', fill: '#DDD5C0', stroke: '#8C8270', 'stroke-width': 2 }, g);
    let u = 0, busy = false;
    const put = () => { const p = along(u); g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - 12).toFixed(1)})`); };
    put();
    const toU = (p) => { const dx = HEAD.x - FOOT.x, dy = HEAD.y - FOOT.y; return clamp(((p.x - FOOT.x) * dx + (p.y - FOOT.y) * dy) / (dx * dx + dy * dy), 0, 1); };
    let creak = 0;
    const land = () => {
      busy = true; g.style.pointerEvents = 'none';
      K.J.tween(220, (v) => { const p = along(1), x = p.x - 16 - hauled * 14 * v; g.setAttribute('transform', `translate(${(p.x + (x - p.x) * v).toFixed(1)} ${(p.y - 12).toFixed(1)})`); }, () => {
        g.remove(); const x = AX - 18 - hauled * 17;
        el('path', { d: 'M-14 -2 Q-12 -14 0 -13 Q13 -14 14 -3 Q15 9 2 10 Q-13 11 -14 -2 Z', fill: '#DDD5C0', stroke: '#8C8270', 'stroke-width': 2, transform: `translate(${x} ${TOP - 10})`, class: 'gm-m2-pop' }, top);
        hauled++; K.tag(`אבנים ${hauled} / ${NS}`);
        K.sfx('settle'); api.haptic(25); sparks(svg, x, TOP - 12, 5, api.reduced); K.world('fx', hauled === NS ? 'perfect' : 'normal', hauled);
        if (hauled < NS) { K.say('ועוד אחת', true); makeStone(); } else { K.say('גוף המזבח שלם. עכשיו מלבנים אותו', true); K.J.after(900, whitewash); }
      });
    };
    dragger(svg, g, {
      move(p) { if (busy) return; const nu = toU(p); if (nu > u) { creak += nu - u; if (creak > 0.18) { creak = 0; K.sfx('creak'); api.haptic(4); } } u = nu; put(); },
      end(p, moved) {
        if (busy) return;
        if (moved < 8) { busy = true; K.J.tween(520, (v) => { u = ease(v); put(); }, () => { busy = false; land(); }); return; }   // a tap: it is hauled up
        if (u >= 0.88) { land(); return; }
        K.say('עד למעלה, עד המזבח'); K.sfx('ui');
        const u0 = u; busy = true; g.setAttribute('data-busy', '1'); K.J.tween(300, (v) => { u = u0 * (1 - ease(v)); put(); }, () => { busy = false; g.removeAttribute('data-busy'); });
      },
    });
    g.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !busy) { e.preventDefault(); land(); } });
  };
  makeStone();
  /* phase 2: whitewash altar and ramp, cell by cell under the float */
  function whitewash() {
    phase = 'white';
    const cells = [];
    const face = (x, y) => (x <= AX && y >= TOP - 10 && y <= 256) || (x >= AX && y <= 256 && y >= HEAD.y + (x - HEAD.x) * (FOOT.y - HEAD.y) / (FOOT.x - HEAD.x));
    // the plaster: cells clipped to the altar's and the ramp's outline, one opacity for the layer (no seams)
    const cp = el('clipPath', { id: 'gm-m2-altarclip' }, el('defs', {}, svg));
    el('path', { d: `M0 ${TOP - 10} L${AX} ${TOP - 10} L${AX} ${TOP} L${FOOT.x} ${FOOT.y} L0 ${FOOT.y} Z` }, cp);
    const wash = el('g', { 'pointer-events': 'none', 'clip-path': 'url(#gm-m2-altarclip)', opacity: 0.9 }, svg);
    for (let y = TOP - 10; y < 256; y += 12) for (let x = 0; x < 294; x += 12) if (face(x + 6, y + 6) || face(x + 12, y + 12)) cells.push({ x, y, on: false, r: el('rect', { x: x - 1, y: y - 1, width: 14, height: 14, fill: '#FBFAF4', opacity: 0 }, wash) });
    const float = el('g', { opacity: 0, 'pointer-events': 'none' }, svg);
    el('rect', { x: -18, y: -6, width: 36, height: 12, rx: 3, fill: '#B98552', stroke: '#6E4722', 'stroke-width': 1.5 }, float);
    el('rect', { x: -4, y: -20, width: 8, height: 14, rx: 3, fill: '#8A5A2E' }, float);
    const bar = document.createElement('div'); bar.className = 'gm-m2-bar gm-m2-hi'; bar.innerHTML = '<i></i>'; api.play.appendChild(bar);
    const need = Math.ceil(cells.length * 0.82);
    let n = 0, down = false, tick = 0, fin = false;
    K.tag('סיד');
    K.say('מרח סיד על המזבח ועל הכבש, בכף של עץ');
    const paint = (p) => {
      float.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); float.setAttribute('opacity', '1');
      for (const c of cells) if (!c.on && Math.abs(c.x + 6 - p.x) < 20 && Math.abs(c.y + 6 - p.y) < 14) { c.on = true; c.r.setAttribute('opacity', '1'); n++; tick++; }
      if (tick > 6) { tick = 0; K.sfx('leaf'); api.haptic(4); }
      bar.firstChild.style.width = `${Math.min(100, (n / need) * 100).toFixed(0)}%`;
      if (!fin && n >= need) {
        fin = true; float.remove(); bar.remove();
        for (const c of cells) c.r.setAttribute('opacity', '1');
        K.sfx('chime', { combo: 8 }); api.haptic([15, 25, 35]); sparks(svg, 120, 190, 12, api.reduced);
        K.world('momentFX', 'dust', 'guf');
        K.say('המזבח לבן. כך ליבנו אותו פעמיים בשנה, בפסח ובחג', true); K.finish(1100);
      }
    };
    svg.addEventListener('pointerdown', (e) => { if (fin) return; down = true; try { svg.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } e.preventDefault(); paint(svgPt(svg, e)); });
    svg.addEventListener('pointermove', (e) => { if (down && !fin) paint(svgPt(svg, e)); });
    const up = () => { down = false; if (!fin) float.setAttribute('opacity', '0'); };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.setAttribute('tabindex', 0);
    svg.addEventListener('keydown', (e) => { if (fin || (e.key !== 'Enter' && e.key !== ' ')) return; e.preventDefault(); const c = cells.find((q) => !q.on); if (c) paint({ x: c.x + 6, y: c.y + 6 }); });
  }
  return () => { K.J.stop(); };
}


/* ───────── חנוכת הבית (world12): the night of light — the four golden menorot, their bowls filled and lit ─────────
 * An illustration (המחשה) of the celebration in the manner of Simchat Beit HaShoeva: "מְנוֹרוֹת שֶׁל זָהָב הָיוּ שָׁם, וְאַרְבָּעָה
 * סְפָלִים שֶׁל זָהָב בְּרָאשֵׁיהֶם, וְאַרְבָּעָה סֻלָּמוֹת לְכָל אֶחָד וְאֶחָד, וְאַרְבָּעָה יְלָדִים מִפִּרְחֵי כְהֻנָּה…" (Sukkah 5:2). Each tap
 * on a menorah: its young kohen climbs a rung and pours, and the next bowl is lit (4 per menorah, 16 in all; a whole
 * menorah is the target: 44 px and more). The world lights with them (world.fest(k), k = lit / 16), and at the end "לא הייתה
 * חצר בירושלים שלא האירה" (5:3): the city's windows. No fireworks (⚑ owner). */
const CSS_CH = `
.gm-ch-sky{fill:url(#gm-ch-sky)}
.gm-ch-house{fill:url(#gm-ch-gold);opacity:.35;transition:opacity .6s ease}
.gm-ch-door{fill:#1A1206;transition:fill .6s ease}
.gm-ch-men{cursor:pointer;outline:none}
.gm-ch-men:focus-visible .gm-ch-hit{stroke:#fff;stroke-width:2}
.gm-ch-hit{fill:rgba(255,255,255,0);stroke:none}
.gm-ch-gold{fill:#D9A93A;stroke:#8A6417;stroke-width:1}
.gm-ch-bowl{fill:#B88A2C;stroke:#7A5A12;stroke-width:1}
.gm-ch-lad{fill:none;stroke:#8C6A43;stroke-width:1.6}
.gm-ch-kid{fill:#F3EEE2;stroke:#9A8E78;stroke-width:.8;transition:transform .35s ease}
.gm-ch-fl{fill:#FFC04A;opacity:0;transform-box:fill-box;transform-origin:50% 100%}
.gm-ch-fl.on{opacity:1;animation:gm-ch-flick .5s ease-in-out infinite alternate}
.gm-ch-halo{fill:url(#gm-ch-halo);opacity:0;transition:opacity .5s ease}
.gm-ch-halo.on{opacity:1}
.gm-ch-win{fill:#FFC45C;opacity:0;transition:opacity .4s ease}
.gm-ch-win.on{opacity:.95}
.gm-ch-ring{fill:none;stroke:#FFD36A;stroke-width:2.5;stroke-dasharray:6 4;animation:gm-m2-pulse 1.1s ease-in-out infinite;pointer-events:none}
.gm-ch-inv{margin-top:8px;min-height:48px;width:100%}
@keyframes gm-ch-flick{0%{transform:scale(1,1)}100%{transform:scale(.86,1.12)}}
@media (prefers-reduced-motion: reduce){.gm-ch-fl.on,.gm-ch-ring{animation:none}}
`;
function chanukat(api) {
  const K = kit(api);
  if (!document.getElementById('gm-ch-css')) { const st = document.createElement('style'); st.id = 'gm-ch-css'; st.textContent = CSS_CH; (document.head || document.documentElement).appendChild(st); }
  const svg = el('svg', { viewBox: '0 0 360 230', class: 'gm-mo-svg', role: 'group', 'aria-label': 'עזרת נשים בלילה: ארבע מנורות של זהב ובראש כל אחת ארבעה ספלים' }, api.play);
  const defs = el('defs', {}, svg);
  const lg = el('linearGradient', { id: 'gm-ch-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#0A1430' }, lg); el('stop', { offset: 1, 'stop-color': '#27335A' }, lg);
  const gg = el('linearGradient', { id: 'gm-ch-gold', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFE08A' }, gg); el('stop', { offset: 1, 'stop-color': '#B8862A' }, gg);
  const hg = el('radialGradient', { id: 'gm-ch-halo' }, defs);
  el('stop', { offset: 0, 'stop-color': 'rgba(255,196,90,.75)' }, hg); el('stop', { offset: 1, 'stop-color': 'rgba(255,196,90,0)' }, hg);
  el('rect', { x: 0, y: 0, width: 360, height: 230, class: 'gm-ch-sky' }, svg);
  for (let k = 0; k < 26; k++) el('circle', { cx: (k * 137) % 360, cy: 6 + ((k * 53) % 70), r: k % 5 ? 0.8 : 1.3, fill: '#E8ECFF', opacity: 0.7 }, svg);
  // the House behind the court: the Ulam's front, its doorway; it glows as the lamps are lit
  const house = el('rect', { x: 132, y: 24, width: 96, height: 150, class: 'gm-ch-house' }, svg);
  const door = el('rect', { x: 166, y: 112, width: 28, height: 62, class: 'gm-ch-door' }, svg);
  // the court's floor, the city's roofs below it (their windows light at the end)
  el('rect', { x: 0, y: 174, width: 360, height: 56, fill: '#3A3226' }, svg);
  const wins = [];
  for (let k = 0; k < 14; k++) { const x = 8 + k * 25.5; el('rect', { x, y: 196 + (k % 3) * 6, width: 20, height: 34, fill: '#2A241C' }, svg); wins.push(el('rect', { x: x + 7, y: 204 + (k % 3) * 6, width: 6, height: 7, class: 'gm-ch-win' }, svg)); }
  const counter = document.createElement('div'); counter.className = 'gm-mo-count'; api.play.appendChild(counter);
  let lit = 0;
  const upd = () => { counter.textContent = `${lit} / 16`; house.style.opacity = String(0.35 + 0.65 * lit / 16); door.style.fill = lit >= 16 ? '#FFD88A' : lit > 8 ? '#7A5A22' : '#1A1206'; };
  upd();
  const XS = [46, 110, 250, 314], rings = [], menorot = [];
  XS.forEach((x, m) => {
    const g = tappable(svg, `מנורה ${m + 1}: מלא ספל והדלק`, () => pour(m), 'gm-ch-men');
    el('rect', { x: x - 32, y: 44, width: 64, height: 132, class: 'gm-ch-hit' }, g);   // the whole menorah is the target (≥ 44 px)
    el('path', { d: `M${x - 12} 176 L${x + 12} 176 L${x + 5} 166 L${x - 5} 166 Z`, class: 'gm-ch-gold' }, g);
    el('rect', { x: x - 2.2, y: 76, width: 4.4, height: 92, class: 'gm-ch-gold' }, g);
    el('path', { d: `M${x - 24} 74 Q${x} 96 ${x + 24} 74`, fill: 'none', stroke: '#D9A93A', 'stroke-width': 3 }, g);
    // the ladder and the young kohen with his jug (Sukkah 5:2)
    el('path', { d: `M${x + 24} 176 L${x + 30} 70 M${x + 34} 176 L${x + 40} 70 ` + [0, 1, 2, 3, 4, 5, 6].map((j) => `M${x + 24.5 + j * 0.9} ${166 - j * 15} L${x + 34.5 + j * 0.9} ${166 - j * 15}`).join(' '), class: 'gm-ch-lad' }, g);
    const kid = el('g', { class: 'gm-ch-kid' }, g);
    el('circle', { cx: x + 33, cy: 148, r: 3.6 }, kid); el('rect', { x: x + 29.5, y: 151.5, width: 7, height: 12, rx: 2 }, kid);
    el('ellipse', { cx: x + 39, cy: 156, rx: 3, ry: 3.8, fill: '#B8784C', stroke: '#7A4E2E', 'stroke-width': 0.6 }, kid);
    g.kid = kid; g.n = 0; g.fl = []; g.halo = [];
    [-18, -6, 6, 18].forEach((dx) => {
      const bx = x + dx, by = dx === -18 || dx === 18 ? 72 : 78;
      g.halo.push(el('circle', { cx: bx, cy: by - 8, r: 17, class: 'gm-ch-halo' }, g));
      el('path', { d: `M${bx - 6} ${by} Q${bx} ${by + 7} ${bx + 6} ${by} Z`, class: 'gm-ch-bowl' }, g);
      g.fl.push(el('path', { d: `M${bx} ${by - 16} Q${bx + 5} ${by - 6} ${bx} ${by - 1} Q${bx - 5} ${by - 6} ${bx} ${by - 16} Z`, class: 'gm-ch-fl' }, g));
    });
    rings.push(el('rect', { x: x - 30, y: 46, width: 60, height: 128, rx: 10, class: 'gm-ch-ring' }, svg));
    menorot.push(g);
  });
  function pour(m) {
    const g = menorot[m];
    if (!g || g.n >= 4 || lit >= 16) return;
    const j = g.n++; lit++;
    g.kid.style.transform = `translate(${j * 1.5}px, ${-(j + 1) * 18}px)`;
    g.fl[j].classList.add('on'); g.halo[j].classList.add('on');
    sparks(svg, XS[m] + [-18, -6, 6, 18][j], 64, 6, api.reduced);
    if (g.n >= 4) rings[m].style.display = 'none';
    upd();
    K.sfx(lit < 16 ? 'chime' : 'fanfare', { combo: lit });
    api.haptic(12);
    K.world('fest', lit / 16);
    if (lit === 16) {
      wins.forEach((w, k) => K.J.after(90 * k, () => w.classList.add('on')));
      K.world('festDone');
      K.say(api.T && api.T.chanukatDone ? api.T.chanukatDone : 'לא הייתה חצר בירושלים שלא האירה', true);
      K.finish(1600);
    } else if (lit === 1) K.say('יפה! עוד ספל, ועוד מנורה', false);
  }
  // the end card: the invitation to the celebration ("כהנים יחד", FUN12's net) — when the host offers it
  const w = api.world;
  if (w && typeof w.invite === 'function') {
    const end = api.play.parentElement && api.play.parentElement.querySelector('.gm-mo-end');
    if (end) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'gm-btn gm-ch-inv'; b.textContent = 'הזמינו חברים לחגיגה';
      b.addEventListener('click', () => { try { w.invite(); } catch (e) { /* the host's */ } });
      end.appendChild(b);
    }
  }
  return () => K.J.stop();
}
