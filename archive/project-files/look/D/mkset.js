// the round-D shot set (node mkset.js → set/*.json); run with shots.sh OUTDIR PAGE scenario...
const fs = require('fs'), path = require('path');
const S = __dirname, D = path.join(S, 'set');
fs.mkdirSync(D, { recursive: true });
const H = path.join(S, 'helpers.js');
const open = (k, extra = '') => [{ init: `window.__H109_ONLY='${k}';${extra}` },
  { until: "(()=>{const s=__T.game.h109&&__T.game.h109.state();return s&&s.act&&s.act.t>2})()", max: 240000 },
  { script: H }, { wait: 500 }];
// a camera at a target on the ground (y: amot above the ground there)
const G = (x, z, y = 0) => `[${x},__GY(${x},${z})+${y},${z}]`;
const P = (p) => [{ eval: `__T.workLight.force(${p})` }, { wait: 1200 }];
// far-field stats: every mesh outside the Mount's works, by name or material: instances, triangles per draw
const FAR = `(()=>{const o={};__T.scene.traverse((m)=>{if(!m.isMesh||!m.visible)return;const g=m.geometry;const t=(g.index?g.index.count:g.attributes.position.count)/3;const n=m.isInstancedMesh?m.count:1;const k=m.name||(m.material&&m.material.name)||(m.isInstancedMesh?'inst-'+(g.type||'')+'-'+(m.material.color?m.material.color.getHexString():''):'');if(!/city|inst|terrain|^$/.test(k))return;const q=o[k]||(o[k]={draws:0,tris:0});q.draws++;q.tris+=t*n;});return o})()`;
const sets = {
  world: [{ init: 'window.__NO_OPENING=true;' },
    { until: "(()=>{try{return __T.game.h109.state().started}catch(e){return false}})()", max: 400000 },
    { script: H }, { wait: 3000 },
    ...P(0.5),
    { pshot: 'hero-play' },
    { cam: '[[750,380,850],[0,-20,0]]', name: 'zoomout' },
    { measure: 'zoomout-p05' },
    { log: FAR },
    { cam: '[[0,45,300],[700,70,-200]]', name: 'olivet' },
    { cam: '[[-750,220,100],[-380,-20,0]]', name: 'city' },
    { cam: '[[0,160,900],[0,-20,200]]', name: 'south' },
    { cam: '[[272,__GY(272,40)+3.5,40],[650,-25,30]]', name: 'kidron-edge' },
    { cam: '__CAM([-975,51,1098],-0.55,0.02,80)', name: 'wall-tower' },
    { cam: '[[1100,230,0],[-2000,-60,0]]', name: 'edge-west' },
    { cam: '[[0,260,0],[0,-60,-3000]]', name: 'edge-north' },
    { cam: '__CAM([-1265,78,272],1.25,0.42,300)', name: 'palace' },
    { cam: `__CAM(${G(-640, 250, 4)},1.0,0.55,60)`, name: 'houses-close' },
    { cam: `__CAM(${G(700, -300, 3)},-1.57,0.38,40)`, name: 'grove' },
    { cam: `[${G(-311, 905, 6)},${G(-318, 780, 3)}]`, name: 'street' },
    ...P(0), { cam: '[[750,380,850],[0,-20,0]]', name: 'zoomout-p0' },
    ...P(1), { cam: '[[750,380,850],[0,-20,0]]', name: 'zoomout-p1' },
  ],
  rope: [...open('rope'), { pshot: 'rope-play' }, { eval: '__T.game.h109.overview(true)' }, { wait: 5000 }, { pshot: 'game-overview' }],
};
sets.quick = [...sets.world.slice(0, 6), ...sets.world.filter((x) => x.name && /^(zoomout|olivet|city|south|kidron-edge|wall-tower|grove|houses-close)$/.test(x.name))];
// the frame-time pools: three measures of five renders each, two seconds apart
const M3 = (n) => [{ measure: n }, { wait: 2000 }, { measure: n }, { wait: 2000 }, { measure: n }];
sets.mworld = [sets.world[0], sets.world[1], { script: H }, { wait: 3000 }, ...M3('world-open')];
for (const k of ['course', 'pave', 'read']) sets['m' + k] = [...open(k), ...M3(k + '-open')];
for (const [k, v] of Object.entries(sets)) fs.writeFileSync(path.join(D, k + '.json'), JSON.stringify(v, null, 1));
console.log(Object.keys(sets).join(' '));
