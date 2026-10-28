/**
 * R2D - Archive & Trash Management Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';
import { api } from '../core/api.js';
import { Toast } from './Toast.js';

export class ArchiveManagerComponent {
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
          if (this.undoNotice) this.undoNotice.hidden = true;
        }
      });
    }

    if (this.dismissUndoBtn) {
      this.dismissUndoBtn.addEventListener('click', () => {
        if (this.undoNotice) this.undoNotice.hidden = true;
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
        this.store.setState({ trashSearch: e.target.value }, 'trashSearchChange');
        this.renderTrash(this.store.getState());
      });
    }

    // Store sync
    this.store.subscribe((state, event) => {
      this.renderRegisters(state);
      this.renderTrash(state);
    });
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
    const query = (state.trashSearch || '').trim().toLowerCase();

    const filtered = query ? trash.filter(item => {
      const hay = `${item.title || item.label || ''} ${item.kind || ''} ${(item.targets || []).join(' ')}`.toLowerCase();
      return hay.includes(query);
    }) : trash;

    if (filtered.length === 0) {
      this.trashListContainer.innerHTML = `
        <div class="empty-trash-box">
          <div class="empty-icon-circle">
            ${renderIcon('trash-2', 32)}
          </div>
          <h3>${trash.length === 0 ? 'Trash is Empty' : 'No Deleted Items Match Search'}</h3>
          <p>${trash.length === 0 ? 'No deleted carriers or registers in local storage. All records are currently active.' : 'Try searching with a different term.'}</p>
        </div>
      `;
      return;
    }

    this.trashListContainer.innerHTML = filtered.map(item => {
      const id = item.id;
      const title = item.title || item.label || `Deleted ${item.kind || 'items'}`;
      const time = item.deleted_at ? new Date(item.deleted_at * 1000).toLocaleString() : 'Recently';
      const count = item.targets?.length || item.count || 0;
      const isDoc = item.kind === 'documents';

      return `
        <div class="trash-item">
          <div class="trash-item-left">
            <span class="trash-item-icon ${isDoc ? 'doc' : 'carrier'}">
              ${renderIcon(isDoc ? 'folder-archive' : 'truck', 16)}
            </span>
            <div class="trash-item-details">
              <strong>${title}</strong>
              <span class="trash-item-meta">${count.toLocaleString()} ${item.kind === 'dots' ? 'carriers' : 'registers'} · Deleted ${time}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm restore-item-btn" data-restore-id="${id}">
            ${renderIcon('rotate-ccw', 13)}
            <span>Restore</span>
          </button>
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
        }
      }

      Toast.success(`Moved ${targets.length.toLocaleString()} ${kind === 'dots' ? 'carrier' : 'register'}${targets.length === 1 ? '' : 's'} to Trash.`);

      // Clear selections & update store
      this.store.clearSelection();
      this.store.setState({
        selectedDocuments: new Set(),
        history: res.result,
        prospects: res.result.leads || [],
        categories: res.result.categories || [],
        registers: res.result.documents || [],
        trash: res.result.trash || [],
        summary: res.result.summary || {}
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

      if (this.undoNotice) this.undoNotice.hidden = true;

      this.store.setState({
        history: res.result,
        prospects: res.result.leads || [],
        categories: res.result.categories || [],
        registers: res.result.documents || [],
        trash: res.result.trash || [],
        summary: res.result.summary || {}
      }, 'historyLoad');
      this.store.computeFilteredProspects();
    } catch (err) {
      Toast.error(err.message || 'Restore failed');
    }
  }
}
