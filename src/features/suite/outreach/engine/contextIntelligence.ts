// ============================================================
// HireFlow — Outreach V3 Context Intelligence & Final Evaluator
// Strictly client-side, deterministic, zero fabrication.
// Note: Avoids banned claim words in src/features/suite/outreach/.
// ============================================================

import { CHANNEL_PROFILES } from '../../../../config/outreach';
import type {
  CandidateProfile as DomainProfile,
  OutreachIntent,
  WatchlistTarget,
} from '@/domain/types';
import type { SavedJD } from '@/types/schemas-v4';
import type { TailorWorkspaceSession } from '@/features/tailor/model/tailorWorkspaceTypes';
import type { CandidateProfile as SuiteProfile } from '../../profile/types';

export interface WorkspaceRef {
  id: string;
  name: string;
  roleTrack?: string;
  isPrimary?: boolean;
  headVersionId?: string | null;
  archivedAt?: string | null;
}

export interface VersionRef {
  id: string;
  label: string;
}

export interface SavedRoleRef {
  id: string;
  companyName: string;
  roleTitle: string;
}
import type {
  CandidateStage,
  OutreachChannel,
  OutreachEvidenceProvenance,
  OutreachPurpose,
  OutreachRelationship,
  OutreachSlotsV2,
  OutreachTemplateV2,
  QualityFinding,
} from '../types';
import { countWords } from './lengthFit';
import { checkMessageQuality } from './qualityChecker';

export interface CandidateEvidenceOption {
  id: string;
  kind: 'profile' | 'resume_matrix' | 'tailor' | 'manual';
  label: string;
  sourceSummary: string;
  provenance: OutreachEvidenceProvenance;
  provenanceLabel: string;
  candidateName?: string;
  candidateEmail?: string;
  college?: string;
  primarySkill?: string;
  proofPoint?: string;
  proofShort?: string;
  portfolio?: string;
  stage?: CandidateStage;
  projectOptions: Array<{
    id: string;
    title: string;
    proofText: string;
    shortText: string;
    tech: string;
    provenance: OutreachEvidenceProvenance;
  }>;
}

export interface TargetContextOption {
  id: string;
  kind: 'saved_jd' | 'watchlist' | 'saved_role' | 'manual';
  label: string;
  sourceSummary: string;
  targetCompany: string;
  targetRole: string;
  targetKey?: string;
  suggestedChannel?: OutreachChannel;
}

export interface FinalComposerEvaluation {
  charCount: number;
  wordCount: number;
  limitMetric: 'characters' | 'words';
  targetMax: number;
  warnMax: number;
  hardMax: number;
  status: 'optimal' | 'warning' | 'overflow';
  overflowAmount: number;
  shorteningGuidance: string | null;
  unresolvedPlaceholders: string[];
  blockers: QualityFinding[];
  warnings: QualityFinding[];
  canCopyOrExport: boolean;
}

