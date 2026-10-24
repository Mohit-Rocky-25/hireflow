import React from 'react';
import {
  Zap,
  CheckCircle,
} from 'lucide-react';
import { JobDescription } from '../../../../../lib/tailor/types';
import { CompanyLogo } from '@/components/common/CompanyLogo';

export interface SkillsSectionProps {
  skillsCategories: Record<string, string[]>;
  totalSkillsCount: number;
  job: JobDescription;
  removeSkillFromCategory: (category: string, skill: string) => void;
  newSkillInput: Record<string, string>;
  setNewSkillInput: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddSkill: (category: string) => void;
}

export function SkillsSection({
  skillsCategories,
  totalSkillsCount,
  job,
  removeSkillFromCategory,
  newSkillInput,
  setNewSkillInput,
  handleAddSkill,
}: SkillsSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            TECHNICAL SKILLS ONTOLOGY
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
            {totalSkillsCount} Skills Loaded
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skillsCategories).map(([category, skills]) => {
          const matchedCategorySkills = skills.filter((s) =>
            job.requirements.some(
              (r) =>
                r.normalizedConcept.toLowerCase().includes(s.toLowerCase()) ||
                (r.keywords || []).some((kw: string) => kw.toLowerCase().includes(s.toLowerCase()))
            )
          );

          return (
            <div
              key={category}
              className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3 flex flex-col justify-between shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-200">
                    {category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-850">
                    {skills.length} items
                  </span>
                </div>

                {matchedCategorySkills.length > 0 && (
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 flex-wrap">
                    <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                    <CompanyLogo company={job.company} size="xs" showBorder={false} interactive={false} />
                    <span>{matchedCategorySkills.length} skills directly match {job.company} JD</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 min-h-[36px] pt-1">
                  {skills.map((skill) => {
                    const isMatch = matchedCategorySkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          isMatch
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkillFromCategory(category, skill)}
                          className="text-neutral-500 hover:text-rose-400 transition ml-0.5"
                          title="Remove skill"
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Add Skill Chip Input */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900">
                <input
                  type="text"
                  value={newSkillInput[category] || ''}
                  onChange={(e) => setNewSkillInput((prev) => ({ ...prev, [category]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(category);
                    }
                  }}
                  placeholder={`Add to ${category}...`}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleAddSkill(category)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
