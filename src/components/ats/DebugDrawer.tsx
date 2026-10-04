import React, { useState } from 'react';
import { Terminal, X, Copy, Check, ChevronRight, ChevronDown } from 'lucide-react';
import { AnalysisResponse } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse | null;
}

type DebugTab = 'resume' | 'jd' | 'judgments' | 'math';

export const DebugDrawer: React.FC<Props> = ({ data }) => {
  // Visible ONLY when import.meta.env.DEV
  if (!import.meta.env.DEV || !data) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DebugTab>('math');
  const [copied, setCopied] = useState(false);

  const { facts, passA, passB, debugMath } = data;

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getContent = () => {
    switch (activeTab) {
      case 'resume':
        return JSON.stringify(passA?.resume || facts.resume, null, 2);
      case 'jd':
        return JSON.stringify(passA?.jd || facts.jd, null, 2);
      case 'judgments':
        return JSON.stringify(passB || facts.skillMatches, null, 2);
      case 'math':
        return JSON.stringify(
          debugMath || {
            scoreBreakdown: facts.scoreBreakdown,
            effectiveWeights: facts.scoreBreakdown.effectiveWeights,
            seniorityFit: facts.seniorityFit,
            marketTier: facts.marketPositioning.bestFitTier,
          },
          null,
          2
        );
      default:
        return '';
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-mono font-bold px-3 py-2 rounded-lg shadow-lg border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>[DEV] Debug Drawer</span>
        </button>
      </div>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-950 text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-mono font-bold tracking-tight text-white">
                  ATS Engine Debug Inspection
                </h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                  Score: {facts.scoreBreakdown.finalScore}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(getContent())}
                  className="text-xs text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Copy active JSON"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 text-xs font-mono">
              {(
                [
                  { id: 'math', label: '1. Score Math' },
                  { id: 'resume', label: '2. Parsed Resume JSON' },
                  { id: 'jd', label: '3. JD Requirements JSON' },
                  { id: 'judgments', label: '4. Judgments' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3 border-b-2 font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Content Area */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300">
              <pre className="p-3 bg-slate-900/90 rounded border border-slate-800/80 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
                {getContent()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
