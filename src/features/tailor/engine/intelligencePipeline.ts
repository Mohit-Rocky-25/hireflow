// ============================================================
// HireFlow — Phase 11.1 7-Layer Resume Intelligence Engine
// Deterministic document parsing, atomic claim extraction,
// mode-specific diagnosis & strategy, truth-gate enforcement,
// and pre-finalization validation without inventing facts.
// ============================================================

import { parseResumeRawText } from '@/lib/tailor/parser/resumeParser';
import { extractMetricsFromText } from '@/lib/tailor/ledger/factLedger';
import { extractSkillsFromText } from '@/lib/tailor/knowledge/skillsTaxonomy';
import { tailorBulletPoint } from '@/lib/tailor/engine/bulletTailor';
import { verifyFactualIntegrity } from '@/lib/tailor/engine/truthGate';
import { parseJobDescription } from '@/lib/tailor/parser/jobParser';
import { runAtsEngine } from '@/lib/ats';
import type {
  CandidateProfile as LegacyTailorProfile,
  TailoredResume,
  TailoredSection,
} from '@/lib/tailor/types';
import { CLAIM_STRENGTH_LADDER } from '@/config/thresholds';
import type {
  AtomicClaim,
  ClaimVerificationStatus,
  ProvenanceKind,
  RequirementAssessment,
  StructuredResumeDocument,
  StructuredResumeSection,
  TailorLayoutId,
  TailorMode,
  TailorSuggestion,
  UserConfirmedEvidenceRecord,
  ValidationFinding,
  ValidationReport,
} from '../model/tailorWorkspaceTypes';

const WEAK_OPENER_REGEX = /^(?:responsible for|worked on|helped with|assisted with|involved in|tasked with|handled|participated in|did)\s+/i;

const ACTION_VERBS_REQUIRING_OUTCOME = /^(?:worked|helped|assisted|participated|handled)\b/i;

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function classifyExperienceProvenance(orgOrTitle: string, sectionHeader = ''): ProvenanceKind {
  const combined = `${orgOrTitle} ${sectionHeader}`.toLowerCase();
  if (/\bintern(?:ship)?\b/.test(combined)) return 'internship';
  if (/\bapprentice(?:ship)?\b/.test(combined)) return 'apprenticeship';
  if (/\bfreelance|contract|consultant\b/.test(combined)) return 'freelance';
  if (/\bpart[- ]?time\b/.test(combined)) return 'part_time';
  if (/\bresearch\s+assistant|lab\b/.test(combined)) return 'research';
  if (/\bvolunteer\b/.test(combined)) return 'volunteering';
  return 'full_time';
}

function classifyProjectProvenance(title: string, subtitle = ''): ProvenanceKind {
  const combined = `${title} ${subtitle}`.toLowerCase();
  if (/\bopen[- ]?source|oss|pull request|maintainer\b/.test(combined)) return 'open_source';
  if (/\bacademic|capstone|course|thesis|university\b/.test(combined)) return 'academic_project';
  if (/\bresearch|paper|study|experiment\b/.test(combined)) return 'research';
  return 'personal_project';
}

function mapCustomSectionKind(
  sk?: NonNullable<LegacyTailorProfile['customSections']>[number]['sectionKind']
): StructuredResumeSection['kind'] {
  if (sk === 'research') return 'research';
  if (sk === 'awards') return 'awards';
  if (sk === 'leadership' || sk === 'volunteering' || sk === 'extracurricular') return 'leadership';
  return 'custom';
}

function mapCustomProvenance(
  sk?: NonNullable<LegacyTailorProfile['customSections']>[number]['sectionKind']
): ProvenanceKind {
  if (sk === 'research') return 'research';
  if (sk === 'volunteering') return 'volunteering';
  if (sk === 'open_source') return 'open_source';
  if (sk === 'coursework') return 'coursework';
  return 'leadership';
}

function parseCustomSectionEntries(
  items: string[],
  provenance: ProvenanceKind,
  prefix: string
): StructuredResumeSection['entries'] {
  const entries: NonNullable<StructuredResumeSection['entries']> = [];
  let activeEntry: NonNullable<StructuredResumeSection['entries']>[number] | null = null;
  let looseBullets: NonNullable<StructuredResumeSection['entries']>[number]['bullets'] = [];

  for (let i = 0; i < items.length; i++) {
    const raw = items[i].trim();
    if (!raw) continue;
    const isBullet = /^[-•*]\s+/.test(raw) || /^\d+\.\s+/.test(raw);
    const clean = raw.replace(/^(?:[-•*]|\d+\.)\s+/, '').trim();

    if (!isBullet && (raw.includes('|') || /\s+[—-]\s+/.test(raw))) {
      if (looseBullets.length > 0) {
        entries.push({
          id: `${prefix}_list_${entries.length}`,
          title: '',
          provenance,
          bullets: looseBullets,
        });
        looseBullets = [];
      }
      if (activeEntry) entries.push(activeEntry);
      const parts = raw.split(/\s*[|—]\s*|\s+-\s+/).map((p) => p.trim());
      activeEntry = {
        id: `${prefix}_${entries.length}`,
        title: parts[0] || clean,
        organization: parts[1] || undefined,
        dateRange: parts[2] || undefined,
        provenance,
        bullets: [],
      };
    } else if (isBullet && activeEntry) {
      activeEntry.bullets.push({
        id: `b_${prefix}_${entries.length}_${activeEntry.bullets.length}`,
        text: clean,
        originalText: clean,
        provenance,
        linkedClaimIds: [],
      });
    } else if (activeEntry) {
      activeEntry.bullets.push({
        id: `b_${prefix}_${entries.length}_${activeEntry.bullets.length}`,
        text: clean,
        originalText: clean,
        provenance,
        linkedClaimIds: [],
      });
    } else {
      looseBullets.push({
        id: `b_${prefix}_loose_${looseBullets.length}`,
        text: clean,
        originalText: clean,
        provenance,
        linkedClaimIds: [],
      });
    }
  }

  if (activeEntry) entries.push(activeEntry);
  if (looseBullets.length > 0) {
    entries.push({
      id: `${prefix}_list_${entries.length}`,
      title: '',
      provenance,
      bullets: looseBullets,
    });
  }
  return entries;
}

/**
 * Layer 1: Parses raw resume text into an extensible, provenance-aware StructuredResumeDocument.
 * Preserves identity, optional sections in source order, non-technical skills, and custom blocks without fabrication.
 */
