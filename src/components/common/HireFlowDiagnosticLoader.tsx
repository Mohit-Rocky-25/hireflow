// ============================================================
// HireFlow — Premium Placement & Diagnostic Loading Experience
// Light & Bright aesthetic with luminous tech stacks, glassmorphism,
// multi-stage verification stepper, and tactile Pebble audio chimes
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  GraduationCap,
  ShieldCheck,
  Volume2,
  VolumeX,
  Building2,
  Briefcase,
  Zap,
} from 'lucide-react';
import { playPebble, toggleMute, isMuted } from '../../lib/audio/pebble';

export interface DiagnosticStage {
  id: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
  activeColor: string;
}

export interface HireFlowDiagnosticLoaderProps {
  companyName: string;
  roleTitle: string;
  roleLevel?: string;
  competencies?: string[];
  onComplete: () => void;
  speedMs?: number;
}

const DEFAULT_TECH_STACKS = [
  { name: 'React 19', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300' },
  { name: 'TypeScript', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  { name: 'Spring Boot', color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  { name: 'FastAPI', color: 'from-teal-400 to-emerald-500', bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' },
  { name: 'AWS Cloud', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  { name: 'Docker & K8s', color: 'from-sky-400 to-blue-600', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' },
  { name: 'PostgreSQL', color: 'from-indigo-400 to-violet-600', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' },
  { name: 'Redis Caching', color: 'from-rose-400 to-red-600', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' },
  { name: 'Distributed Systems', color: 'from-purple-400 to-pink-500', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' },
  { name: 'DSA & Complexity', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
];

export function HireFlowDiagnosticLoader({
  companyName,
  roleTitle,
  roleLevel = 'Engineering',
  competencies = [],
  onComplete,
  speedMs = 1600,
}: HireFlowDiagnosticLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(8);
  const [muted, setMutedState] = useState(isMuted());
  const hasFinishedRef = useRef(false);

  const stages: DiagnosticStage[] = [
    {
      id: 'ledger',
      title: 'Parsing Fact Ledger & Tech Stacks',
      detail: 'Scanning verified candidate claims, demonstrated languages, and libraries...',
      icon: <Cpu className="w-4 h-4" />,
      activeColor: 'text-cyan-600 dark:text-cyan-400 border-cyan-400',
    },
    {
      id: 'cutoffs',
      title: 'Auditing Corporate Cutoff Gates',
      detail: `Verifying academic eligibility, CGPA, graduation year, and ${companyName} tier standards...`,
      icon: <GraduationCap className="w-4 h-4" />,
      activeColor: 'text-amber-600 dark:text-amber-400 border-amber-400',
    },
    {
      id: 'rigor',
      title: 'Evaluating Production Rigor & Metrics',
      detail: 'Auditing scale, latency improvements, unit test suites, and architectural ownership...',
      icon: <Layers className="w-4 h-4" />,
      activeColor: 'text-indigo-600 dark:text-indigo-400 border-indigo-400',
    },
    {
      id: 'alignment',
      title: 'Synthesizing Placement Readiness',
      detail: 'Finalizing deterministic JD Alignment Index & corporate hiring benchmark...',
      icon: <ShieldCheck className="w-4 h-4" />,
      activeColor: 'text-emerald-600 dark:text-emerald-400 border-emerald-400',
    },
  ];

  // Resolve display tech stacks from props or defaults
  const displayTechStacks =
    competencies.length > 0
      ? competencies.map((c, i) => {
          const match = DEFAULT_TECH_STACKS.find((s) => s.name.toLowerCase().includes(c.toLowerCase()));
          return {
            name: c.toUpperCase(),
            color: match?.color || 'from-emerald-400 to-sky-500',
            bg: match?.bg || 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
          };
        })
      : DEFAULT_TECH_STACKS.slice(0, 7);

  // Sound handler
  const handleToggleMute = () => {
    const next = toggleMute();
    setMutedState(next);
  };

  useEffect(() => {
    // Initial entrance pebble chime
    playPebble();

    const stepInterval = speedMs / stages.length;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < stages.length) {
          playPebble(); // Trigger pebble sound at each stage
          setProgressPercent(Math.round(((next + 1) / stages.length) * 92));
          return next;
        } else {
          clearInterval(timer);
          setProgressPercent(100);
          playPebble(); // Final confirmation chime
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true;
            setTimeout(() => {
              onComplete();
            }, 320);
          }
          return prev;
        }
      });
    }, stepInterval);

    return () => clearInterval(timer);
  }, [speedMs, stages.length, onComplete]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="HireFlow Placement Diagnostic in progress"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
    >
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl" />
      </div>

      {/* Main Glassmorphic Modal Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/60 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(16,185,129,0.3)] backdrop-blur-2xl p-6 sm:p-8 space-y-6">
        {/* Top Header Pill & Audio Controls */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-purple-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-black tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
            <span>HireFlow Placement Simulator</span>
          </div>

          <button
            type="button"
            onClick={handleToggleMute}
            title={muted ? 'Unmute haptic pebble audio' : 'Mute audio chimes'}
            aria-label={muted ? 'Unmute haptic pebble audio' : 'Mute audio chimes'}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
          </button>
        </div>

        {/* Company & Role Spotlight Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-emerald-50/30 to-sky-50/40 dark:from-slate-800/70 dark:via-emerald-950/20 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              {companyName ? companyName[0] : 'H'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">{companyName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase">
                  {roleLevel}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{roleTitle}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Diagnostic</span>
            <span className="font-mono font-black text-2xl text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Circular Progress & Visual Core */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          {/* Radial Ring */}
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-emerald-500 transition-all duration-300 ease-out"
                strokeWidth="8"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Live</span>
            </div>
          </div>

          {/* Active Diagnostic Detail */}
          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              {stages[currentStep]?.icon}
              <span>Stage {currentStep + 1} of 4</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              {stages[currentStep]?.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {stages[currentStep]?.detail}
            </p>
          </div>
        </div>

        {/* Linear Stage Progress Dots */}
        <div className="grid grid-cols-4 gap-2">
          {stages.map((stage, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={stage.id} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-emerald-400 to-sky-500 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <span className="block text-[10px] font-bold text-slate-400 truncate text-center">
                  {stage.id.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tech Stacks Orbit Showcase */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Evaluating Target Tech Stacks
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Verified Evidence Only
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {displayTechStacks.map((tech, idx) => {
              const isHighlight = idx % 2 === currentStep % 2;
              return (
                <div
                  key={tech.name}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all duration-300 ${
                    isHighlight
                      ? `${tech.bg} border-emerald-500/40 shadow-sm scale-105`
                      : 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Trust Guarantee Badge */}
        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-medium text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Deterministic Client-Side Analysis &bull; Zero Server Egress</span>
        </div>
      </div>
    </div>
  );
}
