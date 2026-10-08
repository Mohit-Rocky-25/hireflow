// ============================================================
// HireFlow Suite — Public Profile Audit Engine (Stage 4.3)
// Decision Group: "How do I present myself better?" (/tools/profile-check)
// Offline in-browser evaluation of LinkedIn & GitHub signals:
// headline keyword depth, About section hook/proof/CTA,
// README hygiene (demo, diagram, setup, badges), commit velocity,
// and unified Public Signal Score (0-100).
// ============================================================

export interface PinnedRepoInput {
  name: string;
  description?: string;
  hasDemoLink: boolean;
  hasArchitectureDiagram: boolean;
  hasSetupInstructions: boolean;
  hasTechStackBadges: boolean;
  starsCount?: number;
}

export interface LinkedInAuditInput {
  headline: string;
  about: string;
  experience: string;
  skills: string;
  targetRole?: string;
}

export interface GitHubAuditInput {
  username?: string;
  bio?: string;
  hasProfileReadme: boolean;
  pinnedRepos: PinnedRepoInput[];
  commitVelocity: 'daily' | 'weekly' | 'sporadic' | 'inactive';
}

export interface LinkedInAuditResult {
  score: number; // 0-100
  headlineScore: number; // 0-25
  headlineCritique: string;
  headlineStatus: 'good' | 'needs_work' | 'generic';
  aboutScore: number; // 0-25
  aboutCritique: string;
  aboutElements: {
    hasHook: boolean;
    hasProofPoints: boolean;
    hasTechStack: boolean;
    hasCallToAction: boolean;
  };
  experienceScore: number; // 0-25
  experienceCritique: string;
  skillsScore: number; // 0-25
  skillsCritique: string;
  actionItems: string[];
}

export interface RepoReadmeSignal {
  repoName: string;
  score: number; // 0-100
  passedChecks: string[];
  missingChecks: string[];
}

export interface GitHubAuditResult {
  score: number; // 0-100
  pinnedReposScore: number; // 0-40
  pinnedReposCritique: string;
  readmeSignals: RepoReadmeSignal[];
  commitVelocityScore: number; // 0-30
  commitVelocityAdvice: string;
  profileReadmeScore: number; // 0-30
  profileReadmeRecommendation: string;
  actionItems: string[];
}

export interface AuditChecklistItem {
  id: string;
  category: 'LinkedIn' | 'GitHub';
  title: string;
  completed: boolean;
  impact: 'High' | 'Medium' | 'Low';
}

export interface PublicSignalAudit {
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D';
  summary: string;
  linkedIn: LinkedInAuditResult;
  gitHub: GitHubAuditResult;
  checklist: AuditChecklistItem[];
}

const GENERIC_HEADLINE_TERMS = [
  'aspiring',
  'student at',
  'student in',
  'seeking opportunities',
  'actively looking',
  'looking for opportunities',
  'open to work',
  'fresher',
  'passionate coder',
  'enthusiast',
];

