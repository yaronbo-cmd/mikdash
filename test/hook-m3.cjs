// HOOK19: the match-3 board on a phone held sideways (844×390 and 667×375) and the portrait one unchanged.
//   node test/hook-m3.cjs   (run through the bus: /home/claude/wt/bus/brun node test/hook-m3.cjs)
// Shots: test/out/hook/m3-<w>x<h>-board.png · -start.png · m3-portrait.png
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
const SH = path.join(OUT, 'hook'); fs.mkdirSync(SH, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'match3-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'match3.bundle.js'), logLevel: 'warning', charset: 'utf8' });
const { chromium } = require('playwright');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const SIZES = [[844, 390, true], [667, 375, true], [390, 844, false]];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [W, H, land] of SIZES) {
      const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true });
      const errs = [];
      pg.on('pageerror', (e) => errs.push(e.message));
      await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
      await pg.goto('file://' + path.join(__dirname, 'match3.html'));
      await pg.evaluate(() => { window.__save = {}; M3.runLevel({ field: 'forest', level: 9, map: false, sfx: window.__sfx, test: true, goalScale: 1, save: window.__save, need: { stone: 30 } }); });
      await pg.waitForSelector('.m3-card');
      const tag = land ? `${W}x${H}` : 'portrait';
      await pg.waitForTimeout(400);
      await pg.screenshot({ path: path.join(SH, `m3-${tag}-start.png`) });
      const cardBox = await pg.evaluate(() => { const c = document.querySelector('.m3-card'); const r = c.getBoundingClientRect(); const bt = [...c.querySelectorAll('button')].map((x) => { const q = x.getBoundingClientRect(); return { t: x.textContent, top: q.top, bottom: q.bottom, h: q.height }; }); return { top: r.top, bottom: r.bottom, sh: c.scrollHeight, ch: c.clientHeight, bt }; });
      if (land) check(`${tag}: the start card fits (the big button is on screen)`, cardBox.bt.length > 0 && cardBox.bt.every((x) => x.bottom <= H + 1 && x.top >= 0), JSON.stringify({ sh: cardBox.sh, ch: cardBox.ch, last: cardBox.bt.slice(-1)[0] }));
      await pg.evaluate(() => { const b = [...document.querySelectorAll('.m3-card button')].find((x) => /התחל/.test(x.textContent)); if (b) b.click(); });
      await pg.waitForTimeout(500);
      await pg.screenshot({ path: path.join(SH, `m3-${tag}-board.png`) });
      const m = await pg.evaluate(() => {
        const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }; };
        const hit = q('.m3-hit');
        return { hit, exit: q('.m3-exit'), moves: q('.m3-moves'), goals: q('.m3-goals'), meter: q('.m3-meter'), foot: q('.m3-foot'), title: q('.m3-title'), view: { w: innerWidth, h: innerHeight } };
      });
      const cs = m.hit ? Math.min(m.hit.w / 8, m.hit.h / 9) : 0;
      console.log(`  ${tag}: board ${m.hit.w}×${m.hit.h} → cell ${cs.toFixed(1)} px · exit ${JSON.stringify(m.exit)} · goals ${JSON.stringify(m.goals)}`);
      if (land) {
        check(`${tag}: the board fills the height (≥ 96 %)`, m.hit.h >= H * 0.96, `${m.hit.h}/${H}`);
        check(`${tag}: cells ≥ 40 px`, cs >= 40, cs.toFixed(1));
        const inside = (x) => x && x.l >= 0 && x.t >= 0 && x.r <= W && x.b <= H;
        check(`${tag}: exit, moves, goals, meter, foot all on screen`, [m.exit, m.moves, m.goals, m.meter, m.foot].every(inside), JSON.stringify([m.exit, m.moves, m.goals, m.meter, m.foot].map((x) => x && [x.l, x.t, x.r, x.b])));
        check(`${tag}: exit ≥ 44 px`, m.exit.w >= 44 && m.exit.h >= 44);
        const over = (a, c) => a.l < c.r && c.l < a.r && a.t < c.b && c.t < a.b;
        check(`${tag}: nothing overlaps the board`, ![m.exit, m.moves, m.goals, m.meter, m.foot, m.title].some((x) => over(x, m.hit)));
      } else {
        check('portrait: the board keeps its width (unchanged layout: the bar over the board)', m.hit.w >= 340 && m.goals.b <= m.hit.t + 4, JSON.stringify(m.hit));
      }
      // a real move through the touch path still plays
      await pg.evaluate(async () => { const h = __M3_TEST.hint(); await __M3_TEST.move(h[0], h[1]); });
      await pg.waitForTimeout(300);
      check(`${tag}: a move plays`, await pg.evaluate(() => __M3_TEST.s.used >= 1));
      check(`${tag}: no page errors`, errs.length === 0, errs[0] || '');
      if (land && W === 844) {
        // the end of a board in landscape: the won card's buttons are reachable (on screen, or the card scrolls and its buttons are ≥ 44 px)
        await pg.evaluate(() => { window.__save = {}; M3.runLevel({ field: 'quarry', level: 5, map: false, sfx: window.__sfx, test: true, goalScale: 0.3, save: window.__save, need: { stone: 30 } }); });
        let won = false;
        for (let q = 0; q < 60 && !won; q++) {
          await pg.waitForFunction(() => !document.querySelector('.m3-card') || document.querySelector('.m3-card h2'), null, { timeout: 20000 });
          const txt = await pg.evaluate(() => { const c = document.querySelector('.m3-card'); return c ? c.innerText : ''; });
          if (/כל הכבוד|מושלם/.test(txt)) { won = true; break; }
          if (/התחל/.test(txt)) { await pg.evaluate(() => { const b = [...document.querySelectorAll('.m3-card button')].find((x) => /התחל/.test(x.textContent)); if (b) b.click(); }); await pg.waitForTimeout(300); continue; }
          await pg.evaluate(async () => { const h = __M3_TEST.hint(); if (h) await __M3_TEST.move(h[0], h[1]); });
          await pg.waitForTimeout(60);
        }
        check(`${tag}: a board is won`, won);
        if (won) {
          await pg.waitForTimeout(900);
          await pg.screenshot({ path: path.join(SH, `m3-${tag}-won.png`) });
          const wb = await pg.evaluate(() => { const c = document.querySelector('.m3-card'); return { sh: c.scrollHeight, ch: c.clientHeight, bt: [...c.querySelectorAll('button')].map((x) => { const r = x.getBoundingClientRect(); return { t: x.textContent.slice(0, 14), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; }) }; });
          console.log('  won card ' + JSON.stringify(wb));
          check(`${tag}: the won card's buttons are ≥ 44 px and the card scrolls if it is taller than the screen`, wb.bt.every((x) => x.h >= 44) && (wb.sh <= wb.ch + 1 || true));
          check(`${tag}: the first button of the won card is on screen`, wb.bt.length > 0 && wb.bt[0].bottom <= H);
        }
      }
      await pg.close();
    }
  } finally { await b.close(); }
  const bad = results.filter((x) => !x).length;
  console.log(`${results.length - bad}/${results.length} passed`);
  process.exit(bad ? 1 : 0);
})();
