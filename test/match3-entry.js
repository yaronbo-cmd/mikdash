// The match-3 harness entry (test/match3.html): the real src/match3 overlay over a stand-in for the 3D world.
import * as M3 from '../src/match3/index.js';
window.M3 = M3;
window.__m3log = [];
window.__sfx = { play: (n, o) => window.__m3log.push(n), has: () => true, haptic: () => {} };
