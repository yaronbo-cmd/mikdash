/* ── build 120 ── h120/film.js — the film "ליל שמחת בית השואבה" (brief §8.3): a night in the women's court the player built, directed as
 * a film in the game's own world. Everything here is made at run time and taken away after:
 *   - the night rig: the scene's sun, hemisphere and ambient lights, its fog, background, sky dome, environment light and exposure are
 *     found, saved, set for the night every frame, and restored to the very values found (snap() for the probe's check);
 *   - firelight only: four tall golden candelabra (lathe, a stepped base, a crown of four bowls), layered additive flames, at most six
 *     point lights, none casting shadows;
 *   - silhouettes: the crews' figures in near-black, dancers each with his own tempo, phase and sequence of poses, a torch in the hand
 *     that leaves a fading arc of light; the women on the gallery still, swaying a little;
 *   - film titles in a Hebrew serif low in the picture, letterbox bars, the whole HUD hidden, a dip to black between shots;
 *   - its own sound (h120/filmsound.js), mute respected; hold one second anywhere to skip.
 * The west (the altar, the Heichal) stays dark: no fire west of x 58, no shot looks west.
 */
import { H120, Y, COLS } from './model.js';
import { SH5 } from './world.js';
import { createFilmSound } from './filmsound.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;
// a fixed noise (nothing random at play time): smooth 1D value noise
const hh = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hh(i), hh(i + 1), u); };

const FL = H120.FLOOR;
/** the four candelabra (illustration: their number and height): in the court's middle, east of the gate's line, the west kept dark */
export const MENORAH = [[70, 12], [90, 12], [70, -12], [90, -12]];
const MEN_H = 26;   // the bowls' rim about 26 amot over the court

/* ───────── the night rig: found, set, restored exactly ───────── */
/** look: 'night' (the film) | 'evening' (the planks and the load test: a low warm sun, the shadows long, the sky kept) */
export function nightRig(X, look = 'night') {
  const EVE = look === 'evening';
  const S = X.scene, T = X.THREE, R = (globalThis.__T && globalThis.__T.renderer) || null;
  const L = []; S.traverse((o) => { if (o.isDirectionalLight || o.isHemisphereLight || o.isAmbientLight) L.push(o); });
  const dome = []; S.traverse((o) => { if (o.name === 'sky' && o.isMesh) dome.push(o); });
  const saved = {
    L: L.map((l) => ({ l, i: l.intensity, c: l.color.clone(), g: l.groundColor ? l.groundColor.clone() : null })),
    fog: S.fog ? { c: S.fog.color.clone(), n: S.fog.near, f: S.fog.far, d: S.fog.density } : null,
    bg: S.background, envI: S.environmentIntensity, exp: R ? R.toneMappingExposure : null, dome: dome.map((d) => [d, d.visible]),
  };
  const bg = new T.Color('#03050C'), fogC = new T.Color('#05070F');
  const eveSun = new T.Color('#FF9E58'), eveSky = new T.Color('#A88A80'), eveGnd = new T.Color('#4A3424'), eveFog = new T.Color('#D8A07A');
  // the stars: a fixed field on a far dome (no randomness at play time)
  const N = 1400, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const u = hh(i * 3.1 + 1), v = hh(i * 7.7 + 2), az = u * Math.PI * 2, el = Math.asin(0.08 + 0.92 * v), r = 4200; pos.set([Math.cos(el) * Math.cos(az) * r, Math.sin(el) * r, Math.cos(el) * Math.sin(az) * r], i * 3); }
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pos, 3));
  const stars = new T.Points(sg, new T.PointsMaterial({ color: 0xC8D4F0, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.75, fog: false, depthWrite: false }));
  stars.frustumCulled = false; stars.renderOrder = -10;
  let on = false;
  const api = {
    on() { on = true; if (!EVE) S.add(stars); api.apply(); },
    apply() {
      if (!on) return;
      if (EVE) {
        for (const s of saved.L) {
          if (s.l.isDirectionalLight) { s.l.intensity = s.i * 0.82; s.l.color.copy(s.c).lerp(eveSun, 0.75); }
          else if (s.l.isHemisphereLight) { s.l.intensity = s.i * 0.62; s.l.color.copy(s.c).lerp(eveSky, 0.6); s.l.groundColor.copy(s.g).lerp(eveGnd, 0.6); }
          else s.l.intensity = s.i * 0.6;
        }
        if (S.fog && saved.fog) S.fog.color.copy(saved.fog.c).lerp(eveFog, 0.6);
        if (R && saved.exp != null) R.toneMappingExposure = saved.exp * 0.94;
        return;
      }
      for (const s of saved.L) {
        if (s.l.isDirectionalLight) { s.l.intensity = 0.06; s.l.color.set('#5468A8'); }
        else if (s.l.isHemisphereLight) { s.l.intensity = 0.16; s.l.color.set('#1C2A58'); s.l.groundColor.set('#0A0908'); }
        else { s.l.intensity = s.i * 0.05; }
      }
      if (S.fog) { S.fog.color.copy(fogC); if (S.fog.isFog) { S.fog.near = 90; S.fog.far = 1500; } }
      S.background = bg; S.environmentIntensity = 0.015; if (R) R.toneMappingExposure = 1.05;
      for (const [d] of saved.dome) d.visible = false;
      stars.position.copy(X.camera.position);
    },
    off() {
      if (!on) return; on = false; if (!EVE) S.remove(stars);
      for (const s of saved.L) { s.l.intensity = s.i; s.l.color.copy(s.c); if (s.g) s.l.groundColor.copy(s.g); }
      if (S.fog && saved.fog) { S.fog.color.copy(saved.fog.c); S.fog.near = saved.fog.n; S.fog.far = saved.fog.f; if (saved.fog.d !== undefined) S.fog.density = saved.fog.d; }
      S.background = saved.bg; S.environmentIntensity = saved.envI; if (R && saved.exp != null) R.toneMappingExposure = saved.exp;
      for (const [d, v] of saved.dome) d.visible = v;
    },
    dispose() { sg.dispose(); stars.material.dispose(); },
  };
  return api;
}
/** the values the rig touches, as text (the probe compares before and after) */
export function lightSnap(X) {
  const S = X.scene, R = globalThis.__T && globalThis.__T.renderer, out = [];
  S.traverse((o) => { if (o.isDirectionalLight || o.isHemisphereLight || o.isAmbientLight) out.push([o.type, o.intensity, o.color.getHexString(), o.groundColor ? o.groundColor.getHexString() : '']); });
  const dome = []; S.traverse((o) => { if (o.name === 'sky' && o.isMesh) dome.push(o.visible); });
  return JSON.stringify({ L: out, fog: S.fog ? [S.fog.color.getHexString(), S.fog.near, S.fog.far] : null, bg: S.background ? (S.background.isColor ? S.background.getHexString() : S.background.uuid) : null, envI: S.environmentIntensity, exp: R ? R.toneMappingExposure : null, dome });
}

