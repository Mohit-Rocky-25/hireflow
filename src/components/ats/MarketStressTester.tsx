import React, { useState, useMemo } from 'react';
import archetypesData from '../../data/ats/archetypes.json';
import { DeterministicFacts } from '../../lib/ats/types';
import { Users, Trophy, TrendingDown, TrendingUp, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  facts: DeterministicFacts;
}

interface CompetitorScore {
  id: string;
  name: string;
  archetype: string;
  background: string;
  estimatedScore: number;
  advantages: string;
  typicalGaps: string;
  isUser?: boolean;
}

export const MarketStressTester: React.FC<Props> = ({ facts }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  // Compute realistic competitor scores against the current JD
  const leaderboard = useMemo<CompetitorScore[]>(() => {
    const jdMustHaves = facts.jd.mustHaves;
    const jdSeniority = facts.jd.yearsRequired;

    const competitors: CompetitorScore[] = archetypesData.map((arch) => {
      // Overlap of archetype skills with target JD must-haves
      const archSkillsLower = arch.skills.map((s) => s.toLowerCase());
      const matchedMustHaves = jdMustHaves.filter((mh) =>
        archSkillsLower.some((as) => as.includes(mh.toLowerCase()) || mh.toLowerCase().includes(as))
      );
      const mustHaveRatio = jdMustHaves.length > 0 ? matchedMustHaves.length / jdMustHaves.length : 0.7;

      // Seniority fit
      const yearsDiff = arch.estimatedYears - jdSeniority;
      let seniorityBonus = 0;
      if (yearsDiff >= 0 && yearsDiff <= 3) seniorityBonus = 10;
      else if (yearsDiff < 0) seniorityBonus = Math.max(-15, yearsDiff * 4);

      // Base metric bonus
      let metricBonus = 0;
      if (arch.metricsPresence.toLowerCase().includes('very high')) metricBonus = 15;
      else if (arch.metricsPresence.toLowerCase().includes('high')) metricBonus = 10;
      else if (arch.metricsPresence.toLowerCase().includes('moderate')) metricBonus = 5;

      const rawScore = Math.round(mustHaveRatio * 65 + seniorityBonus + metricBonus + 15);
      const estimatedScore = Math.max(30, Math.min(95, rawScore));

      return {
        id: arch.id,
        name: arch.name,
        archetype: arch.archetype,
        background: arch.background,
        estimatedScore,
        advantages: arch.advantages,
        typicalGaps: arch.typicalGaps,
      };
    });

    const userCandidate: CompetitorScore = {
      id: 'current_user',
      name: facts.resume.contact.name || 'You (Your Resume)',
      archetype: 'Your Uploaded Profile',
      background: `${facts.seniorityFit.candidateYears} years estimated experience, ${facts.resume.skillsExtracted.length} verified skills.`,
      estimatedScore: facts.scoreBreakdown.finalScore,
      advantages: `Scored ${facts.scoreBreakdown.mustHaveCoverageScore}% on must-haves with ${facts.scoreBreakdown.formatSafetyScore}% ATS safety rating.`,
      typicalGaps: facts.harshTruthsDeterministic[0] || 'See harsh truths breakdown.',
      isUser: true,
    };

    return [...competitors, userCandidate].sort((a, b) => b.estimatedScore - a.estimatedScore);
  }, [facts]);

  const userRank = leaderboard.findIndex((c) => c.isUser) + 1;
  const userScore = facts.scoreBreakdown.finalScore;
  const totalPool = leaderboard.length;
  const percentile = Math.round(((totalPool - userRank + 1) / totalPool) * 100);

  // Identify competitive edge and gaps
  const topCompetitor = leaderboard.find((c) => !c.isUser && c.estimatedScore > userScore);
  const trailingCompetitor = [...leaderboard].reverse().find((c) => !c.isUser && c.estimatedScore < userScore);

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-ai" /> Market Stress Tester (Applicant Pool Benchmark)
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Simulate how your resume ranks against 4 realistic synthetic candidates applying for this exact job opening.
          </p>
        </div>

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
            isEnabled
              ? 'bg-ai text-white shadow-xs'
              : 'bg-surface-2 text-text border border-border hover:bg-surface-3'
          }`}
        >
          {isEnabled ? 'Stress Testing Active (Hide)' : 'Run Market Stress Test'}
        </button>
      </div>

      {!isEnabled ? (
        <div className="p-6 rounded-xl bg-surface-2/60 border border-border text-center space-y-3">
          <Sparkles className="w-8 h-8 text-ai mx-auto" />
          <h4 className="text-sm font-bold text-text">Benchmark Against Realistic Competitors</h4>
          <p className="text-xs text-text-secondary max-w-lg mx-auto">
            Hiring managers don't review resumes in a vacuum—they compare you against Tier-1 college freshers, senior product referrals, and enterprise switchers. Click the button above to simulate the pool.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Rank Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-ai/10 via-primary/10 to-surface-2 border border-ai/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-ai text-white flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                #{userRank}
              </div>
              <div>
                <h4 className="text-sm font-black text-text">
                  You Rank #{userRank} out of {totalPool} in this Applicant Batch
                </h4>
                <p className="text-xs text-text-secondary">
                  Top {100 - percentile < 10 ? '10%' : `${100 - percentile + 10}%`} candidate bracket. {userRank <= 2 ? 'Strong probability of advancing to recruiter screen.' : 'Borderline pool position; vulnerable to candidates with scale metrics.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 bg-surface border border-border text-xs font-mono font-bold rounded-lg text-text">
                Your ATS Score: {userScore}%
              </span>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider px-2">
              Applicant Pool Leaderboard
            </div>
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
              {leaderboard.map((cand, idx) => {
                const isCurrent = cand.isUser;
                return (
                  <div
                    key={cand.id}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-ai/10 border-l-4 border-l-ai'
                        : 'hover:bg-surface-2/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-surface-2 text-text font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-ai font-black' : 'text-text'}`}>
                            {cand.name}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-ai text-white">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">{cand.archetype}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-black text-text font-mono">{cand.estimatedScore}%</div>
                        <div className="text-[10px] text-text-muted">Estimated Match</div>
                      </div>
                      <div className="w-20 bg-surface-3 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${isCurrent ? 'bg-ai' : 'bg-primary'}`}
                          style={{ width: `${cand.estimatedScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Competitive Advantage vs Competitor Gaps */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-success-bg/20 border border-success/30 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-success flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Where You Outperform the Batch
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {userScore >= 65
                  ? `Your must-have alignment (${facts.scoreBreakdown.mustHaveCoverageScore}%) beats bootcamp generalists and pure enterprise transition profiles for this modern stack.`
                  : 'You have clean format safety, ensuring parsing engines will not corrupt your submission.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-danger-bg/20 border border-danger/30 space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-danger flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Where Competitors Gain the Edge
              </span>
              <p className="text-xs text-text-secondary leading-relaxed">
                {topCompetitor
                  ? `Candidates like ${topCompetitor.name} include verified production scale metrics (${topCompetitor.advantages.slice(0, 75)}...).`
                  : 'Maintain your edge by continually hardening bullet point XYZ metrics and production latency benchmarks.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
