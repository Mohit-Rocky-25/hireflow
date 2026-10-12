// ============================================================
// HireFlow ATS Resume Roaster — Input Screen Component (Stage 1)
// Top Designer Grade: Integrated Sample Loaders, Dynamic CTAs & Micro-interactions
// ============================================================

import React, { useMemo } from 'react';
import { FileText, Search, ScanLine, AlertCircle, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { SegmentedSelectors, TargetTier, ExperienceLevel } from './SegmentedSelectors';
import { FileDropzone } from './FileDropzone';
import { useTalentLensStore } from '../../../pages/demo/useTalentLensStore';
import { validateAtsInputs, WordLimitSource } from '../../../config/limits';

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
  // Access resume state from TalentLens if candidate previously used TalentLens
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

  // Single source of truth validation
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
    onResumeTextChange(SAMPLE_RESUME_TEXT);
  };

  const handleLoadSampleJd = (presetKey: string) => {
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
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">File Extraction Notice: </span>
            {fileError}
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
        {/* Resume Input Dropzone & Text Area */}
        <FileDropzone
          type="resume"
          title="Your Resume"
          icon={<FileText className="w-5 h-5 text-sky-600 shrink-0 stroke-[2px]" />}
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

        {/* Target Job Description Dropzone & Text Area */}
        <FileDropzone
          type="job"
          title="Target Job Description"
          icon={<Search className="w-5 h-5 text-indigo-600 shrink-0 stroke-[2px]" />}
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
          <div className="p-7 bg-white rounded-3xl border border-slate-200 shadow-lg w-full text-center space-y-4 animate-pulse">
            <div className="flex items-center justify-center gap-2.5 text-slate-950 font-black text-base">
              <ScanLine className="w-5 h-5 animate-spin text-sky-600" />
              <span>Running 6-Layer Deterministic Audit</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((stagedStageIndex + 1) / stagedMessages.length) * 100}%`,
                }}
              />
            </div>
            
            <p className="text-xs text-slate-600 font-mono tracking-tight font-medium">
              {stagedMessages[stagedStageIndex] || 'Simulating enterprise recruiter filters...'}
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className={`group relative inline-flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black text-[16px] sm:text-[17px] transition-all duration-200 ${
                !canAnalyze
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.35)] hover:shadow-[0_16px_35px_-5px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] cursor-pointer'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${canAnalyze ? 'text-amber-300 group-hover:rotate-12 transition-transform' : 'text-slate-400'}`} />
              <span>Roast &amp; Analyze Match</span>
              <ArrowRight className={`w-5 h-5 ${canAnalyze ? 'group-hover:translate-x-1 transition-transform' : 'text-slate-400'}`} />
            </button>

            {!canAnalyze && disabledReason && (
              <div
                aria-live="polite"
                className="text-xs text-amber-800 text-center font-bold bg-amber-50 px-4 py-2 rounded-xl border border-amber-200/80 shadow-2xs flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{disabledReason}</span>
              </div>
            )}

            {canAnalyze && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Deterministic invariant engine · Verbatim citations · Zero hallucinations</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
