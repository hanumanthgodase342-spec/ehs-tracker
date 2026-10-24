/* ===================== EHS COMMAND v5 ===================== */

/* ---------- Settings ---------- */
const CONFIG = {
  url: "https://caygfknyxprkycyzbnhi.supabase.co",
  key: "sb_publishable_s2s8S_cALkToUQdWBtCKyg_L9JOvMpp",
  bucket: "ehs-documents",
  project: "EPC Project · HSE"
};

/* ---------- Roles and permissions ---------- */
const ROLES = {
  admin:{label:"System admin", ic:"🛠️"}, md:{label:"MD", ic:"👑"}, gm:{label:"GM", ic:"🏢"},
  hod:{label:"HOD", ic:"🏛️"}, hse_head:{label:"HSE Head", ic:"🛡️"}, manager:{label:"Manager", ic:"📈"},
  supervisor:{label:"Supervisor", ic:"👷"}, officer:{label:"HSE Officer", ic:"🦺"},
  viewer:{label:"Viewer", ic:"👀"}, contractor:{label:"Contractor", ic:"🧰"}
};
const CAN = {
  enter: ["admin","hse_head","supervisor","officer"],
  approve: ["admin","md","gm","hod","hse_head","manager"],
  upload: ["admin","hse_head","manager"],
  admin: ["admin"],
  projectWide: ["admin","md","gm","hod","hse_head","manager","viewer"]
};

/* ---------- Dropdown list names (admin can edit the values) ---------- */
const LIST_LABELS = {
  training_topics:"Training topics", equipment_types:"Equipment types", ppe_items:"PPE items",
  hazard_classes:"MSDS hazard classes", bbs_behaviours:"BBS behaviours", drill_types:"Drill types",
  hazard_categories:"Hazard categories", permit_types:"Permit types", env_types:"Environment record types",
  legal_status:"Legal compliance status", health_tests:"Health tests", cert_categories:"Certificate categories"
};

/* ---------- Menu groups ---------- */
const GROUPS = [
  {id:"inc",   l:"Incidents & actions",      ic:"🚨"},
  {id:"plan",  l:"Plans & drills",           ic:"🛡️"},
  {id:"insp",  l:"Inspections & audits",     ic:"🔍"},
  {id:"talks", l:"Training & talks",         ic:"🎓"},
  {id:"risk",  l:"Risk & permits",           ic:"⚠️"},
  {id:"chem",  l:"Chemicals & environment",  ic:"🧪"},
  {id:"ppe",   l:"PPE & health",             ic:"🦺"},
  {id:"contr", l:"Contractors & committee",  ic:"🧰"}
];

/* ---------- EHS registers (one definition each; the app builds forms, lists and charts from these) ----------
   Field types: text, long, num, date, score (1-5), sel (fixed options), lk (dropdown from a list),
                tpl (checklist template), ref (pick a planned item)
   due: name of the date field that must be watched ("@rec" = record date). openIf: only watch when true. */
const MOD = {
  tbt: {title:"Toolbox talks (TBT)", ic:"🗣️", g:"talks", date:"Talk date", cols:[{k:"topic",l:"Topic"},{k:"attendees",l:"People"},{k:"conducted_by",l:"By"}],
    fields:[
      {k:"topic",l:"Topic",t:"lk",list:"training_topics",req:1},
      {k:"conducted_by",l:"Conducted by (supervisor)",t:"text",req:1},
      {k:"duration",l:"Duration (minutes)",t:"num",dflt:10},
      {k:"attendees",l:"Number of attendees",t:"num",req:1},
      {k:"names",l:"Attendee names (one per line)",t:"long"},
      {k:"hazards",l:"Hazards discussed",t:"long"},
      {k:"remarks",l:"Questions / remarks",t:"long"}]},

  training_plan: {title:"Training plan", ic:"📅", g:"talks", date:"Planned month", status:"Planned", cols:[{k:"topic",l:"Topic"},{k:"target",l:"Target people"},{k:"trainer",l:"Trainer"}],
    due:"@rec", openIf:r => r.status === "Planned",
    fields:[
      {k:"topic",l:"Training topic",t:"lk",list:"training_topics",req:1},
      {k:"target",l:"Target number of people",t:"num",req:1},
      {k:"trainer",l:"Trainer / provider",t:"text"}]},

  training_done: {title:"Training completed", ic:"🎓", g:"talks", date:"Training date", cols:[{k:"person",l:"Person"},{k:"topic",l:"Topic"},{k:"result",l:"Result"},{k:"expiry",l:"Valid until"}],
    due:"expiry",
    fields:[
      {k:"plan",l:"From the training plan (optional)",t:"ref",module:"training_plan",label:"topic"},
      {k:"person",l:"Person name",t:"text",req:1},
      {k:"emp_id",l:"Employee ID",t:"text"},
      {k:"topic",l:"Topic",t:"lk",list:"training_topics",req:1},
      {k:"trainer",l:"Trainer",t:"text"},
      {k:"hours",l:"Hours",t:"num"},
      {k:"result",l:"Result",t:"sel",o:["Attended","Passed","Failed"],req:1},
      {k:"expiry",l:"Valid until (if it expires)",t:"date"}]},

  cert: {title:"Certificates & licences", ic:"📜", g:"talks", date:"Issued on", cols:[{k:"name",l:"Certificate"},{k:"holder",l:"Holder"},{k:"expiry",l:"Expiry",},{k:"agency",l:"Agency"}],
    due:"expiry",
    fields:[
      {k:"name",l:"Certificate / licence",t:"text",req:1},
      {k:"holder",l:"Holder",t:"text",req:1},
      {k:"cat",l:"Category",t:"lk",list:"cert_categories"},
      {k:"agency",l:"Issuing agency",t:"text"},
      {k:"expiry",l:"Expiry date",t:"date",req:1}]},

  drill_plan: {title:"Mock drill plan", ic:"🚒", g:"plan", date:"Planned date", status:"Planned", cols:[{k:"drill",l:"Drill"},{k:"responsible",l:"Owner"},{k:"participants",l:"Expected"}],
    due:"@rec", openIf:r => r.status === "Planned",
    fields:[
      {k:"drill",l:"Drill type",t:"lk",list:"drill_types",req:1},
      {k:"scenario",l:"Scenario",t:"long"},
      {k:"responsible",l:"Responsible person",t:"text",req:1},
      {k:"participants",l:"Expected participants",t:"num"}]},

  drill_rep: {title:"Mock drill report", ic:"📝", g:"plan", date:"Actual date", cols:[{k:"drill",l:"Drill"},{k:"outcome",l:"Outcome"},{k:"muster",l:"Muster (min)"}],
    fields:[
      {k:"plan",l:"Which planned drill?",t:"ref",module:"drill_plan",label:"drill"},
      {k:"drill",l:"Drill type",t:"lk",list:"drill_types",req:1},
      {k:"participants",l:"Participants present",t:"num"},
      {k:"muster",l:"Time to muster (minutes)",t:"num"},
      {k:"duration",l:"Duration (minutes)",t:"num"},
      {k:"outcome",l:"Outcome",t:"sel",o:["Satisfactory","Needs improvement","Failed"],req:1},
      {k:"observations",l:"Observations",t:"long"},
      {k:"lessons",l:"Lessons learned & actions",t:"long"}]},

  insp_plan: {title:"Inspection plan", ic:"📆", g:"insp", date:"Planned date", status:"Planned", cols:[{k:"template",l:"Checklist",fn:r => TPL_NAME[r.data.template] || ""},{k:"freq",l:"Frequency"},{k:"responsible",l:"Responsible"}],
    due:"@rec", openIf:r => r.status === "Planned",
    fields:[
      {k:"template",l:"Checklist",t:"tpl",req:1},
      {k:"freq",l:"Frequency",t:"sel",o:["Daily","Weekly","Monthly","Quarterly","Yearly","One-time"]},
      {k:"responsible",l:"Responsible person",t:"text",req:1}]},

  scaffold: {title:"Scaffold tag register", ic:"🧱", g:"insp", date:"Inspection date", cols:[{k:"tag_no",l:"Tag no."},{k:"location",l:"Location"},{k:"tag",l:"Colour"}],
    due:"next_due",
    fields:[
      {k:"tag_no",l:"Tag number",t:"text",req:1},
      {k:"location",l:"Location",t:"text",req:1},
      {k:"tag",l:"Tag colour",t:"sel",o:["🟢 Green – safe to use","🔴 Red – do not use","🟡 Yellow – conditional"],req:1},
      {k:"inspected_by",l:"Inspected by",t:"text"},
      {k:"next_due",l:"Next inspection due",t:"date"},
      {k:"findings",l:"Findings",t:"long"}]},

  equipment: {title:"Safety devices & equipment", ic:"🧯", g:"insp", date:"Last inspected", cols:[{k:"eq_type",l:"Type"},{k:"asset_no",l:"Asset no."},{k:"location",l:"Location"},{k:"condition",l:"Condition"}],
    due:"next_due",
    fields:[
      {k:"eq_type",l:"Equipment type",t:"lk",list:"equipment_types",req:1},
      {k:"asset_no",l:"Asset / serial number",t:"text",req:1},
      {k:"location",l:"Location",t:"text"},
      {k:"next_due",l:"Next inspection due",t:"date",req:1},
      {k:"condition",l:"Condition",t:"sel",o:["OK","Defective","Out of service"],req:1},
      {k:"remarks",l:"Remarks",t:"long"}]},

  bbs: {title:"BBS audits (behaviour)", ic:"👀", g:"insp", date:"Audit date", cols:[{k:"observer",l:"Observer"},{k:"area",l:"Area"},{k:"safe",l:"Safe"},{k:"unsafe",l:"Unsafe"}],
    fields:[
      {k:"observer",l:"Observer",t:"text",req:1},
      {k:"area",l:"Area / work observed",t:"text",req:1},
      {k:"behaviour",l:"Behaviour focus",t:"lk",list:"bbs_behaviours"},
      {k:"safe",l:"Safe observations (count)",t:"num",dflt:0},
      {k:"unsafe",l:"Unsafe observations (count)",t:"num",dflt:0},
      {k:"detail",l:"Unsafe behaviour detail",t:"long"},
      {k:"feedback",l:"Feedback given on the spot?",t:"sel",o:["Yes","No"]}]},

  ppe: {title:"PPE issue records", ic:"🦺", g:"ppe", date:"Issued on", cols:[{k:"person",l:"Person"},{k:"item",l:"PPE item"},{k:"qty",l:"Qty"},{k:"size",l:"Size"}],
    due:"next_due",
    fields:[
      {k:"person",l:"Person name",t:"text",req:1},
      {k:"emp_id",l:"Employee ID",t:"text"},
      {k:"item",l:"PPE item",t:"lk",list:"ppe_items",req:1},
      {k:"qty",l:"Quantity",t:"num",dflt:1},
      {k:"size",l:"Size",t:"sel",o:["S","M","L","XL","XXL","Free size","Not applicable"]},
      {k:"next_due",l:"Replace by",t:"date"}]},

  health: {title:"Medical fitness", ic:"🩺", g:"ppe", date:"Test date", cols:[{k:"person",l:"Person"},{k:"test",l:"Test"},{k:"result",l:"Result"}],
    due:"next", note:"Record only the fitness outcome. Do not record diagnoses.",
    fields:[
      {k:"person",l:"Person name",t:"text",req:1},
      {k:"emp_id",l:"Employee ID",t:"text"},
      {k:"test",l:"Test / check",t:"lk",list:"health_tests",req:1},
      {k:"result",l:"Fitness result",t:"sel",o:["Fit","Fit with restrictions","Not fit"],req:1},
      {k:"next",l:"Next due",t:"date"}]},

  sds: {title:"MSDS / SDS register", ic:"🧪", g:"chem", date:"Date received", cols:[{k:"chemical",l:"Chemical"},{k:"hazard",l:"Hazard"},{k:"store",l:"Store"},{k:"sds_on_site",l:"SDS at store"}],
    due:"review",
    fields:[
      {k:"chemical",l:"Chemical name",t:"text",req:1},
      {k:"maker",l:"Manufacturer / supplier",t:"text"},
      {k:"cas",l:"CAS number",t:"text"},
      {k:"hazard",l:"Hazard class",t:"lk",list:"hazard_classes",req:1},
      {k:"qty",l:"Quantity on site",t:"text"},
      {k:"store",l:"Storage location",t:"text"},
      {k:"sds_on_site",l:"SDS available at the store?",t:"sel",o:["Yes","No"],req:1},
      {k:"rev",l:"SDS revision / year",t:"text"},
      {k:"review",l:"Review due",t:"date"}]},

  env: {title:"Waste, spill & environment", ic:"♻️", g:"chem", date:"Date", cols:[{k:"etype",l:"Type"},{k:"qty",l:"Qty"},{k:"unit",l:"Unit"},{k:"vendor",l:"Vendor"}],
    fields:[
      {k:"etype",l:"Record type",t:"lk",list:"env_types",req:1},
      {k:"qty",l:"Quantity / reading",t:"num"},
      {k:"unit",l:"Unit",t:"sel",o:["kg","litre","m³","tonne","reading"]},
      {k:"vendor",l:"Disposal vendor",t:"text"},
      {k:"manifest",l:"Manifest / consignment no.",t:"text"},
      {k:"remarks",l:"Remarks",t:"long"}]},

  hira: {title:"Risk register (HIRA)", ic:"⚠️", g:"risk", date:"Assessed on", cols:[{k:"activity",l:"Activity"},{k:"hazard",l:"Hazard"},{fn:r => riskChip(r.data.s1, r.data.l1), l:"Risk before"},{fn:r => riskChip(r.data.s2, r.data.l2), l:"Risk after"}],
    due:"review",
    fields:[
      {k:"activity",l:"Activity / task",t:"text",req:1},
      {k:"hazard",l:"Hazard",t:"text",req:1},
      {k:"hcat",l:"Hazard category",t:"lk",list:"hazard_categories"},
      {k:"s1",l:"Severity before (1–5)",t:"score"},
      {k:"l1",l:"Likelihood before (1–5)",t:"score"},
      {k:"controls",l:"Controls in place",t:"long"},
      {k:"s2",l:"Severity after controls (1–5)",t:"score"},
      {k:"l2",l:"Likelihood after controls (1–5)",t:"score"},
      {k:"owner",l:"Owner",t:"text"},
      {k:"review",l:"Review due",t:"date"}]},

  ptw: {title:"Permit to work log", ic:"📝", g:"risk", date:"Issued on", cols:[{k:"permit_no",l:"Permit no."},{k:"ptype",l:"Type"},{k:"area",l:"Area"},{k:"status",l:"Status"}],
    due:"valid_to", openIf:r => r.data.status === "Issued",
    fields:[
      {k:"permit_no",l:"Permit number",t:"text",req:1},
      {k:"ptype",l:"Permit type",t:"lk",list:"permit_types",req:1},
      {k:"area",l:"Area / equipment",t:"text",req:1},
      {k:"issued_to",l:"Issued to (contractor / crew)",t:"text"},
      {k:"issued_by",l:"Issued by (authorised person)",t:"text",req:1},
      {k:"valid_to",l:"Valid until",t:"date",req:1},
      {k:"status",l:"Status",t:"sel",o:["Issued","Closed","Cancelled"],req:1}]},

  legal: {title:"Legal compliance register", ic:"⚖️", g:"risk", date:"Last reviewed", cols:[{k:"law",l:"Act / regulation"},{k:"status",l:"Status"},{k:"next",l:"Next review"}],
    due:"next",
    fields:[
      {k:"law",l:"Act / regulation",t:"text",req:1},
      {k:"req",l:"Requirement",t:"long",req:1},
      {k:"resp",l:"Responsible person",t:"text"},
      {k:"status",l:"Compliance status",t:"lk",list:"legal_status",req:1},
      {k:"next",l:"Next review",t:"date"}]},

  contractor: {title:"Contractor prequalification", ic:"🧰", g:"contr", date:"Assessed on", cols:[{k:"company",l:"Company"},{k:"scope",l:"Scope"},{k:"rating",l:"Rating"},{k:"pq",l:"Status"}],
    due:"insurance",
    fields:[
      {k:"company",l:"Company",t:"text",req:1},
      {k:"scope",l:"Scope of work",t:"text",req:1},
      {k:"rating",l:"Safety rating",t:"sel",o:["A","B","C","D"]},
      {k:"workers",l:"Number of workers",t:"num"},
      {k:"insurance",l:"Insurance valid until",t:"date"},
      {k:"pq",l:"Prequalification status",t:"sel",o:["Approved","Pending","Rejected"],req:1}]},

  meeting: {title:"Safety committee meetings", ic:"🤝", g:"contr", date:"Meeting date", cols:[{k:"title",l:"Meeting"},{k:"attendees",l:"People"},{k:"actions",l:"Actions raised"}],
    fields:[
      {k:"title",l:"Meeting title",t:"text",req:1},
      {k:"attendees",l:"Attendees (count)",t:"num"},
      {k:"minutes",l:"Key points / minutes",t:"long"},
      {k:"actions",l:"Actions raised (count)",t:"num"},
      {k:"next",l:"Next meeting",t:"date"}]},

};

