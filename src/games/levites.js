/* ─────────────────────────────────────────────────────────────────────────────
 * games/levites.js — (GAMES10) "שיר הלויים": the classic sequence game (listen, repeat, one more), dressed as the Levites'
 * instruments on the steps — the lyre (כינור), the harp (נבל), the cymbals (מצלתיים) and the trumpet (חצוצרה): each its own
 * colour, shape, name and note (colour-blind safe). Solo: the leader plays a phrase, you repeat it, it grows by one note, up
 * to 12. A duel on one phone: each in turn repeats the whole song and adds one note of his own; the song ends when a note
 * slips (or at 16, a whole song). No clock: the player takes all the time he wants.
 *   run(S, { duel, first, sfx, reduced, muted }) → { winner: 0 | 1 | -1, len, quit }
 * Test hook: the pads' box __g10 = { state() } — the phase, whose turn, the song so far (what was heard), the place in it.
 * ──────────────────────────────────────────────────────────────────────────── */
import { h, esc, sleep, injectCSS, PLAYERS } from './shell.js';

const CAP_SOLO = 12, CAP_DUEL = 16;
const PADS = [
  { id: 'kinor', he: 'כינור', color: '#C98A22', lit: '#FFD56A', f: 329.6, wave: 'triangle' },
  { id: 'nevel', he: 'נבל', color: '#2F63A8', lit: '#8EC2FF', f: 392.0, wave: 'triangle' },
  { id: 'tziltzal', he: 'מצלתיים', color: '#A3352F', lit: '#FF8A7A', f: 440.0, wave: 'square' },
  { id: 'chatzotzra', he: 'חצוצרה', color: '#2E7D4F', lit: '#86E0A6', f: 523.3, wave: 'sawtooth' },
];
const CSS = `
.g10-lv{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:400px;padding:4px;direction:ltr;touch-action:manipulation}
.g10-pad{position:relative;aspect-ratio:1;min-height:44px;border-radius:26px;border:3px solid rgba(255,236,190,.55);background:var(--pc);color:#FFF6E4;
 display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;box-shadow:0 6px 0 rgba(0,0,0,.35);transition:transform .08s,filter .12s,box-shadow .12s;filter:saturate(.8) brightness(.86)}
.g10-pad svg{width:58%;height:auto}
.g10-pad b{font:900 18px/1 "Heebo",sans-serif;direction:rtl;text-shadow:0 1px 2px rgba(0,0,0,.5)}
.g10-pad.on{background:var(--pl);color:#3A220C;filter:none;transform:scale(1.04);box-shadow:0 0 0 4px #FFF3C4,0 0 28px var(--pl)}
.g10-pad.on b{text-shadow:none}
.g10-pad:disabled{cursor:default}
.g10-lv.r180 .g10-pad svg,.g10-lv.r180 .g10-pad b{transform:rotate(180deg)}
@media (prefers-reduced-motion:reduce){.g10-pad{transition:none}.g10-pad.on{transform:none}}
`;
/* the instruments, drawn as simple line icons (currentColor) */
const ICONS = {
  kinor: '<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"><path d="M16 50 C8 30 10 14 16 8 M44 50 C52 30 50 14 44 8"/><path d="M12 14 H48"/><path d="M16 50 H44"/><path d="M23 14 V50 M30 14 V50 M37 14 V50" stroke-width="1.8"/></g></svg>',
  nevel: '<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 52 V8 L48 46 Z"/><path d="M20 16 V50 M26 23 V50 M32 30 V50 M38 37 V50" stroke-width="1.8"/></g></svg>',
  tziltzal: '<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2"><ellipse cx="21" cy="32" rx="14" ry="14"/><ellipse cx="39" cy="28" rx="14" ry="14"/><circle cx="21" cy="32" r="3" fill="currentColor"/><circle cx="39" cy="28" r="3" fill="currentColor"/></g></svg>',
  chatzotzra: '<svg viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 34 H40"/><path d="M40 34 L54 22 V46 Z"/><path d="M10 30 V38"/></g></svg>',
};
export const FACTS = [   // FACTS8B's content/facts.json, word for word (ids kept)
  { id: 'f_nashim_torches', he: 'בשמחת בית השואבה רקדו חסידים ואנשי מעשה ואבוקות בידיהם, והלוויים ניגנו בכינורות, בנבלים, במצלתיים ובחצוצרות על חמש עשרה המעלות.', ref: 'משנה סוכה ה, ד' },
  { id: 'f_nik_15', he: 'מעזרת הנשים עלו לעזרת ישראל חמש עשרה מעלות, כנגד חמשה עשר שירי המעלות שבתהלים; עליהן שרו הלוויים.', ref: 'משנה מדות ב, ה' },
  { id: 'f_nik_music', he: 'מתחת לעזרת ישראל היו לשכות שנפתחו לעזרת הנשים; שם הניחו הלוויים כינורות, נבלים, מצלתיים וכל כלי השיר.', ref: 'משנה מדות ב, ו' },
  { id: 'f_koh_officers', he: 'בין הממונים במקדש: בן אחיה על חולי מעיים, בן גבר על נעילת השערים, בן ארזה על הצלצל, והגרס בן לוי על השיר.', ref: 'משנה שקלים ה, א' },
];
export function icon(g, s) {
  const c = [['#C98A22', 0, 0], ['#2F63A8', 1, 0], ['#A3352F', 0, 1], ['#2E7D4F', 1, 1]];
  g.fillStyle = '#4A2E14'; g.beginPath(); g.roundRect ? g.roundRect(0, 0, s, s, s * 0.2) : g.rect(0, 0, s, s); g.fill();
  const p = s * 0.08, q = (s - p * 3) / 2;
  for (const [col, x, y] of c) { g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(p + x * (q + p), p + y * (q + p), q, q, q * 0.25) : g.rect(p + x * (q + p), p + y * (q + p), q, q); g.fill(); }
  g.fillStyle = '#FFE08A'; g.beginPath(); g.arc(s / 2, s / 2, s * 0.09, 0, Math.PI * 2); g.fill();
}

