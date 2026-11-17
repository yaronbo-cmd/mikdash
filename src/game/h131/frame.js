/* ── build 131 ── h131/frame.js — part 2 of stage 08, "המלבן" (spec docs/specs/shlav-08-he.md, part 2: three works). THE
 * FRAME-AND-FINALE LANE'S FILE.
 * The place of the altar is exact and may not change: the witness (one figure, here only) stands and points, four wooden stakes mark
 * the corners (רמב"ם בית הבחירה ב, א–ד; the stakes המחשה). The player does not look for the place: he builds exactly on it.
 *   frame1  the frame already joined (stiff): dragged whole onto the stakes, a corner seated, then turned about it until it lies square
 *   frame2  four loose boards: each laid end by end on its two stakes; two ends on a stake join. A board pulled past its length drags
 *           what was joined off its stake (a mistake, seen)
 *   frame3  three corners pegged, one of them off its stake; the fourth crooked and stuck. A tap on a peg pulls it — the right one at
 *           the right time, then the crooked corner dragged home; a seated corner's peg is driven again
 * When it looks square, the diagonal beam is lowered (dragged off its rest onto the frame, let go): it is stiff and falls in only if
 * the frame is truly square; else it sticks and the corner that lacks shows red. A tap lifts it off; pushed on by force (a drag on it)
 * a board cracks: frame.crack (−20), the board replaced in another shade, for good. No measuring rope, no plumb, no level: the frame
 * itself is set right (spec). All by the left hand (or the mouse's left button), on the frame itself; the right thumb lifts the camera.
 * In the picture: the witness pointing; four frame men at the corners, who push as the hand drags (spec: "ארבעה אנשי צוות אוחזים
 * בפינות ודוחפים לפי הגרירה שלך"). The kohen is out: his hands do not work here (rule 62). No iron anywhere: wood on wood.
 * The rules: frame-model.js. Every place: BOOK.s08 (stakes, frame, work.frame1–3, work.diag, work.men, stand.frame, stand.witness).
 *   FRAME_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LINES, QUICK, LOSS } from './model.js';
import { fresh, load, save, grab, dragTo, step, release, pegTap, diagDrop, diagLift, crackBeam, square, worst, offBy, cornerAt, result, CORNERS, STAKE, SIDES, SIDE_K, FR } from './frame-model.js';
import { fmats, beamMesh, setBeam, ringMesh, pegMesh, frameHold, siteTidy } from './frame3d.js';
import { createVoices } from '../h129/sound129.js';
import { card, cite } from '../h129/ui7.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, onPlane, clamp, ease, lerp } from '../h109/kit.js';

const S8 = BOOK.s08, W8 = S8.work, F = S8.floor, Y1 = S8.frame.y1, MID = S8.mid, AL = S8.altar;
/** the device's buzz (ms) for a crack and for the square; the hint hand's longest gesture (px) */
const BZ = Object.freeze({ crack: '30 30 50'.split(' ').map(Number), square: '40 30 60'.split(' ').map(Number) }), HP = 85;
/** the act's numbers: the camera (eye and aim; המחשה), how near a finger must be to a corner / a board / the diagonal (px), a tap's
 *  most travel (px), the diagonal's lift while carried, the corner glow's time */
export const FK = Object.freeze({
  EYE: W8.cam.frame[0], AIM: W8.cam.frame[1], FOV: 52,
  PICK: 48, PICKM: 30, BEAM: 26, TAP: 12, LIFT: 2.2, GLOW: 0.5,
  // the close shot behind the corner handled: the eye over it from the stand's side (up, back), the lens; the second man's place along
  // the board; how long a new shot eases (s), and how long the act waits before it is read as settled
  NEAR: Object.freeze([10.5, 14.5]), NFOV: 46, HELP: 4.5, EASE: 0.9, SETTLE: 1.1,
  // (b131 look round) the carriers: a man's place off the board's line (amot) and in from its end; a shot farther than CUT amot from
  // where the camera is cuts there (an ease from the pit's valley ran under the ground: a blank first frame); the mallet's blows (s)
  SIDE: 0.7, END: 0.8, IN: 1.3, CUT: 60, MALLET: 1.3,
});
/** the act's words (instructions: what to do, at most five words; the frame's way of setting is המחשה) */
export const FLINES = Object.freeze({
  l1: 'גררו את המסגרת אל היתדות',
  l1b: 'עכשיו סובבו סביב היתד',
  l2: 'כל קורה על שתי יתדות',
  l3: 'פינה עקומה. איזו יתד לשחרר?',
  stuckF: 'תקוע: יתד מחזיקה',
  diag: 'רבועה? הורידו את האלכסון',
  diagStuck: 'האלכסון נתקע: חסר בפינה',
  lift: 'הקישו עליו להרים',
  popped: 'הפינה זזה מהיתד',
  wrongPeg: 'היתד הזאת הייתה במקום',
  crack: 'קרש נסדק · מחליפים בקרש אחר',
  witness: 'העד מראה את המקום (המחשה)',
});
const CORNER_HE = { NW: 'הצפונית מערבית', NE: 'הצפונית מזרחית', SE: 'הדרומית מזרחית', SW: 'הדרומית מערבית' };

