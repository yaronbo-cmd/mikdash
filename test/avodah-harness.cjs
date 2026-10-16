// Phase B harness: the real src/avodah HUD, rules and mini-games against a MOCK world (no WebGL: fast).
//   node test/avodah-harness.cjs            build the bundle, run the unit tests and the flows
//   node test/avodah-harness.cjs --build    only build test/out/avodah-harness.bundle.js
// Playwright: NODE_PATH=/home/claude/.npm-global/lib/node_modules. Screenshots: test/out/avodah/h-*.png
// The games are played by simulated input: each mini-game registers a solver that dispatches real DOM
// pointer/click events on its own elements (the same handlers a player's taps reach).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/avodah');
fs.mkdirSync(OUT, { recursive: true });

function build() {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'avodah-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/avodah-harness.bundle.js'), logLevel: 'warning' });
}
build();
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }

// --only=2,6c … runs only those parts (a quick re-run in the queue); the unit tests always run
const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const part = (k) => !ONLY.length || ONLY.includes(k);
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
function sh(cmd) { try { return { ok: true, out: execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; } catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; } }
{
  const u = sh('node --test test/avodah-state.test.mjs test/avodah-schedule.test.mjs test/avodah-games.test.mjs test/avodah-pitum.test.mjs test/avodah-pitum-play.test.mjs');   // ── service13 ── (+ pitum)
  const m = u.out.match(/# pass (\d+)[\s\S]*# fail (\d+)/);
  check('unit tests (state.js, schedule.js, data.js, game logic)', u.ok, m ? `${m[1]} pass, ${m[2]} fail` : 'no summary');
}

// (wave 12, AVODA12: + chavitin, shaarim, kelim in the morning; machar, neilah in the evening)
const SHACHAR = ['payis1', 'kiddush', 'chavitin', 'deshen', 'maaracha', 'payis2', 'barkai', 'shaarim', 'kelim', 'taleh', 'heichal', 'zerika', 'evarim', 'payis3', 'ketoret', 'birkat', 'shir'];
const N = SHACHAR.length;
const ALL = [...SHACHAR, 'korbanot', 'musaf', 'erev', 'neirot', 'aravot', 'shoevah', 'lechem', 'machar', 'neilah'];
// the games the player plays IN the 3D world (interact3d.js targets) when the world can project
const G3D = ['kiddush', 'deshen', 'maaracha', 'taleh', 'heichal', 'zerika', 'evarim', 'ketoret', 'birkat', 'shir', 'neirot', 'lechem'];
const FRI_EVE = '2026-09-25T20:00:00+03:00';           // Erev Sukkot after sunset: Sukkot + Shabbat
const SUKKOT_NIGHT = '2026-09-26T01:00:00+03:00';      // the altar is cleared from the first watch on a festival

async function page(b, { W = 390, H = 844, params = 'fast=1', init = null, now = FRI_EVE } = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 700, isMobile: W < 700, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(8000);
  const errors = [], warnings = [];
  pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
  pg.on('pageerror', (e) => errors.push('PAGEERR ' + e.message));
  await pg.addInitScript(({ init }) => {
    try { localStorage.clear(); } catch (e) { /* ignore */ }
    if (init) for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v);
  }, { init });
  await pg.goto('file://' + path.join(__dirname, 'avodah-harness.html') + '?' + params + (now ? '&now=' + encodeURIComponent(now) : ''));
  await pg.waitForFunction(() => window.__AV && window.__AV.av, null, { timeout: 15000 });
  if (init && init.bh_beta2) {           // a returning Phase A player: dismiss the one-time intro
    if (await pg.waitForFunction(() => /ברוך הבא לעבודה/.test(document.body.innerText), null, { timeout: 3000 }).then(() => true, () => false)) await pg.click('.av-modal [data-v="go"]');
  }
  return { ctx, pg, errors, warnings };
}
const E = (pg, fn, a) => pg.evaluate(fn, a);
const wf = (pg, fn, a, ms = 8000) => pg.waitForFunction(fn, a, { timeout: ms, polling: 50 }).then(() => true, () => false);
const shot = async (pg, name) => { await pg.waitForTimeout(250); await pg.screenshot({ path: path.join(OUT, `h-${name}.png`) }); };

/** Drive a run: solve each game as it opens, press "next" on each card, until the home is back.
 *  onGame(id) may act before the solver (screenshots, mistakes); returns {games, cards}. */