export function auditLinkedIn(input: LinkedInAuditInput): LinkedInAuditResult {
  const headline = (input.headline || '').trim();
  const about = (input.about || '').trim();
  const exp = (input.experience || '').trim();
  const skills = (input.skills || '').trim();

  const actionItems: string[] = [];

  // 1. Headline Audit (25 pts)
  let headlineScore = 15;
  let headlineStatus: 'good' | 'needs_work' | 'generic' = 'needs_work';
  let headlineCritique = '';

  const lowerHeadline = headline.toLowerCase();
  const isGeneric = GENERIC_HEADLINE_TERMS.some((term) => lowerHeadline.includes(term));

  if (!headline) {
    headlineScore = 0;
    headlineStatus = 'generic';
    headlineCritique = 'Missing headline. Add your primary engineering role and core stack.';
    actionItems.push('Add a structured LinkedIn headline: Role | Stack | Key Achievement.');
  } else if (isGeneric) {
    headlineScore = 5;
    headlineStatus = 'generic';
    headlineCritique =
      'Generic title detected. Recruiters search by specific technologies, not "Aspiring" or "Student".';
    actionItems.push('Rewrite headline to: "Software Engineer | React, TypeScript, Node.js | Scaled systems to 50K users"');
  } else {
    // Check for role + technologies + differentiator/scale
    const hasRole = /\b(?:engineer|developer|architect|sde|analyst)\b/i.test(headline);
    const hasTech = /[|,•/]\s*[a-zA-Z]/i.test(headline) || headline.length > 30;
    const hasMetricOrProof = /\d+|scale|built|founder|lead/i.test(headline);

    if (hasRole && hasTech && hasMetricOrProof) {
      headlineScore = 25;
      headlineStatus = 'good';
      headlineCritique = 'Strong, high-conversion headline with role, tech stack, and proof signal.';
    } else if (hasRole && hasTech) {
      headlineScore = 20;
      headlineStatus = 'good';
      headlineCritique = 'Clear role and stack keywords. Consider adding a quantified differentiator.';
    } else {
      headlineScore = 12;
      headlineStatus = 'needs_work';
      headlineCritique = 'Add specific tech keywords separated by pipes (e.g. Java | Spring | Kafka).';
      actionItems.push('Include 3-4 searchable keywords in your headline.');
    }
  }

  // 2. About Section Audit (25 pts)
  let aboutScore = 0;
  const hasHook = about.length > 50 && !about.toLowerCase().startsWith('i am a student');
  const hasProofPoints = /\d+%/i.test(about) || /\b\d+\s*(?:x|k|m|users|latency|ms)\b/i.test(about) || /built|shipped|developed|architected/i.test(about);
  const hasTechStack = /stack|technologies|languages|tools|skills|proficient in/i.test(about) || about.includes(':');
  const hasCallToAction = /reach out|email|connect|contact|open to/i.test(about) || /@/.test(about);

  if (hasHook) aboutScore += 7;
  if (hasProofPoints) aboutScore += 7;
  if (hasTechStack) aboutScore += 6;
  if (hasCallToAction) aboutScore += 5;

  let aboutCritique = '';
  if (!about) {
    aboutCritique = 'About section is empty. Recruiters read this for personality and proof of work.';
    actionItems.push('Draft a 3-paragraph About section: Hook → Shipped Projects → Tech Stack & Email.');
  } else if (aboutScore >= 20) {
    aboutCritique = 'Well-structured About section with strong hook, proof points, and call to action.';
  } else {
    aboutCritique = 'Add concrete metrics and a clean call to action (e.g. "Reach out at email@...").';
    if (!hasCallToAction) actionItems.push('Add a direct call-to-action and contact email at the end of About.');
    if (!hasProofPoints) actionItems.push('Add at least 2 quantified project outcomes to your About section.');
  }

  // 3. Experience Formatting Audit (25 pts)
  let experienceScore = 10;
  let experienceCritique = '';
  const hasBullets = /^[*\-•▪●]/m.test(exp) || exp.split('\n').filter((l) => l.trim().length > 10).length >= 3;
  const hasMetricsInExp = /\d+%/i.test(exp) || /\b\d+\s*(?:x|k|m|users|ms|s|gb|tb|req)\b/i.test(exp);

  if (!exp) {
    experienceScore = 5;
    experienceCritique = 'No experience bullets provided. Add project or internship bullet points.';
    actionItems.push('Format experience as concise bullet points using the Action Verb + Context + Result formula.');
  } else if (hasBullets && hasMetricsInExp) {
    experienceScore = 25;
    experienceCritique = 'Structured bullets with clear quantified outcomes.';
  } else if (hasBullets) {
    experienceScore = 18;
    experienceCritique = 'Good bullet formatting, but lacks quantifiable business/performance metrics.';
    actionItems.push('Quantify experience bullets with users served, latency reduced, or test coverage.');
  } else {
    experienceScore = 10;
    experienceCritique = 'Dense paragraphs detected. Convert into 3-4 bullet points per role.';
    actionItems.push('Break dense paragraphs into bullet points.');
  }

  // 4. Skills Section Audit (25 pts)
  let skillsScore = 15;
  let skillsCritique = '';
  const skillCount = skills.split(/[,;\n]+/).filter(Boolean).length;

  if (skillCount >= 8) {
    skillsScore = 25;
    skillsCritique = 'Good keyword density across core languages, frameworks, and databases.';
  } else if (skillCount >= 4) {
    skillsScore = 18;
    skillsCritique = 'Add secondary technologies (databases, devops tools, testing frameworks).';
    actionItems.push('List at least 8-10 core skills matching your target job descriptions.');
  } else {
    skillsScore = 8;
    skillsCritique = 'Low skills count. Recruiters filter candidates based on matched skill endorsements.';
    actionItems.push('Populate your LinkedIn skills section with at least 8 verified competencies.');
  }

  const score = Math.min(100, headlineScore + aboutScore + experienceScore + skillsScore);

  return {
    score,
    headlineScore,
    headlineCritique,
    headlineStatus,
    aboutScore,
    aboutCritique,
    aboutElements: {
      hasHook,
      hasProofPoints,
      hasTechStack,
      hasCallToAction,
    },
    experienceScore,
    experienceCritique,
    skillsScore,
    skillsCritique,
    actionItems,
  };
}

