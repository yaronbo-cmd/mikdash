/* ── fable32 (build 25) ── ── recovered (build 25) ── pen25.js — the lamb pen, a morning task of the lot (בדיקת הטלה; מידות א, ו;
 * ערכין ב, ה): at the pen's door in the dark, the lamb brought in — alive on its rig (animals.js's sheepRig: walking, breathing, ears
 * and tail, its head turning toward the light); the right thumb aims the torch (the kit's one light, ONE warm hole in the dark); a
 * blemish (BLEM25: 6 kinds × 8 places, "המחשה") lights its ring and buzz when the beam finds it, the view narrows to it (ZOOM_FOV);
 * dirt (straw, mud) is not a blemish — a swipe brushes it off; then the stamp: "תמים" (the gold stamp on its back) or "פסול" (בעל מום).
 * A false approval costs a delay and a replacement lamb; his first lamb is easier to read; the dawn clock runs (P25.dawn). The other
 * kohanim's lamb when the lot gave it to another (E.npc25()), led away to the rings; the hoofs, the torch's crackle, the bleats.
 * The engine is day33.js (E.p25(): in → scan → zoom/dirt/clean/blem → ok/false → aside/bring → lead → end; p25tap, p25swipe, p25stamp,
 * p25focus); the lamb's places in the world: day33's at25.
 *   createPen25({ E, sfx, doc, view }) → { destroy(), state() }      (focus17.js makes it when E.p25on; globalThis.__P25)
 * The bundle kept no comment and no local name: the names are the recovery's, but for crackT, K, dt and snd — the report's line
 * pen25.js:134. Never a Divine Name. */
