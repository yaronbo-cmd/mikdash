/* ─────────────────────────────────────────────────────────────────────────────
 * view.js: the board of "משחק האוצר" on one canvas over the whole overlay (so a matched vessel can rise out of the board
 * into the collection bar), plus a transparent hit layer over the board for swipes and taps.
 *
 *   const v = createView({ root, hit, s, field, speed, reduced, target(res|'rise') → {x,y}, onInput(a, b) });
 *   v.resize() · v.sync(s) · await v.swap(a, b, ok) · await v.play(steps, hooks) · v.hint([a,b]|null) · v.lock(bool)
 *   v.praise(text) · v.destroy()
 * hooks: { onClear(st), onLand(st), onFly(res, n) }  (sounds and counters live in index.js / ui.js)
 * The vessels never break: a gathered vessel glows, rises and streams into the bar. Chips, dust and splinters come only
 * from stone, earth and wood.
 * ──────────────────────────────────────────────────────────────────────────── */
import { createArt, scene } from './art.js';
import { LIGHT, LOG, ASHLAR, WSTONE, NUGGET, ROW, COL, AREA, SLIGHT, YIELD, adjacent } from './engine.js';

const OBJ_KEY = { [LOG]: 'log', [ASHLAR]: 'ashlar', [WSTONE]: 'wstone', [NUGGET]: 'nugget', [LIGHT]: 'light' };
const OBJ_RES = { [LOG]: 'cedar', [ASHLAR]: 'stone', [WSTONE]: 'wstone', [NUGGET]: 'gold' };
const keyOf = (k) => (k >= 0 && k < 6 ? 'v' + k : OBJ_KEY[k] || 'v0');
const TILE = {
  quarry: ['#F3E6CB', '#EADAB9', 'rgba(120,90,50,0.3)'],
  forest: ['#D9E4C4', '#CCDAB3', 'rgba(50,80,40,0.35)'],
  gold: ['#D8C3A2', '#CCB592', 'rgba(70,45,20,0.4)'],
};
const CHIP = { quarry: ['#E9D8B4', '#BFA676', '#8E7650'], forest: ['#8A5A2E', '#C08A52', '#3F6B35'], gold: ['#6B6157', '#E38B3C', '#3FA88A'] };
const now = () => (globalThis.performance ? performance.now() : Date.now());

