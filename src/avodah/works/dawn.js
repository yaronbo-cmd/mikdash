/* ── tamida23 ── dawn.js — the Tamid's dawn as world crafts under two thumbs (WAVE23-BRIEF "The Tamid crafts"), on WORKSA22's kit
 * (craft.js makeWork / baseModel · kit.js · figures.js — no third kit). Each work: an acts.js model (taps alone finish it; a miss is
 * "עוד קצת", never a penalty) + a diorama set down beside the אמרכל; the kohanim act on the player's taps; the "+N" is born on the piece;
 * the source line comes after the end (dawnreg.js). This file: the פיס (counting, never luck), תרומת הדשן, המערכה, הטלה, ברקאי.
 * The rest (the gates, the lamps at the door, the screen and the vessel, the parts to the ramp) — dawn2.js. Nothing red, no blood,
 * no Divine Name. Local frame of a stage: a = along his line (away from him), s = to his right, y = up. ── /tamida23 ── */
import { baseModel, makeWork, clamp, ease, caAct, caBonus } from './craft.js';
import { evBegin, evTick, evResolve } from './slice27.js';   // ── slice27 ── ── /slice27 ──
import { man, lamb, flame, ROBE, SKIN } from './figures.js';

export const lerp = (a, b, u) => a + (b - a) * u;
/** makeWork, keeping the stage's bounds on the work (dawnreg.js refits a stage that landed on a solid) */
export const mk = (def) => Object.assign(makeWork(def), { bounds: def.bounds });
export const STONE = '#CFC3A7', STONE2 = '#B9AC8E', SILVER = '#C9CED6', GOLD = '#E2B84A', ASH = '#8E8A82', LINEN = '#EFE9DA';
export const WOODS = ['#7A5535', '#6E4A2A', '#85603C'];
export const CAP_MEMUNE = '#B59B62';
/** an act graded by the work itself (a timing act: q 0 ok · 1 good · 2 gold), its "+N" born at [a, s, y] */
export function payQ(M, at, q, say) { if (at) M.last = at; const a = caAct(M, M.firstTry ? q : Math.min(q, 1), { x: 0.5, y: 0.35, say: say || '' }); M.firstTry = true; return a; }
/** the ממונה (a kohen with a darker cap) pointing toward (ta, ts) */
export function memune(k, a, s, ta, ts, arms = 0.55, T = 0) { man(k, a, s, 0, { robe: ROBE.kohen, cap: CAP_MEMUNE, yaw: Math.atan2(ts - s, ta - a), arms: arms + 0.04 * Math.sin(T * 2), skin: SKIN[2] }); }
/** a ring that breathes over the next thing to touch (bigger while the right thumb is down) */
export function cue(k, M, a, s, y, r = 0.8, T = 0) { if (M.phase !== 'work') return; k.ring(a, s, y + 0.02, (r + 0.08 * Math.sin(T * 5)) * (M.pressed ? 1.22 : 1)); }
export function says(k, M) { if (M.say) k.label(M.say, 3.2, 0, 3.5, 0.42); if (M.warn) k.label(M.warn, 2.6, 0, 3.0, 0.34, { bg: 'rgba(240,244,255,.94)' }); }
export const tickSay = (m, dt) => { if (m.sayT > 0) { m.sayT -= dt; if (m.sayT <= 0) m.say = ''; } };

