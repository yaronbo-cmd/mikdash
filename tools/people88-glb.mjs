// ── build 88 ── tools/people88-glb.mjs — the people of the world from Quaternius's CC0 "Universal Base Characters" (Superhero_Male body,
// a realistic adult build on the Universal rig) and the "Universal Animation Library" (UAL1: walk, formal walk, push, kneel and fix, pick up,
// interact, talk, sit …), CC0 1.0 (quaternius.com; mirrored at github.com/Dallolz/moorfall-assets@1e83864). Credited in docs/PEOPLE88.md.
//   node tools/people88-glb.mjs <Superhero_Male.glb> <UAL1.glb> [outDir=assets]   (needs @gltf-transform/{core,extensions,functions}, meshoptimizer,
//   and python3 with Pillow for the texture downscale)
// → assets/man88.glb (the body, its textures 512 px JPEG/PNG, quantized + meshopt) · assets/anim88.glb (only the clips the game plays, no mesh)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize, meshopt, weld, simplify } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [BODY, UAL, OUTDIR = 'assets'] = process.argv.slice(2);
const KEEP = new Set(['Idle_Loop', 'Walk_Loop', 'Walk_Formal_Loop', 'Jog_Fwd_Loop', 'Push_Loop', 'Fixing_Kneeling', 'PickUp_Table', 'Interact', 'Idle_Talking_Loop', 'Sitting_Idle_Loop', 'Crouch_Idle_Loop', 'Sword_Attack', 'Spell_Simple_Enter']);
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const tmp = mkdtempSync(join(tmpdir(), 'p88-'));
const shrink = (buf, name, px, jpg) => {
  const a = join(tmp, name + '.png'), b = join(tmp, name + (jpg ? '.jpg' : '.out.png')); writeFileSync(a, buf);
  execFileSync('python3', ['-I', '-c', `import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]);im=im.resize((${px},${px}),Image.LANCZOS)\nif sys.argv[3]=='1':\n  im.convert('RGB').save(sys.argv[2],quality=86)\nelse:\n  im.save(sys.argv[2],optimize=True)`, a, b, jpg ? '1' : '0']);
  return readFileSync(b);
};
{ // the body
  const doc = await io.read(BODY), root = doc.getRoot();
  for (const t of root.listTextures()) { const n = t.getName() || 'tex', hair = /Hair/i.test(n), eye = /Eye/i.test(n); const jpg = !hair; t.setImage(shrink(t.getImage(), n, hair || eye ? 128 : 512, jpg)).setMimeType(jpg ? 'image/jpeg' : 'image/png'); }
  // (half the triangles: at the camera's distance the body reads the same, and the page stays under its cap)
  await MeshoptSimplifier.ready;
  await doc.transform(dedup(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.002 }), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const glb = await io.writeBinary(doc); writeFileSync(join(OUTDIR, 'man88.glb'), glb); console.log('man88', Math.round(glb.byteLength / 1024), 'KiB');
}
{ // the clips
  const doc = await io.read(UAL), root = doc.getRoot();
  let kept = 0; for (const a of root.listAnimations()) { if (KEEP.has(a.getName())) kept++; else a.dispose(); }
  for (const n of root.listNodes()) { const m = n.getMesh(); if (m) { n.setMesh(null); m.dispose(); } if (n.getSkin()) n.setSkin(null); }
  for (const s of root.listSkins()) s.dispose();
  // (a channel whose keyframes never change says nothing the node's own transform does not: dropped)
  // (the fingers' 30 joints keep their rest pose: their channels are half the file and unseen at the camera's distance)
  for (const a of root.listAnimations()) for (const ch of a.listChannels()) { const n = ch.getTargetNode(); if (n && /^(index|middle|pinky|ring|thumb)_|_leaf/.test(n.getName())) { const smp = ch.getSampler(); ch.dispose(); if (smp) smp.dispose(); } }
  let flat = 0; for (const a of root.listAnimations()) for (const ch of a.listChannels()) { const smp = ch.getSampler(), out = smp && smp.getOutput(); if (!out) continue; const n = out.getCount(), k = out.getElementSize(); if (n < 2) continue; const f = out.getElement(0, []); let same = true; for (let i = 1; i < n && same; i++) { const e = out.getElement(i, []); for (let j = 0; j < k; j++) if (Math.abs(e[j] - f[j]) > 1e-5) { same = false; break; } } if (same && ch.getTargetPath() !== 'rotation') { ch.dispose(); smp.dispose(); flat++; } }
  // (a disposed sampler leaves its accessors behind: dispose every accessor no sampler uses)
  { const used = new Set(); for (const a of root.listAnimations()) for (const smp of a.listSamplers()) { used.add(smp.getInput()); used.add(smp.getOutput()); } for (const ac of root.listAccessors()) if (!used.has(ac)) ac.dispose(); }
  await doc.transform(resample({ tolerance: 5e-4 }), dedup(), prune({ keepLeaves: true }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const glb = await io.writeBinary(doc); writeFileSync(join(OUTDIR, 'anim88.glb'), glb); console.log('anim88', Math.round(glb.byteLength / 1024), 'KiB', 'clips', kept, 'flat', flat);
}
