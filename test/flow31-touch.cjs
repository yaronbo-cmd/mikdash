// ── flow31 ── flow31-touch.cjs — FLOW31 (WAVE31) by real touch on dist/test.html#shift=1 at 844×390:
//  button — the big button's two states: its word "לך ל…" exactly when he is farther than 3 amot from the next place, the act's verb within it
//  path   — on a take the gold discs appear and run to the NEXT place (the path's last point at its stand)
//  chips  — during a take exactly three chips: the taken pilgrim's, the next place's, the gate's; the pilgrim's chip on top in every sample
//           (elementFromPoint at its middle is the chip); the chips never overlap one another
//  zoom   — the "מבט על" button: held → the camera ≥ 0.95 rad up within 0.6 s, "אני" over him; released → back under 0.65 within 0.8 s;
//           the lift gesture is off in the shift
//  level1 — 4 pilgrims one at a time, patience 45, the rival 0.6/s, the star thresholds; ⛶ on the entry and end cards
//  shots  — test/out/flow31/*.png;  no console errors
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/flow31-touch.cjs --no-build [--noshots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/flow31');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), DIST = arg('dist', path.join(ROOT, 'dist/test.html'));
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('f31')) { sessionStorage.setItem('f31', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + DIST + '#shift');   // (#shift: the entry card)
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 60) => { await down(7, x, y); await sleep(ms); await up(7); };
  const shots = [];
  const shot = async (name) => { if (!SHOTS || shots.includes(name)) return; await G(() => { __T.simulate(false); window.__HUD_HOLD = true; __T.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); await G(() => { window.__HUD_HOLD = false; __T.simulate(true); }); /* (the world held still for the shot: a held game frame with a running world walked him blind) */ shots.push(name); console.log('   shot test/out/flow31/' + name + '.png'); };
  const rect = (sel) => G((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, t: e.textContent.trim() } : null; }, sel);

  // ───────── the entry card: ⛶ ─────────
  await pg.waitForSelector('.sh-entry', { timeout: 20000 }).catch(() => null);
  const fullE = await rect('.sh-entry [data-sh=full]');
  check('[full] the entry card has "⛶ מסך מלא"', !!fullE && /מסך מלא|פתחו בדפדפן/.test(fullE.t), JSON.stringify(fullE));
  if (fullE) { await tapAt(fullE.x, fullE.y); await sleep(400); const t = await rect('.sh-entry [data-sh=full]'); check('[full] a tap: full screen, or "פתחו בדפדפן" where it is refused', !!t && /יציאה|פתחו בדפדפן|מסך מלא/.test(t.t), JSON.stringify(t)); await G(() => { try { document.fullscreenElement && document.exitFullscreen(); } catch (e) { /* */ } }); }
  if (SHOTS) await shot('f31-0-entry');
  const go = await rect('.sh-entry [data-sh=go]'); if (go) await tapAt(go.x, go.y); else await G(() => __SHIFT.run(1));
  const ok0 = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state() && __SHIFT.state().phase === 'run', null, { polling: 200, timeout: 30000 }).then(() => true, () => false);
  check('the shift runs (level 1 from the entry card)', ok0); if (!ok0) { await b.close(); process.exit(1); }
  const L1 = await G(() => { const L = __SHIFT.E.level; return { count: L.count, patienceS: L.patienceS, perS: L.rival.perS, one: !!L.one31, stars: L.stars, all3: !!L.all3 }; });
  check('[level1] 4 pilgrims one at a time, patience 45, the rival 0.6/s, ★ 2 · ★★ 3 · ★★★ 4 + the rival', L1.count === 4 && L1.patienceS === 45 && L1.perS === 0.6 && L1.one && L1.stars[0] === 0.5 && L1.stars[1] === 0.75 && L1.all3, JSON.stringify(L1));

  // ───────── the sampler (every 150 ms of the round) ─────────
  await G(() => {
    const S = window.__F31S = { n: 0, btnN: 0, btnOk: 0, takeN: 0, three: 0, topN: 0, topOk: 0, overlapN: 0, pathN: 0, pathOk: 0, bad: [] };
    const vis = (e) => { const r = e.getBoundingClientRect(); if (!r.width || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return null; if (getComputedStyle(e).display === 'none' || +getComputedStyle(e).opacity < 0.2) return null; return r; };
    const h = {};
    setInterval(() => {
      const s = __SHIFT.state && __SHIFT.state(); if (!s || s.phase !== 'run' || s.t < 1.5 || document.querySelector('.sh-end')) return;
      S.n++;
      const M = __SHIFT.mods, act = M.stations.state && M.stations.state(); __T.stages.heroXYZ(h);
      const nx = __SHIFT.E.flowNext(), lb = ((document.querySelector('.tw-btn .tw-lb') || {}).textContent || '').trim();
      // the button: far → "לך ל…"; near → the verb (the spec is refreshed 10×/s: a sample right at the 3-amah line is not judged)
      if (!act && nx && nx.kind === 'station' && nx.at) { const d = Math.hypot(nx.at.x - h.x, nx.at.z - h.z); if (Math.abs(d - 3.2) > 1.2) { S.btnN++; const ok = d > 3.2 ? /^לך ל/.test(lb) : /\s—\s/.test(lb); if (ok) S.btnOk++; else if (S.bad.length < 30) S.bad.push(['btn', +d.toFixed(1), lb]); } }
      if (act) { S.btnN++; if (act.phase === 'tail' ? /יפה|\s—\s/.test(lb) : /\s—\s/.test(lb)) S.btnOk++; else if (S.bad.length < 30) S.bad.push(['btnAct', act.id, lb]); }
      // the chips during a take
      if (s.carried != null && !act) {
        S.takeN++;
        const sts = [...document.querySelectorAll('.s29-st')].filter((e) => !e.classList.contains('f31-off') && !e.classList.contains('s29-hide') && vis(e));
        const pcs = [...document.querySelectorAll('.s29-pc')].filter((e) => !e.classList.contains('f31-off') && !e.classList.contains('left') && !e.classList.contains('done') && vis(e));
        const ids = sts.map((e) => e.dataset.st), okSet = sts.length + pcs.length <= 3 && pcs.every((e) => e.classList.contains('taken')) && ids.every((id) => id === 'gate' || id === nx.id);
        if (okSet) S.three++; else if (S.bad.length < 30) S.bad.push(['chips', ids.join(','), pcs.length]);
        const all = [...sts, ...pcs].map((e) => e.getBoundingClientRect());
        for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i], c = all[j]; if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) { S.overlapN++; if (S.bad.length < 30) S.bad.push(['overlap', i, j]); } }
        const tk = pcs.find((e) => e.classList.contains('taken'));
        if (tk) { S.topN++; const r = tk.getBoundingClientRect(), q = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (q && (q === tk || tk.contains(q))) S.topOk++; else if (S.bad.length < 30) S.bad.push(['top', q && q.className]); }
        // the path to the next place
        const F = window.__F31 && __F31.state(); if (F && nx && nx.at && Math.hypot(nx.at.x - h.x, nx.at.z - h.z) > 4) { S.pathN++; const e = F.pts && F.pts[F.pts.length - 1]; if (F.discs > 0 && e && Math.hypot(e[0] - nx.at.x, e[1] - nx.at.z) < 0.6) S.pathOk++; else if (S.bad.length < 30) S.bad.push(['path', F.discs, e, nx.id]); }
      }
    }, 150);
  });

  // ───────── a round by the button alone (the kid's way), with the zoom held once on the way ─────────
  const look = () => G(() => { const btn = document.querySelector('.gm.tw-on .tw-btn') || document.querySelector('.tw-btn'); const r = btn && btn.getBoundingClientRect(); const tip = [...document.querySelectorAll('.s29-tip')].map((e) => e.textContent.trim()).find(Boolean) || ''; const seals = [...document.querySelectorAll('.s29-seal')].map((e) => { const q = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); return { label: btn ? btn.querySelector('.tw-lb').textContent.trim() : '', btn: r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null, tip, seals, end: !!document.querySelector('.sh-end'), s: __SHIFT.state() }; });
  const t0 = Date.now(); let zoomed = false, took = false, pathShot = false, actShots = new Set(), lastKey = '', seen = 0;
  while (Date.now() - t0 < 200000) {
    const L = await look(); if (L.end) break;
    if (!took && L.s.carried != null) { took = true; await sleep(700); const F = await G(() => __F31.state()); check('[path] on a take the gold discs appear and lead to the next place', F.discs > 2 && F.pts && F.pts.length >= 2, JSON.stringify({ discs: F.discs, next: F.next, end: F.pts && F.pts[F.pts.length - 1] })); await shot('f31-1-take-path'); }
    if (took && !zoomed && L.s.carried != null && /^לך ל/.test(L.label)) {
      zoomed = true; const z = await rect('.f31-zoom');
      check('[zoom] a 44-px "מבט על" button under the HUD', !!z && /מבט על/.test(z.t), JSON.stringify(z));
      const el0 = await G(() => { const c = __T.view.camNow({}); return Math.atan2(c.py - c.ty, Math.hypot(c.px - c.tx, c.pz - c.tz)); });
      await down(8, z.x, z.y); const ta = Date.now(); let el1 = 0;
      while (Date.now() - ta < 1500) { el1 = await G(() => { const c = __T.view.camNow({}); return Math.atan2(c.py - c.ty, Math.hypot(c.px - c.tx, c.pz - c.tz)); }); if (el1 >= 0.95) break; await sleep(60); }
      const upMs = Date.now() - ta, me = await rect('.f31-me');
      await shot('f31-2-zoom-held');
      await up(8); const tb = Date.now(); let el2 = 9;
      while (Date.now() - tb < 2000) { el2 = await G(() => { const c = __T.view.camNow({}); return Math.atan2(c.py - c.ty, Math.hypot(c.px - c.tx, c.pz - c.tz)); }); if (el2 < 0.65) break; await sleep(60); }
      const dnMs = Date.now() - tb;
      check('[zoom] held: the camera rises over the field (≥ 0.95 rad) within ~0.6 s, "אני" over him', el1 >= 0.95 && upMs <= 900 && !!me, JSON.stringify({ el0: +el0.toFixed(2), el1: +el1.toFixed(2), upMs, me }));
      check('[zoom] released: back (< 0.65 rad) within ~0.8 s', el2 < 0.65 && dnMs <= 1100, JSON.stringify({ el2: +el2.toFixed(2), dnMs }));
      const lift = await G(() => (globalThis.__DAY && __DAY.twin && __DAY.twin.lift ? __DAY.twin.lift().ok : null));
      check('[zoom] the lift gesture is off in the shift', lift === false || lift === null, String(lift));
      lastKey = ''; continue;
    }
    if (took && !pathShot && /^לך ל/.test(L.label) && L.s.carried != null) { pathShot = true; await shot('f31-3-button-go'); }
    const key = `${L.label}|${L.tip}`; if (key !== lastKey) { lastKey = key; seen = Date.now(); }
    if (Date.now() - seen < 450 || !L.btn) { await sleep(80); continue; }
    const sm = /החותם:\s*(\S+)/.exec(L.tip); if (sm && L.seals.length) { const s = L.seals.find((q) => q.t === sm[1]) || L.seals[0]; await tapAt(s.x, s.y); lastKey = ''; continue; }
    if (/^עולה רגל בדרך/.test(L.label)) { await sleep(250); continue; }
    if (/\s—\s/.test(L.label) && L.tip && actShots.size < 4) { const k = L.label.split(/\s—\s/)[0]; if (!actShots.has(k)) { actShots.add(k); await shot(`f31-4-act-${actShots.size}`); } }
    if (/גררו/.test(L.label)) { await down(7, L.btn.x, L.btn.y); for (let i = 1; i <= 5; i++) { await move(7, L.btn.x - 16 * i, L.btn.y - 12 * i); await sleep(35); } await up(7); }
    else if (/החזיקו/.test(L.label)) { await down(7, L.btn.x, L.btn.y); await sleep(1000); await up(7); }
    else await tapAt(L.btn.x, L.btn.y);
    if (/\s—\s/.test(L.label) && !L.tip) { await sleep(120); await shot('f31-5-button-verb'); }
    lastKey = ''; await sleep(250);
  }
  const S = await G(() => window.__F31S);
  console.log('   sampler', JSON.stringify({ ...S, bad: S.bad.slice(0, 14) }));
  check('[button] its word matches the distance (≥ 97 % of samples): "לך ל…" far, the verb in reach and in the act', S.btnN > 20 && S.btnOk / S.btnN >= 0.97, `${S.btnOk}/${S.btnN}`);
  check('[chips] during a take ≤ 3 chips — the taken pilgrim\'s, the next place\'s, the gate\'s (≥ 97 %)', S.takeN > 20 && S.three / S.takeN >= 0.97, `${S.three}/${S.takeN}`);
  check('[chips] the taken pilgrim\'s chip on top in every sample', S.topN > 10 && S.topOk === S.topN, `${S.topOk}/${S.topN}`);
  check('[chips] no two chips overlap during a take', S.overlapN === 0, String(S.overlapN));
  check('[path] the discs lead to the next place while he is away from it (≥ 95 %)', S.pathN > 10 && S.pathOk / S.pathN >= 0.95, `${S.pathOk}/${S.pathN}`);
  await pg.waitForSelector('.sh-end', { timeout: 120000 }).catch(() => null); await sleep(1500);
  const end = await G(() => { const e = document.querySelector('.sh-end'); return e ? { res: e.querySelector('.sh-res').textContent, sub: e.querySelector('.sh-sub').textContent, stars: e.querySelectorAll('.sh-stars i.on').length, full: !!e.querySelector('[data-sh=full]') } : null; });
  console.log('   end', JSON.stringify(end));
  check('[level1] the round by the button alone ends with ≥ ★★', !!end && end.stars >= 2, JSON.stringify(end));
  check('[full] the end card has "⛶ מסך מלא"', !!end && end.full);
  await shot('f31-6-end');
  check('no console errors', !errs.length, errs.slice(0, 3).join(' | '));
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · shots ${shots.length}`);
  await b.close(); process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
// ── /flow31 ──