/* ---------- Helpers ---------- */
const sb = supabase.createClient(CONFIG.url, CONFIG.key);
const S = {user:null, profile:null, sites:[], site:"all", route:"home", arg:"", last:null, range:null, tpl:null, months:12, charts:[], LK:{}, TPLS:[], PROFILES:[]};
const TPL_NAME = {};
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const localISO = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const addDays = n => localISO(new Date(Date.now() + n*864e5));
const fd = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "–";
const ft = d => d ? new Date(d).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "–";
const fmtN = n => Number(n || 0).toLocaleString("en-IN");
const first = n => (n || "there").split(/[ @]/)[0];
const role = () => S.profile?.role || "viewer";
const can = k => CAN[k].includes(role());
const pw = () => CAN.projectWide.includes(role());
const sf = (q, col = "site_id") => (S.site === "all" ? q : q.eq(col, S.site));
const fdata = f => Object.fromEntries(new FormData(f));
const nowLocal = () => localISO() + "T" + new Date().toTimeString().slice(0,5);
const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const roleChip = r => `<span class="chip blue">${ROLES[r]?.ic || ""} ${esc(ROLES[r]?.label || r || "")}</span>`;
const kpi = (ic, v, l) => `<div class="kpi"><div style="font-size:22px">${ic}</div><div class="v">${v}</div><div class="l">${l}</div></div>`;
const empty = (ic, msg) => `<div class="empty card"><div class="ic">${ic}</div>${msg}</div>`;
const exportBtn = () => `<button class="btn ghost sm" data-act="export">⬇️ Export to Excel (CSV)</button>`;
const monthKeys = n => Array.from({length:n}, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (n - 1 - i)); return localISO(d).slice(0,7); });
const monthStart = n => monthKeys(n)[0] + "-01";
const cv = (r, c) => c.fn ? c.fn(r) : (c.k === "rec_date" ? r.rec_date : (r.data?.[c.k] ?? ""));
const dueOf = (r, mod) => mod.due === "@rec" ? r.rec_date : (r.data?.[mod.due] || null);
const statusOf = r => r.status || r.data?.status || "";
function toast(msg){ const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2800); }
function err(e){ toast("⚠️ " + (e?.message || e)); console.error(e); }
async function run(p){ const r = await p; if (r.error) throw r.error; return r.data; }
function audit(action, table, id){ sb.from("audit_log").insert({action, table_name: table, record_id: String(id || "")}).then(() => {}); }
const denied = () => { $("#main").innerHTML = header("🔒 Not for your role") + empty("🔒", 'Your role does not have access to this page.<br><a href="#home">Go to Home</a>'); };
function riskChip(s, l){
  if (!s || !l) return "–";
  const v = s * l;
  const c = v >= 15 ? "bad" : v >= 8 ? "warn" : "ok";
  const t = v >= 15 ? "High" : v >= 8 ? "Medium" : "Low";
  return `<span class="chip ${c}">${t} · ${v}</span>`;
}
function dueChip(d){
  if (!d) return "";
  const days = Math.ceil((new Date(d) - new Date(localISO())) / 864e5);
  if (days < 0) return `<span class="chip bad">⛔ Overdue ${-days}d</span>`;
  if (days <= 30) return `<span class="chip warn">⚠️ Due in ${days}d</span>`;
  return `<span class="chip ok">✅ ${fd(d)}</span>`;
}
function dueCls(d){ if (!d) return ""; const days = Math.ceil((new Date(d) - new Date(localISO())) / 864e5); return days < 0 ? "hi" : days <= 30 ? "md" : "lo"; }
function header(title, sub = "", right = ""){
  return `<div class="top"><div><h1>${title}</h1><div class="muted small">${sub}</div></div><div class="row" style="justify-content:flex-end">${right}${siteSelect()}</div></div>`;
}
function siteSelect(){
  return `<select id="siteSel" aria-label="Area">${pw() ? '<option value="all">🏗️ All areas</option>' : ""}${S.sites.map(s => `<option value="${s.id}" ${S.site === s.id ? "selected" : ""}>📍 ${esc(s.name)}</option>`).join("")}</select>`;
}
function siteField(name = "site_id"){
  return `<select name="${name}" required>${S.sites.map(s => `<option value="${s.id}" ${S.site === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>`;
}
function shield(){
  const name = S.site === "all" ? "All areas" : (S.sites.find(s => s.id === S.site)?.name || "");
  return pw()
    ? `<div class="card shield">🔒 Showing <b>${esc(name)}</b> · your role sees all areas</div>`
    : `<div class="card shield">🔒 Showing <b>${esc(name)}</b> · your role sees your own area. <a href="#access">Request access</a> to see others.</div>`;
}
function statusChip(r){
  if (r.status === "pending") return '<span class="chip warn">⏳ Pending</span>';
  if (r.status === "rejected") return '<span class="chip bad">❌ Rejected</span>';
  if (r.expires_at && new Date(r.expires_at) > new Date()) return `<span class="chip ok">✅ Until ${fd(r.expires_at)}</span>`;
  return '<span class="chip">⌛ Expired</span>';
}
function docChip(s){ return `<span class="chip ${s === "Approved" ? "ok" : s === "Obsolete" ? "bad" : s === "In review" ? "warn" : ""}">${esc(s)}</span>`; }
function exportCSV(name, rows, cols){
  const lines = [cols.map(c => c[0]).join(",")].concat(rows.map(r => cols.map(c => {
    const v = typeof c[1] === "function" ? c[1](r) : r[c[1]];
    return '"' + String(v ?? "").replace(/"/g, '""') + '"';
  }).join(",")));
  const blob = new Blob(["﻿" + lines.join("\n")], {type: "text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name + "-" + localISO() + ".csv";
  a.click();
  audit("export", name, rows.length);
}
function killCharts(){ S.charts.forEach(c => c.destroy()); S.charts = []; }
function chart(id, cfg){
  const el = document.getElementById(id);
  if (!el || typeof Chart === "undefined") return;
  const palette = ["#2563EB","#059669","#F59E0B","#DC2626","#7C3AED","#0891B2","#DB2777","#65A30D","#EA580C","#475569"];
  cfg.options = Object.assign({responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"bottom"}}}, cfg.options || {});
  if (cfg.data?.datasets) cfg.data.datasets.forEach((d, i) => { d.backgroundColor = d.backgroundColor || palette[i % palette.length]; d.borderColor = d.borderColor || palette[i % palette.length]; });
  S.charts.push(new Chart(el, cfg));
}

/* ---------- Navigation ---------- */
function items(){
  return [
    {id:"home", ic:"🏠", t:"Home"},
    {id:"dashboard", ic:"📈", t:"Dashboard"},
    {id:"tracker", ic:"🧭", t:"Data tracker", ok: pw()},
    {id:"enter", ic:"➕", t:"Enter data", ok: can("enter")},
    {id:"registers", ic:"🗂️", t:"Registers"},
    {id:"approvals", ic:"🔑", t:"Approvals", ok: can("approve")},
    {id:"docs", ic:"📁", t:"Documents"},
    {id:"access", ic:"🔓", t:"Request access"},
    {id:"admin", ic:"🛠️", t:"Admin", ok: can("admin")}
  ].filter(i => i.ok !== false);
}
function bottom(){
  return [
    {id:"home", ic:"🏠", t:"Home"},
    {id:"dashboard", ic:"📈", t:"Dashboard"},
    can("enter") ? {id:"enter", ic:"➕", t:"Enter"} : {id:"actions", ic:"✅", t:"Actions"},
    {id:"registers", ic:"🗂️", t:"Registers"},
    {id:"more", ic:"☰", t:"More"}
  ];
}
function buildNav(){
  const side = items().map(i => `<a href="#${i.id}" data-r="${i.id}"><span class="ic">${i.ic}</span>${i.t}</a>`).join("");
  $("#side").innerHTML = `<div class="brand"><span class="logo">🦺</span><div>EHS Command<small>${esc(CONFIG.project)}</small></div></div>`
    + side
    + `<div class="side-h">Registers</div>`
    + GROUPS.map(g => `<a href="#registers/${g.id}" data-r="registers"><span class="ic">${g.ic}</span>${g.l}</a>`).join("")
    + `<div class="who"><b>${esc(S.profile.full_name || "")}</b>${ROLES[role()]?.label || role()}<button type="button" data-act="signout">🚪 Sign out</button></div>`;
  $("#bottomnav").innerHTML = bottom().map(i => `<a href="#${i.id}" data-r="${i.id}"><span class="ic">${i.ic}</span>${i.t}</a>`).join("");
}
function highlight(){ document.querySelectorAll("[data-r]").forEach(a => a.classList.toggle("on", a.dataset.r === S.route)); }

const PAGES = {};
async function route(){
  if (!S.user) return;
  killCharts();
  const h = (location.hash || "#home").slice(1);
  const i = h.indexOf("/");
  S.route = i < 0 ? h : h.slice(0, i);
  S.arg = i < 0 ? "" : h.slice(i + 1);
  highlight();
  const page = PAGES[S.route] || PAGES.home;
  $("#main").innerHTML = '<div class="empty"><div class="ic">⏳</div>Loading…</div>';
  try { await page(S.arg); }
  catch (e) {
    err(e);
    $("#main").innerHTML = header("⚠️ Could not load this page") + `<div class="card small">${esc(e.message || e)}<br><br>If this is a new feature, the database update may not be run yet (see migration_v5.sql).</div>`;
  }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);

/* ---------- Login and start ---------- */
async function loadProfile(){ S.profile = await run(sb.from("profiles").select("*").eq("id", S.user.id).single()); }
async function loadSites(){ S.sites = await run(sb.from("sites").select("id,name,location").order("name")); }
async function loadLists(){
  const rows = await run(sb.from("lookups").select("list_key,value,sort").order("sort").order("value"));
  S.LK = {};
  rows.forEach(r => { (S.LK[r.list_key] = S.LK[r.list_key] || []).push(r.value); });
}
async function loadTemplates(){
  S.TPLS = await run(sb.from("checklist_templates").select("id,name,category,items").order("category"));
  S.TPLS.forEach(t => { TPL_NAME[t.id] = t.name; });
}
async function startApp(user){
  S.user = user;
  await Promise.all([loadProfile(), loadSites(), loadLists(), loadTemplates()]);
  S.site = pw() ? "all" : (S.profile.site_id || S.sites[0]?.id || "all");
  buildNav();
  $("#boot").classList.add("hidden");
  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  if (!location.hash) location.hash = "#home"; else route();
}
function showLogin(){ $("#boot").classList.add("hidden"); $("#app").classList.add("hidden"); $("#login").classList.remove("hidden"); }
(async () => {
  const {data} = await sb.auth.getSession();
  if (data.session) await startApp(data.session.user); else showLogin();
})().catch(e => { showLogin(); toast("⚠️ " + (e.message || e)); });

$("#lf").addEventListener("submit", async e => {
  e.preventDefault();
  $("#lmsg").textContent = "Signing in…";
  try {
    const {data, error} = await sb.auth.signInWithPassword({email: $("#le").value.trim(), password: $("#lp").value});
    if (error) throw error;
    await startApp(data.user);
  } catch (x) { $("#lmsg").textContent = "❌ " + x.message; }
});
$("#forgot").addEventListener("click", async () => {
  const em = $("#le").value.trim();
  if (!em) return toast("Type your email first");
  const {error} = await sb.auth.resetPasswordForEmail(em);
  toast(error ? "⚠️ " + error.message : "📧 Reset link sent to your email");
});

/* ===================== HOME: what needs attention ===================== */
PAGES.home = async () => {
  const yr = localISO().slice(0,4) + "-01-01";
  const dueMods = Object.keys(MOD).filter(k => MOD[k].due);
  const [kRows, openA, lastLti, recent, dueRecs] = await Promise.all([
    run(sf(sb.from("v_monthly_kpi").select("*")).gte("period", yr)),
    run(sf(sb.from("actions").select("id,description,status,due_date,owner,sites(name)")).neq("status","Closed").limit(1000)),
    run(sf(sb.from("incidents").select("occurred_at")).in("classification", ["Lost time","Fatality"]).order("occurred_at", {ascending:false}).limit(1)),
    run(sf(sb.from("incidents").select("id,event_type,classification,description,occurred_at,area,sites(name),reporter:profiles!reported_by(full_name)")).order("occurred_at", {ascending:false}).limit(5)),
    Promise.all(dueMods.map(k => run(sf(sb.from("records").select("id,module,rec_date,status,data,sites(name)")).eq("module", k).limit(500))))
  ]);
  const hrs = kRows.reduce((s, r) => s + (+r.hours || 0), 0);
  const rec = kRows.reduce((s, r) => s + (+r.recordable || 0), 0);
  const lti = kRows.reduce((s, r) => s + (+r.lti || 0), 0);
  const near = kRows.reduce((s, r) => s + (+r.near_miss || 0), 0);
  const ltifr = hrs ? (lti * 1e6 / hrs).toFixed(2) : "0.00";
  const days = lastLti.length ? Math.floor((Date.now() - new Date(lastLti[0].occurred_at)) / 864e5) : null;
  const today = localISO(), in30 = addDays(30);

  const attention = [];
  openA.filter(a => a.due_date && a.due_date <= in30).forEach(a => attention.push({ic:"✅", cls: a.due_date < today ? "hi" : "md", title: a.description, sub: `Action · ${a.sites?.name || ""} · ${a.owner || "no owner"}`, date: a.due_date, go: "#actions/open"}));
  dueMods.forEach((k, idx) => {
    const mod = MOD[k];
    dueRecs[idx].forEach(r => {
      const d = dueOf(r, mod);
      if (!d || d > in30) return;
      if (mod.openIf && !mod.openIf(r)) return;
      attention.push({ic: mod.ic, cls: d < today ? "hi" : "md", title: `${mod.title}: ${mod.cols[0].fn ? mod.cols[0].fn(r) : cv(r, mod.cols[0])}`, sub: `${r.sites?.name || ""}`, date: d, go: `#m/${k}/${r.id}`});
    });
  });
  attention.sort((a, b) => a.date < b.date ? -1 : 1);

  const quick = can("enter")
    ? [["incident","🚨","Incident","Injury, damage, spill"],["near_miss","🟡","Near miss","Could have hurt someone"],["unsafe_condition","⚠️","Unsafe condition","Hazard seen"],["tbt","🗣️","Toolbox talk","Record today's TBT"],["manhours","⏱️","Manhours","Hours this month"],["inspections","✅","Run checklist","Inspection"]]
    : [["dashboard","📈","Dashboard","Charts and trends"],["registers","🗂️","Registers","All records"],["approvals","🔑","Approvals","Access requests"],["docs","📁","Documents","Read and acknowledge"]];
  const qHref = q => ["incident","near_miss","unsafe_condition"].includes(q[0]) ? `#enter/${q[0]}` : q[0] === "manhours" ? "#enter/manhours" : q[0] === "inspections" ? "#inspections" : q[0] === "tbt" ? "#m/tbt/new" : `#${q[0]}`;

  $("#main").innerHTML = `
    ${header(`${greet()}, ${esc(first(S.profile.full_name))} 👋`, `${roleChip(role())} <span class="muted">· ${esc(S.site === "all" ? "All areas" : (S.sites.find(s => s.id === S.site)?.name || ""))}</span>`)}
    ${shield()}
    <div class="kpis">
      ${kpi("🏅", days === null ? "–" : days, days === null ? "No LTI on record 🎉" : "days without LTI")}
      ${kpi("📉", ltifr, "LTIFR (this year)")}
      ${kpi("🩹", rec, "Recordable injuries")}
      ${kpi("🟡", near, "Near misses")}
      ${kpi("⏱️", fmtN(hrs), "Manhours")}
      ${kpi("⛔", attention.filter(a => a.cls === "hi").length, "Overdue items")}
    </div>
    <div class="sec">⚡ Quick actions</div>
    <div class="tiles">${quick.map(q => `<a class="tile" href="${qHref(q)}"><div class="ic">${q[1]}</div><b>${q[2]}</b><small>${q[3]}</small></a>`).join("")}</div>
    <div class="sec">🔔 Needs attention in the next 30 days <span class="chip">${attention.length}</span></div>
    <div class="list">${attention.slice(0, 15).map(a => `<a href="${a.go}" style="text-decoration:none;color:inherit;display:block"><div class="item ${a.cls}">
      <div class="row"><b>${a.ic} ${esc(a.title)}</b>${dueChip(a.date)}</div>
      <div class="small muted" style="margin-top:4px">${esc(a.sub)}</div></div></a>`).join("") || empty("🎉", "Nothing overdue or due soon.")}</div>
    <div class="sec">🕒 Latest incidents & near misses</div>
    <div class="list">${recent.map(r => `<div class="item ${r.event_type === "incident" ? "hi" : r.event_type === "near_miss" ? "md" : "blue"}">
      <div class="row"><b>${ENTRY_ICON(r.event_type)} ${esc(r.classification || ENTRY_LABEL(r.event_type))}</b><span class="small muted">${ft(r.occurred_at)}</span></div>
      <div class="small" style="margin-top:6px">${esc(r.description).slice(0, 120)}</div>
      <div class="small muted" style="margin-top:6px">📍 ${esc(r.sites?.name || "")} · ${esc(r.area || "")} · 👤 ${esc(r.reporter?.full_name || "")}</div></div>`).join("") || empty("📭", "No incidents recorded yet.")}</div>`;
};
const ENTRY_TYPES = [
  {id:"incident", ic:"🚨", t:"Incident", d:"Injury, damage or spill"},
  {id:"near_miss", ic:"🟡", t:"Near miss", d:"Could have hurt someone"},
  {id:"unsafe_condition", ic:"⚠️", t:"Unsafe condition", d:"Hazard seen on site"}
];
const ENTRY_ICON = e => ENTRY_TYPES.find(t => t.id === e)?.ic || "📝";
const ENTRY_LABEL = e => ENTRY_TYPES.find(t => t.id === e)?.t || e;
const CLASSES = ["First aid","Medical treatment","Restricted work","Lost time","Fatality","Property damage","Environmental release"];
const CLASS_IC = {"First aid":"🩹","Medical treatment":"🏥","Restricted work":"🛌","Lost time":"⛔","Fatality":"🕯️","Property damage":"🔧","Environmental release":"🌫️"};
const catIc = c => ({"Daily":"☀️","Permit to Work":"📝","PPE":"🦺","Height":"🪜","Lifting":"🏗️","Scaffolding":"🧱","Excavation":"⛏️","Electrical":"⚡","Fire":"🔥","Housekeeping":"🧹","Vehicle":"🚚","First Aid":"🩹","Environment":"🌿","Chemicals":"🧪","Training":"🎤","Audit":"🔎"})[c] || "📋";

