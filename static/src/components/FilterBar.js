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

    // Authority Scope Multi-Select
    this.authorityMultiselect = document.getElementById('authority-multiselect');
    this.authorityTrigger = document.getElementById('authority-trigger');
    this.authorityTriggerText = document.getElementById('authority-trigger-text');
    this.authorityTriggerBadge = document.getElementById('authority-trigger-badge');
    this.authorityDropdown = document.getElementById('authority-dropdown');
    this.authoritySearchInput = document.getElementById('authority-search-input');
    this.authoritySelectAllBtn = document.getElementById('authority-select-all');
    this.authorityClearAllBtn = document.getElementById('authority-clear-all');
    this.authorityOptionsList = document.getElementById('authority-options-list');
    this.authorityCountSummary = document.getElementById('authority-count-summary');
    this.authorityApplyBtn = document.getElementById('authority-apply-btn');
    this.authoritySearchQuery = '';

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
    this.initAuthorityMultiselect();

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
    if (this.authoritySearchInput) this.authoritySearchInput.value = '';
    this.authoritySearchQuery = '';

    this.store.setFilters({
      search: '',
      selectedState: '',
      category: '',
      selectedCategories: [],
      country: '',
      movers: true,
      view: 'relevant'
    });
    this.renderStateChips();
    this.closeAuthorityDropdown();
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

    // 4. Update multi-select Authority Scopes
    this.syncAuthorityScopes(state);

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

  initAuthorityMultiselect() {
    if (!this.authorityMultiselect) return;

    if (this.authorityTrigger) {
      this.authorityTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.authorityDropdown && !this.authorityDropdown.hidden) {
          this.closeAuthorityDropdown();
        } else {
          this.openAuthorityDropdown();
        }
      });
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.authorityMultiselect && !this.authorityMultiselect.contains(e.target)) {
        this.closeAuthorityDropdown();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.authorityDropdown && !this.authorityDropdown.hidden) {
        this.closeAuthorityDropdown();
        if (this.authorityTrigger) this.authorityTrigger.focus();
      }
    });

    // Search input
    if (this.authoritySearchInput) {
      this.authoritySearchInput.addEventListener('input', (e) => {
        this.authoritySearchQuery = (e.target.value || '').trim().toLowerCase();
        this.filterAuthorityOptions();
      });
    }

    // Select All
    if (this.authoritySelectAllBtn) {
      this.authoritySelectAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const { categories } = this.store.getState();
        const all = (categories || []).slice();
        this.store.setFilters({ selectedCategories: all });
      });
    }

    // Clear All
    if (this.authorityClearAllBtn) {
      this.authorityClearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.store.setFilters({ selectedCategories: [] });
      });
    }

    // Option checkbox toggle (event delegation)
    if (this.authorityOptionsList) {
      this.authorityOptionsList.addEventListener('change', (e) => {
        const cb = e.target.closest('.multiselect-checkbox');
        if (!cb) return;
        const cat = cb.value;
        const { selectedCategories } = this.store.getState();
        const set = new Set(selectedCategories || []);
        if (cb.checked) {
          set.add(cat);
        } else {
          set.delete(cat);
        }
        this.store.setFilters({ selectedCategories: Array.from(set) });
      });
    }

    // Done button
    if (this.authorityApplyBtn) {
      this.authorityApplyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeAuthorityDropdown();
      });
    }
  }

  openAuthorityDropdown() {
    if (!this.authorityDropdown) return;
    this.authorityDropdown.hidden = false;
    if (this.authorityTrigger) {
      this.authorityTrigger.setAttribute('aria-expanded', 'true');
      this.authorityTrigger.classList.add('active');
    }
    if (this.authoritySearchInput) {
      this.authoritySearchInput.focus();
    }
    this.syncFilterDeckHeight();
  }

  closeAuthorityDropdown() {
    if (!this.authorityDropdown || this.authorityDropdown.hidden) return;
    this.authorityDropdown.hidden = true;
    if (this.authorityTrigger) {
      this.authorityTrigger.setAttribute('aria-expanded', 'false');
      this.authorityTrigger.classList.remove('active');
    }
    this.syncFilterDeckHeight();
  }

  filterAuthorityOptions() {
    if (!this.authorityOptionsList) return;
    const query = this.authoritySearchQuery;
    const items = this.authorityOptionsList.querySelectorAll('.multiselect-option');
    let visibleCount = 0;
    items.forEach(item => {
      const cat = (item.getAttribute('data-category') || '').toLowerCase();
      const match = !query || cat.includes(query);
      item.hidden = !match;
      item.style.display = match ? 'flex' : 'none';
      if (match) visibleCount++;
    });

    const emptyMsg = this.authorityOptionsList.querySelector('.multiselect-search-empty');
    if (visibleCount === 0) {
      if (!emptyMsg) {
        const div = document.createElement('div');
        div.className = 'multiselect-search-empty';
        div.textContent = `No authority scopes matching "${this.authoritySearchInput?.value || ''}"`;
        this.authorityOptionsList.appendChild(div);
      }
    } else if (emptyMsg) {
      emptyMsg.remove();
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  syncAuthorityScopes(state) {
    const categories = state.categories || [];
    const selectedCats = Array.isArray(state.selectedCategories) ? state.selectedCategories : [];
    const selectedSet = new Set(selectedCats);

    // Compute carrier frequency for each category
    const counts = new Map();
    for (const p of state.prospects || []) {
      if (Array.isArray(p.categories)) {
        for (const c of p.categories) {
          const norm = (c || '').trim();
          counts.set(norm, (counts.get(norm) || 0) + 1);
        }
      }
    }

    // Render options list
    if (this.authorityOptionsList) {
      if (categories.length === 0) {
        this.authorityOptionsList.innerHTML = `
          <div class="multiselect-empty">
            <span>No authority scopes detected. Upload daily register PDFs to populate.</span>
          </div>
        `;
      } else {
        this.authorityOptionsList.innerHTML = categories.map(cat => {
          const isChecked = selectedSet.has(cat);
          const count = counts.get(cat) || 0;
          const escaped = this.escapeHtml(cat);
          return `
            <label class="multiselect-option ${isChecked ? 'selected' : ''}" data-category="${escaped.toLowerCase()}">
              <span class="custom-checkbox">
                <input type="checkbox" class="multiselect-checkbox" value="${escaped}" ${isChecked ? 'checked' : ''} aria-label="${escaped}">
                <span class="checkbox-mark"></span>
              </span>
              <span class="option-text" title="${escaped}">${escaped}</span>
              <span class="option-carrier-count monospace" title="${count.toLocaleString()} carriers with this authority">${count.toLocaleString()}</span>
            </label>
          `;
        }).join('');
        this.filterAuthorityOptions();
      }
    }

    // Update count summary in dropdown footer
    if (this.authorityCountSummary) {
      if (selectedCats.length === 0) {
        this.authorityCountSummary.textContent = categories.length > 0 
          ? `All ${categories.length} authority scopes active`
          : 'All authority scopes active';
      } else if (selectedCats.length === categories.length && categories.length > 0) {
        this.authorityCountSummary.textContent = `All ${categories.length} authority scopes selected`;
      } else {
        this.authorityCountSummary.textContent = `${selectedCats.length} of ${categories.length} selected`;
      }
    }

    // Update trigger button
    if (this.authorityTriggerText) {
      if (selectedCats.length === 0 || (selectedCats.length === categories.length && categories.length > 0)) {
        this.authorityTriggerText.textContent = 'All authority scopes';
        if (this.authorityTrigger) this.authorityTrigger.title = 'Filtering by all authority scopes (no restriction)';
      } else if (selectedCats.length === 1) {
        const name = selectedCats[0];
        this.authorityTriggerText.textContent = name.length > 30 ? `${name.substring(0, 28)}…` : name;
        if (this.authorityTrigger) this.authorityTrigger.title = `Filtered by: ${name}`;
      } else {
        this.authorityTriggerText.textContent = `${selectedCats.length} scopes selected`;
        if (this.authorityTrigger) this.authorityTrigger.title = `Filtered by ${selectedCats.length} scopes: ${selectedCats.join(', ')}`;
      }
    }

    if (this.authorityTriggerBadge) {
      const showBadge = selectedCats.length > 0 && selectedCats.length < categories.length;
      this.authorityTriggerBadge.hidden = !showBadge;
      if (showBadge) {
        this.authorityTriggerBadge.textContent = selectedCats.length.toLocaleString();
      }
    }

    // Keep hidden <select id="category"> in sync for backward compatibility
    if (this.categorySelect) {
      this.categorySelect.innerHTML = categories.map(cat => {
        const isSelected = selectedSet.has(cat);
        const escaped = this.escapeHtml(cat);
        return `<option value="${escaped}" ${isSelected ? 'selected' : ''}>${escaped}</option>`;
      }).join('');
    }
  }
}
