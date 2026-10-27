/**
 * R2D - Header & Navigation Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';

export class HeaderComponent {
  constructor(store) {
    this.store = store;
    this.el = document.querySelector('.topbar');
    this.themeBtn = document.getElementById('theme-toggle');
    this.themeIcon = document.getElementById('theme-icon');
    this.shortcutsBtn = document.getElementById('open-shortcuts');
    this.tabs = document.querySelectorAll('.nav-tab');

    this.badgeProspects = document.getElementById('nav-count-prospects');
    this.badgeUpload = document.getElementById('nav-count-upload');
    this.badgeRegisters = document.getElementById('nav-count-registers');
    this.badgeTrash = document.getElementById('nav-count-trash');

    this.init();
  }

  init() {
    this.applyTheme(this.store.getState().theme);

    if (this.themeBtn) {
      this.themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    if (this.shortcutsBtn) {
      this.shortcutsBtn.addEventListener('click', () => {
        const dialog = document.getElementById('shortcuts-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      });
    }

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        this.selectTab(targetTab);
      });
    });

    this.store.subscribe((state, event) => {
      if (event === 'tabChange') {
        this.updateActiveTab(state.activeTab);
      }
      this.updateBadges(state);
    });
  }

  selectTab(tabName) {
    this.store.setState({ activeTab: tabName }, 'tabChange');
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  updateActiveTab(activeTab) {
    this.tabs.forEach(tab => {
      const match = tab.getAttribute('data-tab') === activeTab;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });
  }

  updateBadges(state) {
    const format = (n) => Number(n || 0).toLocaleString();

    if (this.badgeProspects) {
      const total = state.summary?.unique || state.summary?.total_leads || state.prospects?.length || 0;
      this.badgeProspects.textContent = format(total);
    }

    if (this.badgeRegisters) {
      const docs = state.registers?.length || state.summary?.documents_saved || 0;
      this.badgeRegisters.textContent = format(docs);
    }

    if (this.badgeTrash) {
      const trashCount = state.trash?.length || 0;
      this.badgeTrash.textContent = format(trashCount);
      const trashBtnCount = document.getElementById('trash-count');
      if (trashBtnCount) trashBtnCount.textContent = format(trashCount);
    }
  }

  toggleTheme() {
    const current = this.store.getState().theme;
    const next = current === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('r2d-theme', theme);
    this.store.setState({ theme }, 'themeChange');

    if (this.themeIcon) {
      this.themeIcon.innerHTML = renderIcon(theme === 'light' ? 'moon' : 'sun', 16);
    }
  }
}
