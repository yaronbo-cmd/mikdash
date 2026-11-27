/* ── build 138 ── h138/parochot-view.js — work 2 "להשתיק שתי פרוכות" on the 2D screen (spec shlav-15-he.md v4, עבודה 2): the section
 * of the amah traksin from the Heichal. Left = south (the outer's edge and its gold hook, reached from the Heichal), right = north (the
 * inner's edge and its hook, reached from the narrow box let down through the lul). Up = the void (black, never drawn); the far line is
 * the inner, the near hanging face the outer; the dark floor between them is the amah. A pull along an edge folds it (it stays where it
 * is left); the full fold released on its hook while the cloth there is calm takes it. Every pull sends one wave; moving a held edge
 * ACROSS (up / down) as a wave's bulge reaches it, at the wave's own size, CATCHES it. A free edge lifted by a big wave lets a seam of
 * light onto the floor. The model: parochot-model.js. Used by the game's act (parochot.js) and by the lab's prototype. */
import * as P from './parochot-model.js';

const MUL = [1, 1, 2, 4];
export function parochotView(SC, lv, opt = {}) {
  const { g, hit, loss, bonus, pop, snd, buzz, hand, F } = SC;
  const take = (r) => SC.take(r), sweep = () => SC.sweep();

  const ZX = (z) => 320 - z * 25.6, XZ = (x) => (320 - x) / 25.6, UY = 76.8;
  const IN_Y = 118, OUT_Y = 196, OUT_B = 340;
  const REST = { S: { x: 72, y: 250 }, N: { x: 566, y: IN_Y } };
  const HOOK = { S: { x: 72 + P.PV.FOLD + 10, y: 250 + P.PV.HOOK_Y }, N: { x: 566 - P.PV.FOLD - 10, y: IN_Y + P.PV.HOOK_Y } };
  const HELP = { x: 548, y: 262 };
  let S = null, t = 0, ended = false, fade = 0, endT = 0, words = '';
  S = P.fresh(lv); fade = 1;
  const grip = (e) => { const d = S.edges[e], r = REST[e]; return e === 'S' ? { x: r.x + d.x, y: r.y + d.y } : { x: r.x - d.x, y: r.y - d.y }; };
  SC.fingers((f) => {
    if (!S || ended || S.moving) return null;
    const has = (r) => [...F.values()].some((o) => o.role === r);
    const e = S.phase === 'heichal' ? 'S' : 'N';
    if (f.button === 2) return has('help') ? null : 'help';
    if (!has('work')) { const gp = grip(e); if (Math.hypot(f.x - gp.x, f.y - gp.y) < 46) return 'work'; }
    if (!has('help')) {
      if (S.P.palm && S.P.palm !== 'none') return 'help';
      if (S.phase === 'teivah' && Math.hypot(f.x - HELP.x, f.y - (HELP.y + S.helper.y)) < 50) return 'help';
    }
    if (!has('work') && f.button === 0 && f.pointerType !== 'touch') { const gp = grip(e); if (Math.hypot(f.x - gp.x, f.y - gp.y) < 70) return 'work'; }
    return null;
  });
  const lights = [];
  function u(z) { return P.uAt(S, z); }
  function drawScene() {
    // the void (never drawn: black), the amah's floor, the Heichal's side (dim gold light)
    g.fillStyle = '#000'; g.fillRect(-1000, -1000, 3000, 3000);
    const hg = g.createLinearGradient(0, OUT_Y, 0, 400); hg.addColorStop(0, '#3A2C18'); hg.addColorStop(1, '#6E5630'); g.fillStyle = hg; g.fillRect(-1000, OUT_Y, 3000, 1000);
    g.fillStyle = '#120D08'; g.fillRect(ZX(10), IN_Y, ZX(-10) - ZX(10), OUT_Y - IN_Y);
    // the light seams on the floor (a free edge lifted)
    for (let i = lights.length - 1; i >= 0; i--) { const L = lights[i]; L.a -= 1 / 60 / 1.1; if (L.a <= 0) { lights.splice(i, 1); continue; } const x = ZX(L.e === 'S' ? 10 : -10), w = 150 * L.A / 0.25; const gr = g.createLinearGradient(x, 0, x + (L.e === 'S' ? w : -w), 0); gr.addColorStop(0, `rgba(255,236,170,${0.85 * L.a})`); gr.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = gr; g.fillRect(Math.min(x, x + (L.e === 'S' ? w : -w)), IN_Y + 8, w, OUT_Y - IN_Y - 16); }
    // the walls at the two ends
    g.fillStyle = '#8E8070'; g.fillRect(-1000, 60, 1000 + ZX(10), 400); g.fillRect(ZX(-10), 60, 1000, 400);
    // the palm (level 2): a translucent hand on the cloth
    if (S.palm) { const x = ZX(S.palm.z), y = S.phase === 'heichal' ? OUT_Y + 40 : IN_Y - 4; g.fillStyle = 'rgba(127,216,255,.35)'; g.beginPath(); g.ellipse(x, y, 18, 24, 0, 0, 7); g.fill(); }
    // the inner: a heavy line, bulging toward the void (up)
    cloth(IN_Y, -1, 14, ['#26346A', '#4E2752', '#74222A', '#A9A291']);
    // the outer: a hanging face seen from the Heichal, its top bulging toward us (down)
    cloth(OUT_Y, 1, OUT_B - OUT_Y, ['#26346A', '#4E2752', '#74222A', '#A9A291']);
    // the folds and the hooks
    for (const e of ['S', 'N']) {
      const d = S.edges[e], h = HOOK[e], r = REST[e], dir = e === 'S' ? 1 : -1;
      g.fillStyle = '#E8C04A'; g.strokeStyle = '#6A4A10'; g.lineWidth = 2; g.beginPath(); g.arc(h.x, h.y, 7, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(h.x, h.y); g.lineTo(h.x, h.y + (e === 'S' ? 26 : -26)); g.stroke();
      if (d.fold > 0.01 || d.hooked) {
        const len = (d.hooked ? 1 : d.fold) * (P.PV.FOLD + 10);
        const gp = d.hooked ? { x: h.x, y: h.y + (e === 'S' ? d.y : -d.y) } : grip(e);
        g.fillStyle = '#C9B48E'; g.strokeStyle = '#3A2A14'; g.lineWidth = 2; g.beginPath();
        const y0 = e === 'S' ? OUT_Y + 4 : IN_Y - 7, y1 = e === 'S' ? OUT_B - 10 : IN_Y + 7;
        g.moveTo(r.x - dir * 8, y0); g.lineTo(gp.x, Math.min(y0, gp.y - 14)); g.lineTo(gp.x, Math.max(y1, gp.y + 14)); g.lineTo(r.x - dir * 8, y1); g.closePath(); g.fill(); g.stroke();
        void len;
      }
    }
    // the box at the north end (the narrow teivah let down through the lul)
    if (S.phase === 'teivah' || (S.moving && S.moving < 3)) { const bx = ZX(-9.3), by = S.moving ? 40 + (3 - S.moving) * 20 : 100; g.strokeStyle = '#B79A6A'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, -100); g.lineTo(bx, by - 30); g.stroke(); g.fillStyle = '#6B4A2A'; g.strokeStyle = '#2E1C0C'; g.beginPath(); g.roundRect(bx - 16, by - 30, 32, 70, 4); g.fill(); g.stroke(); }
    // the grips (the work edge pulses until the first pull), the helper's place in the box
    const e = S.phase === 'heichal' ? 'S' : 'N';
    if (!S.moving) {
      const gp = grip(e), wf = [...F.values()].find((o) => o.role === 'work');
      g.strokeStyle = wf ? '#FFC94A' : `rgba(255,201,74,${0.5 + 0.4 * Math.sin(t * 4)})`; g.lineWidth = 3; g.beginPath(); g.arc(gp.x, gp.y, 30, 0, 7); g.stroke();
      if (S.phase === 'teivah' && S.P.palm === 'none' || S.finale) { const hf = [...F.values()].find((o) => o.role === 'help'); g.strokeStyle = hf ? '#7FD8FF' : 'rgba(127,216,255,.55)'; g.beginPath(); g.arc(HELP.x, HELP.y + S.helper.y, 30, 0, 7); g.stroke(); }
      if (S.free && !S.pulses.length) hand(true, gp.x + (e === 'S' ? 40 : -40), gp.y + 20, t);
    }
  }
  function cloth(y0, sgn, depth, cols) {
    const n = 128, x0 = ZX(10), x1 = ZX(-10);
    const pts = []; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, z = XZ(x), v = u(z); pts.push({ x, y: y0 + sgn * v * UY, v }); }
    // the face (stripes of the four colours, illustration) with fold shadows ∝ √(|u| / 0.25)
    const top = pts.map((p) => p.y), sgnD = sgn > 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[i + 1], c = cols[Math.floor(i / 3) % cols.length];
      const yA = sgnD > 0 ? p.y : p.y - depth, yB = sgnD > 0 ? p.y + depth : p.y;
      g.fillStyle = c; g.fillRect(p.x, Math.min(yA, top[i]), q.x - p.x + 0.6, Math.abs(yB - yA));
      const sh = Math.min(0.75, Math.sqrt(Math.abs(p.v) / 0.25) * 0.75); const slope = (q.y - p.y);
      if (sh > 0.04) { g.fillStyle = slope * sgn > 0 ? `rgba(0,0,0,${sh})` : `rgba(255,240,210,${sh * 0.45})`; g.fillRect(p.x, Math.min(yA, top[i]), q.x - p.x + 0.6, Math.abs(yB - yA)); }
    }
    g.strokeStyle = '#1A1008'; g.lineWidth = 2; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
  }
  function frame(dt) {
    dt = Math.min(0.033, dt); t += dt;
    if (S && !ended) {
      const e = S.phase === 'heichal' ? 'S' : 'N';
      const wf = take('work'), hf = take('help'); sweep();
      const inp = {};
      if (wf) { const r = REST[e]; inp[e] = e === 'S' ? { down: !wf.up, x: wf.x - r.x, y: wf.y - r.y } : { down: !wf.up, x: r.x - wf.x, y: r.y - wf.y }; }
      if (hf && !hf.up) inp.H = { down: true, y: hf.y - HELP.y, z: XZ(hf.x) };
      if (S.P.palm && S.P.palm !== 'none' && inp.H) { const ze = e === 'S' ? 10 : -10; if (Math.abs(inp.H.z - ze) > P.PV.PALM) inp.H = null; }
      const E = P.step(S, dt, inp);
      for (const ev of E) {
        const gp = grip(e);
        if (ev.e === 'light') { lights.push({ e: ev.edge, A: Math.min(0.25, ev.A), a: 1 }); }
        if (ev.e === 'pulse') snd('cloth');
        if (ev.e === 'step') { hit(gp.x, gp.y - 40, ev.grade, MUL[lv]); }
        if (ev.e === 'hooked') { snd('cloth'); buzz(30); }
        if (ev.e === 'slip') { pop(gp.x, gp.y - 30, 'הבד עוד נע', '#FFE0A0'); }
        if (ev.e === 'tear') { snd('tear'); buzz(80); loss(gp.x, gp.y - 50, 20 * MUL[lv], 'קרע בשפה'); }
        if (ev.e === 'catch') { const at = ev.who === 'H' ? { x: HELP.x, y: HELP.y } : ev.edge === 'S' ? grip('S') : grip('N'); snd(ev.kind === 'catch' ? 'catch' : 'cloth'); if (ev.kind === 'catch') buzz(15); pop(at.x, at.y - 34, ev.kind === 'catch' ? 'נתפס' : ev.kind === 'part' ? 'כמעט' : ev.kind === 'fast' ? 'חזק מדי' : 'חלש מדי', ev.kind === 'catch' ? '#BFF7C0' : '#FFE0A0'); }
        if (ev.e === 'to-box') fade = 0.001;
        if (ev.e === 'done') { endT = 0.01; }
        if (opt.onEvent) opt.onEvent(ev, S);
      }
      if (S.palm && lv === 1 && !S.palmBonus) { S.palmBonus = 1; bonus(ZX(S.palm.z), OUT_Y + 60, 10, 'ריסון'); }
    }
    if (S && S.moving) fade = Math.min(1, S.moving > 3 ? (6 - S.moving) / 2 : S.moving / 2); else if (fade > 0 && !(S && S.moving)) fade = Math.max(0, fade - dt * 1.5);
    if (endT > 0 && !ended) { endT += dt; if (endT > 2.2) { ended = true; const r = P.result(S, MUL[lv]); if (opt.onEnd) opt.onEnd(r, lv === 3 ? 'האמה שקטה וחשוכה' : lv === 2 ? 'שתי הפרוכות פרופות' : 'הפרוכת פרופה', S); } }
    SC.frameDp(); g.clearRect(-1000, -1000, 3000, 3000);
    if (S) drawScene();
    if (fade > 0) { g.fillStyle = `rgba(0,0,0,${Math.min(1, fade)})`; g.fillRect(-1000, -1000, 3000, 3000); }
    try { globalThis.__P138 = S; } catch (e) { /* */ }
  }
  return { frame, get S() { return S; }, get ended() { return ended; } };
}
