// build 34 — the naive kid's sessions (kid.cjs loads this). Each mode gets the kid's hands and eyes (K).
const path = require('path');

const scrKey = (s) => (s.screens.join(' ') || '-') + (s.eng ? ` [${s.eng.phase}${s.eng.paused ? ' paused' : ''}${s.eng.summary ? ' sum' : ''}]` : '');
async function lookRec(K, where, every = 1) {
  const s = await K.look(); if (!s || s.err) { K.note('look failed ' + (s && s.err)); return null; }
  await K.record(s, where); K.watch(s);
  const k = scrKey(s); if (!K.R.screens[k]) { K.R.screens[k] = K.el(); K.ev('screen', k); if (K.R.shots.length < 3 || /lb-pk|j32|p31-end|f17-sum|ch33|tl33|sh-pause|sh-turn28|f17-rot|lock|\.tl|\.pn|\.m3|r30-c|j32u|lb-home/.test(k)) await K.shot('scr-' + k.replace(/[^a-z0-9]+/gi, '_').slice(0, 40)); }
  return s;
}
// the helper (a parent's hand): when the child has made no progress for long, the scripted bot does the act until something changes
async function helper(K, why) {
  if (K.left() < 60000) { K.note('helper skipped (the run ends): ' + why); K.R.unresolved = (K.R.unresolved || []).concat([[K.el(), why.slice(0, 160)]]); await K.sleep(5000); return false; }   // (no time left for the bot to try: not a hard stuck — unresolved at the run's end)
  K.note('helper: ' + why);
  const has = await K.pg.evaluate(() => !!globalThis.__AUTO35).catch(() => false);
  if (!has) await K.pg.addScriptTag({ path: '/home/claude/temple3d/tools/autoplay35.js' }).catch((e) => K.note('inject ' + e.message));
  const sig0 = await K.pg.evaluate(() => globalThis.__KID.sig()).catch(() => '');
  await K.pg.evaluate((seed) => { try { globalThis.__AUTO35.stop(); globalThis.__AUTO35.start({ human: true, seed }).catch(() => {}); } catch (e) { /* */ } }, Math.floor(K.rnd() * 1000) + 1).catch(() => {});
  const t1 = Date.now(); let changed = false;
  while (Date.now() - t1 < 50000 && K.left() > 20000) { await K.sleep(1500); const s = await K.pg.evaluate(() => globalThis.__KID.sig()).catch(() => ''); if (s && s !== sig0) { changed = true; break; } }
  await K.sleep(1200);
  await K.pg.evaluate(() => { try { globalThis.__AUTO35.stop(); const S = globalThis.__T.stages; S.hero.drive(0, 0); } catch (e) { /* */ } }).catch(() => {});
  K.R.helps = (K.R.helps || 0) + 1; K.ev('helper', `${why} → ${changed ? 'moved on' : 'NO CHANGE'}`);
  if (!changed) K.R.stuck.push({ at: K.el(), hard: true, why, sig: sig0.slice(0, 300) });
  return changed;
}
async function waitEngine(K, ms = 60000) { const t1 = Date.now(); while (Date.now() - t1 < ms) { const e = await K.pg.evaluate(() => globalThis.__KID.eng()).catch(() => null); if (e && e.phase === 'run') return e; await K.sleep(400); } return null; }
async function tapSel(K, sel) { const r = await K.pg.evaluate((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel).catch(() => null); if (!r) return false; await K.tap(r.x, r.y); K.ev('tap', sel); return true; }

// ── the day, a child's way ──
async function playDay(K, o = {}) {
  const until = o.until || (() => false);
  let it = 0, nextPause = K.el() + K.between(25, 90), nextRot = K.flag('--rotate') ? K.el() + K.between(40, 150) : 1e9, idled = !K.flag('--idle'), idleAt = K.el() + K.between(60, 160), reloaded = !K.flag('--reload'), reloadAt = K.el() + K.between(50, 140), mood = 'try', moodUntil = 0;
  while (K.left() > 30000) {
    it++;
    const s = await lookRec(K, 'day');
    if (!s) { await K.sleep(500); continue; }
    if (until(s)) return s;
    const e = s.eng;
    // the chaos: the pause card mid-act, the phone turned, the page reloaded, the phone left alone
    if (e && e.phase === 'run' && !e.paused && K.el() > nextPause && !K.isCard(s)) {
      nextPause = K.el() + K.between(90, 200);
      if (await tapSel(K, '.sh-pbtn')) { await K.sleep(K.between(600, 2500)); const s2 = await lookRec(K, 'pause'); K.ev('pause-mid', `${e.k20}${e.d21}${e.m22}${e.p25}${e.r26}${e.r27} line "${s.line}"`); if (s2) { const r = K.rnd(); if (r < 0.25) await K.pokeButton(s2, (q) => /צליל|רטט/.test(q.lb), 'pause-switch'); await K.sleep(400); const s3 = await K.look(); if (s3) await K.pokeButton(s3, (q) => K.rnd() < 0.85 ? /המשך/.test(q.lb) : true, 'pause-btn'); } }
      continue;
    }
    if (K.el() > nextRot && e && e.phase === 'run') {
      nextRot = 1e9; const [w, h] = K.size(); K.ev('rotate', 'portrait'); await K.setSize(h, w); await K.sleep(K.between(2500, 6000)); await lookRec(K, 'portrait'); await K.shot('portrait');
      if (K.rnd() < 0.4) { const s2 = await K.look(); if (s2) await K.pokeButton(s2, null, 'portrait-poke'); }
      await K.setSize(w, h); K.ev('rotate', 'landscape'); await K.sleep(2500); await lookRec(K, 'landscape-back'); continue;
    }
    if (!idled && K.el() > idleAt && e && e.phase === 'run') {
      idled = true; K.ev('idle', `2 min, line "${s.line}"`); const sig0 = s.sig; const p0 = s.coins;
      await K.sleep(120000); const s2 = await lookRec(K, 'after-idle'); await K.shot('after-idle');
      K.ev('idle-end', `${s2 && s2.sig === sig0 ? 'same' : 'changed'} coins ${p0}→${s2 && s2.coins} line "${s2 && s2.line}"`); continue;
    }
    if (!reloaded && K.el() > reloadAt && e && e.phase === 'run' && (e.k20 || e.d21 || e.m22 || e.p25 || e.r26 || e.r27)) {
      reloaded = true; K.ev('reload', `mid-act ${e.k20}${e.d21}${e.m22}${e.p25}${e.r26}${e.r27} day ${e.day}`);
      await K.liftAll(); await K.pg.reload({ waitUntil: 'load', timeout: 180000 }); await K.pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 });
      await K.pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); }); await K.sleep(2000);
      const s2 = await lookRec(K, 'after-reload'); await K.shot('after-reload');
      K.ev('after-reload', s2 ? s2.tp.filter((q) => /המשך יום|משחק/.test(q.lb)).map((q) => q.lb).join(' | ') : '');
      if (!(await tapSel(K, '.lb-play'))) K.note('after reload: no play button'); await waitEngine(K, 30000); continue;
    }
    // the opening screen in the middle of a day run (after a reload, or "חזרה"): the gold button
    if (!e && s.tp.some((q) => /lb-play/.test(q.cls))) { if (K.rnd() < 0.3) await K.pokeButton(s, (q) => !/lb-play|lb-full/.test(q.cls), 'lobby-poke'); else await tapSel(K, '.lb-play'); await K.sleep(800); continue; }
    if (K.isCard(s) || (e && e.paused)) {
      await K.sleep(K.between(500, 2200));   // reading
      const s2 = await K.look(); if (!s2) continue;
      // the summary: sometimes its two books, then "the next day"
      await K.pokeButton(s2, (q) => !/העתק לוג|מסך מלא/.test(q.lb), 'card');
      continue;
    }
    if (K.stuckFor() > 75) { await helper(K, `no change ${Math.round(K.stuckFor())} s, line "${s.line}" ${JSON.stringify(e)}`); continue; }
    if (K.el() > moodUntil) { mood = K.rnd() < 0.72 ? 'try' : 'mess'; moodUntil = K.el() + K.between(6, 18); K.ev('mood', mood); }
    const r = K.rnd();
    if (mood === 'try') {
      if (r < 0.12) await K.pokeButton(s, (q) => /tw-btn|tw-goal|glow|cue|lit/.test(q.cls) || q.glow, 'glow');
      else await K.tryLine(s);
    } else {
      if (r < 0.35) { const a = K.rnd() * Math.PI * 2; await K.stick(Math.cos(a), Math.sin(a), K.between(400, 3500)); K.ev('stick-wander'); }
      else if (r < 0.7) await K.randomRight(s);
      else if (r < 0.85) await K.pokeButton(s, (q) => !/sh-pbtn/.test(q.cls), 'poke-any');
      else { // both thumbs at once: the stick and a right tap/hold
        const a = K.rnd() * Math.PI * 2; await Promise.all([K.stick(Math.cos(a), Math.sin(a), K.between(500, 1500), 1), (async () => { await K.sleep(150); await K.hold(K.size()[0] * K.between(0.6, 0.9), K.size()[1] * K.between(0.3, 0.8), K.between(80, 900), 8); })()]);
        K.ev('two-thumbs');
      }
    }
    await K.sleep(K.between(80, 400));
  }
}

