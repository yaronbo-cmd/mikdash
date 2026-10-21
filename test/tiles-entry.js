// The memory tile-flip harness entry (test/tiles.html): the real src/tiles overlay over a stand-in for the 3D world.
import * as TL from '../src/tiles/index.js';
window.TL = TL;
window.__tllog = [];
window.__sfx = { play: (n) => window.__tllog.push(n), has: () => true, haptic: () => {} };
