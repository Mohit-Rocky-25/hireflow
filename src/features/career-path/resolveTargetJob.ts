// ============================================================
// HireFlow — Target Job Description Resolver
// Resolves full job description text and metadata from
// company, role title, and campus program query parameters
// ============================================================

import { careers } from '@/careers-core';
import type { FresherProgram } from '@/careers-core';
import { COMPANIES, findCompanyBySlug } from '@/pages/demo/talentLensData';

export function buildJobDescriptionFromFresherProgram(
  prog: FresherProgram,
  companyName?: string
): string {
  const cName = companyName || prog.companyId.toUpperCase();
  const locStr =
    prog.locations && prog.locations.length > 0
      ? prog.locations.join(', ')
      : 'India (Multiple Tech Hubs)';

  const compStr = prog.compensation
    ? `₹${prog.compensation.fixedMinLPA} - ₹${prog.compensation.fixedMaxLPA} LPA${
        prog.compensation.joiningBonusINR
          ? ` + ₹${(prog.compensation.joiningBonusINR / 100000).toFixed(1)}L Joining Bonus`
          : ''
      }${prog.compensation.esopNote ? ` · ${prog.compensation.esopNote}` : ''}`
    : 'Competitive Industry Package';

  const competenciesList = Object.entries(prog.competencyProfile || {})
    .map(
      ([skill, lvl]) =>
        `• ${skill.toUpperCase()} (${lvl}): Core competency evaluation in technical rounds and coding assessments`
    )
    .join('\n');

  const selectionStagesList = (prog.selectionProcess || [])
    .map(
      (s, idx) =>
        `${idx + 1}. ${s.stage} (${s.type}): ${
          s.topics && s.topics.length > 0 ? s.topics.join(', ') : 'Evaluation round'
        }`
    )
    .join('\n');

  const branchesStr =
    prog.eligibility.branchCodes && prog.eligibility.branchCodes.length > 0
      ? prog.eligibility.branchCodes.join(', ')
      : 'CSE, IT, ECE and allied engineering branches';

  const degreesStr =
    prog.eligibility.degrees && prog.eligibility.degrees.length > 0
      ? prog.eligibility.degrees.join(', ')
      : 'B.Tech / B.E. / M.Tech';

  const cgpaStr = prog.eligibility.minCgpa
    ? `Minimum ${prog.eligibility.minCgpa} CGPA`
    : 'Good academic standing';
  const backlogStr =
    prog.eligibility.backlogPolicy || 'Zero active backlogs at time of joining';

  return `Job Title: ${prog.programName} — ${prog.roleTitle}
Company: ${cName}
Location: ${locStr}
Employment Type: Full-time (${prog.campusCategory.toUpperCase()} Campus Engineering Intake)
Experience Level: Fresher / University Graduate (${(prog.eligibility.graduationYears || [2026, 2027]).join('-')} Batch)
Compensation: ${compStr}

About the Role:
${cName} is hiring university graduates for the ${prog.roleTitle} position through the ${prog.programName} program. In this role, you will be part of high-impact engineering teams building resilient, scalable systems, cloud platforms, and developer services. ${prog.training?.notes ? `New hires participate in: ${prog.training.notes}.` : ''} We are looking for talented problem-solvers with strong algorithmic foundations, curiosity, and a drive to build scalable software solutions.

Key Responsibilities:
• Design, implement, test, and maintain robust, high-performance software applications and microservices.
• Apply fundamental data structures, algorithms, and object-oriented principles to solve challenging computational problems.
• Write clean, modular, and maintainable code with comprehensive test coverage and documentation.
• Collaborate with cross-functional engineering teams, product managers, and code reviewers to deliver reliable features.
• Participate in architectural discussions, technical reviews, and production performance tuning.
• Analyze, troubleshoot, and resolve system anomalies, edge-case bottlenecks, and reliability concerns.

Eligibility Criteria & Qualifications:
• Degree: ${degreesStr} in ${branchesStr}.
• Academic Standing: ${cgpaStr} with ${backlogStr}.
• Strong foundational understanding of Computer Science concepts: Data Structures & Algorithms, Object-Oriented Programming (OOP), Operating Systems, Database Management Systems (DBMS), and Computer Networks.
• Proficiency in modern programming languages such as Java, C++, C#, Python, or TypeScript.
• Excellent analytical, debugging, and collaborative problem-solving skills.

Technical Competencies Evaluated:
${competenciesList || '• Data Structures & Algorithms (expert)\n• Object-Oriented Design & Clean Code (strong)\n• System Design & Operating Systems (working)\n• Databases & Query Optimization (strong)'}

Selection Funnel & Interview Process:
${selectionStagesList || '1. Online Assessment: Algorithmic problem solving and data structures\n2. Technical Interview 1: Data structures, algorithms, and code implementation\n3. Technical Interview 2: Core systems, concurrency, and architecture\n4. Managerial / HR Round: Leadership principles, project discussion, and cultural fit'}`;
}