export function parseSourceToStructuredDocument(
  rawText: string,
  layoutId: TailorLayoutId = 'ats_single'
): StructuredResumeDocument {
  const normalized = (rawText || '').replace(/\r\n/g, '\n').trim();
  const parsed = parseResumeRawText(normalized, undefined, { preserveEmptyBullets: true });

  const sections: StructuredResumeSection[] = [];
  const addedKeys = new Set<string>();
  let order = 0;

  const pushSummary = (title = 'Professional Summary') => {
    if (addedKeys.has('summary') || !parsed.summary?.trim()) return;
    addedKeys.add('summary');
    sections.push({
      id: 'sec_summary',
      kind: 'summary',
      title,
      visible: true,
      order: order++,
      summaryText: parsed.summary.trim(),
    });
  };

  const pushExperience = (title = 'Experience') => {
    if (addedKeys.has('experience') || parsed.experience.length === 0) return;
    addedKeys.add('experience');
    const employmentEntries = parsed.experience.map((exp, idx) => {
      const provenance = classifyExperienceProvenance(`${exp.position} ${exp.company}`, title);
      const dateRange = [exp.startDate, exp.isCurrent ? 'Present' : exp.endDate]
        .filter(Boolean)
        .join(' - ');
      return {
        id: exp.id || `exp_${idx}`,
        title: exp.position || exp.company || '',
        organization: exp.position ? exp.company || undefined : undefined,
        location: exp.location,
        dateRange: dateRange || undefined,
        provenance,
        technologies: exp.technologiesUsed,
        bullets: (exp.bullets || []).map((b, bIdx) => ({
          id: `b_exp_${idx}_${bIdx}`,
          text: b,
          originalText: b,
          provenance,
          linkedClaimIds: [],
        })),
      };
    });
    sections.push({
      id: 'sec_experience',
      kind: 'experience',
      title,
      visible: true,
      order: order++,
      entries: employmentEntries,
    });
  };

  const pushProjects = (title = 'Projects') => {
    if (addedKeys.has('projects') || parsed.projects.length === 0) return;
    addedKeys.add('projects');
    sections.push({
      id: 'sec_projects',
      kind: 'projects',
      title,
      visible: true,
      order: order++,
      entries: parsed.projects.map((proj, idx) => {
        // Keep project entries in Projects section (never promote to employment), preserving accurate project/intern/OSS provenance
        const roleCombined = `${proj.title} ${proj.subtitle || ''} ${proj.role || ''}`.toLowerCase();
        const provenance: ProvenanceKind = /\bintern(?:ship)?\b/.test(roleCombined)
          ? 'internship'
          : classifyProjectProvenance(proj.title, proj.subtitle || proj.role || '');
        const dateRange = [proj.startDate, proj.endDate].filter(Boolean).join(' - ');
        return {
          id: proj.id || `proj_${idx}`,
          title: proj.title || 'Project',
          organization: proj.role || undefined,
          dateRange: dateRange || undefined,
          provenance,
          technologies: proj.technologiesUsed,
          bullets: (proj.bullets || []).map((b, bIdx) => ({
            id: `b_proj_${idx}_${bIdx}`,
            text: b,
            originalText: b,
            provenance,
            linkedClaimIds: [],
          })),
        };
      }),
    });
  };

  const pushSkills = (title = 'Skills & Competencies', explicitOnly = false) => {
    if (addedKeys.has('skills')) return;
    const explicitTokens = parsed.extractedSkillRecords?.map((r) => r.rawSkill) ?? [];
    const fallbackSkills = explicitOnly
      ? []
      : [
          ...(parsed.skills.languages || []),
          ...(parsed.skills.frameworks || []),
          ...(parsed.skills.developerTools || []),
          ...(parsed.skills.cloudAndDevOps || []),
          ...(parsed.skills.databases || []),
          ...(parsed.skills.coreConcepts || []),
          ...(parsed.skills.softSkills || []),
          ...(parsed.skills.other || []),
        ].filter(Boolean);
    const allSkills = explicitTokens.length > 0 ? explicitTokens : fallbackSkills;
    if (allSkills.length === 0) return;
    addedKeys.add('skills');
    sections.push({
      id: 'sec_skills',
      kind: 'skills',
      title,
      visible: true,
      order: order++,
      skillsList: Array.from(new Set(allSkills)),
    });
  };

  const pushEducation = (title = 'Education') => {
    if (addedKeys.has('education') || parsed.education.length === 0) return;
    addedKeys.add('education');
    sections.push({
      id: 'sec_education',
      kind: 'education',
      title,
      visible: true,
      order: order++,
      entries: parsed.education.map((edu, idx) => {
        const degTitle =
          edu.fieldOfStudy && !edu.degree.toLowerCase().includes(edu.fieldOfStudy.toLowerCase())
            ? `${edu.degree} in ${edu.fieldOfStudy}`
            : edu.degree || edu.rawText || 'Education';
        return {
          id: edu.id || `edu_${idx}`,
          title: degTitle,
          organization: edu.institution || undefined,
          dateRange: [edu.startDate, edu.endDate].filter(Boolean).join(' - ') || undefined,
          provenance: 'coursework',
          bullets: edu.scoreValue
            ? [
                {
                  id: `b_edu_${idx}_0`,
                  text: `Academic score: ${edu.scoreValue}${edu.honors ? ` (${edu.honors})` : ''}`,
                  originalText: `Academic score: ${edu.scoreValue}${edu.honors ? ` (${edu.honors})` : ''}`,
                  provenance: 'coursework',
                  linkedClaimIds: [],
                },
              ]
            : [],
        };
      }),
    });
  };

  const pushCertifications = (title = 'Certifications & Credentials') => {
    if (addedKeys.has('certifications') || parsed.certifications.length === 0) return;
    addedKeys.add('certifications');
    sections.push({
      id: 'sec_certifications',
      kind: 'certifications',
      title,
      visible: true,
      order: order++,
      entries: parsed.certifications.map((cert, idx) => ({
        id: cert.id || `cert_${idx}`,
        title: cert.name,
        organization: cert.issuer || undefined,
        dateRange: cert.issueDate,
        provenance: 'certification' as ProvenanceKind,
        bullets: [],
      })),
    });
  };

  const pushedCustomIds = new Set<string>();
  const pushCustomByTitle = (title: string) => {
    const match = parsed.customSections?.find(
      (cs) => cs.title === title && !pushedCustomIds.has(cs.id)
    );
    if (!match) return;
    pushedCustomIds.add(match.id);
    const prov = mapCustomProvenance(match.sectionKind);
    sections.push({
      id: match.id,
      kind: mapCustomSectionKind(match.sectionKind),
      title: match.title,
      visible: true,
      order: order++,
      entries: parseCustomSectionEntries(match.items, prov, match.id),
    });
  };

  // Preserve original section order while keeping canonical UI/ledger names for standard sections
  for (const block of parsed.sectionOrder || []) {
    if (block.key === 'summary') pushSummary('Professional Summary');
    else if (block.key === 'experience') pushExperience('Experience');
    else if (block.key === 'projects') pushProjects('Projects');
    else if (block.key === 'skills') pushSkills('Skills & Competencies', false);
    else if (block.key === 'education') {
      const eduLabel = block.title.includes('/') || block.title.includes('|') ? block.title : 'Education';
      pushEducation(eduLabel);
    } else if (block.key === 'certifications') pushCertifications('Certifications & Credentials');
    else pushCustomByTitle(block.title);
  }

  pushSummary();
  pushExperience();
  pushProjects();
  pushSkills('Skills & Competencies', true);
  pushEducation();
  pushCertifications();
  for (const cs of parsed.customSections || []) {
    if (!pushedCustomIds.has(cs.id)) {
      pushCustomByTitle(cs.title);
    }
  }

  // Fallback section when unstructured prose resume is pasted without recognized headers
  if (sections.length === 0 && normalized.length > 0) {
    const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean);
    sections.push({
      id: 'sec_custom_source',
      kind: 'custom',
      title: 'Candidate Background',
      visible: true,
      order: 0,
      entries: [
        {
          id: 'entry_unstructured',
          title: 'Source Highlights',
          provenance: 'full_time',
          bullets: lines.slice(1, 25).map((line, i) => ({
            id: `b_raw_${i}`,
            text: line.replace(/^[-•*]\s*/, ''),
            originalText: line.replace(/^[-•*]\s*/, ''),
            provenance: 'full_time',
            linkedClaimIds: [],
          })),
        },
      ],
    });
  }

  return {
    candidateName: parsed.fullName || 'Candidate',
    contact: parsed.contact || {},
    layoutId,
    paperSize: 'a4',
    rawSourceText: rawText,
    sections,
  };
}

/**
 * Layer 2: Decomposes the IMMUTABLE baseline source document into AtomicClaims preserving provenance.
 * Never re-extracts claims from unverified working edits in `doc`.
 */
