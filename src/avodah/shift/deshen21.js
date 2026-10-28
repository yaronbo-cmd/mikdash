/* ── fable32 (build 21) ── ── recovered (build 21) ── deshen21.js — תרומת הדשן, the first task of the morning (תמיד א, ד; זבחים ו, ג),
 * in the world, before dawn: the bed of coals on the altar's top, glowing under its ash; he sweeps it with the silver pan — "פנה את
 * הגחלים הילך והילך" — a swipe across the right half of the screen, back and forth (D21.swipe px, straight enough, fast enough), layer
 * by layer (D21.layers) until the pan is full; then the walk down the ramp with the full pan, the left stick forward and the right
 * thumb against its tilt (the balance gauge "איזון המחתה"; a spill costs points); at the ramp's foot the gold ring, a tap — "צבר את
 * הגחלים על גבי הרצפה" — the coals poured on the floor east of the ramp, and "תרומת הדשן הושלמה!". The pre-dawn light (PREDAWN),
 * the fire's glow on the altar (FIRE_LIGHT), the heap that smokes the rest of the day; after the morning's last task the sky turns to day
 * (mixTime predawn → noon). The engine is day33.js (E.d21(): in → sweep → full → walk/desc → foot → pour → end; d21swipe, d21bal,
 * d21stick; its events through E.on17).
 *   createDeshen21({ E, sfx, doc, view, twin }) → { destroy(), state() }      (focus17.js makes it when E.g21; globalThis.__D21)
 * The bundle kept no comment and no local name: the names are the recovery's. Never a Divine Name. */
