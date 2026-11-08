/* ── build 109 ── h109/acts2.js — three acts of stage 01 in the world: 3.3 reading the big rock (the mirror's light, the wedges,
 * the water), 3.4 paving the sector (the slabs puzzle: no joint over a joint), 3.9 clearing the waste (the sledge, the oxen, the fill
 * behind the east retaining wall). Spec docs/specs/shlav-01-olam-yashan-he.md. Every result is seen in the world (rule 31).
 */
import { createGang, onPlane, clamp, lerp, ease } from './kit.js';

let SH = null;
const TAU = Math.PI * 2;
function hash(a, b) { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); }

/* ───────── the big rock's surface (a ray at it from outside: the world's own boulder mesh) ───────── */
function surf(X, b, phi, h, out = {}) {
  const T = X.THREE, gy = X.ground(b[0], b[1]);
  const o = new T.Vector3(b[0] + Math.cos(phi) * b[2] * 2.2, gy + h, b[1] + Math.sin(phi) * b[2] * 2.2);
  const d = new T.Vector3(b[0], gy + h, b[1]).sub(o).normalize();
  const rc = new T.Raycaster(o, d, 0, b[2] * 2.2); rc.camera = X.camera;
  let hits = []; try { hits = rc.intersectObjects(SH.rayList || (SH.rayList = X.scene.children.filter((c) => c !== X.props.root && !c.isSprite && !c.isPoints && !c.isLine)), true); } catch (e) { hits = []; }
  for (const hh of hits) {
    let p = hh.object, mine = false; while (p) { if (p === X.props.root || p.name === 'h109' || (p.name || '').startsWith('actor') || p.name === 'items') { mine = true; break; } p = p.parent; }
    if (mine) continue;
    if (Math.hypot(hh.point.x - b[0], hh.point.z - b[1]) < b[2] * 1.35) { out.x = hh.point.x; out.y = hh.point.y; out.z = hh.point.z; return out; }
  }
  out.x = b[0] + Math.cos(phi) * b[2] * 0.9; out.y = gy + h; out.z = b[1] + Math.sin(phi) * b[2] * 0.9; return out;
}
/** where to stand at a big rock: the side with most room (away from the other rocks, inside the platform) */
function bigStand(X, s) {
  const b = SH.bould[s]; let best = 0, bd = -1;
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * TAU, x = b[0] + Math.cos(a) * (b[2] + 3.4), z = b[1] + Math.sin(a) * (b[2] + 3.4);
    let d = 40; for (let j = 0; j < SH.bould.length; j++) { if (j === s) continue; const o = SH.bould[j]; d = Math.min(d, Math.hypot(x - o[0], z - o[1]) - o[2]); }
    for (const R of SH.rocks[s] || []) if (R.q && R.q.vis) d = Math.min(d, Math.hypot(x - R.x, z - R.z) - R.r);
    if (d > bd) { bd = d; best = a; }
  }
  return { a: best, x: b[0] + Math.cos(best) * (b[2] + 3.4), z: b[1] + Math.sin(best) * (b[2] + 3.4) };
}

