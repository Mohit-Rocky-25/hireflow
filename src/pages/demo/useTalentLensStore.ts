// ============================================================
// HireFlow — TalentLens™ Shared State Store
// Persists resume, company, role selection and analysis
// in sessionStorage across navigation and browser history
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  COMPANIES,
  Company,
  Role,
  AnalysisResult,
} from './talentLensData';

export const DEMO_TALENTLENS_RESUME = {
  fileName: 'resume-final-2.pdf',
  text: `Senior Software Engineer with 5+ years of experience building high-scale distributed systems in enterprise production environments. Architected and deployed cloud-native microservices using Java, Spring Boot, and Kubernetes on AWS, processing 15M+ requests daily with 99.99% uptime. Led full-stack feature delivery with TypeScript and React, reducing p99 API latency by 42% and accelerating page performance. Designed resilient event-driven data pipelines and solved complex DSA problems for algorithmic optimization and system design bottlenecks across distributed clusters. Mentored 4 engineers and established automated CI/CD deployment pipelines. Collaborated closely with cross-functional product stakeholders to deliver robust enterprise software architectures.`,
} as const;

export interface TalentLensState {
  resumeText: string;
  resumeFileName: string;
  uploadMode: 'paste' | 'upload';
  companySearch: string;
  industryFilter: string;
  tierFilter: string;
  selectedCompanyId: string | null;
  selectedRoleTitle: string | null;
  result: AnalysisResult | null;
  step: 1 | 2 | 3;

  // Actions
  setResume: (text: string, fileName?: string) => void;
  setUploadMode: (mode: 'paste' | 'upload') => void;
  setCompanySearch: (search: string) => void;
  setIndustryFilter: (industry: string) => void;
  setTierFilter: (tier: string) => void;
  selectCompany: (company: Company | null) => void;
  selectRole: (role: Role | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  setStep: (step: 1 | 2 | 3) => void;
  resetToNewResume: () => void;
  resetToCompanies: () => void;
  resetToRoles: () => void;

  // Getters / Resolvers
  getSelectedCompany: () => Company | null;
  getSelectedRole: () => Role | null;
}

export const useTalentLensStore = create<TalentLensState>()(
  persist(
    (set, get) => ({
      resumeText: '',
      resumeFileName: '',
      uploadMode: 'paste',
      companySearch: '',
      industryFilter: 'All',
      tierFilter: 'All',
      selectedCompanyId: null,
      selectedRoleTitle: null,
      result: null,
      step: 1,

      setResume: (text: string, fileName = '') =>
        set({ resumeText: text, resumeFileName: fileName }),

      setUploadMode: (mode: 'paste' | 'upload') =>
        set({ uploadMode: mode }),

      setCompanySearch: (search: string) =>
        set({ companySearch: search }),

      setIndustryFilter: (industry: string) =>
        set({ industryFilter: industry }),

      setTierFilter: (tier: string) =>
        set({ tierFilter: tier }),

      selectCompany: (company: Company | null) =>
        set((state) => ({
          selectedCompanyId: company ? company.id : null,
          selectedRoleTitle:
            company && state.selectedCompanyId === company.id
              ? state.selectedRoleTitle
              : null,
        })),

      selectRole: (role: Role | null) =>
        set({ selectedRoleTitle: role ? role.title : null }),

      setResult: (result: AnalysisResult | null) =>
        set({ result }),

      setStep: (step: 1 | 2 | 3) =>
        set({ step }),

      resetToNewResume: () =>
        set({
          resumeText: '',
          resumeFileName: '',
          selectedCompanyId: null,
          selectedRoleTitle: null,
          result: null,
          step: 1,
        }),

      resetToCompanies: () =>
        set({
          selectedRoleTitle: null,
          result: null,
          step: 2,
        }),

      resetToRoles: () =>
        set({
          result: null,
          step: 2,
        }),

      getSelectedCompany: () => {
        const { selectedCompanyId } = get();
        if (!selectedCompanyId) return null;
        return COMPANIES.find((c) => c.id === selectedCompanyId) || null;
      },

      getSelectedRole: () => {
        const { selectedCompanyId, selectedRoleTitle } = get();
        if (!selectedCompanyId || !selectedRoleTitle) return null;
        const company = COMPANIES.find((c) => c.id === selectedCompanyId);
        if (!company) return null;
        return company.roles.find((r) => r.title === selectedRoleTitle) || null;
      },
    }),
    {
      name: 'hireflow_talentlens_session_v1',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
