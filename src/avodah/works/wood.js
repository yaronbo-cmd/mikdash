/* ── worksa22 ── wood.js — the wood check for worms (מדות ב, ה: the wood chamber in the north-east of עזרת נשים, where kohanim with a
 * blemish looked the wood over; a log with a worm was unfit for the altar). A world craft: eight logs lie on a table; a tap turns the
 * next log over, a second tap sends it where it belongs — a wormy one (a dark line along it and a few dark specks; never an animal) to
 * the side pile on the left, a sound one to the altar's stock on the right (stock.add('wood', n) at the end). A drag chooses the side
 * (a wrong side: the log hops back, "לא כאן — עוד קצת", nothing taken). Nothing red; no blemish drawn on anyone. ── /worksa22 ── */
import { baseModel, makeWork, clamp, ease } from './craft.js';
import { man, ROBE, SKIN } from './figures.js';

const lerp = (a, b, u) => a + (b - a) * u;
const WORMY = [1, 4, 6], TABLE = { a: 3.6, s: 0 }, SIDE = { a: 3.2, s: -4.0 }, STOCK = { a: 3.2, s: 4.0 };
const slot = (i) => ({ a: TABLE.a - 0.5 + (i >> 2) * 1.0, s: -1.8 + (i & 3) * 1.2 });
const LOGC = ['#A9784A', '#B58A5A', '#9C6D42', '#B8895A'];

