// ============================================================
// Candidate Profile — Status Chip (Stage 1.5)
// Compact bar indicator displayed across suite tools
// ============================================================

import React from 'react';
import { User, Upload, ShieldCheck, ChevronRight } from 'lucide-react';
import { useProfile } from '../ProfileContext';

interface ProfileStatusChipProps {
  onUploadClick?: () => void;
  className?: string;
}

export function ProfileStatusChip({ onUploadClick, className = '' }: ProfileStatusChipProps) {
  const { profile, openDrawer } = useProfile();

  if (!profile) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs text-text-secondary hover:border-border-accent hover:text-text transition-colors cursor-pointer ${className}`}
        onClick={onUploadClick || openDrawer}
      >
        <Upload className="w-3.5 h-3.5 text-primary" />
        <span>No profile active · <strong className="text-primary font-medium">Upload resume</strong> or build profile</span>
      </div>
    );
  }

  const name = profile.identity.name || 'Candidate';
  const skillsCount = profile.skills.length;
  const highEvidenceCount = profile.skills.filter((s) => s.evidenceLevel >= 2).length;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border hover:border-border-accent text-xs text-text transition-all shadow-2xs group cursor-pointer ${className}`}
      title="Click to view and edit candidate profile"
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <User className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
      <span className="font-semibold text-text truncate max-w-[140px]">
        {name}
      </span>
      <span className="text-[11px] text-text-tertiary hidden sm:inline">
        ({highEvidenceCount}/{skillsCount} evidenced skills)
      </span>
      <ChevronRight className="w-3 h-3 text-text-tertiary group-hover:text-text transition-colors ml-0.5" />
    </button>
  );
}
