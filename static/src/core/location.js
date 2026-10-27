/**
 * R2D - Location & Address Parser
 * Developer: Bukhtyar Haider
 */

// US States & Canadian Provinces mapping
export const US_STATES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', PR: 'Puerto Rico'
};

export const TOP_DISPATCH_STATES = ['TX', 'CA', 'FL', 'GA', 'IL', 'OH', 'NC', 'PA', 'NJ', 'TN', 'IN', 'MO'];

/**
 * Extracts city, state code, postal code, and country from raw FMCSA addresses
 * Handles single-line and multi-line strings, Canadian postal codes, etc.
 */
export function parseLocation(rawAddress) {
  if (!rawAddress || typeof rawAddress !== 'string') {
    return { city: '', state: '', postal: '', country: '', formatted: '—' };
  }

  const clean = rawAddress.trim().replace(/\s+/g, ' ');
  
  // Pattern 1: ... , City, ST 12345 or City, ST 12345-6789
  const usMatch = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\s+([0-9]{5}(?:-[0-9]{4})?)(?:\s+([A-Za-z]{2,}))?$/i);
  if (usMatch) {
    const city = usMatch[1].trim();
    const state = usMatch[2].toUpperCase();
    const postal = usMatch[3].trim();
    const country = (usMatch[4] || 'US').toUpperCase();
    return { city, state, postal, country, formatted: `${city}, ${state}` };
  }

  // Pattern 2: Canadian address ... , City, PROV A1A 1A1
  const caMatch = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\s+([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)(?:\s+([A-Za-z]{2,}))?$/i);
  if (caMatch) {
    const city = caMatch[1].trim();
    const state = caMatch[2].toUpperCase();
    const postal = caMatch[3].trim();
    const country = (caMatch[4] || 'CA').toUpperCase();
    return { city, state, postal, country, formatted: `${city}, ${state}` };
  }

  // Pattern 3: Fallback comma match ... , City, ST
  const fallback = clean.match(/,\s*([^,]+),\s*([A-Za-z]{2})\b/);
  if (fallback) {
    const city = fallback[1].trim();
    const state = fallback[2].toUpperCase();
    return { city, state, postal: '', country: 'US', formatted: `${city}, ${state}` };
  }

  return { city: '', state: '', postal: '', country: '', formatted: clean };
}
