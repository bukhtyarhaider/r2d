/**
 * R2D · Register to Dot — FMCSA Dispatch Register Prospect Intelligence
 * Developer: Bukhtyar Haider
 * Generated from static/src/ modular component architecture
 */
(function() {
'use strict';

// =====================================================================
// Module: core/icons.js
// =====================================================================
/**
 * R2D - Offline Vector Icons (Lucide SVG compatible)
 * Developer: Bukhtyar Haider
 */

const ICONS = {
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'upload-cloud': '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',
  'folder-archive': '<circle cx="12" cy="13" r="1"/><path d="M4 20V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M4 10h16"/>',
  'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'sliders-horizontal': '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  'filter-x': '<path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055"/><path d="m22 3-5 5"/><path d="m17 3 5 5"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  'file-code': '<path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>',
  'check-circle-2': '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>',
  'minus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  'truck': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18.5" r="2.5"/><circle cx="7" cy="18.5" r="2.5"/>',
  'package': '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  'ban': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'keyboard': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>',
  'phone-call': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/>',
  'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'sparkles': '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'repeat': '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"/>',
  'file-check': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'hash': '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>'
};

function renderIcon(name, size = 16, className = '') {
  const content = ICONS[name] || '';
  return `<svg class="lucide-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
}

function replaceIcons(container = document) {
  const elements = container.querySelectorAll('[data-lucide]');
  elements.forEach(el => {
    const name = el.getAttribute('data-lucide');
    const size = el.getAttribute('data-size') || 16;
    if (ICONS[name]) {
      el.innerHTML = renderIcon(name, size);
    }
  });
}

// =====================================================================
// Module: core/location.js
// =====================================================================
/**
 * R2D - Location & Address Parser
 * Developer: Bukhtyar Haider
 */

// US States & Canadian Provinces mapping
const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico'
};

const TOP_DISPATCH_STATES = ['TX', 'CA', 'FL', 'GA', 'IL', 'OH', 'NC', 'PA', 'NJ', 'TN', 'IN', 'MO'];

/**
 * Extracts city, state code, postal code, and country from raw FMCSA addresses
 * Handles single-line and multi-line strings, Canadian postal codes, etc.
 */
function parseLocation(rawAddress) {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { city: '', state: '', postal: '', country: '', formatted: '—' };
  }

  const clean = rawAddress.trim().replace(/\s+/g, ' ');
  
  // Pattern 1: ... , City, ST 12345 or City, ST 12345-6789
  const usMatch = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\s+([0-9]{5}(?:-[0-9]{4})?)(?:\s+([A-Za-z]{2,}))?$/i);
  if (usMatch) {
    const city = usMatch[1].trim();
    const state = usMatch[2].toUpperCase();
    const postal = usMatch[3].trim();
    const country = (usMatch[4] || 'US').toUpperCase();
    return { city, state, postal, country, formatted: `${city}, ${state}` };
  }

  // Pattern 2: Canadian address ... , City, PROV A1A 1A1
  const caMatch = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\s+([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)(?:\s+([A-Za-z]{2,}))?$/i);
  if (caMatch) {
    const city = caMatch[1].trim();
    const state = caMatch[2].toUpperCase();
    const postal = caMatch[3].trim();
    const country = (caMatch[4] || 'CA').toUpperCase();
    return { city, state, postal, country, formatted: `${city}, ${state}` };
  }

  // Pattern 3: Fallback comma match ... , City, ST
  const fallback = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\b/);
  if (fallback) {
    const city = fallback[1].trim();
    const state = fallback[2].toUpperCase();
    return { city, state, postal: '', country: 'US', formatted: `${city}, ${state}` };
  }

  return { city: '', state: '', postal: '', country: '', formatted: clean };
}

// =====================================================================
// Module: core/export.js
// =====================================================================
/**
 * R2D - Export Builders
 * Developer: Bukhtyar Haider
 */

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportCSV(leads, viewName = 'leads') {
  if (!leads || !leads.length) return false;

  const headers = [
    'USDOT',
    'Legal Name',
    'Decision',
    'State',
    'City',
    'Full Address',
    'Phone',
    'Representative / Officer',
    'Filing Date',
    'Register Date',
    'Categories',
    'Decision Reason',
    'Occurrences',
    'Flags'
  ];

  const rows = [headers.join(',')];

  for (const lead of leads) {
    const categoriesStr = Array.isArray(lead.categories) ? lead.categories.join('; ') : '';
    const flagsStr = Array.isArray(lead.flags) ? lead.flags.join('; ') : '';

    rows.push([
      escapeCSV(lead.dot),
      escapeCSV(lead.name),
      escapeCSV(lead.decision),
      escapeCSV(lead._parsedState || ''),
      escapeCSV(lead._parsedCity || ''),
      escapeCSV(lead.address),
      escapeCSV(lead.phone),
      escapeCSV(lead.officer),
      escapeCSV(lead.filing_date),
      escapeCSV(lead.register_date),
      escapeCSV(categoriesStr),
      escapeCSV(lead.reason),
      escapeCSV(lead.occurrences || 1),
      escapeCSV(flagsStr)
    ].join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-fmcsa-${viewName}-${dateStr}.csv`);
  return true;
}

function exportDOTs(leads) {
  if (!leads || !leads.length) return false;
  const dots = leads.map(l => l.dot).filter(Boolean);
  const content = dots.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-usdots-${dateStr}.txt`);
  return true;
}

function exportAuditJSON(historyData) {
  if (!historyData) return false;
  const jsonStr = JSON.stringify(historyData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-extraction-audit-${dateStr}.json`);
  return true;
}

// =====================================================================
// Module: core/store.js
// =====================================================================
/**
 * R2D - Register to Dot · Reactive State Store
 * Developer: Bukhtyar Haider
 */

class Store {
  constructor(initialState = {}) {
    this.state = {
      // Data
      history: null,
      revision: null,
      prospects: [],
      filteredProspects: [],
      categories: [],
      registers: [],
      trash: [],
      summary: {},

      // UI & Navigation
      activeTab: 'prospects',
      theme: localStorage.getItem('r2d-theme') || 'dark',

      // Filter State
      view: 'relevant', // 'relevant' | 'review' | 'excluded' | 'all'
      search: '',
      selectedState: '', // '' for all, or 2-letter state code (e.g. 'TX')
      category: '',
      country: '',
      movers: true,
      pageSize: 25,
      page: 1,

      // Selection State
      selectedDots: new Set(),
      allMatchingSelected: false,

      // Dossier Drawer
      activeCarrier: null,

      // Import Job State
      activeJobId: null,
      activeJob: null,

      // Trash UI
      trashSearch: '',
      selectedDocuments: new Set(),

      ...initialState
    };

    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, data) {
    for (const listener of this.listeners) {
      try {
        listener(this.state, event, data);
      } catch (err) {
        console.error('[Store] Listener error:', err);
      }
    }
  }

  setState(updates, event = 'stateChange') {
    this.state = { ...this.state, ...updates };
    this.notify(event, updates);
  }

  setFilters(filters) {
    const next = { ...this.state, ...filters, page: 1 };
    this.state = next;
    this.computeFilteredProspects();
    this.notify('filterChange', filters);
  }

  setPage(page) {
    const maxPage = Math.max(1, Math.ceil(this.state.filteredProspects.length / this.state.pageSize));
    const validPage = Math.min(Math.max(1, page), maxPage);
    this.setState({ page: validPage }, 'pageChange');
  }

  toggleDotSelection(dot) {
    const next = new Set(this.state.selectedDots);
    if (next.has(dot)) {
      next.delete(dot);
    } else {
      next.add(dot);
    }
    this.setState({
      selectedDots: next,
      allMatchingSelected: false
    }, 'selectionChange');
  }

  selectPageDots(dots, select) {
    const next = new Set(this.state.selectedDots);
    for (const d of dots) {
      if (select) next.add(d);
      else next.delete(d);
    }
    this.setState({
      selectedDots: next,
      allMatchingSelected: false
    }, 'selectionChange');
  }

  selectAllMatching() {
    const all = new Set(this.state.filteredProspects.map(p => p.dot));
    this.setState({
      selectedDots: all,
      allMatchingSelected: true
    }, 'selectionChange');
  }

  clearSelection() {
    this.setState({
      selectedDots: new Set(),
      allMatchingSelected: false
    }, 'selectionChange');
  }

  openDossier(carrier) {
    this.setState({ activeCarrier: carrier }, 'dossierOpen');
  }

  closeDossier() {
    this.setState({ activeCarrier: null }, 'dossierClose');
  }

  computeFilteredProspects() {
    const { prospects, view, search, selectedState, category, country, movers } = this.state;
    if (!prospects || !prospects.length) {
      this.state.filteredProspects = [];
      return;
    }

    const query = (search || '').trim().toLowerCase();
    const queryTokens = query ? query.split(/\s+/).filter(Boolean) : [];

    const filtered = prospects.filter(lead => {
      // 1. View / Decision tab filter
      const dec = (lead.decision || '').toLowerCase();
      const isMover = Array.isArray(lead.categories) && lead.categories.some(c => /household/i.test(c));

      if (view === 'relevant') {
        if (dec !== 'relevant') return false;
        if (!movers && isMover) return false;
      } else if (view === 'review') {
        if (dec !== 'review') return false;
      } else if (view === 'excluded') {
        if (dec !== 'excluded') return false;
      }

      // 2. Category / Authority Scope filter
      if (category) {
        if (!Array.isArray(lead.categories)) return false;
        const target = category.trim().toLowerCase();
        if (!lead.categories.some(c => (c || '').trim().toLowerCase() === target)) return false;
      }

      // 3. Country filter
      if (country) {
        const addr = lead.address || '';
        if (country === 'US' && !/(?:,\s*[A-Z]{2}\s+\d{5}|USA|United States)/i.test(addr)) return false;
        if (country === 'CA' && !/(?:,\s*(?:AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b|Canada)/i.test(addr)) return false;
        if (country === 'MX' && !/(?:Mexico|,\s*(?:AG|BC|BS|CH|CL|CM|CO|CS|DF|DG|GR|GT|HG|JA|MC|MI|MO|NA|NL|OA|PB|QE|QR|SI|SL|SO|TB|TM|TL|VE|YU|ZA)\b)/i.test(addr)) return false;
      }

      // 4. State Quick Chip Filter
      if (selectedState) {
        const addrState = lead._parsedState;
        if (addrState !== selectedState) return false;
      }

      // 5. Multi-token text search
      if (queryTokens.length > 0) {
        const hay = (lead._searchHaystack || '').toLowerCase();
        for (const token of queryTokens) {
          if (!hay.includes(token)) return false;
        }
      }

      return true;
    });

    this.state.filteredProspects = filtered;
  }
}

// =====================================================================
// Module: core/api.js
// =====================================================================
/**
 * R2D - API Client Service
 * Developer: Bukhtyar Haider
 */

class APIClient {
  constructor() {
    this.token = null;
    this.sessionPromise = null;
  }

  async getSessionToken() {
    if (this.token) return this.token;
    if (this.sessionPromise) return this.sessionPromise;

    this.sessionPromise = (async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Session failed with status ${res.status}`);
        const data = await res.json();
        this.token = data.token;
        return this.token;
      } catch (err) {
        this.sessionPromise = null;
        throw err;
      }
    })();

    return this.sessionPromise;
  }

  async fetchActivity() {
    const res = await fetch('/api/activity', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Activity fetch failed: ${res.status}`);
    return await res.json();
  }

