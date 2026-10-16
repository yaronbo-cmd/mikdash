// Key moments, wave 3 (docs/MOMENTS.md): each new moment played to its end by a solver, with screenshots.
//   node test/moments.cjs                    the real build (dist/test.html, SwiftShader): phone 390×844 + desktop 1280×720
//   node test/moments.cjs --harness          the DOM harness (a fake world, no WebGL: fast), phone 390×844 only
//   options: --only=karnot,kiyor · --no-build · --no-desktop · --no-replay
// Per moment: it opens from its stage (G.st[id].ready), a wrong move only nudges (no fail, same step again), the solver
// finishes it, the end card shows a source and the "טיוטה" tag, "המשך" completes the stage, and the map replays it
// without touching the save. Screenshots: test/out/moments-<id>-<W>.png (real) · test/out/moments-h-<id>[-end].png.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const HARNESS = args.includes('--harness');
const only = ((args.find((a) => a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);
const IDS = ['karnot', 'kiyor', 'ulam', 'yesod', 'heichal', 'gates', 'nikanor', 'wall', 'nashim', 'lishka', 'guf'];
// each moment's title (content.js MOMENTS[id].n): the open overlay must be this one
const TITLE = Object.fromEntries(IDS.map((id) => [id, (fs.readFileSync(path.join(ROOT, 'src/game/content.js'), 'utf8').match(new RegExp(`\\n  ${id}: \\{ n: '([^']+)'`)) || [])[1]]));
const RUN = only.length ? IDS.filter((id) => only.includes(id)) : IDS;

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

if (HARNESS) execSync('node test/game-harness.cjs --build', { cwd: ROOT, stdio: 'ignore' });
else if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });

/* ── in-page helpers: svg units → client px, synthetic pointer input (touch-like: pointerType 'touch') ── */
const PAGE_HELPERS = () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const svgOf = (e) => (e.ownerSVGElement || e);
  const px = (svg, x, y) => { const m = svg.getScreenCTM(); const p = new DOMPoint(x, y).matrixTransform(m); return { x: p.x, y: p.y }; };
  const fire = (target, type, p, extra = {}) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, pointerId: 7, pointerType: 'touch', isPrimary: true, ...extra }));
  const center = (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  window.__MO = {
    sleep, frame, px, center,
    q: (s) => document.querySelector('.gm-mo.on ' + s), qa: (s) => [...document.querySelectorAll('.gm-mo.on ' + s)],
    hint: () => (document.querySelector('.gm-mo.on .gm-mo-hint') || {}).textContent || '',
    tag: () => (document.querySelector('.gm-mo.on .gm-m2-tag') || {}).textContent || '',
    ended: () => { const e = document.querySelector('.gm-mo.on .gm-mo-end'); return !!e && !e.hidden; },
    tap: async (e) => { const p = center(e); fire(e, 'pointerdown', p); await frame(); fire(e, 'pointerup', p); await frame(); },
    /** drag e (pointerdown on it) along svg-unit points, releasing on the last */
    drag: async (e, pts, stepMs = 16) => {
      const svg = svgOf(e); let p = center(e); fire(e, 'pointerdown', p);
      for (const [x, y] of pts) { p = px(svg, x, y); fire(svg, 'pointermove', p); await sleep(stepMs); }
      fire(svg, 'pointerup', p); await frame();
    },
    hold: async (e, ms) => { const p = center(e); fire(e, 'pointerdown', p); await sleep(ms); fire(e, 'pointerup', p); await frame(); },
    /** hold until cond() (or ms), then release: a slow renderer gets the time it needs */
    holdUntil: async (e, cond, ms = 15000) => { const p = center(e); fire(e, 'pointerdown', p); const t0 = performance.now(); while (!cond() && performance.now() - t0 < ms) await sleep(30); fire(e, 'pointerup', p); await frame(); return cond(); },
    until: async (fn, ms = 6000) => { const t0 = performance.now(); while (performance.now() - t0 < ms) { if (fn()) return true; await sleep(30); } return !!fn(); },
  };
};

