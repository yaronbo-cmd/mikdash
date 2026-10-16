// TAMIDB23 real touch at 844×390 on dist/test.html#avodah: each of the six works (g-ketoret, g-birkat, g-shir, g-erev, g-neirot, g-shir2)
// starts from its marker by the right button at its hour (clock.skipTo), taps alone finish it in ≤ 60 s, the points go in, the mentor line
// comes after the end with its source and "טיוטה", no red in the stage's props, the player never passes the ההיכל's door, no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/tamidb23-touch.cjs [--no-build] [--shots] [--only=g-birkat]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/tamidb23');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const HOUR = { 'g-ketoret': 6.9, 'g-birkat': 7.15, 'g-shir': 7.3, 'g-erev': 14.6, 'g-neirot': 15.55, 'g-shir2': 15.8 };
const IDS = Object.keys(HOUR).filter((i) => !ONLY.length || ONLY.includes(i));
const DOOR_X = -92;   // places.js HEICHAL_DOOR.x1: the אמרכל stays east of it (x > −92)
const NAME = new RegExp(['\u05D4\u05F3', '\u05D0\u05DC\u05E7\u05D9\u05DD', '\u05D0\u002D\u05DC'].join('|'));
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/tamidb23/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await G(() => { window.__TB_PTS = {}; const T = __DAY.tasks, d0 = T.done.bind(T); T.done = (id, q) => { const p = d0(id, q); window.__TB_PTS[id] = p; return p; }; });
    await pg.waitForTimeout(800);
    for (const id of IDS) {
      const tag = `[${id}]`;
      await G((h) => { __DAY.clock.skipTo(h); __DAY.D.refresh && __DAY.D.refresh(); }, HOUR[id]); await pg.waitForTimeout(1200);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; }, id);   // (only this errand's marker wakes the button)
      const place = await G((id) => { __DAY.tasks.force(id); const k = __DAY.tasks.get(id); return k && k.state === 'open' && k.place; }, id);
      check(`${tag} the task is open at its hour, with a place`, !!place, place);
      await G((p) => __DAY.teleport(p), place); await pg.waitForTimeout(1600);
      const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes at the marker`, awake);
      await shot(`${id}-0marker`);
      const bc = await btnC(); let n = 0, started = false, reds = 0, bad = 0, bn = 0, minX = 1e9, t0 = Date.now(), tWork = 0, names = '';
      while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 < 120000) {
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++; await pg.waitForTimeout(430);
        const st = await G(() => { const k = __W22.kit(); let hx = null; try { const h = __TWIN.probe().h; hx = h ? h[0] : null; } catch (e) { /* */ } const bl = k && k.bloodCheck ? k.bloodCheck() : null; return { reds: k ? k.reds() : 0, bad: bl ? bl.untagged + bl.nearFig + bl.floor : 0, bn: bl ? bl.n : 0, on: k ? k.F.on : false, hx, txt: [...document.querySelectorAll('.dy-line,.dy-say,.tw-btn')].map((e) => e.textContent).join(' ') }; });
        reds = Math.max(reds, st.reds); bad = Math.max(bad, st.bad || 0); bn = Math.max(bn, st.bn || 0); if (st.hx != null) minX = Math.min(minX, st.hx); if (!tWork && st.on) tWork = Date.now(); names += st.txt;
        if (!started && n === 4) { started = true; await shot(`${id}-1mid`); }
        if (SHOTS && n === 9) await shot(`${id}-2late`);
      }
      const secs = (Date.now() - (tWork || t0)) / 1000;
      const done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} taps alone finish it in ≤ 60 s; the task is done`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      const pts = await G((id) => window.__TB_PTS[id] | 0, id);
      check(`${tag} the points go in`, pts > 0, `+${pts}`);
      check(`${tag} reds ⊆ BLOOD, only at their places`, reds === 0 && bad === 0, `forbidden reds ${reds}, palette pieces ${bn}, misplaced ${bad}`);   // ── blooda25 ── (DAM25 §4.4)
      await shot(`${id}-3end`);
      const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
      check(`${tag} the mentor line after the end, with a source and טיוטה`, /טיוטה/.test(line) && /[א-ת]+ [א-ת]{1,2}, /.test(line), line.slice(0, 110));
      check(`${tag} no Name on screen`, !NAME.test(line + names));
      const hx = await G(() => { try { const h = __TWIN.probe().h; return h ? h[0] : null; } catch (e) { return null; } });
      const xs = [minX, hx].filter((v) => Number.isFinite(v));
      check(`${tag} the player never passes the ההיכל's door (x > ${DOOR_X})`, xs.every((x) => x > DOOR_X), 'x ' + xs.map((x) => x.toFixed(1)).join(' '));
      await pg.waitForTimeout(2800);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
