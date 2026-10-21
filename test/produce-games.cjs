// PRODUCER10: the in-between games as the owner and his children meet them — his save (a copy of the baseline profile), real touch.
//   node test/produce-games.cjs --url=file:///…/dist/test.html [--tag=gam] [--games=four,memory,race] [--modes=solo,duel]
// ☰ → "משחקי ביניים" → a game → its how-to (the mode card) → לבד / שניים — טלפון אחד → play it by touch like a child would:
//   four: a column a turn (the middle first, then beside the last); memory: open cards, remember the faces seen (as a player does),
//   match a known pair; race: the lit foot (both halves in a duel) → the result (a fact, the pay) → back.
// The state is read, never written. Shots: test/out/produce/<tag>-NN-<step>.png (each one looked at).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'gam', URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
const GAMES = (A.games || 'four,memory,race,stack').split(','), MODES = (A.modes || 'solo,duel').split(',');
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const SRC = path.resolve(A.profile || path.join(OUT, 'profile-base')), PROF = path.join(OUT, 'profile-' + TAG);
fs.rmSync(PROF, { recursive: true, force: true }); if (fs.existsSync(SRC)) fs.cpSync(SRC, PROF, { recursive: true }); else fs.mkdirSync(PROF, { recursive: true });
for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) fs.rmSync(path.join(PROF, f), { force: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000), BUDGET = +(A.budget || 440) * 1000;
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const ctx = await chromium.launchPersistentContext(PROF, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const errs = [];
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 160)); });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; });
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    const E = (fn, a) => pg.evaluate(fn, a); const wait = (ms) => pg.waitForTimeout(ms); let n = 0;
    const hide3d = (on) => E((v) => { const c = [...document.querySelectorAll('canvas')].find((x) => !x.closest('.g10, .fx-mg, .m3')); if (c) c.style.visibility = v ? 'hidden' : ''; }, on);
    const shot = async (name, world = false) => {
      if (world) { await hide3d(false); await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); __T.simulate(true); }); }
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 });
      if (world) await hide3d(true);
      note(`SHOT ${path.relative(ROOT, f)}`); return f;
    };
    const tapSel = async (sel, text, why) => {
      const b = await E(([s, t]) => { const all = [...document.querySelectorAll(s)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!t || new RegExp(t).test(e.textContent)); }); const e = all[all.length - 1]; if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) }; }, [sel, text || null]);
      if (!b) return null; await wait(120); await pg.touchscreen.tap(b.x, b.y); note(`tap ${why || sel} "${b.t}" [${b.w}×${b.h}]${b.h < 44 || b.w < 44 ? ' ⚠ <44px' : ''}`); return b;
    };
    const res = () => E(() => { const r = __T.game.state.res; return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v)])); });
    // the cards on return (the welcome-back card comes a few seconds after the boot): wait for the screen to be clear
    // (a modal gets its class 'on' on the next animation frame, which SwiftShader delays: match the card itself, visible)
    await pg.waitForFunction(() => !!document.querySelector('.gm-modal .gm-btn-gold'), null, { polling: 250, timeout: 14000 }).catch(() => {});
    for (let k = 0, quiet = 0; k < 30 && quiet < 5; k++) { if (await tapSel('.gm-modal .gm-btn-gold', null, 'a card on return')) { quiet = 0; await wait(1500); } else { quiet++; await wait(1500); } }
    const res0 = await res(); note(`res at start ${JSON.stringify(res0)}`);
    await tapSel('.gm-rb[data-k="menu"]', null, '☰ the menu'); await wait(1200);
    const sec10 = await E(() => { const s = [...document.querySelectorAll('.gm-sec')].find((x) => /משחקי ביניים/.test(x.textContent)); if (!s) return null; s.scrollIntoView({ block: 'center' }); return [...document.querySelectorAll('[data-g10]')].map((b) => { const r = b.getBoundingClientRect(); return `${b.textContent.trim()} ${Math.round(r.width)}×${Math.round(r.height)}`; }); });
    note(`menu section "משחקי ביניים": ${JSON.stringify(sec10)}`);
    await shot('menu', true);
    let first = true;
    for (const g of GAMES) for (const mode of MODES) {
      if (Date.now() - T0 > BUDGET) { note('budget'); break; }
      if (!(await E(() => !!document.querySelector('.g10')))) {   // back in the world: the menu again (unless it is open)
        const open = await E(() => { const b = document.querySelector('[data-g10]'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 0 && r.top > 0 && r.top < innerHeight; });
        if (!open) { await tapSel('.gm-rb[data-k="menu"]', null, '☰ the menu'); await wait(1200); }
        await E(() => { const b = document.querySelector('[data-g10]'); if (b) b.scrollIntoView({ block: 'center' }); }); await wait(400);
      }
      if (!(await E(() => !!document.querySelector('.g10-howto')))) {
        const onHub = await E(() => !!document.querySelector('.g10 [data-g10-game]'));
        if (onHub) await tapSel(`.g10 [data-g10-game="${g}"]`, null, `the hub: ${g}`);
        else await tapSel(`[data-g10="${g}"]`, null, `the menu: ${g}`);
        await wait(1200);
      }
      if (first) { await shot(`${g}-howto`); first = false; } else await shot(`${g}-${mode}-howto`);
      await tapSel('.g10 button[data-v="' + mode + '"]', null, `mode ${mode}`); await wait(1200);
      await hide3d(true); await shot(`${g}-${mode}-start`);
      const t1 = Date.now(); let moves = 0, mid = false; const seen = {};
      while (Date.now() - t1 < 100000) {
        const st = await E(() => { const card = [...document.querySelectorAll('.g10 button[data-v]')].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.dataset.v); const res = document.querySelector('.g10-fact, .g10-res'); return { card, res: !!res, txt: (document.querySelector('.g10') || {}).innerText ? document.querySelector('.g10').innerText.replace(/\s+/g, ' ').slice(0, 160) : '' }; });
        if (st.res || st.card.includes('again') || st.card.includes('close') || st.card.includes('hub')) break;
        if (g === 'four') {
          const s = await E(() => { const cv = [...document.querySelectorAll('.g10 canvas')].find((c) => c.__g10); if (!cv) return null; const q = cv.__g10.state(); return { ...q, C: q.board[0].length, xs: [...Array(q.board[0].length).keys()].map((c) => cv.__g10.colX(c)) }; });
          if (!s) { await wait(500); continue; }
          if (s.win) break;
          if (!s.human || s.busy) { await wait(400); continue; }
          const order = [3, 2, 4, 1, 5, 0, 6].filter((c) => c < s.C); const free = order.filter((c) => s.board[0][c] == null || s.board[0][c] === 0 || s.board[0][c] === -1 ? true : false);
          const c = free[(moves * 3) % Math.max(1, free.length)] ?? order[0];
          const p = s.xs[c]; await pg.touchscreen.tap(p.x, p.y); moves++; await wait(700);
        } else if (g === 'memory') {
          const cards = await E(() => [...document.querySelectorAll('.g10-mc')].map((b) => { const r = b.getBoundingClientRect(); return { i: +b.dataset.i, v: b.dataset.v, up: b.classList.contains('up'), done: b.classList.contains('done') || b.classList.contains('ok'), x: r.left + r.width / 2, y: r.top + r.height / 2, flip: !!b.querySelector('.r180') }; }));
          if (!cards.length) { await wait(500); continue; }
          for (const c of cards) if (c.v != null) seen[c.i] = c.v;
          const ups = cards.filter((c) => c.up && !c.done);
          const closed = cards.filter((c) => !c.up && !c.done);
          if (!closed.length) break;
          let pick = null;
          if (ups.length === 1) { const want = ups[0].v; pick = closed.find((c) => seen[c.i] === want) || closed.find((c) => seen[c.i] == null) || closed[0]; }
          else { const byV = {}; for (const c of closed) if (seen[c.i] != null) (byV[seen[c.i]] = byV[seen[c.i]] || []).push(c); const pair = Object.values(byV).find((a) => a.length >= 2); pick = pair ? pair[0] : closed.find((c) => seen[c.i] == null) || closed[0]; }
          await pg.touchscreen.tap(pick.x, pick.y); moves++; await wait(ups.length === 1 ? 1300 : 450);
        } else if (g === 'stack') {   // tap when the sliding stone is over the course (what the eye sees), each half its own
          const hs = await E(() => [...document.querySelectorAll('.g10-half')].map((h) => { const s = h.__g10 && h.__g10.state(); const r = h.getBoundingClientRect(); return s ? { s, x: r.left + r.width / 2, y: r.top + r.height * 0.45 } : null; }).filter(Boolean));
          if (!hs.length) { await wait(300); continue; }
          let hit = false;
          for (const q of hs) { if (!q.s.cur || q.s.over || !q.s.top) continue; const d = Math.abs(q.s.cur.x - q.s.top.x); if (d < 0.035 + (moves % 7 === 6 ? 0.08 : 0)) { await pg.touchscreen.tap(q.x, q.y); moves++; hit = true; } }
          if (hs.every((q) => q.s.over)) break;
          await wait(hit ? 400 : 25);
        } else if (g === 'race') {
          const feet = await E(() => [...document.querySelectorAll('.g10-foot-b.next:not([disabled])')].map((b) => { const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
          if (!feet.length) { await wait(300); continue; }
          for (const f of feet) { await pg.touchscreen.tap(f.x, f.y); moves++; }
          await wait(140);
        }
        if (!mid && moves >= (g === 'race' ? 30 : 6)) { mid = true; await shot(`${g}-${mode}-playing`); }
      }
      note(`${g} ${mode}: ${moves} taps in ${Math.round((Date.now() - t1) / 1000)} s`);
      await wait(1500); await shot(`${g}-${mode}-result`);
      const txt = await E(() => (document.querySelector('.g10') || {}).innerText ? document.querySelector('.g10').innerText.replace(/\s+/g, ' ').slice(0, 400) : '');
      note(`result text: ${txt}`);
      // leave the result the way it offers (another game / close)
      if (!(await tapSel('.g10 button[data-v="other"], .g10 button[data-v="hub"], .g10 button[data-v="close"]', null, 'result: another game'))) await tapSel('.g10 button', 'חזרה|סגור|למשחק אחר', 'result: back');
      await wait(1200); await hide3d(false);
    }
    const res1 = await res(); note(`res at end ${JSON.stringify(res1)} (start ${JSON.stringify(res0)})`);
    await hide3d(false);
    note(`errors ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
  } catch (e) { console.error('RUN ERROR', e.message); }
  finally { await ctx.close(); }
})();
