/* ── worksa22 ── pen.js — the pen by day (PHASEB-DAY-DESIGN §3, "יום": הדיר: מים, מספוא, מיון חדשים/מבוקרים) — a world craft, and a
 * המחשה: the Mishnah gives the lambs one watering (a golden cup before the slaughter, תמיד ג, ד) and says nothing of feeding, a trough or a
 * sorting; the game shows animals that are looked after. The mentor line says so.
 *   1. water  — hold = pouring (the level rises), or three taps (a third each);
 *   2. fodder — three taps: a bundle of hay from the pile into the manger;
 *   3. sort   — four lambs come in at the gate: a tap sends it where it belongs (a lamb with a gold ear-tag is "מבוקר", the others
 *               "חדשים"); a drag chooses (left / right) — a wrong side: the lamb hops back, "לא כאן — עוד קצת", nothing taken.
 * Nothing red; no blemish; no wound. ── /worksa22 ── */
import { baseModel, makeWork, clamp, ease } from './craft.js';
import { man, lamb, ROBE, SKIN } from './figures.js';

const lerp = (a, b, u) => a + (b - a) * u;
const STONE = '#CFC3A7', STONE2 = '#B9AC8E', WOODC = '#8A6A45', HAYC = '#D9C07A';
const TROUGH = { a: 5.0, s: -1.7 }, MANGER = { a: 5.0, s: 1.7 }, BARREL = { a: 5.0, s: -4.2 }, HAY = { a: 5.4, s: 4.0 }, GATE = { a: 6.8, s: 0 }, MID = { a: 2.7, s: 0 };
const PEN_NEW = { a: 3.5, s: -3.9 }, PEN_CHK = { a: 3.5, s: 3.9 };
const ORDER = ['new', 'checked', 'checked', 'new'];   // the four arrivals

export function penModel(o = {}) {
  const M = baseModel('pen', o, {
    n: 10, holds: true, coach: "הקישו על 'עבודה' — מים (אפשר להחזיק), מספוא, ומיון הטלאים: חדשים לשמאל, מבוקרים (תג זהב) לימין",
    ready: (m) => (m.sub === 'water' ? true : m.sub === 'fodder' ? !m.fly && m.hay < 3 : m.sub === 'sort' ? m.lam && m.lam.mode === 'wait' : false),
    press(m, down) { if (m.sub === 'water') m.pour = !!down; },
    tap(m) {
      if (m.sub === 'water') { m.wTarget = Math.max(m.wTarget, Math.min(1, (m.wDone + 1) / 3)); m.pourT = 0.7; m.fx.push({ sfx: 'soft', haptic: 8 }); }
      else if (m.sub === 'fodder') { m.fly = { t: 0 }; m.fx.push({ sfx: 'soft', haptic: 8 }); }
      else if (m.sub === 'sort') m.send(m.lam.kind === 'new' ? -1 : 1, 1);
    },
    aim(m, dx) {
      if (m.sub === 'sort') m.send(dx < 0 ? -1 : 1, 1.3);
      else m.twinTap();
    },
    step(m, dt) {
      if (m.sub === 'water') {
        if (m.pour && m.phase === 'work') { m.wTarget = Math.min(1, m.wTarget + dt / 2.1); m.pourT = 0.25; }
        m.pourT = Math.max(0, m.pourT - dt);
        m.water += (Math.min(m.wTarget, m.water + dt / 1.7) - m.water);
        while (m.wDone < 3 && m.water >= (m.wDone + 1) / 3 - 0.001) { m.wDone++; m.pay([TROUGH.a, TROUGH.s, 0.9]); m.advance(); }
        if (m.wDone >= 3 && m.phase === 'work') { m.mt = (m.mt || 0) + dt; if (m.mt > 0.9) { m.sub = 'fodder'; m.mt = 0; } }
      } else if (m.sub === 'fodder') {
        if (m.fly) { m.fly.t += dt / 0.5; if (m.fly.t >= 1) { m.fly = null; m.hay++; m.pay([MANGER.a, MANGER.s, 1.1]); m.advance(); } }
        if (m.hay >= 3 && !m.fly && m.phase === 'work') { m.mt = (m.mt || 0) + dt; if (m.mt > 0.9) { m.sub = 'sort'; m.mt = 0; m.next(); } }
      } else if (m.sub === 'sort' && m.lam) {
        const L = m.lam; L.t += dt;
        if (L.mode === 'in') { const u = clamp(L.t / 1.5); L.a = lerp(GATE.a, MID.a, ease(u)); L.s = lerp(GATE.s, MID.s, ease(u)); L.yaw = Math.PI; if (u >= 1) { L.mode = 'wait'; L.t = 0; } }
        else if (L.mode === 'go') {
          const u = clamp(L.t / 1.1), P = L.side < 0 ? PEN_NEW : PEN_CHK; L.a = lerp(MID.a, P.a, ease(u)); L.s = lerp(MID.s, P.s, ease(u)); L.yaw = Math.atan2(P.s - MID.s, P.a - MID.a);
          if (u >= 1) { L.mode = 'in-pen'; m.penned[L.side < 0 ? 0 : 1]++; m.pay([P.a, P.s, 1.3], L.power > 1.2 ? '' : ''); m.advance(); m.lam = null; if (m.phase === 'work') m.next(); }
        } else if (L.mode === 'back') { const u = clamp(L.t / 0.5); L.hop = Math.sin(u * Math.PI) * 0.5; if (u >= 1) { L.mode = 'wait'; L.t = 0; L.hop = 0; } }
      }
    },
  });
  Object.assign(M, {
    sub: 'water', pour: false, pourT: 0, water: 0, wTarget: 0, wDone: 0, fly: null, hay: 0, lam: null, sorted: 0, penned: [0, 0], mt: 0,
    next() { const kind = ORDER[M.sorted++ % ORDER.length]; M.lam = { kind, a: GATE.a, s: GATE.s, yaw: Math.PI, mode: 'in', t: 0, side: 0, hop: 0, power: 1 }; },
    send(side, power) {
      const L = M.lam; if (!L || L.mode !== 'wait') return;
      const right = (L.kind === 'new' ? -1 : 1) === side;
      if (!right) { L.mode = 'back'; L.t = 0; M.slip('לא כאן — עוד קצת'); M.fx.push({ sfx: 'soft', haptic: 6 }); return; }
      L.mode = 'go'; L.t = 0; L.side = side; L.power = power; M.fx.push({ sfx: 'soft', haptic: 8 });
    },
  });
  return M;
}

