/* The scenes bot's page (HOOKS agent, round 3): the REAL scenes panel (src/avodah/scenes: the tour, "איפה הארון?" and
 * the Yom Kippur service) over a MOCK world whose camera moves take the time they take on a device (no WebGL). The bot
 * (test/playtest/scenes-bots.cjs) walks every tab card by card and reads what the player reads.
 * Built by scenes-bots.cjs into test/out/playtest/scenes-bot.bundle.js. */
import { createScenes } from '../../src/avodah/scenes/index.js';
import '../../src/avodah/hooks/index.js';   // (the hooks layer registers its scenes hook on import, if it has one)

const P = new URLSearchParams(location.search);
const T = { look: 1800, focus: 1600, enter: 4500, exit: 3000, yk: 5200 };   // ms: a device at 60 fps (docs/SCENES.md §4)
const calls = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const world = {
  look: (p, t, ms) => { calls.push(['look']); return wait(ms == null ? T.look : Math.min(ms, T.look)); },
  setTimeOfDay: () => {},
  sanctuary: {
    state: { room: 'out' },
    focus(id, ms) { calls.push(['focus', id]); return wait(ms == null ? T.focus : Math.min(ms, T.focus)); },
    enter(room, o) { calls.push(['enter', room]); this.state.room = room; return wait(o && o.ms === 0 ? 0 : T.enter); },
    exit(o) { calls.push(['exit']); this.state.room = 'out'; return wait(o && o.ms === 0 ? 0 : T.exit); },
    highlight() {}, setKodeshSmoke() {},
  },
  avodah: {
    yomKippur(step, o) {
      calls.push(['yk', step]);
      if (o && o.onCount) for (let i = 0; i < 8; i++) setTimeout(() => o.onCount(i), 400 + i * 550);
      return wait(T.yk);
    },
    bow() {},
  },
};
const now = P.get('now') ? () => new Date(P.get('now')) : () => new Date();
window.__SC = createScenes({ world, root: document.body, now, onClose: () => { window.__SC_CLOSED = (window.__SC_CLOSED || 0) + 1; } });
window.__SC_CALLS = calls;