export function createView(o) {
  const { root, hit, field = 'quarry', reduced = false } = o;
  let s = o.s, speed = o.speed || 1;
  const R = s.R, C = s.C;
  const bgc = document.createElement('canvas');
  bgc.className = 'm3-bgc'; bgc.setAttribute('aria-hidden', 'true');
  root.insertBefore(bgc, root.firstChild);
  const cv = document.createElement('canvas');
  cv.className = 'm3-cv';
  cv.setAttribute('aria-hidden', 'true');
  root.appendChild(cv);
  const g = cv.getContext('2d');
  let dpr = 1, W = 0, H = 0, bx = 0, by = 0, cs = 44, art = null, bg = null;
  // the view's copy of the static layers (updated step by step while replaying)
  const vd = s.vd.slice(), bk = s.bk.slice(), ea = s.ea.slice(), ng = s.ng.slice(), lk = s.lk.slice();
  const shakeAt = new Float32Array(R * C);
  const spr = new Map();              // id → { id, k, sp, bn, x, y, mv, flash }
  const rises = [], beams = [], texts = [];
  const P = []; for (let q = 0; q < 220; q++) P.push({ on: 0 });   // the particle pool (no allocation per frame)
  let hintPair = null, hintT = 0, sel = -1, locked = false, alive = true, raf = 0;
  const perf = { n: 0, ms: 0, max: 0 };             // JS time per frame (the harness reads it)
  let dirty = true, live = 0;                       // idle: nothing moves, glows or pulses → no redraw (battery)

  const col = (i) => i % C, row = (i) => (i / C) | 0;
  const px = (c) => bx + (c + 0.5) * cs, py = (r) => by + (r + 0.5) * cs;

  function resize() {
    const rr = root.getBoundingClientRect(), hr = hit.getBoundingClientRect();
    dpr = Math.min(2, globalThis.devicePixelRatio || 1);
    W = Math.max(1, rr.width); H = Math.max(1, rr.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cs = Math.floor(Math.min(hr.width / C, hr.height / R));
    bx = hr.left - rr.left + (hr.width - cs * C) / 2; by = hr.top - rr.top + (hr.height - cs * R) / 2;
    dirty = true;
    const want = Math.round(cs * dpr);
    if (!art || art.px !== want) art = createArt(want);
    bg = board();
    bgc.width = cv.width; bgc.height = cv.height; bgc.style.width = W + 'px'; bgc.style.height = H + 'px';
    try { const b = bgc.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0); scene(b, field, W, H); } catch (e) { /* a plain background */ }
  }
  function board() {
    const c = document.createElement('canvas');
    c.width = Math.round(cs * C * dpr) + 8; c.height = Math.round(cs * R * dpr) + 8;
    const b = c.getContext('2d'), t = TILE[field] || TILE.quarry, u = cs * dpr;
    b.translate(4, 4);
    b.fillStyle = 'rgba(40,24,8,0.45)';
    for (let i = 0; i < R * C; i++) if (!vd[i]) { b.beginPath(); b.roundRect(col(i) * u - 2, row(i) * u - 2, u + 4, u + 4, u * 0.2); b.fill(); }
    for (let i = 0; i < R * C; i++) {
      if (vd[i]) continue;
      const x = col(i) * u, y = row(i) * u;
      b.fillStyle = (col(i) + row(i)) & 1 ? t[1] : t[0];
      b.beginPath(); b.roundRect(x + 1, y + 1, u - 2, u - 2, u * 0.14); b.fill();
      b.strokeStyle = t[2]; b.lineWidth = Math.max(1, u * 0.02); b.stroke();
    }
    return c;
  }

  /* ── the sprites ── */
  function sync(ns) {
    if (ns) s = ns;
    dirty = true;
    for (const [a, b] of [[vd, s.vd], [bk, s.bk], [ea, s.ea], [ng, s.ng], [lk, s.lk]]) a.set(b);
    const seen = new Set();
    for (let i = 0; i < s.N; i++) {
      if (s.vd[i] || s.bk[i] || s.k[i] < 0) continue;
      const id = s.id[i]; seen.add(id);
      let p = spr.get(id);
      if (!p) { p = { id, x: col(i), y: row(i), mv: null, flash: 0 }; spr.set(id, p); }
      p.k = s.k[i]; p.sp = s.sp[i]; p.bn = s.bn[i];
      if (!p.mv) { p.x = col(i); p.y = row(i); }
    }
    for (const id of [...spr.keys()]) if (!seen.has(id)) spr.delete(id);
  }
  const move = (p, x, y, dur, kind = 'fall', delay = 0) => { p.mv = { fx: p.x, fy: p.y, tx: x, ty: y, t0: now() + delay, dur: Math.max(1, dur), kind }; };
  function stepMoves(t) {
    for (const p of spr.values()) {
      const m = p.mv; if (!m) continue;
      let q = (t - m.t0) / m.dur;
      if (q < 0) continue;
      if (q >= 1) { p.x = m.tx; p.y = m.ty; p.mv = null; continue; }
      if (m.kind === 'fall') {
        const e = q < 0.8 ? (q / 0.8) * (q / 0.8) : 1;
        p.x = m.fx + (m.tx - m.fx) * e;
        p.y = m.fy + (m.ty - m.fy) * e - (q >= 0.8 && !reduced ? Math.sin((q - 0.8) / 0.2 * Math.PI) * 0.1 : 0);
      } else {
        const e = q < 0.5 ? 2 * q * q : 1 - 2 * (1 - q) * (1 - q);
        p.x = m.fx + (m.tx - m.fx) * e; p.y = m.fy + (m.ty - m.fy) * e;
      }
    }
  }

  /* ── particles and effects ── */
  function emit(n, x, y, kind, colr, spd = 1) {
    if (reduced) n = Math.ceil(n / 3);
    for (let q = 0; q < P.length && n > 0; q++) {
      const p = P[q]; if (p.on) continue;
      const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * cs * 0.06 * spd;
      p.on = 1; p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - (kind === 'mote' ? cs * 0.03 : cs * 0.05);
      p.life = 0; p.max = kind === 'mote' ? 40 + Math.random() * 30 : 26 + Math.random() * 18; p.kind = kind; p.col = colr;
      p.sz = (kind === 'chip' ? 0.09 : kind === 'leaf' ? 0.1 : kind === 'drop' ? 0.06 : 0.05) * cs * (0.7 + Math.random() * 0.6);
      p.rot = Math.random() * 6; n--;
    }
  }
  function drawParticles() {
    live = 0;
    for (const p of P) {
      if (!p.on) continue;
      live++;
      p.life++; if (p.life > p.max) { p.on = 0; continue; }
      p.x += p.vx; p.y += p.vy; p.rot += 0.15;
      if (p.kind === 'chip' || p.kind === 'drop' || p.kind === 'leaf') p.vy += cs * (p.kind === 'leaf' ? 0.003 : 0.012);
      else { p.vx *= 0.96; p.vy *= 0.96; }
      const a = 1 - p.life / p.max;
      g.globalAlpha = a;
      g.fillStyle = p.col;
      if (p.kind === 'chip') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 0.7); g.restore(); }
      else if (p.kind === 'leaf') { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.beginPath(); g.ellipse(0, 0, p.sz, p.sz * 0.45, 0, 0, 7); g.fill(); g.restore(); }
      else { g.beginPath(); g.arc(p.x, p.y, p.sz * (p.kind === 'dust' ? 1 + p.life / 12 : 1), 0, 7); g.fill(); }
    }
    g.globalAlpha = 1;
  }
  function rise(k, x, y, bn) {
    const tg = o.target ? o.target('rise', k) : { x: W / 2, y: by - cs };
    rises.push({ key: keyOf(k), x0: x, y0: y, x1: tg.x, y1: tg.y, t0: now(), dur: (reduced ? 380 : 620) * speed, side: (Math.random() - 0.5) * cs * 3 });
    if (bn) fly('silver', x, y, 1);
  }
  function fly(res, x, y, n) {
    const tg = o.target ? o.target(res) : { x: W / 2, y: 0 };
    const key = { stone: 'ashlar', cedar: 'log', gold: 'nugget', silver: 'coin', bronze: 'blk:gold:1', wstone: 'wstone' }[res] || 'ashlar';
    rises.push({ key, x0: x, y0: y, x1: tg.x, y1: tg.y, t0: now(), dur: (reduced ? 350 : 560) * speed, side: (Math.random() - 0.5) * cs * 2, small: 1, res, n });
  }
  function drawRises(t) {
    for (let q = rises.length - 1; q >= 0; q--) {
      const r = rises[q], p = (t - r.t0) / r.dur;
      if (p >= 1) { rises.splice(q, 1); if (r.res && o.onFly) o.onFly(r.res, r.n); continue; }
      if (p < 0) continue;
      const glowP = r.small ? 0 : Math.min(1, p / 0.28), fp = r.small ? p : Math.max(0, (p - 0.28) / 0.72);
      const e = fp * fp * (3 - 2 * fp);
      const mx = (r.x0 + r.x1) / 2 + r.side, my = Math.min(r.y0, r.y1) - cs * 0.6;
      const x = (1 - e) * (1 - e) * r.x0 + 2 * (1 - e) * e * mx + e * e * r.x1;
      const y = (1 - e) * (1 - e) * r.y0 + 2 * (1 - e) * e * my + e * e * r.y1;
      const sz = cs * (r.small ? 0.62 - 0.25 * e : (1 + 0.22 * glowP) * (1 - 0.55 * e));
      if (!r.small) {
        g.globalAlpha = 0.85 * (1 - e * 0.6);
        g.drawImage(art.get('halo'), x - sz, y - sz, sz * 2, sz * 2);
        if (fp > 0 && Math.random() < 0.7) emit(1, x, y, 'mote', '#FFE9A6', 0.4);
      }
      g.globalAlpha = r.small ? 1 : 1 - 0.5 * e;
      g.drawImage(art.get(r.key), x - sz / 2, y - sz / 2, sz, sz);
      g.globalAlpha = 1;
    }
  }
  function drawBeams(t) {
    for (let q = beams.length - 1; q >= 0; q--) {
      const b = beams[q], p = (t - b.t0) / b.dur;
      if (p >= 1) { beams.splice(q, 1); continue; }
      const a = 1 - p, x = px(col(b.i)), y = py(row(b.i));
      g.globalAlpha = a * 0.85;
      if (b.kind === ROW || b.kind === COL || b.kind === 5 || b.kind === 6) {
        const w = cs * (b.kind === 5 ? 3 : 1) * (0.7 + 0.3 * a);
        const grow = Math.min(1, p * 4);
        if (b.kind !== COL) { g.fillStyle = BAND(g, 0, y - w / 2, 0, y + w / 2); g.fillRect(x - grow * cs * C, y - w / 2, 2 * grow * cs * C, w); }
        if (b.kind !== ROW) { g.fillStyle = BAND(g, x - w / 2, 0, x + w / 2, 0); g.fillRect(x - w / 2, y - grow * cs * R, w, 2 * grow * cs * R); }
      } else if (b.kind === AREA) {
        const rr = cs * (b.arg === 2 ? 2.6 : 1.7) * Math.min(1, p * 2.5);
        g.strokeStyle = '#FFE7A0'; g.lineWidth = cs * 0.22 * a;
        g.beginPath(); g.arc(x, y, rr, 0, 7); g.stroke();
      } else if (b.kind === SLIGHT) {
        g.strokeStyle = '#FFF1C0'; g.lineWidth = cs * 0.08 * a;
        for (const j of b.to || []) { g.beginPath(); g.moveTo(x, y); g.lineTo(px(col(j)), py(row(j))); g.stroke(); }
        const hr = cs * 2.4 * (0.5 + p); g.drawImage(art.get('halo'), x - hr, y - hr, hr * 2, hr * 2);
      }
      g.globalAlpha = 1;
    }
  }
  function drawTexts(t) {
    for (let q = texts.length - 1; q >= 0; q--) {
      const x = texts[q], p = (t - x.t0) / x.dur;
      if (p >= 1) { texts.splice(q, 1); continue; }
      const sc = p < 0.15 ? 0.6 + p / 0.15 * 0.5 : 1.1 - Math.min(0.1, (p - 0.15));
      g.save(); g.translate(x.x, x.y - p * cs * 0.8); g.scale(sc, sc);
      g.globalAlpha = p > 0.7 ? (1 - p) / 0.3 : 1;
      g.font = `900 ${Math.round(cs * (x.big ? 0.9 : 0.5))}px "Frank Ruhl Libre","Heebo",serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = cs * 0.12; g.strokeStyle = 'rgba(70,35,5,0.85)'; g.strokeText(x.txt, 0, 0);
      g.fillStyle = x.col || '#FFE9A6'; g.fillText(x.txt, 0, 0);
      g.restore();
    }
  }

  /* ── the frame ── */
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const t = now();
    if (!dirty && !animating(t)) return;
    dirty = false;
    try { draw(t); } finally { const d = now() - t; perf.n++; perf.ms += d; if (d > perf.max) perf.max = d; }
  }
  function animating(t) {
    if (rises.length || beams.length || texts.length || live || hintPair || sel >= 0) return true;
    for (const p of spr.values()) if (p.mv || p.sp || p.k === LIGHT || (p.flash && t - p.flash < 320)) return true;
    for (let i = 0; i < shakeAt.length; i++) if (shakeAt[i] > t) return true;
    return false;
  }
  function draw(t) {
    stepMoves(t);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (!art) return;
    g.drawImage(bg, bx - 4 / dpr, by - 4 / dpr, bg.width / dpr, bg.height / dpr);
    for (let i = 0; i < R * C; i++) {
      if (vd[i]) continue;
      const x = bx + col(i) * cs, y = by + row(i) * cs;
      if (ea[i]) g.drawImage(art.get('earth' + Math.min(2, ea[i])), x, y, cs, cs);
      if (ng[i]) g.drawImage(art.get('nug'), x, y, cs, cs);
      if (bk[i]) {
        const sh = shakeAt[i] > t ? Math.sin(t / 18) * cs * 0.05 : 0;
        g.drawImage(art.get('blk:' + field + ':' + Math.min(3, bk[i])), x + sh, y, cs, cs);
      }
    }
    g.save(); g.beginPath(); g.rect(bx, by, cs * C, cs * R); g.clip();
    const pulse = 1 + Math.sin(t / 160) * 0.07;
    for (const p of spr.values()) {
      const cx = bx + (p.x + 0.5) * cs, cy = by + (p.y + 0.5) * cs;
      if (cy < by - cs) continue;
      let sc = 0.9;
      const i = Math.round(p.y) * C + Math.round(p.x);
      const hinted = hintPair && !p.mv && t > hintT && (hintPair[0] === i || hintPair[1] === i);
      if (hinted) sc *= pulse;
      if (i === sel && !p.mv) sc *= 1.1;
      if (p.flash && t - p.flash < 300) sc *= 1 + 0.25 * (1 - (t - p.flash) / 300);
      const sz = cs * sc;
      if (p.sp) {
        const hr = cs * (0.66 + 0.06 * Math.sin(t / 220 + p.id)); g.drawImage(art.get('halo'), cx - hr, cy - hr, hr * 2, hr * 2);
      }
      if (hinted || i === sel) {
        g.strokeStyle = i === sel ? '#FFF3C4' : 'rgba(255,240,190,0.9)'; g.lineWidth = cs * 0.06;
        g.beginPath(); g.roundRect(cx - cs * 0.46, cy - cs * 0.46, cs * 0.92, cs * 0.92, cs * 0.16); g.stroke();
      }
      if (p.k === LIGHT) {
        g.save(); g.translate(cx, cy); g.rotate(t / 1400); g.drawImage(art.get('light'), -sz * 0.6, -sz * 0.6, sz * 1.2, sz * 1.2); g.restore();
      } else g.drawImage(art.get(keyOf(p.k)), cx - sz / 2, cy - sz / 2, sz, sz);
      if (p.sp && p.sp !== SLIGHT) g.drawImage(art.get('b' + p.sp), cx - cs / 2, cy - cs / 2, cs, cs);
      if (p.bn) g.drawImage(art.get('coin'), cx + cs * 0.08, cy + cs * 0.08, cs * 0.4, cs * 0.4);
    }
    g.restore();
    for (let i = 0; i < R * C; i++) if (lk[i] && !vd[i]) g.drawImage(art.get('vine'), bx + col(i) * cs, by + row(i) * cs, cs, cs);
    if (hintPair && t > hintT) {
      // the swipe the hint suggests: a soft arrow from one piece toward the other
      const [a, b] = hintPair, k = (Math.sin(t / 180) + 1) / 2;
      const ax = px(col(a)), ay = py(row(a)), dx = px(col(b)) - ax, dy = py(row(b)) - ay;
      g.save(); g.translate(ax + dx * (0.3 + 0.25 * k), ay + dy * (0.3 + 0.25 * k)); g.rotate(Math.atan2(dy, dx));
      g.globalAlpha = 0.9; g.fillStyle = '#FFF6D2'; g.strokeStyle = 'rgba(90,50,10,0.8)'; g.lineWidth = cs * 0.04;
      g.beginPath(); g.moveTo(cs * 0.22, 0); g.lineTo(-cs * 0.1, -cs * 0.17); g.lineTo(-cs * 0.1, cs * 0.17); g.closePath(); g.fill(); g.stroke();
      g.restore(); g.globalAlpha = 1;
      if (handHint) drawHand(ax, ay, dx, dy, (t - hintT) % 1600 / 1600);
    }
    drawBeams(t);
    drawRises(t);
    drawParticles();
    drawTexts(t);
  }
  const BAND = (gg, x0, y0, x1, y1) => { const gr = gg.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,220,120,0)'); gr.addColorStop(0.5, 'rgba(255,250,225,0.95)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); return gr; };

  /* (wave 8B) the first board's first moves: a hand shows the swipe itself — press on one piece, slide it onto the other */
  let handHint = false, HAND = null;
  function drawHand(ax, ay, dx, dy, u) {
    try { if (!HAND) HAND = new Path2D('M17 4c2.2 0 4 1.8 4 4v13l2.2-.6c2-.5 4 .6 4.6 2.5l.2.6 1.8-.4c2-.4 3.9.8 4.4 2.7l.2.7 1.2-.2c2.1-.3 4 1.2 4.3 3.3l.9 7.3c.4 3.3-.6 6.6-2.8 9.1L36 48H17l-6.5-9.6c-.7-1-1-2.2-.9-3.4l.3-4.1c.2-2.2 2-3.8 4.2-3.8H13V8c0-2.2 1.8-4 4-4z'); } catch (e) { return; }
    const m = u < 0.2 ? 0 : u < 0.7 ? (u - 0.2) / 0.5 : 1, e = m * m * (3 - 2 * m);
    const x = ax + dx * e, y = ay + dy * e, s = (cs * 0.95) / 48, press = u < 0.2 ? 0.92 : 1;
    g.save(); g.globalAlpha = u > 0.8 ? Math.max(0, (1 - u) / 0.2) : 1;
    g.translate(x, y); g.scale(s * press, s * press); g.translate(-17, -4);
    g.fillStyle = '#FFF6DA'; g.strokeStyle = '#1C140A'; g.lineWidth = 2.2; g.fill(HAND); g.stroke(HAND);
    g.restore(); g.globalAlpha = 1;
  }

  /* ── input: swipe or two taps ── */
  let down = null;
  const cellAt = (e) => {
    const rr = root.getBoundingClientRect();
    const c = Math.floor((e.clientX - rr.left - bx) / cs), r = Math.floor((e.clientY - rr.top - by) / cs);
    return c >= 0 && c < C && r >= 0 && r < R ? r * C + c : -1;
  };
  const onDown = (e) => {
    if (e.isTrusted !== false && o.onTouch) { try { o.onTouch(); } catch (err) { /* guarded */ } }   // (wave 8B) a real finger, even mid-move
    if (locked) return;
    const i = cellAt(e); if (i < 0) return;
    down = { i, x: e.clientX, y: e.clientY, used: false };
    try { hit.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  };
  const onMove = (e) => {
    if (!down || down.used || locked) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < cs * 0.33) return;
    down.used = true;
    const a = down.i, b = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? (col(a) < C - 1 ? a + 1 : -1) : (col(a) > 0 ? a - 1 : -1)) : (dy > 0 ? (row(a) < R - 1 ? a + C : -1) : (row(a) > 0 ? a - C : -1));
    sel = -1;
    if (b >= 0 && o.onInput) o.onInput(a, b);
  };
  const onUp = (e) => {
    if (!down) return;
    const d = down; down = null;
    if (d.used || locked) return;
    const i = cellAt(e);
    if (i < 0) return;
    if (sel >= 0 && sel !== i && adjacent(s, sel, i)) { const a = sel; sel = -1; if (o.onInput) o.onInput(a, i); }
    else sel = sel === i ? -1 : i;
  };
  hit.addEventListener('pointerdown', onDown);
  hit.addEventListener('pointermove', onMove);
  hit.addEventListener('pointerup', onUp);
  hit.addEventListener('pointercancel', () => { down = null; });
  const onResize = () => resize();
  globalThis.addEventListener && globalThis.addEventListener('resize', onResize);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms * speed));
  const pieceAt = (i) => { for (const p of spr.values()) if (!p.mv && Math.round(p.x) === col(i) && Math.round(p.y) === row(i)) return p; return null; };

  /* ── the swap (ok = the engine accepted it) ── */
  async function swap(a, b, ok) {
    const pa = pieceAt(a), pb = pieceAt(b), d = 150;
    if (pa) move(pa, col(b), row(b), d * speed, 'ease');
    if (pb) move(pb, col(a), row(a), d * speed, 'ease');
    await wait(d + 10);
    if (ok) return;
    if (pa) move(pa, col(a), row(a), d * speed, 'ease');
    if (pb) move(pb, col(b), row(b), d * speed, 'ease');
    await wait(d + 10);
  }

  /* ── the replay of one move's steps ── */
  async function play(steps, hooks = {}) {
    for (const st of steps) {
      if (st.shuffle) {
        texts.push({ txt: 'מסדרים מחדש', x: bx + cs * C / 2, y: by + cs * R / 2, t0: now(), dur: 1100 * speed, col: '#FFF3C4' });
        for (const [id, i] of st.shuffle) { const p = spr.get(id); if (p) move(p, col(i), row(i), 450 * speed, 'ease'); }
        await wait(520);
        continue;
      }
      const t = now();
      // phase A: vessels rise in light; stone, earth and wood are worked
      const goneCells = [];
      for (const [id, i, k, bn, why] of st.gone) {
        if (!id) continue;
        const p = spr.get(id);
        const x = p ? bx + (p.x + 0.5) * cs : px(col(i)), y = p ? by + (p.y + 0.5) * cs : py(row(i));
        if (k >= 10) { fly(OBJ_RES[k], x, y, k === LOG ? YIELD.forest.objN : k === WSTONE ? 1 : k === NUGGET ? YIELD.gold.objN : YIELD.quarry.objN); emit(6, x, y, 'chip', k === LOG ? '#A0663A' : k === NUGGET ? '#FFD75E' : '#E9D8B4'); }
        else rise(k, x, y, bn);
        goneCells.push(i);
        spr.delete(id);
      }
      for (const [id, i, spc, k] of st.made) {
        const p = spr.get(id) || pieceAt(i);
        if (p) { p.sp = spc; if (spc === SLIGHT) p.k = LIGHT; p.flash = t; }
        emit(10, px(col(i)), py(row(i)), 'mote', '#FFF1B8', 1.4);
      }
      for (const [i, spc, , arg] of st.blasts) beams.push({ i, kind: spc, arg, t0: t, dur: 420 * speed, to: spc === SLIGHT ? goneCells : null });
      const blkRes = (YIELD[field] || YIELD.quarry).blk, blkN = (YIELD[field] || YIELD.quarry).blkN, ch = CHIP[field] || CHIP.quarry;
      for (const [i, left] of st.hits) {
        bk[i] = left; shakeAt[i] = t + 220;
        emit(left ? 5 : 10, px(col(i)), py(row(i)), field === 'forest' ? 'leaf' : 'chip', ch[(Math.random() * 3) | 0], left ? 0.8 : 1.3);
        if (field === 'forest') emit(4, px(col(i)), py(row(i)), 'chip', '#8A5A2E');
        fly(blkRes, px(col(i)), py(row(i)), blkN);
      }
      for (const [i, left, nug] of st.earth) {
        ea[i] = left;
        emit(6, px(col(i)), py(row(i)), 'dust', 'rgba(120,85,50,0.55)', 0.6);
        if (nug) { ng[i] = 0; fly('gold', px(col(i)), py(row(i)), YIELD.gold.hidN); emit(8, px(col(i)), py(row(i)), 'mote', '#FFE27A', 1.2); }
      }
      for (const i of st.vines) { lk[i] = Math.max(0, lk[i] - 1); emit(8, px(col(i)), py(row(i)), 'leaf', Math.random() < 0.5 ? '#4E9A3E' : '#2F6B2A'); }
      if (st.c > 1 && st.gone.length) {
        const w = ['', '', 'יפה!', 'מצוין!', 'נפלא!', 'אדיר!'][Math.min(5, st.c)];
        texts.push({ txt: w, x: bx + cs * C / 2, y: by + cs * R * 0.42, t0: t, dur: 900 * speed, big: 1 });
      }
      if (hooks.onClear) hooks.onClear(st);
      const hasClear = st.gone.length || st.hits.length || st.earth.length || st.vines.length || st.blasts.length;
      if (hasClear) await wait(st.blasts.length ? 300 : 230);
      // phase B: the pieces fall (with a small bounce); new ones come in from above; logs float out to the sea
      const tB = now(), fin = new Map();
      for (const [id, , to] of st.fall) fin.set(id, to);
      const newIn = new Array(C).fill(0);
      for (const [, i] of st.spawn) newIn[col(i)]++;
      let far = 0;
      for (const [id, to] of fin) {
        const p = spr.get(id); if (!p) continue;
        const d = Math.hypot(col(to) - p.x, row(to) - p.y); far = Math.max(far, d);
        move(p, col(to), row(to), (130 + 75 * Math.sqrt(d) * 1.6) * speed);
        p.mv.t0 = tB;
      }
      for (const [id, i, k, sp, bn] of st.spawn) {
        const p = { id, k, sp, bn, x: col(i), y: row(i) - newIn[col(i)] - 0.3, mv: null, flash: 0 };
        spr.set(id, p);
        const d = row(i) - p.y; far = Math.max(far, d);
        move(p, col(i), row(i), (130 + 75 * Math.sqrt(d) * 1.6) * speed);
      }
      for (const [id, i] of st.exit) {
        const p = spr.get(id); if (!p) continue;
        move(p, col(i), R + 0.9, 520 * speed, 'ease');
        const x = px(col(i)), y = by + cs * R;
        setTimeout(() => { emit(12, x, y, 'drop', '#7FC3F0', 1.2); fly('cedar', x, y, YIELD.forest.objN); }, 380 * speed);
        setTimeout(() => spr.delete(id), 560 * speed);
      }
      if (far > 0 || st.exit.length) await wait(Math.max(st.exit.length ? 560 : 0, 130 + 75 * Math.sqrt(far) * 1.6) + 30);
      if (hooks.onLand) hooks.onLand(st);
    }
  }

  resize();
  sync(s);
  raf = requestAnimationFrame(frame);
  return {
    resize, sync, swap, play,
    hint(pair, o) { hintPair = pair; hintT = now(); handHint = !!(pair && o && o.hand); dirty = true;
      // ── ux24 ── the pair the board is pulsing, in screen px (the kid's play script follows what a kid sees) ── /ux24 ──
      try { const rr = root.getBoundingClientRect(); globalThis.__UX24_M3 = pair ? pair.map((i) => ({ x: rr.left + px(col(i)), y: rr.top + py(row(i)) })) : null; } catch (e) { /* */ }
    },
    lock(b) { locked = !!b; if (b) sel = -1; dirty = true; },
    label(i, txt) { texts.push({ txt, x: px(col(i)), y: py(row(i)) - cs * 0.3, t0: now(), dur: 950 * speed, col: '#FFF3C4' }); },
    praise(txt, col) { texts.push({ txt, x: bx + cs * C / 2, y: by + cs * R * 0.42, t0: now(), dur: 1300 * speed, big: 1, col }); },
    /* the level is won: light rises from every cell of the board */
    celebrate() {
      for (let i = 0; i < R * C; i++) if (!vd[i] && Math.random() < 0.55) emit(2, px(col(i)), py(row(i)), 'mote', Math.random() < 0.5 ? '#FFF1B8' : '#FFD35E', 1.6);
      beams.push({ i: (R >> 1) * C + (C >> 1), kind: AREA, arg: 2, t0: now(), dur: 700 * speed });
    },
    setSpeed(x) { speed = x; },
    get locked() { return locked; },                     // (wave 8B) tests: a player waits for the board to settle
    perf,
    cellCenter(i) { return { x: px(col(i)), y: py(row(i)) }; },
    get cs() { return cs; },
    destroy() {
      alive = false; cancelAnimationFrame(raf);
      globalThis.removeEventListener && globalThis.removeEventListener('resize', onResize);
      cv.remove(); bgc.remove();
    },
  };
}
