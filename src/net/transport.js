/* ─────────────────────────────────────────────────────────────────────────────
 * net/transport.js — NET10 (wave 10): the link between two devices for "כהנים יחד" (two kohanim building together).
 *
 *   const t = await connect({ mock })   → a transport, or null (the game then plays alone; nothing waits on it)
 *   t.kind                  'room' (the claude.ai artifact's room; + db behind the flag, see dbWanted) | 'mock' (BroadcastChannel: tabs of one browser)
 *   t.shared                true when the documents live in the artifact's db (false: this device's memory)
 *   t.self                  this page's peer label (opaque; the room's `peer`, or the mock's own)
 *   t.presence(patch)       merge into MY presence: absolute state, latest wins, a top-level null removes a field
 *   t.peers()               everyone here now, me included: [{ peer, self, presence, at }]   (self = THIS tab)
 *   t.onPeers(fn)           fn(peers) whenever the room changes → off()
 *   t.emit(topic, data)     a moment to everyone here (me included, self: true) — never stored, may drop
 *   t.on(topic, fn)         fn(data, { peer, self }) → off()
 *   t.connected()           are we talking to anyone right now
 *   t.doc(path)             one shared JSON document: get() → obj|null · set(obj) · update(obj) (deep merge) · onSnapshot(fn) → off()
 *   t.close()
 * Every call is guarded: a transport never throws into the game, and every promise resolves.
 *
 * The platform (types: artifact-capabilities 0.2.47 claude.d.ts / room.d.ts / db.d.ts / user.d.ts):
 * · `await claude.use('room' | 'db')` resolves null when the view cannot run it (not served, not granted, a local file);
 * · two phones on ONE account are "the same viewer": the other phone's peer arrives with isMe true — we key on `sameTab`;
 * · presence is ≤ 4 KiB, coalesced ~30/s, handed to newcomers, cleared when a peer leaves; moments on a topic need the topic
 *   opened at publish ({ room: { topics: { cheer: 'interact' } } }), else only editors may send (not_permitted: ignored);
 * · db writes are last-writer-wins, no transactions; `update` merges nested objects and requires the document to exist.
 * The mock keeps the same contract between the tabs of one browser (the test's two pages, dist/test.html): presence by
 * BroadcastChannel with a heartbeat (a tab silent for 4 s has left), the documents in localStorage (the tabs share it).
 * ──────────────────────────────────────────────────────────────────────────── */

const noop = () => {};
const warnOnce = (() => { const seen = new Set(); return (k, e) => { if (seen.has(k)) return; seen.add(k); try { console.warn('[net]', k, e && e.message ? e.message : e || ''); } catch (_) { /* */ } }; })();
const safe = (f, fb) => { try { return f(); } catch (e) { warnOnce('call', e); return fb; } };
const later = (f) => Promise.resolve().then(f).catch(noop);

/** plain deep merge (objects merge, anything else replaces; a null leaf removes the key) — the db's `update` semantics */
export function mergeDeep(a, b) {
  const out = a && typeof a === 'object' && !Array.isArray(a) ? { ...a } : {};
  for (const [k, v] of Object.entries(b || {})) {
    if (v === null) delete out[k];
    else if (v && typeof v === 'object' && !Array.isArray(v)) out[k] = mergeDeep(out[k], v);
    else out[k] = v;
  }
  return out;
}

/** the artifact's capabilities, or null: `window.claude.use` exists only inside the viewer (and top-level on its host) */
async function useCap(name, ms) {
  const c = typeof window !== 'undefined' ? window.claude : null;
  if (!c || typeof c.use !== 'function') return null;
  try {
    return await Promise.race([c.use(name), new Promise((r) => setTimeout(() => r(null), ms))]);
  } catch (e) { return null; }
}