export const FRAME_ACT = {
  icon: '📐',
  title: 'המלבן',
  walkLine: (m) => (m && m.lv === 3 ? 'המלבן: פינה עקומה' : m && m.lv === 2 ? 'המלבן: ארבע קורות' : 'המלבן: מסגרת העץ במקום שהעד מראה'),
  stand() { const s = S8.stand.frame; return { x: s[0], z: s[1], face: [MID[0], MID[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, lv = m.lv | 0 || 1, V = createVoices(X.sfx), Mt = fmats(X);
    const root = new T.Group(); root.name = 'h131-frame-act'; X.props.root.add(root);
    const A = { phase: 'look', t: 0, ev: [], fl: null, busy: 0, n0: -1, hintK: '', glow: 0, diagT: null, shake: 0, stuckT: 0, lineT: 0, firstLine: 0, done: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    // ── the work in hand: a fresh one, or the one a reload broke off (the corners as they lay, the cracks kept)
    const b0 = Mo.workOf('frame');
    let S = b0 && b0.id === m.id ? load(b0) : null; const resumed = !!S;
    if (!S) S = fresh(lv);
    if (S.diag === 2) S.diag = 0;   // (a diagonal that stuck when the page went: back on its rest)
    const keep = () => { if (S.n === A.n0) return; A.n0 = S.n; Mo.keep('frame', save(S, m.id)); X.save(); };
    // the boards of a 'frame.crack' mark (this work's or an earlier one's): the same frame, its board replaced in another shade
    const crackedSides = () => new Set([...Mo.marksOf('frame.crack').map((q) => SIDE_K[(q.n | 0) % 4]), ...S.cracks]);
    // ── the camera: one shot over the frame from the north (the stand's side), the witness and the diagonal's rest in it
    const cam0 = X.camera, fov0 = cam0.fov;
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const camHome = (d = 1.1) => X.shot(FK.EYE.slice(), FK.AIM.slice(), Math.hypot(cam0.position.x - FK.EYE[0], cam0.position.y - FK.EYE[1], cam0.position.z - FK.EYE[2]) > FK.CUT ? 0 : d);
    // ── the figures: the witness pointing at the place; the four frame men at the corners
    const B = createBeat(X), gang = createGang(X);
    // (two sets, by the shot: the whole frame — the witness and a man at each corner; the work close — the man at the corner handled
    //  and a second along its board, both whole and large in the picture; the rest step out of a shot that would cut them)
    let wit = null, men = {}, help = null;
    function cast(k) {
      gang.clear(); wit = null; men = {}; help = null;
      // (b131 look round: in at once, whole — a fading man was a shot with nobody in it — and with the step's job: both hands on the board)
      const now = (w) => { if (w && w.a) w.a.vis = 1; return w; };
      if (!k) {
        wit = now(gang.add(S8.stand.witness[0], S8.stand.witness[1], { tunic: '#EDE6D2', col2: '#4E4A78', role: 'point', fx: MID[0], fz: MID[1], crew: 3 }));
        for (const q of CORNERS) { const p = manAt(q); men[q] = now(gang.add(p[0], p[1], { role: 'brace', fx: p[2], fz: p[3], crew: CORNERS.indexOf(q) })); }
        return;
      }
      const p = manAt(k); men[k] = now(gang.add(p[0], p[1], { role: 'brace', fx: p[2], fz: p[3], crew: CORNERS.indexOf(k) }));
      const h = helpAt(k); help = now(gang.add(h[0], h[1], { role: 'brace', fx: h[2], fz: h[3], crew: (CORNERS.indexOf(k) + 1) % 4 }));
    }
    // (b131 look round, rule 2: the two men carry the board the finger moves — the one across the view at the corner handled (level 2:
    //  the board of the end handled) — at its end and along it, both hands on it, on its far side from the camera: never in its path,
    //  never between the camera and the corner; they walk with it as it moves)
    function boardOf(k) {
      if (lv === 2) { const p = S.P.find((q) => !q.seat && q.k === k) || S.P.find((q) => q.k === k); if (p && p.side) return p.side; }
      return k === 'NW' || k === 'NE' ? 'N' : 'S';
    }
    function carry(k, j) {
      const side = boardOf(k); let a, b;
      if (lv === 2) { const on = S.P.filter((q) => q.side === side); a = on.find((q) => q.k === k) || on[0]; b = on.find((q) => q !== a) || a; }
      else { const [ka, kb] = SIDES[side]; a = cornerAt(S, k); b = cornerAt(S, ka === k ? kb : ka); }
      const L = Math.hypot(b.x - a.x, b.z - a.z) || 1, ux = (b.x - a.x) / L, uz = (b.z - a.z) / L;
      let nx = -uz, nz = ux;
      if (side === 'N' || side === 'S') { if (nz < 0) { nx = -nx; nz = -nz; } } else if ((side === 'E') !== (nx > 0)) { nx = -nx; nz = -nz; }
      // (b131 look round 2: the first man holds the board's very end, a step past it on its line — the end in his hands; the second
      //  along it on its far side, close enough that his hands are on it)
      if (!j) return [a.x - ux * FK.END, a.z - uz * FK.END, a.x, a.z];
      const d = FK.IN + FK.HELP, bx = a.x + ux * d, bz = a.z + uz * d;
      return [bx + nx * FK.SIDE, bz + nz * FK.SIDE, bx, bz];
    }
    /** the second man: along the board from the corner handled */
    function helpAt(k) { return carry(k || 'NW', 1); }
    function manAt(k) { return carry(k, 0); }
    /** the diagonal's two carriers (the whole frame's shot): at its ends, beyond them, as it is carried, falls in, or lies stuck */
    function diagEnds() {
      if (DG.carry) return [[DG.x - 16, DG.z - 16], [DG.x + 16, DG.z + 16]];
      if (S.diag === 2 && DG.sa) return [DG.sa, DG.sb];
      if (DG.fall) return null;
      return null;
    }
    // ── the frame's boards, the stakes' green rings, the corners' marks, the pegs (level 3), the diagonal
    const boards = {}; for (const e of S.E.filter((q) => q.beam)) boards[e.beam] = beamMesh(X, Mt.y8frame, root);
    const greens = {}, marks = {}, pegs = {};
    for (const k of CORNERS) { greens[k] = ringMesh(X, Mt.y8green, 1.15, root); greens[k].position.set(STAKE[k][0], F + 0.05, STAKE[k][1]); }
    S.P.forEach((p, i) => { marks[i] = ringMesh(X, Mt.y8amber, 0.6, root); });
    if (lv === 3) for (const k of CORNERS) { pegs[k] = pegMesh(X, root); pegs[k].visible = false; }
    const diag = beamMesh(X, Mt.y8frame, root);
    const glowM = Mt.y8frame.clone(); glowM.emissive = new T.Color('#FFD070'); glowM.emissiveIntensity = 0;
    const DR = W8.diag, diagRest = () => setBeam(diag, [DR[0], DR[1]], [DR[2], DR[3]], null, F, F + 0.9, 0.55);
    diagRest();
    const DG = { carry: null, x: (DR[0] + DR[2]) / 2, z: (DR[1] + DR[3]) / 2, y: 0, tx: 0, tz: 0, fall: null };
    // ── drawing the frame as the model has it
    function draw(dt) {
      const C = new Set(crackedSides());
      for (const e of S.E.filter((q) => q.beam)) {
        const a = S.P[e.a], b = S.P[e.b], mb = boards[e.beam];
        const c = lv === 2 ? [MID[0], MID[1]] : [(S.P[0].x + S.P[2].x) / 2, (S.P[0].z + S.P[2].z) / 2];
        setBeam(mb, [a.x, a.z], [b.x, b.z], c);
        mb.material = C.has(e.beam) ? Mt.y8woodR : Mt.y8frame;
      }
      for (const k of CORNERS) greens[k].visible = !S.P.some((p) => p.k === k && p.seat && Math.hypot(p.x - STAKE[k][0], p.z - STAKE[k][1]) < 0.05) && S.diag !== 1;
      const bad = S.diag === 2 ? worst(S) : null;
      S.P.forEach((p, i) => {
        const r = marks[i]; r.position.set(p.x, F + 1.08, p.z);
        r.material = bad === p.k ? Mt.y8red : p.seat ? Mt.y8green : Mt.y8amber;
        r.visible = S.diag !== 1 && !(lv === 2 && S.J.some(([a, b2]) => b2 === i) );
        const s = bad === p.k ? 1.4 + 0.25 * Math.sin(A.t * 9) : 1; r.scale.setScalar(s);
      });
      if (lv === 3) for (const k of CORNERS) { const p = S.P[CORNERS.indexOf(k)]; pegs[k].visible = !!p.peg; pegs[k].position.set(p.x, F, p.z); }
      // the glow when it falls square (the whole frame lights a moment)
      if (A.glow > 0) { A.glow = Math.max(0, A.glow - dt); glowM.emissiveIntensity = (A.glow / FK.GLOW) * 0.9; for (const mb of Object.values(boards)) mb.material = glowM; diag.material = glowM; } else if (diag.material === glowM) diag.material = Mt.y8frame;
      // the diagonal: on its rest, carried (lifted, following late), falling, stuck (tilted, one end up at the corner that lacks)
      if (DG.fall) {
        const f = DG.fall; f.t += dt; const u = Math.min(1, f.t / f.d), k = ease(u);
        const a = [lerp(f.a0[0], f.a1[0], k), lerp(f.a0[1], f.a1[1], k)], b = [lerp(f.b0[0], f.b1[0], k), lerp(f.b0[1], f.b1[1], k)];
        setBeam(diag, a, b, null, lerp(f.y0, f.y1, u * u), lerp(f.y0, f.y1, u * u) + 0.6, 0.55);
        diag.rotation.z = lerp(f.r0 || 0, f.r1 || 0, k);
        if (u >= 1) { const r = f.res; DG.fall = null; if (r) r(); }
      } else if (DG.carry) {
        const k = 1 - Math.exp(-dt * 3.5); DG.x += (DG.tx - DG.x) * k; DG.z += (DG.tz - DG.z) * k;
        const h = 32 * 0.5;
        setBeam(diag, [DG.x - h, DG.z - h], [DG.x + h, DG.z + h], null, F + FK.LIFT, F + FK.LIFT + 0.6, 0.55); diag.rotation.z = 0;
      }
      // the frame men: at their corners, pushing while the frame moves under the hand
      const moving = !!S.drag && !S.drag.held, DE = A.focus ? null : diagEnds();
      for (const k of CORNERS.concat(help ? ['help'] : [])) {
        const w = k === 'help' ? help : men[k]; if (!w || !w.a || w.mallet) continue;
        let p = k === 'help' ? helpAt(A.focus) : manAt(k), want = moving ? 'push' : 'brace';
        // (the diagonal's beat: the NW and SE men carry it by its ends, a step beyond each)
        if (DE && (k === 'NW' || k === 'SE')) { const e = DE[k === 'NW' ? 0 : 1], o = k === 'NW' ? -0.7 : 0.7; p = [e[0] + o, e[1] + o, e[0], e[1]]; want = DG.carry ? 'push' : 'brace'; }
        const dd = Math.hypot(w.a.x - p[0], w.a.z - p[1]);
        if (dd > 0.02) { const kk = 1 - Math.exp(-dt * 5); w.a.x += (p[0] - w.a.x) * kk; w.a.z += (p[1] - w.a.z) * kk; }
        w.fx = p[2]; w.fz = p[3];
        const walk = dd > 0.15 || (moving && want === 'push');
        if (w.role !== want || !!w.stride !== walk) gang.setRole(w, want, { fx: p[2], fz: p[3], stride: walk ? 0.7 : 0, rate: 1.4 });
      }
    }
    // ── the fingers: a corner (or a board) dragged; a tap on a peg; the diagonal carried, lowered, lifted or forced
    const sp = (x, y, z) => X.scr(x, y, z);
    const R = () => (MOUSE ? FK.PICKM : FK.PICK);
    function segD(p, a, b) { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L2, 0, 1); return { d: Math.hypot(p.x - a.x - vx * u, p.y - a.y - vy * u), u }; }
    function pick(f) {
      if (A.busy || A.done) return null;
      // the diagonal: stuck on the frame, or on its rest (once the frame is set, or any time: he may try it early)
      if (S.diag === 2) { const a = sp(DG.sa[0], F + 1.3, DG.sa[1]), b = sp(DG.sb[0], F + 1.3, DG.sb[1]); if (segD(f, a, b).d < FK.BEAM + 8) return { k: 'stuck' }; }
      // (b131: the nearer of the two wins — from the low whole-frame view the diagonal's rest lies just beyond the north corners on the
      //  screen, and a press on the NE corner (its peg, level 3) took the diagonal: the corner could not be reached)
      let dd = 1e9;
      if (!S.diag && !DG.carry) { const a = sp(DR[0], F + 0.5, DR[1]), b = sp(DR[2], F + 0.5, DR[3]); dd = segD(f, a, b).d; }
      if (S.diag) return null;
      // a corner (a joint's ends are one: the first of them)
      let best = null, bd = R();
      S.P.forEach((p, i) => { const q = sp(p.x, F + 0.6, p.z); if (q.on === false) return; const d = Math.hypot(f.x - q.x, f.y - q.y); if (d < bd) { bd = d; best = { k: 'pt', i }; } });
      if (best && (bd <= dd || square(S) === false)) return best;
      if (dd < FK.BEAM) return { k: 'diag' };
      if (best) return best;
      // a board: level 2 the whole board; else the nearest corner (a stiff frame slides whole; a linked one follows its corner)
      for (const e of S.E.filter((q) => q.beam)) {
        const a = sp(S.P[e.a].x, F + 0.6, S.P[e.a].z), b = sp(S.P[e.b].x, F + 0.6, S.P[e.b].z), r = segD(f, a, b);
        if (r.d < FK.BEAM) { if (lv === 2) return { k: 'beam', i: e.a, beam: e.beam }; return { k: 'pt', i: r.u < 0.5 ? e.a : e.b }; }
      }
      return null;
    }
    const world = (f) => onPlane(X, f.x, f.y, F + 0.6);
    const FG = fingers(X, {
      down(f) {
        if (A.fl != null) return; const k = pick(f); if (!k) { try { if (X.lookHome) X.lookHome(); } catch (e) { /* */ } return; }
        const w = world(f); if (!w) return;
        A.fl = f.id; f.w = { ...k, wx: w.x, wz: w.z };
        X.hand(null);
        if (k.k === 'pt' || k.k === 'beam') {
          const was = S.P.filter((p) => p.seat).length;
          grab(S, k.i, w.x, w.z, k.beam);
          if (S.P.filter((p) => p.seat).length < was) ev('unseat');
          ev('grab:' + S.P[k.i].k + (k.beam ? ':' + k.beam : ''));
        }
      },
      move(f) {
        const w = f.w; if (!w || A.fl !== f.id) return; const p = world(f); if (!p) return;
        if (w.k === 'pt' || w.k === 'beam') { dragTo(S, clamp(p.x, AL[0] - 4, AL[2] + 10), clamp(p.z, AL[1] - 12.5, AL[3] + 9.5)); }
        else if (w.k === 'diag' && f.moved > FK.TAP) { if (!DG.carry) { DG.carry = 1; DG.x = (DR[0] + DR[2]) / 2; DG.z = (DR[1] + DR[3]) / 2; V.scrape(0.5); ev('diag:carry'); } DG.tx = clamp(p.x, AL[0] + 4, AL[2] - 4); DG.tz = clamp(p.z, AL[1] - 4.5, AL[3] - 2.5); }
        else if (w.k === 'stuck' && f.moved > FK.TAP * 1.6 && !w.forced) { w.forced = 1; force(); }
      },
      up(f) {
        const w = f.w; if (!w || A.fl !== f.id) return; A.fl = null; V.scrape(0); V.creak(0);
        if (w.k === 'pt' || w.k === 'beam') {
          // level 3: a tap on a pegged corner pulls its peg
          if (lv === 3 && f.moved <= FK.TAP && S.drag && S.drag.held) { release(S); peg(S.P[w.i].k); return; }
          const r = release(S); seated(r);
          keep(); hintNext();
          return;
        }
        if (w.k === 'diag') { if (DG.carry) lower(); else { X.line(FLINES.diag, 2600); } return; }
        if (w.k === 'stuck' && !w.forced) { lift(); }
      },
    });
    function seated(r) {
      for (const k of r.seated) {
        const st = STAKE[k], at = { x: st[0], y: F + 1.2, z: st[1] };
        X.quick(at, QUICK.corner, boards[SIDE_K[CORNERS.indexOf(k)]]); V.knock(1.4); X.dust(st[0], F + 0.3, st[1], 6, 2);
        try { if (X.haptic) X.haptic(12); } catch (e) { /* */ }
        ev('seat:' + k);
        // (b131 look round 2: the corner's man drives it home on its stake with his wooden mallet, on the knock)
        mallet(men[k] || help, st[0], st[1]);
      }
      for (const k of r.joined) ev('join:' + k);
      if (lv === 1 && r.seated.length === 1 && S.P.filter((p) => p.seat).length === 1) X.line(FLINES.l1b, 3200);
      if (square(S) && !A.squareSaid) { A.squareSaid = 1; X.line(FLINES.diag, 4200); }
    }
    /** a man's blows with the wooden mallet at (x, z): he turns to it, swings on the beat a moment, then takes the board again */
    function mallet(w, x, z) {
      try { if (!w || !w.a) return; w.mallet = 1; gang.setRole(w, 'hammer', { item: 'mallet', fx: x, fz: z, stride: 0 }); X.wait(FK.MALLET).then(() => { w.mallet = 0; gang.setRole(w, 'brace', { item: null, fx: x, fz: z }); }); } catch (e) { /* */ }
    }
    function peg(k) {
      const r = pegTap(S, k); if (!r) return;
      const st = cornerAt(S, k), at = { x: st.x, y: F + 1.6, z: st.z };
      V.knock(0.7); V.groan(); X.dust(st.x, F + 0.4, st.z, 5, 2);
      // (rule 2: the peg is knocked loose by the corner's man with a wooden mallet — no iron at the altar)
      mallet(men[k] || help, st.x, st.z);
      ev('peg:' + k + ':' + (r.right ? 'right' : 'wrong'));
      if (!r.right) X.line(FLINES.wrongPeg, 3200); else X.quick(at, 'משוחררת!', null);
      keep(); hintNext(true);
    }
    // ── the diagonal: lowered (falls in square, or sticks), lifted, forced
    function lower() {
      DG.carry = null; V.scrape(0); A.busy = 1;
      const r = diagDrop(S); ev('diag:' + (r.fit ? 'fit' : 'stuck:' + r.at));
      const a0 = [DG.x - 16, DG.z - 16], b0 = [DG.x + 16, DG.z + 16];
      if (r.fit) {
        DG.fall = { t: 0, d: 0.45, a0, b0, a1: STAKE.NW.slice(), b1: STAKE.SE.slice(), y0: F + FK.LIFT, y1: F + 0.4, res: () => fit() };
        return;
      }
      // stuck: it lies on the frame from the corner that sits to the one that lacks, that end up on the board
      const k = r.at, kk = k === 'NW' || k === 'SE' ? k : 'SE', other = kk === 'NW' ? 'SE' : 'NW';
      const c1 = cornerAt(S, kk), c0 = cornerAt(S, other);
      DG.sa = [c0.x, c0.z]; DG.sb = [c1.x, c1.z];
      DG.fall = { t: 0, d: 0.4, a0, b0, a1: DG.sa, b1: DG.sb, y0: F + FK.LIFT, y1: F + 1.05, r1: 0.035 * (kk === 'SE' ? -1 : 1), res: () => {
        A.busy = 0; V.knock(0.9); V.groan(); X.shake(0.08, 0.15);
        X.line(`${FLINES.diagStuck} ${CORNER_HE[k]}`, 4200); A.stuckSaid = 1;
        X.wait(4.4).then(() => { if (S.diag === 2) X.line(FLINES.lift, 3000); });
        keep();
      } };
      ev('stuck');
    }
    function lift() {
      if (!diagLift(S)) return; ev('diag:lift'); V.knock(0.8);
      DG.fall = { t: 0, d: 0.6, a0: DG.sa, b0: DG.sb, a1: [DR[0], DR[1]], b1: [DR[2], DR[3]], y0: F + 1.05, y1: F + 0.0, res: () => { diagRest(); diag.rotation.z = 0; } };
      keep(); hintNext(true);
    }
    function force() {
      const side = crackBeam(S); if (!side) return;
      const [ka, kb] = SIDES[side], a = cornerAt(S, ka), b = cornerAt(S, kb), at = { x: (a.x + b.x) / 2, y: F + 1, z: (a.z + b.z) / 2 };
      V.crack(); X.shake(0.18, 0.35); try { if (X.haptic) X.haptic(BZ.crack); } catch (e) { /* */ }
      X.dust(at.x, F + 0.8, at.z, 18, 3);
      const p = Mo.mark('frame.crack', m.id, [+at.x.toFixed(2), +at.z.toFixed(2)], SIDE_K.indexOf(side));
      X.loss(p, at, LOSS['frame.crack'][0]); X.line(FLINES.crack, 4000); ev('crack:' + side);
      DG.fall = { t: 0, d: 0.7, a0: DG.sa, b0: DG.sb, a1: [DR[0], DR[1]], b1: [DR[2], DR[3]], y0: F + 1.05, y1: F, res: () => { diagRest(); diag.rotation.z = 0; } };
      keep(); hintNext(true);
    }
    async function fit() {
      A.done = 1; A.glow = FK.GLOW; V.thud(); X.shake(0.3, 0.45); try { if (X.haptic) X.haptic(BZ.square); } catch (e) { /* */ }
      const at = { x: MID[0], y: F + 1.5, z: MID[1] };
      X.dust(STAKE.NW[0], F + 0.6, STAKE.NW[1], 10, 2); X.dust(STAKE.SE[0], F + 0.6, STAKE.SE[1], 10, 2);
      X.quick(at, QUICK.square, diag); ev('square'); keep();
      for (const k of CORNERS) { const w = men[k]; if (w) gang.setRole(w, 'hold', { fx: MID[0], fz: MID[1] }); }
      X.line('', 0);
      await X.wait(1.4);
      const res = result(S);
      if (m.id === 'frame1' && !resumed) await card(X, `<b style="font:900 20px Heebo,system-ui">המלבן</b>${cite(LINES.rashi)}<small style="display:block;margin-top:8px">${FLINES.witness}</small>`, 8000);
      X.end({ stars: res.stars, q: res.q, pts: res.pts, perfect: res.perfect, flags: res.flags, at: { x: MID[0], y: F + 1, z: MID[1] },
        // (b131 look round: the film is the low whole-frame view, the frame men in it at their corners, nobody else's figures, the kohen
        //  not cut in the foreground; the men go when it ends)
        film: { eye: FK.EYE.slice(), aim: FK.AIM.slice(), secs: 1.6, kohen: false, own: () => gang.list.map((w) => w.a), after: () => { try { gang.clear(); } catch (e) { /* */ } } } });
    }
    // ── the hint hand (rule 25: one; rule 34: level 1 shows the way, the help less on 2 and 3)
    function hintNext(force) {
      if (A.busy || A.done || S.diag) return;
      let k = '', at = null, dx = 0, dy = 0;
      if (square(S)) { k = 'diag'; at = { x: (DR[0] + DR[2]) / 2, y: F + 0.6, z: (DR[1] + DR[3]) / 2 }; dy = 60; }
      else if (lv === 1) {
        const free = CORNERS.filter((q) => !S.P[CORNERS.indexOf(q)].seat), seatedN = 4 - free.length;
        const q = seatedN ? free.sort((a, b) => offBy(S, b) - offBy(S, a))[0] : 'NW', p = cornerAt(S, q), s = STAKE[q], a = X.scr(p.x, F + 0.6, p.z), b = X.scr(s[0], F + 0.6, s[1]);
        k = 'l1' + q; at = { x: p.x, y: F + 0.6, z: p.z }; dx = clamp(b.x - a.x, -HP, HP); dy = clamp(b.y - a.y, -HP, HP);
      } else if (lv === 2 && !A.hint2) {
        const i = S.P.findIndex((p) => !p.seat); if (i >= 0) { const p = S.P[i]; k = 'l2' + i; at = { x: p.x, y: F + 0.6, z: p.z }; const a = X.scr(p.x, F, p.z), b = X.scr(STAKE[p.k][0], F, STAKE[p.k][1]); dx = clamp(b.x - a.x, -HP, HP); dy = clamp(b.y - a.y, -HP, HP); }
      }
      if (!force && k === A.hintK) return; A.hintK = k;
      X.hand(at, dx, dy);
    }
    // ── the shot: the whole frame (the start, the diagonal, the lifted look) or close behind the corner the work is at now
    function focusWant() {
      if (A.done || S.diag || DG.carry || square(S)) return null;
      try { const L = X.lookNow ? X.lookNow() : null; if (L && (L.u > 0.06 || L.ov)) return null; } catch (e) { /* */ }
      if (lv === 1) { const free = CORNERS.filter((q) => !S.P[CORNERS.indexOf(q)].seat); if (free.length === 4) return 'NW'; return farthest(free); }
      if (lv === 2) { const p = S.P.find((q) => !q.seat); return p ? p.k : null; }
      const bent = S.P.find((q) => q.peg && offBy(S, q.k) > FR.TOL); if (bent) return A.stuckSaid3 ? bent.k : 'SE';
      return farthest(S.P.filter((q) => !q.seat).map((q) => q.k));
    }
    // (the corner farthest from its stake; on a near tie the one the shot is on stays — two corners equally off made the choice turn
    //  on a rounding, and the shot could go to one while the work was read at the other)
    function farthest(ks) {
      if (!ks.length) return null; const mx = Math.max(...ks.map((k) => offBy(S, k)));
      if (A.focus && ks.includes(A.focus) && offBy(S, A.focus) >= mx - 0.1) return A.focus;
      return ks.find((k) => offBy(S, k) >= mx - 0.1);
    }
    function focusPt(k) {
      const st = STAKE[k];
      let p = cornerAt(S, k); if (lv === 2) { const q = S.P.find((r) => !r.seat && r.k === k); if (q) p = q; }
      return [(p.x + st[0]) / 2, (p.z + st[1]) / 2];
    }
    // (an ease from far — the pit's valley, the walk — cuts: eased, the camera passed under the ground and the first frame was blank)
    function easeTo(p) { if (A.cut) { A.cut = 0; return 0; } const c = cam0.position; return Math.hypot(c.x - p[0], c.y - p[1], c.z - p[2]) > FK.CUT ? 0 : FK.EASE; }
    function shotTo(k) {
      A.focus = k; A.shotT = A.t;
      if (!k) { lens(FK.FOV); X.shot(FK.EYE.slice(), FK.AIM.slice(), easeTo(FK.EYE)); cast(null); ev('shot:wide'); return; }
      const c = focusPt(k), aim = [c[0], F + 1, c[1]], eye = [c[0], F + 1 + FK.NEAR[0], c[1] - FK.NEAR[1]];
      lens(FK.NFOV); X.shot(eye, aim, easeTo(eye)); cast(k); ev('shot:' + k);
    }
    function shotStep() {
      if (A.fl != null || S.drag || DG.carry || DG.fall || A.busy) return;
      const k = focusWant(); if (k !== A.focus || (k && A.t - A.shotT > 0.5 && Math.hypot(...focusPt(k).map((v, i) => v - A.fp[i])) > 2.5)) { shotTo(k); A.fp = k ? focusPt(k) : [0, 0]; hintNext(true); }
    }
    A.focus = undefined; A.shotT = -9; A.fp = [0, 0];
    let last = 0;
    return {
      close: true,
      begin() {
        frameHold('act', true); siteTidy(X, true);
        try { X.kohen(false); } catch (e) { /* */ }
        // (b131 fix round 1: the first frame is the close shot behind the corner the work begins at — the men large, not dots in the wide one;
        //  the wide beat stays for the diagonal and the square)
        FG.attach(); A.cut = 1; { const k0 = focusWant(); if (k0) { shotTo(k0); A.fp = focusPt(k0); } else { A.cut = 0; lens(FK.FOV); camHome(0); cast(null); A.focus = null; } } A.shotT = 0;
        draw(0);
        const L0 = lv === 1 ? FLINES.l1 : lv === 2 ? FLINES.l2 : FLINES.l3;
        if (!resumed && lv === 1) { X.line(LINES.rashi, 6000); X.wait(6.2).then(() => { if (!A.done && !A.fl) X.line(L0, 5000); }); }
        else X.line(L0, 5000);
        X.wait(0.9).then(() => hintNext(true));
        ev(resumed ? 'resume' : 'begin');
        keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); B.step(dt); gang.update(dt, B);
          const r = step(S, dt);
          if (r.pop) { V.groan(); X.shake(0.06, 0.12); ev('pop:' + r.pop[0]); if (r.joined && lv === 2) X.line(FLINES.popped, 3000); keep(); }
          if (r.stuck) { A.stuckT += dt; V.creak(0.6); if (A.stuckT > 0.5 && !A.stuckSaid3) { A.stuckSaid3 = 1; X.line(FLINES.stuckF, 3200); ev('stuckFrame'); } }
          else { A.stuckT = 0; V.creak(S.strain ? 0.4 : 0); }
          if (S.drag && !S.drag.held) { const p = S.P[S.drag.i], v = Math.hypot(p.x - (A.px || p.x), p.z - (A.pz || p.z)) / Math.max(1e-3, dt); A.px = p.x; A.pz = p.z; V.scrape(Math.min(1, v / 6)); if (v > 2 && A.t - last > 0.35) { last = A.t; X.dust(p.x, F + 0.2, p.z, 2, 1.2); } }
          draw(dt); shotStep();
          if (S.drag && S.drag.held) { const p = S.P[S.drag.i]; const w = Math.sin(A.t * 40) * 0.03; boards[SIDE_K[S.drag.i]].position.x += w; void p; }
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h131] frame', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { if (S.drag) { release(S); keep(); } A.fl = null; DG.carry = null; diagRest(); V.scrape(0); V.creak(0); },
      // (rule 66: on the right half a touch is the act's only where it lands on the frame, a peg or the diagonal; else the camera's)
      wants(p) { if (!p) return true; return !!pick(p); },
      holds() { return A.fl != null; },
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) gang.clear();   // (a finished work's men stay for its film, which clears them)
        X.props.remove(root); siteTidy(X, false);
        frameHold('act', false);
      },
      at() { return new T.Vector3(MID[0], F + 1, MID[1]); },
      dbg() {
        const s2 = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const o = { id: m.id, lv, busy: A.busy, done: A.done, mouse: MOUSE, ev: A.ev.slice(-10), diag: S.diag, square: square(S), wrong: S.wrong, stuck: S.stuck, dmg: S.dmg, cracks: S.cracks.slice(), nf: FG.n, n: S.n,
          pts: result(S).pts, drag: S.drag ? S.P[S.drag.i].k : null, strain: +S.strain.toFixed(2), J: S.J.length };
        o.P = S.P.map((p, i) => ({ i, k: p.k, seat: p.seat, peg: p.peg, off: +Math.hypot(p.x - STAKE[p.k][0], p.z - STAKE[p.k][1]).toFixed(2), at: s2(p.x, F + 0.6, p.z), to: s2(STAKE[p.k][0], F + 0.6, STAKE[p.k][1]), side: p.side || null, joined: S.J.some(([a, b]) => a === i || b === i) }));
        o.diagAt = s2((DR[0] + DR[2]) / 2, F + 0.5, (DR[1] + DR[3]) / 2); o.mid = s2(MID[0], F + 0.6, MID[1]);
        if (S.diag === 2 && DG.sa) o.stuckAt = s2((DG.sa[0] + DG.sb[0]) / 2, F + 1.3, (DG.sa[1] + DG.sb[1]) / 2);
        o.focus = A.focus || 'wide'; o.settled = A.t - A.shotT > FK.SETTLE;
        o.menPx = gang.list.filter((w) => w.a && w.a.alive).map((w) => { const a = X.scr(w.a.x, F, w.a.z), b = X.scr(w.a.x, F + 3.9, w.a.z); return Math.round(Math.abs(a.y - b.y)); });
        o.worst = worst(S); o.figs = { wit: wit && wit.a ? s2(wit.a.x, F + 1, wit.a.z) : null, men: CORNERS.map((k) => (men[k] && men[k].a ? s2(men[k].a.x, F + 1, men[k].a.z) : null)) };
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1)); o.fov = +cam0.fov.toFixed(1);
        return o;
      },
    };
  },
};
void FR;
