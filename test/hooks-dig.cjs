// FUN (wave 7): "חפירת היום" (the dig of the day) on a phone page — the card in the "היום" sheet, the brush game (a finger
// drags over the earth), the reveal and the find's card, the tease, closing. DOM only (no 3D world): light on the machine.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/hooks-dig.cjs [--shots]
//   → test/out/dig/dig-{sheet,brush,card,shabbat}.png (--shots)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/dig');
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = process.argv.includes('--shots');
const entry = path.join(OUT, 'entry.js');
fs.writeFileSync(entry, `import * as L from '../../../src/game/hooks/loop.js';\nimport * as D from '../../../src/game/hooks/dig.js';\nwindow.__L = L; window.__D = D;\n`);
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [entry], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'dig.bundle.js'), logLevel: 'error', loader: { '.json': 'json' } });
fs.writeFileSync(path.join(OUT, 'dig.html'), `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:#F4ECDC;font-family:system-ui,sans-serif}.sheet{position:fixed;inset:auto 0 0 0;height:62vh;background:#FBF6EA;border-radius:18px 18px 0 0;padding:14px;overflow:auto;box-shadow:0 -6px 24px rgba(0,0,0,.18)}</style>
</head><body><div class="sheet"><h3 style="margin:0 0 10px">היום</h3><div id="s"></div></div><script src="dig.bundle.js"></script></body></html>`);
const { chromium } = require('playwright');

