/**
 * R2D - Register to Dot · Main Application Bootstrapper
 * Developer: Bukhtyar Haider
 * Architecture: Modular Component & Reactive Store System
 */

import { Store } from './core/store.js';
import { api } from './core/api.js';
import { parseLocation } from './core/location.js';
import { replaceIcons } from './core/icons.js';
import { Toast } from './components/Toast.js';

import { HeaderComponent } from './components/Header.js';
import { StatsHUDComponent } from './components/StatsHUD.js';
import { FilterBarComponent } from './components/FilterBar.js';
import { ProspectsTableComponent } from './components/ProspectsTable.js';
import { CarrierDossierComponent } from './components/CarrierDossier.js';
import { BatchImporterComponent } from './components/BatchImporter.js';
import { ArchiveManagerComponent } from './components/ArchiveManager.js';
import { GuideComponent } from './components/Guide.js';
import { ShortcutsModalComponent } from './components/ShortcutsModal.js';

export class App {
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

      this.store.setState({
        history: res,
        revision: data.revision,
        prospects: leads,
        categories: res.categories || [],
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
