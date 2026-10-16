/* ─────────────────────────────────────────────────────────────────────────────
 * games/knuckle.js — (GAMES13, wave 13) "חמש אבנים": knucklebones (astragaloi), the game a boy of the Second Temple played (the
 * owner, 30.9: "המשחק מיועד בעיקר לבנים צעירים … אילו משחקים שיחקו בתקופה ההיא"). Five sheep's anklebones on a mat in the
 * Mount's plaza: throw the golden one up (tap the hand), tap the bones on the mat while it flies, catch it as it comes down (tap
 * the hand when it is in the gold ring). Ones (אחדות) → twos → threes (3 + 1) → fours. A game of skill only: nothing is thrown
 * for chance, nothing is won from anyone. Solo: through the four rounds (a missed throw is simply thrown again, a little slower);
 * a duel on one phone: the old rule — a miss passes the turn; the first through the fours is the winner.
 *   run(S, { duel, first, sfx, reduced, rnd, onRound }) → { winner: 0 | 1 | -1, misses:[a, b], perfect:[a, b], throws, rounds:[a, b], quit }
 * Pure (node): ROUNDS, newPlayer, need, flightOf, heightAt, judgeCatch, advance, scatter.
 * Test hook: the board's `.g10-kn` carries __g10 = { state() } (page CSS px).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, sleep, injectCSS, fitCanvas, PLAYERS, layer } from './shell.js';

export const ROUNDS = [
  { name: 'אחדות', groups: [1, 1, 1, 1] },
  { name: 'שתיים', groups: [2, 2] },
  { name: 'שלוש', groups: [3, 1] },
  { name: 'ארבע', groups: [4] },
];
export const FLIGHT = [2.2, 2.05, 1.95, 1.85];            // the golden bone's flight up and back to the hand (s), by round
export const CATCH = { lo: 0.42, perfect: 0.12, cloth: -0.25 };   // heights: the peak = 1, the hand = 0, the mat below it
export const CLOSE = 0.35;                                  // a catch tried too early closes the hand this long (mashing is not a catch)
export const heightAt = (u) => 4 * u * (1 - u);             // u = t / flight: up and down through the hand; below 0: toward the mat
export const U_CLOTH = (1 + Math.sqrt(1 - CATCH.cloth)) / 2;   // when it lands on the mat (≈ 1.06)
export const newPlayer = () => ({ round: 0, group: 0, misses: 0, perfect: 0, slow: 0, throws: 0 });
export const need = (p) => { const R = ROUNDS[p.round]; return R ? R.groups[p.group] : 0; };
/** a missed throw is thrown again a little slower (up to 1.4×) — a kind hand for a small player, never a word about it */
export const flightOf = (p) => (FLIGHT[p.round] || FLIGHT[FLIGHT.length - 1]) * (1 + Math.min(0.4, 0.15 * (p.slow | 0)));
/** a tap on the hand while the bone flies (u = t / flight) → 'early' | 'perfect' | 'ok' | 'drop' */
export function judgeCatch(u) {
  const y = heightAt(u);
  if (u < 0.5 || y > CATCH.lo) return 'early';
  if (u >= U_CLOTH) return 'drop';
  return Math.abs(y) <= CATCH.perfect ? 'perfect' : 'ok';
}
/** a throw's end: caught (with how many bones in the hand) or dropped → { ok, roundDone, over } (p moves on only when ok) */
export function advance(p, caught, picked) {
  p.throws++;
  const ok = (caught === 'ok' || caught === 'perfect') && picked === need(p);
  if (!ok) { p.misses++; p.slow++; return { ok: false, roundDone: false, over: false, why: caught === 'drop' || caught == null ? 'drop' : 'short' }; }
  if (caught === 'perfect') p.perfect++;
  p.slow = 0; p.group++;
  let roundDone = false;
  if (p.group >= ROUNDS[p.round].groups.length) { p.round++; p.group = 0; roundDone = true; }
  return { ok: true, roundDone, over: p.round >= ROUNDS.length };
}
/** n bones on the mat (fractions of its box), ≥ gap apart */
export function scatter(n, rnd = Math.random, gap = 0.27) {
  const out = [];
  for (let k = 0; out.length < n && k < 400; k++) {
    const p = { x: 0.1 + 0.8 * rnd(), y: 0.14 + 0.72 * rnd() };
    if (out.every((q) => Math.hypot((q.x - p.x) * 1.4, q.y - p.y) >= gap)) out.push(p);
  }
  while (out.length < n) out.push({ x: 0.15 + 0.7 * (out.length / Math.max(1, n - 1)), y: 0.5 });
  return out;
}

