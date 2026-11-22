/**
 * Table-Driven Domain Fit Engine
 *
 * Replaces legacy substring (.includes('systems')) and regex checks on domain labels
 * with an explicit lookup table: roleFamily -> compatibleProjectDomains / canonicalDomainIds.
 */

import rawDomainFitTable from '../../../data/domainFitTable.json';

export interface CanonicalDomain {
  id: string;
  name: string;
  aliases: string[];
}

export interface RoleFamilyDomainEntry {
  roleFamily: string;
  compatibleDomainIds?: string[];
  compatibleProjectDomains: string[];
}

export interface DomainFitTableConfig {
  fallback: number;
  canonicalDomains?: CanonicalDomain[];
  roleFamilies: RoleFamilyDomainEntry[];
}

export const DOMAIN_FIT_TABLE: DomainFitTableConfig = rawDomainFitTable as DomainFitTableConfig;

const ROLE_FAMILY_MAP = new Map<string, Set<string>>();
for (const entry of DOMAIN_FIT_TABLE.roleFamilies) {
  ROLE_FAMILY_MAP.set(entry.roleFamily, new Set(entry.compatibleProjectDomains));
}

export const DOMAIN_TO_CANONICAL_ID_MAP = new Map<string, string>();
if (DOMAIN_FIT_TABLE.canonicalDomains) {
  for (const cd of DOMAIN_FIT_TABLE.canonicalDomains) {
    for (const alias of cd.aliases) {
      DOMAIN_TO_CANONICAL_ID_MAP.set(alias.toLowerCase(), cd.id);
      DOMAIN_TO_CANONICAL_ID_MAP.set(alias, cd.id);
    }
  }
}

/**
 * Returns the canonical domain id for any project domain alias.
 */
export function getCanonicalDomainId(domain: string): string | undefined {
  if (!domain) return undefined;
  return DOMAIN_TO_CANONICAL_ID_MAP.get(domain) || DOMAIN_TO_CANONICAL_ID_MAP.get(domain.toLowerCase());
}

export interface LibraryDomainMappingResult {
  pass: boolean;
  totalDomains: number;
  mappedCount: number;
  unmapped: string[];
  multiple: string[];
  zeroCompatibleRoleFamilies: string[];
}

/**
 * Validates that every library domain label maps to exactly one canonical domain id,
 * and identifies any canonical domain ids with zero compatible role families.
 */
export function verifyAllLibraryDomainsMapped(allBriefDomains: string[]): LibraryDomainMappingResult {
  const uniqueDomains = Array.from(new Set(allBriefDomains));
  const unmapped: string[] = [];
  const multiple: string[] = [];

  const canonicalDomains = DOMAIN_FIT_TABLE.canonicalDomains || [];

  for (const d of uniqueDomains) {
    const matching = canonicalDomains.filter((cd) =>
      cd.aliases.some((a) => a.toLowerCase() === d.toLowerCase())
    );
    if (matching.length === 0) {
      unmapped.push(d);
    } else if (matching.length > 1) {
      multiple.push(d);
    }
  }

  const allCompatibleDomainIds = new Set<string>();
  for (const rf of DOMAIN_FIT_TABLE.roleFamilies) {
    if (rf.compatibleDomainIds) {
      for (const cid of rf.compatibleDomainIds) {
        allCompatibleDomainIds.add(cid);
      }
    }
  }

  const zeroCompatibleRoleFamilies: string[] = [];
  for (const cd of canonicalDomains) {
    if (!allCompatibleDomainIds.has(cd.id)) {
      zeroCompatibleRoleFamilies.push(cd.id);
    }
  }

  return {
    pass: unmapped.length === 0 && multiple.length === 0,
    totalDomains: uniqueDomains.length,
    mappedCount: uniqueDomains.length - unmapped.length,
    unmapped,
    multiple,
    zeroCompatibleRoleFamilies,
  };
}

const ROLE_FAMILY_CACHE = new Map<string, string>();

