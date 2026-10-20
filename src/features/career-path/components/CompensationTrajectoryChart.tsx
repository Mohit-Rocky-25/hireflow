// ============================================================
// HIREFLOW CAREER PATH — COMPENSATION TRAJECTORY CHART
// Interactive Recharts AreaChart with 2025 Market Realities Note
// Supports both Student and Professional Career Timelines
// ============================================================

import React from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Info, TrendingUp } from 'lucide-react';
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

export const formatChartINRTick = (val: number): string => {
  if (val === 0) return '₹0';
  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  const l = Math.round(val / 100000);
  return `₹${l} L`;
};

export const renderCompTimelineTick = (timeline: CompDataPoint[]) => (props: any) => {
  const { x, y, payload } = props;
  const pt = timeline.find((d) => d.year === payload?.value) || timeline[props.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>
        {payload?.value}
      </text>
      {pt?.levelCode && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#38bdf8" fontSize={10} fontWeight={700}>
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
  gradientId = 'emeraldGradientTrajectory',
  prefersReducedMotion = false,
}: CompensationTrajectoryChartProps) {
  if (!timeline || timeline.length === 0) return null;

  const startSalary = timeline[0]?.salary || 0;
  const endSalary = timeline[timeline.length - 1]?.salary || 0;

  const defaultAriaLabel =
    ariaLabel ||
    `Projected compensation trajectory from ${formatINR(startSalary)} to ${formatINR(endSalary)} across ${timeline.length} milestones.`;

  return (
    <div className="pt-2 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          {title}
        </span>
        {subtitle && <span className="text-[11px] text-muted">{subtitle}</span>}
      </div>

      <div role="img" aria-label={defaultAriaLabel} className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 12, right: 24, left: 10, bottom: 26 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tick={renderCompTimelineTick(timeline)}
              interval={0}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={formatChartINRTick}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as CompDataPoint;
                  return (
                    <div className="bg-neutral-900 border border-neutral-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1 backdrop-blur-md">
                      <p className="font-black text-white">
                        {data.year} • {data.companyName} ({data.levelCode})
                      </p>
                      <p className="text-emerald-400 font-extrabold text-sm">
                        Total Annual CTC: {formatINR(data.salary)}
                      </p>
                      <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-800">
                        <p>Fixed Base: {formatINR(data.base)}</p>
                        <p>Annual Stock: {formatINR(data.stock)}</p>
                        <p>Yearly Bonus: {formatINR(data.bonus)}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="salary"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              dot={{ r: 4, fill: '#10b981', stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 4 }}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
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
              <th scope="col">Base Pay</th>
              <th scope="col">Stock / Equity</th>
              <th scope="col">Bonus</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((d, i) => (
              <tr key={i}>
                <td>{d.year}</td>
                <td>{d.companyName}</td>
                <td>{d.levelCode}</td>
                <td>{formatINR(d.salary)}</td>
                <td>{formatINR(d.base)}</td>
                <td>{formatINR(d.stock)}</td>
                <td>{formatINR(d.bonus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explicit 2025 Market Realities Note */}
      <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/80 flex items-start gap-2.5 text-[11px] text-secondary leading-relaxed">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-foreground">2025 Market Reality Calibration: </span>
          <span>
            Projected figures aggregate verified India compensation bands (base pay, target variable bonus, and annualized 4-year ESOP/RSU vesting). Actual CTC offers vary based on campus tier policies (Tier-1 Day-1 bands vs. off-campus pools), macro hiring freezes, and candidate interview rating.
          </span>
        </div>
      </div>
    </div>
  );
}
