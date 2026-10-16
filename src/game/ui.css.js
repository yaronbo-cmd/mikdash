/* ui.css.js: the game HUD stylesheet (injected once by ui.js).
 * Colours are tokens on :root with the page's light/dark pattern. Blur is kept small (phones), sheets are
 * solid. Everything sits under .gm so it cannot leak into page.html's own chrome. */
export const CSS = `
:root{
  --gm-ink:#2A2016; --gm-soft:#6B5A45; --gm-faint:#776750;
  --gm-panel:rgba(251,246,236,.9); --gm-solid:#FBF6EC; --gm-raise:#FFFDF8; --gm-line:rgba(120,92,52,.22);
  --gm-gold:#855E14; --gm-gold-hi:#E8B94A; --gm-gold-ink:#3B2A08; --gm-red:#A3261F; --gm-ok:#276B43; --gm-blue:#1F4F7A;
  --gm-shadow:0 8px 26px rgba(40,28,12,.18); --gm-scrim:rgba(24,18,10,.42); --gm-blur:6px;
  --gm-chip:rgba(255,252,245,.88); --gm-bar:rgba(120,92,52,.16);
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --gm-ink:#F3E9D6; --gm-soft:#C2B195; --gm-faint:#A39377;
  --gm-panel:rgba(27,22,17,.9); --gm-solid:#1D1813; --gm-raise:#262019; --gm-line:rgba(232,200,150,.18);
  --gm-gold:#E4B656; --gm-gold-hi:#F2CF77; --gm-gold-ink:#1D1406; --gm-red:#E0675F; --gm-ok:#6CC592; --gm-blue:#93BCEA;
  --gm-shadow:0 8px 26px rgba(0,0,0,.45); --gm-scrim:rgba(0,0,0,.55); --gm-chip:rgba(33,27,21,.88); --gm-bar:rgba(232,200,150,.14);
}}
:root[data-theme="dark"]{
  --gm-ink:#F3E9D6; --gm-soft:#C2B195; --gm-faint:#A39377;
  --gm-panel:rgba(27,22,17,.9); --gm-solid:#1D1813; --gm-raise:#262019; --gm-line:rgba(232,200,150,.18);
  --gm-gold:#E4B656; --gm-gold-hi:#F2CF77; --gm-gold-ink:#1D1406; --gm-red:#E0675F; --gm-ok:#6CC592; --gm-blue:#93BCEA;
  --gm-shadow:0 8px 26px rgba(0,0,0,.45); --gm-scrim:rgba(0,0,0,.55); --gm-chip:rgba(33,27,21,.88); --gm-bar:rgba(232,200,150,.14);
}
/* game mode hides the demo chrome of page.html */
body.gm-on .top, body.gm-on .dock, body.gm-on #hint, body.gm-on #mk{display:none!important}
body.gm-on.gm-view .dock{display:flex!important}
body.gm-on .card{z-index:70; bottom:max(calc(env(safe-area-inset-bottom,0px) + 92px), calc(var(--ui-dock,0px) + 10px))}
@media (min-width:760px){ body.gm-on .card{bottom:max(calc(env(safe-area-inset-bottom,0px) + 96px), calc(var(--ui-dock,0px) + 10px))} }

.gm{position:fixed;inset:0;z-index:20;pointer-events:none;direction:rtl;color:var(--gm-ink);
  font-family:"Heebo",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;-webkit-tap-highlight-color:transparent}
/* ── flow9 ── (QA9 16:31 P0) the board (MATCH3) mounts inside the HUD, whose pointer-events:none it inherited: dead to touch */
.gm .m3{pointer-events:auto}
.gm :where(button){font:inherit;color:inherit;margin:0;border:0;background:none;cursor:pointer}
.gm :where(p,h2,h3,ol,ul){margin:0}
.gm .gm-hidden{display:none!important}
.gm-i{width:1.15em;height:1.15em;flex:0 0 auto;display:inline-block;vertical-align:-.2em}
.gm-num{font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate}

/* ── top bar ── */
.gm-top{position:absolute;top:0;inset-inline:0;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 0;display:flex;gap:8px;align-items:center;pointer-events:none}
.gm-rb{pointer-events:auto;position:relative;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--gm-chip);border:1px solid var(--gm-line);box-shadow:var(--gm-shadow);-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur))}
.gm-rb .gm-i{width:20px;height:20px}
/* ── ui ── touch targets ≥ 44 px (QA P1-5, P2-11/12): where the look must keep its size, an invisible hit area
   (::after, or ::before where ::after is taken) extends the control; test/qa-walk.cjs counts it. (An inset counts from the
   padding box: a 1 px border adds one px.) */
.gm-rb::after,.gm-x::after,.gm-pill::after,.gm-demo button::after,.gm-btn.sm::after,.gm-node::after,.gm-tabs button::after,.gm-seg button::after,.gm-mishmarot button::after{content:"";position:absolute;inset:-3px}
.gm-res{pointer-events:auto;display:flex;gap:6px;flex:1 1 auto;min-width:0;justify-content:center;justify-content:safe center;flex-wrap:nowrap;overflow:hidden}
@media (max-width:430px){.gm-res{gap:4px}.gm-res .gm-chip{padding:5px 7px;gap:3px;font-size:13px}}   /* (QA P1-2) four resources fit a phone */
.gm-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:999px;background:var(--gm-chip);border:1px solid var(--gm-line);box-shadow:0 2px 10px rgba(40,28,12,.1);font:600 14px/1 "Heebo",system-ui,sans-serif;white-space:nowrap;-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur));transition:transform .18s}
.gm-chip.flash{transform:scale(1.14);border-color:var(--gm-gold-hi)}
.gm-chip-tag{font:700 11px/1 "Heebo",system-ui,sans-serif;color:var(--gm-gold);margin-inline-start:1px;letter-spacing:.2px}   /* ── build7 ── "לחומה" */
.gm-chip.low{color:var(--gm-red)}
.gm-goal{position:absolute;top:calc(env(safe-area-inset-top,0px) + 58px);inset-inline:0;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;padding:0 12px}
.gm-pill-alt{pointer-events:auto;position:relative;min-height:44px;max-width:min(92vw,520px);padding:0 14px;border-radius:999px;border:1px solid var(--gm-line);background:var(--gm-panel);color:inherit;box-shadow:var(--gm-shadow);font:600 13px/1.2 "Heebo",system-ui,sans-serif;cursor:pointer;-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur))}
.gm-pill-alt.gm-hidden{display:none}
.gm-pill{pointer-events:auto;position:relative;display:flex;align-items:center;gap:8px;max-width:min(92vw,520px);min-height:38px;padding:7px 14px 7px 12px;border-radius:999px;background:var(--gm-panel);border:1px solid var(--gm-line);box-shadow:var(--gm-shadow);font:500 13.5px/1.25 "Heebo",system-ui,sans-serif;text-align:start;-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur))}
.gm-pill b{font-weight:700}
.gm-pill .gm-k{font:700 11px/1 "Heebo",sans-serif;letter-spacing:.4px;color:var(--gm-gold);flex:0 0 auto}
.gm-pill .gm-sub{color:var(--gm-soft)}
.gm-pill.attn{border-color:var(--gm-gold-hi);box-shadow:0 0 0 3px rgba(232,185,74,.28),var(--gm-shadow)}
.gm-prog{width:22px;height:22px;flex:0 0 auto}
.gm-pill::after{inset:-4px 0}
.gm-demo{position:absolute;top:calc(env(safe-area-inset-top,0px) + 100px);inset-inline:0;display:flex;justify-content:center;gap:6px;pointer-events:none}
.gm-demo span{pointer-events:auto;font:700 11.5px/1 "Heebo",sans-serif;letter-spacing:.3px;color:#fff;background:#7A2E8C;border-radius:999px;padding:6px 10px;box-shadow:var(--gm-shadow)}
.gm-demo button{pointer-events:auto;position:relative;font:700 12px/1 "Heebo",sans-serif;color:#7A2E8C;background:#F4E6F8;border:1px solid #C9A2D6;border-radius:999px;padding:7px 12px;box-shadow:0 2px 8px rgba(40,28,12,.14)}
.gm-demo button::after{inset:-5px -3px -14px}
.gm.coach-on .gm-demo{top:calc(env(safe-area-inset-top,0px) + 176px)}   /* (supervisor, 30.9, N77) the coach's hand on the pill never covers "שלבים ▾" */
.gm-demo{align-items:center}
.gm-demo .gm-demo-x{color:#fff;background:#7A2E8C;border-color:#7A2E8C;min-height:44px}   /* ── flow8 ── the demo's exit chip */
.gm-demo button{min-height:44px;min-width:44px;padding:0 16px;font-size:13px;display:inline-flex;align-items:center}   /* ── flow10 ── (BRIEF10) the demo chips at 44 px */
.gm-demo button::after{inset:-3px}
/* ── director13 ── (PRODUCER13 N81: in the demo the chips covered the crews' line "הצוות מניח אבן בעוד 0:01" under the pill) the line
   sits below the demo's chips; with the coach's hand on, the chips go lower (N77) and the line keeps its place */
body.gm-demo-on .gm-goal .gm-next{position:relative;top:48px}
body.gm-demo-on .gm.coach-on .gm-goal .gm-next{top:0}
/* ── /director13 ── */

/* ── toasts ── */
.gm-toasts{position:absolute;top:calc(env(safe-area-inset-top,0px) + 104px);inset-inline:0;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;padding:0 12px}
body.gm-demo-on .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 152px)}   /* ── flow10 ── (below the 44-px chips) */
.gm-toast{pointer-events:auto;max-width:min(92vw,460px);display:flex;gap:10px;align-items:flex-start;padding:10px 14px;border-radius:14px;background:var(--gm-solid);border:1px solid var(--gm-line);box-shadow:var(--gm-shadow);font:500 13.5px/1.4 "Heebo",sans-serif;opacity:0;transform:translateY(-8px);transition:opacity .22s,transform .22s}
.gm-toast.on{opacity:1;transform:none}
.gm-toast b{display:block;font-weight:700;font-size:14px}
.gm-toast .gm-i{width:22px;height:22px;margin-top:1px}
.gm-toast.mini{padding:7px 12px;font-size:13px}
.gm-toast.fact span{display:block;margin-top:2px}.gm-toast .gm-fact-ref{display:block;margin-top:4px;font-size:11.5px;color:var(--gm-muted,#6b5a3e)}   /* ── flow8 ── */

/* ── bottom dock ── */
.gm-dock{position:absolute;bottom:0;inset-inline:0;padding:0 10px calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;justify-content:center;pointer-events:none}
.gm-dock nav{pointer-events:auto;display:flex;gap:2px;padding:5px;border-radius:20px;background:var(--gm-panel);border:1px solid var(--gm-line);box-shadow:var(--gm-shadow);-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur));max-width:100%}
.gm-db{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:62px;padding:7px 6px 6px;border-radius:15px;font:600 11.5px/1 "Heebo",sans-serif;color:var(--gm-soft)}
.gm-db .gm-i{width:24px;height:24px;color:var(--gm-ink)}
.gm-db[aria-pressed="true"]{background:var(--gm-ink);color:var(--gm-solid)}
.gm-db[aria-pressed="true"] .gm-i{color:var(--gm-solid)}
.gm-badge{position:absolute;top:2px;inset-inline-end:8px;min-width:18px;height:18px;border-radius:9px;background:var(--gm-red);color:#fff;font:700 11px/18px "Heebo",sans-serif;padding:0 5px;text-align:center}
.gm-badge.gold{background:var(--gm-gold-hi);color:var(--gm-gold-ink)}

/* ── sheets: bottom sheet on phones, a side panel on wide screens ── */
.gm-sheet{position:absolute;inset-inline:0;bottom:0;max-height:min(74vh,640px);display:flex;flex-direction:column;background:var(--gm-solid);border-top:1px solid var(--gm-line);border-radius:22px 22px 0 0;box-shadow:0 -10px 34px rgba(40,28,12,.22);pointer-events:auto;transform:translateY(105%);transition:transform .26s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom,0px)}
.gm-sheet.on{transform:none}
.gm-sh-h{display:flex;align-items:center;gap:10px;padding:14px 16px 10px;border-bottom:1px solid var(--gm-line)}
.gm-sh-h h2{font:700 20px/1.2 "Frank Ruhl Libre","Times New Roman",serif;flex:1 1 auto;min-width:0}
.gm-x{position:relative;width:34px;height:34px;border-radius:50%;border:1px solid var(--gm-line)!important;display:grid;place-items:center;color:var(--gm-soft);flex:0 0 auto}
.gm-x::after{inset:-6px}
.gm-sh-b{overflow-y:auto;padding:12px 16px 18px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
@media (min-width:760px){
  .gm-sheet{inset-inline:auto 16px;inset-inline-start:auto;left:16px;right:auto;bottom:88px;top:auto;width:400px;max-height:calc(100vh - 170px);border:1px solid var(--gm-line);border-radius:20px;transform:translateX(-30px);opacity:0;transition:transform .22s,opacity .22s;pointer-events:none}
  .gm-sheet.on{transform:none;opacity:1;pointer-events:auto}
  /* ── ui ── (responsive pass) a tablet is wide enough for the side sheet but not for the centred HUD beside it: the coach's
     bubble and the toasts move to the free part of the screen, right of the sheet, and (below) the sheet stops under the
     goal pill and its strip, which it covered on 768–1150 px screens */
  .gm.sheet-open .gm-bub{left:432px;right:16px;max-width:min(calc(100vw - 464px),360px)}
  .gm.sheet-open .gm-toasts{left:416px}
}
@media (min-width:760px) and (max-width:1199px) and (min-height:600px){ .gm-sheet{max-height:calc(100vh - 230px)} }
.gm-draft{display:inline-block;font:700 10.5px/1.5 "Heebo",sans-serif;color:var(--gm-blue);border:1px solid currentColor;border-radius:999px;padding:0 7px;letter-spacing:.3px;vertical-align:2px;flex:0 0 auto}
.gm-sec{margin:14px 0 6px;font:700 12px/1 "Heebo",sans-serif;letter-spacing:.5px;color:var(--gm-soft)}
.gm-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gm-line)}
.gm-row:last-child{border-bottom:0}
button.gm-row{min-height:44px}
.gm-row .gm-grow{flex:1 1 auto;min-width:0}
.gm-row small{display:block;color:var(--gm-soft);font-size:12.5px;margin-top:2px}
.gm-muted{color:var(--gm-soft)}
.gm-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;padding:8px 16px;border-radius:12px;background:var(--gm-raise)!important;border:1px solid var(--gm-line)!important;font:600 14px/1.1 "Heebo",sans-serif;white-space:nowrap}
.gm-btn-gold{background:linear-gradient(180deg,#F2CF77,#E0A83A)!important;border-color:#B7862A!important;color:#2A1A04!important;box-shadow:0 3px 12px rgba(169,122,30,.35)}
.gm-btn[disabled]{opacity:.5;cursor:default}
.gm-btn.sm{position:relative;min-width:40px;min-height:36px;padding:6px 11px;font-size:13px;border-radius:10px}
.gm-btn.sm::after{inset:-5px -3px}
.gm-btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.gm-card.gm-pick .gm-btn-row{flex-direction:column;flex-wrap:nowrap;gap:6px;max-height:min(52vh,460px);overflow-y:auto;overscroll-behavior:contain;padding:2px}
.gm-card.gm-pick .gm-btn{flex:none!important;min-height:44px}
.gm-cost{display:inline-flex;gap:8px;flex-wrap:wrap;font:600 13px/1 "Heebo",sans-serif}
.gm-cost span{display:inline-flex;align-items:center;gap:3px}
.gm-cost .lack{color:var(--gm-red)}
.gm-bar{height:10px;border-radius:6px;background:var(--gm-bar);overflow:hidden;position:relative}
.gm-bar i{position:absolute;inset-block:0;inset-inline-start:0;background:linear-gradient(90deg,#E0A83A,#F2CF77);border-radius:6px}
.gm-bar .tick{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--gm-solid)}
.gm-phase{display:flex;justify-content:space-between;font:600 11.5px/1 "Heebo",sans-serif;color:var(--gm-soft);margin-top:6px}
.gm-phase .on{color:var(--gm-ink)}
.gm-warn{margin-top:10px;padding:9px 12px;border-radius:12px;background:rgba(163,38,31,.08);color:var(--gm-red);font:600 13.5px/1.35 "Heebo",sans-serif}
.gm-note{margin-top:10px;padding:9px 12px;border-radius:12px;background:var(--gm-bar);font:500 13.5px/1.45 "Heebo",sans-serif}
.gm-q{font:500 17px/1.85 "Frank Ruhl Libre","Times New Roman",serif}
.gm-ref{display:block;margin-top:4px;font:700 12.5px/1.3 "Heebo",sans-serif;color:var(--gm-blue)}
.gm-ref::before{content:"מקור · ";font-weight:500;opacity:.8}
.gm-seg{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.gm-seg button{position:relative;min-height:38px;padding:7px 11px;border-radius:999px;border:1px solid var(--gm-line)!important;font:600 13px/1 "Heebo",sans-serif;background:var(--gm-raise)!important}
.gm-seg button[aria-pressed="true"]{background:var(--gm-ink)!important;color:var(--gm-solid)!important;border-color:transparent!important}
.gm-seg button::after{inset:-4px 0}
.gm-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--gm-line)}
.gm-toggle small{display:block;color:var(--gm-soft);font-size:12.5px;margin-top:2px}
.gm-sw{position:relative;width:48px;height:28px;border-radius:14px;background:var(--gm-bar);border:1px solid var(--gm-line)!important;flex:0 0 auto;transition:background .2s}
.gm-sw::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);transition:inset-inline-start .2s}
.gm-sw[aria-checked="true"]{background:var(--gm-ok)}
.gm-sw[aria-checked="true"]::after{inset-inline-start:23px}
.gm-sw::before{content:"";position:absolute;inset:-9px -3px}
.gm-tabs{display:flex;gap:4px;margin-bottom:8px;overflow-x:auto;scrollbar-width:none;padding-block:4px}
.gm-tabs button{position:relative;flex:0 0 auto;min-width:44px;min-height:38px;padding:8px 10px;border-radius:10px;font:700 14px/1 "Frank Ruhl Libre",serif;border:1px solid var(--gm-line)!important}
.gm-tabs button[aria-pressed="true"]{background:var(--gm-ink)!important;color:var(--gm-solid)}
.gm-tabs button::after{inset:-4px 0}
.gm-lock{color:var(--gm-soft)}
.gm-lock b{font-weight:600}
.gm-lock small{color:var(--gm-soft)}
.gm-lock>.gm-i{opacity:.7}
.gm-check{color:var(--gm-ok);font-weight:700}
.gm-vine{width:100%;height:auto;display:block;margin:6px 0}
.gm-map{display:flex;flex-wrap:wrap;gap:10px 6px}
.gm-node{position:relative;display:inline-flex;align-items:center;gap:5px;min-height:36px;padding:7px 10px;border-radius:12px;border:1px solid var(--gm-line)!important;font:600 13px/1.1 "Heebo",sans-serif;background:var(--gm-raise)!important}
.gm-node.done{color:var(--gm-ok)}
.gm-node.avail{border-color:var(--gm-gold-hi)!important;box-shadow:0 0 0 2px rgba(232,185,74,.3)}
.gm-node.building{background:rgba(232,185,74,.18)!important}
.gm-node.locked{color:var(--gm-soft);background:transparent!important;border-style:dashed!important}
.gm-node::after{inset:-5px 0}
.gm-kv{display:grid;grid-template-columns:1fr auto;gap:6px 12px;font:500 14px/1.3 "Heebo",sans-serif}
.gm-kv b{font-weight:700;text-align:end}

/* ── modal cards (stage done, story, welcome back) ── */
.gm-modal{position:absolute;inset:0;display:grid;place-items:center;padding:16px;background:var(--gm-scrim);pointer-events:auto;opacity:0;transition:opacity .24s}
.gm-modal.on{opacity:1}
.gm-card{width:min(100%,460px);max-height:calc(100vh - 32px);overflow-y:auto;background:var(--gm-solid);border:1px solid var(--gm-line);border-radius:20px;box-shadow:var(--gm-shadow);padding:18px 18px 16px;transform:translateY(12px) scale(.98);transition:transform .26s cubic-bezier(.2,.8,.2,1)}
.gm-modal.on .gm-card{transform:none}
.gm-card .gm-kick{font:700 11.5px/1 "Heebo",sans-serif;letter-spacing:.6px;color:var(--gm-gold)}
.gm-card h2{font:900 26px/1.15 "Frank Ruhl Libre","Times New Roman",serif;margin:6px 0 10px;text-wrap:balance}
.gm-card p{font:500 15px/1.6 "Heebo",sans-serif}
.gm-card .gm-q{margin:4px 0}
.gm-card.quiet h2{font-weight:700;color:var(--gm-soft)}
.gm-rew{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.gm-rew span{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:999px;background:var(--gm-bar);font:600 13px/1 "Heebo",sans-serif}
.gm-input{width:100%;box-sizing:border-box;margin-top:8px;min-height:46px;padding:11px 12px;border-radius:12px;border:1px solid var(--gm-line);background:var(--gm-raise);color:var(--gm-ink);font:500 16px/1.2 "Heebo",sans-serif}
.gm-mishmarot{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;max-height:30vh;overflow-y:auto;padding:3px 0}
.gm-mishmarot button{position:relative;min-width:44px;min-height:44px;padding:7px 11px;border-radius:999px;border:1px solid var(--gm-line)!important;font:600 13.5px/1 "Frank Ruhl Libre",serif;background:var(--gm-raise)!important}
.gm-mishmarot button[aria-pressed="true"]{background:var(--gm-ink)!important;color:var(--gm-solid)!important}
.gm-mishmarot button::after{inset:-3px 0}   /* ── flow10 ── (PRODUCER10 N12) 44 px tall */

/* ── world-anchored overlays: the rhythm ring, floats, the coach ── */
.gm-anchor{position:absolute;left:0;top:0;will-change:transform;pointer-events:none}
/* ── flow8 ── the name: a HUD chip at the meter's end (it shrinks first), a plate over the hero, the greeting card */
.gm-top .gm-name{pointer-events:auto;cursor:pointer;flex:0 50 auto;min-width:34px;max-width:96px;overflow:hidden;color:var(--gm-ink);min-height:34px;position:relative}
.gm-top .gm-name span{overflow:hidden;text-overflow:ellipsis}
.gm-top .gm-name::after{content:"";position:absolute;inset:-5px -2px}
.gm-plate{font:700 12.5px/1 "Heebo",sans-serif;color:#3B2A12;background:rgba(255,248,232,.86);border:1px solid rgba(201,162,74,.8);border-radius:999px;padding:4px 9px;white-space:nowrap;box-shadow:0 2px 8px rgba(40,28,12,.18);transition:opacity .25s}
/* ── flow8 ── the target: a gold ring on it (1 Hz) and a pointer bobbing over it, its tip just above the ring (DESIGN8B R2) */
.gm-mark{width:0;height:0;z-index:2;transition:opacity .2s}
.gm-mark-ring{position:absolute;left:calc(var(--r,40px) * -1);top:calc(var(--r,40px) * -.55);width:calc(var(--r,40px) * 2);height:calc(var(--r,40px) * 1.1);border-radius:50%;border:4px solid #FFD66E;box-shadow:0 0 14px 3px rgba(255,190,70,.75),inset 0 0 10px rgba(255,190,70,.4);animation:gm-mark-pulse 1s ease-in-out infinite;box-sizing:border-box}
.gm-mark.noring .gm-mark-ring{opacity:0;animation:none}
.gm-mark.solo .gm-mark-ring{opacity:0;animation:none}   /* ── flow10 ── (N7) one ring: the world's under his feet */
.gm-mark-ptr{position:absolute;left:-21px;top:calc(var(--r,40px) * -.55 - 62px);width:42px;height:58px;animation:gm-mark-bob 1s ease-in-out infinite;filter:drop-shadow(0 2px 3px rgba(40,20,0,.45))}
.gm-mark-ptr svg{width:100%;height:100%;display:block}
@keyframes gm-mark-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
@keyframes gm-mark-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.14);opacity:.62}}
@media (prefers-reduced-motion:reduce){.gm-mark-ring,.gm-mark-ptr{animation:none}}
.gm.sheet-open .gm-mark{display:none}
.gm-sh-b .gm-line{margin:10px 2px 2px;font:600 15px/1.5 "Heebo",sans-serif}   /* ── flow8 ── the panel's one line */
.gm-card.greet{text-align:center}.gm-card.greet p{text-align:center}
.gm-greet{display:grid;place-items:center;width:64px;height:64px;margin:4px auto 6px;border-radius:50%;background:linear-gradient(180deg,#FFF6DD,#F1D9A0);border:2px solid #C9A24A}
.gm-greet .gm-i{width:36px;height:36px;color:#6A4A16}
.gm-card h2.gm-greet-h{font-size:26px}
/* ── econ14 ── */
.gm-ring{width:0;height:0}
.gm-ring b{position:absolute;left:-29px;top:-29px;width:58px;height:58px;box-sizing:border-box;border-radius:50%;border:5px solid #FFD66E;box-shadow:0 0 0 2px rgba(60,40,10,.6),inset 0 0 0 2px rgba(60,40,10,.35),0 0 10px rgba(255,190,70,.55);opacity:0;transition:background-color .08s,box-shadow .08s}
.gm-ring.live b{opacity:1}
.gm-ring.near b{background:rgba(255,214,110,.5);box-shadow:0 0 0 2px rgba(60,40,10,.6),0 0 24px 8px rgba(255,200,80,.95)}
.gm-ring i{position:absolute;left:-29px;top:-29px;width:58px;height:58px;box-sizing:border-box;border-radius:50%;border:4px solid #8CC0FF;box-shadow:0 0 0 2px rgba(12,30,70,.6),0 0 12px rgba(110,170,255,.75);opacity:0}
.gm-ring.hit i{border-color:#FFF3C4;box-shadow:0 0 22px 6px rgba(255,200,80,.85)}
.gm-ring em{position:absolute;left:0;top:-58px;transform:translateX(-50%);font:900 21px/1 "Heebo",sans-serif;font-style:normal;color:#FFE08A;text-shadow:0 1px 3px rgba(0,0,0,.8),0 0 10px rgba(255,170,40,.8);white-space:nowrap;opacity:0;direction:rtl}
.gm-ring.live.now em{opacity:1}
.gm-ring s{position:absolute;left:0;top:38px;transform:translateX(-50%);font:800 16px/1.2 "Heebo",sans-serif;text-decoration:none;color:#FFF;text-shadow:0 1px 3px rgba(0,0,0,.85),0 0 8px rgba(0,0,0,.5);white-space:nowrap;opacity:0;transition:opacity .25s;direction:rtl}
.gm-ring s.on{opacity:1}.gm-ring s.ok{color:#FFE08A}.gm-ring s.warn{color:#FFC9BF}
.gm-ring u{position:absolute;left:-8px;top:4px;width:46px;height:46px;opacity:0;transition:transform .09s}
.gm-ring u .gm-hand{width:46px;height:46px}
.gm-ring.live.teach u{opacity:1}
.gm-ring.live.teach.now u{transform:translateY(-8px) scale(.88)}
@media (prefers-reduced-motion:reduce){.gm-ring b,.gm-ring u{transition:none}}
.gm-top .gm-res{align-items:center}.gm-top .gm-res .gm-purse{min-height:44px;min-width:56px}
.gm-purse{min-height:44px;min-width:56px;justify-content:center;border:2px solid #C9A24A!important;background:linear-gradient(180deg,#FFF8E4,#F3DFA8)!important;color:#3A2A10;font-weight:800}
.gm-purse .gm-i{width:24px;height:24px}
.gm-coin{width:30px;height:30px;margin:-15px 0 0 -15px;opacity:0;pointer-events:none;z-index:40;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))}
.gm-coin .gm-i{width:30px;height:30px}
.gm-shop-head{display:flex;flex-direction:column;gap:2px;margin:2px 0 6px}.gm-shop-head small{color:var(--gm-muted,#7A6A4A);font-size:12px}
.gm-shop-have{display:inline-flex;align-items:center;gap:6px;font:800 18px/1.2 "Heebo",sans-serif}.gm-shop-have .gm-i{width:26px;height:26px}
.gm-shop{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:4px 0 10px}
.gm-shop-card{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 6px;border-radius:14px;background:var(--gm-raise,#FFF8E8);border:1px solid var(--gm-line,#D9C79F);text-align:center;font:600 13px/1.3 "Heebo",sans-serif}
.gm-shop-card b{font-size:15px}.gm-shop-card small{color:var(--gm-muted,#6A5A3A);font-size:12px}
.gm-shop-pic{width:44px;height:44px}
.gm-shop-tag{font-weight:800}
.gm-buy{min-height:44px!important;min-width:96px;margin-top:auto;gap:4px}.gm-buy .gm-i{width:20px;height:20px}.gm-buy small{font-size:11px;opacity:.85}
.gm-buy[aria-disabled="true"]{opacity:.62}
.gm-shop-full{margin-top:auto;font-size:12px;color:var(--gm-muted,#6A5A3A);min-height:44px;display:flex;align-items:center}
.gm-shop-closed{padding:14px;border-radius:14px;background:#F3E7C8;font:600 15px/1.5 "Heebo",sans-serif}
.gm-shop-note{font-size:11.5px;margin:4px 2px 8px}
@media (max-width:430px){.gm-shop{grid-template-columns:1fr 1fr 1fr;gap:6px}.gm-shop-card{padding:6px 3px;gap:2px}.gm-shop-card small:not(.gm-shop-tag){display:none}.gm-shop-pic{width:36px;height:36px}.gm-shop-card b{font-size:14px}.gm-buy{min-width:84px;padding:6px 8px}}
.gm-x::after{inset:-5px}
.gm-ring small{position:absolute;left:0;top:64px;transform:translateX(-50%);font:800 15px/1.25 "Heebo",sans-serif;color:#FFE08A;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.6);white-space:nowrap;opacity:0;transition:opacity .25s;direction:rtl}
.gm-ring.live.teach small{opacity:1}
/* ── /econ14 ── */
.gm-combo{position:absolute;left:0;top:0;transform:translate(-50%,-72px);font:900 15px/1 "Heebo",sans-serif;color:#FFE7A6;text-shadow:0 1px 3px rgba(0,0,0,.6),0 0 10px rgba(255,170,40,.7);white-space:nowrap;opacity:0;transition:opacity .2s}
.gm-combo.on{opacity:1}
.gm-float{position:absolute;left:0;top:0;font:800 17px/1 "Heebo",sans-serif;color:#FFF;text-shadow:0 1px 3px rgba(0,0,0,.7),0 0 8px rgba(0,0,0,.35);white-space:nowrap;opacity:0;will-change:transform,opacity;direction:ltr}
.gm-float.gold{color:#FFE08A}
.gm-float.warn{color:#FFB4A8;font-size:14px;direction:rtl}
.gm-coach{position:absolute;left:0;top:0;pointer-events:none}
.gm-coach .gm-hand{position:absolute;left:-14px;top:-4px;width:40px;height:40px;animation:gm-tap 1.1s ease-in-out infinite}
.gm-bub{position:absolute;inset-inline:0;margin:0 auto;bottom:calc(env(safe-area-inset-bottom,0px) + 94px);width:max-content;max-width:min(86vw,360px);padding:10px 16px;border-radius:14px;background:var(--gm-solid);border:1px solid var(--gm-gold-hi);box-shadow:var(--gm-shadow);font:600 15px/1.4 "Heebo",sans-serif;text-align:center;pointer-events:none}
@media (max-width:759px){
  .gm.sheet-open .gm-bub{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 104px)}
  .gm.sheet-open .gm-coach,.gm.sheet-open .gm-ring,.gm.sheet-open .gm-combo{display:none}
  .gm.sheet-open.coach-on .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 176px)}
}
.gm-bub small{display:block;font:600 11px/1 "Heebo",sans-serif;color:var(--gm-gold);margin-bottom:4px;letter-spacing:.4px}
@keyframes gm-tap{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(8px) scale(.92)}}
/* ── ui ── (QA P2-5) the coach waits while a card is up: its bubble peeked out under the modal's scrim */
.gm:has(> .gm-modal) .gm-bub,.gm:has(> .gm-modal) .gm-coach{visibility:hidden}
.gm:has(> .gm-modal) .gm-mark,.gm-momenton .gm-mark{visibility:hidden}   /* ── flow11 ── (PRODUCER11 N57: the pointer over a card's top edge) */
.gm-vision{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .8s}
.gm-vision.on{opacity:1}
/* ── ui ── (QA P2-4) the first words a player reads: cream on a soft dark band, so the glowing gold plan behind cannot wash
   them out (a gold halo in the shadow only added to the glow) */
.gm-vision::before{content:"";position:absolute;left:0;right:0;top:50%;height:clamp(170px,32vh,300px);transform:translateY(-50%);background:radial-gradient(closest-side,rgba(24,15,3,.66),rgba(24,15,3,.4) 55%,rgba(24,15,3,0));pointer-events:none}
.gm-vision h1{position:relative;font:900 clamp(30px,8vw,54px)/1.1 "Frank Ruhl Libre","Times New Roman",serif;color:#FFF3D6;letter-spacing:.3px;text-shadow:0 1px 1px rgba(28,16,0,.95),0 2px 6px rgba(28,16,0,.8),0 0 24px rgba(28,16,0,.55);text-align:center;padding:0 20px}
.gm-back{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);inset-inline-start:12px;pointer-events:auto}
/* ── build7 ── the opening's cinema: the HUD steps aside, the title sits in the sky above the House, a tap anywhere skips */
.gm-cine{position:absolute;inset:0;border:0;margin:0;padding:0 0 calc(env(safe-area-inset-bottom,0px) + 18px);background:linear-gradient(to top,rgba(20,12,2,.34),rgba(20,12,2,0) 20%);display:flex;align-items:flex-end;justify-content:center;pointer-events:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;color:#FFF3D6}
.gm-cine span{font:600 14px/1 "Heebo",sans-serif;opacity:.9;text-shadow:0 1px 3px rgba(20,12,2,.95);letter-spacing:.3px;padding:0 18px;min-height:44px;display:inline-flex;align-items:center}
.gm-cinema .gm-top,.gm-cinema .gm-goal,.gm-cinema .gm-dock,.gm-cinema .gm-toasts,.gm-cinema .gm-demo{opacity:0;pointer-events:none}
.gm-momenton .gm-top,.gm-momenton .gm-goal,.gm-momenton .gm-dock,.gm-momenton .gm-bub,.gm-momenton .gm-coach{opacity:0;pointer-events:none;transition:opacity .2s}
.gm-vision.top{place-items:start center;padding-top:calc(env(safe-area-inset-top,0px) + 10vh)}
.gm-vision.top::before{top:calc(env(safe-area-inset-top,0px) + 10vh + 30px)}

/* ── key moments ── */
.gm-mo{position:absolute;inset:0;display:grid;place-items:center;padding:14px;background:radial-gradient(120% 90% at 50% 40%,rgba(10,8,5,.18),rgba(10,8,5,.62));pointer-events:auto;opacity:0;transition:opacity .25s}
.gm-mo.on{opacity:1}
.gm-mo-card{position:relative;width:min(100%,420px);background:var(--gm-solid);border:1px solid var(--gm-gold-hi);border-radius:20px;box-shadow:var(--gm-shadow);padding:14px 14px 12px}
.gm-mo-top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.gm-mo-k{font:700 11px/1 "Heebo",sans-serif;letter-spacing:.5px;color:var(--gm-gold)}
.gm-mo-t{font:900 21px/1.15 "Frank Ruhl Libre",serif;flex:1 1 auto}
.gm-mo-play{position:relative;border-radius:14px;background:linear-gradient(180deg,#F3E7CF,#E4D2AE);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
:root[data-theme="dark"] .gm-mo-play{background:linear-gradient(180deg,#3A3024,#2A2219)}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]) .gm-mo-play{background:linear-gradient(180deg,#3A3024,#2A2219)} }
.gm-mo-svg{display:block;width:100%;height:auto;max-height:52vh}
.gm-mo-hint{min-height:1.4em;margin-top:10px;padding-inline:44px;text-align:center;font:600 14.5px/1.35 "Heebo",sans-serif}   /* (room for "דלג" at its end) */
.gm-mo-hint.ok{color:var(--gm-ok)}
.gm-mo-end{margin-top:8px}
.gm-mo-end .gm-btn{width:100%;margin-top:10px}
/* menu buttons with a subtitle: title and subtitle wrap inside the button (QA P0-2) */
.gm-btn.gm-btn-block{display:block;white-space:normal;line-height:1.3;padding:10px 14px;text-align:center}
.gm-btn.gm-btn-block svg{display:inline-block;vertical-align:-3px;margin-inline-end:6px}
.gm-mo-src .gm-q{font-size:16px;line-height:1.7}
.gm-mo-skip{position:absolute;bottom:2px;inset-inline-end:4px;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 10px;font:600 13px/1 "Heebo",sans-serif;color:var(--gm-soft);text-decoration:underline}
.gm-mo-skip[hidden],.gm-mo-hold[hidden]{display:none}
.gm-mo-hold{position:absolute;bottom:10px;inset-inline-start:50%;transform:translateX(50%);min-height:46px;padding:10px 22px;font-weight:700;background:var(--gm-solid)!important;box-shadow:var(--gm-shadow)}
.gm-mo-count{position:absolute;top:8px;inset-inline-start:10px;font:800 14px/1 "Heebo",sans-serif;background:var(--gm-solid);border-radius:999px;padding:5px 10px;box-shadow:var(--gm-shadow);direction:ltr}
.gm-mo-meter{position:absolute;top:10px;inset-inline-start:10px;width:110px;height:8px;border-radius:4px;background:rgba(255,255,255,.25);overflow:hidden}
.gm-mo-meter i{display:block;height:100%;width:0;background:#E8B94A}
.gm-mo-meter.hot i{background:#E0675F}
.gm-mo-ashlar{fill:#D8C6A0;stroke:#A8916A;stroke-width:1.5}
.gm-mo-big{fill:#E2D2B0;stroke:#9C8358;stroke-width:2}
.gm-mo-boss{fill:#D3BF95;stroke:rgba(156,131,88,.5);stroke-width:1}
.gm-mo-big,.gm-mo-boss{transition:fill .3s}
.placed .gm-mo-big{fill:#F0DFB8}
.gm-mo-mark{stroke:#C98A12;stroke-width:3;stroke-dasharray:7 5}
.gm-mo-crane{fill:none;stroke:#7A5A36;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
.gm-mo-wheel{fill:none;stroke:#7A5A36;stroke-width:4}
.gm-mo-rope{stroke:#4A3A28;stroke-width:2}
.gm-mo-fence{stroke:#A8916A;stroke-width:1.5}
.gm-mo-rail{fill:#C9B48C}
.gm-mo-latline{stroke:#B59E74;stroke-width:1.6}
.gm-mo-hole{fill:#4A3A26;stroke:#FFC84A;stroke-width:3;stroke-dasharray:6 4;animation:gm-glow 1.2s ease-in-out infinite}
.gm-mo-gap{cursor:pointer;outline:none}
.gm-mo-gap:focus-visible .gm-mo-hole{stroke:#fff}
.gm-mo-gap.fixed .gm-mo-hole{animation:none;stroke:none}
.gm-mo-patchbg{fill:#EFE3C8}
.gm-mo-patch{stroke:#A8916A;stroke-width:1.2}
.gm-mo-puff{fill:rgba(255,236,190,.9);animation:gm-puff .6s ease-out forwards}
@keyframes gm-glow{0%,100%{stroke-opacity:1}50%{stroke-opacity:.35}}
@keyframes gm-puff{from{r:4;opacity:1}to{r:22;opacity:0}}
.gm-mo-drag{cursor:ns-resize;outline:none}
.gm-mo-ground{fill:#BFA67C}
.gm-mo-alt{fill:#EDE3D0;stroke:#B9A57F;stroke-width:1.5}
.gm-mo-course{stroke:rgba(150,128,90,.45);stroke-width:1}
.gm-mo-lab{font:600 11px "Heebo",sans-serif;fill:#8A7350}
.gm-mo-red rect{fill:#B3261E}
.gm-mo-red circle{fill:#B3261E;stroke:#fff;stroke-width:2}
.gm-mo-red.set rect{fill:#8E1B15}
.gm-mo-floor{fill:#B9A57F}
.gm-mo-upper{fill:rgba(255,248,230,.35)}
.gm-mo-box{fill:#C49A62;stroke:#7A5A36;stroke-width:2}
.gm-mo-boxline{stroke:#7A5A36;stroke-width:1.2}

@media (prefers-reduced-motion: reduce){
  .gm *,.gm *::before,.gm *::after{animation:none!important;transition:none!important}
}
@media (max-width:440px){ .gm-res{gap:4px} .gm-chip{padding:5px 8px;gap:4px;font-size:13px} .gm-top{gap:6px;padding-inline:10px} }
@media (max-width:400px){ .gm-res{gap:2px} .gm-res .gm-chip{padding:4px 6px;gap:2px;font-size:12.5px} .gm-chip-tag{font-size:10px} .gm-top{gap:5px;padding-inline:8px} }   /* ── flow10 ── (PRODUCER10 N18: six chips and the 44-px menu button on a 390-px phone) */
@media (max-width:370px){ .gm-db{min-width:54px;font-size:10.5px} .gm-chip{padding:4px 6px;font-size:12.5px} }
.gm-top.gm-tight{gap:4px;padding-inline:6px}.gm-top.gm-tight .gm-res{gap:2px}.gm-top.gm-tight .gm-res .gm-chip{padding:4px 4px;gap:1px;font-size:12px}.gm-top.gm-tight .gm-chip .gm-i{width:13px;height:13px}.gm-top.gm-tight .gm-name{max-width:60px}
.gm-top.gm-tighter .gm-chip-tag{display:none}.gm-top.gm-tighter .gm-name span{display:none}.gm-top.gm-tighter .gm-res .gm-chip{padding:4px 3px}
/* ── ui ── the investor strip fits a 360 px phone on one line */
@media (max-width:400px){ .gm-demo{gap:4px;padding-inline:6px} .gm-demo span,.gm-demo button{font-size:11px;padding-inline:9px;letter-spacing:0} }
/* ── build6 ── the meter (always on top: six chips on a 360 px phone), the one action, the site panel */
.gm-res .gm-chip{cursor:pointer;color:var(--gm-ink);min-height:34px;position:relative}
.gm-res .gm-chip::after{content:"";position:absolute;inset:-6px -2px}
.gm-chip.need{border-color:var(--gm-gold-hi)}
.gm-chip.low{color:var(--gm-red);border-color:var(--gm-red)}
.gm-chip .gm-i{width:17px;height:17px}
@media (max-width:440px){ .gm-res .gm-chip{padding:4px 6px;gap:3px;font-size:12.5px} .gm-chip .gm-i{width:15px;height:15px} }
.gm-pill.play{background:linear-gradient(180deg,rgba(242,207,119,.96),rgba(224,168,58,.96));color:#2A1A04;border-color:#B7862A}
.gm-pill.play .gm-k,.gm-pill.play .gm-sub{color:#4A3006}
.gm-big{display:flex;flex-direction:column;width:100%;min-height:54px;margin:12px 0 6px;font-size:16.5px;font-weight:700}
.gm-big small{display:block;font-weight:500;font-size:12.5px;opacity:.85;margin-top:2px}
.gm-steps{display:flex;gap:3px;list-style:none;margin:10px 0 2px;padding:0;counter-reset:ph}
.gm-steps li{flex:1 1 0;text-align:center;font:600 10.5px/1.15 "Heebo",sans-serif;color:var(--gm-soft);padding-top:9px;border-top:4px solid var(--gm-bar);border-radius:2px}
.gm-steps li.done{border-top-color:var(--gm-gold)}
.gm-steps li.on{border-top-color:var(--gm-gold-hi);color:var(--gm-ink)}
.gm-course{display:grid;grid-template-columns:repeat(auto-fill,minmax(13px,1fr));gap:3px;margin:6px 0 10px}
.gm-course i{height:13px;border-radius:2px;border:1px solid var(--gm-line);background:transparent}
.gm-course i.stock{background:var(--gm-bar)}
.gm-course i.on{background:var(--gm-gold);border-color:var(--gm-gold)}
.gm-course i.key{outline:2px solid var(--gm-gold-hi);outline-offset:-1px}
.gm-plan{font-size:13.5px;opacity:.95}
.gm-board{display:flex;flex-direction:column;gap:4px;margin:8px 0 12px}
.gm-brow{width:100%;text-align:start;background:var(--gm-raise);border:1px solid var(--gm-line);border-radius:10px;padding:8px 10px;min-height:44px;color:inherit;font:inherit;cursor:pointer}
/* ── fun14 ── */
.gm-deal{position:absolute;inset-inline:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 78px);z-index:6;background:var(--gm-solid);border:1px solid var(--gm-line);border-radius:20px;box-shadow:0 -6px 30px rgba(40,28,12,.28);pointer-events:auto;transform:translateY(calc(100% + 100px));opacity:0;transition:transform .26s cubic-bezier(.2,.8,.2,1),opacity .2s;padding:6px 10px 10px;box-sizing:border-box;max-width:560px;margin:0 auto}
.gm-deal.on{transform:none;opacity:1}
.gm.sheet-open .gm-deal.on,.gm.gm-momenton .gm-deal.on,.gm.modal-open .gm-deal.on{transform:translateY(calc(100% + 100px));opacity:0;pointer-events:none}
.gm-deal-h{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.gm-deal-h>div{flex:1;min-width:0}
.gm-deal-h h2{margin:0;font:800 18px/1.15 "Heebo",sans-serif}
.gm-deal-h h2 .gm-draft{font-size:10px;vertical-align:middle}
.gm-deal-sub{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font:500 13px/1.3 "Heebo",sans-serif;color:var(--gm-soft)}
.gm-deal-h .gm-x{position:relative;min-width:44px;min-height:44px;border:0;background:transparent;color:inherit;border-radius:12px;cursor:pointer}
.gm-deal-tip{margin:-3px 0 6px;font:500 13px/1.35 "Heebo",sans-serif;color:var(--gm-soft)}
.gm-deal-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.gm-deal-cards.one{grid-template-columns:1fr}
/* ── flow16 ── the extra card ("▶ הביאו אבנים") under the two jobs when the stock is out: a low third row, the jobs stay first */
.gm-deal-cards.extra .gm-jc.quarry{grid-column:1 / -1;min-height:64px;flex-direction:row;justify-content:flex-start;gap:10px;padding:6px 12px}
.gm-deal-cards.extra .gm-jc.quarry .gm-jc-art{width:64px;height:44px;flex:0 0 auto}
.gm-deal-cards.extra .gm-jc.quarry .gm-jc-n{font-size:15px}
/* ── /flow16 ── */
.gm-jc{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;min-height:148px;padding:8px 8px 9px;border-radius:18px;border:2px solid var(--gm-line);background:var(--gm-raise);color:inherit;font:inherit;text-align:center;cursor:pointer;box-shadow:var(--gm-shadow);-webkit-tap-highlight-color:transparent;transition:transform .12s}
.gm-jc:active{transform:scale(.97)}
.gm-jc.stone{border-color:#C9A66B}
.gm-jc.craft{border-color:#9B6A3A}
.gm-jc.quarry{min-height:150px;border-color:var(--gm-gold-hi);background:linear-gradient(180deg,rgba(242,207,119,.35),var(--gm-raise))}
.gm-jc-art{position:relative;width:100%;height:58px;border-radius:12px;background:linear-gradient(160deg,#E9D8B4,#CDB083);overflow:hidden}
.gm-jc.craft .gm-jc-art{background:linear-gradient(160deg,#D9B98C,#8E5E33)}
.gm-jc-g{position:absolute;inset:6px 10px;width:calc(100% - 20px);height:calc(100% - 12px)}
.gm-jc-hand{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-14px 0 0 -10px}
.gm-jc-hand .gm-hand{width:100%;height:100%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))}
.gm-jc-hand.h-tap{animation:gmjTap 1s ease-in-out infinite}
.gm-jc-hand.h-drag{animation:gmjDrag 1.6s ease-in-out infinite}
.gm-jc-hand.h-rub{animation:gmjRub .9s linear infinite}
.gm-jc-hand.h-pull{animation:gmjPull 1.1s ease-in-out infinite}
.gm-jc-hand.h-hold{animation:gmjHold 1.4s ease-in-out infinite}
.gm-jc-hand.h-circle{animation:gmjCircle 1.4s linear infinite}
@keyframes gmjTap{0%,100%{transform:translateY(-6px)}45%{transform:translateY(6px) scale(.9)}}
@keyframes gmjDrag{0%{transform:translateX(34px)}50%{transform:translateX(-34px)}100%{transform:translateX(34px)}}
@keyframes gmjRub{0%{transform:translate(-18px,0)}25%{transform:translate(0,-10px)}50%{transform:translate(18px,0)}75%{transform:translate(0,10px)}100%{transform:translate(-18px,0)}}
@keyframes gmjPull{0%{transform:translateY(-22px)}70%{transform:translateY(22px)}100%{transform:translateY(-22px)}}
@keyframes gmjHold{0%,100%{transform:scale(1)}30%,80%{transform:scale(.88) translateY(4px)}}
@keyframes gmjCircle{0%{transform:rotate(0) translateX(22px) rotate(0)}100%{transform:rotate(360deg) translateX(22px) rotate(-360deg)}}
@media (prefers-reduced-motion: reduce){.gm-jc-hand{animation:none!important}}
.gm-jc-new{position:absolute;top:6px;inset-inline-start:6px;background:#2E7D4F;color:#fff;font:800 12px/1 "Heebo",sans-serif;padding:4px 8px;border-radius:999px}
.gm-jc-trade{font:700 11px/1 "Heebo",sans-serif;letter-spacing:.3px;color:var(--gm-gold);margin-top:2px}
.gm-jc-n{font:800 16px/1.15 "Heebo",sans-serif}
.gm-jc-pay{display:inline-flex;align-items:center;gap:4px;font:700 13px/1.2 "Heebo",sans-serif;color:var(--gm-ink)}
.gm-jc-pay svg{width:18px;height:18px}
.gm-jc-src{font:500 10.5px/1.2 "Heebo",sans-serif;color:var(--gm-faint);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.gm-deal-re{min-height:44px;padding:0 12px;border-radius:12px;border:1px solid var(--gm-line);background:var(--gm-raise);color:inherit;font:700 14px/1 "Heebo",sans-serif;cursor:pointer;white-space:nowrap}
.gm-pips{display:inline-flex;gap:4px;align-items:center;flex:0 0 auto}
.gm-pips i{width:9px;height:9px;border-radius:50%;border:1.5px solid var(--gm-gold);box-sizing:border-box}
.gm-pips i.on{background:var(--gm-gold-hi);border-color:var(--gm-gold-hi)}
.gm-pill.jobs{border-color:var(--gm-gold-hi)}
.gm-pill .gm-sc-n{font:800 16px/1 "Heebo",sans-serif;color:var(--gm-gold);white-space:nowrap;flex:0 0 auto}
/* ── /fun14 ── */

/* ── land17 ── wave 17: the stamp, the banner, the two choices; the landscape shell (844×390 and its kin) and the thumbs' zones */
/* the banner: one imperative line at the top (queued by ui.banner); the stamp: a huge word with rays (ui.stamp) */
.gm-banner{position:absolute;top:calc(env(safe-area-inset-top,0px) + 56px);left:0;right:0;margin:0 auto;width:max-content;max-width:min(92vw,560px);padding:9px 22px;border-radius:999px;background:linear-gradient(180deg,#F8DB86,#E4AF45);border:2px solid #B7862A;color:#2A1A04;font:900 20px/1.2 "Heebo",system-ui,sans-serif;text-align:center;box-shadow:0 6px 22px rgba(60,40,10,.4),0 0 0 3px rgba(255,236,170,.55);pointer-events:none;opacity:0;transform:translateY(-26px) scale(.92);transition:opacity .2s,transform .26s cubic-bezier(.2,1.3,.4,1);z-index:35}
.gm-banner.on{opacity:1;transform:none}
.gm-stamp{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;opacity:0;z-index:36;overflow:hidden}
.gm-stamp.on{opacity:1;animation:gm-st-life var(--ms,1100ms) linear both}
.gm-st-rays{position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(rgba(255,226,140,.66) 0 6deg,rgba(255,226,140,0) 6deg 15deg);-webkit-mask-image:radial-gradient(closest-side,#000 6%,rgba(0,0,0,.55) 22%,transparent 58%);mask-image:radial-gradient(closest-side,#000 6%,rgba(0,0,0,.55) 22%,transparent 58%);pointer-events:none}
.gm-stamp.on .gm-st-rays{animation:gm-st-spin var(--ms,1100ms) linear both}
.gm-st-t{position:relative;max-width:92vw;text-align:center;font:900 clamp(44px,20vmin,150px)/1.04 "Frank Ruhl Libre","Heebo",serif;color:#FFE9A0;letter-spacing:.5px;text-shadow:0 3px 0 #8A5A10,0 6px 0 #5A3A08,0 10px 24px rgba(30,16,0,.6),0 0 40px rgba(255,200,70,.7);transform-origin:50% 55%;pointer-events:none}
.gm-stamp.on .gm-st-t{animation:gm-st-slam var(--ms,1100ms) cubic-bezier(.2,1.4,.35,1) both}
@keyframes gm-st-life{0%{opacity:0}7%{opacity:1}82%{opacity:1}100%{opacity:0}}
@keyframes gm-st-spin{from{transform:rotate(0deg) scale(.7)}to{transform:rotate(26deg) scale(1.1)}}
@keyframes gm-st-slam{0%{transform:scale(2.8) rotate(-4deg)}14%{transform:scale(.94) rotate(1deg)}22%{transform:scale(1.05) rotate(0)}32%,82%{transform:scale(1)}100%{transform:scale(1.12)}}
/* the menu's choices (cam, popups) */
.gm-choice{flex-wrap:wrap}
.gm-choice .gm-seg{margin-top:0}
/* ── hud18 ── (the menu's tab row and the badge sum on the menu button are gone: the tabs are in the landscape top bar) ── /hud18 ── */
.gm-note-row .gm-q{font-size:15px;line-height:1.6}

/* landscape: the two thumbs' zones are the contract's (TWIN17 draws inside them; no HUD of this file sits in them under .tw-on) */
@media (orientation: landscape){
  .gm{--tw-left-w:45vw;--tw-left-top:35vh;--tw-right-w:230px;--tw-right-h:210px}
  /* the name chip's ::after hit area (v29 clipped it: overflow:hidden) — the box 36 + the 5 px above and below = 46 */
  .gm-top .gm-name{overflow:visible;min-height:36px}
}
/* the shell on a phone held sideways (short and wide): every control ≥ 44 px, every sheet and card scrolls inside the screen with its buttons in reach */
@media (orientation: landscape) and (max-height: 540px){
  .gm-top{padding:calc(env(safe-area-inset-top,0px) + 6px) calc(env(safe-area-inset-right,0px) + 12px) 0 calc(env(safe-area-inset-left,0px) + 12px)}
  .gm-goal{top:calc(env(safe-area-inset-top,0px) + 58px)}   /* ── hud18 ── (the numbers below: the bar is 8 px taller than v29's) */
  .gm-demo{top:calc(env(safe-area-inset-top,0px) + 100px)}
  .gm.coach-on .gm-demo{top:calc(env(safe-area-inset-top,0px) + 100px)}
  .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 100px)}
  body.gm-demo-on .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 148px)}
  .gm-toasts .gm-toast:not(:last-child){display:none}
  .gm-banner{top:40%}
  /* the dock: a slim bar at the bottom */
  .gm-dock{padding:0 10px calc(env(safe-area-inset-bottom,0px) + 6px)}
  .gm-db{min-width:56px;padding:5px 5px 4px;gap:2px;font-size:11px}
  .gm-db .gm-i{width:22px;height:22px}
  .gm-bub{bottom:calc(env(safe-area-inset-bottom,0px) + 70px);max-width:min(70vw,420px);padding:8px 14px;font-size:14px}
  .gm.sheet-open .gm-bub{bottom:calc(env(safe-area-inset-bottom,0px) + 70px);top:auto}
  /* sheets: a full-height panel on the left, its header fixed and its body scrolling */
  .gm-sheet{inset-inline:auto;left:calc(env(safe-area-inset-left,0px) + 8px);right:auto;top:calc(env(safe-area-inset-top,0px) + 6px);bottom:calc(env(safe-area-inset-bottom,0px) + 6px);width:min(440px,56vw);max-height:none;border:1px solid var(--gm-line);border-radius:18px;padding-bottom:0;transform:translateX(-30px);opacity:0;transition:transform .22s,opacity .22s;pointer-events:none}
  .gm-sheet.on{transform:none;opacity:1;pointer-events:auto}
  .gm-sh-h{padding:10px 14px 8px;flex:0 0 auto}
  .gm-sh-h h2{font-size:18px}
  .gm-sh-b{flex:1 1 auto;min-height:0;padding:8px 14px 14px}
  .gm.sheet-open .gm-bub{left:calc(min(440px,56vw) + 22px);right:12px;max-width:none}
  .gm.sheet-open .gm-toasts{left:calc(min(440px,56vw) + 20px)}
  /* modal cards: inside the screen, the buttons stay in reach at the card's foot */
  .gm-modal{padding:8px calc(env(safe-area-inset-right,0px) + 12px) 8px calc(env(safe-area-inset-left,0px) + 12px)}
  .gm-card{width:min(100%,560px);max-height:calc(100vh - 16px);padding:12px 16px 0}
  .gm-card h2{font-size:22px;margin:4px 0 6px}
  .gm-card p{font-size:14px;line-height:1.5}
  .gm-card .gm-btn-row:last-child{position:sticky;bottom:0;z-index:2;margin:10px -16px 0;padding:8px 16px 10px;background:var(--gm-solid);border-top:1px solid var(--gm-line)}
  .gm-card.gm-pick .gm-btn-row{max-height:calc(100vh - 150px)}
  .gm-mishmarot{max-height:22vh}
  /* key moments: a card that fits, scrolling if it must */
  .gm-mo{padding:6px calc(env(safe-area-inset-right,0px) + 12px) 6px calc(env(safe-area-inset-left,0px) + 12px)}
  .gm-mo-card{box-sizing:border-box;max-height:calc(100vh - 12px);overflow-y:auto;overscroll-behavior:contain;padding:10px 12px 8px}   /* ── hud18 ── (border-box: at 375 px tall the card was 2 px over) */
  .gm-mo-svg{max-height:min(46vh,200px)}
  .gm-mo-hint{margin-top:6px;font-size:14px}
  .gm-mo-top{margin-bottom:6px}
  /* the deal: two cards side by side, each a row (art left, words right) */
  .gm-deal{inset-inline:auto;left:50%;right:auto;width:min(720px,calc(100vw - 24px));bottom:calc(env(safe-area-inset-bottom,0px) + 10px);max-height:calc(100vh - 124px);overflow-y:auto;transform:translate(-50%,calc(100% + 100px))}
  .gm-deal.on{transform:translate(-50%,0)}
  .gm.sheet-open .gm-deal.on,.gm.gm-momenton .gm-deal.on,.gm.modal-open .gm-deal.on{transform:translate(-50%,calc(100% + 100px))}
  .gm-deal-cards{gap:8px}
  .gm-jc{display:grid;grid-template-columns:92px 1fr;column-gap:10px;align-content:center;align-items:center;justify-items:start;min-height:88px;padding:6px 10px;text-align:start}
  .gm-jc>.gm-jc-art{grid-row:1 / span 4;grid-column:1;width:92px;height:62px}
  .gm-jc>*:not(.gm-jc-art){grid-column:2}
  .gm-jc.quarry{min-height:88px}
  .gm-deal-cards.extra .gm-jc.quarry{min-height:64px}
  .gm-deal-tip{display:none}
  .gm-btn-row{margin-top:8px}
  /* the chips and the close buttons: ≥ 44 px with their hit areas (the box 36/38 + the ::after) */
  .gm-top .gm-name{min-height:36px}
  .gm-x{width:38px;height:38px}
  .gm-toggle{padding:8px 0}
  .gm-toggle.gm-choice .gm-seg button{min-height:40px}
  /* a sheet is open: the world's pointers and rings are not drawn over it (v29 hid them only on a narrow screen) */
  .gm.sheet-open .gm-coach,.gm.sheet-open .gm-ring,.gm.sheet-open .gm-combo,.gm.sheet-open .gm-plate{display:none}
  .gm:has(> .gm-modal) .gm-ring,.gm:has(> .gm-modal) .gm-combo,.gm:has(> .gm-modal) .gm-plate{visibility:hidden}
}
/* in play (any landscape screen — a phone, a tablet, a desktop window): the thumbs' zones stay clear — the toasts, the mentor's line and the banner move out of both zones */
@media (orientation: landscape){
  /* ── hud18 ── (the dock no longer folds into the menu under .tw-on: it is the top bar's tabs, below) ── /hud18 ── */
  .gm.tw-on .gm-toasts{left:calc(var(--tw-left-w) + 8px);right:calc(env(safe-area-inset-right,0px) + 8px);inset-inline:auto}
  .gm.tw-on .gm-bub{top:calc(env(safe-area-inset-top,0px) + 158px);bottom:auto;left:calc(var(--tw-left-w) + 8px);right:calc(var(--tw-right-w) + 8px);margin:0;width:auto;max-width:none;padding:7px 12px;font-size:13px;line-height:1.35}
  /* ── twin17 ── (fix round: the coach's bubble never over the kohen) above the banner by default — under the follow camera he stands in
     the middle of the screen; twin.js lifts it to the top (.tw-bub-top) whenever he stands down there */
  .gm.tw-on .gm-bub{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 64px)}
  .gm.tw-on.tw-bub-top .gm-bub{top:calc(env(safe-area-inset-top,0px) + 104px);bottom:auto}
  /* ── /twin17 ── */
  /* the banner: in the middle column between the thumbs' zones */
  .gm.tw-on .gm-banner{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);left:calc(var(--tw-left-w) + 8px);right:calc(var(--tw-right-w) + 8px);max-width:calc(100% - var(--tw-left-w) - var(--tw-right-w) - 16px);font-size:17px;padding:8px 16px;border-radius:22px}
}
@media (orientation: landscape) and (max-height: 540px){
  .gm.tw-on.sheet-open .gm-bub{left:calc(min(440px,56vw) + 22px);right:calc(env(safe-area-inset-right,0px) + 8px)}
  /* the deal asks a choice: at the top, over the world (the thumbs are idle while it is up); it slides up and away */
  .gm.tw-on .gm-deal{bottom:auto;top:calc(env(safe-area-inset-top,0px) + 62px);max-height:calc(100vh - 70px);transform:translate(-50%,calc(-100% - 80px))}
  .gm.tw-on .gm-deal.on{transform:translate(-50%,0)}
  .gm.tw-on.sheet-open .gm-deal.on,.gm.tw-on.gm-momenton .gm-deal.on,.gm.tw-on.modal-open .gm-deal.on{transform:translate(-50%,calc(-100% - 80px))}
}
/* ── /land17 ── */

/* ── hud18 ── landscape top bar; .gm-xp = ui.xp's slot */
.gm-xp{pointer-events:none;flex:0 0 auto;display:grid;grid-template-columns:auto auto;gap:2px 6px;align-items:center;padding:3px 8px 3px 6px;border-radius:14px;background:var(--gm-chip);border:1px solid var(--gm-line);box-shadow:0 2px 10px rgba(40,28,12,.1);-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur))}
.gm-xp-ic{grid-row:1/3;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(180deg,#FFF6DD,#F1D9A0);border:2px solid #C9A24A;color:#6A4A16;font-size:15px;line-height:1;overflow:hidden}
.gm-xp-ic .gm-i{width:17px;height:17px}
.gm-xp-tx{display:flex;gap:5px;align-items:baseline;white-space:nowrap;font:800 11.5px/1.1 Heebo,sans-serif}
.gm-xp-tx small{font:700 10.5px/1.1 Heebo,sans-serif;color:var(--gm-gold);display:inline-block}
.gm-xp-tx b{display:none}
.gm-xp-bar{position:relative;height:12px;min-width:46px;border-radius:6px;background:var(--gm-bar);border:1px solid var(--gm-line);overflow:hidden}
.gm-xp-bar i{position:absolute;inset-block:0;inset-inline-start:0;width:0;background:linear-gradient(90deg,#E0A83A,#F2CF77);transition:width .12s linear}
.gm-xp-bar em{position:absolute;inset:0;display:grid;place-items:center;font:800 9.5px/1 Heebo,sans-serif;font-style:normal;color:#fff;text-shadow:0 1px 2px rgba(20,12,2,.85)}
.gm-xp.lvup .gm-xp-tx small{animation:gm-lvup .9s ease-out}
@keyframes gm-lvup{25%{transform:scale(1.6);color:var(--gm-gold-hi)}}
.gm-xp:not(.gm-hidden) ~ .gm-name{display:none}
.gm-modal,.gm-mo{z-index:8}   /* above the twin's thumbs (z 3–5) */
@media (orientation: landscape) and (min-width: 640px){
  .gm{--hud-tab:50px;--hud-tw:calc(var(--hud-tab) * 5 + 14px);--hud-mw:50px;--hud-pr:calc(env(safe-area-inset-right,0px) + 12px)}
  .gm-top,.gm-top.gm-tight,.gm-top.gm-tighter{padding:calc(env(safe-area-inset-top,0px) + 6px) var(--hud-pr) 0 calc(env(safe-area-inset-left,0px) + 10px);gap:6px;align-items:center}
  .gm-rb{flex:0 0 auto;width:var(--hud-mw);height:var(--hud-mw);margin-inline-end:calc(var(--hud-tw) + 6px)}
  .gm-banner{top:40%}
  .gm.tw-on .gm-banner{box-sizing:border-box;padding:7px 10px}
  .gm-rb::after{inset:-1px}
  .gm-dock{top:calc(env(safe-area-inset-top,0px) + 6px);bottom:auto;inset-inline:calc(var(--hud-pr) + var(--hud-mw) + 6px) auto;width:var(--hud-tw);padding:0;display:block}
  .gm-dock nav{box-sizing:border-box;width:100%;padding:2px;gap:2px;border-radius:18px;justify-content:space-between}
  .gm-db{flex:0 0 var(--hud-tab);width:var(--hud-tab);min-width:0;height:44px;padding:3px 0 2px;gap:1px;justify-content:center;border-radius:15px;font-size:10.5px;letter-spacing:-.1px;white-space:nowrap}
  .gm-db .gm-i{width:20px;height:20px}
  .gm-db .gm-badge{top:0;inset-inline-end:1px;min-width:16px;height:16px;border-radius:8px;font-size:10px;line-height:16px;padding:0 4px;box-shadow:0 1px 3px rgba(0,0,0,.3)}
  .gm-res{justify-content:safe flex-end}
  .gm-top .gm-name{display:none!important}
  .gm-xp{padding:4px 10px 4px 7px;border-radius:16px;column-gap:7px;row-gap:3px}
  .gm-xp-ic{width:34px;height:34px;font-size:18px}
  .gm-xp-ic .gm-i{width:20px;height:20px}
  .gm-xp-tx{font-size:12.5px}.gm-xp-tx small{font-size:11.5px}.gm-xp-tx b{display:inline}
  .gm-xp-bar{height:14px;min-width:88px}
  .gm-xp-bar em{font-size:10px}
  .gm.tw-on .gm-pill-alt{align-self:flex-start;max-width:calc(100vw - var(--tw-left-w) - 20px)}
  .gm.tw-on.alt-on .gm-toasts{top:calc(env(safe-area-inset-top,0px) + 148px)}
}
@media (orientation: landscape) and (min-width: 640px) and (max-height: 540px){.gm-sheet{width:min(440px,56vw,calc(100vw - var(--hud-pr) - var(--hud-mw) - var(--hud-tw) - 24px - env(safe-area-inset-left,0px)))}}   /* a sheet never covers the tabs */
@media (orientation: landscape) and (min-width: 640px) and (max-width: 720px){
  .gm{--hud-tab:46px;--hud-mw:44px}
  .gm-rb{margin-top:3px}
  .gm-db{font-size:10px;letter-spacing:-.2px}
  .gm-xp-tx b{display:none}
  .gm-xp-bar{min-width:56px}
}
.gm-top.gm-tightest .gm-xp-bar{min-width:40px}.gm-top.gm-tightest .gm-xp-ic{width:30px;height:30px}.gm-top.gm-tightest .gm-res{gap:1px}.gm-top.gm-tightest .gm-res .gm-chip{padding:4px 2px}.gm-top.gm-tightest .gm-chip .gm-i{width:12px;height:12px}
/* ── fable20 ── (the owner, 8.10: "תוציא אותם החוצה") the profile and the near circle as tabs of their own on a wide screen (a desktop, a
   tablet: ≥ 900 px landscape — seven tabs); on a phone the bar keeps its five and both sit in the menu and in the "היום" board */
.gm-db[data-k="profile"],.gm-db[data-k="circle"]{display:none}
@media (orientation: landscape) and (min-width: 900px){
  .gm{--hud-tw:calc(var(--hud-tab) * 7 + 18px)}
  .gm-db[data-k="profile"],.gm-db[data-k="circle"]{display:flex}
}
/* ── /fable20 ── */
/* ── /hud18 ── */

/* ── hook19 ── the master score: the capsule (★ + the coin's ring), its notes, the coin's celebration, the treasure's sheet */
.gm-sc{position:absolute;z-index:6;top:calc(env(safe-area-inset-top,0px) + 58px);left:calc(env(safe-area-inset-left,0px) + 10px);pointer-events:auto;display:flex;align-items:center;gap:7px;direction:rtl;height:40px;padding:0 12px 0 6px;border-radius:20px;border:1px solid var(--gm-line);background:var(--gm-chip);color:var(--gm-ink);font:800 16px/1 "Heebo",system-ui,sans-serif;box-shadow:0 2px 10px rgba(40,28,12,.14);-webkit-backdrop-filter:blur(var(--gm-blur));backdrop-filter:blur(var(--gm-blur));touch-action:manipulation;transition:box-shadow .3s,border-color .3s}
.gm-sc::after{content:"";position:absolute;inset:-3px}
.gm-sc-r{position:relative;width:34px;height:34px;flex:none;display:grid;place-items:center;color:#4A3208;font:900 13px/1 "Heebo",sans-serif}
.gm-sc-r::before{content:"";position:absolute;inset:5px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8B94A 60%,#B98A24);box-shadow:inset 0 0 0 1.5px #fff7;opacity:.5}
.gm-sc.has .gm-sc-r::before{opacity:1}
.gm-sc-r b{position:relative;font-weight:900;text-shadow:0 1px 0 #fff8}
.gm-sc:not(.has) .gm-sc-r b{opacity:0}
.gm-sc-r svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible}
.gm-sc-r circle{fill:none;stroke-width:3.2;stroke-linecap:round}
.gm-sc-r .bg{stroke:var(--gm-bar)}
.gm-sc-r .fg{stroke:#E0A83A;transition:stroke-dasharray .35s ease-out}
.gm-sc-n{display:inline-flex;align-items:center;gap:4px;white-space:nowrap;direction:ltr}
.gm-sc-n i{font-style:normal;color:var(--gm-gold-hi);text-shadow:0 1px 0 #5A3A0866}
.gm-sc-n .gm-num{min-width:3.2ch;text-align:left}
.gm-sc.glow{border-color:var(--gm-gold-hi);box-shadow:0 0 0 2px #FFD66E88,0 0 16px #FFD66E99;animation:gm-sc-glow 1.8s ease-in-out infinite}
/* ── hook19 ── a tab that calls: the gold arrow (1.5 s) and one pulse of the tab */
.gm-nda{position:absolute;left:0;top:0;width:36px;height:36px;z-index:9;pointer-events:none;color:#F2B233;filter:drop-shadow(0 2px 4px #0006);opacity:0}
.gm-nda svg{width:100%;height:100%;display:block}
.gm-db.gm-nd{animation:gm-nd 1.4s ease-out 1}
@keyframes gm-nd{0%{box-shadow:0 0 0 0 #F2B233cc}35%{transform:scale(1.14);box-shadow:0 0 0 7px #F2B23355,0 0 18px #FFD66Eaa}100%{box-shadow:0 0 0 0 #F2B23300;transform:none}}
@media (prefers-reduced-motion:reduce){.gm-db.gm-nd{animation:none;box-shadow:0 0 0 3px #F2B233}}

.gm-ask{margin:14px 0 8px;padding:10px 12px;border-radius:12px;background:var(--gm-chip);border:1px dashed var(--gm-gold);font-size:14.5px;line-height:1.45}
.gm-ask b{display:block;font:700 12px/1 "Heebo",sans-serif;color:var(--gm-gold);margin-bottom:5px;letter-spacing:.3px}
.gm-ask .gm-draft{font-size:10.5px}
.gm-rd{display:block;width:100%;min-height:48px;margin-top:8px}
.gm-rd[disabled]{opacity:.45;filter:grayscale(.5)}
.gm-rd.done{padding:12px;text-align:center;border-radius:12px;background:var(--gm-chip);color:var(--gm-gold);font-weight:700}
.gm-rd-h{display:block;margin-top:6px;text-align:center}
.gm-node{position:relative}
.gm-bs{position:absolute;top:3px;inset-inline-start:4px;font-style:normal;font-size:12px;line-height:1;color:var(--gm-bar);pointer-events:none}
.gm-bs.on{color:#E0A83A;text-shadow:0 0 6px #FFD66E88}
/* ── /hook19 ── */
.gm-sc.glow .gm-sc-n .gm-num{color:var(--gm-gold)}
.gm-sc.glow .gm-sc-r .fg{stroke:#FFD66E;filter:drop-shadow(0 0 3px #FFD66E)}
@keyframes gm-sc-glow{50%{box-shadow:0 0 0 3px #FFD66ECC,0 0 24px #FFD66ECC}}
.gm-sg{position:absolute;z-index:7;top:calc(env(safe-area-inset-top,0px) + 104px);left:calc(env(safe-area-inset-left,0px) + 12px);pointer-events:none;display:flex;gap:6px;align-items:baseline;direction:rtl;opacity:0;transform:translateY(8px) scale(.8);transition:opacity .2s,transform .35s cubic-bezier(.2,1.3,.4,1);font:800 15px/1 "Heebo",sans-serif;color:#FFF6DA;text-shadow:0 0 2px #4A2E08,0 0 2px #4A2E08,0 2px 5px #0008}
.gm-sg b{font:900 22px/1 "Heebo",sans-serif;color:#FFD66E;direction:ltr}
.gm-sg.on{opacity:1;transform:none}
.gm-dn{position:absolute;inset:0;z-index:40;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;perspective:700px;opacity:0;transition:opacity .2s}
.gm-dn.on{opacity:1}
.gm-dn-rays{position:absolute;left:50%;top:42%;width:150vmax;height:150vmax;margin:-75vmax;opacity:0;background:repeating-conic-gradient(#ffe28c8c 0 7deg,#0000 7deg 22deg);mask:radial-gradient(#000,#0000 55%);transition:opacity .25s}
.gm-dn.land .gm-dn-rays{opacity:.5;animation:gm-dn-spin 9s linear infinite}
@keyframes gm-dn-spin{to{rotate:1turn}}
.gm-dn-c{position:relative;width:clamp(96px,30vmin,150px);height:clamp(96px,30vmin,150px);margin-top:-6vmin;border-radius:50%;display:grid;place-content:center;justify-items:center;text-align:center;background:radial-gradient(circle at 34% 28%,#FFF6CC,#F0C75A 46%,#B98A24 78%,#8A6414);box-shadow:inset 0 0 0 4px #FFE9A0,inset 0 0 0 7px #A57A1C,0 8px 26px #0007;color:#4A3208;opacity:0;transform-style:preserve-3d;will-change:transform}
.gm-dn-c b{font:900 clamp(40px,14vmin,64px)/1 "Frank Ruhl Libre","Heebo",serif;text-shadow:0 2px 0 #FFF6CC}
.gm-dn-c small{max-width:80%;font:800 clamp(10px,3.4vmin,14px)/1.1 "Heebo",sans-serif;margin-top:2px}
.gm-dn-t{position:relative;margin-top:2vmin;font:900 clamp(30px,11vmin,52px)/1.05 "Frank Ruhl Libre","Heebo",serif;color:#FFE9A0;text-shadow:0 3px 0 #8A5A10,0 6px 0 #5A3A08,0 10px 24px rgba(30,16,0,.6),0 0 30px rgba(255,200,70,.7);opacity:0;transform:scale(.6)}
.gm-dn-s{position:relative;font:700 clamp(13px,4vmin,17px)/1.2 "Heebo",sans-serif;color:#FFF6DA;text-shadow:0 2px 4px #1e1204cc;opacity:0}
.gm-dn.land .gm-dn-t{opacity:1;transform:none;transition:opacity .12s,transform .28s cubic-bezier(.2,1.5,.4,1)}
.gm-dn.land .gm-dn-s{opacity:1;transition:opacity .4s .25s}
.gm-dn.away .gm-dn-t,.gm-dn.away .gm-dn-s{opacity:0;transition:opacity .25s}
.gm-dn.away .gm-dn-rays{opacity:0}
.gm-tr-top{display:flex;justify-content:space-between;align-items:baseline;font:900 24px/1.1 "Heebo",sans-serif;margin-bottom:6px}
.gm-tr-top b{color:var(--gm-gold)}
.gm-tr-bar{height:12px;border-radius:6px;background:var(--gm-bar);overflow:hidden;margin-bottom:8px}.gm-tr-bar i{display:block;height:100%;background:linear-gradient(90deg,#E0A83A,#F2CF77)}
.gm-tr-lad{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.gm-tr-lad div{padding:8px 4px;border-radius:12px;background:var(--gm-bar);text-align:center;opacity:.6;line-height:1.2}
.gm-tr-lad div.on{opacity:1;background:linear-gradient(180deg,#FFF3C4,#F2CF77);color:#3B2A08}
.gm-tr-lad b{display:block;font:800 13px/1.15 "Heebo",sans-serif}.gm-tr-lad small{font:600 11px/1.2 "Heebo",sans-serif}
.gm-tr-faces{display:grid;grid-template-columns:repeat(5,1fr);gap:8px 6px}
.gm-tr-faces div{position:relative;display:flex;flex-direction:column;align-items:center;gap:3px;opacity:.5;text-align:center}
.gm-tr-faces div.on{opacity:1}
.gm-cn{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font:900 20px/1 "Frank Ruhl Libre","Heebo",serif;border:2px dashed var(--gm-line);color:var(--gm-faint)}
.gm-tr-faces .on .gm-cn{border:0;color:#4A3208;background:radial-gradient(circle at 34% 28%,#FFF6CC,#F0C75A 46%,#B98A24 78%);box-shadow:inset 0 0 0 3px #FFE9A0,0 2px 6px #0004}
.gm-tr-faces small{font:600 10.5px/1.15 "Heebo",sans-serif;max-width:64px}
.gm-tr-faces em{position:absolute;top:-4px;inset-inline-end:2px;font:800 11px/1 "Heebo",sans-serif;font-style:normal;background:#4A3208;color:#FFE9A0;border-radius:8px;padding:2px 4px;direction:ltr}
@media (orientation: landscape) and (max-height: 540px){.gm-dn-c{margin-top:-4vmin}.gm-dn-t{margin-top:1vmin}}
@media (orientation: portrait){.gm-sc{top:calc(env(safe-area-inset-top,0px) + 112px);left:10px}.gm-sg{top:calc(env(safe-area-inset-top,0px) + 156px)}}
@media (prefers-reduced-motion:reduce){.gm-sc.glow,.gm-dn-rays{animation:none}}
.gm.sheet-open .gm-sc,.gm.sheet-open .gm-sg{display:none}
/* ── /hook19 ── */
/* ── ux24 ── (docs/UX24.md #1) the first-time flow: only what the kid needs is on screen — the empty material chips, the five tabs,
   "מבט על" and an uncharged "יד של אומן" wait until the flow ends (ui.js toggles .ux-early while G.ftue < 99) */
.gm.ux-early .gm-res .gm-chip.ux-zero{display:none!important}
.gm.ux-early .gm-dock{display:none!important}
.gm.ux-early .tw-ov{display:none!important}
.gm.ux-early .tw-hand:not(.ready){display:none!important}
/* the turn card (⚑ the orientation): over everything, the phone drawn in CSS turning sideways */
.gm .gm-turn{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(18,10,2,.92);pointer-events:auto;direction:rtl}
.gm .gm-turn.gm-hidden{display:none}
.gm-turn-c{display:flex;flex-direction:column;align-items:center;gap:14px;color:#FFF6DA;font:800 26px/1.2 "Heebo",system-ui,sans-serif;text-align:center;padding:24px}
.gm-turn-c span{font:600 17px/1.3 "Heebo",system-ui,sans-serif;color:#F3DFAE}
.gm-turn-ph{display:block;width:62px;height:104px;border:5px solid #FFD66E;border-radius:14px;box-sizing:border-box;position:relative;animation:gm-turn 2.2s ease-in-out infinite;margin-bottom:12px}
.gm-turn-ph::after{content:"";position:absolute;left:50%;bottom:6px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#FFD66E}
@keyframes gm-turn{0%,20%{transform:rotate(0)}55%,85%{transform:rotate(-90deg)}100%{transform:rotate(0)}}
@media (prefers-reduced-motion:reduce){.gm-turn-ph{animation:none;transform:rotate(-90deg)}}
.gm-turn-x{margin-top:18px;min-height:44px;min-width:44px;padding:10px 18px;border-radius:22px;border:2px solid rgba(255,236,190,.5);background:transparent;color:#F3DFAE;font:700 15px/1 "Heebo",system-ui,sans-serif}
/* ── /ux24 ── */
`;
