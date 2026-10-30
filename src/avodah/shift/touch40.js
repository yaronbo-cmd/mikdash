/* ── fable32 (build 40) ── touch40.js — touch the thing itself (the owner, 26.10 22:19: "במקום לחצנים נלחץ על הפריט במסך בעצמו";
 * docs/specs/hachraot-he.md "נוגעים בחפץ עצמו — במקום כפתורים", input-protocol-he.md "עדכון 26.10.2026 (ב)", shlav-alef-bimui-he.md
 * §1–2). Touch the thing → do it; touch the world → walk (build 39's guided walk). Each act's own input layer (the old right half of the
 * screen: .d21-in, .m22-in, .hk26-in, .dm27-in, .p25-in, .p23-in) is laid over the act's object on the screen instead — the object's
 * projected bounds + a margin, never under T40.box px — so the gesture each act already has (the hold, the drag, the stir, the pour, the
 * swipe) starts where the finger lands on the thing; the layer keeps the finger (pointer capture) wherever it goes after. Off the thing the
 * touch falls to the world (the walk's surface). The old right half — "the work pad" — only as the fallback: the object's footprint
 * under T40.min px on the screen, the object off the screen, or the player's switch (prefs28 "משטח עבודה גדול", PAD40_KEY). The first time
 * at each act a hand on the thing itself (no text — build 37's wick lesson), and again after two touches in a row that missed it.
 * The act's camera (twin.js pan40) reads globalThis.__T40.obj to bring the thing near the right thumb, held while __T40.down.
 *   createTouch40({ doc, pad, id, proj }) → { place(on, pts, id?) → 'obj' | 'pad' | null, state(), destroy() }
 *     pts: [{ x, y, z, r }] the object's parts (world amot; r its radius) — proj(x, y, z) → { x, y } screen px | null
 * Never a Divine Name. ── /fable32 ── */
import { SHARED } from './draw.js';

/** the numbers: the hit area = the object's bounds + `margin` px each side, at least `box` px square (the finger rules' ≥ 88);
 *  the fallback when the object's footprint is under `min` px (the owner's 44); the hand's hint after `miss` touches in a row off the thing */
export const T40 = Object.freeze({ margin: 30, box: 96, min: 44, miss: 2, edge: 4 });
/** the player's switch (prefs28): the work pad instead of the thing — accessibility */
// ── fable32 (build 41) ── (the coordinator's build-41 brief, item 6: the zorek's cut showed the pad for ~1 s while the camera arrived,
// the thing 37 px) the fall to the pad is decided after the move: never in the act's first `settle` s, and only once the thing has stayed
// small or off the screen `settle` s in a row; back on the thing only past `hyst` px over the rule. No box at all, or the switch: at once ── /fable32 ──
export const T41 = Object.freeze({ settle: 1.0, hyst: 8 });
export const TOP51 = 52;   // ── build 51 ── (the top band's height in px: no touch area over it) ── /build 51 ──
export const PAD40_KEY = 'bh_pad40';
export const HAND40_KEY = 'bh_t40_hand';
const ls = () => { try { return globalThis.localStorage || null; } catch (e) { return null; } };
export function pad40On() { try { const s = ls(); return !!s && s.getItem(PAD40_KEY) === '1'; } catch (e) { return false; } }
export function setPad40(on) { try { const s = ls(); if (s) s.setItem(PAD40_KEY, on ? '1' : '0'); } catch (e) { /* not kept */ } return !!on; }
const seen = () => { try { const s = ls(); return new Set(JSON.parse((s && s.getItem(HAND40_KEY)) || '[]')); } catch (e) { return new Set(); } };
const see = (id) => { try { const s = ls(), a = seen(); a.add(id); if (s) s.setItem(HAND40_KEY, JSON.stringify([...a])); } catch (e) { /* */ } };

/** the screen box of the object's parts (pure): each part's centre projected and its radius measured on the screen (the farthest of
 *  three offsets) → { l, t, r, b, w, h, x, y, fp } (fp: the footprint, the larger side) | null (no part on the screen) */
