// QA (Sprint 2 wave 3): an independent first-time-player walkthrough of the REAL build (dist/test.html, SwiftShader).
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/qa-walk.cjs <phone|desktop> [--parts=first,demo,mine] [--lite]
// Every screen is screenshotted (test/out/qa/<vp>/NN-name.png) and audited in the DOM:
//   text cut off / off-screen, overlapping text, touch targets < 44 px, WCAG contrast (light and dark), RTL,
//   a Divine Name in any rendered text, a content card without "טיוטה", horizontal scroll, console errors.
// Performance: boot → first frame, draw calls + triangles per view (__T.drawCalls), performance.memory, long tasks
// (JS only: the render loop is paused, so a long task is game/DOM work, not SwiftShader's rendering).
// The report is test/out/qa/<vp>-<part>.json; the console log is the readable trail.
// Parts: first = fresh localStorage → Phase A's first minutes → menu → Phase B ("הצצה") → the home → a full morning
// service (practice) → the tour (every stop), the Ark mystery, Yom Kippur → back to building → the tour from Phase A.
// demo = #demo, the "הרגע הבא ✦" highlight reel to the end. mine = #avodah=mine, the ~3-minute Phase B demo.
// ui (UI wave 4) = the responsive pass: every HUD layer set up directly (no play), light and dark, on any viewport:
//   Phase A HUD + the opening title + the coach · the investor strip · every sheet · a card over the coach · the name and
//   mishmar prompt · two key moments · Phase B: the name prompt, the intro, the home's three tabs, the tap card over the
//   home, a mini-game panel, the tour panel. The 3D frame is rendered only at the boot and at the Phase B entry.
//   node test/qa-walk.cjs small,phone,large,tabletP,tabletL,desktopXL --parts=ui [--bundle=path/to/test.html] [--out=dir]
// Touch targets count an invisible hit area (a ::before/::after, position:absolute, that extends the control).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const VPS = (args.find((a) => !a.startsWith('--')) || 'phone').split(',');
const BUNDLE = path.resolve(ROOT, (args.find((a) => a.startsWith('--bundle=')) || '--bundle=dist/test.html').slice(9));
const OUTROOT = path.resolve(ROOT, (args.find((a) => a.startsWith('--out=')) || '--out=test/out/qa').slice(6));
const PARTS = ((args.find((a) => a.startsWith('--parts=')) || '--parts=first').slice(8)).split(',');
const LITE = args.includes('--lite');           // fewer screenshots (desktop)
const NORENDER = args.includes('--norender');   // no 3D frame at all (a DOM-only audit: fast on a loaded machine)
const SIZES = {
  small: { width: 360, height: 640, mobile: true }, phone: { width: 390, height: 844, mobile: true }, large: { width: 430, height: 932, mobile: true },
  tabletP: { width: 768, height: 1024, mobile: true }, tabletL: { width: 1024, height: 768, mobile: true },
  desktop: { width: 1280, height: 720, mobile: false }, desktopXL: { width: 1440, height: 900, mobile: false },
};
let VP = VPS[0], S = SIZES[VP], OUT = path.join(OUTROOT, VP);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(5)}s]`, ...a);

/* ───────── in-page audit (installed by addInitScript) ───────── */
const INIT = () => {
  window.__DT_MAX = 0.6; window.__START_PAUSED = true; window.__GAME_LOG = [];
  window.__FORCE_Q = window.__FORCE_Q || 'normal';
  const Q = window.__QA = { lt: [], loader: [], renders: [], t0: performance.now() };
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) Q.lt.push({ s: Math.round(e.startTime), d: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true }); } catch (e) { /* no longtask */ }
  document.addEventListener('DOMContentLoaded', () => {
    Q.dcl = performance.now();
    const lt = document.getElementById('lt');
    if (lt) new MutationObserver(() => Q.loader.push({ t: Math.round(performance.now()), txt: lt.textContent })).observe(lt, { childList: true, characterData: true, subtree: true });
    const ld = document.getElementById('load');
    if (ld) new MutationObserver(() => { if (ld.classList.contains('gone') && !Q.loaderGone) Q.loaderGone = performance.now(); }).observe(ld, { attributes: true });
  });
  const NAME = /י[֑-ׇ]*ה[֑-ׇ]*ו[֑-ׇ]*ה|א[֑-ׇ]*ל[֑-ׇ]*ו?[֑-ׇ]*ה[֑-ׇ]*י[֑-ׇ]*ם/;
  const SRC = /(משנה|מדות|מידות|תמיד|יומא|שקלים|סוכה|זבחים|מנחות|כלים|ערכין|פסחים|בבא בתרא|יוספוס|תהלים|במדבר|ויקרא|שמות|דברים|עזרא|נחמיה|יחזקאל|דברי הימים|רמב"ם|רמב״ם|ארכאולוגיה|בבלי|ירושלמי|תוספתא)\s+[א-ת]{1,3}[״"׳']?\s*[,:]\s*[א-ת]{1,3}/;
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const parse = (s) => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const opac = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden') return 0; o *= +s.opacity; } return o; };
  // (UI wave 4: an element scrolled out of its scroll container's box is not shown)
  const inScroller = (e, r) => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (/(auto|scroll|hidden)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 1) { const q = n.getBoundingClientRect(); return r.bottom > q.top + 1 && r.top < q.bottom - 1; } } return true; };
  const shown = (e) => { if (e.closest('details:not([open]) > :not(summary)')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && opac(e) > 0.1 && inScroller(e, r); };
  const label = (e) => { const t = (e.innerText || e.textContent || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(); return `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} "${t.slice(0, 40)}"`; };
  const ownText = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
  const scroller = (e) => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (/(auto|scroll)/.test(s.overflowX + s.overflowY)) return n; } return null; };
  function bgOf(e) {
    // composite the backgrounds from the element up to the root; a gradient or an image counts as its first colour
    const layers = [];
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      // (UI wave 4) the HUD roots are full-screen overlays over the 3D canvas: text that reaches them unbacked is over the world
      if (n.matches('.gm, .av, .sc-root') && !(layers.length && layers[layers.length - 1][3] >= 0.99)) return { kind: 'canvas' };
      const s = getComputedStyle(n);
      const c = parse(s.backgroundColor);
      if (c && c[3] > 0) layers.push(c.map((v, i) => (i === 3 ? v * +s.opacity : v)));
      else if (s.backgroundImage && s.backgroundImage !== 'none') { const g = parse(s.backgroundImage); if (g) layers.push(g); else return { kind: 'image' }; }
      if (layers.length && layers[layers.length - 1][3] >= 0.99) break;
    }
    if (!layers.length) return { kind: 'canvas' };
    let base = layers[layers.length - 1][3] >= 0.99 ? layers.pop() : null;
    if (!base) return { kind: 'canvas', partial: true };
    while (layers.length) base = over(layers.pop(), base);
    return { kind: 'color', c: base };
  }
  Q.audit = (tag) => {
    const R = { tag, t: Math.round(performance.now()), hscroll: document.documentElement.scrollWidth > innerWidth + 1, clipped: [], overflow: [], offscreen: [], small: [], overlaps: [], contrast: [], canvasText: [], rtl: [], names: [], hiddenNames: [], nodraft: [], screens: [] };
    const all = [...document.body.querySelectorAll('*')].filter((e) => !['SCRIPT', 'STYLE', 'CANVAS', 'svg', 'path', 'BR'].includes(e.tagName));
    const vis = all.filter(shown);
    const texts = vis.filter((e) => ownText(e) && e.closest('svg') === null);
    for (const e of texts) {
      const s = getComputedStyle(e), r = e.getBoundingClientRect();
      // cut off: the text is wider/taller than its box and the box clips it
      if ((e.scrollWidth > e.clientWidth + 2 && /(hidden|clip)/.test(s.overflowX)) || (e.scrollHeight > e.clientHeight + 3 && /(hidden|clip)/.test(s.overflowY) && s.webkitLineClamp === 'none')) R.overflow.push(label(e) + ` sw=${e.scrollWidth}/${e.clientWidth} sh=${e.scrollHeight}/${e.clientHeight}${s.textOverflow === 'ellipsis' ? ' (ellipsis)' : ''}`);
      if ((r.left < -1 || r.right > innerWidth + 1) && !scroller(e)) R.offscreen.push(label(e) + ` [${Math.round(r.left)}…${Math.round(r.right)}]`);
      // contrast (WCAG 2): text over a solid background; text straight over the 3D canvas is listed separately
      const fg = parse(s.color); if (!fg) continue;
      const o = opac(e), size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700, large = size >= 24 || (size >= 18.66 && bold);
      const bg = bgOf(e);
      if (bg.kind === 'color') {
        const f = over([fg[0], fg[1], fg[2], fg[3] * o], bg.c), L1 = lum(f), L2 = lum(bg.c);
        const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (cr < (large ? 3 : 4.5)) R.contrast.push(`${cr.toFixed(2)}:1 ${label(e)} fg=${s.color} bg=rgb(${bg.c.slice(0, 3).map(Math.round)}) ${size}px${bold ? ' bold' : ''}`);
      } else if (bg.kind === 'canvas' && (e.innerText || '').trim()) R.canvasText.push(`${label(e)} shadow=${s.textShadow !== 'none' ? 'yes' : 'NO'} color=${s.color}`);
      if (/[א-ת]/.test(e.textContent) && s.direction === 'ltr' && !/^[\s\d:.,/+\-–%·⁦⁩]*$/.test(e.textContent)) R.rtl.push(label(e));
    }
    // text that runs past the box that clips it (a nowrap label wider than its sheet, cut on both sides)
    for (const e of texts) {
      const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
      if (tr.width < 2) continue;
      for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (!/(hidden|clip|auto|scroll)/.test(s.overflowX)) continue;
        const nr = n.getBoundingClientRect();
        if (tr.left < nr.left - 2 || tr.right > nr.right + 2) R.clipped.push(`${label(e)} text [${Math.round(tr.left)}…${Math.round(tr.right)}] in ${label(n).slice(0, 40)} [${Math.round(nr.left)}…${Math.round(nr.right)}] overflow-x:${s.overflowX}`);
        break;
      }
    }
    // touch targets (the box, or the hit area an absolutely positioned ::before/::after adds around it)
    const hitRect = (e) => {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      let L = r.left, T = r.top, Rr = r.right, B = r.bottom;
      for (const ps of ['::before', '::after']) {
        const p = getComputedStyle(e, ps);
        if (!p || p.content === 'none' || p.content === 'normal' || p.position !== 'absolute' || p.pointerEvents === 'none' || p.display === 'none') continue;
        const px = (v) => (/px$/.test(v) ? parseFloat(v) : NaN);
        const l = px(p.left), t = px(p.top), rr = px(p.right), b = px(p.bottom);
        if ([l, t, rr, b].some(isNaN)) continue;
        const bl = parseFloat(s.borderLeftWidth) || 0, bt = parseFloat(s.borderTopWidth) || 0, br = parseFloat(s.borderRightWidth) || 0, bb = parseFloat(s.borderBottomWidth) || 0;
        L = Math.min(L, r.left + bl + l); T = Math.min(T, r.top + bt + t); Rr = Math.max(Rr, r.right - br - rr); B = Math.max(B, r.bottom - bb - b);
      }
      return { width: Rr - L, height: B - T, box: r };
    };
    for (const e of vis.filter((e) => e.matches('button, a[href], [role=button], [role=switch], [role=tab], input, select, textarea, [data-a], [data-play], [data-step], [data-s], [data-m]') && !e.disabled)) {
      if (e.closest('.gm-hidden')) continue;
      const h = hitRect(e), r = h.box;
      if (h.width < 43.5 || h.height < 43.5) R.small.push(`${label(e)} ${Math.round(h.width)}×${Math.round(h.height)}${Math.round(h.width) !== Math.round(r.width) || Math.round(h.height) !== Math.round(r.height) ? ` (box ${Math.round(r.width)}×${Math.round(r.height)})` : ''}`);
    }
    // overlapping text (leaf text boxes that intersect, neither containing the other)
    // (UI wave 4) a text box is clipped to its scroll container first: a chip half scrolled out of its list does not
    // overlap the line under the list
    const clipTo = (e, r) => { for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) { const s = getComputedStyle(n); if (/(auto|scroll|hidden)/.test(s.overflowX + s.overflowY) && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)) { const q = n.getBoundingClientRect(), L = Math.max(r.left, q.left), T = Math.max(r.top, q.top), Rr = Math.min(r.right, q.right), B = Math.min(r.bottom, q.bottom); return { left: L, top: T, right: Rr, bottom: B, width: Math.max(0, Rr - L), height: Math.max(0, B - T) }; } } return r; };
    const boxes = texts.map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); const r = clipTo(e, rg.getBoundingClientRect()); return { e, r }; }).filter((b) => b.r.width > 2 && b.r.height > 2);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const A = boxes[i], B = boxes[j];
      if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
      // (UI wave 4) a panel, card or sheet drawn over another layer covers it by design (the sheet over the dock, the tap
      // card over the Phase B home): not an overlap of text, when the covering layer is the one on top
      const LAYER = '.gm-sheet, .gm-modal, .gm-mo, .av-home, .av-modal, .av-mg, .sc-root, #card, .gm-toast, .av-toast, .gm-bub';
      const la = A.e.closest(LAYER), lb = B.e.closest(LAYER);
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w <= 3 || h <= 3) continue;
      const a = w * h, m = Math.min(A.r.width * A.r.height, B.r.width * B.r.height);
      if (a > 24 && a > 0.12 * m) {
        const top = document.elementFromPoint(Math.max(A.r.left, B.r.left) + w / 2, Math.max(A.r.top, B.r.top) + h / 2);
        if (la !== lb && top && ((la && la.contains(top)) || (lb && lb.contains(top)))) { (R.covered = R.covered || []).push(`${label(A.e)} × ${label(B.e)}`); continue; }
        R.overlaps.push(`${label(A.e)} × ${label(B.e)} ${Math.round(w)}×${Math.round(h)}px on top: ${top ? label(top) : '-'}`);
      }
    }
    // Divine Name, visible and hidden
    const txt = document.body.innerText || '';
    const m1 = txt.match(NAME); if (m1) R.names.push(m1[0] + ' … ' + txt.slice(Math.max(0, m1.index - 30), m1.index + 30));
    const m2 = (document.body.textContent || '').match(NAME); if (m2 && !m1) R.hiddenNames.push(m2[0]);
    // content cards: a visible card with a source must carry "טיוטה"
    for (const c of vis.filter((e) => e.matches('.gm-modal.on, .gm-sheet.on, .av-modal.on, .av-mg.on, .sc-panel, .gm-mo.on, #card.on, .av-home.on, .gm-toast, .av-toast, .gm-coach, .gm-vision, .av-sum, .hk-card'))) {
      const t = c.innerText || '';
      R.screens.push(label(c));
      if (SRC.test(t) && !/טיוטה/.test(t)) R.nodraft.push(label(c) + ' src: ' + (t.match(SRC) || [''])[0]);
    }
    return R;
  };
  Q.lts = (from, to) => Q.lt.filter((x) => x.s >= from && x.s <= to && !Q.renders.some(([a, b]) => x.s < b + 50 && x.s + x.d > a - 50));
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking', '--enable-precise-memory-info'] });
  try {
    for (const vpName of VPS) { VP = vpName; S = SIZES[VP]; OUT = path.join(OUTROOT, VP); fs.mkdirSync(OUT, { recursive: true }); if (!S) { log('unknown viewport', VP); continue; }
    for (const part of PARTS) try {
      const REPORT = { vp: VP, part, shots: [], audits: [], perf: [], errors: [], warns: [], notes: [], boot: null };
      globalThis.__REPORT = REPORT;
      const note = (s) => { REPORT.notes.push(s); log('NOTE', s); };
      const ctx = await b.newContext({ viewport: { width: S.width, height: S.height }, isMobile: S.mobile, hasTouch: S.mobile, deviceScaleFactor: 1, locale: 'he-IL' });
      const pg = await ctx.newPage();
      pg.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g|ERR_NAME|net::/.test(t)) REPORT.errors.push(t.slice(0, 300)); else if (m.type() === 'warning' && !/willReadFrequently|fonts\.g|GPU stall|WebGL/.test(t)) REPORT.warns.push(t.slice(0, 300)); });
      pg.on('pageerror', (e) => REPORT.errors.push('PAGEERR ' + e.message));
      await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      await pg.addInitScript(INIT);
      await pg.addInitScript(() => { try { localStorage.clear(); } catch (e) { /* blocked */ } });
      const G = (fn, a) => pg.evaluate(fn, a);
      let n = 0;
      const pre = { first: '', demo: 'D', mine: 'M', ui: 'U' }[part] || '';
      const audit = async (name) => { const r = await G((t) => window.__QA.audit(t), name).catch((e) => ({ tag: name, err: String(e).slice(0, 200) })); REPORT.audits.push(r); const bad = ['names', 'nodraft', 'clipped', 'overflow', 'offscreen'].filter((k) => r[k] && r[k].length); if (bad.length || r.hscroll) log('   audit', name, bad.map((k) => `${k}:${r[k].length}`).join(' '), r.hscroll ? 'HSCROLL' : ''); return r; };
      // one frame on demand; while the capture runs, the world keeps real time and the HUD stays on the rendered frame
      // (UI wave 4) wait until the finite CSS animations and transitions have ended (a sheet sliding in, a card fading in):
      // on a loaded machine an audit could otherwise catch a half-drawn layer
      const settleCss = () => G(() => new Promise((r) => { const t0 = performance.now(); (function w() { const run = document.getAnimations ? document.getAnimations().filter((a) => a.playState === 'running' && !(a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity)) : []; if (!run.length || performance.now() - t0 > 3000) r(); else setTimeout(w, 80); })(); })).catch(() => {});
      const shot = async (name, { dark = false, noRender = false } = {}) => {
        if (NORENDER) noRender = true;
        await settleCss();
        const file = `${pre}${String(++n).padStart(2, '0')}-${name}.png`;
        const s0 = Date.now();
        try {
          if (!noRender) await G(() => { const a = performance.now(); __T.simulate(false); __T.render(); __T.render(); if (__T.game && __T.game.frame) __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); window.__QA.renders.push([a, performance.now()]); });
          await audit(name);
          await pg.screenshot({ path: path.join(OUT, file), timeout: 400000 });
          if (dark) {
            await pg.emulateMedia({ colorScheme: 'dark' });
            await sleep(300); await settleCss();
            await audit(name + '·dark');
            await pg.screenshot({ path: path.join(OUT, file.replace('.png', '-dark.png')), timeout: 400000 });
            await pg.emulateMedia({ colorScheme: 'light' });
          }
        } catch (e) { note(`shot ${name} failed: ${String(e).slice(0, 160)}`); }
        await G(() => { window.__HUD_HOLD = false; }).catch(() => {});
        REPORT.shots.push({ file, s: Math.round((Date.now() - s0) / 1000) });
        log(`shot ${file} ${((Date.now() - s0) / 1000).toFixed(0)}s`);
      };
      const perf = async (view) => {
        const p = await G(() => { const a = performance.now(); const d = __T.drawCalls(); const m = performance.memory ? { used: Math.round(performance.memory.usedJSHeapSize / 1048576), total: Math.round(performance.memory.totalJSHeapSize / 1048576) } : null; const i = __T.renderer.info.memory; window.__QA.renders.push([a, performance.now()]);
          // vertices in the visible scene graph (every visible mesh; instanced meshes × their count; no frustum culling)
          let verts = 0, meshes = 0; __T.scene.traverseVisible((o) => { if (o.isMesh && o.geometry && o.geometry.attributes.position) { const c = o.geometry.attributes.position.count; verts += c * (o.isInstancedMesh ? o.count : 1); meshes++; } });
          return { ...d, heapMB: m, geometries: i.geometries, textures: i.textures, programs: (__T.renderer.info.programs || []).length, sceneVertsM: +(verts / 1e6).toFixed(2), visibleMeshes: meshes }; }).catch((e) => ({ err: String(e).slice(0, 120) }));
        REPORT.perf.push({ view, ...p }); log('perf', view, JSON.stringify(p));
      };
      const click = async (sel, { timeout = 15000 } = {}) => {
        const ok = await pg.waitForSelector(sel, { state: 'visible', timeout }).then(() => true, () => false);
        if (!ok) { note(`not found: ${sel}`); return false; }
        const h = await pg.$(sel); const r = await h.boundingBox();
        if (S.mobile && r) await pg.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); else await h.click({ timeout: 10000 }).catch(async () => { await G((s) => document.querySelector(s).click(), sel); });
        await sleep(450); return true;
      };
      const visible = (sel) => G((s) => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }, sel);
      const text = (sel) => G((s) => { const e = document.querySelector(s); return e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : ''; }, sel);
      const tapXY = async (x, y) => { if (S.mobile) await pg.touchscreen.tap(x, y); else await pg.mouse.click(x, y); };
      const gmModalGold = async (max = 6) => {
        let k = 0;
        for (; k < max; k++) {
          const on = await pg.$('.gm-modal.on .gm-btn-gold'); if (!on) break;
          const inv = await G(() => { const m = document.querySelector('.gm-modal.on'); return m && /עזרא ג, ו|חנוכת הבית/.test(m.innerText) && m.querySelectorAll('.gm-btn').length > 1 ? m.innerText.replace(/\s+/g, ' ').slice(0, 160) : null; }).catch(() => null);
          if (inv && part === 'demo') { note('demo: the Phase B invitation came up inside the highlight reel; its gold button leaves the reel for Phase B (answered with the second button): ' + inv); await shot('G-invitation', { noRender: true }); await G(() => { const bs = document.querySelectorAll('.gm-modal.on .gm-btn'); bs[bs.length - 1].click(); }); await sleep(600); continue; }
          await on.click().catch(() => {}); await sleep(500);
        }
        return k;
      };

      /* ── boot ── */
      const hash = part === 'demo' ? '#demo' : part === 'mine' ? '#avodah=mine' : '';
      const tNav = Date.now();
      await pg.goto('file://' + BUNDLE + hash);
      await sleep(1500);
      if (part === 'first') await shot('loader', { noRender: true });
      await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 600000, polling: 250 });
      REPORT.boot = await G(() => ({ dcl: Math.round(window.__QA.dcl), loaderGone: Math.round(window.__QA.loaderGone || 0), booted: Math.round(performance.now()), loader: window.__QA.loader, q: window.__FORCE_Q, lt: window.__QA.lt.slice(0, 40) }));
      REPORT.boot.wall = Date.now() - tNav;
      log('booted', JSON.stringify({ dcl: REPORT.boot.dcl, loaderGone: REPORT.boot.loaderGone, wall: REPORT.boot.wall }));

      if (part === 'first') {
        /* ════════ A. Phase A: the first minutes, as a new player ════════ */
        await pg.waitForFunction(() => __T.game && __T.game.state, null, { timeout: 60000 });
        await G(() => { const v = document.querySelector('.gm-vision'); if (v) { v.style.transition = 'none'; v.style.opacity = '1'; } });
        await shot('A-vision', { dark: true });
        await G(() => { const v = document.querySelector('.gm-vision'); if (v) { v.style.transition = ''; v.style.opacity = ''; } });
        await perf('A: the hill (start)');
        const coach1 = await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { timeout: 30000, polling: 200 }).then(() => true, () => false);
        if (!coach1) note('the coach (ftue 1) did not come within 30 s');
        await sleep(600);
        await shot('A-coach-tap-boulder');
        const coachPos = () => G(() => { const c = document.querySelector('.gm-coach'); if (!c || c.classList.contains('gm-hidden')) return null; const m = c.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? [+m[1], +m[2]] : null; });
        const strikes = () => G(() => window.__GAME_LOG.filter((x) => x.type === 'strike').length);
        // the player taps where the hand points (real taps on the canvas), as many times as the coach asks
        let taps = 0;
        for (let k = 0; k < 14; k++) {
          const ft = await G(() => __T.game.state.ftue);
          if (ft >= 3) break;
          const p = await coachPos();
          if (p && p[0] > 0 && p[0] < S.width && p[1] > 0 && p[1] < S.height) { await tapXY(p[0], p[1]); taps++; }
          else { await G(() => __T.game.onSiteTap('har')); taps++; }
          await sleep(1300);
          if (k === 0) await shot('A-first-strike');
          if (k === 2) await shot('A-ring');
        }
        log('A: taps to ftue 3', taps, 'strikes', await strikes(), 'ftue', await G(() => __T.game.state.ftue));
        // the crew comes, then the priests' story and the name
        const got4 = await pg.waitForFunction(() => __T.game.state.ftue >= 4 || document.querySelector('.gm-modal.on'), null, { timeout: 40000, polling: 250 }).then(() => true, () => false);
        if (!got4) note('no crew / story within 40 s of ftue 3');
        await shot('A-crew-arrives');
        for (let k = 0; k < 30; k++) { if (await visible('.gm-modal.on')) break; await sleep(700); }
        if (await visible('.gm-modal.on')) {
          await shot('A-story-priests', { dark: true });
          await gmModalGold(1);
          await sleep(700);
        } else note('the priests story card did not show');
        if (await visible('.gm-modal.on .gm-input')) {
          await pg.fill('.gm-modal.on .gm-input', 'אלעזר');
          await click('.gm-modal.on [data-m="8"]');
          await shot('A-name-prompt', { dark: true });
          await click('.gm-modal.on .gm-btn-gold');
        } else note('the name prompt did not show after the story');
        await sleep(800);
        // keep clearing the hill by tapping the site (like a player tapping the boulders)
        const har0 = Date.now();
        for (let k = 0; k < 70; k++) {
          const st = await G(() => ({ ftue: __T.game.state.ftue, left: __T.game.state.bh.filter((v) => v > 0).length, done: !!(__T.game.state.st.har && __T.game.state.st.har.done), mo: !!document.querySelector('.gm-mo.on'), modal: !!document.querySelector('.gm-modal.on'), busy: __T.game._.hero.busy }));
          if (st.done || st.mo) break;
          if (st.modal) { await shot('A-card-during-hill'); await gmModalGold(2); continue; }
          if (!st.busy) {
            const p = await coachPos();
            if (p && p[0] > 0 && p[0] < S.width && p[1] > 0 && p[1] < S.height && k % 3 === 0) await tapXY(p[0], p[1]);
            else await G(() => __T.game.onSiteTap('har'));
          }
          await sleep(900);
          if (k === 12) await shot('A-hill-progress');
        }
        const harState = await G(() => ({ left: __T.game.state.bh.filter((v) => v > 0).length, w: __T.game.state.st.har && __T.game.state.st.har.w, mo: !!document.querySelector('.gm-mo.on') }));
        log('A: hill after', ((Date.now() - har0) / 1000).toFixed(0), 's', JSON.stringify(harState));
        if (!harState.mo) {
          note(`the hill was not cleared by ~70 taps in ${((Date.now() - har0) / 1000).toFixed(0)} s (boulders left ${harState.left}); finishing it by state for the walkthrough`);
          await G(() => { const g = __T.game.state; g.bh = g.bh.map((v, i) => (i === 0 ? 1 : 0)); g.st.har.w = Math.max(g.st.har.w || 0, 23); __T.game._.resync(); __T.game.onBoulderTap(0); });
          await pg.waitForSelector('.gm-mo.on', { timeout: 15000 }).catch(() => note('the great-stone moment did not open'));
        }
        // the key moment: the great stone (hold, release on the mark)
        if (await visible('.gm-mo.on')) {
          await sleep(600);
          await shot('A-moment-great-stone', { dark: true });
          const placed = await G(async () => {
            const svg = document.querySelector('.gm-mo-svg'), btn = document.querySelector('.gm-mo-hold'); if (!svg || !btn) return 'no-ui';
            const stoneY = () => { const m = (svg.querySelector('g').getAttribute('transform') || '').match(/translate\(150 ([\d.]+)\)/); return m ? +m[1] : 0; };
            btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
            for (let k = 0; k < 400 && stoneY() < 196; k++) await new Promise((r) => requestAnimationFrame(r));
            btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
            for (let k = 0; k < 80; k++) { await new Promise((r) => setTimeout(r, 40)); if (!document.querySelector('.gm-mo-end').hidden) return 'ok'; }
            return 'not-set';
          });
          log('A: great stone', placed);
          await shot('A-moment-great-stone-done');
          if (placed === 'ok') await click('.gm-mo-go'); else { note('great stone: ' + placed + ' → skipped'); await click('.gm-mo-skip'); }
        }
        await sleep(1500);
        for (let k = 0; k < 10; k++) { if (await visible('.gm-modal.on')) break; await sleep(600); }
        if (await visible('.gm-modal.on')) { await shot('A-stage-done-card', { dark: true }); await gmModalGold(3); }
        else note('no stage-done card after the hill');
        // step 6: the caravans (the dock), 5 minutes
        await pg.waitForFunction(() => __T.game.state.ftue >= 6, null, { timeout: 15000 }).catch(() => note('ftue did not reach 6 (caravans)'));
        await sleep(900);
        await shot('A-coach-caravans');
        const dockBtns = await G(() => [...document.querySelectorAll('.gm-db')].map((e) => e.dataset.k + ':' + (e.innerText || '').trim()));
        log('dock', JSON.stringify(dockBtns));
        await click('.gm-db[data-k="caravans"]');
        await sleep(900);
        if (await visible('.gm-sheet.on')) {
          await shot('A-caravans-sheet', { dark: true });
          const sent = await G(() => { const b = document.querySelector('.gm-sheet.on [data-a="send"][data-len="ftue"]:not([disabled])') || [...document.querySelectorAll('.gm-sheet.on [data-a="send"]:not([disabled])')][0]; if (b) { b.click(); return b.textContent.trim().slice(0, 40); } return null; });
          log('A: caravan', sent);
          if (!sent) note('no "5 דק׳" caravan button in the caravans sheet');
          await sleep(1200);
          await shot('A-caravan-sent');
          await G(() => { const x = document.querySelector('.gm-sheet.on [data-a="close"]') || document.querySelector('.gm-sheet.on .gm-x'); if (x) x.click(); });
          await sleep(700);
        } else note('the caravans sheet did not open from the dock');
        // step 7: start the wall from the goal pill
        await pg.waitForFunction(() => __T.game.state.ftue >= 7, null, { timeout: 10000 }).catch(() => note('ftue did not reach 7 (the wall)'));
        await sleep(800);
        await shot('A-coach-start-wall');
        const pill = (await pg.$('.gm-goal button')) ? '.gm-goal button' : '.gm-goal';
        await click(pill);
        await sleep(900);
        if (await visible('.gm-sheet.on')) {
          await shot('A-wall-sheet');
          const started = await G(() => { const b = document.querySelector('.gm-sheet.on [data-a="start"]'); if (b && !b.disabled) { b.click(); return b.textContent.trim().slice(0, 40); } return b ? 'DISABLED ' + b.textContent.trim().slice(0, 30) + ' | ' + (document.querySelector('.gm-sheet.on').innerText || '').replace(/\s+/g, ' ').slice(0, 160) : null; });
          log('A: wall start', started);
          if (!started) note('no start button in the wall sheet');
          await sleep(1500);
          await gmModalGold(2);
        } else note('tapping the goal pill did not open the wall sheet');
        await shot('A-wall-started', { dark: true });
        await perf('A: building the wall');
        // the other dock tabs a new player opens while the wagons are away
        for (const k of ['crews', 'book', 'daily', 'store']) {
          if (!(await pg.$(`.gm-db[data-k="${k}"]`))) { note('no dock button ' + k); continue; }
          await click(`.gm-db[data-k="${k}"]`);
          await sleep(900);
          await shot('A-dock-' + k, { dark: k === 'daily', noRender: true });
          await G(() => { const x = document.querySelector('.gm-sheet.on [data-a="close"]') || document.querySelector('.gm-sheet.on .gm-x'); if (x) x.click(); });
          await sleep(500);
        }
        // the wagons come back (5 minutes of real time)
        const back = await pg.waitForFunction(() => __T.game.state.ftue >= 9 || __T.game.state.ftue === 99, null, { timeout: 330000, polling: 1000 }).then(() => true, () => false);
        log('A: wagons back', back, 'ftue', await G(() => __T.game.state.ftue));
        if (back) {
          await sleep(800);
          await shot('A-coach-collect');
          await click('.gm-db[data-k="caravans"]');
          await sleep(900);
          const col = await G(() => { const b = document.querySelector('.gm-sheet.on [data-a="collect"]'); if (b) { b.click(); return b.textContent.trim().slice(0, 30); } return null; });
          log('A: collect', col);
          if (!col) note('no collect button in the caravans sheet when the wagons are back');
          await sleep(1500);
          await shot('A-collected');
          await G(() => { const x = document.querySelector('.gm-sheet.on [data-a="close"]') || document.querySelector('.gm-sheet.on .gm-x'); if (x) x.click(); });
          await gmModalGold(3);
        } else note('the wagons did not come back within 5½ minutes (ftue < 9)');
        REPORT.ftue = await G(() => ({ ftue: __T.game.state.ftue, st: __T.game.state.st, log: window.__GAME_LOG.filter((x) => /ftue|stageDone|strike|boulder/.test(x.type)).map((x) => `${Math.round(x.t / 1000)}s ${x.type}${x.d !== undefined ? ':' + JSON.stringify(x.d).slice(0, 30) : ''}`).slice(-60) }));

        /* ════════ B. the menu → Phase B ("הצצה") ════════ */
        await gmModalGold(3);
        await click('[data-a="sheet"][data-k="menu"]');
        await sleep(900);
        await shot('B-menu', { dark: true });
        const avLabel = await text('[data-a="avodah"]');
        log('B: menu Phase B button', avLabel);
        if (!/הצצה/.test(avLabel)) note('the Phase B button does not read "הצצה": ' + avLabel);
        await click('[data-a="avodah"]');
        const inB = await pg.waitForFunction(() => !!window.__AVODAH && document.querySelector('.av'), null, { timeout: 120000, polling: 500 }).then(() => true, () => false);
        if (!inB) note('Phase B did not open from the menu');
        await sleep(3000);
        await shot('B-phaseB-first', { dark: true });
        // whatever the first visit shows (intro, name), accept it like a player would
        for (let k = 0; k < 6; k++) {
          if (await visible('.av-modal.on')) {
            const kick = await text('.av-modal.on .av-kick');
            log('B: modal', kick);
            if (await visible('.av-modal.on input')) await pg.fill('.av-modal.on input', 'אלעזר');
            const b2 = (await pg.$('.av-modal.on [data-v="go"]')) ? '.av-modal.on [data-v="go"]' : (await pg.$('.av-modal.on .av-go')) ? '.av-modal.on .av-go' : '.av-modal.on button.gold, .av-modal.on button';
            await click(b2); await sleep(1500);
            if (k === 0) await shot('B-after-first-card');
          } else break;
        }
        // a one-shot intent (the ritual) may start by itself: note it and stop it at the home
        await sleep(2000);
        const running = await G(() => ({ busy: window.__AVODAH && window.__AVODAH.busy, game: window.__AVODAH && window.__AVODAH._ && window.__AVODAH._.game, home: !!document.querySelector('.av-home.on') }));
        log('B: after entry', JSON.stringify(running));
        if (running.busy) {
          note(`entering via "הצצה" started a game by itself: ${running.game}`);
          await shot('B-autostart-' + (running.game || 'x'));
          // play it through like a player (the solver), cards accepted
          for (let guard = 0; guard < 200; guard++) {
            const st = await G(() => ({ busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on'), g: window.__AVODAH._.game }));
            if (!st.busy && !st.modal) break;
            if (st.mg) { await sleep(2500); await G(() => window.__AVODAH._.solve()); await sleep(1500); continue; }
            if (st.modal) { await G(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); }); await sleep(700); continue; }
            await sleep(600);
          }
        }

        /* ════════ C. the Phase B home ════════ */
        if (!(await visible('.av-home.on'))) await click('.av [data-a="home"]');
        await sleep(1500);
        await shot('C-home-today', { dark: true });
        await perf('C: Phase B home');
        const scrollH = await G(() => { const b = document.querySelector('.av-home.on .av-body') || document.querySelector('.av-home.on [class*="body"]'); if (!b) return 0; return b.scrollHeight - b.clientHeight; });
        for (let k = 1; k <= 3 && scrollH > 40; k++) {
          await G((k) => { const b = document.querySelector('.av-home.on .av-body') || document.querySelector('.av-home.on [class*="body"]'); b.scrollTop = Math.min(b.scrollHeight, k * b.clientHeight * 0.85); }, k);
          await sleep(400);
          await shot('C-home-today-scroll' + k, { noRender: true });
          if (k * 0.85 >= scrollH / (await G(() => (document.querySelector('.av-home.on .av-body') || document.querySelector('.av-home.on [class*="body"]')).clientHeight))) break;
        }
        // a curious player taps the altar in the world above the panel: the tap-to-identify card (info.js)
        await G(() => { window.__HOMEVIS = document.querySelector('.av-home.on') ? 1 : 0; });
        const altarPt = await G(() => { const o = __T.view.project(-38, 22, -3.5); return { x: o.x, y: o.y, on: o.on, top: (document.querySelector('.av-home.on') || document.body).getBoundingClientRect().top }; });
        log('C: altar on screen at', JSON.stringify(altarPt));
        if (altarPt.on && altarPt.y > 60 && altarPt.y < Math.min(S.height, altarPt.top) - 10 && altarPt.x > 0 && altarPt.x < S.width) {
          await tapXY(altarPt.x, altarPt.y); await sleep(900);
          const card = await G(() => { const c = document.getElementById('card'); return c && c.classList.contains('on') ? c.innerText.replace(/\s+/g, ' ') : null; });
          log('C: tap card', card);
          if (card) { if (!/טיוטה/.test(card)) note('tap-to-identify card without "טיוטה": ' + card.slice(0, 120)); await shot('C-tap-world-card', { noRender: true }); await G(() => document.getElementById('cx').click()); await sleep(400); }
          else note('tapping the altar above the Phase B home showed no card');
        } else {
          // the altar is under the panel on this screen: tap whatever structure is in the middle of the free area
          const y = Math.max(80, Math.min(S.height, altarPt.top) / 2);
          await tapXY(S.width / 2, y); await sleep(900);
          const card = await G(() => { const c = document.getElementById('card'); return c && c.classList.contains('on') ? c.innerText.replace(/\s+/g, ' ') : null; });
          log('C: tap card (middle)', card);
          if (card) { if (!/טיוטה/.test(card)) note('tap-to-identify card without "טיוטה": ' + card.slice(0, 120)); await shot('C-tap-world-card', { noRender: true }); await G(() => document.getElementById('cx').click()); await sleep(400); }
        }
        for (const tab of ['book', 'path']) {
          const ok = await G((t) => { const b = document.querySelector(`.av-home.on [data-tab="${t}"]`); if (b) { b.click(); return true; } return false; }, tab);
          if (!ok) { note('no home tab ' + tab); continue; }
          await sleep(700);
          await shot('C-home-' + tab, { dark: tab === 'path', noRender: true });
        }
        await G(() => { const b = document.querySelector('.av-home.on [data-tab="today"]'); if (b) b.click(); });
        await sleep(500);

        /* ════════ D. one full morning service, in practice ════════ */
        const tile = await pg.$('.av-home.on [data-play="shachar"][data-mode="practice"]');
        if (!tile) note('no practice tile for the whole morning service');
        else {
          await tile.scrollIntoViewIfNeeded().catch(() => {});
          await click('.av-home.on [data-play="shachar"][data-mode="practice"]');
          const ltFrom = await G(() => performance.now());
          const seen = []; let last = null; const t0 = Date.now(); const cardShots = new Set(['zerika', 'taleh', 'kiddush', 'shir']);
          for (let guard = 0; guard < 500; guard++) {
            const st = await G(() => ({ g: window.__AVODAH._.game, busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on'), kick: ((document.querySelector('.av-modal.on .av-kick') || {}).textContent || '') }));
            if (!st.busy && !st.modal && seen.length) break;
            if (st.g && st.g !== last && st.mg) {
              last = st.g; seen.push(st.g);
              await sleep(st.g === 'heichal' || st.g === 'ketoret' ? 7500 : 5000);
              if (!LITE || ['kiddush', 'heichal', 'zerika', 'ketoret', 'shir'].includes(st.g)) await shot(`D-${String(seen.length).padStart(2, '0')}-${st.g}`, { dark: st.g === 'evarim' });
              if (st.g === 'zerika') await perf('D: zerika (the altar)');
              if (st.g === 'heichal') await perf('D: heichal (inside)');
              await G(() => window.__AVODAH._.solve());
              await sleep(1200);
              if (st.g === 'zerika') { await sleep(1500); await shot('D-zerika-after-1'); await sleep(2500); await shot('D-zerika-after-2'); }
              continue;
            }
            if (st.modal) {
              if (/סוף העבודה|הושלם/.test(st.kick) || (!LITE && cardShots.has(last))) { await shot(`D-card-${last || 'x'}${/סוף|הושלם/.test(st.kick) ? '-summary' : ''}`); cardShots.delete(last); }
              await G(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); });
              await sleep(600); continue;
            }
            await sleep(700);
          }
          const ltTo = await G(() => performance.now());
          REPORT.service = { seen, secs: Math.round((Date.now() - t0) / 1000), longTasks: await G(([a, b]) => window.__QA.lts(a, b), [ltFrom, ltTo]) };
          log('D: service', seen.join(','), REPORT.service.secs + 's', 'long tasks (JS, outside renders):', REPORT.service.longTasks.length, JSON.stringify(REPORT.service.longTasks.slice(0, 12)));
          if (seen.length < 14) note(`the morning service played ${seen.length}/14 games: ${seen.join(',')}`);
          await sleep(1500);
          await gmModalGold(1);
          if (!(await visible('.av-home.on'))) await click('.av [data-a="home"]');
          await sleep(1000);
          await shot('D-home-after-service');
        }

        /* ════════ E. the tour (every stop), the Ark mystery, Yom Kippur (from the Phase B home) ════════ */
        const scenesRun = async (kind, tag) => {
          if (!(await visible('.av-home.on'))) await click('.av [data-a="home"]');
          await sleep(600);
          const btn = `.av-home.on [data-a="scenes"][data-k="${kind}"]`;
          if (!(await pg.$(btn))) { note(`no ${kind} button on the Phase B home`); await G((k) => window.__openScenes(k), kind); }
          else { await pg.$eval(btn, (e) => e.scrollIntoView({ block: 'center' })); await click(btn); }
          await pg.waitForFunction(() => window.__SCENES && window.__SCENES.state.open && !window.__SCENES.state.busy, null, { timeout: 90000, polling: 300 }).catch(() => note(kind + ': the scene did not settle in 90 s'));
          const ids = await G(() => window.__SCENES.state.stops);
          const seenIds = [];
          if (kind === 'tour') {
            // a player taps the Phase B home button while the tour is open: what shows?
            if (await visible('.av [data-a="home"]')) {
              await click('.av [data-a="home"]');
              await sleep(900);
              const both = await G(() => ({ home: !!document.querySelector('.av-home.on'), tour: !!(window.__SCENES && window.__SCENES.state.open) }));
              log('E: home pressed during the tour', JSON.stringify(both));
              if (both.home && both.tour) note('the Phase B home opens under the open tour panel (two panels at once)');
              await shot('E-tour-home-pressed', { noRender: true });
              if (both.home) { await G(() => { const h = document.querySelector('.av-home.on'); if (h) document.querySelector('.av [data-a="home"]').click(); }); await sleep(600); }
            }
          }
          for (let guard = 0; guard < 40; guard++) {
            const st = await G(() => ({ ...window.__SCENES.state, room: __T.sanctuary && __T.sanctuary.state ? __T.sanctuary.state.room : '?' }));
            if (!st.open || st.mode !== kind) break;
            const key = `${st.id}#${st.card}`;
            if (!seenIds.includes(key)) {
              seenIds.push(key);
              const heavy = ['heichal', 'kodesh', 'yk_ketoret_entry', 'yk_even_shtiya', 'yk_sprinkling', 'yk_goat_and_parochet', 'yk_take_out_machta', 'find', 'stone'];
              if (!LITE || heavy.includes(st.id) || st.card === 0 && ['courts', 'bows', 'end', 'yk_lots', 'yk_feast'].includes(st.id)) {
                await sleep(800);
                await shot(`E-${tag}-${String(ids.indexOf(st.id) + 1).padStart(2, '0')}-${st.id}${st.card ? '-c' + st.card : ''}`, { dark: st.id === 'kodesh' || st.id === 'find', noRender: st.card > 0 });
                if (['heichal', 'kodesh', 'yk_sprinkling'].includes(st.id) && st.card === 0) await perf(`E: ${tag} ${st.id} (room ${st.room})`);
              }
              log(`E: ${tag} ${st.id} card ${st.card} room ${st.room}`);
            }
            // like a player: wash when asked, bow at the odd stone, then "הבא"/"המשך"
            if (await pg.$('.sc-panel [data-a="wash"]')) { await click('.sc-panel [data-a="wash"]'); await sleep(500); await shot(`E-${tag}-washed`, { noRender: true }); }
            if (await pg.$('.sc-panel [data-a="bow"]')) { await click('.sc-panel [data-a="bow"]'); await sleep(900); await shot(`E-${tag}-bowed`); }
            await click('.sc-panel [data-a="next"]', { timeout: 8000 });
            await pg.waitForFunction(() => !window.__SCENES.state.open || !window.__SCENES.state.busy, null, { timeout: 90000, polling: 300 }).catch(() => note(`${kind}: a stop did not settle in 90 s (${key})`));
            await sleep(400);
          }
          const endState = await G(() => ({ open: window.__SCENES.state.open, home: !!document.querySelector('.av-home.on') }));
          log(`E: ${tag} done`, seenIds.join(' '), JSON.stringify(endState));
          REPORT[tag] = { stops: ids, seen: seenIds, end: endState };
          if (endState.open) { note(`${kind}: still open after the last "הבא"`); await G(() => window.__SCENES.close()); }
          await sleep(1200);
          if (!(await visible('.av-home.on'))) note(`${kind}: closing the scene did not bring back the Phase B home`);
        };
        await scenesRun('tour', 'tour');
        await scenesRun('ark', 'ark');
        await scenesRun('yk', 'yk');
        await shot('E-home-after-scenes', { noRender: false });

        /* ════════ F. back to building, and the tour from Phase A ════════ */
        if (!(await visible('.av-home.on'))) await click('.av [data-a="home"]');
        const bb = await pg.$('.av [data-a="build"]');
        if (!bb) note('no "back to building" on the Phase B home');
        else {
          await pg.$eval('.av [data-a="build"]', (e) => e.scrollIntoView({ block: 'center' }));
          await click('.av [data-a="build"]');
          const back = await pg.waitForFunction(() => window.__T.game && window.__T.game.state && !window.__AVODAH, null, { timeout: 60000, polling: 500 }).then(() => true, () => false);
          if (!back) note('back to building: Phase A did not come back');
          await sleep(2500);
          await shot('F-phaseA-back', { dark: true });
          const st = await G(() => ({ ftue: __T.game.state.ftue, har: __T.game.state.st.har, wall: __T.game.state.st.wall, name: __T.game.state.name }));
          log('F: Phase A state', JSON.stringify(st));
          await gmModalGold(3);
          await sleep(1500);
          await shot('F-phaseA-back-clear');
          await click('[data-a="sheet"][data-k="menu"]');
          await sleep(900);
          if (await pg.$('.gm-sheet.on [data-a="scenes"][data-k="tour"]')) {
            await click('.gm-sheet.on [data-a="scenes"][data-k="tour"]');
            await pg.waitForFunction(() => window.__SCENES && window.__SCENES.state.open && !window.__SCENES.state.busy, null, { timeout: 90000, polling: 300 }).catch(() => note('tour from A did not settle'));
            await sleep(800);
            await shot('F-tour-from-A');
            await G(() => window.__SCENES.close());
            const backA = await pg.waitForFunction(() => window.__T.game && window.__T.game.state && document.querySelector('.gm-rb'), null, { timeout: 60000, polling: 500 }).then(() => true, () => false);
            if (!backA) note('closing the tour from Phase A did not bring back the building');
            await sleep(2000);
            await shot('F-after-tour-from-A');
          } else note('no tour button in the Phase A menu');
          // the whole-Temple view from the menu (an investor's natural tap), and a tap on the altar there
          await gmModalGold(3);
          await click('[data-a="sheet"][data-k="menu"]');
          await sleep(900);
          if (await pg.$('.gm-sheet.on [data-a="whole"]')) {
            await click('.gm-sheet.on [data-a="whole"]');
            await sleep(3500);
            await shot('F-whole-view', { dark: true });
            await perf('F: whole view (olives)');
            await G(() => { __T.jump('altar'); });
            await sleep(500);
            await shot('F-whole-altar-view');
            const pt = await G(() => { const o = __T.view.project(-38, 22, -3.5); return { x: o.x, y: o.y, on: o.on }; });
            if (pt.on && pt.x > 0 && pt.x < S.width && pt.y > 0 && pt.y < S.height) {
              await tapXY(pt.x, pt.y); await sleep(900);
              const card = await G(() => { const c = document.getElementById('card'); return c && c.classList.contains('on') ? c.innerText.replace(/\s+/g, ' ') : null; });
              log('F: whole-view tap card', card && card.slice(0, 100));
              if (card && !/טיוטה/.test(card)) note('whole view: tap-to-identify card without "טיוטה": ' + card.slice(0, 80));
              await shot('F-whole-tap-card', { noRender: true });
            }
            await G(() => { const b = document.querySelector('.gm-back'); if (b) b.click(); });
            await sleep(2500);
            await shot('F-whole-back');
          } else note('no whole-Temple view button in the Phase A menu');
        }
      }

      if (part === 'ui') {
        /* ════════ U. the responsive pass (UI wave 4): every layer set up directly, light + dark ════════ */
        await pg.waitForFunction(() => __T.game && __T.game.state && __T.game.ui, null, { timeout: 120000 });
        const both = async (name, opt = {}) => shot(name, { dark: true, noRender: true, ...opt });
        const ui = (fn, a) => G(fn, a).catch((e) => note('ui step failed: ' + String(e).slice(0, 160)));
        await sleep(600);
        // the 3D frame once (the olives view of the building site); everything after is DOM over it
        await shot('A-hud-first-frame', { dark: false });
        await ui(() => { const v = document.querySelector('.gm-vision'); v.querySelector('h1').textContent = 'כאן ייבנה הבית.'; v.style.transition = 'none'; v.classList.add('on'); });
        await both('A-vision');
        await ui(() => { const v = document.querySelector('.gm-vision'); v.classList.remove('on'); v.style.transition = ''; });
        await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { timeout: 20000 }).catch(() => note('ftue 1 did not come'));
        await sleep(500);
        await both('A-hud-coach');
        // the investor strip (demo mode's flag only: the HUD shows its strip)
        await ui(() => { __T.game.state.demo = true; __T.game.ui.refresh(); });
        await sleep(300);
        await both('A-demo-strip');
        await ui(() => { __T.game.state.demo = false; __T.game.ui.refresh(); });
        // every sheet
        for (const k of ['crews', 'caravans', 'book', 'daily', 'store', 'menu']) {
          await ui((k) => __T.game.ui.openSheet(k), k); await sleep(450);
          await shot('A-sheet-' + k, { dark: k === 'book' || k === 'menu' || k === 'store', noRender: true });
          if (k === 'book') { await ui(() => { const sh = document.querySelector('.gm-sheet.on .gm-sh-b'); sh.scrollTop = sh.scrollHeight; }); await sleep(200); await shot('A-sheet-book-locked', { dark: true, noRender: true }); }
        }
        await ui(() => __T.game.ui.openSheet('stage', 'har')); await sleep(450);
        await shot('A-sheet-stage', { noRender: true });
        await ui(() => __T.game.ui.closeSheet()); await sleep(400);
        // a card while the coach speaks (QA P2-5), then the name + mishmar prompt
        await ui(() => { __T.game.ui.coach(null, 'שלח את עגלות המחצבה: הן יחזרו בעוד 5 דקות'); window.__qaCard = __T.game.ui.stageDoneCard({ id: 'har', rewards: { stone: 40, cedar: 20 }, mishnayot: ['1.1', '1.2'], crewsNow: true }); });
        await sleep(700);
        await both('A-card-over-coach');
        await ui(() => { const b = document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) b.click(); __T.game.ui.coach(null, ''); });
        await sleep(600);
        await ui(() => { window.__qaName = __T.game.ui.namePrompt(); });
        await sleep(700);
        await ui(() => { const b = document.querySelector('.gm-modal.on [data-m="8"]'); if (b) b.click(); });
        await both('A-name-prompt');
        await ui(() => { const b = document.querySelector('.gm-modal.on .gm-btn:not(.gm-btn-gold)') || document.querySelector('.gm-modal.on .gm-btn-gold'); if (b) b.click(); });
        await sleep(600);
        // two key moments (the replay path: no state change)
        for (const k of ['greatStone', 'gates']) {
          await ui((k) => { const b = document.createElement('button'); b.dataset.a = 'replay'; b.dataset.k = k; __T.game.ui.root.appendChild(b); b.click(); b.remove(); }, k);
          const on = await pg.waitForSelector('.gm-mo.on', { timeout: 8000 }).then(() => true, () => false);
          if (!on) { note('moment ' + k + ' did not open'); continue; }
          await sleep(700);
          await shot('A-moment-' + k, { dark: k === 'gates', noRender: true });
          await ui(() => { const b = document.querySelector('.gm-mo.on .gm-mo-skip'); if (b) b.click(); });
          await sleep(700);
        }
        /* Phase B from the menu */
        await ui(() => __T.game.ui.openSheet('menu')); await sleep(450);
        await ui(() => { const b = document.querySelector('.gm-sheet.on [data-a="avodah"]'); if (b) b.click(); });
        const inB = await pg.waitForFunction(() => !!window.__AVODAH && document.querySelector('.av'), null, { timeout: 180000, polling: 500 }).then(() => true, () => false);
        if (!inB) note('Phase B did not open from the menu');
        await sleep(2500);
        for (let k = 0; k < 4; k++) {
          if (!(await visible('.av-modal.on'))) break;
          const hasInput = await visible('.av-modal.on input');
          if (hasInput) { await pg.fill('.av-modal.on input', 'אלעזר'); await ui(() => { const b = document.querySelector('.av-modal.on [data-m="8"]'); if (b) b.click(); }); }
          await shot(hasInput ? 'B-name-prompt' : 'B-intro-' + k, { dark: true, noRender: k > 0 });
          await ui(() => { const g = document.querySelector('.av-modal.on [data-v="ok"]') || document.querySelector('.av-modal.on [data-v="go"]') || document.querySelector('.av-modal.on .av-go'); if (g) g.click(); });
          await sleep(1200);
        }
        // a one-shot intent may start a game by itself: stop at the home
        for (let guard = 0; guard < 60; guard++) {
          const st = await G(() => ({ busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on') }));
          if (!st.busy && !st.modal) break;
          if (st.mg) { await G(() => window.__AVODAH._.solve()); await sleep(1200); continue; }
          if (st.modal) { await G(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); }); await sleep(600); continue; }
          await sleep(500);
        }
        if (!(await visible('.av-home.on'))) await ui(() => { const b = document.querySelector('.av [data-a="home"]'); if (b) b.click(); });
        await sleep(1000);
        await shot('B-home-today', { dark: true });
        await ui(() => { const b = document.querySelector('.av-home.on .av-body'); if (b) b.scrollTop = b.scrollHeight; }); await sleep(300);
        await both('B-home-today-end');
        await ui(() => { const b = document.querySelector('.av-home.on .av-body'); if (b) b.scrollTop = 0; });
        // the tap-to-identify card over the home (QA P2-1)
        await ui(() => __T.showInfo('altar')); await sleep(500);
        await both('B-tap-card-over-home');
        await ui(() => { const x = document.getElementById('cx'); if (x) x.click(); }); await sleep(300);
        for (const tab of ['book', 'path']) {
          await ui((t) => { const b = document.querySelector(`.av-home.on [data-tab="${t}"]`); if (b) b.click(); }, tab); await sleep(500);
          await both('B-home-' + tab);
        }
        await ui(() => { const b = document.querySelector('.av-home.on [data-tab="today"]'); if (b) b.click(); }); await sleep(400);
        // a mini-game panel and its source card
        await ui(() => { const b = document.querySelector('.av-home.on [data-play="kiddush"]') || document.querySelector('.av-home.on .av-tile[data-play]:not(.wide)'); if (b) b.click(); });
        const mg = await pg.waitForSelector('.av-mg.on', { timeout: 30000 }).then(() => true, () => false);
        if (mg) {
          await sleep(3500);
          await both('B-minigame');
          await G(() => window.__AVODAH._.solve()).catch(() => {});
          for (let k = 0; k < 20; k++) { if (await visible('.av-modal.on')) break; await sleep(500); }
          if (await visible('.av-modal.on')) { await sleep(800); await both('B-minigame-card'); }   // (after the card's fade-in)
          for (let guard = 0; guard < 40; guard++) {
            const st = await G(() => ({ busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on') }));
            if (!st.busy && !st.modal) break;
            if (st.mg) { await G(() => window.__AVODAH._.solve()); await sleep(1000); continue; }
            if (st.modal) { await G(() => { const g = document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); }); await sleep(500); continue; }
            await sleep(400);
          }
        } else note('no mini-game panel from the practice tile');
        // the tour panel
        await ui(() => window.__openScenes('tour'));
        await pg.waitForFunction(() => window.__SCENES && window.__SCENES.state.open && !window.__SCENES.state.busy, null, { timeout: 90000, polling: 300 }).catch(() => note('the tour did not settle'));
        await sleep(600);
        await both('B-tour-panel');
        await ui(() => __T.showInfo('altar')); await sleep(500);
        await shot('B-tap-card-over-tour', { noRender: true });
        await ui(() => { const x = document.getElementById('cx'); if (x) x.click(); window.__SCENES.close(); });
        await sleep(1200);
      }

      if (part === 'demo') {
        /* ════════ G. #demo: the investor's highlight reel ════════ */
        await pg.waitForFunction(() => __T.game && __T.game.state, null, { timeout: 60000 });
        await sleep(2500);
        await shot('G-demo-start', { dark: true });
        const demo = await G(() => ({ demo: __T.game.state.demo, strip: !!document.querySelector('.gm-demo'), hl: !!document.querySelector('.gm-demo .gm-hl'), txt: (document.querySelector('.gm-demo') || {}).innerText || '' }));
        log('G: demo', JSON.stringify(demo));
        if (!demo.hl) note('#demo: no "הרגע הבא ✦" button');
        for (let h = 0; h < 10; h++) {
          await gmModalGold(4);
          const left = await G(() => (__T.game && __T.game.state && __T.game.state.demo && document.querySelector('.gm-demo .gm-hl') ? 1 : __T.game && !__T.game.state ? -1 : 0));
          if (left === -1) { note('demo: Phase B took over the reel'); await shot('G-phaseB-took-over'); break; }
          if (!left) break;
          const before = await G(() => window.__GAME_LOG.filter((x) => x.type === 'highlight').length);
          await click('.gm-demo .gm-hl');
          const ok = await pg.waitForFunction((n) => window.__GAME_LOG.filter((x) => x.type === 'highlight').length > n, before, { timeout: 15000, polling: 250 }).then(() => true, () => false);
          if (!ok) { note(`highlight ${h + 1}: pressing "הרגע הבא ✦" did nothing within 15 s`); await shot(`G-hl${h + 1}-nothing`); break; }
          const hl = await G(() => window.__GAME_LOG.filter((x) => x.type === 'highlight').pop().d);
          log('G: highlight', h + 1, JSON.stringify(hl));
          await sleep(1800);
          // a key moment frames its site first (momentFX 'frame', wave 3), so its card can open a few seconds after the press
          if (hl.how === 'moment') await pg.waitForSelector('.gm-mo.on', { timeout: 10000, polling: 250 }).catch(() => null);
          if (await visible('.gm-mo.on')) {
            await shot(`G-hl${h + 1}-${hl.id}-moment`, { dark: h === 2 });
            const r = await G(async () => {
              const wait = (ms) => new Promise((r) => setTimeout(r, ms)); const raf = () => new Promise((r) => requestAnimationFrame(r));
              const end = () => !document.querySelector('.gm-mo-end').hidden;
              const gaps = [...document.querySelectorAll('.gm-mo-gap')];
              if (gaps.length) { for (const g of gaps) { g.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); await wait(90); } }
              const svg = document.querySelector('.gm-mo-svg'), hold = document.querySelector('.gm-mo-hold'), drag = document.querySelector('.gm-mo-drag');
              if (hold && svg && /אבן/.test(svg.getAttribute('aria-label') || '')) {
                const y = () => { const m = (svg.querySelector('g').getAttribute('transform') || '').match(/translate\(150 ([\d.]+)\)/); return m ? +m[1] : 0; };
                hold.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
                for (let k = 0; k < 400 && y() < 196; k++) await raf();
                hold.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
              } else if (hold) {
                for (let k = 0; k < 22 && !end(); k++) { hold.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); await wait(1000); hold.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await wait(800); }
              }
              if (drag) return 'drag';
              for (let k = 0; k < 60 && !end(); k++) await wait(50);
              return end() ? 'ok' : 'not-done';
            });
            if (r === 'drag') {
              const box = await (await pg.$('.gm-mo-drag')).boundingBox();
              const mid = 244 - 5 * ((244 - 54) / 10);
              await pg.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3); await pg.mouse.down();
              await pg.mouse.move(box.x + box.width / 2, box.y + box.height * (mid / 262), { steps: 6 });
              await pg.mouse.up();
              await sleep(800);
            }
            const fin = await visible('.gm-mo-go');
            log('G: moment', hl.id, r, fin ? 'finished' : 'NOT finished');
            await shot(`G-hl${h + 1}-${hl.id}-moment-end`, { noRender: true });
            if (fin) await click('.gm-mo-go'); else { note(`demo moment ${hl.id}: the automated player could not finish it (${r}); skipped`); await click('.gm-mo-skip'); }
            await sleep(2500);
          } else {
            await sleep(3500);
          }
          for (let k = 0; k < 8; k++) { if (await visible('.gm-modal.on')) break; await sleep(700); }
          await shot(`G-hl${h + 1}-${hl.id}`, { dark: hl.id === 'heichal' });
          if (hl.id === 'heichal' || hl.id === 'karnot') await perf(`G: after ${hl.id}`);
          const cards = await gmModalGold(5);
          if (cards) { await sleep(1500); await shot(`G-hl${h + 1}-${hl.id}-after-cards`); }
          await sleep(1200);
        }
        const fin = await G(() => ({ done: __T.game && __T.game.state ? __T.game.state.st : {}, hl: !!document.querySelector('.gm-demo .gm-hl'), modal: !!document.querySelector('.gm-modal.on') }));
        REPORT.demoEnd = fin;
        log('G: after the reel', JSON.stringify({ hl: fin.hl, modal: fin.modal, done: Object.entries(fin.done).filter(([, v]) => v && v.done).map(([k]) => k).join(',') }));
        await shot('G-demo-end', { dark: true });
        await gmModalGold(6);
        await sleep(2000);
        await shot('G-demo-end-2');
        // the finale / whole view as an investor would see it
        await click('[data-a="sheet"][data-k="menu"]');
        await sleep(900);
        await shot('G-demo-menu', { noRender: true });
      }

      if (part === 'mine') {
        /* ════════ H. #avodah=mine: the ~3-minute Phase B demo ════════ */
        const inB = await pg.waitForFunction(() => !!window.__AVODAH && document.querySelector('.av'), null, { timeout: 120000, polling: 500 }).then(() => true, () => false);
        if (!inB) note('#avodah=mine: Phase B did not open');
        await sleep(2500);
        await shot('H-mine-start', { dark: true });
        const t0 = Date.now(); const ltFrom = await G(() => performance.now());
        const seen = []; let last = null;
        for (let guard = 0; guard < 400; guard++) {
          const st = await G(() => ({ g: window.__AVODAH._.game, busy: window.__AVODAH.busy, mg: !!document.querySelector('.av-mg.on'), modal: !!document.querySelector('.av-modal.on'), kick: ((document.querySelector('.av-modal.on .av-kick') || {}).textContent || ''), home: !!document.querySelector('.av-home.on') }));
          if (!st.busy && !st.modal && (seen.length || guard > 30)) break;
          if (st.g && st.g !== last && st.mg) {
            last = st.g; seen.push(st.g);
            await sleep(4500);
            await shot(`H-${String(seen.length).padStart(2, '0')}-${st.g}`);
            await G(() => window.__AVODAH._.solve());
            await sleep(1500);
            continue;
          }
          if (st.modal) {
            if (await visible('.av-modal.on input')) await pg.fill('.av-modal.on input', 'אלעזר');
            await shot(`H-card-${(st.kick || 'x').replace(/[^א-ת]+/g, '_').slice(0, 20)}`, { noRender: true });
            await G(() => { const g = document.querySelector('.av-modal.on [data-v="go"]') || document.querySelector('.av-modal.on .av-go') || document.querySelector('.av-modal.on button'); if (g) g.click(); });
            await sleep(800); continue;
          }
          await sleep(700);
        }
        const ltTo = await G(() => performance.now());
        REPORT.mine = { seen, secs: Math.round((Date.now() - t0) / 1000), longTasks: await G(([a, b]) => window.__QA.lts(a, b), [ltFrom, ltTo]) };
        log('H: mine', seen.join(','), REPORT.mine.secs + 's');
        await sleep(1500);
        await shot('H-mine-end', { dark: true });
        await perf('H: after the demo');
      }

      REPORT.longTasksAll = await G(() => window.__QA.lts(0, performance.now())).catch(() => []);
      REPORT.memory = await G(() => (performance.memory ? { used: Math.round(performance.memory.usedJSHeapSize / 1048576), total: Math.round(performance.memory.totalJSHeapSize / 1048576), limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) } : null)).catch(() => null);
      fs.writeFileSync(path.join(OUTROOT, `${VP}-${part}.json`), JSON.stringify(REPORT, null, 1));
      log(`${part}: ${REPORT.shots.length} shots, ${REPORT.errors.length} errors, ${REPORT.warns.length} warnings, notes: ${REPORT.notes.length}`);
      for (const e of REPORT.errors.slice(0, 10)) log('  error:', e);
      for (const w of REPORT.warns.slice(0, 20)) log('  warn:', w);
      await ctx.close();
    } catch (e) { log(`PART ${part} FAILED:`, String(e).slice(0, 400)); try { const R = globalThis.__REPORT; R.failed = String(e).slice(0, 400); fs.writeFileSync(path.join(OUTROOT, `${VP}-${part}.json`), JSON.stringify(R, null, 1)); } catch (e2) { /* */ } }
    }
  } finally { await b.close(); }
  log('done');
})().catch((e) => { console.error(e); process.exit(1); });