export const PURPOSE_CONFIG: Array<{
  id: OutreachPurpose;
  intent: OutreachIntent;
  label: string;
  compatibleGoals: string[];
  defaultRelationship: OutreachRelationship;
  description: string;
}> = [
  {
    id: 'cold_intro',
    intent: 'introduction',
    label: 'Cold Introduction',
    compatibleGoals: ['G1', 'G5'],
    defaultRelationship: 'cold',
    description: 'First-touch message to introduce your background without assuming familiarity.',
  },
  {
    id: 'recruiter_outreach',
    intent: 'role_pitch',
    label: 'Recruiter Outreach',
    compatibleGoals: ['G1', 'G4'],
    defaultRelationship: 'cold',
    description: 'Role-focused outreach for technical recruiters sourcing for open positions.',
  },
  {
    id: 'hiring_manager',
    intent: 'work_share',
    label: 'Hiring Manager Outreach',
    compatibleGoals: ['G1', 'G4', 'G5'],
    defaultRelationship: 'cold',
    description: 'Share concrete engineering work aligned with a team or open role.',
  },
  {
    id: 'alumni_networking',
    intent: 'advice',
    label: 'Alumni Networking',
    compatibleGoals: ['G3', 'G1'],
    defaultRelationship: 'alumni',
    description: 'Low-friction note referencing shared university or community background.',
  },
  {
    id: 'warm_referral',
    intent: 'referral_ask',
    label: 'Warm Referral Request',
    compatibleGoals: ['G2'],
    defaultRelationship: 'warm',
    description: 'Ask an established connection or alumnus for team routing or referral.',
  },
  {
    id: 'post_application',
    intent: 'follow_up',
    label: 'Post-Application Follow-Up',
    compatibleGoals: ['G7'],
    defaultRelationship: 'cold',
    description: 'Follow up after submitting an application with concrete new technical context.',
  },
  {
    id: 'conversation_follow_up',
    intent: 'follow_up',
    label: 'Conversation Follow-Up',
    compatibleGoals: ['G6'],
    defaultRelationship: 'previous-contact',
    description: 'Follow up after 5+ days with net-new work, benchmarks, or updated artifact.',
  },
  {
    id: 'event_follow_up',
    intent: 'event_connect',
    label: 'Event / Hackathon Follow-Up',
    compatibleGoals: ['G9'],
    defaultRelationship: 'previous-contact',
    description: 'Reconnect after a meetup, conference, talk, or hackathon.',
  },
  {
    id: 'connection_invite',
    intent: 'introduction',
    label: 'Connection Invitation',
    compatibleGoals: ['G1', 'G3', 'G5'],
    defaultRelationship: 'cold',
    description: 'Concise note to establish an initial professional connection.',
  },
  {
    id: 'thank_you',
    intent: 'thank_you',
    label: 'Thank-You Note',
    compatibleGoals: ['G8'],
    defaultRelationship: 'previous-contact',
    description: 'Thank a contact for an actual conversation, feedback, or interview.',
  },
];

export const STAGE_LABELS: Record<CandidateStage, string> = {
  student: 'Intern / Student',
  graduate: 'Graduate / Early Career',
  ic_engineer: 'Individual Contributor',
  senior_lead: 'Senior / Lead Engineer',
  manager: 'Engineering Manager',
  researcher: 'Researcher',
  career_switcher: 'Career Switcher',
  fresher: 'Graduate / Entry-Level',
  'intern-seeker': 'Internship Seeker',
};

export const RELATIONSHIP_LABELS: Record<OutreachRelationship, string> = {
  cold: 'Cold contact (no prior link)',
  warm: 'Warm contact',
  alumni: 'Alumni or community connection',
  'after-accept': 'Existing recruiter / hiring contact',
  existing: 'Existing professional relationship',
  'previous-contact': 'Previous conversation or event contact',
};

export function inferProvenanceLabel(p: OutreachEvidenceProvenance): string {
  if (p === 'source_supported') return 'Source-supported (Resume record)';
  if (p === 'supported_paraphrase') return 'Supported paraphrase (Tailor draft)';
  if (p === 'candidate_attested') return 'Candidate-attested (User confirmed)';
  return 'Unconfirmed / Manual entry';
}

