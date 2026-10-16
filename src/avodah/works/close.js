/* ── worksb22 ── close.js — the day's end (WAVE22 WORKSB22 #4; תמיד ג, ד; מדות א, ט; שקלים ה, א).
 * Part 1, the vessels: twelve trays of silver and gold — a tap on a tray counts it, eight at a time, the number runs up to 93 (the twelfth
 * tray holds the last five: 11 × 8 + 5). Part 2, the gate (בן גבר, on the closing of the gates): three taps — lift the stone by its ring,
 * take the keys from the chain, lock — the leaf swings shut with its sound. Then the work is done and the host's `dayEnd` follows
 * (ENGINE22: onDone). המחשה: that the vessels are counted back in the evening (the morning's 93 are in תמיד ג, ד); the leaf, the trays' look.
 * Taps alone finish it. */
import { workBase, drainActs } from './common.js';
import { getKit } from './craft.js';   // ── places24 ──
import { anchorsOn } from './anchors.js';   // ── places24 ──
import { figW, labelW, follow24, cueW24, nikanorLeaves } from './places24.js';   // ── places24 ──

export const CLOSE_MENTOR = { text: 'בבוקר הוציאו 93 כלים, ובערב סופרים אותם בחזרה (המחשה). בן גבר על נעילת השערים: מגביהים את האבן בטבעת, נוטלים מפתחות, נועלים, ולוי ישן בחוץ.', src: 'תמיד ג, ד; שקלים ה, א; מדות א, ט' };
export const VESSELS = 93, TRAYS = 12, PER = 8;
export const TRAY_CNT = (i) => (i < TRAYS - 1 ? PER : VESSELS - PER * (TRAYS - 1));
// ── bloodb25 ── the washing (DAM25 §3, §1 row 20 — המחשה: the sources are silent on a daily routine of the מזרקות): after the count, six
// vessels of the blood are rinsed in clear water — the water runs clear to the grate, the vessel shines and is set back on its tray. +1 each
export const WASH = 6, WASH_LINE = { text: 'כלי שרת — נקיים לעבודת מחר. המים יורדים צלולים לאמה.', src: 'המחשה; ויקרא ו, כא (מריקה ושטיפה בחטאת)' };
const WATER = '!#BFE3F0', WATER2 = '!#DDF1F8';   // (clear water — never a red in it)
// ── /bloodb25 ──