/* ───────────────────────────── 1. הפיס — counting the fingers (יומא ב, א; תמיד א, ב) ───────────────────────────── */
const SEATS = 8, PC = { a: 3.5, s: 0 }, PR = 2.35;
const FINGERS = [1, 2, 1, 1, 2, 2, 1, 2];
export const PAYIS_KIND = {
  payis: { N: 14, wins: 'זכה בתרומת הדשן' },
  payis2: { N: 17, wins: 'זכה בשחיטה — ושאר התפקידים אחריו' },
};
const seat = (i) => { const t = Math.PI + i / SEATS * Math.PI * 2; return { a: PC.a + Math.cos(t) * PR * 0.78, s: PC.s + Math.sin(t) * PR }; };
/** the count from seat `start`: how many kohanim are counted until the number ends, and on whom */
export function payisPlan(N, start = 0) { let c = 0, j = 0; const seq = []; while (c < N) { const i = (start + j) % SEATS; seq.push({ i, from: c + 1, to: c + FINGERS[i] }); c += FINGERS[i]; j++; } return { seq, win: seq[seq.length - 1].i, n: seq.length }; }
export function payisModel(o = {}, kind = 'payis') {
  const K = PAYIS_KIND[kind] || PAYIS_KIND.payis, P = payisPlan(K.N, 0);
  const M = baseModel(kind, o, {
    n: P.n, coach: `הקישו על 'עבודה' — הממונה אמר ${K.N}: סופרים את האצבעות, כהן אחר כהן בתור`,
    ready: (m) => m.anim <= 0,
    tap(m) {
      const c = P.seq[m.j], S = seat(c.i); m.j++; m.counted[c.i] = (m.counted[c.i] | 0) + 1; m.anim = 0.32; m.hand = c.i;
      const nums = []; for (let x = c.from; x <= c.to; x++) nums.push(x); m.say = nums.join(', ') + (m.j >= P.n ? '!' : ''); m.sayT = 1.6;
      m.pay([S.a, S.s, 2.2]); m.fx.push({ sfx: 'soft', haptic: 8 });
      if (m.j >= P.n) { m.win = c.i; m.say = `${K.N}! — ${K.wins}`; m.sayT = 9; }
      m.advance();
    },
    /** the aimed act: a drag toward a kohen — the next in turn counts; another one is "לא — הבא בתור" (nothing taken) */
    aim(m, dx, dy) {
      const ang = Math.atan2(dx, -dy); let best = 0, bd = 9;
      for (let i = 0; i < SEATS; i++) { const S = seat(i), t = Math.atan2(S.s - PC.s, S.a - (PC.a - PR)), d = Math.abs(Math.atan2(Math.sin(t - ang), Math.cos(t - ang))); if (d < bd) { bd = d; best = i; } }
      if (best !== P.seq[m.j].i && bd < 0.5) { m.slip('לא — הבא בתור'); return; }
      M.twinTap();
    },
    step(m, dt) { if (m.anim > 0) m.anim -= dt; tickSay(m, dt); },
  });
  Object.assign(M, { plan: P, N: K.N, j: 0, counted: [], anim: 0, hand: -1, win: -1, sayT: 0, start: 0, fingers: FINGERS });
  return M;
}
function payisDraw(k, M, T) {
  if (!M) return;
  k.b(PC.a, PC.s, 0.02, 6.2, 5.0, 0.04, '#D8CDB2');                                                                  // the chamber's floor
  const next = M.j < M.plan.n ? M.plan.seq[M.j].i : -1;
  for (let i = 0; i < SEATS; i++) {
    const S = seat(i), face = Math.atan2(PC.s - S.s, PC.a - S.a), win = M.win === i, hat = i === M.start;
    man(k, S.a, S.s, 0, { robe: ROBE.kohen, yaw: face, arms: 0.85, skin: SKIN[i % 3], cap: hat ? SKIN[i % 3] : undefined, lean: win ? 0.3 * Math.sin(T * 4) : 0 });
    // the raised fingers (one or two, never the thumb — יומא ב, א): pale upright pegs over the hands
    const f = FINGERS[i], hy = 1.62, ca = S.a + Math.cos(face) * 0.42, cs = S.s + Math.sin(face) * 0.42;
    for (let x = 0; x < f; x++) { const off = (x - (f - 1) / 2) * 0.12; k.c(ca - Math.sin(face) * off, cs + Math.cos(face) * off, hy, 0.035, 0.24, SKIN[i % 3]); }
    if (M.counted[i]) k.s(S.a, S.s, 2.15, 0.1, 0.1, 0.1, '!#FFD24A');
    if (i === M.hand && M.anim > 0) k.ring(S.a, S.s, 0.03, 0.55 + (0.32 - M.anim) * 1.5, '!#FFE08A', 14);
    if (i === next) cue(k, M, S.a, S.s, 0, 0.62, T);
    if (win) { k.ring(S.a, S.s, 0.03, 0.75 + 0.06 * Math.sin(T * 6), '!#FFD24A', 18); k.s(S.a, S.s, 2.45 + 0.08 * Math.sin(T * 5), 0.16, 0.16, 0.16, '!#FFE08A'); }
  }
  // the ממונה in the middle: the hat he took (the count starts from that one — יומא כה, א) in his left hand; his right points at the one being counted
  const tgt = seat(M.hand >= 0 ? M.hand : 0);
  memune(k, PC.a + 0.3, PC.s, tgt.a, tgt.s, 0.7, T);
  k.s(PC.a + 0.2, PC.s - 0.42, 1.0, 0.18, 0.1, 0.18, '#F4EFE3');
  k.label(`הממונה: ${M.N}`, PC.a + 2.2, 0, 3.3, 0.34);
  says(k, M);
}
const payisFact = { he: 'הכהנים עומדים במעגל ומצביעים באצבע או בשתיים; הממונה נוטל מצנפת מראש אחד, אומר מספר ומונה — את האצבעות, לא את האנשים; ומי שעליו נגמר המספר זוכה. זו ספירה גלויה, לא מזל', ref: 'יומא ב, א; יומא כה, א; תמיד א, ב' };
export const payis = mk({
  id: 'payis', he: 'הפיס — ספירת האצבעות', place: 'gazit', fact: payisFact,
  stage: { ahead: -0.6, lat: 0, K: 1.5 }, bounds: [1.0, 5.6, -3.0, 3.0, 2.6],
  model: (o) => payisModel(o, 'payis'), draw: payisDraw,
  target: (M) => { const c = M.plan.seq[Math.min(M.j, M.plan.n - 1)]; const S = seat(c.i); return [S.a, S.s, 2.2]; },
});
export const payis2 = mk({
  id: 'payis2', he: 'הפיס השני — שלושה עשר', place: 'gazit',
  fact: { he: 'הפיס השני: באו והפיסו — מי שוחט, מי זורק, מי מדשן מזבח הפנימי, מי מדשן את המנורה ומי מעלה אברים לכבש; הזוכה בשחיטה — ושאר התפקידים אחריו בתור. הספירה גלויה, לא מזל', ref: 'תמיד ג, א; יומא ב, ג' },
  stage: { ahead: -0.6, lat: 0, K: 1.5 }, bounds: [1.0, 5.6, -3.0, 3.0, 2.6],
  model: (o) => payisModel(o, 'payis2'), draw: payisDraw,
  target: (M) => { const c = M.plan.seq[Math.min(M.j, M.plan.n - 1)]; const S = seat(c.i); return [S.a, S.s, 2.2]; },
});

