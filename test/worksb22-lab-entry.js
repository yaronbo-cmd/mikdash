/* worksb22 lab — the life-lab scene (the finished inner Temple, plain colours) plus the four works of WORKSB22 on a DOM layer over the canvas.
 * window.__W: { W (the works), stock (a stub with take/add counters), emitted[], hero, layer, setHero(x,z), look(p,t) } */
import './life-lab-entry.js';
import { createWorksB22 } from '../src/avodah/works/indexb.js';
import { groundY } from '../src/avodah3d.js';

const L = window.__L, THREE = L.THREE;
const layer = document.createElement('div');
layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5';
document.body.appendChild(layer);
const stock = { n: { wood: 20, oil: 20, wine: 20, flour: 20, doves: 20 }, took: {}, take(k, n = 1) { const t = Math.min(this.n[k] || 0, n); this.n[k] = (this.n[k] || 0) - t; this.took[k] = (this.took[k] || 0) + t; return t; }, add(k, n = 1) { this.n[k] = (this.n[k] || 0) + n; } };
const emitted = [], sfx = [];
const hero = { x: -24, y: 16, z: 28, yaw: 0 };
const ctx = {
  THREE, scene: L.scene, camera: L.camera, layer, av: L.avodah, actors: L.actors, animals: L.animals, ground: groundY, hero, stock,
  emit: (t, d) => emitted.push([t, d]), sfx: (n) => sfx.push(n),
  free: () => true,
};
const W = createWorksB22(ctx);
L.updaters.push((dt) => W.update(dt));
window.__W = { W, stock, emitted, sfx, hero, layer, ctx,
  setHero(x, z, camOff = [9, 8, 12]) { hero.x = x; hero.z = z; hero.y = groundY(x, z); L.look([x + camOff[0], hero.y + camOff[1], z + camOff[2]], [x, hero.y + 1.2, z]); },
};
