/* ── fable32 (build 27) ── dam27.js — the second lot's two blood roles at the morning's Tamid (יומא ב, ג: "מי שוחט, מי זורק";
 * תמיד ד, א), drawn and heard; the engine is day33.js (E.r27(): the shochet in → bind → bound → wait → cut → cutd → out; the zorek
 * in → wait → cut (the court's shochet) → recv → full → carry → hold → aim → splash → carry2 → aim2 → splash2 → base → poured → out;
 * r27bind, r27tap, r27move, r27swirl, r27throw, r27swipe; P27, needle27, stream27, throw27).
 *   the shochet — at the second ring of the north-west the lamb is bound by hand, "יד ורגל" (a right drag brings the foreleg to the
 *     hindleg: no rope, no ribbon — "לא היו כופתין"), its head south and its face west; those who won the limbs hold it; he waits for
 *     the great gate's sound and cuts on the needle's gold moment (a right tap; outside it, again — free); a gold flash, no gore.
 *   the zorek — "שחט השוחט, וקבל המקבל": the vessel under the stream (a right drag ↔ keeps it there); then he walks by the stick and
 *     the right thumb circles ("ממרס… כדי שלא יקרש"; three seconds still and the clot meter rises); at the north-east corner (after
 *     the five lamps) and at the south-west one, a pull back and a release: below the red thread, at the corner's edge the Γ on both
 *     faces, beside it one face; over the thread a red cue and again; the rest poured on the southern yesod (a swipe ⬇).
 * The other role's kohen is the court's, seen on screen (the shochet with the knife, the receiver with the vessel, at the corners);
 * those who won the limbs hold the lamb. Stylized: the blood only the liquid the vessel catches, its stream and its marks below
 * the thread (blood.js's palette); the camera never close on the lamb's neck.
 *   createDam27({ E, sfx, doc, view }) → { destroy(), state() }      (focus17.js makes it when E.p27on; globalThis.__D27)
 * Every text a draft (טיוטה) with its source, the numbers המחשה. Never a Divine Name. */
