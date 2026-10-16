/* ── payis24 ── payis.js — the lots in the player's hand (the owner, 9.10: "שהשחקן יפעיל אותו וגם יעצור אותו בלחיצה ואשכרה יחוש שהוא
 * הגריל עבודה ספציפית בעצמו"). The four lots of the Tamid — the first (תרומת הדשן), the second (the thirteen), the third (new ones to the
 * ketoret), the fourth (new and old to the limbs) — on WORKSA22's kit (craft.js makeWork/baseModel · figures.js).
 * The shape of each: a gold ring runs round the circle of eight kohanim, kohen to kohen, a tick for each, ACCELERATING; the player's tap
 * STOPS it — that kohen's hat is taken (יומא כה, א: the ממונה takes the mitznefet off one head, and the count starts from him); the ממונה says
 * the number; and the count goes round from that kohen by the player's taps, as before (fingers, never people — יומא ב, א).
 * It is a timing act and a count, never a random reward: the stop is the player's; the number is said aloud; the fingers are on show; the
 * end of the count is a sum anyone can check. The mentor line says so. Nothing red, no blood, no Divine Name. ── /payis24 ── */
import { baseModel, makeWork, clamp, ease, caAct, getKit } from './craft.js';   // ── fix26 ── (caAct, getKit: the prediction's act; the figures' screen places) ── /fix26 ──
import * as FIG from './figures.js';
import { man, ROBE, SKIN } from './figures.js';
const RIGGED = 'POSES' in FIG;   // (FIGURES24's rigged kohen: the 'lots' pose holds one or two fingers out by itself — the pale pegs are the old figure's way)
import { mk, memune, cue, says, tickSay, payQ, lerp, GOLD } from './dawn.js';
import { worldTarget } from './slice27.js';   // ── slice27 ── ── /slice27 ──

export const NUMW = { 14: 'ארבעה עשר', 16: 'ששה עשר', 17: 'שבעה עשר', 19: 'תשעה עשר' };
/* ── fix26 ── (the owner, 10.10: "הפיס: משחק נחמד — בדוק איך ניתן לשפר את המשחקיות") — the skill: after the ממונה says the number and BEFORE
 * the count, "מי יזכה? הקישו עליו": the player predicts the winner by a tap on a kohen's figure (or a drag from the button toward him) in a
 * 6-s window; the button's tap skips it. Then the count by taps as before; a right prediction = gold + "ניחשתם!", a wrong one = good — no
 * penalty. Counting the fingers ahead IS the skill (the mentor line says so): never a random reward. The ring's run: the tick's pitch rises,
 * the halo swells, the kohen it passes sways; the stop has a 120 ms grace (the kohen it was on at the touch). The player is seat HERO_SEAT. */
