// ── build 91 ── the .glb files' JSON without the glTF defaults (accessor normalized:false, byteOffset:0): the same model, fewer bytes in the
// page (the 6 MiB budget). node tools/glbslim91.mjs assets/anim88.glb …
import fs from 'fs';
for (const f of process.argv.slice(2)) {
  const b = fs.readFileSync(f), L = b.readUInt32LE(12), j = JSON.parse(b.slice(20, 20 + L).toString());
  for (const a of j.accessors || []) { if (a.normalized === false) delete a.normalized; if (a.byteOffset === 0) delete a.byteOffset; }
  for (const v of j.bufferViews || []) if (v.byteOffset === 0) delete v.byteOffset;
  let s = Buffer.from(JSON.stringify(j)); const pad = (4 - (s.length % 4)) % 4; s = Buffer.concat([s, Buffer.alloc(pad, 0x20)]);
  const rest = b.slice(20 + L), out = Buffer.alloc(12 + 8 + s.length + rest.length);
  b.copy(out, 0, 0, 12); out.writeUInt32LE(out.length, 8); out.writeUInt32LE(s.length, 12); out.writeUInt32LE(0x4E4F534A, 16); s.copy(out, 20); rest.copy(out, 20 + s.length);
  fs.writeFileSync(f, out); console.log(f, b.length, '→', out.length);
}
