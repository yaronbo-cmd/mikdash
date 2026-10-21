// recovery R1: load one game page in headless Chromium (SwiftShader), let it run, screenshot it, report errors and a few globals.
// Run ONLY through the queue:  /home/claude/wt/bus/brun node recovery/tools/shot-r1.cjs <html> <out.png> [waitSec=90] [W=844] [H=390] [steps]
// steps (optional, after the first shot): "click:<visible text>;clickx:<exact text>;tap:<css selector>;wait:<s>;shot:<file.png>;eval:<js>;text:;…"
// env R1_PRESET=1: start with a returning player's Phase B save (name, mishmar, intro seen — as test/fable32-touch.cjs does),
// so a page opens on the shift's home screen instead of the name card
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [file, out, waitS = '90', W = '844', H = '390', steps = ''] = process.argv.slice(2);
  if (!file || !out) { console.error('usage: shot-r1.cjs <html> <out.png> [waitSec] [W] [H]'); process.exit(2); }
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (process.env.R1_PRESET) await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('r1')) { sessionStorage.setItem('r1', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } });
  const pg = await ctx.newPage();
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + String(e.message).slice(0, 300)));
  console.log('load', file, el());
  await pg.goto('file://' + path.resolve(file), { waitUntil: 'load', timeout: 180000 });
  console.log('loaded', el());
  let booted = false;
  try { await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 2000 }); booted = true; } catch (e) { console.log('no __T.booted within 240 s'); }
  console.log('booted', booted, el());
  await pg.waitForTimeout(+waitS * 1000);
  const info = await pg.evaluate(() => ({
    hash: location.hash, title: document.title,
    bodyClass: document.body.className.slice(0, 200),
    canvases: document.querySelectorAll('canvas').length,
    force: !!globalThis.__FORCE_SHIFT,
    tKeys: window.__T ? Object.keys(window.__T).slice(0, 60).join(',') : null,
    visibleText: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400),
  }));
  console.log('info', JSON.stringify(info));
  await pg.screenshot({ path: out, timeout: 240000 });
  console.log('shot', out, el());
  for (const st of steps.split(';').filter(Boolean)) {
    const i = st.indexOf(':'), k = st.slice(0, i), v = st.slice(i + 1);
    try {
      if (k === 'click' || k === 'clickx') { await pg.getByText(v, { exact: k === 'clickx' }).first().click({ timeout: 90000, force: true }); console.log('clicked', v, el()); }
      else if (k === 'tap') { await pg.click(v, { timeout: 90000, force: true }); console.log('tapped', v, el()); }
      else if (k === 'wait') { await pg.waitForTimeout(+v * 1000); console.log('waited', v, el()); }
      else if (k === 'eval') { console.log('eval', JSON.stringify(await pg.evaluate(v)).slice(0, 600), el()); }
      else if (k === 'text') { console.log('text', (await pg.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600))), el()); }
      else if (k === 'shot') { await pg.screenshot({ path: v, timeout: 240000 }); console.log('shot', v, el()); }
    } catch (e) { console.log('step failed', st, String(e.message).slice(0, 200)); }
  }
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g|net::ERR/.test(l));
  console.log(bad.length ? 'errors:\n' + bad.slice(0, 30).join('\n') : 'no errors');
  await b.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
