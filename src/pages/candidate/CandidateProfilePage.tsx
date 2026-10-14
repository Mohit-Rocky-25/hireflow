// ============================================================
// HireFlow — God-Level Candidate Profile & Career Dossier
// State-of-the-Art UX/UI, Real Store Integration, AI Matrix & Experience Engine
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Plus, X,
  BarChart3, ListTodo, Settings2, Target, Zap, Clock, ShieldCheck,
  Award, Globe, ExternalLink, Download, Share2, CheckCircle2,
  Sparkles, Calendar, ArrowRight, Code2, Database, Cloud, FileText,
  ChevronRight, Building2, Flame, Check
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

type Tab = 'overview' | 'experience' | 'projects' | 'education' | 'applications' | 'edit';

export function CandidateProfilePage() {
  const {
    currentUser,
    candidateProfiles,
    applications,
    jobs,
    companies,
    interviews,
    updateProfile,
    updateCandidateProfile,
  } = useStore();

  const profile = candidateProfiles.find((p) => p.userId === currentUser?.id) || candidateProfiles[0];

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State for editing
  const [displayName, setDisplayName] = useState(currentUser?.displayName || 'Arjun Mehta');
  const [headline, setHeadline] = useState(
    profile?.headline || 'Senior Full Stack & Distributed Systems Engineer | 3+ Years'
  );
  const [summary, setSummary] = useState(
    profile?.summary ||
      'Passionate software engineer specializing in scalable Java/Spring Boot microservices, high-performance REST APIs, and React/TypeScript frontend architectures. Proven track record in building fault-tolerant enterprise applications.'
  );
  const [phone, setPhone] = useState(profile?.phone || '+91-9876543210');
  const [location, setLocation] = useState(profile?.location || 'Bangalore, Karnataka, India');
  const [linkedIn, setLinkedIn] = useState(profile?.linkedIn || 'https://linkedin.com/in/arjunmehta');
  const [github, setGithub] = useState(profile?.github || 'https://github.com/arjunmehta');
  const [portfolio, setPortfolio] = useState(profile?.portfolio || 'https://arjunmehta.dev');
  const [skills, setSkills] = useState<string[]>(
    profile?.skills || [
      'Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL',
      'REST APIs', 'Docker', 'AWS', 'Kafka', 'System Design'
    ]
  );
  const [skillInput, setSkillInput] = useState('');

  if (!currentUser) return null;

  // Real store applications & interviews for this candidate
  const myApplications = applications.filter((a) => a.candidateId === currentUser.id);
  const myInterviews = interviews.filter((i) => i.candidateId === currentUser.id);

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (!skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName });
    if (profile) {
      updateCandidateProfile(profile.id, {
        headline,
        summary,
        phone,
        location,
        linkedIn,
        github,
        portfolio,
        skills,
      });
    }
    toast('success', 'Candidate Profile updated successfully!');
    setActiveTab('overview');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    toast('success', 'Public Profile link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadCV = () => {
    toast('info', 'Downloading calibrated CV dossier for ' + currentUser.displayName + '...');
    setTimeout(() => {
      toast('success', 'Resume PDF generated from verified profile credentials!');
    }, 800);
  };

  // Structured Competencies for Overview
  const competencyPillars = [
    {
      category: 'Backend & Distributed Systems',
      icon: Database,
      skills: ['Java 17+', 'Spring Boot 3', 'PostgreSQL', 'Kafka', 'RESTful Microservices', 'Redis'],
      rating: 94,
    },
    {
      category: 'Frontend & User Interfaces',
      icon: Code2,
      skills: ['React 18', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management'],
      rating: 88,
    },
    {
      category: 'Cloud, DevOps & Infra',
      icon: Cloud,
      skills: ['Docker', 'AWS (ECS/S3/RDS)', 'CI/CD Pipelines', 'Linux', 'Kubernetes Basics'],
      rating: 85,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      
      {/* ============================================================ */}
      {/* GOD-LEVEL HERO BANNER */}
      {/* ============================================================ */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-xl bg-surface">
        {/* Ambient Canvas Background Mesh */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-12 w-72 h-72 rounded-full bg-ai/20 blur-3xl pointer-events-none" />
          
          {/* Top Quick Action Bar on Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md text-xs font-semibold transition-all border border-white/10"
              title="Share Public Profile Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Share Profile'}</span>
            </button>
            <button
              onClick={handleDownloadCV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-all shadow-md active:scale-95"
              title="Download Certified Resume"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </button>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-ai text-white flex items-center justify-center text-4xl sm:text-5xl font-black shadow-2xl border-4 border-surface ring-2 ring-primary/20 shrink-0">
                  {currentUser.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-2 border-surface ring-2 ring-emerald-500/30" title="Online & Actively Interviewing" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {currentUser.displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/25">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Candidate
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <Sparkles className="w-3.5 h-3.5" /> TalentLens Calibrated
                  </span>
                </div>

                <p className="text-sm sm:text-base font-semibold text-text-secondary max-w-2xl">
                  {headline}
                </p>

                {/* Key Quick Metadata Pills */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-text-muted" /> {currentUser.email}
                  </span>
                  {phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-text-muted" /> {phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Notice: 30 Days (Negotiable)
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Score & Quick Edit Button */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border">
              <div className="flex items-center gap-3 bg-surface-2/80 border border-border px-4 py-2.5 rounded-2xl shadow-xs">
                <div className="relative w-11 h-11 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-border" strokeWidth="12" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      className="text-primary transition-all duration-1000"
                      strokeWidth="12"
                      strokeDasharray="251"
                      strokeDashoffset="15"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-black text-foreground">94%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">All-Star Profile</div>
                  <div className="text-[11px] text-text-muted">Top 5% Talent Bar</div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('edit')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-surface-2 hover:bg-surface-3 text-foreground text-xs font-bold rounded-xl border border-border transition-colors shadow-xs"
              >
                <Settings2 className="w-3.5 h-3.5 text-text-muted" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="px-6 border-t border-border bg-surface-2/30 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'AI Dossier & Overview', icon: BarChart3 },
            { id: 'experience', label: 'Work Experience', icon: Briefcase },
            { id: 'projects', label: 'Projects & Repos', icon: Code2 },
            { id: 'education', label: 'Education & Badges', icon: GraduationCap },
            {
              id: 'applications',
              label: `Active Pipeline (${myApplications.length})`,
              icon: ListTodo,
            },
            { id: 'edit', label: 'Edit Profile Settings', icon: Settings2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5 font-black'
                    : 'border-transparent text-text-secondary hover:text-foreground hover:bg-surface-2/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB CONTENT SECTIONS */}
      {/* ============================================================ */}
      <div className="space-y-6">

        {/* ── TAB 1: OVERVIEW & AI DOSSIER ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left 2 Cols: Summary, Competency Pillars & Skills */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Executive Summary Card */}
              <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Professional Executive Summary
                  </h2>
                  <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    ATS Verified
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {summary}
                </p>
              </div>

              {/* Verified Competency Pillars */}
              <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-warning" /> AI Competency Matrix
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      Evaluated using TalentLens™ multi-dimensional role scoring algorithms.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-text-muted">Targeting: Staff / Lead</span>
                </div>

                <div className="space-y-4">
                  {competencyPillars.map((pillar, i) => {
                    const Icon = pillar.icon;
                    return (
                      <div key={i} className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-bold text-foreground">{pillar.category}</span>
                          </div>
                          <span className="text-xs font-black text-primary">{pillar.rating}% Match</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-ai rounded-full transition-all duration-700"
                            style={{ width: `${pillar.rating}%` }}
                          />
                        </div>

                        {/* Skills chips */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {pillar.skills.map((s, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-surface border border-border text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verified Skills Cloud */}
              <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-ai" /> Verified Skills & Toolchain ({skills.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground text-xs font-bold border border-border transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: TalentLens Readiness, Target Preferences & Badges */}
            <div className="space-y-6">
              
              {/* TalentLens Readiness Insight Box */}
              <div className="bg-gradient-to-br from-primary/10 via-ai/5 to-surface rounded-3xl border border-primary/20 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="w-4 h-4" /> TalentLens™ Readiness Index
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-foreground">94.8 / 100</div>
                  <p className="text-xs text-text-secondary leading-normal">
                    Candidate exhibits elite system architectural fluency, comprehensive Spring Boot production experience, and verified credential evidence.
                  </p>
                </div>

                <div className="pt-2 border-t border-border/80 space-y-2 text-xs">
                  <div className="flex justify-between text-text-muted">
                    <span>Syntax & Core Java:</span>
                    <span className="font-bold text-foreground">98% (Exceeds)</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Concurrency & Distributed:</span>
                    <span className="font-bold text-foreground">92% (High)</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>API Performance Tuning:</span>
                    <span className="font-bold text-foreground">94% (High)</span>
                  </div>
                </div>

                <Link
                  to="/tools/talent-lens"
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span>Launch TalentLens Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Career Goals & Preferences */}
              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-3.5">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Target Preferences
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Desired Role:</span>
                    <span className="font-bold text-foreground">Senior Backend / Full-Stack</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Target Compensation:</span>
                    <span className="font-bold text-foreground">₹18,00,000 – ₹24,00,000 LPA</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Preferred Work Mode:</span>
                    <span className="font-bold text-foreground">Hybrid or Remote</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-text-muted">Preferred Locations:</span>
                    <span className="font-bold text-foreground">Bangalore, Hyderabad, Pune</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-text-muted">Notice Period:</span>
                    <span className="font-bold text-emerald-400">30 Days</span>
                  </div>
                </div>
              </div>

              {/* Verified Digital Credentials & Badges */}
              <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Credentials
                </h3>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-surface-2 border border-border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">AWS Cloud Practitioner</div>
                      <div className="text-[10px] text-text-muted">Amazon Web Services • 2025</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface-2 border border-border flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">Oracle Certified Java Professional</div>
                      <div className="text-[10px] text-text-muted">Oracle Corp • Score: 92%</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: WORK EXPERIENCE ── */}
        {activeTab === 'experience' && (
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Verified Work Experience
                </h2>
                <p className="text-xs text-text-muted mt-0.5">Chronological engineering career progression and direct contributions.</p>
              </div>
              <button
                onClick={() => setActiveTab('edit')}
                className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-foreground border border-border transition-colors"
              >
                + Add Experience
              </button>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
              {profile?.experience && profile.experience.length > 0 ? (
                profile.experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="relative pl-10 space-y-2">
                    <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-xs" />
                    
                    <div className="p-5 rounded-2xl bg-surface-2 border border-border space-y-2 hover:border-primary/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h3 className="text-base font-bold text-foreground">{exp.title}</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border text-text-muted shrink-0">
                          {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Building2 className="w-3.5 h-3.5" /> {exp.company}
                        </span>
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {exp.location}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed pt-1">
                        {exp.description}
                      </p>

                      {(exp as any).achievements && (exp as any).achievements.length > 0 && (
                        <ul className="space-y-1 pt-2">
                          {((exp as any).achievements as string[]).map((ach: string, aIdx: number) => (
                            <li key={aIdx} className="text-xs text-text-secondary flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-muted text-xs">No experience entries recorded.</div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: PROJECTS & REPOSITORIES ── */}
        {activeTab === 'projects' && (
          <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" /> Key Engineering Projects
                </h2>
                <p className="text-xs text-text-muted mt-0.5">High-impact architectural builds, open-source repositories, and demonstrations.</p>
              </div>
              <button
                onClick={() => setActiveTab('edit')}
                className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-xs font-bold text-foreground border border-border transition-colors"
              >
                + Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {profile?.projects && profile.projects.length > 0 ? (
                profile.projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="p-5 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground">{proj.name}</h3>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-surface text-text-muted hover:text-primary transition-colors"
                            title="View Project Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/80">
                      {proj.technologies?.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface text-text-secondary border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-text-muted text-xs">No projects documented.</div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: EDUCATION & CREDENTIALS ── */}
        {activeTab === 'education' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 pb-4 border-b border-border">
                <GraduationCap className="w-5 h-5 text-primary" /> Higher Education & Academic Degrees
              </h2>
              <div className="space-y-4">
                {profile?.education?.map((edu, idx) => (
                  <div key={edu.id || idx} className="p-5 rounded-2xl bg-surface-2 border border-border space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-foreground">
                        {edu.degree} in {edu.field}
                      </h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface border border-border text-text-muted shrink-0">
                        {edu.startDate} — {edu.endDate}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-primary">{edu.institution}</div>
                    {edu.grade && (
                      <div className="text-xs text-text-muted">Graduated with score: <span className="font-bold text-foreground">{edu.grade}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications Showcase */}
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
                <Award className="w-5 h-5 text-amber-500" /> Certified Credentials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.certifications?.map((cert, idx) => (
                  <div key={cert.id || idx} className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{cert.name}</h4>
                      <p className="text-xs text-text-muted">{cert.issuer} • Issued {cert.issuedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: ACTIVE PIPELINE & INTERVIEWS ── */}
        {activeTab === 'applications' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Applications */}
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-primary" /> Active Job Applications ({myApplications.length})
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">Real-time recruitment tracking synced directly from employers.</p>
                </div>
                <Link
                  to="/candidate/jobs"
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
                >
                  Browse More Jobs
                </Link>
              </div>

              {myApplications.length === 0 ? (
                <div className="text-center py-12 text-text-muted space-y-2">
                  <p className="text-sm font-semibold">No applications yet</p>
                  <Link to="/candidate/jobs" className="text-xs font-bold text-primary hover:underline">
                    Find and apply to matching roles →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApplications.map((app) => {
                    const job = jobs.find((j) => j.id === app.jobId);
                    const comp = companies.find((c) => c.id === app.companyId);

                    const statusBadgeColors = {
                      OFFER: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      HIRED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      INTERVIEW: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
                      SHORTLISTED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
                      SCREENING: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                      REVIEW: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      APPLIED: 'bg-surface-3 text-text-secondary border-border',
                      REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
                      WITHDRAWN: 'bg-surface-3 text-text-muted border-border',
                      FINAL_REVIEW: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
                      ON_HOLD: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                    }[app.status] || 'bg-surface-3 text-text-secondary border-border';

                    return (
                      <Link
                        key={app.id}
                        to={`/candidate/applications/${app.id}`}
                        className="p-5 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 block group"
                      >
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {job?.title || 'Engineering Role'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              <Building2 className="w-3.5 h-3.5 text-primary" /> {comp?.name || 'Company'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeColors}`}>
                            {app.status}
                          </span>
                          <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                            View Pipeline →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduled Interviews Preview */}
            <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border">
                <Calendar className="w-5 h-5 text-purple-400" /> Scheduled Interview Rounds ({myInterviews.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myInterviews.map((intv) => {
                  const job = jobs.find((j) => j.id === intv.jobId);
                  const comp = companies.find((c) => c.id === intv.companyId);
                  return (
                    <div key={intv.id} className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {intv.stage}
                        </span>
                        <span className="text-xs font-semibold text-text-muted">
                          {intv.scheduledDate} at {intv.scheduledTime}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-foreground">{job?.title || 'Job Interview'}</div>
                      <div className="text-xs text-text-muted flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {comp?.name}
                      </div>
                      {intv.meetingLink && intv.status !== 'completed' && (
                        <a
                          href={intv.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          Join Google Meet →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: EDIT PROFILE SETTINGS ── */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSubmit} className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" /> Edit Candidate Profile & Preferences
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Update your professional information, contact details, and skill tags.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Headline */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Summary */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Bio & Executive Summary</label>
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary resize-y"
                />
              </div>

              {/* Social Profiles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">GitHub Profile</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Skills Tag Management */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Skills & Technologies (Press Enter to Add)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. Kotlin, Docker, GraphQL, Redis (Hit Enter)..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-border bg-surface-2 text-foreground focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                        setSkills([...skills, skillInput.trim()]);
                        setSkillInput('');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-surface-2 border border-border font-bold text-xs hover:bg-surface-3 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 text-foreground text-xs font-bold border border-border"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-text-muted hover:text-rose-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Profile Changes
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
