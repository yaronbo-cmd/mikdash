import { build } from 'esbuild';
import fs from 'fs';
import zlib from 'zlib';

/* The content files ship without the reviewers' fields: `note` (the content agents' notes for Yaron's review),
 * `do_not_show_he` (filming rules for the scenes' authors) and `views` (supporting sources, shown only for
 * avodah_gaps.json, whose views the game reads). The player never sees them; content/*.json keep them for the review. */
const STRIP = new Set(['note', 'do_not_show_he']);
const KEEP_VIEWS = new Set(['avodah_gaps.json']);
const contentStrip = {
  name: 'content-strip',
  setup(b) {
    b.onLoad({ filter: /[\\/]content[\\/][a-z_]+\.json$/, namespace: 'file' }, async (args) => {   // (flow8: files only — a stubbed optional part is not read)
      const base = args.path.split(/[\\/]/).pop();
      const facts = base === 'facts.json';   // (flow8: FACTS8B's checker fields never reach the player)
      const drop = (o) => (Array.isArray(o) ? o.map(drop) : o && typeof o === 'object'
        ? Object.fromEntries(Object.entries(o).filter(([k]) => !STRIP.has(k) && !(k === 'views' && !KEEP_VIEWS.has(base)) && !(facts && (k === 'quote' || k === 'quote_nikud'))).map(([k, v]) => [k, drop(v)]))
        : o);
      return { contents: JSON.stringify(drop(JSON.parse(await fs.promises.readFile(args.path, 'utf8')))), loader: 'json' };
    });
  },
};

// ── build6 ── (BUILD, wave 6) the Phase A parts main.js imports from other branches (MATCH3's boards, KINGS' courts, FUN's
// precision games). A branch built alone lacks their files: an absent part resolves to an empty module (logged), and the game
// falls back to its cards. On the merged tree the real modules are bundled; nothing is stubbed there.
const OPTIONAL_PART = /^\.\/(match3\/index|kings\/index|game\/minigames\/index)\.js$|^\.\.\/content\/facts\.json$/;   // (flow8: FACTS8B's facts.json too)
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
// ── /build6 ──

await build({
  entryPoints: ['src/main.js'], bundle: true, minify: true, format: 'iife', target: 'es2020',
  outfile: 'dist/app.js', legalComments: 'none', logLevel: 'warning', charset: 'utf8', loader: { '.glb': 'dataurl' },   // ── fable32 (build 15) ── (the kohen's model inlined; a Pages folder will serve it as a file) ── /fable32 ──   // Hebrew stays readable (and ~⅓ smaller than \uXXXX escapes)
  plugins: [contentStrip, optionalParts],   // ── build6 ── optionalParts
  define: { 'location.search': '__QS56', 'location.hash': '__QH56' },   // ── build 56ב ── the tester's chosen stage (src/fix56.js), even where the artifact's frame refuses history.replaceState ── /build 56ב ──
});
const js = fs.readFileSync('dist/app.js', 'utf8').replace(/<\/script/gi, '<\\/script');
const html = fs.readFileSync('src/page.html', 'utf8').replace('/*__APP__*/', () => js);
fs.writeFileSync('dist/temple3d.html', html);
// ── play ── a page of its own for a phone (the owner, 6.10): the game alone, full screen from the home screen
fs.writeFileSync('dist/play.html', "<!doctype html><html lang='he' dir='rtl'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'><meta name='mobile-web-app-capable' content='yes'><meta name='apple-mobile-web-app-capable' content='yes'><meta name='apple-mobile-web-app-status-bar-style' content='black-translucent'><meta name='apple-mobile-web-app-title' content='בית המקדש'><meta name='theme-color' content='#2A2016'><style>html,body{margin:0;height:100%;overflow:hidden;background:#2A2016}</style></head><body>" + html + '</body></html>');
fs.writeFileSync('dist/test.html', "<!doctype html><html lang='he'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + html + '</body></html>');
// ── ui ── (QA P2-9) the size in bytes as written (UTF-8), and gzipped (what a server or the store package sends);
// `html.length` counted UTF-16 characters, which undercounts every Hebrew letter by half
const bytes = Buffer.byteLength(html, 'utf8'), gz = zlib.gzipSync(html, { level: 9 }).length;
const mib = (n) => (n / 1048576).toFixed(2) + ' MiB';
console.log(`built dist/temple3d.html: ${bytes.toLocaleString('en-US')} bytes (${mib(bytes)}), gzip ${gz.toLocaleString('en-US')} bytes (${mib(gz)})`);
if (bytes > 6 * 1048576) console.warn('WARNING: over the 6 MiB budget (PROJECT.md §3)');   // (the owner, 20.10: "בוא נעלה את התקרה כרגע" — 5 → 6 MiB)
