// ============================================================
// HireFlow — Cloud Account, Privacy, Legacy Importer & Private Documents Page
// Replaces local-first backup/sync DB with real Supabase Auth, Postgres RLS,
// Private `user-documents` Storage, and one-time authorized legacy browser import.
// ============================================================

import React, { useEffect, useState } from 'react';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Tag } from '../../components/common/Tag';
import { toast } from '../../components/ui/Toast';
import { useAuthStore, purgeLegacyBrowserUserData } from '../../features/auth/useAuthStore';
import { SignInButton } from '../../features/auth/SignInButton';
import { useCloudSyncStore } from '../../lib/cloud/useCloudSyncStore';
import { useCloudDocumentsStore } from '../../lib/cloud/useDocumentsStore';
import { hydrateUserFromCloud, resetAllUserMemoryStores } from '../../lib/cloud/cloudHydrator';
import {
  inspectLegacyBrowserData,
  runAuthorizedLegacyMigration,
  type LegacyMigrationPreview,
} from '../../lib/cloud/legacyMigration';
import {
  getPrivateDocumentSignedUrl,
  deletePrivateDocument,
} from '../../lib/cloud/storageService';
import { useAuditStore } from '../../features/journal/useAuditStore';
import { useResumeStore } from '../../features/resumes/useResumeStore';
import { useMySpaceStore } from '../../features/my-space/useMySpaceStore';
import { useSavedJdStore } from '../../store/savedJdStore';
import { useFeedbackStore } from '../../store/feedbackStore';
import { useProfileStore } from '../../features/profile/useProfileStore';
import {
  Database,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Cloud,
  FileText,
  ExternalLink,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function YourDataPage() {
  const { status, userId, displayName, email, provider } = useAuthStore();
  const { phase, lastSyncedAt, error: cloudError } = useCloudSyncStore();
  const documents = useCloudDocumentsStore((s) => s.documents);
  const removeDocumentFromStore = useCloudDocumentsStore((s) => s.removeDocument);

  const workspaces = useResumeStore((s) => s.workspaces);
  const versions = useResumeStore((s) => s.versions);
  const audits = useAuditStore((s) => s.entries);
  const savedJds = useSavedJdStore((s) => s.jds);
  const watchlist = useMySpaceStore((s) => s.watchlist);
  const planItems = useMySpaceStore((s) => s.planItems);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const feedbackItems = useFeedbackStore((s) => s.items);
  const profile = useProfileStore((s) => s.profile);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isResyncing, setIsResyncing] = useState(false);
  const [isDeletingAccountData, setIsDeletingAccountData] = useState(false);
  const [legacyPreview, setLegacyPreview] = useState<LegacyMigrationPreview | null>(null);
  const [isImportingLegacy, setIsImportingLegacy] = useState(false);
  const [legacyImportMessage, setLegacyImportMessage] = useState<string | null>(null);

  const isSignedIn = status === 'authenticated' && Boolean(userId);

  const refreshLegacyInspection = async () => {
    const preview = await inspectLegacyBrowserData();
    setLegacyPreview(preview);
  };

  useEffect(() => {
    void refreshLegacyInspection();
  }, []);

  const handleManualResync = async () => {
    if (!isSignedIn || !userId) {
      toast('warning', 'Sign in with Google first to sync your Supabase cloud workspace.');
      return;
    }
    setIsResyncing(true);
    try {
      await hydrateUserFromCloud(userId, { displayName, email });
      toast('success', 'Cloud account records synchronized from Supabase Postgres.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Unable to refresh cloud account.');
    } finally {
      setIsResyncing(false);
    }
  };

  const handleExportCloudJson = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      account: isSignedIn ? { userId, email, provider } : { mode: 'guest_in_memory' },
      profile,
      workspaces: Object.values(workspaces),
      versions: Object.values(versions),
      audits: Object.values(audits),
      savedJds,
      watchlist: Object.values(watchlist),
      planItems: Object.values(planItems),
      outreachDrafts: Object.values(outreachDrafts),
      feedbackItems,
      documents,
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-cloud-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Downloaded JSON export of active session data.');
  };

  const handleImportLegacyData = async () => {
    if (!isSignedIn || !userId) {
      toast('warning', 'Please sign in with Google before importing legacy browser data.');
      return;
    }
    setIsImportingLegacy(true);
    setLegacyImportMessage(null);
    try {
      const result = await runAuthorizedLegacyMigration(userId, legacyPreview ?? undefined);
      if (result.alreadyImported) {
        setLegacyImportMessage(
          'These legacy browser records were already imported previously (verified via import receipt). Local data was not duplicated.'
        );
      } else {
        await hydrateUserFromCloud(userId, { displayName, email });
        await refreshLegacyInspection();
        setLegacyImportMessage(
          `Imported ${result.importedCounts.savedJds} saved JDs, ${result.importedCounts.audits} audits, ${result.importedCounts.workspaces} workspaces, and ${result.importedCounts.watchlistTargets} targets into Supabase Postgres.`
        );
        toast('success', 'Legacy browser records safely imported into your cloud account.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Legacy import failed.';
      setLegacyImportMessage(`Import failed: ${msg}. Local legacy records were preserved intact.`);
      toast('error', msg);
    } finally {
      setIsImportingLegacy(false);
    }
  };

  const handleDownloadPrivateDoc = async (storagePath: string, fileName: string) => {
    if (!userId) return;
    try {
      const signedUrl = await getPrivateDocumentSignedUrl(userId, storagePath, 120);
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Unable to generate signed download link.');
    }
  };

  const handleDeletePrivateDoc = async (docId: string, storagePath: string) => {
    if (!userId) return;
    try {
      await deletePrivateDocument(userId, docId, storagePath);
      removeDocumentFromStore(docId);
      toast('success', 'Deleted private document from Supabase Storage & catalog.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to delete cloud file.');
    }
  };

  const handleEraseData = async () => {
    setIsClearModalOpen(false);
    setIsDeletingAccountData(true);
    try {
      if (isSignedIn) {
        await useAuthStore.getState().deleteAllCloudData();
        toast('success', 'Deleted all Supabase Postgres rows and private Storage objects.');
      } else {
        resetAllUserMemoryStores();
        purgeLegacyBrowserUserData();
        toast('success', 'Cleared transient in-memory session and any stale legacy keys.');
      }
      await refreshLegacyInspection();
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to erase cloud account data.');
    } finally {
      setIsDeletingAccountData(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-20">
      <PublicNavbar />

      <header className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <h1 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center gap-2 uppercase">
          <Database className="h-6 w-6 text-volt" />
          <span>Your Data &amp; Cloud Storage</span>
        </h1>
        <p className="mt-1 text-sm font-mono text-neutral-400">
          Supabase Postgres &amp; Private Storage management, one-time legacy browser importer, and full account erasure.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-6">
        {/* Account Status & Residency */}
        <section className="rounded border border-charcoal bg-surface p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-volt" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  {isSignedIn ? 'Authenticated Cloud Account' : 'Guest Session (Transient In-Memory)'}
                </h2>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                {isSignedIn
                  ? `Signed in as ${email || displayName || userId} (${provider?.toUpperCase() || 'GOOGLE'}). Protected by Supabase RLS.`
                  : 'Zero durable browser storage is written in Guest mode. Sign in with Google to save work permanently in Postgres.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSignedIn ? (
                <Tag variant="verified" size="sm">
                  {phase === 'hydrating'
                    ? 'Syncing...'
                    : phase === 'error'
                    ? 'Cloud Error'
                    : 'Cloud Connected'}
                </Tag>
              ) : (
                <SignInButton returnTo="/data" />
              )}
            </div>
          </div>

          {cloudError && (
            <div role="alert" className="p-3 rounded border border-red-500/40 bg-red-950/40 text-xs font-mono text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{cloudError}</span>
            </div>
          )}

          {/* Live Data Inventory */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded bg-black border border-charcoal">
              <div className="text-neutral-500">Workspaces / Versions</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {Object.keys(workspaces).length} / {Object.keys(versions).length}
              </div>
            </div>
            <div className="p-3 rounded bg-black border border-charcoal">
              <div className="text-neutral-500">ATS Audits</div>
              <div className="text-lg font-bold text-white mt-0.5">{Object.keys(audits).length}</div>
            </div>
            <div className="p-3 rounded bg-black border border-charcoal">
              <div className="text-neutral-500">Saved JDs &amp; Targets</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {savedJds.length} / {Object.keys(watchlist).length}
              </div>
            </div>
            <div className="p-3 rounded bg-black border border-charcoal">
              <div className="text-neutral-500">Private Files</div>
              <div className="text-lg font-bold text-white mt-0.5">{documents.length}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-[11px] font-mono text-neutral-500">
              {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleString()}` : 'Session active'}
            </span>
            <div className="flex flex-wrap gap-2">
              {isSignedIn && (
                <button
                  type="button"
                  onClick={handleManualResync}
                  disabled={isResyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-volt hover:bg-volt-hover text-black text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                  <span>{isResyncing ? 'Syncing...' : 'Refresh from Cloud'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportCloudJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated hover:bg-neutral-800 border border-charcoal text-xs font-mono font-bold uppercase tracking-wider text-neutral-200 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-volt" />
                <span>Export Session JSON</span>
              </button>
            </div>
          </div>
        </section>

        {/* Private Uploaded Documents Catalog (`user-documents`) */}
        <section className="rounded border border-charcoal bg-surface p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-charcoal pb-3">
            <ShieldCheck className="h-5 w-5 text-volt" />
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Private Cloud Documents (`user-documents`)
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                Original uploaded PDF/DOCX files and generated exports are stored in a private per-user bucket with signed temporary URLs only.
              </p>
            </div>
          </div>

          {!isSignedIn ? (
            <p className="text-xs font-mono text-neutral-400">
              Sign in with Google to archive or download original files in private Supabase Storage.
            </p>
          ) : documents.length === 0 ? (
            <p className="text-xs font-mono text-neutral-400">No private files stored in your cloud bucket yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-black border border-charcoal text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-volt shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">{doc.fileName}</div>
                      <div className="text-[11px] text-neutral-500">
                        {doc.docKind} &bull; {formatBytes(doc.byteSize)} &bull; sha256:{doc.sha256.slice(0, 10)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadPrivateDoc(doc.storagePath, doc.fileName)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated border border-charcoal text-neutral-200 hover:border-volt cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Signed Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrivateDoc(doc.id, doc.storagePath)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/30 text-rose-300 hover:bg-rose-950/50 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* One-Time Authorized Legacy Browser Data Importer */}
        <section className="rounded border border-charcoal bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-charcoal pb-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-volt" />
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  One-Time Legacy Browser Data Importer
                </h2>
                <p className="text-[11px] font-mono text-neutral-400">
                  Reads older HireFlow data stored in this browser before cloud migration and uploads it into your Supabase account on explicit approval.
                </p>
              </div>
            </div>
            <HardDrive className="h-5 w-5 text-neutral-500 shrink-0" />
          </div>

          {!legacyPreview?.hasLegacyData ? (
            <p className="text-xs font-mono text-neutral-400">
              No legacy browser-stored HireFlow records detected on this device.
            </p>
          ) : (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded bg-black border border-charcoal text-neutral-300">
                Detected legacy items: {legacyPreview.counts.workspaces} workspaces, {legacyPreview.counts.audits} audits, {legacyPreview.counts.savedJds} saved JDs, {legacyPreview.counts.watchlistTargets} targets, {legacyPreview.counts.planItems} plan items.
              </div>
              <button
                type="button"
                disabled={!isSignedIn || isImportingLegacy}
                onClick={handleImportLegacyData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-volt hover:bg-volt-hover text-black font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>
                  {isImportingLegacy
                    ? 'Importing into Postgres...'
                    : isSignedIn
                    ? 'Import Legacy Data into My Cloud Account'
                    : 'Sign in with Google above to Import'}
                </span>
              </button>
            </div>
          )}

          {legacyImportMessage && (
            <div className="p-3 rounded border border-white/10 bg-black text-xs font-mono text-neutral-200">
              {legacyImportMessage}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="rounded border border-rose-500/40 bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-400" />
              <h2 className="text-base font-mono font-semibold text-white uppercase tracking-tight">
                {isSignedIn ? 'Delete All Cloud & Session Data' : 'Clear Session & Legacy Browser Keys'}
              </h2>
            </div>
            <p className="mt-1 text-xs font-mono text-rose-300/80 leading-relaxed">
              {isSignedIn
                ? 'Permanently erases every Postgres table row (`erase_my_data`) and private Storage object belonging to your Supabase account.'
                : 'Clears all in-memory guest state and removes any leftover pre-migration HireFlow browser storage keys.'}
            </p>
          </div>

          <button
            type="button"
            disabled={isDeletingAccountData}
            onClick={() => setIsClearModalOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded border border-rose-600 bg-rose-600/20 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-200 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeletingAccountData ? 'Deleting...' : 'Erase All Data'}</span>
          </button>
        </section>
      </main>

      <ConfirmDialog
        isOpen={isClearModalOpen}
        onCancel={() => setIsClearModalOpen(false)}
        onConfirm={() => { void handleEraseData(); }}
        title={isSignedIn ? 'Permanently Delete Cloud Account Data?' : 'Clear Session & Browser Keys?'}
        message={
          isSignedIn
            ? 'This permanently removes all resumes, audits, saved JDs, watchlist targets, and private files stored in Supabase Postgres & Storage for your account.'
            : 'This clears transient session memory and removes any leftover legacy browser storage keys.'
        }
        confirmText="Erase Everything"
        isDestructive={true}
        requiredConfirmationWord="CLEAR"
      />
    </div>
  );
}
