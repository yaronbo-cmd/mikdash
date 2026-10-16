# הצוותים — the building crews, seen at work (Phase A)

Owner of this layer: the CREWS agent (Sprint 3, wave 3, 25.9.2026). **Everything here is a draft (טיוטה) for the owner.**
The game numbers (crews, caravans, training) are unchanged; this layer only makes them visible.

## What the player sees
| game number | in the world |
|---|---|
| **n crews at a building site** (`G.crews[i].at = site`) | 4–5 people per crew, each crew in its own colour of head cloth and belt, by its number in the game (crew 1 blue — the builder's own colour, 2 red, 3 green, 4 ochre), so a crew keeps its colour when it moves to another site: the foreman with his rod, masons with hammer and chisel (a swing loop, dust at each blow) — every other one up on the scaffold boards of the faces the site's camera sees, following the rising lifts, the others at blocks on the ground — carriers walking loops from the site's stone pile to the wall, two sawyers with a two-man saw on a cedar beam on trestles, a rope team holding tag lines to the crane's hanging block. |
| the site's phase (`יסודות · מבנה · גימור`, from the world's shown progress) | foundations: pick-axes and baskets of earth carried from the trench to the spoil heap; structure: as above; finishing: finer, faster blows and baskets (lime, chips) instead of stones. |
| a site completes | its crews cheer (arms up, jumping) for ~3 s, then walk off; the game sends them to their next site, where they walk in. |
| **crews in the quarry** | per crew: a pick man at the rock face, a splitter hammering the block on the ground, a carrier taking blocks to the stock pile (the piles themselves are stages.js, sized by the stone in stock); a lever man with the second crew. |
| **a caravan out** | a train of three two-wheeled ox carts, a driver with a goad beside each yoke. Sent: it leaves the site's bay empty, turns, and drives west along the outer lane, out through the western gate and over Wilson's causeway into the Upper City. Beyond the city it is not drawn. It comes back over the causeway, loaded, in through the gate and east along the inner lane, and **arrives at the bay of the site the goal points to exactly when the game's timer ends** — dust, the drivers raise their goads. |
| **a caravan back** (waiting) | the loaded train stands at its bay (each route has its own bay along the lane north of the courts). |
| **collected** | each driver takes the loads off his cart one by one (a block or a log on the shoulder, whole stones in the arms) and sets them down by the lane toward the site; the empty train then turns and drives away. |
| a short trip (the demo mode runs every timer ×60) | the train only rolls out of its bay and fades, and fades in on the lane to roll back in. |
| the arrival | dust, the drivers raise their goads, the site's foreman turns to the train and points with his rod. |
| cargo | wagons (עגלות המחצבה): dressed blocks · cedar (ארזים מן הלבנון אל ים יפו): long logs · Alexandria: a bronze door leaf (Nikanor's doors) · Beit Kerem: whole field stones. |
| **priests in training** (`G.train`) | young kohanim in white with hammer and chisel at practice blocks, and their master with a rod, in the azara's south side beside the Lishkat HaGazit. |

Readability on a phone: beyond ~220 amot people grow a little (up to 1.35× life size at ~550), a site at work puffs a little
dust that is seen from afar, and each site's ground crews stand where the site's own camera (`stages.focus`) sees them — the
court walls hide the floor behind them (the altar's setters work its west and north faces, the chambers' crews the court in
front of the slaughter area).

The crews are drawn only while the world is in its building phase (`life.phase === 'build'`). `stages.demoMode()` — the whole-Temple
view, Phase B, the tour — hides them all by itself (0 draw calls); when Phase A comes back (`startGame` → the game's full sync) they return.

## Sources and illustration choices (for the card writers and the owner)
- The House itself was built by kohanim: "he also prepared a thousand sacerdotal garments for as many of the priests, and had some of
  them taught the arts of stone-cutters, and others of carpenters" (Josephus, Ant. 15.11.2); the temple "was built by the priests in a
  year and six months" (Ant. 15.11.6). So the crews at the **Ulam, the Heichal and the Kodesh HaKodashim wear the kohen's white**, and the
  trainees learn masonry. The yard is by the **Lishkat HaGazit**, where the Sanhedrin "ישבת ודנה את הכהונה" (Middot 5:4).
- The altar: "אבנים שלמות, שלא הונף עליהן ברזל" (Middot 3:4). At the altar's four stages **no iron is used and no stone is dressed**: the
  setters tap whole field stones with wooden mallets, carriers bring whole stones in their arms, and in the finishing phase baskets of lime
  (the whitewash, Middot 3:4 "ומסיידין אותו").
- The wagons: "הורדוס הכין אלף עגלות להבאת אבנים" (Josephus, Ant. 15.11.2, in the game's free translation). Cedar: Ezra 3:7.
  Nikanor's doors from Alexandria: Yoma 38a. Beit Kerem: Middot 3:4.
- **Illustration (⚑ owner):** the road (Wilson's causeway → the western gate, "שער קיפונוס במערב", Middot 1:3 → two lanes north of the
  courts); the crews' colours; the workers' dress (a knee-length tunic, head cloth and belt, barefoot on the Mount — Berakhot 9:5); the
  roles per crew; two-wheeled carts with a yoke of oxen; the kohanim building in their garments.

## Code
- `src/crews.js` — `createCrews({ scene, camera, life, stages, actors, animals, terrainH })` →
  `{ setCrews(siteId, n), setQuarry(n), caravan(routeId, state), trainees(n), cheer(siteId), update(dt), reset(), setEnabled(bool), stats }`.
  `caravan` state: `{ status: 'out', left, total, site }` (ms) · `{ status: 'back', site }` · `'collected'` · `'none'`.
  Its own `createActors` instance (dress kinds `worker` and `kohen`; one draw call per kind in view + one for every tool and prop), its
  own `createAnimals` instance (the oxen: one draw call), two instanced meshes for the carts (bodies, wheels), one Points object for dust.
  Per-instance frustum and distance culling (actors/animals 700; tools only within 300 amot — every item instance runs every item's
  vertices); no per-frame allocations. Site layouts (`SITES`) are hand-placed on open ground outside each footprint and beyond its
  scaffold, clear of the builder's spot; the Mount's crew works the boulder the builder works (on its far side).
- `src/actors.js`, block `// ── crews items ──`: items `hammer mallet chisel pick saw stone fieldstone basket beam door` (low-poly) and the
  dress `worker`. (`rope`, `log`, `staff` were there already and are used as they are.)
- `src/main.js`, block `// ── crews ──`: creates the layer, registers `crews.update` as a life updater, sets `stages.setCrews / setQuarry /
  caravan / trainees / crewsCheer`, exposes `__T.crews`.
- `src/game/index.js`, marked `// ── crews ──`: `syncCrews(force)` pushes the numbers when they change (every tick, and right after a crew is
  moved, a caravan sent, a priest put to training, a stage started or completed, the first crew's arrival); `force` from `syncWorld` (load,
  mode switch, new game, resync) and from the welcome-back; `W.caravan(r, 'collected')` on collect; `W.crewsCheer(id)` on completion;
  guarded world calls `setCrews / setQuarry / caravan / trainees / crewsCheer`.
- Read-only use of stages.js: `groundAt`, `status(id).shown`, `boulders`, `hero.at / position`, and, guarded, the public API added in wave 4
  (World agent): `stages.crane(out)` → `{ site, x, y, z, carry }` (the site the crane serves and where its block hangs, filled into one
  object — no allocation per frame; without it the tag lines go to a fixed point over the crane) and `stages.scaffold(id)` → `{ runs, lift,
  gap, rows, view, bottom, top, shown, status, level(run) }` (the scaffold runs on the faces the site's camera sees, and the board below the
  rising masonry, where stages.js stands its own masons; without it every mason works on the ground). No `_dbg` reads are left.

## Tests
- `node test/crews.cjs lab [sheet]` — the lab scene (`test/crews-lab.html`, plain floor or `?temple=1`): sheets `site phases altar quarry yard
  kohanim har flow caravan` → `test/out/crews/lab_*.png` (flow: a departure, the unloading, the empty train leaving, a ×60 demo trip).
- `node test/crews.cjs real [phone|desktop]` — the real build (`dist/test.html`): the game's fixtures drive the crews through the world
  (the Mount's first crew, the wall with three crews and the quarry, the cedar train parked and the wagons arriving, a cheering site, the
  altar and the training yard, the Heichal's kohanim); checks the numbers, the cheer, the whole view hiding them, draw calls per view
  (≤ 150); shots `test/out/crews/real_*_{phone,desktop}.png`. A full-world frame that takes minutes on a loaded machine skips its shot.
- Measured (25.9, SwiftShader): the layer adds at most 6 draw calls (worker, kohen, tools/props, oxen, carts, wheels) + 1 (dust); totals
  56–84 per view on a phone, 58–64 on a desktop, 117 in the whole view (crews hidden), 66 for the Mount of Olives view with the crews
  (112 without the game). About 40 figures at most (4 crews × 5, 3 trains × 3 drivers, 2–7 trainees) and 18 oxen.
- `node test/crews.cjs` — both.

## Wave 4 (World agent, 26.9)
- **The site cameras** (`stages.focus`, phone 390×844), so a player sees people building: the wall frames its working face north of the
  courts (the builder, the crane, the crews, the stone pile — `DEF.wall.frame`), not the whole 340-amah courts; the altar's four stages look
  from the north-east (az −60), clear of the Nikanor gatehouse that hid the altar from the old east view, and its crews moved to the east face
  (south of the builder) and the north face; the Heichal looks from the east-north-east and higher (az −30, el 34) over the north wall and its
  chambers, framed on the court north of the house and the rising north face (`frame.y: 'reveal'`). The key moments still frame the whole
  site (`momentFX('frame')` passes its own ndc).
- **The Coponius gate**: a 14 × 22 opening in the western wall at the causeway (mount.js, z −66…−52; its size an illustration), so the trains
  drive through it; `inWall` hides only what crosses the wall's line elsewhere.

## Open / requests
- stages.js: ~~public `crane()` / `scaffold(id)`~~ and ~~the focus framing~~ (done in wave 4, above); still open: an option to thin out the
  generic workers where crews stand (`stages.setWorkers(n)`), if the owner finds a site too busy.
- While a long trip is on the road beyond the city, its train is not drawn (⚑ owner: a far road in view, or a HUD map).
- ~~mount.js (WORLD): an opening in the western wall at the causeway (the Coponius gate)~~ — done in wave 4.