export function createCloseWork(ctx) {
  const S = { part: 'both', phase: 'vessels', trays: 0, cnt: 0, shown: 0, gate: 0, door: 1.25, doorT: 1.25, stone: 0, stoneT: 0, keys: 0, hop: 0, last: -1, washed: 0, rinse: 0, wlast: -1 };
  let P = null;
  const lerp = (a, b, u) => a + (b - a) * u;
  const pt = (a, s, y) => [P.x + P.fx * a - P.fz * s, P.y + y, P.z + P.fz * a + P.fx * s];
  const K = 1.3;

  function tapTray(B, i) {
    const M = B.M; if (!M || M.phase !== 'work' || S.phase !== 'vessels') return false;
    if (i == null) i = S.trays;
    if (i < S.trays) { B.ui.say('את המגש הזה כבר ספרתם — הלאה', { ms: 2000 }); return false; }
    if (i > S.trays) { B.ui.say('סופרים לפי הסדר — המגש המסומן', { ms: 2000 }); B.ui.shake('t' + i); return false; }
    S.cnt += TRAY_CNT(i); S.last = i; S.hop = 1; S.trays++;
    M.hit(2, { x: 0.5, y: 0.4, say: S.trays === TRAYS ? '93!' : '' }); drainActs(ctx, B.ui, M, pt(2.0, -3.1 + i * 0.56, 2.2), 'כלים');
    B.ui.drop('t' + i); if (S.trays < TRAYS) trayChip(B, S.trays);
    if (S.trays === TRAYS) { S.phase = 'wash'; B.ui.say('שלושה־ותשעים — ועכשיו שוטפים את המזרקות במים', { ms: 4000 }); washChips(B); }   // ── bloodb25 ── (then the washing) else if (S.trays === 1) B.ui.say('כל הקשה סופרת מגש: שמונה כלים', { ms: 3000 });
    return true;
  }
  /** only the next tray wears a chip (twelve chips would pile up on a phone's screen) */
  function trayChip(B, i) {
    const row = i < 6 ? 0 : 1, col = i % 6;
    B.ui.chip('t' + i, { at: () => pt(1.35 + row * 1.4, -1.65 + col * 0.66, 2.0 * K), icon: '8', label: 'מגש ' + (i + 1), cls: 'sel', onTap: () => tapTray(B, i) });
  }
  // ── bloodb25 ── the washing: one vessel at a time, the clear water poured over it to the grate; it shines and goes back to the tray
  function washChips(B) {
    B.ui.dropAll('t'); B.ui.dropAll('w');
    if (S.washed >= WASH) return;
    const j = S.washed;
    B.ui.chip('w' + j, { at: () => (P ? pt(1.0, 2.9, 1.3 * K) : [0, 0, 0]), icon: '💧', label: 'מזרק ' + (j + 1), cls: 'sel', onTap: () => tapWash(B) });
    B.ui.setBar([{ key: 'wash', icon: '💧', label: 'שטפו מזרק', onTap: () => tapWash(B) }]);
  }
  function tapWash(B) {
    const M = B.M; if (!M || M.phase !== 'work' || S.phase !== 'wash') return false;
    const j = S.washed; S.washed++; S.rinse = 1; S.wlast = j; B.ui.drop('w' + j);
    M.hit(1, { x: 0.5, y: 0.4, say: S.washed === WASH ? 'נקיים' : '' }); drainActs(ctx, B.ui, M, pt(1.0, 2.9, 1.6), 'שטיפה');
    if (ctx.sfx) { try { ctx.sfx('soft'); } catch (e) { /* */ } }
    if (S.washed < WASH) washChips(B);
    else if (S.part === 'both') { S.phase = 'gate'; B.ui.say('שלושה־ותשעים, והמזרקות נקיות — ועכשיו נועלים את השער', { ms: 5000 }); gateChips(B); }
    else { B.ui.dropAll('w'); B.ui.say(WASH_LINE.text, { ms: 4000 }); }
    return true;
  }
  // ── /bloodb25 ──
  const GSTEP = [['stone', '🪨', 'מגביהים את האבן בטבעת'], ['keys', '🗝', 'נוטלים את המפתחות'], ['lock', '🔒', 'נועלים']];
  function gateChips(B) {
    B.ui.dropAll('t');
    const [id, ic, he] = GSTEP[S.gate] || GSTEP[2];
    B.ui.chip('g-' + id, { at: () => (B.realGate ? (S.gate < 2 ? [RS.slab[0], 15.4, RS.slab[1]] : [11.6, 19, 0]) : pt(1.6, 0.4, [1.2, 1.6, 2.2][S.gate] * K)), icon: ic, label: he, cls: 'sel', onTap: () => tapGate(B) });   // ── places24 ──
    B.ui.setBar([{ key: 'gate', icon: ic, label: he, onTap: () => tapGate(B) }]);
  }
  function tapGate(B) {
    const M = B.M; if (!M || M.phase !== 'work' || S.phase !== 'gate') return false;
    const g = S.gate; B.ui.drop('g-' + GSTEP[g][0]);
    if (g === 0) { S.stoneT = 1; }
    else if (g === 1) { S.keys = 1; }
    else { S.doorT = 0; S.hop = 1; if (ctx.shake) { try { ctx.shake(0.18); } catch (e) { /* */ } } }
    S.gate++;
    M.hit(g === 2 ? 2 : 1, { x: 0.5, y: 0.4, say: g === 2 ? 'נעול' : '' }); drainActs(ctx, B.ui, M, B.realGate ? [12, 17, 0] : pt(1.6, 0.4, 2.4), 'שער');   // ── places24 ──
    if (ctx.sfx) { try { ctx.sfx(g === 2 ? 'chime' : 'good'); } catch (e) { /* */ } }
    if (S.gate < 3) gateChips(B); else { B.ui.dropAll('g-'); }
    return true;
  }

  // ── places24 ── the gate part on Nikanor's real opening: both leaves swing shut (the shared kit, anchored there); the marble slab with
  // its ring and the chain of keys at the gate's foot — ⚑ המחשה: the Mishnah keeps them in בית המוקד (מדות א, ט); a Levite at the leaves
  const RS = { slab: [14.0, 7.0], keysAt: [11.6, 1.2] };
  function drawRealGate(B) {
    const k = getKit(); if (!k) return;
    if (k.F.anchor !== 'nikanor' || !k.F.on) k.place({ anchor: 'nikanor' });
    k.begin();
    const shut = Math.max(0, Math.min(1.35, S.door));
    nikanorLeaves(k, shut, shut);
    const lift = S.stone, y0 = 13.5;
    k.wb(RS.slab[0], y0 + 0.12 + lift * 0.9, RS.slab[1], 1.4, 1.4, 0.24, '#EEE9DF', { roll: lift * 0.3 });
    { const q = k.loc(RS.slab[0], y0 + 0.36 + lift * 1.1, RS.slab[1]); k.s(q[0], q[1], q[2], 0.1, 0.05, 0.1, '#6B6B72'); }
    const kx = S.keys < 1 ? RS.slab[0] : RS.keysAt[0], kz = S.keys < 1 ? RS.slab[1] + 0.3 : RS.keysAt[1];
    for (let j = 0; j < 3; j++) k.wb(kx, y0 + (S.keys < 1 ? 0.5 + lift * 0.5 : 3.2) + j * 0.0, kz + j * 0.22, 0.08, 0.1, 0.36, '#E9B949');
    figW(k, S.keys < 1 ? RS.slab[0] + 1.3 : RS.keysAt[0] + 0.9, S.keys < 1 ? RS.slab[1] + 1.0 : RS.keysAt[1] + 0.8, { face: S.keys < 1 ? RS.slab : [10.5, 0], robe: '#7C8AA3', arms: 0.6, pose: S.keys < 1 ? 'scoop' : 'reach', u: 0.7, t: B.t });
    if (S.phase === 'gate' && B.M.phase === 'work') cueW24(k, B.M, S.gate < 2 ? RS.slab[0] : 11.6, y0, S.gate < 2 ? RS.slab[1] : 0, 1.3, B.t);
    labelW(k, 'שער ניקנור', 10.5, 35, 0, 0.3);
    follow24(k, 'nikanor');
    k.end();
  }
  const realGate = (B) => !!(B.realGate);
  // ── /places24 ──
  function draw(B) {
    if (realGate(B) && (S.part === 'gate' || S.phase === 'gate' || S.phase === 'done')) { drawRealGate(B); if (S.part === 'gate') { B.kit && B.kit.clear(); B.kit && B.kit.flush(); return; } }   // ── places24 ──
    const k = B.kit; k.clear();
    const yawA = Math.atan2(P.fx, P.fz) + Math.PI / 2;
    const bx = (a, s, y, sa, sy, ss, hex, roll = 0, ya = 0) => { const p = pt(a, s, y * K); k.put(p[0], p[1], p[2], sa * K, sy * K, ss * K, yawA + ya, hex, 0, roll); };
    if (S.part !== 'gate' && (S.phase === 'vessels' || S.phase === 'wash' || S.part === 'vessels')) {   // ── bloodb25 ── (+ the washing)
      // the long table of trays: two rows of six, eight vessels on each (silver and gold, alternate)
      bx(2.0, 0, 0.64, 3.7, 0.12, 3.8, '#A88A5E');
      for (const s of [-1.6, 1.6]) for (const a of [0.25, 3.75]) bx(a, s, 0.3, 0.14, 0.6, 0.14, '#6B4E31');
      for (let i = 0; i < TRAYS; i++) {
        const row = i < 6 ? 0 : 1, col = i % 6, a = 1.35 + row * 1.4, s = -1.65 + col * 0.66, done = i < S.trays, hot = i === S.trays && B.M.phase === 'work';
        bx(a, s, 0.74, 0.6, 0.06, 0.58, done ? '#E9E1CE' : '#BFB291');
        if (hot) bx(a, s, 0.72, 0.74, 0.03, 0.74, B.t % 0.9 < 0.45 ? '!#FFE9A8' : '!#FFD66E');
        const cnt = TRAY_CNT(i), hop = i === S.last ? Math.sin(S.hop * Math.PI) * 0.15 : 0;
        for (let j = 0; j < cnt; j++) { const jr = j >> 2, jc = j & 3; bx(a - 0.12 + jr * 0.24, s - 0.21 + jc * 0.14, 0.9 + hop, 0.16, 0.12, 0.1, (j & 1) ? '#E9B949' : '#C9CED6'); }
      }
    }
    // ── bloodb25 ── the washing: a basin and a jar of clear water, the grate in the floor, the six vessels; the one being rinsed tilts under the
    // stream, the water runs clear down to the grate; a washed one shines (gold, unlit a moment) and sits on its tray
    if (S.part !== 'gate' && (S.phase === 'wash' || (S.phase === 'done' && S.washed > 0) || (S.phase === 'gate' && S.part === 'both' && S.washed >= WASH && S.gate === 0))) {
      bx(1.6, 3.45, 0.02, 0.7, 0.03, 0.5, '#4A4740'); for (let g = 0; g < 4; g++) bx(1.6, 3.27 + g * 0.12, 0.04, 0.6, 0.02, 0.04, '#77736A');   // the grate
      bx(1.0, 3.45, 0.25, 0.6, 0.5, 0.6, '#B9AC8E');                                                                                  // the stone basin
      const r = S.rinse, jy = 1.25 + 0.1 * Math.sin(r * Math.PI);
      bx(0.7, 2.95, jy, 0.22, 0.32, 0.22, '#A88A5E', 0.5 * r);                                                                        // the jar
      for (let j = 0; j < WASH; j++) {
        const done = j < S.washed, cur = j === S.wlast && r > 0.02, sh = done && j === S.wlast ? r : 0;
        const at = done && !cur ? [3.6, -1.55 + j * 0.3, 0.8] : cur ? [1.0, 2.95, 1.0] : [0.2 + (j % 3) * 0.3, 2.6 + (j >= 3 ? 0.35 : 0), 0.62];
        bx(at[0], at[1], at[2], 0.2, 0.14, 0.2, sh > 0.3 ? '!#FFE9A8' : (j & 1 ? '#C9CED6' : '#E9B949'), cur ? 0.6 * r : 0);
        if (j === S.washed && S.phase === 'wash' && B.M.phase === 'work') bx(at[0], at[1], at[2] - 0.08, 0.32, 0.02, 0.32, B.t % 0.9 < 0.45 ? '!#FFE9A8' : '!#FFD66E');
      }
      if (r > 0.05) for (let w = 0; w < 6; w++) { const f = w / 5; bx(lerp(0.75, 1.55, f), lerp(2.97, 3.4, f), lerp(1.15, 0.06, f) , 0.05, 0.22, 0.05, w & 1 ? WATER : WATER2); }   // the stream, clear, to the grate
      if (r > 0.05) bx(1.6, 3.45, 0.05, 0.5 * r, 0.02, 0.4 * r, WATER2);
    }
    // ── /bloodb25 ──
    if (!realGate(B) && (S.part === 'gate' || S.phase === 'gate' || (S.phase === 'done' && S.part !== 'vessels'))) {   // ── places24 ── (on the real gate: drawRealGate)
      // the gate: two posts and a lintel, the leaf on its hinge (swinging shut), the marble slab with its ring and the chain of keys
      const gs = -1.7;
      bx(2.5, gs, 1.5, 0.3, 3.0, 0.3, '#B9AA8A'); bx(2.5, gs + 3.4, 1.5, 0.3, 3.0, 0.3, '#B9AA8A'); bx(2.5, gs + 1.7, 3.05, 0.3, 0.3, 3.9, '#B9AA8A');
      const phi = S.door, cs = Math.cos(phi), sn = Math.sin(phi), w = 3.1;
      bx(2.5 + sn * w / 2, gs + 0.15 + cs * w / 2, 1.4, w, 2.7, 0.14, '#8A6A45', 0, -(Math.PI / 2 - phi));
      const lift = S.stone, sa = 1.5, ss = 1.6;
      bx(sa, ss, 0.1 + lift * 0.55, 1.1, 0.2, 1.1, '#EEE9DF', 0, lift * 0.25);
      bx(sa, ss, 0.24 + lift * 0.75, 0.2, 0.12, 0.2, '#6B6B72');   // the ring
      if (S.keys < 1) for (let j = 0; j < 3; j++) bx(sa, ss + 0.15 + j * 0.12, 0.34 + lift * 0.3, 0.07, 0.2, 0.05, '#E9B949');
      else for (let j = 0; j < 3; j++) bx(2.3, -0.1 + j * 0.16, 1.0 + (S.hop ? 0.1 * Math.sin(S.hop * Math.PI) : 0), 0.07, 0.22, 0.05, '#E9B949');
      if (S.phase === 'gate' && B.M.phase === 'work') bx(sa, ss, 0.05, 1.5, 0.03, 1.5, B.t % 1.0 < 0.5 ? '!#FFE9A8' : '!#FFD66E');
    }
    k.flush();
  }

  const W = workBase(ctx, {
    id: 'close', n: () => TRAYS + 3, coach: 'הקישו על המגש המסומן — שמונה כלים בכל הקשה. אחר כך נועלים את השער, בשלוש הקשות', place: true, foot: [0, 4.6, -3.2, 3.2], kit: 200,
    build(B, o) {
      const part = o.part === 'vessels' || o.part === 'gate' ? o.part : 'both';
      B.realGate = part === 'gate' && anchorsOn() && !!getKit();   // ── places24 ──
      if (B.realGate) B.spot = { x: 13.0, y: 13.5, z: 2.0, fx: -1, fz: 0 };   // ── places24 ── (the gate's foot, on the steps' top)
      P = B.spot;
      Object.assign(S, { part, phase: part === 'gate' ? 'gate' : 'vessels', trays: 0, cnt: 0, shown: 0, gate: 0, door: 1.25, doorT: 1.25, stone: 0, stoneT: 0, keys: 0, hop: 0, last: -1, washed: 0, rinse: 0, wlast: -1 });
      B.M.n = part === 'vessels' ? TRAYS + WASH : part === 'gate' ? 3 : TRAYS + WASH + 3;   // ── bloodb25 ── (+ the six washings)
      B.M.autoFn = () => { if (S.phase === 'vessels') tapTray(B); else if (S.phase === 'wash') tapWash(B); else tapGate(B); };
      if (part !== 'gate') {
        trayChip(B, 0);
        B.ui.setBar([{ key: 'count', icon: '🔢', label: 'ספרו מגש', onTap: () => tapTray(B) }]);
        B.ui.say('סוף היום — סופרים את הכלים: מגש אחר מגש', { ms: 5000 }); B.ui.count('0', 'כלים');
      } else { gateChips(B); B.ui.say('נועלים את השער', { ms: 4000 }); }
    },
    tick(dt, B) {
      if (S.hop > 0) S.hop = Math.max(0, S.hop - dt * 2.6);
      if (S.rinse > 0) S.rinse = Math.max(0, S.rinse - dt * 0.9);   // ── bloodb25 ──
      if (S.shown < S.cnt) { S.shown = Math.min(S.cnt, S.shown + dt * 48); }
      if (S.part !== 'gate' && S.phase === 'wash') B.ui.count(`${S.washed}/${WASH}`, 'מזרקות שנשטפו');   // ── bloodb25 ──
      else if (S.part !== 'gate') { B.ui.count(`${Math.floor(S.shown + 1e-6)}`, S.cnt >= VESSELS && S.shown >= VESSELS ? 'כלים — הכול כאן' : 'כלים'); }
      S.stone += (S.stoneT - S.stone) * (1 - Math.exp(-dt * 6)); S.door += (S.doorT - S.door) * (1 - Math.exp(-dt * 4));
      if (B.M.phase !== 'work') S.phase = 'done';
      draw(B);
    },
    end(B) {
      S.phase = 'done'; B.ui.say(S.part === 'vessels' ? `${WASH_LINE.text} ${CLOSE_MENTOR.text}` : CLOSE_MENTOR.text, { src: S.part === 'vessels' ? `${CLOSE_MENTOR.src}; ${WASH_LINE.src}` : CLOSE_MENTOR.src, mentor: true }); B.ui.dropAll('');   // ── bloodb25 ── (the washing's line with the count's)
      if (ctx.emit) { try { ctx.emit('closeDone', { vessels: S.cnt, locked: S.gate >= 3 }); } catch (e) { /* */ } }
    },
    teardown(B) { if (B.kit) B.kit.hide(); if (B.realGate) { const k = getKit(); if (k && k.F.anchor === 'nikanor') k.clear(); } },   // ── places24 ──
    at: () => (W && W.B && W.B.realGate ? [12, 17, 0] : P ? pt(2.0, 0, 2.2) : [0, 0, 0]),   // ── places24 ──
  });
  W.state = S; W.tapTray = (i) => tapTray(W.B, i); W.tapGate = () => tapGate(W.B); W.tapWash = () => tapWash(W.B);   // ── bloodb25 ──
  return W;
}
// ── /worksb22 ──
