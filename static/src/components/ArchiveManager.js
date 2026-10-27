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

    // Registers
    this.docsContainer = document.getElementById('documents');
    this.selectAllDocsBox = document.getElementById('select-all-documents');
    this.deleteDocsBtn = document.getElementById('delete-documents');
    this.registerSummary = document.getElementById('register-summary');
    this.docSelectionCount = document.getElementById('document-selection-count');

    // Trash
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

    this.init();
  }

  init() {
    // Select all registers
    if (this.selectAllDocsBox) {
      this.selectAllDocsBox.addEventListener('change', (e) => {
        const { registers } = this.store.getState();
        const next = new Set();
        if (e.target.checked) {
          registers.forEach(d => next.add(d.name || d.filename));
        }
        this.store.setState({ selectedDocuments: next }, 'docSelectionChange');
      });
    }

    // Delete registers button
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

  renderRegisters(state) {
    if (!this.docsContainer) return;
    const registers = state.registers || [];
    const selected = state.selectedDocuments || new Set();

    if (this.registerSummary) {
      this.registerSummary.textContent = `${registers.length.toLocaleString()} daily register archives processed and stored in local history.`;
    }

    if (this.docSelectionCount) {
      this.docSelectionCount.textContent = selected.size > 0 ? `(${selected.size} selected)` : '';
    }

    if (this.deleteDocsBtn) {
      this.deleteDocsBtn.disabled = selected.size === 0;
    }

    if (registers.length === 0) {
      this.docsContainer.innerHTML = `
        <div class="empty-docs-box">
          <p>No saved FMCSA register PDF documents in local history.</p>
        </div>
      `;
      return;
    }

    this.docsContainer.innerHTML = registers.map(doc => {
      const name = doc.name || doc.filename || 'Register PDF';
      const isSel = selected.has(name);
      const count = doc.records || doc.lead_count || 0;
      const date = doc.register_date || doc.date || '—';

      return `
        <div class="document-card ${isSel ? 'selected' : ''}">
          <div class="document-card-top">
            <label class="custom-checkbox">
              <input type="checkbox" class="doc-checkbox" data-doc="${name}" ${isSel ? 'checked' : ''}>
              <span class="checkbox-mark"></span>
            </label>
            <span class="doc-file-tag">PDF</span>
          </div>
          <div class="document-card-body">
            <h4 class="doc-title" title="${name}">${name}</h4>
            <div class="doc-meta-row">
              <span class="doc-meta-val">${renderIcon('calendar', 12)} ${date}</span>
              <span class="doc-meta-val">${renderIcon('truck', 12)} ${count.toLocaleString()} leads</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind checkboxes
    this.docsContainer.querySelectorAll('.doc-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const docName = box.getAttribute('data-doc');
        const next = new Set(this.store.getState().selectedDocuments);
        if (e.target.checked) next.add(docName);
        else next.delete(docName);
        this.store.setState({ selectedDocuments: next }, 'docSelectionChange');
      });
    });
  }

  renderTrash(state) {
    if (!this.trashListContainer) return;
    const trash = state.trash || [];
    const query = (state.trashSearch || '').trim().toLowerCase();

    const filtered = query ? trash.filter(item => {
      const hay = `${item.title || ''} ${item.kind || ''} ${(item.targets || []).join(' ')}`.toLowerCase();
      return hay.includes(query);
    }) : trash;

    if (filtered.length === 0) {
      this.trashListContainer.innerHTML = `
        <div class="empty-trash-box">
          <p>${trash.length === 0 ? 'Trash is clear. No deleted items.' : 'No deleted items match your search.'}</p>
        </div>
      `;
      return;
    }

    this.trashListContainer.innerHTML = filtered.map(item => {
      const id = item.id;
      const title = item.title || `Deleted ${item.kind || 'items'}`;
      const time = item.deleted_at ? new Date(item.deleted_at * 1000).toLocaleString() : 'Recently';
      const count = item.targets?.length || 0;

      return `
        <div class="trash-item">
          <div class="trash-item-left">
            <span class="trash-item-icon">${renderIcon('trash-2', 15)}</span>
            <div class="trash-item-details">
              <strong>${title}</strong>
              <span class="trash-item-meta">${count.toLocaleString()} ${item.kind === 'dots' ? 'carriers' : 'registers'} · ${time}</span>
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

  openDocumentDeleteDialog(docNames) {
    if (!this.deleteDialog) return;
    const desc = document.getElementById('delete-description');
    const preview = document.getElementById('delete-preview');

    this._pendingDeletionKind = 'documents';
    this._pendingDeletionTargets = docNames;

    if (desc) {
      desc.textContent = `You are about to delete ${docNames.length.toLocaleString()} registered PDF${docNames.length === 1 ? '' : 's'}. Any USDOT supported by another active register remains in your prospect list.`;
    }

    if (preview) {
      preview.innerHTML = docNames.slice(0, 4).map(n => `<span class="preview-dot">${n}</span>`).join(' ') +
        (docNames.length > 4 ? ` <span class="preview-more">+${(docNames.length - 4).toLocaleString()} more</span>` : '');
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