export function auditGitHub(input: GitHubAuditInput): GitHubAuditResult {
  const actionItems: string[] = [];

  // 1. Pinned Repos Hygiene (40 pts)
  const readmeSignals: RepoReadmeSignal[] = [];
  let pinnedReposScore = 0;

  if (!input.pinnedRepos || input.pinnedRepos.length === 0) {
    pinnedReposScore = 5;
    actionItems.push('Pin 2 to 4 of your best engineering repositories on your GitHub profile.');
  } else {
    let totalRepoScore = 0;
    for (const repo of input.pinnedRepos) {
      let rScore = 20; // baseline for existing repo
      const passed: string[] = ['Public repository'];
      const missing: string[] = [];

      if (repo.hasDemoLink) {
        rScore += 25;
        passed.push('Live demo link');
      } else {
        missing.push('Live demo link / deployed URL');
      }

      if (repo.hasArchitectureDiagram) {
        rScore += 25;
        passed.push('Architecture diagram');
      } else {
        missing.push('Architecture diagram / system schema');
      }

      if (repo.hasSetupInstructions) {
        rScore += 15;
        passed.push('Setup instructions');
      } else {
        missing.push('Local setup & reproduction steps');
      }

      if (repo.hasTechStackBadges) {
        rScore += 15;
        passed.push('Tech stack badges');
      } else {
        missing.push('Tech stack badges');
      }

      totalRepoScore += Math.min(100, rScore);
      readmeSignals.push({
        repoName: repo.name,
        score: Math.min(100, rScore),
        passedChecks: passed,
        missingChecks: missing,
      });
    }

    const avgRepo = totalRepoScore / input.pinnedRepos.length;
    pinnedReposScore = Math.round((avgRepo / 100) * 40);

    if (readmeSignals.some((r) => r.missingChecks.includes('Live demo link / deployed URL'))) {
      actionItems.push('Add live demo links to your pinned repositories (Vercel, Netlify, Render).');
    }
    if (readmeSignals.some((r) => r.missingChecks.includes('Architecture diagram / system schema'))) {
      actionItems.push('Include a Mermaid or ASCII architecture diagram in your pinned project READMEs.');
    }
  }

  // 2. Commit Velocity (30 pts)
  let commitVelocityScore = 10;
  let commitVelocityAdvice = '';

  switch (input.commitVelocity) {
    case 'daily':
      commitVelocityScore = 30;
      commitVelocityAdvice = 'Outstanding commit activity. Demonstrates steady engineering consistency.';
      break;
    case 'weekly':
      commitVelocityScore = 25;
      commitVelocityAdvice = 'Solid weekly contributions. Keep pushing code regularly.';
      break;
    case 'sporadic':
      commitVelocityScore = 15;
      commitVelocityAdvice = 'Contributions are sporadic. Aim for at least 2-3 meaningful PRs or commits per week.';
      actionItems.push('Build a consistent 4-week commit streak with small, modular commits.');
      break;
    case 'inactive':
      commitVelocityScore = 5;
      commitVelocityAdvice = 'No recent activity. Active commit graphs significantly build screener confidence.';
      actionItems.push('Resume public GitHub contributions — commit code from current project or open-source issues.');
      break;
  }

  // 3. Profile README (30 pts)
  let profileReadmeScore = 0;
  let profileReadmeRecommendation = '';

  if (input.hasProfileReadme) {
    profileReadmeScore = 30;
    profileReadmeRecommendation = 'Profile README configured. Ensure it links to your top projects and LinkedIn.';
  } else {
    profileReadmeScore = 5;
    profileReadmeRecommendation =
      'Create a GitHub Profile README (create repository matching your username: github.com/<username>/<username>).';
    actionItems.push('Set up a GitHub Profile README with your bio, top tech stack, and GitHub Stats widget.');
  }

  const score = Math.min(100, pinnedReposScore + commitVelocityScore + profileReadmeScore);

  let pinnedReposCritique = '';
  if (pinnedReposScore >= 32) {
    pinnedReposCritique = 'Excellent repository presentation with clean documentation and live links.';
  } else if (pinnedReposScore >= 20) {
    pinnedReposCritique = 'Pinned projects present, but some lack live demos or architecture diagrams.';
  } else {
    pinnedReposCritique = 'Pinned projects require README upgrades before technical screening.';
  }

  return {
    score,
    pinnedReposScore,
    pinnedReposCritique,
    readmeSignals,
    commitVelocityScore,
    commitVelocityAdvice,
    profileReadmeScore,
    profileReadmeRecommendation,
    actionItems,
  };
}

