/* ── build 135 ── h135/hamshacha.js — work 3 "ההמשכה מבור הגולה" (spec docs/specs/shlav-12-he.md v7, עבודה 3; the rules:
 * hamshacha-model.js). Night in the court, by torchlight, before the paving. The Golah's water comes in the covered stone conduit to a
 * mouth at the strip's end (levels 2–3: two mouths); its wooden sluice lifts by itself as the work begins. A strip of earth some thirty
 * amot long; at its other end the basin of forty se'ah hewn in the rock (its line, its white stones), its spill to the kiyor's pit, the
 * drain's chute beside it. In the earth: hard stones the finger slides round, and an old wooden trough (a vessel: water through it is
 * drawn — Mikvaot 4 — no words: an X on it and a dull sound, and the water turned aside). The kohen kneels in the earth (rule 62).
 *   · the work finger digs: a drag in the earth opens a channel, and the water runs in it at once;
 *   · at a bend the outer bank shows its packing strip; from level 2 the helping hand holds on it: the bank goes dark and smooth. An
 *     unpacked bend cracks (the crack spreads, wet earth creaks) and then breaches: the water escapes, the mud runs to the basin, the
 *     white stones cover — pack the breach and the clear stream pushes the mud out by the drain in seconds. (A second finger anywhere on
 *     the strip while digging is the helping hand; one finger on a bend while not digging packs it, too. The mouse: the space bar held
 *     packs under the pointer.) Level 1 packs its turns by itself (only a hairpin cracks, slowly). Level 3: the current swells and
 *     ebbs (the sluice by itself), a bank packed too long narrows the channel and the water goes over the lip.
 *   · a step: two amot of channel the water ran through clean 40, cracked and packed in time 20, breached 10; a breach −20 (kept: the
 *     dark earth). The goal: the basin full to its line with the white stones showing; then the night passes fast and the pit fills.
 *   HAMSHACHA_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as H from './hamshacha-model.js';
import { mats12 } from './look.js';
import { own, SH12 } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices12, px360, groundAt } from './kit12.js';
import { box } from '../h131/world.js';
import { fingers } from '../h113/acts.js';

const S12 = BOOK.s12, F = S12.floor, Fd = S12.field, B = S12.basin, P = S12.pit, CAM = S12.cam.geshem;
export const HA = Object.freeze({ FOV: 50, PX: 8, REDRAW: 0.08, FILL_T: 4.5 });
const C = { earth: '#8A6B4A', old: '#5A4130', dug: '#3E2C1E', stone: '#9E968A', trough: '#7A5A36', water: [62, 142, 160], mud: [120, 86, 52], strip: 'rgba(240,220,170,0.75)', packed: '#2E2016', crack: '#1A120A', breach: 'rgba(110,78,46,0.85)' };

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices12(X), Mt = mats12(X);
  const root = new T.Group(); root.name = 'h135-hamshacha-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, dig: null, packs: new Map(), sp: 0, mouse: null, redraw: 0, firstSeg: true, sounds: {} };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  // (a channel is the night's: a reload begins the night again — the old one stays dark in the earth)
  const S = H.fresh(lv, S12);
  if (Mo.st.sunk) { Mo.st.sunk = 0; X.save(); }
  own('field', true);
  // ── the earth as a canvas over the strip
  const NX = S.NX, NZ = S.NZ, px = HA.PX;
  const base = document.createElement('canvas'); base.width = NX * px; base.height = NZ * px;
  { const g = base.getContext('2d'); g.fillStyle = C.earth; g.fillRect(0, 0, base.width, base.height); let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < NX * NZ * 3; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,40,22,0.2)' : 'rgba(180,150,110,0.18)'; g.fillRect(rnd() * base.width, rnd() * base.height, 2 + rnd() * 4, 2 + rnd() * 4); }
    const tr = Mo.st.trace; if (tr && tr.cells) { g.fillStyle = 'rgba(60,42,28,0.55)'; for (const k of tr.cells) { const i = k % NX, j = (k / NX) | 0; g.fillRect(i * px, j * px, px, px); } } }
  const cv = document.createElement('canvas'); cv.width = base.width; cv.height = base.height; const cg = cv.getContext('2d');
  const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
  const plane = new T.Mesh(new T.PlaneGeometry(Fd.x1 - Fd.x0, Fd.z1 - Fd.z0), new T.MeshStandardMaterial({ map: tex, roughness: 0.95, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.18 }));
  plane.rotation.x = -Math.PI / 2; plane.position.set((Fd.x0 + Fd.x1) / 2, F + 0.012, (Fd.z0 + Fd.z1) / 2); plane.receiveShadow = true; root.add(plane);
  // (canvas row 0 is the strip's north edge, z0: the texture's top is the plane's +y, −z after the rotation)
  const cell = (i, j) => [i * px, j * px];
  // the hard stones (raised) and the trough (a wooden box), in 3D over the earth
  for (const b of S12.stones[lv] || []) box(X, Mt.y12stoneHard, b[0] + 0.05, F, b[1] + 0.05, b[2] - 0.05, F + 0.35, b[3] - 0.05, root);
  const tb = S12.trough[lv]; let trX = null;
  if (tb) { box(X, Mt.y12woodD, tb[0], F, tb[1], tb[2], F + 0.45, tb[3], root); trX = new T.Group(); trX.visible = false; root.add(trX); const L = Math.hypot(tb[2] - tb[0], tb[3] - tb[1]); for (const s of [-1, 1]) { const b = new T.Mesh(new T.BoxGeometry(L * 0.9, 0.1, 0.14), Mt.y12x); b.rotation.y = s * Math.atan2(tb[3] - tb[1], tb[2] - tb[0]); trX.add(b); } trX.position.set((tb[0] + tb[2]) / 2, F + 0.52, (tb[1] + tb[3]) / 2); }
  // the torches (the night's light) and one warm light over the strip
  const torch = new T.PointLight('#FFB060', 2.2, 46, 1.2); torch.position.set((Fd.x0 + Fd.x1) / 2 + 4, F + 9, (Fd.z0 + Fd.z1) / 2); root.add(torch);
  for (const [x, z] of [[Fd.x1 + 1, Fd.z1 - 2], [Fd.x1 + 1, (Fd.z0 + Fd.z1) / 2], [Fd.x1 + 1, Fd.z0 + 2], [Fd.x0 - 1, (Fd.z0 + Fd.z1) / 2]]) {
    box(X, Mt.y12woodD, x - 0.08, F, z - 0.08, x + 0.08, F + 2.4, z + 0.08, root);
    const fl = new T.Mesh(new T.ConeGeometry(0.16, 0.5, 8), Mt.y12torch); fl.position.set(x, F + 2.65, z); root.add(fl);
  }
  // the basin's water (rising to its line) and the pit's (the big moment), in the cut
  const inCut = (mm, k) => { const M = mm.material; M.transparent = false; M.blending = T.CustomBlending; M.blendSrc = T.SrcAlphaFactor; M.blendDst = T.OneMinusSrcAlphaFactor; M.blendEquation = T.AddEquation; mm.renderOrder = -7.5 + 0.5 + 0.2 * k; return mm; };
  const bwM = new T.MeshStandardMaterial({ color: '#3E8EA0', roughness: 0.05, transparent: true, opacity: 0.82 });
  const bw = inCut(new T.Mesh(new T.PlaneGeometry(0.98, 0.98), bwM), 3); bw.rotation.x = -Math.PI / 2; bw.visible = false; bw.position.set((B.box[0] + B.box[2]) / 2, F - B.depth, (B.box[1] + B.box[3]) / 2); root.add(bw);
  const pwM = new T.MeshStandardMaterial({ color: '#2E7486', roughness: 0.05, transparent: true, opacity: 0.85 });
  const pw = inCut(new T.Mesh(new T.PlaneGeometry(P.box[2] - P.box[0] - 0.02, P.box[3] - P.box[1] - 0.02), pwM), 3); pw.rotation.x = -Math.PI / 2; pw.visible = false; pw.position.set((P.box[0] + P.box[2]) / 2, P.floor, (P.box[1] + P.box[3]) / 2); root.add(pw);
  // the spill's water (the big moment) and the drain's mud
  const spillW = new T.Mesh(new T.BoxGeometry(0.36, 0.04, S12.spill.from[1] - S12.spill.to[1]), bwM); spillW.position.set(S12.spill.from[0], F + 0.08, (S12.spill.from[1] + S12.spill.to[1]) / 2); spillW.visible = false; root.add(spillW);
  const drainW = new T.Mesh(new T.BoxGeometry(S12.drain.to[0] - S12.drain.at[0] + 0.5, 0.04, 0.3), Mt.y12mud); drainW.position.set((S12.drain.at[0] - 0.5 + S12.drain.to[0]) / 2, F + 0.07, S12.drain.at[1]); drainW.visible = false; root.add(drainW);
  // the sluices: lifted as the work begins
  const sluices = ['mouth1', 'mouth2'].slice(0, S.mouths.length).map((k) => (SH12.g ? SH12.g.getObjectByName('h135-sluice-' + k) : null));
  A.sluice = 0;
  // ── the camera: high from the east (about 55°)
  const cam0 = X.camera, fov0 = cam0.fov;
  const home = (d = 0) => { lens(X, HA.FOV); X.shot(CAM[0].slice(), CAM[1].slice(), d); };
  const onField = (p) => p && p.x >= Fd.x0 - 0.3 && p.x <= Fd.x1 + 0.3 && p.z >= Fd.z0 - 0.3 && p.z <= Fd.z1 + 0.3;
  const gp = (f) => groundAt(X, f.x, f.y, F);
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      const p = gp(f); if (!onField(p)) return;
      if (A.dig || (H.packTarget(S, p.x, p.z) && !A.dig && S.bends.length)) { A.packs.set(f.id, { x: p.x, z: p.z }); ev('pack'); return; }
      A.dig = { id: f.id }; H.touch(S, p.x, p.z); X.hand(null); ev('dig'); out(H.dig(S, p.x, p.z));
    },
    move(f) {
      const p = gp(f); if (!p) return;
      if (A.dig && f.id === A.dig.id) { out(H.dig(S, Math.max(Fd.x0, Math.min(Fd.x1, p.x)), Math.max(Fd.z0, Math.min(Fd.z1, p.z)))); return; }
      if (A.packs.has(f.id)) A.packs.set(f.id, { x: p.x, z: p.z });
    },
    up(f) {
      if (A.dig && f.id === A.dig.id) { A.dig = null; H.lift(S); return; }
      A.packs.delete(f.id);
    },
  });
  const onKey = (e) => { if (e.code !== 'Space') return; try { e.preventDefault(); } catch (er) { /* */ } A.sp = e.type === 'keydown'; };
  const onPtr = (e) => { A.mouse = { x: e.clientX, y: e.clientY }; };
  /** the events of the digging */
  function out(evs) {
    for (const e of evs) {
      if (e.k === 'dug') { if (!A.sounds.dug || A.t - A.sounds.dug > 0.12) { A.sounds.dug = A.t; V.earth(); } A.dirty = true; }
      else if (e.k === 'stone') { if (!A.sounds.stone || A.t - A.sounds.stone > 0.4) { A.sounds.stone = A.t; V.knock && V.knock(1.4); } }
      else if (e.k === 'trough') { V.trough(); if (trX) { trX.visible = true; A.trT = 0; } ev('trough'); }
      else if (e.k === 'bend') { ev('bend:' + e.ang); A.dirty = true; }
    }
  }
  function onStep(evs) {
    for (const e of evs) {
      if (e.k === 'wet') A.dirty = true;
      else if (e.k === 'crack') { V.creakEarth(); ev('crack'); }
      else if (e.k === 'packed') { V.knock && V.knock(2); ev('packed'); }
      else if (e.k === 'breach') { V.breach(); ev('breach'); A.dirty = true; hurt(X, Mo, 'hamshacha.breach', V3(X, e.x, F + 0.3, e.z), { lv, at: [+e.x.toFixed(1), +e.z.toFixed(1)] }); }
      else if (e.k === 'repaired') { V.knock && V.knock(2); ev('repaired'); }
      else if (e.k === 'over') { V.splash(1.2); ev('over'); }
      else if (e.k === 'seg') {
        const g = S.segs[e.n], k = g && g.cells.length ? g.cells[g.cells.length - 1] : null, c = k != null ? H.centre(S, k % NX, (k / NX) | 0) : [(Fd.x0 + Fd.x1) / 2, (Fd.z0 + Fd.z1) / 2];
        if (A.firstSeg) { A.firstSeg = false; if (e.grade !== 'gold') { g.grade = 'gold'; try { X.line('ניסוי חינם: המקטע הראשון לא נספר', 1600); } catch (er) { /* */ } continue; } }
        award(X, V3(X, c[0], F + 0.3, c[1]), e.grade, lv, 'עפר'); ev('seg:' + e.grade);
      } else if (e.k === 'meet') { V.meet(); ev('meet'); try { X.sparks(e.x, F + 0.4, e.z, 10); } catch (er) { /* */ } }
      else if (e.k === 'reach') { V.splash(1.2); ev('reach:' + e.n); }
      else if (e.k === 'line') { ev('line'); if (e.mud >= H.HK.CLEAR) { try { X.line('המים עכורים בקו: נשפכים דרך המגלש עד שיהיו צלולים', 2400); } catch (er) { /* */ } } }
      else if (e.k === 'clear') { ev('clear'); }
      else if (e.k === 'done') { ev('done'); bigMoment(); }
    }
  }
  /** the canvas: the earth, the channels (dry dark, wet water — muddy as the mud), the bends' strips and cracks, the breaches' fans */
  function paint() {
    cg.drawImage(base, 0, 0);
    const mud = S.mud, wc = C.water.map((v, i) => Math.round(v + (C.mud[i] - v) * Math.min(1, mud * 1.3))), sh = Math.sin(A.t * 3);
    for (let k = 0; k < S.cells.length; k++) {
      const kind = S.cells[k]; if (kind === H.KIND.EARTH) continue;
      const i = k % NX, j = (k / NX) | 0, [x, y] = cell(i, j);
      if (kind === H.KIND.STONE) { cg.fillStyle = C.stone; cg.fillRect(x, y, px, px); continue; }
      if (kind === H.KIND.TROUGH) { cg.fillStyle = C.trough; cg.fillRect(x, y, px, px); continue; }
      if (S.wet[k] >= 0) { const l = 1 + 0.08 * Math.sin(i * 1.7 + j * 0.9 - A.t * 4) + 0.03 * sh; cg.fillStyle = `rgb(${Math.round(wc[0] * l)},${Math.round(wc[1] * l)},${Math.round(wc[2] * l)})`; }
      else cg.fillStyle = C.dug;
      cg.fillRect(x, y, px, px);
    }
    const toC = (wx, wz) => [((wx - Fd.x0) / H.HK.CELL) * px, ((wz - Fd.z0) / H.HK.CELL) * px];
    for (const b of S.bends) {
      const [cx, cy] = toC(b.x + b.out[0] * 0.75, b.z + b.out[1] * 0.75), ang = Math.atan2(b.out[1], b.out[0]);
      cg.save(); cg.translate(cx, cy); cg.rotate(ang);
      if (b.state === 'ok' && lv > 1) { cg.fillStyle = C.strip; cg.globalAlpha = b.crack > 0 ? 0.6 + 0.4 * Math.abs(Math.sin(A.t * 8)) : 0.75; cg.fillRect(-px * 0.5, -px * 1.6, px, px * 3.2); cg.globalAlpha = 1; }
      if (b.state === 'packed' || b.state === 'repaired' || b.packed > 0) { cg.fillStyle = C.packed; cg.globalAlpha = Math.max(0.3, b.packed); cg.fillRect(-px * 0.5, -px * 1.6, px, px * 3.2); cg.globalAlpha = 1; }
      if (b.crack > 0 && b.state === 'ok') { cg.strokeStyle = C.crack; cg.lineWidth = 2; cg.beginPath(); const L = px * 3 * b.crack; cg.moveTo(0, -L / 2); for (let s = 1; s <= 5; s++) cg.lineTo((s % 2 ? 3 : -3), -L / 2 + (L * s) / 5); cg.stroke(); }
      if (b.state === 'breach') { cg.fillStyle = C.breach; cg.beginPath(); cg.moveTo(0, -px); cg.lineTo(px * 4, -px * 3); cg.lineTo(px * 4.5, px * 3); cg.lineTo(0, px); cg.fill(); }
      cg.restore();
    }
    tex.needsUpdate = true;
  }
  async function bigMoment() {
    if (A.busy) return; A.busy = 2; A.dig = null; A.packs.clear();
    V.meet(); try { if (X.haptic) X.haptic([40, 40, 40]); } catch (e) { /* */ }
    // (the basin over its line: the spill runs to the pit; the night passes fast and the pit fills to the sink line)
    spillW.visible = true; pw.visible = true;
    X.shot([P.box[2] + 9, F + 9, P.box[3] + 8], [(P.box[0] + P.box[2]) / 2, P.floor + 4, (P.box[1] + P.box[3]) / 2], 1.6);
    A.fill = { t: 0 };
    await X.wait(HA.FILL_T + 0.6); if (A.ended) return;
    const res = H.result(S), at = V3(X, (P.box[0] + P.box[2]) / 2, P.sink, (P.box[1] + P.box[3]) / 2);
    if (res.bonus) extra(X, 40, lv, 'work', 'בלי פריצה');
    Mo.st.trace = H.trace(S); Mo.st.water = 1; X.save();
    Mo.keep(m.k, null);
    await finish(X, A, res, WORDS.hamshacha, at, { eye: [P.box[2] + 9, F + 9, P.box[3] + 8], aim: [(P.box[0] + P.box[2]) / 2, P.floor + 4, (P.box[1] + P.box[3]) / 2], secs: 1.2, kohen: true, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (A.hintOn) return; A.hintOn = 1; const [x, z] = S12.golah.mouth1; X.hand({ x, y: F, z: z - 1.2 }, 0, 40); }
  let pt = null;
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); home(0.01);
      try { const E = X.pack && X.pack.time; if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ }
      X.line(lv === 1 ? 'לילה. חפרו באצבע תעלה מהמוצא אל אגן הארבעים: המים זורמים בה מיד' : 'חפרו באצבע אחת. בכל פנייה, האצבע השנייה מהדקת את פס הדופן שמבחוץ', 5200);
      try { addEventListener('keydown', onKey); addEventListener('keyup', onKey); addEventListener('pointermove', onPtr, true); } catch (e) { /* */ }
      try { X.stages.hero.place({ x: Fd.x1 + 1.2, z: S12.golah.mouth1[1] - 4, face: [S12.golah.mouth1[0], S12.golah.mouth1[1] - 4] }); } catch (e) { /* (the kohen kneels in the earth by the strip) */ }
      X.wait(1.0).then(() => { if (!A.ended) hint(); });
      paint(); ev('begin');
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame && V.frame();
        // the sluices lift by themselves at the start
        if (A.sluice < 1) { A.sluice = Math.min(1, A.sluice + dt / 1.2); for (const s of sluices) if (s) { s.userData.y0 = s.userData.y0 != null ? s.userData.y0 : s.position.y; s.position.y = s.userData.y0 + 0.7 * A.sluice; } }
        if (!A.busy) {
          const hands = [...A.packs.values()];
          if (A.sp && A.mouse) { const p = groundAt(X, A.mouse.x, A.mouse.y, F); if (onField(p)) hands.push({ x: p.x, z: p.z }); }
          onStep(H.step(S, Math.min(dt, 1 / 20), hands));
          V.hiss(S.mouths.some((q) => q.reached) || S.wet.some((w) => w >= 0) ? 0.5 * H.current(S) : 0);
        }
        // the basin fills; the pit at the big moment
        const bf = S.basin.fill; bw.visible = bf > 0.01; bw.position.y = F - B.depth + (B.line - (F - B.depth)) * bf;
        bwM.color.setRGB(...[0.24, 0.55, 0.63].map((v, i) => v + ([0.47, 0.34, 0.2][i] - v) * Math.min(1, S.mud * 1.3)));
        drainW.visible = S.mud > 0.02 && S.mouths.some((q) => q.reached);
        if (A.fill) { A.fill.t += dt; const k = Math.min(1, A.fill.t / HA.FILL_T); pw.position.y = P.floor + (P.sink - P.floor) * k; }
        if (trX && trX.visible) { A.trT += dt; if (A.trT > 2.4) trX.visible = false; }
        A.redraw -= dt; if (A.redraw <= 0) { A.redraw = HA.REDRAW; paint(); }
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h135] hamshacha', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.dig = null; A.packs.clear(); H.lift(S); },
    wants(p) { if (!p) return true; if (A.dig) return true; return onField(gp(p)); },
    holds() { return !!(A.dig || A.packs.size); },
    lensFov: HA.FOV,
    end() {
      A.ended = true; FG.detach(); V.hiss(0); V.hush(); X.hand(null); lens(X, fov0);
      try { removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('pointermove', onPtr, true); } catch (e) { /* */ }
      try { const E = X.pack && X.pack.time; if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ }
      for (const s of sluices) if (s && s.userData.y0 != null) s.position.y = s.userData.y0;
      try { tex.dispose(); } catch (e) { /* */ }
      X.props.remove(root); own('field', false);
    },
    at() { return V3(X, (Fd.x0 + Fd.x1) / 2, F, (Fd.z0 + Fd.z1) / 2); },
    dbg() {
      const r2 = (v) => +(+v).toFixed(2), sc = (x, z) => { pt = X.scr(x, F, z); return [Math.round(pt.x), Math.round(pt.y)]; };
      return { id: m.id, lv, t: r2(S.t), mud: r2(S.mud), fill: r2(S.basin.fill), met: !!S.met, mouths: S.mouths.map((q) => ({ n: q.n, reached: q.reached, scr: sc(q.x, q.z - 0.6) })), basin: sc(B.at[0], B.box[3] + 0.2), bends: S.bends.map((b) => ({ n: b.n, ang: b.ang, state: b.state, crack: r2(b.crack), packed: r2(b.packed), scr: sc(b.x + b.out[0] * 0.75, b.z + b.out[1] * 0.75) })),
        segs: S.segs.filter((g) => g.grade).map((g) => g.grade[0]).join(''), breaches: S.breaches, done: S.done, busy: A.busy, finished: A.finished, dig: !!A.dig, packs: A.packs.size, ev: A.ev.slice(-12) };
    },
    /** the probes: a world point's screen point on the strip */
    _scr(x, z) { const q = X.scr(x, F, z); return [Math.round(q.x), Math.round(q.y)]; }, _S: () => S,
  };
}
export const HAMSHACHA_ACT = { icon: '💧', title: 'ההמשכה מבור הגולה', walkLine: () => 'ההמשכה מבור הגולה: אל רצועת העפר, לילה', stand() { return { x: Fd.x1 + 1.2, z: S12.golah.mouth1[1] - 4, face: [S12.golah.mouth1[0], S12.golah.mouth1[1] - 4] }; }, prepare() {}, make };
