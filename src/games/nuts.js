/* ─────────────────────────────────────────────────────────────────────────────
 * games/nuts.js — (GAMES13, wave 13) "מגדל האגוזים": children played with nuts — the shopkeeper who hands nuts to children (משנה
 * בבא מציעא ד, יב), the nuts Rabbi Akiva gave the children on Pesach eve so they would stay awake and ask (בבלי פסחים קט, א). The
 * game here — a small tower of nuts toppled by a nut rolled at it, as Roman-era children played — is an illustration (המחשה).
 * A courtyard in Jerusalem, afternoon: drag back from anywhere and let go — the nut is flicked along the paving (a flat pull
 * rolls it, a pull down lobs it over). Five courtyards, three nuts each; the dots show the path on the first nut. Physics:
 * matter-js 0.20.0 (the sling's vendored copy). Nothing is won from anyone: the towers are the game's own.
 *   run(S, { level, duel, first, sfx, reduced }) → { won, used, down, targets, level, winner, quit }
 *   makeWorld(level) · stepWorld(W) · launch(W, v) · plan(W, i) · aimPoint(W, i) — node-safe (test/games13-rules.test.mjs)
 * Test hook: `.g10-nuts` carries __g10 = { state(), aimAt(i) } (page CSS px).
 * ──────────────────────────────────────────────────────────────────────────── */
import Matter from './vendor/matter.min.js';
import { h, sleep, injectCSS, fitCanvas, PLAYERS, layer } from './shell.js';

const { Engine, Bodies, Body, Composite } = Matter;
export const WW = 400, WH = 640, GROUND = 560;
export const R_NUT = 11, R_SHOT = 12;
export const ANCHOR = { x: 350, y: GROUND - R_SHOT - 0.5 };   // the shooter nut at rest, at the right (RTL: you flick toward the left)
export const MAXPULL = 96, VMAX = 12.5, FA = 0.006, G_STEP = 0.001 * (1000 / 60) * (1000 / 60);
export const NUTS = 3, DOTS_FOR = 1;
export const TUNE = { f: 0.45, fs: 0.9, shot: 0.006 };
const NUT_F = TUNE.f, NUT_FS = TUNE.fs;

/* the courtyards: towers [x, base y, kind] — 'small' (two nuts, one on top: the tower as seen from the side), 'big' (3·2·1);
   steps [x, y top, w, h] (stone steps a tower may stand on) */
const C = (n, towers, steps = [], o = {}) => ({ n, towers, steps, ...o });
export const LEVELS = [
  C('מגדל אחד', [[150, GROUND, 'small']]),
  C('שני מגדלים', [[112, GROUND, 'small'], [218, GROUND, 'small']]),
  C('על המדרגה', [[120, GROUND - 30, 'small'], [232, GROUND, 'small']], [[120, GROUND - 30, 84, 30]], { tip: 'מגדל על מדרגה? משוך קצת למטה — האגוז יקפוץ' }),
  C('המגדל הגדול', [[150, GROUND, 'big']]),
  C('שלושה מגדלים', [[70, GROUND, 'small'], [150, GROUND, 'small'], [236, GROUND, 'small']]),
];
export const levelCount = LEVELS.length;
const lvDef = (lv) => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (lv | 0) - 1))];