  async fetchHistory() {
    const res = await fetch('/api/history', { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to load records' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  async fetchJob(jobId) {
    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, { cache: 'no-store' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Job not found' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  async uploadBatch(files, onUploadProgress) {
    const token = await this.getSessionToken();
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file, file.name);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/jobs');
      xhr.setRequestHeader('X-Session-Token', token);

      if (onUploadProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onUploadProgress(event.loaded, event.total);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || `Upload failed (HTTP ${xhr.status})`));
          }
        } catch {
          reject(new Error(`Server returned status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  }

  async cancelJob(jobId) {
    const token = await this.getSessionToken();
    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/cancel`, {
      method: 'POST',
      headers: { 'X-Session-Token': token }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Cannot cancel' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  async forgetJob(jobId) {
    const token = await this.getSessionToken();
    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/forget`, {
      method: 'POST',
      headers: { 'X-Session-Token': token }
    });
    return res.ok;
  }

  async deleteRecords(kind, targets) {
    const token = await this.getSessionToken();
    const res = await fetch('/api/history/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token
      },
      body: JSON.stringify({ kind, targets })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Deletion failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }

  async restoreRecord(deletionId) {
    const token = await this.getSessionToken();
    const res = await fetch('/api/history/restore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token
      },
      body: JSON.stringify({ id: deletionId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Restore failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  }
}

const api = new APIClient();

// =====================================================================
// Module: components/Toast.js
// =====================================================================
/**
 * R2D - Toast Notification System
 * Developer: Bukhtyar Haider
 */


class ToastManager {
  constructor() {
    this.container = null;
  }

  ensureContainer() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
      }
    }
    return this.container;
  }

  show(message, type = 'info', durationMs = 2800) {
    const container = this.ensureContainer();
    const el = document.createElement('div');
    el.className = `toast-item toast-${type}`;

    let iconName = 'check-circle-2';
    if (type === 'error' || type === 'danger') iconName = 'alert-circle';
    if (type === 'warn' || type === 'warning') iconName = 'alert-triangle';
    if (type === 'copy') iconName = 'copy';

    el.innerHTML = `
      <div class="toast-icon-wrap">${renderIcon(iconName, 16)}</div>
      <div class="toast-body">${message}</div>
      <button class="toast-close" type="button" aria-label="Dismiss">${renderIcon('x', 13)}</button>
      <div class="toast-progress-bar" style="animation-duration: ${durationMs}ms"></div>
    `;

    const dismiss = () => {
      el.classList.add('toast-exit');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };

    el.querySelector('.toast-close').addEventListener('click', dismiss);
    const timer = setTimeout(dismiss, durationMs);
    el.addEventListener('mouseenter', () => clearTimeout(timer));

    container.appendChild(el);
  }

  success(msg) { this.show(msg, 'success'); }
  info(msg) { this.show(msg, 'info'); }
  copy(msg) { this.show(msg, 'copy', 2000); }
  warn(msg) { this.show(msg, 'warn', 3500); }
  error(msg) { this.show(msg, 'error', 4500); }
}

const Toast = new ToastManager();

// =====================================================================
// Module: components/Header.js
// =====================================================================
/**
 * R2D - Header & Navigation Component
 * Developer: Bukhtyar Haider
 */


class HeaderComponent {
  constructor(store) {
    this.store = store;
    this.el = document.querySelector('.topbar');
    this.themeBtn = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    this.shortcutsBtn = document.getElementById('open-shortcuts');
    this.tabs = document.querySelectorAll('.nav-tab');

    this.badgeProspects = document.getElementById('nav-count-prospects');
    this.badgeUpload = document.getElementById('nav-count-upload');
    this.badgeRegisters = document.getElementById('nav-count-registers');
    this.badgeTrash = document.getElementById('nav-count-trash');

    this.init();
  }

  init() {
    this.applyTheme(this.store.getState().theme);

    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    if (this.shortcutsBtn) {
      this.shortcutsBtn.addEventListener('click', () => {
        const dialog = document.getElementById('shortcuts-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      });
    }

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.selectTab(targetTab);
      });
    });

    this.store.subscribe((state, event) => {
      if (event === 'tabChange') {
        this.updateActiveTab(state.activeTab);
      }
      this.updateBadges(state);
    });
  }

  selectTab(tabName) {
    this.store.setState({ activeTab: tabName }, 'tabChange');
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  updateActiveTab(activeTab) {
    this.tabs.forEach(tab => {
      const match = tab.getAttribute('data-tab') === activeTab;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${activeTab}`);
    });
  }

  updateBadges(state) {
    const format = (n) => Number(n || 0).toLocaleString();

    if (this.badgeProspects) {
      const total = state.summary?.unique || state.summary?.total_leads || state.prospects?.length || 0;
      this.badgeProspects.textContent = format(total);
    }

    if (this.badgeRegisters) {
      const docs = state.registers?.length || state.summary?.documents_saved || 0;
      this.badgeRegisters.textContent = format(docs);
    }

    if (this.badgeTrash) {
      const trashCount = state.trash?.length || 0;
      this.badgeTrash.textContent = format(trashCount);
      const trashBtnCount = document.getElementById('trash-count');
      if (trashBtnCount) trashBtnCount.textContent = format(trashCount);
    }
  }

  toggleTheme() {
    const current = this.store.getState().theme;
    const next = current === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('r2d-theme', theme);
    this.store.setState({ theme }, 'themeChange');

    if (this.themeIcon) {
      this.themeIcon.innerHTML = renderIcon(theme === 'light' ? 'moon' : 'sun', 16);
    }
  }
}

// =====================================================================
// Module: components/StatsHUD.js
// =====================================================================
/**
 * R2D - Stats HUD Metric Cards Component
 * Developer: Bukhtyar Haider
 */


class StatsHUDComponent {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('stats');
    this.init();
  }

  init() {
    this.store.subscribe((state, event) => {
      if (['historyLoad', 'filterChange', 'stateChange'].includes(event)) {
        this.render(state);
      }
    });
  }

  render(state) {
    if (!this.container) return;

    const summary = state.summary || {};
    const prospects = state.prospects || [];
    const filtered = state.filteredProspects || [];

    const totalLeads = summary.unique || summary.total_leads || prospects.length || 0;
    const relevantCount = summary.relevant !== undefined ? summary.relevant :
      prospects.filter(p => (p.decision || '').toLowerCase() === 'relevant').length;
    
    // Multi-issue occurrences (carriers in 2 or more registers)
    const multiFilings = prospects.filter(p => (p.occurrences || 1) >= 2).length;
    const totalDocs = summary.documents_saved || state.registers?.length || 0;

    const format = (n) => Number(n || 0).toLocaleString();
    const pct = totalLeads ? Math.round((relevantCount / totalLeads) * 100) : 0;

    this.container.innerHTML = `
      <div class="stat-card stat-card-primary" data-stat="relevant">
        <div class="stat-header">
          <span class="stat-tag">TARGET SHORTLIST</span>
          <span class="stat-icon-wrap emerald">${renderIcon('target', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(relevantCount)}</div>
          <div class="stat-sub">
            <span class="stat-trend positive">${pct}%</span> of total deduplicated pool
          </div>
        </div>
        <div class="stat-foot">Ready for direct carrier dispatch outreach</div>
      </div>

      <div class="stat-card" data-stat="pool">
        <div class="stat-header">
          <span class="stat-tag">DEDUPLICATED POOL</span>
          <span class="stat-icon-wrap cyan">${renderIcon('truck', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(totalLeads)}</div>
          <div class="stat-sub">
            <span class="stat-badge-cyan">1 ROW PER USDOT</span>
          </div>
        </div>
        <div class="stat-foot">Property, movers, & specialty carriers</div>
      </div>

      <div class="stat-card" data-stat="multi">
        <div class="stat-header">
          <span class="stat-tag">MULTI-ISSUE FILINGS</span>
          <span class="stat-icon-wrap amber">${renderIcon('sparkles', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(multiFilings)}</div>
          <div class="stat-sub">
            <span class="stat-badge-amber">HIGH INTENT</span> 2+ Register occurrences
          </div>
        </div>
        <div class="stat-foot">Latest filed contact details preferred</div>
      </div>

      <div class="stat-card" data-stat="archive">
        <div class="stat-header">
          <span class="stat-tag">REGISTER ARCHIVE</span>
          <span class="stat-icon-wrap indigo">${renderIcon('folder-archive', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(totalDocs)}</div>
          <div class="stat-sub">
            <span class="stat-badge-indigo">100% LOCAL</span> SQLite Armored
          </div>
        </div>
        <div class="stat-foot">Daily Operating Authority Applications</div>
      </div>
    `;
  }
}

// =====================================================================
// Module: components/FilterBar.js
// =====================================================================
/**
 * R2D - FilterBar & Selection Command Component
 * Developer: Bukhtyar Haider
 */


class FilterBarComponent {
  constructor(store) {
    this.store = store;

    // View tab buttons
    this.viewTabs = document.querySelectorAll('.view-tab');
    this.countRelevant = document.getElementById('count-relevant');
    this.countReview = document.getElementById('count-review');
    this.countExcluded = document.getElementById('count-excluded');

    // Controls
    this.searchInput = document.getElementById('search');
    this.categorySelect = document.getElementById('category');
    this.countrySelect = document.getElementById('country');
    this.moversCheckbox = document.getElementById('movers');
    this.clearBtn = document.getElementById('clear');
    this.visibleBadge = document.getElementById('visible-count');

    // Export buttons
    this.exportCsvBtn = document.getElementById('export-csv');
    this.exportDotsBtn = document.getElementById('export-dots');
    this.exportAuditBtn = document.getElementById('export-audit');

    // Selection controls
    this.selectionBar = document.querySelector('.selection-bar');
    this.selectionCount = document.getElementById('selection-count');
    this.selectionHint = document.getElementById('selection-hint');
    this.selectMatchingBtn = document.getElementById('select-matching');
    this.clearSelectedBtn = document.getElementById('clear-selected');
    this.deleteSelectedBtn = document.getElementById('delete-selected');

    this.init();
  }