export const HERO_SEAT = 0, PREDICT_S = 6, GRACE = 0.12;
// ── /fix26 ──
export const SEATS = 8, PC = { a: 3.4, s: 0 }, PA = 1.05, PS = 3.0;   // (a wide ellipse: the works' stage is squeezed along his line to fit the frame, so a round circle would read as a column)
export const FINGERS = [1, 2, 1, 1, 2, 2, 1, 2];
/** the ring's pace: seconds per kohen, from slow to fast over RAMP seconds, then it holds (a tap at any time stops it) */
export const RING = { slow: 0.5, fast: 0.12, ramp: 6.5 };
export const LOTS = {
  payis: { N: 14, wins: 'זכה בתרומת הדשן', head: 'מי יזכה בתרומת הדשן?' },
  payis2: { N: 17, wins: 'זכה בשחיטה — ושאר התפקידים אחריו', head: 'הפיס השני — שלושה עשר תפקידים' },
  payis3: { N: 16, wins: 'זכה בקטורת — פעם אחת בחייו', head: 'חדשים לקטורת — באו והפיסו', illus: true },
  payis4: { N: 19, wins: 'זכה להעלות את האברים לכבש', head: 'חדשים עם ישנים — האברים אל הכבש', illus: true },
};
/** (half a step round: no kohen stands right behind the אמרכל, who stands at the stage's front) */
export const seat = (i) => { const t = Math.PI + (i + 0.5) / SEATS * Math.PI * 2; return { a: PC.a + Math.cos(t) * PA, s: PC.s + Math.sin(t) * PS }; };
/** the count from seat `start`: how many kohanim are counted until the number ends, and on whom */
export function lotPlan(N, start = 0, F = FINGERS /* ── slice27 ── (his own raised fingers) ── /slice27 ── */) { let c = 0, j = 0; const seq = []; while (c < N) { const i = (start + j) % SEATS; seq.push({ i, from: c + 1, to: Math.min(N, c + F[i]) }); c += F[i]; j++; } return { seq, win: seq[seq.length - 1].i, n: seq.length }; }
/** the seconds per kohen after `t` seconds of running */
export const ringStep = (t, l2) => (l2 ? 0.7 : 1) * lerp(RING.slow, RING.fast, ease(clamp(t / RING.ramp)));   // ── slice27 ── (L2: the ring 30% faster) ── /slice27 ──
// ── slice27 ── "he raises his own finger" (PLAY27 §ב 4): before the ring runs — a short hold = one finger, a long hold (≥ 0.5 s) = two, shown
// on his hand; a plain tap = one. His fingers count like everyone's. L2: the ring faster, the guess window 4 s.
export const FINGER27 = { two: 0.5, l2Predict: 4, auto: 6 };
// ── /slice27 ──

