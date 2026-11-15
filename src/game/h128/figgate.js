/* ── build 128 ── h128/figgate.js — the figures gate (the owner 15.11, again: "figures only when they are needed, otherwise out").
 * One rule for every act of every stage, run by the director while an act is on (after its camera settled, and whenever the look
 * changes): every figure of the world's figure layer (actors.js, the crews' and the acts' gangs) is tested against the act's camera at
 * u 0 and at u 0.3 (the play zone's lens, look.js), and
 *   (a) a figure the act did not put there (not a pack gang's man: the world's crews and life) is not drawn while
 *       the act is on, wherever it stands — it comes back when the act ends;
 *   (b) a figure of the act's own whose box crosses the frame's edge at either u, or (c) stands between the camera and the work's focus
 *       (in front of it and over it on the screen) is not drawn while it is so ("whole or absent, never cut", the owner 15.11) and is
 *       reported (__FIG.report()): where the man is needed for the work to read, the act's camera or his stand is what must change;
 *   every figure layer is tested (actors.js FIGS: the crews', the crowd's, the service's, a pack's own), and the stage's own site
 *   workers (stages.js) are out for the act (o.workers);
 *   the kohen (the hero) is the act's own when the act asks for him (X.kohen), and is hidden when he fails (b) or (c) — unless his
 *   hands do the act's work (act.kohenWorks): then he steps to the nearest place where he stands whole (fitHero).
 * No randomness, no timers of its own: the director calls step(dt) from its frame.
 *   createFigGate({ THREE, camera, scene, actors: () => actors.js API, workers(fn | null), hero: { xyz(), show(v), keep() }, pose: (u) => { p, t, fov } | null })
 *   → { begin(focus), step(dt, focus), end(), report(), stats() } */
import { FIGS } from '../../actors.js';
try { globalThis.__FIGS = FIGS; } catch (e) { /* (the probes' eyes) */ }

const H = 3.9, R = 0.55, U2 = 0.3, EVERY = 0.25;