export function extractCandidateEvidenceOptions(input: {
  domainProfile: Partial<DomainProfile>;
  suiteProfile: SuiteProfile | null;
  workspaces: Record<string, WorkspaceRef>;
  versions: Record<string, VersionRef>;
  tailorSessions: Record<string, TailorWorkspaceSession>;
}): {
  options: CandidateEvidenceOption[];
  conflicts: string[];
} {
  const options: CandidateEvidenceOption[] = [];
  const conflicts: string[] = [];

  // 1. Tailor sessions (including user-confirmed ownedProjects & structured skills)
  const sessions = Object.values(input.tailorSessions).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  for (const s of sessions) {
    const confirmedProjects = (s.ownedProjects || []).map((proj) => {
      const stack = proj.technologiesUsed.slice(0, 4).join(', ');
      const contribution = proj.candidateContribution?.trim();
      const proofText = contribution
        ? `built ${proj.title}${stack ? ` (${stack})` : ''}: ${contribution}`
        : `built ${proj.title}${stack ? ` with ${stack}` : ''}`;
      return {
        id: proj.id,
        title: proj.title,
        proofText,
        shortText: contribution ? `${proj.title} — ${contribution}`.slice(0, 65) : proj.title,
        tech: stack,
        provenance: 'candidate_attested' as OutreachEvidenceProvenance,
      };
    });

    const skillsSection = s.document.sections.find((sec) => sec.kind === 'skills');
    const primarySkill =
      skillsSection?.skillsList?.slice(0, 4).join(', ') ||
      (skillsSection?.entries || [])
        .flatMap((e) => e.bullets.map((b) => b.text))
        .join(', ')
        .slice(0, 60) ||
      '';

    const firstBullet = s.document.sections
      .filter((sec) => sec.kind === 'experience' || sec.kind === 'projects')
      .flatMap((sec) => (sec.entries || []).flatMap((e) => e.bullets))
      .find((b) => b.text.trim().length > 15)?.text;

    const firstConfirmed = confirmedProjects[0];
    options.push({
      id: `tailor:${s.sessionId}`,
      kind: 'tailor',
      label: `Tailor Draft: ${s.title}`,
      sourceSummary: firstConfirmed
        ? 'Tailor Session + Candidate-Attested Project'
        : 'Tailor Session (Supported Paraphrase)',
      provenance: firstConfirmed ? 'candidate_attested' : 'supported_paraphrase',
      provenanceLabel: inferProvenanceLabel(
        firstConfirmed ? 'candidate_attested' : 'supported_paraphrase'
      ),
      candidateName: s.document.candidateName || input.domainProfile.displayName || undefined,
      candidateEmail: s.document.contact?.email || input.domainProfile.email || undefined,
      primarySkill: primarySkill || firstConfirmed?.tech || undefined,
      proofPoint: firstConfirmed?.proofText || firstBullet || undefined,
      proofShort: firstConfirmed?.shortText || (firstBullet ? firstBullet.slice(0, 65) : undefined),
      portfolio:
        s.document.contact?.github ||
        s.document.contact?.portfolio ||
        input.domainProfile.links?.github ||
        undefined,
      projectOptions: confirmedProjects,
    });
  }

  // 2. Resume Matrix active & other workspaces
  const activeWorkspaces = Object.values(input.workspaces)
    .filter((w) => !w.archivedAt)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  for (const ws of activeWorkspaces) {
    const headVer = ws.headVersionId ? input.versions[ws.headVersionId] : undefined;
    options.push({
      id: `resume:${ws.id}`,
      kind: 'resume_matrix',
      label: `Resume Matrix: ${ws.name}${ws.isPrimary ? ' (Primary)' : ''}`,
      sourceSummary: headVer ? `Head Version: ${headVer.label}` : `Track: ${ws.roleTrack || 'General'}`,
      provenance: 'source_supported',
      provenanceLabel: inferProvenanceLabel('source_supported'),
      candidateName: input.domainProfile.displayName || undefined,
      candidateEmail: input.domainProfile.email || undefined,
      college: input.suiteProfile?.education?.[0]?.institution || undefined,
      primarySkill: ws.roleTrack || undefined,
      portfolio: input.domainProfile.links?.github || input.domainProfile.links?.portfolio || undefined,
      projectOptions: [],
    });
  }

  // 3. Profile context (Domain + Suite Profile)
  const sp = input.suiteProfile;
  const dp = input.domainProfile;
  const hasProfileData = Boolean(
    dp.displayName || sp?.identity?.name || sp?.skills?.length || sp?.projects?.length
  );
  if (hasProfileData) {
    const projectOptions = (sp?.projects || []).map((proj) => ({
      id: proj.id,
      title: proj.name,
      proofText: proj.bullets[0] || `built ${proj.name} (${proj.stack.slice(0, 3).join(', ')})`,
      shortText: proj.name,
      tech: proj.stack.slice(0, 4).join(', '),
      provenance: 'source_supported' as OutreachEvidenceProvenance,
    }));
    const topSkills = (sp?.skills || []).slice(0, 3).map((sk) => sk.displayName).join(', ');
    const portfolioLink =
      dp.links?.github ||
      dp.links?.portfolio ||
      sp?.identity?.links?.find((l) => l.kind === 'github' || l.kind === 'portfolio')?.url;

    options.push({
      id: 'profile:current',
      kind: 'profile',
      label: `Candidate Profile: ${dp.displayName || sp?.identity?.name || 'Saved Identity'}`,
      sourceSummary: dp.targetRoles?.length
        ? `Target Roles: ${dp.targetRoles.slice(0, 2).join(', ')}`
        : 'My Space & Suite Profile',
      provenance: 'candidate_attested',
      provenanceLabel: inferProvenanceLabel('candidate_attested'),
      candidateName: dp.displayName || sp?.identity?.name || undefined,
      candidateEmail: dp.email || sp?.identity?.email || undefined,
      college: sp?.education?.[0]?.institution || undefined,
      primarySkill: topSkills || undefined,
      proofPoint: projectOptions[0]?.proofText || undefined,
      proofShort: projectOptions[0]?.shortText || undefined,
      portfolio: portfolioLink || undefined,
      projectOptions,
    });
  }

  // Detect conflicting identity info between Profile and Resume/Tailor
  const profileName = (dp.displayName || '').trim();
  const tailorName = sessions.find((s) => s.document.candidateName?.trim())?.document.candidateName?.trim();
  if (profileName && tailorName && profileName.toLowerCase() !== tailorName.toLowerCase()) {
    conflicts.push(
      `Profile name ("${profileName}") differs from latest Tailor resume header ("${tailorName}"). Select your preferred source explicitly.`
    );
  }

  return { options, conflicts };
}