  init() {
    this.renderStateChips();

    // View tabs
    this.viewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.getAttribute('data-view');
        this.store.setFilters({ view });
      });
    });

    // Search with debounce
    let searchTimeout = null;
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.store.setFilters({ search: e.target.value });
        }, 120);
      });
    }

    // Category
    if (this.categorySelect) {
      this.categorySelect.addEventListener('change', (e) => {
        this.store.setFilters({ category: e.target.value });
      });
    }

    // Country
    if (this.countrySelect) {
      this.countrySelect.addEventListener('change', (e) => {
        this.store.setFilters({ country: e.target.value });
      });
    }

    // Movers checkbox
    if (this.moversCheckbox) {
      this.moversCheckbox.addEventListener('change', (e) => {
        this.store.setFilters({ movers: e.target.checked });
      });
    }

    // Clear filters
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }

    // Exports
    if (this.exportCsvBtn) {
      this.exportCsvBtn.addEventListener('click', () => {
        const { filteredProspects, view } = this.store.getState();
        const success = exportCSV(filteredProspects, view);
        if (success) {
          Toast.success(`Exported ${filteredProspects.length.toLocaleString()} carriers to CSV`);
        } else {
          Toast.warn('No records match current filters to export.');
        }
      });
    }

    if (this.exportDotsBtn) {
      this.exportDotsBtn.addEventListener('click', () => {
        const { filteredProspects } = this.store.getState();
        const success = exportDOTs(filteredProspects);
        if (success) {
          Toast.success(`Exported ${filteredProspects.length.toLocaleString()} USDOT numbers`);
        } else {
          Toast.warn('No records match current filters.');
        }
      });
    }

    if (this.exportAuditBtn) {
      this.exportAuditBtn.addEventListener('click', () => {
        const { history } = this.store.getState();
        const success = exportAuditJSON(history);
        if (success) {
          Toast.success('Exported full FMCSA audit JSON');
        } else {
          Toast.warn('Audit data is currently empty.');
        }
      });
    }

    // Selection actions
    if (this.selectMatchingBtn) {
      this.selectMatchingBtn.addEventListener('click', () => {
        this.store.selectAllMatching();
      });
    }

    if (this.clearSelectedBtn) {
      this.clearSelectedBtn.addEventListener('click', () => {
        this.store.clearSelection();
      });
    }

    if (this.deleteSelectedBtn) {
      this.deleteSelectedBtn.addEventListener('click', () => {
        const { selectedDots } = this.store.getState();
        if (selectedDots.size === 0) return;
        this.openDeleteDialog(Array.from(selectedDots));
      });
    }

    // Store sync
    this.store.subscribe((state, event) => {
      this.syncUI(state);
    });

    // Setup dynamic sticky offset sync
    this.syncFilterDeckHeight();
    const filterCard = document.querySelector('.prospects-filter-card');
    if (filterCard && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        this.syncFilterDeckHeight();
      });
      ro.observe(filterCard);
    }
    window.addEventListener('resize', () => this.syncFilterDeckHeight());
  }

  syncFilterDeckHeight() {
    const card = document.querySelector('.prospects-filter-card');
    if (card) {
      const h = Math.round(card.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty('--filter-deck-height', `${h}px`);
      }
    }
  }

  renderStateChips() {
    let container = document.getElementById('state-chips-bar');
    if (!container) {
      // Create and inject directly below the filter controls
      const filterCard = document.querySelector('.prospects-filter-card');
      if (!filterCard) return;

      container = document.createElement('div');
      container.id = 'state-chips-bar';
      container.className = 'state-chips-bar';
      filterCard.appendChild(container);
    }

    const { selectedState } = this.store.getState();

    let html = `
      <div class="state-chips-label">
        <span class="chips-icon">${renderIcon('map-pin', 12)}</span>
        <span>Filter by State:</span>
      </div>
      <div class="state-chips-list">
        <button type="button" class="state-chip ${!selectedState ? 'active' : ''}" data-state="">
          ALL STATES
        </button>
    `;

    for (const st of TOP_DISPATCH_STATES) {
      html += `
        <button type="button" class="state-chip ${selectedState === st ? 'active' : ''}" data-state="${st}">
          ${st}
        </button>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll('.state-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const st = btn.getAttribute('data-state');
        this.store.setFilters({ selectedState: st });
        this.renderStateChips();
      });
    });

    this.syncFilterDeckHeight();
  }

  clearAllFilters() {
    if (this.searchInput) this.searchInput.value = '';
    if (this.categorySelect) this.categorySelect.value = '';
    if (this.countrySelect) this.countrySelect.value = '';
    if (this.moversCheckbox) this.moversCheckbox.checked = true;

    this.store.setFilters({
      search: '',
      selectedState: '',
      category: '',
      country: '',
      movers: true,
      view: 'relevant'
    });
    this.renderStateChips();
    Toast.info('Active filters reset');
  }

  syncUI(state) {
    // 1. Update view tab buttons
    this.viewTabs.forEach(tab => {
      const match = tab.getAttribute('data-view') === state.view;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-pressed', match ? 'true' : 'false');
    });

    // 2. Update decision count badges
    const summary = state.summary || {};
    const format = (n) => Number(n || 0).toLocaleString();

    const relCount = summary.relevant !== undefined ? summary.relevant :
      (state.prospects || []).filter(p => (p.decision || '').toLowerCase() === 'relevant').length;
    const revCount = summary.review !== undefined ? summary.review :
      (state.prospects || []).filter(p => (p.decision || '').toLowerCase() === 'review').length;
    const excCount = summary.excluded !== undefined ? summary.excluded :
      (state.prospects || []).filter(p => (p.decision || '').toLowerCase() === 'excluded').length;

    if (this.countRelevant) this.countRelevant.textContent = format(relCount);
    if (this.countReview) this.countReview.textContent = format(revCount);
    if (this.countExcluded) this.countExcluded.textContent = format(excCount);

    // 3. Visible count
    if (this.visibleBadge) {
      const count = state.filteredProspects?.length || 0;
      this.visibleBadge.textContent = `${format(count)} ${count === 1 ? 'carrier' : 'carriers'} matching`;
    }

    // 4. Populate category / authority scope options
    if (this.categorySelect && state.categories?.length) {
      const currentVal = this.store.getState().category || this.categorySelect.value;
      const existingOptions = Array.from(this.categorySelect.options).slice(1).map(o => o.value);
      const isUpToDate = existingOptions.length === state.categories.length &&
        state.categories.every((cat, i) => existingOptions[i] === cat);
      if (!isUpToDate) {
        this.categorySelect.innerHTML = '<option value="">All authority scopes</option>';
        const frag = document.createDocumentFragment();
        for (const cat of state.categories) {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          if (cat === currentVal) opt.selected = true;
          frag.appendChild(opt);
        }
        this.categorySelect.appendChild(frag);
        if (currentVal) this.categorySelect.value = currentVal;
      }
    }

    // 5. Selection bar update
    const selCount = state.selectedDots.size;
    if (this.selectionBar) {
      this.selectionBar.hidden = selCount === 0;
      this.selectionBar.style.display = selCount === 0 ? 'none' : 'flex';
    }

    if (this.selectionCount) {
      this.selectionCount.textContent = selCount === 0
        ? 'No carriers selected'
        : `${selCount.toLocaleString()} carrier${selCount === 1 ? '' : 's'} selected`;
    }

    if (this.selectionHint) {
      this.selectionHint.textContent = selCount === 0
        ? 'Check individual carrier boxes or the header checkbox to select this page.'
        : state.allMatchingSelected
          ? `All ${selCount.toLocaleString()} carriers matching current filters are selected.`
          : `${selCount.toLocaleString()} selected. Use action buttons to bulk process or export.`;
    }

    if (this.selectMatchingBtn) {
      const hasMore = state.filteredProspects.length > 0 && selCount < state.filteredProspects.length;
      this.selectMatchingBtn.disabled = !hasMore;
    }

    if (this.clearSelectedBtn) {
      this.clearSelectedBtn.hidden = selCount === 0;
    }

    if (this.deleteSelectedBtn) {
      this.deleteSelectedBtn.disabled = selCount === 0;
    }

    this.syncFilterDeckHeight();
  }

  openDeleteDialog(targets) {
    const dialog = document.getElementById('delete-dialog');
    const desc = document.getElementById('delete-description');
    const preview = document.getElementById('delete-preview');
    if (!dialog) return;

    if (desc) {
      desc.textContent = `You are about to move ${targets.length.toLocaleString()} carrier${targets.length === 1 ? '' : 's'} to the Trash.`;
    }

    if (preview) {
      preview.innerHTML = targets.slice(0, 5).map(d => `<span class="preview-dot">USDOT ${d}</span>`).join(' ') +
        (targets.length > 5 ? ` <span class="preview-more">+${(targets.length - 5).toLocaleString()} more</span>` : '');
    }

    dialog.showModal();
  }
}

// =====================================================================
// Module: components/ProspectsTable.js
// =====================================================================
/**
 * R2D - Prospects High-Density Table Component
 * Developer: Bukhtyar Haider
 */


class ProspectsTableComponent {
  constructor(store) {
    this.store = store;

    this.tbody = document.getElementById('rows');
    this.selectAllPageBox = document.getElementById('select-page');
    this.pageInfo = document.getElementById('page-info');
    this.prevBtn = document.getElementById('prev');
    this.nextBtn = document.getElementById('next');
    this.emptyState = document.getElementById('history-empty');
    this.emptyTitle = document.getElementById('history-empty-title');
    this.emptyDesc = document.getElementById('history-empty-description');

    this.init();
  }

  init() {
    if (this.selectAllPageBox) {
      this.selectAllPageBox.addEventListener('change', (e) => {
        const pageDots = this.getCurrentPageDots();
        this.store.selectPageDots(pageDots, e.target.checked);
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        const { page } = this.store.getState();
        this.store.setPage(page - 1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        const { page } = this.store.getState();
        this.store.setPage(page + 1);
      });
    }

    // Row event delegation for copy, call, and dossier open
    if (this.tbody) {
      this.tbody.addEventListener('click', (e) => {
        // 1. Checkbox toggle
        const checkbox = e.target.closest('.row-checkbox');
        if (checkbox) {
          const dot = checkbox.getAttribute('data-dot');
          this.store.toggleDotSelection(dot);
          return;
        }

        // 2. Direct USDOT copy
        const copyDotBtn = e.target.closest('[data-copy-dot]');
        if (copyDotBtn) {
          e.stopPropagation();
          const dot = copyDotBtn.getAttribute('data-copy-dot');
          navigator.clipboard.writeText(dot).then(() => {
            Toast.copy(`USDOT ${dot} copied to clipboard`);
          });
          return;
        }

        // 3. Direct Phone copy
        const copyPhoneBtn = e.target.closest('[data-copy-phone]');
        if (copyPhoneBtn) {
          e.stopPropagation();
          const phone = copyPhoneBtn.getAttribute('data-copy-phone');
          navigator.clipboard.writeText(phone).then(() => {
            Toast.copy(`Phone ${phone} copied to clipboard`);
          });
          return;
        }

        // 4. Dossier Trigger (carrier name, dossier button, or clicking row except link/button)
        const dossierTrigger = e.target.closest('[data-open-dossier]');
        if (dossierTrigger) {
          const dot = dossierTrigger.getAttribute('data-open-dossier');
          const carrier = this.store.getState().prospects.find(p => p.dot === dot);
          if (carrier) this.store.openDossier(carrier);
          return;
        }

        // Don't trigger dossier if clicking links or buttons
        if (e.target.closest('a') || e.target.closest('button')) return;

        const row = e.target.closest('tr[data-dot]');
        if (row) {
          const dot = row.getAttribute('data-dot');
          const carrier = this.store.getState().prospects.find(p => p.dot === dot);
          if (carrier) this.store.openDossier(carrier);
        }
      });
    }

    this.store.subscribe((state, event) => {
      this.render(state);
    });
  }

  getCurrentPageDots() {
    const { filteredProspects, page, pageSize } = this.store.getState();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProspects.slice(start, end).map(p => p.dot);
  }

  render(state) {
    const { filteredProspects, page, pageSize, selectedDots } = state;
    const total = filteredProspects.length;

    // Handle Empty State
    if (total === 0) {
      if (this.tbody) this.tbody.innerHTML = '';
      if (this.emptyState) {
        this.emptyState.hidden = false;
        if (state.prospects.length === 0) {
          if (this.emptyTitle) this.emptyTitle.textContent = 'No FMCSA Register records imported';
          if (this.emptyDesc) this.emptyDesc.textContent = 'Upload FMCSA daily register PDFs in the Upload tab to generate your carrier prospect list.';
        } else {
          if (this.emptyTitle) this.emptyTitle.textContent = 'No carriers match your active filters';
          if (this.emptyDesc) this.emptyDesc.textContent = 'Try resetting your search query or state filter to view more prospects.';
        }
      }
      if (this.pageInfo) this.pageInfo.textContent = '0 - 0 of 0';
      if (this.prevBtn) this.prevBtn.disabled = true;
      if (this.nextBtn) this.nextBtn.disabled = true;
      if (this.selectAllPageBox) this.selectAllPageBox.checked = false;
      return;
    }

    if (this.emptyState) this.emptyState.hidden = true;

    // Pagination calculations
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const curPage = Math.min(Math.max(1, page), maxPage);
    const start = (curPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const pageRecords = filteredProspects.slice(start, end);

    // Update pagination footer
    if (this.pageInfo) {
      this.pageInfo.textContent = `Showing ${(start + 1).toLocaleString()} – ${end.toLocaleString()} of ${total.toLocaleString()} carriers`;
    }
    if (this.prevBtn) this.prevBtn.disabled = curPage <= 1;
    if (this.nextBtn) this.nextBtn.disabled = curPage >= maxPage;

    // Update select-all-page checkbox
    const allPageSelected = pageRecords.length > 0 && pageRecords.every(p => selectedDots.has(p.dot));
    if (this.selectAllPageBox) {
      this.selectAllPageBox.checked = allPageSelected;
    }

    // Build Table Rows HTML
    const rowsHtml = pageRecords.map(lead => {
      const isSelected = selectedDots.has(lead.dot);
      const decRaw = (lead.decision || 'unknown').toLowerCase();
      let decClass = 'emerald';
      let decIcon = 'truck';
      let decDisplay = 'Relevant';
      if (decRaw === 'review') { decClass = 'amber'; decIcon = 'alert-circle'; decDisplay = 'Review'; }
      if (decRaw === 'excluded') { decClass = 'rose'; decIcon = 'ban'; decDisplay = 'Excluded'; }

      const st = lead._parsedState || '—';
      const city = lead._parsedCity || '';
      const country = lead._parsedCountry;
      const isCrossBorder = country && country !== 'US';
      const phone = lead.phone || '—';
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${lead.dot}`;

      const categories = Array.isArray(lead.categories) ? lead.categories : [];
      const occ = lead.occurrences || 1;

      return `
        <tr data-dot="${lead.dot}" class="${isSelected ? 'selected-row' : ''}">
          <td class="select-cell" onclick="event.stopPropagation()">
            <label class="row-select-control">
              <input type="checkbox" class="row-checkbox" data-dot="${lead.dot}" ${isSelected ? 'checked' : ''} aria-label="Select USDOT ${lead.dot}">
              <span class="checkbox-mark"></span>
            </label>
          </td>

          <!-- Status Pill -->
          <td class="col-status">
            <span class="status-pill status-${decClass}" title="${lead.reason || decDisplay}">
              ${renderIcon(decIcon, 12)}
              <span>${decDisplay}</span>
            </span>
          </td>

          <!-- USDOT & SAFER Link -->
          <td class="col-dot">
            <div class="dot-cell-wrap">
              <button type="button" class="dot-copy-btn" data-copy-dot="${lead.dot}" title="Click to copy USDOT ${lead.dot}">
                <span class="dot-prefix">DOT</span>
                <span class="dot-num">${lead.dot}</span>
                <span class="copy-glyph">${renderIcon('copy', 11)}</span>
              </button>
              <a href="${saferUrl}" target="_blank" rel="noreferrer" class="safer-link-pill" title="Open FMCSA SAFER Snapshot for USDOT ${lead.dot}" onclick="event.stopPropagation()">
                <span>SAFER</span>
                ${renderIcon('external-link', 10)}
              </a>
            </div>
          </td>

          <!-- State & City -->
          <td class="col-location">
            <div class="location-cell-wrap">
              ${st !== '—' ? `<span class="state-pill state-${st}">${st}</span>` : '<span class="state-pill state-NA">NA</span>'}
              ${isCrossBorder ? `<span class="country-pill country-${country}">${country}</span>` : ''}
              <span class="city-name" title="${lead.address || ''}">${city || '—'}</span>
            </div>
          </td>

          <!-- Carrier Legal Name -->
          <td class="col-company">
            <div class="company-cell-wrap">
              <button type="button" class="company-name-link" data-open-dossier="${lead.dot}" title="Click to inspect full carrier dossier">
                ${lead.name}
              </button>
              ${occ > 1 ? `<span class="occ-badge" title="Appeared in ${occ} separate daily register filings — High intent">${occ}x Filed</span>` : ''}
            </div>
          </td>

          <!-- Contact & 1-Click Call -->
          <td class="col-contact">
            <div class="contact-cell-wrap">
              <span class="officer-name" title="Primary Contact / Officer">${lead.officer || '—'}</span>
              <div class="phone-actions-row">
                ${cleanPhone ? `
                  <a href="tel:${cleanPhone}" class="tel-link" title="Call ${phone}" onclick="event.stopPropagation()">
                    ${renderIcon('phone-call', 12)}
                    <span>${phone}</span>
                  </a>
                  <button type="button" class="btn-copy-phone" data-copy-phone="${phone}" title="Copy phone number" onclick="event.stopPropagation()">
                    ${renderIcon('copy', 11)}
                  </button>
                ` : `<span class="no-phone">—</span>`}
              </div>
            </div>
          </td>

          <!-- Filing Date -->
          <td class="col-date">
            <span class="date-val monospace" title="FMCSA Register filing date">${lead.filing_date || '—'}</span>
          </td>

          <!-- Authority Scope -->
          <td class="col-categories">
            <div class="cat-pill-wrap">
              ${categories.length > 0 
                ? categories.map(c => `<span class="cat-pill" title="${c}">${c}</span>`).join('')
                : '<span class="cat-pill cat-none">Not specified</span>'}
            </div>
          </td>

          <!-- Action Dossier Trigger -->
          <td class="col-action" onclick="event.stopPropagation()">
            <button type="button" class="btn btn-ghost btn-xs dossier-btn" data-open-dossier="${lead.dot}" title="Open dossier">
              <span>Dossier</span>
              ${renderIcon('chevron-right', 12)}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (this.tbody) this.tbody.innerHTML = rowsHtml;
  }
}

function truncate(str, len = 20) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// =====================================================================
// Module: components/CarrierDossier.js
// =====================================================================
/**
 * R2D - Carrier Dossier Slide-Over Component
 * Developer: Bukhtyar Haider
 */


class CarrierDossierComponent {
  constructor(store) {
    this.store = store;
    this.drawer = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createDossierDOM();

    this.store.subscribe((state, event) => {
      if (event === 'dossierOpen') {
        this.renderCarrier(state.activeCarrier);
      } else if (event === 'dossierClose') {
        this.close();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.store.closeDossier();
      }
    });
  }

  createDossierDOM() {
    if (document.getElementById('carrier-dossier-drawer')) return;

    const overlay = document.createElement('div');
    overlay.id = 'carrier-dossier-overlay';
    overlay.className = 'dossier-overlay';
    overlay.addEventListener('click', () => this.store.closeDossier());

    const drawer = document.createElement('aside');
    drawer.id = 'carrier-dossier-drawer';
    drawer.className = 'dossier-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Carrier Dossier');

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    this.overlay = overlay;
    this.drawer = drawer;
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('open');
  }

  open() {
    if (this.drawer) this.drawer.classList.add('open');
    if (this.overlay) this.overlay.classList.add('open');
    document.body.classList.add('dossier-open');
  }

  close() {
    if (this.drawer) this.drawer.classList.remove('open');
    if (this.overlay) this.overlay.classList.remove('open');
    document.body.classList.remove('dossier-open');
  }

  renderCarrier(carrier) {
    if (!carrier || !this.drawer) return;

    const decRaw = (carrier.decision || 'unknown').toLowerCase();
    let decClass = 'emerald';
    let decIcon = 'truck';
    let decDisplay = 'Relevant';
    if (decRaw === 'review') { decClass = 'amber'; decIcon = 'alert-circle'; decDisplay = 'Review'; }
    if (decRaw === 'excluded') { decClass = 'rose'; decIcon = 'ban'; decDisplay = 'Excluded'; }

    const st = carrier._parsedState || '—';
    const city = carrier._parsedCity || '';
    const phone = carrier.phone || '—';
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${carrier.dot}`;
    const googleQuery = encodeURIComponent(`${carrier.name} USDOT ${carrier.dot} trucking`);
    const mapsQuery = encodeURIComponent(carrier.address || `${city}, ${st}`);

    const categories = Array.isArray(carrier.categories) ? carrier.categories : [];
    const flags = Array.isArray(carrier.flags) ? carrier.flags : [];

    this.drawer.innerHTML = `
      <div class="dossier-header">
        <div class="dossier-badge-row">
          <span class="dossier-decision-pill ${decClass}">
            ${renderIcon(decIcon, 13)}
            <span>${decDisplay}</span>
          </span>
          ${st !== '—' ? `<span class="state-pill state-${st}">${st}</span>` : ''}
          <span class="dossier-dot-badge">USDOT ${carrier.dot}</span>
        </div>
        <button type="button" class="dossier-close-btn" aria-label="Close Dossier">
          ${renderIcon('x', 18)}
        </button>
      </div>

      <div class="dossier-scroll-body">
        <div class="dossier-title-section">
          <h2 class="dossier-company-name">${carrier.name}</h2>
          <p class="dossier-location-sub">${carrier.address || 'Address on file with FMCSA'}</p>
        </div>

        <!-- Quick Dispatch Actions -->
        <div class="dossier-action-bar">
          ${cleanPhone ? `
            <a href="tel:${cleanPhone}" class="btn btn-primary btn-sm dossier-call-btn">
              ${renderIcon('phone-call', 14)}
              <span>Call Carrier</span>
            </a>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-val="${phone}" data-label="Phone number">
              ${renderIcon('copy', 13)}
              <span>Copy Phone</span>
            </button>
          ` : ''}
          <button type="button" class="btn btn-secondary btn-sm" data-copy-val="${carrier.dot}" data-label="USDOT">
            ${renderIcon('copy', 13)}
            <span>Copy DOT</span>
          </button>
          <a href="${saferUrl}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
            ${renderIcon('external-link', 13)}
            <span>SAFER Snapshot</span>
          </a>
          <a href="https://www.google.com/search?q=${googleQuery}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
            ${renderIcon('search', 13)}
            <span>Google Search</span>
          </a>
        </div>

        <!-- Section: Primary Contact -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('user', 14)}
            <span>Primary Contact & Address</span>
          </div>
          <div class="dossier-grid-2">
            <div>
              <span class="dossier-meta-label">Representative / Officer</span>
              <strong class="dossier-meta-val">${carrier.officer || '—'}</strong>
            </div>
            <div>
              <span class="dossier-meta-label">Direct Phone</span>
              <strong class="dossier-meta-val monospace">${phone}</strong>
            </div>
            <div style="grid-column: span 2;">
              <span class="dossier-meta-label">Filing Address</span>
              <div class="dossier-address-box">
                <span>${carrier.address || '—'}</span>
                <a href="https://maps.google.com/?q=${mapsQuery}" target="_blank" rel="noreferrer" class="maps-link">
                  ${renderIcon('map-pin', 12)}
                  <span>View Map</span>
                </a>
              </div>
            </div>
            <div>
              <span class="dossier-meta-label">Application Filing Date</span>
              <span class="dossier-meta-val monospace">${carrier.filing_date || '—'}</span>
            </div>
            <div>
              <span class="dossier-meta-label">Register Publication Date</span>
              <span class="dossier-meta-val monospace">${carrier.register_date || '—'}</span>
            </div>
          </div>
        </div>

        <!-- Section: Authority Evaluation -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('shield-check', 14)}
            <span>Authority & Prospect Assessment</span>
          </div>
          <div class="dossier-reason-box">
            <span class="reason-label">Classification Reason:</span>
            <p class="reason-text">${carrier.reason || 'General freight motor carrier application'}</p>
          </div>

          <div class="dossier-categories-wrap">
            <span class="dossier-meta-label">Applied Authority Categories:</span>
            <div class="category-tags-list">
              ${categories.map(c => `<span class="category-pill">${c}</span>`).join('')}
            </div>
          </div>

          ${flags.length > 0 ? `
            <div class="dossier-flags-wrap">
              <span class="dossier-meta-label">Operating Flags:</span>
              <div class="flag-tags-list">
                ${flags.map(f => `<span class="flag-pill">${renderIcon('alert-triangle', 11)} ${f}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Section: Multi-Register Filing History -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('folder-archive', 14)}
            <span>Register Occurrence History</span>
          </div>
          <div class="dossier-occurrences-summary">
            <span class="occurrences-count-badge">${carrier.occurrences || 1} Occurrences</span>
            <p class="occurrences-note">
              ${(carrier.occurrences || 1) > 1 
                ? 'Carrier filed in multiple daily registers. Latest filed contacts are prioritized.'
                : 'Carrier filed in a single FMCSA daily register batch.'}
            </p>
          </div>
        </div>

        <!-- Section: Register Evidence & Filings -->
        ${carrier.evidence && (Array.isArray(carrier.evidence) ? carrier.evidence.length > 0 : true) ? `
          <div class="dossier-card">
            <div class="dossier-card-title">
              ${renderIcon('file-text', 14)}
              <span>Filing Source Evidence (${Array.isArray(carrier.evidence) ? carrier.evidence.length : 1})</span>
            </div>
            <div class="evidence-items-list">
              ${renderEvidenceList(carrier.evidence)}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Bind close
    const closeBtn = this.drawer.querySelector('.dossier-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.store.closeDossier();
      });
    }

    // Bind copy buttons
    this.drawer.querySelectorAll('[data-copy-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-copy-val');
        const label = btn.getAttribute('data-label') || 'Item';
        if (val) {
          navigator.clipboard.writeText(val).then(() => {
            Toast.copy(`${label} copied to clipboard`);
          });
        }
      });
    });

    this.open();
  }
}

