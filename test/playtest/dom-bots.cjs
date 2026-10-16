// DOM playtest bots (HOOKS agent): persona bots play the REAL Phase A HUD (src/game via the game harness: the real
// UI and rules against a fake 3D world) on a VIRTUAL clock (Playwright page.clock), so 20 minutes of play take seconds.
// The bot's "brain" runs inside the page on the page's own (fake) timers: it reads the screen (coach, pill, modals,
// badges, the key-moment overlays) and acts like the persona would: taps the world (game.onBoulderTap / onSiteTap /
// onQuarryTap, exactly what main.js's picking calls), clicks the HUD, plays or skips the key moments.
//   node test/playtest/dom-bots.cjs [--only=firstTimer,child,...] [--label=before] [--no-build] [--shots]
// Output: test/out/playtest/dom-<label>.json (per persona: timeline, samples every 5 s, metrics) and screenshots
// test/out/playtest/<label>-<persona>-<mm_ss>.png (with --shots).
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
  esbuild.buildSync({ entryPoints: [path.join(ROOT, 'test/game-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/game-harness.bundle.js'), logLevel: 'warning' });
}

/* ── personas ── (ms) tap: the gap between taps while building · beat: share of taps aimed at the ring's beat ·
   read: time on a card before "המשך" · mash: taps in bursts regardless of the ring · explore: opens every tab when idle */
const PERSONAS = {
  firstTimer: { label: 'the curious first-timer', min: 20, start: '2026-10-04T19:30:00+03:00', tap: 1300, beat: 0.35, read: 7000, explore: true, sendAll: true, shots: ['00:05', '00:30', '01:00', '02:00', '03:00', '05:00', '08:00', '12:00', '20:00'] },
  child: { label: 'the child (10–12)', min: 12, start: '2026-10-04T16:00:00+03:00', tap: 190, beat: 0, read: 900, mash: true, followHand: true, shots: ['00:20', '01:30', '04:00', '08:00', '12:00'] },
  investor: { label: 'the investor (demo, 5 min)', min: 5, demo: true, start: '2026-10-05T11:00:00+03:00', tap: 800, beat: 0.4, read: 2500, sendAll: true, skipChapterEvery: 55000, highlightEvery: 32000, shots: ['00:10', '01:00', '02:00', '03:00', '04:00', '05:00'] },
  returner: { label: 'the returner (after 3 days)', min: 6, start: '2026-10-07T20:00:00+03:00', tap: 1100, beat: 0.35, read: 5000, sendAll: true, save: 'day1', shots: ['00:02', '00:15', '01:00', '06:00'] },
  presenter: { label: 'the presenter (#demo: the reel end to end)', min: 14, demo: true, start: '2026-10-05T11:00:00+03:00', tap: 800, beat: 0.4, read: 2500, sendAll: true, reel: true, shots: ['00:30', '03:00', '06:00'] },
  binger: { label: 'the binger (first hour)', min: 60, start: '2026-10-04T20:00:00+03:00', tap: 950, beat: 0.5, read: 3500, explore: true, sendAll: true, grind: true, shots: ['10:00', '30:00', '60:00'] },
  // (wave 6, FUN) the two teens: נועם, 16 — skill, speed, skips text, 5–15-min bus sessions; מאיה, 15 — builds, collects, explores, reads a little
  noam: { label: 'נועם, 16 (first session, on the bus)', min: 12, start: '2026-10-04T17:10:00+03:00', tap: 430, beat: 0.8, read: 1100, sendAll: true, skipAfter: 30, grind: true, shots: ['00:20', '01:00', '02:00', '03:00', '05:00', '08:00', '10:00', '12:00'] },
  maya: { label: 'מאיה, 15 (first evening)', min: 15, start: '2026-10-04T20:40:00+03:00', tap: 800, beat: 0.45, read: 2600, explore: true, sendAll: true, skipAfter: 45, shots: ['00:30', '02:00', '04:00', '07:00', '10:00', '15:00'] },
  noam2: { label: 'נועם, the next afternoon (return visit)', min: 8, start: '2026-10-05T16:40:00+03:00', tap: 430, beat: 0.8, read: 1100, sendAll: true, skipAfter: 30, grind: true, save: 'day1n', shots: ['00:05', '00:30', '02:00', '08:00'] },
  maya2: { label: 'מאיה, the next evening (return visit)', min: 10, start: '2026-10-05T21:00:00+03:00', tap: 800, beat: 0.45, read: 2600, explore: true, sendAll: true, skipAfter: 45, save: 'day1n', shots: ['00:05', '00:30', '03:00', '10:00'] },
};

