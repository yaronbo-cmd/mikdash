// Phase B playtest bots (HOOKS agent): persona bots play the REAL Phase B HUD, rules and mini-games (src/avodah via the
// avodah harness page: a mock world, no WebGL) on a VIRTUAL clock (Playwright page.clock), at the game's real pacing
// (not ?fast=1), so a week of mornings takes a few minutes. The bot's brain runs inside the page on the page's own (fake)
// timers: it reads the screen (the name pick, modal cards, the mini-game panel, the home) and acts like the persona:
// reads a card for as long as its words take at the persona's reading speed (capped by patience), reads a game's intro,
// then lets the game's own solver play it (real DOM events on the game's elements, at the game's own pace: the floor of
// a human's time), skips like a child would, follows a plan on the home (join live, play a chain, open a tab).
//   node test/playtest/avodah-bots.cjs [--only=newLink,regular,...] [--label=before] [--no-build] [--shots]
// Output: test/out/playtest/avodah-<label>.json and a table on stdout; screenshots with --shots
// (test/out/playtest/av-<label>-<persona>-*.png).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const LABEL = (args.find((a) => a.startsWith('--label=')) || '--label=now').slice(8);
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const SHOTS = args.includes('--shots');
if (!args.includes('--no-build')) {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(ROOT, 'test/avodah-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/avodah-harness.bundle.js'), logLevel: 'warning' });
}

/* ── personas ── wpm: reading speed (Hebrew, on a phone) · patience: the most time given to one card (ms) ·
   intro: the most time given to a game's intro line · skipAfter: taps "דלג" when a game is still open after this (s) ·
   plan: what the persona does on the home, in order (join | play:<what> | tab:<id> | more (another pilgrim) | end) */
const PHASE_A = JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8, priests: 6, st: { har: { done: true }, wall: { done: true } } });
const PERSONAS = {
  newLink: { label: 'new player by link (#avodah)', start: '2026-09-25T09:00:00+03:00', wpm: 160, patience: 12000, intro: 4000, name: 'נועם', plan: ['join', 'play:shachar', 'end'], maxMin: 20, shots: ['name', 'home', 'firstGame', 'summary'] },
  newRitual: { label: 'new player by link, follows the gold button ("העבודה שלך היום")', start: '2026-09-25T13:00:00+03:00', wpm: 160, patience: 12000, intro: 4000, name: 'נועם', plan: ['MINE', 'tab:path', 'end'], maxMin: 12, shots: ['home', 'firstGame', 'summary', 'path'] },
  newMenu: { label: 'new player from the Phase A menu', start: '2026-09-25T09:00:00+03:00', init: { bh_beta2: PHASE_A }, wpm: 160, patience: 10000, intro: 3500, plan: ['join', 'play:shachar', 'end'], maxMin: 20 },
  child: { label: 'the child (10–12)', start: '2026-09-25T16:40:00+03:00', wpm: 90, patience: 1600, intro: 1200, skipAfter: 40, name: '', plan: ['play:shachar', 'end'], maxMin: 20, shots: ['home', 'firstGame'] },
  investor: { label: 'the investor (5 min)', start: '2026-09-25T11:00:00+03:00', wpm: 200, patience: 3000, intro: 1500, name: 'אורח', plan: ['join', 'play:shachar', 'end'], maxMin: 5 },
  binger: { label: 'the binger (one long evening)', start: '2026-09-27T19:20:00+03:00', init: { bh_beta2: PHASE_A }, wpm: 180, patience: 5000, intro: 2000, plan: ['join', 'play:shachar', 'play:korbanot', 'more', 'play:musaf', 'play:erevchain', 'play:shachar', 'tab:path', 'play:shachar', 'end'], maxMin: 75 },
  ritual: { label: 'the ritual player (7 days, "העבודה שלך היום" only, keeps Shabbat)', days: [
    { at: '2026-09-25T13:00:00+03:00', plan: ['play:mine', 'end'] },
    { at: '2026-09-26T13:00:00+03:00', skip: true },
    { at: '2026-09-27T21:30:00+03:00', plan: ['play:mine', 'end'] },
    { at: '2026-09-28T21:30:00+03:00', plan: ['play:mine', 'end'] },
    { at: '2026-09-29T21:30:00+03:00', plan: ['play:mine', 'end'] },
    { at: '2026-09-30T21:30:00+03:00', plan: ['play:mine', 'end'] },
    { at: '2026-10-01T21:30:00+03:00', plan: ['play:mine', 'end'] },
  ], init: { bh_beta2: PHASE_A }, wpm: 170, patience: 6000, intro: 2000, maxMin: 15 },
  regular: { label: 'the daily regular (7 days, live windows, keeps Shabbat)', days: [
    { at: '2026-09-25T06:30:00+03:00', plan: ['join', 'MINE', 'end'] },               // Fri: live morning (from where it is)
    { at: '2026-09-26T10:00:00+03:00', skip: true },                                   // Shabbat + Yom Tov: no play
    { at: '2026-09-27T06:35:00+03:00', plan: ['join', 'MINE', 'end'] },
    { at: '2026-09-27T20:10:00+03:00', plan: ['join', 'end'] },                       // Beit HaShoevah (live)
    { at: '2026-09-28T06:40:00+03:00', plan: ['join', 'MINE', 'end'] },
    { at: '2026-09-29T06:35:00+03:00', plan: ['join', 'MINE', 'end'] },
    { at: '2026-09-30T06:45:00+03:00', plan: ['join', 'MINE', 'end'] },
    { at: '2026-10-01T06:40:00+03:00', plan: ['join', 'MINE', 'end'] },
  ], init: { bh_beta2: PHASE_A }, wpm: 170, patience: 6000, intro: 2000, maxMin: 30 },
};