export function box40(pts, proj) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity, n = 0;
  for (const p of pts || []) {
    if (!p || !Number.isFinite(p.x)) continue;
    const c = proj(p.x, p.y, p.z);
    if (!c || !Number.isFinite(c.x)) continue;
    const cx = c.x, cy = c.y;
    let rad = 0;
    const R = p.r > 0 ? p.r : 0.5;
    for (const [dx, dy, dz] of [[R, 0, 0], [0, R, 0], [0, 0, R]]) { const q = proj(p.x + dx, p.y + dy, p.z + dz); if (q && Number.isFinite(q.x)) rad = Math.max(rad, Math.hypot(q.x - cx, q.y - cy)); }
    l = Math.min(l, cx - rad); r = Math.max(r, cx + rad); t = Math.min(t, cy - rad); b = Math.max(b, cy + rad); n++;
  }
  if (!n) return null;
  return { l, t, r, b, w: r - l, h: b - t, x: (l + r) / 2, y: (t + b) / 2, fp: Math.max(r - l, b - t) };
}
/** ── build 51 ── the thing's world box (pure): the parts' spheres' bounds, or the act's own thing (o.thing() → [x0, y0, z0, x1, y1, z1] —
 *  the whole lamb, the whole menorah, where the touch parts are only its legs or one lamp) → [x0, y0, z0, x1, y1, z1] | null ── /build 51 ── */
export function bb51(pts, thing) {
  try { const t = typeof thing === 'function' ? thing() : null; if (Array.isArray(t) && t.length === 6 && t.every(Number.isFinite)) return t; } catch (e) { /* the act's */ }
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const p of pts || []) { if (!p || !Number.isFinite(p.x)) continue; const r = p.r > 0 ? p.r : 0.5; b[0] = Math.min(b[0], p.x - r); b[1] = Math.min(b[1], p.y - r); b[2] = Math.min(b[2], p.z - r); b[3] = Math.max(b[3], p.x + r); b[4] = Math.max(b[4], p.y + r); b[5] = Math.max(b[5], p.z + r); }
  return Number.isFinite(b[0]) ? b : null;
}
/** the hit area for a box on a W × H screen (pure): + margin, at least T40.box square, kept on the screen → { l, t, w, h } */
export function hit40(bx, W, H, c = T40) {
  let w = Math.max(c.box, bx.w + 2 * c.margin), h = Math.max(c.box, bx.h + 2 * c.margin);
  w = Math.min(w, W * 0.6); h = Math.min(h, H - 2 * c.edge);
  let l = bx.x - w / 2, t = bx.y - h / 2;
  l = Math.max(c.edge, Math.min(W - c.edge - w, l)); t = Math.max(c.edge, Math.min(H - c.edge - h, t));
  return { l, t, w, h };
}
/** the fallback's test (pure): no box, the footprint under T40.min, the thing off the screen, or the switch */
export function fallback40(bx, W, H, padOn = false, c = T40) {
  if (padOn) return 'switch';
  if (!bx) return 'none';
  if (bx.fp < c.min) return 'small';
  if (bx.x < 0 || bx.y < 0 || bx.x > W || bx.y > H) return 'off';
  return '';
}

export const TOUCH40_CSS = `.t40-hand{position:fixed;left:0;top:0;z-index:31;pointer-events:none;font:40px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;margin:-6px 0 0 -14px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55));display:none;animation:t40tap 1.1s ease-in-out infinite}
.t40-hand.on{display:block}
@keyframes t40tap{0%,100%{transform:translate(0,10px) scale(1)}45%{transform:translate(0,0) scale(.9)}55%{transform:translate(0,0) scale(.9)}}
.t40-ring{position:fixed;left:0;top:0;z-index:29;pointer-events:none;border-radius:50%;border:3px dashed rgba(255,226,150,.85);box-shadow:0 0 14px 3px rgba(255,214,110,.35);display:none;animation:t40ring 1.4s ease-in-out infinite alternate}
.t40-ring.on{display:block}
@keyframes t40ring{0%{opacity:.45}100%{opacity:.95}}
.t40-obj{cursor:pointer}
.t51-len{position:fixed;left:0;top:0;z-index:31;pointer-events:none;display:none}.t51-len.on{display:block}
.t51-len i{display:block;width:100%;height:100%;border-radius:6px;background:linear-gradient(90deg,rgba(255,230,160,.25),#FFE6A0);box-shadow:0 0 10px 2px rgba(255,214,110,.6);transform-origin:0 50%;animation:t51x .6s ease-out 2}
.t51-len.y i{background:linear-gradient(0deg,rgba(255,230,160,.25),#FFE6A0);transform-origin:50% 100%;animation-name:t51y}
@keyframes t51x{0%{transform:scaleX(0)}80%,100%{transform:scaleX(1)}}@keyframes t51y{0%{transform:scaleY(0)}80%,100%{transform:scaleY(1)}}`;