/* ── the in-page brain (runs on the page's fake timers) ── */
function brain(P) {
  const B = window.__BOT = { P, taps: 0, tapsNoFx: 0, log: [], samples: [], firsts: {}, idleMs: 0, deadMs: 0, hollowMs: 0, acts: {}, moments: [], clicked: 0 };
  const T0 = performance.now();
  const ts = () => Math.round((performance.now() - T0) / 100) / 10;           // virtual seconds since boot
  const q = (s) => document.querySelector(s);
  const vis = (el) => !!el && !el.classList.contains('gm-hidden') && getComputedStyle(el).display !== 'none';
  const first = (k) => { if (!(k in B.firsts)) B.firsts[k] = ts(); };
  const act = (k, d) => { B.acts[k] = (B.acts[k] || 0) + 1; B.log.push({ t: ts(), k, d }); if (B.log.length > 1500) B.log.shift(); };
  const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
  const click = (el) => { if (el) { el.click(); B.clicked++; } return !!el; };
  let modalSince = 0, lastModal = '', momentState = null, lastSkip = 0, idleSince = 0, lastTab = 0, tabIx = 0, lastPillAct = -99;
  const G = () => __H.game.state;
  const game = () => __H.game;
  const strikes = () => window.__GAME_LOG.filter((e) => e.type === 'strike').length;

  function sample() {
    const pill = txt(q('.gm-pill')), coach = vis(q('.gm-bub')) ? txt(q('.gm-bub')) : '';
    const modal = q('.gm-modal.on .gm-card'), mo = q('.gm-mo.on');
    const strip = q('.gm-next'); const stripTxt = strip && !strip.classList.contains('gm-hidden') ? txt(strip) : '';
    B.samples.push({ t: ts(), pill, strip: stripTxt, coach, modal: modal ? txt(modal.querySelector('h2')) : '', moment: mo ? txt(mo.querySelector('.gm-mo-t')) : '', sheet: game().ui.sheet || '', ftue: G().ftue, res: { ...G().res }, strikes: strikes() });
  }
  setInterval(sample, 5000);
  sample();

  /* key moments: play them like the persona would */
  function playMoment(mo) {
    const kind = mo.querySelector('.gm-mo-hold') && mo.querySelector('.gm-mo-meter') ? 'boxes' : mo.querySelector('.gm-mo-hold') ? 'stone' : mo.querySelector('.gm-mo-gap') ? 'breaches' : mo.querySelector('.gm-mo-drag') ? 'red' : 'other';
    if (!momentState) { momentState = { kind, t: ts(), holding: false, n: 0 }; first('moment'); first('moment:' + kind); act('momentStart', kind); }
    const S = momentState;
    const end = mo.querySelector('.gm-mo-end');
    if (end && !end.hidden) { B.moments.push({ kind: S.kind, s: +(ts() - S.t).toFixed(1), skipped: false }); momentState = null; click(mo.querySelector('.gm-mo-go')); return 400; }
    // the child gives up after 25 s; everybody else plays it through
    if ((P.mash && ts() - S.t > 25) || (P.skipAfter && ts() - S.t > P.skipAfter)) { B.moments.push({ kind: S.kind, s: +(ts() - S.t).toFixed(1), skipped: true }); momentState = null; click(mo.querySelector('.gm-mo-skip')); act('momentSkip', kind); return 400; }
    // (round 3) the eleven wave-3 moments: the bot has no solver for them in the HUD, so it spends the time the moment
    // model measured for this persona (test/playtest/moment-model.mjs: the real moment's floor + KLM + reading), then closes it
    const title = txt(mo.querySelector('.gm-mo-t'));
    const MT = (window.__MOMENT_T || {})[title];
    if (kind === 'other' || (MT && !['stone', 'boxes', 'breaches', 'red'].includes(kind))) {
      const want = MT ? (P.mash ? MT.child : P.reel ? Math.round((MT.first + MT.again) / 2) : MT.first) : 25;
      if (ts() - S.t >= want) { B.moments.push({ kind: title || S.kind, s: +(ts() - S.t).toFixed(1), skipped: false, modelled: true }); momentState = null; click(mo.querySelector('.gm-mo-skip')); return 400; }
      return 500;
    }
    const hold = mo.querySelector('.gm-mo-hold');
    const pd = (el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    const pu = (el) => el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    if (kind === 'stone') {
      const g = mo.querySelector('.gm-mo-svg g'); const m = (g.getAttribute('transform') || '').match(/translate\(150 ([\d.]+)\)/); const y = m ? +m[1] : 0;
      if (P.mash) { if (S.holding) { pu(hold); S.holding = false; return 260; } pd(hold); S.holding = true; return 160; }
      if (!S.holding && y < 192) { pd(hold); S.holding = true; return 40; }
      if (S.holding && y >= 196) { pu(hold); S.holding = false; return 300; }
      return 30;
    }
    if (kind === 'boxes') {
      if (S.holding) { pu(hold); S.holding = false; return P.mash ? 150 : 700; }
      pd(hold); S.holding = true; return P.mash ? 2600 : 900;          // the child holds too long: the box sways and stops
    }
    if (kind === 'breaches') { const gap = mo.querySelector('.gm-mo-gap:not(.fixed)'); if (gap) pd(gap); return P.mash ? 140 : 420; }
    if (kind === 'red') {
      const svg = mo.querySelector('.gm-mo-drag'); const tr = svg.querySelector('.gm-mo-red').getAttribute('transform') || ''; const y = +((tr.match(/translate\(0 ([\d.]+)\)/) || [0, 0])[1]);
      const mid = 244 - 5 * 19;
      const key = (k) => svg.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
      if (Math.abs(y - mid) <= 5) { key('Enter'); return 600; }
      key(y < mid ? 'ArrowDown' : 'ArrowUp'); return P.mash ? 90 : 160;
    }
    return 500;
  }

  /* the world tap the persona makes now (what the goal pill / the hand points at) */
  function worldTap() {
    const g = game(), st = G();
    const r = g._ && g._.hero;
    if (st.st.har && !st.st.har.done) { const i = st.bh.findIndex((v) => v === 1) >= 0 ? st.bh.findIndex((v) => v === 1) : st.bh.findIndex((v) => v > 0); if (i >= 0) return g.onBoulderTap(i); return false; }
    const sites = Object.keys(st.st).filter((id) => st.st[id] && !st.st[id].done && !st.st[id].ready);
    // the recommended site first (the one the pill names), else any site that can still take work
    const pill = txt(q('.gm-pill'));
    const named = sites.find((id) => pill.includes(nameOf(id)));
    const pick = named || sites[0];
    return pick ? g.onSiteTap(pick) : false;
  }
  const nameOf = (id) => (window.__STAGE_NAMES[id] || id);

  function step() {
    try {
      // 1. a key moment overlay
      const mo = q('.gm-mo.on');
      if (mo) { setTimeout(step, playMoment(mo)); return; }
      // 2. a modal card: read it, then continue (the name prompt: a name, or "pick for me")
      const modal = q('.gm-modal.on .gm-card');
      if (modal) {
        const h = txt(modal.querySelector('h2'));
        if (h !== lastModal) { lastModal = h; modalSince = ts(); first('modal:' + h); act('modal', h); }
        if ((ts() - modalSince) * 1000 >= P.read) {
          const input = modal.querySelector('.gm-input');
          if (input && !P.mash) { input.value = 'אלעזר'; const m = modal.querySelector('[data-m="7"]'); if (m) m.click(); }
          const btns = modal.querySelectorAll('.gm-btn[data-i]');
          click(P.mash && btns.length > 1 ? btns[btns.length - 1] : modal.querySelector('.gm-btn-gold') || btns[0]);
          lastModal = '';
        }
        setTimeout(step, 250); return;
      }
      const st = G(), g = game();
      // 2b. (round 3) a toast with a one-tap button: the caravan that just arrived, the crews that wait
      const tb = q('.gm-toast .gm-tbtn');
      if (tb && !P.mash && !g.ui.sheet) { const k = tb.dataset.hk; click(tb); act('toastBtn', k); first('toast:' + k); setTimeout(step, 700); return; }
      // 2c. (round 3) the presenter: the next highlight as soon as the last one's cards are done; the outro ends the run
      if (P.reel && st.demo && st.ftue >= 99 && q('.gm-demo .gm-hl') && !B.reelDone) {
        if (/סיום ההדגמה/.test(txt(q('.gm-demo .gm-hl')))) { B.reelDone = ts(); act('reelEnd'); }
        else if (!Object.values(G().st).some((x) => !x || !x.done) && Object.keys(G().st).length >= 15 && !B.reelDone) { B.dead = (B.dead || 0) + 1; if (B.dead >= 3) { B.reelDone = ts(); act('reelEndDead'); } else { click(q('.gm-demo .gm-hl')); B.presses = (B.presses || 0) + 1; setTimeout(step, 4000); return; } }
        else if (ts() - (B.lastPress || -99) > 4) { B.lastPress = ts(); click(q('.gm-demo .gm-hl')); act('highlight'); B.presses = (B.presses || 0) + 1; setTimeout(step, 4000); return; }
      }
      // 3. the coach's hand / bubble
      const coach = vis(q('.gm-bub')) ? txt(q('.gm-bub')) : '';
      if (coach) first('coach:' + coach.slice(0, 40));
      if (/משלח|עגלות המחצבה|אסוף/.test(coach) && !g.ui.sheet) { click(q('.gm-db[data-k="caravans"]')); act('followCoach', 'caravans'); setTimeout(step, 600); return; }
      if (/חומת העזרה/.test(coach) && !g.ui.sheet) { click(q('.gm-pill')); act('followCoach', 'pill'); setTimeout(step, 600); return; }
      // 4. an open sheet: do what it is for, then close it
      if (g.ui.sheet) {
        const sh = q('.gm-sheet.on');
        const col = sh && sh.querySelector('[data-a="collect"]');
        if (col) { click(col); act('collect'); first('collect'); setTimeout(step, 700); return; }
        const need = sh && sh.querySelector('.gm-need') && sh.querySelector('.gm-need').closest('[data-route]');
        const needBtn = need && (need.querySelector('[data-len="ftue"]:not([disabled])') || need.querySelector('[data-len="short"]:not([disabled])'));
        if (needBtn && !P.mash) { click(needBtn); act('send', 'needed:' + need.dataset.route); first('send:need'); setTimeout(step, 700); return; }
        const ftue = sh && sh.querySelector('[data-len="ftue"]:not([disabled])');
        if (ftue) { click(ftue); act('send', 'ftue'); first('send'); setTimeout(step, 700); return; }
        if (g.ui.sheet === 'caravans' && P.sendAll) {
          const b = [...sh.querySelectorAll('[data-a="send"][data-len="short"]:not([disabled])')][0];
          if (b) { click(b); act('send', b.dataset.r); first('send:' + b.dataset.r); setTimeout(step, 700); return; }
        }
        const start = sh && sh.querySelector('[data-a="start"]:not([disabled])');
        if (start) { click(start); act('start', start.dataset.id); first('start:' + start.dataset.id); setTimeout(step, 700); return; }
        if (g.ui.sheet === 'book' && !P.mash) { const m = [...sh.querySelectorAll('[data-a="mishnah"]')].find((x) => /חדש/.test(x.textContent)); if (m) { click(m); act('read'); first('read'); setTimeout(step, 9000); return; } }
        g.ui.closeSheet(); setTimeout(step, 400); return;
      }
      // 5. caravans back (the badge)
      const badge = q('.gm-db[data-k="caravans"] .gm-badge:not(.gm-hidden)');
      if (badge && st.ftue >= 6) { click(q('.gm-db[data-k="caravans"]')); act('openCaravans'); setTimeout(step, 600); return; }
      // 6. the goal pill says "start": open it (the stage sheet has the start button)
      const pill = txt(q('.gm-pill'));
      if (/התחל לבנות/.test(pill) && st.ftue >= 7) { click(q('.gm-pill')); act('pill', 'start'); setTimeout(step, 600); return; }
      if (/הרגע המיוחד/.test(pill)) { click(q('.gm-pill')); act('pill', 'moment'); setTimeout(step, 900); return; }
      if (/שלח משלחת|משלחת חזרה|אפשר להתחיל/.test(pill) && !P.mash && ts() - lastPillAct > 15) { lastPillAct = ts(); click(q('.gm-pill')); act('pill', 'send'); setTimeout(step, 900); return; }
      // 6b. the investor moves on to the next highlight every ~35 s once the tutorial is over
      if (P.highlightEvery && st.demo && st.ftue >= 99 && q('.gm-demo .gm-hl') && ts() - lastSkip > P.highlightEvery / 1000) { lastSkip = ts(); click(q('.gm-demo .gm-hl')); act('highlight'); setTimeout(step, 1500); return; }
      // 7. build: tap the world
      const building = /סלעים|יסודות|מבנה|גימור/.test(pill) && !/חסר/.test(pill);
      if (building) {
        idleSince = 0;
        const h = g._.hero, now = performance.now() / 1000;
        const s0 = strikes();
        worldTap(); B.taps++; first('tap');
        setTimeout(() => { if (strikes() === s0 && !q('.gm-modal.on') && !q('.gm-mo.on')) B.tapsNoFx++; }, 900);
        let gap = P.tap;
        if (!P.mash && Math.random() < P.beat && h.beat) { const d = (h.beat - performance.now() / 1000) * 1000; if (d > 50 && d < 1200) gap = d + (Math.random() - 0.5) * 120; }   // aim for the beat
        if (P.mash) gap = P.tap * (0.7 + Math.random() * 0.6);
        setTimeout(step, Math.max(60, gap)); return;
      }
      // 8. nothing to build: the persona's idle habit
      if (!idleSince) idleSince = ts();
      B.idleMs += 500;
      if (P.skipChapterEvery && st.demo && ts() - lastSkip > P.skipChapterEvery / 1000 && vis(q('.gm-demo')) && st.ftue >= 99) { lastSkip = ts(); const hl = q('.gm-demo .gm-hl'); click(hl || q('.gm-demo button')); act(hl ? 'highlight' : 'skipChapter'); setTimeout(step, 1500); return; }
      if ((P.explore || P.mash) && ts() - lastTab > 20) {
        lastTab = ts();
        const tabs = ['caravans', 'daily', 'book', 'crews', 'store'];
        const k = tabs[tabIx++ % tabs.length];
        click(q(`.gm-db[data-k="${k}"]`)); act('tab', k); first('tab:' + k);
        setTimeout(step, 3000); return;
      }
      if ((P.grind || P.mash) && st.st.har && st.st.har.done) { g.onQuarryTap(); B.taps++; B.hollowMs += P.tap; setTimeout(step, P.tap); return; }
      if (P.mash) { const b = q('.gm-pill'); click(b); B.taps++; B.tapsNoFx++; }
      B.deadMs += 500;
      setTimeout(step, 500);
    } catch (e) { act('error', String(e && e.message)); setTimeout(step, 1000); }
  }
  setTimeout(step, 600);
}

const DESKTOP = args.includes('--desktop');   // (round 3) the same persona on a 1280 × 720 desktop (no touch)
async function run(b, key, P) {
  const W = DESKTOP ? 1280 : 400, H = DESKTOP ? 720 : 860;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !DESKTOP, isMobile: !DESKTOP, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const pg = await ctx.newPage();
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const start = new Date(P.start);
  await pg.clock.install({ time: start });
  await pg.clock.pauseAt(start);
  const init = {};
  if (P.demo) init.bh_settings = JSON.stringify({ demo: true });
  if (P.save === 'day1') init.bh_beta2 = JSON.stringify(day1Save(start.getTime()));
  if (P.save === 'day1n') { const sv = day1Save(start.getTime()); const H = 3600e3, back = start.getTime() - 20 * H; sv.clock = back; sv.lastSeen = back; sv.car.forEach((c) => { c.t0 = back - H; c.t1 = back + H; }); init.bh_beta2 = JSON.stringify(sv); }   // (FUN) last seen 20 h ago, not 3 days
  await pg.addInitScript(({ init, P, names, MT }) => {
    try { localStorage.clear(); for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v); } catch (e) { /* */ }
    window.__STAGE_NAMES = names;
    window.__BOT_P = P;
    // 20 frames a second on the fake clock (the HUD anchors and the key moments' own loops cap dt at 50 ms, so their
    // speed is unchanged); 60 would triple the cost of a 20-minute virtual session for nothing
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 50);
    window.cancelAnimationFrame = (id) => clearTimeout(id);
    window.__MOMENT_T = MT;
  }, { init, P, names: STAGE_NAMES, MT: MOMENT_T });
  await pg.goto('file://' + path.join(ROOT, 'test/game-harness.html') + '?api12=1&tod=' + (P.tod || 'dusk'));
  await pg.evaluate(brain, P);
  const shots = SHOTS ? P.shots.map((s) => { const [m, x] = s.split(':').map(Number); return { at: (m * 60 + x) * 1000, s }; }) : [];
  let tNow = 0;
  const endMs = P.min * 60000;
  const t0 = Date.now();
  for (const sh of [...shots, { at: endMs, s: 'end', end: true }].sort((a, b) => a.at - b.at)) {
    if (sh.at > tNow) { for (let t = tNow; t < sh.at; t += 30000) await pg.clock.runFor(Math.min(30000, sh.at - t)); tNow = sh.at; }
    if (!sh.end) await pg.screenshot({ path: path.join(OUT, `${LABEL}-${key}-${sh.s.replace(':', '_')}.png`) });
  }
  const data = await pg.evaluate(() => ({ bot: window.__BOT, log: window.__GAME_LOG.map((e) => ({ t: Math.round(e.t / 100) / 10, type: e.type, d: e.d })), calls: __H.world.calls.filter((c) => /showPlan|orbit|showcase|shine|celebrate|playTimelapse|redLine|boxes|setVine|^focus$/.test(c.fn)).map((c) => ({ fn: c.fn, t: Math.round(c.t / 100) / 10, a: String(c.args[0]).slice(0, 40) })), state: { ftue: __H.game.state.ftue, st: __H.game.state.st, res: __H.game.state.res, car: __H.game.state.car.length, stats: __H.game.state.stats, vine: __H.game.state.vine } }));
  await pg.screenshot({ path: path.join(OUT, `${LABEL}-${key}-end.png`) });
  await ctx.close();
  return { key, label: P.label, realS: +((Date.now() - t0) / 1000).toFixed(1), errors: logs.slice(0, 5), ...data, metrics: domMetrics(data, P) };
}

