/* ── build 113 ── h113/pack.js — stage 04 "שערי העזרה" as a pack for the stage director (h109/director.js `pack`): its plan, its save,
 * its acts; how the world shows the crews' share (the gatehouses rise round the kohen's frames; the south three in their hands); what
 * closes a unit (a gate locked); the films between the levels: the opening (the seven openings from high), the goldsmiths (after the
 * first gate: Middot 2:3, "all the gates there were changed to gold"), the watch (after the second: the Levites guard at night, Middot
 * 1:1, 1:5); the end: the six gates shut one by one with their names, and a word on Nikanor's doors, still at sea (Yoma 38a).
 */
import { PLAN, GATES, SOUTH, H113, createH113 } from './model.js';
import { ACTS } from './acts.js';
import { SH4, frameOf, finalWorld, disposeChip } from './world.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const beat = (X, ms) => (X && X.wait ? X.wait(ms / 1000) : sleep(ms));
const FOUND = 0.15;
// (a film's near shots: OrbitControls would keep the camera far out; no touch in a film, so the near limits give way while it runs)
const near = (X, on) => { try { if (X.view && X.view.closeCam) X.view.closeCam(!!on, 'h113-film'); } catch (e) { /* */ } };

/** a gate's front from the Chel (outside), a little up: its whole twenty amot in the frame */
function gateShot(X, G, d = 1.6, far = 26, up = 12) {
  const F = frameOf(G);
  X.shot([G.c + 6 * -F.s, H113.FLOOR + up, F.out(far)], [G.c, H113.FLOOR + 9, F.zf], d);
}

/** the openings as gold pillars that fade (the opening only: from that high an opening is a notch) */
function pillars(X) {
  const T = X.THREE, mat = new T.MeshBasicMaterial({ color: 0xE8B84A, transparent: true, opacity: 0.9, depthWrite: false });
  const L = [];
  const at = [...[1, 2, 3].map((lv) => [GATES[lv].c, -70.5]), ...SOUTH.map((G) => [G.c, 70.5])];
  for (const [x, z] of at) {
    const m = new T.Mesh(new T.BoxGeometry(10, 1, 8), mat); m.geometry.translate(0, 0.5, 0);
    m.position.set(x, H113.FLOOR, z); m.scale.y = 0.01; X.props.root.add(m); L.push(m);
  }
  return {
    grow(u) { for (const m of L) m.scale.y = Math.max(0.01, 40 * u); },
    fade(a) { mat.opacity = 0.9 * Math.max(0, a); },
    dispose() { for (const m of L) { X.props.root.remove(m); m.geometry.dispose(); } mat.dispose(); },
  };
}