/* ───────────────────────────── 2. תרומת הדשן (תמיד א, ד; ב, א–ב) ───────────────────────────── */
const RAMP = { a0: 0.7, a1: 3.4, h: 1.7 }, TOP = { a0: 3.4, a1: 6.0 }, FIRE = { a: 5.1, s: 0.2 }, LAY = { a: 1.3, s: 1.9 }, TAPUACH = { a: 4.5, s: -1.3 };
const rampY = (a) => (a <= RAMP.a0 ? 0 : a >= RAMP.a1 ? RAMP.h : (a - RAMP.a0) / (RAMP.a1 - RAMP.a0) * RAMP.h);
export function altarRamp(k, T, o = {}) {
  // the altar's body (the near part of it: its top at 1.7), the ramp up to it, the fire on top (small, steady: the pyre, never danger)
  k.b((TOP.a0 + TOP.a1) / 2 + 0.3, 0, RAMP.h / 2, 5.0, TOP.a1 - TOP.a0 + 0.6, RAMP.h, STONE);
  for (const [a, s] of [[TOP.a0 + 0.2, -2.3], [TOP.a0 + 0.2, 2.3], [TOP.a1 + 0.4, -2.3], [TOP.a1 + 0.4, 2.3]]) k.b(a, s, RAMP.h + 0.18, 0.36, 0.36, 0.36, STONE2);   // the horns
  const L = Math.hypot(RAMP.a1 - RAMP.a0, RAMP.h), ang = Math.atan2(RAMP.h, RAMP.a1 - RAMP.a0);
  k.b((RAMP.a0 + RAMP.a1) / 2, 0, RAMP.h / 2, 1.8, L, 0.16, STONE2, { pitch: -ang });
  for (let j = 0; j < 4; j++) { const a = RAMP.a0 + (j + 0.5) * (RAMP.a1 - RAMP.a0) / 4, h = rampY(a) - 0.12; if (h > 0.05) k.b(a, 0, h / 2, 1.6, (RAMP.a1 - RAMP.a0) / 4, h, STONE); }
  if (o.fire !== false) {
    const f = o.fire == null ? 1 : o.fire;
    for (let j = 0; j < 3; j++) k.c(FIRE.a + (j - 1) * 0.25, FIRE.s, RAMP.h + 0.12 + (j & 1) * 0.1, 0.1, 1.2, WOODS[j], { yaw: j * 0.7, pitch: Math.PI / 2 });
    k.c(FIRE.a, FIRE.s, RAMP.h + 0.06, 0.62, 0.05, '!#FFB347');
    for (let j = 0; j < 3; j++) flame(k, FIRE.a + Math.cos(j * 2.1) * 0.25, FIRE.s + Math.sin(j * 2.1) * 0.25, RAMP.h + 0.2, (0.5 + 0.1 * Math.sin(T * 5 + j)) * f, T + j);
    k.torch(FIRE.a, FIRE.s, RAMP.h + 1.2, 0.7 * f);
  }
}
// ── slice27 ── תרומת הדשן is the CARRY work (PLAY27 §א 4): up the ramp with the silver מחתה — a small "steady hands" meter on it; the
// left stick's jitter on the way spills a little ash (a grey puff) and the carry is good, not gold; still hands = gold. At the top: HOLD the
// button — the מחתה dips into the inner coals; let go when it is full (the gold mark) = gold; a plain tap scoops too (good). Down; a tap
// lays the coals east of the ramp. L2: a torch in the dark, the gold mark narrower, the hands must be steadier. The sample EVENT (EVENTS27
// 'coal'): on the way down a coal drops from the מחתה onto the ramp — the walk waits, a ring on it, one tap puts it out (gold, "המחשה").
export const DESHEN27 = { fill: 1.1, gold1: 0.15, gold2: 0.08, steady1: 0.8, steady2: 0.88 };
const s27stick = () => { try { const T = globalThis.__TWIN; const s = T && T.stick ? T.stick() : null; return s && s.on ? s : null; } catch (e) { return null; } };
export function deshenModel(o = {}) {
  const L2 = !!o.l2;
  const M = baseModel('deshen', o, {
    n: 7, coach: "הקישו על 'עבודה' — לעלות בכבש בידיים יציבות; למעלה החזיקו — חותים; לרדת ולצבור; ואחר כך האפר אל התפוח",
    ready: (m) => !m.mv || !!m.ev27,
    tap(m) {
      if (m.ev27) { evResolve(m, (pts, say) => caBonus(m, pts, say)); return; }   // (the coal: one tap puts it out)
      if (m.t < m.swallow) return;   // (the tap that ends a hold is not a second act)
      const i = m.i;
      if (i === 0) m.mv = { t: 0, d: 1.3, from: { a: 0.4, s: 0 }, to: { a: FIRE.a - 0.75, s: FIRE.s }, act: 'up' };
      else if (i === 1) m.mv = { t: 0, d: 0.6, act: 'scoop' };
      else if (i === 2) m.mv = { t: 0, d: 1.4, from: { a: FIRE.a - 0.75, s: FIRE.s }, to: { a: 0.5, s: 0.1 }, act: 'down' };
      else if (i === 3) m.mv = { t: 0, d: 0.8, from: { a: 0.5, s: 0.1 }, to: { a: LAY.a - 0.5, s: LAY.s - 0.25 }, act: 'lay' };
      else m.mv = { t: 0, d: 0.45, act: 'ash' };
      if (i === 0 || i === 2) { m.steady = 1; m.spilt = 0; }
      m.fx.push({ sfx: 'soft', haptic: 8 });
    },
    press(m, down) {   // the hold at the top: the scoop
      if (m.i <= 2) (m.pl27 = m.pl27 || []).push([down ? 1 : 0, +m.t.toFixed(2), m.i, !!m.mv, +(m.fill || 0).toFixed(2)]);   // (tests)
      if (m.phase !== 'work' || m.i !== 1 || m.mv) { m.hold27 = null; return; }
      if (down) { m.hold27 = { t0: m.t }; m.fill = 0; return; }
      const h = m.hold27; m.hold27 = null; if (!h || m.t - h.t0 < 0.25) return;
      m.swallow = m.t + 0.4; m.scoopQ = Math.abs(m.fill - 1) <= (L2 ? DESHEN27.gold2 : DESHEN27.gold1) ? 2 : 1; m.mv = { t: 0.5, d: 0.6, act: 'scoop', held: true };
    },
    step(m, dt) {
      tickSay(m, dt);
      if (m.hold27 && !m.mv) { m.fill += dt / DESHEN27.fill; if (m.fill >= 1.45) { m.hold27 = null; m.swallow = m.t + 0.4; m.scoopQ = 1; m.mv = { t: 0.5, d: 0.6, act: 'scoop', held: true }; } }
      if (m.evPut > 0) m.evPut -= dt;
      const v = m.mv; if (!v || m.phase !== 'work') return;
      if (m.ev27) { m.ev27.t += dt; return; }   // (the walk waits for the coal)
      // the steady hands: the stick's jitter while he carries (none when the stick is not touched)
      if (v.act === 'up' || v.act === 'down') {
        const st = s27stick();
        if (st) { const d = m.st0 ? Math.hypot(st.dx - m.st0[0], st.dy - m.st0[1]) : 0; m.st0 = [st.dx, st.dy]; const lose = Math.min(0.25, d / 260); if (lose > 0.01) { m.steady = Math.max(0, m.steady - lose); if (m.steady < 0.75 - m.spilt * 0.2) { m.spilt++; m.spillT = 0.8; m.fx.push({ sfx: 'soft', haptic: 6 }); } } }
        else m.st0 = null;
        m.steady = Math.min(1, m.steady + dt * 0.06);
        if (evTick(m, 'deshen')) return;
      }
      if (m.spillT > 0) m.spillT -= dt;
      v.t += dt / v.d; const u = ease(clamp(v.t));
      if (v.from) { m.k1.a = lerp(v.from.a, v.to.a, u); m.k1.s = lerp(v.from.s, v.to.s, u); m.k1.yaw = Math.atan2(v.to.s - v.from.s, v.to.a - v.from.a); }
      if (v.t < 1) return;
      m.mv = null;
      const carryQ = m.steady >= (L2 ? DESHEN27.steady2 : DESHEN27.steady1) ? 2 : 1;
      if (v.act === 'up') { m.k1.yaw = 0; payQ(m, [FIRE.a, FIRE.s, RAMP.h + 1.2], carryQ, carryQ >= 2 ? 'ידיים יציבות' : 'לבדו, לאור המערכה'); }
      else if (v.act === 'scoop') { m.full = true; m.fill = 1; payQ(m, [FIRE.a, FIRE.s, RAMP.h + 1.0], v.held ? m.scoopQ : 1, v.held && m.scoopQ >= 2 ? 'מלאה — מן הפנימיות' : 'מן הפנימיות'); }
      else if (v.act === 'down') { m.k1.yaw = Math.atan2(LAY.s - m.k1.s, LAY.a - m.k1.a); m.downQ = carryQ; payQ(m, [LAY.a, LAY.s, 1.2], carryQ, carryQ >= 2 ? 'לא נשפך' : ''); }
      else if (v.act === 'lay') { m.full = false; m.pile = 1; payQ(m, [LAY.a, LAY.s, 0.9], m.downQ || 1, 'ממזרח לכבש');   /* ── slice27 ── (the carry's end: as steady as the way down) ── /slice27 ── */ m.say = 'הגחלים צבורות ממזרח לכבש'; m.sayT = 2; }
      else { m.ash++; m.pay([TAPUACH.a, TAPUACH.s, RAMP.h + 0.9], m.ash === 3 ? 'התפוח' : ''); }
      m.advance();
    },
  });
  Object.assign(M, { mv: null, k1: { a: 0.4, s: 0, yaw: 0 }, full: false, pile: 0, ash: 0, sayT: 0, l2: L2, steady: 1, spilt: 0, spillT: 0, fill: 0, hold27: null, swallow: -1, scoopQ: 1, st0: null, evPut: 0 });
  evBegin(M, 'deshen');
  return M;
}
// ── /slice27 ──
function deshenDraw(k, M, T) {
  if (!M) return;
  altarRamp(k, T);
  // the winner with the silver מחתה
  const K1 = M.k1, y = rampY(K1.a) + (K1.a > RAMP.a1 ? 0 : 0), mv = M.mv, scoop = mv && mv.act === 'scoop' ? Math.sin(clamp(mv.t) * Math.PI) : 0;
  man(k, K1.a, K1.s, y, { robe: ROBE.kohen, yaw: K1.yaw, arms: 0.45 + scoop * 0.5 });
  const ha = K1.a + Math.cos(K1.yaw) * (0.55 + scoop * 0.3), hs = K1.s + Math.sin(K1.yaw) * (0.55 + scoop * 0.3), hy = y + 0.95 - scoop * 0.2;
  k.c(ha, hs, hy, 0.2, 0.08, SILVER); k.c(ha - Math.cos(K1.yaw) * 0.32, hs - Math.sin(K1.yaw) * 0.32, hy, 0.03, 0.5, SILVER, { yaw: -K1.yaw, pitch: Math.PI / 2 });
  if (M.full) { k.s(ha, hs, hy + 0.06, 0.16, 0.06, 0.16, '!#FFB347'); }
  // the coals heaped east of the ramp (three tefachim from it)
  if (M.pile || (mv && mv.act === 'lay')) { const u = M.pile ? 1 : clamp(mv.t); k.s(LAY.a, LAY.s, 0.06, 0.3 * u, 0.12 * u, 0.3 * u, '#6F655A'); k.s(LAY.a, LAY.s, 0.1, 0.18 * u, 0.06 * u, 0.18 * u, '!#E8A050'); }
  // the תפוח — the ash mound in the middle of the altar, raised by his brothers with shovels (three scoops)
  const ashU = M.ash + (mv && mv.act === 'ash' ? clamp(mv.t) : 0);
  if (ashU > 0) k.s(TAPUACH.a, TAPUACH.s, RAMP.h, 0.35 + ashU * 0.14, 0.12 + ashU * 0.14, 0.35 + ashU * 0.14, ASH);
  if (M.i >= 3 || (mv && mv.act === 'ash')) for (let j = 0; j < 2; j++) {
    const pa = TAPUACH.a - 0.8 + j * 1.5, ps = TAPUACH.s - 0.8, sw = mv && mv.act === 'ash' && (M.ash % 2) === j ? Math.sin(clamp(mv.t) * Math.PI) : 0;
    man(k, pa, ps, RAMP.h, { robe: ROBE.kohen, yaw: Math.atan2(TAPUACH.s - ps, TAPUACH.a - pa), arms: 0.3 + sw * 0.6, skin: SKIN[j + 1] });
  }
  // the next place to touch
  if (!mv && M.phase === 'work') { const t = deshenTarget(M); cue(k, M, t[0], t[1], t[2] - 1.1, 0.55, T); }
  k.label('הכבש', RAMP.a0 + 0.6, -1.4, 1.2, 0.26);
  says(k, M);
}
const deshenTarget = (M) => (M.i === 0 ? [FIRE.a - 0.6, FIRE.s, RAMP.h + 1.1] : M.i === 1 ? [FIRE.a, FIRE.s, RAMP.h + 1.1] : M.i <= 3 ? [LAY.a, LAY.s, 1.1] : [TAPUACH.a, TAPUACH.s, RAMP.h + 1.1]);
export const deshen = mk({
  id: 'deshen', he: 'תרומת הדשן', place: 'deshen',
  fact: { he: 'מי שזכה בתרומת הדשן נוטל מחתת כסף, עולה לראש המזבח, חותה מן הגחלים הפנימיות, יורד וצובר אותן על הרצפה ממזרח לכבש; ואחיו מעלים את האפר על גבי התפוח', ref: 'תמיד א, ד; ב, א–ב' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.4, 6.4, -2.8, 2.8, 3.0],
  model: deshenModel, draw: deshenDraw, target: deshenTarget,
});