/* ───────── textures ───────── */
function canvasTex(T, w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; }
function flameTex(T) {
  return canvasTex(T, 128, 256, (g, w, h) => {
    // a soft teardrop (blurred: no hard edge reads at any size): hot white at the root, yellow, orange to a smoky tip
    g.filter = 'blur(9px)';
    const gr = g.createRadialGradient(w / 2, h * 0.8, 3, w / 2, h * 0.62, h * 0.52);
    gr.addColorStop(0, 'rgba(255,250,228,1)'); gr.addColorStop(0.22, 'rgba(255,216,128,0.9)'); gr.addColorStop(0.55, 'rgba(255,132,36,0.45)'); gr.addColorStop(1, 'rgba(150,36,0,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(w / 2, 22);
    g.bezierCurveTo(w * 0.72, h * 0.42, w * 0.86, h * 0.68, w / 2, h - 22); g.bezierCurveTo(w * 0.14, h * 0.68, w * 0.28, h * 0.42, w / 2, 22); g.fill();
  });
}
function glowTex(T) { return canvasTex(T, 64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(0.3, 'rgba(255,150,60,0.45)'); gr.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); }); }

/* ───────── the candelabrum: a stepped base, a shaft with knops, a capital, four arms to four bowls ───────── */
function candelabrum(T, gold, x, z) {
  const g = new T.Group(); g.position.set(x, FL, z);
  const P = [[0, 0], [2.3, 0], [2.3, 0.45], [1.85, 0.5], [1.85, 0.95], [1.35, 1.0], [1.35, 1.45], [0.8, 1.6], [0.5, 2.2], [0.42, 3.0]];
  // the shaft with knops every few amot, a capital flaring to the crown
  for (let y = 3.0; y < MEN_H - 3.2; y += 4.2) P.push([0.36, y + 0.4], [0.62, y + 1.0], [0.66, y + 1.25], [0.62, y + 1.5], [0.36, y + 2.1]);
  P.push([0.36, MEN_H - 3.0], [0.75, MEN_H - 2.2], [0.95, MEN_H - 1.8], [0.5, MEN_H - 1.6], [0.0, MEN_H - 1.55]);
  const shaft = new T.Mesh(new T.LatheGeometry(P.map(([r, y]) => new T.Vector2(r, y)), 40), gold); g.add(shaft);
  const bowls = [];
  const cup = new T.LatheGeometry([[0, 0], [0.35, 0.02], [0.75, 0.25], [0.95, 0.6], [1.0, 0.75], [0.92, 0.75], [0.85, 0.62], [0.6, 0.35], [0, 0.3]].map(([r, y]) => new T.Vector2(r, y)), 32);
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4, bx = Math.cos(a) * 2.0, bz = Math.sin(a) * 2.0;
    // the arm: from the capital out and up to the bowl's foot
    const C = new T.QuadraticBezierCurve3(new T.Vector3(0, MEN_H - 1.9, 0), new T.Vector3(bx * 0.9, MEN_H - 1.9, bz * 0.9), new T.Vector3(bx, MEN_H - 0.8, bz));
    g.add(new T.Mesh(new T.TubeGeometry(C, 12, 0.16, 8, false), gold));
    const b = new T.Mesh(cup, gold); b.position.set(bx, MEN_H - 0.8, bz); g.add(b);
    bowls.push(new T.Vector3(x + bx, FL + MEN_H, z + bz));
  }
  // a ladder leaning on it (the young priests climbed with the oil: a picture, no words)
  const lad = new T.Group(), dark = new T.MeshBasicMaterial({ color: 0x0B0806 });
  for (const s of [-0.45, 0.45]) { const r = new T.Mesh(new T.BoxGeometry(0.12, MEN_H - 1.5, 0.12), dark); r.position.set(s, (MEN_H - 1.5) / 2, 0); lad.add(r); }
  for (let y = 0.8; y < MEN_H - 2; y += 1.0) { const r = new T.Mesh(new T.BoxGeometry(0.9, 0.08, 0.08), dark); r.position.set(0, y, 0); lad.add(r); }
  lad.position.set(2.6, 0, 0.6); lad.rotation.z = 0.1; g.add(lad);
  return { g, bowls, top: new T.Vector3(x, FL + MEN_H, z) };
}

