# Help from Gemini for stage 06, station 1 (the sea): code sketch, checked by Claude
Chat (ירון's Gemini, 14.11.2026): https://gemini.google.com/app/e62fff177e65e5f0
Asked: three.js r160, no build step, 30+ fps on a mid tablet, low-poly, one golden light. Sea, ship floating, rope that shows tension, mobile traps.
This is a SKETCH for the coder. It was read and checked but never run. Take the ideas, write the code in the project's own style, and read every place from BOOK.

## 1. The sea (one plane, vertex shader)
- One PlaneGeometry 240x240, 110x110 segments (about 24k triangles), `MeshStandardMaterial({flatShading:true, roughness:0.75, metalness:0.1})` patched with `onBeforeCompile`, so the game's light and fog still work. `mesh.frustumCulled = false`.
- One shared table, used by BOTH the shader and the CPU: `waves = [[dirX, dirZ, steepness, wavelength], ...]`, suggested `[0.85,0.52,0.28,26]`, `[0.40,-0.91,0.22,16]`, `[-0.70,0.71,0.18,9.5]`, `[0.15,0.98,0.12,5.2]`.
- Gerstner term:
```glsl
vec3 gerstner(vec2 pos, vec4 w, float t, float ampScale){
  float k = 6.28318 / w.w; float c = sqrt(9.8 / k); vec2 d = normalize(w.xy);
  float f = k * (dot(d, pos) - c * t); float a = (w.z / k) * ampScale;
  return vec3(d.x * a * cos(f), a * sin(f), d.y * a * cos(f));
}
// in begin_vertex: ampScale = mix(0.35, 1.35, uStorm); transformed += sum of 4 terms
```
- The big wave the player must read from afar: a travelling Gaussian packet, triggered from JS with a direction and a start time.
```glsl
float age = uTime - uRogueStart;            // uRogueCfg = (height 4.8, width 14, speed 11, spawnDist 85)
if (age > 0.0 && age < 25.0){
  float front = -uRogueCfg.w + age * uRogueCfg.z;
  float dist  = dot(p.xz, uRogueDir) - front;
  float env   = exp(-(dist*dist) / (uRogueCfg.y*uRogueCfg.y));
  offset.y += uRogueCfg.x * env;
}
```
- Foam: `vCrest = offset.y`; in `color_fragment` mix deep colour and foam colour by `smoothstep(th-0.5, th+0.6, vCrest)`, `th = mix(1.4, 2.2, uStorm)`. Deep colour `mix(vec3(0.03,0.22,0.32), vec3(0.02,0.08,0.12), uStorm)`.
- Sky: lerp `scene.background` and fog colour between golden (0xd99b52) and storm grey (0x1f2933) by `storm`; light intensity 2.4 down to 0.65.

## 2. The ship floats (CPU, same waves)
- `sampleWaveHeight(x, z, time, storm, rogue)`: the same sum with `sin` only (height), plus the same Gaussian packet.
- Sample 4 hull points (bow, stern, port, starboard; half length 5.5, half width 2.4), then
  `targetY = average - draft`, `pitch = atan2(hStern - hBow, 2*l)`, `roll = atan2(hPort - hStbd, 2*w)`.
- Heavy things move late: `alpha = 1 - exp(-k * dt)`, `k` about 2.2 for height and 1.6 for angles (lower = heavier). Frame-rate independent.

## 3. The rope that is the gauge
- Not TubeGeometry. One fixed ribbon per rope: 12 segments, 26 vertices, positions rewritten in place each frame (`needsUpdate = true`), no allocation.
- Shape: straight line between the two ends minus `sag * 4t(1-t)`, `sag = pow(1 - tension, 1.8) * 1.1`.
- Tension shown by: sag (slack hangs), colour (dark hemp to pale above 0.75), tremble above 0.72 (`sin(time*55 + t*12) * amp`), thinner when tight. Snap at 0.98: two halves whip and fall.

## 4. Mobile traps
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`.
- Keep `highp` in the sea shader (medium precision breaks derivatives far from the origin).
- No real-time shadows on the sea; a dark blob under the doors and mast instead.
- `alpha:false`, `powerPreference:'high-performance'`.

## Claude's check notes (fix before use)
1. Gemini replaced `#include <normal_fragment_begin>` with its own world-space normal. That is wrong twice: the chunk also declares variables later chunks need, and the lighting expects view-space normals. Drop that replacement; `flatShading:true` already gives flat facets.
2. The CPU height ignores the sideways Gerstner shift, so the ship can sit a little off the drawn crest when steepness is high. Keep steepness sum under about 0.8, or iterate once (sample at x minus the shift).
3. The shader also shifts the big wave sideways (`offset.xz -= ...`) but the CPU version does not. Remove it in the shader or add it in both.
4. The ribbon is thick only in Y, so from the raised camera (right thumb) it is nearly invisible. Offset the two edges along the camera's right vector, or use two crossed ribbons.
5. `new THREE.Color()` inside `update` allocates every frame. Make the colours once.
6. The snap threshold belongs to game logic (the spec: over-tension frays, then tears), not to the drawing class.
7. Wave numbers are in "world units", not amot. Rescale to the sea sheet and the ship size from BOOK.
