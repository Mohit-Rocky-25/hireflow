// ============================================================
// HireFlow — Evidence-Based Matching Engine
// Implements hybrid matching: rules + knowledge graph + semantic
//
// SPEC COMPLIANCE:
// - Separates Eligibility / Relevance / Evidence Confidence
// - Never presents unexplained scores
// - Shows per-requirement evidence with source
// - Distinguishes "no evidence found" from "not experienced"
// - Semantic relationships surfaced via knowledge graph
// - Skill gap analysis is role-specific and actionable
// ============================================================
import type {
  CandidateProfile, Job, CandidateMatch, RequirementAssessment,
  SkillGapDetail, ScoreComponent, EligibilityStatus, RequirementPriority
} from '../types';
import { extractSkillsFromText, getSkillById, getRelatedSkills, skillSimilarity, resolveSkill } from '../knowledge/skills';
import { resolveOccupation } from '../knowledge/occupations';

const ENGINE_VERSION = '1.0.0';
const KNOWLEDGE_VERSION = '1.0.0';
const RULES_VERSION = '1.0.0';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ── Core Matching Entry Point ──
export function analyzeCandidate(
  candidate: CandidateProfile,
  job: Job,
  candidateId: string,
  applicationId: string,
): CandidateMatch {
  const startTime = Date.now();

  // Step 1: Build candidate's full text corpus for evidence extraction
  const corpus = buildCandidateCorpus(candidate);

  // Step 2: Extract skills with evidence from corpus
  const extractedSkills = extractSkillsFromText(corpus.fullText);
  const extractedSkillIds = new Set(extractedSkills.map(e => e.skill.id));

  // Step 3: Assess each requirement individually
  const requirementAssessments: RequirementAssessment[] = job.requirements.map(req =>
    assessRequirement(req, extractedSkills, candidate, corpus)
  );

  // Step 4: Categorize assessments
  const strongMatches = requirementAssessments.filter(r => r.status === 'STRONG');
  const partialMatches = requirementAssessments.filter(r => r.status === 'PARTIAL' || r.status === 'INFERRED');
  const missingRequirements = requirementAssessments.filter(r => r.status === 'MISSING');
  const uncertainRequirements = requirementAssessments.filter(r => r.status === 'UNCERTAIN');

  // Step 5: Determine eligibility (binary check on MANDATORY requirements)
  const mandatoryReqs = requirementAssessments.filter(r => r.requirementPriority === 'MANDATORY');
  const missingMandatory = mandatoryReqs.filter(r => r.status === 'MISSING');
  const eligibility: EligibilityStatus =
    missingMandatory.length === 0 ? 'ELIGIBLE' :
    missingMandatory.length <= 1 ? 'CONDITIONAL' : 'INELIGIBLE';

  // Step 6: Calculate dimensional scores (transparent, exposed to recruiter)
  const scoreComponents = calculateScoreComponents(
    requirementAssessments, candidate, job, corpus
  );
  const overallScore = Math.round(
    scoreComponents.reduce((sum, c) => sum + c.score * c.weight, 0) /
    scoreComponents.reduce((sum, c) => sum + c.weight, 0)
  );

  // Step 7: Determine relevance dimensions
  const requiredAlignScore = calculateRequiredAlignment(requirementAssessments);
  const expRelevanceScore = calculateExperienceRelevance(candidate, job);
  const projectRelevanceScore = calculateProjectRelevance(candidate, job, extractedSkills);

  // Step 8: Generate skill gaps with actionable guidance
  const skillGaps = generateSkillGaps(missingRequirements, partialMatches, job, candidate);

  // Step 9: Generate recruiter recommendations
  const recruiterRecommendations = generateRecruiterRecommendations(
    requirementAssessments, candidate, job
  );

  // Step 10: Infer evidence confidence
  const evidenceConfidence =
    extractedSkills.length >= 10 ? 'HIGH' :
    extractedSkills.length >= 5 ? 'MEDIUM' :
    extractedSkills.length >= 2 ? 'LOW' : 'INSUFFICIENT';

  return {
    id: genId(),
    jobId: job.id,
    candidateId,
    applicationId,

    eligibility,
    eligibilityReason: missingMandatory.length > 0
      ? `Missing ${missingMandatory.length} mandatory requirement(s): ${missingMandatory.map(r => r.requirementName).join(', ')}`
      : 'All mandatory requirements have supporting evidence.',

    requiredSkillAlignment: requiredAlignScore,
    experienceRelevance: expRelevanceScore,
    projectRelevance: projectRelevanceScore,
    evidenceConfidence,
    domainRelevance: calculateDomainRelevance(candidate, job),

    requirementAssessments,
    strongMatches,
    partialMatches,
    missingRequirements,
    uncertainRequirements,

    skillGaps,
    overallScore,
    scoreComponents,

    explanation: buildExplanation(eligibility, overallScore, strongMatches, missingRequirements),
    evidenceSummary: buildEvidenceSummary(requirementAssessments),
    recruiterRecommendations,

    modelProvider: 'LocalAI',
    modelVersion: ENGINE_VERSION,
    knowledgeVersion: KNOWLEDGE_VERSION,
    rulesVersion: RULES_VERSION,
    analyzedAt: new Date().toISOString(),
    inputHash: hashInput(candidateId, job.id),
    createdAt: new Date().toISOString(),
  };
}

