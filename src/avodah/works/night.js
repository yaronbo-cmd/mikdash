/* ── worksa22 ── night.js — the night's three works of Phase B's day (PHASEB-DAY-DESIGN §3, "לילה"), each a world craft beside the אמרכל:
 *   night  — the watch round (מדות א, א–ב; תמיד א, א): איש הר הבית walks with his torch to three of the 24 posts; at each post a tap =
 *            the guard's "שלום עליך איש הר הבית"; the one asleep is nudged awake, gently (the Mishnah's strike is not shown: המחשה).
 *   moked  — the fire at בית המוקד (מדות א, ו): four logs from the pile on to the fire, the flames grow, the kohanim warm themselves.
 *   lambs  — the lambs' chamber by torch (תמיד ג, ג; ערכין ב, ה): six checked lambs counted one by one; then tomorrow's lamb —
 *            ear, eye, foot under the torch (בכורות ו: a clean lamb is shown; never a blemish).
 * Nothing red, nothing bleeds; taps alone finish each (a drag is the aimed act: a bigger log). ── /worksa22 ── */
import { baseModel, makeWork, clamp, ease } from './craft.js';
import { man, lamb, flame, ROBE, SKIN } from './figures.js';
import { beat27, beatGrade27 } from './slice27.js';   // ── slice27 ── ── /slice27 ──
import { payQ } from './dawn.js';   // ── slice27 ── ── /slice27 ──
import { closeAt } from './closeup.js';   // ── slice27 ── ── /slice27 ──

const HE_COUNT = ['אחד', 'שנים', 'שלשה', 'ארבעה', 'חמשה', 'ששה'];
const STONE = '#CFC3A7', STONE2 = '#B9AC8E', TORCH_Y = 1.9;
const lerp = (a, b, u) => a + (b - a) * u;

