/* ─────────────────────────────────────────────────────────────────────────────
 * audio.js: a small procedural WebAudio kit (no audio files) + the juice kit (haptics, shake, number pops).
 *
 *   const sfx = createAudio({ storage });   // installs a one-time first-gesture unlock
 *   sfx.play('strike', { combo: 3 });       // or simply sfx('strike', {…}): the kit is callable (MATCH3/KINGS get it as ctx.sfx)
 *   sfx.ambience('site' | 'plaza' | 'crowd' | 'rain' | 'birds' | 'sea' | 'night' | null);   // one bed at a time
 *   sfx.flow(0…1)                           // a separate running-water bed (the kiyor's open spigots, the amah)
 *   sfx.water(ev) · sfx.bindWater(world.water)   // WATER's events → taps, splashes, pours, the mukhni's great creak
 *   sfx.impact(ev) · sfx.bindHero(stages.hero)   // PEOPLE's onImpact → the stroke's sound AT contact (stone × tool)
 *   sfx.haptic(p) · sfx.shake(el, amt) · sfx.pop(text, x, y, kind)   // the juice kit (createJuice), also exported alone
 *   sfx.muted = true;                       // remembered (storage key 'bh_mute', try/catch in `storage`)
 *   SOUNDS                                  // every name, for the bus and the tests
 *
 * Names (wave 6, FUN; the old names keep working):
 *   site   hammer {stone:'lime'|'hard'|'marble'|'field'|'bedrock', tool:'mallet'|'iron'|'pick'|'sledge'|'wood', force:0…1}
 *          chisel {force} · wedge {n} · split · rope {tension:0…1} · wheel · thud {mass:0…1} · grind · plumb · level ·
 *          measure · joint (a stone that lands true) · tier {n:1…4} · pb · find · order · daily
 *   match3 m3swap · m3bad · m3match {n:3…5, combo} · m3cascade {step} · m3special {kind:'line'|'bomb'|'color'} ·
 *          m3blast {kind} (a special acting on stone/rubble/earth/wood — never on a vessel) · m3rise (vessels glow and
 *          rise into the collection) · m3land · m3moves (a few moves left: a soft reminder) · m3win · m3stars {n} · m3fail
 *          (out of moves: gentle, never a sad trombone) · m3start
 *   aliases MATCH3 asked for: rise {combo} · light · swoosh · tool · wood · win3
 *   kings  court · deal · sail · arrive · page · coinsIn {n} · seal · bell · cart   (bed: 'sea')
 *   water  tap · splash · drip · pour · mukhni
 *   ui     pop · whoosh · ui · coin · leaf · chime {combo}
 *   old    strike perfect crack shatter settle chime creak fanfare solemn coin ui leaf
 *   wave18 (music18) xpTick {n} · levelUp {level} · perfect|good|soft {combo} · starPop {n 1…3} (alias star {i 0…2}) · big {kind 'course'|'stage'} · flyIn {kind 'coin'|'mat'} · tab {i 0…4};
 *          each varies per play (VARY, pickV); levelUp and big wait for the music's next beat (__BH_MUSIC.beat(), sfx.beatSource) and call its flourish
 *
 * Browsers only start audio after a user gesture, so nothing plays before the first tap. Every sound is a
 * few short-lived nodes routed through one master gain and a gentle compressor. Music is deliberately
 * not liturgical (GDD §8). Nothing here allocates per frame: sounds are made per event, beds are made once.
 * ──────────────────────────────────────────────────────────────────────────── */
const MUTE_KEY = 'bh_mute';
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];   // rising chime steps for combos

/* the stone and the tool of a stroke → the pitch and colour of the hit (Hz, bandpass Q, thump Hz) */
const STONE = {
  lime: { f: 1500, q: 1.2, th: 150 },      // meleke: soft, dull
  hard: { f: 2300, q: 2.2, th: 185 },      // mizzi: bright, a short ring
  marble: { f: 2900, q: 3.2, th: 220 },
  field: { f: 1200, q: 1.0, th: 125 },     // the altar's whole field stones (handled, never struck with iron)
  bedrock: { f: 900, q: 0.9, th: 95 },
};
const TOOL = { mallet: 0.7, wood: 0.65, hammer: 1, iron: 1.25, pick: 1.1, sledge: 0.55 };
/* the stone of each site, for the pitch of its strokes: the Mount's bedrock, the altar's whole field stones (Middot 3:4),
 * the House's marble (Bava Batra 4a: "אבני שישא ומרמרא"); the walls and courts are the default dressed limestone */
const SITE_STONE = { har: 'bedrock', yesod: 'field', sovev: 'field', guf: 'field', karnot: 'field', ulam: 'marble', heichal: 'marble', kodesh: 'marble' };

export const SOUNDS = [
  'strike', 'perfect', 'crack', 'shatter', 'settle', 'chime', 'creak', 'fanfare', 'solemn', 'coin', 'ui', 'leaf',
  'hammer', 'chisel', 'wedge', 'split', 'rope', 'wheel', 'thud', 'grind', 'plumb', 'level', 'measure', 'joint', 'tier', 'pb', 'find', 'order', 'daily', 'brush',
  'm3swap', 'm3bad', 'm3match', 'm3cascade', 'm3special', 'm3blast', 'm3rise', 'm3land', 'm3moves', 'm3win', 'm3stars', 'm3fail', 'm3start',
  'rise', 'light', 'swoosh', 'tool', 'wood', 'win3',
  'court', 'deal', 'sail', 'arrive', 'page', 'coinsIn', 'seal', 'bell', 'cart',
  'tap', 'splash', 'drip', 'pour', 'mukhni',
  'pop', 'whoosh',
  'banner', 'stamp',   // ── land17 ── ui.banner (a rising pair) and ui.stamp's own sound (the strongest of the kit; with music, the music's stinger plays instead)
  'dinar',   // ── hook19 ── the gold coin's ring (the master score's 10,000)
  'grave',   // ── blooda25 ── (the slaughter behind the screen: one soft deep tone, the beds dip)
  'xpTick', 'levelUp', 'good', 'soft', 'starPop', 'star', 'big', 'flyIn', 'tab',   // ── music18 ── (wave 18: the work's points, its grades, a landing, a top tab; 'perfect' is redefined below)
  // ── recovered (17–26) ── the day's sounds (Phase B plays them through sound.js since build 26c)
  'warn17', 'alarm17', 'near17', 'ding17', 'chord17', 'trumpet17', 'late17', 'coin18', 'salt19', 'wbell20', 'unlock20', 'scrape21', 'spill21', 'blast21',
  'torch25', 'hoof25', 'bleat25', 'stamp25', 'bell25', 'gate26', 'bolt26', 'step26', 'hand26', 'scrape26', 'pour26', 'bell26', 'wick26',
  'drum23', 'knock22', 'err22', 'crack22', 'fire22',
];
export const BEDS = ['site', 'plaza', 'crowd', 'rain', 'birds', 'sea', 'night'];   // ── world12 ── + 'night': a dry night's crickets and a breath of wind

