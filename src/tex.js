// Procedural textures — drawn on canvas at load, no external assets.
import * as THREE from 'three';
import { rng, clamp } from './util.js';

const cv = (w, h = w) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); return c; };
const hsl = (h, s, l, a = 1) => `hsla(${h.toFixed(1)},${clamp(s, 0, 100).toFixed(1)}%,${clamp(l, 0, 100).toFixed(1)}%,${a})`;

export function toTex(c, srgb = true, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } else { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; }
  t.anisotropy = 8;
  return t;
}

function grain(ctx, w, h, amt, seed) {
  const r = rng(seed);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 1 + (r() - 0.5) * amt;
    d[i] = clamp(d[i] * g, 0, 255); d[i + 1] = clamp(d[i + 1] * g, 0, 255); d[i + 2] = clamp(d[i + 2] * g, 0, 255);
  }
  ctx.putImageData(img, 0, 0);
}

function normalFromHeight(hc, strength = 2, step = 1) {
  const w = hc.width, h = hc.height, src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const out = cv(w, h), o = out.getContext('2d'), img = o.createImageData(w, h), d = img.data;
  const H = (x, y) => src[((((y % h) + h) % h) * w + (((x % w) + w) % w)) * 4];
  const k = strength / 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (H(x + step, y) - H(x - step, y)) * k, dy = (H(x, y + step) - H(x, y - step)) * k;
    const nx = -dx, ny = dy, l = Math.hypot(nx, ny, 1), i = (y * w + x) * 4;
    d[i] = (nx / l * 0.5 + 0.5) * 255; d[i + 1] = (ny / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  o.putImageData(img, 0, 0);
  return out;
}

// blocks along a cyclic row that sum exactly to `total`
function cyclic(r, total, minL, maxL) {
  const L = []; let s = 0;
  while (s < total) { const l = minL + r() * (maxL - minL); L.push(l); s += l; }
  const k = total / s, off = r() * total, out = [];
  let x = off;
  for (const l of L) { out.push([x, l * k]); x += l * k; }
  return out;
}
function wrap2(S, x, y, w, h, fn) {
  for (const ox of [0, -S]) for (const oy of [0, -S]) {
    const X = x + ox, Y = y + oy;
    if (X + w > 0 && X < S && Y + h > 0 && Y < S) fn(X, Y);
  }
}

// ── world6 ── `joints` is not enumerable, so code that walks a texture set's values (main.js makeMats) sees only textures
const withJoints = (o, joints) => Object.defineProperty(o, 'joints', { value: joints, enumerable: false });

// Herodian ashlar: large blocks with drafted margins and a raised flat boss. Tile = 24 amot, 11 courses.
export function texAshlar(seed = 7, size = 1024, tone = [38, 32, 75], rows = 11, len = [0.15, 0.36]) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  const w = rng(seed * 7919 + 17);   // ── world6 ── weathering on its OWN generator: r()'s sequence (the layout, SITE's joints) is untouched
  x.fillStyle = hsl(tone[0], tone[1] - 6, tone[2] - 24); x.fillRect(0, 0, size, size);
  h.fillStyle = '#000'; h.fillRect(0, 0, size, size);
  const ch = size / rows, J = 2.4, M = Math.max(6, Math.round(ch * 0.13));
  const joints = { rows, edges: [] };   // ── world6 ── the stones' layout for SITE's reveal (u of each block's left joint, per canvas row, top row first)
  for (let ry = 0; ry < rows; ry++) {
    const y0 = ry * ch, ed = []; joints.edges.push(ed);
    for (const [bx0, bw] of cyclic(r, size, size * len[0], size * len[1])) {
      ed.push((bx0 / size) % 1);
      const hu = tone[0] + (r() - 0.5) * 8, sa = tone[1] + (r() - 0.5) * 12, li = tone[2] + (r() - 0.5) * 10;
      const bl = [0, 1, 2, 3].map(() => [r(), r(), 10 + r() * 38, r()]);
      // ── world6 ── weathering: rain streaks down from the boss, a dirtier foot, pitting (w(), never r())
      const streaks = [0, 1, 2].slice(0, 1 + Math.floor(w() * 3)).map(() => [w(), 0.3 + w() * 0.65, 1.5 + w() * 4.5, 0.05 + w() * 0.08]);
      const pits = [0, 1, 2, 3, 4].map(() => [w(), w(), 1 + w() * 2.2]), foot = 0.05 + w() * 0.08;
      wrap2(size, bx0, y0, bw, ch, (bx, by) => {
        const X = bx + J / 2, Y = by + J / 2, W = bw - J, H = ch - J;
        x.fillStyle = hsl(hu, sa - 6, li + 3.5); x.fillRect(X, Y, W, H);
        x.fillStyle = hsl(hu, sa, li - 1.5); x.fillRect(X + M, Y + M, W - 2 * M, H - 2 * M);
        x.save(); x.beginPath(); x.rect(X + M, Y + M, W - 2 * M, H - 2 * M); x.clip();
        for (const [a, b, rad, k] of bl) {
          const gx = X + M + a * (W - 2 * M), gy = Y + M + b * (H - 2 * M), g = x.createRadialGradient(gx, gy, 0, gx, gy, rad);
          g.addColorStop(0, hsl(hu, sa, k < 0.55 ? li - 15 : li + 9, 0.22)); g.addColorStop(1, hsl(hu, sa, li, 0));
          x.fillStyle = g; x.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
        }
        x.restore();
        x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
        for (const [a, l, sw, al] of streaks) {
          const sx = X + M + a * (W - 2 * M), g = x.createLinearGradient(0, Y + M, 0, Y + M + l * H);
          g.addColorStop(0, `rgba(84,70,50,${al})`); g.addColorStop(1, 'rgba(84,70,50,0)');
          x.fillStyle = g; x.fillRect(sx - sw / 2, Y + M, sw, l * H);
        }
        { const g = x.createLinearGradient(0, Y + H * 0.7, 0, Y + H); g.addColorStop(0, 'rgba(78,64,44,0)'); g.addColorStop(1, `rgba(78,64,44,${foot})`); x.fillStyle = g; x.fillRect(X, Y + H * 0.7, W, H * 0.3); }
        x.fillStyle = 'rgba(96,86,68,.16)';
        for (const [a, b, rad] of pits) { x.beginPath(); x.arc(X + a * W, Y + b * H, rad, 0, Math.PI * 2); x.fill(); }
        x.restore();
        x.fillStyle = 'rgba(255,250,236,.20)'; x.fillRect(X, Y, W, 1.5);
        x.fillStyle = 'rgba(70,52,28,.15)'; x.fillRect(X, Y + H - 1.5, W, 1.5);
        h.fillStyle = '#707070'; h.fillRect(X, Y, W, H);
        h.fillStyle = '#9a9a9a'; h.fillRect(X + M - 3, Y + M - 3, W - 2 * M + 6, H - 2 * M + 6);
        h.fillStyle = '#bdbdbd'; h.fillRect(X + M - 1, Y + M - 1, W - 2 * M + 2, H - 2 * M + 2);
        h.fillStyle = '#cccccc'; h.fillRect(X + M + 1, Y + M + 1, W - 2 * M - 2, H - 2 * M - 2);
      });
    }
  }
  grain(x, size, size, 0.10, seed + 1); grain(h, size, size, 0.07, seed + 2);
  return withJoints({ map: toTex(c), normalMap: toTex(normalFromHeight(hc, 2.4, 1), false) }, joints);
}

