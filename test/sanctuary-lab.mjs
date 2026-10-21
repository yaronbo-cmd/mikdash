// Builds the sanctuary lab page (test/out/sanctuary-lab.html). Usage: node test/sanctuary-lab.mjs
import { build } from 'esbuild';
import fs from 'fs';
await build({ entryPoints: ['test/sanctuary-lab-entry.js'], bundle: true, format: 'iife', target: 'es2020', outfile: 'test/out/lab/lab.js', logLevel: 'warning' });
fs.writeFileSync('test/out/sanctuary-lab.html', `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;overflow:hidden;background:#000}#c{width:100%;height:100%;display:block}</style></head><body><canvas id="c"></canvas><script src="lab/lab.js"></script></body></html>`);
console.log('lab built');
