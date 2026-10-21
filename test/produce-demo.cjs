// PRODUCER10: the demo (#demo) as the owner shows it, and two of v19's fixes checked by eye — by real touch at 390×844.
//   node test/produce-demo.cjs [--url=file:///…/dist/test.html] [--tag=dem] [--beats=4]
// 1. a fresh #demo: the strip's chips measured (44 px?) · 2. ☰ → "המקדש כולו" (the whole House): does the plaza stay (v19 fix 1)?
// shots at +3/+10/+18 s while the crews' stones keep syncing · 3. "דלג לפרק הבא": the chapter's end — the gold showcase and the
// card, sampled every 2.5 s (v19 fix 2: "יותר מדי אור צהוב") · 4. "הרגע הבא ✦" × N beats, a shot after each.
// Each shot's mean light (lum) and yellow index ((R+G)/2 − B over the world area) is logged. State read, never written.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
let sharp = null; try { sharp = require('sharp'); } catch (e) { sharp = null; }
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'dem', URL0 = (A.url || 'file://' + path.join(ROOT, 'dist/test.html')) + '#demo', BEATS = +(A.beats || 4);
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 160)); });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; });
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    const E = (fn, a) => pg.evaluate(fn, a); const wait = (ms) => pg.waitForTimeout(ms); let n = 0;
    const light = async (f) => { if (!sharp) return ''; try { const { channels } = await sharp(f).extract({ left: 0, top: 110, width: W, height: 560 }).stats(); const [r, g, bb] = channels.map((c) => c.mean); return `lum${Math.round(0.2126 * r + 0.7152 * g + 0.0722 * bb)} yel${Math.round((r + g) / 2 - bb)}`; } catch (e) { return ''; } };
    const shot = async (name) => {
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); await E(() => { window.__HUD_HOLD = false; });
      const t = await E(() => { const q = (s) => { const x = document.querySelector(s); return x && x.offsetParent ? x.innerText.replace(/\s+/g, ' ').trim().slice(0, 70) : ''; }; return { pill: q('.gm-pill'), card: q('.gm-modal.on .gm-card'), toast: q('.gm-toasts .gm-toast:last-child') }; });
      note(`SHOT ${path.relative(ROOT, f)} ${await light(f)} ${JSON.stringify(t)}`); return f;
    };
    const tapSel = async (sel, text, why) => {
      const r = await E(([s, t]) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0 && (!t || new RegExp(t).test(x.textContent))); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, w: Math.round(q.width), h: Math.round(q.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) }; }, [sel, text || null]);
      if (!r) { note(`(no ${why || sel})`); return null; } await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); }); await pg.touchscreen.tap(r.x, r.y); note(`tap ${why || sel} "${r.t}" [${r.w}×${r.h}]${r.h < 44 ? ' ⚠ <44px' : ''}`); return r;
    };
    const cards = async () => { for (let k = 0; k < 4; k++) { if (!(await E(() => !!document.querySelector('.gm-modal.on .gm-btn-gold')))) return; await tapSel('.gm-modal.on .gm-btn-gold', null, 'card'); await wait(900); } };
    await wait(9000);   // the demo opens on the vision like a new game
    const chips = await E(() => [...document.querySelectorAll('.gm-demo button')].map((x) => { const q = x.getBoundingClientRect(); return `${x.textContent.trim()} ${Math.round(q.width)}×${Math.round(q.height)}`; }));
    note(`demo chips: ${JSON.stringify(chips)}`);
    await shot('start');
    // 2. the whole House
    await tapSel('.gm-rb[data-k="menu"]', null, '☰'); await wait(1000);
    await tapSel('[data-a="whole"]', null, 'the whole House');
    for (const at of [3, 10, 18]) { await wait(at === 3 ? 3000 : (at === 10 ? 7000 : 8000)); await shot(`whole-${at}s`); }
    await tapSel('[data-a="exitWhole"]', null, 'חזרה למשחק'); await wait(2500); await cards();
    // 3. the chapter's end
    await tapSel('.gm-demo [data-a="pickStage"]', null, 'שלבים ▾'); await wait(900);
    await tapSel('.gm-modal.on .gm-btn-gold', null, 'לשלב הבא');   // (supervisor, 30.9: the demo moves one stage at a time)
    for (let k = 0; k < 7; k++) { await wait(2500); await shot(`chapter-${Math.round((k + 1) * 2.5)}s`); if (k >= 3 && await E(() => !!document.querySelector('.gm-modal.on'))) break; }
    await cards(); await wait(2000); await shot('after-chapter');
    // 4. the reel
    for (let k = 0; k < BEATS; k++) {
      await cards();
      if (!(await tapSel('.gm-hl', null, `הרגע הבא ✦ #${k + 1}`))) break;
      await wait(14000); await cards(); await shot(`beat${k + 1}`);
    }
    note(`errors ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
  } catch (e) { console.error('RUN ERROR', e.message); }
  finally { await b.close(); }
})();