// Large flagstone paving. Tile = 24 amot.
export function texPaving(seed = 17, size = 1024, tone = [39, 21, 77]) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  x.fillStyle = hsl(tone[0], tone[1], tone[2] - 20); x.fillRect(0, 0, size, size);
  h.fillStyle = '#000'; h.fillRect(0, 0, size, size);
  const J = 2;
  for (const [ry, rh] of cyclic(r, size, size * 0.085, size * 0.13)) {
    for (const [bx0, bw] of cyclic(r, size, size * 0.11, size * 0.26)) {
      const li = tone[2] + (r() - 0.5) * 7, hu = tone[0] + (r() - 0.5) * 6, sa = tone[1] + (r() - 0.5) * 8;
      const bl = [0, 1, 2].map(() => [r(), r(), 14 + r() * 40, r()]);
      wrap2(size, bx0, ry, bw, rh, (bx, by) => {
        const X = bx + J / 2, Y = by + J / 2, W = bw - J, H = rh - J;
        x.fillStyle = hsl(hu, sa, li); x.fillRect(X, Y, W, H);
        x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
        for (const [a, b, rad, k] of bl) {
          const gx = X + a * W, gy = Y + b * H, g = x.createRadialGradient(gx, gy, 0, gx, gy, rad);
          g.addColorStop(0, hsl(hu, sa, k < 0.5 ? li - 9 : li + 5, 0.2)); g.addColorStop(1, hsl(hu, sa, li, 0));
          x.fillStyle = g; x.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);
        }
        x.restore();
        x.fillStyle = 'rgba(255,252,240,.18)'; x.fillRect(X, Y, W, 1.2);
        h.fillStyle = '#b4b4b4'; h.fillRect(X, Y, W, H);
        h.fillStyle = '#c4c4c4'; h.fillRect(X + 2, Y + 2, W - 4, H - 4);
      });
    }
  }
  grain(x, size, size, 0.08, seed + 3); grain(h, size, size, 0.05, seed + 4);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 1.6, 1), false) };
}

