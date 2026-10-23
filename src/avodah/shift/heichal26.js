/* ── fable32 (build 26) ── ── recovered (build 26) ── heichal26.js — inside the Heichal, the second lot's inner roles (יומא ב, ג;
 * תמיד ג, ו–ט; ו, א): the two who won go up first with the teni and the kuz and two keys; at the great gate the bolt (a swipe ↔) and the
 * key (a hold) — "השער הגדול נפתח!" and, once in a while, "נשמע עד יריחו!"; then by his role:
 *   the inner altar (דישון מזבח הפנימי) — the teni set before him, the ashes drawn into it with slow pulls (too fast: a scratch in
 *   the gold), "ובאחרונה כבד את השאר", the teni left, and out;
 *   the menorah (דישון המנורה, הטבת הנרות) — on the three-step stone, lamp by lamp in the schedule's order: the old wick out with the
 *   tongs (a swipe ⬆), the lamp wiped (↔), half a log of oil from the kuz (a hold to the gold band), a new wick, its fire dragged from a
 *   lit lamp when the eastern one went out; two lamps left for after the tamid's blood, the kuz on the second step.
 * The Heichal's dark (a vignette), its fake volumetric light (cones, halos, the card on the parochet, the gate's shaft), the music and
 * the beds ducked inside (mute26: __BH_MUSIC.duck and o.sfx.duck), his steps' echo; the other kohanim at the roles the lot did not give
 * him, seen on screen (the shochet at the rings, the zorek after the five lamps, the limb carriers, the teni's second entry).
 * The engine is day33.js (E.r26(): in → bolt → key → open → walk → step … → out; r26swipe, r26hold, r26pull, r26tap, r26light; role26,
 * open26, g26t, men5t, r26r); its places and times: P26; the roles: POOL26.
 *   createHeichal26({ E, sfx, doc, view }) → { destroy(), state() }      (focus17.js makes it when E.p26on; globalThis.__H26)
 * The bundle kept no comment and no local name: the names are the recovery's, but for snd, buzz, WD, HT (heichal26.js:46), mute26
 * (:56), S, ev, y, pop, big and SRC (:207) — the build reports' lines. Never a Divine Name. */
