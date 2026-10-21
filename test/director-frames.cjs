// DIRECTOR13 (wave 13) — the camera at every stage and every course end seen, in the DEMO as the owner plays it (390×844, touch,
// he-IL). Declared hooks: `__T.game.switchMode(true)` (the demo) and `__T.game.jumpTo(id)` (the strip's picker), the renderer's
// (__START_PAUSED + __T.simulate, a render before each measure and shot), and one state fixture per stage: the site put 3 stones
// before its first course's end (so the crews, ×60, close it within seconds — N79). Everything else is touch: the pill, the
// kohen, the pointer.
// Per stage: K80 (the kohen ≥ 80 px, in frame, not hidden — produce-play's measure) at the pick, the survey, the dig, the courses
// (before and after the course end); the course end's moment (the toast, `courseMoment`, `courseBeat`) whoever set the last
// stone; the beat's frame (the course's screen height, the crane on the line to it); an idle window with no touch (heroReturn
// per course, K80 samples); the demo's payment (the pill's "הביאו N אבנים").
//   node test/director-frames.cjs [--stages=wall,gates,nashim] [--no-build] [--shots] [--idle=24] [--file=dist/test.html]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/director');
const args = process.argv.slice(2);
const A = Object.fromEntries(args.map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
if (!A['no-build']) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
// (a queued run can be re-planned while it waits for its turn: test/out/director/<tag>.args.json overrides the arguments)
try { const f = path.join(OUT, (A.tag || 'df') + '.args.json'); if (fs.existsSync(f)) { Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); console.log('args from ' + f + ': ' + JSON.stringify(A)); } } catch (e) { console.log('args file: ' + e.message); }
// (a queued ticket handed to other runs: {"exec": ["node test/x.cjs --a", …]} runs them in turn, within the ticket's 10 minutes)
if (A.exec) { const list = Array.isArray(A.exec) ? A.exec : [A.exec]; let rc = 0; for (const cmd of list) { console.log('exec ' + cmd); try { execSync(cmd, { cwd: ROOT, stdio: 'inherit' }); } catch (e) { rc = 1; } } process.exit(rc); }
const SHOTS = !!A.shots, IDLE = +(A.idle != null ? A.idle : 24) * 1000, TAG = A.tag || 'df';
const STAGES = String(A.stages || 'wall,gates,nashim').split(',').filter(Boolean);
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const rows = [];
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__TOASTS = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-toast')) window.__TOASTS.push({ t: performance.now(), s: n.textContent }); }).observe(document, { childList: true, subtree: true });
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const FILE = A.file || path.join(ROOT, 'dist/test.html');
    await pg.goto('file://' + path.resolve(FILE));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const E = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const wait = (ms) => pg.waitForTimeout(ms);
    const draw = () => E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
    const shot = async (name) => {
      if (!SHOTS) return null;
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${TAG}-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      await E(() => { window.__HUD_HOLD = false; });
      return path.relative(ROOT, f);
    };
    // the kohen as the player sees him (produce-play's heroView: on screen, hidden = head AND chest behind something, px = 3.6 amot)
    const heroView = () => E(() => {
      const S = __T.stages, h = S.hero; if (!h) return null;
      __T.camera.updateMatrixWorld();
      const cam = __T.camera, P = h.position.clone(), head = P.clone(); head.y += 3.6;
      const pr = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight, front: q.z < 1 }; };
      const a = pr(P), b = pr(head), dist = cam.position.distanceTo(head);
      const on = a.front && b.x > 10 && b.x < innerWidth - 10 && b.y > 90 && a.y < innerHeight - 110;
      let occ = null;
      if (on) {
        const mine = (o) => { for (let q = o; q; q = q.parent) if (q === h) return true; return false; };
        const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
        const block = (pt) => {
          const rc = new __T.Raycaster(); const dd = cam.position.distanceTo(pt); rc.set(cam.position, pt.clone().sub(cam.position).normalize()); rc.camera = cam;
          for (const x of rc.intersectObjects(__T.scene.children, true)) {
            if (x.object.isSkinnedMesh && x.point.distanceTo(P) < 4.5) continue;
            const mt = Array.isArray(x.object.material) ? x.object.material[0] : x.object.material;
            { let sid = null; for (let q = x.object; q && !sid; q = q.parent) { const m2 = /^stage-(\w+)$/.exec(q.name || ''); if (m2) sid = m2[1]; }
              const STD = __T.stages._dbg && __T.stages._dbg.ST; if (sid && STD && STD[sid] && STD[sid].status === 'building' && STD[sid].U && STD[sid].U.uY && x.point.y > STD[sid].U.uY.value + 0.05) continue; }
            if (mine(x.object) || !vis(x.object) || x.object.name === 'hill' || (x.object.geometry && x.object.geometry.boundingSphere && x.object.geometry.boundingSphere.radius > 3000) || x.object.name === 'pave' || x.object.isPoints || x.object.isLine || x.object.isSprite || (mt && (mt.visible === false || mt.colorWrite === false || (mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false || mt.blending === 2)) || mt.opacity < 0.2))) continue;
            return x.distance < dd - 1.2 ? { obj: (x.object.name || x.object.type) + (x.object.parent && x.object.parent.name ? '<' + x.object.parent.name : ''), d: Math.round(x.distance) } : null;
          }
          return null;
        };
        const chest = P.clone(); chest.y += 2.2;
        const o1 = block(head), o2 = block(chest);
        if (o1 && o2) occ = o1;
      }
      return { x: Math.round(b.x), y: Math.round(b.y), px: Math.round(Math.abs(a.y - b.y)), dist: Math.round(dist), on, hidden: !!occ, occ: occ && occ.obj, pos: [P.x, P.y, P.z].map(Math.round) };
    });
    const k80 = (v) => !!v && v.on && !v.hidden && v.px >= 80;
    // the camera's and his moves since log index L (the game's own log): what framed him, where he walked
    const FEV = ['workFrame', 'heroReturn', 'heroAim', 'heroRest', 'heroPlace', 'reframe', 'courseBeat', 'courseMoment', 'loadLand', 'markAim', 'checkStand', 'demoJump', 'rockFrame'];
    const evSince = (L) => E(([L, F]) => window.__GAME_LOG.slice(L).filter((e) => F.includes(e.type)).slice(-10).map((e) => `${e.type}${e.d ? ' ' + JSON.stringify(e.d).slice(0, 90) : ''}`), [L, FEV]);
    const spotGap = (id) => E((id) => { const S = __T.stages, g = __T.game.state, s = g.st[id]; const kind = s && (s.p === 'finish' || s.p === 'dig' || s.p === 'survey') ? (s.p === 'survey' ? 'survey' : 'set') : 'dress'; const w = S.workSpot(id, kind), hp = S.hero.position; return w ? { kind, gap: Math.round(Math.hypot(w.x - hp.x, w.z - hp.z)), busy: !!__T.game._.hero.busy } : null; }, id);
    const kTxt = (v) => (!v ? 'no-hero' : k80(v) ? `✓ ${v.px}px` : `✗ ${!v.on ? 'OFF' : v.hidden ? 'HIDDEN(' + v.occ + ')' : v.px + 'px'}`);
    const st = (id) => E((id) => { const g = __T.game.state, s = g.st[id]; return s ? { p: s.p, set: s.set, paid: s.paid, done: !!s.done, ready: !!s.ready, job: (__T.game._ && null) } : null; }, id);
    const logN = (t, since = 0) => E(([t, since]) => window.__GAME_LOG.filter((e, i) => i >= since && e.type === t).length, [t, since]);
    const logAt = () => E(() => window.__GAME_LOG.length);
    const logGet = (t, since = 0) => E(([t, since]) => window.__GAME_LOG.filter((e, i) => i >= since && e.type === t).map((e) => e.d), [t, since]);
    const pill = () => E(() => { const p = document.querySelector('.gm-pill'); if (!p || p.offsetParent === null) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: p.textContent.replace(/\s+/g, ' ').trim() }; });
    const modalGold = () => E(() => { const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; const go = [...document.querySelectorAll('.gm-modal.on .gm-btn-gold, .gm-mo.on .gm-mo-go')].find(vis); if (!go) return null; const r = go.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: go.textContent.trim().slice(0, 20) }; });
    const closeSheet = () => E(() => { try { __T.game.ui.closeSheet(); } catch (e) { /* */ } });
    const mark = () => E(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return t ? { x: +t[1], y: +t[2] } : null; });
    // a tap where a player taps to work: the pointer, else his kohen
    const tapWork = async () => { const m = await mark(); if (m && m.x > 4 && m.x < W - 4 && m.y > 90 && m.y < H - 110) { await tap(m.x, m.y + 6); return 'mark'; } const v = await heroView(); if (v && v.on) { await tap(v.x, v.y + Math.max(12, v.px * 0.5)); return 'hero'; } await tap(W / 2, H * 0.5); return 'mid'; };
    // (anything open that a player closes: a card's gold button; a precision game is closed by its skip)
    const clearOpen = async () => {
      for (let k = 0; k < 6; k++) {
        const g = await modalGold(); if (g) { await tap(g.x, g.y); await wait(500); continue; }
        const mg = await E(() => !!document.querySelector('.fx-mg')); if (mg) { const sk = await E(() => { const b = document.querySelector('.fx-mg .fx-skip:not([hidden]), .fx-mg .fx-go'); if (!b || b.offsetParent === null) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (sk) { await tap(sk.x, sk.y); await wait(600); continue; } }
        break;
      }
      await closeSheet();
    };
    /* the opening: a tap skips it */
    const skipOpening = async () => {
      if (!(await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000))) return;
      const n0 = await E(() => window.__GAME_LOG.filter((e) => e.type === 'opening' && e.d.at === 'end').length);
      const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
      if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
      await waitFor((n0) => window.__GAME_LOG.filter((e) => e.type === 'opening' && e.d.at === 'end').length > n0, n0, 12000);
      await wait(600);
    };
    await skipOpening();
    // DECLARED: the demo, as the menu's "מצב הדגמה" does
    const n0 = await E(() => window.__GAME_LOG.filter((e) => e.type === 'opening').length);
    await E(() => __T.game.switchMode(true));
    if (await waitFor((n0) => window.__GAME_LOG.filter((e) => e.type === 'opening').length > n0, n0, 4000)) {
      const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
      if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
      await waitFor(() => window.__GAME_LOG.filter((e) => e.type === 'opening' && e.d.at === 'end').length >= 2, null, 12000);
    }
    await wait(1200); await clearOpen();
    console.log(`   demo on: ${await E(() => !!__T.game.state.demo)} (${Math.round((Date.now() - T0) / 1000)} s)`);
    for (const id of STAGES) {
      const R = { id, shots: [] };
      rows.push(R);
      const t0 = Date.now();
      await clearOpen();
      // DECLARED: the picker's jump (the strip's "שלבים ▾" → the stage)
      const jumped = await E((id) => __T.game.jumpTo(id), id);
      if (!jumped) { await wait(1500); await clearOpen(); await E((id) => __T.game.jumpTo(id), id); }
      await wait(1400); await draw();
      R.pick = await heroView(); if (!A.probe) R.shots.push(await shot(`${id}-1pick`));
      let p = null, paid = null;
      if (A.probe) {   // DECLARED (--probe): the site put in its dig, then in its courses, by the state (no touch): the frames only
        const Ld = await logAt();
        await E((id) => {
          const g = __T.game.state;
          g.st[id] = { p: 'dig', n: __T.game._.siteStones(id), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
          g.focus = id; g.crews = g.crews.filter((c) => c.at !== id);   // (no crews: the dig waits for him)
          __T.game._.resync();
        }, id);
        await wait(2600); await waitFor(() => !__T.game._.hero.busy, null, 7000); await wait(+(A.settle || 1400)); await draw();
        R.dig = await heroView(); R.shots.push(await shot(`${id}-3dig`));
        if (!k80(R.dig)) console.log('   dig events', id, JSON.stringify(await spotGap(id)), JSON.stringify(await evSince(Ld)));
        R.digDbg = await E((id) => { const S = __T.stages, hp = S.hero.position, c = __T.camera.position; const wv = S.siteWorkView ? S.siteWorkView(id) : null; return { hero: [hp.x, hp.y, hp.z].map(Math.round), cam: c.toArray().map(Math.round), blocked: S.frameBlocked ? S.frameBlocked(c.x, c.y, c.z, hp.x, hp.y + 1.8, hp.z, id) : null, wv: wv ? { p: wv.p.map(Math.round), el: Math.round(wv.el), az: Math.round(wv.az) } : null }; }, id);
        await E((id) => { const s = __T.game.state.st[id]; s.p = 'courses'; s.paid = 0; __T.game._.resync(); }, id);
        await wait(800);
        R.Lc = await logAt();
      } else {
      // the pill: "התחל לבנות" (touch)
      p = await pill();
      if (p && /התחל/.test(p.t)) { await tap(p.x, p.y); await wait(500); }
      await closeSheet();
      await wait(400); await draw();
      R.survey = await heroView(); R.surveyPh = (await st(id) || {}).p; R.shots.push(await shot(`${id}-2survey`));
      // work by touch until the courses: a card's button first, the pill when it asks to pay (the dig, the segments), else the
      // kohen or the pointer
      let digSeen = false;
      for (let k = 0; k < 60 && Date.now() - t0 < 80000; k++) {
        if (await modalGold()) { await clearOpen(); await wait(300); continue; }
        const s = await st(id); if (!s) break;
        if (s.p === 'dig' && !digSeen) {
          digSeen = true; await wait(900);
          if (!(await modalGold())) {   // (he walks to the dig: the frame is measured once he stands at his work)
            await waitFor(() => !__T.game._.hero.busy, null, 7000); await wait(1600); await draw();
            R.dig = await heroView(); R.digDbg = await E((id) => { const S = __T.stages, hp = S.hero.position, c = __T.camera.position; return { hero: [hp.x, hp.y, hp.z].map(Math.round), cam: c.toArray().map(Math.round), blocked: S.frameBlocked ? S.frameBlocked(c.x, c.y, c.z, hp.x, hp.y + 1.8, hp.z, id) : null, wv: S.siteWorkView && S.siteWorkView(id) ? { p: S.siteWorkView(id).p.map(Math.round), el: Math.round(S.siteWorkView(id).el), az: Math.round(S.siteWorkView(id).az) } : null }; }, id);
            R.shots.push(await shot(`${id}-3dig`));
          } else digSeen = false;
        }
        if (s.p === 'courses' && s.paid > s.set) break;
        p = await pill();
        if (p && /בנה|הביאו/.test(p.t) && !/הקש/.test(p.t)) { if (/הביאו/.test(p.t)) paid = p.t; await tap(p.x, p.y); await wait(700); await closeSheet(); continue; }
        await tapWork(); await wait(650);
      }
      }
      R.paidPill = paid;
      const s1 = await st(id);
      R.paidStones = s1 ? s1.paid - s1.set : 0;
      // DECLARED fixture: the site 3 stones before its first course's end, its key stones set (the crews set the rest, ×60)
      const fx = await E((id) => { const s = __T.game.state.st[id]; return s && s.p === 'courses' ? { set: s.set, paid: s.paid, n: s.n } : null; }, id);
      const PER = { wall: 32, gates: 24, nashim: 24, sorag: 32, nikanor: 24, lishka: 24, yesod: 32, sovev: 32, guf: 32, karnot: 16, kiyor: 12, ulam: 40, heichal: 40, kodesh: 32, har: 32 }[id];
      R.fixture = fx;
      if (fx) {
        // (--course=id:N: the N-th course's end, e.g. ulam:9 — the House's upper courses; default the first)
        const CN = Math.max(1, +((String(A.course || '').split(',').map((x) => x.split(':')).find((x) => x[0] === id) || [])[1] || 1));
        R.courseN = CN;
        const CHK = String(A.check || '').split(',').includes(id);   // (--check=wall,…: the course check falls due at this course end)
        await E((v) => { window.__DF_CHECK = v; }, CHK);
        const L0 = await logAt();
        await E(([id, per, cn]) => {
          const g = __T.game.state, s = g.st[id];
          for (let i = 0; i < per * (cn + 1); i++) if (s.keys[i] == null) s.keys[i] = 0.9;
          s.set = Math.max(s.set, per * cn - 8); s.k = 0; s.paid = Math.max(s.paid, Math.min(s.n, per * cn + 16)); s.chk = window.__DF_CHECK ? Math.max(0, per * (cn - 2)) : per * (cn - 1);
          if (!g.crews.some((c) => c.at === id)) g.crews.push({ at: id });
          __T.game._.resync();
        }, [id, PER, CN]);
        await wait(1800); if (A.probe) { await waitFor(() => !__T.game._.hero.busy, null, 6000); await wait(+(A.settle || 0)); } await draw();
        R.courses = await heroView(); R.shots.push(await shot(`${id}-4courses`));
        if (!k80(R.courses)) console.log('   courses events', id, JSON.stringify(await spotGap(id)), JSON.stringify(await evSince(R.Lc || 0)));
        R.dbg = await E((id) => {
          const S = __T.stages, r = (a) => (Array.isArray(a) ? a.map((v) => Math.round(v * 10) / 10) : a), sl = S.nextSlot(id), ws = S.workSpot(id, 'dress'), C = S._dbg.crane, hp = S.hero.position, cam = __T.camera.position;
          const wv = S.siteWorkView ? S.siteWorkView(id) : null, wl = S.wallView ? S.wallView(id) : null;
          const fb = (p, q) => (S.frameBlocked ? S.frameBlocked(p[0], p[1], p[2], q[0], q[1], q[2], id) : null);
          return { slot: sl && { face: r(sl.face), n: r(sl.n), y: r(sl.y), c: sl.course, i: sl.index }, bank: ws && { x: r(ws.x), y: r(ws.y), z: r(ws.z) }, hero: r([hp.x, hp.y, hp.z]), cam: r(cam.toArray()),
            crane: C && C.g && C.g.visible ? r([C.bx, C.bz, C.g.position.y]) : null, wv: wv && { p: r(wv.p), t: r(wv.t), az: Math.round(wv.az), el: Math.round(wv.el), toHero: fb(wv.p, [hp.x, hp.y + 1.8, hp.z]) },
            wl: wl && { p: r(wl.p), t: r(wl.t), az: Math.round(wl.az), el: Math.round(wl.el) }, camToHero: fb(cam.toArray(), [hp.x, hp.y + 1.8, hp.z]) };
        }, id);
        console.log('   dbg', id, JSON.stringify(R.dbg));
        // no touch: the crews close the course (the moment waits for nothing open)
        const got = await waitFor((L0) => window.__GAME_LOG.some((e, i) => i >= L0 && e.type === 'courseMoment'), L0, 30000);
        R.moment = got ? (await logGet('courseMoment', L0))[0] : null;
        R.course = (await logGet('course', L0))[0] || null;
        R.beat = (await logGet('courseBeat', L0))[0] || null;
        R.toast = await E((L0) => (window.__TOASTS || []).map((x) => x.s).filter((s) => /נדבך/.test(s)).slice(-1)[0] || null, L0);
        if (R.beat) {
          await wait(1500); await draw();
          // the beat's frame: the course's top at the target, its screen y (the middle third = 281…563); the crane on the line to it
          R.beatFrame = await E(([id, bt]) => {
            const cam = __T.camera; cam.updateMatrixWorld();
            const c = __T.stages, cv = bt ? { t: bt, el: null } : c.courseView ? c.courseView(id) : null;   // (the beat's own target, as the game logged it)
            const hp = c.hero.position, q = __T.view.project(hp.x, hp.y + 1.8, hp.z), hx = Math.round(q.x), hy = Math.round(q.y);
            let tgt = null, craneFront = false;
            if (cv && cv.t) {
              const t = __T.view.project(cv.t[0], cv.t[1], cv.t[2]); tgt = { x: Math.round(t.x), y: Math.round(t.y), on: !!t.on };
              try { const C = c._dbg.crane; if (C && C.g && C.g.visible) { const o = cam.position.clone(), tv = new __T.Vector3(cv.t[0], cv.t[1], cv.t[2]), L = tv.distanceTo(o); const rc = new __T.Raycaster(o, tv.sub(o).normalize(), 0, L - 2); craneFront = rc.intersectObject(C.g, true).length > 0; } } catch (e) { /* */ }
            }
            return { cam: cam.position.toArray().map(Math.round), course: tgt, hero: { x: hx, y: hy, on: !!q.on }, craneFront };
          }, [id, R.beat && R.beat.t ? R.beat.t : null]);
          R.shots.push(await shot(`${id}-5beat`));
        }
        if (CHK) {   // the check's call after the beat: the plumb opens by itself (a crew set the last stone)
          R.check = await waitFor((L0) => window.__GAME_LOG.some((e, i) => i >= L0 && e.type === 'minigameStart'), L0, 12000);
          if (R.check) { await wait(1800); R.shots.push(await shot(`${id}-5check`)); R.checkHero = await heroView(); }
          await clearOpen(); await wait(1500);
        }
        await wait(3200); await draw();
        R.after = await heroView(); if (!A.probe) R.shots.push(await shot(`${id}-6after`));
        // idle: no touch for IDLE ms — heroReturn per course, K80 samples
        const L1 = await logAt(), c0 = await E((id) => __T.game.state.st[id].set, id);
        let minPx = 999, offs = 0, n = 0;
        for (let t = 0; t < IDLE && IDLE > 0; t += 3000) { await wait(3000); await draw(); const v = await heroView(); n++; if (!k80(v)) offs++; if (v) minPx = Math.min(minPx, v.px); }
        const c1 = await E((id) => __T.game.state.st[id].set, id);
        R.idle = { returns: await logN('heroReturn', L1), rests: await logN('heroRest', L1), stones: c1 - c0, courses: await logN('course', L1), samples: n, offs, minPx };
        if (A.probe) {   // DECLARED (--probe): the site in its finish (its first step paid), no crews: his finish frame
          const Lf = await logAt();
          await E((id) => { const g = __T.game.state, s = g.st[id]; s.set = s.n; s.paid = s.n; s.p = 'finish'; s.fd = 0; s.fp = 1; s.k = 0; g.crews = g.crews.filter((c) => c.at !== id); __T.game._.resync(); }, id);
          await wait(2400); await waitFor(() => !__T.game._.hero.busy, null, 8000); await wait(+(A.settle || 1400)); await draw();
          R.finish = await heroView(); R.shots.push(await shot(`${id}-7finish`));
          if (!k80(R.finish)) console.log('   finish events', id, JSON.stringify(await spotGap(id)), JSON.stringify(await evSince(Lf)));
        }
      }
      R.secs = Math.round((Date.now() - t0) / 1000);
      if (R.digDbg) console.log('   dig dbg', id, JSON.stringify(R.digDbg));
      console.log(`   ${id}: pick ${kTxt(R.pick)} · survey ${kTxt(R.survey)} · dig ${kTxt(R.dig)} · courses ${kTxt(R.courses)} · after ${kTxt(R.after)} · finish ${kTxt(R.finish)} · paid ${R.paidStones} (${R.paidPill || '-'}) · moment ${JSON.stringify(R.moment)} · beat ${JSON.stringify(R.beat)} ${JSON.stringify(R.beatFrame || null)} · toast ${R.toast || '-'} · idle ${JSON.stringify(R.idle || null)} · ${R.secs} s`);
      if (R.shots.some(Boolean)) console.log('   shots:', R.shots.filter(Boolean).join(' '));
    }
    for (const R of rows) {
      check(`[${R.id}] K80 at the pick, the survey, the dig, the courses (before and after the course end), the finish`, [R.pick, R.survey, R.dig, R.courses, R.after, R.finish].filter(Boolean).every(k80), [['pick', R.pick], ['survey', R.survey], ['dig', R.dig], ['courses', R.courses], ['after', R.after], ['finish', R.finish]].map(([k, v]) => `${k} ${kTxt(v)}`).join(' · '));
      if (R.fixture) {
        check(`[${R.id}] the crews' course end has its moment (toast + courseMoment${['kiyor', 'karnot'].includes(R.id) ? '' : ' + courseBeat'})`, !!R.moment && !!R.toast && (['kiyor', 'karnot'].includes(R.id) || !!R.beat), `${JSON.stringify(R.moment)} · ${R.toast || 'no toast'} · beat ${JSON.stringify(R.beat)}`);
        if (IDLE > 0) check(`[${R.id}] idle: ≤ 1 heroReturn per course, K80 in every sample`, R.idle && R.idle.returns <= R.idle.courses + 1 && R.idle.offs === 0, JSON.stringify(R.idle));
      }
      if (R.check !== undefined) check(`[${R.id}] the course check opens by itself after the crews' course end (the call)`, !!R.check, `${R.check} · the kohen ${kTxt(R.checkHero)}`);
      if (R.paidPill != null || R.paidStones) check(`[${R.id}] the demo's payment brings the stock's segments (> 8 stones)`, R.paidStones > 8, `${R.paidStones} · ${R.paidPill || ''}`);
    }
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    fs.writeFileSync(path.join(OUT, `${TAG}.json`), JSON.stringify(rows, null, 1));
    await ctx.close();
  } finally { await b.close(); }
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${pass}/${results.length} passed (${Math.round((Date.now() - T0) / 1000)} s)`);
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