// "אפיק שפה ועייל שפה" — alternating courses: white marble proud, blue-grey (כוחלא) recessed.
// Tile = 19.2 amot, 12 courses of 1.6 amot.
export function texMarble(seed = 23, size = 1024) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  const rows = 12, ch = size / rows, J = 1.6;
  const joints = { rows, edges: [] };   // ── world6 ── the stones' layout for SITE's reveal (as texAshlar)
  x.fillStyle = '#9aa3ac'; x.fillRect(0, 0, size, size);
  h.fillStyle = '#000'; h.fillRect(0, 0, size, size);
  for (let ry = 0; ry < rows; ry++) {
    const y0 = ry * ch, blue = ry % 2 === 1, ed = []; joints.edges.push(ed);
    for (const [bx0, bw] of cyclic(r, size, size * 0.16, size * 0.30)) {
      ed.push((bx0 / size) % 1);
      // ── world6 ── the blue-grey courses softer and warmer (at a phone's distance the old contrast read as a glass
      // curtain wall); the same r() calls in the same order, so the layout and SITE's joints are unchanged
      const hu = blue ? 198 + (r() - 0.5) * 10 : 40 + (r() - 0.5) * 8;
      const sa = blue ? 8 + (r() - 0.5) * 6 : 20 + (r() - 0.5) * 8;
      const li = blue ? 83 + (r() - 0.5) * 5 : 91 + (r() - 0.5) * 3;
      const veins = [0, 1, 2, 3].map(() => [r(), r(), r(), r(), 0.6 + r() * 1.6]);
      wrap2(size, bx0, y0, bw, ch, (bx, by) => {
        const X = bx + J / 2, Y = by + J / 2, W = bw - J, H = ch - J;
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        if (blue) { g.addColorStop(0, hsl(hu, sa, li - 10)); g.addColorStop(0.25, hsl(hu, sa, li)); g.addColorStop(1, hsl(hu, sa, li + 2)); }
        else { g.addColorStop(0, hsl(hu, sa, li + 3)); g.addColorStop(0.15, hsl(hu, sa, li)); g.addColorStop(1, hsl(hu, sa, li - 4)); }
        x.fillStyle = g; x.fillRect(X, Y, W, H);
        x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip();
        for (const [a, b, c2, d, lw] of veins) {
          x.strokeStyle = blue ? 'rgba(55,75,105,.30)' : 'rgba(140,128,110,.22)'; x.lineWidth = lw;
          x.beginPath(); x.moveTo(X + a * W, Y); x.bezierCurveTo(X + b * W, Y + H * 0.3, X + c2 * W, Y + H * 0.7, X + d * W, Y + H); x.stroke();
        }
        x.restore();
        h.fillStyle = blue ? '#6a6a6a' : '#c8c8c8'; h.fillRect(X, Y, W, H);
        if (!blue) { h.fillStyle = '#d8d8d8'; h.fillRect(X + 2, Y + 2, W - 4, H - 4); }
      });
    }
  }
  grain(x, size, size, 0.05, seed + 5);
  return withJoints({ map: toTex(c), normalMap: toTex(normalFromHeight(hc, 2.2, 1), false) }, joints);
}

