/* ─────────────────────────────────────────────────────────────────────────────
 * games/torches.js — (GAMES13, wave 13) "שמונה אבוקות": a juggling game of rhythm. "רבן שמעון בן גמליאל, כשהיה שמח שמחת בית
 * השואבה, היה נוטל שמונה אבוקות של אור, וזורק אחת ונוטל אחת ואין נוגעות זו בזו" (בבלי סוכה נג, א — Sefaria, checked 30.9).
 * At night in the courts, in the light of the great golden lamps (משנה סוכה ה, ב–ג). Torches fly between two hands; tap the
 * hand a torch is landing in (the right or the left side) on its beat: it is caught and thrown up again. Every 6 + n catches a
 * Levite hands in one more torch — from 3 up to 8. An odd count crosses (a cascade), an even one rises and falls in each hand
 * (a fountain): the torches never touch. A torch not caught falls and goes out; the Levite lights it and hands it back on its
 * beat (the rhythm never breaks). Three fallen torches end the evening. A tap that catches nothing shakes that hand a moment
 * (mashing is not juggling). Solo, or a duel on one phone: two jugglers, one in each half (the top one turned to the player across).
 *   run(S, { duel, sfx, reduced }) → { winner, best:[a, b], catches:[a, b], drops:[a, b], eight, quit }
 * Pure (node): makeJuggler(o) → J { step(dt) → events, tap(hand) → 'catch'|'perfect'|'fumble'|null, due(hand), view() }.
 * Test hook: each half's `.g10-to` carries __g10 = { state() } (page CSS px).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, sleep, injectCSS, fitCanvas, PLAYERS, layer } from './shell.js';

export const START = 3, MAX = 8, LIVES = 3, FINALE = 16;   // the last level: sixteen catches with eight torches
export const beatOf = (n) => Math.max(0.48, 0.64 - 0.025 * (n - START));   // s between two landings (the hands alternate)
export const winOf = (n) => Math.max(0.15, 0.21 - 0.012 * (n - START));    // ± s around a landing that catches it
export const PERFECT = 0.06, SHAKE = 0.3, SLIP = 0.6;
export const needOf = (n) => (n >= MAX ? FINALE : 6 + n);                 // catches with n torches before the next is handed in

/** one juggler: slot k lands at t = t0 + k·beat in hand k % 2; a catch at slot k throws to slot k + n (the other hand when n is odd) */
export function makeJuggler(o = {}) {
  const J = {
    n: o.n || START, t: 0, beat: beatOf(o.n || START), catches: 0, level: 0, drops: 0, perfect: 0, best: o.n || START, over: false, eight: false,
    shake: [-9, -9], torches: [], slot0: 0, seq: 0, lastK: -1,
  };
  // the schedule: slot k lands at base + (k − kBase)·beat; when the beat quickens it is re-based at that moment (no landing moves back)
  J.base = 1.1; J.kBase = 0;   // the first landing: time to see the torches rise
  J.slotT = (k) => J.base + (k - J.kBase) * J.beat;
  const handOf = (k) => ((k % 2) + 2) % 2;
  const add = (k, from, fromT) => { J.torches.push({ id: J.seq++, k, from, to: handOf(k), t0: fromT, t1: J.slotT(k), fall: -1 }); };
  for (let i = 0; i < J.n; i++) add(i, handOf(i + 1), 0.2 + i * 0.06);   // the first n are tossed up at the start
  J.lastK = J.n - 1;
  /** the next torch landing in hand h (not fallen) */
  J.due = (hand) => { let b = null; for (const q of J.torches) if (q.fall < 0 && q.to === hand && (!b || q.t1 < b.t1)) b = q; return b; };
  function rethrow(q, k) {   // q thrown from its hand at its landing time to slot k
    q.from = q.to; q.t0 = q.t1; q.k = k; q.to = handOf(k); q.t1 = J.slotT(k);
  }
  function nextSlot(q) {
    // a new torch comes in: this one flies one slot further (period n + 1) and the new torch fills the hole it leaves
    if (J.n < MAX && J.level >= needOf(J.n)) {
      const hole = q.k + J.n; J.n++; J.beatNext = beatOf(J.n); J.level = 0; J.best = Math.max(J.best, J.n);
      rethrow(q, q.k + J.n);
      J.torches.push({ id: J.seq++, k: hole, from: -1, to: handOf(hole), t0: J.t, t1: J.slotT(hole), fall: -1 });   // (from −1: the Levite's toss from the side)
      return { k: 'add', n: J.n };
    }
    rethrow(q, q.k + J.n);
    return null;
  }
  J.tap = (hand) => {
    if (J.over || hand !== 0 && hand !== 1) return null;
    if (J.t < J.shake[hand]) return null;
    const q = J.due(hand), w = winOf(J.n);
    // a grab at nothing shakes that hand: far from a landing only a moment; close before one, until that torch has passed (it slips)
    if (!q || Math.abs(J.t - q.t1) > w) { J.shake[hand] = q && q.t1 - J.t < SLIP ? q.t1 + w + 0.02 : J.t + SHAKE; return 'fumble'; }
    const good = Math.abs(J.t - q.t1) <= PERFECT;
    J.catches++; J.level++; if (good) J.perfect++;
    J.pending = nextSlot(q);
    if (J.n >= MAX && J.level >= FINALE) { J.eight = true; J.over = true; }
    return good ? 'perfect' : 'catch';
  };
  J.step = (dt) => {
    const ev = [];
    if (J.pending) { ev.push(J.pending); J.pending = null; }
    if (J.over) return ev;
    J.t += dt;
    for (const q of J.torches) {
      if (q.fall < 0 && J.t > q.t1 + winOf(J.n)) {   // not caught: it falls and goes out; the Levite hands it back on its next beat
        q.fall = J.t; J.drops++; ev.push({ k: 'drop', hand: q.to, id: q.id });
        if (J.drops >= LIVES) { J.over = true; ev.push({ k: 'over' }); break; }
      } else if (q.fall >= 0 && J.t - q.fall > 0.7) {
        const k = q.k + J.n; q.fall = -1; q.from = -1; q.t0 = J.t; q.k = k; q.to = handOf(k); q.t1 = J.slotT(k);
      }
    }
    // (the beat quickens with the count: the schedule is re-timed from the current slot, so no landing moves backward)
    if (J.beatNext && J.beatNext !== J.beat) {
      const kNow = J.kBase + (J.t - J.base) / J.beat;
      J.base = J.t; J.kBase = kNow; J.beat = J.beatNext;
      for (const q of J.torches) if (q.fall < 0) q.t1 = Math.max(q.t1, J.slotT(q.k));
    }
    J.beatNext = 0;
    return ev;
  };
  /** the torches where they are now: [{ id, x: 0…1 between the hands, y: height 0…1 of the arc, lit, fall }] */
  J.view = () => J.torches.map((q) => {
    const u = Math.max(0, Math.min(1.25, (J.t - q.t0) / Math.max(0.05, q.t1 - q.t0)));
    return { id: q.id, u, from: q.from, to: q.to, T: q.t1 - q.t0, fall: q.fall >= 0 ? J.t - q.fall : -1, dueIn: q.t1 - J.t };
  });
  return J;
}