export function resolveTargetJob(
  companyId?: string | null,
  roleTitle?: string | null,
  programId?: string | null
): { text: string; fileName: string | null } {
  if (!companyId && !roleTitle && !programId) {
    return { text: '', fileName: null };
  }

  const cleanRole = (roleTitle || '').trim();
  const cleanComp = (companyId || '').trim();
  const cleanProg = (programId || '').trim();

  // 1. Try finding company from talentLensData COMPANIES or careers-core
  const talentComp =
    COMPANIES.find(
      (c) =>
        c.id.toLowerCase() === cleanComp.toLowerCase() ||
        c.name.toLowerCase() === cleanComp.toLowerCase()
    ) || findCompanyBySlug(cleanComp);

  const careersComp = careers.companies.get(cleanComp);
  const companyName = talentComp?.name || careersComp?.name || cleanComp || 'Technology Company';

  // 2. Try matching FresherProgram from careers.programs
  if (cleanProg) {
    const directProgram = careers.programs.get(cleanProg);
    if (directProgram) {
      return {
        text: buildJobDescriptionFromFresherProgram(directProgram, companyName),
        fileName: `${companyName}_${directProgram.roleTitle.replace(/\s+/g, '_')}_JD.txt`,
      };
    }
  }

  const companyPrograms = careers.programs.forCompany(cleanComp);
  if (companyPrograms.length > 0 && cleanRole) {
    const lowRole = cleanRole.toLowerCase();
    const matchedProg = companyPrograms.find(
      (p) =>
        p.id.toLowerCase() === lowRole ||
        p.roleTitle.toLowerCase() === lowRole ||
        p.programName.toLowerCase() === lowRole ||
        p.aliases?.some((a) => a.toLowerCase() === lowRole) ||
        lowRole.includes(p.roleTitle.toLowerCase()) ||
        p.programName.toLowerCase().includes(lowRole) ||
        p.roleTitle.toLowerCase().includes(lowRole)
    );

    if (matchedProg) {
      return {
        text: buildJobDescriptionFromFresherProgram(matchedProg, companyName),
        fileName: `${companyName}_${matchedProg.roleTitle.replace(/\s+/g, '_')}_JD.txt`,
      };
    }
  }

  // 3. Try matching Experienced Role from talentComp.roles
  if (talentComp && talentComp.roles && talentComp.roles.length > 0 && cleanRole) {
    const lowRole = cleanRole.toLowerCase();
    const baseRole = lowRole.replace(/\s*\(.*?\)\s*/g, '').trim();

    let matchedRole = talentComp.roles.find((r) => r.title.toLowerCase() === lowRole);
    if (!matchedRole && baseRole) {
      matchedRole = talentComp.roles.find((r) => r.title.toLowerCase() === baseRole);
    }
    if (!matchedRole) {
      matchedRole = talentComp.roles.find(
        (r) =>
          r.title.toLowerCase().includes(lowRole) ||
          lowRole.includes(r.title.toLowerCase()) ||
          (baseRole &&
            (r.title.toLowerCase().includes(baseRole) ||
              baseRole.includes(r.title.toLowerCase())))
      );
    }

    if (matchedRole) {
      let roleText = matchedRole.fullText || '';
      if (!roleText || roleText.trim().split(/\s+/).length < 20) {
        roleText = `Job Title: ${matchedRole.title}
Company: ${talentComp.name}
Location: ${matchedRole.location || talentComp.hq}
Employment Type: ${matchedRole.employmentType || 'Full-time'}
Experience Level: ${matchedRole.experienceLevel || matchedRole.level}

About the Role:
${matchedRole.aboutRole || `${talentComp.name} is seeking an accomplished ${matchedRole.title} to drive mission-critical engineering initiatives and scale platform systems.`}

Key Responsibilities:
${(
  matchedRole.responsibilities || [
    'Design, implement, test, and maintain high-throughput production software components.',
    'Collaborate closely with product, infrastructure, and engineering teammates on technical architecture.',
    'Apply advanced algorithmic principles and patterns to optimize latency and fault-tolerance.',
    'Participate in rigorous code reviews, mentoring, and continuous deployment workflows.',
  ]
)
  .map((r) => `• ${r}`)
  .join('\n')}

Required Qualifications:
${(
  matchedRole.requiredQualifications || [
    "Bachelor's or Master's degree in Computer Science, Software Engineering, or related technical field.",
    'Demonstrated expertise in core data structures, algorithms, and modular object-oriented architecture.',
    'Proven track record writing maintainable, resilient, clean production code.',
  ]
)
  .map((q) => `• ${q}`)
  .join('\n')}

Required Skills & Technologies:
${(
  matchedRole.requiredSkills ||
  matchedRole.toolsAndTech ||
  matchedRole.competencies || ['DSA', 'System Design', 'Java', 'Python']
)
  .map((s: any) => `• ${typeof s === 'string' ? s : s.skill}`)
  .join('\n')}

Hiring Process:
${(
  matchedRole.hiringProcess || [
    '1. Initial recruiter screening and background review',
    '2. Technical coding and data structures assessment',
    '3. Architecture, systems, and deep problem solving round',
    '4. Leadership principles and behavioral interview',
  ]
).join('\n')}`;
      }

      return {
        text: roleText,
        fileName: `${talentComp.name}_${matchedRole.title.replace(/\s+/g, '_')}_JD.txt`,
      };
    }
  }

  // 4. Fallback if company/role was passed but no specific pre-defined role matched
  if (cleanComp && cleanRole) {
    const fallbackText = `Job Title: ${cleanRole}
Company: ${companyName}
Location: India / Global Engineering Centers
Employment Type: Full-time
Experience Level: Target Professional

About the Role:
${companyName} is hiring for the ${cleanRole} position. As part of the engineering team, you will design, develop, and deploy software features and services at scale. We value rigorous problem solvers who write clean, maintainable code and demonstrate solid engineering foundations.

Key Responsibilities:
• Architect, implement, and maintain robust, high-performance software modules and APIs.
• Write clean, well-tested, modular code adhering to industry best practices.
• Apply fundamental data structures, algorithms, and system design patterns to resolve scaling challenges.
• Collaborate with cross-functional engineering teams, product managers, and technical architects.
• Debug and diagnose production issues, ensuring continuous uptime, security, and low latency.

Required Qualifications & Competencies:
• Degree in Computer Science, Information Technology, or allied engineering field.
• Strong foundation in Data Structures, Algorithms, Object-Oriented Design, and Database Systems.
• Hands-on experience with modern programming languages (e.g., Java, Python, C++, TypeScript, or Go).
• Solid understanding of version control, CI/CD pipelines, and cloud services.
• Effective communication and collaborative problem-solving skills in agile environments.`;

    return {
      text: fallbackText,
      fileName: `${companyName}_${cleanRole.replace(/\s+/g, '_')}_JD.txt`,
    };
  }

  return { text: '', fileName: null };
}