export const GAME = {
  id: 'levites', title: 'שיר הלויים', sub: 'הקשיבו לכלי השיר — וחזרו על הלחן', chip: 'לבד · או שניים', pay: { silver: 8 },
  how: [
    'כינור, נבל, מצלתיים וחצוצרה: לבד — מקשיבים ללחן, וחוזרים עליו בהקשה.',
    'כל לחן שהצלחתם — מתארך בצליל אחד. עד שנים עשר צלילים.',
    'בשניים: כל אחד בתורו חוזר על כל הלחן ומוסיף צליל משלו. בלי שעון.',
  ],
  solo: 'לבד', soloSub: 'הלחן גדל צליל אחר צליל',
  icon,
  facts: FACTS,
  run,
};

let actx = null;
/** (iOS) the audio must start inside a tap: the shell calls this from its cards' taps (the mode card included) */
export function unlock() {
  try { const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return; if (!actx) actx = new AC(); if (actx.state === 'suspended') actx.resume(); } catch (e) { /* no audio */ }
}
function tone(pad, muted) {
  try {
    if (muted && muted()) return;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext; if (!AC) return;
    if (!actx) actx = new AC();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
    o.type = pad.wave; o.frequency.value = pad.f;
    f.type = 'lowpass'; f.frequency.value = pad.wave === 'sawtooth' ? 1800 : 2600;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + (pad.id === 'tziltzal' ? 0.5 : 0.42));
    o.connect(f); f.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.55);
  } catch (e) { /* sound is never load-bearing */ }
}

