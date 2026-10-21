// KINGS DOM harness: the chart, a court, the contract, the arrival beat, a court's letters — phone portrait 390×844, no 3D.
//   node test/kings.cjs            build test/out/kings.bundle.js, run the flows, screenshot test/out/kings-*.png
//   node test/kings.cjs --build    only build the bundle
// One browser, always closed. Fonts: Google fonts are stubbed (no network); the page falls back to system fonts.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });

const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'kings-entry.js')], bundle: true, format: 'iife', target: 'es2020', charset: 'utf8', outfile: path.join(OUT, 'kings.bundle.js'), logLevel: 'warning' });
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const url = 'file://' + path.join(__dirname, 'kings.html');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
    const pg = await ctx.newPage();
    const errors = [];
    pg.on('pageerror', (e) => errors.push(String(e)));
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_/.test(m.text())) errors.push(m.text()); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const shot = async (name) => { const f = path.join(OUT, `kings-${name}.png`); await pg.screenshot({ path: f }); return f; };
    const tap = async (sel) => { await pg.locator(sel).first().click(); await pg.waitForTimeout(350); };

    // 0. a new player: nothing at sea, the first raft of cedar flagged on the Tyre court
    await pg.goto(url); await pg.evaluate(() => KH.open('fresh')); await pg.waitForTimeout(400);
    const f = await pg.evaluate(() => ({ hot: document.querySelector('.krow.khot') ? document.querySelector('.krow.khot').dataset.p : null, vessels: document.querySelectorAll('.kv').length }));
    check('a new player: no vessels, the Tyre court flagged with the first raft', f.hot === 'tyre' && f.vessels === 0, JSON.stringify(f));
    console.log('shot', await shot('fresh'));
    // 0a. (wave 7, FUN) the first deal as a small story: the messenger, the merchant's lines, Ezra 3:7, then the contract
    const st0 = await pg.evaluate(() => ({ story: !!document.querySelector('.kstory'), lines: document.querySelectorAll('.kstory .ksay p').length, tag: /המחשה/.test((document.querySelector('.kstory') || {}).textContent || '') }));
    check('first visit: the story opens (a messenger from Jaffa, the merchant\'s two lines, המחשה)', st0.story && st0.lines === 2 && st0.tag, JSON.stringify(st0));
    await pg.waitForTimeout(1900); console.log('shot', await shot('story-1'));
    await tap('[data-a="story"]');
    const st1 = await pg.evaluate(() => ((document.querySelector('.kstory') || {}).textContent || ''));
    check('story beat 2: what Ezra tells (עזרא ג, ז)', /עזרא ג, ז/.test(st1));
    console.log('shot', await shot('story-2'));
    await tap('[data-a="story"]');
    const st2 = await pg.evaluate(() => ({ contract: !!document.querySelector('.kpaper [data-a="sign"][data-o="tyre_taste"]'), court: !!document.querySelector('.ksheet.kopen') }));
    check('story beat 3: the taste raft\'s contract over Tyre\'s court', st2.contract && st2.court, JSON.stringify(st2));
    await tap('[data-a="sign"]'); await pg.waitForTimeout(900);
    const st3 = await pg.evaluate(() => ({ voy: __G.kings.voy.length, story: __G.kings.story }));
    check('signed: the raft sails; the story is told once', st3.voy === 1 && st3.story === 1, JSON.stringify(st3));
    // 0b. the host's meter refuses the payment (apply → false): the contract says so, nothing sets out
    await pg.goto(url); await pg.evaluate(() => KH.open('fresh', { apply: () => false, partner: 'tyre' })); await pg.waitForTimeout(400);
    await tap('[data-a="offer"][data-o="tyre_taste"]'); await tap('[data-a="sign"]');
    const ref = await pg.evaluate(() => ({ note: (document.querySelector('.kmodal') || {}).textContent || '', voy: __G.kings.voy.length }));
    check('a refused payment: "אין מספיק כסף", no voyage', ref.note.includes('אין מספיק כסף') && ref.voy === 0, JSON.stringify({ voy: ref.voy }));

    // 1. the chart with five voyages (sea, sea to Rome, the caravan, after the storm, an arrived gift)
    await pg.goto(url); await pg.evaluate(() => KH.open('map')); await pg.waitForTimeout(400);
    const m = await pg.evaluate(() => ({
      rows: document.querySelectorAll('.krow').length, pins: document.querySelectorAll('.kpin').length,
      vessels: document.querySelectorAll('.kv').length, news: !!document.querySelector('[data-a="news"]'),
      hot: document.querySelectorAll('.krow.khot').length, scrollW: document.documentElement.scrollWidth,
    }));
    check('chart: 5 courts, 5 pins, 5 vessels, the storm news, an arrival', m.rows === 5 && m.pins === 5 && m.vessels === 5 && m.news && m.hot >= 1, JSON.stringify(m));
    check('no horizontal scroll at 390', m.scrollW <= 390, 'scrollWidth ' + m.scrollW);
    console.log('shot', await shot('map'));
    await pg.evaluate(() => document.querySelector('.kbody').scrollTo(0, 400)); await pg.waitForTimeout(100);
    console.log('shot', await shot('map-list'));

    // 1b. the ship docks at Jaffa while you watch: a sound and a line, the carts set out
    await pg.evaluate(() => document.querySelector('.kbody').scrollTo(0, 0));
    await pg.evaluate(() => __setNow(KH.T + 13 * 60000)); await pg.waitForTimeout(1300);
    const port = await pg.evaluate(() => ({ line: document.querySelector('[data-z="list"]').textContent.includes('בעגלות מיפו'), cart: __SFX.includes('cart') }));
    check('docked at Jaffa: the row says "בעגלות מיפו", the cart sound', port.line && port.cart, JSON.stringify(port));
    await pg.evaluate(() => __setNow(KH.T)); await pg.waitForTimeout(1200);

    // 2. the storm story (told in advance, always the same ending)
    await tap('[data-a="news"]');
    const story = await pg.evaluate(() => document.querySelector('.kmodal').textContent.includes('ניקנור'));
    check('the storm story opens from the news line', story);
    console.log('shot', await shot('storm'));
    await tap('.kmodal [data-a="cancel"]');

    // 3. the arrival beat: the Adiabene gift → unload → gold, relationship, the seal, a letter
    await tap('.krow[data-a="arrival"]');
    console.log('shot', await shot('arrival'));
    const gold0 = await pg.evaluate(() => __G.res.gold);
    await tap('[data-a="unload"]'); await pg.waitForTimeout(500);
    const u = await pg.evaluate(() => ({ gold: __G.res.gold, seal: !!__G.kings.seals.adiabene, ev: __EV.map((e) => e[0]), sfx: __SFX.slice() }));
    check('unload: +40 gold into the meter, the seal, events', u.gold === gold0 + 40 && u.seal && u.ev.includes('delivery') && u.ev.includes('kingsSeal'), JSON.stringify(u.ev));
    check('sounds: court/arrive/coinsIn through ctx.sfx', u.sfx.includes('arrive') && u.sfx.includes('coinsIn'), u.sfx.join(','));
    console.log('shot', await shot('arrival-done'));
    await tap('[data-a="next"]');

    // 4. a court keeps its letters (re-read any time): the storm story in Nikanor's court; the Adiabene row now shows its seal
    const sealed = await pg.evaluate(() => !!document.querySelector('.krow[data-p="adiabene"] .kseal svg path[fill="#9E2B25"]'));
    await tap('.krow[data-p="nikanor"]'); await pg.waitForTimeout(350);
    const lt = await pg.evaluate(() => ({ letters: document.querySelectorAll('.ksheet .kletter').length, story: document.querySelector('.ksheet').textContent.includes('נחשול') }));
    check('letters live in their court (the storm in Nikanor\'s); the earned seal on the chart row', lt.letters >= 1 && lt.story && sealed, JSON.stringify({ ...lt, sealed }));
    console.log('shot', await shot('letters'));
    await tap('.ksheet [data-a="back"]');
    await pg.evaluate(() => document.querySelector('[data-a="close"]').click()); await pg.waitForTimeout(200);
    const res1 = await pg.evaluate(() => window.__result);
    check('close resolves {deals, unloaded}', res1 && res1.unloaded === 1, JSON.stringify(res1));

    // 5. a court (Tyre, free, level 1, cedar needed now) → the contract → sign → the ship sets out
    await pg.goto(url); await pg.evaluate(() => KH.open('court', { partner: 'tyre', needs: { cedar: 60 } })); await pg.waitForTimeout(500);
    const c = await pg.evaluate(() => ({ offers: document.querySelectorAll('.ksheet .koffer').length, ok: document.querySelectorAll('.ksheet [data-a="offer"]').length, now: !!document.querySelector('.ksheet .know'), draft: !!document.querySelector('.ksay .kdraft') }));
    check('court: offers with real choices, "needed now", dialogue marked המחשה · טיוטה', c.offers >= 3 && c.ok >= 3 && c.now && c.draft, JSON.stringify(c));
    console.log('shot', await shot('court'));
    await pg.evaluate(() => document.querySelector('.ksheet .kbody').scrollTo(0, 330)); await pg.waitForTimeout(100);
    console.log('shot', await shot('court-offers'));
    await tap('[data-a="offer"][data-o="tyre_bulk"]');
    console.log('shot', await shot('contract'));
    const s0 = await pg.evaluate(() => __G.res.silver);
    await tap('[data-a="sign"]'); await pg.waitForTimeout(1100);
    const d = await pg.evaluate(() => ({ silver: __G.res.silver, voy: __G.kings.voy.filter((v) => v.o === 'tyre_bulk').length, ev: __EV.filter((e) => e[0] === 'deal').length, sheet: document.querySelector('.ksheet').classList.contains('kopen') }));
    check('sign: silver paid, the voyage set out, deal event, back on the chart', d.silver === s0 - 40 && d.voy === 1 && d.ev === 1 && !d.sheet, JSON.stringify(d));
    console.log('shot', await shot('after-deal'));

    // 5b. Petra's court while its caravan is on the road: the voyage card with its time; Escape backs out
    await tap('.krow[data-p="petra"]');
    const g0 = await pg.evaluate(() => ({ card: !!document.querySelector('.kvoy [data-end]'), illus: !!document.querySelector('.kwho .killus') }));
    check('Petra: the caravan on the road (a timed card), the court flagged ⚑ המחשה', g0.card && g0.illus, JSON.stringify(g0));
    console.log('shot', await shot('petra-court'));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(350);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    check('Escape: court → chart → closed', await pg.evaluate(() => !document.querySelector('.kg') && !!window.__result));

    // 6. dark theme + Shabbat (no new deals; the chart still moves)
    await pg.emulateMedia({ colorScheme: 'dark' });
    await pg.goto(url); await pg.evaluate(() => KH.open('map', { rest: true })); await pg.waitForTimeout(400);
    const sh = await pg.evaluate(() => document.querySelector('[data-z="banners"]').textContent.includes('שבת'));
    check('Shabbat banner; arrivals wait', sh);
    check('dark theme follows the system (.kdk)', await pg.evaluate(() => document.querySelector('.kg').classList.contains('kdk')));
    console.log('shot', await shot('dark-shabbat'));

    // 6b. BUILD's shortage chip opens an offer's contract directly (ctx.partner + ctx.offer)
    await pg.goto(url); await pg.evaluate(() => KH.open('fresh', { partner: 'tyre', offer: 'tyre_raft' })); await pg.waitForTimeout(400);
    const ch = await pg.evaluate(() => ({ sign: (document.querySelector('.kmodal [data-a="sign"]') || {}).dataset, court: document.querySelector('.ksheet').classList.contains('kopen') }));
    check('ctx.offer: the chip opens the offer\'s contract in its court', ch.sign && ch.sign.o === 'tyre_raft' && ch.court, JSON.stringify(ch));
    // 7. #demo: the loop plays itself (a real clock, ×60): Tyre's court, the contract, the seal, the taste raft (3 s), the arrival, the unload, then it closes
    await pg.goto(url); await pg.evaluate(() => KH.open('fresh', { demo: true, now: () => Date.now() })); await pg.waitForTimeout(15500);
    const dm = await pg.evaluate(() => ({ r: window.__result, cedar: __G.res.cedar, open: !!document.querySelector('.kg') }));
    check('#demo: the loop plays itself and closes (a deal, a delivery into the meter)', dm.r && dm.r.deals === 1 && dm.r.unloaded === 1 && dm.cedar === 60 && !dm.open, JSON.stringify(dm));
    check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - bad}/${results.length} passed`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