/* ── the in-page brain (runs on the page's fake timers) ── */
function brain(P) {
  const B = window.__BOT = { P, cards: [], games: [], runs: [], acts: [], firsts: {}, inputs: 0, taps: 0, ended: false, plan: (P.plan || []).slice(), summary: null, homeTexts: [] };
  const T0 = performance.now();
  const s = () => Math.round(performance.now() - T0) / 1000;
  const q = (sel) => document.querySelector(sel);
  const words = (t) => (String(t || '').trim().match(/\S+/g) || []).length;
  const first = (k) => { if (!(k in B.firsts)) B.firsts[k] = s(); };
  const act = (k, d) => B.acts.push({ t: s(), k, d });
  const click = (el) => { if (el) { el.click(); B.taps++; } return !!el; };
  let cur = null, lastCardClose = 0, cardSince = 0, cardKey = '', solving = false, gameSince = 0, homeSince = 0;
  // every pointer press inside a mini-game panel is one decision (the solver's presses are the game's own taps)
  document.addEventListener('pointerdown', (e) => {
    const t = e.target, mg = t && t.closest && t.closest('.av-mg');
    if (!mg || (t.closest && t.closest('.av-skip')) || !cur) return;
    const now = s();
    cur.inputs++; B.inputs++;
    if (cur.first == null) { cur.first = now; first('firstInput'); }
    if (cur.lastIn != null && now - cur.lastIn > 0.8) cur.waits += now - cur.lastIn;
    cur.lastIn = now;
  }, true);
  const vis = (el) => !!el && el.getBoundingClientRect().height > 0;
  function visibleText(card) {
    // what is on screen without opening the folded "עוד מקורות"
    const c = card.cloneNode(true);
    c.querySelectorAll('details').forEach((d) => { const sm = d.querySelector('summary'); d.replaceWith(sm ? sm.textContent : ''); });
    return c.innerText || c.textContent || '';
  }
  function step() {
    if (B.ended) return;
    if (window.__SHOT) { setTimeout(step, 200); return; }   // a screenshot is pending: hold still
    try {
      const av = window.__AV && window.__AV.av;
      if (!av) { setTimeout(step, 200); return; }
      const gid = av._.game;
      const mgOpen = !!q('.av-mg.on');
      const modal = q('.av-modal.on .av-card');
      // a card that went away by itself (the brief card of a repeat moves on after a few seconds)
      if (!modal && cardKey) { if (B.curCard && B.curCard.shownS == null) { B.curCard.shownS = +(s() - cardSince).toFixed(1); B.curCard.auto = true; } cardKey = ''; lastCardClose = s(); }
      // 1) the name pick
      if (modal && modal.querySelector('.av-input')) {
        first('namePick');
        if (!cardSince) { cardSince = s(); act('namePick'); }
        if (s() - cardSince < (P.nameMs || 6) ) { setTimeout(step, 250); return; }
        const inp = modal.querySelector('.av-input'); inp.value = P.name || '';
        if (P.name) click(modal.querySelector('[data-m="8"]'));
        click(modal.querySelector(P.name ? '[data-v="ok"]' : '[data-v="rand"]'));
        B.cards.push({ t: s(), kind: 'name', words: words(visibleText(modal)), shownS: +(s() - cardSince).toFixed(1) });
        cardSince = 0; lastCardClose = s();
        setTimeout(step, 300); return;
      }
      // 2) a mini-game
      if (gid && mgOpen) {
        if (!cur || cur.id !== gid || cur.closed) {
          const wrap = q('.av-mg.on');
          const intro = wrap ? (wrap.querySelector('.av-mg-intro') || {}).textContent || '' : '';
          const badges = wrap ? [...wrap.querySelectorAll('.av-badge')].map((b) => b.textContent) : [];
          cur = { id: gid, open: s(), gap: +(s() - lastCardClose).toFixed(2), inputs: 0, waits: 0, first: null, lastIn: null, introWords: words(intro), badges };
          B.games.push(cur); first('firstGame'); solving = false; gameSince = s();
          if (P.shotFirstGame && B.games.length === 1) window.__SHOT = 'firstGame';
        }
        if (!solving) {
          const readMs = Math.min(P.intro, (cur.introWords / P.wpm) * 60000);
          if ((s() - gameSince) * 1000 >= readMs) { solving = true; av._.solve(); }
        } else if (P.skipAfter && s() - gameSince > P.skipAfter) {
          const sk = q('.av-mg.on .av-skip');
          if (sk) { cur.skipped = true; click(sk); act('skip', cur.id); }
        }
        setTimeout(step, 100); return;
      }
      if (cur && !gid && !cur.closed) { cur.closed = s(); cur.floor = +(cur.closed - cur.open).toFixed(2); }
      // 3) a card (sources after a game, the intro, the summary, a ממונה)
      if (modal) {
        const key = modal.innerText.slice(0, 80);
        if (key !== cardKey) {
          cardKey = key; cardSince = s();
          const kick = (modal.querySelector('.av-kick') || {}).textContent || '';
          const title = (modal.querySelector('h2') || {}).textContent || '';
          const vt = visibleText(modal);
          const rec = { t: s(), kick: kick.trim(), title: title.replace(/\s*טיוטה\s*$/, '').trim(), words: words(vt), folded: modal.querySelectorAll('details .av-sub').length, gains: [...modal.querySelectorAll('.av-gain span')].map((x) => x.textContent), button: (modal.querySelector('.av-go') || {}).textContent || '', brief: !!modal.querySelector('.hk-brief'), autoBar: !!modal.querySelector('.hk-auto'), alt: (modal.querySelector('[data-v="alt"]') || {}).textContent || '' };
          if (rec.brief && !rec.title) rec.title = ((modal.querySelector('.hk-brief b') || {}).textContent || '').trim();
          if (/סוף העבודה/.test(kick)) { rec.kind = 'summary'; rec.lines = [...modal.querySelectorAll('li')].map((l) => l.textContent); B.summary = rec; if (P.shotSummary) window.__SHOT = 'summary'; }
          else if (/ברוך הבא/.test(title)) rec.kind = 'intro';
          else if (/ממונה/.test(kick)) rec.kind = 'memuneh';
          else rec.kind = 'source';
          B.cards.push(rec); first('card:' + rec.kind);
          B.curCard = rec;
        }
        const rec = B.curCard;
        const need = Math.min(P.patience, (rec.words / P.wpm) * 60000);
        if ((s() - cardSince) * 1000 >= need) {
          rec.shownS = +(s() - cardSince).toFixed(1);
          const alt = modal.querySelector('[data-v="alt"]');
          if (alt && (B.plan[0] === 'more' || ((B.plan[0] === 'play:mine' || B.plan[0] === 'MINE') && rec.kind === 'summary'))) { act(B.plan.shift() === 'more' ? 'more' : 'mineFromSummary'); click(alt); }
          else click(modal.querySelector('.av-go'));
          cardKey = ''; lastCardClose = s();
        }
        setTimeout(step, 100); return;
      }
      // 4) the home
      const home = q('.av-home.on');
      if (home && !av.busy) {
        if (!homeSince) { homeSince = s(); first('home'); B.homeTexts.push({ t: s(), text: (home.innerText || '').slice(0, 1200), hk: { today: !!home.querySelector('.hk-today'), mine: !!home.querySelector('[data-play="mine"]'), mineGold: !!home.querySelector('.hk-mine.gold'), bulls: !!home.querySelector('.hk-bulls'), pa: !!home.querySelector('.hk-pa'), tiers: home.querySelectorAll('.hk-tag').length } }); if (P.shotHome && !B.shotHomeDone) { B.shotHomeDone = true; window.__SHOT = 'home'; } }
        if (s() - homeSince < (P.homeMs || 3)) { setTimeout(step, 200); return; }
        let next = B.plan.shift();
        homeSince = 0;
        if (next === 'MINE') next = home.querySelector('[data-play="mine"]') && !(B.acts.some((a) => a.k === 'mineFromSummary')) ? 'play:mine' : B.plan.shift();
        if (!next || next === 'end') { B.ended = true; B.endS = s(); act('end'); return; }
        if (next === 'join') {
          const j = home.querySelector('[data-a="join"]');
          if (j) { click(j); act('join'); first('join'); } else act('noLive');
        } else if (next.startsWith('play:')) {
          const w = next.slice(5), b = home.querySelector(`[data-play="${w}"]`);
          if (b) { click(b); act('play', w); } else { av._.run(w); act('run', w); }
        } else if (next.startsWith('tab:')) {
          click(home.querySelector(`[data-tab="${next.slice(4)}"]`)); act('tab', next.slice(4));
          B.homeTexts.push({ t: s(), text: (home.innerText || '').slice(0, 1500), hk: { vessels: home.querySelectorAll('.hk-vessels span.got').length, tiers: home.querySelectorAll('.hk-tiers span').length, mishmar: /עולה לירושלים|עובד השבוע/.test(home.innerText) } });
          if (P.shotPath) window.__SHOT = next.slice(4);
        }
        setTimeout(step, 600); return;
      }
      if (!home && !av.busy && !modal && !gid) { const hb = q('.av [data-a="home"]'); if (hb && s() - lastCardClose > 2) click(hb); }
      setTimeout(step, 150);
    } catch (e) { act('error', String(e && e.message)); setTimeout(step, 500); }
  }
  setTimeout(step, 300);
}