/* ===================== DASHBOARD (charts) ===================== */
PAGES.dashboard = async () => {
  const n = S.months;
  const keys = monthKeys(n);
  const since = monthStart(n);
  const [kpiRows, inc, acts, insp, recs, eq, ppeRecs, tbtAll] = await Promise.all([
    run(sf(sb.from("v_monthly_kpi").select("*")).gte("period", since)),
    run(sf(sb.from("incidents").select("event_type,occurred_at,classification")).gte("occurred_at", since).limit(5000)),
    run(sf(sb.from("actions").select("status,due_date")).limit(5000)),
    run(sf(sb.from("inspections").select("score,inspected_at,plan_id,template_id")).gte("inspected_at", since).limit(5000)),
    run(sf(sb.from("records").select("module,rec_date,status,data")).in("module", ["insp_plan","training_done","bbs","ppe","tbt","drill_plan","drill_rep"]).gte("rec_date", since).limit(5000)),
    run(sf(sb.from("records").select("data")).eq("module", "equipment").limit(2000)),
    run(sf(sb.from("records").select("rec_date,data")).eq("module", "ppe").gte("rec_date", since).limit(2000)),
    run(sf(sb.from("records").select("rec_date,data")).eq("module", "tbt").gte("rec_date", since).limit(2000))
  ]);
  const byM = m => keys.map(k => m[k] || 0);
  const mapOf = (rows, fn) => { const o = {}; rows.forEach(r => { const k = fn(r); if (k) o[k] = (o[k] || 0) + 1; }); return o; };
  const mo = d => (d || "").slice(0,7);

  // Incidents by month
  const incM = {};
  inc.forEach(r => { const k = mo(r.occurred_at); incM[k] = incM[k] || {incident:0, near_miss:0, unsafe_condition:0}; incM[k][r.event_type]++; });
  // LTIFR
  const ltM = {};
  kpiRows.forEach(r => { const k = mo(r.period); ltM[k] = ltM[k] || {h:0, l:0}; ltM[k].h += +r.hours; ltM[k].l += +r.lti; });
  // Actions
  const t = localISO();
  const aOpen = acts.filter(a => a.status === "Open").length, aProg = acts.filter(a => a.status === "In progress").length;
  const aClosed = acts.filter(a => a.status === "Closed").length;
  const aOver = acts.filter(a => a.status !== "Closed" && a.due_date && a.due_date < t).length;
  // Inspections
  const insM = {};
  insp.forEach(r => { const k = mo(r.inspected_at); insM[k] = insM[k] || {s:0, c:0}; insM[k].s += +r.score || 0; insM[k].c++; });
  const insDone = insp.length, insPlanned = recs.filter(r => r.module === "insp_plan").length;
  const insPlanDone = recs.filter(r => r.module === "insp_plan" && r.status === "Completed").length;
  const compl = insPlanned ? Math.round(insPlanDone * 100 / insPlanned) : null;
  // Plans
  const planM = {}, doneM = {};
  recs.filter(r => r.module === "insp_plan").forEach(r => { const k = mo(r.rec_date); planM[k] = (planM[k] || 0) + 1; if (r.status === "Completed") doneM[k] = (doneM[k] || 0) + 1; });
  // Training by topic
  const trTopic = mapOf(recs.filter(r => r.module === "training_done"), r => r.data?.topic);
  const trTopicArr = Object.entries(trTopic).sort((a, b) => b[1] - a[1]).slice(0, 10);
  // BBS
  const bbs = recs.filter(r => r.module === "bbs");
  const bbsM = {};
  bbs.forEach(r => { const k = mo(r.rec_date); bbsM[k] = bbsM[k] || {s:0, u:0}; bbsM[k].s += +r.data?.safe || 0; bbsM[k].u += +r.data?.unsafe || 0; });
  const bbsS = bbs.reduce((s, r) => s + (+r.data?.safe || 0), 0), bbsU = bbs.reduce((s, r) => s + (+r.data?.unsafe || 0), 0);
  const bbsPct = bbsS + bbsU ? Math.round(bbsS * 100 / (bbsS + bbsU)) : null;
  // TBT
  const tbtM = {}; tbtAll.forEach(r => { const k = mo(r.rec_date); tbtM[k] = (tbtM[k] || 0) + 1; });
  const tbtCount = tbtAll.length;
  const tbtPeople = tbtAll.reduce((s, r) => s + (+r.data?.attendees || 0), 0);
  // Equipment
  const eqSt = {OK:0, "Due ≤30 days":0, Overdue:0, "Defective / out of service":0};
  const in30 = addDays(30);
  eq.forEach(r => {
    const d = r.data?.next_due;
    if (r.data?.condition && r.data.condition !== "OK") eqSt["Defective / out of service"]++;
    else if (d && d < t) eqSt.Overdue++;
    else if (d && d <= in30) eqSt["Due ≤30 days"]++;
    else eqSt.OK++;
  });
  // PPE
  const ppeItem = {}; ppeRecs.forEach(r => { const k = r.data?.item || "Other"; ppeItem[k] = (ppeItem[k] || 0) + (+r.data?.qty || 1); });
  const ppeArr = Object.entries(ppeItem).sort((a, b) => b[1] - a[1]).slice(0, 10);
  // Drills
  const drillPlan = recs.filter(r => r.module === "drill_plan").length, drillRep = recs.filter(r => r.module === "drill_rep").length;

  $("#main").innerHTML = header("📈 Dashboard", "Trends for the selected area. Change the area at the top right, or the period below.",
      `<select id="periodSel" onchange="S.months=+this.value;route()" style="width:auto">${[3,6,12,24].map(m => `<option value="${m}" ${S.months === m ? "selected" : ""}>Last ${m} months</option>`).join("")}</select>`) + shield() + `
    <div class="kpis">
      ${kpi("🚨", inc.filter(r => r.event_type === "incident").length, "Incidents (period)")}
      ${kpi("🟡", inc.filter(r => r.event_type === "near_miss").length, "Near misses (period)")}
      ${kpi("⛔", aOver, "Overdue actions")}
      ${kpi("✅", aClosed + "/" + acts.length, "Actions closed")}
      ${kpi("🔍", compl === null ? "–" : compl + "%", "Inspection plan completed")}
      ${kpi("👀", bbsPct === null ? "–" : bbsPct + "%", "BBS safe behaviour")}
      ${kpi("🗣️", tbtCount, "Toolbox talks")}
      ${kpi("👥", fmtN(tbtPeople), "TBT attendance")}
    </div>
    <div class="charts">
      <div class="card"><h2>🚨 Incidents & near misses by month</h2><div class="chartbox"><canvas id="c1"></canvas></div></div>
      <div class="card"><h2>📉 LTIFR trend</h2><div class="chartbox"><canvas id="c2"></canvas></div></div>
      <div class="card"><h2>✅ Actions by status</h2><div class="chartbox"><canvas id="c3"></canvas></div></div>
      <div class="card"><h2>🔍 Inspection score trend (average %)</h2><div class="chartbox"><canvas id="c4"></canvas></div></div>
      <div class="card"><h2>📆 Inspection plan vs completed</h2><div class="chartbox"><canvas id="c5"></canvas></div></div>
      <div class="card"><h2>👀 BBS safe vs unsafe observations</h2><div class="chartbox"><canvas id="c6"></canvas></div></div>
      <div class="card"><h2>🎓 Training completed by topic</h2><div class="chartbox"><canvas id="c7"></canvas></div></div>
      <div class="card"><h2>🗣️ Toolbox talks per month</h2><div class="chartbox"><canvas id="c8"></canvas></div></div>
      <div class="card"><h2>🧯 Safety devices status</h2><div class="chartbox"><canvas id="c9"></canvas></div></div>
      <div class="card"><h2>🦺 PPE issued by item</h2><div class="chartbox"><canvas id="c10"></canvas></div></div>
      <div class="card"><h2>🚒 Mock drills planned vs reports</h2><div class="chartbox"><canvas id="c11"></canvas></div></div>
    </div>`;

  const L = keys.map(k => k.slice(2));
  chart("c1", {type:"bar", data:{labels:L, datasets:[
    {label:"Incidents", data:byM(Object.fromEntries(keys.map(k => [k, incM[k]?.incident || 0]))), backgroundColor:"#DC2626"},
    {label:"Near misses", data:byM(Object.fromEntries(keys.map(k => [k, incM[k]?.near_miss || 0]))), backgroundColor:"#F59E0B"},
    {label:"Unsafe conditions", data:byM(Object.fromEntries(keys.map(k => [k, incM[k]?.unsafe_condition || 0]))), backgroundColor:"#2563EB"}]},
    options:{scales:{x:{stacked:true}, y:{stacked:true, beginAtZero:true}}}});
  chart("c2", {type:"line", data:{labels:L, datasets:[{label:"LTIFR", data:keys.map(k => ltM[k] && ltM[k].h ? +(ltM[k].l * 1e6 / ltM[k].h).toFixed(2) : null), tension:.3, fill:false}]}, options:{spanGaps:true, scales:{y:{beginAtZero:true}}}});
  chart("c3", {type:"doughnut", data:{labels:["Open","In progress","Closed"], datasets:[{data:[aOpen, aProg, aClosed], backgroundColor:["#F59E0B","#2563EB","#059669"]}]}});
  chart("c4", {type:"line", data:{labels:L, datasets:[{label:"Average score %", data:keys.map(k => insM[k] ? Math.round(insM[k].s / insM[k].c) : null), tension:.3}]}, options:{spanGaps:true, scales:{y:{min:0, max:100}}}});
  chart("c5", {type:"bar", data:{labels:L, datasets:[{label:"Planned", data:byM(planM)}, {label:"Completed", data:byM(doneM), backgroundColor:"#059669"}]}, options:{scales:{y:{beginAtZero:true}}}});
  chart("c6", {type:"bar", data:{labels:L, datasets:[{label:"Safe", data:keys.map(k => bbsM[k]?.s || 0), backgroundColor:"#059669"}, {label:"Unsafe", data:keys.map(k => bbsM[k]?.u || 0), backgroundColor:"#DC2626"}]}, options:{scales:{x:{stacked:true}, y:{stacked:true, beginAtZero:true}}}});
  chart("c7", {type:"bar", data:{labels:trTopicArr.map(x => x[0]), datasets:[{label:"People trained", data:trTopicArr.map(x => x[1])}]}, options:{indexAxis:"y"}});
  chart("c8", {type:"bar", data:{labels:L, datasets:[{label:"Talks", data:byM(tbtM)}]}, options:{scales:{y:{beginAtZero:true}}}});
  chart("c9", {type:"doughnut", data:{labels:Object.keys(eqSt), datasets:[{data:Object.values(eqSt), backgroundColor:["#059669","#F59E0B","#DC2626","#7C3AED"]}]}});
  chart("c10", {type:"bar", data:{labels:ppeArr.map(x => x[0]), datasets:[{label:"Quantity issued", data:ppeArr.map(x => x[1])}]}, options:{indexAxis:"y"}});
  chart("c11", {type:"bar", data:{labels:["Planned drills","Drill reports"], datasets:[{label:"Count", data:[drillPlan, drillRep]}]}});
};

