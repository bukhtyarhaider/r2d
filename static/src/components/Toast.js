/**
 * R2D - Toast Notification System
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';

export class ToastManager {
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

export const Toast = new ToastManager();
