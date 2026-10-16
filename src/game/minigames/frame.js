/* ─────────────────────────────────────────────────────────────────────────────
 * frame.js: the frame of the site's precision games (FUN, wave 6).
 *
 *   const r = await runFrame(game, ctx);   // → { ok, quality, perfect, ms, score, skipped, tier, best, isPB }
 *
 * A game = { kind, n, kicker, hint, fact:{he, ref, illus?}, buttons?, model(opts) → M, draw(g, M, W, H, fx) }.
 * M (pure, testable in node): { step(dt), tap(x, y), press?(id), done, progress, fx:[], auto(), result() → {quality, perfect, score} }
 * The model pushes effects into M.fx ({ sfx, o, haptic, shake, pop:{t, x, y, kind}, dust:{x, y, n} }); the frame plays them.
 *
 * The frame is a bottom sheet (the real 3D site stays visible above it), portrait first, RTL, 44-px targets, AA
 * contrast. It never throws and always resolves: no DOM → a calm result at once; 20 s without progress → a calm
 * "אפשר לדלג"; demo → the model's autopilot plays. Nothing allocates per frame except the canvas' own work.
 *
 * ── games14 ── (wave 14) the drag channel, for the jobs' games (the saw, the rub, the column, the treadwheel…):
 *   M.drag(x, y, phase, id)   phase 'down' | 'move' | 'up' | 'cancel'; x, y in the canvas' 0…1 box (a drag may leave it);
 *                             id = the pointer (two fingers, two players). A model WITH drag gets pointerdown as 'down'
 *                             (not tap); a model without it gets tap(x, y) as before.
 *   M.auto() / simulate's policy may return: true (a tap) · 'id' (a button) · {x, y, p, id?} (p 'down'|'move'|'up'|'tap')
 *                             · {press: id, down} (a hold button) · an array of these (two thumbs at once).
 *   M.cue() may return {x, y, x2, y2}: the hand swipes from (x, y) to (x2, y2), again and again (bots: drag along it).
 *   game.buttons[i].hold      press(id, true) on the finger's down, press(id, false) on its up (the treadwheel's feet).
 *   game.tall                 true or a fraction of the screen's height: a taller canvas (the saw for two); it folds back
 *                             on the result card.
 *   game.firstMove            the touch that closes the how-to is already a move (default: on for drag models).
 *   The star floor: starsOf(q) — a finished game is ★, q ≥ .7 ★★, q ≥ .9 ★★★, never ☆☆☆ (FUN14 · ECON14's pay).
 * ── /games14 ──
 * ──────────────────────────────────────────────────────────────────────────── */