/* ── solvers: play each moment like a player, including one wrong move where the moment has one ── */
const SOLVE = {
  async karnot(s) {
    const r1 = await s.E(async () => {
      const M = __MO, pieces = M.qa('.gm-m2-drag');
      // a drag that ends nowhere near a corner: the horn goes back to the tray (a nudge, no fail)
      await M.drag(pieces[0], [[150, 240], [150, 200], [150, 180]]);
      await M.until(() => /קרוב יותר/.test(M.hint()), 3000);
      const nudge = M.hint();
      await M.until(() => !pieces[0].hasAttribute('data-busy'), 8000); await M.sleep(60);   // (back in the tray)
      // a real drag onto the top-right corner, then three taps (a tap sends a horn to the next free corner)
      await M.drag(pieces[0], [[200, 200], [250, 60], [259, 15]]);
      await M.until(() => /1 \/ 4/.test(M.tag()), 5000);
      const oneTag = M.tag();
      for (const [k, p] of pieces.slice(1).entries()) { await M.tap(p); await M.until(() => M.tag().includes(`${k + 2} / 4`), 5000); }
      const fireStep = await M.until(() => /החזק/.test(M.hint()), 5000);
      return { pieces: pieces.length, nudge, oneTag, tag: M.tag(), fireStep };
    });
    check('karnot: four horns in the tray', r1.pieces === 4, String(r1.pieces));
    check('karnot: a horn dropped away from the corners goes back with a nudge', /קרוב יותר/.test(r1.nudge), r1.nudge);
    check('karnot: dragging a horn onto a corner seats it', /1 \/ 4/.test(r1.oneTag), r1.oneTag);
    check('karnot: four horns set → the fire step', r1.fireStep && /האש/.test(r1.tag), `${r1.tag} · ${r1.fireStep}`);
    // hold a little, let go (the embers stay), then hold to the end
    const r2 = await s.E(async () => {
      const M = __MO, hot = M.q('rect[aria-label="המערכה"]');
      const w = () => parseFloat(M.q('.gm-m2-bar i').style.width) || 0;
      await M.holdUntil(hot, () => w() >= 25, 10000);
      await M.sleep(300);
      return { part: w() };
    });
    check('karnot: holding on the wood kindles it part way; letting go keeps the embers', r2.part > 10 && r2.part < 90, `${r2.part}%`);
    await s.shot('mid');
    const r3 = await s.E(async () => {
      const M = __MO, hot = M.q('rect[aria-label="המערכה"]');
      await M.holdUntil(hot, () => /בוערת/.test(M.hint()), 20000);
      return await M.until(M.ended, 5000);
    });
    check('karnot: holding on lights the first fire → the end card', r3);
    if (s.harness) check('karnot: the fire reaches the world (momentFX "fire")', await s.E(() => __H.world.calls.some((c) => c.fn === 'momentFX' && c.args[0] === 'fire')));
  },
};

SOLVE.kiyor = async (s) => {
  // pour: release too early (a nudge), then hold past the line (the spill goes back), then release on the line
  const r1 = await s.E(async () => {
    const M = __MO, btn = M.q('.gm-mo-hold'), fire = (t) => btn.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true }));
    const lvl = () => { const r = M.q('rect[clip-path]'); return r ? (252 - parseFloat(r.getAttribute('y'))) / 140 : 0; };
    fire('pointerdown'); await M.until(() => lvl() > 0.35, 8000); fire('pointerup');
    await M.until(() => /עוד קצת/.test(M.hint()), 4000);
    const early = M.hint();
    fire('pointerdown'); await M.until(() => /יותר מדי/.test(M.hint()), 9000); const over = M.hint(); const back = lvl();
    await M.until(() => lvl() >= 0.78, 6000); fire('pointerup');
    const cooled = await M.until(() => /דדים/.test(M.tag()), 4000);
    return { early, over, back, cooled, tag: M.tag() };
  });
  check('kiyor: released below the line → "עוד קצת", pouring goes on', /עוד קצת/.test(r1.early), r1.early);
  check('kiyor: past the line → the spill is scraped off and the level goes back (no fail)', /יותר מדי/.test(r1.over) && r1.back < 0.7, `${r1.over} · ${r1.back.toFixed(2)}`);
  check('kiyor: released on the line → it cools, then the spigots (2 of 12)', r1.cooled && /2 \/ 12/.test(r1.tag), r1.tag);
  const r2 = await s.E(async () => {
    const M = __MO, spots = M.qa('[data-k]');
    for (const g of spots.slice(0, 5)) { await M.tap(g); await M.sleep(90); }
    return { n: spots.length, tag: M.tag() };
  });
  check('kiyor: ten places for new spigots; each tap fits one', r2.n === 10 && /7 \/ 12/.test(r2.tag), `${r2.n} · ${r2.tag}`);
  await s.shot('mid');
  const r3 = await s.E(async () => {
    const M = __MO; for (const g of M.qa('[data-k]')) { await M.tap(g); await M.sleep(60); }
    const night = await M.until(() => /בלילה/.test(M.tag()) && !!M.q('.gm-mo-hold'), 6000);
    const btn = M.q('.gm-mo-hold'), fire = (t) => btn.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true }));
    fire('pointerdown'); await M.until(() => /יריחו/.test(M.hint()), 15000); fire('pointerup');
    return { night, ended: await M.until(M.ended, 5000) };
  });
  check('kiyor: twelve spigots → night: turning the mukhni sinks the kiyor into the water', r3.night);
  check('kiyor: → the end card (Yoma 3:10, the mukhni, Tamid 3:8)', r3.ended && await s.E(() => { const t = document.querySelector('.gm-mo.on .gm-mo-src').textContent; return /יומא ג, י/.test(t) && /מוכני/.test(t); }));
};