export function makeWorld(lv) {
  const def = lvDef(lv);
  const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
  engine.gravity.y = 1;
  const W = { lv, def, engine, nuts: [], towers: [], shots: [], t: 0, steps: 0, hist: [], down: 0, used: 0, events: [] };
  const add = (b) => { Composite.add(engine.world, b); return b; };
  add(Bodies.rectangle(WW / 2, GROUND + 60, WW * 4, 120, { isStatic: true, friction: 0.6, label: 'ground' }));
  for (const [x, top, w, hh] of def.steps) add(Bodies.rectangle(x, top + hh / 2, w, hh, { isStatic: true, friction: 0.8, label: 'step' }));
  const nut = (x, y) => { const b = Bodies.polygon(x, y, 8, R_NUT, { density: 0.0012, friction: NUT_F, frictionStatic: NUT_FS, restitution: 0.05, label: 'nut' }); W.nuts.push(b); return add(b); };
  const d = R_NUT * 2 * 0.96, dy = R_NUT * 1.72;
  for (const [x, base, kind] of def.towers) {
    const rows = kind === 'big' ? [3, 2, 1] : [2, 1];
    const T = { x, base, kind, nuts: [], top: null, down: false };
    rows.forEach((n, r) => { for (let i = 0; i < n; i++) T.nuts.push(nut(x + (i - (n - 1) / 2) * d, base - R_NUT - 0.5 - r * dy)); });
    T.top = T.nuts[T.nuts.length - 1];
    W.towers.push(T);
  }
  // the towers settle before they are shown (held still), then sleep until a nut wakes them
  for (const b of W.nuts) Body.setStatic(b, true);
  for (let i = 0; i < 30; i++) Engine.update(engine, 1000 / 60);
  for (const b of W.nuts) { Body.setStatic(b, false); Body.setVelocity(b, { x: 0, y: 0 }); Body.setAngularVelocity(b, 0); }
  for (let i = 0; i < 40; i++) Engine.update(engine, 1000 / 60);
  for (const T of W.towers) { T.y0 = T.top.position.y; T.x0 = T.top.position.x; }
  for (const b of W.nuts) Matter.Sleeping.set(b, true);
  return W;
}
/** one physics step (1/60 s) → the events ({k:'hit'|'down'}) */
export function stepWorld(W) {
  Engine.update(W.engine, 1000 / 60);
  W.t += 1 / 60; W.steps++;
  const ev = W.events; W.events = [];
  for (const s of W.shots) {
    s.t += 1 / 60;
    const b = s.b, sp = Math.hypot(b.velocity.x, b.velocity.y);
    if (!s.gone && (b.position.x < -60 || b.position.x > WW + 60 || s.t > 7 || (s.t > 1.2 && sp < 0.05))) { s.gone = s.t > 7 || b.position.x < -60 || b.position.x > WW + 60; s.still = true; }
    if (!s.hit) for (const T of W.towers) for (const n of T.nuts) if (Math.hypot(n.position.x - b.position.x, n.position.y - b.position.y) < R_NUT + R_SHOT + 1.5) { s.hit = true; ev.push({ k: 'hit', x: n.position.x, y: n.position.y, sp }); }
  }
  for (const T of W.towers) {
    if (T.down) continue;
    const p = T.top.position;
    if (p.y - T.y0 > R_NUT * 0.7 || Math.abs(p.x - T.x0) > R_NUT * 1.6) { T.down = true; W.down++; ev.push({ k: 'down', x: T.x, y: T.y0 - 20 }); }
  }
  return ev;
}
export const allDown = (W) => W.towers.every((T) => T.down);
export function velOf(pull) {
  const l = Math.hypot(pull.x, pull.y), k = Math.min(1, MAXPULL / Math.max(1e-6, l));
  return { x: -pull.x * k * (VMAX / MAXPULL), y: -pull.y * k * (VMAX / MAXPULL) };
}
export function launch(W, v) {
  const b = Bodies.circle(ANCHOR.x, ANCHOR.y, R_SHOT, { density: TUNE.shot, restitution: 0.15, friction: 0.08, frictionStatic: 0.2, frictionAir: FA, label: 'shot' });
  Composite.add(W.engine.world, b);
  Body.setVelocity(b, v);
  W.shots.push({ b, t: 0 });
  W.hist.push({ at: W.steps, v: { x: v.x, y: v.y } });
  W.used++;
  return b;
}
/** the flight a nut would take if nothing stopped it (the dots, and the solver): [{x, y}] until it meets the floor */
export function arc(v, steps = 160) {
  const out = []; let x = ANCHOR.x, y = ANCHOR.y, vx = v.x, vy = v.y;
  for (let i = 0; i < steps; i++) {
    vx *= 1 - FA; vy = vy * (1 - FA) + G_STEP; x += vx; y += vy;
    if (y > ANCHOR.y) { y = ANCHOR.y; vy = 0; }   // on the floor it rolls
    out.push({ x, y });
    if (x < -30) break;
  }
  return out;
}
/** where to aim at a standing tower: the middle of its lowest row (a roll) or its top (a lob) */
export function aimPoint(W, i, lob = false) {
  const T = W.towers[i]; if (!T || T.down) return null;
  if (lob) return { x: T.top.position.x, y: T.top.position.y };
  const low = T.nuts.slice().sort((a, b) => b.position.y - a.position.y || b.position.x - a.position.x)[0];
  return { x: low.position.x + R_NUT, y: low.position.y };
}
/** the planner (tests, the touch hand): replays this courtyard's nuts so far, then tries pulls on a copy until one fells standing
    tower i (the most towers first) → {x, y} (world units) | null. Deterministic: the same pulls at the same steps give the same world. */
