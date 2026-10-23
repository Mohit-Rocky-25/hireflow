// ============================================================
// HireFlow — Fresher Intake Modal / Drawer (Stage 4)
// Optional light local intake for batch year, branch, CGPA, and archetype
// Stored strictly in localStorage under 'hireflow:v4:fresher-intake'
// Zero network egress at runtime
// ============================================================

import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, X, Check, BookOpen, Building2 } from 'lucide-react';
import { ArchetypeId } from '../../data/market/types';

export interface FresherIntakeData {
  batchYear: number;
  branch: string;
  cgpa: number;
  cgpaScale: 10 | 100;
  experienceLevel: 'Student' | 'Intern' | '0-2 yrs';
  targetArchetype: ArchetypeId | string;
}

const STORAGE_KEY = 'hireflow:v4:fresher-intake';

export const DEFAULT_FRESHER_INTAKE: FresherIntakeData = {
  batchYear: 2026,
  branch: 'Computer Science / IT',
  cgpa: 7.5,
  cgpaScale: 10,
  experienceLevel: 'Student',
  targetArchetype: 'service_track',
};

export function getFresherIntake(): FresherIntakeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_FRESHER_INTAKE, ...JSON.parse(raw) } : DEFAULT_FRESHER_INTAKE;
  } catch {
    return DEFAULT_FRESHER_INTAKE;
  }
}

export function saveFresherIntake(data: FresherIntakeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage gracefully handled
  }
}

interface FresherIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: FresherIntakeData) => void;
}

export function FresherIntakeModal({ isOpen, onClose, onSave }: FresherIntakeModalProps) {
  const [formData, setFormData] = useState<FresherIntakeData>(getFresherIntake);

  useEffect(() => {
    if (isOpen) {
      setFormData(getFresherIntake());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFresherIntake(formData);
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Campus & Fresher Profile</h2>
              <p className="text-xs text-text-muted">Optional local intake to calibrate eligibility and expectations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Batch Year */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Graduation Batch Year
              </label>
              <select
                value={formData.batchYear}
                onChange={(e) => setFormData({ ...formData, batchYear: parseInt(e.target.value, 10) })}
                className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={2024}>2024 Batch</option>
                <option value={2025}>2025 Batch</option>
                <option value={2026}>2026 Batch (Current)</option>
                <option value={2027}>2027 Batch</option>
                <option value={2028}>2028 Batch</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
                className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Student">Student (Pre-final / Final Year)</option>
                <option value="Intern">Intern (Completed 1+ internships)</option>
                <option value="0-2 yrs">0–2 Years (Early Career)</option>
              </select>
            </div>
          </div>

          {/* Branch / Degree */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Engineering Branch / Degree
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Computer Science / IT">Computer Science / IT / AI / DS</option>
              <option value="Circuital (ECE/EEE/EN)">Circuital (ECE, EEE, EIE)</option>
              <option value="Non-Circuital / Core">Non-Circuital (Mechanical, Civil, Chemical)</option>
              <option value="BCA / MCA / BSc CS">BCA / MCA / BSc Computer Science</option>
              <option value="Other">Other Graduate Program</option>
            </select>
          </div>

          {/* CGPA / Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Aggregate Score / CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={formData.cgpaScale === 10 ? 10 : 100}
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Grading Scale
              </label>
              <select
                value={formData.cgpaScale}
                onChange={(e) => setFormData({ ...formData, cgpaScale: parseInt(e.target.value, 10) as 10 | 100 })}
                className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={10}>10.0 Scale (CGPA)</option>
                <option value={100}>100% Scale (Percentage)</option>
              </select>
            </div>
          </div>

          {/* Target Archetype */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Target Market Archetype
            </label>
            <select
              value={formData.targetArchetype}
              onChange={(e) => setFormData({ ...formData, targetArchetype: e.target.value })}
              className="w-full h-9 px-3 bg-surface-2 border border-border rounded-xl text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="service_track">Tier C: IT Services & Multi-Track Drives (TCS, Infosys, Wipro)</option>
              <option value="product_mnc_gcc">Tier B: Product MNCs & Global Capability Centers (Oracle, Cisco)</option>
              <option value="indian_high_growth">Tier A: Indian High-Growth Scale-ups (Swiggy, Razorpay)</option>
              <option value="big_tech_product">Tier S: Big Tech & Global Product (Google, Microsoft)</option>
              <option value="quant_trading">Quant & High-Frequency Systems (Tower, Graviton)</option>
              <option value="early_growth_startup">Early-Stage Tech Startups</option>
            </select>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed bg-surface-2/40 p-2.5 rounded-xl border border-border">
            🔒 <strong>Zero-Egress Privacy:</strong> This profile is saved strictly on your local browser. It is used only to show calibrated cutoffs and remove irrelevant experience requirements.
          </p>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-glow-orange cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
