// ============================================================
// HireFlow — Company Match Page (Candidate Dashboard)
// Upload resume → compare against 25 real MNC/company job
// requirements → AI suggestions personalised per company
// ============================================================
import { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import {
  Brain, Upload, FileText, Building2, CheckCircle, XCircle,
  AlertTriangle, Lightbulb, Search, ChevronDown, ChevronUp,
  Star, MapPin, Users, Briefcase, RefreshCw, ArrowRight, Globe
} from 'lucide-react';
import { Badge } from '../../components/ui/Components';
import { Link } from 'react-router-dom';

// ── 25 Real Companies with realistic job roles and requirements ───────────────
const COMPANIES_DATA = [
  {
    name: 'Google',        logo: 'G',  color: 'from-blue-600 to-blue-400',   industry: 'Technology', hq: 'Mountain View, USA', size: '100,000+',
    roles: [
      { title: 'Software Engineer (L4)', skills: ['Algorithms', 'Data Structures', 'System Design', 'Python/Java/C++', 'Distributed Systems'], type: 'Full-time', location: 'Bangalore / Hyderabad' },
      { title: 'Frontend Engineer', skills: ['React', 'TypeScript', 'Web Performance', 'Accessibility', 'CSS'], type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Microsoft',     logo: 'M',  color: 'from-blue-500 to-cyan-400',   industry: 'Technology', hq: 'Redmond, USA',       size: '200,000+',
    roles: [
      { title: 'Senior Software Engineer', skills: ['C#/.NET', 'Azure', 'Microservices', 'System Design', 'TypeScript'], type: 'Full-time', location: 'Hyderabad / Noida' },
      { title: 'Cloud Solutions Architect', skills: ['Azure', 'Kubernetes', 'Terraform', 'DevOps', 'Python'], type: 'Full-time', location: 'Remote / Hyderabad' },
    ],
  },
  {
    name: 'Amazon',        logo: 'A',  color: 'from-orange-500 to-yellow-400', industry: 'E-Commerce / Cloud', hq: 'Seattle, USA', size: '1,500,000+',
    roles: [
      { title: 'SDE-II (AWS)',             skills: ['Java', 'AWS', 'Distributed Systems', 'REST APIs', 'System Design'], type: 'Full-time', location: 'Bangalore / Hyderabad' },
      { title: 'Data Engineer',            skills: ['Python', 'Spark', 'AWS Glue', 'Redshift', 'SQL'],                   type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Meta',          logo: 'M',  color: 'from-blue-700 to-indigo-500', industry: 'Social Media', hq: 'Menlo Park, USA', size: '80,000+',
    roles: [
      { title: 'Software Engineer (React)', skills: ['React', 'GraphQL', 'JavaScript', 'System Design', 'Performance Optimization'], type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Flipkart',      logo: 'F',  color: 'from-yellow-500 to-orange-400', industry: 'E-Commerce', hq: 'Bangalore, India', size: '30,000+',
    roles: [
      { title: 'Senior Frontend Engineer', skills: ['React', 'TypeScript', 'Node.js', 'System Design', 'Micro-Frontend'], type: 'Full-time', location: 'Bangalore' },
      { title: 'ML Engineer',              skills: ['Python', 'TensorFlow', 'MLOps', 'Feature Engineering', 'A/B Testing'], type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Infosys',       logo: 'I',  color: 'from-indigo-600 to-blue-400', industry: 'IT Services', hq: 'Bangalore, India', size: '300,000+',
    roles: [
      { title: 'Technology Lead',          skills: ['Java', 'Spring Boot', 'Microservices', 'AWS/Azure', 'SQL'],          type: 'Full-time', location: 'Pan India' },
      { title: 'Digital Analyst',          skills: ['Python', 'Power BI', 'SQL', 'Excel', 'Agile'],                       type: 'Full-time', location: 'Pan India' },
    ],
  },
  {
    name: 'TCS',           logo: 'T',  color: 'from-purple-600 to-violet-400', industry: 'IT Services', hq: 'Mumbai, India', size: '600,000+',
    roles: [
      { title: 'Systems Engineer',         skills: ['Java', 'SQL', 'REST APIs', 'Git', 'Agile/Scrum'],                    type: 'Full-time', location: 'Pan India' },
      { title: 'Data Analyst',             skills: ['Python', 'SQL', 'Tableau', 'Power BI', 'Statistics'],                type: 'Full-time', location: 'Pan India' },
    ],
  },
  {
    name: 'Wipro',         logo: 'W',  color: 'from-teal-600 to-emerald-400', industry: 'IT Services', hq: 'Bangalore, India', size: '250,000+',
    roles: [
      { title: 'Senior Developer',         skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'CI/CD'],                    type: 'Full-time', location: 'Bangalore / Pune' },
    ],
  },
  {
    name: 'Zomato',        logo: 'Z',  color: 'from-red-600 to-rose-400',    industry: 'Food Tech', hq: 'Gurugram, India', size: '5,000+',
    roles: [
      { title: 'Backend Engineer',         skills: ['Golang/Python', 'Kafka', 'Redis', 'MySQL', 'Kubernetes'],            type: 'Full-time', location: 'Gurugram' },
      { title: 'Product Data Analyst',     skills: ['SQL', 'Python', 'Looker', 'A/B Testing', 'Statistics'],              type: 'Full-time', location: 'Gurugram' },
    ],
  },
  {
    name: 'Swiggy',        logo: 'S',  color: 'from-orange-600 to-amber-400', industry: 'Food Tech', hq: 'Bangalore, India', size: '4,000+',
    roles: [
      { title: 'SDE-2 (Platform)',         skills: ['Java/Go', 'Spring Boot', 'gRPC', 'Kafka', 'PostgreSQL'],             type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Razorpay',      logo: 'R',  color: 'from-blue-800 to-blue-500',  industry: 'Fintech', hq: 'Bangalore, India', size: '3,000+',
    roles: [
      { title: 'Software Engineer – Payments', skills: ['Node.js', 'Go', 'PostgreSQL', 'Redis', 'REST APIs'],             type: 'Full-time', location: 'Bangalore' },
      { title: 'Frontend Engineer',            skills: ['React', 'TypeScript', 'Redux', 'Webpack', 'Web Security'],       type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'PhonePe',       logo: 'P',  color: 'from-violet-700 to-purple-400', industry: 'Fintech', hq: 'Bangalore, India', size: '2,500+',
    roles: [
      { title: 'Senior Engineer',          skills: ['Java', 'Spring Boot', 'Kafka', 'MySQL', 'AWS'],                      type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'CRED',          logo: 'C',  color: 'from-black to-zinc-700',      industry: 'Fintech', hq: 'Bangalore, India', size: '1,000+',
    roles: [
      { title: 'Android Engineer',         skills: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Coroutines', 'GraphQL'],        type: 'Full-time', location: 'Bangalore' },
      { title: 'Data Engineer',            skills: ['Python', 'dbt', 'Snowflake', 'Airflow', 'Spark'],                    type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Ola',           logo: 'O',  color: 'from-green-700 to-lime-400',  industry: 'Mobility', hq: 'Bangalore, India', size: '5,000+',
    roles: [
      { title: 'Senior SDE',               skills: ['Java/Go', 'Microservices', 'Redis', 'Kafka', 'System Design'],       type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Byju\'s',       logo: 'B',  color: 'from-purple-800 to-fuchsia-500', industry: 'EdTech', hq: 'Bangalore, India', size: '10,000+',
    roles: [
      { title: 'Frontend Developer',       skills: ['React Native', 'JavaScript', 'Redux', 'REST APIs', 'Git'],            type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Zepto',         logo: 'Z',  color: 'from-pink-700 to-rose-400',   industry: 'Quick Commerce', hq: 'Mumbai, India', size: '2,000+',
    roles: [
      { title: 'Software Engineer',        skills: ['Python/Go', 'PostgreSQL', 'Redis', 'Kubernetes', 'System Design'],   type: 'Full-time', location: 'Mumbai' },
    ],
  },
  {
    name: 'Meesho',        logo: 'M',  color: 'from-pink-600 to-rose-300',   industry: 'Social Commerce', hq: 'Bangalore, India', size: '3,000+',
    roles: [
      { title: 'Data Scientist',           skills: ['Python', 'ML Algorithms', 'Spark', 'Recommendation Systems', 'SQL'], type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Paytm',         logo: 'P',  color: 'from-blue-600 to-sky-400',    industry: 'Fintech', hq: 'Noida, India', size: '8,000+',
    roles: [
      { title: 'Backend Developer',        skills: ['Java', 'Spring', 'MySQL', 'Redis', 'AWS'],                            type: 'Full-time', location: 'Noida / Bangalore' },
    ],
  },
  {
    name: 'HCL Tech',      logo: 'H',  color: 'from-green-800 to-teal-500',  industry: 'IT Services', hq: 'Noida, India', size: '220,000+',
    roles: [
      { title: 'Cloud Engineer',           skills: ['Azure / AWS', 'Terraform', 'Ansible', 'Python', 'Kubernetes'],       type: 'Full-time', location: 'Pan India' },
    ],
  },
  {
    name: 'Accenture',     logo: 'A',  color: 'from-purple-700 to-violet-500', industry: 'Consulting', hq: 'Dublin, Ireland', size: '700,000+',
    roles: [
      { title: 'Full Stack Developer',     skills: ['React', 'Node.js', 'SQL', 'REST APIs', 'Agile'],                     type: 'Full-time', location: 'Pan India' },
      { title: 'SAP Consultant',           skills: ['SAP S/4HANA', 'ABAP', 'FI/CO', 'Business Analysis', 'SQL'],         type: 'Full-time', location: 'Pan India' },
    ],
  },
  {
    name: 'IBM',           logo: 'I',  color: 'from-blue-900 to-blue-600',   industry: 'Technology', hq: 'Armonk, USA', size: '280,000+',
    roles: [
      { title: 'AI Engineer',              skills: ['Python', 'TensorFlow/PyTorch', 'NLP', 'Watson APIs', 'Cloud'],        type: 'Full-time', location: 'Bangalore / Hyderabad' },
    ],
  },
  {
    name: 'Deloitte',      logo: 'D',  color: 'from-green-700 to-emerald-500', industry: 'Consulting', hq: 'New York, USA', size: '400,000+',
    roles: [
      { title: 'Technology Consultant',    skills: ['Cloud (AWS/Azure)', 'Python', 'SQL', 'Agile', 'Communication'],       type: 'Full-time', location: 'Pan India' },
      { title: 'Cybersecurity Analyst',    skills: ['SIEM', 'Network Security', 'Python', 'Risk Analysis', 'CISSP'],      type: 'Full-time', location: 'Hyderabad' },
    ],
  },
  {
    name: 'MakeMyTrip',    logo: 'M',  color: 'from-red-700 to-orange-400',  industry: 'Travel Tech', hq: 'Gurugram, India', size: '5,000+',
    roles: [
      { title: 'React Developer',          skills: ['React', 'TypeScript', 'Redux', 'GraphQL', 'Performance Optimization'], type: 'Full-time', location: 'Gurugram' },
    ],
  },
  {
    name: 'ShareChat',     logo: 'S',  color: 'from-yellow-600 to-amber-400', industry: 'Social Media', hq: 'Bangalore, India', size: '2,500+',
    roles: [
      { title: 'ML Engineer',              skills: ['Python', 'PyTorch', 'NLP', 'Video ML', 'MLOps'],                      type: 'Full-time', location: 'Bangalore' },
    ],
  },
  {
    name: 'Freshworks',    logo: 'F',  color: 'from-green-600 to-teal-400',  industry: 'SaaS', hq: 'San Mateo, USA', size: '7,000+',
    roles: [
      { title: 'Senior Software Engineer', skills: ['Ruby on Rails', 'React', 'PostgreSQL', 'Redis', 'Kafka'],             type: 'Full-time', location: 'Chennai / Bangalore' },
      { title: 'Product Manager',          skills: ['Product Strategy', 'SQL', 'A/B Testing', 'User Research', 'Agile'],  type: 'Full-time', location: 'Chennai' },
    ],
  },
];

// ── Simulated AI skill extraction from a resume ────────────────────────────────
const SIMULATED_SKILLS = ['React', 'TypeScript', 'Node.js', 'CSS/Tailwind', 'REST APIs', 'Git', 'SQL', 'JavaScript'];

function computeMatch(candidateSkills: string[], requiredSkills: string[]) {
  const lower = candidateSkills.map(s => s.toLowerCase());
  let matched = 0;
  const breakdown = requiredSkills.map(skill => {
    const hit = lower.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s));
    if (hit) matched++;
    return { skill, matched: hit };
  });
  const score = Math.round((matched / requiredSkills.length) * 100);
  return { score, breakdown };
}

function getSuggestions(breakdown: { skill: string; matched: boolean }[], score: number): string[] {
  const missing = breakdown.filter(b => !b.matched).map(b => b.skill);
  const suggestions: string[] = [];
  if (missing.length === 0) {
    suggestions.push('Your profile is an excellent match! Apply now to increase your chances.');
    suggestions.push('Prepare for system design and technical interviews for this role.');
  } else {
    if (score < 40) suggestions.push('This role requires significant upskilling. Consider starting with the core skills listed below.');
    missing.slice(0, 3).forEach(skill => {
      suggestions.push(`Strengthen your ${skill} skills — take a hands-on project or course to add this to your resume.`);
    });
    if (missing.length > 2) suggestions.push(`Also work on: ${missing.slice(3).join(', ')} to improve your overall fit.`);
    suggestions.push('Update your HireFlow resume with any existing experience in these areas to improve your AI match score.');
  }
  return suggestions.slice(0, 4);
}

// ══════════════════════════════════════════════════════════════════════════════
export function CompanyMatch() {
  const { currentUser, candidateProfiles } = useStore();
  const profile = candidateProfiles.find(p => p.userId === currentUser?.id);

  const [resumeFile, setResumeFile] = useState<string | null>(profile?.resumeFileName || null);
  const [skills, setSkills] = useState<string[]>(profile?.skills?.length ? profile.skills : SIMULATED_SKILLS);
  const [parsing, setParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState<typeof COMPANIES_DATA[0] | null>(null);
  const [selectedRole, setSelectedRole] = useState<typeof COMPANIES_DATA[0]['roles'][0] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [expandSuggestions, setExpandSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = ['All', ...Array.from(new Set(COMPANIES_DATA.map(c => c.industry)))];

  const filteredCompanies = COMPANIES_DATA.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.roles.some(r => r.title.toLowerCase().includes(search.toLowerCase()));
    const matchIndustry = industryFilter === 'All' || c.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const handleFile = (name: string) => {
    setResumeFile(name);
    setParsing(true);
    setTimeout(() => { setParsing(false); setSkills(SIMULATED_SKILLS); }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0].name);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0].name);
  };

  const handleCompare = (company: typeof COMPANIES_DATA[0], role: typeof COMPANIES_DATA[0]['roles'][0]) => {
    setSelectedCompany(company);
    setSelectedRole(role);
    setShowResult(true);
    setExpandSuggestions(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const result = selectedCompany && selectedRole
    ? computeMatch(skills, selectedRole.skills)
    : null;

  const suggestions = result ? getSuggestions(result.breakdown, result.score) : [];

  const scoreColor = result
    ? result.score >= 75 ? 'text-success' : result.score >= 45 ? 'text-warning' : 'text-danger'
    : '';
  const scoreBg = result
    ? result.score >= 75 ? 'from-success/20 to-success/5 border-success/30' : result.score >= 45 ? 'from-warning/20 to-warning/5 border-warning/30' : 'from-danger/20 to-danger/5 border-danger/30'
    : '';

  return (
    <div className="space-y-[32px] animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text mb-[4px] tracking-[-0.01em] flex items-center gap-[10px]">
          <div className="w-[34px] h-[34px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center">
            <Brain className="w-[16px] h-[16px] text-ai stroke-[1.5px]" />
          </div>
          Company Match — AI Resume Analyser
        </h1>
        <p className="text-[14px] text-text-secondary ml-[44px]">Upload your resume and compare your skills against requirements of 25 top companies. Get AI-powered gap analysis and personalised suggestions.</p>
      </div>

      {/* ── AI Match Result (shown when a role is selected) ── */}
      {showResult && result && selectedCompany && selectedRole && (
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${scoreBg} border p-[32px] shadow-sm`}>
          <button onClick={() => setShowResult(false)} className="absolute top-[16px] right-[16px] text-[12px] text-text-muted hover:text-text">✕ Close</button>
          <div className="flex flex-col sm:flex-row items-start gap-[20px] mb-[28px]">
            {/* Score ring */}
            <div className="relative w-[96px] h-[96px] shrink-0">
              <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
                  strokeLinecap="round" className={scoreColor}
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[26px] font-extrabold ${scoreColor} leading-none`}>{result.score}%</span>
                <span className="text-[10px] text-text-muted">match</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-[12px] mb-[6px] flex-wrap">
                <h2 className="text-[20px] font-bold text-text tracking-[-0.01em]">{selectedRole.title}</h2>
                <span className={`text-[11px] font-bold px-[10px] py-[3px] rounded-full border ${
                  result.score >= 75 ? 'bg-success-bg text-success border-success/20' :
                  result.score >= 45 ? 'bg-warning-bg text-warning border-warning/20' :
                                       'bg-danger-bg text-danger border-danger/20'
                }`}>
                  {result.score >= 75 ? 'Strong Fit' : result.score >= 45 ? 'Partial Fit' : 'Low Fit'}
                </span>
              </div>
              <p className="text-[13px] text-text-secondary flex items-center gap-[6px]">
                <Building2 className="w-[13px] h-[13px]" /> {selectedCompany.name} · {selectedRole.location}
              </p>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-[10px] mb-[24px]">
            {result.breakdown.map((b, i) => (
              <div key={i} className={`rounded-xl border p-[12px] ${b.matched ? 'bg-success-bg border-success/20' : 'bg-danger-bg border-danger/20'}`}>
                <div className="flex items-center gap-[6px] mb-[4px]">
                  {b.matched
                    ? <CheckCircle className="w-[12px] h-[12px] text-success stroke-[2px]" />
                    : <XCircle className="w-[12px] h-[12px] text-danger stroke-[2px]" />
                  }
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${b.matched ? 'text-success' : 'text-danger'}`}>{b.matched ? 'Met' : 'Missing'}</span>
                </div>
                <p className="text-[12px] font-semibold text-text leading-[16px]">{b.skill}</p>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpandSuggestions(!expandSuggestions)}
              className="w-full flex items-center justify-between px-[20px] py-[14px] hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-[10px]">
                <Lightbulb className="w-[15px] h-[15px] text-primary" />
                <span className="text-[14px] font-bold text-text">AI Improvement Suggestions</span>
                <Badge variant="primary">{suggestions.length}</Badge>
              </div>
              {expandSuggestions ? <ChevronUp className="w-[15px] h-[15px] text-text-muted" /> : <ChevronDown className="w-[15px] h-[15px] text-text-muted" />}
            </button>
            {expandSuggestions && (
              <div className="px-[20px] pb-[20px] border-t border-border space-y-[8px] pt-[16px] animate-slide-up">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-[12px] p-[14px] bg-surface-2 rounded-xl border border-border">
                    <div className="w-[22px] h-[22px] rounded-full bg-primary-light border border-primary/20 flex items-center justify-center shrink-0 mt-[1px]">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-[13px] text-text-secondary leading-[20px]">{s}</p>
                  </div>
                ))}
                <div className="flex gap-[10px] pt-[8px]">
                  <Link to="/candidate/resume" className="flex-1">
                    <button className="w-full h-[40px] text-[12px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.01] transition-all flex items-center justify-center gap-[6px]">
                      Update Resume <ArrowRight className="w-[13px] h-[13px]" />
                    </button>
                  </Link>
                  <Link to="/candidate/jobs" className="flex-1">
                    <button className="w-full h-[40px] text-[12px] font-semibold text-text-secondary rounded-xl border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all flex items-center justify-center gap-[6px]">
                      Browse Similar Jobs
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Resume Upload Strip ── */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs p-[24px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-[20px]">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex-1 cursor-pointer rounded-xl border-2 border-dashed p-[20px] text-center transition-all ${
              dragActive ? 'border-primary bg-primary-light/20 scale-[1.01]' :
              resumeFile ? 'border-success/40 bg-success-bg/20' : 'border-border hover:border-border-accent hover:bg-surface-2/40'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={handleInput} className="hidden" />
            {resumeFile ? (
              <div className="flex items-center gap-[12px] justify-center">
                <div className="w-[36px] h-[36px] rounded-lg bg-success-bg border border-success/20 flex items-center justify-center">
                  <FileText className="w-[16px] h-[16px] text-success" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-text">{resumeFile}</p>
                  <p className="text-[12px] text-text-secondary">{parsing ? 'AI extracting skills...' : `${skills.length} skills detected • Ready to compare`}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-[12px] justify-center">
                <div className="w-[36px] h-[36px] rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center">
                  <Upload className="w-[16px] h-[16px] text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-bold text-text">Upload your resume</p>
                  <p className="text-[12px] text-text-secondary">PDF, DOCX or TXT — AI will extract skills</p>
                </div>
              </div>
            )}
          </div>

          {/* Detected Skills */}
          {skills.length > 0 && (
            <div className="sm:w-[340px] shrink-0">
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-[0.06em] mb-[8px]">Detected Skills ({skills.length})</p>
              <div className="flex flex-wrap gap-[6px]">
                {skills.slice(0, 10).map((s, i) => (
                  <span key={i} className="px-[10px] py-[4px] bg-ai-light border border-ai/20 text-ai text-[11px] font-semibold rounded-full">{s}</span>
                ))}
                {skills.length > 10 && <span className="px-[10px] py-[4px] text-[11px] text-text-muted">+{skills.length - 10} more</span>}
              </div>
            </div>
          )}

          {parsing && (
            <div className="flex items-center gap-[8px] text-ai text-[13px] font-semibold">
              <RefreshCw className="w-[14px] h-[14px] animate-spin" /> Parsing...
            </div>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-[12px]">
        <div className="relative flex-1">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-muted" />
          <input
            type="text" placeholder="Search companies, roles, skills..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-[44px] pl-[42px] pr-[14px] rounded-xl bg-surface border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-muted"
          />
        </div>
        <select
          value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
          className="h-[44px] px-[14px] rounded-xl bg-surface border border-border text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
        >
          {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      {/* ── Company Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {filteredCompanies.map(company => (
          <div key={company.name} className="bg-surface rounded-2xl border border-border shadow-xs hover:shadow-md hover:-translate-y-[2px] hover:border-border-strong transition-all duration-200 overflow-hidden">
            {/* Company Header */}
            <div className={`bg-gradient-to-r ${company.color} p-[20px] flex items-center gap-[14px]`}>
              <div className="w-[48px] h-[48px] rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-[20px] font-extrabold text-white shrink-0">
                {company.logo}
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-white tracking-[-0.01em]">{company.name}</h3>
                <div className="flex items-center gap-[12px] text-[12px] text-white/70 mt-[2px]">
                  <span className="flex items-center gap-[3px]"><Building2 className="w-[10px] h-[10px]" />{company.industry}</span>
                  <span className="flex items-center gap-[3px]"><MapPin className="w-[10px] h-[10px]" />{company.hq}</span>
                  <span className="flex items-center gap-[3px]"><Users className="w-[10px] h-[10px]" />{company.size}</span>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="p-[16px] space-y-[10px]">
              {company.roles.map((role, ri) => {
                const hasSkills = skills.length > 0;
                const { score } = hasSkills ? computeMatch(skills, role.skills) : { score: 0 };
                const scoreRing = hasSkills
                  ? score >= 75 ? 'bg-success text-white' : score >= 45 ? 'bg-warning text-black' : 'bg-danger text-white'
                  : 'bg-surface-3 text-text-muted';

                return (
                  <div key={ri} className="flex items-center gap-[12px] p-[14px] rounded-xl border border-border hover:border-border-accent hover:bg-surface-2/50 transition-all group">
                    <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0 ${scoreRing}`}>
                      {hasSkills ? `${score}%` : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-text truncate">{role.title}</p>
                      <div className="flex flex-wrap gap-[4px] mt-[5px]">
                        {role.skills.slice(0, 3).map((s, si) => (
                          <span key={si} className="px-[7px] py-[2px] bg-surface-2 border border-border text-[10px] font-medium text-text-secondary rounded-full">{s}</span>
                        ))}
                        {role.skills.length > 3 && <span className="text-[10px] text-text-muted">+{role.skills.length - 3}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompare(company, role)}
                      className="shrink-0 h-[34px] px-[14px] text-[12px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.03] active:scale-[0.98] transition-all opacity-0 group-hover:opacity-100"
                    >
                      Compare
                    </button>
                    {!hasSkills && (
                      <span className="shrink-0 text-[11px] text-text-muted">Upload resume first</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-2 bg-surface rounded-xl border border-border p-[48px] text-center">
            <Building2 className="w-[40px] h-[40px] text-text-muted mx-auto mb-[12px] opacity-40" />
            <p className="text-[15px] font-semibold text-text-secondary">No companies found</p>
            <p className="text-[13px] text-text-muted mt-[4px]">Try a different search or filter</p>
          </div>
        )}
      </div>

      <p className="text-center text-[12px] text-text-muted pb-[24px]">
        Showing {filteredCompanies.length} companies · {COMPANIES_DATA.reduce((a, c) => a + c.roles.length, 0)} open roles — AI match scores are calculated against your uploaded resume skills.
      </p>
    </div>
  );
}
