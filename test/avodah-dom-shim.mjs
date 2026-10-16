// ── service13 ── a tiny DOM shim (no browser): enough for the Phase B mini-games' SVG pictures and their solvers, over virtual time
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
class Node {
  constructor(tag, ns) { this.tagName = tag; this.ns = ns; this.attrs = new Map(); this.children = []; this.parentNode = null; this.style = {}; this.dataset = {}; this.L = {}; this.raw = null; this.disabled = false; }
  setAttribute(k, v) { this.attrs.set(k, String(v)); if (k === 'id') this.id = String(v); }
  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
  removeAttribute(k) { this.attrs.delete(k); }
  appendChild(c) { if (c.parentNode) c.remove(); c.parentNode = this; this.children.push(c); return c; }
  insertBefore(c, ref) { if (c.parentNode) c.remove(); c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
  remove() { if (this.parentNode) { const a = this.parentNode.children; const i = a.indexOf(this); if (i >= 0) a.splice(i, 1); this.parentNode = null; } }
  get firstChild() { return this.children[0] || null; }
  set textContent(t) { this.children = []; this.raw = null; const n = new Node('#text'); n.text = String(t); n.parentNode = this; this.children.push(n); }
  get textContent() { return this.tagName === '#text' ? this.text : this.children.map((c) => c.textContent).join(''); }
  set innerHTML(h) { this.children = []; this.raw = h ? String(h) : null; }
  get innerHTML() { return this.raw || ''; }
  get classList() {
    const get = () => (this.getAttribute('class') || '').split(/\s+/).filter(Boolean), put = (a) => this.setAttribute('class', a.join(' '));
    return { add: (...c) => put([...new Set([...get(), ...c])]), remove: (...c) => put(get().filter((x) => !c.includes(x))), contains: (c) => get().includes(c), toggle: (c, on) => { const has = get().includes(c); const want = on === undefined ? !has : !!on; if (want && !has) put([...get(), c]); if (!want && has) put(get().filter((x) => x !== c)); return want; } };
  }
  get className() { return this.getAttribute('class') || ''; }
  set className(v) { this.setAttribute('class', v); }
  addEventListener(t, f) { (this.L[t] = this.L[t] || []).push(f); }
  removeEventListener(t, f) { this.L[t] = (this.L[t] || []).filter((x) => x !== f); }
  dispatchEvent(ev) { ev.target = ev.target || this; let n = this; while (n) { for (const f of n.L[ev.type] || []) { ev.currentTarget = n; f(ev); } if (!ev.bubbles) break; n = n.parentNode; } return true; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 50, height: 50, right: 50, bottom: 50 }; }
  getBBox() { return { x: 0, y: 0, width: 10, height: 10 }; }
  focus() {}
  closest() { return null; }
  get offsetWidth() { return 100; }
  all() { const out = []; const w = (n) => { for (const c of n.children) { out.push(c); w(c); } }; w(this); return out; }
  matches(sel) { if (sel.startsWith('.')) return this.classList.contains(sel.slice(1)); if (sel.startsWith('#')) return this.id === sel.slice(1); const m = /^\[data-k="(.+)"\]$/.exec(sel); if (m) return this.dataset.k === m[1]; return this.tagName === sel; }
  querySelectorAll(sel) { const last = sel.trim().split(/\s+/).pop(); return this.all().filter((n) => n.tagName !== '#text' && n.matches(last)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  serialize() {
    if (this.tagName === '#text') return esc(this.text);
    const st = Object.entries(this.style).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}:${v}`).join(';');
    let a = [...this.attrs].map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
    if (st) a += ` style="${esc(st)}"`;
    if (this.style.opacity === '0') a += ' opacity="0"';
    if (this.tagName === 'svg') a += ' xmlns="http://www.w3.org/2000/svg"';
    return `<${this.tagName}${a}>${this.raw || this.children.map((c) => c.serialize()).join('')}</${this.tagName}>`;
  }
}
export function install() {
  const doc = new Node('#document');
  doc.head = doc.appendChild(new Node('head'));
  doc.body = doc.appendChild(new Node('body'));
  doc.createElementNS = (ns, tag) => new Node(tag, ns);
  doc.createElement = (tag) => new Node(tag);
  doc.getElementById = (id) => doc.all().find((n) => n.id === id) || null;
  globalThis.document = doc;
  globalThis.PointerEvent = class { constructor(type, o = {}) { this.type = type; this.bubbles = !!o.bubbles; this.cancelable = true; } preventDefault() {} };
  globalThis.MouseEvent = globalThis.PointerEvent;
  globalThis.addEventListener = () => {}; globalThis.removeEventListener = () => {};
  globalThis.requestAnimationFrame = (f) => setTimeout(() => f(0), 0);
  return doc;
}
/** a fake runGame api over virtual time: loops tick when time advances (wait / advance) */
export function makeApi(ctx = {}) {
  const doc = globalThis.document;
  const play = doc.createElement('div'), controls = doc.createElement('div');
  const S = { t: 0, loops: [], timers: [], hint: '', hints: [], cites: [], misses: [], done: null, solver: null, mistakes: 0 };
  const advance = (ms) => { const end = S.t + ms; while (S.t < end) { const step = Math.min(16, end - S.t); S.t += step; for (const f of S.loops.slice()) f(step / 1000, S.t); for (const tm of S.timers.filter((x) => x.at <= S.t && !x.fired)) { tm.fired = true; tm.fn(); } } };
  const svgEl = (tag, attrs = {}, parent) => { const e = doc.createElementNS('svg', tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; };
  const api = {
    play, controls, ctx, sfx: null, world: null, T: 1, three: null, el: svgEl,
    svg(viewBox, label) { const s = svgEl('svg', { viewBox, class: 'av-svg av-mg', 'aria-label': label, width: 720, height: 720 * (+viewBox.split(' ')[3]) / (+viewBox.split(' ')[2]) }); play.appendChild(s); return s; },
    hint(t) { S.hint = t || ''; S.hints.push(S.hint); },
    miss(t) { S.mistakes++; S.misses.push(t); api.hint(t); },
    cite(l) { if (l && l.quote) S.cites.push(`${l.quote} (${l.source})`); },
    done(o = {}) { S.done = o; api.hint(o.text || ''); },
    loop(fn) { S.loops.push(fn); return () => { S.loops = S.loops.filter((x) => x !== fn); }; },
    after(ms, fn) { S.timers.push({ at: S.t + ms, fn }); },
    wait(ms) { advance(ms); return new Promise((r) => setImmediate(r)); },
    button(label, onClick) { const b = doc.createElement('button'); b.textContent = label; b.addEventListener('click', (e) => { if (!b.disabled) onClick(e); }); controls.appendChild(b); return b; },
    float() {}, sparkle() {},
    hold(target) { let held = false; target.addEventListener('pointerdown', () => { held = true; }); for (const t of ['pointerup', 'pointerleave', 'pointercancel']) target.addEventListener(t, () => { held = false; }); return { held: () => held, set: (v) => { held = !!v; } }; },
    solver(fn) { S.solver = fn; }, onCleanup() {}, walk() { return Promise.resolve(true); },
    get mistakes() { return S.mistakes; }, repeat: !!ctx.repeat, tier: 0,
  };
  return { api, S, advance, play, controls };
}
