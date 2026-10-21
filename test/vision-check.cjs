// WORLD7 (wave 7): the opening vision end to end on the real build (no game: the default restore = the rough Mount).
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/vision-check.cjs [--out=test/out/world/vision]
// 1) __T.vision({ms: long}) → a phone shot of the first frame (the finished House, golden) → __T.visionSkip() → the end frame;
// 2) __T.vision({ms: 2500}) runs out by itself → { skipped: false }, the light back to the preset it had, the camera at `end`.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const OUT = path.resolve(ROOT, arg('out', 'test/out/world/vision')); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 })).newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__NO_GAME = true; window.__FORCE_TIME = 'noon'; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 600000, polling: 1000 });
    const shot = async (n) => { await pg.evaluate(() => { __T.render(); __T.render(); }); await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 300000 }); console.log('shot', n); };
    await pg.evaluate(() => { window.__VR = null; __T.vision({ ms: 600000 }).then((r) => { window.__VR = r; }); });
    console.log('ground at the first boulder (128, -84):', await pg.evaluate(() => __T.stages.groundAt(128, -84)));
    let s = await pg.evaluate(() => ({ on: __T.visionOn, key: __T.sky.key, calls: __T.drawCalls() }));
    ok(s.on && s.key === 'golden', `the vision runs at the golden hour (${s.key}); phone draw calls ${JSON.stringify(s.calls)}`);
    await shot('v1-house');
    await pg.evaluate(() => __T.visionSkip()); await sleep(200);
    s = await pg.evaluate(() => ({ on: __T.visionOn, key: __T.sky.key, r: window.__VR, cam: __T.camera.position.toArray().map(Math.round), veil: getComputedStyle(document.getElementById('w7-veil')).opacity }));
    ok(!s.on && s.r && s.r.skipped === true && s.key === 'noon', `skip: resolved ${JSON.stringify(s.r)}, light back to ${s.key}, camera ${s.cam}`);
    await shot('v2-end');
    await pg.evaluate(() => { window.__VR = null; __T.vision({ ms: 2500 }).then((r) => { window.__VR = r; }); });
    await pg.waitForFunction(() => window.__VR, null, { timeout: 120000, polling: 200 });
    s = await pg.evaluate(() => ({ r: window.__VR, key: __T.sky.key }));
    ok(s.r.skipped === false && s.key === 'noon', `ran out by itself: ${JSON.stringify(s.r)}, light ${s.key}`);
    ok(!errs.length, 'no page errors ' + errs.join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
