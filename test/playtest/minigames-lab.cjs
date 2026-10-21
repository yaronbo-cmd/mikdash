// (wave 6, FUN) The site's precision games in a light DOM page (no 3D world): each game plays itself (demo) at phone size,
// then the crane is played by real taps. One browser, closed in finally.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/playtest/minigames-lab.cjs [--shots]
//   → test/out/playtest/mg-<kind>-play.png, mg-<kind>-result.png (with --shots) and a one-line result per game
const { chromium } = require('playwright');
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = process.argv.includes('--shots');

const js = esbuild.buildSync({
  stdin: { contents: "export * from './src/game/minigames/index.js'; export { createAudio } from './src/game/audio.js';", resolveDir: ROOT },
  bundle: true, format: 'iife', globalName: 'MG', write: false, target: 'es2020', minify: true,
}).outputFiles[0].text;
const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>mini-games lab</title></head><body style="margin:0;height:100vh;background:linear-gradient(#7FA3C8,#E9CF9E 60%,#B89C6C)">
<script>${js}</script></body></html>`;
const PAGE = path.join(OUT, 'minigames-lab.html');
fs.writeFileSync(PAGE, html);
console.log(`bundle ${(js.length / 1024).toFixed(1)} KB (minified: the games + audio)`);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let fails = 0;
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto('file://' + PAGE);
    for (const kind of ['crane', 'dress', 'plumb', 'whole', 'quarry']) {
      await pg.evaluate((k) => { window.__R = null; window.MG.runMinigame(k, { demo: true, seed: 5, level: 1, sfx: window.MG.createAudio({}) }).then((r) => { window.__R = r; }); }, kind);
      await pg.waitForTimeout(2600);
      if (SHOTS) await pg.screenshot({ path: path.join(OUT, `mg-${kind}-play.png`) });
      if (SHOTS && kind === 'quarry') { await pg.waitForTimeout(3600); await pg.screenshot({ path: path.join(OUT, 'mg-quarry-wedges.png') }); }
      await pg.waitForSelector('.fx-mg.done', { timeout: 60000 });
      await pg.waitForTimeout(250);
      if (SHOTS) await pg.screenshot({ path: path.join(OUT, `mg-${kind}-result.png`) });
      await pg.waitForFunction(() => window.__R, null, { timeout: 10000 });
      const r = await pg.evaluate(() => window.__R);
      const ok = r.ok && !r.skipped && r.quality > 0.7 && r.ms < 60000;
      if (!ok) fails++;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${kind.padEnd(6)} demo: quality ${r.quality} tier ${r.tier} perfect ${r.perfect} score ${r.score} in ${(r.ms / 1000).toFixed(1)} s`);
      await pg.waitForTimeout(400);
    }
    // BUILD's Hebrew label for the Mount's great stone reaches the crane's variant (one heavy, windy stone)
    await pg.evaluate(() => { window.__R = null; window.MG.runMinigame('crane', { demo: true, seed: 3, level: 1, what: 'אבן גדולה' }).then((r) => { window.__R = r; }); });
    await pg.waitForTimeout(2200);
    if (SHOTS) await pg.screenshot({ path: path.join(OUT, 'mg-crane-great.png') });
    const kick = await pg.evaluate(() => (document.querySelector('.fx-mg') || {}).textContent || '');
    await pg.waitForFunction(() => window.__R, null, { timeout: 60000 });
    const okG = /האבן הגדולה/.test(kick); if (!okG) fails++;
    console.log(`${okG ? 'ok  ' : 'FAIL'} crane great stone from BUILD's label ('אבן גדולה'): the kicker says האבן הגדולה`);
    await pg.waitForTimeout(400);
    // real taps: the crane, tapped every 0.9 s on the canvas, then "המשך"
    await pg.evaluate(() => { window.__R = null; window.MG.runMinigame('crane', { seed: 9, level: 0, best: 50 }).then((r) => { window.__R = r; }); });
    await pg.waitForSelector('.fx-mg canvas');
    // (wave 8B) a first-time player meets the how-to over the canvas: the first tap closes it (then the stone swings)
    const playThrough = async () => { for (let i = 0; i < 40 && !(await pg.$('.fx-mg.done')); i++) { await pg.waitForTimeout(900); await pg.tap((await pg.$('.fx-mg-how:not([hidden])')) ? '.fx-mg-how' : '.fx-mg canvas', { timeout: 3000 }).catch(() => {}); } };
    await playThrough();
    await pg.click('.fx-again');                 // mastery: the same stone again; the best try is kept
    await pg.waitForTimeout(300);
    await playThrough();
    if (SHOTS) await pg.screenshot({ path: path.join(OUT, 'mg-crane-replay.png') });
    await pg.click('.fx-go');
    await pg.waitForFunction(() => window.__R, null, { timeout: 5000 });
    const r = await pg.evaluate(() => window.__R);
    const left = await pg.evaluate(() => document.querySelectorAll('.fx-mg').length);
    const ok = r.ok && !r.skipped && r.score > 0 && r.tries === 2;
    if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} crane by taps, replayed once (tries ${r.tries}): quality ${r.quality} tier ${r.tier} score ${r.score} isPB ${r.isPB} in ${(r.ms / 1000).toFixed(1)} s; sheets left ${left}`);
    if (errs.length) { fails++; console.log('page errors:', errs.slice(0, 3)); }
  } finally { await b.close(); }
  console.log(fails ? `${fails} FAILED` : 'all ok');
  process.exitCode = fails ? 1 : 0;
})();