/* ───────── 1. the artifact's room + db ───────── */
function roomTransport(room, db) {
  const offs = [];
  const map = (list) => (list || []).map((p) => ({ peer: p.peer, self: !!p.sameTab, presence: p.presence || {}, at: p.updatedAt || 0 }));
  const docs = new Map();
  const t = {
    kind: 'room', shared: !!db,
    get self() { const me = safe(() => room.peers().find((p) => p.sameTab), null); return me ? me.peer : ''; },
    presence(patch) { return safe(() => room.presence(patch), Promise.resolve()).then(noop, (e) => warnOnce('presence', e)); },
    peers() { return map(safe(() => room.peers(), [])); },
    onPeers(fn) {
      const off = safe(() => room.onPeers((ch) => { try { fn(map(ch.peers)); } catch (e) { warnOnce('onPeers', e); } }, (e) => warnOnce('room', e)), noop);
      offs.push(off); return off;
    },
    emit(topic, data) { return safe(() => room.emit(topic, data), Promise.resolve()).then(noop, (e) => warnOnce('emit ' + topic, e)); },
    on(topic, fn) {
      const off = safe(() => room.on(topic, (m) => { try { fn(m.data, { peer: m.peer, self: !!m.sameTab }); } catch (e) { warnOnce('on', e); } }, (e) => warnOnce('room ' + topic, e)), noop);
      offs.push(off); return off;
    },
    connected() { return !!safe(() => room.connected(), false); },
    doc(path) {
      if (docs.has(path)) return docs.get(path);
      const d = db ? dbDoc(db, path) : memDoc();
      docs.set(path, d); return d;
    },
    close() { for (const f of offs.splice(0)) safe(f); },
  };
  return t;
}
function dbDoc(db, path) {
  let ref = null;
  try { ref = db.doc(path); } catch (e) { warnOnce('db path', e); return memDoc(); }
  const data = (s) => (s && s.exists ? s.data() || null : null);
  return {
    get: () => ref.get().then(data, (e) => { warnOnce('db get', e); return null; }),
    set: (o) => ref.set(o).then(() => true, (e) => { warnOnce('db set', e); return false; }),
    update: (o) => ref.update(o).then(() => true, (e) => { warnOnce('db update', e); return false; }),
    onSnapshot(fn) { return safe(() => ref.onSnapshot((s) => { try { fn(data(s)); } catch (e) { warnOnce('db snap', e); } }, (e) => warnOnce('db listen', e)), noop); },
  };
}
/** a document that lives only on this page (a room without db): the same calls, nothing shared */
function memDoc() {
  let v = null; const fns = new Set();
  const tell = () => { for (const f of fns) later(() => f(v)); };
  return {
    get: () => Promise.resolve(v),
    set: (o) => { v = JSON.parse(JSON.stringify(o)); tell(); return Promise.resolve(true); },
    update: (o) => { if (!v) return Promise.resolve(false); v = mergeDeep(v, o); tell(); return Promise.resolve(true); },
    onSnapshot(fn) { fns.add(fn); later(() => fn(v)); return () => fns.delete(fn); },
  };
}

