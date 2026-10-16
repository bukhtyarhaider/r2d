"use strict";
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PROPERTY = "MOTOR CARRIER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)";
const ENTERPRISE = "ENTERPRISE " + PROPERTY;
const HHG = "MOTOR CARRIER OF HOUSEHOLD GOODS";
const ENTERPRISE_HHG = "ENTERPRISE " + HHG;
let files = [], result = null, jobId = null, token = "", busy = false, view = "relevant", page = 0, polling = 0, cancelRequested = false;
const pageSize = 25;

function feedback(message, error = false) {
  $("#feedback").textContent = message;
  $("#feedback").classList.toggle("error", error);
}
function setBusy(value) {
  busy = value;
  $("#extract").disabled = busy || !files.length;
  $("#extract").textContent = busy ? "Extracting…" : "Extract prospects ↗";
  $("#cancel").hidden = !busy;
  $("#cancel").disabled = false;
  $("#files").disabled = busy;
  $("#progress-area").hidden = !busy;
  $("#clear").disabled = busy;
  if (result) render();
  renderFiles();
}
function renderFiles() {
  $("#file-list").innerHTML = files.map((file, index) => `<li><span aria-hidden="true">▤</span><span class="filename">${esc(file.name)}</span><small>${(file.size / 1024 / 1024).toFixed(1)} MB</small><button type="button" data-remove="${index}" aria-label="Remove ${esc(file.name)}" ${busy ? "disabled" : ""}>×</button></li>`).join("");
}
function addFiles(incoming) {
  if (busy) return;
  const next = [...files];
  for (const file of incoming) {
    if (!file.name.toLowerCase().endsWith(".pdf")) return feedback("Choose PDF registers only. Your previous selection is still here.", true);
    if (file.size > 25 * 1024 * 1024) return feedback(`${file.name} is larger than 25 MB.`, true);
    if (file.size === 0) return feedback(`${file.name} is empty.`, true);
    if (!next.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) next.push(file);
  }
  if (next.length > 20 || next.reduce((sum, f) => sum + f.size, 0) > 99 * 1024 * 1024) return feedback("Choose up to 20 PDFs totaling under 99 MB (leaving room for upload headers).", true);
  files = next;
  $("#extract").disabled = !files.length;
  renderFiles();
  feedback("");
}
$("#files").addEventListener("change", event => { addFiles(event.target.files); event.target.value = ""; });
$("#file-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button || busy) return;
  files.splice(Number(button.dataset.remove), 1); renderFiles(); $("#extract").disabled = !files.length;
});
const drop = $("#dropzone");
drop.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!busy) $("#files").click(); } });
for (const name of ["dragenter", "dragover"]) drop.addEventListener(name, event => { event.preventDefault(); if (!busy) drop.classList.add("drag"); });
for (const name of ["dragleave", "drop"]) drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove("drag"); });
drop.addEventListener("drop", event => addFiles(event.dataTransfer.files));
// Keep dropping outside the picker from navigating away from unsaved results.
document.addEventListener("dragover", event => event.preventDefault());
document.addEventListener("drop", event => event.preventDefault());

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { "X-Session-Token": token, ...options.headers } });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "The local tool could not complete this request.");
    error.status = response.status;
    throw error;
  }
  return data;
}
function remember(id) {
  try { if (id) sessionStorage.setItem("dispatch-job", id); else sessionStorage.removeItem("dispatch-job"); } catch (_) { /* Storage is optional. */ }
}
async function poll(id, generation, failures = 0) {
  if (generation !== polling) return;
  try {
    const status = await request(`/api/jobs/${id}`);
    if (generation !== polling) return;
    if (status.status === "running") {
      $("#progress-text").textContent = `${status.message} · file ${status.file_index || 1} of ${status.file_count}`;
      if (status.pages) $("#progress").value = Math.min(99, ((status.file_index - 1 + (status.page - 1) / status.pages) / status.file_count) * 100);
      setTimeout(() => poll(id, generation), 500);
    } else if (status.status === "complete") {
      result = status.result;
      jobId = id;
      setBusy(false);
      $("#results").hidden = false;
      initializeFilters(); render();
      feedback(`Finished: ${result.summary.unique.toLocaleString()} unique DOTs across ${result.summary.pages} pages.`);
    } else {
      setBusy(false); remember(null);
      feedback(status.message, status.status === "error");
    }
  } catch (error) {
    if (generation !== polling) return;
    if (error.status === 404) {
      remember(null); jobId = null; setBusy(false); feedback(error.message, true); return;
    }
    if (failures < 4) {
      $("#progress-text").textContent = "Reconnecting to the local tool…";
      setTimeout(() => poll(id, generation, failures + 1), 1500);
    } else {
      setBusy(false);
      feedback(`${error.message} If the server is still running, refresh to reconnect to this extraction.`, true);
    }
  }
}
$("#extract").addEventListener("click", async () => {
  if (busy || !files.length) return;
  const previousJob = jobId;
  jobId = null; cancelRequested = false;
  setBusy(true); feedback("");
  $("#progress").removeAttribute("value");
  $("#progress-text").textContent = "Preparing your PDFs…";
  try {
    if (!token) token = (await request("/api/session")).token;
    const body = new FormData();
    files.forEach(file => body.append("files", file, file.name));
    const job = await request("/api/jobs", { method: "POST", body });
    jobId = job.id; remember(jobId);
    if (cancelRequested) await request(`/api/jobs/${jobId}/cancel`, { method:"POST" });
    if (previousJob && previousJob !== jobId) request(`/api/jobs/${previousJob}/forget`, {method:"POST"}).catch(() => {});
    poll(jobId, ++polling);
  } catch (error) { if (!jobId) jobId = previousJob; setBusy(false); feedback(error.message, true); }
});
$("#cancel").addEventListener("click", async () => {
  $("#cancel").disabled = true;
  cancelRequested = true;
  if (!jobId) { $("#progress-text").textContent = "Cancellation requested. Finishing the local upload…"; return; }
  $("#progress-text").textContent = "Cancelling after the current page…";
  try { await request(`/api/jobs/${jobId}/cancel`, { method:"POST" }); }
  catch (error) { $("#cancel").disabled = false; feedback(error.message, true); }
});
$("#clear").addEventListener("click", async () => {
  if (busy) return;
  try {
    if (jobId) await request(`/api/jobs/${jobId}/forget`, { method:"POST" });
    result = null; files = []; jobId = null; remember(null); ++polling;
    $("#results").hidden = true; $("#extract").disabled = true;
    renderFiles(); feedback("Session cleared from this page and the local server.");
  } catch (error) { feedback(`Could not clear server data: ${error.message}`, true); }
});