export const FACTS = [   // drafts (טיוטה), each with its source; checked 30.9 (tmsifting.org, Sefaria)
  { id: 'kn_tmsp', he: 'בסינון העפר שהוצא מהר הבית נמצא אסטרגל — עצם קרסול מרגלו האחורית של כבש או עז, שבה שיחקו. רוב האסטרגלים שנמצאו הם מהתקופה ההלניסטית והרומית.', ref: 'פרויקט סינון עפר הר הבית, ‎“It’s All Fun and Games!”‎, 2.1.2017 (tmsifting.org)' },
  { id: 'kn_five', he: 'שיחקו בחמש עצמות קטנות: זרקו אותן לאוויר ותפסו אותן בדרכים שונות. ילדי ישראל משחקים היום משחק דומה — "חמש אבנים".', ref: 'פרויקט סינון עפר הר הבית, ‎“It’s All Fun and Games!”‎, 2.1.2017 (tmsifting.org)' },
  { id: 'kn_zech', he: 'זכריה הנביא, שניבא בימי בניין הבית השני, ראה את ירושלים שבה: "וּרְחֹבוֹת הָעִיר יִמָּלְאוּ יְלָדִים וִילָדוֹת מְשַׂחֲקִים בִּרְחֹבֹתֶיהָ".', ref: 'זכריה ח, ה' },
];

