/** b131 look round: the stage's close in large type — the big card's title large and clear of the goal pill, the walk's hint gone,
 *  and the end card high, large and on a light veil, the white yesod whole below it. On from the stage's finale (before the big card)
 *  to the end card's close (index.js h31Done). */
const CARD_CSS = 'body.h131-card .tw-zone{visibility:hidden!important}'
      + 'body.h131-card .jx>.jx-big{padding-top:calc(env(safe-area-inset-top,0px) + 19vh);gap:10px}'
      + 'body.h131-card .jx-bt{font-size:clamp(44px,7.4vw,84px)}body.h131-card .jx-bs{font-size:clamp(19px,2.5vw,28px)}'
      + 'body.h131-card .gm-modal{place-items:start center;padding-top:calc(env(safe-area-inset-top,0px) + 70px);background:linear-gradient(180deg,rgba(14,10,4,.5),rgba(14,10,4,.12) 55%,rgba(14,10,4,0))}'
      + 'body.h131-card .gm-card{width:min(100%,540px);padding:20px 24px 18px}'
      + 'body.h131-card .gm-card .gm-kick{font-size:14px}body.h131-card .gm-card h2{font-size:clamp(30px,4.4vw,44px);margin:8px 0 10px}body.h131-card .gm-card p{font-size:clamp(16px,2vw,20px)}';
export function h131Card(on) {
  try {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('h131-card-css')) { const c2 = document.createElement('style'); c2.id = 'h131-card-css'; c2.textContent = CARD_CSS; document.head.appendChild(c2); }
    document.body.classList.toggle('h131-card', !!on);
    globalThis.__HERO_RING_OFF = !!on;   // (look round 2: no gold ring at the kohen's feet under the cards)
  } catch (e) { /* */ }
}