/* ───────── 3.3 reading the rock ───────── */
export const READ = {
  icon: '🔍', title: 'קריאת הסלע',
  walkLine: (m) => `הסלע הגדול של גזרה ${m.s + 1}: קוראים אותו לפני שבוקעים`,
  stand(m, X) { const b = SH.bould[m.s]; if (!b) return null; if (!SH.bigSt) SH.bigSt = {}; const p = SH.bigSt[m.s] || (SH.bigSt[m.s] = bigStand(X, m.s)); return { x: p.x, z: p.z, face: [b[0], b[1]] }; },
  prepare(m, X) {
    const b = SH.bould[m.s]; if (!b) return; const C = SH.crew, p = READ.stand(m, X);
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
    // the mason kneels on the rock's far side holding the wedges; two with jars from the cistern
    const fa = Math.atan2(p.z - b[1], p.x - b[0]) + Math.PI * 0.7, fx = b[0] + Math.cos(fa) * (b[2] + 1.6), fz = b[1] + Math.sin(fa) * (b[2] + 1.6);
    SH.secCrew.push(C.add(fx, fz, { role: 'kneel', fx: b[0], fz: b[1], crew: 3 }));
    const ja = Math.atan2(p.z - b[1], p.x - b[0]) - 0.6;
    const jx = b[0] + Math.cos(ja) * (b[2] + 2.5), jz = b[1] + Math.sin(ja) * (b[2] + 2.5);
    SH.secCrew.push(C.add(jx, jz, { role: 'carry', from: [jx, jz], to: [jx + 14, jz + 6], item: 'jar', crew: 1 }));
    SH.jarMan = SH.secCrew[SH.secCrew.length - 1];
  },
  make(m, X) {
    const lv = X.level(), s = m.s, b = SH.bould[s], st = READ.stand(m, X), gy = X.ground(b[0], b[1]);
    const nW = [3, 4, 5][lv - 1], phiH = Math.atan2(st.z - b[1], st.x - b[0]);
    const T = X.THREE;
    const A = { step: 'turn', th: 0, lines: [], pick: null, wedges: [], water: 0, hold: false, res: { line: null, space: null, water: null }, fallen: 0, t: 0, creakT: 0, early: 0, wind: lv >= 3 };
    // the lines: one true; at L3 a second that ends inside the rock (shorter). They show only when the light crosses them.
    const H0 = 0.6, H1 = b[2] * 0.62;
    function mkLine(phi, h0, h1, ok) {
      const pts = []; for (let i = 0; i <= 8; i++) { const h = lerp(h0, h1, i / 8), p = surf(X, b, phi + Math.sin(i * 1.7) * 0.012, h); const n = new T.Vector3(p.x - b[0], 0, p.z - b[1]).normalize(); pts.push(new T.Vector3(p.x + n.x * 0.06, p.y, p.z + n.z * 0.06)); }
      const mat = new T.MeshBasicMaterial({ color: 0x24170C, transparent: true, opacity: 0, depthWrite: false });
      const mesh = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, lv >= 2 ? 0.07 : 0.1, 4, false), mat); mesh.renderOrder = 995; X.props.root.add(mesh);
      return { phi, pts, mesh, ok, shown: 0, seen: false };
    }
    const off = (hash(s, 3) > 0.5 ? 1 : -1) * (0.22 + hash(s, 5) * 0.18);
    A.lines.push(mkLine(phiH + off, H0, H1, true));
    if (lv >= 3) A.lines.push(mkLine(phiH - off * 0.9, H0 + 1.2, H1 * 0.62, false));
    // the light: from the bronze mirror in his hands to a bright spot on the rock (a beam that reads as light: additive, a glow)
    const beamG = new T.BufferGeometry(); beamG.setAttribute('position', new T.BufferAttribute(new Float32Array(9), 3));
    const beam = new T.Mesh(beamG, X.props.M.beam); beam.frustumCulled = false; beam.renderOrder = 998; X.props.root.add(beam);
    const glow = new T.Mesh(new T.CircleGeometry(1.1, 20), X.props.M.beam.clone()); glow.material.opacity = 0.55; glow.renderOrder = 998; X.props.root.add(glow);
    const mirror = new T.Mesh(new T.CircleGeometry(0.32, 16), new T.MeshStandardMaterial({ color: '#C8964A', metalness: 0.9, roughness: 0.25, side: T.DoubleSide })); X.props.root.add(mirror);
    const hp = {};
    const spot = {};
    function light(dt) {
      if (A.wind) A.th += Math.sin(A.t * 9) * 0.0035 + Math.sin(A.t * 23) * 0.0018;
      const phi = phiH + A.th; surf(X, b, phi, b[2] * 0.36, spot);
      X.stages.heroXYZ(hp); const mx = hp.x + Math.cos(phiH + Math.PI) * -0.9, mz = hp.z + Math.sin(phiH + Math.PI) * -0.9, my = hp.y + 2.3;
      mirror.position.set(mx, my, mz); mirror.lookAt(spot.x, spot.y, spot.z);
      const P = beamG.attributes.position.array, px = -Math.sin(phi) * 0.7, pz = Math.cos(phi) * 0.7;
      P[0] = mx; P[1] = my; P[2] = mz; P[3] = spot.x + px; P[4] = spot.y; P[5] = spot.z + pz; P[6] = spot.x - px; P[7] = spot.y + 0.2; P[8] = spot.z - pz; beamG.attributes.position.needsUpdate = true; beamG.computeBoundingSphere();
      glow.position.set(spot.x + Math.cos(phi) * 0.15, spot.y, spot.z + Math.sin(phi) * 0.15); glow.lookAt(X.camera.position);
      for (const L of A.lines) {
        const near = Math.abs(Math.atan2(Math.sin(phi - L.phi), Math.cos(phi - L.phi))) < 0.07;
        if (near && !L.seen) { L.seen = true; X.play('find'); X.word({ x: L.pts[4].x, y: L.pts[8].y + 1.2, z: L.pts[4].z }, 'קו הבקיעה!'); }
        L.shown = clamp(L.shown + dt * (L.seen ? 2.2 : -2), 0, 1); L.mesh.material.opacity = L.shown * (lv >= 2 ? 0.75 : 0.95);
      }
      const vis = A.step === 'turn' || A.step === 'wedge'; beam.visible = glow.visible = vis; mirror.visible = A.step !== 'done';
    }
    function lineDist(L, p) {
      let best = 1e9, bu = 0; const n = L.pts.length;
      for (let i = 0; i < n - 1; i++) {
        const a = X.scr(L.pts[i].x, L.pts[i].y, L.pts[i].z), c = X.scr(L.pts[i + 1].x, L.pts[i + 1].y, L.pts[i + 1].z);
        const vx = c.x - a.x, vy = c.y - a.y, l2 = vx * vx + vy * vy || 1, u = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / l2, 0, 1);
        const d = Math.hypot(a.x + vx * u - p.x, a.y + vy * u - p.y); if (d < best) { best = d; bu = (i + u) / (n - 1); }
      }
      return { d: best, u: bu };
    }
    function wedgeAt(L, u, grade) {
      const n = L.pts.length - 1, i = Math.min(n - 1, Math.floor(u * n)), f = u * n - i, a = L.pts[i], c = L.pts[i + 1];
      const x = lerp(a.x, c.x, f), y = lerp(a.y, c.y, f), z = lerp(a.z, c.z, f);
      const w = new T.Mesh(new T.BoxGeometry(0.34, 0.5, 0.42), X.props.M.wood); w.position.set(x, y, z); w.lookAt(b[0], y, b[1]); X.props.root.add(w);
      A.wedges.push({ u, w, grade }); X.play('wedge'); X.dust(x, y, z, 3, 1);
      return { x, y: y + 1, z };
    }
    function fall(p) {
      // a wedge off the line falls: it drops at his feet
      const q = onPlane(X, p.x, p.y, gy + 0.5) || { x: st.x, z: st.z };
      const w = new T.Mesh(new T.BoxGeometry(0.34, 0.5, 0.42), X.props.M.wood); w.position.set(q.x, X.ground(q.x, q.z) + 0.2, q.z); w.rotation.set(1.2, hash(A.t, 1) * 3, 0.3); X.props.root.add(w);
      A.fallen++; (A.junk = A.junk || []).push(w); X.word({ x: q.x, y: X.ground(q.x, q.z) + 1.4, z: q.z }, 'היתד נפלה'); X.play('wood');
    }
    function spacing() {
      const us = A.wedges.map((w) => w.u).sort((a, c) => a - c); const gaps = []; for (let i = 1; i < us.length; i++) gaps.push(us[i] - us[i - 1]);
      const mean = gaps.reduce((a, c) => a + c, 0) / (gaps.length || 1), sd = Math.sqrt(gaps.reduce((a, c) => a + (c - mean) ** 2, 0) / (gaps.length || 1));
      const cv = mean > 0 ? sd / mean : 1; return cv <= 0.22 ? 'gold' : cv <= 0.45 ? 'good' : 'ok';
    }
    async function split() {
      A.step = 'split';
      const g = A.res, wrong = !A.pick.ok, crooked = wrong || g.space === 'ok';
      const lost = wrong && g.space === 'ok';
      const at = { x: b[0], y: gy + b[2] * 0.9, z: b[1] };
      // the rock opens slowly with a groan along the line, then the halves part like a book
      X.play('creak'); X.shake(0.25, 0.35);
      const ws = X.workShot({ x: b[0], z: b[1] }, st, { dist: b[2] * 2.6 + 8, el: 26, side: -0.5, lift: b[2] * 0.4 });
      X.shot(ws.p, ws.t, 1.2);
      try { X.stages.hitBoulder(s, 1); } catch (e) { /* */ }
      await new Promise((r) => setTimeout(r, 1100));
      try { X.stages.hitBoulder(s, 0); } catch (e) { /* */ }
      X.play('split'); X.dust(b[0], gy + 1, b[1], 26, b[2] * 0.7); X.shake(0.3, 0.6);
      for (const w of A.wedges) X.props.remove(w.w); for (const L of A.lines) X.props.remove(L.mesh);
      // every split leaves chips for the waste pile (the trimming); a crooked one more, a lost rock the whole of it
      let waste = 1;
      if (lost) { X.word(at, 'פעמיים עקום: הסלע נפסל · הצוות גורר לפסולת'); waste = 3; }
      else if (crooked) { X.word(at, wrong ? 'קו לא נכון: נבקע עקום · כשר' : 'נבקע במדרגות · כשר'); waste = 2; }
      else if (g.line === 'gold' && g.space === 'gold' && g.water === 'gold') { X.bonus(150, 'great', 'מהודר · יישר כוח'); }
      if (waste) wasteAdd(X, waste, at);
      const q = lost ? 0 : ['line', 'space', 'water'].reduce((a, k) => a + (g[k] === 'gold' ? 1 : g[k] === 'good' ? 0.8 : 0.5), 0) / 3 * (crooked ? 0.75 : 1);
      setTimeout(() => X.end({ q, stars: lost ? 0 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, lost, at }), 1300);
    }
    return {
      begin() {
        const ws = X.workShot({ x: b[0], z: b[1] }, st, { dist: b[2] * 1.6 + 5, el: 16, side: -0.42, lift: b[2] * 0.35 });
        X.shot(ws.p, ws.t, 0.9);
        X.line('גררו ימינה ושמאלה: האור מהמראה מגלה את קו הבקיעה');
        X.hand({ x: b[0], y: gy + b[2] * 0.4, z: b[1] }, 40, 0);
        X.stages.hero.setTool && X.hero.arm(null);
      },
      update(dt) {
        A.t += dt; light(dt);
        if (A.step === 'water') {
          if (A.hold) {
            A.water += dt / 2.5;
            for (const w of A.wedges) w.w.scale.setScalar(1 + Math.min(1, A.water) * 0.3);
            A.creakT -= dt; if (A.water < 1 && A.creakT <= 0) { A.creakT = 0.55; X.play('creak'); }
            X.meter({ x: b[0], y: gy + b[2] * 1.05, z: b[1] }, Math.min(1, A.water / 1.0));
            if (A.water > 1 + [1.0, 0.55, 0.4][lv - 1] + 0.6) { A.hold = false; this.up(); }
          }
        }
      },
      down(p) {
        A.p0 = { x: p.x, y: p.y }; A.th0 = A.th; A.tDown = performance.now() / 1000;
        if (A.step === 'water') { A.hold = true; X.play('pour'); if (SH.jarMan) { SH.crew.setRole(SH.jarMan, 'hold', { item: 'jar' }); try { SH.crew.A.pose(SH.jarMan.a, 'pour'); } catch (e) { /* */ } } }
      },
      move(p) {
        if (A.step === 'turn' || (A.step === 'wedge' && !A.pick)) A.th = clamp(A.th0 + (A.p0.x - p.x) * 0.0045, -0.75, 0.75);
      },
      up(p) {
        const tap = p && A.p0 && Math.hypot(p.x - A.p0.x, p.y - A.p0.y) < 12 && performance.now() / 1000 - A.tDown < 0.35;   // (a tap by the finger's clock, not the frames')
        if ((A.step === 'turn' || A.step === 'wedge') && tap) {
          // a tap on a shown line: its first wedge; the first tap chooses the line
          let best = null, bd = 1e9; for (const L of A.lines) { if (!L.seen) continue; const r = lineDist(L, p); if (r.d < bd) { bd = r.d; best = { L, u: r.u }; } }
          if (!A.pick) {
            if (!best || bd > 34) { if (A.lines.some((L) => L.seen)) fall(p); else X.word({ x: b[0], y: gy + b[2], z: b[1] }, 'קודם מצאו את הקו באור'); return; }
            A.pick = best.L; A.step = 'wedge'; A.res.line = best.L.ok ? 'gold' : 'ok';
            if (best.L.ok) X.hit({ x: best.L.pts[8].x, y: best.L.pts[8].y + 1, z: best.L.pts[8].z }, 'gold', { text: 'קו נכון', craft: 'סתתים' });
            X.line(`הקישו על הקו: ${nW} יתדות עץ, ברווחים שווים`); X.hand(null);
          }
          const r = lineDist(A.pick, p);
          if (r.d > 34) { fall(p); return; }
          if (A.wedges.some((w) => Math.abs(w.u - r.u) < 0.07)) { fall(p); return; }
          const grade = r.d < 12 ? 'gold' : r.d < 22 ? 'good' : 'ok';
          const at = wedgeAt(A.pick, r.u, grade);
          X.hit(at, grade, { text: '', craft: 'סתתים' });
          X.count(at, `${A.wedges.length}/${nW}`);
          if (A.wedges.length >= nW) {
            A.res.space = spacing(); X.count(null);
            const mid = A.pick.pts[4];
            if (A.res.space === 'ok') X.word({ x: mid.x, y: mid.y + 1.5, z: mid.z }, 'רווחים לא שווים'); else X.hit({ x: mid.x, y: mid.y + 1.5, z: mid.z }, A.res.space, { text: 'רווח שווה', craft: 'סתתים' });
            A.step = 'water'; A.water = 0;
            X.line('החזיקו: שופכים מים על היתדות. שחררו כשהחריקה נגמרת');
            const ws = X.workShot({ x: b[0], z: b[1] }, st, { dist: b[2] * 1.4 + 5, el: 20, side: -0.55, lift: b[2] * 0.35 });
            X.shot(ws.p, ws.t, 0.7);
          }
          return;
        }
        if (A.step === 'water' && (A.hold || A.water > 0)) {
          A.hold = false;
          if (SH.jarMan) SH.crew.setRole(SH.jarMan, 'hold', { item: 'jar' });
          const over = A.water - 1, win = [1.0, 0.55, 0.4][lv - 1];
          if (A.water < 0.85) { A.early++; X.word({ x: b[0], y: gy + b[2] * 1.1, z: b[1] }, 'עוד לא — עוד חורק'); return; }
          A.res.water = over >= -0.15 && over <= win ? (over >= 0 ? 'gold' : 'good') : over <= win + 0.6 ? 'good' : 'ok';
          X.meter(null);
          if (A.res.water !== 'ok') X.hit({ x: b[0], y: gy + b[2], z: b[1] }, A.res.water, { text: 'בזמן', craft: 'סתתים' }); else X.word({ x: b[0], y: gy + b[2], z: b[1] }, 'יותר מדי מים');
          split();
        }
      },
      end() { for (const o of [beam, glow, mirror]) X.props.remove(o); for (const L of A.lines) X.props.remove(L.mesh); for (const w of A.wedges) X.props.remove(w.w); for (const j of A.junk || []) X.props.remove(j); X.meter(null); X.count(null); },
      at() { return { x: b[0], y: gy + b[2], z: b[1] }; },
      dbg() { return { step: A.step, nW, th: +A.th.toFixed(3), seen: A.lines.map((L) => L.seen), linePhi: A.lines.map((L) => +(L.phi - phiH).toFixed(3)), wedges: A.wedges.length, water: +A.water.toFixed(2), res: A.res, lineScr: A.lines.map((L) => { const q = X.scr(L.pts[4].x, L.pts[4].y, L.pts[4].z); return [Math.round(q.x), Math.round(q.y)]; }), lineEnds: A.lines.map((L) => [0, 8].map((i) => { const q = X.scr(L.pts[i].x, L.pts[i].y, L.pts[i].z); return [Math.round(q.x), Math.round(q.y)]; })) }; },
    };
  },
};

