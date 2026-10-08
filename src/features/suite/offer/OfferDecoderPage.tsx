// ============================================================
// Suite UI — Offer Decoder (/tools/offer-decoder)
// Decision Group: "What offer should I take?"
// Gross-to-net waterfall, Section 87A marginal relief tax engine,
// side-by-side multi-offer comparison, and contract risk flags.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
  ShieldAlert,
  Sliders,
  Plus,
  Trash2,
  HelpCircle,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { OfferInput, OfferResult, PreferenceWeights } from './types';
import { computeOffer } from './calc';
import { COMPANIES, Company } from '../../../pages/demo/talentLensData';
import { PROFESSIONAL_TAX_RATES } from '../../../data/suite/professional-tax';

const DEFAULT_OFFERS: OfferInput[] = [
  {
    id: 'offer-1',
    companyName: 'Razorpay',
    roleTitle: 'Senior Backend Engineer',
    workState: 'KA',
    workCity: 'Bangalore',
    fixedPay: 2400000,
    basicSalaryMode: 'percentage',
    basicSalaryPct: 50,
    variablePay: 300000,
    variablePayoutPct: 100,
    joiningBonus: 200000,
    joiningBonusClawbackMonths: 12,
    relocationBonus: 50000,
    retentionBonus: 0,
    esopGrantValue: 1200000,
    esopVestingYears: 4,
    esopCliffMonths: 12,
    esopListed: false,
    ctcIncludesEmployerPF: true,
    ctcIncludesGratuity: true,
    ctcIncludesInsurance: true,
    serviceBondAmount: 0,
    serviceBondMonths: 0,
    noticePeriodDays: 60,
    employeePFMode: '12_percent_basic',
    taxRegime: 'new',
  },
  {
    id: 'offer-2',
    companyName: 'Swiggy',
    roleTitle: 'SDE-2 (Platform)',
    workState: 'KA',
    workCity: 'Bangalore',
    fixedPay: 2600000,
    basicSalaryMode: 'percentage',
    basicSalaryPct: 50,
    variablePay: 200000,
    variablePayoutPct: 90,
    joiningBonus: 100000,
    joiningBonusClawbackMonths: 12,
    relocationBonus: 0,
    retentionBonus: 100000,
    esopGrantValue: 1600000,
    esopVestingYears: 4,
    esopCliffMonths: 12,
    esopListed: true,
    ctcIncludesEmployerPF: true,
    ctcIncludesGratuity: true,
    ctcIncludesInsurance: false,
    serviceBondAmount: 150000,
    serviceBondMonths: 18,
    noticePeriodDays: 90,
    employeePFMode: '12_percent_basic',
    taxRegime: 'new',
  },
];

