/* ── worksb22 ── kiyor.js — the kiyor and the mukhni (WAVE22 WORKSB22 #3; תמיד א, ד; יומא ג, י; מדות ג, ו).
 * The wheel stands before him (the well-wheel look of fable20's general work): each tap is a turn — the wheel turns a twelfth, the water
 * rises in the kiyor beside it, and one more of the twelve spouts opens and runs. Twelve turns fill it. A steady heave (one turn every
 * ~½–1½ s) is gold; a hurried or a slow one is good — never a miss. At dawn (the kiyor was lowered for the night: the mukhni raises it)
 * and whenever it runs low. With the full world's water layer (ctx.water) the real kiyor's spouts open one by one beside the work and
 * the mukhni raises it first. המחשה: the hand-wheel (the Temple's mukhni was Ben Katin's; the mishna does not describe how it turned).
 * Taps alone finish it. */
import { workBase } from './common.js';
import { drainActs } from './common.js';
import { getKit } from './craft.js';   // ── places24 ──
import { anchorsOn, ANCHORS } from './anchors.js';   // ── places24 ──
import { figW, labelW, follow24, cueW24 } from './places24.js';   // ── places24 ──

export const KIYOR_MENTOR = { text: 'בן קטין עשה שנים עשר דדים לכיור, ועשה מוכני לכיור — שלא יהיו מימיו נפסלים בלינה.', src: 'יומא ג, י; תמיד א, ד' };
const SPOUTS = 12;
// ── fix26 ── the mukhni first (the owner, 10.10: "לבחון בעין של משחקיות"): HOLD the button — the kiyor rises on its chains; let go at the
// top mark = gold; a plain tap raises it too (good). Then the twelve heaves: each a rope pull (reach → hold), a spout opens with the water's
// sound, the level rises in the basin. After the last, the spouts close one by one (1.2 s) inside the epilogue.
export const MUKHNI = { sec: 1.9, over: 1.3, gold: 0.08, tapSec: 1.1 };
export const mukhniQ = (rise) => (Math.abs(rise - 1) <= MUKHNI.gold ? 2 : 1);
// ── /fix26 ──

