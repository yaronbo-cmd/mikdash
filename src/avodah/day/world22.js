/* world22.js — where the אמרכל may walk in the finished Temple (ENGINE22): the floors of the Temple Mount's courts, the walls and
 * every solid of avodah3d.js (the altar, the kevesh, the House, the Ulam — so the Heichal's door and the פרוכת past it are a wall
 * to the stick; the Kodesh HaKodashim block of stages.js stays too), and the sky for the game's hour. */
import { WALLS22 } from '../../avodah3d.js';
/** the floors: the azara · Nikanor's gate (the one opening in the east wall) · the courts east of it · Beit HaMoked · Lishkat HaGazit */
export const FLOORS = [[-187, -11, -67.5, 67.5], [-11, -8, -5, 5], [-8, 143, -67.5, 67.5], [-178, -142, -83, -67.5], [-100, -62, 67.5, 83]];
const inF = (x, z) => { for (let i = 0; i < FLOORS.length; i++) { const f = FLOORS[i]; if (x >= f[0] && x <= f[1] && z >= f[2] && z <= f[3]) return true; } return false; };
const inR = (r, x, z) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
/** stages.hero.twinExtra: true = the step is blocked (never off the Temple's floors; never into a solid he is not already in) */
export function blocked(x, z, x0, z0) {
  if (!inF(x, z) && inF(x0, z0)) return true;
  for (let i = 0; i < WALLS22.length; i++) { const r = WALLS22[i]; if (inR(r, x, z) && !inR(r, x0, z0)) return true; }
  return false;
}
/** the world's sky for a temple hour: night · dawn · noon · golden · dusk */
export function skyFor(h) {
  if (h >= 18 && h < 18.7) return 'dusk';
  if (h >= 18.7 || h < 4.2) return 'nightd';   // ── polish23 ── (the dark night: main.js TIMES.nightd)
  if (h < 6.4) return 'dawn';
  if (h < 15) return 'noon';
  if (h < 16.9) return 'golden';
  return 'dusk';
}
/** is (x, z) a free floor (on a Temple floor, in no solid)? — for a work's props */
export function free(x, z) {
  if (!inF(x, z)) return false;
  for (let i = 0; i < WALLS22.length; i++) if (inR(WALLS22[i], x, z)) return false;
  return true;
}