export const PULLS = (() => { const o = []; for (const y of [8, 16, 24, 32, 0, 44, 56, 70]) for (const x of [96, 88, 80, 72, 64, 56]) o.push({ x, y }); return o; })();
export function plan(W, i) {
  if (!W.towers[i] || W.towers[i].down) return null;
  let best = null, bestN = 0;
  for (const pull of PULLS) {
    const C = makeWorld(W.lv);
    for (const hst of W.hist) { while (C.steps < hst.at) stepWorld(C); launch(C, hst.v); }
    while (C.steps < W.steps) stepWorld(C);
    launch(C, velOf(pull));
    for (let k = 0; k < 420 && !C.towers[i].down; k++) stepWorld(C);
    for (let k = 0; k < 90; k++) stepWorld(C);
    if (C.towers[i].down && C.down > bestN) { best = pull; bestN = C.down; if (C.down >= W.towers.length) break; }
  }
  return best;
}

export const FACTS = [   // drafts (טיוטה), each with its source; the quotes checked on Sefaria, 30.9
  { id: 'nu_akiva', he: 'אמרו על רבי עקיבא "שֶׁהָיָה מְחַלֵּק קְלָיוֹת וֶאֱגוֹזִין לְתִינוֹקוֹת בְּעֶרֶב פֶּסַח כְּדֵי שֶׁלֹּא יִשְׁנוּ, וְיִשְׁאֲלוּ".', ref: 'בבלי פסחים קט, א' },
  { id: 'nu_shop', he: 'רבי יהודה אומר: "לֹא יְחַלֵּק הַחֶנְוָנִי קְלָיוֹת וֶאֱגוֹזִין לַתִּינוֹקוֹת, מִפְּנֵי שֶׁהוּא מַרְגִּילָן לָבֹא אֶצְלוֹ" — וחכמים מתירין.', ref: 'משנה בבא מציעא ד, יב' },
  { id: 'nu_matza', he: 'רבי אליעזר אומר: "חוֹטְפִין מַצּוֹת בְּלֵילֵי פְּסָחִים בִּשְׁבִיל תִּינוֹקוֹת שֶׁלֹּא יִשְׁנוּ".', ref: 'בבלי פסחים קט, א' },
];

