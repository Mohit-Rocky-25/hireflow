// ============================================================
// ATS Resume Roaster — JD State & Domain Capability Classifier
// Deterministic classification of JD input states and domain coverage
// without inventing requirements or claiming unsupported domain support.
// ============================================================

import type { DomainCapability, DomainCapabilityTier, JdAnalysis, JdInputState } from './types';

interface DomainRule {
  domainId: DomainCapability['domainId'];
  label: string;
  tier: DomainCapabilityTier;
  pattern: RegExp;
  reason: string;
}

const DOMAIN_RULES: DomainRule[] = [
  {
    domainId: 'hr',
    label: 'Human Resources & Recruiting',
    tier: 'unsupported',
    pattern: /\b(?:human resources|hr business partner|hris|workday|talent acquisition|employee relations|payroll compliance|compensation benchmarking|recruiting coordinator)\b/i,
    reason: 'HireFlow ATS does not yet have validated HR/People-Ops competency models. Standard ATS readiness cannot be reliably scored.',
  },
  {
    domainId: 'sales',
    label: 'Sales & Business Development',
    tier: 'unsupported',
    pattern: /\b(?:account executive|business development|quota[-\s]*carrying|cold calling|b2b sales|pipeline quota|territory sales|sales representative)\b/i,
    reason: 'HireFlow ATS does not yet support quota-carrying Sales competency evaluation.',
  },
  {
    domainId: 'research',
    label: 'Non-Computational Research',
    tier: 'unsupported',
    pattern: /\b(?:wet lab|clinical trial|molecular biology|histology|bench research|qualitative ethnography|archival research)\b/i,
    reason: 'Non-computational academic/wet-lab research domains are outside HireFlow’s validated technical taxonomy.',
  },
  {
    domainId: 'finance',
    label: 'Finance & Accounting',
    tier: 'experimental',
    pattern: /\b(?:financial analyst|fp&a|general ledger|gaap|ifrs|dcf|cpa|chartered accountant|investment banking|audit compliance)\b/i,
    reason: 'Experimental coverage: financial modeling terms are recognized, but accounting/regulatory competencies are not comprehensively modeled.',
  },
  {
    domainId: 'marketing',
    label: 'Marketing & Growth',
    tier: 'experimental',
    pattern: /\b(?:growth marketing|seo|sem|lifecycle email|brand marketing|content strategist|campaign analytics|hubspot)\b/i,
    reason: 'Experimental coverage: select digital/SEO terms are recognized, but channel attribution and creative competencies are not fully modeled.',
  },
  {
    domainId: 'business_ops',
    label: 'Business Operations',
    tier: 'experimental',
    pattern: /\b(?:business operations|bizops|operations analyst|supply chain|procurement|vendor management|process improvement)\b/i,
    reason: 'Experimental coverage: operations roles rely heavily on domain-specific workflows outside HireFlow’s core technical taxonomy.',
  },
  {
    domainId: 'cybersecurity',
    label: 'Cybersecurity',
    tier: 'partial',
    pattern: /\b(?:cybersecurity|soc analyst|siem|splunk|incident response|owasp|penetration testing|appsec|vulnerability management|cissp)\b/i,
    reason: 'Partial coverage: core AppSec/SIEM competencies are evaluated, while compliance frameworks (SOC2/ISO27001) may require manual confirmation.',
  },
  {
    domainId: 'product_management',
    label: 'Product Management',
    tier: 'partial',
    pattern: /\b(?:product manager|product management|product owner|roadmap prioritization|prd|a\/b testing|product analytics)\b/i,
    reason: 'Partial coverage: roadmapping, experimentation, and analytics are evaluated; executive/stakeholder judgment is not scored deterministically.',
  },
  {
    domainId: 'design_ux',
    label: 'Design & UX',
    tier: 'partial',
    pattern: /\b(?:ux designer|ui\/ux|product designer|figma|ux research|usability testing|design systems|interaction design)\b/i,
    reason: 'Partial coverage: Figma, UX research, and design systems are recognized; visual portfolio quality cannot be evaluated from resume text alone.',
  },
  {
    domainId: 'cloud_devops',
    label: 'Cloud & DevOps / SRE',
    tier: 'supported',
    pattern: /\b(?:devops|sre|site reliability|cloud engineer|kubernetes|terraform|aws|gcp|azure|ci\/cd|docker)\b/i,
    reason: 'Supported domain with structured cloud, container, IaC, and observability competency matching.',
  },
  {
    domainId: 'data_analytics',
    label: 'Data & Analytics / ML',
    tier: 'supported',
    pattern: /\b(?:data engineer|data scientist|data analyst|machine learning|ml engineer|tableau|power bi|dbt|spark|airflow|sql)\b/i,
    reason: 'Supported domain with SQL, BI, ETL, and ML competency matching.',
  },
  {
    domainId: 'software_engineering',
    label: 'Software Engineering',
    tier: 'supported',
    pattern: /\b(?:software engineer|backend|frontend|full[-\s]*stack|sde|developer|react|python|java|typescript|node\.js|golang)\b/i,
    reason: 'Supported domain with full lexical, ontology, citation, and seniority evaluation.',
  },
];

