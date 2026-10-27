/**
 * R2D - Stats HUD Metric Cards Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';

export class StatsHUDComponent {
  constructor(store) {
    this.store = store;
    this.container = document.getElementById('stats');
    this.init();
  }

  init() {
    this.store.subscribe((state, event) => {
      if (['historyLoad', 'filterChange', 'stateChange'].includes(event)) {
        this.render(state);
      }
    });
  }

  render(state) {
    if (!this.container) return;

    const summary = state.summary || {};
    const prospects = state.prospects || [];
    const filtered = state.filteredProspects || [];

    const totalLeads = summary.unique || summary.total_leads || prospects.length || 0;
    const relevantCount = summary.relevant !== undefined ? summary.relevant :
      prospects.filter(p => (p.decision || '').toLowerCase() === 'relevant').length;
    
    // Multi-issue occurrences (carriers in 2 or more registers)
    const multiFilings = prospects.filter(p => (p.occurrences || 1) >= 2).length;
    const totalDocs = summary.documents_saved || state.registers?.length || 0;

    const format = (n) => Number(n || 0).toLocaleString();
    const pct = totalLeads ? Math.round((relevantCount / totalLeads) * 100) : 0;

    this.container.innerHTML = `
      <div class="stat-card stat-card-primary" data-stat="relevant">
        <div class="stat-header">
          <span class="stat-tag">TARGET SHORTLIST</span>
          <span class="stat-icon-wrap emerald">${renderIcon('target', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(relevantCount)}</div>
          <div class="stat-sub">
            <span class="stat-trend positive">${pct}%</span> of total deduplicated pool
          </div>
        </div>
        <div class="stat-foot">Ready for direct carrier dispatch outreach</div>
      </div>

      <div class="stat-card" data-stat="pool">
        <div class="stat-header">
          <span class="stat-tag">DEDUPLICATED POOL</span>
          <span class="stat-icon-wrap cyan">${renderIcon('truck', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(totalLeads)}</div>
          <div class="stat-sub">
            <span class="stat-badge-cyan">1 ROW PER USDOT</span>
          </div>
        </div>
        <div class="stat-foot">Property, movers, & specialty carriers</div>
      </div>

      <div class="stat-card" data-stat="multi">
        <div class="stat-header">
          <span class="stat-tag">MULTI-ISSUE FILINGS</span>
          <span class="stat-icon-wrap amber">${renderIcon('sparkles', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(multiFilings)}</div>
          <div class="stat-sub">
            <span class="stat-badge-amber">HIGH INTENT</span> 2+ Register occurrences
          </div>
        </div>
        <div class="stat-foot">Latest filed contact details preferred</div>
      </div>

      <div class="stat-card" data-stat="archive">
        <div class="stat-header">
          <span class="stat-tag">REGISTER ARCHIVE</span>
          <span class="stat-icon-wrap indigo">${renderIcon('folder-archive', 15)}</span>
        </div>
        <div class="stat-main">
          <div class="stat-value">${format(totalDocs)}</div>
          <div class="stat-sub">
            <span class="stat-badge-indigo">100% LOCAL</span> SQLite Armored
          </div>
        </div>
        <div class="stat-foot">Daily Operating Authority Applications</div>
      </div>
    `;
  }
}
