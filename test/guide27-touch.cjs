// GUIDE27 (WAVE27: never lost, never idle, one world), by real touch on dist/test.html#avodah at 844×390:
//  hud    — "עכשיו: לך ל<place> — <task>" (the primary) and "בינתיים: ___" (the meanwhile)
//  arrow  — the arrow chip is on screen whenever the primary's marker is off-screen (sampled from 5 places); the floor's path of discs is shown
//  walk   — a tap on the arrow chip walks him (no fade) to the marker; the work button wakes there; the stick takes over at any touch
//  idle   — 3 s: he turns and the marker pulses · 8 s: the ממונה calls "לכאן" once · 20 s: he walks there by himself; any input cancels;
//           during a work the ladder is off
//  never  — ≥ 2 open at every hour 4…17 (he finishes everything open at each hour; practice fills)
//  skip   — only meanwhile open + still 6 s → the skip card; "קפוץ" runs the clock to 10 min before; it never returns for that gap
//  world  — Phase A's invitation (bh_avodah_intent) and #avodah=live enter the day: no sheet (.av-mg / .fx-mg-sheet) opens in landscape
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/guide27-touch.cjs --no-build [--noshots] [--only=hud,arrow,walk,idle,never,skip,world]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/guide27');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'אביתר', mishmar: 3, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const open = async (hash, intent) => {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(([sv, it]) => { try { if (!sessionStorage.getItem('g27')) { sessionStorage.setItem('g27', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); if (it) localStorage.setItem('bh_avodah_intent', it); } } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__G27SHEET = 0; const ob = () => new MutationObserver(() => { if (document.querySelector('.av-mg, .fx-mg-sheet')) window.__G27SHEET++; }).observe(document.documentElement, { childList: true, subtree: true }); if (document.documentElement) ob(); else document.addEventListener('DOMContentLoaded', ob); }, [SAVE, intent || '']);
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html' + hash));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    return { ctx, pg, errs };
  };
  try {
    const { ctx, pg, errs } = await open('#avodah');
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tapAt = async (x, y) => { await down(7, x, y); await pg.waitForTimeout(70); await up(7); };
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/guide27/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const st = () => G(() => __DAY.g27.state());
    const hero = () => G(() => { const h = {}; __T.stages.heroXYZ(h); return { x: +h.x.toFixed(1), z: +h.z.toFixed(1) }; }).catch(() => G(() => { const p = __DAY.ctxFor('fire').hero(); return { x: +p.x.toFixed(1), z: +p.z.toFixed(1) }; }));
    const heroP = () => G(() => { const p = __DAY.ctxFor('fire').hero(); return { x: +p.x.toFixed(1), z: +p.z.toFixed(1), yaw: +(p.yaw || 0).toFixed(2) }; });
    void hero;
    const placeOf = (id) => G((id) => { const k = __DAY.tasks.get(id); const p = __DAY.D.PLACE[k.place]; return { x: p.x, z: p.z }; }, id);
    const goalC = () => G(() => { const g = document.querySelector('.tw-goal'); if (!g || /-999/.test(g.style.transform || '-999')) return null; const r = g.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on') && __DAY.g27, null, 60000);
    check('Phase B day mode is on (twin + __DAY + the guide)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);
    // the dawn, at a fixed spot; the clock held (the ladder runs on real time)
    const setHour = async (h) => { await G((h) => { __DAY.clock.resume(); __DAY.clock.skipTo(h); __DAY.tasks.sync(); __DAY.D.refresh(); __DAY.clock.pause(); }, h); await pg.waitForTimeout(700); };
    const far = async (id) => { const q = await placeOf(id); const spots = [[-20, -50], [-60, 20], [-100, -30], [-20, 40], [-150, -50]]; /* (the azara: from the women's court a 7.5-amah ledge stands at Nikanor — no walk up it, the arrow fades him there) */ let best = spots[0], bd = 0; for (const s of spots) { const d = Math.hypot(s[0] - q.x, s[1] - q.z); if (d > bd) { bd = d; best = s; } } await G((p) => __DAY.teleport({ x: p[0] + 2.6, z: p[1] - 0.6 }), best); await pg.waitForTimeout(900); return best; };
    await setHour(4.7);

    // ───────── hud ─────────
    if (want('hud')) {
      await G(() => __DAY.g27.input()); await pg.waitForTimeout(3900);   // (the quiet "הכהנים סיימו" line holds line 3 for 3.5 s)
      const s = await st(), hud = await G(() => __DAY.hud());
      check('[hud] a primary and a meanwhile at the dawn', !!s.primary && !!s.meanwhile, `${s.primary} / ${s.meanwhile} · open ${s.open.join(',')}`);
      check('[hud] line 2: "עכשיו: לך ל<place> — <task>" (or "— כאן")', /^עכשיו: (לך ל\S.* — \S.*|\S.* — כאן)$/.test(hud.h2), hud.h2);
      check('[hud] line 3: "בינתיים: ___"', /^בינתיים: \S/.test(hud.h3), hud.h3);
      check('[hud] "N בקשות פתוחות" is gone while a task is primary', !/בקשות פתוחות/.test(hud.h2));
      await shot('g27-01-hud-dawn');
    }

    // ───────── arrow ─────────
    if (want('arrow')) {
      const s = await st(); const pid = s.primary;
      let n = 0, bad = [];
      for (const sp of [[-20, -50], [-100, -30], [60, 0], [-150, -50], [-20, 40]]) {
        await G((p) => __DAY.teleport({ x: p[0] + 2.6, z: p[1] - 0.6 }), sp); await G(() => __DAY.g27.input());
        await pg.waitForTimeout(1600);
        const r = await G((id) => { const k = __DAY.tasks.get(id); const p = __DAY.D.PLACE[k.place]; const c = __DAY.ctxFor(id); const q = c.project(p.x, c.ground(p.x, p.z) + 2, p.z); const W = innerWidth, H = innerHeight; const off = !q.on || q.x < 70 || q.x > W - 70 || q.y < 110 || q.y > H - 70; const g = document.querySelector('.tw-goal'); const shown = !!g && !/-999/.test(g.style.transform || '-999'); const spec = __TWIN.spec(); return { off, shown, spec: !!spec, q: [Math.round(q.x), Math.round(q.y), q.on] }; }, pid);
        if (r.off && !r.spec) { n++; if (!r.shown) bad.push(JSON.stringify([sp, r.q])); }
      }
      check('[arrow] the arrow chip shows whenever the primary marker is off-screen', n >= 2 && !bad.length, `${n} off-screen samples; misses: ${bad.join(' ')}`);
      const s2 = await st();
      check('[arrow] the floor path of discs is shown toward it', s2.path.vis && s2.path.n >= 1, JSON.stringify(s2.path));
      await shot('g27-02-arrow-path');
    }

    // ───────── walk ─────────
    if (want('walk')) {
      await setHour(4.7); const s = await st(); const pid = s.primary; const q = await placeOf(pid);
      await far(pid); await G(() => __DAY.g27.input()); await pg.waitForTimeout(800);
      const gc = await goalC();
      check('[walk] the arrow chip is on screen (far from the primary)', !!gc, JSON.stringify(gc));
      if (gc) {
        const h0 = await heroP();
        await tapAt(gc.x, gc.y); await pg.waitForTimeout(400);
        const w1 = await st();
        check('[walk] a tap on the arrow starts the walk (no fade)', w1.walk.on && w1.walk.why === 'tap' && !(await G(() => document.querySelector('.dy-fade.on'))), JSON.stringify(w1.walk));
        await pg.waitForTimeout(1200); const h1 = await heroP();
        check('[walk] he moves along the way (not a jump)', Math.hypot(h1.x - h0.x, h1.z - h0.z) > 3 && Math.hypot(h1.x - q.x, h1.z - q.z) > 2.8, `${JSON.stringify(h0)} → ${JSON.stringify(h1)}`);
        await shot('g27-03-walking');
        const arr = await waitFor((id) => { const s = __DAY.g27.state(); return !s.walk.on && s.walk.arrived && s.walk.arrived.id === id; }, pid, 30000);
        const h2 = await heroP();
        check('[walk] the walk reaches the marker (≤ 3 amot)', arr && Math.hypot(h2.x - q.x, h2.z - q.z) <= 3.2, `${JSON.stringify(h2)} → ${q.x},${q.z}`);
        const btn = await waitFor((id) => { const sp = __TWIN.spec(); return !!sp && sp.job === id; }, pid, 6000);
        check('[walk] the work button wakes at the marker', btn);
        await shot('g27-04-arrived');
      }
      // the stick takes over
      await far(pid); await G(() => __DAY.g27.input()); await pg.waitForTimeout(600);
      await G(() => __DAY.g27.goTo()); await pg.waitForTimeout(500);
      const z = await G(() => { const r = document.querySelector('.tw-zone').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await down(5, z.x, z.y); await move(5, z.x + 40, z.y); await pg.waitForTimeout(500);
      const ws = await st(); await up(5); await pg.waitForTimeout(300);
      check('[walk] the stick takes over at any touch', !ws.walk.on && ws.walk.why === 'stick', JSON.stringify(ws.walk));
    }

    // ───────── idle ─────────
    if (want('idle')) {
      await setHour(4.75); const pid = (await st()).primary;
      await far(pid);
      await G(() => { __DAY.g27.input(); window.__G27E = []; const e = document.querySelector('.dy-say'); new MutationObserver(() => { if (e.classList.contains('on')) window.__G27E.push(e.textContent); }).observe(e, { attributes: true, childList: true, subtree: true }); });
      const y0 = (await heroP()).yaw, t0 = await G(() => performance.now());
      await pg.waitForTimeout(2000);
      // any input cancels: a touch on the stick's zone at 2 s
      { const z = await G(() => { const r = document.querySelector('.tw-zone').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await tapAt(z.x, z.y); } await pg.waitForTimeout(300);
      const c0 = await st();
      check('[idle] a touch resets the idle time', c0.idle < 1, `idle ${c0.idle}`);
      await pg.waitForTimeout(3400);
      const s3 = await st(); const pul = await G(() => [...document.querySelectorAll('.tw-mk.h26p')].length); const y1 = (await heroP()).yaw;
      check('[idle] 3 s: he turns toward the marker and it pulses', s3.log.some((l) => l[0] === 'turn' && l[1] === pid) && pul >= 1 && Math.abs(y1 - y0) > 0.05, `log ${JSON.stringify(s3.log)} pulse ${pul} yaw ${y0}→${y1}`);
      await shot('g27-05-idle-3s');
      await pg.waitForTimeout(5200);
      const s8 = await st(); const said = await G(() => window.__G27E.slice());
      check('[idle] 8 s: the ממונה there calls "לכאן" once', s8.log.filter((l) => l[0] === 'call' && l[2] >= t0).length === 1 && said.some((t) => /לכאן/.test(t)), JSON.stringify(said.slice(-2)));
      await shot('g27-06-idle-8s');
      await pg.waitForTimeout(12400);
      const s20 = await st();
      check('[idle] 20 s: he walks there by himself', s20.log.some((l) => l[0] === 'walk' && l[1] === pid) && (s20.walk.on || (s20.walk.arrived && s20.walk.arrived.id === pid)), JSON.stringify(s20.walk));
      const arr = await waitFor((id) => { const s = __DAY.g27.state(); return !s.walk.on && s.walk.arrived && s.walk.arrived.id === id; }, pid, 30000);
      check('[idle] …and waits at the marker', arr);
      await shot('g27-07-idle-arrived');
      // during a work the ladder is off
      const started = await G((id) => { __DAY.startWork(id); return true; }, pid);
      await pg.waitForTimeout(1500);
      await G(() => __DAY.g27.idle(25)); await pg.waitForTimeout(1500);
      const sw = await st();
      check('[idle] during a work the ladder is off', started && sw.idle < 3 && !sw.walk.on, `started ${started} idle ${sw.idle}`);
      // end the work's run: the test leaves it (a fresh hour below re-opens the list)
      await G(() => { try { __DAY.twin && __DAY.twin.onWork && 0; } catch (e) { /* */ } });
    }
    // a fresh page for the rest (a running work holds the day)
    await ctx.close();

    const P2 = await open('#avodah'); const pg2 = P2.pg, G2 = (fn, a) => pg2.evaluate(fn, a);
    const waitFor2 = (fn, a, ms = 8000) => pg2.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    await waitFor2(() => window.__DAY && __DAY.twin && __TWIN.on() && __DAY.g27, null, 60000); await pg2.waitForTimeout(800);
    const cdp2 = await P2.ctx.newCDPSession(pg2);
    const tap2 = async (x, y) => { await cdp2.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(x), y: Math.round(y), id: 9, radiusX: 6, radiusY: 6, force: 1 }] }); await pg2.waitForTimeout(70); await cdp2.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const shot2 = async (name) => { if (!SHOTS) return; await G2(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg2.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/guide27/' + name + '.png'); await G2(() => { window.__HUD_HOLD = false; }); };

    // ───────── never ─────────
    if (want('never')) {
      const rows = [];
      for (let h = 4; h <= 17; h++) {
        await G2((h) => { __DAY.clock.resume(); __DAY.clock.skipTo(h + 0.1); __DAY.tasks.sync(); for (const k of __DAY.tasks.open()) __DAY.tasks.done(k.id, 1); __DAY.D.refresh(); __DAY.clock.pause(); }, h);
        await pg2.waitForTimeout(1300);
        const r = await G2(() => ({ n: __DAY.tasks.open().length, ids: __DAY.tasks.open().map((k) => k.id + (k.practice ? '*' : '')), hud: __DAY.hud() }));
        rows.push(`${h}:${r.n}`); if (r.n < 2) console.log('   ', h, JSON.stringify(r));
        if (h === 9) { await shot2('g27-08-practice-9h'); console.log('    h3 at 9:', r.hud.h3, '|', r.ids.join(',')); }
      }
      check('[never] ≥ 2 open at every hour 4…17 (he did all; practice fills)', rows.every((r) => +r.split(':')[1] >= 2), rows.join(' '));
      const pr = await G2(() => __DAY.tasks.open().filter((k) => k.practice).map((k) => ({ id: k.id, pts: k.pts, pts0: k.pts0 })));
      check('[never] a practice task: the flag, half points', pr.length >= 1 && pr.every((k) => k.pts === Math.max(1, Math.round(k.pts0 / 2))), JSON.stringify(pr.slice(0, 3)));
    }

    // ───────── skip ─────────
    if (want('skip')) {
      // a gap: every primary open is done; only meanwhile (practice/queue) stays; a primary waits later
      await G2(() => { __DAY.clock.resume(); __DAY.clock.skipTo(17.05); __DAY.clock.pause(); });
      const h0 = 7.3;   // (a new day: the morning's gap between the dawn and the day — after the Tamid's last step, before the queue)
      await G2(() => { __DAY.D.dayEnd(); }); await waitFor2(() => !!document.querySelector('[data-dyend]'), null, 6000);
      await G2(() => { const b = document.querySelector('[data-dyend]'); if (b) b.click(); }); await pg2.waitForTimeout(800);
      await G2((h) => { __DAY.clock.resume(); __DAY.clock.skipTo(h); __DAY.tasks.sync(); for (const k of __DAY.tasks.open()) if (!__DAY.g27.isMeanwhile(k)) __DAY.tasks.done(k.id, 1); __DAY.D.refresh(); __DAY.clock.pause(); __DAY.g27.ensure(); __DAY.g27.input(); }, h0);
      await pg2.waitForTimeout(1200);
      const s0 = await G2(() => __DAY.g27.state());
      check('[skip] only meanwhile tasks open, a primary waits later', !s0.primary && !!s0.meanwhile && !!s0.next, JSON.stringify({ p: s0.primary, m: s0.meanwhile, next: s0.next, open: s0.open }));
      await G2(() => __DAY.g27.input());
      const card = await waitFor2(() => !!document.querySelector('.g27-skip.on'), null, 9000);
      const txt = await G2(() => (document.querySelector('.g27-skip') || {}).textContent || '');
      check('[skip] still 6 s → "המנוחה בלשכה — קפוץ אל …" with קפוץ / עוד לא', card && /המנוחה בלשכה — קפוץ אל/.test(txt) && /עוד לא/.test(txt), txt.slice(0, 90));
      await shot2('g27-09-skip-card');
      if (card) {
        const nx = await G2(() => { const s = __DAY.g27.state(); const k = __DAY.tasks.get(s.next); return { id: k.id, h: k.openH }; });
        const bc = await G2(() => { const r = document.querySelector('.g27-skip [data-g27="jump"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await tap2(bc.x, bc.y); await pg2.waitForTimeout(800);
        const h1 = await G2(() => __DAY.clock.now().h);
        check('[skip] "קפוץ" runs the clock to 10 minutes before that hour', Math.abs(h1 - (nx.h - 10 / 60)) < 0.05, `${h1.toFixed(3)} vs ${(nx.h - 10 / 60).toFixed(3)} (${nx.id})`);
        await G2(() => __DAY.g27.input()); await pg2.waitForTimeout(7500);
        const again = await G2(() => !!document.querySelector('.g27-skip.on'));
        check('[skip] the card never returns for the same gap', !again);
        await shot2('g27-10-after-jump');
      }
    }
    if (P2.errs.length) console.log('   errors:', P2.errs.slice(0, 4).join(' | '));
    check('no page errors (main pages)', !errs.length && !P2.errs.length, [...errs, ...P2.errs].slice(0, 2).join(' | '));
    await P2.ctx.close();

    // ───────── world ─────────
    if (want('world')) {
      for (const [hash, intent, label] of [['#avodah', 'shachar', 'the Phase A invitation (shachar)'], ['#avodah=live', '', '#avodah=live'], ['#avodah=deshen', '', 'a practice segment (#avodah=deshen)']]) {
        const P = await open(hash, intent); const g = (fn, a) => P.pg.evaluate(fn, a);
        const okDay = await P.pg.waitForFunction(() => window.__DAY && __DAY.D && __DAY.D.active && __TWIN.on(), null, { polling: 200, timeout: 60000 }).then(() => true, () => false);
        await P.pg.waitForTimeout(5000);
        const r = await g(() => ({ sheets: window.__G27SHEET, mg: !!document.querySelector('.av-mg, .fx-mg-sheet'), ev: (window.__GAME_LOG || []).filter((e) => /^g27/.test(e.type)).map((e) => e.type + ':' + JSON.stringify(e.d)).slice(0, 4), h: __DAY.clock.now().h, busy: window.__AVODAH && __AVODAH.busy }));
        check(`[world] ${label}: the day, no sheet opened`, okDay && !r.sheets && !r.mg && !r.busy, JSON.stringify(r));
        if (SHOTS && label.includes('live')) { await g(() => { __T.simulate(false); __T.render(); __T.render(); __T.simulate(true); }); await P.pg.screenshot({ path: path.join(OUT, 'g27-11-live.png') }); console.log('   shot test/out/guide27/g27-11-live.png'); }
        await P.ctx.close();
      }
    }
  } catch (e) { console.log('ERROR', e && e.stack); results.push(false); }
  await b.close();
  const pass = results.filter(Boolean).length;
  console.log(`\n${pass}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(pass === results.length ? 0 : 1);
})();
