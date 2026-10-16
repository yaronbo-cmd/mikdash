// FLOW10 (wave 10) — the Mount's courses by REAL TOUCH (the owner, 28.9 21:42–21:57: "בשלב שיטוח ההר נדבך 5 השחקן נעלם", "גם
// בנדבך 1 הדמות של השחקן נעלמת", "בנדבך 2 … הדמות רחוקה מהאתר"): 390×844, hasTouch, normal mode, a fresh profile, no autoplay
// flags (no __MG_AUTO / __M3_AUTO). A fixture jumps past the survey and the rocks (game-touch plays those) to the courses —
// part 1 from stone 0 to 32 (the great stone, the quick lifts, the corner stone hewn → cart → crane), part 2 from stone 32 to 66
// (the dressed corner, the second corner stone, the course check with the plumb, the next great stone): each part stays under
// 8 minutes on the shared machine. Then only taps: the builder (after the first-time flow nothing is marked: a player taps his
// kohen), the pill when it asks (a key stone, the check), a card's button, the precision games by their hand's cue.
// Checks, at every stone when the game waits for the player: the builder on screen in the safe frame and not hidden by the hill
// (within 3 s: the game's own re-aim may bring him back); his banker in the working bay, never the Shushan stairs' ledge above
// it; the crane and the next slot in the frame; during the corner stone's delivery the block seen on the hook; during the
// course check the builder above the check's sheet.
//   node test/game-courses-touch.cjs [--part=1|2|wall] [--no-build] [--shots] [--file=dist/test.html]
// ── flow11 ── --part=wall: the wall's first course (0 → 32) by the same touch; every part also checks K80 (≥ 80 px at every stone)
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/courses');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PARG = (args.find((a) => a.startsWith('--part=')) || '--part=1').slice(7);
// ── flow11 ── --part=wall: the wall's (חומת העזרה) first course by touch, 0 → 32 (the crane's first stone, the dressed corner at
// 16), the Mount done: the builder on screen and ≥ 80 px (K80) at every stone, the next slot in the frame, no console errors
const WALL = PARG === 'wall', PART = WALL ? 'wall' : +PARG || 1, SITE = WALL ? 'wall' : 'har';
const FROM = PART === 2 ? 32 : 0, TO = PART === 2 ? 66 : 32, BUDGET = 440 * 1000;
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__TOASTS = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-toast')) window.__TOASTS.push(n.textContent); }).observe(document, { childList: true, subtree: true });
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const FILE = (args.find((a) => a.startsWith('--file=')) || '').slice(7) || path.join(ROOT, 'dist/test.html');   // (a snapshot of the build: runs wait for the shared browser lock)
    await pg.goto('file://' + path.resolve(FILE));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const cdp = await ctx.newCDPSession(pg);   // (a finger's swipe: the browser makes the pointer events, as jobs-touch)
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
    const waitFor =(fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `p${PART}-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f));
      await G(() => { window.__HUD_HOLD = false; });
    };
    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    /* the fixture: the Mount's courses at stone FROM, as after the rocks (a named player, the segments paid, stone in stock) */
    await G(([from, site]) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      if (site !== 'har') {   // (the stages before it done; the site in its courses, as after its survey and dig)
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.focus = site;
      }
      Object.assign(g.st[site], { p: 'courses', dp: 1, paid: 999, set: from, k: 0, chk: 0 });
      for (const i of [0, 16, 32]) if (i < from && g.st[site].keys[i] == null) g.st[site].keys[i] = 0.9;
      g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; __T.game._.resync();
      window.__SITE = site;
    }, [FROM, SITE]);
    await pg.waitForTimeout(2500);
    // (his plumb at the course check: the world's strokes of kind 'measure')
    await G(() => { window.__MEASURE = 0; try { __T.stages.hero.onImpact((e) => { if (e && e.kind === 'measure') window.__MEASURE++; }); } catch (e) { /* */ } });
    const logN = (t) => G((t) => window.__GAME_LOG.filter((e) => e.type === t).length, t);
    /* where the builder is, and what frames him (the world's own projection: `on` false when the rough Mount hides a point) */
    const look = () => G(() => {
      const S = __T.stages, cam = __T.camera; cam.updateMatrixWorld();
      const Wd = innerWidth, Hd = innerHeight, hp = S.hero.position;
      const pr = (x, y, z, m = 8) => { const q = __T.view.project(x, y, z); return { x: Math.round(q.x), y: Math.round(q.y), on: !!q.on && q.x > m && q.x < Wd - m && q.y > 60 && q.y < Hd - 60 }; };
      const h = __T.view.project(hp.x, hp.y + 1.8, hp.z), on = !!h.on && h.x > 24 && h.x < Wd - 24 && h.y > 110 && h.y < Hd - 130;
      const fy = __T.view.project(hp.x, hp.y, hp.z).y, px = Math.round(Math.abs(fy - __T.view.project(hp.x, hp.y + 3.6, hp.z).y));   // (K80: feet → head)
      // (the crane between the camera and him: a ray from the camera to his chest against the crane's meshes)
      let craneHides = false;
      try { const C = S._dbg.crane; if (C && C.g && C.g.visible && __T.Raycaster) { const o = cam.position.clone(), dv = new __T.Vector3(hp.x, hp.y + 1.8, hp.z).sub(o), L = dv.length(); const rc = new __T.Raycaster(o, dv.normalize(), 0, L - 1.2); craneHides = rc.intersectObject(C.g, true).length > 0; } } catch (e) { /* */ }
      const site = window.__SITE || 'har', ws = S.workSpot(site, 'dress'), sl = S.nextSlot(site), c = S._dbg.crane, P = S._dbg.hill.U.uPit.value;
      return { set: __T.game.state.st[site].set, on, px, craneHides, x: Math.round(h.x), y: Math.round(h.y), hero: [hp.x, hp.y, hp.z].map(Math.round),
        bank: ws ? [ws.x, ws.y, ws.z].map((v) => Math.round(v * 10) / 10) : null, bay: [P.x, P.y, P.z, P.w].map(Math.round),
        slot: sl ? pr(sl.face[0], sl.y + sl.h / 2 + 0.3, sl.face[2]) : null, slotY: sl ? Math.round(sl.y * 10) / 10 : null, slotX: sl ? Math.round(sl.face[0]) : null,
        bankSlot: ws && sl ? Math.round(Math.hypot(ws.x - sl.face[0], ws.z - sl.face[2])) : null,
        crane: c && c.g && c.g.visible ? pr(c.g.position.x, c.g.position.y + 6, c.g.position.z) : null,
        dist: Math.round(cam.position.distanceTo(hp)) };
    });
    const target = () => G(() => {   // a precision game's "המשך", a card's gold button
      const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
      const go = [...document.querySelectorAll('.fx-mg button')].find((x) => vis(x) && /המשך|✓|שלמה/.test(x.textContent)) || [...document.querySelectorAll('.gm-modal.on .gm-btn-gold')].find(vis);
      if (!go) return null; const r = go.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, what: (go.textContent || '').trim().slice(0, 14) };
    });
    /* a precision game by its hand's cue (as game-touch's quarry): the how-to tapped away, a timed cue waits for its moment */
    let mgPlayed = [], checkSeen = null;
    async function playMg() {
      const t0 = Date.now();
      let kind = null;
      while (Date.now() - t0 < 90000) {
        const s = await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? { ...w.__mg.state(), cue: w.__mg.cue(), k: (document.querySelector('.fx-mg .fx-mg-k') || {}).textContent || '' } : null; });
        if (!s) break;
        kind = kind || s.k;
        // (the course check: the builder with his plumb above the sheet, 1.5 s into the game)
        if (/בדיקת הנדבכים|פילוס הנדבך/.test(s.k) && !checkSeen && Date.now() - t0 > 1500) {
          const l = await look(); const sh = await G(() => { const e = document.querySelector('.fx-mg-sheet'); return e ? Math.round(e.getBoundingClientRect().top) : 844; });
          checkSeen = { ...l, sheet: sh, stand: await logN('checkStand') }; await shot('check');
        }
        if (s.done) { const r = await target(); if (r) await tap(r.x, r.y); await pg.waitForTimeout(400); continue; }
        if (s.how) { const e = await pg.$('.fx-mg-how'); const bb = e && await e.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height * 0.85); await pg.waitForTimeout(250); continue; }
        const c = s.cue; if (!c) { await pg.waitForTimeout(120); continue; }
        if (c.timed) await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !w || w.classList.contains('done'); }, null, { polling: 'raf', timeout: 8000 }).catch(() => {});
        const k = (await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; })) || c;
        const cv = await pg.$('.fx-mg canvas'); const bb = cv && await cv.boundingBox();
        // (v27: the jobs' hands as jobs-touch plays them — a held button, a button, a swipe along {x, y → x2, y2} by CDP touch —
        //  else a tap on the cue; the column's rope is a swipe: tapped, it never rose, and the course stalled 3 minutes)
        const bt = k.btn ? await pg.$(`.fx-mg [data-b="${k.btn}"]`) : null, bbb = bt && await bt.boundingBox();
        if (bbb && k.hold) { const p = [bbb.x + bbb.width / 2, bbb.y + bbb.height / 2]; await touch('touchStart', [p]); await pg.waitForTimeout(k.ms || 350); await touch('touchEnd', []); }
        else if (bbb) await tap(bbb.x + bbb.width / 2, bbb.y + bbb.height / 2);
        else if (bb && (k.x2 != null || k.y2 != null)) {
          const pull = s.kind === 'pull', n = k.n || (s.kind === 'cover' ? 8 : pull ? (k.ms ? 12 : 10) : 8), gap = pull ? (k.ms ? 70 : 40) : 16;
          const P = (u, v) => [bb.x + bb.width * u, bb.y + bb.height * v], A = P(k.x, k.y), Z = P(k.x2 == null ? k.x : k.x2, k.y2 == null ? k.y : k.y2);
          await touch('touchStart', [A]);
          for (let q = 1; q <= n; q++) { await touch('touchMove', [[A[0] + ((Z[0] - A[0]) * q) / n, A[1] + ((Z[1] - A[1]) * q) / n]]); await pg.waitForTimeout(gap); }
          if (s.kind === 'cover') for (let q = n - 1; q >= 0; q--) { await touch('touchMove', [[A[0] + ((Z[0] - A[0]) * q) / n, A[1] + ((Z[1] - A[1]) * q) / n]]); await pg.waitForTimeout(16); }   // (a rub: there and back)
          await touch('touchEnd', []);
        } else if (bb) await tap(bb.x + bb.width * (k.x == null ? 0.5 : k.x), bb.y + bb.height * (k.y == null ? 0.5 : k.y));
        await pg.waitForTimeout(c.timed ? 160 : 240);
      }
      mgPlayed.push((kind || '?').trim().slice(0, 16));
    }
    /* the corner stone's delivery: the block on the hook, sampled while the crane carries it */
    let carry = { n: 0, on: 0, shots: 0, cart: 0 };
    async function watchDelivery() {
      const t0 = Date.now();
      while (Date.now() - t0 < 45000 && !(await G(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'end')))) {
        const s = await G(() => { const C = __T.stages._dbg.crane; if (!C || !C.lift || !C.block.visible) return null; __T.camera.updateMatrixWorld(); const p = C.block.position, q = __T.view.project(p.x, p.y, p.z); return { on: !!q.on && q.x > 0 && q.x < innerWidth && q.y > 40 && q.y < innerHeight - 40, x: Math.round(q.x), y: Math.round(q.y) }; });
        if (s) { carry.n++; if (s.on) carry.on++; if (carry.n === 4 && carry.shots < 1) { carry.shots++; await shot('corner-hook'); } }
        else if (Date.now() - t0 > 5000 && !carry.cart) { carry.cart = 1; await shot('corner-cart'); }
        await pg.waitForTimeout(300);
      }
      await pg.waitForTimeout(1600);
      await shot('corner-set');
    }
    /* play: at every stone, the first moment the game waits for the player → the checks, then his tap */
    const rows = [], offs = [], banks = [], deals = [];   // ── fun14 ── (deals: the cards dealt, and the one tapped)
    let strikes = 0, minCard = 1e9;
    let lastSet = -1, last = null, k = 0, deliv = false;
    await shot('start');
    for (; k < 900 && Date.now() - T0 < BUDGET; k++) {
      const set = await G((site) => __T.game.state.st[site].set, SITE);
      if (set >= TO) break;
      if (await G(() => !!document.querySelector('.fx-mg'))) { await playMg(); continue; }
      // ── flow16 ── a craft in the world (hands.js: no sheet): the finger on the kohen's side the hand points to, held as the cue says
      if (await G(() => !!window.__HANDS)) {
        const s = await G(() => (window.__HANDS ? { st: window.__HANDS.state(), cue: window.__HANDS.cue(), at: window.__HANDS.at() } : null));
        if (s && !s.st.done) { if (!mgPlayed.includes('world:' + s.st.kind)) { mgPlayed.push('world:' + s.st.kind); await shot('hands'); } const c = s.cue; if (c && c.btn && c.now && s.at && s.at.on) { const p = [Math.max(6, Math.min(W - 6, s.at.x)), Math.max(6, Math.min(H - 6, s.at.y))]; await touch('touchStart', [p]); await pg.waitForTimeout(Math.max(120, Math.min(700, c.ms || 350))); await touch('touchEnd', []); } }
        await pg.waitForTimeout(90); continue;
      }
      // ── /flow16 ──
      const card = await target();
      if (card) { await tap(card.x, card.y); await pg.waitForTimeout(500); continue; }
      if (!deliv && await G(() => window.__GAME_LOG.some((e) => e.type === 'keyDeliver' && e.d.at === 'start'))) { deliv = true; await watchDelivery(); continue; }
      const idle = await G(() => !__T.game.busy && !__T.game._.hero.busy && !document.querySelector('.fx-mg'));
      if (!idle) { await pg.waitForTimeout(250); continue; }
      if (set !== lastSet) {
        // (a player looks, then taps — ── fun14 ── at a deal the sheet rises and his work's frame glides in: she reads two cards)
        await pg.waitForTimeout((await G(() => !!document.querySelector('.gm-deal.on'))) ? 1400 : 350);
        // (── fun14 ── a job sets many stones at once: the world re-poses the bay's crane, its stock and his banker after the lift —
        //  she looks at the scene once it has settled, as a child reading the cards would)
        if (await waitFor((site) => { const S = __T.stages; return !S || typeof S.posed !== 'function' || S.posed(site); }, SITE, 6000)) await pg.waitForTimeout(400);
        // (meanwhile a course end's check or a game may have opened: it is played first, the scene read after it)
        if (await G(() => !!document.querySelector('.fx-mg') || __T.game.busy)) continue;
        let l = await look(), rec = false;
        if (!l.on) { for (let q = 0; q < 12 && !l.on; q++) { await pg.waitForTimeout(300); l = await look(); } rec = l.on; if (rec) { await pg.waitForTimeout(1500); const l2 = await look(); if (l2.on) l = l2; } }   // ── director13 ── (a re-aim's glide: K80 is read once the frame has settled)
        rows.push(l);
        if (!l.on) { offs.push(`s${set}@${l.x},${l.y}`); await shot(`off-${set}`); }
        else if (rec) offs.push(`s${set}:recovered`);
        if (l.bank) banks.push({ set, bank: l.bank, bay: l.bay, slotY: l.slotY, slotX: l.slotX });
        if (SHOTS && [FROM + 1, FROM + 5, FROM + 12, FROM + 20, FROM + 30, 64, 65].includes(set)) await shot('s' + set);
        lastSet = set; last = l;
      }
      // ── fun14 ── (wave 14, the course loop) "מה נעשה עכשיו?": a card by touch — the key stone's card when it is dealt (its game,
      // its delivery), else the cards in turn (the strike card: ten taps on him, on the ring); "▶ הביאו אבנים" when the stock is out
      const dl = await G(() => { const d = document.querySelector('.gm-deal.on'); if (!d) return null; return [...d.querySelectorAll('.gm-jc')].map((b) => { const r = b.getBoundingClientRect(); return { job: b.dataset.job, x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height) }; }); });
      if (dl && dl.length) {
        const want = ['key', 'arch', 'F1', 'strike'][deals.length % 4];   // (her ❤️ arch and the course's F1 by touch too, in turn)
        const c = dl.find((x) => x.job === want) || dl.find((x) => x.job === 'key') || dl[deals.length % dl.length];
        deals.push(dl.map((x) => x.job).join('+') + '→' + c.job); minCard = Math.min(minCard, ...dl.map((x) => Math.min(x.w, x.h)));
        if (deals.length === 1) await shot('deal');
        await tap(c.x, c.y); await pg.waitForTimeout(900); continue;
      }
      const sc = await G(() => __T.game.loop && __T.game.loop.strike());
      if (sc) { strikes++; const l = await look(); if (l.on) await tap(l.x, l.y + 12); else await tap(W / 2, H * 0.42); await pg.waitForTimeout(560); continue; }
      // what the player taps: the pill when it asks (a key stone, the check, the deal), else the pointer, else his builder
      const pill = await G(() => { const p = document.querySelector('.gm-pill'); const t = p ? p.textContent : ''; if (!p || /המטרה/.test(t) || !(/חצוב|הנח|סתת|בדיקת|בדוק|האנך|▶/.test(t) || p.dataset.kind === 'jobs')) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      // ── /fun14 ──
      if (pill) { await tap(pill.x, pill.y); await pg.waitForTimeout(900); continue; }
      const m = await G(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return t ? { x: +t[1], y: +t[2] } : null; });
      if (m && m.x > 4 && m.x < W - 4 && m.y > 90 && m.y < H - 110) await tap(m.x, m.y + 6);
      else { const l = last && last.on ? await look() : null; if (l && l.on) await tap(l.x, l.y + 12); else await tap(W / 2, H * 0.5); }
      await pg.waitForTimeout(700);
    }
    const setNow = await G((site) => __T.game.state.st[site].set, SITE);
    console.log(`   part ${PART}: stones ${FROM} → ${setNow} in ${Math.round((Date.now() - T0) / 1000)} s, games: ${mgPlayed.join(' · ')}`);
    console.log('   deals:', deals.join(' · ') || 'none', `· strike taps ${strikes} · smallest card ${minCard} px`);   // ── fun14 ──
    // ── fun14 ── (D1's pacing: a course 40–80 s) the time from the course's first deal (or line) to its end, by the game's log
    const pace = await G(() => { const L = window.__GAME_LOG, out = []; let t0 = null; for (const e of L) { if (t0 == null && (e.type === 'dealShown' || (e.type === 'jobStart' && e.d && e.d.job === 'line'))) t0 = e.t; if (e.type === 'course' && t0 != null) { out.push(`c${e.d.c}:${Math.round((e.t - t0) / 1000)}s`); t0 = null; } } return out.join(' '); });
    console.log('   course pace (first deal → course end):', pace || 'none');
    console.log('   off screen:', offs.join(' ') || 'none');
    console.log('   the crane between the camera and him at stones:', rows.filter((r) => r.craneHides).map((r) => r.set).join(',') || 'none');
    console.log('   banker by stone:', banks.map((q) => `${q.set}:${q.bank[0]},${q.bank[1]},${q.bank[2]}`).join(' '));
    check(`[part ${PART}] the stones ${FROM}→${TO} set by touch`, setNow >= TO, `${setNow}`);
    // ── fun14 ── (the course loop) the game waits for her at each deal, not at every stone: the cards were dealt and played by touch
    // (the wall's course is one job — J = 1 at its 8 courses: one deal sets it; the Mount's two)
    const DEALS = WALL ? 1 : 2;
    check(`[part ${PART}] the course loop: "מה נעשה עכשיו?" dealt and its cards played by touch (≥ 44 px)`, deals.length >= DEALS && minCard >= 44, `${deals.length} deals; ${deals.slice(0, 6).join(' · ')}`);
    check(`[part ${PART}] the builder on screen, clear of the hill, at every stone the game waits on (the owner: "the builder vanishes")`, rows.length >= DEALS && rows.every((r) => r.on), `${rows.filter((r) => r.on).length}/${rows.length}; ${offs.filter((o) => !/recovered/.test(o)).slice(0, 6).join(' ')}`);
    // ── flow11 ── K80 (STAGING rule 1, PRODUCER11): his 3.6 amot ≥ 80 px at every stone the game waits on
    const small = rows.filter((r) => r.on && r.px < 80 && r.set % 32 !== 0);   // (a course's end is a 2.6-s beat over the course: a short pull-back)
    check(`[part ${PART}] the builder ≥ 80 px at every stone (K80)`, rows.length && !small.length, `${rows.length - small.length}/${rows.length}; px ${[...new Set(rows.map((r) => r.px))].sort((a, b) => a - b).slice(0, 6).join(',')}${small.length ? ' · small at ' + small.slice(0, 6).map((r) => `s${r.set}:${r.px}`).join(' ') : ''}`);
    if (WALL) {
      console.log('   banker ↔ slot (amot) by stone:', rows.map((r) => `${r.set}:${r.bankSlot}`).join(' '));
      check('[part wall] the next slot in the frame with him at every stone', rows.filter((r) => r.on).every((r) => r.slot && r.slot.on), rows.filter((r) => !(r.slot && r.slot.on)).slice(0, 5).map((r) => `s${r.set} slot ${r.slot && r.slot.x},${r.slot && r.slot.y}`).join(' · '));
    } else {
    const X1 = 277, bayOk = (q) => q.bank[0] > X1 - 48 && q.bank[0] < X1 + 2;
    // (── fun14 ── a job sets its share at once — 16 stones between two reads, not one — and the bay's floor rises with the course:
    //  a flip is a jump larger than 3 amot plus the bay's rise over the stones between, ≈ 0.6 amah a stone)
    let flips = 0; for (let i = 1; i < banks.length; i++) if (Math.abs(banks[i].bank[1] - banks[i - 1].bank[1]) > 3 + 0.6 * Math.max(0, banks[i].set - banks[i - 1].set - 1)) flips++;
    check(`[part ${PART}] his banker stays in the working bay (x ${X1 - 48}…${X1 + 2}), never flipping up to the stairs' ledge`, banks.length && banks.every(bayOk) && flips === 0, `${banks.filter(bayOk).length}/${banks.length} in the bay, ${flips} flips`);
    check(`[part ${PART}] the next slot is on the east face in the bay, at the bay's floor or above (never y −124)`, banks.every((q) => q.slotX != null && Math.abs(q.slotX - X1) <= 3 && q.slotY > -66), [...new Set(banks.map((q) => q.slotY))].slice(0, 8).join(','));
    check(`[part ${PART}] the crane and the next slot in the frame with him`, rows.filter((r) => r.on).every((r) => r.slot && r.slot.on && r.crane && r.crane.on), rows.filter((r) => !(r.slot && r.slot.on && r.crane && r.crane.on)).slice(0, 4).map((r) => `s${r.set} slot ${r.slot && r.slot.x},${r.slot && r.slot.y} crane ${r.crane && r.crane.x},${r.crane && r.crane.y}`).join(' · '));
    }
    if (deliv) check(`[part ${PART}] the corner stone seen on the crane's hook while it is carried`, carry.n > 0 && carry.on >= carry.n * 0.8, `${carry.on}/${carry.n} samples on screen`);
    if (PART === 2) {
      const measures = await G(() => window.__MEASURE || 0);
      check('[part 2] at the check he measures with his plumb (the world\'s "measure" strokes)', measures > 0, `${measures} strokes`);
      check('[part 2] the course check (בדיקת הנדבכים): the builder walks to the course and stands on screen above the check\'s sheet, not behind the crane', !!checkSeen && checkSeen.stand > 0 && checkSeen.on && !checkSeen.craneHides && checkSeen.y < checkSeen.sheet, checkSeen ? `builder ${checkSeen.x},${checkSeen.y} · sheet top ${checkSeen.sheet} · stand ${checkSeen.stand} · crane hides him ${checkSeen.craneHides}` : 'no check seen');
    }
    check(`[part ${PART}] the survey's coach line never lingers in the courses`, !(await G(() => /הקש כדי למדוד את ההר/.test((document.querySelector('.gm-bub:not(.gm-hidden)') || {}).textContent || ''))));
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check(`[part ${PART}] no console errors`, !bad.length, bad.slice(0, 3).join(' | '));
    fs.writeFileSync(path.join(OUT, `p${PART}.json`), JSON.stringify({ rows, banks, carry, checkSeen }, null, 0));
    await ctx.close();
  } finally { await b.close(); }
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