export function classifyJdStateAndDomain(
  jdText: string,
  jdAnalysis: JdAnalysis,
  requiredYears?: number
): {
  jdState: JdInputState;
  domainCapability: DomainCapability;
  contradictionDetected: boolean;
} {
  const trimmed = (jdText || '').trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const mustCount = jdAnalysis.requiredSkills.filter((r) => r.required === 'must').length;
  const totalSkills = jdAnalysis.requiredSkills.length;
  const hasEduOrCerts = Boolean(jdAnalysis.requiredEducation || (jdAnalysis.requiredCerts && jdAnalysis.requiredCerts.length > 0));

  const titleAndBody = `${jdAnalysis.roleTitle} ${trimmed}`;
  const matchedRule =
    DOMAIN_RULES.find((r) => r.pattern.test(jdAnalysis.roleTitle)) ??
    DOMAIN_RULES.find((r) => r.pattern.test(titleAndBody));

  const domainCapability: DomainCapability = matchedRule
    ? {
        domainId: matchedRule.domainId,
        label: matchedRule.label,
        tier: matchedRule.tier,
        reason: matchedRule.reason,
      }
    : totalSkills > 0
      ? {
          domainId: 'software_engineering',
          label: 'Technical / General Engineering',
          tier: 'supported',
          reason: 'Evaluated against HireFlow technical competency taxonomy.',
        }
      : {
          domainId: 'unknown',
          label: 'Unrecognized / Unsupported Domain',
          tier: 'unsupported',
          reason: 'No supported domain competencies were identified in this job description.',
        };

  // Detect explicit seniority contradiction (e.g. "Intern / Entry-level" requiring 3+ YOE)
  const isEntryTitle = /\b(?:intern|internship|fresher|entry[\s-]*level|graduate|junior)\b/i.test(
    `${jdAnalysis.roleTitle} ${trimmed.slice(0, 200)}`
  );
  const effectiveYears = Math.max(jdAnalysis.detectedYears ?? 0, requiredYears ?? 0);
  const contradictionDetected = Boolean(isEntryTitle && effectiveYears >= 3);

  let jdState: JdInputState;
  if (!trimmed) {
    jdState = 'no_jd';
  } else if (totalSkills === 0 && hasEduOrCerts && matchedRule?.tier !== 'unsupported') {
    jdState = 'edu_cert_only';
  } else if (matchedRule?.tier === 'unsupported' && totalSkills === 0) {
    jdState = 'unsupported_domain';
  } else if (words < 12 && totalSkills === 0 && !hasEduOrCerts) {
    jdState = 'insufficient_context';
  } else if (totalSkills === 0) {
    jdState = 'no_requirements_recognized';
  } else if (mustCount === 0) {
    jdState = 'preferred_only';
  } else if (contradictionDetected || (jdAnalysis.unresolvedRequirements && jdAnalysis.unresolvedRequirements.length > 0)) {
    jdState = 'ambiguous_or_contradictory';
  } else {
    jdState = 'supported_technical';
  }

  return { jdState, domainCapability, contradictionDetected };
}