SOLVE.ulam = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO, btn = M.q('[data-a="drop"]');
    const dx = () => { const g = M.q('[data-swing]'); if (!g) return null; const m = (g.getAttribute('transform') || '').match(/translate\(([-\d.]+) 40\)/); return m ? +m[1] - 150 : null; };
    // one drop off-centre: it bumps and goes back up (a nudge)
    await M.until(() => { const d = dx(); return d !== null && Math.abs(d) > 26; }, 8000); btn.click();
    await M.until(() => /לא במרכז/.test(M.hint()), 3000); const miss = M.hint();
    const seated = [];
    for (let k = 0; k < 5; k++) {
      await M.until(() => { const d = dx(); return d !== null && Math.abs(d) < 3.5; }, 12000);
      btn.click();
      await M.until(() => M.tag().includes(`${k + 2} / 5`) || /שלושים/.test(M.hint()) || /לא במרכז/.test(M.hint()), 4000);
      if (/לא במרכז/.test(M.hint())) { k--; M.q('.gm-mo-hint').textContent = ''; await M.sleep(500); continue; }
      seated.push(M.tag());
      if (k === 2) break;
    }
    return { miss, seated };
  });
  check('ulam: a lintel dropped off-centre bumps back up with a nudge', /לא במרכז/.test(r1.miss), r1.miss);
  check('ulam: centred lintels seat, a stone course between them', r1.seated.length === 3, r1.seated.join(' | '));
  await s.shot('lintels');
  const r2 = await s.E(async () => {
    const M = __MO, btn = M.q('[data-a="drop"]');
    const dx = () => { const g = M.q('[data-swing]'); if (!g) return null; const m = (g.getAttribute('transform') || '').match(/translate\(([-\d.]+) 40\)/); return m ? +m[1] - 150 : null; };
    for (let k = 0; k < 8 && M.q('[data-swing]'); k++) {
      await M.until(() => { const d = dx(); return d !== null && Math.abs(d) < 3.5; }, 12000);
      const b = M.q('[data-a="drop"]'); if (b) b.click();
      await M.sleep(700);
    }
    const five = await M.until(() => /שלושים/.test(M.hint()) || /גפן/.test(M.tag()), 4000);
    await M.until(() => M.qa('[data-piece]').length === 3, 5000);
    const pieces = M.qa('[data-piece]');
    await M.drag(pieces[1], [[150, 200], [150, 120], [150, 82]]);
    await M.until(() => pieces[1].style.pointerEvents === 'none', 3000);
    for (const p of [pieces[0], pieces[2]]) { await M.tap(p); await M.sleep(400); }
    return { five, ended: await M.until(M.ended, 5000) };
  });
  check('ulam: five lintels (the top one 30 amot) → the vine', r2.five);
  check('ulam: a leaf, a grape and a cluster hung on the vine → the end card (Middot 3:8)', r2.ended && await s.E(() => /מדות ג, ח/.test(document.querySelector('.gm-mo.on .gm-mo-src').textContent)));
};

