/* ── fable32 (build 22) ── ── recovered (build 22) ── maaracha22.js — סידור המערכה, the great pyre (תמיד ב, ג–ד), in the world:
 *   the sorting — in the wood chamber each log is shown before him (its kind painted: fig, walnut, pine — kasher; olive, vine, wormy —
 *   "כל העצים כשרים למערכה חוץ משל זית ושל גפן"): a swipe right takes it, left puts it back; a wrong take is a warning or points;
 *   the stacking — on the altar's top, six logs in three layers (two thick for the base, their heads to the תפוח; two medium across;
 *   two thin in the middle — the אליתא), the left stick moves the log along its row, a tap lays it; the air between the logs ("ורוח
 *   היה בין הגזרין") on the gauge — too tight, too wide, or right (E.band22());
 *   the lighting — a tap where the gap is, the torch, the fire catching layer by layer, the smoke; "המערכה הגדולה נבנתה כהלכה!".
 * Under the lot of build 23 its short form (P23.budget, LAYERS23) and, when another kohen has the role, the logs laid by him (E.npc23()).
 * The engine is day33.js (E.m22(): in → sort → sorted → carry → stack → ready → ignite → end; m22swipe, m22put, m22stick; band22).
 *   createMaaracha22({ E, sfx, doc, view, twin }) → { destroy(), state(), at(i), row(ly, x), rowS }      (focus17.js makes it when E.g22; __M22)
 * The bundle kept no comment and no local name: the names are the recovery's. Never a Divine Name. */