/**
 * Determines the engineering role family from role title and company context.
 * Specialized roles take precedence over company industry.
 */
export function getRoleFamily(roleTitle?: string, companyIndustry?: string): string {
  const t = (roleTitle || '').trim();
  const ind = (companyIndustry || '').trim();
  const cacheKey = `${t}::${ind}`;
  if (ROLE_FAMILY_CACHE.has(cacheKey)) {
    return ROLE_FAMILY_CACHE.get(cacheKey)!;
  }

  let result = 'general';

  // 1. Specialized engineering roles take precedence
  if (/\b(embedded|firmware|iot|connected\s+car|automotive|hardware|soc|fpga|telemetry|robotics|\becu\b|can\s+bus|autosar|autonomous)\b/i.test(t)) {
    result = 'embedded';
  } else if (/\b(security|secops|appsec|infosec|cyber|devsecops|cryptography)\b/i.test(t)) {
    result = 'security';
  } else if (/\b(ai|ml|llm|machine\s+learning|deep\s+learning|nlp|computer\s+vision)\b/i.test(t)) {
    result = 'ml';
  } else if (/\b(data\s+engineer|data\s+platform|analytics\s+engineer|big\s+data|data\s+warehouse|etl)\b/i.test(t)) {
    result = 'data';
  } else if (/\b(devops|sre|cloud|infrastructure|platform\s+engineer|site\s+reliability|kubernetes)\b/i.test(t)) {
    result = 'devops';
  } else if (/\b(mobile|android|ios|flutter|react\s+native|swift|kotlin)\b/i.test(t)) {
    result = 'mobile';
  } else if (/\b(qa|quality|sdet|test\s+engineer|automation\s+engineer)\b/i.test(t)) {
    result = 'qa';
  } else if (/\b(frontend|ui|web\s+developer|front-end)\b/i.test(t)) {
    result = 'frontend';
  } else if (/\b(fintech|bank|banking|finance|payment|payments|bfsi|broking|trading|custodial)\b/i.test(ind)) {
    // 2. Company industry harmonization for general/campus roles
    result = 'fintech';
  } else if (/\b(backend|server|distributed|microservices|api|java|golang|python|c\+\+|rust|node|sde|software\s+engineer|engineer|developer)\b/i.test(t)) {
    // 3. General backend / software engineering
    result = 'backend';
  }

  ROLE_FAMILY_CACHE.set(cacheKey, result);
  return result;
}

/**
 * Computes domain fit between project domain and target role in a strictly table-driven manner.
 * Zero regex or substring checks are performed on the project domain label.
 */
export function computeDomainFit(
  projectDomain: string,
  arg2?: string,
  arg3?: string
): number {
  if (!projectDomain) return DOMAIN_FIT_TABLE.fallback;

  let roleTitle = arg2;
  let companyIndustry = arg3;
  if (arg3 !== undefined) {
    roleTitle = arg3;
    companyIndustry = arg2;
  }

  const roleFamily = getRoleFamily(roleTitle, companyIndustry);
  const entry = DOMAIN_FIT_TABLE.roleFamilies.find((e) => e.roleFamily === roleFamily);
  if (!entry) return DOMAIN_FIT_TABLE.fallback;

  // 1. Direct match on compatibleProjectDomains for backward compatibility
  const compatibleDomains = ROLE_FAMILY_MAP.get(roleFamily);
  if (compatibleDomains && compatibleDomains.has(projectDomain)) {
    return 1.0;
  }

  // 2. Canonical domain match
  const canonicalId = getCanonicalDomainId(projectDomain);
  if (canonicalId && entry.compatibleDomainIds && entry.compatibleDomainIds.includes(canonicalId)) {
    return 1.0;
  }

  return DOMAIN_FIT_TABLE.fallback;
}

/**
 * Legacy substring-based domain fit calculation for attribution comparison.
 */
