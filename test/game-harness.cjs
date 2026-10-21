// Game-systems harness v2: the real src/game HUD and rules against a FAKE world (no WebGL: fast).
//   node test/game-harness.cjs            build the bundle, run the unit tests, the pacing check and the flows
//   node test/game-harness.cjs --build    only build test/out/game-harness.bundle.js
// Screenshots (for review): test/out/game-h-<scene>.png. Fonts: GAME_FONTS_DIR=<dir with Google css+woff2>
// serves real fonts; otherwise the font request gets an empty stylesheet (no network in CI).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });

function build() {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'game-harness-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'game-harness.bundle.js'), logLevel: 'warning' });
}
build();
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
function sh(cmd) { try { return { ok: true, out: execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; } catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; } }
{
  const u = sh('node --test test/game-state.test.mjs');
  const m = u.out.match(/# pass (\d+)[\s\S]*# fail (\d+)/);
  check('unit tests (state.js rules)', u.ok, m ? `${m[1]} pass, ${m[2]} fail` : 'no summary');
  const s = sh('node test/game-sim.mjs --check');
  check('economy simulator: pacing within range', s.ok, (s.out.match(/regular\s+[\d.]+/) || [''])[0].replace(/\s+/, ' ') + ' days · ' + (s.out.match(/heavy\s+[\d.]+/) || [''])[0].replace(/\s+/, ' ') + ' days');
}

const FONTS = process.env.GAME_FONTS_DIR;
async function page(b, { W = 400, H = 860, touch = true, params = 'fast=1', init = null, storage = null, date = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.googleapis\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: FONTS && fs.existsSync(path.join(FONTS, 'fonts.css')) ? fs.readFileSync(path.join(FONTS, 'fonts.css'), 'utf8') : '' }));
  await pg.route(/fonts\.gstatic\.com/, (r) => { const f = FONTS && path.join(FONTS, path.basename(new URL(r.request().url()).pathname)); return f && fs.existsSync(f) ? r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.fulfill({ status: 404, body: '' }); });
  await pg.addInitScript(({ init, storage, date }) => {
    if (date) window.__FORCE_DATE = date;   // (wave 12: WORLD12's rain is by the Hebrew date; a pinned evening)
    window.__MG_AUTO = true;   // FUN's precision games (on a merge) play themselves and resolve in ~1 s
    window.__DIALOGS = [];
    for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; };
    if (storage === 'blocked') { Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: blocked'); } }); }
    else if (storage !== 'keep') { try { localStorage.clear(); } catch (e) { /* ignore */ } }
    if (init) try { for (const [k, v] of Object.entries(init)) localStorage.setItem(k, v); } catch (e) { /* ignore */ }
  }, { init, storage, date });
  if (!/(^|&)tod=/.test(params)) params += '&tod=noon';          // screenshots must not depend on the hour of the run
  await pg.goto('file://' + path.join(__dirname, 'game-harness.html') + '?' + params);
  await pg.waitForFunction(() => window.__H && window.__H.game, null, { timeout: 15000 });
  return { ctx, pg, logs };
}
const shot = async (pg, name) => { await pg.waitForTimeout(380); await pg.screenshot({ path: path.join(OUT, `game-h-${name}.png`) }); };
const E = (pg, fn, a) => pg.evaluate(fn, a);
const wf = (pg, fn, a, ms = 8000) => pg.waitForFunction(fn, a, { timeout: ms, polling: 50 }).then(() => true, () => false);
const dismiss = async (pg) => { for (let k = 0; k < 8; k++) { const b = await pg.$('.gm-modal.on .gm-btn-gold'); if (!b) break; await b.click(); await pg.waitForTimeout(260); } };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  /* ── 1. the first session (v6), fast: vision → survey → the rough hill → the first stone by hand → crew + name → stones → the first level ── */
  {
    const { pg, logs } = await page(b, { params: 'fast=1&api12=1&site6=1' });
    const s0 = await E(pg, () => ({ on: document.body.classList.contains('gm-on'), top: getComputedStyle(document.querySelector('.top')).display, dock: getComputedStyle(document.querySelector('.dock')).display, hud: !!document.querySelector('.gm .gm-pill') }));
    check('game mode hides the page chrome and mounts the HUD', s0.on && s0.top === 'none' && s0.dock === 'none' && s0.hud, JSON.stringify(s0));
    check('the vision uses world.showPlan when it exists', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'showPlan'), null, 3000));
    await pg.mouse.click(5, 400);
    check('sound starts on the first user gesture (WebAudio, no files)', await wf(pg, () => __H.game.sfx.running, null, 3000));
    const meter = await E(pg, () => [...document.querySelectorAll('.gm-res .gm-chip')].map((c) => c.dataset.r).join(','));
    check('the meter is always on screen: stone, cedar, gold, silver, bronze', meter === 'stone,cedar,gold,silver,bronze', meter);
    check('tutorial step 1: measure the Mount (the pill: מדידה)', await wf(pg, () => __H.game.state.ftue === 1 && /מדידה/.test(document.querySelector('.gm-pill').textContent)));
    await shot(pg, 'ftue');
    await E(pg, () => __H.game.onSiteTap('har'));
    check('a tap is a stroke: walk to SITE\'s workSpot, PEOPLE\'s act("measure")', await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'stroke') && __H.world.calls.some((c) => c.fn === 'workSpot' && c.args[1] === 'survey') && __H.world.calls.some((c) => c.fn === 'hero.act' && c.args[0] === 'measure')));
    for (let k = 0; k < 3 && !(await E(pg, () => __H.game.state.st.har.p !== 'survey')); k++) { await E(pg, () => __H.game.onSiteTap('har')); await pg.waitForTimeout(1000); }
    check('three strokes survey the Mount: the dig begins (the rough hill)', await wf(pg, () => __H.game.state.st.har.p === 'dig' && __H.game.state.ftue === 2, null, 4000));
    // ── flow8 ── (BRIEF8B · DESIGN8B R2/R3) the next boulder is marked in the world; a tap beside it strikes it
    check('the target is marked: a pointer and a ring on the boulder the next tap strikes', await wf(pg, () => { const m = document.querySelector('.gm-mark'); const e = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return !!m && !m.classList.contains('gm-hidden') && !!e && e.d.boulder != null; }, null, 3000));
    const miss = await E(pg, async () => { const n0 = window.__GAME_LOG.filter((e) => e.type === 'strike').length; const ok = __H.game.onMissTap(); for (let k = 0; k < 100 && window.__GAME_LOG.filter((e) => e.type === 'strike').length === n0; k++) await new Promise((r) => setTimeout(r, 30)); return { ok, struck: window.__GAME_LOG.filter((e) => e.type === 'strike').length > n0 }; });
    check('a tap beside the rock strikes the marked boulder (no misses, R3)', miss.ok && miss.struck, JSON.stringify(miss));
    // ── flow9 ── (BRIEF9 FLOW9-2) SITE9's boulder field: the game reads its spots; the pointer walks the path from rock 4
    const field = await E(pg, () => { const e = window.__GAME_LOG.find((x) => x.type === 'boulderField'); const m = window.__GAME_LOG.find((x) => x.type === 'mark' && x.d.boulder != null); return { order: e ? e.d.order.join(',') : null, first: m ? m.d.boulder : null }; });
    check('the boulder field (world.boulderSpots): read, and the pointer walks its path from rock 4 (DESIGN8B ORDER)', field.order === '4,5,6,7,8,9,10,11,0,1,2,3' && field.first === 4, JSON.stringify(field));
    // rhythm: tap on the beat → a perfect stroke
    const perfect = await E(pg, async () => {
      const g = __H.game, h = g._.hero, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const strokes = () => window.__GAME_LOG.filter((e) => e.type === 'strike');
      const i = g.state.bh.findIndex((v) => v === 2);
      const n0 = strokes().length;
      g.onBoulderTap(i);
      for (let k = 0; k < 100 && strokes().length === n0; k++) await sleep(20);
      await sleep(Math.max(0, (h.beat - performance.now() / 1000) * 1000 - 30));
      g.onBoulderTap(i);
      for (let k = 0; k < 100 && strokes().length === n0 + 1; k++) await sleep(20);
      return strokes().map((e) => e.d.perfect);
    });
    check('a tap on the beat is a perfect stroke', perfect.includes(true), JSON.stringify(perfect));
    check('the rhythm ring is live after strokes', await E(pg, () => document.querySelector('.gm-ring').classList.contains('live')));
    check('the ring sits on the struck boulder (world.screenPos)', await E(pg, () => { const m = document.querySelector('.gm-ring').style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return !!m && Math.abs(+m[1] - innerWidth / 2) < 1; }));
    // clear the hill quickly: the mentor's gift pays the first segment, and the first stone waits for the player's hands
    await E(pg, () => { const g = __H.game.state; g.bh = g.bh.map((v, i) => (i === 0 ? 1 : 0)); __H.game._.resync(); __H.game.onBoulderTap(0); });
    check('the last boulder ends the dig; the mentor\'s stones are on the site (8 in stock)', await wf(pg, () => { const s = __H.game.state.st.har; return s.p === 'courses' && s.paid === 8 && __H.game.state.ftue === 3; }, null, 5000));
    // (flow9: DESIGN8B 11:03 — the Mount's first stone is the crane's "האבן הגדולה", set with the crane)
    check('the pill: the first stone is yours ("האבן הגדולה: הנח אותה במנוף")', await wf(pg, () => /האבן הגדולה: הנח אותה במנוף/.test(document.querySelector('.gm-pill').textContent), null, 3000));
    check('SITE setWork carries the phase and the stock', await E(pg, () => __H.world.calls.some((c) => c.fn === 'setWork' && c.args[0] === 'har' && c.args[1] === 'foundation' && c.args[3] === 8)));
    await shot(pg, 'first-stone');
    await pg.click('.gm-pill');
    check('the key stone: the precision game of FUN (a merge) or the fallback card (alone)', await wf(pg, () => /הנח את האבן/.test((document.querySelector('.gm-modal.on') || {}).textContent || '') || window.__GAME_LOG.some((e) => e.type === 'minigame'), null, 8000));
    if (await pg.$('.gm-modal.on .gm-btn-gold')) await pg.click('.gm-modal.on .gm-btn-gold');
    check('the first stone is set by hand (keyStone, stoneSet by the hero) and lifted by the crane (liftStone great)', await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'keyStone') && window.__GAME_LOG.some((e) => e.type === 'stoneSet' && e.d.by === 'hero') && __H.world.calls.some((c) => c.fn === 'liftStone' && c.args[1] === true), null, 4000));
    check('the crew arrives after the first stone', await wf(pg, () => __H.game.state.crews.length === 1, null, 6000));
    check('"one of the 1,000 priests" card', await wf(pg, () => /אלף כהנים/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 8000));
    await pg.click('.gm-modal.on .gm-btn-gold');
    check('name and mishmar prompt (24 mishmarot)', await wf(pg, () => document.querySelectorAll('.gm-modal.on .gm-mishmarot button').length === 24, null, 3000));
    await pg.fill('.gm-modal.on .gm-input', 'אלעזר');
    await pg.click('.gm-modal.on [data-m="3"]');
    await shot(pg, 'name');
    await pg.click('.gm-modal.on .gm-btn-gold');
    check('the name and mishmar are kept', await wf(pg, () => __H.game.state.name === 'אלעזר' && __H.game.state.mishmar === 3));
    // ── flow8 ── (the owner, 28.9) the name is seen: the greeting card, the HUD chip, the plate over the hero
    check('a greeting card: "שלום, הכהן אלעזר"', await wf(pg, () => /שלום, הכהן אלעזר/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 3000));
    await shot(pg, 'greet');
    const gb = await E(pg, () => { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await pg.touchscreen.tap(gb.x, gb.y);
    check('the name on a HUD chip and on a plate over the hero', await wf(pg, () => { const c = document.querySelector('.gm-top .gm-name'), p = document.querySelector('.gm-plate'); return !!c && !c.classList.contains('gm-hidden') && /אלעזר/.test(c.textContent) && !!p && !p.classList.contains('gm-hidden') && p.textContent === 'הכהן אלעזר'; }, null, 3000));
    check('the coach says the name ("אלעזר, סיתות, סיתות, הנחה")', await wf(pg, () => /אלעזר, סיתות/.test((document.querySelector('.gm-bub') || {}).textContent || ''), null, 3000));
    check('the pointer and ring mark the banker while the first stones are set (R2)', await wf(pg, () => { const m = document.querySelector('.gm-mark'); return !!m && !m.classList.contains('gm-hidden') && m.style.opacity !== '0' && window.__GAME_LOG.some((e) => e.type === 'mark' && e.d.at === 'har'); }, null, 3000));
    // three strokes set a stone; the workpiece advances; a fast tap is queued, never lost
    const stone = await E(pg, async () => {
      const g = __H.game, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), s = g.state.st.har, set0 = s.set;
      for (let k = 0; k < 12 && s.set === set0; k++) { g.onSiteTap('har'); g.onSiteTap('har'); await sleep(450); }
      return { set0, set: s.set, wp: __H.world.calls.filter((c) => c.fn === 'hero.workpiece').map((c) => c.args[0]).slice(-3) };
    });
    check('strokes set a stone (dress on the banker: the workpiece advances rough → drafted → dressed)', stone.set > stone.set0 && stone.wp.length > 0, JSON.stringify(stone));
    // set the rest of the stock → the pill offers the first level for exactly the shortfall
    // (the Mount's segment costs 12 since 79e6a9e: the mentor's 40 stones buy three; here they are spent)
    await E(pg, () => { const s = __H.game.state.st.har; s.set = s.paid; s.k = 0; __H.game.state.res.stone = 0; __H.game._.resync(); });
    check('no stones and no stone in the meter: the pill is "▶ המחצבה" for the shortfall (never "wait")', await wf(pg, () => /המחצבה/.test(document.querySelector('.gm-pill').textContent) && document.querySelector('.gm-pill').classList.contains('play'), null, 3000));
    await shot(pg, 'pill-play');
    check('the meter marks the missing stone', await E(pg, () => document.querySelector('.gm-chip[data-r="stone"]').classList.contains('low')));
    // the meter's chip: where to get it
    await pg.click('.gm-chip[data-r="stone"]');
    check('tapping a chip shows where to get it (▶ play, the crews)', await wf(pg, () => { const t = document.querySelector('.gm-sheet.on'); return !!t && /מאיפה משיגים/.test(t.textContent) && !!t.querySelector('[data-a="playField"]'); }, null, 2000));
    await shot(pg, 'meter-sources');
    await E(pg, () => __H.game.ui.closeSheet());
    // the site panel
    await E(pg, () => __H.game.ui.openSheet('stage', 'har'));
    const panel = await E(pg, () => { const t = document.querySelector('.gm-sheet.on'); return { steps: t.querySelectorAll('.gm-steps li').length, on: (t.querySelector('.gm-steps li.on') || {}).textContent, course: /נדבך\s*\u2066?1\u2069?\s*מתוך\s*\u2066?6/.test(t.textContent), cells: t.querySelectorAll('.gm-course i').length, play: !!t.querySelector('.gm-big[data-a="play"]') }; });
    check('the site panel: 6 phases (נדבכים lit), course 1 of 6, its 32 stones, the one action (▶ play)', panel.steps === 6 && panel.on === 'נדבכים' && panel.course && panel.cells === 32 && panel.play, JSON.stringify(panel));
    check('the panel says in one line what the segment does and what the player does (flow8)', await E(pg, () => /אבנים מגיעות לאתר\./.test((document.querySelector('.gm-sheet.on .gm-line') || {}).textContent || '')));
    await shot(pg, 'site-panel');
    await E(pg, () => __H.game.ui.closeSheet());
    // the first level (no MATCH3 in this build: a card that grants the need) → the step is paid at once
    await pg.click('.gm-pill');
    check('the level (fallback card) grants the shortfall', await wf(pg, () => /משחק האוצר/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 3000));
    await pg.click('.gm-modal.on .gm-btn-gold');
    check('a won level pays the step at once: 8 more stones on the site', await wf(pg, () => __H.game.state.st.har.paid === 16 && window.__GAME_LOG.some((e) => e.type === 'm3Won') && window.__GAME_LOG.some((e) => e.type === 'step'), null, 3000));
    check('the tutorial ends after the first level', await wf(pg, () => __H.game.state.ftue === 99, null, 3000));
    // the Middot book
    await pg.click('.gm-db[data-k="book"]');
    await pg.click('.gm-sheet.on [data-a="bookCh"][data-c="1"]');
    await pg.click('.gm-sheet.on [data-a="mishnah"][data-id="2.1"]');
    check('reading a mishnah shows the exact text + explanation', await wf(pg, () => /הַר הַבַּיִת הָיָה חֲמֵשׁ מֵאוֹת אַמָּה/.test(document.querySelector('.gm-sheet.on').textContent)));
    // settings: rhythm off; mute is remembered
    await E(pg, () => __H.game.ui.openSheet('menu'));
    await pg.click('.gm-sheet.on [data-k="rhythm"]');
    await pg.click('.gm-sheet.on [data-k="mute"]');
    const st = await E(pg, () => ({ s: JSON.parse(localStorage.getItem('bh_settings') || '{}'), mute: localStorage.getItem('bh_mute') }));
    check('rhythm switch and mute are remembered (try/catch storage)', st.s.rhythm === false && st.mute === '1', JSON.stringify(st));
    await E(pg, () => __H.game.ui.openSheet('daily'));
    check('daily: wage, streak, three tasks, the vine', await E(pg, () => document.querySelectorAll('.gm-sheet.on .gm-row').length >= 4 && !!document.querySelector('.gm-sheet.on .gm-vine')));
    // the project board: every open site; the map lists 15
    await E(pg, () => { __H.game.ui.closeSheet(); __H.game.ui.openSheet('store'); });
    check('the project board lists the open sites and the map all 15', await E(pg, () => document.querySelectorAll('.gm-sheet.on .gm-brow').length >= 1 && document.querySelectorAll('.gm-sheet.on .gm-node').length === 15));
    await shot(pg, 'board');
    // the kings' door without KINGS: a card, never a dead button
    await E(pg, () => __H.game.ui.closeSheet());
    await pg.click('.gm-db[data-k="kings"]');
    check('the kings\' door (no KINGS in this build): a sourced card', await wf(pg, () => /עזרא ג, ז/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 3000));
    await dismiss(pg);
    // whole-Temple view hooks
    await E(pg, () => { __H.game.ui.closeSheet(); __H.game.enterWhole(); });
    const wv = await E(pg, () => ({ hooks: __H.world.calls.some((c) => c.fn === 'hooks.enterWhole'), dock: getComputedStyle(document.querySelector('.dock')).display, hud: getComputedStyle(document.querySelector('.gm-dock')).display }));
    check('whole-Temple view: hook called, page view chips shown, game HUD hidden', wv.hooks && wv.dock !== 'none' && wv.hud === 'none', JSON.stringify(wv));
    await pg.click('.gm-back');
    check('"חזרה למשחק" calls exitWhole and resyncs the site (setWork)', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'hooks.exitWhole') && __H.world.stages.har && __H.world.stages.har.work));
    // welcome back after an absence: the crew set the stock while away
    await E(pg, () => { const g = __H.game.state; g.crews[0].at = 'har'; __H.game._.simulateAbsence(3 * 3600 * 1000); });
    check('welcome back: the crews set stones while you were away', await wf(pg, () => /הצוותים הניחו/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 4000), await E(pg, () => ((document.querySelector('.gm-modal.on') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 160) + ' · ' + JSON.stringify({ st: __H.game.state.st.har, res: __H.game.state.res, ftue: __H.game.state.ftue })));
    await shot(pg, 'welcome');
    await dismiss(pg);
    check('sheets/modals mark the game busy (no auto-rotate under them)', await E(pg, () => { __H.game.ui.openSheet('daily'); const b = __H.game.busy; __H.game.ui.closeSheet(); return b && !__H.game.busy; }));
    check('no alert/confirm/prompt', (await E(pg, () => window.__DIALOGS.length)) === 0);
    const bad = logs.filter((l) => !/fonts/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* ── 1b. the other agents' parts, by their contracts (fakes): MATCH3 runLevel, FUN runMinigame, KINGS openCourt/settle ── */
  {
    const { pg, logs } = await page(b, { params: 'fast=1&api12=1&site6=1&parts=1', init: { bh_settings: JSON.stringify({ demo: false }) } });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    await E(pg, () => {
      const g = __H.game.state; g.ftue = 99; __H.game.ui.coach(null, ''); g.st.har = { done: true }; g.crews = [{ at: null }, { at: null }];
      g.res = { stone: 0, cedar: 0, bronze: 0, gold: 0, silver: 200, wstone: 0 }; __H.game._.resync();
    });
    await pg.click('.gm-pill');                                    // start the wall (its survey is paid in silver)
    check('the next stage starts from the pill (its survey costs silver)', await wf(pg, () => __H.game.state.st.wall && __H.game.state.st.wall.p === 'survey' && __H.game.state.res.silver === 190, null, 3000));
    await E(pg, () => { const s = __H.game.state.st.wall; s.p = 'courses'; s.dp = 1; __H.game._.resync(); });
    // ── flow16 ── the balance: with no stone his hands still work — the wall's first stone is its key stone: the pill is its card at once
    // (FUN's crane, the fake), set by hand (paid nothing); then the pill opens the deal (his cards, and the extra card "▶ הביאו אבנים")
    // and the board comes from that card alone
    await pg.click('.gm-pill');
    check('flow16: with no stone the pill plays the key stone\'s card (his hands never wait for the stock)', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'fun.runMinigame' && c.args[0] === 'crane' && c.args[1] === 'wall') && __H.game.state.st.wall.set >= 1 && __H.game.state.st.wall.set <= 4 && __H.game.state.st.wall.hand >= 1, null, 6000), await E(pg, () => JSON.stringify({ pill: (document.querySelector('.gm-pill') || {}).textContent, set: __H.game.state.st.wall.set, paid: __H.game.state.st.wall.paid, hand: __H.game.state.st.wall.hand })));
    for (let t = 0; t < 8 && !(await pg.$('.gm-deal.on')); t++) { await dismiss(pg); await pg.waitForTimeout(400); if (!(await pg.$('.gm-deal.on'))) await pg.click('.gm-pill').catch(() => {}); }
    check('flow16: with no stone the pill opens the deal — his cards and "▶ הביאו אבנים · כ־N אבנים · לוח של ≈ M דק׳"', await wf(pg, () => { const d = document.querySelector('.gm-deal.on'); return !!d && d.querySelectorAll('.gm-jc:not(.quarry)').length >= 1 && /הביאו אבנים/.test((d.querySelector('.gm-jc.quarry') || {}).textContent || '') && /לוח של/.test((d.querySelector('.gm-jc.quarry') || {}).textContent || ''); }, null, 3000), await E(pg, () => (document.querySelector('.gm-pill') || {}).textContent));
    check('flow16: the pill says the stock plainly ("המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך")', await E(pg, () => /המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך/.test((document.querySelector('.gm-pill') || {}).textContent || '')));
    const m3 = () => __H.world.calls.some((c) => c.fn === 'm3.runLevel' && c.args[0] === 'quarry' && c.args[1] === '{"stone":45}');
    for (let t = 0; t < 6 && !(await E(pg, m3)); t++) {   // (the first wage's card may stand over the deal: dismissed, then the extra card)
      await dismiss(pg); await pg.waitForTimeout(350);
      if (!(await pg.$('.gm-deal.on'))) { await pg.click('.gm-pill').catch(() => {}); await pg.waitForTimeout(400); }
      const q = await pg.$('.gm-deal.on .gm-jc.quarry'); if (q) await q.click({ timeout: 1500 }).catch(() => {});
      await wf(pg, m3, null, 1500);
    }
    // ── /flow16 ──
    check('MATCH3 runLevel: the quarry field, need = the shortfall, the 3D paused', await wf(pg, m3, null, 3000), await E(pg, () => JSON.stringify({ m3: __H.world.calls.filter((c) => c.fn === 'm3.runLevel').map((c) => c.args), deal: !!document.querySelector('.gm-deal.on'), modal: !!document.querySelector('.gm-modal.on'), busy: __H.game.busy })));
    check('the level\'s stones reach the meter, the step is paid, MATCH3\'s save slot is kept (G.m3)', await wf(pg, () => __H.game.state.st.wall.paid >= 8 && __H.game.state.st.wall.paid <= 12 && __H.game.state.m3.level && __H.game.state.m3.level.quarry === 2, null, 3000), await E(pg, () => JSON.stringify({ paid: __H.game.state.st.wall.paid, m3: __H.game.state.m3 })));   // (flow16: + his hand stones)
    await pg.click('.gm-pill');
    // (wave 14's course loop: the course opens with "החוט הצבוע" — the line's game — and "מה נעשה עכשיו?" deals the key stone's
    //  card; its tap plays the crane. The first wage's card may come up first: dismissed, as a player would)
    const crane = () => __H.world.calls.some((c) => c.fn === 'fun.runMinigame' && c.args[0] === 'crane' && c.args[1] === 'wall' && c.args[2] === true);
    await wf(pg, () => (__H.world.calls.some((c) => c.fn === 'fun.runMinigame' && c.args[0] === 'crane')) || !!document.querySelector('.gm-deal.on .gm-jc[data-job="key"]'), null, 6000);
    for (let t = 0; t < 14 && !(await E(pg, crane)); t++) {   // (a card — the first wage, the rest — may come up over the deal: dismissed first)
      await dismiss(pg);
      const k = await pg.$('.gm-deal.on .gm-jc[data-job="key"]');
      if (k) await k.click({ timeout: 1500 }).catch(() => {});
      await pg.waitForTimeout(400);
    }
    check('FUN runMinigame("crane") for the first stone, with SITE\'s nextSlot', await wf(pg, crane, null, 3000));
    check('the game\'s quality is the stone\'s', await wf(pg, () => __H.game.state.st.wall.keys[0] === 0.92, null, 3000));
    // the king's offer beside a board for cedar (KINGS' bestFor; FUN P1 'silver has no sink'): the chip, and its tap opens that contract
    await E(pg, () => { const G = __H.game.state, s = G.st.wall; G.res.cedar = 0; s.p = 'finish'; s.set = s.paid = s.n; s.fd = 1; s.fp = 1; s.bad = []; s.chk = s.n; __H.game._.resync(); });
    check('beside a board for cedar, the king\'s offer: "⚓ צור וצידון: 60 ארז ב־5 כסף"', await wf(pg, () => { const c = document.querySelector('.gm-pill-alt'); return !!c && !c.classList.contains('gm-hidden') && /צור וצידון/.test(c.textContent) && /ארז/.test(c.textContent); }, null, 3000));
    await dismiss(pg); await E(pg, () => document.querySelector('.gm-pill-alt').click());   // (a card may be up: dismissed first)
    check('its tap opens that offer\'s contract (openCourt partner + offer)', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'kings.openCourt' && c.args[2] === 'tyre' && c.args[3] === 'tyre_taste'), null, 3000));
    await pg.waitForTimeout(700); await E(pg, () => { __H.game.state.res.cedar = 0; });
    await pg.click('.gm-db[data-k="kings"]');
    check('KINGS openCourt with the needs; apply() adds to the meter', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'kings.openCourt') && __H.world.calls.some((c) => c.fn === 'kings.apply' && c.args[0] === true) && __H.game.state.res.cedar === 40, null, 3000));
    check('the kings\' badge on the dock (status().badge)', await wf(pg, () => { const b = document.querySelector('.gm-db[data-k="kings"] .gm-badge'); return b && !b.classList.contains('gm-hidden') && b.textContent === '1'; }, null, 3000));
    await E(pg, () => { __H.game._.hero.gen++; globalThis.__BH_PARTS.kings._due = [{ id: 'v1' }]; });
    check('KINGS settle() on the tick: a ship arrived → a toast', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'kings.settle') && /הגיע/.test(document.querySelector('.gm-toasts').textContent), null, 8000));
    // the inspection: a badly set key stone is found and reset (time, not material)
    await E(pg, () => {
      const g = __H.game.state, s = g.st.wall; window.__KEY_Q = 0.95;
      s.p = 'inspect'; s.set = s.paid = s.n; s.fd = s.fp = 2; s.keys = { 0: 0.2, 16: 0.9 }; s.insp = 0; s.chk = 0; __H.game._.resync();   // (chk 0: no course check has seen stone 0)
    });
    await dismiss(pg);
    { const m = await E(pg, () => { const x = document.querySelector('.gm-modal.on'); return x ? x.textContent.trim().slice(0, 80) : ''; }); if (m) console.log('   (a card is up: ' + m + ')'); }
    await pg.click('.gm-pill', { timeout: 8000 });
    check('FUN runMinigame("plumb") at the inspection; the crooked stone is found', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'fun.runMinigame' && c.args[0] === 'plumb') && __H.game.state.st.wall.bad.length === 1, null, 3000));
    const res0 = await E(pg, () => JSON.stringify(__H.game.state.res));
    for (let k = 0; k < 6 && !(await E(pg, () => __H.game.state.st.wall.ready)); k++) { await E(pg, () => __H.game.onSiteTap('wall')); await pg.waitForTimeout(700); }
    check('the reset costs strokes, never material; then the key moment is ready', await wf(pg, () => __H.game.state.st.wall.ready || !!document.querySelector('.gm-mo.on'), null, 4000) && res0 === await E(pg, () => JSON.stringify(__H.game.state.res)));
    const bad = logs.filter((l) => !/fonts/.test(l));
    check('parts: no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* ── 1d. flow9: the Mount's corner stone (STAGING M11): "חצוב את אבן הפינה" → the quarry game → the cart and the crane set it ── */
  {
    const { pg, logs } = await page(b, { params: 'fast=1&api12=1&site6=1&parts=1', init: { bh_settings: JSON.stringify({ demo: false }) } });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    await E(pg, () => {
      const g = __H.game.state; g.ftue = 99; __H.game.ui.coach(null, ''); g.bh = g.bh.map(() => 0);
      Object.assign(g.st.har, { p: 'courses', dp: 1, set: 16, paid: 24, keys: { 0: 0.9 }, chk: 16 });   // stone 16: the quarry's corner
      g.crews = [{ at: 'har' }]; __H.game._.resync();
    });
    check('stone 16 on the Mount: the pill says "אבן הפינה: חצוב אותה" (no "הנח")', await wf(pg, () => { const t = document.querySelector('.gm-pill').textContent; return /אבן הפינה: חצוב אותה/.test(t) && !/הנח/.test(t); }, null, 3000), await E(pg, () => document.querySelector('.gm-pill').textContent));
    await E(pg, () => __H.game.ui.openSheet('stage', 'har'));
    check('the site panel\'s button: "חצוב את אבן הפינה"', await wf(pg, () => [...document.querySelectorAll('.gm-sheet.on .gm-big')].some((x) => x.textContent.trim() === 'חצוב את אבן הפינה'), null, 3000));
    await E(pg, () => __H.game.ui.closeSheet());
    await pg.click('.gm-pill');
    check('the quarry game hews it, its kicker "חציבת אבן הפינה" (ctx.kicker)', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'fun.runMinigame' && c.args[0] === 'quarry' && c.args[3] === 'חציבת אבן הפינה'), null, 4000));
    check('then the cart and the crane bring it: world.deliverKeyStone("har", {what: "corner"}) + "אבן הפינה נחצבה"', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'deliverKeyStone' && c.args[0] === 'har' && c.args[1] === 'corner') && /נחצבה/.test(document.querySelector('.gm-toasts').textContent), null, 4000));
    check('"אבן הפינה: במקומה" once it is set, and the site is drawn after the landing', await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'end' && e.d.ok) && /אבן הפינה: במקומה/.test(document.querySelector('.gm-toasts').textContent), null, 6000) && await E(pg, () => { const c = __H.world.calls, d = c.findIndex((x) => x.fn === 'deliverKeyStone'); return d >= 0 && c.slice(d + 1).some((x) => x.fn === 'setWork' && x.args[0] === 'har'); }));
    const bad = logs.filter((l) => !/fonts/.test(l));
    check('corner stone: no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* ── 1c. #demo: the new loop's reel (FUN's DEMO6 beats) with the parts autoplaying, then the key moments ── */
  {
    // (flow8) demo is never persisted any more (BRIEF8B's trap): the demo comes from the link (?demo=1), not bh_settings
    const { pg, logs } = await page(b, { params: 'fast=1&api12=1&site6=1&parts=1&demo=1', init: { bh_settings: JSON.stringify({ demo: true }) } });
    await wf(pg, () => __H.game.state.demo && __H.game.state.ftue >= 1, null, 5000);
    const beats = [];
    for (let k = 0; k < 7; k++) {
      await E(pg, () => __H.game.demoNext());
      await wf(pg, (n) => window.__GAME_LOG.filter((e) => e.type === 'demoBeat').length >= n && !__H.game.busy, k + 1, 6000);
      await pg.waitForTimeout(200); await dismiss(pg); await E(pg, () => __H.game.ui.closeSheet());
      beats.push(await E(pg, () => { const e = window.__GAME_LOG.filter((x) => x.type === 'demoBeat').pop(); return e ? e.d.at + (e.d.kind ? ':' + e.d.kind : '') : '?'; }));
    }
    check('#demo: the reel walks the new loop (a board, a segment, the hands, the kings, the whole stones, the album)', beats.join(',') === 'm3:quarry,build,mg:crane,mg:dress,kings,mg:whole,album', beats.join(','));
    check('#demo: the board autoplays (MATCH3 demo:true) and pays ×5', await E(pg, () => __H.world.calls.some((c) => c.fn === 'm3.runLevel' && c.args[2] === true)));
    check('#demo: the segment\'s stones go up one by one (liftStone)', await E(pg, () => __H.world.calls.filter((c) => c.fn === 'liftStone').length >= 3));
    await E(pg, () => { __H.game.demoNext(); });   // not awaited: a highlight may be a key moment, which waits for the player
    check('#demo: then the key moments\' reel', await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'highlight'), null, 6000));
    await pg.waitForTimeout(400); await shot(pg, 'demo-reel');
    const bad = logs.filter((l) => !/fonts/.test(l));
    check('#demo reel: no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* ── 2. key moments: breaches, red line, boxes ── */
  {
    const { pg, logs } = await page(b, { params: 'fast=1&api12=1', init: { bh_settings: JSON.stringify({ demo: false }) } });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    const prep = (id) => E(pg, (id) => {
      const g = __H.game.state; g.ftue = 99; __H.game.ui.coach(null, '');
      for (const s of ['har', 'wall', 'gates', 'nashim', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'lishka', 'nikanor', 'sorag', 'ulam', 'heichal']) if (s !== id) g.st[s] = { done: true };
      g.st[id] = { w: 999, ph: 3, ready: true }; g.priests = 10;
      __H.game._.resync(); __H.game._.runMoment(id);
    }, id);
    // 13 breaches
    await prep('sorag');
    await pg.waitForSelector('.gm-mo.on .gm-mo-gap');
    const gaps = await pg.$$('.gm-mo-gap');
    for (const g of gaps.slice(0, 6)) await g.dispatchEvent('pointerdown');
    await shot(pg, 'moment-breaches');
    for (const g of gaps.slice(6)) await g.dispatchEvent('pointerdown');
    check('13 breaches: all repaired → the source', await wf(pg, () => !document.querySelector('.gm-mo-end').hidden, null, 3000));
    await pg.click('.gm-mo-go'); await pg.waitForTimeout(300); await dismiss(pg);
    // the red line: drag to the middle
    await prep('sovev');
    await pg.waitForSelector('.gm-mo.on .gm-mo-drag');
    const box = await (await pg.$('.gm-mo-drag')).boundingBox();
    await pg.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3); await pg.mouse.down();
    await pg.mouse.move(box.x + box.width / 2, box.y + box.height * 0.2, { steps: 4 });
    await pg.mouse.up();
    const nudge = await E(pg, () => document.querySelector('.gm-mo-hint').textContent);
    check('red line: too high → a nudge, no failure', /נמוך יותר/.test(nudge), nudge);
    await shot(pg, 'moment-redline');
    const mid = 244 - 5 * ((244 - 54) / 10);
    await pg.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3); await pg.mouse.down();
    await pg.mouse.move(box.x + box.width / 2, box.y + box.height * (mid / 262), { steps: 6 });
    await pg.mouse.up();
    check('red line: dropped in the middle → set (world.redLine called)', await wf(pg, () => !document.querySelector('.gm-mo-end').hidden && __H.world.calls.some((c) => c.fn === 'redLine'), null, 3000));
    await pg.click('.gm-mo-go');
    check('red line: drawn round the altar in 3D once the overlay closes (redLine(0.5))', await wf(pg, () => __H.world.calls.filter((c) => c.fn === 'redLine' && c.args[0] === 0.5).length >= 2, null, 2000));
    await pg.waitForTimeout(300); await dismiss(pg);
    // no iron on the altar: a wooden mallet at the altar's base, iron at the Heichal; the Heichal's last strike
    // makes its gold shine (world.shine) while the camera circles it (world.orbit)
    await E(pg, () => {
      const g = __H.game.state; g.ftue = 99; __H.game.ui.coach(null, '');
      for (const s of ['har', 'wall', 'gates', 'nashim', 'sovev', 'guf', 'karnot', 'kiyor', 'lishka', 'nikanor', 'sorag', 'ulam']) g.st[s] = { done: true };
      g.st.yesod = { p: 'courses', n: 32, dp: 1, paid: 8, set: 1, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], insp: 0, w: 0, ph: 2 }; g.priests = 10;
      g.st.heichal = { p: 'inspect', n: 280, dp: 1, paid: 280, set: 280, k: 2, fp: 6, fd: 6, keys: { 0: 0.3 }, ev: {}, bad: [0], insp: 1, m: true, w: 0, ph: 3 };   // (v6: one reset stroke left; m: its key moment already played, test/moments.cjs)
      __H.game._.resync(); __H.game.onSiteTap('yesod');
    });
    await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'strike' && /^yesod/.test(e.d.job)), null, 4000);
    await wf(pg, () => !__H.game._.hero.busy, null, 4000);
    await E(pg, () => __H.game.onSiteTap('heichal'));
    check('the Heichal finished by a strike: world.shine and world.orbit', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'shine') && __H.world.calls.some((c) => c.fn === 'orbit' && c.args[0] === 'heichal'), null, 6000));
    const tools = await E(pg, () => __H.world.calls.filter((c) => c.fn === 'hero.setTool').map((c) => c.args[0]).join(','));
    check('no iron on the altar: hero.setTool("wood") at the altar, "iron" at the Heichal', /wood,iron$/.test(tools), tools);
    await pg.waitForTimeout(300); await dismiss(pg);
    // the boxes: hold to lower; the interior is never drawn
    await prep('kodesh');
    await pg.waitForSelector('.gm-mo.on .gm-mo-hold');
    await pg.dispatchEvent('.gm-mo-hold', 'pointerdown');
    await pg.waitForTimeout(700);
    await shot(pg, 'moment-boxes');
    const lowered = await E(pg, async () => {
      const btn = document.querySelector('.gm-mo-hold');
      for (let k = 0; k < 20; k++) {
        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
        await new Promise((r) => setTimeout(r, 1000));
        btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 800));
        if (!document.querySelector('.gm-mo-end').hidden) return true;
      }
      return false;
    });
    check('boxes: lowering in steady steps reaches the bottom (world.boxes called)', lowered && await E(pg, () => __H.world.calls.some((c) => c.fn === 'boxes')));
    await pg.click('.gm-mo-go');
    check('kodesh completes quietly (no celebrate, no fanfare card kick)', await wf(pg, () => __H.game.state.st.kodesh.done && !__H.world.calls.some((c) => c.fn === 'celebrate' && c.args[0] === 'kodesh'), null, 3000));
    await pg.waitForTimeout(1200);
    await shot(pg, 'kodesh-done');
    await dismiss(pg);
    check('the finale: חנוכת הבית (Bava Batra 4a)', await wf(pg, () => __H.game.state.celeb === true, null, 4000));
    const bad = logs.filter((l) => !/fonts/.test(l));
    check('moments: no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await pg.context().close();
  }

  /* ── 3. demo mode isolation, storage blocked, a broken world, dark theme, desktop ── */
  {
    const { pg } = await page(b, { params: 'fast=1', init: { bh_beta2: JSON.stringify({ v: 4, res: { s: 400 }, b: { har: { done: true }, wall: { done: true } }, daily: { last: '2026-01-01', streak: 2 } }) } });
    const mig = await E(pg, () => ({ v: __H.game.state.v, wall: __H.game.state.st.wall, ftue: __H.game.state.ftue }));
    check('a 2D (v4) save loads as v6 with its progress; no tutorial', mig.v === 6 && mig.wall && mig.wall.done && mig.ftue === 99, JSON.stringify(mig));
    await dismiss(pg);
    await E(pg, () => { __H.game.ui.openSheet('menu'); });
    await pg.click('.gm-sheet.on [data-a="demo"]');
    const before = await E(pg, () => localStorage.getItem('bh_beta2'));          // the real game, saved on the way out
    const demo = await E(pg, () => ({ demo: __H.game.state.demo, stone: __H.game.state.res.cedar, badge: !document.querySelector('.gm-demo').classList.contains('gm-hidden') }));
    check('demo mode: its own game, generous stock, labeled on screen', demo.demo && demo.stone >= 1000 && demo.badge, JSON.stringify(demo));
    await pg.waitForTimeout(600);
    await shot(pg, 'demo');
    await E(pg, () => { __H.game.state.ftue = 99; __H.game.ui.coach(null, ''); });
    // (supervisor, 30.9: the owner tests every stage by hand) the strip's "שלבים ▾" opens the picker; its gold "לשלב הבא" builds
    // the Mount and starts the wall at its start; a chosen stage starts with every stage before it built
    await pg.click('.gm-demo [data-a="pickStage"]');
    await wf(pg, () => !!document.querySelector('.gm-modal.on .gm-card.gm-pick'), null, 3000);
    const pick = await E(pg, () => [...document.querySelectorAll('.gm-modal.on .gm-btn')].map((b) => b.textContent.trim()));
    check('"שלבים ▾" lists the next stage first, then all 15 stages', pick.length === 17 && /לשלב הבא/.test(pick[0]) && /חומת העזרה/.test(pick[0]), pick.slice(0, 3).join(' | '));
    await pg.click('.gm-modal.on .gm-btn-gold');
    check('"לשלב הבא" builds the Mount and starts the wall at its start', await wf(pg, () => { const G = __H.game.state; return G.st.har && G.st.har.done && !(G.st.wall && G.st.wall.done) && G.focus === 'wall'; }, null, 4000));
    await E(pg, () => __H.game.jumpTo('guf'));
    check('a stage picked in the demo starts at its start with every stage before it built', await E(pg, () => { const G = __H.game.state, ids = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev']; return G.demo && ids.every((k) => G.st[k] && G.st[k].done) && !(G.st.guf && G.st.guf.done) && G.focus === 'guf' && G.ftue === 99; }));
    await pg.waitForTimeout(600);
    await dismiss(pg);
    const after = await E(pg, () => ({ real: localStorage.getItem('bh_beta2'), demo: !!localStorage.getItem('bh_demo') }));
    check('demo mode never writes the real save', after.real === before && after.demo);
    await E(pg, () => { __H.game.ui.openSheet('menu'); });
    await pg.click('.gm-sheet.on [data-a="demo"]');
    check('leaving demo mode brings back the real game', await wf(pg, () => !__H.game.state.demo && __H.game.state.st.wall && __H.game.state.st.wall.done));
    // ── flow8 ── the demo trap (BRIEF8B): the flag is never written; the exit chip, by a real tap, brings the real game back
    check('demo is never persisted (bh_settings has no demo)', await E(pg, () => !('demo' in JSON.parse(localStorage.getItem('bh_settings') || '{}'))));
    await E(pg, () => { __H.game.ui.openSheet('menu'); });
    await pg.click('.gm-sheet.on [data-a="demo"]');
    const chip = await E(pg, () => { const b = document.querySelector('.gm-demo [data-a="demoExit"]'); const r = b && b.getBoundingClientRect(); return b && __H.game.state.demo && !document.querySelector('.gm-demo').classList.contains('gm-hidden') ? { x: r.left + r.width / 2, y: r.top + r.height / 2, t: b.textContent, h: r.height } : null; });
    check('while the demo is on, the exit chip "יציאה ממצב הדגמה" is on screen', !!chip && /יציאה ממצב הדגמה/.test(chip.t) && chip.y > 0 && chip.y < 844, JSON.stringify(chip));
    if (chip) { await E(pg, () => __H.game.ui.closeSheet()); await pg.touchscreen.tap(chip.x, chip.y); }
    check('a tap on the exit chip brings back the real game', await wf(pg, () => !__H.game.state.demo && __H.game.state.st.wall && __H.game.state.st.wall.done && document.querySelector('.gm-demo').classList.contains('gm-hidden'), null, 4000));
    await pg.context().close();
  }
  {
    // ── flow8 ── a phone that v16 left in the demo (bh_settings {demo:true}) opens the regular game, and the flag is healed
    const { pg } = await page(b, { params: 'fast=1', init: { bh_settings: JSON.stringify({ demo: true, rhythm: true }) } });
    const st = await E(pg, () => ({ demo: __H.game.state.demo, s: JSON.parse(localStorage.getItem('bh_settings') || '{}') }));
    check('the trap healed: a stored demo flag opens the regular game and is removed', st.demo === false && !('demo' in st.s) && st.s.rhythm === true, JSON.stringify(st));
    await pg.context().close();
  }
  {
    // night (after the tutorial): rain in the world, and the Ta'anit 23a story waits until nothing is open.
    // (wave 12) it rains on SOME nights by the Hebrew date: 24.11.2026 (15 Kislev) is a wet one (src/weather.js)
    const { pg } = await page(b, { params: 'fast=1&api12=1&tod=night', date: '2026-11-24', init: { bh_beta2: JSON.stringify({ v: 4, res: { s: 400 }, b: { har: { done: true } } }) } });
    check('night: it rains on the building site (world.rain(true))', await wf(pg, () => __H.world.calls.some((c) => c.fn === 'rain' && c.args[0] === true), null, 3000));
    await E(pg, () => __H.game.ui.openSheet('daily'));           // a sheet is open before the welcome card goes away
    await dismiss(pg);
    await pg.waitForTimeout(2200);
    const early = await E(pg, () => /גשם/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''));
    await E(pg, () => __H.game.ui.closeSheet());
    check('night: the rain story waits for a calm moment, then is told once', !early && await wf(pg, () => /גשם רק בלילה/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 4000), early ? 'shown over an open sheet' : '');
    await pg.context().close();
  }
  {
    // (wave 12, the owner 29.9: "לא כל לילה ירד גשם") a night in Sukkot (29.9.2026, 18 Tishrei) is dry: no rain call with true
    const { pg } = await page(b, { params: 'fast=1&api12=1&tod=night', date: '2026-09-29', init: { bh_beta2: JSON.stringify({ v: 4, res: { s: 400 }, b: { har: { done: true } } }) } });
    await pg.waitForTimeout(2500);
    check('night in Sukkot: no rain (the season, src/weather.js)', await E(pg, () => !__H.world.calls.some((c) => c.fn === 'rain' && c.args[0] === true)));
    await pg.context().close();
  }
  {
    const { pg, logs } = await page(b, { params: 'fast=1', storage: 'blocked' });
    await pg.waitForTimeout(600);
    const ok = await E(pg, () => { __H.game.onBoulderTap(4); return true; });
    check('localStorage blocked (sandboxed iframe): the game still runs', ok && await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'strike'), null, 6000));
    const bad = logs.filter((l) => /PAGEERR/.test(l));
    check('localStorage blocked: no uncaught errors', !bad.length, bad.join(' | '));
    await pg.context().close();
  }
  {
    const { pg } = await page(b, { params: 'fast=1&broken=1' });
    await pg.waitForTimeout(600);
    await E(pg, () => { __H.game.onBoulderTap(4); });
    check('a broken world (throws, rejects, hangs): strikes still land', await wf(pg, () => window.__GAME_LOG.some((e) => e.type === 'strike'), null, 12000));
    await pg.context().close();
  }
  {
    const { pg } = await page(b, { params: 'fast=1&theme=dark' });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    await E(pg, () => __H.game.ui.openSheet('stage', 'har'));
    await pg.waitForTimeout(300);
    await shot(pg, 'dark');
    await pg.context().close();
  }
  {
    const { pg } = await page(b, { W: 1280, H: 800, touch: false, params: 'fast=1' });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    await E(pg, () => { const g = __H.game.state; g.ftue = 99; __H.game.ui.coach(null, ''); g.st.har = { done: true }; g.crews = [{ at: 'quarry' }, { at: 'quarry' }]; g.routes.push('wagons', 'cedar'); __H.game._.resync(); __H.game.ui.openSheet('stage', 'wall'); });
    await pg.waitForTimeout(300);
    await shot(pg, 'desktop');
    await pg.context().close();
  }
  /* ── build7: the opening (the vision of the finished House, then down to the Mount; a tap skips; once per new game) ── */
  {
    const { pg, logs } = await page(b, { params: 'fast=1&open7=1&api12=1', storage: 'keep' });   // (a new context: empty storage; kept over the reload)
    const firstVision = await wf(pg, () => __H.world.calls.some((c) => c.fn === 'vision'), null, 4000);
    const before = await E(pg, () => { const c = __H.world.calls, v = c.findIndex((x) => x.fn === 'vision'); return { stagesBefore: c.slice(0, v).filter((x) => x.fn === 'setStage').length, cine: !document.querySelector('.gm-cine').classList.contains('gm-hidden'), hud: getComputedStyle(document.querySelector('.gm-goal')).opacity, to: c[v] && c[v].args[1] }; });
    check('opening: a new game shows the vision first (no Mount before the swap; the HUD steps aside; a skip layer)', firstVision && before.stagesBefore === 0 && before.cine && before.hud === '0' && before.to, JSON.stringify(before));
    const landed = await wf(pg, () => __H.game.state.ftue >= 1, null, 9000);
    const after = await E(pg, () => { const c = __H.world.calls, s = c.findIndex((x) => x.fn === 'vision.swap'); return { swapThenMount: s >= 0 && c.slice(s).some((x) => x.fn === 'setStage' && x.args[0] === 'har' && x.args[1] === 'building') && c.slice(s).some((x) => x.fn === 'setBoulders'), cineOff: document.querySelector('.gm-cine').classList.contains('gm-hidden'), op: __H.game.state.op, ev: window.__GAME_LOG.filter((e) => e.type === 'opening').map((e) => e.d.at).join(',') }; });
    check('opening: the swap sets up the rough Mount, then the FTUE goes on; played once (G.op)', landed && after.swapThenMount && after.cineOff && after.op === 1 && after.ev === 'start,end', JSON.stringify(after));
    await pg.reload();
    await pg.waitForFunction(() => window.__H && window.__H.game, null, { timeout: 15000 });
    await pg.waitForTimeout(700);
    check('opening: a reload never replays it', await E(pg, () => !__H.world.calls.some((c) => c.fn === 'vision')));
    const bad = logs.filter((l) => /PAGEERR/.test(l));
    check('opening: no uncaught errors', !bad.length, bad.join(' | '));
    await pg.context().close();
  }
  {
    const { pg } = await page(b, { params: 'open7=1&api12=1' });   // (real timings: 6 s)
    await wf(pg, () => __H.world.calls.some((c) => c.fn === 'vision'), null, 4000);
    await pg.waitForTimeout(500);
    await pg.click('.gm-cine');
    const t0 = Date.now();
    const skipped = await wf(pg, () => __H.world.calls.some((c) => c.fn === 'visionSkip') && __H.game.state.op === 1, null, 3000);
    const ms = Date.now() - t0;
    const once = await E(pg, () => __H.world.calls.filter((c) => c.fn === 'setBoulders').length);
    check('opening: a tap skips it at once (restore exactly once)', skipped && ms < 1500 && once === 1, `${ms} ms · setBoulders ×${once}`);
    check('opening: after a skip the FTUE starts', await wf(pg, () => __H.game.state.ftue >= 1, null, 8000));
    await pg.context().close();
  }
  {
    // build7: the crews keep setting stones while a board is open — the board's stones reach the meter as gathered, the segment is
    // paid while it is open; a 3★ board pays a third segment; nothing is granted twice
    const { pg } = await page(b, { params: 'fast=1&parts=1&api12=1&site6=1' });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    const r = await E(pg, async () => {
      const g = __H.game.state, sleep = (ms) => new Promise((z) => setTimeout(z, ms));
      g.ftue = 99; __H.game.ui.coach(null, '');
      const s = g.st.har; s.p = 'courses'; s.dp = 1; g.bh = g.bh.map(() => 0); s.paid = 16; s.set = 16; for (let i = 0; i < 16; i++) s.keys[i] = s.keys[i] == null ? 0.9 : s.keys[i];
      g.res.stone = 5; g.focus = 'har'; __H.game._.resync();
      window.__M3_LIVE = true; window.__M3_STARS = 3; window.__M3_MS = 1500; window.__M3_EXTRA = 30;
      const a = __H.game._.playFor ? __H.game._.playFor('har') : null;
      const p0 = s.paid, st0 = g.res.stone;
      // (── flow16 ── the balance: the pill is the deal now — the key stone's card at stone 16; the board opens from the deal's extra card
      //  "▶ הביאו אבנים", which calls playLevel(playFor(id)) — called here as that card does)
      if (a) __H.game._.playLevel(a); else document.querySelector('.gm-pill').click();
      await sleep(700);
      const paidLive = g.st.har.paid - p0;
      await sleep(2600);
      const after = g.st.har.paid - p0;
      window.__M3_LIVE = false; window.__M3_STARS = 0; window.__M3_MS = 0; window.__M3_EXTRA = null;
      const log = window.__GAME_LOG.filter((e) => e.type === 'm3Won').pop();
      return { paidLive, after, got: log && log.d.collected, st0, stoneNow: Math.round(g.res.stone), toast: [...document.querySelectorAll('.gm-toast')].map((t) => t.textContent).join(' | ') };
    });
    const segCost = 12, need = 7, got = need + 30, bonus = 12;
    const expected = 5 + got + bonus - r.after / 8 * segCost;
    check('board live: the segment is paid while the board is open; a 3★ board pays a third segment; nothing twice', r.paidLive >= 8 && r.after >= 24 && Math.abs(r.stoneNow - expected) <= 0.5, JSON.stringify(r) + ' · expected stone ' + expected);
    await pg.context().close();
  }
  {
    // build7 (FUN7 P0): a bronze need leads with the king who brings it; the gold board is the second chip
    const { pg } = await page(b, { params: 'fast=1&parts=1&api12=1&site6=1' });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    const r = await E(pg, async () => {
      const g = __H.game.state, sleep = (ms) => new Promise((z) => setTimeout(z, ms));
      window.__KB_BRONZE = true; g.ftue = 99; __H.game.ui.coach(null, '');
      for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag']) g.st[id] = { done: true };
      g.res.silver = 5000; g.priests = 20;
      __H.game._.doAction({ kind: 'start', id: 'nikanor' });
      await sleep(200);
      const s = g.st.nikanor; if (!s) return { err: 'no nikanor site' };
      s.p = 'finish'; s.set = s.n; s.paid = s.n; s.fd = 0; s.fp = 0; g.focus = 'nikanor'; g.res.bronze = 0; g.res.silver = 500;
      __H.game._.resync(); await sleep(300);
      const pill = document.querySelector('.gm-pill').textContent, alt = document.querySelector('.gm-pill-alt');
      const out = { pill, alt: alt && !alt.classList.contains('gm-hidden') ? alt.textContent + '|' + alt.dataset.a : 'hidden' };
      document.querySelector('.gm-pill').click(); await sleep(400);
      const k = __H.world.calls.filter((c) => c.fn === 'kings.openCourt').pop();
      out.court = k ? k.args.slice(2).join(',') : null;
      window.__KB_BRONZE = false;
      return out;
    });
    check('deal: a bronze need leads with the king (⚓ ניקנור · 150 נחושת), the gold board is the second chip; a tap opens that contract', /⚓/.test(r.pill) && /נחושת/.test(r.pill) && /\|play$/.test(r.alt) && r.court === 'nikanor,nik_doors', JSON.stringify(r));
    await pg.context().close();
  }
  {
    // build7: one toast at a time, ≥ 1.5 s apart; all wait under a precision game (.fx-mg) and come one by one after it
    const { pg } = await page(b, { params: 'fast=1' });
    await wf(pg, () => __H.game.state.ftue >= 1, null, 5000);
    const r = await E(pg, async () => {
      const ui = __H.game.ui, sleep = (ms) => new Promise((z) => setTimeout(z, ms)), on = () => document.querySelectorAll('.gm-toast.on').length;
      const seen = []; let maxOn = 0, last = '';
      const watch = setInterval(() => { maxOn = Math.max(maxOn, on()); const t = document.querySelector('.gm-toast.on b'); if (t && last !== t.textContent) { last = t.textContent; seen.push(last, Math.round(performance.now())); } }, 50);
      ui.toast({ title: 'א', kind: 'mini', ms: 2200 }); ui.toast({ title: 'ב', kind: 'mini' }); ui.toast({ title: 'ג' });
      await sleep(4000);
      const mg = document.createElement('div'); mg.className = 'fx-mg'; document.body.appendChild(mg);
      ui.toast({ title: 'ד', kind: 'mini' }); await sleep(1200); const held = on() === 0 || !/ד/.test(document.querySelector('.gm-toast.on') ? document.querySelector('.gm-toast.on').textContent : '');
      mg.remove(); await sleep(900);
      clearInterval(watch);
      const names = seen.filter((x, i) => i % 2 === 0), at = seen.filter((x, i) => i % 2 === 1), gaps = at.slice(1).map((t, i) => t - at[i]);
      return { names: names.join(''), gaps, maxOn, held };
    });
    check('toasts: one at a time, ≥ 1.5 s apart, held under a precision game', r.names === 'אבגד' && r.maxOn <= 1 && r.gaps.slice(0, 2).every((g) => g >= 1450) && r.held, JSON.stringify(r));
    await pg.context().close();
  }
  /* ── 4. (v5's engagement layer — the caravans' strip, first trips, the rest card — retired with the caravans in v6; FUN's
     new loop hooks are tested in test/hooks*.test.mjs and wired in section 1b) ── */
  await b.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, 'game-harness.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
