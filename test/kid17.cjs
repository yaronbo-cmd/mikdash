// The supervisor's play (wave 17): a fresh save at 844×390, a kid who only follows the screen —
// a card's gold button, the coach, the markers and the edge arrow, the work button when it wakes. No fixtures.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'test/out/kid17');
fs.mkdirSync(OUT, { recursive: true });
const W = 844, H = 390, STEPS = +(process.argv.find((a) => a.startsWith('--steps=')) || '--steps=60').slice(8);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
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
  let shotN = 0;
  const shot = async (name) => {
    await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    const f = `${String(++shotN).padStart(2, '0')}-${name}.png`; await pg.screenshot({ path: path.join(OUT, f), timeout: 240000 }); console.log('   shot ' + f);
    await G(() => { window.__HUD_HOLD = false; });
  };
  const T0 = Date.now();
  const look = () => G(() => {
    const vis = (e) => { if (!e) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight; };
    const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
    const modal = [...document.querySelectorAll('.gm-modal')].find(vis);
    const gold = modal && ([...modal.querySelectorAll('.gm-btn-gold')].find(vis) || [...modal.querySelectorAll('.gm-btn')].find(vis));
    const cine = document.querySelector('.gm-cine'); const bub = document.querySelector('.gm-bub');
    const deal = document.querySelector('.gm-deal.on'); const dealBtn = deal && [...deal.querySelectorAll('.gm-jc, .gm-btn')].find(vis);
    const mg = document.querySelector('.fx-mg');
    const mgBtn = mg && [...mg.querySelectorAll('button')].find(vis);
    const btn = document.querySelector('.tw-btn');
    const marks = [...document.querySelectorAll('.tw-mk')].filter(vis).map(box);
    const goal = [...document.querySelectorAll('.tw-goal')].find(vis);
    const S = __T.stages, p = S.heroXYZ({}), q0 = __T.view.project(p.x, p.y + 1.6, p.z), q = { x: q0.x, y: q0.y };   // (project() returns one shared object: copy it)
    const g = __T.game.state;
    const mk = [...window.__GAME_LOG].reverse().find((e) => e.type === 'mark');
    let aim = null;
    if (mk && mk.d && mk.d.boulder != null) { const bs = S.boulderSpots()[mk.d.boulder]; if (bs && S.boulders[mk.d.boulder] > 0) { const a = __T.view.project(+bs[0], S.groundAt(+bs[0], +bs[1]) + 2, +bs[1]); if (a.on && a.x > 0 && a.x < innerWidth && a.y > 0 && a.y < innerHeight) aim = { x: a.x, y: a.y }; } }
    return { aim,
      twin: !!(window.__TWIN && __TWIN.on()), spec: window.__TWIN ? __TWIN.spec() : null, pips: window.__TWIN ? __TWIN.pips() : null,
      modal: modal ? { text: modal.innerText.replace(/\s+/g, ' ').slice(0, 140), btn: gold ? { ...box(gold), t: gold.innerText.trim() } : null } : null,
      cine: vis(cine) ? box(cine) : null, coach: bub && vis(bub) ? bub.innerText.replace(/\s+/g, ' ').slice(0, 120) : '',
      deal: deal && vis(deal) ? { btn: dealBtn ? { ...box(dealBtn), t: dealBtn.innerText.replace(/\s+/g, ' ').slice(0, 40) } : null } : null,
      mg: mg && vis(mg) ? { kind: mg.dataset && mg.dataset.kind, btn: mgBtn ? box(mgBtn) : null } : null,
      btn: btn && vis(btn) ? { ...box(btn), awake: btn.classList.contains('awake') } : null,
      marks, goal: goal ? box(goal) : null, hero: { sx: q.x, sy: q.y, x: p.x, z: p.z },
      stamp: [...document.querySelectorAll('.gm-stamp')].filter(vis).map((e) => e.innerText.trim()).join('|'),
      banner: [...document.querySelectorAll('.gm-banner')].filter(vis).map((e) => e.innerText.trim()).join('|'),
      dbg: (() => { try { const h = g.st.har || {}, t = __T.game._.twin ? __T.game._.twin() : {}; return `paid ${h.paid} chk ${h.chk} bad ${(h.bad || []).length} ftue ${g.ftue} res ${JSON.stringify(g.res)} tw ${JSON.stringify(t)} loop ${__T.game.loop && __T.game.loop.on('har')} deal ${__T.game.loop && __T.game.loop.deal()}`; } catch (e) { return String(e); } })(),
      pill: (() => { const e = document.querySelector('.gm-next'); return e && vis(e) ? e.innerText.replace(/\s+/g, ' ').trim().slice(0, 50) : ''; })(),
      coins: g.coins, focus: g.focus, ph: g.st && g.st.har ? g.st.har.p : null, set: g.st && g.st.har ? g.st.har.set : null, ftue: g.ftue,
    };
  });
  const evs = () => G(() => { const L = window.__GAME_LOG; const c = {}; for (const e of L) c[e.type] = (c[e.type] || 0) + 1; return c; });
  // the opening
  await pg.waitForTimeout(1500);
  let s = await look(); await shot('opening');
  const log = [];
  let firstWork = null, sheets = 0, idle = 0, lastSet = null;
  for (let i = 0; i < STEPS; i++) {
    s = await look();
    const t = ((Date.now() - T0) / 1000).toFixed(0);
    let act = '';
    if (s.cine) { await tap(s.cine.x, s.cine.y + s.cine.h * 0.1); act = 'tap the opening'; }
    else if (s.modal && s.modal.btn) { act = `card "${s.modal.text.slice(0, 60)}" → ${s.modal.btn.t}`; await tap(s.modal.btn.x, s.modal.btn.y); }
    else if (s.mg) { sheets++; act = `SHEET ${s.mg.kind}`; if (s.mg.btn) await tap(s.mg.btn.x, s.mg.btn.y); }
    else if (s.deal && s.deal.btn) { act = `deal → ${s.deal.btn.t}`; await tap(s.deal.btn.x, s.deal.btn.y); }
    else if (s.btn && s.btn.awake) {
      act = `work ${s.spec ? s.spec.icon + ' ' + s.spec.label : ''} ×3`;
      for (let k = 0; k < 3; k++) { await down(2, s.btn.x, s.btn.y); await pg.waitForTimeout(50); await up(2); await pg.waitForTimeout(140); }
      if (!firstWork) firstWork = t;
    } else if (s.twin) {
      const tgt = s.marks[0] || s.goal || s.aim;
      if (tgt) {
        let dx = tgt.x - s.hero.sx, dy = tgt.y - s.hero.sy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        act = `walk to ${s.marks[0] ? 'marker' : s.goal ? 'arrow' : 'the gold mark'} (${Math.round(l)} px)`;
        const sx = 170, sy = 300; await down(1, sx, sy);
        for (let k = 1; k <= 4; k++) { await move(1, sx + dx * 14 * k, sy + dy * 14 * k); await pg.waitForTimeout(30); }
        await pg.waitForTimeout(Math.min(2200, 300 + l * 6)); await up(1);
      } else if (s.coach) { act = `coach only: "${s.coach.slice(0, 50)}" → tap the bubble`; await tap(W / 2, H / 2); }
      else { act = `nothing to follow — wait (pill "${s.pill}") [${s.dbg}]`; }
    } else if (s.coach) { act = `coach: "${s.coach.slice(0, 50)}" → tap`; await tap(W / 2, H * 0.55); }
    else act = 'wait';
    await pg.waitForTimeout(900);
    const s2 = await look();
    if (s2.set === lastSet && !/work/.test(act)) idle++; else idle = 0; lastSet = s2.set;
    const line = `[${t}s] ${act}${s2.stamp ? ` · STAMP ${s2.stamp}` : ''}${s2.banner ? ` · BANNER ${s2.banner}` : ''}${s2.coach ? ` · coach "${s2.coach.slice(0, 60)}"` : ''} · hero ${Math.round(s2.hero.x)},${Math.round(s2.hero.z)} · btn ${s2.btn && s2.btn.awake ? 'AWAKE' : '-'} · twin ${s2.twin} · ph ${s2.ph} set ${s2.set} coins ${s2.coins}`;
    console.log(line); log.push(line);
    if (i % 8 === 0 || s2.stamp || (s2.banner && i % 3 === 0)) await shot(`step${i}`);
  }
  await shot('end');
  console.log('first work at', firstWork, 's · sheets', sheets, '· events', JSON.stringify(await evs()));
  console.log('errors', errs.length, errs.slice(0, 5).join(' | '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
