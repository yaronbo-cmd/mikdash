// SHIFT29B: play the shift by real touch at 844×390 like a player who knows the order — rounds of a level, the scores (the final report's
// "own scores"). Plays the MERGED build (SHIFT29A's engine + these modules): by default wt/shift29a's dist (read only), or --dist=<html>.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/shift29-play.cjs --lvl=1 --rounds=3 [--dist=…] [--shots]
// The player: calls the pilgrim with the least patience, taps his next station's chip, and does each act by touch (the hold ~1 s, the tap on
// the beat, the drag, the right seal); a "first-timer" mode (--novice) taps the button at once and calls in arrival order.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const LVL = +arg('lvl', 1), ROUNDS = +arg('rounds', 3), DIST = arg('dist', '/home/claude/wt/shift29a/dist/test.html'), NOVICE = args.includes('--novice'), SHOTS = args.includes('--shots');
const OUT = path.join(__dirname, 'out/shift29b'); fs.mkdirSync(OUT, { recursive: true });
const SAVE = { v: 1, name: 'אביתר', mishmar: 3, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 200)));
  await pg.addInitScript((sv) => { try { if (!sessionStorage.getItem('s29p')) { sessionStorage.setItem('s29p', '1'); localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; }, SAVE);
  await pg.goto('file://' + DIST + `#shift=${LVL}`);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y, ms = 50) => { await down(7, x, y); await pg.waitForTimeout(ms); await up(7); };
  const ok = await pg.waitForFunction(() => window.__SHIFT && __SHIFT.state && __SHIFT.state() && __SHIFT.mods, null, { polling: 300, timeout: 90000 }).then(() => true, () => false);
  if (!ok) { console.log('no shift'); await b.close(); process.exit(1); }
  const scores = []; let shotN = 0;
  for (let r = 0; r < ROUNDS; r++) {
    const acts = { n: 0, gold: 0 }, t0 = Date.now(); let lastAct = null;
    for (let it = 0; it < 4000; it++) {
      const S = await G(() => {
        const st = __SHIFT.state(), M = __SHIFT.mods; if (!st || !M) return null;
        const act = M.stations && M.stations.state ? M.stations.state() : null;
        const P = M.pilgrims.list().map((p) => ({ id: p.id, state: p.state, step: p.step, route: p.route, patience: +p.patience.toFixed(2) }));
        const r = (s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return q.width ? { x: q.left + q.width / 2, y: q.top + q.height / 2 } : null; };
        const chips = {}; for (const e of document.querySelectorAll('.s29-pc')) { const q = e.getBoundingClientRect(); if (q.left > -100) chips[e.dataset.pid] = { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }
        const stc = {}; for (const e of document.querySelectorAll('.s29-st')) { const q = e.getBoundingClientRect(); if (q.left > -100 && !e.classList.contains('s29-hide')) stc[e.dataset.st] = { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }
        const rings = [...document.querySelectorAll('.sh-ring')].map((e) => { const q = e.getBoundingClientRect(); return { i: +e.dataset.i, x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
        return { phase: st.phase, t: st.t, score: st.score, rival: st.rival, served: st.served, lost: st.lost, combo: st.combo, act, P, chips, stc, btn: r('.gm.tw-on .tw-btn'), again: r('.sh-btn.again'), rings, walking: M.walk && M.walk.on };
      });
      if (!S) { await pg.waitForTimeout(300); continue; }
      if (S.phase === 'end') {
        const res = await G(() => { const e = document.querySelector('.sh-res'), s = document.querySelectorAll('.sh-stars i.on').length, sub = document.querySelector('.sh-sub'); return { res: e ? e.textContent : '', stars: s, sub: sub ? sub.textContent : '' }; });
        const st2 = await G(() => __SHIFT.state());
        scores.push({ lvl: LVL, round: r + 1, score: st2.score, rival: st2.rival, stars: st2.stars, served: st2.served, lost: st2.lost, acts: acts.n, gold: acts.gold, retap: acts.retap | 0, card: res.res, sub: res.sub, secs: Math.round((Date.now() - t0) / 1000) });
        console.log('ROUND', JSON.stringify(scores[scores.length - 1]));
        if (args.includes('--log')) console.log('LOG', JSON.stringify(await G(() => (__SHIFT.debug.log() || []).slice(-60))).slice(0, 6000));
        if (SHOTS) { await G(() => __T.render()); await pg.screenshot({ path: path.join(OUT, `s29b-play-L${LVL}-end${r + 1}.png`) }); }
        if (r < ROUNDS - 1) { await pg.waitForTimeout(1200); const S2 = await G(() => { const e = document.querySelector('.sh-end [data-sh=again]') || document.querySelector('.sh-btn.again'); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }); const ta = Date.now(); if (S2) await tapAt(S2.x, S2.y); const re = await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase !== 'end', null, { polling: 100, timeout: 4000 }).then(() => true, () => false); console.log('again →', re ? `${Date.now() - ta} ms (the button)` : 'no restart by the button — __SHIFT.run'); if (!re) { await G((l) => __SHIFT.run(l), LVL); await pg.waitForFunction(() => __SHIFT.state() && __SHIFT.state().phase !== 'end', null, { polling: 100, timeout: 8000 }).catch(() => null); } }
        break;
      }
      if (S.phase === 'opening' && S.rings.length) {
        for (const q of S.rings.sort((a, c) => a.i - c.i)) { await tapAt(q.x, q.y); await pg.waitForTimeout(250); }
        continue;
      }
      if (S.phase !== 'run') { await pg.waitForTimeout(200); continue; }
      // a decent player: one pilgrim at a time — call him, then his stations in order, each act by touch
      const w = S.P.filter((p) => p.state === 'wait' || p.state === 'atStation' || p.state === 'taken'); if (!w.length) { await pg.waitForTimeout(250); continue; }
      const pick = w.find((p) => p.state === 'taken') || (NOVICE ? w.sort((a, c) => a.id - c.id)[0] : w.sort((a, c) => a.patience - c.patience)[0]);
      if (pick.state !== 'taken') { const c = S.chips[pick.id]; if (c) await tapAt(c.x, c.y); else await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); __SHIFT.E.tapPilgrim(P); }, pick.id); }
      let took = await pg.waitForFunction((id) => __SHIFT.state().carried === id || __SHIFT.state().phase !== 'run', pick.id, { polling: 80, timeout: 1500 }).then(() => true, () => false);
      if (!took) { acts.retap = (acts.retap | 0) + 1; await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); if (P) __SHIFT.E.tapPilgrim(P); }, pick.id); took = await pg.waitForFunction((id) => __SHIFT.state().carried === id || __SHIFT.state().phase !== 'run', pick.id, { polling: 80, timeout: 2000 }).then(() => true, () => false); }
      if (!took) continue;
      for (let i = pick.step || 0; i < pick.route.length; i++) {
        const sid = pick.route[i];
        const c = await G((sid) => { const e = document.querySelector(`.s29-st[data-st="${sid}"]`); if (!e) return null; const q = e.getBoundingClientRect(); return q.width && q.left > -100 ? { x: q.left + q.width / 2, y: q.top + q.height / 2 } : null; }, sid);
        if (c) await tapAt(c.x, c.y); else { await G((sid) => __SHIFT.E.tapStation(sid), sid); acts.api = (acts.api | 0) + 1; }
        // (a touch that missed a moving chip: the player taps again — here, once, through the engine's own tap)
        const moving = await pg.waitForFunction(() => { const s = __SHIFT.state(), a = __SHIFT.mods.stations.state(); return !!a || !!s.acting || !!(__SHIFT.debug.goal && __SHIFT.debug.goal()) || (window.__S29W && __S29W.state().on) || s.phase !== 'run'; }, null, { polling: 60, timeout: 1500 }).then(() => true, () => false);
        if (!moving) { await G((sid) => __SHIFT.E.tapStation(sid), sid); acts.retap = (acts.retap | 0) + 1; }
        const on = await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return (a && a.phase === 'act') || __SHIFT.state().phase !== 'run'; }, null, { polling: 60, timeout: 9000 }).then(() => true, () => false);
        if (!on || (await G(() => __SHIFT.state().phase)) !== 'run') break;
        const A = await G(() => __SHIFT.mods.stations.state()), B = await G(() => { const r = document.querySelector('.gm.tw-on .tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        acts.n++;
        if (A.verb === 'hold' && !NOVICE) { await down(7, B.x, B.y); await pg.waitForTimeout(950); await up(7); }
        else if (A.verb === 'tapBeat' && !NOVICE) { await pg.waitForFunction(() => { const a = __SHIFT.mods.stations.state(); return !a || a.t >= 1.24; }, null, { polling: 'raf', timeout: 4000 }).catch(() => null); await tapAt(B.x, B.y, 20); }
        else if (A.verb === 'drag' && !NOVICE) { await down(7, B.x, B.y); for (let k = 1; k <= 5; k++) { await move(7, B.x - 14 * k, B.y - 10 * k); await pg.waitForTimeout(25); } await up(7); }
        else if (A.verb === 'tapRight') { const ss = await G(() => __SHIFT.mods.stations.sealsAt()); const t = ss.find((q) => q.name === A.want) || ss[0]; if (t) await tapAt(t.x, t.y); else await tapAt(B.x, B.y); }
        else await tapAt(B.x, B.y);
        await pg.waitForFunction(() => !__SHIFT.mods.stations.state(), null, { polling: 80, timeout: 6000 }).catch(() => null);
        const L = await G(() => { const l = __SHIFT.mods.stations.log(); return l[l.length - 1]; }); if (L && L[0] === 'done' && L[3]) acts.gold++;
        if (SHOTS && shotN < 3 && Math.random() < 0.35) { shotN++; await G(() => __T.render()); await pg.screenshot({ path: path.join(OUT, `s29b-play-L${LVL}-${shotN}.png`) }); }
      }
    }
  }
  console.log('\nSCORES', JSON.stringify(scores));
  console.log('errors', errs.length, errs.slice(0, 3).join(' | '));
  console.log(`(${Math.round((Date.now() - T0) / 1000)} s)`);
  await b.close();
  process.exit(0);
})();
