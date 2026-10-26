// ============================================================
// Pathways Architecture — Profile Budget Bar
// Constitution B1: Budget 3 core inputs (Branch, Batch, CGPA).
// Progressive disclosure for optional rewarded criteria. Zero UI arithmetic.
// ============================================================

import React, { useState } from 'react';
import { usePathwaysProfileStore } from '../profile/profileStore';

export const ProfileBudgetBar: React.FC = () => {
  const { profile, setProfile } = usePathwaysProfileStore();
  const [showUpgrades, setShowUpgrades] = useState(false);

  return (
    <div className="w-full bg-zinc-950/90 border-b border-zinc-800 p-4 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-volt" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Your Profile Budget
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              3 Core Inputs
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgrades(!showUpgrades)}
            className="text-xs font-mono text-volt hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showUpgrades ? '▲ Hide Optional Details' : '▼ Add 10th / 12th / Backlogs (Resolve Checks)'}</span>
          </button>
        </div>

        {/* 3 Core Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Branch */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Engineering Branch / Discipline
            </label>
            <select
              value={profile.branch}
              onChange={(e) => setProfile({ branch: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-volt"
            >
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="AIML">AI & Machine Learning (AIML)</option>
              <option value="AIDS">AI & Data Science (AIDS)</option>
              <option value="ECE">Electronics & Comm (ECE / E&TC)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="CIVIL">Civil Engineering (CIVIL)</option>
              <option value="MCA">Master of Computer Applications (MCA)</option>
              <option value="CHEM">Chemical Engineering (CHEM)</option>
              <option value="BIOTECH">Biotechnology</option>
            </select>
          </div>

          {/* 2. Batch Year */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Graduation Batch Year
            </label>
            <select
              value={profile.batchYear}
              onChange={(e) => setProfile({ batchYear: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-volt"
            >
              <option value={2026}>Class of 2026 (Final Year)</option>
              <option value={2027}>Class of 2027 (Pre-Final Year)</option>
              <option value={2025}>Class of 2025 (Immediate Passout)</option>
              <option value={2028}>Class of 2028 (Sophomore)</option>
            </select>
          </div>

          {/* 3. CGPA & Scale */}
          <div>
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
              Current College CGPA
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={profile.cgpaScale}
                value={profile.cgpa}
                onChange={(e) => setProfile({ cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-volt"
              />
              <select
                value={profile.cgpaScale}
                onChange={(e) => setProfile({ cgpaScale: Number(e.target.value) })}
                className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-xs focus:outline-none"
              >
                <option value={10}>/ 10</option>
                <option value={4}>/ 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Progressive Disclosure Optional Upgrades */}
        {showUpgrades && (
          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 animate-in fade-in">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">10th Std Marks (%)</label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={profile.percent10 ?? ''}
                onChange={(e) => setProfile({ percent10: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:border-volt"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">12th Std Marks (%)</label>
              <input
                type="number"
                disabled={profile.isDiploma}
                placeholder={profile.isDiploma ? 'Waived (Diploma)' : 'e.g. 80'}
                value={profile.percent12 ?? ''}
                onChange={(e) => setProfile({ percent12: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:border-volt disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={profile.activeBacklogs ?? 0}
                onChange={(e) => setProfile({ activeBacklogs: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:border-volt"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 mb-1">Education Gap (Mo)</label>
              <input
                type="number"
                min="0"
                value={profile.gapMonths ?? 0}
                onChange={(e) => setProfile({ gapMonths: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:border-volt"
              />
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                <input
                  type="checkbox"
                  checked={Boolean(profile.isDiploma)}
                  onChange={(e) => setProfile({ isDiploma: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-volt focus:ring-0"
                />
                <span>Diploma Lateral Entry</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
