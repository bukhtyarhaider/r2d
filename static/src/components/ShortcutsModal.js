/**
 * R2D - Shortcuts Modal Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';

export class ShortcutsModalComponent {
  constructor(store) {
    this.store = store;
    this.dialog = document.getElementById('shortcuts-dialog');
    this.closeBtn = document.getElementById('close-shortcuts');
    this.init();
  }

  init() {
    if (this.closeBtn && this.dialog) {
      this.closeBtn.addEventListener('click', () => {
        this.dialog.close();
      });
    }
  }

  open() {
    if (this.dialog && typeof this.dialog.showModal === 'function') {
      this.dialog.showModal();
    }
  }

  close() {
    if (this.dialog && this.dialog.open) {
      this.dialog.close();
    }
  }
}
