/* ── fable32 (build 19) ── ── recovered (build 19) ── ramp19.js — the ramp run (ריצת הכבש; docs/specs/rizat-hakevesh-he.md, the spec
 * of 19.10): the kohen runs the logs up the ramp and salts it as he goes (the ramp's salt, so the feet do not slip — the bag on his hip,
 * the grains flying to the stone). Drawn here, played by day33.js (E.st33.r19, its events through E.on17, the best run E.gh19()):
 *   the salt on the ramp — a canvas of 8 × 32 cells over its stone (salted: pale, bare: dark), painted as the engine salts them;
 *   the grains in flight, the logs that fell (a gold ring to pick them up), the bag and its share salted ("🧂 N%");
 *   the wind of a fast run with logs; the wave of light up the ramp when it is all salted ("הכבש מומלח!");
 *   the ghost of the best run (a pale figure along its path) and the best time at the ramp's foot;
 *   the words over him (a slip "!", the lane — "עולים בימין" / "יורדים בשמאל", the sway, a new best).
 *   createRamp19({ E, sfx }) → destroy()      (focus17.js makes it when E.b19)
 * The bundle kept no comment and no local name: the names are the recovery's (createRamp19 and its arguments: focus17.js's lines in
 * the session transcript). Never a Divine Name. */
