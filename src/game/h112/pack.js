/* ── build 112 ── h112/pack.js — stage 03 "הסורג והחיל" as a pack for the stage director (h109/director.js `pack`): its plan, its save,
 * its acts; how the world shows the ring's progress (the crews' soreg and the Chel's courses round both courts); what closes a unit (a
 * run: its closing bay); between the levels a camera ride along the ring (after level 1: rule 6, no second rain) and "the first reader"
 * (after level 2: a stranger reads the kohen's warning slab and stays outside; an illustration); the end: the kohen climbs the twelve
 * steps he laid, the camera opens the Chel and the whole ring, then the next stage opens in the world.
 */
import { PLAN, RUNS, H112, STEPS, stepOf, createH112 } from './model.js';
import { ACTS } from './acts.js';
import { SH3, finalWorld, disposeChip } from './world.js';
import { makeLook, ringBoxes, LOOK_RING_K } from '../world/look.js';   // (build 125)
import { BOOK } from '../world/grid.js';
const CAM3 = BOOK.s03.cam;   // (build 126: the stage's cameras are the book's)
const LOOK_RING = makeLook({ boxes: ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top), K: LOOK_RING_K });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
const FOUND = 0.15;
// (a film's near shots: OrbitControls would keep the camera 35 amot out; no touch in a film, so the near limits give way while it runs)
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h112-film'); } catch (e) { /* */ } };

/** the soreg's ring (stages.js sorag foot) as a gold line on the Mount's floor: drawn round, then faded (the opening only) */
function ringLine(X) {
  const T = X.THREE, [x0, z0, x1, z1] = BOOK.s03.ring;   // (build 126: the book's)
  const mat = new T.MeshBasicMaterial({ color: 0xE8B84A, transparent: true, opacity: 0.95, depthWrite: false });
  const P = [[x1, 0], [x1, z1], [x0, z1], [x0, z0], [x1, z0], [x1, 0]], segs = [];
  let tot = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], L = Math.hypot(bx - ax, bz - az);
    const m = new T.Mesh(new T.BoxGeometry(1, 0.3, 3.4), mat); m.geometry.translate(0.5, 0, 0);
    m.position.set(ax, X.ground(ax, az) + 0.4, az); m.rotation.y = Math.atan2(-(bz - az), bx - ax); m.scale.x = 0.001;
    X.props.root.add(m); segs.push({ m, L, t0: tot }); tot += L;
  }
  return {
    draw(u) { const d = u * tot; for (const s of segs) s.m.scale.x = Math.max(0.001, Math.min(s.L, d - s.t0)); },
    fade(a) { mat.opacity = 0.95 * Math.max(0, a); },
    dispose() { for (const s of segs) { X.props.root.remove(s.m); s.m.geometry.dispose(); } mat.dispose(); },
  };
}

