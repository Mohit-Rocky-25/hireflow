import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUp,
  Home,
  Clock,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Target,
  Code2,
  Terminal,
  ShieldCheck,
  X,
  Download,
  Zap,
  TrendingUp,
  AlertCircle,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { ProjectBrief, getBriefHoursRange } from '../bundleBriefs';
import { domainColor, DIFFICULTY_BADGE, buildBriefText } from './briefHelpers';

export function BriefDetailModal({
  brief,
  onClose,
  isSaved,
  onToggleSave,
}: {
  brief: ProjectBrief;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const navigate = useNavigate();
  const [copiedBullet, setCopiedBullet] = useState(false);
  const [copiedFull, setCopiedFull]     = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const dc = domainColor(brief.domain);

  const bodyRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleCopyBullet = () => {
    navigator.clipboard.writeText(brief.portfolioBulletFormula);
    setCopiedBullet(true);
    setTimeout(() => setCopiedBullet(false), 2200);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(buildBriefText(brief));
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2200);
  };

  const handleDownload = () => {
    const blob = new Blob([buildBriefText(brief)], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `brief-${brief.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Guaranteed scroll to the very top on open & whenever brief changes
  useLayoutEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [brief.id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus modal container so browser doesn't scroll to bottom buttons
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 220);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-near-black border border-charcoal rounded-lg max-w-3xl w-full shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden focus:outline-none"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-charcoal rounded-t-lg shrink-0 bg-black">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${dc.bg} ${dc.text} ${dc.border}`}>
                  {brief.domain}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${DIFFICULTY_BADGE[brief.difficulty]}`}>
                  {brief.difficulty}
                </span>
                <span className="text-[10px] font-semibold text-silver flex items-center gap-1" title={getBriefHoursRange(brief).assumption}>
                  <Clock className="w-3 h-3 text-silver" /> {getBriefHoursRange(brief).label}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-950/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Evidence: Verified
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-charcoal text-silver bg-black">
                  Zero INR Cost · 100% Local Run
                </span>
              </div>
              <h2 className="text-xl font-black text-white leading-snug">{brief.title}</h2>
              <p className="text-[11px] text-silver mt-0.5 italic">{getBriefHoursRange(brief).assumption}</p>
            </div>

            {/* Navigation & Close Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-near-black border border-charcoal text-silver hover:text-white hover:border-volt hover:bg-hover-gray transition-colors cursor-pointer"
                title="Back to all briefs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-near-black border border-charcoal text-silver hover:text-white hover:border-volt hover:bg-hover-gray transition-colors cursor-pointer"
                title="Go Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                id={`modal-close-${brief.id}`}
                onClick={onClose}
                className="w-8 h-8 rounded flex items-center justify-center bg-near-black border border-charcoal text-silver hover:text-white hover:border-volt hover:bg-hover-gray transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-black border border-charcoal hover:border-volt text-silver hover:text-white transition-colors cursor-pointer"
              title="Copy complete brief to clipboard"
            >
              {copiedFull ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFull ? 'Copied!' : 'Copy Full Brief'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-black border border-charcoal hover:border-volt text-silver hover:text-white transition-colors cursor-pointer"
              title="Download as .txt file"
            >
              <Download className="w-3.5 h-3.5 text-silver" />
              Download .txt
            </button>
            <button
              onClick={() => onToggleSave(brief.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-near-black border-volt text-volt'
                  : 'bg-black border-charcoal text-silver hover:border-volt hover:text-white'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-volt" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isSaved ? 'In Build Plan' : 'Add to Plan'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 relative focus:outline-none bg-near-black"
        >
          {/* Problem Statement */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-volt">
              <AlertCircle className="w-3.5 h-3.5 text-volt" /> Problem Statement
            </h3>
            <p className="text-sm text-silver leading-relaxed bg-black p-4 rounded border border-charcoal">
              {brief.problemStatement}
            </p>
          </section>

          {/* Use Cases */}
          {brief.useCases && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-volt">
                <Globe className="w-3.5 h-3.5 text-volt" /> Real-World Use Cases
              </h3>
              <p className="text-sm text-silver leading-relaxed bg-black p-4 rounded border border-charcoal">
                {brief.useCases}
              </p>
            </section>
          )}

          {/* Competency Reducer */}
          {brief.problemItSolves && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pale-yellow">
                <Zap className="w-3.5 h-3.5 text-pale-yellow" /> Why This Reduces Competency Gap
              </h3>
              <p className="text-sm text-silver leading-relaxed bg-black p-4 rounded border border-charcoal">
                {brief.problemItSolves}
              </p>
            </section>
          )}

          {/* What this project demonstrates */}
          {brief.recruiterSignal && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-volt">
                <TrendingUp className="w-3.5 h-3.5 text-volt" /> What this project demonstrates
              </h3>
              <p className="text-sm text-silver leading-relaxed bg-black p-4 rounded border border-charcoal">
                {brief.recruiterSignal}
              </p>
            </section>
          )}

          {/* Architecture */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Code2 className="w-3.5 h-3.5 text-volt" /> Architecture & Data Flow
            </h3>
            <p className="text-sm text-silver leading-relaxed bg-black p-4 rounded border border-charcoal">
              {brief.architecture}
            </p>
          </section>

          {/* Scale Targets */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pale-yellow">
              <Target className="w-3.5 h-3.5 text-pale-yellow" /> Scale & Performance Targets
            </h3>
            <div className="text-sm font-mono bg-black border border-olive-border p-4 rounded text-pale-yellow leading-relaxed">
              {brief.scaleTargets}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <Terminal className="w-3.5 h-3.5 text-silver" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.map((tech, i) => (
                <span key={i} className={`text-xs font-bold px-2.5 py-1 rounded border ${dc.bg} ${dc.text} ${dc.border}`}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Automated Verification Kit */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-volt">
              <Terminal className="w-3.5 h-3.5 text-volt" /> Automated Verification Kit & Harness
            </h3>
            <div className="p-3 bg-black rounded border border-charcoal text-xs text-silver font-mono space-y-1">
              <div><span className="text-volt font-bold">Runner:</span> node tests/fixtures/briefs-kits/{brief.id}/verify.mjs</div>
              <div><span className="text-volt font-bold">Checks:</span> {brief.verificationRubric.length} mapped acceptance assertions</div>
              <div><span className="text-volt font-bold">Mutations:</span> 2 deliberate failure self-tests passed (Golden PASS, Mutations FAIL)</div>
            </div>
          </section>

          {/* Verification Rubric */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-volt">
              <ShieldCheck className="w-3.5 h-3.5 text-volt" /> Screener Verification Rubric
            </h3>
            <div className="space-y-2">
              {brief.verificationRubric.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-silver bg-black p-3 rounded border border-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Bullet Formula */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <Terminal className="w-3.5 h-3.5 text-volt" /> Resume Bullet Formula
              </h3>
              <button
                onClick={handleCopyBullet}
                className="text-xs text-volt hover:underline flex items-center gap-1 transition-colors cursor-pointer font-bold"
              >
                {copiedBullet ? <Check className="w-3 h-3 text-volt" /> : <Copy className="w-3 h-3" />}
                {copiedBullet ? 'Copied!' : 'Copy Bullet'}
              </button>
            </div>
            <div className="p-4 rounded bg-black border border-charcoal font-mono text-sm text-volt leading-relaxed">
              &quot;{brief.portfolioBulletFormula}&quot;
            </div>
          </section>

          {/* Covered Skills */}
          <section className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-silver">Skills Demonstrated</h3>
            <div className="flex flex-wrap gap-1.5">
              {brief.coveredSkills.map((skill, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-black border border-charcoal text-silver font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Floating Back to Top Button */}
          {showScrollTop && (
            <div className="sticky bottom-2 flex justify-end z-20 pointer-events-none">
              <button
                type="button"
                onClick={() => bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black border border-charcoal shadow-xl text-xs font-bold text-silver hover:text-volt hover:border-volt transition-colors cursor-pointer"
                title="Scroll back to top of brief"
              >
                <ArrowUp className="w-3.5 h-3.5 text-volt" />
                <span>Back to Top</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-charcoal flex items-center justify-between gap-3 rounded-b-lg bg-black shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded border border-charcoal bg-near-black hover:bg-hover-gray text-silver hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Briefs
            </button>
            <button
              onClick={() => { onClose(); navigate('/'); }}
              className="px-3 py-2 text-xs font-bold rounded border border-charcoal bg-near-black hover:bg-hover-gray text-silver hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded border border-charcoal bg-near-black hover:bg-hover-gray text-silver hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-silver" /> Download Brief
            </button>
            <button
              onClick={() => { onToggleSave(brief.id); onClose(); }}
              className="px-4 py-2 text-xs font-black rounded bg-volt hover:bg-[#1d1d1d] text-[#151515] hover:text-white border border-volt transition-colors cursor-pointer"
            >
              {isSaved ? 'Remove from Build Plan' : '+ Add to My Build Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