/* ───────── flames: three additive layers a bowl, each its own noise ───────── */
function flames(T, bowls, ftex, gtex) {
  const g = new T.Group(), L = [];
  bowls.forEach((p, i) => {
    const layers = [['#FFF2C8', 0.55, 1.5], ['#FFB040', 0.95, 2.4], ['#FF6A18', 1.35, 3.1]].map(([c, w, h], k) => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: ftex, color: c, blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9 - k * 0.2, fog: false }));
      s.center.set(0.5, 0.06); g.add(s); return { s, w, h, k };
    });
    const halo = new T.Sprite(new T.SpriteMaterial({ map: gtex, color: '#FFB866', blending: T.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.55, fog: false })); g.add(halo);
    L.push({ p, layers, halo, ph: i * 1.618 + 0.3, on: 0 });
  });
  return {
    g, L,
    frame(t, cam) {
      for (const f of L) {
        const k = f.on; f.halo.visible = k > 0.01;
        for (const y of f.layers) {
          const n1 = noise(t * (2.1 + y.k * 0.7) + f.ph * 9 + y.k * 13), n2 = noise(t * 5.3 + f.ph * 3 + y.k * 7);
          const h = y.h * k * (0.8 + 0.45 * n1), w = y.w * k * (0.85 + 0.3 * n2);
          y.s.visible = k > 0.01; y.s.scale.set(Math.max(0.01, w), Math.max(0.01, h), 1);
          y.s.position.set(f.p.x + (n2 - 0.5) * 0.18 * y.k, f.p.y - 0.05, f.p.z + (n1 - 0.5) * 0.18 * y.k);
        }
        const cd = cam ? cam.position.distanceTo(f.p) : 40, near = clamp((cd - 4) / 26, 0.18, 1), hs = 6.0 * k * near * (0.9 + 0.2 * noise(t * 3 + f.ph)); f.halo.scale.set(hs, hs, 1); f.halo.material.opacity = 0.5 * near; f.halo.position.set(f.p.x, f.p.y + 1.0, f.p.z);
      }
    },
  };
}

/* ───────── torches' arcs: the last points of every torch, drawn as soft points that fade along the trail ───────── */
function arcs(T, n, len, gtex) {
  const N = n * len, pos = new Float32Array(N * 3), al = new Float32Array(N), sz = new Float32Array(N);
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aA', new T.BufferAttribute(al, 1)); g.setAttribute('aS', new T.BufferAttribute(sz, 1));
  const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uMap: { value: gtex }, uPx: { value: 600 } },
    vertexShader: 'attribute float aA, aS; varying float vA; uniform float uPx; void main(){ vA = aA * (aS > 12.0 ? 0.32 : 1.0); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aS * uPx / max(1.0, -mv.z); }',
    fragmentShader: 'uniform sampler2D uMap; varying float vA; void main(){ vec4 c = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(c.rgb * vec3(1.0, 0.86, 0.6) * vA * 1.6, c.a * vA); }' });
  const pts = new T.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 8;
  const H = Array.from({ length: n }, () => []);
  return {
    pts, m,
    push(i, v) { const h = H[i]; const l = h[h.length - 1]; if (l && l.distanceToSquared(v) < 0.0025) return; if (l) { const d = l.distanceTo(v), k = Math.min(14, Math.floor(d / 0.05)); for (let j = 1; j < k; j++) h.push(l.clone().lerp(v, j / k)); } h.push(v.clone()); while (h.length > len) h.shift(); },
    clear() { for (const h of H) h.length = 0; },
    frame(px) {
      m.uniforms.uPx.value = px;
      for (let i = 0; i < n; i++) { const h = H[i]; for (let j = 0; j < len; j++) { const o = i * len + j, q = h[h.length - 1 - j]; if (q) { pos.set([q.x, q.y, q.z], o * 3); const u = j / len; al[o] = j === 0 ? 1 : (1 - u) * (1 - u) * 0.55; sz[o] = j === 0 ? 1.4 : 0.42 * (1 - u * 0.5); } else al[o] = 0; } }
      g.attributes.position.needsUpdate = true; g.attributes.aA.needsUpdate = true; g.attributes.aS.needsUpdate = true;
    },
  };
}