// ── build 42 ── the new Phase A, stage 01 (src/game/har42.js), a child's way: he reads the line and tries — holds the world to walk, drags
// the light across the rock, taps the line, holds for the water; drags a stone from the pile to the course (and holds it there a moment, or
// not), drags the freed roller, drags slabs, swipes along the dots; pokes what glows; now and then wanders. The parent's hand after 75 s
// without a change: the stage's own autoplayer (tools/auto42.js, the quick hand) for up to 40 s. ── /build 42 ──
async function pile42(K, s) {
  const r = await K.pg.evaluate(() => { const it0 = [...document.querySelectorAll('.h42 .h42-it')].filter((b) => !b.hidden && b.getBoundingClientRect().width > 0); if (!it0.length) return null; const lit = it0.filter((b) => !b.classList.contains('nofit')), it = lit.length && Math.random() < 0.7 ? lit : it0; const b = it[Math.floor(Math.random() * it.length)].getBoundingClientRect();   /* (build 45: a child reaches for the bright stones more often than the dimmed) */ return { x: b.left + b.width / 2, y: b.top + b.height / 2, roller: it0.length === 1 }; }).catch(() => null);
  if (!r) return false;
  const [W, Hh] = K.size(), ob = s.obj && s.obj.w > 8 ? s.obj : null;
  const tx = r.roller ? r.x + K.between(60, 220) : ob ? K.between(ob.l, ob.r) : K.between(W * 0.2, W * 0.7), ty = r.roller ? r.y + K.between(-30, 30) : ob ? K.between(ob.t, ob.b) : K.between(Hh * 0.3, Hh * 0.7);
  await K.down(7, r.x, r.y);
  for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); }
  if (K.rnd() < 0.65) await K.sleep(K.between(300, 1100));   // (holds it there a moment — or lets go at once)
  await K.up(7); K.ev('pile', r.roller ? 'roller' : 'stone'); return true;
}
// ── build 53 ── the great stone's freed roller — a thing lying lit behind the stone (no button): he puts his finger on it (or near it — a
// child's aim) and drags it some way, mostly forward, sometimes too short or the wrong way ── /build 53 ──
async function roll53k(K) {
  const h = await K.pg.evaluate(() => { try { const j = globalThis.__H42 && globalThis.__H42.job(); return j && j.kind === 'roll' && j.ref.handle ? j.ref.handle() : null; } catch (e) { return null; } }).catch(() => null);
  if (!h) return false;
  const x0 = h.x + K.between(-18, 18), y0 = h.y + K.between(-14, 14), a = K.rnd() < 0.7 ? K.between(-0.5, 0.5) : K.between(0, Math.PI * 2), d = K.rnd() < 0.15 ? K.between(10, 40) : K.between(60, 240), n = Math.round(K.between(5, 12));
  await K.down(7, x0, y0); for (let i = 1; i <= n; i++) { await K.sleep(K.between(20, 70)); await K.move(7, x0 + (Math.cos(a) * d * i) / n, y0 + (Math.sin(a) * d * i) / n); }
  await K.up(7); K.ev('roller53', `${Math.round(d)} px ${Math.round((a * 180) / Math.PI)}°`); return true;
}
// ── build 45 ── stage 02, a child's way: the LINE — he puts his finger on a pin (mostly the bright near one, sometimes the far one) and drags
// toward the other, wobbling as a hand does, now and then letting go midway; the PULLEY — he swipes down on the rope, one to five pulls,
// quick or slow, sometimes still for a moment before lifting (the catch), mostly not
async function line45(K) {
  const c = await K.pg.evaluate(() => [...document.querySelectorAll('.h42 svg circle')].filter((q) => +q.getAttribute('r') === 14).map((q) => ({ x: +q.getAttribute('cx'), y: +q.getAttribute('cy') }))).catch(() => []);
  if (c.length < 2) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.2, W * 0.5), K.between(Hh * 0.4, Hh * 0.7), K.between(80, 300), K.between(-40, 40), K.between(200, 800)); K.ev('line-blind'); return; }
  const [a, b] = K.rnd() < 0.75 ? [c[0], c[1]] : [c[1], c[0]], wob = K.between(4, 45), stop = K.rnd() < 0.2 ? K.between(0.3, 0.8) : 1.05, n = Math.round(K.between(10, 22));
  await K.down(7, a.x + K.between(-10, 10), a.y + K.between(-10, 10));
  for (let i = 1; i <= n; i++) { const u = (i / n) * stop; await K.sleep(K.between(20, 90)); await K.move(7, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u + wob * Math.sin(Math.PI * Math.min(1, u)) * (K.rnd() < 0.5 ? 1 : 0.6)); }
  await K.up(7); K.ev('line', `${a === c[0] ? 'near' : 'far'} wob ${Math.round(wob)} ${stop < 1 ? 'let-go' : 'across'}`);
}
async function pulley45(K, s) {
  const [W, Hh] = K.size(), ob = s.obj && s.obj.w > 8 ? s.obj : null, x = ob ? K.between(ob.l, ob.r) : K.between(W * 0.4, W * 0.8);
  const pulls = Math.round(K.between(1, 5)), still = K.rnd() < 0.35;
  for (let k = 0; k < pulls; k++) {
    const y0 = K.between(Hh * 0.25, Hh * 0.45), dy = K.between(30, 140), steps = Math.round(K.between(3, 9));
    await K.down(7, x, y0); for (let i = 1; i <= steps; i++) { await K.sleep(K.between(15, 60)); await K.move(7, x + K.between(-3, 3), y0 + (dy * i) / steps); }
    if (still || K.rnd() < 0.2) await K.sleep(K.between(150, 700));
    await K.up(7); await K.sleep(K.between(60, 600));
  }
  K.ev('pulley', `${pulls} pulls${still ? ' still' : ''}`);
}
// ── build 46 ── stage 03, a child's way: the LATTICE — he picks a piece (any), taps it a few times or not, now and then taps twice quickly,
// and drags it toward the dashed gap (his aim a little off); the WARNING STONES — he holds one side or the other for a while and taps
// "הציבו כאן"; the PROSTRATIONS — a swipe down, slow or quick
async function lat46(K) {
  const r = await K.pg.evaluate(() => { const it = [...document.querySelectorAll('.h42 .h46-pc')].filter((b) => b.getBoundingClientRect().width > 0); const g = [...document.querySelectorAll('.h42 svg rect')].find((q) => q.getAttribute('stroke-dasharray') === '5 4'); if (!it.length || !g) return null; const b = it[Math.floor(Math.random() * it.length)].getBoundingClientRect(); let G3 = null; try { const j = globalThis.__H42 && globalThis.__H42.job(); G3 = j && j.ref && j.ref.gapAt ? j.ref.gapAt() : null; } catch (e) { G3 = null; } const real = G3 && Math.random() < 0.5; return { x: b.left + b.width / 2, y: b.top + b.height / 2, gx: real ? G3.x : +g.getAttribute('x') + +g.getAttribute('width') / 2, gy: real ? G3.y : +g.getAttribute('y') + +g.getAttribute('height') / 2 }; }).catch(() => null);   // ── build 54 ── (half the time he aims at the real lattice's gap — the big one in the world) ── /build 54 ──
  if (!r) return false;
  const taps = Math.floor(K.between(0, 4));
  for (let i = 0; i < taps; i++) { if (K.rnd() < 0.2) { await K.tap(r.x, r.y); await K.sleep(K.between(60, 160)); await K.tap(r.x, r.y); } else await K.tap(r.x, r.y); await K.sleep(K.between(380, 900)); }
  const tx = r.gx + K.between(-30, 30), ty = r.gy + K.between(-26, 26);
  await K.down(7, r.x, r.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); }
  await K.up(7); K.ev('lattice', `${taps} taps`); return true;
}
async function warn46(K) {
  const [W, Hh] = K.size(), side = K.rnd() < 0.6 ? K.between(W * 0.6, W * 0.9) : K.between(W * 0.1, W * 0.4);
  await K.hold(side, K.between(Hh * 0.4, Hh * 0.75), K.between(400, 3200)); K.ev('warn-walk');
  if (K.rnd() < 0.7) { const b = await K.pg.evaluate(() => { const e = document.querySelector('.h46-set'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }).catch(() => null); if (b) { await K.tap(b.x, b.y); K.ev('warn-set'); } }
}
async function bow46(K) {
  const [W, Hh] = K.size(), x = K.between(W * 0.3, W * 0.8), y0 = K.between(Hh * 0.2, Hh * 0.45), steps = Math.round(K.between(3, 12));
  await K.down(7, x, y0); for (let i = 1; i <= steps; i++) { await K.sleep(K.between(30, 110)); await K.move(7, x + K.between(-4, 4), y0 + (K.between(60, 140) * i) / steps); }
  await K.up(7); K.ev('bow', `${steps} steps`);
}
// ── build 47 ── stage 04, a child's way: the LIFT on two cranes — he holds and slides his finger, now toward where the bubble should go (he
// sees it: half the time), now anyhow, for one to seven seconds; the SET — a sideways drag, any length; the PIN — a swipe down, roughly
// straight; the SWING — a sideways flick, quick or slow; the WEDGE — he taps it; the NAMES — the chip dragged to a gate, any gate
async function lift47k(K) {
  const [W, Hh] = K.size(), x0 = K.between(W * 0.3, W * 0.7), y0 = K.between(Hh * 0.45, Hh * 0.8), T = K.between(1000, 7000), t0 = Date.now(); let x = x0;
  await K.down(7, x0, y0);
  while (Date.now() - t0 < T) {
    const b = await K.pg.evaluate(() => { const e = [...document.querySelectorAll('.h42 svg ellipse')][0], r = [...document.querySelectorAll('.h42 svg rect')].find((q) => +q.getAttribute('rx') === 15); if (!e || !r) return null; return { bx: +e.getAttribute('cx'), cx: +r.getAttribute('x') + +r.getAttribute('width') / 2 }; }).catch(() => null);
    if (b && K.rnd() < 0.5) x += (b.bx < b.cx ? 1 : -1) * K.between(4, 18);   // (the bubble to the left: the left end is high — he slides right, a little)
    else x += K.between(-14, 14);
    x = Math.max(8, Math.min(W - 8, x)); await K.move(7, x, y0 + K.between(-3, 3)); await K.sleep(K.between(60, 160));
  }
  await K.up(7); K.ev('lift47', `${Math.round(T / 100) / 10}s`);
}
async function names47k(K) {
  const r = await K.pg.evaluate(() => { const c = document.querySelector('.h42 .h47-name'), m = [...document.querySelectorAll('.h42 svg circle')].filter((q) => +q.getAttribute('r') === 16); if (!c || !m.length) return null; const b = c.getBoundingClientRect(), t = m[Math.floor(Math.random() * m.length)]; return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: +t.getAttribute('cx'), ty: +t.getAttribute('cy') }; }).catch(() => null);
  if (!r) return false; const tx = r.tx + K.between(-14, 14), ty = r.ty + K.between(-14, 14);
  await K.down(7, r.x, r.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); } await K.up(7); K.ev('names47'); return true;
}
// ── build 48 ── stage 05, a child's way: the LOG — he turns it, peels it, taps it, and drags it to one of the two piles (as it strikes him);
// the BEAMS — a chip to a socket, any socket, then a push roughly up; the TENON — a sideways drag; the PEG — a few taps, then he waits (or
// not); the PLANKS — the chip to the dashed line; the WALK — a long hold
// ── build 55 ── stage 08, a child's way: the STONE — he swipes it round, rubs it, or drags it to one of the two heaps (as it strikes him);
// the EDGE — a finger along the dashed line, now fast, now slow (slower once the line says "לאט"); the FIELD STONES — a tap on one, or one
// dragged to a gap (roughly), or a pebble from the heap to a gap; the LAST ROW — a stone from the heap to the altar's rim, roughly where the
// gold shows (or anywhere on the rim)
async function stone55k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'stone55') return null; const B = j.ref.box(), Z = j.ref.zones(), E = j.ref.edge ? j.ref.edge() : null, hz = document.querySelector('.h42 svg rect[data-hint]'), ln = (document.querySelector('.h42-line b') || {}).textContent || ''; return { B, Z, E, ph: j.ref.phase(), hint: hz ? hz.getAttribute('data-z') : null, says: /⬅/.test(ln) && !/➡/.test(ln) ? 'out' : /➡/.test(ln) && !/⬅/.test(ln) ? 'altar' : null }; }).catch(() => null);
  if (!g || !g.B) return false; const B = g.B, r = K.rnd();
  if (g.ph === 'feel' && g.E) { const E = g.E, slow = /לאט/.test(await K.pg.evaluate(() => (document.querySelector('.h42-line') || {}).textContent || '').catch(() => '')) ? 0.75 : 0.45, u0 = K.between(0, 0.3), u1 = K.between(0.6, 1), T = K.rnd() < slow ? K.between(1200, 3200) : K.between(250, 900); await K.swipe(E.a.x + (E.b.x - E.a.x) * u0, E.a.y + (E.b.y - E.a.y) * u0 + K.between(-12, 12), (E.b.x - E.a.x) * (u1 - u0), (E.b.y - E.a.y) * (u1 - u0) + K.between(-10, 10), T); K.ev('nail-slide', `${Math.round(T)}ms`); return true; }
  if (r < 0.35) { await K.swipe(B.cx + K.between(-B.w * 0.2, B.w * 0.2), B.cy + K.between(-B.h * 0.2, B.h * 0.2), (K.rnd() < 0.5 ? -1 : 1) * K.between(B.w * 0.25, B.w * 0.6), K.between(-12, 12), K.between(120, 500)); K.ev('stone-turn'); }
  else if (r < 0.55) { const id = 7; await K.down(id, B.cx, B.cy); for (let i = 0; i < 20; i++) { await K.sleep(K.between(25, 60)); await K.move(id, B.cx + Math.sin(i * 0.9) * B.w * K.between(0.15, 0.35), B.cy + K.between(-10, 10)); } await K.up(id); K.ev('stone-rub'); }
  else { const seen = g.hint || g.says, z = seen && K.rnd() < 0.6 ? g.Z[seen] : K.rnd() < 0.5 ? g.Z.altar : g.Z.out;   /* (the glowing heap at level 1, or the one line's lone arrow: he goes there 60 % of the time) */ await K.swipe(B.cx + K.between(-20, 20), B.cy + K.between(-15, 15), z.x + z.w / 2 - B.cx + K.between(-25, 25), z.y + z.h / 2 - B.cy + K.between(-20, 20), K.between(300, 900)); K.ev('stone-' + (z === g.Z.altar ? 'altar' : 'out')); }
  return true;
}
async function field55k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'field55') return null; const s0 = j.ref.J.state(); return { st: j.ref.stones().filter((x) => !x.placed && x.p).map((x) => Object.assign(x, { shape: s0.stones[x.i].shape, rot: s0.stones[x.i].rot })), gp: j.ref.gaps().filter((x) => x.p).map((x) => Object.assign(x, { shape: s0.gaps[x.g].shape, rot: s0.gaps[x.g].rot })), f: j.ref.fillAt(), L: s0.L }; }).catch(() => null);
  if (!g || !g.gp.length) return false; const r = K.rnd();
  if (g.L <= 1 && g.st.length && K.rnd() < 0.5) {   // (level 1: the gold shadow in each gap shows its stone and its turn — half the time he matches what he sees)
    const s = g.st[Math.floor(K.rnd() * g.st.length)], t2 = g.gp.find((x) => x.shape === s.shape && x.open);
    if (t2 && s.rot !== t2.rot) { await K.tap(s.p.x + K.between(-8, 8), s.p.y + K.between(-6, 6)); K.ev('field-tap-seen'); return true; }
    if (t2) { const id = 7; await K.down(id, s.p.x, s.p.y); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, s.p.x + ((t2.p.x - s.p.x) * i) / 12 + K.between(-5, 5), s.p.y + ((t2.p.y - s.p.y) * i) / 12 + K.between(-5, 5)); } await K.up(id); K.ev('field-drag-seen'); return true; }
  }
  if (g.st.length && r < 0.35) { const s = g.st[Math.floor(K.rnd() * g.st.length)]; await K.tap(s.p.x + K.between(-10, 10), s.p.y + K.between(-8, 8)); K.ev('field-tap'); return true; }
  const t = g.gp[Math.floor(K.rnd() * g.gp.length)];
  if (g.st.length && r < 0.85) { const s = g.st[Math.floor(K.rnd() * g.st.length)]; const id = 7; await K.down(id, s.p.x, s.p.y); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, s.p.x + ((t.p.x - s.p.x) * i) / 12 + K.between(-6, 6), s.p.y + ((t.p.y - s.p.y) * i) / 12 + K.between(-6, 6)); } await K.up(id); K.ev('field-drag'); return true; }
  if (g.f) { const id = 7; await K.down(id, g.f.x, g.f.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 60)); await K.move(id, g.f.x + ((t.p.x - g.f.x) * i) / 10, g.f.y + ((t.p.y - g.f.y) * i) / 10); } await K.up(id); K.ev('field-fill'); return true; }
  return false;
}
async function last55k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'last55') return null; const R = j.ref, op = R.J.open(); return { hp: R.heapAt(), slots: op.map((s) => R.slotAt(s.id)).filter(Boolean), rim: [[16, 31.6], [31.6, 16], [10, 0.5], [0.5, 20], [24, 31.6], [31.6, 26]].map(([x, z]) => R.rimAt(x, z)).filter(Boolean) }; }).catch(() => null);
  if (!g || !g.hp) return false; const pool = K.rnd() < 0.6 && g.slots.length ? g.slots : g.rim, t = pool[Math.floor(K.rnd() * pool.length)]; if (!t) return false;
  const id = 7; await K.down(id, g.hp.x + K.between(-12, 12), g.hp.y + K.between(-10, 10)); for (let i = 1; i <= 14; i++) { await K.sleep(K.between(25, 60)); await K.move(id, g.hp.x + ((t.x - g.hp.x) * i) / 14 + K.between(-8, 8), g.hp.y + ((t.y - g.hp.y) * i) / 14 + K.between(-8, 8)); } await K.up(id); K.ev('last-drag'); return true;
}
// ── build 56 ── stage 09, a child's way: the LAMP — its handle dragged along some of the arc (one side or both), or the stone swiped, or the
// stone carried to a heap (the line's lone arrow: 60 %); the MALLET — a tap on the witness or on the new stone (the line's word: 60 %), then
// the heap by the rings he saw (60 %); the COURSE — a stone from the pallet to roughly its place, then a drag on it along the arrow he sees
// (60 %), any length; the THREAD — the peg's handle dragged up or down, to the gold he sees (60 %), then a pull on the thread, any way
async function lamp56k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'stone55' || j.ref.mode !== 'lamp') return null; const R = j.ref, ln = (document.querySelector('.h42-line b') || {}).textContent || ''; return { B: R.box(), Z: R.zones(), lamp: R.lampAt(), arc: [-1.35, -1, -0.5, 0, 0.5, 1, 1.35].map((t) => R.lampTo(t)), says: /⬅/.test(ln) && !/➡/.test(ln) ? 'out' : /➡/.test(ln) && !/⬅/.test(ln) ? 'altar' : null }; }).catch(() => null);
  if (!g || !g.B || !g.lamp) return false; const r = K.rnd(), B = g.B;
  if (r < 0.55) { const a = g.arc.filter(Boolean), side = K.rnd(), pts = side < 0.35 ? a.slice(0, 4).reverse() : side < 0.7 ? a.slice(3) : a.slice().reverse().concat(a); const id = 7; await K.down(id, g.lamp.x + K.between(-12, 12), g.lamp.y + K.between(-12, 12)); for (const p of pts) { for (let i = 0; i < 3; i++) { await K.sleep(K.between(30, 90)); await K.move(id, p.x + K.between(-14, 14), p.y + K.between(-14, 14)); } } await K.up(id); K.ev('lamp-drag', `${pts.length}`); return true; }
  if (r < 0.7) { await K.swipe(B.cx + K.between(-B.w * 0.2, B.w * 0.2), B.cy, (K.rnd() < 0.5 ? -1 : 1) * K.between(B.w * 0.25, B.w * 0.6), K.between(-12, 12), K.between(120, 500)); K.ev('lamp-swipe'); return true; }
  const z = g.says && K.rnd() < 0.6 ? g.Z[g.says] : K.rnd() < 0.5 ? g.Z.altar : g.Z.out; await K.swipe(B.cx + K.between(-20, 20), B.cy + K.between(-15, 15), z.x + z.w / 2 - B.cx + K.between(-25, 25), z.y + z.h / 2 - B.cy + K.between(-20, 20), K.between(300, 900)); K.ev('lamp-' + (z === g.Z.altar ? 'altar' : 'out')); return true;
}
async function tap56k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'stone55' || j.ref.mode !== 'tap') return null; const R = j.ref, ln = (document.querySelector('.h42-line b') || {}).textContent || ''; return { B: R.box(), Z: R.zones(), w: R.witAt(), t: R.taps(), wave: R.lastWave, ln }; }).catch(() => null);
  if (!g || !g.B) return false; const B = g.B, r = K.rnd();
  if (!g.t.n || r < 0.25) { const toW = /העדות/.test(g.ln) || !g.t.w ? K.rnd() < 0.6 : K.rnd() < 0.3, p = toW && g.w ? g.w : { x: B.cx, y: B.cy }; await K.tap(p.x + K.between(-14, 14), p.y + K.between(-12, 12)); K.ev(toW ? 'tap-witness' : 'tap-new'); return true; }
  const seen = g.wave === 'short' ? 'out' : g.wave === 'long' ? 'altar' : null, z = seen && K.rnd() < 0.6 ? g.Z[seen] : K.rnd() < 0.5 ? g.Z.altar : g.Z.out;
  await K.swipe(B.cx + K.between(-20, 20), B.cy + K.between(-15, 15), z.x + z.w / 2 - B.cx + K.between(-25, 25), z.y + z.h / 2 - B.cy + K.between(-20, 20), K.between(300, 900)); K.ev('tap-' + (z === g.Z.altar ? 'altar' : 'out')); return true;
}
async function course56k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'course56') return null; const R = j.ref, s0 = j.s, ar = [...document.querySelectorAll('.h42 svg text')].find((q) => /^[⬅➡]$/.test(q.textContent.trim())); return { cur: s0.cur, pal: R.palAt(), slot: R.slotAt(), at: R.curAt(), arrow: ar ? ar.textContent.trim() : null }; }).catch(() => null);
  if (!g) return false; const [W, Hh] = K.size(), id = 7;
  if (g.cur < 0) { if (!g.pal) return false; const t = g.slot && K.rnd() < 0.7 ? { x: g.slot.x + K.between(-35, 35), y: g.slot.y + K.between(-25, 25) } : { x: K.between(W * 0.2, W * 0.8), y: K.between(Hh * 0.2, Hh * 0.7) }; await K.down(id, g.pal.x + K.between(-15, 15), g.pal.y + K.between(-12, 12)); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, g.pal.x + ((t.x - g.pal.x) * i) / 12 + K.between(-6, 6), g.pal.y + ((t.y - g.pal.y) * i) / 12 + K.between(-6, 6)); } await K.up(id); K.ev('course-drag'); return true; }
  if (!g.at) return false; const dir = g.arrow && K.rnd() < 0.6 ? (g.arrow === '⬅' ? -1 : 1) : K.rnd() < 0.5 ? -1 : 1, len = K.between(25, 170);
  await K.swipe(g.at.x + K.between(-20, 20), g.at.y + K.between(-12, 12), dir * len, K.between(-15, 15), K.between(200, 900)); K.ev('course-push', `${dir < 0 ? 'L' : 'R'} ${Math.round(len)}`); return true;
}
async function thread56k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'thread56') return null; const R = j.ref, s0 = j.s, P = R.pegsAt(), band = [...document.querySelectorAll('.h42 svg rect')].find((q) => /255,214,110,.28/.test(q.getAttribute('fill') || '')), sh = [...document.querySelectorAll('.h42 svg circle')].find((q) => q.getAttribute('stroke-dasharray') === '5 4'); return { step: s0.step, l: P.l, r: P.r, band: band ? { y: +band.getAttribute('y') + +band.getAttribute('height') / 2 } : null, sh: sh ? { y: +sh.getAttribute('cy') } : null }; }).catch(() => null);
  if (!g || !g.l || !g.r) return false; const [, Hh] = K.size(), id = 7;
  if (g.step === 1 || g.step === 2) { const p = g.step === 1 ? g.l : g.r, aim = g.step === 1 ? g.band : g.sh, ty = aim && K.rnd() < 0.6 ? aim.y + K.between(-10, 10) : K.between(Hh * 0.15, Hh * 0.75), n = Math.round(K.between(6, 14));
    await K.down(id, p.x + K.between(-14, 14), p.y + K.between(-12, 12)); for (let i = 1; i <= n; i++) { await K.sleep(K.between(25, 70)); await K.move(id, p.x + K.between(-6, 6), p.y + ((ty - p.y) * i) / n); } await K.up(id); K.ev('peg-' + (g.step === 1 ? 'l' : 'r')); return true; }
  const mx = (g.l.x + g.r.x) / 2 + K.between(-60, 60), my = (g.l.y + g.r.y) / 2 + K.between(-10, 10), a = K.rnd() * Math.PI * 2, len = K.between(15, 120);
  await K.swipe(mx, my, Math.cos(a) * len, Math.sin(a) * len, K.between(150, 700)); K.ev('thread-pull', `${Math.round(len)}`); return true;
}
async function wood48k(K) {
  const g = await K.pg.evaluate(() => { const r = [...document.querySelectorAll('.h42 svg rect')].find((q) => +q.getAttribute('rx') > 25 && +q.getAttribute('width') > 150); const z = [...document.querySelectorAll('.h42 svg rect[data-z]')].map((q) => ({ k: q.getAttribute('data-z'), x: +q.getAttribute('x') + +q.getAttribute('width') / 2, y: +q.getAttribute('y') + +q.getAttribute('height') / 2 })); return r ? { x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height'), z } : null; }).catch(() => null);
  if (!g) return false; const cx = g.x + g.w / 2, cy = g.y + g.h / 2, r = K.rnd();
  if (r < 0.3) { await K.swipe(cx + K.between(-g.w * 0.3, g.w * 0.3), cy, K.between(-8, 8), (K.rnd() < 0.5 ? -1 : 1) * K.between(30, 90), K.between(120, 400)); K.ev('log-turn'); }
  else if (r < 0.52) { await K.swipe(g.x + g.w * K.between(0.1, 0.4), cy + K.between(-g.h * 0.3, g.h * 0.3), K.between(60, g.w * 0.6), K.between(-10, 10), K.between(150, 600)); K.ev('log-peel'); }
  else if (r < 0.65) { await K.tap(g.x + K.between(0.1, 0.9) * g.w, cy + K.between(-g.h * 0.3, g.h * 0.3)); K.ev('log-mark'); }
  else if (g.z.length) { const z = g.z[Math.floor(K.rnd() * g.z.length)]; await K.swipe(cx, cy, z.x - cx + K.between(-20, 20), z.y - cy + K.between(-14, 14), K.between(300, 900)); K.ev('log-' + z.k); }
  return true;
}
async function beam48k(K) {
  const r = await K.pg.evaluate(() => { const c = [...document.querySelectorAll('.h42 .h48-beam, .h42 .h48-plank')].filter((b) => b.style.display !== 'none' && b.getBoundingClientRect().width > 0); const m = [...document.querySelectorAll('.h42 svg rect')].filter((q) => +q.getAttribute('width') === 24); const ln = document.querySelector('.h42 svg line'); if (!c.length) return null; const b = c[Math.floor(Math.random() * c.length)].getBoundingClientRect(), t = m.length ? m[Math.floor(Math.random() * m.length)] : null; return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: t ? +t.getAttribute('x') + 12 : ln ? (+ln.getAttribute('x1') + +ln.getAttribute('x2')) / 2 : innerWidth / 2, ty: t ? +t.getAttribute('y') + 14 : ln ? (+ln.getAttribute('y1') + +ln.getAttribute('y2')) / 2 : innerHeight / 2 }; }).catch(() => null);
  if (!r) return false; const tx = r.tx + K.between(-16, 16), ty = r.ty + K.between(-16, 16);
  await K.down(7, r.x, r.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); } await K.up(7); K.ev('beam-chip'); return true;
}
// ── build 49 ── stage 06, a child's way: the STORM — two thumbs, as the rings show: the right one down (now and then lifted, forgotten), the
// left one sliding — now the way the yellow arrow points (he sees it: 60 %), now anyhow — for three to ten seconds; the LEVER — a swipe down
// of any length, and when the line says "הקישו" a tap (late or not); the STEPS — the chip dragged to the gold arc, roughly
async function storm49k(K) {
  const [W, Hh] = K.size(), lx0 = K.between(W * 0.1, W * 0.3), ly = K.between(Hh * 0.5, Hh * 0.8), rx = K.between(W * 0.7, W * 0.92), ry = K.between(Hh * 0.5, Hh * 0.8), T = K.between(3000, 10000), t0 = Date.now();
  let lx = lx0, right = K.rnd() < 0.85, left = K.rnd() < 0.9;
  if (right) await K.down(4, rx, ry); if (left) { await K.sleep(K.between(50, 700)); await K.down(3, lx, ly); }
  while (Date.now() - t0 < T) {
    const a = await K.pg.evaluate(() => { const t = [...document.querySelectorAll('.v49 svg text')].find((q) => /⇦|⇨/.test(q.textContent)); return t ? (t.textContent.includes('⇦') ? -1 : 1) : 0; }).catch(() => 0);
    if (left) { if (a && K.rnd() < 0.6) lx += a * K.between(6, 26); else lx += K.between(-18, 18); lx = Math.max(6, Math.min(W / 2 - 6, lx)); await K.move(3, lx, ly + K.between(-3, 3)); }
    if (right) await K.move(4, rx + K.between(-2, 2), ry);
    if (right && K.rnd() < 0.02) { await K.up(4); right = false; K.ev('storm-right-off'); } else if (!right && K.rnd() < 0.15) { await K.down(4, rx, ry); right = true; }
    if (!left && K.rnd() < 0.1) { await K.down(3, lx, ly); left = true; }
    await K.sleep(K.between(70, 180));
  }
  await K.liftAll(); K.ev('storm49', `${Math.round(T / 100) / 10}s`);
}
async function lever49k(K, L) {
  const [W, Hh] = K.size();
  if (/הקישו/.test(L)) { await K.sleep(K.between(150, 1400)); await K.tap(K.between(W * 0.3, W * 0.7), K.between(Hh * 0.3, Hh * 0.7)); K.ev('lever-tap'); return; }
  await K.swipe(K.between(W * 0.3, W * 0.8), K.between(Hh * 0.15, Hh * 0.45), K.between(-30, 30), K.between(30, Hh * 0.5), K.between(150, 700)); K.ev('lever-drag');
}
async function steps49k(K) {
  const r = await K.pg.evaluate(() => { const c = document.querySelector('.h42 .h49-step'), pl = [...document.querySelectorAll('.h42 svg polyline')].pop(); if (!c || !pl) return null; const pts = pl.getAttribute('points').split(' ').map((p) => p.split(',').map(Number)), q = pts[Math.floor(Math.random() * pts.length)], b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: q[0], ty: q[1] }; }).catch(() => null);
  if (!r) return false; const tx = r.tx + K.between(-22, 22), ty = r.ty + K.between(-22, 22);
  await K.down(7, r.x, r.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); } await K.sleep(K.between(0, 300)); await K.up(7); K.ev('step49'); return true;
}
// ── build 50 ── stage 07, a child's way: the COMPASS — he holds the gold ring for a while (or not long enough), then runs his finger round,
// along the dashed guide when he sees it (60 %), else in a circle of his own; the BENCHES — the chip to the gold arc, roughly; the HUB — a
// sideways drag (now the way the arrow points), or the spoke chip to the triangle; the WHEEL — a hold of his own length; the DOME — a stone
// ── build 57 ── stage 10, a child's way: the STONE with every tool — he swipes it round, rubs it, taps it or the witness, slides along the
// dashed edge (now slow, now fast), or carries it to a heap (the line's lone arrow: 60 %); the KEVESH — a stone from the pallet to roughly the
// next row (the dashed ring he sees at level 1: 60 %), then a small ⬍ (the arrow he sees: 60 %), any length, and let go; the WHITEWASH — strokes
// across the face at any pace (where it is still grey: 60 %), now and then a slow one or a quick swipe
async function decoy57k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'stone55' || j.ref.mode !== 'all') return null; const R = j.ref, ln = (document.querySelector('.h42-line b') || {}).textContent || ''; return { B: R.box(), Z: R.zones(), E: R.edge(), w: R.witAt(), says: /⬅/.test(ln) && !/➡/.test(ln) ? 'out' : /➡/.test(ln) && !/⬅/.test(ln) ? 'altar' : null }; }).catch(() => null);
  if (!g || !g.B) return false; const B = g.B, r = K.rnd();
  if (r < 0.2) { await K.swipe(B.cx + K.between(-B.w * 0.2, B.w * 0.2), B.cy + K.between(0, B.h * 0.25), (K.rnd() < 0.5 ? -1 : 1) * K.between(B.w * 0.25, B.w * 0.6), K.between(-12, 12), K.between(120, 500)); K.ev('decoy-turn'); return true; }
  if (r < 0.4) { const id = 7; await K.down(id, B.cx, B.cy + B.h * 0.1); for (let i = 0; i < 22; i++) { await K.sleep(K.between(25, 60)); await K.move(id, B.cx + Math.sin(i * 0.9) * B.w * K.between(0.15, 0.35), B.cy + B.h * 0.1 + K.between(-10, 10)); } await K.up(id); K.ev('decoy-rub'); return true; }
  if (r < 0.55) { const p = g.w && K.rnd() < 0.4 ? g.w : { x: B.cx, y: B.cy }; await K.tap(p.x + K.between(-14, 14), p.y + K.between(-12, 12)); K.ev(p === g.w ? 'decoy-tap-witness' : 'decoy-tap'); return true; }
  if (r < 0.68 && g.E) { const E = g.E, u0 = K.between(0, 0.25), u1 = K.between(0.7, 1), T = K.rnd() < 0.55 ? K.between(1600, 3600) : K.between(250, 900); await K.swipe(E.a.x + (E.b.x - E.a.x) * u0, E.a.y + (E.b.y - E.a.y) * u0 + K.between(-8, 8), (E.b.x - E.a.x) * (u1 - u0), (E.b.y - E.a.y) * (u1 - u0) + K.between(-8, 8), T); K.ev('decoy-edge', `${Math.round(T)}ms`); return true; }
  const z = g.says && K.rnd() < 0.6 ? g.Z[g.says] : K.rnd() < 0.5 ? g.Z.altar : g.Z.out; await K.swipe(B.cx + K.between(-20, 20), B.cy + K.between(-15, 15), z.x + z.w / 2 - B.cx + K.between(-25, 25), z.y + z.h / 2 - B.cy + K.between(-20, 20), K.between(300, 900)); K.ev('decoy-' + (z === g.Z.altar ? 'altar' : 'out')); return true;
}
async function kevesh57k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'kevesh57') return null; const R = j.ref, ring = document.querySelector('.h42 svg circle[data-slot]'); return { pal: R.palAt(), slot: R.slotAt(), ring: ring ? { x: +ring.getAttribute('cx'), y: +ring.getAttribute('cy') } : null, gear: R.gear() }; }).catch(() => null);
  if (!g || !g.pal) return false; const [W, Hh] = K.size(), id = 7, aim = g.ring && K.rnd() < 0.6 ? g.ring : g.slot && K.rnd() < 0.5 ? g.slot : { x: K.between(W * 0.3, W * 0.9), y: K.between(Hh * 0.15, Hh * 0.6) };
  const tx = aim.x + K.between(-30, 30), ty = aim.y + K.between(-30, 30);
  await K.down(id, g.pal.x + K.between(-14, 14), g.pal.y + K.between(-12, 12)); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, g.pal.x + ((tx - g.pal.x) * i) / 12 + K.between(-5, 5), g.pal.y + ((ty - g.pal.y) * i) / 12 + K.between(-5, 5)); }
  await K.sleep(K.between(150, 500)); let y = ty;
  for (let t = 0; t < 3; t++) { const ar = await K.pg.evaluate(() => { const a = [...document.querySelectorAll('.h42 svg text')].find((q) => /^[⬆⬇]$/.test(q.textContent.trim())); return a ? a.textContent.trim() : null; }).catch(() => null); if (!ar || K.rnd() > 0.6) break; const dy = (ar === '⬇' ? 1 : -1) * K.between(6, 45); for (let i = 1; i <= 4; i++) { await K.sleep(K.between(30, 70)); await K.move(id, tx + K.between(-3, 3), y + (dy * i) / 4); } y += dy; await K.sleep(K.between(150, 400)); }
  await K.up(id); K.ev('kevesh-lay'); return true;
}
async function sid57k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'sid57') return null; const R = j.ref; return { fb: R.faceBox(), row: R.gapRow() }; }).catch(() => null);
  if (!g || !g.fb) return false; const fb = g.fb, y = K.rnd() < 0.6 ? fb.t + fb.h * g.row + K.between(-12, 12) : K.between(fb.t + 8, fb.b - 8), x0 = K.between(fb.l, fb.l + fb.w * 0.3), x1 = K.between(fb.r - fb.w * 0.3, fb.r), r = K.rnd(), T = r < 0.12 ? K.between(3000, 6000) : r < 0.25 ? K.between(80, 160) : K.between(500, 1800), rev = K.rnd() < 0.5;
  await K.swipe(rev ? x1 : x0, y, rev ? x0 - x1 : x1 - x0, K.between(-20, 20), T); K.ev('sid-stroke', `${Math.round(T)}ms`); return true;
}
// ── build 58 ── stage 11, a child's way: the HORN — dragged toward the corner (the gold shadow he sees: 60 %), or turned round its ring, or
// twisted with two fingers (the way the ring's arrow shows: 60 %), any amount, stopping when the ring or both faces glow green (60 %); the WOOD — a ringed log
// (level 1's gold or red ring he sees: 60 %) where its ring says; the JUG — its handle dragged along the arc to a point (the gold mark he sees: 60 %), held a while, let
// go; the WOOD — a log from the pile to the right (the gold place he sees: 60 %) or to the left, any; the torch when it glows
// ── build 59 ── stage 12, a child's way: the FURNACE — its handle along the arc to a point (the gold mark he sees: 60 %) and held, till he
// sees the bronze reach the gold line on the gauge (60 %) or for a while of his own; the SPIGOT — round its dial the way its arrow shows
// (60 %), any amount, stopping at the green click he sees (60 %); the ROPE — drags ⬆ now slow, now quick (slow when the line says "לאט": 60 %)
async function pour59k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || !/^(cast59|spigots59)$/.test(j.kind)) return null; const R = j.ref, m = document.querySelector('.h42 svg circle[data-safe59]'); return { h: R.arcAt(R.tilt()), arc: [0.25, 0.45, 0.65, 0.85, 1].map((u) => (R.arcPos ? R.arcPos(u) : R.arcAt(u))), mark: m ? { x: +m.getAttribute('cx'), y: +m.getAttribute('cy') } : null }; }).catch(() => null);
  if (!g || !g.h) return false; const aim = g.mark && K.rnd() < 0.6 ? g.mark : g.arc[Math.floor(K.rnd() * g.arc.length)]; if (!aim) return false; const id = 7, watch = K.rnd() < 0.6;
  await K.down(id, g.h.x + K.between(-10, 10), g.h.y + K.between(-10, 10)); for (let i = 1; i <= 8; i++) { await K.sleep(K.between(30, 70)); await K.move(id, g.h.x + ((aim.x - g.h.x) * i) / 8 + K.between(-5, 5), g.h.y + ((aim.y - g.h.y) * i) / 8 + K.between(-5, 5)); }
  const T = K.between(500, 4500), t0 = Date.now(); let saw = false;
  while (Date.now() - t0 < T) { await K.sleep(120); if (!watch) continue; const at = await K.pg.evaluate(() => { const f = document.querySelector('.h42 svg rect[data-fill59]'), l = document.querySelector('.h42 svg line[data-line59]'); return f && l ? { top: +f.getAttribute('y'), line: +l.getAttribute('y1') } : null; }).catch(() => null); if (at && at.top <= at.line + 3) { saw = true; break; } }
  await K.up(id); K.ev('furnace-pour', `${Date.now() - t0}ms${saw ? ' at-line' : ''}`); return true;
}
async function screw59k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'screw59') return null; const R = j.ref, tu = document.querySelector('.h42 svg text[data-turn59]'); return { h: R.head(), r: R.dialR(), turn: tu ? tu.getAttribute('data-turn59') : null }; }).catch(() => null);
  if (!g || !g.h) return false; const sg = g.turn && K.rnd() < 0.6 ? (g.turn === 'cw' ? 1 : -1) : K.rnd() < 0.7 ? 1 : -1, watch = K.rnd() < 0.6, total = K.between(1.5, 9), n = Math.max(6, Math.ceil(total / 0.22)), dial = () => K.pg.evaluate(() => { const c = document.querySelector('.h42 svg circle[data-dial59]'); return c ? c.getAttribute('data-dial59') : null; }).catch(() => null);
  let a = K.between(-Math.PI, Math.PI), stopped = false; const R0 = g.r * K.between(0.8, 1.15); await K.down(7, g.h.x + Math.cos(a) * R0, g.h.y + Math.sin(a) * R0);
  for (let i = 1; i <= n; i++) { await K.sleep(K.between(25, 60)); a += (sg * total) / n; await K.move(7, g.h.x + Math.cos(a) * R0 + K.between(-4, 4), g.h.y + Math.sin(a) * R0 + K.between(-4, 4)); if (watch) { const d = await dial(); if ((sg > 0 && d === 'lock') || (sg < 0 && g.turn === 'ccw' && d !== 'tight')) { stopped = true; break; } } }
  await K.up(7); K.ev('screw-turn', `${Math.round((sg * total * 180) / Math.PI)}°${stopped ? ' saw' : ''}`); return true;
}
async function mukhni59k(K, L) {
  const ok = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); return !!(j && j.kind === 'mukhni59'); }).catch(() => false); if (!ok) return false;
  const [W, Hh] = K.size(), slow = /לאט/.test(L || '') && K.rnd() < 0.6 ? true : K.rnd() < 0.5, dy = K.between(Hh * 0.15, Hh * 0.6), T = slow ? K.between(700, 1800) : K.between(120, 500);
  await K.swipe(K.between(W * 0.3, W * 0.9), K.between(Hh * 0.62, Hh * 0.92), K.between(-20, 20), -dy, T); K.ev('rope-pull', `${Math.round(T)}ms`); return true;
}
async function horns58k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'horns58') return null; const R = j.ref, tu = document.querySelector('.h42 svg text[data-turn58]'); return { h: R.hornAt(), t: R.targetAt(), r: R.ringR(), turn: tu ? tu.getAttribute('data-turn58') : null }; }).catch(() => null);
  if (!g || !g.h) return false; const r = K.rnd(), id = 7;
  if (r < 0.45 && g.t) { const aim = K.rnd() < 0.6 ? g.t : { x: g.h.x + K.between(-120, 120), y: g.h.y + K.between(-80, 80) }; await K.down(id, g.h.x + K.between(-12, 12), g.h.y + K.between(-10, 10)); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, g.h.x + ((aim.x - g.h.x) * i) / 12 + K.between(-6, 6), g.h.y + ((aim.y - g.h.y) * i) / 12 + K.between(-6, 6)); } await K.up(id); K.ev('horn-drag'); return true; }
  // a turn: the way the ring's arrow shows (60 %) or his own; any amount — but he sees the faces glow and, 60 % of the time, stops when both are green
  const sg = g.turn && K.rnd() < 0.6 ? (g.turn === 'cw' ? 1 : -1) : K.rnd() < 0.5 ? 1 : -1, watch = K.rnd() < 0.6, green = () => K.pg.evaluate(() => { const e = [...document.querySelectorAll('.h42 svg line[data-edge58]')].map((q) => q.getAttribute('data-edge58')), rg = document.querySelector('.h42 svg circle[data-ring58]'); return (e.length === 2 && e.every((x) => x.endsWith('1'))) || (!!rg && rg.getAttribute('data-ring58') === 'sq'); }).catch(() => false);
  let stopped = false;
  if (r < 0.8) { const a0 = K.between(-1.5, 0.5), da = sg * K.between(0.15, 1.2), n = 14; await K.down(id, g.h.x + Math.cos(a0) * g.r, g.h.y + Math.sin(a0) * g.r); for (let i = 1; i <= n; i++) { await K.sleep(K.between(30, 70)); const a = a0 + (da * i) / n; await K.move(id, g.h.x + Math.cos(a) * g.r + K.between(-3, 3), g.h.y + Math.sin(a) * g.r + K.between(-3, 3)); if (watch && (await green())) { stopped = true; break; } } await K.up(id); K.ev('horn-ring', `${Math.round((da * 180) / Math.PI)}°${stopped ? ' green' : ''}`); return true; }
  const a0 = K.between(0, 3), da = sg * K.between(0.1, 0.9), R0 = K.between(35, 70), n = 14; await K.down(7, g.h.x + Math.cos(a0) * R0, g.h.y + Math.sin(a0) * R0); await K.down(8, g.h.x - Math.cos(a0) * R0, g.h.y - Math.sin(a0) * R0);
  for (let i = 1; i <= n; i++) { await K.sleep(K.between(30, 70)); const a = a0 + (da * i) / n; await K.move(7, g.h.x + Math.cos(a) * R0, g.h.y + Math.sin(a) * R0); await K.move(8, g.h.x - Math.cos(a) * R0, g.h.y - Math.sin(a) * R0); if (watch && (await green())) { stopped = true; break; } }
  await K.up(8); await K.sleep(40); await K.up(7); K.ev('horn-twist', `${Math.round((da * 180) / Math.PI)}°${stopped ? ' green' : ''}`); return true;
}
async function holes58k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'holes58') return null; const R = j.ref, m = document.querySelector('.h42 svg circle[data-safe58]'); return { h: R.arcAt(R.tilt()), arc: [0.2, 0.4, 0.6, 0.8, 1].map((t) => R.arcAt(t)), mark: m ? { x: +m.getAttribute('cx'), y: +m.getAttribute('cy') } : null }; }).catch(() => null);
  if (!g || !g.h) return false; const aim = g.mark && K.rnd() < 0.6 ? g.mark : g.arc[Math.floor(K.rnd() * g.arc.length)]; if (!aim) return false; const id = 7;
  await K.down(id, g.h.x + K.between(-10, 10), g.h.y + K.between(-10, 10)); for (let i = 1; i <= 8; i++) { await K.sleep(K.between(30, 70)); await K.move(id, g.h.x + ((aim.x - g.h.x) * i) / 8 + K.between(-5, 5), g.h.y + ((aim.y - g.h.y) * i) / 8 + K.between(-5, 5)); }
  const hold = K.between(400, 3500); await K.sleep(hold); await K.up(id); K.ev('jug-pour', `${Math.round(hold)}ms`); return true;
}
async function pyre58k(K) {
  const g = await K.pg.evaluate(() => { const j = globalThis.__H42 && globalThis.__H42.job(); if (!j || j.kind !== 'pyre58') return null; const R = j.ref, ln = (document.querySelector('.h42-line b') || {}).textContent || ''; const pk = {}; for (const c of document.querySelectorAll('.h42 svg circle[data-pick58]')) pk[c.getAttribute('data-log58')] = c.getAttribute('data-pick58'); return { logs: R.logsAt().filter((x) => x.at === 'pile' && x.p).map((x) => Object.assign(x, { pick: pk[x.i] || null })), slot: R.slotAt(), torch: R.J.ready() ? R.torchAt() : null, Z: R.zones(), says: /⬅/.test(ln) && !/➡/.test(ln) ? 'out' : null }; }).catch(() => null);
  if (!g) return false; if (g.torch) { await K.tap(g.torch.x + K.between(-12, 12), g.torch.y + K.between(-10, 10)); K.ev('pyre-torch'); return true; }
  if (!g.logs.length) return false; const pks = g.logs.filter((x) => x.pick), seen = pks.length && K.rnd() < 0.6, lg = seen ? pks[Math.floor(K.rnd() * pks.length)] : g.logs[Math.floor(K.rnd() * g.logs.length)], toOut = seen ? lg.pick === 'out' : g.says ? K.rnd() < 0.6 : K.rnd() < 0.3, t = toOut ? { x: g.Z.out.x + g.Z.out.w / 2, y: g.Z.out.y + g.Z.out.h / 2 } : g.slot && K.rnd() < 0.6 ? g.slot : { x: g.Z.altar.x + K.between(0, g.Z.altar.w), y: g.Z.altar.y + K.between(0, g.Z.altar.h) }, id = 7;
  await K.down(id, lg.p.x + K.between(-10, 10), lg.p.y + K.between(-8, 8)); for (let i = 1; i <= 12; i++) { await K.sleep(K.between(25, 60)); await K.move(id, lg.p.x + ((t.x - lg.p.x) * i) / 12 + K.between(-6, 6), lg.p.y + ((t.y - lg.p.y) * i) / 12 + K.between(-6, 6)); } await K.up(id); K.ev('pyre-' + (toOut ? 'out' : 'in')); return true;
}
// chip, any of the three, to a dashed ring; the WEDGES — taps
async function compass50k(K) {
  const g = await K.pg.evaluate(() => { const c = [...document.querySelectorAll('.h42 svg circle')].find((q) => +q.getAttribute('r') === 26); const pl = [...document.querySelectorAll('.h42 svg polyline')].pop(); return { c: c ? { x: +c.getAttribute('cx'), y: +c.getAttribute('cy') } : null, pts: pl ? pl.getAttribute('points').split(' ').map((p) => p.split(',').map(Number)) : null }; }).catch(() => null);
  if (!g) return false; const [W, Hh] = K.size();
  if (g.c) { await K.hold(g.c.x + K.between(-12, 12), g.c.y + K.between(-12, 12), K.between(200, 1600)); K.ev('compass-hold'); return true; }
  const T = K.between(1500, 6000), t0 = Date.now();
  if (g.pts && g.pts.length > 8 && K.rnd() < 0.6) { let i = Math.floor(K.rnd() * g.pts.length); await K.down(7, g.pts[i][0], g.pts[i][1]); while (Date.now() - t0 < T) { i = (i + 1) % g.pts.length; await K.move(7, g.pts[i][0] + K.between(-14, 14), g.pts[i][1] + K.between(-14, 14)); await K.sleep(K.between(40, 120)); } await K.up(7); K.ev('compass-guide'); return true; }
  const cx = W / 2 + K.between(-40, 40), cy = Hh / 2 + K.between(-30, 30), r = K.between(50, Hh * 0.4); let a = K.rnd() * 6.28; await K.down(7, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  while (Date.now() - t0 < T) { a += K.between(0.04, 0.16); await K.move(7, cx + Math.cos(a) * r * K.between(0.9, 1.1), cy + Math.sin(a) * r * K.between(0.9, 1.1)); await K.sleep(K.between(40, 120)); }
  await K.up(7); K.ev('compass-own'); return true;
}
async function chipTo50k(K, chipSel, targetJs) {
  const r = await K.pg.evaluate(([cs, tj]) => { const cands = [...document.querySelectorAll(cs)].filter((b) => b.getBoundingClientRect().width > 0); if (!cands.length) return null; const b = cands[Math.floor(Math.random() * cands.length)].getBoundingClientRect(); const t = (new Function('return ' + tj))()(); return t ? { x: b.left + b.width / 2, y: b.top + b.height / 2, tx: t[0], ty: t[1] } : null; }, [chipSel, targetJs]).catch(() => null);
  if (!r) return false; const tx = r.tx + K.between(-24, 24), ty = r.ty + K.between(-24, 24);
  await K.down(7, r.x, r.y); for (let i = 1; i <= 10; i++) { await K.sleep(K.between(25, 70)); await K.move(7, r.x + ((tx - r.x) * i) / 10, r.y + ((ty - r.y) * i) / 10); } await K.up(7); return true;
}
const POLY50 = "() => { const pl = [...document.querySelectorAll('.h42 svg polyline')].pop(); if (!pl) return null; const pts = pl.getAttribute('points').split(' ').map((p) => p.split(',').map(Number)); const q = pts[Math.floor(Math.random() * pts.length)]; return q; }";
const TRI50 = "() => { const p = [...document.querySelectorAll('.h42 svg path')].find((q) => /Z$/.test(q.getAttribute('d') || '')); if (!p) return null; const n = (p.getAttribute('d').match(/-?[0-9.]+/g) || []).map(Number); return n.length >= 6 ? [(n[0] + n[2]) / 2, n[1] + 24] : null; }";
const RING50 = "() => { const c = [...document.querySelectorAll('.h42 svg circle')].filter((q) => +q.getAttribute('r') === 13 || +q.getAttribute('r') === 16); if (!c.length) return null; const q = c[Math.floor(Math.random() * c.length)]; return [+q.getAttribute('cx'), +q.getAttribute('cy')]; }";
async function mount42(K) {
  let moodUntil = 0, mood = 'try';
  while (K.left() > 15000) {
    const s = await lookRec(K, 'mount'); if (!s) { await K.sleep(500); continue; }   // (lookRec: the stuck watch sees each change — with K.look() alone the parent's hand took over for good after 75 s)
    if (K.isCard(s)) { await K.sleep(K.between(600, 2000)); const s2 = await K.look(); if (s2) await K.pokeButton(s2, null, 'card'); await K.sleep(600); continue; }
    const h = await K.pg.evaluate(() => (globalThis.__H42 ? { on: globalThis.__H42.on, ...globalThis.__H42.state() } : null)).catch(() => null);
    if (!h || !h.on) {   // ── build 44 ── after stage 01: the vision (Phase B — he tries what the line says there, or goes back to the Mount), then the test
      const v = await K.pg.evaluate(() => { const V = globalThis.__SHIFT && globalThis.__SHIFT.vision; return V ? { on: !V.ended } : null; }).catch(() => null);
      if (v && v.on) { if (!K.R.vision44) { K.R.vision44 = K.el(); K.ev('vision'); } const r = K.rnd(); if (r < 0.45) await K.tryLine(s); else if (r < 0.7) await K.randomRight(s); else if (r < 0.85) { const [W, Hh] = K.size(); await K.hold(K.between(W * 0.2, W * 0.8), K.between(Hh * 0.3, Hh * 0.8), K.between(800, 4000)); K.ev('hold-walk'); } else await K.pokeButton(s, null, 'vision-poke'); await K.sleep(K.between(200, 600)); continue; }
      const done44 = h && !h.on && h.mode === 'test' && h.test && h.test.passed;
      if (done44) { K.R.test44 = h.test; K.note('test passed'); break; }
      if (h && !h.on && h.stg === 'wall' && h.part === 'done') { K.R.wall45 = { grades: h.grades, hands: h.hands, at: K.el() }; K.note('wall done'); break; }   // ── build 45 ── stage 02's end
      if (h && !h.on && h.stg === 'kiyor' && h.part === 'done') { K.R.kiyor59 = { grades: h.grades, hands: h.hands, t55: h.t55, at: K.el() }; K.note('kiyor done'); break; }   /* ── build 59 ── stage 12's end */
      if (h && !h.on && h.stg === 'karnot' && h.part === 'done') { K.R.karnot58 = { grades: h.grades, hands: h.hands, t55: h.t55, at: K.el() }; K.note('karnot done'); break; }   /* ── build 58 ── stage 11's end */
      if (h && !h.on && h.stg === 'guf' && h.part === 'done') { K.R.guf57 = { grades: h.grades, hands: h.hands, t55: h.t55, at: K.el() }; K.note('guf done'); break; }   /* ── build 57 ── stage 10's end */
      if (h && !h.on && h.stg === 'sovev' && h.part === 'done') { K.R.sovev56 = { grades: h.grades, hands: h.hands, t55: h.t55, at: K.el() }; K.note('sovev done'); break; }   /* ── build 56 ── stage 09's end */
      if (h && !h.on && h.stg === 'yesod' && h.part === 'done') { K.R.yesod55 = { grades: h.grades, hands: h.hands, t55: h.t55, at: K.el() }; K.note('yesod done'); break; }   // ── build 55 ── stage 08's end
      if (h && !h.on && h.mode === 'test' && h.test50 && h.test && h.test.passed) { K.R.test50 = h.test; K.note('test50 passed'); if (/h50test=1/.test(K.query || '')) break; K.R.offT = 0; await K.sleep(3000); continue; }   // (build 55: from chapter ג׳'s test on into stage 08 when the run began at the stage)   // ── build 50 ── chapter ג׳'s test
      if (h && !h.on && h.stg === 'nikanor' && h.part === 'done') { K.R.nikanor49 = { grades: h.grades, hands: h.hands, at: K.el() }; K.note('nikanor done'); break; }   // ── build 49 ── stage 06's end
      if (h && !h.on && h.stg === 'nashim' && h.part === 'done') { K.R.nashim48 = { grades: h.grades, hands: h.hands, at: K.el() }; K.note('nashim done'); break; }   // ── build 48 ── stage 05's end
      if (h && !h.on && h.stg === 'gates' && h.part === 'done') { K.R.gates47 = { grades: h.grades, hands: h.hands, at: K.el() }; K.note('gates done'); break; }   // ── build 47 ── stage 04's end
      if (h && !h.on && h.stg === 'soreg' && h.part === 'done') { K.R.soreg46 = { grades: h.grades, hands: h.hands, at: K.el() }; K.note('soreg done'); break; }   // ── build 46 ── stage 03's end
      if (!K.R.offT) K.R.offT = K.el(); if (K.el() - K.R.offT > 120) { K.note('no stage director for 2 minutes'); break; }
      await K.sleep(1000); const s2 = await K.look(); if (s2 && s2.tp.length && K.rnd() < 0.3) await K.pokeButton(s2, null, 'after'); continue;
    }
    K.R.offT = 0;
    if (h.mode && h.mode !== 'stage' && !K.R['m44' + h.mode]) { K.R['m44' + h.mode] = K.el(); K.ev('mode-' + h.mode); }
    if (K.stuckFor() > 75) {
      const sig0 = await K.pg.evaluate(() => globalThis.__KID.sig()).catch(() => '');
      await K.pg.addScriptTag({ path: require('path').join(__dirname, '..', 'auto42.js') }).catch(() => {});
      await K.pg.evaluate((seed) => { try { globalThis.__AUTO42.stop(); globalThis.__AUTO42.start({ skilled: true, seed }); } catch (e) { /* */ } }, Math.floor(K.rnd() * 1000) + 1).catch(() => {});
      const t1 = Date.now(); let changed = false;
      while (Date.now() - t1 < 40000 && K.left() > 15000) { await K.sleep(1500); const s3 = await K.pg.evaluate(() => globalThis.__KID.sig()).catch(() => ''); if (s3 && s3 !== sig0) { changed = true; break; } }
      await K.pg.evaluate(() => { try { globalThis.__AUTO42.stop(); } catch (e) { /* */ } }).catch(() => {});
      K.R.helps = (K.R.helps || 0) + 1; K.ev('helper', `part ${h.part} → ${changed ? 'moved on' : 'NO CHANGE'}`);
      if (!changed) K.R.stuck.push({ at: K.el(), hard: true, why: `part ${h.part}`, sig: String(sig0).slice(0, 300) });
      continue;
    }
    if (K.el() > moodUntil) { mood = K.rnd() < 0.75 ? 'try' : 'mess'; moodUntil = K.el() + K.between(6, 18); }
    const L = s.line || '', r = K.rnd();
    if (h.part === 'open') { if (K.rnd() < 0.3) await K.pokeButton(s, null, 'open'); await K.sleep(K.between(500, 1500)); continue; }
    if (mood === 'try') {
      if (/החזיקו במרכז|סובבו את האצבע|החבל רפוי|החבל מתוח/.test(L) && r < 0.88) { if (!(await compass50k(K))) await K.tryLine(s); }   // ── build 50 ──
      else if (/גררו ספסל|הספסל לא על הקשת/.test(L) && r < 0.85) { if (await chipTo50k(K, '.h42 .h50-bench', POLY50)) K.ev('bench50'); else await K.tryLine(s); }
      else if (/הטבור מסתובב|החישור נתקע/.test(L) && r < 0.85) { if (K.rnd() < 0.5) { const [W, Hh] = K.size(); const a2 = await K.pg.evaluate(() => { const t = [...document.querySelectorAll('.h42 svg text')].find((q) => /⇦|⇨/.test(q.textContent)); return t ? (t.textContent.includes('⇦') ? -1 : 1) : 0; }).catch(() => 0); const dir = a2 && K.rnd() < 0.7 ? a2 : K.rnd() < 0.5 ? -1 : 1; await K.swipe(K.between(W * 0.3, W * 0.7), K.between(Hh * 0.35, Hh * 0.7), dir * K.between(20, 160), K.between(-10, 10), K.between(150, 600)); K.ev('hub-turn'); } else if (await chipTo50k(K, '.h42 .h50-spoke', TRI50)) K.ev('hub-spoke'); else await K.tryLine(s); }
      else if (/הגלגל מעלה דלי|המים נשפכים/.test(L) && r < 0.85) { if (/נשפכים/.test(L)) { await K.sleep(K.between(300, 2000)); K.ev('wheel-wait'); } else { const [W, Hh] = K.size(); await K.hold(K.between(W * 0.2, W * 0.8), K.between(Hh * 0.3, Hh * 0.8), K.between(800, 6000)); K.ev('wheel-hold'); } }
      else if (/אבן קשת|התבנית נוטה|אבן הראשה/.test(L) && r < 0.85) { if (await chipTo50k(K, '.h42 .h50-vous', RING50)) K.ev('vous50'); else await K.tryLine(s); }
      else if (/הטריזים יוצאים/.test(L) && r < 0.85) { const [W, Hh] = K.size(), n = Math.round(K.between(1, 5)); for (let i = 0; i < n; i++) { await K.tap(K.between(W * 0.3, W * 0.7), K.between(Hh * 0.3, Hh * 0.7)); await K.sleep(K.between(200, 700)); } K.ev('wedge50', String(n)); }
      else if (h.part === 'voyage' && /מאזנים את הסיפון|חבלי הדלת|חבקו אותה|הגל הפיל|כמעט לקחו|השליכו דלת/.test(L) && r < 0.9) await storm49k(K);   // ── build 49 ── the voyage's storm: two thumbs
      else if (h.part === 'voyage' && /הולכים על הסיפון|עוד חבל|מבצבצת/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.hold(K.between(W * 0.1, W * 0.9), K.between(Hh * 0.3, Hh * 0.85), K.between(1000, 7000)); K.ev('hold-voy'); }
      else if (/המוט למטה|קצר מדי|הדלת שקעה|בשיא — הקישו/.test(L) && r < 0.85) await lever49k(K, L);
      else if (/אל הקשת|הצליל מזייף|המעלה הבאה/.test(L) && r < 0.85) { if (!(await steps49k(K))) await K.tryLine(s); }
      else if (h.pending || h.part === 'rope' || /מחזיקים/.test(L)) { const [W, Hh] = K.size(); await K.hold(K.between(W * 0.1, W * 0.9), K.between(Hh * 0.3, Hh * 0.85), K.between(800, 5000)); K.ev('hold-walk'); }
      else if (/^הטו ⤵|עוד קצת ⤵|עבר את הקו|גלש מהתבנית|כל תבנית|לתבנית הבאה|הכיור נוצק/.test(L) && r < 0.88) { if (!(await pour59k(K))) await K.tryLine(s); }   /* ── build 59 ── */
      else if (/סובבו ⟳ ∙ עצרו בנקישה|נקישה ∙ עזבו|חזק מדי ∙ קצת חזרה|עוד ⟳ ∙ עד הנקישה|הדד ננעל/.test(L) && r < 0.88) { if (!(await screw59k(K))) await K.tryLine(s); }
      else if (/גררו לאט ⬆|מהר מדי ∙ לאט|כמעט במים/.test(L) && r < 0.88) { if (!(await mukhni59k(K, L))) await K.tryLine(s); }
      else if (/גררו לפינה ⤵|סובבו עוד ⟳|הזיזו אל הפינה|הונחה ישר|הרביעית בלי צל/.test(L) && r < 0.88) { if (!(await horns58k(K))) await K.tryLine(s); }   /* ── build 58 ── */
      else if (/הטו את הכד|גלש! הטו|יורדים לנקבים/.test(L) && r < 0.88) { if (!(await holes58k(K))) await K.tryLine(s); }
      else if (/גררו: כשר|הניחו שניים|הניחו בינוניים|הניחו דקים|לא למערכה|גררו למערכה|הדליקו 👆|רוח בין העצים|צפוף — אין|רחב מדי/.test(L) && r < 0.88) { if (!(await pyre58k(K))) await K.tryLine(s); }
      else if (/^בדקו ∙|נוגב — שלמה|האצבע עוברת חלק|לא נתפסת — גומות|חלק — בדקו עוד|נתפסה בסדק|חלקה — הקישו|נתפסה בשפה|עברה חלק ∙|העדות מצלצלת|מצלצלת ∙ אין|עמומה — סדוקה/.test(L) && r < 0.88) { if (!(await decoy57k(K))) await K.tryLine(s); }   /* ── build 57 ── */
      else if (/גררו ⤵ ∙ כוונו|נמוכה — הרימו|גבוהה — הורידו|אחיד! ∙ גררו|כמעט — הבאה|עקומה — הורידו|גררו לשורה|הכבש פוגש|מראש המזבח/.test(L) && r < 0.88) { if (!(await kevesh57k(K))) await K.tryLine(s); }
      else if (/מרחו ↔|לאט מדי — נוטף|מהר מדי — פסים|מרחו במטלית/.test(L) && r < 0.88) { if (!(await sid57k(K))) await K.tryLine(s); }
      else if (/הזיזו את האור|סדק באור הצד|שלמה גם באור צד/.test(L) && r < 0.88) { if (!(await lamp56k(K))) await K.tryLine(s); }   /* ── build 56 ── */
      else if (/הקישו 👆|הקישו קודם על העדות|הקישו על החדשה|השוו ∙ כשר/.test(L) && r < 0.88) { if (!(await tap56k(K))) await K.tryLine(s); }
      else if (/גררו ⤵ ∙ יישרו|בולטת — דחפו|שקועה — משכו|ישרה לאנך/.test(L) && r < 0.88) { if (!(await course56k(K))) await K.tryLine(s); }
      else if (/גררו את היתד|ימין — לאותו גובה|מתחו ↔ ושחררו/.test(L) && r < 0.88) { if (!(await thread56k(K))) await K.tryLine(s); }
      else if (/שוטפים ושוב/.test(L)) { await K.sleep(K.between(600, 2000)); K.ev('thread-wash-wait'); }
      else if (/סובבו ↔ ∙ כשר|נגבו את הבוץ|סובבו מול האור|העבירו אצבע לאט|לאט — כדי להרגיש|נתפסה! פסול|השפה חלקה|האבן שלמה. אבל|למזבח · |לא למזבח · /.test(L) && h.part !== 'wood' && r < 0.88) { if (!(await stone55k(K))) await K.tryLine(s); }   // ── build 55 ──
      else if (/גררו לרווח|לא נכנסת|לא זו — אבן|נשאר רווח|כאן אין רווח/.test(L) && r < 0.88) { if (!(await field55k(K))) await K.tryLine(s); }
      else if (/רק על היסוד|כאן אין יסוד/.test(L) && r < 0.88) { if (!(await last55k(K))) await K.tryLine(s); }
      else if (/לערימה הנכונה|קלפו ∙ כשר|מסובבת|לא למזבח|כשר למערכה/.test(L) && !/לפרצה/.test(L) && r < 0.85) { if (!(await wood48k(K))) await K.tryLine(s); }   // ── build 48 ──
      else if (/גררו קורה לשקע|קורות הפינה|לא הקורה לשקע|כולה שלכם|גררו את הקרשים/.test(L) && r < 0.85) { if (!(await beam48k(K))) await K.tryLine(s); }
      else if (/לתוך השקע|בשפת השקע/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.35, W * 0.65), K.between(Hh * 0.55, Hh * 0.8), K.between(-50, 50), -K.between(40, 140), K.between(150, 600)); K.ev('beam-push'); }
      else if (/השגם|לאורך החץ/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.3, W * 0.45), K.between(Hh * 0.5, Hh * 0.7), K.between(40, 160) * (K.rnd() < 0.8 ? 1 : -1), K.between(-30, 30), K.between(150, 600)); K.ev('tenon'); }
      else if (/הקישו על היתד|יתד חדשה/.test(L) && r < 0.85) { const [W, Hh] = K.size(), n = Math.round(K.between(1, 8)); for (let i = 0; i < n; i++) { await K.tap(K.between(W * 0.4, W * 0.6), K.between(Hh * 0.35, Hh * 0.6)); await K.sleep(K.between(180, 600)); } K.ev('peg-taps', String(n)); await K.sleep(K.between(400, 2200)); }
      else if (/הולכים על הגזוזטרא/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.hold(K.between(W * 0.3, W * 0.7), K.between(Hh * 0.4, Hh * 0.8), K.between(1500, 7000)); K.ev('walk48'); }
      else if (/החזיקו להרמה|הבועה ברחה|הכנף הכבדה/.test(L) && r < 0.85) await lift47k(K);   // ── build 47 ──
      else if (/מעל שתי המזוזות|קצה אחד לא נח/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.3, W * 0.7), K.between(Hh * 0.4, Hh * 0.75), (K.rnd() < 0.5 ? -1 : 1) * K.between(30, 220), K.between(-10, 10), K.between(150, 600)); K.ev('set47'); }
      else if (/ישר למטה|שפת הגומה/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.35, W * 0.65), K.between(Hh * 0.25, Hh * 0.45), K.between(-60, 60), K.between(40, 160), K.between(150, 700)); K.ev('pin47'); }
      else if (/הקישו על הטריז/.test(L) && r < 0.7) { const b = await K.pg.evaluate(() => { const e = document.querySelector('.h47-wedge'); if (!e || e.style.display === 'none') return null; const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }).catch(() => null); if (b) { await K.tap(b.x, b.y); K.ev('wedge47'); } else await K.tryLine(s); }
      else if (/הניפו את הכנף|הנפה מהירה|הקישו על הטריז/.test(L) && r < 0.85) { const [W, Hh] = K.size(); await K.swipe(K.between(W * 0.25, W * 0.6), K.between(Hh * 0.4, Hh * 0.75), (K.rnd() < 0.5 ? -1 : 1) * K.between(40, 260), K.between(-20, 20), K.between(60, 900)); K.ev('flick47'); }
      else if (/לשער שלו|מדות א, ד–ה/.test(L) && r < 0.85) { if (!(await names47k(K))) await K.tryLine(s); }
      else if (/לפרצה|הדוגמה/.test(L) && r < 0.85) { if (!(await lat46(K))) await K.tryLine(s); }   // ── build 46 ──
      else if (/במרחקים שווים|קרוב מדי/.test(L) && r < 0.85) await warn46(K);
      else if (/החליקו לאט|משתחווים/.test(L) && r < 0.6) await bow46(K);
      else if (/החוט/.test(L) && r < 0.85) await line45(K);
      else if (/משכו מטה|משכו ⬇/.test(L) && r < 0.85) await pulley45(K, s);   // ── build 53 ── (the pulley's line in three signs) ── /build 53 ──
      else if (/גררו את המוט/.test(L) && r < 0.85) { const [W, Hh] = K.size(), ob = s.obj && s.obj.w > 8 ? s.obj : null, a = K.rnd() * Math.PI * 2; await K.swipe(ob ? K.between(ob.l, ob.r) : K.between(W * 0.3, W * 0.8), ob ? K.between(ob.t, ob.b) : K.between(Hh * 0.35, Hh * 0.75), Math.cos(a) * K.between(40, 160), Math.sin(a) * K.between(20, 90), K.between(150, 600)); K.ev('lever'); }   // ── build 45 ── the crowbar: he drags the lever, any way (tryLine read "בעדינות" as the pour's "עד" and held — K45-P4)
      else if (/גליל/.test(L) && r < 0.85) { if (!(await roll53k(K))) await K.tryLine(s); }   // ── build 53 ── (the freed roller lies in the world) ── /build 53 ──
      else if (/גררו אבן|גררו לוחות|גליל|פינה|הנדבך העליון/.test(L) && r < 0.8) { if (!(await pile42(K, s))) await K.tryLine(s); }
      else if (/^החזיקו/.test(L) && s.obj && s.obj.w > 8 && r < 0.7) { const ob = s.obj; await K.hold(K.between(ob.l, ob.r), K.between(ob.t, ob.b), K.between(600, 5000)); K.ev('hold-thing'); }   // (the line says hold: he holds the thing — for as long as he feels like)
      else await K.tryLine(s);
    } else {
      if (r < 0.4) { const a = K.rnd() * Math.PI * 2; await K.stick(Math.cos(a), Math.sin(a), K.between(400, 3000)); K.ev('stick-wander'); }
      else if (r < 0.75) await K.randomRight(s);
      else await K.pokeButton(s, null, 'poke-any');
    }
    await K.sleep(K.between(80, 400));
  }
}

