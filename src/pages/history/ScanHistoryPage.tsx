/**
 * HireFlow v4: Scan History & Progression Compare Page (A3.3)
 * Timeline of Resume Strength scores over time, target grouping,
 * and side-by-side scan delta comparison with engine version checks.
 */

import React, { useState, useMemo } from 'react';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Tag } from '../../components/common/Tag';
import { CompanyLogo } from '../../components/common/CompanyLogo';
import { useScanHistoryStore } from '../../store/scanHistoryStore';
import { ScanRecord } from '../../types/schemas-v4';
import {
  History,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function ScanHistoryPage() {
  const { scans, deleteScan, clearAllScans } = useScanHistoryStore();
  const [selectedScanA, setSelectedScanA] = useState<string | null>(null);
  const [selectedScanB, setSelectedScanB] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Group scans by targetLabel
  const scansByTarget = useMemo(() => {
    const map = new Map<string, ScanRecord[]>();
    for (const scan of scans) {
      const list = map.get(scan.targetLabel) || [];
      list.push(scan);
      map.set(scan.targetLabel, list);
    }
    return map;
  }, [scans]);

  // Selected compare objects
  const scanA = useMemo(() => scans.find((s) => s.id === selectedScanA) || null, [scans, selectedScanA]);
  const scanB = useMemo(() => scans.find((s) => s.id === selectedScanB) || null, [scans, selectedScanB]);

  // Chart data for first target with multiple scans
  const activeTargetEntry = Array.from(scansByTarget.entries())[0];
  const chartData = useMemo(() => {
    if (!activeTargetEntry) return [];
    return [...activeTargetEntry[1]]
      .reverse()
      .map((s, idx) => ({
        index: idx + 1,
        date: s.createdAt.slice(5, 10),
        score: s.scores.overall || s.scores.finalScore || 0,
        label: s.targetLabel,
      }));
  }, [activeTargetEntry]);

  const areTargetsDifferent = scanA && scanB && scanA.targetHash !== scanB.targetHash;
  const areEnginesDifferent =
    scanA && scanB && (scanA.engineVersion !== scanB.engineVersion || scanA.configFingerprint !== scanB.configFingerprint);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <PublicNavbar />

      <header className="max-w-5xl mx-auto px-4 pt-4 pb-4 text-center sm:text-left">
        <h1 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2 uppercase">
          <History className="h-6 w-6 text-volt" />
          <span>Scan History & Progression</span>
        </h1>
        <p className="mt-1 text-sm font-mono text-neutral-400">
          Audit trail of resume evaluations, score trends over time, and side-by-side scan comparisons.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {scans.length === 0 ? (
          <div className="rounded border border-charcoal bg-surface p-12 text-center space-y-3">
            <History className="h-10 w-10 text-neutral-600 mx-auto" />
            <h3 className="text-base font-mono font-semibold text-white uppercase tracking-wider">No Scan Records Yet</h3>
            <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
              Run an ATS Resume scan or JD Match evaluation to automatically begin recording your progression.
            </p>
          </div>
        ) : (
          <>
            {/* Progression Chart */}
            {chartData.length > 1 && (
              <div className="rounded border border-charcoal bg-surface p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-volt" />
                    <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">
                      Score Progression: {activeTargetEntry[0]}
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    {chartData.length} recorded scans
                  </span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#282828" />
                      <XAxis dataKey="date" stroke="#666666" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#666666" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#000000',
                          borderColor: 'rgba(65, 65, 65, 0.8)',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#faff69"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#faff69', stroke: '#000000', strokeWidth: 1 }}
                        activeDot={{ r: 6, fill: '#f4fc44', stroke: '#000000', strokeWidth: 2 }}
                        name="Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Compare Selector Bar */}
            <div className="rounded border border-charcoal bg-surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-volt" />
                <h2 className="text-sm font-mono font-semibold text-white uppercase tracking-wider">Compare Two Scans</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px] font-bold">Scan A (Baseline)</label>
                  <select
                    value={selectedScanA || ''}
                    onChange={(e) => setSelectedScanA(e.target.value || null)}
                    className="w-full rounded border border-charcoal bg-surface-elevated px-3 py-2 text-white font-mono text-xs focus:border-volt focus:outline-none"
                  >
                    <option value="">Select first scan...</option>
                    {scans.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.createdAt.slice(0, 10)} — {s.targetLabel} ({s.tool})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-mono uppercase text-[10px] font-bold">Scan B (Comparison)</label>
                  <select
                    value={selectedScanB || ''}
                    onChange={(e) => setSelectedScanB(e.target.value || null)}
                    className="w-full rounded border border-charcoal bg-surface-elevated px-3 py-2 text-white font-mono text-xs focus:border-volt focus:outline-none"
                  >
                    <option value="">Select second scan...</option>
                    {scans.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.createdAt.slice(0, 10)} — {s.targetLabel} ({s.tool})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warnings if targets or engines differ */}
              {areTargetsDifferent && (
                <div className="rounded border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>Different targets: scores are evaluated against distinct JDs and are not directly comparable.</span>
                </div>
              )}

              {areEnginesDifferent && (
                <div className="rounded border border-volt/30 bg-volt/10 p-3 text-xs font-mono text-volt flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-volt" />
                  <span>Scoring rules or engine versions changed between these scans: compare with care.</span>
                </div>
              )}

              {/* Compare Delta Table */}
              {scanA && scanB && (
                <div className="pt-3 border-t border-charcoal space-y-3">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                    Side-by-Side Pillar Comparison
                  </h4>
                  <div className="overflow-x-auto font-mono text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-charcoal text-neutral-400">
                          <th className="py-2 px-3 font-mono uppercase text-[10px]">Evaluation Metric</th>
                          <th className="py-2 px-3">{scanA.createdAt.slice(0, 10)} (A)</th>
                          <th className="py-2 px-3">{scanB.createdAt.slice(0, 10)} (B)</th>
                          <th className="py-2 px-3 text-right">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal/60">
                        {Object.keys({ ...scanA.pillars, ...scanB.pillars }).map((pillarKey) => {
                          const valA = scanA.pillars[pillarKey] || 0;
                          const valB = scanB.pillars[pillarKey] || 0;
                          const diff = valB - valA;
                          return (
                            <tr key={pillarKey} className="hover:bg-surface-elevated">
                              <td className="py-2 px-3 capitalize text-neutral-200">{pillarKey}</td>
                              <td className="py-2 px-3 text-neutral-300">{valA}</td>
                              <td className="py-2 px-3 text-neutral-300">{valB}</td>
                              <td className="py-2 px-3 text-right font-semibold">
                                <span className={diff > 0 ? 'text-volt' : diff < 0 ? 'text-rose-400' : 'text-neutral-400'}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Scans List Grouped by Target */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-5 w-5 text-volt" />
                  <span>Recorded Scans by Target ({scans.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded border border-charcoal bg-surface-elevated hover:bg-neutral-800 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All Scans</span>
                </button>
              </div>

              <div className="space-y-4">
                {Array.from(scansByTarget.entries()).map(([target, targetScans]) => (
                  <div key={target} className="rounded border border-charcoal bg-surface p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal pb-2">
                      <div className="flex items-center gap-2">
                        <CompanyLogo company={target} size="xs" showBorder={false} interactive={false} />
                        <span className="font-mono font-semibold text-white text-sm">{target}</span>
                      </div>
                      <span className="text-xs text-neutral-400 font-mono">{targetScans.length} scans</span>
                    </div>

                    <div className="space-y-2">
                      {targetScans.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded bg-black border border-charcoal p-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Tag variant="default" size="sm">{s.tool}</Tag>
                              <span className="text-neutral-300 font-mono font-medium">Resume: {s.resumeLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {s.createdAt.slice(0, 16).replace('T', ' ')}
                              </span>
                              <span>v{s.engineVersion}</span>
                              <span>Hash: {s.targetHash.slice(0, 12)}...</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-neutral-500 font-mono block">OVERALL</span>
                              <span className="text-base font-bold font-mono text-volt">
                                {s.scores.overall || s.scores.finalScore || '—'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteScan(s.id)}
                              aria-label="Delete this scan"
                              className="rounded p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Clear Confirmation */}
      <ConfirmDialog
        isOpen={isClearAllModalOpen}
        onCancel={() => setIsClearAllModalOpen(false)}
        onConfirm={() => {
          clearAllScans();
          setIsClearAllModalOpen(false);
        }}
        title="Clear All Scan Records?"
        message="This action will permanently delete all scan records from your history. This cannot be undone."
        confirmText="Clear History"
        isDestructive={true}
      />
    </div>
  );
}
