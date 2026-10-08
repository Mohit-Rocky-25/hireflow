// ============================================================
// Suite UI — Evidence Card Builder (/tools/evidence-card)
// Decision Group: "Connecting HireFlow's Roles"
// Privacy-minimal verifiable evidence card generator with
// client-side compression, fragment URL encoding, and SHA-256 hashing.
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  Calendar,
  Lock,
  Eye,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useProfile } from '../profile/ProfileContext';
import {
  encodeCard,
  CardDataPayload,
  CardSkillEntry,
} from './cardCodec';

export function EvidenceCardBuilderPage() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Basic info (privacy-minimal defaults)
  const [name, setName] = useState<string>(profile?.identity?.name || 'Arjun Mehta');
  const roleTitle = profile?.roles[0]?.title;
  const [headline, setHeadline] = useState<string>(
    roleTitle
      ? `${roleTitle} | Distributed Systems & Backend`
      : 'Full Stack Engineer | React, Node.js, Go'
  );
  const [targetRoleFit, setTargetRoleFit] = useState<string>(
    'Strong match for Software Engineer (Platform / Backend) roles requiring hands-on concurrency and event-driven architectures.'
  );

  // Selected Skills with Evidence Levels
  const [availableSkills, setAvailableSkills] = useState<CardSkillEntry[]>([
    { name: 'TypeScript', evidenceLevel: 4, quote: 'Built high-throughput API gateway with 92% test coverage' },
    { name: 'Go', evidenceLevel: 3, quote: 'Engineered rate limiter in Go sustaining 25k req/sec' },
    { name: 'Redis', evidenceLevel: 3, quote: 'Atomic Lua scripts for sliding-window caching' },
    { name: 'PostgreSQL', evidenceLevel: 2, quote: 'Designed double-entry ledger schemas' },
    { name: 'Docker', evidenceLevel: 2, quote: 'Multi-stage Docker containers with non-root security' },
    { name: 'Kafka', evidenceLevel: 2, quote: 'Event streaming ingestion pipelines' },
  ]);

  const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>([
    'TypeScript',
    'Go',
    'Redis',
    'PostgreSQL',
    'Docker',
  ]);

  // Selected Evidence Snippets (Up to 3)
  const [snippets, setSnippets] = useState<string[]>([
    'Built high-throughput API gateway reducing p95 latency by 40% across 50k req/min.',
    'Engineered distributed rate limiting proxy in Go & Redis using atomic Lua scripts under 25k RPS load.',
    'Led migration of 8 microservices to Docker/Kubernetes with zero downtime.',
  ]);

  // Opt-in PII (strictly OFF by default)
  const [includeEmail, setIncludeEmail] = useState<boolean>(false);
  const [emailVal, setEmailVal] = useState<string>(profile?.identity?.email || 'arjun.mehta@example.com');
  const [includePhone, setIncludePhone] = useState<boolean>(false);
  const [phoneVal, setPhoneVal] = useState<string>(profile?.identity?.phone || '+91 98765 43210');
  const [includeLinks, setIncludeLinks] = useState<boolean>(false);
  const [includeEducation, setIncludeEducation] = useState<boolean>(false);
  const [educationVal, setEducationVal] = useState<string>('B.Tech in Computer Science, 2024');

  // Expiry
  const [expiryDays, setExpiryDays] = useState<number>(30); // 7, 30, 90, 0 (never)

  // Encoding State
  const [encodedUrl, setEncodedUrl] = useState<string>('');
  const [isTrimmed, setIsTrimmed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Prefill from candidate profile if available
  useEffect(() => {
    if (profile) {
      if (profile.identity?.name) setName(profile.identity.name);
      if (profile.roles[0]?.title) setHeadline(`${profile.roles[0].title} | Software Engineer`);
      if (profile.skills.length > 0) {
        const mapped = profile.skills.map((s) => ({
          name: s.displayName,
          evidenceLevel: s.evidenceLevel,
          quote: s.evidence[0]?.text,
        }));
        setAvailableSkills(mapped);
        setSelectedSkillNames(mapped.slice(0, 6).map((m) => m.name));
      }
      if (profile.projects.length > 0) {
        const bullets = profile.projects.flatMap((p) => p.bullets).slice(0, 3);
        if (bullets.length > 0) setSnippets(bullets);
      }
    }
  }, [profile]);

  // Re-encode card whenever parameters change
  useEffect(() => {
    let isCancelled = false;

    async function generateCard() {
      const activeSkills = availableSkills.filter((s) => selectedSkillNames.includes(s.name));

      const payload: CardDataPayload = {
        name,
        headline,
        targetRoleFit,
        skills: activeSkills,
        evidenceSnippets: snippets.filter((s) => s.trim().length > 0).slice(0, 3),
      };

      if (includeEmail && emailVal) payload.email = emailVal;
      if (includePhone && phoneVal) payload.phone = phoneVal;
      if (includeEducation && educationVal) payload.education = educationVal;
      if (includeLinks && profile?.identity?.links) {
        payload.links = profile.identity.links;
      }

      let expiresAt: string | undefined = undefined;
      if (expiryDays > 0) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + expiryDays);
        expiresAt = expDate.toISOString();
      }

      const res = await encodeCard(payload, expiresAt);
      if (!isCancelled) {
        const origin = window.location.origin;
        setEncodedUrl(`${origin}/card#d=${res.encodedString}`);
        setIsTrimmed(res.trimmed);
      }
    }

    generateCard();
    return () => {
      isCancelled = true;
    };
  }, [
    name,
    headline,
    targetRoleFit,
    availableSkills,
    selectedSkillNames,
    snippets,
    includeEmail,
    emailVal,
    includePhone,
    phoneVal,
    includeLinks,
    includeEducation,
    educationVal,
    expiryDays,
    profile,
  ]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(encodedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const activeSkills = availableSkills.filter((s) => selectedSkillNames.includes(s.name));
    const payload: CardDataPayload = {
      name,
      headline,
      targetRoleFit,
      skills: activeSkills,
      evidenceSnippets: snippets.filter((s) => s.trim().length > 0).slice(0, 3),
    };
    if (includeEmail && emailVal) payload.email = emailVal;
    if (includePhone && phoneVal) payload.phone = phoneVal;
    if (includeEducation && educationVal) payload.education = educationVal;

    const exportObj = {
      v: 1,
      createdAt: new Date().toISOString(),
      expiresAt: expiryDays > 0 ? new Date(Date.now() + expiryDays * 86400000).toISOString() : undefined,
      data: payload,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-card-${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data) {
          if (parsed.data.name) setName(parsed.data.name);
          if (parsed.data.headline) setHeadline(parsed.data.headline);
          if (parsed.data.targetRoleFit) setTargetRoleFit(parsed.data.targetRoleFit);
          if (parsed.data.skills) {
            setAvailableSkills(parsed.data.skills);
            setSelectedSkillNames(parsed.data.skills.map((s: any) => s.name));
          }
          if (parsed.data.evidenceSnippets) setSnippets(parsed.data.evidenceSnippets);
        }
      } catch {
        alert('Invalid Evidence Card JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Link to="/tools" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Tools Hub
            </Link>
            <span>/</span>
            <span className="text-secondary font-medium">Evidence Card</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Verifiable Evidence Card Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Stage 7.1
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Decision Group: <strong className="text-text">"Connecting HireFlow's Roles"</strong> — Share proof of
            work directly with recruiters without sending a static PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import Card (.json)
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download (.json)
          </button>
        </div>
      </div>

      {/* Irrevocable Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>Privacy Notice:</strong> Generated links cannot be revoked once shared. All verified skills and
          proof are compressed into the URL fragment and never uploaded to any server. Share only what you are
          comfortable with.
        </div>
      </div>

      {/* Grid: Config Panel vs Generated Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Card Details &amp; Claims
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Target Role Fit Summary</label>
            <textarea
              rows={2}
              value={targetRoleFit}
              onChange={(e) => setTargetRoleFit(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary resize-y"
            />
          </div>

          {/* Selectable Skills with Evidence Levels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Skills to Include ({selectedSkillNames.length} selected)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableSkills.map((skill) => {
                const isSelected = selectedSkillNames.includes(skill.name);
                return (
                  <div
                    key={skill.name}
                    onClick={() => {
                      setSelectedSkillNames(
                        isSelected
                          ? selectedSkillNames.filter((n) => n !== skill.name)
                          : [...selectedSkillNames, skill.name]
                      );
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-primary/5 border-primary/40 text-text'
                        : 'bg-background/50 border-border text-text-muted opacity-60'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{skill.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-primary/10 text-primary">
                          Level {skill.evidenceLevel}
                        </span>
                      </div>
                      {skill.quote && (
                        <p className="text-[11px] text-text-muted mt-1 italic line-clamp-1">
                          "{skill.quote}"
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-primary border-border mt-0.5"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence Snippets (Up to 3) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Top 3 Verbatim Proof Points
            </span>
            {snippets.map((snip, idx) => (
              <div key={idx}>
                <label className="block text-[11px] text-text-muted mb-1">Snippet #{idx + 1}</label>
                <input
                  type="text"
                  value={snip}
                  onChange={(e) => {
                    const copy = [...snippets];
                    copy[idx] = e.target.value;
                    setSnippets(copy);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary font-mono text-[11px]"
                />
              </div>
            ))}
          </div>

          {/* Privacy & Opt-in Toggles */}
          <div className="space-y-3 pt-4 border-t border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              Optional Opt-In Contact Details (OFF by default)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-background/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEmail}
                  onChange={(e) => setIncludeEmail(e.target.checked)}
                  className="rounded text-primary border-border"
                />
                <div>
                  <span className="font-semibold text-text">Include Email</span>
                  <span className="block text-[11px] text-text-muted">{emailVal}</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-background/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePhone}
                  onChange={(e) => setIncludePhone(e.target.checked)}
                  className="rounded text-primary border-border"
                />
                <div>
                  <span className="font-semibold text-text">Include Phone</span>
                  <span className="block text-[11px] text-text-muted">{phoneVal}</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-background/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeEducation}
                  onChange={(e) => setIncludeEducation(e.target.checked)}
                  className="rounded text-primary border-border"
                />
                <div>
                  <span className="font-semibold text-text">Include Education</span>
                  <span className="block text-[11px] text-text-muted">{educationVal}</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-background/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLinks}
                  onChange={(e) => setIncludeLinks(e.target.checked)}
                  className="rounded text-primary border-border"
                />
                <div>
                  <span className="font-semibold text-text">Include Public Links</span>
                  <span className="block text-[11px] text-text-muted">GitHub, LinkedIn, Portfolio</span>
                </div>
              </label>
            </div>
          </div>

          {/* Expiry Selector */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-text-muted mb-1">Link Expiry Period</label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value, 10))}
              className="px-3 py-2 text-xs rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
            >
              <option value={7}>Expires in 7 days</option>
              <option value={30}>Expires in 30 days (Recommended)</option>
              <option value={90}>Expires in 90 days</option>
              <option value={0}>No expiry (Permanent until overwritten)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Generated Link & Share Card */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" /> Shareable URL
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SHA-256 Protected
              </span>
            </div>

            {isTrimmed && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <strong>Notice:</strong> To stay within the safe 6,000 character URL limit, lower-evidence skills
                were trimmed. Full details remain available in the exported .json file.
              </div>
            )}

            <div className="p-3 rounded-lg bg-background border border-border font-mono text-[11px] text-text-muted break-all max-h-36 overflow-y-auto">
              {encodedUrl}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-surface text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Link Copied!' : 'Copy Evidence Link'}
              </button>

              <a
                href={encodedUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-border bg-surface-elevated hover:bg-border text-text transition-colors"
                title="Preview Card in Viewer"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>

            <div className="text-[11px] text-text-muted space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Server Storage: Pure client-side hash fragment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-text-muted" />
                <span>Recruiter &amp; Interviewer verified via SHA-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EvidenceCardBuilderPage;