/* ───────── the waste pile (beside the east sectors) and the fill behind the east retaining wall ───────── */
const PILE = { x: 236, z: -24 }, FILL = { x: 262, z: -44 };
function pileSync(X) {
  const n = Math.min(14, X.M.st.waste | 0); SH.pileM = SH.pileM || [];
  while (SH.pileM.length > n) X.props.remove(SH.pileM.pop());
  // (the bay is dug deeper as the Mount comes down: the heap sits on the ground as it is now)
  SH.pileM.forEach((mm, i) => { if (!mm.userData.on) mm.position.y = X.ground(mm.position.x, mm.position.z) + mm.scale.x * 0.4 + Math.floor(i / 5) * 0.35; });
  while (SH.pileM.length < n) {
    const i = SH.pileM.length, a = i * 2.4, r = 0.6 + (i % 5) * 0.45, x = PILE.x + Math.cos(a) * r, z = PILE.z + Math.sin(a) * r, s = 0.85 + hash(i, 2) * 0.4;
    const mm = new X.THREE.Mesh(X.props.geo.chunk, X.props.M.stoneD); mm.scale.set(s, s * 0.8, s); mm.position.set(x, X.ground(x, z) + s * 0.4 + Math.floor(i / 5) * 0.35, z); mm.rotation.set(i, i * 2, 0); mm.castShadow = true; X.props.root.add(mm); SH.pileM.push(mm);
  }
}
function fillSync(X) {
  const n = X.M.st.wasteIn | 0;
  if (!SH.fillM) { const g = new X.THREE.SphereGeometry(1, 16, 8, 0, TAU, 0, Math.PI / 2); SH.fillM = new X.THREE.Mesh(g, X.props.M.stoneD); SH.fillM.position.set(FILL.x, X.ground(FILL.x, FILL.z) - 0.2, FILL.z); SH.fillM.receiveShadow = true; X.props.root.add(SH.fillM); }
  SH.fillM.position.y = X.ground(FILL.x, FILL.z) - 0.2;
  const k = Math.min(1, n / 18); SH.fillM.scale.set(3 + k * 7, 0.2 + k * 2.2, 3 + k * 6); SH.fillM.visible = n > 0;
}
/** stones to the waste pile (a crooked split, a rejected stone): a chunk flies there when it is near, the pile grows */
function wasteAdd(X, n, at) {
  if (at && Math.hypot(at.x - PILE.x, at.z - PILE.z) < 60) X.props.chunksAt({ x: at.x, y: at.y - 1, z: at.z, r: 1.4 }, 3);
  X.M.st.waste = (X.M.st.waste | 0) + n;   // (straight into the save: the pile is seen at once)
  setTimeout(() => pileSync(X), 1400);
}