/* ───────────────────────────── 3. המערכה (תמיד ב, ג–ה) ───────────────────────────── */
const ARR = [
  { he: 'המערכה הגדולה — במזרח', a: 4.6, s: 0.9, n: 6 },
  { he: 'מערכה שנייה — לקטורת', a: 2.7, s: -1.9, n: 2 },
  { he: 'שלישית — קיום האש', a: 2.6, s: 2.2, n: 1 },
];
const WOOD_HE = ['תאנה', 'אגוז', 'עץ שמן'];
export const MAAR27_WRONG = ['זו המערכה הגדולה — לא עכשיו', 'זו של הקטורת', 'זו לקיום האש'];   // ── slice27 ── ── /slice27 ──
const PILE = { a: 1.4, s: -0.2 };
const slotOf = (j) => { let x = j; for (let r = 0; r < ARR.length; r++) { if (x < ARR[r].n) return { r, x }; x -= ARR[r].n; } return { r: 2, x: 0 }; };
const logAt = (r, x) => { const A = ARR[r]; if (r === 0) { const lay = x / 3 | 0, c = x % 3; return lay % 2 ? { a: A.a + (c - 1) * 0.42, s: A.s, y: 0.32 + lay * 0.2, yaw: Math.PI / 2 } : { a: A.a, s: A.s + (c - 1) * 0.5, y: 0.2 + lay * 0.2, yaw: 0 }; } return { a: A.a + (x ? 0.0 : 0), s: A.s + x * 0.32, y: 0.2 + x * 0.16, yaw: x ? Math.PI / 2 : 0 }; };
export function maarachaModel(o = {}) {
  const M = baseModel('maaracha', o, {
    n: 10, coach: "גררו מן הכפתור אל המערכה הנכונה — שש לגדולה, שתיים לשל הקטורת, אחד לשלישית (או הקישו); ואז — האש",   /* ── slice27 ── (the aim's words) ── /slice27 ── */
    ready: (m) => !m.fly,
    tap(m) { m.fly = { t: 0, j: m.laid, big: false, light: m.laid >= 9 }; m.fx.push({ sfx: 'soft', haptic: 8 }); },
    // ── slice27 ── המערכה is the AIM work (PLAY27 §א 3): drag from the button toward one of the three marked spots on the altar (the great
    // one in the east, the ketoret's, the קיום האש) — the right one = gold; a wrong one is a word ("זו של הקטורת"), no penalty, the log
    // stays in his arms. A tap carries it to the right one (good). L2: after the first log the spots lose their names — he remembers.
    aim(m, dx, dy) {
      if (m.laid >= 9) { m.fly = { t: 0, j: m.laid, big: true, light: true }; m.fx.push({ sfx: 'soft', haptic: 12 }); return; }
      const want = slotOf(m.laid).r, pick = m.aim27 ? m.aim27(dx, dy) : want;
      if (pick !== want) { m.slip(MAAR27_WRONG[pick]); m.wrong27 = { r: pick, t: 1.4 }; m.fx.push({ sfx: 'soft', haptic: 6 }); return; }
      m.fly = { t: 0, j: m.laid, big: true, light: false, aimed: true }; m.firstTry = true; m.fx.push({ sfx: 'soft', haptic: 12 });
    },
    // ── /slice27 ──
    step(m, dt) {
      tickSay(m, dt);
      m.heat += (m.heatT - m.heat) * (1 - Math.exp(-dt * 1.8));
      if (m.wrong27 && (m.wrong27.t -= dt) <= 0) m.wrong27 = null; if (m.land27 && (m.land27.t -= dt) <= 0) m.land27 = null;   // ── slice27 ── ── /slice27 ──
      const f = m.fly; if (!f || m.phase !== 'work') return;
      f.t += dt / (f.light ? 0.7 : 0.55); if (f.t < 1) return;
      m.fly = null;
      if (f.light) { m.heatT = 1; m.pay([ARR[0].a, ARR[0].s, 1.4], 'הציתו שתי המערכות'); m.say = 'האש אחזה'; m.sayT = 3; }
      else {
        const { r, x } = slotOf(f.j), p = logAt(r, x); m.laid++; m.kinds.push(f.j % 3);
        m.land27 = { r, t: 0.9 };   // ── slice27 ── (the spot flashes as the log lands) ── /slice27 ──
        if (f.aimed) payQ(m, [p.a, p.s, p.y + 0.9], 2, `${WOOD_HE[f.j % 3]} — למקום!`); else   // ── slice27 ── (the aimed log on its right spot: gold) ── /slice27 ──
        m.pay([p.a, p.s, p.y + 0.9], WOOD_HE[f.j % 3]);
        if (x === ARR[r].n - 1) { m.say = ARR[r].he; m.sayT = 1.8; }
      }
      m.advance();
    },
  });
  Object.assign(M, { fly: null, laid: 0, kinds: [], heat: 0, heatT: 0, sayT: 0, l2: !!o.l2, wrong27: null, scr27: null });   // ── slice27 ── ── /slice27 ──
  // ── slice27 ── the drag's direction on the screen → the spot it points at (the draw records where the kohen and the three spots stand)
  M.aim27 = (dx, dy) => {
    // (on the real altar: the drag's direction on the ground, by the camera's bearing as the stick reads it — twin.js st.az; the screen
    // places of a moving camera lag behind it)
    const Wd = M.w27; let az = NaN; try { az = globalThis.__TWIN && globalThis.__TWIN.az ? +globalThis.__TWIN.az() : NaN; } catch (e) { /* */ }
    if (Wd && Number.isFinite(az) && Math.hypot(dx, dy) > 1) {
      const fx = -Math.cos(az), fz = -Math.sin(az), rx = -fz, rz = fx, L = Math.hypot(dx, dy), ux = dx / L, uy = -dy / L, vx = fx * uy + rx * ux, vz = fz * uy + rz * ux, a0 = Math.atan2(vz, vx);
      let best = 0, bd = 9; Wd.spots.forEach((p, r) => { const t = Math.atan2(p[1] - Wd.o[1], p[0] - Wd.o[0]), d = Math.abs(Math.atan2(Math.sin(t - a0), Math.cos(t - a0))); if (d < bd) { bd = d; best = r; } }); return best;
    }
    const S = M.scr27; if (!S || !S.o) return slotOf(M.laid).r; const a0 = Math.atan2(dy, dx); let best = 0, bd = 9; S.spots.forEach((p, r) => { const t = Math.atan2(p.y - S.o.y, p.x - S.o.x), d = Math.abs(Math.atan2(Math.sin(t - a0), Math.cos(t - a0))); if (d < bd) { bd = d; best = r; } }); return best; };
  // ── /slice27 ──
  M.onEnd = (c) => { try { if (c && c.stock && c.stock.take) c.stock.take('wood', 3); } catch (e) { /* the store's */ } };
  return M;
}
function maarachaDraw(k, M, T) {
  if (!M) return;
  // the altar's top: a broad stone floor with its four horns; the ash mound (התפוח) in the middle
  k.b(3.4, 0, 0.05, 6.4, 5.6, 0.1, STONE);
  for (const [a, s] of [[0.5, -3.0], [0.5, 3.0], [6.3, -3.0], [6.3, 3.0]]) k.b(a, s, 0.25, 0.5, 0.5, 0.5, STONE2);
  k.s(3.6, -0.6, 0.08, 0.6, 0.3, 0.6, ASH);
  // the logs laid
  for (let j = 0; j < M.laid; j++) { const { r, x } = slotOf(j), p = logAt(r, x); k.c(p.a, p.s, p.y, r === 0 ? 0.13 : 0.1, r === 0 ? 1.3 : 0.9, WOODS[M.kinds[j] | 0], { yaw: -p.yaw, pitch: Math.PI / 2 }); }
  // the pile from the wood chamber (fig, walnut, pine — never olive or vine), labelled
  const left = Math.max(0, 9 - M.laid - (M.fly && !M.fly.light ? 1 : 0));
  for (let j = 0; j < left; j++) k.c(PILE.a, PILE.s + (j % 3 - 1) * 0.3, 0.14 + (j / 3 | 0) * 0.24, 0.12, 1.1, WOODS[j % 3], { yaw: 0, pitch: Math.PI / 2 });
  if (left) k.label('תאנה · אגוז · עץ שמן', PILE.a, PILE.s, 1.3, 0.26);
  // the kohen carrying (the log in his arms from the pile to its place)
  const f = M.fly; let ka = PILE.a + 0.2, ks = PILE.s + 0.7, kyaw = 0;
  if (f) {
    const u = ease(clamp(f.t)), tgt = f.light ? { a: ARR[0].a - 0.7, s: ARR[0].s } : (() => { const { r, x } = slotOf(f.j); const p = logAt(r, x); return { a: p.a - 0.6, s: p.s }; })();
    ka = lerp(PILE.a + 0.3, tgt.a, u); ks = lerp(PILE.s + 0.6, tgt.s, u); kyaw = Math.atan2(tgt.s - ks, tgt.a - ka + 0.6);
    if (!f.light) k.c(ka + Math.cos(kyaw) * 0.45, ks + Math.sin(kyaw) * 0.45, 0.9, f.big ? 0.16 : 0.12, f.big ? 1.4 : 1.1, WOODS[f.j % 3], { yaw: -kyaw + Math.PI / 2, pitch: Math.PI / 2 });
  }
  man(k, ka, ks, 0, { robe: ROBE.kohen, yaw: kyaw, arms: f && !f.light ? 0.55 : 0.15, torch: f && f.light ? 1 : 0, t: T });
  // the fire catching on both pyres
  const h = M.heat; if (h > 0.02) { for (let j = 0; j < 4; j++) flame(k, ARR[0].a + Math.cos(j * 1.6) * 0.4, ARR[0].s + Math.sin(j * 1.6) * 0.5, 0.45, (0.4 + 0.5 * h) * (1 + 0.1 * Math.sin(T * 5 + j)), T + j); flame(k, ARR[1].a, ARR[1].s + 0.15, 0.4, 0.45 * h, T + 7); k.torch(ARR[0].a, ARR[0].s, 1.6, 0.4 + 0.5 * h); }
  // the names of the three, and the next place
  for (let r = 0; r < 3; r++) if (!(M.phase !== 'work' && r)) k.label(ARR[r].he.split(' — ')[0], ARR[r].a + 0.3, ARR[r].s, 1.5 + r * 0.05, 0.24);
  if (!f && M.phase === 'work') { const t = maarachaTarget(M); cue(k, M, t[0], t[1], 0, 0.6, T); }
  memune(k, 5.9, -2.4, ARR[0].a, ARR[0].s, 0.35, T);
  says(k, M);
}
const maarachaTarget = (M) => { if (M.laid >= 9) return [ARR[0].a, ARR[0].s, 1.2]; const { r, x } = slotOf(M.laid), p = logAt(r, x); return [p.a, p.s, p.y + 0.9]; };
export const maaracha = mk({
  id: 'maaracha', he: 'סידור המערכה', place: 'altar',
  fact: { he: 'כל העצים כשרים למערכה חוץ משל זית ושל גפן; סודרים מערכה גדולה במזרח, ומעצי תאנה יפים — מערכה שנייה לקטורת; והציתו שתי המערכות באש. המערכה השלישית לקיום האש — דעת רבי יוסי (מחלוקת)', ref: 'תמיד ב, ג–ה; יומא ד, ו' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.4, 6.4, -3.2, 3.2, 2.2],
  model: maarachaModel, draw: maarachaDraw, target: maarachaTarget,
});

