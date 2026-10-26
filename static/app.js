"use strict";

/**
 * Dispatch Register — Frontend Client Architecture
 * Modular concerns: State, Api, Navigation, Prospects, Upload, Library, Trash, Export, Theme
 * Developer: Bukhtyar Haider
 */

// ============================================================================
// 1. Utilities & Constants
// ============================================================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

const PROPERTY = "MOTOR CARRIER OF PROPERTY (EXCEPT HOUSEHOLD GOODS)";
const ENTERPRISE = "ENTERPRISE " + PROPERTY;
const MEXICO_PROPERTY = "MEXICO DOMICILED " + PROPERTY;
const HHG = "MOTOR CARRIER OF HOUSEHOLD GOODS";
const ENTERPRISE_HHG = "ENTERPRISE " + HHG;
const PAGE_SIZE = 25;

// ============================================================================
// 2. Application State Store
// ============================================================================

const state = {
  files: [],
  result: null,
  jobId: null,
  token: "",
  busy: false,
  busyPurpose: "extraction",
  currentTab: "prospects",
  view: "relevant", // 'relevant' | 'review' | 'excluded' | 'all'
  page: 0,
  pageSize: PAGE_SIZE,
  selectedDots: new Set(),
  selectedDocuments: new Set(),
  pendingDelete: null,
  undoId: null,
  liveRevision: null,
  polling: 0,
  cancelRequested: false,
  editing: false,
  activityChecking: false,
  historyRefreshing: false,
  ready: false,
  progressSnapshot: null,
  progressReceived: 0,
};

// ============================================================================
// 3. Theme Manager (Dark / Light Mode)
// ============================================================================

const Theme = {
  init() {
    const saved = localStorage.getItem("dispatch-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    this.apply(theme);

    const toggle = $("#theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        this.apply(next);
      });
    }
  },

  apply(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("dispatch-theme", theme);
    const icon = $("#theme-icon");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
      icon.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    }
  },
};

// ============================================================================
// 4. API & Network Client
// ============================================================================

