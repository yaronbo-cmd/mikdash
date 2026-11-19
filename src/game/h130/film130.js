/* ── build 130 ── h130/film130.js — the film of Simchat Beit HaShoeva (v3) after the evening's card, before the stage's end card: a
 * full-screen <video> over the game, a tap anywhere skips it. Its captions are burned into the film, so the game writes nothing over it.
 * Where it comes from (filmSrc, pure, tested): the page's own copy inlined as a data URI (window.__SBH_FILM: `FILM=1 node build.mjs`, the
 * single-file pages) → the file beside the page (dist/sbh-film-v3-small.mp4, by relative URL) → nothing (skipped). A film that cannot
 * load or play (its error event, or no `canplay` within FILM.WAIT) is skipped in silence: never a stuck screen. Its sound follows the
 * game's mute.
 */
export const FILM = Object.freeze({ FILE: 'sbh-film-v3-small.mp4', TYPE: 'video/mp4; codecs="avc1.42E01E"', WAIT: 4000, FADE: 400 });

/** which film to play: { kind: 'inline' | 'relative' | 'skip', src }. env = { inline (window.__SBH_FILM), protocol (location.protocol),
 *  file (FILM.FILE), off (a page that plays no film) } */
export function filmSrc(env = {}) {
  if (env.off) return { kind: 'skip', src: null };
  const inl = env.inline;
  if (typeof inl === 'string' && /^data:video\/[a-z0-9.+-]+;base64,/i.test(inl) && inl.length > 64) return { kind: 'inline', src: inl };
  // (a page with no folder of its own — about:srcdoc, data:, blob: — has nothing beside it to fetch)
  const pr = String(env.protocol || '');
  if (env.file && /^(https?|file):$/i.test(pr)) return { kind: 'relative', src: env.file };
  return { kind: 'skip', src: null };
}

/** plays the film full screen; resolves 'ended' | 'skipped' | 'failed' | 'none' once it is gone (never rejects) */
export function playFilm(X, o = {}) {
  let env;
  try { env = { inline: globalThis.__SBH_FILM, protocol: location.protocol, file: FILM.FILE, off: !!globalThis.__SBH_FILM_OFF }; } catch (e) { env = {}; }
  const pick = filmSrc({ ...env, ...o });
  try { globalThis.__SBH_FILM_STATE = { kind: pick.kind, state: pick.kind === 'skip' ? 'none' : 'loading' }; } catch (e) { /* (the probes' eyes) */ }
  if (pick.kind === 'skip' || typeof document === 'undefined') return Promise.resolve('none');
  // (build 130 closing: a browser that cannot decode the film's H.264 says so at once — no black frame, no wait, straight to the end card)
  try {
    const t = document.createElement('video');
    if (t.canPlayType && !t.canPlayType(FILM.TYPE)) { globalThis.__SBH_FILM_STATE = { kind: pick.kind, state: 'failed', why: 'type', t: 0 }; return Promise.resolve('failed'); }
  } catch (e) { /* */ }
  return new Promise((res) => {
    const box = document.createElement('div'); box.className = 'h109-ui h130-film';
    // (the black box shows only once the film can play: while it loads, or if it never does, the world stays in view — no black frame held)
    box.style.cssText = `position:fixed;inset:0;z-index:95;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity ${FILM.FADE}ms`;
    const v = document.createElement('video');
    v.setAttribute('playsinline', ''); v.playsInline = true; v.preload = 'auto'; v.controls = false;
    v.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000';
    let muted = true; try { muted = !!(X && X.sfx && X.sfx.muted); } catch (e) { /* */ }
    v.muted = muted;
    box.appendChild(v); document.body.appendChild(box); document.body.classList.add('h130-film-on');
    let done = false, ready = false;
    const state = (s) => { try { globalThis.__SBH_FILM_STATE = { kind: pick.kind, state: s, t: +(v.currentTime || 0).toFixed(1) }; } catch (e) { /* */ } };
    const finish = (why) => {
      if (done) return; done = true; clearTimeout(tm); state(why);
      try { v.pause(); } catch (e) { /* */ }
      box.removeEventListener('pointerdown', tap, true); removeEventListener('keydown', key, true);
      const shown = ready; box.style.opacity = '0';
      setTimeout(() => { try { v.removeAttribute('src'); v.load(); } catch (e) { /* */ } box.remove(); document.body.classList.remove('h130-film-on'); res(why); }, shown ? FILM.FADE : 0);
    };
    const tap = (e) => { e.stopPropagation(); e.preventDefault(); finish('skipped'); };
    const key = (e) => { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); finish('skipped'); } };
    box.addEventListener('pointerdown', tap, true); addEventListener('keydown', key, true);
    v.addEventListener('error', () => finish('failed'));
    v.addEventListener('ended', () => finish('ended'));
    v.addEventListener('canplay', () => {
      if (ready || done) return; ready = true; state('playing'); box.style.opacity = '1'; box.style.pointerEvents = 'auto';
      const p = v.play(); if (p && p.catch) p.catch(() => {
        // (a browser that will not start sound without a gesture: the film plays muted rather than not at all)
        if (!v.muted) { v.muted = true; v.play().catch(() => finish('failed')); } else finish('failed');
      });
    });
    const tm = setTimeout(() => { if (!ready) finish('failed'); }, o.wait || FILM.WAIT);
    v.src = pick.src;
    try { v.load(); } catch (e) { finish('failed'); }
  });
}
