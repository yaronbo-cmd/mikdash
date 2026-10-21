/* ─────────────────────────────────────────────────────────────────────────────
 * games/stack.js — (GAMES10) "נדבך על נדבך": the classic stacking game, dressed as the courses of the wall. An ashlar slides
 * from side to side over your course; tap to set it. What overhangs is trimmed off and the next stone is that much shorter;
 * a true placement keeps the full length ("מדויק!"). The wall ends when a stone misses the course, or at 30 courses.
 * Solo: your own best. A duel: each builds his own wall in his half at the same time (the top half turned 180°); the higher
 * wall is told kindly. No clock.
 *   run(S, { duel, sfx, reduced }) → { winner: 0 | 1 | -1, courses:[a, b], perfect:[a, b], quit }
 * Test hook: each half's __g10 = { state() } (the moving stone and the course under it, as fractions of the width).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, sleep, injectCSS, fitCanvas, PLAYERS } from './shell.js';

const TOP = 30, BASE = 0.62, PERFECT = 0.014;
const CSS = `
.g10-stk{position:relative;flex:1;min-height:0;touch-action:none;cursor:pointer}
.g10-stk canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.g10-stk .g10-rh{top:8px}
.g10-stk-tip{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);left:0;right:0;text-align:center;pointer-events:none;font:800 15px/1.3 "Heebo",sans-serif;color:#FFF3D6}
.g10-stk-tip span{display:inline-block;background:rgba(20,12,4,.66);border-radius:999px;padding:5px 14px}
.g10-half.g10-t .g10-stk-tip{bottom:calc(env(safe-area-inset-top,0px) + 12px)}
.g10-stk-x{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 8px);inset-inline-start:10px;z-index:4}
`;
export const FACTS = [   // FACTS8B's content/facts.json, word for word (ids kept)
  { id: 'f_wall_setback', he: 'כל נדבך הורדוסי הונח כ־2–3 ס״מ פנימה מזה שמתחתיו, ולכן החומה נוטה פנימה מעט — בכוונה.', ref: 'משרד החוץ, מנהרות הכותל (חפירות מ׳ בן־דב וד׳ בהט, רשות העתיקות)' },
  { id: 'f_herod_priests', he: 'יוספוס מספר שהורדוס קנה אלף בגדי כהונה לאלף כהנים, ולימד חלק מהם סיתות אבן וחלק נגרות.', ref: 'יוספוס, קדמוניות היהודים טו, 390 (בתרגום חופשי)' },
  { id: 'f_herod_years', he: 'יוספוס מספר שהאכסדראות והחצרות החיצוניות נבנו בשמונה שנים, והבית עצמו — בידי הכהנים, בשנה וחצי.', ref: 'יוספוס, קדמוניות היהודים טו, 420–421 (בתרגום חופשי)' },
  { id: 'f_stone_45', he: 'יוספוס מספר שאחדות מאבני הבית היו באורך ארבעים וחמש אמה, בגובה חמש וברוחב שש.', ref: 'יוספוס, מלחמת היהודים ה, 224 (בתרגום חופשי)' },
];

function ashlar(g, x, y, w, hh, k, glow) {
  const tones = [['#FFFDF6', '#EDE3CC', '#CDBE9E'], ['#FBEFD2', '#E6D2A6', '#C3A775']][k % 2];
  g.save();
  if (glow) { g.shadowColor = 'rgba(255,226,120,.95)'; g.shadowBlur = 14; }
  const gr = g.createLinearGradient(x, y, x, y + hh); gr.addColorStop(0, tones[0]); gr.addColorStop(0.5, tones[1]); gr.addColorStop(1, tones[2]);
  g.fillStyle = gr; g.fillRect(x, y, w, hh);
  g.shadowBlur = 0; g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(110,80,40,.75)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, hh - 1);
  const m = Math.min(5, hh * 0.2);   // the drafted margin around a flat boss
  if (w > 2 * m + 4) { g.strokeStyle = 'rgba(110,80,40,.3)'; g.strokeRect(x + m, y + m, w - 2 * m, hh - 2 * m); }
  g.restore();
}
export function icon(g, s) {
  const sky = g.createLinearGradient(0, 0, 0, s); sky.addColorStop(0, '#9CC2E6'); sky.addColorStop(1, '#F2D7A6');
  g.fillStyle = sky; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  const sh = s / 8;
  for (let i = 0; i < 5; i++) { const w = s * (0.7 - i * 0.07), x = (s - w) / 2 + (i % 2 ? 2 : -2); ashlar(g, x, s - 4 - (i + 1) * sh, w, sh - 1, i); }
  ashlar(g, s * 0.05, s * 0.12, s * 0.42, sh - 1, 1, true);
}

export const GAME = {
  id: 'stack', title: 'נדבך על נדבך', sub: 'מניחים אבני גזית זו על זו — כמה נדבכים תבנה?', chip: 'לבד · או שניים', pay: { stone: 10 },
  how: [
    'האבן נעה מצד לצד מעל הנדבך. הקש — והיא יורדת למקומה.',
    'מה שבולט מעבר לנדבך נחתך, והאבן הבאה קצרה יותר. הנחה מדויקת שומרת על כל האורך.',
    'החומה נגמרת כשאבן מחטיאה את הנדבך, או בנדבך השלושים. בלי שעון.',
  ],
  solo: 'לבד', soloSub: 'כמה נדבכים תבנה? (השיא נשמר)',
  icon,
  facts: FACTS,
  run,
};

async function run(S, ctx) {
  const { duel, sfx = () => {}, reduced } = ctx;
  injectCSS('g10-stk-css', CSS);
  const L = S.splitLayout(duel);
  const names = duel ? [PLAYERS[0].name, PLAYERS[1].name] : ['אתה', ''];
  let quit = false, raf = 0, finish = null;
  const done = new Promise((r) => { finish = r; });
  const P = L.halves.map((half, me) => {
    const box = h('div', 'g10-stk'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'נדבך על נדבך: הקש כדי להניח את האבן');
    const cv = document.createElement('canvas'); box.appendChild(cv);
    const rh = h('div', 'g10-rh'); box.appendChild(rh);
    const tip = h('div', 'g10-stk-tip', '<span>הקש כדי להניח את האבן</span>'); box.appendChild(tip);   // (PRODUCER10 N19: on a dark pill, under the foundation)
    half.appendChild(box);
    const p = { me, half, box, cv, rh, tip, tower: [{ x: (1 - BASE) / 2, w: BASE }], cur: null, dir: 1, speed: 0.42, over: false, perfect: 0, chunks: [], cam: 0, flash: 0, last: performance.now() };
    newStone(p);
    box.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; e.preventDefault(); drop(p); });
    half.__g10 = { state: () => ({ me, n: p.tower.length - 1, over: p.over, cur: p.cur ? { x: p.cur.x, w: p.cur.w } : null, top: { ...p.tower[p.tower.length - 1] }, speed: p.speed }) };
    return p;
  });
  const x = h('button', 'g10-x g10-stk-x', 'יציאה'); x.type = 'button'; P[0].box.appendChild(x);
  x.addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(); } });
  function newStone(p) {
    const top = p.tower[p.tower.length - 1], from = p.tower.length % 2 ? 0 : 1;
    p.cur = { x: from ? 1 - top.w * 0.15 : -top.w * 0.85, w: top.w };   // it slides in from beyond the edge (a stone can miss)
    p.dir = from ? -1 : 1;
  }
  function hud(p) {
    const n = p.tower.length - 1;
    p.rh.innerHTML = duel ? `<span>${names[p.me]} · <i>${n}</i> ${n === 1 ? 'נדבך' : 'נדבכים'}</span>` : `<span>נדבכים · <i>${n}</i></span><span>מדויקים · <i>${p.perfect}</i></span>`;   // (N20: one chip per player, in his half)
  }
  function drop(p) {
    if (p.over || quit || !p.cur) return;
    const top = p.tower[p.tower.length - 1], c = p.cur;
    const l = Math.max(c.x, top.x), r = Math.min(c.x + c.w, top.x + top.w), ov = r - l;
    if (ov <= 0.004) {   // the stone misses the course: this wall is done
      p.chunks.push({ x: c.x, w: c.w, y: p.tower.length, vy: 0, a: 1 });
      p.cur = null; p.over = true; sfx('thud', { mass: 0.3 });
      { const n = p.tower.length - 1; p.tip.innerHTML = duel ? `<span>${n === 1 ? 'בנית נדבך אחד!' : n ? `בנית ${n} נדבכים!` : 'כמעט! מחכים לחבר…'}</span>` : ''; }
      check();
      return;
    }
    if (Math.abs(c.x - top.x) < PERFECT) { p.tower.push({ x: top.x, w: top.w }); p.perfect++; p.flash = performance.now(); sfx('joint'); }
    else {
      p.tower.push({ x: l, w: ov });
      const cut = c.x < top.x ? { x: c.x, w: top.x - c.x } : { x: top.x + top.w, w: c.x + c.w - (top.x + top.w) };
      if (cut.w > 0.002) p.chunks.push({ ...cut, y: p.tower.length - 1, vy: 0, a: 1 });
      sfx('thud', { mass: 0.5 });
    }
    p.speed = Math.min(1.05, p.speed + 0.022);
    hud(p);
    try { if (ctx.onCourse) ctx.onCourse(p.tower.length - 1, p.me); } catch (e) { /* (FUN12: the quarry's cycle pays each course live) */ }
    if (p.tower.length - 1 >= TOP) { p.cur = null; p.over = true; p.tip.innerHTML = '<span>החומה הגיעה לראש!</span>'; check(); return; }
    newStone(p);
  }
  function check() { if (P.every((q) => q.over)) setTimeout(() => finish(), reduced ? 300 : 900); }
  function draw() {
    const t = performance.now();
    for (const p of P) {
      const dt = Math.min(0.05, (t - p.last) / 1000); p.last = t;
      if (p.cur && !quit) {
        p.cur.x += p.dir * p.speed * dt;
        const lo = -p.cur.w * 0.85, hi = 1 - p.cur.w * 0.15;
        if (p.cur.x > hi) { p.cur.x = hi; p.dir = -1; } else if (p.cur.x < lo) { p.cur.x = lo; p.dir = 1; }
      }
      const { w, h: hh, g } = fitCanvas(p.cv);
      const sh = Math.max(18, Math.min(30, hh / 14)), n = p.tower.length;
      const base = hh - Math.max(96, hh * 0.2);   // the foundation's line: room below for the tip and the exit, the Mount's rock under it
      const want = Math.max(0, (n + 2) * sh - (base - hh * 0.32));   // the work stays in the lower-middle as the wall grows
      p.cam += (want - p.cam) * Math.min(1, dt * 6);
      const Y = (i) => base - (i + 1) * sh + p.cam;   // the screen y of course i (0 = the foundation)
      const sky = g.createLinearGradient(0, 0, 0, hh); sky.addColorStop(0, '#8DB7E0'); sky.addColorStop(1, '#F2D7A6');
      g.fillStyle = sky; g.fillRect(0, 0, w, hh);
      const rock = g.createLinearGradient(0, Y(0) + sh, 0, hh); rock.addColorStop(0, '#C9A673'); rock.addColorStop(1, '#8A6A45');
      g.fillStyle = rock; g.fillRect(0, Y(0) + sh, w, Math.max(0, hh - Y(0) - sh));   // the Mount's rock under the foundation
      for (let i = 0; i < n; i++) { const s = p.tower[i], y = Y(i); if (y > hh + sh || y < -sh) continue; ashlar(g, s.x * w, y, s.w * w, sh - 1, i, i === n - 1 && t - p.flash < 450); }
      for (const c of p.chunks) { c.vy += 900 * dt; c.dy = (c.dy || 0) + c.vy * dt; c.a = Math.max(0, c.a - dt * 1.4); g.globalAlpha = c.a; ashlar(g, c.x * w, Y(c.y) + c.dy, c.w * w, sh - 1, c.y); g.globalAlpha = 1; }
      p.chunks = p.chunks.filter((c) => c.a > 0);
      if (p.cur) ashlar(g, p.cur.x * w, Y(n) - 6, p.cur.w * w, sh - 1, n);
      if (t - p.flash < 600) { g.fillStyle = '#FFF3C4'; g.font = '900 22px "Frank Ruhl Libre", serif'; g.textAlign = 'center'; g.fillText('מדויק!', w / 2, Y(n) - 16); }
    }
    raf = requestAnimationFrame(draw);
  }
  P.forEach(hud);
  await sleep(30);
  raf = requestAnimationFrame(draw);
  try {
    await done;
    if (quit) return { quit: true };
    const c = P.map((p) => p.tower.length - 1), pf = P.map((p) => p.perfect);
    await sleep(reduced ? 200 : 500);
    return { winner: duel ? (c[0] === c[1] ? -1 : c[0] > c[1] ? 0 : 1) : 0, courses: duel ? c : [c[0], 0], perfect: duel ? pf : [pf[0], 0] };
  } finally { cancelAnimationFrame(raf); }
}
