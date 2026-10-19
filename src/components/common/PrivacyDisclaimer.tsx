import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Lock, EyeOff, Trash2, Check, X, Database, AlertCircle, HardDrive } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface StorageKeyInfo {
  key: string;
  sizeBytes: number;
  formattedSize: string;
  lastUpdated?: string;
  description: string;
}

const KNOWN_KEY_DESCRIPTIONS: Record<string, string> = {
  'hireflow-storage-v4': 'Primary Candidate Profile, Saved Documents & Analysis History',
  'hireflow_session_v3': 'Candidate Auth & Session Token Cache',
  'hireflow_tool_ats_v3': 'ATS Resume Roaster Session & Evaluation State',
  'hireflow_tool_cover_letter_v3': 'Cover Letter Generator Saved Drafts',
  'hireflow_tool_interview_v3': 'Mock Interview Question History',
  'hireflow_tool_job_tracker_v3': 'Job Applications Tracking Ledger',
  'hireflow_tool_outreach_v3': 'Cold Outreach Generator Saved Drafts',
  'hireflow_tool_portfolio_v3': 'Project Brief Portfolio Selections',
  'hireflow_tool_salary_v3': 'Salary & Compensation Calculator State',
  'hireflow-credentials-v1': 'Credential Engine State & Earned Status',
  'hireflow-tailor-ledger-v2': '7-Stage Resume Tailor Fact Ledger Variants',
};

export function PrivacyDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [activeTab, setActiveTab] = useState<'policy' | 'storage'>('policy');
  const clearAllUserData = useStore((s) => s.clearAllUserData);

  const [storageItems, setStorageItems] = useState<StorageKeyInfo[]>([]);

  const loadStorageInfo = () => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const items: StorageKeyInfo[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('hireflow')) {
          const val = window.localStorage.getItem(key) || '';
          const sizeBytes = new Blob([val]).size;
          const formattedSize =
            sizeBytes < 1024
              ? `${sizeBytes} B`
              : `${(sizeBytes / 1024).toFixed(1)} KB`;

          let lastUpdated: string | undefined;
          try {
            const parsed = JSON.parse(val);
            if (parsed.state?.lastModified) lastUpdated = parsed.state.lastModified;
            else if (parsed.state?.timestamp) lastUpdated = new Date(parsed.state.timestamp).toISOString();
          } catch {
            // non-json or unparsed
          }

          items.push({
            key,
            sizeBytes,
            formattedSize,
            lastUpdated,
            description: KNOWN_KEY_DESCRIPTIONS[key] || 'Locally cached application state',
          });
        }
      }
    } catch (err) {
      console.warn('Unable to inspect localStorage:', err);
    }
    setStorageItems(items);
  };

  useEffect(() => {
    if (isOpen) {
      loadStorageInfo();
    }
  }, [isOpen]);

  const totalSizeBytes = useMemo(
    () => storageItems.reduce((acc, item) => acc + item.sizeBytes, 0),
    [storageItems]
  );
  const totalFormattedSize =
    totalSizeBytes < 1024
      ? `${totalSizeBytes} B`
      : `${(totalSizeBytes / 1024).toFixed(1)} KB`;

  const handleClear = () => {
    clearAllUserData();
    if (typeof window !== 'undefined' && window.localStorage) {
      // Clean any other hireflow keys
      const toRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('hireflow')) toRemove.push(k);
      }
      toRemove.forEach((k) => window.localStorage.removeItem(k));
    }
    setCleared(true);
    setShowConfirmClear(false);
    loadStorageInfo();
    setTimeout(() => {
      setCleared(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface-3 transition-colors border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        title="Privacy & Data Protection Notice"
        aria-label="Privacy and Local Data Management"
      >
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Privacy & Data Storage</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-dialog-title"
        >
          <div className="bg-surface max-w-xl w-full rounded-xl border border-border p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="privacy-dialog-title" className="font-semibold text-text text-base">
                    Privacy & Client-Side Storage
                  </h3>
                  <p className="text-[11px] text-text-muted">100% In-Browser · Zero Remote Data Egress</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-2 shrink-0">
              <button
                onClick={() => setActiveTab('policy')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'policy'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Privacy Guarantees
              </button>
              <button
                onClick={() => {
                  setActiveTab('storage');
                  loadStorageInfo();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'storage'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-surface-2'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                What&apos;s stored on this device ({totalFormattedSize})
              </button>
            </div>

            {/* Tab 1: Privacy Guarantees */}
            {activeTab === 'policy' && (
              <div className="space-y-3 text-xs text-text-muted leading-relaxed overflow-y-auto pr-1">
                <div className="flex items-start gap-2.5">
                  <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block font-medium">Local-Only Processing (P-1, P-2)</strong>
                    Your resumes, extracted facts, and target job descriptions are parsed entirely in-browser on your device. We do not transmit your documents to external analytics, advertising trackers, or cloud models.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block font-medium">DPDP Act 2023 Principles</strong>
                    We adhere to Purpose Limitation and Data Minimization. Mock evaluation data persists strictly in your browser session and is never repurposed.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-text block font-medium">Right to Erasure (One-Click Deletion)</strong>
                    You retain full control over your candidate profile and all stored data. Click &ldquo;Clear all my data&rdquo; below to permanently purge every localStorage record from this device.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: What's stored on this device */}
            {activeTab === 'storage' && (
              <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
                <div className="p-3 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-text">Total Local Storage Footprint:</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{totalFormattedSize}</span>
                </div>

                {storageItems.length === 0 ? (
                  <div className="text-center py-6 text-text-muted">
                    <Check className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="font-medium text-text">Zero Local Data Stored</p>
                    <p className="text-[11px]">Your browser storage contains no cached HireFlow records.</p>
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px]" aria-label="Device storage ledger">
                      <thead>
                        <tr className="bg-surface-2 border-b border-border text-text-muted font-semibold">
                          <th className="p-2">Storage Key</th>
                          <th className="p-2">Description</th>
                          <th className="p-2 text-right">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {storageItems.map((item) => (
                          <tr key={item.key} className="hover:bg-surface-2/50 transition-colors">
                            <td className="p-2 font-mono text-emerald-400 font-medium truncate max-w-[140px]" title={item.key}>
                              {item.key}
                            </td>
                            <td className="p-2 text-text-muted">{item.description}</td>
                            <td className="p-2 text-right font-mono font-bold text-text shrink-0">{item.formattedSize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Confirmation Alert */}
            {showConfirmClear && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shrink-0 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block font-bold text-rose-200">Confirm Complete Data Erasure?</strong>
                  <p className="text-[11px] leading-relaxed">
                    This action will permanently delete all parsed resumes, saved tailor variants, outreach drafts, and preferences from this browser. This cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleClear}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors"
                    >
                      Yes, Permanently Erase
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-text-muted hover:text-text text-[11px] transition-colors border border-border"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between shrink-0">
              {!showConfirmClear && (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  disabled={cleared || storageItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-rose-500/20 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
                  aria-label="Clear all my data from device"
                >
                  {cleared ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>All Data Erased</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Clear all my data</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors ml-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
