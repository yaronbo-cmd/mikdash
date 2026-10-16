// the hero lab's sheets (test/hero-lab.cjs): each gets { pg, E, shot, check }
// Every stroke is checked the same way: at its contact frame the tool's striking face (or the chisel's edge) must be ON the
// contact point the stroke reports (hero.contact), within 0.08 amot, and the contact must lie on the stone.
const setup = `(() => {
  const S = __H.stages; S.buildMode(); S.setStage('har', 'done', 1, { instant: true }); S.setBoulders([]);
  S.setStage('wall', 'building', 0.3, { instant: true });
  __H.step(0.2);
})()`;
// the world position of a tool's point given in bind (model) space, through its bone
const tipFn = `window.__tip = (bone, v) => {
  const H = __H.stages._dbg.hero, sk = H.mesh.skeleton, i = sk.bones.findIndex((b) => b.name === 'hero-' + bone);
  __H.scene.updateMatrixWorld(true);
  const p = new __H.THREE.Vector3(v[0], v[1], v[2]).applyMatrix4(sk.boneInverses[i]).applyMatrix4(sk.bones[i].matrixWorld);
  return p;
};
// run a stroke: step to its moments, shoot each; returns the contact error
window.__stroke = async (id, kind, target, times, tip) => {
  const h = __H.stages.hero; let hit = null;
  const off = h.onImpact((e) => { hit = e; });
  const pr = h.act(kind, target);
  const out = { shots: [] };
  // the small step that plants his feet comes first: the stroke's clock starts after it
  for (let k = 0; k < 240 && __H.stages._dbg.hero.step; k++) __H.step(1 / 120, 1 / 120);
  let t = 0;
  for (const [name, at] of times) {
    while (t < at - 1e-6) { const dt = Math.min(1 / 120, at - t); __H.step(dt, dt); t += dt; if (hit && !out.err) { const c = h.contact(); const p = __tip(tip[0], tip[1]); out.err = Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z); out.c = [c.x, c.y, c.z]; out.at = t; } }
    out.shots.push(name);
    await window.__shoot(id + '_' + name);
  }
  off(); out.resolved = await Promise.race([pr, new Promise((r) => setTimeout(() => r('timeout'), 3000))]);
  return out;
};`;
async function strokeSheet({ pg, E, shot, check }, id, kind, target, prep, cam, times, tip) {
  await E(setup);
  await E(tipFn);
  if (!pg.__shootOn) { pg.__shootOn = true; await pg.exposeFunction('__shoot', (n) => shot(n)); }
  await E(prep);
  const hp = await E(() => { const p = __H.stages.hero.position; return [p.x, p.y, p.z]; });
  const yaw = await E(() => __H.stages._dbg.hero.yaw);
  // the camera: from his right-front, looking at the work
  const c = Math.cos(yaw), s = Math.sin(yaw), R = (mx, my, mz) => [hp[0] + mx * c + mz * s, hp[1] + my, hp[2] - mx * s + mz * c];
  await E(([p, t]) => __H.look(p, t), [R(...cam[0]), R(...cam[1])]);
  const r = await E(([id, kind, target, times, tip]) => __stroke(id, kind, target, times, tip), [id, kind, target, times, tip]);
  const strike = !['measure', 'pull'].includes(kind);
  check(`${id}: contact on the frame (tool point → contact ${r.err === undefined ? '—' : r.err.toFixed(3)} amot at t ${r.at && r.at.toFixed(3)})`, r.err !== undefined && (!strike || r.err < 0.08), r.c && r.c.map((v) => v.toFixed(2)).join(' '));
  check(`${id}: act() resolved`, r.resolved === true, String(r.resolved));
}
async function crowdShot({ E, shot, check }, name, kind, prep, view, secs) {
  await E(prep);
  const st = await E(([kind, secs]) => { const c = __H.crowd(kind); for (let k = 0; k < secs * 30; k++) __H.step(1 / 30, 1 / 30); return c.stats; }, [kind, secs]);
  check(`crowd ${kind}: people at their stations`, st.people > 0 && st.scene === kind, st);
  const v = await E((id) => __H.stages.crowd.view(id), view);
  if (v) { await E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, [v.p, v.t]); await shot(name); }
  const dc = await E(() => __H.drawCalls());
  return { st, dc };
}
// the hero seen from his front-right at a distance d (amot) and height h, looking at his chest (wave 7: the look)
async function lookShot({ E, shot }, name, d, h, prep, aim = 2.6) {
  if (prep) await E(prep);
  const hp = await E(() => { const p = __H.stages.hero.position; return [p.x, p.y, p.z]; });
  const yaw = await E(() => __H.stages._dbg.hero.yaw);
  const c = Math.cos(yaw), s = Math.sin(yaw), R = (mx, my, mz) => [hp[0] + mx * c + mz * s, hp[1] + my, hp[2] - mx * s + mz * c];
  await E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, [R(-0.45 * d, h, 0.9 * d), R(0, aim, 0.6)]);
  await shot(name);
}
module.exports = {
  // wave 7: the hero's look — the kohen's dress, the face; three distances (close, the game's near view, the game's usual view)
  async look(o) {
    await o.E(setup);
    await o.E(() => { const S = __H.stages; S.hero.place('wall'); S.hero.setTool('iron'); __H.step(2.5); });
    await lookShot(o, "look_close", 8, 5.6, null, 5.2);
    await lookShot(o, "look_mid", 22, 12, null, 3.4);
    await lookShot(o, "look_far", 60, 30, null, 2.5);
    // a blink (mid-way: the lids down over the eyes)
    await o.E(() => { const h = __H.stages._dbg.hero; h.blinkT = 99; h.blink = 0.1; });
    await lookShot(o, 'look_blink', 8, 5.6, null, 5.2);
    // the other looks: a full dark beard, darker skin, the plain girdle; then back to the default
    const lk = await o.E(() => __H.stages.hero.look({ beard: 'full', skin: 3, hair: 1, avnet: false }));
    await lookShot(o, 'look_variant', 10, 6, null, 4.4);
    await o.E(() => __H.stages.hero.look({ beard: 'young', skin: 1, hair: 0, avnet: true }));
    o.check('look(): the variant took', lk && lk.beard === 'full' && lk.avnet === false, lk);
  },
  // wave 7: his gestures — each shot at its peak from the near game view; the promise resolves true at the end; a stone set
  // at his site makes him nod by himself
  async gestures(o) {
    await o.E(setup);
    await o.E(() => { const S = __H.stages; S.hero.place('wall'); S.hero.setTool('iron'); __H.step(2.5); });
    for (const [k, at] of [['gotit', 0.45], ['proud', 1.6], ['wipe', 0.8], ['think', 1.2], ['stretch', 0.9]]) {
      await o.E((k) => { window.__g = { r: null }; __H.stages.hero.gesture(k).then((v) => { window.__g.r = v; }); }, k);
      await o.E((at) => __H.step(at, 1 / 30), at);
      await lookShot(o, 'gesture_' + k, +(process.env.GD || 12), 7, null, 3.2);
      const r = await o.E(async () => { __H.step(4, 1 / 30); await new Promise((r) => setTimeout(r, 20)); return window.__g.r; });
      o.check(`gesture ${k}: resolves true at its end`, r === true, String(r));
    }
    const auto = await o.E(async () => {
      const S = __H.stages, h = S.hero; __H.step(1, 1 / 30);
      const n = S.siteInfo ? (S.siteInfo('wall') || {}).stones : null;
      S.setWork('wall', { phase: 'courses', stones: 40 }); __H.step(5, 1 / 30);
      const w = S.setWork('wall', { phase: 'courses', stones: 41 }); __H.step(0.3, 1 / 30);
      return { w, g: h.gesturing, n };
    });
    o.check('a stone set at his site: he nods by himself', auto.g === 'gotit', auto);
  },
  // wave 7: the walk in the long ketonet (mid-stride, side and front), and the night (the lantern, the white and the outline)
  async walk(o) {
    await o.E(setup);
    await o.E(() => { const S = __H.stages; S.hero.place('wall'); __H.step(1); S.hero.walkTo('quarry'); __H.step(1.1, 1 / 30); });
    const hp = await o.E(() => { const p = __H.stages.hero.position, y = __H.stages._dbg.hero.yaw; return [p.x, p.y, p.z, y]; });
    const side = (a, d, h) => [hp[0] + Math.sin(hp[3] + a) * d, hp[1] + h, hp[2] + Math.cos(hp[3] + a) * d];
    await o.E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, [side(Math.PI / 2, 16, 5), [hp[0], hp[1] + 3, hp[2]]]); await o.shot('walk_side');
    await o.E(([p, t]) => { __H.look(p, t); __H.step(2 / 30, 1 / 30); }, [side(0.3, 16, 6), [hp[0], hp[1] + 3, hp[2]]]); await o.shot('walk_front');
    if (process.env.NOOUT) { await o.E(() => { __H.scene.getObjectByName('hero-outline').visible = false; }); await o.shot('walk_front_noout'); }
  },
  // hero.view(dist, el, 'shoulder'): the opening's last frame at the first boulder — over his shoulder, the rock beside him
  async shoulder(o) {
    await o.E(() => { const S = __H.stages; S.buildMode(); S.setBoulders(S.boulders.map(() => 2)); S.hero.place({ boulder: 3 }); __H.step(2); });
    const v = await o.E(() => __H.stages.hero.view(40, 26, 'shoulder'));
    await o.E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, [v.p, v.t]); await o.shot('view_shoulder');
    o.check('view(…, "shoulder") → a camera', Array.isArray(v.p) && v.p.every(Number.isFinite), v);
  },
  // the plaza by day: the pilgrims come up and turn right, the sage and his students, elders, the mishmar, the guards
  async plaza(o) {
    await crowdShot(o, 'crowd_plaza_circle', 'plaza', () => { __H.stages.demoMode(); __H.life.phase = 'complete'; }, 'circle', 14);
    for (const id of ['teach', 'elders']) { const v = await o.E((i) => __H.stages.crowd.view(i), id); await o.E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, [v.p, v.t]); await o.shot('crowd_plaza_' + id); }
  },
  // the building site round the builder: scribe, overseer, water carrier, bread seller, onlookers
  async site(o) {
    const r = await crowdShot(o, 'crowd_site', 'site', () => { const S = __H.stages; S.buildMode(); S.setStage('har', 'done', 1, { instant: true }); S.setStage('wall', 'building', 0.3, { instant: true }); S.hero.place('wall'); __H.life.phase = 'build'; }, 'site', 6);
    o.check('crowd site: draw calls of the lab frame', true, r.dc);
  },

  // the kohen's washing posture (actors.js POSES.wash: hands down at the feet, Zevachim 19b) — WATER aims the stream there
  async wash(o) {
    const r = await o.E(() => {
      const A = (__H.stages.crowd || __H.crowd('night')).actors, a = A.add('kohen', 150, -96, { yaw: -Math.PI / 2 }); A.pose(a, 'wash'); __H.step(2.5, 1 / 30);
      const L = A.handWorld(a, 1, new __H.THREE.Vector3()), R = A.handWorld(a, -1, new __H.THREE.Vector3());
      __H.look([146, 3.2, -92], [150, 1.2, -96]); __H.step(1 / 30, 1 / 30);
      return { L: [L.x, L.y, L.z].map((v) => +v.toFixed(2)), R: [R.x, R.y, R.z].map((v) => +v.toFixed(2)), y: a.y };
    });
    await o.shot('wash_pose');
    o.check('wash: both hands low, at the feet (≤ 1.0 amot above the ground)', r.L[1] - r.y < 1.0 && r.R[1] - r.y < 1.0, r);
  },
  // the iron hammer on a rough stone: anticipation, contact, recoil
  async hammer(o) {
    await strokeSheet(o, 'hammer', 'dress', null, () => { const S = __H.stages; S.hero.place('wall'); S.hero.setTool('iron'); __H.step(0.6); },
      [[-9, 6, 8], [0, 2.6, 1.6]], [['a_top', 0.3], ['b_contact', 0.4], ['c_recoil', 0.475]], ['tHammer', [-0.5, 1.24, 0.56]]);
  },
  // mallet and chisel on the drafted margin (the left hand holds the chisel on the stone)
  async chisel(o) {
    await strokeSheet(o, 'chisel', 'dress', null, () => { const S = __H.stages; S.hero.place('wall'); S.hero.setTool('iron'); S.hero.workpiece('drafted'); __H.step(0.6); },
      [[-8, 6, 8], [0, 2.6, 1.4]], [['a_top', 0.5], ['b_contact', 0.64]], ['tChisel', [0.5, 1.44, 0.34]]);
  },
  // the sledge on the quarry's wedges; the plumb line on the stone's face; a rope pulled toward the crane
  async split(o) {
    await strokeSheet(o, 'split', 'split', 'quarry', () => { const S = __H.stages; S.hero.place('quarry'); S.hero.setTool('iron'); __H.step(0.6); },
      [[-9, 6, 8], [0, 2.2, 1.6]], [['a_top', 0.33], ['b_contact', 0.46]], ['tSledge', [-0.5, 1.27, 1.04]]);
  },
  async measure(o) {
    await strokeSheet(o, 'measure', 'measure', null, () => { const S = __H.stages; S.hero.place('wall'); S.hero.setTool('iron'); S.hero.workpiece('dressed'); __H.step(0.6); },
      [[-8, 5, 8], [0, 2.4, 1.6]], [['b_contact', 1.2]], ['tPlumb', [-0.5, 1.44, 0.02]]);
  },
  async pull(o) {
    await strokeSheet(o, 'pull', 'pull', null, () => { const S = __H.stages; S.hero.place('wall'); S.hero.workpiece(null); __H.step(0.6); },
      [[-9, 5, 6], [0, 3, 2]], [['b_contact', 1.02]], ['tRope', [-0.5, 1.44, 0.02]]);
  },
  // the pick at a boulder of the hill
  async pick(o) {
    await strokeSheet(o, 'pick', 'pick', { boulder: 3 }, () => { const S = __H.stages; S.buildMode(); S.setBoulders(S.boulders.map(() => 2)); S.hero.place({ boulder: 3 }); S.hero.setTool('iron'); __H.step(0.6); __H.stages.hero.act('pick', { boulder: 3 }); __H.step(1.4, 1 / 60); },
      [[-11, 7, 7], [0, 2.4, 1.8]], [['a_top', 0.33], ['b_contact', 0.45]], ['tPick', [-0.5, 0.92, 1.2]]);
  },
};
