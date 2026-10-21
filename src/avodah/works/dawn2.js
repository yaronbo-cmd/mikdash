/* ── tamida23 ── dawn2.js — the Tamid's dawn as world crafts, part two (see dawn.js): פתיחת השערים (the blasts on the beat, the gate
 * swings), the lamps at the ההיכל's door (the אמרכל stays outside; the kohen inside tends the lamps on his taps), השחיטה as a screen +
 * the blood as the work (BLOODA25: blood.js's palette only — the vessel, the corners below the line, the yesod), the parts carried to the ramp (pale
 * abstract shapes, never anatomical). WORKSA22's kit. ── /tamida23 ── */
import { baseModel, clamp, ease } from './craft.js';
import { man, lamb, flame, ROBE, SKIN } from './figures.js';
import { evName, evFrame, EV_LINE, EV_REF } from './fix26.js';   // ── fix26 ── ── /fix26 ──
import { closeAt } from './closeup.js';   // ── figures24 ── (the close-up at the key act) ── /figures24 ──
import { mk, lerp, STONE, STONE2, SILVER, GOLD, LINEN, memune, cue, says, tickSay, payQ } from './dawn.js';
import { BLOOD, liquid, tagBlood, graveStart, graveStep, graveOn, TEACH } from './blood.js';   // ── blooda25 ──