async function session(b, key, P, { at, plan, init, label }) {
  const W = 390, H = 844;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const pg = await ctx.newPage();
  const errors = [];
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  pg.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
  const start = new Date(at);
  await pg.clock.install({ time: start });
  await pg.clock.pauseAt(start);
  await pg.addInitScript(({ init }) => {
    try { localStorage.clear(); for (const [k, v] of Object.entries(init || {})) localStorage.setItem(k, v); } catch (e) { /* */ }
    // 20 frames a second on the fake clock: the games' loops cap dt at 50 ms, so their speed is unchanged
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 50);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }, { init });
  await pg.goto('file://' + path.join(ROOT, 'test/avodah-harness.html'));
  await pg.evaluate(brain, { ...P, plan, shotFirstGame: SHOTS && (P.shots || []).includes('firstGame'), shotSummary: SHOTS && (P.shots || []).includes('summary'), shotHome: SHOTS && (P.shots || []).includes('home'), shotPath: SHOTS && (P.shots || []).includes('path') });
  const t0 = Date.now(), maxMs = (P.maxMin || 20) * 60000;
  let v = 0;
  while (v < maxMs) {
    await pg.clock.runFor(5000); v += 5000;
    const st = await pg.evaluate(() => ({ ended: window.__BOT.ended, shot: window.__SHOT || null }));
    if (st.shot) { await pg.evaluate(() => { window.__SHOT = null; }); await pg.screenshot({ path: path.join(OUT, `av-${LABEL}-${key}${label ? '-' + label : ''}-${st.shot}.png`) }); }
    if (st.ended) break;
  }
  const data = await pg.evaluate(() => ({ bot: window.__BOT, log: window.__AV_LOG.map((e) => ({ t: e.t, type: e.type, d: e.d })), state: window.__AV.av.state, save: localStorage.getItem('bh_avodah'), divine: window.__AV_NAMES.slice(0, 5) }));
  await ctx.close();
  return { realS: +((Date.now() - t0) / 1000).toFixed(1), virtualMin: +(v / 60000).toFixed(1), errors: errors.slice(0, 6), ...data };
}