// ── recovered (build 26c) ── trim: a gain per sound name (sound.js's TRIM26C, when Phase B builds this kit too); declick: every
// envelope's gain starts at its floor (a gain sits at 1 until its first event — one sample of raw noise on a phone). Phase A
// passes neither: its sound is unchanged.
export function createAudio({ storage, root = null, settings = null, trim = null, declick = false } = {}) {
  let ctx = null, master = null, noise = null, amb = null, ambKind = null, flowBed = null, flowWant = 0, beds = null, bedsK = 1;   // ── recovered (build 26c) ── (beds: the ambience's bus, at 1; duck() lowers it)
  let muted = false, lastLand = 0, heroBound = false, lastImpact = -9, OUT = null, PJ = 0, FJ = 0;   // (music18: PJ / FJ — the play's pitch and filter variation)   // (land17: OUT — the level trim's bus while a trimmed sound is made)
  try { muted = !!(storage && storage.get(MUTE_KEY) === '1'); } catch (e) { muted = false; }

  function ensure() {
    if (ctx) return ctx;
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.75;
    // ── land17 ── the last stage, shared with the music (it connects to ctx.__bhOut): a soft clip — linear to 0.6, rounded above, never past 0.95 —
    // so the louder big events (the level trims) and the music's peaks never clip together on a phone's speaker
    // (the supervisor, 5.10: a context without a WaveShaper — the tests' fake, an old webview — goes straight to the speaker)
    const sat = typeof ctx.createWaveShaper === 'function' ? ctx.createWaveShaper() : null;
    if (sat) {
      const cv = new Float32Array(2049);
      for (let i = 0; i < cv.length; i++) { const x = (i / 1024) - 1, a = Math.abs(x); cv[i] = (a < 0.6 ? x : Math.sign(x) * (0.6 + 0.35 * Math.tanh((a - 0.6) / 0.35))); }
      sat.curve = cv; sat.connect(ctx.destination); ctx.__bhOut = sat;
    }
    master.connect(comp); comp.connect(sat || ctx.destination);
    beds = ctx.createGain(); beds.gain.value = bedsK; beds.connect(master);   // ── recovered (build 26c) ── the beds bus: the ambience, the running water, the choir
    // one second of white noise, reused by every noisy sound
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  const afterUnlock = () => {
    if (!ctx || muted || ctx.state !== 'running') return;
    if (ambKind && !amb) startAmb(ambKind);
    if (flowWant > 0 && !flowBed) setFlow(flowWant);
  };
  const unlock = () => {
    const c = ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume().then(afterUnlock, () => {});
    else afterUnlock();
    if (typeof removeEventListener === 'function') { removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); }
  };
  if (typeof addEventListener === 'function') { addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true); }

  const ready = () => !!ctx && ctx.state === 'running' && !muted;

  /* ── building blocks ── */
  function env(g, t, a, peak, dec, sus = 0.0001) {
    if (declick) g.gain.value = 0.0001;   // ── recovered (build 26c) ──
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + dec);
  }
  function noiseHit(t, { type = 'bandpass', f = 1500, q = 1, peak = 0.4, a = 0.002, dec = 0.08, f2 = null, dest = OUT || master }) {
    if (FJ) { const m = 1 + (Math.random() * 2 - 1) * FJ; f *= m; if (f2) f2 *= m; }   // ── music18 ── (the filter varies per play: VARY)
    const s = ctx.createBufferSource(); s.buffer = noise;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + dec);
    const g = ctx.createGain(); env(g, t, a, peak, dec);
    s.connect(fl); fl.connect(g); g.connect(dest);
    s.start(t, Math.random() * 0.8, a + dec + 0.05);
  }
  function tone(t, { type = 'sine', f = 440, f2 = null, peak = 0.3, a = 0.005, dec = 0.3, dest = OUT || master, lp = null, vib = 0, pj = PJ }) {
    if (pj) { const m = 1 + (Math.random() * 2 - 1) * pj; f *= m; if (f2) f2 *= m; }   // ── music18 ── (the pitch varies per play: VARY; a note of the key only by a few cents)
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + dec);
    let node = o;
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + a + dec + 0.1); }
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; node.connect(fl); node = fl; }
    const g = ctx.createGain(); env(g, t, a, peak, dec);
    node.connect(g); g.connect(dest);
    o.start(t); o.stop(t + a + dec + 0.1);
  }
  const semis = (base, n) => base * Math.pow(2, n / 12);
  const pluck = (t, f, peak = 0.12, dec = 0.35) => { tone(t, { type: 'triangle', f, peak, dec, lp: 3200, pj: 0.003 }); tone(t, { f: f * 2, peak: peak * 0.25, dec: dec * 0.6, pj: 0.003 }); };   // (music18: pj — a note of the key varies by ±5 cents)
  const bell = (t, f, peak = 0.12, dec = 1.1) => { tone(t, { f, peak, dec, pj: 0.003 }); tone(t, { f: f * 2.76, peak: peak * 0.3, dec: dec * 0.5, pj: 0.003 }); tone(t, { f: f * 5.4, peak: peak * 0.1, dec: dec * 0.25, pj: 0.003 }); };
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

  /* ── land17 ── (PRINCIPLES §5.2) the big events' peaks sit 6–10 dB over the music bed, the touch sounds stay small but are heard:
   * a per-sound level trim (a gain ahead of the master) — measured by test/music-loud.cjs (the kit through an OfflineAudioContext, a
   * 400-ms windowed RMS against the work state's bed). A perfect stroke (hammer with quality 'perfect' | 'combo') takes `perfect`. */
  // ── music18 ── (wave 18; the study of the Brawl Stars recording: bus/MUSIC18.md) a repeated sound is never the same twice: per name
  // [pitch ±, filter ±, level ±] (a fraction; a note of the key varies only by a few cents — pluck/bell/chime carry their own), and the new
  // names choose among 3–4 timbres, never the one just played (pickV). A big moment waits for the music's next beat (BEATQ), its touch part never.
  const VARY = { strike: [0.06, 0.14, 0.12], hammer: [0.05, 0.14, 0.12], chisel: [0.03, 0.12, 0.12], wedge: [0.03, 0.1, 0.1], thud: [0.07, 0.12, 0.1], settle: [0.05, 0.1, 0.08],
    wheel: [0.05, 0.1, 0.1], pop: [0.04, 0, 0.1], ui: [0.025, 0, 0.08], coin: [0.012, 0, 0.08], perfect: [0.05, 0.12, 0.08], good: [0.05, 0.12, 0.08], soft: [0.04, 0.1, 0.08],
    crack: [0.05, 0.14, 0.12], m3swap: [0.03, 0.1, 0.08] };
  const lastV = {};
  const pickV = (name, n) => { let i = Math.floor(Math.random() * n); if (i === lastV[name]) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n; lastV[name] = i; return i; };
  const BEATQ = { levelUp: 1, big: 1 };
  let beatFn = () => { try { const M = globalThis.__BH_MUSIC; return M && typeof M.beat === 'function' ? M.beat() : null; } catch (e) { return null; } };
  let xpRun = 0, xpLast = -9;
  // ── /music18 ──
  const LEVEL = { perfect: 2.8, thud: 1.5, settle: 2.5, joint: 1.7, tier: 5, fanfare: 3.2, stamp: 1.35, pop: 5, ui: 6, whoosh: 14, leaf: 2, coin: 1.6, chisel: 1.8, xpTick: 4.8, levelUp: 1.7, dinar: 1.6, good: 1.6, soft: 2.2, starPop: 2.4, flyIn: 2.4, tab: 4, big: 1.5,
    // ── recovered (17–26) ── the day's sounds (their builds in their names)
    warn17: 2.2, alarm17: 2.2, near17: 2.4, ding17: 2.2, chord17: 2.4, trumpet17: 3, late17: 2.4, coin18: 2, scrape21: 2.2, spill21: 2, blast21: 3, knock22: 2.6, err22: 2, crack22: 2.2, fire22: 2.6, drum23: 2.4,
    torch25: 2, hoof25: 2.2, bleat25: 2.2, stamp25: 2.8, bell25: 2.6, gate26: 3, bolt26: 2.4, step26: 2.2, hand26: 2.2, scrape26: 2, pour26: 1.8, bell26: 2.6, wick26: 2.4 };   // (music18: + the new names)
  const levelOf = (name, o) => (name === 'starPop' && o && o.n === 3 ? 3.4 : name === 'hammer' ? (o && (o.quality === 'perfect' || o.quality === 'combo') ? LEVEL.perfect : 1) : LEVEL[name] || 1);
  /* ── the kit ── */
  const KIT = {
    strike(t, o) {           // mallet on stone: a knock, a dull thump and a grain of grit
      const lift = Math.min(o.combo || 0, 10) * 60;
      noiseHit(t, { f: 1700 + lift, q: 1.4, peak: 0.55, dec: 0.07 });
      tone(t, { f: 150, f2: 70, peak: 0.45, dec: 0.12 });
      noiseHit(t + 0.012, { type: 'highpass', f: 3500, peak: 0.12, dec: 0.03 });
    },
    // ── music18 ── the grades of the timing ring: perfect = the blow, the gold bell and a sparkle (a pair of bells; the combo climbs the scale);
    // good = the blow and one clean pluck; soft = a small wooden tok, rising a little (an encouragement, never a sad fall)
    perfect(t, o = {}) {
      KIT.strike(t, o); KIT.chime(t + 0.02, o);
      const n = PENTA[Math.min(PENTA.length - 1, Math.max(0, (o.combo || 1) - 1))];
      tone(t + 0.07, { f: semis(1760, n), peak: 0.06, dec: 0.5, pj: 0.003 });
      noiseHit(t + 0.03, { type: 'highpass', f: 6500, f2: 9000, peak: 0.05, a: 0.02, dec: 0.22 });
    },
    good(t, o = {}) {
      if (!o.light) KIT.strike(t, { combo: 0 });
      pluck(t + 0.015, semis(587.33, [0, 4, 7][pickV('good', 3)]), 0.1, 0.32);
    },
    soft(t, o = {}) {
      const k = pickV('soft', 3);
      if (!o.light) noiseHit(t, { type: 'lowpass', f: 900 + k * 220, q: 0.7, peak: 0.34, a: 0.002, dec: 0.05 });
      tone(t, { type: 'triangle', f: 230 + k * 28, f2: 262 + k * 28, peak: o.light ? 0.08 : 0.16, a: 0.003, dec: 0.07, lp: 1500 });
    },
    // ── /music18 ──
    crack(t) {
      noiseHit(t, { f: 900, q: 0.8, peak: 0.5, dec: 0.16 });
      for (const k of [0.03, 0.07, 0.11]) noiseHit(t + k, { type: 'highpass', f: 2600, peak: 0.2, dec: 0.02 });
      tone(t, { f: 110, f2: 60, peak: 0.35, dec: 0.15 });
    },
    shatter(t) {
      tone(t, { f: 95, f2: 45, peak: 0.55, dec: 0.3 });
      for (let k = 0; k < 9; k++) noiseHit(t + Math.random() * 0.35, { type: 'lowpass', f: 3000 - k * 260, peak: 0.28, dec: 0.06 + Math.random() * 0.08 });
    },
    settle(t) {              // a heavy block settling into its course
      tone(t, { f: 80, f2: 48, peak: 0.6, dec: 0.28 });
      noiseHit(t + 0.01, { type: 'lowpass', f: 520, peak: 0.35, dec: 0.3 });
    },
    chime(t, o) {            // a gold bell; a combo climbs the scale
      const n = PENTA[Math.min(PENTA.length - 1, Math.max(0, (o.combo || 1) - 1))];
      const f = semis(880, n);
      tone(t, { f, peak: 0.16, dec: 0.9, pj: 0.003 });
      tone(t, { f: f * 2.76, peak: 0.05, dec: 0.5, pj: 0.003 });
    },
    creak(t, o = {}) {       // rope over the treadwheel pulley
      const k = 1 + clamp01(o.tension == null ? 0.3 : o.tension) * 0.6;
      tone(t, { type: 'sawtooth', f: 170 * k, f2: 240 * k, peak: 0.06, a: 0.05, dec: 0.4, lp: 1100, vib: 18 });
      noiseHit(t, { f: 700 * k, q: 6, peak: 0.05, a: 0.04, dec: 0.4 });
    },
    fanfare(t) {             // a short horn call for a finished stage
      const notes = [[293.66, 0, 0.16], [440, 0.18, 0.16], [587.33, 0.36, 0.7]];
      for (const [f, dt, d] of notes) {
        tone(t + dt, { type: 'sawtooth', f, peak: 0.1, a: 0.03, dec: d, lp: 1500, vib: 3 });
        tone(t + dt, { type: 'square', f: f / 2, peak: 0.04, a: 0.03, dec: d, lp: 900 });
      }
      tone(t, { f: 90, f2: 50, peak: 0.4, dec: 0.3 });
    },
    // ── blooda25 ── the moment of gravity (DAM25 §2.4): ONE soft deep tone — not a chime, not a success — and the court's beds dip to 20 %
    // for the 1.2 s of stillness (the music ducks itself: blood.js graveStart → __BH_MUSIC.duck). No animal's sound, ever.
    grave(t, o = {}) {
      tone(t, { f: 98, peak: 0.11, a: 0.18, hold: 0.5, dec: 1.6, lp: 600 }); tone(t, { f: 147, peak: 0.025, a: 0.25, hold: 0.3, dec: 1.2, lp: 700 });
      const k = o.duck == null ? 0.2 : +o.duck;
      for (const b of [amb, flowBed]) { if (!b || !b.g) continue; try { const v = Math.max(0.0001, b.g.gain.value); b.g.gain.cancelScheduledValues(t); b.g.gain.setTargetAtTime(v * k, t, 0.1); b.g.gain.setTargetAtTime(v, t + 1.5, 0.4); } catch (e) { /* a bed's */ } }
    },
    // ── /blooda25 ──
    solemn(t) {              // Kodesh HaKodashim: a quiet, slow chord and no fanfare
      for (const [f, p] of [[146.83, 0.07], [220, 0.05], [293.66, 0.035]]) {
        const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + 1.4);
        g.gain.setValueAtTime(p, t + 3); g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 6.2);
      }
    },
    coin(t) { tone(t, { f: 1250, peak: 0.12, dec: 0.08 }); tone(t + 0.07, { f: 1870, peak: 0.12, dec: 0.25 }); },
    leaf(t) { tone(t, { f: 660, f2: 990, peak: 0.1, dec: 0.25 }); },
    ui(t) { tone(t, { f: 720, peak: 0.06, dec: 0.04 }); },

    /* ── the site (wave 6): every stroke is a stone meeting a tool ── */
    hammer(t, o = {}) {
      const s = STONE[o.stone] || STONE.lime, k = TOOL[o.tool] || 1, force = clamp01(o.force == null ? 0.7 : o.force);
      const iron = o.tool === 'iron' || o.tool === 'pick';
      noiseHit(t, { type: iron ? 'bandpass' : 'lowpass', f: s.f * k, q: s.q, peak: 0.3 + 0.35 * force, dec: iron ? 0.06 : 0.09 });
      tone(t, { f: s.th * (o.tool === 'sledge' ? 0.7 : 1), f2: s.th * 0.45, peak: 0.25 + 0.3 * force, dec: o.tool === 'sledge' ? 0.22 : 0.12 });
      if (iron) { tone(t, { f: 2100 * k, peak: 0.05 * force, dec: 0.18 }); tone(t, { f: 2100 * k * 2.76, peak: 0.02, dec: 0.08 }); }
      noiseHit(t + 0.014, { type: 'highpass', f: 3800, peak: 0.08 + 0.08 * force, dec: 0.025 });   // grit
      if (o.quality === 'perfect' || o.quality === 'combo') KIT.chime(t + 0.02, { combo: o.combo || 3 });
    },
    chisel(t, o = {}) {      // the chisel's edge biting a margin: a bright tick and a short ring
      const force = clamp01(o.force == null ? 0.7 : o.force);
      tone(t, { f: 2800, f2: 2500, peak: 0.07 + 0.05 * force, dec: 0.05 });
      tone(t, { f: 4150, peak: 0.03, dec: 0.12 });
      noiseHit(t, { type: 'highpass', f: 3000, peak: 0.18 + 0.15 * force, dec: 0.035 });
      tone(t, { f: 170, f2: 90, peak: 0.18 * force, dec: 0.07 });                                  // the mallet behind it
    },
    wedge(t, o = {}) {       // a wedge driven deeper: the ring climbs with every blow
      const n = Math.min(o.n || 0, 8);
      tone(t, { f: semis(620, n * 2), peak: 0.06, dec: 0.16 });
      tone(t, { f: 140, f2: 70, peak: 0.4, dec: 0.1 });
      noiseHit(t, { f: 1800, q: 2, peak: 0.25, dec: 0.05 });
    },
    split(t) {               // the block parts from the bedrock
      noiseHit(t, { type: 'lowpass', f: 900, f2: 180, peak: 0.55, a: 0.01, dec: 0.5 });
      tone(t, { f: 72, f2: 34, peak: 0.6, dec: 0.55 });
      for (const k of [0.05, 0.12, 0.2, 0.31]) noiseHit(t + k, { type: 'highpass', f: 2400, peak: 0.12, dec: 0.03 });
    },
    rope(t, o) { KIT.creak(t, o); },
    wheel(t) {               // one step of the treadwheel: a wooden knock and a groan
      tone(t, { f: 118, f2: 96, peak: 0.22, dec: 0.1 });
      noiseHit(t, { f: 420, q: 3, peak: 0.12, dec: 0.12 });
    },
    thud(t, o = {}) {        // a set stone lands on its bed: weight you can hear
      const m = clamp01(o.mass == null ? 0.6 : o.mass);
      tone(t, { f: 78 - 26 * m, f2: 36, peak: 0.5 + 0.25 * m, dec: 0.3 + 0.2 * m });
      noiseHit(t + 0.01, { type: 'lowpass', f: 420 - 120 * m, peak: 0.35 + 0.2 * m, dec: 0.35 });
      noiseHit(t + 0.06, { type: 'highpass', f: 2600, peak: 0.04, a: 0.03, dec: 0.3 });              // a breath of dust
    },
    brush(t, o) { noiseHit(t, { f: 1700 + 1500 * Math.random(), q: 0.9, peak: 0.5 * (o && o.force ? o.force : 1), a: 0.006, dec: 0.09 }); },   // (wave 7) a soft brush on earth: the dig of the day
    grind(t) { noiseHit(t, { f: 380, f2: 520, q: 1.6, peak: 0.16, a: 0.05, dec: 0.3 }); },           // stone sliding on stone
    plumb(t) { tone(t, { type: 'triangle', f: 520, f2: 505, peak: 0.1, dec: 0.5 }); tone(t, { f: 1600, peak: 0.02, dec: 0.05 }); },
    level(t) { tone(t, { f: 900, peak: 0.05, dec: 0.03 }); noiseHit(t + 0.02, { f: 700, q: 3, peak: 0.06, a: 0.03, dec: 0.2 }); },
    measure(t) { tone(t, { f: 640, peak: 0.07, dec: 0.04 }); noiseHit(t, { f: 1200, q: 4, peak: 0.06, dec: 0.03 }); },
    joint(t) {               // a stone that lands true on its joints
      KIT.thud(t, { mass: 0.5 });
      bell(t + 0.04, 1174.66, 0.1, 0.8); bell(t + 0.12, 1760, 0.06, 0.7);
    },
    tier(t, o = {}) { const n = Math.max(1, Math.min(4, o.n || 1)); for (let i = 0; i <= n; i++) pluck(t + i * 0.09, semis(587.33, PENTA[i + 1]), 0.1, 0.5); },
    pb(t) { for (const [i, s] of [[0, 0], [1, 4], [2, 7]]) pluck(t + i * 0.08, semis(784, s), 0.12, 0.5); bell(t + 0.26, 1568, 0.08, 1.2); },
    find(t) { noiseHit(t, { type: 'highpass', f: 5000, peak: 0.05, a: 0.08, dec: 0.5 }); for (const [i, s] of [[0, 0], [1, 3], [2, 7]]) bell(t + 0.1 + i * 0.14, semis(659.25, s), 0.08, 1); },
    order(t) { tone(t, { f: 95, f2: 60, peak: 0.35, dec: 0.1 }); noiseHit(t, { type: 'lowpass', f: 700, peak: 0.3, dec: 0.08 }); KIT.coin(t + 0.12); },
    daily(t) { KIT.tier(t, { n: 3 }); KIT.leaf(t + 0.45); },

    /* ── the match-3 (MATCH3 calls these through ctx.sfx) ── */
    m3start(t) { for (const [i, s] of [[0, 0], [1, 7]]) pluck(t + i * 0.1, semis(523.25, s), 0.09, 0.4); },
    m3swap(t) { noiseHit(t, { f: 700, f2: 1900, q: 1.5, peak: 0.5, a: 0.01, dec: 0.1 }); },   // (wave 7) the most frequent sound of a board was ×0.05 of the kit's median: now audible (≈ ×0.3)
    m3bad(t) { tone(t, { f: 330, peak: 0.07, dec: 0.08 }); tone(t + 0.09, { f: 262, peak: 0.07, dec: 0.12 }); },
    m3match(t, o = {}) {
      const c = Math.max(0, Math.min(PENTA.length - 1, o.combo || 0)), n = o.n || 3;
      const f = semis(659.25, PENTA[c]);
      pluck(t, f, 0.11, 0.35);
      if (n >= 4) pluck(t + 0.05, f * 1.5, 0.08, 0.4);
      if (n >= 5) pluck(t + 0.1, f * 2, 0.07, 0.5);
      noiseHit(t, { type: 'highpass', f: 6000, peak: 0.05, dec: 0.08 });
    },
    m3cascade(t, o = {}) { KIT.m3match(t, { n: 3, combo: (o.step || 1) + 1 }); },
    m3special(t) { for (const [i, s] of [[0, 0], [1, 4], [2, 7], [3, 12]]) tone(t + i * 0.05, { f: semis(880, s), peak: 0.07, dec: 0.3 }); noiseHit(t, { type: 'highpass', f: 4000, peak: 0.06, a: 0.1, dec: 0.3 }); },
    m3blast(t, o = {}) {     // a special acting on stone, rubble, earth or wood (never on a vessel)
      if (o.kind === 'line') { noiseHit(t, { f: 500, f2: 4200, q: 2, peak: 0.25, a: 0.01, dec: 0.22 }); tone(t, { f: 180, f2: 90, peak: 0.2, dec: 0.15 }); }
      else if (o.kind === 'color') { for (const s of [0, 4, 7, 11]) tone(t, { f: semis(440, s), peak: 0.06, a: 0.05, dec: 0.9 }); noiseHit(t, { type: 'highpass', f: 5000, peak: 0.05, a: 0.2, dec: 0.5 }); }
      else { tone(t, { f: 64, f2: 38, peak: 0.55, dec: 0.4 }); noiseHit(t, { type: 'lowpass', f: 700, f2: 200, peak: 0.45, dec: 0.4 }); }   // bomb: a heap of rubble gives way
    },
    m3rise(t) { for (const [i, s] of [[0, 0], [1, 5], [2, 9], [3, 12]]) tone(t + i * 0.06, { f: semis(783.99, s), peak: 0.05, a: 0.01, dec: 0.45 }); },
    m3land(t) { tone(t, { f: 310, peak: 0.04, dec: 0.03 }); },
    m3moves(t) { tone(t, { f: 520, peak: 0.05, dec: 0.05 }); tone(t + 0.12, { f: 520, peak: 0.04, dec: 0.05 }); },
    m3win(t) {
      const ph = [[0, 0], [0.12, 2], [0.24, 4], [0.36, 7], [0.5, 9], [0.66, 12]];
      for (const [dt, s] of ph) pluck(t + dt, semis(587.33, s), 0.11, 0.55);
      bell(t + 0.66, semis(587.33, 24), 0.07, 1.4);
      tone(t, { f: 146.83, peak: 0.08, a: 0.1, dec: 1.4 });
    },
    m3stars(t, o = {}) { const n = Math.max(1, Math.min(3, o.n || 1)); for (let i = 0; i < n; i++) bell(t + i * 0.22, semis(1046.5, i * 4), 0.09, 0.7); },
    m3fail(t) { pluck(t, 440, 0.08, 0.5); pluck(t + 0.2, 369.99, 0.07, 0.7); },                    // gentle: "again?"
    /* MATCH3's own names (docs: bus/MATCH3.md) */
    rise(t, o = {}) {        // a vessel rising into light: a soft glassy shimmer, a step higher per combo
      const c = Math.max(0, Math.min(PENTA.length - 1, o.combo || 0)), f = semis(783.99, PENTA[c]);
      tone(t, { f, f2: f * 1.5, peak: 0.05, a: 0.02, dec: 0.5 }); tone(t + 0.04, { f: f * 2, peak: 0.025, a: 0.02, dec: 0.4 });
      noiseHit(t, { type: 'highpass', f: 6500, peak: 0.03, a: 0.05, dec: 0.3 });
    },
    light(t) {               // the menorah-light special: a warm swell, never a blast
      for (const s of [0, 7, 12, 16]) tone(t, { type: 'triangle', f: semis(293.66, s), peak: 0.05, a: 0.25, dec: 1.1, lp: 2400 });
      noiseHit(t + 0.1, { type: 'highpass', f: 5200, peak: 0.03, a: 0.3, dec: 0.6 });
    },
    swoosh(t) { KIT.m3swap(t); },
    tool(t) { KIT.hammer(t, { stone: 'hard', tool: 'iron', force: 0.8 }); noiseHit(t + 0.03, { f: 1400, f2: 500, q: 1, peak: 0.12, dec: 0.25 }); },   // a hammer sweep on stone
    wood(t) {                // a cedar layer cut: the saw's bite and a woody knock
      noiseHit(t, { f: 1600, f2: 2400, q: 3, peak: 0.12, a: 0.02, dec: 0.12 }); noiseHit(t + 0.13, { f: 1500, f2: 2300, q: 3, peak: 0.1, a: 0.02, dec: 0.12 });
      tone(t + 0.26, { f: 210, f2: 150, peak: 0.2, dec: 0.12 });
    },
    win3(t) { KIT.m3win(t); KIT.m3stars(t + 0.9, { n: 3 }); },

    /* ── the kings of the nations (KINGS) ── */
    court(t) { for (const [f, dt] of [[293.66, 0], [440, 0.22]]) { tone(t + dt, { type: 'sawtooth', f, peak: 0.06, a: 0.06, dec: 0.7, lp: 1300 }); tone(t + dt, { f: f * 1.5, peak: 0.04, a: 0.06, dec: 0.7 }); } },
    deal(t) { tone(t, { f: 110, f2: 70, peak: 0.4, dec: 0.1 }); noiseHit(t, { type: 'lowpass', f: 900, peak: 0.35, dec: 0.06 }); KIT.coin(t + 0.15); },
    sail(t) { noiseHit(t, { type: 'lowpass', f: 380, f2: 900, peak: 0.25, a: 0.5, dec: 1.2 }); KIT.creak(t + 0.3, { tension: 0.1 }); },
    arrive(t) { bell(t, 659.25, 0.1, 1.2); bell(t + 0.2, 987.77, 0.08, 1.2); KIT.coin(t + 0.45); },
    page(t) { noiseHit(t, { f: 3200, q: 0.7, peak: 0.1, a: 0.02, dec: 0.14 }); },
    coinsIn(t, o = {}) { const n = Math.max(1, Math.min(8, o.n || 3)); for (let i = 0; i < n; i++) tone(t + i * 0.055, { f: 1250 + (i % 3) * 180, peak: 0.07, dec: 0.07 }); },
    seal(t) {                // a wax seal pressed on a treaty: a soft press and a small wooden knock
      noiseHit(t, { type: 'lowpass', f: 500, peak: 0.25, a: 0.02, dec: 0.12 }); tone(t + 0.03, { f: 160, f2: 110, peak: 0.25, dec: 0.12 });
      noiseHit(t + 0.16, { type: 'highpass', f: 2500, peak: 0.04, dec: 0.05 });
    },
    bell(t) { bell(t, 523.25, 0.12, 1.6); bell(t + 0.5, 523.25, 0.08, 1.4); },                    // a ship's bell: it arrived
    cart(t) { for (let i = 0; i < 4; i++) { tone(t + i * 0.18, { f: 96, f2: 80, peak: 0.12, dec: 0.08 }); noiseHit(t + i * 0.18, { f: 600, q: 2, peak: 0.06, dec: 0.1 }); } },   // wheels on a stone road

    /* ── water (WATER's events) ── */
    tap(t) { noiseHit(t, { f: 380, f2: 900, q: 3, peak: 0.12, a: 0.03, dec: 0.25 }); for (const k of [0.06, 0.13, 0.19]) tone(t + k, { f: 700 + Math.random() * 500, f2: 1400, peak: 0.03, dec: 0.04 }); },
    splash(t) { noiseHit(t, { type: 'highpass', f: 1500, peak: 0.12, a: 0.01, dec: 0.3 }); noiseHit(t, { type: 'lowpass', f: 600, peak: 0.08, dec: 0.2 }); },
    drip(t) { tone(t, { f: 1400, f2: 700, peak: 0.05, dec: 0.05 }); },
    pour(t) { noiseHit(t, { f: 900, q: 0.8, peak: 0.1, a: 0.15, dec: 1.0 }); },
    mukhni(t) {              // the kiyor's wheel (Tamid 3:8, pending CONTENT): a great slow wooden groan
      tone(t, { type: 'sawtooth', f: 58, f2: 74, peak: 0.12, a: 0.3, dec: 2.2, lp: 420, vib: 4 });
      noiseHit(t, { f: 260, q: 5, peak: 0.08, a: 0.3, dec: 2.2 });
      for (const k of [0.5, 1.2, 1.9]) KIT.wheel(t + k);
    },

    /* ── UI juice ── */
    pop(t) { tone(t, { f: 900, f2: 1500, peak: 0.06, dec: 0.05 }); },
    whoosh(t) { noiseHit(t, { f: 500, f2: 2200, q: 1.2, peak: 0.07, a: 0.04, dec: 0.18 }); },
    // ── land17 ── (PRINCIPLES §5) ui.banner: a rising pair on the pentatonic (D then A) over a breath of air — an event, not an alarm.
    // ui.stamp: the strongest sound of the kit (a word that lands): a low boom, a crack, a short brass chord on the open fifth, a bell.
    banner(t) {
      noiseHit(t, { f: 700, f2: 2400, q: 1.1, peak: 0.1, a: 0.05, dec: 0.2 });
      pluck(t + 0.04, 587.33, 0.16, 0.5); pluck(t + 0.15, 880, 0.18, 0.6);
    },
    stamp(t) {
      tone(t, { f: 98, f2: 42, peak: 0.9, a: 0.006, dec: 0.5 });
      noiseHit(t, { type: 'lowpass', f: 2600, peak: 0.55, a: 0.003, dec: 0.22 });
      for (const [f, p] of [[146.83, 0.14], [220, 0.12], [293.66, 0.1]]) { tone(t, { type: 'sawtooth', f, peak: p, a: 0.02, dec: 0.45, lp: 1900 }); tone(t, { type: 'square', f: f * 2, peak: p * 0.3, a: 0.02, dec: 0.35, lp: 1400 }); }
      bell(t + 0.03, 1174.66, 0.1, 0.9);
    },
    // ── /land17 ──

    // ── music18 ── wave 18 (the study: bus/MUSIC18.md). Every one varies per play; the pitches are the kit's key (D pentatonic ⊂ A major).
    // xpTick: a short rising tick for each point that lands in the counter — the pitch climbs a pentatonic ladder while the run lasts
    // (points ≤ 1.1 s apart), a pause resets it; {n} sets the step (1-based) when the caller counts the run itself
    xpTick(t, o = {}) {
      xpRun = o.n != null ? Math.max(0, (o.n | 0) - 1) : (t - xpLast > 1.1 ? 0 : xpRun + 1); xpLast = t;
      const k = Math.min(xpRun, PENTA.length - 1), f = semis(587.33, PENTA[k]), pk = 0.12 + Math.min(k, 8) * 0.004, v = pickV('xpTick', 4);
      if (v === 0) { tone(t, { type: 'triangle', f: f * 0.95, f2: f, peak: pk, a: 0.002, dec: 0.07, lp: 4200, pj: 0.003 }); tone(t, { f: f * 2, peak: pk * 0.3, dec: 0.04, pj: 0.003 }); }
      else if (v === 1) { tone(t, { f, peak: pk, a: 0.002, dec: 0.1, pj: 0.003 }); tone(t, { f: f * 3.98, peak: pk * 0.22, dec: 0.03, pj: 0.003 }); }
      else if (v === 2) { tone(t, { type: 'square', f, peak: pk * 0.5, a: 0.002, dec: 0.06, lp: 2400, pj: 0.003 }); tone(t, { f: f * 2, peak: pk * 0.35, dec: 0.05, pj: 0.003 }); }
      else { tone(t, { f, peak: pk, a: 0.002, dec: 0.12, pj: 0.003 }); tone(t, { f: f * 2.76, peak: pk * 0.28, dec: 0.06, pj: 0.003 }); }
      noiseHit(t, { type: 'highpass', f: 4500 + Math.random() * 2500, peak: 0.04 + k * 0.004, dec: 0.012 });
      if (xpRun >= PENTA.length) tone(t + 0.02, { f: f * 2, peak: 0.05, dec: 0.1, pj: 0.003 });   // past the ladder's top: a spark above it
    },
    // levelUp ({level 1…7}): the touch's own answer at once (a bright double tick), then — on the music's next beat — a rising run on the
    // pentatonic, a brass stab on the open fifth and a dum; a higher level climbs further. (The music's flourish('level') lands on the same beat.)
    levelUp(t, o = {}) {
      const tb = o.tb != null ? o.tb : t + 0.02, L = Math.max(1, Math.min(7, o.level | 0 || 1)), n = 4 + Math.min(L, 4);
      tone(t, { f: 1760, peak: 0.12, dec: 0.1, pj: 0.003 }); tone(t + 0.045, { f: 2349.3, peak: 0.1, dec: 0.16, pj: 0.003 });
      for (let i = 0; i < n; i++) pluck(tb + i * 0.055, semis(587.33, PENTA[i]), 0.1 + i * 0.006, 0.45);
      bell(tb + n * 0.055, semis(587.33, PENTA[n - 1] + 12), 0.1, 1.2);
      for (const [f, p] of [[293.66, 0.1], [440, 0.09], [587.33, 0.06]]) tone(tb, { type: 'sawtooth', f, peak: p, a: 0.02, dec: 0.4, lp: 1900, pj: 0.003 });
      tone(tb, { f: 98, f2: 46, peak: 0.55, a: 0.004, dec: 0.35 });
      noiseHit(tb, { type: 'highpass', f: 5000, f2: 9000, peak: 0.07, a: 0.05, dec: 0.5 });
    },
    // starPop ({n 1…3}): a star pops in — a bubble and a bell; the three make the open triad A · C# · E, the third with a shimmer and a soft dum
    starPop(t, o = {}) {
      const n = Math.max(1, Math.min(3, o.n | 0 || 1)), f = semis(880, [0, 4, 7][n - 1]);
      tone(t, { f: 500 + Math.random() * 120, f2: 1500, peak: 0.07, a: 0.003, dec: 0.06, pj: 0 });
      bell(t + 0.01, f, 0.1, 0.7 + 0.2 * n); tone(t + 0.01, { f: f * 2, peak: 0.04, dec: 0.3, pj: 0.003 });
      if (n === 3) { for (const [i, s] of [[1, 12], [2, 16]]) bell(t + 0.07 * i, semis(880, s), 0.06, 0.9); noiseHit(t, { type: 'highpass', f: 5500, f2: 9000, peak: 0.06, a: 0.04, dec: 0.4 }); tone(t, { f: 120, f2: 62, peak: 0.3, dec: 0.2 }); }
    },
    star(t, o = {}) { KIT.starPop(t, { n: (o.i | 0) + 1 }); },   // JUICE18's name: star {i 0…2}
    // big ({kind 'course'|'stage'}): the celebration's shimmer — a shower of bells up the pentatonic and a rising air, on the beat; the music's flourish carries the drums and the brass
    big(t, o = {}) {
      const tb = o.tb != null ? o.tb : t + 0.02, n = o.kind === 'stage' ? 10 : 7;
      tone(t, { f: 1318.5, peak: 0.1, dec: 0.12, pj: 0.003 });   // the touch's own answer at once; the shimmer waits for the beat
      for (let i = 0; i < n; i++) bell(tb + i * 0.07 + Math.random() * 0.02, semis(587.33, PENTA[i % PENTA.length] + (i >= PENTA.length ? 12 : 0)), 0.07 + i * 0.004, 0.9);
      noiseHit(tb, { type: 'highpass', f: 4000, f2: 9500, peak: 0.07, a: 0.12, dec: 0.9 });
    },
    // flyIn ({kind 'coin'|'mat'}): a coin or a material lands in its counter: a bright clink (coin) or a dull knock (a material)
    flyIn(t, o = {}) {
      const v = pickV('flyIn', 3);
      if (o.kind === 'mat') { tone(t, { f: 180 + v * 22, f2: 120, peak: 0.2, a: 0.002, dec: 0.07 }); noiseHit(t, { f: 900 + v * 250, q: 1.4, peak: 0.16, dec: 0.04 }); }
      else { const f = 1700 + v * 190 + Math.random() * 90; tone(t, { f, peak: 0.11, a: 0.002, dec: 0.07 }); tone(t + 0.035, { f: f * 1.5, peak: 0.1, a: 0.002, dec: 0.16 }); noiseHit(t, { type: 'highpass', f: 5000, peak: 0.04, dec: 0.01 }); }
    },
    // tab ({i 0…4}): a top tab — a small wooden tick, each tab its own degree of the pentatonic (so the five are a little scale)
    tab(t, o = {}) {
      const v = pickV('tab', 2), f = semis(440, PENTA[Math.max(0, Math.min(4, o.i | 0))]);
      tone(t, { type: v ? 'triangle' : 'sine', f: f * 0.97, f2: f, peak: 0.1, a: 0.002, dec: 0.06, pj: 0.003 });
      noiseHit(t, { type: 'bandpass', f: 1800 + v * 600, q: 1.5, peak: 0.12, dec: 0.015 });
    },
    // ── /music18 ──
    // ── hook19 ── dinar: the gold coin lands — a metallic two-partial ring (a bell and its inharmonic 2.76 partial), a small shimmer over it, a low dum; never a slot-machine's jingle: one clear ring
    dinar(t) {
      bell(t, 1318.5, 0.16, 1.7); bell(t + 0.004, 1318.5 * 2.76, 0.07, 1.1);
      bell(t + 0.2, 1975.5, 0.09, 1.4);
      noiseHit(t, { type: 'highpass', f: 6000, f2: 9500, peak: 0.05, a: 0.02, dec: 0.5 });
      tone(t, { f: 110, f2: 55, peak: 0.28, a: 0.004, dec: 0.3 });
    },
    // ── /hook19 ──
    // ── recovered (build 17) ── focus17's warnings and rewards: the fire low (two dull knocks), the alarm (three; o.soft), near a
    // record (a bell up the scale, o.n 1–3), a hit, a chord (o.up a fifth higher), the silver trumpets, too late (a falling pair)
    warn17(t) { for (const k of [0, 0.26]) { tone(t + k, { f: 92, f2: 70, peak: 0.42, a: 0.006, dec: 0.16 }); tone(t + k, { type: 'triangle', f: 330, peak: 0.07, a: 0.004, dec: 0.12, lp: 1400 }); } },
    alarm17(t, o = {}) {
      const s = o.soft ? 0.6 : 1;
      for (const k of [0, 0.17, 0.34]) { tone(t + k, { f: 104, f2: 78, peak: 0.45 * s, a: 0.004, dec: 0.12 }); tone(t + k, { type: 'square', f: 523.25, peak: 0.05 * s, a: 0.004, dec: 0.09, lp: 2200 }); }
      noiseHit(t, { type: 'lowpass', f: 900, peak: 0.12 * s, dec: 0.2 });
    },
    near17(t, o = {}) { const n = Math.max(1, Math.min(3, (o.n | 0) || 1)); bell(t, semis(783.99, PENTA[n + 1]), 0.06 + 0.02 * n, 0.6); },
    ding17(t) { bell(t, 1567.98, 0.13, 0.9); bell(t + 0.09, 2093, 0.1, 1); tone(t, { f: 140, f2: 90, peak: 0.12, dec: 0.08 }); },
    chord17(t, o = {}) {
      const b = o.up ? semis(587.33, 7) : 587.33;
      for (const [i, s] of [[0, 0], [1, 4], [2, 7], [3, 12]]) pluck(t + i * 0.045, semis(b, s), 0.11, 0.6);
      bell(t + 0.2, semis(b, 24), 0.06, 1.1); tone(t, { f: 98, f2: 60, peak: 0.3, dec: 0.25 }); noiseHit(t + 0.05, { type: 'highpass', f: 5000, f2: 9000, peak: 0.05, a: 0.03, dec: 0.4 });
    },
    trumpet17(t) {   // the silver trumpets (חצוצרות), a pair a little apart, never a shofar
      const N = [[440, 0, 0.14], [440, 0.16, 0.14], [659.25, 0.32, 0.22], [880, 0.56, 0.6]];
      for (const [f, dt, d] of N) for (const det of [0, 3.5]) { tone(t + dt, { type: 'sawtooth', f: f + det, peak: 0.07, a: 0.025, dec: d, lp: 2600, vib: 4 }); tone(t + dt, { type: 'square', f: (f + det) / 2, peak: 0.025, a: 0.03, dec: d, lp: 1200 }); }
      tone(t, { f: 110, f2: 55, peak: 0.35, dec: 0.3 });
    },
    late17(t) { pluck(t, 523.25, 0.1, 0.4); pluck(t + 0.18, 440, 0.09, 0.6); },
    // ── recovered (build 18) ── a coin into the till: one small bell up the scale with the count (o.n), an octave above ten
    coin18(t, o = {}) { const n = Math.max(0, o.n | 0), f = semis(1046.5, PENTA[n % 10] + 12 * Math.min(1, Math.floor(n / 10))); bell(t, f, o.big ? 0.08 : 0.055, 0.28); },
    // ── recovered (build 19) ── salt grains on the ramp
    salt19(t) { for (let i = 0; i < 3; i++) noiseHit(t + i * 0.025, { type: 'highpass', f: 4200 + Math.random() * 3000, peak: 0.08, dec: 0.022 }); },
    // ── recovered (build 20) ── the laver: a water bell, and the hands washed (a latch and a rising run)
    wbell20(t) {
      bell(t, 1318.51, 0.12, 1.6); bell(t + 0.06, 1975.53, 0.08, 1.4); bell(t, 659.25, 0.06, 1.8);
      for (const k of [0.32, 0.47, 0.66]) tone(t + k, { f: 1500 + Math.random() * 400, f2: 750, peak: 0.04, dec: 0.06 });
      noiseHit(t, { type: 'highpass', f: 5200, f2: 8000, peak: 0.04, a: 0.02, dec: 0.5 });
    },
    unlock20(t) {
      tone(t, { f: 120, f2: 70, peak: 0.3, dec: 0.12 }); noiseHit(t, { f: 520, q: 2.5, peak: 0.25, dec: 0.06 }); noiseHit(t + 0.07, { f: 900, f2: 600, q: 3, peak: 0.08, a: 0.02, dec: 0.16 });
      for (const [i, s] of [[0, 0], [1, 4], [2, 7], [3, 12], [4, 16]]) pluck(t + 0.16 + i * 0.06, semis(587.33, s), 0.1, 0.7);
      bell(t + 0.48, semis(587.33, 24), 0.07, 1.3);
    },
    // ── recovered (build 21) ── the ashes: the shovel's scrape (o.n climbs), a spill
    scrape21(t, o = {}) { const k = 1 + 0.05 * (o.n | 0); noiseHit(t, { f: 2300 * k, f2: 1000 * k, q: 3, peak: 0.22, a: 0.02, dec: 0.3 }); tone(t, { type: 'triangle', f: 1870 * k, f2: 1720 * k, peak: 0.03, dec: 0.38 }); tone(t + 0.02, { f: 2760 * k, peak: 0.016, dec: 0.28 }); },
    spill21(t) {
      tone(t, { f: 160, f2: 60, peak: 0.25, dec: 0.18 });
      for (let i = 0; i < 9; i++) noiseHit(t + 0.03 + Math.random() * 0.45, { f: 1800 + Math.random() * 2600, q: 4, peak: 0.12, a: 0.001, dec: 0.02 });
      noiseHit(t + 0.05, { type: 'highpass', f: 3000, peak: 0.06, a: 0.05, dec: 0.5 });
    },
    // ── recovered (build 22) ── the pyre: a log knocked on the stack (o.n climbs), a wrong one, a log that cracks, the fire taking
    knock22(t, o = {}) { const k = 1 + 0.04 * (o.n | 0); tone(t, { f: 165 * k, f2: 105 * k, peak: 0.42, dec: 0.16 }); noiseHit(t, { f: 720 * k, q: 4, peak: 0.3, dec: 0.07 }); noiseHit(t, { type: 'highpass', f: 3800, peak: 0.07, dec: 0.012 }); },
    err22(t) { for (const k of [0, 0.17]) tone(t + k, { type: 'square', f: 138, f2: 120, peak: 0.08, a: 0.004, dec: 0.12, lp: 900 }); },
    crack22(t) {
      noiseHit(t, { type: 'highpass', f: 2400, peak: 0.34, dec: 0.03 }); tone(t, { f: 230, f2: 70, peak: 0.25, dec: 0.12 });
      for (let i = 0; i < 5; i++) noiseHit(t + 0.03 + Math.random() * 0.18, { f: 1400 + Math.random() * 2400, q: 5, peak: 0.1, a: 0.001, dec: 0.02 });
    },
    fire22(t) {
      noiseHit(t, { f: 260, f2: 900, q: 0.8, peak: 0.25, a: 0.08, dec: 1.4 }); tone(t, { f: 62, f2: 48, peak: 0.22, a: 0.2, dec: 1.4 });
      for (let i = 0; i < 16; i++) noiseHit(t + 0.1 + Math.random() * 1.4, { f: 1600 + Math.random() * 3000, q: 4, peak: 0.07 + Math.random() * 0.08, a: 0.001, dec: 0.018 });
    },
    // ── recovered (build 23) ── the lots' drum (o.n climbs a semitone; o.end / o.big: the last, deeper, a second beat)
    drum23(t, o = {}) {
      const k = Math.pow(2, Math.min(12, o.n | 0) / 12), big = o.end || o.big;
      tone(t, { f: (big ? 92 : 140) * k, f2: (big ? 55 : 90) * k, peak: big ? 0.5 : 0.34, dec: big ? 0.3 : 0.12 }); noiseHit(t, { f: 1500 * k, q: 2, peak: 0.16, dec: 0.035 });
      if (o.end) tone(t + 0.11, { f: 110, f2: 60, peak: 0.42, dec: 0.32 });
    },
    // ── recovered (build 25) ── the pen: the torch, a hoof (o.n), the lamb's bleat (o.hi), the inspector's stamp (o.no: rejected), a bell
    torch25(t) { noiseHit(t, { f: 320, peak: 0.05, a: 0.06, dec: 0.4 }); for (let i = 0; i < 4; i++) noiseHit(t + Math.random() * 0.3, { type: 'highpass', f: 3000, peak: 0.08, dec: 0.015 }); },
    hoof25(t, o = {}) { const k = 1 + 0.03 * ((o.n | 0) % 4); tone(t, { f: 300 * k, f2: 170 * k, peak: 0.12, dec: 0.05 }); noiseHit(t, { f: 1300 * k, q: 3, peak: 0.08, dec: 0.025 }); },
    bleat25(t, o = {}) { const k = o.hi ? 1.12 : 1; for (let i = 0; i < 6; i++) tone(t + i * 0.055, { type: 'sawtooth', f: (540 - i * 18) * k, peak: 0.035 * (1 - i * 0.1), a: 0.01, dec: 0.05, lp: 1700 }); },
    stamp25(t, o = {}) { const k = o.no ? 0.8 : 1; tone(t, { f: 72 * k, f2: 44, peak: 0.6, dec: 0.32 }); noiseHit(t, { type: 'lowpass', f: 600, peak: 0.3, dec: 0.08 }); tone(t, { f: 420 * k, peak: 0.07, dec: 0.5 }); tone(t, { f: 1130 * k, peak: 0.035, dec: 0.4 }); },
    bell25(t) { bell(t, 698.46, 0.15, 1.8); bell(t + 0.02, 1046.5, 0.05, 1.3); bell(t + 0.4, 698.46, 0.07, 1.4); },
    // ── recovered (build 26) ── the Heichal (its report: "gate, bolt, echoing step, handful, scrape, pour tone 300→800 Hz, gold
    // bell, wick"): the great gate's echo, the bolt drawn, a step in the hall (o.n), the incense's handful, a scrape, the oil's
    // pour (o.f its pitch), the gold bell, the wick (o.hi)
    gate26(t) {
      for (let i = 0; i < 4; i++) { const k = Math.pow(0.42, i), dt = i * 0.33; tone(t + dt, { f: 52, f2: 38, peak: 0.55 * k, a: 0.02, dec: 1.4 }); noiseHit(t + dt, { type: 'lowpass', f: 380, peak: 0.3 * k, a: 0.03, dec: 0.6 }); }
      tone(t + 0.15, { type: 'sawtooth', f: 92, f2: 70, peak: 0.05, a: 0.2, dec: 1.2, lp: 400 });
    },
    bolt26(t) { noiseHit(t, { f: 900, f2: 420, q: 2, peak: 0.25, a: 0.03, dec: 0.32 }); tone(t + 0.3, { f: 140, f2: 90, peak: 0.3, dec: 0.12 }); },
    step26(t, o = {}) { const k = (o.n | 0) % 2 ? 1.06 : 1; for (let i = 0; i < 3; i++) { const e = Math.pow(0.35, i); noiseHit(t + i * 0.13, { f: 2100 * k, q: 2, peak: 0.12 * e, dec: 0.03 }); tone(t + i * 0.13, { f: 190 * k, f2: 120, peak: 0.09 * e, dec: 0.06 }); } },
    hand26(t, o = {}) { const k = 1 + 0.04 * (o.n | 0); noiseHit(t, { type: 'lowpass', f: 1200 * k, peak: 0.2, a: 0.02, dec: 0.16 }); tone(t + 0.08, { f: 1480 * k, peak: 0.02, dec: 0.3 }); },
    scrape26(t) { noiseHit(t, { f: 3800, f2: 2600, q: 6, peak: 0.16, a: 0.01, dec: 0.4 }); tone(t, { type: 'triangle', f: 2900, f2: 2500, peak: 0.05, dec: 0.38, vib: 9 }); },
    pour26(t, o = {}) { const f = Math.max(250, Math.min(900, +o.f || 300)); tone(t, { f, peak: 0.07, a: 0.01, dec: 0.1, pj: 0 }); noiseHit(t, { f: f * 3, q: 4, peak: 0.02, dec: 0.06 }); },
    bell26(t) { bell(t, 1318.5, 0.1, 1.4); bell(t + 0.01, 1975.5, 0.04, 1); },
    wick26(t, o = {}) { noiseHit(t, { type: 'highpass', f: o.hi ? 4200 : 3000, peak: 0.14, dec: 0.02 }); tone(t, { f: o.hi ? 1760 : 1320, peak: 0.05, dec: 0.05 }); },
    // ── recovered (build 21) ── the trumpets' blast (the terumat hadeshen's call)
    blast21(t) {
      for (const d of [0, 4]) { tone(t, { type: 'sawtooth', f: 587.33 + d, peak: 0.075, a: 0.04, dec: 0.62, lp: 3000, vib: 3 }); tone(t, { type: 'square', f: (587.33 + d) / 2, peak: 0.028, a: 0.05, dec: 0.56, lp: 1400 }); }
      tone(t + 0.4, { type: 'sawtooth', f: 880, peak: 0.065, a: 0.03, dec: 0.55, lp: 3200, vib: 4 }); tone(t, { f: 98, f2: 60, peak: 0.3, dec: 0.3 });
    },
  };

  function play(name, o = {}) {
    if (name === 'grave') { try { const B = globalThis.__BLOOD25 || (globalThis.__BLOOD25 = {}); B.tones = (B.tones | 0) + 1; B.toneRunning = ready(); } catch (e) { /* tests */ } }   // ── blooda25 ── (tests: the deep tone was asked)
    if (!ready()) return;
    if (name === 'star') { name = 'starPop'; o = { n: ((o && o.i) | 0) + 1 }; }   // ── music18 ── JUICE18's name: star {i 0…2}
    if (name === 'm3land') { const n = ctx.currentTime; if (n - lastLand < 0.05) return; lastLand = n; }   // many pieces land at once: one tick
    // the hero bound (PEOPLE's onImpact): the stroke already sounded AT contact, so the game's late generic strike is dropped
    // and a perfect keeps only its chime — one sound per blow, on the frame the tool meets the stone
    if (heroBound && (name === 'strike' || name === 'perfect') && ctx.currentTime - lastImpact < 0.9) { if (name === 'perfect') name = 'chime'; else return; }
    const f = KIT[name]; if (!f) return;
    try {
      // ── music18 ── the grade sounds when the hero's own stroke just sounded: only the accent (never two blows for one); this play's variation; a big moment's beat
      let oo = o || {}, tt = ctx.currentTime + 0.005;
      if (heroBound && (name === 'good' || name === 'soft') && ctx.currentTime - lastImpact < 0.9) oo = Object.assign({}, oo, { light: true });
      const vr = VARY[name]; PJ = vr ? vr[0] : 0; FJ = vr ? vr[1] : 0;
      if (BEATQ[name]) { const b = beatFn(); if (b && b.toNext > 0.02 && b.toNext <= b.period + 0.01) oo = Object.assign({}, oo, { tb: ctx.currentTime + b.toNext }); }
      const lv = levelOf(name, oo) * (trim && trim[name] > 0 ? trim[name] : 1) * (vr && vr[2] ? 1 + (Math.random() * 2 - 1) * vr[2] : 1);   // ── recovered (build 26c) ── (× trim)
      // ── /music18 ──
      if (name === 'levelUp' || name === 'big') { try { const M = globalThis.__BH_MUSIC; if (M && typeof M.flourish === 'function') M.flourish(name === 'levelUp' ? 'level' : oo.kind === 'stage' ? 'stage' : 'course', oo.level); } catch (e) { /* the music's */ } }   // the music's own hit lands on the same beat
      if (lv !== 1) { const g = ctx.createGain(); g.gain.value = lv; g.connect(master); OUT = g; }
      try { f(tt, oo); } finally { OUT = null; PJ = 0; FJ = 0; }
    } catch (e) { /* audio is best-effort */ }
  }

  // ── recovered (build 20) ── the kiddush water's rush (kiyor20, through sound.js's rush20): two loops of noise — a band and a hiss —
  // under one gain; k 0…1 sets it, under 0.02 it fades and stops
  let rush = null;
  function rush20(k) {
    k = Math.max(0, Math.min(1, +k || 0));
    if (!ready() || (!rush && k < 0.02)) return;
    const t = ctx.currentTime;
    if (!rush) {
      const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(master);
      rush = { g, L: [[1100, 'bandpass', 1], [3800, 'highpass', 0.4]].map(([f, type, v]) => { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), gg = ctx.createGain(); s.buffer = noise; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = 0.6; gg.gain.value = v; s.connect(fl); fl.connect(gg); gg.connect(g); s.start(t, Math.random() * 0.8); return s; }) };
    }
    rush.g.gain.setTargetAtTime(0.0001 + 0.12 * k, t, k > 0.5 ? 0.04 : 0.06);
    if (k < 0.02) { const R = rush; rush = null; setTimeout(() => { try { for (const s of R.L) s.stop(); R.g.disconnect(); } catch (e) { /* */ } }, 900); }
  }
  // ── recovered (16–26c) ── the Levites' choir: a held chord (five voices through a low-pass) on the beds bus; k 0…1, slow to swell
  // and to fade (trim.choir: 26c's level)
  let choirV = null;
  function choir(k) {
    k = Math.max(0, Math.min(1, +k || 0));
    if (!ready() || (!choirV && k < 0.02)) return;
    const t = ctx.currentTime;
    if (!choirV) {
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      g.gain.value = 0.0001; lp.type = 'lowpass'; lp.frequency.value = 760; lp.connect(g); g.connect(beds || master);
      choirV = { g, os: [146.83, 220, 293.66, 440.6, 369.99].map((f, i) => { const o = ctx.createOscillator(); o.type = i & 1 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 2) * 6; o.connect(lp); o.start(t); return o; }) };
    }
    choirV.g.gain.setTargetAtTime(0.0001 + 0.05 * k * (trim && trim.choir > 0 ? trim.choir : 1), t, 1.5);
    if (k < 0.02) { const C = choirV; choirV = null; setTimeout(() => { try { for (const o of C.os) o.stop(); C.g.disconnect(); } catch (e) { /* */ } }, 6000); }
  }

  /* ── ambience beds: filtered noise with a slow swell, plus scheduled life (birds, far hammers, doves) ── */
  let lifeTimer = 0;
  function stopAmb() {
    if (lifeTimer) { clearTimeout(lifeTimer); lifeTimer = 0; }
    if (!amb) return;
    const a = amb; amb = null;
    try { const t = ctx.currentTime; a.g.gain.cancelScheduledValues(t); a.g.gain.setTargetAtTime(0.0001, t, 0.4); setTimeout(() => { try { a.src.stop(); a.lfo.stop(); } catch (e) { /* stopped */ } }, 2000); } catch (e) { /* ignore */ }
  }
  function bird(t, far = 1) {        // two or three quick chirps, a little different each time
    const base = 2600 + Math.random() * 1600, n = 2 + (Math.random() * 2 | 0);
    for (let i = 0; i < n; i++) tone(t + i * (0.09 + Math.random() * 0.05), { f: base, f2: base * (1.25 + Math.random() * 0.3), peak: 0.018 * far, a: 0.004, dec: 0.06 });
  }
  function dove(t) { tone(t, { f: 410, f2: 380, peak: 0.02, a: 0.05, dec: 0.35, vib: 6 }); tone(t + 0.45, { f: 390, f2: 350, peak: 0.018, a: 0.05, dec: 0.5, vib: 6 }); }
  function farHammer(t) { const s = Math.random() < 0.5 ? 'lime' : 'hard'; noiseHit(t, { type: 'lowpass', f: STONE[s].f * 0.5, peak: 0.05, dec: 0.06 }); tone(t, { f: 140, f2: 80, peak: 0.03, dec: 0.08 }); }
  function scheduleLife(kind) {
    if (lifeTimer) clearTimeout(lifeTimer);
    const step = () => {
      lifeTimer = 0;
      if (!ready() || ambKind !== kind) return;
      const t = ctx.currentTime + 0.02, r = Math.random();
      if (kind === 'site') { if (r < 0.55) { farHammer(t); if (Math.random() < 0.5) farHammer(t + 0.45); } else bird(t, 0.8); }
      else if (kind === 'plaza') { if (r < 0.6) bird(t, 0.7); else dove(t); }
      else if (kind === 'birds') bird(t, 1);
      else if (kind === 'sea') { if (r < 0.35) tone(t, { f: 1250, f2: 900, peak: 0.015, a: 0.03, dec: 0.4, vib: 9 }); }   // a far gull
      else if (kind === 'night') { const f = 4300 + Math.random() * 500, n = 3 + (Math.random() * 4 | 0), far = 0.5 + Math.random() * 0.5; for (let c = 0; c < n; c++) for (let p = 0; p < 3; p++) tone(t + c * 0.42 + p * 0.034, { f, f2: f * 0.97, peak: 0.009 * far, a: 0.003, dec: 0.018 }); }   // ── world12 ── a cricket's chirps (three pulses each), near or far
      lifeTimer = setTimeout(step, kind === 'site' ? 1200 + Math.random() * 2600 : 1800 + Math.random() * 4200);
    };
    lifeTimer = setTimeout(step, 800);
  }
  function startAmb(kind) {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    const fl = ctx.createBiquadFilter();
    const g = ctx.createGain(); g.gain.value = 0.0001;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    let level = 0.03;
    if (kind === 'crowd' || kind === 'plaza' || kind === 'site') {
      fl.type = 'bandpass'; fl.frequency.value = kind === 'site' ? 560 : 650; fl.Q.value = 0.9; lfo.frequency.value = 0.23; lg.gain.value = 0.018;
      level = kind === 'crowd' ? 0.05 : kind === 'plaza' ? 0.04 : 0.028;
    } else if (kind === 'birds') { fl.type = 'highpass'; fl.frequency.value = 3000; fl.Q.value = 0.5; lfo.frequency.value = 0.1; lg.gain.value = 0.002; level = 0.004; }
    else if (kind === 'sea') { fl.type = 'lowpass'; fl.frequency.value = 520; fl.Q.value = 0.4; lfo.frequency.value = 0.09; lg.gain.value = 0.03; level = 0.04; }   // slow waves
    else if (kind === 'night') { fl.type = 'lowpass'; fl.frequency.value = 380; fl.Q.value = 0.3; lfo.frequency.value = 0.06; lg.gain.value = 0.006; level = 0.012; }   // ── world12 ── a still night: a breath of wind under the crickets
    else { fl.type = 'highpass'; fl.frequency.value = 1400; fl.Q.value = 0.5; lfo.frequency.value = 0.11; lg.gain.value = 0.008; }
    lfo.connect(lg); lg.connect(g.gain);
    src.connect(fl); fl.connect(g); g.connect(beds || master);   // ── recovered (build 26c) ── (the beds bus)
    g.gain.setTargetAtTime(level, t, 1.2);
    src.start(t); lfo.start(t);
    amb = { src, g, lfo };
    if (kind === 'site' || kind === 'plaza' || kind === 'birds' || kind === 'sea' || kind === 'night') scheduleLife(kind);   // (world12: + night)
  }
  let dayBed = null;                  // the bed that plays when the game asks for none (Phase A by day: the site's far hammers)
  function ambience(kind) {
    ambKind = kind || dayBed || null;
    if (!ctx || muted) { stopAmb(); return; }
    stopAmb();
    if (ambKind) startAmb(ambKind);
  }

  /* ── running water: its own bed (made once), its gain follows the open spigots ── */
  function setFlow(level) {
    flowWant = clamp01(+level || 0);
    if (!ctx || muted || ctx.state !== 'running') return;
    if (!flowBed) {
      if (flowWant <= 0) return;
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.6;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.7; lg.gain.value = 120; lfo.connect(lg); lg.connect(bp.frequency);
      src.connect(bp); bp.connect(hp); hp.connect(g); g.connect(beds || master); src.start(); lfo.start();   // ── recovered (build 26c) ── (beds)
      flowBed = { src, g, lfo };
    }
    try { flowBed.g.gain.setTargetAtTime(0.0001 + 0.06 * Math.sqrt(flowWant), ctx.currentTime, 0.5); } catch (e) { /* ignore */ }
  }
  function water(ev) {
    if (!ev) return;
    const k = ev.kind || ev.type;
    if (k === 'tap-open') { play('tap'); if (ev.spigots != null) setFlow(ev.spigots / 12); else setFlow(Math.min(1, flowWant + 1 / 12)); }
    else if (k === 'tap-close') { if (ev.spigots != null) setFlow(ev.spigots / 12); else setFlow(Math.max(0, flowWant - 1 / 12)); }
    else if (k === 'wash-splash' || k === 'wash-start') play('splash');
    else if (k === 'pour-start') play('pour');
    else if (k === 'pour-end') play('drip');
    else if (k === 'mukhni-start') play('mukhni');
    else if (k === 'channel') setFlow(ev.on === false ? 0 : Math.max(flowWant, 0.25));
  }
  function bindWater(w) {
    try { if (w && typeof w.onEvent === 'function') return w.onEvent((type, e) => water(e && typeof e === 'object' ? e : { kind: type })); } catch (e) { /* guarded */ }
    return () => {};
  }

  /* ── PEOPLE's contact events → the stroke's sound, at the frame the tool meets the stone ── */
  const KIND_TOOL = { dress: 'mallet', tamp: 'mallet', split: 'sledge', pick: 'pick', measure: null, pull: null, carry: null };
  let stoneOf = (target) => (typeof target === 'string' && SITE_STONE[target]) || (target && (SITE_STONE[target.site] || SITE_STONE[target.id])) || (target && target.boulder != null ? 'bedrock' : 'lime');
  function impact(ev = {}) {
    if (ctx) lastImpact = ctx.currentTime;
    const k = ev.kind || 'dress';
    if (k === 'measure') return play('measure');
    if (k === 'pull') return play('rope', { tension: 0.6 });
    if (k === 'carry') return play('grind');
    const tool = TOOL[ev.tool] ? ev.tool : (KIND_TOOL[k] || 'mallet');          // PEOPLE says which tool met the stone
    const chisel = k === 'chisel' || ev.tool === 'chisel' || (k === 'dress' && !ev.tool);   // PEOPLE: dress = the iron hammer, chisel = mallet on chisel
    if (k === 'split') play('wedge', { n: ev.n || 3 });
    else if (chisel) play('chisel', { force: ev.quality === 'perfect' ? 0.9 : 0.6 });
    // the stone: PEOPLE's workpiece when there is one (the altar's field stones, a quarry block), else the site's own stone
    const stone = ev.stone || (ev.workpiece === 'field' ? 'field' : ev.workpiece === 'quarry' ? 'bedrock' : stoneOf(ev.target)) || 'lime';
    play('hammer', { stone, tool: chisel ? 'mallet' : tool, force: ev.quality === 'perfect' ? 0.95 : 0.7, quality: ev.quality });
  }
  function bindHero(hero, opts = {}) {
    if (opts.stoneOf) stoneOf = opts.stoneOf;
    try { if (hero && typeof hero.onImpact === 'function') { const off = hero.onImpact(impact); heroBound = true; return () => { heroBound = false; try { if (typeof off === 'function') off(); } catch (e) { /* guarded */ } }; } } catch (e) { /* guarded */ }
    return () => {};
  }

  const juice = createJuice({ root, settings });
  const api = function sfx(name, o) { play(name, o); };
  Object.assign(api, {
    play, ambience, unlock, flow: setFlow, water, bindWater, impact, bindHero,
    dayBed(k) { dayBed = k || null; if (!ambKind && dayBed) ambience(null); },
    haptic: juice.haptic, shake: juice.shake, pop: juice.pop, juice, SOUNDS, BEDS,
    has: (name) => !!KIT[name],
    beatSource(fn) { if (typeof fn === 'function') beatFn = fn; },   // ── music18 ── (tests: a beat grid for the big moments; by default the music's own beat())
    // ── recovered (build 26c) ── the choir, the kiddush water, and duck(k): the beds bus to k (0…1; the Heichal's hush, heichal26)
    choir, rush20,
    duck(k) { bedsK = Math.max(0, Math.min(1, k == null ? 1 : +k || 0)); try { if (beds && ctx) beds.gain.setTargetAtTime(bedsK, ctx.currentTime, 0.12); } catch (e) { /* */ } return bedsK; },
  });
  Object.defineProperty(api, 'muted', {
    get() { return muted; },
    set(v) {
      muted = !!v;
      try { if (storage) storage.set(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* not remembered */ }
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.75, ctx.currentTime, 0.05);
      if (muted) { stopAmb(); } else if (ctx) { if (ambKind) { stopAmb(); startAmb(ambKind); } if (flowWant > 0) setFlow(flowWant); }
    },
  });
  Object.defineProperty(api, 'running', { get() { return !!ctx && ctx.state === 'running'; } });
  Object.defineProperty(api, 'context', { get() { return ctx; } });   // (wave 8B) read-only: MUSIC8B shares one AudioContext on a phone
  return api;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * The juice kit: haptics, a subtle shake, number pops. DOM only, guarded, reduced-motion aware, no allocation per
 * frame (the pops are a pool of 8 elements made once).
 *   const J = createJuice({ root, settings: () => ({ haptics: true }) });
 *   J.haptic(12 | [12, 30, 12]) · J.shake(el, 1) (amt 0…2, ~4 px at 1) · J.pop('+3', x, y, 'stone'|'gold'|'good'|'bad')
 * ──────────────────────────────────────────────────────────────────────────── */