export function lotModel(o = {}, kind = 'payis') {
  const K = LOTS[kind] || LOTS.payis;
  const M = baseModel(kind, o, {
    n: 1 + lotPlan(K.N, 0).n, coach: `הקישו על 'עבודה' — עצרו את הטבעת על כהן — הממונה יטול את מצנפתו ויאמר ${K.N}; ספרו אצבעות בראש — והקישו על מי שיזכה. זו ספירה, לא מזל`,
    ready: (m) => m.sub === 'run' || m.sub === 'predict' || m.anim <= 0,   // ── fix26 ── (predict) ── /fix26 ──
    tap(m) {
      if (m.sub === 'finger') { if (m.t < m.swallow27) return; raise(m, 1); return; }   // ── slice27 ── ── /slice27 ──
      if (m.t < m.swallow27) return;   // ── slice27 ── (the tap that ends the finger's hold does not stop the ring at once) ── /slice27 ──
      if (m.sub === 'run') { stop(m); return; }
      if (m.sub === 'predict') { if (m.pt6 > 0.7) toCount(m, -1); return; }   // ── fix26 ── (the button: no guess this time — the count starts) ── /fix26 ──
      const c = m.plan.seq[m.j], S = seat(c.i); m.j++; m.counted[c.i] = (m.counted[c.i] | 0) + 1; m.anim = 0.32; m.hand = c.i;
      const nums = []; for (let x = c.from; x <= c.to; x++) nums.push(x); m.say = nums.join(', ') + (m.j >= m.plan.n ? '!' : ''); m.sayT = 1.6;
      m.pay([S.a, S.s, 2.2]); m.fx.push({ sfx: 'soft', haptic: 8 });
      if (m.j >= m.plan.n) { m.win = c.i; m.say = `${K.N}! — ${K.wins}`; m.sayT = 9; m.fx.push({ sfx: 'chime', o: { n: 5 } });
        // ── fix26 ── the prediction's answer: right → gold and the stamp; wrong → good, and the count shows why
        if (m.guess >= 0) { const right = m.guess === c.i; caAct(m, right ? 2 : 1, { x: 0.5, y: 0.3, say: right ? 'ניחשתם!' : '' }); if (right) { m.stamp = true; m.say = `ניחשתם! ${K.N} — ${K.wins}`; m.fx.push({ sfx: 'perfect', haptic: 30 }); } else m.say = `${K.N}! — ${K.wins} · ספרו שוב: האצבעות הובילו אליו`; }
        // ── /fix26 ──
      }
      m.advance();
    },
    /** the aimed act: while the ring runs, any drag stops it; in the count, a drag toward a kohen — the next in turn counts, another one is "לא — הבא בתור" */
    aim(m, dx, dy) {
      if (m.sub === 'run') { m.twinTap(); return; }
      const ang = Math.atan2(dx, -dy); let best = 0, bd = 9;
      for (let i = 0; i < SEATS; i++) { const S = seat(i), t = Math.atan2(S.s - PC.s, S.a - (PC.a - PA)), d = Math.abs(Math.atan2(Math.sin(t - ang), Math.cos(t - ang))); if (d < bd) { bd = d; best = i; } }
      if (m.sub === 'predict') { m.predict(best); return; }   // ── fix26 ── (a drag from the button toward a kohen: the guess) ── /fix26 ──
      if (best !== m.plan.seq[m.j].i && bd < 0.5) { m.slip('לא — הבא בתור'); return; }
      m.twinTap();
    },
    step(m, dt) {
      tickSay(m, dt);
      if (m.sub === 'finger') { if (m.fh) { m.fh.t += dt; m.fingersNow = m.fh.t >= FINGER27.two ? 2 : 1; } else if (m.t > FINGER27.auto) raise(m, 1); return; }   // (never idle: no touch for 6 s — he raises one by himself)   // ── slice27 ── ── /slice27 ──
      if (m.sub === 'run' && m.phase === 'work') {
        m.rt += dt; m.acc += dt;
        const iv = ringStep(m.rt, m.l2);   // ── slice27 ── ── /slice27 ──
        if (m.acc >= iv) { m.acc -= iv; m.prev = m.pos; m.pos = (m.pos + 1) % SEATS; m.near = 1; m.fx.push({ sfx: 'tick', o: { n: Math.min(16, (m.rt * 2.2) | 0) } }); }   // ── fix26 ── (the pitch climbs higher; m.near: the sway) ── /fix26 ──
        if (m.near > 0) m.near = Math.max(0, m.near - dt * 5);
        return;
      }
      if (m.anim > 0) m.anim -= dt;
      // ── fix26 ── the number said → the prediction window (6 s) → the count
      if (m.sub === 'named' && m.anim <= 0) { m.sub = 'predict'; m.pt6 = 0; m.say = ''; m.sayT = 0; }
      if (m.sub === 'predict') { m.pt6 += dt; if (m.pt6 >= (m.l2 ? FINGER27.l2Predict : PREDICT_S)) toCount(m, -1); }   // ── slice27 ── (L2: 4 s) ── /slice27 ──
      if (m.gt > 0) m.gt -= dt;
      // ── /fix26 ──
    },
    /** ── fix26 ── the touch-down while the ring runs: the kohen it is on (or the one it just left, within 120 ms) — the stop is that one ── /fix26 ── */
    press(m, down) {
      // ── slice27 ── the finger: the hold's length = one or two
      if (m.sub === 'finger' && m.phase === 'work') { if (down) { m.fh = { t: 0 }; m.fingersNow = 1; return; } if (m.fh) { const two = m.fh.t >= FINGER27.two, held = m.fh.t >= 0.2; m.fh = null; if (held) { m.swallow27 = m.t + 0.35; raise(m, two ? 2 : 1); } } return; }
      // ── /slice27 ──
      if (down && m.sub === 'run') { m.pressPos = m.acc < GRACE ? m.prev : m.pos; m.pressAt = m.rt; } },
  });
  /** the player's tap on the running ring: the kohen it stands on — his hat is taken */
  // ── fix26 ── the guess, and the count after it
  function toCount(m, g) { if (m.sub !== 'predict') return; m.guess = g; m.sub = 'count'; m.say = g >= 0 ? 'עכשיו ספרו — ונראה' : ''; m.sayT = g >= 0 ? 1.4 : 0; if (g >= 0) { m.gt = 0.6; m.fx.push({ sfx: 'soft', haptic: 10 }); } }
  M.predict = (i) => { if (M.sub === 'predict' && i >= 0 && i < SEATS) { toCount(M, i | 0); return true; } return false; };
  // ── /fix26 ──
  // ── slice27 ── his finger(s) raised: the count will take them; the ring starts
  function raise(m, n) { m.fingers = FINGERS.slice(); m.fingers[HERO_SEAT] = n; m.plan = lotPlan(K.N, 0, m.fingers); m.sub = 'run'; m.rt = 0; m.acc = 0; m.fingersNow = n; m.say = n === 2 ? 'הרמתם שתי אצבעות ✌' : 'הרמתם אצבע אחת ☝'; m.sayT = 1.6; m.fx.push({ sfx: 'soft', haptic: 10 }); m.raisedAt = m.t; }
  // ── /slice27 ──
  function stop(m) {
    m.start = m.pressAt != null && m.rt - m.pressAt <= 0.6 ? m.pressPos : m.acc < GRACE ? m.prev : m.pos; m.pos = m.start; m.pressAt = null;   // ── fix26 ── (the 120 ms grace: the kohen it was on at the touch) ── /fix26 ──
    m.plan = lotPlan(K.N, m.start, m.fingers); m.n = 1 + m.plan.n;   /* ── slice27 ── (m.fingers) ── /slice27 ── */ m.sub = 'named'; m.anim = 1.0; m.hand = m.start;
    m.pay([seat(m.start).a, seat(m.start).s, 2.4], 'המצנפת נטלה');
    m.say = `הממונה: ${NUMW[K.N] || K.N}!`; m.sayT = 4; m.fx.push({ sfx: 'chime', o: { n: 3 }, haptic: 14 });
    m.advance();
  }
  Object.assign(M, { kind, N: K.N, plan: lotPlan(K.N, 0), sub: 'run', pos: 0, prev: 0, rt: 0, acc: 0, start: -1, j: 0, counted: [], anim: 0, hand: -1, win: -1, sayT: 0, fingers: FINGERS, illus: !!K.illus,
    guess: -1, pt6: 0, gt: 0, near: 0, stamp: false, pressPos: 0, pressAt: null });   // ── fix26 ── ── /fix26 ──
  // ── slice27 ── the lot opens with his finger (the ring waits); the result says whether the guess was right (the stamp's name)
  Object.assign(M, { sub: o.finger ? 'finger' : 'run', fh: null, fingersNow: 0, swallow27: -1, l2: !!o.l2, raisedAt: -1 });   // (o.finger: the day's runs — s27Opts; a bare model keeps the ring running at once)
  { const r0 = M.result; M.result = () => Object.assign(r0(), { guessed: !!M.stamp, fingers: M.fingers[HERO_SEAT] }); }
  M.coach = `החזיקו קצר — אצבע אחת; ארוך — שתיים. ואז עצרו את הטבעת; ${K.N} — ספרו אצבעות ונחשו מי יזכה`;
  // ── /slice27 ──
  try { globalThis.__P24M = M; } catch (e) { /* tests */ }
  return M;
}

