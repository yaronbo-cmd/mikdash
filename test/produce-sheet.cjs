// PRODUCER12 (wave 12, the owner's note 2): the Mount at the end of each course, side by side, from ONE fixed camera, and how much
// of the picture changed from one course to the next (the HUD's rows cut away: y 100…760 of the 390×844 phone).
//   node test/produce-sheet.cjs <tag> <cam> [out.png]      e.g.  node test/produce-sheet.cjs mj olives
// Reads test/out/produce/<tag>-NN-<stage>-c<k>-fix-<cam>.png (or -c<k>-pinch.png for cam "pinch"); writes one sheet PNG and prints the
// % of pixels whose colour moved by more than 12 levels (of 255) between consecutive courses (≥ 3 % is SITE12's target).
const path = require('path'), fs = require('fs');
const sharp = require('sharp');
const OUT = path.join(__dirname, 'out/produce');
const [tag, cam = 'olives', outArg] = process.argv.slice(2);
const re = cam === 'pinch' ? new RegExp(`^(?:${tag})-\\d+-(\\w+)-c(\\d+)-pinch\\.png$`) : new RegExp(`^(?:${tag})-\\d+-(\\w+)-c(\\d+)-fix-${cam}\\.png$`);   // (tag: a regex, e.g. 'mt-\\d' joins the parts of one play)
const files = fs.readdirSync(OUT).map((f) => { const m = f.match(re); return m ? { f, c: +m[2] } : null; }).filter(Boolean).sort((a, b) => a.c - b.c);
const ONLY = process.env.COURSES ? process.env.COURSES.split(',').map(Number) : null;   // (COURSES=1,2,3,4: only these)
const seen = new Set(); const list = files.filter((x) => (!ONLY || ONLY.includes(x.c)) && (seen.has(x.c) ? false : seen.add(x.c)));
if (!list.length) { console.log('no shots for', tag, cam); process.exit(1); }
const Y0 = 100, Y1 = 760, W = 390, SC = 0.5;
(async () => {
  const raws = [];
  for (const x of list) raws.push(await sharp(path.join(OUT, x.f)).extract({ left: 0, top: Y0, width: W, height: Y1 - Y0 }).removeAlpha().raw().toBuffer());
  const diffs = [];
  for (let i = 1; i < raws.length; i++) {
    const a = raws[i - 1], b = raws[i]; let n = 0; const N = a.length / 3;
    for (let k = 0; k < a.length; k += 3) if (Math.abs(a[k] - b[k]) + Math.abs(a[k + 1] - b[k + 1]) + Math.abs(a[k + 2] - b[k + 2]) > 36) n++;
    diffs.push(Math.round(1000 * n / N) / 10);
  }
  const tw = Math.round(W * SC), th = Math.round((Y1 - Y0) * SC), pad = 6, lab = 26;
  const tiles = await Promise.all(list.map((x) => sharp(path.join(OUT, x.f)).extract({ left: 0, top: Y0, width: W, height: Y1 - Y0 }).resize(tw, th).png().toBuffer()));
  const width = list.length * (tw + pad) + pad, height = th + lab * 2 + pad;
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font:bold 15px sans-serif;fill:#222}</style>
    ${list.map((x, i) => `<text x="${pad + i * (tw + pad) + 4}" y="18">course ${x.c}${i ? ` · Δ ${diffs[i - 1]}%` : ''}</text>`).join('')}
    <text x="${pad}" y="${height - 8}" style="font:12px sans-serif">${tag} · camera ${cam} · Δ = % of pixels changed vs the previous course</text></svg>`;
  const out = outArg || path.join(OUT, `${tag}-sheet-${cam}.png`);
  await sharp({ create: { width, height, channels: 3, background: '#f4efe4' } })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, ...tiles.map((t, i) => ({ input: t, top: lab, left: pad + i * (tw + pad) }))]).png().toFile(out);
  console.log(`${out}: courses ${list.map((x) => x.c).join(',')} · Δ% ${diffs.join(' · ')}`);
})().catch((e) => { console.error(e); process.exit(2); });