SOLVE.yesod = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO;
    await M.tap(M.q('[data-tool="iron"]')); await M.sleep(150); const iron = M.hint();
    await M.tap(M.q('[data-tool="trowel"]')); await M.sleep(150); const trowel = M.hint();
    await M.tap(M.q('[data-tool="wood"]'));
    const stones = await M.until(() => !!M.q('[data-stone]') && !!M.q('[data-a="lay"]'), 5000);
    return { iron, trowel, stones };
  });
  check('yesod: the iron hammer is refused ("ברזל פוסל בנגיעה")', /ברזל פוסל/.test(r1.iron), r1.iron);
  check('yesod: the iron trowel is refused (כפיס של ברזל)', /כפיס/.test(r1.trowel), r1.trowel);
  check('yesod: the wooden mallet → the stones', r1.stones);
  if (s.harness) check('yesod: the builder\'s tool in the world becomes wood (hero.setTool)', await s.E(() => __H.world.calls.some((c) => c.fn === 'hero.setTool' && c.args[0] === 'wood')));
  const r2 = await s.E(async () => {
    const M = __MO; const out = [];
    const last = () => { const a = M.qa('[data-stone]'); return a.length ? a[a.length - 1] : null; };
    const cur = () => { const e = last(); return e && e.getAttribute('data-ready') ? e.getAttribute('data-stone') : null; };
    // stone 1 is whole: reject it first (a nudge), then lay it
    await M.until(() => cur() === 'whole', 8000);
    M.q('[data-a="reject"]').click(); await M.sleep(100); out.push(M.hint());
    M.q('[data-a="lay"]').click();
    await M.until(() => cur() === 'chipped', 8000);
    return { out };
  });
  await s.shot('mid');
  const r3 = await s.E(async () => {
    const M = __MO; const out = [];
    const last = () => { const a = M.qa('[data-stone]'); return a.length ? a[a.length - 1] : null; };
    const cur = () => { const e = last(); return e && e.getAttribute('data-ready') && !e.getAttribute('data-gone') ? e.getAttribute('data-stone') : null; };
    for (let k = 1; k < 6; k++) {
      await M.until(() => !!cur() || M.ended() || /שלמות/.test(M.tag()), 8000);
      const c = cur(); if (!c) break;
      last().setAttribute('data-gone', '1');
      M.q(c === 'whole' ? '[data-a="lay"]' : '[data-a="reject"]').click();
      await M.until(() => /\d \/ 6/.test(M.tag()) && M.tag() !== `אבן ${k + 1} / 6` || M.ended() || /שלמות/.test(M.tag()), 3000);
      if (k === 2) out.push('shot');
    }
    return { out, tag: M.tag(), ended: await M.until(M.ended, 4000) };
  });
  check('yesod: a whole stone set aside → "האבן שלמה" (no fail)', /האבן שלמה/.test(r2.out[0]), r2.out[0]);
  check('yesod: four whole stones laid, two chipped ones set aside → the end card', r3.ended && /4 שלמות · 2 פסולות/.test(r3.tag), r3.tag);
};

SOLVE.heichal = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO, svg = M.q('.gm-m2');
    const rubAt = async (x0, y0, x1, y1, n = 4) => {
      const fire = (t, p) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, pointerId: 7, pointerType: 'touch' }));
      fire('pointerdown', M.px(svg, x0, y0));
      for (let k = 0; k < n; k++) { for (const [x, y] of [[x1, y1], [x0, y0]]) { fire('pointermove', M.px(svg, x, y)); await M.sleep(12); } }
      fire('pointerup', M.px(svg, x0, y0));
    };
    await rubAt(236, 80, 272, 200, 2);                    // behind the door: no gold
    const door = M.hint();
    for (let k = 0; k < 3; k++) { const x = 18 + k * 51, y = 30; await rubAt(x + 4, y + 6, x + 42, y + 98, 6); await M.sleep(30); }
    return { door, tag: M.tag() };
  });
  check('heichal: rubbing behind the door explains "חוץ מאחר הדלתות"', /חוץ מאחר הדלתות/.test(r1.door), r1.door);
  check('heichal: rubbing a plate polishes it', /3 \/ 8/.test(r1.tag), r1.tag);
  await s.shot('mid');
  const r2 = await s.E(async () => {
    const M = __MO, svg = M.q('.gm-m2');
    const fire = (t, p) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, pointerId: 7, pointerType: 'touch' }));
    for (let i = 3; i < 8; i++) {
      const r = Math.floor(i / 4), c = i % 4, x = 18 + c * 51, y = 30 + r * 112;
      fire('pointerdown', M.px(svg, x + 4, y + 6));
      for (let k = 0; k < 6; k++) { fire('pointermove', M.px(svg, x + 42, y + 98)); await M.sleep(10); fire('pointermove', M.px(svg, x + 4, y + 6)); await M.sleep(10); }
      fire('pointerup', M.px(svg, x + 4, y + 6));
    }
    const sunUp = await M.until(() => !!M.q('[data-sun]'), 5000);
    await M.sleep(200);
    const sun = M.q('[data-sun]');
    await M.drag(sun, [[267, 200], [267, 150], [267, 100]]);
    await M.sleep(150);
    const half = M.hint();
    await M.drag(sun, [[267, 80], [267, 50], [267, 40]]);
    return { sunUp, half, ended: await M.until(M.ended, 5000) };
  });
  check('heichal: eight plates → the sunrise', r2.sunUp);
  check('heichal: the sun dragged to the top → the façade shines, the card quotes Middot 4:1 and Josephus (free translation)', r2.ended && await s.E(() => { const t = document.querySelector('.gm-mo.on .gm-mo-src').textContent; return /מדות ד, א/.test(t) && /בתרגום חופשי/.test(t); }));
};

