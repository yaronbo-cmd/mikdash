// icon132 — renders assets/icon/mikdash.svg to the app icon PNGs (build 132's web app manifest, src/manifest.js):
//   mikdash-192.png, mikdash-512.png and mikdash-512-maskable.png (the art scaled into Android's safe 80% circle).
//   node tools/icon132.cjs   (Playwright's Chromium; run it again only when the SVG changes, then node build.mjs)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'assets', 'icon');
const svg = fs.readFileSync(path.join(DIR, 'mikdash.svg'), 'utf8');
const MASK = 0.86;   // (the art's corners at most 0.86 × 216 px ≈ 186 px from the centre: inside the 204.8 px safe circle)
const variant = (scale) => (scale === 1 ? svg : svg.replace('<g id="art">', `<g id="art" transform="translate(256 256) scale(${scale}) translate(-256 -256)">`));
(async () => {
  const b = await chromium.launch();
  for (const [name, size, scale] of [['mikdash-192.png', 192, 1], ['mikdash-512.png', 512, 1], ['mikdash-512-maskable.png', 512, MASK]]) {
    const pg = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await pg.setContent(`<!doctype html><html><body style="margin:0;background:#2A2016">${variant(scale).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
    const buf = await pg.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
    fs.writeFileSync(path.join(DIR, name), buf);
    console.log(name, size + 'x' + size, buf.length, 'B');
    await pg.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
