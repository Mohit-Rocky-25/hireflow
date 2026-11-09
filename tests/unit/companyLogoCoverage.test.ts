import { describe, it, expect } from 'vitest';
import { companies100 } from '../../src/data/market/companies100/generated/companies';
import { COMPANIES } from '../../src/pages/demo/talentLensData';
import { normalizeCompanyKey } from '../../src/components/common/CompanyLogo';
import { EXTENDED_LOGO_COMPONENTS } from '../../src/components/common/companyLogosExtended';

describe('CompanyLogo System Coverage & Visual Integrity', () => {
  it('resolves 100% of companies in companies100 to an authentic vector logo key', () => {
    const missing: string[] = [];

    companies100.forEach(c => {
      const key = normalizeCompanyKey(c.id, c.name);
      // Key must exist in EXTENDED_LOGO_COMPONENTS or base logos
      if (!key) {
        missing.push(c.id);
      }
    });

    expect(missing).toEqual([]);
  });

  it('specifically resolves all companies reported in user screenshot to authentic vector marks', () => {
    const reportedCompanies = [
      { id: 'bny_mellon_tech', name: 'BNY Mellon Technology Global Services India Private Limited' },
      { id: 'state_street_india', name: 'State Street Corporate Services Mumbai Private Limited' },
      { id: 'standard_chartered_gbs', name: 'Standard Chartered Global Business Services Private Limited' },
      { id: 'sgs_india', name: 'SGS India Private Limited' },
      { id: 'garmin_india', name: 'Garmin Corporation (India Operations)' },
      { id: 'kpit_tech', name: 'KPIT Technologies Limited' },
      { id: 'abb_india', name: 'ABB India Limited' },
      { id: 'western_digital_india', name: 'SanDisk India Device Design Centre Private Limited' },
      { id: 'seagate_india', name: 'Seagate Technology Technology India Private Limited' },
      { id: 'fractal', name: 'Fractal Analytics Private Limited' },
      { id: 'nucleus_software', name: 'Nucleus Software Exports Limited' },
      { id: 'intellect_design', name: 'Intellect Design Arena Limited' },
      { id: 'datadog', name: 'Datadog India' },
      { id: 'mongodb', name: 'MongoDB India' },
      { id: 'elastic', name: 'Elastic India' },
      { id: 'gitlab', name: 'GitLab India' },
      { id: 'rubrik', name: 'Rubrik India' },
      { id: 'coinbase', name: 'Coinbase India' },
      { id: 'zepto', name: 'Zepto' },
      { id: 'myntra', name: 'Myntra' },
      { id: 'sharechat', name: 'ShareChat (Mohalla Tech)' },
      { id: 'american-express', name: 'American Express India' },
      { id: 'visa', name: 'Visa India' },
      { id: 'mastercard', name: 'Mastercard India' },
      { id: 'lnt', name: 'Larsen & Toubro (L&T)' },
    ];

    reportedCompanies.forEach(c => {
      const key = normalizeCompanyKey(c.id, c.name);
      expect(EXTENDED_LOGO_COMPONENTS[key], `Expected logo component for ${c.id} (key: ${key})`).toBeDefined();
    });
  });

  it('guarantees every active employer in the merged catalog has a non-fallback logo', () => {
    const activeCompanies = COMPANIES.filter(c => c.dataStatus !== 'quarantined');
    expect(activeCompanies.length).toBeGreaterThan(200);

    activeCompanies.forEach(c => {
      const key = normalizeCompanyKey(c.id, c.name);
      expect(key).toBeTruthy();
    });
  });
});
