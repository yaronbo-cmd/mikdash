// in-page drivers for works 1 and 2 (the act's update stepped at 1/60 s, synthetic thumbs)
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  const MODE = process.env.MODE || 'good';
  let s; for (let i = 0; i < 80; i++) { await unmodal(); s = await st(); if (s && s.phase === 'act' && s.act && ((s.act.e0 && Math.abs(s.act.e0[0] - s.act.e1[0]) > 20 && s.act.e0[1] > 0) || (s.act.sides && s.act.t > 1.5))) break; await wait(500); }
  log('begin', JSON.stringify(s.act).slice(0, 500)); await shot('begin');
  const r = await pg.evaluate(async (MODE) => {
    const H = window.__T.game.h109, A = H.act(), dt = 1 / 60, out = [], D = () => A.dbg();
    const run = (n) => { for (let i = 0; i < n; i++) A.update(dt); };
    let id = 90;
    if (D().e0) {
      // work 1
      for (let guard = 0; guard < 30; guard++) {
        let d = D(); if (d.finished || d.busy || d.i >= d.n) break; if (d.fly) { run(60); continue; }
        let hadBad = false;
        for (let e = 0; e < d.edges; e++) {
          d = D(); const E = d.edge; if (E.bad != null) hadBad = true;
          const P = (u) => ({ x: d.e0[0] + (d.e1[0] - d.e0[0]) * u, y: d.e0[1] + (d.e1[1] - d.e0[1]) * u });
          const L = Math.hypot(d.e1[0] - d.e0[0], d.e1[1] - d.e0[1]), step = 300 * dt * (innerHeight / 420) / L;
          for (const mo of E.moss) { id++; let p = P(mo.a + 0.02); A.down({ id, ...p }); for (let w = 0; w < 4; w++) { const [a, b] = w % 2 ? [mo.b - 0.02, mo.a + 0.02] : [mo.a + 0.02, mo.b - 0.02]; for (let u = a; (b > a ? u <= b : u >= b); u += (b > a ? step : -step)) { A.move({ id, ...P(u) }); run(1); } } A.up({ id, ...P(mo.a) }); run(2); }
          if (MODE === 'mud' && E.mud.length) { id++; const p = P(E.mud[0]); A.down({ id, ...p }); run(30); A.up({ id, ...p }); run(2); }
          d = D();
          if (!d.edge.ck) {
            id++; A.down({ id, ...P(0) }); run(1);
            for (let u = 0; u <= 1.001; u += step) { A.move({ id, ...P(u) }); run(1); if (E.bad != null && MODE !== 'miss' && u >= E.bad && u - step < E.bad) run(25); if (D().edge && D().edge.ck) break; }
            A.up({ id, ...P(1) }); run(2);
          }
          d = D(); out.push(`s${d.i}e${e}:${d.edge && d.edge.ck ? 'ck' : '-'}${d.edge && d.edge.marked != null ? 'M' : ''}`);
          if (e < d.edges - 1) run(80);
        }
        d = D(); const c = { x: d.stone[0], y: d.stone[1] }; const to = MODE === 'wrong' ? !hadBad : hadBad; id++; A.down({ id, ...c }); for (let k = 1; k <= 6; k++) { A.move({ id, x: c.x, y: c.y + (to ? 14 : -14) * k }); run(1); } A.up({ id, x: c.x, y: c.y + (to ? 84 : -84) }); run(70);
        d = D(); out.push(`sorted ${to ? 'pile' : 'basket'} pts ${d.pts} dmg ${d.dmg} wrong ${d.wrong}`);
      }
    } else {
      // work 2
      for (let r = 0; r < 5; r++) {
        let d = D(); if (Math.abs(d.dx) < 0.03 && Math.abs(d.dz) < 0.03 && Math.abs(d.a) < 0.1) break;
        for (const [v, plus, minus] of [[d.dx, 'E', 'W'], [d.dz, 'S', 'N']]) {
          if (Math.abs(v) < 0.03 || (d.lv < 2 && plus === 'S')) continue; d = D();
          const side = v > 0 ? minus : plus, p = d.sides[side], c = d.mid, ux = p[0] - c[0], uy = p[1] - c[1], L = Math.hypot(ux, uy), px = Math.abs(v) / (0.026 * 0.42) * (innerHeight / 420);
          id++; A.down({ id, x: p[0], y: p[1] }); run(2); A.up({ id, x: p[0] + (ux / L) * px, y: p[1] + (uy / L) * px }); out.push('pull ' + side + ' ' + Math.round(px));
        }
        if (d.lv >= 3 && Math.abs(d.a) > 0.1) { d = D(); const p = d.sides.E, c = d.mid, ux = p[0] - c[0], uy = p[1] - c[1], L = Math.hypot(ux, uy), px = Math.abs(d.a) / (0.036 * 0.42) * (innerHeight / 420); const sg = d.a > 0 ? 1 : -1; id++; A.down({ id, x: p[0], y: p[1] }); run(2); A.up({ id, x: p[0] - (uy / L) * px * sg, y: p[1] + (ux / L) * px * sg }); out.push('turn ' + sg); }
        run(60 * 3); d = D(); out.push(`dx ${d.dx} dz ${d.dz} a ${d.a} green ${JSON.stringify(d.green)}`);
      }
      const d = D(); id++; A.down({ id, x: d.mid[0], y: d.mid[1] }); run(40); A.up({ id, x: d.mid[0], y: d.mid[1] }); run(60);
      out.push('landed ' + JSON.stringify(D().landed));
    }
    return { out: out.slice(-24), d: (() => { const d = D(); return { pts: d.pts, dmg: d.dmg, wrong: d.wrong, missed: d.missed, exact: d.exact, landed: d.landed, finished: d.finished, busy: d.busy }; })(), flaws: H.M.st.flaws };
  }, MODE);
  log('drive', JSON.stringify(r).slice(0, 2500));
  await shot('driven');
  for (let i = 0; i < 80; i++) { s = await st(); if (s.phase !== 'act') break; if (i === 3) await shot('ending'); await wait(1500); }
  log('after', s.phase);
  const W = await pg.evaluate(() => { const H = window.__T.game.h109; return { done: H.M.st.done, flaws: H.M.st.flaws, res: H.M.st.res, rejects: H.M.st.rejects, basket: H.M.st.basket }; });
  log('world', JSON.stringify(W).slice(0, 1200)); await shot('world');
};