/* ───────── the drawing (canvas 2D, the games' warm look) ───────── */
function boneShape(g, s) {   // an anklebone: two knobs and a waist, its pit in the middle (s = its width)
  const w = s / 2, hh = s * 0.34;
  g.beginPath();
  g.moveTo(-w, -hh * 0.2);
  g.bezierCurveTo(-w, -hh * 1.25, -w * 0.35, -hh * 1.1, -w * 0.18, -hh * 0.7);
  g.quadraticCurveTo(0, -hh * 0.45, w * 0.2, -hh * 0.75);
  g.bezierCurveTo(w * 0.45, -hh * 1.2, w, -hh * 1.05, w, -hh * 0.1);
  g.bezierCurveTo(w, hh * 1.1, w * 0.4, hh * 1.2, w * 0.18, hh * 0.72);
  g.quadraticCurveTo(0, hh * 0.5, -w * 0.2, hh * 0.78);
  g.bezierCurveTo(-w * 0.5, hh * 1.25, -w, hh * 1, -w, -hh * 0.2);
  g.closePath();
}
export function bone(g, x, y, s, rot = 0, gold = false, glow = false) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (glow) { g.shadowColor = 'rgba(255,226,120,.95)'; g.shadowBlur = 14; }
  const gr = g.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
  if (gold) { gr.addColorStop(0, '#FFF0B8'); gr.addColorStop(0.5, '#E6B04A'); gr.addColorStop(1, '#A8701E'); }
  else { gr.addColorStop(0, '#FFFBEF'); gr.addColorStop(0.55, '#EADBB8'); gr.addColorStop(1, '#C4AC7E'); }
  boneShape(g, s); g.fillStyle = gr; g.fill();
  g.shadowBlur = 0; g.shadowColor = 'transparent';
  g.lineWidth = 1.4; g.strokeStyle = gold ? '#7A4A0E' : 'rgba(96,70,36,.85)'; g.stroke();
  g.fillStyle = gold ? 'rgba(120,70,10,.45)' : 'rgba(120,92,52,.4)';
  g.beginPath(); g.ellipse(0, 0, s * 0.1, s * 0.07, 0, 0, 6.2832); g.fill();   // the pit
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-s * 0.26, -s * 0.12, s * 0.09, s * 0.04, -0.4, 0, 6.2832); g.fill();
  g.restore();
}
function mat(g, x0, y0, x1, y1) {   // a woven mat (מחצלת) on the plaza: bands and a fringe
  const r = 18;
  g.save();
  g.shadowColor = 'rgba(40,20,4,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
  g.fillStyle = '#B8653A'; g.beginPath(); g.roundRect ? g.roundRect(x0, y0, x1 - x0, y1 - y0, r) : g.rect(x0, y0, x1 - x0, y1 - y0); g.fill();
  g.restore();
  g.save(); g.beginPath(); g.roundRect ? g.roundRect(x0, y0, x1 - x0, y1 - y0, r) : g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  const n = 9, bh = (y1 - y0) / n;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 3 === 1 ? '#D9A05E' : i % 3 === 2 ? '#A5532E' : '#C47442'; g.fillRect(x0, y0 + i * bh, x1 - x0, bh + 0.5); }
  g.strokeStyle = 'rgba(80,36,10,.18)'; g.lineWidth = 1;
  for (let x = x0 + 6; x < x1; x += 8) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
  g.restore();
  g.strokeStyle = '#E8C28A'; g.lineWidth = 2;
  for (const yy of [y0, y1]) for (let x = x0 + 14; x < x1 - 10; x += 9) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (yy === y0 ? -2 : 2), yy + (yy === y0 ? -7 : 7)); g.stroke(); }
}
function plaza(g, w, hh) {   // the Mount's plaza: warm flagstones, a colonnade's shade at the top
  const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#E8D2A6'); gr.addColorStop(1, '#C9A873');
  g.fillStyle = gr; g.fillRect(0, 0, w, hh);
  g.strokeStyle = 'rgba(120,90,50,.28)'; g.lineWidth = 1.5;
  const rh = 46;
  for (let r = 0; r * rh < hh; r++) { const y = r * rh; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (r % 2 ? 36 : 0); x < w; x += 72) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + rh); g.stroke(); } }
  g.fillStyle = 'rgba(92,60,26,.22)'; g.fillRect(0, 0, w, 26);
  for (let x = 12; x < w; x += 44) { g.fillStyle = 'rgba(250,236,204,.55)'; g.fillRect(x, 0, 12, 22); }   // the colonnade's columns, in the distance
}
function handShape(g, x, y, s, closed) {   // the player's hand, palm up (open) or a fist (the bone caught)
  g.save(); g.translate(x, y);
  g.fillStyle = '#EFE3C8'; g.beginPath(); g.moveTo(-s * 0.5, s * 0.55); g.lineTo(-s * 0.36, s * 1.4); g.lineTo(s * 0.36, s * 1.4); g.lineTo(s * 0.5, s * 0.55); g.closePath(); g.fill();   // the sleeve
  g.fillStyle = '#D9A77A'; g.strokeStyle = 'rgba(110,64,30,.7)'; g.lineWidth = 1.5;
  if (closed) {
    g.beginPath(); g.ellipse(0, s * 0.18, s * 0.42, s * 0.38, 0, 0, 6.2832); g.fill(); g.stroke();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-s * 0.3 + i * s * 0.2, -s * 0.12); g.lineTo(-s * 0.3 + i * s * 0.2, s * 0.05); g.stroke(); }
  } else {
    g.beginPath(); g.ellipse(0, s * 0.2, s * 0.44, s * 0.34, 0, 0, 6.2832); g.fill(); g.stroke();
    for (let i = 0; i < 4; i++) { const fx = -s * 0.33 + i * s * 0.22; g.beginPath(); g.ellipse(fx, -s * 0.2, s * 0.085, s * 0.24, (i - 1.5) * 0.12, 0, 6.2832); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(s * 0.5, s * 0.12, s * 0.09, s * 0.22, -0.9, 0, 6.2832); g.fill(); g.stroke();   // the thumb
  }
  g.restore();
}
export function icon(g, s) {
  const gr = g.createLinearGradient(0, 0, 0, s); gr.addColorStop(0, '#F2DDB0'); gr.addColorStop(1, '#C9A873');
  g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  g.fillStyle = '#B8653A'; g.fillRect(s * 0.08, s * 0.58, s * 0.84, s * 0.3);
  g.fillStyle = '#D9A05E'; g.fillRect(s * 0.08, s * 0.68, s * 0.84, s * 0.08);
  bone(g, s * 0.26, s * 0.7, s * 0.26, 0.3); bone(g, s * 0.56, s * 0.78, s * 0.24, -0.5); bone(g, s * 0.78, s * 0.66, s * 0.22, 0.9);
  bone(g, s * 0.52, s * 0.26, s * 0.3, -0.3, true, true);
  g.strokeStyle = 'rgba(255,250,235,.9)'; g.lineWidth = 2; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(s * 0.5, s * 0.5); g.quadraticCurveTo(s * 0.44, s * 0.36, s * 0.5, s * 0.33); g.stroke(); g.setLineDash([]);
}

