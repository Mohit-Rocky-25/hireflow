// ============================================================
// HIREFLOW CAREER PATH — COMPENSATION TRAJECTORY CHART
// Interactive Recharts AreaChart with 2024-2026 Market Baseline
// Supports Indian Tax Take-Home Toggle, Vesting Presets, and Disclaimers
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Info, TrendingUp, DollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { CompDataPoint, formatINR } from '../../../lib/careerEngine';

export interface CompensationTrajectoryChartProps {
  timeline: CompDataPoint[];
  title?: string;
  subtitle?: string;
  ariaLabel?: string;
  tableCaption?: string;
  gradientId?: string;
  prefersReducedMotion?: boolean;
}

export type VestingPreset = 'standard' | 'backloaded' | 'frontloaded';

export const formatChartINRTick = (val: number): string => {
  if (val === 0) return '₹0';
  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  const l = Math.round(val / 100000);
  return `₹${l} L`;
};

/**
 * Calculates approximate annual income tax under India New Tax Regime (FY 2024–2026)
 * Includes standard deduction of ₹75,000 and 4% cess.
 */
export function estimateIndiaIncomeTax(grossAnnual: number): number {
  if (grossAnnual <= 0) return 0;
  const standardDeduction = 75000;
  const taxableIncome = Math.max(0, grossAnnual - standardDeduction);

  if (taxableIncome <= 700000) {
    // Section 87A rebate applies for taxable income up to 7 Lakhs
    return 0;
  }

  let tax = 0;
  if (taxableIncome > 1500000) {
    tax += (taxableIncome - 1500000) * 0.30;
    tax += 300000 * 0.20; // 12L to 15L
    tax += 200000 * 0.15; // 10L to 12L
    tax += 300000 * 0.10; // 7L to 10L
    tax += 400000 * 0.05; // 3L to 7L
  } else if (taxableIncome > 1200000) {
    tax += (taxableIncome - 1200000) * 0.20;
    tax += 200000 * 0.15;
    tax += 300000 * 0.10;
    tax += 400000 * 0.05;
  } else if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.15;
    tax += 300000 * 0.10;
    tax += 400000 * 0.05;
  } else if (taxableIncome > 700000) {
    tax += (taxableIncome - 700000) * 0.10;
    tax += 400000 * 0.05;
  } else if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * 0.05;
  }

  // 4% Health & Education Cess
  return Math.round(tax * 1.04);
}

export const renderCompTimelineTick = (timeline: CompDataPoint[]) => (props: any) => {
  const { x, y, payload } = props;
  const pt = timeline.find((d) => d.year === payload?.value) || timeline[props.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#a0a0a0" fontSize={11} fontWeight={600}>
        {payload?.value}
      </text>
      {pt?.levelCode && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#faff69" fontSize={10} fontWeight={700}>
          {pt.levelCode}
        </text>
      )}
    </g>
  );
};

