import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { buildTimeline, groupByDay, type TimelineItem } from './portalSelectors';
import { Panel } from './components/Panel';
import { EmptyState } from './components/EmptyState';
import type { AuditEntry, JournalEvent, ToolKind, Uuid } from '@/domain/types';
import { Clock, Eye, Layers } from 'lucide-react';

interface AuditTimelineProps {
  entries?: Record<Uuid, AuditEntry>;
  events?: Record<Uuid, JournalEvent>;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  entries: propEntries,
  events: propEvents,
}) => {
  const navigate = useNavigate();
  const storeEntries = useAuditStore((s) => s.entries);
  const entries = propEntries ?? storeEntries;
  const storeEvents = useAuditStore((s) => s.events);
  const events = propEvents ?? storeEvents;

  const [activeFilter, setActiveFilter] = useState<ToolKind | 'all'>('all');

  const timelineItems = buildTimeline(
    Object.values(entries),
    Object.values(events),
    { kind: activeFilter }
  );

  const grouped = groupByDay(timelineItems);

  const filterTabs: Array<{ label: string; value: ToolKind | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'ATS Roaster', value: 'ats_roast' },
    { label: 'TalentLens', value: 'talentlens' },
    { label: 'Tailor', value: 'tailor' },
  ];

  return (
    <Panel
      title="Audit Journal"
      count={timelineItems.length}
      subtitle="Immutable event ledger of all scans, scores, and candidate events"
      action={
        <div className="flex items-center gap-1 font-mono text-xs">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                activeFilter === tab.value
                  ? 'bg-[#faff69] text-black font-semibold'
                  : 'bg-[#141410] text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
    >
      {grouped.length === 0 ? (
        <EmptyState
          message="No evaluation activity recorded"
          description="Scans performed across the ATS Roaster, TalentLens, and Tailor tools are logged here with snapshot hashes and delta trajectories."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.day} className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold px-1">
                {new Date(group.day).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded border border-neutral-800 bg-[#0c0c0a] hover:border-neutral-700 transition-colors font-mono text-xs flex items-center justify-between gap-3"
                  >
                    {/* Time & Title info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 shrink-0">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>{new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-neutral-200 font-semibold truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Score / Delta / Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      {item.score !== null && (
                        <div className="flex items-baseline gap-1 text-right">
                          <span className="font-bold text-neutral-100">{item.score}</span>
                          <span className="text-[10px] text-neutral-500">/100</span>
                        </div>
                      )}

                      {item.deltaPts !== null && item.deltaPts !== 0 && (
                        <span
                          className={`text-[10px] font-semibold px-1 py-0.2 rounded ${
                            item.deltaPts > 0
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {item.deltaPts > 0 ? `+${item.deltaPts}` : item.deltaPts}%
                        </span>
                      )}

                      {item.auditId ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/portal/audits/${item.auditId}`)}
                          className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-800 bg-[#141410] text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer text-[11px]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-neutral-600 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                          <Layers className="w-3 h-3 text-neutral-500" />
                          <span>Log</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
