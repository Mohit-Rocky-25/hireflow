// ============================================================
// Candidate Profile — Drawer (Stage 1.5)
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
import { EvidenceLevel } from '../types';

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-bg border-l border-border h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Candidate Profile</h2>
              <p className="text-xs text-text-tertiary">Parsed once, used across all tools</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!profile ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-surface border border-border border-dashed">
              <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <h3 className="text-sm font-bold text-text mb-1">No Profile Created Yet</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto mb-4">
                Run an ATS scan or TalentLens analysis and click &quot;Save to my profile&quot; to initialize your profile.
              </p>
            </div>
          ) : (
            <>
              {/* Identity Section */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Identity</span>
                  <span className="text-[11px] text-text-muted">Editable</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.identity.name || ''}
                      onChange={(e) => handleIdentityChange('name', e.target.value)}
                      placeholder="e.g. Alex Chen"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.identity.email || ''}
                      onChange={(e) => handleIdentityChange('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Phone</label>
                    <input
                      type="text"
                      value={profile.identity.phone || ''}
                      onChange={(e) => handleIdentityChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">City / Location</label>
                    <input
                      type="text"
                      value={profile.identity.city || ''}
                      onChange={(e) => handleIdentityChange('city', e.target.value)}
                      placeholder="Bengaluru, India"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Education & Eligibility Fields */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary" /> Education & Campus Eligibility
                  </span>
                  <span className="text-[11px] text-text-muted">Used for eligibility checks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">CGPA / GPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={edu.cgpa !== undefined ? edu.cgpa : ''}
                      onChange={(e) => handleEducationChange('cgpa', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="e.g. 8.4"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Active Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={edu.backlogs !== undefined ? edu.backlogs : ''}
                      onChange={(e) => handleEducationChange('backlogs', e.target.value ? parseInt(e.target.value, 10) : '')}
                      placeholder="0"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={edu.gradYear || ''}
                      onChange={(e) => handleEducationChange('gradYear', e.target.value ? parseInt(e.target.value, 10) : '')}
                      placeholder="2025"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-text-secondary block mb-1">Branch</label>
                    <input
                      type="text"
                      value={edu.branch || ''}
                      onChange={(e) => handleEducationChange('branch', e.target.value)}
                      placeholder="CSE / ECE"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text focus:outline-none focus:border-border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Skills with Evidence Levels */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                      Evidenced Skills ({skills.length})
                    </span>
                  </div>
                  <div className="flex gap-1 text-[11px]">
                    {(['all', 4, 3, 2, 1] as const).map((lvl) => (
                      <button
                        key={String(lvl)}
                        type="button"
                        onClick={() => setFilterLevel(lvl)}
                        className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                          filterLevel === lvl
                            ? 'bg-text text-bg'
                            : 'bg-surface-2 text-text-secondary hover:text-text'
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
                        className="rounded-lg bg-surface-2 border border-border/60 overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-surface-3 transition-colors"
                          onClick={() => setExpandedSkillId(isExpanded ? null : s.canonicalId)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text">{s.displayName}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                s.evidenceLevel >= 3
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : s.evidenceLevel === 2
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              Lvl {s.evidenceLevel}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" /> : <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />}
                        </div>

                        {isExpanded && (
                          <div className="p-2.5 pt-0 border-t border-border/40 text-[11px] text-text-secondary space-y-2">
                            {s.evidence.length === 0 ? (
                              <p className="italic text-text-muted">Mentioned in skills list or implied.</p>
                            ) : (
                              s.evidence.map((span, idx) => (
                                <div key={idx} className="bg-bg/60 p-2 rounded border border-border/40">
                                  <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
                                    <span className="uppercase font-semibold">{span.section}</span>
                                    {span.hasMetric && <span className="text-emerald-400 font-medium">Metric detected</span>}
                                    {span.hasLink && <span className="text-sky-400 font-medium">Link detected</span>}
                                  </div>
                                  <p className="font-mono text-text text-[11px] leading-relaxed">&ldquo;{span.text}&rdquo;</p>
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
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Format Hazards Detected ({profile.formatHazards.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-text-secondary text-[11px]">
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
        <div className="p-4 border-t border-border bg-surface space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportAllData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" /> Export Data
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-primary" /> Import
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all my data
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-tertiary text-center pt-1 border-t border-border/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy guaranteed: Stored only on this device in your browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