/* ───────── 3.4 the paving ───────── */
const U = 1.6, W = 6;
const PILES = [[3, 3, 2, 2, 1, 1, 1], [3, 3, 3, 1, 1, 1], [3, 3, 3, 3, 3, 2, 1]];
const CREW_JOINTS = [2, 4];
function gridOf(X, s, rows) {
  const b = SH.bould[s], x0 = b[0] - (W * U) / 2, z0 = b[1] - (rows * U) / 2;
  let base = -1e9; for (let i = 0; i <= 6; i++) for (let j = -1; j <= rows + 3; j++) base = Math.max(base, X.ground(x0 + i * U * (W / 6), z0 + j * U));
  return { x0, z0, base: base + 0.05, rows, cx: b[0], cz: b[1] };
}
function slabMesh(X, L, broken) {
  const T = X.THREE, mat = X.props.M.stone.clone(); mat.color.offsetHSL(0, 0, (hash(L, Math.random()) - 0.5) * 0.06);
  const g = new T.Group(); const m = new T.Mesh(new T.BoxGeometry(L * U * 0.96, 0.34, U * 0.94), mat); m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.body = m;
  if (broken) { const c = new T.Mesh(new T.PlaneGeometry(L * U * 0.7, 0.07), X.props.M.seam); c.rotation.x = -Math.PI / 2; c.rotation.z = 0.5; c.position.y = 0.18; g.add(c); }
  X.props.root.add(g); return g;
}
function layDone(X, s) {
  // a paved sector (reload): the crews' row and the kohen's rows, closed
  const G = gridOf(X, s, 2); const L = [[3, 3], [1, 3, 2], [2, 2, 2]];
  [[2, 2, 2], ...L.slice(0, 2)].forEach((row, y) => { let x = 0; for (const l of row) { const m = slabMesh(X, l, false); m.position.set(G.x0 + (x + l / 2) * U, G.base + 0.17, G.z0 + (y - 0.5) * U); x += l; } });
}
export const PAVE = {
  icon: '🧱', title: 'ריצוף הגזרה',
  walkLine: (m) => `גזרה ${m.s + 1}: מרצפים את מה שיושר`,
  stand(m, X) { const b = SH.bould[m.s]; if (!b) return null; return { x: b[0] - 3, z: b[1] + (X.level() * U) / 2 + 5.5, face: [b[0], b[1]] }; },
  prepare(m, X) {
    const b = SH.bould[m.s]; if (!b) return; const C = SH.crew;
    SH.secCrew = SH.secCrew || []; for (const w of SH.secCrew) C.remove(w); SH.secCrew = [];
    // two pavers set the next rows; a cart of slabs; (the boy with the broom: טיוטה)
    SH.secCrew.push(C.add(b[0] + W * U / 2 + 1.5, b[1] - 2, { role: 'hammer', item: 'mallet', fx: b[0] + W * U / 2 - 1, fz: b[1] - 2.5, crew: 2 }));
    SH.secCrew.push(C.add(b[0] - W * U / 2 - 6, b[1] + 5, { role: 'carry', from: [b[0] - W * U / 2 - 6, b[1] + 5], to: [b[0] - W * U / 2 - 1.5, b[1] - 2], item: 'stone', crew: 2 }));
  },
  make(m, X) {
    const lv = X.level(), rows = lv, G = gridOf(X, m.s, rows), T = X.THREE;
    const cell = []; for (let y = 0; y < rows; y++) cell.push(Array(W).fill(null));
    const S = []; const A = { drag: null, t: 0, closed: Array(rows).fill(false), kasher: Array(rows).fill(false), fill: [], done: false, ids: 0, reject: null };
    const cw = (cx, cy) => ({ x: G.x0 + (cx + 0.5) * U, z: G.z0 + (cy + 0.5) * U });
    // the crews' row under the first (its joints at 2 and 4): the rule is seen
    const crew = []; { let x = 0; for (const l of [2, 2, 2]) { const s2 = slabMesh(X, l, false); s2.position.set(G.x0 + (x + l / 2) * U, G.base + 0.17, G.z0 - 0.5 * U); crew.push(s2); x += l; } }
    // the empty rows: gold cells on the ground
    const outline = []; for (let y = 0; y < rows; y++) for (let x = 0; x < W; x++) { const c = cw(x, y); const r = new T.Mesh(new T.PlaneGeometry(U * 0.9, U * 0.9), X.props.M.gold.clone()); r.material.opacity = 0.22; r.rotation.x = -Math.PI / 2; r.position.set(c.x, G.base + 0.03, c.z); X.props.root.add(r); outline.push(r); }
    // the pile beside the rows (south)
    const pile = PILES[lv - 1].slice(); const broken = lv >= 3;
    // (in rows no wider than the grid: the whole pile in the shot, beside it the reject ring)
    const pz = G.z0 + rows * U + 2.6, rowW = W * U + 0.8;
    const all = broken ? [...pile, 2] : pile;
    let px = G.x0, pr = 0;
    all.forEach((L, i) => {
      const bk = broken && i === all.length - 1; const g = slabMesh(X, L, bk);
      if (px + L * U > G.x0 + rowW) { px = G.x0; pr++; }
      const home = { x: px + (L * U) / 2, z: pz + pr * (U + 0.35) }; px += L * U + 0.4;
      g.position.set(home.x, G.base + 0.17, home.z);
      S.push({ id: ++A.ids, L, rot: 0, at: null, g, home, broken: bk, y: 0.17, tx: home.x, tz: home.z, ty: G.base + 0.17, rotA: 0 });
    });
    const pileD = (pr + 1) * (U + 0.35);
    const rej = { x: G.x0 + W * U + 3.5, z: pz + 0.8 }; A.reject = X.props.ringAt(rej.x, rej.z, 1.3, 0.12, X.props.M.ring);
    const fits = (sl, cx, cy, rot) => { for (let k = 0; k < sl.L; k++) { const x = rot ? cx : cx + k, y = rot ? cy + k : cy; if (x < 0 || x >= W || y < 0 || y >= rows) return false; const c = cell[y][x]; if (c && c !== sl) return false; } return true; };
    const occupy = (sl, v) => { if (!sl.at) return; for (let k = 0; k < sl.L; k++) { const x = sl.rot ? sl.at[0] : sl.at[0] + k, y = sl.rot ? sl.at[1] + k : sl.at[1]; cell[y][x] = v ? sl : null; } };
    function pickAt(p) {
      const rc = X.rayAt(p.x, p.y); const hits = rc.intersectObjects(S.filter((q) => !q.gone).map((q) => q.g.userData.body), false);
      if (!hits.length) return null; return S.find((q) => q.g.userData.body === hits[0].object) || null;
    }
    function joints(y) { const J = new Set(); if (y < 0) { for (const j of CREW_JOINTS) J.add(j); return J; } for (let x = 1; x < W; x++) { const a = cell[y][x - 1], c = cell[y][x]; if (a !== c) J.add(x); } return J; }
    function checkRows() {
      for (let y = 0; y < rows; y++) {
        if (A.closed[y] || cell[y].some((c) => !c)) continue;
        A.closed[y] = true;
        const J = joints(y), Jb = joints(y - 1); let joj = false; for (const j of J) if (Jb.has(j)) joj = true;
        const bk = cell[y].some((c) => c && c.broken), filled = A.fill.some((f) => f.y === y);
        const mid = cw(W / 2 - 0.5, y), at = { x: mid.x, y: G.base + 1.2, z: mid.z };
        if (joj || bk || filled) { A.kasher[y] = true; X.word(at, bk ? 'לוח שבור נסדק · כשר' : filled ? 'הצוות מילא באבן קטנה · כשר' : 'חיבור על חיבור · כשר'); if (joj || bk) { for (const c of cell[y]) if (c) c.wob = 0.6; X.shake(0.12, 0.2); } }
        else { X.bonus(100, 'row', 'שורה סגורה'); A.sweep = { y, t: 0 }; X.play('tier'); }
      }
      if (A.closed.every(Boolean) && !A.done) {
        A.done = true;
        const q = A.closed.reduce((a, _, y) => a + (A.kasher[y] ? 0.6 : 1), 0) / rows;
        setTimeout(() => X.end({ q, stars: q >= 0.99 ? 3 : q >= 0.75 ? 2 : 1, at: { x: G.cx, y: G.base + 1.5, z: G.cz } }), 1200);
      }
    }
    function stuck() {
      if (A.closed.every(Boolean)) return false;
      const left = S.filter((q) => !q.at && !q.gone && !q.broken);
      for (const q of left) for (let y = 0; y < rows; y++) for (let x = 0; x < W; x++) { if (fits(q, x, y, 0)) return false; if (q.L <= rows && fits(q, x, y, 1)) return false; }
      return true;
    }
    function crewFill() {
      // the pile ran out with gaps: the crew fills each with a small stone (seen)
      for (let y = 0; y < rows; y++) for (let x = 0; x < W; x++) if (!cell[y][x]) {
        const c = cw(x, y), mm = new T.Mesh(X.props.geo.chunk, X.props.M.stoneD); mm.scale.set(U * 0.42, 0.25, U * 0.42); mm.position.set(c.x, G.base + 0.15, c.z); X.props.root.add(mm);
        const f = { y, x, mm }; A.fill.push(f); cell[y][x] = f; X.dust(c.x, G.base + 0.3, c.z, 4, 1.2);
      }
      X.play('settle'); checkRows();
    }
    function place(q) {
      // where it would sit: its first cell from its centre
      const p = { x: q.tx, z: q.tz }, cx = q.rot ? Math.round((p.x - G.x0) / U - 0.5) : Math.round((p.x - G.x0) / U - q.L / 2), cy = q.rot ? Math.round((p.z - G.z0) / U - q.L / 2) : Math.round((p.z - G.z0) / U - 0.5);
      if (q.broken && Math.hypot(p.x - rej.x, p.z - rej.z) < 2.4) { q.gone = true; q.ty = G.base - 1; X.bonus(20, 'reject', 'זיהית לוח שבור'); X.play('stamp'); setTimeout(() => X.props.remove(q.g), 700); return; }
      if (fits(q, cx, cy, q.rot)) {
        q.at = [cx, cy]; occupy(q, true);
        const c0 = cw(cx, cy); q.tx = q.rot ? c0.x : c0.x + ((q.L - 1) * U) / 2; q.tz = q.rot ? c0.z + ((q.L - 1) * U) / 2 : c0.z; q.ty = G.base + 0.17;
        X.dust(q.tx, G.base + 0.2, q.tz, 6, 1.6); X.play('thud');
        X.hit({ x: q.tx, y: G.base + 1, z: q.tz }, 'good', { text: '', craft: 'רצפים' });
        checkRows();
      } else {
        // it does not fit: it slides back to the pile
        q.at = null; q.tx = q.home.x; q.tz = q.home.z; q.ty = G.base + 0.17;
        if (q.rot) { q.rot = 0; }
        X.word({ x: p.x, y: G.base + 1.2, z: p.z }, 'לא נכנס'); X.play('grind');
      }
      if (stuck()) setTimeout(crewFill, 900);
    }
    return {
      begin() {
        { const zc = (G.z0 + pz + pileD) / 2; X.shot([G.cx + 1, G.base + 15.5 + pileD * 0.6, zc + 9.5 + pileD * 0.4], [G.cx + 1.2, G.base, zc + 0.6], 1.0); }
        X.line('גררו לוח אל השורה · הקשה על לוח מסובבת אותו · בלי חיבור מעל חיבור');
        const q = S[0]; X.hand({ x: q.home.x, y: G.base + 0.6, z: q.home.z }, 0, -40);
        try { X.hero.setPos(G.cx - W * U / 2 - 2.5, G.cz + rows * U / 2 + 1.5, Math.PI * 0.6); } catch (e) { /* */ }
      },
      update(dt) {
        A.t += dt;
        for (const q of S) {
          if (q.gone && q.g.position.y < G.base - 0.8) continue;
          const lift = A.drag && A.drag.q === q ? 0.9 : 0;
          const k = 1 - Math.exp(-dt * (A.drag && A.drag.q === q ? 7 : 12));
          q.g.position.x += (q.tx - q.g.position.x) * k; q.g.position.z += (q.tz - q.g.position.z) * k; q.g.position.y += (q.ty + lift - q.g.position.y) * k;
          q.rotA += ((q.rot ? Math.PI / 2 : 0) - q.rotA) * Math.min(1, dt * 14); q.g.rotation.y = q.rotA;
          if (q.wob > 0) { q.wob -= dt; q.g.rotation.z = Math.sin(q.wob * 40) * 0.03 * q.wob; } else q.g.rotation.z = 0;
        }
        if (A.sweep) { A.sweep.t += dt; for (const c of cell[A.sweep.y]) if (c && c.g) { const b = c.g.userData.body.material; b.emissive = b.emissive || new T.Color(); b.emissive.setRGB(0.5, 0.38, 0.1).multiplyScalar(Math.max(0, 1 - A.sweep.t * 1.4)); } if (A.sweep.t > 0.8) A.sweep = null; }
      },
      down(p) {
        if (A.done) return;
        const q = pickAt(p); if (!q) return;
        A.drag = { q, x0: p.x, y0: p.y, t0: performance.now() / 1000, moved: false };
        if (q.at) { occupy(q, false); q.at = null; }
        const g = onPlane(X, p.x, p.y, G.base + 0.2); if (g) { A.drag.ox = q.g.position.x - g.x; A.drag.oz = q.g.position.z - g.z; }
        X.hand(null); X.play('tool');
      },
      move(p) {
        const D = A.drag; if (!D) return; if (Math.hypot(p.x - D.x0, p.y - D.y0) > 10) D.moved = true;
        const g = onPlane(X, p.x, p.y, G.base + 0.2); if (g) { D.q.tx = g.x + (D.ox || 0); D.q.tz = g.z + (D.oz || 0); }
      },
      up(p) {
        const D = A.drag; if (!D) return; A.drag = null; const q = D.q;
        if (!D.moved && performance.now() / 1000 - D.t0 < 0.35) {
          // a tap turns it a quarter (in place if it still fits there; at the pile always)
          q.rot = q.rot ? 0 : 1; q.tx = q.g.position.x; q.tz = q.g.position.z; X.play('swoosh');
          if (q.home && Math.hypot(q.g.position.x - q.home.x, q.g.position.z - q.home.z) < 0.5) { q.tx = q.home.x; q.tz = q.home.z; return; }
        }
        place(q); void p;
      },
      end() { for (const o of outline) X.props.remove(o); if (A.reject) X.props.remove(A.reject); for (const q of S) if (!q.at && !q.gone) X.props.remove(q.g); },
      at() { return { x: G.cx, y: G.base + 1.5, z: G.cz }; },
      dbg() { const sc = (q) => { const r = X.scr(q.g.position.x, q.g.position.y, q.g.position.z); return [Math.round(r.x), Math.round(r.y)]; }; return { rows, closed: A.closed, kasher: A.kasher, grid: cell.map((r) => r.map((c) => (c ? (c.L || 'f') : 0)).join('')), slabs: S.map((q) => ({ L: q.L, rot: q.rot, at: q.at, broken: q.broken, gone: !!q.gone, scr: sc(q) })), cells: cell.map((r, y) => r.map((_, x) => { const c = cw(x, y), s2 = X.scr(c.x, G.base + 0.2, c.z); return [Math.round(s2.x), Math.round(s2.y)]; })), rej: (() => { const r = X.scr(rej.x, G.base, rej.z); return [Math.round(r.x), Math.round(r.y)]; })() }; },
    };
  },
};

