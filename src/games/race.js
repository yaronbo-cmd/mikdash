/* ─────────────────────────────────────────────────────────────────────────────
 * games/race.js — (GAMES10) "מרוץ הכבש": the classic tap race, dressed as the kohanim's race up the altar's ramp at dawn
 * (משנה יומא ב, א: "רָצִין וְעוֹלִין בַּכֶּבֶשׁ, וְכָל הַקּוֹדֵם אֶת חֲבֵרוֹ בְאַרְבַּע אַמּוֹת זָכָה"; ברטנורא: the upper four amot, by
 * the altar's top). Told without its injury: they raced, and later the lots (פיס) were set (FACTS8B's f_guf_race).
 * Alternate the two big feet (ימין · שמאל): each change of foot is a step; the same foot twice only wobbles (no loss). The
 * first into the upper four amot takes the round; best of three. No clock: the "3, 2, 1" only starts a round.
 * Solo: a gentle kohen (a pace that follows yours a little; a child who runs usually wins). A duel: a split screen — each
 * player sees the race from his own end (his kohen in front), the top half turned 180°.
 *   run(S, { duel, sfx, rnd, reduced }) → { winner: 0 | 1, rounds:[a, b], quit }
 * Test hook: each half's __g10 = { state() } (the next foot, the steps, the phase).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, sleep, injectCSS, fitCanvas, PLAYERS } from './shell.js';

const STEPS = 40, ZONE = 35;          // the ramp is 32 amot (מדות ג, ג): the upper four begin at 28 → 28/32 of the steps
const CSS = `
.g10-scene{position:relative;flex:1;min-height:0}
.g10-scene canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-rh{position:absolute;top:8px;inset-inline-start:10px;inset-inline-end:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;z-index:2}
.g10-rh span{background:rgba(20,12,4,.62);border-radius:999px;padding:3px 10px;font:800 14px/1.3 "Heebo",sans-serif;color:#FFF3D6;white-space:nowrap}
.g10-rh span i{font-style:normal;color:#FFD66E}
.g10-cd{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:3;font:900 64px/1 "Frank Ruhl Libre","Heebo",serif;color:#FFF3C4;text-shadow:0 4px 0 rgba(60,30,0,.6),0 0 22px rgba(255,200,90,.8)}
.g10-cd.sm{font-size:40px}
.g10-feet{flex:none;display:flex;gap:12px;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 12px);direction:rtl}
.g10-half.g10-t .g10-feet{padding-bottom:calc(env(safe-area-inset-top,0px) + 12px)}
.g10-foot-b{flex:1;min-height:92px;border-radius:24px;border:2px solid rgba(255,226,160,.7);background:linear-gradient(#7A5028,#43260F);color:#FFF1D0;
 font:900 20px/1.2 "Heebo",sans-serif;box-shadow:0 5px 0 rgba(0,0,0,.4);touch-action:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.g10-foot-b svg{width:34px;height:34px}
.g10-foot-b.next{background:linear-gradient(#FFD569,#DF951A);color:#452300;border-color:#FFF3C4}
.g10-foot-b.hit{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.4)}
.g10-foot-b.wob{animation:g10wob .22s}
@keyframes g10wob{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.g10-foot-b[disabled]{opacity:.55}
@media (prefers-reduced-motion:reduce){.g10-foot-b.wob{animation:none}}
`;
export const FACTS = [   // FACTS8B's content/facts.json, word for word (ids kept); the first one always first
  { id: 'f_guf_race', he: 'בתחילה, מי שרצה לתרום את הדשן מן המזבח רץ במעלה הכבש, והקודם זכה. כשראו שזה מביא לידי סכנה, קבעו פיס — הגרלה.', ref: 'משנה יומא ב, א–ב' },
  { id: 'f_guf_ramp', he: 'לדרום המזבח עלה הכבש — מעין רמפה של אבן — שלושים ושתיים אמה אורכו ושש עשרה אמה רוחבו.', ref: 'משנה מדות ג, ג' },
  { id: 'f_guf_nosteps', he: 'התורה אסרה לעלות אל המזבח במדרגות — ״ולא תעלה במעלת על מזבחי״ — ולכן עלו אליו בכבש משופע.', ref: 'שמות כ, כג' },
  { id: 'f_lishka_payis', he: 'לשכת הגזית הייתה אולם גדול, כמין בסילקי. שם נערך הפיס: הכהנים עמדו סביב, והממונה נטל את המצנפת מראשו של אחד מהם — וממנו התחילו למנות.', ref: 'בבלי יומא כה, א' },
];
const FOOT = (flip) => `<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="currentColor"${flip ? ' transform="translate(40 0) scale(-1 1)"' : ''}><ellipse cx="21" cy="25" rx="7.5" ry="11"/><circle cx="14" cy="10" r="2.6"/><circle cx="19" cy="7.6" r="2.8"/><circle cx="24.5" cy="8" r="2.6"/><circle cx="28.6" cy="10.8" r="2.2"/><circle cx="31" cy="14.6" r="1.9"/></g></svg>`;

/* ───────── the scene ───────── */
function scene(g, w, hh, pos, me, names, t, lit) {
  const sky = g.createLinearGradient(0, 0, 0, hh);
  sky.addColorStop(0, '#26335E'); sky.addColorStop(0.55, '#8A6A86'); sky.addColorStop(0.85, '#F0B27A'); sky.addColorStop(1, '#F7D39A');
  g.fillStyle = sky; g.fillRect(0, 0, w, hh);
  const ground = hh * 0.86;
  g.fillStyle = '#CDB48A'; g.fillRect(0, ground, w, hh - ground);
  g.fillStyle = 'rgba(120,90,50,.35)'; for (let x = 0; x < w; x += 22) g.fillRect(x, ground, 1, hh - ground);
  // the House's façade beyond the altar, a pale silhouette at dawn; the Ulam's gate has no doors (מדות ב, ג) — a warm opening
  { const bt = Math.max(hh * 0.06, ground - w * 1.1), fh = ground - bt, bw = Math.min(w * 0.62, fh * 0.9);   // (it towers over the altar: 100 amot to its ~9)
    g.fillStyle = 'rgba(240,228,204,.26)'; g.fillRect(0, bt, bw, fh);
    g.fillStyle = 'rgba(255,214,120,.34)'; g.fillRect(bw * 0.4, bt + fh * 0.1, bw * 0.2, fh * 0.4); }
  // the altar (left) — whitewashed, the red line at its middle (מדות ג, א), the horns and the pyre's glow on top
  const ax0 = w * 0.03, ax1 = w * 0.31, aTop = Math.max(hh * 0.3, ground - (w * 0.59) * 0.62);   // a ramp, not a stair: its rise ≤ ~32°
  g.fillStyle = '#EDE6D6'; g.fillRect(ax0, aTop, ax1 - ax0, ground - aTop);
  g.fillStyle = 'rgba(150,130,100,.35)'; for (let y = aTop + 14; y < ground; y += 14) g.fillRect(ax0, y, ax1 - ax0, 1);
  g.fillStyle = '#B3352B'; g.fillRect(ax0, (aTop + ground) / 2 - 1.5, ax1 - ax0, 3);
  g.fillStyle = '#E4DCCB'; const hs = (ax1 - ax0) * 0.14; g.fillRect(ax0, aTop - hs, hs, hs); g.fillRect(ax1 - hs, aTop - hs, hs, hs);
  const fx = (ax0 + ax1) / 2, fy = aTop - 2, fl = 0.8 + 0.2 * Math.sin(t / 130);
  const glow = g.createRadialGradient(fx, fy, 2, fx, fy, (ax1 - ax0) * 0.7);
  glow.addColorStop(0, `rgba(255,214,120,${0.75 * fl})`); glow.addColorStop(1, 'rgba(255,150,60,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(fx, fy, (ax1 - ax0) * 0.7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFB347'; g.beginPath(); g.moveTo(fx - 16, fy); g.quadraticCurveTo(fx - 4, fy - 26 * fl, fx, fy - 34 * fl); g.quadraticCurveTo(fx + 6, fy - 22 * fl, fx + 16, fy); g.closePath(); g.fill();
  // the ramp: from the ground (right) up to the altar's top (left)
  const r0 = { x: w * 0.9, y: ground }, r1 = { x: ax1, y: aTop };
  const th = hh * 0.1;
  g.fillStyle = '#D9CFB8'; g.beginPath(); g.moveTo(r0.x, r0.y); g.lineTo(r1.x, r1.y); g.lineTo(r1.x, r1.y + th); g.lineTo(r0.x - th * 1.6, ground); g.closePath(); g.fill();
  g.fillStyle = '#E9E1CF'; g.beginPath(); g.moveTo(r0.x, r0.y); g.lineTo(r1.x, r1.y); g.lineTo(r1.x, ground); g.lineTo(r0.x - th * 1.6, ground); g.closePath(); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1;
  // the upper four amot, by the altar's top: a gold band on the ramp
  const at = (p) => ({ x: r0.x + (r1.x - r0.x) * p, y: r0.y + (r1.y - r0.y) * p });
  const z0 = at(ZONE / STEPS), z1 = at(1);
  g.strokeStyle = lit ? 'rgba(255,214,90,.95)' : 'rgba(255,214,90,.7)'; g.lineWidth = 6; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(z0.x, z0.y); g.lineTo(z1.x, z1.y); g.stroke();
  g.fillStyle = '#FFF3C4'; g.font = '800 12px Heebo, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl';
  g.fillText('ארבע האמות', (z0.x + z1.x) / 2, Math.min(z0.y, z1.y) - 26);
  // the two kohanim: the far one first (smaller, behind), then yours in front
  const order = [1 - me, me];
  for (const i of order) {
    const near = i === me, p = Math.min(1, pos[i] / STEPS), q = at(p);
    const sc = (near ? 1 : 0.82) * Math.max(0.6, (hh > w * 1.4 ? 0.55 : 0.42) * (ground - aTop) / 62), dx = near ? 0 : -6 * sc, dy = near ? 0 : -8 * sc;   // a kohen ≈ 2/5 of the altar's height (a little more on a tall screen)
    kohen(g, q.x + dx, q.y + dy - 2, sc, PLAYERS[i].color, pos[i], near);
    g.font = `800 ${Math.round(12 + 2 * sc)}px Heebo, sans-serif`;
    const nm = names[i], tw = g.measureText(nm).width + 12, ty = q.y + dy - 62 * sc - (near ? 4 : 40);   // (the far one's plate a row above: never over the near one's)
    const tx = Math.max(tw / 2 + 4, Math.min(w - tw / 2 - 4, q.x + dx));   // (the plate stays on screen at the ramp's foot)
    g.fillStyle = near ? PLAYERS[i].color : 'rgba(20,12,4,.6)'; roundRect(g, tx - tw / 2, ty - 13, tw, 18, 9); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillText(nm, tx, ty + 1);
  }
}
/* (PRODUCER10 N23) a tall screen (alone, portrait): the ramp seen from its foot, rising away to the altar — the two kohanim run
   side by side in two lanes, bigger near you and smaller up the ramp; the House's façade over the altar; the screen is filled */
function sceneTall(g, w, hh, pos, me, names, t, lit) {
  const sky = g.createLinearGradient(0, 0, 0, hh);
  sky.addColorStop(0, '#26335E'); sky.addColorStop(0.45, '#8A6A86'); sky.addColorStop(0.62, '#F0B27A'); sky.addColorStop(1, '#F7D39A');
  g.fillStyle = sky; g.fillRect(0, 0, w, hh);
  const yA = hh * 0.3, yB = hh * 0.43, bot = hh * 0.985, cx = w / 2;
  // the House's façade beyond the altar (pale); the Ulam's gate has no doors (מדות ב, ג) — a warm opening
  g.fillStyle = 'rgba(240,228,204,.3)'; g.fillRect(w * 0.16, hh * 0.035, w * 0.68, yB - hh * 0.035);
  g.fillStyle = 'rgba(255,214,120,.36)'; g.fillRect(cx - w * 0.08, hh * 0.07, w * 0.16, (yB - hh * 0.07) * 0.5);
  // the altar's face: whitewashed, the red line at its middle (מדות ג, א), the horns, the pyre's glow
  g.fillStyle = '#EDE6D6'; g.fillRect(w * 0.1, yA, w * 0.8, yB - yA);
  g.fillStyle = 'rgba(150,130,100,.35)'; for (let y = yA + 12; y < yB; y += 12) g.fillRect(w * 0.1, y, w * 0.8, 1);
  g.fillStyle = '#B3352B'; g.fillRect(w * 0.1, (yA + yB) / 2 - 1.5, w * 0.8, 3);
  g.fillStyle = '#E4DCCB'; const hs = w * 0.06; g.fillRect(w * 0.1, yA - hs, hs, hs); g.fillRect(w * 0.9 - hs, yA - hs, hs, hs);
  const fl = 0.8 + 0.2 * Math.sin(t / 130), glow = g.createRadialGradient(cx, yA, 2, cx, yA, w * 0.3);
  glow.addColorStop(0, `rgba(255,214,120,${0.75 * fl})`); glow.addColorStop(1, 'rgba(255,150,60,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(cx, yA, w * 0.3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFB347'; g.beginPath(); g.moveTo(cx - 22, yA); g.quadraticCurveTo(cx - 6, yA - 34 * fl, cx, yA - 44 * fl); g.quadraticCurveTo(cx + 8, yA - 30 * fl, cx + 22, yA); g.closePath(); g.fill();
  // the ramp: wide at your feet, narrowing to the altar's top
  const top = { y: yA + 4, l: cx - w * 0.2, r: cx + w * 0.2 }, foot = { y: bot, l: w * 0.02, r: w * 0.98 };
  const at = (p) => { const y = foot.y + (top.y - foot.y) * p, l = foot.l + (top.l - foot.l) * p, r = foot.r + (top.r - foot.r) * p; return { y, l, r }; };
  g.fillStyle = '#E6DDCA'; g.beginPath(); g.moveTo(foot.l, foot.y); g.lineTo(top.l, top.y); g.lineTo(top.r, top.y); g.lineTo(foot.r, foot.y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(140,120,90,.3)'; g.lineWidth = 1;
  for (let k = 1; k < 16; k++) { const q = at(1 - Math.pow(1 - k / 16, 1.6)); g.beginPath(); g.moveTo(q.l, q.y); g.lineTo(q.r, q.y); g.stroke(); }
  // the upper four amot: a gold band across the ramp by the altar
  const z0 = at(ZONE / STEPS), z1 = at(1);
  g.fillStyle = lit ? 'rgba(255,214,90,.75)' : 'rgba(255,214,90,.5)'; g.beginPath(); g.moveTo(z0.l, z0.y); g.lineTo(z1.l, z1.y); g.lineTo(z1.r, z1.y); g.lineTo(z0.r, z0.y); g.closePath(); g.fill();
  g.fillStyle = '#5A300A'; g.font = '800 13px Heebo, sans-serif'; g.textAlign = 'center'; g.direction = 'rtl';
  g.fillText('ארבע האמות', cx, (z0.y + z1.y) / 2 + 5);
  // the two kohanim, side by side: yours in the right lane (the far one first, so the nearer is drawn over)
  const lane = (i) => (i === me ? 0.72 : 0.28);
  const order = [0, 1].sort((a, b) => Math.min(1, pos[b] / STEPS) - Math.min(1, pos[a] / STEPS));   // the one further up first
  for (const i of order) {
    const p = Math.min(1, pos[i] / STEPS), q = at(p), x = q.l + (q.r - q.l) * lane(i), sc = (w / 170) * (1.25 - 0.62 * p);
    kohenBack(g, x, q.y - 4, sc, PLAYERS[i].color, pos[i]);
    g.font = `800 ${Math.round(12 + 1.5 * sc)}px Heebo, sans-serif`;
    const nm = names[i], tw = g.measureText(nm).width + 12, ty = q.y - 66 * sc - 8;
    g.fillStyle = i === me ? PLAYERS[i].color : 'rgba(20,12,4,.6)'; roundRect(g, x - tw / 2, ty - 13, tw, 18, 9); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillText(nm, x, ty + 1);
  }
}
/* a kohen seen from behind, running up: the white robe and turban, the belt in the player's colour, barefoot */
function kohenBack(g, x, y, s, belt, step) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const ph = step % 2 ? 1 : -1;
  g.strokeStyle = '#C99E7C'; g.lineWidth = 3.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-3, -16); g.lineTo(-4, -2 + 4 * ph); g.moveTo(3, -16); g.lineTo(4, -2 - 4 * ph); g.stroke();   // the legs
  g.fillStyle = '#FFFFFF'; g.strokeStyle = 'rgba(90,80,60,.45)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-10, -14); g.lineTo(10, -14); g.lineTo(7, -44); g.lineTo(-7, -44); g.closePath(); g.fill(); g.stroke();   // the robe
  g.fillStyle = belt; g.fillRect(-8, -31, 16, 3.6);                                                                               // the belt
  g.strokeStyle = '#F4F1EA'; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(-6, -41); g.lineTo(-12, -30 + 6 * ph); g.moveTo(6, -41); g.lineTo(12, -30 - 6 * ph); g.stroke();       // the sleeves
  g.fillStyle = '#D9B08C'; g.beginPath(); g.arc(0, -49, 5, 0, Math.PI * 2); g.fill();                                              // the neck and head
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(0, -52, 6.6, 5.2, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(90,80,60,.4)'; g.stroke();   // the turban
  g.restore();
}
function roundRect(g, x, y, w, hh, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/* a kohen in white (the robe, the turban), barefoot; the belt in the player's colour; he leans left, up the ramp */
function kohen(g, x, y, s, belt, step, near) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const ph = step % 2 ? 1 : -1;
  g.strokeStyle = '#C99E7C'; g.lineWidth = 3.4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -18); g.lineTo(-7 * ph, 0); g.moveTo(0, -18); g.lineTo(6 * ph, -1); g.stroke();       // the legs
  g.fillStyle = near ? '#FFFFFF' : '#F1EEE8'; g.strokeStyle = 'rgba(90,80,60,.5)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(-9, -16); g.lineTo(9, -16); g.lineTo(5, -44); g.lineTo(-7, -44); g.closePath(); g.fill(); g.stroke();   // the robe
  g.fillStyle = belt; g.fillRect(-7.5, -31, 14, 3.4);                                                                          // the belt
  g.strokeStyle = '#F4F1EA'; g.lineWidth = 3.2;
  g.beginPath(); g.moveTo(-1, -40); g.lineTo(-10, -32 - 5 * ph); g.moveTo(1, -40); g.lineTo(9, -34 + 5 * ph); g.stroke();      // the sleeves
  g.fillStyle = '#D9B08C'; g.beginPath(); g.arc(-2, -50, 5.2, 0, Math.PI * 2); g.fill();                                          // the face
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(-1.5, -55, 6.4, 4.2, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(90,80,60,.4)'; g.stroke();   // the turban
  g.restore();
}
export function icon(g, s) {
  const w = s, hh = s;
  const sky = g.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#26335E'); sky.addColorStop(1, '#F0B27A');
  g.fillStyle = sky; roundRect(g, 0, 0, w, hh, s * 0.2); g.fill();
  g.fillStyle = '#EDE6D6'; g.fillRect(4, hh * 0.35, w * 0.3, hh * 0.6);
  g.fillStyle = '#B3352B'; g.fillRect(4, hh * 0.64, w * 0.3, 2);
  g.fillStyle = '#E9E1CF'; g.beginPath(); g.moveTo(w - 3, hh - 3); g.lineTo(w * 0.34, hh * 0.35); g.lineTo(w * 0.34, hh - 3); g.closePath(); g.fill();
  kohen(g, w * 0.64, hh * 0.68, 0.62, PLAYERS[0].color, 1, true);
  kohen(g, w * 0.5, hh * 0.55, 0.52, PLAYERS[1].color, 0, false);
}

export const GAME = {
  id: 'race', title: 'מרוץ הכבש', sub: 'הכהנים רצים במעלה הכבש אל המזבח', chip: 'לבד מול כהן · או שניים', pay: { silver: 10 },
  how: [
    'הקישו לסירוגין: ימין, שמאל, ימין… כל החלפה — צעד במעלה הכבש.',
    'מי שנכנס ראשון לארבע האמות העליונות, ליד ראש המזבח — זוכה בסיבוב.',
    'שלושה סיבובים; שניים מהם מנצחים. בלי שעון — רק ״רוצו!״.',
  ],
  quote: { he: 'רָצִין וְעוֹלִין בַּכֶּבֶשׁ, וְכָל הַקּוֹדֵם אֶת חֲבֵרוֹ בְאַרְבַּע אַמּוֹת זָכָה', src: 'משנה יומא ב, א' },
  solo: 'לבד — מול כהן עדין', soloSub: 'הוא רץ בקצב נוח; אתה בתכלת',
  icon,
  facts: FACTS,
  run,
};

async function run(S, ctx) {
  const { duel, sfx = () => {}, rnd = Math.random, reduced } = ctx;
  injectCSS('g10-race-css', CSS);
  const L = S.splitLayout(duel);
  const names = duel ? [PLAYERS[0].name, PLAYERS[1].name] : ['אתה', 'הכהן השני'];
  const pos = [0, 0], last = [null, null], wins = [0, 0];
  let phase = 'wait', raf = 0, quit = false, roundEnd = null, winner = -1, t0 = 0, ai = 0, lastAI = 0;
  const views = L.halves.map((half, k) => {
    const me = k;   // the bottom half is player 0; the top half (a duel) is player 1
    const sc = h('div', 'g10-scene'); const cv = document.createElement('canvas'); sc.appendChild(cv);
    const rh = h('div', 'g10-rh'); sc.appendChild(rh);
    const cd = h('div', 'g10-cd'); sc.appendChild(cd);
    const feet = h('div', 'g10-feet');
    const mk = (f, label) => { const b = h('button', 'g10-foot-b', `${FOOT(f === 'L')}<span>${label}</span>`); b.type = 'button'; b.dataset.foot = f; b.setAttribute('aria-label', `רגל ${label}`); return b; };
    const R = mk('R', 'ימין'), Lf = mk('L', 'שמאל');
    feet.append(R, Lf);
    if (!duel && k === 0) { const x = h('button', 'g10-x', 'יציאה'); x.type = 'button'; x.dataset.exit = '1'; x.style.cssText = 'position:absolute;bottom:10px;inset-inline-start:10px;z-index:4'; sc.appendChild(x); }
    if (duel && k === 0) { const x = h('button', 'g10-x', 'יציאה'); x.type = 'button'; x.dataset.exit = '1'; x.style.cssText = 'position:absolute;top:6px;inset-inline-end:10px;z-index:4'; sc.appendChild(x); }   // (N20: beside his own chip, far from the feet)
    half.append(sc, feet);
    const v = { me, half, cv, rh, cd, feet, btn: { R, L: Lf } };
    for (const b of [R, Lf]) b.addEventListener('pointerdown', (e) => { e.preventDefault(); step(me, b.dataset.foot, b); });
    half.__g10 = { state: () => ({ me, phase, steps: pos[me], other: pos[1 - me], next: last[me] === 'R' ? 'L' : last[me] === 'L' ? 'R' : 'any', wins: wins.slice() }) };
    return v;
  });
  const exitB = L.root.querySelector('[data-exit]');
  let exitRes = null;
  if (exitB) exitB.addEventListener('click', async () => { phase = phase === 'run' ? 'hold' : phase; if (await S.confirm('לצאת מהמרוץ?')) { quit = true; if (roundEnd) roundEnd(-2); if (exitRes) exitRes(); } else if (phase === 'hold') phase = 'run'; });
  function hud() {
    for (const v of views) {
      // (PRODUCER10 N20) a duel: one chip per player, in his own half (the other's is in the other half); alone: both
      v.rh.innerHTML = duel ? `<span>${names[v.me]} · <i>${wins[v.me]}</i> ${wins[v.me] === 1 ? 'סיבוב' : 'סיבובים'}</span>` : `<span>${names[0]} · <i>${wins[0]}</i></span><span>${names[1]} · <i>${wins[1]}</i></span>`;
      const nx = last[v.me] === 'R' ? 'L' : last[v.me] === 'L' ? 'R' : null;
      v.btn.R.classList.toggle('next', phase === 'run' && nx !== 'L');
      v.btn.L.classList.toggle('next', phase === 'run' && nx !== 'R');
    }
  }
  function step(p, f, b) {
    if (phase !== 'run' || quit) return;
    b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 90);
    if (last[p] === f) { b.classList.remove('wob'); void b.offsetWidth; b.classList.add('wob'); return; }   // the same foot: a wobble, no step
    last[p] = f; pos[p]++;
    if (pos[p] % 4 === 0) sfx('pop');
    hud();
    if (pos[p] >= ZONE && roundEnd) roundEnd(p);
  }
  function draw() {
    const t = performance.now();
    if (!duel && phase === 'run') {   // the gentle kohen: a steady pace that follows the child's a little
      const dt = Math.min(0.1, (t - (lastAI || t)) / 1000); lastAI = t;
      const rate = Math.max(3.0, Math.min(5.0, 3.8 + 0.1 * (pos[0] - pos[1])));   // (a child alternating ~4 taps a second wins)
      ai += rate * dt * (0.9 + 0.2 * rnd());
      while (ai >= 1) { ai -= 1; pos[1]++; last[1] = last[1] === 'R' ? 'L' : 'R'; if (pos[1] >= ZONE && roundEnd) roundEnd(1); }
    }
    for (const v of views) {
      const { w, h: hh, g } = fitCanvas(v.cv);
      (hh > w * 1.15 ? sceneTall : scene)(g, w, hh, pos, v.me, names, t, winner >= 0);
    }
    raf = requestAnimationFrame(draw);
  }
  await sleep(30);
  raf = requestAnimationFrame(draw);
  const say = (txt, sm) => { for (const v of views) { v.cd.textContent = txt; v.cd.classList.toggle('sm', !!sm); } };
  try {
    let round = 0;
    while (!quit && wins[0] < 2 && wins[1] < 2 && round < 7) {
      round++;
      pos[0] = pos[1] = 0; last[0] = last[1] = null; winner = -1; ai = 0; lastAI = 0; phase = 'wait'; hud();
      for (const n of ['3', '2', '1']) { if (quit) break; say(n); sfx('ui'); await sleep(reduced ? 350 : 650); }
      if (quit) break;
      say('רוצו!', true); sfx('whoosh'); phase = 'run'; t0 = performance.now(); hud();
      setTimeout(() => { if (phase === 'run') say(''); }, 600);
      const w = await new Promise((res) => { roundEnd = (p) => { roundEnd = null; res(p); }; });
      if (w === -2 || quit) break;
      phase = 'end'; winner = w;
      wins[w]++; hud(); sfx(w === 0 || duel ? 'chime' : 'pop', { combo: 3 });
      for (const v of views) S.toast(v.half, v.me === w ? '<b>ראשון לארבע האמות!</b>זכית בסיבוב' : `<b>כמעט יחד!</b>${names[w]} הקדים הפעם`, reduced ? 1100 : 1500);
      await sleep(reduced ? 1200 : 1700);
      say('');
    }
    if (quit) return { quit: true };
    return { winner: wins[0] > wins[1] ? 0 : 1, rounds: wins.slice(), ms: performance.now() - t0 };
  } finally {
    cancelAnimationFrame(raf);
  }
}