/* ───────── the game ───────── */
const CSS = `
.g10-kn{position:absolute;inset:0;touch-action:none;cursor:pointer}
.g10-kn canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-kn-hud{position:absolute;top:8px;left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;z-index:2}
.g10-kn-hud span{background:rgba(20,12,4,.62);border-radius:999px;padding:4px 12px;font:800 14.5px/1.3 "Heebo",sans-serif;color:#FFF3D6;white-space:nowrap}
.g10-kn-hud i{font-style:normal;color:#FFD66E}
.g10-kn-tip{position:absolute;left:0;right:0;top:48px;text-align:center;pointer-events:none;font:800 15.5px/1.3 "Heebo",sans-serif;color:#FFF3D6;z-index:2}
.g10-kn-tip span{display:inline-block;background:rgba(20,12,4,.7);border-radius:999px;padding:6px 14px;max-width:90%}
`;
export const GAME = {
  id: 'knuckle', title: 'חמש אבנים', sub: 'המשחק של ילדי הבית השני: זורקים, אוספים ותופסים', chip: 'לבד · או שניים', pay: { stone: 8 },
  how: [
    'הקש על היד — העצם הזהובה עפה למעלה.',
    'בזמן שהיא באוויר, הקש על העצמות שעל המחצלת: אחת, אחר כך שתיים, שלוש — ובסוף ארבע.',
    'כשהיא יורדת אל הטבעת הזהובה — הקש על היד ותפוס אותה.',
  ],
  quote: { he: 'וּרְחֹבוֹת הָעִיר יִמָּלְאוּ יְלָדִים וִילָדוֹת מְשַׂחֲקִים בִּרְחֹבֹתֶיהָ', src: 'זכריה ח, ה' },
  solo: 'לבד', soloSub: 'אחדות, שתיים, שלוש, ארבע', duelSub: 'תור לכל אחד — מי שמחטיא, מעביר את התור',
  icon, facts: FACTS, run,
  words(duel, r, P = PLAYERS) {
    const m = r.misses || [0, 0], w = r.winner;
    if (!duel) return m[0] ? ['כל ארבעת הסבבים!', `אחדות, שתיים, שלוש וארבע — ב־${r.throws} זריקות.`] : ['בלי אף החטאה!', `אחדות, שתיים, שלוש וארבע — ${r.throws} זריקות, ${r.throws} תפיסות.`];
    if (w < 0) return [0, 1].map(() => ['שני שחקנים טובים!', 'הגעתם שניכם עד אותו מקום.']);
    return [0, 1].map((i) => (i === w ? ['עברת את הארבע ראשון!', `כל ארבעת הסבבים — ${(r.perfect || [0, 0])[i] ? `עם ${(r.perfect || [0, 0])[i]} תפיסות מושלמות` : 'יד זריזה'}.`]
      : ['משחק יפה!', `${P[w].name} הגיע ראשון לסוף הארבע; אתה הגעת ל${ROUNDS[Math.min(3, (r.rounds || [0, 0])[i])].name}.`]));
  },
};