/* ───────────────────────────── 4. הטלה — the gold cup, the check by torch, the 93 vessels (תמיד ג, ג–ד) ───────────────────────────── */
const DOOR = { a: 4.6, s: -2.4 }, MATT = { a: 2.9, s: -1.0 }, TABLE = { a: 3.2, s: 2.4 }, KELIM = { a: 5.2, s: 2.6 };
const CHECK = [{ he: 'אוזן', d: [0.44, 0.17, 0.78] }, { he: 'עין', d: [0.62, 0.07, 0.68] }, { he: 'רגל', d: [0.3, 0.15, 0.14] }];
export const TRAYS = 12, VESSELS = 93;
export const trayCount = (n) => Math.min(VESSELS, n * 8 - (n >= TRAYS ? 8 * TRAYS - VESSELS : 0));
export function talehModel(o = {}) {
  const M = baseModel('taleh', o, {
    n: 1 + 3 + 3 + TRAYS, holds: true, coach: "הקישו על 'עבודה' — הטלה יוצא; כוס הזהב (החזיקו — הוא שותה); הבדיקה לאור האבוקה; ותשעים ושלשה הכלים",
    ready: (m) => m.anim <= 0,
    tap(m) { talehAct(m); },
    press(m, down) { if (!down) m.hold = 0; },
    step(m, dt) {
      tickSay(m, dt);
      if (m.anim > 0) { m.anim -= dt; if (m.anim <= 0) talehLand(m); }
      if (m.sub === 'out' && m.anim > 0) m.come = clamp(1 - m.anim / 1.2);
      // (the cup: a held press is the lamb drinking — a sip every 0.55 s of holding; a tap is one sip)
      if (m.sub === 'drink' && m.pressed && m.anim <= 0 && m.phase === 'work') { m.hold += dt; if (m.hold >= 0.55) { m.hold = 0; talehAct(m); } }
    },
  });
  Object.assign(M, { sub: 'out', anim: 0, come: 0, sips: 0, part: 0, okP: [false, false, false], trays: 0, hold: 0, sayT: 0 });
  return M;
}
function talehAct(m) {
  if (m.anim > 0 || m.phase !== 'work') return;
  m.anim = m.sub === 'out' ? 1.2 : m.sub === 'drink' ? 0.4 : m.sub === 'check' ? 0.35 : 0.32;
  m.fx.push({ sfx: 'soft', haptic: 8 });
}
function talehLand(m) {
  if (m.sub === 'out') { m.come = 1; m.pay([MATT.a, MATT.s, 1.4], 'מלשכת הטלאים'); m.sub = 'drink'; }
  else if (m.sub === 'drink') { m.sips++; m.pay([MATT.a + 0.9, MATT.s, 1.1], m.sips === 3 ? 'בכוס של זהב' : ''); if (m.sips >= 3) m.sub = 'check'; }
  else if (m.sub === 'check') { const p = CHECK[m.part]; m.okP[m.part] = true; m.say = `${p.he} — תקינה`; m.sayT = 1.4; m.pay(partAt(m.part)); m.part++; if (m.part >= 3) { m.sub = 'kelim'; m.say = 'טלה תמים'; m.sayT = 1.8; } }
  else { m.trays++; const c = trayCount(m.trays); m.say = `${c} / ${VESSELS}`; m.sayT = m.trays >= TRAYS ? 6 : 1.2; m.pay([TABLE.a, TABLE.s, 1.3], m.trays >= TRAYS ? 'תשעים ושלשה' : ''); }
  m.advance();
}
const partAt = (j) => { const d = CHECK[j].d, sc = 1.35; return [MATT.a + d[1] * sc, MATT.s - d[0] * sc + 0.0, d[2] * sc + 0.3]; };
function talehDraw(k, M, T) {
  if (!M) return;
  // the lambs' chamber's door (left, far) and the vessels' chamber's door (right, far); the table where the vessels are set out
  for (const D of [DOOR, KELIM]) { for (const sg of [-1, 1]) k.b(D.a, D.s + sg * 0.8, 1.1, 0.3, 0.3, 2.2, STONE); k.b(D.a, D.s, 2.3, 1.95, 0.4, 0.26, STONE2); k.b(D.a + 0.1, D.s, 1.0, 1.3, 0.06, 2.0, '#4A3E30'); }
  k.label('לשכת הטלאים', DOOR.a, DOOR.s, 2.9, 0.26); k.label('לשכת הכלים', KELIM.a, KELIM.s, 2.9, 0.26);
  k.b(TABLE.a, TABLE.s, 0.42, 2.6, 1.3, 0.08, '#E4DCC8'); for (const [da, ds] of [[-0.5, -1.1], [-0.5, 1.1], [0.5, -1.1], [0.5, 1.1]]) k.b(TABLE.a + da, TABLE.s + ds, 0.2, 0.1, 0.1, 0.4, STONE2);
  // the lamb: steps out of its chamber onto the mat, faces across (its right side toward him)
  const u = ease(M.come), la = lerp(DOOR.a - 0.2, MATT.a, u), ls = lerp(DOOR.s, MATT.s, u);
  k.b(MATT.a, MATT.s, 0.03, 2.2, 1.8, 0.06, '#D8C79A');
  lamb(k, la, ls, 0, { yaw: M.come < 1 ? Math.atan2(MATT.s - DOOR.s, MATT.a - DOOR.a) : -Math.PI / 2, scale: 1.35, step: M.come < 1 && M.come > 0 ? T * 8 : 0, t: T, head: M.sub === 'drink' ? 0.1 : 0.6 });
  // the kohen with the gold cup (at the lamb's mouth while it drinks)
  const drinking = M.sub === 'drink' && (M.anim > 0 || M.pressed), mouth = { a: MATT.a + 0.02, s: MATT.s - 0.9 };
  man(k, MATT.a + 0.95, MATT.s - 1.0, 0, { robe: ROBE.kohen, yaw: Math.atan2(mouth.s - (MATT.s - 1.0), mouth.a - (MATT.a + 0.95)), arms: M.sub === 'drink' ? 0.55 : 0.1, skin: SKIN[1] });
  if (M.sub === 'drink' || M.sips) { const ca = M.sub === 'drink' ? MATT.a + 0.45 : MATT.a + 1.3, cs = M.sub === 'drink' ? MATT.s - 0.95 : MATT.s - 0.7, cy = M.sub === 'drink' ? 0.75 - (drinking ? 0.06 : 0) : 0.9; k.c(ca, cs, cy, 0.1, 0.16, GOLD); k.c(ca, cs, cy - 0.12, 0.04, 0.1, GOLD); k.c(ca, cs, cy + 0.06, 0.085, 0.02, '!#CFE3EE'); }
  // the torch-bearer: the check, part by part, by torchlight
  if (M.sub === 'check' || M.part) {
    const tp = partAt(Math.min(2, M.part));
    man(k, MATT.a - 1.1, MATT.s - 0.2, 0, { robe: ROBE.kohen, yaw: Math.atan2(tp[1] - (MATT.s - 0.2), tp[0] - (MATT.a - 1.1)), torch: 1, t: T, skin: SKIN[2] });
    k.torch(MATT.a - 0.7, MATT.s - 0.2, 1.9, 1);
    for (let j = 0; j < 3; j++) { const p = partAt(j); if (M.okP[j]) k.s(p[0], p[1], p[2], 0.08, 0.08, 0.08, '!#FFD24A'); else if (j === M.part && M.phase === 'work') { const r = 0.13 + 0.03 * Math.sin(T * 6); k.s(p[0], p[1], p[2], r, r, r, '!#FFF3C4'); } }
  }
  // the vessels: trays carried out, set on the table; a count over them
  const tr = M.trays + (M.sub === 'kelim' && M.anim > 0 ? 0 : 0);
  for (let j = 0; j < tr; j++) {
    const ca = TABLE.a - 0.85 + (j % 4) * 0.56, cs = TABLE.s - 0.4 + (j / 4 | 0) * 0.4;
    k.b(ca, cs, 0.48, 0.48, 0.32, 0.03, SILVER);
    for (let v = 0; v < 3; v++) k.c(ca - 0.14 + v * 0.14, cs, 0.56, 0.045, 0.14, v === 1 ? GOLD : SILVER);
  }
  if (M.sub === 'kelim' && M.anim > 0) { const v = 1 - M.anim / 0.32, ca = lerp(KELIM.a - 0.4, TABLE.a, v), cs = lerp(KELIM.s, TABLE.s, v); man(k, ca, cs - 0.5, 0, { robe: ROBE.kohen, yaw: Math.atan2(TABLE.s - KELIM.s, TABLE.a - KELIM.a), arms: 0.5, skin: SKIN[0] }); k.b(ca + 0.2, cs - 0.2, 0.9, 0.48, 0.32, 0.03, SILVER); }
  else if (M.sub === 'kelim' || M.trays) man(k, KELIM.a - 0.6, KELIM.s - 0.7, 0, { robe: ROBE.kohen, yaw: Math.PI * 0.75, arms: 0.2, skin: SKIN[0] });
  // the next thing to touch
  if (M.phase === 'work' && M.anim <= 0) { const t = M.sub === 'out' ? [DOOR.a - 0.4, DOOR.s, 0] : M.sub === 'drink' ? [MATT.a + 0.4, MATT.s - 0.9, 0] : M.sub === 'check' ? [MATT.a, MATT.s, 0] : [KELIM.a - 0.5, KELIM.s, 0]; cue(k, M, t[0], t[1], 0, 0.6, T); }
  if (M.sub === 'drink' && M.phase === 'work') k.label('החזיקו — הטלה שותה', MATT.a + 0.4, MATT.s - 0.9, 1.7, 0.26);
  says(k, M);
}
export const taleh = mk({
  id: 'taleh', he: 'הטלה וכוס הזהב', place: 'lambs',
  fact: { he: 'צאו והביאו טלה מלשכת הטלאים; השקו את התמיד בכוס של זהב, ואף על פי שהוא מבוקר מבערב — מבקרין אותו לאור האבוקות; ומלשכת הכלים מוציאים תשעים ושלשה כלי כסף וכלי זהב. בדיקת אוזן־עין־רגל — המחשה', ref: 'תמיד ג, ג–ד', illus: true },
  stage: { ahead: -0.5, lat: 0, K: 1.5 }, bounds: [1.2, 5.8, -3.4, 3.4, 2.6],
  model: talehModel, draw: talehDraw,
  target: (M) => (M.sub === 'out' ? [MATT.a, MATT.s, 1.4] : M.sub === 'drink' ? [MATT.a + 0.6, MATT.s - 0.9, 1.1] : M.sub === 'check' ? partAt(Math.min(2, M.part)) : [TABLE.a, TABLE.s, 1.2]),
});