import * as THREE from 'three';
import { addDrawer, L, onTick } from './draw.js';
import { lamb, man, ROBE, SKIN } from '../works/figures.js';
import { P26, POOL26 } from './day33.js';
import { reg30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ──
import { ALTAR_CORNERS, DESHEN_PLACE, LIMBS_PLACE, TAMID_RING } from '../../places.js';
export function createHeichal26(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null;
  if (!doc || !E || !E.on17 || !E.p26on) return { destroy() {}, state: () => ({}) };
  const T = globalThis.__T,
    cam = () => T && T.camera,
    hk = () => (T && T.sanctuary) || null,
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
        return p && p.on !== false ? p : null;
      } catch (e) {
        return null;
      }
    },
    lerp = (a, b, u) => a + (b - a) * u,
    clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  if (!doc.getElementById('hk26-css')) {
    const css = doc.createElement('style');
    css.id = 'hk26-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  let mk = (cls, html) => {
      const el = doc.createElement('div');
      el.className = 'hk26 ' + cls;
      if (html) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    vig = mk('hk26-v'),
    pad = mk('hk26-in'),
    hint = mk('hk26-h'),
    line = mk('hk26-m'),
    big = mk('hk26-x'),
    flashEl = mk('hk26-f'),
    verb = mk('hk26-u'),
    gauge = mk('hk26-g'),
    fire = mk('hk26-fl', '🔥'),
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
    inAct30 = () => !!(E.act30 && E.act30()),
    flash = (html) => (E.say30 && E.say30(html, /✓/.test(html) ? 'ok' : 'no', 1.6) ? null : pop(flashEl, html)),
    S = { hush: 1, gate: 0, pulls: 0, scr: 0, pours: 0, band: 0, wicks: 0, lit: 0, drag: 0, steps: 0, lines: [], jer: 0 },
    HUSH = 0.2,
    hushK = 1,
    hushSet = 1,
    mute26 = (k) => {
      try {
        const music = globalThis.__BH_MUSIC;
        if (music && typeof music.duck === 'function') music.duck(k < 0.999, k);
      } catch (e) {}
      try {
        if (o.sfx && typeof o.sfx.duck === 'function') o.sfx.duck(k);
      } catch (e) {}
    },
    lineUntil = -1,
    say = (html, s = 5) => {
      if (inAct30()) return;   // ── fable32 (build 30) ── ── /fable32 ──
      put(line, html);
      S.lines.push(html.replace(/<[^>]+>/g, '').slice(0, 40));
      lineUntil = E.st33.t + s;
    },
    order = [0, 1, 2, 3, 4, 5, 6],
    lamps = P26.lx.map((x) => ({ x, y: P26.ly, z: P26.lz })),
    hk0 = hk();
  if (hk0)
    try {
      hk0.setMenorah({ style: 'round' });
      const sorted = [0, 1, 2, 3, 4, 5, 6].map((a) => ({ i: a, p: hk0.lampPosition(a) })).sort((a, b) => a.p.x - b.p.x);
      order = sorted.map((p) => p.i);
      lamps = sorted.map((p) => ({ x: p.p.x, y: p.p.y, z: p.p.z }));
    } catch (e) {}
  // ── fable32 (build 36) ── the menorah's level 4: a pan of coals from the outer altar by the stone ("מדליקו מעל מזבח העולה", תמיד ו, א —
  // brought in: המחשה), the western lamp's fire dragged from it ── /fable32 ──
  const PAN36 = { x: (lamps[5].x + lamps[6].x) / 2 + 0.45, y: lamps[5].y - 0.9, z: lamps[5].z - 0.4 };
  let litKey = '',
    doors = -1,
    setLamps = (lit) => {
      const key = lit.join();
      if (key === litKey) return;
      litKey = key;
      const arr = new Array(7).fill(0);
      lit.forEach((v, i) => {
        arr[order[i]] = v;
      });
      try {
        hk().setLamps(arr);
      } catch (e) {}
    },
    setGlow = (i, v) => {
      try {
        hk()._dbg.UV.uHi.value[i] = v;
      } catch (e) {}
    },
    paintTex = (w, h, paint) => {
      const cv = doc.createElement('canvas');
      cv.width = w;
      cv.height = h;
      paint(cv.getContext('2d'), w, h);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    },
    fadeTex = paintTex(4, 64, (g) => {
      const grad = g.createLinearGradient(0, 0, 0, 64);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.35, '#FFFFFF66');
      grad.addColorStop(1, '#FFFFFF00');
      g.fillStyle = grad;
      g.fillRect(0, 0, 4, 64);
    }),
    glowTex = paintTex(64, 64, (g) => {
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, '#FFFFFF80');
      grad.addColorStop(1, '#FFFFFF00');
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
    }),
    glowMat = (map, color) =>
      new THREE.MeshBasicMaterial({
        map,
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
        toneMapped: false,
      }),
    light = new THREE.Group();
  light.name = 'heichal26-light';
  light.visible = false;
  if (T && T.scene) T.scene.add(light);
  const coneGeo = new THREE.ConeGeometry(0.85, 2.7, 18, 1, true).translate(0, -1.35, 0),
    quadGeo = new THREE.PlaneGeometry(1, 1),
    cones = lamps.map((p) => {
      const m = new THREE.Mesh(coneGeo, glowMat(fadeTex, '#FFB25E'));
      m.position.set(p.x, p.y + 0.05, p.z);
      m.renderOrder = 6;
      light.add(m);
      return m;
    }),
    halos = lamps.map((p) => {
      const m = new THREE.Mesh(quadGeo, glowMat(glowTex, '#FFC27A'));
      m.position.set(p.x, p.y + 0.1, p.z);
      m.scale.setScalar(1.1);
      m.renderOrder = 7;
      light.add(m);
      return m;
    }),
    parochet = new THREE.Mesh(quadGeo, glowMat(glowTex, '#FFB86A'));
  parochet.position.set(-137.6, 27.5, 0);
  parochet.rotation.y = Math.PI / 2;
  parochet.scale.set(22, 13, 1);
  light.add(parochet);
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(6.5, 26, 20, 1, true).translate(0, -13, 0), glowMat(fadeTex, '#FFF0D0'));
  shaft.position.set(-96.5, 33, 0);
  shaft.rotation.z = -1.18;
  light.add(shaft);
  const touches = new Map(),
    tsOf = (ev) => (ev.timeStamp > 0 ? ev.timeStamp : performance.now()),
    dragFire = { x: NaN, y: NaN };
  pad.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      pad.setPointerCapture(ev.pointerId);
    } catch (e) {}
    const p = E.r26();
    if (p) {
      touches.set(ev.pointerId, {
        x0: ev.clientX,
        y0: ev.clientY,
        lx: ev.clientX,
        ly: ev.clientY,
        t0: tsOf(ev),
        tx: null,
        ty: null,
        H: [[tsOf(ev), ev.clientY]],
        v: 0,
        pulled: false,
      });
      if (p.ph === 'key' || p.ph === 'pour') E.r26hold(true);
      if (p.ph === 'drag' || p.ph === 'altar') {   // ── fable32 (build 36) ── (level 4, the western lamp: the fire from the outer altar's pan — PAN36) ── /fable32 ──
        const q = p.ph === 'altar' ? proj(PAN36.x, PAN36.y + 0.12, PAN36.z) : proj(lamps[5].x, lamps[5].y + 0.1, lamps[5].z);
        if (q) {
          dragFire.x = q.x;
          dragFire.y = q.y;
        }
      }
    }
  });
  pad.addEventListener('pointermove', (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    const k = E.r26(),
      t = tsOf(ev),
      dx = ev.clientX - p.lx,
      dy = ev.clientY - p.ly;
    p.lx = ev.clientX;
    p.ly = ev.clientY;
    if (p.tx == null && Math.abs(ev.clientX - p.x0) > P26.sw * WD()) p.tx = t - p.t0;
    if (p.ty == null && p.y0 - ev.clientY > P26.wick * HT()) p.ty = t - p.t0;
    p.H.push([t, ev.clientY]);
    while (p.H.length > 2 && t - p.H[0][0] > 70) p.H.shift();
    const h0 = p.H[0],
      vy = t > h0[0] ? (((ev.clientY - h0[1]) / (t - h0[0])) * 1e3) / HT() : 0;
    if (vy > p.v) p.v = vy;
    if (k && k.ph === 'pull' && !p.pulled && ev.clientY - p.y0 > P26.dy * HT()) {
      p.pulled = true;
      E.r26pull(p.v);
    }
    if (k && (k.ph === 'drag' || k.ph === 'altar') && Number.isFinite(dragFire.x)) {
      dragFire.x += dx * 1.4;
      dragFire.y += dy * 1.4;
      const tg = k.ph === 'altar' ? lamps[5] : lamps[6],   // ── fable32 (build 36) ── (the western lamp from the pan) ── /fable32 ──
        q = proj(tg.x, tg.y + 0.05, tg.z);
      if (q && Math.hypot(q.x - dragFire.x, q.y - dragFire.y) < 16) {
        E.r26light(k.ph === 'altar' ? 'altar' : undefined);
        dragFire.x = NaN;
      }
    }
    if (k && k.ph === 'teni36') E.r26bal((ev.clientX - p.x0) / 70);   // ── fable32 (build 36) ── (the teni held level by the right thumb's drag, as the ashes' pan) ── /fable32 ──
  });
  const up = (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    touches.delete(ev.pointerId);
    const k = E.r26();
    if (!k) return;
    if (k.ph === 'teni36') E.r26bal(null);   // ── fable32 (build 36) ── ── /fable32 ──
    if (k.ph === 'key' || k.ph === 'pour') {
      E.r26hold(false);
      return;
    }
    if (ev.type !== 'pointerup') return;
    const dx = ev.clientX - p.x0,
      dy = ev.clientY - p.y0,
      d = Math.hypot(dx, dy),
      ms = tsOf(ev) - p.t0;
    if (k.ph === 'bolt' || k.ph === 'wipe') {
      if (d > 14) E.r26swipe(dx / WD(), dy / HT(), p.tx != null ? p.tx : ms);
    } else if (k.ph === 'wick') {
      if (d > 14) E.r26swipe(dx / WD(), dy / HT(), p.ty != null ? p.ty : ms);
    } else if (k.ph === 'pull') {
      if (!p.pulled && d > 14) flash('משכו ארוך יותר ⬇');
    } else if (d < 16 && ms < 400 && !E.r26tap() && k.ph === 'drag') flash('גררו את האש מן הנר הדולק');
    else if (d < 16 && ms < 400 && k.ph === 'altar') flash('גררו את האש מן המחתה — ממזבח העולה');   // ── fable32 (build 36) ── ── /fable32 ──
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(type, up);
  let hp = { x: 0, y: 16, z: 0, yaw: 0 },
    litFx = { j: -1, from: -1, t: 0 },
    pullFx = { t: -1 },
    wickFx = { t: -1, j: -1 },
    wipeFx = { t: -1, j: -1 },
    bolt = { v: 0 },
    teniDay = -1,
    on = false,
    lastPh = '',
    phAt = 0,
    pourT = 0,
    inBand = false,
    stepT = 0,
    stepN = 0,
    lastX = NaN,
    lastZ = NaN,
    gaugeHtml = '',
    teni2Day = -1,
    fiveDay = -1,
    bloodDay = -1,
    teniAt = 0,
    setOn = (active) => {
      if (on !== active) {
        on = active;
        doc.body.classList.toggle('hk26-on', active);
        try {
          const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
            twin = mods && mods.twin;
          if (twin && twin.noStick) twin.noStick(active || globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
    },
    ACTIVE = /^(in|bolt|key|open|step|set|pull|leave|wick|wipe|pour|spill|new|drag|lit|kuz|kuzd|altar|lift36|teni36)$/,   // ── fable32 (build 36) ── (+ the levels' phases) ── /fable32 ──
    PAD_PH = /^(bolt|key|pull|wick|wipe|pour|new|drag|kuz|altar|teni36)$/,
    VERB = {
      bolt: ['↔', 'sw', 'החליקו לרוחב'],
      key: ['🗝️', 'hd', 'החזיקו'],
      pull: ['⬇', 'dn', 'משכו לאט'],
      wick: ['⬆', 'up', 'החליקו למעלה'],
      wipe: ['↔', 'sw', 'החליקו לרוחב'],
      pour: ['●', 'hd', 'החזיקו — ושחררו בפס'],
      new: ['👆', 'hd', 'הקישו'],
      kuz: ['👆', 'hd', 'הקישו'],
      drag: ['🔥', 'sw', 'גררו את האש'],
    },
    HINT = {
      bolt: ['העבירו את הנגר — החליקו ↔', SRC.gate],
      key: ['סובבו את המפתח — החזיקו', SRC.go],
      set: ['הטני לפניכם', SRC.teni],
      pull: ['חפנו את הדשן לטני — משכו מטה, לאט', SRC.inner],
      leave: ['הניחו את הטני — וצאו', SRC.inner],
      wick: ['המלקחיים: הוציאו את הפתילה הישנה — החליקו ⬆', SRC.wick],
      wick2: ['הוציאו את הפתילה וקנחו את הנר — החליקו ⬆', SRC.wick],
      wipe: ['קנחו את הנר — החליקו ↔', SRC.wick],
      pour: ['הכוז: החזיקו — עד הפס הזהוב (חצי לוג)', SRC.oil],
      spill: ['נשפך — נקו ונסו שוב', SRC.oil],
      new: ['פתילה חדשה — הקישו', SRC.lit],
      drag: ['הנר המזרחי כבה — גררו את האש מן הנר הדולק', SRC.relit],
      kuz: ['הניחו את הכוז על המעלה השנייה — הקישו', SRC.kuz2],
      kuzd: ['', SRC.kuz2],
      step: ['על אבן שלוש המעלות', SRC.stone],
      lit: ['', SRC.lit],
    },
    offTick = onTick((tt, dt) => {
      const st = E.st33;
      if (!st) return;
      const step = Math.min(0.1, dt > 0 ? dt : 0);
      if (st.paused) dt = 0;
      try {
        T.stages.heroXYZ(hp);
      } catch (e) {}
      const K = E.r26(),
        ph = K ? K.ph : '',
        t = performance.now() / 1e3,
        live = st.phase === 'run' && !st.summary && !st.night,
        role = E.role26(),
        open = E.open26(),
        hall = hk();
      if (ph !== lastPh) {
        lastPh = ph;
        phAt = t;
      }
      const since = t - phAt;
      if (lineUntil >= 0 && st.t > lineUntil) {
        lineUntil = -1;
        put(line, '');
      }
      if (hall) {
        const d = open ? 1 : 0;
        if (d !== doors) {
          doors = d;
          try {
            hall.setDoors(d);
          } catch (e) {}
        }
        let lit = [0, 0, 0, 0, 0, 1, 1],
          done = E.r26r() && E.r26r().day === st.day;
        if (K && K.role === 'menorah' && !done) lit = K.lit.slice();
        else if (done || (open && role === 'inner' && st.t - E.g26t() > 14)) lit = [1, 1, 1, 1, 1, 1, 1];
        else if (open && role === 'inner') {
          const n = Math.floor((st.t - E.g26t() - 3) / 2.2);
          for (let i = 4; i >= 0; i--) if (4 - i < n) lit[i] = 1;
        }
        if (!live && !st.summary) lit = [1, 1, 1, 1, 1, 1, 1];
        setLamps(lit);
        const inHall = cam() && cam().position.x < -98.2,
          wInner = ph === 'walk' && role === 'inner' ? 0.7 : 0,
          wMen = ph === 'walk' && role === 'menorah' ? 0.6 : 0;
        setGlow(9, inHall ? Math.max(0.4, wInner) : 0);
        setGlow(6, inHall ? 0.35 : 0);
        setGlow(2, inHall ? Math.max(0.12, wMen) : 0);
        setGlow(5, wMen * 0.6);
      }
      const camera = cam(),
        inside = !!(camera && camera.position.x < -97.8 && Math.abs(camera.position.z) < 10 && live);
      vig.classList.toggle('on', inside);
      light.visible = !!(camera && camera.position.x < -78 && Math.abs(camera.position.z) < 30 && live && (open || inside));
      {
        const inGate = live && hp.x < -92.4 && Math.abs(hp.z) < 10,
          want = inGate ? HUSH : 1;
        if (!st.paused || !live) hushK += Math.sign(want - hushK) * Math.min(Math.abs(want - hushK), (step * (1 - HUSH)) / 1.2);
        if (Math.abs(hushK - hushSet) > 0.03 || ((hushK === 1 || hushK === HUSH) && hushK !== hushSet)) {
          hushSet = hushK;
          S.hush = Math.round(hushK * 100) / 100;
          mute26(hushK);
        }
      }
      if (light.visible) {
        const vals = litKey.split(',').map(Number),
          lit = order.map((i) => vals[i] || 0),
          sum = lit.reduce((s, v) => s + v, 0);
        cones.forEach((m, i) => {
          m.material.opacity = 0.04 * lit[i] * (0.9 + 0.1 * Math.sin(t * 7 + i));
        });
        halos.forEach((m, i) => {
          m.material.opacity = 0.3 * lit[i];
          if (camera) m.quaternion.copy(camera.quaternion);
        });
        parochet.material.opacity = 0.05 + 0.03 * sum;
        shaft.material.opacity = open ? 0.055 : 0;
      }
      const acting = !!K && ACTIVE.test(ph);
      setOn(acting && live);
      pad.classList.toggle('on', !!K && PAD_PH.test(ph) && live);
      if (!pad.classList.contains('on')) touches.clear();
      const H = hero();
      if (H) {
        const men = K && K.role === 'menorah',
          onLamp = men && /^(wick|wipe|pour|spill|new|drag|lit|kuz)$/.test(ph);
        H.lift(onLamp ? P26.men.y : men && ph === 'step' ? P26.men.y * clamp01(since / P26.step) : 0);
        const li = K ? K.ord[Math.min(K.li, K.ord.length - 1)] : -1,
          lamp = li >= 0 ? lamps[li] : null;
        H.hold21(
          K
            ? /^(bolt|key)$/.test(ph)
              ? { x: -91.4, y: 24.2, z: 0.6 }
              : ph === 'pull' || ph === 'set'
                ? { x: -120.75, y: 24.15 + 0.1 * Math.sin(t * 6), z: 0.05 }
                : onLamp && lamp && ph !== 'kuz'
                  ? { x: lamp.x + 0.25, y: lamp.y + 0.1, z: lamp.z - 0.15 }
                  : ph === 'kuz'
                    ? { x: -122.8, y: 22.9, z: 7.3 }
                    : null
            : null,
        );
      }
      const speed = Number.isFinite(lastX) && dt > 0 ? Math.hypot(hp.x - lastX, hp.z - lastZ) / dt : 0;
      lastX = hp.x;
      lastZ = hp.z;
      if (live && hp.x < -76.5 && Math.abs(hp.z) < 30 && speed > 1.2 && speed < 30 && (stepT -= dt) <= 0) {
        stepT = 0.34;
        snd('step26', { n: stepN++ });
        S.steps++;
      }
      if (ph === 'pour' && K.held) {
        if ((pourT -= dt) <= 0) {
          pourT = 0.08;
          snd('pour26', { f: 300 + 500 * Math.min(1, K.fill) });
        }
        const nowBand = K.fill >= ((K.P36 && K.P36.lo) || P26.pour.lo) && K.fill <= ((K.P36 && K.P36.hi) || P26.pour.hi);   // ── fable32 (build 36) ── (the band by the level) ── /fable32 ──
        if (nowBand && !inBand) {
          snd('bell26');
          buzz(25);
          S.band++;
        }
        inBand = nowBand;
      } else inBand = false;
      // ── fable32 (build 30) ── (the hint card — HINT's lines and their sources — is gone while he works in the Heichal: the step card's
      // one line (rate30 LINE30.menorah / .inner); HINT's sources at the end, SRC30. The gesture's cue by the right thumb keeps its icon,
      // its words (VERB[2]) are the line's) ── /fable32 ──
      put(hint, '');
      const verbRow = live && K ? VERB[ph] : null,
        verbKey = verbRow ? ph : '';
      if (verb.__k !== verbKey) {
        verb.__k = verbKey;
        verb.className = `hk26 hk26-u${verbRow ? ' on ' + verbRow[1] : ''}`;
        verb.innerHTML = verbRow ? `<i>${verbRow[0]}</i>` : '';
      }
      let g = '';
      if (live && K)
        if (ph === 'key') g = `<div class="k" style="background:conic-gradient(#FFD66E ${(K.kp * 360) | 0}deg,#2A1C10 0)">🗝️</div>המפתח`;
        else if (/^(set|pull|leave)$/.test(ph))
          g = `🥣 בטני: <b>${Math.round((1 - K.ash) * 100)}%</b><div class="r"><i style="width:${Math.round((1 - K.ash) * 100)}%"></i></div>${K.P36 && K.P36.guide === 0 ? '' : `דיוק: <b>${K.acc}%</b><div class="r"><i style="width:${K.acc}%"></i></div>` /* ── fable32 (build 36) ── (level 3 on: no guide — the gauge keeps the teni's fill only) ── */}<small>המחשה</small>`;
        else if (ph === 'lift36' || ph === 'teni36') {   // ── fable32 (build 36) ── (level 4: the teni carried out — its tilt; the coals fallen) ── /fable32 ──
          const b = Math.max(-1, Math.min(1, K.b || 0)), lim = (K.P36 && K.P36.teni && K.P36.teni.lim) || 0.6;
          g = `🥣 הטני — ישר<div class="r t36"><u style="left:${(50 - 50 * lim).toFixed(1)}%;width:${(100 * lim).toFixed(1)}%"></u><i style="left:${(50 + 50 * b).toFixed(1)}%"></i></div>${K.spills ? `נפלו ${K.spills}` : 'אף גחלת'}<small>המחשה</small>`;
        }
        else if (ph === 'pour' || ph === 'spill') {
          const f = Math.min(P26.pour.max, K.fill) / P26.pour.max,
            lo = (K.P36 && K.P36.lo) || P26.pour.lo,
            hi = (K.P36 && K.P36.hi) || P26.pour.hi;   // ── fable32 (build 36) ── (the band by the level) ── /fable32 ──
          g = `🏺 חצי לוג<div class="b"><u style="bottom:${((lo / P26.pour.max) * 100).toFixed(1)}%;height:${(((hi - lo) / P26.pour.max) * 100).toFixed(1)}%"></u><i style="height:${(f * 100).toFixed(1)}%"></i></div>${Math.round(K.fill * 100)}%<small>המחשה</small>`;
        } else if (K.role === 'menorah' && /^(wick|wipe|new|drag|lit|altar)$/.test(ph)) g = `🪔 נר ${K.li + 1}/${K.ord.length}`;
      if (g !== gaugeHtml) {
        gaugeHtml = g;
        put(gauge, g);
      }
      gauge.classList.toggle('hot', inBand);
      const dragging = ph === 'drag' && Number.isFinite(dragFire.x);
      fire.classList.toggle('on', dragging);
      if (dragging) fire.style.transform = `translate(${(dragFire.x - 17) | 0}px,${(dragFire.y - 24) | 0}px)`;
      const g26 = E.g26t(),
        men5 = E.men5t();
      if (g26 != null && men5 != null && bloodDay !== st.day && role !== 'shochet' && role !== 'zorek' && st.t > Math.max(men5, g26 + 12) + 0.6) {   // ── fable32 (build 27) ── (his own blood role: dam27.js) ── /fable32 ──
        bloodDay = st.day;
        say(`דם התמיד — אחרי חמש הנרות<small>${SRC.five}</small>`, 5);
      }
      const doneToday = E.r26r() && E.r26r().day === st.day,
        dayT = st.dayT || 0;
      if (doneToday && teni2Day !== st.day && dayT >= 22) {
        teni2Day = st.day;
        teniAt = st.t;
        teniDay = st.day;
        say(`כהן נכנס, נטל את הטני והשתחווה ויצא — אל מקום הדשן שליד הכבש<small>${SRC.teni2} · ${SRC.heap}</small>`, 6);
      }
      if (doneToday && fiveDay !== st.day && dayT >= 36) {
        fiveDay = st.day;
        say(`כהן נכנס והטיב את שתי הנרות — אחרי דם התמיד<small>${SRC.five}</small>`, 5);
      }
      S.npc = teniAt;
    }),
    kohen = (k, x, z, fx, fz, opt) =>
      man(k, L(x), L(z), L(gy(x, z)) + (opt.lift || 0) / 2.3, {
        robe: ROBE.kohen,
        yaw: Math.atan2(fz, fx),
        skin: SKIN[opt.s | 0],
        t: opt.t,
        ...opt.o,
      }),
    teni = (k, x, y, z, ash, s = 1) => {
      k.wc(x, y + 0.17 * s, z, 0.34 * s, 0.34 * s, GOLD_K);
      k.wc(x, y + 0.35 * s, z, 0.37 * s, 0.03 * s, '!#F2CF6A');
      if (ash > 0.01) k.wc(x, y + 0.04 * s + 0.27 * s * ash, z, 0.3 * s, 0.03, ASH);
    },
    kuz = (k, x, y, z, s = 1, tilt = 0) => {
      k.ws(x, y + 0.24 * s, z, 0.19 * s, 0.24 * s, 0.19 * s, GOLD_K, { pitch: tilt });
      k.wc(x, y + 0.5 * s, z + Math.sin(tilt) * 0.2, 0.07 * s, 0.16 * s, GOLD_K, { pitch: tilt });
      k.wc(x + 0.17 * s, y + 0.36 * s, z, 0.025 * s, 0.22 * s, '!#F2CF6A', { roll: 1 });
    },
    inHand = (k, fig, fn) => {
      if (fig && fig.R) fn(fig.R);
    },
    along = (way, d) => {
      for (let i = 1; i < way.length; i++) {
        const dx = way[i][0] - way[i - 1][0],
          dz = way[i][1] - way[i - 1][1],
          len = Math.hypot(dx, dz);
        if (d <= len || i === way.length - 1) {
          const u = clamp01(d / len);
          return [way[i - 1][0] + dx * u, way[i - 1][1] + dz * u, dx, dz];
        }
        d -= len;
      }
      return [way[0][0], way[0][1], 1, 0];
    },
    pathLen = (way) => way.reduce((s, p, i) => s + (i ? Math.hypot(p[0] - way[i - 1][0], p[1] - way[i - 1][1]) : 0), 0),
    RING = TAMID_RING.morning,
    NE = ALTAR_CORNERS.NE,
    LIMBS_WAY = [
      [RING[0], RING[1] + 1.5],
      [-57.4, -24],
      [-57.4, 14],
      [-48.2, 44.6],
      [LIMBS_PLACE.x, 40.5],
      [LIMBS_PLACE.x, 34],
    ],
    limbsLen = pathLen(LIMBS_WAY),
    ASH_WAY = [
      [-74, 2],
      [-57.4, 14],
      [-48.2, 44.6],
      [DESHEN_PLACE.x, 44.6],
      [DESHEN_PLACE.x, DESHEN_PLACE.z + 1],
    ],
    ashLen = pathLen(ASH_WAY),
    LIMB_COLORS = ['#E6D3BC', '#E6D3BC', '#E6D3BC', '#E6D3BC', '#E6D3BC', '#DCCBB2', '#F2EDE2', '#B8B0A0', '#7A5A3A'],
    offDraw = addDrawer(
      null,
      (k, tt) => {
        const st = E.st33;
        if (!st || st.phase !== 'run' || st.night || st.summary) return;
        const K = E.r26(),
          ph = K ? K.ph : '',
          role = E.role26(),
          open = E.open26(),
          g26 = E.g26t(),
          clock = st.t,
          t = performance.now() / 1e3,
          gateOn = E.gate26() || (K && /^(in|bolt|key|open)$/.test(ph));
        if (gateOn && !open) {
          bolt.v = ph === 'key' || ph === 'open' ? Math.min(1, bolt.v + 0.05) : 0;
          k.wb(-91.7, 23.9, bolt.v * 3.2, 4.6, 0.16, 0.26, GOLD);
          if (ph === 'key') {
            const H2 = hero(),
              hand = H2 && (H2.at('handslotr') || H2.at('handr'));
            if (hand) {
              k.wc(hand.x, hand.y, hand.z, 0.03, 0.34, GOLD, { pitch: Math.PI / 2 });
              k.wc(hand.x, hand.y - 0.08, hand.z, 0.03, 0.3, '#D9AE48', { pitch: Math.PI / 2, yaw: 0.4 });
            }
          }
        }
        const tool = role === 'inner' ? 'teni' : 'kuz',
          H = hero(),
          handL = H && (H.at('handslotl') || H.at('handl'));
        if (K && /^(lift36|teni36)$/.test(ph) && handL)   // ── fable32 (build 36) ── (level 4: the full teni in his hands, tilting as it tilts) ── /fable32 ──
          teni(k, handL.x + 0.12 * (K.b || 0), handL.y - 0.3, handL.z, 1, 0.75);
        else if (role && (E.gate26() || (K && /^(in|bolt|key|open|walk|step)$/.test(ph))) && handL)
          if (tool === 'teni') teni(k, handL.x, handL.y - 0.35, handL.z, 0, 0.75);
          else kuz(k, handL.x, handL.y - 0.3, handL.z, 0.8);
        if (role && (E.gate26() || K) && !(E.r26r() && E.r26r().day === st.day && !K)) {
          const other = role === 'inner' ? 'menorah' : 'inner',
            since = open ? clock - g26 : -1,
            to = other === 'inner' ? [-119.6, -0.9] : [-121.1, 6.9],
            from = [-89.6, -2.4],
            V = 2.8,
            dist = Math.hypot(to[0] - from[0], to[1] - from[1]),
            u = since < 0 ? 0 : clamp01((since * V) / dist),
            x = lerp(from[0], to[0], u),
            z = lerp(from[1], to[1], u),
            there = u >= 1,
            fig = kohen(k, x, z, there ? -1 : to[0] - from[0], there ? 0 : to[1] - from[1], {
              s: 1,
              t: clock,
              o: there
                ? other === 'inner'
                  ? { pose: 'scoop', u: 0.5 + 0.5 * Math.sin(clock * 2.6) }
                  : { pose: 'reach', u: 0.6 + 0.3 * Math.sin(clock * 1.8) }
                : since > 0
                  ? { pose: 'walk' }
                  : { pose: 'stand' },
            });
          if (other === 'inner')
            if (there) teni(k, -119.95, 22, -1.45, clamp01((since - dist / V) / 8));
            else inHand(k, fig, (p) => k.c(p[0], p[1], p[2] - 0.1, 0.13, 0.14, GOLD));
          else if (!there) inHand(k, fig, (p) => k.s(p[0], p[1], p[2], 0.08, 0.1, 0.08, GOLD));
        }
        if (role === 'inner' || (role === 'menorah' && open)) {
          const inner = role === 'inner',
            ash = inner
              ? K && K.role === 'inner' && !/^(out)$/.test(ph)
                ? K.ash
                : E.r26r() && E.r26r().day === st.day
                  ? 0
                  : 1
              : open && clock - g26 > 6
                ? Math.max(0, 1 - (clock - g26 - 6) / 8)
                : 1;
          if (ash > 0.01) {
            k.wb(-121, 24.03 + 0.03 * ash, 0, 0.82, 0.82, 0.06 * ash + 0.005, ASH);
            for (let i = 0; i < 3; i++) k.ws(-121.2 + i * 0.2, 24.08 + 0.05 * ash, -0.15 + (i % 2) * 0.3, 0.04 * ash, 0.025, 0.04 * ash, '!#FF9A3A');
          }
        }
        if (role === 'inner') {
          const panOn =
            (K && /^(set|pull|leave|out)$/.test(ph)) || (E.r26r() && E.r26r().day === st.day && (teniDay !== st.day || clock - teniAt < 0.5));
          if (panOn) teni(k, -120.25, 22, -0.8, K && K.role === 'inner' ? 1 - K.ash : 1);
          if (pullFx.t >= 0) {
            const u = clamp01((t - pullFx.t) / 0.35);
            if (u >= 1) pullFx.t = -1;
            else k.ws(lerp(-120.8, -120.25, u), lerp(24.15, 22.5, u) + 0.35 * Math.sin(u * Math.PI), lerp(0.05, -0.8, u), 0.09, 0.07, 0.09, ASH);
          }
        }
        if (K && K.role === 'menorah') {
          const li = K.ord[Math.min(K.li, K.ord.length - 1)],
            lamp = lamps[li],
            since = performance.now() / 1e3 - phAt;
          if (ph === 'wick') {
            k.wc(lamp.x, lamp.y + 0.02, lamp.z, 0.022, 0.1, '#2E241A');
            k.wc(lamp.x + 0.18, lamp.y + 0.12, lamp.z - 0.05, 0.012, 0.36, GOLD, { roll: 0.5 });
            k.wc(lamp.x + 0.22, lamp.y + 0.12, lamp.z + 0.02, 0.012, 0.36, GOLD, { roll: 0.62 });
          }
          if (wickFx.t >= 0) {
            const u = clamp01((t - wickFx.t) / 0.45);
            if (u >= 1) wickFx.t = -1;
            else {
              const from = lamps[wickFx.j];
              k.wc(from.x + 0.3 * u, from.y + 0.1 + 0.6 * u, from.z - 0.2 * u, 0.022, 0.1, '#2E241A', { roll: u * 3 });
            }
          }
          if (ph === 'wipe') k.wb(lamp.x + 0.1 * Math.sin(since * 9), lamp.y + 0.05, lamp.z, 0.16, 0.12, 0.04, LINEN);
          const wiping = wipeFx.t >= 0 && t < wipeFx.t + 0.4;
          if (wipeFx.t >= 0 && t >= wipeFx.t) {
            const u = clamp01((t - wipeFx.t) / 0.4),
              lamp2 = lamps[wipeFx.j] || lamp;
            if (u >= 1) wipeFx.t = -1;
            else k.wb(lamp2.x + 0.1 * Math.sin(u * 14), lamp2.y + 0.05, lamp2.z, 0.16, 0.12, 0.04, LINEN);
          }
          if ((ph === 'pour' && (K.held || !wiping)) || ph === 'spill') {
            kuz(k, lamp.x + 0.42, lamp.y + 0.12, lamp.z - 0.12, 0.7, K.held ? 0.9 : 0.25);
            if (K.held) k.wc(lamp.x + 0.14, lamp.y + 0.12, lamp.z - 0.06, 0.012, 0.22, '!#F2C44A', { roll: 0.45 });
            if (ph === 'spill') k.wc(lamp.x, lamp.y - 0.25 * clamp01(since / 0.4), lamp.z, 0.05, 0.3 * clamp01(since / 0.4), '!#E8B848');
          }
          if (/^(new|drag|lit|altar)$/.test(ph)) k.wc(lamp.x, lamp.y + 0.03, lamp.z, 0.02, 0.09, '#F2EBDD');
          if (K.west && /^(wick|wipe|pour|new|altar)$/.test(ph) && K.ord[K.li] === 5) {   // ── fable32 (build 36) ── (the pan of the outer altar's coals by the stone — המחשה) ── /fable32 ──
            k.ws(PAN36.x, PAN36.y, PAN36.z, 0.22, 0.06, 0.22, '#C9C2B4');
            for (let i = 0; i < 6; i++) k.ws(PAN36.x + 0.1 * Math.cos(i + t), PAN36.y + 0.06, PAN36.z + 0.1 * Math.sin(i * 1.7), 0.05, 0.04 + 0.01 * Math.sin(t * 9 + i), 0.05, i & 1 ? '!#FF7A2A' : '!#FFC062');
          }
          if (/^(wick|wipe|pour|new|drag)$/.test(ph)) {
            const r = (ph === 'drag' ? 0.3 : 0.22) * (1 + 0.12 * Math.sin(t * 6));
            for (let i = 0; i < 14; i++) {
              const a = (i / 14) * Math.PI * 2;
              k.wb(lamp.x + Math.cos(a) * r, lamp.y - 0.08, lamp.z + Math.sin(a) * r, 0.06, 0.022, 0.022, '!#FFD24A', { yaw: -a });
            }
          }
          if (litFx.j >= 0) {
            const u = clamp01((t - litFx.t) / P26.lit);
            if (u >= 1) litFx.j = -1;
            else {
              const from = lamps[litFx.from] || lamp,
                to2 = lamps[litFx.j];
              k.ws(
                lerp(from.x, to2.x, u),
                lerp(from.y, to2.y, u) + 0.12 + 0.1 * Math.sin(u * Math.PI),
                lerp(from.z, to2.z, u),
                0.05,
                0.07,
                0.05,
                '!#FFD27A',
              );
            }
          }
        }
        if (role === 'menorah' && ((K && /^(kuzd|out)$/.test(ph)) || (E.r26r() && E.r26r().day === st.day && !((st.dayT || 0) >= 36))))
          kuz(k, -122.8, 22.6, 7.5, 0.8);
        if (open && g26 != null && role !== 'shochet' && role !== 'zorek') {   // ── fable32 (build 27) ── (the court's shochet and zorek — when his role is a blood one, dam27.js draws them) ── /fable32 ──
          const since = clock - g26,
            men5 = E.men5t(),
            bloodAt = Math.max(men5 != null ? men5 - g26 : 14, 12) + 0.6;
          if (since < 30) {
            const x = RING[0] + 0.9,
              z = RING[1];
            lamb(k, L(x), L(z), L(gy(x, z)), { yaw: Math.PI, head: since < 4 ? 0.6 : 0 });
            kohen(k, RING[0] - 0.6, RING[1] - 0.8, 1, 0.6, { s: 0, t: clock, o: { pose: since < 6 ? 'scoop' : 'stand', u: 0.8 } });
          }
          if (since < bloodAt + 2) {
            const u = clamp01((since - 6) / 5),
              x = lerp(RING[0] + 1.2, NE[0] - 1.6, u),
              z = lerp(RING[1] + 1.4, NE[1] - 1.6, u),
              fig = kohen(k, x, z, u > 0 && u < 1 ? NE[0] - RING[0] : 1, u > 0 && u < 1 ? NE[1] - RING[1] : 0.8, {
                s: 2,
                t: clock,
                o: since > bloodAt && since < bloodAt + 1.4 ? { pose: 'raise', u: 1 } : u > 0 && u < 1 ? { pose: 'walk' } : { pose: 'hold' },
              });
            inHand(k, fig, (p) => k.c(p[0], p[1], p[2] + 0.03, 0.12, 0.08, SILVER));
          }
          const start = bloodAt + 5;
          for (let i = 0; i < 9; i++) {
            const d = (since - start - i * 1.7) * 3.2;
            if (d < 0 || d > limbsLen + 8) continue;
            const [x, z, dx, dz] = along(LIMBS_WAY, d),
              fig = kohen(k, x, z, d > limbsLen ? 0 : dx, d > limbsLen ? -1 : dz, {
                s: i % 3,
                t: clock,
                o: { pose: d > limbsLen ? 'hold' : 'carry' },
              });
            inHand(k, fig, (p) =>
              i < 6
                ? k.s(p[0], p[1], p[2] + 0.05, 0.16, 0.12, 0.12, LIMB_COLORS[i])
                : k.c(p[0], p[1], p[2] + 0.05, i === 7 ? 0.16 : 0.1, i === 7 ? 0.04 : 0.16, LIMB_COLORS[i]),
            );
          }
        }
        if (teniAt > 0) {
          const d = (clock - teniAt) * 2.8;
          if (d < ashLen + 3) {
            const [x, z, dx, dz] = along(ASH_WAY, d),
              there = d > ashLen,
              fig = kohen(k, x, z, there ? 0 : dx, there ? 1 : dz, { s: 1, t: clock, o: { pose: there ? 'pour' : 'carry' } });
            inHand(k, fig, (p) => k.c(p[0], p[1], p[2] + 0.06, 0.15, 0.15, GOLD));
          } else teniAt = -1;
        }
      },
      3,
    ),
    offEv = E.on17((ev) => {
      const y = ev.type,
        ph = ev.ph;
      if (y === 'p23' && ph === 'in' && ev.k26) say(`הפיס השני — שלושה עשר תפקידים<small>${SRC.lot}</small>`, 6);
      else if (y === 'r26') {
        if (ph === 'in') {
          snd('ui');
          say(`שני הזוכים מקדימים — הטני והכוז ושני מפתחות<small>${SRC.go}</small>`, 5);
        } else if (ph === 'open') snd('whoosh');
        else if (ph === 'set') {
          snd('stamp25', { no: 1 });
          say(`הטני<small>${SRC.teni}</small>`, 3);
        } else if (ph === 'wick' && ev.li === 0) say(`שני נרות מזרחיים דולקים — נשארים במקומן<small>${SRC.east}</small>`, 5);
        else if (ph === 'drag') {
          snd('warn17');
          say(`הנר המזרחי כבה<small>${SRC.relit}</small>`, 4);
        } else if (ph === 'lit') {
          litFx.j = ev.lamp;
          litFx.from = ev.from;
          litFx.t = performance.now() / 1e3;
          snd('ding17');
          S.lit++;
          if (ev.drag) {
            S.drag++;
            snd('chord17', { up: 1 });
            buzz([20, 30, 40]);
          }
        } else if (ph === 'kuzd') {
          snd('stamp25', { ok: 1 });
          buzz(30);
        } else if (ph === 'leave') snd('stamp25', { no: 1 });
      } else if (y === 'r26swipe')
        if (ev.ok)
          if (ev.ph === 'bolt') {
            snd('bolt26');
            buzz(35);
          } else if (ev.ph === 'wick') {
            snd('wick26');
            buzz(15);
            const K = E.r26();
            if (K) {
              wickFx.j = K.ord[K.li];
              wickFx.t = performance.now() / 1e3;
              if (ev.both) {
                wipeFx.j = wickFx.j;
                wipeFx.t = wickFx.t + 0.2;
                S.both = (S.both | 0) + 1;
                setTimeout(() => {
                  snd('whoosh');
                  buzz(12);
                }, 200);
              }
            }
          } else {
            snd('whoosh');
            buzz(12);
          }
        else {
          snd('soft');
          flash(
            ev.why === 'short'
              ? ev.ph === 'wick'
                ? 'ארוך יותר ⬆'
                : 'ארוך יותר ↔'
              : ev.why === 'slow'
                ? 'מהר יותר'
                : ev.ph === 'wick'
                  ? 'ישר למעלה ⬆'
                  : 'לרוחב ↔',
          );
        }
      else if (y === 'r26gate') {
        S.gate++;
        snd('gate26');
        buzz([60, 40, 140]);
        // ── fable32 (build 30) ── (in his act the gate's word is the step card's line; its sources — SRC.shochet, SRC.jer — at the end) ── /fable32 ──
        if (!(E.say30 && E.say30('השער הגדול נפתח!', 'ok', 2))) pop(big, `<b>השער הגדול נפתח!</b><small>${SRC.shochet}</small>`);
        if (ev.jer) {
          S.jer++;
          setTimeout(() => {
            if (!(E.say30 && E.say30('נשמע עד יריחו!', 'ok', 2))) pop(big, `<b>נשמע עד יריחו!</b><small>${SRC.jer}</small>`);
          }, 2300);
        }
      } else if (y === 'r26pull') {
        S.pulls++;
        pullFx.t = performance.now() / 1e3;
        if (ev.scratch) {
          S.scr++;
          snd('scrape26');
          buzz([40, 20, 40, 20, 60]);
          flash('לאט! שריטה בזהב — דיוק −5% · המחשה');
        } else snd('hand26', { n: ev.n });
        if (ev.sweep) {
          snd('ding17');
          flash('ובאחרונה כבד את השאר ✓');
        }
      } else if (y === 'r26pour') {
        S.pours++;
        if (ev.ok) flash('חצי לוג ✓');
        else if (ev.why === 'under') flash('מעט מדי — החזיקו שוב');
        else {
          snd('spill21');
          buzz([50, 30, 50]);
          flash('יותר מדי — נשפך · נסו שוב');
        }
      } else if (y === 'r26wick') {
        S.wicks++;
        snd('wick26', { hi: 1 });
        buzz(18);
      } else if (y === 'r26done') {
        snd('chord17', { up: 1 });   // ── fable32 (build 30) ── (the end's banner — "חמש נרות הוטבו +N ★ · coins" — is the step card's rating; "חמש נרות — לפני דם התמיד" and its source at the end) ── /fable32 ──
      }
    }),
    api = {
      destroy() {
        offTick();
        offDraw();
        offEv();
        setOn(false);
        if (hushSet < 1) mute26(1);
        try {
          const H = hero();
          H.hold21(null);
          H.lift(0);
        } catch (e) {}
        try {
          const hall = hk();
          hall.setLamps(1);
          hall.setDoors(0);
          hall.setMenorah({ style: 'straight' });
          for (const i of [2, 5, 6, 9]) setGlow(i, 0);
        } catch (e) {}
        try {
          T.scene.remove(light);
        } catch (e) {}
        for (const el of [vig, pad, hint, line, big, flashEl, verb, gauge, fire]) el.remove();
        if (globalThis.__H26 === api) delete globalThis.__H26;
      },
      state: () => {
        const K = E.r26();
        return {
          ...S,
          ph: K ? K.ph : null,
          layer: pad.classList.contains('on'),
          vignette: vig.classList.contains('on'),
          fx: light.visible,
          lamps: lamps.map((p) => {
            const q = proj(p.x, p.y, p.z);
            return q ? [q.x | 0, q.y | 0] : null;
          }),
          lit: litKey,
          flame: Number.isFinite(dragFire.x) ? [dragFire.x | 0, dragFire.y | 0] : null,
          hint: hint.textContent,
          roles: POOL26.length,
        };
      },
    };
  globalThis.__H26 = api;
  return api;
}
const cite = (text, src) => `"${text}" — ${src} · טיוטה`;
const SRC = {
  lot: cite('מי שוחט, מי זורק, ומי מדשן מזבח הפנימי, ומי מדשן את המנורה…', 'יומא ב, ג'),
  go: cite('מי שזכה בדשון מזבח הפנימי והמנורה היו מקדימין, וארבעה כלים בידם: הטני והכוז ושני מפתחות', 'תמיד ג, ו'),
  gate: cite('העביר את הנגר ואת הפותחות ופתחו', 'תמיד ג, ז'),
  shochet: cite('לא היה שוחט השוחט עד ששומע קול שער הגדול שנפתח', 'תמיד ג, ז'),
  jer: cite('מיריחו היו שומעין קול שער הגדול שנפתח', 'תמיד ג, ח'),
  place: cite('שלחן בצפון… ומנורה בדרום… מזבח ממוצע ועומד באמצע', 'יומא לג, ב'),
  teni: cite('הטני דומה לתרקב גדול של זהב', 'תמיד ג, ו'),
  kuz: cite('והכוז דומה לקיתון גדול של זהב', 'תמיד ג, ו'),
  inner: cite('והיה חופן ונותן לתוכו, ובאחרונה כבד את השאר לתוכו, והניחו ויצא', 'תמיד ג, ט'),
  east: cite('ומצא שני נרות מזרחיים דולקים, מדשן את השאר ומניח את אלו דולקין במקומן', 'תמיד ג, ט'),
  wick: cite('מסיר הפתילה וכל השמן שבנר ומקנחו', 'רמב״ם, תמידין ומוספין ג, יב'),
  oil: cite('שמן אחר במדה והוא חצי לוג', 'רמב״ם, תמידין ומוספין ג, יב'),
  lit: cite('כל נר שכבה מהן מדליקו מנר חברו', 'רמב״ם, תמידין ומוספין ג, יג'),
  relit: cite('מצאן שכבו, מדשנן ומדליקן מן הדולקים', 'תמיד ג, ט'),
  stone: cite('ואבן היתה לפני המנורה ובה שלש מעלות', 'תמיד ג, ט'),
  kuz2: cite('והניח את הכוז על מעלה שניה', 'תמיד ג, ט'),
  five: cite('והטבת חמש נרות קודם לדם התמיד, ודם התמיד קודם להטבת שתי נרות', 'יומא לג, א'),
  teni2: cite('נכנס ונטל את הטני והשתחוה ויצא', 'תמיד ו, א'),
  heap: cite('רחוק מן הכבש שלשה טפחים, מקום שנותנין… ודשון מזבח הפנימי והמנורה', 'תמיד א, ד'),
};
// ── fable32 (build 30) ── the Heichal's lines at the end of his role (were HINT's, the gate's banners and the bottom line, while he worked) ── /fable32 ──
{
  const NUM = 'המספרים (חצי הלוג, הפס, הדיוק): המחשה',
    GATE = [SRC.go, SRC.gate, SRC.shochet, SRC.jer];
  reg30('menorah', { chip: SRC.east, all: [...GATE, SRC.place, SRC.stone, SRC.east, SRC.wick, SRC.oil, SRC.lit, SRC.relit, SRC.kuz, SRC.kuz2, SRC.five, NUM] });
  reg30('inner', { chip: SRC.inner, all: [...GATE, SRC.place, SRC.teni, SRC.inner, SRC.five, NUM] });
}
const GOLD = '#E2B84A';
const GOLD_K = '!#C99A3C';
const ASH = '#8E8A82';
const SILVER = '#C9CED6';
const LINEN = '#EFE9DA';
const DOWN = -Math.PI / 2;
const CSS = `.hk26{position:fixed;z-index:32;direction:rtl;text-align:center;font:900 16px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:none;display:none}.hk26.on{display:block}.hk26 small{display:block;font-size:11px;font-weight:700;opacity:.88}
.hk26-v{display:block;inset:0;z-index:27;opacity:0;transition:opacity .8s;background:radial-gradient(ellipse at 50% 45%,#0000 30%,#140A02A0 72%,#080402E8)}.hk26-v.on{opacity:1}
.hk26-in{top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;pointer-events:auto}
.hk26-h,.hk26-z,.hk26-x,.hk26-f,.hk26-m{left:50%;transform:translateX(-50%)}.hk26-h{top:58px;padding:4px 12px;border-radius:12px;background:#1C140ACC;font-size:13px;max-width:72vw}.hk26-m{bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:31;padding:3px 12px;border-radius:12px;background:#1C140AD8;border:1.5px solid #E2B65A;color:#FFE6A0;font:800 12px/1.25 Heebo,system-ui,sans-serif;max-width:76vw}
.hk26-x{top:44%;z-index:37;white-space:nowrap;text-shadow:0 2px 3px #000}.hk26-x b{display:block;font-size:40px;color:#FFD66E;-webkit-text-stroke:1.5px #5A3608}.hk26-f{top:64%;z-index:34;font-size:18px;color:#FFD08A;white-space:nowrap;text-shadow:0 2px 3px #000}
.hk26-x.on,.hk26-f.on{animation:hk26w 2.2s forwards}@keyframes hk26w{0%{opacity:0}10%,82%{opacity:1}to{opacity:0}}
.hk26-u{left:75.5%;top:50%;transform:translate(-50%,-50%);z-index:31;color:#FFE6A0;font-size:18px;text-shadow:0 2px 4px #000}.hk26-u i{display:block;font-style:normal;font-size:46px;line-height:1.1}
.hk26-u.sw i{animation:hk26s .9s ease-in-out infinite}.hk26-u.up i{animation:hk26p .9s ease-in-out infinite}.hk26-u.dn i{animation:hk26d 1s ease-in-out infinite}.hk26-u.hd i{animation:hk26h 1s ease-in-out infinite}
@keyframes hk26s{0%{transform:translateX(30px);opacity:.3}60%{transform:translateX(-24px);opacity:1}to{transform:translateX(-30px);opacity:0}}@keyframes hk26p{0%{transform:translateY(26px);opacity:.3}60%{transform:translateY(-20px);opacity:1}to{transform:translateY(-26px);opacity:0}}
@keyframes hk26d{0%{transform:translateY(-24px);opacity:.3}70%{transform:translateY(22px);opacity:1}to{transform:translateY(26px);opacity:0}}@keyframes hk26h{50%{transform:scale(.82)}}
.hk26-g{right:16px;top:96px;width:116px;z-index:31;padding:6px 6px 8px;border-radius:14px;background:#1C140AD8;border:1.5px solid #E2B65A;font-size:12px}.hk26-g .k{width:62px;height:62px;margin:4px auto;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px}
.hk26-g .b{position:relative;height:118px;width:34px;margin:4px auto;border-radius:6px;background:#2A1C10;border:2px solid #8A6A3A;overflow:hidden}.hk26-g .b i{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(#FFE08A,#C8902E)}.hk26-g .b u{position:absolute;left:-2px;right:-2px;border:2px solid #FFF1B8;background:#FFD66E33;box-shadow:0 0 8px #FFD66E}
.hk26-g .r{height:10px;border-radius:5px;background:#2A1C10;margin:4px 2px;overflow:hidden}.hk26-g .r.t36{position:relative;height:14px;overflow:visible}.hk26-g .r.t36 u{position:absolute;top:0;bottom:0;background:#FFD66E33;border:1.5px solid #FFF1B8;border-radius:5px;box-sizing:border-box}.hk26-g .r.t36 i{position:absolute;top:-2px;width:6px;height:18px;margin-left:-3px;border-radius:3px;background:#FFE08A;box-shadow:0 0 6px #FFD66E}.hk26-g .r i{display:block;height:100%;background:linear-gradient(90deg,#C8902E,#FFE08A)}.hk26-g.hot{border-color:#FFF1B8;box-shadow:0 0 14px #FFD66E}
.hk26-fl{left:0;top:0;z-index:33;font-size:34px;display:none}.hk26-fl.on{display:block}body.hk26-on .gm .tw-pad,body.hk26-on .f17-bar{opacity:0!important;pointer-events:none!important}`;