export function extractTargetContextOptions(input: {
  savedJds: SavedJD[];
  watchlist: Record<string, WatchlistTarget>;
  savedRoles: SavedRoleRef[];
}): TargetContextOption[] {
  const targets: TargetContextOption[] = [];

  for (const jd of input.savedJds) {
    targets.push({
      id: `jd:${jd.id}`,
      kind: 'saved_jd',
      label: `Saved JD: ${jd.company || 'Company'} — ${jd.title}`,
      sourceSummary: 'Saved JD Library',
      targetCompany: jd.company || '',
      targetRole: jd.title,
      suggestedChannel: 'cold_email',
    });
  }

  for (const w of Object.values(input.watchlist)) {
    if (w.archivedAt !== null) continue;
    targets.push({
      id: `watchlist:${w.id}`,
      kind: 'watchlist',
      label: `Watchlist: ${w.companyName}${w.roleTitle ? ` — ${w.roleTitle}` : ''}`,
      sourceSummary: 'My Space Target Watchlist',
      targetCompany: w.companyName,
      targetRole: w.roleTitle || '',
      targetKey: w.targetKey,
    });
  }

  for (const r of input.savedRoles) {
    targets.push({
      id: `role:${r.id}`,
      kind: 'saved_role',
      label: `TalentLens Role: ${r.companyName} — ${r.roleTitle}`,
      sourceSummary: 'Saved TalentLens Benchmark',
      targetCompany: r.companyName,
      targetRole: r.roleTitle,
    });
  }

  return targets;
}