/* ───────────────────────────── 5. ברקאי — "האיר פני כל המזרח?" (תמיד ג, ב) ───────────────────────────── */
const ROOF = { a: 2.4, s: -0.4, y: 2.2 }, LADDER = { a: 1.4, s: -2.0 };
export const DAWN = { first: 0.38, full: 0.86, rate: 0.13 };
export function barkaiModel(o = {}) {
  const M = baseModel('barkai', o, {
    n: 6, coach: "הקישו על 'עבודה' — לעלות לגג; ואז הקישו כשהמזרח מאיר: ברקאי!",
    ready: (m) => m.anim <= 0,
    tap(m) {
      if (m.sub === 'climb') { m.anim = 0.4; m.fx.push({ sfx: 'soft', haptic: 8 }); return; }
      if (m.sub === 'first') {
        if (m.L < DAWN.first) { m.slip('עוד חושך — עוד קצת'); return; }
        payQ(m, [8, 0, 3.0], m.L < DAWN.first + 0.22 ? 2 : 1, 'ברקאי!'); m.say = 'ברקאי!'; m.sayT = 1.8; m.sub = 'full'; m.advance(); return;
      }
      if (m.sub === 'full') {
        if (m.L < DAWN.full) { m.slip('עוד לא כל המזרח'); return; }
        payQ(m, [8, 3.2, 2.2], m.fullT < 1.6 ? 2 : 1, 'האיר פני כל המזרח'); m.say = 'האיר פני כל המזרח!'; m.sayT = 2; m.sub = 'answer'; m.anim = 0.9; m.advance(); return;
      }
      if (m.sub === 'answer') { m.pay([ROOF.a, ROOF.s, 3.6], 'הין!'); m.say = 'עד שבחברון? — הין!'; m.sayT = 8; m.advance(); }
    },
    step(m, dt) {
      tickSay(m, dt);
      if (m.anim > 0) { m.anim -= dt; if (m.anim <= 0 && m.sub === 'climb') { m.rung++; m.pay([LADDER.a, LADDER.s, 0.8 + m.rung * 0.7]); m.advance(); if (m.rung >= 3) { m.sub = 'first'; m.say = 'צאו וראו אם הגיע זמן השחיטה'; m.sayT = 2.4; } } }
      if (m.sub !== 'climb' && m.phase === 'work') { m.L = Math.min(1, m.L + DAWN.rate * dt * (m.sub === 'first' ? 1 : 1.25)); if (m.L >= DAWN.full) m.fullT += dt; }
    },
  });
  Object.assign(M, { sub: 'climb', anim: 0, rung: 0, L: 0.05, fullT: 0, sayT: 0 });
  return M;
}
function barkaiDraw(k, M, T) {
  if (!M) return;
  const L = M.L;
  // the eastern sky over the Mount of Olives' ridge: a wall of glow that brightens with L (night blue → pale → gold)
  const c3 = (x, y, u) => { const a = parseInt(x.slice(1), 16), b = parseInt(y.slice(1), 16), m = (s) => Math.round(lerp((a >> s) & 255, (b >> s) & 255, u)); return '!#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1); };
  const Lq = Math.round(L * 40) / 40;
  const sky = Lq < 0.5 ? c3('#1C2740', '#6E7FA6', Lq / 0.5) : c3('#6E7FA6', '#F4CF7A', (Lq - 0.5) / 0.5);
  const sky2 = Lq < 0.5 ? c3('#141C30', '#3A4A70', Lq / 0.5) : c3('#3A4A70', '#C9D6EE', (Lq - 0.5) / 0.5);
  k.b(8.6, 0, 1.6, 15, 0.2, 2.2, sky); k.b(8.7, 0, 3.6, 15, 0.2, 1.8, sky2);
  k.b(7.0, 0, 0.03, 14, 2.4, 0.04, sky2);   // (the first light laid on the ground before the ridge too: the follow camera looks down, a wall alone reads as a strip)
  // the streak of first light, then the whole east; Hebron far to the south, lit last
  if (L > DAWN.first - 0.1) k.b(8.5, 1.5, 0.9 + 0.1 * Math.sin(T * 2), 6 * clamp((L - DAWN.first + 0.1) * 3), 0.1, 0.18, '!#FFE7A8');
  for (let j = 0; j < 7; j++) k.s(7.8, -6 + j * 2, 0.2, 1.4, 0.7 + (j % 3) * 0.2, 0.5, '#2E2A34');   // the ridge (dark, unlit by design)
  if (L >= DAWN.full) k.label('חברון', 7.7, 5.5, 1.5, 0.26, { bg: 'rgba(255,240,200,.92)' });
  // the roof (the Temple's roof by the watcher's post) and its ladder
  k.b(ROOF.a, ROOF.s, ROOF.y / 2, 2.6, 2.0, ROOF.y, STONE); k.b(ROOF.a + 1.0, ROOF.s, ROOF.y + 0.2, 2.6, 0.12, 0.4, STONE2);
  for (const sg of [-1, 1]) k.b(LADDER.a, LADDER.s + sg * 0.32, 1.25, 0.08, 0.08, 2.5, '#7A5535');
  for (let r = 0; r < 5; r++) k.b(LADDER.a, LADDER.s, 0.35 + r * 0.45, 0.06, 0.6, 0.06, '#85603C');
  // the watcher: up the ladder rung by rung, then on the roof facing east
  const up = M.sub === 'climb' ? (M.rung + (M.anim > 0 ? 1 - M.anim / 0.4 : 0)) / 3 : 1;
  const wa = up < 1 ? LADDER.a - 0.3 : ROOF.a + 0.4, ws = up < 1 ? LADDER.s : ROOF.s, wy = up < 1 ? up * ROOF.y : ROOF.y;
  man(k, wa, ws, wy, { robe: ROBE.kohen, yaw: up < 1 ? 0 : 0, arms: M.sub === 'answer' || M.phase !== 'work' ? 0.9 : 0.2, skin: SKIN[0] });
  // the ממונה below, asking
  memune(k, 1.0, 1.4, ROOF.a, ROOF.s, M.sub === 'climb' ? 0.2 : 0.55, T);
  if (M.sub === 'full' && M.phase === 'work') k.label('האיר פני כל המזרח?', 1.0, 1.4, 2.5, 0.28);
  if (M.sub === 'answer' && M.anim <= 0 && M.phase === 'work') k.label('עד שבחברון?', 1.0, 1.4, 2.5, 0.3);
  if (M.phase === 'work' && M.anim <= 0) { if (M.sub === 'climb') cue(k, M, LADDER.a, LADDER.s, 0, 0.6, T); else cue(k, M, ROOF.a, ROOF.s, ROOF.y, 0.7, T); }
  if (M.sub !== 'climb' && M.phase === 'work') { const w = 0.25 + 3.2 * clamp(L); k.b(1.6, 2.9, 0.06, 0.12, 3.4, 0.04, '#5C5242'); k.b(1.6, 2.9 - 1.7 + w / 2 * 1.0, 0.09, 0.14, w, 0.05, L >= DAWN.full ? '!#FFD24A' : L >= DAWN.first ? '!#F2C46A' : '!#8FA0C8'); }   // (a slim gauge of the light on the ground — anticipation, not a timer)
  says(k, M);
}
export const barkai = mk({
  id: 'barkai', he: 'ברקאי — האיר המזרח', place: 'ulam',
  fact: { he: 'אמר להם הממונה: צאו וראו אם הגיע זמן השחיטה. אם הגיע — הרואה אומר: ברקאי. מתיא בן שמואל אומר: האיר פני כל המזרח עד שבחברון? והוא אומר: הין', ref: 'תמיד ג, ב' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.6, 8.8, -3.0, 3.0, 4.2],
  model: barkaiModel, draw: barkaiDraw,
  target: (M) => (M.sub === 'climb' ? [LADDER.a, LADDER.s, 0.8 + M.rung * 0.7] : M.sub === 'answer' ? [ROOF.a, ROOF.s, 3.6] : [8, 0, 3]),
});
