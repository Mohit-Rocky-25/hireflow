import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { PromotionPlan, PerformanceBracket } from '../../../lib/careerEngine';
import { formatINR, formatINRRange } from '../../../lib/careerEngine';
import { CompensationTrajectoryChart } from './CompensationTrajectoryChart';
import { PromotionBlockersChecklist } from './PromotionBlockersChecklist';

export interface ProfessionalPromotionResultProps {
  profResult: PromotionPlan;
  profPerformance: PerformanceBracket;
  prefersReducedMotion: boolean;
  onReset: () => void;
  sectionRef?: React.RefObject<HTMLDivElement | null> | React.Ref<HTMLDivElement>;
  headingRef?: React.RefObject<HTMLHeadingElement | null> | React.Ref<HTMLHeadingElement>;
}

export function ProfessionalPromotionResult({
  profResult,
  profPerformance,
  prefersReducedMotion,
  onReset,
  sectionRef,
  headingRef,
}: ProfessionalPromotionResultProps) {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  return (
    <div ref={sectionRef} className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-surface border border-border text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs min-h-[44px]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Start Over / Reconfigure
        </button>

        <div className="text-right">
          <span className="text-xs text-muted font-bold">
            {profResult.sourceLevel.companyId.toUpperCase()} &rarr;{' '}
            {profResult.targetLevel.companyId.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Primary Heading with tabIndex={-1} for accessibility focus */}
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xl sm:text-2xl font-black text-foreground outline-none flex items-center gap-2.5 tracking-tight"
      >
        <TrendingUp className="w-6 h-6 text-primary" />
        Your Level-Up &amp; Switch Plan
      </h2>

      {/* 1. WHERE CAN I REACH? */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-wider">
              Question 1 of 4
            </span>
            <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Where can I reach? (Target Level &amp; Switch Plan)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
            {profResult.probability.percentage}% Success Probability
          </span>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
            <span className="text-xs font-bold text-muted uppercase">Target Transition</span>
            <span className="text-xl font-black text-foreground block mt-1">
              {profResult.sourceLevel.levelCode} &rarr; {profResult.targetLevel.levelCode}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              {profResult.sourceLevel.companyId.toUpperCase()} to{' '}
              {profResult.targetLevel.companyId.toUpperCase()}
            </span>
          </div>

          <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
            <span className="text-xs font-bold text-muted uppercase">Estimated Total Time</span>
            <span className="text-2xl font-black text-foreground block mt-1">
              {profResult.totalTime.likely} Years
            </span>
            <span className="text-xs text-muted mt-1 block">
              Range: {profResult.totalTime.min}–{profResult.totalTime.max} yrs
            </span>
          </div>

          <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
            <span className="text-xs font-bold text-muted uppercase">Success Probability</span>
            <span className="text-2xl font-black text-primary block mt-1">
              {profResult.probability.percentage}%
            </span>
            <span className="text-xs text-muted mt-1 block">
              Adjusted for {profPerformance} rating
            </span>
          </div>
        </div>

        {/* Expandable Probability Calculation Formula */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            {showFormulaDetails
              ? 'Hide Probability Model Details'
              : 'View Probability Model & Stall Rates'}
          </button>

          {showFormulaDetails && (
            <div className="mt-3 bg-surface-2/40 rounded-xl p-4 border border-border text-xs space-y-2">
              <span className="font-black text-foreground block">
                Mathematical Probability Model
              </span>
              <p className="text-secondary leading-relaxed">
                {profResult.probability.formulaExplanation}
              </p>
              <div className="grid sm:grid-cols-3 gap-2 pt-1">
                {profResult.probability.levelStallRates.map((sr, idx) => (
                  <div key={idx} className="p-2.5 bg-surface rounded-lg border border-border">
                    <span className="font-bold text-foreground block">
                      {sr.companyId.toUpperCase()} • {sr.levelCode}
                    </span>
                    <span className="text-muted text-[10px]">
                      Empirical Stall Rate: {sr.stallRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. WHAT WILL I EARN? */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
        <div className="border-b border-border pb-3">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider">
            Question 2 of 4
          </span>
          <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            What will I earn? (Projected Compensation Jump &amp; Trajectory)
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Real level compensation bands in INR from current level to target level.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
            <span className="text-xs font-bold text-muted uppercase">
              Projected Annual Comp Jump
            </span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">
              +{formatINR(profResult.compJump.diff)} (
              {profResult.compJump.percentage > 0 ? `+${profResult.compJump.percentage}%` : '0%'})
            </span>
            <span className="text-xs text-muted mt-1 block">
              {formatINR(profResult.compJump.from)} &rarr; {formatINR(profResult.compJump.to)}
            </span>
          </div>

          <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
            <span className="text-xs font-bold text-muted uppercase">
              Target Level Total Annual CTC Range
            </span>
            <span className="text-xl font-black text-white block mt-1">
              {formatINRRange(
                profResult.targetLevel.comp.total.p25,
                profResult.targetLevel.comp.total.p75
              )}
            </span>
            <span className="text-xs text-secondary mt-1 block">
              Estimated quartile band for {profResult.targetLevel.companyId.toUpperCase()}{' '}
              {profResult.targetLevel.levelCode}
            </span>
          </div>
        </div>

        {/* Rebuilt Compensation Trajectory Chart */}
        <div className="pt-2">
          <CompensationTrajectoryChart
            timeline={profResult.compTimeline}
            title="Projected Compensation Trajectory (Per Year in INR)"
            subtitle="Year 0 to Target Level"
            ariaLabel={`Projected compensation trajectory from ${formatINR(
              profResult.compTimeline[0]?.salary || 0
            )} to ${formatINR(
              profResult.compTimeline[profResult.compTimeline.length - 1]?.salary || 0
            )} over ${profResult.totalTime.likely} years.`}
            tableCaption="Projected Professional Career Compensation Timeline"
            gradientId="emeraldGradientProf"
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      {/* 3. WHEN WILL IT HAPPEN? */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
        <div className="border-b border-border pb-3">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider">
            Question 3 of 4
          </span>
          <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            When will it happen? (Promotion Plan Timeline)
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Progression milestones based on verified company ladder data and calibration cycles.
          </p>
        </div>

        <div className="space-y-6">
          {profResult.steps.map((step) => (
            <div
              key={step.stepIndex}
              className="p-5 rounded-xl border border-border bg-surface-2/30 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                    {step.stepIndex}
                  </span>
                  <h4 className="text-sm font-black text-foreground">
                    {step.fromLevel.companyId.toUpperCase()} {step.fromLevel.levelCode} &rarr;{' '}
                    {step.toLevel.companyId.toUpperCase()} {step.toLevel.levelCode}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border">
                    {step.stepType.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary block">
                    Duration: ~{step.durationYears.likely} yrs (range: {step.durationYears.min}–
                    {step.durationYears.max} yrs)
                  </span>
                  <span className="text-[10px] text-muted">{step.cycleWindow}</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                  <span className="font-extrabold text-foreground block">Scope Required</span>
                  <p className="text-secondary leading-relaxed">{step.requirements.scope}</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                  <span className="font-extrabold text-foreground block">Measurable Impact</span>
                  <p className="text-secondary leading-relaxed">{step.requirements.impact}</p>
                </div>
                <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                  <span className="font-extrabold text-foreground block">
                    Leadership &amp; Mentorship
                  </span>
                  <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                </div>
              </div>

              {/* Blockers on this step */}
              <PromotionBlockersChecklist
                blockers={step.blockers}
                mode="card-grid"
                maxCards={4}
                title={`Promotion Blockers to Address (${step.blockers.length} Documented)`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. WHAT SHOULD I DO NEXT? */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
        <div className="border-b border-border pb-3">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider">
            Question 4 of 4
          </span>
          <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What should I do next? (Action Steps &amp; Promo Packet Evidence)
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Concrete steps to assemble evidence for your promotion packet or target interview loops.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
            <span className="font-black text-foreground block text-sm">1. Scope Expansion</span>
            <p className="text-secondary leading-relaxed">
              Anchor ownership over a multi-team project or critical architectural subsystem
              required for {profResult.targetLevel.levelCode}.
            </p>
          </div>

          <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
            <span className="font-black text-foreground block text-sm">2. Quantified Evidence</span>
            <p className="text-secondary leading-relaxed">
              Document business impact metrics (latency reduction, revenue enablement, incident
              reduction) in your brag document.
            </p>
          </div>

          <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
            <span className="font-black text-foreground block text-sm">
              3. Calibration Alignment
            </span>
            <p className="text-secondary leading-relaxed">
              Align with your manager 6 months before the cycle window on explicit promotion
              criteria and peer feedback nominations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
