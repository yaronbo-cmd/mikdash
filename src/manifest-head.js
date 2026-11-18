// ── manifest132 ── the head script's entry (build.mjs bundles it apart from the app, the PNGs inlined as data URIs)
import { addManifest } from './manifest.js';
import i192 from '../assets/icon/mikdash-192.png';
import i512 from '../assets/icon/mikdash-512.png';
import i512m from '../assets/icon/mikdash-512-maskable.png';
try { addManifest(window, { i192, i512, i512m }); } catch (e) { /* the game goes on without it */ }
// ── /manifest132 ──