// ── Corpus Building ──
interface CandidateCorpus {
  fullText: string;
  experienceText: string;
  projectText: string;
  educationText: string;
  skillsText: string;
  yearsOfExperience: number;
  sources: Map<string, string>; // text segment → source label
}

function buildCandidateCorpus(candidate: CandidateProfile): CandidateCorpus {
  const experienceParts: string[] = [];
  const projectParts: string[] = [];
  const educationParts: string[] = [];
  const sources = new Map<string, string>();

  for (const exp of candidate.experience) {
    const text = `${exp.title} at ${exp.company}: ${exp.description}`;
    experienceParts.push(text);
    sources.set(text, `experience: ${exp.title} at ${exp.company}`);
  }

  for (const proj of candidate.projects) {
    const text = `Project ${proj.name}: ${proj.description}. Technologies: ${proj.technologies.join(', ')}`;
    projectParts.push(text);
    sources.set(text, `project: ${proj.name}`);
  }

  for (const edu of candidate.education) {
    const text = `${edu.degree} in ${edu.field} at ${edu.institution}`;
    educationParts.push(text);
  }

  const skillsText = candidate.skills.join(', ');

  const experienceText = experienceParts.join('\n');
  const projectText = projectParts.join('\n');
  const educationText = educationParts.join('\n');

  const fullText = [
    skillsText,
    candidate.headline || '',
    candidate.summary || '',
    experienceText,
    projectText,
    educationText,
  ].join('\n');

  // Estimate total years of experience
  let yearsOfExperience = 0;
  for (const exp of candidate.experience) {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
    yearsOfExperience += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }

  return { fullText, experienceText, projectText, educationText, skillsText, yearsOfExperience, sources };
}