/* ───────── the film's overlay: bars, titles, the dip, the skip ───────── */
function overlay() {
  const st = document.createElement('style');
  st.textContent = `body.h120-film *{visibility:hidden!important}body.h120-film canvas,body.h120-film .h120f,body.h120-film .h120f *{visibility:visible!important}
.h120f{position:fixed;inset:0;pointer-events:none;z-index:2147483000;direction:rtl}
.h120f .bar{position:absolute;left:0;right:0;background:#000}
.h120f .dip{position:absolute;inset:0;background:#000;opacity:1;transition:opacity .5s ease}
.h120f .card{position:absolute;left:0;right:0;text-align:center;color:#D9C8A6;font:400 15px/1.2 "Frank Ruhl Libre","David","Times New Roman",serif;letter-spacing:.04em;opacity:0;transition:opacity .6s ease}
.h120f .ttl{position:absolute;left:8%;right:8%;text-align:center;color:#F4E6C8;opacity:0;transition:opacity .6s ease;text-shadow:0 1px 8px rgba(0,0,0,.85)}
.h120f .ttl b{display:block;font:400 26px/1.35 "Frank Ruhl Libre","David","Times New Roman",serif}
.h120f .ttl small{display:block;margin-top:6px;font:400 14px/1.2 "Frank Ruhl Libre","David","Times New Roman",serif;color:#BFAE8C}
.h120f .ttl.big b{font-size:34px}
.h120f .skip{position:absolute;left:0;right:0;text-align:center;color:rgba(230,215,185,.45);font:400 13px/1 "Frank Ruhl Libre","David",serif;opacity:0;transition:opacity 1s}
.h120f .end{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);padding:16px 26px;border-radius:14px;background:rgba(255,248,230,.94);color:#4A3008;text-align:center;opacity:0;transition:opacity .8s;box-shadow:0 6px 24px rgba(0,0,0,.3)}
.h120f .end b{display:block;font:900 24px/1.2 Heebo,system-ui}.h120f .end small{display:block;margin-top:8px;font:700 14px/1.3 Heebo,system-ui;color:#7A5A2A;max-width:70vw}
.h120f .again{position:absolute;left:50%;bottom:16%;transform:translateX(-50%);padding:12px 22px;border-radius:24px;background:rgba(0,0,0,.6);color:#F4E6C8;font:400 18px/1 "Frank Ruhl Libre","David",serif;opacity:0;transition:opacity .6s;pointer-events:auto}`;
  document.head.appendChild(st);
  const root = document.createElement('div'); root.className = 'h120f';
  root.innerHTML = '<div class="bar t"></div><div class="bar b"></div><div class="dip"></div><div class="card"></div><div class="ttl"><b></b><small></small></div><div class="skip">החזק לדילוג</div><div class="end"><b></b><small></small></div><div class="again">הקש לצפייה חוזרת</div>';
  document.body.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const layout = () => { const W = innerWidth, H = innerHeight, bh = Math.max(0, (H - W / 2.35) / 2); $('.bar.t').style.cssText = `top:0;height:${bh}px`; $('.bar.b').style.cssText = `bottom:0;height:${bh}px`; $('.card').style.top = Math.max(6, bh / 2 - 9) + 'px'; $('.ttl').style.bottom = (bh + H * 0.06) + 'px'; $('.skip').style.bottom = Math.max(6, bh / 2 - 7) + 'px'; return bh; };
  layout(); addEventListener('resize', layout);
  return {
    root, layout,
    dip(on) { $('.dip').style.opacity = on ? '1' : '0'; },
    card(t) { $('.card').textContent = t || ''; $('.card').style.opacity = t ? '1' : '0'; },
    title(line, src, big) { const e = $('.ttl'); if (line) { e.querySelector('b').textContent = line; e.querySelector('small').textContent = src || ''; e.classList.toggle('big', !!big); } e.style.opacity = line ? '1' : '0'; },
    skipHint(on) { $('.skip').style.opacity = on ? '1' : '0'; },
    bars(on) { for (const b of root.querySelectorAll('.bar')) b.style.display = on ? '' : 'none'; },
    end(t, s) { const e = $('.end'); e.querySelector('b').textContent = t || ''; e.querySelector('small').textContent = s || ''; e.style.opacity = t ? '1' : '0'; },
    again(on) { $('.again').style.opacity = on ? '1' : '0'; },
    remove() { removeEventListener('resize', layout); root.remove(); st.remove(); document.body.classList.remove('h120-film'); },
  };
}

/* ───────── the film ───────── */
export const SHOTS = [
  { n: 1, d: 7.0, line: 'במוצאי יום טוב הראשון של חג ירדו לעזרת נשים ומתקנין שם תקון גדול', src: 'סוכה ה, ב' },
  { n: 2, d: 6.0, line: 'ומנורות של זהב היו שם וארבעה ספלים של זהב בראשיהן', src: 'סוכה ה, ב' },
  { n: 3, d: 7.0 },
  { n: 4, d: 7.0, line: 'חסידים ואנשי מעשה היו מרקדים לפניהם באבוקות של אור שבידיהן', src: 'סוכה ה, ד' },
  { n: 5, d: 6.0, line: 'שהנשים רואות מלמעלן, והאנשים מלמטן', src: 'מדות ב, ה' },
  { n: 6, d: 8.0, line: 'ולא הייתה חצר בירושלים שאינה מאירה מאור בית השואבה', src: 'סוכה ה, ג' },
  { n: 7, d: 6.0, line: 'כל מי שלא ראה שמחת בית השואבה לא ראה שמחה מימיו', src: 'סוכה ה, א', big: true },
];

/**
 * createFilm(X) → { play(): Promise (resolves when the film ends or is skipped, everything restored), frame(dt), state }.
 * X: the director's handle (scene, camera, THREE, actors, wait, sfx).
 */