// Whitened altar stones (אבנים שלמות, מלבנים אותן). Tile = 10 amot.
export function texPlaster(seed = 41, size = 512) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  x.fillStyle = hsl(40, 16, 86); x.fillRect(0, 0, size, size);
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const cx = r() * size, cy = r() * size, rad = 14 + r() * 30, n = 7, pts = [];
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + r() * 0.5, rr = rad * (0.7 + r() * 0.4); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8]); }
    const fill = hsl(38 + (r() - 0.5) * 8, 12, 90 + (r() - 0.5) * 5, 0.35);
    for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) {
      x.beginPath(); pts.forEach(([px, py], k) => (k ? x.lineTo(px + ox, py + oy) : x.moveTo(px + ox, py + oy))); x.closePath();
      x.fillStyle = fill; x.fill(); x.strokeStyle = 'rgba(125,112,90,.16)'; x.lineWidth = 1.4; x.stroke();
      h.beginPath(); pts.forEach(([px, py], k) => (k ? h.lineTo(px + ox, py + oy) : h.moveTo(px + ox, py + oy))); h.closePath();
      h.fillStyle = '#9a9a9a'; h.fill();
    }
  }
  grain(x, size, size, 0.06, seed + 6);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 1.2, 1), false) };
}

// Terracotta tegula/imbrex roof. Tile = 8 amot. Canvas "down" = down-slope.
export function texRoof(seed = 53, size = 512) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  const rows = 16, ch = size / rows, cols = 16, cw = size / cols;
  for (let ry = 0; ry < rows; ry++) {
    const y0 = ry * ch, st = (ry % 2) * cw / 2;
    for (let cx = 0; cx <= cols; cx++) {
      const X = cx * cw - st, hu = 15 + r() * 9, sa = 34 + r() * 10, li = 56 + r() * 8;
      const draw = (XX) => {
        const g = x.createLinearGradient(0, y0, 0, y0 + ch);
        g.addColorStop(0, hsl(hu, sa, li + 7)); g.addColorStop(0.7, hsl(hu, sa, li)); g.addColorStop(1, hsl(hu, sa + 4, li - 12));
        x.fillStyle = g; x.fillRect(XX + 1, y0, cw - 2, ch);
        x.fillStyle = hsl(hu, sa, li + 12, 0.55); x.fillRect(XX + cw * 0.42, y0, cw * 0.16, ch);
        x.fillStyle = 'rgba(40,18,8,.35)'; x.fillRect(XX, y0, 1, ch);
        const hg = h.createLinearGradient(0, y0, 0, y0 + ch); hg.addColorStop(0, '#404040'); hg.addColorStop(1, '#b0b0b0');
        h.fillStyle = hg; h.fillRect(XX + 1, y0, cw - 2, ch);
        h.fillStyle = 'rgba(255,255,255,.35)'; h.fillRect(XX + cw * 0.38, y0, cw * 0.24, ch);
      };
      draw(X); if (X < 0) draw(X + size);
    }
  }
  grain(x, size, size, 0.08, seed + 7);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 2.0, 1), false) };
}

// Cedar / oak grain. Tile = 4 amot.
export function texWood(seed = 61, size = 256) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d');
  x.fillStyle = hsl(27, 40, 40); x.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const y = r() * size, a = r() * 6, f = 1 + Math.floor(r() * 3);
    x.strokeStyle = hsl(24, 42, 24 + r() * 16, 0.35); x.lineWidth = 0.6 + r() * 1.8;
    x.beginPath();
    for (let X = 0; X <= size; X += 8) { const Y = y + Math.sin(X / size * Math.PI * 2 * f + a) * 3; X ? x.lineTo(X, Y) : x.moveTo(X, Y); }
    x.stroke();
  }
  grain(x, size, size, 0.1, seed + 8);
  return { map: toTex(c) };
}

