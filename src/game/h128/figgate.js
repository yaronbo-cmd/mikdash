/* ── build 128 ── h128/figgate.js — the figures gate (the owner 15.11, again: "figures only when they are needed, otherwise out").
 * One rule for every act of every stage, run by the director while an act is on (after its camera settled, and whenever the look
 * changes): every figure of the world's figure layer (actors.js, the crews' and the acts' gangs) is tested against the act's camera at
 * u 0 and at u 0.3 (the play zone's lens, look.js), and
 *   (a) a figure the act did not put there (not a pack gang's man added since the act began: the world's crews, life, the stations' men) is not drawn while
 *       the act is on, wherever it stands — it comes back when the act ends;
 *   (b) a figure of the act's own whose box crosses the frame's edge at either u, or (c) stands between the camera and the work's focus
 *       (in front of it and over it on the screen) is drawn as it is and reported (__FIG.report()): the act's camera or its stand is
 *       what must change, not the figure;
 *   the kohen (the hero) is the act's own when the act asks for him (X.kohen), and is hidden when he fails (b) or (c).
 * No randomness, no timers of its own: the director calls step(dt) from its frame.
 *   createFigGate({ THREE, camera, actors: () => actors.js API, hero: { xyz(), show(v) }, pose: (u) => { p, t, fov } | null })
 *   → { begin(focus), step(dt, focus), end(), report(), stats() } */
const H = 3.9, R = 0.55, U2 = 0.3, EVERY = 0.25;

export function createFigGate(o) {
  const T = o.THREE;
  const cam = new T.PerspectiveCamera(40, 1.6, 0.1, 5000);
  const v = new T.Vector3();
  const G = { on: false, pre: new Set(), off: new Set(), heroOff: false, t: 0, key: '', rep: [], n: { hidden: 0, own: 0, ownCut: 0, ownBlock: 0 } };
  const A = () => { try { return o.actors ? o.actors() : null; } catch (e) { return null; } };
  const list = () => { const a = A(); return a && Array.isArray(a.list) ? a.list : []; };

  function setCam(P) {
    cam.position.set(P.p[0], P.p[1], P.p[2]); cam.up.set(0, 1, 0); cam.lookAt(P.t[0], P.t[1], P.t[2]);
    cam.fov = P.fov || o.camera.fov; cam.aspect = o.camera.aspect || 1.6; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  }
  /** the screen box of a standing figure at (x, y, z), scale s: { in, cut, x0, x1, y0, y1, d } in NDC, or null behind the camera */
  function box(x, y, z, s) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9, inN = 0, outN = 0, n = 0;
    for (const dy of [0, H * s]) for (const dx of [-R, R]) for (const dz of [-R, R]) {
      v.set(x + dx * s, y + dy, z + dz * s).applyMatrix4(cam.matrixWorldInverse);
      if (v.z > -0.05) { outN++; continue; }
      v.applyMatrix4(cam.projectionMatrix); n++;
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      if (Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1) inN++; else outN++;
    }
    if (!n) return null;
    const ov = x1 >= -1 && x0 <= 1 && y1 >= -1 && y0 <= 1;   // (some of it on the screen)
    const d = Math.hypot(x - cam.position.x, y + H * s / 2 - cam.position.y, z - cam.position.z);
    return { on: ov, cut: ov && outN > 0, x0, x1, y0, y1, d };
  }
  function focusOf(f) {
    if (!f) return null;
    v.set(f.x, f.y, f.z).applyMatrix4(cam.matrixWorldInverse); if (v.z > -0.05) return null;
    v.applyMatrix4(cam.projectionMatrix);
    return { x: v.x, y: v.y, d: Math.hypot(f.x - cam.position.x, f.y - cam.position.y, f.z - cam.position.z), r: 0.12 };
  }
  const blocks = (b, F) => !!(b && F && b.d < F.d - 1 && b.x0 < F.x + F.r && b.x1 > F.x - F.r && b.y0 < F.y + F.r && b.y1 > F.y - F.r);

  function hide(a, on) {
    if (on) { if (!a.gateOff) { a.gateOff = true; G.off.add(a); } }
    else if (a.gateOff) { a.gateOff = false; G.off.delete(a); }
  }
  function run(focus) {
    const P0 = o.pose ? o.pose(0) : null, P1 = o.pose ? o.pose(U2) : null;
    const poses = [P0, P1].filter(Boolean); if (!poses.length) return;
    const rep = [], n = { hidden: 0, own: 0, ownCut: 0, ownBlock: 0 };
    const L = list();
    // (per pose: the boxes; a world figure is out for the act, an own one is reported)
    const res = new Map();
    for (const P of poses) {
      setCam(P); const F = focusOf(focus);
      for (const a of L) {
        if (!a || !a.alive) continue;
        const b = box(a.x, a.y, a.z, a.s / 1.1); const r = res.get(a) || { on: false, cut: false, blk: false };
        if (b) { r.on = r.on || b.on; r.cut = r.cut || b.cut; r.blk = r.blk || blocks(b, F); }
        res.set(a, r);
      }
      if (o.hero) {
        let h = null; try { h = o.hero.xyz(); } catch (e) { h = null; }
        if (h && Number.isFinite(h.x)) { const b = box(h.x, h.y || 0, h.z, 1); const r = res.get('hero') || { on: false, cut: false, blk: false }; if (b) { r.on = r.on || b.on; r.cut = r.cut || b.cut; r.blk = r.blk || blocks(b, F); } res.set('hero', r); }
      }
    }
    for (const [a, r] of res) {
      if (a === 'hero') {
        const off = r.cut || r.blk;
        if (off !== G.heroOff) { G.heroOff = off; try { o.hero.show(!off); } catch (e) { /* */ } }
        if (off) rep.push({ who: 'kohen', cut: r.cut, between: r.blk, hidden: true });
        continue;
      }
      const own = !G.pre.has(a) && !!a.gang;   // (the act's own: a gang's man put there since the act began)
      if (!own) { hide(a, true); if (r.on) n.hidden++; continue; }
      hide(a, false); n.own++;
      if (r.cut) n.ownCut++; if (r.blk) n.ownBlock++;
      if (r.cut || r.blk) rep.push({ who: a.variant + (a.item ? ':' + a.item : ''), at: [+a.x.toFixed(1), +a.z.toFixed(1)], cut: r.cut, between: r.blk });
    }
    G.rep = rep; G.n = n;
  }
  return {
    begin(focus) {
      this.end();
      G.on = true; G.pre = new Set(list()); G.t = 0; G.key = ''; G.heroOff = false; G.rep = [];   // (the first test when the act's camera has settled: step)
      void focus;
    },
    step(dt, focus, key) {
      if (!G.on) return;
      G.t -= dt; const k = String(key || '');
      if (G.t > 0 && k === G.key) return;
      G.t = EVERY; G.key = k; run(focus);
    },
    end() {
      for (const a of [...G.off]) hide(a, false);
      for (const a of list()) if (a && a.gateOff) a.gateOff = false;
      if (G.heroOff) { G.heroOff = false; try { o.hero.show(true); } catch (e) { /* */ } }
      G.on = false; G.pre = new Set();
    },
    report() { return G.rep.slice(); },
    stats() { return { on: G.on, ...G.n, report: G.rep.length }; },
  };
}