export function createKiyorWork(ctx) {
  const S = { kidd: false, l2: false, wash: 0, /* ── slice27 ── ── /slice27 ── */ ang: 0, angT: 0, lvl: 0, lvlT: 0, last: -9, hop: 0, spouts: 0, gold: 0, hurry: 0, mode: 'heave', rise: 1, holding: false, hold0: 0, swallow: 0, auto: false, dawn: true };   // ── fix26 ── (mode 'mukhni' → 'heave') ── /fix26 ──
  let P = null;
  const pt = (a, s, y) => [P.x + P.fx * a - P.fz * s, P.y + y, P.z + P.fz * a + P.fx * s];
  const K = 1.4;

  // ── fix26 ── the mukhni: press → rise while held; release → graded by the top mark; a tap (no hold) → it rises by itself, good
  function press(B, down) {
    const M = B && B.M; if (!M || M.phase !== 'work' || S.mode !== 'mukhni' || S.auto) return;
    if (down) { S.holding = true; S.hold0 = B.t; if (ctx.sfx) { try { ctx.sfx('tick'); } catch (e) { /* */ } } return; }
    if (!S.holding) return; S.holding = false;
    if (B.t - S.hold0 < 0.25) return;   // (a short touch: the tap that follows raises it)
    raised(B, mukhniQ(S.rise)); S.swallow = B.t + 0.4;
  }
  function raised(B, q) {
    const M = B.M; S.mode = 'heave'; S.auto = false;
    M.hit(q, { x: 0.5, y: 0.4, say: q >= 2 ? 'בדיוק בסימן' : '' }); drainActs(ctx, B.ui, M, B.real ? [LV.rim[0], LV.rim[1] + 1.5, LV.rim[2]] : pt(2.4, 2.2, 3.2), 'מוכני');
    if (ctx.sfx) { try { ctx.sfx(q >= 2 ? 'perfect' : 'good'); } catch (e) { /* */ } }
    B.ui.say('הכיור למעלה — עכשיו סובבו את הגלגל: כל משיכה, עוד דד', { ms: 3500 });
    try { B.ui.setBar([{ key: 'turn', icon: '☸', label: 'סובבו את הגלגל', onTap: () => turn(B) }]); } catch (e) { /* */ }
    B.ui.count(`0/${SPOUTS}`, 'דדים');
  }
  // ── /fix26 ──
  function turn(B) {
    const M = B.M; if (!M || M.phase !== 'work') return false;
    // ── fix26 ── (the mukhni's act first: a tap raises it by itself; the tap that ends a hold is not a second act)
    if (B.t < S.swallow) return false;
    if (S.mode === 'mukhni') { if (S.holding && B.t - S.hold0 >= 0.25) return false; S.holding = false; S.auto = true; S.mode = 'raising'; return true; }
    if (S.mode === 'raising') return false;
    // ── /fix26 ──
    // ── slice27 ── after the twelfth: the kiddush — "יד ימין על רגל ימין" (זבחים יט, ב), one tap, the last act
    if (S.spouts >= SPOUTS) { if (S.kidd && S.mode !== 'kiddush-done') { S.mode = 'kiddush-done'; S.wash = 1; M.hit(2, { x: 0.5, y: 0.4, say: 'יד ימין על רגל ימין' }); drainActs(ctx, B.ui, M, B.real ? [MAN[0], 18.5, MAN[1]] : pt(2.4, 0, 2.2), 'קידוש'); if (ctx.sfx) { try { ctx.sfx('water'); } catch (e) { /* */ } } return true; } return false; }
    const W27 = S.l2 ? [0.6, 1.2] : [0.5, 1.6];   // (L2: a stricter rhythm)
    // ── /slice27 ──
    const gap = B.t - S.last, steady = S.last < 0 || (gap >= W27[0] && gap <= W27[1]);
    S.last = B.t; S.hop = 1; S.angT += (Math.PI * 2) / SPOUTS; S.spouts++; S.lvlT = S.spouts / SPOUTS;   // ── fix26 ── (/SPOUTS: M.n counts the mukhni too) ── /fix26 ──
    M.hit(steady ? 2 : 1, { x: 0.5, y: 0.4, say: '' }); drainActs(ctx, B.ui, M, B.real ? [LV.rim[0], LV.rim[1] + 1.5, LV.rim[2]] : pt(2.4, 2.2, 3.2), 'כיור');   // ── places24 ──
    B.ui.count(`${S.spouts}/${SPOUTS}`, 'דדים');
    if (ctx.water && typeof ctx.water.kiyor === 'function' && B.o.real !== false) { try { ctx.water.kiyor({ spigots: Math.min(SPOUTS, S.spouts), ms: 250 }); } catch (e) { /* */ } }
    if (ctx.sfx) { try { ctx.sfx('good'); setTimeout(() => { try { ctx.sfx('water'); } catch (e) { /* */ } }, 180); } catch (e) { /* */ } }   // ── fix26 ── (the spout opens with the water's sound) ── /fix26 ──
    if (S.spouts === 1) B.ui.say('סובבו — עוד סיבוב, עוד דד', { ms: 3500 });
    if (S.spouts === SPOUTS && S.kidd) { B.ui.say('הכיור מלא — עכשיו קדשו: יד ימין על רגל ימין', { ms: 5000 }); try { B.ui.setBar([{ key: 'turn', icon: '💧', label: 'קדשו — יד ימין על רגל ימין', onTap: () => turn(B) }]); } catch (e) { /* */ } B.ui.count('💧', 'קידוש'); }   // ── slice27 ── ── /slice27 ──
    return true;
  }

  // ── places24 ── on the real laver: the world's kiyor (water.js: the basin, the twelve spouts, Ben Katin's wheel over it) is the work;
  // only the kohen at the wheel's rope is drawn (the shared kit: its frame on ANCHORS.laver) — each tap a heave: a spout opens
  const LV = ANCHORS.laver.pts, ROPE = [LV.wheel[0] + 2.0, LV.wheel[2] + 0.4], MAN = [LV.wheel[0] + 2.4, LV.wheel[2] + 1.6];
  const close24k = (x, y, z) => { try { globalThis.__F24.closeup({ x, y, z }, { dist: 15, el: 0.5, hold: 0.7, key: 'kiddush' }  /* (world amot: the figures stand at K 2.3 — ×1.5 the kit's 6) */); } catch (e) { /* */ } };   // ── slice27 ── ── /slice27 ──
  const real = () => !!(anchorsOn() && ctx.water && typeof ctx.water.kiyor === 'function' && getKit());
  function drawReal(B) {
    const k = getKit(); if (!k) return;
    if (k.F.anchor !== 'laver' || !k.F.on) k.place({ anchor: 'laver' });
    k.begin();
    const hop = Math.sin(S.hop * Math.PI);
    // the rope from the wheel's rim down to his hands; he heaves on each tap
    const top = [ROPE[0], LV.wheel[1] - LV.wheelR + 0.2, ROPE[1]], hand = [MAN[0] - 0.5, 16 + 2.3 - hop * 0.6, MAN[1] - 0.8];
    const mx = (top[0] + hand[0]) / 2, my = (top[1] + hand[1]) / 2, mz = (top[2] + hand[2]) / 2, len = Math.hypot(top[0] - hand[0], top[1] - hand[1], top[2] - hand[2]);
    k.wc(mx, my, mz, 0.05, len, '#B39B6E');   // (a cylinder is centred on its point)
    // ── fix26 ── the heave: arms up on the rope (reach), then the pull down to the chest (hold) and back; on the mukhni he leans back on it
    const pull = S.mode === 'heave' ? hop : (S.holding || S.mode === 'raising' ? 0.6 + 0.25 * Math.sin(B.t * 9) : 0);
    figW(k, MAN[0], MAN[1], { face: ROPE, robe: '#EFE9DA', arms: 0.9 - pull * 0.35, pose: pull > 0.45 ? 'hold' : 'reach', u: 1 - pull * 0.4, lean: -0.18 * pull, t: B.t });
    // the water in the basin rises with each spout's turn (a pale disc inside the rim) — and the mukhni's top mark while it rises
    // ── slice27 ── the basin fills visibly (not a label): a water body from the bottom up to the rim, its bright surface rising with each spout
    if (S.mode === 'heave' || S.spouts > 0 || S.mode === 'kiddush-done') { const lv = Math.max(0.04, S.lvl), y0 = LV.rim[1] - 1.5, top = y0 + 1.42 * lv; k.wc(LV.rim[0], (y0 + top) / 2, LV.rim[2], 1.95, Math.max(0.05, top - y0), '!#5FA8DA'); k.wc(LV.rim[0], top + 0.02, LV.rim[2], 2.0, 0.05, '!#BFE6FA'); for (let i = 0; i < 6; i++) { const t = B.t * 1.6 + i; k.wc(LV.rim[0] + Math.cos(t) * 1.2, top + 0.05, LV.rim[2] + Math.sin(t) * 1.2, 0.18, 0.02, '!#EAF7FF'); } }
    // the kiddush: the kohen at the basin, right hand on the right foot, the water poured over them
    if (S.kidd && S.spouts >= SPOUTS) { const wu = S.mode === 'kiddush-done' ? Math.min(1, (S.wash || 0)) : 0; const KD = [LV.rim[0] + 2.2, LV.rim[2] - 1.2];
      figW(k, KD[0], KD[1], { face: [LV.rim[0], LV.rim[2]], robe: '#EFE9DA', arms: 0.9, pose: 'bow', u: 0.55 + 0.25 * wu, t: B.t });
      if (B.M && B.M.phase === 'work') { cueW24(k, B.M, KD[0], 16, KD[1], 1.4, B.t); labelW(k, 'יד ימין על רגל ימין', KD[0], 19.4, KD[1], 0.16, { bg: 'rgba(255,226,150,.97)', fg: '#4A3510' }); }
      if (wu > 0) for (let i = 0; i < 6; i++) k.wc(KD[0] - 0.4 + i * 0.05, 17.6 - ((B.t * 3 + i * 0.3) % 1.4), KD[1] - 0.3, 0.05, 0.25, '!#9FD3F2');
      if (globalThis.__F24 && globalThis.__F24.closeup) close24k((KD[0] + LV.rim[0]) / 2, 18, (KD[1] + LV.rim[2]) / 2); }
    // ── /slice27 ──
    if (S.mode !== 'heave') { const y0 = LV.rim[1] - 2.05 * (1 - Math.min(1, S.rise)); k.wc(LV.rim[0] + 2.6, LV.rim[1] + 0.15, LV.rim[2], 0.32, 0.06, '!#FFD24A'); k.wc(LV.rim[0] + 2.6, y0 + 0.15, LV.rim[2], 0.22, 0.05, Math.abs(S.rise - 1) <= MUKHNI.gold ? '!#FFE9A6' : '!#9FD3F2');
      labelW(k, S.holding ? 'החזיקו… שחררו בסימן הזהב' : 'החזיקו את הכפתור — המוכני מעלה את הכיור', LV.rim[0], y0 + 0.9, LV.rim[2], 0.26); }   // (over the basin where it is now: down in its pit until raised)
    // ── /fix26 ──
    if (B.M && B.M.phase === 'work') cueW24(k, B.M, MAN[0] - 0.4, 16, MAN[1] - 0.6, 1.3, B.t);
    if (B.M && B.M.phase === 'work' && S.mode !== 'heave' && S.mode !== 'kiddush-done') { const y0 = LV.rim[1] - 2.05 * (1 - Math.min(1, S.rise)); cueW24(k, B.M, LV.rim[0], y0 + 0.2, LV.rim[2], 2.6, B.t); }   // ── slice27 ── (the ring on the kiyor itself while the mukhni raises it: the thing the hold moves) ── /slice27 ──
    else if (B.M && B.M.phase === 'work' && S.mode === 'heave' && S.spouts < SPOUTS) cueW24(k, B.M, ROPE[0], LV.wheel[1] - LV.wheelR - 0.6, ROPE[1], 1.0, B.t);   // ── slice27 ── (on the rope's end: the heave) ── /slice27 ──
    // ── light28 ── (the 3D "n/12 דדים" over the rim is gone: it duplicated the HUD chip and was drawn through the HUD — the owner's shot 3) ── /light28 ──
    if (S.spouts >= SPOUTS) labelW(k, 'הכיור מלא', LV.rim[0], LV.rim[1] + 4.6, LV.rim[2], 0.32);
    follow24(k, 'laver');
    k.end();
  }
  // ── /places24 ──
  function draw(B) {
    if (B.real) { drawReal(B); return; }   // ── places24 ──
    const k = B.kit; k.clear();
    const yawA = Math.atan2(P.fx, P.fz) + Math.PI / 2;
    const bx = (a, s, y, sa, sy, ss, hex, roll = 0, ya = 0) => { const p = pt(a, s, y * K); k.put(p[0], p[1], p[2], sa * K, sy * K, ss * K, yawA + ya, hex, 0, roll); };
    const hop = Math.sin(S.hop * Math.PI) * 0.1;
    // the wheel (left): two posts, the axle across, twelve rim bars and four spokes turning
    const wa = 2.4, ws = -2.3, wy = 2.1, R = 1.0;
    bx(wa, ws + 0.9, 1.05, 0.2, 2.1, 0.2, '#6B4E31'); bx(wa, ws - 0.9, 1.05, 0.2, 2.1, 0.2, '#6B4E31'); bx(wa, ws, wy, 0.12, 0.12, 2.1, '#4E3822');
    for (let i = 0; i < 12; i++) { const t = S.ang + i / 12 * Math.PI * 2; bx(wa + Math.cos(t) * R, ws + 0.45, wy + Math.sin(t) * R + (i === 0 ? hop : 0), 0.5, 0.14, 0.14, '#8A6A45', t + Math.PI / 2); }
    for (let i = 0; i < 4; i++) { const t = S.ang + i / 4 * Math.PI; bx(wa, ws + 0.45, wy, 2 * R - 0.1, 0.1, 0.1, '#8A6A45', t); }
    bx(wa, ws + 0.45, wy, 0.28, 0.28, 0.28, '#4E3822');
    // the kiyor (right): a stand, the basin's rim, the water rising, twelve spouts round it
    const ka = 2.4, ks = 2.4, rim = 1.55, by = 1.0;
    bx(ka, ks, by / 2, 0.9, by, 0.9, '#B9AA8A');
    for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2; bx(ka + Math.cos(t) * 1.15, ks + Math.sin(t) * 1.15, by + 0.35, 0.5, 0.7, 0.34, '#C98F4B', 0, -(t + Math.PI / 2)); }   // the rim, a bronze look
    const lv = 0.12 + 0.88 * S.lvl; bx(ka, ks, by + 0.1 + 0.55 * lv, 2.1, 0.06, 2.1, '!#6FB4E6');
    for (let i = 0; i < SPOUTS; i++) {
      const t = i / SPOUTS * Math.PI * 2 + Math.PI / 12, c = Math.cos(t), s = Math.sin(t), open = i < S.spouts;
      bx(ka + c * 1.55, ks + s * 1.55, by + 0.55, 0.3, 0.14, 0.14, open ? '#D9A060' : '#A5784A', 0, -t);
      if (open) bx(ka + c * 1.8, ks + s * 1.8, by * 0.5 + 0.1, 0.07, by + 0.2, 0.07, '!#8CCBF2');
    }
    if (S.spouts >= SPOUTS) for (let i = 0; i < 6; i++) bx(ka + Math.cos(i) * 2.4, ks + Math.sin(i) * 2.4, 0.5 + 0.2 * Math.sin(B.t * 4 + i), 0.12, 0.12, 0.12, '!#FFE9A8');
    k.flush();
  }

  const W = workBase(ctx, {
    id: 'kiyor', n: () => SPOUTS + 1 + (S.kidd ? 1 : 0) /* ── fix26 ── (the mukhni + the twelve) ── /fix26 ── ── slice27 ── (+ the kiddush's tap) ── /slice27 ── */, coach: 'הקישו על הגלגל — כל הקשה סיבוב אחד, ועוד דד נפתח. בקצב קבוע — זהב', place: true, foot: [1, 4, -4.2, 4.2], kit: 120,
    build(B, o) {
      B.real = real() && o.real !== false;   // ── places24 ──
      if (B.real) { const A = ANCHORS.laver; B.spot = { x: MAN[0], y: 16, z: MAN[1], fx: A.face[0], fz: A.face[1] }; }   // ── places24 ──
      P = B.spot; Object.assign(S, { ang: 0, angT: 0, lvl: 0, lvlT: 0, last: -9, hop: 0, spouts: 0, mode: 'mukhni', rise: 0, holding: false, hold0: 0, swallow: 0, auto: false });   // ── fix26 ── ── /fix26 ──
      B.M.autoFn = () => turn(B);
      const ws = -2.3;
      B.ui.chip('wheel', { at: () => (B.real ? [ROPE[0], LV.wheel[1] - 2.0, ROPE[1]] : pt(2.4, ws + 0.45, 2.1 * K)), icon: '☸', label: 'סובבו', cls: 'sel', onTap: () => turn(B) });   // ── places24 ── (the real wheel)
      B.ui.setBar([{ key: 'turn', icon: '↑', label: 'החזיקו — המוכני מעלה את הכיור', onTap: () => turn(B) }]);   // ── fix26 ── (the wheel's words after the mukhni: raised()) ── /fix26 ──
      B.ui.say(o.dawn === false ? 'הכיור התרוקן — ממלאים אותו' : 'עת לקדש ידיים ורגליים — מעלים את הכיור וממלאים', { ms: 5000 });
      // ── fix26 ── the kiyor stands down in its pit (Ben Katin's mukhni, יומא ג, י): the player's hold raises it
      B.ui.count('↑', 'מוכני');
      if (ctx.water && o.real !== false) { try { if (typeof ctx.water.mukhniAt === 'function') ctx.water.mukhniAt(0); else if (typeof ctx.water.mukhni === 'function') ctx.water.mukhni(false, { sec: 2 }); } catch (e) { /* */ } }
      // ── /fix26 ──
    },
    tick(dt, B) {
      // ── fix26 ── the mukhni's rise: while held (past the top it stops by itself — good), by itself after a tap, and up to the top after a release
      if (S.mode === 'mukhni' && S.holding && B.t - S.hold0 > 0.08) { S.rise += dt / MUKHNI.sec; if (S.rise >= MUKHNI.over) { S.holding = false; raised(B, 1); } }
      else if (S.mode === 'raising') { S.rise += dt / MUKHNI.tapSec; if (S.rise >= 1) { S.rise = 1; raised(B, 1); } }
      else if (S.mode === 'heave' && S.rise !== 1) S.rise = S.rise > 1 ? Math.max(1, S.rise - dt / 0.5) : Math.min(1, S.rise + dt / 0.6);
      if (S.rise !== S.wr) { S.wr = S.rise; const wv = ctx.water; if (wv && typeof wv.mukhniAt === 'function' && B.o.real !== false) { try { wv.mukhniAt(Math.min(1, S.rise)); } catch (e) { /* */ } } }
      // ── /fix26 ──
      S.ang += (S.angT - S.ang) * (1 - Math.exp(-dt * 7)); S.lvl += (S.lvlT - S.lvl) * (1 - Math.exp(-dt * 5)); if (S.hop > 0) S.hop = Math.max(0, S.hop - dt * 3.2);
      draw(B);
    },
    end(B) {
      B.ui.say(KIYOR_MENTOR.text, { src: KIYOR_MENTOR.src, mentor: true }); B.ui.drop('wheel');
      B.ui.count(`${SPOUTS}/${SPOUTS}`, 'הכיור מלא');
      // ── fix26 ── the spouts close one by one (1.2 s) inside the epilogue — and once more at 3.5 s (a washer at a spout gives it back closed: water.js sp.want)
      if (ctx.water && typeof ctx.water.kiyor === 'function' && B.o.real !== false) { const cl = (ms) => { try { ctx.water.kiyor({ spigots: 0, ms }); } catch (e) { /* */ } }; setTimeout(() => cl(1200), 350); setTimeout(() => cl(300), 3500); }
      try { globalThis.__F26K = { end: Math.round(performance.now()) }; } catch (e) { /* tests */ }
      // ── /fix26 ──
    },
    teardown(B) { if (B.kit) B.kit.hide(); if (B.real) { const k = getKit(); if (k && k.F.anchor === 'laver') k.clear(); } },   // ── places24 ──
    at: () => (W && W.B && W.B.real ? [LV.rim[0], LV.rim[1] + 1, LV.rim[2]] : P ? pt(2.4, 0, 2.2) : [0, 0, 0]),   // ── places24 ── (the "+N" over the real basin)
  });
  // ── slice27 ── the run's options before its model is made: the kiddush (the dawn's washing: its last act) and L2
  { const b0 = W.begin; W.begin = (o = {}) => { S.kidd = !!o.kiddush; S.l2 = !!o.l2; S.wash = 0; return b0(o); }; }
  // ── /slice27 ──
  W.state = S; W.turn = () => turn(W.B);
  W.press = (down) => press(W.B, !!down);   // ── fix26 ── (registerb routes the twin's press here) ── /fix26 ──
  return W;
}
// ── /worksb22 ──
