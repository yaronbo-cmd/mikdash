export const CSS = `
/* ── light28 ── the verse of the blessing (≥ 22 px), the תפוח's name; both moved into the label zone by day/index.js ── */
.dy-gm .l28-verse{position:absolute;left:0;top:0;display:none;flex-direction:column;align-items:center;gap:2px;max-width:min(94vw,640px);box-sizing:border-box;padding:7px 18px 6px;border-radius:16px;background:rgba(27,22,17,.88);color:#FFF1CC;box-shadow:0 4px 14px rgba(0,0,0,.4);pointer-events:none;z-index:30;direction:rtl;text-align:center}
.dy-gm .l28-verse.on{display:flex}
.dy-gm .l28-vt{font:700 24px/1.35 "Heebo","Frank Ruhl Libre",serif;white-space:normal}
.dy-gm .l28-verse small{font:600 11.5px/1.2 "Heebo",sans-serif;color:#E8C46A}
.dy-gm .l28-tap{position:absolute;left:0;top:0;display:none;padding:3px 12px;border-radius:12px;background:rgba(255,248,232,.92);border:2px solid rgba(120,90,40,.7);color:#3B2A12;font:800 15px/1.2 "Heebo",sans-serif;pointer-events:none;z-index:6;white-space:nowrap}
.dy-gm .l28-tap.on{display:block}
/* ── /light28 ── */
.dy-gm{position:fixed;inset:0;z-index:20;pointer-events:none;direction:rtl;font-family:"Heebo",system-ui,sans-serif}
.dy-gm .dy-hud{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:64px;right:64px;min-height:44px;display:flex;flex-direction:column;align-items:stretch;justify-content:center;gap:1px;pointer-events:auto;cursor:pointer;z-index:31;-webkit-tap-highlight-color:transparent}
.dy-h1{min-height:26px;padding:4px 12px;border:0;border-radius:14px 14px 4px 4px;background:rgba(27,22,17,.88);color:#F6EBD6;font:700 13px/1.25 "Heebo",sans-serif;text-align:center;cursor:pointer;white-space:normal}
.dy-h2{padding:2px 12px 4px;border-radius:4px 4px 14px 14px;background:rgba(27,22,17,.7);color:#D9C9A8;font:500 11.5px/1.2 "Heebo",sans-serif;text-align:center}
body.dy-on .av-status{visibility:hidden}
.dy-bar{position:relative;height:4px;margin:2px 6px 0;border-radius:2px;background:linear-gradient(270deg,#27355E 0 41.7%,#E39A55 41.7% 54.2%,#E9C766 54.2% 83.3%,#E07F4B 83.3% 91.7%,#7A5C8E 91.7% 100%);opacity:.9}
.dy-bar b{position:absolute;top:-3px;width:10px;height:10px;margin-right:-5px;border-radius:50%;background:#FFF6DA;border:2px solid #1D1813;box-shadow:0 0 0 1px rgba(255,255,255,.4)}
.dy-say{position:absolute;top:calc(env(safe-area-inset-top,0px) + 74px);right:50%;transform:translate(50%,-12px);max-width:min(520px,70vw);padding:8px 14px;border-radius:16px;background:#FFF1CC;color:#2A1E10;box-shadow:0 4px 14px rgba(0,0,0,.4);opacity:0;transition:opacity .25s,transform .25s;display:flex;flex-direction:column;gap:2px;z-index:31;font:600 13px/1.3 "Heebo",sans-serif}
.dy-say.on{opacity:1;transform:translate(50%,0)}
.dy-say b{font:800 12px/1.2 "Heebo",sans-serif;color:#7A4B10}.dy-say i{font:500 11px/1.2 "Heebo",sans-serif;color:#7A6A50;font-style:normal}
.dy-line{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);right:50%;transform:translate(50%,10px);max-width:min(460px,52vw);padding:7px 14px;border-radius:14px;background:rgba(27,22,17,.92);color:#F6EBD6;opacity:0;transition:opacity .25s,transform .25s;z-index:6;font:600 13px/1.3 "Heebo",sans-serif;display:flex;flex-direction:column;gap:2px;text-align:center}
.dy-line.on{opacity:1;transform:translate(50%,0)}.dy-line small{color:#9CC4EE;font:600 11px/1.2 "Heebo",sans-serif}
.dy-banner{position:absolute;top:34%;left:0;right:0;text-align:center;font:800 22px/1.2 "Heebo",sans-serif;color:#FFF1CC;text-shadow:0 2px 10px rgba(0,0,0,.7);opacity:0;pointer-events:none;z-index:32}
.dy-banner.on{animation:dy-b 3.2s ease-out forwards}@keyframes dy-b{0%{opacity:0;transform:translateY(8px)}12%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
.dy-list{position:absolute;top:calc(env(safe-area-inset-top,0px) + 70px);left:50%;transform:translateX(-50%);width:min(560px,86vw);max-height:calc(100% - 80px);display:none;flex-direction:column;border-radius:16px;background:rgba(27,22,17,.96);color:#F6EBD6;box-shadow:0 10px 30px rgba(0,0,0,.55);pointer-events:auto;z-index:33}
.dy-list.on{display:flex}.dy-lh{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid rgba(232,200,150,.2)}.dy-lh button{min-width:44px;min-height:44px;background:none;border:0;color:inherit;font-size:18px}
.dy-lb{overflow:auto;padding:6px 10px 10px}.dy-row{display:flex;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(232,200,150,.12)}.dy-row p{margin:0;font:500 12.5px/1.3 "Heebo",sans-serif}.dy-row small{color:#B9A988}.dy-row b{font:800 12px/1.2 "Heebo",sans-serif;color:#E4B656}
.dy-ic{font-size:24px;flex:0 0 auto}.dy-row>div{flex:1 1 auto}.dy-row button{min-width:56px;min-height:44px;border-radius:12px;border:0;background:#E4B656;color:#1D1406;font:800 13px/1 "Heebo",sans-serif}
.dy-none{margin:10px;color:#B9A988}
.dy-fade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .25s;z-index:34}.dy-fade.on{opacity:1}
.dy-end{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:35;pointer-events:auto}.dy-end.on{display:flex}
.dy-stamp{position:relative;font:900 34px/1 "Heebo",sans-serif;color:#FFF1CC;text-shadow:0 3px 14px #000;animation:dy-st 1.4s ease-out both}@keyframes dy-st{0%{transform:scale(2.2) rotate(-6deg);opacity:0}30%{transform:scale(1) rotate(-3deg);opacity:1}100%{transform:scale(1) rotate(-3deg);opacity:1}}
.dy-card{width:min(430px,88vw);padding:16px 18px;border-radius:18px;background:#1D1813;color:#F6EBD6;text-align:center;box-shadow:0 12px 36px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:6px}
.dy-card h2{margin:0;font:800 19px/1.2 "Heebo",sans-serif;color:#F2CF77}.dy-card p{margin:0;font:500 13.5px/1.35 "Heebo",sans-serif}.dy-big{font:900 26px/1.1 "Heebo",sans-serif!important;color:#E4B656}.dy-tm{color:#9CC4EE}
.dy-card small{color:#9CC4EE}.dy-go{margin-top:6px;min-height:48px;border:0;border-radius:14px;background:#E4B656;color:#1D1406;font:800 15px/1 "Heebo",sans-serif}
.dy-fl{position:absolute;transform:translate(-50%,0);font:900 20px/1 "Heebo",sans-serif;color:#FFE08A;text-shadow:0 2px 6px #000;animation:dy-fl 1.1s ease-out forwards;pointer-events:none;z-index:7}@keyframes dy-fl{to{transform:translate(-50%,-48px);opacity:0}}
/* ── polish23 ── the dinar coin: the master score and the bar to the next dinar */
.dy-coin{position:absolute;top:calc(env(safe-area-inset-top,0px) + 62px);left:12px;display:flex;align-items:center;gap:5px;flex-wrap:wrap;max-width:128px;padding:4px 9px 5px;border-radius:14px;background:rgba(27,22,17,.82);color:#F6EBD6;pointer-events:none;z-index:30;font:800 12.5px/1 "Heebo",sans-serif}
.dy-cc{display:inline-block;flex:0 0 auto;width:15px;height:15px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#FFF3C4,#E8B94A 60%,#B98A24);box-shadow:inset 0 0 0 1px #fff8,0 0 0 1px #B98A2488}
.dy-coin u{display:block;flex:1 0 100%;height:3px;border-radius:2px;background:rgba(255,255,255,.18);overflow:hidden;text-decoration:none}.dy-coin .dy-cb,.dy-ceb s{display:block;height:100%;background:linear-gradient(270deg,#FFE08A,#E4B656);width:0;float:right}
.dy-cp{position:absolute;top:100%;right:6px;font:900 13px/1 "Heebo",sans-serif;color:#FFE08A;font-style:normal;opacity:0;text-shadow:0 1px 4px #000}
.dy-coin.pl .dy-cc{animation:dy-spin .8s ease-in-out}.dy-coin.pl .dy-cp{animation:dy-cp 1.4s ease-out}
@keyframes dy-spin{from{transform:perspective(100px) rotateY(0)}to{transform:perspective(100px) rotateY(720deg)}}@keyframes dy-cp{0%{opacity:0;transform:translateY(-4px)}15%{opacity:1}100%{opacity:0;transform:translateY(10px)}}
.dy-coinrow{display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap}.dy-coinrow b{color:#F2CF77}
.dy-ceb{height:5px;border-radius:3px;background:rgba(255,255,255,.16);overflow:hidden}
@media (prefers-reduced-motion:reduce){.dy-coin.pl .dy-cc,.dy-coin.pl .dy-cp{animation:none}}
/* ── /polish23 ── */
`;
