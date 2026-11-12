# Round B: the Mount and the ground

Read `00-common.md` first. Hebrew spec sections 6 and 9. Starts only after the owner approved round A.

Today (shots in `/mnt/project-files/mikdash/look-sample/world-today.jpg`): the natural hill is a blanket mottled in green
and brown; sharp triangle creases show in its surface; on steep faces the ground texture, mapped from above
(`world.js buildTerrain`: `uv = x/30, -z/30`), smears into long vertical streaks; at walking distance the ground is flat
beige with black crack lines that repeat (`tex.js texGround`, `texRock`'s cracks); boulders sit ON the ground like on a
carpet, all one brown; bushes are green blobs.

Find first, and write down in the report, which meshes make the ground the player walks on in stage 01: the world terrain
(`world.js buildTerrain`), the natural hill of the `har` stage and its cut cells (`stages.js`: the hill, `field`,
`dirtTex = TX.texGround(97, 256)`, the 25×25 amah cells of the address book), and how `terrainColor` blends them.

Before set (at the round's base commit), 960×600, noon: the hero standing on flat ground (play camera), walking camera on a
slope, a steep face from 30 amot (`__T.look([360,10,470],[250,-40,330])`), boulders from 15 amot
(`__T.look([60,6,60],[40,1,40])`), a cut cell beside an uncut one, the zoom-out over the whole Mount
(`__T.look([750,380,850],[0,-20,0])`), a work site with trodden ground (course), the paved area's edge against the earth.

## B1. One ground material: `src/look/ground.js`
A single patched `MeshStandardMaterial` (one program) for the terrain and the natural hill, replacing `map: groundMap` +
vertex colours. Keep vertex colours as the large-scale tone (from `terrainColor`), add in the fragment shader:
- Three surface kinds blended by masks: ROCK (bare limestone: pale, bedded, pitted), EARTH (packed earth with dry grass
  stubble: warm ochre with straw-coloured flecks, very little green), GRAVEL (small stones and dust). Each has a colour +
  normal tiling set drawn on canvas (256² or 512²), three sets in all.
- Masks: slope (world normal.y): steeper than about 35° → rock, with horizontal bedding by world y; hollows and valley
  bottoms (existing `lush` logic) → darker earth; a low-frequency noise breaks the borders so no straight contour shows;
  a per-vertex or uniform-array "work" mask → gravel and trodden earth (B3).
- No stretch: triplanar (world x/z for flat, world y with x or z for steep), blend by normal. No visible repeat: sample each
  set at two scales (1 tile = 6 amot and 1 tile = 37 amot) and mix, with a hashed rotation per large cell if repeats still
  show in the zoom-out shot. Acceptance: in one play-camera screen no feature appears twice; from the zoom-out the Mount is
  not one flat tone and not a checkerboard.
- The black crack lines go. `texGround` and `texRock`'s crack pass are removed from the ground's path (keep what other
  materials still use; delete what nothing uses).
- 'low'/'normal': one scale per set, no normal maps, masks kept.

## B2. The hill's shape and colours
- Creases: where the play camera is close, the hill must not show triangle folds. Either raise the mesh density of the
  natural hill inside the Mount's bounds (the terrain grid is 260² over about 7,000 amot; the hill needs about 2.5 amah
  cells near the player: a separate finer patch following the hero, or a fixed finer mesh for the `har` area), or smooth the
  normals (analytic normals from the height function instead of per-triangle), whichever removes the folds in the shots at
  the lowest triangle cost. Heights at the address-book cell corners and under every act must stay EXACTLY as today: no
  act, figure or stone may float or sink (run the existing float/sink audit if the repo has one, and the bot).
- Colours (`terrainColor` and the hill's own): fewer random green/brown blotches. Tone follows the place: flat tops dry
  straw earth, slopes rock, hollows darker earth, green only as a thin tint in hollows. `TC.lush`/`TC.gA` toned toward
  dry olive. The owner's words: a rocky Jerusalem hill, not a lawn.
- Steep faces and cut edges: bare rock with horizontal beds (from B1), never smeared streaks.

## B3. Work sites, paths, ruts (the owner's question 3: yes)
- Around every active or finished work (the mission's stand and its act area, from `h109/model.js` PLAN positions and the
  address book) the ground is darker trodden earth with stone chips, radius about 8 amot, soft edge.
- Paths: trodden lines between the works the player has done and along the crews' and carts' fixed routes (take the routes
  from `crews.js`/`stages.js`, do not invent new ones); two parallel ruts on cart routes.
- Technique: one low-resolution mask texture over the Mount (e.g. 512² over its bounds, R = trodden, G = ruts), drawn on a
  canvas, updated only when a work starts or ends (not per frame), sampled by the ground shader. It persists with the
  world's state (derive it from the saved progress on load; add no new saved fields).

## B4. Boulders, bushes, small stones
- Boulders of the hill (the big ones of `stages.js setBoulders` and the sector rocks): use round A's `rockMat`; bed them:
  sink each 8 to 15% into the ground (visual only: where an act measures a rock, its game geometry and position stay), and
  draw a skirt: a soft dark earth ring on the ground under each (through the B3 mask or a blob decal), plus contact shadow.
- Scatter: small stones and pebbles near rock outcrops (one InstancedMesh, about 600 instances over the Mount, culled with
  the cells that get cut or paved).
- Bushes (the green blobs on the hill): low, ragged, grey-green shrubs: a flattened irregular clump of 5 to 7 tilted
  facets, two tones, a dark base. Same positions, one InstancedMesh as today. They vanish with their cell as today.

## After set and acceptance
Retake the before set. No streaks on steep faces, no crack lines, no triangle folds at play distance, no lawn green, no
rock on a carpet, nothing floating or sunk, the cut cells and the paved floor meet the ground cleanly. Bot replay of stage
01. Budget numbers.