async function run(S, ctx) {
  const { duel, sfx = () => {}, reduced, muted, rnd = Math.random } = ctx;
  injectCSS('g10-lv-css', CSS);
  const L = S.turnLayout(duel);
  const bands = [L.bot, L.top];
  if (duel) bands.forEach((b, i) => b.set({ name: PLAYERS[i].name, score: 0, unit: 'צלילים' }));
  else { L.bot.set({ name: 'אתה', score: 0, unit: 'צלילים' }); L.top.set({ name: 'המנצח', msg: 'מנגן, ואתה חוזר', score: CAP_SOLO, unit: 'עד' }); L.top.el.querySelector('.dot').style.background = '#D8AB58'; }
  const box = h('div', 'g10-lv'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'שיר הלויים: הקישו על הכלים לפי הלחן');
  const els = PADS.map((p, i) => {
    const b = h('button', 'g10-pad', `${ICONS[p.id]}<b>${esc(p.he)}</b>`); b.type = 'button'; b.dataset.pad = String(i);
    b.style.setProperty('--pc', p.color); b.style.setProperty('--pl', p.lit); b.setAttribute('aria-label', p.he);
    box.appendChild(b); return b;
  });
  L.board.appendChild(box);
  const fit = () => { const r = L.board.getBoundingClientRect(); box.style.maxWidth = Math.max(200, Math.min(400, r.width - 12, r.height - 12)) + 'px'; };
  globalThis.addEventListener('resize', fit); fit();
  const seq = [];
  let phase = 'wait', turn = duel && ctx.first === 1 ? 1 : 0, idx = 0, quit = false, finish = null, best = 0;
  const done = new Promise((r) => { finish = r; });
  const flash = async (i, ms = reduced ? 300 : 420) => { els[i].classList.add('on'); tone(PADS[i], muted); await sleep(ms); els[i].classList.remove('on'); };
  function say() {
    box.classList.toggle('r180', duel && turn === 1);
    if (!duel) { L.bot.set({ on: phase === 'play', msg: phase === 'listen' ? 'הקשב…' : phase === 'play' ? `עכשיו אתה: ${idx + 1} מתוך ${seq.length}` : 'יפה!', score: best }); L.top.set({ on: phase === 'listen' }); return; }
    bands.forEach((b, i) => b.set({ on: i === turn && phase === 'play', score: seq.length,
      msg: i !== turn ? 'מקשיב' : !seq.length ? 'פתח את השיר: הקש על כלי' : idx < seq.length ? `חזור על השיר: ${idx + 1} מתוך ${seq.length}` : 'עכשיו הוסף צליל משלך' }));
  }
  async function listen() {
    phase = 'listen'; say();
    await sleep(reduced ? 300 : 650);
    for (const i of seq) { if (quit) return; await flash(i); await sleep(reduced ? 120 : 180); }
    phase = 'play'; idx = 0; say();
  }
  box.addEventListener('pointerdown', async (e) => {
    const b = e.target.closest('.g10-pad'); if (!b || phase !== 'play' || quit) return;
    e.preventDefault();
    const i = +b.dataset.pad;
    flash(i, reduced ? 200 : 260);
    if (idx < seq.length) {
      if (seq[idx] !== i) { phase = 'end'; sfx('pop'); await sleep(500); finish({ slip: true }); return; }
      idx++;
      if (!duel && idx === seq.length) {   // the phrase is whole: one note longer (or the whole song)
        best = seq.length; phase = 'wait'; say(); sfx('chime', { combo: seq.length });
        if (seq.length >= CAP_SOLO) { await sleep(600); finish({ whole: true }); return; }
        await sleep(reduced ? 300 : 700); seq.push(Math.floor(rnd() * 4)); listen(); return;
      }
      say(); return;
    }
    // a duel: past the song, this note is his own addition
    seq.push(i); phase = 'wait'; sfx('chime', { combo: seq.length });
    if (seq.length >= CAP_DUEL) { await sleep(600); finish({ whole: true }); return; }
    await sleep(reduced ? 250 : 650);
    turn = 1 - turn; idx = 0; phase = 'play'; say();
  });
  L.bot.el.querySelector('[data-exit]').addEventListener('click', async () => { if (await S.confirm('לצאת מהשיר?')) { quit = true; finish({ quit: true }); } });
  box.__g10 = { state: () => ({ phase, turn, idx, seq: seq.slice(), duel: !!duel }) };
  await sleep(40);
  if (duel) { phase = 'play'; say(); } else { seq.push(Math.floor(rnd() * 4)); listen(); }
  try {
    const r = await done;
    if (r.quit) return { quit: true };
    if (!duel) return { winner: 0, len: best, whole: !!r.whole };
    return { winner: r.whole ? -1 : 1 - turn, len: seq.length, slipAt: idx + 1, whole: !!r.whole };
  } finally { globalThis.removeEventListener('resize', fit); }
}
