// ============================================================
// HIREFLOW TAILOR STORE — ZUSTAND REACTIVE STATE MANAGEMENT
// Powers 7-stage guided pipeline, draft history, and privacy purge
// ============================================================

import { create } from 'zustand';
import {
  TailoringProject,
  CandidateProfile,
  JobDescription,
  EvidenceMapping,
  TailoringPlan,
  TailoredResume,
  TailoredSection,
  ResumeTemplateId,
  LayoutSettings
} from '../types';
import { parseResumeRawText } from '../parser/resumeParser';
import { parseJobDescription } from '../parser/jobParser';
import { matchCandidateToJob } from '../matching/evidenceMatcher';
import { planTailoringStrategy } from '../engine/strategyPlanner';
import { tailorBulletPoint } from '../engine/bulletTailor';
import { verifyFactualIntegrity } from '../engine/truthGate';
import { DEMO_FRESHER_RESUME, DEMO_SOFTWARE_ENGINEER_JD, DEMO_SECURITY_RESUME, DEMO_SECURITY_JD } from './fixtures';

export type PipelineStage = 'resume' | 'job' | 'requirements' | 'evidence' | 'strategy' | 'editor' | 'export';
export type AppViewTab = 'pipeline' | 'dashboard' | 'knowledge' | 'privacy';

interface TailorState {
  currentStage: PipelineStage;
  activeTab: AppViewTab;
  activeProject: TailoringProject;
  savedProjects: TailoringProject[];
  isAnalyzing: boolean;

