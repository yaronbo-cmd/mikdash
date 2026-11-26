/* ── build 136 ── h136/maltra.js — work 1 "חמש המלתראות" (spec docs/specs/shlav-13-he.md v4, עבודה 1; the model: maltra-model.js).
 * The machine (a wooden crane on the steps' top) carries the lintel and holds its hook right over its place; two tag lines guide it, one
 * at each end, down to the kohen at the steps' foot. The fixed view: from the east at the lintels' height, a little over, down 10°.
 *   · each thumb on its handle (the two rings at the screen's bottom): a drag down, toward oneself, draws its line taut — the deeper, the
 *     tauter (60 dp full); a drag back slackens; the thumb lifted leaves it slack (a slack line sags dark, its ring empty; a taut line is
 *     straight and light, its ring full). The handle at the screen's LEFT is the line of the end at the screen's left: looking west, that
 *     is the SOUTH end (the spec's "left = north" is the mirror: the hands follow what they see — a reversible decision, the baton's);
 *     its ring sky blue (the left hand), the right one gold;
 *   · the quiet (both ends' sway under 0.1, the centre within 0.1 of rest, half a second): both lines glow; let go of both within 0.45 s
 *     (or tap a handle when both are slack): the machine lowers it (2 s); the grade is the lower of parallel and overhang (40 / 20 / 10);
 *     worse: a scratch on the painted beam or a broken course edge (−20, kept), the machine lifts it again;
 *   · level 1 beams 1–2 (the place's shadow, the thresholds doubled, one thumb: the other line the machine's); level 2 beams 3–4 (the
 *     north–south sway); level 3 beam 5 and the top course (the gusts from the north, the flag flaps a second before).
 * Mouse: the left button on a handle is that hand; the right button pressed alone works the right handle; both pressed draw both.
 *   MALTRA_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { WORDS } from './model.js';
import * as K from './maltra-model.js';
import { mats13, beamMat, ropeMesh } from './look.js';
import { own, SH13 } from './world.js';
import { award, extra, hurt, finish, V3, lens, voices13, px360, ring, HANDS, dp } from './kit13.js';
import { fingers } from '../h113/acts.js';

const S13 = BOOK.s13, MA = S13.maltra, FR = S13.front, CAM = MA.cam;
export const MT = Object.freeze({ FOV: 46, PULL: 60, TAP_T: 0.25, TAP_D: 12, HANDLE: 30, HANDLE_Y: 0.84, HANDLE_X: 0.14, GHOST: 0.5 });

function make(m, X) {
  const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = voices13(X), Mt = mats13(X);
  const root = new T.Group(); root.name = 'h136-maltra-act'; X.props.root.add(root);
  const A = { t: 0, ev: [], ended: false, finished: false, busy: 0, th: [null, null], tap: false, mouse: null };
  const ev = (e) => { A.ev.push(e); if (A.ev.length > 24) A.ev.shift(); };
  const b0 = Mo.workOf(m.k);
  let S = b0 && b0.id === m.id ? K.load(b0) : null; if (S && S.lv !== lv) S = null; const resumed = !!S;
  if (!S) S = K.fresh(lv);
  let k0 = ''; const keep = () => { const b = K.save(S, m.id), k = JSON.stringify(b); if (k === k0) return; k0 = k; Mo.keep(m.k, b); X.save(); };
  // ── what the act draws: the hanging lintel, its sling and hook, the two tag lines, the light strip, the lime marks, the shadow, the flag
  const beam = new T.Mesh(X.props.geo.box, Mt.y13stone); beam.castShadow = true; root.add(beam);
  const sling = ropeMesh(X, Mt.y13rope), hoist = ropeMesh(X, Mt.y13rope); root.add(sling); root.add(hoist);
  const sling2 = ropeMesh(X, Mt.y13rope); root.add(sling2);
  const lines = [ropeMesh(X, Mt.y13rope), ropeMesh(X, Mt.y13rope)]; for (const l of lines) root.add(l);
  const stripG = new T.BufferGeometry(); stripG.setAttribute('position', new T.BufferAttribute(new Float32Array(12), 3)); stripG.setIndex([0, 1, 2, 0, 2, 3]);
  const strip = new T.Mesh(stripG, Mt.y13strip); strip.frustumCulled = false; root.add(strip);
  const marks = new T.Group(); root.add(marks);
  const ghost = new T.Mesh(X.props.geo.box, Mt.y13ghost); ghost.visible = false; root.add(ghost);
  const flag = new T.Group(); flag.position.set(...MA.flag); root.add(flag);
  { const pole = new T.Mesh(X.props.geo.box, Mt.y13wood); pole.scale.set(0.12, 3, 0.12); pole.position.y = 1.5; flag.add(pole);
    const cloth = new T.Mesh(new T.PlaneGeometry(1.6, 0.9, 4, 1), Mt.y13flag); cloth.position.set(0, 2.5, 0.8); cloth.rotation.y = Math.PI / 2; flag.add(cloth); flag.userData.cloth = cloth; }
  flag.visible = lv === 3;
  const rings = [ring(HANDS.L), ring(HANDS.R)];   // (screen left = the south line, sky blue; screen right = the north line, gold)
  // ── the camera
  const cam0 = X.camera, fov0 = cam0.fov;
  const home = (d = 0) => { lens(X, MT.FOV); X.shot(CAM[0].slice(), CAM[1].slice(), d); };
  // ── the two handles on the screen: [south (screen left), north (screen right)] → the model's line index (0 north, 1 south)
  const LINE_OF = [1, 0];
  const handleAt = (h) => ({ x: innerWidth * (h === 0 ? MT.HANDLE_X : 1 - MT.HANDLE_X), y: innerHeight * MT.HANDLE_Y });
  const whichHandle = (f) => {
    if (f.y < innerHeight * 0.45) return -1;
    if (f.x < innerWidth * 0.4) return 0;
    if (f.x > innerWidth * 0.6) return 1;
    return -1;
  };
  const gearTo = (i) => {
    // the place for the beam now hanging: its course's marks and (levels with it) its shadow
    for (let k = marks.children.length - 1; k >= 0; k--) marks.remove(marks.children[k]);
    const be = MA.beams[i], c = MA.courses[i];
    for (const s of [-1, 1]) { const mk = new T.Mesh(X.props.geo.box, Mt.y13lime); mk.scale.set(0.55, 0.03, 0.14); mk.position.set(FR.face + 0.35, c.y1 + 0.02, s * be.len / 2); marks.add(mk); }
    ghost.visible = !!K.BEAMS[i].shadow; ghost.scale.set(0.7, be.h, be.len); ghost.position.set(FR.face + 0.35, be.y + be.h / 2, 0);
    beam.material = beamMat(X, i); beam.scale.set(0.7, be.h, be.len);
    own('beam' + i, true);
  };
  gearTo(S.b.i);
  // ── the fingers: each on its handle (no third role here; a finger on the open sky is the camera's — the director's)
  const F = new Map();
  const FG = fingers(X, {
    down(f) {
      if (A.finished || A.busy) return;
      const h = whichHandle(f); if (h < 0) return;
      for (const g of F.values()) if (g.h === h) return;
      F.set(f.id, { h, y0: f.y, t0: A.t, moved: 0 }); X.hand(null); ev('h' + h);
    },
    move(f) { const g = F.get(f.id); if (!g) return; g.moved = Math.max(g.moved, Math.abs(f.y - g.y0)); g.y = f.y; },
    up(f) { const g = F.get(f.id); if (!g) return; F.delete(f.id); if (A.t - g.t0 < MT.TAP_T && g.moved < dp(MT.TAP_D)) A.tap = true; },
  });
  // mouse: a right button pressed alone works the right handle (the director gives only the left); both pressed draw both lines
  const onMouse = (e) => {
    if (e.pointerType !== 'mouse' || A.finished) return;
    if (e.type === 'contextmenu') { try { e.preventDefault(); } catch (er) { /* */ } return; }
    if (e.type === 'pointerdown' && e.button === 2) { A.mouse = { y0: e.clientY, y: e.clientY }; return; }
    if (e.type === 'pointermove' && A.mouse) { A.mouse.y = e.clientY; if (!(e.buttons & 2)) A.mouse = null; return; }
    if (e.type === 'pointerup' && e.button === 2) A.mouse = null;
  };
  const MEV = ['pointerdown', 'pointermove', 'pointerup', 'contextmenu'];
  /** the thumbs' tensions this frame → the model's [north, south] */
  function tensions() {
    const out = [null, null], full = dp(MT.PULL);
    for (const g of F.values()) { const k = LINE_OF[g.h]; out[k] = Math.max(0, Math.min(1, ((g.y != null ? g.y : g.y0) - g.y0) / full)); }
    if (A.mouse) { const t = Math.max(0, Math.min(1, (A.mouse.y - A.mouse.y0) / full)); out[0] = t; for (const g of F.values()) out[LINE_OF[g.h]] = Math.max(out[LINE_OF[g.h]] || 0, t); }
    return out;
  }
  const beamAt = () => { const R = MA.rest(S.b.i); return V3(X, R.x + S.cx, R.y, S.cz); };
  function handle(e) {
    const at = beamAt();
    if (e.k === 'hang') { ev('hang'); }
    else if (e.k === 'glow') { V.glow(); ev('glow'); }
    else if (e.k === 'shove') { V.knock(2.4); ev('shove'); }
    else if (e.k === 'gust') { V.wind(); ev('gust'); }
    else if (e.k === 'knock') { V.knock(2); ev('knock'); }
    else if (e.k === 'drop') { V.lower(); ev('drop'); }
    else if (e.k === 'free') { V.knock(1.4); ev('free:' + e.why); try { X.line('ניסוי חינם: הקורה עולה שוב. כוונו עד שהחבלים זוהרים', 2200); } catch (er) { /* */ } }
    else if (e.k === 'hit') {
      ev('hit:' + e.f); V.boom(S.b.i); hurt(X, Mo, e.f, at, { lv, at: S.b.i });
      try { X.dust(FR.face + 0.5, MA.beams[S.b.i].y, e.f === 'maltra.break' ? MA.courses[S.b.i].half - 0.5 : 0, 4, 2); } catch (er) { /* */ }
    } else if (e.k === 'land') {
      const i = e.i; ev('land:' + i + ':' + e.grade);
      V.boom(i); try { X.dust(FR.face + 0.6, MA.beams[i].y, 0, 6, 3); X.shake(0.1, 0.18); } catch (er) { /* */ }
      award(X, at, e.grade, lv, 'עץ');
      if (lv === 1 && e.two) extra(X, 10, lv, 'two', 'שתי ידיים');
      Mo.st.beams[i] = { yaw: e.yaw, dz: e.dz }; own('beam' + i, false); ghost.visible = false; beam.visible = false; keep();
    } else if (e.k === 'arrive') { beam.visible = true; gearTo(e.i); ev('arrive:' + e.i); keep(); }
    else if (e.k === 'done') { ev('done'); done(); }
  }
  async function done() {
    if (A.busy) return; A.busy = 2;
    const res = K.result(S), at = V3(X, FR.face + 0.4, 66, 0);
    Mo.keep(m.k, null); X.save();
    await X.wait(0.4);
    if (lv === 3 || Object.keys(Mo.st.beams).length >= 5) { try { V.chord(); } catch (e) { /* */ } }
    await finish(X, A, res, WORDS.maltra, at, { eye: [-36, 58, 14], aim: [-77, 60, 0], secs: 1.8, kohen: true, after: () => { try { Mo.filmOver(); } catch (er) { /* */ } } });
  }
  function hint() { if (resumed || A.hintOn || lv > 1) return; A.hintOn = 1; try { X.hand({ x: FR.face + 4, y: 62, z: -4 }, 0, 40); } catch (e) { /* */ } }
  /** draw what moves */
  function draw(dt) {
    const i = S.b.i, be = MA.beams[i], R = MA.rest(i), Ln = S.b.L;
    // the beam's bottom: the hanging height (1.5 over its place), lowered by the machine (S.y 0 … 1)
    const y0 = S.phase === 'course' || S.phase === 'done' ? be.y : be.y + MA.hang * (1 - (S.y || 0));
    const cx = R.x + S.cx, cz = S.cz;
    beam.position.set(cx, y0 + be.h / 2, cz); beam.rotation.y = -S.th; beam.scale.set(0.7, be.h, Ln);
    // the hook over the centre (the machine's: its arm's end swings in during the arrival), the sling to both ends' thirds
    const hx = R.x + (S.hook || 0), hy = y0 + be.h + MA.Lp;
    const crane = SH13.refs && SH13.refs.crane, py = crane ? crane.top + 0.2 : 78.2, px = crane ? crane.x : MA.crane.armTo + 0.2;
    hoist.userData.set([px, py, 0], [hx, hy, 0], 0, 0.06);
    const h3 = Ln / 3, s = Math.sin(S.th), c = Math.cos(S.th);
    sling.userData.set([hx, hy, 0], [cx + h3 * s, y0 + be.h, cz - h3 * c], 0, 0.05);
    sling2.userData.set([hx, hy, 0], [cx - h3 * s, y0 + be.h, cz + h3 * c], 0, 0.05);
    // the tag lines from each end down toward the handles (to a point on the plane x −60 under the handle on the screen)
    const E = K.ends(S), Th = tensions();
    for (let hIdx = 0; hIdx < 2; hIdx++) {
      const k = LINE_OF[hIdx], e = E[k], a = [R.x + e.x, y0 + be.h * 0.5, e.z];
      const hp = handleAt(hIdx); let b = null;
      try { const r = X.rayAt ? X.rayAt(hp.x, hp.y) : null, ray = r && (r.ray || r); if (ray) { const t = (-60 - ray.origin.x) / ray.direction.x; if (t > 0) b = [ray.origin.x + ray.direction.x * t, ray.origin.y + ray.direction.y * t, ray.origin.z + ray.direction.z * t]; } } catch (er) { b = null; }
      if (!b) b = [-60, y0 - 6, e.z * 0.5];
      const tk = Math.max(S.T[k] || 0, S.auto[k] || 0), taut = tk > K.ML.SLACK;
      const L = lines[hIdx]; L.material = S.glow ? Mt.y13ropeGlow : taut ? Mt.y13ropeT : Mt.y13rope;
      L.userData.set(a, b, taut ? 0.05 : 1.6, 0.075);
      const p = handleAt(hIdx); rings[hIdx].show(p.x, p.y, (Th[k] != null ? Th[k] : 0), S.glow);
    }
    // the light strip between the beam and the face, on its top: even when parallel and close
    const yS = y0 + be.h + 0.03, P = stripG.attributes.position.array, xb = (e) => R.x + e.x - 0.35;
    const vN = [FR.face + 0.01, yS, E[0].z], vNb = [xb(E[0]), yS, E[0].z], vS = [FR.face + 0.01, yS, E[1].z], vSb = [xb(E[1]), yS, E[1].z];
    [vN, vNb, vSb, vS].forEach((v, j) => { P[j * 3] = v[0]; P[j * 3 + 1] = v[1]; P[j * 3 + 2] = v[2]; });
    stripG.attributes.position.needsUpdate = true; strip.visible = S.phase === 'hang' || S.phase === 'arrive';
    // the flag: flaps a second before each gust and through it
    if (flag.visible) { const cl = flag.userData.cloth, w = S.gust && (S.gust.warn || S.gust.on); cl.rotation.y = Math.PI / 2 + (w ? Math.sin(A.t * 18) * 0.5 : Math.sin(A.t * 1.5) * 0.08); if (w && !A.flapT) { A.flapT = 0.5; V.flap(); } A.flapT = Math.max(0, (A.flapT || 0) - dt); }
  }
  return {
    close: true, kohenWorks: true,
    begin() {
      FG.attach(); home(0.01);
      for (const t of MEV) addEventListener(t, onMouse, true);
      X.line(resumed ? '' : lv === 1 ? 'גררו ידית למטה: החבל נמתח והקורה מסתובבת. כשהחבלים זוהרים, הרפו' : lv === 2 ? 'שני חבלים: עצרו את הסיבוב ואת הנדנוד בפעימות. כשהחבלים זוהרים, הרפו את שניהם יחד' : 'הדגל מתנופף לפני כל משב: משכו בחבל הנכון לפני שהרוח מגיעה', resumed ? 0 : 5200);
      try { X.stages.hero.place({ x: MA.handler[0], z: MA.handler[1], face: [FR.face, 0] }); } catch (e) { /* */ }
      X.wait(0.9).then(() => { if (!A.ended) hint(); });
      ev(resumed ? 'resume' : 'begin'); keep();
    },
    update(dt) {
      A.t += dt;
      try {
        V.frame && V.frame();
        if (!A.busy && !A.finished) {
          const inp = A.feed ? A.feed(S) : { T: tensions(), tap: A.tap }; A.tap = false;   // (A.feed: the probes' bot)
          const evs = K.step(S, Math.min(dt, 1 / 30), inp);
          for (const e of evs) handle(e);
        }
        draw(dt);
        if (A.t % 1 < dt) keep();
      } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h136] maltra', e && e.message, e && e.stack && e.stack.split('\n')[1]); } }
    },
    down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
    cancel() { F.clear(); A.mouse = null; keep(); },
    wants(p) { if (!p) return true; if (F.size || A.mouse) return true; return whichHandle(p) >= 0; },
    holds() { return !!(F.size || A.mouse); },
    lensFov: MT.FOV,
    end() {
      A.ended = true; FG.detach(); V.hush(); X.hand(null); lens(X, fov0);
      for (const t of MEV) removeEventListener(t, onMouse, true);
      for (const r of rings) r.remove();
      for (let i = 0; i < 5; i++) own('beam' + i, false);
      X.props.remove(root);
    },
    at() { const R = MA.rest(S.b.i); return V3(X, R.x, R.y, 0); },
    dbg() {
      const r3 = (v) => +(+v).toFixed(3), E = K.ends(S), G = K.grades(S);
      return { id: m.id, lv, i: S.b.i, k: S.k, phase: S.phase, th: r3(S.th * 180 / Math.PI), cx: r3(S.cx), cz: r3(S.cz), amp: r3(K.amp(S)), glow: S.glow, T: S.T.map(r3), auto: S.auto.map(r3),
        gaps: E.map((e) => r3(e.gap)), par: r3(G.par), over: r3(G.over), steps: S.steps.map((s) => s.grade[0]).join(''), flaws: S.flaws.map((x) => x.f), done: S.done, busy: A.busy, finished: A.finished,
        handles: [handleAt(0), handleAt(1)].map((p) => [Math.round(p.x), Math.round(p.y)]), held: [...F.values()].map((g) => g.h), ev: A.ev.slice(-12), gust: S.gust ? { warn: !!S.gust.warn, on: !!S.gust.on } : null };
    },
    /** the probes: the model's state and a hand on it (the bot's pulses, the fast probe) */
    probe() { return { S, K, A }; },
  };
}
export const MALTRA_ACT = { icon: '🪵', title: 'חמש המלתראות', walkLine: () => 'המלתראות: אל רגלי המעלות, מול הפתח', stand() { return { x: MA.handler[0], z: MA.handler[1], face: [FR.face, 0] }; }, prepare() {}, make };
void px360;
