/* ── worksb22 ── seals.js — the seals and the libations (WAVE22 WORKSB22 #2; שקלים ה, ג–ד).
 * Day: at יוחנן בן פנחס's table a pilgrim asks for a seal; four seals lay there — עגל (cattle), זכר (rams), גדי (the other sheep and goats),
 * חוטא (the three beasts of the healed metzora) — the icon of each is the animal it is for. The אמרכל taps the right seal, then the pilgrim
 * takes it to אחיה's store (tap) and gets the libations: wine, oil, flour (stock.take). A wrong seal waits: "לא זה — …", no penalty.
 * Evening ('evening'): the count — six seals on the tray, a tap each, "יצא בשלום": the seals against the libations (ה, ד: a shortfall
 * Yochanan makes up from his own; a surplus goes to the Temple).
 * המחשה: the amounts per seal (a calf's libations are more than a ram's, a ram's more than a lamb's: 3 · 2 · 1 — the Torah's proportion,
 * במדבר טו), the tables' look. Taps alone finish it. */
import { workBase, drainActs, WORK_N } from './common.js';

export const SEALS = {
  egel: { icon: '🐂', he: 'עגל', col: '#B8864B', for: 'בקר', units: 3 },
  zachar: { icon: '🐏', he: 'זכר', col: '#8F8F96', for: 'אילים', units: 2 },
  gedi: { icon: '🐑', he: 'גדי', col: '#C9B27A', for: 'צאן ועזים', units: 1 },
  chote: { icon: '🌿', he: 'חוטא', col: '#6E8F5A', for: 'מצורע שנטהר', units: 3 },
};
export const ASK = ['egel', 'zachar', 'gedi', 'chote', 'zachar', 'egel', 'gedi', 'chote'];
const ASK_ICON = { egel: '🐂', zachar: '🐏', gedi: '🐑', chote: '🌿' };
const ASK_BEAST = { egel: 'calf', zachar: 'ram', gedi: 'lamb', chote: null };
const WRONG = {
  egel: 'לא זה — לבקר: עגל', zachar: 'לא זה — לאיל: זכר', gedi: 'לא זה — לכבש ולעז: גדי', chote: 'לא זה — למצורע שנטהר: חוטא',
};
export const SEALS_MENTOR = {
  day: { text: 'ארבעה חותמות היו במקדש: עגל, זכר, גדי, חוטא. נותנים מעות ליוחנן, מקבלים חותם, ומחליפים אצל אחיה בנסכים.', src: 'שקלים ה, ג–ד' },
  evening: { text: 'בערב מתחשבים אחיה ויוחנן: אם חסר — יוחנן משלים משלו; אם נשאר — להקדש.', src: 'שקלים ה, ד' },
};