function renderEvidenceList(evidence) {
  if (!evidence) return '';
  const items = Array.isArray(evidence) ? evidence : [evidence];
  if (!items.length) return '';

  return items.map((ev, idx) => {
    if (typeof ev !== 'object' || ev === null) {
      return `<pre class="dossier-evidence-raw">${escapeHtml(ev)}</pre>`;
    }
    const source = escapeHtml(ev.source || 'Register PDF');
    const pages = Array.isArray(ev.pages) ? ev.pages.join(', ') : (ev.pages || '—');
    const cat = escapeHtml(ev.category || '—');
    const filing = escapeHtml(ev.filing_date || '—');

    return `
      <div class="evidence-item-card">
        <div class="evidence-item-header">
          <span class="evidence-source-tag">${renderIcon('file-text', 12)} ${source}</span>
          <span class="evidence-page-tag">Page ${pages}</span>
        </div>
        <div class="evidence-item-meta">
          <div class="evidence-field">
            <span class="evidence-label">Filing Date:</span>
            <span class="evidence-val monospace">${filing}</span>
          </div>
          <div class="evidence-field">
            <span class="evidence-label">Authority:</span>
            <span class="evidence-val">${cat}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'string' ? val : (typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// =====================================================================
// Module: components/BatchImporter.js
// =====================================================================
/**
 * R2D - Batch Importer & PDF Extractor Component
 * Developer: Bukhtyar Haider
 */


class BatchImporterComponent {
  constructor(store) {
    this.store = store;

    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('files');
    this.fileList = document.getElementById('file-list');
    this.extractBtn = document.getElementById('extract');
    this.cancelBtn = document.getElementById('cancel');

    this.progressArea = document.getElementById('progress-area');
    this.progressBar = document.getElementById('progress');
    this.progressFill = document.getElementById('progress-fill');
    this.progressPct = document.getElementById('progress-pct');
    this.progressText = document.getElementById('progress-text');
    this.progressHealth = document.getElementById('progress-health');
    this.feedback = document.getElementById('feedback');

    this.fileQueueBar = document.getElementById('file-queue-bar');
    this.queueCount = document.getElementById('queue-count');
    this.queueSize = document.getElementById('queue-size');
    this.clearQueueBtn = document.getElementById('clear-queue-btn');

    this.receiptCard = document.getElementById('import-receipt');
    this.receiptAdded = document.getElementById('receipt-added');
    this.receiptSkipped = document.getElementById('receipt-skipped');
    this.receiptDocs = document.getElementById('receipt-docs');
    this.receiptViewBtn = document.getElementById('receipt-view-prospects');
    this.importSummary = document.getElementById('import-summary');
    this.importFilesList = document.getElementById('import-files');

    this.stageUpload = document.getElementById('stage-upload');
    this.stageParse = document.getElementById('stage-parse');
    this.stageDedup = document.getElementById('stage-dedup');
    this.stageCommit = document.getElementById('stage-commit');

    this.selectedFiles = [];
    this.pollingTimer = null;

    this.init();
  }

  init() {
    if (this.dropzone && this.fileInput) {
      // Drag events
      ['dragenter', 'dragover'].forEach(name => {
        this.dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        this.dropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.dropzone.classList.remove('dragover');
        });
      });

      this.dropzone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files || []).filter(f => f.name.endsWith('.pdf'));
        this.addFiles(files);
      });

      this.fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        this.addFiles(files);
      });
    }

    if (this.clearQueueBtn) {
      this.clearQueueBtn.addEventListener('click', () => {
        this.selectedFiles = [];
        this.renderFileList();
      });
    }

    if (this.receiptViewBtn) {
      this.receiptViewBtn.addEventListener('click', () => {
        this.store.setState({ activeTab: 'prospects' }, 'tabChange');
      });
    }

    if (this.extractBtn) {
      this.extractBtn.addEventListener('click', () => this.startExtraction());
    }

    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.cancelExtraction());
    }
  }

  addFiles(files) {
    if (!files.length) return;
    const existing = new Set(this.selectedFiles.map(f => f.name));
    for (const f of files) {
      if (!existing.has(f.name)) {
        this.selectedFiles.push(f);
      }
    }
    this.renderFileList();
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.renderFileList();
  }

  renderFileList() {
    if (!this.fileList) return;
    this.fileList.innerHTML = '';

    if (this.selectedFiles.length === 0) {
      if (this.extractBtn) this.extractBtn.disabled = true;
      if (this.fileQueueBar) this.fileQueueBar.hidden = true;
      return;
    }

    if (this.extractBtn) this.extractBtn.disabled = false;
    if (this.fileQueueBar) this.fileQueueBar.hidden = false;

    // Calculate total size
    const totalBytes = this.selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

    if (this.queueCount) {
      this.queueCount.textContent = `${this.selectedFiles.length} file${this.selectedFiles.length === 1 ? '' : 's'} queued`;
    }
    if (this.queueSize) {
      this.queueSize.textContent = `${totalMb} MB total`;
    }

    this.selectedFiles.forEach((file, idx) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

      li.innerHTML = `
        <div class="file-item-info">
          <span class="file-item-icon">${renderIcon('file-text', 14)}</span>
          <span class="file-item-name">${file.name}</span>
          <span class="file-item-size">${sizeMb} MB</span>
          <span class="file-item-status">Ready</span>
        </div>
        <button type="button" class="file-item-remove" aria-label="Remove file" title="Remove ${file.name}">
          ${renderIcon('x', 13)}
        </button>
      `;

      li.querySelector('.file-item-remove').addEventListener('click', () => {
        this.removeFile(idx);
      });

      this.fileList.appendChild(li);
    });
  }

  updateProgressStages(pct) {
    if (this.progressBar) this.progressBar.value = pct;
    if (this.progressFill) this.progressFill.style.width = `${pct}%`;
    if (this.progressPct) this.progressPct.textContent = `${pct}%`;

    const setStage = (el, active, done) => {
      if (!el) return;
      el.classList.toggle('active', active);
      el.classList.toggle('done', done);
    };

    setStage(this.stageUpload, pct < 25, pct >= 25);
    setStage(this.stageParse, pct >= 25 && pct < 75, pct >= 75);
    setStage(this.stageDedup, pct >= 75 && pct < 95, pct >= 95);
    setStage(this.stageCommit, pct >= 95, pct >= 100);
  }

  async startExtraction() {
    if (!this.selectedFiles.length) return;

    this.extractBtn.disabled = true;
    if (this.cancelBtn) this.cancelBtn.hidden = false;
    if (this.progressArea) this.progressArea.hidden = false;
    this.updateProgressStages(5);
    if (this.progressText) this.progressText.textContent = 'Buffering register PDFs in local memory…';

    try {
      const res = await api.uploadBatch(this.selectedFiles, (loaded, total) => {
        const pct = Math.round((loaded / total) * 30);
        this.updateProgressStages(Math.max(5, pct));
      });

      this.store.setState({ activeJobId: res.id });
      this.pollJob(res.id);
    } catch (err) {
      this.onExtractionError(err.message);
    }
  }

  async pollJob(jobId) {
    clearTimeout(this.pollingTimer);

    try {
      const job = await api.fetchJob(jobId);
      this.store.setState({ activeJob: job });

      if (job.status === 'running') {
        const pages = job.pages || 1;
        const page = job.page || 0;
        const fileIdx = job.file_index || 1;
        const totalFiles = job.file_count || this.selectedFiles.length || 1;

        const filePct = (page / pages);
        const overall = Math.round(30 + (((fileIdx - 1) + filePct) / totalFiles) * 65);

        this.updateProgressStages(Math.min(95, overall));
        if (this.progressText) this.progressText.textContent = job.message || `Parsing register ${fileIdx} of ${totalFiles} (page ${page}/${pages})…`;
        if (this.progressHealth) this.progressHealth.textContent = `Elapsed: ${job.elapsed_seconds || 0}s · Local SQLite Engine Active`;

        this.pollingTimer = setTimeout(() => this.pollJob(jobId), 350);
      } else if (job.status === 'complete') {
        this.onExtractionComplete(job);
      } else if (job.status === 'cancelled') {
        this.onExtractionCancelled();
      } else {
        this.onExtractionError(job.message || 'Extraction failed');
      }
    } catch (err) {
      this.onExtractionError(err.message);
    }
  }

  async cancelExtraction() {
    const { activeJobId } = this.store.getState();
    if (!activeJobId) return;

    try {
      await api.cancelJob(activeJobId);
      Toast.info('Cancellation requested…');
    } catch (err) {
      Toast.warn(err.message || 'Cannot cancel at this stage');
    }
  }

  onExtractionComplete(job) {
    this.updateProgressStages(100);
    if (this.progressText) this.progressText.textContent = 'Extraction complete! Records saved to local database.';
    if (this.cancelBtn) this.cancelBtn.hidden = true;
    if (this.extractBtn) this.extractBtn.disabled = false;

    this.selectedFiles = [];
    this.renderFileList();

    Toast.success('FMCSA Register extraction complete!');
    this.renderReceipt(job);

    // Refresh history
    api.fetchHistory().then(data => {
      const res = data.result || {};
      const leads = res.leads || [];

      // Discover unique categories
      const catSet = new Set(res.categories || []);
      for (const lead of leads) {
        if (Array.isArray(lead.categories)) {
          for (const c of lead.categories) {
            if (c && typeof c === 'string' && c.trim()) catSet.add(c.trim());
          }
        }
      }
      const uniqueCategories = Array.from(catSet).sort((a, b) => a.localeCompare(b));

      this.store.setState({
        history: res,
        prospects: leads,
        categories: uniqueCategories,
        registers: res.documents || [],
        trash: res.trash || [],
        summary: res.summary || {}
      }, 'historyLoad');
      this.store.computeFilteredProspects();
    });
  }

  onExtractionCancelled() {
    if (this.progressArea) this.progressArea.hidden = true;
    if (this.cancelBtn) this.cancelBtn.hidden = true;
    if (this.extractBtn) this.extractBtn.disabled = false;
    Toast.warn('Extraction cancelled. Earlier records remain unchanged.');
  }

  onExtractionError(msg) {
    if (this.progressArea) this.progressArea.hidden = true;
    if (this.cancelBtn) this.cancelBtn.hidden = true;
    if (this.extractBtn) this.extractBtn.disabled = false;
    if (this.feedback) this.feedback.textContent = msg;
    Toast.error(msg);
  }

  renderReceipt(job) {
    if (!this.receiptCard) return;
    this.receiptCard.hidden = false;

    const imported = job.imported || {};
    const added = imported.added || 0;
    const skipped = imported.skipped || 0;
    const docs = imported.files?.length || 0;

    if (this.receiptAdded) this.receiptAdded.textContent = `+${added.toLocaleString()}`;
    if (this.receiptSkipped) this.receiptSkipped.textContent = skipped.toLocaleString();
    if (this.receiptDocs) this.receiptDocs.textContent = docs.toLocaleString();

    if (this.importSummary) {
      this.importSummary.textContent = `${added.toLocaleString()} new carrier prospect${added === 1 ? '' : 's'} imported. ${skipped.toLocaleString()} duplicate filings merged.`;
    }

    if (this.importFilesList && imported.files) {
      this.importFilesList.innerHTML = imported.files.map(f => `
        <li class="receipt-file-item">
          <strong>${f.name}</strong>: ${f.count || 0} carrier applications processed
        </li>
      `).join('');
    }
  }
}

// =====================================================================
// Module: components/ArchiveManager.js
// =====================================================================
/**
 * R2D - Archive & Trash Management Component
 * Developer: Bukhtyar Haider
 */


class ArchiveManagerComponent {
  constructor(store) {
    this.store = store;

    // Registers Library Elements
    this.docsContainer = document.getElementById('documents');
    this.selectAllDocsBox = document.getElementById('select-all-documents');
    this.deleteDocsBtn = document.getElementById('delete-documents');
    this.uploadDocsBtn = document.getElementById('registers-upload-btn');
    this.registerSummary = document.getElementById('register-summary');
    this.docSelectionCount = document.getElementById('document-selection-count');
    this.registerSearchInput = document.getElementById('register-search');
    this.registerSortSelect = document.getElementById('register-sort');
    this.clearDocSelectionBtn = document.getElementById('clear-doc-selection');

    // Register Metric Elements
    this.metricTotalRegisters = document.getElementById('reg-metric-total');
    this.metricTotalLeads = document.getElementById('reg-metric-leads');
    this.metricNewestDate = document.getElementById('reg-metric-newest');

    // Trash Elements
    this.trashListContainer = document.getElementById('trash-list');
    this.trashSearchInput = document.getElementById('trash-search');
    this.trashFeedback = document.getElementById('trash-feedback');
    this.trashMetricDots = document.getElementById('trash-metric-dots');
    this.trashMetricDocs = document.getElementById('trash-metric-docs');
    this.trashRestoreAllBtn = document.getElementById('trash-restore-all-btn');
    this.trashRefreshBtn = document.getElementById('trash-refresh-btn');
    this.trashFilterBtns = document.querySelectorAll('.trash-filter-btn');
    this.trashTabCountAll = document.getElementById('trash-tab-count-all');
    this.trashTabCountDots = document.getElementById('trash-tab-count-dots');
    this.trashTabCountDocs = document.getElementById('trash-tab-count-docs');
    this.trashSearchQuery = '';
    this.trashFilterType = 'all';

    // Deletion Modal
    this.deleteDialog = document.getElementById('delete-dialog');
    this.confirmDeleteBtn = document.getElementById('confirm-delete');
    this.cancelDeleteBtn = document.getElementById('cancel-delete');
    this.deleteError = document.getElementById('delete-error');

    // Floating Undo
    this.undoNotice = document.getElementById('undo-notice');
    this.undoMessage = document.getElementById('undo-message');
    this.undoBtn = document.getElementById('undo-delete');
    this.dismissUndoBtn = document.getElementById('dismiss-undo');
    this.lastDeletedId = null;

    if (this.undoNotice) {
      this.undoNotice.hidden = true;
      this.undoNotice.style.display = 'none';
    }

    this.registerSearchQuery = '';
    this.registerSortBy = 'newest';

    this.init();
  }

  init() {
    // Search registers
    if (this.registerSearchInput) {
      this.registerSearchInput.addEventListener('input', (e) => {
        this.registerSearchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderRegisters(this.store.getState());
      });
    }

    // Sort registers
    if (this.registerSortSelect) {
      this.registerSortSelect.addEventListener('change', (e) => {
        this.registerSortBy = e.target.value || 'newest';
        this.renderRegisters(this.store.getState());
      });
    }

    // Jump to Upload tab from Saved Registers
    if (this.uploadDocsBtn) {
      this.uploadDocsBtn.addEventListener('click', () => {
        this.store.setState({ activeTab: 'upload' }, 'tabChange');
      });
    }

    // Select all registers
    if (this.selectAllDocsBox) {
      this.selectAllDocsBox.addEventListener('change', (e) => {
        const { registers } = this.store.getState();
        const next = new Set();
        if (e.target.checked) {
          registers.forEach(d => next.add(d.id || d.name || d.filename));
        }
        this.store.setState({ selectedDocuments: next }, 'docSelectionChange');
      });
    }

    // Clear selection button
    if (this.clearDocSelectionBtn) {
      this.clearDocSelectionBtn.addEventListener('click', () => {
        this.store.setState({ selectedDocuments: new Set() }, 'docSelectionChange');
      });
    }

    // Delete selected registers button
    if (this.deleteDocsBtn) {
      this.deleteDocsBtn.addEventListener('click', () => {
        const { selectedDocuments } = this.store.getState();
        if (selectedDocuments.size === 0) return;
        this.openDocumentDeleteDialog(Array.from(selectedDocuments));
      });
    }

    // Confirm deletion in modal
    if (this.confirmDeleteBtn) {
      this.confirmDeleteBtn.addEventListener('click', () => {
        this.executeDeletion();
      });
    }

    // Undo action
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => {
        if (this.lastDeletedId) {
          this.restoreItem(this.lastDeletedId);
          if (this.undoNotice) {
            this.undoNotice.hidden = true;
            this.undoNotice.style.display = 'none';
          }
        }
      });
    }

    if (this.dismissUndoBtn) {
      this.dismissUndoBtn.addEventListener('click', () => {
        if (this.undoNotice) {
          this.undoNotice.hidden = true;
          this.undoNotice.style.display = 'none';
        }
      });
    }

    // Event delegation on document cards
    if (this.docsContainer) {
      this.docsContainer.addEventListener('click', (e) => {
        // Single delete button
        const delBtn = e.target.closest('[data-delete-doc]');
        if (delBtn) {
          e.stopPropagation();
          const docId = delBtn.getAttribute('data-delete-doc');
          this.openDocumentDeleteDialog([docId]);
          return;
        }

        // Filter prospects by register date/name
        const filterBtn = e.target.closest('[data-filter-register]');
        if (filterBtn) {
          e.stopPropagation();
          const registerQuery = filterBtn.getAttribute('data-filter-register');
          this.filterProspectsByRegister(registerQuery);
          return;
        }

        // Card checkbox click
        const checkbox = e.target.closest('.doc-checkbox');
        if (checkbox) {
          const docId = checkbox.getAttribute('data-doc-id');
          const next = new Set(this.store.getState().selectedDocuments);
          if (checkbox.checked) next.add(docId);
          else next.delete(docId);
          this.store.setState({ selectedDocuments: next }, 'docSelectionChange');
          return;
        }

        // Clicking card body toggles selection (unless clicking buttons/links)
        const card = e.target.closest('.document-card');
        if (card && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('input')) {
          const docId = card.getAttribute('data-doc-id');
          const next = new Set(this.store.getState().selectedDocuments);
          if (next.has(docId)) next.delete(docId);
          else next.add(docId);
          this.store.setState({ selectedDocuments: next }, 'docSelectionChange');
        }
      });
    }

    // Trash search
    if (this.trashSearchInput) {
      this.trashSearchInput.addEventListener('input', (e) => {
        this.trashSearchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderTrash(this.store.getState());
      });
    }

    // Trash filter pills
    this.trashFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-trash-filter') || 'all';
        this.trashFilterType = filter;
        this.trashFilterBtns.forEach(b => {
          const match = b.getAttribute('data-trash-filter') === filter;
          b.classList.toggle('active', match);
        });
        this.renderTrash(this.store.getState());
      });
    });

    // Trash Restore All button
    if (this.trashRestoreAllBtn) {
      this.trashRestoreAllBtn.addEventListener('click', () => {
        this.restoreAllTrash();
      });
    }

    // Trash Refresh button
    if (this.trashRefreshBtn) {
      this.trashRefreshBtn.addEventListener('click', () => {
        this.renderTrash(this.store.getState());
        Toast.info('Trash view refreshed');
      });
    }

    // Store sync
    this.store.subscribe((state, event) => {
      this.renderRegisters(state);
      this.renderTrash(state);
    });
  }

  async restoreAllTrash() {
    const trash = this.store.getState().trash || [];
    if (!trash.length) {
      Toast.info('Trash is already empty.');
      return;
    }
    if (!confirm(`Restore all ${trash.length.toLocaleString()} deleted item batch${trash.length === 1 ? '' : 'es'} back to active records?`)) {
      return;
    }

    let successCount = 0;
    for (const item of trash) {
      try {
        await api.restoreRecord(item.id);
        successCount++;
      } catch (err) {
        console.error('Failed to restore item:', item.id, err);
      }
    }

    try {
      const data = await api.fetchHistory();
      const res = data.result || {};
      const leads = res.leads || [];

      // Discover and sort all unique authority categories
      const catSet = new Set(res.categories || []);
      for (const lead of leads) {
        if (Array.isArray(lead.categories)) {
          for (const c of lead.categories) {
            if (c && typeof c === 'string' && c.trim()) catSet.add(c.trim());
          }
        }
      }
      const uniqueCategories = Array.from(catSet).sort((a, b) => a.localeCompare(b));

      this.store.setState({
        history: res,
        prospects: leads,
        categories: uniqueCategories,
        registers: res.documents || [],
        trash: res.trash || [],
        summary: res.summary || {}
      }, 'historyLoad');
      this.store.computeFilteredProspects();
      Toast.success(`Restored all ${successCount.toLocaleString()} deleted batches successfully!`);
    } catch (err) {
      Toast.error('Failed to reload database after restore');
    }
  }

  filterProspectsByRegister(query) {
    if (!query) return;
    this.store.setFilters({ search: query, view: 'relevant' });
    this.store.setState({ activeTab: 'prospects' }, 'tabChange');
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.value = query;
    Toast.info(`Showing carrier prospects matching "${query}"`);
  }

  renderRegisters(state) {
    if (!this.docsContainer) return;
    const rawRegisters = state.registers || [];
    const selected = state.selectedDocuments || new Set();

    // Compute metrics
    const totalCount = rawRegisters.length;
    let totalLeadsCount = 0;
    let newestDateStr = '—';

    rawRegisters.forEach(doc => {
      const c = doc.record_count || doc.records?.length || doc.records || doc.lead_count || 0;
      totalLeadsCount += Number(c) || 0;
      const d = doc.register_date || doc.date;
      if (d && (newestDateStr === '—' || d > newestDateStr)) {
        newestDateStr = d;
      }
    });

    if (this.metricTotalRegisters) this.metricTotalRegisters.textContent = totalCount.toLocaleString();
    if (this.metricTotalLeads) this.metricTotalLeads.textContent = totalLeadsCount.toLocaleString();
    if (this.metricNewestDate) this.metricNewestDate.textContent = newestDateStr;

    if (this.registerSummary) {
      this.registerSummary.textContent = `${totalCount.toLocaleString()} daily register bulletin${totalCount === 1 ? '' : 's'} archived · ${totalLeadsCount.toLocaleString()} carrier records deduplicated.`;
    }

    if (this.docSelectionCount) {
      this.docSelectionCount.textContent = selected.size > 0 ? `(${selected.size} selected)` : '';
    }

    if (this.clearDocSelectionBtn) {
      this.clearDocSelectionBtn.hidden = selected.size === 0;
    }

    if (this.deleteDocsBtn) {
      this.deleteDocsBtn.disabled = selected.size === 0;
      const delText = this.deleteDocsBtn.querySelector('span:last-child');
      if (delText) {
        delText.textContent = selected.size > 0 ? `Delete Selected (${selected.size})` : 'Delete selected registers';
      }
    }

    if (this.selectAllDocsBox) {
      this.selectAllDocsBox.checked = totalCount > 0 && selected.size === totalCount;
    }

    // Filter by search query
    let registers = rawRegisters;
    if (this.registerSearchQuery) {
      registers = registers.filter(d => {
        const name = (d.name || d.filename || '').toLowerCase();
        const date = (d.register_date || d.date || '').toLowerCase();
        return name.includes(this.registerSearchQuery) || date.includes(this.registerSearchQuery);
      });
    }

    // Sort
    registers = [...registers].sort((a, b) => {
      const dateA = a.register_date || a.date || '';
      const dateB = b.register_date || b.date || '';
      const nameA = a.name || a.filename || '';
      const nameB = b.name || b.filename || '';
      const countA = Number(a.record_count || a.records?.length || a.records || a.lead_count || 0);
      const countB = Number(b.record_count || b.records?.length || b.records || b.lead_count || 0);

      if (this.registerSortBy === 'newest') return dateB.localeCompare(dateA);
      if (this.registerSortBy === 'oldest') return dateA.localeCompare(dateB);
      if (this.registerSortBy === 'leads_high') return countB - countA;
      if (this.registerSortBy === 'leads_low') return countA - countB;
      if (this.registerSortBy === 'alpha') return nameA.localeCompare(nameB);
      return 0;
    });

    if (registers.length === 0) {
      if (rawRegisters.length === 0) {
        this.docsContainer.innerHTML = `
          <div class="empty-docs-box">
            <div class="empty-icon-circle">
              ${renderIcon('folder-archive', 36)}
            </div>
            <h3>No Saved Registers Yet</h3>
            <p>Upload daily FMCSA Register PDFs in the Upload tab to populate your carrier prospect database and view archived daily bulletins here.</p>
            <button type="button" class="btn btn-primary" onclick="document.querySelector('[data-tab=\\'upload\\']')?.click()">
              ${renderIcon('upload-cloud', 15)}
              <span>Upload Register PDFs</span>
            </button>
          </div>
        `;
      } else {
        this.docsContainer.innerHTML = `
          <div class="empty-docs-box">
            <div class="empty-icon-circle">
              ${renderIcon('search', 32)}
            </div>
            <h3>No Registers Found</h3>
            <p>No saved register bulletins match "<strong>${this.escapeHTML(this.registerSearchQuery)}</strong>".</p>
            <button type="button" class="btn btn-secondary btn-sm" id="reset-register-search">
              ${renderIcon('filter-x', 14)}
              <span>Clear search</span>
            </button>
          </div>
        `;
        const resetBtn = this.docsContainer.querySelector('#reset-register-search');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (this.registerSearchInput) this.registerSearchInput.value = '';
            this.registerSearchQuery = '';
            this.renderRegisters(this.store.getState());
          });
        }
      }
      return;
    }

    this.docsContainer.innerHTML = registers.map(doc => {
      const id = doc.id || doc.name || doc.filename;
      const name = doc.filename || doc.name || 'FMCSA Register PDF';
      const isSel = selected.has(id) || selected.has(name);
      const count = Number(doc.record_count || doc.records?.length || doc.records || doc.lead_count || 0);
      const date = doc.register_date || doc.date || 'Unspecified';
      const pages = doc.pages ? `${doc.pages} ${doc.pages === 1 ? 'page' : 'pages'}` : null;

      return `
        <div class="document-card ${isSel ? 'selected' : ''}" data-doc-id="${id}" tabindex="0" role="checkbox" aria-checked="${isSel}">
          <div class="document-card-top">
            <label class="custom-checkbox" onclick="event.stopPropagation()">
              <input type="checkbox" class="doc-checkbox" data-doc-id="${id}" ${isSel ? 'checked' : ''} aria-label="Select register ${name}">
              <span class="checkbox-mark"></span>
            </label>
            <div class="doc-card-top-badges">
              <span class="doc-file-tag">PDF</span>
              <button type="button" class="doc-action-delete" data-delete-doc="${id}" title="Delete this register bulletin" aria-label="Delete ${name}">
                ${renderIcon('trash-2', 13)}
              </button>
            </div>
          </div>
          <div class="document-card-body">
            <div class="doc-title-row">
              <span class="doc-icon-wrap">${renderIcon('file-text', 16)}</span>
              <h4 class="doc-title" title="${name}">${name}</h4>
            </div>
            <div class="doc-meta-row">
              <div class="doc-meta-chip" title="Filing / publication date">
                ${renderIcon('calendar', 12)}
                <span class="monospace">${date}</span>
              </div>
              <div class="doc-meta-chip leads" title="Total carriers extracted">
                ${renderIcon('truck', 12)}
                <strong>${count.toLocaleString()}</strong> carriers
              </div>
              ${pages ? `
                <div class="doc-meta-chip pages" title="Document pages">
                  ${renderIcon('layers', 12)}
                  <span>${pages}</span>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="document-card-actions">
            <button type="button" class="btn btn-secondary btn-xs filter-leads-btn" data-filter-register="${date !== 'Unspecified' ? date : name}" title="Show carriers from this register in Prospects">
              ${renderIcon('filter', 12)}
              <span>View Carriers</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderTrash(state) {
    if (!this.trashListContainer) return;
    const trash = state.trash || [];

    // Calculate HUD Metrics
    let deletedDotsCount = 0;
    let deletedDocsCount = 0;
    for (const item of trash) {
      const count = item.targets?.length || item.count || 1;
      if (item.kind === 'dots') deletedDotsCount += count;
      else if (item.kind === 'documents') deletedDocsCount += count;
    }

    if (this.trashMetricDots) this.trashMetricDots.textContent = deletedDotsCount.toLocaleString();
    if (this.trashMetricDocs) this.trashMetricDocs.textContent = deletedDocsCount.toLocaleString();

    // Tab Counts
    if (this.trashTabCountAll) this.trashTabCountAll.textContent = trash.length.toLocaleString();
    if (this.trashTabCountDots) this.trashTabCountDots.textContent = trash.filter(t => t.kind === 'dots').length.toLocaleString();
    if (this.trashTabCountDocs) this.trashTabCountDocs.textContent = trash.filter(t => t.kind === 'documents').length.toLocaleString();

    // Filter by type
    let filtered = trash;
    if (this.trashFilterType === 'dots') {
      filtered = filtered.filter(t => t.kind === 'dots');
    } else if (this.trashFilterType === 'documents') {
      filtered = filtered.filter(t => t.kind === 'documents');
    }

    // Filter by search query
    const query = this.trashSearchQuery || '';
    if (query) {
      filtered = filtered.filter(item => {
        const hay = `${item.title || item.label || ''} ${item.kind || ''} ${(item.targets || []).join(' ')}`.toLowerCase();
        return hay.includes(query);
      });
    }

    if (filtered.length === 0) {
      const isSearchActive = Boolean(query || this.trashFilterType !== 'all');
      this.trashListContainer.innerHTML = `
        <div class="empty-trash-box">
          <div class="empty-icon-circle">
            ${renderIcon(isSearchActive ? 'filter-x' : 'shield-check', 36)}
          </div>
          <h3>${isSearchActive ? 'No Deleted Items Match Active Filters' : 'Trash is Clean & Empty'}</h3>
          <p>${isSearchActive 
            ? 'Try resetting your search query or switching to All Trash to view more deletions.' 
            : 'All deduplicated FMCSA carrier prospects and daily register PDFs are currently active in your local database.'}</p>
          <div class="empty-trash-actions">
            ${isSearchActive ? `
              <button type="button" class="btn btn-secondary btn-sm" id="reset-trash-filters-btn">
                <span>Reset Filters</span>
              </button>
            ` : `
              <button type="button" class="btn btn-primary btn-sm" id="empty-trash-go-prospects">
                <span>Explore Prospects</span>
                ${renderIcon('arrow-right', 13)}
              </button>
            `}
          </div>
        </div>
      `;

      const resetBtn = document.getElementById('reset-trash-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.trashSearchQuery = '';
          if (this.trashSearchInput) this.trashSearchInput.value = '';
          this.trashFilterType = 'all';
          this.trashFilterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-trash-filter') === 'all'));
          this.renderTrash(this.store.getState());
        });
      }

      const goProspectsBtn = document.getElementById('empty-trash-go-prospects');
      if (goProspectsBtn) {
        goProspectsBtn.addEventListener('click', () => {
          this.store.setState({ activeTab: 'prospects' }, 'tabChange');
        });
      }
      return;
    }

    this.trashListContainer.innerHTML = filtered.map(item => {
      const id = item.id;
      const title = this.escapeHTML(item.title || item.label || `Deleted ${item.kind || 'items'}`);
      const time = item.deleted_at ? new Date(item.deleted_at * 1000).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'Recently';
      const count = item.targets?.length || item.count || 0;
      const isDoc = item.kind === 'documents';
      const targets = Array.isArray(item.targets) ? item.targets : [];

      return `
        <div class="trash-card ${isDoc ? 'trash-doc' : 'trash-lead'}">
          <div class="trash-card-left">
            <div class="trash-card-icon-box ${isDoc ? 'doc' : 'carrier'}">
              ${renderIcon(isDoc ? 'folder-archive' : (count > 1 ? 'layers' : 'truck'), 18)}
            </div>
            <div class="trash-card-details">
              <div class="trash-card-title-row">
                <span class="trash-card-badge ${isDoc ? 'badge-doc' : 'badge-lead'}">
                  ${isDoc ? 'REGISTER ARCHIVE' : (count > 1 ? 'BATCH CARRIERS' : 'CARRIER PROSPECT')}
                </span>
                <strong class="trash-card-title">${title}</strong>
              </div>
              <div class="trash-card-meta-row">
                <span class="trash-card-meta-item">
                  ${renderIcon('clock', 12)}
                  <span>Deleted ${time}</span>
                </span>
                <span class="trash-card-meta-dot">·</span>
                <span class="trash-card-meta-item">
                  ${renderIcon('hash', 12)}
                  <span>${count.toLocaleString()} ${isDoc ? (count === 1 ? 'register' : 'registers') : (count === 1 ? 'carrier' : 'carriers')} affected</span>
                </span>
              </div>
              ${targets.length > 1 && !isDoc ? `
                <div class="trash-targets-preview">
                  ${targets.slice(0, 6).map(t => `<span class="target-tag monospace">USDOT ${t}</span>`).join('')}
                  ${targets.length > 6 ? `<span class="target-more">+${(targets.length - 6).toLocaleString()} more</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="trash-card-actions">
            <button type="button" class="btn btn-secondary btn-sm restore-item-btn" data-restore-id="${id}" title="Re-instate these records back to active database">
              ${renderIcon('rotate-ccw', 13)}
              <span>Restore Records</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind restore buttons
    this.trashListContainer.querySelectorAll('.restore-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-restore-id');
        this.restoreItem(id);
      });
    });
  }

  openDocumentDeleteDialog(docKeys) {
    if (!this.deleteDialog) return;
    const desc = document.getElementById('delete-description');
    const preview = document.getElementById('delete-preview');
    const registers = this.store.getState().registers || [];

    // Map targets to exact document IDs and filenames
    const resolvedDocs = docKeys.map(k => {
      return registers.find(d => d.id === k || d.name === k || d.filename === k) || { id: k, filename: k };
    });

    const targetIds = resolvedDocs.map(d => d.id);
    const targetNames = resolvedDocs.map(d => d.filename || d.name || d.id);

    this._pendingDeletionKind = 'documents';
    this._pendingDeletionTargets = targetIds;

    if (desc) {
      desc.textContent = `You are about to delete ${targetNames.length.toLocaleString()} saved FMCSA register PDF${targetNames.length === 1 ? '' : 's'}. Any USDOT supported by another active register remains in your prospect list.`;
    }

    if (preview) {
      preview.innerHTML = targetNames.slice(0, 4).map(n => `<span class="preview-dot">${n}</span>`).join(' ') +
        (targetNames.length > 4 ? ` <span class="preview-more">+${(targetNames.length - 4).toLocaleString()} more</span>` : '');
    }

    this.deleteDialog.showModal();
  }

  async executeDeletion() {
    let kind = this._pendingDeletionKind;
    let targets = this._pendingDeletionTargets;

    if (!kind) {
      // Default to selected dots
      const { selectedDots } = this.store.getState();
      kind = 'dots';
      targets = Array.from(selectedDots);
    }

    if (!targets || !targets.length) return;

    this.confirmDeleteBtn.disabled = true;
    if (this.deleteError) this.deleteError.textContent = '';

    try {
      const res = await api.deleteRecords(kind, targets);
      this.deleteDialog.close();

      // Show persistent floating undo notice
      const deletedEntry = res.result?.trash?.[0];
      if (deletedEntry) {
        this.lastDeletedId = deletedEntry.id;
        if (this.undoNotice && this.undoMessage) {
          this.undoMessage.textContent = `Moved ${targets.length.toLocaleString()} ${kind === 'dots' ? 'carrier' : 'register'}${targets.length === 1 ? '' : 's'} to Trash.`;
          this.undoNotice.hidden = false;
          this.undoNotice.style.display = 'flex';
        }
      }

      Toast.success(`Moved ${targets.length.toLocaleString()} ${kind === 'dots' ? 'carrier' : 'register'}${targets.length === 1 ? '' : 's'} to Trash.`);

      // Discover and sort all unique authority categories
      const catSet = new Set(res.result?.categories || []);
      for (const lead of (res.result?.leads || [])) {
        if (Array.isArray(lead.categories)) {
          for (const c of lead.categories) {
            if (c && typeof c === 'string' && c.trim()) catSet.add(c.trim());
          }
        }
      }
      const uniqueCategories = Array.from(catSet).sort((a, b) => a.localeCompare(b));

      // Clear selections & update store
      this.store.clearSelection();
      this.store.setState({
        selectedDocuments: new Set(),
        history: res.result,
        prospects: res.result?.leads || [],
        categories: uniqueCategories,
        registers: res.result?.documents || [],
        trash: res.result?.trash || [],
        summary: res.result?.summary || {}
      }, 'historyLoad');
      this.store.computeFilteredProspects();
    } catch (err) {
      if (this.deleteError) this.deleteError.textContent = err.message || 'Deletion failed';
      Toast.error(err.message || 'Deletion failed');
    } finally {
      this.confirmDeleteBtn.disabled = false;
      this._pendingDeletionKind = null;
      this._pendingDeletionTargets = null;
    }
  }

  async restoreItem(deletionId) {
    try {
      const res = await api.restoreRecord(deletionId);
      Toast.success('Records restored successfully!');

      if (this.undoNotice) {
        this.undoNotice.hidden = true;
        this.undoNotice.style.display = 'none';
      }

      // Discover and sort all unique authority categories
      const catSet = new Set(res.result?.categories || []);
      for (const lead of (res.result?.leads || [])) {
        if (Array.isArray(lead.categories)) {
          for (const c of lead.categories) {
            if (c && typeof c === 'string' && c.trim()) catSet.add(c.trim());
          }
        }
      }
      const uniqueCategories = Array.from(catSet).sort((a, b) => a.localeCompare(b));

      this.store.setState({
        history: res.result,
        prospects: res.result?.leads || [],
        categories: uniqueCategories,
        registers: res.result?.documents || [],
        trash: res.result?.trash || [],
        summary: res.result?.summary || {}
      }, 'historyLoad');
      this.store.computeFilteredProspects();
    } catch (err) {
      Toast.error(err.message || 'Restore failed');
    }
  }
}

