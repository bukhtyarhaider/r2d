/**
 * R2D - Register to Dot · Reactive State Store
 * Developer: Bukhtyar Haider
 */

export class Store {
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