import { addDrawer, L, onTick } from './draw.js';
import { lamb as lambFig, man, ROBE, SKIN } from '../works/figures.js';
import { P27, needle27, throw27, SWIPE36 } from './day33.js';
import { reg30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ──
import { L33 } from './lamb33.js';   // ── fable32 (build 33) ── (today's lamb's tag) ── /fable32 ──
import { BLOOD, tagBlood } from '../works/blood.js';

export function createDam27(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null;
  if (!doc || !E || !E.on17 || !E.p27on) return { destroy() {}, state: () => ({}) };
  const T = globalThis.__T,
    hero = () => {
      const H = globalThis.__HERO35;
      return H && H.loaded ? H : null;
    },
    snd = (n, a) => {
      try {
        o.sfx.play(n, a);
      } catch (e) {}
    },
    buzz = (p) => {
      try {
        navigator.vibrate(p);
      } catch (e) {}
    },
    WD = () => innerWidth || 844,
    HT = () => innerHeight || 390,
    gy = (x, z, y0 = 16) => {
      try {
        const y = T.stages.groundAt(x, z);
        return Number.isFinite(y) ? y : y0;
      } catch (e) {
        return y0;
      }
    },
    proj = (x, y, z) => {
      try {
        const p = view && view.project(x, y, z);
        return p && p.on !== false ? { x: p.x, y: p.y } : null;   // (a copy: the view hands back one shared point)
      } catch (e) {
        return null;
      }
    },
    clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v),
    lerp = (a, b, u) => a + (b - a) * u;
  if (!doc.getElementById('dm27-css')) {
    const css = doc.createElement('style');
    css.id = 'dm27-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  const mk = (cls, html) => {
      const el = doc.createElement('div');
      el.className = 'dm27 ' + cls;
      if (html) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    pad = mk('dm27-in'),
    hint = mk('dm27-h'),
    line = mk('dm27-m'),
    big = mk('dm27-x'),
    flashEl = mk('dm27-f'),
    verb = mk('dm27-u'),
    gauge = mk('dm27-g'),
    ring = mk('dm27-r', `<svg viewBox="-60 -60 120 120"><circle r="46" class="bg"/><path class="gz"/><line class="nd" x1="0" y1="0" x2="0" y2="-50"/><circle r="7" class="hub"/></svg>`),   // ── fable32 (build 30) ── (the dial's word "שחטו בזהב" is the step card's line) ── /fable32 ──
    over = mk('dm27-o', `<svg><polyline class="tr"/><circle class="fa" r="16"/><circle class="hi" r="18"/><line class="bl"/></svg>`),
    svg = over.querySelector('svg'),
    trEl = svg.querySelector('.tr'),
    faEl = svg.querySelector('.fa'),
    hiEl = svg.querySelector('.hi'),
    blEl = svg.querySelector('.bl'),
    needleEl = ring.querySelector('.nd'),
    put = (el, html) => {
      if (el.__h !== html) {
        el.__h = html;
        el.innerHTML = html;
      }
      el.classList.toggle('on', !!html);
    },
    pop = (el, html) => {
      el.innerHTML = html;
      el.classList.remove('on');
      el.offsetWidth;
      el.classList.add('on');
    },
    // ── fable32 (build 30) ── (in his act a word of feedback is the step card's line for a moment; the court's lines wait outside his act) ── /fable32 ──
    flash = (html, bad) => {
      if (E.say30 && E.say30(html, bad ? 'no' : /✓|✦/.test(html) ? 'ok' : 'info', bad ? 1.8 : 1.4)) return;
      pop(flashEl, html);
      flashEl.classList.toggle('bad', !!bad);
    },
    S = { binds: 0, cuts: 0, miss: 0, clinks: 0, throws: 0, gamma: 0, face1: 0, high: 0, wide: 0, pours: 0, lines: [], npc: '', buzz: 0 },
    lineUntil = { t: -1 },
    say = (html, s = 5) => {
      if (E.act30 && E.act30()) return;   // ── fable32 (build 30) ── ── /fable32 ──
      put(line, html);
      S.lines.push(html.replace(/<[^>]+>/g, '').slice(0, 48));
      lineUntil.t = E.st33.t + s;
    },
    haptic = (p) => {
      S.buzz++;
      buzz(p);
    };
  // the gauge's ring: the gold zone [win0, win1] on a 300° dial (−150° … +150°)
  {
    const ang = (u) => ((-150 + 300 * u) * Math.PI) / 180,
      a0 = ang(P27.win[0]),
      a1 = ang(P27.win[1]),
      r = 46;
    ring.querySelector('.gz').setAttribute('d', `M ${(Math.sin(a0) * r).toFixed(1)} ${(-Math.cos(a0) * r).toFixed(1)} A ${r} ${r} 0 0 1 ${(Math.sin(a1) * r).toFixed(1)} ${(-Math.cos(a1) * r).toFixed(1)}`);
  }
  // ── the right thumb (the pad covers the right half: the protocol's action zone) ──
  const touches = new Map(),
    tsOf = (ev) => (ev.timeStamp > 0 ? ev.timeStamp : performance.now()),
    aim = { on: false, p: 0, a: 0, sgn: 1 },
    bindG = { fore: null, hind: null, prog: 0 };
  // the leg points of the lamb on its side (head south, face west, legs toward the east where the shochet stands)
  const LAMB = P27.lamb,
    LY = 16.18,
    LS = 1.35,   // (the lamb's size, as the other works draw a lamb: about an amah and a third long — a yearling beside a man)
    FORE = { x: LAMB.x + 0.67 * LS, y: LY + 0.1 * LS, z: LAMB.z + 0.3 * LS },
    HIND = { x: LAMB.x + 0.67 * LS, y: LY + 0.07 * LS, z: LAMB.z - 0.18 * LS },
    NECK = { x: LAMB.x + 0.12 * LS, y: LY + 0.22 * LS, z: LAMB.z + 0.72 * LS };
  // the guide on the screen: the moving ring on the foreleg, the target ring BIND_PX along the legs' own screen direction — the legs
  // are half an amah apart and, from the ring's north view, lie along the view's depth (≈ 10 px apart, the target straight below)
  const BIND_PX = 76,
    legsOnScreen = () => {
      const f = proj(FORE.x, FORE.y, FORE.z),
        h = proj(HIND.x, HIND.y, HIND.z);
      if (!f || !h) return null;
      let vx = h.x - f.x,
        vy = h.y - f.y,
        vl = Math.hypot(vx, vy);
      if (vl < 3) (vx = 0), (vy = 1), (vl = 1);
      const L = Math.max(BIND_PX, vl);
      return { f, h: { x: f.x + (vx / vl) * L, y: f.y + (vy / vl) * L } };
    },
    bindDir = (g) => (!g ? '' : Math.abs(g.h.y - g.f.y) >= Math.abs(g.h.x - g.f.x) ? (g.h.y > g.f.y ? 'd' : 'u') : 's');
  // the corners' two faces: NE — the north face (x west of the corner) and the east face (z south of it); SW — the south face
  // (x east of it) and the west face (z north of it)
  const face = (c, side, u, y) => {
    const C = P27.corner[c];
    return c === 'NE'
      ? side < 0
        ? { x: C[0] - u, y, z: C[1] - 0.06 }
        : { x: C[0] + 0.06, y, z: C[1] + u }
      : side < 0
        ? { x: C[0] + u, y, z: C[1] + 0.06 }
        : { x: C[0] - 0.06, y, z: C[1] - u };
  };
  /** where a throw (p, a) lands on the corner c: the height by throw27, the place along a face by the aim (the corner's edge at 0) */
  const impact = (c, p, a) => {
    const r = throw27(p, a),
      u = Math.min(3.2, 3.4 * Math.tan((Math.min(60, Math.abs(a)) * Math.PI) / 180) * 1.2);
    return { ...face(c, a < 0 ? -1 : 1, u, Math.min(r.y, 24.6)), r };
  };
  pad.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      pad.setPointerCapture(ev.pointerId);
    } catch (e) {}
    const K = E.r27();
    if (!K) return;
    touches.set(ev.pointerId, { x0: ev.clientX, y0: ev.clientY, lx: ev.clientX, ly: ev.clientY, t0: tsOf(ev), ty: null, ang: null, cx: ev.clientX, cy: ev.clientY });
    if (K.ph === 'bind') {
      const g = legsOnScreen();
      bindG.fore = g && g.f;
      bindG.hind = g && g.h;
      bindG.prog = 0;
    }
    if (K.ph === 'aim' || K.ph === 'aim2') {
      const c = K.ph === 'aim2' ? 'SW' : 'NE',
        a = impact(c, 0.3, 12),
        b = impact(c, 0.3, -12),
        pa = a && proj(a.x, a.y, a.z),
        pb = b && proj(b.x, b.y, b.z);
      aim.sgn = pa && pb && pa.x < pb.x ? -1 : 1;
      aim.on = true;
      aim.p = 0;
      aim.a = 0;
    }
  });
  pad.addEventListener('pointermove', (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    const K = E.r27(),
      t = tsOf(ev),
      dx = ev.clientX - p.lx,
      dy = ev.clientY - p.ly;
    p.lx = ev.clientX;
    p.ly = ev.clientY;
    if (p.ty == null && ev.clientY - p.y0 >= SWIPE36.dist * HT()) p.ty = t - p.t0;   // ── fable32 (build 36) ── (SWIPE36) ── /fable32 ──
    if (!K) return;
    if (K.ph === 'recv') E.r27move((dx / (0.42 * WD())) * 2);
    else if (/^(full|carry|carry2|hold)$/.test(K.ph) || (K.clot && /^aim2?$/.test(K.ph))) {   // ── fable32 (build 36) ── (a clot at the corner: the thumb circles it away there) ── /fable32 ──
      // the circle: the turn of the thumb's way, round a slowly following centre
      p.cx += (ev.clientX - p.cx) * 0.12;
      p.cy += (ev.clientY - p.cy) * 0.12;
      const ang = Math.atan2(ev.clientY - p.cy, ev.clientX - p.cx);
      if (p.ang != null && Math.hypot(ev.clientX - p.cx, ev.clientY - p.cy) > 6) {
        let d = ang - p.ang;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        if (Math.abs(d) < 1.2) E.r27swirl(d);
      }
      p.ang = ang;
    } else if (K.ph === 'bind' && bindG.fore && bindG.hind) {
      const vx = bindG.hind.x - bindG.fore.x,
        vy = bindG.hind.y - bindG.fore.y,
        vl = Math.hypot(vx, vy) || 1,
        need = Math.max(70, vl),
        ux = vx / vl,
        uy = vy / vl,
        mx = ev.clientX - p.x0,
        my = ev.clientY - p.y0;
      bindG.prog = clamp01((mx * ux + my * uy) / need);
      if (bindG.prog >= 0.88 && Math.abs(mx * -uy + my * ux) < need * 0.7) {
        bindG.prog = 1;
        p.bound = true;
        E.r27bind(true);
      }
    } else if ((K.ph === 'aim' || K.ph === 'aim2') && aim.on) {
      aim.p = clamp01((ev.clientY - p.y0) / (0.3 * HT()));
      aim.a = Math.max(-45, Math.min(45, (aim.sgn * (ev.clientX - p.x0) * 40) / (0.22 * WD())));
    }
  });
  const up = (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    touches.delete(ev.pointerId);
    const K = E.r27();
    if (!K) return;
    const dx = ev.clientX - p.x0,
      dy = ev.clientY - p.y0,
      d = Math.hypot(dx, dy),
      ms = tsOf(ev) - p.t0;
    if (K.ph === 'bind' && !p.bound) {
      if (bindG.prog > 0.12 && ev.type === 'pointerup') E.r27bind(false);
      else if (ev.type === 'pointerup' && d > 30 && K.P36 && K.P36.turn) (E.r27bind(false), flash('עקדו יד ורגל — ראשו לדרום'));   // ── fable32 (build 36) ── (level 2 on: no guide — a binding the other way is a try, counted) ── /fable32 ──
      else if (ev.type === 'pointerup' && d > 30) flash(`גררו ${bindDir(legsOnScreen()) === 'd' ? '⬇' : bindDir(legsOnScreen()) === 'u' ? '⬆' : '↔'} — מהרגל הקדמית אל האחורית`);   // (the other way: a word, not a try)
      bindG.prog = 0;
    } else if (K.ph === 'cut') {
      if (ev.type === 'pointerup' && d < 18 && ms < 450) E.r27tap();
    } else if (K.ph === 'aim' || K.ph === 'aim2') {
      if (aim.on && ev.type === 'pointerup' && d > 12) E.r27throw(aim.p, aim.a);
      aim.on = false;
    } else if (K.ph === 'base' && ev.type === 'pointerup' && d > 14) E.r27swipe(dx / WD(), dy / HT(), p.ty != null ? p.ty : ms);
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(type, up);

  // ── the frame: the pad and the stick, the cards, the gauges, the hand ──
  let on = false,
    stickOff = null,
    lastPh = '',
    phAt = 0,
    gaugeHtml = '',
    fillT = 0,
    holdBuzz = 0,
    splash = null,
    pourAt = -1,
    npcGate = -1,
    hp = { x: 0, y: 16, z: 0 };
  const setStick = (off) => {
      if (stickOff === off) return;
      stickOff = off;
      try {
        const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
          twin = mods && mods.twin;
        if (twin && twin.noStick) twin.noStick(off || globalThis.__SH_NOSTICK === true);
      } catch (e) {}
    },
    PAD = /^(bind|cut|recv|full|carry|carry2|hold|aim|aim2|base)$/,
    STILL = /^(in|bind|bound|wait|cut|cutd|recv|full|hold|aim|splash|aim2|splash2|base|poured)$/,
    VERB = {
      bind: ['↔', 'sw', 'גררו: יד ורגל'],
      cut: ['👆', 'hd', 'הקישו בזהב'],
      recv: ['↔', 'sw', 'תחת הזרם'],
      carry: ['⟳', 'rot', 'סובבו — מרסו'],
      carry2: ['⟳', 'rot', 'סובבו — מרסו'],
      hold: ['⟳', 'rot', 'סובבו — מרסו'],
      aim: ['⤵', 'dn', 'משכו לאחור ושחררו'],
      aim2: ['⤵', 'dn', 'משכו לאחור ושחררו'],
      base: ['⬇', 'dn', 'החליקו מטה'],
    },
    HINT = {
      bind: ['עקדו את הטלה — גררו את הרגל הקדמית אל האחורית', SRC.yad],
      bound: ['עקוד — ראשו לדרום ופניו למערב', SRC.head],
      wait: ['ממתינים לקול השער הגדול', SRC.gate],
      cut: ['שחטו — הקישו כשהמחוג בזהב', SRC.stand + ' · ' + SRC.hold],
      cutd: ['', SRC.recv],
      recv: ['קבלו את הדם — גררו ↔ והחזיקו את המזרק תחת הזרם', SRC.recv],
      full: ['', SRC.recv],
      carry: ['אל הקרן המזרחית הצפונית — הסטיק ללכת, האגודל הימני מסובב', SRC.mares],
      hold: ['חמש נרות קודם לדם התמיד — מרסו עד שיסיימו', SRC.five],
      aim: ['זרקו מתחת לחוט, אל חוד הקרן — משכו לאחור, כוונו ↔ ושחררו', SRC.line],
      splash: ['', SRC.gamma],
      carry2: ['אל הקרן המערבית הדרומית — סביב הצפון והמערב', SRC.sw],
      aim2: ['זרקו מתחת לחוט, אל חוד הקרן — משכו לאחור, כוונו ↔ ושחררו', SRC.line],
      splash2: ['', SRC.gamma],
      base: ['את שירי הדם — על היסוד הדרומי: החליקו ⬇', SRC.base],
      poured: ['', SRC.base],
    },
    offTick = onTick(() => {
      const st = E.st33;
      if (!st) return;
      try {
        T.stages.heroXYZ(hp);
      } catch (e) {}
      const K = E.r27(),
        ph = K ? K.ph : '',
        live = st.phase === 'run' && !st.summary && !st.night,
        t = performance.now() / 1e3;
      if (ph !== lastPh) {
        lastPh = ph;
        phAt = t;
      }
      if (lineUntil.t >= 0 && st.t > lineUntil.t) {
        lineUntil.t = -1;
        put(line, '');
      }
      const active = !!K && live && ph !== 'out',
        still = active && STILL.test(ph);
      if (on !== still) {
        on = still;
        doc.body.classList.toggle('dm27-on', still);
      }
      if (active) setStick(still);
      else if (stickOff) setStick(false);
      pad.classList.toggle('on', active && PAD.test(ph));
      if (!pad.classList.contains('on')) {
        touches.clear();
        aim.on = false;
      }
      // the hint and its source
      // ── fable32 (build 30) ── (the hint card — HINT's lines with their sources — is gone while he works: the step card's one line, "גררו: יד
      // ורגל", "זרקו מתחת לחוט" …; HINT's sources at the end, SRC30.shochet / .zorek. The cue by the right thumb keeps its icon only) ── /fable32 ──
      put(hint, '');
      const bd = active && ph === 'bind' ? bindDir(legsOnScreen()) : '',
        vr = active ? (bd ? (bd === 's' ? VERB.bind : [bd === 'd' ? '⬇' : '⬆', bd === 'd' ? 'dn' : '', VERB.bind[2]]) : VERB[ph]) : null,   // (the binding's arrow: the guide's own direction on the screen)
        vk = vr ? ph + bd : '';
      if (verb.__k !== vk) {
        verb.__k = vk;
        verb.className = `dm27 dm27-u${vr ? ' on ' + vr[1] : ''}`;
        verb.innerHTML = vr ? `<i>${vr[0]}</i>` : '';   // ── fable32 (build 30) ── (its words — vr[2] — are the line's) ── /fable32 ──
      }
      // the cut's ring
      const cutOn = active && ph === 'cut' && K.role === 'shochet';
      ring.classList.toggle('on', cutOn);
      if (cutOn) {
        // ── fable32 (build 36) ── (the gold by the level: the ring's arc redrawn when it changes) ── /fable32 ──
        const W = (K.P36 && K.P36.win) || P27.win;
        if (ring.__w !== W) {
          ring.__w = W;
          const ang = (u) => ((-150 + 300 * u) * Math.PI) / 180,
            a0 = ang(W[0]),
            a1 = ang(W[1]),
            r = 46;
          ring.querySelector('.gz').setAttribute('d', `M ${(Math.sin(a0) * r).toFixed(1)} ${(-Math.cos(a0) * r).toFixed(1)} A ${r} ${r} 0 0 1 ${(Math.sin(a1) * r).toFixed(1)} ${(-Math.cos(a1) * r).toFixed(1)}`);
        }
        const u = needle27(K.tc, K.sweep),
          gold = u >= W[0] && u <= W[1];
        needleEl.setAttribute('transform', `rotate(${(-150 + 300 * u).toFixed(1)})`);
        ring.classList.toggle('hot', gold);
      }
      // the gauges
      let g = '';
      if (active)
        if (ph === 'recv' || ph === 'full') {
          const sx = ((K.sp + 1) / 2) * 100,
            px = ((K.pos + 1) / 2) * 100,
            ok = Math.abs(K.pos - K.sp) < ((K.P36 && K.P36.tol) || P27.tol);   // ── fable32 (build 36) ── (the stream's width by the level) ── /fable32 ──
          g = `<div class="lbl">🏺 המזרק</div><div class="v"><i style="height:${Math.round(K.fill * 100)}%"></i></div><div class="lane"><u style="left:${sx.toFixed(1)}%"></u><s class="${ok ? 'ok' : ''}" style="left:${px.toFixed(1)}%"></s></div>${Math.round(K.fill * 100)}%<small>המחשה</small>`;
        } else if (/^(carry|carry2|hold|aim|aim2|splash|splash2)$/.test(ph)) {
          const c = Math.round(K.coag * 100),
            still = K.T - K.lastSw;
          g = `<div class="lbl">⟳ ממרס</div><div class="cl${K.clot ? ' bad' : ''}"><i style="width:${c}%"></i></div>${K.clot ? '<b class="w">נקרש — מרסו!</b>' : still > 2 && /^(carry|carry2|hold)$/.test(ph) ? '<b class="w">מרסו ⟳</b>' : `קרישה ${c}%`}<div class="gifts">${['NE', 'SW'].map((c2, i) => `<span class="${K.gifts[i] != null ? 'done' : ''}">${c2 === 'NE' ? 'מז״צ' : 'מע״ד'}</span>`).join('')}</div><small>המחשה</small>`;
        }
      if (g !== gaugeHtml) {
        gaugeHtml = g;
        put(gauge, g);
      }
      // the filling's tone and its low buzz (a sound and a gauge's glow as its twins)
      if (active && ph === 'recv' && Math.abs(K.pos - K.sp) < ((K.P36 && K.P36.tol) || P27.tol)) {
        if ((fillT -= 1 / 30) <= 0) {
          fillT = 0.16;
          snd('fill27', { f: 260 + 420 * K.fill });
          if ((holdBuzz = (holdBuzz + 1) % 3) === 0) haptic(6 + Math.round(10 * K.fill));
        }
        gauge.classList.add('hot');
      } else gauge.classList.remove('hot');
      // the overlay: the binding's line from the foreleg; the throw's way (screen); nothing else
      let showOver = false;
      if (active && ph === 'bind' && !(K.P36 && K.P36.turn)) {   // ── fable32 (build 36) ── (level 2 on: no binding guide — he reads the lamb) ── /fable32 ──
        const g2 = legsOnScreen();
        if (g2) {
          showOver = true;
          const pr = bindG.prog;
          faEl.setAttribute('cx', (g2.f.x + (g2.h.x - g2.f.x) * pr).toFixed(1));
          faEl.setAttribute('cy', (g2.f.y + (g2.h.y - g2.f.y) * pr).toFixed(1));
          hiEl.setAttribute('cx', g2.h.x.toFixed(1));
          hiEl.setAttribute('cy', g2.h.y.toFixed(1));
          blEl.setAttribute('x1', g2.f.x.toFixed(1));
          blEl.setAttribute('y1', g2.f.y.toFixed(1));
          blEl.setAttribute('x2', g2.h.x.toFixed(1));
          blEl.setAttribute('y2', g2.h.y.toFixed(1));
          trEl.setAttribute('points', '');
        }
      } else if (active && (ph === 'aim' || ph === 'aim2') && aim.on && aim.p > 0.02 && !(K.P36 && K.P36.guide === 0)) {   // ── fable32 (build 36) ── (level 2 on: no throw's way drawn — under the thread by the eye) ── /fable32 ──
        const c = ph === 'aim2' ? 'SW' : 'NE',
          w = impact(c, aim.p, aim.a),
          from = { x: hp.x, y: (hp.y || 16) + 1.5, z: hp.z },
          pts = [];
        for (let i = 0; i <= 12; i++) {
          const u = i / 12,
            q = proj(lerp(from.x, w.x, u), lerp(from.y, w.y, u) + Math.sin(u * Math.PI) * 0.9, lerp(from.z, w.z, u));
          if (q) pts.push(`${q.x | 0},${q.y | 0}`);
        }
        if (pts.length > 1) {
          showOver = true;
          trEl.setAttribute('points', pts.join(' '));
          trEl.setAttribute('class', `tr ${w.r.res === 'high' ? 'bad' : w.r.res === 'perfect' ? 'gold' : ''}`);
          faEl.setAttribute('cx', -99);
          hiEl.setAttribute('cx', -99);
          blEl.setAttribute('x1', -99);
          blEl.setAttribute('x2', -99);
        }
      }
      over.classList.toggle('on', showOver);
      // his hand: the knife at the cut, the vessel from the receiving on (it circles while he swirls)
      const H = hero();
      if (H)
        H.hold21(
          active && K.role === 'zorek' && /^(recv|full)$/.test(ph)
            ? { x: NECK.x + 0.55 * K.pos * 0.4, y: LY + 0.3, z: NECK.z + 0.25 }
            : active && K.role === 'shochet' && /^(bind|bound)$/.test(ph)
              ? { x: LAMB.x + 0.55, y: LY + 0.25, z: LAMB.z }
              : active && K.role === 'shochet' && /^(cut|cutd)$/.test(ph)
                ? { x: NECK.x + 0.35, y: LY + 0.45, z: NECK.z - 0.1 }
                : null,
        );
    }),
    // ── the world's frame: the lamb, the kohanim, the vessel and its stream, the throw's arc, the marks ──
    kohen = (k, x, z, fx, fz, opt) =>
      man(k, L(x), L(z), L(gy(x, z)), {
        robe: ROBE.kohen,
        yaw: Math.atan2(fz, fx),
        skin: SKIN[opt.s | 0],
        t: opt.t,
        ...opt.o,
      }),
    mizrak = (k, x, y, z, fill, tilt = 0) => {
      k.wc(x, y + 0.11, z, 0.17, 0.2, SILVER, { pitch: tilt });
      k.wc(x, y + 0.22, z, 0.19, 0.03, '!#E8EDF2', { pitch: tilt });
      if (fill > 0.03) {
        k.wc(x, y + 0.03 + 0.17 * Math.min(1, fill), z, 0.15, 0.02, BLOOD.wet);
        tagBlood(k, 'vessel');
      }
    },
    stream = (k, x0, y0, z0, x1, y1, z1, w = 0.035) => {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n;
        k.ws(lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u), w, Math.abs(y1 - y0) / n / 1.6 + 0.02, w, BLOOD.wet);
        tagBlood(k, 'vessel');
      }
      for (let i = 0; i < 3; i++) {
        const u = (i + 0.5) / 3;
        k.ws(lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u), w * 1.9, Math.abs(y1 - y0) / 3 / 1.5, w * 1.9, '!#FFC27A');
      }
    },
    gammaMark = (k, c, y, side, a = 1) => {
      // the Γ: a mark on each face at the corner's edge (or on one face), 1.2 wide, from the hit's height down
      const sides = side === 0 ? [-1, 1] : [side];
      for (const sd of sides) {
        const p = face(c, sd, 0.6, y - 0.6);
        k.ws(p.x, p.y, p.z, c === 'NE' ? (sd < 0 ? 0.55 : 0.05) : sd < 0 ? 0.55 : 0.05, 0.9 * a, c === 'NE' ? (sd < 0 ? 0.05 : 0.55) : sd < 0 ? 0.05 : 0.55, BLOOD.mark);
        tagBlood(k, 'horn');
      }
    },
    targetZone = (k, c, tt) => {
      // the gold-green dots round the place to aim: each face, from the yesod's top to the thread
      const pulse = 0.8 + 0.2 * Math.sin(tt * 5);
      for (const sd of [-1, 1])
        for (let i = 0; i <= 6; i++) {
          const u = 0.15 + (i / 6) * 1.6,
            top = face(c, sd, u, P27.line - 0.12),
            bot = face(c, sd, u, P27.low + 0.08);
          k.ws(top.x, top.y, top.z, 0.06 * pulse, 0.03, 0.06 * pulse, '!#FFE08A');
          k.ws(bot.x, bot.y, bot.z, 0.05 * pulse, 0.03, 0.05 * pulse, '!#9BE07A');
        }
      const e = face(c, 1, 0.02, 19);
      k.wb(e.x, 17.3 + 1.85, e.z, 0.05, 0.05, 3.7, '!#9BE07A');
    },
    offDraw = addDrawer(
      null,
      (k) => {
        const st = E.st33;
        if (!st || st.phase !== 'run' || st.night || st.summary) return;
        const K = E.r27(),
          ph = K ? K.ph : '',
          role = E.role26(),
          r = E.r26r(),
          done = r && r.day === st.day && (r.role === 'shochet' || r.role === 'zorek') ? r : null,
          clock = st.t,
          tt = performance.now() / 1e3,
          blood = role === 'shochet' || role === 'zorek';
        if (!blood) return;
        const cutT = K && K.cutT != null ? K.cutT : done ? done.cutT : null,
          since = cutT != null ? clock - cutT : -1,
          bound = (K && !/^(in|bind)$/.test(ph)) || done || (role === 'zorek' && E.gate27()),
          gone = done && since > 40;
        // the lamb: led to the ring and standing before the binding; laid on its side for it (the legs apart), then bound — the
        // foreleg brought to the hindleg — its head south and its face west
        if (!gone) {
          if (K && K.role === 'shochet' && ph === 'bind') lambBound(k, tt, 0, bindG.prog);
          else if (!bound) lambFig(k, L(LAMB.x - 0.3), L(LAMB.z), L(gy(LAMB.x, LAMB.z)), { yaw: Math.PI / 2, scale: LS, head: 0.5 + 0.2 * Math.sin(tt * 1.3) });
          else lambBound(k, tt, since >= 0 ? clamp01(since / 1.2) : 0, 1);
          // ── fable32 (build 33) ── today's lamb is the one he inspected in the chamber four days ago: its tag on the neck (המחשה) ── /fable32 ──
          const tg = E.tl33tag ? E.tl33tag() : null;
          if (tg != null) {
            const col = L33.tags[tg % L33.tags.length], y0 = LY;
            if (!bound && !(K && K.role === 'shochet' && ph === 'bind')) {   // (standing — figures.js's lamb in the kit's units, facing south: its neck 0.36 of its scale before the body's middle)
              const a = L(LAMB.x - 0.3), b = L(LAMB.z), yk = L(gy(LAMB.x, LAMB.z));
              k.s(a, b + 0.36 * LS, yk + 0.6 * LS, 0.13 * LS, 0.04 * LS, 0.13 * LS, col);
              for (const e of [-1, 1]) k.s(a + e * 0.19 * LS, b + 0.44 * LS, yk + 0.68 * LS, 0.04 * LS, 0.05 * LS, 0.04 * LS, '!' + col);   // (an ear tag on each ear)
            } else { k.ws(LAMB.x - 0.02 * LS, y0 + 0.3 * LS, LAMB.z + 0.46 * LS, 0.2 * LS, 0.17 * LS, 0.06 * LS, col); k.ws(LAMB.x - 0.24 * LS, y0 + 0.24 * LS, LAMB.z + 0.48 * LS, 0.05 * LS, 0.05 * LS, 0.05 * LS, '!' + col); }
          }
        }
        // those who won the limbs hold it ("מי שזכו באברים, אוחזים בו") — from the west, at the back
        if (bound && !gone && (since < 8 || since < 0)) {
          kohen(k, LAMB.x - 1.05, LAMB.z + 0.5, 1, -0.2, { s: 1, t: clock, o: { pose: 'scoop', u: 0.85 } });
          kohen(k, LAMB.x - 1.05, LAMB.z - 0.55, 1, 0.2, { s: 2, t: clock, o: { pose: 'scoop', u: 0.85 } });
        }
        // the court's shochet (his role the zorek): east of the lamb, facing west; the knife; he cuts at the engine's 'cut'
        if (role === 'zorek' && !gone) {
          const cutting = K && ph === 'cut',
            fig = kohen(k, P27.stand.x, P27.stand.z, -1, 0, { s: 0, t: clock, o: { pose: cutting ? 'reach' : 'stand', u: cutting ? 0.9 : 1 } });
          if (fig && fig.R && (!K || /^(in|wait|cut)$/.test(ph))) k.b(fig.R[0], fig.R[1], fig.R[2] + 0.04, 0.03, 0.22, 0.06, SILVER);
          if (cutting && K.t < 0.25) blade(k, NECK, K.t / 0.25);
        }
        // his own vessel and the stream (the zorek)
        if (K && K.role === 'zorek' && /^(cut|recv|full)$/.test(ph)) {
          const lat = [0.8, -0.6],
            sx = NECK.x + lat[0] * 0.4 * (K.sp || 0),
            sz = NECK.z + 0.2 + lat[1] * 0.4 * (K.sp || 0),
            mx = NECK.x + lat[0] * 0.4 * K.pos,
            mz = NECK.z + 0.2 + lat[1] * 0.4 * K.pos;
          mizrak(k, mx, LY - 0.02, mz, K.fill);
          if (ph === 'recv') stream(k, NECK.x, NECK.y + 0.05, NECK.z, sx, LY + 0.2, sz);
        }
        // the zorek's vessel in his hand on the way and at the corners (circling as he swirls)
        if (K && K.role === 'zorek' && /^(carry|carry2|hold|aim|aim2|splash|splash2|base|poured)$/.test(ph)) {
          const H = hero(),
            hand = H && (H.at('handslotr') || H.at('handr'));
          if (hand) {
            const a = K.circ * 2 * Math.PI + K.circT;
            mizrak(k, hand.x + 0.06 * Math.cos(a), hand.y - 0.18, hand.z + 0.06 * Math.sin(a), ph === 'poured' ? Math.max(0, 0.3 - K.t * 0.3) : ph === 'base' ? 0.3 : 0.8, ph === 'poured' ? 1.1 : 0);
          }
        }
        // the corner he aims at: its zone, and the arc of the pull
        if (K && (ph === 'aim' || ph === 'aim2' || ph === 'hold')) {
          const c = ph === 'aim2' ? 'SW' : 'NE';
          targetZone(k, c, tt);
          if (aim.on && aim.p > 0.02 && ph !== 'hold') {
            const w = impact(c, aim.p, aim.a),
              f = { x: hp.x, y: (hp.y || 16) + 1.5, z: hp.z };
            for (let i = 1; i < 10; i++) {
              const u = i / 10;
              k.ws(lerp(f.x, w.x, u), lerp(f.y, w.y, u) + Math.sin(u * Math.PI) * 0.9, lerp(f.z, w.z, u), 0.05, 0.05, 0.05, w.r.res === 'high' ? '!#FF8A70' : '!#FFE6A0');
            }
            k.ws(w.x, w.y, w.z, 0.12, 0.12, 0.12, w.r.res === 'high' ? '!#FF8A70' : '!#FFE6A0');
          }
        }
        // the splashes: the Γ on both faces (or one face) and its gold bloom; they stay through the morning
        if (splash && splash.day === st.day)
          for (const sp of splash.list) {
            const u = clamp01((tt - sp.t) / 0.35);
            gammaMark(k, sp.c, sp.y, sp.face, u);
            if (tt - sp.t < 1.1)
              for (let i = 0; i < 6; i++) {
                const p = face(sp.c, sp.face === 0 ? (i % 2 ? 1 : -1) : sp.face, 0.2 + 0.25 * (i >> 1), sp.y - 0.3);
                k.ws(p.x, p.y + 0.4 * u, p.z, 0.08 * (1 - u * 0.5), 0.08, 0.08, '!#FFE6A0');
              }
          }
        // the rest on the southern yesod: the stream from the vessel to the yesod by the two holes
        if (K && ph === 'poured') {
          const H = hero(),
            hand = H && (H.at('handslotr') || H.at('handr'));
          if (hand && K.t < P27.poured - 0.15) stream(k, hand.x, hand.y - 0.2, hand.z, P27.hole.x, P27.hole.y, P27.hole.z, 0.03);
        }
        // the court's receiver (his role the shochet): by the neck with the vessel; after the cut he receives, then walks to the
        // north-east corner, gives (after the five lamps), round the north and the west to the south-west, gives, and pours the rest
        if (role === 'shochet') npcZorek(k, K, done, since, clock, tt);
      },
      3,
    );
  function lambBound(k, tt, still, bp) {
    // on its side: the body along z, the head at the south turned west; the foreleg brought to the hindleg ("יד ורגל")
    const x = LAMB.x,
      z = LAMB.z,
      y = LY,
      s = LS,
      br = 1 + 0.02 * Math.sin(tt * 3) * (1 - still);
    k.ws(x, y + 0.27 * s, z, 0.3 * br * s, 0.27 * s, 0.48 * s, WOOL);
    k.ws(x - 0.04 * s, y + 0.3 * s, z + 0.62 * s, 0.17 * s, 0.17 * s, 0.2 * s, FACE);
    k.ws(x - 0.2 * s, y + 0.33 * s, z + 0.66 * s, 0.05 * s, 0.13 * s, 0.07 * s, FACE);
    k.ws(x - 0.12 * s, y + 0.36 * s, z + 0.78 * s, 0.022 * s, 0.022 * s, 0.022 * s, '#3A2E22');
    k.ws(x, y + 0.2 * s, z - 0.52 * s, 0.08 * s, 0.08 * s, 0.1 * s, WOOL);
    // the legs: toward the east; the fore and the hind brought together and held by hand
    k.wc(x + 0.42 * s, y + 0.1 * s, z + (0.3 * (1 - bp) - 0.08 * bp) * s, 0.045 * s, 0.5 * s, HOOF, { roll: Math.PI / 2, yaw: -0.3 * bp });   // (the foreleg — brought back)
    k.wc(x + 0.42 * s, y + 0.07 * s, z + (-0.21 + 0.05 * bp) * s, 0.045 * s, 0.5 * s, HOOF, { roll: Math.PI / 2, yaw: 0.25 * bp });   // (the hindleg)
    if (bp >= 1) k.ws(x + 0.62 * s, y + 0.1 * s, z - 0.13 * s, 0.07 * s, 0.07 * s, 0.07 * s, SKIN[0]);   // (held by hand where they meet — no rope)
  }
  function blade(k, at, u) {
    // the knife's gold flash at the cut (no close-up, no wound)
    for (let i = 0; i < 4; i++) k.ws(at.x + 0.25 + 0.1 * i, at.y + 0.25, at.z - 0.15 + 0.08 * i, 0.06 * (1 - u), 0.06 * (1 - u), 0.06 * (1 - u), '!#FFF3C4');
  }
  function npcZorek(k, K, done, since, clock, tt) {
    const R0 = P27.recv,
      NE = P27.at.NE,
      SW = P27.at.SW,
      men5 = E.men5t(),
      V = 6,
      dNE = Math.hypot(NE.x - R0.x, NE.z - R0.z),
      WAY = [
        [NE.x, NE.z],
        [-57.2, -22.6],
        [SW.x - 0.6, SW.z - 0.2],
      ],
      dSW = Math.hypot(WAY[1][0] - WAY[0][0], WAY[1][1] - WAY[0][1]) + Math.hypot(WAY[2][0] - WAY[1][0], WAY[2][1] - WAY[1][1]);
    if (since < 0) {
      // waiting by the neck with the vessel
      const fig = kohen(k, R0.x, R0.z, NECK.x - R0.x, NECK.z - R0.z, { s: 2, t: clock, o: { pose: 'hold' } });
      if (fig && fig.R) k.c(fig.R[0], fig.R[1], fig.R[2] + 0.03, 0.12 / 1, 0.1, SILVER);
      return;
    }
    const recvEnd = 2.6,
      walk1 = recvEnd + dNE / V,
      give1 = Math.max(walk1, men5 != null ? men5 - (clock - since) + 0.3 : walk1) + 0.2,
      walk2 = give1 + 1.2 + dSW / V,
      give2 = walk2 + 0.2,
      pour = give2 + 1.4,
      leave = pour + 1.6;
    if (since > leave + 6) return;
    let x = R0.x,
      z = R0.z,
      fx = NECK.x - R0.x,
      fz = NECK.z - R0.z,
      pose = 'hold',
      fill = clamp01(since / recvEnd);
    if (since < recvEnd) {
      mizrak(k, NECK.x + 0.1, LY - 0.02, NECK.z + 0.2, fill);
      stream(k, NECK.x, NECK.y + 0.05, NECK.z, NECK.x + 0.1, LY + 0.2, NECK.z + 0.2);
      pose = 'scoop';
      S.npc = 'recv';
    } else if (since < walk1) {
      const u = (since - recvEnd) / (walk1 - recvEnd);
      x = lerp(R0.x, NE.x, u);
      z = lerp(R0.z, NE.z, u);
      fx = NE.x - R0.x;
      fz = NE.z - R0.z;
      pose = 'walk';
      S.npc = 'walk1';
    } else if (since < give1 + 1.2) {
      x = NE.x;
      z = NE.z;
      fx = -1;
      fz = 1;
      pose = since > give1 ? 'raise' : 'hold';
      S.npc = 'NE';
      if (since > give1 && !npcMark.NE) npcMark.NE = addSplash('NE', 19.6, 0);
    } else if (since < walk2) {
      const d = (since - give1 - 1.2) * V,
        d1 = Math.hypot(WAY[1][0] - WAY[0][0], WAY[1][1] - WAY[0][1]),
        seg = d < d1 ? 0 : 1,
        u = clamp01(seg ? (d - d1) / (dSW - d1) : d / d1);
      x = lerp(WAY[seg][0], WAY[seg + 1][0], u);
      z = lerp(WAY[seg][1], WAY[seg + 1][1], u);
      fx = WAY[seg + 1][0] - WAY[seg][0];
      fz = WAY[seg + 1][1] - WAY[seg][1];
      pose = 'walk';
      S.npc = 'walk2';
    } else if (since < leave) {
      x = WAY[2][0];
      z = WAY[2][1];
      fx = 1;
      fz = -1;
      pose = since < pour ? (since > give2 ? 'raise' : 'hold') : 'pour';
      S.npc = since < pour ? 'SW' : 'base';
      if (since > give2 && !npcMark.SW) npcMark.SW = addSplash('SW', 19.6, 0);
      if (since > pour && since < pour + 1.1) stream(k, x + 0.5, LY + 1.1, z - 0.4, P27.hole.x, P27.hole.y, P27.hole.z, 0.03);
    } else return;
    const fig = kohen(k, x, z, fx, fz, { s: 2, t: clock, o: { pose } });
    if (fig && fig.R && since >= recvEnd && since < leave) k.c(fig.R[0], fig.R[1], fig.R[2] + 0.03, 0.12, 0.1, SILVER);
  }
  const npcMark = { day: -1, NE: 0, SW: 0 },
    addSplash = (c, y, side) => {
      const day = E.st33.day;
      if (!splash || splash.day !== day) splash = { day, list: [] };
      splash.list.push({ c, y, face: side, t: performance.now() / 1e3 });
      return 1;
    };
  const offEv = E.on17((ev) => {
    const y = ev.type,
      ph = ev.ph,
      st = E.st33;
    if (npcMark.day !== st.day) Object.assign(npcMark, { day: st.day, NE: 0, SW: 0 });
    // ── fable32 (build 30) ── (the second lot's role line — "השחיטה — 'מי שוחט'" + SRC.lot — is gone: the lot's card says the role, end30 its source) ── /fable32 ──
    if (y === 'r26gate' && ev.npc) {
      const role = E.role26();
      if (role === 'shochet' || role === 'zorek') {
        npcGate = st.t;
        S.npcGate = (S.npcGate | 0) + 1;
        setTimeout(() => say(`זוכי הדישון פתחו את השער הגדול<small>${SRC.gate}</small>`, 5), 2400);
      }
    } else if (y === 'r27') {
      if (ph === 'in') snd('ui');
      else if (ph === 'bind') say(`הטלה בטבעת השנייה, בקרן הצפונית המערבית<small>${SRC.ring}</small>`, 3);
      else if (ph === 'bound') {
        snd('bind27');
        haptic(18);
        flash('עקוד ✓ — ומי שזכו באברים אוחזים בו');
      }
      else if (ph === 'cut' && ev.npc) {
        snd('blade27', { soft: 1 });
        say(`שחט השוחט — וקבל המקבל<small>${SRC.recv}</small>`, 4);
      } else if (ph === 'full') {
        snd('ding17');
        haptic([12, 30, 12]);
        flash('המזרק מלא ✓');
      } else if (ph === 'carry') say(`ממרס בדם כל הדרך — שלא יקרש<small>${SRC.mares} · המחשה</small>`, 6);
      else if (ph === 'hold') say(`הטבת חמש נרות קודם לדם התמיד<small>${SRC.five}</small>`, 6);
      else if (ph === 'aim' || ph === 'aim2') say(`${ph === 'aim' ? 'קרן מזרחית צפונית' : 'קרן מערבית דרומית'} — למטה מן החוט<small>${ph === 'aim' ? SRC.ne : SRC.sw} · ${SRC.diag}</small>`, 5);
      else if (ph === 'splash' || ph === 'splash2') addSplash(ph === 'splash' ? 'NE' : 'SW', (S.lastThrow && S.lastThrow.y) || 19.5, ev.face == null ? 0 : ev.face); else if (ph === 'carry2') say(`סביב הצפון והמערב — אל הקרן המערבית הדרומית<small>${SRC.sw}</small>`, 5);
      else if (ph === 'base') say(`נשאר דם במזרק — אל היסוד הדרומי<small>${SRC.base}</small>`, 5);
      else if (ph === 'poured') {
        snd('pour27');
        haptic(25);
        pourAt = performance.now() / 1e3;
        S.pours++;
      }
    } else if (y === 'r27bind') {
      S.binds++;
      if (!ev.ok) {
        snd('soft');
        flash('גררו עד הרגל האחורית — יד ורגל');
      }
    } else if (y === 'r27cut') {
      S.cuts++;
      if (ev.ok) {
        snd('blade27');
        snd('perfect');
        haptic(45);
        flash('בדיוק! ✦');
        ring.classList.add('ok');
        setTimeout(() => ring.classList.remove('ok'), 500);
      } else {
        S.miss++;
        snd('soft');
        haptic(10);
        flash(ev.u < P27.win[0] ? 'מוקדם — שוב' : 'מאוחר — שוב');
      }
    } else if (y === 'r27circ') {
      S.clinks++;
      snd('clink27', { n: ev.n });
      if (ev.n % 2 === 0) haptic(5);
    } else if (y === 'r27clot') {
      if (ev.on) {
        snd('warn17');
        haptic([30, 30, 30]);
        flash('הדם נקרש — מרסו! ⟳', true);
      }
    } else if (y === 'r27throw') {
      S.throws++;
      S.lastThrow = { y: ev.y, res: ev.res };
      if (ev.res === 'perfect') {
        S.gamma++;
        snd('splash27', { big: 1 });
        snd('chord17', { up: 1 });
        haptic([30, 20, 40]);
        if (!(E.say30 && E.say30('שתי מתנות שהן ארבע ✦', 'ok', 1.8))) pop(big, `<b>שתי מתנות שהן ארבע</b><small>כמין גמא — Γ</small>`);   // ── fable32 (build 30) ── ── /fable32 ──
      } else if (ev.res === 'good') {
        S.face1++;
        snd('splash27');
        haptic(25);
        flash('בדופן אחת — טוב; בחוד הקרן — שתיים');
      } else if (ev.res === 'high') {
        S.high++;
        snd('soft');
        haptic([20, 40, 20]);
        flash('מעל החוט — לא כאן', true);   // ── fable32 (build 30) ── (its source, SRC.line, at the end) ── /fable32 ──
      } else if (ev.res === 'miss') {
        S.wide++;
        snd('soft');
        flash('אל חוד הקרן — כוונו ↔', true);
      } else if (ev.res === 'weak') flash('משכו לאחור — חזק יותר');
      else if (ev.res === 'clot') flash('הדם נקרש — מרסו! ⟳', true);
    } else if (y === 'r27swipe' && !ev.ok) {
      snd('soft');
      flash(ev.why === 'short' ? 'ארוך יותר ⬇' : ev.why === 'slow' ? 'מהר יותר ⬇' : 'ישר למטה ⬇');
    } else if (y === 'r27done') {
      snd('chord17', { up: 1 });   // ── fable32 (build 30) ── (the end's banner — "+N ★ · coins · N%" — is the step card's rating; end30 its source) ── /fable32 ──
    }
  });
  const api = {
    destroy() {
      offTick();
      offDraw();
      offEv();
      setStick(false);
      doc.body.classList.remove('dm27-on');
      try {
        const H = hero();
        if (H) H.hold21(null);
      } catch (e) {}
      for (const el of [pad, hint, line, big, flashEl, verb, gauge, ring, over]) el.remove();
      if (globalThis.__D27 === api) delete globalThis.__D27;
    },
    state: () => {
      const K = E.r27(),
        g = legsOnScreen();
      return {
        ...S,
        lines: S.lines.slice(-6),
        ph: K ? K.ph : null,
        pad: pad.classList.contains('on'),
        ring: ring.classList.contains('on'),
        hint: hint.textContent,
        legs: g ? { f: [g.f.x | 0, g.f.y | 0], h: [g.h.x | 0, g.h.y | 0] } : null,
        aim: { ...aim },
        stick: stickOff,
        npcGate,
        pourAt,
      };
    },
  };
  globalThis.__D27 = api;
  return api;
}
const cite = (text, src) => `"${text}" — ${src} · טיוטה`;
// (each line checked on Sefaria, 22.10.2026; the Mishnah's text by Torat Emet)
const SRC = {
  lot: cite('מי שוחט, מי זורק', 'יומא ב, ג'),
  ring: cite('של שחר היה נשחט על קרן צפונית מערבית, על טבעת שניה', 'תמיד ד, א'),
  bind: cite('לא היו כופתין את הטלה, אלא מעקדין אותו', 'תמיד ד, א'),
  yad: cite('יד ורגל, כעקידת יצחק בן אברהם', 'תמיד לא, ב'),
  head: cite('וכך היתה עקדתו, ראשו לדרום ופניו למערב', 'תמיד ד, א'),
  hold: cite('מי שזכו באברים, אוחזים בו', 'תמיד ד, א'),
  stand: cite('השוחט, עומד במזרח ופניו למערב', 'תמיד ד, א'),
  gate: cite('לא היה שוחט השוחט, עד ששומע קול שער הגדול שנפתח', 'תמיד ג, ז'),
  recv: cite('שחט השוחט, וקבל המקבל', 'תמיד ד, א'),
  mares: cite('ממרס בו… כדי שלא יקרש', 'יומא ד, ג (בדם הפר של יום הכפורים)'),
  five: cite('והטבת חמש נרות קודם לדם התמיד', 'יומא לג, א'),
  ne: cite('בא לו לקרן מזרחית צפונית, ונותן מזרחה צפונה', 'תמיד ד, א'),
  sw: cite('מערבית דרומית, ונותן מערבה דרומה', 'תמיד ד, א'),
  line: cite('וחוט של סקרא חוגרו באמצע, להבדיל בין הדמים העליונים לדמים התחתונים', 'מדות ג, א'),
  diag: cite('באלכסון מחצי המזבח ולמטה', 'רמב״ם, מעשה הקרבנות ה, ו'),
  gamma: cite('ודמה טעון שתי מתנות שהן ארבע', 'זבחים ה, ד') + ' · ' + cite('מתנה אחת כמין גמא נותן', 'זבחים נג, ב'),
  base: cite('שירי הדם היה שופך על יסוד דרומית', 'תמיד ד, א'),
};
// ── fable32 (build 30) ── the blood roles' lines at their end (were the hint card's, the bottom line's and the banners', while he worked) ── /fable32 ──
reg30('shochet', { chip: SRC.bind, all: [SRC.lot, SRC.ring, SRC.bind, SRC.yad, SRC.head, SRC.hold, SRC.stand, SRC.gate, SRC.recv] });
{
  const G1 = cite('ודמה טעון שתי מתנות שהן ארבע', 'זבחים ה, ד'),
    G2 = cite('מתנה אחת כמין גמא נותן', 'זבחים נג, ב');   // (SRC.gamma's two lines, each its own)
  reg30('zorek', { chip: G1, all: [SRC.lot, SRC.gate, SRC.recv, `${SRC.mares} · המחשה`, SRC.five, SRC.ne, SRC.sw, SRC.line, SRC.diag, G1, G2, SRC.base, 'המספרים (הזרם, הקרישה, הזווית): המחשה'] });
}
const SILVER = '#C9CED6';
const WOOL = '#F2EEE4';
const FACE = '#E8DCCB';
const HOOF = '#5A4A3A';
const CSS = `.dm27{position:fixed;z-index:32;direction:rtl;text-align:center;font:900 16px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:none;display:none}.dm27.on{display:block}.dm27 small{display:block;font-size:11px;font-weight:700;opacity:.88}
.dm27-in{top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;pointer-events:auto}
.dm27-h,.dm27-x,.dm27-f,.dm27-m{left:50%;transform:translateX(-50%)}.dm27-h{top:58px;padding:4px 12px;border-radius:12px;background:#1C140ACC;font-size:13px;max-width:74vw}.dm27-h.sd{left:8px;transform:none;max-width:36vw}.dm27-m{bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:31;padding:3px 12px;border-radius:12px;background:#1C140AD8;border:1.5px solid #E2B65A;color:#FFE6A0;font:800 12px/1.25 Heebo,system-ui,sans-serif;max-width:78vw}
.dm27-x{top:30%;z-index:37;white-space:nowrap;text-shadow:0 2px 3px #000}.dm27-x b{display:block;font-size:34px;color:#FFD66E;-webkit-text-stroke:1.5px #5A3608}.dm27-f{top:64%;z-index:34;font-size:18px;color:#FFD08A;white-space:nowrap;text-shadow:0 2px 3px #000}.dm27-f.bad{color:#FF8E7A}
.dm27-x.on,.dm27-f.on{animation:dm27w 2.2s forwards}@keyframes dm27w{0%{opacity:0}10%,82%{opacity:1}to{opacity:0}}
.dm27-u{left:75.5%;top:50%;transform:translate(-50%,-50%);z-index:31;color:#FFE6A0;font-size:17px;text-shadow:0 2px 4px #000}.dm27-u i{display:block;font-style:normal;font-size:44px;line-height:1.1}
.dm27-u.sw i{animation:dm27s .9s ease-in-out infinite}.dm27-u.dn i{animation:dm27d 1s ease-in-out infinite}.dm27-u.hd i{animation:dm27h 1s ease-in-out infinite}.dm27-u.rot i{animation:dm27r 1.1s linear infinite}
@keyframes dm27s{0%{transform:translateX(30px);opacity:.3}60%{transform:translateX(-24px);opacity:1}to{transform:translateX(-30px);opacity:0}}@keyframes dm27d{0%{transform:translateY(-30px);opacity:.3}70%{transform:translateY(4px);opacity:1}to{transform:translateY(8px);opacity:0}}@keyframes dm27h{50%{transform:scale(.82)}}@keyframes dm27r{to{transform:rotate(-360deg)}}
.dm27-g{right:16px;top:96px;width:124px;z-index:31;padding:6px 6px 8px;border-radius:14px;background:#1C140AD8;border:1.5px solid #E2B65A;font-size:12px}.dm27-g.hot{border-color:#FFF1B8;box-shadow:0 0 14px #FFD66E}.dm27-g .lbl{font-size:13px;margin-bottom:3px}
.dm27-g .v{position:relative;height:70px;width:30px;margin:2px auto 4px;border-radius:6px;background:#2A1C10;border:2px solid #8A8F96;overflow:hidden}.dm27-g .v i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#B8505A,#5A1418)}
.dm27-g .lane{position:relative;height:16px;margin:4px 2px;border-radius:8px;background:#2A1C10}.dm27-g .lane u{position:absolute;top:-3px;width:4px;height:22px;margin-left:-2px;background:linear-gradient(#FFC27A,#8E2A22);border-radius:2px}.dm27-g .lane s{position:absolute;top:1px;width:20px;height:14px;margin-left:-10px;border-radius:0 0 9px 9px;background:#C9CED6;text-decoration:none}.dm27-g .lane s.ok{box-shadow:0 0 8px #FFE6A0;background:#FFF1B8}
.dm27-g .cl{height:12px;border-radius:6px;background:#2A1C10;margin:4px 2px;overflow:hidden}.dm27-g .cl i{display:block;height:100%;background:linear-gradient(90deg,#7BC46A,#E8B848,#B8505A)}.dm27-g .cl.bad{box-shadow:0 0 10px #FF8E7A}.dm27-g .w{display:block;color:#FFB0A0;font-size:13px}
.dm27-g .gifts{display:flex;gap:4px;justify-content:center;margin-top:4px}.dm27-g .gifts span{flex:1;padding:2px 0;border-radius:6px;border:1.5px solid #8A6A3A;font-size:11px}.dm27-g .gifts span.done{background:#5A1418;border-color:#FFD66E}
.dm27-r{left:75.5%;top:46%;transform:translate(-50%,-50%);z-index:31;width:150px}.dm27-r svg{width:150px;height:150px;overflow:visible}.dm27-r .bg{fill:#1C140AC0;stroke:#8A6A3A;stroke-width:8}.dm27-r .gz{fill:none;stroke:#FFD66E;stroke-width:12;stroke-linecap:round}.dm27-r .nd{stroke:#FFF6DA;stroke-width:5;stroke-linecap:round}.dm27-r .hub{fill:#FFF6DA}
.dm27-r.hot .gz{stroke:#FFF1B8;filter:drop-shadow(0 0 6px #FFD66E)}.dm27-r.ok .bg{stroke:#FFE6A0;filter:drop-shadow(0 0 12px #FFD66E)}.dm27-r b{display:block;margin-top:-6px;font-size:14px;color:#FFE6A0;text-shadow:0 2px 3px #000}
.dm27-o{inset:0;z-index:29}.dm27-o svg{width:100%;height:100%;overflow:visible}.dm27-o .tr{fill:none;stroke:#FFE6A0;stroke-width:3;stroke-dasharray:6 6;opacity:.9}.dm27-o .tr.bad{stroke:#FF8E7A}.dm27-o .tr.gold{stroke:#FFF1B8;stroke-width:4}
.dm27-o .fa{fill:#FFD66E33;stroke:#FFE6A0;stroke-width:3}.dm27-o .hi{fill:none;stroke:#FFE6A0;stroke-width:3;stroke-dasharray:5 4}.dm27-o .bl{stroke:#FFE6A088;stroke-width:3;stroke-dasharray:3 6}
body.dm27-on .gm .tw-pad,body.dm27-on .f17-bar{opacity:.0!important;pointer-events:none!important}`;