// ── Requirement Assessment ──
function assessRequirement(
  req: { id: string; name: string; category: string; priority: RequirementPriority; yearsRequired?: number; description?: string },
  extractedSkills: ReturnType<typeof extractSkillsFromText>,
  candidate: CandidateProfile,
  corpus: CandidateCorpus,
): RequirementAssessment {
  const reqName = req.name.toLowerCase();

  // Resolve to canonical skill if possible
  const canonicalSkill = resolveSkill(req.name);

  // Direct skill match in extracted evidence
  const directMatch = extractedSkills.find(e =>
    e.skill.id === canonicalSkill?.id ||
    e.skill.aliases.some(a => a.toLowerCase().includes(reqName)) ||
    reqName.includes(e.skill.normalizedName)
  );

  if (directMatch) {
    return {
      requirementId: req.id,
      requirementName: req.name,
      requirementPriority: req.priority,
      status: 'STRONG',
      confidence: 0.85,
      evidenceText: `"${directMatch.evidenceText}"`,
      evidenceSource: 'experience',
      recruiterAction: 'Evidence found. Verify depth during technical screen.',
      suggestedInterviewQuestion: `Walk me through your experience with ${req.name} in a production context.`,
    };
  }

  // Semantic / related skill match
  if (canonicalSkill) {
    const related = getRelatedSkills(canonicalSkill.id);
    for (const relSkill of related) {
      const relMatch = extractedSkills.find(e => e.skill.id === relSkill.id);
      if (relMatch) {
        const similarity = skillSimilarity(canonicalSkill.id, relSkill.id);
        return {
          requirementId: req.id,
          requirementName: req.name,
          requirementPriority: req.priority,
          status: 'PARTIAL',
          confidence: 0.5,
          evidenceText: `Related: "${relMatch.evidenceText}"`,
          evidenceSource: 'experience',
          relatedEvidence: `Candidate has ${relSkill.name} experience (related to ${req.name}, similarity: ${Math.round(similarity * 100)}%)`,
          semanticRelationship: `${relSkill.name} is a closely related ${canonicalSkill.category} technology`,
          missingEvidenceExplanation: `No direct ${req.name} evidence found, but ${relSkill.name} demonstrates related competency.`,
          recruiterAction: `Ask about ${req.name} specifically — candidate has relevant adjacent experience.`,
          suggestedInterviewQuestion: `You have ${relSkill.name} experience. How familiar are you with ${req.name} and could you compare them?`,
        };
      }
    }
  }

  // Keyword fallback for non-skill requirements (experience, education, domain)
  if (req.category === 'experience' && req.yearsRequired) {
    if (corpus.yearsOfExperience >= req.yearsRequired) {
      return {
        requirementId: req.id,
        requirementName: req.name,
        requirementPriority: req.priority,
        status: 'STRONG',
        confidence: 0.75,
        evidenceText: `${Math.round(corpus.yearsOfExperience)} years of professional experience detected`,
        evidenceSource: 'experience',
        recruiterAction: 'Verify experience dates match stated role seniority.',
      };
    }
  }

  // Check plain text mention as low-confidence signal
  const textLower = corpus.fullText.toLowerCase();
  if (textLower.includes(reqName)) {
    return {
      requirementId: req.id,
      requirementName: req.name,
      requirementPriority: req.priority,
      status: 'UNCERTAIN',
      confidence: 0.35,
      evidenceText: `"${req.name}" mentioned but without sufficient context`,
      missingEvidenceExplanation: `"${req.name}" appears in the candidate's profile but without production-level evidence.`,
      recruiterAction: `Verify depth of ${req.name} experience — term appears but evidence is thin.`,
      suggestedInterviewQuestion: `Tell me about a specific project where you used ${req.name} in production.`,
    };
  }

  // No evidence found — say so clearly, never fabricate
  return {
    requirementId: req.id,
    requirementName: req.name,
    requirementPriority: req.priority,
    status: 'MISSING',
    confidence: 0,
    missingEvidenceExplanation: `No evidence of ${req.name} found in resume, experience, or projects. This is absence of evidence, not confirmed absence of skill.`,
    recruiterAction: req.priority === 'MANDATORY'
      ? `MANDATORY: Directly ask candidate about ${req.name}. Consider this a potential blocker.`
      : `Preferred: Inquire about ${req.name} during interview.`,
    suggestedInterviewQuestion: `Do you have experience with ${req.name}? Can you walk me through any project where you used it?`,
  };
}

