// FLOW8B (wave 8B) — the Mount's first minutes by REAL TOUCH on the real build: 390×844, hasTouch, a fresh profile, normal
// mode, no autoplay flags (no __MG_AUTO / __M3_AUTO / resync). The player taps only where the game points (the gold pointer
// and ring, `.gm-mark`), or the pill / the cards' buttons.
//   node test/game-touch.cjs [--no-build] [--shots]
// Checks: the opening skips by a tap; the survey's target is marked and three taps measure the Mount; every boulder is marked
// ON screen (in the safe frame) when struck, and the struck one is the marked one; a tap beside a rock strikes the marked one;
// the first stone by the pill; the name → "שלום, הכהן …", the HUD chip, the plate; the demo trap (a stored flag → the regular
// game); a loading-screen fact. The world runs in real time without rendering (__T.simulate); only the shots render.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots');
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      // (flow9) every toast as it is shown: a toast lives ≥ 1.5 s, and a loaded machine's polls can miss it
      window.__TOASTS = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-toast')) window.__TOASTS.push(n.textContent); }).observe(document, { childList: true, subtree: true });
      try { if (!sessionStorage.getItem('fx-once')) { sessionStorage.setItem('fx-once', '1'); localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: true, rhythm: true })); } } catch (e) { /* blocked */ }
    });
    // ── flow10 ── --file=<a snapshot of the build> (runs wait for the shared browser lock while the tree is rebuilt)
    { const fa = process.argv.slice(2).find((a) => a.startsWith('--file=')); await pg.goto('file://' + (fa ? path.resolve(fa.slice(7)) : path.join(ROOT, 'dist/test.html'))); }
    // the loading screen's fact (read before the loader goes)
    const boot = await pg.waitForFunction(() => { const f = document.querySelector('#load .fx-boot'); return f ? f.textContent : (window.__T && window.__T.booted ? '(gone)' : null); }, null, { polling: 50, timeout: 240000 }).then((h) => h.jsonValue(), () => '');
    check('the loading screen shows a true fact with its source', /פרט אמיתי/.test(boot) && boot.length > 30, boot.slice(0, 90));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    check('the demo trap: a phone v16 left in the demo opens the regular game (the flag is healed)', await G(() => !__T.game.state.demo && !('demo' in JSON.parse(localStorage.getItem('bh_settings') || '{}'))));
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `game-touch-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f));
      await G(() => { window.__HUD_HOLD = false; });
    };
    const mark = () => G(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const e = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return t ? { x: +t[1], y: +t[2], d: e ? e.d : null } : null; });
    const tap = (x, y) => pg.touchscreen.tap(x, y);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);

    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    check('a tap skips the opening', await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000));

    /* the survey: the builder is marked; the player taps the pointer */
    check('the survey: its target is marked (pointer + ring on the builder)', await waitFor(() => __T.game.state.ftue === 1 && window.__GAME_LOG.some((e) => e.type === 'mark' && e.d.at === 'hero'), null, 15000));
    await pg.waitForTimeout(1600);                                   // (the camera settles on the builder)
    await shot('survey');
    for (let k = 0; k < 8 && !(await G(() => __T.game.state.st.har.p !== 'survey')); k++) {
      const m = await mark();
      if (m) await tap(m.x, m.y); else await tap(W / 2, H * 0.55);
      await pg.waitForTimeout(1500);
    }
    check('three taps on the pointer measure the Mount (the dig begins)', await waitFor(() => __T.game.state.st.har.p !== 'survey', null, 6000));

    /* the rough hill: every boulder is marked ON screen when struck, and the tap strikes the marked one */
    let struck = 0, onScreen = 0, same = 0, off = [], wrong = [], firstShot = false, lateShot = false;
    for (let k = 0; k < 90; k++) {
      const left = await G(() => __T.game.state.bh.filter((v) => v > 0).length);
      if (!left) break;
      await waitFor(() => !__T.game.busy && !__T.game._.hero.busy, null, 6000);
      // (the camera glides 1.3 s to the next boulder: a player looks, then taps — the pointer must be in frame by then)
      await waitFor(([w, h]) => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return false; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return !!t && +t[1] > 20 && +t[1] < w - 20 && +t[2] > 110 && +t[2] < h - 140; }, [W, H], 2500);
      const m = await mark();
      const n0 = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike').length);
      if (!m || !m.d || m.d.boulder == null) {
        const why = await G(() => { const e = document.querySelector('.gm-mark'); const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return `${e.className.replace('gm-anchor gm-mark', '').trim() || '-'} op=${e.style.opacity} ${e.style.transform.replace('translate', '')} last=${JSON.stringify(L && L.d)} modal=${!!document.querySelector('.gm-modal')}`; });
        off.push(`k${k}:none(${why})`); await tap(W / 2, H * 0.5); await pg.waitForTimeout(900); continue;
      }
      const inFrame = m.x > 20 && m.x < W - 20 && m.y > 110 && m.y < H - 140;
      if (inFrame) onScreen++; else off.push(`b${m.d.boulder}@${Math.round(m.x)},${Math.round(m.y)}`);
      if (!firstShot) { firstShot = true; await shot('boulder-first'); }
      if (left <= 2 && !lateShot) { lateShot = true; await shot('boulder-last'); }
      await tap(Math.max(4, Math.min(W - 4, m.x)), Math.max(4, Math.min(H - 4, m.y)));
      const ok = await waitFor((n) => window.__GAME_LOG.filter((e) => e.type === 'strike').length > n, n0, 9000);
      if (!ok) continue;
      struck++;
      const job = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike').pop().d.job);
      if (job === 'b' + m.d.boulder) same++; else wrong.push(`${job}≠b${m.d.boulder}`);
    }
    const left = await G(() => __T.game.state.bh.filter((v) => v > 0).length);
    check('every boulder cleared by real taps on the pointer', left === 0, `${struck} strikes`);
    check('each boulder was marked in the safe frame when struck (the owner: "the last two are hidden")', off.length === 0, off.slice(0, 6).join(' '));
    check('the tap struck the marked boulder every time', wrong.length === 0 && same === struck, wrong.slice(0, 4).join(' '));

    /* the first stone: the pill (the coach's hand), then the name, the greeting, the chip, the plate */
    await waitFor(() => __T.game.state.ftue >= 3, null, 12000);
    const pill = await pg.$('.gm-pill'); const pr = pill && await pill.boundingBox();
    if (pr) await tap(pr.x + pr.width / 2, pr.y + pr.height / 2);
    // the first stone's precision game (GAMES8B's) or its card: play it by touch — tap its target/button a few times
    const target = () => G(() => {   // the result's "המשך", a card's gold button, else the game's own field (a tap = a drop)
      const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
      const go = [...document.querySelectorAll('.fx-mg button')].find((x) => vis(x) && /המשך/.test(x.textContent)) || [...document.querySelectorAll('.gm-modal.on .gm-btn-gold')].find(vis) || [...document.querySelectorAll('.fx-mg canvas')].find(vis);
      if (!go) return null; const r = go.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, what: go.tagName + ':' + (go.textContent || '').trim().slice(0, 12) };
    });
    let played = [];
    for (let k = 0; k < 40 && !(await G(() => __T.game.state.st.har.set >= 1)); k++) {
      const r = await target();
      if (r) { played.push(r.what); await tap(r.x, r.y); }
      await pg.waitForTimeout(r && /CANVAS/.test(r.what) ? 900 : 600);
    }
    console.log('   first stone:', [...new Set(played)].join(', '));
    check('the first stone is set (by the pill and a precision game played by touch)', await waitFor(() => __T.game.state.st.har.set >= 1, null, 20000));
    const named = await waitFor(() => document.querySelectorAll('.gm-modal.on .gm-mishmarot button').length === 24 || /אלף כהנים/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 20000);
    if (named) {
      for (let k = 0; k < 3 && !(await pg.$('.gm-modal.on .gm-input')); k++) { const g = await pg.$('.gm-modal.on .gm-btn-gold'); const r = g && await g.boundingBox(); if (r) await tap(r.x + r.width / 2, r.y + r.height / 2); await pg.waitForTimeout(500); }
      const inp = await pg.$('.gm-modal.on .gm-input');
      if (inp) { const r = await inp.boundingBox(); await tap(r.x + r.width / 2, r.y + r.height / 2); await pg.keyboard.type('יכין'); }
      const g = await pg.$('.gm-modal.on .gm-btn-gold'); const r = g && await g.boundingBox(); if (r) await tap(r.x + r.width / 2, r.y + r.height / 2);
    }
    check('the name → a greeting "שלום, הכהן יכין"', await waitFor(() => /שלום, הכהן יכין/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 8000));
    await shot('greet');
    { const g = await pg.$('.gm-modal.on .gm-btn-gold'); const r = g && await g.boundingBox(); if (r) await tap(r.x + r.width / 2, r.y + r.height / 2); }
    check('the name on the HUD chip and the plate over the hero', await waitFor(() => /יכין/.test((document.querySelector('.gm-top .gm-name:not(.gm-hidden)') || {}).textContent || '') && (document.querySelector('.gm-plate') || {}).textContent === 'הכהן יכין', null, 5000));
    await pg.waitForTimeout(1200);
    await shot('named');
    // ── flow9 ── (QA9 15:46 P0: "after the name the frame is bare ground … no pointer") in the courses the pointer marks the banker,
    // and it is in the safe frame (the camera re-aims when the world's frame misses it)
    const bank = await waitFor(([w, h]) => { const m = document.querySelector('.gm-mark'); const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0' || !L || L.d.at !== 'har') return false; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return !!t && +t[1] > 20 && +t[1] < w - 20 && +t[2] > 110 && +t[2] < h - 140; }, [W, H], 9000);
    check('the courses: the pointer marks the block on the builder\'s banker, in the safe frame', bank && await G(() => { const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return !!(L && L.d.banker) || !(__T.stages && __T.stages.workSpot); }), await G(() => { const m = document.querySelector('.gm-mark'); const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); return `op=${m.style.opacity} ${m.style.transform.replace('translate', '')} last=${JSON.stringify(L && L.d)} aims=${window.__GAME_LOG.filter((x) => x.type === 'markAim').length} ftue=${__T.game.state.ftue}`; }));
    await shot('courses');

    /* ── flow9 ── (BRIEF9 FLOW9-1, STAGING M11) the Mount's corner stone by touch: a fixture jumps to stone 16 (no autoplay: the
       pill, the quarry game and its buttons are tapped), then the words must match the game, and the stone arrives (SITE9's
       cart and crane when the world has deliverKeyStone, else the toast alone) */
    await G(() => { for (const b of document.querySelectorAll('.gm-modal.on .gm-btn-gold')) b.click(); });
    await G(() => {
      const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, '');
      Object.assign(g.st.har, { set: 16, paid: Math.max(g.st.har.paid, 24), k: 0 }); g.st.har.keys[0] = g.st.har.keys[0] != null ? g.st.har.keys[0] : 0.9;
      __T.game._.resync();
    });
    const pillTxt = await waitFor(() => /אבן הפינה: חצוב אותה/.test(document.querySelector('.gm-pill').textContent), null, 8000).then(() => G(() => document.querySelector('.gm-pill').textContent));
    check('stone 16: the pill says "אבן הפינה: חצוב אותה" (no "הנח")', /אבן הפינה: חצוב אותה/.test(pillTxt) && !/הנח/.test(pillTxt), pillTxt.slice(0, 60));
    await pg.waitForTimeout(600);
    await shot('corner-pill');
    { const p = await pg.$('.gm-pill'); const r = p && await p.boundingBox(); if (r) await tap(r.x + r.width / 2, r.y + r.height / 2); }
    const kick = await waitFor(() => !!document.querySelector('.fx-mg .fx-mg-k'), null, 10000).then(() => G(() => { const k = document.querySelector('.fx-mg .fx-mg-k'), n = document.querySelector('.fx-mg .fx-mg-top b'); return `${k ? k.textContent : ''} | ${n ? n.textContent : ''}`; }));
    check('the quarry game opens under the same words: "חציבת אבן הפינה | המחצבה"', /חציבת אבן הפינה/.test(kick) && /המחצבה/.test(kick), kick);
    // a player's hand (as test/minigames-touch.cjs): the how-to is tapped away, then the hand's cue is followed — a timed cue
    // (the force meter) waits for its moment; the wedges: the one the hand shows; the result's "המשך" closes it
    let qp = [];
    const t0q = Date.now();
    while (Date.now() - t0q < 150000 && !(await G(() => window.__GAME_LOG.some((e) => e.type === 'keyStone' && e.d.kind === 'quarry')))) {
      const s = await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? { ...w.__mg.state(), cue: w.__mg.cue() } : null; });
      if (!s || s.done) { const r = await target(); if (r && !/CANVAS/.test(r.what)) { qp.push(r.what); await tap(r.x, r.y); } await pg.waitForTimeout(500); continue; }
      if (s.how) { const bb = await (await pg.$('.fx-mg-how')).boundingBox(); await tap(bb.x + bb.width / 2, bb.y + bb.height * 0.85); qp.push('how'); await pg.waitForTimeout(250); continue; }
      const c = s.cue; if (!c) { await pg.waitForTimeout(100); continue; }
      if (c.timed && !(await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !!(w && w.classList.contains('done')); }, null, { polling: 'raf', timeout: 8000 }).then(() => true, () => false))) continue;
      const k = (await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; })) || c;
      const bb = await (await pg.$('.fx-mg canvas')).boundingBox();
      await tap(bb.x + bb.width * k.x, bb.y + bb.height * k.y); qp.push(c.timed ? 'cut' : 'wedge');
      await pg.waitForTimeout(c.timed ? 160 : 240);
    }
    console.log('   corner stone:', [...new Set(qp)].join(', '), `${Math.round((Date.now() - t0q) / 1000)} s`);
    check('the corner stone is hewn by touch (the quarry game)', await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'keyStone' && e.d.kind === 'quarry'), null, 15000));
    check('"אבן הפינה נחצבה" (never "הנח"), then it arrives', await waitFor(() => window.__TOASTS.some((t) => /אבן הפינה נחצבה/.test(t)), null, 6000));
    const cart = await G(() => !!(__T.stages && typeof __T.stages.deliverKeyStone === 'function'));
    if (cart) {
      check('SITE9\'s cart and crane: deliverKeyStone starts, the pill waits ("… בדרך לאתר")', await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'start') && /בדרך לאתר/.test(document.querySelector('.gm-pill').textContent), null, 6000));
      await pg.waitForTimeout(5000);
      await shot('corner-cart');
      check('the crane sets it: "אבן הפינה: במקומה" and the site counts it', await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'end' && e.d.ok) && window.__TOASTS.some((t) => /אבן הפינה: במקומה/.test(t)), null, 50000), await G(() => JSON.stringify(window.__GAME_LOG.filter((e) => e.type === 'keyDeliver').map((e) => e.d))));
      await shot('corner-set');
    } else console.log('   (no deliverKeyStone in this world: the toast alone, v17\'s lift)');
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