export function extractAtomicClaims(
  doc: StructuredResumeDocument,
  meta: {
    workspaceId: string | null;
    versionId: string | null;
    snapshotHash: string | null;
  },
  userConfirmations: UserConfirmedEvidenceRecord[] = []
): AtomicClaim[] {
  const claims: AtomicClaim[] = [];
  const sourceDoc = doc.rawSourceText?.trim()
    ? parseSourceToStructuredDocument(doc.rawSourceText, doc.layoutId)
    : doc;

  for (const sec of sourceDoc.sections) {
    if (sec.kind === 'summary' && sec.summaryText?.trim()) {
      const skills = extractSkillsFromText(sec.summaryText);
      claims.push({
        claimId: `claim_summary_${claims.length + 1}`,
        claimText: sec.summaryText.trim(),
        sourceWorkspaceId: meta.workspaceId,
        sourceVersionId: meta.versionId,
        sourceSnapshotHash: meta.snapshotHash,
        sourceSectionId: sec.id,
        sourceSectionTitle: sec.title,
        bulletId: null,
        provenanceKind: 'full_time',
        evidenceExcerpts: [sec.summaryText.trim()],
        normalizedConcepts: skills.map((s) => s.name),
        extractedMetrics: extractMetricsFromText(sec.summaryText),
        verificationStatus: 'directly_supported',
        userConfirmed: false,
      });
    }

    if (sec.kind === 'skills' && sec.skillsList?.length) {
      for (const sk of sec.skillsList) {
        const mapped = extractSkillsFromText(sk);
        claims.push({
          claimId: `claim_skill_${claims.length + 1}`,
          claimText: sk,
          sourceWorkspaceId: meta.workspaceId,
          sourceVersionId: meta.versionId,
          sourceSnapshotHash: meta.snapshotHash,
          sourceSectionId: sec.id,
          sourceSectionTitle: sec.title,
          bulletId: null,
          provenanceKind: 'full_time',
          evidenceExcerpts: [sk],
          normalizedConcepts: Array.from(new Set([sk, ...mapped.map((m) => m.name)])),
          extractedMetrics: [],
          verificationStatus: 'directly_supported',
          userConfirmed: false,
        });
      }
    }

    for (const entry of sec.entries || []) {
      if (entry.title || entry.organization) {
        const headerLine = [entry.title, entry.organization, entry.dateRange]
          .filter(Boolean)
          .join(' | ');
        if (headerLine) {
          claims.push({
            claimId: `claim_entry_${entry.id}`,
            claimText: headerLine,
            sourceWorkspaceId: meta.workspaceId,
            sourceVersionId: meta.versionId,
            sourceSnapshotHash: meta.snapshotHash,
            sourceSectionId: sec.id,
            sourceSectionTitle: sec.title,
            bulletId: null,
            provenanceKind: entry.provenance,
            evidenceExcerpts: [headerLine],
            normalizedConcepts: entry.technologies || [],
            extractedMetrics: [],
            verificationStatus: 'directly_supported',
            userConfirmed: false,
          });
        }
      }
      for (const bullet of entry.bullets) {
        if (!bullet.text.trim()) continue;
        const skills = extractSkillsFromText(`${bullet.text} ${(entry.technologies || []).join(' ')}`);
        const metrics = extractMetricsFromText(bullet.text);
        const claimId = `claim_${bullet.id}`;
        claims.push({
          claimId,
          claimText: bullet.text.trim(),
          sourceWorkspaceId: meta.workspaceId,
          sourceVersionId: meta.versionId,
          sourceSnapshotHash: meta.snapshotHash,
          sourceSectionId: sec.id,
          sourceSectionTitle: sec.title,
          bulletId: bullet.id,
          provenanceKind: bullet.provenance,
          evidenceExcerpts: [bullet.originalText || bullet.text],
          normalizedConcepts: Array.from(new Set(skills.map((s) => s.name))),
          extractedMetrics: metrics,
          verificationStatus: 'directly_supported',
          userConfirmed: false,
        });
      }
    }
  }

  for (const conf of userConfirmations) {
    const skills = extractSkillsFromText(`${conf.factText} ${conf.targetSkillOrMetric}`);
    claims.push({
      claimId: `claim_user_${conf.id}`,
      claimText: conf.factText,
      sourceWorkspaceId: meta.workspaceId,
      sourceVersionId: meta.versionId,
      sourceSnapshotHash: meta.snapshotHash,
      sourceSectionId: 'user_confirmed',
      sourceSectionTitle: 'Candidate-Confirmed Evidence (User-Attested)',
      bulletId: conf.appliedToBulletId ?? null,
      provenanceKind: 'full_time',
      evidenceExcerpts: [conf.evidenceNote || conf.factText],
      normalizedConcepts: Array.from(
        new Set([
          ...skills.map((s) => s.name),
          ...conf.targetSkillOrMetric.split(/[,;]/).map((t) => t.trim()).filter(Boolean),
        ])
      ),
      extractedMetrics: extractMetricsFromText(conf.factText),
      verificationStatus: 'user_confirmed',
      userConfirmed: true,
      confirmationMeta: {
        confirmedBy: conf.confirmedBy,
        confirmedAt: conf.confirmedAt,
        evidenceNote: conf.evidenceNote,
      },
    });
  }

  return claims;
}

const SENIORITY_AND_LEADERSHIP_REGEX = /\b(principal|staff|distinguished|chief\s+architect|director|vice\s+president|vp\s+of|cto|ceo|cfo|cio|head\s+of|engineering\s+manager|team\s+lead|tech\s+lead|architect|founder)\b/gi;
const EMPLOYER_PHRASE_REGEX = /\b(?:at|@)\s+([A-Z][A-Za-z0-9&.'-]*(?:\s+[A-Z][A-Za-z0-9&.'-]*){0,2})/g;
const NON_ORG_PROPER_TOKENS = new Set([
  'scale', 'peak', 'rest', 'risk', 'best', 'full', 'large', 'high', 'low', 'most', 'least',
  'once', 'all', 'first', 'last', 'runtime', 'compile', 'build', 'work', 'home', 'night',
  'edge', 'startup', 'enterprise', 'production',
]);
const NON_TECH_CREDENTIALS_REGEX = /\b(SOC\s*2(?:\s+Compliance)?|HIPAA(?:\s+Compliance)?|ISO\s*27001|GDPR|PCI[- ]?DSS|FedRAMP|PMP|CFA|CPA|CISSP|CCNA|FINRA|SOX|GAAP|GMP|Six\s+Sigma(?:\s+Black\s+Belt|\s+Green\s+Belt)?|ITIL)\b/gi;
const YEARS_OF_EXP_REGEX = /\b(\d+\+?)\s*(?:years?|yrs?)\b/gi;
const TEAM_SIZE_REGEX = /\b(\d+\+?)\s*(?:engineers?|developers?|reports?|people|members?|specialists?|analysts?|staff)\b|\b(?:team|org|organization|group|squad)\s+of\s+(\d+\+?)\b/gi;
const CLIENT_CUSTOMER_REGEX = /\b(?:for|serving|across|with)\s+(?:Fortune\s+\d+|(?:enterprise|banking|healthcare|government|global|fintech)\s+(?:clients?|customers?|accounts?)|\d+\+?\s*(?:clients?|customers?|enterprise\s+accounts?))\b/gi;
const BUSINESS_RESULT_REGEX = /\b(?:ARR|MRR|EBITDA|GMV|revenue|ROI|profit\s+margin|cost\s+savings?)\b/gi;
const COMPLETION_CLAIMS_REGEX = /\b(?:launched\s+to\s+production|shipped\s+to\s+production|live\s+in\s+production|production\s+launch)\b/gi;