export const FACTS = [   // drafts (טיוטה), each with its source; the quotes checked on Sefaria, 30.9
  { id: 'to_rashbag', he: 'אמרו על רבן שמעון בן גמליאל, כשהיה שמח שמחת בית השואבה: "הָיָה נוֹטֵל שְׁמֹנֶה אֲבוּקוֹת שֶׁל אוֹר, וְזוֹרֵק אַחַת וְנוֹטֵל אַחַת וְאֵין נוֹגְעוֹת זוֹ בָּזוֹ".', ref: 'בבלי סוכה נג, א' },
  { id: 'to_lamps', he: 'בשמחת בית השואבה עמדו בעזרת הנשים מנורות של זהב, ובראשיהן ארבעה ספלים של זהב; ארבעה ילדים מפרחי הכהונה עלו בסולמות, ובידיהם כדים של שמן, ומילאו כל ספל.', ref: 'משנה סוכה ה, ב' },
  { id: 'to_light', he: '"וְלֹא הָיְתָה חָצֵר בִּירוּשָׁלַיִם שֶׁאֵינָהּ מְאִירָה מֵאוֹר בֵּית הַשּׁוֹאֵבָה".', ref: 'משנה סוכה ה, ג' },
  { id: 'to_dance', he: '"חֲסִידִים וְאַנְשֵׁי מַעֲשֶׂה הָיוּ מְרַקְּדִים לִפְנֵיהֶם בַּאֲבוּקוֹת שֶׁל אוֹר שֶׁבִּידֵיהֶן".', ref: 'משנה סוכה ה, ד' },
];