// Ground detail (multiplied with terrain vertex colours). Tile = 30 amot.
export function texGround(seed = 71, size = 512) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d');
  x.fillStyle = '#f2f1ea'; x.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const X = r() * size, Y = r() * size, rr = 20 + r() * 60, dark = r() < 0.5;
    const g = x.createRadialGradient(X, Y, 0, X, Y, rr);
    g.addColorStop(0, dark ? 'rgba(110,120,70,.16)' : 'rgba(255,250,235,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) { x.fillStyle = g; x.save(); x.translate(ox, oy); x.fillRect(X - rr, Y - rr, rr * 2, rr * 2); x.restore(); }
  }
  for (let i = 0; i < 1100; i++) {
    const X = r() * size, Y = r() * size, rr = 0.8 + r() * 4;
    x.fillStyle = r() < 0.55 ? hsl(78, 22, 55 + r() * 25, 0.3) : hsl(40, 18, 88 + r() * 8, 0.45);
    for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) { x.beginPath(); x.ellipse(X + ox, Y + oy, rr, rr * 0.7, 0, 0, 6.3); x.fill(); }
  }
  grain(x, size, size, 0.14, seed + 9);
  return { map: toTex(c) };
}

// סורג — lattice alpha. Tile = 2 amot.
export function texLattice(size = 256) {
  const c = cv(size), x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, size, size);
  x.strokeStyle = '#fff'; x.lineWidth = 16;
  for (let k = -2; k <= 2; k++) {
    x.beginPath(); x.moveTo(k * size / 2, 0); x.lineTo(k * size / 2 + size, size); x.stroke();
    x.beginPath(); x.moveTo(k * size / 2 + size, 0); x.lineTo(k * size / 2, size); x.stroke();
  }
  return toTex(c, false);
}

