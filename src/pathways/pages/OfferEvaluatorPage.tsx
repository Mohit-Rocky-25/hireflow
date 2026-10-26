// ============================================================
// Pathways Architecture — Route 4: Offer Evaluator Page
// Wireframe C13 Screen 4. Zero component arithmetic (Constitution E6).
// ============================================================

import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { evaluateOffer, compareOffers } from '../engine/offer';
import type { OfferInput, TaxRegime, PfContributionMode } from '../schema/types';
import { formatRupees, formatLpa } from '../utils/money';
import { NonAffiliationFooter } from '../components/NonAffiliationFooter';

export const OfferEvaluatorPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Primary Offer Inputs
  const [fixedAnnual, setFixedAnnual] = useState<number>(700000);
  const [variableAnnual, setVariableAnnual] = useState<number>(100000);
  const [joiningBonus, setJoiningBonus] = useState<number>(50000);

  // Step 2 & 3 Disclosures
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [basicMonthly, setBasicMonthly] = useState<number>(29167);
  const [employerPfInsideFixed, setEmployerPfInsideFixed] = useState<boolean>(true);
  const [gratuityInsideFixed, setGratuityInsideFixed] = useState<boolean>(true);
  const [insuranceAnnual, setInsuranceAnnual] = useState<number>(15000);

  // Contract Terms
  const [bondMonths, setBondMonths] = useState<number>(24);
  const [bondAmount, setBondAmount] = useState<number>(200000);
  const [bondProRata, setBondProRata] = useState<boolean>(true);
  const [clawbackMonths, setClawbackMonths] = useState<number>(12);
  const [clawbackPercent, setClawbackPercent] = useState<number>(100);
  const [joiningMonth, setJoiningMonth] = useState<number>(4); // July = 4th month of FY
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [pfMode, setPfMode] = useState<PfContributionMode>('statutory_ceiling');

  // Compare Modal State
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [offerBFixed, setOfferBFixed] = useState<number>(650000);
  const [offerBVariable, setOfferBVariable] = useState<number>(50000);
  const [offerBBond, setOfferBBond] = useState<number>(0);

  // HR questions checkmark state
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({});

  const offerInput: OfferInput = useMemo(() => {
    return {
      fixedAnnual,
      variableAnnualTarget: variableAnnual,
      joiningBonus,
      basicMonthly,
      employerPfInsideFixed,
      gratuityInsideFixed,
      insuranceAnnual,
      bondMonths,
      bondAmount,
      bondProRata,
      clawbackMonths,
      clawbackPercent,
      joiningMonth,
      taxRegime,
      pfMode
    };
  }, [
    fixedAnnual,
    variableAnnual,
    joiningBonus,
    basicMonthly,
    employerPfInsideFixed,
    gratuityInsideFixed,
    insuranceAnnual,
    bondMonths,
    bondAmount,
    bondProRata,
    clawbackMonths,
    clawbackPercent,
    joiningMonth,
    taxRegime,
    pfMode
  ]);

  const result = useMemo(() => {
    return evaluateOffer(offerInput);
  }, [offerInput]);

  const comparisonResult = useMemo(() => {
    if (!showCompareModal) return null;
    const offerAInput = offerInput;
    const offerBInput: OfferInput = {
      fixedAnnual: offerBFixed,
      variableAnnualTarget: offerBVariable,
      joiningBonus: 0,
      bondMonths: 0,
      bondAmount: offerBBond,
      taxRegime: 'new',
      pfMode: 'statutory_ceiling'
    };
    return compareOffers([
      { name: 'Primary Offer (Offer A)', input: offerAInput },
      { name: 'Comparison Offer (Offer B)', input: offerBInput }
    ]);
  }, [showCompareModal, offerInput, offerBFixed, offerBVariable, offerBBond]);

  const toggleQuestion = (idx: number) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-volt/10 text-volt border border-volt/30 uppercase">
                Zero Bias Engine
              </span>
              <span className="text-zinc-500 text-xs font-mono">FY 2026-27 Statutory Rules</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
              Offer Evaluator & Take-Home Simulator
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Stays in your browser. Never uploaded. Sourced from official Income Tax, EPFO, and Labour Gazette notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/pathways"
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
            >
              ← Radar
            </Link>
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3 py-2 rounded-lg bg-volt/15 hover:bg-volt/25 border border-volt/40 text-volt text-xs font-mono transition-colors"
            >
              Compare 2 Offers →
            </button>
          </div>
        </div>

        {/* 3-Input Fast Estimate Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Step 1: 3-Input Fast Estimate (Budget 3)
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Live Simulation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Annual Fixed Pay (₹)
              </label>
              <input
                type="number"
                step="10000"
                value={fixedAnnual}
                onChange={(e) => setFixedAnnual(Number(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt font-mono"
              />
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">{formatLpa(fixedAnnual)}</div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Variable Pay Target (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={variableAnnual}
                onChange={(e) => setVariableAnnual(Number(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt font-mono"
              />
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">{formatLpa(variableAnnual)}</div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">
                Joining Bonus (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={joiningBonus}
                onChange={(e) => setJoiningBonus(Number(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-volt font-mono"
              />
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">{formatLpa(joiningBonus)}</div>
            </div>
          </div>
        </div>

        {/* Instant Monthly In-Hand Estimate Scenarios */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Monthly In-Hand Scenarios
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Fixed salary is received monthly. Variable pay varies by company and team performance.
              </p>
            </div>
            <span className="text-xs font-mono text-volt bg-volt/10 border border-volt/20 px-2 py-1 rounded">
              CTC: {formatRupees(result.totalCtcAnnual)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 100% Scenario */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="text-xs font-mono text-emerald-400">100% Variable Paid</div>
              <div className="text-xl font-bold font-mono text-white">
                {formatRupees(result.scenarios.hundredVariable.netInHandMonthly)}
                <span className="text-xs text-zinc-400 font-normal"> / mo</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono space-y-0.5 pt-1 border-t border-zinc-900">
                <div>Gross: {formatRupees(result.scenarios.hundredVariable.grossCashMonthly)}</div>
                <div>PF Saved: {formatRupees(result.scenarios.hundredVariable.employeePfMonthly)}</div>
                <div>Tax Est: {formatRupees(result.scenarios.hundredVariable.incomeTaxMonthly)}</div>
              </div>
            </div>

            {/* 50% Scenario */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-amber-500/30 space-y-2">
              <div className="text-xs font-mono text-amber-400">50% Variable Paid</div>
              <div className="text-xl font-bold font-mono text-white">
                {formatRupees(result.scenarios.fiftyVariable.netInHandMonthly)}
                <span className="text-xs text-zinc-400 font-normal"> / mo</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono space-y-0.5 pt-1 border-t border-zinc-900">
                <div>Gross: {formatRupees(result.scenarios.fiftyVariable.grossCashMonthly)}</div>
                <div>PF Saved: {formatRupees(result.scenarios.fiftyVariable.employeePfMonthly)}</div>
                <div>Tax Est: {formatRupees(result.scenarios.fiftyVariable.incomeTaxMonthly)}</div>
              </div>
            </div>

            {/* 0% Scenario */}
            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-700/60 space-y-2">
              <div className="text-xs font-mono text-zinc-400">Baseline (0% Variable)</div>
              <div className="text-xl font-bold font-mono text-white">
                {formatRupees(result.scenarios.zeroVariable.netInHandMonthly)}
                <span className="text-xs text-zinc-400 font-normal"> / mo</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono space-y-0.5 pt-1 border-t border-zinc-900">
                <div>Gross: {formatRupees(result.scenarios.zeroVariable.grossCashMonthly)}</div>
                <div>PF Saved: {formatRupees(result.scenarios.zeroVariable.employeePfMonthly)}</div>
                <div>Tax Est: {formatRupees(result.scenarios.zeroVariable.incomeTaxMonthly)}</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 italic bg-zinc-950/40 p-2.5 rounded border border-zinc-800">
            Estimate based on the numbers you entered and the rules shown. Not tax or legal advice. Employee PF is saved for you in EPFO, not lost.
          </div>
        </div>

        {/* Progressive Disclosure Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-mono text-volt hover:underline flex items-center gap-1.5"
          >
            {showAdvanced ? '▼ Hide Step 2 & 3 Offer Details' : '▶ Show Step 2 & 3: Offer Letter & Contract Details'}
          </button>
        </div>

        {/* Step 2 & Step 3 Inputs */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 border border-zinc-800 rounded-xl p-5">
            {/* Step 2: From Offer Letter */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-zinc-800 pb-2">
                Step 2: From Offer Letter
              </h3>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Basic Pay Monthly (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={basicMonthly}
                  onChange={(e) => setBasicMonthly(Number(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-300">Employer PF Inside Fixed?</span>
                <input
                  type="checkbox"
                  checked={employerPfInsideFixed}
                  onChange={(e) => setEmployerPfInsideFixed(e.target.checked)}
                  className="accent-volt"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">Gratuity Inside Fixed?</span>
                <input
                  type="checkbox"
                  checked={gratuityInsideFixed}
                  onChange={(e) => setGratuityInsideFixed(e.target.checked)}
                  className="accent-volt"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Insurance Premium Provision (Annual ₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={insuranceAnnual}
                  onChange={(e) => setInsuranceAnnual(Number(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Step 3: Contract & Exit Terms */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold border-b border-zinc-800 pb-2">
                Step 3: Contract & Exit Terms
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Service Bond (₹)
                  </label>
                  <input
                    type="number"
                    step="25000"
                    value={bondAmount}
                    onChange={(e) => setBondAmount(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Bond Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={bondMonths}
                    onChange={(e) => setBondMonths(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-300">Pro-rata Bond Reduction?</span>
                <input
                  type="checkbox"
                  checked={bondProRata}
                  onChange={(e) => setBondProRata(e.target.checked)}
                  className="accent-volt"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Joining Month (FY)
                  </label>
                  <select
                    value={joiningMonth}
                    onChange={(e) => setJoiningMonth(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value={1}>April (Month 1)</option>
                    <option value={4}>July (Month 4)</option>
                    <option value={6}>September (Month 6)</option>
                    <option value={10}>January (Month 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Tax Regime
                  </label>
                  <select
                    value={taxRegime}
                    onChange={(e) => setTaxRegime(e.target.value as TaxRegime)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                  >
                    <option value="new">New Regime (FY 26-27)</option>
                    <option value="old">Old Regime</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* First Financial Year Partial Impact */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-mono text-zinc-400 uppercase">First Financial Year Outlook</div>
            <div className="text-white font-semibold mt-0.5">
              Employed for {result.firstFinancialYear.monthsInFirstFy} months in FY1 • Partial Gross: {formatRupees(result.firstFinancialYear.partialGrossEarned)}
            </div>
            {result.firstFinancialYear.taxReliefRuleApplied && (
              <div className="text-emerald-400 mt-0.5">
                ✓ {result.firstFinancialYear.taxReliefRuleApplied}
              </div>
            )}
          </div>
          <div className="text-right font-mono">
            <div className="text-zinc-500">First FY Tax Estimate</div>
            <div className="text-sm font-bold text-white">
              {formatRupees(result.firstFinancialYear.partialTaxEstimate)}
            </div>
          </div>
        </div>

        {/* Exit Exposure Timeline (Months 0–36) */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Exit Exposure Timeline (Months 0–36)
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Financial obligation if you resign or leave before bond / clawback maturity.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="p-2.5">Exit Month</th>
                  <th className="p-2.5">Bond at Stake</th>
                  <th className="p-2.5">Clawback at Stake</th>
                  <th className="p-2.5">Total at Stake</th>
                  <th className="p-2.5">% Year 1 Cash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {result.exposureTimeline.map((item) => (
                  <tr key={item.month} className="hover:bg-zinc-950/40">
                    <td className="p-2.5 font-bold text-white">Month {item.month}</td>
                    <td className="p-2.5">{formatRupees(item.bondExposure)}</td>
                    <td className="p-2.5">{formatRupees(item.clawbackExposure)}</td>
                    <td className="p-2.5 font-bold text-volt">{formatRupees(item.totalAtStake)}</td>
                    <td className="p-2.5">{item.exposurePercentOfYearOneCash}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded border border-zinc-800 text-[11px] text-zinc-400">
            Courts in India have treated reasonable service bonds as enforceable. Whether yours is reasonable is a legal question. This tool shows the money at stake, not legal advice.
          </div>
        </div>

        {/* Red Flags & HR Questions */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Red Flags & Verification Checklist
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluated against statutory rules and standard compensation hygiene.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {result.redFlags.length} Flag(s) Identified
            </span>
          </div>

          {result.redFlags.length > 0 && (
            <div className="space-y-2">
              {result.redFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{flag.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">{flag.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* HR Questions Checklist */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Questions to Ask HR Before Signing:
            </h3>

            {result.questionsForHr.map((q, idx) => (
              <div
                key={idx}
                onClick={() => toggleQuestion(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-start gap-3 ${
                  checkedQuestions[idx]
                    ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedQuestions[idx]}
                  onChange={() => {}}
                  className="mt-0.5 accent-emerald-500"
                />
                <span className={checkedQuestions[idx] ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                  {q}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && comparisonResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full p-5 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Side-by-Side Offer Comparison
              </h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                <div className="font-bold text-white text-xs">Primary Offer (Offer A)</div>
                <div className="text-xs font-mono text-zinc-400">Fixed: {formatRupees(fixedAnnual)}</div>
                <div className="text-xs font-mono text-zinc-400">Variable: {formatRupees(variableAnnual)}</div>
                <div className="text-xs font-mono text-zinc-400">Bond: {formatRupees(bondAmount)}</div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                <div className="font-bold text-white text-xs">Comparison Offer (Offer B)</div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500">Fixed Annual</label>
                  <input
                    type="number"
                    value={offerBFixed}
                    onChange={(e) => setOfferBFixed(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-500">Variable Annual</label>
                  <input
                    type="number"
                    value={offerBVariable}
                    onChange={(e) => setOfferBVariable(Number(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-mono text-zinc-400 uppercase">Comparison Tradeoffs:</div>
              <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                {comparisonResult.summaryTradeoffs.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <NonAffiliationFooter />
    </div>
  );
};
