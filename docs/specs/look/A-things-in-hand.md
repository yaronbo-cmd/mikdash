# Round A: what the player holds: building stones, paving slabs, rocks, waste, tools

Read `00-common.md` first. Hebrew spec sections 3, 4, 5, 12. This is the round the owner feels most: today every stone he
touches is a sharp box in one flat grey (`props.js` `M.stone` = '#BFB39A', flatShading, no map), while the world's big walls
already carry a drawn Herodian ashlar (`tex.js` `texAshlar`).

Before set (take first, at 98897db), 960×600, noon: course (stock row + wall, and a stone on the rope), pave (pile + half
laid quarter, and a lifted slab), read (whole rock, and after the split), waste (pit half full, and covered), corner (stone
on the crane, and set), great (stone on the track), rope/rocks (a sector with rocks), one stage 02 act (lever or plumb: wall
stones), one stage 03 act (steps), a crew's cart with stones and a crew pile in the world.

## A1. One stone system: `src/look/stone.js`
One module that owns the look of every dressed stone in the game.

Material `stoneMat(THREE, Q)` (one shared program for meshes, the same code path for InstancedMesh):
- Base colour cream-white Jerusalem limestone: around hsl(40, 16%, 80%). NOT the old grey, not honey gold.
- Detail from ONE tiling set (colour + normal, 512², drawn on canvas): pecked limestone (fine pits, a few soft veins, sparse
  fossil flecks). Mapped by box projection in object space multiplied by the object's scale (take the scale from the
  model/instance matrix column lengths in the vertex shader), so the grain has the SAME size on a 1-amah stone and on the
  great stone, and never stretches. One tile = 2.5 amot. Patch with `onBeforeCompile`, keep `MeshStandardMaterial` lighting,
  shadows, fog and tone mapping intact; set `customProgramCacheKey`.
- Per-stone variation with no per-stone texture: the tint comes from `material.color` (clone per mesh, shared program) or
  `instanceColor`. In the shader derive a stable pseudo-random from that colour to (a) offset and quarter-turn the box
  mapping, (b) shift value ±3%. It must not change while the stone moves, turns or is scaled by an animation.
- Faces: on the two long vertical faces a smooth drafted margin band around a rougher, slightly darker boss: compute in the
  shader from the face's own 0..1 coordinates with a margin of fixed width in amot (0.22 amah, from the scale), a 0.04 amah
  soft step; boss normal detail ×1.6, margin shows fine diagonal chisel strokes (procedural stripes, 14 per amah, faint).
  Top, bottom and end faces: comb-chisel strokes only, no margin. The geometry's raised boss (below) carries the real edge.
- Dust at the foot: a soft darker, warmer band on the lowest 12% of the vertical faces, strength from a uniform/attribute
  `uSet` (0 for a fresh stone on the pile or on the rope, 1 once it is laid). Fresh stones are 4% lighter and cleaner.
- 'low'/'normal' quality: no normal map, strokes and margin by colour only.

Tints: `stoneTint(seed)` returns one of 8 tones (lightness 76..84%, hue 34..46, saturation 10..22%: creamy, slightly pink,
slightly yellow, slightly grey), and `neighbourTint(prevIndex, seed)` never returns the neighbour's tone. Use it wherever a
row of stones is created (course stock, wall stretches, steps, parapet blocks).

Geometry (unit size, scaled by the callers exactly as today, so no call site changes its maths):
- `ashlarGeo()` replaces `stages.js` `ashlarGeometry()`: a unit box with chamfered edges (one chamfer segment, width 0.035
  of the unit before scale) and on both long faces a boss raised 0.03 with its own chamfer; a thin top bed as today. Flat
  normals on faces, smooth across the chamfer. At most 140 triangles.
- `plainGeo()`: the chamfered unit box without boss (ends, fillers, the corner block, parapet).
- Chips: `chipGeo(k)` 3 variants of `ashlarGeo` with one upper corner knocked off (a small triangle cut). About one stone in
  five gets a chipped variant, chosen from the stone's seed. The bounding box and the bearing faces stay exact: the
  minigames' fit tests do not change.

Hooks (the only edits outside `src/look/`):
- `stages.js`: `ashGeo = ashlarGeometry()` → the new geometry; the instanced `props` material → `stoneMat` (keeps
  `instanceColor`; review the per-instance colours it sets today so the crews' stones land in the same 8-tone range);
  `api.ashlar` hands out the new geometry and material. Delete the old `ashlarGeometry`.
- `h109/props.js`: `M.stone` and `M.stoneD` are deleted. `M.ash` = `stoneMat`. `h109/acts3.js` `stoneMesh`, the corner block
  (`trumpetCorner`: `mat`, `dark`, the box helper), the parapet, the 16 uses of `M.stone`/`M.stoneD` in `acts2.js`,
  `acts3.js`, `props.js` each get the right new thing: dressed stone → `stoneMat` clone with a tint; rough lumps → A3.
- `h111/world.js` lines 31 and 80, `h112/world.js` 49 and 277, `h113/world.js` 32: they already prefer `M.ash`; make sure
  they get a tinted clone per stone (a helper `X.props.ashOf(seed)`), and remove the `|| X.props.M.stone` fallbacks.
- The great stone (`acts3.js` `greatMat`, line ~729) and the corner stone: same family, margin 0.3 amah, boss lower (0.02),
  tint from the light end of the range. The corner stone's gold mark stays. The inscription face ("לבית התקיעה",
  `face` with `emissiveMap`) keeps its carved letters readable: check the shot.

