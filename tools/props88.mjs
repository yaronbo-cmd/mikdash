// ── build 88 ── tools/props88.mjs — the wooden things of the world from Quaternius's CC0 "Medieval Village MegaKit" (quaternius.com; the
// free version mirrored at github.com/J-Ponzo/gltf-medieval-village-megakit@21104b4): the hand cart (Prop_Wagon) with its own wood, and two
// strips of the kit's wood atlas (T_WoodTrim) for the crane's timbers — light side grain and dark. Credited in docs/PEOPLE88.md.
//   node tools/props88.mjs <megakit glTF dir> [outDir=assets]   (needs @gltf-transform/{core,extensions,functions}, meshoptimizer, python3 + Pillow)
// → assets/wagon88.glb (base colour only, 256 px JPEG, quantized + meshopt) · assets/wood88a.jpg · assets/wood88b.jpg (128 × 512, grain along v)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, quantize, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { writeFileSync, readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const [DIR, OUT = 'assets'] = process.argv.slice(2);
const tmp = mkdtempSync(join(tmpdir(), 'pr88-'));
const py = (code, ...args) => execFileSync('python3', ['-I', '-c', code, ...args]);
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
{
  const doc = await io.read(join(DIR, 'Prop_Wagon.gltf')), root = doc.getRoot();
  for (const m of root.listMaterials()) { m.setNormalTexture(null); m.setMetallicRoughnessTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.92); }
  for (const t of root.listTextures()) { if (!/BaseColor/i.test(t.getURI() || t.getName())) continue; const a = join(tmp, 'w.png'), b = join(tmp, 'w.jpg'); writeFileSync(a, t.getImage()); py('import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").resize((256,256),Image.LANCZOS).save(sys.argv[2],quality=85)', a, b); t.setImage(readFileSync(b)).setMimeType('image/jpeg').setURI('wagon88.jpg'); }
  await doc.transform(prune(), dedup(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const glb = await io.writeBinary(doc); writeFileSync(join(OUT, 'wagon88.glb'), glb); console.log('wagon88', Math.round(glb.byteLength / 1024), 'KiB');
}
// (the atlas's light band is its top 30 %, the dark band 30–60 %: each cropped, turned so the grain runs along v, 128 × 512)
py(`import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB');W,H=im.size
for name,(a,b) in (('wood88a',(0.02,0.28)),('wood88b',(0.33,0.58))):
  c=im.crop((0,int(H*a),W,int(H*b))).rotate(90,expand=True).resize((128,512),Image.LANCZOS)
  c.save(sys.argv[2]+'/'+name+'.jpg',quality=84)`, join(DIR, 'T_WoodTrim_BaseColor.png'), OUT);
console.log('wood88a/b written');