export function CompensationTrajectoryChart({
  timeline,
  title = 'Projected Compensation Trajectory (Per Year in INR)',
  subtitle,
  ariaLabel,
  tableCaption = 'Projected Career Compensation Timeline',
  gradientId = 'voltGradientTrajectory',
  prefersReducedMotion = false,
}: CompensationTrajectoryChartProps) {
  const [vestingPreset, setVestingPreset] = useState<VestingPreset>('standard');
  const [showTakeHome, setShowTakeHome] = useState<boolean>(false);

  if (!timeline || timeline.length === 0) return null;

  // Compute adjusted data with vesting presets and tax calculations
  const chartData = useMemo(() => {
    return timeline.map((pt, idx) => {
      let annualStock = pt.stock;

      // If user selected non-standard vesting schedule:
      // Base stock in data is already annualized (4-year grant / 4).
      // Total 4-year grant = annualStock * 4.
      const totalFourYearStockGrant = pt.stock * 4;
      const yearIndex = Math.min(idx, 3); // Year 0, 1, 2, 3+

      if (vestingPreset === 'backloaded') {
        // Amazon style: 5%, 15%, 40%, 40%
        const rates = [0.05, 0.15, 0.40, 0.40];
        annualStock = Math.round(totalFourYearStockGrant * rates[yearIndex]);
      } else if (vestingPreset === 'frontloaded') {
        // Frontloaded style: 33%, 33%, 22%, 12%
        const rates = [0.33, 0.33, 0.22, 0.12];
        annualStock = Math.round(totalFourYearStockGrant * rates[yearIndex]);
      }

      const totalAnnualCtc = pt.base + pt.bonus + annualStock;
      const estimatedTax = estimateIndiaIncomeTax(totalAnnualCtc);
      const estimatedNetAnnual = Math.max(0, totalAnnualCtc - estimatedTax);
      const estimatedMonthlyTakeHome = Math.round(estimatedNetAnnual / 12);

      return {
        ...pt,
        adjustedStock: annualStock,
        totalAnnualCtc,
        estimatedTax,
        estimatedNetAnnual,
        estimatedMonthlyTakeHome,
        // The metric plotted on chart
        plotSalary: showTakeHome ? estimatedNetAnnual : totalAnnualCtc,
      };
    });
  }, [timeline, vestingPreset, showTakeHome]);

  const startSalary = chartData[0]?.plotSalary || 0;
  const endSalary = chartData[chartData.length - 1]?.plotSalary || 0;

  const defaultAriaLabel =
    ariaLabel ||
    `Projected compensation trajectory from ${formatINR(startSalary)} to ${formatINR(endSalary)} across ${chartData.length} milestones.`;

  return (
    <div className="pt-2 space-y-4">
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-silver uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-volt" />
            {title}
          </span>
          <span className="text-[11px] text-muted block mt-0.5 font-mono">
            market estimate for India (Bangalore / Hyderabad / NCR baseline, 2024–2026)
          </span>
        </div>

        {/* Controls: Vesting preset & Take-Home toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vesting Selector */}
          <div className="flex items-center gap-1 p-0.5 rounded bg-near-black border border-charcoal text-[11px]">
            <span className="text-muted px-1.5 font-mono">Vesting:</span>
            <button
              type="button"
              onClick={() => setVestingPreset('standard')}
              className={`px-2 py-1 rounded font-mono font-bold transition-colors cursor-pointer ${
                vestingPreset === 'standard'
                  ? 'bg-volt text-black'
                  : 'text-silver hover:text-white'
              }`}
              title="Standard 4-year grant, 25% per year with 1-year cliff"
            >
              25% Equal
            </button>
            <button
              type="button"
              onClick={() => setVestingPreset('backloaded')}
              className={`px-2 py-1 rounded font-mono font-bold transition-colors cursor-pointer ${
                vestingPreset === 'backloaded'
                  ? 'bg-volt text-black'
                  : 'text-silver hover:text-white'
              }`}
              title="Amazon style backloaded: 5% / 15% / 40% / 40%"
            >
              5/15/40/40
            </button>
          </div>

          {/* Take-Home Toggle */}
          <button
            type="button"
            onClick={() => setShowTakeHome(!showTakeHome)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showTakeHome
                ? 'bg-volt text-black border-volt'
                : 'bg-near-black text-silver border-charcoal hover:text-white hover:border-silver'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {showTakeHome ? 'Viewing: Est. In-Hand Pay' : 'Show In-Hand Estimate'}
          </button>
        </div>
      </div>

      {/* Main Area Chart */}
      <div role="img" aria-label={defaultAriaLabel} className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 24, left: 10, bottom: 26 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#faff69" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#faff69" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(65,65,65,0.8)" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#a0a0a0"
              fontSize={11}
              tickLine={false}
              tick={renderCompTimelineTick(chartData)}
              interval={0}
            />
            <YAxis
              stroke="#a0a0a0"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(65,65,65,0.8)' }}
              tickFormatter={formatChartINRTick}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as any;
                  return (
                    <div className="bg-near-black border border-charcoal rounded p-3.5 shadow-2xl text-xs space-y-1.5 max-w-xs">
                      <div className="border-b border-charcoal pb-1">
                        <p className="font-black text-white">
                          {data.year} • {data.companyName} ({data.levelCode})
                        </p>
                        <p className="text-[10px] text-muted font-mono">
                          market estimate for India (Bangalore / Hyd / NCR)
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-volt font-black text-sm">
                          Total Annual CTC: {formatINR(data.totalAnnualCtc)}
                        </p>
                        <p className="text-white text-xs font-mono">
                          Est. Annual In-Hand: {formatINR(data.estimatedNetAnnual)}{' '}
                          <span className="text-[10px] text-silver font-normal">
                            (~{formatINR(data.estimatedMonthlyTakeHome)}/mo)
                          </span>
                        </p>
                      </div>

                      <div className="text-[10px] text-silver space-y-0.5 pt-1.5 border-t border-charcoal">
                        <p>Fixed Base: {formatINR(data.base)}</p>
                        <p>
                          Annual Stock ({vestingPreset}): {formatINR(data.adjustedStock)}
                        </p>
                        <p>Yearly Bonus: {formatINR(data.bonus)}</p>
                        <p className="text-amber-400 font-mono">
                          Est. Income Tax: -{formatINR(data.estimatedTax)}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="plotSalary"
              stroke="#faff69"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={{ r: 4, fill: '#000000', stroke: '#faff69', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#faff69', stroke: '#000000', strokeWidth: 2 }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible hidden data table for screen readers */}
      <div className="sr-only">
        <table>
          <caption>{tableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Company</th>
              <th scope="col">Level</th>
              <th scope="col">Total Annual CTC</th>
              <th scope="col">Est In-Hand</th>
              <th scope="col">Base Pay</th>
              <th scope="col">Stock / Equity</th>
              <th scope="col">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d, i) => (
              <tr key={i}>
                <td>{d.year}</td>
                <td>{d.companyName}</td>
                <td>{d.levelCode}</td>
                <td>{formatINR(d.totalAnnualCtc)}</td>
                <td>{formatINR(d.estimatedNetAnnual)}</td>
                <td>{formatINR(d.base)}</td>
                <td>{formatINR(d.adjustedStock)}</td>
                <td>{formatINR(d.bonus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Vesting Note */}
      <div className="p-3 rounded bg-black border border-charcoal text-[11px] text-silver space-y-1">
        <div className="flex items-center gap-1.5 text-white font-bold">
          <Info className="w-3.5 h-3.5 text-volt" />
          <span>Vesting Assumption &amp; Annualized Stock Rule:</span>
        </div>
        <p>
          Stock / RSU values reflect the annualized 1-year vesting tranche, not a total 4-year grant. On a standard 4-year equal schedule, a ₹40 Lakh RSU grant vests at ₹10 Lakhs/year after a 1-year cliff. On backloaded plans (Amazon style 5/15/40/40), Year 1 vesting is 5% and Year 2 is 15%, heavily skewing compensation into Years 3 and 4.
        </p>
      </div>

      {/* Income Tax & Sourcing Disclaimer */}
      <div className="p-3.5 rounded bg-black/80 border border-charcoal space-y-2 text-[11px] text-silver leading-relaxed">
        <div className="flex items-start gap-2 text-pale-yellow font-semibold">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Tax &amp; Negotiation Disclaimer</span>
        </div>
        <p>
          Take-home pay is a rough estimate assuming the standard New Tax Regime (FY 2024–2026) with standard deduction. Actual deductions depend on investments, employer NPS, EPF deductions, and bonus payment schedules.
        </p>
        <p className="pt-1 border-t border-charcoal/60 text-silver font-medium">
          Salaries are crowdsourced estimates and may not reflect current offers. Verify through peer networks, LeetCode compensation threads or Glassdoor before negotiating.
        </p>
      </div>
    </div>
  );
}
