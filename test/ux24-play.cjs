// UX24 (wave 24): a 7–10-year-old's first 12 minutes on a FRESH save, by real CDP touch, following only the screen.
// Two orientations (two runs): portrait 390×844 (--o=p) and landscape 844×390 (--o=l). brun cuts a run at 10 minutes, so the
// 12 minutes are played in parts: --part=1 starts fresh and plays --secs (default 330); --part=2 restores part 1's save
// (localStorage dumped to test/out/ux24/<o>-save.json) and the kid's clock, and plays on.
// A shot every ~15 s and at every new card / sheet / stamp / banner / toast: test/out/ux24/<o>-NNNs-<what>.png (NNN = the kid's
// second). A log line a step: what he saw, what he touched, what happened, how long nothing happened. Every line of text he had
// to read is collected with the second it first appeared (test/out/ux24/<o>-words.tsv) — the report's "words" section.
//   /home/claude/wt/bus/brun node test/ux24-play.cjs --no-build --o=l --part=1 > /tmp/.../ux24-l1.log 2>&1 &
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/ux24');
const args = process.argv.slice(2), arg = (k, d) => { const a = args.find((x) => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const O = arg('o', 'l'), PART = +arg('part', '1'), SECS = +arg('secs', '330'), SHOT_EVERY = +arg('every', '15');
const W = O === 'p' ? 390 : 844, H = O === 'p' ? 844 : 390;
const SAVE = path.join(OUT, `${O}-save.json`), WORDS = path.join(OUT, `${O}-words.tsv`), LOG = path.join(OUT, `${O}-log.txt`);
const NAME = 'נועם';
(async () => {
  let carry = null;
  if (PART > 1) carry = JSON.parse(fs.readFileSync(SAVE, 'utf8'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript((carry) => {
    window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    try {
      if (!sessionStorage.getItem('ux24-once')) {
        sessionStorage.setItem('ux24-once', '1'); localStorage.clear();
        if (carry) for (const [k, v] of Object.entries(carry.ls)) localStorage.setItem(k, v);
      }
    } catch (e) { /* */ }
    // every toast as it is born (a toast lives ~2–7 s; a slow poll misses it)
    window.__UXT = [];
    new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-toast')) window.__UXT.push({ t: performance.now(), s: n.innerText || n.textContent }); }).observe(document, { childList: true, subtree: true });
  }, carry);
  const tLoad = Date.now();
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const bootS = Math.round((Date.now() - tLoad) / 1000);
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg);
  const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(70); await up(9); };
  const swipe = async (x0, y0, x1, y1, n = 6) => { await down(8, x0, y0); for (let k = 1; k <= n; k++) { await move(8, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await pg.waitForTimeout(16); } await up(8); };
  const OFF = carry ? carry.sec : 0;
  const T0 = Date.now();
  const sec = () => OFF + Math.round((Date.now() - T0) / 1000);
  const pad = (n) => String(n).padStart(3, '0');
  const shots = [];
  const shot = async (what) => {
    const f = `${O}-${pad(sec())}s-${what.replace(/[^a-z0-9א-ת-]+/gi, '_').slice(0, 40)}.png`;
    try {
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, f), timeout: 240000 });
    } catch (e) { console.log('   shot failed', e.message); }
    await G(() => { window.__HUD_HOLD = false; }).catch(() => {});
    shots.push(f); console.log('   shot ' + f);
    return f;
  };
  const words = carry ? new Map(carry.words) : new Map();
  const word = (kind, s) => { s = (s || '').replace(/\s+/g, ' ').trim(); if (!s || s.length < 2) return false; const k = kind + '|' + s; if (words.has(k)) return false; words.set(k, sec()); return true; };
  const look = () => G(() => {
    const vis = (e) => { if (!e) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
    const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top }; };
    const txt = (e) => (e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '');
    const modal = [...document.querySelectorAll('.gm-modal')].find(vis);
    const gold = modal && ([...modal.querySelectorAll('.gm-btn-gold')].find(vis) || [...modal.querySelectorAll('.gm-btn, button')].find(vis));
    const input = modal && [...modal.querySelectorAll('input, .gm-input')].find(vis);
    const cine = document.querySelector('.gm-cine'); const bub = document.querySelector('.gm-bub');
    const deal = document.querySelector('.gm-deal.on'); const dealBtn = deal && [...deal.querySelectorAll('.gm-jc, .gm-btn')].find(vis);
    const mg = [...document.querySelectorAll('.fx-mg')].find(vis);
    const how = mg && [...mg.querySelectorAll('.fx-mg-how')].find((e) => !e.hidden && vis(e));
    const mgCanvas = mg && mg.querySelector('.fx-mg-stage canvas');
    const mgBtns = mg ? [...mg.querySelectorAll('.fx-mg-ctl button, .fx-mg-res button')].filter(vis).map((e) => ({ ...box(e), t: txt(e) })) : [];
    const m3 = [...document.querySelectorAll('.m3')].find(vis); const m3hit = m3 && m3.querySelector('.m3-hit');
    const m3btn = m3 && [...document.querySelectorAll('button')].filter(vis).filter((e) => !e.closest('.gm-top, .gm-dock, .tw-pad, .gm-goal') && !e.classList.contains('m3-exit')).sort((a, b2) => (/התחל|המשך/.test(txt(b2)) ? 1 : 0) - (/התחל|המשך/.test(txt(a)) ? 1 : 0)).find((e) => e.classList.contains('m3-back') || /^(התחל|המשך|שחק|עוד|יופי|קבל|לבנייה|חזרה לבנייה)/.test(txt(e)));
    const sheet = document.querySelector('.gm.sheet-open .gm-sheet'); const shx = sheet && sheet.querySelector('.gm-x');
    const btn = document.querySelector('.tw-btn');
    const marks = [...document.querySelectorAll('.tw-mk')].filter(vis).map((e) => ({ ...box(e), near: e.classList.contains('near'), label: txt(e) }));
    const goal = [...document.querySelectorAll('.tw-goal')].find(vis);
    const mark = document.querySelector('.gm-mark'); let gmMark = null;
    if (mark && !mark.classList.contains('gm-hidden') && mark.style.opacity !== '0') { const t = mark.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); if (t) gmMark = { x: +t[1], y: +t[2] }; }
    const pill = document.querySelector('.gm-pill');
    let hero = null; try { const p = __T.stages.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z); hero = { sx: q.x, sy: q.y, on: !!q.on, x: p.x, z: p.z }; } catch (e) { /* */ }
    const g = __T.game.state, h = g.st && g.st.har;
    const other = [...document.querySelectorAll('button, [role=button]')].filter(vis).filter((e) => !e.closest('.gm-top, .gm-tabs, .gm-dock, .tw-btn, .gm-goal')).slice(0, 6).map((e) => ({ ...box(e), t: txt(e).slice(0, 24), c: e.className.slice(0, 30) }));
    const toasts = [...document.querySelectorAll('.gm-toast')].filter(vis).map(txt);
    const hudTxt = [...document.querySelectorAll('.gm-top, .gm-tabs, .gm-res')].filter(vis).map(txt).join(' ¦ ').slice(0, 300);
    const vh = document.querySelectorAll('button, a, [role=button], .gm-db'); let small = 0; for (const e of vh) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 40 || r.height < 40) small++; }
    return {
      modal: modal ? { text: txt(modal).slice(0, 400), btn: gold ? { ...box(gold), t: txt(gold) } : null, input: input ? box(input) : null } : null,
      cine: vis(cine) ? box(cine) : null, coach: bub && vis(bub) ? txt(bub) : '',
      deal: deal && vis(deal) ? { text: txt(deal).slice(0, 200), btn: dealBtn ? { ...box(dealBtn), t: txt(dealBtn).slice(0, 40) } : null } : null,
      mg: mg ? { kind: mg.dataset.kind, text: txt(mg).slice(0, 200), how: how ? box(how) : null, canvas: mgCanvas && vis(mgCanvas) ? box(mgCanvas) : null, btns: mgBtns } : null,
      m3: m3 ? { pair: window.__UX24_M3 || null, text: txt(m3).slice(0, 160), hit: m3hit ? box(m3hit) : null, btn: m3btn ? { ...box(m3btn), t: txt(m3btn) } : null } : null,
      sheet: sheet && vis(sheet) ? { text: txt(sheet).slice(0, 200), x: shx && vis(shx) ? box(shx) : null } : null,
      twin: !!(window.__TWIN && __TWIN.on()), spec: window.__TWIN && __TWIN.spec() ? { job: __TWIN.spec().job, label: __TWIN.spec().label, icon: __TWIN.spec().icon } : null,
      btn: btn && vis(btn) ? { ...box(btn), awake: btn.classList.contains('awake'), t: txt(btn) } : null,
      marks, goal: goal ? box(goal) : null, gmMark, pill: pill && vis(pill) ? { ...box(pill), t: txt(pill) } : null, hero,
      stamp: [...document.querySelectorAll('.gm-stamp')].filter(vis).map(txt).join('|'),
      banner: [...document.querySelectorAll('.gm-banner')].filter(vis).map(txt).join('|'),
      toasts, hud: hudTxt, small, other,
      newToasts: (window.__UXT || []).splice(0).map((x) => x.s.replace(/\s+/g, ' ').trim()),
      sig: JSON.stringify([g.res && g.res.silver, g.ftue, h && h.p, h && h.set, h && h.paid, (g.bh || []).reduce((a, x) => a + x, 0), g.xp && JSON.stringify(g.xp).length, g.score, Object.keys(g.st || {}).filter((k) => g.st[k] && g.st[k].done).length, (g.stats && g.stats.strikes) || 0]),
      st: { coins: g.res ? g.res.silver : null, ftue: g.ftue, focus: g.focus, ph: h ? h.p : null, set: h ? h.set : null, score: g.score, done: Object.keys(g.st || {}).filter((k) => g.st[k] && g.st[k].done) },
    };
  });
  const lines = [];
  const say = (s) => { console.log(s); lines.push(s); };
  say(`== UX24 play · ${O === 'p' ? 'portrait 390×844' : 'landscape 844×390'} · part ${PART} · from ${OFF}s · boot ${bootS}s (SwiftShader) ==`);
  await pg.waitForTimeout(1200);
  let s = await look();
  if (PART === 1) await shot('first-screen');
  let lastShot = sec(), lastSig = s.sig, lastProg = sec(), lastPill = -99, seenModal = '', seenMg = '', seenStamp = '', seenBanner = '', seenDeal = '', seenSheet = '';
  let named = !!(carry && carry.named);
  const counts = carry ? carry.counts : { cards: 0, sheets: 0, m3: 0, work: 0, walks: 0, compass: 0, pill: 0, mark: 0, blind: 0, deal: 0 };
  let walkFails = 0, fdown = false, best = null, bestT = 0;
  while ((Date.now() - T0) / 1000 < SECS) {
    s = await look();
    const t = sec();
    // what is new on screen: record the words, shoot the moment
    let newWhat = '';
    for (const x of s.newToasts) if (word('toast', x)) newWhat = newWhat || 'toast';
    if (s.coach) word('coach', s.coach);
    if (s.pill) word('pill', s.pill.t);
    if (s.btn && s.btn.t) word('workbtn', s.btn.t);
    for (const m of s.marks) word('marker', m.label);
    if (s.modal && s.modal.text !== seenModal) { seenModal = s.modal.text; word('card', s.modal.text); newWhat = 'card'; }
    if (s.mg && s.mg.text !== seenMg) { seenMg = s.mg.text; word('sheet', s.mg.text); newWhat = 'sheet-' + s.mg.kind; }
    if (s.m3 && !seenMg.startsWith('m3')) { seenMg = 'm3'; word('m3', s.m3.text); newWhat = 'match3'; }
    if (s.sheet && s.sheet.text !== seenSheet) { seenSheet = s.sheet.text; word('panel', s.sheet.text); newWhat = 'panel'; }
    if (s.deal && s.deal.text !== seenDeal) { seenDeal = s.deal.text; word('deal', s.deal.text); newWhat = newWhat || 'deal'; }
    if (s.stamp && s.stamp !== seenStamp) { seenStamp = s.stamp; word('stamp', s.stamp); newWhat = 'stamp'; }
    if (s.banner && s.banner !== seenBanner) { seenBanner = s.banner; word('banner', s.banner); newWhat = newWhat || 'banner'; }
    if (newWhat || t - lastShot >= SHOT_EVERY) { await shot(newWhat || 'play'); lastShot = t; }
    // the kid: follow the screen — the cinema, a card's gold button (his name when asked), a sheet's game, the deal, the work
    // button when it wakes, the markers / the arrow / the gold pointer, the pill; else he looks (and after 8 s taps somewhere)
    let act = '';
    if (fdown && !(s.twin && (s.marks.length || s.goal) && !(s.btn && s.btn.awake) && !s.modal && !s.mg && !s.m3)) { await up(1); fdown = false; }
    if (s.cine) { act = 'tap the opening'; await tap(s.cine.x, s.cine.y + s.cine.h * 0.1); }
    else if (s.modal && s.modal.input && !named) {
      act = `card asks a name → types "${NAME}"`; await tap(s.modal.input.x, s.modal.input.y); await pg.waitForTimeout(200);
      await pg.keyboard.type(NAME); named = true; await pg.waitForTimeout(300);
      if (s.modal.btn) await tap(s.modal.btn.x, s.modal.btn.y); counts.cards++;
    } else if (s.modal && s.modal.btn) { counts.cards++; act = `card "${s.modal.text.slice(0, 70)}" → [${s.modal.btn.t}]`; await pg.waitForTimeout(1500); await tap(s.modal.btn.x, s.modal.btn.y); }
    else if (s.m3) {
      counts.m3++;
      if (s.m3.btn) { act = `match-3: [${s.m3.btn.t}]`; await tap(s.m3.btn.x, s.m3.btn.y); }
      else if (s.m3.pair || await pg.waitForFunction(() => !!window.__UX24_M3, null, { polling: 200, timeout: 6000 }).then(() => true, () => false)) {   // (a kid looks at the board until it shows him a pair: ≤ 6 s)
        const pair = s.m3.pair || await G(() => window.__UX24_M3);
        if (pair) { act = 'match-3: swipes the pulsing pair'; const [a, c2] = pair; await swipe(a.x, a.y, c2.x, c2.y); await pg.waitForTimeout(900); }
      }
      else if (s.m3.hit) {   // a kid swipes pieces at random, one beside another
        const hb = s.m3.hit, c = Math.min(hb.w, hb.h) / 8; act = 'match-3: 3 swipes';
        for (let k = 0; k < 3; k++) { const i = 1 + Math.floor(Math.random() * 6), j = 1 + Math.floor(Math.random() * 6), d = [[1, 0], [-1, 0], [0, 1], [0, -1]][k % 4]; const x0 = hb.l + (i + 0.5) * c, y0 = hb.t + (j + 0.5) * c; await swipe(x0, y0, x0 + d[0] * c, y0 + d[1] * c); await pg.waitForTimeout(450); }
      } else { act = 'match-3: nothing to touch'; }
    } else if (s.mg) {
      counts.sheets++;
      if (s.mg.how) { act = `SHEET ${s.mg.kind}: tap the how-to`; await tap(s.mg.how.x, s.mg.how.y + s.mg.how.h * 0.3); }
      else if (s.mg.btns.length && /המשך|סיום|חזרה|אישור|יופי/.test(s.mg.btns.map((x) => x.t).join(' '))) { const bb = s.mg.btns.find((x) => /המשך|סיום|חזרה|אישור|יופי/.test(x.t)); act = `SHEET ${s.mg.kind}: [${bb.t}]`; await tap(bb.x, bb.y); }
      else if (s.mg.btns.length) { const bb = s.mg.btns[Math.floor(Math.random() * s.mg.btns.length)]; act = `SHEET ${s.mg.kind}: [${bb.t}] ×3`; for (let k = 0; k < 3; k++) { await tap(bb.x, bb.y); await pg.waitForTimeout(300); } }
      else if (s.mg.canvas) { const c = s.mg.canvas; act = `SHEET ${s.mg.kind}: taps the field ×3`; for (let k = 0; k < 3; k++) { await tap(c.x + (Math.random() - 0.5) * c.w * 0.3, c.y + (Math.random() - 0.5) * c.h * 0.3); await pg.waitForTimeout(350); } }
      else act = `SHEET ${s.mg.kind}: nothing to touch`;
    } else if (s.sheet && s.sheet.x) { act = `panel "${s.sheet.text.slice(0, 40)}" → ✕`; await pg.waitForTimeout(1200); await tap(s.sheet.x.x, s.sheet.x.y); }
    else if (s.deal && s.deal.btn) { counts.deal++; act = `deal → [${s.deal.btn.t}]`; await tap(s.deal.btn.x, s.deal.btn.y); }
    else if (s.btn && s.btn.awake) {
      counts.work++; act = `work button [${s.spec ? s.spec.icon + ' ' + s.spec.label : s.btn.t}] ×4`;
      for (let k = 0; k < 4; k++) { await down(2, s.btn.x, s.btn.y); await pg.waitForTimeout(60); await up(2); await pg.waitForTimeout(230); }
    } else if (s.twin && (s.marks.length || s.goal)) {
      const tgt = s.marks.find((m) => !m.near) || s.marks[0];
      if (s.marks.some((m) => m.near)) { act = 'stands at a marker, waits for the button'; await pg.waitForTimeout(400); }
      else if (tgt && s.hero) {
        const l0 = Math.hypot(tgt.x - s.hero.sx, tgt.y - s.hero.sy); if (best == null || l0 < best - 8) { best = l0; bestT = t; }
        if (t - bestT > 8 && s.goal) { counts.compass++; act = 'stuck → taps the edge arrow'; if (fdown) { await up(1); fdown = false; } await tap(s.goal.x, s.goal.y); best = null; bestT = t; }
        else {
          let dx = tgt.x - s.hero.sx, dy = tgt.y - s.hero.sy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; counts.walks++;
          act = `walks (left thumb) to the marker "${tgt.label.slice(0, 20)}" ${Math.round(l)} px away`;
          if (!fdown) { await down(1, 150, H - 110); fdown = true; }
          await move(1, 150 + dx * 55, H - 110 + dy * 55); await pg.waitForTimeout(Math.min(1100, 300 + l * 3));
        }
      } else if (s.goal) { counts.compass++; act = 'taps the edge arrow (work off-screen)'; await tap(s.goal.x, s.goal.y); }
    } else if (s.gmMark && s.gmMark.x > 0 && s.gmMark.x < W && s.gmMark.y > 0 && s.gmMark.y < H) { counts.mark++; act = 'taps the gold pointer'; await tap(s.gmMark.x, s.gmMark.y); }
    else if (s.pill && t - lastPill > 5 && !(s.btn && !s.btn.awake && s.twin)) { counts.pill++; lastPill = t; act = `taps the pill [${s.pill.t.slice(0, 40)}]`; await tap(s.pill.x, s.pill.y); }
    else if (t - lastProg > 8) { counts.blind++; const x = W * (0.3 + Math.random() * 0.4), y = H * (0.35 + Math.random() * 0.3); act = `nothing to follow for ${t - lastProg}s → taps the world (${Math.round(x)},${Math.round(y)})`; await tap(x, y); }
    else act = s.coach ? `reads the coach "${s.coach.slice(0, 50)}"` : 'looks';
    await pg.waitForTimeout(650);
    const s2 = await look();
    const prog = s2.sig !== lastSig; if (prog) { lastSig = s2.sig; lastProg = sec(); }
    const saw = [s.modal ? 'CARD' : '', s.mg ? 'SHEET:' + s.mg.kind : '', s.m3 ? 'MATCH3' : '', s.deal ? 'DEAL' : '', s.coach ? `coach«${s.coach.slice(0, 40)}»` : '', s.marks.length ? `${s.marks.length} marker` : '', s.goal ? 'arrow' : '', s.gmMark ? 'gold-ptr' : '', s.btn ? `btn${s.btn.awake ? '*' : ''}` : '', s.toasts.length ? `toast«${s.toasts[0].slice(0, 30)}»` : ''].filter(Boolean).join(' ');
    say(`[${pad(t)}s] saw: ${saw || '(the world only)'} | touched: ${act} | got: ${prog ? 'progress ' + s2.sig : 'nothing'}${s2.stamp ? ' · STAMP ' + s2.stamp : ''}${s2.banner ? ' · BANNER ' + s2.banner : ''} | quiet ${sec() - lastProg}s · ph ${s2.st.ph} set ${s2.st.set} coins ${s2.st.coins} ftue ${s2.st.ftue} focus ${s2.st.focus} done[${s2.st.done.join(',')}] · hero ${s2.hero ? (s2.hero.on ? Math.round(s2.hero.sx) + ',' + Math.round(s2.hero.sy) : 'OFF') : '-'} · small-targets ${s2.small}`);
  }
  if (fdown) await up(1);
  await shot('part-end');
  const fin = await look();
  say(`HUD at the end: ${fin.hud}`);
  say(`counts ${JSON.stringify(counts)} · errors ${errs.length} ${errs.slice(0, 3).join(' | ').slice(0, 300)}`);
  const ls = await G(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  fs.writeFileSync(SAVE, JSON.stringify({ ls, sec: sec(), words: [...words.entries()], named, counts }));
  fs.writeFileSync(WORDS, [...words.entries()].sort((a, b) => a[1] - b[1]).map(([k, v]) => `${v}\t${k.split('|')[0]}\t${k.slice(k.indexOf('|') + 1)}`).join('\n') + '\n');
  fs.appendFileSync(LOG, lines.join('\n') + '\n');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