// Weathered limestone bedrock of the natural hill (Mount Moriah before the platform) and its boulders.
// Pale grey-cream rock, bleached and shadowed blotches, lichen, bedding lines, cracks and solution pits. Tile ≈ 26 amot.
export function texRock(seed = 91, size = 512) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  x.fillStyle = hsl(40, 13, 70); x.fillRect(0, 0, size, size);
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  const around = (fn) => { for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) fn(ox, oy); };
  for (let i = 0; i < 110; i++) {
    const X = r() * size, Y = r() * size, rr = 14 + r() * 70, k = r();
    const col = k < 0.34 ? hsl(34, 12, 52, 0.2) : k < 0.72 ? hsl(44, 22, 86, 0.24) : hsl(78, 14, 50, 0.13);
    const hv = k < 0.34 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.12)';
    around((ox, oy) => {
      const g = x.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, rr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(X + ox - rr, Y + oy - rr, rr * 2, rr * 2);
      const gh = h.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, rr); gh.addColorStop(0, hv); gh.addColorStop(1, 'rgba(128,128,128,0)');
      h.fillStyle = gh; h.fillRect(X + ox - rr, Y + oy - rr, rr * 2, rr * 2);
    });
  }
  // bedding lines (wavy, roughly horizontal in the texture)
  // (world7: 16 → 8 lines, their relief .3 → .13 — on the hill's gentle slopes, mapped from above, they read as long parallel
  // stripes across the whole Mount at dawn and dusk)
  for (let i = 0; i < 8; i++) {
    const y0 = r() * size, a = r() * 6.28, amp = 3 + r() * 7, w = 0.8 + r() * 1.8;
    around((ox, oy) => {
      x.strokeStyle = 'rgba(92,78,58,.07)'; x.lineWidth = w; h.strokeStyle = 'rgba(40,40,40,.13)'; h.lineWidth = w + 1;
      for (const ctx of [x, h]) { ctx.beginPath(); for (let X = -8; X <= size + 8; X += 8) { const Y = y0 + Math.sin(X / size * 6.28 * 2 + a) * amp; X > -8 ? ctx.lineTo(X + ox, Y + oy) : ctx.moveTo(X + ox, Y + oy); } ctx.stroke(); }
    });
  }
  // cracks
  for (let i = 0; i < 26; i++) {
    let X = r() * size, Y = r() * size, ang = r() * 6.28;
    const pts = [[X, Y]], n = 4 + Math.floor(r() * 7);
    for (let k = 0; k < n; k++) { ang += (r() - 0.5) * 1.1; const l = 6 + r() * 16; X += Math.cos(ang) * l; Y += Math.sin(ang) * l; pts.push([X, Y]); }
    around((ox, oy) => {
      x.strokeStyle = 'rgba(58,46,32,.22)'; x.lineWidth = 1.1; x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a + ox, b + oy) : x.moveTo(a + ox, b + oy))); x.stroke();
      x.strokeStyle = 'rgba(255,250,235,.25)'; x.lineWidth = 1; x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a + ox + 1, b + oy + 1) : x.moveTo(a + ox + 1, b + oy + 1))); x.stroke();
      h.strokeStyle = 'rgba(0,0,0,.6)'; h.lineWidth = 2.2; h.beginPath(); pts.forEach(([a, b], k) => (k ? h.lineTo(a + ox, b + oy) : h.moveTo(a + ox, b + oy))); h.stroke();
    });
  }
  // solution pits
  for (let i = 0; i < 500; i++) {
    const X = r() * size, Y = r() * size, rr = 0.6 + r() * 2.4;
    around((ox, oy) => {
      x.fillStyle = hsl(36, 14, 34 + r() * 18, 0.35); x.beginPath(); x.ellipse(X + ox, Y + oy, rr, rr * 0.8, 0, 0, 6.3); x.fill();
      h.fillStyle = 'rgba(0,0,0,.35)'; h.beginPath(); h.ellipse(X + ox, Y + oy, rr, rr * 0.8, 0, 0, 6.3); h.fill();
    });
  }
  // (world7) the ground's small detail, on its own rng (the layout above is unchanged): loose stones with a lit top and a
  // shaded foot, and tufts of dry summer grass between them
  const r2 = rng(seed + 707);
  for (let i = 0; i < 240; i++) {
    const X = r2() * size, Y = r2() * size, rr = 1.2 + r2() * 3.2, l = 58 + r2() * 26;
    around((ox, oy) => {
      x.fillStyle = hsl(38, 10, l - 22, 0.5); x.beginPath(); x.ellipse(X + ox + 0.8, Y + oy + 1, rr, rr * 0.7, 0, 0, 6.3); x.fill();
      x.fillStyle = hsl(40, 12, l, 0.85); x.beginPath(); x.ellipse(X + ox, Y + oy, rr, rr * 0.7, 0, 0, 6.3); x.fill();
      h.fillStyle = 'rgba(255,255,255,.45)'; h.beginPath(); h.ellipse(X + ox, Y + oy, rr, rr * 0.7, 0, 0, 6.3); h.fill();
    });
  }
  for (let i = 0; i < 320; i++) {
    const X = r2() * size, Y = r2() * size, n = 3 + Math.floor(r2() * 4), hue = 46 + r2() * 14, l = 48 + r2() * 20;
    around((ox, oy) => {
      x.strokeStyle = hsl(hue, 30, l, 0.5); x.lineWidth = 0.9;
      for (let k = 0; k < n; k++) { const a = -1.9 + (k / (n - 1 || 1)) * 0.8 + (r2() - 0.5) * 0.3, L = 2.5 + r2() * 3; x.beginPath(); x.moveTo(X + ox, Y + oy); x.lineTo(X + ox + Math.cos(a) * L, Y + oy + Math.sin(a) * L); x.stroke(); }
    });
  }
  grain(x, size, size, 0.12, seed + 1); grain(h, size, size, 0.2, seed + 2);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 2.6, 1), false) };
}

