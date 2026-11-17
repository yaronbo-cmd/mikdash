# Brief: playable pour sample for stage 08 ("דגם היציקה")

A small standalone sample, NOT part of the game build. It tests one thing with the owner on a tablet:
**does a player understand, without words, why the molten mix stops and why a hollow is left.**
Approved spec: `docs/specs/shlav-08-he.md`, part 3 ("היציקה"). Read that part first.

## Deliverable

- Source in `samples/yetzika/` (`main.js`, `index.src.html`, `build.mjs`).
- `node samples/yetzika/build.mjs` writes ONE self-contained file `samples/yetzika/dist/yetzika.html`:
  three.js (from `node_modules/three`, already installed) bundled with esbuild and inlined, no network
  requests of any kind (no CDN, no fonts, no images, no audio files). Sound is synthesised with WebAudio.
- The file must also work when wrapped inside another document's `<body>` (it will be published as an
  artifact): do not rely on `<html>`/`<head>` attributes; put styles in a `<style>` tag and size the canvas
  from `window.innerWidth/innerHeight`, with resize handling.
- Expose `window.__yetzika` for testing: `{ state() }` returning
  `{ phase, filledFraction, hollowCells, cauldron: {amount, heat}, score, spout: {t, tilt}, patches }`.

## The scene

Landscape. One golden directional light plus soft ambient, low-poly, warm stone colours, the style of a
hand-built toy world. Court floor of pale stone slabs. On it one **segment** of the altar foundation:
a wooden frame (four thick boards) about 12 x 8 amot inside, 1 amah high. Inside: about 14 whole field
stones, rounded and irregular (NOT cut blocks; iron never touched them), big and small, placed by a fixed
seed so that they form two or three **narrow passages** leading to two back pockets. A few of the stones
have a slightly different warm tint ("the ones you dug yourself").

Beside the frame, on the camera side: a small fire with a clay cauldron on it, two whole low-poly crew
figures (head, body, arms, legs, simple robes) who tilt the cauldron into a **wooden spout**. A third
figure, the knocker, stands by with a wooden mallet. No iron tools anywhere.

Camera: behind and above the crew, looking down at the whole segment at about 50 degrees. Everything the
player needs is visible at the default view.

## The simulation (the heart of the sample)

A height-field fluid on a grid of about 60 x 40 cells over the inside of the frame.

- Each cell: `ground` (0 on the floor, higher under a stone, stones are tall enough that the mix never
  covers the big ones; small ones can be covered), `vol` (mix depth), `heat` (1 hot .. 0 cold), `solid`
  (depth that has hardened).
- Each step, mix flows from a cell to its 4 neighbours when its surface (`ground+solid+vol`) is higher,
  at a rate proportional to the height difference AND to fluidity. Fluidity falls steeply as heat falls
  (e.g. `fluidity = smoothstep(0.25, 0.8, heat)`), so cool mix is thick and piles up instead of spreading.
- Heat falls with time everywhere (faster in thin layers and at the advancing front, slower in deep hot
  pools); fresh mix arriving mixes its heat in by volume.
- When heat drops under about 0.2 the cell's `vol` turns into `solid` and stops moving. A narrow passage
  therefore **freezes shut** if only a thin trickle goes through it.
- Target depth is the frame height. A cell is "full" when `solid+vol` reaches ~90% of the free height.
- **Hollow** = a floor cell that is not full and can no longer be reached: every path to it from the spout
  edge is through hardened-full cells or stones. While a hollow region exists and its entrance has just
  closed, bubbles rise from the closed entrance and a bubbling sound plays.
- Tune so that: pouring everything from one spot at full tilt fills the near area fast, overflows nowhere
  (the frame holds it), but leaves at least one back pocket hollow; a thoughtful player (pour first toward
  the far pockets through the passages while the cauldron is hottest, move the spout, moderate tilt) fills
  everything with 2 to 3 cauldrons in about 60 to 90 seconds. Too much tilt in one place makes a visible
  mound (mix piles up); too little makes a trickle that hardens in the passage.

## The cauldron