export function auditPublicProfiles(
  linkedInInput: LinkedInAuditInput,
  gitHubInput: GitHubAuditInput
): PublicSignalAudit {
  const linkedIn = auditLinkedIn(linkedInInput);
  const gitHub = auditGitHub(gitHubInput);

  const overallScore = Math.round(linkedIn.score * 0.5 + gitHub.score * 0.5);

  let grade: 'A' | 'B' | 'C' | 'D' = 'C';
  if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 50) grade = 'C';
  else grade = 'D';

  let summary = '';
  if (overallScore >= 80) {
    summary = 'Strong public engineering presence. Profile demonstrates verified depth, clean communication, and technical rigor.';
  } else if (overallScore >= 60) {
    summary = 'Competitive foundation with minor presentation gaps. Implementing the top 3 checklist items will elevate recruiter pass-through.';
  } else {
    summary = 'Public profiles need systematic modernization. Recruiters often skip profiles lacking specific tech keywords and live demos.';
  }

  const checklist: AuditChecklistItem[] = [
    {
      id: 'li-headline',
      category: 'LinkedIn',
      title: 'Role + Stack + Metric Headline (avoid "Aspiring / Student")',
      completed: linkedIn.headlineStatus === 'good',
      impact: 'High',
    },
    {
      id: 'li-about-hook',
      category: 'LinkedIn',
      title: 'About section with strong hook & call-to-action',
      completed: linkedIn.aboutElements.hasHook && linkedIn.aboutElements.hasCallToAction,
      impact: 'Medium',
    },
    {
      id: 'li-exp-metrics',
      category: 'LinkedIn',
      title: 'Experience formatted with quantified action bullets',
      completed: linkedIn.experienceScore >= 20,
      impact: 'High',
    },
    {
      id: 'li-skills',
      category: 'LinkedIn',
      title: 'At least 8 searchable tech skills listed',
      completed: linkedIn.skillsScore >= 20,
      impact: 'Medium',
    },
    {
      id: 'gh-pinned',
      category: 'GitHub',
      title: '2-4 pinned repositories with live demo links',
      completed: gitHub.pinnedReposScore >= 25,
      impact: 'High',
    },
    {
      id: 'gh-readme',
      category: 'GitHub',
      title: 'Personal GitHub Profile README configured',
      completed: gitHub.profileReadmeScore >= 25,
      impact: 'Medium',
    },
    {
      id: 'gh-velocity',
      category: 'GitHub',
      title: 'Active weekly or daily commit velocity',
      completed: gitHub.commitVelocityScore >= 20,
      impact: 'Medium',
    },
  ];

  return {
    overallScore,
    grade,
    summary,
    linkedIn,
    gitHub,
    checklist,
  };
}
