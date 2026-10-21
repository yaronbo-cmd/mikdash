// The first ten minutes by REAL TOUCH (wave 8B QA8B; wave 9 QA9: v17's flow): a first-time player on a phone, no autoplay flags.
//   node test/real-play.cjs [--no-build] [--demo] [--max=780] [--shots=N]
// Phone portrait 390×844, dpr 1, hasTouch/isMobile, a fresh profile (a new browser context), he-IL.
// Input is only what a player does: page.touchscreen.tap / real pointer swipes on the canvas and on the DOM, at the place
// the game shows: v17's gold pointer and ring ON the target (`.gm-mark`), the coach's hand, a boulder the player can SEE, the
// cards' gold buttons, the sheet's big button, the goal pill. The game's state is READ to judge each step (never written);
// no __MG_AUTO, no __M3_AUTO, no _.resync, no onSiteTap/onBoulderTap/onMissTap calls.
// The only test hook is the renderer's: __START_PAUSED (+ __T.simulate) — SwiftShader cannot run the loop at 60 fps, so the
// world advances in real time without drawing, and a frame is drawn before every tap and every screenshot (the tap then
// meets the camera the player would see).
// Wave 9: the boulders' world spots are read from the world (`stages.boulderSpots()`, guarded) so the same script measures
// the new boulder field; the words on the pill are logged against the games they open (a hewn stone is never "הנח").
// Each check names the owner's note of 28.9 it answers (docs/WAVE8B-BRIEF.md): N1 hidden boulders · N2 the mini-game plays
// fast/alone · N3 one fact repeats · N3b the name nowhere · N4a what to tap · N4b the zoom-out · N4d the segment panel ·
// N4e "הנח את אבן הפינה" after one tap · N4f/g/i the corner, quarry and dressing games · N4h the frozen clock · N4j progress
// unseen in the world · N4k the empty Mount · N5 music.
// Screenshots: test/out/real-play/<mode>-<nn>-<step>.png · the run's record: <mode>-seen.json, <mode>-strikes.json
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const DEMO = args.includes('--demo');
const MODE = DEMO ? 'demo' : 'normal';
const MAX = +((args.find((a) => a.startsWith('--max=')) || '').slice(6)) || 1150;   // wall-clock seconds for the whole run (SwiftShader on a shared machine is slow)
const SHOTS = +((args.find((a) => a.startsWith('--shots=')) || '').slice(8)) || 22;  // the most screenshots (each is a full SwiftShader frame)
const OUT = path.join(ROOT, 'test/out/real-play');
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844;
const NAME = 'אהרן';
// v17's twelve rocks (src/stages.js:417); a world with `boulderSpots()` (wave 9, SITE9) gives its own
const V17_BOULDERS = [[-172, -122, 8.6], [-96, -132, 7.4], [-24, -118, 9.2], [60, -110, 7.8], [128, -84, 8.4], [178, -30, 7.6],
  [186, 40, 8.8], [124, 112, 7.4], [34, 124, 8.4], [-58, 118, 7.8], [-142, 124, 8.6], [-240, -30, 9]];

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  [${MODE}] ${name}${info ? '  · ' + info : ''}`); };
const note = (s) => console.log(`   · ${s}`);
const T0 = Date.now();
const left = () => MAX * 1000 - (Date.now() - T0);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'] });
  const logs = [];
  const bootFacts = [];
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DIALOGS = [];
      // an observer, not a driver: at the instant of each strike, what the player sees of its boulder (window.__SEEN)
      window.__SEEN = []; const push0 = Array.prototype.push;
      window.__GAME_LOG.push = function (e) { try { if (e && e.type === 'strike' && window.__onStrike) window.__SEEN.push(window.__onStrike(e)); } catch (err) { /* observer */ } return push0.call(this, e); };
      for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; };
    });
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text().slice(0, 200)); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message.slice(0, 200)));
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html') + (DEMO ? '#demo' : ''));
    // the loading screen's fact (N3), read before the loader goes
    const bootFact = () => pg.waitForFunction(() => { const f = document.querySelector('#load .fx-boot'); return f ? f.textContent : (window.__T && window.__T.booted ? '(gone)' : null); }, null, { polling: 50, timeout: 240000 }).then((h) => h.jsonValue(), () => '');
    bootFacts.push(await bootFact());
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    const E = (fn, a) => pg.evaluate(fn, a);
    const wait = (ms) => pg.waitForTimeout(ms);
    let nShot = 0;
    // before a tap: the camera's matrices and the HUD anchors as the loop would have them this frame (the tap's raycast and
    // the pointer/coach positions use exactly these); a full SwiftShader frame is drawn only for the screenshots
    const draw = () => E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
    const shots = [];
    // (QA9) the 2D games (the precision games, the board) run on requestAnimationFrame. Here, SwiftShader composites the idle
    // WebGL canvas so slowly that rAF gets 0.33 frames/s (probe 15:15: 42/s with that canvas hidden), and a timing game would
    // stand still. So while a 2D game is open the 3D canvas is hidden (visibility only, shown again for each shot): the game's
    // own clock then runs at a phone's pace. Nothing in the game's logic, input or timing is touched.
    const canvas3d = (on) => E((v) => { const c = [...document.querySelectorAll('canvas')].find((x) => !x.closest('.fx-mg, .m3')); if (c) c.style.visibility = v ? '' : 'hidden'; }, on);
    let hidden3d = false;
    const shot = async (name, force = false) => {
      if (nShot >= SHOTS && !force) return null;
      if (hidden3d) await canvas3d(true);
      const info = await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); const c = __T.crews && __T.crews.stats; const cp = __T.camera.position, h = __T.stages.hero && __T.stages.hero.position; return { drawn: c ? c.actorsDrawn : null, people: c ? c.visible : null, carts: c ? c.carts : null, camToHero: h ? Math.round(Math.hypot(cp.x - h.x, cp.y - h.y, cp.z - h.z)) : null }; });
      const f = path.join(OUT, `${MODE}-${String(++nShot).padStart(2, '0')}-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      await E(() => { window.__HUD_HOLD = false; });
      if (hidden3d) await canvas3d(false);
      shots.push({ f: path.basename(f), ...info });
      note(`shot ${path.relative(ROOT, f)} ${JSON.stringify(info)}`);
      return f;
    };
    const world = () => E(() => { const S = __T.stages, h = S.status('har') || {}; return { har: h.status, prog: +(h.progress || 0).toFixed(3), shown: +(h.shown || 0).toFixed(3), standing: S.boulders.filter((v) => v > 0).length }; });
    const st = () => E(() => { if (!__T.game) return { gone: true, ftue: -1, bh: '', p: null }; const g = __T.game.state, h = g.st.har || {}; return { ftue: g.ftue, p: h.p, set: h.set, paid: h.paid, done: !!h.done, bh: g.bh.join(''), res: g.res.stone, name: g.name, demo: !!g.demo, crews: g.crews.length }; });
    // v17's pointer: a gold pointer + ring ON the world target (`.gm-mark`; the game's `mark` event names it)
    const markPt = async () => { await draw(); return E(() => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop(); const bub = document.querySelector('.gm-bub'); return t ? { x: +t[1], y: +t[2], d: L ? L.d : null, text: bub && !bub.classList.contains('gm-hidden') ? bub.textContent.trim() : '' } : null; }); };
    const coachPt = () => E(() => { const c = document.querySelector('.gm-coach'); if (!c || c.classList.contains('gm-hidden') || c.style.opacity === '0') return null; const m = c.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); const bub = document.querySelector('.gm-bub'); return m ? { x: +m[1], y: +m[2], text: bub ? bub.textContent.trim() : '' } : null; });
    const ringPt = () => E(() => { const r = document.querySelector('.gm-ring'); if (!r || !r.classList.contains('live')) return null; const m = r.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? { x: +m[1], y: +m[2] } : null; });
    const inFrame = (p) => !!p && p.x > 20 && p.x < W - 20 && p.y > 110 && p.y < H - 140;
    const tap = async (x, y, why) => { await draw(); await pg.touchscreen.tap(x, y); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
    const tapEl = async (sel, why) => { const h = await pg.$(sel); if (!h) return false; const r = await h.boundingBox(); if (!r) return false; await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); note(`tap ${sel} ${why || ''}`); return true; };
    const modalText = () => E(() => { const m = document.querySelector('.gm-modal.on .gm-card'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 200) : null; });
    const tapModal = async () => (await tapEl('.gm-modal.on .gm-btn-gold', 'card')) || tapEl('.gm-modal.on button', 'card (its only button)');
    // the words the player reads: the pill, the coach's line, the newest toast (a timeline, for N4e and the words-match check)
    const words = [];
    const readWords = async (at) => {
      const w = await E(() => { const t = (s) => { const n = document.querySelector(s); return n && n.offsetParent ? n.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : ''; }; const ts = [...document.querySelectorAll('.gm-toasts .gm-toast')].map((n) => n.innerText.replace(/\s+/g, ' ').trim().slice(0, 100)); return { pill: t('.gm-pill'), bub: t('.gm-bub'), toast: ts[ts.length - 1] || '' }; });
      const last = words[words.length - 1];
      if (!last || last.pill !== w.pill || last.bub !== w.bub || last.toast !== w.toast) words.push({ t: Math.round((Date.now() - T0) / 1000), at, ...w });
      return w;
    };

    await E((B) => {
      const S = __T.stages;
      let spots = null;
      try {
        const v = typeof S.boulderSpots === 'function' ? S.boulderSpots() : null;
        if (Array.isArray(v) && v.length) spots = v.map((q) => (Array.isArray(q) ? [+q[0], +q[1], +(q[2] || 8)] : [+q.x, +q.z, +(q.r || 8)]));
      } catch (e) { spots = null; }
      window.__SPOTS = spots && spots.every((q) => Number.isFinite(q[0]) && Number.isFinite(q[1])) ? spots : B;
      window.__SPOTS_SRC = window.__SPOTS === B ? 'the v17 list' : 'stages.boulderSpots()';
      window.__viewOf = (i) => {
        const [x, z, r] = window.__SPOTS[i]; const hill = S._dbg.hill, cam = __T.camera;
        const y = hill.heightAt(x, z) + r * 0.72, p = S.screenPos({ boulder: i }, {});
        const cp = cam.position, dist0 = Math.hypot(cp.x - x, cp.y - y, cp.z - z);
        const onScr = !!p && p.on && p.x > 20 && p.x < innerWidth - 20 && p.y > 110 && p.y < innerHeight - 140;
        let occ = null;
        if (p && p.on) {
          const rc = new __T.Raycaster(); rc.setFromCamera({ x: p.x / innerWidth * 2 - 1, y: -(p.y / innerHeight) * 2 + 1 }, cam);
          const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
          for (const h of rc.intersectObjects(__T.scene.children, true)) {
            if (!vis(h.object) || h.object.isPoints || h.object.isLine || h.object.isSprite || (h.object.material && h.object.material.transparent && h.object.material.opacity < 0.5)) continue;
            if (h.distance < dist0 - r * 1.3) occ = { d: Math.round(h.distance), of: Math.round(dist0), obj: h.object.name || h.object.type, y: +h.point.y.toFixed(1) };
            break;
          }
        }
        const hp = S.hero && S.hero.position;
        return { i, x: p ? Math.round(p.x) : null, y: p ? Math.round(p.y) : null, on: onScr, hidden: !!occ, occ, dist: Math.round(dist0), hero: hp ? [Math.round(hp.x), Math.round(hp.z)] : null };
      };
      window.__onStrike = (e) => {
        const j = e.d && e.d.job; if (!/^b\d+$/.test(j || '')) return { job: j };
        const mk = document.querySelector('.gm-mark'), L = window.__GAME_LOG.filter((x) => x.type === 'mark').pop();
        const marked = mk && !mk.classList.contains('gm-hidden') && mk.style.opacity !== '0' && L && L.d ? L.d.boulder : null;
        return { job: j, t: Math.round(performance.now()), marked, ...window.__viewOf(+j.slice(1)) };
      };
    }, V17_BOULDERS);
    await E(() => {   // (wave 9) an observer on the world's key-stone delivery (the cart and the crane): each call and when it lands
      const S = __T.stages; window.__DELIVER = [];
      if (typeof S.deliverKeyStone === 'function' && !S.deliverKeyStone.__qa) {
        const f = S.deliverKeyStone; const g = function (...a) { const rec = { t: Math.round(performance.now()), args: JSON.stringify(a).slice(0, 80), landed: null }; window.__DELIVER.push(rec); const p = f.apply(this, a); try { Promise.resolve(p).then((v) => { rec.landed = Math.round(performance.now()); rec.v = JSON.stringify(v).slice(0, 80); }, () => { rec.landed = -1; }); } catch (e) { /* observer */ } return p; };
        g.__qa = true; S.deliverKeyStone = g;
      }
    });
    const spotsSrc = await E(() => window.__SPOTS_SRC);
    const spots = await E(() => window.__SPOTS);
    note(`boulder spots: ${spotsSrc}; field ${Math.round(Math.max(...spots.map((q) => q[0])) - Math.min(...spots.map((q) => q[0])))}×${Math.round(Math.max(...spots.map((q) => q[1])) - Math.min(...spots.map((q) => q[1])))} amot`);

    /* ── 1. the opening ── */
    const s0 = await st();
    note(`boot ${((Date.now() - T0) / 1000).toFixed(0)} s · ${JSON.stringify(s0)}`);
    check('a fresh profile starts in the mode of its link', s0.demo === DEMO, `G.demo=${s0.demo}`);
    check('N3 the loading screen shows a true fact with its source', /פרט אמיתי/.test(bootFacts[0]) && bootFacts[0].length > 30, bootFacts[0].slice(0, 80));
    await wait(2500);
    const opEnd = await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, { polling: 200, timeout: 20000 }).then(() => true, () => false);
    check('the opening ends by itself', opEnd);
    await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 200, timeout: 20000 }).catch(() => {});
    await wait(1600);   // (the camera settles on the builder)

    /* ── 2. the survey: tap where the pointer is ── */
    let m = await markPt();
    const c0 = m || (await coachPt());
    await shot('survey');
    note(`survey pointer ${JSON.stringify(m)}`);
    check('N4a the survey: a pointer ON its target, on screen, with a line', inFrame(m) && !!(m.text || (await readWords('survey')).bub), JSON.stringify(c0));
    let surveyTaps = 0;
    for (let k = 0; k < 12 && (await st()).p === 'survey'; k++) {
      m = (await markPt()) || (await coachPt()) || (await ringPt());
      if (!m) { note('no pointer, no hand, no ring: the player does not know where to tap'); break; }
      await tap(m.x, m.y, 'on the pointer (survey)'); surveyTaps++;
      await wait(1400);
    }
    const s1 = await st();
    check('the survey done by taps on the pointer', s1.p && s1.p !== 'survey', `${surveyTaps} taps · ${JSON.stringify(s1)}`);
    const w1 = await world();

    /* ── 3. the boulders: the player taps the pointer (else a boulder he can SEE) ── */
    const strikes = [];
    let lastLog = 0, stuck = 0, unseenShots = 0, lateShot = false, noMark = 0;
    const tB0 = Date.now();
    for (let k = 0; k < 110 && left() > 120000; k++) {
      const s = await st();
      if (s.p !== 'dig' && s.p !== 'boulders' && s.p !== 'survey') break;
      if (await modalText()) { note('modal: ' + (await modalText())); await tapModal(); await wait(500); continue; }
      m = await markPt();
      // (the camera glides 1.3 s to the next boulder: a player looks for up to 2.5 s, then taps what he sees)
      for (let q = 0; q < 5 && !(m && inFrame(m)); q++) { await wait(500); m = await markPt(); }
      const views = await E((bh) => { const o = []; for (let i = 0; i < bh.length; i++) if (bh[i] !== '0') o.push(window.__viewOf(i)); return o; }, s.bh);
      const seen = views.filter((v) => v.on && !v.hidden);
      let tgt = null, why = '';
      if (m && inFrame(m)) { tgt = m; why = `pointer (b${m.d && m.d.boulder})`; }
      else {
        noMark++;
        const hand = await coachPt(), ring = await ringPt();
        if (hand) { tgt = hand; why = `hand "${hand.text}"`; }
        else if (seen.length) { const ref = ring || { x: W / 2, y: H / 2 }; seen.sort((a, b2) => Math.hypot(a.x - ref.x, a.y - ref.y) - Math.hypot(b2.x - ref.x, b2.y - ref.y)); tgt = seen[0]; why = `no pointer: a visible boulder ${seen[0].i}`; }
        else if (ring) { tgt = ring; why = 'no pointer, no rock in sight: the rhythm ring'; }
      }
      if (!tgt) {
        if (++stuck <= 1) { note(`no target visible: standing ${views.map((v) => `${v.i}:${v.on ? 'on' : 'off'}${v.hidden ? '/hid' : ''}`).join(' ')}`); await shot('no-target'); }
        const pill = await E(() => { const b = document.querySelector('.gm-pill'); const r = b && b.getBoundingClientRect(); return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; });
        if (!pill) break;
        tgt = pill; why = 'the goal pill (nothing to tap in the world)';
      }
      if (!strikes.length) await shot('boulder-first');
      else if (!lateShot && s.bh.replace(/0/g, '').length <= 2) { lateShot = true; await shot('boulder-last'); }
      const before = await E(() => window.__GAME_LOG.filter((e) => e.type === 'strike').length);
      await tap(tgt.x, tgt.y, strikes.length < 3 || /no pointer|pill/.test(why) ? why : '');
      await pg.waitForFunction((n) => window.__GAME_LOG.filter((e) => e.type === 'strike').length > n, before, { polling: 100, timeout: 5000 }).catch(() => {});
      const { after, cur } = await E(() => { const L = window.__GAME_LOG.filter((e) => e.type === 'strike'); const j = L.length ? L[L.length - 1].d.job : ''; return { after: L.length, cur: /^b\d+$/.test(j) ? +j.slice(1) : null }; });
      const target = await E(() => window.__SEEN[window.__SEEN.length - 1] || null);
      strikes.push({ k, why, struck: after > before, cur, pointed: m && m.d ? m.d.boulder : null, target });
      if (after > before && target && target.i != null && (!target.on || target.hidden)) { note(`STRUCK AN UNSEEN BOULDER ${JSON.stringify(target)}`); if (++unseenShots <= 1) await shot(`unseen-boulder-${cur}`); }
      if (Date.now() - lastLog > 30000) { lastLog = Date.now(); note(`progress ${JSON.stringify(await st())}`); }
      await wait(600);
    }
    const tBoulders = Math.round((Date.now() - tB0) / 1000);
    const s2 = await st();
    const all = (await E(() => window.__SEEN)).filter((x) => x.i != null);   // every boulder strike, measured at its instant
    const unseen = all.filter((x) => !x.on || x.hidden);
    check('N1 every boulder struck was visible and on screen (none behind the hill)', all.length > 0 && unseen.length === 0, `${unseen.length} of ${all.length} strikes on an unseen boulder: ${unseen.map((x) => `b${x.i}${x.hidden ? '(behind ' + x.occ.obj + ')' : '(off screen)'}`).join(' ')}`);
    const unpointed = strikes.filter((x) => x.struck && (x.pointed == null || x.pointed !== x.cur));
    check('N4a the pointer was on the struck boulder, in frame, before every strike', strikes.some((x) => x.struck) && unpointed.length === 0 && noMark === 0, `${unpointed.length} strikes without the pointer on their rock; ${noMark} looks found no pointer in frame${unpointed.length ? ': ' + unpointed.slice(0, 5).map((x) => `k${x.k}:b${x.cur}←${x.pointed}`).join(' ') : ''}`);
    const dists = all.map((x) => x.dist);
    check('N4b the camera stays close at every strike (≤ 150 amot; the owner: "זום אאוט מאוד גדול")', dists.length && Math.max(...dists) <= 150, `camera→rock median ${med(dists)}, max ${dists.length ? Math.max(...dists) : '-'} amot`);
    // the walk between rocks (wave 9's boulder field: "the walk between strikes is short")
    const hops = []; for (let q = 1; q < all.length; q++) if (all[q].i !== all[q - 1].i) { const [x0, z0] = spots[all[q - 1].i], [x1, z1] = spots[all[q].i]; hops.push(Math.round(Math.hypot(x1 - x0, z1 - z0))); }
    note(`rock to rock (the builder's walk, amot): ${hops.join(' ')} · median ${med(hops)} · ${tBoulders} s for the hill`);
    const w2 = await world();
    check('N4j the rough hill cleared by taps — and the world shows it (no boulder standing)', !/[12]/.test(s2.bh) && w2.standing === 0, JSON.stringify({ bh: s2.bh, world: w2, before: w1 }));
    await shot('after-boulders');
    fs.writeFileSync(path.join(OUT, `${MODE}-strikes.json`), JSON.stringify({ spots: spotsSrc, hops, strikes }, null, 1));

    /* ── 4. after the hill: the player follows what the screen asks, one tap at a time ── */
    const seen = { modal: [], mg: [], board: null, sheets: [], chips: [], name: null, segAt: 0, afterSeg: [], strokes: 0 };
    const chipLog = new Map();   // countdown text → [first seen, last seen]
    // every visible clock on screen ("m:ss" in a chip, a sheet, a toast, the pill): its context (digits masked) and its value
    const readChips = () => E(() => {
      const out = [];
      for (const n of document.querySelectorAll('body *')) {
        if (n.children.length || !n.offsetParent) continue;
        const mm = (n.textContent || '').match(/(\d{1,2}):(\d\d)/); if (!mm) continue;
        const box = n.closest('button, .gm-toast, .gm-row, .gm-pill, .gm-card, .fx-mg, div') || n;
        out.push({ key: box.textContent.replace(/[\d⁦-⁩]/g, '').replace(/\s+/g, ' ').trim().slice(0, 50), val: +mm[1] * 60 + +mm[2] });
      }
      return out;
    });
    const music0 = await E(() => { try { return globalThis.__BH_MUSIC ? globalThis.__BH_MUSIC.get() : null; } catch (e) { return null; } });
    let acts = 0, boards = 0, lastShotKind = '', dead = 0, afterSegPlayed = 0, keyShot = false, lastPaid = null, lastPill = '';
    while (left() > 30000 && acts < 200) {
      acts++;
      for (const { key, val } of await readChips()) {
        const r = chipLog.get(key), t = Date.now();
        if (!r) chipLog.set(key, { v: val, t0: t, t1: t, frozen: 0, ticks: 0 });
        else { if (val === r.v) { r.t1 = t; if (val > 0 && t - r.t0 >= 2500) r.frozen = Math.max(r.frozen, t - r.t0); } else { if (val < r.v) r.ticks++; r.v = val; r.t0 = r.t1 = t; } }
      }
      const s = await st();
      if (s.gone) { seen.gone = Math.round((Date.now() - T0) / 1000); note('__T.game is gone (the game was torn down): the run stops here'); break; }
      const w = await readWords('loop');
      // the segment: bought from the sheet's big button or straight from the pill ("בנה … · למקטע הבא") — its stones arrive
      if (!seen.segAt && s.ftue >= 3 && lastPaid != null && s.paid - lastPaid >= 8) { seen.segAt = Date.now(); seen.segBy = seen.segBy || `pill "${lastPill}"`; note(`segment bought (${seen.segBy}): paid ${lastPaid} → ${s.paid}`); }
      lastPaid = s.paid; lastPill = w.pill;
      if (seen.segAt && Date.now() - seen.segAt < 25000) seen.afterSeg.push(`${Math.round((Date.now() - seen.segAt) / 1000)}s pill "${w.pill}" | ${w.toast}`);
      if (s.ftue >= 99 && boards >= 1 && seen.segAt && (afterSegPlayed >= 1 || Date.now() - seen.segAt > 150000)) break;
      // the name prompt, then the greeting card (a third card), the HUD chip and the plate
      if (await pg.$('.gm-modal.on .gm-input')) {
        await shot('name-prompt', true);
        await tapEl('.gm-modal.on .gm-input', 'name field'); await pg.keyboard.type(NAME); await wait(300);
        await tapEl('.gm-modal.on .gm-btn-gold', 'name: next'); await wait(1500);
        const greet = await modalText();
        await shot('greet', true);
        if (greet && !(await pg.$('.gm-modal.on .gm-input'))) { seen.modal.push(greet); await tapModal(); await wait(1500); }
        const where = await E((nm) => { const o = []; for (const n of document.querySelectorAll('body *')) { if (n.children.length || !n.offsetParent) continue; if ((n.textContent || '').includes(nm)) o.push((n.className && String(n.className)) || n.tagName); } return o; }, NAME);
        const chip = await E(() => { const c = document.querySelector('.gm-top .gm-name:not(.gm-hidden), .gm-name:not(.gm-hidden)'); const p = document.querySelector('.gm-plate:not(.gm-hidden)'); return { chip: c ? c.textContent.trim() : '', plate: p ? p.textContent.trim() : '' }; });
        seen.name = { greet, ...chip, where };
        await shot('after-name');
        continue;
      }
      const mt = await modalText();
      if (mt) { seen.modal.push(mt); note('modal: ' + mt.slice(0, 120)); if (lastShotKind !== mt.slice(0, 20)) { lastShotKind = mt.slice(0, 20); if (seen.modal.length <= 3) await shot('modal'); } await tapModal(); await wait(600); continue; }
      // a precision game: watch it 4 s with no input, then play it by hand
      const mg = await E(() => { const w = document.querySelector('.fx-mg'); if (!w) return null; const tx = (s) => ((w.querySelector(s) || {}).innerText || '').replace(/\s+/g, ' ').trim(); return { kind: w.dataset.kind, title: tx('.fx-mg-top'), hint: tx('.fx-mg-hint'), fact: tx('.fx-mg-fact'), how: tx('.fx-mg-how'), done: w.classList.contains('done') }; });
      if (mg) {
        if (mg.done) { await tapEl('.fx-mg .fx-go', 'mini-game: המשך'); await wait(800); continue; }
        const pillBefore = (words.slice().reverse().find((x) => x.at === 'loop' && x.pill) || {}).pill || '';
        note(`mini-game ${JSON.stringify(mg).slice(0, 300)}`);
        await shot(`mg-${mg.kind}-open`);
        hidden3d = true; await canvas3d(false);
        const t1 = Date.now();
        const self = await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); }, null, { polling: 150, timeout: 4000 }).then(() => true, () => false);
        const r0 = { kind: mg.kind, title: mg.title, hint: mg.hint, fact: mg.fact, pillBefore, endedWithoutInput: self, ms: Date.now() - t1, afterSeg: !!seen.segAt };
        if (self) await shot(`mg-${mg.kind}-ended-alone`);
        else {
          // by hand: the first-time how-to is tapped away first; then the player taps where and when the game's own on-screen
          // hand shows (`.fx-mg.__mg.cue()` → {x, y, now}), else a first-timer's tap on the picture about once a second; ≤ 45 s
          if (await pg.$('.fx-mg .fx-mg-how:not([hidden])')) { await tapEl('.fx-mg .fx-mg-how:not([hidden])', 'the how-to'); await wait(700); }
          const cv = await (await pg.$('.fx-mg canvas')).boundingBox();
          let taps = 0, cued = 0, unsure = 0, lastTap = Date.now(); const t2 = Date.now();
          while (Date.now() - t2 < 45000) {
            const d = await E(() => { const w = document.querySelector('.fx-mg'); if (!w || w.classList.contains('done')) return { end: true }; const mm = w.__mg; let c = null; try { c = mm && typeof mm.cue === 'function' ? mm.cue() : null; } catch (e) { c = null; } let how = false; try { how = mm && typeof mm.state === 'function' ? !!mm.state().how : !!w.querySelector('.fx-mg-how:not([hidden])'); } catch (e) { how = false; } return { end: false, cue: c, how }; });   // (the how-to stays in the DOM, hidden: read the game's own state)
            if (d.end) break;
            if (d.how) { if (!(await tapEl('.fx-mg .fx-mg-how:not([hidden])', 'the how-to'))) await pg.touchscreen.tap(cv.x + cv.width / 2, cv.y + cv.height / 2); await wait(500); continue; }
            if (d.cue && d.cue.btn) { if (!(await tapEl(`.fx-mg [data-b="${d.cue.btn}"]`, ''))) await wait(200); cued++; }   // (whole stones: the button the hand shows)
            else if (d.cue && typeof d.cue.x === 'number') { if (d.cue.timed !== false && !d.cue.now && Date.now() - lastTap < 8000) { await wait(40); continue; } await pg.touchscreen.tap(cv.x + d.cue.x * cv.width, cv.y + d.cue.y * cv.height); if (d.cue.now) cued++; else unsure++; }   // (the cue is in the canvas' 0…1 box; a hand that never says "now" for 8 s: the player taps anyway)
            else await pg.touchscreen.tap(cv.x + cv.width / 2, cv.y + cv.height * 0.55);
            taps++; lastTap = Date.now();
            if (taps === 3 && seen.mg.length < 3) await shot(`mg-${mg.kind}-playing`);
            await wait(d.cue ? 250 : 900);
          }
          r0.cued = cued; r0.unsure = unsure; r0.taps = taps; r0.playMs = Date.now() - t2;
          r0.result = await E(() => { const w = document.querySelector('.fx-mg'); if (!w) return 'closed'; const t = (s) => ((w.querySelector(s) || {}).textContent || '').replace(/\s+/g, ' ').trim(); return w.classList.contains('done') ? `${t('.fx-mg-tier')} · ${t('.fx-mg-acc')}` : ''; });
          r0.fact = r0.fact || (await E(() => ((document.querySelector('.fx-mg .fx-mg-fact') || {}).innerText || '').replace(/\s+/g, ' ').trim()));
          r0.finished = await E(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); });
          if (r0.result && r0.result !== 'closed' && seen.mg.length < 3) await shot(`mg-${mg.kind}-${r0.finished ? 'result' : 'unfinished'}`);
          if (!r0.finished) { note('the game did not end in 45 s of play: the player skips'); if (!(await tapEl('.fx-mg .fx-skip:not([hidden])', 'skip'))) await tapEl('.fx-mg .fx-go', 'continue'); await wait(1200); }
        }
        // the player leaves the result the way it asks ("המשך"), and the game closes before the world is watched again
        if (await pg.$('.fx-mg.done .fx-go')) { await tapEl('.fx-mg .fx-go', 'mini-game: המשך'); await pg.waitForFunction(() => !document.querySelector('.fx-mg'), null, { polling: 150, timeout: 4000 }).catch(() => {}); }
        hidden3d = false; await canvas3d(true);
        if (seen.segAt) {
          afterSegPlayed++;
          if (afterSegPlayed === 1) {   // M11: the hewn corner stone → the cart brings it → the crane sets it (wave 9)
            const tk = Date.now(); const beat = [];
            for (const at of [3000, 11000, 20000]) {
              while (Date.now() - tk < at) { if (await modalText()) { beat.push('card: ' + (await modalText()).slice(0, 80)); await tapModal(); } await readWords('keystone'); await wait(400); }
              await shot(`keystone-${Math.round(at / 1000)}s`, true);
            }
            seen.keystone = { words: words.filter((x) => x.at === 'keystone').map((x) => `${x.pill} | ${x.toast}`), cards: beat, deliver: await E(() => window.__DELIVER), world: await world() };
            note(`key stone after the game: ${JSON.stringify(seen.keystone).slice(0, 400)}`);
          }
        }
        seen.mg.push(r0); note(`mini-game result ${JSON.stringify(r0).slice(0, 400)}`);
        continue;
      }
      // the board
      if (await pg.$('.m3 .m3-hit')) {
        boards++;
        const mv = () => E(() => +((document.querySelector('.m3-moves b') || {}).textContent || NaN));
        await wait(1500);
        await shot('board-open');
        hidden3d = true; await canvas3d(false);
        const card = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 140) : null; });
        const diag = {};
        if (card) {   // (the start card: goals and moves; its button "התחל")
          diag.hit = await E(() => { const b = document.querySelector('.m3 .m3-card .m3-cta'); if (!b) return null; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { onCta: !!e && (e === b || b.contains(e)), top: e ? `${e.tagName}.${String(e.className).slice(0, 30)}` : null }; });
          note(`board card: ${card.slice(0, 60)} · hit-test at "התחל": ${JSON.stringify(diag.hit)}`);
          await tapEl('.m3 .m3-card .m3-cta', 'the board\'s start card: התחל'); await wait(1500);
          if (await E(() => !!document.querySelector('.m3 .m3-card .m3-cta'))) {   // (diagnosis: the touch did not start the board; does a mouse click?)
            diag.touchIgnored = true; const hb2 = await (await pg.$('.m3 .m3-card .m3-cta')).boundingBox();
            await pg.mouse.click(hb2.x + hb2.width / 2, hb2.y + hb2.height / 2); await wait(1500);
            diag.mouseWorked = !(await E(() => !!document.querySelector('.m3 .m3-card .m3-cta')));
            note(`the board's "התחל" ignored a touch; a mouse click ${diag.mouseWorked ? 'started it' : 'did not either'}`);
          }
        }
        if (diag.touchIgnored && !diag.mouseWorked) {   // the player is stuck at the start card: taps beyond it fall through to the HUD
          seen.board = { movesAtOpen: await mv(), selfPlay: false, accepted: 0, dead: true, diag };
          note('the board cannot be started by touch: the player is stuck here (the run stops)');
          await shot('board-dead', true);
          break;
        }
        const m0 = await mv(); await wait(5000); const m1 = await mv();
        const rec = { movesAtOpen: m0, after5sNoInput: m1, selfPlay: m0 !== m1 };
        const hb = await (await pg.$('.m3 .m3-hit')).boundingBox();
        const cs = Math.floor(Math.min(hb.width / 8, hb.height / 9)), ox = hb.x + (hb.width - cs * 8) / 2, oy = hb.y + (hb.height - cs * 9) / 2;
        // a simple greedy player: it SEES the board (the pixels at each cell's centre, clustered into kinds), picks the swap
        // that makes the longest line, and plays it by two real taps (a vessel, then its neighbour)
        let ok = 0, tried = 0, noMove = 0;
        for (let k = 0; k < 40 && ok < 24 && (await pg.$('.m3 .m3-hit')) && !(await E(() => { const c = document.querySelector('.m3 .m3-card'); return !!(c && c.offsetParent); })); k++) {
          const grid = await E(({ ox, oy, cs }) => {
            const cv = document.querySelector('.m3 .m3-cv'); if (!cv) return null;
            const rr = cv.getBoundingClientRect(), sx = cv.width / rr.width, g = cv.getContext('2d');
            const bgc = [[243, 230, 203], [234, 218, 185]], near = (a, b2, d) => Math.hypot(a[0] - b2[0], a[1] - b2[1], a[2] - b2[2]) < d;
            const out = [], cl = [];
            for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) {
              const cx = ox + (c + 0.5) * cs - rr.left, cy = oy + (r + 0.5) * cs - rr.top, h = Math.max(2, Math.round(cs * 0.36 * sx));
              const d = g.getImageData(Math.round(cx * sx - h / 2), Math.round(cy * sx - h / 2), h, h).data;
              let n = 0, R = 0, G2 = 0, B2 = 0;
              for (let q = 0; q < d.length; q += 4) { const px = [d[q], d[q + 1], d[q + 2]]; if (d[q + 3] < 200 || near(px, bgc[0], 22) || near(px, bgc[1], 22)) continue; n++; R += px[0]; G2 += px[1]; B2 += px[2]; }
              if (n < h * h * 0.15) { out.push(-1); continue; }
              const mm = [R / n, G2 / n, B2 / n];
              let id = cl.findIndex((q) => near(q, mm, 38));
              if (id < 0) { id = cl.length; cl.push(mm); }
              out.push(id);
            }
            return { out, kinds: cl.length };
          }, { ox, oy, cs });
          if (!grid) break;
          const A = grid.out, at = (r, c) => (r < 0 || r > 8 || c < 0 || c > 7 ? -2 : A[r * 8 + c]);
          const line = (B, r, c) => { const v = B[r * 8 + c]; if (v < 0) return 0; let h = 1, w2 = 1; for (let q = c - 1; q >= 0 && B[r * 8 + q] === v; q--) h++; for (let q = c + 1; q < 8 && B[r * 8 + q] === v; q++) h++; for (let q = r - 1; q >= 0 && B[q * 8 + c] === v; q--) w2++; for (let q = r + 1; q < 9 && B[q * 8 + c] === v; q++) w2++; return Math.max(h >= 3 ? h : 0, w2 >= 3 ? w2 : 0); };
          let best = null;
          for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
            if (at(r, c) < 0 || at(r + dr, c + dc) < 0) continue;
            const B = A.slice(), a = r * 8 + c, b2 = (r + dr) * 8 + c + dc; [B[a], B[b2]] = [B[b2], B[a]];
            const sc = Math.max(line(B, r, c), line(B, r + dr, c + dc));
            if (sc >= 3 && (!best || sc > best.sc || (sc === best.sc && r > best.r))) best = { r, c, dr, dc, sc };
          }
          if (!best) { noMove++; note(`greedy: no line seen (${grid.kinds} kinds) — waiting`); await wait(1500); if (noMove > 4) break; continue; }
          const before = await mv();
          const x1 = ox + (best.c + 0.5) * cs, y1 = oy + (best.r + 0.5) * cs, x2 = x1 + best.dc * cs, y2 = y1 + best.dr * cs;
          await pg.touchscreen.tap(x1, y1); await wait(150); await pg.touchscreen.tap(x2, y2);
          tried++;
          await pg.waitForFunction((b0) => { const mm = +((document.querySelector('.m3-moves b') || {}).textContent || NaN); return mm !== b0 || !document.querySelector('.m3 .m3-hit'); }, before, { polling: 150, timeout: 3000 }).catch(() => {});
          if ((await mv()) !== before) ok++;
          if (ok === 10) await shot('board-10-moves');
          await wait(1400);   // (the cascade settles: a locked board ignores taps)
        }
        rec.greedyTried = tried; rec.accepted = ok; rec.card = card ? card.slice(0, 40) : null; rec.diag = diag;
        const endCard = await E(() => { const c = document.querySelector('.m3 .m3-card'); return c && c.offsetParent ? c.innerText.replace(/\s+/g, ' ').slice(0, 140) : null; });
        if (endCard) { rec.endCard = endCard; if (seen.mg.length + boards < 6) await shot('board-end'); await (await E(() => { const b = [...document.querySelectorAll('.m3 .m3-card button')].find((x) => /חזרה לבנייה/.test(x.textContent)) || document.querySelector('.m3 .m3-card .m3-cta'); if (b) b.dataset.qa = 'end'; return !!b; })) && (await tapEl('.m3 .m3-card button[data-qa="end"]', 'the board\'s end card: back to the building')); await wait(1500); }
        seen.board = seen.board || rec; note(`board ${JSON.stringify(rec)}`);
        // leave the board the way a player does (the exit), then the result
        if (await pg.$('.m3 .m3-exit')) { await tapEl('.m3 .m3-exit', 'board exit'); await wait(900); const q = await pg.$('.m3 .m3-btn:not(.m3-exit)'); if (q) { await tapEl('.m3 .m3-btn:not(.m3-exit)', 'confirm'); } await wait(1200); }
        hidden3d = false; await canvas3d(true);
        continue;
      }
      // a sheet with its one big button (the segment: "▶ הביאו 8 אבנים")
      const big = await E(() => { const b = document.querySelector('.gm-sheet.on .gm-big, .gm-sh.on .gm-big, .gm-big'); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); const sh = document.querySelector('.gm-sheet .gm-sh-b'); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: b.innerText.replace(/\s+/g, ' '), a: b.dataset.a, panel: sh ? sh.innerText.replace(/\s+/g, ' ').slice(0, 260) : '' }; });
      if (big) {
        seen.sheets.push({ t: big.t, a: big.a, panel: big.panel }); note(`sheet button "${big.t}" (${big.a}) · panel: ${big.panel.slice(0, 160)}`);
        if (seen.sheets.length <= 2) await shot(`sheet-${big.a}`);
        const paid0 = s.paid;
        await tap(big.x, big.y, 'sheet big button'); await wait(1500);
        if (!seen.segAt && big.a === 'build' && (await st()).paid > paid0) { seen.segAt = Date.now(); seen.segBy = `sheet "${big.t}"`; }
        continue;
      }
      if (seen.segAt && !keyShot && Date.now() - seen.segAt > 4000) { keyShot = true; await shot('after-segment'); }
      const nStrike = () => E(() => window.__GAME_LOG.filter((e) => e.type === 'strike' || e.type === 'stroke').length);
      m = await markPt();
      const hand = m ? null : await coachPt();
      const ring = m || hand ? null : await ringPt();
      const where = m && inFrame(m) ? { ...m, why: `pointer ${JSON.stringify(m.d)}` } : hand ? { ...hand, why: `hand "${hand.text}"` } : ring && inFrame(ring) ? { ...ring, why: 'ring' } : null;
      if (!where && s.ftue >= 5 && s.ftue < 99 && !seen.noPointerAt) { seen.noPointerAt = Math.round((Date.now() - T0) / 1000); await shot('no-pointer-ftue5'); }
      if (where && dead < 3) {
        const n0 = await nStrike(); await tap(where.x, where.y, where.why.slice(0, 80)); await wait(1400);
        if ((await nStrike()) === n0) { dead++; note(`  (no strike from that tap: ${dead})`); } else { dead = 0; seen.strokes++; }
        continue;
      }
      dead = 0;
      // nothing asks: the goal pill (the top line) is the player's guide
      const pill = await E(() => { const b = document.querySelector('.gm-pill'); if (!b || !b.offsetParent) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: b.innerText.replace(/\s+/g, ' ') }; });
      if (pill) { await tap(pill.x, pill.y, `pill "${pill.t}"`); await wait(1500); continue; }
      await wait(1500);
    }
    const clocks = [...chipLog.entries()].map(([k, r]) => ({ k, ticks: r.ticks, frozenMs: r.frozen }));
    const stat = clocks.filter((x) => x.frozenMs >= 2500);
    seen.clocks = clocks; seen.staticChips = stat; seen.words = words; seen.shots = shots;
    note(`clocks seen: ${JSON.stringify(clocks.slice(0, 6))}`);
    const sEnd = await st(); note(`end state ${JSON.stringify(sEnd)}`);
    const wEnd = await world(); note(`end world ${JSON.stringify(wEnd)}`);
    const music1 = await E(() => { try { return globalThis.__BH_MUSIC ? globalThis.__BH_MUSIC.get() : null; } catch (e) { return null; } });
    seen.music = [music0, music1];
    check('N4j the first stone and a segment: stones set, and the world\'s Mount grew', sEnd.set >= 1 && sEnd.paid >= 16 && wEnd.shown > w2.shown, JSON.stringify({ set: sEnd.set, paid: sEnd.paid, shown: [w2.shown, wEnd.shown] }));
    const seg = seen.sheets.find((x) => x.a === 'build');
    check('N4d a segment bought, and what bought it says what it does ("▶ הביאו …" / "… אבנים")', seen.segAt && /הביאו|אבנים/.test(seen.segBy || ''), JSON.stringify({ by: seen.segBy || null, sheet: seg || seen.sheets[0] || null }).slice(0, 300));
    const placeCorner = seen.afterSeg.filter((x) => /הנח.{0,12}אבן הפינה|אבן הפינה.{0,20}הנח/.test(x));
    check('N4e no "הנח את אבן הפינה" in the 25 s after the segment\'s tap', seen.segAt && placeCorner.length === 0, placeCorner.slice(0, 2).join(' || ') || `${seen.afterSeg.length} reads`);
    check('N3b the name → "שלום, הכהן אהרן", the HUD chip and the plate', seen.name && /שלום, הכהן אהרן/.test(seen.name.greet || '') && seen.name.chip.includes(NAME) && seen.name.plate.includes(NAME), JSON.stringify(seen.name && { greet: (seen.name.greet || '').slice(0, 50), chip: seen.name.chip, plate: seen.name.plate }));
    check('N2/N4g every precision game waits for the player (nothing ends by itself)', seen.mg.length && seen.mg.every((x) => !x.endedWithoutInput), JSON.stringify(seen.mg.map((x) => x.kind + ':' + (x.endedWithoutInput ? 'self' : x.taps + 'taps'))));
    check('N2/N4f/N4i every precision game played by hand comes to its result', seen.mg.length && seen.mg.every((x) => !x.endedWithoutInput && x.finished), JSON.stringify(seen.mg.map((x) => `${x.kind}: ${(x.result || '').slice(0, 40)} (${x.taps} taps, ${Math.round((x.playMs || 0) / 1000)} s)`)));
    // the words match the games (FLOW9): a stone the player hews (the quarry game) is never "הנח"; the crane's first stone is "האבן הגדולה"
    const mism = seen.mg.filter((x) => x.kind === 'quarry' && /הנח/.test(`${x.title} ${x.pillBefore}`));
    check('words match the games: a hewn stone (the quarry game) is never "הנח" on its pill or title', seen.mg.length && mism.length === 0, JSON.stringify(seen.mg.map((x) => `${x.kind}: "${x.title.slice(0, 40)}" ← pill "${x.pillBefore.slice(0, 40)}"`)));
    check('N4g the board waits for the player (no moves without input)', seen.board && !seen.board.selfPlay, JSON.stringify(seen.board));
    check('N2 one board played by hand: ≥ 20 moves by real taps (a greedy player that reads the board\'s pixels)', seen.board && seen.board.accepted >= 20, seen.board && seen.board.dead ? `the board's start button takes no touch: ${JSON.stringify(seen.board.diag)}` : JSON.stringify(seen.board));
    check('N4h the countdown chips count down (seen ticking; none frozen ≥ 2.5 s)', clocks.some((x) => x.ticks >= 2) && stat.length === 0, JSON.stringify({ ticking: clocks.filter((x) => x.ticks >= 2).map((x) => x.k), frozen: stat.slice(0, 3) }));
    const facts = seen.mg.map((x) => x.fact).filter(Boolean);
    note(`the precision games' facts: ${facts.map((f) => f.slice(0, 40)).join(' | ')}`);
    // N4k (the Mount alive: gangs, the cart, the crane) is judged on the shots, by eye (crews.stats does not count the Mount's gangs)
    note(`the Mount's shots: ${shots.filter((x) => /survey|boulder|after-/.test(x.f)).map((x) => `${x.f.slice(7, 30)} cam→hero ${x.camToHero}`).join(' · ')}`);
    check('N5 the score plays after the first touches (the music engine running, in a state)', music1 && music1.running && music1.state, JSON.stringify(music1));
    fs.writeFileSync(path.join(OUT, `${MODE}-seen.json`), JSON.stringify(seen, null, 1));
    await pg.close();

    /* ── 5. N3: every new visit shows another fact (the same profile, the page opened again three times) ── */
    for (let k = 0; k < 3; k++) {
      const p2 = await ctx.newPage();
      await p2.addInitScript(() => { window.__START_PAUSED = true; });
      await p2.goto('file://' + path.join(ROOT, 'dist/test.html') + (DEMO ? '#demo' : ''));
      const f = await p2.waitForFunction(() => { const x = document.querySelector('#load .fx-boot'); return x ? x.textContent : null; }, null, { polling: 50, timeout: 60000 }).then((h) => h.jsonValue(), () => '');
      bootFacts.push(f);
      await p2.close();
    }
    const heads = bootFacts.map((f) => f.replace(/^פרט אמיתי · טיוטה/, '').slice(0, 60));
    check('N3 a new fact on every visit (4 opens of one profile → 4 different loading facts) and in the games', new Set(heads.filter(Boolean)).size === 4 && new Set(facts).size === facts.length, JSON.stringify({ boot: heads.map((h) => h.slice(0, 28)), games: facts.length }));
    const bad = logs.filter((l) => !/fonts|favicon|AudioContext/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fail}/${results.length} passed (${MODE}) in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