export function createFilm(X, opt = {}) {
  const T = X.THREE, S = X.scene, A = X.actors ? X.actors() : null;
  const F = { t: 0, shot: 0, skip: false, holdT: null, live: false, figs: [], dancers: [], women: [], arcs: null, lights: [], menorahs: [], fl: null, city: null, tool: null };
  let rig = null, ov = null, snd = null, group = null, gold = null, ftex = null, gtex = null;
  const V = new T.Vector3();

  function build() {
    group = new T.Group(); group.name = 'h120-film'; S.add(group);
    gold = new T.MeshStandardMaterial({ color: '#D6A43C', metalness: 0.9, roughness: 0.28, emissive: '#2A1604', emissiveIntensity: 0.6 });
    ftex = flameTex(T); gtex = glowTex(T);
    for (const [x, z] of MENORAH) { const m = candelabrum(T, gold, x, z); group.add(m.g); F.menorahs.push(m); }
    F.fl = flames(T, F.menorahs.flatMap((m) => m.bowls), ftex, gtex); group.add(F.fl.g);
    // the lights: one a candelabrum (high, wide), one with the dancers' torches, one for the shot (a brand, a torch climbing)
    for (const m of F.menorahs) { const l = new T.PointLight('#FF9A48', 0, 5, 1.6); l.castShadow = false; l.position.copy(m.top).add(new T.Vector3(0, 4.0, 0)); group.add(l); F.lights.push(l); }
    F.torchL = new T.PointLight('#FF8A38', 0, 34, 1.7); F.torchL.castShadow = false; group.add(F.torchL);
    F.shotL = new T.PointLight('#FFA050', 0, 18, 1.8); F.shotL.castShadow = false; group.add(F.shotL);
    F.arcs = arcs(T, 16, 110, gtex); group.add(F.arcs.pts);
    F.brand = new T.Sprite(new T.SpriteMaterial({ map: ftex, color: '#FFD08A', blending: T.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); F.brand.center.set(0.5, 0.1); F.brand.visible = false; group.add(F.brand);
    people(); cityGlow();
  }
  // a figure in near-black (the crews' own figures, their colours taken for the night)
  function fig(variant, x, z, o = {}) {
    if (!A) return null;
    const a = A.add(variant, x, z, { yaw: o.yaw || 0, col: '#0A0908', col2: '#0A0908', y: o.y, scale: o.scale });
    a.col.set('#0B0A09'); a.col2.set('#0B0A09'); a.shade = 0.18 + (o.k || 0) * 0.04; a.vis = 1; a.visT = 1;
    if (o.item) A.setItem(a, o.item);
    F.figs.push(a); return a;
  }
  function people() {
    // the dancers: between the candelabra, each his own circle, tempo, phase and order of poses
    const N = 14;
    for (let i = 0; i < N; i++) {
      const cx = 80 + (hh(i * 2.3) - 0.5) * 20, cz = (hh(i * 5.1) - 0.5) * 14, r = 1.2 + hh(i * 1.7) * 2.2;
      const a = fig(i % 3 === 1 ? 'levite' : 'pilgrim', cx, cz, { item: 'torch', k: i % 3 });
      if (!a) continue;
      const seq = [0, 1, 2, 3, 4].sort((p, q) => hh(i * 11 + p) - hh(i * 11 + q));
      F.dancers.push({ a, i, cx, cz, r, tempo: 0.55 + hh(i * 3.3) * 0.6, ph: hh(i * 9.1) * 10, dir: hh(i * 4.4) < 0.5 ? 1 : -1, seq, spin: 0 });
    }
    // the women on the south and north galleries: still, long garments, a slight sway
    for (const side of [1, -1]) for (let k = 0; k < 16; k++) {
      const x = 49 + k * 3.2 + hh(k * 3 + side) * 1.2, z = side * (63.6 + hh(k * 5 + side) * 1.4);
      const a = fig('woman', x, z, { y: Y.GFLOOR, yaw: side > 0 ? Math.PI : 0, k: 1 }); if (a) F.women.push({ a, ph: hh(k * 7 + side) * 6 });
    }
    // the planks' men on the south gallery (shot 1), the brand's man on the ladder (shot 2), the torch climbing by S2 (shot 3)
    F.plankers = [0, 1, 2].map((k) => fig('levite', 60 + k * 3.4, 63.2 + (k % 2) * 1.2, { y: Y.GFLOOR, yaw: Math.PI * 0.5 + k, item: k === 1 ? 'log' : null }));
    const m0 = F.menorahs[0]; F.lighter = fig('levite', m0.top.x + 2.6, m0.top.z + 1.1, { y: FL + MEN_H - 4.2, yaw: -Math.PI / 2 });
    F.climber = fig('levite', COLS.S2.x + 1.6, COLS.S2.z - 1.55, { y: FL, yaw: 0, item: 'torch' });
    { const dark = new T.MeshBasicMaterial({ color: 0x0A0806 }), lad = new T.Group(), L = Y.GFLOOR - FL + 0.6;
      for (const sx of [-0.42, 0.42]) { const r = new T.Mesh(new T.BoxGeometry(0.11, L, 0.11), dark); r.position.set(sx, L / 2, 0); lad.add(r); }
      for (let y = 0.7; y < L - 0.3; y += 0.9) { const r = new T.Mesh(new T.BoxGeometry(0.84, 0.07, 0.07), dark); r.position.set(0, y, 0); lad.add(r); }
      lad.position.set(COLS.S2.x + 1.6, FL, COLS.S2.z - 1.2); lad.rotation.x = 0.07; group.add(lad); }
    // two near shoulders on the gallery for shot 5 (at the frame's edges)
    F.near = [fig('woman', 58.4, 62.5, { y: Y.GFLOOR, yaw: Math.PI + 0.35 }), fig('woman', 67.2, 62.6, { y: Y.GFLOOR, yaw: Math.PI - 0.3 })];
    for (const a of F.figs) if (a) a.fixedY = a.y;
  }
  // the city: warm courtyard glows on the houses south-west of the Mount, lit in a wave from the Mount
  function cityGlow() {
    const P = [];
    S.traverse((o) => {
      if (!o.isInstancedMesh || P.length > 6000) return;
      let p = o, isCity = false; while (p) { if (/city/i.test(p.name || '')) { isCity = true; break; } p = p.parent; } if (!isCity) return;
      const M4 = new T.Matrix4(), v = new T.Vector3(); o.updateMatrixWorld(true);
      for (let i = 0; i < o.count; i += 3) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (v.z > 120 || v.x < -40) P.push(v.clone()); }
    });
    if (!P.length) return;
    // a courtyard glow a house, ordered by distance from the Mount (73, 0)
    P.sort((p, q) => Math.hypot(p.x - 73, p.z) - Math.hypot(q.x - 73, q.z));
    const U = P.filter((p, i) => i % Math.max(1, Math.floor(P.length / 1600)) === 0).slice(0, 1600);
    const pos = new Float32Array(U.length * 3), d = new Float32Array(U.length), al = new Float32Array(U.length), sz = new Float32Array(U.length);
    const d0 = Math.hypot(U[0].x - 73, U[0].z), d1 = Math.hypot(U[U.length - 1].x - 73, U[U.length - 1].z);
    U.forEach((p, i) => { pos.set([p.x, p.y + 7, p.z], i * 3); d[i] = (Math.hypot(p.x - 73, p.z) - d0) / Math.max(1, d1 - d0); sz[i] = (i % 5 === 0 ? 16 + hh(i) * 14 : 3.5 + hh(i) * 5); });   // most a small lamp; one in five the wider glow of a lit courtyard
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aA', new T.BufferAttribute(al, 1)); g.setAttribute('aS', new T.BufferAttribute(sz, 1));
    const m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uMap: { value: gtex }, uPx: { value: 600 } },
      vertexShader: 'attribute float aA, aS; varying float vA; uniform float uPx; void main(){ vA = aA * (aS > 12.0 ? 0.32 : 1.0); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aS * uPx / max(1.0, -mv.z); }',
      fragmentShader: 'uniform sampler2D uMap; varying float vA; void main(){ vec4 c = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(c.rgb * vec3(1.0, 0.8, 0.5) * vA * 1.3, c.a * vA); }' });
    const pts = new T.Points(g, m); pts.frustumCulled = false; group.add(pts);
    F.city = { pts, m, d, al, g, k: 0, n: U.length };
  }

  /* the dance: each dancer moves through his own order of five poses (torch high, turn, leap, bow, sway), blended, at his own tempo */
  const POSE = [
    { arm: [0.3, 0.2, 2.7, 0.25], bow: -0.08, kn: 0.1, lift: 0 },     // torch high
    { arm: [1.2, 0.6, 2.2, 0.5], bow: 0.0, kn: 0.25, lift: 0, turn: 1 }, // turn
    { arm: [2.2, 0.4, 2.6, 0.35], bow: -0.12, kn: 0.05, lift: 0.55 },  // leap
    { arm: [0.6, 0.1, 1.2, 0.1], bow: 0.45, kn: 0.35, lift: 0 },       // bow
    { arm: [1.6, 0.7, 1.9, 0.6], bow: 0.05, kn: 0.18, lift: 0.1 },     // sway, arms wide
  ];
  function dance(dt) {
    for (const D of F.dancers) {
      const a = D.a, t = F.t * D.tempo + D.ph, k = Math.floor(t), u = t - k, P0 = POSE[D.seq[k % 5]], P1 = POSE[D.seq[(k + 1) % 5]], e = ease(u);
      for (let j = 0; j < 4; j++) a.arm[j] = a.armT[j] = lerp(P0.arm[j], P1.arm[j], e) + 0.12 * Math.sin(F.t * 3.1 * D.tempo + j + D.ph);
      a.bow = a.bowT = lerp(P0.bow, P1.bow, e); a.kn = a.knT = lerp(P0.kn, P1.kn, e);
      const lift = lerp(P0.lift, P1.lift, e) * Math.sin(u * Math.PI);
      D.spin += dt * D.dir * (0.6 + (P0.turn ? 2.4 * Math.sin(u * Math.PI) : 0)) * D.tempo;
      const ang = D.ph + F.t * 0.22 * D.dir * D.tempo;
      a.x = D.cx + Math.cos(ang) * D.r; a.z = D.cz + Math.sin(ang) * D.r; a.yaw = D.spin;
      a.y = a.fixedY = FL + Math.max(0, lift);
      if (A.handWorld) { A.handWorld(a, -1, V); V.y += 0.85; F.arcs.push(D.i, V); }
    }
    // the torches' light: in the middle of them, flickering
    if (F.dancers.length) { let x = 0, z = 0; for (const D of F.dancers) { x += D.a.x; z += D.a.z; } F.torchL.position.set(x / F.dancers.length, FL + 4, z / F.dancers.length); }
    F.torchL.intensity = F.danceOn * (55 + 25 * noise(F.t * 6.3));
    for (const W of F.women) { const a = W.a; a.bow = a.bowT = 0.03 + 0.03 * Math.sin(F.t * 0.7 + W.ph); a.yaw += Math.sin(F.t * 0.5 + W.ph) * 0.0009; }
  }

  /* the camera: one eased move a shot (no orbit, no shake) */
  function move(p0, t0, p1, t1, d) { X.shot(p0, t0, 0.01); setTimeout(() => {}, 0); F.mv = { p0, t0, p1, t1, d, s: F.t }; }
  function camFrame() {
    const m = F.mv; if (!m) return; const u = ease(clamp((F.t - m.s) / m.d, 0, 1));
    const p = [0, 1, 2].map((i) => lerp(m.p0[i], m.p1[i], u)), t = [0, 1, 2].map((i) => lerp(m.t0[i], m.t1[i], u));
    X.shot(p, t, 0.01);
  }

  async function wait(s) { const end = F.t + s; while (F.t < end && !F.skip) await X.wait(0.05); }
  async function dipTo(fn) { ov.dip(true); ov.title(''); await wait(0.5); if (F.skip) return; fn(); await wait(0.15); ov.dip(false); }
  const titleAt = async (sh, at = 1.0) => { await wait(at); if (sh.line && !F.skip) ov.title(sh.line, sh.src, sh.big); };

  async function shots() {
    // (the women come up to the gallery once the fire is lit: shots 1 and 2 show the planks and the men who laid them)
    const womenOn = (v) => { for (const W of F.women) { W.a.vis = W.a.visT = v; } for (const a of F.near || []) if (a) a.vis = a.visT = v; };
    womenOn(0);
    const lights = (k, range) => { F.lights.forEach((l, i) => { l.intensity = k * (110 + 40 * noise(F.t * 4 + i)); l.distance = range; }); };
    // 1 · black, the planks knock four times; then barely light: the planks laid on the south gallery against the deep sky
    ov.dip(true); ov.card('הצצה קדימה · ליל שמחת בית השואבה');
    for (let i = 0; i < 4 && !F.skip; i++) { snd.knock(); await wait(0.5); }
    await dipTo(() => { F.shot = 1; move([73, 7.5, 30], [62, 17.4, 62.5], [70, 8.2, 36], [62, 17.6, 62.5], SHOTS[0].d); F.fl.L.forEach((f) => { f.on = 0; }); lights(0, 5); F.danceOn = 0; F.shotL.intensity = 18; F.shotL.position.set(62, Y.GFLOOR + 1.6, 63); F.shotL.distance = 14; });
    ov.card(''); await titleAt(SHOTS[0], 0.8); await wait(SHOTS[0].d - 0.8);
    // 2 · close on a bowl: an arm with a brand from the ladder, the fire catches and the light grows over the stone
    const m0 = F.menorahs[0], b0 = m0.bowls[0];
    await dipTo(() => { F.shot = 2; move([b0.x - 5.6, b0.y - 5.8, b0.z - 2.4], [b0.x + 0.4, b0.y + 0.2, b0.z + 0.2], [b0.x - 4.8, b0.y - 5.0, b0.z - 2.0], [b0.x + 0.4, b0.y + 0.6, b0.z + 0.2], SHOTS[1].d); F.shotL.intensity = 0; F.brand.visible = true; F.lightUp = F.t + 1.6; });
    await titleAt(SHOTS[1], 1.2); await wait(SHOTS[1].d - 1.2);
    F.brand.visible = false; F.lightUp = null; F.fl.L.forEach((f) => { f.on = 1; }); lights(1, 66); F.danceOn = 1;
    // 3 · the light finds what he built: along the south side, the firelight climbing his column S2 and his beam, the gallery full above
    await dipTo(() => { womenOn(1); for (const a of F.plankers || []) if (a) a.vis = a.visT = 0; F.shot = 3; move([79, 8.4, 46.5], [68, 12.8, 62.5], [76.5, 10.2, 48.0], [68, 17.6, 62.5], SHOTS[2].d); F.climb = F.t; });
    await wait(SHOTS[2].d);
    F.climb = null; F.shotL.intensity = 0;
    // 4 · below: the dancers between the camera and the fire, the torches drawing arcs
    await dipTo(() => { F.shot = 4; move([77, 8.6, -36], [80, 11.5, 10], [81, 9.4, -32], [80, 15.5, 10], SHOTS[3].d); snd.murmur(0.6); });
    await titleAt(SHOTS[3], 1.0); await wait(SHOTS[3].d - 1.0);
    // 5 · from the gallery: the railing near, two shoulders at the edges, the fire and the dancers below
    await dipTo(() => { F.shot = 5; move([62.6, 21.2, 66.9], [78, 17.5, 8], [62.9, 21.1, 66.3], [80, 16.5, 8], SHOTS[4].d); snd.murmur(0.85); });
    await titleAt(SHOTS[4], 0.9); await wait(SHOTS[4].d - 0.9);
    // 6 · Jerusalem: from behind the court, over its fires, the camera rises until it looks south over the dark city; courtyards light up in a wave
    await dipTo(() => { F.shot = 6; move([104, 48, -125], [62, -34, 280], [92, 205, -70], [30, -60, 800], SHOTS[5].d); F.cityOn = F.t + 3.2; snd.murmur(1); });
    await titleAt(SHOTS[5], 1.4); await wait(SHOTS[5].d - 1.4);
    // 7 · the glowing court from high, held; the last line, larger
    await dipTo(() => { F.shot = 7; move([140, 120, 150], [80, 6, 0], [138, 112, 146], [80, 6, 0], SHOTS[6].d + 2.5); snd.murmur(0.5); });
    await titleAt(SHOTS[6], 0.8); await wait(SHOTS[6].d + 1.7);
  }

  function frame(dt) {
    if (!F.live) return;
    F.t += dt; rig.apply(); for (const h of F.hid || []) { h[0].vis = 0; h[0].visT = 0; }
    camFrame(); dance(dt); F.fl.frame(F.t, X.camera);
    const px = innerHeight / (2 * Math.tan((X.camera.fov * Math.PI / 180) / 2));
    F.arcs.frame(px);
    // the brand reaching to the bowl (shot 2): the fire catches at lightUp, its light grows 5 → 140 over three seconds
    if (F.shot === 2 && F.lighter) {
      const b0 = F.menorahs[0].bowls[0], k = F.lightUp ? clamp((F.t - (F.lightUp - 1.6)) / 1.6, 0, 1) : 0, a = F.lighter;
      a.arm[2] = a.armT[2] = lerp(1.2, 2.3, ease(k)); a.arm[3] = a.armT[3] = 0.3;
      if (A.handWorld) { A.handWorld(a, -1, V); F.brand.position.copy(V); } F.brand.scale.set(0.5 + 0.1 * noise(F.t * 9), 1.0 + 0.2 * noise(F.t * 7), 1);
      if (F.lightUp && F.t >= F.lightUp) { const g = clamp((F.t - F.lightUp) / 3, 0, 1); F.fl.L[0].on = ease(Math.min(1, g * 3)); const l = F.lights[0]; l.intensity = 45 * ease(Math.min(1, g * 2)); l.distance = lerp(5, 66, ease(g)); }
      // (the brand's own small light before the fire catches: the gold of the bowl answers it)
      if (!F.lightUp || F.t < F.lightUp + 0.4) { F.shotL.position.copy(F.brand.position); F.shotL.intensity = 7 + 2 * noise(F.t * 8); F.shotL.distance = 9; } else F.shotL.intensity = Math.max(0, F.shotL.intensity - 0.3);
    }
    // a torch climbing by his column S2 (shot 3): the light rises from the court floor to his beam
    if (F.climb != null && F.climber) { const u = ease(clamp((F.t - F.climb) / 6, 0, 1)), a = F.climber; a.y = a.fixedY = lerp(FL, Y.COL_TOP - 3.2, u); a.arm[2] = a.armT[2] = 2.4; if (A.handWorld) { A.handWorld(a, -1, V); F.shotL.position.copy(V).add(new T.Vector3(0, 0.9, -0.6)); } F.shotL.intensity = 16 + 6 * noise(F.t * 7); F.shotL.distance = 13; }
    if (F.shot === 1) F.shotL.intensity = 14 + 6 * noise(F.t * 5);
    // the candelabra's flicker
    if (F.shot >= 3) F.lights.forEach((l, i) => { l.intensity = 110 + 40 * noise(F.t * 4 + i * 3); });
    // the city's courtyards (shot 6 on)
    if (F.city) { const C = F.city, w = F.cityOn != null ? clamp((F.t - F.cityOn) / 5.5, 0, 1.2) : 0; for (let i = 0; i < C.n; i++) C.al[i] = clamp((w - C.d[i]) * 6, 0, 1) * (0.75 + 0.25 * noise(F.t * 2 + i)); C.g.attributes.aA.needsUpdate = true; C.m.uniforms.uPx.value = px; }
    // the skip: one second's hold anywhere
    if (F.holdT != null && performance.now() - F.holdT > 1000) F.skip = true;
    ov.skipHint(F.t > 3 && F.t < 9);
    if (snd) snd.frame(dt);
  }
  const down = (e) => { F.holdT = performance.now(); e.stopPropagation(); };
  const up = (e) => { F.holdT = null; e.stopPropagation(); };

  /** the world's own people (the crews, the crowd, the player's figure) out of the film; back as they were after */
  function worldPeople(off) {
    if (off) {
      F.hid = []; for (const a of (A && A.list) || []) if (!F.figs.includes(a)) { F.hid.push([a, a.vis, a.visT]); a.vis = 0; a.visT = 0; }
      try { const c = X.stages.crowd; if (c && c.setEnabled) { c.setEnabled(false); F.crowdOff = true; } } catch (e) { /* */ }
      try { if (X.hero && X.hero.show) { X.hero.show(false); F.heroOff = true; } } catch (e) { /* */ }
      // the day's doves and flocks sleep at night (the world's animals: hidden, restored as they were)
      F.anim = []; try { X.scene.traverse((o) => { const dove = o.isInstancedMesh && o.parent === X.scene && o.count === 16 && o.material && o.material.type === 'MeshBasicMaterial' && o.material.vertexColors;   // (life.js's doves: unlit white, they would shine in the dark)
        if ((/^animal-/.test(o.name || '') || dove) && o.visible) { F.anim.push(o); o.visible = false; } }); } catch (e) { /* */ }
    } else {
      for (const o of F.anim || []) o.visible = true; F.anim = [];
      for (const [a, v, vt] of F.hid || []) { a.vis = v; a.visT = vt; } F.hid = [];
      try { if (F.crowdOff) X.stages.crowd.setEnabled(true); } catch (e) { /* */ } F.crowdOff = false;
      try { if (F.heroOff) X.hero.show(true); } catch (e) { /* */ } F.heroOff = false;
    }
  }
  async function play() {
    rig = nightRig(X); F.snapBefore = lightSnap(X);
    ov = overlay(); document.body.classList.add('h120-film');
    snd = createFilmSound(X.sfx);
    build(); worldPeople(true); rig.on(); F.live = true; F.t = 0; F.skip = false;
    addEventListener('pointerdown', down, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
    SH5.film = api;
    try { snd.start(); await shots(); } catch (e) { console.warn('[h120] film', e && e.message); }
    await end();
  }
  async function end() {
    // a slow dissolve to morning: dip, the night taken away, the built court in the day
    ov.dip(true); ov.title(''); await X.wait(0.7);
    stop();
    F.snapAfter = lightSnap(X);
    try { globalThis.__H120_FILM = { before: F.snapBefore, after: F.snapAfter, equal: F.snapBefore === F.snapAfter, skipped: F.skip, t: +F.t.toFixed(2) }; } catch (e) { /* */ }
    X.shot([138, 62, 96], [80, 12, 18], 0.01); X.shot([132, 58, 90], [78, 12, 16], 4.2); ov.bars(false); ov.dip(false); document.body.classList.remove('h120-film');
    ov.end('עזרת הנשים נבנתה', 'והקיפוה כצוצרה, שהנשים רואות מלמעלן, והאנשים מלמטן (מדות ב, ה)'); await X.wait(4.2); ov.end('');
    if (opt.again) { ov.again(true); await new Promise((r) => { const f = () => { removeEventListener('pointerdown', f, true); r(); }; addEventListener('pointerdown', f, true); }); ov.again(false); }
    await X.wait(0.6); ov.remove(); ov = null;
  }
  function stop() {
    if (!F.live) return; F.live = false;
    removeEventListener('pointerdown', down, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true);
    if (snd) { snd.stop(); snd = null; }
    for (const a of F.figs) if (a) { try { A.remove(a); } catch (e) { /* */ } }
    F.figs.length = 0; F.dancers.length = 0; F.women.length = 0; worldPeople(false);
    if (group) { S.remove(group); group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); group = null; }
    rig.off(); rig.dispose();
    if (SH5.film === api) SH5.film = null;
  }
  const api = { play, frame, stop, get state() { return { t: +F.t.toFixed(2), shot: F.shot, skip: F.skip, live: F.live, figs: F.figs.length, lights: F.lights.length + 2, city: F.city ? F.city.n : 0 }; }, skip() { F.skip = true; } };
  return api;
}
