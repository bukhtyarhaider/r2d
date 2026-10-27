/**
 * R2D - Export Builders
 * Developer: Bukhtyar Haider
 */

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportCSV(leads, viewName = 'leads') {
  if (!leads || !leads.length) return false;

  const headers = [
    'USDOT',
    'Legal Name',
    'Decision',
    'State',
    'City',
    'Full Address',
    'Phone',
    'Representative / Officer',
    'Filing Date',
    'Register Date',
    'Categories',
    'Decision Reason',
    'Occurrences',
    'Flags'
  ];

  const rows = [headers.join(',')];

  for (const lead of leads) {
    const categoriesStr = Array.isArray(lead.categories) ? lead.categories.join('; ') : '';
    const flagsStr = Array.isArray(lead.flags) ? lead.flags.join('; ') : '';

    rows.push([
      escapeCSV(lead.dot),
      escapeCSV(lead.name),
      escapeCSV(lead.decision),
      escapeCSV(lead._parsedState || ''),
      escapeCSV(lead._parsedCity || ''),
      escapeCSV(lead.address),
      escapeCSV(lead.phone),
      escapeCSV(lead.officer),
      escapeCSV(lead.filing_date),
      escapeCSV(lead.register_date),
      escapeCSV(categoriesStr),
      escapeCSV(lead.reason),
      escapeCSV(lead.occurrences || 1),
      escapeCSV(flagsStr)
    ].join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-fmcsa-${viewName}-${dateStr}.csv`);
  return true;
}

export function exportDOTs(leads) {
  if (!leads || !leads.length) return false;
  const dots = leads.map(l => l.dot).filter(Boolean);
  const content = dots.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-usdots-${dateStr}.txt`);
  return true;
}

export function exportAuditJSON(historyData) {
  if (!historyData) return false;
  const jsonStr = JSON.stringify(historyData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `r2d-extraction-audit-${dateStr}.json`);
  return true;
}
