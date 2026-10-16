// The pen-puzzle harness entry (test/pen.html): the real src/pen overlay over a stand-in for the 3D world.
import * as PN from '../src/pen/index.js';
window.PN = PN;
window.__pnlog = [];
window.__sfx = { play: (n) => window.__pnlog.push(n), has: () => true, haptic: () => {} };
