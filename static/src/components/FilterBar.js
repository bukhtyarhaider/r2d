/**
 * R2D - FilterBar & Selection Command Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';
import { TOP_DISPATCH_STATES } from '../core/location.js';
import { exportCSV, exportDOTs, exportAuditJSON } from '../core/export.js';
import { Toast } from './Toast.js';

export class FilterBarComponent {
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

    // 4. Populate category options if empty
    if (this.categorySelect && this.categorySelect.children.length <= 1 && state.categories?.length) {
      const frag = document.createDocumentFragment();
      for (const cat of state.categories) {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        frag.appendChild(opt);
      }
      this.categorySelect.appendChild(frag);
    }

    // 5. Selection bar update
    const selCount = state.selectedDots.size;
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