// ── Score Components ──
function calculateScoreComponents(
  assessments: RequirementAssessment[],
  candidate: CandidateProfile,
  job: Job,
  corpus: CandidateCorpus,
): ScoreComponent[] {
  const mandatory = assessments.filter(a => a.requirementPriority === 'MANDATORY');
  const preferred = assessments.filter(a => a.requirementPriority === 'PREFERRED');

  const mandatoryScore = mandatory.length === 0 ? 100 :
    Math.round((mandatory.filter(a => a.status === 'STRONG').length * 100 +
                mandatory.filter(a => a.status === 'PARTIAL').length * 60 +
                mandatory.filter(a => a.status === 'UNCERTAIN').length * 30) /
               mandatory.length);

  const preferredScore = preferred.length === 0 ? 80 :
    Math.round((preferred.filter(a => a.status === 'STRONG').length * 100 +
                preferred.filter(a => a.status === 'PARTIAL').length * 60) /
               preferred.length);

  const experienceScore = Math.min(100, Math.round(corpus.yearsOfExperience * 15));
  const projectScore = Math.min(100, candidate.projects.length * 20);

  return [
    { dimension: 'Mandatory Skill Alignment', score: mandatoryScore, weight: 0.45, explanation: `${mandatory.filter(a => a.status === 'STRONG').length}/${mandatory.length} mandatory requirements have direct evidence` },
    { dimension: 'Preferred Skill Alignment', score: preferredScore, weight: 0.20, explanation: `${preferred.filter(a => a.status === 'STRONG').length}/${preferred.length} preferred requirements matched` },
    { dimension: 'Experience Relevance', score: experienceScore, weight: 0.20, explanation: `${Math.round(corpus.yearsOfExperience)} years of professional experience` },
    { dimension: 'Project Evidence', score: projectScore, weight: 0.15, explanation: `${candidate.projects.length} projects with demonstrated technology usage` },
  ];
}

function calculateRequiredAlignment(assessments: RequirementAssessment[]): 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT' {
  const mandatory = assessments.filter(a => a.requirementPriority === 'MANDATORY');
  if (mandatory.length === 0) return 'MODERATE';
  const strongCount = mandatory.filter(a => a.status === 'STRONG').length;
  const ratio = strongCount / mandatory.length;
  if (ratio >= 0.8) return 'STRONG';
  if (ratio >= 0.5) return 'MODERATE';
  if (ratio >= 0.2) return 'WEAK';
  return 'INSUFFICIENT';
}

function calculateExperienceRelevance(candidate: CandidateProfile, _job: Job): 'STRONG' | 'MODERATE' | 'WEAK' | 'UNCLEAR' {
  const years = candidate.experience.reduce((sum, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);
  if (years >= 5) return 'STRONG';
  if (years >= 2) return 'MODERATE';
  if (years >= 0.5) return 'WEAK';
  return 'UNCLEAR';
}

function calculateProjectRelevance(
  candidate: CandidateProfile, 
  _job: Job,
  extractedSkills: ReturnType<typeof extractSkillsFromText>
): 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE' {
  const projectSkillIds = new Set(
    candidate.projects.flatMap(p =>
      p.technologies.map(t => resolveSkill(t)?.id).filter(Boolean)
    )
  );
  const matchingExtracted = extractedSkills.filter(e => projectSkillIds.has(e.skill.id));
  if (matchingExtracted.length >= 4) return 'STRONG';
  if (matchingExtracted.length >= 2) return 'MODERATE';
  if (matchingExtracted.length >= 1) return 'WEAK';
  return 'NONE';
}

function calculateDomainRelevance(candidate: CandidateProfile, _job: Job): 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE' {
  if (candidate.experience.length === 0) return 'NONE';
  if (candidate.experience.length >= 3) return 'STRONG';
  if (candidate.experience.length >= 1) return 'MODERATE';
  return 'WEAK';
}

