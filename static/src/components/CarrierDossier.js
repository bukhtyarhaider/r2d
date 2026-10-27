/**
 * R2D - Carrier Dossier Slide-Over Component
 * Developer: Bukhtyar Haider
 */

import { renderIcon } from '../core/icons.js';
import { Toast } from './Toast.js';

export class CarrierDossierComponent {
  constructor(store) {
    this.store = store;
    this.drawer = null;
    this.overlay = null;
    this.init();
  }

  init() {
    this.createDossierDOM();

    this.store.subscribe((state, event) => {
      if (event === 'dossierOpen') {
        this.renderCarrier(state.activeCarrier);
      } else if (event === 'dossierClose') {
        this.close();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.store.closeDossier();
      }
    });
  }

  createDossierDOM() {
    if (document.getElementById('carrier-dossier-drawer')) return;

    const overlay = document.createElement('div');
    overlay.id = 'carrier-dossier-overlay';
    overlay.className = 'dossier-overlay';
    overlay.addEventListener('click', () => this.store.closeDossier());

    const drawer = document.createElement('aside');
    drawer.id = 'carrier-dossier-drawer';
    drawer.className = 'dossier-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Carrier Dossier');

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    this.overlay = overlay;
    this.drawer = drawer;
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('open');
  }

  open() {
    if (this.drawer) this.drawer.classList.add('open');
    if (this.overlay) this.overlay.classList.add('open');
    document.body.classList.add('dossier-open');
  }

  close() {
    if (this.drawer) this.drawer.classList.remove('open');
    if (this.overlay) this.overlay.classList.remove('open');
    document.body.classList.remove('dossier-open');
  }

  renderCarrier(carrier) {
    if (!carrier || !this.drawer) return;

    const decRaw = (carrier.decision || 'unknown').toLowerCase();
    let decClass = 'emerald';
    let decIcon = 'truck';
    let decDisplay = 'Relevant';
    if (decRaw === 'review') { decClass = 'amber'; decIcon = 'alert-circle'; decDisplay = 'Review'; }
    if (decRaw === 'excluded') { decClass = 'rose'; decIcon = 'ban'; decDisplay = 'Excluded'; }

    const st = carrier._parsedState || '—';
    const city = carrier._parsedCity || '';
    const phone = carrier.phone || '—';
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const saferUrl = `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${carrier.dot}`;
    const googleQuery = encodeURIComponent(`${carrier.name} USDOT ${carrier.dot} trucking`);
    const mapsQuery = encodeURIComponent(carrier.address || `${city}, ${st}`);

    const categories = Array.isArray(carrier.categories) ? carrier.categories : [];
    const flags = Array.isArray(carrier.flags) ? carrier.flags : [];

    this.drawer.innerHTML = `
      <div class="dossier-header">
        <div class="dossier-badge-row">
          <span class="dossier-decision-pill ${decClass}">
            ${renderIcon(decIcon, 13)}
            <span>${decDisplay}</span>
          </span>
          ${st !== '—' ? `<span class="state-pill state-${st}">${st}</span>` : ''}
          <span class="dossier-dot-badge">USDOT ${carrier.dot}</span>
        </div>
        <button type="button" class="dossier-close-btn" aria-label="Close Dossier">
          ${renderIcon('x', 18)}
        </button>
      </div>

      <div class="dossier-scroll-body">
        <div class="dossier-title-section">
          <h2 class="dossier-company-name">${carrier.name}</h2>
          <p class="dossier-location-sub">${carrier.address || 'Address on file with FMCSA'}</p>
        </div>

        <!-- Quick Dispatch Actions -->
        <div class="dossier-action-bar">
          ${cleanPhone ? `
            <a href="tel:${cleanPhone}" class="btn btn-primary btn-sm dossier-call-btn">
              ${renderIcon('phone-call', 14)}
              <span>Call Carrier</span>
            </a>
            <button type="button" class="btn btn-secondary btn-sm" data-copy-val="${phone}" data-label="Phone number">
              ${renderIcon('copy', 13)}
              <span>Copy Phone</span>
            </button>
          ` : ''}
          <button type="button" class="btn btn-secondary btn-sm" data-copy-val="${carrier.dot}" data-label="USDOT">
            ${renderIcon('copy', 13)}
            <span>Copy DOT</span>
          </button>
          <a href="${saferUrl}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
            ${renderIcon('external-link', 13)}
            <span>SAFER Snapshot</span>
          </a>
          <a href="https://www.google.com/search?q=${googleQuery}" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm">
            ${renderIcon('search', 13)}
            <span>Google Search</span>
          </a>
        </div>

        <!-- Section: Primary Contact -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('user', 14)}
            <span>Primary Contact & Address</span>
          </div>
          <div class="dossier-grid-2">
            <div>
              <span class="dossier-meta-label">Representative / Officer</span>
              <strong class="dossier-meta-val">${carrier.officer || '—'}</strong>
            </div>
            <div>
              <span class="dossier-meta-label">Direct Phone</span>
              <strong class="dossier-meta-val monospace">${phone}</strong>
            </div>
            <div style="grid-column: span 2;">
              <span class="dossier-meta-label">Filing Address</span>
              <div class="dossier-address-box">
                <span>${carrier.address || '—'}</span>
                <a href="https://maps.google.com/?q=${mapsQuery}" target="_blank" rel="noreferrer" class="maps-link">
                  ${renderIcon('map-pin', 12)}
                  <span>View Map</span>
                </a>
              </div>
            </div>
            <div>
              <span class="dossier-meta-label">Application Filing Date</span>
              <span class="dossier-meta-val monospace">${carrier.filing_date || '—'}</span>
            </div>
            <div>
              <span class="dossier-meta-label">Register Publication Date</span>
              <span class="dossier-meta-val monospace">${carrier.register_date || '—'}</span>
            </div>
          </div>
        </div>

        <!-- Section: Authority Evaluation -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('shield-check', 14)}
            <span>Authority & Prospect Assessment</span>
          </div>
          <div class="dossier-reason-box">
            <span class="reason-label">Classification Reason:</span>
            <p class="reason-text">${carrier.reason || 'General freight motor carrier application'}</p>
          </div>

          <div class="dossier-categories-wrap">
            <span class="dossier-meta-label">Applied Authority Categories:</span>
            <div class="category-tags-list">
              ${categories.map(c => `<span class="category-pill">${c}</span>`).join('')}
            </div>
          </div>

          ${flags.length > 0 ? `
            <div class="dossier-flags-wrap">
              <span class="dossier-meta-label">Operating Flags:</span>
              <div class="flag-tags-list">
                ${flags.map(f => `<span class="flag-pill">${renderIcon('alert-triangle', 11)} ${f}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Section: Multi-Register Filing History -->
        <div class="dossier-card">
          <div class="dossier-card-title">
            ${renderIcon('folder-archive', 14)}
            <span>Register Occurrence History</span>
          </div>
          <div class="dossier-occurrences-summary">
            <span class="occurrences-count-badge">${carrier.occurrences || 1} Occurrences</span>
            <p class="occurrences-note">
              ${(carrier.occurrences || 1) > 1 
                ? 'Carrier filed in multiple daily registers. Latest filed contacts are prioritized.'
                : 'Carrier filed in a single FMCSA daily register batch.'}
            </p>
          </div>
        </div>

        <!-- Section: Raw Register Evidence Snippet -->
        ${carrier.evidence ? `
          <div class="dossier-card">
            <div class="dossier-card-title">
              ${renderIcon('file-text', 14)}
              <span>Raw Register PDF Extract</span>
            </div>
            <pre class="dossier-evidence-raw">${escapeHtml(carrier.evidence)}</pre>
          </div>
        ` : ''}
      </div>
    `;

    // Bind close
    this.drawer.querySelector('.dossier-close-btn').addEventListener('click', () => {
      this.store.closeDossier();
    });

    // Bind copy buttons
    this.drawer.querySelectorAll('[data-copy-val]').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-copy-val');
        const label = btn.getAttribute('data-label') || 'Item';
        if (val) {
          navigator.clipboard.writeText(val).then(() => {
            Toast.copy(`${label} copied to clipboard`);
          });
        }
      });
    });

    this.open();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