import * as THREE from 'three';
import { addDrawer, L, onTick } from './draw.js';
import { R19, rampY19, onRamp19 } from './day33.js';
export function createRamp19(o) {
  const E = o.E,
    scene = globalThis.__T && globalThis.__T.scene,
    snd = (n) => {
      try {
        o.sfx.play(n);
      } catch (e) {}
    },
    buzz = (p) => {
      try {
        navigator.vibrate(p);
      } catch (e) {}
    },
    cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 128;
  const g2 = cv.getContext('2d'),
    rough = new THREE.CanvasTexture(cv),
    tex = rough.clone();
  tex.colorSpace = THREE.SRGBColorSpace;
  const layer = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 33.24),
    new THREE.MeshStandardMaterial({ map: tex, roughnessMap: rough, polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  layer.rotation.x = 0.2726 - Math.PI / 2;
  layer.position.set(-38, 20.58, 26.5);
  const ghostMat = new THREE.MeshBasicMaterial({ color: '#CFE8FF', transparent: true, opacity: 0.38, depthWrite: false }),
    ghost = new THREE.Group();
  for (const [geo, y, z] of [
    [new THREE.CylinderGeometry(0.45, 0.8, 2.2, 10), 1.1, 0],
    [new THREE.SphereGeometry(0.62, 12, 8), 2.8, 0],
    [new THREE.CylinderGeometry(0.42, 0.36, 0.9, 10), 1.9, -0.6],
  ]) {
    const part = new THREE.Mesh(geo, ghostMat);
    part.position.set(0, y, z);
    ghost.add(part);
  }
  if (scene) scene.add(layer, ghost);
  let paint = (i, salted) => {
      const x = (i & 7) * 8,
        y = (i >> 3) * 4,
        j = ((i * 37) % 11) / 11;
      g2.fillStyle = salted ? '#A39E94' : '#14100C';
      g2.fillRect(x, y, 8, 4);
      g2.fillStyle = `hsl(${salted ? 40 : 24},${salted ? 8 : 18}%,${salted ? 80 + 10 * j : 17 + 8 * j}%)`;
      g2.fillRect(x + 1, y + 1, 7, 3);
      g2.fillStyle = salted ? '#FFF' : '#4C5866';
      g2.fillRect(x + 1 + ((j * 4) | 0), y + 1 + (i & 1), salted ? 1 : 3, 1);
    },
    shown = [],
    words = [],
    hp = { x: 0, y: 16, z: 0, yaw: 0 },
    clock = () => E.st33.t,
    TAG = { bg: 'rgba(28,20,10,.85)', fg: '#FFE6A0' },
    saltT = 0,
    slipA = 0,
    saltedAt = -9,
    offTick = onTick((tt, dt) => {
      const st = E.st33,
        r19 = st && st.r19;
      if (!r19) return;
      let changed = 0;
      if (r19.g.length)
        for (let i = 0; i < 256; i++)
          if (shown[i] !== r19.g[i]) {
            shown[i] = r19.g[i];
            paint(i, r19.g[i]);
            changed++;
          }
      if (changed) rough.needsUpdate = tex.needsUpdate = true;
      if (r19.sc && (saltT -= dt) <= 0) {
        saltT = 0.09;
        snd('salt19');
        buzz(8);
      }
      if (st.logs > 0 && r19.sp > R19.slipV && (slipA += r19.sp * dt) > 1.7) {
        slipA = 0;
        buzz(12);
      }
    }),
    offEv = E.on17((ev) => {
      const type = ev.type,
        now = clock();
      if (type === 'slip') {
        words.push(['!', now + 1.2]);
        snd('thud');
        buzz(40);
        try {
          globalThis.__HERO35.play('Hit_A', { once: true, speed: 1.5, restart: true });
        } catch (e) {}
      } else if (type === 'salted') {
        saltedAt = now;
        words.push(['הכבש מומלח!', now + 3]);
        snd('bell');
        buzz([20, 40, 20]);
      } else if (type === 'rec') {
        words.push(['שיא חדש!', now + 2.2]);
        snd('chord17');
      } else if (type === 'lane') {
        words.push([ev.up ? 'עולים בימין' : 'יורדים בשמאל', now + 1.8]);
        snd('ui');
      } else if (type === 'sway') words.push(['החזיקו — הסל מתייצב', now + 3.5]);
      else if (type === 'pick') snd('pop');
    }),
    offDraw = addDrawer(
      null,
      (k, tt) => {
        const st = E.st33,
          r19 = st && st.r19,
          now = clock();
        ghost.visible = false;
        if (!r19 || st.phase !== 'run' || st.summary) return;
        try {
          globalThis.__T.stages.heroXYZ(hp);
        } catch (e) {}
        for (const gr of r19.gr) {
          const u = gr[2] / R19.fly;
          k.ws(
            gr[3] + (gr[0] - gr[3]) * u,
            gr[5] + ((onRamp19(gr[0], gr[1]) ? rampY19(gr[1]) : 16) - gr[5]) * u + Math.sin(u * Math.PI) * 0.7,
            gr[4] + (gr[1] - gr[4]) * u,
            0.13,
            0.13,
            0.13,
            '!#FFFFFF',
          );
        }
        for (const fl of r19.fl) {
          const y = rampY19(fl.z);
          k.wc(fl.x, y + 0.25, fl.z, 0.25, 2.2, '#9A7448', { roll: Math.PI / 2, yaw: -Math.PI / 2 });
          k.ring(L(fl.x), L(fl.z), L(y + 0.15), L(1.1), '!#FFD24A', 12);
        }
        const H = globalThis.__HERO35,
          hips = (H && H.loaded && H.at('hips')) || { x: hp.x, y: hp.y + 1.3, z: hp.z },
          bx = -Math.cos(hp.yaw),
          bz = Math.sin(hp.yaw);
        if (r19.bag > 0) {
          const fill = r19.bag / r19.bm;
          k.ws(hips.x + bx * 0.5, hips.y - 0.15, hips.z + bz * 0.5, 0.22, 0.12 + 0.2 * fill, 0.22, '#EFE8D8');
          k.wb(hips.x + bx * 0.85, hips.y + 0.3, hips.z + bz * 0.85, 0.1, 0.1, 0.9, '#3A2A18');
          k.wb(hips.x + bx * 0.87, hips.y - 0.15 + 0.45 * fill, hips.z + bz * 0.87, 0.12, 0.12, 0.9 * fill, '!#FFFFFF');
          k.label(`🧂 ${Math.round(r19.cov * 100)}%`, L(hips.x + bx), L(hips.z + bz), L(hips.y + 1), 0.3, TAG);
        }
        if (st.logs > 0 && r19.sp > 6.6) {
          const sn = Math.sin(hp.yaw),
            cs = Math.cos(hp.yaw);
          for (let i = 0; i < 6; i++) {
            const a = ((tt * 2.2 + i / 6) % 1) * 4 - 1.5,
              s = (i % 2 ? 1 : -1) * (0.9 + (i % 3) * 0.35);
            k.wb(hp.x - cs * s - sn * a, hp.y + 0.8 + (i % 3) * 0.9, hp.z + sn * s - cs * a, 0.04, 1.3, 0.04, '!#F6FAFF', {
              yaw: hp.yaw - Math.PI / 2,
            });
          }
        }
        if (now - saltedAt < 2)
          for (let i = 0; i < 18; i++) {
            const zz = 11 + Math.min(1, (now - saltedAt) / 1.6) * 31 - i * 0.7;
            k.ws(-34 + Math.sin(i * 2.3 + tt * 3) * 3.4, rampY19(zz) + 0.3 + (i % 3) * 0.4, zz, 0.13, 0.13, 0.13, '!#FFF3C0');
          }
        const gp = r19.gp,
          gt = r19.gt >= 0 ? (st.t - r19.gt) * 10 : -1,
          n = gp ? gp.length / 2 - 1 : 0;
        if (gt >= 0 && n > 1 && gt < n + 6) {
          const i = Math.min(n - 1, gt | 0),
            f = Math.min(1, gt - i),
            j = 2 * i,
            gx = gp[j] + (gp[j + 2] - gp[j]) * f,
            gz = gp[j + 1] + (gp[j + 3] - gp[j + 1]) * f;
          ghost.visible = true;
          ghost.position.set(gx, rampY19(gz) + Math.abs(Math.sin(gt * 1.3)) * 0.15, gz);
          ghost.rotation.y = Math.atan2(gp[j + 2] - gp[j], gp[j + 3] - gp[j + 1] || -0.001);
        }
        const myBest = E.gh19();
        if (myBest && Math.hypot(hp.x + 34, hp.z - 44) < 30) k.label(`שיא: ${myBest.t} ש׳`, L(-34), L(45.5), L(18.6), 0.36, TAG);
        for (let i = words.length - 1; i >= 0; i--) {
          const w = words[i];
          if (now > w[1]) {
            words.splice(i, 1);
            continue;
          }
          k.label(w[0], L(hp.x), L(hp.z), L(hp.y + 5.2), w[0] === '!' ? 0.8 : 0.42, TAG);
        }
      },
      3,
    );
  return () => {
    offDraw();
    offTick();
    offEv();
    if (scene) scene.remove(layer, ghost);
    globalThis.__ARM19 = 0;
  };
}