let fail = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); if (!c) fail++; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto('file://' + path.join(OUT, 'dig.html'));
    // a Tuesday, after the first course
    await pg.evaluate(() => {
      window.__NOW = new Date('2026-10-06T17:00:00+03:00').getTime();
      window.G = {}; __L.onEvent(G, 'course', { c: 1 }, __NOW);
      window.__played = []; __L.useKit({ sfx: { play: (n) => __played.push(n), haptic: () => {} }, emit: (n, d) => __played.push('emit:' + n) });
      document.getElementById('s').innerHTML = __L.ordersHTML(G, __NOW);
      document.getElementById('s').addEventListener('click', (e) => { window.__tap = __L.onTap(G, e.target, __NOW); });
    });
    const card = await pg.$('[data-fun="dig"]');
    ok(!!card, 'the dig card leads the sheet with a "חפור" button');
    const bb = card && await card.boundingBox();
    ok(bb && bb.height >= 44 && bb.width >= 44, `the button is a 44-px target (${bb && Math.round(bb.width)}×${bb && Math.round(bb.height)})`);
    if (SHOTS) await pg.screenshot({ path: path.join(OUT, 'dig-sheet.png') });
    await card.click();
    await pg.waitForSelector('.fx-dig.on');
    const tap = await pg.evaluate(() => window.__tap);
    ok(tap && tap.claim && tap.claim.cedar === 10 && tap.dig, 'the tap gives the find and +10 cedar at once (BUILD applies the claim)');
    const pit = await (await pg.$('.fx-dig .fx-pit')).boundingBox();
    ok(pit && pit.width >= 220 && pit.x >= 16 && pit.x + pit.width <= 374, `the pit fits the phone (${Math.round(pit.width)} px)`);
    // brush: three rows, then a screenshot mid-way
    const drag = async (rows, from = 0) => {
      for (let j = from; j < rows; j++) {
        const y = pit.y + ((j + 0.5) / 7) * pit.height;
        await pg.mouse.move(pit.x + 4, y); await pg.mouse.down();
        for (let i = 1; i <= 12; i++) await pg.mouse.move(pit.x + (i / 12) * (pit.width - 8) + 4, y, { steps: 2 });
        await pg.mouse.up();
      }
    };
    await drag(3);
    const mid = await pg.evaluate(() => parseFloat(document.querySelector('.fx-prog i').style.width) || 0);
    ok(mid > 15 && mid < 100, `the progress follows the brush (${mid}%)`);
    if (SHOTS) await pg.screenshot({ path: path.join(OUT, 'dig-brush.png') });
    await drag(7, 3);
    await pg.waitForSelector('.fx-card2.on', { timeout: 5000 }).catch(() => null);
    const info = await pg.evaluate(() => { const c = document.querySelector('.fx-card2'); return c ? { t: c.querySelector('h3').textContent, meta: c.querySelector('.fx-meta').textContent, next: c.querySelector('.fx-next').textContent, src: c.querySelector('.fx-src').textContent, time: c.querySelector('.fx-got').textContent } : null; });
    ok(!!info && info.t.length > 2, `the find's card: ${info && info.t}`);
    ok(info && /נמצא:/.test(info.meta), `its true archaeology: ${info && info.meta.slice(0, 70)}`);
    ok(info && /בחפירה:/.test(info.next), `the tease: ${info && info.next.trim().slice(0, 60)}`);
    ok(info && /טיוטה/.test(info.src), 'the source, marked טיוטה');
    ok(info && /חשפת ב־/.test(info.time), `the brush time: ${info && info.time}`);
    const snd = await pg.evaluate(() => __played);
    ok(snd.includes('brush') && snd.includes('find'), `sounds: brush ×${snd.filter((x) => x === 'brush').length}, find`);
    if (SHOTS) { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(OUT, 'dig-card.png') }); }
    await pg.click('.fx-ok');
    await pg.waitForTimeout(400);
    ok(!(await pg.$('.fx-dig')), 'closing removes the overlay');
    ok((await pg.evaluate(() => __played)).includes('emit:dig'), 'the dig is told to the game (emit "dig")');
    const after = await pg.evaluate(() => { document.getElementById('s').innerHTML = __L.ordersHTML(G, __NOW); return document.getElementById('s').textContent; });
    ok(/חפירת היום ✓/.test(after) && /מחר בחפירה/.test(after), 'the sheet: today\'s find done, tomorrow\'s site named');
    // Shabbat: the card rests, nothing to dig
    const sat = await pg.evaluate(() => { const t = new Date('2026-10-10T12:00:00+03:00').getTime(); document.getElementById('s').innerHTML = __L.ordersHTML(G, t); return { html: document.getElementById('s').textContent, btn: !!document.querySelector('[data-fun="dig"]'), badge: __L.badge(G, t) }; });
    ok(!sat.btn && /יום מנוחה/.test(sat.html), 'Shabbat: no dig, a calm line');
    if (SHOTS) await pg.screenshot({ path: path.join(OUT, 'dig-shabbat.png') });
    // #demo: the owner's reel opens the sheet; the dig plays itself once (a tap through the host's path), then closes
    await pg.evaluate(() => { window.D = { demo: true }; __L.onEvent(D, 'course', { c: 1 }, __NOW); const el = document.getElementById('s'); el.innerHTML = __L.ordersHTML(D, __NOW);
      el.onclick = (e) => { window.__dtap = __L.onTap(D, e.target, __NOW); }; });
    await pg.waitForTimeout(1600);
    ok(!(await pg.$('.fx-dig')), '#demo: a sheet opened by anything but the reel\'s album beat never plays the dig by itself (BUILD\'s e2e opens "היום")');
    await pg.evaluate(() => { __L.onEvent(D, 'demoBeat', { at: 'album' }, __NOW); document.getElementById('s').innerHTML = __L.ordersHTML(D, __NOW); });
    await pg.waitForSelector('.fx-dig.on', { timeout: 4000 }).catch(() => null);
    const dOpen = await pg.evaluate(() => !!document.querySelector('.fx-dig') && !!window.__dtap);
    await pg.waitForTimeout(7500);
    const dShut = await pg.evaluate(() => ({ gone: !document.querySelector('.fx-dig'), done: __L.digState(D, __NOW).done }));
    ok(dOpen && dShut.gone && dShut.done, `#demo: at the reel's album beat the dig plays itself and closes (${JSON.stringify(dShut)})`);
    if (SHOTS) {   // every find's art, uncovered (a contact sheet to look at)
      await pg.evaluate(() => { document.body.innerHTML = '<div id="g" style="display:grid;grid-template-columns:repeat(3,120px);gap:6px;padding:8px"></div>';
        for (const id of __L.DIG_ORDER) { const c = document.createElement('canvas'); c.width = c.height = 240; c.style.width = c.style.height = '120px'; __D.drawFind(c.getContext('2d'), __L.DIG_AT[id].art, 240, id.length * 97 + 13); document.getElementById('g').appendChild(c); } });
      await pg.screenshot({ path: path.join(OUT, 'dig-arts.png'), clip: { x: 0, y: 0, width: 390, height: 520 } });
    }
    ok(errs.length === 0, `no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
    await ctx.close();
  } finally { await b.close(); }
  console.log(fail ? `${fail} FAILED` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})();
