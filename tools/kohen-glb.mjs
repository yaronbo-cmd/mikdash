// ── fable32 (build 15) ── tools/kohen-glb.mjs — the kohen's model from the CC0 KayKit "Adventurers" pack (Kay Lousberg, CC0 1.0 — no attribution
// required; credited anyway in docs/KOHEN35.md): the Mage's body, head, arms and legs with the rig; the hat, cape, spellbooks, wand and staff
// removed (the kohen's cap and sash are ours, attached to the bones at run time); only the animations the game uses kept and resampled;
// the whole quantized and meshopt-compressed → assets/kohen.glb (≈ ½ MB). Run: node tools/kohen-glb.mjs <Mage.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, quantize, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import { writeFileSync, readFileSync } from 'node:fs';

const SRC = process.argv[2] || '/home/claude/assets/kaykit-adv/addons/kaykit_character_pack_adventures/Characters/gltf/Mage.glb';
const OUT = process.argv[3] || 'assets/kohen.glb';
const KEEP = new Set(['Idle', 'Walking_A', 'Running_A', '2H_Melee_Attack_Chop', '1H_Melee_Attack_Chop', 'PickUp', 'Interact', 'Use_Item', 'Cheer', 'Throw', 'Spellcast_Raise', 'Sit_Floor_Idle', 'Sit_Floor_Down', 'Sit_Floor_StandUp', 'Lie_Idle', 'Hit_A', 'Jump_Full_Short', 'Unarmed_Idle', 'Walking_B', 'T-Pose']);
const DROP_NODES = /^(Mage_Hat|Mage_Cape|Spellbook|Spellbook_open|1H_Wand|2H_Staff)$/;

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(SRC);
const root = doc.getRoot();
let dropped = 0;
for (const n of root.listNodes()) { if (DROP_NODES.test(n.getName())) { const m = n.getMesh(); n.dispose(); if (m) m.dispose(); dropped++; } }
let kept = 0, removed = 0;
for (const a of root.listAnimations()) { if (KEEP.has(a.getName())) kept++; else { a.dispose(); removed++; } }
// (the IK handles and controls are animated too, but only the skins' joints move the mesh: every channel on a non-joint node goes — the JSON shrinks ~5×)
const joints = new Set(); for (const sk of root.listSkins()) for (const j of sk.listJoints()) joints.add(j);
let chDrop = 0, chKeep = 0;
for (const a of root.listAnimations()) for (const ch of a.listChannels()) { const n = ch.getTargetNode(); if (n && !joints.has(n)) { const smp = ch.getSampler(); ch.dispose(); if (smp) smp.dispose(); chDrop++; } else chKeep++; }
// (a channel whose keyframes never change — every scale, most translations — says nothing the node's own transform does not: dropped)
let flat = 0;
for (const a of root.listAnimations()) for (const ch of a.listChannels()) { const smp = ch.getSampler(); const out = smp && smp.getOutput(); if (!out) continue; const n = out.getCount(), k = out.getElementSize(); if (n < 2) continue; const first = new Array(k), cur = new Array(k); out.getElement(0, first); let same = true; for (let i = 1; i < n && same; i++) { out.getElement(i, cur); for (let c = 0; c < k; c++) if (Math.abs(cur[c] - first[c]) > 1e-4) { same = false; break; } } if (same) { const node = ch.getTargetNode(), path = ch.getTargetPath(); if (node) { if (path === 'translation') node.setTranslation(first); else if (path === 'rotation') node.setRotation(first); else if (path === 'scale') node.setScale(first); } ch.dispose(); smp.dispose(); flat++; } }
console.log(JSON.stringify({ joints: joints.size, chDrop, chKeep, flat }));
// the kohen's palette: the Mage's atlas with the robe's cells white linen, the sash's ground תכלת, the boots' cells skin (barefoot), the beard dark (assets/kohen_tex.png)
{ const tex = root.listTextures()[0]; if (tex) { tex.setImage(readFileSync('assets/kohen_tex.png')).setMimeType('image/png').setName('kohen_tex'); } }
console.log('accessors before', root.listAccessors().length, 'samplers', root.listAnimations().reduce((a, b) => a + b.listSamplers().length, 0));
// (a disposed sampler leaves its accessors: dispose the ones no sampler and no primitive uses)
{ const used = new Set(); for (const a of root.listAnimations()) for (const smp of a.listSamplers()) { used.add(smp.getInput()); used.add(smp.getOutput()); } for (const m of root.listMeshes()) for (const pr of m.listPrimitives()) { for (const at of pr.listAttributes()) used.add(at); if (pr.getIndices()) used.add(pr.getIndices()); } for (const sk of root.listSkins()) if (sk.getInverseBindMatrices()) used.add(sk.getInverseBindMatrices()); let gone = 0; for (const ac of root.listAccessors()) if (!used.has(ac)) { ac.dispose(); gone++; } console.log('orphan accessors disposed', gone); }
await doc.transform(dedup(), prune(), resample({ tolerance: 1e-4 }), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
console.log('accessors after', root.listAccessors().length);
const glb = await io.writeBinary(doc);
writeFileSync(OUT, glb);
console.log(JSON.stringify({ out: OUT, bytes: glb.byteLength, kib: Math.round(glb.byteLength / 1024), droppedNodes: dropped, animsKept: kept, animsRemoved: removed, nodes: root.listNodes().filter((n) => n.getMesh()).map((n) => n.getName()) }));
