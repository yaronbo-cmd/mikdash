// recovery R1 — take a game page apart.
// usage: node recovery/tools/extract.mjs <page.html> <outDir>
// writes: shell.html (the page with /*__APP__*/ etc. in place of the blocks), block-<i>.<css|js> (the small blocks),
//         app.min.js (the bundle), app.stub.js (the bundle with every data: URL / long base64 literal replaced by
//         "__R1_ASSET_<sha12>__"), assets.json (each payload: mime, bytes, sha, where), cssjs.json + cssjs/<sha>.css
//         (every CSS-looking string/template literal inside the bundle).
import fs from 'fs';
import path from 'path';
import { splitHtml, parse, walk, sha } from './r1lib.mjs';
const [file, outDir] = process.argv.slice(2);
fs.mkdirSync(path.join(outDir, 'cssjs'), { recursive: true });
const html = fs.readFileSync(file, 'utf8');
const { blocks, app, js, shell } = splitHtml(html);
fs.writeFileSync(path.join(outDir, 'shell.html'), shell);
blocks.forEach((b, i) => { if (b !== app) fs.writeFileSync(path.join(outDir, `block-${i}.${b.tag === 'style' ? 'css' : 'js'}`), b.text); });
fs.writeFileSync(path.join(outDir, 'app.min.js'), js);
const ast = parse(js);
const assets = [], css = [], reps = [];
const isCss = (s) => s.length >= 160 && (s.match(/[^{}]*\{[^{}]*:[^{}]*;?[^{}]*\}/g) || []).length >= 3 && /[.#\w-]+\s*\{/.test(s) && !/^data:/.test(s);
const take = (node, value, kind) => {
  if (typeof value !== 'string') return;
  const dm = /^data:([^;,]+)?(;base64)?,/.exec(value);
  if (dm || (value.length > 20000 && /^[A-Za-z0-9+/=\s]+$/.test(value.slice(0, 2000)))) {
    const body = dm ? value.slice(dm[0].length) : value;
    const bytes = dm && dm[2] ? Buffer.from(body, 'base64') : Buffer.from(body);
    const h = sha(bytes);
    assets.push({ sha: h, mime: dm ? dm[1] || '' : 'raw-base64?', literalChars: value.length, decodedBytes: bytes.length, at: node.start });
    if (node.type === 'Literal') reps.push([node.start, node.end, JSON.stringify(`__R1_ASSET_${h}__`)]);
    return;
  }
  if (kind !== 'tpl-part' && isCss(value)) {
    const h = sha(value);
    css.push({ sha: h, chars: value.length, at: node.start, head: value.trim().slice(0, 80).replace(/\s+/g, ' ') });
    fs.writeFileSync(path.join(outDir, 'cssjs', h + '.css'), value);
  }
};
walk.full(ast, (node) => {
  if (node.type === 'Literal') take(node, node.value, 'lit');
  else if (node.type === 'TemplateLiteral') {
    const whole = node.quasis.map((q) => q.value.cooked ?? q.value.raw).join('${}');
    if (isCss(whole)) take(node, whole, 'tpl');
  }
});
reps.sort((a, b) => b[0] - a[0]);
let stub = js;
for (const [s, e, r] of reps) stub = stub.slice(0, s) + r + stub.slice(e);
fs.writeFileSync(path.join(outDir, 'app.stub.js'), stub);
fs.writeFileSync(path.join(outDir, 'assets.json'), JSON.stringify(assets, null, 1));
css.sort((a, b) => a.at - b.at);
fs.writeFileSync(path.join(outDir, 'cssjs.json'), JSON.stringify(css, null, 1));
console.log(JSON.stringify({ file, htmlBytes: Buffer.byteLength(html), blocks: blocks.map((b) => ({ tag: b.tag, chars: b.text.length, sha: sha(b.text) })), shellSha: sha(shell.replace(/<title>.*?<\/title>/, '<title/>')), jsBytes: Buffer.byteLength(js), stubBytes: Buffer.byteLength(stub), assets: assets.length, assetBytes: assets.reduce((a, b) => a + b.literalChars, 0), cssLiterals: css.length }, null, 1));
