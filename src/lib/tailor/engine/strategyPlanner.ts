// ============================================================
// HIREFLOW TAILORING STRATEGY PLANNER
// Archetype-aware section ordering, skill prioritization, and length strategy
// Deterministic: accepts injected asOf date, zero clock access (Hard Rule 2, I-27)
// ============================================================

import {
  CandidateProfile,
  JobDescription,
  EvidenceMapping,
  TailoringPlan,
  SectionOrderRecommendation,
  CandidateArchetype
} from '../types';

export function planTailoringStrategy(
  candidate: CandidateProfile,
  job: JobDescription,
  evidence: EvidenceMapping,
  options?: { asOf?: string }
): TailoringPlan {
  const asOf = options?.asOf || '2026-10-28';
  const archetype: CandidateArchetype = candidate.archetype || 'technical_specialist';

  // Section Ordering Rules based on Archetype & Graduation Recency
  let recommendedSectionOrder: SectionOrderRecommendation[] = [];

  if (archetype === 'student_fresher') {
    recommendedSectionOrder = [
      {
        sectionId: 'education',
        title: 'Education',
        recommendedPosition: 1,
        rationale: 'Prioritize recent degree, academic excellence, and CGPA for entry-level roles; graduation was recent or candidate is currently enrolled.'
      },
      { sectionId: 'projects', title: 'Technical Projects', recommendedPosition: 2, rationale: 'Demonstrates hands-on engineering ability and applied tooling in lieu of full-time corporate history.' },
      { sectionId: 'skills', title: 'Technical Skills', recommendedPosition: 3, rationale: 'Positions proficiencies clearly for automated ATS parsing.' },
      { sectionId: 'experience', title: 'Experience & Internships', recommendedPosition: 4, rationale: 'Highlights internships, apprenticeships, or student leadership.' },
      { sectionId: 'certifications', title: 'Certifications', recommendedPosition: 5, rationale: 'Supplements education with verified third-party technical credentials.' }
    ];
  } else if (archetype === 'cybersecurity_specialist') {
    recommendedSectionOrder = [
      { sectionId: 'summary', title: 'Security Summary', recommendedPosition: 1, rationale: 'Establishes clearance level, core domains (SOC/AppSec/NIST), and threat mitigation focus.' },
      { sectionId: 'certifications', title: 'Certifications & Credentials', recommendedPosition: 2, rationale: 'Crucial trust signal in security (e.g. CISSP, CEH, CompTIA Security+).' },
      { sectionId: 'experience', title: 'Professional Experience', recommendedPosition: 3, rationale: 'Documents incident response, vulnerability remediation, and enterprise infrastructure audits.' },
      { sectionId: 'skills', title: 'Security Toolstack & Environments', recommendedPosition: 4, rationale: 'Explicit SIEM, firewall, and penetration testing tooling.' },
      { sectionId: 'projects', title: 'Security Labs & Projects', recommendedPosition: 5, rationale: 'Highlights capture-the-flag (CTF), vulnerability disclosures, or tool development.' },
      { sectionId: 'education', title: 'Education', recommendedPosition: 6, rationale: 'Foundational degree details.' }
    ];
  } else if (archetype === 'academic_researcher') {
    recommendedSectionOrder = [
      { sectionId: 'education', title: 'Education', recommendedPosition: 1, rationale: 'Highlights advanced degrees (Ph.D., M.S.), advisors, and academic pedigree; graduation was part of research pathway.' },
      { sectionId: 'projects', title: 'Research & Publications', recommendedPosition: 2, rationale: 'Prioritizes peer-reviewed publications, arXiv preprints, and research grants.' },
      { sectionId: 'experience', title: 'Academic & Industry Experience', recommendedPosition: 3, rationale: 'Fellowships, lab appointments, and industry research collaborations.' },
      { sectionId: 'skills', title: 'Research Methodologies & Tools', recommendedPosition: 4, rationale: 'Mathematical modeling, frameworks (PyTorch), and experimental instrumentation.' }
    ];
  } else if (archetype === 'experienced_executive') {
    recommendedSectionOrder = [
      { sectionId: 'summary', title: 'Executive Summary', recommendedPosition: 1, rationale: 'Frames career leadership scope, P&L responsibility, and organizational milestones.' },
      { sectionId: 'experience', title: 'Executive Experience', recommendedPosition: 2, rationale: 'Focuses on strategic initiatives, revenue growth, and team scaling.' },
      { sectionId: 'skills', title: 'Core Competencies', recommendedPosition: 3, rationale: 'High-level architectural, product, and leadership domains.' },
      { sectionId: 'education', title: 'Education', recommendedPosition: 4, rationale: 'Degrees and executive education credentials.' }
    ];
  } else {
    // Default: technical_specialist
    recommendedSectionOrder = [
      { sectionId: 'skills', title: 'Technical Skills', recommendedPosition: 1, rationale: 'Immediately satisfies ATS skill extraction and recruiter keyword scanning.' },
      { sectionId: 'experience', title: 'Work Experience', recommendedPosition: 2, rationale: 'Demonstrates commercial production impact, system architecture, and delivery.' },
      { sectionId: 'projects', title: 'Key Projects', recommendedPosition: 3, rationale: 'Showcases specialized systems or open-source initiatives relevant to the target stack.' },
      { sectionId: 'education', title: 'Education', recommendedPosition: 4, rationale: 'Standard university credentials.' }
    ];
  }

  // Skills to Emphasize (Intersect candidate skills with JD requirements)
  const skillsToEmphasize = job.requirements
    .filter(r => r.category === 'skill')
    .map(r => r.normalizedConcept)
    .slice(0, 10);

  // Page Strategy
  const totalBullets = candidate.experience.reduce((acc, e) => acc + e.bullets.length, 0) +
                       candidate.projects.reduce((acc, p) => acc + p.bullets.length, 0);

  const recommendedPages = totalBullets > 12 || archetype === 'experienced_executive' || archetype === 'academic_researcher'
    ? 2
    : 1;

  const pageReason = recommendedPages === 1
    ? 'Standard 1-page format is strongly recommended for highest recruiter engagement and density.'
    : '2-page format recommended to accommodate extensive career history and publications without sacrificing readability.';

  return {
    projectId: 'proj_plan_deterministic',
    recommendedArchetype: archetype,
    recommendedSectionOrder,
    skillsToEmphasize,
    contentToPrune: [],
    bulletTransformations: [],
    pageStrategy: {
      recommendedPages,
      reason: pageReason
    },
    generatedAt: `${asOf}T12:00:00.000Z`
  };
}