/* ===================== DATA TRACKER (who is entering what) ===================== */
PAGES.tracker = async () => {
  if (!pw()) return denied();
  const d30 = localISO(new Date(Date.now() - 30*864e5));
  const [recs, inc, ins, mh, act, profs] = await Promise.all([
    run(sf(sb.from("records").select("module,site_id,entered_by,created_at")).gte("created_at", d30).limit(5000)),
    run(sf(sb.from("incidents").select("event_type,site_id,reported_by,created_at")).gte("created_at", d30).limit(5000)),
    run(sf(sb.from("inspections").select("site_id,inspector,created_at")).gte("created_at", d30).limit(5000)),
    run(sf(sb.from("manhours").select("site_id,entered_by,period")).gte("period", d30).limit(5000)),
    run(sf(sb.from("actions").select("site_id,entered_by,created_at")).gte("created_at", d30).limit(5000)),
    run(sb.from("profiles").select("id,full_name"))
  ]);
  const names = Object.fromEntries(profs.map(p => [p.id, p.full_name || "–"]));
  const sites = S.site === "all" ? S.sites : S.sites.filter(s => s.id === S.site);
  // rows: each module
  const rowsDef = [
    ...Object.keys(MOD).map(k => ({label: MOD[k].ic + " " + MOD[k].title, count: r => r.module === k, site: r => r.site_id, who: r => r.entered_by, src: recs})),
    {label:"🚨 Incidents, near misses", site: r => r.site_id, who: r => r.reported_by, src: inc, count: () => true},
    {label:"✅ Inspections", site: r => r.site_id, who: r => r.inspector, src: ins, count: () => true},
    {label:"⏱️ Manhours", site: r => r.site_id, who: r => r.entered_by, src: mh, count: () => true},
    {label:"🛠️ Actions", site: r => r.site_id, who: r => r.entered_by, src: act, count: () => true}
  ];
  const people = {};
  const rowsHtml = rowsDef.map(d => {
    const per = {};
    d.src.filter(d.count).forEach(r => {
      const s = d.site(r); per[s] = (per[s] || 0) + 1;
      const w = d.who(r); if (w) people[w] = (people[w] || 0) + 1;
    });
    const total = Object.values(per).reduce((a, b) => a + b, 0);
    return `<tr><td>${esc(d.label)}</td>${sites.map(s => `<td class="${per[s.id] ? "some" : "zero"}">${per[s.id] || 0}</td>`).join("")}<td><b>${total}</b></td></tr>`;
  }).join("");
  const peopleRows = Object.entries(people).sort((a, b) => b[1] - a[1]).map(([id, c]) => `<tr><td>${esc(names[id] || "–")}</td><td><b>${c}</b></td></tr>`).join("");
  S.last = {name: "data_tracker", rows: Object.entries(people).map(([id, c]) => ({name: names[id] || "–", count: c})), cols: [["Person","name"],["Entries (30 days)","count"]]};
  $("#main").innerHTML = header("🧭 Data tracker", "Who is entering data, and where nothing has been entered in the last 30 days (red cells).", exportBtn()) + `
    <div class="card"><h2>📍 Entries by register and area (last 30 days)</h2><div class="scroll" style="margin-top:10px"><table>
      <tr><th>Register</th>${sites.map(s => `<th>${esc(s.name)}</th>`).join("")}<th>Total</th></tr>
      ${rowsHtml}</table></div></div>
    <div class="sec">👥 Entries by person (last 30 days)</div>
    <div class="card scroll"><table><tr><th>Person</th><th>Entries</th></tr>${peopleRows || `<tr><td colspan="2" class="muted">No entries in the last 30 days</td></tr>`}</table></div>`;
};

