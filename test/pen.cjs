// The pen-puzzle DOM harness: the real overlay on a phone held sideways (844×390, dpr 1, touch) and upright (390×844),
// no 3D world, ONE browser, closed. Run it only through the serializing runner:
//   /home/claude/wt/bus/brun node test/pen.cjs            build test/out/pen.bundle.js, play, save shots, print PASS/FAIL
//   node test/pen.cjs --build                              only build the bundle
// Shots: test/out/pen-start.png · -board.png · -drag.png · -moved.png · -hint.png · -undo.png · -out.png · -won.png ·
//        -l5.png · -l8.png · -exit.png · -portrait.png · -art.png
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'pen-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'pen.bundle.js'), logLevel: 'warning', charset: 'utf8' });
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const PAGE = 'file://' + path.join(__dirname, 'pen.html');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const cdp = await pg.context().newCDPSession(pg);
    const shot = (n) => pg.screenshot({ path: path.join(OUT, `pen-${n}.png`) });
    const cardText = () => pg.evaluate(() => { const c = document.querySelector('.pn-card'); return c ? c.innerText : ''; });
    const click = (txt) => pg.evaluate((t) => { const b = [...document.querySelectorAll('.pn-card button')].find((x) => x.textContent.includes(t)); if (b) b.click(); return !!b; }, txt);
    const state = () => pg.evaluate(() => { const s = __PN_TEST.s(); return { moves: s.moves, hints: s.hints, won: s.won, hist: s.hist.length, optimal: s.optimal, lamb: s.pieces.find((p) => p.kind === 'lamb'), pieces: s.pieces.map((p) => [p.id, p.x, p.y]) }; });
    const start = (opts) => pg.evaluate((o) => { window.__save = o.save || {}; window.__res = null; PN.runPen(Object.assign({ sfx: window.__sfx, test: true, save: window.__save, onEvent: (t, d) => window.__pnlog.push('ev:' + t) }, o)).then((r) => { window.__res = r; }); }, opts);
    const pieceBox = async (id) => { const e = await pg.$(`.pn-piece[data-id="${id}"]`); return e.boundingBox(); };
    // a one-finger drag through CDP touch events (the pointer events the game listens to come out of these)
    const touchDrag = async (x0, y0, x1, y1, steps = 8) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / steps, y: y0 + ((y1 - y0) * i) / steps }] }); await pg.waitForTimeout(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };

    // ── level 1, sideways: the start card, the pen, a drag, a hint, an undo, the lamb walks out, the won card ──
    await pg.goto(PAGE);
    await start({ level: 1, seed: 7 });
    await pg.waitForSelector('.pn-card');
    await pg.waitForTimeout(400);
    await shot('start');
    const st0 = await cardText();
    check('start card: level, minimum, the draft tag', /שלב 1/.test(st0) && /4/.test(st0) && /טיוטה/.test(st0), st0.replace(/\n/g, ' | ').slice(0, 100));
    await click('התחל');
    await pg.waitForTimeout(500);
    await shot('board');
    const pcs = await pg.$$('.pn-piece');
    check('pen: 5 pieces on level 1', pcs.length === 5);
    const cell = await pg.evaluate(() => __PN_TEST.U.cellPx());
    check('cells ≥ 44 px', cell >= 44, `${cell}px`);
    const penBox = await (await pg.$('.pn-pen')).boundingBox();
    console.log(`board at 844×390: pen ${Math.round(penBox.width)}×${Math.round(penBox.height)} px, cell ${cell} px`);
    check('the pen fits the screen', penBox.y >= 0 && penBox.x >= 0 && penBox.y + penBox.height <= 390 && penBox.x + penBox.width <= 844, JSON.stringify(penBox));
    // level 1 (HAND[1]): the lamb at x=2; goat1 (vertical, x=4 y=0..1) can slide down 3 → drag it down two cells
    let s0 = await state();
    check('level 1 is the hand level: lamb at (2,2)', s0.lamb.x === 2 && s0.lamb.y === 2 && s0.optimal === 4);
    const gb = await pieceBox('goat1');
    const dragP = touchDrag(gb.x + gb.width / 2, gb.y + gb.height / 2, gb.x + gb.width / 2, gb.y + gb.height / 2 + cell * 2, 10);
    await pg.waitForTimeout(90);
    await shot('drag');
    await dragP;
    await pg.waitForTimeout(350);
    await shot('moved');
    let st = await state();
    const g1 = st.pieces.find((p) => p[0] === 'goat1');
    check('touch drag: the goat slid two cells down, one move', g1[2] === 2 && st.moves === 1, JSON.stringify(g1));
    // a drag into a block: the kohen (vertical at x=0, y=2..3) cannot go up through the cow... cow1 is at x=1; kohen1 up: (0,1) free, (0,0) free → it can. Try the lamb left into kohen1 instead.
    const lb = await pieceBox('lamb');
    await touchDrag(lb.x + lb.width / 2, lb.y + lb.height / 2, lb.x + lb.width / 2 - cell * 2, lb.y + lb.height / 2, 8);
    await pg.waitForTimeout(300);
    st = await state();
    check('blocked drag: the lamb stays, no move counted', st.lamb.x === 2 && st.moves === 1 && (await pg.evaluate(() => window.__pnlog.includes('pnblock'))));
    // a hint lights the next optimal piece
    await pg.evaluate(() => document.querySelector('.pn-hint').click());
    await pg.waitForTimeout(250);
    await shot('hint');
    check('hint: a piece lit with an arrow, one hint left', (await pg.$$('.pn-piece.lit')).length === 1 && !!(await pg.$('.pn-arrow')) && (await state()).hints === 1);
    await pg.waitForTimeout(1300);
    // undo the goat
    await pg.evaluate(() => document.querySelector('.pn-undo').click());
    await pg.waitForTimeout(300);
    await shot('undo');
    st = await state();
    check('undo: the goat is back, moves 0', st.pieces.find((p) => p[0] === 'goat1')[2] === 0 && st.moves === 0);
    check('undo button disabled with nothing to undo', await pg.evaluate(() => document.querySelector('.pn-undo').disabled));
    // play the optimal solution through the engine hook, the last move by a tap on the lamb
    const sol = await pg.evaluate(() => __PN_TEST.solve().moves);
    for (let q = 0; q < sol.length - 1; q++) { await pg.evaluate((m) => __PN_TEST.move(m[0], m[1]), sol[q]); await pg.waitForTimeout(260); }
    st = await state();
    check('before the last move: the lane is clear', !st.won && st.moves === sol.length - 1);
    const lb2 = await pieceBox('lamb');
    await pg.touchscreen.tap(lb2.x + lb2.width / 2, lb2.y + lb2.height / 2);
    await pg.waitForTimeout(420);
    await shot('out');
    check('tap on the lamb: it walks out', await pg.evaluate(() => !!document.querySelector('.pn-piece.lamb.out')) && (await state()).won);
    await pg.waitForFunction(() => document.querySelector('.pn-card h2'), null, { timeout: 5000 });
    await pg.waitForTimeout(800);
    await shot('won');
    const wt = await cardText();
    check('won card: 3 stars, מינימום, +9 פרוטות, "עוד דיר"', /הטלה יצא/.test(wt) && /מינימום 4/.test(wt) && /\+9 פרוטות/.test(wt) && /עוד דיר/.test(wt) && (await pg.$$('.pn-stars3 span.on')).length === 3, wt.replace(/\n/g, ' | ').slice(0, 140));
    check('fireworks: the particle layer is painting', await pg.evaluate(() => { const c = document.querySelector('.pn-fx'); const g = c.getContext('2d'); const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n > 50; }));
    await click('עוד דיר');
    await pg.waitForSelector('.pn-card');
    check('next round: level 2', /שלב 2/.test(await cardText()));
    await click('התחל');
    await pg.waitForTimeout(400);
    check('level 2: 6 pieces', (await pg.$$('.pn-piece')).length === 6);
    // the exit
    await pg.evaluate(() => document.querySelector('.pn-exit').click());
    await pg.waitForSelector('.pn-card h2');
    await shot('exit');
    await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});
    const r1 = await pg.evaluate(() => ({ r: window.__res, save: window.__save, log: window.__pnlog.slice() }));
    check('result: quit after a win, the perutot kept', r1.r && r1.r.quit === true && r1.r.perutot === 9 && r1.r.won === false, JSON.stringify(r1.r));
    check('save: level 2 opened, best of 1 kept', r1.save.level === 2 && r1.save.best[1] && r1.save.best[1].stars === 3 && r1.save.best[1].moves === 4 && r1.save.perutot === 9, JSON.stringify(r1.save));
    check('sounds and events', ['pnslide', 'pnblock', 'pnhint', 'pnundo', 'pnwin', 'pnstars'].every((n) => r1.log.includes(n)) && ['ev:pnopen', 'ev:pnstart', 'ev:pnmove', 'ev:pnhint', 'ev:pnundo', 'ev:pnwin', 'ev:pnquit', 'ev:pnclose'].every((n) => r1.log.includes(n)), [...new Set(r1.log)].join(' '));
    check('overlay removed', !(await pg.$('.pn')));

    // ── level 5 (a crowded hand level), then a generated level 8 ──
    await pg.goto(PAGE);
    await start({ level: 5, seed: 3 });
    await pg.waitForSelector('.pn-card');
    await click('התחל');
    await pg.waitForTimeout(400);
    await shot('l5');
    const s5 = await state();
    check('level 5: 11 pieces, minimum 11', (await pg.$$('.pn-piece')).length === 11 && s5.optimal === 11);
    const pb5 = await Promise.all(['trough1', 'cow1'].map(pieceBox));
    check('vertical pieces: trough 1×3, cow 1×3 stand upright', pb5.every((bx) => bx.height > bx.width * 2.5));
    // reset after two moves
    const sol5 = await pg.evaluate(() => __PN_TEST.solve().moves);
    await pg.evaluate((m) => __PN_TEST.move(m[0], m[1]), sol5[0]); await pg.evaluate((m) => __PN_TEST.move(m[0], m[1]), sol5[1]);
    await pg.waitForTimeout(100);
    await pg.evaluate(() => document.querySelector('.pn-reset').click());
    await pg.waitForTimeout(300);
    const s5b = await state();
    check('reset: moves back to 0, the pieces where they were', s5b.moves === 0 && s5b.hist === 0 && JSON.stringify(s5b.pieces) === JSON.stringify(s5.pieces));
    await pg.evaluate(() => document.querySelector('.pn-exit').click());
    await pg.waitForSelector('.pn-card h2'); await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});
    await pg.goto(PAGE);
    const tg = Date.now();
    await start({ level: 8, seed: 11 });
    await pg.waitForSelector('.pn-card', { timeout: 20000 });
    console.log(`level 8 generated in ~${Date.now() - tg} ms (in the browser)`);
    const c8 = await cardText();
    await click('התחל');
    await pg.waitForTimeout(400);
    await shot('l8');
    const st8 = await state();
    check('level 8 (generated): 12–17 minimum, 9–13 pieces, solvable', st8.optimal >= 12 && st8.optimal <= 17 && st8.pieces.length >= 9 && st8.pieces.length <= 13 && (await pg.evaluate(() => !!__PN_TEST.solve())), `optimal ${st8.optimal}, pieces ${st8.pieces.length}`);
    check('level 8 card says the minimum', new RegExp(String(st8.optimal)).test(c8));
    await pg.evaluate(() => document.querySelector('.pn-exit').click());
    await pg.waitForSelector('.pn-card h2'); await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});

    // ── upright phone ──
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.goto(PAGE);
    await start({ level: 3, seed: 3 });
    await pg.waitForSelector('.pn-card');
    await click('התחל');
    await pg.waitForTimeout(500);
    await shot('portrait');
    const cp = await pg.evaluate(() => __PN_TEST.U.cellPx());
    const pbp = await (await pg.$('.pn-pen')).boundingBox();
    check('portrait: cells ≥ 44 px, the pen inside the screen', cp >= 44 && pbp.x >= 0 && pbp.x + pbp.width <= 390 && pbp.y >= 0 && pbp.y + pbp.height <= 844 && (await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth)), `cell ${cp}px, pen ${JSON.stringify(pbp)}`);
    // a mouse drag works too (pointer events)
    const hb = await pieceBox('goat2');
    await pg.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await pg.mouse.down();
    await pg.mouse.move(hb.x + hb.width / 2 - cp, hb.y + hb.height / 2, { steps: 6 }); await pg.mouse.up();
    await pg.waitForTimeout(300);
    const stp = await state();
    check('portrait: a mouse drag moves a goat one cell left', stp.pieces.find((p) => p[0] === 'goat2')[1] === 0 && stp.moves === 1, JSON.stringify(stp.pieces.find((p) => p[0] === 'goat2')));
    await pg.evaluate(() => document.querySelector('.pn-exit').click());
    await pg.waitForSelector('.pn-card h2'); await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 5000 }).catch(() => {});

    // ── the art sheet: every piece, horizontal and upright, for the review ──
    await pg.setViewportSize({ width: 844, height: 420 });
    await pg.goto(PAGE);
    await pg.evaluate(() => {
      document.body.innerHTML = PN.DEFS + '<div id="sheet" style="display:flex;gap:12px;padding:12px;background:#D4B874;align-items:flex-start;flex-wrap:wrap"></div>';
      const sh = document.getElementById('sheet');
      for (const k of PN.PIECE_KINDS) { const len = PN.KINDS[k].len; const d = document.createElement('div'); d.style.cssText = 'text-align:center;font:700 13px Heebo,sans-serif;color:#4A2E10'; d.innerHTML = PN.pieceSvg(k, len) + '<div>' + PN.KIND_HE[k] + '</div>'; d.querySelector('svg').style.cssText = `width:${len * 70}px;height:70px;display:block;margin:0 auto`; sh.appendChild(d); }
      const d2 = document.createElement('div'); d2.style.cssText = 'flex:1 0 100%;display:flex;gap:16px;justify-content:center';
      for (const k of PN.PIECE_KINDS) { const len = PN.KINDS[k].len; const w = document.createElement('div'); w.style.cssText = `position:relative;width:70px;height:${len * 70}px`; w.innerHTML = PN.pieceSvg(k, len); w.querySelector('svg').style.cssText = `position:absolute;left:${(70 - len * 70) / 2}px;top:${(len * 70 - 70) / 2}px;width:${len * 70}px;height:70px;transform:rotate(90deg)`; d2.appendChild(w); }
      sh.appendChild(d2);
    });
    await pg.waitForTimeout(200);
    await shot('art');
    check('art: 6 pieces', (await pg.$$('#sheet > div > svg')).length === 6);
    // the module never throws
    const safe = await pg.evaluate(async () => { const p = PN.runPen({ root: null, level: 'x', sfx: { play() { throw new Error('boom'); } }, save: 7 }); await new Promise((r) => setTimeout(r, 400)); const b = document.querySelector('.pn-card button.pn-sec'); if (b) b.click(); return p; }).catch((e) => ({ err: String(e) }));
    check('runPen resolves with bad inputs', safe && 'quit' in safe, JSON.stringify(safe));
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(bad ? `${bad} FAILED` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