function effective(lead) {
  const isMoverOnly = !lead.categories.includes(PROPERTY) && !lead.categories.includes(ENTERPRISE) && (lead.categories.includes(HHG) || lead.categories.includes(ENTERPRISE_HHG));
  if (isMoverOnly) {
    const isEnterprise = lead.categories.includes(ENTERPRISE_HHG) && !lead.categories.includes(HHG);
    return $("#movers").checked
      ? {...lead, decision:"relevant", reason: isEnterprise
          ? "Enterprise household-goods motor carrier; movers enabled. Confirm international operating scope and service fit."
          : "Household-goods motor carrier; movers enabled. Confirm your dispatch service fit."}
      : {...lead, decision:"excluded", reason:"Household-goods mover; excluded because the movers option is off."};
  }
  return lead;
}
function initializeFilters() {
  const categories = [...new Set(result.leads.flatMap(lead => lead.categories))].sort();
  $("#category").innerHTML = '<option value="">All categories</option>' + categories.map(category => `<option value="${esc(category)}">${esc(category)}</option>`).join("");
  $("#search").value = ""; $("#country").value = "";
  page = 0; view = "relevant";
}
function visibleRows() {
  if (!result) return [];
  const query = $("#search").value.toLowerCase().trim(), category = $("#category").value, country = $("#country").value;
  return result.leads.map(effective).filter(lead => (view === "all" || lead.decision === view)
    && (!category || lead.categories.includes(category))
    && (!country || lead.address.endsWith(` ${country}`))
    && (!query || [lead.dot, lead.name, lead.phone, lead.officer, lead.address, ...lead.categories].some(value => value.toLowerCase().includes(query))));
}
function render() {
  if (!result) return;
  const counts = { relevant:0, review:0, excluded:0 };
  result.leads.forEach(lead => counts[effective(lead).decision]++);
  ["relevant", "review", "excluded"].forEach(key => $("#count-" + key).textContent = counts[key]);
  const s = result.summary;
  $("#stats").innerHTML = [[counts.relevant,"Relevant prospects"], [s.unique,"Unique DOT numbers"], [s.duplicates,"Repeated occurrences merged"], [s.pages,"Source pages processed"]].map(([n,label]) => `<div class="stat"><strong>${n.toLocaleString()}</strong><span>${label}</span></div>`).join("");
  document.querySelectorAll("[data-view]").forEach(button => { button.classList.toggle("active", button.dataset.view === view); button.setAttribute("aria-pressed", button.dataset.view === view); });
  const leads = visibleRows();
  page = Math.min(page, Math.max(0, Math.ceil(leads.length / pageSize) - 1));
  $("#visible-count").textContent = `${leads.length.toLocaleString()} shown`;
  $("#export-scope").textContent = `CSV & DOT exports: ${leads.length} ${view === "all" ? "total" : view} results matching filters`;
  $("#export-csv").disabled = busy || !leads.length; $("#export-dots").disabled = busy || !leads.length; $("#export-audit").disabled = busy;
  $("#rows").innerHTML = leads.slice(page * pageSize, (page + 1) * pageSize).map(lead => `<tr>
    <td><a class="dot" href="https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${encodeURIComponent(lead.dot)}" target="_blank" rel="noreferrer">${esc(lead.dot)} ↗</a><span class="company">${esc(lead.name)}</span><span class="cell-note">${esc(lead.address)}</span></td>
    <td><span class="badge ${lead.decision}">${esc(lead.decision === "relevant" ? "Dispatch prospect" : lead.decision === "review" ? "Manual review" : "Outside target")}</span><div class="category-name">${lead.categories.map(esc).join('<br>')}</div></td>
    <td>${lead.phone ? esc(lead.phone) : '<span class="cell-note">Phone unavailable</span>'}<span class="cell-note">${esc(lead.officer || "Officer unavailable")}</span><span class="cell-note">Filed ${esc(lead.filing_date)}</span></td>
    <td>${esc(lead.reason)}${lead.flags.map(flag => `<p class="warning">${esc(flag)}</p>`).join("")}</td>
    <td><button class="evidence-button" data-dot="${esc(lead.dot)}">${lead.occurrences} ${lead.occurrences === 1 ? "record" : "records"}</button><span class="cell-note">View pages</span></td>
  </tr>`).join("") || '<tr><td colspan="5" class="empty">No results match these filters. Try another group or clear your search.</td></tr>';
  $("#page-info").textContent = leads.length ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, leads.length)} of ${leads.length}` : "0 results";
  $("#prev").disabled = page === 0; $("#next").disabled = (page + 1) * pageSize >= leads.length;
  $("#documents").innerHTML = result.documents.map(doc => `<div class="doc"><strong>${esc(doc.filename)}</strong><span>${doc.pages} pages · register ${esc(doc.register_date || "date unavailable")}</span></div>${doc.warnings.map(w => `<p class="warning">${esc(w)}</p>`).join("")}`).join("");
}
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { view = button.dataset.view; page = 0; render(); }));
for (const id of ["search", "category", "country", "movers"]) $("#" + id).addEventListener(id === "search" ? "input" : "change", () => { page = 0; render(); });
$("#prev").addEventListener("click", () => { page--; render(); });
$("#next").addEventListener("click", () => { page++; render(); });
$("#rows").addEventListener("click", event => {
  const button = event.target.closest("[data-dot]");
  if (!button) return;
  const lead = effective(result.leads.find(row => row.dot === button.dataset.dot));
  $("#evidence-title").textContent = `USDOT ${lead.dot} · source records`;
  $("#evidence-content").innerHTML = lead.evidence.map(record => `<article class="evidence-record"><h3>${esc(record.source)} · page ${record.pages.join(", ")}</h3><dl>${[["Business",record.name],["Category",record.category],["Filing date",record.filing_date],["Register date",record.register_date || "Unavailable"],["Telephone",record.phone || "Unavailable"],["Officer",record.officer || "Unavailable"],["Address",record.address]].map(([label,value]) => `<dt>${label}</dt><dd>${esc(value)}</dd>`).join("")}</dl><p class="small">${esc(record.notice)}</p></article>`).join("");
  $("#evidence").showModal();
});
$("#close-evidence").addEventListener("click", () => $("#evidence").close());

function download(name, data, mime) {
  const url = URL.createObjectURL(new Blob([data], {type:mime}));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const csvFields = ["dot","name","categories","phone","officer","address","filing_date","register_date","decision","reason","flags","notice","equipment","occurrences","sources"];
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text.trimStart()) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
$("#export-csv").addEventListener("click", () => {
  const rows = visibleRows().map(lead => ({...lead, categories:lead.categories.join(" | "), flags:lead.flags.join(" | "), sources:lead.evidence.map(record => `${record.source} p.${record.pages.join(",")}: ${record.category} (${record.filing_date})`).join(" | ")}));
  const csv = [csvFields.map(csvCell).join(","), ...rows.map(lead => csvFields.map(field => csvCell(lead[field])).join(","))].join("\r\n") + "\r\n";
  download(`dispatch-${view}.csv`, "\ufeff" + csv, "text/csv;charset=utf-8");
});
$("#export-dots").addEventListener("click", () => download(`dot-numbers-${view}.txt`, visibleRows().map(lead => lead.dot).join("\n") + "\n", "text/plain;charset=utf-8"));
$("#export-audit").addEventListener("click", () => {
  const leads = result.leads.map(effective), counts = {relevant:0, review:0, excluded:0};
  leads.forEach(lead => counts[lead.decision]++);
  download("extraction-audit.json", JSON.stringify({...result, summary:{...result.summary,...counts}, applied_options:{include_movers:$("#movers").checked}, leads}, null, 2), "application/json");
});

async function init() {
  try {
    token = (await request("/api/session")).token;
    let saved; try { saved = sessionStorage.getItem("dispatch-job"); } catch (_) {}
    if (saved) { jobId = saved; setBusy(true); $("#progress-text").textContent = "Restoring your local extraction…"; poll(saved, ++polling); }
  } catch (_) { feedback("The local server is unavailable. Start the tool, then refresh this page.", true); }
}
init();
