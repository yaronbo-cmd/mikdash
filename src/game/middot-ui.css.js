/* middot-ui.css.js: MIDDOT10 (wave 10), the style of the book's place links, its learning points, the chapter quizzes and the
 * "back to the book" chip. It rides on the HUD's own variables (ui.css.js: --gm-ink, --gm-gold, --gm-ok…), so the light and the
 * dark themes follow. Phone first: every target ≥ 44 px (the inline names reach 44 px with padding that does not move the text). */
export const MD_CSS = `
.gm .md-pl{display:inline;margin:0;padding:14px 0;color:var(--gm-blue);
  text-decoration:underline;text-decoration-style:dotted;text-decoration-thickness:1.5px;text-underline-offset:5px;cursor:pointer;
  -webkit-tap-highlight-color:rgba(31,79,122,.18);border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.gm .md-pl:focus-visible{outline:2px solid var(--gm-blue);outline-offset:2px}
.gm .md-pl::before{content:"";display:inline-block;width:.34em;height:.34em;margin-inline-end:3px;border-radius:50%;background:currentColor;
  vertical-align:.28em;opacity:.7}
.gm .md-tip{display:flex;gap:8px;align-items:center;margin:6px 0 2px;font:500 12.5px/1.4 "Heebo",sans-serif;color:var(--gm-soft)}
.gm .md-tip b{color:var(--gm-blue);font-weight:700}
.gm .md-pts{margin:8px 0 10px;padding:10px 12px;border-radius:14px;background:var(--gm-bar);border:1px solid var(--gm-line)}
.gm .md-pts-h{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;font:700 15px/1.3 "Heebo",sans-serif}
.gm .md-pts-h .md-n{font:800 22px/1 "Heebo",sans-serif;color:var(--gm-gold)}
.gm .md-star{color:var(--gm-gold);font-size:18px}
.gm .md-title{display:inline-block;margin-inline-start:4px;padding:2px 9px;border-radius:999px;border:1px solid var(--gm-gold);color:var(--gm-gold);
  font:700 12px/1.5 "Heebo",sans-serif}
.gm .md-warm{margin:4px 0 0;font:500 13.5px/1.45 "Heebo",sans-serif;color:var(--gm-ink)}
.gm .md-pts .gm-btn{margin-top:8px}
.gm .md-chq{display:flex;align-items:center;gap:10px;margin:0 0 8px;padding:8px 10px;border-radius:12px;border:1px dashed var(--gm-line)}
.gm .md-chq .gm-btn{width:auto;margin:0;flex:0 0 auto}
.gm .md-chq small{flex:1;font:500 12.5px/1.35 "Heebo",sans-serif;color:var(--gm-soft)}
.gm .md-chq.md-wait{border-style:solid;background:none;font:500 13px/1.4 "Heebo",sans-serif;color:var(--gm-soft);min-height:44px}
.gm .md-done{margin-top:12px;padding:10px 12px;border-radius:14px;border:1px solid var(--gm-gold);background:var(--gm-bar)}
.gm .md-done b{color:var(--gm-gold)}
.gm .md-done .gm-btn{margin-top:8px}
.gm .md-qz .gm-card{padding:16px 16px 14px}
.gm .md-qz h2{margin:8px 0 10px;font:700 19px/1.35 "Heebo",sans-serif}
.gm .md-prog{display:flex;gap:4px;margin:8px 0 2px}
.gm .md-prog i{flex:1;height:5px;border-radius:3px;background:var(--gm-line)}
.gm .md-prog i.on{background:var(--gm-gold)}
.gm .md-ans{display:flex;align-items:center;gap:10px;width:100%;min-height:50px;margin:0 0 8px;padding:10px 14px;border-radius:14px;
  border:1.5px solid var(--gm-line)!important;background:var(--gm-raise)!important;color:var(--gm-ink);font:600 15.5px/1.35 "Heebo",sans-serif;text-align:start}
.gm .md-ans:active{transform:scale(.99)}
.gm .md-ans .md-mk{flex:0 0 auto;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--gm-line);display:grid;place-items:center;font:800 13px/1 "Heebo",sans-serif}
.gm .md-ans.md-right{border-color:var(--gm-ok)!important;background:rgba(39,107,67,.12)!important}
.gm .md-ans.md-right .md-mk{border-color:var(--gm-ok);background:var(--gm-ok);color:#fff}
.gm .md-ans.md-chosen{border-style:dashed!important;opacity:.85}
.gm .md-ans[disabled]{cursor:default}
.gm .md-fb{margin-top:4px}
.gm .md-fb .gm-ref{margin-top:6px}
.gm .md-res{text-align:center}
.gm .md-big{margin:10px 0 2px;font:800 34px/1.1 "Heebo",sans-serif;color:var(--gm-gold)}
.gm .md-res p{margin:6px 0;font:500 15px/1.45 "Heebo",sans-serif}
.gm .md-gain{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;margin:10px 0 4px;font:700 15px/1.3 "Heebo",sans-serif}
.gm .md-gain span{padding:6px 12px;border-radius:999px;background:var(--gm-bar)}
.gm .md-row2{display:flex;gap:8px}
.gm .md-row2 .gm-btn{flex:1}
.gm .md-hint{margin:0 0 10px;padding:8px 10px;border-radius:12px;background:var(--gm-bar);font:500 13.5px/1.45 "Heebo",sans-serif;color:var(--gm-ink)}
.gm .md-link{display:inline-flex;align-items:center;min-height:44px;margin:-10px 0;padding:0 6px;border:0;background:none;color:var(--gm-blue);
  font:700 13.5px/1 "Heebo",sans-serif;text-decoration:underline;text-underline-offset:4px;cursor:pointer}
.gm .md-pts .md-dq{display:flex;align-items:center;gap:10px;margin:10px 0 0!important;padding-top:10px;border-top:1px dashed var(--gm-line)}
.gm .md-pts .md-dq .gm-btn{margin:0;flex:0 0 auto;min-height:44px}
.gm .md-pts .md-dq small{flex:1;font:500 12.5px/1.35 "Heebo",sans-serif}
.gm .md-daily .md-row2{flex-wrap:wrap}
.md-pq{position:fixed;z-index:61;left:0;right:0;bottom:0;padding:0 10px calc(env(safe-area-inset-bottom,0px) + 10px);direction:rtl;pointer-events:none;
  opacity:0;transform:translateY(24px);transition:opacity .25s,transform .25s}
.md-pq.on{opacity:1;transform:none}
.md-pq .gm-card{pointer-events:auto;box-sizing:border-box;width:100%;max-width:460px;margin:0 auto;max-height:52vh;overflow:auto;padding:12px 14px 12px;border-radius:18px;transform:none}
.md-pq .gm-card *{box-sizing:border-box}
.md-pq h2{margin:6px 0 8px;font:700 17px/1.35 "Heebo",sans-serif}
.md-pq .md-ans{min-height:46px;margin-bottom:6px}
.md-pq .md-pq-q{display:block;margin-top:4px;font:500 14px/1.5 "Frank Ruhl Libre","Heebo",serif}
.md-pq .md-big{font-size:30px}
.gm .md-pts .md-pqr{border-top:0;padding-top:0;margin-top:8px!important}
.md-back{position:fixed;z-index:60;top:calc(env(safe-area-inset-top,0px) + 108px);left:0;right:0;margin:0 auto;width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;
  display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border-radius:999px;background:var(--gm-chip,rgba(255,252,245,.92));
  border:1px solid var(--gm-line,rgba(120,92,52,.22));box-shadow:0 6px 20px rgba(40,28,12,.22);font:600 13.5px/1.3 "Heebo",sans-serif;
  color:var(--gm-ink,#2A2016);direction:rtl;pointer-events:auto;opacity:0;transition:opacity .25s}
.md-back.on{opacity:1}
html body.md-place-on div.dock:not(.gm-dock),html body.md-place-on .gm .gm-back{display:none!important}
html body.md-place-on .gm .gm-plate{visibility:hidden!important}
.md-ic{display:inline-grid;place-items:center;color:var(--gm-blue,#1F4F7A);flex:0 0 auto}
.md-ic svg{width:18px;height:18px}
.md-back .md-where{min-width:0;padding-inline-start:2px;white-space:nowrap}
.md-back .md-where small{display:block;font:500 11.5px/1.3 "Heebo",sans-serif;color:var(--gm-soft,#6B5A45);white-space:normal;max-width:210px}
.md-back button{flex:0 0 auto;min-height:44px;padding:0 14px;border-radius:999px;border:1px solid #B7862A;background:linear-gradient(180deg,#F2CF77,#E0A83A);
  color:#2A1A04;font:700 14px/1 "Heebo",sans-serif}
`;
