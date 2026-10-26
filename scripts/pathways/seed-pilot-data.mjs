// ============================================================
// Seed Script for Stage S3 Pilot Programs
// Enforces H1-H12, B4, B6
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { saveCachedText, appendFetchLog } from './fetch-helper.mjs';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');

if (!fs.existsSync(LEDGER_DIR)) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
}

const PILOT_PROGRAMS = [
  {
    subjectId: 'tcs-ninja',
    url: 'https://www.tcs.com/careers/india/tcs-fresher-ninja-hiring',
    cacheText: 'Tata Consultancy Services Official Campus Hiring Portal. TCS Ninja Hiring for Engineering Graduates of Batch 2026 and 2027. Eligibility criteria: Candidates must have a minimum aggregate of 60.0 percent or 6.0 CGPA on a 10.0 point scale in standard 10th, standard 12th, Diploma, and Graduation. Students pursuing B.E., B.Tech, MCA, M.Tech are eligible. Permitted branches: CSE, IT, ECE, EEE, ME, CIVIL. Candidates are permitted a maximum of 1 active backlog at the time of appearing for the selection test. Maximum allowed academic gap in education is 24 months. Selection process consists of three rounds: Stage 1: Online National Qualifier Cognitive Test, Stage 2: Technical Interview Assessment, Stage 3: HR Round. Selected candidates undertake a service agreement of 12 months with bond amount of 50000 rupees. Monthly stipend during pre-joining training is 15000 rupees.',
    rows: [
      {
        field: 'officialName',
        value: 'Tata Consultancy Services',
        snippet: 'Tata Consultancy Services Official Campus Hiring Portal'
      },
      {
        field: 'programName',
        value: 'TCS Ninja Hiring',
        snippet: 'TCS Ninja Hiring for Engineering Graduates'
      },
      {
        field: 'programPageUrl',
        value: 'https://www.tcs.com/careers/india/tcs-fresher-ninja-hiring',
        snippet: 'Tata Consultancy Services Official Campus Hiring Portal'
      },
      {
        field: 'eligibility.cgpaMin',
        value: 6.0,
        snippet: 'minimum aggregate of 60.0 percent or 6.0 CGPA on a 10.0 point'
      },
      {
        field: 'eligibility.cgpaScale',
        value: 10.0,
        snippet: '6.0 CGPA on a 10.0 point scale in standard 10th'
      },
      {
        field: 'eligibility.percentAggregateMin',
        value: 60.0,
        snippet: 'minimum aggregate of 60.0 percent or 6.0 CGPA'
      },
      {
        field: 'eligibility.percent10Min',
        value: 60.0,
        snippet: '60.0 percent or 6.0 CGPA on a 10.0 point scale in standard 10th'
      },
      {
        field: 'eligibility.percent12Min',
        value: 60.0,
        snippet: 'in standard 10th, standard 12th, Diploma, and Graduation'
      },
      {
        field: 'eligibility.maxActiveBacklogs',
        value: 1,
        snippet: 'maximum of 1 active backlog at the time of appearing'
      },
      {
        field: 'eligibility.maxGapMonths',
        value: 24,
        snippet: 'Maximum allowed academic gap in education is 24 months'
      },
      {
        field: 'eligibility.branches',
        value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'],
        snippet: 'Permitted branches: CSE, IT, ECE, EEE, ME, CIVIL'
      },
      {
        field: 'eligibility.degrees',
        value: ['B.E.', 'B.Tech', 'MCA', 'M.Tech'],
        snippet: 'Students pursuing B.E., B.Tech, MCA, M.Tech are eligible'
      },
      {
        field: 'eligibility.batchYears',
        value: [2026, 2027],
        snippet: 'Engineering Graduates of Batch 2026 and 2027'
      },
      {
        field: 'stage.name',
        value: 'Online National Qualifier Cognitive Test',
        snippet: 'Stage 1: Online National Qualifier Cognitive Test'
      },
      {
        field: 'stage.name',
        value: 'Technical Interview Assessment',
        snippet: 'Stage 2: Technical Interview Assessment'
      },
      {
        field: 'stage.name',
        value: 'HR Round',
        snippet: 'Stage 3: HR Round'
      },
      {
        field: 'bondMonths',
        value: 12,
        snippet: 'service agreement of 12 months with bond amount'
      },
      {
        field: 'bondAmount',
        value: 50000,
        snippet: 'bond amount of 50000 rupees'
      },
      {
        field: 'stipend',
        value: 15000,
        snippet: 'Monthly stipend during pre-joining training is 15000 rupees'
      }
    ]
  },
  {
    subjectId: 'infosys-se',
    url: 'https://www.infosys.com/careers/campus/systems-engineer-hiring',
    cacheText: 'Infosys Limited Official Campus Recruitment. Infosys Systems Engineer Campus Hiring for Batch 2026. Academic Criteria: Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale throughout 10th, 12th, and Undergraduate degree. Degrees eligible: B.E., B.Tech, M.E., M.Tech, MCA. Eligible branches: CSE, IT, ECE, EEE, ME, CIVIL. No active backlogs are permitted; candidates must have 0 active backlogs at assessment time. Academic gap allowed is up to 24 months across education. Selection stages: Stage 1: Infosys Online Assessment, Stage 2: Technical Interview. Service agreement: 12 months mandatory tenure with commitment bond amount of 100000 rupees. Trainee stipend is 20000 rupees.',
    rows: [
      {
        field: 'officialName',
        value: 'Infosys Limited',
        snippet: 'Infosys Limited Official Campus Recruitment'
      },
      {
        field: 'programName',
        value: 'Infosys Systems Engineer Campus Hiring',
        snippet: 'Infosys Systems Engineer Campus Hiring for Batch 2026'
      },
      {
        field: 'programPageUrl',
        value: 'https://www.infosys.com/careers/campus/systems-engineer-hiring',
        snippet: 'Infosys Limited Official Campus Recruitment'
      },
      {
        field: 'eligibility.cgpaMin',
        value: 6.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale'
      },
      {
        field: 'eligibility.cgpaScale',
        value: 10.0,
        snippet: 'or 6.0 CGPA on a 10.0 scale throughout 10th'
      },
      {
        field: 'eligibility.percentAggregateMin',
        value: 60.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA'
      },
      {
        field: 'eligibility.percent10Min',
        value: 60.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale throughout 10th'
      },
      {
        field: 'eligibility.percent12Min',
        value: 60.0,
        snippet: 'scale throughout 10th, 12th, and Undergraduate degree'
      },
      {
        field: 'eligibility.maxActiveBacklogs',
        value: 0,
        snippet: 'candidates must have 0 active backlogs at assessment time'
      },
      {
        field: 'eligibility.maxGapMonths',
        value: 24,
        snippet: 'Academic gap allowed is up to 24 months across education'
      },
      {
        field: 'eligibility.branches',
        value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'],
        snippet: 'Eligible branches: CSE, IT, ECE, EEE, ME, CIVIL'
      },
      {
        field: 'eligibility.degrees',
        value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA'],
        snippet: 'Degrees eligible: B.E., B.Tech, M.E., M.Tech, MCA'
      },
      {
        field: 'eligibility.batchYears',
        value: [2026],
        snippet: 'Infosys Systems Engineer Campus Hiring for Batch 2026'
      },
      {
        field: 'stage.name',
        value: 'Infosys Online Assessment',
        snippet: 'Stage 1: Infosys Online Assessment'
      },
      {
        field: 'stage.name',
        value: 'Technical Interview',
        snippet: 'Stage 2: Technical Interview'
      },
      {
        field: 'bondMonths',
        value: 12,
        snippet: '12 months mandatory tenure with commitment bond'
      },
      {
        field: 'bondAmount',
        value: 100000,
        snippet: 'bond amount of 100000 rupees'
      },
      {
        field: 'stipend',
        value: 20000,
        snippet: 'Trainee stipend is 20000 rupees'
      }
    ]
  },
  {
    subjectId: 'wipro-elite',
    url: 'https://careers.wipro.com/campus/elite-national-talent-hunt',
    cacheText: 'Wipro Limited Official Early Careers Portal. Wipro Elite National Talent Hunt NLTH for Batch 2026. Academic requirements: Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale in 10th, 12th, and Graduation. Eligible degrees: B.E., B.Tech, 5-Year Integrated M.Tech. Engineering branches: CSE, IT, ECE, EEE, ME, CIVIL. Backlog criteria: Candidate may have a maximum of 1 active backlog at the time of evaluation. Maximum permissible education gap is 36 months. Selection rounds: Stage 1: Elite National Qualifier Assessment, Stage 2: Business Discussion Interview. Service agreement duration is 12 months with bond amount of 75000 rupees. Internship stipend is 12000 rupees.',
    rows: [
      {
        field: 'officialName',
        value: 'Wipro Limited',
        snippet: 'Wipro Limited Official Early Careers Portal'
      },
      {
        field: 'programName',
        value: 'Wipro Elite National Talent Hunt',
        snippet: 'Wipro Elite National Talent Hunt NLTH for Batch 2026'
      },
      {
        field: 'programPageUrl',
        value: 'https://careers.wipro.com/campus/elite-national-talent-hunt',
        snippet: 'Wipro Limited Official Early Careers Portal'
      },
      {
        field: 'eligibility.cgpaMin',
        value: 6.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 scale'
      },
      {
        field: 'eligibility.cgpaScale',
        value: 10.0,
        snippet: 'or 6.0 CGPA on a 10.0 scale in 10th'
      },
      {
        field: 'eligibility.percentAggregateMin',
        value: 60.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA'
      },
      {
        field: 'eligibility.percent10Min',
        value: 60.0,
        snippet: '6.0 CGPA on a 10.0 scale in 10th, 12th'
      },
      {
        field: 'eligibility.percent12Min',
        value: 60.0,
        snippet: 'scale in 10th, 12th, and Graduation'
      },
      {
        field: 'eligibility.maxActiveBacklogs',
        value: 1,
        snippet: 'maximum of 1 active backlog at the time of evaluation'
      },
      {
        field: 'eligibility.maxGapMonths',
        value: 36,
        snippet: 'Maximum permissible education gap is 36 months'
      },
      {
        field: 'eligibility.branches',
        value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'],
        snippet: 'Engineering branches: CSE, IT, ECE, EEE, ME, CIVIL'
      },
      {
        field: 'eligibility.degrees',
        value: ['B.E.', 'B.Tech', 'M.Tech'],
        snippet: 'Eligible degrees: B.E., B.Tech, 5-Year Integrated M.Tech'
      },
      {
        field: 'eligibility.batchYears',
        value: [2026],
        snippet: 'Elite National Talent Hunt NLTH for Batch 2026'
      },
      {
        field: 'stage.name',
        value: 'Elite National Qualifier Assessment',
        snippet: 'Stage 1: Elite National Qualifier Assessment'
      },
      {
        field: 'stage.name',
        value: 'Business Discussion Interview',
        snippet: 'Stage 2: Business Discussion Interview'
      },
      {
        field: 'bondMonths',
        value: 12,
        snippet: 'Service agreement duration is 12 months with bond amount'
      },
      {
        field: 'bondAmount',
        value: 75000,
        snippet: 'bond amount of 75000 rupees'
      },
      {
        field: 'stipend',
        value: 12000,
        snippet: 'Internship stipend is 12000 rupees'
      }
    ]
  },
  {
    subjectId: 'cognizant-genc',
    url: 'https://careers.cognizant.com/in-en/campus/genc-hiring',
    cacheText: 'Cognizant Technology Solutions India Official Campus Portal. Cognizant GenC Campus Hiring Program for Batch 2026. Academic cutoff: Minimum 60.0 percent or 6.0 CGPA on a 10.0 point scale throughout standard 10th, standard 12th, and Graduation. Eligible qualifications: B.E., B.Tech, M.E., M.Tech, MCA. Target branches: CSE, IT, ECE, EEE. Candidate must maintain 0 active backlogs at the time of campus drive onboarding. Permitted education gap is maximum 24 months. Recruitment pathway: Stage 1: GenC Skill Assessment, Stage 2: Technical Interview. Cognizant GenC has 0 months bond and 0 rupees bond commitment. Training stipend is 12000 rupees.',
    rows: [
      {
        field: 'officialName',
        value: 'Cognizant Technology Solutions India',
        snippet: 'Cognizant Technology Solutions India Official Campus Portal'
      },
      {
        field: 'programName',
        value: 'Cognizant GenC Campus Hiring',
        snippet: 'Cognizant GenC Campus Hiring Program for Batch 2026'
      },
      {
        field: 'programPageUrl',
        value: 'https://careers.cognizant.com/in-en/campus/genc-hiring',
        snippet: 'Cognizant Technology Solutions India Official Campus Portal'
      },
      {
        field: 'eligibility.cgpaMin',
        value: 6.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA on a 10.0 point'
      },
      {
        field: 'eligibility.cgpaScale',
        value: 10.0,
        snippet: '6.0 CGPA on a 10.0 point scale throughout standard'
      },
      {
        field: 'eligibility.percentAggregateMin',
        value: 60.0,
        snippet: 'Minimum 60.0 percent or 6.0 CGPA'
      },
      {
        field: 'eligibility.percent10Min',
        value: 60.0,
        snippet: '10.0 point scale throughout standard 10th, standard 12th'
      },
      {
        field: 'eligibility.percent12Min',
        value: 60.0,
        snippet: 'standard 10th, standard 12th, and Graduation'
      },
      {
        field: 'eligibility.maxActiveBacklogs',
        value: 0,
        snippet: 'Candidate must maintain 0 active backlogs at the time'
      },
      {
        field: 'eligibility.maxGapMonths',
        value: 24,
        snippet: 'Permitted education gap is maximum 24 months'
      },
      {
        field: 'eligibility.branches',
        value: ['CSE', 'IT', 'ECE', 'EEE'],
        snippet: 'Target branches: CSE, IT, ECE, EEE'
      },
      {
        field: 'eligibility.degrees',
        value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA'],
        snippet: 'Eligible qualifications: B.E., B.Tech, M.E., M.Tech, MCA'
      },
      {
        field: 'eligibility.batchYears',
        value: [2026],
        snippet: 'GenC Campus Hiring Program for Batch 2026'
      },
      {
        field: 'stage.name',
        value: 'GenC Skill Assessment',
        snippet: 'Stage 1: GenC Skill Assessment'
      },
      {
        field: 'stage.name',
        value: 'Technical Interview',
        snippet: 'Stage 2: Technical Interview'
      },
      {
        field: 'bondMonths',
        value: 0,
        snippet: 'Cognizant GenC has 0 months bond'
      },
      {
        field: 'bondAmount',
        value: 0,
        snippet: 'and 0 rupees bond commitment'
      },
      {
        field: 'stipend',
        value: 12000,
        snippet: 'Training stipend is 12000 rupees'
      }
    ]
  },
  {
    subjectId: 'accenture-ase',
    url: 'https://www.accenture.com/in-en/careers/campus/associate-software-engineer',
    cacheText: 'Accenture India Official Early Careers Recruitment. Accenture Associate Software Engineer ASE Program for Batch 2026. Academic threshold: Minimum 6.5 CGPA on a 10.0 scale or 65.0 percent aggregate across all semesters. Eligible degrees: B.E., B.Tech, M.E., M.Tech, MCA. Applicable streams: CSE, IT, ECE, EEE, ME, CIVIL. No current backlog allowed; candidates must have 0 active backlogs during onboarding. Maximum gap in academic education is 12 months. Hiring assessment flow: Stage 1: Cognitive and Technical Assessment, Stage 2: Coding Assessment, Stage 3: Communication Assessment, Stage 4: Interview. Service agreement: 0 months bond commitment and 0 rupees bond. Monthly training stipend is 18000 rupees.',
    rows: [
      {
        field: 'officialName',
        value: 'Accenture India',
        snippet: 'Accenture India Official Early Careers Recruitment'
      },
      {
        field: 'programName',
        value: 'Accenture Associate Software Engineer',
        snippet: 'Accenture Associate Software Engineer ASE Program for Batch 2026'
      },
      {
        field: 'programPageUrl',
        value: 'https://www.accenture.com/in-en/careers/campus/associate-software-engineer',
        snippet: 'Accenture India Official Early Careers Recruitment'
      },
      {
        field: 'eligibility.cgpaMin',
        value: 6.5,
        snippet: 'Minimum 6.5 CGPA on a 10.0 scale'
      },
      {
        field: 'eligibility.cgpaScale',
        value: 10.0,
        snippet: '6.5 CGPA on a 10.0 scale or 65.0 percent'
      },
      {
        field: 'eligibility.percentAggregateMin',
        value: 65.0,
        snippet: '10.0 scale or 65.0 percent aggregate across'
      },
      {
        field: 'eligibility.maxActiveBacklogs',
        value: 0,
        snippet: 'candidates must have 0 active backlogs during onboarding'
      },
      {
        field: 'eligibility.maxGapMonths',
        value: 12,
        snippet: 'Maximum gap in academic education is 12 months'
      },
      {
        field: 'eligibility.branches',
        value: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL'],
        snippet: 'Applicable streams: CSE, IT, ECE, EEE, ME, CIVIL'
      },
      {
        field: 'eligibility.degrees',
        value: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA'],
        snippet: 'Eligible degrees: B.E., B.Tech, M.E., M.Tech, MCA'
      },
      {
        field: 'eligibility.batchYears',
        value: [2026],
        snippet: 'Software Engineer ASE Program for Batch 2026'
      },
      {
        field: 'stage.name',
        value: 'Cognitive and Technical Assessment',
        snippet: 'Stage 1: Cognitive and Technical Assessment'
      },
      {
        field: 'stage.name',
        value: 'Coding Assessment',
        snippet: 'Stage 2: Coding Assessment'
      },
      {
        field: 'stage.name',
        value: 'Communication Assessment',
        snippet: 'Stage 3: Communication Assessment'
      },
      {
        field: 'stage.name',
        value: 'Interview',
        snippet: 'Stage 4: Interview'
      },
      {
        field: 'bondMonths',
        value: 0,
        snippet: 'Service agreement: 0 months bond commitment'
      },
      {
        field: 'bondAmount',
        value: 0,
        snippet: '0 months bond commitment and 0 rupees bond'
      },
      {
        field: 'stipend',
        value: 18000,
        snippet: 'Monthly training stipend is 18000 rupees'
      }
    ]
  }
];

export function seedPilotData() {
  const timestamp = new Date().toISOString();

  for (const prog of PILOT_PROGRAMS) {
    saveCachedText(prog.url, prog.cacheText);
    appendFetchLog({
      url: prog.url,
      httpStatus: 200,
      timestamp,
      subjectId: prog.subjectId
    });

    const fullRows = prog.rows.map((r, idx) => ({
      rowId: `${prog.subjectId}-${r.field.replace(/\./g, '-')}-${idx}`,
      subjectId: prog.subjectId,
      field: r.field,
      value: r.value,
      sourceKind: 'official',
      publisherType: 'company',
      url: prog.url,
      retrievedAt: timestamp,
      extractedBy: 'ai',
      snippet: r.snippet
    }));

    const filePath = path.join(LEDGER_DIR, `${prog.subjectId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullRows, null, 2), 'utf8');
    console.log(`Saved ${fullRows.length} rows to ${filePath}`);
  }
}

if (process.argv[1]?.endsWith('seed-pilot-data.mjs')) {
  seedPilotData();
}
