# MUSIC — the original, adaptive score (MUSIC8B, wave 8B; WORLD12, wave 12: a pulse)

**Wave 12.** The owner, 29.9: "המוסיקה - האם לא צריך מוסיקה יותר קצבית ומעניינת?" The building's music now runs at 104.65 BPM
(was 70) over grooves in the manner of the maqsum and the baladi, with a darbuka, a walking nevel bass and one short original
motif that returns; it grows with the work (strikes per minute), a fill ends each course, and three states are new: `chag`
(festive), `quarry` (the quarry's cycle games) and `shir` (the Levites' daily song, AVODA12). Measured from offline renders
(test/music.cjs): see "Tests".

The owner asked for "מוסיקה נלווית מותאמת" (28.9): music that goes with the game and adapts to it. This is it.
- It is procedural WebAudio in `src/game/music.js`, wired in main.js `// ── music ──`.
- It uses no audio files and no paid services.
- Everything is original: no existing melody, no liturgy, no Divine Name.
- **Draft (טיוטה).** Instruments and modes are an illustration choice (`illus`), not a reconstruction. The Second Temple's
  actual music is not known.
  - The instruments are the ones the Mishnah names for the Levites: nevel and chalil (Arakhin 2:3), kinnor (Arakhin 2:6).
  - The frame drum (tof) comes from the biblical texts (Exodus 15:20; Psalms 150:4). Because it is not on the Mishnah's
    list, it plays only in Phase A's building music, never in Phase B's service.

## The ensemble (all synthesized)

| instrument | how | range | where |
|---|---|---|---|
| **kinnor** (a plucked lyre) | Karplus–Strong: a noise burst through a delay loop that loses a little each period, with a pick-position comb. Ten strings are rendered once into buffers of 1.25 s (22 kHz) and repitched by up to ±2 semitones. A small peaking "wooden body" and a softer top shape the tone. | D3–D6 | ostinati, strums, the stones' phrase |
| **nevel** (a lower harp) | the same method: darker, longer (T60 2.6 s), 9 strings | B1–G4 | the harmony's root, the precision ostinato |
| **chalil** (a reed flute) | ONE monophonic voice per state that glides between notes: a 5-harmonic periodic wave, a 5 Hz vibrato (±11 cents), and a breath of band-passed noise with a chiff at each attack | B4–D6 | the melodies |
| **tof** (a frame drum) | dum (a pitch-dropping boom plus the frame's knock at 2.3× and 3.6×, audible on a phone's speaker), tak (a rim resonator at 1.75 kHz), a ghost stroke; rendered once | — | the pulse |
| **drone** | 2–3 soft "hum" oscillators (5 harmonics) under a slowly breathing low-pass | the root and its fifth | the bed |
| **darbuka** (wave 12) | a goblet drum, rendered once: D a tight dum (a 200 → 92 Hz sweep), T the tek (a 3.3 kHz crack with an 820 Hz ring), k the ka of the other hand, r a roll (two ka in a sixteenth) | — | Phase A only: the building from intensity 1, the board, the quarry, the chag |
| **tziltzal** (wave 12) | a bronze cymbal, rendered once: nine inharmonic partials (431 Hz – 9.1 kHz) dying at their own rates, a hiss on top | — | the chag's phrases; once as the shir begins (Ben Arza, Tamid 7:3); the fill |
| **the silver trumpets** (wave 12) | two brass oscillators (13 harmonics at 1/n^0.75), detuned −6/+7 cents, a lip's scoop into the note, a filter that opens with the blast, vibrato on a long note | the state's root + an octave | `cue('blast', 1)` a tekiah, `cue('blast', 3)` tekiah-teruah-tekiah (Tamid 7:3; Numbers 10:2) |

