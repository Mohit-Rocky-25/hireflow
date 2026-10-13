// ============================================================
// HIREFLOW PRIVACY & SECURITY CENTER
// Transparency ledger and one-click data purge control
// ============================================================

import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';

export function PrivacyTab() {
  const { wipeAllData, activeProject } = useTailorStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [wipedSuccess, setWipedSuccess] = useState(false);

  const handleWipe = () => {
    wipeAllData();
    setConfirmDelete(false);
    setWipedSuccess(true);
    setTimeout(() => setWipedSuccess(false), 3000);
  };

  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hireflow_audit_${activeProject.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Candidate Privacy & Zero-Leak Security Center
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Strict privacy boundaries, data sovereignty, and immediate erasure guarantees
            </p>
          </div>
        </div>
      </div>

      {wipedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All local storage, cached profiles, and tailoring projects have been permanently purged.</span>
        </div>
      )}

      {/* Security Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            🔒
          </div>
          <h3 className="text-sm font-bold text-slate-900">100% Local Execution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By default, all document parsing, occupational taxonomy lookups, and truth checks run entirely within your local browser runtime.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            🚫
          </div>
          <h3 className="text-sm font-bold text-slate-900">Zero AI Model Training</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Candidate resumes, contact details, and employer histories are strictly never used to train public or proprietary machine learning models.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            ⚡
          </div>
          <h3 className="text-sm font-bold text-slate-900">Immediate Data Purge</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            You retain absolute sovereignty over your documents. One click erases all in-memory projects and local browser persistence.
          </p>
        </div>
      </div>

      {/* Action Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Data Audit & Erasure Controls
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-sm font-bold text-slate-900">Download Audit Ledger</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Export full JSON snapshot of candidate facts, evidence mappings, and version history.
            </div>
          </div>
          <button
            onClick={handleExportAuditJson}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-2 transition"
          >
            <FileCode className="w-4 h-4" />
            <span>Export Audit JSON</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
          <div>
            <div className="text-sm font-bold text-rose-900">Wipe All Stored Data</div>
            <div className="text-xs text-rose-700 mt-0.5">
              Irreversibly delete all saved profiles, job descriptions, and local state from this browser.
            </div>
          </div>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleWipe}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Yes, Permanently Purge Everything
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge All Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