/* ───────── 3.9 the waste: dragged to the sledge in time with the oxen, pushed to the hollow behind the east wall ───────── */
export const WASTE = {
  icon: '🪨', title: 'פינוי הפסולת',
  walkLine: () => 'ערימת הפסולת: מפנים אותה אל המילוי מאחורי החומה',
  stand(m, X) { return { x: PILE.x - 4.5, z: PILE.z - 3, face: [PILE.x + 4, PILE.z - 1] }; },
  prepare() {},
  make(m, X) {
    const lv = X.level(), T = X.THREE, gyP = X.ground(PILE.x, PILE.z);
    const cap = [3, 4, 5][lv - 1];
    const A = { phase: 'load', t: 0, drag: null, on: [], trips: 0, hold: false, sx: PILE.x + 5.5, sz: PILE.z - 1.5, s0: null, grades: [], dumped: 0 };
    A.s0 = { x: A.sx, z: A.sz };
    // the sledge: planks on two runners, the oxen yoked before it (animals.js bulls), the drover beside them
    const sled = new T.Group(); { const bed = new T.Mesh(new T.BoxGeometry(3.4, 0.25, 2.2), X.props.M.wood); bed.position.y = 0.45; sled.add(bed); for (const s of [-0.9, 0.9]) { const r = new T.Mesh(new T.BoxGeometry(3.8, 0.22, 0.2), X.props.M.woodD); r.position.set(0.1, 0.15, s); sled.add(r); } const pole = new T.Mesh(new T.BoxGeometry(3.2, 0.12, 0.12), X.props.M.woodD); pole.position.set(3.1, 0.6, 0); sled.add(pole); }
    X.props.root.add(sled);
    const an = X.stages.crewAnimals || null; const oxen = [];
    if (an) for (const s of [-0.75, 0.75]) { const h = an.add('bull', A.sx + 5, A.sz + s, { yaw: Math.PI / 2, calm: true }); if (h) oxen.push(h); }
    const drover = SH.crew.add(A.sx + 5, A.sz - 2.2, { role: 'hold', item: 'staff', fx: A.sx + 9, fz: A.sz, crew: 1 });
    const levelers = [SH.crew.add(FILL.x + 4, FILL.z + 3, { role: 'lever', item: 'beam', fx: FILL.x, fz: FILL.z, crew: 0 }), SH.crew.add(FILL.x - 3, FILL.z + 4.5, { role: 'lever', item: 'beam', fx: FILL.x, fz: FILL.z, off: 0.5, crew: 0 })];
    const dirX = FILL.x - A.sx, dirZ = FILL.z - A.sz, dL = Math.hypot(dirX, dirZ), ux = dirX / dL, uz = dirZ / dL;
    // the chunks on the pile as things to drag (the pile's own meshes)
    const chunks = () => (SH.pileM || []).filter((c) => !c.userData.on);
    let step = 0;
    function sledPos(dt) {
      // while loading the oxen shift a step every gold beat (k = 2): the sledge jolts forward and back; still = the moment to load
      const ph = SH.B.phase(2);
      if (A.phase === 'load') { step = ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI) * 0.35 : 0; }
      sled.position.set(A.sx + ux * step, X.ground(A.sx, A.sz), A.sz + uz * step); sled.rotation.y = -Math.atan2(uz, ux);
      oxen.forEach((h, i) => { const px = -uz * (i ? 0.75 : -0.75), pz = ux * (i ? 0.75 : -0.75); h.x = sled.position.x + ux * 5.2 + px; h.z = sled.position.z + uz * 5.2 + pz; h.yaw = Math.atan2(ux, uz); });
      for (const c of A.on) { c.position.x = sled.position.x + c.userData.bx * ux - c.userData.bz * uz; c.position.z = sled.position.z + c.userData.bx * uz + c.userData.bz * ux; c.position.y = sled.position.y + 0.85 + c.userData.by; }
      void dt;
    }
    function pickAt(p) {
      const L = chunks(); const hits = X.rayAt(p.x, p.y).intersectObjects(L, false); if (hits.length) return hits[0].object;
      // (a finger is wide: the nearest chunk within 60 px)
      let best = null, bd = 60; for (const c of L) { const q = X.scr(c.position.x, c.position.y, c.position.z); const d = Math.hypot(q.x - p.x, q.y - p.y); if (q.on && d < bd) { bd = d; best = c; } } return best;
    }
    function load(c) {
      const ph = SH.B.phase(2), still = ph > 0.32 && ph < 0.95;
      const grade = still ? (ph > 0.45 && ph < 0.85 ? 'gold' : 'good') : 'ok';
      if (grade === 'ok' && lv >= 2 && hash(A.t, c.id) < 0.5) {
        // dropped on a moving sledge: it rolls off back to the pile (another round)
        c.userData.on = false; X.word({ x: c.position.x, y: c.position.y + 1, z: c.position.z }, 'נפל מהמזחלת'); X.play('thud'); c.position.set(PILE.x + 1, X.ground(PILE.x + 1, PILE.z) + 0.4, PILE.z); return;
      }
      const k = A.on.length; c.userData.on = true; c.userData.bx = -1 + (k % 3) * 1.0; c.userData.bz = -0.5 + Math.floor(k / 3) * 0.9; c.userData.by = Math.floor(k / 6) * 0.3; A.on.push(c);
      A.grades.push(grade); X.dust(sled.position.x, sled.position.y + 0.8, sled.position.z, 4, 1.2); X.play('thud');
      X.hit({ x: sled.position.x, y: sled.position.y + 2, z: sled.position.z }, grade, { text: '', craft: 'סבלים' });
      if (A.on.length >= cap || !chunks().length) { A.phase = 'push'; X.line('החזיקו: דוחפים עם השוורים. שחררו ליד המילוי שמאחורי החומה'); X.hand({ x: FILL.x, y: X.ground(FILL.x, FILL.z) + 1, z: FILL.z }, 0, 0); X.shot([A.sx - uz * 22 - ux * 4, X.ground(A.sx, A.sz) + 13, A.sz + ux * 22 - uz * 4], [(A.sx + FILL.x) / 2, X.ground(FILL.x, FILL.z) + 1, (A.sz + FILL.z) / 2], 1.0); }
    }
    function dump() {
      const d = Math.hypot(sled.position.x - FILL.x, sled.position.z - FILL.z);
      A.phase = 'dump';
      const n = A.on.length; const st = X.M.st;
      for (const c of A.on) { X.props.remove(c); const i = (SH.pileM || []).indexOf(c); if (i >= 0) SH.pileM.splice(i, 1); }
      A.on = []; A.dumped += n;
      X.props.chunksAt({ x: FILL.x, y: X.ground(FILL.x, FILL.z) + 1.4, z: FILL.z, r: 1.2 }, Math.min(6, n + 2));
      st.waste = Math.max(0, st.waste - n); st.wasteIn = (st.wasteIn | 0) + n;   // (the model's done() moves the rest)
      fillSync(X); X.dust(FILL.x, X.ground(FILL.x, FILL.z) + 0.5, FILL.z, 18, 4); X.play('settle'); X.shake(0.15, 0.25);
      if (d < 4) X.bonus(60, 'sled', 'מזחלת'); else X.word({ x: FILL.x, y: X.ground(FILL.x, FILL.z) + 2, z: FILL.z }, 'רחוק מהמילוי · הצוות משלים');
      A.trips++;
      setTimeout(() => {
        if (!chunks().length) { X.bonus(100, 'clean', 'האתר נקי'); finish(); return; }
        A.sx = A.s0.x; A.sz = A.s0.z; A.phase = 'load'; X.line('גררו עוד גושים אל המזחלת'); begin2();
      }, 1400);
    }
    function finish() {
      A.phase = 'done';
      const q = A.grades.length ? A.grades.reduce((a, g) => a + (g === 'gold' ? 1 : g === 'good' ? 0.8 : 0.5), 0) / A.grades.length : 1;
      X.end({ q, stars: q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, at: { x: FILL.x, y: X.ground(FILL.x, FILL.z) + 2, z: FILL.z } });
    }
    function begin2() { const g = X.ground(PILE.x, PILE.z); X.shot([PILE.x - 9, g + 17, PILE.z + 12], [PILE.x + 3.5, g + 0.5, PILE.z - 0.5], 0.9); }
    return {
      begin() { pileSync(X); (SH.pileM || []).forEach((c, i) => { c.userData.id = i; c.userData.on = false; }); begin2(); X.line('גררו גוש מהערימה אל המזחלת, כשהשוורים עומדים'); const c = chunks()[0]; if (c) X.hand({ x: c.position.x, y: c.position.y + 0.5, z: c.position.z }, 40, -10); if (!chunks().length) finish(); },
      update(dt) {
        A.t += dt;
        if (A.phase === 'push') {
          if (A.hold) { const v = 3.2; A.sx += ux * v * dt; A.sz += uz * v * dt; for (const h of oxen) { h.path = [[h.x + ux, h.z + uz]]; h.pi = 0; h.speed = v; } }
          else for (const h of oxen) h.path = null;
          const d = Math.hypot(A.sx - A.s0.x, A.sz - A.s0.z); if (d > dL + 4) { A.hold = false; dump(); }
        }
        sledPos(dt);
        const D = A.drag; if (D) { const k = 1 - Math.exp(-dt * 7); D.c.position.x += (D.tx - D.c.position.x) * k; D.c.position.z += (D.tz - D.c.position.z) * k; D.c.position.y += (X.ground(D.tx, D.tz) + 1.6 - D.c.position.y) * k; }
      },
      down(p) {
        if (A.phase === 'load') { const c = pickAt(p); if (!c) return; A.drag = { c, tx: c.position.x, tz: c.position.z, home: c.position.clone() }; X.hand(null); X.play('tool'); return; }
        if (A.phase === 'push') { A.hold = true; X.hand(null); X.play('cart'); }
      },
      move(p) { const D = A.drag; if (!D) return; const g = onPlane(X, p.x, p.y, gyP + 1.6); if (g) { D.tx = g.x; D.tz = g.z; } },
      up() {
        if (A.phase === 'push' && A.hold) { A.hold = false; const d = Math.hypot(sled.position.x - FILL.x, sled.position.z - FILL.z); if (d < 4) dump(); else if (Math.hypot(A.sx - A.s0.x, A.sz - A.s0.z) > dL - 4) dump(); return; }
        const D = A.drag; if (!D) return; A.drag = null;
        const c = D.c, d = Math.hypot(D.tx - sled.position.x, D.tz - sled.position.z);
        if (d < 2.6) load(c); else { c.position.copy(D.home); X.word({ x: c.position.x, y: c.position.y + 1, z: c.position.z }, 'חזר לערימה'); }
      },
      end() { X.props.remove(sled); for (const h of oxen) try { an.remove(h); } catch (e) { /* */ } SH.crew.remove(drover); for (const w of levelers) SH.crew.remove(w); },
      at() { return { x: FILL.x, y: X.ground(FILL.x, FILL.z) + 2, z: FILL.z }; },
      dbg() { const sc = (o) => { const r = X.scr(o.x, o.y, o.z); return [Math.round(r.x), Math.round(r.y)]; }; return { phase: A.phase, on: A.on.length, cap, pile: chunks().length, trips: A.trips, dFill: +Math.hypot(sled.position.x - FILL.x, sled.position.z - FILL.z).toFixed(1), sled: sc(sled.position), chunks: chunks().map((c) => sc(c.position)), fill: sc({ x: FILL.x, y: X.ground(FILL.x, FILL.z), z: FILL.z }), ph: +SH.B.phase(2).toFixed(2) }; },
    };
  },
};

export function initWorld2(X, sh) {
  SH = sh; SH.bigSt = {};
  const st = X.M.st;
  pileSync(X); fillSync(X);
  for (let s = 0; s < 9; s++) if (st.done.includes('pave' + s)) layDone(X, s);
  void ease; void createGang;
}
export function frame2(dt, X, sh) { void dt; void X; void sh; }
export { PILE, FILL, wasteAdd, pileSync };
