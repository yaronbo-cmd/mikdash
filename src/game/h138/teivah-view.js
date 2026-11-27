/* ── build 138 ── h138/teivah-view.js — work 1 "האומן בתיבה" on the 2D screen (spec shlav-15-he.md v4, עבודה 1): the whole screen is
 * the view from inside the box. The opening (60% of the height) shows only the gold before the box; under it the tool's slot. Bottom
 * right: the tool's handle with its engraved line and the light body of the tool beside it, which bends over a raised lip (the only
 * information). Bottom left: the pole (drag up = pressed to the wall, it stays; down = off; at the corner, drag sideways = turn the
 * box). Level 3: the shutter's tab on the opening's left edge (drag right = shut, left = open). The rope along the top: hold 1 s =
 * rise early. The model: teivah-model.js. Used by the game's act (teivah.js) and by the lab's prototype. */
import * as T from './teivah-model.js';

const MUL = [1, 1, 2, 4];
export function teivahView(SC, lv, opt = {}) {
  const { g, hit, loss, bonus, pop, snd, buzz, hand, F } = SC;
  const take = (r) => SC.take(r), sweep = () => SC.sweep();

  const O = { x: 320, y: 148, r: 108 };                // the opening (centre, half size: 216 dp)
  const SLOT = { x: 320, y: 272, w: 96 };
  const HANDLE = { x0: 420, x1: 628, y: 316, zone: { x0: 400, x1: 640, y0: 262, y1: 360 } };
  const POLE = { zone: { x0: 0, x1: 210, y0: 262, y1: 360 } };
  const SHUT = { x: O.x - O.r - 10, y: O.y };
  const ROPE = { y1: 30 };
  let S = null, t = 0, fx = [], ended = false, fade = 0, sheen = 0, rise = 0, riseHold = 0, poleY = 0, poleX0 = 0, turn0 = 0, shutV = 0;
  S = T.enter(T.fresh(lv)); fade = 1;
  const inZone = (f, z) => f.x >= z.x0 && f.x <= z.x1 && f.y >= z.y0 && f.y <= z.y1;
  SC.fingers((f) => {
    if (!S || ended) return null;
    const work = [...F.values()].some((o) => o.role === 'tool'), help = [...F.values()].some((o) => o.role === 'pole' || o.role === 'shutter');
    if (f.y < ROPE.y1) return 'rope';
    if (f.button === 2) { if (lv === 3 && Math.hypot(f.x - SHUT.x - shutV * O.r * 2, f.y - SHUT.y) < 44) return 'shutter'; return 'pole'; }
    if (!work && inZone(f, HANDLE.zone)) return 'tool';
    if (!help && lv === 3 && Math.hypot(f.x - (SHUT.x + shutV * O.r * 2), f.y - SHUT.y) < 44) return 'shutter';
    if (!help && inZone(f, POLE.zone)) return 'pole';
    return null;
  });
  // ── the gold's reflections: bands broken in pieces (never where the lip is: they only unify when all is flat)
  function bands(k) { const B = []; for (let i = 0; i < 9; i++) { const pieces = []; for (let j = 0; j < 4; j++) pieces.push(((i * 7 + j * 13 + k * 5) % 11 - 5) / 5); B.push({ y: -0.24 + i * 0.06, w: 0.012 + ((i * 3) % 4) * 0.004, pieces }); } return B; }
  let B = bands(0);
  function remaining() { let a = 0, b = 0; for (const l of S.st.lips) for (const q of l.s) { a += q.h; b += 1; } return b ? Math.min(1, (a / b) / 0.6) : 0; }
  function wallToScr(wx, wy, vc) { return { x: O.x + (wx - vc.x) * T.TV.K, y: O.y - (wy - vc.y) * T.TV.K }; }
  function drawOpening(vc) {
    g.save();
    g.beginPath(); g.roundRect(O.x - O.r, O.y - O.r, O.r * 2, O.r * 2, 26); g.clip();
    const faces = T.facesRoom(S);
    if (faces && S.shutter < 0.5) { g.fillStyle = '#000'; g.fillRect(O.x - O.r, O.y - O.r, O.r * 2, O.r * 2); }
    else {
      // the gold patch
      const gr = g.createLinearGradient(O.x - O.r, O.y - O.r, O.x + O.r, O.y + O.r); gr.addColorStop(0, '#B8892A'); gr.addColorStop(0.5, '#E2B54A'); gr.addColorStop(1, '#A87A22');
      g.fillStyle = gr; g.fillRect(O.x - O.r, O.y - O.r, O.r * 2, O.r * 2);
      // the corner's seam (level 3, the last station): the west wall begins at x 0.17
      if (S.st.corner) { const c = wallToScr(T.TV.REACH, 0, vc); g.fillStyle = 'rgba(60,40,10,.35)'; g.fillRect(c.x, O.y - O.r, O.r * 2, O.r * 2); g.fillStyle = 'rgba(40,25,5,.8)'; g.fillRect(c.x - 1.5, O.y - O.r, 3, O.r * 2); }
      // the reflections: broken while any lip stands, joined into one quiet sheet when all is flat
      const br = sheen > 0 ? 0 : remaining();
      for (const b of B) for (let j = 0; j < 4; j++) {
        const off = b.pieces[j] * 0.03 * br, x0 = -0.3 + j * 0.15, x1 = x0 + 0.15;
        const a = wallToScr(x0, b.y + off + x0 * 0.4, vc), c = wallToScr(x1, b.y + off + x1 * 0.4, vc);
        g.strokeStyle = `rgba(255,244,200,${0.18 + 0.12 * (1 - br) + sheen * 0.3})`; g.lineWidth = b.w * T.TV.K; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(c.x, c.y); g.stroke();
      }
      if (sheen > 0) { g.fillStyle = `rgba(255,240,190,${0.25 * Math.sin(Math.PI * Math.min(1, sheen))})`; g.fillRect(O.x - O.r, O.y - O.r, O.r * 2, O.r * 2); }
      // what stays: creases (dark crescents) and scratches (dull patches)
      for (const c of S.creases) if (c.k === S.k) { const p = wallToScr(c.x, c.y, vc); g.strokeStyle = 'rgba(70,40,5,.85)'; g.lineWidth = 3; g.beginPath(); g.arc(p.x, p.y, 9, 0.3, 2.6); g.stroke(); }
      for (const c of S.scratches) if (c.k === S.k) { const p = wallToScr(c.x, c.y, vc); g.fillStyle = 'rgba(120,100,70,.5)'; g.beginPath(); g.ellipse(p.x, p.y, 14, 6, -0.4, 0, 7); g.fill(); }
      for (const [key, n] of Object.entries(S.rub)) if (n >= T.TV.RUB) { const [cx, cy] = key.split(',').map(Number); const p = wallToScr(cx * T.TV.CELL, cy * T.TV.CELL, vc); g.fillStyle = 'rgba(150,130,90,.22)'; g.beginPath(); g.arc(p.x, p.y, 12, 0, 7); g.fill(); }
      // the tool's tip on the gold (its body comes up from the slot)
      if (!T.blind(S)) {
        const tp = { x: O.x + S.tip.x * T.TV.K, y: O.y - S.tip.y * T.TV.K };
        g.strokeStyle = 'rgba(60,40,20,.45)'; g.lineWidth = 10; g.beginPath(); g.moveTo(SLOT.x + S.tip.x * T.TV.K * 0.4, O.y + O.r + 4); g.lineTo(tp.x, tp.y + 6); g.stroke();
        g.fillStyle = '#D9C09A'; g.strokeStyle = '#5A4228'; g.lineWidth = 2; g.beginPath(); g.roundRect(tp.x - 9, tp.y - 6, 18, 14, 5); g.fill(); g.stroke();
      }
    }
    // the shutter (level 3)
    if (lv === 3 && S.shutter > 0.02) { const w = O.r * 2 * S.shutter; g.fillStyle = '#5B3F22'; g.fillRect(O.x - O.r, O.y - O.r, w, O.r * 2); g.strokeStyle = '#3A2812'; g.lineWidth = 2; for (let y = O.y - O.r + 18; y < O.y + O.r; y += 22) { g.beginPath(); g.moveTo(O.x - O.r, y); g.lineTo(O.x - O.r + w, y); g.stroke(); } }
    g.restore();
    g.strokeStyle = '#2A1A0C'; g.lineWidth = 6; g.beginPath(); g.roundRect(O.x - O.r, O.y - O.r, O.r * 2, O.r * 2, 26); g.stroke();
  }
  function drawBox() {
    // the box's dark wood, lit faintly from the lul above
    const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#4A3420'); gr.addColorStop(1, '#1E140A');
    g.fillStyle = gr; g.fillRect(-400, -100, 1440, 560);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; for (let x = -400; x < 1040; x += 46) { g.beginPath(); g.moveTo(x, -100); g.lineTo(x, 460); g.stroke(); }
    // the rope above (hold to rise)
    g.strokeStyle = '#B79A6A'; g.lineWidth = 5; g.beginPath(); g.moveTo(300, 0); g.lineTo(300, 24); g.moveTo(340, 0); g.lineTo(340, 24); g.stroke();
    if (riseHold > 0) { g.fillStyle = 'rgba(255,230,170,.6)'; g.fillRect(260, 2, 120 * riseHold, 5); }
    // the slot under the opening
    g.fillStyle = '#0E0804'; g.fillRect(SLOT.x - SLOT.w / 2, SLOT.y - 4, SLOT.w, 8);
  }
  function drawHandle() {
    // the handle: a wooden bar; along it the ENGRAVED straight line, and the tool's light body beside it, bending over a lip
    const { x0, x1, y } = HANDLE, L = x1 - x0;
    g.fillStyle = '#6B4A2A'; g.strokeStyle = '#2E1C0C'; g.lineWidth = 3; g.beginPath(); g.roundRect(x0 - 10, y - 20, L + 20, 40, 14); g.fill(); g.stroke();
    const sep = (S.bend / T.TV.BEND) * 24;            // dp between the arc and the line (≤ 24 at 12°)
    const snapped = S.bend < T.TV.SNAP * 0.5;
    // the body (light wood), an arc
    g.strokeStyle = snapped ? '#FFF2CF' : '#EED8AE'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y - 4); g.quadraticCurveTo((x0 + x1) / 2, y - 4 - sep * 2, x1, y - 4); g.stroke();
    // the engraved line
    g.strokeStyle = '#1C1006'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0, y - 4); g.lineTo(x1, y - 4); g.stroke();
    g.lineCap = 'butt';
    if (T.toolStopped(S)) { g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.roundRect(x0 - 10, y - 20, L + 20, 40, 14); g.fill(); }
    // his hand on it (the work hand: gold ring)
    const f = [...F.values()].find((o) => o.role === 'tool'); if (f) { g.strokeStyle = '#FFC94A'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, 26, 0, 7); g.stroke(); }
  }
  function drawPole() {
    // the pole: from the box's left side to the wall; pressed = its pad flat on the wall
    const p = S.pole, ex = 214, ey = p ? 228 : 262;
    g.strokeStyle = '#8A6A44'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 342); g.lineTo(ex, ey); g.stroke(); g.lineCap = 'butt';
    g.fillStyle = p ? '#C9A46A' : '#6B5234'; g.beginPath(); g.ellipse(ex + 4, ey - 4, 12, p ? 5 : 8, -0.6, 0, 7); g.fill();
    if (S.st.corner) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(30, 352, 160, 4); g.fillStyle = '#9EE8FF'; g.fillRect(30 + 160 * (S.turn / T.TV.TURN) - 4, 348, 8, 12); }
    const f = [...F.values()].find((o) => o.role === 'pole' || o.role === 'shutter'); if (f) { g.strokeStyle = '#7FD8FF'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, 26, 0, 7); g.stroke(); }
    if (lv === 3) { const x = SHUT.x + shutV * O.r * 2; g.fillStyle = '#7A5634'; g.strokeStyle = '#2E1C0C'; g.lineWidth = 2; g.beginPath(); g.roundRect(x - 12, SHUT.y - 26, 24, 52, 8); g.fill(); g.stroke(); }
  }
  function frame(dt) {
    dt = Math.min(0.05, dt); t += dt;
    if (S && !ended) {
      const inp = {};
      const tf = take('tool'); inp.tool = tf && !tf.up ? { down: true, dx: tf.dx, dy: tf.dy } : { down: false };
      const pf = take('pole');
      if (pf) {
        {
          const ddy = pf.y - pf.y0, ddx = pf.x - pf.x0;
          if (ddy < -30 && !S.pole) inp.pole = 'pin';
          if (ddy > 30 && S.pole) inp.pole = 'free';
          if (S.st.corner && S.pole && Math.abs(ddx) > 12) { if (pf.turn0 == null) { const ff = F.get(pf.id); if (ff) ff.turn0 = S.turn; } const ff = F.get(pf.id); inp.turn = (ff && ff.turn0 != null ? ff.turn0 : S.turn) + (ddx / 160) * T.TV.TURN; }
        }
      }
      const sf = take('shutter'); if (sf && !sf.up) { const ff = F.get(sf.id); if (ff.s0 == null) ff.s0 = shutV; shutV = Math.max(0, Math.min(1, ff.s0 + (sf.x - sf.x0) / (O.r * 2))); inp.shutter = shutV; }
      const rf = take('rope'); if (rf && !rf.up) { riseHold += dt; if (riseHold >= 1) inp.rise = true; } else riseHold = 0;
      sweep();
      const E = T.step(S, dt, inp);
      for (const e of E) {
        if (e.e === 'tick') { snd('tick'); buzz(8); }
        if (e.e === 'crease') { snd('crease'); buzz(60); loss(O.x, O.y, 20 * MUL[lv], 'קמט בריקוע'); }
        if (e.e === 'scratch') { snd('crease'); loss(O.x, O.y + 40, 20 * MUL[lv], 'שריטה'); }
        if (e.e === 'pole-off' && e.knocked) { pop(120, 250, 'המוט זז', '#FFD9A0'); }
        if (e.e === 'pole' && lv === 1 && !S.poleBonus) { S.poleBonus = 1; bonus(120, 250, 10, 'מוט'); }
        if (opt.onEvent) opt.onEvent(e, S);
        if (e.e === 'snap') { snd('snap'); buzz(20); }
        if (e.e === 'station') { hit(O.x, O.y - 40, e.grade, MUL[lv]); sheen = 0.01; }
        if (e.e === 'next') { fade = 1; B = bands(S.k); shutV = 0; S.shutter = 0; }
        if (e.e === 'rise') { rise = 0.01; }
      }
    }
    if (sheen > 0) sheen = Math.min(2, sheen + dt * 0.8); if (sheen >= 1.2 && !ended) sheen = 0;
    if (fade > 0) fade = Math.max(0, fade - dt * 1.2);
    if (rise > 0 && !ended) { rise += dt * 0.6; if (rise >= 1) { ended = true; const r = T.result(S, MUL[lv]); if (opt.onEnd) opt.onEnd(r, S.early ? 'עלית לפני הזמן' : 'מתקנין מה שצריך בלבד, ועולין', S); } }
    SC.frameDp(); g.clearRect(-1000, -1000, 3000, 3000);
    drawBox(); if (S) { const vc = T.viewC(S); drawOpening(vc); drawHandle(); drawPole(); }
    if (S && S.nDrags === 0) hand(true, (HANDLE.x0 + HANDLE.x1) / 2, HANDLE.y - 46, t);
    if (fade > 0 || rise > 0) { g.fillStyle = rise > 0 ? `rgba(255,248,228,${Math.min(1, rise)})` : `rgba(0,0,0,${fade})`; g.fillRect(-1000, -1000, 3000, 3000); }
    try { globalThis.__T138 = S; } catch (e) { /* */ }
  }
  return { frame, get S() { return S; }, get ended() { return ended; } };
}
