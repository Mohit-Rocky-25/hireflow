// ============================================================
// Company Hook Selector (Stage 3)
// Deterministic selector over shared company dataset
// Never hallucinates or invents company facts
// ============================================================

import { COMPANIES, Company } from '../../../pages/demo/talentLensData';

export interface CompanyHookInfo {
  found: boolean;
  companyName: string;
  industry?: string;
  tier?: string;
  verifiedStack?: string[];
  productAreas?: string[];
  suggestedRoles?: string[];
  hasVerifiedHook: boolean;
  promptText: string;
}

/**
 * Selects only verified hook fields from the shared company dataset.
 * If the dataset has no verified hook for a company, returns a prompt
 * for the user to supply what they admire.
 */
export function getCompanyHook(companyNameOrId?: string): CompanyHookInfo {
  if (!companyNameOrId || !companyNameOrId.trim()) {
    return {
      found: false,
      companyName: '',
      hasVerifiedHook: false,
      promptText: 'Add what you admire about the target company',
    };
  }

  const query = companyNameOrId.trim().toLowerCase();
  const company = COMPANIES.find(
    (c) => c.name.toLowerCase() === query || c.id.toLowerCase() === query
  );

  if (!company) {
    return {
      found: false,
      companyName: companyNameOrId.trim(),
      hasVerifiedHook: false,
      promptText: `Add what you admire about ${companyNameOrId.trim()}`,
    };
  }

  // Extract verified competencies across roles
  const stackSet = new Set<string>();
  const roleTitles: string[] = [];
  for (const role of company.roles || []) {
    if (role.title) roleTitles.push(role.title);
    for (const comp of role.competencies || []) {
      if (comp) stackSet.add(comp);
    }
  }

  const verifiedStack = Array.from(stackSet).slice(0, 5);
  const productAreas = company.industry ? [company.industry] : [];
  const hasVerifiedHook = productAreas.length > 0 || verifiedStack.length > 0;

  return {
    found: true,
    companyName: company.name,
    industry: company.industry,
    tier: company.tier,
    verifiedStack,
    productAreas,
    suggestedRoles: roleTitles.slice(0, 3),
    hasVerifiedHook,
    promptText: hasVerifiedHook
      ? `${company.name}'s ${company.industry} platform`
      : `Add what you admire about ${company.name}`,
  };
}

/**
 * Returns list of verified company names for quick selection.
 */
export function getAvailableCompanyOptions(limit = 100): Array<{ id: string; name: string; tier: string }> {
  return COMPANIES.slice(0, limit).map((c) => ({
    id: c.id,
    name: c.name,
    tier: c.tier || 'Enterprise',
  }));
}

/**
 * Returns whether a company has verified hooks in the repository dataset.
 */
export function hasVerifiedHooks(companyNameOrId?: string): boolean {
  return getCompanyHook(companyNameOrId).hasVerifiedHook;
}

/**
 * Returns verified hooks (admired projects, product areas, stack) from company dataset.
 */
export function selectCompanyHooks(companyNameOrId?: string): {
  admiredProjects: string[];
  productAreas: string[];
  verifiedStack: string[];
} {
  const hook = getCompanyHook(companyNameOrId);
  const admiredProjects =
    hook.found && hook.industry
      ? [`${hook.companyName}'s ${hook.industry} platform`]
      : [];
  return {
    admiredProjects,
    productAreas: hook.productAreas || [],
    verifiedStack: hook.verifiedStack || [],
  };
}