export function resolveTemplatesForPurpose(
  templates: OutreachTemplateV2[],
  channel: string,
  purpose: OutreachPurpose
): OutreachTemplateV2[] {
  const cfg = PURPOSE_CONFIG.find((p) => p.id === purpose);
  const isFollowUpPurpose = purpose === 'post_application' || purpose === 'conversation_follow_up';
  const isWarmReferralPurpose = purpose === 'warm_referral';

  const channelMatched =
    channel === 'all'
      ? templates
      : templates.filter(
          (t) =>
            t.channel === channel ||
            (isFollowUpPurpose && t.channel === 'follow_up') ||
            (isWarmReferralPurpose && t.channel === 'warm_referral')
        );
  if (!cfg) return channelMatched;

  const goalMatched = channelMatched.filter((t) => cfg.compatibleGoals.includes(t.goal));
  return goalMatched.length > 0 ? goalMatched : channelMatched;
}

export interface RelevantEvidenceSelection {
  selectedProjects: CandidateEvidenceOption['projectOptions'];
  proofPoint: string;
  proofShort: string;
  primarySkill: string;
  relevanceReason: string;
  weakEvidence: boolean;
  provenance: OutreachEvidenceProvenance;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'role', 'team',
  'engineer', 'developer', 'intern', 'senior', 'junior', 'lead', 'staff', 'into',
]);

