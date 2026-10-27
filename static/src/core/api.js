/**
 * R2D - API Client Service
 * Developer: Bukhtyar Haider
 */

export class APIClient {
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

export const api = new APIClient();