const JUICE_CSS = `
.fx-pop{position:fixed;left:0;top:0;z-index:60;pointer-events:none;font:800 18px/1 "Heebo",system-ui,sans-serif;color:#FFF6DA;
  text-shadow:0 1px 0 #6B4A12,0 2px 6px rgba(40,24,6,.55);white-space:nowrap;opacity:0;direction:rtl;will-change:transform,opacity}
.fx-pop.gold{color:#FFD66E}.fx-pop.good{color:#B9F2C8}.fx-pop.bad{color:#FFE1D0}.fx-pop.big{font-size:26px}
@media (prefers-reduced-motion: reduce){.fx-pop{transition:none}}
`;
export function createJuice({ root = null, settings = null } = {}) {
  const hasDoc = typeof document !== 'undefined';
  const reduced = () => { try { return !!(globalThis.matchMedia && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  const allowHaptics = () => { try { const s = typeof settings === 'function' ? settings() : settings; return !s || s.haptics !== false; } catch (e) { return true; } };
  const pool = [];
  let ix = 0;
  function ensurePool() {
    if (!hasDoc || pool.length) return;
    if (!document.getElementById('fx-juice-css')) { const s = document.createElement('style'); s.id = 'fx-juice-css'; s.textContent = JUICE_CSS; document.head.appendChild(s); }
    const host = root || document.body;
    for (let i = 0; i < 8; i++) { const e = document.createElement('div'); e.className = 'fx-pop'; e.setAttribute('aria-hidden', 'true'); host.appendChild(e); pool.push(e); }
  }
  return {
    haptic(p) {
      if (!allowHaptics()) return;
      try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* unsupported */ }
    },
    shake(el, amt = 1) {
      if (!el || !el.animate || reduced()) return;
      const a = Math.max(0, Math.min(2, amt)) * 4;
      try { el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${a}px,${-a * 0.5}px)` }, { transform: `translate(${-a * 0.8}px,${a * 0.4}px)` }, { transform: `translate(${a * 0.4}px,0)` }, { transform: 'translate(0,0)' }], { duration: 220, easing: 'ease-out' }); } catch (e) { /* ignore */ }
    },
    pop(text, x, y, kind = '') {
      if (!hasDoc) return;
      ensurePool();
      const e = pool[ix++ % pool.length];
      if (!e) return;
      e.textContent = String(text);
      e.className = 'fx-pop' + (kind ? ' ' + kind : '');
      const rise = reduced() ? 0 : 46;
      try {
        e.animate([{ transform: `translate(${x}px,${y}px) translate(-50%,-50%) scale(.6)`, opacity: 0 }, { transform: `translate(${x}px,${y - rise * 0.35}px) translate(-50%,-50%) scale(1.12)`, opacity: 1, offset: 0.25 }, { transform: `translate(${x}px,${y - rise}px) translate(-50%,-50%) scale(1)`, opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
      } catch (err) { e.style.transform = `translate(${x}px,${y}px)`; e.style.opacity = '1'; setTimeout(() => { e.style.opacity = '0'; }, 700); }
    },
  };
}