function detectEntityAndScopeViolations(
  text: string,
  allowedCorpusLower: string,
  sectionTitle: string
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!text.trim()) return findings;

  // 1. Named employers ("at Google", "@ OpenAI")
  let m: RegExpExecArray | null;
  EMPLOYER_PHRASE_REGEX.lastIndex = 0;
  while ((m = EMPLOYER_PHRASE_REGEX.exec(text)) !== null) {
    const org = m[1].trim();
    const firstWord = org.split(/\s+/)[0].toLowerCase();
    if (NON_ORG_PROPER_TOKENS.has(firstWord) || org.length < 2) continue;
    if (!allowedCorpusLower.includes(org.toLowerCase())) {
      findings.push({
        id: `val_org_${org.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified employer/organization "${org}" in ${sectionTitle} is not present in candidate source or confirmed evidence.`,
        sectionTitle,
      });
    }
  }

  // 2. Seniority / executive / leadership title assertions
  SENIORITY_AND_LEADERSHIP_REGEX.lastIndex = 0;
  while ((m = SENIORITY_AND_LEADERSHIP_REGEX.exec(text)) !== null) {
    const roleToken = m[1].trim();
    if (!allowedCorpusLower.includes(roleToken.toLowerCase())) {
      findings.push({
        id: `val_role_${roleToken.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified title/seniority claim "${roleToken}" in ${sectionTitle} is not grounded in source resume.`,
        sectionTitle,
      });
    }
  }

  // 3. Years of experience assertions
  YEARS_OF_EXP_REGEX.lastIndex = 0;
  while ((m = YEARS_OF_EXP_REGEX.exec(text)) !== null) {
    const yrToken = m[0].trim();
    const numOnly = m[1];
    if (!allowedCorpusLower.includes(yrToken.toLowerCase()) && !new RegExp(`\\b${numOnly.replace('+', '\\+')}\\s*(?:years?|yrs?)\\b`, 'i').test(allowedCorpusLower)) {
      findings.push({
        id: `val_years_${numOnly}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified tenure/experience duration "${yrToken}" in ${sectionTitle}.`,
        sectionTitle,
      });
    }
  }

  // 4. Team / org size assertions
  TEAM_SIZE_REGEX.lastIndex = 0;
  while ((m = TEAM_SIZE_REGEX.exec(text)) !== null) {
    const sizePhrase = m[0].trim();
    const num = m[1] || m[2];
    if (!allowedCorpusLower.includes(sizePhrase.toLowerCase()) && !new RegExp(`\\b${num.replace('+', '\\+')}\\b`, 'i').test(allowedCorpusLower)) {
      findings.push({
        id: `val_team_${num}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified leadership scope / team size "${sizePhrase}" in ${sectionTitle}.`,
        sectionTitle,
      });
    }
  }

  // 5. Non-taxonomy compliance/certification/domain credentials
  NON_TECH_CREDENTIALS_REGEX.lastIndex = 0;
  while ((m = NON_TECH_CREDENTIALS_REGEX.exec(text)) !== null) {
    const cred = m[1].trim();
    if (!allowedCorpusLower.includes(cred.toLowerCase())) {
      findings.push({
        id: `val_cred_${cred.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified qualification/credential "${cred}" in ${sectionTitle} without source or candidate confirmation.`,
        sectionTitle,
      });
    }
  }

  // 6. Fabricated client / customer claims
  CLIENT_CUSTOMER_REGEX.lastIndex = 0;
  while ((m = CLIENT_CUSTOMER_REGEX.exec(text)) !== null) {
    const phrase = m[0].trim();
    if (!allowedCorpusLower.includes(phrase.toLowerCase())) {
      findings.push({
        id: `val_client_${phrase.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified client/customer claim "${phrase}" in ${sectionTitle} without source evidence or confirmation.`,
        sectionTitle,
      });
    }
  }

  // 7. Invented business / revenue outcomes
  BUSINESS_RESULT_REGEX.lastIndex = 0;
  while ((m = BUSINESS_RESULT_REGEX.exec(text)) !== null) {
    const biz = m[0].trim();
    if (!allowedCorpusLower.includes(biz.toLowerCase())) {
      findings.push({
        id: `val_biz_${biz.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified business outcome "${biz}" in ${sectionTitle} without source evidence or confirmation.`,
        sectionTitle,
      });
    }
  }

  // 8. Unsupported production completion claims
  COMPLETION_CLAIMS_REGEX.lastIndex = 0;
  while ((m = COMPLETION_CLAIMS_REGEX.exec(text)) !== null) {
    const comp = m[0].trim();
    if (!allowedCorpusLower.includes(comp.toLowerCase())) {
      findings.push({
        id: `val_completion_${comp.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified project/product completion claim "${comp}" in ${sectionTitle}.`,
        sectionTitle,
      });
    }
  }

  return findings;
}

function getVerbRank(text: string): number {
  const clean = text.replace(/^[-•*►›\d.]+\s*/, '').trim().toLowerCase();
  if (!clean) return 0;
  const firstTwo = clean.split(/\s+/).slice(0, 2).join(' ');
  const first = clean.split(/\s+/)[0] || '';
  return CLAIM_STRENGTH_LADDER[firstTwo] ?? CLAIM_STRENGTH_LADDER[first] ?? 3;
}

/**
 * Layer 7 Fact Check for single bullet proposal or inline edit:
 * Ensures zero invented metrics, zero fabricated skills, zero entity/title hallucinations,
 * and no ownership rank inflation unless backed by immutable source claims or user confirmations.
 */
export function verifySingleProposalTruth(
  originalText: string,
  proposedText: string,
  claims: AtomicClaim[]
): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  const trimmedProposed = proposedText.trim();
  const trimmedOrig = originalText.trim();

  // Exact match to an explicitly user-confirmed claim passes
  if (claims.some((c) => c.userConfirmed && c.claimText.trim() === trimmedProposed)) {
    return { passed: true, issues: [] };
  }

  const baselineMetrics = new Set<string>();
  extractMetricsFromText(trimmedOrig).forEach((m) => baselineMetrics.add(m.toLowerCase().replace(/\s+/g, '')));
  claims.forEach((c) => c.extractedMetrics.forEach((m) => baselineMetrics.add(m.toLowerCase().replace(/\s+/g, ''))));

  const proposedMetrics = extractMetricsFromText(trimmedProposed);
  for (const pm of proposedMetrics) {
    const norm = pm.toLowerCase().replace(/\s+/g, '');
    if (!baselineMetrics.has(norm)) {
      issues.push(`Unverified metric "${pm}" is not present in source resume or confirmed evidence.`);
    }
  }

  const corpusLower = [trimmedOrig, ...claims.map((c) => `${c.claimText} ${c.evidenceExcerpts.join(' ')}`)].join('\n').toLowerCase();
  const exactInSource = trimmedProposed.length > 0 && corpusLower.includes(trimmedProposed.toLowerCase());

  const origRank = trimmedOrig ? getVerbRank(trimmedOrig) : exactInSource ? getVerbRank(trimmedProposed) : 1;
  const propRank = getVerbRank(trimmedProposed);
  if (propRank > origRank) {
    issues.push(`Verb rank escalated (from level ${origRank} to ${propRank}) without new ownership proof.`);
  }

  const knownConcepts = new Set<string>(
    claims.flatMap((c) => c.normalizedConcepts.map((n) => n.toLowerCase()))
  );
  extractSkillsFromText(trimmedOrig).forEach((s) => knownConcepts.add(s.name.toLowerCase()));
  claims.filter((c) => c.userConfirmed).forEach((c) => {
    extractSkillsFromText(c.claimText).forEach((s) => knownConcepts.add(s.name.toLowerCase()));
  });
  for (const ps of extractSkillsFromText(trimmedProposed)) {
    if (!knownConcepts.has(ps.name.toLowerCase())) {
      issues.push(`Unverified skill "${ps.name}" is not present in source claims or confirmed evidence.`);
    }
  }

  for (const finding of detectEntityAndScopeViolations(trimmedProposed, corpusLower, 'Proposal')) {
    issues.push(finding.message);
  }

  return { passed: issues.length === 0, issues };
}

/**
 * Layers 3–6: Evaluates document under Improve, Role, or JD mode,
 * producing strategy plan, requirement matrix, and reviewable suggestions.
 */
