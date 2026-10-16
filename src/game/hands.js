/* hands.js — the screen is the tool (FLOW16, wave 16; the owner: "בתוך העולם ולא כמשחקון חיצוני"). A second frame for the UI-free
 * models of minigames/ (step, tap, drag, press, cue, result, fx): no sheet, no pane, no result card. The canvas takes the gestures;
 * the hint is the coach's hand at the work; a small meter where the model has a lift; the end is a float and the mentor's line.
 *   runInWorld(M, { kind, site, world, view, ui, heroPos, hooks: { begin, update, end, box }, buttons, hint, howto, fact, sfx,
 *     haptic, onEvent, level }) → Promise<{ ok, kind, quality, perfect, stars, skipped, tier, score, ms, fact, world:{x,y} }>
 *   hooks.begin(site) → { ok, at:{x,y,z} } · update(M) each frame · end(result) · box() → {x,y,w,h} CSS px (bus/FLOW16.md).
 * ── twin17 ── o.input === 'twin' (landscape, two thumbs: src/game/twin.js): the canvas takes no gesture; the right thumb's button does
 *   (o.twin.onWork): a tap → one act of the model's own autopilot (the place's basic act, aimed for her: a stroke, a step, a haul — it
 *   ends when the act lands); a drag → the aimed act: M.drag in the work's box from the cue along the thumb (a tap model: its tap at
 *   the release; a hold model: held while the thumb is down), the aim drawn from the work; the release → done. ── /twin17 ── */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const STARS_Q = [0.7, 0.9], TIER_Q = [0, 0.55, 0.75, 0.9];
const starsOf = (q) => (q >= STARS_Q[1] ? 3 : q >= STARS_Q[0] ? 2 : 1);
const tierOf = (q) => (q >= TIER_Q[3] ? 3 : q >= TIER_Q[2] ? 2 : q >= TIER_Q[1] ? 1 : 0);
const fn = (o, k) => !!o && typeof o[k] === 'function';
// ── twin17 ── one autopilot or thumb action into a model (minigames/frame.js feed's rules, here without the import) → it landed
export function feedM(M, a) {
  if (!a) return false;
  if (a === true) { if (fn(M, 'tap')) M.tap(); return true; }
  if (typeof a === 'string') { if (fn(M, 'press')) M.press(a); return true; }
  if (typeof a !== 'object') return false;
  if (Array.isArray(a)) { let t = false; for (const b of a) t = feedM(M, b) || t; return t; }
  if (a.press != null) { if (fn(M, 'press')) M.press(a.press, a.down); return a.down === false; }
  const x = a.x == null ? 0.5 : +a.x, y = a.y == null ? 0.5 : +a.y;
  if (a.p && a.p !== 'tap' && fn(M, 'drag')) { M.drag(x, y, a.p, a.id | 0); return a.p === 'up'; }
  if (fn(M, 'tap')) M.tap(x, y);
  return true;
}
/** one frame of a thumb's tap (hands.js and test/twin-taps.test.mjs): → the burst, or null when its act landed */
export function twinBurst(M, b, dt, drag, hold, cueXY) {
  b.t += dt;
  // ── twin18 ── (the merge: 22–27 fps during a job — a rub's stroke cut at 1.6 s rubs nothing more, the plaster never ended) a drag's
  // stroke at a phone's pace whatever the frame rate: 60 steps a second, ≤ 4 a frame
  const k = drag ? Math.max(1, Math.min(4, Math.round((b.f = (b.f || 0) + dt * 60)))) : 1; if (drag) b.f = Math.max(0, b.f - k);
  let a = null, landed = false;
  for (let i = 0; i < k && !landed; i++) { try { a = typeof M.auto === 'function' ? M.auto() : true; } catch (e) { a = null; } landed = feedM(M, a); if (drag && a && typeof a === 'object' && a.p === 'down') b.dn = true; }
  const timing = !drag && !hold, max = timing ? 3 : 1.6;
  // ── /twin18 ──
  if (landed) b.up = true;
  if ((b.up && (!drag || b.t >= 0.5)) || (!drag && (M.progress | 0) !== b.p0) || b.t > max) {
    if (!b.up && b.t > max && timing && typeof M.tap === 'function') { const c = cueXY ? cueXY() : [0.5, 0.5]; try { M.tap(c[0], c[1]); } catch (e) { /* */ } }
    if (drag && !landed && b.dn) { try { M.drag(0.5, 0.5, 'up', 1); } catch (e) { /* */ } }
    return null;
  }
  if (drag && a && typeof a === 'object' && a.p === 'down') b.dn = true;
  if (drag && landed) b.dn = false;
  return b;
}
// ── /twin17 ──
const TAP_MS = 180, STEP_MS = 280, IDLE_END = 20;
const CSS = `.gm-hands-m{position:absolute;left:0;top:0;width:8px;height:60px;border-radius:5px;background:rgba(28,20,10,.55);border:1px solid rgba(255,214,110,.6);pointer-events:none;opacity:0;transition:opacity .2s;z-index:3}
.gm-hands-m.on{opacity:1}.gm-hands-m i{position:absolute;left:0;right:0;bottom:0;border-radius:4px;background:#DCCBA2}.gm-hands-m b{position:absolute;left:-4px;right:-4px;height:3px;background:#FFD66E;border-radius:2px}
.gm-hands-m.near b{background:#7CE0A0}`;

