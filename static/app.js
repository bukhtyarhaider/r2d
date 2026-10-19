"use strict";
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PROPERTY = "MOTOR CARRIER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)";
const ENTERPRISE = "ENTERPRISE " + PROPERTY;
const HHG = "MOTOR CARRIER OF HOUSEHOLD GOODS";
const ENTERPRISE_HHG = "ENTERPRISE " + HHG;
let files = [], result = null, jobId = null, token = "", busy = false, view = "relevant", page = 0, polling = 0, cancelRequested = false;
let editing = false, pendingDelete = null;
let selectedDots = new Set(), selectedDocuments = new Set(), undoId = null;
const pageSize = 25;

function feedback(message, error = false) {
  $("#feedback").textContent = message;
  $("#feedback").classList.toggle("error", error);
}
function setBusy(value) {
  busy = value;
  $("#extract").disabled = busy || editing || !files.length;
  $("#extract").textContent = busy ? "Extracting…" : "Extract prospects ↗";
  $("#cancel").hidden = !busy;
  $("#cancel").disabled = false;
  $("#files").disabled = busy || editing;
  $("#progress-area").hidden = !busy;
  $("#clear").disabled = busy || editing;
  $("#open-trash").disabled = busy || editing;
  if (result) render();
  renderFiles();
}
function renderFiles() {
  $("#file-list").innerHTML = files.map((file, index) => `<li><span aria-hidden="true">▤</span><span class="filename">${esc(file.name)}</span><small>${(file.size / 1024 / 1024).toFixed(1)} MB</small><button type="button" data-remove="${index}" aria-label="Remove ${esc(file.name)}" ${busy || editing ? "disabled" : ""}>×</button></li>`).join("");
}
function addFiles(incoming) {
  if (busy || editing) return;
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
  if (!button || busy || editing) return;
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
      // Read the current library, including imports completed in another tab.
      result = (await request("/api/history")).result;
      if (generation !== polling) return;
      jobId = id;
      files = []; remember(null);
      setBusy(false);
      $("#results").hidden = false;
      initializeFilters(); render();
      const imported = status.imported;
      feedback(`Saved: ${imported.added} new ${imported.added === 1 ? "register" : "registers"}; ${imported.skipped} already in history. ${result.summary.unique.toLocaleString()} unique DOTs in your saved history.`);
    } else {
      setBusy(false); remember(null);
      feedback(status.message, status.status === "error");
    }
  } catch (error) {
    if (generation !== polling) return;
    if (error.status === 404) {
      remember(null); jobId = null; setBusy(false);
      await loadHistory(); feedback(error.message, true); return;
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
  if (busy || editing || !files.length) return;
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
  if (busy || editing) return;
  setBusy(true);
  $("#progress-text").textContent = "Reloading saved history…";
  try {
    if (jobId) await request(`/api/jobs/${jobId}/forget`, { method:"POST" });
    files = []; jobId = null; remember(null); ++polling;
    selectedDots.clear(); selectedDocuments.clear();
    $("#movers").checked = true;
    await loadHistory();
    feedback("Selection and filters cleared. Your saved history is still here.");
  } catch (error) { feedback(`Could not reset the selection: ${error.message}`, true); }
  finally { setBusy(false); }
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
  const availableDots = new Set(result.leads.map(lead => lead.dot));
  const availableDocuments = new Set(result.documents.map(doc => doc.id));
  selectedDots = new Set([...selectedDots].filter(dot => availableDots.has(dot)));
  selectedDocuments = new Set([...selectedDocuments].filter(id => availableDocuments.has(id)));
  page = Math.min(page, Math.max(0, Math.ceil(leads.length / pageSize) - 1));
  const pageRows = leads.slice(page * pageSize, (page + 1) * pageSize);
  $("#visible-count").textContent = `${leads.length.toLocaleString()} shown`;
  $("#export-scope").textContent = `CSV & DOT exports: ${leads.length} ${view === "all" ? "total" : view} results matching filters`;
  $("#export-csv").disabled = busy || editing || !leads.length; $("#export-dots").disabled = busy || editing || !leads.length; $("#export-audit").disabled = busy || editing;
  $("#selection-count").textContent = selectedDots.size ? `${selectedDots.size.toLocaleString()} ${selectedDots.size === 1 ? "record" : "records"} selected` : "No records selected";
  $("#selection-hint").textContent = selectedDots.size ? "Only selected DOTs will be moved to Trash." : "Select individual records or use the checkbox to select this page.";
  $("#select-matching").textContent = `Select all ${leads.length.toLocaleString()} matching`;
  $("#select-matching").disabled = busy || editing || !leads.length || leads.every(lead => selectedDots.has(lead.dot));
  $("#clear-selected").hidden = !selectedDots.size;
  $("#clear-selected").disabled = busy || editing;
  $("#delete-selected").disabled = busy || editing || !selectedDots.size;
  $("#delete-selected").textContent = selectedDots.size ? `Delete selected (${selectedDots.size.toLocaleString()})` : "Delete selected";
  $("#select-page").checked = !!pageRows.length && pageRows.every(lead => selectedDots.has(lead.dot));
  $("#select-page").indeterminate = pageRows.some(lead => selectedDots.has(lead.dot)) && !$("#select-page").checked;
  $("#select-page").disabled = busy || editing || !pageRows.length;
  $("#trash-count").textContent = (result.trash || []).length;
  $("#history-empty").hidden = !!result.leads.length;
  for (const selector of [".selection-bar", ".toolbar", ".filters", ".table-scroll", ".table-footer"]) $(selector).hidden = !result.leads.length;
  $("#history-empty-description").textContent = result.trash.length
    ? `Your records have been moved to Trash. ${result.documents.length} register receipts remain; you can restore deletions or select and delete those receipts below.`
    : "Add register PDFs to start building your carrier list.";
  $("#empty-open-trash").hidden = !result.trash.length;
  $("#empty-open-trash").disabled = busy || editing;
  $("#rows").innerHTML = pageRows.map(lead => `<tr class="${selectedDots.has(lead.dot) ? "selected-row" : ""}">
    <td class="select-cell"><label class="row-select-control"><input type="checkbox" data-select-dot="${esc(lead.dot)}" aria-label="Select USDOT ${esc(lead.dot)}" ${selectedDots.has(lead.dot) ? "checked" : ""} ${busy || editing ? "disabled" : ""}></label></td>
    <td><a class="dot" href="https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${encodeURIComponent(lead.dot)}" target="_blank" rel="noreferrer">${esc(lead.dot)} ↗</a><span class="company">${esc(lead.name)}</span><span class="cell-note">${esc(lead.address)}</span><button class="row-delete danger" data-delete-dot="${esc(lead.dot)}" aria-label="Delete USDOT ${esc(lead.dot)}" ${busy || editing ? "disabled" : ""}>Delete record</button></td>
    <td><span class="badge ${lead.decision}">${esc(lead.decision === "relevant" ? "Dispatch prospect" : lead.decision === "review" ? "Manual review" : "Outside target")}</span><div class="category-name">${lead.categories.map(esc).join('<br>')}</div></td>
    <td>${lead.phone ? esc(lead.phone) : '<span class="cell-note">Phone unavailable</span>'}<span class="cell-note">${esc(lead.officer || "Officer unavailable")}</span><span class="cell-note">Filed ${esc(lead.filing_date)}</span></td>
    <td>${esc(lead.reason)}${lead.flags.map(flag => `<p class="warning">${esc(flag)}</p>`).join("")}</td>
    <td><button class="evidence-button" data-dot="${esc(lead.dot)}">${lead.occurrences} ${lead.occurrences === 1 ? "record" : "records"}</button><span class="cell-note">View pages</span></td>
  </tr>`).join("") || `<tr><td colspan="6" class="empty">${result.leads.length ? "No records match these filters. Try another group or clear your search." : "No active records. Review Trash to restore deleted items, or add new PDFs."}</td></tr>`;
  $("#page-info").textContent = leads.length ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, leads.length)} of ${leads.length}` : "0 results";
  $("#prev").disabled = page === 0; $("#next").disabled = (page + 1) * pageSize >= leads.length;
  const emptyDocuments = result.documents.filter(doc => !doc.record_count).length;
  $("#register-summary").textContent = `${result.documents.length} saved ${result.documents.length === 1 ? "register" : "registers"}${emptyDocuments ? ` · ${emptyDocuments} with no active records` : ""}`;
  $("#delete-documents").textContent = selectedDocuments.size ? `Delete ${selectedDocuments.size} selected ${selectedDocuments.size === 1 ? "register" : "registers"}` : "Delete selected registers";
  $("#delete-documents").disabled = busy || editing || !selectedDocuments.size;
  $("#document-selection-count").textContent = selectedDocuments.size ? `${selectedDocuments.size} selected` : "";
  $("#select-all-documents").checked = !!result.documents.length && selectedDocuments.size === result.documents.length;
  $("#select-all-documents").indeterminate = !!selectedDocuments.size && !$("#select-all-documents").checked;
  $("#select-all-documents").disabled = busy || editing || !result.documents.length;
  $("#documents").innerHTML = result.documents.map(doc => `<div class="doc ${selectedDocuments.has(doc.id) ? "selected-document" : ""}"><label class="document-select"><input type="checkbox" data-select-document="${esc(doc.id)}" aria-label="Select register ${esc(doc.filename)}" ${selectedDocuments.has(doc.id) ? "checked" : ""} ${busy || editing ? "disabled" : ""}><span><strong>${esc(doc.filename)}</strong><span class="document-meta">${doc.record_count ? `${doc.record_count.toLocaleString()} active source ${doc.record_count === 1 ? "record" : "records"}` : "No active records"} · ${doc.pages} pages · ${esc(doc.register_date || "date unavailable")}</span></span></label><button class="quiet danger" data-delete-document="${esc(doc.id)}" aria-label="Delete register ${esc(doc.filename)}" ${busy || editing ? "disabled" : ""}>Delete register</button></div>${doc.warnings.map(w => `<p class="warning">${esc(w)}</p>`).join("")}`).join("") || '<p class="small">No saved registers. Restore deleted items from Trash or add new PDFs.</p>';
  $("#undo-notice").hidden = !undoId || !result.trash.some(item => item.id === undoId);
  $("#undo-delete").disabled = busy || editing;
  renderTrash();
}
document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => { view = button.dataset.view; selectedDots.clear(); page = 0; render(); }));
for (const id of ["search", "category", "country", "movers"]) $("#" + id).addEventListener(id === "search" ? "input" : "change", () => { selectedDots.clear(); page = 0; render(); });
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

function renderTrash() {
  if (!result) return;
  const query = $("#trash-search").value.trim().toLowerCase();
  const items = result.trash.filter(item => item.label.toLowerCase().includes(query));
  $("#trash-list").innerHTML = items.map(item => {
    const type = item.kind === "dots" ? `${item.count.toLocaleString()} DOT ${item.count === 1 ? "record" : "records"}` : `${item.count} ${item.count === 1 ? "register" : "registers"}`;
    return `<article class="trash-item"><div><span class="trash-type">${esc(type)}</span><strong>${esc(item.label)}</strong><span class="small">Deleted ${esc(new Date(item.deleted_at).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}))}</span></div><button class="secondary" data-restore="${esc(item.id)}" aria-label="Restore ${esc(item.label)}" ${busy || editing ? "disabled" : ""}>Restore</button></article>`;
  }).join("") || `<div class="trash-empty"><h3>${query ? "No matching deletions" : "Trash is empty"}</h3><p class="small">${query ? "Try a different company, DOT, or filename." : "Deleted records and registers will appear here, ready to restore."}</p></div>`;
}
$("#trash-search").addEventListener("input", renderTrash);

$("#rows").addEventListener("change", event => {
  const checkbox = event.target.closest("[data-select-dot]");
  if (!checkbox || busy || editing) return;
  const dot = checkbox.dataset.selectDot;
  if (checkbox.checked) selectedDots.add(dot); else selectedDots.delete(dot);
  render();
  document.querySelector(`[data-select-dot="${dot}"]`)?.focus({preventScroll:true});
});
$("#select-page").addEventListener("change", event => {
  if (busy || editing) return;
  visibleRows().slice(page * pageSize, (page + 1) * pageSize).forEach(lead => {
    if (event.target.checked) selectedDots.add(lead.dot); else selectedDots.delete(lead.dot);
  });
  render();
});
$("#select-matching").addEventListener("click", () => {
  if (busy || editing) return;
  selectedDots = new Set(visibleRows().map(lead => lead.dot)); render();
  $("#delete-selected").focus({preventScroll:true});
});
$("#clear-selected").addEventListener("click", () => {
  if (busy || editing) return;
  selectedDots.clear(); render(); $("#select-page").focus({preventScroll:true});
});
$("#documents").addEventListener("change", event => {
  const checkbox = event.target.closest("[data-select-document]");
  if (!checkbox || busy || editing) return;
  const id = checkbox.dataset.selectDocument;
  if (checkbox.checked) selectedDocuments.add(id); else selectedDocuments.delete(id);
  render(); document.querySelector(`[data-select-document="${id}"]`)?.focus({preventScroll:true});
});
$("#select-all-documents").addEventListener("change", event => {
  if (busy || editing) return;
  selectedDocuments = new Set(event.target.checked ? result.documents.map(doc => doc.id) : []);
  render();
});

function askDelete(kind, targets) {
  if (busy || editing || !targets.length) return;
  const targetSet = new Set(targets);
  const entries = kind === "dots" ? result.leads.filter(lead => targetSet.has(lead.dot)) : result.documents.filter(doc => targetSet.has(doc.id));
  const count = entries.length, noun = kind === "dots" ? (count === 1 ? "record" : "records") : (count === 1 ? "register" : "registers");
  pendingDelete = {kind, targets, count, noun};
  $("#delete-title").textContent = `Move ${count.toLocaleString()} ${noun} to Trash?`;
  $("#delete-description").textContent = kind === "dots"
    ? "These DOT records will leave your saved list and future exports, including all their source occurrences."
    : "Only these registers and their evidence will be removed. DOTs supported by another active register will remain.";
  $("#delete-preview").innerHTML = entries.slice(0, 5).map(item => `<div><strong>${esc(kind === "dots" ? item.name : item.filename)}</strong><span>${kind === "dots" ? `USDOT ${esc(item.dot)} · ${item.occurrences} source ${item.occurrences === 1 ? "record" : "records"}` : `${item.record_count.toLocaleString()} active source ${item.record_count === 1 ? "record" : "records"}`}</span></div>`).join("") + (count > 5 ? `<p>and ${(count - 5).toLocaleString()} more selected ${noun}</p>` : "");
  $("#confirm-delete").textContent = `Move ${count.toLocaleString()} to Trash`;
  $("#delete-error").textContent = "";
  $("#delete-dialog").showModal(); $("#cancel-delete").focus();
}
$("#rows").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-dot]");
  if (button) askDelete("dots", [button.dataset.deleteDot]);
});
$("#delete-selected").addEventListener("click", () => askDelete("dots", [...selectedDots]));
$("#delete-documents").addEventListener("click", () => askDelete("documents", [...selectedDocuments]));
$("#documents").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-document]");
  if (button) askDelete("documents", [button.dataset.deleteDocument]);
});
$("#cancel-delete").addEventListener("click", () => $("#delete-dialog").close());
function openTrash() {
  $("#trash-feedback").textContent = ""; $("#trash-search").value = ""; renderTrash();
  $("#trash-dialog").showModal();
}
$("#open-trash").addEventListener("click", openTrash);
$("#empty-open-trash").addEventListener("click", openTrash);
$("#close-trash").addEventListener("click", () => $("#trash-dialog").close());
for (const id of ["delete-dialog", "trash-dialog"]) $("#" + id).addEventListener("cancel", event => { if (editing) event.preventDefault(); });

async function changeHistory(path, data) {
  editing = true; setBusy(busy);
  $("#confirm-delete").disabled = true; $("#cancel-delete").disabled = true; $("#close-trash").disabled = true;
  try {
    const updated = await request(path, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)});
    const filters = {search:$("#search").value, category:$("#category").value, country:$("#country").value, view, page};
    result = updated.result; initializeFilters();
    $("#search").value = filters.search; $("#category").value = filters.category; $("#country").value = filters.country;
    view = filters.view; page = filters.page;
    $("#results").hidden = !result.documents.length && !result.trash.length;
    render();
  } finally {
    editing = false; setBusy(busy);
    $("#confirm-delete").disabled = false; $("#cancel-delete").disabled = false; $("#close-trash").disabled = false;
  }
}
$("#confirm-delete").addEventListener("click", async () => {
  if (busy || editing || !pendingDelete) return;
  const action = pendingDelete;
  $("#delete-error").textContent = "Moving your selection to Trash…";
  $("#confirm-delete").textContent = "Moving…";
  try {
    await changeHistory("/api/history/delete", {kind:action.kind, targets:action.targets});
    undoId = result.trash[0].id;
    $("#undo-delete").hidden = false;
    $("#undo-message").textContent = `Moved ${action.count.toLocaleString()} ${action.noun} to Trash.`;
    $("#delete-dialog").close(); pendingDelete = null; render();
    const focusTarget = action.kind === "documents" ? (result.documents.length ? "#select-all-documents" : "#open-trash") : result.leads.length ? "#search" : "#empty-open-trash";
    $(focusTarget).focus({preventScroll:true});
  } catch (error) {
    $("#delete-error").textContent = error.message;
  } finally { $("#confirm-delete").textContent = `Move ${action.count.toLocaleString()} to Trash`; }
});
async function restoreDeletion(id, source) {
  if (busy || editing) return;
  const target = source === "trash" ? $("#trash-feedback") : $("#undo-message");
  target.textContent = "Restoring saved items…";
  try {
    await changeHistory("/api/history/restore", {id});
    if (source === "trash") {
      $("#trash-feedback").textContent = "Restored this deletion. Current filters and other deletions still apply.";
      document.querySelector("#trash-list [data-restore]")?.focus({preventScroll:true});
      if (!document.querySelector("#trash-list [data-restore]")) $("#close-trash").focus();
    } else {
      undoId = null; $("#undo-notice").hidden = false;
      $("#undo-message").textContent = "Deletion undone. Your saved items have been restored.";
      $("#undo-delete").hidden = true; $("#dismiss-undo").focus({preventScroll:true});
    }
  } catch (error) { target.textContent = `${error.message} You can retry or restore from Trash.`; }
}
$("#trash-list").addEventListener("click", event => {
  const button = event.target.closest("[data-restore]");
  if (button) restoreDeletion(button.dataset.restore, "trash");
});
$("#undo-delete").addEventListener("click", () => { if (undoId) restoreDeletion(undoId, "undo"); });
$("#dismiss-undo").addEventListener("click", () => { undoId = null; $("#undo-notice").hidden = true; });

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

async function loadHistory() {
  const history = await request("/api/history");
  result = history.result;
  $("#results").hidden = !result.documents.length && !(result.trash || []).length;
  initializeFilters(); render();
  return history;
}

async function init() {
  setBusy(true);
  $("#progress-text").textContent = "Loading your saved local history…";
  try {
    token = (await request("/api/session")).token;
    const history = await loadHistory();
    if (history.active_job) {
      jobId = history.active_job; remember(jobId);
      $("#progress-text").textContent = "Reconnecting to the current extraction…";
      poll(jobId, ++polling);
    } else {
      remember(null); setBusy(false);
      if (result.documents.length) feedback(`Loaded saved history: ${result.summary.unique.toLocaleString()} unique DOTs from ${result.documents.length} registers.`);
    }
  } catch (error) {
    setBusy(false);
    feedback(error.message || "The local server is unavailable. Start the tool, then refresh this page.", true);
  }
}
init();