export function makePack03() {
  const P = {
    id: 'sorag', key: 'h112', PLAN, create: createH112, ACTS, icon: '▦',
    // (build 125, rule 66: the right thumb's look over the Azarah's ring — world/look.js with the ring's walls from the address book)
    look: LOOK_RING,
    crews: ['sorag', 3, [0, 1, 2]],
    endTitle: 'הסורג והחיל נבנו!',
    endSub: 'סורג גבוה עשרה טפחים · החיל עשר אמות · שתים עשרה מעלות, רום חצי אמה ושלח חצי אמה (מדות ב, ג)',
    // the film: the ring from high, the east with its steps and warning slabs, the north-east corner, the south, the whole from above
    film: CAM3.film,
    /** the soreg and the Chel as the crews have built them while mission m is open */
    sync(M, S0, instant, X) {
      const info = S0.siteInfo('sorag'); if (!info) return;
      if (M.finished()) {
        if (info.status !== 'done') { try { S0.setWork('sorag', { phase: 'done' }); } catch (e) { /* */ } }
        if (X && !SH3.final) finalWorld(X);
        return;
      }
      const m = M.mission(), n = Math.round(M.shown(m) * (info.stones || 0));
      const there = info.phase === 'courses' && info.set === n;
      if (there && !instant) return;
      if (info.phase !== 'courses') instant = true;
      S0.setWork('sorag', { phase: 'courses', stones: n, ghost: 0, stock: 10, instant: !!instant });
      if (instant) { try { S0.setStage('sorag', 'building', FOUND + (1 - FOUND) * (info.stones ? n / info.stones : 0), { instant: true }); } catch (e) { /* */ } }
    },
    unitEnd: (m, M) => M.unitEnd(m),
    before(m, X, M) {
      const st = M.st;
      // the opening (rule 3: where am I): the whole Mount from high, the wall of stage 02 whole, the line ten amot out; down to the east
      if (m && m.id === 'posts1' && !st.intro) {
        return (async () => {
          st.intro = 1; X.save();
          X.shot(CAM3.intro[0][0], CAM3.intro[0][1], 0.01); await beat(X, 300);
          X.line('שלב 03: הסורג והחיל · סורג גבוה עשרה טפחים, החיל עשר אמות (מדות ב, ג)');
          // (from that high the lattice is a hair: a gold line draws the ring it will be round both courts, then fades)
          const ring = ringLine(X);
          for (let k = 1; k <= 24; k++) { ring.draw(k / 24); await beat(X, 60); }
          X.shot(CAM3.intro[1][0], CAM3.intro[1][1], 2.6); await beat(X, 3000);
          X.shot(CAM3.intro[2][0], CAM3.intro[2][1], 2.2);
          for (let k = 1; k <= 20; k++) { ring.fade(1 - k / 20); await beat(X, 110); }
          ring.dispose(); await beat(X, 200);
          X.line('');
        })();
      }
      // after level 1: the ride along the ring to the north-east corner (spec "המעברים": what the crews built meanwhile)
      if (m && m.id === 'posts2' && !st.ride) {
        return (async () => {
          st.ride = 1; X.save(); near(X, true);
          X.line('בינתיים הצוותים בנו את הסורג סביב העזרות');
          const WK = CAM3.walk, L = WK.z.map((z, i) => [z, i ? 1.4 : 0.01]);
          for (const [z, d] of L) { X.shot([WK.eye[0], WK.eye[1], z + WK.eye[2]], [WK.t[0], WK.t[1], z + WK.t[2]], d); await beat(X, d * 1000 + 250); }
          X.shot(CAM3.north[0], CAM3.north[1], 1.8); await beat(X, 2400);
          X.line('רמה 2: הפינה הצפונית-מזרחית · ספירה של ארבעה', 2600);
          await beat(X, 1400); near(X, false);
        })();
      }
      // after level 2: the first reader (an illustration, 6 s, no play): a stranger up from the Mount reads the kohen's warning slab
      if (m && m.id === 'posts3' && !st.reader) {
        return (async () => {
          st.reader = 1; X.save(); near(X, true);
          const R = RUNS[2], p = R.posts[R.warnAt];
          const [PE, PT] = CAM3.post; X.shot([PE[0], PE[1], p.z + PE[2]], [PT[0], PT[1], p.z + PT[2]], 1.2);
          let w = null; try { w = SH3.crew.add(CAM3.reader[0], p.z + 6, { role: 'walk', tunic: '#5C6E8A', col2: '#2A3A5E', crew: 0 }); } catch (e) { w = null; }
          await beat(X, 400);
          X.line('איש זר עולה מהר הבית אל הסורג…');
          if (w) { try { await Promise.race([SH3.crew.walkTo(w, CAM3.reader[1], p.z + 0.4, 2.2), beat(X, 4200)]); SH3.crew.face(w, p.x, p.z); SH3.crew.setRole(w, 'talk'); } catch (e) { /* */ } }
          X.line('הוא קורא: NO STRANGER MAY ENTER · ונשאר בחוץ (המחשה)');
          await beat(X, 2800);
          if (w) { try { SH3.crew.setRole(w, 'walk'); SH3.crew.walkTo(w, CAM3.reader[2], p.z + 8, 2.2); } catch (e) { /* */ } }
          await beat(X, 1400);
          X.line('רמה 3: דרומית לכניסה, עד הפינה · ברוח', 2600);
          await beat(X, 1200);
          if (w) SH3.crew.remove(w);
          near(X, false);
        })();
      }
      return null;
    },
    /** the twelfth step is in: the kohen climbs the steps he laid, the Chel opens above him, the whole ring */
    async finale(X) {
      near(X, true);
      try {
        // up the flight from the Mount's floor, step by step (his own stones: stages.floorHook)
        X.hero.setPos(CAM3.foot[0], CAM3.foot[1], -Math.PI / 2);
        X.shot(CAM3.side[0], CAM3.side[1], 1.2); await beat(X, 900);   // (from the side: his whole figure on the flight)
        for (let k = 1; k <= 12; k++) {
          const s = stepOf(k), x0 = k === 1 ? CAM3.foot[0] : stepOf(k - 1).face - 0.25, x1 = s.face - 0.25;
          for (let i = 1; i <= 5; i++) { X.hero.setPos(x0 + (x1 - x0) * (i / 5), CAM3.foot[1], -Math.PI / 2); await beat(X, 45); }
          if (k % 3 === 0) X.shot([s.face + 3, s.top + 7, 20], [s.face - 1.5, s.top + 1.2, 0], 0.7);
        }
        X.hero.setPos(CAM3.top[0], CAM3.top[1], -Math.PI / 2); X.play('find');
        X.shot(CAM3.end[0], CAM3.end[1], 1.4); await beat(X, 1700);
      } catch (e) { console.warn('[h112] finale climb', e && e.message); }
      near(X, false);
      try { X.stages.setWork('sorag', { phase: 'done' }); } catch (e) { /* */ }
      finalWorld(X);
      try { if (X.stages.crewsCheer) X.stages.crewsCheer('sorag'); } catch (e) { /* */ }
      const c = { x: -23, z: 0 }, R = 360, y = 210;   // (far enough for the whole ring round both courts in the frame)
      for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI * 2; X.shot([c.x + Math.cos(a) * R, y, c.z + Math.sin(a) * R * 0.75], [c.x, 4, c.z], 0.9); await beat(X, 650); }
    },
    dispose() { disposeChip(); },
  };
  void H112; void STEPS;
  return P;
}