module.exports = {
  mount: mount42,   // ── build 42 ── ── /build 42 ──
  // the opening screen, every door: start + full lobby, "מכאן" and its card, the chamber door, "משחק קצר" and each interlude's first
  // screen and back, the journal's tabs and pages, the switches; back/close at odd moments; the phone turned once
  async lobby(K) {
    const seen = new Map(); let rot = false, inRunSince = 0, inGameSince = 0;
    while (K.left() > 25000) {
      const s = await lookRec(K, 'lobby'); if (!s) { await K.sleep(500); continue; }
      const e = s.eng;
      if (e && e.phase === 'run') {   // the day / a practice run / the chamber began: a while there, then back
        if (!inRunSince) inRunSince = Date.now();
        if (Date.now() - inRunSince > K.between(25000, 45000)) {
          K.ev('leave-run', JSON.stringify(e).slice(0, 120));
          // the pause card's way back if there is one, else the page again
          if (await tapSel(K, '.sh-pbtn')) { await K.sleep(900); const s2 = await K.look(); const back = s2 && s2.tp.find((q) => /חזרה|למסך/.test(q.lb)); if (back) { await K.tap(back.x, back.y); K.ev('back', back.lb); await K.sleep(1500); inRunSince = 0; continue; } K.note('no way back to the opening screen from the pause card: ' + (s2 ? s2.tp.map((q) => q.lb.slice(0, 14)).join(' | ') : '')); }
          await K.pg.reload({ waitUntil: 'load', timeout: 180000 }); await K.pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 }); await K.pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); }); await K.sleep(1500); inRunSince = 0; continue;
        }
        if (K.isCard(s) || e.paused) { await K.sleep(K.between(400, 1500)); await K.pokeButton(s, null, 'run-card'); continue; }
        if (K.rnd() < 0.6) await K.tryLine(s); else await K.randomRight(s);
        continue;
      }
      inRunSince = 0;
      const game = s.screens.find((x) => /^\.(tl|pn|m3)$/.test(x));
      if (game) {   // an interlude: poke its board a while, then its own way out
        if (!inGameSince) inGameSince = Date.now();
        if (Date.now() - inGameSince > K.between(15000, 30000)) { const out = s.tp.find((q) => /חזרה|יציאה|סגור|✕|×|למקדש|לבנייה|הביתה/.test(q.lb)); if (out) { await K.tap(out.x, out.y); K.ev('game-out', out.lb); await K.sleep(1500); inGameSince = 0; continue; } }
        if (K.rnd() < 0.7) await K.pokeButton(s, null, 'game'); else { const [w, h] = K.size(); await K.tap(K.between(10, w - 10), K.between(10, h - 10)); K.ev('game-tap'); }
        await K.sleep(K.between(150, 600)); continue;
      }
      inGameSince = 0;
      if (!rot && K.el() > 120) { rot = true; const [w, h] = K.size(); await K.setSize(h, w); await K.sleep(3000); await lookRec(K, 'lobby-portrait'); await K.shot('lobby-portrait'); await K.setSize(w, h); await K.sleep(2000); continue; }
      // a door not tried yet first (the least tried), the gold play rarely
      const c = s.tp.filter((q) => q.reach && !(/lb-play/.test(q.cls) && K.rnd() < 0.9) && !/lb-full/.test(q.cls));
      if (!c.length) { const [w, h] = K.size(); await K.tap(K.between(10, w - 10), K.between(10, h - 10)); K.ev('empty-tap'); await K.sleep(500); continue; }
      c.sort((a, b2) => (seen.get(a.lb) || 0) - (seen.get(b2.lb) || 0));
      const q = K.rnd() < 0.75 ? c[0] : K.pick(c);
      seen.set(q.lb, (seen.get(q.lb) || 0) + 1);
      const r = K.rnd();
      if (r < 0.75) await K.tap(q.x, q.y); else if (r < 0.9) await K.taps(q.x, q.y, 2); else await K.taps(q.x, q.y, 3);
      K.ev('door', `${q.lb.slice(0, 40)} ${Math.round(q.w)}×${Math.round(q.h)} ${r < 0.75 ? 1 : r < 0.9 ? 2 : 3}`);
      await K.sleep(K.between(500, 1400));
      // an empty-spot tap / a scroll now and then (a child's thumb on the card's body)
      if (K.rnd() < 0.15) { const [w, h] = K.size(); await K.swipe(w * K.between(0.3, 0.7), h * 0.7, 0, -K.between(40, 140), 250); K.ev('scroll'); }
    }
    K.R.doors = Object.fromEntries(seen);
  },
  async day(K) {
    // a first run (no save): the name and mishmar screens — a child pokes until the opening screen comes (types a name sometimes)
    for (let i = 0; i < 60; i++) {
      const s0 = await lookRec(K, 'first-run'); if (!s0) { await K.sleep(500); continue; }
      if (s0.tp.some((q) => /lb-play/.test(q.cls))) break;
      if (i === 0) await K.shot('first-run');
      const inp = await K.pg.$('.av-input'); if (inp && K.rnd() < 0.5 && !K.R.typed) { K.R.typed = 1; await inp.tap().catch(() => {}); await K.pg.keyboard.type(K.pick(['דרור', 'יהלי', 'ab', '   ', 'אבא'])).catch(() => {}); K.ev('type-name'); }
      await K.pokeButton(s0, null, 'first-run'); await K.sleep(K.between(400, 1200));
    }
    // (a first-run card he could not leave: a parent's hand — its own button by a click — and a hard stuck recorded)
    for (let i = 0; i < 4; i++) { const on = await K.pg.evaluate(() => { const m = document.querySelector('.av-modal.on'); if (!m) return null; const b = m.querySelector('.av-go, [data-v=ok], .av-btn.gold'); if (b) { b.click(); return b.textContent.trim(); } return 'no button'; }).catch(() => null); if (!on) break; K.R.stuck.push({ at: K.el(), hard: true, why: 'first-run card: the child found no way on — a parent clicked ' + on }); K.note('first-run: parent clicked ' + on); await K.sleep(2500); }
    // the opening screen a moment, then the gold button
    let s = await lookRec(K, 'start');
    for (let i = 0; i < 2 && s; i++) { await K.pokeButton(s, (q) => /lb-home|data-lb=here|here|games|journal/.test(q.p + q.cls) && !/lb-play/.test(q.cls), 'start-poke'); await K.sleep(900); s = await lookRec(K, 'start'); if (s && K.isCard(s)) { const x = s.tp.find((q) => /סגור|✕/.test(q.lb)); if (x) await K.tap(x.x, x.y); await K.sleep(600); } }
    // back to the start screen if the full one is up
    for (let i = 0; i < 4; i++) { if (await tapSel(K, '.lb-play')) break; await K.pg.evaluate(() => { try { globalThis.__SHIFT.card(); } catch (e) { /* */ } }); await K.sleep(1000); }
    const e = await waitEngine(K, 60000); K.ev('day-start', JSON.stringify(e));
    await playDay(K);
  },
  // ── fable32 (build 37) ── one role, a child's way: its practice run opened as the roles book's "לתרגל" opens it (__SHIFT.practice),
  // then played as the day is (playDay) until the practice's end card — the act finished — or the time is up (--role menorah) ── /fable32 ──
  async role(K) {
    const role = K.opt('--role', 'menorah');
    let s = await lookRec(K, 'start');
    for (let i = 0; i < 40 && !(s && s.tp.some((q) => /lb-play/.test(q.cls))); i++) { if (s) await K.pokeButton(s, null, 'first-run'); await K.sleep(800); s = await lookRec(K, 'start'); }
    const r = await K.pg.evaluate((id) => { try { globalThis.__SHIFT.practice(id, 'start'); return 'ok'; } catch (e) { return String(e && e.message); } }, role).catch((e) => String(e.message));
    K.ev('practice', role + ' ' + r);
    const e = await waitEngine(K, 60000); K.ev('role-start', JSON.stringify(e));
    const t0 = K.el();
    const end = await playDay(K, { until: (x) => x.screens.some((q) => /p31-end/.test(q)) });
    const fin = await K.pg.evaluate(() => { try { const E = globalThis.__SHIFT.E, p = E.p31 && E.p31(); return { end: !!(p && p.end), rating: p && p.end ? p.end.rating || null : null, card: ((document.querySelector('.p31-end') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 160) }; } catch (err) { return { err: String(err.message) }; } }).catch(() => null);
    K.R.role37 = { role, finished: !!(end && fin && (fin.end || fin.card)), at: K.el(), took: Math.round(K.el() - t0), fin };
    K.ev('role-end', JSON.stringify(K.R.role37));
    if (end) await K.shot('role-end-' + role);
  },
  // the lamb chamber: the "מכאן" door, the walk in, wrong choices (approve a blemished one, reject a whole one), back, again
  async chamber(K) {
    let n = 0;
    while (K.left() > 40000 && n < 4) {
      n++;
      let s = await lookRec(K, 'chamber-start');
      if (!s) continue;
      if (!s.tp.some((q) => /data-lb=ch33/.test(q.p))) { await tapSel(K, '[data-lb=here]'); await K.sleep(900); s = await lookRec(K, 'here'); }
      if (!(await tapSel(K, '[data-lb=ch33]'))) { K.note('no chamber door'); await K.pg.evaluate(() => { try { globalThis.__SHIFT.card(); } catch (e) { /* */ } }); await K.sleep(1500); continue; }
      const e = await waitEngine(K, 40000); K.ev('chamber-run', JSON.stringify(e));
      await playDay(K, { until: (s2) => !s2.eng || s2.tp.some((q) => /ch33/.test(q.p) && /חזרה|מסך/.test(q.lb)) || s2.screens.some((x) => /ch33/.test(x)) && !s2.eng });
      // the end card: poke it (double taps), then back
      for (let i = 0; i < 6; i++) { const s3 = await lookRec(K, 'chamber-end'); if (!s3) break; if (!s3.eng && s3.tp.some((q) => /lb-play/.test(q.cls))) break; await K.pokeButton(s3, (q) => !/העתק לוג/.test(q.lb), 'ch33-card'); await K.sleep(K.between(600, 1500)); }
    }
  },
  // the Shabbat lock with a faked clock: the calm line (lobby + day + pause), the lock mid-day, every button on the lock screen, the
  // phone turned, the page reopened during the lock, and after it the day goes on
  async lock(K) {
    const at = (iso) => K.pg.evaluate((iso) => { window.__NOW29 = Date.parse(iso); try { globalThis.__SHIFT.tick29(); } catch (e) { /* */ } }, iso);
    let s = await lookRec(K, 'soft-lobby'); await K.shot('soft-lobby');
    await tapSel(K, '.lb-play'); await waitEngine(K, 40000);
    for (let i = 0; i < 12 && K.left() > 60000; i++) { s = await lookRec(K, 'soft-day'); if (s) await K.tryLine(s); }
    await tapSel(K, '.sh-pbtn'); await K.sleep(1000); await lookRec(K, 'soft-pause'); await K.shot('soft-pause'); s = await K.look(); if (s) await K.pokeButton(s, (q) => /המשך/.test(q.lb), 'pause');
    await at('2026-10-23T13:19:30Z'); await K.sleep(4000); s = await lookRec(K, 'locked'); await K.shot('locked-midday');
    for (let i = 0; i < 14 && K.left() > 120000; i++) { s = await lookRec(K, 'locked'); if (!s) continue; if (K.rnd() < 0.6) await K.pokeButton(s, null, 'lock-poke'); else { const [w, h] = K.size(); await K.tap(K.between(5, w - 5), K.between(5, h - 5)); } await K.sleep(500); }
    const [w, h] = K.size(); await K.setSize(h, w); await K.sleep(2500); await lookRec(K, 'lock-portrait'); await K.shot('lock-portrait'); await K.setSize(w, h); await K.sleep(1500);
    await K.pg.goto(K.url.replace(/now=[^&]+/, 'now=' + encodeURIComponent('2026-10-23T15:30:00Z')), { waitUntil: 'load', timeout: 180000 }); await K.pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 }); await K.pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); }); await K.sleep(3000);
    s = await lookRec(K, 'lock-reopened'); await K.shot('lock-reopened');
    for (let i = 0; i < 6; i++) { s = await lookRec(K, 'lock-reopened'); if (s) await K.pokeButton(s, null, 'lock-poke2'); await K.sleep(500); }
    await at('2026-10-24T15:45:00Z'); await K.sleep(4500); s = await lookRec(K, 'after-shabbat'); await K.shot('after-shabbat');
    K.ev('after-shabbat', s ? s.tp.map((q) => q.lb.slice(0, 20)).join(' | ') : '');
    if (await tapSel(K, '.lb-play')) { await waitEngine(K, 40000); await playDay(K, { until: () => K.left() < 40000 }); }
  },
};
// ── diagnosis runs ──
module.exports.diag = async function (K) {
  const what = K.opt('--diag', 'walk');
  const dump = () => K.pg.evaluate(() => { const E = globalThis.__SHIFT && globalThis.__SHIFT.E; const a = globalThis.__KID.pathAim(); const h = globalThis.__KID.hero(); const F = globalThis.__F31 && globalThis.__F31.state && globalThis.__F31.state(); const c = globalThis.__T.camera.position; let fn = null; try { const f = E.flowNext(); fn = f && f.at ? [+f.at.x.toFixed(1), +f.at.z.toFixed(1), f.id || f.st || ''] : null; } catch (e) { /* */ } return { t: E && E.st33 ? +E.st33.t.toFixed(1) : null, h: h ? [+h.x.toFixed(2), +h.z.toFixed(2), Math.round(h.sx), Math.round(h.sy), h.on] : null, aim: a ? [Math.round(a.sx), Math.round(a.sy), +a.d.toFixed(1), a.n] : null, pts: F && F.pts ? F.pts.slice(0, 4).map((p) => [+p[0].toFixed(1), +p[1].toFixed(1)]) : null, cam: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)], fn, r26: E && E.r26() ? E.r26().ph : null, line: globalThis.__KID.line() }; }).catch((e) => ({ err: e.message }));
  if (what === 'walk') {
    await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(3000);
    K.R.diag = [];
    let s = await K.look(); await K.shot('walk0');
    for (let i = 0; i < 26 && K.left() > 200000; i++) { s = await K.look(); const d0 = await dump(); await K.towardPath(s, 1500); const d1 = await dump(); K.R.diag.push(['kid', d0, d1]); K.log(JSON.stringify(d1)); if (d1.r26 && d1.r26 !== 'walk') break; }
    await K.shot('walk1');
    await helper(K, 'diag: the bot walks');
    const d2 = await dump(); K.R.diag.push(['bot', d2]); K.log('after bot', JSON.stringify(d2));
    await K.shot('walk2');
  }
  if (what === 'games') {   // the interludes' sheets and the journal after them
    const open = async (k) => { await tapSel(K, '[data-lb=games]'); await K.sleep(800); await tapSel(K, `[data-lb=${k}]`); await K.sleep(2500); await lookRec(K, 'game-' + k); await K.shot('game-' + k); };
    const out = async () => { for (let i = 0; i < 10; i++) { const s = await K.look(); if (!s || !s.screens.some((x) => /^\.(tl|pn|m3)$/.test(x))) return; const c = s.tp.filter((x) => x.reach); const q = c.find((x) => /^(לצאת|חזרה)/.test(x.lb)) || c.find((x) => /יציאה|✕|סגור|חזרה/.test(x.lb)) || (i < 2 && c.find((x) => /התחל/.test(x.lb))); if (q) { await K.tap(q.x, q.y); K.ev('out', q.lb); } else K.ev('out-none', c.map((x) => x.lb.slice(0, 12)).join('|')); await K.sleep(1500); } };
    const playSome = async () => { const s = await K.look(); const st = s && s.tp.find((x) => x.reach && /^התחל|^שחק/.test(x.lb)); if (st) { await K.tap(st.x, st.y); await K.sleep(1500); } for (let i = 0; i < 6; i++) { const s2 = await K.look(); if (!s2) break; const c = s2.tp.filter((x) => x.reach && !/יציאה|✕|רמז|ערבוב|ביטול|חזרה|לצאת/.test(x.lb)); if (c.length) { const q = K.pick(c); await K.tap(q.x, q.y); K.ev('game', q.lb.slice(0, 20)); } await K.sleep(700); } };
    await open('tiles'); await playSome(); await K.shot('tiles-play'); await out(); await lookRec(K, 'after-tiles');
    await tapSel(K, '[data-lb=journal]'); await K.sleep(1500); const s1 = await lookRec(K, 'journal-after-tiles'); await K.shot('journal-after-tiles');
    K.R.diag = { journalAfterTiles: s1 && s1.screens, tl: await K.pg.evaluate(() => [...document.querySelectorAll('.j32 .tl, .j32 .tl23')].map((e) => { const r = e.getBoundingClientRect(); return [e.tagName, e.className, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(e).position]; })) };
    await tapSel(K, '.j32 [data-j32=close]'); await K.sleep(1000); K.R.diag.closed1 = await K.pg.evaluate(() => !document.querySelector('.j32'));
    await K.pg.evaluate(() => { const e = document.querySelector('.j32'); if (e) { try { globalThis.__J32.close(); } catch (er) { e.remove(); } } });
    await open('pen'); await playSome(); await out(); await lookRec(K, 'after-pen');
    await tapSel(K, '[data-lb=journal]'); await K.sleep(1200); await tapSel(K, '.j32 [data-j32t=mishna]'); await K.sleep(800);
    await tapSel(K, '.j32 [data-j32p]'); await K.sleep(1000); const s2 = await lookRec(K, 'page-after-pen'); await K.shot('page-after-pen');
    K.R.diag.pn = await K.pg.evaluate(() => [...document.querySelectorAll('.j32 .pn, .j32 .pn32')].map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), getComputedStyle(e).position]; }));
    await tapSel(K, '.j32 [data-j32=close]'); await K.sleep(1000); K.R.diag.closed2 = await K.pg.evaluate(() => !document.querySelector('.j32'));
    await K.pg.evaluate(() => { const e = document.querySelector('.j32'); if (e) { try { globalThis.__J32.close(); } catch (er) { e.remove(); } } });
    await open('m3'); await K.sleep(2000); await lookRec(K, 'm3'); await out(); await lookRec(K, 'after-m3'); await K.shot('after-m3');
    K.log('diag', JSON.stringify(K.R.diag));
  }
  if (what === 'pyre') {   // the practice runs' first views, no input (the pyre, the lamb, the menorah)
    for (const role of (K.opt('--roles', 'm22,lamb,menorah')).split(',')) {
      await K.pg.evaluate((r) => globalThis.__SHIFT.practice(r, 'start'), role).catch((e) => K.note('practice ' + e.message));
      await waitEngine(K, 40000); await K.sleep(6000); await lookRec(K, 'prac-' + role); await K.shot('prac-' + role);
      K.log(role, JSON.stringify(await dump()));
      await K.pg.evaluate(() => { try { globalThis.__SHIFT.back31('start'); } catch (e) { /* */ } }); await K.sleep(2000);
      await K.pg.evaluate(() => { const e = document.querySelector('.j32'); if (e) { try { globalThis.__J32.close(); } catch (er) { e.remove(); } } });
    }
  }
};
// ── the screens a child meets, each looked at: the pause card and its way back, the summary, the interludes' first screens ──
module.exports.screens = async function (K) {
  const sz = `${K.size()[0]}`;
  await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(4000);
  await tapSel(K, '.sh-pbtn'); await K.sleep(1200); let s = await lookRec(K, 'pause'); await K.shot('pause-' + sz);
  K.R.pause = s ? s.tp.map((q) => `${q.lb.slice(0, 24)} ${Math.round(q.w)}x${Math.round(q.h)} @${Math.round(q.t)}-${Math.round(q.b)}${q.reach ? '' : ' (unreachable)'}`) : null; K.log('pause', JSON.stringify(K.R.pause));
  const back = s && s.tp.find((q) => /למסך הפתיחה/.test(q.lb));
  if (back) { await K.tap(back.x, back.y); await K.sleep(2500); s = await lookRec(K, 'back-lobby'); await K.shot('back-lobby-' + sz); K.R.backLobby = s ? s.tp.filter((q) => /lb-play/.test(q.cls)).map((q) => q.lb) : null; K.log('back', JSON.stringify(K.R.backLobby)); await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(3000); }
  // the summary: the day to its sunset (a debug jump), the card, its buttons
  await K.pg.evaluate(() => { try { globalThis.__SHIFT.E.debug.night(); } catch (e) { /* */ } }); await K.sleep(6000);
  for (let i = 0; i < 20; i++) { s = await K.look(); if (s && s.screens.some((x) => /f17-sum/.test(x))) break; if (s && (s.screens.some((x) => /j32u|tl33|r30-c/.test(x)))) await K.pokeButton(s, (q) => /המשך|סגור/.test(q.lb), 'card'); await K.sleep(1500); }
  s = await lookRec(K, 'summary'); await K.shot('summary-' + sz);
  K.R.summary = s ? s.tp.map((q) => `${q.lb.slice(0, 30)} ${Math.round(q.w)}x${Math.round(q.h)} @${Math.round(q.t)}-${Math.round(q.b)}`) : null; K.log('summary', JSON.stringify(K.R.summary));
  // its next day: double-tapped
  const nx = s && s.tp.find((q) => /f17/.test(q.p) && /המשך|ליום/.test(q.lb));
  if (nx) { const d0 = (await K.pg.evaluate(() => globalThis.__SHIFT.E.st33.day)); await K.taps(nx.x, nx.y, 2); await K.sleep(2500); const d1 = await K.pg.evaluate(() => globalThis.__SHIFT.E.st33.day); K.R.nextDay = [d0, d1]; K.log('next day', d0, '→', d1); await lookRec(K, 'next-day'); }
  // the interludes from the opening screen: back to it through the pause card
  await tapSel(K, '.sh-pbtn'); await K.sleep(1000); s = await K.look(); const b2 = s && s.tp.find((q) => /למסך הפתיחה/.test(q.lb)); if (b2) await K.tap(b2.x, b2.y); else await K.pg.evaluate(() => globalThis.__SHIFT.card()); await K.sleep(2500);
  for (const g of ['m3', 'pen']) {
    await tapSel(K, '[data-lb=games]'); await K.sleep(900); await tapSel(K, `[data-lb=${g}]`); await K.sleep(3500);
    s = await lookRec(K, 'game-' + g); await K.shot(`game-${g}-${sz}`);
    K.R['g_' + g] = s ? s.tp.map((q) => `${q.lb.slice(0, 26)} ${Math.round(q.w)}x${Math.round(q.h)} @${Math.round(q.t)}-${Math.round(q.b)}${q.reach ? '' : ' (unreachable)'}`) : null; K.log(g, JSON.stringify(K.R['g_' + g]));
    for (let i = 0; i < 8; i++) { s = await K.look(); if (!s || !s.screens.some((x) => /^\.(tl|pn|m3)$/.test(x))) break; const c = s.tp.filter((q) => q.reach); const q = c.find((x) => /^(לצאת|חזרה)/.test(x.lb)) || c.find((x) => /יציאה|✕|סגור|חזרה/.test(x.lb)); if (q) { await K.tap(q.x, q.y); K.ev('out', q.lb); } else { K.ev('out-none', c.map((x) => x.lb.slice(0, 14)).join('|')); break; } await K.sleep(1500); }
    s = await K.look(); K.R['out_' + g] = s ? s.screens : null; K.log('after', g, JSON.stringify(s && s.screens));
    if (s && s.screens.some((x) => /^\.(tl|pn|m3)$/.test(x))) { await K.shot(`game-${g}-stuck-${sz}`); await K.pg.evaluate(() => document.querySelectorAll('.m3,.pn,.tl').forEach((e) => e.remove())); }
  }
};
// ── the chamber's walk-in camera: candidate starts, each settled, its shot ──
module.exports.ch33cam = async function (K) {
  await tapSel(K, '[data-lb=here]'); await K.sleep(900); await tapSel(K, '[data-lb=ch33]'); await waitEngine(K, 40000); await K.sleep(3500);
  const cands = JSON.parse(K.opt('--cands', '[[-160,-53.5,3.1416],[-150,-55,-1.5708],[-150,-55,1.5708],[-146,-55.5,-1.5708]]'));
  const dump = () => K.pg.evaluate(() => { const S = globalThis.__T.stages, hp = { x: 0, y: 0, z: 0 }; S.heroXYZ(hp); const c = globalThis.__T.camera.position, h = globalThis.__KID.hero(); return { hero: [+hp.x.toFixed(1), +hp.y.toFixed(1), +hp.z.toFixed(1)], cam: [+c.x.toFixed(1), +c.y.toFixed(1), +c.z.toFixed(1)], d: +Math.hypot(c.x - hp.x, c.z - hp.z).toFixed(1), scr: h ? [Math.round(h.sx), Math.round(h.sy)] : null, line: globalThis.__KID.line(), aim: globalThis.__KID.pathAim() }; });
  K.R.cam = [];
  { const d = await dump(); K.R.cam.push(['as-started', d]); K.log('as-started', JSON.stringify(d)); await K.shot('cam-start'); }
  for (const [x, z, yaw] of cands) {
    await K.pg.evaluate(([x, z, yaw]) => { globalThis.__T.stages.hero.setPos(x, z, yaw); }, [x, z, yaw]); await K.sleep(3500);
    const d = await dump(); K.R.cam.push([[x, z, yaw], d]); K.log(JSON.stringify([x, z, yaw]), JSON.stringify(d)); await K.shot(`cam_${x}_${z}_${yaw.toFixed(1)}`);
  }
  // and the walk from the start by the stick toward the path: a shot each few seconds
  await K.pg.evaluate(() => { globalThis.__T.stages.hero.setPos(-160, -53.5, Math.PI); }); await K.sleep(2500);
  for (let i = 0; i < 4; i++) { const s = await K.look(); await K.towardPath(s, 1800); const d = await dump(); K.R.cam.push(['walk' + i, d]); K.log('walk', i, JSON.stringify(d)); if (i % 2 === 1) await K.shot('cam-walk' + i); }
};
// ── a measurement: the first-run card on this screen ──
module.exports.firstrun = async function (K) {
  await K.sleep(4000);
  const m = () => K.pg.evaluate(() => { const c = document.querySelector('.av-modal.on .av-card') || document.querySelector('.av-card'); if (!c) return null; const r = c.getBoundingClientRect(), cs = getComputedStyle(c), go = c.querySelector('.av-go'), gr = go && go.getBoundingClientRect(), md = c.parentElement, mr = md.getBoundingClientRect(); const mv = document.querySelector('meta[name=viewport]'); return { inner: [innerWidth, innerHeight], vv: window.visualViewport ? [visualViewport.width, visualViewport.height] : null, card: [Math.round(r.top), Math.round(r.bottom), c.clientHeight, c.scrollHeight, c.scrollTop], maxH: cs.maxHeight, modal: [Math.round(mr.top), Math.round(mr.bottom), getComputedStyle(md).display, getComputedStyle(md).alignItems], go: gr ? [Math.round(gr.top), Math.round(gr.bottom)] : null, meta: mv ? mv.content : null, docH: document.documentElement.clientHeight, vhTest: (() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;height:100vh;width:1px;top:0'; document.body.appendChild(d); const h = d.getBoundingClientRect().height; d.remove(); return h; })() }; });
  const a = await m(); K.log('firstrun', JSON.stringify(a)); K.R.firstrun = a; await K.shot('firstrun-' + K.size().join('x'));
  // the child scrolls the card with a thumb: does the go button come up?
  const r = await K.pg.evaluate(() => { const c = document.querySelector('.av-card'); const b = c && c.getBoundingClientRect(); return b ? { x: b.left + b.width / 2, y: b.top + b.height * 0.6 } : null; });
  if (r) { await K.swipe(r.x, Math.min(r.y, K.size()[1] - 30), 0, -150, 300); await K.sleep(800); const b = await m(); K.log('after scroll', JSON.stringify(b)); K.R.firstrun2 = b; await K.shot('firstrun-scrolled-' + K.size().join('x')); }
};
// ── the summary: its CTA on this screen, the pause button over it, the way back, "מהתחלה" ──
module.exports.sumdiag = async function (K) {
  const sz = K.size().join('x');
  const toSum = async () => { await K.pg.evaluate(() => { try { globalThis.__SHIFT.E.debug.night(); } catch (e) { /* */ } }); for (let i = 0; i < 30; i++) { await K.sleep(1500); const s = await K.look(); if (s && s.screens.some((x) => /f17-sum/.test(x))) return s; if (s && s.screens.some((x) => /j32u|tl33|r30-c/.test(x))) await K.pokeButton(s, (q) => /המשך|סגור/.test(q.lb), 'card'); } return null; };
  const meas = () => K.pg.evaluate(() => { const n = document.querySelector('.f17-sum [data-f17=next]'), p = document.querySelector('.sh-pbtn'); const r = n && n.getBoundingClientRect(), pr = p && p.getBoundingClientRect(); const top = (b) => { if (!b) return null; const e = document.elementFromPoint(b.left + b.width / 2, Math.min(innerHeight - 2, b.top + b.height / 2)); return e ? (e.className || e.tagName) + '' : null; }; return { H: innerHeight, next: r ? [Math.round(r.top), Math.round(r.bottom)] : null, nextTop: top(r), pbtn: pr ? [Math.round(pr.top), Math.round(pr.bottom)] : null, pbtnTop: top(pr), sum: !!document.querySelector('.f17-sum'), lobby: !!document.querySelector('.lb-play'), pause: !!document.querySelector('.sh-pause'), day: globalThis.__SHIFT.E ? globalThis.__SHIFT.E.st33.day : null }; });
  await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(3000);
  let s = await toSum(); let m = await meas(); K.log('summary', JSON.stringify(m)); K.R.sum1 = m; await K.shot('sum-' + sz);
  // the pause button over the summary
  if (m.pbtn) { await tapSel(K, '.sh-pbtn'); await K.sleep(1200); m = await meas(); K.log('after pbtn', JSON.stringify(m)); K.R.sum2 = m; if (m.pause) { await K.shot('sum-pause-' + sz); s = await K.look(); const b = s && s.tp.find((q) => /למסך הפתיחה/.test(q.lb)); if (b) { await K.tap(b.x, b.y); await K.sleep(2500); m = await meas(); K.log('after back', JSON.stringify(m)); K.R.sum3 = m; await K.shot('sum-back-' + sz); } } }
  // the next day's button, by a real tap (where a child sees it)
  if (!m.lobby || m.sum) { /* */ } else { await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(2500); s = await toSum(); }
  m = await meas(); if (m.sum && m.next) { const d0 = m.day; const y = Math.min(m.H - 4, (m.next[0] + m.next[1]) / 2); await K.tap(K.size()[0] / 2, y); await K.sleep(2500); const m2 = await meas(); K.log('next tapped at y', Math.round(y), 'day', d0, '→', m2.day, 'sum', m2.sum); K.R.next = [d0, m2.day, m2.sum]; }
};
// ── candidate views for the chamber's walk-in (a raw render from each: the world as it stands) ──
module.exports.views = async function (K) {
  await tapSel(K, '[data-lb=here]'); await K.sleep(900); await tapSel(K, '[data-lb=ch33]'); await waitEngine(K, 40000); await K.sleep(3000);
  const V = JSON.parse(K.opt('--views', '[]'));
  await K.pg.evaluate(() => { window.__T.simulate(false); window.__HUD_HOLD = true; });
  for (let i = 0; i < V.length; i++) {
    const [p, t] = V[i];
    await K.pg.evaluate(([p, t]) => { const T = window.__T, c = T.camera; c.position.set(...p); c.lookAt(new T.Vector3(...t)); c.updateMatrixWorld(); T.renderer.render(T.scene, c); }, [p, t]);
    await K.pg.screenshot({ path: require('path').join(K.OUT, `view-${i}.png`), timeout: 240000 }); K.log('view', i, JSON.stringify(V[i]));
  }
};
// ── the scripted bot plays the morning (tools/autoplay35.js, a child's pace); a shot each time the one line changes — the HUD's lines at
// this size, as the morning goes (and the bot's own marks: a scripted morning still fine) ──
module.exports.botlook = async function (K) {
  await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(1500);
  await K.pg.addScriptTag({ path: '/home/claude/temple3d/tools/autoplay35.js' });
  await K.pg.evaluate((seed) => { globalThis.__AUTO35.start({ human: true, seed }).catch(() => {}); }, K.R.seed);
  let last = '', n = 0;
  while (K.left() > 25000) {
    const s = await lookRec(K, 'bot'); if (!s) { await K.sleep(800); continue; }
    const L = (s.line || '').replace(/\d+/g, '#');
    if (L && L !== last) { last = L; K.ev('line', s.line); if (n++ % 2 === 0 && K.R.shots.length < 12) await K.shot('line-' + n); }
    const st = await K.pg.evaluate(() => { const A = globalThis.__AUTO35.state(); return { on: A.on, phase: A.phase, marks: A.marks, err: A.err, stuck: A.stuck, rate: A.rate }; }).catch(() => null);
    if (st && !st.on) { K.R.bot = st; K.log('bot done', JSON.stringify(st).slice(0, 600)); break; }
    await K.sleep(1500);
  }
  K.R.bot = K.R.bot || await K.pg.evaluate(() => { const A = globalThis.__AUTO35.state(); return { on: A.on, phase: A.phase, marks: A.marks, err: A.err, stuck: A.stuck, rate: A.rate }; }).catch(() => null);
  K.log('bot', JSON.stringify(K.R.bot).slice(0, 800));
};
// ── the walk to the pen: the bot to the lot's end, then the child's steering (toward the gold path he sees) with the hero's place logged ──
module.exports.penwalk = async function (K) {
  await tapSel(K, '.lb-play'); await waitEngine(K, 60000); await K.sleep(1500);
  await K.pg.addScriptTag({ path: '/home/claude/temple3d/tools/autoplay35.js' });
  await K.pg.evaluate((seed) => { globalThis.__AUTO35.start({ seed }).catch(() => {}); }, K.R.seed);
  const want = new RegExp(K.opt('--line', 'לכו לדיר'));
  for (let i = 0; i < 200; i++) { const l = await K.pg.evaluate(() => globalThis.__KID.line()).catch(() => ''); if (want.test(l)) break; await K.sleep(500); }
  await K.pg.evaluate(() => { globalThis.__AUTO35.stop(); globalThis.__T.stages.hero.drive(0, 0); });
  K.log('line', await K.pg.evaluate(() => globalThis.__KID.line()));
  const dump = () => K.pg.evaluate(() => { const E = globalThis.__SHIFT.E, a = globalThis.__KID.pathAim(), h = globalThis.__KID.hero(), F = globalThis.__F31 && globalThis.__F31.state(); let fn = null; try { const f = E.flowNext(); fn = f && f.at ? [+f.at.x.toFixed(1), +f.at.z.toFixed(1)] : null; } catch (e) { /* */ } return { t: +E.st33.t.toFixed(1), h: h ? [+h.x.toFixed(1), +h.z.toFixed(1), Math.round(h.sx), Math.round(h.sy)] : null, aim: a ? [Math.round(a.sx), Math.round(a.sy), +a.d.toFixed(1)] : null, pts: F && F.pts ? F.pts.slice(0, 5).map((p) => [+p[0].toFixed(1), +p[1].toFixed(1)]) : null, fn, p25: E.p25() ? E.p25().ph : null, line: globalThis.__KID.line() }; });
  K.R.walk = []; let flat = 0, prev = null, shots = 0;
  for (let i = 0; i < 60 && K.left() > 30000; i++) {
    const s = await K.look(); await K.towardPath(s, 1500); const d = await dump(); K.R.walk.push(d); K.log(JSON.stringify(d));
    if (d.p25) break;
    if (prev && d.h && prev.h && Math.hypot(d.h[0] - prev.h[0], d.h[1] - prev.h[1]) < 0.5) flat++; else flat = 0;
    if (flat === 3 && shots < 4) { shots++; await K.shot('stuck-' + i); }
    prev = d;
  }
};