/* ───────── 2. the mock: the tabs of one browser ───────── */
const BEAT = 1000, GONE = 4000;
function mockTransport(name = 'bh-net') {
  let ch = null;
  try { ch = new BroadcastChannel(name); } catch (e) { return null; }
  const selfPeer = 'm' + Math.random().toString(36).slice(2, 10);
  let mine = {}, mineAt = Date.now(), dirty = false, closed = false;
  const others = new Map();                            // peer → { presence, at, heard }
  const peerFns = new Set(), topicFns = new Map(), docFns = new Map();
  const list = () => {
    const out = [{ peer: selfPeer, self: true, presence: mine, at: mineAt }];
    for (const [peer, o] of others) out.push({ peer, self: false, presence: o.presence, at: o.at });
    return out;
  };
  const tellPeers = () => { const l = list(); for (const f of peerFns) later(() => f(l)); };
  const post = (m) => { if (!closed) safe(() => ch.postMessage(m)); };
  const sendMine = () => { dirty = false; post({ k: 'p', peer: selfPeer, presence: mine }); };
  ch.onmessage = (ev) => {
    const m = ev.data; if (!m || typeof m !== 'object' || m.peer === selfPeer) return;
    if (m.k === 'p') {
      const o = others.get(m.peer), now = Date.now();
      const changed = !o || JSON.stringify(o.presence) !== JSON.stringify(m.presence);
      others.set(m.peer, { presence: m.presence || {}, at: changed ? now : o.at, heard: now });
      if (changed) tellPeers();
    } else if (m.k === 'hello') sendMine();
    else if (m.k === 'bye') { if (others.delete(m.peer)) tellPeers(); }
    else if (m.k === 'e') { const fs = topicFns.get(m.topic); if (fs) for (const f of fs) later(() => f(m.data, { peer: m.peer, self: false })); }
    else if (m.k === 'd') { const fs = docFns.get(m.path); if (fs) { const v = readDoc(m.path); for (const f of fs) later(() => f(v)); } }
  };
  const beat = setInterval(() => {
    sendMine();
    const now = Date.now(); let gone = false;
    for (const [p, o] of others) if (now - o.heard > GONE) { others.delete(p); gone = true; }
    if (gone) tellPeers();
  }, BEAT);
  const bye = () => post({ k: 'bye', peer: selfPeer });
  try { addEventListener('pagehide', bye); } catch (e) { /* */ }
  post({ k: 'hello', peer: selfPeer });
  const KEY = 'bh_net_doc:';
  function readDoc(path) { try { const s = localStorage.getItem(KEY + path); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function writeDoc(path, v) {
    try { localStorage.setItem(KEY + path, JSON.stringify(v)); } catch (e) { warnOnce('mock doc', e); return false; }
    post({ k: 'd', path, peer: selfPeer });
    const fs = docFns.get(path); if (fs) for (const f of fs) later(() => f(v));
    return true;
  }
  return {
    kind: 'mock',
    self: selfPeer,
    presence(patch) {
      mine = mergeDeep(mine, patch); mineAt = Date.now();
      if (!dirty) { dirty = true; setTimeout(sendMine, 40); }
      tellPeers();
      return Promise.resolve();
    },
    peers: list,
    onPeers(fn) { peerFns.add(fn); later(() => fn(list())); return () => peerFns.delete(fn); },
    emit(topic, data) {
      post({ k: 'e', topic, data, peer: selfPeer });
      const fs = topicFns.get(topic); if (fs) for (const f of fs) later(() => f(data, { peer: selfPeer, self: true }));
      return Promise.resolve();
    },
    on(topic, fn) { if (!topicFns.has(topic)) topicFns.set(topic, new Set()); topicFns.get(topic).add(fn); return () => topicFns.get(topic).delete(fn); },
    connected: () => !closed,
    doc(path) {
      return {
        get: () => Promise.resolve(readDoc(path)),
        set: (o) => Promise.resolve(writeDoc(path, JSON.parse(JSON.stringify(o)))),
        update: (o) => { const v = readDoc(path); return Promise.resolve(v ? writeDoc(path, mergeDeep(v, o)) : false); },
        onSnapshot(fn) { if (!docFns.has(path)) docFns.set(path, new Set()); docFns.get(path).add(fn); later(() => fn(readDoc(path))); return () => docFns.get(path).delete(fn); },
      };
    },
    close() { if (closed) return; bye(); closed = true; clearInterval(beat); safe(() => ch.close()); try { removeEventListener('pagehide', bye); } catch (e) { /* */ } },
  };
}

/**
 * Connect: the artifact's room (with its db when granted) first, else the mock between tabs, else null.
 * opts.mock: true → the mock only (tests); false → never the mock. Never rejects.
 */
/** (FUN11, wave 11) the shared document on the artifact's `db` is kept behind a flag: the page is published with `room` only (the
 *  owner decides on `db`: it makes the artifact organization-internal, no public link). Off (the default): `db` is never asked for
 *  and the tally lives in presence + each device's memory (memDoc); on (`connect({ db: true })`, or `globalThis.__NET_DB = true`
 *  set before the page boots, together with `db` in the publish's capabilities): the tally is the document games/<code>. */
export const dbWanted = (opts = {}) => (opts.db != null ? !!opts.db : (typeof globalThis !== 'undefined' && globalThis.__NET_DB === true));
export async function connect(opts = {}) {
  try {
    if (opts.mock !== true) {
      const [room, db] = await Promise.all([useCap('room', opts.wait || 8000), dbWanted(opts) ? useCap('db', opts.wait || 8000) : Promise.resolve(null)]);
      if (room && typeof room.presence === 'function') return roomTransport(room, db && typeof db.doc === 'function' ? db : null);
    }
    if (opts.mock !== false) return mockTransport(opts.channel);
  } catch (e) { warnOnce('connect', e); }
  return null;
}