export function analyzeTailorWorkspace(params: {
  doc: StructuredResumeDocument;
  claims: AtomicClaim[];
  mode: TailorMode;
  targetRole: string;
  targetSeniority?: string;
  jdText: string;
  demonstratedEvidenceLabels?: string[];
  missingQualificationLabels?: string[];
}): {
  strategyPlan: string[];
  requirements: RequirementAssessment[];
  suggestions: TailorSuggestion[];
  baselineScore: number | null;
} {
  const {
    doc,
    claims,
    mode,
    targetRole,
    jdText,
    demonstratedEvidenceLabels = [],
    missingQualificationLabels = [],
  } = params;

  const suggestions: TailorSuggestion[] = [];
  const strategyPlan: string[] = [];
  const requirements: RequirementAssessment[] = [];
  let baselineScore: number | null = null;

  const serialized = serializeDocumentToText(doc);

  // Mode 3: JD parsing & requirement coverage using canonical ATS engine + jobParser
  if (mode === 'jd' && jdText.trim().length > 20) {
    const atsResponse = runAtsEngine(serialized, jdText);
    const parsedJd = parseJobDescription(jdText);

    if (atsResponse.success) {
      const atsResult = atsResponse.result;
      baselineScore = atsResult.score;

      strategyPlan.push(
        `Align resume presentation to "${parsedJd.title || targetRole || 'Target JD'}" using verified claims only.`,
        `Prioritize experience and project bullets matching ${atsResult.skillResults.filter((s) => s.found).length} demonstrated skills while flagging ${atsResult.skillResults.filter((s) => !s.found).length} unverified requirements honestly.`
      );

      atsResult.skillResults.forEach((sr, idx) => {
        const matchedClaim = claims.find((c) =>
          c.normalizedConcepts.some((nc) => nc.toLowerCase() === sr.canonical.toLowerCase()) ||
          c.claimText.toLowerCase().includes(sr.canonical.toLowerCase())
        );

        let status: RequirementAssessment['status'] = 'not_found';
        if (matchedClaim?.userConfirmed) status = 'user_confirmed';
        else if (sr.status === 'verified' || matchedClaim) status = 'directly_demonstrated';
        else if (sr.status === 'weak') status = 'partially_supported';
        else if (sr.matchResult?.status === 'RELATED_BUT_NOT_EQUIVALENT') status = 'transferable';
        else if (sr.matchResult?.status === 'CONTRADICTED') status = 'contradicted';
        else status = 'missing_evidence';

        requirements.push({
          id: `req_${idx}_${sr.canonical}`,
          requirementText: sr.canonical,
          priority: sr.required === 'must' ? 'required' : 'preferred',
          logicalOperator: sr.orGroupId ? 'OR' : 'AND',
          status,
          supportingExcerpts: matchedClaim ? matchedClaim.evidenceExcerpts : [],
          recommendation:
            status === 'directly_demonstrated' || status === 'user_confirmed'
              ? 'Retain and foreground verified evidence excerpt.'
              : status === 'partially_supported' || status === 'transferable'
              ? 'Clarify exact tooling/context where actually used without overclaiming equivalence.'
              : 'Missing from parsed resume — add only if user confirms real background.',
        });
      });
    }
  } else if (mode === 'role') {
    const roleLabel = targetRole.trim() || 'Target Role';
    strategyPlan.push(
      `Adapt section ordering and bullet clarity toward "${roleLabel}" (${params.targetSeniority || 'calibrated level'}).`,
      'Highlight transferable achievements and verified competencies; never fabricate unverified role titles.'
    );
    demonstratedEvidenceLabels.forEach((lbl, idx) => {
      requirements.push({
        id: `tl_demo_${idx}`,
        requirementText: lbl,
        priority: 'required',
        status: 'directly_demonstrated',
        supportingExcerpts: [lbl],
        recommendation: 'Demonstrated in candidate record — keep prominently surfaced.',
      });
    });
    missingQualificationLabels.forEach((lbl, idx) => {
      requirements.push({
        id: `tl_miss_${idx}`,
        requirementText: lbl,
        priority: 'preferred',
        status: 'missing_evidence',
        supportingExcerpts: [],
        recommendation: 'Unverified in source resume — confirm real experience before adding.',
      });
    });
  } else {
    strategyPlan.push(
      'Strengthen weak passive bullet openers into clear action + scope statements.',
      'Identify where measurable impact exists and prompt candidate to confirm real outcomes rather than guessing numbers.',
      'Ensure summary, section order, and chronology are clear for human recruiters and ATS parsers.'
    );
  }

  // Diagnostic pass across every section & bullet
  const targetKeywords = requirements
    .filter((r) => r.status === 'directly_demonstrated' || r.status === 'partially_supported')
    .map((r) => r.requirementText);

  for (const sec of doc.sections) {
    if (sec.kind === 'summary') {
      const summary = sec.summaryText || '';
      if (summary.length < 60) {
        suggestions.push({
          id: makeId('sug_sum'),
          severity: 'recommended',
          mode,
          sectionId: sec.id,
          title: 'Clarify executive positioning summary',
          rationale: 'A concise 2-line summary grounded in your documented skills and role history helps recruiters orient within seconds.',
          originalText: summary,
          proposedText: summary
            ? `${summary.replace(/\.$/, '')}, focused on delivering verifiable outcomes across documented work.`
            : `Experienced candidate bringing verified competencies across ${doc.sections.find((s) => s.kind === 'skills')?.skillsList?.slice(0, 4).join(', ') || 'documented projects and coursework'}.`,
          needsMetricPrompt: false,
          evidenceClass: 'supported_paraphrase',
          evidenceExcerpts: [summary || doc.rawSourceText.slice(0, 120)],
          provenanceKind: 'full_time',
          status: 'pending',
          truthGatePassed: true,
          truthGateIssues: [],
        });
      }
    }

    for (const entry of sec.entries || []) {
      for (const bullet of entry.bullets) {
        const text = bullet.text.trim();
        if (!text) continue;

        const hasWeakOpener = WEAK_OPENER_REGEX.test(text) || ACTION_VERBS_REQUIRING_OUTCOME.test(text);
        const metrics = extractMetricsFromText(text);
        const missingMetric = metrics.length === 0 && text.split(/\s+/).length >= 6;

        if (hasWeakOpener) {
          const transformed = tailorBulletPoint(text, bullet.id, targetKeywords);
          const origRank = getVerbRank(text);
          let safeProposal = transformed.tailoredText;
          if (getVerbRank(safeProposal) > origRank) {
            const remainder = text.replace(WEAK_OPENER_REGEX, '').trim();
            const safeOpener = origRank <= 1 ? 'Supported' : 'Collaborated on';
            const cleanBody = remainder
              ? remainder.charAt(0).toLowerCase() + remainder.slice(1)
              : text.charAt(0).toLowerCase() + text.slice(1);
            safeProposal = `${safeOpener} ${cleanBody}${cleanBody.endsWith('.') ? '' : '.'}`;
          }
          const check = verifySingleProposalTruth(text, safeProposal, claims);
          suggestions.push({
            id: makeId('sug_verb'),
            severity: 'important',
            mode,
            sectionId: sec.id,
            entryId: entry.id,
            bulletId: bullet.id,
            title: `Clarify passive phrasing in "${entry.title}"`,
            rationale: 'Replaces generic passive phrasing cleanly without inflating ownership claims or inventing metrics.',
            originalText: text,
            proposedText: safeProposal,
            needsMetricPrompt: missingMetric,
            metricQuestion: missingMetric
              ? 'Do you have a real, verifiable metric (e.g., latency, scale, volume, turnaround time, or users served) for this work?'
              : undefined,
            evidenceClass: check.passed ? 'supported_paraphrase' : 'unsupported',
            evidenceExcerpts: [bullet.originalText || text],
            provenanceKind: bullet.provenance,
            status: 'pending',
            truthGatePassed: check.passed,
            truthGateIssues: check.issues,
          });
        } else if (missingMetric) {
          suggestions.push({
            id: makeId('sug_metric'),
            severity: 'optional',
            mode,
            sectionId: sec.id,
            entryId: entry.id,
            bulletId: bullet.id,
            title: `Confirm measurable outcome in "${entry.title}"`,
            rationale: 'No verifiable metric was detected in this statement. HireFlow will never invent a number—confirm real impact or keep concise qualitative phrasing.',
            originalText: text,
            proposedText: text,
            needsMetricPrompt: true,
            metricQuestion: 'Supply an authentic outcome, scale, or stakeholder impact if you have one; otherwise reject or keep concise.',
            evidenceClass: 'partially_supported',
            evidenceExcerpts: [bullet.originalText || text],
            provenanceKind: bullet.provenance,
            status: 'pending',
            truthGatePassed: true,
            truthGateIssues: [],
          });
        }
      }
    }
  }

  return { strategyPlan, requirements, suggestions, baselineScore };
}

