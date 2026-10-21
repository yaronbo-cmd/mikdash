// The memory tile-flip DOM harness: the real overlay on a phone held sideways (844×390, dpr 1, touch) and upright (390×844),
// no 3D world, ONE browser, closed. Run it only through the serializing runner:
//   /home/claude/wt/bus/brun node test/tiles.cjs            build test/out/tiles.bundle.js, play, save shots, print PASS/FAIL
//   node test/tiles.cjs --build                              only build the bundle
// Shots: test/out/tiles-start.png · -board.png · -flip.png · -match.png · -miss.png · -hint.png · -streak.png · -won.png ·
//        -l2.png · -l4.png · -lost.png · -exit.png · -portrait.png · -portrait-l1.png · -art.png
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'tiles-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'tiles.bundle.js'), logLevel: 'warning', charset: 'utf8' });
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const PAGE = 'file://' + path.join(__dirname, 'tiles.html');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = (n) => pg.screenshot({ path: path.join(OUT, `tiles-${n}.png`) });
    const cardText = () => pg.evaluate(() => { const c = document.querySelector('.tl-card'); return c ? c.innerText : ''; });
    const click = (txt) => pg.evaluate((t) => { const b = [...document.querySelectorAll('.tl-card button')].find((x) => x.textContent.includes(t)); if (b) b.click(); return !!b; }, txt);
    const tapTile = async (i) => { const t = await pg.$(`.tl-tile[data-i="${i}"]`); await t.tap(); };
    const state = () => pg.evaluate(() => { const s = __TL_TEST.s(); return { matches: s.matches, misses: s.misses, streak: s.streak, perutot: s.perutot, hints: s.hints, undos: s.undos, won: s.won, open: s.open, pending: s.pending }; });
    const start = (opts) => pg.evaluate((o) => { window.__save = o.save || {}; window.__res = null; TL.runTiles(Object.assign({ sfx: window.__sfx, test: true, save: window.__save, onEvent: (t, d) => window.__tllog.push('ev:' + t) }, o)).then((r) => { window.__res = r; }); }, opts);

    // ── level 1, sideways: the start card, the board, a flip, a match, a miss, a hint, a streak, the win ──
    await pg.goto(PAGE);
    await start({ level: 1, seed: 7 });
    await pg.waitForSelector('.tl-card');
    await pg.waitForTimeout(400);
    await shot('start');
    check('start card: level and pairs', /שלב 1/.test(await cardText()) && /6 זוגות/.test(await cardText()));
    await click('התחל');
    await pg.waitForTimeout(500);
    await shot('board');
    const tiles = await pg.$$('.tl-tile');
    check('board: 12 face-down tiles', tiles.length === 12 && (await pg.$$('.tl-tile.up')).length === 0);
    const box = await tiles[0].boundingBox();
    check('tiles: ≥ 44 px targets', box.width >= 44 && box.height >= 44, `${Math.round(box.width)}×${Math.round(box.height)}`);
    const fs0 = await pg.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.tl-name')).fontSize));
    check('tiles: the name ≥ 11 px', fs0 >= 11, `${fs0}px`);
    // one flip
    const pair = await pg.evaluate(() => __TL_TEST.pair());
    await tapTile(pair[0]);
    await pg.waitForTimeout(300);
    await shot('flip');
    check('flip: one tile up', (await state()).open.length === 1);
    // the match
    await tapTile(pair[1]);
    await pg.waitForTimeout(560);
    await shot('match');
    let st = await state();
    check('match: a pair, +2 פרוטות', st.matches === 1 && st.perutot === 2 && (await pg.$$('.tl-tile.done')).length === 2);
    // a miss
    const mp = await pg.evaluate(() => __TL_TEST.missPair());
    await tapTile(mp[0]); await tapTile(mp[1]);
    await pg.waitForTimeout(760);
    await shot('miss');
    st = await state();
    check('miss: counted, streak broken', st.misses === 1 && st.streak === 0);
    await pg.waitForTimeout(500);
    check('miss: both back face down', (await state()).open.length === 0 && (await pg.$$('.tl-tile.up')).length === 2);
    // undo the miss
    await pg.evaluate(() => document.querySelector('.tl-undo').click());
    await pg.waitForTimeout(200);
    st = await state();
    check('undo: the miss is cancelled, one per round', st.misses === 0 && st.undos === 0 && st.streak === 1);
    await pg.waitForTimeout(900);
    // a hint
    await pg.evaluate(() => document.querySelector('.tl-hint').click());
    await pg.waitForTimeout(300);
    await shot('hint');
    check('hint: two tiles lit, one hint left', (await pg.$$('.tl-tile.lit')).length === 2 && (await state()).hints === 1);
    await pg.waitForTimeout(800);
    // shuffle keeps the matched pair in place
    const doneBefore = await pg.evaluate(() => [...document.querySelectorAll('.tl-tile.done')].map((t) => t.dataset.i));
    await pg.evaluate(() => document.querySelector('.tl-shuf').click());
    await pg.waitForTimeout(700);
    const doneAfter = await pg.evaluate(() => [...document.querySelectorAll('.tl-tile.done')].map((t) => t.dataset.i));
    check('shuffle: the matched tiles stay', JSON.stringify(doneBefore) === JSON.stringify(doneAfter) && (await state()).matches === 1);
    // play to the win: pairs in a row → the streak
    let streakShot = false;
    for (let q = 0; q < 6; q++) {
      const p = await pg.evaluate(() => __TL_TEST.pair());
      if (!p) break;
      await tapTile(p[0]); await pg.waitForTimeout(120); await tapTile(p[1]);
      await pg.waitForTimeout(520);
      st = await state();
      if (st.streak >= 3 && !streakShot) { streakShot = true; await shot('streak'); check('streak: the badge shows רצף ×3', await pg.evaluate(() => /רצף ×3/.test(document.querySelector('.tl-streak').innerText))); }
      if (st.won) break;
    }
    check('win: every pair found', (await state()).won);
    await pg.waitForFunction(() => document.querySelector('.tl-card h2'), null, { timeout: 5000 });
    await pg.waitForTimeout(700);
    await shot('won');
    const wt = await cardText();
    check('won card: stars, פרוטות, "עוד סיבוב"', /כל הכבוד|מושלם/.test(wt) && /פרוטות/.test(wt) && /עוד סיבוב/.test(wt) && (await pg.$$('.tl-stars3 span.on')).length >= 1, wt.replace(/\n/g, ' | ').slice(0, 120));
    check('fireworks: the particle layer is painting', await pg.evaluate(() => { const c = document.querySelector('.tl-fx'); const g = c.getContext('2d'); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n > 50; }));
    await click('עוד סיבוב');
    await pg.waitForSelector('.tl-card');
    check('next round: level 2', /שלב 2/.test(await cardText()) && /10 זוגות/.test(await cardText()));
    await click('התחל');
    await pg.waitForTimeout(500);
    await shot('l2');
    check('level 2: 20 tiles', (await pg.$$('.tl-tile')).length === 20);
    // the exit
    await pg.evaluate(() => document.querySelector('.tl-exit').click());
    await pg.waitForSelector('.tl-card h2');
    await shot('exit');
    await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});
    const r1 = await pg.evaluate(() => ({ r: window.__res, save: window.__save, log: window.__tllog.slice() }));
    check('result: quit after a win, the perutot kept', r1.r && r1.r.quit === true && r1.r.perutot > 0 && r1.r.won === false, JSON.stringify(r1.r));
    check('save: level 2 opened, best of 1 kept', r1.save.level === 2 && r1.save.best[1] && r1.save.best[1].stars >= 1 && r1.save.perutot > 0, JSON.stringify(r1.save));
    check('sounds and events', ['tlstart', 'tlflip', 'tlmatch', 'tlmiss', 'tlhint', 'tlshuffle', 'tlundo', 'tlwin', 'tlstreak'].every((n) => r1.log.includes(n)) && ['ev:tlopen', 'ev:tlwin', 'ev:tlquit', 'ev:tlclose'].every((n) => r1.log.includes(n)), [...new Set(r1.log)].join(' '));
    check('overlay removed', !(await pg.$('.tl')));

    // ── level 4 (6×5, connected pairs), then the clock runs out ──
    await pg.goto(PAGE);
    await start({ level: 4, seed: 3 });
    await pg.waitForSelector('.tl-card');
    check('level 4 start: the connected-pairs tip', /תמונה והכרטיס/.test(await cardText()));
    await click('התחל');
    await pg.waitForTimeout(400);
    const p4 = await pg.evaluate(() => { const s = __TL_TEST.s(); const i = s.tiles.findIndex((t) => t.kind === 'name'); const j = s.tiles.findIndex((t, q) => q !== i && t.pic === s.tiles[i].pic); return [i, j]; });
    await tapTile(p4[0]); await pg.waitForTimeout(100); await tapTile(p4[1]);
    await pg.waitForTimeout(600);
    await shot('l4');
    const t4 = await pg.$$('.tl-tile');
    const b4 = await t4[0].boundingBox();
    check('level 4: 30 tiles ≥ 44 px, a picture + name pair matched', t4.length === 30 && b4.width >= 44 && b4.height >= 44 && (await state()).matches === 1, `${Math.round(b4.width)}×${Math.round(b4.height)}`);
    const ov = await pg.evaluate(() => { const r = document.querySelector('.tl-grid').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight; });
    check('level 4: the board fits the screen', ov);
    await pg.evaluate(() => __TL_TEST.timeout());
    await pg.waitForFunction(() => /נגמר הזמן/.test((document.querySelector('.tl-card') || {}).innerText || ''), null, { timeout: 5000 }).catch(() => {});
    await pg.waitForTimeout(350);
    await shot('lost');
    check('time\'s up: a kind card with a free retry', /נגמר הזמן — נסו שוב/.test(await cardText()) && /בחינם/.test(await cardText()));
    await click('נסו שוב');
    await pg.waitForSelector('.tl-card');
    check('retry: a new round of the same level', /שלב 4/.test(await cardText()));
    await click('חזרה');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});
    const r2 = await pg.evaluate(() => window.__res);
    check('result after a loss and a quit', r2 && r2.quit === true && r2.won === false && r2.pairs === 1, JSON.stringify(r2));

    // ── upright phone ──
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(PAGE);
    await start({ level: 4, seed: 3 });
    await pg.waitForSelector('.tl-card');
    await click('התחל');
    await pg.waitForTimeout(500);
    await shot('portrait');
    const tp = await pg.$$('.tl-tile'); const bp = await tp[0].boundingBox();
    check('portrait: 30 tiles ≥ 44 px, no overflow', tp.length === 30 && bp.width >= 44 && (await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('.tl-grid').getBoundingClientRect().bottom <= innerHeight)), `${Math.round(bp.width)}×${Math.round(bp.height)}`);
    await pg.evaluate(() => document.querySelector('.tl-exit').click());
    await pg.waitForSelector('.tl-card h2'); await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});
    await pg.goto(PAGE);
    await start({ level: 1, seed: 7 });
    await pg.waitForSelector('.tl-card'); await click('התחל');
    await pg.waitForTimeout(500);
    await shot('portrait-l1');
    await pg.evaluate(() => document.querySelector('.tl-exit').click());
    await pg.waitForSelector('.tl-card h2'); await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});

    // ── the art sheet: every picture, for the review ──
    await pg.setViewportSize({ width: 844, height: 480 });
    await pg.goto(PAGE);
    await pg.evaluate(() => {
      document.body.innerHTML = TL.DEFS + '<div id="sheet" style="display:grid;grid-template-columns:repeat(8,1fr);gap:10px;padding:12px;background:#2A4A7A"></div>';
      const sh = document.getElementById('sheet');
      for (const id of TL.PIC_IDS) { const d = document.createElement('div'); d.style.cssText = 'background:linear-gradient(#FFFDF7,#E6DCC6);border-radius:10px;padding:6px;text-align:center;box-shadow:inset 0 0 0 2px #D9B45A;font:700 13px Heebo,sans-serif;color:#4A2E10'; d.innerHTML = TL.svg(id) + '<div>' + TL.PIC_HE[id] + '</div>'; d.querySelector('svg').style.cssText = 'width:72px;height:72px;display:block;margin:0 auto'; sh.appendChild(d); }
    });
    await pg.waitForTimeout(200);
    await shot('art');
    check('art: 16 pictures', (await pg.$$('#sheet svg')).length === 16);
    // the module never throws
    const safe = await pg.evaluate(async () => { const p = TL.runTiles({ root: null, level: 'x', sfx: { play() { throw new Error('boom'); } }, save: 7 }); await new Promise((r) => setTimeout(r, 250)); const b = document.querySelector('.tl-card button.tl-sec'); if (b) b.click(); return p; }).catch((e) => ({ err: String(e) }));
    check('runTiles resolves with bad inputs', safe && 'quit' in safe, JSON.stringify(safe));
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(bad ? `${bad} FAILED` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