export function createTouch40(o = {}) {
  const doc = o.doc || (typeof document !== 'undefined' ? document : null), pad = o.pad || null, proj = o.proj || (() => null), at = Number.isFinite(o.at) ? Math.max(0.55, Math.min(0.65, o.at)) : null;   // (at: the thing's own share of the width for the act's camera — 55–65 %)
  const st = { on: false, id: o.id || '', mode: '', fb: '', down: 0, miss: 0, hand: false, touched: false, n: 0, box: null, hit: null, objN: 0, padN: 0, onAt: 0, fbAt: null };
  const clock = o.clock || (() => (typeof performance !== 'undefined' ? performance.now() / 1000 : Date.now() / 1000));   // ── fable32 (build 41) ── ── /fable32 ──
  if (!doc || !pad) return { place() { return null; }, state: () => ({ ...st }), destroy() {} };
  if (!doc.getElementById('t40-css')) { const s = doc.createElement('style'); s.id = 't40-css'; s.textContent = TOUCH40_CSS; doc.head.appendChild(s); }
  const mk = (cls, html) => { const e = doc.createElement('div'); e.className = cls; e.innerHTML = html; e.setAttribute('aria-hidden', 'true'); (doc.body || doc.documentElement).appendChild(e); return e; };
  const hand = mk('t40-hand', '👆'), ring = mk('t40-ring', ''), len = mk('t51-len', '<i></i>');   // ── build 51 ── (len: the swipe's length hint) ── /build 51 ──
  const W = () => (typeof innerWidth === 'number' ? innerWidth : 844), H = () => (typeof innerHeight === 'number' ? innerHeight : 390);
  // (the finger on the thing: the hint retired for this act, the camera frozen till it lifts)
  // (globalThis.__T40 = { obj, down }: the act's thing for the twin's act camera — twin.js pan40 — and the finger on it)
  const pub = () => { try { globalThis.__T40 = SHARED.obj40 ? { obj: SHARED.obj40, down: st.down > 0 } : null; } catch (e) { /* */ } SHARED.t40down = st.down > 0; };
  const onDown = () => { if (!st.on) return; st.down++; st.miss = 0; st.touched = true; if (st.mode === 'obj') { st.objN++; if (st.id) see(st.id); } else st.padN++; pub(); };
  const onUp = () => { st.down = Math.max(0, st.down - 1); pub(); };
  pad.addEventListener('pointerdown', onDown, true);
  for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(t, onUp, true);
  // (a touch off the thing while the act waits: counted — two in a row bring the hand back)
  // (a touch on the world that walks him — the act's walk to its next place — is no miss)
  const walks = () => { try { const G = globalThis.__G39; return !!(G && G.targets().length && !G.state().arrived); } catch (e) { return false; } };
  const onDoc = (ev) => { if (!st.on || st.mode !== 'obj') return; const t = ev.target; if (t && t.closest && t.closest('.tw-zone') && !walks()) st.miss++; };
  doc.addEventListener('pointerdown', onDoc, true);
  const clear = () => { pad.classList.remove('t40-obj', 't40-pad'); for (const k of ['left', 'top', 'width', 'height', 'right', 'bottom']) pad.style[k] = ''; };
  function place(on, pts, id) {
    if (id && id !== st.id) { st.id = id; st.touched = false; st.miss = 0; }
    if (!on) {
      if (st.on) { st.on = false; st.mode = ''; st.hand = false; clear(); hand.classList.remove('on'); ring.classList.remove('on'); if (SHARED.obj40 && SHARED.obj40.t40 === api) SHARED.obj40 = null; st.down = 0; pub(); }
      return null;
    }
    if (!st.on) { st.onAt = clock(); st.fbAt = null; }   // ── fable32 (build 41) ── ── /fable32 ──
    st.on = true; st.n++;
    const w = W(), h = H(), bx = box40(pts, proj), fb0 = fallback40(bx, w, h, pad40On());
    // ── fable32 (build 41) ── T41: the fall to the pad after the camera's move, with hysteresis ── /fable32 ──
    let fb = fb0;
    { const now = clock(), soft = fb0 === 'small' || fb0 === 'off';
      if (soft) { if (st.fbAt == null) st.fbAt = now; if (st.mode !== 'pad' && (now - st.onAt < T41.settle || now - st.fbAt < T41.settle)) fb = ''; }
      else st.fbAt = null;
      if (!fb0 && st.mode === 'pad' && bx && bx.fp < T40.min + T41.hyst) fb = 'small'; }
    // (the act's object for the camera: the middle of its parts)
    const p0 = (pts || []).find((p) => p && Number.isFinite(p.x));
    if (!st.down) { const pb = (pts || []).filter((p) => p && Number.isFinite(p.x)), n = pb.length || 1; SHARED.obj40 = p0 ? { x: pb.reduce((a, p) => a + p.x, 0) / n, y: pb.reduce((a, p) => a + p.y, 0) / n, z: pb.reduce((a, p) => a + p.z, 0) / n, r: p0.r || 0.5, id: st.id, at, t40: api, bb: bb51(pb, o.thing), self: pb.some((p) => p.self) } : null; pub(); }   // (the parts' middle; held under the finger)   // ── build 51 ── (bb: the thing's world box for the object rule — twin.js obj51; o.thing(): an act's own, larger thing) ── /build 51 ──
    st.fb = fb; st.box = bx;
    try { globalThis.__T40S = { id: st.id, fb, fp: bx ? Math.round(bx.fp) : null, x: bx ? Math.round(bx.x) : null, y: bx ? Math.round(bx.y) : null, n: (pts || []).length }; } catch (e) { /* */ }   // (the last surface's reasons, for the tools)
    if (st.down) return st.mode;   // (frozen under the finger: the layer never moves while it is held)
    if (fb) {
      if (st.mode !== 'pad') { clear(); pad.classList.add('t40-pad'); st.mode = 'pad'; }
      hand.classList.remove('on'); ring.classList.remove('on');
      return st.mode;
    }
    const q = hit40(bx, w, h);
    if (q.t < TOP51) { const d = TOP51 - q.t; q.t += d; q.h = Math.max(48, q.h - d); }   // ── build 51 ── (the thing now big near the top: its touch area kept off the top band — the act's line, the pause, the chips; the naive kid found the lamb's line under it) ── /build 51 ──
    st.hit = q;
    if (st.mode !== 'obj') { pad.classList.remove('t40-pad'); pad.classList.add('t40-obj'); st.mode = 'obj'; pad.style.right = 'auto'; pad.style.bottom = 'auto'; }
    pad.style.left = `${Math.round(q.l)}px`; pad.style.top = `${Math.round(q.t)}px`; pad.style.width = `${Math.round(q.w)}px`; pad.style.height = `${Math.round(q.h)}px`;
    // the soft ring on the thing (where to touch) and the hand the first time / after two misses
    const rw = Math.max(48, bx.w + 12), rh = Math.max(48, bx.h + 12);
    ring.style.width = `${Math.round(rw)}px`; ring.style.height = `${Math.round(rh)}px`; ring.style.transform = `translate(${Math.round(bx.x - rw / 2)}px,${Math.round(bx.y - rh / 2)}px)`;
    ring.classList.add('on');
    const want = (!st.touched && !seen().has(st.id)) || st.miss >= T40.miss;
    if (want) { hand.style.transform = ''; hand.style.left = `${Math.round(bx.x)}px`; hand.style.top = `${Math.round(bx.y)}px`; }
    if (want !== st.hand) { st.hand = want; hand.classList.toggle('on', want); }
    return st.mode;
  }
  const api = {
    place,
    state: () => ({ on: st.on, id: st.id, mode: st.mode, fb: st.fb, hand: st.hand, miss: st.miss, objN: st.objN, padN: st.padN, hit: st.hit && { l: Math.round(st.hit.l), t: Math.round(st.hit.t), w: Math.round(st.hit.w), h: Math.round(st.hit.h) }, fp: st.box ? Math.round(st.box.fp) : 0, w: st.box && st.mode === 'obj' ? Math.round(st.box.w) : 0 }),   // ── build 51 ── (w: the thing's width on the screen — the swipe's gate, swipe51) ── /build 51 ──
    // ── build 51 ── (the coordinator's build-51 brief, item 4: "ארוך יותר / מהר יותר" with a short animated hint of the right length ON the
    // thing) a bar of `px` that draws itself across (axis 'x') or up (axis 'y') over the thing's middle, twice, ~1.2 s ── /build 51 ──
    hint51(px, axis = 'x') {
      if (!(px > 0)) return;
      const b = st.box, x = b ? b.x : W() * 0.62, y = b ? b.y : H() * 0.55;
      len.className = `t51-len ${axis === 'y' ? 'y' : 'x'}`;
      if (axis === 'y') { len.style.width = '8px'; len.style.height = `${Math.round(px)}px`; len.style.transform = `translate(${Math.round(x - 4)}px,${Math.round(y - px / 2)}px)`; }
      else { len.style.height = '8px'; len.style.width = `${Math.round(px)}px`; len.style.transform = `translate(${Math.round(x - px / 2)}px,${Math.round(y - 4)}px)`; }
      void len.offsetWidth; len.classList.add('on'); clearTimeout(len.__t); len.__t = setTimeout(() => len.classList.remove('on'), 1300);
    },
    destroy() { place(false); try { pad.removeEventListener('pointerdown', onDown, true); for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.removeEventListener(t, onUp, true); doc.removeEventListener('pointerdown', onDoc, true); hand.remove(); ring.remove(); len.remove(); } catch (e) { /* */ } },
  };
  return api;
}
