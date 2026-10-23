// ============================================================
// Candidate Profile — Drawer (High-Contrast Dark System)
// Compact drawer to inspect, edit, export, and clear local profile
// ============================================================

import React, { useState, useRef } from 'react';
import {
  X,
  User,
  GraduationCap,
  Award,
  Link as LinkIcon,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useProfile } from '../ProfileContext';

export function ProfileDrawer() {
  const {
    profile,
    isDrawerOpen,
    closeDrawer,
    updateProfile,
    clearProfile,
    exportAllData,
    importAllData,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  if (!isDrawerOpen) return null;

  const handleIdentityChange = (field: string, value: string) => {
    if (!profile) return;
    updateProfile({
      ...profile,
      identity: {
        ...profile.identity,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleEducationChange = (field: string, value: string | number) => {
    if (!profile) return;
    const currentEdu = profile.education[0] || {};
    const updatedEdu = { ...currentEdu, [field]: value };
    updateProfile({
      ...profile,
      education: [updatedEdu],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importAllData(content);
        if (!res.ok) {
          alert(`Failed to import data: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your local profile and suite data? This cannot be undone.')) {
      clearProfile();
      closeDrawer();
    }
  };

  const edu = profile?.education[0] || {};
  const skills = profile?.skills || [];
  const filteredSkills = filterLevel === 'all'
    ? skills
    : skills.filter((s) => s.evidenceLevel === filterLevel);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 animate-fade-in">
      <div className="w-full max-w-xl bg-black border-l border-charcoal h-full flex flex-col shadow-level-3 overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-charcoal bg-near-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-black border border-charcoal flex items-center justify-center text-volt">
              <User className="w-4 h-4 stroke-[1.5px]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white uppercase tracking-tight">Candidate Profile</h2>
              <p className="text-xs text-silver">Parsed once, used across all tools</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded text-silver hover:text-volt hover:bg-black transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5 stroke-[1.5px]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!profile ? (
            <div className="text-center py-12 px-4 rounded-lg bg-near-black border border-charcoal border-dashed">
              <FileText className="w-10 h-10 text-silver mx-auto mb-3 stroke-[1.5px]" />
              <h3 className="text-sm font-bold text-white mb-1">No Profile Created Yet</h3>
              <p className="text-xs text-silver max-w-xs mx-auto mb-4">
                Run an ATS scan or TalentLens analysis and click &quot;Save to my profile&quot; to initialize your profile.
              </p>
            </div>
          ) : (
            <>
              {/* Identity Section */}
              <div className="p-4 rounded-lg bg-near-black border border-charcoal space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[1.4px] text-silver">Identity</span>
                  <span className="text-[11px] text-silver/60">Editable</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.identity.name || ''}
                      onChange={(e) => handleIdentityChange('name', e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.identity.email || ''}
                      onChange={(e) => handleIdentityChange('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Phone</label>
                    <input
                      type="text"
                      value={profile.identity.phone || ''}
                      onChange={(e) => handleIdentityChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">City / Location</label>
                    <input
                      type="text"
                      value={profile.identity.city || ''}
                      onChange={(e) => handleIdentityChange('city', e.target.value)}
                      placeholder="Bengaluru, India"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Education & Eligibility Fields */}
              <div className="p-4 rounded-lg bg-near-black border border-charcoal space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[1.4px] text-silver flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Education & Campus Eligibility
                  </span>
                  <span className="text-[11px] text-silver/60">Used for eligibility</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">CGPA / GPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={edu.cgpa !== undefined ? edu.cgpa : ''}
                      onChange={(e) => handleEducationChange('cgpa', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="e.g. 8.4"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Active Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={edu.backlogs !== undefined ? edu.backlogs : ''}
                      onChange={(e) => handleEducationChange('backlogs', e.target.value ? parseInt(e.target.value, 10) : '')}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={edu.gradYear || ''}
                      onChange={(e) => handleEducationChange('gradYear', e.target.value ? parseInt(e.target.value, 10) : '')}
                      placeholder="2025"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[1px] text-silver block mb-1">Branch</label>
                    <input
                      type="text"
                      value={edu.branch || ''}
                      onChange={(e) => handleEducationChange('branch', e.target.value)}
                      placeholder="CSE / ECE"
                      className="w-full px-3 py-2 rounded bg-black border border-charcoal text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Skills with Evidence Levels */}
              <div className="p-4 rounded-lg bg-near-black border border-charcoal space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                    <span className="text-xs font-semibold uppercase tracking-[1.4px] text-silver">
                      Evidenced Skills ({skills.length})
                    </span>
                  </div>
                  <div className="flex gap-1 text-[11px]">
                    {(['all', 4, 3, 2, 1] as const).map((lvl) => (
                      <button
                        key={String(lvl)}
                        type="button"
                        onClick={() => setFilterLevel(lvl)}
                        className={`px-2.5 py-1 rounded font-semibold uppercase tracking-[1px] transition-colors ${
                          filterLevel === lvl
                            ? 'bg-volt text-text-on-accent border border-volt'
                            : 'bg-black text-silver border border-charcoal hover:border-volt hover:text-white'
                        }`}
                      >
                        {lvl === 'all' ? 'All' : `Lvl ${lvl}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {filteredSkills.map((s) => {
                    const isExpanded = expandedSkillId === s.canonicalId;
                    return (
                      <div
                        key={s.canonicalId}
                        className="rounded bg-black border border-charcoal overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-hover-gray transition-colors"
                          onClick={() => setExpandedSkillId(isExpanded ? null : s.canonicalId)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{s.displayName}</span>
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-[1px] px-1.5 py-0.5 rounded ${
                                s.evidenceLevel >= 3
                                  ? 'bg-near-black text-volt border border-volt/40'
                                  : s.evidenceLevel === 2
                                  ? 'bg-near-black text-white border border-charcoal'
                                  : 'bg-near-black text-pale-yellow border border-pale-yellow/40'
                              }`}
                            >
                              Lvl {s.evidenceLevel}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-silver stroke-[1.5px]" /> : <ChevronDown className="w-3.5 h-3.5 text-silver stroke-[1.5px]" />}
                        </div>

                        {isExpanded && (
                          <div className="p-2.5 pt-0 border-t border-charcoal text-[11px] text-silver space-y-2">
                            {s.evidence.length === 0 ? (
                              <p className="italic text-silver/60">Mentioned in skills list or implied.</p>
                            ) : (
                              s.evidence.map((span, idx) => (
                                <div key={idx} className="bg-near-black p-2 rounded border border-charcoal">
                                  <div className="flex items-center justify-between text-[10px] text-silver mb-1">
                                    <span className="uppercase font-semibold tracking-wider">{span.section}</span>
                                    {span.hasMetric && <span className="text-volt font-semibold">Metric detected</span>}
                                    {span.hasLink && <span className="text-white font-semibold">Link detected</span>}
                                  </div>
                                  <p className="font-mono text-white text-[11px] leading-relaxed">&ldquo;{span.text}&rdquo;</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Format Hazards */}
              {profile.formatHazards.length > 0 && (
                <div className="p-4 rounded-lg bg-near-black border border-pale-yellow/50 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-pale-yellow font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[1.5px]" />
                    <span>Format Hazards Detected ({profile.formatHazards.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-silver text-[11px]">
                    {profile.formatHazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions & Privacy */}
        <div className="p-4 border-t border-charcoal bg-near-black space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportAllData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-xs font-semibold text-white active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-silver stroke-[1.5px]" /> Export Data
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-xs font-semibold text-white active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-silver stroke-[1.5px]" /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileImport}
              />
            </div>

            {profile && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-black hover:bg-danger/20 border border-danger/60 text-xs font-semibold text-danger active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5px]" /> Clear all my data
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-silver text-center pt-2 border-t border-charcoal">
            <ShieldCheck className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
            <span>Privacy guaranteed: Stored only on this device in your browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