function tokenizeKeywords(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

/**
 * Selects 1-2 most relevant proof points and <= 3 relevant skills for a target role/JD.
 * Prefers honest shorter phrasing when evidence is weak or unconfirmed, and never
 * inflates personal projects into production employment claims.
 */
export function selectRelevantProofAndSkills(
  option: CandidateEvidenceOption | undefined,
  targetRole: string,
  jdText?: string
): RelevantEvidenceSelection {
  if (!option) {
    return {
      selectedProjects: [],
      proofPoint: '',
      proofShort: '',
      primarySkill: '',
      relevanceReason: 'No candidate context selected.',
      weakEvidence: true,
      provenance: 'unconfirmed',
    };
  }

  const targetTokens = new Set(tokenizeKeywords(`${targetRole} ${jdText || ''}`));
  const scoredProjects = option.projectOptions
    .map((proj, idx) => {
      const projTokens = tokenizeKeywords(`${proj.title} ${proj.proofText} ${proj.tech}`);
      let overlap = 0;
      for (const tok of projTokens) {
        if (targetTokens.has(tok)) overlap += 1;
      }
      return { proj, score: overlap * 10 - idx };
    })
    .sort((a, b) => b.score - a.score);

  const selectedProjects = scoredProjects.slice(0, 2).map((s) => s.proj);
  const top = selectedProjects[0];

  // Trim skill lists cleanly (<= 3 skills) to avoid long skill inventories
  const rawSkills = (option.primarySkill || '')
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const rankedSkills = [...rawSkills].sort((a, b) => {
    const aHit = targetTokens.has(a.toLowerCase()) ? 1 : 0;
    const bHit = targetTokens.has(b.toLowerCase()) ? 1 : 0;
    return bHit - aHit;
  });
  const primarySkill = rankedSkills.slice(0, 3).join(', ');

  const proofPoint = (top?.proofText || option.proofPoint || '').trim();
  const proofShort = (top?.shortText || option.proofShort || '').trim();
  const weakEvidence = !proofPoint && !primarySkill;

  const relevanceReason = top
    ? targetRole
      ? `Matched "${top.title}" (${top.provenance.replace(/_/g, ' ')}) to ${targetRole}.`
      : `Selected "${top.title}" (${top.provenance.replace(/_/g, ' ')}).`
    : weakEvidence
      ? 'Limited verified proof points — prefer a concise, honest introduction.'
      : `Using ${option.provenanceLabel.toLowerCase()} summary.`;

  return {
    selectedProjects,
    proofPoint,
    proofShort,
    primarySkill,
    relevanceReason,
    weakEvidence,
    provenance: top?.provenance || option.provenance,
  };
}

export interface MessageQualityRubricScores {
  contextualRelevance: number;
  evidenceSpecificity: number;
  naturalHumanLanguage: number;
  professionalTone: number;
  recipientRelevance: number;
  clarityOfPurpose: number;
  askQuality: number;
  channelFit: number;
  factualIntegrity: number;
  conciseness: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  deterministicScopeNote: string;
}

const CLICHE_OPENERS = [
  /i hope this (?:email|message|note) finds you well/i,
  /hope you(?:'re| are) doing well/i,
  /hope you and the team are having a great/i,
  /i am writing to express my interest/i,
  /please find attached my resume/i,
  /synerg(?:y|ies)|rockstar|ninja|guru|passionate self-starter/i,
];

const UNSUPPORTED_HIRING_ASSUMPTIONS = [
  /saw your team is actively recruiting/i,
  /saw [^.]{1,40} is actively recruiting/i,
  /as [^.]{1,40} scales its technical/i,
];

/**
 * Deterministic 1-5 heuristic rubric across 10 communication quality dimensions.
 * Strictly separate from structural `canCopyOrExport` gating.
 */
export function scoreMessageQualityRubric(input: {
  body: string;
  subject?: string;
  channel: OutreachChannel;
  relationship: OutreachRelationship;
  purpose: OutreachPurpose;
  slots: OutreachSlotsV2;
  evaluation: FinalComposerEvaluation;
  provenance?: OutreachEvidenceProvenance;
}): MessageQualityRubricScores {
  const text = (input.body || '').trim();
  const lower = text.toLowerCase();
  const company = (input.slots.targetCompany || '').trim().toLowerCase();
  const role = (input.slots.targetRole || '').trim().toLowerCase();
  const proof = (input.slots.proofPoint || input.slots.proofShort || '').trim();
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 1. Contextual relevance (1-5)
  let contextualRelevance = 2;
  if (company && lower.includes(company)) contextualRelevance += 1;
  if (role && lower.includes(role)) contextualRelevance += 1;
  if (input.slots.admiredProject?.trim() || input.slots.followUpNewInfo?.trim()) contextualRelevance += 1;
  if (contextualRelevance >= 4) strengths.push('Mentions specific target company/role context.');
  else weaknesses.push('Missing concrete target role or company context.');

  // 2. Evidence specificity (1-5)
  let evidenceSpecificity = 2;
  const hasNumbers = /\b\d+(?:\.\d+)?(?:%|ms|x|k|m|s)?\b/i.test(text);
  const hasTechDetail = proof.length >= 15 && lower.includes(proof.slice(0, 18).toLowerCase());
  if (proof.length >= 15) evidenceSpecificity += 1;
  if (hasTechDetail || hasNumbers) evidenceSpecificity += 1;
  if (input.slots.portfolio?.trim() && lower.includes(input.slots.portfolio.trim().toLowerCase())) {
    evidenceSpecificity += 1;
  }
  if (evidenceSpecificity <= 2) weaknesses.push('Lacks concrete project or quantified evidence.');
  else if (evidenceSpecificity >= 4) strengths.push('Includes concrete candidate proof or link.');

  // 3. Natural human language (1-5)
  let naturalHumanLanguage = 4;
  const clicheHits = CLICHE_OPENERS.filter((re) => re.test(text)).length;
  naturalHumanLanguage -= clicheHits;
  if (text.length > 0 && !/\{\{[^}]+\}\}|\[[A-Z][^\]]+\]/.test(text)) naturalHumanLanguage += 1;
  naturalHumanLanguage = Math.max(1, Math.min(5, naturalHumanLanguage));
  if (clicheHits > 0) weaknesses.push('Contains generic or overly formal filler phrasing.');

  // 4. Professional tone (1-5)
  let professionalTone = 5;
  const pushyBlockers = input.evaluation.blockers.filter(
    (b) => b.id.includes('TONE') || b.id.includes('DEMAND') || b.id.includes('HYPE')
  );
  professionalTone -= pushyBlockers.length * 2;
  if (input.evaluation.warnings.some((w) => w.id.includes('TONE'))) professionalTone -= 1;
  professionalTone = Math.max(1, Math.min(5, professionalTone));
  if (professionalTone <= 3) weaknesses.push('Tone feels pushy, over-eager, or hype-heavy.');

  // 5. Recipient relevance (1-5)
  let recipientRelevance = 3;
  if (input.slots.recipientName?.trim() && lower.includes(input.slots.recipientName.trim().toLowerCase())) {
    recipientRelevance += 1;
  }
  if (input.purpose === 'warm_referral' || input.purpose === 'alumni_networking') {
    if (input.slots.college?.trim() || input.relationship !== 'cold') recipientRelevance += 1;
  } else if (input.slots.admiredProject?.trim() || role) {
    recipientRelevance += 1;
  }
  recipientRelevance = Math.max(1, Math.min(5, recipientRelevance));

  // 6. Clarity of purpose (1-5)
  let clarityOfPurpose = 3;
  if (input.evaluation.unresolvedPlaceholders.length === 0 && text.length >= 25) clarityOfPurpose += 1;
  if (
    input.purpose === 'conversation_follow_up' || input.purpose === 'post_application'
      ? Boolean(input.slots.followUpNewInfo?.trim())
      : Boolean(role || input.slots.admiredProject?.trim())
  ) {
    clarityOfPurpose += 1;
  }
  clarityOfPurpose = Math.max(1, Math.min(5, clarityOfPurpose));

  // 7. Ask quality (1-5)
  let askQuality = 3;
  const hasQuestionOrLowFrictionAsk =
    /\?/.test(text) || /open to|happy to|worth a|brief|10-min|15-min|quick chat|pointer/i.test(text);
  if (hasQuestionOrLowFrictionAsk) askQuality += 1;
  if (!/get me a job|refer me right now|schedule me immediately/i.test(text)) askQuality += 1;
  if (askQuality <= 3) weaknesses.push('Ask is vague or lacks a low-friction next step.');
  else strengths.push('Uses a clear, low-friction call to action.');
  askQuality = Math.max(1, Math.min(5, askQuality));

  // 8. Channel fit (1-5)
  let channelFit = 5;
  if (input.evaluation.status === 'overflow') channelFit = 1;
  else if (input.evaluation.status === 'warning') channelFit = 3;
  if (input.channel === 'cold_email' && !(input.subject || '').trim()) {
    channelFit = Math.min(channelFit, 3);
    weaknesses.push('Email channel is missing a subject line.');
  }

  // 9. Factual integrity (1-5)
  let factualIntegrity = 5;
  if (UNSUPPORTED_HIRING_ASSUMPTIONS.some((re) => re.test(text))) {
    factualIntegrity -= 2;
    weaknesses.push('Assumes active hiring or team scaling without verified evidence.');
  }
  if (input.provenance === 'unconfirmed') {
    factualIntegrity = Math.min(factualIntegrity, 3);
    weaknesses.push('Uses unconfirmed candidate evidence — verify before sending.');
  }
  if (input.evaluation.unresolvedPlaceholders.length > 0) {
    factualIntegrity -= 2;
    weaknesses.push('Contains unresolved template placeholders.');
  }
  factualIntegrity = Math.max(1, Math.min(5, factualIntegrity));

  // 10. Conciseness (1-5)
  let conciseness = 5;
  if (input.evaluation.status === 'overflow') conciseness = 1;
  else if (input.evaluation.status === 'warning') conciseness = 3;
  else if (input.channel === 'cold_email' && input.evaluation.wordCount > 130) conciseness = 3;

  const overallScore = Number(
    (
      (contextualRelevance +
        evidenceSpecificity +
        naturalHumanLanguage +
        professionalTone +
        recipientRelevance +
        clarityOfPurpose +
        askQuality +
        channelFit +
        factualIntegrity +
        conciseness) /
      10
    ).toFixed(1)
  );

  return {
    contextualRelevance,
    evidenceSpecificity,
    naturalHumanLanguage,
    professionalTone,
    recipientRelevance,
    clarityOfPurpose,
    askQuality,
    channelFit,
    factualIntegrity,
    conciseness,
    overallScore,
    strengths: Array.from(new Set(strengths)),
    weaknesses: Array.from(new Set(weaknesses)),
    deterministicScopeNote:
      'Deterministic heuristic rubric (zero external AI calls). Structural copy/export gating remains independent in canCopyOrExport.',
  };
}