export const TIERS = ['שוליה', 'אומן', 'רב אומן', 'מופת'];
export const TIER_Q = [0, 0.55, 0.75, 0.9];
export const tierOf = (q) => (q >= TIER_Q[3] ? 3 : q >= TIER_Q[2] ? 2 : q >= TIER_Q[1] ? 1 : 0);
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
// ── games14 ── the star floor (BRAIN14-JOINT a1): a finished game always earns ★
export const STARS_Q = [0.7, 0.9];
export const starsOf = (q) => (q >= STARS_Q[1] ? 3 : q >= STARS_Q[0] ? 2 : 1);
/** one autopilot or bot action into a model (see the head): an object, a hold, or an array of them */
export function feed(M, a) {
  if (!a || typeof a !== 'object') return;
  if (Array.isArray(a)) { for (const b of a) feed(M, b); return; }
  if (a.press != null) { if (M.press) M.press(a.press, a.down); return; }
  const x = a.x == null ? 0.5 : +a.x, y = a.y == null ? 0.5 : +a.y;
  if (a.p && a.p !== 'tap' && typeof M.drag === 'function') M.drag(x, y, a.p, a.id | 0);
  else if (M.tap) M.tap(x, y);
}
// ── /games14 ──
export function rng(seed) {                       // mulberry32: the same seed plays the same game (the daily challenge)
  let a = (seed >>> 0) || 0x9E3779B9;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** A calm result: the crew sets the stone at a fair quality (skips, no DOM, errors). */
export const calm = (kind, ms = 0, extra = {}) => ({ ok: true, kind, quality: 0.8, perfect: false, ms, score: 0, skipped: true, tier: 1, best: 0, isPB: false, ...extra });

/** Play a model headless (node tests, the bots): the autopilot or a policy taps; returns the result and the time. */
export function simulate(game, opts = {}, policy = null, maxS = 120) {
  const M = game.model(opts);
  const dt = 1 / 60;
  let t = 0;
  while (!M.done && t < maxS) {
    const act = policy ? policy(M, t) : M.auto();
    if (act === true) M.tap(); else if (typeof act === 'string') M.press && M.press(act); else if (act) feed(M, act);   // ── games14 ── {x, y, p}
    M.step(dt); M.fx.length = 0; t += dt;
  }
  const r = M.result();
  return { ...r, s: t, done: M.done, stars: M.done ? starsOf(r.quality) : 0 };
}

const CSS = `
.fx-mg{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:none;direction:rtl;font-family:"Heebo",system-ui,sans-serif}
.fx-mg-sheet{pointer-events:auto;width:100%;max-width:520px;margin:0 auto;box-sizing:border-box;background:#1C140A;color:#FFF6DA;
  border-radius:18px 18px 0 0;padding:10px 12px calc(12px + env(safe-area-inset-bottom,0px));box-shadow:0 -8px 30px rgba(0,0,0,.45);
  transform:translateY(100%);transition:transform .32s cubic-bezier(.2,.8,.3,1)}
.fx-mg.on .fx-mg-sheet{transform:none}
.fx-mg [hidden]{display:none!important}
.fx-mg-top{display:flex;align-items:center;gap:8px;min-height:28px}
.fx-mg-top b{font-size:18px}.fx-mg-k{font-size:12px;color:#E8C77A}.fx-mg-draft{margin-inline-start:auto;font-size:11px;color:#1C140A;background:#E8C77A;border-radius:6px;padding:1px 6px}
.fx-mg-hint{margin:4px 0 8px;font-size:15px;min-height:20px;color:#F3E6C4}
.fx-mg canvas{display:block;width:100%;border-radius:12px;background:#2A1F12;touch-action:none;cursor:pointer}
.fx-mg-ctl{display:flex;gap:10px;margin-top:10px;justify-content:center}
.fx-mg button{min-height:48px;min-width:96px;border:0;border-radius:12px;font:700 17px "Heebo",system-ui,sans-serif;padding:0 18px;cursor:pointer}
.fx-mg .fx-ok{background:#E8C77A;color:#1C140A}.fx-mg .fx-no{background:#5A3A22;color:#FFF6DA}.fx-mg .fx-skip{background:transparent;color:#E8C77A;min-width:0;text-decoration:underline}
.fx-mg-res{display:none;text-align:center;padding:6px 4px 2px}.fx-mg.done .fx-mg-res{display:block}.fx-mg.done canvas{opacity:.35}
.fx-mg-tier{font-size:26px;font-weight:800;color:#FFD66E;margin:2px 0}.fx-mg-lv{font-size:12px;font-weight:700;color:#1C140A;background:#9FD39A;border-radius:6px;padding:1px 6px}.fx-mg-acc{font-size:14px;color:#F3E6C4;margin:2px 0 4px}.fx-mg-acc b{color:#FFE08A}.fx-mg-stars{font-size:24px;letter-spacing:4px;color:#FFD66E}
.fx-mg-pb{display:inline-block;background:#B9F2C8;color:#12301B;border-radius:8px;padding:1px 8px;font-weight:800;font-size:13px}
.fx-mg-fact{font-size:14px;line-height:1.45;color:#F3E6C4;margin:8px 4px}.fx-mg-fact small{display:block;color:#C9B68A;font-size:12px;margin-top:2px}
/* (wave 8B) the first-time how-to over the canvas, and the hand that shows where and when to tap */
.fx-mg-stage{position:relative}
.fx-mg-how{position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:10px;box-sizing:border-box;cursor:pointer}
.fx-mg-how.low{align-items:flex-end}.fx-mg-how.nopill span{display:none}
.fx-mg-hint.how{background:#E8C77A;color:#1C140A;font-weight:800;font-size:16px;border-radius:10px;padding:4px 10px}
.fx-mg-how span{font-size:16px;font-weight:800;color:#1C140A;background:#E8C77A;border-radius:24px;padding:12px 22px;box-shadow:0 3px 10px rgba(0,0,0,.35)}
.fx-mg-hand{position:absolute;left:0;top:0;width:54px;height:54px;pointer-events:none;z-index:3;opacity:0;transition:opacity .25s}
.fx-mg-hand.on{opacity:1}
.fx-mg-hand svg{width:100%;height:100%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55));transition:transform .08s}
.fx-mg-hand i{position:absolute;left:5px;top:-8px;width:28px;height:28px;border-radius:50%;border:3px solid #FFE08A;opacity:0;box-sizing:border-box}
.fx-mg-hand.bob svg{animation:fxbob 1s ease-in-out infinite}
.fx-mg-hand.now svg{transform:translateY(5px) scale(.9)}
.fx-mg-hand.now i{animation:fxring .45s ease-out}
@keyframes fxbob{0%,100%{transform:none}50%{transform:translateY(7px) scale(.94)}}
@keyframes fxring{from{opacity:1;transform:scale(.4)}to{opacity:0;transform:scale(1.9)}}
@media (prefers-reduced-motion: reduce){.fx-mg-sheet{transition:none}.fx-mg-hand.bob svg,.fx-mg-hand.now i{animation:none}}
.fx-mg-stage,.fx-mg-how{touch-action:none}
.fx-mg button.fx-hold{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;min-width:120px;min-height:64px;font-size:19px}
.fx-mg button.fx-hold.on{filter:brightness(1.25);transform:scale(.95)}
.fx-mg-hand.swipe{transition:opacity .18s}
`;
const HAND = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M17 4c2.2 0 4 1.8 4 4v13l2.2-.6c2-.5 4 .6 4.6 2.5l.2.6 1.8-.4c2-.4 3.9.8 4.4 2.7l.2.7 1.2-.2c2.1-.3 4 1.2 4.3 3.3l.9 7.3c.4 3.3-.6 6.6-2.8 9.1L36 48H17l-6.5-9.6c-.7-1-1-2.2-.9-3.4l.3-4.1c.2-2.2 2-3.8 4.2-3.8H13V8c0-2.2 1.8-4 4-4z" fill="#FFF6DA" stroke="#1C140A" stroke-width="2.2"/></svg><i></i>';

/* (wave 8B) the how-to is shown the first time a player meets each game (this device; a per-viewer convenience) */
const SEEN = new Set();
const SEEN_KEY = 'bh-mg-howto';
const seenAll = () => { try { return JSON.parse(globalThis.localStorage.getItem(SEEN_KEY) || '{}') || {}; } catch (e) { return {}; } };
export const howtoSeen = (kind) => SEEN.has(kind) || !!seenAll()[kind];
export function markHowto(kind) { SEEN.add(kind); try { const s = seenAll(); s[kind] = 1; globalThis.localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch (e) { /* private mode: this session only */ } }

/**
 * Run one game in the sheet. ctx: { root, level, seed, demo, fast, sfx, haptic, reduced, best, onEvent, setup }
 * `ctx.setup` (from index.js) holds the 3D anchors already read (slot, joints below) and the hooks to call.
 */
export function runFrame(game0, ctx = {}) {
  let game = game0;                                  // ── games14 ── (game.alt may swap it: the saw for two)
  const t0 = Date.now();
  const doc = typeof document !== 'undefined' ? document : null;
  if (!doc || !doc.body || typeof requestAnimationFrame !== 'function') return Promise.resolve(calm(game.kind));
  return new Promise((resolve) => {
    let finished = false, raf = 0, wrap = null;
    const reduced = ctx.reduced != null ? !!ctx.reduced : (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
    const sfx = typeof ctx.sfx === 'function' ? ctx.sfx : ctx.sfx && ctx.sfx.play ? (n, o) => ctx.sfx.play(n, o) : () => {};
    const haptic = ctx.haptic || (ctx.sfx && ctx.sfx.haptic) || null;
    // (wave 8B) the autopilot plays only in demo or a test; a real touch always takes the game over from it
    let auto = !!ctx.demo, T = ctx.fast ? 4 : auto ? 1.5 : 1;
    const finish = (r) => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      try { if (wrap) { wrap.classList.remove('on'); setTimeout(() => { try { wrap.remove(); } catch (e) { /* gone */ } }, ctx.fast ? 0 : 320); } } catch (e) { /* ignore */ }
      try { ctx.onEvent && ctx.onEvent('minigame', { kind: game.kind, level: ctx.level | 0, quality: r.quality, perfect: r.perfect, tier: r.tier, score: r.score, skipped: r.skipped }); } catch (e) { /* guarded */ }
      resolve(r);
    };
    try {
      if (!doc.getElementById('fx-mg-css')) { const s = doc.createElement('style'); s.id = 'fx-mg-css'; s.textContent = CSS; doc.head.appendChild(s); }
      const seed0 = ctx.seed == null ? (Date.now() & 0xffff) : ctx.seed >>> 0;
      const mk = (k) => game.model({ level: clamp(ctx.level | 0, 0, 4), rng: rng(seed0 + k * 7919), setup: ctx.setup || {} });
      let M = mk(0), tries = 1, bestR = null;
      const isDrag = () => typeof M.drag === 'function';                              // ── games14 ──
      const firstMove = () => (game.firstMove != null ? !!game.firstMove : isDrag());
      wrap = doc.createElement('div');
      wrap.className = 'fx-mg'; wrap.dataset.kind = game.kind;
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', game.n);
      const btns = (game.buttons || []).map((b) => `<button type="button" class="${b.cls || 'fx-ok'}${b.hold ? ' fx-hold' : ''}" data-b="${esc(b.id)}">${esc(b.label)}</button>`).join('');
      wrap.innerHTML = `<div class="fx-mg-sheet"><div class="fx-mg-top"><span class="fx-mg-k">${esc(ctx.kicker || game.kicker || '')}</span><b>${esc(game.n)}</b><span class="fx-mg-lv" title="הרמה עולה כשאתה מדייק">רמה ${clamp(ctx.level | 0, 0, 4) + 1}</span><span class="fx-mg-draft">טיוטה</span></div>
        <p class="fx-mg-hint" aria-live="polite">${esc(ctx.hint || game.hint || '')}</p><div class="fx-mg-stage"><canvas tabindex="0" aria-label="${esc(game.n + ': ' + (ctx.hint || game.hint || ''))}"></canvas><div class="fx-mg-how" hidden><span>הקש כדי להתחיל</span></div></div>
        <div class="fx-mg-ctl">${btns}<button type="button" class="fx-skip" hidden>אפשר לדלג</button></div>
        <div class="fx-mg-res"><div class="fx-mg-stars"></div><div class="fx-mg-tier"></div><div class="fx-mg-acc"></div><div class="fx-mg-pbw"></div><p class="fx-mg-fact"></p>
        <div class="fx-mg-ctl"><button type="button" class="fx-ok fx-go">המשך</button><button type="button" class="fx-no fx-again">שוב, לשיא</button></div>${game.alt ? `<div class="fx-mg-ctl"><button type="button" class="fx-no fx-alt">${esc(game.alt.label)}</button></div>` : ''}</div></div>`;
      const hand = doc.createElement('div'); hand.className = 'fx-mg-hand'; hand.innerHTML = HAND; wrap.appendChild(hand);
      (ctx.root || doc.body).appendChild(wrap);
      const cv = wrap.querySelector('canvas'), g = cv.getContext('2d');
      const howEl = wrap.querySelector('.fx-mg-how');
      const hintEl = wrap.querySelector('.fx-mg-hint'), skipEl = wrap.querySelector('.fx-skip');
      const dpr = Math.min(2, globalThis.devicePixelRatio || 1);
      let W = 360, H = 300, tallOn = !!game.tall;                                    // ── games14 ── game.tall
      const size = () => {
        const w = Math.max(240, Math.min(496, cv.clientWidth || 360));
        const vh = globalThis.innerHeight || 800, f = tallOn ? (typeof game.tall === 'number' ? game.tall : 0.62) : 0;
        W = w; H = Math.round(f ? Math.min(w * 1.6, vh * f) : Math.min(w * 0.86, vh * 0.46));
        if (ctx.setup && ctx.setup.tread) H = Math.round(Math.min(76, vh * 0.1));   // ── site15 ── המנופאי: a meter strip; the world is the view
        cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      };
      size();
      requestAnimationFrame(() => wrap.classList.add('on'));
      try { ctx.onEvent && ctx.onEvent('minigameStart', { kind: game.kind, level: ctx.level | 0 }); } catch (e) { /* guarded: MUSIC8B's precision state */ }

      /* effects: a fixed pool of floating texts and dust motes; a shake offset */
      const pops = Array.from({ length: 6 }, () => ({ t: 0, x: 0, y: 0, s: '', kind: '' }));
      const dust = Array.from({ length: 28 }, () => ({ t: 0, x: 0, y: 0, vx: 0, vy: 0 }));
      let pi = 0, di = 0, shakeT = 0, shakeA = 0;
      const fx = { pops, dust, get shake() { return shakeT > 0 ? shakeA * shakeT * 6 : 0; }, reduced };
      const play = (e) => {
        if (e.sfx) sfx(e.sfx, e.o || {});
        if (e.sfx === 'split' || e.sfx === 'thud') { try { ctx.onEvent && ctx.onEvent('mgBeat', { kind: game.kind, beat: e.sfx === 'split' ? 'split' : 'land' }); } catch (err) { /* guarded */ } }   // (wave 8B) MUSIC8B's cues
        if (e.haptic && haptic) { try { haptic(e.haptic); } catch (err) { /* unsupported */ } }
        if (e.shake && !reduced) { shakeT = 0.25; shakeA = e.shake; }
        if (e.pop) { let y = e.pop.y; for (const q of pops) if (q.t > 0.5 && Math.abs(q.x - e.pop.x) < 0.2 && Math.abs(q.y - y) < 0.05) y -= 0.07; const p = pops[pi++ % pops.length]; p.t = 1; p.x = e.pop.x; p.y = y; p.s = e.pop.t; p.kind = e.pop.kind || ''; }
        if (e.dust && !reduced) for (let i = 0; i < (e.dust.n || 10); i++) { const d = dust[di++ % dust.length]; d.t = 1; d.x = e.dust.x; d.y = e.dust.y; d.vx = (Math.random() - 0.5) * 0.5; d.vy = -Math.random() * 0.25; }
        if (e.hint) hintEl.textContent = e.hint;
        if (e.howto) { if (first) showHow(e.howto, e.guide); else hintEl.textContent = e.howto; }
        if (e.world && ctx.setup && ctx.setup.onWorld) { try { ctx.setup.onWorld(e.world); } catch (err) { /* guarded */ } }
      };
      let lastProg = -1, idle = 0;
      /* (wave 8B) the first-time how-to: one line and the hand on the target; the game waits for the player's tap */
      const first = !ctx.fast && ctx.howto !== false && (ctx.howto === true || !howtoSeen(game.kind));
      let how = 0, howT = 0, guideTo = first || (ctx.level | 0) === 0 ? (game.guide || 1) : 0, taps = 0;
      const showHow = (text, g2) => {
        if (ctx.fast) return;
        hintEl.textContent = text; hintEl.classList.add('how');                     // the line: the sheet's own hint, lit
        howEl.classList.toggle('low', game.howAt === 'bottom' && M.progress < 1); howEl.classList.toggle('nopill', !!game.buttons || firstMove());   // (games14: a drag game's hand plays over the live scene, no pill)
        howEl.hidden = false; how = 1; howT = auto ? 1.4 : 0;
        guideTo = Math.max(guideTo, (M.progress | 0) + (g2 || 1));
      };
      const hideHow = () => { if (!how) return; how = 0; M.hold = false; howEl.hidden = true; hintEl.classList.remove('how'); idle = 0; if (!auto) markHowto(game.kind); };   // a demo's how-to never uses up a player's
      if (first && (ctx.lead || game.howto || ctx.hint || game.hint)) showHow(ctx.lead || game.howto || ctx.hint || game.hint, game.guide);
      else if (ctx.lead) hintEl.textContent = ctx.lead;
      const autoHeld = new Map();              // ── games14 ── the autopilot's fingers and feet still down: let go of them at a takeover
      const track = (a) => { if (Array.isArray(a)) { a.forEach(track); return; } if (!a || typeof a !== 'object') return; const k = a.press != null ? 'b' + a.press : 'p' + (a.id | 0); if (a.press != null ? a.down : a.p === 'down') autoHeld.set(k, a); else if (a.press != null || a.p === 'up' || a.p === 'cancel') autoHeld.delete(k); };
      const human = (ev) => {                 // a real finger: the autopilot hands the game over, at the player's pace
        if (!ev || ev.isTrusted === false || !auto || ctx.fast) return;
        for (const a of autoHeld.values()) { try { if (a.press != null) M.press && M.press(a.press, false); else if (M.drag) M.drag(a.x == null ? 0.5 : a.x, a.y == null ? 0.5 : a.y, 'cancel', a.id | 0); } catch (e) { /* guarded */ } }
        autoHeld.clear();
        auto = false; T = 1;
        hintEl.textContent = 'המשחק בידיים שלך — ' + (game.howto || ctx.hint || game.hint || '');
        try { ctx.onEvent && ctx.onEvent('mgHuman', { kind: game.kind }); } catch (e) { /* guarded */ }
      };
      // ── games14 ── one stage hears every finger: down (a tap, or a drag's start), then move / up / cancel for that pointer
      const stageEl = wrap.querySelector('.fx-mg-stage'), live = new Set();
      const at = (ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) / (r.width || 1), (ev.clientY - r.top) / (r.height || 1)]; };
      const onTap = (ev) => {
        if (finished || M.done) return;
        ev.preventDefault();
        human(ev);
        if (how) { hideHow(); if (!firstMove()) return; }   // the old five: the tap that closes the how-to is not a move; a drag game's is
        taps++; idle = 0;
        const [x, y] = at(ev);
        if (isDrag()) { live.add(ev.pointerId); try { stageEl.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic */ } M.drag(x, y, 'down', ev.pointerId); }
        else M.tap(x, y);
      };
      const onMove = (ev) => { if (!live.has(ev.pointerId) || finished) return; ev.preventDefault(); if (M.done || !isDrag()) return; idle = 0; const [x, y] = at(ev); M.drag(x, y, 'move', ev.pointerId); };
      const onUp = (ev) => { if (!live.delete(ev.pointerId) || finished || M.done || !isDrag()) return; const [x, y] = at(ev); M.drag(x, y, ev.type === 'pointercancel' ? 'cancel' : 'up', ev.pointerId); };
      stageEl.addEventListener('pointerdown', onTap);
      stageEl.addEventListener('pointermove', onMove);
      for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) stageEl.addEventListener(t, onUp);
      wrap.querySelectorAll('[data-b]').forEach((b) => {
        const spec = (game.buttons || []).find((k) => k.id === b.dataset.b) || {};
        if (!spec.hold) { b.addEventListener('click', (ev) => { human(ev); hideHow(); if (!M.done && M.press) { taps++; idle = 0; M.press(b.dataset.b); } }); return; }
        const held = new Set();                                                       // a hold button: down → press(id, true), up → press(id, false)
        b.addEventListener('pointerdown', (ev) => { if (finished || M.done) return; ev.preventDefault(); human(ev); hideHow(); held.add(ev.pointerId); try { b.setPointerCapture(ev.pointerId); } catch (e) { /* synthetic */ } b.classList.add('on'); taps++; idle = 0; if (M.press && held.size === 1) M.press(b.dataset.b, true); });
        const up = (ev) => { if (!held.delete(ev.pointerId) || held.size) return; b.classList.remove('on'); if (!finished && !M.done && M.press) M.press(b.dataset.b, false); };
        for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(t, up);
        b.addEventListener('contextmenu', (ev) => ev.preventDefault());
      });
      // ── /games14 ──
      skipEl.addEventListener('click', () => finish(calm(game.kind, Date.now() - t0)));
      const onKey = (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { if (!M.done) { ev.preventDefault(); if (how) hideHow(); else M.tap(0.5, 0.5); } } };
      wrap.addEventListener('keydown', onKey);

      /* the hand: over the model's cue ({x, y} in the canvas' 0…1 box, or a button id), pressing when the moment is right */
      let handOn = false;
      const placeHand = () => {
        const c = !M.done && (how || (guideTo > (M.progress | 0) && !ctx.fast)) && typeof M.cue === 'function' ? M.cue() : null;
        if (!c) { if (handOn) { hand.classList.remove('on', 'now', 'bob', 'swipe'); handOn = false; } return; }
        let x, y, now = !!c.now, vis = true;
        const bt = c.btn && wrap.querySelector(`[data-b="${c.btn}"]`);
        if (bt) { const r = bt.getBoundingClientRect(); x = r.left + r.width * 0.5; y = r.top + r.height * 0.55; }
        else {
          const r = cv.getBoundingClientRect();
          let cx = c.x == null ? 0.5 : c.x, cy = c.y == null ? 0.5 : c.y;
          if (c.x2 != null || c.y2 != null) {                                         // ── games14 ── a swipe: press, travel, lift, again
            const P = c.ms || 1300, s = (performance.now() % P) / P, k = clamp((s - 0.14) / 0.6), e = k * k * (3 - 2 * k);
            cx += ((c.x2 == null ? cx : c.x2) - cx) * e; cy += ((c.y2 == null ? cy : c.y2) - cy) * e;
            now = s > 0.1 && s < 0.78; vis = s < 0.84;
          }
          x = r.left + r.width * cx; y = r.top + r.height * cy;
        }
        const vh = globalThis.innerHeight || 800, flip = y > vh - 60;                  // near the screen's foot the hand points down
        hand.style.transform = flip ? `translate(${Math.round(x - 35)}px,${Math.round(y - 50)}px) rotate(180deg)` : `translate(${Math.round(x - 19)}px,${Math.round(y - 4)}px)`;
        hand.classList.toggle('on', vis); hand.classList.toggle('now', now); hand.classList.toggle('bob', !now && !c.timed && c.x2 == null && c.y2 == null);
        hand.classList.toggle('swipe', c.x2 != null || c.y2 != null);
        handOn = true;
      };
      /* tests and bots read what a player sees (the cue, the progress) and answer with real touches */
      wrap.__mg = { cue: () => (typeof M.cue === 'function' && !M.done ? M.cue() : null), state: () => ({ how: !!how, auto, done: !!M.done, progress: M.progress | 0, taps, drag: isDrag(), kind: game.kind }), peek: () => { try { return M.result(); } catch (e) { return null; } } };   // (games14: drag, kind; peek = the model's running result, for tests)

      let prev = performance.now(), shown = false;
      const frame = (now) => {
        if (finished) return;
        const rdt = Math.max(0, (now - prev) / 1000), dt = Math.min(0.05, rdt) * T; prev = now;
        try {
          M.rdt = Math.min(1, rdt);           // ── games14 ── the real time between frames (a slow phone's hand moves at its true speed) ── /games14 ──
          M.patient = !auto;                  // (wave 8B) a player's game never plays itself: the crew's help is only a hint
          if (how && auto && (howT -= dt / T) <= 0) hideHow();
          M.hold = !!how;                      // under the how-to the scene lives (the stone swings, the hand shows the moment); nothing scores
          if (!M.done) {
            if (auto && !how) { const a = M.auto(); if (a === true) M.tap(0.5, 0.5); else if (typeof a === 'string' && M.press) M.press(a); else if (a) { track(a); feed(M, a); } }   // (games14: {x, y, p})
            M.step(dt);
          }
          for (let i = 0; i < M.fx.length; i++) play(M.fx[i]);
          M.fx.length = 0;
          if (M.progress !== lastProg) { lastProg = M.progress; idle = 0; skipEl.hidden = true; } else if ((idle += dt / T) > 20 && !M.done) skipEl.hidden = false;
          if (idle > 7 && !auto && !how && !M.done && guideTo <= M.progress) guideTo = M.progress + 1;   // stuck: the hand comes back
          if (shakeT > 0) shakeT -= dt;
          for (const p of pops) if (p.t > 0) p.t -= dt * 0.9;
          for (const d of dust) if (d.t > 0) { d.t -= dt * 1.4; d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 0.4 * dt; }
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
          game.draw(g, M, W, H, fx);
          drawFx(g, fx, W, H);
          placeHand();
        } catch (e) { finish(calm(game.kind, Date.now() - t0)); return; }
        if (M.done && !shown) {
          shown = true;
          if (ctx.quick) { const q = M.result(); setTimeout(() => finish({ ok: true, kind: game.kind, quality: +q.quality.toFixed(3), perfect: !!q.perfect, ms: Date.now() - t0, score: q.score | 0, skipped: false, tier: tierOf(q.quality), stars: starsOf(q.quality), best: Math.max(+ctx.best || 0, q.score | 0), isPB: false, tries: 1 }), ctx.fast ? 30 : 650); }
          else showResult(M.result());
        }
        raf = requestAnimationFrame(frame);
      };
      /* (wave 8B) the fact line rotates: FLOW8B's nextFact(topic) (ctx or __BH_FACTS; no repeats across sessions), guarded;
         the first try may use the fact FLOW already picked (ctx.fact); the game's own fixed fact is the fallback */
      const factFor = (firstTry) => {
        const ok = (x) => (x && typeof x === 'object' && typeof x.he === 'string' && x.he ? x : null);
        if (firstTry && ok(ctx.fact)) return ctx.fact;
        const nf = typeof ctx.nextFact === 'function' ? ctx.nextFact : globalThis.__BH_FACTS && typeof globalThis.__BH_FACTS.nextFact === 'function' ? globalThis.__BH_FACTS.nextFact : null;
        if (nf) { try { const x = ok(nf(ctx.topic || game.topic)); if (x) return x; } catch (e) { /* guarded */ } }
        return ok(ctx.fact) || game.fact;
      };
      const showResult = (res) => {
        const tier = tierOf(res.quality);
        const best = +ctx.best || 0, isPB = !auto && res.score > best && best > 0 && (!bestR || res.score > bestR.score);
        const stars = starsOf(res.quality);                                          // ── games14 ── the star floor: done = ★
        const r = { ok: true, kind: game.kind, quality: +res.quality.toFixed(3), perfect: !!res.perfect, ms: Date.now() - t0, score: res.score | 0, skipped: false, tier, stars, best: Math.max(best, res.score | 0), isPB, tries };
        if (!bestR || r.score > bestR.score) bestR = r; else { bestR.ms = r.ms; bestR.tries = tries; }   // a replay keeps the best try
        sfx('tier', { n: tier + 1 });
        if (isPB) setTimeout(() => sfx('pb'), 450);
        wrap.classList.add('done');
        if (tallOn) { tallOn = false; size(); }                                       // (games14) a tall game folds back under its card
        wrap.querySelector('.fx-mg-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        wrap.querySelector('.fx-mg-tier').textContent = TIERS[tier] + (res.perfect ? ' · מושלם' : '');
        // (wave 7, FUN) an honest target for the replay: the accuracy, and what the next star needs (games14: the stars, not the tier)
        const pct = Math.floor(res.quality * 100 + 1e-6), nextQ = stars < 3 ? Math.round(STARS_Q[stars - 1] * 100) : 0;
        wrap.querySelector('.fx-mg-acc').innerHTML = `דיוק <b>${pct}%</b>${stars < 3 ? ` · ל־${'★'.repeat(stars + 1)}: ${nextQ}%` : ' · הדרגה העליונה'}`;
        wrap.querySelector('.fx-mg-pbw').innerHTML = isPB ? '<span class="fx-mg-pb">שיא אישי חדש!</span>' : '';
        const f = factFor(tries === 1) || {};
        wrap.querySelector('.fx-mg-fact').innerHTML = f.he ? `${esc(f.he)}<small>${esc(f.ref || '')}${f.illus ? ' · ⚑ המחשה' : ''}${f.status === 'approved' ? '' : ' · טיוטה'}</small>` : '';
        const ctl = wrap.querySelector('.fx-mg-sheet > .fx-mg-ctl'); if (ctl) ctl.hidden = true;
        if (tries > 1 && bestR !== r) wrap.querySelector('.fx-mg-pbw').innerHTML = `<span class="fx-mg-pb">נשמר הניסיון הטוב: ${TIERS[bestR.tier]}</span>`;
        const go = wrap.querySelector('.fx-go');
        try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        if (auto || ctx.fast) setTimeout(() => finish(bestR), ctx.fast ? 30 : 1400);
      };
      wrap.querySelector('.fx-go').addEventListener('click', () => { if (bestR) finish(bestR); });
      const again = (alt) => {   // mastery: play the same stone again; the best try counts
        if (!bestR || finished) return;
        if (alt && game.alt) {                                                         // ── games14 ── the variant (the saw for two)
          game = game.alt.game; wrap.dataset.kind = game.kind;
          const tb = wrap.querySelector('.fx-mg-top b'); if (tb) tb.textContent = game.n;
          const ab = wrap.querySelector('.fx-alt'); if (ab) ab.parentNode.hidden = !game.alt;
        }
        tries++; M = mk(tries - 1); shown = false; lastProg = -1; idle = 0; guideTo = 0; live.clear();
        tallOn = !!game.tall; size();                                                  // (games14)
        wrap.classList.remove('done');
        const ctl = wrap.querySelector('.fx-mg-sheet > .fx-mg-ctl'); if (ctl) ctl.hidden = false;
        hintEl.textContent = ctx.hint || game.hint || '';
        if (alt && game.howto) showHow(game.howto, game.guide);
      };
      wrap.querySelector('.fx-again').addEventListener('click', () => again(false));
      const altB = wrap.querySelector('.fx-alt'); if (altB) altB.addEventListener('click', () => again(true));
      raf = requestAnimationFrame(frame);
    } catch (e) {
      try { if (wrap) wrap.remove(); } catch (err) { /* ignore */ }
      finish(calm(game.kind, Date.now() - t0));
    }
  });
}

/* the floating texts and dust, on top of every game (units: the model's 0…1 box → pixels) */
function drawFx(g, fx, W, H) {
  g.textAlign = 'center'; g.direction = 'rtl';
  for (const d of fx.dust) if (d.t > 0) { g.globalAlpha = d.t * 0.7; g.fillStyle = '#D8C8A4'; g.fillRect(d.x * W - 2, d.y * H - 2, 4, 4); }
  for (const p of fx.pops) if (p.t > 0) {
    const k = 1 - p.t, y = p.y * H - k * 40;
    g.globalAlpha = Math.min(1, p.t * 2);
    g.font = `800 ${p.kind === 'big' ? 26 : 19}px Heebo, system-ui, sans-serif`;
    g.lineWidth = 4; g.strokeStyle = 'rgba(28,20,10,.85)'; g.strokeText(p.s, p.x * W, y);
    g.fillStyle = p.kind === 'bad' ? '#FFB9A0' : p.kind === 'good' || p.kind === 'big' ? '#FFE08A' : '#FFF6DA';
    g.fillText(p.s, p.x * W, y);
  }
  g.globalAlpha = 1;
}
