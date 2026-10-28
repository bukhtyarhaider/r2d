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