async function drive(pg, { onGame = null, onCard = null, limitMs = 150000 } = {}) {
  const t0 = Date.now(), games = [], cards = [];
  let last = null;
  while (Date.now() - t0 < limitMs) {
    const st = await E(pg, () => ({ g: window.__AV.av._.game, card: !!document.querySelector('.av-modal.on .av-go'), busy: window.__AV.av.busy, home: document.querySelector('.av-home') && document.querySelector('.av-home').classList.contains('on') }));
    if (st.g && st.g !== last) {
      last = st.g; games.push(st.g);
      if (onGame) await onGame(st.g);
      await E(pg, () => { window.__AV.av._.solve(); });
    } else if (!st.g && st.card) {
      last = null;
      const info = await E(pg, () => {
        const m = document.querySelector('.av-modal.on .av-card');
        return { text: m.innerText, drafts: m.querySelectorAll('.av-draft').length, refs: m.querySelectorAll('.av-ref').length, subs: m.querySelectorAll('.av-sub').length, kick: (m.querySelector('.av-kick') || {}).textContent || '' };
      });
      cards.push(info);
      const handled = onCard ? await onCard(info, cards.length) : false;
      if (!handled) await pg.click('.av-modal.on .av-go');
      await pg.waitForTimeout(40);
    } else if (!st.busy && st.home && !st.g) break;
    await pg.waitForTimeout(40);
  }
  return { games, cards };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-first-run', '--disable-background-networking', '--disable-component-update'] });
  try {
    /* ── 1. first visit: the name pick, the home, the live status ── */
    if (part('1')) {
      const { pg, errors } = await page(b, { params: 'fast=1' });
      check('Phase B mounts over the canvas; page chrome hidden', await E(pg, () => document.body.classList.contains('av-on') && getComputedStyle(document.querySelector('.top')).display === 'none'));
      check('no Phase A save → the 10-second name + mishmar pick', await wf(pg, () => /איך קוראים לך/.test(document.body.innerText) && document.querySelectorAll('.av-mishmarot button').length === 24));
      await shot(pg, 'name');
      await pg.fill('.av-input', 'אלעזר');
      await pg.click('.av-mishmarot button[data-m="8"]');
      await pg.click('.av-modal [data-v="ok"]');
      check('the player is saved (bh_avodah v1, name + mishmar)', await wf(pg, () => { try { const s = JSON.parse(localStorage.getItem('bh_avodah')); return s.v === 1 && s.name === 'אלעזר' && s.mishmar === 8; } catch (e) { return false; } }));
      check('first visit: the intro (live vs practice, the daily payis, no punishment)', await wf(pg, () => /ברוך הבא לעבודה/.test(document.body.innerText)));
      await shot(pg, 'intro');
      await pg.click('.av-modal [data-v="go"]');
      check('home: the Hebrew date and Sukkot from Friday evening (ט״ו תשרי, סוכות · שבת)', await wf(pg, () => /ט״ו תשרי/.test(document.querySelector('.av-body').innerText) && /סוכות/.test(document.querySelector('.av-body').innerText)));
      const home = await E(pg, () => document.querySelector('.av-body').innerText);
      check('home: the day\'s musaf (13 bulls), the water libation, the aravot, Beit HaShoevah', /13 פרים/.test(home) && /ניסוך המים/.test(home) && /ערבות/.test(home) && /בית השואבה/.test(home));
      check('status bar: what the Temple does now + the next appointment with a countdown', await E(pg, () => /עכשיו במקדש/.test(document.querySelector('.av-status').innerText) && /התמיד של שחר/.test(document.querySelector('.av-status small').innerText)));
      check('home: "ברקאי" time for tomorrow', /ברקאי מחר ב-\d\d:\d\d/.test(home));
      check('home: the world shows what the Temple does now, under the real sky (night; the altar burning the limbs)', await E(pg, () => window.__AV.calls.some((c) => c.fn === 'setTimeOfDay' && c.args[0] === 'night') && window.__AV.calls.some((c) => c.fn === 'look' && [JSON.stringify([14, 54, 58]), JSON.stringify([68.8, 150.4, 196.4])].includes(JSON.stringify(c.args[0])))));   // SHOTS.altarWide, or on a narrow portrait phone the home's far shot (schedule.js EVENT_SHOT_TALL)
      check('phone 390×844: no horizontal scroll', await E(pg, () => document.documentElement.scrollWidth <= innerWidth + 1));
      await shot(pg, 'home');
      await E(pg, () => document.querySelector('[data-tab="book"]').click());
      check('ספר העבודה lists the 40 steps, each with a draft tag', await E(pg, () => document.querySelectorAll('.av-body .av-row').length === 40 && document.querySelectorAll('.av-body .av-row .av-draft').length === 40));
      await E(pg, () => document.querySelector('[data-tab="path"]').click());
      check('הדרך שלי: 15 ממונים, 13 roles, streak, the ketoret', await E(pg, () => document.querySelectorAll('.av-ladder div').length === 15 && document.querySelectorAll('.av-roles span').length === 13 && /רצף/.test(document.querySelector('.av-body').innerText) && /קטורת/.test(document.querySelector('.av-body').innerText)));
      await shot(pg, 'path');
      check('no console errors (first visit)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 2. the whole morning service (practice), played by simulated input ── */
    if (part('2')) {
      const phaseA = JSON.stringify({ v: 5, name: 'פנחס', mishmar: 5, priests: 10, res: {}, st: {} });
      const { pg, errors } = await page(b, { init: { bh_beta2: phaseA } });
      check('Phase A save → no name pick; name and mishmar read', await wf(pg, () => document.querySelector('.av-home.on') && !document.querySelector('.av-modal') && /פנחס/.test(document.querySelector('.av-body').innerText)));
      const shots = new Set(['payis2', 'taleh', 'zerika', 'ketoret', 'shir']);
      const t0 = Date.now();
      await E(pg, () => document.querySelector('[data-play="shachar"]').click());
      const { games, cards } = await drive(pg, {
        onGame: async (g) => { if (shots.has(g)) { await pg.waitForTimeout(350); await shot(pg, 'game-' + g); } },
        onCard: async (c, n) => { if (n === 1) await shot(pg, 'card-payis1'); },
      });
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      check(`the morning Tamid plays end to end, in the Mishnah's order (${N} mini-games)`, JSON.stringify(games) === JSON.stringify(SHACHAR), games.join(','));
      const perGame = cards.slice(0, N);
      check('after every mini-game: a sourced card with a visible "טיוטה" tag', perGame.length === N && perGame.every((c) => c.drafts >= 1 && c.refs >= 1), perGame.map((c) => `${c.drafts}/${c.refs}`).join(' '));
      check('the summary: "זה הוא סדר התמיד לעבודת בית אלקינו"', cards.length >= N + 1 && cards.slice(N).some((c) => /זֶה הוּא סֵדֶר הַתָּמִיד/.test(c.text)));
      check('a new rank: the ממונה\'s card (memunim.json) is shown', cards.slice(N).some((c) => /פגשת ממונה/.test(c.kick) && c.drafts >= 1 && c.refs >= 1));
      check('the day\'s role was drawn (13 roles) and shown after the second lottery', /התפקיד שלך היום/.test(cards[SHACHAR.indexOf('payis2')].text));
      const done = await E(pg, () => window.__AV_LOG.filter((e) => e.type === 'done').map((e) => e.d));
      check('every mini-game finished without a skip', done.length === N && done.every((d) => !d.skipped));
      const calls = await E(pg, () => window.__AV.calls.map((c) => ({ fn: c.fn, a: c.args })));
      const ix = (fn, pred = () => true) => calls.findIndex((c) => c.fn === fn && pred(c.a));
      const enter = ix('sanctuary.enter', (a) => a[0] === 'heichal'), sl = ix('avodah.slaughter'), ne = ix('avodah.sprinkle', (a) => a[0] === 'NE' && a[1] === 'lower'), sw = ix('avodah.sprinkle', (a) => a[0] === 'SW' && a[1] === 'lower');
      check('world: into the Heichal before the shechita; blood NE then SW, below the line', enter >= 0 && sl > enter && ne > sl && sw > ne, `enter ${enter} slaughter ${sl} NE ${ne} SW ${sw}`);
      const lampsOk = calls.filter((c) => c.fn === 'sanctuary.setLamps').every((c) => Array.isArray(c.a[0]) && c.a[0].length === 7);
      check('world: setLamps always gets 7 levels', lampsOk && calls.some((c) => c.fn === 'sanctuary.setLamps'));
      const need = ['look', 'setTimeOfDay', 'sanctuary.exit', 'sanctuary.setGoldAltar', 'sanctuary.setDoors', 'avodah.kohen', 'avodah.animal', 'avodah.limbs', 'avodah.libation', 'avodah.levites', 'avodah.trumpets', 'avodah.bow', 'avodah.blessing', 'avodah.fire', 'avodah.lambsChamber.count'];
      const missing = need.filter((n) => !calls.some((c) => c.fn === n));
      check('world: the §12 calls of the morning are made', missing.length === 0, missing.join(','));
      check('Sukkot: the water libation is poured with the wine', calls.some((c) => c.fn === 'avodah.libation' && c.a[0] === 'water') && ix('avodah.libation', (a) => a[0] === 'water') < ix('avodah.libation', (a) => a[0] === 'wine'));
      check('no Divine Name in any rendered text', await E(pg, () => window.__AV_NAMES.length === 0 && window.__AV_TEXTS > 100), await E(pg, () => window.__AV_NAMES.slice(0, 2).join(' | ') + ` (${window.__AV_TEXTS} texts)`));
      const save = await E(pg, () => JSON.parse(localStorage.getItem('bh_avodah')));
      check('ספר העבודה filled by the morning (≥ 30 of 40 steps); points; streak', Object.keys(save.book).length >= 30 && save.points > 100 && save.streak.n === 1, `${Object.keys(save.book).length} steps, ${save.points} points`);
      check('the Phase A save is never written', await E(pg, (p) => localStorage.getItem('bh_beta2') === p, phaseA));
      check('no console errors (the morning service)', errors.length === 0, errors.slice(0, 3).join(' | '));
      console.log(`      (the whole morning by solver in ${secs} s at fast=1)`);
      await pg.context().close();
    }

    /* ── 3. practice: each mini-game alone; mistakes are gentle ── */
    if (part('3')) {
      const phaseA = JSON.stringify({ v: 5, name: 'יונתן', mishmar: 12 });
      const { pg, errors } = await page(b, { init: { bh_beta2: phaseA }, now: '2026-09-28T10:00:00+03:00' });
      await wf(pg, () => document.querySelector('.av-home.on'));
      const ok = [];
      let ring = null;
      for (const g of ALL) {
        await E(pg, (id) => { window.__AV.av._.run(id); }, g);
        let mistake = null;
        const r = await drive(pg, {
          limitMs: 40000,
          onGame: async (id) => {
            if (id === 'zerika' && await wf(pg, () => document.querySelectorAll('.av3d-t').length >= 24, null, 4000)) {
              ring = await E(pg, () => {
                const ts = [...document.querySelectorAll('.av3d-t:not(.off)')].map((t) => t.getBoundingClientRect());
                const card = document.querySelector('.av-mg.in3d .av-mg-card');
                const top = card ? card.getBoundingClientRect().top : 0;
                return { n: ts.length, min: Math.min(...ts.map((r) => Math.min(r.width, r.height))), above: ts.every((r) => r.top + r.height / 2 < top), compact: !!card && getComputedStyle(document.querySelector('.av-mg.in3d .av-play')).display === 'none' };
              });
              await shot(pg, '3d-zerika');
            }
            if (id === 'payis1') { await pg.waitForTimeout(80); await E(pg, () => [...document.querySelectorAll('.av-ctl .av-btn')].find((b) => /אגודל/.test(b.textContent)).click()); mistake = await E(pg, () => document.querySelector('.av-hint').textContent); }
            if (id === 'maaracha') {
              await wf(pg, () => /עץ (זית|גפן|תאנה|אגוז|שמן)/.test(document.querySelector('.av-play').textContent));
              mistake = await E(pg, () => { const t = document.querySelector('.av-play').textContent; const bad = /עץ (זית|גפן)/.test(t); [...document.querySelectorAll('.av-ctl .av-btn')].find((b) => (bad ? /למערכה ←/ : /לא למערכה/).test(b.textContent)).click(); return document.querySelector('.av-hint').textContent; });
            }
          },
        });
        ok.push(r.games[0] === g && r.cards.length >= 1);
        if (g === 'payis1') check('mistake → a gentle sourced hint (the thumb: "אין מוציאין אגודל במקדש")', /אגודל/.test(mistake || ''), mistake);
        if (g === 'maaracha') check('mistake → the Mishnah\'s line (the wood: "חוץ משל זית ושל גפן")', /זית ושל גפן|כשר למערכה/.test(mistake || ''), mistake);
      }
      check(`practice: all ${ALL.length} mini-games play alone (incl. pilgrims, musaf, afternoon Tamid, lamps, aravot, Beit HaShoevah, showbread)`, ok.every(Boolean), ALL.filter((g, i) => !ok[i]).join(','));
      const hits = await E(pg, () => window.__AV3D_HITS);
      const by = new Set(hits.map((h) => h.split(':')[0]));
      check(`3D: the solvers act in the world (world-anchored targets) in all ${G3D.length} 3D games`, G3D.every((g) => by.has(g)), G3D.filter((g) => !by.has(g)).map((g) => 'no hit in ' + g).join(',') || `${new Set(hits).size} distinct targets pressed`);
      check('3D: the zerika rings are big touch areas (≥ 52 px) above a compact docked card (the SVG hidden)', ring && ring.n >= 24 && Math.round(ring.min) >= 52 && ring.above && ring.compact, JSON.stringify(ring));
      const save = await E(pg, () => JSON.parse(localStorage.getItem('bh_avodah')));
      check('ספר העבודה: all 40 steps after every game', Object.keys(save.book).length === 40, `${Object.keys(save.book).length}`);
      check('the pilgrims\' game counted the pilgrims', save.stats.pilgrims >= 4);
      await E(pg, () => { window.__AV.av._.run('korbanot'); });
      let alt = 0;
      const rk = await drive(pg, { onCard: async () => { if (alt === 0 && await E(pg, () => !!document.querySelector('.av-modal.on .av-alt'))) { alt++; await E(pg, () => document.querySelector('.av-modal.on .av-alt').click()); await pg.waitForTimeout(60); return true; } return false; } });
      check('the pilgrims\' loop repeats: "עוד עולי רגל" brings a new wave', rk.games.length === 2 && rk.games.every((g) => g === 'korbanot'), rk.games.join(','));
      // leaving a service in the middle: the home button stops it after the current step
      await E(pg, () => { window.__AV.av._.run('shachar'); });
      let quitAt = 0;
      const rq = await drive(pg, { onGame: async (id) => { if (id === 'kiddush' && !quitAt) { quitAt = 1; await E(pg, () => document.querySelector('[data-a="home"]').click()); } } });
      check('the home button during the service: it stops after the current step (no lock-in)', rq.games.join(',') === 'payis1,kiddush' && await E(pg, () => !window.__AV.av.busy && document.querySelector('.av-home.on') !== null), rq.games.join(','));
      await E(pg, () => { window.__AV.av._.run('erevchain'); });
      const r = await drive(pg);
      check('the afternoon Tamid (short chain): erev → zerika → evarim → neirot → chavitin (the kept half) → shir → tomorrow\'s lamb → the gates closed', r.games.join(',') === 'erev,zerika,evarim,neirot,chavitin,shir,machar,neilah', r.games.join(','));
      const calls = await E(pg, () => window.__AV.calls.map((c) => ({ fn: c.fn, a: c.args })));
      check('afternoon: slaughtered at the north-east ring (TAMID_RING.afternoon)', calls.some((c) => c.fn === 'avodah.slaughter' && JSON.stringify(c.a[1]) === JSON.stringify([-29, -33.5])));
      check('no console errors (practice)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await shot(pg, 'home-cholhamoed');
      await pg.context().close();
    }

    /* ── 3b. wave 4: the lamb chosen in 3D, the ⚑ wicket route, a returning player's repeats and the mastery tiers ── */
    if (part('3b')) {
      // a player who played these games often and without mistakes: repeats, and the tier "בקי" (n ≥ 7, 3 perfect)
      const t = Date.parse('2026-09-20T08:00:00+03:00'), games = {}, perf = {};
      for (const g of ['payis2', 'kiddush', 'taleh', 'heichal', 'zerika', 'evarim', 'shir']) { games[g] = { n: 8, t, live: false, best: 0 }; perf[g] = 4; }
      const save = JSON.stringify({ v: 1, pid: 'ptier', name: 'יונתן', mishmar: 12, seenIntro: true, games, hk: { perf } });
      const { pg, errors } = await page(b, { init: { bh_beta2: JSON.stringify({ v: 5, name: 'יונתן', mishmar: 12 }), bh_avodah: save }, params: 'fast=1&wicket=1', now: '2026-09-28T10:00:00+03:00' });
      await wf(pg, () => document.querySelector('.av-home.on'));
      const seen = {};
      // what the game shows while it is played (a MutationObserver sees every ring and hint as it appears)
      const watch = (id) => E(pg, (id) => {
        const W = window.__W4 = window.__W4 || {};
        const look = () => {
          const q = (s) => document.querySelector(s);
          if (!W[id + ':intro'] && q('.av-mg-intro')) W[id + ':intro'] = q('.av-mg-intro').textContent;
          const cite = q('.av-cite'); if (cite) W[id + ':cite'] = cite.textContent;
          const cs = document.querySelectorAll('.av3d-t[data-key^="corner-"]'); if (cs.length) W[id + ':cornerLabels'] = Math.max(W[id + ':cornerLabels'] || 0, document.querySelectorAll('.av3d-t[data-key^="corner-"] b').length);
          const h = q('.av-hint'); if (h && /המצנפת/.test(h.textContent)) W[id + ':mitz'] = h.textContent;
          if (h && /שלישי/.test(h.textContent)) W[id + ':third'] = true;
        };
        const mo = new MutationObserver(() => { look(); if (!window.__AV.av._.game) mo.disconnect(); });
        mo.observe(document.body, { childList: true, subtree: true, characterData: true });
        look();
      }, id);
      for (const g of ['payis2', 'kiddush', 'taleh', 'heichal', 'zerika', 'evarim', 'shir']) {
        const c0 = await E(pg, () => window.__AV.calls.length);
        await E(pg, (id) => { window.__AV.av._.run(id); }, g);
        const r = await drive(pg, { limitMs: 40000, onGame: async (id) => { await watch(id); } });
        seen[g] = { ok: r.games[0] === g && r.cards.length >= 1, calls: await E(pg, (c0) => window.__AV.calls.slice(c0).map((c) => ({ fn: c.fn, a: c.args })), c0) };
      }
      const W4 = await E(pg, () => window.__W4 || {});
      const hits = await E(pg, () => window.__AV3D_HITS);
      check('wave 4: a returning player (repeats, tier "בקי") plays the seven games', Object.values(seen).every((x) => x.ok), Object.keys(seen).filter((g) => !seen[g].ok).join(','));
      const lambCall = seen.taleh.calls.find((c) => c.fn === 'avodah.animal');
      check('taleh: the lamb is chosen in 3D among the six (lambsChamber.positions → animal(…, { index }))', hits.includes('taleh:lamb-0') && lambCall && lambCall.a[1] === 'lambsChamber' && lambCall.a[2] && lambCall.a[2].index === 0 && hits.includes('taleh:cup'), JSON.stringify(lambCall && lambCall.a));
      const inspections = seen.taleh.calls.filter((c) => c.fn === 'animal(lamb).inspect' && c.a[0] === true).length;
      check('taleh, tier "בקי": three lambs, and a mark tells its detail only at a closer look', inspections === 3 && W4['taleh:third'] === true, `inspections ${inspections}`);
      check('taleh: the inspection rings sit on the drawn parts (animal.partPosition)', ['ear', 'eye', 'nose', 'lip'].every((p) => hits.includes('taleh:part-' + p)));
      const hc = seen.heichal.calls;
      check('heichal ⚑ wicket: in by the northern wicket, the gate opened from inside (enter via wicket, focus heichal-gate, anchors)', hc.some((c) => c.fn === 'sanctuary.enter' && c.a[1] && c.a[1].via === 'wicket') && hc.some((c) => c.fn === 'sanctuary.focus' && c.a[0] === 'heichal-gate') && hc.some((c) => c.fn === 'sanctuary.anchor' && c.a[0] === 'gate-in') && hc.some((c) => c.fn === 'sanctuary.anchor' && c.a[0] === 'gold-altar-top') && hits.includes('heichal:gate'), hc.filter((c) => /enter|focus|anchor/.test(c.fn)).map((c) => c.fn.split('.')[1] + '(' + JSON.stringify(c.a[0]) + ')').join(' '));
      const blasts = seen.shir.calls.filter((c) => c.fn === 'avodah.trumpets').length;
      check('shir on a repeat: one פרק of the three (the kohanim\'s blasts as the wine is given + two tekiot), the card says so', blasts === 3, `trumpets ×${blasts}`);
      check('zerika, tier "בקי": the corners have no guide labels', W4['zerika:cornerLabels'] === 0, String(W4['zerika:cornerLabels']));
      check('repeat: the short intro (evarim)', /תשעה בשורה/.test(W4['evarim:intro'] || ''), W4['evarim:intro']);
      const plain = (t) => String(t || '').replace(/[\u0591-\u05C7]/g, '');
      check('payis: the count starts from the kohen whose mitznefet was taken (Yoma 25a), the method cited (Rambam)', /המצנפת/.test(W4['payis2:mitz'] || '') && /שמונים מאה או אלף/.test(plain(W4['payis2:cite'])), (W4['payis2:mitz'] || '').slice(0, 60));
      check('kiddush: hands and feet together, as Zevachim 19b (cited, draft, source)', /רגלו הימנית/.test(W4['kiddush:cite'] || '') && /טיוטה/.test(W4['kiddush:cite'] || '') && /זבחים/.test(W4['kiddush:cite'] || ''), (W4['kiddush:cite'] || '').slice(0, 50));
      check('no console errors (wave 4)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 4. live: join the service while it happens (Sukkot night, the altar cleared from the first watch) ── */
    if (part('4')) {
      const phaseA = JSON.stringify({ v: 5, name: 'עזריה', mishmar: 3 });
      const { pg, errors } = await page(b, { init: { bh_beta2: phaseA }, now: SUKKOT_NIGHT });
      check('live: the status shows the live morning service', await wf(pg, () => /חי: התמיד של שחר/.test(document.querySelector('.av-status').innerText)));
      await shot(pg, 'live-home');
      await E(pg, () => document.querySelector('[data-a="join"]').click());
      const { cards } = await drive(pg);
      const done = await E(pg, () => window.__AV_LOG.filter((e) => e.type === 'done').map((e) => e.d));
      check('live: every step carries the live mark; "נכחת בזמן" on the cards', done.length === N && done.every((d) => d.live) && cards.slice(0, N).every((c) => /נכחת בזמן/.test(c.text)));
      const save = await E(pg, () => JSON.parse(localStorage.getItem('bh_avodah')));
      check('live: the attendance is saved for the Jerusalem day', Object.values(save.live).some((l) => l.includes('shachar')));
      check('live: the role for today was done "for real"', Object.keys(save.roles).length >= 1 && done.some((d) => d.forReal));
      check('no console errors (live)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
      // joining late: at 06:50 on a weekday the libations and the song are under way → join there
      const late = await page(b, { init: { bh_beta2: phaseA }, now: '2026-09-23T06:50:00+03:00' });
      await wf(late.pg, () => /חי: התמיד של שחר/.test(document.querySelector('.av-status').innerText));
      await E(late.pg, () => document.querySelector('[data-a="join"]').click());
      const lr = await drive(late.pg);
      check('live, joining late: the service is joined where it is (the wine and the song)', lr.games.join(',') === 'shir' && lr.cards.some((c) => /הצטרפת באמצע/.test(c.text)), lr.games.join(','));
      await late.pg.context().close();
    }

    /* ── 4b. Sukkot + Shabbat: the musaf segment brings the showbread, and no aravot on Shabbat; Chol HaMoed nights ── */
    if (part('4b')) {
      const pa = JSON.stringify({ v: 5, name: 'חנניה', mishmar: 4 });
      const { pg, errors } = await page(b, { init: { bh_beta2: pa }, now: '2026-09-26T10:00:00+03:00' });
      await wf(pg, () => document.querySelector('.av-home.on'));
      await E(pg, () => { window.__AV.av._.run('musaf'); });
      const r = await drive(pg);
      check('Shabbat Sukkot I: musaf → its song (Haazinu, RH 31a) → showbread; no aravot on Shabbat (Sukkah 4:3)', r.games.join(',') === 'musaf,shir,lechem', r.games.join(','));
      await pg.context().close();
      const n = await page(b, { init: { bh_beta2: pa }, now: '2026-09-28T21:00:00+03:00' });
      check('Chol HaMoed night: Simchat Beit HaShoevah is live', await wf(n.pg, () => /חי: שמחת בית השואבה/.test(document.querySelector('.av-status').innerText)));
      await E(n.pg, () => document.querySelector('[data-a="join"]').click());
      await wf(n.pg, () => window.__AV.av._.game === 'shoevah');
      await n.pg.waitForTimeout(300);
      await shot(n.pg, 'game-shoevah');
      const r2 = await drive(n.pg);
      const d = await E(n.pg, () => window.__AV_LOG.filter((e) => e.type === 'done').map((e) => e.d));
      check('Beit HaShoevah: played live, with the live mark', r2.games[0] === 'shoevah' && d.length === 1 && d[0].live, r2.games.join(','));
      const m = await page(b, { init: { bh_beta2: pa }, now: '2026-09-28T07:30:00+03:00' });
      check('Chol HaMoed morning: the musaf is live', await wf(m.pg, () => /חי: קרבן מוסף/.test(document.querySelector('.av-status').innerText)));
      await E(m.pg, () => document.querySelector('[data-a="join"]').click());
      const r3 = await drive(m.pg);
      check('Chol HaMoed: musaf → its song (Sukkah 55a) → aravot around the altar (Sukkah 4:5)', r3.games.join(',') === 'musaf,shir,aravot', r3.games.join(','));
      check('no console errors (Sukkot and Shabbat)', errors.length === 0 && n.errors.length === 0 && m.errors.length === 0, [...errors, ...n.errors, ...m.errors].slice(0, 3).join(' | '));
      await n.pg.context().close(); await m.pg.context().close();
    }

    /* ── 5. the ketoret lot: the legendary, once-in-a-lifetime offering ── */
    if (part('5')) {
      const phaseA = JSON.stringify({ v: 5, name: 'מתתיה', mishmar: 9 });
      const { pg, errors } = await page(b, { init: { bh_beta2: phaseA } });
      await wf(pg, () => document.querySelector('.av-home.on'));
      await E(pg, () => window.__AV.av._.setState((A) => { const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.parse('2026-09-25T20:00:00+03:00'))); A.lots = { day: d, deshen: true, role: 'zorek', ketoret: true, evarim: true }; }));
      await E(pg, () => { window.__AV.av._.run('ketoret'); });
      let badge = '';
      await drive(pg, { onGame: async () => { badge = await E(pg, () => document.querySelector('.av-mg-top').innerText); await pg.waitForTimeout(300); } });
      check('ketoret lot → "עבודה בפועל" in the game', /עבודה בפועל/.test(badge), badge.replace(/\s+/g, ' '));
      const save = await E(pg, () => JSON.parse(localStorage.getItem('bh_avodah')));
      check('the ketoret is offered once: no longer "new"; collectible kept', save.ketoret.done === true && !!save.collect.ketoret);
      await E(pg, () => document.querySelector('[data-tab="path"]').click());
      check('הדרך שלי shows "הקטרת!"', await wf(pg, () => /הקטרת!/.test(document.querySelector('.av-body').innerText)));
      check('no console errors (ketoret)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 6. world = {} and a broken world: the service always goes on ── */
    if (part('6')) for (const [label, params] of [['world = {}', 'fast=1&world=none'], ['a world without project() (the SVG fallback)', 'fast=1&no3d=1'], ['a broken world (throws, hangs, rejects)', 'fast=1&broken=1']]) {
      const { pg, errors } = await page(b, { params, init: { bh_beta2: JSON.stringify({ v: 5, name: 'שמעון', mishmar: 2 }) } });
      await wf(pg, () => document.querySelector('.av-home.on'));
      await E(pg, () => { window.__AV.av._.run('shachar'); });
      const { games } = await drive(pg, { limitMs: 200000 });
      check(`${label}: the morning service completes`, games.length === N, games.join(','));
      if (!/broken/.test(params)) check(`${label}: no 3D target is shown; the illustrated cards are played`, await E(pg, () => window.__AV3D_HITS.length === 0 && !document.querySelector('.av3d-t')));
      check(`${label}: no page errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 6a. 3D targets out of reach (under the card): the layer retires and the illustrated card is played ── */
    if (part('6a')) {
      const { pg, errors, warnings } = await page(b, { params: 'fast=1&lost=1', init: { bh_beta2: JSON.stringify({ v: 5, name: 'שמעון', mishmar: 2 }) } });
      await wf(pg, () => document.querySelector('.av-home.on'));
      const ran = [];
      for (const g of ['maaracha', 'deshen', 'zerika', 'ketoret']) {
        await E(pg, (id) => { window.__AV.av._.run(id); }, g);
        const r = await drive(pg, { limitMs: 30000 });
        ran.push(r.games[0] === g && r.cards.length >= 1);
      }
      const retired = warnings.filter((w) => /3D target out of reach/.test(w)).length;
      check('3D targets out of reach: the layer retires to the illustrated card; no step is stuck', ran.every(Boolean) && retired >= 1, `${ran.map(String).join(',')} · retired ×${retired}`);
      check('3D targets out of reach: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 6b. production mode: only approved content (none yet) — the games still play, the draft cards are hidden ── */
    if (part('6b')) {
      const { pg, errors } = await page(b, { params: 'fast=1&production=1', init: { bh_beta2: JSON.stringify({ v: 5, name: 'שמעון', mishmar: 2 }) } });
      await wf(pg, () => document.querySelector('.av-home.on'));
      await E(pg, () => { window.__AV.av._.run('deshen'); });
      const r = await drive(pg);
      check('production mode: the game plays; no draft content card is shown', r.games[0] === 'deshen' && r.cards.length >= 1 && r.cards.every((c) => c.subs === 0), JSON.stringify(r.cards.map((c) => c.subs)));
      check('production mode: no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }

    /* ── 6c. wave 12 (AVODA12): the Levites' song every day, the day in detail, N69 ── */
    if (part('6c')) {
      // N69: a name from Phase A is never asked again — with a name and no mishmar, only the mishmar is asked
      const pa = JSON.stringify({ v: 5, name: 'פנחס', mishmar: 0 });
      const { pg, errors } = await page(b, { init: { bh_beta2: pa }, now: '2026-09-28T10:00:00+03:00' });
      const card = await wf(pg, () => document.querySelector('.av-modal.on') && /שלום, הכהן פנחס/.test(document.querySelector('.av-modal.on').innerText));
      check('N69: Phase A\'s name is greeted ("שלום, הכהן פנחס") and never asked again (no name field; the mishmar only)', card && await E(pg, () => !document.querySelector('.av-modal.on .av-input') && document.querySelectorAll('.av-modal.on .av-mishmarot button').length === 24 && /יאללה לעבודה/.test(document.querySelector('.av-modal.on').innerText)));
      await shot(pg, 'w12-n69-mishmar');
      await pg.click('.av-mishmarot button[data-m="3"]');
      await pg.click('.av-modal [data-v="ok"]');
      check('N69: the intro greets him by name; the save keeps the name', await wf(pg, () => /שלום, הכהן פנחס/.test(document.body.innerText) && /ברוך הבא לעבודה/.test(document.body.innerText)) && await E(pg, () => { const s = JSON.parse(localStorage.getItem('bh_avodah')); return s.name === 'פנחס' && s.mishmar === 3; }));
      await pg.click('.av-modal [data-v="go"]');
      await wf(pg, () => document.querySelector('.av-home.on'));
      const box = await E(pg, () => { const b = document.querySelector('.av-shirday'); return b ? b.innerText : ''; });
      check('home, every day: the Levites\' song of the day (the psalm and its source, why today, the chalil on Sukkot, one tap to sing)', /גדול ה׳/.test(box) && /תמיד ז, ד/.test(box) && /למה היום/.test(box) && /החליל/.test(box) && await E(pg, () => !!document.querySelector('.av-shirday [data-play="shir"]')), box.replace(/\s+/g, ' ').slice(0, 120));
      await shot(pg, 'w12-home-shir');
      // the song on Chol HaMoed Sukkot (a Monday): the psalm and its source, the instruments with the chalil, the cymbal, the lines
      const watchShir = () => E(pg, () => {
        const W = window.__W12 = { perek: [], cite: [] };
        const look = () => {
          const q = (x) => document.querySelector(x);
          if (q('.av-shir-psalm')) W.psalm = q('.av-shir-psalm').textContent;
          if (q('.av-shir-kelim')) W.kelim = q('.av-shir-kelim').textContent;
          if (q('[data-k="tziltzal"]')) W.cym = true;
          const pk = q('.av-shir-perek'); if (pk && pk.textContent && W.perek[W.perek.length - 1] !== pk.textContent) W.perek.push(pk.textContent);
          const c = q('.av-cite'); if (c && W.cite[W.cite.length - 1] !== c.textContent) W.cite.push(c.textContent);
        };
        const mo = new MutationObserver(() => { look(); if (!window.__AV.av._.game) mo.disconnect(); });
        mo.observe(document.body, { childList: true, subtree: true, characterData: true });
        look();
      });
      const l0 = await E(pg, () => window.__AV_LOG.length);
      await E(pg, () => { window.__AV.av._.run('shir'); });
      const rs = await drive(pg, { onGame: async () => { await watchShir(); } });
      const W12 = await E(pg, () => window.__W12);
      const ev = await E(pg, (l0) => window.__AV_LOG.slice(l0).filter((e) => /^shir/.test(e.type)).map((e) => ({ type: e.type, d: e.d })), l0);
      check('shir: today\'s psalm with its source (Monday: "גדול ה׳ ומהלל מאד", תמיד ז, ד)', rs.games[0] === 'shir' && /גדול ה׳/.test(W12.psalm || '') && /תמיד ז, ד/.test(W12.psalm || ''), W12.psalm);
      check('shir: the Levites\' instruments — kinorot, nevalim, one tziltzal; on Sukkot the chalil too (Arachin 2:3)', /כינורות/.test(W12.kelim || '') && /נבלים/.test(W12.kelim || '') && /צלצל/.test(W12.kelim || '') && /חלילים/.test(W12.kelim || ''), W12.kelim);
      check('shir: the player strikes the cymbal when the sgan waves (Tamid 7:3)', W12.cym === true);
      check('shir: three פרקים, each with its true line — why this psalm today (RH 31a), the chalil\'s days', W12.perek.length >= 3 && W12.cite.some((c) => /שחילק מעשיו ומלך עליהן/.test(c) && /ראש השנה לא, א/.test(c)) && W12.cite.some((c) => /ערכין ב, ג/.test(c)), JSON.stringify(W12.perek).slice(0, 220));
      const blasts = ev.filter((e) => e.type === 'shirBlast');
      check('shir → the music: shirBlast ttt (the wine given), shirStart {chalil}, 9 player blasts (3 פרקים × תקיעה, תרועה, תקיעה), shirEnd', ev.length >= 3 && ev[0].type === 'shirBlast' && ev[0].d.kind === 'ttt' && ev.some((e) => e.type === 'shirStart' && e.d.chalil === true && e.d.day === 1) && blasts.filter((e) => e.d.n > 0).length === 9 && ev[ev.length - 1].type === 'shirEnd', ev.map((e) => e.type + (e.d.kind ? ':' + e.d.kind : '')).join(' '));
      // the new moments of the day, each with its sourced draft card
      const seen12 = {};
      for (const g of ['chavitin', 'shaarim', 'kelim', 'machar', 'neilah']) {
        const c0 = await E(pg, () => window.__AV.calls.length);
        await E(pg, (id) => { window.__AV.av._.run(id); }, g);
        const r = await drive(pg, { limitMs: 30000, onGame: async (id) => { await pg.waitForTimeout(120); await shot(pg, 'w12-' + id); } });
        seen12[g] = { ok: r.games[0] === g && r.cards.length >= 1 && r.cards[0].drafts >= 1 && r.cards[0].refs >= 1, text: r.cards.map((c) => c.text).join(' '), calls: await E(pg, (c0) => window.__AV.calls.slice(c0).map((c) => ({ fn: c.fn, a: c.args })), c0) };
      }
      check('the day in detail: five new moments play, each followed by its sourced draft card', Object.values(seen12).every((x) => x.ok), Object.keys(seen12).filter((g) => !seen12[g].ok).join(','));
      check('chavitin: "בין בשל ונא" (Rambam, Maaseh HaKorbanot 13:3); half in the morning, half in the evening (Menachot 4:5)', /בין בשל ונא/.test(seen12.chavitin.text) && /מעשה הקרבנות/.test(seen12.chavitin.text));
      check('kelim: 93 vessels (Tamid 3:4)', /תשעים ושלשה/.test(seen12.kelim.text) && /תמיד ג, ד/.test(seen12.kelim.text));
      check('machar: two of three new lambs go in (the ear\'s skin is not a blemish; its cartilage is), six checked stay (Arachin 2:5)', seen12.machar.calls.some((c) => c.fn === 'avodah.lambsChamber.count' && c.a[0] === 6) && /ערכין ב, ה/.test(seen12.machar.text));
      check('neilah: the seven gates closed (Shekalim 5:1 "בן גבר על נעילת שערים"), then night — the fire burns on (Lev. 6:6, the second card)', seen12.neilah.calls.some((c) => c.fn === 'setTimeOfDay' && c.a[0] === 'night') && /בן גבר/.test(seen12.neilah.text) && /שקלים ה, א/.test(seen12.neilah.text) && /עוד מקורות/.test(seen12.neilah.text), seen12.neilah.text.replace(/\s+/g, ' ').slice(0, 100));
      check('shaarim: three blasts at the opening of the gates (Sukkah 5:5)', /סוכה ה, ה/.test(seen12.shaarim.text));
      check('the kohen walks to each new moment\'s place', ['chavitin', 'shaarim', 'kelim', 'machar'].every((g) => seen12[g].calls.some((c) => c.fn === 'kohen(player).walkTo')), ['chavitin', 'shaarim', 'kelim', 'machar'].filter((g) => !seen12[g].calls.some((c) => c.fn === 'kohen(player).walkTo')).join(','));
      check('no Divine Name in any rendered text (wave 12)', await E(pg, () => window.__AV_NAMES.length === 0));
      check('no console errors (wave 12)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
      // a day without the chalil (25 Tishrei, a Tuesday): no chalil; why Tuesday's psalm
      const q = await page(b, { init: { bh_beta2: JSON.stringify({ v: 5, name: 'שמעון', mishmar: 2 }) }, now: '2026-10-06T10:00:00+03:00' });
      await wf(q.pg, () => document.querySelector('.av-home.on'));
      const q0 = await E(q.pg, () => window.__AV_LOG.length);
      await E(q.pg, () => { window.__AV.av._.run('shir'); });
      await drive(q.pg, { onGame: async () => { await E(q.pg, () => {
        const W = window.__W12 = { cite: [] };
        const mo = new MutationObserver(() => { const k = document.querySelector('.av-shir-kelim'); if (k) W.kelim = k.textContent; const c = document.querySelector('.av-cite'); if (c) W.cite.push(c.textContent); if (!window.__AV.av._.game) mo.disconnect(); });
        mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      }); } });
      const Q = await E(q.pg, () => window.__W12);
      const qs = await E(q.pg, (q0) => window.__AV_LOG.slice(q0).find((e) => e.type === 'shirStart'), q0);
      check('a weekday after the Chag: no chalil (Arachin 2:3); Tuesday\'s psalm, "שגילה ארץ בחכמתו" (RH 31a)', !/חלילים/.test(Q.kelim || '') && qs && qs.d.chalil === false && qs.d.day === 2 && Q.cite.some((c) => /שגילה ארץ בחכמתו/.test(c)), (Q.kelim || '').slice(0, 80));
      check('no console errors (a plain weekday)', q.errors.length === 0, q.errors.slice(0, 3).join(' | '));
      await q.pg.context().close();
    }

    /* ── 13. ── service13 ── (wave 13) פיטום הקטורת at Beit Avtinas; the pens and the lambs' chamber; the home's box ── */
    if (part('13')) {
      const NOW = '2026-09-30T10:00:00+03:00';   // 19 Tishrei 5787, Chol HaMoed (the 5th day): tomorrow 8 bulls
      // REAL TOUCH (CDP touches, the phone's page with its viewport, normal speed): the home's two buttons open the two games;
      // a stone touched and the pour held to the green line; the trough held full and the hay touched — then "דלג"
      {
        const { pg: tp, errors: te } = await page(b, { params: '', init: { bh_beta2: JSON.stringify({ v: 5, name: 'אביתר', mishmar: 3 }) }, now: NOW });
        await wf(tp, () => document.querySelector('.av-home.on') && document.querySelector('.av-svc'));
        const cdp = await tp.context().newCDPSession(tp);
        const tdown = (q) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: q.x, y: q.y }] });
        const tup = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        const touch = async (q, ms = 60) => { if (!q) return false; await tdown(q); await tp.waitForTimeout(ms); await tup(); return true; };
        // (integration v26) the home's sheet rises when it is scrolled (--ui-dock 0 → 558 px over ~600 ms): a button is measured once it
        // stands still, as a player taps what he sees (a rect read at once was the pre-scroll one, y 1178 on an 844 screen)
        const rectOf = ([s, l]) => { const e = l ? [...document.querySelectorAll(s)].find((x) => x.getAttribute('aria-label') === l) : document.querySelector(s); if (!e) return null; const r = (l ? e.querySelector('.av-hit') : e).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; };
        const at = async (sel, label) => {
          if (!label) { const sc = await E(tp, (s) => { const e = document.querySelector(s); if (!e) return false; e.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; }, sel); if (!sc) return null; await tp.waitForTimeout(900); }
          let a = null, same = 0;
          for (let k = 0; k < 20; k++) { const b = await E(tp, rectOf, [sel, label || null]); if (!b) return null; same = a && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) < 0.5 ? same + 1 : 0; a = b; if (same >= 2 || label) return b; await tp.waitForTimeout(150); }
          return a;
        };
        const home1 = await at('.av-svc [data-play="pitum"]');
        await touch(home1);
        const opened = await wf(tp, () => window.__AV.av._.game === 'pitum', null, 12000);
        await wf(tp, () => document.querySelectorAll('.av-p-tgt').length >= 6, null, 8000);
        await touch(await at('.av-p-tgt', 'אבן משקל 70 מנה'));
        await tp.waitForTimeout(200);
        const pq = await at('[data-k="pour"]');
        if (pq) { await tdown(pq); await wf(tp, () => document.querySelector('.av-p-level.on'), null, 6000); await tup(); }
        const settled = await wf(tp, () => /מאוזן|ציפורן/.test(document.querySelector('.av-hint').textContent), null, 4000);
        await shot(tp, 'w13-touch-pitum');
        await E(tp, () => document.querySelector('.av-mg .av-skip').click());
        await drive(tp, { limitMs: 15000 });
        check('real touch (CDP): the home\'s "לפטם קטורת" opens פיטום הקטורת; a stone touched, the pour held to the green line', opened && settled, `opened ${opened}, settled ${settled}, button ${home1 && Math.round(home1.h)} px`);
        await wf(tp, () => document.querySelector('.av-home.on') && document.querySelector('.av-svc'), null, 10000);
        const home2 = await at('.av-svc [data-play="dir"]');
        await touch(home2);
        const opened2 = await wf(tp, () => window.__AV.av._.game === 'dir', null, 12000);
        const wq = await at('[data-k="water"]');
        if (wq) { await tdown(wq); await wf(tp, () => document.querySelector('[data-k="water"]').disabled, null, 6000); await tup(); }
        for (let i = 1; i <= 3; i++) { await touch(await at('.av-r-tgt', `אלומת מספוא ${i}`)); await tp.waitForTimeout(120); }
        const tended = await wf(tp, () => /מחר במוסף/.test(document.querySelector('.av-hint').textContent), null, 6000);
        let led = 0;
        for (let k = 0; k < 12; k++) { const q = await E(tp, () => { const g = [...document.querySelectorAll('.av-r-tgt')].find((x) => /^(פר|איל|שעיר) \d+$/.test(x.getAttribute('aria-label') || '')); if (!g) return null; const r = g.querySelector('.av-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (!q) break; await touch(q); led++; await tp.waitForTimeout(80); }
        await shot(tp, 'w13-touch-dir');
        await E(tp, () => document.querySelector('.av-mg .av-skip').click());
        await drive(tp, { limitMs: 15000 });
        check('real touch (CDP): the home\'s "לדיר וללשכת הטלאים" opens the pens; the trough held full, the hay touched, tomorrow\'s 11 musaf animals led out', opened2 && tended && led === 11, `opened ${opened2}, tended ${tended}, led ${led}`);
        check('no console errors (real touch)', te.length === 0, te.slice(0, 3).join(' | '));
        await tp.context().close();
      }
      const { pg, errors } = await page(b, { init: { bh_beta2: JSON.stringify({ v: 5, name: 'אביתר', mishmar: 3 }) }, now: NOW });
      await wf(pg, () => document.querySelector('.av-home.on'));
      const box0 = await E(pg, () => (document.querySelector('.av-svc') || {}).innerText || '');
      check('the home: the box "בית אבטינס והדיר" invites (no ketoret yet), tomorrow\'s need from the calendar (20 Tishrei: 8 bulls)', /בית אבטינס והדיר/.test(box0) && /בוא לשקול/.test(box0) && /מחר צריך: 2 כבשי תמיד · מוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר/.test(box0) && /ערכין ב, ה/.test(box0), box0.replace(/\s+/g, ' ').slice(0, 160));
      await shot(pg, 'w13-home');
      // the ketoret with an empty store: the service goes on, nothing is taken, no "punishment" line
      await E(pg, () => { window.__AV.av._.run('ketoret'); });
      const rk0 = await drive(pg, { limitMs: 40000 });
      const s0 = await E(pg, () => window.__AV.av.state.pitum);
      check('an empty store never stops the ketoret (the Temple burns its own): the game and its card, the store stays 0', rk0.games[0] === 'ketoret' && rk0.cards.length >= 1 && s0.half === 0 && !rk0.cards.some((c) => /מן הקטורת שפיטמת/.test(c.text)), JSON.stringify(s0));
      // pitum: a wrong stone and the honey explain themselves with the baraita; then the solver weighs, grinds, stores
      let wrong = '', honey = '', grindSeen = false;
      await E(pg, () => { window.__AV.av._.run('pitum'); });
      const rp = await drive(pg, {
        limitMs: 60000,
        onGame: async (id) => {
          if (id !== 'pitum') return;
          await wf(pg, () => document.querySelectorAll('.av-p-tgt').length >= 6);
          await shot(pg, 'w13-pitum-weigh');
          wrong = await E(pg, () => { const t = [...document.querySelectorAll('.av-p-tgt')].find((g) => /אבן משקל 16 /.test(g.getAttribute('aria-label'))); t.querySelector('.av-hit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return document.querySelector('.av-hint').textContent; });
          honey = await E(pg, () => { const t = [...document.querySelectorAll('.av-p-tgt')].find((g) => /דבש/.test(g.getAttribute('aria-label'))); t.querySelector('.av-hit').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return document.querySelector('.av-hint').textContent; });
          E(pg, () => new Promise((res) => { const iv = setInterval(() => { if (document.querySelector('.av-p-lane')) { clearInterval(iv); res(true); } }, 30); setTimeout(() => { clearInterval(iv); res(false); }, 30000); })).then((v) => { grindSeen = !!v; }, () => {});
        },
      });
      const s1 = await E(pg, () => window.__AV.av.state.pitum);
      const pcards = rp.cards.map((c) => c.text).join(' ');
      check('pitum: a wrong weight explains itself with the baraita ("…משקל שבעים של שבעים מנה", כריתות ו ע״א)', /משקל שבעים של שבעים מנה/.test(wrong) && /כריתות ו ע״א/.test(wrong), wrong.slice(0, 120));
      check('pitum: the honey — "ואם נתן בה דבש פסלה" (כריתות ו ע״א)', /ואם נתן בה דבש פסלה/.test(honey), honey.slice(0, 90));
      check('pitum: the eleven weighed, the mortar\'s rhythm reached, 368 manim into the store (365 + 3)', rp.games[0] === 'pitum' && grindSeen && s1.half === 736 && s1.batches === 1, JSON.stringify(s1));
      check('pitum: its draft cards with their sources (the eleven and 368 open; the chant, Beit Avtinas, the galbanum under "עוד מקורות (4)")', rp.cards.length >= 1 && rp.cards[0].drafts >= 1 && /כריתות ו/.test(pcards) && /368/.test(pcards) && /עוד מקורות \(4\)/.test(pcards) && /מנה באוצר הקטורת/.test(pcards), pcards.replace(/\s+/g, ' ').slice(0, 140));
      // the day's ketoret from his store: ½ in the morning, once a day; ½ in the evening
      for (const g of ['ketoret', 'ketoret', 'neirot']) { await E(pg, (id) => { window.__AV.av._.run(id); }, g); await drive(pg, { limitMs: 40000 }); }
      const s2 = await E(pg, () => window.__AV.av.state.pitum);
      // (this morning's half was burnt before he had a store — from the Temple's own; the morning's is once a day: the evening's is his)
      check('the day\'s ketoret from his store: the morning\'s half once a day (already burnt today from the Temple\'s own), the evening\'s ½ from his ("פרס בשחרית ופרס בין הערבים")', s2.half === 735 && s2.used['2026-09-30'] === 'ap', JSON.stringify(s2));
      const box1 = await E(pg, () => { window.__AV.av.showHome(); return (document.querySelector('.av-svc') || {}).innerText || ''; });
      check('the home shows the store: 367½ manim (a maneh a day; 3 for Yom Kippur)', /367½ מנה/.test(box1.replace(/[⁦-⁩]/g, '')) && /פרס בשחרית ופרס בין הערבים/.test(box1), box1.replace(/\s+/g, ' ').slice(0, 120));
      // the pens and the lambs' chamber
      const c0 = await E(pg, () => window.__AV.calls.length);
      let judgeMiss = '';
      await E(pg, () => { window.__AV.av._.run('dir'); });
      const rd = await drive(pg, {
        limitMs: 40000,
        onGame: async (id) => {
          if (id !== 'dir') return;
          await shot(pg, 'w13-dir-pens');
        },
      });
      const calls = await E(pg, (c0) => window.__AV.calls.slice(c0).map((c) => ({ fn: c.fn, a: c.args })), c0);
      const dstate = await E(pg, () => window.__AV.av.state.dir);
      const dcards = rd.cards.map((c) => c.text).join(' ');
      check('dir: water and hay at the pens, two new lambs checked into the chamber — six (lambsChamber.count(6), ערכין ב, ה)', rd.games[0] === 'dir' && calls.some((c) => c.fn === 'avodah.lambsChamber.count' && c.a[0] === 6) && calls.some((c) => c.fn === 'look') && dstate.checked === 2 && Object.values(dstate.days).some((d) => d.w === 1 && d.f === 1 && d.n === 2) && /ערכין ב, ה/.test(dcards), JSON.stringify(dstate));
      // a wrong judgement explains itself with the Mishnah (Bekhorot 6)
      await E(pg, () => { window.__AV.av._.run('dir'); });
      await drive(pg, {
        limitMs: 40000,
        onGame: async () => {
          // by hand: water, hay, then judge the first lamb wrongly (the solver finishes the other two)
          judgeMiss = await E(pg, async () => {
            const wait = (f, ms = 20000) => new Promise((res) => { const t0 = Date.now(); const iv = setInterval(() => { const v = f(); if (v || Date.now() - t0 > ms) { clearInterval(iv); res(v); } }, 20); });
            const pd = (el) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            const water = await wait(() => document.querySelector('[data-k="water"]'));
            water.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
            await wait(() => water.disabled);
            water.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
            for (const g of [...document.querySelectorAll('.av-r-tgt')].filter((g) => /מספוא/.test(g.getAttribute('aria-label')))) pd(g.querySelector('.av-hit'));
            // tomorrow's musaf (20 Tishrei: 8 bulls, 2 rams, a goat) led out first
            await wait(() => [...document.querySelectorAll('.av-r-tgt')].some((g) => /^(פר|איל|שעיר) \d+$/.test(g.getAttribute('aria-label') || '')));
            window.__W13M = 0;
            for (const g of [...document.querySelectorAll('.av-r-tgt')].filter((g) => /^(פר|איל|שעיר) \d+$/.test(g.getAttribute('aria-label') || ''))) { pd(g.querySelector('.av-hit')); window.__W13M++; }
            const lamb = await wait(() => [...document.querySelectorAll('.av-r-tgt')].find((g) => /^טלה 1$/.test(g.getAttribute('aria-label'))));
            if (!lamb) return 'no lamb';
            pd(lamb.querySelector('.av-hit'));
            for (const p of ['האוזן', 'העין', 'החוטם', 'השפה']) pd([...document.querySelectorAll('.av-r-tgt')].find((g) => g.getAttribute('aria-label') === p).querySelector('.av-hit'));
            const yes = document.querySelector('[data-k="tamim"]'), no = document.querySelector('[data-k="mum"]');
            const blem = !!document.querySelector('.av-r-mark');   // a notch (a blemish); a scratch or a spot on the white is not
            (blem ? yes : no).click();
            return document.querySelector('.av-hint').textContent;
          });
          await shot(pg, 'w13-dir-check');
        },
      });
      check('dir: tomorrow\'s musaf led out (8 bulls, 2 rams, a goat); a wrong judgement explains itself with the Mishnah\'s words (בכורות ו)', /בכורות ו|תמים/.test(judgeMiss) && await E(pg, () => window.__W13M) === 11, judgeMiss.slice(0, 100));
      check('no Divine Name in any rendered text (wave 13)', await E(pg, () => window.__AV_NAMES.length === 0));
      check('no console errors (wave 13)', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
      // Shabbat / Yom Tov (22 Tishrei 5787 = Shemini Atzeret on Shabbat): no new lambs — water, hay, and count the six
      const q = await page(b, { init: { bh_beta2: JSON.stringify({ v: 5, name: 'אביתר', mishmar: 3 }) }, now: '2026-10-03T10:00:00+03:00' });
      await wf(q.pg, () => document.querySelector('.av-home.on'));
      const qc0 = await E(q.pg, () => window.__AV.calls.length);
      await E(q.pg, () => { window.__AV.av._.run('dir'); });
      const rq = await drive(q.pg, { limitMs: 40000, onGame: async () => { await wf(q.pg, () => /אין טלאים חדשים/.test(document.querySelector('.av-hint').textContent), null, 20000); await shot(q.pg, 'w13-dir-shabbat'); } });
      const qcalls = await E(q.pg, (c0) => window.__AV.calls.slice(c0).map((c) => ({ fn: c.fn, a: c.args })), qc0);
      const qd = await E(q.pg, () => window.__AV.av.state.dir);
      check('Shabbat / Yom Tov: water and hay, no new lambs — the six are ready "כדי לשבת ולשני ימים טובים של ראש השנה"', rq.games[0] === 'dir' && qd.checked === 0 && qcalls.some((c) => c.fn === 'avodah.lambsChamber.count' && c.a[0] === 6) && rq.cards.some((c) => /ערכין ב, ה/.test(c.text)), JSON.stringify(qd));
      check('no console errors (Shabbat)', q.errors.length === 0, q.errors.slice(0, 3).join(' | '));
      await q.pg.context().close();
    }

    /* ── 7. desktop + dark: screenshots ── */
    if (part('7')) {
      const { pg, errors } = await page(b, { W: 1280, H: 720, params: 'fast=1&theme=dark', init: { bh_beta2: JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 }) } });
      await wf(pg, () => document.querySelector('.av-home.on'));
      await shot(pg, 'desktop-dark-home');
      await E(pg, () => { window.__AV.av._.run('korbanot'); });
      await wf(pg, () => window.__AV.av._.game === 'korbanot');
      await pg.waitForTimeout(300);
      await shot(pg, 'desktop-dark-korbanot');
      await drive(pg);
      check('desktop 1280×720 dark: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
      await pg.context().close();
    }
  } finally { await b.close(); }
  const fail = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fail.length}/${results.length} passed`);
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
