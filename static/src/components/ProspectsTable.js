/**
 * R2D - Prospects High-Density Table Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';
import { Toast } from './Toast.js';

export class ProspectsTableComponent {
  constructor(store) {
    this.store = store;

    this.tbody = document.getElementById('rows');
    this.selectAllPageBox = document.getElementById('select-page');
    this.pageInfo = document.getElementById('page-info');
    this.prevBtn = document.getElementById('prev');
    this.nextBtn = document.getElementById('next');
    this.emptyState = document.getElementById('history-empty');
    this.emptyTitle = document.getElementById('history-empty-title');
    this.emptyDesc = document.getElementById('history-empty-description');

    this.init();
  }

  init() {
    if (this.selectAllPageBox) {
      this.selectAllPageBox.addEventListener('change', (e) => {
        const pageDots = this.getCurrentPageDots();
        this.store.selectPageDots(pageDots, e.target.checked);
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        const { page } = this.store.getState();
        this.store.setPage(page - 1);
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        const { page } = this.store.getState();
        this.store.setPage(page + 1);
      });
    }

    // Row event delegation for copy, call, and dossier open
    if (this.tbody) {
      this.tbody.addEventListener('click', (e) => {
        // 1. Checkbox toggle
        const checkbox = e.target.closest('.row-checkbox');
        if (checkbox) {
          const dot = checkbox.getAttribute('data-dot');
          this.store.toggleDotSelection(dot);
          return;
        }

        // 2. Direct USDOT copy
        const copyDotBtn = e.target.closest('[data-copy-dot]');
        if (copyDotBtn) {
          e.stopPropagation();
          const dot = copyDotBtn.getAttribute('data-copy-dot');
          navigator.clipboard.writeText(dot).then(() => {
            Toast.copy(`USDOT ${dot} copied to clipboard`);
          });
          return;
        }

        // 3. Direct Phone copy
        const copyPhoneBtn = e.target.closest('[data-copy-phone]');
        if (copyPhoneBtn) {
          e.stopPropagation();
          const phone = copyPhoneBtn.getAttribute('data-copy-phone');
          navigator.clipboard.writeText(phone).then(() => {
            Toast.copy(`Phone ${phone} copied to clipboard`);
          });
          return;
        }

        // 4. Dossier Trigger (carrier name, dossier button, or clicking row except link/button)
        const dossierTrigger = e.target.closest('[data-open-dossier]');
        if (dossierTrigger) {
          const dot = dossierTrigger.getAttribute('data-open-dossier');
          const carrier = this.store.getState().prospects.find(p => p.dot === dot);
          if (carrier) this.store.openDossier(carrier);
          return;
        }

        // Don't trigger dossier if clicking links or buttons
        if (e.target.closest('a') || e.target.closest('button')) return;

        const row = e.target.closest('tr[data-dot]');
        if (row) {
          const dot = row.getAttribute('data-dot');
          const carrier = this.store.getState().prospects.find(p => p.dot === dot);
          if (carrier) this.store.openDossier(carrier);
        }
      });
    }

    this.store.subscribe((state, event) => {
      this.render(state);
    });
  }

  getCurrentPageDots() {
    const { filteredProspects, page, pageSize } = this.store.getState();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredProspects.slice(start, end).map(p => p.dot);
  }

  render(state) {
    const { filteredProspects, page, pageSize, selectedDots } = state;
    const total = filteredProspects.length;

    // Handle Empty State
    if (total === 0) {
      if (this.tbody) this.tbody.innerHTML = '';
      if (this.emptyState) {
        this.emptyState.hidden = false;
        if (state.prospects.length === 0) {
          if (this.emptyTitle) this.emptyTitle.textContent = 'No FMCSA Register records imported';
          if (this.emptyDesc) this.emptyDesc.textContent = 'Upload FMCSA daily register PDFs in the Upload tab to generate your carrier prospect list.';
        } else {
          if (this.emptyTitle) this.emptyTitle.textContent = 'No carriers match your active filters';
          if (this.emptyDesc) this.emptyDesc.textContent = 'Try resetting your search query or state filter to view more prospects.';
        }
      }
      if (this.pageInfo) this.pageInfo.textContent = '0 - 0 of 0';
      if (this.prevBtn) this.prevBtn.disabled = true;
      if (this.nextBtn) this.nextBtn.disabled = true;
      if (this.selectAllPageBox) this.selectAllPageBox.checked = false;
      return;
    }

    if (this.emptyState) this.emptyState.hidden = true;

    // Pagination calculations
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const curPage = Math.min(Math.max(1, page), maxPage);
    const start = (curPage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const pageRecords = filteredProspects.slice(start, end);

    // Update pagination footer
    if (this.pageInfo) {
      this.pageInfo.textContent = `Showing ${(start + 1).toLocaleString()} – ${end.toLocaleString()} of ${total.toLocaleString()} carriers`;
    }
    if (this.prevBtn) this.prevBtn.disabled = curPage <= 1;
    if (this.nextBtn) this.nextBtn.disabled = curPage >= maxPage;

    // Update select-all-page checkbox
    const allPageSelected = pageRecords.length > 0 && pageRecords.every(p => selectedDots.has(p.dot));
    if (this.selectAllPageBox) {
      this.selectAllPageBox.checked = allPageSelected;
    }

    // Build Table Rows HTML
    const rowsHtml = pageRecords.map(lead => {
      const isSelected = selectedDots.has(lead.dot);
      const decRaw = (lead.decision || 'unknown').toLowerCase();
      let decClass = 'emerald';
      let decIcon = 'truck';
      let decDisplay = 'Relevant';
      if (decRaw === 'review') { decClass = 'amber'; decIcon = 'alert-circle'; decDisplay = 'Review'; }
      if (decRaw === 'excluded') { decClass = 'rose'; decIcon = 'ban'; decDisplay = 'Excluded'; }

      const st = lead._parsedState || '—';
      const city = lead._parsedCity || '';
      const country = lead._parsedCountry;
      const isCrossBorder = country && country !== 'US';
      const phone = lead.phone || '—';
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${lead.dot}`;

      const categories = Array.isArray(lead.categories) ? lead.categories : [];
      const occ = lead.occurrences || 1;

      return `
        <tr data-dot="${lead.dot}" class="${isSelected ? 'selected-row' : ''}">
          <td class="select-cell" onclick="event.stopPropagation()">
            <label class="row-select-control">
              <input type="checkbox" class="row-checkbox" data-dot="${lead.dot}" ${isSelected ? 'checked' : ''} aria-label="Select USDOT ${lead.dot}">
              <span class="checkbox-mark"></span>
            </label>
          </td>

          <!-- Status Pill -->
          <td class="col-status">
            <span class="status-pill status-${decClass}" title="${lead.reason || decDisplay}">
              ${renderIcon(decIcon, 12)}
              <span>${decDisplay}</span>
            </span>
          </td>

          <!-- USDOT & SAFER Link -->
          <td class="col-dot">
            <div class="dot-cell-wrap">
              <button type="button" class="dot-copy-btn" data-copy-dot="${lead.dot}" title="Click to copy USDOT ${lead.dot}">
                <span class="dot-prefix">DOT</span>
                <span class="dot-num">${lead.dot}</span>
                <span class="copy-glyph">${renderIcon('copy', 11)}</span>
              </button>
              <a href="${saferUrl}" target="_blank" rel="noreferrer" class="safer-link-pill" title="Open FMCSA SAFER Snapshot for USDOT ${lead.dot}" onclick="event.stopPropagation()">
                <span>SAFER</span>
                ${renderIcon('external-link', 10)}
              </a>
            </div>
          </td>

          <!-- State & City -->
          <td class="col-location">
            <div class="location-cell-wrap">
              ${st !== '—' ? `<span class="state-pill state-${st}">${st}</span>` : '<span class="state-pill state-NA">NA</span>'}
              ${isCrossBorder ? `<span class="country-pill country-${country}">${country}</span>` : ''}
              <span class="city-name" title="${lead.address || ''}">${city || '—'}</span>
            </div>
          </td>

          <!-- Carrier Legal Name -->
          <td class="col-company">
            <div class="company-cell-wrap">
              <button type="button" class="company-name-link" data-open-dossier="${lead.dot}" title="Click to inspect full carrier dossier">
                ${lead.name}
              </button>
              ${occ > 1 ? `<span class="occ-badge" title="Appeared in ${occ} separate daily register filings — High intent">${occ}x Filed</span>` : ''}
            </div>
          </td>

          <!-- Contact & 1-Click Call -->
          <td class="col-contact">
            <div class="contact-cell-wrap">
              <span class="officer-name" title="Primary Contact / Officer">${lead.officer || '—'}</span>
              <div class="phone-actions-row">
                ${cleanPhone ? `
                  <a href="tel:${cleanPhone}" class="tel-link" title="Call ${phone}" onclick="event.stopPropagation()">
                    ${renderIcon('phone-call', 12)}
                    <span>${phone}</span>
                  </a>
                  <button type="button" class="btn-copy-phone" data-copy-phone="${phone}" title="Copy phone number" onclick="event.stopPropagation()">
                    ${renderIcon('copy', 11)}
                  </button>
                ` : `<span class="no-phone">—</span>`}
              </div>
            </div>
          </td>

          <!-- Filing Date -->
          <td class="col-date">
            <span class="date-val monospace" title="FMCSA Register filing date">${lead.filing_date || '—'}</span>
          </td>

          <!-- Applied Categories -->
          <td class="col-categories">
            <div class="cat-pill-wrap">
              ${categories.slice(0, 2).map(c => `<span class="cat-pill" title="${c}">${truncate(c, 24)}</span>`).join('')}
              ${categories.length > 2 ? `<span class="cat-pill-more">+${categories.length - 2}</span>` : ''}
            </div>
          </td>

          <!-- Action Dossier Trigger -->
          <td class="col-action" onclick="event.stopPropagation()">
            <button type="button" class="btn btn-ghost btn-xs dossier-btn" data-open-dossier="${lead.dot}" title="Open dossier">
              <span>Dossier</span>
              ${renderIcon('chevron-right', 12)}
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (this.tbody) this.tbody.innerHTML = rowsHtml;
  }
}

function truncate(str, len = 20) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
