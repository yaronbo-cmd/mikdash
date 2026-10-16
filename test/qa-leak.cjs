// QA: does the building site look the same before and after the tour opened from Phase A (and after Phase B)?
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/qa-leak.cjs   → test/out/qa/leak-*.png + a pixel diff
// A fresh game with the wall at ~45% (ph 2), the camera on the wall: render (A). Open the tour from the Phase A menu
// path (window.__openScenes), close it, the same camera: render (B). Phase B → back to building, the same camera (C).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/qa');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game && window.__T.game.state, null, { timeout: 400000, polling: 500 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const setup = () => G(() => {
      const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); g.story.priests = 1;
      g.st.har = { done: true }; g.bh = g.bh.map(() => 0); g.st.wall = { w: 20, ph: 2 };
      while (g.crews.length < 2) g.crews.push({ at: null }); g.crews[0].at = 'wall'; g.crews[1].at = 'quarry';
      __T.game._.resync();
    });
    const cam = () => G(() => { __T.look([60, 170, 150], [-60, 10, 0]); });
    const shot = async (name) => {
      await G(() => { document.querySelectorAll('.gm-modal.on .gm-btn-gold').forEach((b) => b.click()); });
      await sleep(600);
      await cam();
      await G(() => { __T.render(); __T.render(); });
      const f = path.join(OUT, `leak-${name}.png`);
      await pg.screenshot({ path: f, timeout: 400000 });
      const st = await G(() => ({ wall: __T.stages.status ? __T.stages.status('wall') : null, sanct: __T.sanctuary && __T.sanctuary.state ? __T.sanctuary.state.room : null }));
      console.log('shot', name, JSON.stringify(st));
      return f;
    };
    await setup(); await sleep(1500);
    await shot('A-before');
    await G(() => window.__openScenes('tour', 0));
    await pg.waitForFunction(() => window.__SCENES && window.__SCENES.state.open, null, { timeout: 60000 });
    await sleep(1000);
    await G(() => window.__SCENES.close());
    await pg.waitForFunction(() => window.__T.game && window.__T.game.state && document.querySelector('.gm-rb'), null, { timeout: 60000, polling: 300 });
    await sleep(2500);
    await shot('B-after-tour');
    console.log('errors', errs);
    // pixel diff of the site region (the middle of the screen)
    try {
      const { execSync } = require('child_process');
      console.log(execSync(`python3 -c "
from PIL import Image, ImageChops, ImageStat
a=Image.open('${path.join(OUT, 'leak-A-before.png')}').convert('RGB'); b=Image.open('${path.join(OUT, 'leak-B-after-tour.png')}').convert('RGB')
box=(40,250,350,650); d=ImageChops.difference(a.crop(box),b.crop(box)); s=ImageStat.Stat(d)
print('mean abs diff in the site region (RGB):',[round(x,1) for x in s.mean], 'mean luminance A/B:', round(ImageStat.Stat(a.crop(box).convert('L')).mean[0],1), round(ImageStat.Stat(b.crop(box).convert('L')).mean[0],1))
"`, { encoding: 'utf8' }));
    } catch (e) { console.log('diff failed', String(e).slice(0, 200)); }
    await ctx.close();
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