export function createSealsWork(ctx) {
  const THREE = ctx.THREE, av = ctx.av || null;
  const actors = ctx.actors || (av && av._actors) || null, animals = ctx.animals || (av && av._animals) || null;
  const G = (x, z) => (ctx.ground ? ctx.ground(x, z) : 0);
  const S = { mode: 'day', ask: null, i: 0, phase: 'ask', counted: 0, a: null, an: null, jars: 0, took: { wine: 0, oil: 0, flour: 0 }, wrong: 0, hop: 0, sealed: 0 };
  let P = null;   // the frame: { x, y, z, fx, fz }
  const pt = (a, s, y) => [P.x + P.fx * a - P.fz * s, P.y + y, P.z + P.fz * a + P.fx * s];

  function clearPilgrim() {
    if (S.a && actors) actors.remove(S.a); if (S.an && animals) { const an = S.an; an.visT = 0; an.onHide = () => animals.remove(an); }
    S.a = null; S.an = null;
  }
  function newPilgrim(B) {
    clearPilgrim();
    if (!actors) return;
    const q = pt(3.8, -2.3, 0), yaw = Math.atan2(-P.fx, -P.fz);
    S.a = actors.add(S.i % 3 === 2 ? 'woman' : 'pilgrim', q[0], q[2], { yaw, fadeIn: true, ground: ctx.ground });
    const beast = ASK_BEAST[S.ask];
    if (beast && animals) { const o = pt(5.2, -3.2, 0); S.an = animals.add(beast, o[0], o[2], { ground: ctx.ground, calm: true }); S.an.follow = S.a; S.an.followDist = 1.8; }
  }

  function drawDay(B) {
    const k = B.kit; k.clear();
    const K = 1.35;   // (the pieces read at a phone's size under the follow camera)
    const box = (a, s, y, w, h, d, hex) => { const p = pt(a, s, y * K); k.put(p[0], p[1], p[2], d * K, h * K, w * K, Math.atan2(P.fx, P.fz) + Math.PI / 2, hex); };
    // Yochanan's table (left) with the four seals on it; Achiya's store (right): shelves with a jar of each
    box(2.0, -2.3, 0.72, 3.0, 0.12, 1.3, '#A88A5E');
    for (const s of [-3.5, -1.1]) for (const a of [1.5, 2.5]) box(a, s, 0.36, 0.14, 0.72, 0.14, '#6B4E31');
    Object.keys(SEALS).forEach((id, i) => { const hot = S.phase === 'ask' && S.ask === id && B.t % 1.2 < 0.6; box(2.0, -3.3 + i * 0.7, 0.84 + (S.hop > 0 && S.ask === id ? 0.5 * Math.sin(S.hop * Math.PI) : 0), 0.46, 0.1, 0.46, SEALS[id].col); if (hot) box(2.0, -3.3 + i * 0.7, 0.8, 0.6, 0.04, 0.6, '!#FFE9A8'); });
    box(2.0, 2.7, 0.5, 3.2, 1.0, 1.1, '#CBB894'); box(2.0, 2.7, 1.1, 3.4, 0.12, 1.3, '#8A6A45'); box(2.0, 2.7, 1.9, 3.2, 0.1, 0.1, '#6B4E31');
    const fill = S.jars / Math.max(1, B.M.n / 2);
    [['#8E5A8A', -0.9, 'wine'], ['#C9A83A', 0, 'oil'], ['#F0E6C8', 0.9, 'flour']].forEach(([c, s, key]) => { box(2.0, 2.7 + s, 1.35, 0.5, 0.5, 0.5, '#8A6A45'); box(2.0, 2.7 + s, 1.4 + 0.12 * Math.min(1, fill), 0.38, 0.3 + 0.2 * Math.min(1, fill), 0.38, c); });
    if (S.phase === 'redeem' && B.t % 1.0 < 0.5) box(2.0, 2.7, 0.22, 3.8, 0.05, 1.6, '!#FFE9A8');
    k.flush();
  }
  function drawEvening(B) {
    const k = B.kit; k.clear(); const K = 1.35;
    const box = (a, s, y, w, h, d, hex) => { const p = pt(a, s, y * K); k.put(p[0], p[1], p[2], d * K, h * K, w * K, Math.atan2(P.fx, P.fz) + Math.PI / 2, hex); };
    box(2.2, 0, 0.7, 5.4, 0.12, 1.6, '#A88A5E'); for (const s of [-2.5, 2.5]) for (const a of [1.7, 2.7]) box(a, s, 0.35, 0.14, 0.7, 0.14, '#6B4E31');
    for (let i = 0; i < 6; i++) { const on = i < S.counted; box(2.2, -2.2 + i * 0.88, 0.82 + (on ? 0.1 : 0), 0.5, 0.1, 0.5, on ? '#E9B949' : '#8F8F96'); if (on) box(2.2, -2.2 + i * 0.88, 0.8, 0.66, 0.04, 0.66, '!#FFE9A8'); }
    k.flush();
  }

  function pickSeal(B, id) {
    const M = B.M; if (!M || M.phase !== 'work' || S.mode !== 'day' || S.phase !== 'ask') return false;
    if (id !== S.ask) {
      S.wrong++; B.ui.shake(id); B.ui.say(WRONG[S.ask], { ms: 4200 }); return false;
    }
    const at = pt(2.0, -2.3, 2.2);
    M.hit(S.wrong ? 1 : 2, { x: 0.5, y: 0.4, say: S.wrong ? '' : 'החותם הנכון' }); drainActs(ctx, B.ui, M, at, 'חותם');
    S.hop = 1; S.sealed++; S.phase = 'redeem';
    B.ui.say('החותם בידו — לאחיה, להחליף בנסכים', { ms: 5000 });
    B.ui.chip('achiya', { at: () => pt(2.0, 2.7, 3.2), icon: '🏺', label: 'אחיה<br>נסכים', cls: 'sel', onTap: () => redeem(B) });
    B.ui.barCls('achiya', 'on', true); B.ui.barCls(id, 'on', false);
    return true;
  }
  function redeem(B) {
    const M = B.M; if (!M || M.phase !== 'work' || S.mode !== 'day' || S.phase !== 'redeem') return false;
    const u = SEALS[S.ask].units, at = pt(2.0, 2.7, 2.6);
    M.hit(1, { x: 0.5, y: 0.4, say: '' }); drainActs(ctx, B.ui, M, at, 'נסכים');
    if (ctx.stock) { try { for (const k of ['wine', 'oil', 'flour']) { ctx.stock.take(k, u); S.took[k] += u; } } catch (e) { /* */ } } else for (const k of ['wine', 'oil', 'flour']) S.took[k] += u;
    S.jars++; S.i++; B.ui.drop('achiya'); B.ui.barCls('achiya', 'on', false);
    if (ctx.emit) { try { ctx.emit('sealRedeemed', { seal: S.ask, units: u }); } catch (e) { /* */ } }
    if (M.phase === 'work') { S.ask = ASK[S.i % ASK.length]; S.phase = 'ask'; S.wrong = 0; setAsk(B); } else { clearPilgrim(); B.ui.drop('want'); }
    return true;
  }
  function setAsk(B) {
    newPilgrim(B);
    const a = ASK[S.i % ASK.length]; S.ask = a;
    B.ui.chip('want', { at: () => (S.a && S.a.alive ? [S.a.x, S.a.y + 3.5, S.a.z] : pt(3.8, -2.3, 3.5)), icon: ASK_ICON[a], label: a === 'chote' ? 'מצורע שנטהר' : 'מבקש חותם', cls: '', onTap: () => B.ui.say('איזה חותם לבהמה הזאת? הסמל מראה', { ms: 3000 }) });
    B.ui.say(`${ASK_ICON[a]} מבקש חותם — איזה מהארבעה?`, { ms: 5000 });
    B.ui.barCls('achiya', 'on', false);
  }
  function countSeal(B) {
    const M = B.M; if (!M || M.phase !== 'work' || S.mode !== 'evening') return false;
    S.counted++; const at = pt(2.2, -2.2 + (S.counted - 1) * 0.88, 2.0);
    M.hit(2, { x: 0.5, y: 0.4, say: S.counted === 6 ? 'יצא בשלום' : '' }); drainActs(ctx, B.ui, M, at, 'חשבון');
    B.ui.drop('c' + (S.counted - 1)); B.ui.count(`${S.counted}/6`, 'חותמות');
    return true;
  }

  const W = workBase(ctx, {
    id: 'seals', n: (L) => WORK_N[L], coach: 'הקישו על החותם שהסמל שלו כמו הבהמה — ואחר כך על אחיה', place: true, foot: [0.5, 4.6, -4.4, 4.6], kit: 96,
    build(B, o) {
      S.mode = o.mode === 'evening' ? 'evening' : 'day'; S.i = 0; S.phase = 'ask'; S.counted = 0; S.jars = 0; S.wrong = 0; S.sealed = 0; S.hop = 0; S.took = { wine: 0, oil: 0, flour: 0 };
      P = B.spot;
      if (S.mode === 'evening') {
        B.M.n = 6; B.M.autoFn = () => countSeal(B);
        for (let i = 0; i < 6; i++) B.ui.chip('c' + i, { at: () => pt(2.2, -2.2 + i * 0.88, 2.2), icon: '◍', label: `${i + 1}`, cls: '', onTap: () => { if (i === S.counted) countSeal(B); else B.ui.say('סופרים לפי הסדר — הקישו על הבא', { ms: 2500 }); } });
        B.ui.setBar([{ key: 'count', icon: '🔢', label: 'ספרו חותם', onTap: () => countSeal(B) }]);
        B.ui.say('בערב סופרים את החותמות מול הנסכים — שישה', { ms: 5000 }); B.ui.count('0/6', 'חותמות'); return;
      }
      B.M.n = Math.max(2, B.M.n - (B.M.n % 2));   // (two acts a request: the seal, and Achiya)
      B.M.autoFn = () => { if (S.phase === 'ask') pickSeal(B, S.ask); else redeem(B); };
      B.ui.setBar([...Object.keys(SEALS).map((id) => ({ key: id, icon: SEALS[id].icon, label: SEALS[id].he, onTap: () => pickSeal(B, id) })), { key: 'achiya', icon: '🏺', label: 'אחיה', onTap: () => redeem(B) }]);
      setAsk(B);
    },
    tick(dt, B) { if (S.hop > 0) S.hop = Math.max(0, S.hop - dt * 2.2); if (S.mode === 'evening') drawEvening(B); else drawDay(B); },
    end(B) { const m = SEALS_MENTOR[S.mode]; B.ui.say(m.text, { src: m.src, mentor: true }); if (S.mode === 'evening') B.ui.count('6/6', 'יצא בשלום'); clearPilgrim(); B.ui.drop('want'); B.ui.drop('achiya'); },
    teardown(B) { clearPilgrim(); if (B.kit) B.kit.hide(); },
    at: () => (P ? pt(2.0, 0, 1.6) : [0, 0, 0]),
  });
  W.state = S; W.pickSeal = (id) => pickSeal(W.B, id); W.redeem = () => redeem(W.B); W.countSeal = () => countSeal(W.B); W.asking = () => S.ask;
  return W;
}
// ── /worksb22 ──