export function OfferDecoderPage() {
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState<OfferInput[]>(DEFAULT_OFFERS);
  const [selectedOfferIdx, setSelectedOfferIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'in-hand' | 'compare' | 'risks'>('in-hand');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingOffer, setEditingOffer] = useState<OfferInput | null>(null);

  // Preference Sliders
  const [weights, setWeights] = useState<PreferenceWeights>({
    cashNow: 3,
    brandTier: 3,
    stability: 3,
    equityUpside: 3,
  });

  // URL Prefill support
  useEffect(() => {
    const compParam = searchParams.get('company');
    const ctcParam = searchParams.get('ctc');
    if (compParam && ctcParam) {
      const ctcVal = parseInt(ctcParam, 10);
      if (!isNaN(ctcVal) && ctcVal > 0) {
        const foundComp = COMPANIES.find((c) => c.id.toLowerCase() === compParam.toLowerCase() || c.name.toLowerCase() === compParam.toLowerCase());
        const fixedEst = Math.round(ctcVal * 0.8);
        const varEst = Math.round(ctcVal * 0.1);
        const newOffer: OfferInput = {
          id: `offer-${Date.now()}`,
          companyName: foundComp ? foundComp.name : compParam,
          roleTitle: 'Software Engineer',
          workState: 'KA',
          fixedPay: fixedEst,
          basicSalaryMode: 'percentage',
          basicSalaryPct: 50,
          variablePay: varEst,
          variablePayoutPct: 100,
          joiningBonus: 0,
          joiningBonusClawbackMonths: 0,
          relocationBonus: 0,
          retentionBonus: 0,
          esopGrantValue: Math.round(ctcVal * 0.1 * 4),
          esopVestingYears: 4,
          esopCliffMonths: 12,
          esopListed: false,
          ctcIncludesEmployerPF: true,
          ctcIncludesGratuity: true,
          ctcIncludesInsurance: true,
          serviceBondAmount: 0,
          serviceBondMonths: 0,
          noticePeriodDays: 60,
          employeePFMode: '12_percent_basic',
          taxRegime: 'new',
        };
        setOffers((prev) => [newOffer, ...prev.slice(0, 2)]);
      }
    }
  }, [searchParams]);

  // Computed results for each offer
  const results: OfferResult[] = useMemo(() => {
    return offers.map((o) => computeOffer(o));
  }, [offers]);

  const activeResult = results[selectedOfferIdx] || results[0];

  // Lookup reference data from Dataset 6
  const referenceDataMap = useMemo<Record<string, Company | undefined>>(() => {
    const map: Record<string, Company | undefined> = {};
    for (const o of offers) {
      map[o.id] = COMPANIES.find((c) => c.name.toLowerCase() === o.companyName.toLowerCase() || c.id === o.companyName.toLowerCase());
    }
    return map;
  }, [offers]);

  // Handlers for managing offers
  const handleAddNewOffer = () => {
    if (offers.length >= 3) return;
    const newOffer: OfferInput = {
      id: `offer-${Date.now()}`,
      companyName: 'New Offer',
      roleTitle: 'Senior Engineer',
      workState: 'KA',
      fixedPay: 2000000,
      basicSalaryMode: 'percentage',
      basicSalaryPct: 50,
      variablePay: 200000,
      variablePayoutPct: 100,
      joiningBonus: 100000,
      joiningBonusClawbackMonths: 12,
      relocationBonus: 0,
      retentionBonus: 0,
      esopGrantValue: 800000,
      esopVestingYears: 4,
      esopCliffMonths: 12,
      esopListed: false,
      ctcIncludesEmployerPF: true,
      ctcIncludesGratuity: true,
      ctcIncludesInsurance: true,
      serviceBondAmount: 0,
      serviceBondMonths: 0,
      noticePeriodDays: 60,
      employeePFMode: '12_percent_basic',
      taxRegime: 'new',
    };
    setOffers([...offers, newOffer]);
    setEditingOffer(newOffer);
    setIsDrawerOpen(true);
  };

  const handleEditOffer = (offer: OfferInput) => {
    setEditingOffer({ ...offer });
    setIsDrawerOpen(true);
  };

  const handleDeleteOffer = (id: string) => {
    if (offers.length <= 1) return;
    const filtered = offers.filter((o) => o.id !== id);
    setOffers(filtered);
    if (selectedOfferIdx >= filtered.length) setSelectedOfferIdx(0);
  };

  const handleSaveDrawer = () => {
    if (!editingOffer) return;
    setOffers(offers.map((o) => (o.id === editingOffer.id ? editingOffer : o)));
    setIsDrawerOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-text-muted">
            <Link to="/tools" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Tools Hub
            </Link>
            <span>/</span>
            <span className="text-secondary font-medium">Offer Decoder</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Offer Decoder &amp; Real Cash Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Stage 6
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Decision Group: <strong className="text-text">"What offer should I take?"</strong> — Section 87A marginal
            relief waterfall, monthly take-home, 4-year equity, and contract risk flags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {offers.length < 3 && (
            <button
              onClick={handleAddNewOffer}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-surface transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Offer ({offers.length}/3)
            </button>
          )}
        </div>
      </div>

      {/* Trust Notice Banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border text-xs text-text-muted">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          <strong>Estimate only</strong>, not tax or financial advice. Tax rules last verified:{' '}
          <span className="text-text font-medium">Oct 2026 (FY 2026-27)</span>. Actual take-home depends on your
          employer's payroll policies.
        </span>
      </div>

      {/* Offer Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          {offers.map((offer, idx) => {
            const isSelected = selectedOfferIdx === idx;
            return (
              <button
                key={offer.id}
                onClick={() => setSelectedOfferIdx(idx)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-primary shadow-sm'
                    : 'bg-surface border-border text-text-muted hover:text-text'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{offer.companyName}</span>
                <span className="text-[10px] text-text-muted font-normal">
                  (₹{Math.round(results[idx]?.monthlyInHand || 0).toLocaleString('en-IN')}/mo)
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditOffer(offers[selectedOfferIdx])}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface hover:bg-surface-elevated text-text transition-colors"
          >
            Edit Current Offer
          </button>
          {offers.length > 1 && (
            <button
              onClick={() => handleDeleteOffer(offers[selectedOfferIdx].id)}
              className="p-1.5 text-xs rounded-lg border border-border bg-surface hover:text-rose-400 text-text-muted transition-colors"
              title="Delete Offer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Metric Cards for Active Offer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly In-Hand */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Monthly In-Hand
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Guaranteed Cash
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{activeResult.monthlyInHand.toLocaleString('en-IN')}
            <span className="text-xs text-text-muted font-normal ml-1">/ month</span>
          </div>
          <p className="text-xs text-text-muted">
            Net cash credited in regular months after PF, PT, and Section 87A TDS.
          </p>
        </div>

        {/* Year-1 Real Cash */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Year-1 Total Cash
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              With Bonuses
            </span>
          </div>
          <div className="text-3xl font-extrabold text-primary">
            ₹{activeResult.year1Cash.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-text-muted">
            Guaranteed net + expected variable + joining bonus + relocation.
          </p>
        </div>

        {/* 4-Year Total Value */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              4-Year Cash + Equity
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Full Horizon
            </span>
          </div>
          <div className="text-3xl font-extrabold text-secondary">
            ₹{activeResult.fourYearCash.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-text-muted">
            ₹{activeResult.fourYearCashOnly.toLocaleString('en-IN')} cash + ₹{(offers[selectedOfferIdx].esopGrantValue || 0).toLocaleString('en-IN')} vested equity.
          </p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('in-hand')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'in-hand'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Gross-to-Net Waterfall
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'compare'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Scale className="w-4 h-4" /> Side-by-Side Comparison ({offers.length} Offers)
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'risks'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Contract Risk Flags ({activeResult.riskFlags.length})
        </button>
      </div>

      {/* Tab 1: Gross-to-Net Waterfall */}
      {activeTab === 'in-hand' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> CTC to Take-Home Waterfall
            </h3>

            <div className="space-y-3 pt-2">
              {activeResult.waterfall.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border flex items-center justify-between ${
                    step.kind === 'final'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : step.kind === 'deduction'
                      ? 'bg-rose-500/5 border-border'
                      : 'bg-background/60 border-border'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-text">{step.label}</div>
                    <div className="text-[11px] text-text-muted">{step.description}</div>
                  </div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      step.kind === 'final'
                        ? 'text-emerald-400'
                        : step.kind === 'deduction'
                        ? 'text-rose-400'
                        : 'text-text'
                    }`}
                  >
                    {step.amount > 0 && step.kind !== 'final' ? '+' : ''}
                    ₹{Math.abs(step.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 87A Marginal Relief Pill */}
            {activeResult.marginalReliefApplied && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Section 87A Marginal Relief Applied:</strong> Your taxable income of ₹
                  {activeResult.taxableIncome.toLocaleString('en-IN')} slightly exceeded ₹12,00,000.
                  Under Finance Act rules, tax was capped at the excess income, saving you ₹
                  {activeResult.marginalReliefBenefit.toLocaleString('en-IN')}.
                </div>
              </div>
            )}
          </div>

          {/* Stated CTC Breakdown */}
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                What in CTC is NOT Immediate Cash?
              </span>
              <div className="text-2xl font-black text-rose-400">
                ₹{activeResult.nonCashInCTC.toLocaleString('en-IN')}
              </div>
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-text-muted">
                  <span>Employer PF (Statutory)</span>
                  <span className="text-text font-mono">₹{activeResult.nonCashBreakdown.employerPF.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Gratuity Provision</span>
                  <span className="text-text font-mono">₹{activeResult.nonCashBreakdown.gratuity.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Medical Insurance Premium</span>
                  <span className="text-text font-mono">₹{activeResult.nonCashBreakdown.insurance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Unvested Equity (Year 1)</span>
                  <span className="text-text font-mono">₹{activeResult.nonCashBreakdown.unvestedEquityYear1.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-2 text-xs text-text-muted leading-relaxed">
              <span className="font-bold text-text uppercase text-[11px] block">CTC Reality Ratio</span>
              Your guaranteed monthly cash represents{' '}
              <strong className="text-text font-mono">{activeResult.inHandPercentageOfCTC}%</strong> of your
              advertised gross package. The remaining balance comprises statutory deductions, deferred bonus, or equity.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Comparison */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Sliders Card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                "What Matters to Me" Weighted Preference Model
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-text-muted mb-1">Cash In-Hand ({weights.cashNow}/5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={weights.cashNow}
                  onChange={(e) => setWeights({ ...weights, cashNow: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1">Brand / Tier ({weights.brandTier}/5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={weights.brandTier}
                  onChange={(e) => setWeights({ ...weights, brandTier: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1">Contract Stability ({weights.stability}/5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={weights.stability}
                  onChange={(e) => setWeights({ ...weights, stability: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-text-muted mb-1">Equity Upside ({weights.equityUpside}/5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={weights.equityUpside}
                  onChange={(e) => setWeights({ ...weights, equityUpside: parseInt(e.target.value, 10) })}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="bg-surface border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="p-3.5 font-bold text-text-muted uppercase text-[11px]">Metric / Factor</th>
                  {offers.map((o) => (
                    <th key={o.id} className="p-3.5 font-bold text-text text-sm">
                      {o.companyName}
                      <span className="block text-xs font-normal text-text-muted">{o.roleTitle}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3.5 font-semibold text-text">Monthly In-Hand</td>
                  {results.map((r) => (
                    <td key={r.offerId} className="p-3.5 font-mono font-bold text-emerald-400">
                      ₹{r.monthlyInHand.toLocaleString('en-IN')}/mo
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text">Year-1 Total Cash</td>
                  {results.map((r) => (
                    <td key={r.offerId} className="p-3.5 font-mono font-bold text-primary">
                      ₹{r.year1Cash.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text">4-Year Cash + Equity</td>
                  {results.map((r) => (
                    <td key={r.offerId} className="p-3.5 font-mono text-purple-400">
                      ₹{r.fourYearCash.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text">Equity Share of CTC</td>
                  {results.map((r) => (
                    <td key={r.offerId} className="p-3.5">
                      {r.equityShareOfCTC}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text">Variable Dependency</td>
                  {results.map((r) => (
                    <td key={r.offerId} className="p-3.5">
                      {r.variableDependencyPct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text">Service Bond / Clawback</td>
                  {offers.map((o) => (
                    <td key={o.id} className="p-3.5">
                      {o.serviceBondAmount > 0 ? (
                        <span className="text-rose-400 font-medium">₹{o.serviceBondAmount.toLocaleString('en-IN')} ({o.serviceBondMonths}m)</span>
                      ) : (
                        <span className="text-emerald-400">None</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Reference Data Rows from Dataset 6 */}
                <tr className="bg-background/30">
                  <td colSpan={offers.length + 1} className="p-2.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Market Intelligence Reference (Dataset 6)
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text-muted">Market Tier</td>
                  {offers.map((o) => (
                    <td key={o.id} className="p-3.5 font-medium text-text">
                      {referenceDataMap[o.id]?.tier || 'Tier 2 / Tech Enterprise'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text-muted">Glassdoor Rating</td>
                  {offers.map((o) => (
                    <td key={o.id} className="p-3.5 font-medium text-text">
                      ⭐ {referenceDataMap[o.id]?.glassdoor || 4.2} / 5.0
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-text-muted">Hiring Trend</td>
                  {offers.map((o) => (
                    <td key={o.id} className="p-3.5 font-medium text-text capitalize">
                      {referenceDataMap[o.id]?.trend || 'Steady'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Objective Arithmetic Differences (No Arbitrary Winner) */}
          {results.length >= 2 && (
            <div className="p-4 rounded-xl bg-surface border border-border text-xs text-text space-y-2">
              <span className="font-bold uppercase tracking-wider text-text-muted text-[11px] block">
                Arithmetic Comparison Summary
              </span>
              <p>
                • <strong>{results[0].companyName}</strong> provides ₹
                {Math.abs(results[0].monthlyInHand - results[1].monthlyInHand).toLocaleString('en-IN')} / month{' '}
                {results[0].monthlyInHand >= results[1].monthlyInHand ? 'more' : 'less'} in guaranteed take-home cash
                than <strong>{results[1].companyName}</strong>.
              </p>
              <p>
                • <strong>{results[1].companyName}</strong> has a {results[1].equityShareOfCTC}% equity composition
                compared to {results[0].equityShareOfCTC}% at <strong>{results[0].companyName}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Contract Risk Flags */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          {activeResult.riskFlags.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border rounded-xl text-emerald-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8" />
              <div className="text-sm font-semibold">Zero Critical Risk Flags Detected</div>
              <p className="text-xs text-text-muted">
                No service bonds, no aggressive clawbacks, and reasonable variable pay proportions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeResult.riskFlags.map((flag) => (
                <div
                  key={flag.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    flag.severity === 'high'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : flag.severity === 'medium'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      flag.severity === 'high'
                        ? 'text-rose-400'
                        : flag.severity === 'medium'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-text">{flag.title}</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{flag.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Offer Drawer */}
      {isDrawerOpen && editingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-surface border-l border-border h-full max-w-lg w-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text">Edit Offer Details</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-text-muted hover:text-text text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-text-muted mb-1">Company Name</label>
                <input
                  type="text"
                  value={editingOffer.companyName}
                  onChange={(e) => setEditingOffer({ ...editingOffer, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1">Role Title</label>
                <input
                  type="text"
                  value={editingOffer.roleTitle}
                  onChange={(e) => setEditingOffer({ ...editingOffer, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1">Annual Fixed Pay (₹)</label>
                  <input
                    type="number"
                    value={editingOffer.fixedPay}
                    onChange={(e) => setEditingOffer({ ...editingOffer, fixedPay: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Target Variable (₹)</label>
                  <input
                    type="number"
                    value={editingOffer.variablePay}
                    onChange={(e) => setEditingOffer({ ...editingOffer, variablePay: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1">Joining Bonus (₹)</label>
                  <input
                    type="number"
                    value={editingOffer.joiningBonus}
                    onChange={(e) => setEditingOffer({ ...editingOffer, joiningBonus: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Clawback (Months)</label>
                  <input
                    type="number"
                    value={editingOffer.joiningBonusClawbackMonths}
                    onChange={(e) => setEditingOffer({ ...editingOffer, joiningBonusClawbackMonths: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted mb-1">ESOP Grant (₹)</label>
                  <input
                    type="number"
                    value={editingOffer.esopGrantValue}
                    onChange={(e) => setEditingOffer({ ...editingOffer, esopGrantValue: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted mb-1">Work State (PT)</label>
                  <select
                    value={editingOffer.workState}
                    onChange={(e) => setEditingOffer({ ...editingOffer, workState: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text focus:outline-none focus:border-primary"
                  >
                    {Object.values(PROFESSIONAL_TAX_RATES).map((st) => (
                      <option key={st.stateCode} value={st.stateCode}>
                        {st.stateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-semibold text-text block">CTC Composition Toggles</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffer.ctcIncludesEmployerPF}
                    onChange={(e) => setEditingOffer({ ...editingOffer, ctcIncludesEmployerPF: e.target.checked })}
                    className="rounded text-primary border-border"
                  />
                  <span>Employer PF (12%) included in quoted CTC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOffer.ctcIncludesGratuity}
                    onChange={(e) => setEditingOffer({ ...editingOffer, ctcIncludesGratuity: e.target.checked })}
                    className="rounded text-primary border-border"
                  />
                  <span>Gratuity included in quoted CTC</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-surface-elevated text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDrawer}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-surface"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default OfferDecoderPage;
