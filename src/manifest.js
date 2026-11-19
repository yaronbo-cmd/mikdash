// ── manifest132 ── (build 132) the web app manifest, inline: GitHub Pages serves only index.html of a version, and an artifact
// page fetches no other file, so the manifest is a data: URL made in the page's <head> (build.mjs bundles this file with
// src/manifest-head.js into a small script of its own, before the app). A data: manifest cannot resolve relative URLs, so id,
// start_url and scope are the page's absolute folder: each /v/<seg>/ is an app of its own, as its saves are (game/savekey.js).
// The icons: assets/icon/mikdash.svg rendered by tools/icon132.cjs, inlined at build time. Pure: no DOM but in addManifest.

export const NAME = 'בית המקדש';
export const COLOR = '#2A2016';   // (the play page's theme-color and background: build.mjs, the play page)

/** the folder of a page URL, absolute, without query and hash: '…/v/131/index.html?stage=8#pit1' → '…/v/131/' */
export function folderOf(href) {
  const u = new URL(String(href));
  u.search = ''; u.hash = '';
  u.pathname = u.pathname.replace(/[^/]*$/, '');
  return u.href;
}

/** the manifest for the page at `href`; icons = { i192, i512, i512m } (data URIs) */
export function manifestFor(href, icons = {}) {
  const dir = folderOf(href);
  const ic = [];
  if (icons.i192) ic.push({ src: icons.i192, sizes: '192x192', type: 'image/png', purpose: 'any' });
  if (icons.i512) ic.push({ src: icons.i512, sizes: '512x512', type: 'image/png', purpose: 'any' });
  if (icons.i512m) ic.push({ src: icons.i512m, sizes: '512x512', type: 'image/png', purpose: 'maskable' });
  return {
    id: dir, name: NAME, short_name: NAME, lang: 'he', dir: 'rtl',
    start_url: dir, scope: dir, display: 'fullscreen', orientation: 'landscape',
    theme_color: COLOR, background_color: COLOR, icons: ic,
  };
}

/** the page's own window only (never inside a frame such as an artifact's), over http(s) only (never file://) */
export function wantsManifest(win) {
  try { return !!win && win.top === win && /^https?:$/.test(win.location.protocol); } catch (e) { return false; }
}

/** adds <link rel="manifest" href="data:…"> to the head once; returns the link or null */
export function addManifest(win, icons) {
  if (!wantsManifest(win)) return null;
  const d = win.document;
  if (d.querySelector('link[rel="manifest"]')) return null;
  const l = d.createElement('link');
  l.rel = 'manifest';
  l.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifestFor(win.location.href, icons)));
  (d.head || d.documentElement).appendChild(l);
  return l;
}
// ── /manifest132 ──
