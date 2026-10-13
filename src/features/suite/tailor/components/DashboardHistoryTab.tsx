// ============================================================
// HIREFLOW VERSION HISTORY & PROJECT DASHBOARD
// Snapshot tracking, timestamps, and version restore
// ============================================================

import React from 'react';
import { History, ArrowRight, Calendar } from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';

export function DashboardHistoryTab() {
  const { activeProject, setStage, setActiveTab } = useTailorStore();
  const history = activeProject.versionHistory;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Project Snapshots & Version History
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Active Project: <span className="text-slate-800 font-semibold">{activeProject.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Saved Version Ledger ({history.length})
        </h3>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.version}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                  v{item.version}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.summary}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.savedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('pipeline');
                  setStage('editor');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Open in Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