/* ───────── the drawing: night in the courts ───────── */
function torch(g, x, y, a, t, lit, s = 1) {   // a torch: a wooden handle, a wrapped head, a flame that stays upright
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = '#7A4A22'; g.fillRect(-3 * s, -4 * s, 6 * s, 30 * s);
  g.fillStyle = '#4A2C12'; g.fillRect(-4.5 * s, -9 * s, 9 * s, 7 * s);
  g.restore();
  if (!lit) return;
  const hx = x + Math.sin(a) * 7 * s, hy = y - Math.cos(a) * 7 * s, fl = t ? 1 + 0.12 * Math.sin(t * 19 + x) : 1;   // (t = 0: reduced motion, a still flame)
  const gl = g.createRadialGradient(hx, hy - 6 * s, 1, hx, hy - 6 * s, 26 * s);
  gl.addColorStop(0, 'rgba(255,220,120,.55)'); gl.addColorStop(1, 'rgba(255,160,40,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(hx, hy - 6 * s, 26 * s, 0, 6.2832); g.fill();
  g.fillStyle = '#FF9A2A'; g.beginPath(); g.moveTo(hx - 6 * s, hy); g.quadraticCurveTo(hx - 7 * s, hy - 10 * s * fl, hx, hy - 20 * s * fl); g.quadraticCurveTo(hx + 7 * s, hy - 10 * s * fl, hx + 6 * s, hy); g.closePath(); g.fill();
  g.fillStyle = '#FFE58A'; g.beginPath(); g.moveTo(hx - 3 * s, hy); g.quadraticCurveTo(hx - 3 * s, hy - 7 * s, hx, hy - 12 * s * fl); g.quadraticCurveTo(hx + 3 * s, hy - 7 * s, hx + 3 * s, hy); g.closePath(); g.fill();
}
function lamp(g, x, base, top) {   // a great golden lampstand of the courts, four golden bowls on its head (סוכה ה, ב) — the still part
  g.strokeStyle = '#C9962E'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, base); g.lineTo(x, top); g.stroke();
  g.fillStyle = '#B8862A'; g.fillRect(x - 14, base - 6, 28, 6);
  for (const dx of [-15, -5, 5, 15]) {
    const gl = g.createRadialGradient(x + dx, top - 6, 1, x + dx, top - 6, 22); gl.addColorStop(0, 'rgba(255,214,110,.5)'); gl.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(x + dx, top - 6, 22, 0, 6.2832); g.fill();
    g.fillStyle = '#D8A640'; g.beginPath(); g.ellipse(x + dx, top, 5, 2.5, 0, 0, 6.2832); g.fill();
  }
  g.strokeStyle = 'rgba(201,150,46,.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 17, top + 2); g.lineTo(x + 17, top + 2); g.stroke();
}
function lampFire(g, x, top, t, reduced) {   // its four flames, alive every frame
  for (const dx of [-15, -5, 5, 15]) {
    const f = reduced ? 1 : 1 + 0.15 * Math.sin(t * 11 + dx);
    g.fillStyle = '#FFB23C'; g.beginPath(); g.moveTo(x + dx - 3, top - 1); g.quadraticCurveTo(x + dx, top - 14 * f, x + dx + 3, top - 1); g.closePath(); g.fill();
  }
}
const STARS = Array.from({ length: 38 }, (_, i) => ({ x: ((i * 97) % 100) / 100, y: ((i * 57) % 61) / 100, r: 0.6 + (i % 3) * 0.45, p: i * 1.7 }));
function night(g, w, hh, t, reduced) {   // (GAMES13) the still night is a cached layer; only the lamps' flames move
  g.drawImage(layer('to-night', w, hh, '', (c) => nightStill(c, w, hh)), 0, 0, w, hh);
  lampFire(g, w * 0.07 + 8, hh * 0.2, t, reduced); lampFire(g, w * 0.93 - 8, hh * 0.2, t, reduced);
}
function nightStill(g, w, hh) {
  const sky = g.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#0A1330'); sky.addColorStop(0.62, '#2A2146'); sky.addColorStop(1, '#4A2E2A');
  g.fillStyle = sky; g.fillRect(0, 0, w, hh);
  for (const s of STARS) { g.globalAlpha = 0.5 + 0.4 * ((s.p * 7) % 1); g.fillStyle = '#FFF6DA'; g.beginPath(); g.arc(s.x * w, s.y * hh * 0.7, s.r, 0, 6.2832); g.fill(); }
  g.globalAlpha = 1;
  // the court's wall and its gate, dark against the lamps' glow
  const wy = hh * 0.66;
  const glow = g.createRadialGradient(w / 2, wy, 10, w / 2, wy, w * 0.8); glow.addColorStop(0, 'rgba(255,190,90,.28)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = glow; g.fillRect(0, 0, w, hh);
  g.fillStyle = '#2B1C18'; g.fillRect(0, wy, w, hh - wy);
  g.fillStyle = '#3A2820'; for (let x = 0; x < w; x += 26) g.fillRect(x, wy - 8, 18, 8);   // the wall's top
  g.fillStyle = '#1C120E'; g.beginPath(); g.moveTo(w / 2 - 26, hh); g.lineTo(w / 2 - 26, wy + 18); g.quadraticCurveTo(w / 2, wy - 4, w / 2 + 26, wy + 18); g.lineTo(w / 2 + 26, hh); g.fill();
  const floor = g.createLinearGradient(0, hh * 0.84, 0, hh); floor.addColorStop(0, '#5A3E2A'); floor.addColorStop(1, '#3A2618');
  g.fillStyle = floor; g.fillRect(0, hh * 0.86, w, hh * 0.14);
  lamp(g, w * 0.07 + 8, hh * 0.86, hh * 0.2); lamp(g, w * 0.93 - 8, hh * 0.86, hh * 0.2);
}
function hands(g, P, hy, s, shakeL, shakeR, now) {   // the juggler from behind — a young Levite in white linen — his hands open, palms up
  const cx = (P[0] + P[1]) / 2;
  g.fillStyle = '#E8E0CE'; g.beginPath(); g.moveTo(cx - 70 * s, hy + 200 * s); g.quadraticCurveTo(cx - 74 * s, hy + 44 * s, cx - 40 * s, hy + 36 * s); g.lineTo(cx + 40 * s, hy + 36 * s); g.quadraticCurveTo(cx + 74 * s, hy + 44 * s, cx + 70 * s, hy + 200 * s); g.closePath(); g.fill();   // the robe's shoulders
  g.fillStyle = '#4A3222'; g.beginPath(); g.ellipse(cx, hy + 18 * s, 21 * s, 24 * s, 0, 0, 6.2832); g.fill();   // the head, from behind
  g.fillStyle = '#F4EFE2'; g.beginPath(); g.ellipse(cx, hy + 4 * s, 20 * s, 12 * s, 0, Math.PI, 0); g.fill();   // the linen cap
  for (const [x, sh, k] of [[P[0], shakeL, -1], [P[1], shakeR, 1]]) {
    const dx = sh ? Math.sin(now * 60) * 3 : 0, hx = x + dx;
    g.strokeStyle = '#E8E0CE'; g.lineWidth = 17 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + k * 44 * s, hy + 48 * s); g.quadraticCurveTo(hx + k * 10 * s, hy + 44 * s, hx, hy + 14 * s); g.stroke(); g.lineCap = 'butt';   // the sleeve
    g.fillStyle = '#C99468'; g.strokeStyle = 'rgba(90,50,20,.6)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(hx, hy + 6 * s, 15 * s, 9 * s, 0, 0, 6.2832); g.fill(); g.stroke();   // the palm
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(hx + (i - 1.5) * 7 * s, hy - 3 * s, 3.2 * s, 7 * s, (i - 1.5) * 0.18, 0, 6.2832); g.fill(); g.stroke(); }   // the fingers
    g.beginPath(); g.ellipse(hx - k * 15 * s, hy + 4 * s, 3.4 * s, 7 * s, -k * 0.9, 0, 6.2832); g.fill(); g.stroke();   // the thumb
  }
}
export function icon(g, s) {
  const sky = g.createLinearGradient(0, 0, 0, s); sky.addColorStop(0, '#0E1838'); sky.addColorStop(1, '#4A2E2A');
  g.fillStyle = sky; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  const k = s / 76;
  g.save(); g.scale(k, k);
  g.strokeStyle = 'rgba(255,214,120,.45)'; g.lineWidth = 2; g.setLineDash([3, 4]); g.beginPath(); g.arc(38, 52, 26, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.setLineDash([]);
  torch(g, 16, 46, -0.5, 0, true, 0.8); torch(g, 38, 22, 0.1, 1, true, 0.8); torch(g, 60, 44, 0.6, 2, true, 0.8);
  g.fillStyle = '#C99468'; g.beginPath(); g.ellipse(22, 66, 9, 5, 0, 0, 6.2832); g.ellipse(54, 66, 9, 5, 0, 0, 6.2832); g.fill();
  g.restore();
}

/* ───────── the game ───────── */
const CSS = `
.g10-to{position:relative;flex:1;min-height:0;touch-action:none;cursor:pointer}
.g10-to canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-to-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;right:10px;display:flex;justify-content:space-between;gap:6px;pointer-events:none;z-index:2}
.g10-to-hud span{background:rgba(10,6,20,.62);border-radius:999px;padding:4px 11px;font:800 14px/1.3 "Heebo",sans-serif;color:#FFF3D6;white-space:nowrap}
.g10-to-hud i{font-style:normal;color:#FFD66E}
.g10-to-tip{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 46px);text-align:center;pointer-events:none;font:800 15px/1.3 "Heebo",sans-serif;color:#FFF3D6;z-index:2}
.g10-to-tip span{display:inline-block;background:rgba(10,6,20,.7);border-radius:999px;padding:5px 14px;max-width:90%}
.g10-half.g10-t .g10-to-tip{top:auto;bottom:calc(env(safe-area-inset-top,0px) + 10px)}
.g10-to-x{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);left:50%;transform:translateX(-50%);z-index:4}
`;
export const GAME = {
  id: 'torches', title: 'שמונה אבוקות', sub: 'בלילה בעזרה, באור שמחת בית השואבה: לזרוק ולתפוס — משלוש עד שמונה', chip: 'לבד · או שניים', pay: { gold: 6 },
  how: [
    'האבוקות עפות בין שתי הידיים. הקש בצד שבו אבוקה נוחתת — ימין או שמאל — בדיוק כשהיא מגיעה ליד.',
    'כל תפיסה זורקת אותה שוב למעלה. אחרי כמה תפיסות הלוי מוסיף עוד אבוקה — עד שמונה.',
    'אבוקה שלא נתפסה נופלת; הלוי מדליק אותה ומחזיר. שלוש שנפלו — והערב נגמר.',
  ],
  quote: { he: 'וְזוֹרֵק אַחַת וְנוֹטֵל אַחַת וְאֵין נוֹגְעוֹת זוֹ בָּזוֹ', src: 'בבלי סוכה נג, א' },
  solo: 'לבד', soloSub: 'כמה אבוקות תחזיק באוויר?', duelSub: 'שני מלהטטים, כל אחד בחצי שלו',
  icon, facts: FACTS, run,
  words(duel, r, P = PLAYERS) {
    const b = r.best || [START, START], c = r.catches || [0, 0];
    const tt = (n) => (n >= MAX ? 'שמונה אבוקות' : `${n} אבוקות`);
    if (!duel) return r.eight ? ['שמונה אבוקות!', `כמו רבן שמעון בן גמליאל — ${c[0]} תפיסות, ואין נוגעות זו בזו.`] : [`${tt(b[0])} באוויר!`, `${c[0]} תפיסות. ${b[0] < MAX ? `בפעם הבאה — ${b[0] + 1}.` : ''}`];
    if (r.winner < 0) return [0, 1].map((i) => ['שני מלהטטים!', `${tt(b[i])} לכל אחד — ${c[i]} תפיסות.`]);
    const w = r.winner, same = b[0] === b[1];
    return [0, 1].map((i) => (i === w ? [same ? 'עוד כמה תפיסות!' : 'הלהטוט שלך הגבוה!', `${tt(b[i])} באוויר, ${c[i]} תפיסות.`]
      : ['להטוט יפה!', same ? `${tt(b[i])} לכל אחד; ${P[w].name} תפס ${c[w]}, אתה ${c[i]}.` : `${tt(b[i])} באוויר; ${P[w].name} הגיע ל־${b[w]}.`]));
  },
};

async function run(S, ctx = {}) {
  const { duel, sfx = () => {}, reduced } = ctx;
  injectCSS('g10-to-css', CSS);
  const L = S.splitLayout(duel);
  let quit = false, raf = 0, finish = null;
  const done = new Promise((r) => { finish = r; });
  const Q = L.halves.map((half, me) => {
    const box = h('div', 'g10-to'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'שמונה אבוקות: הקש בצד שבו האבוקה נוחתת');
    const cv = document.createElement('canvas'); box.appendChild(cv);
    const hud = h('div', 'g10-to-hud'); box.appendChild(hud);
    const tip = h('div', 'g10-to-tip', `<span>${duel ? `${PLAYERS[me].name}: ` : ''}הקש כדי להתחיל לזרוק</span>`); box.appendChild(tip);
    half.appendChild(box);
    const J = makeJuggler({});
    const q = { me, half, box, cv, hud, tip, J, geo: null, flash: [-9, -9], pops: [], lastN: J.n, shownOver: false, started: false };
    const flip = () => half.classList.contains('g10-t');
    box.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button') || quit || J.over) return;
      e.preventDefault();
      if (!q.started) { q.started = true; sfx('whoosh'); q.tip.innerHTML = '<span>הקש בצד שבו האבוקה נוחתת — כשהטבעת מאירה</span>'; return; }   // (the first tap starts the evening: the torches wait for him)
      const r = box.getBoundingClientRect(), lx = flip() ? r.right - e.clientX : e.clientX - r.left;
      const hand = lx < r.width / 2 ? 0 : 1;   // 0: the left hand on screen, 1: the right
      const res = J.tap(hand);
      if (res === 'catch' || res === 'perfect') { q.flash[hand] = performance.now(); sfx(res === 'perfect' ? 'perfect' : 'tap', { combo: Math.min(9, J.level) }); if (res === 'perfect') q.pops.push({ t: 'מדויק!', hand, at: performance.now() }); }
      else if (res === 'fumble') sfx('m3bad');
      if (J.catches >= 3 && q.tip.textContent) q.tip.innerHTML = '';
    });
    half.__g10 = box.__g10 = {
      state: () => {
        const r = box.getBoundingClientRect(), G0 = q.geo;
        const pg = (x, y) => (flip() ? { x: r.right - x, y: r.bottom - y } : { x: r.left + x, y: r.top + y });
        const d = [0, 1].map((hd) => { const t = J.due(hd); return t ? { in: t.t1 - J.t, win: winOf(J.n) } : null; });
        return { me, started: q.started, n: J.n, best: J.best, catches: J.catches, level: J.level, need: needOf(J.n), drops: J.drops, over: J.over, eight: J.eight, t: J.t, due: d,
          shaking: [J.t < J.shake[0], J.t < J.shake[1]], hands: G0 ? [pg(G0.hx[0], G0.hy), pg(G0.hx[1], G0.hy)] : null };
      },
    };
    return q;
  });
  const xb = h('button', 'g10-x g10-to-x', 'יציאה'); xb.type = 'button'; Q[0].box.appendChild(xb);
  xb.addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(); } });
  const hudOf = (q) => {
    const J = q.J, left = LIVES - J.drops;
    q.hud.innerHTML = `<span>אבוקות · <i>${J.n}</i></span><span>${J.n >= MAX ? `שמונה! עוד ${Math.max(0, FINALE - J.level)}` : `לאבוקה הבאה: ${Math.max(0, needOf(J.n) - J.level)}`}</span><span aria-label="${left} אבוקות לפני סוף הערב">נפלו <i>${J.drops}</i>/${LIVES}</span>`;
  };
  Q.forEach(hudOf);
  let last = performance.now();
  function frame() {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (const q of Q) {
      const J = q.J;
      if (!quit && !J.over && q.started) for (const e of J.step(dt)) {
        if (e.k === 'add') { sfx('chime', { combo: e.n }); S.toast(q.box, `<b>${e.n === MAX ? 'שמונה אבוקות!' : `${e.n} אבוקות`}</b>הלוי הוסיף אבוקה`, 1300); }
        else if (e.k === 'drop') sfx('thud', { mass: 0.25 });
      }
      else if (!quit) for (const e of J.step(0)) if (e.k === 'add') { sfx('chime', { combo: e.n }); }
      if (J.over && !q.shownOver) { q.shownOver = true; q.tip.innerHTML = `<span>${J.eight ? 'שמונה אבוקות — ואין נוגעות זו בזו!' : duel ? `${J.best} אבוקות! מחכים לחבר…` : 'הערב נגמר'}</span>`; if (J.eight) sfx('m3win'); if (Q.every((o) => o.J.over)) setTimeout(() => finish(), reduced ? 400 : 1100); }
      if (J.n !== q.lastN || now - (q.hudAt || 0) > 250) { hudOf(q); q.lastN = J.n; q.hudAt = now; }
      const { w, h: hh, g } = fitCanvas(q.cv);
      const hy = hh - Math.max(64, hh * 0.13), hx = [w * 0.27, w * 0.73], s = Math.max(0.75, Math.min(1.2, hh / 640));
      q.geo = { hx, hy, w, hh };
      night(g, w, hh, now / 1000, reduced);
      // the landing rings: the next torch in each hand; gold at its moment
      for (const hd of [0, 1]) {
        const t = J.due(hd); if (!t || J.over) continue;
        const k = t.t1 - J.t, hot = Math.abs(k) <= winOf(J.n);
        const rr = 24 * s + Math.max(0, Math.min(1, k / 0.8)) * 22 * s;
        g.strokeStyle = hot ? 'rgba(255,214,90,.95)' : 'rgba(255,236,170,.35)'; g.lineWidth = hot ? 4 : 2;
        g.beginPath(); g.ellipse(hx[hd], hy - 2, rr, rr * 0.45, 0, 0, 6.2832); g.stroke();
      }
      const gH = hh * 0.36;   // the arc's "gravity" (h = g·T²/8): eight torches (≈ 4 s) reach ~0.72 of the height
      for (const v of J.view()) {
        let x, y, a, lit = true;
        const from = v.from < 0 ? (v.to === 0 ? -0.1 * w : 1.1 * w) : hx[v.from], to = hx[v.to];
        if (v.fall >= 0) {   // falling: it drops from the hand to the floor and goes out
          x = to + (v.to ? 18 : -18) * Math.min(1, v.fall * 2); y = Math.min(hh * 0.95, hy + 260 * v.fall * v.fall); a = v.fall * 6 * (v.to ? 1 : -1); lit = v.fall < 0.15;
        } else {
          const u = v.u, T = Math.max(0.2, v.T), peak = Math.min(hy - 40, gH * T * T / 8);
          x = from + (to - from) * Math.min(1, u) + (v.from === v.to ? Math.sin(Math.PI * Math.min(1, u)) * (v.to ? -26 : 26) * s : 0);
          y = hy - 18 * s - 4 * peak * u * (1 - u);
          a = reduced ? 0 : (to - from >= 0 ? 1 : -1) * Math.PI * 2 * Math.min(1, u);   // one full turn: it comes down handle first, as it went up
        }
        torch(g, x, y, a, reduced ? 0 : now / 1000, lit, s);
      }
      hands(g, hx, hy, s, J.t < J.shake[0], J.t < J.shake[1], now / 1000);
      for (const hd of [0, 1]) if (now - q.flash[hd] < 220) { g.fillStyle = 'rgba(255,230,140,.35)'; g.beginPath(); g.arc(hx[hd], hy, 34 * s, 0, 6.2832); g.fill(); }
      q.pops = q.pops.filter((p) => now - p.at < 700);
      for (const p of q.pops) { const k = (now - p.at) / 700; g.globalAlpha = 1 - k; g.fillStyle = '#FFE08A'; g.font = '900 18px "Frank Ruhl Libre", serif'; g.textAlign = 'center'; g.fillText(p.t, hx[p.hand], hy - 60 * s - k * 30); g.globalAlpha = 1; }
    }
    raf = requestAnimationFrame(frame);
  }
  await sleep(30);
  raf = requestAnimationFrame(frame);
  try {
    await done;
    if (quit) return { quit: true };
    const b = Q.map((q) => q.J.best), c = Q.map((q) => q.J.catches), d = Q.map((q) => q.J.drops);
    const sc = (i) => b[i] * 1000 + c[i];
    await sleep(reduced ? 150 : 400);
    return { winner: duel ? (sc(0) === sc(1) ? -1 : sc(0) > sc(1) ? 0 : 1) : 0, best: duel ? b : [b[0], 0], catches: duel ? c : [c[0], 0], drops: duel ? d : [d[0], 0], eight: Q.some((q) => q.J.eight) };
  } finally { cancelAnimationFrame(raf); }
}
export { run };