export function createFigGate(o) {
  const T = o.THREE;
  const cam = new T.PerspectiveCamera(40, 1.6, 0.1, 5000);
  const v = new T.Vector3();
  const G = { on: false, pre: new Set(), off: new Set(), heroOff: false, t: 0, key: '', rep: [], n: { hidden: 0, own: 0, ownCut: 0, ownCutHidden: 0, ownBlock: 0, ownBlockHidden: 0 } };
  const A = () => { try { return o.actors ? o.actors() : null; } catch (e) { return null; } };
  // (every figure layer of the main scene: the crews' (o.actors) and whatever else drew figures — the crowd, the service, a pack's own —
  //  found in actors.js's registry FIGS; a layer on another scene or group (the ship's deck) is not the gate's)
  const layers = () => { const out = []; const a = A(); if (a) out.push(a); try { for (const L of FIGS) if (L !== a && (!o.scene || L.scene === o.scene)) out.push(L); } catch (e) { /* */ } return out; };
  const list = () => { const out = []; for (const L of layers()) if (Array.isArray(L.list)) for (const f of L.list) out.push(f); return out; };

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
  function fitHero(focus) {
    let h = null; try { h = o.hero.xyz(); } catch (e) { h = null; } if (!h || !Number.isFinite(h.x)) return null;
    for (let rr = 0.75; rr <= 4; rr += 0.5) for (let k = 0; k < 16; k++) {
      const an = k * Math.PI / 8, x = h.x + Math.cos(an) * rr, z = h.z + Math.sin(an) * rr;
      let y = h.y; try { if (o.ground) y = o.ground(x, z); } catch (e) { y = h.y; } if (!Number.isFinite(y) || Math.abs(y - (h.y || 0)) > 0.8) continue;
      const q = probe(x, y, z, focus); if (q.on && !q.cut && !q.between) return { x, z, dx: x - h.x, dz: z - h.z };
    }
    return null;
  }
  function probe(x, y, z, focus) {
    const r = { on: false, cut: false, between: false };
    for (const u of [0, U2]) { const P = o.pose ? o.pose(u) : null; if (!P) continue; setCam(P); const b = box(x, y, z, 1); if (b) { r.on = r.on || b.on; r.cut = r.cut || b.cut; r.between = r.between || blocks(b, focusOf(focus)); } }
    return r;
  }
  function run(focus) {
    const P0 = o.pose ? o.pose(0) : null, P1 = o.pose ? o.pose(U2) : null;
    const poses = [P0, P1].filter(Boolean); if (!poses.length) return;
    const rep = [], n = { hidden: 0, own: 0, ownCut: 0, ownCutHidden: 0, ownBlock: 0, ownBlockHidden: 0 };
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
        // (where his hands do the act's work (act.kohenWorks), the kohen is not taken out: he steps to the nearest place, within 4 amot
        //  on his own level, where he stands whole and out of the work's way at u 0 and u 0.3; only if there is none is he hidden)
        if ((r.cut || r.blk) && o.hero.works && o.hero.works() && o.hero.move) {
          const p = fitHero(focus); if (p) { try { o.hero.move(p.x, p.z); } catch (e) { /* */ } rep.push({ who: 'kohen', cut: r.cut, between: r.blk, moved: [+p.dx.toFixed(1), +p.dz.toFixed(1)] }); if (G.heroOff) { G.heroOff = false; try { o.hero.show(true); } catch (e) { /* */ } } continue; }
        }
        const off = r.cut || r.blk;
        if (off !== G.heroOff) { G.heroOff = off; try { o.hero.show(!off); } catch (e) { /* */ } }
        if (off) rep.push({ who: 'kohen', cut: r.cut, between: r.blk, hidden: true });
        continue;
      }
      const own = !!a.gang;   // (the packs' own men: a pack gang's — an act may set its men out before its first beat; the world's crews and life are not)
      if (!own) { hide(a, true); if (r.on) n.hidden++; continue; }
      // (the owner 15.11: "whole or absent, never cut" — an own man the frame cuts at u 0 or u 0.3 is not drawn while he is cut; the
      //  act's camera or his stand is fixed where he is needed for the work to read: the report names whom the gate took out)
      n.own++;
      if (r.cut || r.blk) { hide(a, true); if (r.cut) n.ownCutHidden++; else n.ownBlockHidden++; } else hide(a, false);
      if (r.cut || r.blk) rep.push({ who: a.variant + (a.item ? ':' + a.item : ''), at: [+a.x.toFixed(1), +a.z.toFixed(1)], cut: r.cut, between: r.blk, hidden: true });
    }
    G.rep = rep; G.n = n;
  }
  return {
    begin(focus) {
      this.end();
      try { if (o.workers) o.workers(() => true); } catch (e) { /* */ }   // (the stage's own site workers (stages.js) are the world's: out for the act)
      G.on = true; G.pre = new Set(list()); G.t = 0; G.key = ''; G.heroOff = false; G.rep = [];   // (the first test when the act's camera has settled: step)
      void focus;
    },
    step(dt, focus, key) {
      if (!G.on) return;
      // (a hidden kohen stays hidden: an act that sets him on his place (hero.setPos, place, a walk) shows him again — each frame the gate
      //  takes him out of the picture again, without stopping what he does)
      if (G.heroOff && o.hero && o.hero.keep) { try { o.hero.keep(); } catch (e) { /* */ } }
      G.t -= dt; const k = String(key || '');
      if (G.t > 0 && k === G.key) return;
      G.t = EVERY; G.key = k; run(focus);
    },
    end() {
      for (const a of [...G.off]) hide(a, false);
      for (const a of list()) if (a && a.gateOff) a.gateOff = false;
      if (G.heroOff) { G.heroOff = false; try { o.hero.show(true); } catch (e) { /* */ } }
      if (G.on) { try { if (o.workers) o.workers(null); } catch (e) { /* */ } }
      G.on = false; G.pre = new Set();
    },
    report() { return G.rep.slice(); },
    /** (the probes' tool) a standing figure at (x, y, z) against the act's camera at u 0 and u 0.3: { on, cut, between } */
    probe,
    stats() { return { on: G.on, ...G.n, report: G.rep.length }; },
  };
}

/** ── the same rule for a film (the owner 15.11, the stage's end: "a worker with a blue cap stands idle by the gate while the Levites
 *  sing"): while the film plays, every figure of the main scene's figure layers that is not the film's own (keep() → its gang men) is
 *  not drawn, nor the stage's site workers; a figure that comes into the world meanwhile is caught on the next look (every 0.3 s).
 *  filmFigs({ scene, keep: () => [gang men], workers(fn | null) }) → restore() */
export function filmFigs(o) {
  const off = new Set();
  const own = () => { const s = new Set(); try { for (const w of (o.keep ? o.keep() : []) || []) if (w && w.a) s.add(w.a); } catch (e) { /* */ } return s; };
  const look = () => {
    const mine = own();
    try { for (const L of FIGS) { if (o.scene && L.scene !== o.scene) continue; for (const a of L.list || []) { if (!a || !a.alive || mine.has(a)) continue; if (!a.gateOff) { a.gateOff = true; off.add(a); } } } } catch (e) { /* */ }
  };
  try { if (o.workers) o.workers(() => true); } catch (e) { /* */ }
  look(); const iv = setInterval(look, 300);
  return () => { clearInterval(iv); for (const a of off) a.gateOff = false; off.clear(); try { if (o.workers) o.workers(null); } catch (e) { /* */ } };
}
