// ============================================================
// HireFlow ATS Resume Roaster — Input Screen Component (Stage 1)
// Token-driven, dark, flat high-contrast input system
// ============================================================

import React, { useMemo } from 'react';
import { FileText, Search, ScanLine, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { SegmentedSelectors, TargetTier, ExperienceLevel } from './SegmentedSelectors';
import { FileDropzone } from './FileDropzone';
import { useTalentLensStore } from '../../../pages/demo/useTalentLensStore';
import { validateAtsInputs, WordLimitSource } from '../../../lib/config/limits';

export type { TargetTier, ExperienceLevel };

// Verified sample presets for instant 1-click testing
const SAMPLE_RESUME_TEXT = `Aman Gupta
Email: aman.gupta@example.com | Phone: +91-9876543210
GitHub: github.com/amangupta | LinkedIn: linkedin.com/in/amangupta

SUMMARY
High-agency Computer Science graduate from NIT Kurukshetra with strong fundamentals in Data Structures, Algorithms, and Full-Stack Development. Solved 450+ problems on LeetCode (Rating: 1890). Built and deployed 3 production web apps serving over 2,500 active users.

EDUCATION
National Institute of Technology, Kurukshetra
B.Tech in Computer Science and Engineering (2020 - 2024) | CGPA: 8.7/10

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, C++, SQL, HTML5, CSS3
- Frontend: React, Next.js, Tailwind CSS, Redux Toolkit
- Backend: Node.js, Express.js, PostgreSQL, MongoDB, REST APIs
- Tools & DevOps: Git, Docker, GitHub Actions, Postman, Linux

EXPERIENCE
Software Engineering Intern | DevScale Technologies
May 2023 - August 2023 | Bangalore, India
- Architected and deployed a real-time analytics dashboard using React, TypeScript, and Node.js, reducing query response times by 35%.
- Implemented automated REST API tests using Jest and Supertest, achieving 88% code coverage across 14 core endpoints.
- Integrated PostgreSQL indexing on heavy reporting tables, decreasing database load from 82% to 45% during peak traffic.
- Collaborated in a 6-person Agile sprint team using Jira, participating in daily standups and weekly PR code reviews.

PROJECTS
1. CollabSpace — Real-Time Document Collaboration Engine
- Built a concurrent markdown collaboration editor supporting up to 100 simultaneous users using WebSockets and React.
- Designed database schema in PostgreSQL with Prisma ORM, implementing optimistic concurrency control to prevent edit conflicts.
- Dockerized the frontend and backend services and configured a GitHub Actions CI/CD pipeline for automated testing and deployment on AWS EC2.

2. Algomate — Interactive Data Structures Visualizer
- Developed an interactive visualization tool for graph and tree algorithms using React and Canvas API with 15k+ monthly page views.
- Accelerated state updates by 40% using memoized React hooks and Web Workers for complex graph pathfinding calculations.`;

const SAMPLE_JD_FULLSTACK = `Role: Associate Full-Stack Software Engineer
Company: CloudScale Systems
Experience: 0-1 Years (Freshers welcome)
Location: Remote / Bangalore

About the Role:
We are looking for a motivated Associate Full-Stack Engineer with strong fundamentals in modern web technologies and computer science. You will work alongside senior engineers to design and implement user-facing features and scalable backend services.

Must-Have Requirements:
- Strong proficiency in JavaScript, TypeScript, and React.
- Solid understanding of Node.js and building REST APIs.
- Hands-on experience with SQL databases such as PostgreSQL or MySQL.
- Good knowledge of Data Structures & Algorithms and Computer Science Fundamentals.
- Familiarity with version control using Git and basic Linux environments.

Nice-to-Have / Bonus Skills:
- Experience with Docker and containerization.
- Familiarity with Next.js or Tailwind CSS.
- Basic knowledge of automated testing (Jest) or CI/CD pipelines (GitHub Actions).

Responsibilities:
- Build reusable UI components in React and TypeScript.
- Design and integrate RESTful APIs with PostgreSQL database backends.
- Write unit tests and participate in code reviews to maintain high quality standards.`;

const SAMPLE_JD_SENIOR_BACKEND = `Job Title: Senior Backend Distributed Systems Engineer
Company: GlobalFintech Tier-1
Experience Required: 5+ Years
Location: Bangalore / Hybrid

Role Summary:
We are seeking an exceptional Senior Backend Engineer to design and scale core banking and transaction infrastructure capable of handling tens of thousands of requests per second.

Required Qualifications & Must-Haves:
- 5+ years of software engineering experience in Java, Go, or C++.
- Extensive production experience with Spring Boot or modern microservice frameworks.
- Deep expertise in relational databases (PostgreSQL or MySQL) including query tuning, sharding, and index optimization.
- Proven experience with distributed event streaming platforms like Apache Kafka or RabbitMQ.
- Strong hands-on background in System Design, Distributed Systems, caching strategies (Redis), and high availability.
- Production experience containerizing with Docker and deploying to Kubernetes on AWS.

Nice-to-Have Skills:
- Experience with Infrastructure as Code (Terraform).
- Observability and distributed tracing with Prometheus and Grafana.
- Background in fintech, payment gateways, or low-latency systems.`;

interface Props {
  resumeText: string;
  jobText: string;
  resumeFileName: string | null;
  jobFileName: string | null;
  resumePageCount?: number;
  jobPageCount?: number;
  targetTier: TargetTier;
  experienceLevel: ExperienceLevel;
  isScanning: boolean;
  isFileExtracting: boolean;
  stagedStageIndex: number;
  stagedMessages: string[];
  fileError: string | null;
  resumeSource?: WordLimitSource;
  jobSource?: WordLimitSource;
  onResumeTextChange: (text: string) => void;
  onJobTextChange: (text: string) => void;
  onTargetTierChange: (tier: TargetTier) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
  onFileUpload: (file: File, type: 'resume' | 'job') => void;
  onClearResume: () => void;
  onClearJob: () => void;
  onAnalyze: () => void;
  onImportTalentLensResume?: (text: string, fileName: string) => void;
}

export const AtsInputSection: React.FC<Props> = ({
  resumeText,
  jobText,
  resumeFileName,
  jobFileName,
  resumePageCount,
  jobPageCount,
  targetTier,
  experienceLevel,
  isScanning,
  isFileExtracting,
  stagedStageIndex,
  stagedMessages,
  fileError,
  resumeSource,
  jobSource,
  onResumeTextChange,
  onJobTextChange,
  onTargetTierChange,
  onExperienceLevelChange,
  onFileUpload,
  onClearResume,
  onClearJob,
  onAnalyze,
  onImportTalentLensResume,
}) => {
  const tlResumeText = useTalentLensStore((state) => state.resumeText);
  const tlResumeFileName = useTalentLensStore((state) => state.resumeFileName);
  const talentLensResume = useMemo(() => {
    return tlResumeText ? { text: tlResumeText, fileName: tlResumeFileName } : null;
  }, [tlResumeText, tlResumeFileName]);

  const effectiveResumeSource =
    resumeSource ||
    (resumeFileName?.toLowerCase().includes('talentlens') ||
    resumeFileName?.toLowerCase().includes('resume-final')
      ? 'talentlens'
      : undefined);

  const validation = validateAtsInputs(resumeText, jobText, {
    resumeSource: effectiveResumeSource,
    jobSource,
    isFileExtracting,
    isScanning,
  });

  const {
    canAnalyze,
    resumeOk,
    jdOk,
    resumeWords,
    jdWords,
    resumeMin,
    jdMin,
    resumeMax,
    jdMax,
    disabledReason,
  } = validation;

  const handleLoadSampleResume = () => {
    if (resumeFileName) {
      onClearResume();
    }
    onResumeTextChange(SAMPLE_RESUME_TEXT);
  };

  const handleLoadSampleJd = (presetKey: string) => {
    if (jobFileName) {
      onClearJob();
    }
    if (presetKey === 'senior-backend') {
      onJobTextChange(SAMPLE_JD_SENIOR_BACKEND);
      onExperienceLevelChange('3-6 yrs');
      onTargetTierChange('Top Product');
    } else {
      onJobTextChange(SAMPLE_JD_FULLSTACK);
      onExperienceLevelChange('Fresher');
      onTargetTierChange('Top Product');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {fileError && (
        <div className="max-w-4xl mx-auto p-4 rounded-lg bg-near-black border border-danger/60 flex items-start gap-3 text-danger text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-danger mt-0.5 stroke-[1.5px]" />
          <div className="flex-1">
            <span className="font-bold uppercase tracking-wider text-xs">File Extraction Notice: </span>
            <span>{fileError}</span>
          </div>
        </div>
      )}

      {/* Target Tier & Experience Level Segmented Selectors */}
      <SegmentedSelectors
        targetTier={targetTier}
        experienceLevel={experienceLevel}
        onTargetTierChange={onTargetTierChange}
        onExperienceLevelChange={onExperienceLevelChange}
      />

      {/* Two Main Input Panels: Resume & Job Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <FileDropzone
          type="resume"
          title="Your Resume"
          icon={<FileText className="w-5 h-5 stroke-[1.5px]" />}
          text={resumeText}
          fileName={resumeFileName}
          pageCount={resumePageCount}
          wordCount={resumeWords}
          isReady={resumeOk}
          minWords={resumeMin}
          maxWords={resumeMax}
          placeholder="Paste your complete resume here, or switch to Upload File to import your PDF / DOCX..."
          onFileUpload={(file) => onFileUpload(file, 'resume')}
          onClear={onClearResume}
          onTextChange={onResumeTextChange}
          talentLensResume={talentLensResume}
          onImportTalentLens={() => {
            if (talentLensResume) {
              if (onImportTalentLensResume) {
                onImportTalentLensResume(talentLensResume.text, talentLensResume.fileName);
              } else {
                onResumeTextChange(talentLensResume.text);
              }
            }
          }}
          onLoadSample={handleLoadSampleResume}
        />

        <FileDropzone
          type="job"
          title="Target Job Description"
          icon={<Search className="w-5 h-5 stroke-[1.5px]" />}
          text={jobText}
          fileName={jobFileName}
          pageCount={jobPageCount}
          wordCount={jdWords}
          isReady={jdOk}
          minWords={jdMin}
          maxWords={jdMax}
          placeholder="Paste the target job description or requirements here, or pick a sample preset above..."
          onFileUpload={(file) => onFileUpload(file, 'job')}
          onClear={onClearJob}
          onTextChange={onJobTextChange}
          onLoadSample={handleLoadSampleJd}
        />
      </div>

      {/* Main Action CTA Section / Live Scanning State */}
      <div className="flex flex-col items-center justify-center pt-4 pb-6 space-y-4 max-w-xl mx-auto">
        {isScanning ? (
          <div className="p-6 bg-near-black rounded-lg border border-charcoal w-full text-center space-y-4">
            <div className="flex items-center justify-center gap-2.5 text-white font-bold text-base uppercase tracking-tight">
              <ScanLine className="w-5 h-5 animate-spin text-volt stroke-[1.5px]" />
              <span>Running 6-Layer Deterministic Audit</span>
            </div>
            
            {/* Thin 2px Neon Progress Bar */}
            <div className="w-full bg-black rounded-full h-[2px] overflow-hidden border border-charcoal">
              <div
                className="bg-volt h-full transition-all duration-300"
                style={{
                  width: `${((stagedStageIndex + 1) / stagedMessages.length) * 100}%`,
                }}
              />
            </div>
            
            <p className="text-xs text-silver font-mono tracking-tight font-medium">
              {stagedMessages[stagedStageIndex] || 'Simulating enterprise recruiter filters...'}
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className={`inline-flex items-center justify-center gap-2.5 px-8 h-12 rounded text-[14px] font-bold uppercase tracking-[1.4px] transition-colors duration-150 cursor-pointer ${
                !canAnalyze
                  ? 'bg-near-black border border-charcoal text-silver/40 cursor-not-allowed shadow-none'
                  : 'bg-volt text-[#151515] border border-volt hover:bg-[#1d1d1d] hover:text-white active:text-pale-yellow shadow-level-1'
              }`}
            >
              <Sparkles className={`w-4 h-4 stroke-[1.5px] ${canAnalyze ? 'text-[#151515] hover:text-volt' : 'text-silver/40'}`} />
              <span>Roast &amp; Analyze Match</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
            </button>

            {!canAnalyze && disabledReason && (
              <div
                aria-live="polite"
                className="text-xs text-pale-yellow text-center font-semibold bg-black px-4 py-2 rounded border border-charcoal flex items-center gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5 text-pale-yellow shrink-0 stroke-[1.5px]" />
                <span>{disabledReason}</span>
              </div>
            )}

            {canAnalyze && (
              <div className="flex items-center gap-2 text-xs text-silver font-medium text-center">
                <ShieldCheck className="w-4 h-4 text-volt stroke-[1.5px]" />
                <span>Deterministic invariant engine · Verbatim citations · Never invents facts</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