export function evaluateFinalComposerText(input: {
  body: string;
  subject?: string;
  channel: OutreachChannel;
  relationship: OutreachRelationship;
  isPremiumLinkedIn: boolean;
  slots: OutreachSlotsV2;
  requiredSlots: string[];
}): FinalComposerEvaluation {
  let prof = CHANNEL_PROFILES.cold_email;
  if (input.channel === 'linkedin_connect') {
    prof = input.isPremiumLinkedIn
      ? CHANNEL_PROFILES.linkedin_connect_premium
      : CHANNEL_PROFILES.linkedin_connect_free;
  } else if (input.channel === 'linkedin_inmail') {
    prof = CHANNEL_PROFILES.linkedin_inmail;
  } else if (input.channel === 'follow_up') {
    prof = CHANNEL_PROFILES.follow_up_email;
  } else if (input.channel === 'warm_referral') {
    prof = CHANNEL_PROFILES.warm_referral;
  }

  const charCount = input.body.length;
  const wordCount = countWords(input.body);
  const measured = prof.metric === 'characters' ? charCount : wordCount;

  let status: 'optimal' | 'warning' | 'overflow' = 'optimal';
  let overflowAmount = 0;
  if (measured > prof.hardMax) {
    status = 'overflow';
    overflowAmount = measured - prof.hardMax;
  } else if (measured > prof.warn) {
    status = 'warning';
  }

  const combinedText = input.subject ? `${input.subject}\n\n${input.body}` : input.body;
  const placeholderMatches =
    combinedText.match(
      /\{\{[^}]+\}\}|\{[a-zA-Z0-9_]+\}|\[(?:Recipient|Company|Role|Your|Specific|Quantified|Proof|College|New|Primary|Portfolio)[^\]]*\]/g
    ) || [];
  const unresolvedPlaceholders = Array.from(new Set(placeholderMatches));

  const findings = checkMessageQuality({
    body: input.body,
    subject: input.subject,
    channel: input.channel,
    relationship: input.relationship,
    maxLength: prof.hardMax,
    admiredProject: input.slots.admiredProject,
    proofPoint: input.slots.proofPoint,
    followUpNewInfo: input.slots.followUpNewInfo,
  });

  // Also enforce minimum non-empty message check
  if (!input.body.trim()) {
    findings.unshift({
      id: 'Q-BLK-EMPTY',
      severity: 'BLOCK',
      message: 'Message body is empty.',
      fix: 'Fill in your target details or write a message before copying or exporting.',
    });
  }

  // Enforce required non-empty company & recipient when copying ready output
  if (!input.slots.targetCompany?.trim() && input.requiredSlots.some((r) => r === 'company' || r === 'targetCompany')) {
    findings.push({
      id: 'Q-BLK-MISSING-COMPANY',
      severity: 'BLOCK',
      message: 'Target company is missing.',
      fix: 'Enter the target company name or choose a saved target.',
    });
  }

  const blockers = findings.filter((f) => f.severity === 'BLOCK');
  const warnings = findings.filter((f) => f.severity === 'WARN');

  const shorteningGuidance =
    status === 'overflow'
      ? `Exceeds configured ${prof.name} safety cap (${measured} / ${prof.hardMax} ${prof.metric}) by ${overflowAmount} ${prof.metric}. Shorten the proof sentence or remove secondary clauses.`
      : null;

  return {
    charCount,
    wordCount,
    limitMetric: prof.metric,
    targetMax: prof.target,
    warnMax: prof.warn,
    hardMax: prof.hardMax,
    status,
    overflowAmount,
    shorteningGuidance,
    unresolvedPlaceholders,
    blockers,
    warnings,
    canCopyOrExport: blockers.length === 0 && unresolvedPlaceholders.length === 0 && Boolean(input.body.trim()),
  };
}