/* ───────── the drawing (canvas 2D, the games' warm look) ───────── */
function walnut(g, x, y, r, a = 0, shooter = false, glow = false) {
  g.save(); g.translate(x, y); g.rotate(a);
  if (glow) { g.shadowColor = 'rgba(255,226,120,.9)'; g.shadowBlur = 12; }
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r * 1.2);
  if (shooter) { gr.addColorStop(0, '#F6D38A'); gr.addColorStop(0.5, '#B9782E'); gr.addColorStop(1, '#6E3F12'); }
  else { gr.addColorStop(0, '#E8C48E'); gr.addColorStop(0.55, '#A87444'); gr.addColorStop(1, '#6A4222'); }
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, r, r * 0.94, 0, 0, 6.2832); g.fill();
  g.shadowBlur = 0; g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(70,40,14,.8)'; g.lineWidth = 1.2; g.stroke();
  g.strokeStyle = 'rgba(70,40,14,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -r * 0.92); g.quadraticCurveTo(r * 0.18, 0, 0, r * 0.92); g.stroke();   // the seam
  g.strokeStyle = 'rgba(70,40,14,.28)'; g.lineWidth = 1;
  for (const [sx, sy, e] of [[-0.45, -0.2, 0.4], [0.42, 0.25, -0.5], [-0.3, 0.45, 0.2], [0.38, -0.42, 0.8]]) { g.beginPath(); g.arc(sx * r, sy * r, r * 0.22, e, e + 2); g.stroke(); }
  g.restore();
}
function court(g, w, hh, s, ox, oy) {   // a Jerusalem courtyard in the afternoon: a wall with an arch, the paving
  const sky = g.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#9CC2E6'); sky.addColorStop(0.5, '#F2D7A6'); sky.addColorStop(1, '#E3C08A');
  g.fillStyle = sky; g.fillRect(0, 0, w, hh);
  g.save(); g.translate(ox, oy); g.scale(s, s);
  const x0 = -ox / s, x1 = (w - ox) / s;
  // the far houses and the Temple's white on the hill
  g.fillStyle = '#D9C9A8'; for (const [x, y, ww, hy] of [[20, 300, 70, 80], [96, 320, 60, 60], [170, 290, 80, 90], [262, 310, 64, 70], [330, 296, 90, 84]]) g.fillRect(x, y, ww, hy);
  g.fillStyle = '#F4EEDD'; g.fillRect(200, 214, 90, 70); g.fillStyle = '#E8DFC8'; g.fillRect(184, 270, 122, 20);
  g.fillStyle = 'rgba(214,170,60,.8)'; g.fillRect(200, 210, 90, 5);
  // the courtyard's wall with an arch
  g.fillStyle = '#CDB48A'; g.fillRect(x0, 380, x1 - x0, GROUND - 380);
  g.strokeStyle = 'rgba(110,80,40,.3)'; g.lineWidth = 1.5;
  for (let y = 380; y < GROUND; y += 30) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); for (let x = x0 + ((y / 30) % 2 ? 22 : 0); x < x1; x += 44) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 30); g.stroke(); } }
  g.fillStyle = '#7A5C3A'; g.beginPath(); g.moveTo(292, GROUND); g.lineTo(292, 440); g.quadraticCurveTo(322, 404, 352, 440); g.lineTo(352, GROUND); g.closePath(); g.fill();
  g.fillStyle = '#6E8A4A'; g.beginPath(); g.arc(40, 372, 26, 0, 6.2832); g.arc(66, 380, 20, 0, 6.2832); g.fill();   // a vine over the wall
  // the paving
  const yb = Math.max(WH, (hh - oy) / s);   // the paving down to the screen's foot (where the finger pulls)
  const pv = g.createLinearGradient(0, GROUND, 0, yb); pv.addColorStop(0, '#E2CFA6'); pv.addColorStop(1, '#B89A6A');
  g.fillStyle = pv; g.fillRect(x0, GROUND, x1 - x0, yb - GROUND);
  g.strokeStyle = 'rgba(110,80,40,.35)'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(x0, GROUND + 0.5); g.lineTo(x1, GROUND + 0.5); g.stroke();
  for (let x = x0; x < x1 + 60; x += 50) { g.beginPath(); g.moveTo(x, GROUND); g.lineTo(x - (yb - GROUND) * 0.22, yb); g.stroke(); }
  for (let y = GROUND + 36, k = 1; y < yb; y += 36 + k * 8, k++) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
  g.restore();
}
function steps(g, def) {
  for (const [x, top, w, hh] of def.steps) {
    const gr = g.createLinearGradient(0, top, 0, top + hh); gr.addColorStop(0, '#F3E6C6'); gr.addColorStop(1, '#C9B084');
    g.fillStyle = gr; g.fillRect(x - w / 2, top, w, hh); g.strokeStyle = 'rgba(110,80,40,.6)'; g.lineWidth = 1; g.strokeRect(x - w / 2 + 0.5, top + 0.5, w - 1, hh - 1);
  }
}
export function icon(g, s) {
  const sky = g.createLinearGradient(0, 0, 0, s); sky.addColorStop(0, '#F4DFB4'); sky.addColorStop(1, '#D9B884');
  g.fillStyle = sky; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  g.fillStyle = '#C9A873'; g.fillRect(0, s * 0.78, s, s * 0.22);
  const r = s * 0.1;
  walnut(g, s * 0.22, s * 0.78 - r, r); walnut(g, s * 0.42, s * 0.78 - r, r); walnut(g, s * 0.32, s * 0.78 - r * 2.7, r, 0.4);
  walnut(g, s * 0.8, s * 0.78 - r * 1.1, r * 1.1, 0, true, true);
  g.fillStyle = 'rgba(255,250,235,.95)'; for (const [x, y] of [[0.68, 0.66], [0.6, 0.64], [0.52, 0.66]]) { g.beginPath(); g.arc(s * x, s * y, s * 0.022, 0, 6.2832); g.fill(); }
}

