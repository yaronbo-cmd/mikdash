// node tools/lab137/build.mjs → /mnt/project-files/mikdash/lab137/<work>.html (and dist/): each lab page with its bundle inline
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const out = process.argv[2] || path.join(here, 'dist');
fs.mkdirSync(out, { recursive: true });
const pages = { taim: 'אב־טיפוס: מבוך התאים', hakzaa: 'אב־טיפוס: הקצעת הקרשים', zahav: 'אב־טיפוס: עלי הזהב' };
for (const [k, title] of Object.entries(pages)) {
  const entry = path.join(here, k + '-entry.js'); if (!fs.existsSync(entry)) continue;
  const r = await build({ entryPoints: [entry], bundle: true, minify: true, format: 'iife', write: false, target: 'es2020', logLevel: 'error' });
  const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = fs.readFileSync(path.join(here, 'page.html'), 'utf8').replace('TITLE', title).replace('SCRIPT', () => js);
  fs.writeFileSync(path.join(out, k + '.html'), html);
  console.log(k, (html.length / 1024).toFixed(0) + ' KB');
}
