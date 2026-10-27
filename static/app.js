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
// Lucide SVG Icons System (100% Offline, Stroke-based SVG Icons)
// ============================================================================

const Lucide = {
  icons: {
    "target": `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
    "upload-cloud": `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>`,
    "folder-archive": `<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>`,
    "trash-2": `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>`,
    "book-open": `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
    "sun": `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
    "moon": `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`,
    "refresh-cw": `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`,
    "search": `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`,
    "filter": `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
    "filter-x": `<path d="m13.013 3 3.987 5-3.987 5"/><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/><path d="m17 17 5 5"/><path d="m22 17-5 5"/>`,
    "download": `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>`,
    "file-spreadsheet": `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>`,
    "file-text": `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>`,
    "file-code": `<path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>`,
    "copy": `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
    "check": `<polyline points="20 6 9 17 4 12"/>`,
    "check-circle-2": `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
    "minus-circle": `<circle cx="12" cy="12" r="10"/><line x1="8" x2="16" y1="12" y2="12"/>`,
    "alert-circle": `<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>`,
    "alert-triangle": `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>`,
    "shield-check": `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`,
    "lock": `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`,
    "external-link": `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>`,
    "eye": `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
    "chevron-left": `<path d="m15 18-6-6 6-6"/>`,
    "chevron-right": `<path d="m9 18 6-6-6-6"/>`,
    "rotate-ccw": `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,
    "x": `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`,
    "user": `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    "calendar": `<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>`,
    "map-pin": `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
    "phone": `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`,
    "users": `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    "layers": `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`,
    "copy-check": `<path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`,
    "package": `<path d="m16.5 9.4 4.5 2.8v5.6l-8 4.7-8-4.7v-5.6l4.5-2.8"/><path d="m3.3 7 8.7 5.2 8.7-5.2-8.7-5.2-8.7-5.2-8.7 5.2Z"/><path d="M12 12v9.5"/>`,
    "globe": `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
    "ban": `<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>`,
    "sliders-horizontal": `<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>`,
    "info": `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
    "truck": `<rect width="16" height="13" x="1" y="5" rx="2"/><polygon points="17 8 20 8 23 11 23 16 17 16 17 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,
    "arrow-up-right": `<path d="M7 7h10v10"/><path d="M7 17 17 7"/>`,
    "database": `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>`,
    "cpu": `<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>`,
    "sparkles": `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>`
  },

  icon(name, size = 16, className = "") {
    const paths = this.icons[name] || this.icons["info"];
    const cls = className ? `lucide lucide-${name} ${className}` : `lucide lucide-${name}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${paths}</svg>`;
  },

  createIcons(root = document) {
    if (!root) return;
    root.querySelectorAll("[data-lucide]").forEach((el) => {
      const name = el.getAttribute("data-lucide");
      const size = Number(el.getAttribute("data-size") || 16);
      const cls = el.getAttribute("class") || "";
      el.outerHTML = this.icon(name, size, cls);
    });
  }
};

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
      icon.innerHTML = Lucide.icon(theme === "dark" ? "sun" : "moon", 16);
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
    Lucide.createIcons();
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
      [counts.relevant, "Relevant prospects", "relevant", "target", "stat-emerald", "Motor carriers of property"],
      [s.unique, "Unique USDOT numbers", "all", "layers", "stat-sky", "Deduplicated active entities"],
      [s.duplicates, "Repeated occurrences merged", "", "copy-check", "stat-indigo", "Repeat filings consolidated"],
      [s.pages, "Source pages processed", "", "file-text", "stat-slate", "Processed from register PDFs"],
    ]
      .map(([n, label, filterView, iconName, colorClass, desc]) => {
        const clickable = filterView ? `style="cursor:pointer;" data-stat-view="${filterView}" title="Filter by ${label}"` : "";
        return `<div class="stat-card ${colorClass}" ${clickable}>
          <div class="stat-card-header">
            <span class="stat-card-label">${label}</span>
            <div class="stat-card-icon">
              ${Lucide.icon(iconName, 18)}
            </div>
          </div>
          <div class="stat-card-body">
            <strong class="stat-card-value">${Number(n || 0).toLocaleString()}</strong>
            <span class="stat-card-desc">${desc}</span>
          </div>
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
      : "Select individual records or check header box for this page.";
    $("#select-matching").textContent = `Select all ${leads.length.toLocaleString()} matching`;
    $("#select-matching").disabled =
      state.busy || state.editing || !leads.length || leads.every((lead) => state.selectedDots.has(lead.dot));
    $("#clear-selected").hidden = !state.selectedDots.size;
    $("#clear-selected").disabled = state.busy || state.editing;
    $("#delete-selected").disabled = state.busy || state.editing || !state.selectedDots.size;
    $("#delete-selected").innerHTML = `${Lucide.icon("trash-2", 13)} <span>${
      state.selectedDots.size
        ? `Move ${state.selectedDots.size.toLocaleString()} to Trash`
        : "Move to Trash"
    }</span>`;

    const selBar = $(".selection-bar");
    if (selBar) {
      selBar.classList.toggle("has-selection", state.selectedDots.size > 0);
    }

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
                <span class="checkbox-mark"></span>
              </label>
            </td>
            <td>
              <div class="company-cell">
                <div class="dot-row">
                  <a class="dot-badge-link" href="${saferUrl}" target="_blank" rel="noreferrer" title="Open FMCSA SAFER snapshot">
                    USDOT ${esc(lead.dot)}
                    ${Lucide.icon("external-link", 11)}
                  </a>
                  <button type="button" class="row-delete danger" data-delete-dot="${esc(lead.dot)}" title="Delete record" ${
            state.busy || state.editing ? "disabled" : ""
          }>
                    ${Lucide.icon("trash-2", 12)}
                    <span>Delete</span>
                  </button>
                </div>
                <span class="company">${esc(lead.name)}</span>
                <span class="cell-note address-note">
                  ${Lucide.icon("map-pin", 11, "inline-icon")}
                  <span>${esc(lead.address)}</span>
                </span>
              </div>
            </td>
            <td>
              <span class="badge ${badgeClass}">${esc(badgeLabel)}</span>
              <div class="category-name">${lead.categories.map(esc).join("<br>")}</div>
            </td>
            <td>
              <div class="contact-cell">
                ${
                  lead.phone
                    ? `<div class="phone-row">
                        <strong class="phone-number">${esc(lead.phone)}</strong>
                        <button type="button" class="copy-btn" data-copy="${esc(lead.phone)}" title="Copy phone number">
                          ${Lucide.icon("copy", 12)}
                        </button>
                      </div>`
                    : '<span class="cell-note unavailable">Phone unavailable</span>'
                }
                <span class="cell-note">
                  ${Lucide.icon("user", 11, "inline-icon")}
                  <span>${esc(lead.officer || "Unavailable")}</span>
                </span>
                <span class="cell-note">
                  ${Lucide.icon("calendar", 11, "inline-icon")}
                  <span>Filing: ${esc(lead.filing_date)}</span>
                </span>
              </div>
            </td>
            <td>
              <div class="reason-cell">
                <span class="reason-text">${esc(lead.reason)}</span>
                ${lead.flags
                  .map(
                    (flag) =>
                      `<div class="flag-chip">${Lucide.icon("alert-triangle", 12)} <span>${esc(flag)}</span></div>`
                  )
                  .join("")}
              </div>
            </td>
            <td>
              <div class="evidence-cell">
                <button type="button" class="evidence-button" data-dot="${esc(lead.dot)}">
                  ${Lucide.icon("eye", 13)}
                  <span>${lead.occurrences} ${lead.occurrences === 1 ? "source record" : "sources"}</span>
                </button>
              </div>
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
    Lucide.createIcons();
  },

  showEvidence(dot) {
    if (!state.result) return;
    const lead = this.effective(state.result.leads.find((r) => r.dot === dot));
    if (!lead) return;

    $("#evidence-title").textContent = `USDOT ${lead.dot} · Source Records`;
    $("#evidence-content").innerHTML = lead.evidence
      .map(
        (rec) => `<article class="evidence-record">
          <div class="evidence-header">
            <span class="evidence-icon">${Lucide.icon("file-text", 16)}</span>
            <h3>${esc(rec.source)} · page ${rec.pages.join(", ")}</h3>
          </div>
          <dl class="evidence-grid">
            ${[
              ["Legal Business", rec.name],
              ["Authority Category", rec.category],
              ["Filing Date", rec.filing_date],
              ["Register Date", rec.register_date || "Unavailable"],
              ["Telephone", rec.phone || "Unavailable"],
              ["Company Officer", rec.officer || "Unavailable"],
              ["Mailing Address", rec.address],
            ]
              .map(([label, value]) => `<div class="evidence-field"><dt>${label}</dt><dd>${esc(value)}</dd></div>`)
              .join("")}
          </dl>
          <div class="evidence-notice">${Lucide.icon("info", 13)} <span>${esc(rec.notice)}</span></div>
        </article>`
      )
      .join("");

    $("#evidence").showModal();
    Lucide.createIcons();
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
          `<li class="file-item">
            <span class="file-icon">${Lucide.icon("file-text", 16)}</span>
            <span class="filename">${esc(file.name)}</span>
            <small class="file-size">${(file.size / 1024 / 1024).toFixed(1)} MB</small>
            <button type="button" class="btn-remove-file" data-remove="${index}" aria-label="Remove ${esc(file.name)}" ${
            state.busy || state.editing ? "disabled" : ""
          }>${Lucide.icon("x", 14)}</button>
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
              <span class="checkbox-mark"></span>
              <div class="doc-icon-box">
                ${Lucide.icon("file-text", 18)}
              </div>
              <div class="doc-info">
                <strong class="doc-filename">${esc(doc.filename)}</strong>
                <span class="document-meta">
                  <span class="doc-badge ${doc.record_count ? "has-records" : "empty-records"}">
                    ${
                      doc.record_count
                        ? `${doc.record_count.toLocaleString()} active ${doc.record_count === 1 ? "record" : "records"}`
                        : "0 active records"
                    }
                  </span>
                  <span class="meta-sep">·</span>
                  <span>${doc.pages} pages</span>
                  <span class="meta-sep">·</span>
                  <span class="meta-date">${Lucide.icon("calendar", 11, "inline-icon")} ${esc(doc.register_date || "date unavailable")}</span>
                </span>
              </div>
            </label>
            <button type="button" class="btn btn-ghost btn-danger btn-sm" data-delete-document="${esc(doc.id)}" aria-label="Delete register ${esc(
            doc.filename
          )}" ${state.busy || state.editing ? "disabled" : ""}>
              ${Lucide.icon("trash-2", 13)}
              <span>Delete</span>
            </button>
          </div>
          ${doc.warnings.map((w) => `<div class="doc-warning">${Lucide.icon("alert-triangle", 13)} <span>${esc(w)}</span></div>`).join("")}`;
        })
        .join("") ||
      '<div class="empty-library-state"><p class="small">No saved registers. Restore deleted items from Trash or upload new PDFs.</p></div>';
    Lucide.createIcons();
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
            <div class="trash-info">
              <div class="trash-badge-row">
                <span class="trash-type">${esc(type)}</span>
                <span class="trash-date">${Lucide.icon("calendar", 11, "inline-icon")} Deleted ${esc(dateStr)}</span>
              </div>
              <strong class="trash-label">${esc(item.label)}</strong>
            </div>
            <button type="button" class="btn btn-secondary btn-sm restore-btn" data-restore="${esc(item.id)}" aria-label="Restore ${esc(item.label)}" ${
            state.busy || state.editing ? "disabled" : ""
          }>
              ${Lucide.icon("rotate-ccw", 13)}
              <span>Restore</span>
            </button>
          </article>`;
        })
        .join("") ||
      `<div class="trash-empty">
        <div class="empty-trash-icon">${Lucide.icon("trash-2", 36)}</div>
        <h3>${query ? "No matching deletions" : "Trash is empty"}</h3>
        <p class="small">${query ? "Try searching for a different company name, DOT, or filename." : "Deleted records and registers will appear here, ready to restore."}</p>
      </div>`;

    $("#trash-list").innerHTML = listHtml;
    const dialogContent = $("#trash-dialog-content");
    if (dialogContent) dialogContent.innerHTML = listHtml;
    Lucide.createIcons();
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
    Lucide.createIcons();

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
      btn.innerHTML = `${Lucide.icon("refresh-cw", 14, "spin-icon")} <span>Refreshing…</span>`;

      try {
        await this.loadHistory(true);
        this.updateSyncStatus("Saved records refreshed from database");
      } catch (error) {
        this.updateSyncStatus(error.message, true);
      } finally {
        state.historyRefreshing = false;
        btn.disabled = false;
        btn.innerHTML = `${Lucide.icon("refresh-cw", 14)} <span>Refresh records</span>`;
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
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = Lucide.icon("check", 12, "text-success");
          copyBtn.classList.add("copied");
          setTimeout(() => {
            copyBtn.innerHTML = original;
            copyBtn.classList.remove("copied");
          }, 1500);
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
