/**
 * R2D - Dispatch & Compliance Guide Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';

export class GuideComponent {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('tab-guide');
    this.filterButtons = document.querySelectorAll('.guide-filter-btn');
    this.searchInput = document.getElementById('guide-search');
    this.cards = document.querySelectorAll('.guide-card');
    this.activeFilter = 'all';

    this.init();
  }

  init() {
    // Topic filter buttons
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-guide-filter') || 'all';
        this.applyFilters();
      });
    });

    // Real-time guide search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.applyFilters();
      });
    }

    // Jump to Prospects or Upload from Guide tips
    if (this.container) {
      this.container.addEventListener('click', (e) => {
        const jumpTab = e.target.closest('[data-jump-tab]');
        if (jumpTab) {
          const tab = jumpTab.getAttribute('data-jump-tab');
          this.store.setState({ activeTab: tab }, 'tabChange');
        }
      });
    }
  }

  applyFilters() {
    const query = (this.searchInput?.value || '').trim().toLowerCase();

    this.cards.forEach(card => {
      const category = card.getAttribute('data-category') || 'general';
      const text = card.textContent.toLowerCase();

      const matchesFilter = this.activeFilter === 'all' || category === this.activeFilter;
      const matchesSearch = !query || text.includes(query);

      if (matchesFilter && matchesSearch) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

