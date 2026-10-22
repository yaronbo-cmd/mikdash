// mkout — the page the owner opens: out/index.html = dist/play.html (node build.mjs) + the head script that opens the shift
// (globalThis.__FORCE_SHIFT, #shift) + the build's title.  The script and the title are those of the published builds
// (recovery/build26c.min.html: "משמרת 45 (בנייה 26ג) — בית המקדש השני").
//   node tools/mkout.cjs ["<title>"] [--out out/index.html] [--check recovery/build26c.min.html]
//   --check: the written page against a published one — the same bytes but for the app's minified names (the same length, the
//            head and the tail byte for byte); prints where they part
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const title = args.find((a, i) => !a.startsWith('--') && !['--out', '--check'].includes(args[i - 1])) || 'משמרת 45 (בנייה 26ג) — בית המקדש השני';
const root = path.join(__dirname, '..');
const out = path.resolve(root, opt('--out') || 'out/index.html');
const play = path.join(root, 'dist/play.html');
if (!fs.existsSync(play)) { console.error('mkout: no dist/play.html — run node build.mjs first'); process.exit(2); }

const HEAD = '<script>globalThis.__FORCE_SHIFT=true;try{if(!/^#shift/.test(location.hash))location.hash="#shift";}catch(e){}</script>';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let html = fs.readFileSync(play, 'utf8');
if (!html.includes('<head>')) { console.error('mkout: dist/play.html has no <head>'); process.exit(2); }
html = html.replace('<head>', () => '<head>' + HEAD);
if (!/<title>.*?<\/title>/.test(html)) { console.error('mkout: dist/play.html has no <title>'); process.exit(2); }
html = html.replace(/<title>.*?<\/title>/, () => `<title>${esc(title)}</title>`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`mkout: ${path.relative(root, out)} — ${Buffer.byteLength(html).toLocaleString('en-US')} bytes, title "${title}"`);

const ref = opt('--check');
if (ref) {
  const a = Buffer.from(html, 'utf8'), b = fs.readFileSync(path.resolve(root, ref));
  let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let z = 0; while (z < a.length - p && z < b.length - p && a[a.length - 1 - z] === b[b.length - 1 - z]) z++;
  const appAt = b.indexOf('<script>(()=>{');
  console.log(`check: ${a.length.toLocaleString('en-US')} B here, ${b.length.toLocaleString('en-US')} B in ${ref}${a.equals(b) ? ' — BYTE-IDENTICAL' : ''}`);
  if (!a.equals(b)) {
    console.log(`check: the same first ${p.toLocaleString('en-US')} B (the head and the app script's start: the app begins at byte ${appAt.toLocaleString('en-US')}) and the same last ${z.toLocaleString('en-US')} B`);
    console.log(`check: the head ${p > appAt ? 'is byte-identical' : 'DIFFERS at byte ' + p}; here: ${JSON.stringify(html.slice(Math.max(0, p - 20), p + 60))}`);
  }
}