## A2. Paving slabs
`h109/acts2.js` `slabMesh` (line ~519), the quarter mesh `h116-quarter` (~588), crew slabs (`placeCrew`), and the world's
finished paving it must meet (`tex.js` `texPaving`, material `pave`).
- Geometry: chamfered slab (`slabGeo()` in `stone.js`), unit size, top edges chamfered 0.03, sides flat; thickness visible
  when lifted. The broken slab keeps its broken shape and gets a real dark crack line across the top (geometry seam or shader
  line along the break), visible from the play camera so the player can spot it himself.
- Material: `stoneMat` variant `slab` (same program if possible, a define at most): top face smooth-worn: weaker normal
  detail, fine chisel, soft tonal clouds; sides rough-pecked. No margin, no boss. 4 tone families via the tint.
- Joints: laid slabs keep a 0.02 amah dark gap (the mesh is that much smaller than its cell; the bed under it dark).
  When a quarter is finished, a thin light dust line fills the joints (one plane with a line texture per quarter, or the
  bed's colour lerps to dust): finished paving reads as one floor, and next to the world's `pave` floor there is no seam in
  tone: sample both in a shot and match within the eye's tolerance.
- The 7 sizes: grain never stretches (the box mapping by scale gives this for free; verify on the 3×3 slab).

## A3. Rocks, split halves, chunks, the pit, cut cells
- Rocks (`h109/props.js` `rockGeo`, instanced `h109-rocks`; `acts2.js` `rockMat` line ~57 with `texRock`; `rock.js`,
  `wedges.js`): new `rockMat` in `src/look/rock.js`: box-projected `texRock` by scale (no stretch), weathered skin: up-facing
  facets darker, grey-brown with lichen flecks (by world normal.y), horizontal bedding lines by world y (soft, 3 per amah,
  irregular), `instanceColor`/`color` tint so no two rocks share a tone (range: hsl 30..42, 10..18%, 52..66%). Keep
  flatShading facets: they suit the style.
- Fresh break: the faces born when a rock splits (reading game) and the faces of chunks are FRESH: near-white cream
  (hsl 42, 14%, 86%), clean, sharper grain, no skin. If the split halves are separate geometries, give the cut faces a
  vertex-colour flag or a second material group; if the cut is a plane inside one mesh, mark by the local side of the
  split plane. The player must see at a glance which face is new.
- Halves dressed by the quarrymen: as they are worked, lerp skin → fresh → `stoneMat` look (reuse whatever progress value
  the act already has; do not add game state).
- Chunks and waste (`h109-chunks`, `heapMesh`, `pileSync`, the sledge loads at `acts2.js` ~1060 and ~1085, which are plain
  boxes today): rough lumps (`geo.chunk`) in fresh tones, mixed sizes (three scales), `instanceColor` variation. The two
  box-shaped waste stones become lumps too (same footprint for the game's maths).
- The pit (`acts3.js` ~82: `earth`, `heap`; build 117 weak point "covered pit fill flat grey"): fill shows as rubble: the
  existing piling stays, its top surface gets lumps poking through earth; when covered, a packed-earth cap in the ground's
  tone with a few stones showing, edge blended into the ground (a soft-edged decal ring), no hard rectangle.
- Cut-cell walls and floor (build 117 weak point "cut-cell walls stretched texture"; find where a cut cell's walls are
  built, the slope/sector code in `h109/slope.js`, `props.js` or `stages.js`): walls = quarried rock: box-projected rock
  texture by world position, vertical tool strokes (pick marks, 8 per amah, irregular), fresh tone darkening a little toward
  the top edge; floor = levelled rock, fresh tone, faint parallel dressing strokes. No flat grey panel anywhere.

## A4. Wood, rope, iron, cloth
`h109/props.js` `M.wood`, `M.woodD`, `M.rope`, `M.cloth`; cranes and treadwheels (`acts3.js` 17 to 32), carts, sledges,
rollers, stakes, wedges (`wedgeMat`), the world's own cranes and carts in `stages.js` if they use plain colours.
- Wood: `src/look/wood.js` `woodMat`: grain along the member's longest axis (from scale, box mapping), `tex.js` `texWood`
  as the base improved with knots and darker growth lines; end faces lighter with rings. Two tones (new oak-ish, weathered).
  Wedges: fresh cut wood, lighter.
- Rope: twisted strands as diagonal stripes along the rope (procedural, period 0.25 amah), slightly fuzzy value noise. The
  hanging rope stays as thick and visible as today.
- Iron (hooks, bands, crowbar, chisels): dark grey, metalness 0.6, roughness 0.5, small bright edge wear.
- Cloth (the marker's red cloth, awnings): weave lines and soft fold shading; colours unchanged.

## After set and acceptance
Retake the before set. In every pair: no flat single-colour stone, no razor edge, no stretched grain, no two neighbours in
one tone, green marks readable, nothing floating. Then the bot plays the whole of stage 01 (touch 960×600) and the stage
02 to 04 acts open and finish as before. Report the budget numbers.