/* ===================== ENTER DATA HUB ===================== */
PAGES.enter = async (arg) => {
  if (!can("enter")) return denied();
  const sub = (arg || "").split("/")[0];
  if (sub === "incident" || sub === "near_miss" || sub === "unsafe_condition") return formIncident(sub);
  if (sub === "manhours") return formManhours();
  if (sub === "action") return formAction();
  return enterHub();
};
function enterHub(){
  const special = [
    ["enter/incident","🚨","Incident","Injury, damage or spill"],
    ["enter/near_miss","🟡","Near miss","Could have hurt someone"],
    ["enter/unsafe_condition","⚠️","Unsafe condition","Hazard seen on site"],
    ["enter/manhours","⏱️","Manhours","Hours worked per month"],
    ["enter/action","🛠️","Corrective action","Assign owner and date"],
    ["inspections","✅","Run a checklist","Inspection"]
  ];
  const mods = Object.keys(MOD).map(k => [`m/${k}/new`, MOD[k].ic, MOD[k].title, GROUPS.find(g => g.id === MOD[k].g)?.l || ""]);
  if (can("upload")) mods.push(["docs/new","📄","Upload document","Procedure, form, plan"]);
  $("#main").innerHTML = header("➕ Enter data", "Pick what you want to record. Every entry is saved with your name and the date.") +
    `<div class="sec">🚨 Incidents, actions & inspections</div><div class="tiles">${special.map(t => `<a class="tile" href="#${t[0]}"><div class="ic">${t[1]}</div><b>${t[2]}</b><small>${t[3]}</small></a>`).join("")}</div>` +
    `<div class="sec">🗂️ EHS registers</div><div class="tiles">${mods.map(t => `<a class="tile" href="#${t[0]}"><div class="ic">${t[1]}</div><b>${esc(t[2])}</b><small>${esc(t[3])}</small></a>`).join("")}</div>`;
}

