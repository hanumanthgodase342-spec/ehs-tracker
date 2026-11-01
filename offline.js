/* ===================== OFFLINE LAYER =====================
   1. Outbox: record entries made without signal are saved on the phone
      and sent automatically when the connection returns.
   2. Cache: reference data (profile, sites, dropdown lists, checklists)
      is kept on the phone so the app can open and accept entries offline.
   Conflicts: new records get their ID on the phone, so they never clash.
   Edits to an existing record are sent as-is; the database audit trail
   keeps every version. Failed items are kept for review, never dropped. */

const OFF = (() => {
  const DB_NAME = "ehs-offline", VERSION = 1;
  let dbP = null;

  function db() {
    if (dbP) return dbP;
    dbP = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains("outbox")) d.createObjectStore("outbox", {keyPath: "qid", autoIncrement: true});
        if (!d.objectStoreNames.contains("cache")) d.createObjectStore("cache", {keyPath: "key"});
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbP;
  }

  function tx(store, mode, fn) {
    return db().then(d => new Promise((resolve, reject) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      const out = fn(s);
      t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
      t.onerror = () => reject(t.error);
    }));
  }

  /* ---------- Cache (reference data) ---------- */
  async function cacheSet(key, value) {
    try { await tx("cache", "readwrite", s => s.put({key, value, saved_at: Date.now()})); } catch (e) { console.warn(e); }
  }
  async function cacheGet(key) {
    try {
      const row = await new Promise((resolve, reject) => {
        db().then(d => {
          const r = d.transaction("cache", "readonly").objectStore("cache").get(key);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        }).catch(reject);
      });
      return row ? row.value : null;
    } catch (e) { return null; }
  }

  /* ---------- Outbox ---------- */
  function add(item) {
    return tx("outbox", "readwrite", s => s.add({...item, created_at: new Date().toISOString(), status: "pending", tries: 0, error: null}));
  }
  function all() {
    return db().then(d => new Promise((resolve, reject) => {
      const r = d.transaction("outbox", "readonly").objectStore("outbox").getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => reject(r.error);
    }));
  }
  function update(qid, patch) {
    return db().then(d => new Promise((resolve, reject) => {
      const t = d.transaction("outbox", "readwrite");
      const s = t.objectStore("outbox");
      const g = s.get(qid);
      g.onsuccess = () => { if (g.result) s.put({...g.result, ...patch}); };
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    }));
  }
  function remove(qid) { return tx("outbox", "readwrite", s => s.delete(qid)); }

  /* Is this error a lost connection (retry later) rather than a rejected entry? */
  function isNetworkError(e) {
    if (!navigator.onLine) return true;
    const m = String(e?.message || e || "");
    return /failed to fetch|networkerror|network request failed|load failed|timeout/i.test(m);
  }

  let flushing = false;
  /* Send every waiting item in the order it was made. Stops at the first
     connection error (try again later). Rejected items are kept with the
     reason so an admin or the user can fix them. */
  async function flush() {
    if (flushing || !navigator.onLine || typeof sb === "undefined") return;
    flushing = true;
    let sent = 0, failed = 0;
    try {
      const items = (await all()).filter(i => i.status !== "failed").sort((a, b) => a.qid - b.qid);
      for (const it of items) {
        try {
          await send(it);
          await remove(it.qid);
          sent++;
        } catch (e) {
          if (isNetworkError(e)) break;
          failed++;
          await update(it.qid, {status: "failed", error: String(e?.message || e), tries: (it.tries || 0) + 1});
        }
      }
    } finally {
      flushing = false;
      banner();
    }
    if (sent) toast(`☁️ ${sent} saved entr${sent === 1 ? "y" : "ies"} synced`);
    if (failed) toast(`⚠️ ${failed} entr${failed === 1 ? "y" : "ies"} need attention (see Offline queue)`);
  }

  /* One outbox item -> one database call. Duplicate inserts (a retry after
     a lost reply) count as success. */
  async function send(it) {
    if (it.op === "insert") {
      const {error} = await sb.from(it.table).insert(it.payload);
      if (error && error.code !== "23505") throw error;   // 23505 = already saved
    } else if (it.op === "update") {
      const {error} = await sb.from(it.table).update(it.payload).eq("id", it.match_id);
      if (error) throw error;
    } else if (it.op === "rpc") {
      const {error} = await sb.rpc(it.rpc, it.payload);
      if (error) throw error;
    }
  }

  /* ---------- Status banner ---------- */
  async function banner() {
    const items = await all().catch(() => []);
    const pending = items.filter(i => i.status !== "failed").length;
    const failed = items.filter(i => i.status === "failed").length;
    let el = document.getElementById("offBanner");
    if (!el) {
      el = document.createElement("div");
      el.id = "offBanner";
      el.setAttribute("role", "status");
      el.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:70;padding:8px 14px;font:600 13px system-ui;text-align:center;color:#fff;display:none";
      document.body.appendChild(el);
    }
    const online = navigator.onLine;
    let msg = "", bg = "";
    if (!online) { msg = "📴 Offline. Entries are saved on this phone and will sync later."; bg = "#B45309"; }
    else if (pending) { msg = `☁️ Syncing ${pending} saved entr${pending === 1 ? "y" : "ies"}…`; bg = "#2563EB"; }
    if (failed) { msg += (msg ? " · " : "") + `⚠️ ${failed} need attention`; bg = bg || "#DC2626"; }
    el.textContent = msg;
    el.style.background = bg;
    el.style.display = msg ? "block" : "none";
    el.onclick = failed ? () => { location.hash = "#offline"; } : null;
  }

  window.addEventListener("online", () => { banner(); flush(); });
  window.addEventListener("offline", banner);
  setInterval(() => { flush(); }, 60000);
  document.addEventListener("DOMContentLoaded", banner);

  return {
    add, all, remove, update, flush, send, banner, isNetworkError,
    cacheSet, cacheGet,
  };
})();

/* Queue a record insert or update. Returns the record ID. */
function queueRecord({insert, id, payload, planId}) {
  const recId = id || crypto.randomUUID();
  if (insert) {
    OFF.add({op: "insert", table: "records", payload: {...payload, id: recId}});
  } else {
    OFF.add({op: "update", table: "records", match_id: recId, payload});
  }
  if (planId) OFF.add({op: "update", table: "records", match_id: planId, payload: {status: "Completed"}});
  return recId;
}

/* Reference data: use the live copy when online, and the phone's copy when not. */
async function withCache(key, query) {
  try {
    const value = await run(query);
    OFF.cacheSet(key, value);
    return value;
  } catch (e) {
    if (OFF.isNetworkError(e)) {
      const cached = await OFF.cacheGet(key);
      if (cached) return cached;
    }
    throw e;
  }
}