SOLVE.gates = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO, side = () => M.q('[data-chip]').getAttribute('data-side');
    // the first gate (the Water Gate) on the wrong wall: the Mishnah's words for it, and the same card again
    await M.tap(M.q('[data-side="N"]')); await M.sleep(120);
    const why = M.hint();
    for (let k = 0; k < 3; k++) { await M.tap(M.q(`[data-side="${side()}"]:not([data-chip])`)); await M.until(() => M.tag().includes(`${k + 2} / 7`), 3000); }
    return { why, tag: M.tag() };
  });
  check('gates: the Water Gate on the north wall → "בו הכניסו את צלוחית המים… (מדות ב, ו)"', /צלוחית המים/.test(r1.why), r1.why);
  check('gates: the right wall places the gate', /4 \/ 7/.test(r1.tag), r1.tag);
  await s.shot('mid');
  const r2 = await s.E(async () => {
    const M = __MO;
    for (let k = 0; k < 12 && M.q('[data-chip]'); k++) { const t0 = M.tag(), sd = M.q('[data-chip]').getAttribute('data-side'); await M.tap(M.q(`[data-side="${sd}"]:not([data-chip])`)); await M.until(() => M.tag() !== t0 || M.ended(), 5000); }
    return await M.until(M.ended, 4000);
  });
  check('gates: seven gates → the end card (Middot 1:4)', r2 && await s.E(() => /מדות א, ד/.test(document.querySelector('.gm-mo.on .gm-mo-src').textContent)));
};

SOLVE.nikanor = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO, btn = M.q('.gm-mo-hold'), fire = (t) => btn.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true }));
    const calm = () => parseFloat(M.q('.gm-m2-bar i').style.width) || 0;
    fire('pointerdown'); await M.until(() => calm() > 40, 10000); fire('pointerup');
    const a = calm(); await M.until(() => calm() < a, 5000); await M.sleep(300); const b = calm();
    return { a, b, words: M.hint() };
  });
  check('nikanor: holding the door calms the sea; letting go lets it rise only a little (no fail)', r1.a > 40 && r1.b < r1.a && r1.b > r1.a - 20, `${r1.a}% → ${r1.b}%`);
  check('nikanor: while he holds it: "השליכו אותי איתה"', /אותי/.test(r1.words), r1.words);
  await s.shot('storm');
  const r2 = await s.E(async () => {
    const M = __MO, btn = M.q('.gm-mo-hold'), fire = (t) => btn.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true }));
    fire('pointerdown'); const calmed = await M.until(() => /נח הים/.test(M.hint()), 12000); fire('pointerup');
    const acre = await M.until(() => /עכו/.test(M.hint()), 4000);
    const stairs = await M.until(() => !!M.q('[data-step]'), 5000);
    const z = M.q('[data-step]');
    for (let k = 0; k < 9; k++) { await M.tap(z); await M.sleep(60); }
    return { calmed, acre, stairs, tag: M.tag() };
  });
  check('nikanor: the sea rests ("מיד נח הים מזעפו"), then the door at Acre', r2.calmed && r2.acre);
  check('nikanor: each tap lays one rounded step', r2.stairs && /9 \/ 15/.test(r2.tag), r2.tag);
  await s.shot('mid');
  const r3 = await s.E(async () => { const M = __MO, z = M.q('[data-step]'); for (let k = 0; k < 6; k++) { await M.tap(z); await M.sleep(60); } return await M.until(M.ended, 4000); });
  check('nikanor: fifteen steps → the end card (Middot 2:5, Yoma 38a)', r3 && await s.E(() => { const t = document.querySelector('.gm-mo.on .gm-mo-src').textContent; return /מדות ב, ה/.test(t) && /יומא לח/.test(t); }));
};

SOLVE.wall = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO;
    await M.tap(M.q('[data-opt="bad"]')); await M.until(() => /תפר מעל תפר/.test(M.hint()), 5000); const bad = M.hint();
    const idle = () => !M.q('.gm-m2').hasAttribute('data-busy');
    await M.until(idle, 8000);
    for (let k = 0; k < 2; k++) { await M.tap(M.q('[data-opt="good"]')); await M.until(() => M.tag().includes(`${k + 2} / 5`) && idle(), 8000); }
    return { bad, tag: M.tag() };
  });
  check('wall: a joint over a joint flashes, the stone is lifted, with the rule', /תפר מעל תפר/.test(r1.bad), r1.bad);
  check('wall: offset stones settle', /3 \/ 5/.test(r1.tag), r1.tag);
  await s.shot('mid');
  const r2 = await s.E(async () => { const M = __MO, idle = () => !M.q('.gm-m2').hasAttribute('data-busy'); for (let k = 0; k < 8 && M.q('[data-opt="good"]'); k++) { const t0 = M.tag(); await M.until(idle, 8000); await M.tap(M.q('[data-opt="good"]')); await M.until(() => (M.tag() !== t0 && idle()) || M.ended(), 8000); } return await M.until(M.ended, 5000); });
  check('wall: five stones → the end card (Middot 5:1 + archaeology, not Mishnah)', r2 && await s.E(() => { const t = document.querySelector('.gm-mo.on .gm-mo-src').textContent; return /מדות ה, א/.test(t) && /ארכאולוגיה, לא משנה/.test(t); }));
};