/**
 * Serializes a StructuredResumeDocument into clean plain-text / Markdown
 * used for Version snapshots, canonical ATS scoring, and diffing.
 */
export function serializeDocumentToText(doc: StructuredResumeDocument): string {
  const lines: string[] = [];
  lines.push(doc.candidateName || 'Candidate');
  if (doc.headline?.trim()) {
    lines.push(doc.headline.trim());
  }

  const contactParts = [
    doc.contact.email,
    doc.contact.phone,
    doc.contact.location,
    doc.contact.linkedin,
    doc.contact.github,
    doc.contact.portfolio,
  ].filter(Boolean);
  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '));
  }
  lines.push('');

  const orderedSections = [...doc.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  for (const sec of orderedSections) {
    lines.push(sec.title.toUpperCase());
    if (sec.kind === 'summary' && sec.summaryText) {
      lines.push(sec.summaryText.trim());
    }
    if (sec.kind === 'skills' && sec.skillsList?.length) {
      lines.push(sec.skillsList.join(', '));
    }
    for (const entry of sec.entries || []) {
      const header = [entry.title, entry.organization, entry.dateRange].filter(Boolean).join(' | ');
      if (header) lines.push(header);
      if (entry.technologies?.length) {
        lines.push(`Technologies: ${entry.technologies.join(', ')}`);
      }
      for (const b of entry.bullets) {
        if (b.text.trim()) {
          lines.push(`- ${b.text.trim()}`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

/**
 * Maps StructuredResumeDocument to LegacyTailorProfile + TailoredResume so existing
 * hardened vector PDF & binary DOCX exporters reuse directly with zero placeholder leaks.
 */
export function toExportAdapterModels(doc: StructuredResumeDocument): {
  profile: LegacyTailorProfile;
  tailoredResume: TailoredResume;
} {
  const summarySec = doc.sections.find((s) => s.kind === 'summary' && s.visible);
  const expSec = doc.sections.find((s) => (s.kind === 'experience' || s.kind === 'internships') && s.visible);
  const projSec = doc.sections.find((s) => s.kind === 'projects' && s.visible);
  const eduSec = doc.sections.find((s) => s.kind === 'education' && s.visible);
  const skillsSec = doc.sections.find((s) => s.kind === 'skills' && s.visible);

  const serialized = serializeDocumentToText(doc);
  const profile: LegacyTailorProfile = {
    id: `cand_${doc.candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    fullName: doc.candidateName || 'Candidate',
    headline: doc.headline,
    contact: { ...doc.contact },
    summary: summarySec?.summaryText || '',
    experience: (expSec?.entries || []).map((e) => ({
      id: e.id,
      company: e.organization || '',
      position: e.title,
      location: e.location,
      startDate: e.dateRange?.split('-')[0]?.trim(),
      endDate: e.dateRange?.split('-')[1]?.trim(),
      bullets: e.bullets.map((b) => b.text),
      technologiesUsed: e.technologies,
    })),
    projects: (projSec?.entries || []).map((p) => ({
      id: p.id,
      title: p.title,
      role: p.organization,
      startDate: p.dateRange?.split('-')[0]?.trim(),
      endDate: p.dateRange?.split('-')[1]?.trim(),
      technologiesUsed: p.technologies || [],
      bullets: p.bullets.map((b) => b.text),
    })),
    education: (eduSec?.entries || []).map((ed) => ({
      id: ed.id,
      degree: ed.title,
      institution: ed.organization || '',
      startDate: ed.dateRange?.split('-')[0]?.trim(),
      endDate: ed.dateRange?.split('-')[1]?.trim(),
    })),
    skills: {
      languages: skillsSec?.skillsList || [],
      frameworks: [],
      developerTools: [],
      cloudAndDevOps: [],
      databases: [],
      coreConcepts: [],
      softSkills: [],
      other: [],
    },
    certifications: [],
    rawText: doc.rawSourceText || serialized,
  };

  const templateMap: Record<TailorLayoutId, TailoredResume['layoutSettings']['template']> = {
    ats_single: 'classic',
    executive: 'executive',
    technical: 'modern',
    academic_research: 'classic',
    graduate_concise: 'compact',
  };

  const mapSectionType = (
    kind: StructuredResumeSection['kind']
  ): TailoredSection['type'] => {
    if (kind === 'internships') return 'experience';
    if (kind === 'awards' || kind === 'research' || kind === 'leadership') return 'custom';
    return kind;
  };

  const tailoredResume: TailoredResume = {
    id: `tailored_${doc.candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    projectId: 'phase11_1_workspace',
    candidateId: profile.id,
    jobId: 'tailor_target',
    title: doc.headline || `${profile.fullName} Tailored Resume`,
    version: 1,
    sections: [...doc.sections]
      .sort((a, b) => a.order - b.order)
      .map((sec) => ({
        id: sec.id,
        type: mapSectionType(sec.kind),
        title: sec.title,
        visible: sec.visible,
        content: {
          summaryText: sec.summaryText,
          skillsByCategory: sec.skillsList ? { Skills: sec.skillsList } : undefined,
          entries: (sec.entries || []).map((entry) => ({
            id: entry.id,
            primaryTitle:
              entry.title.trim().toLowerCase() === sec.title.trim().toLowerCase()
                ? ''
                : entry.title,
            secondaryTitle: entry.organization || '',
            location: entry.location,
            dateRange: entry.dateRange,
            metadata: entry.technologies?.length
              ? { technologies: entry.technologies.join(', ') }
              : undefined,
            bullets: entry.bullets.map((b) => ({
              id: b.id,
              text: b.text,
              originalText: b.originalText,
            })),
          })),
        },
      })),
    layoutSettings: {
      template: templateMap[doc.layoutId] || 'classic',
      paperSize: doc.paperSize,
      fontSize: 'standard',
      margins: 'standard',
      lineSpacing: 'standard',
      accentColor: '#1e293b',
    },
    truthGateResult: {
      passed: true,
      score: 100,
      unsupportedClaimsCount: 0,
      preservedMetricsCount: 0,
      inventedMetricsDetected: [],
      blockingIssues: [],
    },
    updatedAt: new Date().toISOString(),
  };

  return { profile, tailoredResume };
}

/**
 * Layer 7 Final Pre-Save Validation Gate:
 * Evaluates factual, content, role/JD, and document parity independently.
 */
export function validateBeforeFinalize(params: {
  doc: StructuredResumeDocument;
  claims: AtomicClaim[];
  requirements: RequirementAssessment[];
  mode: TailorMode;
}): ValidationReport {
  const { doc, claims, requirements, mode } = params;
  const blockingIssues: ValidationFinding[] = [];
  const warnings: ValidationFinding[] = [];
  const recommendations: ValidationFinding[] = [];
  const passedChecks: string[] = [];

  if (!doc.candidateName.trim() || doc.candidateName === 'Candidate') {
    warnings.push({
      id: 'val_name',
      category: 'document',
      severity: 'warning',
      message: 'Candidate header name could not be verified automatically — please confirm your full name.',
    });
  } else {
    passedChecks.push('Candidate identity present cleanly in resume header.');
  }

  // Run legacy stage-5 truth gate over the export adapter model
  const confirmedBullets = claims
    .filter((c) => c.userConfirmed)
    .map((c) => c.claimText.trim())
    .filter(Boolean);
  const confirmedTexts = new Set(confirmedBullets);

  const { profile, tailoredResume } = toExportAdapterModels({
    ...doc,
    rawSourceText: doc.rawSourceText,
  });

  // Preserve originalText in document diff while recognizing exact candidate-confirmed statements
  const tailoredForValidation: TailoredResume = {
    ...tailoredResume,
    sections: tailoredResume.sections.map((sec) => ({
      ...sec,
      content: {
        ...sec.content,
        entries: sec.content.entries?.map((entry) => ({
          ...entry,
          bullets: entry.bullets?.map((b) => {
            const bText = b.text.trim();
            const isConfirmed =
              confirmedTexts.has(bText) ||
              confirmedBullets.some((cb) => cb === bText || cb.startsWith(`${bText} | `));
            return isConfirmed
              ? { ...b, originalText: b.text, isEditedByUser: true }
              : b;
          }),
        })),
      },
    })),
  };

  const confirmedText = confirmedBullets.join(' ');
  const baselineForTruthGate = parseResumeRawText(doc.rawSourceText, undefined, { preserveEmptyBullets: true });
  const truthResult = verifyFactualIntegrity(tailoredForValidation, {
    ...profile,
    experience: [
      ...baselineForTruthGate.experience,
      ...(confirmedBullets.length > 0
        ? [
            {
              id: 'user_confirmed_exp',
              company: 'Verified Record',
              position: 'Candidate Confirmed',
              bullets: confirmedBullets,
            },
          ]
        : []),
    ],
    projects: baselineForTruthGate.projects,
    skills: baselineForTruthGate.skills,
    summary: `${baselineForTruthGate.summary || ''} ${confirmedText}`.trim(),
  });

  // Also check unverified additions across Headline, Summary, Skills, Entries, Custom Sections against immutable baseline + confirmed evidence
  const baselineDoc = doc.rawSourceText?.trim()
    ? parseSourceToStructuredDocument(doc.rawSourceText, doc.layoutId)
    : doc;
  const baselineEntryHeaders = new Set<string>();
  const baselineEduAndTitleTokens = new Set<string>();
  const baselineExperienceInternTitles = new Map<string, string>();
  for (const bSec of baselineDoc.sections) {
    for (const be of bSec.entries || []) {
      if (be.title) baselineEduAndTitleTokens.add(be.title.toLowerCase());
      if (be.organization) baselineEduAndTitleTokens.add(be.organization.toLowerCase());
      baselineEntryHeaders.add(`${be.title}|${be.organization || ''}`.toLowerCase());
      if (bSec.kind === 'experience' && /\bintern(ship)?\b/i.test(be.title)) {
        baselineExperienceInternTitles.set((be.organization || be.id).toLowerCase(), be.title);
      }
    }
  }

  const allowedCorpusLower = `${doc.rawSourceText || ''}\n${confirmedText}\n${Array.from(baselineEduAndTitleTokens).join('\n')}`.toLowerCase();

  const allowedMetrics = new Set<string>();
  extractMetricsFromText(`${doc.rawSourceText} ${confirmedText}`).forEach((m) =>
    allowedMetrics.add(m.toLowerCase().replace(/\s+/g, ''))
  );
  const allowedSkillNames = new Set<string>();
  extractSkillsFromText(`${doc.rawSourceText} ${confirmedText}`).forEach((s) =>
    allowedSkillNames.add(s.name.toLowerCase())
  );
  // Add raw skill tokens present in baseline skills section & userConfirmations
  const baselineSkillsLower = new Set<string>();
  baselineDoc.sections
    .filter((s) => s.kind === 'skills')
    .forEach((s) => (s.skillsList || []).forEach((sk) => baselineSkillsLower.add(sk.trim().toLowerCase())));
  claims
    .filter((c) => c.userConfirmed)
    .forEach((c) => c.normalizedConcepts.forEach((nc) => baselineSkillsLower.add(nc.trim().toLowerCase())));

  if (doc.headline?.trim()) {
    for (const hm of extractMetricsFromText(doc.headline)) {
      if (!allowedMetrics.has(hm.toLowerCase().replace(/\s+/g, ''))) {
        blockingIssues.push({
          id: `val_headline_metric_${hm}`,
          category: 'factual',
          severity: 'blocking',
          message: `Unverified metric "${hm}" in Candidate Headline.`,
          sectionTitle: 'Header',
        });
      }
    }
    for (const hs of extractSkillsFromText(doc.headline)) {
      if (!allowedSkillNames.has(hs.name.toLowerCase())) {
        blockingIssues.push({
          id: `val_headline_skill_${hs.id}`,
          category: 'factual',
          severity: 'blocking',
          message: `Unverified skill "${hs.name}" in Candidate Headline.`,
          sectionTitle: 'Header',
        });
      }
    }
    blockingIssues.push(...detectEntityAndScopeViolations(doc.headline, allowedCorpusLower, 'Header'));
  }

  const summarySec = doc.sections.find((s) => s.kind === 'summary' && s.visible);
  if (summarySec?.summaryText) {
    for (const sm of extractMetricsFromText(summarySec.summaryText)) {
      if (!allowedMetrics.has(sm.toLowerCase().replace(/\s+/g, ''))) {
        blockingIssues.push({
          id: `val_sum_metric_${sm}`,
          category: 'factual',
          severity: 'blocking',
          message: `Unverified metric "${sm}" in Summary is not present in source resume or confirmed evidence.`,
          sectionTitle: summarySec.title,
        });
      }
    }
    for (const ss of extractSkillsFromText(summarySec.summaryText)) {
      if (!allowedSkillNames.has(ss.name.toLowerCase())) {
        blockingIssues.push({
          id: `val_sum_skill_${ss.id}`,
          category: 'factual',
          severity: 'blocking',
          message: `Unverified skill "${ss.name}" in Summary is not present in source claims or confirmed evidence.`,
          sectionTitle: summarySec.title,
        });
      }
    }
    blockingIssues.push(
      ...detectEntityAndScopeViolations(summarySec.summaryText, allowedCorpusLower, summarySec.title)
    );
  }

  const skillsSec = doc.sections.find((s) => s.kind === 'skills' && s.visible);
  for (const sk of skillsSec?.skillsList || []) {
    const skTrim = sk.trim();
    const skLower = skTrim.toLowerCase();
    if (!skLower) continue;
    const taxMatches = extractSkillsFromText(skTrim);
    const allTaxAllowed =
      taxMatches.length > 0 && taxMatches.every((m) => allowedSkillNames.has(m.name.toLowerCase()));
    const rawMatched =
      baselineSkillsLower.has(skLower) || allowedCorpusLower.includes(skLower);

    if (!rawMatched && !allTaxAllowed) {
      blockingIssues.push({
        id: `val_skill_add_${skLower.replace(/[^a-z0-9]/g, '_')}`,
        category: 'factual',
        severity: 'blocking',
        message: `Unverified skill "${skTrim}" added to Skills without source or user confirmation.`,
        sectionTitle: skillsSec?.title,
      });
    }
  }

  // Whole-document validation across every visible section's entries, technologies, organizations, titles, and custom/new bullets
  for (const sec of doc.sections) {
    if (!sec.visible) continue;
    for (const entry of sec.entries || []) {
      const pairKey = `${entry.title}|${entry.organization || ''}`.toLowerCase();
      const entryInBaseline = baselineEntryHeaders.has(pairKey);

      if (entry.organization?.trim() && !entryInBaseline && !allowedCorpusLower.includes(entry.organization.trim().toLowerCase())) {
        blockingIssues.push({
          id: `val_entry_org_${entry.id}`,
          category: 'factual',
          severity: 'blocking',
          message: `Unverified organization "${entry.organization}" in ${sec.title} is absent from source resume and confirmations.`,
          sectionTitle: sec.title,
        });
      }

      if (entry.title?.trim()) {
        const baselineInternTitle =
          sec.kind === 'experience'
            ? baselineExperienceInternTitles.get((entry.organization || entry.id).toLowerCase())
            : undefined;
        if (baselineInternTitle && !/\bintern(ship)?\b/i.test(entry.title)) {
          blockingIssues.push({
            id: `val_entry_intern_escalation_${entry.id}`,
            category: 'factual',
            severity: 'blocking',
            message: `Internship role "${baselineInternTitle}" cannot be escalated to non-intern title "${entry.title}" without confirmation.`,
            sectionTitle: sec.title,
          });
        } else if (!entryInBaseline && !allowedCorpusLower.includes(entry.title.trim().toLowerCase())) {
          if (sec.kind === 'education' || sec.kind === 'experience') {
            blockingIssues.push({
              id: `val_entry_title_${entry.id}`,
              category: 'factual',
              severity: 'blocking',
              message: `Unverified ${sec.kind === 'education' ? 'education degree/title' : 'role title'} "${entry.title}" in ${sec.title} is absent from source resume or confirmations.`,
              sectionTitle: sec.title,
            });
          } else {
            blockingIssues.push(
              ...detectEntityAndScopeViolations(entry.title, allowedCorpusLower, sec.title)
            );
          }
        }
      }

      if (entry.dateRange?.trim()) {
        const yearTokens = entry.dateRange.match(/\b(19|20)\d{2}\b/g) || [];
        if (yearTokens.length >= 2 && Number(yearTokens[0]) > Number(yearTokens[yearTokens.length - 1])) {
          blockingIssues.push({
            id: `val_entry_date_rev_${entry.id}`,
            category: 'factual',
            severity: 'blocking',
            message: `Reversed chronological date range "${entry.dateRange}" on "${entry.title || sec.title}".`,
            sectionTitle: sec.title,
          });
        } else {
          const normalizedDate = entry.dateRange.trim().toLowerCase().replace(/\s+/g, ' ');
          const normalizedCorpus = allowedCorpusLower.replace(/\s+/g, ' ');
          if (!normalizedCorpus.includes(normalizedDate)) {
            const strictSection = sec.kind === 'experience' || sec.kind === 'education';
            const allYearsGrounded =
              !strictSection &&
              yearTokens.length > 0 &&
              yearTokens.every((yr) => allowedCorpusLower.includes(yr));
            if (!allYearsGrounded) {
              blockingIssues.push({
                id: `val_entry_date_${entry.id}`,
                category: 'factual',
                severity: 'blocking',
                message: `Unverified date range "${entry.dateRange}" on "${entry.title || sec.title}" does not match source resume.`,
                sectionTitle: sec.title,
              });
            }
          }
        }
      }

      for (const tech of entry.technologies || []) {
        const techTrim = tech.trim();
        if (!techTrim) continue;
        const tax = extractSkillsFromText(techTrim);
        const techAllowed =
          allowedCorpusLower.includes(techTrim.toLowerCase()) ||
          (tax.length > 0 && tax.every((t) => allowedSkillNames.has(t.name.toLowerCase())));
        if (!techAllowed) {
          blockingIssues.push({
            id: `val_tech_${entry.id}_${techTrim.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            category: 'factual',
            severity: 'blocking',
            message: `Unverified technology "${techTrim}" on "${entry.title || sec.title}" lacks source evidence or user confirmation.`,
            sectionTitle: sec.title,
          });
        }
      }

      for (const bullet of entry.bullets) {
        const bTrim = bullet.text.trim();
        if (!bTrim) continue;
        const isConfirmed =
          confirmedTexts.has(bTrim) ||
          confirmedBullets.some((cb) => cb === bTrim || cb.startsWith(`${bTrim} | `));
        if (isConfirmed) continue;

        blockingIssues.push(...detectEntityAndScopeViolations(bTrim, allowedCorpusLower, sec.title));

        if (!bullet.originalText.trim()) {
          const inSource = allowedCorpusLower.includes(bTrim.toLowerCase());
          if (!inSource) {
            const propRank = getVerbRank(bTrim);
            if (propRank > 1) {
              blockingIssues.push({
                id: `val_custom_verb_${bullet.id}`,
                category: 'factual',
                severity: 'blocking',
                message: `New/custom claim in "${sec.title}" uses leadership/ownership verb at rank ${propRank} without source baseline or candidate confirmation.`,
                sectionTitle: sec.title,
              });
            }
            for (const bm of extractMetricsFromText(bTrim)) {
              if (!allowedMetrics.has(bm.toLowerCase().replace(/\s+/g, ''))) {
                blockingIssues.push({
                  id: `val_custom_metric_${bullet.id}_${bm}`,
                  category: 'factual',
                  severity: 'blocking',
                  message: `Unverified metric "${bm}" in new/custom claim under "${sec.title}".`,
                  sectionTitle: sec.title,
                });
              }
            }
            for (const bs of extractSkillsFromText(bTrim)) {
              if (!allowedSkillNames.has(bs.name.toLowerCase())) {
                blockingIssues.push({
                  id: `val_custom_skill_${bullet.id}_${bs.id}`,
                  category: 'factual',
                  severity: 'blocking',
                  message: `Unverified skill "${bs.name}" in new/custom claim under "${sec.title}".`,
                  sectionTitle: sec.title,
                });
              }
            }
          }
        } else if (bullet.originalText.trim() !== bTrim) {
          // Verify modified bullets also block unverified skills
          for (const bs of extractSkillsFromText(bTrim)) {
            if (!allowedSkillNames.has(bs.name.toLowerCase())) {
              blockingIssues.push({
                id: `val_bullet_skill_${bullet.id}_${bs.id}`,
                category: 'factual',
                severity: 'blocking',
                message: `Unverified skill "${bs.name}" introduced into "${sec.title}" without source or candidate confirmation.`,
                sectionTitle: sec.title,
              });
            }
          }
        }
      }
    }
  }

  for (const b of truthResult.blockingIssues) {
    blockingIssues.push({
      id: b.id,
      category: 'factual',
      severity: 'blocking',
      message: b.message,
      sectionTitle: b.section,
    });
  }

  // Internal identifier leak guard
  const serialized = serializeDocumentToText(doc);
  if (/\b(?:fact_|ctx-|claim_|b_exp_|b_proj_)[a-z0-9_]+\b/i.test(serialized)) {
    blockingIssues.push({
      id: 'val_internal_id_leak',
      category: 'document',
      severity: 'blocking',
      message: 'Internal tracking identifier detected in serialized resume body.',
    });
  } else {
    passedChecks.push('Zero internal claim/context IDs present in exported document body.');
  }

  // Check visible sections count & provenance
  const visibleSections = doc.sections.filter((s) => s.visible);
  if (visibleSections.length === 0) {
    blockingIssues.push({
      id: 'val_no_sections',
      category: 'document',
      severity: 'blocking',
      message: 'At least one visible section is required before committing or exporting a resume version.',
    });
  } else {
    passedChecks.push(`${visibleSections.length} visible resume sections validated.`);
  }

  if (mode === 'jd') {
    const missingRequired = requirements.filter(
      (r) => r.priority === 'required' && (r.status === 'missing_evidence' || r.status === 'not_found')
    );
    if (missingRequired.length > 0) {
      warnings.push({
        id: 'val_missing_req',
        category: 'role_jd',
        severity: 'warning',
        message: `${missingRequired.length} required JD skill(s) remain unverified in source evidence (${missingRequired.slice(0, 3).map((m) => m.requirementText).join(', ')}).`,
      });
    } else if (requirements.length > 0) {
      passedChecks.push('All parsed mandatory JD requirements have verified or transferable support.');
    }
  }

  if (truthResult.blockingIssues.length === 0) {
    passedChecks.push('Factual Truth Gate passed with zero invented metrics or verb rank escalations.');
  }

  const wordCount = serialized.split(/\s+/).filter(Boolean).length;
  if (wordCount > 850) {
    recommendations.push({
      id: 'val_length',
      category: 'content',
      severity: 'recommendation',
      message: `Resume currently spans ~${wordCount} words; consider trimming non-essential bullets for tighter scannability.`,
    });
  }

  return {
    blockingIssues,
    warnings,
    recommendations,
    passedChecks,
    factualPassed: blockingIssues.filter((i) => i.category === 'factual').length === 0,
    documentPassed: blockingIssues.filter((i) => i.category === 'document').length === 0,
    roleAlignmentReady: mode !== 'jd' || warnings.filter((w) => w.category === 'role_jd').length === 0,
  };
}