import * as THREE from 'three';
import { addDrawer, onTick } from './draw.js';
import { M22, P23, SWIPE36, swipe51 } from './day33.js';
import { reg30, draft30 } from './rate30.js';
import { createBag48 } from '../../game/fam42.js';   // ── build 51 ── (the defect pool's shuffle-bag of build 48: the worm's look varies, never twice in a row) ── /build 51 ──
import { createTouch40 } from './touch40.js';   // ── fable32 (build 40) ── touch the thing itself ── /fable32 ──   // ── fable32 (build 30) ── ── /fable32 ──
export function createMaaracha22(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null;
  if (!doc || !E || !E.on17 || !E.g22) return { destroy() {}, state: () => ({}) };
  const T = globalThis.__T,
    scene = T && T.scene,
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
      const H = globalThis.__HERO35;
      return H && H.loaded ? H : null;
    },
    now = () => performance.now() / 1e3,
    clamp = (v, a, b) => (v < a ? a : v > b ? b : v),
    proj = (x, y, z) => {
      try {
        const p = view && view.project(x, y, z);
        return p && p.on !== false ? { x: p.x, y: p.y } : null;
      } catch (e) {
        return null;
      }
    },
    fireSmoke = (f, s) => {
      try {
        const av = T.avodah;
        av.fire(f);
        av.smoke(s);
      } catch (e) {}
    };
  if (!doc.getElementById('m22-css')) {
    const css = doc.createElement('style');
    css.id = 'm22-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  let mk = (cls, html, tag = 'div') => {
      const el = doc.createElement(tag);
      el.className = cls;
      if (html != null) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    seed = 11,
    rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647,
    paintTex = (w, h, paint) => {
      const cv = doc.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const g = cv.getContext('2d');
      paint(g);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      return tex;
    },
    base = (g, color) => {
      g.fillStyle = color;
      g.fillRect(0, 0, 64, 128);
    },
    blob = (g, color, x, y, rx, ry) => {
      g.fillStyle = color;
      g.beginPath();
      g.ellipse(x, y, rx, ry, 0, 0, 6.3);
      g.fill();
    },
    strokes = (g, n, color, width, path) => {
      g.strokeStyle = color;
      g.lineWidth = width;
      for (let i = 0; i < n; i++) {
        g.beginPath();
        path(g, i);
        g.stroke();
      }
    },
    PAINT = {
      fig: (g) => {
        base(g, '#A39E93');
        g.globalAlpha = 0.45;
        for (let i = 0; i < 70; i++) blob(g, i < 40 ? '#B9B4A8' : '#8C877C', rnd() * 64, rnd() * 128, 4 + rnd() * 4, 5 + rnd() * 5);
        g.globalAlpha = 1;
        g.fillStyle = '#6E6A60';
        for (let i = 0; i < 50; i++) g.fillRect(rnd() * 64, rnd() * 128, 3 + rnd() * 3, 1);
      },
      walnut: (g) => {
        base(g, '#5A4A3C');
        for (const [color, width, off] of [
          ['#2A2018', 2.6, 0],
          ['#7A6A58', 1, 3.5],
        ])
          strokes(g, 9, color, width, (g2, i) => {
            const x = i * 7.1 + off;
            g2.moveTo(x, 0);
            for (let y = 0; y <= 128; y += 8) g2.lineTo(x + 3 * Math.sin(y * 0.12 + i * 1.7 + off), y);
          });
      },
      pine: (g) => {
        base(g, '#3A1E10');
        for (let y = 0; y < 128; y += 11)
          for (let x = ((y / 11) % 2) * 7; x < 64; x += 14) {
            g.fillStyle = rnd() < 0.5 ? '#9A5634' : '#87482A';
            g.fillRect(x + 1, y + 1, 11 + rnd() * 2, 9);
          }
        blob(g, '#E9A84A', 40, 60, 4, 7);
        blob(g, '#FFE6A8', 39, 57, 1, 2);
      },
      olive: (g) => {
        base(g, '#7C7E6C');
        for (const [color, width, step] of [
          ['#5A5C4C', 2, 5],
          ['#A2A48E', 1, 8],
        ])
          strokes(g, 64 / step + 1, color, width, (g2, i) => {
            g2.moveTo(i * step, 0);
            g2.bezierCurveTo(i * step + 18, 40, i * step - 14, 90, i * step + 10, 128);
          });
        for (let i = 0; i < 6; i++) {
          const x = 6 + rnd() * 52,
            y = 10 + i * 20,
            r = 3 + rnd() * 3;
          blob(g, '#55543F', x, y, r * 2.2, r * 2.9);
          blob(g, '#3E3D2E', x, y, r * 1.5, r * 2);
          blob(g, '#211F17', x, y, r * 0.8, r);
        }
      },
      vine: (g) => {
        base(g, '#5A3E28');
        for (let x = 0; x < 64; x += 2 + rnd() * 3) {
          g.fillStyle = rnd() < 0.5 ? '#8E6A48' : '#3E2A1C';
          g.fillRect(x, 0, 1 + rnd() * 2, 128);
        }
        for (let i = 0; i < 7; i++) {
          const x = rnd() * 60,
            y = rnd() * 90;
          g.fillStyle = '#B08A62';
          g.fillRect(x, y, 3, 20 + rnd() * 20);
          g.fillStyle = '#2A1A10';
          g.fillRect(x + 3, y, 1, 22);
        }
      },
    },
    wormPaint = (g) => {
      strokes(g, 3, '#2A1A10', 1.6, (g2) => {
        let x = rnd() * 64,
          y = rnd() * 128;
        g2.moveTo(x, y);
        for (let i = 0; i < 9; i++) g2.lineTo((x += (rnd() - 0.5) * 14), (y += 6 + rnd() * 6));
      });
      for (let i = 0; i < 24; i++) {
        const x = rnd() * 64,
          y = rnd() * 128,
          r = 1.4 + rnd() * 1.3;
        blob(g, '#D9C9A3', x, y, r + 1.2, r + 1.2);
        blob(g, '#120A06', x, y, r, r);
      }
    },
    endTex = paintTex(64, 64, (g) => {
      g.fillStyle = '#E8D2A6';
      g.fillRect(0, 0, 64, 64);
      strokes(g, 9, '#A8875A', 1.2, (g2, i) => g2.arc(32, 32, 30 - i * 3.2 - rnd(), 0, 6.3));
      blob(g, '#6A4A28', 32, 32, 2.5, 2.5);
    }),
    mats = {},
    glowK = { v: 0.32 },
    // ── build 51 ── (the inspector's review 27.10: "no defect you can see on the log in hand — why is it unfit?"; the coordinator's
    // build-51 brief, item 7) the worm SHOWN: big bored holes with their pale frass rims ('holes'), or long galleries under a peeled patch of
    // bark ('gallery') — the look drawn from build 48's shuffle-bag (WOOD48: חורי תולעת / מחילות), so it varies and never repeats back to
    // back; the olive's and the vine's bark as before, stronger ── /build 51 ──
    holes51 = (g) => {
      for (let i = 0; i < 16; i++) {
        const x = 6 + rnd() * 52,
          y = 6 + rnd() * 116,
          r = 2.6 + rnd() * 1.8;
        blob(g, '#F2E2B8', x, y, r + 2.2, r + 2.2);
        blob(g, '#0A0503', x, y, r, r);
      }
    },
    gallery51 = (g) => {
      blob(g, '#D8B47E', 32, 64, 24, 50);
      strokes(g, 5, '#1A0E06', 4.2, (g2) => {
        let x = 10 + rnd() * 44,
          y = 18 + rnd() * 12;
        g2.moveTo(x, y);
        for (let i = 0; i < 10; i++) g2.lineTo((x = Math.max(10, Math.min(54, x + (rnd() - 0.5) * 16))), (y += 7 + rnd() * 4));
      });
      for (let i = 0; i < 8; i++) blob(g, '#0A0503', 12 + rnd() * 40, 20 + rnd() * 88, 2.4, 2.4);
    },
    bag51 = createBag48(null, Math.random, ['holes', 'gallery']),
    matsOf = (L) => {
      if (L.worm && !L.__v51) L.__v51 = bag51.draw();
      const key = L.sp + (L.worm ? 'w' + (L.__v51 || '') : '');
      if (mats[key]) return mats[key];
      const side = paintTex(64, 128, (g) => {
          PAINT[L.sp](g);
          if (L.worm) (L.__v51 === 'gallery' ? gallery51 : L.__v51 === 'holes' ? holes51 : wormPaint)(g);
        }),
        end = END_COLOR[L.sp],
        mat = (o2) => new THREE.MeshStandardMaterial({ emissiveIntensity: glowK.v, roughness: 0.9, ...o2 }),
        sideMat = mat({ map: side, emissiveMap: side, emissive: '#FFFFFF' }),
        endMat = mat({ map: endTex, color: end, emissiveMap: endTex, emissive: end });
      return (mats[key] = [sideMat, endMat, endMat]);
    },
    logGeo = (gnarl) => {
      const geo = new THREE.CylinderGeometry(1, 1, 1, 14, 10),
        pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i),
          a = Math.atan2(z, x),
          k = gnarl ? 1 + 0.12 * Math.sin(y * 17 + a * 2) + 0.08 * Math.sin(a * 3 + y * 6) : 1 + 0.03 * Math.sin(a * 5 + y * 9);
        pos.setXYZ(i, x * k + (gnarl ? 0.22 * Math.sin(y * 3.2) : 0), y, z * k);
      }
      geo.computeVertexNormals();
      return geo;
    },
    geoRound = logGeo(0),
    geoGnarl = logGeo(1),
    logMesh = () => {
      const m = new THREE.Mesh(geoRound, matsOf({ sp: 'fig' }));
      m.visible = false;
      m.rotation.order = 'YXZ';
      if (scene) scene.add(m);
      return m;
    },
    cur = logMesh(),
    thrown = logMesh(),
    ghost = logMesh(),
    laid = Array.from({ length: M22.need }, logMesh),
    ghostMat = new THREE.MeshBasicMaterial({ color: '#FFF1C8', transparent: true, opacity: 0.55, depthWrite: false });
  ghost.material = ghostMat;
  const dress = (m, L) => {
      m.geometry = L.sp === 'olive' || L.sp === 'vine' ? geoGnarl : geoRound;
      if (m !== ghost) m.material = matsOf(L);
    },
    place = (m, L, x, y, z, k, yaw, spin = 0) => {
      m.position.set(x, y, z);
      m.scale.set(RAD[L.size] * k, LEN[L.size] * k, RAD[L.size] * k);
      m.rotation.set(spin, yaw, HALF_PI);
    },
    torch = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.95, 6), new THREE.MeshStandardMaterial({ color: '#6A4A2A', roughness: 0.9 }));
  torch.visible = false;
  if (scene) scene.add(torch);
  const pad = mk('m22-in', null),
    hint = mk('d21-h m22-h', ''),
    nameTag = mk('m22-l', ''),
    flashEl = mk('m22-f', ''),
    doneEl = mk('d21-w', ''),   // ── fable32 (build 30) ── (was "המערכה הגדולה נבנתה כהלכה! +N ★ …" — the step card's rating and end30's source line now) ── /fable32 ──
    air = mk('m22-a', 'אוויר<b>—</b><u><s></s><em></em></u><q></q>'),
    goRing = mk('d21-r m22-go', '🔥');
  goRing.setAttribute('aria-hidden', 'true');
  let [airB, airS, airEm, airQ] = ['b', 's', 'em', 'q'].map((s) => air.querySelector(s)),
    setHint = (html) => {
      if (hint.__h !== html) {
        hint.__h = html;
        hint.innerHTML = html;
        hint.__i = hint.querySelector('i');
      }
      hint.classList.toggle('on', !!html);
    },
    // ── fable32 (build 30) ── (a word of feedback is the step card's line for a moment; its source, where it had one, at the end) ── /fable32 ──
    flash = (html, cls) => {
      if (E.say30 && E.say30(String(html).replace(/<small>.*$/, '').replace(/<[^>]+>/g, ''), cls === 'bad' ? 'no' : 'info', cls === 'bad' ? 1.8 : 1.3)) return;
      flashEl.innerHTML = html;
      flashEl.className = 'm22-f ' + cls;
      flashEl.offsetWidth;
      flashEl.classList.add('on');
    },
    topY0 = null,
    topY = () =>
      topY0 ??
      (topY0 = (() => {
        try {
          const y = T.stages.groundAt(PX, PZ);
          return Number.isFinite(y) ? y : 25;
        } catch (e) {
          return 25;
        }
      })()),
    layerY = (ly) => topY() + (ly === 4 ? RAD.M : ly === 1 ? RAD.L : ly === 2 ? 2 * RAD.L + RAD.M : 2 * (RAD.L + RAD.M) + RAD.S),   // ── fable32 (build 36) ── (ly 4: the second pyre's logs, on the top) ── /fable32 ──
    spot = (L) => {
      const ly = L.at.ly,
        cross = ly === 3 && L.at.x > 0;
      // ── fable32 (build 36) ── the second pyre, of the incense (the maaracha's level 4; "וסדרו מערכה שניה של קטרת", תמיד ב, ה): two fig
      // logs side by side, south-west of the big one (S2X, S2Z — nearer than the mishnah's place, so it is in the frame: המחשה) ── /fable32 ──
      if (ly === 4) return { x: PX + S2X, y: layerY(4), z: PZ + S2Z + L.at.x, w: 0 };
      return {
        x: PX + (ly === 2 ? L.at.x : 0),
        y: layerY(ly) + (cross ? RAD.S * 1.7 : 0),
        z: PZ + (ly === 1 ? L.at.x : 0),
        w: ly === 2 || cross ? HALF_PI : 0,
      };
    },
    touches = new Map(),
    W = () => innerWidth || 844,
    tsOf = (ev) => (ev.timeStamp > 0 ? ev.timeStamp : performance.now());
  let thr51 = 0;   // ── build 51 ── (the last touch's swipe length — the hint's) ── /build 51 ──
  pad.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    try {
      pad.setPointerCapture(ev.pointerId);
    } catch (e) {}
    const thr = swipe51(W(), t40 ? t40.state().w : 0); try { E.sw51(thr / W(), thr / (innerHeight || 390)); } catch (e) {} thr51 = thr;   // ── build 51 ── (the swipe's gate relative to the thing: swipe51 — E.sw51 for the engine) ── /build 51 ──
    touches.set(ev.pointerId, { x0: ev.clientX, y0: ev.clientY, t0: tsOf(ev), tx: null, thr });
  });
  pad.addEventListener('pointermove', (ev) => {
    const p = touches.get(ev.pointerId);
    if (p && p.tx == null && Math.abs(ev.clientX - p.x0) >= p.thr) p.tx = tsOf(ev) - p.t0;   // ── fable32 (build 36) ── (SWIPE36) ── /fable32 ──
  });
  const up = (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    touches.delete(ev.pointerId);
    const k = E.m22();
    if (!k || ev.type !== 'pointerup') return;
    const w = W(),
      dx = ev.clientX - p.x0,
      dy = ev.clientY - p.y0;
    if (k.ph === 'sort') E.m22swipe(dx / w, dy / w, p.tx != null ? p.tx : tsOf(ev) - p.t0);
    else if ((k.ph === 'stack' || k.ph === 'ready') && Math.hypot(dx, dy) < 30)
      if (E.m22put()) buzz(k.ph === 'ignite' ? 30 : 15);
      else {
        snd('soft');
        buzz(10);
      }
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(type, up);
  const rowDir = (ly) => {
      const a = api.row(ly, 0),
        b = api.row(ly, 1);
      if (!a || !b) return null;
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d = Math.hypot(dx, dy) || 1;
      return { x: dx / d, y: dy / d };
    },
    stickUse = (x, y) => {
      const k = E.m22(),
        dir = k && k.ph === 'stack' && rowDir(k.layer === 4 ? 1 : Math.min(2, k.layer));   // ── fable32 (build 36) ── (the second pyre's row: as the base's) ── /fable32 ──
      E.m22stick(dir ? x * dir.x - y * dir.y : 0);
    };
  stickUse.m22 = 1;
  let hp = { x: 0, y: 16, z: 0, yaw: 0 },
    pyreObj = null,
    embers = null,
    on = false,
    hd = false,
    lastPh = '',
    showAt = -9,
    throwing = null,
    igniteAt = -9,
    lightK = 0,
    fsDefault = 1,
    lastAir = -1,
    npcAt = -1,
    NPC_LOGS = [
      ['pine', 'L', 1, -0.55],
      ['fig', 'L', 1, 0.55],
      ['fig', 'M', 2, -0.45],
      ['walnut', 'M', 2, 0.45],
      ['walnut', 'S', 3, -0.16],
      ['pine', 'S', 3, 0.16],
    ].map(([sp, size, ly, x]) => ({ sp, size, at: { ly, x }, __t: 0 })),
    setMode = (active, hud) => {
      const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods,
        twin = o.twin || (mods && mods.twin);
      if (twin)
        if (hud && twin.stickUse !== stickUse) twin.stickUse = stickUse;
        else if (!hud && twin.stickUse === stickUse) {
          twin.stickUse = null;
          E.m22stick(0);
        }
      if (hd !== !!hud) {
        hd = !!hud;
        doc.body.classList.toggle('m22-hd', hd);
      }
      if (on !== active) {
        on = active;
        doc.body.classList.toggle('m22-on', active);
        try {
          if (twin && twin.noStick) twin.noStick(active ? true : globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
    },
    CAM_S = M22.camS,
    camDir = CAM_S.t.map((v, i) => v - CAM_S.p[i]),
    SHOW = CAM_S.p.map((v, i) => v + camDir[i] * 0.38),   // ── build 51 ── (the log in hand held nearer the eye: 0.38 of the way, was 0.55 — its defect read) ── /build 51 ──
    camLen = Math.hypot(camDir[0], camDir[2]),
    side = [-camDir[2] / camLen, camDir[0] / camLen],
    showYaw = Math.atan2(side[1], -side[0]),
    // ── fable32 (build 40) ── the act's surface on the thing: the log he sorts, the pyre he stacks (touch40.js) ── /fable32 ──
    t40 = createTouch40({ doc, pad, id: 'm22', proj: (x, y, z) => { try { const p = view && view.project(x, y, z); return p && p.on !== false ? { x: p.x, y: p.y } : null; } catch (e) { return null; } } }),
    offTick = onTick(() => {
      const st = E.st33;
      if (!st) return;
      try {
        T.stages.heroXYZ(hp);
      } catch (e) {}
      const k = E.m22(),
        ph = k ? k.ph : '',
        t = now(),
        live = st.phase === 'run' && !st.summary && !st.night,
        sorting = ph === 'in' || ph === 'sort' || ph === 'sorted',
        stacking = ph === 'stack' || ph === 'ready',
        burning = ph === 'ignite' || ph === 'end',
        veteran = E.first22 ? (E.first22() ? 0 : 1) : st.day > 1 ? 1 : 0,
        npc = live && !!E.npc23 && E.npc23() === 'm22';
      if (ph !== lastPh) {
        lastPh = ph;
        if (ph === 'ignite') igniteAt = t;
      }
      setMode(!!k && ph !== 'carry' && ph !== 'stack', ph === 'stack');
      const padOn = sorting || stacking;
      {   // ── fable32 (build 40) ── the log before him (its length) while he sorts; the pyre's layer while he stacks ── /fable32 ──
        const lz = k && k.cur && k.cur.size ? k.cur.size : 'M';
        t40.place(padOn && !!k, sorting ? [{ x: SHOW[0], y: SHOW[1], z: SHOW[2], r: Math.max(0.35, (LEN[lz] || 1.2) * (SHOW_K[lz] || 0.6) * 0.5), self: true /* ── build 51 ── (held up to the eye: its own size on the screen — the object rule leaves the view) */ }] : [{ x: PX, y: layerY(k && k.layer === 4 ? 4 : Math.min(3, (k && k.layer) || 1)), z: PZ, r: 2.2 }], sorting ? 'm22' : 'm22stack');
      }
      if (pad.classList.contains('on') !== padOn) {
        pad.classList.toggle('on', padOn);
        if (!padOn) touches.clear();
      }
      glowK.v = sorting ? 0.34 : 0.07;
      for (const key in mats) mats[key][0].emissiveIntensity = mats[key][1].emissiveIntensity = glowK.v;
      const L = k && k.ph === 'sort' && k.ls === 'on' ? k.cur : null;
      cur.visible = !!L;
      if (L) {
        if (cur.__L !== L) {
          cur.__L = L;
          dress(cur, L);
          showAt = t;
        }
        const u = Math.min(1, (t - showAt) / 0.2),
          e = 1 - (1 - u) * (1 - u);
        place(cur, L, SHOW[0], SHOW[1] - 0.5 * (1 - e), SHOW[2], SHOW_K[L.size] * (0.7 + 0.3 * e), showYaw, t * 0.9);
        cur.scale.x *= THICK51; cur.scale.z *= THICK51;   // ── build 51 ── (the log in hand thicker: its bark and its worm read on a phone) ── /build 51 ──
      }
      if (throwing) {
        const th = throwing,
          u = (t - th.t0) / th.d;
        thrown.visible = u < 1 && sorting;
        if (!thrown.visible) throwing = null;
        else {
          const d = th.dir === 'b' ? (u < 0.35 ? (u / 0.35) * 0.9 : 0.9 - ((u - 0.35) / 0.65) * 4) : th.dir === 'r' ? u * 3.4 : -u * 3.4;
          place(
            thrown,
            th.L,
            SHOW[0] + side[0] * d,
            SHOW[1] + (th.dir === 'r' ? Math.sin(u * Math.PI) * 0.35 : -u * u * 1.2),
            SHOW[2] + side[1] * d,
            SHOW_K[th.L.size] * (1 - 0.35 * u),
            showYaw,
            th.sp + u * (th.dir === 'l' ? -6 : 6),
          );
        }
      }
      const first = !veteran && false;   // ── fable32 (build 30) ── (the wood's name under the log is gone: the first morning's line says "זית, גפן, מתולע — שמאלה"; the woods' sources at the end) ── /fable32 ──
      nameTag.classList.toggle('on', !!L && first);
      if (L && first) {
        const p = proj(SHOW[0], SHOW[1] - RAD[L.size] * SHOW_K[L.size] - 0.22, SHOW[2]),
          txt = WOOD_HE[L.sp] + (L.worm ? ' · מתולע' : '');
        if (nameTag.textContent !== txt) nameTag.textContent = txt;
        if (p) nameTag.style.transform = `translate(${(p.x - nameTag.offsetWidth / 2) | 0}px,${(p.y + 4) | 0}px)`;
      }
      // ── fable32 (build 30) ── (the hint card is gone while he sorts and lays: the step card's one line; its words — "ימינה → כשר: תאנה,
      // אגוז, עץ שמן · פסול: זית, גפן, מתולע ← שמאלה", the layers (LAYERS, LAYERS23) and their sources — at the end, SRC30.m22; the sort's
      // time bar went with it: the rating has no clock) ── /fable32 ──
      setHint('');
      air.classList.toggle('on', stacking);
      if (stacking) {
        const gap = k.pv != null ? k.pv : k.gap,
          gapBand = E.band22(),
          zone = gap == null ? '' : gap < gapBand[0] ? 'red' : gap > gapBand[1] ? 'amb' : 'grn',
          pct = gap == null ? -1 : Math.round(gap * 100);
        if (pct !== lastAir || air.__z !== zone) {
          lastAir = pct;
          air.__z = zone;
          airB.textContent = pct < 0 ? '—' : `${pct}%`;
          airS.style.height = `${Math.min(100, Math.max(0, pct) / 0.6)}%`;
          airEm.style.bottom = `${gapBand[0] / 0.006}%`;
          airEm.style.height = `${(gapBand[1] - gapBand[0]) / 0.006}%`;
          air.className = `m22-a on ${zone}`;
          airQ.textContent = zone === 'red' ? 'צפוף — סכנת חנק אש' : zone === 'amb' ? 'רווח גדול מדי' : zone === 'grn' ? 'רווח בין הגזרין' : '';
        }
      }
      goRing.classList.toggle('on', ph === 'ready');
      if (ph === 'ready') {
        const p = proj(PX, layerY(3) + 0.3, PZ);
        if (p) goRing.style.transform = `translate(${p.x | 0}px,${p.y | 0}px)`;
      }
      if (npc) {
        if (npcAt < 0) npcAt = t;
        const n = Math.min(NPC_LOGS.length, 1 + Math.floor((t - npcAt) / 2.2));
        for (let i = 0; i < NPC_LOGS.length; i++) if (i < n && !NPC_LOGS[i].__t) NPC_LOGS[i].__t = t;
      } else if (npcAt >= 0) {
        npcAt = -1;
        for (const w of NPC_LOGS) w.__t = 0;
      }
      const showLaid = stacking || burning;
      laid.forEach((m, i) => {
        const L2 = showLaid ? k.got[i] : npc && NPC_LOGS[i] && NPC_LOGS[i].__t ? NPC_LOGS[i] : null;
        m.visible = !!(L2 && L2.at);
        if (m.visible) {
          if (m.__L !== L2.sp + L2.size) {
            m.__L = L2.sp + L2.size;
            dress(m, L2);
          }
          const sp = spot(L2);
          place(m, L2, sp.x, sp.y + (L2.__t ? Math.max(0, 1 - (t - L2.__t) / 0.22) * 1.2 : 0), sp.z, 1, sp.w);
        }
      });
      {
        const L2 = ph === 'stack' && k.hold >= 0 ? k.got[k.hold] : null;
        ghost.visible = !!L2;
        if (L2) {
          if (ghost.__L !== L2.sp + L2.size) {
            ghost.__L = L2.sp + L2.size;
            dress(ghost, L2);
          }
          const sp = spot({ at: { ly: k.layer, x: k.gl } }),
            pv = k.pv,
            gapBand = E.band22();
          ghostMat.color.set(pv == null ? '#FFF1C8' : pv < gapBand[0] ? '#FF6A4A' : pv > gapBand[1] ? '#FFD66E' : '#8FE07A');
          place(ghost, L2, sp.x, sp.y + 0.25 + 0.06 * Math.sin(t * 6), sp.z, 1, sp.w);
        }
      }
      const H = hero(),
        torchOn = live && (ph === 'ready' || (ph === 'ignite' && t - igniteAt < 1.2));
      torch.visible = torchOn && !!H;
      if (torchOn && H) {
        const fx = Math.sin(hp.yaw),
          fz = Math.cos(hp.yaw),
          u = ph === 'ignite' ? Math.min(1, (t - igniteAt) / 0.35) : 0,
          hand = H.at('handslotr') || H.at('handr') || { x: hp.x + fx * 0.5, y: hp.y + 1, z: hp.z + fz * 0.5 };
        torch.position.set(hand.x + fx * 0.25, hand.y + 0.3 - 0.2 * u, hand.z + fz * 0.25);
        torch.rotation.set(0.55 + 0.6 * u, hp.yaw, 0, 'YXZ');
        torch.__tip = [hand.x + fx * (0.45 + 0.3 * u), hand.y + 0.72 - 0.45 * u, hand.z + fz * (0.45 + 0.3 * u)];
      } else torch.__tip = null;
      if (pyreObj == null && scene) {
        pyreObj = scene.getObjectByName('pyre22') || 0;
        embers = [];
        scene.traverse((o3) => {
          if (o3.name === 'ember' && o3.material && !embers.includes(o3.material)) embers.push(o3.material);
        });
      }
      const hidePyre = live && (E.gate22() || !!k || npc);
      if (pyreObj && pyreObj.visible === hidePyre) pyreObj.visible = !hidePyre;
      if (embers) {
        const k2 = hidePyre ? (burning ? Math.min(1, 0.12 + (t - igniteAt) / 2) : 0.12) : 1;
        for (const m of embers) m.emissiveIntensity = k2;
      }
      const fs =
        sorting || ph === 'carry'
          ? [0.45, 0.6]
          : stacking || ph === 'stackIn' || npc
            ? [0.12, 0.25]
            : burning
              ? [0.12 + 0.88 * clamp((t - igniteAt - 0.35) / 1.6, 0, 1), 0.25 + 1.15 * clamp((t - igniteAt - 0.5) / 1.5, 0, 1)]
              : null;
      if (fs) {
        fireSmoke(fs[0], fs[1]);
        fsDefault = 0;
      } else if (fsDefault === 0) {
        fireSmoke(1, 1);
        fsDefault = 1;
      }
    }),
    puffs = [],
    lit = false,
    puff = (x, y, z, n, color, k = 1, g = 9, life = 0.8, r = 0.06) => {
      for (let i = 0; i < n; i++) {
        if (puffs.length >= 110) puffs.shift();
        const a = rand() * 6.283,
          v = (0.4 + rand() * 1.2) * k;
        puffs.push({
          x,
          y,
          z,
          vx: Math.cos(a) * v,
          vy: (1 + rand() * 2) * k,
          vz: Math.sin(a) * v,
          t: 0,
          life: life * (0.7 + rand() * 0.6),
          c: color,
          g,
          r,
        });
      }
    },
    dots = (k, ly, y, off, color, r, dy) => {
      for (let i = -4; i <= 4; i++) {
        const s = i * 0.36;
        if (ly === 4) k.ws(PX + S2X + s * 0.6, y + dy(i), PZ + S2Z + off, r, r, r, color);   // ── fable32 (build 36) ── ── /fable32 ──
        else k.ws(PX + (ly === 2 ? off : s), y + dy(i), PZ + (ly === 1 ? off : s), r, r, r, color);
      }
    },
    offDraw = addDrawer(
      null,
      (k, tt, dt) => {
        const st = E.st33;
        if (!st) return;
        const m = E.m22(),
          ph = m ? m.ph : '',
          t = now();
        if (st.paused) dt = 0;
        const sorting = ph === 'in' || ph === 'sort' || ph === 'sorted',
          burning = ph === 'ignite' || ph === 'end',
          since = burning ? t - igniteAt : 0,
          want = sorting
            ? 14
            : ph === 'stack' || ph === 'ready' || ph === 'stackIn'
              ? 3.5
              : burning
                ? 3.5 + (since < 0.5 ? 0 : 60 * Math.min(1, (since - 0.5) / 0.4) * Math.max(0.35, 1 - (since - 0.9) / 3))
                : 0;
        lightK += (want - lightK) * Math.min(1, dt * 6);
        if (lightK > 0.3 && k.light) {
          const lt = k.light;
          lt.color.set(sorting ? '#FFC98A' : '#FF9A40');
          if (sorting) lt.position.set(-37.4, 19.6, 55.4);
          else lt.position.set(PX + 0.6, topY() + 2.4, PZ + 0.8);
          lt.distance = sorting ? 12 : 16;
          lt.decay = 1;
          lt.intensity = lightK * (0.94 + 0.06 * Math.sin(t * 13) * Math.sin(t * 5.1));
          lit = true;
        } else if (lit && k.light) {
          k.light.color.set('#FFC27A');
          k.light.decay = 1.6;
          lit = false;
        }
        if (ph === 'stack' && m && m.hold >= 0)
          dots(k, m.layer === 3 ? 1 : m.layer, layerY(m.layer) + 0.17, m.layer === 3 ? 0 : m.gl, '!#FFF1B8', 0.08, () => 0);
        if (m && (ph === 'stack' || ph === 'ready'))
          for (const ly of [1, 2]) {
            const gap = m.gaps[ly - 1];
            if (gap == null) continue;
            const two = m.got.filter((L) => L.at && L.at.ly === ly),
              tight = gap < M22.gap[0];
            dots(k, ly, layerY(ly) + 0.1, (two[0].at.x + two[1].at.x) / 2, tight ? '!#FF6A2A' : '!#CFF6FF', tight ? 0.07 : 0.05, (i) =>
              tight ? 0.05 * Math.sin(tt * 9 + i) : 0.1 + 0.08 * Math.sin(tt * 3 + i),
            );
          }
        if (torch.__tip) {
          const [x, y, z] = torch.__tip;
          k.ws(x, y, z, 0.13, 0.2 + 0.04 * Math.sin(tt * 17), 0.13, '!#FFB347');
          k.ws(x, y + 0.1, z, 0.07, 0.12, 0.07, '!#FFF1B8');
        }
        if (burning && m) {
          const u = clamp((since - 0.35) / 1.2, 0, 1),
            y3 = layerY(3);
          if (since < 0.35 && torch.__tip) {
            const tip = torch.__tip,
              a = since / 0.35;
            k.ws(tip[0] + (PX - tip[0]) * a, tip[1] + (y3 - tip[1]) * a, tip[2] + (PZ - tip[2]) * a, 0.1, 0.1, 0.1, '!#FFE08A');
          }
          if (u > 0) {
            m.got.forEach((L) => {
              if (!L.at) return;
              const sp = spot(L),
                half = (LEN[L.size] / 2) * Math.min(1, u * [1.1, 1.6, 3, 1.6][L.at.ly - 1]);
              for (let i = -3; i <= 3; i += 2) {
                const off = (i / 3) * half,
                  h = (0.3 + 0.14 * Math.sin(tt * (9 + i) + i * 2)) * (1.2 - Math.abs(i) / 8);
                k.ws(
                  sp.x + (sp.w ? 0 : off),
                  sp.y + RAD[L.size] + h,
                  sp.z + (sp.w ? off : 0),
                  h * 0.9,
                  h * 2.4,
                  h * 0.9,
                  i & 2 ? '!#FF9A3A' : '!#FFC062',
                );
              }
            });
            for (let i = 0; i < 3; i++) {
              const h = (0.45 + 0.15 * Math.sin(tt * (7 + i) + i)) * u,
                a = i * 2.1 + tt;
              k.ws(PX + Math.cos(a) * 0.3, y3 + 0.6 + h, PZ + Math.sin(a) * 0.3, h * 0.7, h * 2, h * 0.7, i % 2 ? '!#FFB347' : '!#FFE08A');
            }
            if (rand() < dt * 10)
              puff(PX + (rand() - 0.5) * 2, y3 + 0.4, PZ + (rand() - 0.5) * 2, 1, rand() < 0.5 ? '!#FFB347' : '!#FFE08A', 0.6, -2, 0.9, 0.04);
          }
          if (since > 0.4 && since < 7 && rand() < dt * 6)
            puff(PX + (rand() - 0.5) * 0.5, y3 + 1, PZ + (rand() - 0.5) * 0.5, 1, '!#E8E4DC', 0.1, -6, 4, 0.45);
        }
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.t += dt;
          if (p.t >= p.life) {
            puffs.splice(i, 1);
            continue;
          }
          p.vy -= p.g * dt;
          if (p.g < 0) {
            p.vx *= 0.9;
            p.vz *= 0.9;
            p.vy = Math.min(p.vy, 6);
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          const u = p.t / p.life,
            r = p.g < -3 ? p.r * (1 + 4 * u) * (u > 0.8 ? (1 - u) * 5 : 1) : p.r * (1 - u * 0.6);
          k.ws(p.x, p.y, p.z, r, r, r, p.c);
        }
      },
      3,
    ),
    offEv = E.on17((ev) => {
      const type = ev.type,
        m = E.m22(),
        L = m && ev.k != null ? m.got[ev.k] : null;
      if (type === 'm22sw') {
        if (!ev.ok) {
          snd('soft');
          // ── fable32 (build 34) ── the reason, as the ashes', the lamb's and the Heichal's swipes say it — a child who swiped right but too
          // short or too slow read "החליקו ימינה או שמאלה ↔" again and again, swiped the same, and sorted nothing (0/4 for minutes) ── /fable32 ──
          flash(ev.why === 'short' ? 'ארוך יותר ↔' : ev.why === 'slow' ? 'מהר יותר ↔' : 'לרוחב ↔', 'ok');
          if (ev.why === 'short' || ev.why === 'slow') t40.hint51(thr51, 'x');   // ── build 51 ── (the right length on the log) ── /build 51 ──
          return;
        }
        const L0 = cur.__L;
        throwing = L0 ? { L: L0, t0: now(), d: ev.take && !ev.fit ? 0.6 : 0.28, dir: ev.take ? (ev.fit ? 'r' : 'b') : 'l', sp: now() * 0.9 } : null;
        if (L0) dress(thrown, L0);
        cur.__L = null;
        cur.visible = false;
        if (ev.take && ev.fit) {
          snd('knock22', { n: ev.n - 1 });
          buzz(20);
          puff(SHOW[0], SHOW[1], SHOW[2], 12, '!#8CFF7A', 0.8, 2, 0.5, 0.035);
        } else if (ev.take) {
          const why = BAD_WOOD[ev.worm ? 'worm' : ev.sp] || BAD_WOOD.olive;
          snd('err22');
          buzz([70, 60, 70]);
          flash(`${why[0]}${ev.warn ? ' · הפעם רק אזהרה' : ''}<small>${why[1]}</small>`, 'bad');   // ── fable32 (build 30) ── (no points; the source at the end) ── /fable32 ──
        } else {
          snd('whoosh');
          if (ev.fit) flash(`${WOOD_HE[ev.sp]} — כשר ↺`, 'ok');
        }
      } else if (type === 'm22') {
        const ph = ev.ph;
        if (ph === 'sort' || (ph === 'stack' && !ev.back)) snd('ui');
        else if (ph === 'sorted' || ph === 'ready') {
          snd('good');
          buzz([25, 40, 25]);
        } else if (ph === 'ignite') {
          snd('whoosh');
          setTimeout(() => {
            snd('fire22');
            buzz([380, 40, 260, 50, 170, 60, 100, 70, 50]);
          }, 350);
        }
      } else if (type === 'm22put') {
        if (L) L.__t = now();
        setTimeout(() => {
          snd('thud');
          buzz(15);
        }, 200);
      } else if (type === 'm22no') {
        snd('crack22');
        buzz([40, 30, 40]);
        flash(ev.ly === 1 ? 'לבסיס — גזרים עבים' : ev.ly === 2 ? 'כאן — הבינוני' : 'כאן — הדק', 'bad');   // ── fable32 (build 30) ── (were: "בסיס המערכה דורש גזרים עבים!" / the layer's line) ── /fable32 ──
      } else if (type === 'm22air') {
        snd('err22');
        buzz([40, 30, 40]);
        flash(`${ev.why === 'tight' ? 'צפוף מדי — הרחיקו ↔' : 'רחוק מדי — קרבו ↔'}<small>אוויר ${ev.gap}%</small>`, 'bad');   // ── fable32 (build 30) ── (the air's % on its gauge; "ורוח היה בין הגזרין" at the end) ── /fable32 ──
      } else if (type === 'm22done') {
        flashEl.classList.remove('on');
        snd('blast21');   // ── fable32 (build 30) ── (the end's banner is the step card's rating; its line "תמיד ב, ד" end30's) ── /fable32 ──
      }
    }),
    api = {
      destroy() {
        t40.destroy();   // ── fable32 (build 40) ── ── /fable32 ──
        offTick();
        offDraw();
        offEv();
        setMode(false, false);
        if (fsDefault === 0) fireSmoke(1, 1);
        if (pyreObj) pyreObj.visible = true;
        if (embers) for (const m of embers) m.emissiveIntensity = 1;
        if (scene) scene.remove(cur, thrown, ghost, torch, ...laid);
        for (const el of [pad, hint, nameTag, flashEl, doneEl, air, goRing]) el.remove();
        try {
          if (globalThis.__M22 === api) delete globalThis.__M22;
        } catch (e) {}
      },
      state: () => ({ laid: laid.filter((m) => m.visible).length, light: lightK }),
      at: (i) => {
        const k = E.m22(),
          L = k && k.got[i];
        if (!L || !L.at) return null;
        const sp = spot(L);
        return proj(sp.x, sp.y, sp.z);
      },
      row: (ly, x = 0) => (ly === 4 ? proj(PX + S2X, layerY(4), PZ + S2Z + x) : proj(PX + (ly === 2 ? x : 0), layerY(Math.min(ly, 2)), PZ + (ly === 1 ? x : 0))),
      rowS: rowDir,
    };
  try {
    globalThis.__M22 = api;
  } catch (e) {}
  return api;
}
const WOOD_HE = { fig: 'תאנה', walnut: 'אגוז', pine: 'עץ שמן', olive: 'זית', vine: 'גפן' };
const BAD_WOOD = {
  olive: ['עץ זית — פסול למערכה', '"משום דקטרי" — קשרים, עשן כבד · תמיד כט ע״ב'],
  vine: ['עץ גפן — פסול למערכה', '"חוץ משל זית ושל גפן" — תמיד ב, ג'],
  worm: ['עץ מתולע — פסול למערכה', '"מתליעין העצים" — מדות ב, ה'],
};
const SRC_KASHER = '"כל העצים כשרים למערכה חוץ משל זית ושל גפן" — תמיד ב, ג · טיוטה';
const SRC_RUACH = '"ורוח היה בין הגזרין, שהיו מציתין את האליתא משם" — תמיד ב, ד · טיוטה';
const LAYERS = ['שכבה 1 — עבים לבסיס, ראשיהם אל התפוח', 'שכבה 2 — בינוניים, שתי וערב', 'שכבה 3 — דקים: האליתא, במרכז'];
const LAYERS23 = ['שכבה 1 — שני עבים לבסיס, ראשיהם אל התפוח', 'שכבה 2 — בינוני אחד, לרוחבם', 'שכבה 3 — דק: האליתא, במרכז'];
// ── fable32 (build 30) ── the pyre's lines at its end: the woods, the air, the unfit (BAD_WOOD's sources, each now with its "טיוטה"),
// the layers (a game's order of the logs — המחשה) ── /fable32 ──
reg30('m22', {
  chip: SRC_KASHER,
  all: [
    SRC_KASHER,
    'ימינה → כשר: תאנה, אגוז, עץ שמן · פסול: זית, גפן, מתולע ← שמאלה — המחשה',
    ...Object.values(BAD_WOOD).map(([a, b]) => draft30(`${a}: ${b}`)),
    SRC_RUACH,
    `${LAYERS23.join(' · ')} — המחשה`,
  ],
});
const END_COLOR = { fig: '#E6D6B4', walnut: '#B98F66', pine: '#EAB27A', olive: '#CDBF94', vine: '#A47A52' };
const THICK51 = 1.8;   // ── build 51 ── (the log in hand: its girth ×1.8 — the defect shown) ── /build 51 ──
const SHOW_K = { L: 0.55 * 1.7, M: 0.62 * 1.7, S: 0.85 * 1.7 };   // ── build 51 ── (the log in hand ×1.7: its defect read at a phone's size; the object rule frames it) ── /build 51 ──
const { r: RAD, len: LEN } = M22;
const PX = M22.pyre.x;
const S2X = -2.4,
  S2Z = 2.2;   // ── fable32 (build 36) ── (the second pyre's offset from the big one, amot) ── /fable32 ──
const PZ = M22.pyre.z;
const HALF_PI = Math.PI / 2;
const rand = Math.random;
const CSS = `.m22-in{position:fixed;top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;display:none}body.m22-on .gm .tw-pad,body.m22-on .f17-bar,body.m22-hd .gm .tw-pad,body.m22-hd .f17-bar{opacity:0!important;pointer-events:none!important}
.m22-l,.m22-f,.m22-a{position:fixed;pointer-events:none;direction:rtl;text-align:center;font:900 16px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA;white-space:nowrap;display:none;border-radius:14px;background:#1C140AD8}
.m22-in.on,.m22-l.on,.m22-a.on{display:block}[class^=m22] small{display:block;font-size:12px}[class^=m22] b{display:block}
.m22-h i{display:block;height:4px;margin-top:4px;border-radius:2px;background:#E2B65A;transform-origin:right}.m22-h i.ov{background:#B07A3A}
.m22-l{left:0;top:0;z-index:31;font-size:15px;padding:3px 10px}.m22-h u{text-decoration:none;color:#9CF08A}.m22-h s{text-decoration:none;color:#FF8A7A}
.m22-f{display:block;top:30%;left:50%;transform:translateX(-50%);z-index:37;opacity:0;padding:6px 16px;font-size:20px;border:2px solid}.m22-f.bad{color:#FF5A4A}.m22-f.ok{color:#FFD66E;border-color:#0000}.m22-f.on{animation:d21w 1.7s forwards}
.m22-a{right:12px;top:96px;z-index:31;width:84px;padding:6px 4px;font-size:13px;border:1.5px solid #E2B65A;white-space:normal}.m22-a u{display:block;position:relative;height:120px;width:18px;margin:5px auto;border-radius:9px;background:#3A2A18;overflow:hidden}
.m22-a s{position:absolute;bottom:0;left:0;right:0;background:#FFB04A}.m22-a em{position:absolute;left:-3px;right:-3px;background:#8FE07A66;border:1.5px solid #8FE07A}.m22-a b{font-size:22px}.m22-a q{display:block;font-size:12px;quotes:none}
.m22-a.red{border-color:#FF5A4A}.m22-a.red s{background:#FF5A4A}.m22-a.red q{color:#FF8A7A}.m22-a.grn s{background:#8FE07A}.m22-a.grn q{color:#9CF08A}.m22-a.amb q{color:#FFD66E}
.m22-go{background:radial-gradient(#FFB04A00 50%,#FFB04A66 64%,#FFB04A00 72%);font-size:22px;line-height:110px}
`;
