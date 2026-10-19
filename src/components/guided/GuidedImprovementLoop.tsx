/**
 * HireFlow v4: Guided Improvement Loop (A2)
 * 5-step guided cycle: Scan -> Pick top gaps -> Bridge via Brief/Credential ->
 * Add user-entered accomplishments -> Re-scan with Before/After delta report.
 */

import React, { useState } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useScanHistoryStore } from '../../store/scanHistoryStore';
import { GapItem } from '../../lib/gaps/gapList';
import { Tag } from '../common/Tag';
import { toast } from '../ui/Toast';
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  PlusCircle,
  RotateCw,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export interface BeforeAfterReport {
  previousScore: number;
  newScore: number;
  scoreDelta: number;
  gapsClosed: string[];
  skillsImproved: string[];
}

export interface GuidedImprovementLoopProps {
  currentScanId?: string;
  targetLabel: string;
  targetHash: string;
  gaps: GapItem[];
  onTriggerRescan: () => Promise<BeforeAfterReport | null>;
}

export function GuidedImprovementLoop({
  currentScanId,
  targetLabel,
  targetHash,
  gaps,
  onTriggerRescan,
}: GuidedImprovementLoopProps) {
  const [activeStep, setActiveStep] = useState<number>(2); // Step 1 is Scan (Done)
  const [selectedGaps, setSelectedGaps] = useState<string[]>(
    gaps.slice(0, 3).map((g) => g.skillId)
  );

  // Form state for "Add what you really did"
  const [entryType, setEntryType] = useState<'project' | 'internship' | 'certification'>('project');
  const [title, setTitle] = useState('');
  const [techUsed, setTechUsed] = useState<string[]>([]);
  const [customTechInput, setCustomTechInput] = useState('');
  const [bulletText, setBulletText] = useState('');

  // Rescan state
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanReport, setRescanReport] = useState<BeforeAfterReport | null>(null);

  const { activeResume, addResumeVersion } = useProfileStore();

  const topGaps = gaps.slice(0, 5);

  const handleToggleGap = (skillId: string) => {
    setSelectedGaps((prev) => {
      if (prev.includes(skillId)) return prev.filter((id) => id !== skillId);
      if (prev.length >= 3) {
        toast('info', 'You can focus on up to 3 gaps at a time.');
        return prev;
      }
      return [...prev, skillId];
    });
  };

  const handleToggleTechSuggestion = (tech: string) => {
    setTechUsed((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleAddCustomTech = () => {
    if (customTechInput.trim() && !techUsed.includes(customTechInput.trim())) {
      setTechUsed([...techUsed, customTechInput.trim()]);
      setCustomTechInput('');
    }
  };

  const handleSaveAccomplishment = () => {
    if (!title.trim() || !bulletText.trim()) {
      toast('warning', 'Please provide a title and at least one accomplishment bullet.');
      return;
    }

    if (!activeResume) {
      toast('error', 'No active resume found in profile.');
      return;
    }

    // Append new project / internship / certification into ledger non-destructively
    const updatedLedger = { ...activeResume.ledger };
    if (entryType === 'project') {
      const projects = Array.isArray(updatedLedger.projects) ? [...updatedLedger.projects] : [];
      projects.push({
        name: title,
        techStack: techUsed,
        bullets: [bulletText],
        links: [],
      });
      updatedLedger.projects = projects;
    } else if (entryType === 'internship') {
      const experience = Array.isArray(updatedLedger.experience) ? [...updatedLedger.experience] : [];
      experience.push({
        role: title,
        bullets: [bulletText],
      });
      updatedLedger.experience = experience;
    } else {
      const certs = Array.isArray(updatedLedger.certifications) ? [...updatedLedger.certifications] : [];
      certs.push({
        name: title,
        bullets: [bulletText],
      });
      updatedLedger.certifications = certs;
    }

    // Save as new version
    addResumeVersion(
      `${activeResume.label} (+${title.slice(0, 15)})`,
      updatedLedger,
      activeResume.textHash
    );

    toast('success', `Saved ${title} to your resume fact ledger.`);
    setActiveStep(5); // Move to Re-scan step
  };

  const handleRunRescan = async () => {
    setIsRescanning(true);
    try {
      const report = await onTriggerRescan();
      if (report) {
        setRescanReport(report);
        toast('success', 'Re-scan complete! Review your Before/After delta below.');
      } else {
        toast('info', 'Re-scan completed with no score change.');
      }
    } catch (err: any) {
      toast('error', `Re-scan failed: ${err.message}`);
    } finally {
      setIsRescanning(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">Guided Improvement Loop</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Target: <strong className="text-slate-200">{targetLabel}</strong>
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                s < activeStep
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                  : s === activeStep
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {s < activeStep ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Pick Top Gaps */}
      {activeStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Step 2: Pick Up to 3 Top Gaps to Close</h4>
            <span className="text-xs text-slate-400 font-mono">Selected: {selectedGaps.length}/3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topGaps.map((g) => {
              const isSelected = selectedGaps.includes(g.skillId);
              return (
                <div
                  key={g.skillId}
                  onClick={() => handleToggleGap(g.skillId)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white text-xs">{g.displayName}</span>
                    <div className="mt-1">
                      <Tag variant={g.weightClass === 'mandatory' ? 'danger' : 'warning'} size="sm">
                        {g.weightClass}
                      </Tag>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded flex items-center justify-center border ${
                      isSelected ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && '✓'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={selectedGaps.length === 0}
              onClick={() => setActiveStep(3)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <span>Continue to Action Plan</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Bridge Each Gap */}
      {activeStep === 3 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white">Step 3: Close Selected Gaps with Projects or Credentials</h4>
          <p className="text-xs text-slate-400">
            Choose an official credential or portfolio project designed to demonstrate each missing skill.
          </p>

          <div className="space-y-3">
            {selectedGaps.map((skillId) => {
              const gapItem = gaps.find((g) => g.skillId === skillId);
              return (
                <div key={skillId} className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">{gapItem?.displayName || skillId}</span>
                    <Tag variant="needs-recheck" size="sm">Open Gap</Tag>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href={`/tools/build-briefs?skill=${encodeURIComponent(skillId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 text-emerald-400" />
                      <span>Find matching Build Brief</span>
                    </a>
                    <a
                      href={`/tools/credential-engine?skill=${encodeURIComponent(skillId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 text-sky-400" />
                      <span>Find verified Credential</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <span>I Built It: Add to Resume</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Add What You Really Did (User-entered, Truth Gate grounded) */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Step 4: Record What You Actually Built</h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Never invent statistics. Tick only the technologies you directly implemented. All accomplishments are saved to your resume ledger.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Entry type */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Accomplishment Category</label>
              <div className="inline-flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                {(['project', 'internship', 'certification'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEntryType(type)}
                    className={`rounded px-3 py-1 font-medium capitalize transition-colors ${
                      entryType === type ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Title</label>
              <input
                type="text"
                placeholder={entryType === 'project' ? 'e.g. Distributed Task Queue' : 'e.g. Backend Intern'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Technologies used checklist */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Technologies Used <span className="text-slate-500">(Tick only what you actually coded)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedGaps.map((id) => {
                  const isChecked = techUsed.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleToggleTechSuggestion(id)}
                      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs transition-colors ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 font-semibold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{id}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom tech input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add another tech (e.g. Redis, Docker)..."
                  value={customTechInput}
                  onChange={(e) => setCustomTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTech();
                    }
                  }}
                  className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTech}
                  className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Bullet description */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Accomplishment Bullet <span className="text-slate-500">(Quantify outcomes where honest)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Architected async task processing pipeline handling 5,000 requests/sec with Redis broker..."
                value={bulletText}
                onChange={(e) => setBulletText(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveAccomplishment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Save & Proceed to Re-scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Re-scan with Same Target */}
      {activeStep === 5 && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Step 5: Re-scan with Updated Resume Fact Ledger</h4>
            <p className="mt-1 text-xs text-slate-400">
              Run evaluation against <strong className="text-white">{targetLabel}</strong> to verify if gaps closed and metrics improved.
            </p>
          </div>

          <div className="flex justify-center py-4">
            <button
              type="button"
              disabled={isRescanning}
              onClick={handleRunRescan}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all"
            >
              <RotateCw className={`h-4 w-4 ${isRescanning ? 'animate-spin' : ''}`} />
              <span>{isRescanning ? 'Re-scanning Resume...' : 'Run Targeted Re-scan'}</span>
            </button>
          </div>

          {/* Before/After Delta Report Card */}
          {rescanReport && (
            <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/20 p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <h5 className="text-sm font-semibold text-white">Before vs After Comparison</h5>
                </div>
                <Tag variant={rescanReport.scoreDelta >= 0 ? 'verified' : 'needs-recheck'} size="sm">
                  {rescanReport.scoreDelta >= 0 ? `+${rescanReport.scoreDelta} pts` : `${rescanReport.scoreDelta} pts`}
                </Tag>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-slate-900/60 p-3">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Previous Score</span>
                  <div className="text-2xl font-bold font-mono text-slate-300 mt-1">
                    {rescanReport.previousScore}
                  </div>
                </div>
                <div className="rounded-lg bg-emerald-950/60 border border-emerald-800/60 p-3">
                  <span className="text-[11px] text-emerald-300 uppercase font-medium">New Score</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {rescanReport.newScore}
                  </div>
                </div>
              </div>

              {rescanReport.gapsClosed.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    Gaps Closed in This Re-scan:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {rescanReport.gapsClosed.map((gap) => (
                      <span
                        key={gap}
                        className="inline-flex items-center gap-1 rounded bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-200 border border-emerald-700/40"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>{gap}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>No gaps were closed yet. Ensure the new bullets explicitly match target requirements.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
