/**
 * R2D - Batch Importer & PDF Extractor Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';
import { api } from '../core/api.js';
import { Toast } from './Toast.js';

export class BatchImporterComponent {
  constructor(store) {
    this.store = store;

    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('files');
    this.fileList = document.getElementById('file-list');
    this.extractBtn = document.getElementById('extract');
    this.cancelBtn = document.getElementById('cancel');

    this.progressArea = document.getElementById('progress-area');
    this.progressBar = document.getElementById('progress');
    this.progressText = document.getElementById('progress-text');
    this.progressHealth = document.getElementById('progress-health');
    this.feedback = document.getElementById('feedback');

    this.receiptCard = document.getElementById('import-receipt');
    this.importSummary = document.getElementById('import-summary');
    this.importFilesList = document.getElementById('import-files');

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
      return;
    }

    if (this.extractBtn) this.extractBtn.disabled = false;

    this.selectedFiles.forEach((file, idx) => {
      const li = document.createElement('li');
      li.className = 'file-item';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

      li.innerHTML = `
        <div class="file-item-info">
          <span class="file-item-icon">${renderIcon('file-text', 14)}</span>
          <span class="file-item-name">${file.name}</span>
          <span class="file-item-size">${sizeMb} MB</span>
        </div>
        <button type="button" class="file-item-remove" aria-label="Remove file">
          ${renderIcon('x', 13)}
        </button>
      `;

      li.querySelector('.file-item-remove').addEventListener('click', () => {
        this.removeFile(idx);
      });

      this.fileList.appendChild(li);
    });
  }

  async startExtraction() {
    if (!this.selectedFiles.length) return;

    this.extractBtn.disabled = true;
    if (this.cancelBtn) this.cancelBtn.hidden = false;
    if (this.progressArea) this.progressArea.hidden = false;
    if (this.progressBar) this.progressBar.value = 5;
    if (this.progressText) this.progressText.textContent = 'Uploading register PDFs to local engine…';

    try {
      const res = await api.uploadBatch(this.selectedFiles, (loaded, total) => {
        const pct = Math.round((loaded / total) * 50);
        if (this.progressBar) this.progressBar.value = Math.max(5, pct);
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
        const overall = Math.round((((fileIdx - 1) + filePct) / totalFiles) * 100);

        if (this.progressBar) this.progressBar.value = Math.min(95, overall);
        if (this.progressText) this.progressText.textContent = job.message || `Processing register ${fileIdx} of ${totalFiles}…`;
        if (this.progressHealth) this.progressHealth.textContent = `Elapsed: ${job.elapsed_seconds || 0}s`;

        this.pollingTimer = setTimeout(() => this.pollJob(jobId), 400);
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
    if (this.progressBar) this.progressBar.value = 100;
    if (this.progressText) this.progressText.textContent = 'Extraction complete! Records saved to local database.';
    if (this.cancelBtn) this.cancelBtn.hidden = true;
    if (this.extractBtn) this.extractBtn.disabled = false;

    this.selectedFiles = [];
    this.renderFileList();

    Toast.success('FMCSA Register extraction complete!');
    this.renderReceipt(job);

    // Refresh history
    api.fetchHistory().then(data => {
      this.store.setState({
        history: data.result,
        prospects: data.result.leads || [],
        categories: data.result.categories || [],
        registers: data.result.documents || [],
        trash: data.result.trash || [],
        summary: data.result.summary || {}
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

    if (this.importSummary) {
      this.importSummary.textContent = `Batch Result: ${added.toLocaleString()} new carrier${added === 1 ? '' : 's'} added · ${skipped.toLocaleString()} existing duplicates retained.`;
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