/* ───────── the game ───────── */
const CSS = `
.g10-nuts{position:relative;flex:1;min-height:0;width:100%;touch-action:none;cursor:grab}
.g10-nuts canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-nu-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none;z-index:2}
.g10-nu-hud span{background:rgba(20,12,4,.62);border-radius:999px;padding:4px 12px;font:800 14.5px/1.3 "Heebo",sans-serif;color:#FFF3D6;white-space:nowrap}
.g10-nu-hud i{font-style:normal;color:#FFD66E}
.g10-nu-tip{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 54px);text-align:center;pointer-events:none;font:800 15px/1.3 "Heebo",sans-serif;color:#FFF3D6;transition:opacity .3s}
.g10-nu-tip span{display:inline-block;background:rgba(20,12,4,.66);border-radius:999px;padding:6px 14px;max-width:88%}
.g10-nu-x{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);inset-inline-end:10px;z-index:4}
@media (prefers-reduced-motion:reduce){.g10-nu-tip{transition:none}}
`;
function slot(G) {   // the courtyards' progress (G.games.nuts = { lv })
  const o = G && typeof G === 'object' ? G : {};
  if (!o.games || typeof o.games !== 'object' || Array.isArray(o.games)) o.games = {};
  let s = o.games.nuts;
  if (!s || typeof s !== 'object') s = o.games.nuts = { lv: 1 };
  if (!(s.lv >= 1 && s.lv <= LEVELS.length)) s.lv = 1;
  return s;
}
export const levelOf = (G) => slot(G).lv | 0 || 1;
export function record(G, lv, r) { if (G && r && r.won && !r.quit && !r.duel) { const s = slot(G); if (lv === s.lv) s.lv = lv >= LEVELS.length ? 1 : lv + 1; } }

export const GAME = {
  id: 'nuts', title: 'מגדל האגוזים', sub: 'מגלגלים אגוז ומפילים מגדל אגוזים — חמש חצרות בירושלים', chip: 'לבד · או שניים', pay: { silver: 8 },
  how: [
    'משוך אחורה — מכל מקום במסך — ושחרר: האגוז מתגלגל על הרצפה. משיכה למטה — והוא קופץ.',
    'הפל את כל מגדלי האגוזים שבחצר. שלושה אגוזים בכל חצר; באגוז הראשון הנקודות מראות את הדרך.',
    'המגדל שבמשחק הוא המחשה של משחקי האגוזים של ילדי התקופה.',
  ],
  solo: 'לבד', soloSub: 'חמש חצרות (נשמר)', duelSub: 'אותה חצר, תור לכל אחד — מי מפיל יותר?',
  icon, facts: FACTS, run,
  words(duel, r, P = PLAYERS) {
    if (duel) {
      const d = r.down || [0, 0], u = r.used || [0, 0], w = r.winner;
      if (w < 0) return [0, 1].map(() => ['תיקו של מגלגלים!', `${d[0]} מתוך ${r.targets} לכל אחד.`]);
      return [0, 1].map((i) => (i === w ? ['גלגול מדויק!', `הפלת ${d[i]} מתוך ${r.targets}${d[i] === d[1 - i] ? ` ב־${u[i]} אגוזים` : ''}.`] : ['גלגולים יפים!', `הפלת ${d[i]} מתוך ${r.targets}; ${P[w].name} הפיל ${d[w]}.`]));
    }
    return r.won ? [r.targets === 1 ? 'המגדל נפל!' : 'כל המגדלים נפלו!', `${lvDef(r.level).n}: ${r.used === 1 ? 'באגוז אחד' : `ב־${r.used} אגוזים`}.${r.level >= LEVELS.length ? ' עברת את כל החצרות!' : ''}`]
      : [r.down ? 'כמעט!' : 'עוד ניסיון?', r.down ? `נפלו ${r.down} מתוך ${r.targets}. בפעם הבאה — עוד קצת.` : 'שלושת האגוזים התגלגלו. נסה למשוך יותר או פחות.'];
  },
};