Holds a fixed amount (about 45% of the segment's free volume). Its own heat falls slowly while it waits
and its mix comes out at that heat. When it is empty, or its heat is below ~0.35, the two crew carry it
off and bring a new hot one (about 3 seconds, the player just watches or moves the camera). **No timer on
screen, no fail screen.** Cold mix simply does not flow.

## What the player sees (the mix is the gauge; no HUD meters)

- Hot mix: bright orange-yellow, emissive, glossy, slight shimmer. Cooling: darker red-brown, duller.
  Hardened: matte grey-brown stone colour. The colour comes straight from `heat`.
- Wet/filled area clearly darker and shiny against the dry pale floor between the stones.
- The stream from the spout mouth: a visible ribbon of mix whose width follows the tilt and whose colour
  follows the cauldron heat; it lands on the cell under the spout mouth.
- A mound is visible as real height in the fluid surface mesh.
- Bubbles (small spheres rising and popping) where a hollow has been sealed.
- The cauldron itself glows less as it cools, and visibly empties.

Render the fluid as one dynamic mesh (grid vertices, heights from `ground+solid+vol`, vertex colours from
heat, hidden where there is no mix). Must hold 60 fps on a mid-range tablet: one simulation step per frame
with typed arrays, no per-frame allocations, at most one shadow-casting light (or baked/blob shadows).

## Hands

- **Left half of the screen (left thumb):** touch and drag. Horizontal movement slides the spout mouth
  along the near edge of the frame (parameter `t` 0..1 across the segment width; the crew and spout follow
  with a little lag). Vertical movement sets the tilt (drag up = more flow, down = less; releasing the
  finger eases the tilt back to zero, so nothing pours when nobody touches). The spout also reaches
  inward: more tilt throws the stream a little farther into the frame.
- **Right half (right thumb):** drag up/down raises and lowers the camera (pitch 35..80 degrees plus a
  little pull-back), drag left/right orbits a little (about +-35 degrees). The camera stays where it is
  left. The player can pour with the left thumb while the right thumb holds the camera: support two
  simultaneous pointers (Pointer Events, `touch-action: none`).
- **Mouse:** left button drag on the left half = spout, as above. Right-button drag anywhere or wheel =
  camera. No keyboard needed.
- No buttons on screen during play. First 4 seconds: a ghost hand hint on the left half showing the drag,
  disappears at the first touch.

## End of the segment

When no free mix is moving any more and either every floor cell is full, or the player has not poured
for 4 seconds while hollows are sealed (or the player has used 4 cauldrons): the knocker walks up and
taps the segment three times with the wooden mallet.

- **Full:** a deep, full wooden-on-stone knock, strong screen shake, the segment gleams, a full-screen
  burst (particles + a big word "מלא!") and +40 points (+20 more if only two cauldrons were used).
- **Hollow:** a clearly hollow, higher knock; the hollow cells flash through the surface for 2 seconds so
  the player sees WHERE the air stayed and which passage closed (highlight the closed passage). Then the
  crew take apart only this segment (the hardened mix lifts out in a few chunks), -20 points (never below
  zero), and the player pours again at once from the same place, with a fresh hot cauldron. After a repour
  the hardened mix keeps a slightly different tint ("the patch stays visible").
- After a full result: 3 seconds, then a small round "again" arrow (the only button, sample-only) to
  restart with a fresh segment.

## Shake, vibration, dopamine

- Screen shake = shaking the camera, on: each new cauldron set down (small), each knock (medium), the
  full result (strong). Also call `navigator.vibrate` where it exists (guarded).
- Immediate dopamine: when the mix first reaches each of the two back pockets and each far corner: a
  flash at the spot, a short rising tone, a short Hebrew word floating up ("הגיע!", "יפה!", "פינה!") and
  +10. Points shown as a small number that pops when it changes (top centre, plain, no panel).
- Sounds (all WebAudio, start the AudioContext on the first pointer down): fire crackle (quiet loop),
  pouring hiss that follows the flow, bubbling when a hollow seals, wooden knock (full / hollow variants),
  success chime. No metallic sounds at all.

## Not in the sample

No world, no address book, no other parts of the stage, no text explanations, no menus.

## Self-check before you report

- `node samples/yetzika/build.mjs` succeeds and the html opens from `file://` with no console errors and
  no network requests.
- With Playwright (already installed globally: `require('playwright')`, `chromium.launch()`), at
  1280x720: script a bad pour (full tilt at one spot until 4 cauldrons are used) and confirm via
  `window.__yetzika.state()` that hollows remain and the hollow ending runs; script a good pour and confirm
  a full ending is reachable. Take screenshots of: start, mid-pour, mound, sealed hollow with bubbles,
  hollow knock highlight, full result. Save them in `samples/yetzika/shots/`. Look at them yourself and
  fix what is unclear or ugly.
- Report: what was built, the tuning numbers, what you could not get right, and the screenshot paths.
  Do not commit and do not push.