/* ───────────────────────────── 6. פתיחת השערים (סוכה ה, ה; תמיד ג, ז–ח) ───────────────────────────── */
const GATE = { a: 4.6, s: 0.4, w: 1.55, h: 3.2 }, WICKET = { a: 4.28, s: 2.9 }, TRUMP = [{ a: 2.2, s: -2.6 }, { a: 2.5, s: -1.6 }];
const BLAST_HE = ['תקיעה', 'תרועה', 'תקיעה'];
export function shaarimModel(o = {}) {
  const M = baseModel('shaarim', o, {
    n: 6, coach: "הקישו על 'עבודה' — המפתח לפשפש; שלוש תקיעות על הקצב; ושני דלתות השער",
    ready: (m) => m.anim <= 0,
    tap(m) {
      const i = m.i;
      if (i === 0) { m.anim = 0.5; m.act = 'key'; }
      else if (i <= 3) { m.blast = i - 1; m.anim = 0.45; m.act = 'blast'; m.say = BLAST_HE[i - 1]; m.sayT = 0.9; m.pay([TRUMP[(i - 1) % 2].a, TRUMP[(i - 1) % 2].s, 2.3], BLAST_HE[i - 1]); m.fx.push({ sfx: 'chime', o: { combo: i } }); m.advance(); return; }
      else { m.anim = 0.9; m.act = 'door'; m.leaf = i - 4; }
      m.fx.push({ sfx: 'soft', haptic: 10 });
    },
    step(m, dt) {
      tickSay(m, dt);
      for (let j = 0; j < 2; j++) m.open[j] += ((m.openT[j]) - m.open[j]) * (1 - Math.exp(-dt * 4));
      if (m.anim <= 0) return; m.anim -= dt; if (m.anim > 0) return;
      if (m.act === 'key') { m.key = 1; m.pay([WICKET.a, WICKET.s, 1.2], 'הפשפש'); m.advance(); }
      else if (m.act === 'door') { m.openT[m.leaf] = 1; m.pay([GATE.a, GATE.s + (m.leaf ? 1 : -1) * GATE.w * 0.6, 2.0]); if (m.leaf === 1) { m.say = 'נשמע עד יריחו'; m.sayT = 9; } m.advance(); }
      m.act = '';
    },
  });
  Object.assign(M, { anim: 0, act: '', key: 0, blast: -1, leaf: 0, open: [0, 0], openT: [0, 0], sayT: 0 });
  return M;
}
function shaarimDraw(k, M, T) {
  if (!M) return;
  // the wall, the gate's two posts and lintel, the two leaves on their hinges (they swing inward, away from him); the wicket beside
  for (const sg of [-1, 1]) { k.b(GATE.a + 0.1, GATE.s + sg * (GATE.w + 2.6), GATE.h / 2 + 0.3, 3.6, 0.7, GATE.h + 0.6, STONE); k.b(GATE.a, GATE.s + sg * (GATE.w + 0.25), GATE.h / 2, 0.5, 0.8, GATE.h, STONE2); }
  k.b(GATE.a, GATE.s, GATE.h + 0.25, 2 * GATE.w + 1.0, 0.8, 0.5, STONE2);
  for (let j = 0; j < 2; j++) {
    const sg = j ? 1 : -1, hinge = { a: GATE.a, s: GATE.s + sg * GATE.w }, ang = M.open[j] * 1.35, ca = hinge.a + Math.sin(ang) * GATE.w / 2, cs = hinge.s - sg * Math.cos(ang) * GATE.w / 2;
    k.b(ca, cs, GATE.h / 2, GATE.w, 0.14, GATE.h - 0.1, '#9C7A45', { yaw: -sg * ang });
    k.b(ca, cs, GATE.h * 0.62, GATE.w * 0.92, 0.17, 0.08, '#C8A35A', { yaw: -sg * ang });
  }
  // the wicket and its key (gold when turned)
  k.b(WICKET.a, WICKET.s, 0.75, 0.75, 0.12, 1.5, M.key ? '#5A4A36' : '#8F7A55'); k.s(WICKET.a - 0.12, WICKET.s - 0.2, 0.85, 0.07, 0.07, 0.07, M.key || M.act === 'key' ? '!#FFD24A' : GOLD);
  // the kohanim with the silver trumpets: the one sounding raises his trumpet
  for (let j = 0; j < 2; j++) {
    const P = TRUMP[j], up = M.act === 'blast' && M.blast % 2 === j ? Math.sin(clamp(1 - M.anim / 0.45) * Math.PI) : 0;
    man(k, P.a, P.s, 0, { robe: ROBE.kohen, yaw: Math.atan2(GATE.s - P.s, GATE.a - P.a), arms: 0.55 + up * 0.35, skin: SKIN[j] });
    const ya = Math.atan2(GATE.s - P.s, GATE.a - P.a);
    k.c(P.a + Math.cos(ya) * 0.55, P.s + Math.sin(ya) * 0.55, 1.45 + up * 0.25, 0.04, 0.8, SILVER, { yaw: -ya, pitch: Math.PI / 2 - 0.3 - up * 0.3 });
    if (up > 0.3) for (let z = 0; z < 3; z++) k.ring(P.a + Math.cos(ya) * (1.0 + z * 0.4), P.s + Math.sin(ya) * (1.0 + z * 0.4), 1.6 + up * 0.2, 0.12 + z * 0.12, '!#FFF3C4', 8);
  }
  // בן גבר's men at the leaves (a Levite each), and the ממונה
  for (let j = 0; j < 2; j++) { const sg = j ? 1 : -1, pushing = M.act === 'door' && M.leaf === j; man(k, GATE.a - 0.7, GATE.s + sg * 0.8, 0, { robe: ROBE.levi, yaw: 0, arms: pushing ? 0.8 : 0.2, lean: pushing ? 0.6 : 0, skin: SKIN[j + 1] }); }
  memune(k, 1.6, 2.2, GATE.a, GATE.s, 0.3, T);
  // the blasts done: three gold dots over the trumpeters
  for (let j = 0; j < 3; j++) if (M.i > j + 1 || (M.i === j + 1 && M.blast >= j)) k.s(2.3 + j * 0.0, -3.1 + j * 0.5, 2.7, 0.09, 0.09, 0.09, '!#FFD24A');
  if (M.anim <= 0 && M.phase === 'work') { const t = shaarimTarget(M); cue(k, M, t[0], t[1], 0, 0.6, T); }
  if (M.phase !== 'work' || M.i >= 6) k.label('נשמע עד יריחו', GATE.a - 1.6, GATE.s, 2.9, 0.44, { bg: 'rgba(255,236,170,.95)' });
  else says(k, M);
}
const shaarimTarget = (M) => (M.i === 0 ? [WICKET.a - 0.4, WICKET.s, 1.2] : M.i <= 3 ? [TRUMP[(M.i - 1) % 2].a, TRUMP[(M.i - 1) % 2].s, 2.2] : [GATE.a - 0.3, GATE.s + (M.i === 4 ? -0.8 : 0.8), 2.0]);
export const shaarim = mk({
  id: 'shaarim', he: 'פתיחת השערים', place: 'gate',
  fact: { he: 'בכל יום שלש תקיעות לפתיחת שערים; ושער הגדול — מיריחו היו שומעין את קולו כשנפתח, ולא היה השוחט שוחט עד ששמע את קולו', ref: 'סוכה ה, ה; תמיד ג, ז–ח' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [1.0, 5.4, -3.6, 3.6, 3.8],
  model: shaarimModel, draw: shaarimDraw, target: shaarimTarget,
});

/* ───────────────────────────── 7. הטבת הנרות — at the ההיכל's door (תמיד ג, ט; ו, א) ───────────────────────────── */
// The player (the אמרכל) stays outside, at the door: the stage shows the doorway and, inside, the golden altar and the menorah; the kohen
// inside acts on his taps. ⚑ the menorah stands across the line here (seen whole through the door) — המחשה.
const DOORW = { a: 2.4, w: 1.5, h: 2.4 }, GALT = { a: 3.4, s: -0.5 }, MEN = { a: 4.3, s: 0.8 }, STONE3 = { a: 3.85, s: 0.8 };
export const LAMP = (j) => ({ a: MEN.a, s: MEN.s + (j - 3) * 0.36, y: 2.25 });
export const BURNING = [5, 6];                      // the two "eastern" lamps found alight (left alight now; tended later — הטבת שתי נרות)
export const TEND = [0, 1, 2, 3, 4];
export function heichalModel(o = {}) {
  const M = baseModel('heichal', o, {
    n: 2 + TEND.length, coach: "הקישו על 'עבודה' — הכהן שבפנים: דישון מזבח הזהב, ואז חמש הנרות, נר אחר נר",
    ready: (m) => m.anim <= 0,
    tap(m) { m.anim = m.i === 2 ? 0.8 : 0.42; m.fx.push({ sfx: 'soft', haptic: 8 }); },
    step(m, dt) {
      tickSay(m, dt);
      if (m.anim <= 0) return; m.anim -= dt; if (m.anim > 0) return;
      const i = m.i;
      if (i < 2) { m.tani = i + 1; m.pay([GALT.a, GALT.s, 1.6], i === 0 ? 'חופן לתוך הטני' : 'כבד את השאר'); }
      else { const j = TEND[i - 2]; m.tended[j] = true; const L = LAMP(j); m.pay([L.a, L.s, L.y + 0.4], i === 6 ? 'חמש נרות' : ''); }
      m.advance();
      if (m.phase !== 'work') { m.say = 'שני הנרות — אחרי הדם, לפני הקטורת'; m.sayT = 8; }
    },
  });
  Object.assign(M, { anim: 0, tani: 0, tended: [false, false, false, false, false, false, false], sayT: 0 });
  return M;
}
const priestAt = (M) => {
  if (M.i < 2 || (M.i === 2 && M.anim > 0.4)) return { a: GALT.a - 0.6, s: GALT.s, y: 0, yaw: 0, on: false };
  const j = TEND[Math.min(TEND.length - 1, M.i - 2)], L = LAMP(j);
  return { a: STONE3.a - 0.1, s: L.s, y: 0.36, yaw: 0, on: true };
};
function heichalDraw(k, M, T) {
  if (!M) return;
  // the doorway: two great posts, the lintel; the wall either side; the two leaves folded back inside; the floor within, lit by the menorah
  // (a cutaway: the posts stand full height, the wall either side is cut low so the inside reads from the follow camera above)
  for (const sg of [-1, 1]) { k.b(DOORW.a, sg * (DOORW.w + 0.3), DOORW.h / 2, 0.6, 0.6, DOORW.h, STONE); k.b(DOORW.a + 0.1, sg * (DOORW.w + 2.4), 0.5, 3.6, 0.6, 1.0, STONE2); k.b(DOORW.a + 0.65, sg * (DOORW.w - 0.05), 0.7, 0.08, 1.0, 1.4, '#B38E4A', { yaw: sg * 0.15 }); for (let x = 0; x < 3; x++) k.b(DOORW.a + 1.0 + x * 1.6, sg * (DOORW.w + 1.3), 0.35, 0.3, 1.5, 0.7, STONE2); }
  k.b(DOORW.a, 0, DOORW.h + 0.08, 2 * DOORW.w + 1.2, 0.12, 0.16, STONE2);   // (the lintel: a thin beam, so the inside reads)
  k.b(3.9, 0, 0.02, 2 * DOORW.w + 0.8, 2.8, 0.04, '#B9A47E');
  k.label('פתח ההיכל — האמרכל עומד בחוץ', DOORW.a - 0.6, 0, DOORW.h + 1.05, 0.24);
  // the golden altar and the טני (the ash in it rises with each scoop)
  k.b(GALT.a, GALT.s, 0.6, 0.7, 0.7, 1.2, GOLD); for (const [da, ds] of [[-0.3, -0.3], [-0.3, 0.3], [0.3, -0.3], [0.3, 0.3]]) k.b(GALT.a + da, GALT.s + ds, 1.27, 0.12, 0.12, 0.14, GOLD);
  k.s(GALT.a, GALT.s, 1.22, 0.24, 0.04, 0.24, M.tani >= 2 ? '#D9C79A' : '#8E8A82');
  k.c(GALT.a - 0.5, GALT.s + 0.5, 0.12, 0.2, 0.18, GOLD); if (M.tani) k.s(GALT.a - 0.5, GALT.s + 0.5, 0.22, 0.17, 0.05 * M.tani, 0.17, '#8E8A82');
  // the menorah (gold): stem, arms as a bar, seven cups; the stone of three steps before it
  k.c(MEN.a, MEN.s, 1.1, 0.07, 2.2, GOLD); k.c(MEN.a, MEN.s, 0.08, 0.35, 0.16, GOLD);
  k.b(MEN.a, MEN.s, 1.95, 0.08, 2.25, 0.08, GOLD);
  for (let j = 0; j < 7; j++) {
    const L = LAMP(j), lit = BURNING.includes(j), done = M.tended[j];
    k.c(L.a, L.s, 2.07, 0.035, 0.18, GOLD); k.c(L.a, L.s, L.y - 0.07, 0.09, 0.08, GOLD);
    if (lit) flame(k, L.a, L.s, L.y - 0.04, 0.42 + 0.03 * Math.sin(T * 9 + j), T + j);
    else if (done) { k.s(L.a, L.s, L.y + 0.05, 0.05, 0.1, 0.05, '!#FFE7A0'); k.s(L.a, L.s, L.y - 0.01, 0.07, 0.03, 0.07, '!#FFD24A'); }   // (tended: a fresh wick and oil, a small steady light)
    else k.s(L.a, L.s, L.y - 0.02, 0.05, 0.03, 0.05, '#5C5242');
  }
  for (let st = 0; st < 3; st++) k.b(STONE3.a - st * 0.18, MEN.s, 0.06 + st * 0.12, 1.4 - st * 0.0, 0.5 - st * 0.12, 0.12 + st * 0.24, STONE);
  k.torch(MEN.a - 0.4, MEN.s, 2.6, 0.45);
  // the kohen inside (he alone); his arm reaches as the tap lands
  const P = priestAt(M), reach = M.anim > 0 ? Math.sin(clamp(1 - M.anim / 0.42) * Math.PI) : 0;
  man(k, P.a, P.s, P.y, { robe: ROBE.kohen, yaw: P.yaw, arms: 0.3 + reach * 0.55, skin: SKIN[1] });
  if (M.i >= 2) closeAt(k, MEN.a - 0.2, MEN.s, 1.8, { dist: 5, el: 0.36, from: Math.PI, hold: 0.6, key: 'heichal' });   // ── figures24 ── the menorah as the lamps are tended ── /figures24 ──
  // the next lamp / the altar
  if (M.anim <= 0 && M.phase === 'work') { if (M.i < 2) cue(k, M, GALT.a, GALT.s, 1.25, 0.5, T); else { const L = LAMP(TEND[M.i - 2]); k.s(L.a, L.s, L.y + 0.22, 0.09 + 0.02 * Math.sin(T * 6), 0.09, 0.09, '!#FFF3C4'); k.ring(L.a, L.s, L.y - 0.05, 0.22 * (M.pressed ? 1.3 : 1), '!#FFD24A', 12); } }
  if (M.say) k.label(M.say, 4.6, 0, 3.4, 0.3); if (M.warn) k.label(M.warn, 3.6, 0, 3.0, 0.28);
}
export const heichal = mk({
  id: 'heichal', he: 'בהיכל — הדישון והטבת הנרות', place: 'heichal',
  fact: { he: 'מי שזכה בדישון מזבח הפנימי נכנס, חופן לתוך הטני וכבד את השאר; מי שזכה בדישון המנורה מצא שני נרות מזרחיים דולקים — מדשן את השאר ומניח אותם דולקים. הטבת חמש נרות קודמת לדם התמיד, והטבת שתי נרות — אחר הדם ולפני הקטורת. האמרכל בפתח, והכהן לבדו בפנים — המחשה', ref: 'תמיד ג, ט; ו, א; יומא לג, א', illus: true },
  stage: { ahead: -0.3, lat: 1.2, K: 1.45 }, bounds: [1.8, 5.0, -2.8, 2.8, 2.8],
  model: heichalModel, draw: heichalDraw,
  target: (M) => { if (M.i < 2) return [GALT.a, GALT.s, 1.6]; const L = LAMP(TEND[Math.min(TEND.length - 1, M.i - 2)]); return [L.a, L.s, L.y + 0.4]; },
});

/* ───────────────────────────── 8. השחיטה — the screen; the blood as the work (תמיד ד, א; זבחים ה, ד; מידות ג, א–ב) ───────────────────────────── */
// ── blooda25 ── (DAM25, the owner: "דם כן, פגר לא") seven acts: the lamb to the ring · bound · the screen — the slaughter behind it is the
// moment of gravity (blood.js: no points, one soft deep tone, 1.2 s of stillness, the mentor's line) · the RECEIVING: the vessel comes from
// behind the screen with the dark liquid in it (the first "+N") · to the north-east corner and the gift there (the Γ blooms on the stone
// below the line, 0.35 s) · round to the south-west and the gift (the four faces glow: "שתיים שהן ארבע") · the rest poured on the
// southern yesod (a hold pours; a tap does too) — the thread into the two holes. No liquid in the air; nothing red on a kohen or the lamb.
const RINGP = { a: 2.6, s: -2.0 }, ALT = { a0: 3.6, a1: 6.2, s0: 0.2, s1: 3.6, h: 1.5, line: 0.8 }, NE = { a: 3.55, s: 0.15 }, SW = { a: 6.25, s: 3.65 };
export const ZDUR = [1.1, 0.5, 0.6, 0.7, 1.0, 1.0, 1.4];
const ZSTAND = { recv: { a: 2.6, s: 0.3 }, ne: { a: NE.a - 1.05, s: NE.s - 0.55 }, sw: { a: SW.a + 1.0, s: SW.s + 0.75 }, yesod: { a: SW.a - 0.9, s: SW.s + 1.15 } };
export function zerikaModel(o = {}) {
  const M = baseModel('zerika', o, {
    n: 7, coach: "הקישו על 'עבודה' — הטלה אל הטבעת; המסך; הקבלה בכלי; שתי מתנות שהן ארבע; והשיריים ליסוד",
    ready: (m) => m.anim <= 0 && !graveOn(m),
    tap(m) { if (graveOn(m)) return; m.anim = ZDUR[m.i] || 0.5; m.fx.push({ sfx: 'soft', haptic: m.i === 2 ? 0 : 8 }); },
    press(m, down) { m.hold = !!down; },
    step(m, dt) {
      tickSay(m, dt);
      if (m.glowT > 0) m.glowT -= dt;
      for (let j = 0; j < 2; j++) if (m.given[j]) m.bloom[j] = Math.min(1, m.bloom[j] + dt / 0.35);
      if (graveStep(m, dt)) return;   // (the stillness: the taps are swallowed, nothing moves on)
      if (m.anim <= 0) return;
      const i = m.i, d = ZDUR[i] || 0.5; m.u = clamp(1 - m.anim / d);
      if (i === 0) m.lambAt = m.u;
      if (i === 2) m.screen = m.u;
      if (i >= 3) {
        const P = [{ a: RINGP.a + 0.4, s: RINGP.s + 1.0 }, ZSTAND.recv, ZSTAND.ne, ZSTAND.sw, ZSTAND.yesod], from = P[i - 3], to = P[i - 2];
        const w = ease(i >= 4 ? clamp(m.u / 0.65) : m.u); m.zk.a = lerp(from.a, to.a, w); m.zk.s = lerp(from.s, to.s, w);
        m.tilt = i >= 4 ? clamp((m.u - 0.65) / 0.35) : 0;
        if (i === 6 && m.u > 0.6) m.pour = clamp((m.u - 0.6) / 0.4);
      }
      m.anim -= dt * (m.i === 6 && m.hold ? 1.6 : 1); if (m.anim > 0) return;   // (the rest: a hold pours it faster; a tap alone pours it all)
      m.u = 0; m.tilt = 0;
      if (i === 0) m.pay([RINGP.a, RINGP.s, 1.3], 'הטבעת השנייה');
      else if (i === 1) { m.bound = 1; m.pay([RINGP.a, RINGP.s, 1.2], 'ראשו לדרום ופניו למערב'); }
      else if (i === 2) { m.screen = 1; graveStart(m); }   // (NO pay: the points are for the work, not the killing — DAM25 §2.4)
      else if (i === 3) { m.vessel = 1; m.fill = 0.7; m.pay([ZSTAND.recv.a, ZSTAND.recv.s, 1.5], 'וקבל המקבל'); m.say = TEACH.receive; m.sayT = 3.2; }
      else if (i === 4) { m.given[0] = true; m.fill = 0.5; m.pay([NE.a, NE.s, ALT.line], 'קרן מזרחית צפונית'); }
      else if (i === 5) { m.given[1] = true; m.fill = 0.32; m.glowT = 1.6; m.pay([SW.a, SW.s, ALT.line], 'מערבית דרומית'); m.say = 'שתי מתנות שהן ארבע — למטה מחוט הסיקרא'; m.sayT = 3.4; }
      else { m.poured = 1; m.pour = 1; m.fill = 0; m.pay([SW.a - 0.4, SW.s + 0.3, 0.35], 'יסוד דרומי'); m.say = TEACH.shirayim; m.sayT = 8; }
      m.advance();
    },
  });
  Object.assign(M, { anim: 0, u: 0, lambAt: 0, bound: 0, screen: 0, vessel: 0, fill: 0, given: [false, false], bloom: [0, 0], glowT: 0, pour: 0, poured: 0, hold: false, tilt: 0, zk: { a: RINGP.a + 0.4, s: RINGP.s + 1.0 }, sayT: 0, grave: 0 });
  return M;
}
/** the Γ on a corner of the model altar (two faces, below the line), blooming over 0.35 s; the red line round the body */
function altarBlood(k, M) {
  for (const [a0, s0, a1, s1] of [[ALT.a0, ALT.s0 - 0.01, ALT.a1, ALT.s0 - 0.01], [ALT.a0, ALT.s1 + 0.01, ALT.a1, ALT.s1 + 0.01]]) { k.b((a0 + a1) / 2, s0, ALT.line, 0.03, a1 - a0, 0.06, BLOOD.line); tagBlood(k, 'line'); }
  for (const [a0, s0, a1, s1] of [[ALT.a0 - 0.01, ALT.s0, ALT.a0 - 0.01, ALT.s1], [ALT.a1 + 0.01, ALT.s0, ALT.a1 + 0.01, ALT.s1]]) { k.b(a0, (s0 + s1) / 2, ALT.line, s1 - s0, 0.03, 0.06, BLOOD.line); tagBlood(k, 'line'); }
  const h = 0.5, y = ALT.line - 0.06 - h / 2;   // (under the line)
  for (const [j, C, sa, ss] of [[0, NE, -1, -1], [1, SW, 1, 1]]) {
    if (!M.given[j]) continue; const b = ease(M.bloom[j]), ca = j ? ALT.a1 : ALT.a0, cs = j ? ALT.s1 : ALT.s0;
    k.b(ca + sa * 0.012, cs - ss * 0.22, y, 0.36 * b, 0.02, h * b, BLOOD.mark); tagBlood(k, 'horn');
    k.b(ca - sa * 0.22, cs + ss * 0.012, y, 0.02, 0.36 * b, h * b, BLOOD.mark); tagBlood(k, 'horn');
    if (M.glowT > 0 && M.given[1]) for (const [da, ds] of [[sa * 0.03, -ss * 0.22], [-sa * 0.22, ss * 0.03]]) k.b(ca + da, cs + ds, y + h / 2 + 0.03, Math.abs(ds) > 0.1 ? 0.44 : 0.03, Math.abs(da) > 0.1 ? 0.44 : 0.03, 0.03, '!#FFE6A0');
    void C;
  }
}
function zerikaDraw(k, M, T) {
  if (!M) return;
  // the place of the rings north of the altar: a low slab with its ring; the altar's near corner block on the right with its two marked corners
  k.b(RINGP.a, RINGP.s, 0.03, 2.4, 2.4, 0.06, '#D4CBB5'); k.ring(RINGP.a, RINGP.s, 0.06, 0.35, '#6E6A62', 12);
  k.b((ALT.a0 + ALT.a1) / 2, (ALT.s0 + ALT.s1) / 2, ALT.h / 2, ALT.s1 - ALT.s0, ALT.a1 - ALT.a0, ALT.h, STONE);
  k.b((ALT.a0 + ALT.a1) / 2 + 0.6, ALT.s1 + 0.22, 0.12, 0.44, ALT.a1 - ALT.a0 - 1.2, 0.24, STONE2);   // (the yesod's one amah on the south)
  for (const C of [NE, SW]) k.b(C.a, C.s, ALT.h + 0.15, 0.32, 0.32, 0.3, STONE2);
  for (const [C, he] of [[NE, 'צפונית־מזרחית'], [SW, 'דרומית־מערבית']]) k.label(he, C.a, C.s, ALT.h + 0.95, 0.22);
  altarBlood(k, M);
  // the rest on the yesod: a thin dark thread along it to the two holes at the corner, shortening from its far end as it is swallowed
  if (M.pour > 0 && M.poured < 2) { const L = 1.2 * Math.min(1, M.pour); k.b(ALT.a1 - 0.2 - L / 2, ALT.s1 + 0.2, 0.245, 0.04, L, 0.01, BLOOD.wet); tagBlood(k, 'yesod'); }
  for (const da of [-0.12, 0.12]) k.c(ALT.a1 - 0.15 + da * 0.3, ALT.s1 + 0.2 + da, 0.245, 0.04, 0.012, '#2A2622');   // (the two holes)
  // the lamb: led to the ring; bound ("עוקדין", held by the winners of the parts); hidden behind the screen from the moment of the act — never shown after it
  if (M.screen < 0.98) {
    const la = lerp(0.9, RINGP.a, ease(M.lambAt)), ls = lerp(-3.4, RINGP.s, ease(M.lambAt));
    lamb(k, la, ls, 0, { yaw: M.bound ? -Math.PI / 2 : Math.atan2(RINGP.s + 3.4, RINGP.a - 0.9), scale: 1.25, step: M.i === 0 && M.anim > 0 ? T * 8 : 0, t: T, head: 0.3 });
  }
  const bow = graveOn(M) ? 0.55 : 0;   // (the moment of gravity: the kohanim bow their heads)
  if (M.bound || M.i >= 1) for (let j = 0; j < 2; j++) man(k, RINGP.a + (j ? 0.9 : -0.9), RINGP.s - 0.6, 0, { robe: ROBE.kohen, yaw: j ? Math.PI * 0.8 : Math.PI * 0.2, arms: 0.5, lean: bow, skin: SKIN[j] });
  // the screen: a linen cloth held up by two kohanim, drawn across before the lamb (2.4 high: the lamb ×1.25 never shows over it — DAM25 §4.5)
  if (M.screen > 0) {
    const sw = 2.6 * M.screen, cs = RINGP.s - 1.3 + sw / 2;
    k.b(RINGP.a - 0.9, cs, 1.2, sw, 0.06, 2.4, LINEN); k.b(RINGP.a - 0.9, cs, 2.44, sw + 0.1, 0.1, 0.08, '#C9B58A');
    for (const sg of [-1, 1]) man(k, RINGP.a - 1.25, cs + sg * (sw / 2), 0, { robe: ROBE.kohen, yaw: Math.PI, arms: bow ? 0.5 : 0.95, lean: bow, skin: SKIN[2] });
  }
  // the receiver with the vessel (a gold מזרק with the dark liquid in it from the receiving to the end): from behind the screen to the corners
  if (!graveOn(M) && (M.vessel || M.i === 3)) {
    const Z = M.zk, tgt = M.i === 4 ? NE : M.i === 5 ? SW : M.i === 6 ? { a: ALT.a1 - 0.6, s: ALT.s1 + 0.25 } : null;
    const ya = tgt && M.anim > 0 ? Math.atan2(tgt.s - Z.s, tgt.a - Z.a) : Math.PI * 0.25;
    man(k, Z.a, Z.s, 0, { robe: ROBE.kohen, yaw: ya, arms: 0.7, skin: SKIN[1] });
    const va = Z.a + Math.cos(ya) * 0.6, vs = Z.s + Math.sin(ya) * 0.6;
    k.c(va, vs, 1.25, 0.14, 0.3, GOLD, { yaw: -ya, pitch: -M.tilt * 0.9 }); k.c(va, vs, 1.08, 0.05, 0.14, GOLD);
    if (M.fill > 0 || M.i === 3) liquid(k, va, vs, 1.12 + 0.3 * (M.i === 3 ? 0.7 * ease(M.u) : M.fill), 0.14, M.tilt);
  }
  memune(k, 1.0, 1.8, RINGP.a, RINGP.s, 0.3, T);
  if (M.anim <= 0 && M.phase === 'work' && !graveOn(M)) { const t = zerikaTarget(M); cue(k, M, t[0], t[1], M.i >= 4 && M.i <= 5 ? ALT.h : 0, 0.55, T); }
  says(k, M);
}
const zerikaTarget = (M) => (M.i <= 2 ? [RINGP.a, RINGP.s, 1.5] : M.i === 3 ? [2.6, 0.3, 1.5] : M.i === 4 ? [NE.a, NE.s, ALT.h + 0.8] : M.i === 5 ? [SW.a, SW.s, ALT.h + 0.8] : [ALT.a1 - 0.6, ALT.s1 + 0.3, 0.6]);
export const zerika = mk({
  id: 'zerika', he: 'השחיטה והזריקה', place: 'rings',
  fact: { he: 'של שחר נשחט על טבעת שנייה; שחט השוחט וקבל המקבל בכלי שרת, ונותן בקרן מזרחית צפונית ובמערבית דרומית — שתי מתנות שהן ארבע, למטה מחוט הסיקרא; ושירים היה שופך על יסוד דרומית, ויורדין בשני נקבים לאמה ולנחל קדרון. השחיטה — מאחורי המסך', ref: 'תמיד ד, א; זבחים ה, ד; מידות ג, א–ב' },
  stage: { ahead: -0.4, lat: 0, K: 1.45 }, bounds: [0.8, 6.4, -3.6, 3.8, 2.6],
  model: zerikaModel, draw: zerikaDraw, target: zerikaTarget,
});
// ── /blooda25 ──

/* ───────────────────────────── 9. האברים לכבש (תמיד ד, ב–ג) ───────────────────────────── */
export const CARRY = ['ראש ורגל', 'שתי הידיים', 'עוקץ ורגל', 'חזה וגרה', 'שתי הדפנות', 'קרביים', 'סולת', 'חביתין', 'יין'];
const ROW = (j) => ({ a: 1.5 + (j % 5) * 0.0, s: -3.3 + j * 0.62 }), KEV = { a0: 2.4, a1: 6.4, s: 2.7, h: 1.6 };
const SPOT = (j) => ({ a: KEV.a0 + 0.5 + (j % 5) * 0.32, s: KEV.s - 0.45 + (j / 5 | 0) * 0.45 });   // the lower half of the ramp, its west side
const kevY = (a) => clamp((a - KEV.a0) / (KEV.a1 - KEV.a0)) * KEV.h;
function part(k, j, a, s, y) {   // a pale abstract shape per portion (never anatomical); the flour a bowl, the chavitin flat cakes, the wine a jug
  if (j <= 5) { k.s(a, s, y, 0.2, 0.13, 0.15, j % 2 ? '#E9DFCB' : '#DCCDB2'); if (j % 3 === 0) k.s(a + 0.12, s + 0.1, y + 0.02, 0.1, 0.08, 0.1, '#E2D5BC'); }
  else if (j === 6) { k.c(a, s, y, 0.18, 0.1, SILVER); k.c(a, s, y + 0.05, 0.15, 0.02, '#F6F2E6'); }
  else if (j === 7) { for (let x = 0; x < 3; x++) k.c(a, s, y - 0.02 + x * 0.04, 0.14, 0.03, '#D9B77A'); }
  else { k.c(a, s, y, 0.09, 0.26, '#A89A7E'); k.c(a, s, y + 0.16, 0.05, 0.08, '#A89A7E'); }
}
export function evarimModel(o = {}) {
  const M = baseModel('evarim', o, {
    n: CARRY.length + 1, coach: "הקישו על 'עבודה' — כל הקשה: הכהן הבא בשורה מוליך את חלקו אל הכבש; ובסוף — המלח",
    ready: (m) => m.anim <= 0,
    tap(m) { m.anim = m.i < CARRY.length ? 0.85 : 0.6; m.fx.push({ sfx: 'soft', haptic: 8 }); if (m.i < CARRY.length) { m.say = CARRY[m.i]; m.sayT = 1.2; } },
    step(m, dt) {
      tickSay(m, dt); if (m.wrongT > 0) m.wrongT -= dt;   // ── slice27 ── ── /slice27 ──
      if (m.anim <= 0) return; m.anim -= dt; if (m.anim > 0) return;
      if (m.i < CARRY.length) { const p = SPOT(m.i); m.set[m.i] = true; if (m.gold27) { m.gold27 = false; payQ(m, [p.a, p.s, kevY(p.a) + 0.8], 2, m.i === CARRY.length - 1 ? 'כולם בשורה' : 'הבא בתור!'); } else m.pay([p.a, p.s, kevY(p.a) + 0.8], m.i === CARRY.length - 1 ? 'כולם בשורה' : ''); }   // ── slice27 ── (the right kohen picked: gold) ── /slice27 ──
      else { m.salt = 1; m.pay([KEV.a0 + 1.1, KEV.s, kevY(KEV.a0 + 1.1) + 0.9], 'ומלחום'); m.say = 'מחצי הכבש ולמטה, במערבו — ומלחום'; m.sayT = 8; }
      m.advance();
    },
  });
  Object.assign(M, { anim: 0, set: [], salt: 0, sayT: 0 });
  // ── slice27 ── האברים is the TARGET work (PLAY27 §א 5): tap the RIGHT kohen in the Mishnah's order (he is the first — the head and the leg);
  // the right one = gold, he walks his portion to the ramp; another one → "לא — הראש קודם" (the one whose turn it is), no penalty. The
  // button's tap sends the next in turn (good). L2: the row stands shuffled — the names still on, the order is the player's to know.
  M.l2 = !!o.l2; M.perm = M.l2 ? EV27_SHUF.slice() : [0, 1, 2, 3, 4, 5, 6, 7, 8]; M.gold27 = false;
  M.pickJ = (j) => {
    if (M.phase !== 'work' || M.anim > 0 || M.i >= CARRY.length || M.set[j]) return false;
    if (j !== M.i) { M.slip(`לא — ${EV27_SHORT[M.i]} קודם`); M.wrongJ = j; M.wrongT = 1.4; M.fx.push({ sfx: 'soft', haptic: 6 }); return true; }
    M.gold27 = true; M.twinTap(); return true;
  };
  // ── /slice27 ──
  return M;
}
export const EV27_SHORT = ['הראש', 'הידיים', 'העוקץ', 'החזה', 'הדפנות', 'הקרביים', 'הסולת', 'החביתין', 'היין'];   // ── slice27 ── ── /slice27 ──
export const EV27_SHUF = [4, 1, 7, 0, 5, 8, 2, 6, 3];   // ── slice27 ── (L2: the row's order — portion j stands at row place EV27_SHUF[j]) ── /slice27 ──
function evarimDraw(k, M, T) {
  if (!M) return;
  evFrame(M); const labK = (t, a, s, y, sz, o) => k.label(t, a, s, y, sz, o);   // ── fix26 ── ── /fix26 ──
  // the ramp (its lower half here), sloping away along the line on the right; the row of marble tables on the left
  const L = Math.hypot(KEV.a1 - KEV.a0, KEV.h), ang = Math.atan2(KEV.h, KEV.a1 - KEV.a0);
  k.b((KEV.a0 + KEV.a1) / 2, KEV.s, KEV.h / 2, 1.9, L, 0.16, STONE2, { pitch: -ang });
  for (let j = 0; j < 4; j++) { const a = KEV.a0 + (j + 0.5) * (KEV.a1 - KEV.a0) / 4, h = kevY(a) - 0.1; if (h > 0.05) k.b(a, KEV.s, h / 2, 1.7, (KEV.a1 - KEV.a0) / 4, h, STONE); }
  k.label('הכבש', KEV.a1 - 0.6, KEV.s, KEV.h + 1.0, 0.26);
  k.b(1.0, -1.0, 0.45, 5.6, 0.7, 0.06, '#E6E1D6'); for (let j = 0; j < 4; j++) k.b(1.0, -3.4 + j * 1.6, 0.22, 0.12, 0.12, 0.44, STONE2);
  // the nine in a row, each with his portion; the one walking carries it up to his spot on the ramp
  for (let j = 0; j < CARRY.length; j++) {
    const R = ROW(j), S = SPOT(j), walking = j === M.i && M.anim > 0 && M.i < CARRY.length;
    let a = R.a, s = R.s, y = 0, yaw = 0;
    if (M.set[j]) { a = S.a - 0.4; s = S.s - 0.75; y = kevY(a); yaw = Math.PI / 2; }
    else if (walking) { const u = ease(clamp(1 - M.anim / 0.85)); a = lerp(R.a, S.a - 0.4, u); s = lerp(R.s, S.s - 0.75, u); y = kevY(a); yaw = Math.atan2(S.s - R.s, S.a - R.a); }
    man(k, a, s, y, { robe: ROBE.kohen, yaw, arms: M.set[j] ? 0.1 : 0.55, skin: SKIN[j % 3], scale: 0.92 });
    if (M.set[j]) part(k, j, S.a, S.s, kevY(S.a) + 0.12);
    else part(k, j, a + Math.cos(yaw) * 0.42, s + Math.sin(yaw) * 0.42, y + 0.95);
    if (M.set[j]) evName(labK, j, S.a, S.s, kevY(S.a) + 0.55, 0.13, 'ramp'); else evName(labK, j, a + Math.cos(yaw) * 0.42, s + Math.sin(yaw) * 0.42, y + 1.45, 0.15, 'row');   // ── fix26 ── ── /fix26 ──
  }
  if (M.salt || (M.i === CARRY.length && M.anim > 0)) for (let z = 0; z < 10; z++) { const p = SPOT(z % CARRY.length); k.s(p.a + Math.sin(z * 3.1) * 0.12, p.s + Math.cos(z * 2.3) * 0.12, kevY(p.a) + 0.26, 0.03, 0.03, 0.03, '!#FFFFFF'); }
  memune(k, 0.3, 1.4, KEV.a0, KEV.s, 0.35, T);
  if (M.anim <= 0 && M.phase === 'work') { if (M.i < CARRY.length) { const R = ROW(M.i); cue(k, M, R.a, R.s, 0, 0.42, T); } else cue(k, M, KEV.a0 + 1.1, KEV.s, kevY(KEV.a0 + 1.1), 0.7, T); }
  says(k, M);
}
export const evarim = mk({
  id: 'evarim', he: 'האברים אל הכבש', place: 'limbs',
  fact: { he: 'נמצאו כולן עומדין בשורה והאברים בידם — ראש ורגל, שתי הידים, העוקץ והרגל, החזה והגרה, שתי הדפנות, הקרביים, הסולת, החביתין והיין; הלכו ונתנום מחצי הכבש ולמטה במערבו, ומלחום. ' + EV_LINE + '. הצורות במשחק — המחשה', ref: 'תמיד ד, ב–ג; ' + EV_REF, illus: true },   /* ── fix26 ── (the last three explained) ── /fix26 ── */
  stage: { ahead: -0.3, lat: 0, K: 1.45 }, bounds: [0.2, 6.4, -3.6, 3.6, 2.4],
  model: evarimModel, draw: evarimDraw,
  target: (M) => { if (M.i >= CARRY.length) return [KEV.a0 + 1.1, KEV.s, 1.4]; const p = SPOT(M.i); return [p.a, p.s, kevY(p.a) + 0.8]; },
});