export function computeLegacyDomainFit(
  projectDomain: string,
  companyIndustry?: string,
  roleTitle?: string
): number {
  const pDom = (projectDomain || '').toLowerCase();
  const cInd = (companyIndustry || '').toLowerCase();
  const rTitle = (roleTitle || '').toLowerCase();

  const isSecurityRole = /\b(security|secops|appsec|infosec|cloud\s+security|devsecops|cyber)\b/i.test(rTitle);
  const isEmbeddedRole = /\b(embedded|firmware|iot|connected\s+car|automotive|hardware|soc|fpga|telemetry)\b/i.test(rTitle) ||
    (cInd.includes('automotive') && /\b(car|vehicle|firmware|hardware)\b/i.test(rTitle));
  const isAIMLRole = /\b(ai|ml|llm|machine\s+learning|deep\s+learning|data\s+scientist|data\s+engineer|data\s+platform)\b/i.test(rTitle);
  const isDevOpsRole = /\b(devops|sre|cloud|infrastructure|platform\s+engineer|site\s+reliability)\b/i.test(rTitle);
  const isFrontendRole = /\b(frontend|ui|web|mobile|android|ios|flutter|react\s+native)\b/i.test(rTitle);

  // 1. Role Family takes priority for specialized domains
  if (isSecurityRole) {
    if (pDom.includes('security') || pDom.includes('cryptography') || pDom.includes('auth')) return 1.0;
    if (pDom.includes('cloud') || pDom.includes('infrastructure') || pDom.includes('distributed')) return 0.75;
    if (pDom.includes('fintech') || pDom.includes('ledger')) return 0.35;
    return 0.3;
  }

  if (isEmbeddedRole) {
    if (pDom.includes('iot') || pDom.includes('telemetry') || pDom.includes('embedded') || pDom.includes('systems')) return 1.0;
    if (pDom.includes('real-time') || pDom.includes('hardware')) return 0.9;
    if (pDom.includes('cloud') || pDom.includes('backend')) return 0.5;
    return 0.3;
  }

  if (isAIMLRole) {
    if (pDom.includes('ai') || pDom.includes('ml') || pDom.includes('llm') || pDom.includes('inference')) return 1.0;
    if (pDom.includes('data') || pDom.includes('streaming') || pDom.includes('analytics')) return 0.8;
    return 0.2;
  }

  if (isDevOpsRole) {
    if (pDom.includes('devops') || pDom.includes('cloud') || pDom.includes('infrastructure') || pDom.includes('kubernetes')) return 1.0;
    if (pDom.includes('distributed') || pDom.includes('systems')) return 0.8;
    return 0.3;
  }

  if (isFrontendRole) {
    if (pDom.includes('frontend') || pDom.includes('ui') || pDom.includes('web') || pDom.includes('mobile')) return 1.0;
    return 0.3;
  }

  // 2. Company Industry harmonization for general backend/SDE roles
  const isFintech =
    cInd.includes('fintech') ||
    cInd.includes('bank') ||
    cInd.includes('finance') ||
    cInd.includes('payment') ||
    cInd.includes('bfsi') ||
    cInd.includes('broking') ||
    cInd.includes('trading') ||
    cInd.includes('custodial');

  if (isFintech) {
    if (pDom.includes('fintech') || pDom.includes('ledger') || pDom.includes('accounting') || pDom.includes('payment')) return 1.0;
    if (pDom.includes('distributed') || pDom.includes('high-scale backend') || pDom.includes('security') || pDom.includes('cryptography')) return 0.85;
    if (pDom.includes('cloud') || pDom.includes('streaming') || pDom.includes('data platform')) return 0.75;
    if (pDom.includes('full-stack') || pDom.includes('web')) return 0.5;
    if (pDom.includes('ai/ml') || pDom.includes('computer vision') || pDom.includes('generative ai') || pDom.includes('llmops')) return 0.1;
  }

  // 3. Default balanced domain fit for general software roles
  if (pDom.includes('distributed') || pDom.includes('backend') || pDom.includes('cloud') || pDom.includes('systems')) return 0.85;
  if (pDom.includes('security') || pDom.includes('fintech')) return 0.8;
  return 0.6;
}
