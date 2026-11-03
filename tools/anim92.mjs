import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { meshopt, dedup, prune } from '@gltf-transform/functions';
import fs from 'fs';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [src, dst, step] = process.argv.slice(2);
const doc = await io.read(src);
const R = doc.getRoot();
let nq = 0;
for (const a of R.listAnimations()) for (const c of a.listChannels()) {
  const s = c.getSampler(); if (c.getTargetPath() !== 'rotation') continue;
  const o = s.getOutput(); const f = o.getArray(); if (!(f instanceof Float32Array)) continue;
  const q = new Int16Array(f.length); for (let i = 0; i < f.length; i++) q[i] = Math.round(Math.max(-1, Math.min(1, f[i])) * 32767);
  o.setArray(q).setNormalized(true); nq++;
}
for (const n of R.listNodes()) { const r = (v) => v.map((x) => Math.round(x * 1e5) / 1e5); n.setTranslation(r(n.getTranslation())); n.setRotation(r(n.getRotation())); n.setScale(r(n.getScale())); }
await doc.transform(dedup(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(dst, doc);
console.log('quantized', nq, fs.statSync(src).size, '->', fs.statSync(dst).size);
