// HireFlow Demo Seed Data v3 - Users, Companies, CompanyMembers
// TODAY = 04 Oct 2026
import type { User, Company, CompanyMember, JobRequirement, ScreeningConfig, Job, CandidateProfile, Application, CandidateMatch, Interview, Notification, InterviewFeedback } from "../types";

export const DEMO_IDS = {
  companyA: "comp-alpha-tech", companyB: "comp-beta-solutions", companyC: "comp-gamma-systems",
  bhrA: "user-bhr-alpha", hrA: "user-hr-alpha", hrA2: "user-hr-alpha2",
  interviewerA1: "user-int-alpha1", interviewerA2: "user-int-alpha2", interviewerA3: "user-int-alpha3",
  interviewerA4: "user-int-alpha4", interviewerA5: "user-int-alpha5", interviewerA6: "user-int-alpha6",
  bhrB: "user-bhr-beta", hrB: "user-hr-beta", interviewerB1: "user-int-beta1",
  bhrC: "user-bhr-gamma", interviewerC1: "user-int-gamma1",
  admin: "user-admin",
  candidate1: "user-cand-1", candidate2: "user-cand-2", candidate3: "user-cand-3",
  candidate4: "user-cand-4", candidate5: "user-cand-5", candidate6: "user-cand-6",
  candidate7: "user-cand-7", candidate8: "user-cand-8", candidate9: "user-cand-9",
  candidate10: "user-cand-10", candidate11: "user-cand-11", candidate12: "user-cand-12",
  candidate13: "user-cand-13", candidate14: "user-cand-14", candidate15: "user-cand-15",
  candidate16: "user-cand-16", candidate17: "user-cand-17", candidate18: "user-cand-18",
  candidate19: "user-cand-19", candidate20: "user-cand-20",
  jobA1: "job-backend-dev", jobA2: "job-frontend-dev", jobA3: "job-devops-eng",
  jobA4: "job-data-eng-alpha", jobA5: "job-ml-engineer", jobA6: "job-qa-auto",
  jobA7: "job-product-analyst", jobA8: "job-fullstack-intern", jobA9: "job-ux-designer", jobA10: "job-backend-senior",
  jobB1: "job-data-eng", jobB2: "job-data-analyst", jobB3: "job-python-dev",
  jobB4: "job-bi-developer", jobB5: "job-data-scientist", jobB6: "job-hr-executive",
  jobC1: "job-gamma-backend", jobC2: "job-gamma-intern", jobC3: "job-gamma-devops",
};

const TODAY = new Date("2026-10-04T00:00:00Z");
export function daysAgo(n: number): string { const d = new Date(TODAY); d.setDate(d.getDate() - n); return d.toISOString(); }
export function daysFromNow(n: number): string { const d = new Date(TODAY); d.setDate(d.getDate() + n); return d.toISOString(); }
export function dateOnly(iso: string): string { return iso.split("T")[0]; }

export const defaultScreening: ScreeningConfig = {
  autoResumeExtraction: true, skillMatching: true, experienceMatching: true,
  educationMatching: true, projectRelevance: true, certificationMatching: true,
  aiExplanation: true, minimumThreshold: 70, autoShortlist: false,
};