SOLVE.nashim = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO;
    await M.tap(M.q('[data-log="clean"]')); await M.sleep(100); const clean = M.hint();
    const w = M.qa('[data-log="worm"]');
    for (const g of w.slice(0, 2)) { await M.tap(g); await M.sleep(200); }
    await M.until(() => M.tag().includes('2 / 4'), 3000);
    return { clean, n: w.length, tag: M.tag() };
  });
  check('nashim: a clean log says so (no fail)', /נקי/.test(r1.clean), r1.clean);
  check('nashim: four logs with worms; tapping one takes it out', r1.n === 4 && /2 \/ 4/.test(r1.tag), `${r1.n} · ${r1.tag}`);
  await s.shot('mid');
  const r2 = await s.E(async () => { const M = __MO; for (const g of M.qa('[data-log="worm"]').slice(2)) { await M.tap(g); await M.sleep(250); } return await M.until(M.ended, 4000); });
  check('nashim: all four out → the end card (Middot 2:5)', r2 && await s.E(() => /מדות ב, ה/.test(document.querySelector('.gm-mo.on .gm-mo-src').textContent)));
};

SOLVE.lishka = async (s) => {
  const stroke = (b, x0, x1) => s.E(async ({ b, x0, x1 }) => {
    const M = __MO, svg = M.q('.gm-m2'), y = 62 + b * 34 + 17;
    const fire = (t, x) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: M.px(svg, x, y).x, clientY: M.px(svg, x, y).y, pointerId: 7, pointerType: 'touch' }));
    fire('pointerdown', x0); for (let k = 1; k <= 12; k++) { fire('pointermove', x0 + ((x1 - x0) * k) / 12); await M.sleep(12); } fire('pointerup', x1);
    await M.sleep(60);
    return { hint: M.hint(), tag: M.tag() };
  }, { b, x0, x1 });
  const half = await stroke(0, 40, 140);
  check('lishka: a short stroke smooths part of a band and asks for more (no fail)', /עוד קצת/.test(half.hint) && /0 \/ 5/.test(half.tag), `${half.hint} · ${half.tag}`);
  const full = await stroke(0, 130, 262);
  check('lishka: finishing the band\'s width smooths it', /1 \/ 5/.test(full.tag), full.tag);
  await stroke(1, 262, 36);
  await s.shot('mid');
  for (const b of [2, 3, 4]) await stroke(b, 36, 262);
  check('lishka: five bands → the straightedge → the end card (Middot 5:4)', await s.E(() => __MO.until(__MO.ended, 5000)) && await s.E(() => /מדות ה, ד/.test(document.querySelector('.gm-mo.on .gm-mo-src').textContent)));
};

SOLVE.guf = async (s) => {
  const r1 = await s.E(async () => {
    const M = __MO;
    // half way up and let go: it slides back down (a nudge)
    let st = M.q('[data-haul]');
    await M.drag(st, [[240, 238], [200, 220], [180, 214]]); await M.sleep(80);
    const low = M.hint();
    await M.until(() => !M.q('[data-haul]').hasAttribute('data-busy'), 8000); await M.sleep(60);
    // all the way up the ramp
    st = M.q('[data-haul]');
    await M.drag(st, [[250, 240], [180, 214], [120, 170], [84, 150]]);
    await M.until(() => /1 \/ 4/.test(M.tag()), 3000);
    const one = M.tag();
    for (let k = 0; k < 3; k++) { await M.tap(M.q('[data-haul]')); await M.until(() => M.tag().includes(`${k + 2} / 4`) || /סיד/.test(M.tag()), 4000); }
    const wash = await M.until(() => /סיד/.test(M.tag()), 4000);
    return { low, one, wash };
  });
  check('guf: a stone let go half way slides back down (no fail)', /עד למעלה/.test(r1.low), r1.low);
  check('guf: dragged up the ramp to the altar it lands on top', /1 \/ 4/.test(r1.one), r1.one);
  check('guf: four stones → the whitewash', r1.wash);
  const r2 = await s.E(async () => {
    const M = __MO, svg = M.q('.gm-m2');
    const fire = (t, x, y) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: M.px(svg, x, y).x, clientY: M.px(svg, x, y).y, pointerId: 7, pointerType: 'touch' }));
    const sweep = async (rows) => { for (const y of rows) { fire('pointerdown', 4, y); for (let x = 4; x <= 292; x += 10) { fire('pointermove', x, y); await M.sleep(4); } fire('pointerup', 292, y); } };
    await sweep([150, 176]);
    return { part: parseFloat(M.q('.gm-m2-bar i').style.width) || 0, sweep: true };
  });
  check('guf: rubbing the float over the altar whitens it part way', r2.part > 5 && r2.part < 100, `${r2.part}%`);
  await s.shot('mid');
  const r3 = await s.E(async () => {
    const M = __MO, svg = M.q('.gm-m2');
    const fire = (t, x, y) => svg.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, clientX: M.px(svg, x, y).x, clientY: M.px(svg, x, y).y, pointerId: 7, pointerType: 'touch' }));
    for (const y of [150, 162, 176, 190, 204, 218, 232, 246, 254]) { fire('pointerdown', 4, y); for (let x = 4; x <= 292; x += 10) { fire('pointermove', x, y); await M.sleep(3); } fire('pointerup', 292, y); if (M.ended()) break; }
    return await M.until(M.ended, 4000);
  });
  check('guf: the altar and the ramp whitewashed → the end card (Middot 3:4, 3:3)', r3 && await s.E(() => { const t = document.querySelector('.gm-mo.on .gm-mo-src').textContent; return /מדות ג, ד/.test(t) && /מדות ג, ג/.test(t); }));
};