  // Actions
  setStage: (stage: PipelineStage) => void;
  setActiveTab: (tab: AppViewTab) => void;
  loadPresetFixture: (preset: 'fresher' | 'security') => void;
  uploadResumeText: (rawText: string, fileName?: string) => void;
  setJobDescriptionText: (rawText: string) => void;
  runAnalysisAndMatching: () => void;
  generateTailoredResumeDraft: () => void;
  updateBulletText: (sectionId: string, entryId: string, bulletId: string, text: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setTemplate: (template: ResumeTemplateId) => void;
  setLayoutSetting: <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => void;
  confirmRequirementClaim: (requirementId: string) => void;
  saveProjectSnapshot: (summary?: string) => void;
  wipeAllData: () => void;
}

const STORAGE_KEY = 'hireflow_tailor_state_v2';

function createDefaultProject(): TailoringProject {
  const initialCandidate = parseResumeRawText(DEMO_FRESHER_RESUME, 'Jeswanth_Kumar_Resume.pdf');
  const initialJob = parseJobDescription(DEMO_SOFTWARE_ENGINEER_JD);
  const initialEvidence = matchCandidateToJob(initialCandidate, initialJob);
  const initialPlan = planTailoringStrategy(initialCandidate, initialJob, initialEvidence);

  const initialSections = buildInitialTailoredSections(initialCandidate);
  const initialResume: TailoredResume = {
    id: `res_${Date.now()}`,
    projectId: 'proj_default',
    candidateId: initialCandidate.id,
    jobId: initialJob.id,
    title: `${initialCandidate.fullName} - Tailored for ${initialJob.company}`,
    version: 1,
    sections: initialSections,
    layoutSettings: {
      template: 'modern',
      paperSize: 'letter',
      fontSize: 'standard',
      margins: 'standard',
      lineSpacing: 'standard',
      accentColor: '#1E3A8A'
    },
    truthGateResult: {
      passed: true,
      score: 100,
      unsupportedClaimsCount: 0,
      preservedMetricsCount: 4,
      inventedMetricsDetected: [],
      blockingIssues: []
    },
    updatedAt: new Date().toISOString()
  };

  return {
    id: 'proj_default',
    name: `${initialCandidate.fullName} -> ${initialJob.title}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStage: 'resume',
    candidate: initialCandidate,
    job: initialJob,
    evidenceMapping: initialEvidence,
    tailoringPlan: initialPlan,
    tailoredResume: initialResume,
    versionHistory: [
      {
        version: 1,
        savedAt: new Date().toISOString(),
        summary: 'Initial parsed candidate baseline',
        resumeSnapshot: initialResume
      }
    ]
  };
}

function buildInitialTailoredSections(candidate: CandidateProfile): TailoredSection[] {
  const sections: TailoredSection[] = [];

  // Summary
  if (candidate.summary) {
    sections.push({
      id: 'sec_summary',
      type: 'summary',
      title: 'Professional Summary',
      visible: true,
      content: { summaryText: candidate.summary }
    });
  }

  // Skills
  const skillsByCategory: Record<string, string[]> = {};
  if (candidate.skills.languages?.length) skillsByCategory['Languages'] = candidate.skills.languages;
  if (candidate.skills.frameworks?.length) skillsByCategory['Frameworks & Libraries'] = candidate.skills.frameworks;
  if (candidate.skills.cloudAndDevOps?.length) skillsByCategory['Cloud & DevOps'] = candidate.skills.cloudAndDevOps;
  if (candidate.skills.databases?.length) skillsByCategory['Databases'] = candidate.skills.databases;
  if (candidate.skills.developerTools?.length) skillsByCategory['Developer Tools'] = candidate.skills.developerTools;

  sections.push({
    id: 'sec_skills',
    type: 'skills',
    title: 'Technical Skills',
    visible: true,
    content: { skillsByCategory }
  });

  // Experience
  if (candidate.experience?.length) {
    sections.push({
      id: 'sec_experience',
      type: 'experience',
      title: 'Work Experience',
      visible: true,
      content: {
        entries: candidate.experience.map(exp => ({
          id: exp.id,
          primaryTitle: exp.position,
          secondaryTitle: exp.company,
          location: exp.location,
          dateRange: exp.endDate,
          bullets: exp.bullets.map((b, bIdx) => ({
            id: `b_${exp.id}_${bIdx}`,
            text: b,
            originalText: b,
            isEditedByUser: false
          }))
        }))
      }
    });
  }

  // Projects
  if (candidate.projects?.length) {
    sections.push({
      id: 'sec_projects',
      type: 'projects',
      title: 'Technical Projects',
      visible: true,
      content: {
        entries: candidate.projects.map(p => ({
          id: p.id,
          primaryTitle: p.title,
          secondaryTitle: p.technologiesUsed?.join(', ') || '',
          bullets: p.bullets.map((b, bIdx) => ({
            id: `b_${p.id}_${bIdx}`,
            text: b,
            originalText: b,
            isEditedByUser: false
          }))
        }))
      }
    });
  }

  // Education
  if (candidate.education?.length) {
    sections.push({
      id: 'sec_education',
      type: 'education',
      title: 'Education',
      visible: true,
      content: {
        entries: candidate.education.map(edu => ({
          id: edu.id,
          primaryTitle: edu.degree,
          secondaryTitle: edu.institution,
          dateRange: edu.endDate,
          location: edu.location,
          bullets: edu.scoreValue ? [{ id: `b_score_${edu.id}`, text: `${edu.scoreType || 'Grade'}: ${edu.scoreValue}` }] : []
        }))
      }
    });
  }

  return sections;
}

export const useTailorStore = create<TailorState>((set, get) => ({
  currentStage: 'resume',
  activeTab: 'pipeline',
  activeProject: createDefaultProject(),
  savedProjects: [],
  isAnalyzing: false,

  setStage: (stage) => {
    set((state) => ({
      currentStage: stage,
      activeProject: {
        ...state.activeProject,
        currentStage: stage,
        updatedAt: new Date().toISOString()
      }
    }));
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadPresetFixture: (preset) => {
    const isSecurity = preset === 'security';
    const resumeText = isSecurity ? DEMO_SECURITY_RESUME : DEMO_FRESHER_RESUME;
    const jdText = isSecurity ? DEMO_SECURITY_JD : DEMO_SOFTWARE_ENGINEER_JD;
    const fileName = isSecurity ? 'Alex_Morgan_CISSP_Resume.pdf' : 'Jeswanth_Kumar_Resume.pdf';

    const candidate = parseResumeRawText(resumeText, fileName);
    const job = parseJobDescription(jdText);
    const evidence = matchCandidateToJob(candidate, job);
    const plan = planTailoringStrategy(candidate, job, evidence);
    const sections = buildInitialTailoredSections(candidate);

    const resume: TailoredResume = {
      id: `res_${Date.now()}`,
      projectId: `proj_${preset}`,
      candidateId: candidate.id,
      jobId: job.id,
      title: `${candidate.fullName} - Tailored for ${job.company}`,
      version: 1,
      sections,
      layoutSettings: {
        template: isSecurity ? 'executive' : 'compact',
        paperSize: 'letter',
        fontSize: 'standard',
        margins: 'standard',
        lineSpacing: 'standard',
        accentColor: isSecurity ? '#0F172A' : '#1E3A8A'
      },
      truthGateResult: {
        passed: true,
        score: 100,
        unsupportedClaimsCount: 0,
        preservedMetricsCount: 5,
        inventedMetricsDetected: [],
        blockingIssues: []
      },
      updatedAt: new Date().toISOString()
    };

    set({
      currentStage: 'resume',
      activeProject: {
        id: `proj_${preset}`,
        name: `${candidate.fullName} -> ${job.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentStage: 'resume',
        candidate,
        job,
        evidenceMapping: evidence,
        tailoringPlan: plan,
        tailoredResume: resume,
        versionHistory: [
          {
            version: 1,
            savedAt: new Date().toISOString(),
            summary: `Loaded ${preset} demo profile`,
            resumeSnapshot: resume
          }
        ]
      }
    });
  },

  uploadResumeText: (rawText, fileName) => {
    const candidate = parseResumeRawText(rawText, fileName);
    const sections = buildInitialTailoredSections(candidate);

    set((state) => {
      const job = state.activeProject.job;
      const evidence = matchCandidateToJob(candidate, job);
      const plan = planTailoringStrategy(candidate, job, evidence);

      const resume: TailoredResume = {
        id: `res_${Date.now()}`,
        projectId: state.activeProject.id,
        candidateId: candidate.id,
        jobId: job.id,
        title: `${candidate.fullName} - Tailored for ${job.company}`,
        version: (state.activeProject.tailoredResume?.version || 0) + 1,
        sections,
        layoutSettings: state.activeProject.tailoredResume?.layoutSettings || {
          template: 'modern',
          paperSize: 'letter',
          fontSize: 'standard',
          margins: 'standard',
          lineSpacing: 'standard',
          accentColor: '#1E3A8A'
        },
        truthGateResult: {
          passed: true,
          score: 100,
          unsupportedClaimsCount: 0,
          preservedMetricsCount: 0,
          inventedMetricsDetected: [],
          blockingIssues: []
        },
        updatedAt: new Date().toISOString()
      };

      return {
        activeProject: {
          ...state.activeProject,
          candidate,
          evidenceMapping: evidence,
          tailoringPlan: plan,
          tailoredResume: resume,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  setJobDescriptionText: (rawText) => {
    const job = parseJobDescription(rawText);
    set((state) => {
      const candidate = state.activeProject.candidate;
      const evidence = matchCandidateToJob(candidate, job);
      const plan = planTailoringStrategy(candidate, job, evidence);

      return {
        activeProject: {
          ...state.activeProject,
          job,
          evidenceMapping: evidence,
          tailoringPlan: plan,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  runAnalysisAndMatching: () => {
    set({ isAnalyzing: true });
    const { candidate, job } = get().activeProject;
    const evidence = matchCandidateToJob(candidate, job);
    const plan = planTailoringStrategy(candidate, job, evidence);

    set((state) => ({
      isAnalyzing: false,
      activeProject: {
        ...state.activeProject,
        evidenceMapping: evidence,
        tailoringPlan: plan,
        updatedAt: new Date().toISOString()
      }
    }));
  },

  generateTailoredResumeDraft: () => {
    const { activeProject } = get();
    const candidate = activeProject.candidate;
    const plan = activeProject.tailoringPlan || planTailoringStrategy(candidate, activeProject.job, activeProject.evidenceMapping!);
    const targetKeywords = plan.skillsToEmphasize;

    // Tailor bullets in experience and projects
    const tailoredSections = buildInitialTailoredSections(candidate).map((section) => {
      if (section.content.entries) {
        return {
          ...section,
          content: {
            ...section.content,
            entries: section.content.entries.map((entry) => ({
              ...entry,
              bullets: entry.bullets?.map((b) => {
                const tailored = tailorBulletPoint(b.text, b.id, targetKeywords);
                return {
                  ...b,
                  text: tailored.tailoredText,
                  originalText: b.text,
                  factId: tailored.factId
                };
              })
            }))
          }
        };
      }
      return section;
    });

    const updatedResume: TailoredResume = {
      ...(activeProject.tailoredResume || {
        id: `res_${Date.now()}`,
        projectId: activeProject.id,
        candidateId: candidate.id,
        jobId: activeProject.job.id,
        title: `${candidate.fullName} - Tailored`,
        version: 1,
        layoutSettings: {
          template: 'modern',
          paperSize: 'letter',
          fontSize: 'standard',
          margins: 'standard',
          lineSpacing: 'standard',
          accentColor: '#1E3A8A'
        },
        truthGateResult: {
          passed: true,
          score: 100,
          unsupportedClaimsCount: 0,
          preservedMetricsCount: 0,
          inventedMetricsDetected: [],
          blockingIssues: []
        },
        updatedAt: new Date().toISOString()
      }),
      sections: tailoredSections,
      version: (activeProject.tailoredResume?.version || 0) + 1,
      updatedAt: new Date().toISOString()
    };

    // Run truth gate
    const truthGateResult = verifyFactualIntegrity(updatedResume, candidate);
    updatedResume.truthGateResult = truthGateResult;

    set((state) => ({
      activeProject: {
        ...state.activeProject,
        tailoredResume: updatedResume,
        updatedAt: new Date().toISOString()
      }
    }));
  },

  updateBulletText: (sectionId, entryId, bulletId, newText) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;

      const candidate = state.activeProject.candidate;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.id !== sectionId || !sec.content.entries) return sec;

        return {
          ...sec,
          content: {
            ...sec.content,
            entries: sec.content.entries.map((entry) => {
              if (entry.id !== entryId || !entry.bullets) return entry;

              return {
                ...entry,
                bullets: entry.bullets.map((b) => {
                  if (b.id !== bulletId) return b;
                  return {
                    ...b,
                    text: newText,
                    isEditedByUser: true
                  };
                })
              };
            })
          }
        };
      });

      const updatedResume: TailoredResume = {
        ...state.activeProject.tailoredResume,
        sections,
        updatedAt: new Date().toISOString()
      };

      updatedResume.truthGateResult = verifyFactualIntegrity(updatedResume, candidate);

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: updatedResume,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  toggleSectionVisibility: (sectionId) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;

      const sections = state.activeProject.tailoredResume.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      );

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            sections,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  },

  reorderSections: (fromIndex, toIndex) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;

      const sections = [...state.activeProject.tailoredResume.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            sections,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  },

  setTemplate: (template) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            layoutSettings: {
              ...state.activeProject.tailoredResume.layoutSettings,
              template
            },
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  },

  setLayoutSetting: (key, value) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            layoutSettings: {
              ...state.activeProject.tailoredResume.layoutSettings,
              [key]: value
            },
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  },

  confirmRequirementClaim: (requirementId) => {
    set((state) => {
      if (!state.activeProject.evidenceMapping) return state;

      const assessments = state.activeProject.evidenceMapping.assessments.map((a) =>
        a.requirementId === requirementId ? { ...a, candidateStatus: 'CONFIRMED' as const } : a
      );

      return {
        activeProject: {
          ...state.activeProject,
          evidenceMapping: {
            ...state.activeProject.evidenceMapping,
            assessments
          }
        }
      };
    });
  },

  saveProjectSnapshot: (summary = 'User saved checkpoint') => {
    set((state) => {
      const currentResume = state.activeProject.tailoredResume;
      if (!currentResume) return state;

      const nextVersion = currentResume.version + 1;
      const newSnapshot = {
        version: nextVersion,
        savedAt: new Date().toISOString(),
        summary,
        resumeSnapshot: { ...currentResume, version: nextVersion }
      };

      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: newSnapshot.resumeSnapshot,
          versionHistory: [newSnapshot, ...state.activeProject.versionHistory]
        }
      };
    });
  },

  wipeAllData: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore storage errors
      }
    }
    const freshProject = createDefaultProject();
    set({
      currentStage: 'resume',
      activeTab: 'pipeline',
      activeProject: freshProject,
      savedProjects: [],
      isAnalyzing: false
    });
  }
}));