const Api = {
  async request(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      let response = await fetch(path, {
        ...options,
        signal: controller.signal,
        headers: {
          "X-Session-Token": state.token,
          ...options.headers,
        },
      });

      // Renew session if 403 received after server restart
      if (response.status === 403 && path !== "/api/session") {
        const session = await fetch("/api/session", { signal: controller.signal });
        if (session.ok) {
          const fresh = (await session.json()).token;
          if (fresh && fresh !== state.token) {
            state.token = fresh;
            response = await fetch(path, {
              ...options,
              signal: controller.signal,
              headers: {
                "X-Session-Token": state.token,
                ...options.headers,
              },
            });
          }
        }
      }

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || "The local tool could not complete this request.");
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("The local server did not respond within 15 seconds. Refresh saved records to check the outcome.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },

  async getSession() {
    const res = await this.request("/api/session");
    state.token = res.token;
    return state.token;
  },

  async getActivity() {
    return this.request("/api/activity");
  },

  async getHistory() {
    return this.request("/api/history");
  },

  async getJob(id) {
    return this.request(`/api/jobs/${id}`);
  },

  async startJob(formData) {
    return this.request("/api/jobs", { method: "POST", body: formData });
  },

  async cancelJob(id) {
    return this.request(`/api/jobs/${id}/cancel`, { method: "POST" });
  },

  async forgetJob(id) {
    return this.request(`/api/jobs/${id}/forget`, { method: "POST" });
  },

  async deleteHistory(kind, targets) {
    return this.request("/api/history/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, targets }),
    });
  },

  async restoreHistory(id) {
    return this.request("/api/history/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  },
};

// ============================================================================
// 5. Navigation & View Controller
// ============================================================================

const Navigation = {
  init() {
    $$(".nav-tab").forEach((button) => {
      button.addEventListener("click", () => {
        this.switchTab(button.dataset.tab);
      });
    });

    const openUploadBtn = $("#empty-open-upload");
    if (openUploadBtn) {
      openUploadBtn.addEventListener("click", () => this.switchTab("upload"));
    }

    const openTrashBtn = $("#open-trash");
    if (openTrashBtn) {
      openTrashBtn.addEventListener("click", () => this.switchTab("trash"));
    }

    const libOpenTrash = $("#library-open-trash");
    if (libOpenTrash) {
      libOpenTrash.addEventListener("click", () => this.switchTab("trash"));
    }

    const emptyOpenTrash = $("#empty-open-trash");
    if (emptyOpenTrash) {
      emptyOpenTrash.addEventListener("click", () => this.switchTab("trash"));
    }
  },

  switchTab(tabId) {
    state.currentTab = tabId;
    $$(".nav-tab").forEach((btn) => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    $$(".tab-panel").forEach((panel) => {
      const active = panel.id === `tab-${tabId}`;
      panel.classList.toggle("active", active);
    });

    // Re-render corresponding views
    if (tabId === "prospects") Prospects.render();
    if (tabId === "library") Library.render();
    if (tabId === "trash") Trash.render();
    if (tabId === "upload") Upload.renderFiles();
  },

  updateBadges() {
    if (!state.result) return;
    const leads = state.result.leads.map(Prospects.effective);
    const relevantCount = leads.filter((l) => l.decision === "relevant").length;
    const registerCount = state.result.documents.length;
    const trashCount = (state.result.trash || []).length;

    const navProspects = $("#nav-count-prospects");
    if (navProspects) navProspects.textContent = relevantCount.toLocaleString();

    const navRegisters = $("#nav-count-registers");
    if (navRegisters) navRegisters.textContent = registerCount.toLocaleString();

    const navTrash = $("#nav-count-trash");
    if (navTrash) navTrash.textContent = trashCount.toLocaleString();

    const navUpload = $("#nav-count-upload");
    if (navUpload) {
      navUpload.textContent = state.files.length;
      navUpload.hidden = state.files.length === 0;
    }

    const trashBadge = $("#trash-count");
    if (trashBadge) trashBadge.textContent = trashCount.toLocaleString();
  },
};

// ============================================================================
// 6. Prospects & Table Controller
// ============================================================================

const Prospects = {
  effective(lead) {
    const isMoverOnly =
      ![PROPERTY, ENTERPRISE, MEXICO_PROPERTY].some((category) => lead.categories.includes(category)) &&
      (lead.categories.includes(HHG) || lead.categories.includes(ENTERPRISE_HHG));

    if (isMoverOnly) {
      const isEnterprise = lead.categories.includes(ENTERPRISE_HHG) && !lead.categories.includes(HHG);
      return $("#movers").checked
        ? {
            ...lead,
            decision: "relevant",
            reason: isEnterprise
              ? "Enterprise household-goods motor carrier; movers enabled. Confirm international operating scope and service fit."
              : "Household-goods motor carrier; movers enabled. Confirm your dispatch service fit.",
          }
        : {
            ...lead,
            decision: "excluded",
            reason: "Household-goods mover; excluded because the movers option is off.",
          };
    }
    return lead;
  },

  initializeFilters() {
    if (!state.result) return;
    const categories = [...new Set(state.result.leads.flatMap((lead) => lead.categories))].sort();
    $("#category").innerHTML =
      '<option value="">All categories</option>' +
      categories.map((cat) => `<option value="${esc(cat)}">${esc(cat)}</option>`).join("");
    $("#search").value = "";
    $("#country").value = "";
    state.page = 0;
    state.view = "relevant";
  },

  visibleRows() {
    if (!state.result) return [];
    const query = $("#search").value.toLowerCase().trim();
    const category = $("#category").value;
    const country = $("#country").value;

    return state.result.leads.map(this.effective).filter((lead) => {
      const matchView = state.view === "all" || lead.decision === state.view;
      const matchCategory = !category || lead.categories.includes(category);
      const matchCountry = !country || lead.address.endsWith(` ${country}`);
      const matchQuery =
        !query ||
        [lead.dot, lead.name, lead.phone, lead.officer, lead.address, ...lead.categories].some((val) =>
          String(val || "").toLowerCase().includes(query)
        );
      return matchView && matchCategory && matchCountry && matchQuery;
    });
  },

  render() {
    if (!state.result) return;

    // 1. Calculate Group Counts
    const counts = { relevant: 0, review: 0, excluded: 0 };
    state.result.leads.forEach((lead) => counts[this.effective(lead).decision]++);
    ["relevant", "review", "excluded"].forEach((key) => {
      const el = $("#count-" + key);
      if (el) el.textContent = counts[key].toLocaleString();
    });

    // 2. Summary & Library Banner
    const s = state.result.summary;
    const library = state.result.library || {
      saved_registers: state.result.documents.length,
      active_registers: state.result.documents.length,
      trashed_registers: 0,
      deleted_dots: 0,
    };

    $("#library-summary").textContent = `${library.active_registers} active PDFs of ${library.saved_registers} imported · ${library.trashed_registers} PDFs in Trash · ${library.deleted_dots.toLocaleString()} DOTs excluded by record deletions.`;

    const libTrashBtn = $("#library-open-trash");
    if (libTrashBtn) libTrashBtn.hidden = !state.result.trash.length;

    // 3. Stats Cards
    $("#stats").innerHTML = [
      [counts.relevant, "Relevant prospects", "relevant"],
      [s.unique, "Unique DOT numbers", "all"],
      [s.duplicates, "Repeated occurrences merged", ""],
      [s.pages, "Source pages processed", ""],
    ]
      .map(([n, label, filterView]) => {
        const clickable = filterView ? `style="cursor:pointer;" data-stat-view="${filterView}" title="Filter by ${label}"` : "";
        return `<div class="stat" ${clickable}>
          <strong>${Number(n || 0).toLocaleString()}</strong>
          <span>${label}</span>
        </div>`;
      })
      .join("");

    // 4. Update Filter Tabs
    $$("[data-view]").forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // 5. Leads Filtering & Pagination
    const leads = this.visibleRows();
    const availableDots = new Set(state.result.leads.map((l) => l.dot));
    state.selectedDots = new Set([...state.selectedDots].filter((dot) => availableDots.has(dot)));

    state.page = Math.min(state.page, Math.max(0, Math.ceil(leads.length / state.pageSize) - 1));
    const pageRows = leads.slice(state.page * state.pageSize, (state.page + 1) * state.pageSize);

    $("#visible-count").textContent = `${leads.length.toLocaleString()} matching`;
    $("#export-scope").textContent = `CSV & DOT exports: ${leads.length.toLocaleString()} ${state.view === "all" ? "total" : state.view} results`;

    $("#export-csv").disabled = state.busy || state.editing || !leads.length;
    $("#export-dots").disabled = state.busy || state.editing || !leads.length;
    $("#export-audit").disabled = state.busy || state.editing;

    // 6. Selection Bar Status
    $("#selection-count").textContent = state.selectedDots.size
      ? `${state.selectedDots.size.toLocaleString()} ${state.selectedDots.size === 1 ? "record" : "records"} selected`
      : "No records selected";
    $("#selection-hint").textContent = state.selectedDots.size
      ? "Only selected DOTs will be moved to Trash."
      : "Select individual records or use the header checkbox to select this page.";
    $("#select-matching").textContent = `Select all ${leads.length.toLocaleString()} matching`;
    $("#select-matching").disabled =
      state.busy || state.editing || !leads.length || leads.every((lead) => state.selectedDots.has(lead.dot));
    $("#clear-selected").hidden = !state.selectedDots.size;
    $("#clear-selected").disabled = state.busy || state.editing;
    $("#delete-selected").disabled = state.busy || state.editing || !state.selectedDots.size;
    $("#delete-selected").textContent = state.selectedDots.size
      ? `Move ${state.selectedDots.size.toLocaleString()} to Trash`
      : "Move to Trash";

    const selectPageCheckbox = $("#select-page");
    selectPageCheckbox.checked = !!pageRows.length && pageRows.every((lead) => state.selectedDots.has(lead.dot));
    selectPageCheckbox.indeterminate = pageRows.some((lead) => state.selectedDots.has(lead.dot)) && !selectPageCheckbox.checked;
    selectPageCheckbox.disabled = state.busy || state.editing || !pageRows.length;

    // 7. Empty State Handling
    const hasActiveRecords = !!state.result.leads.length;
    $("#history-empty").hidden = hasActiveRecords;
    for (const sel of [".selection-bar", ".prospects-filter-card", ".export-bar", ".table-scroll", ".table-footer"]) {
      const el = $(sel);
      if (el) el.hidden = !hasActiveRecords;
    }

    $("#history-empty-description").textContent = (state.result.trash || []).length
      ? `Your records have been moved to Trash. ${state.result.documents.length} register receipts remain in your library. You can restore deletions or import new PDFs.`
      : "Add FMCSA register PDFs to start discovering newly filed property carriers and dispatch prospects.";

    const emptyTrashBtn = $("#empty-open-trash");
    if (emptyTrashBtn) {
      emptyTrashBtn.hidden = !(state.result.trash || []).length;
      emptyTrashBtn.disabled = state.busy || state.editing;
    }

    // 8. Table Rows Rendering
    $("#rows").innerHTML =
      pageRows
        .map((lead) => {
          const isSelected = state.selectedDots.has(lead.dot);
          const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${encodeURIComponent(
            lead.dot
          )}`;
          const badgeClass = lead.decision;
          const badgeLabel =
            lead.decision === "relevant"
              ? "Dispatch prospect"
              : lead.decision === "review"
              ? "Manual review"
              : "Outside target";

          return `<tr class="${isSelected ? "selected-row" : ""}">
            <td class="select-cell">
              <label class="row-select-control">
                <input type="checkbox" data-select-dot="${esc(lead.dot)}" aria-label="Select USDOT ${esc(lead.dot)}" ${
            isSelected ? "checked" : ""
          } ${state.busy || state.editing ? "disabled" : ""}>
              </label>
            </td>
            <td>
              <a class="dot-badge-link" href="${saferUrl}" target="_blank" rel="noreferrer" title="Open FMCSA SAFER snapshot">
                USDOT ${esc(lead.dot)} ↗
              </a>
              <span class="company">${esc(lead.name)}</span>
              <span class="cell-note">${esc(lead.address)}</span>
              <button type="button" class="row-delete danger" data-delete-dot="${esc(lead.dot)}" ${
            state.busy || state.editing ? "disabled" : ""
          }>Delete record</button>
            </td>
            <td>
              <span class="badge ${badgeClass}">${esc(badgeLabel)}</span>
              <div class="category-name">${lead.categories.map(esc).join("<br>")}</div>
            </td>
            <td>
              ${
                lead.phone
                  ? `<div style="display:flex;align-items:center;gap:6px;">
                      <strong>${esc(lead.phone)}</strong>
                      <button type="button" class="quiet" data-copy="${esc(lead.phone)}" style="padding:2px 6px;font-size:11px;" title="Copy phone">📋</button>
                    </div>`
                  : '<span class="cell-note">Phone unavailable</span>'
              }
              <span class="cell-note">Officer: ${esc(lead.officer || "Unavailable")}</span>
              <span class="cell-note">Filing: ${esc(lead.filing_date)}</span>
            </td>
            <td>
              <span>${esc(lead.reason)}</span>
              ${lead.flags.map((flag) => `<p class="warning" style="margin:4px 0 0;font-weight:600;">⚠️ ${esc(flag)}</p>`).join("")}
            </td>
            <td>
              <button type="button" class="evidence-button" data-dot="${esc(lead.dot)}">
                ${lead.occurrences} ${lead.occurrences === 1 ? "source record" : "source records"}
              </button>
              <span class="cell-note">Click to inspect pages</span>
            </td>
          </tr>`;
        })
        .join("") ||
      `<tr><td colspan="6" class="empty">${
        state.result.leads.length
          ? "No records match these filters. Try another group or search term."
          : "No active carrier records in database. Switch to Upload to add PDFs."
      }</td></tr>`;

    // 9. Pagination State
    $("#page-info").textContent = leads.length
      ? `Showing ${state.page * state.pageSize + 1}–${Math.min((state.page + 1) * state.pageSize, leads.length)} of ${leads.length.toLocaleString()}`
      : "0 results";
    $("#prev").disabled = state.page === 0;
    $("#next").disabled = (state.page + 1) * state.pageSize >= leads.length;

    // 10. Update Undos & Badges
    $("#undo-notice").hidden = !state.undoId || !state.result.trash.some((item) => item.id === state.undoId);
    $("#undo-delete").disabled = state.busy || state.editing;

    Navigation.updateBadges();
  },

  showEvidence(dot) {
    if (!state.result) return;
    const lead = this.effective(state.result.leads.find((r) => r.dot === dot));
    if (!lead) return;

    $("#evidence-title").textContent = `USDOT ${lead.dot} · Source Occurrences`;
    $("#evidence-content").innerHTML = lead.evidence
      .map(
        (rec) => `<article class="evidence-record">
          <h3>${esc(rec.source)} · page ${rec.pages.join(", ")}</h3>
          <dl>
            ${[
              ["Legal Business", rec.name],
              ["Authority Category", rec.category],
              ["Filing Date", rec.filing_date],
              ["Register Date", rec.register_date || "Unavailable"],
              ["Telephone", rec.phone || "Unavailable"],
              ["Company Officer", rec.officer || "Unavailable"],
              ["Mailing Address", rec.address],
            ]
              .map(([label, value]) => `<dt>${label}</dt><dd>${esc(value)}</dd>`)
              .join("")}
          </dl>
          <p class="small" style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--border-subtle);">${esc(rec.notice)}</p>
        </article>`
      )
      .join("");

    $("#evidence").showModal();
  },
};

// ============================================================================
// 7. Upload & Extraction Controller
// ============================================================================

const Upload = {
  init() {
    const fileInput = $("#files");
    const dropzone = $("#dropzone");

    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        this.addFiles(e.target.files);
        e.target.value = "";
      });
    }

    if (dropzone) {
      dropzone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!state.busy) $("#files").click();
        }
      });

      for (const name of ["dragenter", "dragover"]) {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          if (!state.busy) dropzone.classList.add("drag");
        });
      }

      for (const name of ["dragleave", "drop"]) {
        dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          dropzone.classList.remove("drag");
        });
      }

      dropzone.addEventListener("drop", (e) => {
        this.addFiles(e.dataTransfer.files);
      });
    }

    // Global dragover drop prevent
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    // Remove file delegation
    $("#file-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn || state.busy || state.editing) return;
      state.files.splice(Number(btn.dataset.remove), 1);
      this.renderFiles();
      $("#extract").disabled = !state.files.length;
      Navigation.updateBadges();
    });

    $("#extract").addEventListener("click", () => this.startExtraction());
    $("#cancel").addEventListener("click", () => this.cancelExtraction());
  },

  feedback(message, error = false) {
    const fb = $("#feedback");
    if (!fb) return;
    fb.textContent = message;
    fb.classList.toggle("error", error);
  },

  renderFiles() {
    const list = $("#file-list");
    if (!list) return;
    list.innerHTML = state.files
      .map(
        (file, index) =>
          `<li>
            <span aria-hidden="true" style="font-size:16px;">📄</span>
            <span class="filename">${esc(file.name)}</span>
            <small>${(file.size / 1024 / 1024).toFixed(1)} MB</small>
            <button type="button" data-remove="${index}" aria-label="Remove ${esc(file.name)}" ${
            state.busy || state.editing ? "disabled" : ""
          }>×</button>
          </li>`
      )
      .join("");
  },

  addFiles(incoming) {
    if (state.busy || state.editing) return;
    const next = [...state.files];

    for (const file of incoming) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return this.feedback("Select FMCSA PDF registers only.", true);
      }
      if (file.size > 25 * 1024 * 1024) {
        return this.feedback(`${file.name} is larger than 25 MB limit.`, true);
      }
      if (file.size === 0) {
        return this.feedback(`${file.name} is empty.`, true);
      }
      if (!next.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) {
        next.push(file);
      }
    }

    if (next.length > 40 || next.reduce((sum, f) => sum + f.size, 0) > 199 * 1024 * 1024) {
      return this.feedback("Batch limit: up to 40 PDFs totaling under 199 MB.", true);
    }

    state.files = next;
    $("#extract").disabled = !state.files.length;
    this.renderFiles();
    this.feedback("");
    Navigation.updateBadges();
  },

  async startExtraction() {
    if (state.busy || state.editing || !state.files.length) return;
    const previousJob = state.jobId;
    state.jobId = null;
    state.cancelRequested = false;
    state.progressSnapshot = null;
    App.setBusy(true, "extraction");
    this.feedback("");

    $("#progress").removeAttribute("value");
    $("#progress-text").textContent = "Preparing your PDF batch…";

    try {
      if (!state.token) await Api.getSession();
      const body = new FormData();
      state.files.forEach((file) => body.append("files", file, file.name));

      const job = await Api.startJob(body);
      state.jobId = job.id;
      App.remember(state.jobId);

      if (state.cancelRequested) await Api.cancelJob(state.jobId);
      if (previousJob && previousJob !== state.jobId) Api.forgetJob(previousJob).catch(() => {});

      this.poll(state.jobId, ++state.polling);
    } catch (error) {
      if (!state.jobId) state.jobId = previousJob;
      App.setBusy(false);
      this.feedback(error.message, true);
    }
  },

  async cancelExtraction() {
    const cancelBtn = $("#cancel");
    cancelBtn.disabled = true;
    state.cancelRequested = true;

    if (!state.jobId) {
      $("#progress-text").textContent = "Cancellation requested. Finishing local upload…";
      return;
    }

    $("#progress-text").textContent = "Cancelling at next page boundary…";
    try {
      await Api.cancelJob(state.jobId);
    } catch (error) {
      cancelBtn.disabled = false;
      this.feedback(error.message, true);
    }
  },

  async poll(id, generation, failures = 0) {
    if (generation !== state.polling) return;

    try {
      const status = await Api.getJob(id);
      if (generation !== state.polling) return;

      if (status.status === "running") {
        this.showRunningStatus(status);
        setTimeout(() => this.poll(id, generation), 500);
      } else if (status.status === "complete") {
        await App.loadHistory(true);
        if (generation !== state.polling) return;

        state.jobId = id;
        state.files = [];
        App.remember(null);
        App.setBusy(false);

        Navigation.switchTab("prospects");
        Prospects.initializeFilters();
        Prospects.render();

        const message = this.showImportReceipt(status) || `Saved ${status.imported.added} new registers.`;
        this.feedback(message);
        App.updateSyncStatus("Up to date · no extraction running");
      } else {
        App.setBusy(false);
        App.remember(null);
        this.feedback(status.message, status.status === "error");
        App.updateSyncStatus(status.message, status.status === "error");
      }
    } catch (error) {
      if (generation !== state.polling) return;
      if (error.status === 404) {
        App.remember(null);
        state.jobId = null;
        App.setBusy(false);
        try {
          await App.loadHistory(true);
        } catch (e) {
          App.updateSyncStatus(e.message, true);
        }
        this.feedback(error.message, true);
        return;
      }

      if (failures < 4) {
        $("#progress-text").textContent = "Reconnecting to local server…";
        setTimeout(() => this.poll(id, generation, failures + 1), 1500);
      } else {
        App.setBusy(false);
        this.feedback(`${error.message} Refresh to reconnect if the server is running.`, true);
      }
    }
  },

  showRunningStatus(status) {
    state.progressSnapshot = status;
    state.progressReceived = Date.now();
    $("#progress-text").textContent = `${status.message} · file ${status.file_index || 1} of ${status.file_count}`;
    $("#cancel").disabled = status.phase === "saving";

    if (status.phase === "saving") {
      $("#progress").removeAttribute("value");
    } else if (status.pages) {
      $("#progress").value = Math.min(
        99,
        ((status.file_index - 1 + (status.page - 1) / status.pages) / status.file_count) * 100
      );
    }
    App.updateSyncStatus("Extraction in progress · showing active saved records");
    this.updateProgressHealth();
  },

  updateProgressHealth() {
    const el = $("#progress-health");
    if (!el) return;
    if (!state.busy || state.busyPurpose !== "extraction" || !state.progressSnapshot) {
      el.textContent = "";
      return;
    }

    const delta = (Date.now() - state.progressReceived) / 1000;
    const elapsed = Math.floor((state.progressSnapshot.elapsed_seconds || 0) + delta);
    const idle = (state.progressSnapshot.idle_seconds || 0) + delta;

    let detail =
      state.progressSnapshot.phase === "saving"
        ? "Committing complete batch atomically; totals update upon finish."
        : "Totals update after the complete batch succeeds.";

    if (delta > 12) {
      detail = "Waiting for response from local server. Use Refresh to reconnect.";
    } else if (idle > 12) {
      detail =
        state.progressSnapshot.phase === "saving"
          ? `Server responding · saving has taken ${Math.floor(idle)}s.`
          : `Server responding · reading PDF pages (${Math.floor(idle)}s).`;
    }

    el.textContent = `${elapsed}s elapsed · ${detail}`;
  },

  showImportReceipt(status) {
    if (status.status !== "complete" || !status.imported) return;
    const imported = status.imported;
    const detail = imported.details || {};
    const newDots = detail.new_dots ?? 0;

    let message = imported.added
      ? `Finished: ${imported.added} new ${imported.added === 1 ? "PDF" : "PDFs"} saved · ${newDots.toLocaleString()} new active ${
          newDots === 1 ? "DOT" : "DOTs"
        }.`
      : "Finished: no new PDFs were added.";

    if (detail.already_saved) message += ` ${detail.already_saved} already saved.`;
    if (detail.in_trash) message += ` ${detail.in_trash} in Trash; restore them there to include their records.`;
    if (detail.hidden_occurrences)
      message += ` ${detail.hidden_occurrences.toLocaleString()} source occurrences stay excluded by earlier deletions.`;
    if (imported.added && !newDots && !detail.hidden_occurrences)
      message += " These PDFs contain DOTs already in your saved list; source evidence was merged.";

    $("#import-receipt").hidden = false;
    $("#import-summary").textContent = message;
    $("#import-files").innerHTML = (detail.files || [])
      .map(
        (file) =>
          `<li>
            <strong>${esc(file.filename)}</strong>
            <span>${esc(
              {
                added: "New PDF saved",
                already_saved: "Already saved — duplicate skipped",
                in_trash: "In Trash — restore to include",
              }[file.status] || file.status
            )}</span>
          </li>`
      )
      .join("");

    return message;
  },
};

// ============================================================================
// 8. Register Library Controller
// ============================================================================

const Library = {
  render() {
    if (!state.result) return;
    const docs = state.result.documents || [];
    const emptyDocs = docs.filter((d) => !d.record_count).length;

    $("#register-summary").textContent = `${docs.length} saved ${
      docs.length === 1 ? "register" : "registers"
    }${emptyDocs ? ` · ${emptyDocs} with no active records` : ""}`;

    const delBtn = $("#delete-documents");
    delBtn.textContent = state.selectedDocuments.size
      ? `Delete ${state.selectedDocuments.size} selected ${state.selectedDocuments.size === 1 ? "register" : "registers"}`
      : "Delete selected registers";
    delBtn.disabled = state.busy || state.editing || !state.selectedDocuments.size;

    $("#document-selection-count").textContent = state.selectedDocuments.size
      ? `(${state.selectedDocuments.size} selected)`
      : "";

    const selectAllCheckbox = $("#select-all-documents");
    selectAllCheckbox.checked = !!docs.length && state.selectedDocuments.size === docs.length;
    selectAllCheckbox.indeterminate = !!state.selectedDocuments.size && !selectAllCheckbox.checked;
    selectAllCheckbox.disabled = state.busy || state.editing || !docs.length;

    $("#documents").innerHTML =
      docs
        .map((doc) => {
          const isSelected = state.selectedDocuments.has(doc.id);
          return `<div class="doc ${isSelected ? "selected-document" : ""}">
            <label class="document-select">
              <input type="checkbox" data-select-document="${esc(doc.id)}" aria-label="Select register ${esc(doc.filename)}" ${
            isSelected ? "checked" : ""
          } ${state.busy || state.editing ? "disabled" : ""}>
              <span>
                <strong>${esc(doc.filename)}</strong>
                <span class="document-meta">
                  ${
                    doc.record_count
                      ? `${doc.record_count.toLocaleString()} active source ${doc.record_count === 1 ? "record" : "records"}`
                      : "No active records"
                  } · ${doc.pages} pages · ${esc(doc.register_date || "date unavailable")}
                </span>
              </span>
            </label>
            <button type="button" class="quiet danger" data-delete-document="${esc(doc.id)}" aria-label="Delete register ${esc(
            doc.filename
          )}" ${state.busy || state.editing ? "disabled" : ""}>
              Delete register
            </button>
          </div>
          ${doc.warnings.map((w) => `<p class="warning" style="margin:4px 0 0;">⚠️ ${esc(w)}</p>`).join("")}`;
        })
        .join("") ||
      '<p class="small" style="padding:24px 0;text-align:center;">No saved registers. Restore deleted items from Trash or upload new PDFs.</p>';
  },
};

// ============================================================================
// 9. Trash & Recovery Controller
// ============================================================================

const Trash = {
  render() {
    if (!state.result) return;
    const query = $("#trash-search").value.trim().toLowerCase();
    const items = (state.result.trash || []).filter((item) => item.label.toLowerCase().includes(query));

    const listHtml =
      items
        .map((item) => {
          const type =
            item.kind === "dots"
              ? `${item.count.toLocaleString()} USDOT ${item.count === 1 ? "record" : "records"}`
              : `${item.count} ${item.count === 1 ? "register" : "registers"}`;

          const dateStr = new Date(item.deleted_at).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return `<article class="trash-item">
            <div>
              <span class="trash-type">${esc(type)}</span>
              <strong>${esc(item.label)}</strong>
              <span class="small">Deleted ${esc(dateStr)}</span>
            </div>
            <button type="button" class="secondary" data-restore="${esc(item.id)}" aria-label="Restore ${esc(item.label)}" ${
            state.busy || state.editing ? "disabled" : ""
          }>
              Restore
            </button>
          </article>`;
        })
        .join("") ||
      `<div class="trash-empty">
        <h3>${query ? "No matching deletions" : "Trash is empty"}</h3>
        <p class="small">${query ? "Try searching for a different company name, DOT, or filename." : "Deleted records and registers will appear here, ready to restore."}</p>
      </div>`;

    $("#trash-list").innerHTML = listHtml;
    const dialogContent = $("#trash-dialog-content");
    if (dialogContent) dialogContent.innerHTML = listHtml;
  },

  askDelete(kind, targets) {
    if (state.busy || state.editing || !targets.length) return;
    const targetSet = new Set(targets);
    const entries =
      kind === "dots"
        ? state.result.leads.filter((lead) => targetSet.has(lead.dot))
        : state.result.documents.filter((doc) => targetSet.has(doc.id));

    const count = entries.length;
    const noun = kind === "dots" ? (count === 1 ? "record" : "records") : count === 1 ? "register" : "registers";
    state.pendingDelete = { kind, targets, count, noun };

    $("#delete-title").textContent = `Move ${count.toLocaleString()} ${noun} to Trash?`;
    $("#delete-description").textContent =
      kind === "dots"
        ? "These DOT records will leave your active prospect list and future exports, including all source occurrences."
        : "Only these registers and their source evidence will be removed. USDOTs supported by another active register remain.";

    $("#delete-preview").innerHTML =
      entries
        .slice(0, 5)
        .map(
          (item) =>
            `<div>
              <strong>${esc(kind === "dots" ? item.name : item.filename)}</strong>
              <span>${
                kind === "dots"
                  ? `USDOT ${esc(item.dot)} · ${item.occurrences} source ${item.occurrences === 1 ? "record" : "records"}`
                  : `${item.record_count.toLocaleString()} active source ${item.record_count === 1 ? "record" : "records"}`
              }</span>
            </div>`
        )
        .join("") + (count > 5 ? `<p style="padding:10px 14px;color:var(--muted);font-size:12px;">and ${(count - 5).toLocaleString()} more selected ${noun}</p>` : "");

    $("#confirm-delete").textContent = `Move ${count.toLocaleString()} to Trash`;
    $("#delete-error").textContent = "";
    $("#delete-dialog").showModal();
    $("#cancel-delete").focus();
  },

  async confirmDelete() {
    if (state.busy || state.editing || !state.pendingDelete) return;
    const action = state.pendingDelete;

    $("#delete-error").textContent = "Moving selection to Trash…";
    $("#confirm-delete").textContent = "Moving…";
    $("#confirm-delete").disabled = true;

    try {
      await App.changeHistory("/api/history/delete", { kind: action.kind, targets: action.targets });
      state.undoId = state.result.trash[0].id;
      $("#undo-delete").hidden = false;
      $("#undo-message").textContent = `Moved ${action.count.toLocaleString()} ${action.noun} to Trash.`;
      $("#delete-dialog").close();
      state.pendingDelete = null;
      Prospects.render();
      Library.render();
      Trash.render();
      Navigation.updateBadges();
    } catch (error) {
      $("#delete-error").textContent = error.message;
    } finally {
      $("#confirm-delete").disabled = false;
      $("#confirm-delete").textContent = `Move ${action.count.toLocaleString()} to Trash`;
    }
  },

  async restoreDeletion(id, source) {
    if (state.busy || state.editing) return;
    const target = source === "trash" ? $("#trash-feedback") : $("#undo-message");
    target.textContent = "Restoring saved items…";

    try {
      await App.changeHistory("/api/history/restore", { id });
      if (source === "trash") {
        $("#trash-feedback").textContent = "Restored deletion. Active filters and remaining deletions still apply.";
        Trash.render();
      } else {
        state.undoId = null;
        $("#undo-notice").hidden = false;
        $("#undo-message").textContent = "Deletion undone. Your saved items have been restored.";
        $("#undo-delete").hidden = true;
      }
      Prospects.render();
      Library.render();
      Navigation.updateBadges();
    } catch (error) {
      target.textContent = `${error.message} You can retry or restore from Trash.`;
    }
  },
};

// ============================================================================
// 10. Export Controller
// ============================================================================

const Export = {
  csvFields: [
    "dot",
    "name",
    "categories",
    "phone",
    "officer",
    "address",
    "filing_date",
    "register_date",
    "decision",
    "reason",
    "flags",
    "notice",
    "equipment",
    "occurrences",
    "sources",
  ],

  csvCell(value) {
    let text = String(value ?? "");
    if (/^[=+\-@]/.test(text.trimStart()) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  },

  download(name, data, mime) {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  exportCSV() {
    const rows = Prospects.visibleRows().map((lead) => ({
      ...lead,
      categories: lead.categories.join(" | "),
      flags: lead.flags.join(" | "),
      sources: lead.evidence
        .map((rec) => `${rec.source} p.${rec.pages.join(",")}: ${rec.category} (${rec.filing_date})`)
        .join(" | "),
    }));
    const csv =
      [
        this.csvFields.map(this.csvCell).join(","),
        ...rows.map((lead) => this.csvFields.map((field) => this.csvCell(lead[field])).join(",")),
      ].join("\r\n") + "\r\n";

    this.download(`dispatch-${state.view}.csv`, "\ufeff" + csv, "text/csv;charset=utf-8");
  },

  exportDOTs() {
    const dots = Prospects.visibleRows()
      .map((lead) => lead.dot)
      .join("\n") + "\n";
    this.download(`dot-numbers-${state.view}.txt`, dots, "text/plain;charset=utf-8");
  },

  exportAudit() {
    const leads = state.result.leads.map(Prospects.effective);
    const counts = { relevant: 0, review: 0, excluded: 0 };
    leads.forEach((lead) => counts[lead.decision]++);
    const auditData = {
      ...state.result,
      summary: { ...state.result.summary, ...counts },
      applied_options: { include_movers: $("#movers").checked },
      leads,
    };
    this.download("extraction-audit.json", JSON.stringify(auditData, null, 2), "application/json");
  },
};

// ============================================================================
// 11. Core Application Controller
// ============================================================================

const App = {
  setBusy(value, purpose = "extraction") {
    state.busy = value;
    state.busyPurpose = purpose;

    const extractBtn = $("#extract");
    if (extractBtn) {
      extractBtn.disabled = state.busy || state.editing || !state.files.length;
      extractBtn.textContent = state.busy
        ? purpose === "loading"
          ? "Loading history…"
          : "Extracting prospects…"
        : "Extract prospects ↗";
    }

    $("#cancel").hidden = !state.busy || purpose !== "extraction";
    $("#files").disabled = state.busy || state.editing;
    $("#progress-area").hidden = !state.busy;
    $("#clear").disabled = state.busy || state.editing;

    const refreshBtn = $("#refresh-history");
    if (refreshBtn) refreshBtn.disabled = state.editing || state.historyRefreshing || (state.busy && !state.jobId);

    if (state.result) {
      Prospects.render();
      Library.render();
      Trash.render();
    }
    Upload.renderFiles();
  },

  updateSyncStatus(message, error = false) {
    const el = $("#sync-status");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("error", error);
  },

  remember(id) {
    try {
      if (id) sessionStorage.setItem("dispatch-job", id);
      else sessionStorage.removeItem("dispatch-job");
    } catch (_) {}
  },

  async loadHistory(preserve = false) {
    const filters =
      preserve && state.result
        ? {
            search: $("#search").value,
            category: $("#category").value,
            country: $("#country").value,
            view: state.view,
            page: state.page,
          }
        : null;

    const history = await Api.getHistory();
    state.result = history.result;
    state.liveRevision = history.revision;

    Prospects.initializeFilters();
    if (filters) {
      $("#search").value = filters.search;
      $("#category").value = filters.category;
      $("#country").value = filters.country;
      state.view = filters.view;
      state.page = filters.page;
    }

    Prospects.render();
    Library.render();
    Trash.render();
    Navigation.updateBadges();

    return history;
  },

  async changeHistory(path, data) {
    state.editing = true;
    this.setBusy(state.busy);
    $("#confirm-delete").disabled = true;
    $("#cancel-delete").disabled = true;

    try {
      const updated = await Api.request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const filters = {
        search: $("#search").value,
        category: $("#category").value,
        country: $("#country").value,
        view: state.view,
        page: state.page,
      };

      state.result = updated.result;
      Prospects.initializeFilters();
      $("#search").value = filters.search;
      $("#category").value = filters.category;
      $("#country").value = filters.country;
      state.view = filters.view;
      state.page = filters.page;

      Prospects.render();
      Library.render();
      Trash.render();
      Navigation.updateBadges();
    } finally {
      state.editing = false;
      this.setBusy(state.busy);
      $("#confirm-delete").disabled = false;
      $("#cancel-delete").disabled = false;
    }
  },

  async checkActivity() {
    if (
      !state.ready ||
      state.activityChecking ||
      state.historyRefreshing ||
      state.editing ||
      (state.busy && !state.jobId) ||
      document.hidden
    )
      return;

    state.activityChecking = true;
    try {
      const activity = await Api.getActivity();
      if (activity.active_job && !state.busy) {
        state.jobId = activity.active_job;
        this.remember(state.jobId);
        this.setBusy(true);
        Upload.poll(state.jobId, ++state.polling);
      } else if (!state.busy) {
        if (activity.revision !== state.liveRevision) await this.loadHistory(true);
        if (activity.latest_job?.status === "complete") Upload.showImportReceipt(activity.latest_job);
        this.updateSyncStatus(
          activity.latest_job?.status === "error"
            ? `No extraction running · last batch failed: ${activity.latest_job.message}`
            : "Up to date · ready for dispatch prospecting",
          activity.latest_job?.status === "error"
        );
      }
    } catch (error) {
      this.updateSyncStatus(`Connection delayed. ${error.message}`, true);
    } finally {
      state.activityChecking = false;
    }
  },

  async init() {
    Theme.init();
    Navigation.init();
    Upload.init();

    // Event Delegations
    this.bindEvents();

    this.setBusy(true, "loading");
    $("#progress-text").textContent = "Loading saved FMCSA carrier history…";

    try {
      state.token = (await Api.getSession()).token;
      const history = await this.loadHistory();

      if (history.active_job) {
        state.jobId = history.active_job;
        this.remember(state.jobId);
        this.setBusy(true);
        Navigation.switchTab("upload");
        $("#progress-text").textContent = "Reconnecting to active extraction…";
        Upload.poll(state.jobId, ++state.polling);
      } else {
        this.remember(null);
        this.setBusy(false);
        if (state.result.documents.length) {
          Upload.feedback(
            `Loaded ${state.result.summary.unique.toLocaleString()} unique USDOTs across ${state.result.documents.length} saved registers.`
          );
        } else {
          // Empty database: start on Upload tab for optimal UX
          Navigation.switchTab("upload");
        }
      }
    } catch (error) {
      this.setBusy(false);
      Upload.feedback(error.message || "Local server unavailable. Ensure python app.py is running.", true);
      this.updateSyncStatus(error.message, true);
    } finally {
      state.ready = true;
      this.checkActivity();
    }

    // Timers
    setInterval(() => Upload.updateProgressHealth(), 1000);
    setInterval(() => this.checkActivity(), 5000);
    window.addEventListener("focus", () => this.checkActivity());
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) this.checkActivity();
    });
  },

  bindEvents() {
    // 1. Refresh History
    $("#refresh-history").addEventListener("click", async () => {
      if (state.historyRefreshing || state.editing || (state.busy && !state.jobId)) return;
      state.historyRefreshing = true;
      const btn = $("#refresh-history");
      btn.disabled = true;
      btn.textContent = "↻ Refreshing…";

      try {
        await this.loadHistory(true);
        this.updateSyncStatus("Saved records refreshed from database");
      } catch (error) {
        this.updateSyncStatus(error.message, true);
      } finally {
        state.historyRefreshing = false;
        btn.disabled = false;
        btn.innerHTML = '<span aria-hidden="true">↻</span> Refresh records';
        this.checkActivity();
      }
    });

    // 2. Clear Filters
    $("#clear").addEventListener("click", async () => {
      if (state.busy || state.editing) return;
      this.setBusy(true, "loading");
      try {
        if (state.jobId) await Api.forgetJob(state.jobId);
        state.files = [];
        state.jobId = null;
        this.remember(null);
        ++state.polling;
        state.selectedDots.clear();
        state.selectedDocuments.clear();
        $("#movers").checked = true;
        await this.loadHistory();
        Upload.feedback("Selection and filters cleared.");
      } catch (error) {
        Upload.feedback(`Could not reset filters: ${error.message}`, true);
      } finally {
        this.setBusy(false);
      }
    });

    // 3. Stat Card Clicking to Filter
    $("#stats").addEventListener("click", (e) => {
      const statCard = e.target.closest("[data-stat-view]");
      if (!statCard) return;
      state.view = statCard.dataset.statView;
      state.selectedDots.clear();
      state.page = 0;
      Prospects.render();
    });

    // 4. Group Tabs
    $$("[data-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        state.selectedDots.clear();
        state.page = 0;
        Prospects.render();
      });
    });

    // 5. Search & Filters
    for (const id of ["search", "category", "country", "movers"]) {
      const el = $("#" + id);
      if (el) {
        el.addEventListener(id === "search" ? "input" : "change", () => {
          state.selectedDots.clear();
          state.page = 0;
          Prospects.render();
        });
      }
    }

    // 6. Pagination
    $("#prev").addEventListener("click", () => {
      state.page--;
      Prospects.render();
    });
    $("#next").addEventListener("click", () => {
      state.page++;
      Prospects.render();
    });

    // 7. Table Interactions (Select, Delete, Evidence, Copy)
    $("#rows").addEventListener("change", (e) => {
      const checkbox = e.target.closest("[data-select-dot]");
      if (!checkbox || state.busy || state.editing) return;
      const dot = checkbox.dataset.selectDot;
      if (checkbox.checked) state.selectedDots.add(dot);
      else state.selectedDots.delete(dot);
      Prospects.render();
    });

    $("#rows").addEventListener("click", (e) => {
      // Evidence button
      const evBtn = e.target.closest("[data-dot]");
      if (evBtn) {
        Prospects.showEvidence(evBtn.dataset.dot);
        return;
      }
      // Single row delete
      const delBtn = e.target.closest("[data-delete-dot]");
      if (delBtn) {
        Trash.askDelete("dots", [delBtn.dataset.deleteDot]);
        return;
      }
      // Copy phone or USDOT
      const copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        const text = copyBtn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
          const original = copyBtn.textContent;
          copyBtn.textContent = "✓";
          setTimeout(() => (copyBtn.textContent = original), 1500);
        });
      }
    });

    $("#select-page").addEventListener("change", (e) => {
      if (state.busy || state.editing) return;
      Prospects.visibleRows()
        .slice(state.page * state.pageSize, (state.page + 1) * state.pageSize)
        .forEach((lead) => {
          if (e.target.checked) state.selectedDots.add(lead.dot);
          else state.selectedDots.delete(lead.dot);
        });
      Prospects.render();
    });

    $("#select-matching").addEventListener("click", () => {
      if (state.busy || state.editing) return;
      state.selectedDots = new Set(Prospects.visibleRows().map((lead) => lead.dot));
      Prospects.render();
      $("#delete-selected").focus({ preventScroll: true });
    });

    $("#clear-selected").addEventListener("click", () => {
      if (state.busy || state.editing) return;
      state.selectedDots.clear();
      Prospects.render();
    });

    $("#delete-selected").addEventListener("click", () => {
      Trash.askDelete("dots", [...state.selectedDots]);
    });

    // 8. Register Archive Interactions
    $("#documents").addEventListener("change", (e) => {
      const checkbox = e.target.closest("[data-select-document]");
      if (!checkbox || state.busy || state.editing) return;
      const id = checkbox.dataset.selectDocument;
      if (checkbox.checked) state.selectedDocuments.add(id);
      else state.selectedDocuments.delete(id);
      Library.render();
    });

    $("#documents").addEventListener("click", (e) => {
      const delBtn = e.target.closest("[data-delete-document]");
      if (delBtn) Trash.askDelete("documents", [delBtn.dataset.deleteDocument]);
    });

    $("#select-all-documents").addEventListener("change", (e) => {
      if (state.busy || state.editing) return;
      state.selectedDocuments = new Set(e.target.checked ? state.result.documents.map((d) => d.id) : []);
      Library.render();
    });

    $("#delete-documents").addEventListener("click", () => {
      Trash.askDelete("documents", [...state.selectedDocuments]);
    });

    // 9. Trash & Modals
    $("#trash-search").addEventListener("input", () => Trash.render());

    $("#trash-list").addEventListener("click", (e) => {
      const restoreBtn = e.target.closest("[data-restore]");
      if (restoreBtn) Trash.restoreDeletion(restoreBtn.dataset.restore, "trash");
    });

    const dialogContent = $("#trash-dialog-content");
    if (dialogContent) {
      dialogContent.addEventListener("click", (e) => {
        const restoreBtn = e.target.closest("[data-restore]");
        if (restoreBtn) Trash.restoreDeletion(restoreBtn.dataset.restore, "trash");
      });
    }

    $("#confirm-delete").addEventListener("click", () => Trash.confirmDelete());
    $("#cancel-delete").addEventListener("click", () => $("#delete-dialog").close());
    $("#close-evidence").addEventListener("click", () => $("#evidence").close());
    $("#close-trash").addEventListener("click", () => $("#trash-dialog").close());

    $("#undo-delete").addEventListener("click", () => {
      if (state.undoId) Trash.restoreDeletion(state.undoId, "undo");
    });
    $("#dismiss-undo").addEventListener("click", () => {
      state.undoId = null;
      $("#undo-notice").hidden = true;
    });

    // 10. Exports
    $("#export-csv").addEventListener("click", () => Export.exportCSV());
    $("#export-dots").addEventListener("click", () => Export.exportDOTs());
    $("#export-audit").addEventListener("click", () => Export.exportAudit());
  },
};

// ============================================================================
// Initialize App on DOM Ready
// ============================================================================

document.addEventListener("DOMContentLoaded", () => App.init());