function penDraw(k, M, T) {
  if (!M) return;
  // the fence behind, the two small pens in front, the gate at the back
  for (let i = 0; i < 9; i++) { const s = -4.8 + i * 1.2; if (Math.abs(s) < 1.0) continue; k.c(6.8, s, 0.7, 0.09, 1.4, WOODC); }
  k.b(6.8, -3.0, 1.1, 3.6, 0.1, 0.1, WOODC); k.b(6.8, 3.0, 1.1, 3.6, 0.1, 0.1, WOODC); k.b(6.8, -3.0, 0.6, 3.6, 0.1, 0.1, WOODC); k.b(6.8, 3.0, 0.6, 3.6, 0.1, 0.1, WOODC);
  k.c(6.8, -0.9, 0.9, 0.12, 1.8, WOODC); k.c(6.8, 0.9, 0.9, 0.12, 1.8, WOODC); k.b(6.8, 0, 1.85, 2.0, 0.14, 0.14, WOODC);
  for (const [P, tag] of [[PEN_NEW, 'חדשים'], [PEN_CHK, 'מבוקרים']]) {
    for (const [da, ds, w, d] of [[-1.15, 0, 2.3, 0.1], [1.15, 0, 2.3, 0.1], [0, -1.15, 0.1, 2.3], [0, 1.15, 0.1, 2.3]]) k.b(P.a + da, P.s + ds, 0.17, w, d, 0.34, STONE2);
    k.b(P.a, P.s, 0.03, 2.2, 2.2, 0.06, '#CDB46A');
    if (M.sub === 'sort') k.label(tag, P.a, P.s, 1.5, 0.3);
  }
  // the trough with water, the manger with hay
  k.b(TROUGH.a, TROUGH.s, 0.3, 2.6, 1.0, 0.6, STONE);
  const wl = clamp(M.water) * 0.46; if (wl > 0.02) k.b(TROUGH.a, TROUGH.s, 0.1 + wl / 2 + 0.2, 2.3, 0.72, wl, '!#5FA8E6');
  k.b(MANGER.a, MANGER.s, 0.3, 2.6, 1.0, 0.5, WOODC); k.b(MANGER.a - 0.5, MANGER.s, 0.7, 2.6, 0.08, 0.6, WOODC);
  for (let h = 0; h < M.hay; h++) k.b(MANGER.a, MANGER.s - 0.9 + h * 0.9, 0.62 + 0.02 * h, 0.8, 0.75, 0.28, HAYC, { yaw: 0.2 * h });
  // the barrel (pours when held or tapped) and its stream
  const tilt = M.sub === 'water' ? clamp(M.pourT / 0.25) * 0.7 : 0;
  k.c(BARREL.a, BARREL.s, 0.7 + 0.1 * tilt, 0.5, 1.1, '#7A5535', { roll: tilt });
  k.c(BARREL.a, BARREL.s, 0.74, 0.52, 0.06, '#4A3220'); k.c(BARREL.a, BARREL.s, 0.45, 0.52, 0.06, '#4A3220');
  if (M.sub === 'water' && M.pourT > 0 && M.wDone < 3) for (let z = 0; z < 5; z++) { const u = (z / 5 + T * 2.2) % 1; k.s(lerp(BARREL.a, TROUGH.a, u), lerp(BARREL.s + 0.55, TROUGH.s - 0.8, u), 1.15 - 0.55 * u * u - 0.2 * u + 0.1, 0.07, 0.09, 0.07, '!#5FA8E6'); }   // (a stream in an arc: pale blue beads)
  // the hay pile
  for (let j = 0; j < Math.max(0, 5 - M.hay - (M.fly ? 1 : 0)); j++) k.b(HAY.a + (j % 2) * 0.2, HAY.s + (j - 2) * 0.12, 0.2 + j * 0.2, 1.3 - j * 0.1, 1.2, 0.34, HAYC, { yaw: j * 0.3 });
  if (M.fly) { const u = ease(M.fly.t); k.b(lerp(HAY.a, MANGER.a, u), lerp(HAY.s, MANGER.s - 0.9 + (M.hay) * 0.9, u), 0.9 + Math.sin(u * Math.PI) * 1.6, 0.75, 0.8, 0.28, HAYC, { yaw: u * 3 }); }
  // the shepherd
  man(k, 6.0, -3.2, 0, { robe: ROBE.worker, yaw: Math.PI * 0.8, skin: SKIN[2], cap: '#7A6A52', arms: M.sub === 'water' && M.pourT > 0 ? 0.5 : 0.1 });
  // the flock in the pen: a ram and two lambs; heads down at the trough / manger when it is full
  const drinks = M.wDone >= 3, eats = M.hay >= 3;
  lamb(k, 6.0, -0.9, 0, { yaw: -1.2, scale: 0.9, head: drinks ? 0 : 0.6, t: T }); lamb(k, 6.1, 1.0, 0, { yaw: 1.3, scale: 0.85, head: eats ? 0 : 0.6, t: T });
  lamb(k, 6.0, 2.8, 0, { yaw: 2.3, scale: 0.8, head: 0.5, t: T, wool: '#E9E1CF' });
  // the arrival
  const L = M.lam;
  if (L) {
    lamb(k, L.a, L.s, 0.0 + (L.hop || 0), { yaw: L.yaw, scale: 1.2, mark: L.kind === 'checked', step: T * (L.mode === 'in' || L.mode === 'go' ? 8 : 0), t: T, head: 0.6 });
    if (L.mode === 'wait' && M.phase === 'work') { const r = 0.9 + 0.1 * Math.sin(T * 5); k.ring(MID.a, MID.s, 0.02, r); }
  }
  // the lambs already sorted stand in their pens
  for (let i = 0; i < M.penned[0]; i++) lamb(k, PEN_NEW.a - 0.3 + i * 0.5, PEN_NEW.s - 0.3 + (i % 2) * 0.6, 0, { yaw: 0.6 + i, scale: 0.9, t: T });
  for (let i = 0; i < M.penned[1]; i++) lamb(k, PEN_CHK.a - 0.3 + i * 0.5, PEN_CHK.s - 0.3 + (i % 2) * 0.6, 0, { yaw: 0.6 + i, scale: 0.9, mark: true, t: T });
  if (M.sub === 'water') { const r = 0.9 + 0.1 * Math.sin(T * 5); k.ring(BARREL.a, BARREL.s, 0.02, r); }
  if (M.sub === 'fodder' && !M.fly) { const r = 0.9 + 0.1 * Math.sin(T * 5); k.ring(HAY.a, HAY.s, 0.02, r); }
  k.label('המחשה', 2.0, 4.4, 1.0, 0.22, { bg: 'rgba(226,236,224,.92)' });
  if (M.warn) k.label(M.warn, 2.7, 0, 2.6, 0.32);
}
export const pen = makeWork({
  id: 'pen', he: 'הדיר ביום', place: 'pen',
  fact: { he: 'המשנה מזכירה רק השקאה אחת של התמיד — בכוס של זהב לפני השחיטה. מים, מספוא ומיון חדשים ומבוקרים בדיר הם המחשה של המשחק', ref: 'תמיד ג, ד; ערכין ב, ה', illus: true },
  stage: { ahead: -1.4, lat: 0, K: 1.3 }, bounds: [1.6, 7.0, -4.8, 4.8, 2.2],
  model: penModel, draw: penDraw, target: (M) => (M.sub === 'water' ? [TROUGH.a, TROUGH.s, 1.1] : M.sub === 'fodder' ? [MANGER.a, MANGER.s, 1.3] : M.lam ? [M.lam.a, M.lam.s, 1.6] : [MID.a, MID.s, 1.6]),
});
