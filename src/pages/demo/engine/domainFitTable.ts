/**
 * Table-Driven Domain Fit Engine
 *
 * Replaces legacy substring (.includes('systems')) and regex checks on domain labels
 * with an explicit lookup table: roleFamily -> compatibleProjectDomains.
 */

import rawDomainFitTable from '../../../data/domainFitTable.json';

export interface RoleFamilyDomainEntry {
  roleFamily: string;
  compatibleProjectDomains: string[];
}

export interface DomainFitTableConfig {
  fallback: number;
  roleFamilies: RoleFamilyDomainEntry[];
}

export const DOMAIN_FIT_TABLE: DomainFitTableConfig = rawDomainFitTable as DomainFitTableConfig;

const ROLE_FAMILY_MAP = new Map<string, Set<string>>();
for (const entry of DOMAIN_FIT_TABLE.roleFamilies) {
  ROLE_FAMILY_MAP.set(entry.roleFamily, new Set(entry.compatibleProjectDomains));
}

/**
 * Determines the engineering role family from role title and company context.
 * Specialized roles take precedence over company industry.
 */
export function getRoleFamily(roleTitle?: string, companyIndustry?: string): string {
  const t = (roleTitle || '').trim();
  const ind = (companyIndustry || '').trim();

  // 1. Specialized engineering roles take precedence
  if (/\b(embedded|firmware|iot|connected\s+car|automotive|hardware|soc|fpga|telemetry|robotics|\becu\b|can\s+bus|autosar|autonomous)\b/i.test(t)) {
    return 'embedded';
  }
  if (/\b(security|secops|appsec|infosec|cyber|devsecops|cryptography)\b/i.test(t)) {
    return 'security';
  }
  if (/\b(ai|ml|llm|machine\s+learning|deep\s+learning|nlp|computer\s+vision)\b/i.test(t)) {
    return 'ml';
  }
  if (/\b(data\s+engineer|data\s+platform|analytics\s+engineer|big\s+data|data\s+warehouse|etl)\b/i.test(t)) {
    return 'data';
  }
  if (/\b(devops|sre|cloud|infrastructure|platform\s+engineer|site\s+reliability|kubernetes)\b/i.test(t)) {
    return 'devops';
  }
  if (/\b(mobile|android|ios|flutter|react\s+native|swift|kotlin)\b/i.test(t)) {
    return 'mobile';
  }
  if (/\b(qa|quality|sdet|test\s+engineer|automation\s+engineer)\b/i.test(t)) {
    return 'qa';
  }
  if (/\b(frontend|ui|web\s+developer|front-end)\b/i.test(t)) {
    return 'frontend';
  }

  // 2. Company industry harmonization for general/campus roles
  if (/\b(fintech|bank|banking|finance|payment|payments|bfsi|broking|trading|custodial)\b/i.test(ind)) {
    return 'fintech';
  }

  // 3. General backend / software engineering
  if (/\b(backend|server|distributed|microservices|api|java|golang|python|c\+\+|rust|node|sde|software\s+engineer|engineer|developer)\b/i.test(t)) {
    return 'backend';
  }

  return 'general';
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
  const compatibleDomains = ROLE_FAMILY_MAP.get(roleFamily);

  if (!compatibleDomains) {
    return DOMAIN_FIT_TABLE.fallback;
  }

  // Exact domain lookup - zero substring or regex on projectDomain label
  if (compatibleDomains.has(projectDomain)) {
    return 1.0;
  }

  return DOMAIN_FIT_TABLE.fallback;
}