async function run(S, ctx = {}) {
  const { duel, sfx = () => {}, rnd = Math.random, reduced } = ctx;
  injectCSS('g10-kn-css', CSS);
  const L = S.turnLayout(false);   // (a duel in turns passes the phone: both bands read upright; the card "תור …" hands it over)
  if (!duel) L.top.el.style.display = 'none';
  const bands = [L.bot, L.top];
  const P = [newPlayer(), newPlayer()];
  let turn = duel ? (ctx.first === 1 ? 1 : 0) : 0;
  const names = duel ? [PLAYERS[0].name, PLAYERS[1].name] : ['אתה', ''];
  const box = h('div', 'g10-kn'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'חמש אבנים: הקש על היד, על העצמות, ושוב על היד');
  const cv = document.createElement('canvas'); box.appendChild(cv);
  const hud = h('div', 'g10-kn-hud'); box.appendChild(hud);
  const tip = h('div', 'g10-kn-tip', '<span>הקש על היד כדי לזרוק</span>'); box.appendChild(tip);
  L.board.style.padding = '0'; L.board.appendChild(box);
  let quit = false, raf = 0, finish = null, phase = 'ready', th = null, picked = [], after = 0, fly = [], closed = false, passing = false;
  const done = new Promise((r) => { finish = r; });
  // the mat as player p left it: the bones already taken in his round stay off (a duel's turn lays it again for who plays now)
  const layFor = (p) => { const R = ROUNDS[p.round], taken = R ? R.groups.slice(0, p.group).reduce((a, b) => a + b, 0) : 0; return scatter(4, rnd).map((q, i) => ({ ...q, rot: (rnd() - 0.5) * 2.4, on: i >= taken })); };
  let bones = layFor(P[turn]);
  let geo = null;
  const layout = () => {
    const r = box.getBoundingClientRect(), W = Math.max(200, r.width), H = Math.max(260, r.height);
    const hand = { x: W / 2, y: H - Math.max(78, H * 0.13) };
    const m = { x0: 18, y0: Math.max(96, H * 0.36), x1: W - 18, y1: hand.y - Math.max(84, H * 0.12) };
    geo = { W, H, hand, mat: m, peak: Math.max(70, H * 0.1), s: Math.max(44, Math.min(62, W * 0.14)) };
  };
  const boneXY = (b) => ({ x: geo.mat.x0 + b.x * (geo.mat.x1 - geo.mat.x0), y: geo.mat.y0 + b.y * (geo.mat.y1 - geo.mat.y0) });
  const stoneXY = () => {
    if (!th) return { x: geo.hand.x, y: geo.hand.y - 18 };
    const u = th.t / th.T, y0 = geo.hand.y - 18;
    return { x: geo.hand.x + Math.sin(u * 3.1) * 10, y: y0 - heightAt(u) * (y0 - geo.peak) };
  };
  const ring = () => { const y0 = geo.hand.y - 18, span = y0 - geo.peak; return { y0: y0 - CATCH.lo * span, y1: y0 - CATCH.cloth * span, mid: y0 }; };
  const setTip = (t) => { tip.innerHTML = t ? `<span>${t}</span>` : ''; };
  function paintHud() {
    const p = P[turn], R = ROUNDS[Math.min(p.round, ROUNDS.length - 1)];
    hud.innerHTML = `<span>${duel ? `תור <i>${names[turn]}</i> · ` : ''}${R.name}</span><span>${p.round >= ROUNDS.length ? 'הכול!' : `לאסוף <i>${need(p)}</i>`}</span>`;
    bands.forEach((b, i) => { const q = P[i]; b.set({ name: names[i], score: Math.min(4, q.round), unit: 'סבבים', on: duel ? i === turn && phase !== 'over' : false, msg: duel ? (i === turn ? 'תורך' : 'ממתין לתורו') : '' }); });
  }
  const toast = (html, ms = 900) => { S.toast(box, html, ms); };
  function newThrow() {
    const p = P[turn];
    th = { t: 0, T: flightOf(p), closedTill: -1 };
    picked = []; phase = 'air'; closed = false;
    setTip(`אסוף ${need(p) === 1 ? 'עצם אחת' : need(p) === 4 ? 'את כל הארבע' : `${need(p)} עצמות`} — ואז תפוס!`);
    sfx('whoosh');
  }
  function endThrow(caught) {
    const p = P[turn], n = picked.length, res = advance(p, caught, n);
    phase = 'after'; after = performance.now(); closed = res.ok;
    if (res.ok) {
      for (const i of picked) bones[i].on = false;
      sfx(caught === 'perfect' ? 'perfect' : 'chime', { combo: p.group + 2 });
      toast(`<b>${caught === 'perfect' ? 'תפיסה מושלמת!' : 'תפסת!'}</b>${res.roundDone && !res.over ? `עכשיו: ${ROUNDS[p.round].name}` : ''}`);
      if (res.roundDone) { try { if (ctx.onRound) ctx.onRound(p.round, turn); } catch (e) { /* (the quarry's cycle pays each round live) */ } }
      if (res.roundDone && !res.over) bones = layFor(p);
      if (res.over) { phase = 'over'; setTip(''); paintHud(); sfx('m3win'); setTimeout(() => finish(), reduced ? 500 : 1300); return; }
    } else {
      for (const i of picked) bones[i].on = true;   // the bones go back to the mat
      sfx('thud', { mass: 0.3 });
      toast(res.why === 'drop' ? '<b>נפלה!</b>זורקים שוב' : `<b>צריך ${need(p) === 1 ? 'עצם אחת' : `${need(p)} עצמות`}</b>אוספים ואז תופסים`);
      if (duel && P[0].throws + P[1].throws >= 80) { phase = 'over'; setTimeout(() => finish(), 400); }
      else if (duel) { turn = 1 - turn; passing = true; bones = layFor(P[turn]); }   // the phone passes: after the toast, the card names who plays now
    }
    picked = []; th = null;
    paintHud();
  }
  const local = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  box.addEventListener('pointerdown', (e) => {
    if (quit || !geo || phase === 'over' || phase === 'after' || phase === 'pass' || e.target.closest('button')) return;
    e.preventDefault();
    const q = local(e), hd = geo.hand, onHand = Math.hypot(q.x - hd.x, q.y - hd.y) < 76 || q.y > hd.y - 40;
    if (phase === 'ready') { if (onHand) newThrow(); else { setTip('קודם זורקים: הקש על היד'); sfx('m3bad'); } return; }
    // in the air: a bone on the mat, or the hand
    if (!onHand) {
      let best = -1, bd = 1e9;
      bones.forEach((b, i) => { if (!b.on || picked.includes(i)) return; const p = boneXY(b), d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = i; } });
      if (best < 0 || bd > Math.max(34, geo.s * 0.75)) return;
      if (picked.length >= need(P[turn])) { setTip('מספיק — עכשיו תפוס!'); return; }
      picked.push(best); sfx('tap'); fly.push({ i: best, t0: performance.now() });
      if (picked.length >= need(P[turn])) setTip('עכשיו תפוס — כשהיא בטבעת!');
      return;
    }
    if (th.t < th.closedTill) return;
    const c = judgeCatch(th.t / th.T);
    if (c === 'early') { th.closedTill = th.t + CLOSE; setTip('עוד לא — חכה שתרד אל הטבעת'); return; }
    endThrow(c);
  });
  const x = L.bot.el.querySelector('[data-exit]');
  if (x) x.addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(); } });
  box.__g10 = {
    state: () => {
      const r = cv.getBoundingClientRect(), pg = (p) => ({ x: r.left + p.x, y: r.top + p.y }), p = P[turn];
      const u = th ? th.t / th.T : 0, R = geo ? ring() : null;
      return {
        phase, turn, round: p.round, group: p.group, need: need(p), picked: picked.length, u, flight: th ? th.T : flightOf(p),
        catchable: !!th && judgeCatch(u) !== 'early' && u < U_CLOTH && th.t >= th.closedTill, over: phase === 'over',
        hand: geo ? pg(geo.hand) : null, stone: geo ? pg(stoneXY()) : null, ring: R ? { y0: r.top + R.y0, y1: r.top + R.y1 } : null,
        bones: geo ? bones.map((b, i) => (b.on && !picked.includes(i) ? pg(boneXY(b)) : null)) : [],
        players: P.map((q) => ({ round: q.round, group: q.group, misses: q.misses, perfect: q.perfect, throws: q.throws })),
      };
    },
  };
  let last = performance.now();
  function frame() {
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!geo || !geo.W) layout();
    if (th && phase === 'air' && !quit) { th.t += dt; if (th.t / th.T >= U_CLOTH) endThrow('drop'); }
    if (phase === 'after' && now - after > (reduced ? 500 : 950)) {
      closed = false;
      if (passing) {   // the card passes the phone; the next player taps "מוכן" when it is in his hands
        passing = false; phase = 'pass';
        const o = P[1 - turn];
        S.card(`<h2>תור ${names[turn]}</h2><p>${names[1 - turn]} הגיע ל${ROUNDS[Math.min(3, o.round)].name}${o.round < ROUNDS.length ? ` (${o.group + 1} מתוך ${ROUNDS[o.round].groups.length})` : ''}. עכשיו ${names[turn]} — מהמקום שלו.</p>`, [{ value: 'go', label: 'מוכן', gold: true }])
          .then(() => { if (!quit) { phase = 'ready'; setTip(`${names[turn]}: הקש על היד כדי לזרוק`); paintHud(); } });
      } else { phase = 'ready'; setTip(duel ? `${names[turn]}: הקש על היד כדי לזרוק` : 'הקש על היד כדי לזרוק'); paintHud(); }
    }
    const { w, h: hh, g } = fitCanvas(cv);
    if (Math.abs(w - geo.W) > 1 || Math.abs(hh - geo.H) > 1) layout();
    const m = geo.mat;   // (the plaza and the mat never move: one cached layer)
    g.drawImage(layer('kn-plaza', w, hh, `${m.x0},${m.y0},${m.x1},${m.y1}`, (c) => { plaza(c, w, hh); mat(c, m.x0, m.y0, m.x1, m.y1); }), 0, 0, w, hh);
    // the gold ring where the bone is caught (while it flies)
    const R = ring(), hd = geo.hand;
    if (th) { const hot = judgeCatch(th.t / th.T) !== 'early'; g.strokeStyle = hot ? 'rgba(255,214,90,.95)' : 'rgba(255,236,170,.5)'; g.lineWidth = hot ? 5 : 3; g.beginPath(); g.ellipse(hd.x, R.mid, 46, 16, 0, 0, 6.2832); g.stroke(); }
    // the bones on the mat, and those flying to the hand
    bones.forEach((b, i) => {
      if (!b.on) return;
      const p = boneXY(b), f = fly.find((q) => q.i === i && picked.includes(i));
      if (picked.includes(i)) {
        const k = f && !reduced ? Math.min(1, (now - f.t0) / 220) : 1;
        if (k < 1) bone(g, p.x + (hd.x - p.x) * k, p.y + (hd.y - p.y) * k, geo.s * (1 - 0.4 * k), b.rot);
        return;
      }
      g.fillStyle = 'rgba(60,30,8,.25)'; g.beginPath(); g.ellipse(p.x + 3, p.y + geo.s * 0.24, geo.s * 0.46, geo.s * 0.12, 0, 0, 6.2832); g.fill();
      bone(g, p.x, p.y, geo.s, b.rot, false, !!th && picked.length < need(P[turn]));
    });
    fly = fly.filter((f) => now - f.t0 < 400);
    handShape(g, hd.x, hd.y, Math.max(54, geo.s * 1.15), closed && !th);
    if (picked.length) { g.fillStyle = '#4A2A0A'; g.font = '900 17px "Heebo", sans-serif'; g.textAlign = 'center'; g.fillText('●'.repeat(picked.length), hd.x, hd.y + geo.s * 0.95 + 6); }
    // the golden bone: in the hand, or in the air with its shadow on the plaza
    const st = stoneXY();
    if (th) { const k = heightAt(th.t / th.T); g.fillStyle = `rgba(60,30,8,${0.12 + 0.1 * (1 - Math.max(0, k))})`; g.beginPath(); g.ellipse(hd.x, hd.y + 30, 24 * (1 - 0.5 * Math.max(0, k)), 7, 0, 0, 6.2832); g.fill(); }
    if (phase !== 'over' || !th) bone(g, st.x, st.y, geo.s * 0.92, th && !reduced ? th.t * 7 : -0.2, true, true);
    raf = requestAnimationFrame(frame);
  }
  await sleep(30);
  layout(); paintHud();
  if (duel) setTip(`${names[turn]} מתחיל: הקש על היד כדי לזרוק`);
  raf = requestAnimationFrame(frame);
  try {
    await done;
    if (quit) return { quit: true };
    const prog = (p) => p.round * 10 + p.group;
    const winner = !duel ? 0 : P[0].round >= ROUNDS.length ? 0 : P[1].round >= ROUNDS.length ? 1 : prog(P[0]) === prog(P[1]) ? -1 : prog(P[0]) > prog(P[1]) ? 0 : 1;
    await sleep(reduced ? 150 : 350);
    return { winner, misses: [P[0].misses, P[1].misses], perfect: [P[0].perfect, P[1].perfect], throws: duel ? P[0].throws + P[1].throws : P[0].throws, rounds: [P[0].round, P[1].round] };
  } finally { cancelAnimationFrame(raf); }
}
export { run };
