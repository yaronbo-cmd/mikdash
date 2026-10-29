/* ── build 56ג ── report56.js — "🐞 דווח": the tester's report button (the owner, 29.10 19:33). Every version is a test version for now,
 * so the button always shows (until the owner says otherwise). F2 on a computer. A report keeps: a JPEG screenshot (800 px wide), the
 * version, the stage / act / screen, the player's place and the main state, the last 20 actions, every code error since the start, the
 * device, the screen, the browser and the time; a free note (Win+H dictation is plain typing) and a severity. Reports go to the
 * artifact's database (the `db` capability: Claude reads them from the conversation), else they stay on this phone; "ייצא הכל" saves
 * one JSON file of them all. NOTHING here may break the game: every entry point is guarded, the error hooks only record.
 * Imported second by main.js (after fix56), so the errors are caught from the start. Never a Divine Name. */
const g = globalThis;
const R56 = { errors: [], actions: [], t0: Date.now(), last: {}, db: null, dbTried: false, local: [], open: false };
g.__R56 = R56;
const cut = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);
function pushErr(kind, msg, extra) { try { R56.errors.push({ t: Date.now() - R56.t0, kind, msg: cut(msg, 400), ...(extra || {}) }); if (R56.errors.length > 200) R56.errors.splice(0, R56.errors.length - 200); } catch (e) { /* */ } }
function act(type, d) { try { R56.actions.push({ t: Date.now() - R56.t0, at: new Date().toISOString().slice(11, 19), type, ...d }); if (R56.actions.length > 60) R56.actions.splice(0, R56.actions.length - 60); } catch (e) { /* */ } }
// ── the errors, from the first line on ──
try {
  const ce = console.error.bind(console);
  console.error = function (...a) { try { pushErr('console.error', a.map((x) => (x && x.stack) || (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')); } catch (e) { /* */ } return ce(...a); };
  g.addEventListener('error', (ev) => pushErr('window.onerror', ev.message || (ev.error && ev.error.message), { src: cut(ev.filename, 80), line: ev.lineno, col: ev.colno, stack: cut(ev.error && ev.error.stack, 600) }), true);
  g.addEventListener('unhandledrejection', (ev) => pushErr('unhandledrejection', (ev.reason && (ev.reason.stack || ev.reason.message)) || String(ev.reason)));
} catch (e) { /* */ }
// ── the player's actions: taps, keys; screens, acts and lines by a light poll ──
function label(el) {
  try { for (let i = 0; el && i < 4; i++, el = el.parentElement) { const s = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('title')); if (s) return cut(s, 40); if (el.tagName === 'BUTTON' || el.getAttribute && el.getAttribute('role') === 'button') return cut(el.textContent, 40); } } catch (e) { /* */ }
  return '';
}
function snapState() {
  const s = { title: cut(document.title, 120), build: build56(), url: cut((g.__QS56 || '') + (g.__QH56 || ''), 120) };
  try { const H = g.__H42; if (H && H.on) { const st = H.state(), j = H.job(); s.phaseA = { stg: st.stg, part: st.part, mode: st.mode, card: !!st.card, test: st.test || null, line: cut(H.line(), 160), job: j ? j.kind : null, grades: (st.grades || []).map((q) => q.slice(0, 2).join(':')) }; } } catch (e) { s.phaseA = { err: cut(e.message, 80) }; }
  try { const S = g.__SHIFT; const st = S && S.E && S.E.st33; if (st) s.phaseB = { phase: st.phase, day: st.day, night: !!st.night, prac: (S.E && S.E.prac31) || null, perutot: st.perutot }; } catch (e) { /* */ }
  try { const hp = { x: 0, y: 0, z: 0 }; g.__T && g.__T.stages && g.__T.stages.heroXYZ && g.__T.stages.heroXYZ(hp); s.hero = { x: +hp.x.toFixed(2), y: +hp.y.toFixed(2), z: +hp.z.toFixed(2) }; } catch (e) { /* */ }
  try { const K = g.__KID; if (K && K.scan) { const k = K.scan({ build: 0, checks: false }); s.screen = { line: cut(k.line, 160), screens: k.screens, buttons: (k.tp || []).filter((q) => q.reach).map((q) => cut(q.lb, 30)).slice(0, 12) }; } } catch (e) { /* */ }
  if (!s.screen) try { s.screen = { overlays: [...document.querySelectorAll('[class*="card"].on, .lb-draft, .t56')].map((e) => cut(e.className, 40)).slice(0, 8) }; } catch (e) { /* */ }
  return s;
}
function poll() {
  try {
    const H = g.__H42, L = R56.last; let k;
    if (H && H.on) { const st = H.state(), j = H.job(); k = `${st.stg}|${st.part}`; if (k !== L.part) { act('screen', { to: k, mode: st.mode }); L.part = k; } const jk = j ? j.kind : ''; if (jk !== L.job) { act(jk ? 'act-start' : 'act-end', { act: jk || L.job }); L.job = jk; } const n = (st.grades || []).length; if (n !== L.grades) { if (L.grades != null && n > L.grades) act('graded', { g: (st.grades[n - 1] || []).slice(0, 2).join(':') }); L.grades = n; } const ln = cut(H.line(), 60); if (ln && ln !== L.line) { act('line', { text: ln }); L.line = ln; } }
    const S = g.__SHIFT, st = S && S.E && S.E.st33; if (st) { const p = `${st.phase}|${(S.E && S.E.prac31) || ''}`; if (p !== L.b) { act('phaseB', { to: p }); L.b = p; } }
  } catch (e) { /* */ }
}
function build56() { const m = /בנייה\s+([0-9]+[א-ת]?)/.exec(document.title || ''); return m ? m[1] : '?'; }
// ── the screenshot: the 3D frame drawn now, scaled to 800 px, the line written over it ──
// the page's own layer (lines, cards, buttons — HTML over the 3D) drawn over the frame as it lies: boxes, borders and their text. No
// library (the file's 6 MiB cap); images only from data:/blob: (anything else would taint the shot); a failure leaves the bare frame.
const A56 = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return 0; const p = m[1].split(/[\s,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
function dom56(x, W, H, src) {
  const cr = src.getBoundingClientRect(); if (!cr.width || !cr.height) return 0;
  const sx = W / cr.width, sy = H / cr.height, all = document.body.getElementsByTagName('*'); let n = 0, texts = 0;
  const box = (X, Y, w, h, rad) => { x.beginPath(); if (x.roundRect && rad > 0) x.roundRect(X, Y, w, h, Math.min(rad, w / 2, h / 2)); else x.rect(X, Y, w, h); };
  for (let i = 0; i < all.length && n < 900; i++) {
    const el = all[i], tg = el.tagName;
    if (tg === 'CANVAS' || tg === 'SCRIPT' || tg === 'STYLE' || tg === 'svg' || (g.SVGElement && el instanceof g.SVGElement)) continue;
    if (el.closest('.r56p,.r56b,.r56v')) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < cr.top || r.top > cr.bottom || r.right < cr.left || r.left > cr.right) continue;
    const cs = g.getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    try { if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue; } catch (e) { /* */ }
    n++;
    const X = (r.left - cr.left) * sx, Y = (r.top - cr.top) * sy, w = r.width * sx, h = r.height * sy, rad = (parseFloat(cs.borderTopLeftRadius) || 0) * sx;
    x.save(); x.globalAlpha = Math.max(0, Math.min(1, parseFloat(cs.opacity) || 1));
    if (A56(cs.backgroundColor) > 0.04) { x.fillStyle = cs.backgroundColor; box(X, Y, w, h, rad); x.fill(); }
    const bw = parseFloat(cs.borderTopWidth) || 0; if (bw > 0 && A56(cs.borderTopColor) > 0.1) { x.lineWidth = Math.max(1, bw * sx); x.strokeStyle = cs.borderTopColor; box(X, Y, w, h, rad); x.stroke(); }
    if (tg === 'IMG' && el.complete && el.naturalWidth && /^(data|blob):/.test(el.currentSrc || el.src || '')) { try { x.drawImage(el, X, Y, w, h); } catch (e) { /* */ } }
    let t = ''; if (tg === 'INPUT' || tg === 'TEXTAREA') t = el.value || el.placeholder || ''; else for (const c of el.childNodes) if (c.nodeType === 3) t += c.nodeValue;
    t = t.replace(/\s+/g, ' ').trim();
    if (t) {
      texts++;
      const fs = Math.max(6, (parseFloat(cs.fontSize) || 14) * sy), lh = fs * 1.22;
      x.font = `${cs.fontWeight || 400} ${fs.toFixed(1)}px Heebo, system-ui, sans-serif`; x.fillStyle = A56(cs.color) > 0 ? cs.color : '#fff';
      const rtl = cs.direction !== 'ltr'; x.direction = rtl ? 'rtl' : 'ltr'; x.textBaseline = 'middle';
      const ctr = cs.textAlign === 'center' || tg === 'BUTTON' || (/flex/.test(cs.display) && cs.justifyContent === 'center');
      const pl = (parseFloat(cs.paddingLeft) || 0) * sx, pr = (parseFloat(cs.paddingRight) || 0) * sx, maxW = Math.max(10, w - pl - pr);
      const lines = []; let cur = '';
      for (const wd of t.split(' ')) { const tr = cur ? cur + ' ' + wd : wd; if (cur && x.measureText(tr).width > maxW * 1.1) { lines.push(cur); cur = wd; } else cur = tr; }
      if (cur) lines.push(cur);
      const keep = lines.slice(0, Math.max(1, Math.ceil(h / lh) + 1)), y0 = Y + Math.max(lh / 2, (h - keep.length * lh) / 2 + lh / 2);
      x.textAlign = ctr ? 'center' : rtl ? 'right' : 'left';
      const tx = ctr ? X + pl + maxW / 2 : rtl ? X + w - pr : X + pl;
      keep.forEach((L, k) => x.fillText(L, tx, y0 + k * lh));
    }
    x.restore();
  }
  return texts;
}
function shot56(line) {
  try {
    const T = g.__T; if (!T || !T.renderer) return null;
    try { T.render(); } catch (e) { /* */ }
    const src = T.renderer.domElement, w0 = src.width, h0 = src.height; if (!w0 || !h0) return null;
    const W = 800, H = Math.round((h0 / w0) * W), c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    const base = () => { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.drawImage(src, 0, 0, W, H); };
    const band = () => { if (!line) return; x.fillStyle = 'rgba(20,14,8,.72)'; x.fillRect(0, 0, W, 30); x.fillStyle = '#FFE6A0'; x.font = '600 16px Heebo, system-ui, sans-serif'; x.direction = 'rtl'; x.textAlign = 'right'; x.textBaseline = 'alphabetic'; x.fillText(cut(line, 90), W - 10, 21); };
    base(); let texts = 0;
    try { texts = dom56(x, W, H, src); } catch (e) { pushErr('report56', 'shot dom: ' + e.message); try { base(); } catch (e2) { /* */ } }
    if (!texts) band();
    const enc = () => { for (const q of [0.62, 0.45, 0.3]) { const d = c.toDataURL('image/jpeg', q); if (d.length < 170000) return d; } return null; };
    try { return enc(); } catch (e) { pushErr('report56', 'shot enc: ' + e.message); base(); band(); return enc(); }
  } catch (e) { pushErr('report56', 'shot: ' + e.message); return null; }
}
function bytes56(o) { try { const t = JSON.stringify(o); return g.TextEncoder ? new g.TextEncoder().encode(t).length : t.length * 2; } catch (e) { return 1e9; } }
async function db56() {
  if (R56.dbTried) return R56.db; R56.dbTried = true;
  try { if (g.claude && typeof g.claude.use === 'function') R56.db = await g.claude.use('db'); } catch (e) { R56.db = null; }
  return R56.db;
}
function device56() {
  const n = g.navigator || {};
  return { ua: cut(n.userAgent, 300), platform: cut(n.platform || (n.userAgentData && n.userAgentData.platform), 40), touch: (n.maxTouchPoints | 0) > 0, lang: n.language, view: [g.innerWidth, g.innerHeight], dpr: g.devicePixelRatio, screen: g.screen ? [g.screen.width, g.screen.height] : null, time: new Date().toString().slice(0, 33), iso: new Date().toISOString() };
}
const SEV56 = [['break', 'שובר משחק'], ['annoy', 'מפריע'], ['cosmetic', 'קוסמטי'], ['idea', 'רעיון']];
const CSS = `.r56b{position:fixed;left:6px;top:58px;z-index:99990;width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,230,160,.35);background:rgba(20,14,8,.28);color:#FFE6A0;font:700 18px/1 system-ui;display:flex;align-items:center;justify-content:center;opacity:.6;touch-action:manipulation;padding:0}
.r56b:active{opacity:1}.r56v{position:fixed;left:6px;top:104px;z-index:99990;font:600 10px/1.1 Heebo,system-ui,sans-serif;color:rgba(255,230,160,.75);background:rgba(20,14,8,.35);padding:2px 5px;border-radius:6px;pointer-events:none;direction:rtl}
.r56p{position:fixed;inset:0;z-index:99995;background:rgba(14,10,6,.9);direction:rtl;color:#FFF3D6;font:500 14px/1.35 Heebo,system-ui,sans-serif;overflow:auto;padding:10px 14px 16px;-webkit-overflow-scrolling:touch}
.r56p .row{display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap}.r56p img.sh{width:min(46vw,360px);border-radius:8px;border:1px solid #6A5030}
.r56p textarea{flex:1;min-width:220px;min-height:84px;border-radius:10px;border:1.5px solid #C8923A;background:#241A0E;color:#FFF3D6;font:500 15px/1.4 Heebo,system-ui,sans-serif;padding:8px;direction:rtl}
.r56p .sev{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.r56p button{min-height:44px;border-radius:10px;border:1.5px solid #C8923A;background:#3A2A14;color:#FFF3D6;font:700 14px Heebo,system-ui,sans-serif;padding:6px 12px;touch-action:manipulation}
.r56p button.on{background:#C8923A;color:#1B1208}.r56p .bar{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.r56p .st{font-size:12.5px;opacity:.85;margin:4px 0}
.r56p ul{list-style:none;padding:0;margin:6px 0}.r56p li{display:flex;gap:8px;align-items:center;border-top:1px solid #4A3820;padding:6px 0}.r56p li img{width:96px;border-radius:6px}.r56p li .tx{flex:1;font-size:13px}.r56p li button{min-width:44px}`;
let ui = null;
function close56() { try { if (ui) ui.remove(); } catch (e) { /* */ } ui = null; R56.open = false; try { if (R56.paused0 === false && g.__T && g.__T.pause) g.__T.pause(false); } catch (e) { /* */ } }
async function list56(box, st) {
  try {
    box.innerHTML = '<li class="st">טוען…</li>';
    const db = await db56(); let rows = [];
    if (db) { try { const q = await db.collection('reports').orderBy('at', 'desc').limit(60).get(); rows = (q.docs || []).map((d) => ({ id: d.id, ...(d.data ? d.data() : d) })); } catch (e) { st.textContent = 'הרשימה המקוונת לא נטענה (' + cut(e && (e.code || e.message), 40) + ').'; } }
    rows = rows.concat(R56.local.slice().reverse());
    if (!rows.length) { box.innerHTML = '<li class="st">עוד אין דיווחים.</li>'; return; }
    box.innerHTML = '';
    for (const r of rows) {
      const li = document.createElement('li');
      const sv = (SEV56.find((s) => s[0] === r.sev) || [0, ''])[1];
      li.innerHTML = `${r.shot ? `<img src="${r.shot}" alt="">` : ''}<div class="tx"><b>${sv}</b> · ${cut(r.where, 40)} · ${cut((r.iso || '').slice(11, 16), 5)}<br>${cut(r.note, 140).replace(/</g, '&lt;') || '—'}</div><button aria-label="מחיקה">🗑</button>`;
      li.querySelector('button').addEventListener('click', async (ev) => { ev.stopPropagation(); try { if (db && r.id) await db.doc('reports/' + r.id).delete(); else { R56.local = R56.local.filter((x) => x !== r); try { g.localStorage.setItem('bh_reports56', JSON.stringify(R56.local.map((x) => ({ ...x, shot: null })).slice(-50))); } catch (e) { /* */ } } li.remove(); } catch (e) { st.textContent = 'המחיקה לא הצליחה: ' + cut(e.message || e.code, 60); } });
      box.appendChild(li);
    }
  } catch (e) { box.innerHTML = '<li class="st">לא נטען: ' + cut(e && (e.code || e.message), 80) + '</li>'; }
}
async function export56(st) {
  try {
    const db = await db56(); let rows = R56.local.slice();
    if (db) { try { const q = await db.collection('reports').orderBy('at', 'asc').limit(500).get(); rows = (q.docs || []).map((d) => ({ id: d.id, ...(d.data ? d.data() : d) })).concat(rows); } catch (e) { /* the phone's own reports still go out */ } }
    const data = JSON.stringify({ exported: new Date().toISOString(), build: build56(), reports: rows }, null, 1), filename = `mikdash-reports-${build56()}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
    let dl = null; try { if (g.claude && g.claude.use) dl = await g.claude.use('downloads'); } catch (e) { dl = null; }
    if (dl) { try { await dl.save({ filename, data }); st.textContent = 'הקובץ נשמר.'; return; } catch (e) { if (!e || e.code !== 'unavailable') { st.textContent = 'הקובץ לא נשמר (' + cut(e && (e.code || e.message), 40) + ').'; return; } } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { try { URL.revokeObjectURL(a.href); a.remove(); } catch (e) { /* */ } }, 4000); st.textContent = 'הקובץ ירד.';
  } catch (e) { st.textContent = 'הייצוא לא הצליח: ' + cut(e && (e.code || e.message), 80); }
}
function open56() {
  if (R56.open) return; R56.open = true;
  const state = snapState(), line = (state.phaseA && state.phaseA.line) || (state.screen && state.screen.line) || '';
  const shot = shot56(line);
  try { R56.paused0 = !!(g.__T && g.__T.paused); if (g.__T && g.__T.pause && !R56.paused0) g.__T.pause(true); } catch (e) { /* */ }
  act('report-open', {});
  const where = state.phaseA ? `${state.phaseA.stg}/${state.phaseA.part || ''}${state.phaseA.job ? ' · ' + state.phaseA.job : ''}` : state.phaseB ? `שלב ב׳ ${state.phaseB.phase || ''}${state.phaseB.prac ? ' · ' + state.phaseB.prac : ''}` : 'מסך';
  ui = document.createElement('div'); ui.className = 'r56p'; ui.setAttribute('role', 'dialog');
  ui.innerHTML = `<div class="row" style="justify-content:space-between"><b style="font-size:17px;color:#FFD66E">🐞 דיווח · בנייה ${build56()} · ${cut(where, 50)}</b><button data-c="1">סגירה ✕</button></div>
    <div class="row" style="margin-top:6px">${shot ? `<img class="sh" src="${shot}" alt="צילום הרגע">` : '<div class="st">(אין צילום)</div>'}<textarea placeholder="מה קרה? מה ציפית שיקרה? (אפשר להכתיב: Win+H)"></textarea></div>
    <div class="sev">${SEV56.map((s, i) => `<button data-s="${s[0]}" class="${i === 1 ? 'on' : ''}">${s[1]}</button>`).join('')}</div>
    <div class="bar"><button data-save="1" class="on">שמור דיווח</button><button data-x="1">ייצא הכל</button></div><div class="st" data-st="1"></div>
    <b>הדיווחים</b><ul></ul>`;
  document.body.appendChild(ui);
  const ta = ui.querySelector('textarea'), st = ui.querySelector('[data-st]'), ul = ui.querySelector('ul'); let sev = SEV56[1][0];
  try { ta.focus(); } catch (e) { /* */ }
  ui.addEventListener('keydown', (ev) => ev.stopPropagation(), true);
  ui.addEventListener('click', async (ev) => {
    const b = ev.target.closest('button'); if (!b || !ui) return; ev.stopPropagation();
    if (b.dataset.c) { close56(); return; }
    if (b.dataset.s) { sev = b.dataset.s; ui.querySelectorAll('[data-s]').forEach((x) => x.classList.toggle('on', x === b)); return; }
    if (b.dataset.x) { export56(st); return; }
    if (b.dataset.save) {
      b.disabled = true; st.textContent = 'שומר…';
      const rep = { at: Date.now(), iso: new Date().toISOString(), build: build56(), sev, note: cut(ta.value, 4000), where: cut(where, 80), state, actions: R56.actions.slice(-20), errors: R56.errors.slice(-100), device: device56(), shot };
      try {
        if (bytes56(rep) > 240000) rep.errors = rep.errors.slice(-30);
        if (bytes56(rep) > 240000) { rep.shot = null; rep.shotDropped = true; }
        if (bytes56(rep) > 240000) { rep.errors = rep.errors.slice(-5); rep.actions = rep.actions.slice(-10); }
        const db = await db56(); let dbErr = '';
        if (db) { try { await db.collection('reports').add(rep); } catch (e) { dbErr = cut(e && (e.code || e.message), 60) || 'שגיאה'; } }
        if (db && !dbErr) st.textContent = 'נשמר — Claude קורא את הדיווחים ישירות.';
        else { R56.local.push(rep); try { g.localStorage.setItem('bh_reports56', JSON.stringify(R56.local.map((r) => ({ ...r, shot: null })).slice(-50))); } catch (e) { /* */ } st.textContent = (dbErr ? 'השמירה המקוונת נכשלה (' + dbErr + '). ' : '') + 'נשמר בטלפון הזה בלבד — "ייצא הכל" מוריד קובץ לשליחה.'; }
        ta.value = ''; act('report-saved', { sev }); list56(ul, st);
      } catch (e) { st.textContent = 'לא נשמר: ' + cut(e && (e.code || e.message), 100); }
      b.disabled = false;
    }
  });
  list56(ul, st);
}
export function installReport56() {
  try {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const b = document.createElement('button'); b.className = 'r56b'; b.type = 'button'; b.setAttribute('aria-label', 'דווח'); b.textContent = '🐞';
    b.addEventListener('click', (ev) => { ev.stopPropagation(); try { open56(); } catch (e) { pushErr('report56', e.message); R56.open = false; } });
    ['pointerdown', 'touchstart', 'mousedown'].forEach((t) => b.addEventListener(t, (ev) => ev.stopPropagation()));
    const v = document.createElement('div'); v.className = 'r56v'; v.textContent = 'בנייה ' + build56() + ' · בדיקה';
    const add = () => { try { document.body.appendChild(b); document.body.appendChild(v); v.textContent = 'בנייה ' + build56() + ' · בדיקה'; } catch (e) { /* */ } };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
    document.addEventListener('keydown', (ev) => { try { if (ev.key === 'F2') { ev.preventDefault(); if (R56.open) close56(); else open56(); } else if (ev.key === 'Escape' && R56.open) close56(); else if (!R56.open && ev.key && ev.key.length > 1) act('key', { key: ev.key }); } catch (e) { /* */ } }, true);
    document.addEventListener('pointerdown', (ev) => { try { if (R56.open) return; act('tap', { x: Math.round(ev.clientX), y: Math.round(ev.clientY), on: label(ev.target) }); } catch (e) { /* */ } }, true);
    setInterval(poll, 700);
    try { const L = JSON.parse(g.localStorage.getItem('bh_reports56') || '[]'); if (Array.isArray(L)) R56.local = L; } catch (e) { /* */ }
  } catch (e) { pushErr('report56', 'install: ' + (e && e.message)); }
}
export { R56 };
