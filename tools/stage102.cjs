// ── build 102 ── tools/stage102.cjs — A WHOLE STAGE PLAYED AS A PLAYER, OVER TIME (the owner's rule, 4.11 22:26: not per-act screenshots).
// From the stage's own start (no fixture part): the opening, the site, each work chosen from the site's chips, played through by the test's
// hand (globalThis.__H102AUTO), the next chosen, to the stage's end. Every few ticks build 101's probe (tools/audit101.cjs PROBE: figures
// off the floor, blinking, doubles, far figures in view, props over the floor); a shot at each new act and every few minutes.
//   node tools/stage102.cjs OUT [stage=07] [W H] [minutes=70]   env: HAND=ok|slack|strain|fast  X=<the acts' speed>  TICK=<ms>  QS=<more query>  PICK=<the site's chip to take first>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const [OUT = 'stage102', ID = '07', VW = '800', VH = '560', MIN = '70'] = process.argv.slice(2);
const Q = { '07': 'h50go=1&h42stock=99', '08': 'h55go=1&h42stock=99', '09': 'h56go=1&h42stock=99', '10': 'h57go=1&h42stock=99' };
const PAGE = 'file://' + path.resolve(__dirname, '../out/index.html');
const A = fs.readFileSync(path.join(__dirname, 'audit101.cjs'), 'utf8');
const PROBE = A.slice(A.indexOf('const PROBE = ') + 14, A.indexOf('\nconst SUM = ')).trim().replace(/;$/, '');
const SUM = A.slice(A.indexOf('const SUM = ') + 12, A.indexOf('\n(async () => {')).trim().replace(/;$/, '');
const HAND = process.env.HAND || 'ok', X = +(process.env.X || 4), TICK = +(process.env.TICK || 15000);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: +VW, height: +VH } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(([h, x]) => { window.__DT_MAX = 0.25; window.__CAMSNAP = 1; window.__H102AUTO = h; window.__H102X = x; window.__F102 = 0; const tk = () => { window.__F102++; requestAnimationFrame(tk); }; requestAnimationFrame(tk); try { localStorage.clear(); } catch (e) { /* */ } }, [HAND, X]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => { errs.push(e.message); console.log(ID, 'PAGEERROR', e.message.slice(0, 200)); }); pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); else if (/Context Lost|NaN/.test(m.text())) console.log(ID, 'CONSOLE', m.text().slice(0, 200)); });
  const t0 = Date.now(), lg = (m) => console.log(ID, Math.round((Date.now() - t0) / 1000) + 's', m); const log = []; let shotN = 0;
  const shot = async (tag) => { const f = `${ID}-${String(shotN++).padStart(2, '0')}-${tag}.png`; await pg.screenshot({ path: path.join(OUT, f), timeout: 180000 }).catch((e) => lg('shot fail ' + e.message.slice(0, 80))); return f; };
  try {
    await pg.goto(`${PAGE}?h63site=1&${Q[ID]}${process.env.QS || ""}`, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForFunction(() => globalThis.__H42 && globalThis.__H42.on, null, { timeout: 300000, polling: 1000 }); lg('on');
    let last = '', n = 0, lastShot = Date.now(), ended = 0;
    while (Date.now() - t0 < +MIN * 60000) {
      const s = await pg.evaluate((pick) => {
        document.querySelectorAll('.h42-card button').forEach((x) => x.click());
        document.querySelectorAll('.h42-skip').forEach((x) => { if (x.offsetParent !== null) x.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
        const H = globalThis.__H42, st = H.state(), j = H.job(), chips = [...document.querySelectorAll('.h63-chip[data-part]')].map((c) => c.dataset.part);
        if (!j && st.part === 'site' && chips.length && !globalThis.__CH102) { const c = chips.includes(pick) ? pick : chips[0]; globalThis.__CH102 = c; document.querySelector(`.h63-chip[data-part="${c}"]`).click(); }
        if (j) globalThis.__CH102 = null;
        const r = j && j.ref, J = r && r.hj ? r.hj() : null, k = J ? J.state() : null;
        return { fr: globalThis.__F102, cut: H.cut107 ? H.cut107() : -1, cutd: H.cut107d && H.cut107 && H.cut107() > 0 ? H.cut107d() : undefined, fit: H.fit107 && H.fit107() ? +H.fit107().k.toFixed(2) : 1, part: st.part, kind: j ? j.kind : '', ph: r && r.ph ? r.ph() : '', dbg: r && r.dbg ? r.dbg() : '', qs: r && r.qs ? r.qs() : null, chips: chips.join(','), grades: st.grades, k: k ? Object.fromEntries(Object.entries(k).filter(([, v]) => typeof v !== 'object' || v === null).slice(0, 10)) : null };
      }, process.env.PICK || '').catch((e) => ({ err: e.message.slice(0, 100) }));
      if (!s.kind && s.part && !['open', 'site', 'reveal', 'done', 'out'].includes(s.part)) await pg.mouse.click(+VW / 2, +VH * 0.6).catch(() => {});   // (build 103: a tap — the hero walks to the work, as a player's tap does)
      const key = `${s.part}/${s.kind}`; log.push({ t: Math.round((Date.now() - t0) / 1000), ...s });
      if (key !== last) { lg('→ ' + key + ' ' + JSON.stringify(s).slice(0, 300)); last = key; await shot((s.kind || s.part || 'x').replace(/\W/g, '')); lastShot = Date.now(); }
      else if (n % 4 === 0 || s.cut > 0) lg(JSON.stringify(s).slice(0, 700));
      if (n % 3 === 1) await pg.evaluate(`(${PROBE})()`).catch(() => {});
      if (Date.now() - lastShot > 180000) { await shot((s.kind || s.part || 'x').replace(/\W/g, '')); lastShot = Date.now(); }
      if (s.part === 'reveal' || s.part === 'done' || s.part === 'out') { if (++ended > 4) break; }
      n++; await pg.waitForTimeout(TICK);
    }
    await shot('end');
    const sum = await pg.evaluate(`(${SUM})()`).catch((e) => ({ err: e.message }));
    fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ sum, errors: errs.slice(0, 10), log }, null, 1)); lg('SUM ' + JSON.stringify(sum).slice(0, 900)); lg('errors ' + JSON.stringify(errs.slice(0, 5))); lg('CUT107 ' + log.filter((x) => x.cut > 0).length + '/' + log.filter((x) => x.kind).length + ' act ticks with someone cut: ' + JSON.stringify(log.filter((x) => x.cut > 0).map((x) => [x.t, x.kind, x.ph, x.cut, x.fit]).slice(0, 12)));   // ── build 107 ──
  } catch (e) { lg('FAIL ' + e.message.slice(0, 300)); fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ fail: e.message, errors: errs }, null, 1)); }
  lg('END'); await b.close();
})();