/** what of the hooks layer the persona actually met on screen (DOM facts, for the report's checks) */
function hooksSeen(r) {
  const c = r.bot.cards, h = r.bot.homeTexts;
  const any = (f) => h.some((x) => x.hk && f(x.hk));
  return {
    dayPanel: any((x) => x.today), ritualButton: any((x) => x.mine), bulls: any((x) => x.bulls), phaseALine: any((x) => x.pa),
    briefCards: c.filter((x) => x.brief).length, autoAdvanced: c.filter((x) => x.auto).length, fullCards: c.filter((x) => x.kind === 'source' && !x.brief).length,
    summaryAlt: c.filter((x) => x.kind === 'summary' && x.alt).map((x) => x.alt), memunehCards: c.filter((x) => x.kind === 'memuneh').length,
    tomorrowLine: !!(r.bot.summary && r.bot.summary.lines.some((l) => /^מחר:/.test(l))), revealCard: c.some((x) => /הפייס של היום/.test(x.kick)),
    vessels: Math.max(0, ...h.map((x) => (x.hk && x.hk.vessels) || 0)), tierTags: Math.max(0, ...h.map((x) => (x.hk && x.hk.tiers) || 0)),
    gains: [...new Set(c.flatMap((x) => x.gains || []).filter((g) => /דרגה|כלי חדש|תרגול נוסף|משמרות|משמר בשבוע/.test(g)).map((g) => g.replace(/:.*/, '')))],
  };
}