export function makePack04() {
  const P = {
    id: 'gates', key: 'h113', PLAN, create: createH113, ACTS, icon: '🚪',
    crews: ['gates', 3, [0, 1, 2]],
    endTitle: 'שערי העזרה נבנו!',
    endSub: 'פתחו עשר אמות ורומו עשרים (מדות ב, ג) · כל השערים נשתנו להיות של זהב, חוץ משערי ניקנור (שם)',
    // the film: the courts from high, the north gates on the Chel, the south three, the whole from above
    film: [[[-60, 260, 260], [-80, 0, 0], 3.0], [[-66, 20, -112], [-66, 12, -78], 2.6], [[-100, 20, 112], [-100, 12, 78], 2.6], [[-60, 300, 300], [-80, 0, 0], 1.6]],
    /** the crews' gatehouses as they stand while mission m is open (low under the lintels through the first two gates, then up) */
    sync(M, S0, instant, X) {
      const info = S0.siteInfo('gates'); if (!info) return;
      if (M.finished()) {
        if (info.status !== 'done') { try { S0.setWork('gates', { phase: 'done' }); } catch (e) { /* */ } }
        if (X && !SH4.final) finalWorld(X);
        return;
      }
      const m = M.mission(), n = Math.round(M.shown(m) * (info.stones || 0));
      const there = info.phase === 'courses' && info.set === n;
      if (there && !instant) return;
      if (info.phase !== 'courses') instant = true;
      S0.setWork('gates', { phase: 'courses', stones: n, ghost: 0, stock: 10, instant: !!instant });
      if (instant) { try { S0.setStage('gates', 'building', FOUND + (1 - FOUND) * (info.stones ? n / info.stones : 0), { instant: true }); } catch (e) { /* */ } }
    },
    unitEnd: (m, M) => M.unitEnd(m),
    before(m, X, M) {
      const st = M.st;
      // the opening (rule 3: where am I): the whole Mount from high, the six openings in the courts' wall as gold pillars; down to the first
      if (m && m.id === 'socket1' && !st.intro) {
        return (async () => {
          st.intro = 1; X.save(); near(X, true);
          X.shot([-60, 520, 520], [-80, 0, 0], 0.01); await beat(X, 300);
          X.line('שלב 04: שערי העזרה · שבעה שערים היו בעזרה, שלשה בצפון ושלשה בדרום ואחד במזרח (מדות א, ד)');
          const P2 = pillars(X);
          for (let k = 1; k <= 20; k++) { P2.grow(k / 20); await beat(X, 60); }
          X.shot([-80, 280, 240], [-80, 0, 0], 2.6); await beat(X, 3000);
          X.line('שלושה בצפון: עלינו · שלושה בדרום: הצוותים · שער ניקנור במזרח: בהמשך', 3000);
          gateShot(X, GATES[1], 2.4, 40, 22);
          for (let k = 1; k <= 20; k++) { P2.fade(1 - k / 20); await beat(X, 110); }
          P2.dispose(); await beat(X, 400);
          X.line('');
          near(X, false);
        })();
      }
      // after the first gate: the goldsmiths (spec "המעברים"): its leaves are covered in gold; on to the second gate
      if (m && m.id === 'socket2' && !st.gilders) {
        return (async () => {
          st.gilders = 1; X.save(); near(X, true);
          const G = GATES[1], F = frameOf(G);
          gateShot(X, G, 1.4, 40, 11); await beat(X, 1600);   // (the whole leaf in the frame: twenty amot, the smiths at its foot)
          X.line('כל השערים שהיו שם נשתנו להיות של זהב, חוץ משערי ניקנור (מדות ב, ג)');
          const w = [];
          try {
            for (const dx of [-2.6, 2.6]) {
              const a = SH4.crew.add(G.c + dx, F.out(1.4), { role: 'hammer', item: 'mallet', fx: G.c + dx, fz: F.zf, crew: 3, tunic: '#C9A64A' });
              if (a) w.push(a);
            }
          } catch (e) { /* */ }
          for (let k = 0; k < 6; k++) { X.sparks(G.c + (k % 2 ? 2.4 : -2.4), H113.FLOOR + 3 + k * 2.2, F.out(0.4), 8); await beat(X, 380); }
          st.gold[1] = 1; X.save();   // (world.js ensureWorld rebuilds the gate gilded on its next beat)
          await beat(X, 900);
          X.line('הצורפים מצפים את הדלתות בזהב · ואנחנו לשער הקרבן', 2600);
          X.shot([-66, 34, -116], [-80, 8, -78], 2.2); await beat(X, 2400);
          gateShot(X, GATES[2], 1.6); await beat(X, 1800);
          for (const a of w) SH4.crew.remove(a);
          X.line('');
          near(X, false);
        })();
      }
      // after the second gate: its gold, and the watch at night (illustration): a Levite with a torch takes his place at the first gate
      if (m && m.id === 'socket3' && !st.watch) {
        return (async () => {
          st.watch = 1; st.gold[2] = 1; X.save(); near(X, true);
          const G = GATES[1], F = frameOf(G);
          let w = null;
          try { w = SH4.crew.add(G.c + 14, F.out(5), { role: 'walk', item: 'torch', crew: 3, tunic: '#E8E0CC' }); } catch (e) { w = null; }
          X.shot([G.c - 10, H113.FLOOR + 6, F.out(16)], [G.c + 2, H113.FLOOR + 3, F.out(1)], 1.4); await beat(X, 900);
          X.line('והלוים שומרים בעשרים ואחד מקום (מדות א, א)');
          if (w) { try { await Promise.race([SH4.crew.walkTo(w, G.c + 6.4, F.out(1.8), 1.8), beat(X, 4600)]); SH4.crew.face(w, G.c + 6.4, F.out(8)); SH4.crew.setRole(w, 'hold', { item: 'torch' }); } catch (e) { /* */ } }
          X.line('בבית הניצוץ: הכהנים שומרים מלמעלה והלוים מלמטה (מדות א, ה)');
          await beat(X, 3200);
          X.line('רמה 3: שער בית המוקד · הקשה מכולם', 2600);
          X.shot([-130, 40, -118], [-150, 8, -76], 2.2); await beat(X, 2400);
          gateShot(X, GATES[3], 1.6); await beat(X, 1600);
          if (w) SH4.crew.remove(w);
          X.line('');
          near(X, false);
        })();
      }
      return null;
    },
    /** the third gate locked: the six gates shut one by one with their names, then a word on the seventh */
    async finale(X) {
      near(X, true);
      const order = [
        [GATES[3], 'בית המוקד'], [GATES[2], 'שער הקרבן'], [GATES[1], 'שער הניצוץ'],
        [SOUTH[2], 'שער הדלק · עצים למערכה'], [SOUTH[1], 'שער הבכורות'], [SOUTH[0], 'שער המים · צלוחית המים בחג'],
      ];
      try {
        for (const [G, name] of order) {
          gateShot(X, G, 1.3, 42, 14); await beat(X, 1300);
          const F = frameOf(G);
          X.line(`${name} (מדות א, ד)`);
          X.dust(G.c, H113.FLOOR + 0.6, F.out(0.6), 10, 3); X.play('find');
          await beat(X, 1500);
        }
        X.line('ושער ניקנור? דלתותיו עוד בדרך בים, מאלכסנדריה (יומא לח ע״א)');
        X.shot([120, 60, 90], [40, 8, 0], 2.2); await beat(X, 3600);
      } catch (e) { console.warn('[h113] finale', e && e.message); }
      X.line('');
      near(X, false);
      try { X.stages.setWork('gates', { phase: 'done' }); } catch (e) { /* */ }
      finalWorld(X);
      try { if (X.stages.crewsCheer) X.stages.crewsCheer('gates'); } catch (e) { /* */ }
      const c = { x: -80, z: 0 }, R = 330, y = 200;
      for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI * 2; X.shot([c.x + Math.cos(a) * R, y, c.z + Math.sin(a) * R * 0.75], [c.x, 6, c.z], 0.9); await beat(X, 650); }
    },
    dispose() { disposeChip(); },
  };
  return P;
}