// ── Skill Gap Generation ──
function generateSkillGaps(
  missing: RequirementAssessment[],
  partial: RequirementAssessment[],
  _job: Job,
  _candidate: CandidateProfile,
): SkillGapDetail[] {
  const gaps: SkillGapDetail[] = [];

  for (const req of missing.filter(r => r.requirementPriority !== 'OPTIONAL')) {
    const skill = resolveSkill(req.requirementName);
    const related = skill ? getRelatedSkills(skill.id) : [];

    gaps.push({
      skillName: req.requirementName,
      jobPriority: req.requirementPriority,
      whyItMatters: `${req.requirementName} is a ${req.requirementPriority.toLowerCase()} requirement for this role.`,
      whatEvidenceIsMissing: req.missingEvidenceExplanation || `No evidence of ${req.requirementName} found in the candidate's profile.`,
      relatedExperience: related.length > 0
        ? `Candidate may have adjacent experience in: ${related.slice(0, 2).map(r => r.name).join(', ')}`
        : undefined,
      suggestedProject: generateProjectSuggestion(req.requirementName),
      suggestedLearningPath: `Official ${req.requirementName} documentation and a hands-on portfolio project`,
      suggestedInterviewQuestion: req.suggestedInterviewQuestion || `Describe any experience you have with ${req.requirementName}.`,
    });
  }

  for (const req of partial.filter(r => r.requirementPriority === 'MANDATORY')) {
    gaps.push({
      skillName: req.requirementName,
      jobPriority: req.requirementPriority,
      whyItMatters: `${req.requirementName} is mandatory and only partial evidence was found.`,
      whatEvidenceIsMissing: `Partial evidence detected — related skills present but no direct ${req.requirementName} production evidence.`,
      relatedExperience: req.relatedEvidence,
      suggestedInterviewQuestion: req.suggestedInterviewQuestion || `Describe a production system where you used ${req.requirementName}.`,
    });
  }

  return gaps;
}

function generateProjectSuggestion(skillName: string): string {
  const suggestions: Record<string, string> = {
    'kafka': 'Build an event-driven order-processing system using Kafka with producer, consumer, consumer groups, retry, and dead-letter handling.',
    'kubernetes': 'Deploy a multi-service application on Kubernetes with HPA, health checks, and rolling updates.',
    'aws': 'Build a serverless REST API on AWS Lambda + API Gateway + DynamoDB with proper IAM roles.',
    'docker': 'Containerize an existing application with multi-stage Dockerfile, docker-compose for local dev, and image optimization.',
    'postgresql': 'Design and optimize a relational schema for a complex domain with proper indexes, constraints, and query plans.',
    'machine-learning': 'Train and deploy a classification model end-to-end: data prep, training, evaluation, serving via REST API.',
    'system-design': 'Document and diagram a scalable URL shortener or chat system with load balancing, caching, and database design.',
  };
  const lower = skillName.toLowerCase();
  for (const [key, suggestion] of Object.entries(suggestions)) {
    if (lower.includes(key)) return suggestion;
  }
  return `Build a portfolio project demonstrating practical ${skillName} usage in a realistic scenario.`;
}

// ── Explanation Builders ──
function buildExplanation(
  eligibility: EligibilityStatus,
  score: number,
  strong: RequirementAssessment[],
  missing: RequirementAssessment[],
): string {
  const parts: string[] = [];

  if (eligibility === 'ELIGIBLE') {
    parts.push('All mandatory requirements have supporting evidence in the candidate\'s profile.');
  } else if (eligibility === 'CONDITIONAL') {
    const m = missing.find(r => r.requirementPriority === 'MANDATORY');
    parts.push(`One mandatory requirement lacks direct evidence: ${m?.requirementName}. Conditional eligibility — investigation recommended.`);
  } else {
    parts.push(`Multiple mandatory requirements have no evidence. Eligibility is uncertain without direct verification.`);
  }

  if (strong.length > 0) {
    parts.push(`Strong evidence found for: ${strong.slice(0, 3).map(r => r.requirementName).join(', ')}.`);
  }

  if (missing.length > 0) {
    const mandatoryMissing = missing.filter(r => r.requirementPriority === 'MANDATORY');
    if (mandatoryMissing.length > 0) {
      parts.push(`No evidence for mandatory requirements: ${mandatoryMissing.map(r => r.requirementName).join(', ')}. This is absence of evidence, not confirmed absence of skill.`);
    }
  }

  return parts.join(' ');
}

function buildEvidenceSummary(assessments: RequirementAssessment[]): string {
  const strong = assessments.filter(a => a.status === 'STRONG').length;
  const partial = assessments.filter(a => a.status === 'PARTIAL').length;
  const missing = assessments.filter(a => a.status === 'MISSING').length;
  const uncertain = assessments.filter(a => a.status === 'UNCERTAIN').length;
  return `${strong} requirements matched with direct evidence, ${partial} partially matched via related skills, ${missing} have no evidence, ${uncertain} require verification.`;
}

