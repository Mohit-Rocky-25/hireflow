/**
 * HireFlow v4: Scan History & Progression Compare Page (A3.3)
 * Timeline of Resume Strength scores over time, target grouping,
 * and side-by-side scan delta comparison with engine version checks.
 */

import React, { useState, useMemo } from 'react';
import { PageNav } from '../../components/common/PageNav';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Tag } from '../../components/common/Tag';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <PageNav fallbackRoute="/tools" />

      <header className="max-w-5xl mx-auto px-4 pt-20 pb-4 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="h-6 w-6 text-emerald-400" />
          <span>Scan History & Progression</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Audit trail of resume evaluations, score trends over time, and side-by-side scan comparisons.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        {scans.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <History className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Scan Records Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Run an ATS Resume scan or JD Match evaluation to automatically begin recording your progression.
            </p>
          </div>
        ) : (
          <>
            {/* Progression Chart */}
            {chartData.length > 1 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-white">
                      Score Progression: {activeTargetEntry[0]}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {chartData.length} recorded scans
                  </span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#10b981' }}
                        activeDot={{ r: 6 }}
                        name="Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Compare Selector Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-sky-400" />
                <h2 className="text-sm font-semibold text-white">Compare Two Scans</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Scan A (Baseline)</label>
                  <select
                    value={selectedScanA || ''}
                    onChange={(e) => setSelectedScanA(e.target.value || null)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
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
                  <label className="block text-slate-400 mb-1 font-medium">Scan B (Comparison)</label>
                  <select
                    value={selectedScanB || ''}
                    onChange={(e) => setSelectedScanB(e.target.value || null)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
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
                <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Different targets: scores are evaluated against distinct JDs and are not directly comparable.</span>
                </div>
              )}

              {areEnginesDifferent && (
                <div className="rounded-lg border border-sky-800/40 bg-sky-950/20 p-3 text-xs text-sky-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Scoring rules or engine versions changed between these scans: compare with care.</span>
                </div>
              )}

              {/* Compare Delta Table */}
              {scanA && scanB && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Side-by-Side Pillar Comparison
                  </h4>
                  <div className="overflow-x-auto font-mono text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2 px-3 font-sans">Evaluation Metric</th>
                          <th className="py-2 px-3">{scanA.createdAt.slice(0, 10)} (A)</th>
                          <th className="py-2 px-3">{scanB.createdAt.slice(0, 10)} (B)</th>
                          <th className="py-2 px-3 text-right">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {Object.keys({ ...scanA.pillars, ...scanB.pillars }).map((pillarKey) => {
                          const valA = scanA.pillars[pillarKey] || 0;
                          const valB = scanB.pillars[pillarKey] || 0;
                          const diff = valB - valA;
                          return (
                            <tr key={pillarKey} className="hover:bg-slate-900/40">
                              <td className="py-2 px-3 font-sans capitalize text-slate-200">{pillarKey}</td>
                              <td className="py-2 px-3 text-slate-300">{valA}</td>
                              <td className="py-2 px-3 text-slate-300">{valB}</td>
                              <td className="py-2 px-3 text-right font-semibold">
                                <span className={diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'}>
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
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-400" />
                  <span>Recorded Scans by Target ({scans.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All Scans</span>
                </button>
              </div>

              <div className="space-y-4">
                {Array.from(scansByTarget.entries()).map(([target, targetScans]) => (
                  <div key={target} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-white text-sm">{target}</span>
                      <span className="text-xs text-slate-400 font-mono">{targetScans.length} scans</span>
                    </div>

                    <div className="space-y-2">
                      {targetScans.map((s) => (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-slate-950/60 border border-slate-800/80 p-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Tag variant="default" size="sm">{s.tool}</Tag>
                              <span className="text-slate-300 font-medium">Resume: {s.resumeLabel}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
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
                              <span className="text-[10px] text-slate-500 block">OVERALL</span>
                              <span className="text-base font-bold font-mono text-emerald-400">
                                {s.scores.overall || s.scores.finalScore || '—'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteScan(s.id)}
                              aria-label="Delete this scan"
                              className="rounded p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