/** the model's screen box: hooks.box() in CSS px, else the work's point ± 90 px */
function boxOf(o, at) {
  try { const b = fn(o.hooks, 'box') ? o.hooks.box() : null; if (b && Number.isFinite(+b.w) && b.w > 8 && b.h > 8) return { x: +b.x, y: +b.y, w: +b.w, h: +b.h }; } catch (e) { /* */ }
  const p = at ? proj(o, at) : null;
  return p ? { x: p.x - 90, y: p.y - 90, w: 180, h: 180 } : { x: 0, y: 0, w: 1, h: 1 };
}
function proj(o, p) {
  if (!p || !o.view || !fn(o.view, 'project')) return null;
  try { const q = o.view.project(p.x, p.y, p.z); return q && Number.isFinite(q.x) ? { x: q.x, y: q.y, on: q.on !== false } : null; } catch (e) { return null; }
}

export function runInWorld(M, o = {}) {
  const t0 = Date.now(), doc = typeof document !== 'undefined' ? document : null, kind = o.kind || M.kind || 'craft';
  const calm = (skipped = true) => { let q = { quality: 0.8, perfect: false, score: 0 }; try { q = M.result() || q; } catch (e) { /* */ } return { ok: true, kind, quality: +clamp(+q.quality || 0.8).toFixed(3), perfect: !!q.perfect, ms: Date.now() - t0, score: q.score | 0, skipped, tier: tierOf(+q.quality || 0.8), stars: skipped ? 0 : starsOf(+q.quality || 0.8), best: 0, isPB: false, tries: 1, fact: o.fact || null }; };
  if (!doc || !doc.body || typeof requestAnimationFrame !== 'function' || !M || !fn(M, 'step')) return Promise.resolve(calm(true));
  const H = o.hooks || {};
  let at = null;
  try { const b = fn(H, 'begin') ? H.begin(o.site) : { ok: true }; if (!b || b.ok === false) return Promise.resolve(null); at = b.at || null; } catch (e) { return Promise.resolve(null); }
  const ui = o.ui, sfx = typeof o.sfx === 'function' ? o.sfx : o.sfx && fn(o.sfx, 'play') ? (n, x) => o.sfx.play(n, x) : () => {};
  const haptic = o.haptic || (o.sfx && o.sfx.haptic) || null;
  const emit = (t, d) => { try { o.onEvent && o.onEvent(t, d); } catch (e) { /* */ } };
  const canvas = o.canvas || doc.getElementById('c') || doc.querySelector('canvas');
  const holds = (o.buttons || []).filter((b) => b && b.hold).map((b) => b.id), holdMode = holds.length >= 2 && fn(M, 'press'), dragMode = !holdMode && fn(M, 'drag');
  const TWIN = o.input === 'twin' && !!o.twin && fn(o.twin, 'onWork');   // ── twin17 ── ── /twin17 ──
  const work = () => proj(o, at) || (fn(o, 'heroPos') ? proj(o, o.heroPos()) : null);
  const hero = () => { const p = fn(o, 'heroPos') ? o.heroPos() : null; return p && Number.isFinite(p.x) ? proj(o, { x: p.x, y: p.y + 1.2, z: p.z }) : null; };
  const inBox = (cx, cy) => { const b = boxOf(o, at); return [clamp((cx - b.x) / b.w, -0.5, 1.5), clamp((cy - b.y) / b.h, -0.5, 1.5)]; };
  const sideOf = (cx) => { const h = hero(); return cx >= (h ? h.x : (globalThis.innerWidth || 390) / 2) ? holds[0] : holds[1]; };   // (the buttons' order: [R, L])
  return new Promise((resolve) => {
    let finished = false, raf = 0, prev = performance.now(), idle = 0, lastProg = -1, showT = 0, hintOn = false, bubT = 0, meter = null, cuePt = { x: 0, y: 0, on: false };
    const live = new Map();    // pointerId → { side, t, up: timer }
    // ── twin17 ── the right thumb: a burst of the model's own act (tap), or the aimed act (drag)
    let twOff = null, burst = null, held = null, lastSide = 1, dragAt = null, canvasOn = !TWIN, more = 0;
    let pressAt = 0, heldTap = false;   // ── craftb19 ── ── /craftb19 ──
    const grades = [];   // ── twin18 ── (the ring's grade of each touch: 1 · .82 · .6) ── /twin18 ──   // (more: taps that came while an act ran — at most 2 wait)
    const cueXY = () => { const c = !M.done && fn(M, 'cue') ? M.cue() : null; return c && (c.x != null || c.y != null) ? [c.x == null ? 0.5 : +c.x, c.y == null ? 0.5 : +c.y] : [0.5, 0.5]; };
    const onTwin = (ev) => {
      if (finished || M.done || !ev) return true;
      idle = 0;
      // ── craftb19 ── the touch-down and the release (twin.js 'press'): the world craft's touch(down) — the kohen answers at once; a hold
      // (≥ 250 ms, no drag) was the act itself on a craft that takes it (the plumb's line paid out): its release is not a tap too
      if (ev.t === 'press') { if (ev.down) pressAt = performance.now(); try { if (fn(H, 'touch')) H.touch(!!ev.down, M); } catch (e) { /* */ } if (!ev.down && pressAt && performance.now() - pressAt >= 250 && M.holds) { pressAt = 0; heldTap = true; } return true; }
      if (ev.t === 'tap' && heldTap) { heldTap = false; return true; }
      // ── /craftb19 ──
      if ((ev.t === 'tap' || ev.t === 'up') && ev.grade && !Array.isArray(M.acts)) grades.push(ev.grade === 'perfect' ? 1 : ev.grade === 'good' ? 0.82 : 0.6);   // ── twin18 ── ── /twin18 ── ── craftb19 ── (a model that grades its own acts — M.acts — is not capped by the ring's touches) ── /craftb19 ──
      if (ev.t === 'tap' && fn(M, 'twinTap')) { try { M.twinTap(); } catch (e) { /* the model's */ } emit('craftTap', { kind, twin: true, how: 'tap' }); return true; }   // ── crafta19 ── (a model that takes the tap itself: one unit of its act at once, ≤ good — no autopilot burst) ── /crafta19 ──
      if (ev.t === 'tap') { if (!burst) burst = { t: 0, p0: M.progress | 0 }; else more = Math.min(2, more + 1); emit('craftTap', { kind, twin: true, how: 'tap' }); return true; }
      if (holdMode) {   // (a hold model: the foot is held while the thumb drags, and let go at the release)
        if (ev.t === 'down') { const c = fn(M, 'cue') ? M.cue() : null; lastSide = c && c.btn != null ? (c.btn === holds[0] ? 0 : 1) : 1 - lastSide; held = holds[lastSide]; try { M.press(held, true); } catch (e) { /* */ } }
        else if ((ev.t === 'up' || ev.t === 'cancel') && held != null) { try { M.press(held, false); } catch (e) { /* */ } held = null; }
        return true;
      }
      if (dragMode) {
        if (ev.t === 'down') { dragAt = cueXY(); try { M.drag(dragAt[0], dragAt[1], 'down', 7); } catch (e) { /* */ } }
        else if (dragAt) { const x = dragAt[0] + (+ev.dx || 0) / 160, y = dragAt[1] + (+ev.dy || 0) / 160; try { M.drag(x, y, ev.t === 'move' ? 'move' : ev.t === 'cancel' ? 'cancel' : 'up', 7); } catch (e) { /* */ } if (ev.t !== 'move') dragAt = null; }
        return true;
      }
      if (ev.t === 'up' && fn(M, 'tap')) { const [x, y] = cueXY(); try { M.tap(x + (+ev.dx || 0) / 400, y + (+ev.dy || 0) / 400); } catch (e) { /* */ } emit('craftTap', { kind, twin: true, how: 'drag' }); }   // (a timing model: her own moment)
      return true;
    };
    // ── /twin17 ──
    const fin = (r) => {
      if (finished) return; finished = true;
      cancelAnimationFrame(raf);
      if (twOff) { try { twOff(); } catch (e) { /* */ } twOff = null; }   // ── twin17 ── ── /twin17 ──
      for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.removeEventListener(t, onPtr, true);
      try { if (meter) meter.remove(); } catch (e) { /* */ }
      if (globalThis.__HANDS && globalThis.__HANDS.kind === kind) globalThis.__HANDS = null;
      try { if (fn(H, 'end')) H.end(r); } catch (e) { /* */ }
      const w = work(); r.world = w ? { x: Math.round(w.x), y: Math.round(w.y) } : null;
      // the mentor's one line with its source (the job's fact), dismissed by a tap (or 20 s)
      const f = o.fact && typeof o.fact.he === 'string' ? o.fact : null;
      if (ui && fn(ui, 'coach') && !r.skipped) {
        const line = f ? `${f.he} · ${f.ref || ''}${f.illus ? ' · המחשה' : ''} · טיוטה` : '';
        if (line) { ui.coach(null, line); const off = () => { try { if (ui.coachText === line || /טיוטה/.test(ui.coachText || '')) ui.coach(null, ''); } catch (e) { /* */ } }; const once = (ev) => { if (ev.target && ev.target.closest && ev.target.closest('.gm-modal')) return; window.removeEventListener('pointerdown', once, true); off(); }; setTimeout(() => window.addEventListener('pointerdown', once, true), 300); setTimeout(() => { window.removeEventListener('pointerdown', once, true); off(); }, 20000); }
        else ui.coach(null, '');
      } else if (ui && fn(ui, 'coach')) ui.coach(null, '');
      emit('minigame', { kind, level: o.level | 0, quality: r.quality, perfect: r.perfect, tier: r.tier, score: r.score, skipped: r.skipped, world: true });
      emit('craft', { at: 'end', kind, site: o.site, q: r.quality, stars: r.stars, skipped: r.skipped });
      resolve(r);
    };
    const done = () => { const q = M.result() || { quality: 0.8 }; let quality = +clamp(+q.quality || 0).toFixed(3);
      // ── twin18 ── (contract 4) under two thumbs the ring is the skill: the job's quality is never above the touches' own (★★★ is earned)
      if (TWIN && grades.length) { const avg = grades.reduce((a, b) => a + b, 0) / grades.length; quality = +Math.min(quality, avg).toFixed(3); if (avg < 0.97) q.perfect = false; }
      // ── /twin18 ──
      fin({ ok: true, kind, quality, perfect: !!q.perfect, ms: Date.now() - t0, score: q.score | 0, skipped: false, tier: tierOf(quality), stars: starsOf(quality), best: q.score | 0, isPB: false, tries: 1, fact: o.fact || null }); };
    /* the gestures: the canvas's pointers, caught before main.js's pick and the orbit controls (window, capture) */
    const onPtr = (ev) => {
      if (finished || ev.target !== canvas) return;
      ev.stopImmediatePropagation(); ev.preventDefault();
      const id = ev.pointerId | 0, t = performance.now();
      if (ev.type === 'pointerdown') {
        idle = 0;
        if (holdMode) { const side = sideOf(ev.clientX); const h = { side, t }; live.set(id, h); try { M.press(side, true); } catch (e) { /* */ } emit('craftTap', { kind, side }); }
        else if (dragMode) { const [x, y] = inBox(ev.clientX, ev.clientY); live.set(id, { t, x: ev.clientX, y: ev.clientY }); try { M.drag(x, y, 'down', id); } catch (e) { /* */ } }
        else live.set(id, { t, x: ev.clientX, y: ev.clientY });
        return;
      }
      const h = live.get(id); if (!h) return;
      if (ev.type === 'pointermove') { if (dragMode) { const [x, y] = inBox(ev.clientX, ev.clientY); idle = 0; try { M.drag(x, y, 'move', id); } catch (e) { /* */ } } return; }
      live.delete(id);
      if (holdMode) { const held = t - h.t; if (held < TAP_MS) setTimeout(() => { try { if (!finished && !M.done) M.press(h.side, false); } catch (e) { /* */ } }, Math.max(0, STEP_MS - held)); else { try { M.press(h.side, false); } catch (e) { /* */ } } }
      else if (dragMode) { const [x, y] = inBox(ev.clientX, ev.clientY); try { M.drag(x, y, ev.type === 'pointercancel' ? 'cancel' : 'up', id); } catch (e) { /* */ } }
      else if (ev.type === 'pointerup' && fn(M, 'tap') && Math.hypot(ev.clientX - h.x, ev.clientY - h.y) < 12) { const [x, y] = inBox(ev.clientX, ev.clientY); try { M.tap(x, y); } catch (e) { /* */ } }
    };
    try {
      if (TWIN) twOff = o.twin.onWork(onTwin);   // ── twin17 ── (the canvas takes no gesture under two thumbs) ── /twin17 ──
      else for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.addEventListener(t, onPtr, true);
      if (!doc.getElementById('gm-hands-css')) { const s = doc.createElement('style'); s.id = 'gm-hands-css'; s.textContent = CSS; doc.head.appendChild(s); }
      if (typeof M.h === 'number' && fn(M, 'mark')) { meter = doc.createElement('div'); meter.className = 'gm-anchor gm-hands-m'; meter.innerHTML = '<i></i><b></b>'; (o.root || (ui && ui.root) || doc.body).appendChild(meter); }
      emit('craft', { at: 'begin', kind, site: o.site, hold: holdMode, drag: dragMode });
      // tests and bots read what a player sees
      globalThis.__HANDS = { kind, twin: TWIN, job: o.job || null, generic: !!o.generic, atW: () => at, cue: () => (!M.done && fn(M, 'cue') ? M.cue() : null), at: () => cuePt, box: () => boxOf(o, at), hero, state: () => ({ juice: !!M.juice, acts: Array.isArray(M.acts) ? M.acts.length : null /* ── stages21 ── (tests: the scoring acts) ── /stages21 ── */, done: !!M.done, progress: M.progress | 0, h: M.h, mark: fn(M, 'mark') ? M.mark() : null, i: M.i, n: M.n, phase: M.phase, hold: holdMode, drag: dragMode }) };
      // the hint: the coach's hand at the cue, the game's words for the first seconds
      if (TWIN && o.generic) { /* ── fable20 ── the general work: no bubble over the piece — the button's ring says the rhythm ── /fable20 ── */ }
      else if (TWIN && ui && fn(ui, 'coach')) { try { const bp = fn(o.twin, 'btnPos') ? o.twin.btnPos : () => cuePt; ui.coach(bp, (typeof M.coach === 'string' && M.coach) || "הקישו על 'עבודה' — כשהטבעת נסגרת על הזהב: מושלם!");   /* ── craftb19 ── (a craft's own gesture in its words: M.coach) ── /craftb19 ── */   /* ── twin18 ── (the ring's words) ── /twin18 ── */ hintOn = true; showT = 4; } catch (e) { console.warn('[hands] twin coach', e && e.message); } }   // ── twin17 ── ── /twin17 ──
      else if (ui && fn(ui, 'coach')) { ui.coach(() => cuePt, o.howto || o.hint || ''); hintOn = true; showT = 6; }
    } catch (e) { if (TWIN) console.warn('[hands] twin setup', e && e.message); fin(calm(true)); return; }
    // ── crafta19 ── the acts a world craft left unanswered (M.juice models: acts.js), answered here on the same frame at the work's point
    const caJ = { x: 0, y: 0, z: 0 }, CA_TRADE = { tread: 'המנופאים', crane: 'המנופאים', snap: 'המודדים', survey: 'המודדים', dress: 'סתתים', pull: 'הבנאים' };
    const caJuiceLeft = (m) => {
      const A = m.acts; let P = null;
      for (let i = 0; i < A.length; i++) { const a = A[i]; if (a.juiced || a.done) continue; a.juiced = true;
        P = P || (globalThis.__BH_PARTS || null); const J = P && P.juice; const p0 = at || (fn(o, 'heroPos') ? o.heroPos() : null);
        if (p0) { caJ.x = p0.x; caJ.y = p0.y + 1.5; caJ.z = p0.z; }
        try { if (J && typeof J.hit === 'function') J.hit('craft', { at: p0 ? caJ : null, text: a.say ? `+${a.pts} ${a.say}` : `+${a.pts}`, perfect: a.q === 2, combo: 0, craft: o.trade || CA_TRADE[kind] || null, grade: a.q === 2 ? 'perfect' : a.q === 1 ? 'good' : 'soft', quality: a.q === 2 ? 1 : a.q === 1 ? 0.82 : 0.6, pts: a.pts }); } catch (e) { /* juice's */ }
        try { const T = globalThis.__TWIN; if (T && typeof T.graded === 'function') T.graded(a.q); } catch (e) { /* twin's */ } }
      const B = m.bonuses; if (B) for (const b of B) { if (b.done) continue; b.done = true; try { const S = (globalThis.__BH_PARTS || {}).score; if (S && typeof S.add === 'function') S.add(b.pts, `${m.kind}:${b.say}`); } catch (e) { /* hook19's */ } }
    };
    // ── /crafta19 ──
    const play = (e) => {
      if (e.sfx && !(e.sfx === 'thud' && o.hooks && fn(o.hooks, 'sfx') && o.hooks.sfx(e, sfx))) sfx(e.sfx, e.o || {});   // ── site20 ── (the key stone's thud on the music's beat: the hook may take it) ── /site20 ──
      if (e.haptic && haptic) { try { haptic(e.haptic); } catch (err) { /* */ } }
      if (e.dust && at && o.world && fn(o.world, 'dustBurst')) { try { o.world.dustBurst(at.x, at.y, at.z, Math.min(12, e.dust.n || 8), 3, 2.5, 1); } catch (err) { /* */ } }
      if (e.pop && ui && fn(ui, 'float')) { const w = work(); if (w) ui.float(e.pop.t, w.x, w.y - 30, e.pop.kind === 'bad' ? 'warn' : e.pop.kind === 'big' || e.pop.kind === 'good' ? 'gold' : ''); }
      if ((e.hint || e.howto) && ui && fn(ui, 'coach') && !TWIN) { ui.coach(() => cuePt, e.hint || e.howto); hintOn = true; showT = 4; }
    };
    const frame = (now) => {
      if (finished) return;
      const rdt = Math.max(0, (now - prev) / 1000), dt = Math.min(0.05, rdt); prev = now;
      try {
        M.rdt = Math.min(1, rdt); M.patient = true; M.hold = false;
        // ── twin17 ── a thumb's tap: the model's own act, fed until it lands (a stroke, a step, a haul — a haul at least half a second),
        // at most 1.6 s (a timing act waits up to 3 s for its moment: the auto-aimed strike)
        if (burst && !M.done) { burst = twinBurst(M, burst, dt, dragMode, holdMode, cueXY); if (!burst && more > 0) { more--; burst = { t: 0, p0: M.progress | 0 }; } }
        if (!canvasOn && o.twin && o.twin.on === false) { canvasOn = true; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) window.addEventListener(t, onPtr, true); }   // (the phone turned to portrait mid-craft: the canvas takes the gestures again)
        // ── /twin17 ──
        if (!M.done) M.step(dt);
        for (let i = 0; i < M.fx.length; i++) play(M.fx[i]);
        M.fx.length = 0;
        if (fn(H, 'update')) H.update(M);
        if (M.juice && Array.isArray(M.acts)) caJuiceLeft(M);   // ── crafta19 ── (an act no world craft answered — a craft that refused, played at his hands: its "+N" still lands on its frame) ── /crafta19 ──
        if (M.progress !== lastProg) { lastProg = M.progress; idle = 0; } else idle += dt;
        // the cue: the hand at the foot's side of the kohen, or in the work's box
        const c = !M.done && fn(M, 'cue') ? M.cue() : null, hp = hero(), w = work();
        if (c) {
          if (c.btn != null && hp) { const k = c.btn === holds[0] ? 1 : -1, sw = globalThis.innerWidth || 390; cuePt = { x: clamp(hp.x + k * 64, 40, sw - 40), y: hp.y + 10, on: hp.on !== false }; }
          else if (c.x != null || c.y != null) { const b = boxOf(o, at); cuePt = { x: b.x + b.w * (c.x == null ? 0.5 : c.x), y: b.y + b.h * (c.y == null ? 0.5 : c.y), on: true }; }
          else cuePt = w ? { x: w.x, y: w.y, on: true } : { x: 0, y: 0, on: false };
        } else cuePt = { x: 0, y: 0, on: false };
        if (hintOn && showT > 0 && (showT -= dt) <= 0 && ui) ui.coach(TWIN && Array.isArray(M.acts) ? null : () => cuePt, '');   // (the words go; the hand stays on the cue) ── craftb19 ── (a craft in the world that grades its own acts: the hand goes too — it hid the cloth, the bob, the kerf; the button shows the gesture) ── /craftb19 ──
        if (meter && w) { const mk = M.mark(), h = clamp(M.h / Math.max(0.05, mk * 1.15)), near = Math.abs(M.h - mk) <= (M.tol || 0.05); meter.style.transform = `translate(${Math.round(w.x + 44)}px,${Math.round(w.y - 30)}px)`; meter.firstChild.style.height = `${Math.round(h * 60)}px`; meter.lastChild.style.bottom = `${Math.round(clamp(mk / (mk * 1.15)) * 60) - 1}px`; meter.classList.toggle('on', !M.done && M.phase !== 'done'); meter.classList.toggle('near', near); }
      } catch (e) { if (TWIN) console.warn('[hands] twin frame', e && e.message); fin(calm(true)); return; }
      if (M.done) { done(); return; }
      if (idle > IDLE_END && M.progress > 0) { done(); return; }   // (a finger that left: the result as it stands)
      if (idle > IDLE_END * 3) { fin(calm(true)); return; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    setTimeout(() => { if (!finished) fin(calm(true)); }, 180000);
  });
}

/** SITE15's treadwheel as a craft until `stages.craft.tread` lands */
export function treadCraft(st) {
  if (!st || !fn(st, 'treadBegin') || !fn(st, 'treadUpdate') || !fn(st, 'treadEnd')) return null;
  return {
    begin: (site) => { const b = st.treadBegin(site); return b && b.ok ? { ok: true, at: b.at } : { ok: false, why: b && b.why }; },
    update: (M) => st.treadUpdate(VIEW.tread(M)),
    end: (r) => st.treadEnd(r),
    box: null,
  };
}
/* what each model tells the world (bus/SITE16.md's update shapes) */
const VIEW = {
  tread: (M) => ({ ang: M.ang, h: M.h, v: M.v, mark: M.mark(), phase: M.phase, pt: M.pt, i: M.i, n: M.n, over: !!M.over, done: M.done }),
  saw: (M) => ({ phase: clamp(+M.blade || 0), stroke: M.pulls | 0, cut: M.planks ? clamp(((M.plank | 0) + clamp(+M.c || 0)) / M.planks) : 0, pull: !!(M.pp > 0 && M.pp < 1), done: !!M.done }),
  snap: (M) => ({ lift: clamp(+M.lift || 0), snapped: M.phase === 'snap', q: M.q && M.q.length ? +M.q[M.q.length - 1] || 0 : 0, done: !!M.done }),
};
/** the crafts the world offers, by the game's kind (line → snap.js's game) */
export function craftsOf(world) {
  const st = world && (world.stages || world);
  const src = st && st.craft && typeof st.craft === 'object' ? st.craft : {};
  const c = {};
  // ── craftb19 ── every craft the world offers (cover, plumb, … — not only SITE16's three); `raw: true` takes the model itself; act and
  // touch passed through when the world craft has them (FUN19 contract 1: begin, act(power, quality), update(state), end, box)
  for (const k of Object.keys(src)) {
    const kind = k === 'line' ? 'snap' : k;
    // ── /craftb19 ──
    const cr = src[k]; if (!cr || !fn(cr, 'begin')) continue;
    c[kind] = { begin: (site) => cr.begin(site), update: (M) => (fn(cr, 'update') ? cr.update(VIEW[kind] && !cr.raw ? VIEW[kind](M) : M) : false), end: (r) => (fn(cr, 'end') ? cr.end(r) : false), box: fn(cr, 'box') ? () => cr.box() : null,
      act: fn(cr, 'act') ? (p, q) => cr.act(p, q) : null, touch: fn(cr, 'touch') ? (d, m) => cr.touch(d, m) : null };   // ── craftb19 ── (raw, act, touch) ── /craftb19 ──
  }
  if (!c.tread) { const t = treadCraft(st); if (t) c.tread = t; }
  return c;
}