/* ───────────────────────────── 1. the watch round ───────────────────────────── */
const POSTS = [{ a: 2.7, s: -3.4 }, { a: 4.4, s: 0 }, { a: 2.7, s: 3.4 }];
const standOf = (p) => { const dx = 1.5 - p.a, dz = 0.4 - p.s, l = Math.hypot(dx, dz) || 1; return { a: p.a + dx / l * 1.15, s: p.s + dz / l * 1.15 }; };
export function nightModel(o = {}) {
  const sleeper = o.sleeper == null ? 2 : o.sleeper | 0;
  const M = baseModel('night', o, {
    n: 3, coach: "הקישו על 'עבודה' — בכל משמר המשמר אומר: שלום עליך איש הר הבית",
    ready: (m) => m.mode === 'wait',
    tap(m) {
      const p = m.p; m.ans[p] = true; m.mode = 'answer'; m.mt = 0; m.said = p;
      m.pay([POSTS[p].a, POSTS[p].s, 2.4], p === sleeper ? 'ננער בעדינות' : '');
      m.fx.push({ sfx: 'good', haptic: 10 });
    },
    step(m, dt) {
      if (m.phase !== 'work') return;
      m.mt += dt;
      if (m.mode === 'walk') {
        m.walk = clamp(m.mt / 2.1);
        const u = ease(m.walk), a = m.from, b = standOf(POSTS[m.p]);
        m.ish.a = lerp(a.a, b.a, u); m.ish.s = lerp(a.s, b.s, u); m.ish.yaw = Math.atan2(b.s - a.s, b.a - a.a);
        if (m.walk >= 1) { m.mode = 'wait'; m.mt = 0; m.ish.yaw = Math.atan2(POSTS[m.p].s - b.s, POSTS[m.p].a - b.a); }
      } else if (m.mode === 'answer') {
        if (m.p === sleeper) m.wake = clamp(m.mt / 1.0);
        if (m.mt >= 1.7) { m.from = { a: m.ish.a, s: m.ish.s }; m.advance(); if (m.phase === 'work') { m.p++; m.mode = 'walk'; m.mt = 0; } }
      }
    },
  });
  Object.assign(M, { p: 0, mode: 'walk', mt: 0, walk: 0, ish: { a: 1.5, s: 0.4, yaw: 0 }, from: { a: 1.5, s: 0.4 }, ans: [false, false, false], said: -1, sleeper, wake: 0, posts: POSTS });
  M.onEnd = null;
  return M;
}
function nightDraw(k, M, T) {
  if (!M) return;
  for (let i = 0; i < 3; i++) {
    const P = POSTS[i], here = M.p === i, ans = M.ans[i];
    // the post: two pillars and a lintel, a lamp on a pole beside it
    for (const sg of [-1, 1]) k.b(P.a + 0.55, P.s + sg * 0.95, 1.0, 0.34, 0.34, 2.0, STONE);
    k.b(P.a + 0.55, P.s, 2.1, 2.5, 0.42, 0.28, STONE2);
    k.c(P.a - 0.3, P.s + (i === 2 ? -1.5 : 1.5), 0.8, 0.04, 1.6, '#6B4A2B'); k.s(P.a - 0.3, P.s + (i === 2 ? -1.5 : 1.5), 1.72, 0.14, 0.17, 0.14, '!#FFD27A');
    // the guard (a Levite): standing, facing the way the round comes; the sleeper lies at the pillar's foot until he is nudged
    const asleep = i === M.sleeper && !(ans && M.wake >= 0.55);
    if (asleep) {
      man(k, P.a + 0.1, P.s + 0.2, 0, { robe: ROBE.levi, lying: true, yaw: -0.5 });
      for (let z = 0; z < 3; z++) { const u = ((T * 0.45 + z / 3) % 1); k.s(P.a + 0.9 + u * 0.4, P.s + 0.5, 0.9 + u * 1.1, 0.07 + 0.05 * u, 0.07 + 0.05 * u, 0.07 + 0.05 * u, '!#C9D7EA'); }   // (a soft "zzz" of pale bubbles)
    } else {
      const wk = i === M.sleeper ? 1 - Math.abs(M.wake - 1) : 0;
      man(k, P.a, P.s, 0, { robe: ROBE.levi, yaw: Math.PI, arms: ans ? 0.5 + 0.2 * Math.sin(T * 6) : 0, lean: wk * 0.5, skin: SKIN[(i + 1) % 3] });
    }
    if (here && M.mode === 'wait') { const r = (0.95 + 0.1 * Math.sin(T * 5)) * (M.pressed ? 1.25 : 1); k.ring(P.a, P.s, 0.02, r); }
    if (ans && M.said === i && M.mode === 'answer' && (i !== M.sleeper || M.wake > 0.55)) k.label('שלום עליך איש הר הבית', P.a, P.s, 3.1, 0.34);
    else if (ans) k.s(P.a, P.s, 2.55, 0.16, 0.16, 0.16, '!#FFD24A');   // (a gold dot over each post already greeted)
  }
  // איש הר הבית with his torch
  const I = M.ish, swing = M.mode === 'walk' ? Math.sin(T * 7) * 0.05 : 0;
  man(k, I.a, I.s + swing, 0, { robe: '#B7A57F', yaw: I.yaw, torch: 1, t: T, cap: '#6B5E48' });
  k.torch(I.a + 0.45 * Math.cos(I.yaw), I.s + 0.45 * Math.sin(I.yaw), TORCH_Y, 1);
  if (M.mode === 'answer' && M.p === M.sleeper && M.wake < 0.55) { /* the nudge: his free hand reaches out (a soft pat; the Mishnah's strike is not shown) */ k.s(P_a(M), P_s(M), 1.1, 0.1, 0.1, 0.1, SKIN[0]); }
  if (M.warn) k.label(M.warn, 3, 0, 3.4, 0.3);
}
const P_a = (M) => lerp(M.ish.a, POSTS[M.p].a, 0.55), P_s = (M) => lerp(M.ish.s, POSTS[M.p].s, 0.55);