/* a plausible end of day 1 (the returner): the Mount done, the wall blocked on cedar, two caravans out; last seen 3 days ago */
function day1Save(now) {
  const H = 3600e3, back = now - 71 * H;
  return { v: 5, demo: false, created: back - 12 * H, clock: back, lastSeen: back, res: { stone: 180, cedar: 0, bronze: 0, gold: 50, silver: 95, wstone: 0 }, st: { har: { done: true }, wall: { w: 33.6, ph: 2 } }, bh: new Array(12).fill(0), harAcc: 0, crews: [{ at: 'wall' }, { at: 'quarry' }], car: [{ r: 'cedar', len: 'short', t0: back - H, t1: back + H, y: 70 }, { r: 'wagons', len: 'long', t0: back - H, t1: back + 3 * H, y: 400 }], routes: ['wagons', 'cedar'], carSlots: 2, carCount: { wagons: 1 }, priests: 0, train: [], trainOn: false, trainSlots: 2, book: { un: { '2.1': 1, '1.2': 1, '1.3': 1, '2.2': 1 }, read: { '2.1': 1 } }, quiz: { day: '', n: 0, done: {} }, daily: { day: new Date(back).toISOString().slice(0, 10), streak: 1, wageDay: '', tasks: [], vol: '' }, vol: null, vine: { leaves: 2, grapes: 0, clusters: 0, grapeDays: 0 }, finds: { trumpet: 1, bigstone: 1 }, story: { priests: 1 }, ftue: 99, name: 'אלעזר', mishmar: 7, chDone: { 1: true }, stats: { strikes: 90, perfect: 20, best: 4, caravans: 3, combo: 0 }, celeb: false };
}