export function woodModel(o = {}) {
  const wormy = o.wormy || WORMY;
  const M = baseModel('wood', o, {
    n: 8, coach: "הקישו על 'עבודה' — הפכו עץ, ואחר כך שלחו אותו: תולעת — לצד, כשר — למזבח",
    ready: (m) => m.c < 8 && !m.fly && !(m.cur && m.cur.turn > 0 && m.cur.turn < 1),
    tap(m) {
      const L = m.logs[m.c];
      if (!L.turned) { m.cur = L; L.turning = true; m.fx.push({ sfx: 'soft', haptic: 6 }); return; }
      m.go(L.wormy ? -1 : 1, 1);
    },
    aim(m, dx) { const L = m.logs[m.c]; if (!L.turned) { m.twinTap(); return; } m.go(dx < 0 ? -1 : 1, 1.3); },
    step(m, dt) {
      for (const L of m.logs) if (L.turning) { L.turn = Math.min(1, L.turn + dt / 0.45); if (L.turn >= 1) { L.turning = false; L.turned = true; } }
      if (m.fly && m.phase === 'work') {
        const F = m.fly; F.t += dt / 0.6;
        if (F.back) { F.hop = Math.sin(clamp(F.t) * Math.PI) * 0.7; if (F.t >= 1) m.fly = null; }
        else if (F.t >= 1) { const L = F.log; L.sent = F.side; m.fly = null; if (F.side > 0) m.good++; else m.bad++; m.pay([F.side > 0 ? STOCK.a : SIDE.a, F.side > 0 ? STOCK.s : SIDE.s, 1.2]); m.c++; m.advance(); }
      }
    },
  });
  Object.assign(M, {
    logs: Array.from({ length: 8 }, (_, i) => ({ i, wormy: wormy.includes(i), turn: 0, turning: false, turned: false, sent: 0 })), c: 0, cur: null, fly: null, good: 0, bad: 0, stocked: false,
    go(side, power) {
      const L = M.logs[M.c], right = (L.wormy ? -1 : 1) === side;
      if (!right) { M.fly = { back: true, t: 0, hop: 0, log: L }; M.slip('לא כאן — עוד קצת'); M.fx.push({ sfx: 'soft', haptic: 6 }); return; }
      M.fly = { t: 0, side, power, log: L }; M.fx.push({ sfx: 'soft', haptic: 8 });
    },
  });
  M.onEnd = (ctx) => { if (M.stocked) return; M.stocked = true; try { if (M.good && ctx && ctx.stock && typeof ctx.stock.add === 'function') ctx.stock.add('wood', M.good); } catch (e) { /* the stock's */ } };
  return M;
}
function logAt(k, L, a, s, y) {
  // a log lies across the table (along s); it turns about its own axis: the underside (where the dark line is) comes up
  const base = LOGC[L.i % 4], rot = L.turn * Math.PI, r = 0.2;
  k.c(a, s, y, r, 1.05, base, { yaw: -Math.PI / 2, pitch: Math.PI / 2 });
  const sa = Math.sin(rot) * r * 1.02, sy = -Math.cos(rot) * r * 1.02;   // (the mark's place on the round: starts underneath, ends on top)
  if (L.wormy) {
    k.b(a + sa, s, y + sy, 0.9, 0.05, 0.05, '#3A2A1C');
    for (let z = 0; z < 4; z++) k.s(a + sa * 1.0, s - 0.36 + z * 0.24, y + sy + (z & 1 ? 0.02 : -0.02), 0.04, 0.04, 0.04, '#2A1E14');
  } else k.b(a + sa, s, y + sy, 0.8, 0.22, 0.03, '#C79B66');
}
function woodDraw(k, M, T) {
  if (!M) return;
  // the table, the chamber's back wall, the two piles
  k.b(TABLE.a, TABLE.s, 0.45, 5.6, 2.6, 0.18, '#8A6A45');
  for (const [da, ds] of [[-1.0, -2.6], [-1.0, 2.6], [1.0, -2.6], [1.0, 2.6]]) k.b(TABLE.a + da, TABLE.s + ds, 0.22, 0.2, 0.2, 0.44, '#6E5236');
  k.b(6.3, 0, 1.3, 9.0, 0.4, 2.6, '#CFC3A7'); k.b(6.1, 0, 2.7, 9.2, 0.7, 0.2, '#B9AC8E');
  for (const [P, bad] of [[SIDE, true], [STOCK, false]]) {
    k.b(P.a, P.s, 0.08, 2.4, 2.0, 0.16, bad ? '#8A7F6C' : '#CDB46A');
    const n = bad ? M.bad : M.good;
    for (let j = 0; j < n; j++) { const row = j % 3, lev = (j / 3) | 0; k.c(P.a - 0.5 + row * 0.5, P.s, 0.26 + lev * 0.34, 0.17, 1.05, LOGC[(j + (bad ? 1 : 3)) % 4], { pitch: Math.PI / 2, yaw: -Math.PI / 2 }); if (bad) k.b(P.a - 0.5 + row * 0.5, P.s, 0.26 + lev * 0.34 + 0.17, 1.0, 0.05, 0.03, '#3A2A1C'); }
    k.label(bad ? 'תולעת — לצד' : 'כשרים — למזבח', P.a + 0.2, P.s, 2.0, 0.3);
  }
  // the logs on the table (the one in flight leaves its place); the current one is ringed
  for (const L of M.logs) {
    if (L.sent) continue;
    const S = slot(L.i), isFly = M.fly && M.fly.log === L;
    let a = S.a, s = S.s, y = 0.76;
    if (isFly && !M.fly.back) { const u = ease(clamp(M.fly.t)), P = M.fly.side > 0 ? STOCK : SIDE; a = lerp(S.a, P.a, u); s = lerp(S.s, P.s, u); y = 0.76 + Math.sin(u * Math.PI) * 1.8; }
    else if (isFly) y += M.fly.hop;
    // the turn: it rolls over on the table (a small lift at the middle)
    y += Math.sin(L.turn * Math.PI) * 0.5;
    logAt(k, L, a, s, y);
  }
  const cur = M.logs[M.c];
  if (cur && M.phase === 'work' && !M.fly) { const S = slot(cur.i), r = 0.75 + 0.08 * Math.sin(T * 5); k.ring(S.a, S.s, 0.55, r); if (cur.turned) k.s(S.a, S.s, 1.6 + 0.1 * Math.sin(T * 5), 0.12, 0.12, 0.12, '!#FFD24A'); }
  // the kohen at the table (a man with a blemish did this work; nothing of it is drawn) and the lamp over it
  man(k, TABLE.a + 2.3, -1.0, 0, { robe: ROBE.kohen, yaw: Math.PI * 0.55 * 0 + 2.2, skin: SKIN[1] });
  k.s(5.2, 0, 2.6, 0.14, 0.17, 0.14, '!#FFD27A'); k.torch(5.0, 0, 2.5, 0.8);
  k.label('לשכת העצים', 5.6, 0, 3.3, 0.3);
  if (M.warn) k.label(M.warn, 3.0, 0, 2.6, 0.32);
}
export const wood = makeWork({
  id: 'wood', he: 'בדיקת העצים לתולעים', place: 'wood',
  fact: { he: 'בלשכת העצים בעזרת נשים כהנים בעלי מומים בודקים את העצים, וכל עץ שנמצא בו תולעת פסול למזבח. כך מגיעים למזבח רק עצים שלמים', ref: 'מדות ב, ה', illus: false },
  stage: { ahead: -1.2, lat: 0, K: 1.45 }, bounds: [1.4, 6.2, -4.8, 4.8, 2.2],
  model: woodModel, draw: woodDraw, target: (M) => { const L = M.logs[Math.min(7, M.c)], S = slot(L.i); return M.fly && !M.fly.back ? [M.fly.side > 0 ? STOCK.a : SIDE.a, M.fly.side > 0 ? STOCK.s : SIDE.s, 1.4] : [S.a, S.s, 1.3]; },
});
