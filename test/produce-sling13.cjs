// PRODUCER13a (wave 13): "הקלע של דוד" levels 6–10 by REAL touch drags at 390×844 — is sling-touch's level-6 failure ("the aim finds
// no line to the last target") the test or the level? The lab page is sling-touch.cjs's (src/games with the real audio kit and a
// stand-in game api); the level is reached by the saved progress as sling-touch does (games.sling.lv = want). The hand, per stone:
// the game's own solver (__g10.aimAt) for each standing target, flat then high; when it finds no line for ANY standing target, a
// child's pulls: full-strength drags at 30°…60° and a half pull, one per stone (logged "no-line"). Each level to its result card.
//   NODE_PATH=… node test/produce-sling13.cjs [--levels=6,7,8,9,10]      shots: test/out/produce/sl13-*.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const LV = ((process.argv.find((a) => a.startsWith('--levels=')) || '--levels=6,7,8,9,10').slice(9)).split(',').map(Number);
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
const entry = `
import * as GM from './src/games/index.js';
import { createAudio } from './src/game/audio.js';
const sfx = createAudio({});
const G = { res: { stone: 0, cedar: 0, gold: 0, silver: 0, bronze: 0, wstone: 0 }, ftue: 99 };
window.GM = GM; window.__G = G; window.__LOG = [];
const api = { state: G, sfx, log: window.__LOG, busy: false, whole: false, save: () => {}, ui: { root: document.body, flashRes() {}, refresh() {}, toast() {}, modal() { return Promise.resolve(false); } } };
GM.bindHost({ game: () => api, pause: () => {} });
`;
const js = esbuild.buildSync({ stdin: { contents: entry, resolveDir: ROOT }, bundle: true, format: 'iife', write: false, target: 'es2020', minify: true, charset: 'utf8' }).outputFiles[0].text;
const PAGE = path.join(OUT, 'sl13-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>sling</title></head><body style="margin:0;height:100vh;background:#7FA3C8"><script>${js}</script></body></html>`);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  const E = (fn, a) => pg.evaluate(fn, a);
  const tapSel = async (sel) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); const bb = await l.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; };
  const cdp = await ctx.newCDPSession(pg);
  const drag = async (a, z) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] }); for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((z.x - a.x) * k) / 8, y: a.y + ((z.y - a.y) * k) / 8 }] }); await pg.waitForTimeout(24); } await pg.waitForTimeout(80); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const st = () => E(() => { const e = document.querySelector('.g10-sling'); return e && e.__g10 ? e.__g10.state() : null; });
  const out = [];
  await pg.goto('file://' + PAGE);
  for (const want of LV) {
    if (await E(() => !!document.querySelector('.g10-result button[data-v="close"]'))) { await tapSel('.g10-result button[data-v="close"]'); await pg.waitForFunction(() => window.__R !== null || !document.querySelector('.g10'), null, { timeout: 8000 }).catch(() => {}); await pg.waitForTimeout(600); }
    await E((w) => { window.__G.games = window.__G.games || {}; window.__G.games.sling = { lv: w, best: {} }; window.__R = null; window.GM.openGames({ game: 'sling' }).then((r) => { window.__R = r; }); }, want);
    await pg.waitForFunction(() => !!document.querySelector('.g10-howto .g10-card, .g10-sling'), null, { timeout: 10000 }).catch(() => {});
    if (await E(() => !!document.querySelector('.g10-howto button[data-v="solo"]'))) await tapSel('.g10-howto button[data-v="solo"]');
    await pg.waitForFunction(() => { const e = document.querySelector('.g10-sling'); return e && e.__g10 && e.__g10.state().ready; }, null, { timeout: 10000 }).catch(() => {});
    const s0 = await st();
    await pg.screenshot({ path: path.join(OUT, `sl13-L${want}-open.png`) });
    const rec = { level: want, name: s0 && s0.name, targets: s0 && s0.targets, shots: [] };
    const t0 = Date.now(); let n = 0, fb = 0;
    while (Date.now() - t0 < 100000) {
      if (await E(() => !!document.querySelector('.g10-result'))) break;
      const s = await st(); if (!s) break;
      if (s.over) { await pg.waitForTimeout(300); continue; }
      if (!s.ready || s.flying) { await pg.waitForTimeout(200); continue; }
      let aim = null, how = '';
      for (let i = 0; i < s.aims.length && !aim; i++) { if (!s.aims[i]) continue; for (const lob of [false, true]) { const d = await E(([k, l]) => document.querySelector('.g10-sling').__g10.aimAt(k, l), [i, lob]); if (d) { aim = d; how = `solver t${i}${lob ? ' high' : ''}`; break; } } }
      let a = { x: 300, y: 640 }, z;
      if (aim) { const err = [0.97, 1.03, 1.0, 0.98, 1.02][n % 5]; z = { x: a.x + (aim.to.x - aim.from.x) * err, y: a.y + (aim.to.y - aim.from.y) * err }; }
      else { const ang = [45, 30, 60, 38, 52][fb % 5] * Math.PI / 180, L = fb % 5 === 4 ? 70 : 150; z = { x: a.x + Math.cos(ang) * L, y: a.y + Math.sin(ang) * L }; a = { x: 250, y: 560 }; z = { x: 250 + Math.cos(ang) * L, y: 560 + Math.sin(ang) * L }; how = `no-line: a child's pull ${Math.round(ang * 180 / Math.PI)}° ${L}px`; fb++; }
      await drag(a, z); n++;
      if (n === 1) { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(OUT, `sl13-L${want}-flight.png`) }); }
      await pg.waitForFunction(() => { const e = document.querySelector('.g10-sling'); const x = e && e.__g10 && e.__g10.state(); return !x || x.over || (!x.flying && x.ready) || document.querySelector('.g10-result'); }, null, { polling: 200, timeout: 9000 }).catch(() => {});
      const s1 = await st();
      rec.shots.push({ n, how, down: s1 ? s1.down : null, of: s1 ? s1.targets : null, left: s1 ? s1.stones : null, aims: s.aims.map((p) => (p ? 1 : 0)).join('') });
      console.log(`L${want} "${rec.name}" stone ${n}: ${how} → down ${s1 && s1.down}/${s1 && s1.targets} · stones left ${s1 && s1.stones}${s1 && s1.over ? (s1.won ? ' · WON' : ' · over') : ''}`);
    }
    const res = await E(() => { const r = document.querySelector('.g10-result'); return r ? r.innerText.replace(/\s+/g, ' ').trim().slice(0, 220) : null; });
    const s2 = await st(); rec.result = res; rec.won = !!(s2 && s2.won) || /ניצחת|כל ה|נפל/.test(res || ''); rec.down = s2 && s2.down;
    await pg.screenshot({ path: path.join(OUT, `sl13-L${want}-end.png`) });
    console.log(`LEVEL ${want}: ${JSON.stringify({ name: rec.name, targets: rec.targets, stones: n, down: rec.down, won: s2 && s2.won, noLine: rec.shots.filter((x) => /no-line/.test(x.how)).length, result: res })}`);
    out.push(rec);
  }
  fs.writeFileSync(path.join(OUT, 'sl13-log.json'), JSON.stringify({ out, errs }, null, 1));
  console.log(errs.length ? 'PAGE ERRORS ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