export function texPuff(seed = 5, size = 128) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d');
  for (let i = 0; i < 16; i++) {
    const X = size / 2 + (r() - 0.5) * size * 0.34, Y = size / 2 + (r() - 0.5) * size * 0.34, rr = size * (0.16 + r() * 0.2);
    const g = x.createRadialGradient(X, Y, 0, X, Y, rr);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, size, size);
  }
  return toTex(c, true, false);
}

export function texFlame() {
  const c = cv(64, 128), x = c.getContext('2d');
  const g = x.createRadialGradient(32, 96, 2, 32, 80, 60);
  g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.25, 'rgba(255,220,120,.95)');
  g.addColorStop(0.55, 'rgba(255,130,40,.6)'); g.addColorStop(1, 'rgba(255,60,10,0)');
  x.fillStyle = g; x.beginPath(); x.ellipse(32, 78, 26, 48, 0, 0, 6.3); x.fill();
  return toTex(c, true, false);
}

export function texGlow(size = 64) {
  const c = cv(size), x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return toTex(c, true, false);
}

// a four-point glint (gold highlights, the Heichal's sunrise shine)
export function texStar(size = 128) {
  const c = cv(size), x = c.getContext('2d'), h = size / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h * 0.42);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  x.globalCompositeOperation = 'lighter';
  const ray = (a, len, w, al) => {
    x.save(); x.translate(h, h); x.rotate(a);
    const lg = x.createLinearGradient(-len, 0, len, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, `rgba(255,255,255,${al})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = lg; x.beginPath(); x.moveTo(-len, 0); x.lineTo(0, -w); x.lineTo(len, 0); x.lineTo(0, w); x.closePath(); x.fill();
    x.restore();
  };
  ray(0, h, size * 0.035, 1); ray(Math.PI / 2, h, size * 0.035, 1);
  ray(Math.PI / 4, h * 0.55, size * 0.02, 0.5); ray(-Math.PI / 4, h * 0.55, size * 0.02, 0.5);
  return toTex(c, true, false);
}

/* ───────── Sprint 2 (sanctuary) additions ───────── */

// Gold plating of the Heichal ("הבית כולו מחופה זהב", Middot 4:1): plain beaten sheets, no ornament — a soft hammered
// dimple field and faint seams where the sheets meet. Tile = 5 amot (sheets 2.5 wide × 1.25 high). The albedo is near
// white (the material colour carries the gold); the height gives the normal map.
export function texGoldPlate(seed = 101, size = 512, seams = true) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  x.fillStyle = '#f4f0e6'; x.fillRect(0, 0, size, size);
  h.fillStyle = '#808080'; h.fillRect(0, 0, size, size);
  const around = (fn) => { for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) fn(ox, oy); };
  // hammer dimples: many soft round dents (height) with a faint tone change (albedo)
  for (let i = 0; i < 2600; i++) {
    const X = r() * size, Y = r() * size, rr = 3 + r() * 7, k = r();
    around((ox, oy) => {
      const g = h.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, rr);
      g.addColorStop(0, 'rgba(0,0,0,.16)'); g.addColorStop(0.7, 'rgba(0,0,0,.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      h.fillStyle = g; h.fillRect(X + ox - rr, Y + oy - rr, rr * 2, rr * 2);
      if (k < 0.3) { const a = x.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, rr); a.addColorStop(0, 'rgba(120,96,50,.07)'); a.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = a; x.fillRect(X + ox - rr, Y + oy - rr, rr * 2, rr * 2); }
    });
  }
  // large, very soft tone variation between sheets
  const sw = size / 2, sh = size / 4;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
    const off = (j % 2) * sw / 2, l = 0.9 + r() * 0.1;
    around((ox, oy) => { x.fillStyle = `rgba(${l > 0.95 ? '255,250,235' : '90,70,40'},${(Math.abs(l - 0.95) * 0.9).toFixed(3)})`; x.fillRect(i * sw + off + ox, j * sh + oy, sw, sh); });
  }
  // seams (running bond) — a thin dark line and a raised lip
  if (seams) for (let j = 0; j <= 4; j++) { x.fillStyle = 'rgba(70,50,20,.35)'; x.fillRect(0, j * sh - 1, size, 2); h.fillStyle = '#5a5a5a'; h.fillRect(0, j * sh - 2, size, 3); h.fillStyle = '#a8a8a8'; h.fillRect(0, j * sh + 1, size, 2); }
  if (seams) for (let j = 0; j < 4; j++) for (let i = 0; i <= 2; i++) {
    const X = i * sw + (j % 2) * sw / 2;
    for (const ox of [0, -size, size]) { x.fillStyle = 'rgba(70,50,20,.35)'; x.fillRect(X + ox - 1, j * sh, 2, sh); h.fillStyle = '#5a5a5a'; h.fillRect(X + ox - 2, j * sh, 3, sh); }
  }
  grain(x, size, size, 0.04, seed + 1); grain(h, size, size, 0.05, seed + 2);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 1.6, 1), false) };
}

// The parochet: "עביה טפח, ועל שבעים ושתים נימין נארגת, ועל כל נימא ונימא עשרים וארבעה חוטין" (Shekalim 8:5) —
// the 24 threads being six each of techelet, argaman, tola'at shani and shesh (Yoma 71b). An abstract heavy weave
// (no figures): strands of the four colours in a twill, with broad bands. Tile = 2 × 2 amot (7.2 strands across).
export const WEAVE_COLS = { techelet: [46, 74, 140], argaman: [112, 38, 88], shani: [168, 34, 40], shesh: [232, 224, 204] };
export function texWeave(seed = 111, size = 512) {
  const r = rng(seed), c = cv(size), x = c.getContext('2d'), hc = cv(size), h = hc.getContext('2d');
  const C = [WEAVE_COLS.techelet, WEAVE_COLS.argaman, WEAVE_COLS.shani, WEAVE_COLS.shesh];
  const img = x.createImageData(size, size), d = img.data, himg = h.createImageData(size, size), hd = himg.data;
  // warp-faced 3/1 twill: the 72 strands run down the curtain (7.2 per tile), each of 24 threads — six of each colour
  // side by side; the weft (dark argaman) shows in a fine diagonal
  const strand = size / 7.2, th = strand / 24, weft = [70, 26, 58];
  for (let py = 0; py < size; py++) {
    const wy = Math.floor(py / (th * 1.2)), fy = (py % (th * 1.2)) / (th * 1.2);
    for (let px = 0; px < size; px++) {
      const wx = Math.floor(px / th), fx = (px % th) / th, inS = (px % strand) / strand;
      const warpC = C[Math.floor(inS * 4) % 4];
      const over = ((wx + wy) % 4) !== 3;
      const col = over ? warpC : weft;
      const prof = over ? Math.sin(Math.PI * fx) : Math.sin(Math.PI * fy);
      const shade = 0.58 + 0.42 * prof, i = (py * size + px) * 4;
      d[i] = col[0] * shade; d[i + 1] = col[1] * shade; d[i + 2] = col[2] * shade; d[i + 3] = 255;
      const hv = 70 + 150 * prof * (over ? 1 : 0.7); hd[i] = hd[i + 1] = hd[i + 2] = hv; hd[i + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0); h.putImageData(himg, 0, 0);
  // the slow unevenness of a hand-woven cloth
  for (let i = 0; i < 36; i++) {
    const X = r() * size, Y = r() * size, rr = 40 + r() * 110, g = x.createRadialGradient(X, Y, 0, X, Y, rr), dark = r() < 0.6;
    g.addColorStop(0, dark ? 'rgba(20,8,16,.14)' : 'rgba(255,240,220,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    for (const ox of [0, -size, size]) for (const oy of [0, -size, size]) { x.fillStyle = g; x.fillRect(X - rr + ox, Y - rr + oy, rr * 2, rr * 2); }
  }
  grain(x, size, size, 0.05, seed + 3);
  return { map: toTex(c), normalMap: toTex(normalFromHeight(hc, 2.4, 1), false) };
}
