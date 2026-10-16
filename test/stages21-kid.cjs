// STAGES21 (wave 21): the kid plays every stage. A fixture puts him at the stage (twin-stages.cjs's: every stage before it done, this one in its
// courses) and a kid who follows only the screen (a card's gold button, the markers, the edge arrow, the awake work button, the coach) plays
// --secs (60) there. Logged per stage: time to first work · markers/arrow seen within 10 s · AUTONOMOUS WALKS (he moves while no finger is down
// and none was for 1.5 s and no job started) · acts a minute and the four answers (dust, float, buzz, sound) · the music's BPM and bed level every 10 s ·
// the screen box (he and his work point in the middle 70 %) · console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/stages21-kid.cjs [--stages=wall,gates] [--secs=60] [--no-build] [--shots]
//   through the bus: /home/claude/wt/bus/brun node test/stages21-kid.cjs --no-build --stages=wall,gates > /tmp/x.log &
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/stages21');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const W = 844, H = 390, SHOTS = !args.includes('--noshots');
const SECS = +((args.find((a) => a.startsWith('--secs=')) || '--secs=60').slice(7));
const ALL = ['wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const STAGES = (args.find((a) => a.startsWith('--stages=')) || '').slice(9).split(',').filter(Boolean);
const LIST = STAGES.length ? STAGES : ALL;
const rows = [];
const FOOT = {};   // each stage's footprint rects, read from the source (the masonry he must never stand inside)
{ const src = fs.readFileSync(path.join(ROOT, 'src/stages.js'), 'utf8'); const re = /^  (\w+): \{\n    foot: (\[\[[^\n]*?\]\]),/gm; let m; while ((m = re.exec(src))) { try { FOOT[m[1]] = JSON.parse(m[2]); } catch (e) { /* */ } } }


(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg);
  const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
  const shot = async (name) => {
    if (!SHOTS) return;
    await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/stages21/' + name + '.png');
    await G(() => { window.__HUD_HOLD = false; });
  };
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  // the opening
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
  const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
  if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
  await pg.waitForTimeout(600);
  await G(() => { window.dispatchEvent(new Event('pointerdown')); });
  // the page-side recorders: pointers, the four answers (wrappers), a sampler of the hero / his work point / the music
  await G(() => {
    const R = window.__R = { ptr: 0, lastPtr: -1e9, ans: [], samp: [], music: [], btnDown: [] };
    for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend']) addEventListener(t, (e) => {
      R.lastPtr = performance.now();
      if (e.type === 'pointerdown') { R.ptr++; if (e.target && e.target.closest && e.target.closest('.tw-btn')) R.btnDown.push(performance.now()); }
      if (e.type === 'pointerup' || e.type === 'pointercancel') R.ptr = Math.max(0, R.ptr - 1);
    }, true);
    const rec = (k, d) => R.ans.push({ t: performance.now(), k, d });
    const J = __BH_PARTS.juice; if (J && !J.__w) { const h = J.hit; J.hit = function (kind, d) { rec('hit', (d && d.text) || ''); return h.apply(this, arguments); }; J.__w = 1; }
    const S = __T.stages;
    for (const n of ['dustBurst', 'sparkBurst']) { const f = S[n]; if (typeof f === 'function' && !f.__w) { const w = function () { rec('dust', n); return f.apply(this, arguments); }; w.__w = 1; try { S[n] = w; } catch (e) { /* frozen */ } } }
    const sx = __T.game.sfx; if (sx && !sx.play.__w) { const p = sx.play; const w = function (n) { rec('sound', String(n)); return p.apply(this, arguments); }; w.__w = 1; sx.play = w; }
    if (navigator.vibrate && !navigator.vibrate.__w) { const v = navigator.vibrate.bind(navigator); const w = function (x) { rec('buzz', 1); return v(x); }; w.__w = 1; try { navigator.vibrate = w; } catch (e) { /* */ } }
    const proj = (x, y, z) => { const q = __T.view.projectRaw(x, y, z); return { x: q.x, y: q.y, on: !!q.on }; };
    R.acts = []; R.dsnaps = []; R.d0 = 0; R.dsnap = null; let lastP = null;
    R.timer2 = setInterval(() => {   // (an act of a craft in the world = its model's progress or index moving: the impact, not the taps that wait for it)
      try { const H = window.__HANDS; if (!H || !H.twin || !H.state) { lastP = null; return; } const st = H.state(), k = st.acts != null ? `${H.kind}|a${st.acts}` : `${H.kind}|${st.progress}|${st.i}|${st.n}`; if (lastP !== null && k !== lastP && !st.done && (H.kind !== 'cover' || st.acts != null)) R.acts.push({ t: performance.now(), src: 'craft:' + H.kind + (H.job ? '/' + H.job : '') + '#' + st.phase + (st.acts != null ? 'A' : 'p') + (st.juice ? 'J' : 'x') }); lastP = k; } catch (e) { /* */ }
    }, 70);
    R.timer = setInterval(() => {
      try {
        const p = __T.stages.heroXYZ({}), hq = proj(p.x, p.y + 1.6, p.z);
        const sp = window.__TWIN ? __TWIN.spec() : null, mk = window.__TWIN ? __TWIN.marks() : [];
        let wp = null; const H = window.__HANDS;
        if (H && H.twin && H.atW) { const a = H.atW(); if (a && Number.isFinite(a.x)) wp = { x: a.x, y: a.y - 1, z: a.z }; }
        // (the work point is judged while a craft runs under his hands: the camera's job is to show it; a marker far away is the way, not the work)
        const wq = wp ? proj(wp.x, wp.y + 1, wp.z) : null; const wk = wp ? (H.kind + (H.job ? '/' + H.job : '')) : null, wdist = wp ? Math.hypot(wp.x - p.x, wp.z - p.z) : null;
        const goal = window.__TWIN ? __TWIN.goal() : null;
        const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.left > -100 && r.right < innerWidth + 100 && getComputedStyle(e).display !== 'none'; };
        const gEl = document.querySelector('.tw-goal');
        { const dead = !(mk.length > 0 || (gEl && vis(gEl) && !/-999/.test(gEl.style.transform)) || (sp && sp.job === 'back') || (window.__HANDS && window.__HANDS.twin) || document.querySelector('.tw-btn.awake') || document.querySelector('.gm-modal.on'));
          const now = performance.now(); if (dead) { if (!R.d0) R.d0 = now; if (now - R.d0 > 2000 && !R.dsnap) { const L = window.__GAME_LOG; R.dsnap = { at: Math.round(R.d0), tw: __T.game._.twin && __T.game._.twin(), ev: L.slice(-14).map((e) => e.type + (e.d && (e.d.job || e.d.id) ? ':' + (e.d.job || e.d.id) : '') + '@' + Math.round((e.t - R.d0) / 100) / 10), sheet: !!document.querySelector('.gm.sheet-open'), hold: !!document.querySelector('.tw-hold'), big: (() => { try { return !!__BH_PARTS.juice.stats().big; } catch (e) { return null; } })(), cine: !!document.querySelector('.gm-cine.on, .sc-on'), gT: (document.querySelector('.tw-goal') || { style: {} }).style.transform, mkT: [...document.querySelectorAll('.tw-mk')].map((e) => e.style.transform).join(' | '), goalSpec: (() => { try { return JSON.stringify(__TWIN.goal()); } catch (e) { return 'err'; } })(), mkProj: (() => { try { const tw = __T.game._.twin(); return tw.mk.map((m) => { const q = __T.view.projectRaw(m[1], __T.stages.groundAt(m[1], m[2]) + 5, m[2]); return [m[0], Math.round(q.x), Math.round(q.y), !!q.on]; }); } catch (e) { return 'err'; } })(), holdCls: document.querySelector('.gm') && document.querySelector('.gm').className, pill: (document.querySelector('.gm-next') || {}).innerText }; R.dsnaps.push(R.dsnap); } } else { R.d0 = 0; R.dsnap = null; } }
        let occl = null; try { const cq = {}; __T.view.camNow(cq); const id = __T.game.state.focus || 'har'; occl = __T.stages.frameBlocked(cq.px, cq.py, cq.pz, p.x, p.y + 1.6, p.z, id) && __T.stages.frameBlocked(cq.px, cq.py, cq.pz, p.x, p.y + 3.4, p.z, id); } catch (e) { occl = null; }
        const mg = __BH_MUSIC.get(); R.samp.push({ occl, wk, wdist, ms: mg.state, mb: mg.bpm, mw: mg.want, t: performance.now(), x: p.x, z: p.z, hs: hq, ws: wq, job: sp ? sp.job : null, nmk: mk.length, goal: !!goal, goalEl: !!(gEl && vis(gEl) && !/-999/.test(gEl.style.transform)), hands: !!(window.__HANDS && window.__HANDS.twin), ptr: R.ptr, modal: !!document.querySelector('.gm-modal.on'), awake: !!document.querySelector('.tw-btn.awake') });
      } catch (e) { /* */ }
    }, 250);
  });
  for (const site of LIST) {
    const tag = `[${site}]`, t1 = Date.now();
    // (the fixture swaps the save under a running job: the kid first lets the job he is in finish — a pending strike card, a craft under his hands — so no stage inherits the last one's; the real game never switches stage under a job)
    for (let k = 0; k < 40; k++) {
      const busy = await G(() => { const L = __T.game.loop; return !!((L && L.busy && L.busy()) || (L && L.strike && L.strike()) || (window.__HANDS && window.__HANDS.twin) || (__T.stages.hero && __T.stages.hero.dashing) || (__T.game._.twin && __T.game._.twin().heroBusy) || document.querySelector('.gm-modal.on')); });
      if (!busy) break;
      const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); continue; }
      const bt = await G(() => { const b = document.querySelector('.tw-btn'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (bt) { await tap(bt.x, bt.y); await pg.waitForTimeout(450); } else await pg.waitForTimeout(450);
    }
    const e0 = errs.length;
    const L0 = await G((site) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
      g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
      __T.game._.resync(); return window.__GAME_LOG.length;
    }, site);
    const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
    if (!on) { rows.push({ site, off: true }); console.log(tag + ' twin never came on'); continue; }
    // the arrival: the deal of THIS stage is shown (≤ 8 s) — a tap in the 0.1 s after a save swap would pick the stage before's marker (the stale card of a stage that is done: nothing starts, the deal waits for a tap that never comes); then the clock starts
    await waitFor(([n, id]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal' && e.d.id === id) || (window.__TWIN && __TWIN.spec() && __TWIN.spec().job === 'banker'), [L0, site], 8000);
    await pg.waitForTimeout(600);
    // the arrival: the fixture's own place for him (his banker), then the clock starts
    const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, site);
    /* (no placing: he arrives where the stage before left him — the real arrival) */
    const tA = await G(() => { window.__R.samp.length = 0; window.__R.ans.length = 0; window.__R.music.length = 0; window.__R.btnDown.length = 0; window.__R.acts.length = 0; window.__R.dsnaps.length = 0; window.__R.d0 = 0; window.__R.dsnap = null; return performance.now(); });
    const tStart = Date.now(); let lastCompass = -9, lastLabel = '', nearWait = 0, compass = 0, best = null, bestT = 0, fdown = false, firstWork = null, sheetsClosed = 0, cardsTapped = 0, steps = 0, nextMusic = 0, shotDone = false; const trace = [];
    const stateOf = () => G(() => {
      const vis = (e) => { if (!e) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight; };
      const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      const modal = [...document.querySelectorAll('.gm-modal')].find(vis); const gold = modal && ([...modal.querySelectorAll('.gm-btn-gold')].find(vis) || [...modal.querySelectorAll('.gm-btn')].find(vis));
      const deal = document.querySelector('.gm-deal.on'); const dealBtn = deal && [...deal.querySelectorAll('.gm-jc, .gm-btn')].find(vis);
      const mg = document.querySelector('.fx-mg.on'); const mgBtn = mg && [...mg.querySelectorAll('button')].find(vis);
      const btn = document.querySelector('.tw-btn'); const marks = [...document.querySelectorAll('.tw-mk')].filter(vis).map((e) => ({ ...box(e), near: e.classList.contains('near'), label: (e.children[1] && e.children[1].textContent) || '' }));
      const goal = [...document.querySelectorAll('.tw-goal')].find(vis); const bub = document.querySelector('.gm-bub'); const shx = document.querySelector('.gm.sheet-open .gm-sheet .gm-x');
      const p = __T.stages.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z);
      return { modal: modal ? { b: gold ? box(gold) : null, txt: modal.innerText.replace(/\s+/g, ' ').slice(0, 50) } : null, dealBtn: dealBtn ? box(dealBtn) : null, mg: mgBtn ? box(mgBtn) : (mg ? {} : null),
        btn: btn && vis(btn) ? { ...box(btn), awake: btn.classList.contains('awake') } : null, marks, goal: goal ? box(goal) : null, coach: bub && vis(bub) ? box(bub) : null, sheetX: shx && vis(shx) ? box(shx) : null, hero: { x: q.x, y: q.y }, spec: window.__TWIN ? (__TWIN.spec() || {}).job : null, specLabel: window.__TWIN ? (__TWIN.spec() || {}).label : null };
    });
    while ((Date.now() - tStart) / 1000 < SECS) {
      const el = (Date.now() - tStart) / 1000;
      if (el >= nextMusic) { nextMusic += 10; const mu = await G(() => new Promise((res) => { const M = __BH_MUSIC; M.meter(); let n = 0, ss = 0, mx = 0; const iv = setInterval(() => { const m = M.meter(); ss += m * m; mx = Math.max(mx, m); if (++n >= 10) { clearInterval(iv); const g = M.get(), bt = M.beat(); res({ t: performance.now(), state: g.state, want: g.want, bpm: g.bpm, period: bt ? bt.period : null, db: ss > 0 ? 10 * Math.log10(ss / n) : -99, pk: mx > 0 ? 20 * Math.log10(mx) : -99, running: g.running, sheet: document.getElementsByClassName('sheet-open').length, modal: document.getElementsByClassName('gm-modal').length }); } }, 60); }));
        await G((m) => window.__R.music.push(m), mu); }
      if (!shotDone && el > 12) { shotDone = true; await shot(site + '-play'); }
      const s = await stateOf(); steps++;
      let act = '';
      if (s.sheetX) { if (fdown) { await up(1); fdown = false; } act = 'sheet-close'; sheetsClosed++; await tap(s.sheetX.x, s.sheetX.y); await pg.waitForTimeout(400); }
      else if (s.modal && s.modal.b) { if (fdown) { await up(1); fdown = false; } act = 'card'; cardsTapped++; await tap(s.modal.b.x, s.modal.b.y); await pg.waitForTimeout(500); }
      else if (s.mg) { if (fdown) { await up(1); fdown = false; } act = 'SHEET'; if (s.mg.x) await tap(s.mg.x, s.mg.y); await pg.waitForTimeout(500); }
      else if (s.dealBtn) { act = 'deal'; await tap(s.dealBtn.x, s.dealBtn.y); await pg.waitForTimeout(500); }
      else if (s.btn && s.btn.awake) {
        if (fdown) { await up(1); fdown = false; }
        act = 'work'; if (s.specLabel) lastLabel = s.specLabel; if (firstWork == null) firstWork = Math.round(el * 10) / 10;
        for (let k = 0; k < 3; k++) { await down(2, s.btn.x, s.btn.y); await pg.waitForTimeout(50); await up(2); await pg.waitForTimeout(260); }
      } else {
        const fresh = s.marks.filter((m) => m.label !== lastLabel);   // (a kid takes the OTHER card after one: every job of the deal gets played)
        const tgt = fresh.find((m) => !m.near) || s.marks.find((m) => !m.near) || s.marks[0] || s.goal;
        if ((fresh.length ? fresh : s.marks).some((m) => m.near)) { if (fdown) { await up(1); fdown = false; } act = 'near-wait'; await pg.waitForTimeout(500); nearWait++; if (nearWait > 8 && s.goal) { await tap(s.goal.x, s.goal.y); compass++; nearWait = 0; } }
        else if (!s.marks.length && s.goal && el - lastCompass > 2.5) { if (fdown) { await up(1); fdown = false; } act = 'COMPASS (the arrow)'; compass++; lastCompass = el; await tap(s.goal.x, s.goal.y); await pg.waitForTimeout(1800); }   // (a work off the screen: the arrow at the edge IS the button — a tap brings him there in ≤ 1.5 s)
        else if (tgt) {
          // stuck (the distance to the target has not shrunk for 6 s): the compass — the arrow's button — as a child would tap it
          const dist = Math.hypot(tgt.x - s.hero.x, tgt.y - s.hero.y); if (best == null || dist < best - 8) { best = dist; bestT = el; }
          if (el - bestT > 6 && s.goal) { if (fdown) { await up(1); fdown = false; } act = 'COMPASS'; compass++; await tap(s.goal.x, s.goal.y); await pg.waitForTimeout(1800); best = null; bestT = el; continue; }
          let dx = tgt.x - s.hero.x, dy = tgt.y - s.hero.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; act = 'walk';
          if (!fdown) { await down(1, 170, 300); fdown = true; }
          await move(1, 170 + dx * 55, 300 + dy * 55); await pg.waitForTimeout(Math.min(900, 250 + l * 3));
        } else {
          if (fdown) { await up(1); fdown = false; }
          act = s.coach ? 'coach' : 'wait'; await pg.waitForTimeout(700);   // (a bubble is read, not tapped: its centre sits on the HUD's pill, whose tap opens the stage's sheet)
        }
      }
      if (trace.length < 400) trace.push(`${el.toFixed(1)}:${act}`);
    }
    if (fdown) await up(1);
    // ── the numbers ──
    const D = await G(([tA, L0]) => {
      const R = window.__R, log = window.__GAME_LOG.filter((e) => e.t >= tA), S = R.samp.filter((s) => s.t >= tA);
      return { dsnaps: R.dsnaps.slice(), acts: R.acts.filter((a) => a.t >= tA), samp: S, ans: R.ans.filter((a) => a.t >= tA), music: R.music, btnDown: R.btnDown, log: log.map((e) => ({ t: e.t, type: e.type, job: e.d && e.d.job, by: e.d && e.d.by })) };
    }, [tA, L0]);
    const row = { site, tA, firstWork, cards: cardsTapped, compass, sheets: sheetsClosed, steps };
    // markers / the arrow within 10 s of arrival
    const first10 = D.samp.filter((s) => s.t - tA <= 10000);
    row.mk10 = first10.some((s) => s.nmk > 0 || s.goalEl || s.job === 'back' || s.hands || s.awake);   // (a marker, the arrow, "↩ לעבודה", or a job already running under his hands)
    { let run = 0, mx = 0, tot = 0; for (let i = 1; i < D.samp.length; i++) { const c = D.samp[i]; const dead = !(c.nmk > 0 || c.goalEl || c.job === 'back' || c.hands || c.awake || c.modal); const dt = Math.min(0.75, (c.t - D.samp[i - 1].t) / 1000); /* (a stalled page — SwiftShader's slow frames — is not dead time) */ if (dead) { run += dt; tot += dt; mx = Math.max(mx, run); } else run = 0; } row.jobs = [...new Set(D.log.filter((e) => e.type === 'jobDone').map((e) => e.job))];
    row.deadSnaps = D.dsnaps.map((d) => ({ at: Math.round((d.at - tA) / 100) / 10, sheet: d.sheet, hold: d.hold, big: d.big, cine: d.cine, gT: d.gT, mkT: d.mkT, goalSpec: d.goalSpec, mkProj: d.mkProj, cls: d.holdCls, pill: d.pill, ev: d.ev.join(' '), tw: d.tw && { dealOpen: d.tw.dealOpen, marks: d.tw.marks, jobBusy: d.tw.jobBusy, SC: d.tw.SC, momentBusy: d.tw.momentBusy, overlay: d.tw.overlay, heroBusy: d.tw.heroBusy, s21: d.tw.s21 } }));
    row.dead = Math.round(tot * 10) / 10; row.deadMax = Math.round(mx * 10) / 10; }   // (seconds with nothing on screen to follow)
    { let off = 0; const ex = []; for (let i = 1; i < D.samp.length; i++) { const c = D.samp[i]; if (c.ms !== 'work' || c.mb !== 124) { off += (c.t - D.samp[i - 1].t) / 1000; if (ex.length < 3 && (!ex.length || c.t - ex[ex.length - 1].t0 > 3000)) ex.push({ t0: c.t, at: Math.round((c.t - tA) / 100) / 10, state: c.ms, want: c.mw, bpm: c.mb, ev: D.log.filter((e) => e.t <= c.t && e.t > c.t - 3000).map((e) => e.type).filter((t, k, a2) => a2.indexOf(t) === k).slice(-5).join(',') }); } } row.musicOff = Math.round(off * 10) / 10; row.musicEx = ex.map(({ t0, ...r }) => r); }   // (seconds the score was not the work state at 124)
    row.mkAt = (() => { const s = D.samp.find((s) => s.nmk > 0 || s.goalEl || s.job === 'back' || s.hands); return s ? Math.round((s.t - tA) / 100) / 10 : null; })();
    // autonomous walks
    const evs = D.log, walks = []; let cur = null;
    for (let i = 1; i < D.samp.length; i++) {
      const a = D.samp[i - 1], c = D.samp[i], d = Math.hypot(c.x - a.x, c.z - a.z);
      const quiet = c.ptr === 0 && c.t - (D.lastPtr || 0) > 0;   // (lastPtr is per-run, see below)
      c.moved = d;
    }
    // the pointer clock: from the samples' ptr (0) we need the last pointer event; the page keeps R.lastPtr only at the end, so re-derive: a sample window where ptr>0 or the next 1.5 s
    let lastTouchT = -1e9;
    for (let i = 1; i < D.samp.length; i++) {
      const c = D.samp[i]; if (c.ptr > 0 || D.samp[i - 1].ptr > 0) lastTouchT = c.t;
      const jobT = Math.max(...evs.filter((e) => e.t <= c.t && (e.type === 'jobStart' || e.type === 'twinGoTo' || e.type === 'twinBack')).map((e) => e.t), -1e9);
      const auto = c.t - tA > 1500 && c.t - D.samp[i - 1].t < 1000 && c.moved > 0.25 && c.t - lastTouchT > 1500 && c.t - jobT > 1500;
      if (auto) { if (!cur || c.t - cur.t1 > 1200) { cur = { t0: c.t, t1: c.t, x: Math.round(c.x), z: Math.round(c.z), d: 0, before: evs.filter((e) => e.t <= c.t && e.t > c.t - 5000 && !/^(twinPips|twinBub|mark|caArm|caRun|score|twinGrade|twinBtn|mgPath|craftTap|craft)$/.test(e.type)).map((e) => `${e.type}${e.job ? ':' + e.job : ''}@${Math.round((e.t - c.t) / 100) / 10}`).slice(-7).join(',') }; walks.push(cur); } cur.t1 = c.t; cur.d += c.moved; }
    }
    row.teleports = walks.filter((w) => w.t1 - w.t0 < 600 && w.d > 14).length;
    row.walks = walks.filter((w) => !(w.t1 - w.t0 < 600 && w.d > 14)).map((w) => ({ at: Math.round((w.t0 - tA) / 100) / 10, x: w.x, z: w.z, len: Math.round(w.d), s: Math.round((w.t1 - w.t0) / 100) / 10, before: w.before }));
    // acts and their four answers
    const ACT = new Set(['craftAct', 'strike', 'stroke']);
    const actsT = [], srcs = []; const allA = D.acts.concat(evs.filter((e) => ACT.has(e.type) && e.by !== 'crew').map((e) => ({ t: e.t, src: 'ev:' + e.type + (e.job ? '/' + e.job : '') }))).sort((a, b) => a.t - b.t);
    for (const a of allA) if (!actsT.length || a.t - actsT[actsT.length - 1] > 250) { actsT.push(a.t); srcs.push(a.src); }
    const win = (lo, hi) => { let all = 0; const c = { dust: 0, hit: 0, buzz: 0, sound: 0 }; for (const t of actsT) { const f = { dust: near('dust', t, lo, hi), hit: near('hit', t, lo, hi), buzz: near('buzz', t, lo, hi), sound: near('sound', t, lo, hi) }; for (const k in f) if (f[k]) c[k]++; if (f.dust && f.hit && f.buzz && f.sound) all++; } return { all, ...c }; };
    const near = (k, t, lo, hi) => D.ans.some((a) => a.k === k && a.t >= t + lo && a.t <= t + hi);
    row.unans = {}; actsT.forEach((t, i) => { const u = row.unans[srcs[i]] || (row.unans[srcs[i]] = { n: 0, noDust: 0, noFloat: 0, noBuzz: 0, noSound: 0 }); u.n++; if (!near('dust', t, -250, 250)) u.noDust++; if (!near('hit', t, -250, 250)) u.noFloat++; if (!near('buzz', t, -250, 250)) u.noBuzz++; if (!near('sound', t, -250, 250)) u.noSound++; });
    row.acts = actsT.length; row.apm = Math.round(actsT.length * 60 / SECS * 10) / 10;
    row.ans50 = win(-250, 250); row.ans1s = win(-300, 1500);
    row.hitCalls = D.ans.filter((a) => a.k === 'hit').length;
    // music
    row.music = D.music.map((m) => ({ s: m.state, w: m.want, bpm: m.bpm, per: m.period && Math.round(m.period * 1000) / 1000, db: Math.round(m.db), pk: Math.round(m.pk), sheet: m.sheet, modal: m.modal, run: m.running }));
    // framing
    const inMid = (q) => q && q.on !== false && q.x >= W * 0.15 && q.x <= W * 0.85 && q.y >= H * 0.15 && q.y <= H * 0.85;
    const fs = D.samp.filter((s) => !s.modal);
    row.nS = fs.length; row.heroIn = fs.filter((s) => inMid(s.hs)).length; row.workIn = fs.filter((s) => s.ws && s.wdist <= 12 && inMid(s.ws)).length; row.workN = fs.filter((s) => s.ws && s.wdist <= 12).length; row.workFar = fs.filter((s) => s.ws && s.wdist > 12).length;   // (judged once he has arrived at it: ≤ 12 amot; the walk to a bench far away is the follow camera's)
    row.bothIn = fs.filter((s) => inMid(s.hs) && (!s.ws || inMid(s.ws))).length;
    row.heroOnScreen = fs.filter((s) => s.hs && s.hs.on && s.hs.x > 0 && s.hs.x < W && s.hs.y > 0 && s.hs.y < H).length;
    { const F = FOOT[site] || []; const inF = D.samp.filter((q) => F.some((r) => q.x > r[0] + 0.3 && q.x < r[2] - 0.3 && q.z > r[1] + 0.3 && q.z < r[3] - 0.3)); row.inFoot = inF.length; row.inFootAt = inF.length ? [Math.round(inF[0].x), Math.round(inF[0].z)] : null; }
    { const by = {}; for (const q of fs) if (q.ws && q.wk && q.wdist <= 12) { const b = by[q.wk] || (by[q.wk] = { n: 0, inn: 0, d: 0, hin: 0 }); b.n++; b.d += q.wdist; if (inMid(q.ws)) b.inn++; if (inMid(q.hs)) b.hin++; } row.fr = Object.fromEntries(Object.entries(by).map(([k, b]) => [k, { n: b.n, work: Math.round(100 * b.inn / b.n), hero: Math.round(100 * b.hin / b.n), dist: Math.round(b.d / b.n * 10) / 10 }])); }
    { const ring = (x, z) => x > -193 && x < 147 && z > -73.5 && z < 73.5 && !(x > -187 && x < 141 && z > -67.5 && z < 67.5) && !(x > 141 && Math.abs(z) < 13); const q = D.samp.filter((c) => ring(c.x, c.z)); row.inRing = q.length; row.inRingAt = q.length ? [Math.round(q[0].x), Math.round(q[0].z)] : null; }   // (the finished wall's ring: his body is never in it)
    row.occl = fs.filter((q) => q.occl).length; { const o = fs.filter((q) => q.occl); row.occlAt = o.length ? [o[0], o[o.length >> 1], o[o.length - 1]].map((q) => [Math.round(q.x), Math.round(q.z), Math.round((q.t - tA) / 1000)]) : null; }   // (samples whose line from the camera to his chest AND to his head runs through a built mass)
    row.errs = errs.slice(e0);
    row.trace = trace.slice(0, 60).join(' ');
    // the kodesh: never inside
    if (site === 'kodesh') { row.minX = Math.round(Math.min(...D.samp.map((s) => s.x))); row.inKodesh = D.samp.filter((q) => q.x > -176 && q.x < -139 && q.z > -35 && q.z < 35).length; }   // (the Kodesh HaKodashim's block: never entered)
    rows.push(row);
    fs_.writeFileSync(path.join(OUT, site + '.json'), JSON.stringify(row, null, 1));
    const pc = (n, d) => d ? Math.round(100 * n / d) + '%' : '-';
    console.log(`${tag} first work ${firstWork}s · markers≤10s ${row.mk10} (at ${row.mkAt}s) · auto-walks ${row.walks.length}${row.teleports ? ' (+' + row.teleports + ' placed)' : ''} ${JSON.stringify(row.walks.slice(0, 3))} · acts ${row.acts} (${row.apm}/min, hit calls ${row.hitCalls}) all-four±250ms ${pc(row.ans50.all, row.acts)} (dust ${row.ans50.dust} float ${row.ans50.hit} buzz ${row.ans50.buzz} sound ${row.ans50.sound}) ≤1.5s ${pc(row.ans1s.all, row.acts)} · framing hero ${pc(row.heroIn, row.nS)} work ${pc(row.workIn, row.workN)} both ${pc(row.bothIn, row.nS)} · frByCraft ${JSON.stringify(row.fr)} · jobsDone ${(row.jobs || []).join('+')} · nothing-to-follow ${row.dead}s (max ${row.deadMax}s)${row.deadSnaps.length ? ' ' + JSON.stringify(row.deadSnaps.slice(0, 2)) : ''} · musicOff ${row.musicOff}s${row.musicOff ? ' ' + JSON.stringify(row.musicEx) : ''} · music ${row.music.map((m) => `${m.s}/${m.bpm}/${m.db}dB`).join(' ')} · unanswered ${JSON.stringify(Object.fromEntries(Object.entries(row.unans).filter(([k, u]) => u.noDust || u.noFloat || u.noBuzz || u.noSound)))} · inKodesh ${row.inKodesh == null ? '-' : row.inKodesh} · hiddenBehindMass ${row.occl}/${row.nS}${row.occl ? ' at ' + JSON.stringify(row.occlAt) : ''} · inWallRing ${row.inRing}${row.inRing ? ' at ' + row.inRingAt : ''} · inFootprint ${row.inFoot}${row.inFoot ? ' at ' + row.inFootAt : ''} · compass ${row.compass} · errs ${row.errs.length} · ${Math.round((Date.now() - t1) / 1000)} s`);
  }
  // ── the verdicts (the brief's bars, per stage) ──
  const fails = [], warns = []; const chk = (st, name, ok, info = '') => { if (!ok) fails.push(`${st} · ${name}${info ? ' · ' + info : ''}`); };
  for (const r of rows) {
    if (r.off) { fails.push(`${r.site} · twin never came on`); continue; }
    const longWalks = (r.walks || []).filter((w) => w.s > 1.6 || w.len > 14);
    const med = (() => { const a = (r.music || []).slice(1).map((m) => m.db).sort((x, y) => x - y); return a.length ? a[a.length >> 1] : -99; })();
    chk(r.site, 'first work ≤ 20 s', r.firstWork != null && r.firstWork <= 20, `${r.firstWork}`);
    chk(r.site, 'a marker / the arrow / the work within 10 s', r.mk10);
    chk(r.site, 'no long walk by himself (> 1.6 s or > 14 amot, touch-free)', longWalks.length === 0, JSON.stringify(longWalks.slice(0, 2)));
    chk(r.site, 'music: work state at 124 BPM all the time', r.musicOff === 0 && (r.music || []).every((m) => m.s === 'work' && m.bpm === 124), `off ${r.musicOff}s`);
    chk(r.site, 'bed level within −18…−30 dB (median of the 10-read RMS)', med <= -18 && med >= -30, `${med} dB`);
    chk(r.site, '≥ 90 % of the acts answer four ways', !r.acts || r.ans50.all / r.acts >= 0.9, `${r.ans50.all}/${r.acts}`);
    chk(r.site, 'he is in the middle 70 % ≥ 80 % of the time', r.nS === 0 || r.heroIn / r.nS >= 0.8, `${r.heroIn}/${r.nS}`);
    chk(r.site, 'his work (arrived) is in the middle 70 % ≥ 80 % of the time', r.workN < 5 || r.workIn / r.workN >= 0.8, `${r.workIn}/${r.workN}`);
    chk(r.site, 'no console errors', r.errs.length === 0, r.errs.slice(0, 1).join(' '));
    if (r.nS && r.occl / r.nS > 0.1) warns.push(`${r.site} · the line from the camera to his chest AND head runs through a built mass in ${r.occl}/${r.nS} samples (a warning, not a verdict: the stage's own floors and footings count as masses to frameBlocked) ${JSON.stringify(r.occlAt)}`);
    if (r.site !== 'wall' && r.site !== 'gates' && r.inRing) warns.push(`${r.site} · he stood inside the finished wall's ring in ${r.inRing} samples at ${r.inRingAt} (the stick may still walk into it — open: a crossing by the compass first)`);
    if (r.site === 'kodesh') chk(r.site, 'never inside the Kodesh HaKodashim', r.inKodesh === 0, `${r.inKodesh}`);
  }
  if (warns.length) console.log('\nWARN\n  ' + warns.join('\n  '));
  console.log('\n' + (fails.length ? 'FAIL ' + fails.length + '\n  ' + fails.join('\n  ') : 'PASS all verdicts') + '  (' + rows.length + ' stages)');
  console.log('\nERRORS ' + errs.length + ' ' + errs.slice(0, 4).join(' | ').slice(0, 400));
  await b.close();
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
const fs_ = fs;
