import type {
  User, Company, CompanyMember, Job, Application,
  CandidateProfile, CandidateMatch, Interview, Notification, AuditLog
} from '../types';

export interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Data
  users: User[];
  companies: Company[];
  companyMembers: CompanyMember[];
  jobs: Job[];
  applications: Application[];
  candidateProfiles: CandidateProfile[];
  candidateMatches: CandidateMatch[];
  interviews: Interview[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  
  // Current context
  currentCompanyId: string | null;
  
  // Auth actions
  login: (email: string, password: string) => User | null;
  register: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'status'>, password: string) => User;
  logout: () => void;
  clearAllUserData: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Company actions
  createCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  setCurrentCompany: (companyId: string) => void;
  addCompanyMember: (member: Omit<CompanyMember, 'id' | 'joinedAt'>) => CompanyMember;
  
  // Job actions
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  publishJob: (id: string) => void;
  closeJob: (id: string) => void;
  
  // Application actions
  createApplication: (app: Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'statusHistory'>) => Application;
  updateApplicationStatus: (id: string, status: Application['status'], note?: string) => void;
  
  // Candidate actions
  createCandidateProfile: (profile: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt' | 'profileCompletion'>) => CandidateProfile;
  updateCandidateProfile: (id: string, updates: Partial<CandidateProfile>) => void;
  
  // Match actions
  createMatch: (match: Omit<CandidateMatch, 'id' | 'createdAt'>) => CandidateMatch;
  
  // Interview actions
  createInterview: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => Interview;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  submitFeedback: (interviewId: string, feedback: Omit<Interview['feedback'], 'id' | 'submittedAt'>) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Audit actions
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;
  
  // Helpers
  getCompanyJobs: (companyId: string) => Job[];
  getJobApplications: (jobId: string) => Application[];
  getUserNotifications: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
  
  // Init
  initDemoData: () => void;
  _initialized: boolean;
}