/* ── one session: a page (harness or real build), then every moment in RUN ── */
async function session(b, { W, H, touch, tag }) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(PAGE_HELPERS);
  await pg.addInitScript(() => {
    window.__GAME_LOG = []; window.__DIALOGS = []; window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; };
    try { localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false })); } catch (e) { /* blocked */ }
  });
  const t0 = Date.now();
  if (HARNESS) {
    await pg.goto('file://' + path.join(__dirname, 'game-harness.html') + '?fast=1&api12=1&tod=noon');
    await pg.waitForFunction(() => window.__H && window.__H.game, null, { timeout: 15000 });
    await pg.evaluate(() => { window.__G = __H.game; __H.world.momentFX = (...a) => __H.world.calls.push({ fn: 'momentFX', args: a }); });
  } else {
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    await pg.evaluate(() => { window.__G = __T.game; __T.simulate(true); });   // the world runs in real time, rendered only for the shots
  }
  console.log(`[${tag}] booted in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await pg.waitForFunction(() => __G.state.ftue >= 1, null, { polling: 100, timeout: 20000 }).catch(() => {});
  const E = (fn, a) => pg.evaluate(fn, a);
  const shot = async (name) => {
    const f = path.join(OUT, HARNESS ? `moments-h-${cur}${name === 'mid' ? '' : '-' + name}.png` : `moments-${cur}${name === 'mid' ? '' : '-' + name}-${W}.png`);
    if (HARNESS) { await pg.waitForTimeout(250); await pg.screenshot({ path: f }); }
    else {
      // one frame on demand; the world keeps its real time while the (slow) capture runs
      await E(() => { __T.simulate(false); });
      await E(() => { __T.render(); __T.render(); __G.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: f, timeout: 300000 });
      await E(() => { window.__HUD_HOLD = false; });
    }
    console.log('   shot', path.relative(ROOT, f));
  };
  // the stage card, a chapter card…: click through them as they come (the Phase B invitations are marked as seen)
  const dismiss = async (ms) => {
    const t = Date.now();
    while (Date.now() - t < ms) {
      const hit = await E(() => { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) { b.click(); return true; } return false; });
      if (hit) { await pg.waitForTimeout(350); continue; }
      await pg.waitForTimeout(150);
    }
  };
  let cur = '';
  const s = { pg, E, shot, harness: HARNESS, tag };
  for (const id of RUN) {
    cur = id;
    // nothing left open from the moment before
    for (let k = 0; k < 3 && await E(() => !!document.querySelector('.gm-mo.on .gm-mo-skip:not([hidden])')); k++) { await pg.click('.gm-mo.on .gm-mo-skip').catch(() => {}); await pg.waitForTimeout(400); }
    // every other stage done, this one at its key moment
    await E((id) => {
      const g = __G.state; g.ftue = 99; __G.ui.coach(null, ''); __G.ui.closeSheet();
      for (let k = 0; k < 6; k++) { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) b.click(); }
      for (const st of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh']) if (st !== id) g.st[st] = { done: true };
      g.bh = g.bh.map(() => 0); g.priests = 10; g.celeb = true; g.story.avInvAltar = 1; g.story.avInvFinale = 1;
      g.st[id] = { w: 999, ph: 3, ready: true };
      __G._.resync();
    }, id);
    await pg.waitForTimeout(400);
    await E((id) => { for (let k = 0; k < 6; k++) { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) b.click(); } __G._.runMoment(id); }, id);
    // (the real world can take a while after a resync of all fifteen sites: wait for THIS moment's overlay)
    const open = await pg.waitForFunction((t) => { const m = document.querySelector('.gm-mo.on'); return !!m && m.getAttribute('aria-label') === t && !!m.querySelector('.gm-mo-play'); }, TITLE[id], { timeout: HARNESS ? 15000 : 90000, polling: 100 }).then(() => true, () => false);
    check(`[${tag}] ${id}: the moment opens from its stage`, open, TITLE[id]);
    if (!open) continue;
    await pg.waitForTimeout(300);
    const t1 = Date.now();
    try { await SOLVE[id](s); } catch (e) { check(`[${tag}] ${id}: solver ran`, false, e.message.split('\n')[0]); }
    const end = await E(() => ({ ended: __MO.ended(), src: (document.querySelector('.gm-mo.on .gm-mo-src') || {}).textContent || '', draft: !!document.querySelector('.gm-mo.on .gm-mo-top .gm-draft'), skip: (document.querySelector('.gm-mo.on .gm-mo-skip') || {}).hidden }));
    check(`[${tag}] ${id}: ends with a sourced card tagged "טיוטה"`, end.ended && /מקור|משנה|מדות|יומא/.test(end.src) && end.draft, `${((Date.now() - t1) / 1000).toFixed(1)} s · ${end.src.slice(0, 60)}…`);
    if (HARNESS) await shot('end');
    await E((ended) => { const b = document.querySelector(ended ? '.gm-mo.on .gm-mo-go' : '.gm-mo.on .gm-mo-skip'); if (b) b.click(); }, end.ended);
    check(`[${tag}] ${id}: "המשך" completes the stage`, await pg.waitForFunction((id) => __G.state.st[id] && __G.state.st[id].done, id, { timeout: 8000 }).then(() => true, () => false));
    await dismiss(HARNESS ? 3000 : 9000);
    if (!args.includes('--no-replay')) try {
      // the map replays it: the overlay opens, the save stays as it was; skipping closes it at once
      const before = await E(() => JSON.stringify([__G.state.st, __G.state.res.silver, __G.state.res.gold, __G.state.finds, __G.state.vine]));
      await E(() => __G.ui.openSheet('store'));
      const kind = id;
      const has = await pg.waitForSelector(`.gm-sheet.on [data-a="replay"][data-k="${kind}"]`, { timeout: 3000 }).then(() => true, () => false);
      await dismiss(1200);                                   // (a late card: the donor, a chapter)
      if (has) await E((k) => { const b = document.querySelector(`.gm-sheet.on [data-a="replay"][data-k="${k}"]`); if (b) b.click(); else { __G.ui.openSheet('store'); } }, kind);
      if (has && !(await E(() => !!document.querySelector('.gm-mo.on')))) await E((k) => { const b = document.querySelector(`.gm-sheet.on [data-a="replay"][data-k="${k}"]`); if (b) b.click(); }, kind);
      const re = has && await pg.waitForSelector('.gm-mo.on .gm-mo-play', { timeout: 4000 }).then(() => true, () => false);
      if (re) { await pg.waitForTimeout(250); await E(() => { const b = document.querySelector('.gm-mo.on .gm-mo-skip'); if (b) b.click(); }); await pg.waitForTimeout(500); }
      const after = await E(() => JSON.stringify([__G.state.st, __G.state.res.silver, __G.state.res.gold, __G.state.finds, __G.state.vine]));
      const still = await E(() => !!document.querySelector('.gm-mo.on'));
      check(`[${tag}] ${id}: replayable from the map, no rewards (the save is untouched)`, has && re && before === after && !still, `listed ${has} · opened ${re} · same save ${before === after} · closed ${!still}`);
    } catch (e) { check(`[${tag}] ${id}: replay step ran`, false, e.message.split('\n')[0]); }
    await dismiss(600);
  }
  const bad = logs.filter((l) => !/fonts|willReadFrequently|ERR_TUNNEL/.test(l));
  check(`[${tag}] no console errors`, !bad.length, bad.slice(0, 3).join(' | '));
  await ctx.close();
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: HARNESS ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    await session(b, { W: 390, H: 844, touch: true, tag: 'phone' });
    if (!HARNESS && !args.includes('--no-desktop')) await session(b, { W: 1280, H: 720, touch: false, tag: 'desktop' });
  } finally { await b.close(); }
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, HARNESS ? 'moments-h.json' : 'moments.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
