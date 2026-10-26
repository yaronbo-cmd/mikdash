/* build 34 — the naive kid's eyes, in the page (injected by kid.cjs as an init script; survives reloads).
 * __KID.scan()  → what is on the screen: the tappable things (rect, label, reachable), the act's line, the checks (small, off-screen,
 *                 clipped text, English / code leaking, "?" placeholders, stale build labels, overlapping text, cards over the hero)
 * __KID.sig()   → a signature of meaningful state (screens, the act's phases, gates, the line) — the stuck detector compares it
 * __KID.guards  → counts of vibrate / sound calls reaching the browser while the switch is off
 * Never a Divine Name. */
(() => {
  if (globalThis.__KID) return;
  const G = { vib: 0, vibOff: 0, snd: 0, sndOff: 0, ctx: 0, media: 0, mediaOff: 0, offLog: [] };
  const ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const hapOff = () => ls('bh_haptics') === '0' || ls('bh_haptics') === 'off' || ls('bh_haptics') === 'false';
  const sndOff = () => ls('bh_avodah_mute') === '1';
  try {
    const NV = Navigator.prototype.vibrate;
    if (NV) Navigator.prototype.vibrate = function (p) { G.vib++; if (hapOff()) { G.vibOff++; if (G.offLog.length < 30) G.offLog.push(['vib', JSON.stringify(p), new Error().stack.split('\n').slice(2, 5).join(' | ')]); } return NV.call(this, p); };
  } catch (e) { /* */ }
  try {
    const SS = AudioScheduledSourceNode.prototype.start;
    AudioScheduledSourceNode.prototype.start = function (...a) {
      G.snd++;
      // (a source started while muted reaches the speaker only if its graph bypasses the muted master — counted, the stack kept to judge)
      if (sndOff()) { G.sndOff++; if (G.offLog.length < 30) G.offLog.push(['snd', this.constructor.name, new Error().stack.split('\n').slice(2, 6).join(' | ')]); }
      return SS.apply(this, a);
    };
    const AC = window.AudioContext;
    if (AC) window.AudioContext = function (...a) { G.ctx++; return new AC(...a); }, window.AudioContext.prototype = AC.prototype;
    const MP = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) { G.media++; if (sndOff()) G.mediaOff++; return MP.apply(this, a); };
  } catch (e) { /* */ }

  const CLICK = 'button, a[href], [role=button], [role=tab], .tw-btn, .tw-goal, .tw-ov, .tw-hand, .k20-r, .sh-pbtn';
  const W = () => innerWidth, H = () => innerHeight;
  function opac(e) { let o = 1, x = e; while (x && x.nodeType === 1) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return 0; o *= +c.opacity; x = x.parentElement; } return o; }
  function vis(e, minOp = 0.2) {
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null;
    if (r.right <= 0 || r.bottom <= 0 || r.left >= W() || r.top >= H()) return null;
    if (opac(e) < minOp) return null; return r;
  }
  const label = (e) => ((e.getAttribute('aria-label') || '') + ' ' + (e.textContent || '')).replace(/\s+/g, ' ').trim().slice(0, 60) || (e.className && String(e.className).slice(0, 40)) || e.tagName;
  const path = (e) => { const a = []; let x = e; for (let i = 0; i < 3 && x && x !== document.body; i++, x = x.parentElement) a.unshift(x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + (x.className && typeof x.className === 'string' ? '.' + x.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (x.dataset && Object.keys(x.dataset).length ? `[${Object.entries(x.dataset).map(([k, v]) => k + '=' + v).join(',').slice(0, 30)}]` : '')); return a.join('>'); };
  function scrollable(e) { let x = e.parentElement; while (x && x !== document.documentElement) { const c = getComputedStyle(x); if (/(auto|scroll)/.test(c.overflowY + c.overflowX) && (x.scrollHeight > x.clientHeight + 2 || x.scrollWidth > x.clientWidth + 2)) return x; x = x.parentElement; } return null; }
  // the clip box an element is drawn in (an ancestor with overflow hidden/auto/scroll, or the viewport)
  function clipBox(e) { let x = e.parentElement, b = { l: 0, t: 0, r: W(), b: H() }; while (x && x !== document.documentElement) { const c = getComputedStyle(x); if (c.overflowX !== 'visible' || c.overflowY !== 'visible') { const r = x.getBoundingClientRect(); b = { l: Math.max(b.l, r.left), t: Math.max(b.t, r.top), r: Math.min(b.r, r.right), b: Math.min(b.b, r.bottom) }; } if (c.position === 'fixed') break; x = x.parentElement; } return b; }
  function tappables() {
    const out = [];
    const cand = new Set(document.querySelectorAll(CLICK));
    for (const e of document.querySelectorAll('body *')) { if (cand.has(e)) continue; const cs = getComputedStyle(e); if (cs.cursor === 'pointer' && cs.pointerEvents !== 'none' && !(e.parentElement && getComputedStyle(e.parentElement).cursor === 'pointer')) cand.add(e); }   // (and anything drawn as tappable: cursor:pointer at its top)
    for (const e of cand) {
      if (e.closest('[hidden]')) continue;
      const cs = getComputedStyle(e); if (cs.pointerEvents === 'none') continue;
      const r = vis(e); if (!r) continue;
      if (e.disabled) continue;
      // nested: a tappable inside a bigger tappable counts once (the outer)
      const par = e.parentElement && e.parentElement.closest('button,[role=button],a[href]'); if (par && vis(par) && getComputedStyle(par).pointerEvents !== 'none') continue;
      const cb = clipBox(e), cx = Math.max(cb.l, Math.min(cb.r, r.left + r.width / 2)), cy = Math.max(cb.t, Math.min(cb.b, r.top + r.height / 2));
      const top = document.elementFromPoint(Math.max(1, Math.min(W() - 1, cx)), Math.max(1, Math.min(H() - 1, cy)));
      const reach = !!top && (top === e || e.contains(top));
      out.push({ e, x: cx, y: cy, w: r.width, h: r.height, l: r.left, t: r.top, r: r.right, b: r.bottom, reach, top: top && !reach ? path(top) : '', lb: label(e), p: path(e), cb });
    }
    return out;
  }
  // the text leaves: elements with their own non-empty text
  function texts() {
    const out = [], tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      const s = n.nodeValue.replace(/\s+/g, ' ').trim(); if (!s) continue;
      const e = n.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(e.tagName)) continue;
      const r = vis(e, 0.35); if (!r) continue;
      // the text's own box (a range): the element may be much wider than its words
      const rg = document.createRange(); rg.selectNodeContents(e); const rr = rg.getBoundingClientRect();
      out.push({ e, s: (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140), r, rr });
    }
    return out;
  }
  const hasHe = (s) => /[א-ת]/.test(s);
  const alpha = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(','); return p[3] != null ? +p[3] : 1; };
  function opaque(z) { const cs = getComputedStyle(z); if (+cs.opacity < 0.5) return false; return alpha(cs.backgroundColor) >= 0.5 || (cs.backgroundImage && cs.backgroundImage !== 'none' && !/url\(/.test(cs.backgroundImage) && z.getBoundingClientRect().width > 30); }
  let forceEl = null;
  function stackAt(x, y) {
    if (!forceEl) { forceEl = document.createElement('style'); forceEl.textContent = '*{pointer-events:auto!important}'; }
    document.head.appendChild(forceEl); let s = []; try { s = document.elementsFromPoint(x, y); } finally { forceEl.remove(); }
    return s;
  }
  // both a and b seen at (x, y): one over the other with no opaque layer between (the upper's own card counts)
  function seenThrough(a, b, x, y) {
    const s = stackAt(x, y); let ia = -1, ib = -1;
    for (let i = 0; i < s.length; i++) { const z = s[i]; if (ia < 0 && (z === a || a.contains(z))) ia = i; if (ib < 0 && (z === b || b.contains(z))) ib = i; }
    if (ia < 0 || ib < 0) return false;
    const upper = ia < ib ? a : b, lower = ia < ib ? b : a;
    for (let i = Math.min(ia, ib) + 1; i < Math.max(ia, ib); i++) { const z = s[i]; if (z.contains(lower) || upper.contains(z) || z.contains(upper)) continue; if (opaque(z)) return false; }
    for (let z = upper; z && !z.contains(lower); z = z.parentElement) if (opaque(z)) return false;
    return true;
  }
  const FULL_OK = /^(c18-vig|p25|f17|s29|lb|lb-pk|j32|sh-end|sh-pause|f17-sum|f17-rot|tl|pn|m3|sh-turn|sh-turn28|lk|r30-c|p31-end|tl33|j32u|ch33|sh-intro|card|gm|tw-zone|p23-in|d21-in|m22-in|p25-in|p25-dk|hk26-in|dm27-in|k20|av-|f17-flash|tw-flash|s29|sh-root|sh-hud)/;
  function checks(o = {}) {
    const F = [], W0 = W(), H0 = H();
    const tp = tappables();
    for (const q of tp) {
      let hw = q.w, hh = q.h;
      for (const ps of ['::after', '::before']) { const c = getComputedStyle(q.e, ps); if (c.content && c.content !== 'none' && c.position === 'absolute' && c.pointerEvents !== 'none') { const px = (v) => (/px$/.test(v) ? parseFloat(v) : 0); hw = Math.max(hw, q.w - px(c.left) - px(c.right)); hh = Math.max(hh, q.h - px(c.top) - px(c.bottom)); } }   // (a pseudo-element's hit area: inset −Npx)
      if (Math.min(hw, hh) < 43.5 && q.reach) F.push(['small', `${q.lb} ${Math.round(hw)}×${Math.round(hh)}`, q.p]);
      const sc = scrollable(q.e);
      const off = q.l < -2 || q.t < -2 || q.r > W0 + 2 || q.b > H0 + 2;
      if (off && !sc) F.push(['offscreen', `${q.lb} [${Math.round(q.l)},${Math.round(q.t)},${Math.round(q.r)},${Math.round(q.b)}] of ${W0}×${H0}`, q.p]);
      if (!q.reach && !off) { const top = document.elementFromPoint(Math.max(1, Math.min(W0 - 1, q.x)), Math.max(1, Math.min(H0 - 1, q.y))); if (top && seenThrough(top, q.e, q.x, q.y)) F.push(['covered', `${q.lb} under ${path(top)}`, q.p]); }
    }
    // an unknown full-screen layer (a class from another module's sheet?)
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
      const r = e.getBoundingClientRect(); if (r.width < W0 * 0.9 || r.height < H0 * 0.9) continue;
      if (!opaque(e) || opac(e) < 0.3) continue;
      const c = String(e.className || e.id || e.tagName).trim().split(/\s+/)[0];
      if (!FULL_OK.test(c) && !e.parentElement.closest('.tl,.pn,.m3')) F.push(['fullscreen', `${c} (${e.tagName.toLowerCase()}) covers the screen`, path(e)]);
    }
    const tx = texts();
    for (const t of tx) {
      const e = t.e, s = t.s, cs = getComputedStyle(e);
      // clipped text: its words wider than the box that draws them
      if ((cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && !/(auto|scroll)/.test(cs.overflowX)) F.push(['clipped', s.slice(0, 80), path(e)]);   // (scrollWidth: untransformed — a pop's scale is not a cut)
      const cb = clipBox(e);
      let hsc = false; for (let x = e.parentElement; x && x !== document.documentElement; x = x.parentElement) { const c = getComputedStyle(x); if (/(auto|scroll)/.test(c.overflowX) && x.scrollWidth > x.clientWidth + 2) { hsc = true; break; } }
      if (t.rr.width > 0 && (t.rr.right > Math.min(cb.r, W0) + 3 || t.rr.left < Math.max(cb.l, 0) - 3) && !hsc) F.push(['cut', `${s.slice(0, 60)} (${Math.round(t.rr.left)}–${Math.round(t.rr.right)} of ${Math.round(Math.max(0, cb.l))}–${Math.round(Math.min(W0, cb.r))})`, path(e)]);
      if (/…|\.\.\./.test(s)) F.push(['ellipsis', s.slice(0, 90), path(e)]);
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.nodeValue).join(' ');
      if (/\b(undefined|NaN|null|true|false|function|object)\b|\[object|=>|\$\{|%s|\{\{/.test(own)) F.push(['code', own.trim().slice(0, 80), path(e)]);
      else if (/[A-Za-z]{2,}/.test(own) && !/^(sh-log|lb-log)/.test(String(e.className))) F.push(['latin', own.trim().slice(0, 80), path(e)]);
      if (/^\s*\?+\s*$|\?\?/.test(own)) F.push(['placeholder', own.trim().slice(0, 60), path(e)]);
      const mb = own.match(/בנייה\s*(\d+)/); if (mb && o.build && +mb[1] !== o.build) F.push(['stale-build', own.trim().slice(0, 60), path(e)]);
      if (hasHe(own) && cs.direction === 'ltr' && !e.closest('[dir=ltr]')) F.push(['ltr-hebrew', own.trim().slice(0, 60), path(e)]);
      if (hasHe(own) && /\(\s*$|^\s*\)/.test(own.trim())) F.push(['paren', own.trim().slice(0, 60), path(e)]);
      // (build 35: the fire loop's words — the morning is measured by its work: no alarm, no countdown, no "late", no feeding, no "נפתח:")
      if (/דועכת|האש צריכה|איחר|באיחור|תמיד של (שחר|בין הערביים) בעוד|שקיעה בעוד|בקעו|נפתח:|שהאש לא תרד|המערכה ברמה|גזרים על המערכה|העלייה המהירה|הביאו עצים/.test(own)) F.push(['loop35', own.trim().slice(0, 60), path(e)]);
    }
    for (const sel of ['.f17-fire', '.f17-ban.on', '.sh-fg']) { const e = [...document.querySelectorAll(sel)].find((x) => vis(x, 0.3)); if (e) F.push(['loop35', `${sel} on the screen`, path(e)]); }   // (build 35: the fire's meter, its alarm)
    // overlapping text, both seen (no opaque card between them)
    const boxes = tx.filter((t) => t.rr.width > 4 && t.rr.height > 4 && t.s.length > 1);
    let nOv = 0;
    for (let i = 0; i < boxes.length && nOv < 40; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
      const l = Math.max(a.rr.left, b.rr.left), r = Math.min(a.rr.right, b.rr.right), tt = Math.max(a.rr.top, b.rr.top), bb = Math.min(a.rr.bottom, b.rr.bottom);
      if (r - l <= 3 || bb - tt <= 3) continue;
      const area = (r - l) * (bb - tt), sm = Math.min(a.rr.width * a.rr.height, b.rr.width * b.rr.height);
      if (area / sm < 0.15) continue;
      const x = (l + r) / 2, y = (tt + bb) / 2; if (x < 0 || y < 0 || x > W0 || y > H0) continue;
      nOv++;
      if (seenThrough(a.e, b.e, x, y)) F.push(['overlap', `"${a.s.slice(0, 40)}" × "${b.s.slice(0, 40)}"`, `${path(a.e)} × ${path(b.e)}`]);
    }
    // a card over the hero (the day only): his body's point on the screen under an opaque box
    try {
      const S = globalThis.__T && globalThis.__T.stages, E = globalThis.__SHIFT && globalThis.__SHIFT.E;
      if (S && E && E.st33 && E.st33.phase === 'run' && !E.st33.paused) {
        const hp = { x: 0, y: 0, z: 0 }; S.heroXYZ(hp);
        const v = new globalThis.__T.Vector3(hp.x, hp.y + 1.4, hp.z).project((globalThis.__T.camera.updateMatrixWorld(), globalThis.__T.camera));
        const sx = ((v.x + 1) / 2) * W0, sy = ((1 - v.y) / 2) * H0;
        if (v.z < 1 && sx > 0 && sx < W0 && sy > 0 && sy < H0) {
          for (const e of document.body.querySelectorAll('div,section,aside,button')) {
            const r = e.getBoundingClientRect(); if (r.width < 60 || r.height < 30 || r.width > W0 * 0.9) continue;
            if (sx < r.left || sx > r.right || sy < r.top || sy > r.bottom) continue;
            const cs = getComputedStyle(e); const bg = cs.backgroundColor; const m = bg.match(/rgba?\(([^)]+)\)/); const al = m ? (m[1].split(',')[3] != null ? +m[1].split(',')[3] : 1) : 0;
            if (al < 0.5 && cs.backgroundImage === 'none') continue;
            if (opac(e) < 0.5) continue;
            if (!(e.textContent || '').trim()) continue;
            F.push(['over-hero', `${label(e).slice(0, 50)} at ${Math.round(sx)},${Math.round(sy)}`, path(e)]); break;
          }
        }
      }
    } catch (e) { /* */ }
    return F;
  }
  function line() { const c = document.querySelector('.f17-card'); return c && vis(c) ? (c.innerText || c.textContent).replace(/\s+/g, ' ').trim() : ''; }
  // the overlays on screen (by their classes): a screen's name
  const SCREENS = ['.lb-play', '.lb-home', '.lb-pk', '.lb29-here,.lb-here', '.lock29,.l29', '.sh-pause', '.f17-sum', '.j32', '.p31-end', '.r30-c', '.ch33-end,.ch33', '.tl33', '.j32u', '.tl', '.pn', '.m3', '#sh-turn28,#sh-turn', '.f17-rot', '.sh-intro', '.p23-bk'];
  function screens() { const out = []; for (const s of SCREENS) { const e = [...document.querySelectorAll(s)].find((x) => vis(x, 0.3)); if (e) out.push(s.split(',')[0]); } return out; }
  function eng() {
    const E = globalThis.__SHIFT && globalThis.__SHIFT.E; if (!E || !E.st33) return null; const st = E.st33;
    const ph = (f) => { try { const k = f && f(); return k ? k.ph || '?' : ''; } catch (e) { return 'x'; } };
    return { phase: st.phase, day: st.day, night: !!st.night, paused: !!st.paused, t: Math.round(st.t * 10) / 10, k20: ph(E.k20), p23: ph(E.p23), d21: ph(E.d21), m22: ph(E.m22), p25: ph(E.p25), r26: ph(E.r26), r27: ph(E.r27), washed: !!st.washed, gates: [st.p23day, st.d21day, st.m22day, st.p25day, st.p26day, st.r26day, st.r27day].map((x) => x | 0).join(','), perutot: st.perutot, prac: E.prac31 || null, ch33: !!(E.ch33 && E.ch33()), summary: !!(E.focus17 && E.focus17().summary), at: (() => { const h = hero(); return h ? [Math.round(h.x * 10) / 10, Math.round(h.z * 10) / 10] : null; })() /* (build 35: where he stands — a stuck's place) */, next: (() => { try { const f = E.flowNext && E.flowNext(); return f ? `${f.id}@${Math.round(f.at.x)},${Math.round(f.at.z)}` : null; } catch (e) { return 'x'; } })() };
  }
  function hero() { try { const hp = { x: 0, y: 0, z: 0 }; globalThis.__T.stages.heroXYZ(hp); const v = new globalThis.__T.Vector3(hp.x, hp.y + 1, hp.z).project((globalThis.__T.camera.updateMatrixWorld(), globalThis.__T.camera)); return { x: hp.x, z: hp.z, sx: ((v.x + 1) / 2) * W(), sy: ((1 - v.y) / 2) * H(), on: v.z < 1 }; } catch (e) { return null; } }
  // where the gold path leads, on the screen (what the child sees: the strong path and its arrow)
  function pathAim() {
    try {
      const F = globalThis.__F31 && globalThis.__F31.state && globalThis.__F31.state(); const pts = F && F.pts; const h = hero(); if (!pts || !pts.length || !h) return null;
      let q = null; for (const [x, z] of pts) if (Math.hypot(x - h.x, z - h.z) > 1.5) { q = [x, z]; break; } if (!q) q = pts[pts.length - 1];
      const v = new globalThis.__T.Vector3(q[0], 16, q[1]).project((globalThis.__T.camera.updateMatrixWorld(), globalThis.__T.camera));
      return { sx: ((v.x + 1) / 2) * W(), sy: ((1 - v.y) / 2) * H(), hx: h.sx, hy: h.sy, d: Math.hypot(q[0] - h.x, q[1] - h.z), n: pts.length };
    } catch (e) { return null; }
  }
  function sig() {
    const e = eng(), sc = screens();
    const l = line().replace(/[0-9:]+/g, '#');
    const core = e ? [e.phase, e.day, e.night, e.paused, e.k20, e.p23, e.d21, e.m22, e.p25, e.r26, e.r27, e.washed, e.gates, e.prac, e.ch33, e.summary].join('|') : '';
    return sc.join(' ') + ' § ' + core + ' § ' + l;
  }
  function scan(o = {}) {
    const tp = tappables().map(({ e, ...q }) => ({ ...q, cls: String(e.className || '').slice(0, 50), glow: /glow|lit|cue|pulse|\bon\b|pl\b|new/.test(String(e.className || '')) }));
    return { W: W(), H: H(), tp, obj: (() => { try { return globalThis.__KID && globalThis.__KID.obj40 ? globalThis.__KID.obj40() : null; } catch (e) { return null; } })() /* build 40 */, line: line(), screens: screens(), eng: eng(), hero: hero(), aim: pathAim(), sig: sig(), checks: o.checks === false ? [] : checks(o), guards: { ...G, offLog: G.offLog.slice(-6) }, coins: (() => { try { const A = JSON.parse(ls('bh_avodah') || '{}'); return (A.shift || {}).perutot; } catch (e) { return null; } })() };
  }
  // the engine's events (the acts' outcomes: the ratings, the lamb's verdicts, the throws, the spills …): counted, the ratings kept
  const EV = { n: {}, rate: [], hooked: null };
  setInterval(() => { try { const E = globalThis.__SHIFT && globalThis.__SHIFT.E; if (!E || !E.on17 || EV.hooked === E) return; EV.hooked = E; E.on17((ev) => { const k = ev.type + (ev.ok === false ? ':no' : '') + (ev.why ? ':' + ev.why : '') + (ev.out ? ':' + ev.out : ''); EV.n[k] = (EV.n[k] | 0) + 1; if (ev.type === 'rate30') EV.rate.push([ev.id, ev.rating, ev.q, ev.coins]); }); } catch (e) { /* */ } }, 500);
  // ── build 40 ── the act's touches: while an act's input is up, where the thumb lands — on the thing (.t40-obj: the act's surface on the
  // object, build 40), on the pad (the work button, the act's right-half layer — every act touch before build 40 — or .t40-pad, the fallback),
  // on the laver's rings (the two-thumb exception), on the world, elsewhere; and from the act's input appearing to its first touch on it
  const ACT40 = '.d21-in,.m22-in,.hk26-in,.dm27-in,.p25-in,.p23-in,.s17-zone,.s31-zone,.k20-r';
  const T40 = { ep: [], cur: null, n: { obj: 0, pad: 0, ring: 0, world: 0, other: 0 } };
  const shown40 = (e) => { let x = e; while (x && x.nodeType === 1) { const c = getComputedStyle(x); if (c.display === 'none' || c.visibility === 'hidden') return false; x = x.parentElement; } const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.right > 0 && r.bottom > 0 && r.left < W() && r.top < H() && getComputedStyle(e).pointerEvents !== 'none'; };
  const layer40 = () => { for (const e of document.querySelectorAll(ACT40)) if (shown40(e)) return e; return null; };
  setInterval(() => { try { const e = layer40(), t = performance.now(); if (e && !T40.cur) T40.cur = { id: String(e.className).split(' ')[0], t0: t, first: null, obj: 0, pad: 0, ring: 0, world: 0 }; else if (!e && T40.cur) { T40.cur.ms = Math.round(t - T40.cur.t0); T40.ep.push(T40.cur); if (T40.ep.length > 200) T40.ep.shift(); T40.cur = null; } } catch (err) { /* */ } }, 100);
  document.addEventListener('pointerdown', (ev) => {
    try {
      const t = ev.target && ev.target.closest ? ev.target : null; if (!t) return;
      const k = t.closest('.t40-obj') ? 'obj' : t.closest('.k20-r') ? 'ring' : t.closest('.tw-btn,.t40-pad') || t.closest(ACT40) ? 'pad' : t.closest('.tw-zone') ? 'world' : 'other';
      T40.n[k]++;
      const c = T40.cur; if (!c) return; if (k in c) c[k]++;
      if (c.first == null && (k === 'obj' || k === 'pad' || k === 'ring')) { c.first = Math.round(performance.now() - c.t0); c.how = k; }
    } catch (err) { /* */ }
  }, true);
  const obj40 = () => { let best = null; for (const e of document.querySelectorAll('.t40-obj')) { if (!shown40(e)) continue; const r = e.getBoundingClientRect(); if (!best || r.width * r.height > best.w * best.h) best = { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height, x: r.left + r.width / 2, y: r.top + r.height / 2 }; } return best; };
  // ── /build 40 ──
  globalThis.__KID = { scan, sig, checks, eng, line, screens, hero, pathAim, G, EV, T40, obj40, tappables: () => tappables().map(({ e, ...q }) => q) };
})();
