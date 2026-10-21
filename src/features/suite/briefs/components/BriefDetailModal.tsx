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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-surface border border-border rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden focus:outline-none"
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b border-border rounded-t-2xl shrink-0 ${dc.bg}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${dc.bg} ${dc.text} ${dc.border}`}>
                  {brief.domain}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${DIFFICULTY_BADGE[brief.difficulty]}`}>
                  {brief.difficulty}
                </span>
                <span className="text-[10px] font-semibold text-text-muted flex items-center gap-1" title={getBriefHoursRange(brief).assumption}>
                  <Clock className="w-3 h-3" /> {getBriefHoursRange(brief).label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-text leading-snug">{brief.title}</h2>
              <p className="text-[11px] text-text-muted mt-0.5 italic">{getBriefHoursRange(brief).assumption}</p>
            </div>

            {/* Navigation & Close Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:border-primary/40 hover:bg-surface-elevated transition-all cursor-pointer shadow-xs"
                title="Back to all briefs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:border-primary/40 hover:bg-surface-elevated transition-all cursor-pointer shadow-xs"
                title="Go Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <button
                id={`modal-close-${brief.id}`}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface border border-border text-text-muted hover:text-text hover:border-primary/40 hover:bg-surface-elevated transition-all cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface/80 border border-border hover:border-primary/40 text-text-muted hover:text-text transition-all cursor-pointer"
              title="Copy complete brief to clipboard"
            >
              {copiedFull ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFull ? 'Copied!' : 'Copy Full Brief'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface/80 border border-border hover:border-primary/40 text-text-muted hover:text-text transition-all cursor-pointer"
              title="Download as .txt file"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
            <button
              onClick={() => onToggleSave(brief.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface/80 border-border text-text-muted hover:border-primary/40 hover:text-text'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isSaved ? 'In Build Plan' : 'Add to Plan'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin relative focus:outline-none"
        >
          {/* Problem Statement */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <AlertCircle className="w-3.5 h-3.5 text-primary" /> Problem Statement
            </h3>
            <p className="text-sm text-text leading-relaxed bg-background/60 p-4 rounded-xl border border-border">
              {brief.problemStatement}
            </p>
          </section>

          {/* Use Cases */}
          {brief.useCases && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Real-World Use Cases
              </h3>
              <p className="text-sm text-text leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                {brief.useCases}
              </p>
            </section>
          )}

          {/* Competency Reducer */}
          {brief.problemItSolves && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Why This Reduces Competency Gap
              </h3>
              <p className="text-sm text-text leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                {brief.problemItSolves}
              </p>
            </section>
          )}

          {/* What this project demonstrates */}
          {brief.recruiterSignal && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <TrendingUp className="w-3.5 h-3.5 text-violet-400" /> What this project demonstrates
              </h3>
              <p className="text-sm text-text leading-relaxed bg-violet-500/5 p-4 rounded-xl border border-violet-500/20">
                {brief.recruiterSignal}
              </p>
            </section>
          )}

          {/* Architecture */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Architecture & Data Flow
            </h3>
            <p className="text-sm text-text leading-relaxed bg-background/60 p-4 rounded-xl border border-border">
              {brief.architecture}
            </p>
          </section>

          {/* Scale Targets */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Target className="w-3.5 h-3.5 text-amber-400" /> Scale & Performance Targets
            </h3>
            <div className="text-sm font-medium bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-300 leading-relaxed">
              {brief.scaleTargets}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Terminal className="w-3.5 h-3.5 text-text-muted" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {brief.techStack.map((tech, i) => (
                <span key={i} className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${dc.bg} ${dc.text} ${dc.border}`}>
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* Verification Rubric */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Screener Verification Rubric
            </h3>
            <div className="space-y-2">
              {brief.verificationRubric.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-text bg-background/50 p-3 rounded-lg border border-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio Bullet Formula */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                <Terminal className="w-3.5 h-3.5 text-primary" /> Resume Bullet Formula
              </h3>
              <button
                onClick={handleCopyBullet}
                className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedBullet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedBullet ? 'Copied!' : 'Copy Bullet'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-background border border-primary/20 font-mono text-sm text-text leading-relaxed">
              "{brief.portfolioBulletFormula}"
            </div>
          </section>

          {/* Covered Skills */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Skills Demonstrated</h3>
            <div className="flex flex-wrap gap-1.5">
              {brief.coveredSkills.map((skill, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-text-muted font-medium">
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
                className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-surface border border-border shadow-xl text-xs font-bold text-text flex items-center gap-1.5 hover:border-primary/50 hover:bg-surface-elevated transition-all hover:scale-105 cursor-pointer"
                title="Scroll back to top of brief"
              >
                <ArrowUp className="w-3.5 h-3.5 text-primary" />
                <span>Back to Top</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border flex items-center justify-between gap-3 rounded-b-2xl bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-surface-elevated hover:bg-border text-text transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Project Briefs
            </button>
            <button
              onClick={() => { onClose(); navigate('/'); }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-surface-elevated hover:bg-border text-text transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-surface-elevated hover:bg-border text-text transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Brief
            </button>
            <button
              onClick={() => { onToggleSave(brief.id); onClose(); }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-primary hover:opacity-90 text-surface transition-all cursor-pointer"
            >
              {isSaved ? 'Remove from Build Plan' : '+ Add to My Build Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
