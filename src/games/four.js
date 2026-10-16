/* ─────────────────────────────────────────────────────────────────────────────
 * games/four.js — (GAMES10) "ארבע בנדבך": the classic four-in-a-row (7 × 6), dressed as a course of the wall. The stones are
 * ashlars with drafted margins: white ones with a square boss (תכלת) and golden ones with a round boss (ארגמן) — colour AND
 * shape, colour-blind safe. Tap a column: the stone drops. Four in a row, across, up or on a slant, is a whole course.
 * Solo: a gentle builder (takes a win ~3 in 5, blocks ~1 in 2, else leans to the middle). A duel: one board, two bands.
 *   run(S, { duel, first, sfx, rnd, reduced }) → { winner: 0 | 1 | -1 (a full wall), quit, moves }
 * The test hook: the board element's __g10 = { state(), colX(c) } (what a player sees; test/games-touch.cjs).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, sleep, fitCanvas, PLAYERS } from './shell.js';

const R = 6, C = 7;
export const FACTS = [   // FACTS8B's content/facts.json, word for word (ids kept)
  { id: 'f_wall_margins', he: 'לאבני הגזית של הורדוס שוליים מסותתים ושקועים סביב בליטה שטוחה — כך מזהים אותן עד היום בכותל.', ref: 'משרד החוץ, מנהרות הכותל (חפירות מ׳ בן־דב וד׳ בהט, רשות העתיקות)' },
  { id: 'f_wall_setback', he: 'כל נדבך הורדוסי הונח כ־2–3 ס״מ פנימה מזה שמתחתיו, ולכן החומה נוטה פנימה מעט — בכוונה.', ref: 'משרד החוץ, מנהרות הכותל (חפירות מ׳ בן־דב וד׳ בהט, רשות העתיקות)' },
  { id: 'f_herod_marble', he: 'במה בנה הורדוס? ״באבני שישא ומרמרא״ — באבני שיש. נדבך אחד בלט ונדבך אחד שקע, כדי שיקבלו את הסיד.', ref: 'בבלי בבא בתרא ד, א' },
  { id: 'f_herod_white', he: 'יוספוס מספר שאבני הבית היו לבנות וחזקות, וכל אחת כעשרים וחמש אמה אורכה, שמונה גובהה ושתים עשרה רוחבה.', ref: 'יוספוס, קדמוניות היהודים טו, 391–392 (בתרגום חופשי)' },
  { id: 'f_har_great', he: 'בנדבך הגדול שבמנהרות הכותל יש אבן שאורכה כ־13.6 מטר וגובהה כ־3.3 מטר; משקלה — מאות טונות.', ref: 'הקרן למורשת הכותל המערבי; ד׳ בהט, מנהרת הכותל המערבי (2013)' },
];
const STONE = [
  { name: 'אבנים לבנות', hi: '#FFFDF6', mid: '#EFE6D2', lo: '#CDBE9E', edge: '#9C8A66', boss: 'square' },
  { name: 'אבנים זהובות', hi: '#FFE7A8', mid: '#E4AE55', lo: '#B57A2C', edge: '#7E4F14', boss: 'round' },
];
export const dotStyle = (i) => `radial-gradient(circle at 35% 30%,${STONE[i].hi},${STONE[i].mid} 55%,${STONE[i].lo})`;

/* ───────── the rules (pure) ───────── */
export const emptyBoard = () => Array.from({ length: R }, () => new Array(C).fill(-1));
export const rowFor = (b, c) => { for (let r = R - 1; r >= 0; r--) if (b[r][c] < 0) return r; return -1; };
export const validCols = (b) => { const v = []; for (let c = 0; c < C; c++) if (b[0][c] < 0) v.push(c); return v; };
/** the run of ≥ 4 through (r, c) for its owner, or null */
export function winAt(b, r, c) {
  const p = b[r][c];
  if (p < 0) return null;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const cells = [[r, c]];
    for (const s of [1, -1]) {
      let rr = r + dr * s, cc = c + dc * s;
      while (rr >= 0 && rr < R && cc >= 0 && cc < C && b[rr][cc] === p) { cells.push([rr, cc]); rr += dr * s; cc += dc * s; }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
}
const winsIf = (b, c, p) => { const r = rowFor(b, c); if (r < 0) return false; b[r][c] = p; const w = !!winAt(b, r, c); b[r][c] = -1; return w; };
/** the gentle builder's column */
export function gentleMove(b, me, rnd = Math.random) {
  const v = validCols(b), op = 1 - me;
  if (!v.length) return -1;
  for (const c of v) if (winsIf(b, c, me) && rnd() < 0.6) return c;
  for (const c of v) if (winsIf(b, c, op) && rnd() < 0.5) return c;
  // not a column that hands the other a win right above (half the time)
  const safe = v.filter((c) => { const r = rowFor(b, c); if (r <= 0) return true; b[r][c] = me; const bad = winsIf(b, c, op); b[r][c] = -1; return !bad; });
  const pool = safe.length && rnd() < 0.4 ? safe : v;
  const W = [1, 2, 3, 4, 3, 2, 1];
  let tot = 0; for (const c of pool) tot += W[c];
  let x = rnd() * tot;
  for (const c of pool) { x -= W[c]; if (x <= 0) return c; }
  return pool[pool.length - 1];
}

/* ───────── drawing ───────── */
function stone(g, x, y, w, hh, i, glow) {
  const s = STONE[i], rr = Math.min(w, hh) * 0.16;
  g.save();
  if (glow) { g.shadowColor = 'rgba(255,226,120,.95)'; g.shadowBlur = Math.max(8, w * 0.35); }
  const gr = g.createLinearGradient(x, y, x + w * 0.4, y + hh);
  gr.addColorStop(0, s.hi); gr.addColorStop(0.55, s.mid); gr.addColorStop(1, s.lo);
  g.fillStyle = gr; rrect(g, x, y, w, hh, rr); g.fill();
  g.shadowBlur = 0; g.shadowColor = 'transparent';
  g.lineWidth = Math.max(1, w * 0.035); g.strokeStyle = s.edge; rrect(g, x, y, w, hh, rr); g.stroke();
  // the drafted margin: a sunken band around a flat boss
  const m = w * 0.16;
  g.strokeStyle = 'rgba(80,50,10,.35)'; g.lineWidth = Math.max(1, w * 0.03);
  rrect(g, x + m, y + m, w - 2 * m, hh - 2 * m, rr * 0.6); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)';
  if (s.boss === 'square') { g.fillRect(x + w * 0.36, y + hh * 0.36, w * 0.28, hh * 0.28); g.strokeStyle = s.edge; g.lineWidth = Math.max(1, w * 0.03); g.strokeRect(x + w * 0.36, y + hh * 0.36, w * 0.28, hh * 0.28); }
  else { g.beginPath(); g.arc(x + w / 2, y + hh / 2, w * 0.16, 0, Math.PI * 2); g.fill(); g.strokeStyle = s.edge; g.lineWidth = Math.max(1, w * 0.03); g.stroke(); }
  g.restore();
}
function rrect(g, x, y, w, hh, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
export function icon(g, s) {
  g.fillStyle = '#6B4524'; rrect(g, 0, 0, s, s, s * 0.2); g.fill();
  const c = s / 2 - 4;
  stone(g, 3, s - 3 - c, c, c, 0); stone(g, s / 2 + 1, s - 3 - c, c, c, 1);
  stone(g, 3, 3, c, c, 1); stone(g, s / 2 + 1, 3, c, c, 0);
}

export const GAME = {
  id: 'four', title: 'ארבע בנדבך', sub: 'ארבע בשורה עם אבני החומה', chip: 'לבד מול בנאי · או שניים', pay: { stone: 8 },
  how: [
    'כל אחד בתורו מקיש על עמודה, והאבן שלו יורדת עד למטה.',
    'ארבע אבנים שלך בשורה — לרוחב, לגובה או באלכסון — הן נדבך שלם, וזכית.',
    'האבנים הלבנות עם הבליטה המרובעת; הזהובות עם הבליטה העגולה.',
  ],
  solo: 'לבד — מול בנאי עדין', soloSub: 'אתה בלבנות ומתחיל ראשון',
  icon,
  facts: FACTS,
  run,
};

async function run(S, ctx) {
  const { duel, sfx = () => {}, rnd = Math.random, reduced } = ctx;
  const L = S.turnLayout(duel);
  const names = duel ? [`${PLAYERS[0].name} · ${STONE[0].name}`, `${PLAYERS[1].name} · ${STONE[1].name}`] : ['אתה · אבנים לבנות', 'הבנאי העדין · אבנים זהובות'];
  const bands = [L.bot, L.top];
  const unit = (n) => (n === 1 ? 'ניצחון' : 'ניצחונות');
  bands.forEach((b, i) => { const sc = ctx.score ? ctx.score[i] : 0; b.set({ name: names[i], score: sc, unit: unit(sc), color: '' }); b.el.querySelector('.dot').style.background = dotStyle(i); b.el.querySelector('.dot').style.boxShadow = `0 0 0 3px ${PLAYERS[i].color}`; });
  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;touch-action:none;border-radius:14px;box-shadow:0 0 0 3px rgba(255,214,120,.55),0 12px 34px rgba(0,0,0,.45)';
  cv.setAttribute('role', 'application'); cv.setAttribute('aria-label', 'לוח ארבע בנדבך: הקש על עמודה');
  L.board.appendChild(cv);
  const b = emptyBoard();
  let turn = ctx.first === 1 ? 1 : 0, busy = false, moves = 0, win = null, last = null, drop = null, quit = false, geo = null;
  const human = (p) => duel || p === 0;

  function layout() {
    const r = L.board.getBoundingClientRect();
    const cell = Math.max(40, Math.floor(Math.min((r.width - 16) / C, (r.height - 16) / (R + 0.6), 64)));
    cv.style.width = cell * C + 'px'; cv.style.height = Math.round(cell * (R + 0.6)) + 'px';
    geo = { cell, top: Math.round(cell * 0.6) };
    draw();
  }
  function draw(now = performance.now()) {
    if (!geo) return;
    const { w, h: hh, g } = fitCanvas(cv), { cell, top } = geo;
    g.clearRect(0, 0, w, hh);
    // the wall's face: mortar, the sockets
    const wall = g.createLinearGradient(0, top, 0, hh); wall.addColorStop(0, '#7A5530'); wall.addColorStop(1, '#4E321A');
    g.fillStyle = wall; rrect(g, 0, top, w, hh - top, 12); g.fill();
    g.fillStyle = 'rgba(255,236,190,.14)'; g.fillRect(0, 0, w, top);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const x = c * cell, y = top + r * cell;
      g.fillStyle = 'rgba(20,10,2,.45)'; rrect(g, x + 4, y + 4, cell - 8, cell - 8, cell * 0.14); g.fill();
      const p = b[r][c];
      if (p >= 0 && !(drop && drop.r === r && drop.c === c)) {
        const inWin = win && win.some(([wr, wc]) => wr === r && wc === c);
        stone(g, x + 4, y + 4, cell - 8, cell - 8, p, inWin && (reduced || Math.sin(now / 160) > -0.3));
      }
    }
    if (!drop && !win && !busy && human(turn)) {   // the drop strip: a small chevron over every open column, in the player's colour
      g.fillStyle = PLAYERS[turn].color; g.globalAlpha = 0.75 + 0.2 * Math.sin(now / 300);
      for (let c = 0; c < C; c++) if (b[0][c] < 0) { const x = c * cell + cell / 2, y = top * 0.28; g.beginPath(); g.moveTo(x - cell * 0.16, y); g.lineTo(x + cell * 0.16, y); g.lineTo(x, y + top * 0.42); g.closePath(); g.fill(); }
      g.globalAlpha = 1;
    }
    if (last && !drop && !win) { g.strokeStyle = 'rgba(255,243,196,.85)'; g.lineWidth = 2; rrect(g, last.c * cell + 2, top + last.r * cell + 2, cell - 4, cell - 4, cell * 0.16); g.stroke(); }
    if (drop) {
      const t = Math.min(1, (now - drop.t0) / drop.ms), y = -cell + (top + drop.r * cell + cell) * t * t;
      stone(g, drop.c * cell + 4, y + 4, cell - 8, cell - 8, drop.p);
    }
    if (win) {   // the whole course: a gold line through it
      const srt = win.slice().sort((p, q) => (p[1] - q[1]) || (p[0] - q[0])), a = srt[0], z = srt[srt.length - 1];   // the run's two ends
      g.strokeStyle = 'rgba(255,214,90,.9)'; g.lineWidth = Math.max(4, cell * 0.12); g.lineCap = 'round';
      g.beginPath(); g.moveTo(a[1] * cell + cell / 2, top + a[0] * cell + cell / 2); g.lineTo(z[1] * cell + cell / 2, top + z[0] * cell + cell / 2); g.stroke();
    }
  }
  const onResize = () => layout();
  globalThis.addEventListener('resize', onResize);
  let raf = 0;
  const loop = () => { draw(); raf = (drop || win) ? requestAnimationFrame(loop) : 0; };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function bandsFor() {
    draw();
    bands.forEach((bd, i) => {
      const me = i === turn && !win;
      bd.set({ on: me, msg: win ? '' : me ? (human(i) ? 'תורך — הקש על עמודה' : 'חושב…') : (duel ? 'ממתין לתורו' : 'ממתין') });
    });
  }
  let resolveMove = null, early = -1;   // (a tap that lands before the turn is armed is kept, not lost)
  cv.addEventListener('pointerdown', (e) => {
    if (busy || win || !human(turn) || !geo) return;
    const r = cv.getBoundingClientRect(), c = Math.floor((e.clientX - r.left) / geo.cell);
    if (c < 0 || c >= C || rowFor(b, c) < 0) { sfx('m3bad'); return; }
    e.preventDefault();
    if (resolveMove) { const f = resolveMove; resolveMove = null; f(c); } else early = c;
  });
  L.bot.el.querySelector('[data-exit]').addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; if (resolveMove) { const f = resolveMove; resolveMove = null; f(-1); } } });
  cv.__g10 = { state: () => ({ board: b.map((row) => row.slice()), turn, busy, human: human(turn), win: !!win, moves }), colX: (c) => { const r = cv.getBoundingClientRect(); return { x: r.left + (c + 0.5) * (geo ? geo.cell : r.width / C), y: r.top + r.height * 0.6 }; } };

  async function place(c, p) {
    const r = rowFor(b, c);
    busy = true;
    drop = { r, c, p, t0: performance.now(), ms: reduced ? 1 : 170 + 45 * r };
    b[r][c] = p; kick();
    await sleep(drop.ms + 16);
    drop = null; last = { r, c }; moves++;
    sfx('thud', { mass: 0.45 });
    draw();
    busy = false;
    return r;
  }

  await sleep(40); layout(); bandsFor();
  try {
    while (!quit) {
      let c;
      if (human(turn)) c = early >= 0 && rowFor(b, early) >= 0 ? early : await new Promise((res) => { resolveMove = res; });
      else { await sleep(520 + rnd() * 380); c = gentleMove(b, turn, rnd); }
      early = -1;
      if (quit || c < 0) break;
      const r = await place(c, turn);
      const w = winAt(b, r, c);
      if (w) { win = w; bandsFor(); { const sc = ((ctx.score && ctx.score[turn]) || 0) + 1; bands[turn].set({ score: sc, unit: unit(sc), msg: 'נדבך שלם!' }); } sfx('m3win'); kick(); await sleep(reduced ? 600 : 1500); return { winner: turn, moves }; }
      if (!validCols(b).length) { bandsFor(); await sleep(700); return { winner: -1, moves }; }
      turn = 1 - turn; bandsFor();
    }
    return { quit: true, moves };
  } finally {
    globalThis.removeEventListener('resize', onResize);
    if (raf) cancelAnimationFrame(raf);
  }
}
