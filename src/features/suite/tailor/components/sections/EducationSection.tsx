import React from 'react';
import {
  GraduationCap,
} from 'lucide-react';
import { TailoredSection } from '../../../../../lib/tailor/types';

export interface EducationSectionProps {
  eduSection: TailoredSection;
  eduEntries: any[];
  getGradient: (name: string) => string;
  getInitials: (name: string) => string;
}

export function EducationSection({
  eduSection,
  eduEntries,
  getGradient,
  getInitials,
}: EducationSectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            EDUCATION &amp; ACADEMIC CREDENTIALS
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
            {eduEntries.length} Degrees
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eduEntries.map((edu) => (
          <div
            key={edu.id}
            className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 space-y-3 flex flex-col justify-between shadow-md"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(
                  edu.secondaryTitle || edu.primaryTitle
                )} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}
              >
                {getInitials(edu.secondaryTitle || edu.primaryTitle)}
              </div>
              <div className="min-w-0 space-y-0.5 flex-1">
                <h4 className="text-sm font-black text-white">{edu.primaryTitle}</h4>
                <div className="text-xs text-neutral-400 font-medium">{edu.secondaryTitle}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-900">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-300">
                {edu.dateRange || 'Graduated'}
              </span>
              {edu.bullets && edu.bullets.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {edu.bullets[0].text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
