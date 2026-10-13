// ============================================================
// HIREFLOW OCCUPATIONAL TAXONOMY & SENIORITY MATRIX
// Role families, career progression ladders, and default section weighting
// ============================================================

import { SeniorityLevel, CandidateArchetype } from '../types';

export interface OccupationalRole {
  id: string;
  title: string;
  family: string;
  recommendedArchetype: CandidateArchetype;
  typicalSeniority: SeniorityLevel;
  coreKeywords: string[];
}

export const OCCUPATIONAL_ROLES: OccupationalRole[] = [
  {
    id: 'frontend_developer',
    title: 'Frontend Developer',
    family: 'Software Engineering',
    recommendedArchetype: 'technical_specialist',
    typicalSeniority: 'mid',
    coreKeywords: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Responsive Design', 'Next.js']
  },
  {
    id: 'backend_developer',
    title: 'Backend Developer',
    family: 'Software Engineering',
    recommendedArchetype: 'technical_specialist',
    typicalSeniority: 'mid',
    coreKeywords: ['Node.js', 'Python', 'Java', 'PostgreSQL', 'REST APIs', 'Microservices', 'Docker']
  },
  {
    id: 'fullstack_developer',
    title: 'Full Stack Engineer',
    family: 'Software Engineering',
    recommendedArchetype: 'technical_specialist',
    typicalSeniority: 'mid',
    coreKeywords: ['React', 'Node.js', 'TypeScript', 'SQL', 'Git', 'Cloud', 'System Architecture']
  },
  {
    id: 'cybersecurity_analyst',
    title: 'Cybersecurity Analyst / SOC Analyst',
    family: 'Security & Operations',
    recommendedArchetype: 'cybersecurity_specialist',
    typicalSeniority: 'junior',
    coreKeywords: ['SIEM', 'SOC', 'Incident Response', 'Vulnerability Assessment', 'Network Security', 'Firewalls']
  },
  {
    id: 'security_engineer',
    title: 'Information Security Engineer',
    family: 'Security & Operations',
    recommendedArchetype: 'cybersecurity_specialist',
    typicalSeniority: 'senior',
    coreKeywords: ['Penetration Testing', 'OWASP', 'Cloud Security', 'NIST', 'CIS Controls', 'PKI', 'Cryptography']
  },
  {
    id: 'machine_learning_engineer',
    title: 'Machine Learning Engineer',
    family: 'Data & AI',
    recommendedArchetype: 'academic_researcher',
    typicalSeniority: 'mid',
    coreKeywords: ['Python', 'PyTorch', 'TensorFlow', 'Machine Learning', 'Data Pipelines', 'NLP']
  },
  {
    id: 'devops_engineer',
    title: 'DevOps / Cloud Platform Engineer',
    family: 'Cloud & Infrastructure',
    recommendedArchetype: 'technical_specialist',
    typicalSeniority: 'senior',
    coreKeywords: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Monitoring']
  },
  {
    id: 'graduate_software_trainee',
    title: 'Graduate Software Engineer / Intern',
    family: 'Software Engineering',
    recommendedArchetype: 'student_fresher',
    typicalSeniority: 'fresher',
    coreKeywords: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Web Development', 'Projects']
  }
];

export function inferSeniorityFromText(text: string): SeniorityLevel {
  const lower = text.toLowerCase();
  if (/\b(?:intern|internship|co-op|undergraduate)\b/.test(lower)) return 'intern';
  if (/\b(?:fresher|fresh graduate|entry level|graduate trainee|associate)\b/.test(lower)) return 'fresher';
  if (/\b(?:junior|jr\.|entry)\b/.test(lower)) return 'junior';
  if (/\b(?:principal|distinguished)\b/.test(lower)) return 'principal';
  if (/\b(?:staff engineer|staff developer)\b/.test(lower)) return 'staff';
  if (/\b(?:lead|team lead|tech lead)\b/.test(lower)) return 'lead';
  if (/\b(?:director|vp|head of|chief|ciso|cto)\b/.test(lower)) return 'executive';
  if (/\b(?:senior|sr\.|lead|7\+|8\+|10\+\s*years)\b/.test(lower)) return 'senior';
  return 'mid';
}
