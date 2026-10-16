/* ─────────────────────────────────────────────────────────────────────────────
 * games/memory.js — (GAMES10) "זיכרון הכלים": the classic memory game with six pairs of the Temple's vessels, drawn by the
 * board's own art (src/match3/art.js v0…v5: the Menorah, the altar, the oil jug, the showbread, the pomegranate, the silver
 * trumpets). Turn two cards; a pair stays open, shows its line (CONTENT's vessel cards, טיוטה + source) and you go again.
 * Solo: find all six (the tries are counted, never timed). A duel: a pair is yours and you go again; a miss passes the turn;
 * a card turned by the player across faces him.
 *   run(S, { duel, first, sfx, rnd, reduced }) → { winner: 0 | 1 | -1, pairs:[a, b], tries, quit, last }
 * Test hook: the grid's __g10 = { state() } — only what a player sees (the open faces carry data-v).
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, esc, sleep, injectCSS, PLAYERS } from './shell.js';
import { createArt } from '../match3/art.js';
import { VESSEL_CARDS } from '../match3/ui.js';

const CSS = `
.g10-mem{display:grid;gap:8px;direction:ltr;touch-action:manipulation}
.g10-mc{position:relative;border:0;padding:0;margin:0;background:none;perspective:700px;min-width:44px;min-height:44px}
.g10-mc .in{position:absolute;inset:0;transition:transform .28s ease;transform-style:preserve-3d}
.g10-mc.up .in{transform:rotateY(180deg)}
.g10-mc .bk,.g10-mc .fc{position:absolute;inset:0;border-radius:13px;-webkit-backface-visibility:hidden;backface-visibility:hidden;overflow:hidden}
.g10-mc .bk{border:2px solid #D8AB58;box-shadow:0 3px 0 rgba(0,0,0,.35);
 background:radial-gradient(circle at 50% 50%,#FFF1C0 0 7%,#E9B04A 8% 13%,rgba(0,0,0,0) 14%),radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 0 24%,rgba(255,214,120,.55) 25% 27%,rgba(0,0,0,0) 28%),
 repeating-linear-gradient(90deg,#7A4E26 0 7px,#6E4520 7px 14px)}
.g10-mc .fc{transform:rotateY(180deg);background:linear-gradient(#FFF8E8,#F0DBB0);box-shadow:inset 0 0 0 2px #D8AB58;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#4A2A0A}
.g10-mc .fc.r180{transform:rotateY(180deg) rotate(180deg)}
.g10-mc .fc canvas{width:68%;height:auto;aspect-ratio:1}
.g10-mc .fc em{font:800 12.5px/1.1 "Heebo",sans-serif;font-style:normal;direction:rtl;text-align:center;padding:0 3px}
.g10-mc.done .fc{box-shadow:inset 0 0 0 4px var(--pc,#D8AB58)}
.g10-mc.done{filter:saturate(.85)}
@media (prefers-reduced-motion:reduce){.g10-mc .in{transition:none}}
`;
export const FACTS = VESSEL_CARDS.map((v) => ({ id: 'vessel_' + v.id, he: v.text_he.startsWith(v.title) ? v.text_he : `${v.title}: ${v.text_he}`, ref: v.source }));

export function icon(g, s) {
  g.fillStyle = '#6B4524'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  try { const A = createArt(Math.round(s * 2)); g.drawImage(A.get('v0'), s * 0.12, s * 0.1, s * 0.76, s * 0.76); } catch (e) { /* */ }
}

export const GAME = {
  id: 'memory', title: 'זיכרון הכלים', sub: 'מצאו זוגות של כלי המקדש', chip: 'לבד · או שניים', pay: { gold: 6 },
  how: [
    'הקישו על שני קלפים. אותו כלי בשניהם — זוג! הוא נשאר פתוח.',
    'מצאתם זוג? עוד תור. לא זוג? הקלפים נסגרים — וזוכרים איפה היו.',
    'בשניים: כל זוג שמצאת שלך; טעות מעבירה את התור. בלי שעון.',
  ],
  solo: 'לבד', soloSub: 'מוצאים את כל ששת הזוגות, בלי שעון',
  icon,
  facts: FACTS,
  run,
};

function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

