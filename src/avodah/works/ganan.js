/* ── bloodb25 ── ganan.js — the gardeners at the amah's outlet (DAM25 §1 row 13, §3 "האמה לקדרון", ⚑7 default: in the view, "+1" once a day).
 * "מתערבין באמה ויוצאין לנחל קדרון, ונמכרין לגננין לזבל, ומועלין בהן" (יומא ה, ו): even what ran out of the altar to the Kidron is
 * hekdesh — the gardeners pay for it. The errand stands by a grate of the amah in the azara's east; the work flies the camera east along the
 * amah to its outlet at the foot of the Mount's east wall (water.js OUTLET, x 277 — its course and outlet: המחשה): a gardener with his jar
 * and a coin, the treasurer's man with his tablet. One tap: the אמרכל records the hekdesh coins (+1, once a day: the day's errand).
 * The water at the outlet is clear (DAM25 §2.2). No red, no Divine Name. ── /bloodb25 ── */
import { baseModel, clamp, ease, getCtx } from './craft.js';
import { man, ROBE, SKIN } from './figures.js';
import { mk, tickSay } from './dawn.js';
import { ANCHORS } from './anchors.js';
import { labelW, cueW, dirL } from './places24.js';

export const OUTLET_X = 277, AMAH_Z = 17.2;
export const GANAN_LINE = { text: 'מתערבין באמה ויוצאין לנחל קדרון, ונמכרין לגננין לזבל — ומועלין בהם: גם זה הקדש.', src: 'יומא ה, ו; מעילה ג, ג (לבדיקה) · מהלך האמה והמוצא: המחשה' };
const groundAt = (x, z) => { try { const c = getCtx(); if (c && typeof c.ground === 'function') { const y = c.ground(x, z); if (Number.isFinite(y)) return y; } } catch (e) { /* */ } return 0; };
/** the outlet's anchor (made on first use: its floor is the terrain's, read from the world at that moment) */
function outletAnchor() {
  const x = OUTLET_X + 5, z = AMAH_Z, y = groundAt(x, z);
  ANCHORS.outlet = Object.assign(ANCHORS.outlet || {}, {
    id: 'outlet', he: 'מוצא האמה — נחל קדרון', x, y, z, face: [1, 0], K: 2.3, area: [x - 8, x + 8, z - 8, z + 8], solids: [], has: ['outlet'], pts: {},
    view: { p: [x + 2.5, y + 3.6, z + 15], t: [x - 1.5, y + 1.0, z] }, hero: [-16, 15],   // (from the north along the wall's foot: the wall on the right, the outlet ahead)
  });
  return 'outlet';
}
export function gananModel(o = {}) {
  const M = baseModel('ganan', o, {
    n: 1, coach: "הקישו על 'עבודה' — הגנן משלם, והאמרכל רושם את מעות ההקדש",
    ready: (m) => m.anim <= 0,
    tap(m) { m.anim = 2.8; m.fx.push({ sfx: 'soft', haptic: 8 }); },
    step(m, dt) {
      tickSay(m, dt);
      if (m.anim <= 0) return; m.anim -= dt; m.u = clamp(1 - m.anim / 2.8);   // (the camera glides east to the outlet first; then the coin) if (m.anim > 0) return;
      m.u = 0; m.paid = 1; m.pay([2, 0, 1.4], 'מעות הקדש'); m.say = 'גם זה הקדש'; m.sayT = 8; m.advance();
    },
  });
  Object.assign(M, { anim: 0, u: 0, paid: 0, sayT: 0 });
  try { globalThis.__GANAN = M; } catch (e) { /* tests */ }
  return M;
}
/** the model stage (when the real places are off): the same three on a small slope with the outlet's mouth */
function gananDraw(k, M, T) {
  if (!M) return;
  k.b(3.2, 0, 0.02, 6, 5, 0.04, '#B7A98A'); k.b(5.4, 0, 1.2, 4.6, 0.6, 2.4, '#CFC3A7'); k.b(5.08, 0, 0.35, 0.6, 0.06, 0.5, '#3E3A34');
  for (let i = 0; i < 6; i++) k.b(4.9 - i * 0.5, Math.sin(i) * 0.15, 0.05, 0.5, 0.3, 0.03, i & 1 ? '!#BFE3F0' : '!#DDF1F8');
  figs(k, M, T, (a, s, y, o) => man(k, a, s, y, o), [2.6, 0.9, 0], [2.2, -1.2, 0], [4.4, 0.2, 0.35]);
  k.label('מוצא האמה — לנחל קדרון', 3.4, 0, 2.9, 0.26);
  if (M.say) k.label(M.say, 3.0, 0, 3.4, 0.36);
}
/** the gardener (a jar, a coin passed on the tap), the treasurer's man (a tablet), the jar's place under the outlet's stream */
function figs(k, M, T, put, G, A, J) {
  const u = M.u || 0, give = M.paid ? 1 : ease(clamp((u - 0.45) / 0.45));
  put(G[0], G[1], G[2], { robe: ROBE.worker, skin: SKIN[2], yaw: Math.atan2(A[1] - G[1], A[0] - G[0]), arms: 0.35 + 0.45 * Math.sin(give * Math.PI), pose: 'reach', u: 0.4 + 0.5 * Math.sin(give * Math.PI), t: T });
  put(A[0], A[1], A[2], { robe: ROBE.amarkal, skin: SKIN[0], yaw: Math.atan2(G[1] - A[1], G[0] - A[0]), arms: 0.55, pose: 'hold', u: 0.6, t: T });
  k.c(J[0], J[1], J[2] + 0.22, 0.17, 0.42, '#A47E58'); k.c(J[0], J[1], J[2] + 0.46, 0.09, 0.06, '#8C6A48');   // the jar, filled under the stream
  const cx = G[0] + (A[0] - G[0]) * (0.25 + 0.5 * give), cs = G[1] + (A[1] - G[1]) * (0.25 + 0.5 * give);
  k.c(cx, cs, G[2] + 1.15 + 0.1 * Math.sin(give * Math.PI), 0.06, 0.015, '!#F2CF6A', { pitch: Math.PI / 2 });   // the coin
  k.b(A[0] + 0.25, A[1], A[2] + 1.0, 0.3, 0.04, 0.22, '#C9B58A', { pitch: -0.5 });   // the tablet
  if (M.paid) for (let i = 0; i < 3; i++) k.c(A[0] + 0.25, A[1] - 0.06 + i * 0.06, A[2] + 1.13, 0.035, 0.01, '!#F2CF6A');
}
function gananDrawA(k, M, T) {
  if (!M) return;
  const A0 = ANCHORS.outlet, y0 = A0 ? A0.y : 0, x = OUTLET_X;
  const G = [x + 4.2, AMAH_Z + 1.8], A = [x + 6.4, AMAH_Z - 0.6], J = [x + 2.2, AMAH_Z + 0.4];
  const L = (p, dy = 0) => { const q = k.loc(p[0], groundAt(p[0], p[1]) + dy, p[1]); return q; };
  const g = L(G), a = L(A), j = L(J);
  figs(k, M, T, (aa, ss, yy, o) => man(k, aa, ss, yy, Object.assign({}, o, { yaw: o.yaw })), g, a, j);
  void dirL;
  labelW(k, 'מוצא האמה — לנחל קדרון', x + 1, y0 + 3.4, AMAH_Z - 1.5, 0.12);
  if (M.say) labelW(k, M.say, x + 5, y0 + 3.6, AMAH_Z, 0.14);
  if (M.phase === 'work' && !(M.anim > 0)) cueW(k, M, G[0], groundAt(G[0], G[1]), G[1], 1.0, T);
  const V = A0 && A0.view; if (V) k.view(V.p, V.t);
}
export const ganan = mk({
  id: 'ganan', he: 'הגננים במוצא האמה', place: 'ganan',
  fact: { he: GANAN_LINE.text, ref: GANAN_LINE.src },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [1.0, 6.0, -2.6, 2.6, 2.6],
  model: gananModel, draw: gananDraw, target: () => [2.6, 0.9, 1.4],
});
ganan.anchored = { anchor: () => outletAnchor(), draw: gananDrawA, target: (M, k) => { const G = [OUTLET_X + 4.2, AMAH_Z + 1.8]; return k.loc(G[0], groundAt(G[0], G[1]) + 1.4, G[1]); }, mid: [0, 0, 1], bounds: [-2, 4, -3, 3, 3] };
/** the errand: once a day, by the amah's grate in the azara's east (its marker); "+1" (the day's points) */
export const GANAN_TASK = { id: 'ganan', work: 'ganan', from: 'hamemune', fromHe: 'הגזבר', place: 'ganan', openH: 14.5, dueH: 18, pts: 1, icon: '🪙', he: 'הגננים קונים את מי האמה לזבל — רשמו את מעות ההקדש.', src: 'יומא ה, ו' };
export const GANAN_PLACE = { x: -16, z: 14.6, he: 'הסבכה — האמה' };