function domMetrics(d, P) {
  const L = d.log, B = d.bot;
  const at = (type, f = () => true) => { const e = L.find((x) => x.type === type && f(x)); return e ? e.t : null; };
  const strikes = L.filter((e) => e.type === 'strike');
  const perfect = strikes.filter((e) => e.d && e.d.perfect).length;
  const pills = B.samples.map((s) => s.pill);
  const blockedShare = pills.filter((p) => /חסר/.test(p)).length / Math.max(1, pills.length);
  const coachShare = B.samples.filter((s) => s.coach).length / Math.max(1, B.samples.length);
  // novelty: a new toast/modal/moment/sheet/tab counts once
  const novel = Object.keys(B.firsts).filter((k) => /^(modal|moment|coach|tab|send|start|collect)/.test(k)).length;
  return {
    firstStrikeS: at('strike'), firstBoulderS: at('boulder'), crewS: at('crew'), greatStoneS: at('momentStart', (e) => e.d && e.d.id === 'har'),
    harDoneS: at('stageDone', (e) => e.d && e.d.id === 'har'), ftueDoneS: at('ftueDone'), wallStartS: at('stageStart', (e) => e.d && e.d.id === 'wall'), wallDoneS: at('stageDone', (e) => e.d && e.d.id === 'wall'),
    strikes: strikes.length, perfectPct: strikes.length ? Math.round(100 * perfect / strikes.length) : 0, taps: B.taps, tapsNoFx: B.tapsNoFx,
    idleS: Math.round(B.idleMs / 1000), deadS: Math.round(B.deadMs / 1000), hollowS: Math.round(B.hollowMs / 1000),
    blockedPillPct: Math.round(100 * blockedShare), coachOnPct: Math.round(100 * coachShare), novelty: novel, moments: B.moments,
    stagesDone: L.filter((e) => e.type === 'stageDone').map((e) => `${e.d.id}@${e.t}`),
    wows: d.calls.filter((c) => /showPlan|orbit|showcase|shine/.test(c.fn)).map((c) => `${c.fn}@${c.t}`),
    reel: { strayMoments: L.filter((e) => e.type === 'moment' && e.d && ['wall', 'heichal'].includes(e.d.id)).length, presses: B.presses || 0, deadPresses: B.dead || 0, endS: B.reelDone || null, outroS: at('demoOutro'), finaleS: at('finale'), highlights: L.filter((e) => e.type === 'highlight').length },
    hooks: ['restCard', 'hint', 'highlight', 'mash', 'comboMilestone', 'festival', 'stripTap', 'sessionEnd', 'idleCue', 'idleMove', 'arrivalBeat', 'arrivalCollect', 'demoOutro', 'mysteryInvite'].reduce((o, k) => { const n = L.filter((e) => e.type === k).length; if (n) o[k] = n; return o; }, {}),
    firstRestCardS: at('restCard'), swallowedTaps: Math.max(0, B.taps - strikes.length),
  };
}