function formIncident(kind){
  const et = ENTRY_TYPES.find(t => t.id === kind);
  $("#main").innerHTML = header(`${et.ic} ${et.t}`, et.d) + `
  <div class="card">
    <div class="seg">${ENTRY_TYPES.map(t => `<a class="${t.id === kind ? "on" : ""}" href="#enter/${t.id}">${t.ic} ${t.t}</a>`).join("")}</div>
    <form id="fInc" data-kind="${kind}">
      <label>🏗️ Area</label>${siteField()}
      <label>📅 When did it happen?</label>
      <input type="datetime-local" name="occurred_at" value="${nowLocal()}" required>
      <label>📍 Exact place</label>
      <input name="area" placeholder="e.g. Block B, scaffold level 3" required>
      ${kind === "incident" ? `<label>🏷️ Type of injury or damage</label>
        <select name="classification" required><option value="">— choose —</option>${CLASSES.map(c => `<option value="${c}">${CLASS_IC[c]} ${c}</option>`).join("")}</select>` : ""}
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
        <div><label>⚠️ Severity (1–5)</label><select name="severity">${[1,2,3,4,5].map(n => `<option ${n === 3 ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div><label>🎲 Likelihood (1–5)</label><select name="likelihood">${[1,2,3,4,5].map(n => `<option ${n === 3 ? "selected" : ""}>${n}</option>`).join("")}</select></div>
      </div>
      <label>📝 What happened?</label>
      <textarea name="description" rows="4" required placeholder="Who, what, how. Keep it factual."></textarea>
      <label>🔍 Root cause (if known)</label>
      <textarea name="root_cause" rows="2"></textarea>
      <div class="card" style="background:#F8FAFC;margin-top:14px;box-shadow:none">
        <b>🛠️ Corrective action (optional)</b>
        <label>What will be done?</label><input name="ac_desc">
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
          <div><label>👤 Owner</label><input name="ac_owner"></div>
          <div><label>📅 Due</label><input type="date" name="ac_due" value="${addDays(14)}"></div>
        </div>
        <label>🚦 Priority</label>
        <select name="ac_priority"><option>High</option><option selected>Medium</option><option>Low</option></select>
      </div>
      <button class="btn block" style="margin-top:16px">💾 Save report</button>
    </form>
  </div>`;
}
function formManhours(){
  $("#main").innerHTML = header("⏱️ Manhours", "Hours worked per area per month. These feed the KPIs and charts.") + `
  <div class="card"><form id="fMan">
    <label>📍 Area</label>${siteField()}
    <label>🗓️ Month</label><input type="month" name="month" value="${localISO().slice(0,7)}" required>
    <label>⏱️ Total hours (all staff and contractors)</label>
    <input type="number" name="hours" min="0" step="1" required placeholder="e.g. 42000">
    <button class="btn block" style="margin-top:16px">💾 Save manhours</button>
  </form></div>`;
}
function formAction(){
  $("#main").innerHTML = header("🛠️ Corrective action", "Something that must be fixed, with an owner and a due date") + `
  <div class="card"><form id="fAct">
    <label>📍 Area</label>${siteField()}
    <label>📝 What must be done?</label><textarea name="description" rows="3" required></textarea>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      <div><label>👤 Owner</label><input name="owner"></div>
      <div><label>📅 Due</label><input type="date" name="due_date" value="${addDays(7)}" required></div>
    </div>
    <label>🚦 Priority</label>
    <select name="priority"><option>High</option><option selected>Medium</option><option>Low</option></select>
    <button class="btn block" style="margin-top:16px">💾 Save action</button>
  </form></div>`;
}

/* ===================== REGISTERS (generic module pages) ===================== */
PAGES.registers = async (arg) => {
  if (arg) {
    const g = GROUPS.find(x => x.id === arg);
    if (g) {
      const mods = Object.keys(MOD).filter(k => MOD[k].g === arg);
      const extra = arg === "inc" ? [["incidents","🚨","Incidents & near misses"],["actions","🛠️","Corrective actions"]]
                  : arg === "insp" ? [["inspections","✅","Checklist inspections"]] : [];
      $("#main").innerHTML = header(`${g.ic} ${g.l}`, "Tap a register to see its records, or add new ones.") +
        `<div class="tiles">${extra.map(e => `<a class="tile" href="#${e[0]}"><div class="ic">${e[1]}</div><b>${e[2]}</b><small>Open register</small></a>`).join("")}
         ${mods.map(k => `<a class="tile" href="#m/${k}"><div class="ic">${MOD[k].ic}</div><b>${esc(MOD[k].title)}</b><small>${MOD[k].fields.length} fields · open</small></a>`).join("")}</div>`;
      return;
    }
  }
  $("#main").innerHTML = header("🗂️ Registers", "Every EHS register in one place. Choose a group.") +
    `<div class="tiles">${GROUPS.map(g => `<a class="tile" href="#registers/${g.id}"><div class="ic">${g.ic}</div><b>${g.l}</b><small>${Object.keys(MOD).filter(k => MOD[k].g === g.id).length + (g.id === "inc" ? 2 : g.id === "insp" ? 1 : 0)} registers</small></a>`).join("")}</div>
     <div class="card" style="margin-top:14px;background:#F8FAFC;box-shadow:none"><b>💡 Plan → do → check:</b> Plans (inspection, training, drills) show what is due. When the work is done, pick the plan in the completion form, and the plan is marked completed. Charts on the Dashboard compare plan vs completed.</div>`;
};

PAGES.m = async (arg) => {
  const [key, id] = (arg || "").split("/");
  const mod = MOD[key];
  if (!mod) return PAGES.registers("");
  if (id === "new") return formRecord(key, null);
  if (id) {
    const rec = await run(sf(sb.from("records").select("*")).eq("id", id).single());
    return formRecord(key, rec);
  }
  return listRecords(key);
};

async function listRecords(key){
  const mod = MOD[key];
  const rows = await run(sf(sb.from("records").select("*, by:profiles!entered_by(full_name), sites(name)")).eq("module", key).order("rec_date", {ascending:false}).limit(500));
  const t = localISO(), mStart = localISO().slice(0,7);
  const thisMonth = rows.filter(r => (r.rec_date || "").slice(0,7) === mStart).length;
  const overdue = mod.due ? rows.filter(r => (mod.openIf ? mod.openIf(r) : true) && dueOf(r, mod) && dueOf(r, mod) < t).length : null;
  const dueSoon = mod.due ? rows.filter(r => (mod.openIf ? mod.openIf(r) : true) && dueOf(r, mod) && dueOf(r, mod) >= t && dueOf(r, mod) <= addDays(30)).length : null;
  S.last = {name: key, rows, cols: [["Date", "rec_date"], ...mod.cols.map(c => [c.l, x => cv(x, c)]), ["Area", x => x.sites?.name || ""], ["Entered by", x => x.by?.full_name || ""]]};
  const cards = rows.map(r => {
    const d = dueOf(r, mod);
    const primary = mod.cols[0];
    const rest = mod.cols.slice(1).map(c => `<span class="small muted">${esc(c.l)}: <b style="color:var(--ink)">${esc(cv(r, c))}</b></span>`).join(" · ");
    const rowStatus = r.status ? `<span class="chip ${r.status === "Completed" ? "ok" : "blue"}">${esc(r.status)}</span>` : "";
    return `<div class="item ${dueCls(d) || "blue"} rec" data-search="${esc((cv(r, primary) + " " + mod.cols.map(c => cv(r, c)).join(" ") + " " + (r.sites?.name || "")).toLowerCase())}">
      <div class="row"><b>${esc(cv(r, primary)) || "(no name)"}</b><span style="display:flex;gap:6px;flex-wrap:wrap">${rowStatus}${d ? dueChip(d) : ""}</span></div>
      <div style="margin-top:6px;line-height:1.8">${rest}</div>
      <div class="small muted" style="margin-top:8px">📅 ${fd(r.rec_date)} · 📍 ${esc(r.sites?.name || "")} · 👤 ${esc(r.by?.full_name || "")}</div>
      <div class="row" style="margin-top:10px;justify-content:flex-end">
        ${can("enter") ? `<a class="btn ghost sm" href="#m/${key}/${r.id}">✏️ Edit</a>` : ""}
        ${role() === "admin" ? `<button class="btn bad sm" data-act="del_rec" data-id="${r.id}" data-key="${key}">🗑️</button>` : ""}
      </div></div>`;
  }).join("");
  $("#main").innerHTML = header(`${mod.ic} ${mod.title}`, mod.note || "", (can("enter") ? `<a class="btn sm" href="#m/${key}/new">＋ Add new</a>` : "") + exportBtn()) + shield() + `
    <div class="kpis" style="grid-template-columns:repeat(${mod.due ? 4 : 2},1fr)">
      ${kpi("📋", rows.length, "Total records")}
      ${kpi("📅", thisMonth, "This month")}
      ${mod.due ? kpi("⛔", overdue, "Overdue") : ""}
      ${mod.due ? kpi("⚠️", dueSoon, "Due in 30 days") : ""}
    </div>
    <div class="card" style="margin-top:14px"><input id="recSearch" placeholder="🔍 Search this register…" oninput="filterRecs(this.value)"></div>
    <div class="list" style="margin-top:12px" id="recList">${cards || empty(mod.ic, `No ${esc(mod.title.toLowerCase())} yet.${can("enter") ? '<br><br><a class="btn sm" href="#m/' + key + '/new">＋ Add the first one</a>' : ""}`)}</div>`;
}
function filterRecs(q){
  q = (q || "").toLowerCase();
  document.querySelectorAll("#recList .rec").forEach(el => el.classList.toggle("hidden", !el.dataset.search.includes(q)));
}
window.filterRecs = filterRecs;

function fieldHTML(f, val, refs){
  const v = val ?? (f.dflt ?? "");
  const L = `<label>${esc(f.l)}${f.req ? ' <span style="color:var(--bad)">*</span>' : ""}</label>`;
  const req = f.req ? "required" : "";
  switch (f.t) {
    case "long": return L + `<textarea name="${f.k}" rows="3">${esc(v)}</textarea>`;
    case "num": return L + `<input type="number" step="any" name="${f.k}" value="${esc(v)}" ${req}>`;
    case "date": return L + `<input type="date" name="${f.k}" value="${esc(v)}" ${req}>`;
    case "score": return L + `<select name="${f.k}">${[1,2,3,4,5].map(n => `<option ${+v === n ? "selected" : ""}>${n}</option>`).join("")}</select>`;
    case "sel": return L + `<select name="${f.k}" ${req}><option value="">— choose —</option>${f.o.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    case "lk": return L + `<select name="${f.k}" ${req}><option value="">— choose —</option>${(S.LK[f.list] || []).map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select><div class="small muted" style="margin-top:4px">Missing an option? Ask the admin to add it under Admin → Dropdown lists.</div>`;
    case "tpl": return L + `<select name="${f.k}" ${req}><option value="">— choose —</option>${S.TPLS.map(t => `<option value="${t.id}" ${t.id === v ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>`;
    case "ref": return L + `<select name="${f.k}"><option value="">— none —</option>${(refs[f.k] || []).map(r => `<option value="${r.id}" ${r.id === v ? "selected" : ""}>${esc(r.label)}</option>`).join("")}</select><div class="small muted" style="margin-top:4px">Only planned items are shown.</div>`;
    default: return L + `<input name="${f.k}" value="${esc(v)}" ${req}>`;
  }
}
async function formRecord(key, rec){
  if (!can("enter")) return denied();
  const mod = MOD[key];
  const refs = {};
  for (const f of mod.fields.filter(x => x.t === "ref")) {
    const rows = await run(sb.from("records").select("id,rec_date,status,data,plan_id").eq("module", f.module).order("rec_date", {ascending:false}).limit(300));
    refs[f.k] = rows.filter(r => r.status === "Planned" || (rec && r.id === rec.plan_id))
      .map(r => ({id: r.id, label: `${r.data?.[f.label] || ""} · ${fd(r.rec_date)}`}));
  }
  const vals = rec ? {...rec.data} : {};
  if (rec) mod.fields.forEach(f => { if (f.t === "ref") vals[f.k] = rec.plan_id; });
  const fieldsHtml = mod.fields.map(f => fieldHTML(f, vals[f.k], refs)).join("");
  $("#main").innerHTML = header(`${mod.ic} ${rec ? "Edit" : "New"} · ${mod.title}`, mod.note || "Fields marked * are required.") + `
  <div class="card"><form id="fRec" data-key="${key}" data-id="${rec ? rec.id : ""}">
    <label>📍 Area</label>${siteFieldVal(rec?.site_id)}
    <label>📅 ${esc(mod.date || "Date")}</label>
    <input type="date" name="rec_date" value="${rec ? rec.rec_date : localISO()}" required>
    ${fieldsHtml}
    <button class="btn block" style="margin-top:18px">💾 ${rec ? "Save changes" : "Save record"}</button>
  </form></div>`;
}
function siteFieldVal(val){
  const v = val || (S.site !== "all" ? S.site : "");
  return `<select name="site_id" required>${S.sites.map(s => `<option value="${s.id}" ${s.id === v ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select>`;
}

/* ===================== INCIDENTS & ACTIONS ===================== */
PAGES.incidents = async (f = "all") => {
  const rows = await run(sf(sb.from("incidents").select("*, sites(name), reporter:profiles!reported_by(full_name)")).order("occurred_at", {ascending:false}).limit(300));
  const list = rows.filter(r => f === "all" || r.event_type === f);
  S.last = {name: "incidents", rows: list, cols: [["Date", x => ft(x.occurred_at)], ["Type", x => ENTRY_LABEL(x.event_type)], ["Class", x => x.classification || ""], ["Area", "area"], ["Site", x => x.sites?.name || ""], ["Severity", "severity"], ["Likelihood", "likelihood"], ["Description", "description"], ["Entered by", x => x.reporter?.full_name || ""]]};
  const tab = (k, l) => `<a class="${f === k ? "on" : ""}" href="#incidents/${k}">${l}</a>`;
  $("#main").innerHTML = header("🚨 Incidents & near misses", "Every report, with the risk rating (severity × likelihood)",
      (can("enter") ? ENTRY_TYPES.map(t => `<a class="btn sm ${t.id === "incident" ? "bad" : "ghost"}" href="#enter/${t.id}">${t.ic} ${t.t}</a>`).join("") : "") + exportBtn()) + shield() + `
    <div class="seg" style="margin-bottom:14px">${tab("all","📋 All")}${tab("incident","🚨 Incidents")}${tab("near_miss","🟡 Near misses")}${tab("unsafe_condition","⚠️ Unsafe")}</div>
    <div class="list">${list.map(r => `<div class="item ${r.event_type === "incident" ? "hi" : r.event_type === "near_miss" ? "md" : "blue"}">
      <div class="row"><b>${ENTRY_ICON(r.event_type)} ${esc(r.classification || ENTRY_LABEL(r.event_type))}</b>${riskChip(r.severity, r.likelihood)}</div>
      <div class="small" style="margin-top:6px">${esc(r.description)}</div>
      <div class="small muted" style="margin-top:6px">📅 ${ft(r.occurred_at)} · 📍 ${esc(r.sites?.name || "")} · ${esc(r.area || "")} · 👤 ${esc(r.reporter?.full_name || "")}</div>
      ${r.root_cause ? `<div class="small muted">🔍 ${esc(r.root_cause)}</div>` : ""}</div>`).join("") || empty("📭", "No reports here yet.")}</div>`;
};

PAGES.actions = async (f = "open") => {
  const rows = await run(sf(sb.from("actions").select("*, sites(name)")).order("due_date", {ascending:true, nullsFirst:false}).limit(400));
  const t = localISO();
  const isOpen = r => r.status !== "Closed";
  const list = rows.filter(r => f === "all" ? true : f === "closed" ? r.status === "Closed" : f === "overdue" ? (isOpen(r) && r.due_date && r.due_date < t) : isOpen(r));
  S.last = {name: "actions", rows: list, cols: [["Action", "description"], ["Site", x => x.sites?.name || ""], ["Owner", "owner"], ["Due", "due_date"], ["Priority", "priority"], ["Status", "status"]]};
  const tab = (k, l) => `<a class="${f === k ? "on" : ""}" href="#actions/${k}">${l}</a>`;
  $("#main").innerHTML = header("✅ Corrective actions", "Created from incidents, near misses, inspections and meetings", exportBtn()) + `
    <div class="seg" style="margin-bottom:14px">${tab("open","🟡 Open")}${tab("overdue","⛔ Overdue")}${tab("closed","✅ Closed")}${tab("all","📋 All")}</div>
    <div class="list">${list.map(r => {
      const od = isOpen(r) && r.due_date && r.due_date < t;
      return `<div class="item ${r.priority === "High" ? "hi" : r.priority === "Medium" ? "md" : "lo"}">
        <div class="row"><b>${esc(r.description)}</b><span class="chip ${r.priority === "High" ? "bad" : r.priority === "Medium" ? "warn" : "ok"}">${esc(r.priority)}</span></div>
        <div class="small muted" style="margin-top:6px">📍 ${esc(r.sites?.name || "")} · 👤 ${esc(r.owner || "Unassigned")} · 📅 ${fd(r.due_date)} ${od ? '<span class="chip bad">OVERDUE</span>' : ""}</div>
        <div class="row" style="margin-top:10px">
          <span class="chip">${r.status === "Closed" ? "✅ Closed" : r.status === "In progress" ? "🔧 In progress" : "🟡 Open"}</span>
          ${can("enter") && isOpen(r) ? `<span style="display:flex;gap:8px">
            ${r.status === "Open" ? `<button class="btn ghost sm" data-act="act_status" data-id="${r.id}" data-s="In progress">🔧 Start</button>` : ""}
            <button class="btn ok sm" data-act="act_status" data-id="${r.id}" data-s="Closed">✅ Close</button></span>` : ""}
        </div></div>`;
    }).join("") || empty("🎉", "Nothing here. Well done.")}</div>`;
};

/* ===================== INSPECTIONS (checklists) ===================== */
PAGES.inspections = async () => {
  const recent = await run(sf(sb.from("inspections").select("id,score,fails,inspected_at,sites(name),template_id,by:profiles!inspector(full_name)")).order("inspected_at", {ascending:false}).limit(20));
  $("#main").innerHTML = header("✅ Inspections", "Pick a checklist. Every Fail creates a corrective action automatically.") + shield() + `
    ${can("enter") ? `<div class="tiles">${S.TPLS.map(t => `<a class="tile" href="#inspect/${t.id}"><div class="ic">${catIc(t.category)}</div><b>${esc(t.name)}</b><small>${t.items.length} checks</small></a>`).join("")}</div>` : ""}
    <div class="sec">🗂️ Recent inspections</div>
    <div class="list">${recent.map(r => `<div class="item ${r.score >= 90 ? "lo" : r.score >= 70 ? "md" : "hi"}">
      <div class="row"><b>${esc(TPL_NAME[r.template_id] || "Checklist")}</b><span class="chip ${r.score >= 90 ? "ok" : r.score >= 70 ? "warn" : "bad"}">${r.score ?? "–"}%</span></div>
      <div class="small muted" style="margin-top:6px">📍 ${esc(r.sites?.name || "")} · 📅 ${ft(r.inspected_at)} · 👤 ${esc(r.by?.full_name || "")} · ❌ ${r.fails} fail(s)</div></div>`).join("") || empty("📭", "No inspections yet")}</div>`;
};
PAGES.inspect = async (id) => {
  if (!can("enter")) return denied();
  const t = S.TPLS.find(x => x.id === id) || await run(sb.from("checklist_templates").select("*").eq("id", id).single());
  S.tpl = t;
  const planned = await run(sf(sb.from("records").select("id,rec_date,data")).eq("module", "insp_plan").eq("status", "Planned").order("rec_date").limit(200));
  const mine = planned.filter(p => p.data?.template === t.id);
  const crit = t.items.filter(i => i.critical).length;
  $("#main").innerHTML = header(`${catIc(t.category)} ${esc(t.name)}`, `${t.items.length} checks · ${crit} critical`) + `
  <form id="fIns">
    <div class="card">
      <label>📍 Area</label>${siteField()}
      <label>📆 Planned inspection (optional)</label>
      <select name="plan"><option value="">— not from the plan —</option>${mine.map(p => `<option value="${p.id}">${fd(p.rec_date)} · ${esc(p.data?.responsible || "")}</option>`).join("")}</select>
      <label>👷 Inspected by</label><input value="${esc(S.profile.full_name || "")}" disabled>
    </div>
    <div class="sec">Checklist <span class="muted small" id="prog">0 of ${t.items.length} checked</span></div>
    ${t.items.map(it => `
      <div class="check-row" data-item="${esc(it.id)}">
        <div class="row"><b>${esc(it.text)}</b>${it.critical ? '<span class="chip bad">CRITICAL</span>' : ""}</div>
        <div class="pf">
          <button type="button" class="p" data-act="pf" data-s="pass">✅ Pass</button>
          <button type="button" class="f" data-act="pf" data-s="fail">❌ Fail</button>
          <button type="button" class="n" data-act="pf" data-s="na">➖ N/A</button>
        </div>
        <textarea class="note hidden" rows="2" placeholder="What did you see? (required for Fail)" style="margin-top:10px"></textarea>
      </div>`).join("")}
    <button class="btn block" style="margin-top:12px">📤 Submit inspection</button>
  </form>`;
};
function updProg(){
  const f = $("#fIns"); if (!f) return;
  $("#prog").textContent = `${f.querySelectorAll("[data-item][data-s]").length} of ${f.querySelectorAll("[data-item]").length} checked`;
}

/* ===================== APPROVALS, ACCESS ===================== */
PAGES.approvals = async () => {
  if (!can("approve")) return denied();
  const rows = await run(sb.from("access_requests").select("*, who:profiles!requester(full_name, role), sites(name)").order("created_at", {ascending:false}).limit(100));
  const pend = rows.filter(r => r.status === "pending");
  const done = rows.filter(r => r.status !== "pending").slice(0, 15);
  $("#main").innerHTML = header("🔑 Approvals", "Approve people who need to see another area's data") + `
    <div class="sec">⏳ Waiting for you (${pend.length})</div>
    <div class="list">${pend.map(r => `<div class="item md">
      <div class="row"><b>👤 ${esc(r.who?.full_name || "Unknown")}</b>${roleChip(r.who?.role)}</div>
      <div class="small" style="margin-top:6px">📍 Wants: <b>${esc(r.sites?.name || "")}</b> · 🗓️ ${ft(r.created_at)}</div>
      <div class="small muted" style="margin-top:6px">💬 ${esc(r.reason)}</div>
      <div class="pf" style="grid-template-columns:1fr 1fr 1fr">
        <button type="button" class="p" data-act="decide" data-id="${r.id}" data-days="7">✅ 7 days</button>
        <button type="button" class="p" data-act="decide" data-id="${r.id}" data-days="30">✅ 30 days</button>
        <button type="button" class="f" data-act="decide" data-id="${r.id}" data-days="0">❌ Reject</button>
      </div></div>`).join("") || empty("🎉", "No pending requests")}</div>
    <div class="sec">🗂️ Recent decisions</div>
    <div class="list">${done.map(r => `<div class="item ${r.status === "approved" ? "lo" : "hi"}">
      <div class="row"><b>👤 ${esc(r.who?.full_name || "")} · 📍 ${esc(r.sites?.name || "")}</b>${statusChip(r)}</div>
      <div class="small muted">${esc(r.reason)}</div></div>`).join("") || empty("📭", "No decisions yet")}</div>`;
};
PAGES.access = async () => {
  const mine = await run(sb.from("access_requests").select("*, sites(name)").order("created_at", {ascending:false}).limit(30));
  $("#main").innerHTML = header("🔓 Request access", "Need to see another area? A manager approves it for a set number of days.") + `
    <div class="card"><form id="fAcc">
      <label>📍 Area you need</label>${siteField()}
      <label>💬 Why do you need it?</label>
      <textarea name="reason" rows="3" required placeholder="e.g. Covering Site B for 2 weeks"></textarea>
      <button class="btn block" style="margin-top:14px">📨 Send request</button>
    </form></div>
    <div class="sec">My requests</div>
    <div class="list">${mine.map(r => `<div class="item ${r.status === "approved" ? "lo" : r.status === "rejected" ? "hi" : "md"}">
      <div class="row"><b>📍 ${esc(r.sites?.name || "")}</b>${statusChip(r)}</div>
      <div class="small muted">${esc(r.reason)}</div></div>`).join("") || empty("📭", "No requests yet")}</div>`;
};

/* ===================== DOCUMENTS ===================== */
PAGES.docs = async (arg) => {
  if (arg === "new") {
    if (!can("upload")) return denied();
    return docForm();
  }
  const [docs, acks] = await Promise.all([
    run(sb.from("documents").select("*, sites(name), by:profiles!uploaded_by(full_name)").order("created_at", {ascending:false}).limit(300)),
    run(sb.from("document_acks").select("document_id").eq("user_id", S.user.id))
  ]);
  const acked = new Set(acks.map(a => a.document_id));
  $("#main").innerHTML = header("📁 Documents", "Read-only for most staff. Read it, then tap Acknowledge.", can("upload") ? `<a class="btn sm" href="#docs/new">＋ Upload</a>` : "") + `
    <div class="list">${docs.map(d => `<div class="item blue">
      <div class="row"><b>${d.restricted ? "🔒 " : "📄 "}${esc(d.title)}</b>${docChip(d.status)}</div>
      <div class="small muted" style="margin-top:6px">🔢 ${esc(d.doc_no || "–")} · v${esc(d.version)} · 📂 ${esc(d.category || "General")} · 📍 ${esc(d.sites?.name || "All areas")}</div>
      <div class="small muted">👤 ${esc(d.by?.full_name || "")} · 🔁 review ${fd(d.review_due)}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn ghost sm" data-act="open_doc" data-path="${esc(d.storage_path)}">📂 Open</button>
        ${acked.has(d.id) ? '<span class="chip ok">✅ You acknowledged</span>' : `<button class="btn ok sm" data-act="ack" data-id="${d.id}">✍️ Acknowledge</button>`}
      </div></div>`).join("") || empty("📭", "No documents yet")}</div>`;
};
function docForm(){
  $("#main").innerHTML = header("📄 Upload document", "Staff read it. Only managers and the HSE Head can change it.") + `
  <div class="card"><form id="fDoc">
    <label>📝 Title</label><input name="title" required>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      <div><label>🔢 Doc number</label><input name="doc_no"></div>
      <div><label>🏷️ Version</label><input name="version" value="1.0"></div>
    </div>
    <label>📂 Category</label>
    <select name="category">${["Procedure","Work permit","Method statement","Risk assessment","MSDS / SDS","Plan","Form","Register","Legal","Other"].map(c => `<option>${c}</option>`).join("")}</select>
    <label>🚦 Status</label>
    <select name="status"><option>Draft</option><option>In review</option><option>Approved</option></select>
    <label>📍 Area</label>
    <select name="site_id"><option value="">🏗️ All areas</option>${S.sites.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select>
    <label>🔁 Review due</label><input type="date" name="review_due">
    <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="restricted"> 🔒 Restricted (only people I add)</label>
    <label>📎 File (PDF, Word, Excel or image)</label>
    <input type="file" name="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg">
    <button class="btn block" style="margin-top:16px">⬆️ Upload</button>
  </form></div>`;
}

/* ===================== ADMIN ===================== */
PAGES.admin = async () => {
  if (!can("admin")) return denied();
  const [people, log] = await Promise.all([
    run(sb.from("profiles").select("*").order("full_name")),
    run(sb.from("audit_log").select("*").order("at", {ascending:false}).limit(60))
  ]);
  S.PROFILES = people;
  const nameOf = Object.fromEntries(people.map(p => [p.id, p.full_name]));
  const roleOpts = v => Object.entries(ROLES).map(([k, r]) => `<option value="${k}" ${k === v ? "selected" : ""}>${r.ic} ${r.label}</option>`).join("");
  const siteOpts = v => `<option value="">— none —</option>` + S.sites.map(s => `<option value="${s.id}" ${s.id === v ? "selected" : ""}>${esc(s.name)}</option>`).join("");
  const listKey = S.adminList || Object.keys(LIST_LABELS)[0];
  const values = S.LK[listKey] || [];
  $("#main").innerHTML = header("🛠️ Admin", "People, roles, areas, dropdown lists and the audit trail") + `
    <div class="card"><h2>➕ Add an area</h2>
      <form id="fSite" class="grid" style="grid-template-columns:1fr 1fr auto;gap:10px;margin-top:10px;align-items:end">
        <div><label>Name</label><input name="name" required></div>
        <div><label>Location</label><input name="location"></div>
        <button class="btn">Add</button>
      </form></div>
    <div class="sec">📋 Dropdown lists</div>
    <div class="card">
      <p class="small muted" style="margin-top:0">Change the choices people see in the forms. Example: add a new training topic here and it appears in every training form.</p>
      <select id="listSel" onchange="S.adminList=this.value;route()">${Object.keys(LIST_LABELS).map(k => `<option value="${k}" ${k === listKey ? "selected" : ""}>${LIST_LABELS[k]}</option>`).join("")}</select>
      <div style="margin-top:12px">${values.map(v => `<span class="chip" style="margin:4px;padding:6px 10px">${esc(v)} <button class="btn ghost sm" style="padding:2px 8px;margin-left:4px" data-act="lk_del" data-key="${listKey}" data-v="${esc(v)}">✕</button></span>`).join("") || '<span class="muted">No values yet</span>'}</div>
      <div class="row" style="margin-top:12px"><input id="lkVal" placeholder="New option…" style="max-width:360px"><button class="btn sm" data-act="lk_add" data-key="${listKey}">➕ Add option</button></div>
    </div>
    <div class="sec">👥 People (${people.length})</div>
    <p class="small muted">To add someone: create their login in Supabase → Authentication → Users → Add user (tick Auto Confirm). They appear here. Then set name, role and area, and tap Save.</p>
    <div class="list">${people.map(p => `<div class="item" data-user="${p.id}"><div class="grid">
        <input name="name" value="${esc(p.full_name || "")}" placeholder="Full name">
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">
          <select name="role">${roleOpts(p.role)}</select>
          <select name="site_id">${siteOpts(p.site_id)}</select>
        </div>
        <div class="row"><span class="small muted">joined ${fd(p.created_at)}</span><button class="btn sm" data-act="save_user" data-id="${p.id}">💾 Save</button></div>
      </div></div>`).join("")}</div>
    <div class="sec">🧾 Audit trail (latest 60)</div>
    <div class="card scroll"><table><tr><th>When</th><th>Who</th><th>Action</th><th>Table</th></tr>
    ${log.map(l => `<tr><td>${ft(l.at)}</td><td>${esc(nameOf[l.user_id] || "–")}</td><td>${esc(l.action)}</td><td>${esc(l.table_name || "")}</td></tr>`).join("")}
    </table></div>`;
};

/* ===================== MORE ===================== */
PAGES.more = () => {
  $("#main").innerHTML = header("☰ Menu") + `
    <div class="tiles">${items().filter(i => !["home","dashboard","registers"].includes(i.id)).map(i => `<a class="tile" href="#${i.id}"><div class="ic">${i.ic}</div><b>${i.t}</b></a>`).join("")}
      <a class="tile" href="#actions"><div class="ic">✅</div><b>Actions</b></a>
      <a class="tile" href="#incidents"><div class="ic">🚨</div><b>Incidents</b></a>
      <a class="tile" href="#inspections"><div class="ic">✅</div><b>Inspections</b></a></div>
    <div class="card" style="margin-top:14px"><b>${esc(S.profile.full_name || "")}</b><div class="small muted">${ROLES[role()]?.label || role()}</div>
    <button class="btn ghost block" style="margin-top:12px" data-act="signout">🚪 Sign out</button></div>`;
};
PAGES.approve = PAGES.approvals;

/* ===================== BUTTONS ===================== */
const ACTS = {
  pf: (b) => {
    const row = b.closest("[data-item]");
    row.dataset.s = b.dataset.s;
    row.querySelectorAll(".pf button").forEach(x => x.classList.toggle("on", x === b));
    row.querySelector(".note").classList.toggle("hidden", b.dataset.s !== "fail");
    updProg();
  },
  act_status: async (b) => {
    const s = b.dataset.s;
    await run(sb.from("actions").update({status: s, closed_at: s === "Closed" ? new Date().toISOString() : null}).eq("id", b.dataset.id));
    audit("update", "actions", b.dataset.id);
    toast("✅ Updated");
    route();
  },
  decide: async (b) => {
    const d = +b.dataset.days;
    const patch = d === 0 ? {status: "rejected"} : {status: "approved", expires_at: new Date(Date.now() + d*864e5).toISOString()};
    await run(sb.from("access_requests").update({...patch, decided_by: S.user.id, decided_at: new Date().toISOString()}).eq("id", b.dataset.id));
    audit("decide", "access_requests", b.dataset.id);
    toast(d ? "✅ Approved for " + d + " days" : "❌ Rejected");
    route();
  },
  ack: async (b) => {
    await run(sb.from("document_acks").upsert({document_id: b.dataset.id, user_id: S.user.id}));
    toast("✍️ Acknowledged");
    route();
  },
  open_doc: async (b) => {
    const w = window.open("", "_blank");
    const {data, error} = await sb.storage.from(CONFIG.bucket).createSignedUrl(b.dataset.path, 300);
    if (error) { if (w) w.close(); throw error; }
    if (w) w.location = data.signedUrl; else window.open(data.signedUrl, "_blank");
    audit("view", "documents", b.dataset.path);
  },
  del_rec: async (b) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    await run(sb.from("records").delete().eq("id", b.dataset.id));
    audit("delete", "records", b.dataset.id);
    toast("🗑️ Deleted");
    route();
  },
  lk_add: async (b) => {
    const v = $("#lkVal").value.trim();
    if (!v) return toast("Type the new option first");
    await run(sb.from("lookups").insert({list_key: b.dataset.key, value: v, sort: 99}));
    await loadLists();
    toast("✅ Option added");
    route();
  },
  lk_del: async (b) => {
    if (!confirm(`Remove "${b.dataset.v}" from this list? Old records keep their value.`)) return;
    await run(sb.from("lookups").delete().eq("list_key", b.dataset.key).eq("value", b.dataset.v));
    await loadLists();
    toast("Removed");
    route();
  },
  save_user: async (b) => {
    const row = b.closest("[data-user]");
    const id = b.dataset.id;
    await run(sb.from("profiles").update({
      full_name: row.querySelector("[name=name]").value.trim() || null,
      role: row.querySelector("[name=role]").value,
      site_id: row.querySelector("[name=site_id]").value || null
    }).eq("id", id));
    audit("update", "profiles", id);
    toast("💾 Saved");
    if (id === S.user.id) { await loadProfile(); buildNav(); }
  },
  export: () => { if (!S.last) return toast("Nothing to export"); exportCSV(S.last.name, S.last.rows, S.last.cols); },
  signout: async () => { await sb.auth.signOut(); S.user = null; S.profile = null; location.hash = ""; showLogin(); }
};
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  e.preventDefault();
  try { await ACTS[b.dataset.act](b); } catch (x) { err(x); }
});

/* ===================== FORMS ===================== */
const FORMS = {
  fRec: async (f) => {
    const key = f.dataset.key, id = f.dataset.id || null;
    const mod = MOD[key];
    const d = fdata(f);
    const data = {};
    let planId = null;
    mod.fields.forEach(x => {
      if (x.t === "ref") { planId = d[x.k] || null; return; }
      let v = d[x.k];
      if (v === undefined || v === "") v = null;
      else if (x.t === "num" || x.t === "score") v = +v;
      data[x.k] = v;
    });
    const payload = {module: key, site_id: d.site_id, rec_date: d.rec_date, plan_id: planId, data};
    if (mod.status && !id) payload.status = mod.status;
    if (id) {
      await run(sb.from("records").update(payload).eq("id", id));
      audit("update", "records", id);
    } else {
      const row = await run(sb.from("records").insert(payload).select("id").single());
      audit("create", "records", row.id);
      if (planId) await run(sb.from("records").update({status: "Completed"}).eq("id", planId));
    }
    toast("✅ Saved");
    location.hash = "#m/" + key;
  },
  fInc: async (f) => {
    const d = fdata(f);
    const kind = f.dataset.kind;
    const row = {
      site_id: d.site_id, event_type: kind,
      classification: kind === "incident" ? (d.classification || null) : null,
      occurred_at: new Date(d.occurred_at).toISOString(),
      area: d.area, severity: +d.severity, likelihood: +d.likelihood,
      description: d.description, root_cause: d.root_cause || null
    };
    const inc = await run(sb.from("incidents").insert(row).select("id").single());
    if (d.ac_desc) await run(sb.from("actions").insert({site_id: d.site_id, description: d.ac_desc, owner: d.ac_owner || null, due_date: d.ac_due || addDays(14), priority: d.ac_priority || "Medium", source_incident_id: inc.id}));
    audit("create", "incidents", inc.id);
    toast("✅ Report saved");
    location.hash = "#incidents";
  },
  fMan: async (f) => {
    const d = fdata(f);
    await run(sb.from("manhours").upsert({site_id: d.site_id, period: d.month + "-01", hours: +d.hours}, {onConflict: "site_id,period"}));
    audit("upsert", "manhours", d.site_id);
    toast("✅ Manhours saved");
    location.hash = "#dashboard";
  },
  fAct: async (f) => {
    const d = fdata(f);
    await run(sb.from("actions").insert({site_id: d.site_id, description: d.description, owner: d.owner || null, due_date: d.due_date, priority: d.priority}));
    toast("✅ Action saved");
    location.hash = "#actions";
  },
  fIns: async (f) => {
    const tpl = S.tpl;
    const site_id = f.elements["site_id"].value;
    const planId = f.elements["plan"].value || null;
    const answers = {};
    const missing = [];
    let pass = 0, fail = 0;
    tpl.items.forEach(it => {
      const row = f.querySelector(`[data-item="${CSS.escape(it.id)}"]`);
      const s = row.dataset.s;
      const note = row.querySelector(".note").value.trim();
      if (!s) { missing.push(it); return; }
      answers[it.id] = {status: s, note};
      if (s === "pass") pass++;
      if (s === "fail") fail++;
    });
    if (missing.length) return toast(`Answer every check (${missing.length} left)`);
    if (tpl.items.some(it => answers[it.id].status === "fail" && !answers[it.id].note)) return toast("Write a note for every Fail");
    const score = pass + fail ? Math.round(pass * 100 / (pass + fail)) : 100;
    const ins = await run(sb.from("inspections").insert({site_id, template_id: tpl.id, answers, score, fails: fail, plan_id: planId}).select("id").single());
    const acts = tpl.items.filter(it => answers[it.id].status === "fail").map(it => ({
      site_id, description: `[${tpl.name}] ${it.text} — ${answers[it.id].note}`,
      due_date: addDays(it.critical ? 3 : 7), priority: it.critical ? "High" : "Medium", source_inspection_id: ins.id
    }));
    if (acts.length) await run(sb.from("actions").insert(acts));
    if (planId) await run(sb.from("records").update({status: "Completed"}).eq("id", planId));
    audit("create", "inspections", ins.id);
    toast(`✅ Saved · score ${score}% · ${acts.length} action(s) created`);
    location.hash = "#inspections";
  },
  fDoc: async (f) => {
    const d = fdata(f);
    const file = f.elements.file.files[0];
    if (!file) throw new Error("Choose a file first");
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const up = await sb.storage.from(CONFIG.bucket).upload(path, file, {upsert: false, contentType: file.type || "application/octet-stream"});
    if (up.error) throw up.error;
    try {
      await run(sb.from("documents").insert({title: d.title, doc_no: d.doc_no || null, version: d.version || "1.0", category: d.category, status: d.status, site_id: d.site_id || null, file_name: file.name, storage_path: path, review_due: d.review_due || null, restricted: !!d.restricted}));
    } catch (e) {
      await sb.storage.from(CONFIG.bucket).remove([path]);
      throw e;
    }
    audit("create", "documents", path);
    toast("✅ Uploaded");
    location.hash = "#docs";
  },
  fAcc: async (f) => {
    const d = fdata(f);
    await run(sb.from("access_requests").insert({site_id: d.site_id, reason: d.reason}));
    toast("📨 Request sent to your manager");
    location.hash = "#access";
  },
  fSite: async (f) => {
    const d = fdata(f);
    await run(sb.from("sites").insert({name: d.name, location: d.location || null}));
    await loadSites();
    toast("✅ Area added");
    buildNav();
    route();
  },
  fRange: async (f) => {
    S.range = {from: f.elements.fromD.value, to: f.elements.toD.value};
    route();
  }
};
document.addEventListener("submit", async (e) => {
  const H = FORMS[e.target.id];
  if (!H) return;
  e.preventDefault();
  const btn = e.target.querySelector("button");
  if (btn) btn.disabled = true;
  try { await H(e.target); }
  catch (x) { err(x); }
  finally { if (btn) btn.disabled = false; }
});

/* ===================== AREA PICKER ===================== */
document.addEventListener("change", (e) => {
  if (e.target.id === "siteSel") { S.site = e.target.value; route(); }
});
