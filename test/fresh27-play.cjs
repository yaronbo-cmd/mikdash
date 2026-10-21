const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = '/home/claude/temple3d/test/out/fresh27'; fs.mkdirSync(OUT, { recursive: true });
const CMD = OUT + '/cmd.txt';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto('file:///home/claude/temple3d/dist/test.html#avodah');
  const cdp = await ctx.newCDPSession(pg);
  const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(70); await up(9); };
  const stick = async (dx, dy, ms) => { const x0 = 70, y0 = 315; await down(8, x0, y0); for (let k = 1; k <= 4; k++) { await move(8, x0 + dx * k / 4, y0 + dy * k / 4); await pg.waitForTimeout(30); } await pg.waitForTimeout(ms); await up(8); };
  const hold = async (x, y, ms) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  const T0 = Date.now(); let n = 0, lastShot = -10;
  const shot = async (w) => { const s = Math.round((Date.now() - T0) / 1000); try { await pg.screenshot({ path: `${OUT}/${String(s).padStart(3, "0")}s-${w}.png`, timeout: 90000 }); } catch (e) { console.log("shotfail"); } lastShot = s; console.log(s, 'shot', w); };
  const BTN = [740, 270];
  while ((Date.now() - T0) < 480000) {
    const s = (Date.now() - T0) / 1000;
    if (s - lastShot >= 10) await shot('auto');
    let c = null;
    try { c = fs.readFileSync(CMD, 'utf8').trim(); fs.unlinkSync(CMD); } catch (e) {}
    if (!c) { await pg.waitForTimeout(500); continue; }
    for (const line of c.split('\n')) {
      const p = line.trim().split(/\s+/); const op = p[0]; console.log(Math.round((Date.now() - T0) / 1000), 'CMD', line);
      try {
        if (op === 'tap') await tap(+p[1], +p[2]);
        else if (op === 'stick') await stick(+p[1], +p[2], +p[3] || 1500);
        else if (op === 'hold') await hold(+p[1] || BTN[0], +p[2] || BTN[1], +p[3] || 1500);
        else if (op === 'btn') await tap(BTN[0], BTN[1]);
        else if (op === 'wait') await pg.waitForTimeout(+p[1]);
        else if (op === 'shot') await shot(p[1] || 'x');
      } catch (e) { console.log('err', e.message); }
      await pg.waitForTimeout(250);
    }
    await shot('after');
  }
  await b.close(); console.log('done');
})();