import * as THREE from 'three';
import { addDrawer, L, onTick } from './draw.js';
import { D21, SWIPE36, swipe51 } from './day33.js';
import { reg30 } from './rate30.js';
import { createTouch40 } from './touch40.js';   // ── fable32 (build 40) ── touch the thing itself ── /fable32 ──   // ── fable32 (build 30) ── ── /fable32 ──
export function createDeshen21(o = {}) {
  const E = o.E,
    doc = o.doc || (typeof document < 'u' ? document : null),
    view = o.view || null,
    stat = { swipes: 0, spills: 0, done: 0, buzz: 0 },
    walk52 = { t0: null, done: false };   // ── build 52 ── (the act's first walk: when it began, the right thumb down since) ── /build 52 ──
  if (!doc || !E || !E.on17 || !E.g21) return { destroy() {}, state: () => stat };
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
        stat.buzz++;
      } catch (e) {}
    },
    hero = () => {
      const H = globalThis.__HERO35;
      return H && H.loaded ? H : null;
    },
    now = () => performance.now() / 1e3,
    proj = (x, y, z) => {
      try {
        const p = view && view.project(x, y, z);
        return p && p.on !== false ? p : null;
      } catch (e) {
        return null;
      }
    },
    gy = (x, z, y0) => {
      try {
        const y = T.stages.groundAt(x, z);
        return Number.isFinite(y) ? y : y0;
      } catch (e) {
        return y0;
      }
    };
  if (!doc.getElementById('d21-css')) {
    const css = doc.createElement('style');
    css.id = 'd21-css';
    css.textContent = CSS;
    doc.head.appendChild(css);
  }
  let mk = (cls, html) => {
      const el = doc.createElement('div');
      el.className = cls;
      if (html != null) el.innerHTML = html;
      doc.body.appendChild(el);
      return el;
    },
    seed = 7,
    rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647,
    paintTex = (paint, srgb = true) => {
      const cv = doc.createElement('canvas');
      cv.width = cv.height = 128;
      paint(cv.getContext('2d'));
      const tex = new THREE.CanvasTexture(cv);
      if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    },
    blobs = Array.from({ length: 95 }, () => [rnd() * 128, rnd() * 128, 3 + rnd() * 7, rnd()]),
    coalTex = paintTex((g) => {
      g.fillStyle = '#120A06';
      g.fillRect(0, 0, 128, 128);
      for (const [x, y, r, h] of blobs) {
        g.beginPath();
        g.ellipse(x, y, r, r * 0.8, h * 3, 0, 6.3);
        g.fillStyle = h > 0.62 ? (h > 0.85 ? '#FFC062' : '#E8701E') : `hsl(22,30%,${7 + h * 9}%)`;
        g.fill();
        g.strokeStyle = h > 0.45 ? '#FFB347' : '#C85A14';
        g.lineWidth = 1 + h * 1.6;
        g.stroke();
      }
    }),
    ashTex = paintTex((g) => {
      const grad = g.createRadialGradient(64, 64, 50, 64, 64, 64);
      grad.addColorStop(0, '#B4AFA6');
      grad.addColorStop(1, '#B4AFA600');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 2600; i++) {
        const a = rnd() * 6.3,
          r = Math.sqrt(rnd()) * 56,
          v = (140 + rnd() * 100) | 0;
        g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
        g.fillRect(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 2, 2);
      }
    }),
    coalMat = new THREE.MeshStandardMaterial({
      map: coalTex,
      emissiveMap: coalTex,
      emissive: '#FFFFFF',
      emissiveIntensity: 0,
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
    ashMat = new THREE.MeshStandardMaterial({
      map: ashTex,
      color: '#CFC9BE',
      emissive: '#6A665F',
      emissiveMap: ashTex,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      roughness: 1,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    }),
    bed = new THREE.Group(),
    coals = new THREE.Mesh(new THREE.CircleGeometry(1.55, 36), coalMat),
    ash = new THREE.Mesh(new THREE.CircleGeometry(1.75, 36), ashMat);
  coals.rotation.x = ash.rotation.x = -Math.PI / 2;
  ash.position.y = 0.04;
  bed.add(coals, ash);
  bed.position.set(D21.bed.x, gy(D21.bed.x, D21.bed.z, 25) + 0.03, D21.bed.z);
  bed.visible = false;
  const panMat = new THREE.MeshStandardMaterial({ color: '#E4E8EF', metalness: 0.6, roughness: 0.32, emissive: '#7C828E', side: THREE.DoubleSide }),
    pan = new THREE.Group(),
    bowl = new THREE.Mesh(
      new THREE.LatheGeometry(
        [0, -0.04, PAN.r * 0.75, -0.04, PAN.r * 0.95, 0.04, PAN.r, 0.055].reduce(
          (pts, v, i, arr) => (i % 2 ? pts : [...pts, new THREE.Vector2(v, arr[i + 1])]),
          [],
        ),
        20,
      ),
      panMat,
    ),
    handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, PAN.l), panMat);
  bowl.position.z = PAN.l + PAN.r * 0.9;
  handle.position.z = PAN.l / 2;
  pan.add(bowl, handle);
  pan.rotation.order = 'YXZ';
  pan.visible = false;
  const emberMat = new THREE.MeshBasicMaterial({ color: '#FFAA44' }),
    emberGeo = new THREE.IcosahedronGeometry(0.1, 0),
    embers = Array.from({ length: 5 }, (_, i) => {
      const m = new THREE.Mesh(emberGeo, emberMat),
        a = i * 2.4,
        r = i ? 0.17 : 0;
      m.position.set(Math.cos(a) * r, 0.01, bowl.position.z + Math.sin(a) * r);
      m.visible = false;
      pan.add(m);
      return m;
    }),
    glow = new THREE.AmbientLight(PREDAWN[0], 0);
  if (scene) scene.add(bed, pan, glow);
  const pad = mk('d21-in', null),
    hint = mk('d21-h', ''),
    gauge = mk('d21-g', GAUGE),
    tapRing = mk('d21-r', '✋'),
    // ── fable32 (build 36) ── level 2 on: the consumed inner coals glow on one side of the bed — the scoop goes toward them ("חתה מן
    // המאוכלות הפנימיות", תמיד א, ד); a glow over the bed's side on the screen ── /fable32 ──
    inner36 = mk('d21-in36', ''),
    hand52 = mk('d21-h52', '<i>👆</i>'),   // ── build 52 ── (the right thumb's hint at the first walk: drag against the tilt, side to side) ── /build 52 ──
    doneEl = mk('d21-w', '');   // ── fable32 (build 30) ── (was "תרומת הדשן הושלמה!" — the step card's rating now) ── /fable32 ──
  tapRing.setAttribute('aria-hidden', 'true');
  // ── fable32 (build 40) ── the act's surface on the thing: the bed of coals while he scoops, the pan in his hand on the way down (touch40.js) ── /fable32 ──
  const t40 = createTouch40({ doc, pad, id: 'd21', proj: (x, y, z) => { try { const p = view && view.project(x, y, z); return p && p.on !== false ? { x: p.x, y: p.y } : null; } catch (e) { return null; } } });
  const needle = gauge.querySelector('.nd'),
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
    const thr = swipe51(W(), t40.state().w); try { E.sw51(thr / W(), thr / (innerHeight || 390)); } catch (e) {} thr51 = thr;   // ── build 51 ── (the swipe's gate relative to the thing: swipe51 — E.sw51 for the engine) ── /build 51 ──
    touches.set(ev.pointerId, { x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, t0: tsOf(ev), tx: null, thr });
  });
  pad.addEventListener('pointermove', (ev) => {
    const p = touches.get(ev.pointerId);
    if (p) {
      p.x = ev.clientX;
      p.y = ev.clientY;
      if (p.tx == null && Math.abs(p.x - p.x0) >= p.thr) p.tx = tsOf(ev) - p.t0;   // ── fable32 (build 36) ── (SWIPE36) ── /fable32 ──
    }
  });
  const up = (ev) => {
    const p = touches.get(ev.pointerId);
    if (!p) return;
    touches.delete(ev.pointerId);
    const k = E.d21();
    if (k && k.ph === 'sweep') {
      const w = W();
      E.d21swipe((p.x - p.x0) / w, (p.y - p.y0) / w, p.tx != null ? p.tx : tsOf(ev) - p.t0);
    }
  };
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(type, up);
  // ── fable32 (build 30) ── while he sweeps, walks down and pours, the step card is the one line ("החליקו הילך והילך", "אזנו את המחתה",
  // "צברו את הגחלים"); the hint card's lines and their sources wait for the end (SRC30.deshen); a word of feedback is the line's (E.say30) ── /fable32 ──
  let setHint = (html) => {
      if (hint.__h !== html) {
        hint.__h = html;
        hint.innerHTML = html;
      }
      hint.classList.toggle('on', !!html);
    },
    flashEl = mk('d21-f', ''),
    flash = (text) => {
      if (E.say30 && E.say30(text, 'no', 1.4)) return;
      flashEl.textContent = text;
      flashEl.classList.remove('on');
      flashEl.offsetWidth;
      flashEl.classList.add('on');
    },
    hp = { x: 0, y: 16, z: 0, yaw: 0 },
    handAt = { x: 0, y: 0, z: 0 },
    glowK = 0,
    ashK = 1,
    heatK = 0,
    fireK = 0,
    swipeAt = -9,
    dawnAt = null,
    stickOff = false,
    doneAt = -9,
    pourAt = -9,
    lastPh = '',
    stickUse = null,
    twin = () => {
      try {
        const mods = globalThis.__SHIFT && globalThis.__SHIFT.mods;
        return o.twin || (mods && mods.twin) || null;
      } catch (e) {
        return null;
      }
    },
    setMode = (noStick, on, walk) => {
      const tw = twin();
      if (stickOff !== noStick) {
        stickOff = noStick;
        try {
          if (tw && tw.noStick) tw.noStick(noStick ? true : globalThis.__SH_NOSTICK === true);
        } catch (e) {}
      }
      if (doc.body.__d21 !== on) {
        doc.body.__d21 = on;
        doc.body.classList.toggle('d21-on', on);
      }
      if (tw && !!walk != !!stickUse) {
        stickUse = walk ? (_, v) => E.d21stick(v) : null;
        if (walk) tw.stickUse = stickUse;
        else if (tw.stickUse && tw.stickUse.d21) tw.stickUse = null;
        if (stickUse) stickUse.d21 = 1;
      }
    },
    local = (off) => {
      const fx = Math.sin(hp.yaw),
        fz = Math.cos(hp.yaw),
        rx = -fz,
        rz = fx;
      handAt.x = hp.x + rx * off[0] + fx * off[1];
      handAt.y = hp.y + off[2];
      handAt.z = hp.z + rz * off[0] + fz * off[1];
      return handAt;
    },
    mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k),
    offTick = onTick((tt, dt) => {
      const st = E.st33;
      if (!st) return;
      try {
        T.stages.heroXYZ(hp);
      } catch (e) {}
      const k = E.d21(),
        gate = E.gate21(),
        live = st.phase === 'run' && !st.summary && !st.night,
        show = live && (E.gate20() || gate || !!k),
        dark = show || (live && ((!!E.gate22 && E.gate22()) || (!!E.gate23 && E.gate23()) || (!!E.gate25 && E.gate25()))),
        t = now(),
        ph = k ? k.ph : '';
      if (ph !== lastPh) {
        lastPh = ph;
        if (ph === 'pour') pourAt = t;
      }
      const glowW = dark ? PREDAWN[1] : dawnAt ? PREDAWN[1] * Math.max(0, 1 - (t - dawnAt) / D21.dawn) : 0;
      glowK += (glowW - glowK) * Math.min(1, dt * 4);
      glow.intensity = glowK;
      glow.color.set(PREDAWN[0]);
      const ashW = k ? k.cov / 100 : gate ? 1 : 0,
        heatW = k ? 1 - k.cov / 100 : 0;
      ashK += (ashW - ashK) * Math.min(1, dt * 8);
      heatK += (heatW - heatK) * Math.min(1, dt * 3);
      ashMat.opacity = ashK;
      coalMat.emissiveIntensity = (0.1 + 2.2 * heatK) * (0.9 + 0.1 * Math.sin(t * 7) * Math.sin(t * 3.1));
      bed.visible = show || (dawnAt != null && t - dawnAt < D21.dawn);
      const fireW =
        ph === 'in' || ph === 'sweep' || ph === 'full' ? FIRE_LIGHT.i0 + (FIRE_LIGHT.i1 - FIRE_LIGHT.i0) * heatK : gate && !k ? FIRE_LIGHT.i0 : 0;
      fireK += (fireW - fireK) * Math.min(1, dt * 2);
      const H = hero(),
        holding = live && (gate || (k && ph !== 'end')) && !E.gate20();
      pan.visible = !!(holding && H);
      let pitch = 0.08,
        roll = 0,
        off = POSE_PAN.carry,
        turn = -0.9;
      if (ph === 'in' || ph === 'sweep' || ph === 'full') {
        const u = Math.max(0, Math.min(1, (t - swipeAt) / 0.5)),
          dip = Math.sin(Math.PI * u);
        off = mix(POSE_PAN.low, POSE_PAN.dip, dip);
        pitch = 0.3 + 0.5 * dip;
        turn = 0;
      } else if (ph === 'desc') roll = ((k.a || 0) * Math.PI) / 180;
      else if (ph === 'pour') {
        const u = Math.min(1, (t - pourAt) / (D21.pour * 0.7));
        off = mix(POSE_PAN.carry, POSE_PAN.pour, u);
        pitch = 0.08 + 1.15 * u;
        turn = -0.9 * (1 - u);
      }
      if (H) H.hold21(pan.visible ? local(off) : null);
      if (pan.visible) {
        const at = (H && (H.at('handslotr') || H.at('handr'))) || local(off);
        pan.position.set(at.x, at.y, at.z);
        pan.rotation.set(pitch, hp.yaw + turn, roll);
        const n = Math.round(((k ? k.fill : 0) / 100) * embers.length * (ph === 'pour' ? Math.max(0, 1 - (t - pourAt) / (D21.pour * 0.6)) : 1));
        embers.forEach((m, i) => {
          m.visible = i < n;
          m.scale.setScalar(0.85 + 0.25 * Math.sin(t * 9 + i));
        });
      }
      const walking = ph === 'full' || ph === 'walk' || ph === 'desc';
      setMode(!!k && !walking && ph !== 'foot', !!k && ph !== 'foot', walking);
      const padOn = ph === 'sweep' || walking;
      t40.place(padOn && !!k, ph === 'sweep' ? [{ x: D21.bed.x, y: gy(D21.bed.x, D21.bed.z, 25) + 0.4, z: D21.bed.z, r: 1.6 }] : [{ x: hp.x, y: (hp.y || 16) + 1.0, z: hp.z, r: 1.7, self: true /* ── build 51 ── (the pan in his hands: the object rule keeps build 41's view) */ }]   /* ── fable32 (build 41) ── (r 2.0 round his middle was measured worse — his figure out of the descent's frame 125 of 307 frames at 640 × 296 — back to r 1.7; at 844 × 390 the pad may come after its settle)  (walking down with it: the pan is him with it, his whole figure — build 41's farther follow camera left the pan alone at 29 px, under the 44 px rule; as the zorek's carry) ── /fable32 ── */, ph === 'sweep' ? 'd21' : 'd21pan');   /* (the pan where his hand holds it: POSE_PAN.carry) */   // ── fable32 (build 40) ── ── /fable32 ──
      if (pad.classList.contains('on') !== padOn) {
        pad.classList.toggle('on', padOn);
        if (!padOn) {
          touches.clear();
          E.d21bal(null);
        }
      }
      let touch = null;
      for (const p of touches.values()) {
        touch = p;
        break;
      }
      if (ph === 'desc' || ph === 'walk' || ph === 'full') {
        const b = touch ? Math.max(-1, Math.min(1, (touch.x - touch.x0) / 70)) : null;
        E.d21bal(b);
      }
      {   // ── build 52 ── (the coordinator's build-52 play-test: the walk's line never said how to balance — one hand on the right half at
        // the first walk of the act, side to side, till the right thumb is down or 6 s have gone; touch40's hand hidden meanwhile) ── /build 52 ──
        const wk = ph === 'walk' || ph === 'desc';
        if (ph === 'in' || ph === 'sweep') { walk52.t0 = null; walk52.done = false; }   // (a new act: its first walk again)
        if (wk && walk52.t0 == null) walk52.t0 = tt;
        if (wk && touch) walk52.done = true;
        const on52 = wk && !walk52.done && walk52.t0 != null && tt - walk52.t0 < WALK52.hint;
        if (hand52.classList.contains('on') !== on52) { hand52.classList.toggle('on', on52); doc.body.classList.toggle('d21-h52on', on52); if (on52) stat.hint52 = (stat.hint52 | 0) + 1; }
      }
      const balance = ph === 'walk' || ph === 'desc' || ph === 'full';   // ── build 51 ── (+ 'full': the meter from the moment the pan is full) ── /build 51 ──
      gauge.classList.toggle('on', balance);
      if (balance) {
        needle.style.transform = `rotate(${((k.b || 0) * 90).toFixed(1)}deg)`;
        gauge.classList.toggle('hot', Math.abs(k.b || 0) > 0.65);
        // ── build 51 ── (the inspector's review 27.10: "the coals spilled 4 times and I did not see why — no balance meter on the screen";
        // the coordinator's build-51 brief, item 8) the meter beside the pan itself (in his hands), not in the corner: its tilt and the
        // spill zones at its ends, like the zorek's vessel meter ── /build 51 ──
        const q = proj(hp.x, (hp.y || 16) + 1.0, hp.z), gw = 124, gh = 70, Wd = innerWidth || 844, Hd = innerHeight || 390;
        if (q) { gauge.classList.add('n51'); gauge.style.transform = `translate(${Math.round(Math.max(6, Math.min(Wd - gw - 6, q.x + 46)))}px,${Math.round(Math.max(54, Math.min(Hd - gh - 6, q.y - gh / 2)))}px)`; }
        else gauge.classList.remove('n51');
      }
      {   // ── fable32 (build 36) ── (the inner coals' side while he scoops) ── /fable32 ──
        const sd = ph === 'sweep' && k.side ? k.side[Math.min(k.n | 0, k.side.length - 1)] : 0,
          p = sd ? proj(D21.bed.x, gy(D21.bed.x, D21.bed.z, 25) + 0.1, D21.bed.z) : null;
        inner36.classList.toggle('on', !!p);
        if (p) inner36.style.transform = `translate(${((p.x | 0) + sd * Math.min(110, (innerWidth || 640) * 0.14)) | 0}px,${p.y | 0}px)`;
      }
      const tapOn = ph === 'foot' && !k.near;
      tapRing.classList.toggle('on', tapOn);
      if (tapOn) {
        const p = proj(D21.heap.x, gy(D21.heap.x, D21.heap.z, 16) + 0.3, D21.heap.z);
        if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) tapRing.style.transform = `translate(${Math.max(48, Math.min((innerWidth || 640) - 48, p.x)) | 0}px,${Math.max(48, Math.min((innerHeight || 296) - 48, p.y)) | 0}px)`;   // ── fable32 (build 37) ── (the ring kept on the screen — the naive kid saw it cut at 640 × 296, the heap off the edge: at the edge it points the way) ── /fable32 ──
      }
      setHint('');   // ── fable32 (build 30) ── (were: the swipe, the walk, the pour — each with its source: SRC_SWEEP, SRC_DOWN, SRC_POUR, at the end) ── /fable32 ──
      if (dawnAt != null) {
        const u = Math.min(1, (t - dawnAt) / D21.dawn),
          e = u * u * (3 - 2 * u);
        try {
          T.mixTime('predawn', 'noon', u >= 1 ? 1 : e);
        } catch (e) {}
        if (u >= 1) dawnAt = null;
      }
    }),
    puffs = [],
    lit = false,
    puff = (x, y, z, n, color, k = 1, g = 9, life = 0.8, r = 0.06) => {
      for (let i = 0; i < n; i++) {
        if (puffs.length >= 70) puffs.shift();
        const a = Math.random() * 6.283,
          v = (0.6 + Math.random() * 1.4) * k;
        puffs.push({
          x,
          y,
          z,
          vx: Math.cos(a) * v,
          vy: (1 + Math.random() * 2) * k,
          vz: Math.sin(a) * v,
          t: 0,
          life: life * (0.7 + Math.random() * 0.6),
          c: color,
          g,
          r,
        });
      }
    },
    offDraw = addDrawer(
      null,
      (k, tt, dt) => {
        const st = E.st33;
        if (!st) return;
        const d = E.d21(),
          t = now();
        if (st.paused) dt = 0;
        if (fireK > 0.05 && k.light) {
          const lt = k.light;
          lt.color.set(FIRE_LIGHT.c);
          lt.position.set(FIRE_LIGHT.x, FIRE_LIGHT.y, FIRE_LIGHT.z);
          lt.distance = FIRE_LIGHT.d;
          lt.decay = FIRE_LIGHT.dec;
          lt.intensity = fireK * (0.92 + 0.08 * Math.sin(t * 11) * Math.sin(t * 4.3));
          lit = true;
        } else if (lit && k.light) {
          k.light.color.set('#FFC27A');
          k.light.decay = 1.6;
          lit = false;
        }
        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.t += dt;
          if (p.t >= p.life) {
            puffs.splice(i, 1);
            continue;
          }
          p.vy -= p.g * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          const u = p.t / p.life,
            r = p.g < 0 ? p.r * (1 + 2.5 * u) : p.r * (1 - u * 0.6);
          k.ws(p.x, p.y, p.z, r, r, r, p.c);
        }
        const hy = gy(D21.heap.x, D21.heap.z, 16),
          ph = d ? d.ph : '';
        if (ph === 'foot' || ph === 'go') {
          const s = 1 + 0.07 * Math.sin(tt * 5);
          k.ring(L(D21.heap.x), L(D21.heap.z), L(hy + 0.02), L(s * 0.95), '!#FFD24A', 20);
          k.ring(L(D21.heap.x), L(D21.heap.z), L(hy + 0.03), L(s * 0.6), '!#FFF1B8', 14);
        }
        const today = st.d21day === st.day && st.phase === 'run' && !st.night,
          heap = ph === 'pour' ? Math.min(1, (t - pourAt) / (D21.pour * 0.8)) : today ? 1 : 0;
        if (heap > 0) {
          const hx = D21.heap.x,
            hz = D21.heap.z,
            warm = today ? Math.max(0.3, 1 - (t - doneAt) / 150) : 1;
          k.ws(hx, hy + 0.1 * heap, hz, 0.6 * heap, 0.26 * heap, 0.55 * heap, '#9A948A');
          k.ws(hx + 0.05, hy + 0.22 * heap, hz - 0.04, 0.36 * heap, 0.18 * heap, 0.34 * heap, '#7E786F');
          for (let i = 0; i < 9; i++) {
            const a = i * 2.2,
              r = (0.1 + (i % 3) * 0.14) * heap,
              s = 0.09 + 0.03 * Math.sin(tt * (3 + i) + i);
            k.ws(
              hx + Math.cos(a) * r,
              hy + (0.3 - r * 0.3) * heap,
              hz + Math.sin(a) * r,
              s,
              s * 0.7,
              s,
              warm > 0.6 || i % 2 ? (i % 3 ? '!#FF9A3A' : '!#FFC062') : '!#C86A2A',
            );
          }
          if (today && Math.random() < dt * 1.5 * warm) puff(hx, hy + 0.35, hz, 1, '!#6E6A66', 0.15, -0.5, 2.2, 0.08);
        }
      },
      3,
    ),
    offEv = E.on17((ev) => {
      const type = ev.type,
        H = hero();
      if (type === 'd21' && ev.ph === 'in') snd('ui');
      else if (type === 'd21swipe') {
        if (!ev.ok) {
          snd('soft');
          flash(ev.why === 'outer' ? 'מן הפנימיות — אל הגחלים הלוחשות' /* ── fable32 (build 36) ── */ : ev.why === 'short' ? 'ארוך יותר ↔' : ev.why === 'slow' ? 'מהר יותר ↔' : 'לרוחב ↔');
          if (ev.why === 'short' || ev.why === 'slow') t40.hint51(thr51, 'x');   // ── build 51 ── (the right length on the coals) ── /build 51 ──
          return;
        }
        stat.swipes++;
        swipeAt = now();
        snd('scrape21', { n: ev.n - 1 });
        buzz(150);
        if (H) H.play('PickUp', { once: true, speed: 1.9, restart: true, fade: 0.06 });
        const b = D21.bed,
          y = bed.position.y;
        puff(b.x - 0.4, y + 0.15, b.z, 12, '!#9A958E', 0.9, 2, 0.9, 0.09);
        puff(b.x - 0.5, y + 0.1, b.z, 5, '!#FF8A2E', 0.6, 6, 0.6, 0.05);
      } else if (type === 'd21' && ev.ph === 'full') snd('good');
      else if (type === 'd21' && ev.ph === 'desc') snd('whoosh');
      else if (type === 'd21spill') {
        stat.spills++;
        snd('spill21');
        buzz([60, 40, 90]);
        const p = bowl.getWorldPosition(new THREE.Vector3()),
          x = p.x - Math.cos(hp.yaw) * (ev.a || 1) * 0.3,
          z = p.z + Math.sin(hp.yaw) * (ev.a || 1) * 0.3;
        puff(x, p.y, z, 20, '!#FFB347', 0.8, 7, 0.9, 0.08);
        puff(x, p.y, z, 8, '!#FF8A2E', 0.5, 7, 0.8, 0.1);
        flash('נשפכו גחלים — אזנו');   // ── fable32 (build 30) ── (no points: was "−50 סדר וזריזות") ── /fable32 ──
      } else if (type === 'd21' && ev.ph === 'foot') snd('ui');
      else if (type === 'm22done' || type === 'p25done') dawnAt = now();
      else if (type === 'd21' && ev.ph === 'pour') {
        snd('whoosh');
        if (H) H.play('PickUp', { once: true, speed: 1.1, restart: true, fade: 0.08 });
        const at = ev.at;
        setTimeout(() => {
          puff(at.x, at.y + 0.4, at.z, 14, '!#FFB347', 0.7, 7, 0.7, 0.05);
          puff(at.x, at.y + 0.3, at.z, 10, '!#6E6A66', 0.3, -0.6, 2.4, 0.12);
          snd('spill21');
        }, 380);
      } else if (type === 'd21done') {
        stat.done++;
        doneAt = now();
        if (!E.g22 || (E.lot23 && E.lot23() === 'deshen')) dawnAt = doneAt;
        // ── fable32 (build 30) ── (the end's banner "תרומת הדשן הושלמה! +150 ★ · 3 🪙" is gone: the step card says the rating, end30 the source) ── /fable32 ──
        snd('blast21');
        buzz([90, 70, 90]);
        const at = ev.at;
        puff(at.x, at.y, at.z, 18, '!#FFD66E', 1.1, 6, 0.8, 0.06);
      }
    }),
    api = {
      destroy() {
        t40.destroy();   // ── fable32 (build 40) ── ── /fable32 ──
        offTick();
        offDraw();
        offEv();
        setMode(false, false, false);
        try {
          const H = hero();
          if (H) H.hold21(null);
        } catch (e) {}
        if (scene) scene.remove(bed, pan, glow);
        try { doc.body.classList.remove('d21-h52on'); } catch (e) {}
        for (const el of [pad, hint, gauge, tapRing, doneEl, flashEl, inner36, hand52])
          try {
            el.remove();
          } catch (e) {}
        try {
          if (globalThis.__D21 === api) delete globalThis.__D21;
        } catch (e) {}
      },
      state: () => ({
        ...stat,
        ash: +ashK.toFixed(2),
        glow: +heatK.toFixed(2),
        pan: pan.visible ? [+pan.position.x.toFixed(2), +pan.position.y.toFixed(2), +pan.position.z.toFixed(2), +pan.rotation.z.toFixed(2)] : null,
        dawn: dawnAt != null,
      }),
    };
  try {
    globalThis.__D21 = api;
  } catch (e) {}
  return api;
}
const SRC_SWEEP = '"פנה את הגחלים הילך והילך, חתה מן המאוכלות הפנימיות" — תמיד א, ד · טיוטה';
const SRC_DOWN = '"ויורדין דרך שמאל" — זבחים ו, ג · טיוטה';   // ── fable32 (build 30) ── (the walk's and the pour's lines, named: they show at the end now) ── /fable32 ──
const SRC_POUR = '"צבר את הגחלים על גבי הרצפה" — תמיד א, ד · טיוטה';
reg30('deshen', { chip: SRC_SWEEP, all: [SRC_SWEEP, SRC_DOWN, SRC_POUR] });
const PREDAWN = ['#5A6684', 1.15];
const FIRE_LIGHT = { c: '#FF5500', x: -38, y: 29, z: -3.5, d: 40, dec: 1, i0: 3, i1: 45 };
const POSE_PAN = { carry: [0.72, 0.18, 1.15], low: [0.36, 0.5, 0.78], dip: [0.2, 0.62, 0.32], pour: [0.18, 0.62, 0.62] };
const PAN = { r: 0.42, l: 0.5 };
const CSS = `.d21-in{position:fixed;top:0;bottom:0;left:51%;right:0;z-index:30;touch-action:none;display:none}.d21-in.on,.d21-r.on{display:block}body.d21-on .gm .tw-pad{opacity:0!important;pointer-events:none!important}
.d21-h,.d21-w,.d21-g,.d21-r,.d21-f{position:fixed;left:50%;pointer-events:none;direction:rtl;white-space:nowrap;text-align:center;font:900 16px/1.2 Heebo,system-ui,sans-serif;color:#FFF6DA}
.d21-h{top:58px;transform:translateX(-50%);z-index:32;padding:5px 14px;border-radius:14px;background:#1C140ADB;border:1.5px solid #E2B65A;opacity:0}.d21-h.on,.d21-g.on{opacity:1}.d21-h small,.d21-w small{display:block;font-size:12px;opacity:.85}
.d21-g{bottom:10px;left:auto;right:14px;z-index:31;width:170px;opacity:0;color:#FFE6A0;font-size:13px}.d21-g.n51{left:0;top:0;right:auto;bottom:auto;width:124px;font-size:11px;background:rgba(28,20,10,.55);border-radius:12px;padding:2px 4px}.d21-g.n51 svg{height:56px}.d21-g.hot{animation:d21k .25s infinite}.d21-g svg{width:100%;height:78px;overflow:visible;fill:none;stroke-width:9}
.d21-in36{position:fixed;left:0;top:0;z-index:32;width:86px;height:46px;margin:-23px 0 0 -43px;border-radius:50%;background:radial-gradient(#FFF1B8 0,#FFB347 30%,#FF6A1A88 58%,transparent 72%);box-shadow:0 0 24px 10px #FF8A2E66;display:none;pointer-events:none;animation:d21p .7s infinite alternate}.d21-in36.on{display:block}
.d21-r{left:0;top:0;z-index:33;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;border:4px solid #FFD66E;background:radial-gradient(#FFE6A0E6,#C8923AB3 62%,#5A3A0880);box-shadow:0 0 18px 6px #FFD66E99;font-size:34px;line-height:64px;display:none;pointer-events:none;animation:d21p .8s infinite alternate}
.d21-w{top:38%;transform:translate(-50%,-50%);z-index:37;opacity:0;padding:12px 44px}.d21-w.on{animation:d21w 1.9s forwards}.d21-f{top:47%;transform:translateX(-50%);z-index:34;font-size:22px;color:#FFB04A;text-shadow:0 2px 3px #000;opacity:0}.d21-f.on{animation:d21w 1.2s forwards}.d21-w b{display:block;font-size:40px;color:#FFD66E;-webkit-text-stroke:1.5px #5A3608;text-shadow:0 0 20px #FFB04A}
@keyframes d21p{to{scale:1.14}}@keyframes d21k{50%{translate:3px 0}}@keyframes d21w{0%{opacity:0;scale:.6}14%{opacity:1;scale:1.08}24%{scale:1}82%{opacity:1}to{opacity:0}}
/* ── build 52 ── the right thumb's hint at the first walk: a hand on the right half, side to side (one hand at a time: touch40's hidden) ── /build 52 ── */
.d21-h52{position:fixed;left:74%;top:64%;z-index:32;width:0;height:0;pointer-events:none;opacity:0;transition:opacity .25s}.d21-h52.on{opacity:1}
.d21-h52 i{position:absolute;left:-20px;top:-20px;font:40px/1 "Segoe UI Emoji","Noto Color Emoji",sans-serif;font-style:normal;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55));animation:d21h52 1.3s ease-in-out infinite}
@keyframes d21h52{0%,100%{transform:translateX(-44px)}50%{transform:translateX(44px)}}
body.d21-h52on .t40-hand{opacity:0!important}
@media (prefers-reduced-motion:reduce){.d21-h52 i{animation:none}}`;
const GAUGE =
  '<svg viewBox="-60 -58 120 64"><path stroke="#FFECBE59" d="M-50 0A50 50 0 0 1 50 0"/><path stroke="#8FE07A" d="M-19.1-46.2A50 50 0 0 1 19.1-46.2"/><path stroke="#FF8A3A" d="M-50 0A50 50 0 0 1-47.6-15.5M47.6-15.5A50 50 0 0 1 50 0"/><g class="nd"><line y2="-46" stroke="#FFF6DA" stroke-width="4"/><circle r="6" fill="#E4E8EF"/></g></svg>איזון המחתה';
// ── build 52 ── the walk's hint: its seconds at the act's first walk ── /build 52 ──
export const WALK52 = Object.freeze({ hint: 6 });