function metrics(r, P) {
  const B = r.bot, g = B.games, c = B.cards;
  const endS = B.endS || r.virtualMin * 60;
  const src = c.filter((x) => x.kind === 'source');
  const readS = c.reduce((a, x) => a + (x.shownS || 0), 0);
  const wordsShown = c.reduce((a, x) => a + x.words, 0);
  const gameS = g.reduce((a, x) => a + (x.floor || 0), 0);
  const waitS = g.reduce((a, x) => a + x.waits, 0);
  const gapS = g.reduce((a, x) => a + (x.gap > 0 ? x.gap : 0), 0);
  const inputs = g.reduce((a, x) => a + x.inputs, 0);
  const deadStart = g.map((x) => (x.first != null ? x.first - x.open : x.floor || 0));
  const RK = r.state ? r.state.points : 0;
  return {
    endMin: +(endS / 60).toFixed(1),
    ttffS: B.firsts.firstInput != null ? +B.firsts.firstInput.toFixed(1) : null,       // boot → first tap in a game
    firstGameS: B.firsts.firstGame != null ? +B.firsts.firstGame.toFixed(1) : null,
    cardsBeforeFirstGame: c.filter((x) => B.firsts.firstGame == null || x.t < B.firsts.firstGame).length,
    games: g.length, skipped: g.filter((x) => x.skipped).length,
    cards: c.length, sourceCards: src.length, memunehCards: c.filter((x) => x.kind === 'memuneh').length,
    wordsShown, wordsPerCard: src.length ? Math.round(src.reduce((a, x) => a + x.words, 0) / src.length) : 0,
    wordsPerMin: Math.round(wordsShown / Math.max(0.1, endS / 60)),
    readMin: +(readS / 60).toFixed(1), readShare: Math.round((100 * readS) / Math.max(1, endS)),
    gameMin: +(gameS / 60).toFixed(1), inGameWaitMin: +(waitS / 60).toFixed(1), stageGapMin: +(gapS / 60).toFixed(1),
    deadStartS: deadStart.length ? +(deadStart.reduce((a, x) => a + x, 0) / deadStart.length).toFixed(1) : 0,
    decisions: inputs + B.taps, decisionsPerMin: +((inputs + B.taps) / Math.max(0.1, endS / 60)).toFixed(1),
    inputsPerGame: g.length ? +(inputs / g.length).toFixed(1) : 0,
    points: RK, forReal: g.filter((x) => x.badges.some((b) => /בפועל/.test(b))).length,
    summaryLines: B.summary ? B.summary.lines : [], summaryTomorrow: !!(B.summary && B.summary.lines.some((l) => /מחר|הבא במקדש/.test(l))),
    errors: r.errors.length, divine: r.divine.length,
  };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const out = {};
  try {
    for (const [k, P] of Object.entries(PERSONAS)) {
      if (ONLY.length && !ONLY.includes(k)) continue;
      if (!P.days) {
        const r = await session(b, k, P, { at: P.start, plan: P.plan, init: P.init });
        const m = metrics(r, P);
        out[k] = { label: P.label, realS: r.realS, metrics: m, games: r.bot.games.map((x) => ({ id: x.id, open: x.open, floor: x.floor, inputs: x.inputs, waits: +x.waits.toFixed(1), gap: x.gap, deadStart: x.first != null ? +(x.first - x.open).toFixed(1) : null, badges: x.badges, skipped: !!x.skipped })), cards: r.bot.cards, acts: r.bot.acts, home: r.bot.homeTexts.slice(0, 3), state: r.state && { points: r.state.points, book: Object.keys(r.state.book).length, roles: r.state.roles, streak: r.state.streak, games: Object.keys(r.state.games).length } };
        console.log(`${k.padEnd(9)} ${r.realS}s real · end ${m.endMin} min · TTFF ${m.ttffS}s (first game ${m.firstGameS}s, ${m.cardsBeforeFirstGame} cards before) · games ${m.games} (skipped ${m.skipped}) · cards ${m.cards} (${m.wordsPerCard} w/card, ${m.wordsPerMin} w/min, reading ${m.readShare}%) · in games ${m.gameMin} min (waits ${m.inGameWaitMin}, dead start ${m.deadStartS}s/game) · gaps ${m.stageGapMin} min · decisions ${m.decisions} (${m.decisionsPerMin}/min, ${m.inputsPerGame}/game) · points ${m.points} · memuneh cards ${m.memunehCards} · for real ${m.forReal} · errors ${m.errors}`);
        if (m.summaryLines.length) console.log(`          summary: ${m.summaryLines.join(' | ')}`);
        out[k].hooksSeen = hooksSeen(r);
        console.log(`          hooks seen: ${JSON.stringify(out[k].hooksSeen)}`);
      } else {
        let save = P.init || {};
        const days = [];
        const seenCards = new Set(), seenGames = new Set();
        for (const d of P.days) {
          if (d.skip) { days.push({ at: d.at, skip: true }); continue; }
          const r = await session(b, k, P, { at: d.at, plan: d.plan, init: save, label: d.at.slice(5, 10) });
          save = { ...save, bh_avodah: r.save };
          const m = metrics(r, P);
          const titles = r.bot.cards.filter((x) => x.kind === 'source').map((x) => x.title);
          const newTitles = titles.filter((t) => !seenCards.has(t));
          titles.forEach((t) => seenCards.add(t));
          const ids = r.bot.games.map((x) => x.id);
          const newGames = ids.filter((x) => !seenGames.has(x)); ids.forEach((x) => seenGames.add(x));
          const st = r.state;
          const day = { at: d.at, ...m, hooksSeen: hooksSeen(r), gamesPlayed: ids, newCards: newTitles.length, repeatCards: titles.length - newTitles.length, newGames: newGames.length, streak: st && st.streak, rank: st && st.points, roles: st && Object.keys(st.roles).length, lots: st && st.lots, home: r.bot.homeTexts[0] ? r.bot.homeTexts[0].text.slice(0, 600) : '' };
          days.push(day);
          console.log(`${k.padEnd(9)} ${d.at.slice(0, 16)} ${r.realS}s real · ${m.endMin} min · games ${ids.length} [${ids.join(',')}] · new cards ${newTitles.length}/${titles.length} · words/min ${m.wordsPerMin} · points ${st && st.points} · streak ${st && st.streak.n} · roles ${st && Object.keys(st.roles).length} · for real ${m.forReal}`);
          if (m.summaryLines.length) console.log(`          summary: ${m.summaryLines.join(' | ')}`);
        }
        out[k] = { label: P.label, days };
      }
    }
  } finally { await b.close(); }
  const file = path.join(OUT, `avodah-${LABEL}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify({ ...prev, ...out, when: new Date().toISOString() }, null, 1));
  console.log('wrote', path.relative(ROOT, file));
})().catch((e) => { console.error(e); process.exit(2); });
