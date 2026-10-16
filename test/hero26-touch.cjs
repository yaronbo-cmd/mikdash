// HERO26 (WAVE26 items 4–5): the player IS the acting kohen, by real touch on dist/test.html#avodah at 844×390 — for each work: the
// errand at its hour, the right button at its marker, taps alone; while it runs the hero mesh is hidden and ONE figure of the stage wears
// the hero's robe (the f24-skirt instance colour at the picked index = HERO_ROBE, not the kohanim's linen); after the last act the stage
// stays ≥ 1.2 s (the epilogue) before the mentor line; the hero mesh is visible again within 2.5 s of the end and stands within 3 amot of
// the actor's last spot (or the nearest free floor to it); no console errors; shots during, in the epilogue and after.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/hero26-touch.cjs --no-build [--noshots] [--only=g-deshen,…]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/hero26');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const ALL = ['g-payis1', 'g-kiddush', 'g-deshen', 'g-maaracha', 'g-taleh', 'g-evarim', 'g-birkat', 'g-shir', 'gates',
  'g-heichal', 'g-ketoret', 'g-neirot', 'g-zerika', 'g-erev', 'g-shaarim', 'watch', 'lambs', 'pen', 'wood', 'seals', 'vessels'];   // (the second line: run with --only=…)
const IDS = ONLY.length ? ALL.filter((i) => ONLY.includes(i)) : ALL.slice(0, 9);
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
    let shotMs = 0; const shot = async (name) => { if (!SHOTS) return 0; const s0 = Date.now(); const pms = await G(() => { const t = performance.now(); __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); return performance.now() - t; }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/hero26/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); shotMs += Date.now() - s0; return pms; };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    check('the hero26 module is live', await G(() => !!(window.__HERO26 && __HERO26.state)));
    await pg.waitForTimeout(800);
    await G(() => { if (window.__BLOOD25) window.__BLOOD25.onGrave = (M) => { M.twinTap(); M.twinTap(); };
      window.__H26CAM = []; setInterval(() => { const c = __T.camera.position, a = window.__H26CAM; const t = __T.controls && __T.controls.target, cs = window.__F24 && __F24.closeState ? __F24.closeState() : null; a.push([Math.round(performance.now()), c.x, c.y, c.z, cs ? cs.w : -1, t ? +t.x.toFixed(1) : 0, t ? +t.z.toFixed(1) : 0, window.__HERO26 ? +__HERO26.H.ep.toFixed(2) : 0, __T.stages.heroXYZ({}).vis ? 1 : 0]); if (a.length > 600) a.shift(); }, 50);
      const l = document.querySelector('.dy-line'); window.__H26LINE = []; if (l) new MutationObserver(() => { if (l.classList.contains('on')) window.__H26LINE.push([Math.round(performance.now()), l.textContent.slice(0, 30)]); }).observe(l, { attributes: true, attributeFilter: ['class', 'style'], childList: true, subtree: true }); });
    // the probe: the hero mesh, the picked figure and its skirt's colour, the stamps of the day
    const probe = () => G(() => {
      const st = __HERO26.state(), hx = __T.stages.heroXYZ({}), sk = __T.scene.getObjectByName('f24-skirt');
      let robeOk = null, robe = null, others = 0, same = 0;
      if (sk && st.skirtI != null && st.skirtI < sk.count) {
        const C = sk.material.color.constructor, want = new C(__HERO26.HERO_ROBE), a = sk.instanceColor.array, i = st.skirtI;
        robe = [a[i * 3], a[i * 3 + 1], a[i * 3 + 2]].map((v) => +v.toFixed(3)); robeOk = Math.abs(a[i * 3] - want.r) + Math.abs(a[i * 3 + 1] - want.g) + Math.abs(a[i * 3 + 2] - want.b) < 0.01;
        for (let j = 0; j < sk.count; j++) { if (j === i) continue; others++; if (Math.abs(a[j * 3] - want.r) + Math.abs(a[j * 3 + 1] - want.g) + Math.abs(a[j * 3 + 2] - want.b) < 0.01) same++; }
      }
      const line = document.querySelector('.dy-line');
      return { log: st.log, epF: st.epF, moved: st.moved, moveErr: st.moveErr, lineAt: ((window.__H26LINE || []).find((x) => window.__H26T && x[0] >= window.__H26T.end) || [0])[0], on: st.on, work: st.work, af: st.actorFrames, at: st.at, ep: st.ep, vis: !!hx.vis, h: { x: +hx.x.toFixed(2), z: +hx.z.toFixed(2), yaw: +hx.yaw.toFixed(2) }, robeOk, robe, others, same, T: window.__H26T || null, back: window.__H26BACK || null, line: !!(line && line.classList.contains('on')), lineTxt: line ? line.textContent.slice(0, 40) : '', now: Math.round(performance.now()), shock: window.__H26SHOCK || null, pulses: document.querySelectorAll('.tw-mk.h26p').length, epMs: st.work ? __HERO26.epiMs(st.work) : 0 };
    });
    let robeWorks = 0, actorWorks = 0;
    for (const id of IDS) {
      const tag = `[${id}]`;
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, place: k.place } : null; }, id);
      check(`${tag} the errand is a work`, info && info.work, JSON.stringify(info)); if (!info || !info.work) continue;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      const woke = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes`, woke); if (!woke) continue;
      // (a second errand left open elsewhere: the hero turns toward it after; a far one — the "no shock" pulse)
      await G((id) => { window.__H26T = null; window.__H26BACK = null; window.__H26SHOCK = null; const L = __DAY.tasks.list().filter((k) => k.id !== id && k.state === 'passed' && k.work); const far = L.find((k) => k.id === 'g-taleh' || k.id === 'watch') || L[0]; if (far) { far.state = 'open'; window.__H26NEXT = far.id; } const l = document.querySelector('.dy-line'); if (l) l.classList.remove('on'); window.__H26LINE = []; }, id);
      const bc = await btnC(); shotMs = 0; const t0 = Date.now(); let n = 0;
      const R = { hidSeen: false, visDuring: 0, robe: null, af: 0, endProbe: null, shotDuring: false, epShot: false, lastAt: null, mentorAt: 0, visAt: 0, afterProbe: null };
      while (Date.now() - t0 - shotMs < 75000) {
        const st0 = await probe();
        if (st0.T && st0.T.end) break;
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++;
        for (let w = 0; w < 3; w++) {
          await pg.waitForTimeout(120); const st = await probe();
          if (st.on && !st.T) { if (!st.vis) R.hidSeen = true; else if (st.af > 0) R.visDuring++; if (st.af > 0) R.af = st.af; if (st.robeOk != null) R.robe = R.robe || { ok: st.robeOk, robe: st.robe, others: st.others, same: st.same }; if (st.robeOk === false) R.robe = { ok: false, robe: st.robe }; if (st.at) R.lastAt = st.at; }
          if (st.on && st.af > 4 && !R.shotDuring && n >= 2) { R.shotDuring = true; await shot(`${id}-1during`); }
          if (st.T && st.T.end) break;
        }
      }
      // the epilogue: from the end stamp, watch the mentor line, the hero's return
      const tEndWall = Date.now(); let st = await probe(); const endNow = st.now, end = st.T ? st.T.end : 0;
      const secs = (tEndWall - t0 - shotMs) / 1000;
      let stall = 0; if (SHOTS && st.T) { await pg.waitForTimeout(id === 'g-evarim' ? 2600 : id === 'g-payis1' ? 1600 : 600); stall = Math.round(await shot(`${id}-2epilogue`)); }   // (the shot's two renders hold the page's thread: that time is taken off its stamps)
      for (let w = 0; w < 50; w++) {
        st = await probe();
        if (st.lineAt && !R.mentorAt) R.mentorAt = st.lineAt;
        if (st.vis && !st.on && !R.visAt) { R.visAt = st.now; R.afterProbe = st; }
        if (R.mentorAt && R.visAt && st.T && st.T.fin) break;
        await pg.waitForTimeout(100);
      }
      if (SHOTS) { await pg.waitForTimeout(300); await shot(`${id}-3after`); }
      st = await probe();
      const done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} taps alone finish it in ≤ 60 s`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      if (R.af === 0) { check(`${tag} (no acting figure in this work: he does it in his own body — the hero mesh is visible)`, (await probe()).vis, ''); await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; }); await pg.waitForTimeout(400); continue; }
      check(`${tag} the hero mesh is hidden while the acting figure is on the stage`, R.hidSeen && R.visDuring <= 1, `hidden seen ${R.hidSeen}, visible samples with the actor drawn ${R.visDuring}`);
      const robeOk = R.robe && R.robe.ok && R.af > 0; if (robeOk) robeWorks++; actorWorks++;
      check(`${tag} the acting figure wears the hero's robe (one figure; the others the kohanim's linen)`, robeOk && R.robe.same === 0, `frames ${R.af} ${JSON.stringify(R.robe)}`);
      const mentorGap = R.mentorAt && end ? R.mentorAt - end - stall : -1;
      check(`${tag} the epilogue: ≥ 1.2 s from the end to the mentor line`, mentorGap >= 1200, `end→mentor ${mentorGap} ms (a shot's stall ${stall} ms taken off) · end→back ${st.T && st.T.back ? st.T.back - end - stall : '-'} ms · end→fin ${st.T && st.T.fin ? st.T.fin - end - stall : '-'} ms · epilogue frames ${st.epF} moved ${st.moved} ${st.moveErr || ''}`);
      const visGap = R.visAt && end ? R.visAt - end : -1;
      check(`${tag} the hero mesh is back within 2.5 s of the end (+ the epilogue's own length)`, R.visAt && st.T && st.T.back && st.T.back - end - stall <= 2500 + Math.max(0, (st.epMs || 1500) - 1500), `back ${st.T && st.T.back ? st.T.back - end - stall : '-'} ms after the end (epilogue ${st.epMs} ms; his slide ${st.back ? st.back.slideMs : '-'} ms; shown at +${((st.log || []).filter((q) => q.t === 'shown').pop() || { ms: 0 }).ms - end - stall} ms)`);
      const at = (st.back && st.back.from) || (R.lastAt && { x: R.lastAt.x, z: R.lastAt.z }), hp = R.afterProbe ? R.afterProbe.h : st.h;
      const d = at ? Math.hypot(hp.x - at.x, hp.z - at.z) : -1;
      const inH = R.lastAt && R.lastAt.x < -92 && R.lastAt.x > -140 && Math.abs(R.lastAt.z) < 12;   // (the actor inside the Heichal: he stays at its door — he never passes it)
      if (inH) check(`${tag} the actor was inside the Heichal: he is back where he stood, outside its door`, st.back && st.back.from === null && st.h.x > -92, `actor ${R.lastAt.x.toFixed(1)},${R.lastAt.z.toFixed(1)} hero ${st.h.x},${st.h.z}`);
      else check(`${tag} he stands at the actor's last spot (≤ 3 amot, or the nearest free floor to it)`, at && (d <= 3 || (st.back && st.back.d > 0 && Math.abs(d - st.back.d) < 1.5)), `actor ${at ? `${at.x.toFixed(1)},${at.z.toFixed(1)}` : '-'} hero ${hp.x},${hp.z} d ${d.toFixed(2)} back ${JSON.stringify(st.back)}`);
      const cj = await G(([a, b]) => { let mx = 0, at = 0, ctx = null, spike = 0; const st2 = []; const L = window.__H26CAM.filter((q) => q[0] >= a && q[0] <= b); let quiet = 0; for (let i = 1; i < L.length; i++) { if (L[i][0] - L[i - 1][0] > 150) { quiet = L[i][0] + 400; continue; } if (L[i][0] < quiet) continue;   // (a shot's renders hold the page: the frame after such a gap steps by its own long dt — not the game's)
 const d = Math.hypot(L[i][1] - L[i - 1][1], L[i][2] - L[i - 1][2], L[i][3] - L[i - 1][3]) / Math.max(1, (L[i][0] - L[i - 1][0]) / 50); st2.push(d); if (d > mx) { mx = d; at = L[i][0] - a; ctx = L.slice(Math.max(0, i - 2), i + 2).map((q) => [q[0] - a, +q[1].toFixed(1), +q[2].toFixed(1), +q[3].toFixed(1), q[4], q[5], q[6], q[7], q[8]]); } } for (let i = 0; i < st2.length; i++) { /* (a step next to a frozen sample is the shot: its renders stop the clock and its controls.update() moves the camera — not the game) */ const nb = Math.max(st2[i - 1] || 0, st2[i + 1] || 0); if (st2[i] > 8 && st2[i] > 3 * nb && (st2[i - 1] || 0) > 0.001 && (st2[i + 1] || 0) > 0.001) spike = Math.max(spike, st2[i]); } return { n: L.length, mx: +mx.toFixed(2), at, ctx, spike: +spike.toFixed(2) }; }, [end, (st.T && st.T.fin || end) + 1200]);
      check(`${tag} the camera glides back — never a jump (no 50-ms step over 8 amot that is 3× its neighbours)`, cj.n > 10 && !cj.spike, `${cj.n} samples, the biggest step ${cj.mx} amot at +${cj.at} ms${cj.spike ? ' SPIKE ' + cj.spike + ' ' + JSON.stringify(cj.ctx) : cj.mx > 8 ? ' (a long glide: ' + JSON.stringify(cj.ctx) + ')' : ''}`);
      const nx = await G(() => { const k = window.__H26NEXT && __DAY.tasks.get(window.__H26NEXT); if (!k) return null; const p = __DAY.D.PLACE[k.place] || null; return p ? { x: p.x, z: p.z } : null; });
      if (st.back && st.back.to) { const want = Math.atan2(st.back.to.x - st.back.x, st.back.to.z - st.back.z), dy = Math.abs(((st.back.yaw - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI); check(`${tag} he faces the next open errand`, dy < 0.25, `yaw ${st.back.yaw} want ${want.toFixed(2)}`); }
      if (nx) { const far = Math.hypot(nx.x - st.h.x, nx.z - st.h.z) > 6; check(`${tag} no standing in shock: the far errand's marker pulses (and the ממונה speaks)`, !far || (st.shock && st.shock.job), `far ${far} shock ${JSON.stringify(st.shock)} pulsing ${st.pulses}`); }
      await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      await pg.waitForTimeout(400);
    }
    check(`in ≥ 8 works the actor figure's robe colour equals the hero's`, robeWorks >= Math.min(8, actorWorks), `${robeWorks}/${actorWorks} works with an acting figure (of ${IDS.length})`);
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  harness: ' + (e && e.stack || e)); results.push(false); }
  await b.close();
  const f = results.filter((x) => !x).length;
  console.log(`\n${results.length - f}/${results.length} pass · ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  process.exit(f ? 1 : 0);
})();