async function run(S, ctx = {}) {
  const { sfx = () => {}, reduced } = ctx;
  const lv = Math.max(1, Math.min(LEVELS.length, (ctx.level | 0) || (ctx.G ? levelOf(ctx.G) : 1)));
  injectCSS('g10-nu-css', CSS);
  const scr = S.screen('g10-nu');
  scr.style.cssText = 'display:flex;flex-direction:column;align-items:stretch';
  const box = h('div', 'g10-nuts'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'מגדל האגוזים: משוך אחורה ושחרר');
  const cv = document.createElement('canvas'); box.appendChild(cv);
  const hud = h('div', 'g10-nu-hud'); box.appendChild(hud);
  const tip = h('div', 'g10-nu-tip', `<span>${lvDef(lv).tip || 'משוך אחורה ושחרר — האגוז יתגלגל'}</span>`); box.appendChild(tip);
  const x = h('button', 'g10-x g10-nu-x', 'יציאה'); x.type = 'button'; box.appendChild(x);
  scr.appendChild(box);
  let W = makeWorld(lv), who = ctx.duel ? (ctx.first | 0) : 0;
  let quit = false, raf = 0, finish = null, drag = null, lastShotAt = -9, over = false, won = false;
  const fx = [];
  let done = new Promise((r) => { finish = r; });
  const newTurn = (p) => {
    W = makeWorld(lv); who = p; over = false; won = false; lastShotAt = -9; drag = null; fx.length = 0;
    tip.innerHTML = `<span>${PLAYERS[p].name}: משוך אחורה ושחרר</span>`; tip.style.opacity = '1';
    done = new Promise((r) => { finish = r; }); paintHud(); return done;
  };
  x.addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(); } });
  let geo = { s: 1, ox: 0, oy: 0 };
  const toWorld = (cx, cy) => { const r = cv.getBoundingClientRect(); return { x: (cx - r.left - geo.ox) / geo.s, y: (cy - r.top - geo.oy) / geo.s }; };
  const toPage = (p) => { const r = cv.getBoundingClientRect(); return { x: r.left + geo.ox + p.x * geo.s, y: r.top + geo.oy + p.y * geo.s }; };
  const left = () => NUTS - W.used;
  const moving = () => W.shots.some((q) => !q.still);
  const ready = () => !over && left() > 0 && !moving() && W.t - lastShotAt > 0.6;
  function paintHud() {
    const n = left();
    const pl = ctx.duel ? `<span style="box-shadow:inset 0 0 0 3px ${PLAYERS[who].color}">תור <i>${PLAYERS[who].name}</i></span>` : '';
    hud.innerHTML = `${pl}<span>חצר <i>${lv}</i>${ctx.duel ? '' : ` · ${lvDef(lv).n}`}</span><span aria-label="${n} אגוזים נשארו">אגוזים <i>${n}</i></span>`;
  }
  paintHud();
  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || !ready() || quit) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch (x2) { /* */ }
    drag = { id: e.pointerId, start: toWorld(e.clientX, e.clientY), pull: { x: 0, y: 0 } };
    sfx('tap');
  });
  box.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = toWorld(e.clientX, e.clientY);
    let px = p.x - drag.start.x, py = Math.max(0, p.y - drag.start.y);   // (up is not a pull: the nut stays on or over the floor)
    const l = Math.hypot(px, py); if (l > MAXPULL) { px *= MAXPULL / l; py *= MAXPULL / l; }
    drag.pull = { x: px, y: py };
  });
  const release = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const pull = drag.pull; drag = null;
    if (!ready() || quit) return;
    if (Math.hypot(pull.x, pull.y) < 12) return;
    const v = velOf(pull);
    if (v.x > -0.5) { tip.innerHTML = '<span>משוך אחורה — ימינה, הרחק מהמגדלים</span>'; tip.style.opacity = '1'; return; }
    tip.style.opacity = '0';
    launch(W, v); lastShotAt = W.t; sfx('swoosh'); paintHud();
  };
  box.addEventListener('pointerup', release);
  box.addEventListener('pointercancel', () => { drag = null; });
  box.__g10 = {
    state: () => ({ level: lv, name: lvDef(lv).n, nuts: left(), used: W.used, targets: W.towers.length, down: W.down, over, won, moving: moving(), ready: ready(), scale: geo.s,
      shooter: toPage(ANCHOR), towers: W.towers.map((T, i) => (T.down ? null : toPage(aimPoint(W, i)))) }),
    /** a drag (page px) that fells standing tower i (the planner, on a copy of this courtyard): { from, to, pull } | null */
    aimAt(i) {
      const pull = plan(W, i); if (!pull) return null;
      return { from: toPage(ANCHOR), to: toPage({ x: ANCHOR.x + pull.x, y: ANCHOR.y + pull.y }), pull };
    },
  };
  let acc = 0, last = performance.now();
  function frame() {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (!quit) {
      acc += dt; let n = 0;
      while (acc >= 1 / 60 && n < 4) {
        acc -= 1 / 60; n++;
        for (const ev of stepWorld(W)) {
          if (ev.k === 'hit') { sfx('wood', { mass: 0.4 }); if (!reduced) fx.push({ k: 'dust', x: ev.x, y: ev.y, age: 0, life: 0.5 }); }
          else if (ev.k === 'down') { sfx('chime', { combo: W.down }); fx.push({ k: 'txt', t: 'נפל!', x: ev.x, y: ev.y, age: 0, life: 1.1 }); }
        }
      }
      if (n >= 4) acc = 0;
      for (const f of fx) f.age += dt;
      for (let i = fx.length - 1; i >= 0; i--) if (fx[i].age > fx[i].life) fx.splice(i, 1);
      if (!over && allDown(W)) { over = true; won = true; setTimeout(() => finish(), reduced ? 500 : 1200); sfx('m3win'); }
      else if (!over && W.used >= NUTS && !moving() && W.t - lastShotAt > 1.5) {
        const still = W.t - lastShotAt > 6 || W.nuts.every((b) => b.isSleeping || Math.hypot(b.velocity.x, b.velocity.y) < 0.2);
        if (still) { over = true; setTimeout(() => finish(), 500); }
      }
    }
    const { w, h: hh, g } = fitCanvas(cv);
    // the play is framed close: the courtyard's width (x 40…380) fills the screen, the paving's line at ~72 % of the height
    const s = Math.min(w / 340, hh / 520), ox = w / 2 - 210 * s, oy = Math.min(hh * 0.72 - GROUND * s, hh - (GROUND + 30) * s);
    geo = { s, ox, oy };
    g.drawImage(layer('nu-court', w, hh, `${s},${ox},${oy},${lv}`, (c) => { court(c, w, hh, s, ox, oy); c.save(); c.translate(ox, oy); c.scale(s, s); steps(c, W.def); c.restore(); }), 0, 0, w, hh);   // (the still courtyard: one cached layer)
    g.save(); g.translate(ox, oy); g.scale(s, s);
    for (const T of W.towers) for (const b of T.nuts) walnut(g, b.position.x, b.position.y, R_NUT, b.angle, false, false);
    for (const q of W.shots) if (!q.gone) walnut(g, q.b.position.x, q.b.position.y, R_SHOT, q.b.angle, true);
    // the next nut, at rest (or pulled back a little under the finger), and the dots of its path on the first nut
    if (left() > 0 && !over) {
      const pl = drag ? { x: Math.min(368, ANCHOR.x + drag.pull.x * 0.2), y: ANCHOR.y + Math.min(6, drag.pull.y * 0.1) } : ANCHOR;   // (a little back under the finger, still on screen)
      walnut(g, pl.x, pl.y, R_SHOT, 0, true, ready());
      if (drag && W.used < DOTS_FOR && Math.hypot(drag.pull.x, drag.pull.y) >= 12) {
        g.lineWidth = 1.2; g.strokeStyle = 'rgba(60,34,8,.6)';
        arc(velOf(drag.pull), 150).forEach((p, i) => { if (i % 4 !== 3) return; g.globalAlpha = Math.max(0.25, 1 - i / 160); g.fillStyle = '#FFFBEF'; g.beginPath(); g.arc(p.x, p.y, 3.2, 0, 6.2832); g.fill(); g.stroke(); });
        g.globalAlpha = 1;
      }
    }
    for (const f of fx) {
      const a = Math.max(0, 1 - f.age / f.life);
      if (f.k === 'dust') { g.fillStyle = `rgba(214,190,150,${0.6 * a})`; g.beginPath(); g.arc(f.x, f.y - f.age * 12, 4 + f.age * 18, 0, 6.2832); g.fill(); }
      else { g.globalAlpha = a; g.fillStyle = '#FFF3C4'; g.strokeStyle = 'rgba(60,30,5,.8)'; g.lineWidth = 3; g.textAlign = 'center'; g.font = '900 17px "Frank Ruhl Libre", serif'; const X = Math.max(34, Math.min(WW - 34, f.x)), Y = f.y - f.age * 24; g.strokeText(f.t, X, Y); g.fillText(f.t, X, Y); g.globalAlpha = 1; }
    }
    g.restore();
    g.fillStyle = 'rgba(60,36,12,.7)'; g.font = '700 12px "Heebo", sans-serif'; g.textAlign = 'right'; g.direction = 'rtl';
    g.fillText('מגדל האגוזים — המחשה', w - 10, hh - 14);   // (the Roman-era nut game is an illustration, not a source)
    raf = requestAnimationFrame(frame);
  }
  await sleep(30);
  raf = requestAnimationFrame(frame);
  const turnResult = () => ({ won, used: W.used, down: W.down, targets: W.towers.length, level: lv });
  try {
    if (ctx.duel) tip.innerHTML = `<span>${PLAYERS[who].name} מתחיל: משוך אחורה ושחרר</span>`;
    await done;
    if (quit) return { quit: true, level: lv };
    if (!ctx.duel) { const r = turnResult(); record(ctx.G, lv, r); return { ...r, winner: r.won ? 0 : 1 }; }
    const rs = []; rs[who] = turnResult();
    const next = 1 - who;
    await S.card(`<h2>תור ${PLAYERS[next].name}</h2><p>${PLAYERS[1 - next].name}: ${rs[1 - next].down} מתוך ${rs[1 - next].targets}${rs[1 - next].won ? ` ב־${rs[1 - next].used} אגוזים` : ''}. עכשיו אותה חצר — שלושה אגוזים ל${PLAYERS[next].name}.</p>`, [{ value: 'go', label: 'מוכן', gold: true }]);
    await newTurn(next);
    if (quit) return { quit: true, level: lv };
    rs[next] = turnResult();
    const [a, b] = rs, cmp = a.down !== b.down ? b.down - a.down : a.won && b.won ? a.used - b.used : 0;
    return { duel: true, winner: cmp < 0 ? 0 : cmp > 0 ? 1 : -1, down: [a.down, b.down], used: [a.used, b.used], targets: a.targets, level: lv, won: a.won || b.won };
  } finally { cancelAnimationFrame(raf); }
}
export { run };
