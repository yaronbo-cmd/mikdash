# The people and the wooden things (build 88)

All third-party art in the game since build 88 is **CC0 1.0** (public domain dedication: free for any use, commercial included, no
attribution required). We credit anyway.

| In the game | Source | Author | Licence | Fetched from |
| --- | --- | --- | --- | --- |
| `assets/man88.glb` — every man's body (the kohen, the crews, the people of the acts) | *Universal Base Characters* (Superhero_Male) | Quaternius (quaternius.com) | CC0 1.0 | github.com/Dallolz/moorfall-assets @ 1e83864 (`characters/Superhero_Male.glb`) |
| `assets/anim88.glb` — the way they move (walk, formal walk, push, kneel and work, pick up, interact, talk, sit …) | *Universal Animation Library* (UAL1) | Quaternius | CC0 1.0 | same repository (`animations/UAL1.glb`) |
| `assets/wagon88.glb` — the hand cart | *Medieval Village MegaKit* (free version), Prop_Wagon | Quaternius | CC0 1.0 | github.com/J-Ponzo/gltf-medieval-village-megakit @ 21104b4 |
| `assets/wood88a.jpg`, `wood88b.jpg` — the crane's timbers | the same kit's wood atlas (T_WoodTrim) | Quaternius | CC0 1.0 | same repository |

Made by `tools/people88-glb.mjs` and `tools/props88.mjs` (textures downscaled, meshes quantized and meshopt-compressed, only the clips the
game plays). The clothes are not from any kit: `src/game/people88.js` cuts them from the body at load — the kohen's כתונת of white linen
with sleeves to the wrist and long to the feet, the אבנט, the מגבעת, barefoot; a worker's knee-length wool tunic, belt and head cloth.
All of it is illustration (המחשה), its sources in the module's head.

Support the author: https://www.patreon.com/quaternius
