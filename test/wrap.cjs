// Wrap the artifact body (dist/temple3d.html) in a full document for local testing.
const fs = require('fs');
const p = fs.readFileSync('dist/temple3d.html', 'utf8');
fs.writeFileSync('dist/test.html', "<!doctype html><html lang='he'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'></head><body>" + p + '</body></html>');