async function run(S, ctx) {
  const { duel, sfx = () => {}, rnd = Math.random, reduced } = ctx;
  injectCSS('g10-mem-css', CSS);
  const L = S.turnLayout(duel);
  const bands = [L.bot, L.top];
  if (duel) bands.forEach((b, i) => b.set({ name: PLAYERS[i].name, score: 0, unit: 'זוגות' }));
  else { L.bot.set({ name: 'אתה', score: 0, unit: 'זוגות' }); L.top.set({ name: 'זיכרון הכלים', msg: 'מצאו את כל ששת הזוגות', score: 0, unit: 'ניסיונות' }); L.top.el.querySelector('.dot').style.background = '#D8AB58'; }
  const cards = shuffle([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5], rnd).map((v) => ({ v, up: false, done: false, by: -1 }));
  const grid = h('div', 'g10-mem'); grid.setAttribute('role', 'application'); grid.setAttribute('aria-label', 'זיכרון הכלים: הקישו על שני קלפים');
  L.board.appendChild(grid);
  const A = createArt(160);
  const els = cards.map((c, i) => {
    const b = h('button', 'g10-mc', '<span class="in"><span class="bk"></span><span class="fc"></span></span>');
    b.type = 'button'; b.dataset.i = String(i); b.setAttribute('aria-label', 'קלף סגור');
    grid.appendChild(b); return b;
  });
  function layout() {
    const r = L.board.getBoundingClientRect(), gap = 8, n = cards.length;
    let best = null;
    for (const cols of [3, 4, 2, 6]) {
      const rows = Math.ceil(n / cols);
      const w = Math.min((r.width - 12 - gap * (cols - 1)) / cols, ((r.height - 12 - gap * (rows - 1)) / rows) * 0.82);
      if (!best || w > best.w) best = { cols, rows, w };
    }
    const w = Math.max(44, Math.floor(Math.min(best.w, 120))), hh = Math.round(w / 0.82);
    grid.style.gridTemplateColumns = `repeat(${best.cols}, ${w}px)`; grid.style.gridAutoRows = hh + 'px';
  }
  const onResize = () => layout();
  globalThis.addEventListener('resize', onResize);
  await sleep(30); layout();

  let turn = duel && ctx.first === 1 ? 1 : 0, picks = [], busy = false, tries = 0, quit = false, lastV = -1;
  const pairs = [0, 0];
  let finish = null;
  const done = new Promise((r) => { finish = r; });
  function bandsFor() {
    if (!duel) { L.bot.set({ on: true, msg: picks.length ? 'ועוד קלף אחד' : 'הקש על קלף', score: pairs[0] }); L.top.set({ score: tries }); return; }
    bands.forEach((b, i) => b.set({ on: i === turn, msg: i === turn ? (picks.length ? 'ועוד קלף אחד' : 'תורך — הקש על קלף') : 'ממתין לתורו', score: pairs[i] }));
  }
  function show(i, on) {
    const c = cards[i], b = els[i], fc = b.querySelector('.fc');
    c.up = on;
    if (on) {
      const V = VESSEL_CARDS[c.v] || { title: '' };
      fc.innerHTML = ''; const cv = A.get('v' + c.v); const im = document.createElement('canvas'); im.width = cv.width; im.height = cv.height; im.getContext('2d').drawImage(cv, 0, 0);
      fc.appendChild(im); fc.appendChild(h('em', null, esc(V.title)));
      fc.classList.toggle('r180', duel && turn === 1);
      b.dataset.v = String(c.v); b.setAttribute('aria-label', V.title);
    } else { delete b.dataset.v; b.setAttribute('aria-label', 'קלף סגור'); setTimeout(() => { if (!cards[i].up) fc.innerHTML = ''; }, 300); }
    b.classList.toggle('up', on);
  }
  grid.addEventListener('click', async (e) => {
    const b = e.target.closest('.g10-mc'); if (!b || busy || quit) return;
    const i = +b.dataset.i, c = cards[i];
    if (c.up || c.done) return;
    sfx('pop'); show(i, true); picks.push(i); bandsFor();
    if (picks.length < 2) return;
    busy = true; tries++;
    const [x, y] = picks;
    if (cards[x].v === cards[y].v) {
      for (const k of picks) { cards[k].done = true; cards[k].by = turn; els[k].classList.add('done'); els[k].style.setProperty('--pc', PLAYERS[turn].color); }
      pairs[turn]++; lastV = cards[x].v; picks = [];
      sfx('chime', { combo: pairs[0] + pairs[1] });
      const V = VESSEL_CARDS[cards[x].v];
      if (V) S.toast(L.board, `<b>${esc(V.title)}</b>${esc(V.card_he)} <span class="g10-tag">טיוטה</span><span class="g10-src">${esc(V.source)}</span>`, reduced ? 1400 : 2000, duel && turn === 1);
      bandsFor();
      await sleep(reduced ? 500 : 900);
      busy = false;
      if (cards.every((k) => k.done)) finish(true);
    } else {
      bandsFor();
      await sleep(1000);
      if (quit) return;
      show(x, false); show(y, false); picks = [];
      if (duel) turn = 1 - turn;
      await sleep(250);
      busy = false; bandsFor();
    }
  });
  L.bot.el.querySelector('[data-exit]').addEventListener('click', async () => { if (await S.confirm('לצאת מהמשחק?')) { quit = true; finish(false); } });
  grid.__g10 = {
    state: () => ({ turn, busy, tries, pairs: pairs.slice(), n: cards.length,
      cards: els.map((b, i) => ({ i, up: cards[i].up, done: cards[i].done, v: b.dataset.v != null ? +b.dataset.v : null })) }),
  };
  bandsFor();
  try {
    const ok = await done;
    if (!ok) return { quit: true, tries };
    sfx('m3win');
    await sleep(reduced ? 300 : 700);
    return { winner: duel ? (pairs[0] === pairs[1] ? -1 : pairs[0] > pairs[1] ? 0 : 1) : 0, pairs: pairs.slice(), tries, last: lastV };
  } finally { globalThis.removeEventListener('resize', onResize); }
}
