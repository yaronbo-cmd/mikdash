// BLOODA25 (DAM25): the Tamid's blood as the work, by real touch on dist/test.html#avodah at 844×390 — g-zerika (dawn) and g-erev (the
// afternoon ring): the slaughter is the moment of gravity (no "+N", the deep tone asked, the music ducked, 1.2 s in which a tap is
// swallowed); after the receiving the vessel's liquid is drawn (kit pieces tagged 'vessel'); the Γ marks on the REAL altar at NE and SW,
// below the red line (avodah3d marks, y < 21); the rest on the yesod — the thread into the holes (water trickle); the amah runs, its hue
// pales eastward; the marks dry by the day clock (wet → dry → trace; gone at dawn); reds ⊆ BLOOD at their places; the two teaching taps.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/blooda25-touch.cjs --no-build [--noshots]
// (harness from places24-touch) PLACES24: the Tamid's works ON THEIR REAL PLACES, by real touch on dist/test.html#avodah at 844×390 — each errand at its hour
// (clock.skipTo), the right button wakes at its (moved) marker, the tap starts the WORK; while it runs: the kit's frame is the anchor
// (kit.F.anchor), every drawn piece stands within 3 amot of the place's footprint, no piece is sunk in a solid (below the floor there),
// deshen's kohen walks ON the ramp's slope (a sample of him with z on the ramp has y = the ramp's height ± 0.4), the camera asks for the
// place's view (Heichal works: inside the door) while the hero never passes the Ulam (x > −81); taps alone finish it ≤ 60 s; +pts; the
// source line after the end; nothing red; no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/places24-touch.cjs [--no-build] [--shots] [--only=g-deshen,…]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/blooda25');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const ALL = ['g-erev', 'g-zerika'];   // (the erev first: the zerika's drying ends at the next dawn)
const IDS = ALL.filter((i) => !ONLY.length || ONLY.includes(i));
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
    const shotAt = async (name, p, t) => { if (!SHOTS) return; await G(([p, t]) => { __T.simulate(false); __T.look(p, t); __T.render(); __T.render(); window.__HUD_HOLD = true; }, [p, t]); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/blooda25/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; __T.simulate(true); }); };
    const NE_VIEW = [[-13.5, 24.5, -28], [-23.2, 19.4, -18.4]];
    let shotMs = 0; const shot = async (name) => { if (!SHOTS) return; const s0 = Date.now(); await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/blooda25/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); shotMs += Date.now() - s0; };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    check('the anchors are loaded', await G(() => !!(window.__ANCHORS24 && __ANCHORS24.ANCHORS.altar && __ANCHORS24.ANCHORS.menorah)));
    await pg.waitForTimeout(800);
    const probe = () => G(() => {
      const B = window.__BLOOD25 || {}, c = B.cur, M = c && c.M, k = window.__W22 && __W22.kit(), bl = k && k.bloodCheck ? k.bloodCheck() : null;
      const av = __T.avodah, wa = __T.water;
      return { id: c && c.id, i: M ? M.i : -1, grave: M ? +(M.grave || 0).toFixed(2) : 0, acts: M ? M.acts.length : 0, pts: M ? M.pts : 0, fill: M ? M.fill : 0, given: M ? [!!M.given[0], !!M.given[1]] : [],
        graves: B.graves | 0, tones: B.tones | 0, shir: B.shirayim | 0, log: (B.log || []).slice(-1)[0] || null, teach: B.teachState ? B.teachState() : null, bl: bl ? { n: bl.n, tags: bl.tags, bad: bl.untagged + bl.nearFig + bl.floor, reds: bl.reds, nearFig: bl.nearFig, floor: bl.floor, untagged: bl.untagged } : null,
        marks: av && av.marks ? av.marks() : [], trickles: wa && wa.state ? wa.state.trickles : 0, chan: wa && wa.state ? wa.state.channel : null, tint: wa ? +(wa.tint || 0).toFixed(3) : 0, duck: (window.__DUCKLOG || []).slice(-2) };
    });
    await G(() => { window.__BLOOD25.onGrave = (M) => { M.twinTap(); M.twinTap(); }; const m = window.__BH_MUSIC; window.__DUCKLOG = []; if (m && m.duck) { const d0 = m.duck.bind(m); m.duck = (on, l) => { window.__DUCKLOG.push([on, l]); return d0(on, l); }; } else window.__BH_MUSIC = { duck: (on, l) => window.__DUCKLOG.push([on, l]) }; });
    for (const id of IDS) {
      const tag = `[${id}]`;
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, place: k.place } : null; }, id);
      check(`${tag} the errand is the work`, info && info.work, JSON.stringify(info)); if (!info) continue;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G(() => { try { __T.avodah.clearMarks(); window.__BLOOD25.cur = null; } catch (e) { /* */ } });
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      check(`${tag} the right button wakes`, await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000));
      const bc = await btnC(); shotMs = 0; const t0 = Date.now(); let n = 0, shots = 0; const p0 = await probe(), g0 = p0.graves, n0 = (p0.teach && p0.teach.n) || { line: 0, amah: 0 };
      const R = { graveSeen: false, graveActs: -1, graveActsEnd: -1, graveIdx: -1, swallowed: null, vessel: 0, vesselAfterRecv: false, trickle: 0, bad: 0, reds: 0, chan: false, duck: false, tonesAt: 0, tones0: (await probe()).tones, marks: [] };
      while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 - shotMs < 90000) {
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++;
        for (let w = 0; w < 4; w++) {
          await pg.waitForTimeout(110); const st = await probe();
          if (st.bl) { R.bad = Math.max(R.bad, st.bl.bad); R.reds = Math.max(R.reds, st.bl.reds); if (st.bl.bad && !R.badInfo) R.badInfo = JSON.stringify(st.bl); }
          if (st.chan) R.chan = true; R.trickle = Math.max(R.trickle, st.trickles);
          if (st.graves > g0 && !R.graveSeen) {
            R.graveSeen = true; R.duck = (await G(() => window.__DUCKLOG.slice())).some((d) => d[0] === true && d[1] <= 0.2); R.tonesAt = st.tones;
            if (st.grave > 0) await shot(`${id}-1gravity`);
          }
          if (st.log && st.log.actsEnd != null) R.glog = st.log;
          if (st.shir) R.trickle = Math.max(R.trickle, st.shir);
          if (st.i >= (id === 'g-zerika' ? 4 : 3) && st.teach && (R.tries | 0) < 12 && !(R.teach_line && R.teach_line.line > n0.line && R.teach_amah && R.teach_amah.amah > n0.amah)) {
            R.tries = (R.tries | 0) + 1;
            for (const key of ['line', 'amah']) {
              if (R['teach_' + key] && R['teach_' + key][key] > n0[key]) continue;
              const r = await G((key) => { const b = document.querySelector(`[data-bl25=${key}]`); if (!b || b.style.display === 'none') return null; const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, key);
              if (!r) { R['teach_' + key] = 'hidden'; continue; }
              await down(3, r.x, r.y); await pg.waitForTimeout(60); await up(3); await pg.waitForTimeout(key === 'amah' ? 1800 : 500);
              await shot(`${id}-teach-${key}`); R['teach_' + key] = (await G(() => __BLOOD25.teachState().n));
              await pg.waitForTimeout(key === 'amah' ? 2600 : 3600);
            }
          }
          const recvI = id === 'g-zerika' ? 4 : 3;   // (the act after the receiving: the vessel holds the liquid)
          if (st.i === recvI && st.bl && st.bl.tags.vessel) { R.vesselAfterRecv = true; if (!R.vshot) { R.vshot = 1; await shot(`${id}-2vessel`); } }
          if (st.bl && st.bl.tags.vessel) R.vessel = Math.max(R.vessel, st.bl.tags.vessel);
          if (st.given[0] && !R.neShot) { R.neShot = 1; await pg.waitForTimeout(500); await shot(`${id}-3ne`); }
          if (st.given[1] && !R.swShot) { R.swShot = 1; await pg.waitForTimeout(300); await shot(`${id}-4sw-glow`); }
          if (st.trickles > 0 && !R.trShot) { R.trShot = 1; await shot(`${id}-5shirayim`); }
          R.marks = st.marks;
        }
      }
      const secs = (Date.now() - t0 - shotMs) / 1000, done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} taps alone finish it in ≤ 60 s`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      const GL = R.glog || {};
      check(`${tag} the moment of gravity happens (at the slaughter)`, R.graveSeen && GL.i === (id === 'g-zerika' ? 2 : 1), JSON.stringify(GL));
      check(`${tag} the slaughter pays nothing (no "+N" through the stillness)`, GL.actsEnd === GL.acts && GL.ptsEnd === GL.pts, `acts ${GL.acts} → ${GL.actsEnd}, pts ${GL.pts} → ${GL.ptsEnd}`);
      check(`${tag} taps in the stillness are swallowed; it ends after 1.2 s without moving on`, GL.swallowed >= 1 && GL.iEnd === GL.i + 1, `swallowed ${GL.swallowed} i ${GL.i}→${GL.iEnd}`);
      check(`${tag} the teaching taps: the red line and the amah`, R.teach_line && R.teach_line.line > n0.line && R.teach_amah && R.teach_amah.amah > n0.amah, `line ${JSON.stringify(R.teach_line)} amah ${JSON.stringify(R.teach_amah)}`);
      check(`${tag} the deep tone was asked and the music ducked to 20 %`, R.tonesAt > R.tones0 && R.duck, `tones ${R.tones0}→${R.tonesAt} duck ${R.duck}`);
      check(`${tag} after the receiving the vessel holds the dark liquid`, R.vesselAfterRecv, `vessel pieces ${R.vessel}`);
      const L = R.marks.filter((m) => /:lower$/.test(m.corner)), ne = L.filter((m) => m.corner === 'NE:lower'), sw = L.filter((m) => m.corner === 'SW:lower');
      check(`${tag} the Γ on both corners of the real altar, below the red line`, ne.length >= 2 && sw.length >= 2 && L.every((m) => m.y < 21 && m.y > 17), `NE ${ne.length} SW ${sw.length} ys ${[...new Set(L.map((m) => m.y))].join(',')}`);
      check(`${tag} the rest poured: the thread into the holes`, R.trickle > 0, `trickles/pours ${R.trickle}`);
      check(`${tag} the amah runs`, R.chan);
      check(`${tag} reds ⊆ BLOOD at their places (none by a figure, none on the floor)`, R.reds === 0 && R.bad === 0, `reds ${R.reds} bad ${R.bad} ${R.badInfo || ''}`);
      const pts = await G((id) => { const e = window.__GAME_LOG.find((x) => x.type === 'taskDone' && x.d && x.d.id === id); return e ? e.d.pts : 0; }, id);
      check(`${tag} the points go in`, pts > 0, `+${pts}`);
      if (id === 'g-zerika') {
        // the amah's hue by x, and the drying by the day's clock
        const g = await G(() => { const w = __T.water; return { a: +w.gradeAt(-54.6).toFixed(3), b: +w.gradeAt(-26).toFixed(3), c: +w.gradeAt(-4).toFixed(3), d: +w.gradeAt(277).toFixed(3) }; });
        check(`${tag} the amah's hue pales east (35 % → 12 % → 4 % → clear at the outlet)`, g.a > g.b && g.b > g.c && g.c >= 0 && g.d === 0 && g.a <= 0.35, JSON.stringify(g));
        await pg.waitForTimeout(600);
        // the teaching taps: the red line, the amah (DOM buttons over the world)
        const tb = await G(() => (window.__BLOOD25.teachState ? __BLOOD25.teachState() : null));
        console.log('   teach', JSON.stringify(tb));
        const stg = async (h) => { await G((h) => { __DAY.clock.skipTo(h); }, h); await pg.waitForTimeout(400); return G(() => __T.avodah.marks().map((m) => m.stage)); };
        const h0 = await G(() => __DAY.clock.now().h);
        const s0 = await G(() => __T.avodah.marks().map((m) => m.stage)); await shotAt(`${id}-6wet`, ...NE_VIEW);
        const s1 = await stg(h0 + 0.6); await G(() => { __T.view && 0; }); await shotAt(`${id}-7dry`, ...NE_VIEW);
        const s2 = await stg(h0 + 2.2); await shotAt(`${id}-8trace`, ...NE_VIEW);
        check(`${tag} the marks dry by the day clock: wet → dry → trace`, s0.length && s0.every((x) => x === 'wet') && s1.every((x) => x === 'dry') && s2.every((x) => x === 'trace'), `${s0[0]} → ${s1[0]} → ${s2[0]} (${s0.length})`);
        await G(() => { __DAY.clock.nextDay(); }); const s3 = await stg(4.2);
        check(`${tag} the marks are gone at the next dawn`, s3.length === 0, `left ${s3.length}`);
      }
      await pg.waitForTimeout(2400);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