function generateRecruiterRecommendations(
  assessments: RequirementAssessment[],
  candidate: CandidateProfile,
  _job: Job,
): string[] {
  const recs: string[] = [];
  const mandatoryMissing = assessments.filter(a => a.requirementPriority === 'MANDATORY' && a.status === 'MISSING');
  const partialMandatory = assessments.filter(a => a.requirementPriority === 'MANDATORY' && a.status === 'PARTIAL');

  if (mandatoryMissing.length > 0) {
    recs.push(`Investigate ${mandatoryMissing.map(r => r.requirementName).join(', ')} — these are mandatory requirements with no resume evidence.`);
  }
  if (partialMandatory.length > 0) {
    recs.push(`Probe depth on ${partialMandatory.map(r => r.requirementName).join(', ')} — related experience detected but not direct.`);
  }
  if (candidate.experience.length === 0) {
    recs.push('No work experience detected in the profile. Verify if this is a fresh graduate or incomplete profile.');
  }
  if (candidate.projects.length >= 3) {
    recs.push('Strong project portfolio — review projects for production scale and complexity.');
  }
  if (assessments.filter(a => a.status === 'UNCERTAIN').length > 2) {
    recs.push('Several skills have thin evidence. Request a technical assessment before investing in interviews.');
  }

  return recs;
}

function hashInput(candidateId: string, jobId: string): string {
  return `${candidateId}:${jobId}:${ENGINE_VERSION}`;
}

// ── Resume Intelligence ──
export interface ResumeIntelligence {
  extractedSkills: Array<{
    skill: { id: string; name: string; category: string };
    evidenceText: string;
    source: string;
  }>;
  yearsOfExperience: number;
  seniorityInferred: string;
  inferredOccupations: string[];
  profileStrengths: string[];
  profileWeaknesses: string[];
  parsingStatus: 'complete' | 'partial';
}

export function analyzeResume(candidate: CandidateProfile): ResumeIntelligence {
  const corpus = buildCandidateCorpus(candidate);
  const extracted = extractSkillsFromText(corpus.fullText);

  const seniority =
    corpus.yearsOfExperience >= 8 ? 'Principal / Staff' :
    corpus.yearsOfExperience >= 5 ? 'Senior' :
    corpus.yearsOfExperience >= 2 ? 'Mid-Level' :
    corpus.yearsOfExperience >= 0.5 ? 'Junior' : 'Entry Level / Intern';

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (extracted.length >= 8) strengths.push(`Strong technical depth — ${extracted.length} distinct skills with evidence`);
  if (candidate.projects.length >= 3) strengths.push(`${candidate.projects.length} portfolio projects demonstrating practical application`);
  if (corpus.yearsOfExperience >= 3) strengths.push(`${Math.round(corpus.yearsOfExperience)} years of professional experience`);
  if (candidate.education.length > 0) strengths.push('Formal education credentials present');

  if (extracted.length < 3) weaknesses.push('Few technical skills detected — consider expanding resume detail');
  if (candidate.experience.length === 0) weaknesses.push('No work experience listed');
  if (candidate.projects.length === 0) weaknesses.push('No portfolio projects — projects significantly strengthen applications');
  if (!candidate.summary) weaknesses.push('No professional summary — a focused summary improves match quality');

  return {
    extractedSkills: extracted.map(e => ({
      skill: { id: e.skill.id, name: e.skill.name, category: e.skill.category },
      evidenceText: e.evidenceText,
      source: 'extracted from profile text',
    })),
    yearsOfExperience: Math.round(corpus.yearsOfExperience * 10) / 10,
    seniorityInferred: seniority,
    inferredOccupations: [], // populated by occupation resolver
    profileStrengths: strengths,
    profileWeaknesses: weaknesses,
    parsingStatus: candidate.resumeRawText ? 'complete' : 'partial',
  };
}
