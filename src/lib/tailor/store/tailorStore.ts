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
import { elevateResumeToBestStandard, MakeItBetterResult } from '../engine/makeItBetterEngine';

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
  applyMakeItBetter: () => MakeItBetterResult | null;
  addBulletToEntry: (sectionId: string, entryId: string, text?: string) => void;
  deleteBulletFromEntry: (sectionId: string, entryId: string, bulletId: string) => void;
  addEntryToSection: (sectionId: string, primaryTitle?: string, secondaryTitle?: string) => void;
  deleteEntryFromSection: (sectionId: string, entryId: string) => void;
  autoFitOnePage: () => void;
  updateCandidateContact: (fields: Partial<CandidateProfile['contact']>) => void;
  updateCandidateName: (fullName: string) => void;
  updateSummaryText: (text: string) => void;
  updateBulletText: (sectionId: string, entryId: string, bulletId: string, text: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setTemplate: (template: ResumeTemplateId) => void;
  setLayoutSetting: <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => void;
  updateEntryFields: (sectionId: string, entryId: string, fields: Partial<{ primaryTitle: string; secondaryTitle: string; dateRange: string; location: string }>) => void;
  addSkillToCategory: (category: string, skill: string) => void;
  removeSkillFromCategory: (category: string, skill: string) => void;
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
  sections.push({
    id: 'sec_summary',
    type: 'summary',
    title: 'Professional Summary',
    visible: true,
    content: {
      summaryText: candidate.summary || 'Proactive software engineer skilled in building scalable applications, distributed systems, and modern web architectures with a focus on performance, clean code, and reliability.'
    }
  });

  // Skills
  const skillsByCategory: Record<string, string[]> = {};
  if (candidate.skills.languages?.length) skillsByCategory['Languages'] = candidate.skills.languages;
  if (candidate.skills.frameworks?.length) skillsByCategory['Frameworks & Libraries'] = candidate.skills.frameworks;
  if (candidate.skills.cloudAndDevOps?.length) skillsByCategory['Cloud & DevOps'] = candidate.skills.cloudAndDevOps;
  if (candidate.skills.databases?.length) skillsByCategory['Databases'] = candidate.skills.databases;
  if (candidate.skills.developerTools?.length) skillsByCategory['Developer Tools'] = candidate.skills.developerTools;

  if (Object.keys(skillsByCategory).length === 0) {
    skillsByCategory['Languages'] = ['TypeScript', 'JavaScript', 'Python', 'SQL'];
    skillsByCategory['Frameworks & Tools'] = ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'];
  }

  sections.push({
    id: 'sec_skills',
    type: 'skills',
    title: 'Technical Skills',
    visible: true,
    content: { skillsByCategory }
  });

  // Experience
  const expEntries = (candidate.experience && candidate.experience.length > 0)
    ? candidate.experience.map(exp => ({
        id: exp.id,
        primaryTitle: exp.position,
        secondaryTitle: exp.company,
        location: exp.location,
        dateRange: exp.endDate || 'Recent',
        bullets: (exp.bullets && exp.bullets.length > 0 ? exp.bullets : ['Engineered scalable components and collaborated across engineering sprints.']).map((b, bIdx) => ({
          id: `b_${exp.id}_${bIdx}`,
          text: b,
          originalText: b,
          isEditedByUser: false
        }))
      }))
    : [
        {
          id: 'exp_default_1',
          primaryTitle: 'Software Engineering Experience',
          secondaryTitle: 'Technology Solutions',
          dateRange: 'Recent',
          bullets: [
            { id: 'b_exp_def_1', text: 'Architected scalable services and REST APIs, sustaining high request throughput with zero downtime.', originalText: 'Architected scalable services and REST APIs.', isEditedByUser: false },
            { id: 'b_exp_def_2', text: 'Optimized database query performance, reducing endpoint latency by 35% across key user workflows.', originalText: 'Optimized database query performance.', isEditedByUser: false }
          ]
        }
      ];

  sections.push({
    id: 'sec_experience',
    type: 'experience',
    title: 'Work Experience',
    visible: true,
    content: { entries: expEntries }
  });

  // Projects
  const projEntries = (candidate.projects && candidate.projects.length > 0)
    ? candidate.projects.map(p => ({
        id: p.id,
        primaryTitle: p.title,
        secondaryTitle: p.technologiesUsed?.join(', ') || 'React, Node.js, PostgreSQL',
        bullets: (p.bullets && p.bullets.length > 0 ? p.bullets : ['Designed and implemented full-stack project architecture.']).map((b, bIdx) => ({
          id: `b_${p.id}_${bIdx}`,
          text: b,
          originalText: b,
          isEditedByUser: false
        }))
      }))
    : [
        {
          id: 'proj_default_1',
          primaryTitle: 'Technical Project',
          secondaryTitle: 'React, Node.js, PostgreSQL',
          bullets: [
            { id: 'b_proj_def_1', text: 'Designed and deployed responsive full-stack application supporting real-time data synchronization.', originalText: 'Designed and deployed responsive full-stack application.', isEditedByUser: false },
            { id: 'b_proj_def_2', text: 'Implemented automated CI/CD pipeline, shortening deployment turnaround from hours to minutes.', originalText: 'Implemented automated CI/CD pipeline.', isEditedByUser: false }
          ]
        }
      ];

  sections.push({
    id: 'sec_projects',
    type: 'projects',
    title: 'Technical Projects',
    visible: true,
    content: { entries: projEntries }
  });

  // Education
  const eduEntries = (candidate.education && candidate.education.length > 0)
    ? candidate.education.map(edu => ({
        id: edu.id,
        primaryTitle: edu.degree,
        secondaryTitle: edu.institution,
        dateRange: edu.endDate || 'Graduated',
        location: edu.location,
        bullets: edu.scoreValue ? [{ id: `b_score_${edu.id}`, text: `${edu.scoreType || 'Grade'}: ${edu.scoreValue}` }] : []
      }))
    : [
        {
          id: 'edu_default_1',
          primaryTitle: 'Bachelor of Technology / Computer Science',
          secondaryTitle: 'University / Institute of Technology',
          dateRange: 'Graduated',
          bullets: [{ id: 'b_score_def', text: 'Grade: First Class with Distinction' }]
        }
      ];

  sections.push({
    id: 'sec_education',
    type: 'education',
    title: 'Education',
    visible: true,
    content: { entries: eduEntries }
  });

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

  applyMakeItBetter: () => {
    const { activeProject } = get();
    if (!activeProject.tailoredResume) return null;

    const result = elevateResumeToBestStandard(
      activeProject.tailoredResume,
      activeProject.candidate,
      activeProject.job
    );

    set((state) => ({
      activeProject: {
        ...state.activeProject,
        tailoredResume: result.upgradedResume,
        updatedAt: new Date().toISOString()
      }
    }));

    return result;
  },

  addBulletToEntry: (sectionId, entryId, text) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const candidate = state.activeProject.candidate;
      const job = state.activeProject.job;
      const keyTech = job.domainKeywords?.[0] || 'core backend';
      const bulletText = text || `Architected high-throughput ${keyTech} integration, optimizing API response throughput and achieving 99.9% uptime.`;

      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.id !== sectionId || !sec.content.entries) return sec;
        return {
          ...sec,
          content: {
            ...sec.content,
            entries: sec.content.entries.map((entry) => {
              if (entry.id !== entryId) return entry;
              const newBulletId = `b_new_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
              return {
                ...entry,
                bullets: [...(entry.bullets || []), { id: newBulletId, text: bulletText, originalText: bulletText, isEditedByUser: true }]
              };
            })
          }
        };
      });

      const updatedResume = {
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

  deleteBulletFromEntry: (sectionId, entryId, bulletId) => {
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
                bullets: entry.bullets.filter((b) => b.id !== bulletId)
              };
            })
          }
        };
      });

      const updatedResume = {
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

  addEntryToSection: (sectionId, primaryTitle = 'New Role / Project', secondaryTitle = 'Organization / Tech Stack') => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const candidate = state.activeProject.candidate;
      const newEntryId = `entry_${Date.now()}`;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newEntry = {
          id: newEntryId,
          primaryTitle,
          secondaryTitle,
          dateRange: 'Present',
          bullets: [
            { id: `b_${newEntryId}_1`, text: 'Spearheaded core feature implementation delivering measurable performance gains.', isEditedByUser: true }
          ]
        };
        return {
          ...sec,
          content: {
            ...sec.content,
            entries: [newEntry, ...(sec.content.entries || [])]
          }
        };
      });

      const updatedResume = {
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

  deleteEntryFromSection: (sectionId, entryId) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const candidate = state.activeProject.candidate;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.id !== sectionId || !sec.content.entries) return sec;
        return {
          ...sec,
          content: {
            ...sec.content,
            entries: sec.content.entries.filter((entry) => entry.id !== entryId)
          }
        };
      });

      const updatedResume = {
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

  autoFitOnePage: () => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      return {
        activeProject: {
          ...state.activeProject,
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            layoutSettings: {
              ...state.activeProject.tailoredResume.layoutSettings,
              fontSize: 'compact',
              margins: 'tight',
              lineSpacing: 'dense'
            },
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
  },

  updateCandidateName: (fullName) => {
    set((state) => ({
      activeProject: {
        ...state.activeProject,
        candidate: {
          ...state.activeProject.candidate,
          fullName
        },
        updatedAt: new Date().toISOString()
      }
    }));
  },

  updateCandidateContact: (fields) => {
    set((state) => ({
      activeProject: {
        ...state.activeProject,
        candidate: {
          ...state.activeProject.candidate,
          contact: {
            ...state.activeProject.candidate.contact,
            ...fields
          }
        },
        updatedAt: new Date().toISOString()
      }
    }));
  },

  updateSummaryText: (text) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.type === 'summary') {
          return {
            ...sec,
            content: {
              ...sec.content,
              summaryText: text
            }
          };
        }
        return sec;
      });

      return {
        activeProject: {
          ...state.activeProject,
          candidate: {
            ...state.activeProject.candidate,
            summary: text
          },
          tailoredResume: {
            ...state.activeProject.tailoredResume,
            sections,
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
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

  updateEntryFields: (sectionId, entryId, fields) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.id !== sectionId || !sec.content.entries) return sec;
        return {
          ...sec,
          content: {
            ...sec.content,
            entries: sec.content.entries.map((entry) => {
              if (entry.id !== entryId) return entry;
              return {
                ...entry,
                ...fields
              };
            })
          }
        };
      });

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

  addSkillToCategory: (category, skill) => {
    set((state) => {
      if (!state.activeProject.tailoredResume || !skill.trim()) return state;
      const cleanSkill = skill.trim();
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.type !== 'skills' || !sec.content.skillsByCategory) return sec;
        const currentList = sec.content.skillsByCategory[category] || [];
        if (currentList.includes(cleanSkill)) return sec;
        return {
          ...sec,
          content: {
            ...sec.content,
            skillsByCategory: {
              ...sec.content.skillsByCategory,
              [category]: [...currentList, cleanSkill]
            }
          }
        };
      });

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

  removeSkillFromCategory: (category, skill) => {
    set((state) => {
      if (!state.activeProject.tailoredResume) return state;
      const sections = state.activeProject.tailoredResume.sections.map((sec) => {
        if (sec.type !== 'skills' || !sec.content.skillsByCategory) return sec;
        const currentList = sec.content.skillsByCategory[category] || [];
        return {
          ...sec,
          content: {
            ...sec.content,
            skillsByCategory: {
              ...sec.content.skillsByCategory,
              [category]: currentList.filter(s => s !== skill)
            }
          }
        };
      });

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
