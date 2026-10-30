// recovery R1 — bundle a source tree with build.mjs's exact esbuild settings, twice:
//   app.min.js     the plain bundle (byte-identical to what build.mjs inlines into dist/*.html)
//   app.names.js   the same minification but with the source's own names (minifyIdentifiers: false)
//   app.marked.js  the same, with a no-op call __R1M("path") at the top and __R1E("path") at the end of every .js/.mjs module,
//                  so each top-level unit of the minified output can be labelled with the module it came from.
// usage: node recovery/tools/build-marked.mjs [repoRoot=/home/claude/temple3d] [outDir=recovery/work/b15]
// (the esbuild of the repo's own node_modules is used; build.mjs's two plugins are copied here verbatim)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const root = path.resolve(process.argv[2] || '/home/claude/temple3d');
const outDir = path.resolve(root, process.argv[3] || 'recovery/work/b15');
const require = createRequire(root + '/');
const { build } = require('esbuild');
fs.mkdirSync(outDir, { recursive: true });

// ── copied from build.mjs (build 15) ──
const STRIP = new Set(['note', 'do_not_show_he']);
const KEEP_VIEWS = new Set(['avodah_gaps.json']);
const contentStrip = {
  name: 'content-strip',
  setup(b) {
    b.onLoad({ filter: /[\\/]content[\\/][a-z_]+\.json$/, namespace: 'file' }, async (args) => {
      const base = args.path.split(/[\\/]/).pop();
      const facts = base === 'facts.json';
      const drop = (o) => (Array.isArray(o) ? o.map(drop) : o && typeof o === 'object'
        ? Object.fromEntries(Object.entries(o).filter(([k]) => !STRIP.has(k) && !(k === 'views' && !KEEP_VIEWS.has(base)) && !(facts && (k === 'quote' || k === 'quote_nikud'))).map(([k, v]) => [k, drop(v)]))
        : o);
      return { contents: JSON.stringify(drop(JSON.parse(await fs.promises.readFile(args.path, 'utf8')))), loader: 'json' };
    });
  },
};
const OPTIONAL_PART = /^\.\/(match3\/index|kings\/index|game\/minigames\/index)\.js$|^\.\.\/content\/facts\.json$/;
const optionalParts = {
  name: 'optional-parts',
  setup(b) {
    b.onResolve({ filter: OPTIONAL_PART }, (args) => {
      if (fs.existsSync(`${args.resolveDir}/${args.path}`)) return null;
      console.log(`build: optional part absent, stubbed: ${args.path}`);
      return { path: args.path, namespace: 'optional-part' };
    });
    b.onLoad({ filter: /.*/, namespace: 'optional-part' }, (args) => (/\.json$/.test(args.path) ? { contents: '[]', loader: 'json' } : { contents: 'export {};', loader: 'js' }));
  },
};
// ── /copied ──

const marker = {
  name: 'r1-marker',
  setup(b) {
    b.onLoad({ filter: /\.(m?js)$/, namespace: 'file' }, async (args) => {
      const rel = path.relative(root, args.path).split(path.sep).join('/');
      const src = await fs.promises.readFile(args.path, 'utf8');
      return { contents: `__R1M(${JSON.stringify(rel)});\n${src}\n;__R1E(${JSON.stringify(rel)});\n`, loader: 'js', resolveDir: path.dirname(args.path) };
    });
  },
};

const common = {
  absWorkingDir: root,
  entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
  legalComments: 'none', logLevel: 'warning', charset: 'utf8', loader: { '.glb': 'dataurl' },
  write: false, metafile: true,
};
const plain = await build({ ...common, outfile: path.join(outDir, 'app.min.js'), plugins: [contentStrip, optionalParts] });
const marked = await build({ ...common, outfile: path.join(outDir, 'app.marked.js'), plugins: [contentStrip, optionalParts, marker] });
// the same bundle with the minifier's syntax and whitespace passes but the ORIGINAL names (minifyIdentifiers off): its units
// normalize exactly like app.min.js's, so it lends every minified top-level name its source name (symmap.py)
const named = await build({ ...common, minify: false, minifyWhitespace: true, minifySyntax: true, minifyIdentifiers: false, outfile: path.join(outDir, 'app.names.js'), plugins: [contentStrip, optionalParts] });
for (const [r, name] of [[plain, 'app.min.js'], [marked, 'app.marked.js'], [named, 'app.names.js']]) {
  fs.writeFileSync(path.join(outDir, name), r.outputFiles[0].text);
  fs.writeFileSync(path.join(outDir, name + '.meta.json'), JSON.stringify(r.metafile, null, 1));
  console.log(name, Buffer.byteLength(r.outputFiles[0].text), 'bytes');
}
