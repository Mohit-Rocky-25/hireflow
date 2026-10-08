// ============================================================
// Suite UI — Profile Check (/tools/profile-check)
// Decision Group: "How do I present myself better?"
// Public LinkedIn & GitHub profile audit with actionable recruiter checklist.
// Deterministic in-browser scoring, zero backend network calls.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Code2,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useProfile } from '../profile/ProfileContext';
import {
  auditPublicProfiles,
  type LinkedInAuditInput,
  type GitHubAuditInput,
  type PinnedRepoInput,
  type PublicSignalAudit,
} from './auditProfile';

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.66 1.66 0 0 0-1.66-1.66Z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

export function ProfileCheckPage() {
  const { profile } = useProfile();

  // Tab selection
  const [activeTab, setActiveTab] = useState<'overview' | 'linkedin' | 'github'>('overview');

  // LinkedIn form state
  const latestRole = profile?.roles?.[0]?.title;
  const [headline, setHeadline] = useState<string>(
    latestRole
      ? `${latestRole} | React, Node.js, TypeScript | Built systems to 50K users`
      : 'Full Stack Engineer | React, TypeScript, Node.js | Scaled products to 100K users'
  );
  const [about, setAbout] = useState<string>(
    'Full-stack engineer with 3+ years experience building web applications. Architected distributed systems handling 50k requests/minute. Core stack includes TypeScript, Go, React, and PostgreSQL. Reach out at dev@example.com.'
  );
  const [experience, setExperience] = useState<string>(
    '- Built high-throughput API gateway reducing p95 latency by 40%.\n- Led migration of 8 microservices to Docker/Kubernetes with zero downtime.\n- Mentored 3 junior developers and improved CI/CD pipeline test coverage to 92%.'
  );
  const [skills, setSkills] = useState<string>(
    'TypeScript, React, Node.js, PostgreSQL, Docker, Kubernetes, AWS, Redis, GraphQL'
  );

  // GitHub form state
  const [username, setUsername] = useState<string>('alex-dev');
  const [hasProfileReadme, setHasProfileReadme] = useState<boolean>(true);
  const [commitVelocity, setCommitVelocity] = useState<'daily' | 'weekly' | 'sporadic' | 'inactive'>('weekly');
  const [pinnedRepos, setPinnedRepos] = useState<PinnedRepoInput[]>([
    {
      name: 'hireflow-engine',
      description: 'Deterministic ATS analysis & talent scoring engine',
      hasDemoLink: true,
      hasArchitectureDiagram: true,
      hasSetupInstructions: true,
      hasTechStackBadges: true,
    },
    {
      name: 'event-stream-broker',
      description: 'Distributed event log and streaming broker in Go',
      hasDemoLink: false,
      hasArchitectureDiagram: true,
      hasSetupInstructions: true,
      hasTechStackBadges: false,
    },
  ]);

  // New repo input
  const [newRepoName, setNewRepoName] = useState<string>('');

  // Prefill from profile on first load
  useEffect(() => {
    if (profile) {
      if (profile.roles?.[0]?.title && !headline) {
        setHeadline(`${profile.roles[0].title} | React, TypeScript | Shipped web apps`);
      }
      const ghLink = profile.identity?.links?.find((l) => l.kind === 'github');
      if (ghLink && ghLink.url) {
        const match = ghLink.url.match(/github\.com\/([^/]+)/);
        if (match && match[1]) setUsername(match[1]);
      }
      if (profile.masterResumeText && !experience) {
        const expLines = profile.masterResumeText
          .split('\n')
          .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))
          .slice(0, 5)
          .join('\n');
        if (expLines) setExperience(expLines);
      }
    }
  }, [profile]);

  // Computed audit results
  const audit: PublicSignalAudit = useMemo(() => {
    const liInput: LinkedInAuditInput = {
      headline,
      about,
      experience,
      skills,
    };
    const ghInput: GitHubAuditInput = {
      username,
      hasProfileReadme,
      pinnedRepos,
      commitVelocity,
    };
    return auditPublicProfiles(liInput, ghInput);
  }, [headline, about, experience, skills, username, hasProfileReadme, pinnedRepos, commitVelocity]);

  // Copy helper
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopyChecklist = () => {
    const lines = [
      `=== HireFlow Public Signal Action Plan ===`,
      `Overall Score: ${audit.overallScore}/100 (Grade ${audit.grade})`,
      `Summary: ${audit.summary}`,
      '',
      'Action Items:',
      ...audit.checklist.map(
        (c) => `[${c.completed ? 'DONE' : 'TODO'}] (${c.impact} Impact) [${c.category}] ${c.title}`
      ),
    ].join('\n');
    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddRepo = () => {
    if (!newRepoName.trim()) return;
    setPinnedRepos([
      ...pinnedRepos,
      {
        name: newRepoName.trim(),
        hasDemoLink: false,
        hasArchitectureDiagram: false,
        hasSetupInstructions: true,
        hasTechStackBadges: false,
      },
    ]);
    setNewRepoName('');
  };

  const handleRemoveRepo = (index: number) => {
    setPinnedRepos(pinnedRepos.filter((_, i) => i !== index));
  };

  const handleToggleRepoProp = (index: number, prop: keyof PinnedRepoInput) => {
    setPinnedRepos(
      pinnedRepos.map((repo, i) => {
        if (i !== index) return repo;
        return {
          ...repo,
          [prop]: !repo[prop],
        };
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Link to="/tools" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Tools Hub
            </Link>
            <span>/</span>
            <span className="text-secondary font-medium">Profile Check</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Public Profile Signal Auditor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Stage 4.3
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Decision Group: <strong className="text-text">"How do I present myself better?"</strong> — Audit your
            LinkedIn &amp; GitHub signals against hiring manager screener heuristics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tools/tailor"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Tailor Resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleCopyChecklist}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-surface transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Plan!' : 'Copy Action Plan'}
          </button>
        </div>
      </div>

      {/* Hero Score Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="md:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Public Signal Score
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl font-extrabold text-primary">{audit.overallScore}</span>
                <span className="text-lg text-text-muted font-medium">/ 100</span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    audit.grade === 'A'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : audit.grade === 'B'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  Grade {audit.grade}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 leading-relaxed">{audit.summary}</p>
        </div>

        {/* LinkedIn Score Card */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <LinkedInIcon className="w-4 h-4 text-blue-400" /> LinkedIn Signal
            </span>
            <span className="text-xs font-bold text-text">{audit.linkedIn.score}/100</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 my-3 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${audit.linkedIn.score}%` }}
            />
          </div>
          <div className="text-[11px] text-text-muted flex justify-between">
            <span>Headline: {audit.linkedIn.headlineScore}/25</span>
            <span>About: {audit.linkedIn.aboutScore}/25</span>
          </div>
        </div>

        {/* GitHub Score Card */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
              <GitHubIcon className="w-4 h-4 text-purple-400" /> GitHub Signal
            </span>
            <span className="text-xs font-bold text-text">{audit.gitHub.score}/100</span>
          </div>
          <div className="w-full bg-border rounded-full h-2 my-3 overflow-hidden">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${audit.gitHub.score}%` }}
            />
          </div>
          <div className="text-[11px] text-text-muted flex justify-between">
            <span>Pinned Repos: {audit.gitHub.pinnedReposScore}/40</span>
            <span>Velocity: {audit.gitHub.commitVelocityScore}/30</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Activity className="w-4 h-4" /> Recruiter Screener Checklist ({audit.checklist.filter((c) => c.completed).length}/{audit.checklist.length})
        </button>
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'linkedin'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <LinkedInIcon className="w-4 h-4 text-blue-400" /> LinkedIn Optimization ({audit.linkedIn.score}/100)
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'github'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <GitHubIcon className="w-4 h-4 text-purple-400" /> GitHub Repo Hygiene ({audit.gitHub.score}/100)
        </button>
      </div>

      {/* Tab 1: Checklist & Action Items */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Screener Pass-Through Verification
            </h3>
            <div className="bg-surface border border-border rounded-xl divide-y divide-border overflow-hidden">
              {audit.checklist.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text">{item.title}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.category === 'LinkedIn'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        Impact: <strong className={item.impact === 'High' ? 'text-rose-400' : 'text-amber-400'}>{item.impact}</strong>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      item.completed
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.completed ? 'Passing' : 'Action Required'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              High-Priority Recommendations
            </h3>
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              {[...audit.linkedIn.actionItems, ...audit.gitHub.actionItems].length === 0 ? (
                <div className="text-center py-6 text-emerald-400 flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <p className="text-xs font-medium">All screener audits passing! Profile in top percentile.</p>
                </div>
              ) : (
                [...audit.linkedIn.actionItems, ...audit.gitHub.actionItems].slice(0, 5).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-text bg-background/50 p-3 rounded-lg border border-border">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Pro Recruiter Tip
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Technical recruiters spend ~12 seconds scanning candidate public links. Live Vercel/Render demos and
                quantified headline metrics increase outreach response rates by 2.4x.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: LinkedIn Audit */}
      {activeTab === 'linkedin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs Column */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <LinkedInIcon className="w-4 h-4 text-blue-400" /> LinkedIn Profile Content
            </h3>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Software Engineer | React, TypeScript | Scaled systems"
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">About Section</label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Hook → Shipped Projects → Tech Stack & Call to Action"
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Experience Bullets (Raw Text)</label>
              <textarea
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="- Built API gateway reducing latency by 40%&#10;- Led migration..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="TypeScript, React, PostgreSQL, Docker..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Analysis Column */}
          <div className="space-y-4">
            {/* Headline Breakdown */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Headline Analysis</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    audit.linkedIn.headlineStatus === 'good'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {audit.linkedIn.headlineScore} / 25 pts
                </span>
              </div>
              <p className="text-xs text-text">{audit.linkedIn.headlineCritique}</p>
            </div>

            {/* About 4-Point Rubric */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">About Section Rubric</span>
                <span className="text-xs font-bold text-primary">{audit.linkedIn.aboutScore} / 25 pts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${audit.linkedIn.aboutElements.hasHook ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-background border-border text-text-muted'}`}>
                  {audit.linkedIn.aboutElements.hasHook ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Engaging Hook (Not "Student")</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${audit.linkedIn.aboutElements.hasProofPoints ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-background border-border text-text-muted'}`}>
                  {audit.linkedIn.aboutElements.hasProofPoints ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Quantified Proof Points</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${audit.linkedIn.aboutElements.hasTechStack ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-background border-border text-text-muted'}`}>
                  {audit.linkedIn.aboutElements.hasTechStack ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Clear Tech Stack</span>
                </div>
                <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${audit.linkedIn.aboutElements.hasCallToAction ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-background border-border text-text-muted'}`}>
                  {audit.linkedIn.aboutElements.hasCallToAction ? <Check className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Direct Call To Action</span>
                </div>
              </div>
            </div>

            {/* Experience & Skills Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-border rounded-xl p-4">
                <span className="text-[11px] font-bold text-text-muted uppercase">Experience Metrics</span>
                <div className="text-lg font-bold text-text mt-1">{audit.linkedIn.experienceScore} / 25 pts</div>
                <p className="text-[11px] text-text-muted mt-1 leading-snug">{audit.linkedIn.experienceCritique}</p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <span className="text-[11px] font-bold text-text-muted uppercase">Keyword Density</span>
                <div className="text-lg font-bold text-text mt-1">{audit.linkedIn.skillsScore} / 25 pts</div>
                <p className="text-[11px] text-text-muted mt-1 leading-snug">{audit.linkedIn.skillsCritique}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GitHub Audit */}
      {activeTab === 'github' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GitHub Config */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <GitHubIcon className="w-4 h-4 text-purple-400" /> GitHub Profile Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Commit Velocity</label>
                <select
                  value={commitVelocity}
                  onChange={(e) => setCommitVelocity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                >
                  <option value="daily">Daily Streaks (30 pts)</option>
                  <option value="weekly">Weekly Steady (25 pts)</option>
                  <option value="sporadic">Sporadic Activity (15 pts)</option>
                  <option value="inactive">Inactive / Stale (5 pts)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
              <div>
                <div className="text-xs font-semibold text-text">Profile README Configured</div>
                <div className="text-[11px] text-text-muted">Repository matching username (e.g. {username}/{username})</div>
              </div>
              <input
                type="checkbox"
                checked={hasProfileReadme}
                onChange={(e) => setHasProfileReadme(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
            </div>

            {/* Pinned Repositories List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Pinned Repositories ({pinnedRepos.length})
                </span>
              </div>

              {pinnedRepos.map((repo, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-background space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-primary" /> {repo.name}
                    </span>
                    <button
                      onClick={() => handleRemoveRepo(idx)}
                      className="text-text-muted hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Checkbox Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repo.hasDemoLink}
                        onChange={() => handleToggleRepoProp(idx, 'hasDemoLink')}
                        className="rounded text-primary border-border"
                      />
                      <span className={repo.hasDemoLink ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
                        Live Demo Link
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repo.hasArchitectureDiagram}
                        onChange={() => handleToggleRepoProp(idx, 'hasArchitectureDiagram')}
                        className="rounded text-primary border-border"
                      />
                      <span className={repo.hasArchitectureDiagram ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
                        Architecture Diagram
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repo.hasSetupInstructions}
                        onChange={() => handleToggleRepoProp(idx, 'hasSetupInstructions')}
                        className="rounded text-primary border-border"
                      />
                      <span className={repo.hasSetupInstructions ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
                        Setup Instructions
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={repo.hasTechStackBadges}
                        onChange={() => handleToggleRepoProp(idx, 'hasTechStackBadges')}
                        className="rounded text-primary border-border"
                      />
                      <span className={repo.hasTechStackBadges ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
                        Tech Stack Badges
                      </span>
                    </label>
                  </div>
                </div>
              ))}

              {/* Add New Repo */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. real-time-chat-app"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddRepo}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* GitHub Analysis */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Repository Hygiene Breakdown</span>
                <span className="text-xs font-bold text-purple-400">{audit.gitHub.pinnedReposScore} / 40 pts</span>
              </div>
              <div className="space-y-2">
                {audit.gitHub.readmeSignals.map((signal, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-background flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-text">{signal.repoName}</div>
                      <div className="text-[11px] text-text-muted">
                        Passed: {signal.passedChecks.join(', ') || 'None'}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        signal.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {signal.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Velocity &amp; Consistency</span>
              <p className="text-xs text-text">{audit.gitHub.commitVelocityAdvice}</p>
              <div className="p-3 rounded-lg bg-background border border-border text-xs text-text-muted">
                {audit.gitHub.profileReadmeRecommendation}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProfileCheckPage;