// =====================================================================
// Module: components/Guide.js
// =====================================================================
/**
 * R2D - Dispatch & Compliance Guide Component
 * Developer: Bukhtyar Haider
 */


class GuideComponent {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('tab-guide');
    this.filterButtons = document.querySelectorAll('.guide-filter-btn');
    this.searchInput = document.getElementById('guide-search');
    this.cards = document.querySelectorAll('.guide-card');
    this.activeFilter = 'all';

    this.init();
  }

  init() {
    // Topic filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-guide-filter') || 'all';
        this.applyFilters();
      });
    });

    // Real-time guide search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.applyFilters();
      });
    }

    // Jump to Prospects or Upload from Guide tips
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        const jumpTab = e.target.closest('[data-jump-tab]');
        if (jumpTab) {
          const tab = jumpTab.getAttribute('data-jump-tab');
          this.store.setState({ activeTab: tab }, 'tabChange');
        }
      });
    }
  }

  applyFilters() {
    const query = (this.searchInput?.value || '').trim().toLowerCase();

    this.cards.forEach(card => {
      const category = card.getAttribute('data-category') || 'general';
      const text = card.textContent.toLowerCase();

      const matchesFilter = this.activeFilter === 'all' || category === this.activeFilter;
      const matchesSearch = !query || text.includes(query);

      if (matchesFilter && matchesSearch) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

// =====================================================================
// Module: components/ShortcutsModal.js
// =====================================================================
/**
 * R2D - Shortcuts Modal Component
 * Developer: Bukhtyar Haider
 */


class ShortcutsModalComponent {
  constructor(store) {
    this.store = store;
    this.dialog = document.getElementById('shortcuts-dialog');
    this.closeBtn = document.getElementById('close-shortcuts');
    this.init();
  }

  init() {
    if (this.closeBtn && this.dialog) {
      this.closeBtn.addEventListener('click', () => {
        this.dialog.close();
      });
    }
  }

  open() {
    if (this.dialog && typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();
    }
  }

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
    }
  }
}

// =====================================================================
// Module: main.js
// =====================================================================
/**
 * R2D - Register to Dot · Main Application Bootstrapper
 * Developer: Bukhtyar Haider
 * Architecture: Modular Component & Reactive Store System
 */



class App {
  constructor() {
    this.store = new Store();
    this.components = {};
    this.pollingTimer = null;
  }

  async start() {
    // 1. Initial Icon replacement for static markup
    replaceIcons(document);

    // 2. Initialize components
    this.components.header = new HeaderComponent(this.store);
    this.components.statsHUD = new StatsHUDComponent(this.store);
    this.components.filterBar = new FilterBarComponent(this.store);
    this.components.table = new ProspectsTableComponent(this.store);
    this.components.dossier = new CarrierDossierComponent(this.store);
    this.components.importer = new BatchImporterComponent(this.store);
    this.components.archive = new ArchiveManagerComponent(this.store);
    this.components.guide = new GuideComponent(this.store);
    this.components.shortcuts = new ShortcutsModalComponent(this.store);

    // 3. Register global keyboard listeners
    this.setupGlobalKeyboardShortcuts();

    // 4. Load session & history
    await this.loadInitialData();

    // 5. Start revision polling
    this.startActivityPolling();

    // 6. Hook up navigation buttons inside empty states
    const emptyOpenUpload = document.getElementById('empty-open-upload');
    if (emptyOpenUpload) {
      emptyOpenUpload.addEventListener('click', () => {
        this.components.header.selectTab('upload');
      });
    }

    const emptyOpenTrash = document.getElementById('empty-open-trash');
    if (emptyOpenTrash) {
      emptyOpenTrash.addEventListener('click', () => {
        this.components.header.selectTab('trash');
      });
    }

    const openTrashBtn = document.getElementById('open-trash');
    if (openTrashBtn) {
      openTrashBtn.addEventListener('click', () => {
        this.components.header.selectTab('trash');
      });
    }

    const refreshHistoryBtn = document.getElementById('refresh-history');
    if (refreshHistoryBtn) {
      refreshHistoryBtn.addEventListener('click', () => {
        this.loadHistory(true);
      });
    }
  }

  async loadInitialData() {
    const syncStatus = document.getElementById('sync-status');
    const librarySummary = document.getElementById('library-summary');

    if (syncStatus) syncStatus.textContent = 'Connecting to local SQLite database…';

    try {
      await api.getSessionToken();
      await this.loadHistory(false);
      if (syncStatus) syncStatus.textContent = 'Synchronized with local storage';
    } catch (err) {
      console.error('[App] Failed to load data:', err);
      if (syncStatus) syncStatus.textContent = 'Storage connection error';
      if (librarySummary) librarySummary.textContent = err.message || 'Check local server status';
      Toast.error('Could not connect to local database');
    }
  }

  async loadHistory(notify = false) {
    try {
      const data = await api.fetchHistory();
      const res = data.result || {};
      const leads = res.leads || [];

      // Pre-process location and search indexing for 60fps performance
      for (const lead of leads) {
        if (!lead._parsedState) {
          const loc = parseLocation(lead.address);
          lead._parsedState = loc.state;
          lead._parsedCity = loc.city;
          lead._parsedCountry = loc.country;
          lead._searchHaystack = [
            lead.dot,
            lead.name,
            lead.phone,
            lead.officer,
            lead.address,
            lead._parsedState,
            lead._parsedCity,
            ...(lead.categories || []),
            lead.reason,
            lead.filing_date,
            lead.register_date
          ].filter(Boolean).join(' ').toLowerCase();
        }
      }

      // Discover and sort all unique authority categories across all leads
      const categorySet = new Set(res.categories || []);
      for (const lead of leads) {
        if (Array.isArray(lead.categories)) {
          for (const c of lead.categories) {
            if (c && typeof c === 'string' && c.trim()) {
              categorySet.add(c.trim());
            }
          }
        }
      }
      const uniqueCategories = Array.from(categorySet).sort((a, b) => a.localeCompare(b));

      this.store.setState({
        history: res,
        revision: data.revision,
        prospects: leads,
        categories: uniqueCategories,
        registers: res.documents || [],
        trash: res.trash || [],
        summary: res.summary || {}
      }, 'historyLoad');

      this.store.computeFilteredProspects();
      this.store.notify('stateChange');

      const librarySummary = document.getElementById('library-summary');
      if (librarySummary) {
        const total = (res.summary?.total_leads || leads.length).toLocaleString();
        const docs = (res.summary?.documents_saved || res.documents?.length || 0).toLocaleString();
        librarySummary.textContent = `${total} unique carrier prospects deduplicated across ${docs} daily register PDFs.`;
      }

      if (notify) {
        Toast.success('Records refreshed from local database');
      }
    } catch (err) {
      console.error('[App] History load error:', err);
      throw err;
    }
  }

  startActivityPolling() {
    const poll = async () => {
      try {
        const activity = await api.fetchActivity();
        const curRev = this.store.getState().revision;

        // If another tab or process updated the database, reload
        if (curRev && activity.revision && curRev !== activity.revision) {
          await this.loadHistory(false);
        }

        // If there's an active job running in background
        if (activity.active_job) {
          const { activeJobId } = this.store.getState();
          if (!activeJobId) {
            this.store.setState({ activeJobId: activity.active_job });
            this.components.importer.pollJob(activity.active_job);
          }
        }
      } catch (err) {
        // Silently tolerate transient local connection blips
      } finally {
        this.pollingTimer = setTimeout(poll, 2500);
      }
    };

    this.pollingTimer = setTimeout(poll, 2000);
  }

  setupGlobalKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // 1. Esc: Close modals, close dossier, or clear search
      if (e.key === 'Escape') {
        const shortcutsDialog = document.getElementById('shortcuts-dialog');
        if (shortcutsDialog && shortcutsDialog.open) {
          shortcutsDialog.close();
          return;
        }

        const deleteDialog = document.getElementById('delete-dialog');
        if (deleteDialog && deleteDialog.open) {
          deleteDialog.close();
          return;
        }

        if (this.components.dossier.isOpen()) {
          this.store.closeDossier();
          return;
        }

        if (isInput) {
          document.activeElement.blur();
          return;
        }
      }

      // If typing inside an input, don't trigger command keys
      if (isInput) return;

      // 2. / : Focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search');
        if (searchInput) {
          this.components.header.selectTab('prospects');
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 3. ? : Open shortcuts field manual
      if (e.key === '?') {
        e.preventDefault();
        this.components.shortcuts.open();
        return;
      }

      // 4. Number keys 1, 2, 3, 4 : Quick View Switcher
      if (e.key === '1') {
        e.preventDefault();
        this.components.header.selectTab('prospects');
        this.store.setFilters({ view: 'relevant' });
        Toast.info('Switched to Relevant Prospects');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        this.components.header.selectTab('prospects');
        this.store.setFilters({ view: 'review' });
        Toast.info('Switched to Review Group');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        this.components.header.selectTab('prospects');
        this.store.setFilters({ view: 'excluded' });
        Toast.info('Switched to Excluded Group');
        return;
      }
      if (e.key === '4') {
        e.preventDefault();
        this.components.header.selectTab('prospects');
        this.store.setFilters({ view: 'all' });
        Toast.info('Viewing All Records');
        return;
      }

      // 5. J / K : Pagination Next / Prev
      if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const { page } = this.store.getState();
        this.store.setPage(page + 1);
        return;
      }
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const { page } = this.store.getState();
        this.store.setPage(page - 1);
        return;
      }
    });
  }
}

// Auto-boot on DOMContentLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.__R2D_APP__ = new App();
    window.__R2D_APP__.start();
  });
}


})();
