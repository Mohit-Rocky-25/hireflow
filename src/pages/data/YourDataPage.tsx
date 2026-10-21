/**
 * HireFlow v4: Your Data & Local Storage Settings Page (C9.1 - C9.4)
 * Local-only data inspection, JSON export/import with checksum verification,
 * storage persistence checker, and typed-confirmation data erasure.
 */

import React, { useState, useEffect } from 'react';
import { PageNav } from '../../components/common/PageNav';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { Tag } from '../../components/common/Tag';
import { toast } from '../../components/ui/Toast';
import { backupRegistry, ImportMode } from '../../lib/backup/registry';
import {
  generateBackup,
  downloadBackupFile,
  validateBackupFile,
  applyBackup,
  BackupValidationResult,
} from '../../lib/backup';
import { storage } from '../../lib/storage';
import { cloudSync, CloudSyncMetadata } from '../../lib/sync/cloudSync';
import {
  Database,
  Download,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Cloud,
  Share2,
} from 'lucide-react';

export function YourDataPage() {
  const [storesInfo, setStoresInfo] = useState<
    Array<{ key: string; itemsCount: number; sizeKb: number }>
  >([]);
  const [totalSizeKb, setTotalSizeKb] = useState(0);
  const [persistentStatus, setPersistentStatus] = useState<string>('checking...');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [allowChecksumOverride, setAllowChecksumOverride] = useState(false);
  const [rawUploadText, setRawUploadText] = useState<string | null>(null);
  const [syncMeta, setSyncMeta] = useState<CloudSyncMetadata>(cloudSync.getMetadata());
  const [isSyncing, setIsSyncing] = useState(false);

  // Refresh storage metrics
  const refreshStorageMetrics = () => {
    const sections = backupRegistry.getAll();
    const info = sections.map((sec) => {
      let count = 0;
      let rawSize = 0;
      try {
        const data = sec.export();
        if (Array.isArray(data)) count = data.length;
        else if (data && typeof data === 'object') count = Object.keys(data).length;
        else if (data) count = 1;
        rawSize = JSON.stringify(data).length * 2;
      } catch {
        count = 0;
      }
      return {
        key: sec.key,
        itemsCount: count,
        sizeKb: Math.round((rawSize / 1024) * 10) / 10,
      };
    });

    setStoresInfo(info);
    const totalBytes = storage.estimateBytes();
    setTotalSizeKb(Math.round((totalBytes / 1024) * 10) / 10);
  };

  useEffect(() => {
    refreshStorageMetrics();

    // Check navigator storage persistence
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
      navigator.storage
        .persisted()
        .then((persisted) => {
          setPersistentStatus(persisted ? 'Granted (Safe from browser auto-cleanup)' : 'Not granted (Session-managed)');
        })
        .catch(() => setPersistentStatus('Unsupported on this browser'));
    } else {
      setPersistentStatus('Unsupported on this browser / HTTP LAN');
    }
  }, []);

  const handleRequestPersistence = async () => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const granted = await navigator.storage.persist();
        setPersistentStatus(granted ? 'Granted (Safe from browser auto-cleanup)' : 'Denied by browser');
        if (granted) {
          toast('success', 'Persistent storage granted successfully.');
        } else {
          toast('info', 'Persistent storage was not granted by your browser.');
        }
      } catch (err: any) {
        toast('error', `Failed to request persistence: ${err.message}`);
      }
    }
  };

  const handleExport = () => {
    const filename = downloadBackupFile();
    toast('success', `Exported backup to ${filename}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawUploadText(text);
      const res = validateBackupFile(text, { allowChecksumMismatch: allowChecksumOverride });
      setValidationResult(res);
      if (!res.valid) {
        toast('error', res.error || 'Invalid backup file');
      } else {
        toast('info', 'Backup file validated. Review sections below before applying.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!validationResult || !validationResult.backupFile) return;

    const outcome = applyBackup(validationResult.backupFile, importMode);
    if (outcome.success) {
      toast('success', `Successfully imported ${outcome.applied.length} data section(s).`);
      setValidationResult(null);
      setRawUploadText(null);
      refreshStorageMetrics();
    } else {
      toast('error', 'Import failed or all sections were skipped.');
    }
  };

  const handleClearAllData = () => {
    window.localStorage.clear();
    toast('success', 'All local data has been permanently cleared.');
    setIsClearModalOpen(false);
    refreshStorageMetrics();
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    const result = await cloudSync.triggerSync();
    setIsSyncing(false);
    setSyncMeta(cloudSync.getMetadata());
    if (result.success) {
      toast('success', result.message);
    } else {
      toast('warning', result.message);
    }
  };

  const handleExportShareableProfile = () => {
    const profile = cloudSync.generateShareableProfile(
      'Verified Candidate',
      'Software Engineer',
      ['TypeScript', 'React', 'Go', 'Docker', 'PostgreSQL'],
      88
    );
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-verified-profile-${profile.profileId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Exported signed Shareable Candidate Profile bundle.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <PageNav fallbackRoute="/tools" />

      <header className="max-w-4xl mx-auto px-4 pt-20 pb-4 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white">Your Data & Local Storage</h1>
        <p className="mt-1 text-sm text-slate-400">Privacy-First Data Ownership & Client-Side Control</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        {/* Privacy Promise Banner */}
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-5 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h2 className="text-base font-semibold text-white">100% Client-Side Privacy Guarantee</h2>
            <p className="mt-1 text-slate-300 leading-relaxed">
              HireFlow does not use tracking cookies, remote analytics, or telemetry. All resumes, job descriptions, scan histories, and user notes are saved strictly in your browser&apos;s local storage.
            </p>
          </div>
        </div>

        {/* Persistence Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Browser Storage Durability</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">Status: <span className="text-slate-200 font-medium">{persistentStatus}</span></p>
          </div>
          <button
            type="button"
            onClick={handleRequestPersistence}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Request Permanent Storage</span>
          </button>
        </div>

        {/* What's Stored Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">What&apos;s Stored on This Device</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Storage: <strong className="text-emerald-400 font-semibold">{totalSizeKb} KB</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Data Section</th>
                  <th className="py-2.5 px-3">Items Stored</th>
                  <th className="py-2.5 px-3">Est. Size</th>
                  <th className="py-2.5 px-3 text-right">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {storesInfo.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500 font-sans">
                      No data registered yet. Run scans or save items to begin.
                    </td>
                  </tr>
                ) : (
                  storesInfo.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-white">{item.key}</td>
                      <td className="py-2.5 px-3 text-slate-300">{item.itemsCount}</td>
                      <td className="py-2.5 px-3 text-slate-400">{item.sizeKb} KB</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">hireflow:v4:{item.key}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export & Import Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Export Data Backup</h3>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Download a signed, tamper-checked JSON file of your resumes, scan history, saved JDs, credentials, and settings.
              </p>
              <div className="mt-3 rounded-lg border border-amber-800/40 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>This backup contains personal career data. Store it in a secure location.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Backup (.json)</span>
            </button>
          </div>

          {/* Import Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">Import Data Backup</h3>
              </div>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Restore data from a previously exported JSON backup. Files are strictly schema-validated before applying.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Backup File</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Validation Preview */}
            {validationResult && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <span>Backup Preview</span>
                  </span>
                  <Tag variant={validationResult.checksumMatch ? 'verified' : 'needs-recheck'} size="sm">
                    {validationResult.checksumMatch ? 'Checksum Verified' : 'Checksum Mismatch'}
                  </Tag>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {validationResult.preview.map((sec) => (
                    <div
                      key={sec.key}
                      className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-900/60"
                    >
                      <span className="font-medium text-slate-200">{sec.key}</span>
                      <span className="text-slate-400">
                        {sec.itemsInFile} items {sec.isValid ? '✓' : '⚠️'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <SegmentedControl<ImportMode>
                    name="importMode"
                    size="sm"
                    value={importMode}
                    onChange={setImportMode}
                    options={[
                      { value: 'merge', label: 'Merge' },
                      { value: 'replace', label: 'Replace' },
                    ]}
                  />

                  <button
                    type="button"
                    onClick={handleApplyImport}
                    className="rounded-md bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition-colors"
                  >
                    Apply Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cloud Sync & Shareable Verification Portfolio (P5) */}
        <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">Cloud Sync & Shareable Portfolio (P5)</h3>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Offline-first state synchronization and cryptographically signed candidate verification bundles for recruiter sharing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Status: {syncMeta.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Local-First State Sync</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Snapshots all stores with SHA-256 fingerprinting. Queues changes when offline.
              </p>
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>{isSyncing ? 'Syncing...' : 'Sync Snapshot Now'}</span>
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Shareable Candidate Portfolio</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Generate a signed, tamper-evident JSON bundle of your verified skills and ATS readiness.
              </p>
              <button
                type="button"
                onClick={handleExportShareableProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Signed Bundle (.json)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone: Clear Data */}
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              <h3 className="text-base font-semibold text-white">Erase All Local Data</h3>
            </div>
            <p className="mt-1 text-xs text-rose-300/80 leading-relaxed">
              Permanently clears all locally stored resumes, JDs, scan history, notes, and preferences from this browser. This cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsClearModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-rose-700 bg-rose-600/20 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-600 hover:text-white transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </main>

      {/* Confirmation Dialog for Data Erasure */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        onCancel={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAllData}
        title="Permanently Clear All Local Data?"
        message="This action will completely wipe all resumes, target job descriptions, scan history, and notes from this device. Please ensure you have downloaded a backup if you wish to retain your records."
        confirmText="Erase Everything"
        isDestructive={true}
        requiredConfirmationWord="CLEAR"
      />
    </div>
  );
}