// ── fix26 ── the tap on a kohen's figure (the canvas, not the button) while "מי יזכה?" is asked: the nearest seat on the screen within 70 px
const F26 = { M: null, on: false, scr: [] };
function f26Seats(k) { const out = []; for (let i = 0; i < SEATS; i++) { const S = seat(i); const q = k.screen(S.a, S.s, 0.9); out.push({ x: Math.round(q.x), y: Math.round(q.y) }); } return out; }
function f26Tap(e) {
  const M = F26.M; if (!M || M.sub !== 'predict' || M.phase !== 'work') return;
  const c = document.getElementById('c') || document.querySelector('canvas'); if (e.target !== c && !worldTarget(e)) return;   // ── slice27 ── (a seat over the walk zone is a target too) ── /slice27 ──
  let best = -1, bd = 80; F26.scr.forEach((p, i) => { const d = Math.hypot(p.x - e.clientX, p.y - e.clientY); if (d < bd) { bd = d; best = i; } });
  if (best >= 0 && M.predict(best)) { e.stopImmediatePropagation(); e.preventDefault(); }
}
try { globalThis.__F26P = { seats: () => F26.scr.slice(), M: () => F26.M }; } catch (e) { /* node */ }
// ── /fix26 ──
function lotDraw(k, M, T) {
  if (!M) return;
  // ── fix26 ──
  F26.M = M; if (k.screen) F26.scr = f26Seats(k);
  const pred = M.sub === 'predict' && M.phase === 'work';
  if (pred !== F26.on && typeof window !== 'undefined') { F26.on = pred; if (pred) window.addEventListener('pointerdown', f26Tap, true); else window.removeEventListener('pointerdown', f26Tap, true); }
  // ── /fix26 ──
  const K = LOTS[M.kind] || LOTS.payis, run = M.sub === 'run' && M.phase === 'work';
  k.b(PC.a, PC.s, 0.02, 7.4, 3.8, 0.04, '#D8CDB2');                                                                  // the chamber's floor
  const next = !run && M.start >= 0 && M.j < M.plan.n ? M.plan.seq[M.j].i : -1;
  for (let i = 0; i < SEATS; i++) {
    const S = seat(i), face = Math.atan2(PC.s - S.s, PC.a - S.a), win = M.win === i, bare = i === M.start;
    const sway = run && i === M.pos ? 0.12 * M.near * Math.sin(T * 30) : 0;   // ── fix26 ── (the kohen the ring passes sways) ── /fix26 ──
    man(k, S.a, S.s, 0, { robe: ROBE.kohen, yaw: face, arms: 0.85, skin: SKIN[i % 3], cap: bare ? SKIN[i % 3] : undefined, lean: win ? 0.3 * Math.sin(T * 4) : sway, pose: 'lots', fingers: i === HERO_SEAT && M.sub === 'finger' ? (M.fh ? M.fingersNow : 0) : (M.fingers || FINGERS)[i] /* ── slice27 ── ── /slice27 ── */, t: T, u: 1 });   // (seat HERO_SEAT = 0 is the first man() of the frame: hero26's ACTOR picks him)
    // ── fix26 ── "מי יזכה?": a pale question bead over every head, pulsing; the one guessed — a white-blue ring; at the end the stamp
    if (pred) k.s(S.a, S.s, 2.35 + 0.06 * Math.sin(T * 5 + i), 0.13, 0.13, 0.13, '!#DDEBFF');
    if (M.guess === i) { k.ring(S.a, S.s, 0.04, 0.68 + (M.gt > 0 ? M.gt * 0.5 : 0), '!#BFE0FF', 16); k.s(S.a, S.s, 2.3, 0.1, 0.1, 0.1, '!#BFE0FF'); }
    if (M.stamp && win) k.label('ניחשתם!', S.a, S.s, 0.35, 0.36, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' });
    // ── /fix26 ──
    // the raised fingers (one or two, never the thumb — יומא ב, א): pale upright pegs over the hands
    const f = (M.fingers || FINGERS)[i] /* ── slice27 ── ── /slice27 ── */, hy = 1.62, ca = S.a + Math.cos(face) * 0.42, cs = S.s + Math.sin(face) * 0.42;
    if (!RIGGED) for (let x = 0; x < f; x++) { const off = (x - (f - 1) / 2) * 0.12; k.c(ca - Math.sin(face) * off, cs + Math.cos(face) * off, hy, 0.035, 0.24, SKIN[i % 3]); }
    if (M.counted[i]) k.s(S.a, S.s, 2.15, 0.1, 0.1, 0.1, '!#FFD24A');
    if (i === M.hand && M.anim > 0 && !run) k.ring(S.a, S.s, 0.03, 0.55 + (0.32 - Math.min(0.32, M.anim)) * 1.5, '!#FFE08A', 14);
    if (i === next) cue(k, M, S.a, S.s, 0, 0.62, T);
    if (win) { k.ring(S.a, S.s, 0.03, 0.75 + 0.06 * Math.sin(T * 6), '!#FFD24A', 18); k.s(S.a, S.s, 2.45 + 0.08 * Math.sin(T * 5), 0.16, 0.16, 0.16, '!#FFE08A'); }
  }
  // ── slice27 ── the finger first: a ring at his own seat, the hand's count over his head as he holds (☝ → ✌), the words on the near side
  if (M.sub === 'finger' && M.phase === 'work') { const S0 = seat(HERO_SEAT); cue(k, M, S0.a, S0.s, 0, 0.7, T); k.ring(S0.a, S0.s, 2.05, (0.5 + 0.06 * Math.sin(T * 5)) * (M.fh ? 1.25 : 1), '!#FFD24A', 18); k.label(M.fh ? (M.fingersNow === 2 ? '✌ שתיים' : '☝ אחת… החזיקו לשתיים') : 'אתם — ☝ / ✌', S0.a, S0.s, 0.25, 0.34, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' }); }
  else if (M.raisedAt >= 0 && M.t - M.raisedAt < 2.5) { const S0 = seat(HERO_SEAT); k.label((M.fingers || FINGERS)[HERO_SEAT] === 2 ? '✌' : '☝', S0.a, S0.s, 0.3, 0.42, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' }); }
  // (no close-up here: FIX26's camera over the circle already shows his hand and every finger; a close-up on his seat hid the others)
  // ── /slice27 ──
  // the running ring: gold, on the kohen it stands on (a fainter one behind it); a bead above his head
  if (run) {
    const S = seat(M.pos), P = seat(M.prev), pr = (M.pressed ? 1.2 : 1) * (1 + 0.45 * ease(clamp(M.rt / RING.ramp)));   // ── fix26 ── (the halo swells as it speeds) ── /fix26 ──
    k.ring(S.a, S.s, 0.03, 0.78 * pr, '!#FFD24A', 20); k.ring(S.a, S.s, 0.03, 0.62 * pr, '!#FFE9A6', 16);
    k.ring(S.a, S.s, 1.95, 0.42 * pr, '!#FFD24A', 16);                                                               // a halo about his head
    k.s(S.a, S.s, 2.5 + 0.06 * Math.sin(T * 12), 0.15, 0.15, 0.15, '!#FFD24A');
    k.ring(P.a, P.s, 0.03, 0.55, '!#B99A4A', 12);
  }
  // the ממונה in the middle: the hat he took (the count starts from that one — יומא כה, א) in his hand; his right points at the one being counted
  const tg = run ? seat(M.pos) : seat(M.hand >= 0 ? M.hand : 0);
  memune(k, PC.a + 0.3, PC.s, tg.a, tg.s, 0.7, T);
  if (M.start >= 0) { const hat = M.sub === 'named' ? clamp(1 - M.anim / 1.0) : 1, Sx = seat(M.start); k.s(lerp(Sx.a, PC.a + 0.2, ease(hat)), lerp(Sx.s, PC.s - 0.42, ease(hat)), lerp(1.6, 1.0, ease(hat)) + Math.sin(hat * Math.PI) * 0.5, 0.2, 0.1, 0.2, '#F4EFE3'); }
  k.label(run ? K.head : `הממונה: ${M.N}`, PC.a + 2.2, 0, 3.3, 0.34);
  // ── fix26 ── the words on the circle's near side, low (the 60° camera puts the far side under the HUD): the side whose foot is lower on the screen
  let na = PC.a + PA + 1.6;
  if (k.screen) { const p = k.screen(PC.a + PA + 1.6, 0, 0.3), q = k.screen(PC.a - PA - 1.6, 0, 0.3), H = (typeof innerHeight === 'number' ? innerHeight : 400) - 110; const sc = (y) => (y > H ? -y : y); if (sc(q.y) > sc(p.y)) na = PC.a - PA - 1.6; }
  if (M.sub === 'finger' && M.phase === 'work') k.label('החזיקו קצר — אצבע אחת · ארוך — שתיים', na, 0, 0.5, 0.3, { bg: 'rgba(255,240,200,.96)' });   // ── slice27 ── ── /slice27 ──
  else if (pred) k.label(`מי יזכה? ספרו אצבעות — והקישו עליו (${Math.max(0, Math.ceil((M.l2 ? FINGER27.l2Predict : PREDICT_S) - M.pt6))})`, na, 0, 0.5, 0.3, { bg: 'rgba(225,238,255,.95)' });   // ── slice27 ── (L2) ── /slice27 ──
  else if (M.say) k.label(M.say, na, 0, 0.6, 0.32);
  else if (run) k.label('הקישו — עצרו את הטבעת', na, 0, 0.5, 0.3);
  if (M.warn) k.label(M.warn, na, 0, 1.6, 0.3, { bg: 'rgba(240,244,255,.94)' });
  // ── /fix26 ──
  void says;   // ── fix26 ── (the say is drawn on the near side above) ── /fix26 ──
}
export { lotDraw };
const lotTarget = (M) => { if (M.sub === 'finger') { const S = seat(HERO_SEAT); return [S.a, S.s, 2.2]; } /* ── slice27 ── ── /slice27 ── */ if (M.sub === 'run') { const S = seat(M.pos); return [S.a, S.s, 2.2]; } const c = M.plan.seq[Math.min(M.j, M.plan.n - 1)]; const S = seat(c.i); return [S.a, S.s, 2.2]; };
const NOT_LUCK = 'זו ספירה, לא מזל: אתם עצרתם את הטבעת — הממונה נטל את מצנפת הכהן שעליו עמדה, אמר מספר וספר את האצבעות (לא את האנשים) מסביב; מי שנגמר עליו המספר זכה. הכול גלוי ואפשר לבדוק — ומי שסופר את האצבעות מראש יודע מי יזכה: זו המיומנות';   // ── fix26 ── (the skill named) ── /fix26 ──
export const FACTS = {
  payis: { he: NOT_LUCK, ref: 'יומא ב, א; יומא כה, א; תמיד א, ב' },
  payis2: { he: 'הפיס השני: באו והפיסו — מי שוחט, מי זורק, מי מדשן מזבח הפנימי, מי מדשן את המנורה ומי מעלה אברים לכבש. ' + NOT_LUCK, ref: 'תמיד ג, א; יומא ב, ג; יומא כה, א' },
  payis3: { he: 'חדשים לקטורת באו והפיסו — רק מי שעוד לא הקטיר. ' + NOT_LUCK, ref: 'תמיד ה, ב; יומא ב, ד', illus: true },
  payis4: { he: 'חדשים עם ישנים — מי מעלה אברים מן הכבש למזבח. ' + NOT_LUCK, ref: 'תמיד ה, ב; יומא ב, ד', illus: true },
};
const mkLot = (id, he) => mk({
  id, he, place: 'gazit', fact: FACTS[id],
  stage: { ahead: 0.4, lat: 0, K: 1.5 }, bounds: [1.9, 5.0, -3.6, 3.6, 2.6],
  model: (o) => lotModel(o, id), draw: lotDraw, target: lotTarget,
});
export const payis = mkLot('payis', 'הפיס — עוצרים את הטבעת');
export const payis2 = mkLot('payis2', 'הפיס השני — שלושה עשר');
export const payis3 = mkLot('payis3', 'הפיס השלישי — חדשים לקטורת');
export const payis4 = mkLot('payis4', 'הפיס הרביעי — האברים');
void makeWork; void GOLD;
