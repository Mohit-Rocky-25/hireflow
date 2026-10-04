import React from 'react';
import { ScoreBreakdown } from '../../lib/ats/types';
import { ShieldCheck, Target, Zap, Clock, FolderGit2, FileCode, AlertOctagon } from 'lucide-react';

interface Props {
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownCard: React.FC<Props> = ({ breakdown }) => {
  const items = [
    {
      label: 'Must-Have Skills Match',
      weight: '35%',
      score: breakdown.mustHaveCoverageScore,
      icon: Target,
      desc: 'Mandatory technical requirements and core competencies found in the JD.',
    },
    {
      label: 'Evidence & Impact Quality',
      weight: '20%',
      score: breakdown.evidenceQualityScore,
      icon: Zap,
      desc: 'Action verbs, quantifiable scale/latency metrics, and concrete outcomes in bullet points.',
    },
    {
      label: 'Nice-to-Have Coverage',
      weight: '10%',
      score: breakdown.niceToHaveCoverageScore,
      icon: ShieldCheck,
      desc: 'Bonus skills and preferred architectural proficiencies.',
    },
    {
      label: 'Seniority & Experience Fit',
      weight: '10%',
      score: breakdown.seniorityFitScore,
      icon: Clock,
      desc: 'Years of hands-on experience vs required role seniority.',
    },
    {
      label: 'Project & Stack Relevance',
      weight: '10%',
      score: breakdown.projectRelevanceScore,
      icon: FolderGit2,
      desc: 'Evidence of building real-world projects with modern frameworks and live URLs.',
    },
    {
      label: 'ATS Format & Parsing Safety',
      weight: '10%',
      score: breakdown.formatSafetyScore,
      icon: FileCode,
      desc: 'Standard headers, contact completeness, single-column readability, and clean text density.',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success bg-success';
    if (score >= 50) return 'text-warning bg-warning';
    return 'text-danger bg-danger';
  };

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-text tracking-tight">ATS Scoring Algorithm Breakdown</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Heuristic benchmarks calibrated against modern engineering hiring standards.
          </p>
        </div>
        <span className="px-3 py-1 bg-surface-2 border border-border text-xs font-mono font-bold rounded-full">
          Total: {breakdown.finalScore}%
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const colorClass = getScoreColor(item.score);
          const textColor = colorClass.split(' ')[0];
          const bgBar = colorClass.split(' ')[1];

          return (
            <div key={item.label} className="bg-surface-2 rounded-lg p-3.5 border border-border/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-text mb-1">
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {item.label}
                    <span className="text-[10px] text-text-muted font-normal">({item.weight})</span>
                  </span>
                  <span className={`font-mono font-black ${textColor}`}>{item.score}%</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{item.desc}</p>
              </div>

              <div className="w-full bg-surface-3 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${bgBar}`}
                  style={{ width: `${Math.max(4, Math.min(100, item.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {breakdown.keywordStuffingPenalty < 0 && (
        <div className="flex items-start gap-3 p-3.5 bg-danger-bg border border-danger/25 rounded-lg text-danger">
          <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Keyword Stuffing Penalty Applied ({breakdown.keywordStuffingPenalty} pts):</span>{' '}
            Detected a high density of advanced skills in the skills section that lack any supporting project evidence or bullet point context.
          </div>
        </div>
      )}
    </div>
  );
};