// (round 3) the moment model's per-persona times (seconds), by the moment's title
const MOMENT_T = (() => { try { const m = JSON.parse(fs.readFileSync(path.join(OUT, 'moments-model.json'), 'utf8')); return Object.fromEntries(m.rows.filter((r) => !r.missing).map((r) => [r.title, { first: r.first, child: r.child, again: r.again }])); } catch (e) { return {}; } })();
const STAGE_NAMES = { har: 'שיטוח ההר', wall: 'חומת העזרה', gates: 'שערי העזרה', nashim: 'עזרת הנשים', sorag: 'הסורג והחיל', nikanor: 'שער ניקנור', lishka: 'הלשכות', yesod: 'יסוד המזבח', sovev: 'הסובב', guf: 'גוף המזבח', karnot: 'הקרנות', kiyor: 'הכיור', ulam: 'האולם', heichal: 'ההיכל', kodesh: 'קודש הקדשים' };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const out = {};
  try {
    for (const [k, P] of Object.entries(PERSONAS)) {
      if (ONLY.length && !ONLY.includes(k)) continue;
      const r = await run(b, k, P);
      out[k] = r;
      const m = r.metrics;
      console.log(`${k.padEnd(10)} hooks ${JSON.stringify(m.hooks)} · rest card @${m.firstRestCardS}s${P.reel ? ` · reel ${JSON.stringify(m.reel)}` : ''}`);
      console.log(`${k.padEnd(10)} ${r.realS}s real · strike ${m.firstStrikeS}s · boulder ${m.firstBoulderS}s · crew ${m.crewS}s · great stone ${m.greatStoneS}s · har ${m.harDoneS}s · ftue ${m.ftueDoneS}s · wall ${m.wallStartS}→${m.wallDoneS}s · strikes ${m.strikes} (${m.perfectPct}% perfect) · taps ${m.taps} (${m.tapsNoFx} no fx) · idle ${m.idleS}s dead ${m.deadS}s hollow ${m.hollowS}s · pill blocked ${m.blockedPillPct}% · moments ${JSON.stringify(m.moments)} · errors ${r.errors.length}`);
    }
  } finally { await b.close(); }
  const file = path.join(OUT, `dom-${LABEL}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  fs.writeFileSync(file, JSON.stringify({ ...prev, ...out, when: new Date().toISOString() }, null, 1));
  console.log('wrote', path.relative(ROOT, file));
})().catch((e) => { console.error(e); process.exit(2); });
