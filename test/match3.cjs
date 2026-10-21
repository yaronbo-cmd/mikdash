// The match-3 DOM harness: the real overlay in phone portrait (390×844, dpr 1), no 3D world, ONE browser, closed.
//   node test/match3.cjs            build test/out/match3.bundle.js, play each field, save shots, print PASS/FAIL
//   node test/match3.cjs --build    only build the bundle
//   node test/match3.cjs --land     the phone held sideways (844×390 touch, also 915×412 and 1280×720) and portrait again:
//                                   shots m3-land-*.png / m3-port-*.png, the measured cell, nothing overlapping the board
// Shots: test/out/m3-<field>-start.png · -cascade.png · -won.png · m3-map.png · m3-album.png · m3-lost.png
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'match3-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'match3.bundle.js'), logLevel: 'warning', charset: 'utf8' });
if (process.argv.includes('--build')) { console.log('bundle built'); process.exit(0); }
const { chromium } = require('playwright');

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const CASES = [['quarry', 5], ['forest', 9], ['gold', 8]];

/* ── the phone held sideways: the board fills the height, the HUD stands at its two sides ── */
const LAND_VIEWS = [['land', 844, 390], ['land-915', 915, 412], ['land-1280', 1280, 720], ['port', 390, 844]];
async function landMode() {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  try {
    for (const [tag, width, height] of LAND_VIEWS) {
      const cx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
      const pg = await cx.newPage();
      pg.on('pageerror', (e) => errs.push(e.message));
      await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
      const shot = (n) => pg.screenshot({ path: path.join(OUT, `m3-${tag}-${n}.png`) });
      const cardText = () => pg.evaluate(() => { const c = document.querySelector('.m3-card'); return c ? c.innerText : ''; });
      const click = (txt) => pg.evaluate((t) => { const b = [...document.querySelectorAll('.m3-card button')].find((x) => x.textContent.includes(t)); if (b) b.click(); return !!b; }, txt);
      // the layout: the board's cell, its place, every HUD piece inside the screen and off the board, 44-px targets
      const measure = () => pg.evaluate(() => {
        const W = innerWidth, H = innerHeight, el = document.querySelector('.m3'), hit = document.querySelector('.m3-hit');
        const hr = hit.getBoundingClientRect(), cs = __M3_TEST.view.cs;
        const out = { W, H, land: el.dataset.land === '1', cs, bw: Math.round(hr.width), bh: Math.round(hr.height), bl: Math.round(hr.left), bt: Math.round(hr.top), over: [], out: [], small: [], scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight };
        const vis = (e) => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && !e.hidden; };
        for (const e of el.querySelectorAll('.m3-btn,.m3-title,.m3-moves,.m3-chip,.m3-gl,.m3-meter,.m3-foot .hint,.m3-foot .need,.m3-back')) {
          if (!vis(e) || e.closest('.m3-card')) continue;
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const tag = e.className.split(' ')[0] + (e.textContent ? ':' + e.textContent.trim().slice(0, 12) : '');
          if (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) out.out.push(tag);
          if (r.left < hr.right - 0.5 && r.right > hr.left + 0.5 && r.top < hr.bottom - 0.5 && r.bottom > hr.top + 0.5) out.over.push(tag);
          if (e.tagName === 'BUTTON' && (r.width < 44 || r.height < 44)) out.small.push(tag);
        }
        return out;
      });
      await pg.goto('file://' + path.join(__dirname, 'match3.html'));
      await pg.evaluate(() => { window.__save = {}; M3.runLevel({ field: 'quarry', level: 5, map: false, sfx: window.__sfx, test: true, goalScale: 0.3, save: window.__save, need: { stone: 30 } }).then((r) => { window.__res = r; }); });
      await pg.waitForSelector('.m3-card');
      await pg.waitForTimeout(350);
      await shot('card');
      const cardIn = await pg.evaluate(() => { const r = document.querySelector('.m3-card').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; });
      check(`${tag}: the start card fits the screen`, cardIn);
      await click('התחל');
      await pg.waitForTimeout(450);
      await shot('board');
      const m = await measure();
      const wantLand = width > height;
      check(`${tag}: layout by aspect`, m.land === wantLand, `data-land=${m.land}`);
      const maxCs = Math.floor(Math.min(height / 9, (width - 2 * 120) / 8));
      check(`${tag}: cell size`, wantLand ? m.cs >= Math.min(44, maxCs - 1) : m.cs >= 44, `cell ${m.cs} px, board ${m.bw}×${m.bh} at (${m.bl},${m.bt}) in ${m.W}×${m.H}`);
      if (wantLand) check(`${tag}: the board uses the height and sits in the middle`, m.bh >= height - 12 && Math.abs(m.bl + m.bw / 2 - width / 2) <= width * 0.08, `board height ${m.bh}/${height}, centre ${Math.round(m.bl + m.bw / 2)}/${width / 2}`);
      check(`${tag}: nothing over the board`, m.over.length === 0, m.over.join(' | '));
      check(`${tag}: nothing outside the screen`, m.out.length === 0 && m.scrollW <= width && m.scrollH <= height, m.out.join(' | ') + ` scroll ${m.scrollW}×${m.scrollH}`);
      check(`${tag}: 44-px buttons`, m.small.length === 0, m.small.join(' | '));
      await pg.evaluate(() => { const h = __M3_TEST.hint(); __M3_TEST.move(h[0], h[1]); });
      await pg.waitForTimeout(330);
      await shot('cascade');
      if (tag === 'land') {
        // the turn of the phone: portrait → sideways → portrait again, re-laid each time
        await pg.waitForFunction(() => !__M3_TEST.view.locked, null, { timeout: 15000 }).catch(() => {});
        await pg.setViewportSize({ width: 390, height: 844 });
        await pg.waitForTimeout(250);
        const p = await measure();
        check('turn: portrait again', !p.land && p.cs >= 44 && p.over.length === 0, `cell ${p.cs}`);
        await shot('turned-portrait');
        await pg.setViewportSize({ width, height });
        await pg.waitForTimeout(250);
        const l = await measure();
        check('turn: sideways again', l.land && l.cs === m.cs && l.over.length === 0 && l.out.length === 0, `cell ${l.cs}`);
        // the exit card, then a loss, in landscape
        await pg.evaluate(() => document.querySelector('.m3-exit').click());
        await pg.waitForSelector('.m3-card h2');
        await pg.waitForTimeout(200);
        await shot('exit');
        await click('להמשיך');
        await pg.waitForFunction(() => !document.querySelector('.m3-card'), null, { timeout: 5000 }).catch(() => {});
        await pg.evaluate(() => { __M3_TEST.s.moves = 1; });
        await pg.evaluate(async () => { const h = __M3_TEST.hint(); await __M3_TEST.move(h[0], h[1]); });
        await pg.waitForFunction(() => /כמעט|נגמרו/.test((document.querySelector('.m3-card') || {}).innerText || ''), null, { timeout: 15000 }).catch(() => {});
        await pg.waitForTimeout(450);
        await shot('lost');
        check('land: the loss card', /נסה שוב/.test(await cardText()));
        const lostIn = await pg.evaluate(() => { const c = document.querySelector('.m3-card'); if (!c) return false; const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
        check('land: the loss card fits', lostIn);
        // play on to the win (a free retry) for the won card sideways
        await click('נסה שוב');
        await pg.waitForSelector('.m3-card h2');
        await click('התחל');
        await pg.waitForTimeout(300);
        let won = false;
        for (let q = 0; q < 40 && !won; q++) {
          await pg.waitForFunction(() => !document.querySelector('.m3-card') || document.querySelector('.m3-card h2'), null, { timeout: 20000 });
          const txt = await cardText();
          if (/כל הכבוד|מושלם/.test(txt)) { won = true; break; }
          if (/כמעט|נגמרו/.test(txt)) break;
          await pg.evaluate(async () => { const h = __M3_TEST.hint(); if (h) await __M3_TEST.move(h[0], h[1]); });
          await pg.waitForTimeout(60);
        }
        if (!won) { try { await pg.waitForFunction(() => /כל הכבוד|מושלם/.test((document.querySelector('.m3-card') || {}).innerText || ''), null, { timeout: 15000 }); won = true; } catch (e) { /* */ } }
        check('land: level won', won);
        await pg.waitForTimeout(1500);
        await shot('won');
        const wonIn = await pg.evaluate(() => { const c = document.querySelector('.m3-card'); if (!c) return false; const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
        check('land: the won card fits', wonIn);
        // the map and the album sideways
        await pg.goto('file://' + path.join(__dirname, 'match3.html'));
        await pg.evaluate(() => { window.__save = { level: { quarry: 7, forest: 3, gold: 2 }, best: { 'quarry:1': { stars: 3, score: 1 }, 'quarry:2': { stars: 2, score: 1 }, 'quarry:3': { stars: 1, score: 1 } }, album: { menorah: 44, altar: 12 } }; M3.runLevel({ need: { cedar: 20 }, sfx: window.__sfx, test: true, save: window.__save }).then((r) => { window.__res = r; }); });
        await pg.waitForSelector('.m3-path');
        await pg.waitForTimeout(300);
        await shot('map');
        await click('אלבום');
        await pg.waitForSelector('.m3-album');
        await pg.waitForTimeout(200);
        await shot('album');
      }
      await cx.close();
    }
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(bad ? `${bad} FAILED` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
}
if (process.argv.includes('--land')) { landMode(); } else

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = (n) => pg.screenshot({ path: path.join(OUT, `m3-${n}.png`) });
    const cardText = () => pg.evaluate(() => { const c = document.querySelector('.m3-card'); return c ? c.innerText : ''; });
    const click = (txt) => pg.evaluate((t) => { const b = [...document.querySelectorAll('.m3-card button')].find((x) => x.textContent.includes(t)); if (b) b.click(); return !!b; }, txt);
    for (const [field, level] of CASES) {
      await pg.goto('file://' + path.join(__dirname, 'match3.html'));
      await pg.evaluate(({ field, level }) => {
        window.__save = {};
        window.__res = null;
        M3.runLevel({ field, level, map: false, sfx: window.__sfx, test: true, goalScale: 0.3, save: window.__save, need: { stone: 30 } }).then((r) => { window.__res = r; });
      }, { field, level });
      await pg.waitForSelector('.m3-card');
      check(`${field}: start card`, (await cardText()).includes('שלב ' + level));
      if (field === 'forest') { await pg.waitForTimeout(350); await shot('start-card'); check('start card: the level meter (רמה)', /רמה/.test(await cardText())); }
      await click('התחל');
      await pg.waitForTimeout(450);
      await shot(field + '-start');
      const t = await pg.evaluate(() => { const h = __M3_TEST.hint(); return h; });
      check(`${field}: a valid move exists`, Array.isArray(t));
      await pg.evaluate(() => { const h = __M3_TEST.hint(); __M3_TEST.move(h[0], h[1]); });
      await pg.waitForTimeout(330);
      await shot(field + '-cascade');
      // frame cost while the board settles and idles (headless SwiftShader: the frame count is only indicative)
      await pg.evaluate(async () => { const h = __M3_TEST.hint(); const p = __M3_TEST.view.perf; p.n = 0; p.ms = 0; p.max = 0; await __M3_TEST.move(h[0], h[1]); await new Promise((r) => setTimeout(r, 400)); });
      const pf = await pg.evaluate(() => Object.assign({}, __M3_TEST.view.perf));
      check(`${field}: JS time per frame`, pf.n >= 1 && pf.ms / pf.n < 10, `${(pf.ms / Math.max(1, pf.n)).toFixed(2)} ms avg, ${pf.max.toFixed(1)} max, ${pf.n} frames`);
      // play the hint moves until the level is won (goals scaled for the harness)
      let won = false;
      for (let q = 0; q < 40 && !won; q++) {
        await pg.waitForFunction(() => !document.querySelector('.m3-card') || document.querySelector('.m3-card h2'), null, { timeout: 20000 });
        const txt = await cardText();
        if (/כל הכבוד|מושלם/.test(txt)) { won = true; break; }
        if (/כמעט|נגמרו/.test(txt)) break;
        await pg.evaluate(async () => { const h = __M3_TEST.hint(); if (h) await __M3_TEST.move(h[0], h[1]); });
        await pg.waitForTimeout(60);
      }
      if (!won) { try { await pg.waitForFunction(() => /כל הכבוד|מושלם/.test((document.querySelector('.m3-card') || {}).innerText || ''), null, { timeout: 15000 }); won = true; } catch (e) { /* */ } }
      check(`${field}: level won`, won);
      await pg.waitForTimeout(1500);
      await shot(field + '-won');
      await click('חזרה לבנייה') || await click('עוד שלב');
      await pg.waitForFunction(() => window.__res, null, { timeout: 10000 }).catch(() => {});
      const res = await pg.evaluate(() => ({ r: window.__res, save: window.__save, log: window.__m3log.slice(0, 400) }));
      const got = res.r && res.r.collected;
      check(`${field}: result`, res.r && res.r.won && res.r.stars >= 1 && got && Object.values(got).some((v) => v > 0), res.r ? `stars ${res.r.stars}, collected ${JSON.stringify(got)}, ${res.r.ms} ms` : 'none');
      check(`${field}: save advanced`, res.save.level && res.save.level[field] === level + 1 && res.save.best[field + ':' + level]);
      check(`${field}: sounds`, ['m3start', 'm3swap', 'm3win', 'm3stars'].every((n) => res.log.includes(n)), [...new Set(res.log)].join(' '));
      check(`${field}: overlay removed`, !(await pg.$('.m3')));
    }
    // the map, the album, a loss (near miss) and the exit
    await pg.goto('file://' + path.join(__dirname, 'match3.html'));
    await pg.evaluate(() => { window.__save = { level: { quarry: 7, forest: 3, gold: 2 }, best: { 'quarry:1': { stars: 3, score: 1 }, 'quarry:2': { stars: 2, score: 1 }, 'quarry:3': { stars: 1, score: 1 } }, album: { menorah: 44, altar: 12 } }; M3.runLevel({ need: { cedar: 20 }, sfx: window.__sfx, test: true, save: window.__save }).then((r) => { window.__res = r; }); });
    await pg.waitForSelector('.m3-path');
    await pg.waitForTimeout(300);
    await shot('map');
    check('map: field tabs + path', (await cardText()).includes('יער הלבנון'));
    await click('אלבום');
    await pg.waitForSelector('.m3-album');
    await shot('album');
    check('album: an open card and locked ones', (await pg.$$('.m3-vc.lock')).length === 5);
    await click('חזרה למפה');
    await pg.waitForSelector('.m3-path');
    await click('שחק');
    await pg.waitForSelector('.m3-card h2');
    await click('התחל');
    await pg.waitForTimeout(300);
    await pg.evaluate(() => { __M3_TEST.s.moves = 1; });
    await pg.evaluate(async () => { const h = __M3_TEST.hint(); await __M3_TEST.move(h[0], h[1]); });
    await pg.waitForFunction(() => /כמעט|נגמרו/.test((document.querySelector('.m3-card') || {}).innerText || ''), null, { timeout: 15000 }).catch(() => {});
    await pg.waitForTimeout(450);
    await shot('lost');
    check('loss: a kind card with a free retry', /נסה שוב/.test(await cardText()));
    await click('נסה שוב');
    await pg.waitForSelector('.m3-card h2');
    await click('התחל');
    await pg.evaluate(() => document.querySelector('.m3-exit').click());
    await pg.waitForSelector('.m3-card h2');
    await click('לצאת');
    await pg.waitForFunction(() => window.__res, null, { timeout: 10000 }).catch(() => {});
    const q = await pg.evaluate(() => window.__res);
    check('exit: resolves quit, keeps what was gathered', q && q.quit === true && q.attempts === 2, q ? JSON.stringify(q.collected) : 'none');
    // BUILD's whole stones for the altar: the quarry of Beit Kerem
    await pg.goto('file://' + path.join(__dirname, 'match3.html'));
    await pg.evaluate(() => { M3.runLevel({ field: 'quarry', level: 4, map: false, test: true, need: { wstone: 6 }, save: {} }).then((r) => { window.__res = r; }); });
    await pg.waitForSelector('.m3-card h2');
    check('whole stones: Beit Kerem level', /בקעת בית כרם/.test(await cardText()));
    await click('התחל');
    await pg.waitForTimeout(400);
    await shot('wstone');
    // the demo plays itself
    await pg.goto('file://' + path.join(__dirname, 'match3.html'));
    const t0 = Date.now();
    await pg.evaluate(() => { M3.runLevel({ field: 'gold', demo: true, save: {} }).then((r) => { window.__res = r; }); });
    await pg.waitForFunction(() => window.__res, null, { timeout: 120000 }).catch(() => {});
    const d = await pg.evaluate(() => window.__res);
    check('demo: plays itself to a win', d && d.won, d ? `${Math.round((Date.now() - t0) / 1000)} s` : 'no result');
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(bad ? `${bad} FAILED` : 'ALL PASS');
  process.exit(bad ? 1 : 0);
})();