export const night = makeWork({
  id: 'night', he: 'סבב הלילה', place: 'moked',
  fact: { he: 'איש הר הבית מחזר על כל משמר ואבוקות דולקות לפניו; משמר שאינו עומד — אומר לו שלום עליך, וניכר שהוא ישן — מכהו במקלו. במשחק המשמר משיב שלום עליך איש הר הבית, והישן ננער בעדינות (בלי מקל): המחשה', ref: 'מדות א, א–ב; תמיד א, א — הנוסח: לבדיקה', illus: true },
  stage: { ahead: -0.5, lat: 0, K: 1.55 }, bounds: [1.2, 5.4, -4.6, 4.6, 3],
  model: nightModel, draw: nightDraw, target: (M) => [POSTS[Math.min(2, M.p)].a, POSTS[Math.min(2, M.p)].s, 2.2],
});

/* ───────────────────────────── 2. the fire at בית המוקד ───────────────────────────── */
const PIT = { a: 3.7, s: 0.2 }, PILE = { a: 2.0, s: -2.7 }, PILE2 = { a: 2.0, s: 2.9 };   // ── slice27 ── (the pile nearer the frame's middle — it was cut at the edge; PILE2: level 2's second pile) ── /slice27 ──
// ── slice27 ── the fire is the RHYTHM work (PLAY27 §א 1, "זהב על הפעימה"): the pile's ring breathes on the beat, "עכשיו!" flashes in the
// gold window; a log thrown on the beat = gold and the flame leaps (gold 1.2 · good 0.8 · off-beat 0.45 of a step) — the fire grows with
// the precision. L2: the beat quickens (0.62 s), six logs, two piles (the logs come from either side by turns). Taps alone finish it.
export const MOKED27 = { p1: 0.82, p2: 0.62, n1: 4, n2: 6, win1: 0.13, win2: 0.1, grow: [0.45, 0.8, 1.2] };
export function mokedModel(o = {}) {
  const L2 = !!o.l2, P = L2 ? MOKED27.p2 : MOKED27.p1;
  const fly = (m, big) => { const b = beat27(m.t, P), q = beatGrade27(b, L2 ? MOKED27.win2 : MOKED27.win1); m.fly = { t: 0, big, k: m.laid, q, pile: L2 ? m.laid % 2 : 0 }; m.fx.push({ sfx: q >= 2 ? 'perfect' : 'soft', haptic: q >= 2 ? 14 : 8 }); m.lastQ = q; m.qT = 0.7; };
  const M = baseModel('moked', o, {
    n: L2 ? MOKED27.n2 : MOKED27.n1, coach: "הקישו על 'עבודה' בפעימה — כשהטבעת על הערמה נסגרת: 'עכשיו!' — בול עץ לאש",
    ready: (m) => !m.fly,
    tap(m) { fly(m, false); },
    aim(m) { fly(m, true); },
    step(m, dt) {
      m.heat += (m.target - m.heat) * (1 - Math.exp(-dt * 2.2));
      // the beat's tick (heard, and seen on the pile's ring)
      const b = beat27(m.t, P); if (b.u < m.bu && m.phase === 'work') m.fx.push({ sfx: 'tick', o: { n: 3 } }); m.bu = b.u; m.beatU = b.u; m.beatErr = b.err;
      if (m.qT > 0) m.qT -= dt;
      if (m.fly && m.phase === 'work') {
        m.fly.t += dt / 0.5;
        if (m.fly.t >= 1) { const f = m.fly, big = f.big; m.fly = null; m.laid++; m.target = Math.min(5.2, m.target + MOKED27.grow[f.q] * (big ? 1.2 : 1)); payQ(m, [PIT.a, PIT.s, 1.3], f.q, f.q >= 2 ? 'על הפעימה!' : ''); m.spark = f.q >= 2 ? 0.9 : 0.6; m.advance(); }
      }
      if (m.spark > 0) m.spark -= dt;
    },
  });
  Object.assign(M, { fly: null, laid: 0, heat: 0.35, target: 0.35, spark: 0, l2: L2, period: P, bu: 0, beatU: 0, beatErr: 1, lastQ: -1, qT: 0 });
  return M;
}
// ── /slice27 ──
function mokedDraw(k, M, T) {
  if (!M) return;
  const h = M.heat, ph = M.phase !== 'work' ? 1 : 0;
  // the hall: a half-ring of stone benches behind, the pit's ring of stones
  for (let i = 0; i < 11; i++) { const t = Math.PI * 0.1 + i / 10 * Math.PI * 0.8, ta = Math.atan2(-Math.sin(t) * 4.0, Math.cos(t) * 2.4); k.b(PIT.a + 0.9 + Math.sin(t) * 2.4, Math.cos(t) * 4.0, 0.35, 1.3, 0.8, 0.7, i & 1 ? STONE : STONE2, { yaw: -(ta - Math.PI / 2) }); }
  for (let i = 0; i < 10; i++) { const t = i / 10 * Math.PI * 2; k.b(PIT.a + Math.cos(t) * 1.25, PIT.s + Math.sin(t) * 1.25, 0.2, 0.5, 0.42, 0.4, i & 1 ? STONE2 : STONE, { yaw: -t }); }
  k.c(PIT.a, PIT.s, 0.06, 1.1, 0.1, '#3B332B');                                                                            // the ash bed
  // the logs laid in the fire (criss-cross), the glow of the coals
  for (let j = 0; j < M.laid; j++) { const t = j * 1.4 + 0.3; k.c(PIT.a + Math.cos(t) * 0.3, PIT.s + Math.sin(t) * 0.3, 0.3 + (j >> 1) * 0.2, 0.15, 1.5, j % 3 === 0 ? '#6E4A2A' : '#7A5535', { yaw: -t, pitch: Math.PI / 2 }); }
  k.c(PIT.a, PIT.s, 0.12, 0.85, 0.05, '!#FFB347');
  // the flames: grow with the heat
  const n = Math.min(7, 2 + Math.floor(h * 1.4));
  for (let j = 0; j < n; j++) { const t = j * 2.4 + T * 0.35, r = j ? 0.22 + 0.07 * h : 0; flame(k, PIT.a + Math.cos(t) * r, PIT.s + Math.sin(t) * r, 0.45, 0.7 + h * 0.2 - j * 0.05 + 0.08 * Math.sin(T * 6 + j * 2), T + j); }
  k.torch(PIT.a, PIT.s, 1.4, 0.35 + h * 0.3);
  // ── slice27 ── the pile(s) of wood (L2: two, by turns), the log in flight, and the beat on the pile's ring
  const piles = M.l2 ? [PILE, PILE2] : [PILE], nN = M.n + 2;
  for (let pi = 0; pi < piles.length; pi++) { const Pp = piles[pi], left = Math.max(0, Math.ceil((nN - M.laid - (M.fly ? 1 : 0) - pi) / piles.length));
    for (let j = 0; j < left; j++) { const row = j % 3, lev = j / 3 | 0; k.c(Pp.a, Pp.s + (j % 2) * 0.1, 0.18 + lev * 0.3, 0.16, 1.5, ['#7A5535', '#6E4A2A', '#85603C'][j % 3], { yaw: -(Math.PI / 2 + row * 0.05), pitch: Math.PI / 2 }); } }
  if (M.fly) { const Pp = piles[M.fly.pile] || PILE, u = ease(M.fly.t), big = M.fly.big, a = lerp(Pp.a, PIT.a, u), s = lerp(Pp.s, PIT.s, u), y = lerp(0.5, 0.9, u) + Math.sin(u * Math.PI) * 1.5;
    k.c(a, s, y, big ? 0.24 : 0.16, big ? 1.9 : 1.5, '#85603C', { yaw: -(u * 3.2), pitch: Math.PI / 2 }); }
  if (M.phase === 'work' && !M.fly) {
    const Pp = piles[M.l2 ? M.laid % 2 : 0], bu = M.beatU || 0, gold = (M.beatErr || 1) <= (M.l2 ? 0.1 : 0.13);
    k.ring(Pp.a, Pp.s, 0.02, (0.75 + 1.1 * (1 - bu) * (1 - bu)) * (M.pressed ? 1.15 : 1), gold ? '!#FFE9A6' : '!#FFD24A', 18);   // (the closing ring: it lands on the pile at the beat)
    k.ring(Pp.a, Pp.s, 0.03, 0.72, '!#E2B84A', 14);
    if (gold) k.label('עכשיו!', Pp.a, Pp.s, 1.6, 0.34, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' });
  }
  if (M.qT > 0 && M.lastQ >= 0) k.label(M.lastQ >= 2 ? 'זהב — על הפעימה!' : M.lastQ === 1 ? 'כמעט בפעימה' : 'האש קיבלה', PIT.a, PIT.s, 2.9 + (0.7 - M.qT) * 0.6, 0.3, M.lastQ >= 2 ? { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' } : undefined);
  if (M.fly && M.fly.t > 0.55 || (M.spark > 0)) closeAt(k, PIT.a, PIT.s, 0.9, { dist: 6, el: 0.42, from: Math.PI, hold: 0.7, key: 'moked' });   // (the close-up: the log lands and the flame leaps)
  // ── /slice27 ──
  // ── slice27 ── the one who feeds it (the player — the frame's first standing kohen: hero26's actor): beside the pile, a log in his arms,
  // the throw on the tap (arms up and forward)
  { const Pp = M.l2 && M.laid % 2 ? PILE2 : PILE, fa = Pp.a - 0.5, fs = Pp.s * 0.72, face = Math.atan2(PIT.s - fs, PIT.a - fa), th = M.fly ? Math.sin(Math.min(1, M.fly.t * 2) * Math.PI) : 0;
    man(k, fa, fs, 0, { robe: ROBE.kohen, yaw: face, arms: 0.55 + th * 0.4, pose: M.fly ? 'reach' : 'carry', u: 1, t: T });
    if (!M.fly && M.phase === 'work') k.c(fa + Math.cos(face) * 0.42, fs + Math.sin(face) * 0.42, 0.95, 0.15, 1.2, '#85603C', { yaw: -face + Math.PI / 2, pitch: Math.PI / 2 }); }
  // ── /slice27 ──
  // the kohanim warm themselves: four sit round the fire, hands out as it grows
  const seats = [0.5, 1.9, 4.4, 5.7];
  for (let i = 0; i < 4; i++) {
    const t = seats[i], pa = PIT.a + Math.cos(t) * 2.25, ps = PIT.s + Math.sin(t) * 2.25, face = Math.atan2(PIT.s - ps, PIT.a - pa);
    const nod = ph ? Math.sin(T * 3 + i) * 0.5 : 0;
    man(k, pa, ps, 0, { robe: ROBE.kohen, yaw: face, sit: true, arms: clamp(0.15 + (h - 0.35) / 3.2), lean: nod * 0.4, skin: SKIN[i % 3] });
  }
  if (M.spark > 0) for (let z = 0; z < 6; z++) { const u = 1 - M.spark / 0.6; k.s(PIT.a + Math.sin(z * 2 + T * 3) * 0.4, PIT.s + Math.cos(z * 3) * 0.4, 1.0 + u * 1.8 + z * 0.1, 0.05, 0.05, 0.05, '!#FFE08A'); }
  if (M.warn) k.label(M.warn, 3, 0, 3.4, 0.3);
}
export const moked = makeWork({
  id: 'moked', he: 'המדורה בבית המוקד', place: 'moked',
  fact: { he: 'בבית המוקד ישנים זקני בית אב, ובו מדורה — ובלילה הכהנים מתחממים אצל האש. הזנת האש בבולי עץ היא המחשה: המשנה מזכירה את המדורה ולא את מי שמזין אותה', ref: 'מדות א, ו; תמיד א, א', illus: true },
  stage: { ahead: -1.0, lat: 0, K: 1.55 }, bounds: [1.4, 6.2, -3.8, 3.8, 2.6],
  model: mokedModel, draw: mokedDraw, target: (M) => (M.fly ? [lerp(PILE.a, PIT.a, ease(M.fly.t)), lerp(PILE.s, PIT.s, ease(M.fly.t)), 1.6] : [PIT.a, PIT.s, 1.8]),
});

/* ───────────────────────────── 3. the lamb check by torch ───────────────────────────── */
const STALL = (i) => ({ a: 4.4, s: -3.0 + i * 1.2 });
const MAT = { a: 2.9, s: 1.9 };
const PARTS = [{ id: 'ear', he: 'אוזן', d: [0.44, 0.17, 0.78] }, { id: 'eye', he: 'עין', d: [0.62, 0.07, 0.68] }, { id: 'foot', he: 'רגל', d: [0.3, 0.15, 0.14] }];
export function lambsModel(o = {}) {
  const M = baseModel('lambs', o, {
    n: 9, coach: "הקישו על 'עבודה' — לספור טלה אחר טלה, ואחר כך לבדוק את הטלה של מחר: אוזן, עין, רגל",
    ready: (m) => m.sub !== 'come',
    tap(m) {
      if (m.sub === 'count') {
        const i = m.c; m.glow[i] = 1; m.c++; m.say = HE_COUNT[i]; m.sayT = 1.4; m.pay([STALL(i).a, STALL(i).s, 1.4]); m.fx.push({ sfx: 'good', haptic: 8 });
        if (m.c >= 6) { m.say = 'ששה טלאים מבוקרים'; m.sayT = 2.2; m.sub = 'come'; m.mt = 0; }
        m.advance();
      } else if (m.sub === 'check') {
        const p = PARTS[m.part]; m.okP[m.part] = true; m.say = p.he + ' — תקינה'; m.sayT = 1.6;
        m.pay([MAT.a, MAT.s - p.d[0] * 1.4, p.d[2] * 1.4 + 0.4]); m.fx.push({ sfx: 'good', haptic: 8 }); m.part = Math.min(2, m.part + 1); m.advance();
      }
    },
    step(m, dt) {
      if (m.sayT > 0) { m.sayT -= dt; if (m.sayT <= 0) m.say = ''; }
      for (let i = 0; i < 6; i++) if (m.glow[i] > 0 && m.glow[i] < 1.0001 && m.sub !== 'count') m.glow[i] = Math.max(0.55, m.glow[i] - dt * 0.2);
      if (m.sub === 'come') { m.mt += dt; m.come = clamp(m.mt / 1.6); if (m.mt >= 1.6) { m.sub = 'check'; m.mt = 0; } }
    },
  });
  Object.assign(M, { sub: 'count', c: 0, glow: [0, 0, 0, 0, 0, 0], part: 0, okP: [false, false, false], come: 0, mt: 0, sayT: 0 });
  return M;
}
function lambsDraw(k, M, T) {
  if (!M) return;
  // the chamber: a low wall behind, stall posts, straw on the floor, a trough
  k.b(5.3, 0, 0.7, 8.2, 0.4, 1.4, STONE2);
  for (let i = 0; i <= 6; i++) k.b(4.6, -3.6 + i * 1.2, 0.5, 0.12, 0.12, 1.0, '#7A5535');
  k.b(4.4, 0, 0.03, 7.4, 1.5, 0.06, '#CDB46A');                                                                                         // straw
  k.b(3.5, 0, 0.12, 7.0, 0.1, 0.24, '#8A6A45');                                                                                        // the rail in front of the stalls
  for (let i = 0; i < 6; i++) {
    const S = STALL(i), g = M.glow[i];
    lamb(k, S.a, S.s, 0, { yaw: -Math.PI / 2 + (i % 2 ? 0.2 : -0.1), scale: 0.95, mark: true, glow: g > 0 ? g : 0, t: T, head: 0.3 + 0.3 * Math.sin(T * 0.7 + i) * 0.5 });
    if (g > 0.5) k.s(S.a, S.s, 1.55 + 0.1 * Math.sin(T * 4 + i), 0.09, 0.09, 0.09, '!#FFD24A');
  }
  // the one for tomorrow: comes in from the right onto the mat
  if (M.sub === 'come' || M.sub === 'check' || M.phase !== 'work') {
    const u = M.sub === 'come' ? ease(M.come) : 1, a = lerp(4.4, MAT.a, u), s = lerp(4.6, MAT.s, u);
    lamb(k, a, s, 0, { yaw: M.sub === 'come' ? Math.PI + 0.3 : -Math.PI / 2, scale: 1.4, step: T * 7 * (M.sub === 'come' ? 1 : 0), t: T, head: 0.7 });
    if (M.sub !== 'come') {
      k.b(MAT.a, MAT.s, 0.04, 3.0, 2.2, 0.08, '#D8C79A');
      for (let j = 0; j < 3; j++) { const p = PARTS[j], d = p.d, wa = MAT.a + (d[0] * Math.cos(-Math.PI / 2) - d[1] * Math.sin(-Math.PI / 2)) * 1.4, ws = MAT.s + (d[0] * Math.sin(-Math.PI / 2) + d[1] * Math.cos(-Math.PI / 2)) * 1.4, wy = d[2] * 1.4;
        if (M.okP[j]) k.s(wa, ws, wy, 0.1, 0.1, 0.1, '!#FFD24A');
        else if (j === M.part && M.phase === 'work') { const r = 0.16 + 0.04 * Math.sin(T * 6); k.s(wa, ws, wy, r, r, r, '!#FFF3C4'); k.s(wa, ws, wy, r * 1.5, r * 1.5, r * 1.5, '!#FFD24A'); } }
    }
  }
  // the torch-bearer: stands at the left; his torch goes to the lamb being counted / the part being looked at
  const who = M.sub === 'count' ? STALL(Math.min(5, M.c)) : { a: MAT.a, s: MAT.s };
  const tgtA = M.sub === 'count' ? who.a - 1.4 : MAT.a - 0.4, tgtS = M.sub === 'count' ? who.s - 0.5 : MAT.s - 2.0;
  man(k, tgtA - 0.3, tgtS - 0.3, 0, { robe: ROBE.kohen, yaw: Math.atan2(who.s - tgtS, who.a - tgtA), torch: 1, t: T, arms: 0.2 });
  k.torch(tgtA + 0.1, tgtS, TORCH_Y, 1.1);
  k.label('לשכת הטלאים', 5.0, 0, 3.0, 0.3);
  if (M.say) k.label(M.say, 4.0, 0, 2.7, 0.36);
  if (M.warn) k.label(M.warn, 3, 0, 3.4, 0.3);
}
export const lambs = makeWork({
  id: 'lambs', he: 'ביקור הטלאים באבוקה', place: 'moked',
  fact: { he: 'אין פוחתין מששה טלאים המבוקרין בלשכת הטלאים; ואף על פי שהטלה נבדק מבערב — מבקרין אותו שוב לאור האבוקות. בדיקת אוזן־עין־רגל בטלה של מחר מוצגת כהמחשה', ref: 'ערכין ב, ה; תמיד ג, ג', illus: true },
  stage: { ahead: -2.3, lat: 0, K: 1.65 }, bounds: [1.2, 5.4, -4.0, 4.0, 2.4],
  model: lambsModel, draw: lambsDraw, target: (M) => (M.sub === 'check' ? [MAT.a, MAT.s, 1.7] : [STALL(Math.min(5, M.c)).a, STALL(Math.min(5, M.c)).s, 1.6]),
});
