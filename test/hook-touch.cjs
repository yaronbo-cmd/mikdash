// (HOOK19, wave 19) The master score, the coin and the board on a phone held sideways — REAL touch (CDP Input.dispatchTouchEvent) at 844×390
// on dist/test.html (docs/FUN19.md §4.1; the owner's notes 6 and 10):
//   part 1 (the acts, at a rock of the Mount): every strike at the work button adds its fixed points (10 · 20 · 40 · 50) to the score — the
//     "+N" pop flies to the capsule "★ 12,340", the craft's xp +1 lands with it, the save (G.score) and the capsule's number agree.
//   part 2 (the milestone): the fixture sits at 9,970; the strike that crosses 10,000 pays ONE coin (G.dinars) with its stage's face; its
//     celebration does not interrupt a strike (it waits for a pause ≤ 30 s), a tap skips it, the coin is not paid twice; the sheet that the
//     capsule opens shows it.
//   part 3 (the reload): the score and the coin survive a real reload; the celebration does not play again.
//   part 4 (the board, in the real page): the match-3 board at 844×390 and then 667×375 fills the height, its cells ≥ 40 px, the exit and the
//     goals on screen; the exit by touch.
//   p2 (--part=p2, after the checkpoint): the tab that calls and the reading reward.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/hook-touch.cjs [--part=1,2,3,4|p2|all] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/hook');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const has = (p) => PART === 'all' ? p !== 'p2' : PART.split(',').includes(p);
let W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

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
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__MG_VIS = 0;
      window.__DN = { shown: 0, first: 0 };   // (the coin's celebration: how many times and when it appeared)
      new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-dn')) { window.__DN.shown++; if (!window.__DN.first) window.__DN.first = performance.now(); } }).observe(document, { subtree: true, childList: true });
      try { if (!sessionStorage.getItem('__keep')) localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => { if (!SHOTS) return; await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/hook/' + name + '.png'); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const centre = (sel) => G((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel);
    const tapSel = async (sel) => { const c = await centre(sel); if (!c) return false; await tap(c.x, c.y); return true; };
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    // the capsule as the player sees it
    const cap = () => G(() => {
      const e = document.querySelector('.gm-sc'); if (!e) return null;
      const r = e.getBoundingClientRect(), n = (e.querySelector('.gm-num') || {}).textContent || '', cs = getComputedStyle(e);
      return { n: +n.replace(/[^0-9]/g, ''), vis: r.width > 0 && !e.classList.contains('gm-hidden') && cs.display !== 'none', l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), glow: e.classList.contains('glow'), coins: +((e.querySelector('.gm-sc-r b') || {}).textContent || 0) };
    });
    const sc = () => G(() => { const g = __T.game.state; return { score: g.score | 0, coins: (g.dinars || []).length, unseen: (g.dinars || []).filter((d) => !d.seen).length, face: (g.dinars || []).map((d) => d.stage) }; });
    const xpN = () => G(() => { const h = document.querySelector('.gm-xp'); if (!h) return NaN; const m = /(\d+)/.exec(((h.querySelector('.gm-xp-bar em') || {}).textContent || '').replace(/[⁦-⁩]/g, '')); return m ? +m[1] : NaN; });

    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);

    if (has('1') || has('2') || has('3')) {
      /* the fixture: the Mount's rocks after the tutorial; the rock at hand cannot break in a few strikes; no points yet */
      const i = await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, ''); g.xp = {}; g.score = 0; g.dinars = []; g.scf = {};
        g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.bh[4] = 999; g.focus = 'har'; g.crews = []; __T.game._.resync(); __T.game.ui.refresh(); return 4;
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 10000);
      await G((i) => __T.stages.hero.place({ boulder: i }), i);
      await pg.waitForTimeout(1500);
      const strike = async () => { const bc = await btnC(); await down(2, bc.x, bc.y); await pg.waitForTimeout(50); await up(2); };
      const landedAll = () => waitFor(() => { const s = __T.game.juice.stats(); return s.busy === 0; }, null, 4000);
      let tot = 0;
      if (has('1')) {
        const c0 = await cap();
        check('the capsule "★ 0" is on screen at the top left, clear of the top bar and both thumbs\' zones', !!c0 && c0.vis && c0.l >= 0 && c0.r <= W && c0.t >= 50 && c0.b < H * 0.34, JSON.stringify(c0));
        const s0 = await sc(), x0 = await xpN();
        await strike(); await pg.waitForTimeout(90);
        const pop = await G(() => { const e = [...document.querySelectorAll('.jx-n')].find((n) => /^\+(10|20|40|50)$/.test(n.textContent) && getComputedStyle(n).opacity > 0.3); return e ? e.textContent : null; });
        check('a strike → the "+N" that pops at the work is its score (10 · 20 · 40 · 50), not a bare "+1"', !!pop, String(pop));
        await landedAll(); await pg.waitForTimeout(500);
        const s1 = await sc(), c1 = await cap(), x1 = await xpN();
        const d1 = s1.score - s0.score;
        check('… it lands: the save\'s score rose by exactly the pop\'s number (an act is 10 / 20 / 40 / 50)', [10, 20, 40, 50].includes(d1) && String(pop) === `+${d1}`, `${s0.score} → ${s1.score}`);
        check('… the capsule shows the same number (the flight landed in it)', c1 && c1.n === s1.score, JSON.stringify([c1 && c1.n, s1.score]));
        check('… and the craft\'s xp rose by 1 with the same flight (one flight, two counters)', Number.isNaN(x0) || x1 === x0 + 1, `${x0} → ${x1}`);
        tot = s1.score;
        let acts = 1;
        for (let k = 0; k < 7; k++) { await pg.waitForTimeout(950); await strike(); acts++; }
        await landedAll(); await pg.waitForTimeout(700);
        const s2 = await sc(), c2 = await cap(), st = await G(() => __T.game.juice.stats());
        const per = (s2.score - 0) / acts;
        check(`${acts} strikes → ${s2.score} points (each between 10 and 50), the capsule agrees, the juice's own count agrees`, s2.score >= acts * 10 && s2.score <= acts * 50 && c2.n === s2.score && st.score === s2.score, `avg ${per.toFixed(1)} · capsule ${c2.n} · juice ${st.score}`);
        tot = s2.score;
        await shot('score1');
      }
      if (has('2')) {
        /* the milestone: the fixture near 9,990 → the strike that crosses pays ONE coin; the celebration waits for a pause */
        await G(() => { const g = __T.game.state; g.score = 9970; g.dinars = []; g.scf = g.scf || {}; __BH_PARTS.score.sync(true); __T.game.ui.refresh(); window.__DN = { shown: 0, first: 0 }; });
        await pg.waitForTimeout(400);
        const a0 = await cap();
        check('at 9,970 the capsule glows (the ring is nearly full) and there is no coin yet', a0 && a0.n === 9970 && a0.glow && (await sc()).coins === 0, JSON.stringify(a0));
        let crossed = false, tLast = 0, nTap = 0;
        for (let k = 0; k < 6 && !crossed; k++) { await strike(); tLast = Date.now(); nTap++; await pg.waitForTimeout(260); crossed = (await sc()).coins >= 1; if (!crossed) await pg.waitForTimeout(700); }
        const s3 = await sc();
        check('the strike that crosses 10,000 pays ONE coin, at once, with the stage\'s face (har)', crossed && s3.coins === 1 && s3.face[0] === 'har' && s3.score >= 10000, JSON.stringify(s3));
        const shownDuring = await G(() => window.__DN.shown);
        check('… and the celebration does not come in the middle of the strike (it waits for a pause)', shownDuring === 0, `shown ${shownDuring} · ${Date.now() - tLast} ms after the strike`);
        const appeared = await waitFor(() => window.__DN.shown >= 1, null, 32000);
        const idleMs = Date.now() - tLast;
        check('… it comes by itself after the pause (≤ 30 s after the coin, ≥ 1.5 s after the last strike)', appeared && idleMs >= 1500 && idleMs <= 34000, `${idleMs} ms after the last strike`);
        await pg.waitForTimeout(1500);
        await shot('dinar');
        const dn = await centre('.gm-dn');
        check('the celebration is on screen (the coin and "דינר זהב!") and a tap skips it', !!dn && await G(() => /דינר זהב/.test(document.querySelector('.gm-dn').textContent)));
        await waitFor(() => !!document.querySelector('.gm-dn.land'), null, 3000);
        await tap(W / 2, H / 2);
        const gone = await waitFor(() => !document.querySelector('.gm-dn'), null, 4000);
        const s4 = await sc();
        check('… the skip takes the coin home: the celebration is gone and the coin is marked seen', gone && s4.unseen === 0 && s4.coins === 1, JSON.stringify(s4));
        const c4 = await cap();
        check('the capsule\'s box shows the coin (◉ 1) and its ring starts again', c4 && c4.coins === 1 && !c4.glow, JSON.stringify(c4));
        for (let k = 0; k < 4; k++) { await pg.waitForTimeout(950); await strike(); }
        await landedAll(); await pg.waitForTimeout(500);
        const s5 = await sc();
        check('more strikes pay no second coin (the next is at 20,000), and no second celebration', s5.coins === 1 && (await G(() => window.__DN.shown)) === 1, JSON.stringify(s5));
        /* the capsule opens the treasure's sheet by touch */
        const opened = await tapSel('.gm-sc');
        await pg.waitForTimeout(700);
        const sheet = await G(() => { const e = document.querySelector('.gm-sheet.on, .gm-sheet'); return e ? e.textContent : ''; });
        check('a tap on the capsule opens "האוצר שלי": the score, the title ladder and the coin\'s face', opened && /האוצר שלי/.test(sheet) && /★ ?[\d,]+/.test(sheet) && /פועל/.test(sheet), sheet.slice(0, 60));
        await shot('treasure');
        await G(() => { const x = document.querySelector('.gm-sheet [data-a="close"], .gm-sheet .gm-x, .gm-sheet-x'); if (x) x.click(); else __T.game.ui.closeSheet(); });
        await pg.waitForTimeout(500);
      }
      if (has('3')) {
        /* the reload: the save keeps the score and the coin; the celebration does not play again */
        const before = await sc();
        const saved = await G(() => { __T.simulate(false); __T.game.destroy(); sessionStorage.setItem('__keep', '1'); const raw = Object.keys(localStorage).map((k) => [k, (localStorage.getItem(k).match(/"score":(\d+)/) || [])[1]]); return raw; });
        console.log('   saved before the reload: ' + JSON.stringify(saved));
        await pg.waitForTimeout(300);
        await pg.reload();
        await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
        await pg.waitForTimeout(3500);
        const after = await sc(), c = await cap();
        console.log('   after the reload: ' + JSON.stringify(await G(() => ({ keys: Object.keys(localStorage), keep: sessionStorage.getItem('__keep'), log: window.__GAME_LOG.slice(0, 6).map((e) => e.type) }))));
        check('a real reload keeps the score and the coin', after.score >= before.score && after.score >= 10000 && after.coins === 1, JSON.stringify([before, after]));
        check('… the capsule shows it again, and the coin\'s celebration does not play again', c && c.n >= 10000 && c.vis && (await G(() => window.__DN.shown)) === 0, JSON.stringify(c));
        await G(() => { sessionStorage.removeItem('__keep'); });
      }
    }

    if (has('4')) {
      /* the board in the real page, held sideways: 844×390, then 667×375 */
      const have = await G(() => !!(globalThis.__BH_PARTS && __BH_PARTS.match3 && typeof __BH_PARTS.match3.runLevel === 'function'));
      check('the match-3 part is registered (the real board)', have);
      if (have) {
        await G(() => { const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); window.__M3R = null; __BH_PARTS.match3.runLevel({ root: document.body, field: 'forest', need: {}, map: false, save: { get: () => ({}), set: () => {} }, sfx: __T.game.sfx, haptic: () => {}, demo: false }).then((r) => { window.__M3R = r; }); });
        await waitFor(() => !!document.querySelector('.m3-cta'), null, 8000);
        await tapSel('.m3-cta');
        await waitFor(() => !document.querySelector('.m3-card'), null, 5000);
        await pg.waitForTimeout(700);
        for (const [w, h] of [[844, 390], [667, 375]]) {
          if (w !== W) { await pg.setViewportSize({ width: w, height: h }); W = w; H = h; await pg.waitForTimeout(1200); }
          const m = await G(() => {
            const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }; };
            return { hit: q('.m3-hit'), exit: q('.m3-exit'), goals: q('.m3-goals'), foot: q('.m3-foot'), moves: q('.m3-moves') };
          });
          const cs = m.hit ? Math.min(m.hit.w / 8, m.hit.h / 9) : 0;
          check(`[${w}×${h}] the board fills the height and its cells are ≥ 40 px`, m.hit && m.hit.h >= h * 0.95 && cs >= 40, `${m.hit && m.hit.w}×${m.hit && m.hit.h} → ${cs.toFixed(1)} px`);
          const inside = (x) => x && x.l >= 0 && x.t >= 0 && x.r <= w && x.b <= h;
          check(`[${w}×${h}] the exit (≥ 44 px), the moves, the goals and the hint are on screen and clear of the board`, [m.exit, m.moves, m.goals, m.foot].every(inside) && m.exit.w >= 44 && m.exit.h >= 44 && [m.exit, m.moves, m.goals, m.foot].every((x) => x.r <= m.hit.l || x.l >= m.hit.r), JSON.stringify([m.exit, m.goals]));
          await shot(`board-${w}x${h}`);
        }
        // back by touch: the exit asks, "לצאת" leaves
        await tapSel('.m3-exit'); await waitFor(() => !!document.querySelector('.m3-card'), null, 3000);
        const quit = await G(() => { const b = [...document.querySelectorAll('.m3-card button')].find((x) => /לצאת/.test(x.textContent) && !/להמשיך/.test(x.textContent)); if (!b) return false; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (quit) await tap(quit.x, quit.y);
        check('the exit by touch closes the board', await waitFor(() => !document.querySelector('.m3'), null, 6000));
        await pg.setViewportSize({ width: 844, height: 390 }); W = 844; H = 390;
      }
    }
    if (has('p2')) {
      /* P2 · the tabs that call, and reading pays — the fixture: after the tutorial, three entries open and unread, a crew idle */
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, ''); g.score = 0; g.dinars = []; g.scf = {}; g.xp = {};
        g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        for (const id of ['1.1', '1.2', '1.3', '2.1']) { g.book.un[id] = 1; delete g.book.read[id]; }
        g.focus = 'har'; g.crews = []; __T.game._.resync(); __T.game.ui.refresh();
      });
      await pg.waitForTimeout(1500);
      const NG = (fn, a) => G(fn, a);
      const early = await NG(() => __BH_PARTS.nudge.try('course'));
      check('never in the first two minutes of play: a call at the first pause is refused', early === false, String(early));
      await NG(() => __BH_PARTS.nudge.warp(125000));
      const fired = await NG(() => __BH_PARTS.nudge.try('course'));
      await pg.waitForTimeout(250);
      const nd = await G(() => {
        const bub = document.querySelector('.gm-bub'), tab = document.querySelector('.gm-db[data-k="book"]'), b = tab && tab.querySelector('.gm-badge');
        return { bub: bub && !bub.classList.contains('gm-hidden') ? bub.textContent : '', arrow: !!document.querySelector('.gm-nda'), pulse: !!(tab && tab.classList.contains('gm-nd')), badge: b && !b.classList.contains('gm-hidden') ? b.textContent : '' };
      });
      check('after the interval, at a course\'s end: one line from the mentor, the gold arrow and one pulse of the tab (ספר מידות), its badge on', fired === true && /בספר מידות מחכה לך משנה על/.test(nd.bub) && nd.arrow && nd.pulse && +nd.badge >= 1, JSON.stringify(nd));
      await shot('nudge');
      await pg.waitForTimeout(1250);
      const aim = await G(() => { const a = document.querySelector('.gm-nda'), t = document.querySelector('.gm-db[data-k="book"]').getBoundingClientRect(); if (!a) return { gone: true }; const r = a.getBoundingClientRect(); return { d: Math.round(Math.hypot(r.left + r.width / 2 - (t.left + t.width / 2), r.top + r.height / 2 - (t.top + t.height / 2))) }; });
      check('the arrow flies from the line to the tab (it ends on the tab or has just faded there)', aim.gone || aim.d < 70, JSON.stringify(aim));
      await pg.waitForTimeout(500);
      const again = await NG(() => __BH_PARTS.nudge.try('course'));
      check('one at a time: another call right after is refused (at most one every 4 minutes)', again === false);
      await NG(() => __BH_PARTS.nudge.warp(250000));
      const second = await NG(() => __BH_PARTS.nudge.try('course'));
      check('… and another tab may call after four minutes, but not the same tab inside fifteen (the book is not offered again, nothing else waits)', second === false, String(second));
      const st1 = await NG(() => __BH_PARTS.nudge.state());
      await pg.waitForTimeout(3500);   // (the bubble goes by itself)
      /* opening the tab clears the call's count; the badge is the game's */
      await tapSel('.gm-db[data-k="book"]'); await pg.waitForTimeout(900);
      check('opening the tab by touch: the book sheet opens, and the call is answered (its pending mark is cleared)', (await NG(() => __BH_PARTS.nudge.state().pend.book | 0)) === 0 && (await G(() => !!document.querySelector('.gm.sheet-open'))), JSON.stringify(st1.pend));
      /* the reading reward: an entry opened by touch, "קראתי ✓" wakes at its end, ★500 and 5 craft points once */
      const row = await G(() => { const b = [...document.querySelectorAll('.gm-sh-b [data-a="mishnah"]')].find((x) => x.dataset.id === '1.1') || document.querySelector('.gm-sh-b [data-a="mishnah"]'); if (!b) return null; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: b.dataset.id }; });
      check('the book lists the open entries', !!row, JSON.stringify(row));
      if (row) {
        await tap(row.x, row.y); await pg.waitForTimeout(700);
        const s0 = await G(() => __T.game.state.score | 0), xp0 = await G(() => JSON.stringify(__T.game.state.xp));
        const rd = await G(() => { const b = document.querySelector('.gm-rd[data-a="bookRead"]'), sh = document.querySelector('.gm-sh-b'); if (!b) return null; return { dis: b.disabled, over: sh.scrollHeight > sh.clientHeight + 20, ask: /שאלו בבית/.test(sh.textContent), draft: /טיוטה/.test(sh.querySelector('.gm-ask') ? sh.querySelector('.gm-ask').textContent : '') }; });
        check('the entry ends with one "שאלו בבית" line (a draft) and the "קראתי ✓" button', !!rd && rd.ask && rd.draft, JSON.stringify(rd));
        if (rd && rd.over) check('the button is asleep until the entry is scrolled to its end (no timer)', rd.dis === true);
        // scroll to the end with a finger
        const box = await centre('.gm-sh-b');
        for (let k = 0; k < 4; k++) { await down(5, box.x, box.y + 80); for (let j = 1; j <= 8; j++) { fingers.set(5, [box.x, box.y + 80 - j * 22]); await send('touchMove'); await pg.waitForTimeout(16); } await up(5); await pg.waitForTimeout(200); }
        await G(() => { const sh = document.querySelector('.gm-sh-b'); if (sh.scrollTop + sh.clientHeight < sh.scrollHeight - 14) sh.scrollTop = sh.scrollHeight; });
        await pg.waitForTimeout(500);
        const awake = await G(() => { const b = document.querySelector('.gm-rd[data-a="bookRead"]'); return b && !b.disabled; });
        check('at the end of the entry "קראתי ✓" is awake', awake === true);
        await G(() => { document.querySelector('.gm-rd[data-a="bookRead"]').scrollIntoView({ block: 'center' }); }); await pg.waitForTimeout(300);
        await tapSel('.gm-rd[data-a="bookRead"]'); await pg.waitForTimeout(700);
        const s1 = await G(() => __T.game.state.score | 0), xp1 = await G(() => JSON.stringify(__T.game.state.xp)), done = await G(() => !!document.querySelector('.gm-rd.done'));
        check('"קראתי ✓" pays ★500 and 5 craft points, once', s1 - s0 === 500 && done && xp1 !== xp0 && (JSON.parse(xp1) && Object.values(JSON.parse(xp1)).reduce((a, b) => a + b, 0)) === 5, `${s0} → ${s1} · xp ${xp0} → ${xp1}`);
        await G(() => { __T.game.act ? 0 : 0; });
        await G(() => { const g = __T.game; return g.act && g.act.bookRead ? g.act.bookRead('1.1') : null; });
        const s2 = await G(() => __T.game.state.score | 0);
        check('… and not a second time for the same entry', s2 === s1, `${s1} → ${s2}`);
        await shot('read');
        // the stage's map card shows the 4th star, lit
        await G(() => __T.game.ui.closeSheet()); await pg.waitForTimeout(500);
        await tapSel('.gm-db[data-k="store"]'); await pg.waitForTimeout(900);
        const star = await G(() => { const n = document.querySelector('.gm-node[data-id="lishka"] .gm-bs'); const o = document.querySelector('.gm-node[data-id="har"] .gm-bs'); return { lishka: n && n.classList.contains('on'), har: o && o.classList.contains('on') }; });
        check('the map card of the stage whose entry was read (1.1: the chambers) shows "כוכב הספר" lit; the Mount\'s stays dim', star.lishka === true && star.har === false, JSON.stringify(star));
        await shot('book-star');
        await G(() => __T.game.ui.closeSheet());
      }
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const bad = results.filter((x) => !x).length;
  console.log(`${results.length - bad}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(bad ? 1 : 0);
})();
