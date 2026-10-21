// A measuring probe for other suites (HOOKS agent, round 3): preload it with `node -r` in front of any Playwright
// script and every page that script opens gets an init script that times the Phase A key-moment overlays (.gm-mo):
// open → end card → closed, the taps and keys inside, every hint the player is shown (step changes and nudges), and
// the words the player would read. Nothing in the probed script changes; the numbers go to PROBE_OUT (JSON).
//   PROBE_OUT=test/out/playtest/moments-probe.json node -r ./test/playtest/probe-preload.cjs test/moments.cjs --harness
const Module = require('module');
const fs = require('fs');
const path = require('path');
const OUT = process.env.PROBE_OUT || path.resolve(__dirname, '../out/playtest/probe.json');
const recs = [];
let viewport = null;

/* ── in the page ── */
const PROBE = () => {
  if (window.__probeOn) return;
  window.__probeOn = true;
  const words = (s) => (String(s || '').replace(/\s+/g, ' ').trim().match(/[֐-׿A-Za-z0-9]+/g) || []).length;
  let cur = null;
  const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  function start(mo) {
    cur = { title: txt(mo.querySelector('.gm-mo-t')), t0: performance.now(), taps: 0, keys: 0, hints: [], tEnd: null, tClose: null, skipped: null, srcWords: 0, doneWords: 0, vw: innerWidth, vh: innerHeight };
    const h = mo.querySelector('.gm-mo-hint');
    const note = () => { const t = txt(h); const last = cur.hints[cur.hints.length - 1]; if (t && (!last || last.text !== t)) cur.hints.push({ t: Math.round(performance.now() - cur.t0), text: t, w: words(t) }); };
    note();
    if (h) new MutationObserver(note).observe(h, { childList: true, characterData: true, subtree: true });
    const end = mo.querySelector('.gm-mo-end');
    if (end) new MutationObserver(() => { if (!end.hidden && cur && cur.tEnd == null) { cur.tEnd = Math.round(performance.now() - cur.t0); cur.srcWords = words(txt(end.querySelector('.gm-mo-src'))); cur.doneWords = words(txt(h)); } }).observe(end, { attributes: true, attributeFilter: ['hidden'] });
    const skip = mo.querySelector('.gm-mo-skip'); if (skip) skip.addEventListener('click', () => { if (cur) cur.skipped = true; }, { capture: true });
    const go = mo.querySelector('.gm-mo-go'); if (go) go.addEventListener('click', () => { if (cur) cur.skipped = false; }, { capture: true });
  }
  function stop() {
    if (!cur) return;
    cur.tClose = Math.round(performance.now() - cur.t0);
    const r = cur; cur = null;
    try { window.__probeOut(JSON.stringify(r)); } catch (e) { /* no binding */ }
  }
  addEventListener('pointerdown', (e) => { if (cur && e.target && e.target.closest && e.target.closest('.gm-mo')) cur.taps++; }, { capture: true });
  addEventListener('keydown', (e) => { if (cur && document.querySelector('.gm-mo')) cur.keys++; }, { capture: true });
  const obs = new MutationObserver((ms) => {
    for (const m of ms) {
      for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('gm-mo')) { if (cur) stop(); start(n); }
      for (const n of m.removedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('gm-mo')) stop();
    }
  });
  const arm = () => obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
  if (document.body) arm(); else addEventListener('DOMContentLoaded', arm);
};

function patchContext(ctx) {
  if (!ctx || ctx.__probed) return ctx;
  ctx.__probed = true;
  const add = ctx.addInitScript(PROBE).catch(() => {});
  const bind = ctx.exposeFunction('__probeOut', (j) => { try { const r = JSON.parse(j); r.viewport = viewport; recs.push(r); } catch (e) { /* ignore */ } }).catch(() => {});
  ctx.__probeReady = Promise.all([add, bind]);
  return ctx;
}
function patchBrowser(b) {
  if (!b || b.__probed) return b;
  b.__probed = true;
  const nc = b.newContext.bind(b);
  b.newContext = async (opts = {}) => { viewport = opts.viewport || null; const c = patchContext(await nc(opts)); await c.__probeReady; return c; };
  const np = b.newPage.bind(b);
  b.newPage = async (opts = {}) => { const c = await b.newContext(opts); const p = await c.newPage(); return p; };
  void np;
  return b;
}
const orig = Module._load;
Module._load = function (req, parent, isMain) {
  const m = orig.apply(this, arguments);
  if (req === 'playwright' && m && m.chromium && !m.chromium.__probed) {
    m.chromium.__probed = true;
    const launch = m.chromium.launch.bind(m.chromium);
    m.chromium.launch = async (...a) => patchBrowser(await launch(...a));
  }
  return m;
};
process.on('exit', () => {
  try { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(recs, null, 1)); } catch (e) { /* ignore */ }
});