import * as THREE from 'three';
import { addDrawer, L, onTick } from './draw.js';
import { man, ROBE, SKIN } from '../works/figures.js';
import { sheepRig, rigEnd, rigMaterial, rigMesh, rigWrite, V3 } from '../../animals.js';
import { at25, BLEM25, P25 } from './day33.js';
import { reg30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ──
import { L33, LINE33, stalls33 } from './lamb33.js';   // ── fable32 (build 33) ── the lamb chamber's run: its stalls, the tags, its words ── /fable32 ──
export function createPen25(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null;
  if (!doc || !E || !E.on17 || !E.p25on) return { destroy() {}, state: () => ({}) };
  const T = globalThis.__T,
    scene = T && T.scene,
    cam = () => T && T.camera,
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
    hero = () => {
      const Hr = globalThis.__HERO35;
      return Hr && Hr.loaded ? Hr : null;
    },
    now = () => performance.now() / 1e3,
    W = () => innerWidth || 844,
    H = () => innerHeight || 390,
    proj = (x, y, z) => {
      try {
        const p = view && view.project(x, y, z);
        return p && p.on !== false ? p : null;
      } catch (e) {
        return null;
      }
    },
    lerp = (a, b, u) => a + (b - a) * u,
    clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v),
    is = (re, s) => re.test(s),
    // ── fable32 (build 33) ── the pen's places (the azara's pen, or the lamb chamber's run — E.pl25), the chamber's run (E.ch33: its stock
    // in the stalls, the light of the real hour — by day no torch and a light dusk round the look, at night the torch), the tags ── /fable32 ──
    PL = () => (E.pl25 ? E.pl25() : P25),
    CH0 = E.ch33 ? E.ch33() : null,
    CH = () => (E.ch33 ? E.ch33() : null),
    dayLit = () => { const c = CH(); return !!(c && c.lit === 'day'); },
    tagCol = (c) => (Number.isFinite(c) && c >= 0 ? L33.tags[c % L33.tags.length] : null);
  if (!doc.getElementById('p25-css')) {
    const css = doc.createElement('style');
    css.id = 'p25-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  let mk = (cls, html, tag = 'div') => {
      const el = doc.createElement(tag);
      el.className = 'p25 ' + cls;
      if (html) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    paintTex = (size, paint) => {
      const cv = doc.createElement('canvas');
      cv.width = cv.height = size;
      paint(cv.getContext('2d'));
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    },
    disc = (g, x, y, r, c0, c1) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, 6.3);
      g.fill();
    },
    line = (g, pts, w, color) => {
      g.strokeStyle = color;
      g.lineWidth = w;
      g.lineCap = g.lineJoin = 'round';
      g.beginPath();
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
    },
    ring = (g, r, color, w = 3) => {
      g.strokeStyle = color;
      g.lineWidth = w;
      g.beginPath();
      g.arc(32, 32, r, 0, 6.3);
      g.stroke();
    },
    seed = 11,
    rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647,
    PAINT = {
      wart: (g) => {
        disc(g, 32, 32, 18, '#B07A50', '#5A3820');
        ring(g, 18, '#3A2414');
        disc(g, 26, 26, 6, '#F2D6B0', '#F2D6B000');
        for (let i = 0; i < 7; i++) disc(g, 22 + rnd() * 20, 24 + rnd() * 18, 2.2, '#2E1C10', '#2E1C1000');
      },
      crack: (g) => {
        const pts = [
          [8, 20],
          [22, 30],
          [28, 22],
          [37, 38],
          [45, 30],
          [57, 44],
        ];
        line(g, pts, 9, '#E8D6BC');
        line(g, pts, 5, '#1E140C');
        line(
          g,
          [
            [37, 38],
            [40, 50],
          ],
          3,
          '#1E140C',
        );
      },
      cloud: (g) => {
        disc(g, 32, 32, 20, '#FFFFFF', '#B8C4D0');
        ring(g, 20, '#56606C');
        disc(g, 27, 27, 7, '#FFFFFF', '#FFFFFF00');
      },
      wound: (g) => {
        line(
          g,
          [
            [12, 44],
            [52, 22],
          ],
          16,
          '#C8A48A',
        );
        line(
          g,
          [
            [14, 43],
            [50, 23],
          ],
          8,
          '#4A2C1C',
        );
        line(
          g,
          [
            [16, 42],
            [48, 24],
          ],
          2,
          '#1E120A',
        );
      },
      tear: (g) => {
        g.fillStyle = '#E8D6BC';
        g.beginPath();
        g.moveTo(10, 14);
        g.lineTo(54, 12);
        g.lineTo(36, 52);
        g.fill();
        g.fillStyle = '#1A120C';
        g.beginPath();
        g.moveTo(17, 18);
        g.lineTo(47, 17);
        g.lineTo(35, 44);
        g.fill();
      },
      swell: (g) => {
        disc(g, 32, 33, 24, '#F2DCBC', '#9A7650');
        ring(g, 24, '#5A3E24', 4);
        disc(g, 25, 25, 9, '#FFF6E6', '#FFF6E600');
      },
      straw: (g) => {
        for (let i = 0; i < 8; i++) {
          const a = rnd() * 3.14,
            len = Math.cos(a) * 26,
            x = Math.sin(a) * 26,
            y = 32 + (rnd() - 0.5) * 12,
            c = 32 + (rnd() - 0.5) * 12;
          line(
            g,
            [
              [y - len, c - x],
              [y + len, c + x],
            ],
            4,
            '#6A4E1A',
          );
          line(
            g,
            [
              [y - len, c - x],
              [y + len, c + x],
            ],
            2.5,
            ['#F2D670', '#D9B248'][i % 2],
          );
        }
      },
      mud: (g) => {
        g.fillStyle = '#4A3420';
        g.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * 6.283,
            r = 14 + rnd() * 10;
          g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r * 0.8);
        }
        g.fill();
        for (let i = 0; i < 7; i++) disc(g, 22 + rnd() * 20, 24 + rnd() * 16, 3 + rnd() * 3, '#7A5E3E', '#7A5E3E00');
      },
    },
    texs = {},
    texOf = (id) => texs[id] || (texs[id] = paintTex(64, PAINT[id])),
    stampTex = paintTex(128, (g) => {
      disc(g, 64, 64, 60, '#FFF0B8', '#C8902E');
      g.strokeStyle = '#8A5A12';
      g.lineWidth = 6;
      g.beginPath();
      g.arc(64, 64, 54, 0, 6.3);
      g.stroke();
      g.fillStyle = '#5A3608';
      g.textAlign = 'center';
      g.direction = 'rtl';
      g.font = '900 38px Heebo,sans-serif';
      g.fillText('תמים', 64, 66);
      g.font = '800 20px Heebo,sans-serif';
      g.fillText('לקרבן', 64, 92);
    }),
    decalMat = (tex, opt) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: '#FFFFFF',
        emissiveIntensity: 0,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        roughness: 0.9,
        ...opt,
      }),
    rig = sheepRig(),
    lambs = rigMesh(rig.geo, rigMaterial('quad', rig.pose, { uPiv: { value: rig.piv.map(V3) } }, `uniform vec3 uPiv[${rig.piv.length}];`), CH0 ? 3 + L33.stalls : 3),   // ── fable32 (build 33) ── (+ the chamber's stalls in its run) ── /fable32 ──
    quad = new THREE.PlaneGeometry(1, 1),
    white = new THREE.Color(1, 1, 1),
    pose4 = [0, 0, 0, 0],
    anim4 = [0, 0, 0, 0],
    vis4 = [0, 0, 1, 0],
    stamp = new THREE.Mesh(quad, decalMat(stampTex, { emissive: '#7A5A20', emissiveIntensity: 1, metalness: 0.3, roughness: 0.4 }));
  stamp.visible = false;
  lambs.name = 'lamb25';
  if (scene) scene.add(lambs, stamp);
  // ── fable32 (build 33) ── (the chamber's run: the world's six lambs of the chamber — avodah3d's — step out while ours, his and the court's,
  // stand in the stalls; back at the end) ── /fable32 ──
  const chamberLambs = (n) => { try { const C = T && T.avodah && T.avodah.lambsChamber; if (C && C.count) C.count(n); } catch (e) {} };
  if (CH0) chamberLambs(0);
  let spots = [],
    shownL = null,
    setLamb = (L) => {
      for (const sp of spots) {
        scene.remove(sp.m);
        sp.m.material.dispose();
      }
      spots = [];
      shownL = L;
      if (!L || !scene) return;
      for (const sp2 of L.spots) {
        const m = new THREE.Mesh(quad, decalMat(texOf(sp2.kind === 'blem' ? BLEM25.cats[sp2.c].id : sp2.d)));
        m.visible = false;
        scene.add(m);
        spots.push({ m, s: sp2, o: 1, k: (L.big ? 1.45 : 1) * (sp2.r < 4 ? 0.17 : sp2.r < 6 ? 0.2 : 0.26) });
      }
    },
    dark = mk('p25-dk'),
    pad = mk('p25-in'),
    focusRing = mk('p25-fr'),
    tamimBtn = mk('p25-s p25-t', '<b>תמים</b><small>חותמת זהב</small>', 'button'),
    pasulBtn = mk('p25-s p25-p', '<b>פסול</b><small>בעל מום</small>', 'button'),
    bringBtn = mk('p25-b', '🐑 הביאו טלה חדש — הקישו', 'button'),
    dawnClock = mk('p25-w', '<i><b></b></i>שעון השחר'),
    dawnBar = dawnClock.querySelector('b'),
    hint = mk('p25-h'),
    blemLine = mk('p25-z'),
    bigNote = mk('p25-x'),
    flashEl = mk('p25-f'),
    setText = (el, html) => {
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
    flash = (html) => (E.say30 && E.say30(html, /^(פסול — יפה|הוברש)/.test(html) ? 'ok' : 'no', 1.6) ? null : pop(flashEl, html)),   // ── fable32 (build 30) ── (the act's one line for a moment) ── /fable32 ──
    tapOn = (el, fn) => {
      el.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        fn();
      });
    };
  for (const [btn, v] of [
    [tamimBtn, 'tamim'],
    [pasulBtn, 'pasul'],
  ])
    tapOn(btn, () => {
      btn.classList.add('dn');
      setTimeout(() => btn.classList.remove('dn'), 140);
      if (!E.p25stamp(v)) {
        snd('soft');
        buzz(10);
      }
    });
  tapOn(bringBtn, () => E.p25tap());
  const touches = new Map(),
    beam = { x: NaN, y: NaN, box: null, regs: [] },
    tsOf = (ev) => (ev.timeStamp > 0 ? ev.timeStamp : performance.now()),
    clampBeam = () => {
      const beamBox = beam.box;
      if (beamBox) {
        beam.x = Math.max(beamBox[0], Math.min(beamBox[2], beam.x));
        beam.y = Math.max(beamBox[1], Math.min(beamBox[3], beam.y));
      }
    };
  pad.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      pad.setPointerCapture(ev.pointerId);
    } catch (e) {}
    touches.set(ev.pointerId, { x0: ev.clientX, y0: ev.clientY, lx: ev.clientX, ly: ev.clientY, t0: tsOf(ev), tx: null });
  });
  pad.addEventListener('pointermove', (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    const L = E.p25(),
      dx = ev.clientX - p.lx,
      dy = ev.clientY - p.ly;
    p.lx = ev.clientX;
    p.ly = ev.clientY;
    if (p.tx == null && Math.abs(ev.clientX - p.x0) > P25.sw * W()) p.tx = tsOf(ev) - p.t0;
    if (L && L.ph === 'scan' && Number.isFinite(beam.x)) {
      beam.x += dx * AIM_K;
      beam.y += dy * AIM_K;
      clampBeam();
    }
  });
  const up = (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    touches.delete(ev.pointerId);
    const L = E.p25();
    if (!L || ev.type !== 'pointerup') return;
    const dx = ev.clientX - p.x0,
      dy = ev.clientY - p.y0,
      d = Math.hypot(dx, dy),
      ms = tsOf(ev) - p.t0;
    if (L.ph === 'dirt' && d > 14) E.p25swipe(dx / W(), dy / W(), p.tx != null ? p.tx : ms);
    else if (d < 14 && ms < 380 && !E.p25tap() && L.ph === 'scan') flash('כוונו את האור');
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(type, up);
  const lambSt = [0, 1].map((sd) => ({
    ...PL().door,
    sd,
    v: 0,
    ph: 0,
    wk: 0,
    hp: 0,
    hy: 0,
    ear: 0,
    ef: 0,
    eT: 1,
    tail: 0,
    br: 0,
    lg: 0,
    lT: 3,
    hyT: 0,
    hpT: 0,
    nT: 2,
    on: false,
    k: 1,
  }));
  // ── fable32 (build 33) ── the lamb chamber's stalls (its run only): his lambs with their tags from the first stall, the court's — plain —
  // from the last (lamb33's stalls33), each breathing and turning its head like the pen's; his new lamb, led in, joins them ── /fable32 ──
  const stockSt = CH0
    ? Array.from({ length: L33.stalls }, (_, i) => ({ x: 0, z: 0, yaw: Math.PI / 2, s: 0.78, sd: i + 2, v: 0, ph: i, wk: 0, hp: 0, hy: 0, ear: 0, ef: 0, eT: 1 + i * 0.37, tail: 0, br: 0, lg: 0, lT: 2 + i * 0.61, hyT: 0, hpT: 0, nT: 1 + i * 0.29, on: false, k: 1, tag: null }))
    : [];
  let inStall = false;
  function stock33(dt, t) {
    const C = CH();
    if (!C) return 0;
    const tags = Array.isArray(C.tags) ? C.tags.slice() : [];
    if (C.out === 'tamim' && inStall && Number.isFinite(C.next)) tags.push(C.next);
    const mine = Math.min(tags.length, L33.stalls),
      court = Math.max(0, L33.six - mine),
      S = stalls33(mine, court),
      list = [...S.mine.map((p, i) => [p, tags[i]]), ...S.court.map((p) => [p, null])];
    list.forEach(([p, c], i) => {
      const a = stockSt[i];
      if (!a.on) Object.assign(a, { x: p.x, z: p.z, yaw: Math.PI / 2 + ((i * 0.83) % 1 - 0.5) * 0.9 });
      Object.assign(a, { on: true, tag: c });
      animate(a, dt, t, null);
    });
    for (let i = list.length; i < stockSt.length; i++) stockSt[i].on = false;
    return list.length;
  }
  function animate(a, dt, t, look) {
    const ease = (k) => Math.min(1, dt * k),
      rnd2 = Math.random;
    a.br = Math.sin(t * 2.2 + a.sd * 1.3);
    if ((a.nT -= dt) <= 0) {
      a.nT = 1.5 + rnd2() * 2.5;
      a.hpT = (rnd2() - 0.4) * 0.22;
      a.hyT = (rnd2() - 0.5) * 0.5;
    }
    a.hy += ((look ?? a.hyT) - a.hy) * ease(3);
    a.hp += ((look != null ? 0.05 : a.hpT) - a.hp) * ease(2.5);
    if ((a.eT -= dt) <= 0) {
      a.eT = 1.6 + rnd2() * 2.8;
      a.ef = 0.32;
    }
    a.ef = Math.max(0, a.ef - dt);
    a.ear = 0.28 * Math.sin((a.ef / 0.32) * Math.PI);
    a.tail = 0.18 * Math.sin(t * 5.5) * Math.max(0, Math.sin(t * 0.7));
    if (a.v > 0.05) {
      a.wk += (1 - a.wk) * ease(6);
      a.ph += ((a.v * dt) / a.s) * Math.PI;
    } else {
      if ((a.lT -= dt) <= 0) {
        a.lT = 3 + rnd2() * 4;
        a.lg = 0.6;
      }
      a.lg = Math.max(0, a.lg - dt);
      a.wk += ((a.lg > 0 ? 0.12 : 0) - a.wk) * ease(5);
      if (a.lg > 0) a.ph += dt * 4;
    }
  }
  let write = (i, a) => {
      pose4[0] = a.ph;
      pose4[1] = a.wk;
      pose4[2] = a.hp;
      pose4[3] = a.hy;
      anim4[0] = a.tail;
      anim4[1] = a.ear;
      anim4[2] = a.br;
      rigWrite(lambs, i, a.x, 16 + Math.abs(Math.sin(a.ph)) * 0.05 * a.wk * a.s, a.z, a.yaw, a.s * a.k, white, pose4, anim4, vis4, null);
    },
    walkTo = (a, x, z, v, dt) => {
      const dx = x - a.x,
        dz = z - a.z,
        d = Math.hypot(dx, dz);
      if (d < 0.05) {
        a.v = 0;
        return true;
      }
      const step = Math.min(d, v * dt);
      a.x += (dx / d) * step;
      a.z += (dz / d) * step;
      a.v = v;
      let turn = Math.atan2(dx, dz) - a.yaw;
      turn = Math.atan2(Math.sin(turn), Math.cos(turn));
      a.yaw += turn * Math.min(1, dt * 8);
      return false;
    },
    lambAt = (a) => ({ x: a.x, y: 16, z: a.z, yaw: a.yaw, s: a.s }),
    v1 = new THREE.Vector3(),
    v2 = new THREE.Vector3(),
    v3 = new THREE.Vector3(),
    tip = { x: 0, y: 0, z: 0, on: false },
    hp = { x: 0, y: 16, z: 0, yaw: 0 },
    bar = { v: 0, goal: 0 },
    fov0 = null,
    lastPh = '',
    phAt = 0,
    on = false,
    crackT = 0,
    bleatT = 4,
    hoofT = 0,
    hoofN = 0,
    zi = -1,
    leadAt = -1,
    npcLeadAt = -1,
    npcWas = false,
    lastFocus = -1,
    darkKey = '',
    setOn = (active) => {
      if (on !== active) {
        on = active;
        doc.body.classList.toggle('p25-on', active);
        try {
          const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
            twin = mods && mods.twin;
          if (twin && twin.noStick) twin.noStick(active || globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
    };
  function screenToDoor(sx, sy, out) {
    const camera = cam();
    if (!camera) return false;
    v1.set((sx / W()) * 2 - 1, 1 - (sy / H()) * 2, 0.5).unproject(camera);
    v2.copy(camera.position);
    v1.sub(v2).normalize();
    camera.getWorldDirection(v3);
    v3.y = 0;
    v3.normalize();
    const door = PL().door,
      dot = v1.x * v3.x + v1.z * v3.z;
    if (Math.abs(dot) < 1e-4) return false;
    const k = ((door.x - v2.x) * v3.x + (door.z - v2.z) * v3.z) / dot;
    out.x = v2.x + v1.x * k - v3.x * 0.3;
    out.y = v2.y + v1.y * k;
    out.z = v2.z + v1.z * k - v3.z * 0.3;
    return true;
  }
  let toCam = (x, z) => {
      const camera = cam();
      v3.set(camera.position.x - x, 0, camera.position.z - z).normalize();
      return v3;
    },
    nearHead = () => {
      let best = -1,
        bd = 1e9;
      beam.regs.forEach((r, i) => {
        if (r) {
          const d = Math.hypot(r[0] - beam.x, r[1] - beam.y);
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
      });
      return best >= 0 && best < 4;
    },
    offTick = onTick((tt, dt) => {
      const st = E.st33;
      if (!st) return;
      if (st.paused) dt = 0;
      try {
        T.stages.heroXYZ(hp);
      } catch (e) {}
      const K = E.p25(),
        ph = K ? K.ph : '',
        t = now(),
        live = st.phase === 'run' && !st.summary && !st.night,
        w = W(),
        h = H(),
        m = Math.min(w, h),
        door = PL().door,   // ── fable32 (build 33) ── ── /fable32 ──
        a0 = lambSt[0],
        a1 = lambSt[1];
      if (ph !== lastPh) {
        lastPh = ph;
        phAt = t;
      }
      const since = t - phAt,
        close = is(/^(zoom|dirt|clean|blem)$/, ph),
        focus = K && close && K.zi >= 0 ? K.zi : -1;
      zi = focus;
      if (K && shownL !== K.L) setLamb(K.L);
      if (!K && shownL && leadAt < 0) setLamb(null);
      a0.on = false;
      stamp.visible = false;
      if (K) {
        a0.on = ph !== 'wait' && ph !== 'out';   // ── fable32 (build 33) ── (out: the chamber's בעל מום, gone) ── /fable32 ──
        a0.k = 1;
        a0.tag = K.mine ? K.mine.c : null;   // ── fable32 (build 33) ── (his lamb from the chamber: its tag) ── /fable32 ──
        if (is(/^(in|scan|zoom|dirt|clean|blem|ok)$/, ph)) {
          if (ph === 'in' || since < 0.05) Object.assign(a0, { x: door.x, z: door.z, yaw: door.yaw });
          a0.v = 0;
        } else if (ph === 'aside') {
          walkTo(a0, PL().side.x, PL().side.z, 3.4, dt);
          a0.k = clamp01((P25.aside - since) / 0.3);
        } else if (ph === 'bring') {
          if (since < 0.05) Object.assign(a0, { x: PL().side.x, z: PL().side.z, yaw: -Math.PI / 2 });
          if (walkTo(a0, door.x, door.z, 4.2, dt)) a0.yaw += (door.yaw - a0.yaw) * Math.min(1, dt * 8);
          a0.k = clamp01(since / 0.25);
        } else if (ph === 'false') {
          if (since > 0.6 && since < 1.5) walkTo(a0, door.x - 1.6, door.z, 2.2, dt);
          else if (since > 1.9) walkTo(a0, PL().side.x, PL().side.z, 3.2, dt);
          else a0.v = 0;
          if (since > 2.8) a0.k = clamp01((P25.fals - since) / 0.4);
        } else if (ph !== 'wait' && ph !== 'out' && leadAt < 0) {
          leadAt = t;
          a0.via = !!PL().via;   // ── fable32 (build 33) ── (the chamber: through its door, then to the stall) ── /fable32 ──
        }
        if (leadAt < 0) animate(a0, dt, t, focus >= 0 && K.L.spots[focus].r < 4 ? P25.hy : ph === 'scan' && nearHead() ? P25.hy : null);
      }
      if (leadAt >= 0) {
        a0.on = true;
        a0.k = clamp01((14 - (t - leadAt)) / 0.6);
        const R = PL();
        if (a0.via && R.via) {
          if (walkTo(a0, R.via.x, R.via.z, 2.2, dt)) a0.via = false;
        } else if (walkTo(a0, R.rings.x, R.rings.z, 2.2, dt) || t - leadAt > 14) {
          leadAt = -1;
          a0.on = false;
          a0.tag = null;
          if (CH0) inStall = true;   // ── fable32 (build 33) ── (in its stall: the stock draws it now) ── /fable32 ──
          setLamb(null);
        }
        if (t - leadAt > 14 && leadAt >= 0) a0.via = false;
        animate(a0, dt, t, null);
      }
      const npc = live && E.npc25(),
        npcHold = npc && !!(E.gate23() || E.gate21() || E.gate22());
      if (npc && npcWas && !npcHold) npcLeadAt = t;
      npcWas = npcHold;
      a1.on = false;
      if (npc && npcHold) {
        Object.assign(a1, { on: true, k: 1, x: door.x, z: door.z, yaw: door.yaw, v: 0 });
        animate(a1, dt, t, Math.sin(t * 0.4) > 0.3 ? P25.hy : null);
      } else if (npcLeadAt >= 0) {
        a1.on = true;
        a1.k = clamp01((12 - (t - npcLeadAt)) / 0.6);
        if (walkTo(a1, PL().rings.x, PL().rings.z, 2.2, dt) || t - npcLeadAt > 12) npcLeadAt = -1;
        animate(a1, dt, t, null);
      } else Object.assign(a1, { x: door.x, z: door.z, yaw: door.yaw });
      let n = 0;
      if (a0.on && a0.k > 0.01) write(n++, a0);
      if (a1.on && a1.k > 0.01) write(n++, a1);
      if (CH0) {   // ── fable32 (build 33) ── the chamber's stock ── /fable32 ──
        const m = stock33(dt, t);
        for (let i = 0; i < m; i++) write(n++, stockSt[i]);
      }
      rigEnd(lambs, n);
      if (((a0.on && a0.v > 0.05) || (a1.on && a1.v > 0.05 && Math.hypot(a1.x - hp.x, a1.z - hp.z) < 25)) && (hoofT -= dt) <= 0) {
        hoofT = 0.24;
        snd('hoof25', { n: hoofN++ });
      }
      if (K && (crackT -= dt) <= 0) {
        crackT = 0.35 + Math.random() * 0.5;
        snd('torch25');
      }
      if ((K || (npcHold && Math.hypot(door.x - hp.x, door.z - hp.z) < 20)) && (bleatT -= dt) <= 0) {
        bleatT = 5 + Math.random() * 4;
        snd('bleat25', { hi: Math.random() < 0.5 });
      }
      const hud = !!K && !is(/^(lead|end|out)$/, ph),
        padOn = is(/^(scan|dirt|blem|wait)$/, ph),
        looking = is(/^(scan|zoom|dirt|clean|blem)$/, ph),
        stamps = hud && ph !== 'wait' && ph !== 'ok';
      setOn(!!K);
      if (pad.classList.contains('on') !== padOn) {
        pad.classList.toggle('on', padOn);
        if (!padOn) touches.clear();
      }
      for (const [btn, off] of [
        [tamimBtn, !looking],
        [pasulBtn, !looking || (K && K.rej >= P25.rej)],
      ]) {
        btn.classList.toggle('on', stamps);
        btn.classList.toggle('off', !!off);
      }
      bringBtn.classList.toggle('on', ph === 'wait');
      dawnClock.classList.toggle('on', hud);
      if (K) {
        const k = clamp01(K.own / P25.dawn);
        dawnBar.style.height = `${(k * 100) | 0}%`;
      }
      const La = lambAt(a0),
        rr = m * (K && K.first ? 0.19 : 0.13),
        scr = [];
      beam.regs = [];
      if (K) {
        for (let i = 0; i < 8; i++) {
          const w = at25(i, La, a0.hy, a0.hp),
            q = proj(w.x, w.y, w.z);
          beam.regs.push(q ? [q.x, q.y] : null);
        }
        const pts = beam.regs.filter(Boolean),
          xs = pts.map((c) => c[0]),
          ys = pts.map((c) => c[1]);
        if (pts.length) beam.box = [Math.min(...xs) - 40, Math.min(...ys) - 40, Math.max(...xs) + 40, Math.max(...ys) + 40];
        if (!Number.isFinite(beam.x) || ph === 'in' || ph === 'bring') {
          const c = beam.regs[6] || [w / 2, h / 2];
          beam.x = c[0];
          beam.y = c[1] + 20;
        }
        clampBeam();
      } else beam.x = beam.y = NaN;
      let best = -1,
        bd = rr,
        hit = null;
      for (const s of spots) {
        const w = (s.q = at25(s.s.r, La, a0.hy, a0.hp)),
          q = (scr[s.s.i] = proj(w.x, w.y, w.z));
        if (ph === 'scan' && q && !s.s.gone) {
          const d = Math.hypot(q.x - beam.x, q.y - beam.y);
          if (d < bd) {
            bd = d;
            best = s.s.i;
            hit = q;
          }
        }
      }
      if (ph === 'scan') {
        E.p25focus(best);
        if (best >= 0 && best !== lastFocus) {
          snd('near17');
          buzz(14);
        }
      }
      lastFocus = ph === 'scan' ? best : -1;
      focusRing.classList.toggle('on', !!hit);
      if (hit) {
        const r = Math.round(rr * 0.62);
        focusRing.style.width = focusRing.style.height = `${r * 2}px`;
        focusRing.style.transform = `translate(${(hit.x - r - 3) | 0}px,${(hit.y - r - 3) | 0}px)`;
      }
      let bx = beam.x,
        by = beam.y,
        br = m * 0.28,
        fs = focus >= 0 && scr[focus];
      if (fs) {
        bx = fs.x;
        by = fs.y;
        br = m * 0.45;
      } else if (!close && ph !== 'scan') {
        const q = proj(a0.x, 16.9, a0.z);
        if (q) {
          bx = q.x;
          by = q.y;
        }
      }
      dark.classList.toggle('on', hud);
      if (hud && Number.isFinite(bx)) {
        const lit = dayLit(),
          key = `${bx | 0},${by | 0},${br | 0},${lit}`;
        if (key !== darkKey) {
          darkKey = key;
          // ── fable32 (build 33) ── (the chamber by day: no torch — a light dusk round the look, the same mechanic) ── /fable32 ──
          dark.style.background = lit
            ? `radial-gradient(circle at ${bx | 0}px ${by | 0}px,rgba(255,250,235,0) 0,rgba(255,250,235,0) ${(br * 0.55) | 0}px,rgba(20,16,10,.38) ${br | 0}px)`
            : `radial-gradient(circle at ${bx | 0}px ${by | 0}px,rgba(255,196,120,.07) 0,rgba(255,170,90,.03) ${(br * 0.5) | 0}px,rgba(5,4,9,.8) ${br | 0}px)`;
        }
      }
      const camera = cam();
      if (camera) {
        if (focus >= 0 && fov0 == null) fov0 = camera.fov;
        if (fov0 != null) {
          camera.fov += ((focus >= 0 ? ZOOM_FOV : fov0) - camera.fov) * Math.min(1, dt * 9);
          if (focus < 0 && Math.abs(camera.fov - fov0) < 0.05) {
            camera.fov = fov0;
            fov0 = null;
          }
          camera.updateProjectionMatrix();
        }
      }
      tip.on = false;
      if (K && camera && !is(/^(lead|end|ok|wait|false)$/, ph)) {
        if (focus >= 0 && spots[focus]) {
          const w = spots[focus].q,
            v = toCam(w.x, w.z);
          tip.x = w.x + w.nx * 0.4 + v.x * 0.3;
          tip.y = w.y + 0.15 + w.ny * 0.3;
          tip.z = w.z + w.nz * 0.4 + v.z * 0.3;
          tip.on = true;
        } else if (Number.isFinite(bx) && screenToDoor(bx, by, tip)) {
          const v = toCam(tip.x, tip.z);
          tip.x += v.x * 0.5;
          tip.y += 0.18;
          tip.z += v.z * 0.5;
          tip.on = true;
        }
      }
      for (const s of spots) {
        s.o = s.s.gone ? Math.max(0, s.o - dt / 0.4) : 1;
        s.m.visible = a0.on && a0.k > 0.5 && s.o > 0.01 && ph !== 'wait';
        if (!s.m.visible || !camera) continue;
        const w = s.q,
          on2 = s.s.i === focus;
        s.m.quaternion.copy(camera.quaternion);
        v1.set(camera.position.x - w.x, camera.position.y - w.y, camera.position.z - w.z).normalize();
        s.m.position.set(w.x + w.nx * 0.03 + v1.x * 0.06, w.y + w.ny * 0.03 + v1.y * 0.06, w.z + w.nz * 0.03 + v1.z * 0.06);
        s.m.scale.setScalar(s.k * a0.s * (on2 ? 1.6 : 1));
        s.m.material.opacity = s.o;
        s.m.material.emissiveIntensity = on2 ? 0.5 : 0;
      }
      bar.goal = (K && is(/^(ok|lead|end)$/, ph)) || leadAt >= 0 || (ph === 'false' && since < 1.9) || npcLeadAt >= 0 ? 1 : 0;
      if ((K && (ph === 'ok' || ph === 'false')) || leadAt >= 0) {
        const w = at25(6, La);
        stamp.visible = a0.on && a0.k > 0.3 && !!camera;
        if (camera) {
          stamp.quaternion.copy(camera.quaternion);
          v1.set(camera.position.x - w.x, camera.position.y - w.y, camera.position.z - w.z).normalize();
          stamp.position.set(w.x + v1.x * 0.12, w.y + 0.1 + v1.y * 0.12, w.z + v1.z * 0.12);
        }
        const u = leadAt < 0 ? Math.min(1, since / 0.18) : 1;
        stamp.scale.setScalar(0.6 * a0.s * (1.8 - 0.8 * u));
      }
      const spot = focus >= 0 ? K.L.spots[focus] : null;
      // ── fable32 (build 30) ── (the hint card — "אגודל ימין מזיז את האבוקה", the bring, the blemish's rule — and the spot's line under it
      // are the step card's one line now: "האירו ומצאו כתם", "בוץ — החליקו להבריש", "יבלת · אוזן ימין"; their sources — SAY — at the end) ── /fable32 ──
      setText(hint, '');
      setText(blemLine, '');
      void spot;
      const Hr = dayLit() ? null : hero();   // ── fable32 (build 33) ── (by day no torch in his hand) ── /fable32 ──
      if (Hr) {
        const fx = Math.sin(hp.yaw),
          fz = Math.cos(hp.yaw);
        Hr.hold21(
          K && is(/^(ok|lead|end|false|aside|wait|bring)$/, ph)
            ? { x: hp.x + fx * 0.35 - fz * 0.45, y: (hp.y || 16) + 2.55, z: hp.z + fz * 0.35 + fx * 0.45 }
            : null,
        );
      }
    }),
    lit = false,
    // ── fable32 (build 33) ── a lamb's tag (המחשה: the game's mark of HIS lamb — a colour, never a name): a band round the neck, a disc
    // hanging at its front (the head's pivot: day33's HEAD25 — the neck a little behind and below it) ── /fable32 ──
    tag33 = (k, a, col) => {
      if (!col) return;
      const s = a.s * a.k,
        L = { x: a.x, y: 16 + Math.abs(Math.sin(a.ph || 0)) * 0.05 * (a.wk || 0) * (a.s || 1), z: a.z, yaw: a.yaw, s },
        f = Math.sin(a.yaw),
        g = Math.cos(a.yaw);
      // (an ear tag on each ear — the pen's own places on the lamb, at25 with its head's turn — and a band low on the neck)
      for (const r of [0, 1]) {
        const e = at25(r, L, a.hy || 0, a.hp || 0);
        k.ws(e.x + e.nx * 0.08 * s, e.y - 0.07 * s, e.z + e.nz * 0.08 * s, 0.11 * s, 0.14 * s, 0.11 * s, '!' + col);
      }
      k.ws(L.x + f * 0.62 * s, L.y + 1.12 * s, L.z + g * 0.62 * s, 0.34 * s, 0.1 * s, 0.34 * s, col);
    },
    flame = (k, x, y, z, s, t) => {
      const fl = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.1);
      for (const [r, h, dy, color] of [
        [0.09, 0.15, 0.05, '!#FF9A3A'],
        [0.06, 0.11, 0.08, '!#FFD27A'],
        [0.035, 0.06, 0.04, '!#FFF6D8'],
      ])
        k.ws(x, y + dy * s, z, r * s, h * s * fl, r * s, color);
    },
    torchAt = (k, x0, y0, z0, x1, y1, z1, s, t) => {
      for (let i = 0; i <= 16; i++) {
        const u = i / 16;
        k.ws(lerp(x0, x1, u), lerp(y0, y1, u), lerp(z0, z1, u), 0.036, 0.036, 0.036, '#5A4430');
      }
      k.ws(x1, y1, z1, 0.06, 0.07, 0.06, '#3A2A1A');
      flame(k, x1, y1 + 0.06, z1, s, t);
      return { x: x1, y: y1 + 0.06, z: z1 };
    },
    offDraw = addDrawer(
      null,
      (k, tt, dt) => {
        const st = E.st33;
        if (!st) return;
        const p = E.p25(),
          ph = p ? p.ph : '',
          door = PL().door;   // ── fable32 (build 33) ── ── /fable32 ──
        if (st.paused) dt = 0;
        let flameAt = null;
        if (dayLit()) flameAt = null;   // ── fable32 (build 33) ── (the chamber by day: no torch, no torch's light) ── /fable32 ──
        else if (tip.on && zi >= 0) flameAt = tip;
        else if (tip.on) {
          const v = toCam(tip.x, tip.z);
          flameAt = torchAt(k, tip.x + v.x * 0.6 + v.z * 0.55, tip.y - 0.6, tip.z + v.z * 0.6 - v.x * 0.55, tip.x, tip.y - 0.06, tip.z, 1, tt);
        } else if (p && is(/^(ok|lead|end|false|aside|wait|bring)$/, ph)) {
          const Hr = hero(),
            hand = Hr && (Hr.at('handslotr') || Hr.at('handr'));
          if (hand) flameAt = torchAt(k, hand.x, hand.y - 0.15, hand.z, hand.x, hand.y + 0.85, hand.z, 1.3, tt);
        }
        if (flameAt && k.light) {
          const lt = k.light,
            zoomed = zi >= 0;
          lt.color.set(TORCH_COLOR);
          lt.position.set(flameAt.x, flameAt.y + 0.05, flameAt.z);
          lt.distance = zoomed ? 2.6 : 3;
          lt.decay = 1.6;
          lt.intensity = (zoomed ? 1.8 : 1.2) * (0.9 + 0.1 * Math.sin(tt * 17) * Math.sin(tt * 5.3));
          lit = true;
        } else if (lit && k.light) {
          k.light.color.set('#FFC27A');
          lit = false;
        }
        const gx = door.x - 1.35;
        bar.v += (bar.goal - bar.v) * Math.min(1, dt * 5);
        if (p || leadAt >= 0 || E.npc25()) {
          for (const dz of [-0.75, 0.75]) k.wc(gx, 16.55, door.z + dz, 0.06, 1.1, '#7A5A3A');
          k.wb(gx, 16.62 + bar.v * 0.4, door.z, 1.6 * (1 - bar.v * 0.3), 0.08, 0.09, '#9A7448', { yaw: Math.PI / 2, pitch: bar.v * 1.1 });
        }
        const a0 = lambSt[0],
          a1 = lambSt[1],
          leader = (a) => {
            const sn = Math.sin(a.yaw),
              cs = Math.cos(a.yaw);
            man(k, L(a.x + sn * 1.4), L(a.z + cs * 1.4), L(16), { robe: ROBE.kohen, skin: SKIN[1], yaw: Math.atan2(cs, sn), pose: 'walk', t: tt });
          };
        if (leadAt >= 0 && a0.on && a0.v > 0.05) leader(a0);
        if (a1.on)
          if (npcLeadAt < 0) {
            const x = PL().stand.x + 1.2,
              z = PL().stand.z - 1.1,
              fig = man(k, L(x), L(z), L(16), {
                robe: ROBE.kohen,
                skin: SKIN[0],
                yaw: Math.atan2(door.z - z, door.x - x),
                pose: 'torch',
                u: 1,
                t: tt,
              });
            if (fig && fig.R) {
              const inv = 1 / L(1);
              flame(k, fig.R[0] * inv, fig.R[2] * inv + 0.45, fig.R[1] * inv, 1.4, tt);
            }
          } else if (a1.v > 0.05) leader(a1);
        // ── fable32 (build 33) ── the tags: his lamb from the chamber at the pen (a0), today's lamb at the pen's door with the court's kohen
        // (a1: E.tl33tag), the chamber's stock (his from the first stall) — a coloured band on the neck and a disc under it ── /fable32 ──
        if (a0.on && a0.k > 0.3) tag33(k, a0, tagCol(a0.tag));
        if (a1.on && a1.k > 0.3 && E.tl33tag) tag33(k, a1, tagCol(E.tl33tag()));
        for (const a of stockSt) if (a.on && a.tag != null) tag33(k, a, tagCol(a.tag));
      },
      4,
    ),
    offEv = E.on17((ev) => {
      const type = ev.type,
        ph = ev.ph;
      if (type === 'p25') {
        if (ph === 'in') {
          snd('ui');
          bleatT = 0.6;
          beam.x = NaN;
        } else if (ph === 'zoom') {
          snd('whoosh');
          buzz(20);
        } else if (ph === 'blem') {
          snd('warn17');
          buzz([40, 30, 40]);
        } else if (ph === 'dirt') snd('soft');
        else if (ph === 'bring') snd('bleat25');
      } else if (type === 'p25swipe')
        if (ev.ok) {
          snd('whoosh');
          buzz(30);
        } else {
          snd('soft');
          flash(ev.why === 'short' ? 'ארוך יותר ↔' : ev.why === 'slow' ? 'מהר יותר ↔' : 'לרוחב ↔');
        }
      else if (type === 'p25stamp') {
        snd('stamp25', { ok: ev.v === 'tamim', no: ev.v === 'pasul' });
        buzz(45);
        if (ev.v === 'pasul') {
          snd('bleat25');
          flash(ev.ok ? 'פסול — יפה ראיתם' : ev.ch33 ? (ev.why === 'dirt' ? LINE33.dirt : LINE33.whole) /* ── fable32 (build 33) ── (the chamber: the lamb stays — look again) ── /fable32 ── */ : ev.why === 'dirt' ? 'זה היה לכלוך — לא מום' : 'הטלה היה תמים');
        } else if (ev.ok) snd('bell25');
        else {
          snd('late17');
          buzz([60, 40, 90]);
          const blem = ev.blem;
          // ── fable32 (build 30) ── (the "עיכוב!" banner is the step card's line for the delay: "עיכוב — יש בו מום"; which blemish, a word) ── /fable32 ──
          if (!(E.say30 && E.say30(`${ev.ch33 ? LINE33.false /* ── fable32 (build 33) ── (the chamber: no delay — the blemish shown) ── /fable32 ── */ : 'עיכוב'} — ${BLEM25.cats[blem.c].he.split(' / ')[0]} · ${BLEM25.regs[blem.r].he}`, 'no', P25.fals - 0.4)))
            setTimeout(() => pop(bigNote, `<b>עיכוב!</b><small>אישור שגוי — בטלה יש מום: ${BLEM25.cats[blem.c].he} · ${BLEM25.regs[blem.r].he}. בדקו טלה חלופי · המחשה</small>`), 900);
        }
      } else if (type === 'p25no') {
        snd('soft');
        flash('שני טלאים נפסלו — בדקו ואשרו');
      }   // ── fable32 (build 30) ── (p25done: "תמים לקרבן +N ★ · coins" is the step card's rating now, end30 its source) ── /fable32 ──
    }),
    api = {
      destroy() {
        offTick();
        offDraw();
        offEv();
        setOn(false);
        setLamb(null);
        try {
          hero().hold21(null);
        } catch (e) {}
        if (scene) scene.remove(lambs, stamp);
        if (CH0) chamberLambs(L33.six);   // ── fable32 (build 33) ── ── /fable32 ──
        for (const el of [dark, pad, focusRing, tamimBtn, pasulBtn, bringBtn, dawnClock, hint, blemLine, bigNote, flashEl]) el.remove();
        if (globalThis.__P25 === api) delete globalThis.__P25;
      },
      state: () => ({
        ph: (E.p25() || {}).ph,
        beam: Number.isFinite(beam.x) ? [beam.x | 0, beam.y | 0] : null,
        regs: beam.regs,
        spots: spots.map((s) => {
          const i = s.q && proj(s.q.x, s.q.y, s.q.z);
          return { i: s.s.i, r: s.s.r, gone: s.s.gone, at: i ? [i.x | 0, i.y | 0] : null };
        }),
        focus: lastFocus,
        light: tip.on,
      }),
    };
  globalThis.__P25 = api;
  return api;
}
const SAY = {
  pen: '"מערבית דרומית, היא היתה לשכת טלאי קרבן" — מדות א, ו · טיוטה · המחשה: מקום הדיר במשחק',
  bring: '"צאו והביאו טלה מלשכת הטלאים" — תמיד ג, ג · טיוטה',
  scan: '"בודקין אותו לאור האבוקות" — תמיד ג, ד · טיוטה',
  blem: '"כל מום משלשה ושבעים מום המנויין בבהמה פוסלין אותה מן הקרבן" — רמב״ם, איסורי מזבח ב, י · טיוטה',
  ill: '6 סוגים × 8 מקומות — המחשה של המשחק, לא רשימה הלכתית',
};
reg30('lamb', { chip: SAY.scan, all: [SAY.bring, SAY.pen, SAY.scan, SAY.blem, SAY.ill] });   // ── fable32 (build 30) ── (the pen's lines at its end) ── /fable32 ──
const AIM_K = 1.6;
const TORCH_COLOR = '#FFB066';
const ZOOM_FOV = 20;
const CSS = `.p25{position:fixed;z-index:32;direction:rtl;text-align:center;font:900 16px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA;pointer-events:none;display:none}.p25.on{display:block}.p25 small{display:block;font-size:11px;font-weight:700;opacity:.85}
.p25-dk{display:block;inset:0;z-index:28;opacity:0;transition:opacity .5s}.p25-dk.on{opacity:1}.p25-in{top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;pointer-events:auto}
.p25-fr{left:0;top:0;z-index:30;border-radius:50%;border:3px solid #FFE08A;box-shadow:0 0 14px 4px #FFD66E99;animation:p25r 1s infinite alternate}
.p25-s{bottom:calc(env(safe-area-inset-bottom,0px) + 12px);width:92px;height:92px;border-radius:50%;z-index:33;font-size:26px;line-height:1;pointer-events:auto;box-shadow:0 6px 16px #000A}.p25-s.on{display:flex;flex-direction:column;align-items:center;justify-content:center}.p25-s.dn{scale:.9}.p25-s.off{opacity:.4}
.p25-t{right:14px;background:radial-gradient(circle at 40% 35%,#FFF0B8,#D9A441 55%,#8A5A1E);border:4px solid #F6D48A;color:#4A2E08}.p25-p{right:118px;background:radial-gradient(circle at 40% 35%,#8A6A4A,#4A3424 60%,#2A1C12);border:4px solid #A87A4A;color:#F2DEC0}
.p25-b{right:14px;bottom:116px;z-index:33;min-height:64px;min-width:196px;border-radius:18px;border:3px solid #E2B65A;background:#2A1C10E8;color:#FFE6A0;font-size:19px;pointer-events:auto}
.p25-w{left:10px;top:62px;width:58px;font-size:11px;color:#FFE6A0}.p25-w i{display:block;position:relative;height:84px;border-radius:29px 29px 4px 4px;border:5px solid #6A5A44;background:#121630;overflow:hidden}.p25-w b{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(to top,#FFC861,#FF9A4A 35%,#9A6AA0 75%,#121630)}
.p25-h,.p25-z,.p25-x,.p25-f{left:50%;transform:translateX(-50%)}.p25-h{top:58px;padding:4px 12px;border-radius:12px;background:#1C140ACC;font-size:13px;max-width:70vw}.p25-z{top:108px;padding:6px 16px;border-radius:14px;background:#1C140AE6;border:2px solid #E2B65A;font-size:19px;max-width:70vw}
.p25-x{top:34%;z-index:37;white-space:nowrap;text-shadow:0 2px 3px #000}.p25-x b{display:block;font-size:44px;color:#FFD66E}.p25-f{top:62%;z-index:34;font-size:19px;color:#FFD08A;white-space:nowrap;text-shadow:0 2px 3px #000}
.p25-x.on,.p25-f.on{animation:p25w 2s forwards}@keyframes p25w{0%{opacity:0}12%,80%{opacity:1}to{opacity:0}}@keyframes p25r{to{scale:1.12}}body.p25-on .gm .tw-pad,body.p25-on .f17-bar{opacity:0!important;pointer-events:none!important}`;
