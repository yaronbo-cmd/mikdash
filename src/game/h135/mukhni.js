/* ── build 135 ── h135/mukhni.js — work 2 "המוכני" (spec docs/specs/shlav-12-he.md v8, עבודה 2; the machine and its load:
 * mukhni-model.js, docs/specs/shlav-12-kinematika-he.md). Spec v8: from the south, about 20° up, along the axle: the big vertical
 * wheel a great circle at the screen's left, the chains, the kiyor and the pit at its right — and since the pit's water is low and far,
 * the pit is also shown in a window at the screen's lower right (a second camera into the pit: the water, the kiyor's rim against the
 * water line). The brake's handle stands on its lever at the wheel's east side.
 *   · the work finger on the rim drags it round (clockwise as seen: down); the wheel's speed follows the finger's, with its own weight: a
 *     push of a quarter turn goes on turning;
 *   · from level 2 the helping hand on the brake's handle: dragged toward the wheel the shoe presses harder (counter force, not a lock).
 *     (A second finger anywhere while the rim is held is the brake. The mouse: the space bar held presses the shoe, more the longer.)
 *   · each turn (an amah down): 40 clean; 20 if it ran faster than safe (the axle creaks); 10 if it stuck (the brake too hard) or hit —
 *     too fast as the bottom crossed the pit's rim, the water or the stop: a dent in the copper (−20, kept). Level 3: a sharp change of
 *     speed spills water from the full kiyor (−20, no three stars). The first turn is a free try. The tongue clicks at every spoke.
 *   · level 1: a dry descent of three amot, the shoe by itself; levels 2–3 after work 3 (water in the pit), nine amot to the stop.
 *   MUKHNI_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as K from './mukhni-model.js';
import { mats12 } from './look.js';
import { own, SH12 } from './world.js';
import { award, hurt, finish, V3, lens, voices12, px360, MIN_GRIP } from './kit12.js';
import { fingers } from '../h113/acts.js';

const S12 = BOOK.s12, MK = S12.mukhni, KI = S12.kiyor, CAM = S12.cam.mukhni, PIP = S12.cam.pip;
export const MA = Object.freeze({ FOV: 46, PIP: { w: 0.36, h: 0.44, m: 10, fov: 42 }, BRAKE_PX: 70, SPACE_T: 0.8, HIST: 0.12 });

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices12(X), Mt = mats12(X);
  const root = new T.Group(); root.name = 'h135-mukhni-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, wh: null, br: null, sp: 0, bk: 0, tongue: 0, crack: 0, hist: [] };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  if (Mo.st.sunk) { Mo.st.sunk = 0; X.save(); }
  SH12.hold = true; SH12.d = S.d; SH12.ang = S.ang;
  // (level 2 the kiyor goes down empty; level 3 full — its water rocks inside)
  own('kiyorWater', lv === 2); SH12.own.kiyorFull = lv === 3;
  // ── the second camera into the pit (the picture in the picture): main.js draws it after the frame (globalThis.__H135_PIP)
  const pipCam = new T.PerspectiveCamera(MA.PIP.fov, 1, 0.3, 400);
  const frame = new T.Group(); root.add(frame);
  const pipBox = () => { const w = Math.round(innerWidth * MA.PIP.w), h = Math.round(innerHeight * MA.PIP.h), mm = MA.PIP.m; return { x: innerWidth - w - mm, y: mm, w, h }; };
  let pipEl = null;
  try { pipEl = document.createElement('div'); pipEl.className = 'h109-ui h135-pip'; pipEl.style.cssText = 'position:fixed;z-index:4;border:3px solid #E9D8B4;border-radius:10px;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.4)'; document.body.appendChild(pipEl); } catch (e) { pipEl = null; }
  const pipDraw = (renderer, scene) => {
    if (A.ended || A.finished) { if (pipEl) pipEl.style.display = 'none'; return; }
    const b = pipBox(); if (pipEl) { pipEl.style.right = MA.PIP.m - 3 + 'px'; pipEl.style.bottom = MA.PIP.m - 3 + 'px'; pipEl.style.width = b.w + 'px'; pipEl.style.height = b.h + 'px'; }
    pipCam.aspect = b.w / b.h; pipCam.position.set(...PIP[0]); pipCam.lookAt(PIP[1][0], PIP[1][1] - 0 * SH12.d, PIP[1][2]); pipCam.updateProjectionMatrix(); pipCam.updateMatrixWorld();
    const ac = renderer.autoClear, vp = new T.Vector4(), sc = new T.Vector4(), st = renderer.getScissorTest(); renderer.getViewport(vp); renderer.getScissor(sc);
    renderer.autoClear = false; renderer.setScissorTest(true); renderer.setViewport(b.x, b.y, b.w, b.h); renderer.setScissor(b.x, b.y, b.w, b.h);
    renderer.clear(true, true, false); renderer.render(scene, pipCam);
    renderer.setViewport(vp); renderer.setScissor(sc); renderer.setScissorTest(st); renderer.autoClear = ac;
  };
  // ── the camera
  const cam0 = X.camera, fov0 = cam0.fov;
  const home = (d = 0) => { lens(X, MA.FOV); X.shot(CAM[0].slice(), CAM[1].slice(), d); };
  const scrOf = (x, y, z) => { const r = X.scr(x, y, z); return { x: r.x, y: r.y }; };
  const g2 = () => Math.max(MIN_GRIP * px360(), 26);
  /** the wheel on the screen: its centre and the ellipse's two half axes */
  function wheelScr() {
    const c = scrOf(MK.x, MK.axle.y, MK.wheel.z), r = MK.wheel.r;
    const e = scrOf(MK.x + r, MK.axle.y, MK.wheel.z), n = scrOf(MK.x, MK.axle.y + r, MK.wheel.z);
    return { c, ax: Math.max(10, Math.hypot(e.x - c.x, e.y - c.y)), ay: Math.max(10, Math.hypot(n.x - c.x, n.y - c.y)) };
  }
  const handleScr = () => { const k = SH12.refs && SH12.refs.knob; if (!k) return scrOf(MK.brake.handle[0], MK.brake.handle[1], MK.brake.z); const p = k.getWorldPosition(new T.Vector3()); return scrOf(p.x, p.y, p.z); };
  const polar = (f) => { const W = wheelScr(), u = (f.x - W.c.x) / W.ax, v = (f.y - W.c.y) / W.ay; return { r: Math.hypot(u, v), a: Math.atan2(v, u), W }; };
  const onRim = (f) => { const p = polar(f); return p.r > 0.45 && p.r < 1.25; };
  const onHandle = (f) => { const h = handleScr(); return Math.hypot(f.x - h.x, f.y - h.y) < g2() * 1.5; };
  // ── the fingers
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      if (lv > 1 && !A.br && (onHandle(f) || (A.wh && !onRim(f)))) { const h = handleScr(), W = wheelScr(); A.br = { id: f.id, x0: f.x, y0: f.y, dir: (() => { const dx = W.c.x - h.x, dy = W.c.y - h.y, L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; })(), k: 0.35 }; X.hand(null); ev('brake'); return; }
      if (!A.wh && onRim(f)) { const p = polar(f); A.wh = { id: f.id, a: p.a, hist: [{ t: A.t, a: p.a }], acc: 0 }; X.hand(null); ev('rim'); return; }
    },
    move(f) {
      if (A.wh && f.id === A.wh.id) { const p = polar(f); let da = p.a - A.wh.a; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2; A.wh.a = p.a; A.wh.acc += da; return; }
      if (A.br && f.id === A.br.id) { const q = A.br, along = (f.x - q.x0) * q.dir[0] + (f.y - q.y0) * q.dir[1]; q.k = Math.max(0, Math.min(1, 0.35 + along / (MA.BRAKE_PX * px360()))); return; }
    },
    up(f) {
      if (A.wh && f.id === A.wh.id) { A.wh = null; ev('rim-up'); return; }
      if (A.br && f.id === A.br.id) { A.br = null; return; }
    },
  });
  const onKey = (e) => { if (e.code !== 'Space' || lv === 1) return; try { e.preventDefault(); } catch (er) { /* */ } A.sp = e.type === 'keydown' ? A.sp || 1 : 0; };
  /** the finger's speed round the axis (rev/s): its angle's change over the last tenth of a second */
  function fingerW() {
    if (!A.wh) return 0;
    const h = A.wh.hist; h.push({ t: A.t, a: A.wh.acc }); while (h.length > 2 && A.t - h[0].t > MA.HIST) h.shift();
    const w = Math.max(1e-3, h[h.length - 1].t - h[0].t); return (h[h.length - 1].a - h[0].a) / w / (Math.PI * 2);
  }
  const brakeIn = (dt) => { if (A.br) return A.br.k; if (A.sp) { A.bk = Math.min(1, A.bk + dt / MA.SPACE_T); return A.bk; } A.bk = Math.max(0, A.bk - dt * 3); return A.bk; };
  const kiyorAt = () => V3(X, KI.x, K.bottom(S) + KI.h, KI.z);
  function handle(e) {
    const at = kiyorAt();
    if (e.k === 'tick') { A.tongue = 1; V.click(); }
    else if (e.k === 'creak') { V.creak(); ev('creak'); }
    else if (e.k === 'stuck') { V.stuck(); ev('stuck'); try { X.line('נתקע: הבלם חזק מדי. לשחרר מעט ולסובב שוב', 2200); } catch (er) { /* */ } }
    else if (e.k === 'rim') { ev('rim-cross'); }
    else if (e.k === 'water') { V.splash(1.4); ev('water'); }
    else if (e.k === 'hit') {
      ev('hit:' + e.where);
      if (S.steps.length === 0 && !(e.where === 'stop')) { const i = S.flaws.map((x) => x.f).lastIndexOf('mukhni.dent'); if (i >= 0) S.flaws.splice(i, 1); V.dent(); try { X.line('ניסוי חינם: לאט יותר ליד השפה', 1800); } catch (er) { /* */ } }
      else { V.dent(); hurt(X, Mo, 'mukhni.dent', at, { lv, at: e.where }); }
    } else if (e.k === 'splash') { V.splash(1.6); ev('splash'); hurt(X, Mo, 'mukhni.splash', at, { lv, at: S.d }); try { X.dust(KI.x + 1.5, K.bottom(S) + KI.h, KI.z, 6, 2); } catch (er) { /* */ } }
    else if (e.k === 'turn') {
      ev('turn:' + e.i + ':' + e.grade);
      if (e.i === 0 && e.grade !== 'gold' && !resumed) { try { X.line('ניסוי חינם: הסיבוב הראשון לא נספר', 1600); } catch (er) { /* */ } }
      else award(X, at, e.grade, lv, 'עץ');
      keep();
    } else if (e.k === 'stop') { ev('stop'); V.knock && V.knock(1); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    // (the first turn's free try: it counts as gold in the result)
    if (!resumed && S.steps[0] && S.steps[0].grade !== 'gold' && !S.steps[0].hit) S.steps[0].grade = 'gold';
    const res = K.result(S), at = kiyorAt();
    Mo.keep(m.k, null); X.save();
    await X.wait(0.6);
    await finish(X, A, res, WORDS.mukhni, at, { eye: [MK.x + 9, 31, MK.z + 17], aim: [MK.x, 19, MK.z], secs: 1.4, kohen: true, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn) return; A.hintOn = 1; X.hand({ x: MK.x + MK.wheel.r, y: MK.axle.y, z: MK.wheel.z }, 0, 40); }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); home(0.01);
      try { globalThis.__H135_PIP = pipDraw; } catch (e) { /* */ }
      X.line(resumed ? '' : lv === 1 ? 'גררו את שפת הגלגל במעגל: הבורג יורד והכיור איתו. הקשיבו לנקישות' : 'יד אחת מסובבת את הגלגל, השנייה לוחצת על ידית הבלם. כשהכיור נכנס למים הוא נעשה קל', resumed ? 0 : 5200);
      try { addEventListener('keydown', onKey); addEventListener('keyup', onKey); } catch (e) { /* */ }
      try { X.stages.hero.place({ x: MK.stand[0], z: MK.stand[1], face: [MK.x, MK.wheel.z] }); } catch (e) { /* */ }
      // (level 1: one beat of the tongue shows the pace, no more)
      if (lv === 1 && !resumed) X.wait(1.2).then(() => { if (!A.ended) { A.tongue = 1; V.click(); setTimeout(() => { try { V.click(); } catch (e) { /* */ } }, 700); } });
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame && V.frame();
        if (!A.busy && !A.finished) {
          const fw = fingerW(), b = brakeIn(dt);
          const evs = K.step(S, Math.min(dt, 1 / 30), { hold: !!A.wh, fw: Math.max(0, fw), brake: b });
          for (const e of evs) handle(e);
        }
        SH12.d = S.d; SH12.ang = S.ang; SH12.brake = S.brake;
        A.tongue = Math.max(0, A.tongue - dt * 6); const tg = SH12.refs && SH12.refs.tongue; if (tg) tg.rotation.z = 0.35 * A.tongue;
        // (spec v8 §3, §12d: the physical sign of the load's change — the chains go slack and the kiyor swings when he runs it fast once the
        // water takes it; a light tremble while the load changes. No chain sound at all (§12c): only water, the wheel's creak, the tongue.)
        { const sb = K.sub(S), fast = S.w > K.MK.W_SAFE ? Math.min(1, (S.w - K.MK.W_SAFE) / 0.4) : 0, wet = sb > 0 ? 1 : 0;
          A.slk = (A.slk || 0) + (wet * fast - (A.slk || 0)) * Math.min(1, dt * 3);
          A.swA = (A.swA || 0) + ((0.02 * fast + 0.05 * A.slk) - (A.swA || 0)) * Math.min(1, dt * 2);
          SH12.slack = A.slk;
          SH12.sway = A.swA * Math.sin(A.t * 2.6) + (sb > 0 && sb < 1 && S.w > 0.05 ? Math.sin(A.t * 31) * 0.004 : 0); }
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h135] mukhni', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { A.wh = null; A.br = null; keep(); },
    wants(p) { if (!p) return true; if (A.wh || A.br) return true; return onRim(p) || (lv > 1 && onHandle(p)); },
    holds() { return !!(A.wh || A.br); },
    lensFov: MA.FOV,
    end() { A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0); try { if (globalThis.__H135_PIP === pipDraw) globalThis.__H135_PIP = null; } catch (e) { /* */ } try { if (pipEl) pipEl.remove(); } catch (e) { /* */ } try { removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); } catch (e) { /* */ } X.props.remove(root); SH12.hold = false; SH12.sway = 0; SH12.slack = 0; own('kiyorWater', false); SH12.own.kiyorFull = false; void frame; },
    at() { return V3(X, MK.x, MK.axle.y, MK.wheel.z); },
    dbg() {
      const W = wheelScr(), h = handleScr(), r2 = (v) => +(+v).toFixed(3);
      return { id: m.id, lv, d: r2(S.d), w: r2(S.w), load: r2(S.load), brake: r2(S.brake), sub: r2(K.sub(S)), steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.map((x) => x.f), done: S.done, busy: A.busy, finished: A.finished,
        wheel: { c: [Math.round(W.c.x), Math.round(W.c.y)], ax: Math.round(W.ax), ay: Math.round(W.ay) }, handle: [Math.round(h.x), Math.round(h.y)], pip: pipBox(), held: !!A.wh, br: !!A.br, ev: A.ev.slice(-12) };
    },
  };
}
export const MUKHNI_ACT = { icon: '☸️', title: 'המוכני', walkLine: () => 'המוכני: במדרגות אל הבמה שליד הגלגל', stand() { return { x: MK.stand[0], z: MK.stand[1], face: [MK.x, MK.wheel.z] }; }, prepare() {}, make };