- One procedural reverb (a 1.3 s mono impulse whose tail darkens: the courts' stone) is shared by every state.
- A limiter comes last.

## The modes, and why these keys

| state | mode | key | tempo | texture | when |
|---|---|---|---|---|---|
| **build** | Dorian | B | **104.65** (was 70) | a maqsum-like tof (D.T.g.T.D.g.T.g.), a syncopated 3+3+2 kinnor ostinato, a walking nevel bass (cut short, it grooves), chalil on the answers in 3+3+2 figures; **intensity 1** (at work): + the darbuka's tek-ka; **intensity 2** (in the flow): + the darbuka's full pattern, the second ostinato every other phrase, and **the motif** at each cycle's start | Phase A by day |
| **board** | Phrygian | C# | 112 | a 3+3+2 tof, + a light darbuka (wave 12), a faster ostinato, chalil in 3 of 4 phrases | a match-3 board is open (`m3open` … `m3close`) |
| **quarry** (wave 12) | Dorian | E | 118 | a saidi-like dum-dum on the tof, a bright darbuka, a bouncing lyre, the chalil in 3 of 4 phrases | FUN12's cycle: the sling and the stack (`m3open {field:'quarry', game}`); the cycle's board keeps `board` |
| **chag** (wave 12) | Ionian (major) | D | 120 | a baladi on the tof and the darbuka, the tziltzal on each phrase, strummed kinnor, the motif at every return of the theme | 9 s after a key moment is done or a stage is done; the finale's night of light (`celebrate {on}`, `finale`) |
| **shir** (wave 12) | Aeolian | B | 92 (AVODA12's lane: `shirStart {bpm}`) | kinnor strums and the line on the kinnor (nine kinnorot or more, Arakhin 2:5), nevel, one tziltzal as the song begins; the chalil only on its twelve days (`shirStart {chalil:true}`, Arakhin 2:3); no drum | Phase B: the Levites' song (`shirStart` … `shirEnd`) |
| **precision** | Phrygian | F# | 96 | a ticking tof, a low F#–G ostinato (the ♭2 is the tension), sparse high pings, no melody | a precision game's sheet is open (`.fx-mg`, or `minigameStart` … `minigame`) |
| **moment** | Ahava Rabbah (freygish) | D | 72 | a swell: the drone rises over 6 s, a kinnor tremolo, a noble chalil line, a tof roll at the phrase end | `momentStart` … `moment`, the opening vision, the reveal, the whole finished House (the menu's "תצוגת הבית השלם") |
| **night** | Dorian | E | **69.8** (was 60; one beat = one swing) | wave 12: a soft heartbeat on the tof (dum on 1, tak on 3), the lyre in eighths, long reverb, the chalil on the answers; the darbuka's whisper when he works by night (intensity 1), the motif in the flow (2). The owner played v21 at 21:01 — on the old night state (60 BPM, no drum) | `timeOfDay: 'night'` (the real clock) |
| **phaseB** | Aeolian | B | 54 | a strummed chord per bar, low nevel, the drone; no drum (the Levites' instruments only) | Phase B, "העבודה בבית", and the Temple tour (`body.sc-on`) |
| — | — | — | — | silence | muted, volume 0, the page hidden |

- **Why these keys.** The sound kit's chimes are pentatonic:
  - on A: the strikes;
  - on D: the tiers, the board's win;
  - on E: every match on the board.

  So each state's pitch set holds its sounds:
  - B Dorian and C# Phrygian have A major's notes, which hold all three pentatonics;
  - F#, E and B hold D major's notes.

  The moments' fanfare and "solemn" chord are on D, hence D freygish.
- **The build's tempo (wave 12).** 104.65 BPM = 3 × 60 / (2 × 0.86): three beats are exactly two hammer swings
  (content.js `RHYTHM.cycle` 0.86 s), so the hammer falls on every dotted quarter — a 3:2 with the groove, the most consonant
  cross-rhythm there is — and the music never pulls against the ring. (Wave 8B had one beat = one swing: 70 BPM, which the owner
  found slow.)
- **The work's intensity (wave 12).** The game's `strike`/`stroke` events (≥ 250 ms apart count once) over the last 20 s:
  under 9 a minute → 0 (calm), 9–39 → 1 (at work), 40 and more, or a combo of 6 → 2 (in the flow). It rises at once and falls
  after 8 s, so the groove never flaps. `music.get().intensity`.
- **The motif ("מוטיב הבית", wave 12).** One short original figure in two bars — degrees 4 4 5 · 4 2 3 (3+3+2, 3+3+2 sixteenths)
  · 4 7 6 5 4 — on the chalil, doubled on the kinnor. It returns: the building's cycle opens with it when the work runs, and the
  chag opens three of its four phrases with it. It is not an existing melody.
- **The fill (wave 12).** Each course (`course`): a darbuka roll over two beats (k k T k T T rr) into a dum, the low nevel and
  the cymbal; the groove's drums rest under it.
- **Moving between states.** A crossfade of 2.5 s; 3.5 s into a moment, 3 s out of it, and 0.9 s to silence.

## Form: how a melody is made (original, seeded)

- **A phrase is 4 bars** over a modal progression. Examples:
  - build: i–IV–i–VII (Bm E Bm A);
  - board: i–♭II–i–i (C#m D C#m C#m), or an Andalusian-like i–vii–VI–♭II;
  - moment: I–vii–♭II–I (D Cm E♭ D).
- **The chalil's line** is a seeded walk:
  - strong beats land on the nearest chord tone;
  - the other notes step by the contour cells (±1, ±2, a repeat);
  - rhythms come from cells per character (calm, lively, noble, slow).
  - A **question** ends on the fifth, an **answer** on the final (tested over 59 seeds).
- **A cycle is 4 phrases: A (question) · A′ (the same opening, answered) · B (new) · A′.**
  - The theme renews every third cycle, so a session never loops a fixed tune. The same seed plays the same music (tests).
- **Texture per phrase** (the `plan`): full, light (no ghost strokes, a thinner lyre), or a breath (no drum, the lyre on
  the beats). The cycle's third phrase plays a second ostinato. The music ebbs and flows instead of droning.

## Cues on the game's beats (bus/DESIGN8B.md, the Mount's storyboard)

| event (existing) | the music |
|---|---|
| `boulder` (a boulder splits) | on the next sixteenth: a dum, the low string, the chord |
| `stoneSet` (by the player; crews are skipped) | a low dum and the next note of an 8-note phrase (0 2 4 3 5 4 6 7): eight stones sing it whole, with its root |
| `phase {ph: 'courses'}` (a site's ground is ready), or a `reveal` event | the moment swell for 6.5 s, then back |
| `course`, `stageDone`, `chapter`, `m3Won` | a flourish: a run up the mode on the kinnor, and a dum |
| `course` (wave 12) | + the fill |
| `moment` (done), `stageDone` (wave 12) | the chag for 9 s |
| `strike`, `stroke` (wave 12) | the work's intensity |
| `finale`, `celebrate {on}` (wave 12) | the chag through the night of light (src/finale.js) |
| `shirStart {bpm, chalil}`, `shirBlast {n, kind}`, `shirEnd` (wave 12, Phase B, AVODA12) | the shir at their tempo; at a section's blast the song rests 2.2 s (AVODA12 sounds the player's trumpet); `kind:'ttt'` (the wine given, before the song) a soft pair of trumpets; `gates:true` nothing |

Cues are rate-limited (≥ 0.25 s apart), so the demo's ×60 clock never floods them.

## Wiring (main.js `// ── music ──`)
- **Start.** On the first gesture (pointerdown, keydown or touchend), after the sound kit's own unlock. Nothing sounds
  before it.
- **The context.** It shares the kit's AudioContext when the kit offers it (`sfx.context`, a request to GAMES8B). Otherwise
  it makes its own, with `latencyHint: 'playback'` (battery).
- **Events.** Both `onEvent:` lines (Phase A's createGame, Phase B's createAvodah) call `music.event(type, d, 'A'|'B')`.
- **Polling.** The scheduler asks `watch()` about 11 times a second:
  - **mute:** the kit's existing mute (Phase A's `game.sfx.muted`, Phase B's `avodah.sfx.muted`) silences the music at
    once and stops its voices;
  - **ducking:** −16 dB under a modal card (`.gm-modal`, `.av-modal`), −4.4 dB under the mentor's speech (`.coach-on`);
  - **precision:** while a precision game's sheet is open (`.fx-mg`);
  - **the tour:** the Temple tour (`body.sc-on`) plays the solemn state;
  - **hidden:** a hidden page pauses it. Its own context is suspended; a shared one fades out. On return, it skips the
    missed time rather than bursting.
- **Volume.** A separate music volume, remembered under `bh_music_vol`; the default is 0.6. For FLOW8B's menu (guarded):
  `globalThis.__BH_MUSIC.set({ volume: 0…1 })`, and read it with `.get().volume`.

## API (`src/game/music.js`)
```js
const music = createMusic({ context, muted, watch, seed }).start();
music.event(type, detail, phase)   // the game's events → the state and the cues
music.state(name | null | undefined)   // force a state (undefined: back to the events)
music.cue('blast', 1 | 3) · music.cue('fill') · music.cue('rest', secs)   // wave 12 → its length (s)
music.moment(on) · music.flourish() · music.duck(on, level = 0.15)
music.set({ volume }) → get() · music.get() → { state, want, bpm, intensity, volume, running, muted, ducked, duck, paused, shared, layers }
music.pause() · music.resume() · music.destroy() · music.meter()   // meter: the output's RMS now (tests)
renderOffline(script, secs, { sampleRate, seed, volume })   // an OfflineAudioContext render → AudioBuffer
//   script: [t,'state',name] · [t,'duck',k] · [t,'flourish'] · [t,'cue',kind,k] · [t,'int',0…2] · [t,'chalil',bool] · [t,'shirBpm',n]
melody(rng, prog, rhythm, answer)   // pure: one 4-bar phrase
stateInfo(name) → { bpm, mode, root, drums, tof, darbuka, cymbal, chalil, motif }   // wave 12 (the tests)
MUSIC_STATES   // build board precision moment night phaseB chag quarry shir
```

## CPU and budget
- **Scheduling.** A 90 ms timer schedules 0.3 s ahead. Nothing runs per frame, and nothing is allocated per frame.
- **Voices.** A note is 2 nodes (a buffer source and a gain). The chalil and the drone are long-lived, one set per
  playing state; at most two states play, during a crossfade.
- **Rendering.** At a phone's 48 kHz, scheduled like the live music, the offline render runs ×19–30 faster than real
  time in headless Chromium on this shared 2-core machine: about 3–5% of one core (test/music.cjs, the best of three).
  - The reverb was the largest cost: a stereo 1.7-s impulse took about half of it. It is now mono and 1.3 s long; a
    phone's speaker is mono anyway.
  - The drone breathes in amplitude, not through its filter's cutoff, and the chalil's breath filter steps with the notes.
    A modulated filter recomputes its coefficients every sample.
- **Memory.** The rendered strings and drums are ≈ 2 MB of Float32 buffers at 22 kHz, made on the first gesture (≈ 10 ms).
- **Bundle.** +16.6 K: dist/temple3d.html is 2,479,204 bytes against master's 2,462,613 (music.js minified is ≈ 16 K,
  plus the main.js block). The budget is 25 K.

## Tests
- **`node test/music.cjs [--wav]`** runs offline in one headless Chromium, 42 checks:
  - every state for 20 s: peak < 0.98 and no sample ≥ 0.99 (no clipping); every second after the fade-in > 0.006 RMS
    (no silence); RMS 0.02–0.2 (the night 0.012); no DC; ≥ 10× real time at 48 kHz;
  - the render pauses every 0.1 s (`suspend`) to make the next notes, as the live scheduler does;
  - the crossfades through all seven states, and the fade to silence;
  - the ducking (≥ 12 dB down, and back);
  - flourishes and cues;
  - the event → state mapping;
  - the melody generator.

  `--wav` writes `test/out/music-<state>.wav`, to listen to.
- **Wave 12: the pulse, measured** (test/music.cjs, `analyse(…, { tempo: true })` in test/music.html): the onset-strength
  envelope of each render (the positive change of the log-energy of the high-passed mix, 128-sample hops), its onsets per
  second (local peaks over the mean + 1 sd, ≥ 60 ms apart), and its tempo (the strongest autocorrelation lag between 60 and
  180 BPM). Checked: every rhythmic state's measured tempo is its own (±3 %); the building's is 100–110; its onsets rise with
  the work's intensity; Phase B's states have no drum; the fill and the trumpets never clip; the cycle's, the finale's and the
  shir's events reach their states. The measured values are in the wave-12 report (bus/WORLD12.md).
- **`node build.mjs && node test/music-touch.cjs`** runs the real build by real touch at 390×844, in normal mode with no
  autoplay flags:
  - it is silent before the first tap;
  - the tap on the opening starts the build state (a real output level, measured by an analyser);
  - the menu's "השתקה" switch, tapped, silences the music, and a second tap brings it back;
  - a hidden page pauses it, and showing the page resumes it;
  - the menu's "הצצה: העבודה בבית" button, tapped, turns it to Phase B's solemn state (ducked under its first card);
  - the precision state: the dock's "היום" → the daily challenge. A new player's challenge is locked until the first
    course, so the test checks the wiring's DOM contract instead (a `.fx-mg` sheet → precision → build), marked
    synthetic. The precision game played by hand is QA8B's real-play; it logs `__BH_MUSIC.get().state`.

  Screenshots: `test/out/music-touch-*.png`.
- **`test/music.html`** is for listening by hand (after `node test/music.cjs` builds its bundle): a button per state, a
  volume slider, the duck and a flourish.

## Requests to the others (all optional; the music works without them)
- **GAMES8B**, src/game/audio.js ≈ 448: `Object.defineProperty(api, 'context', { get() { return ctx; } })`, so the
  music and the sounds share one AudioContext on a phone.
- **GAMES8B**, src/game/audio.js:89–91: also unlock on `touchend`, and keep the listener until the context is running.
  WebKit activates a touch at touchend; Chromium's touch pointerdown already activates (tested).
- **GAMES8B**, src/game/minigames/frame.js ≈ 109: `onEvent('minigameStart', { kind, level })` when the sheet opens. The
  music watches `.fx-mg` meanwhile.
- **FLOW8B**, src/game/ui.js ≈ 647 (the menu's switches): a "מוזיקה" switch through the guarded
  `globalThis.__BH_MUSIC.set({ volume: on ? 0.6 : 0 })`, read back with `.get().volume`.
- **FLOW8B**, optional: `emit('reveal')` at the Mount's ★1. The music already swells on `phase {ph: 'courses'}`.

## ⚑ For the owner (Hebrew, each with a default)
- ⚑ עוצמת המוזיקה: 60% כברירת מחדל, מתחת לצלילי המשחק. ברירת מחדל: כך.
- ⚑ "השתקה" בתפריט משתיקה גם את המוזיקה. מתג "מוזיקה" נפרד יתווסף לתפריט אם יהיה זמן (FLOW8B). ברירת מחדל: כך.
- ⚑ כלי הנגינה והסולמות הם המחשה (illus), לא שחזור. הכלים הם אלה שהמשנה מונה אצל הלויים: נבל וחליל (ערכין ב, ג), כינור
  (ערכין ב, ו). התוף (שמות טו, כ) מתנגן רק במוזיקת הבנייה של שלב א ולא בעבודה. הסולם "אהבה רבה" משמש לרגעי השיא.
  ברירת מחדל: כך.
- ⚑ בשלב ב (העבודה בבית): רקע שקט וחגיגי, שנחלש תחת כרטיסים. ברירת מחדל: כך. החלופה: שקט מלא בזמן העבודה.
- ⚑ הלחנים מקוריים ונוצרים מחדש בכל פתיחה, כך שאין מנגינה קבועה שחוזרת. ברירת מחדל: כך.
- ⚑ (גל 12) קצב מוזיקת הבנייה 104.65 פעימות לדקה (היה 70): שלוש פעימות הן בדיוק שתי הנפות פטיש (0.86 שנייה), כך שהמכות נופלות
  על המקצב ולא נגדו. ברירת מחדל: כך. החלופה: 70 כמו קודם, או 140 (פעימה לכל חצי הנפה).
- ⚑ (גל 12) הדרבוקה (תוף גביע) והמקצבים ברוח המקסום והבלדי הם המחשה מן המוזיקה של המזרח, לא שחזור; הם מתנגנים רק בשלב א
  (הבנייה, הלוח, המחצבה, החג) ולעולם לא בעבודה בבית. ברירת מחדל: כך.
- ⚑ (גל 12) "מוטיב הבית": צירוף קצר ומקורי שחוזר כשהעבודה רצה ובחג. ברירת מחדל: כך. החלופה: בלי מוטיב קבוע.
- ⚑ (גל 12) שיר הלויים: כינורות, נבלים וצלצל אחד שמכה בתחילת השיר (בן ארזא, תמיד ז, ג; "ואין מוסיפין בצלצל אלא אחד",
  ערכין ב, ה); החליל רק בשנים עשר הימים שבהם "החליל מכה לפני המזבח" (ערכין ב, ג). בסוף כל פרק השיר נח והכהנים תוקעים.
  ברירת מחדל: כך. החלופה: חליל בכל יום, כפי שכתוב בתדריך.
- ⚑ (גל 12) בחגיגת חנוכת הבית: מוזיקת חג (תוף, דרבוקה, צלצל, המוטיב) ואור של מנורות ואבוקות, בלי זיקוקים (הם הומצאו כאלף שנה
  אחרי החורבן). ברירת מחדל: כך, עד שיוחלט אחרת.

## Wave 18 — MUSIC18 ("אבן הפינה": the sound of the points, the layers that follow the work)
Study of the Brawl Stars recording (audio rebuilt on the video clock; the table is in bus/MUSIC18.md): lobby 120 BPM, battle 125, a bed of −20…−22 LUFS with a 3.5 LU spread; effect clusters 6–15 LU over it, one per ≈ 3–5 s, each hit a 30–60 ms burst (often a doublet 80–90 ms apart) that is never the same twice; UI taps only +2…+4 LU; the entrance is hush → silence 1.3 s → a 3-s swell (+12 LU) → hush → the boom on a beat; before the release a 9-s riser in the upper bands.
- **Sounds** (`audio.js`, `// ── music18 ──`): `xpTick` (a pentatonic ladder D5 → B6 that climbs while points land ≤ 1.1 s apart, resets after a pause; `{n}` to count it yourself) · `levelUp {level}` · `perfect | good | soft {combo}` (the timing ring's grades; `soft` rises, never falls) · `starPop {n 1…3}` and its alias `star {i 0…2}` · `big {kind 'course'|'stage'}` · `flyIn {kind 'coin'|'mat'}` · `tab {i 0…4}`. Every one varies per play (pitch ± a few cents for a note of the key, more for a knock; the filter; one of 3–4 timbres, never the one just played — `pickV`); the old repeated sounds (hammer, strike, chisel, thud, pop, ui, coin…) vary through `VARY`. `levelUp` and `big` wait for the music's next beat (≤ one beat; their touch part is immediate) through `__BH_MUSIC.beat()`, and call the music's flourish themselves (`sfx.beatSource(fn)` for tests).
- **Music** (`music.js`): `music.rate(actsPerSecond)` / `music.act()` (and the events `strike`, `stroke`, `twinWork`) → the work's layers `E.lay`: ≥ 0.35 a/s the percussion (the darbuka and a shaker), ≥ 0.9 the melody's answer (the chalil in every phrase, the lyre's ostinato, the motif), ≥ 1.8 a high ornament and a tziltzal per phrase (`LAY_AT`, `layersFor`). A layer comes in one at a time (the percussion on the next beat, the others at the next bar line) and goes out only at an 8-bar edge. While two or more layers play, the last bar before an edge carries a riser. `music.flourish('level' | 'course' | 'stage', n)` → the seconds to the hit, on the layer's next beat; a course's and a stage's keep every layer to the next edge (the second one when it is near). The game's `course`, `stageDone`, `chapter`, `m3Won` events call it. `renderOffline` takes `[t,'rate',aps]` and `[t,'flourish',kind,level]` and returns `buf.meta.lay` (every layer change) and `buf.meta.flourish`.
- ⚑ (גל 18) הצלילים החדשים והשכבות שנכנסות לפי קצב העבודה: כלי הקשה, אחר כך המענה של המנגינה, אחר כך קישוט גבוה; הן יוצאות רק בקצה של 8 תיבות. ברירת מחדל: כך. החלופה: להזיז את הספים (`LAY_AT` ב-music.js: 0.35 · 0.9 · 1.8 פעולות בשנייה).
- ⚑ (גל 18) סיום נדבך (`course`) וסיום שלב (`stage`) נוחתים על הפעימה הבאה — עד פעימה אחת (כ-0.48 שנייה) אחרי הרגע, עם צליל מגע מיידי; בסוף שלב גם תקיעה של חצוצרות הכסף. ברירת מחדל: כך. החלופה: בלי המתנה לפעימה (מיידי יותר, פחות "בקצב").
- ⚑ (גל 18) לפני קצה של 8 תיבות, כשהעבודה "חמה" (שתי שכבות ויותר), יש שנייה-שתיים של סולם עולה בעוצמה נמוכה — כמו ההמתנה לפני השחרור בהקלטה. ברירת מחדל: כך. החלופה: בלי.
