// (seed for PRODUCER10, from the supervisor's v19 replay) node test/produce-courses.cjs [url] [tag] [until-stone]; WV=1 also shoots the
// walls' own frame at every off-screen moment. The owner, 28.9 21:42–21:57: in the Mount's courses (1, 2, 5) the builder vanishes / stands far off, stuck; the arrow is elsewhere;
// the dressed stone hangs in the air. Play the courses by real touch on the pointer from the first stone into course 2 and look.
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.resolve(__dirname, 'out/produce');
require('fs').mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || 'file://' + path.resolve(__dirname, '../dist/test.html'), tag = process.argv[3] || 'new', UNTIL = +(process.argv[4] || 40);
const W = 390, H = 844;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__MG_AUTO = true; });
    await pg.goto(url);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(x, y);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    // the courses from their first stone, as after the dig (a named player, materials in hand)
    await G(() => { const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 0 }); g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; __T.game._.resync(); });
    await pg.waitForTimeout(2500);
    // (debug) who moves the camera: wrap the flights and record the caller chain
    await G(() => {
      window.__CAM = [];
      const rec = (what) => { const st = (new Error().stack || '').split('\n').slice(2, 7).map((l) => (l.match(/at (\S+)/) || [])[1] || '?').join('<'); window.__CAM.push({ t: Math.round(performance.now() / 100) / 10, what, st, set: __T.game.state.st.har.set }); };
      const f0 = __T.flyToPos; __T.flyToPos = function (...a) { rec('flyToPos'); return f0.apply(this, a); };
      if (__T.view && __T.view.lookAt) { const l0 = __T.view.lookAt; __T.view.lookAt = function (...a) { rec('lookAt'); return l0.apply(this, a); }; }
      const S = __T.stages; if (S.focus) { const fo = S.focus; S.focus = function (...a) { rec('focus:' + a[0]); return fo.apply(this, a); }; }
    });
    let n = 0;
    const shot = async (name) => {
      const info = await G(() => {
        __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true);
        const P = __T.stages.hero.position.clone(), head = P.clone(); head.y += 1.7; const v = head.clone().project(__T.camera);
        const m = document.querySelector('.gm-mark'), mt = m && m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/);
        const pill = (document.querySelector('.gm-pill') || {}).textContent || '', goal = (document.querySelector('.gm-goal') || document.querySelector('.gm-obj') || {}).textContent || '';
        const L = window.__GAME_LOG.filter((e) => e.type === 'mark').pop();
        const cam = __T.camera.position;
        const ws = __T.stages.workSpot('har', 'dress'), wv = __T.stages.wallView ? __T.stages.wallView('har') : null, hh = __T.game._.hero;
        const dbg = { ws: ws ? [Math.round(ws.x), Math.round(ws.y), Math.round(ws.z)] : null, wst: ws && ws.stone ? [Math.round(ws.stone.x), Math.round(ws.stone.y), Math.round(ws.stone.z)] : null, wvT: wv ? wv.t.map(Math.round) : null, at: hh.at, atXZ: hh.atXZ ? hh.atXZ.map(Math.round) : null, busy: hh.busy, ret: window.__GAME_LOG.filter((e) => e.type === 'heroReturn').length, aim: window.__GAME_LOG.filter((e) => e.type === 'heroAim').length };
        return { dbg, set: __T.game.state.st.har.set, p: __T.game.state.st.har.p, hero: [P.x, P.y, P.z].map((q) => Math.round(q)), heroScr: [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight), v.z < 1 ? 'front' : 'behind'], dist: Math.round(cam.distanceTo(P)), mark: m && !m.classList.contains('gm-hidden') && mt ? [Math.round(+mt[1]), Math.round(+mt[2])] : null, markAt: L && L.d ? JSON.stringify(L.d).slice(0, 80) : '', pill: pill.trim().slice(0, 40), goal: goal.trim().slice(0, 60) };
      });
      if (/^off/.test(name)) console.log('   cam:', JSON.stringify(await G(() => window.__CAM.slice(-4))));
      const f = `${OUT}/${tag}-${String(++n).padStart(2, '0')}-${name}.png`;
      await pg.screenshot({ path: f });
      if (/^off/.test(name) && process.env.WV) {
        // (debug) the same moment from the walls' own frame (wallView): is the builder in it?
        const cam0 = await G(() => ({ p: __T.camera.position.toArray(), t: __T.controls.target.toArray() }));
        const wv = await G(() => { const v = __T.stages.wallView('har'); if (!v) return null; __T.simulate(false); __T.look(v.p, v.t); __T.render(); __T.render(); const P = __T.stages.hero.position.clone(); P.y += 1.7; const q = P.project(__T.camera); return { p: v.p.map(Math.round), t: v.t.map(Math.round), blocked: v.blocked, hero: [Math.round((q.x + 1) / 2 * innerWidth), Math.round((1 - q.y) / 2 * innerHeight)] }; });
        console.log('   wallView:', JSON.stringify(wv), 'camera was', JSON.stringify({ p: cam0.p.map(Math.round), t: cam0.t.map(Math.round) }));
        await pg.screenshot({ path: f.replace('.png', '-wv.png') });
        await G((c) => { __T.look(c.p, c.t); __T.simulate(true); }, cam0);
      }
      await G(() => { window.__HUD_HOLD = false; });
      console.log(tag, name, Math.round((Date.now() - T0) / 1000) + 's', JSON.stringify(info));
      return info;
    };
    await shot('start');
    // play: tap the pointer; a precision game or a card → tap its target (as the touch test does)
    const target = () => G(() => {
      const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
      const go = [...document.querySelectorAll('.fx-mg button')].find((x) => vis(x) && /המשך|✓|שלמה/.test(x.textContent)) || [...document.querySelectorAll('.gm-modal.on .gm-btn-gold')].find(vis) || [...document.querySelectorAll('.fx-mg canvas')].find(vis);
      if (!go) return null; const r = go.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, what: go.tagName + ':' + (go.textContent || '').trim().slice(0, 12) };
    });
    let lastSet = -1, stuck = 0, shotsAt = new Set([1, 2, 17, 18, 31, 32, 33, 34, 36, 40, 44]), offLog = [];
    for (let k = 0; k < 400 && Date.now() - T0 < 1300 * 1000; k++) {
      const set = await G(() => __T.game.state.st.har.set);
      if (set >= UNTIL) break;
      if (set !== lastSet) { if (shotsAt.has(set)) await shot('set' + set); lastSet = set; stuck = 0; } else stuck++;
      if (stuck === 25) await shot('stuck' + set);
      const hv = await G(() => { if (__T.game.busy || __T.game._.hero.busy) return null; __T.render(); const P = __T.stages.hero.position.clone(); P.y += 1.7; const v = P.project(__T.camera); const x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight; return { x: Math.round(x), y: Math.round(y), on: v.z < 1 && x > 0 && x < innerWidth && y > 80 && y < innerHeight - 100, set: __T.game.state.st.har.set }; });
      if (hv && !hv.on) { offLog.push(`s${hv.set}@${hv.x},${hv.y}`); if (offLog.length % 5 === 1) await shot('off' + hv.set); }
      const r = await target();
      if (r) { await tap(r.x, r.y); await pg.waitForTimeout(/CANVAS/.test(r.what) ? 900 : 600); continue; }
      const m = await G(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return t ? { x: +t[1], y: +t[2] } : null; });
      if (m && m.x > 4 && m.x < W - 4 && m.y > 90 && m.y < H - 110) await tap(m.x, m.y + 6);
      else {
        // (after the first-time flow nothing is marked: a player taps the builder at his banker, or the site in view)
        const pl = await G(() => { const t = (document.querySelector('.gm-pill') || {}).textContent || ''; return /חצוב|הנח|▶|שחק|המחצבה|בדוק|האנך/.test(t) && !/המטרה/.test(t); });
        if (pl) { const p = await pg.$('.gm-pill'); const pr = p && await p.boundingBox(); if (pr) await tap(pr.x + pr.width / 2, pr.y + pr.height / 2); }
        else if (hv && hv.on) await tap(hv.x, hv.y + 10);
        else await tap(W / 2, H * 0.5);
      }
      await pg.waitForTimeout(1100);
    }
    await shot('end');
    console.log(tag, 'hero off screen while idle:', offLog.length, offLog.slice(0, 20).join(' '));
    console.log(tag, 'returns', JSON.stringify(await G(() => window.__GAME_LOG.filter((e) => e.type === 'heroReturn').map((e) => e.d).slice(0, 12))));
    console.log(tag, 'errors', errs.length, errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
})();
