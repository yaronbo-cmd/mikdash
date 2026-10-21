// STAGES21: a one-off page probe — node test/stages21-probe.cjs <site[,site2]> <file.js> [--shot=name]: puts the fixture (the stages before it done) at the stage, then runs the file as the body of an async function(site) in the page and prints what it returns. Through the bus: /home/claude/wt/bus/brun node test/stages21-probe.cjs ...
// usage: node probe.cjs <site> <jsfile> [--shot=name]  (JS file: body of an async function(site) run in page after the fixture; its return value printed)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const site = process.argv[2], code = fs.readFileSync(process.argv[3], 'utf8'); const SH = (process.argv.find((a) => a.startsWith('--shot=')) || '').slice(7);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('PAGEERR', e.message)); pg.on('console', (m) => { if (m.text().startsWith('PROBE')) console.log(m.text()); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) {} });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { timeout: 15000 }).catch(() => {});
  await pg.evaluate(() => { const c = document.querySelector('.gm-cine'); if (c) c.click(); });
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, { timeout: 12000 }).catch(() => {});
  await pg.waitForTimeout(600);
  for (const site1 of site.split(',')) {
  await pg.evaluate((site) => {
    const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
    for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
    g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
    g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
    g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
    __T.game._.resync();
  }, site1);
  await pg.waitForFunction(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, { timeout: 15000 }).catch(() => console.log('twin not on'));
  await pg.waitForTimeout(site1 === site.split(',').slice(-1)[0] ? 2500 : 4000);
  for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; await m.click().catch(() => {}); await pg.waitForTimeout(450); }
  }
  const AF = Object.getPrototypeOf(async function () {}).constructor;
  const out = await pg.evaluate(new AF('site', code), site.split(',').slice(-1)[0]).catch((e) => 'ERR ' + e.message);
  console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
  if (SH) { await pg.evaluate(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(ROOT, 'test/out/stages21', SH + '.png'), timeout: 240000 }); console.log('shot', SH); }
  await b.close();
})();
