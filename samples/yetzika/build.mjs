// Builds samples/yetzika/dist/yetzika.html: one self-contained file, three.js bundled and inlined.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const res = await build({
  entryPoints: [join(here, 'main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  target: 'es2020',
  write: false,
  legalComments: 'none',
  absWorkingDir: join(here, '..', '..'),
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const src = readFileSync(join(here, 'index.src.html'), 'utf8');
const html = src.replace('/*__BUNDLE__*/', () => js);
mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist', 'yetzika.html'), html);
console.log(`dist/yetzika.html written, ${(html.length / 1024).toFixed(0)} KB`);
