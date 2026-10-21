// PRODUCER12 (wave 12, the owner's note 3: "ותמיד גשום בערב… לא כל לילה ירד גשם"): the night sky by the Hebrew date, as a returning
// player sees it. For each date: a phone (390×844, touch, he-IL) on WORLD12's date hook (window.__FORCE_DATE = the civil evening,
// __FORCE_TIME = 'night'); a player's save written once (the Mount at a third, past the first-time flow), then a reload (the owner
// opening his game that evening); shots at +3 s and +9 s; the weather's own answer (__BH_WEATHER.night()), the music's state
// (__BH_MUSIC.get()), the words of any card on screen (the story card "גשם רק בלילה" on the first rainy night). Then the same
// evening reopened (a reload must never flip the rain), and one rainy date at noon (rain only at night).
//   node test/produce-rain.cjs --url=file:///…/dist/test.html --tag=r1 [--dates=2026-09-27,2026-10-20,2026-12-10,2027-04-26]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { sharp = null; }
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/produce');
fs.mkdirSync(OUT, { recursive: true });
const URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html'), TAG = A.tag || 'rain';
// the civil evenings: 17 Tishrei (Sukkot) · 10 Cheshvan · 1 Tevet · 20 Nisan, 5787 (a night takes the Hebrew date that begins at its sunset)
const DATES = String(A.dates || '2026-09-27,2026-10-20,2026-12-10,2027-04-26').split(',');
const T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'] });
  const rows = [];
  let n = 0;
  const one = async (date, time, label, again) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript((o) => { window.__FORCE_Q = 'normal'; window.__FORCE_DATE = o.date; window.__FORCE_TIME = o.time; window.__NO_OPENING = true; window.__GAME_LOG = []; window.__START_PAUSED = true; }, { date, time });   // (the loop paused; the world advanced by __T.simulate and drawn per shot)
    const E = (fn, a) => pg.evaluate(fn, a);
    const boot = async () => { await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 }); await pg.evaluate(() => { try { __T.simulate(true); } catch (e) { /* */ } }); };
    await pg.goto(URL0); await boot();
    // a returning player's save, written once: past the first-time flow, the Mount a third done
    await E(() => { const g = __T.game.state; g.ftue = 99; g.name = g.name || 'אהרן'; g.bh = g.bh.map(() => 0); g.harAcc = 1; g.st.har = { w: 0.3 * 24, ph: 1 }; g.focus = 'har'; __T.game._.resync(); __T.game.save(); });
    const shots = [];
    for (let k = 0; k < (again ? 2 : 1); k++) {
      await pg.reload(); await boot();
      for (const at of (A.late === '0' ? [5000] : [3000, 9000])) {
        await pg.waitForTimeout(at === 9000 ? 6000 : at);
        const info = await E(() => {
          const W = globalThis.__BH_WEATHER, M = globalThis.__BH_MUSIC;
          let night = null, mus = null; try { night = W && W.night ? W.night() : null; } catch (e) { night = 'ERR ' + e.message; } try { mus = M && M.get ? M.get() : null; } catch (e) { mus = 'ERR ' + e.message; }
          const card = document.querySelector('.gm-modal.on .gm-card'); const toast = [...document.querySelectorAll('.gm-toasts .gm-toast')].map((x) => x.innerText.replace(/\s+/g, ' ').trim()).pop() || '';
          const life = __T.life; const rain = life && (life.rain !== undefined ? life.rain : null);
          return { night, music: mus && typeof mus === 'object' ? { state: mus.state, bpm: mus.bpm, intensity: mus.intensity, on: mus.on } : mus, card: card ? card.innerText.replace(/\s+/g, ' ').slice(0, 220) : '', toast, time: __T.game && __T.game.timeOf ? __T.game.timeOf() : null, log: window.__GAME_LOG.filter((e) => /rain|weather|story/.test(e.type)).slice(-4) };
        });
        const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${label}${again ? `-open${k + 1}` : ''}-${at / 1000}s.png`);
        await E(() => { try { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); } catch (e) { /* */ } });
        await pg.screenshot({ path: f, timeout: 120000 });
        await E(() => { window.__HUD_HOLD = false; });
        let L = null; if (sharp) { try { const { channels } = await sharp(f).extract({ left: 0, top: 110, width: 390, height: 560 }).stats(); const [r, g, bb] = channels.map((c) => c.mean); L = { lum: Math.round(0.2126 * r + 0.7152 * g + 0.0722 * bb), blue: Math.round(bb - (r + g) / 2) }; } catch (e) { L = null; } }
        const row = { t: sec(), date, time, label, open: k + 1, at, f: path.relative(ROOT, f), ...info, light: L, errs: errs.slice(0, 2) };
        rows.push(row); console.log(`${String(sec()).padStart(4)}s ${label}${again ? ' open' + (k + 1) : ''} +${at / 1000}s · ${JSON.stringify({ night: info.night, music: info.music, card: info.card.slice(0, 90), toast: info.toast.slice(0, 60), light: L })}`);
        if (info.card && at <= 5000) shots.push(f);
      }
    }
    await ctx.close();
  };
  try {
    for (const d of DATES) await one(d, 'night', `night-${d}`, false);
    if (A.again !== '0') await one(DATES[2] || DATES[0], 'night', `again-${DATES[2] || DATES[0]}`, true);   // the same evening twice: never flips
    if (A.noon !== '0') await one(DATES[2] || DATES[0], 'noon', `noon-${DATES[2] || DATES[0]}`, false);   // a winter date by day: dry
  } catch (e) { console.error('RUN ERROR', e.message); }
  fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(rows, null, 1));
  await b.close();
})();
