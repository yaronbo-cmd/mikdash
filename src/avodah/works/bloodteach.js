/* ── blooda25 ── bloodteach.js — two teaching objects of the blood's system, touchable while the Tamid's blood work is on the altar (DAM25 §3):
 *   the חוט הסיקרא (a tap: the line shines gold, "חטאת" over it and "עולה · שלמים · אשם" under it, and the mentor's line — מידות ג, א), and
 *   the amah's first grate by the two holes (a tap: the camera follows the flow east along the amah ~4 s, the hue paling to clear water at
 *   the outlet, and the mentor's line — יומא ה, ו). Neither is a step of the work: no points, the work's taps alone finish it.
 * Each is a small DOM button over its world point (the kit projects it every frame); it hides itself when the work stops drawing it.
 *   teachTap(k, M)   call at the end of an anchored draw (the kit's frame on the real place)
 * Never a Divine Name. ── /blooda25 ── */
import { TEACH, amahTint } from './blood.js';

// (the line's faces at the two corners of the blood, and the amah's first grates by the holes: the button goes on the first one in view)
const LINE_AT = [[-23.1, 21.0, -15.6], [-26.5, 21.0, -18.6], [-53.1, 21.0, 8.4], [-49.5, 21.0, 11.6], [-38, 21.0, 11.6], [-38, 21.0, -18.6]];
const GRATE_AT = [[-54.6, 16.1, 17.2], [-49.6, 16.1, 17.2], [-26, 16.1, 17.2]], OUT_X = 30;
const S = { btn: {}, seen: 0, teach: null, raf: 0, n: { line: 0, amah: 0 }, at: { line: null, amah: null } };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
function button(key, he) {
  if (S.btn[key] || typeof document === 'undefined') return S.btn[key] || null;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'bl25-t'; b.dataset.bl25 = key; b.setAttribute('aria-label', he);
  b.style.cssText = 'position:fixed;left:0;top:0;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;border:2px solid rgba(255,230,160,.85);background:radial-gradient(circle,rgba(255,236,170,.30) 0,rgba(255,214,110,.10) 60%,rgba(0,0,0,0) 72%);z-index:44;display:none;touch-action:none;color:#3B2A12;font:700 11px/1.1 Heebo,system-ui,sans-serif;padding:0;text-shadow:0 0 3px #FFF6DA;-webkit-tap-highlight-color:transparent';
  b.textContent = he;
  const go = (e) => { try { e.preventDefault(); e.stopPropagation(); } catch (er) { /* */ } trigger(key); };
  b.addEventListener('pointerdown', go, true); b.addEventListener('click', (e) => { try { e.stopPropagation(); } catch (er) { /* */ } }, true);
  document.body.appendChild(b); S.btn[key] = b; return b;
}
/** the mentor's line of a teaching tap: a caption over the frame (DOM: it reads whatever the camera does), 4.5 s */
function caption(he, src) {
  if (typeof document === 'undefined') return;
  let c = S.cap; if (!c) { c = document.createElement('div'); c.className = 'bl25-cap'; c.setAttribute('role', 'status'); c.style.cssText = 'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);max-width:min(52vw,440px);z-index:45;pointer-events:none;direction:rtl;text-align:center;background:rgba(255,248,232,.95);color:#3B2A12;border:2px solid rgba(120,90,40,.55);border-radius:14px;padding:6px 12px;font:700 15px/1.35 Heebo,system-ui,sans-serif;box-shadow:0 4px 14px rgba(40,24,6,.25);transition:opacity .3s'; document.body.appendChild(c); S.cap = c; }
  c.innerHTML = ''; const a = document.createElement('div'); a.textContent = he; const b = document.createElement('small'); b.style.cssText = 'display:block;font-weight:400;font-size:12px;opacity:.75'; b.textContent = src; c.append(a, b);
  c.style.opacity = '1'; c.style.display = 'block'; clearTimeout(S.capT); clearTimeout(S.capT2); S.capT = setTimeout(() => { c.style.opacity = '0'; S.capT2 = setTimeout(() => { c.style.display = 'none'; }, 320); }, 4500);
}
export function trigger(kind) { S.teach = { kind, t0: now() }; S.n[kind] = (S.n[kind] | 0) + 1; const L = kind === 'amah' ? TEACH.amah : TEACH.line; caption(L.he, L.src); }
function hideLoop() {
  S.raf = 0; if (now() - S.seen > 260) { for (const k in S.btn) S.btn[k].style.display = 'none'; return; }
  S.raf = requestAnimationFrame(hideLoop);
}
function place(k, key, he, list) {
  const b = button(key, he); if (!b) return;
  const W = globalThis.innerWidth || 844, H = globalThis.innerHeight || 390;
  for (const P of list) {
    const q = k.loc(P[0], P[1], P[2]), p = k.screen(q[0], q[1], q[2]);
    if (p.on && p.x > 175 && p.x < W - 230 && p.y > H * 0.22 && p.y < H * 0.74) { b.style.display = 'block'; b.style.transform = `translate(${p.x}px,${p.y}px)`; S.at[key] = P; return; }   // (not under the right thumb's buttons)
  }
  b.style.display = 'none';
}
/** the two teaching objects over the real places, and what a tap on one shows */
export function teachTap(k, M) {
  if (!k || !k.F || !k.F.on) return;
  S.seen = now(); if (!S.raf && typeof requestAnimationFrame === 'function') S.raf = requestAnimationFrame(hideLoop);
  const T = S.teach, age = T ? (now() - T.t0) / 1000 : 99;
  if (T && T.kind === 'amah' && age < 4.2) {
    // the camera along the amah, east: from the grate by the holes to the outlet's side of the courts (the hue pales on the way)
    const G0 = GRATE_AT[0], u = Math.min(1, age / 3.6), x = G0[0] + (OUT_X - G0[0]) * u * u * (3 - 2 * u);
    k.view([x - 5, 23.5, G0[2] - 7], [x + 4, 16, G0[2]]);   // (from the north, low over the courts: the grates of the amah pass under the eye)
    for (const [gx, he] of [[-49.6, 'האמה — המים נושאים את השיריים'], [-16, 'הגוון מחוויר'], [30, 'מים צלולים — אל נחל קדרון']]) { const r = k.loc(gx, 18.2, G0[2]); k.label(he, r[0], r[1], r[2], 0.2, { bg: 'rgba(232,244,248,.94)' }); }
    void amahTint;
    for (const b in S.btn) S.btn[b].style.display = 'none';
    return;
  }
  if (T && T.kind === 'line' && age < 4.5) {
    // the line shines gold near the corner (not red); "חטאת" over it, "עולה · שלמים · אשם" under it
    const P = S.at.line || LINE_AT[0], ew = Math.abs(P[0] + 23.1) < 0.2 || Math.abs(P[0] + 53.1) < 0.2;   // (an east / west face: the line runs along z there)
    for (let j = -4; j <= 4; j++) { const q = k.loc(P[0] + (ew ? 0 : j * 0.9), 21.0, P[2] + (ew ? j * 0.9 : 0)); k.b(q[0], q[1], q[2], 0.06, 0.06, 0.06, '!#FFE6A0'); }
    const ox = ew ? 0 : (P[0] < -38 ? 3 : -3), oz = ew ? (P[2] < -2 ? 3 : -3) : 0;   // (along the face, away from the corner's own name)
    let q = k.loc(P[0] + ox, 22.0, P[2] + oz); k.label(TEACH.line.above, q[0], q[1], q[2], 0.24, { bg: 'rgba(255,236,170,.95)' });
    q = k.loc(P[0] + ox, 19.8, P[2] + oz); k.label(TEACH.line.below, q[0], q[1], q[2], 0.2, { bg: 'rgba(255,236,170,.95)' });
  }
  place(k, 'line', 'חוט הסיקרא', LINE_AT); place(k, 'amah', 'האמה', GRATE_AT);
  void M;
}
try { globalThis.__BLOOD25 = Object.assign(globalThis.__BLOOD25 || {}, { teach: trigger, teachState: () => ({ teach: S.teach && S.teach.kind, age: S.teach ? (now() - S.teach.t0) / 1000 : null, n: { ...S.n }, shown: Object.fromEntries(Object.entries(S.btn).map(([k, b]) => [k, b.style.display !== 'none'])) }) }); } catch (e) { /* */ }
