import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from './useMySpaceStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import {
  buildSummarySentence,
  getNextBestAction,
  buildWatchlistRows,
} from './mySpaceSelectors';
import { humanizeEnum } from '@/lib/ui/copy';
import { formatDelta } from '@/features/journal/deltaEngine';

import type { AuditEntry, GapOverlay, PlanItem, WatchlistTarget } from '@/domain/types';

interface OverviewSectionProps {
  onNavigateSection?: (section: string) => void;
  onSelectAudit?: (auditId: string) => void;
  audits?: Record<string, AuditEntry>;
  targets?: Record<string, WatchlistTarget>;
  planItems?: Record<string, PlanItem>;
  gapOverlay?: GapOverlay;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  onNavigateSection = () => {},
  onSelectAudit = () => {},
  audits: propAudits,
  targets: propTargets,
  planItems: propPlanItems,
  gapOverlay: propGapOverlay,
}) => {
  const navigate = useNavigate();
  const { displayName } = useAuthStore();
  const storeEntries = useAuditStore((s) => s.entries);
  const storeGapOverlay = useAuditStore((s) => s.gapStatus);
  const storeWatchlist = useMySpaceStore((s) => s.watchlist);
  const storePlanItems = useMySpaceStore((s) => s.planItems);

  const entries = propAudits ?? storeEntries;
  const gapOverlay = propGapOverlay ?? storeGapOverlay;
  const watchlist = propTargets ?? storeWatchlist;
  const planItems = propPlanItems ?? storePlanItems;

  const auditsList = Object.values(entries).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const targetsList = Object.values(watchlist);
  const planList = Object.values(planItems);

  const firstName = (displayName || 'Mohit').split(' ')[0];
  const summarySentence = buildSummarySentence(auditsList, gapOverlay);
  const nextAction = getNextBestAction(auditsList, targetsList, planList, gapOverlay);

  // Recent scans (up to 3)
  const recentScans = auditsList.slice(0, 3);

  // Active plan items (up to 3)
  const recentPlanItems = [...planList]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  // Best target data for aside
  const watchlistRows = buildWatchlistRows(targetsList, auditsList);
  const bestTargetRow = watchlistRows.find((r) => r.latestScore !== null) || watchlistRows[0];
  const bestAudit = bestTargetRow?.lastAuditId ? entries[bestTargetRow.lastAuditId] : auditsList[0];

  // Still open gaps for best target
  const openGaps = bestAudit
    ? bestAudit.gaps.filter((g) => gapOverlay[g.id]?.status !== 'resolved')
    : [];
  const plannedGapIds = new Set(planList.flatMap((p) => p.linkedGapIds));

  // Score trend points for sparkline
  const trendScores = bestTargetRow?.sparkline || [];
  const sparkPoints = trendScores.length >= 2
    ? trendScores
        .map((score, index) => {
          const x = 6 + (index / (trendScores.length - 1)) * 258;
          // Scale 0-100 to y 64-10
          const y = 64 - (score / 100) * 54;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  return (
    <div className="grid grid-cols-1 min-[1100px]:grid-cols-[minmax(0,1fr)_270px] gap-10 lg:gap-14">
      {/* ── Left Main Column ── */}
      <div>
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase">
          My Space
        </div>
        <h1 className="text-[44px] max-sm:text-[34px] leading-[1.05] tracking-[-0.02em] font-bold text-[#f1f1e8] mt-3 mb-4">
          {firstName}
        </h1>
        <p className="text-[19px] max-sm:text-[17px] leading-[1.5] text-[#d9d9cd] max-w-[58ch]">
          {summarySentence}
        </p>

        {/* Next Best Action Card */}
        <div className="my-7 flex max-sm:flex-col items-center max-sm:items-stretch gap-4 sm:gap-5 p-5 sm:p-5.5 rounded-xl border border-[#24241c] bg-gradient-to-b from-[#10100d] to-[#090907]">
          <div className="flex-1 text-[#9b9b8c] text-[14.5px]">
            <b className="block text-[#f1f1e8] text-base font-semibold mb-0.5">
              {nextAction.title}
            </b>
            {nextAction.description}
          </div>
          <button
            type="button"
            onClick={() => {
              if (nextAction.actionUrl.startsWith('/?my=')) {
                const section = new URLSearchParams(nextAction.actionUrl.replace('/?', '')).get('my') || 'plan';
                onNavigateSection(section);
              } else {
                navigate(nextAction.actionUrl);
              }
            }}
            className="h-[42px] px-5 rounded-full font-bold text-sm bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            {nextAction.buttonText}
          </button>
        </div>

        {/* Recent Scans Section */}
        <div className="mt-9">
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h3 className="text-[15px] font-semibold text-[#f1f1e8]">Recent scans</h3>
            <button
              type="button"
              onClick={() => onNavigateSection('scans')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              See all scans
            </button>
          </header>

          {recentScans.length === 0 ? (
            <div className="py-6 text-sm text-[#9b9b8c]">No scans recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {recentScans.map((audit) => {
                const deltaPts = audit.delta?.overallDeltaPts ?? null;
                const dateLabel = new Date(audit.createdAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <div
                    key={audit.id}
                    onClick={() => onSelectAudit(audit.id)}
                    className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#10100d]/60 px-2 -mx-2 rounded transition-colors"
                  >
                    <div>
                      <div className="font-medium text-[#f1f1e8] text-[14px]">
                        {[audit.jd.company, audit.jd.roleTitle].filter(Boolean).join(', ')}
                      </div>
                      <div className="text-[#6d6d61] text-[13px]">
                        {humanizeEnum(audit.kind)}, {audit.resume.label}, {dateLabel}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums whitespace-nowrap flex items-center gap-2">
                      <span className="font-semibold text-[#f1f1e8] text-[15px]">
                        {audit.overallScore} <small className="text-[#6d6d61] font-normal">of 100</small>
                      </span>
                      {deltaPts !== null && (
                        <span
                          className={`text-[12.5px] font-semibold px-2 py-0.5 rounded-full ${
                            deltaPts >= 0
                              ? 'text-[#faff69] bg-[#faff69]/10'
                              : 'text-[#ff8a70] bg-[#ff8a70]/10'
                          }`}
                        >
                          {formatDelta(deltaPts)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* In Your Plan Section */}
        <div className="mt-9">
          <header className="flex justify-between items-baseline pb-2.5 border-b border-[#24241c]">
            <h3 className="text-[15px] font-semibold text-[#f1f1e8]">In your plan</h3>
            <button
              type="button"
              onClick={() => onNavigateSection('plan')}
              className="text-[13px] text-[#9b9b8c] hover:text-[#faff69] transition-colors cursor-pointer"
            >
              See plan
            </button>
          </header>

          {recentPlanItems.length === 0 ? (
            <div className="py-6 text-sm text-[#9b9b8c]">No items in your plan yet.</div>
          ) : (
            <div className="divide-y divide-[#1b1b15]">
              {recentPlanItems.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[#f1f1e8] text-[14px]">{item.title}</div>
                    <div className="text-[#6d6d61] text-[13px]">
                      {humanizeEnum(item.kind)}
                      {item.linkedGapIds?.length
                        ? `, addresses ${item.linkedGapIds.length} ${item.linkedGapIds.length === 1 ? 'gap' : 'gaps'}`
                        : ''}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 text-[13px] ${
                      item.status === 'done'
                        ? 'text-[#faff69]'
                        : item.status === 'in_progress'
                        ? 'text-[#faff69]'
                        : 'text-[#9b9b8c]'
                    }`}
                  >
                    <i
                      className={`w-2 h-2 rounded-full border ${
                        item.status === 'done'
                          ? 'bg-[#faff69] border-[#faff69]'
                          : item.status === 'in_progress'
                          ? 'border-[#faff69] bg-gradient-to-r from-[#faff69] to-transparent'
                          : 'border-[#6d6d61]'
                      }`}
                    />
                    <span>{humanizeEnum(item.status)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right Aside Column ── */}
      {bestTargetRow && (
        <aside className="sticky top-0 self-start pt-1.5 max-[1100px]:static max-[1100px]:mt-2">
          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase">
            {bestTargetRow.target.companyName} trend
          </div>

          <div className="flex items-baseline gap-2 mt-3.5">
            <span className="text-[84px] max-sm:text-[64px] leading-[0.95] font-bold tracking-[-0.04em] font-mono tabular-nums text-[#f1f1e8]">
              {bestTargetRow.latestScore ?? 0}
            </span>
            <small className="text-[#6d6d61] text-base">of 100</small>
          </div>

          <p className="mt-2 mb-5 text-[#9b9b8c] text-[13.5px]">
            {trendScores.length} {trendScores.length === 1 ? 'scan' : 'scans'} recorded
          </p>

          {trendScores.length >= 2 && (
            <>
              <svg
                className="w-full h-[74px] mb-2"
                viewBox="0 0 270 74"
                preserveAspectRatio="none"
                aria-label={`Score trend: ${trendScores.join(', ')}`}
              >
                <line x1="0" y1="73" x2="270" y2="73" stroke="#24241c" />
                <polyline
                  points={sparkPoints}
                  fill="none"
                  stroke="#faff69"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {trendScores.map((score, index) => {
                  const x = 6 + (index / (trendScores.length - 1)) * 258;
                  const y = 64 - (score / 100) * 54;
                  const isLast = index === trendScores.length - 1;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r={isLast ? 5 : 4}
                      fill={isLast ? '#faff69' : '#090907'}
                      stroke={isLast ? '#faff69' : '#6d6d61'}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
              <div className="flex justify-between text-[#6d6d61] text-xs font-mono tabular-nums">
                {trendScores.map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            </>
          )}

          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase mt-8 mb-2">
            Still open for {bestTargetRow.target.companyName}
          </div>

          <div className="divide-y divide-[#1b1b15]">
            {openGaps.length === 0 ? (
              <div className="py-2 text-xs text-[#9b9b8c]">Zero open gaps.</div>
            ) : (
              openGaps.map((g) => {
                const inPlan = plannedGapIds.has(g.id);
                return (
                  <div key={g.id} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-medium text-[#f1f1e8]">{g.label}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        inPlan
                          ? 'border-[#faff69]/40 text-[#faff69] bg-[#faff69]/10'
                          : 'border-[#24241c] text-[#9b9b8c]'
                      }`}
                    >
                      {inPlan ? 'In your plan' : 'Not planned'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
